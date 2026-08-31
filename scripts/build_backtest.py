#!/usr/bin/env python3
"""
SPACEZ TERMINAL — did the radar ever work?

Rebuilds every Turning Point Radar gauge from as much history as Yahoo will
give (most reach back 15-25 years), finds every episode where the gauge
crossed into its red zone, and measures what the market actually did over the
following 1 / 3 / 6 / 12 months — against the base rate over the same sample,
so "the market usually goes up" cannot masquerade as a working signal.

Writes data/backtest.json:
  · per-gauge episode stats and a grade
  · a weekly series per gauge plus the benchmark, so the page can re-run the
    whole test in the browser at a threshold and horizon the user picks

Nothing here is tuned to make the gauges look good. A gauge that shows no
edge is graded F and the page says so.
"""

import json
import math
import os
import sys
import time
from datetime import datetime, timezone

import yfinance as yf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "backtest.json")

BENCH = "SPY"
HORIZONS = [21, 63, 126, 252]          # ~1m, 3m, 6m, 12m in sessions
COOLDOWN = 42                          # sessions before a new episode counts

# universe used for the breadth gauge — long-listed US names only, so the
# series does not lurch when a young ticker joins
BREADTH_UNIVERSE = [
    "JPM", "BAC", "WFC", "C", "GS", "XOM", "CVX", "MMM", "GM", "F", "CVS",
    "MET", "NVDA", "TSLA", "AMZN", "AMD", "NFLX", "MSFT", "GOOGL", "AVGO",
    "TSM", "CRM", "ORCL", "T", "VZ", "O", "DUK", "MO", "IBM", "SO", "KMI",
    "PM", "ENB", "JNJ", "PG", "KO", "PEP", "WMT", "COST", "UNH", "PFE", "CL",
    "MCD", "MDLZ", "KMB", "ABT", "SYY", "AAPL",
]

GAUGES = [
    {"k": "breadth_200", "kind": "breadth", "dir": "up", "ok": 60, "warn": 45,
     "en": "Market breadth", "th": "ความกว้างของตลาด"},
    {"k": "credit_1m", "kind": "spread", "a": "HYG", "b": "LQD", "win": 21,
     "dir": "up", "ok": 0, "warn": -1.5,
     "en": "Credit market", "th": "ตลาดหุ้นกู้"},
    {"k": "cyclical_vs_defensive_1m", "kind": "spread", "a": "XLY", "b": "XLP",
     "win": 21, "dir": "up", "ok": 0, "warn": -3,
     "en": "Risk appetite", "th": "ความอยากเสี่ยง"},
    {"k": "semis_vs_market_1m", "kind": "spread", "a": "SMH", "b": "SPY",
     "win": 21, "dir": "up", "ok": 0, "warn": -4,
     "en": "Leadership (semis)", "th": "ผู้นำตลาด (เซมิคอนดักเตอร์)"},
    {"k": "smallcap_vs_market_1m", "kind": "spread", "a": "IWM", "b": "SPY",
     "win": 21, "dir": "up", "ok": -1, "warn": -5,
     "en": "Small caps", "th": "หุ้นเล็ก"},
    {"k": "stocks_vs_bonds_1m", "kind": "spread", "a": "SPY", "b": "TLT",
     "win": 21, "dir": "up", "ok": 0, "warn": -4,
     "en": "Stocks vs bonds", "th": "หุ้น เทียบ พันธบัตร"},
    {"k": "curve_10y_3m", "kind": "diff", "a": "^TNX", "b": "^IRX",
     "dir": "up", "ok": 0.5, "warn": 0,
     "en": "Yield curve (10y - 3m)", "th": "เส้นอัตราผลตอบแทน (10 ปี - 3 เดือน)"},
    {"k": "vix", "kind": "level", "a": "^VIX", "dir": "down", "ok": 18, "warn": 25,
     "en": "Volatility (VIX)", "th": "ความผันผวน (VIX)"},
    {"k": "dbc_3m", "kind": "ret", "a": "DBC", "win": 63, "dir": "down",
     "ok": 4, "warn": 10,
     "en": "Commodity pressure", "th": "แรงกดดันสินค้าโภคภัณฑ์"},
    {"k": "uup_3m", "kind": "ret", "a": "UUP", "win": 63, "dir": "down",
     "ok": 2, "warn": 5,
     "en": "US dollar", "th": "ดอลลาร์สหรัฐฯ"},
    {"k": "thb_1m", "kind": "fx", "a": "THB=X", "win": 21, "dir": "up",
     "ok": -1, "warn": -3,
     "en": "Thai baht", "th": "ค่าเงินบาท"},
]


# ---------------------------------------------------------------- data ----

_cache = {}


def closes_of(sym, period="max"):
    """{date_string: close} for one symbol, cached."""
    if sym in _cache:
        return _cache[sym]
    out = {}
    for attempt in (1, 2):
        try:
            h = yf.Ticker(sym).history(period=period, auto_adjust=False)
            if h is not None and not h.empty:
                for ts, row in h["Close"].items():
                    v = float(row)
                    if v == v:
                        out[ts.strftime("%Y-%m-%d")] = v
            break
        except Exception as e:
            print("  history failed %s (try %d): %s" % (sym, attempt, e),
                  file=sys.stderr)
            time.sleep(2)
    _cache[sym] = out
    print("  %-10s %5d sessions %s" % (sym, len(out),
          (min(out) + " → " + max(out)) if out else ""))
    return out


def pct_change(series, dates, win):
    """% change over `win` sessions, aligned to `dates`."""
    out = {}
    keys = [d for d in dates if d in series]
    for i, d in enumerate(keys):
        if i < win:
            continue
        a, b = series[keys[i - win]], series[d]
        if a:
            out[d] = (b - a) / a * 100.0
    return out


# ------------------------------------------------------------- gauges ----

def build_series(spec, grid):
    """One gauge as {date: value} over the common date grid."""
    kind = spec["kind"]

    if kind == "breadth":
        cols = {}
        for sym in BREADTH_UNIVERSE:
            c = closes_of(sym)
            if len(c) > 400:
                cols[sym] = c
            time.sleep(0.1)
        return breadth_series(cols, grid)

    if kind == "spread":
        a, b = closes_of(spec["a"]), closes_of(spec["b"])
        ra = pct_change(a, grid, spec["win"])
        rb = pct_change(b, grid, spec["win"])
        return {d: ra[d] - rb[d] for d in grid if d in ra and d in rb}

    if kind in ("ret", "fx"):
        a = closes_of(spec["a"])
        r = pct_change(a, grid, spec["win"])
        if kind == "fx":
            # THB=X is USD->THB: flip so the number reads as the baht's move
            return {d: -v for d, v in r.items()}
        return r

    if kind == "level":
        a = closes_of(spec["a"])
        return {d: a[d] for d in grid if d in a}

    if kind == "diff":
        a, b = closes_of(spec["a"]), closes_of(spec["b"])
        return {d: a[d] - b[d] for d in grid if d in a and d in b}

    return {}


def breadth_series(cols, grid):
    """% of the universe above its own 200-session average, per date."""
    rolling = {}
    for sym, c in cols.items():
        dates = sorted(c.keys())
        vals = [c[d] for d in dates]
        run = 0.0
        ma = {}
        for i, v in enumerate(vals):
            run += v
            if i >= 200:
                run -= vals[i - 200]
            if i >= 199:
                ma[dates[i]] = (run / 200.0, v)
        rolling[sym] = ma

    out = {}
    for d in grid:
        above = total = 0
        for sym, ma in rolling.items():
            hit = ma.get(d)
            if hit:
                total += 1
                if hit[1] > hit[0]:
                    above += 1
        if total >= 20:
            out[d] = above / float(total) * 100.0
    return out


def state_of(spec, v):
    if v is None:
        return "na"
    if spec["dir"] == "down":
        return "ok" if v <= spec["ok"] else ("warn" if v <= spec["warn"] else "alert")
    return "ok" if v >= spec["ok"] else ("warn" if v >= spec["warn"] else "alert")


# ---------------------------------------------------------- evaluation ----

def median(xs):
    if not xs:
        return None
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2.0


def evaluate(spec, series, grid, bench):
    """Episodes where the gauge went red, and what happened next."""
    vals = [(d, series.get(d)) for d in grid]
    have = [(d, v) for d, v in vals if v is not None]
    if len(have) < 500:
        return None

    dates = [d for d, _ in have]
    bidx = {d: i for i, d in enumerate(grid)}

    # forward returns of the benchmark from every date in the sample
    fwd = {h: {} for h in HORIZONS}
    for d in dates:
        i = bidx.get(d)
        if i is None or d not in bench:
            continue
        p0 = bench[d]
        for h in HORIZONS:
            j = i + h
            if j < len(grid):
                d2 = grid[j]
                if d2 in bench and p0:
                    fwd[h][d] = (bench[d2] - p0) / p0 * 100.0

    base = {h: median(list(fwd[h].values())) for h in HORIZONS}

    # episode = first red day after being out of red for the cooldown
    episodes = []
    last = -10 ** 9
    prev_state = None
    for k, (d, v) in enumerate(have):
        st = state_of(spec, v)
        if st == "alert" and prev_state != "alert":
            i = bidx.get(d, 0)
            if i - last >= COOLDOWN:
                episodes.append(d)
                last = i
        prev_state = st

    if not episodes:
        return {"k": spec["k"], "en": spec["en"], "th": spec["th"],
                "episodes": 0, "first": dates[0], "last": dates[-1],
                "base": {str(h): round(base[h], 2) if base[h] is not None else None
                         for h in HORIZONS},
                "grade": "n/a", "sample_days": len(dates)}

    stats = {}
    for h in HORIZONS:
        rows = [(d, fwd[h][d]) for d in episodes if d in fwd[h]]
        if not rows:
            continue
        rets = [r for _, r in rows]
        b = base[h]
        worst = max(rows, key=lambda x: x[1])       # biggest false alarm
        best = min(rows, key=lambda x: x[1])        # biggest correct call
        stats[str(h)] = {
            "n": len(rows),
            "median": round(median(rets), 2),
            "base": round(b, 2) if b is not None else None,
            "edge": round(median(rets) - b, 2) if b is not None else None,
            "neg_rate": round(sum(1 for r in rets if r < 0) / float(len(rets)) * 100.0, 1),
            "beat_base": round(sum(1 for r in rets if b is not None and r < b)
                               / float(len(rets)) * 100.0, 1),
            "worst_miss": {"d": worst[0], "r": round(worst[1], 2)},
            "best_call": {"d": best[0], "r": round(best[1], 2)},
        }

    # grade on the 3-month horizon, with consistency as a tie-breaker
    core = stats.get("63") or {}
    edge = core.get("edge")
    n = core.get("n", 0)
    signs = [v.get("edge") for v in stats.values() if v.get("edge") is not None]
    consistent = sum(1 for e in signs if e < 0)

    if edge is None or n < 3:
        grade = "n/a"
    elif edge <= -4 and n >= 5 and consistent >= 3:
        grade = "A"
    elif edge <= -2 and n >= 4 and consistent >= 3:
        grade = "B"
    elif edge <= -0.75 and consistent >= 2:
        grade = "C"
    elif edge < 0:
        grade = "D"
    else:
        grade = "F"

    return {
        "k": spec["k"], "en": spec["en"], "th": spec["th"],
        "episodes": len(episodes),
        "first": dates[0], "last": dates[-1], "sample_days": len(dates),
        "dates": episodes[-14:],
        "h": stats,
        "base": {str(h): round(base[h], 2) if base[h] is not None else None
                 for h in HORIZONS},
        "grade": grade,
        "thresholds": {"dir": spec["dir"], "ok": spec["ok"], "warn": spec["warn"]},
    }


def weekly(series, grid):
    """Downsample to one point per week so the browser can re-run the test."""
    out = []
    seen = set()
    for d in grid:
        v = series.get(d)
        if v is None:
            continue
        y, w, _ = datetime.strptime(d, "%Y-%m-%d").isocalendar()
        key = (y, w)
        if key in seen:
            continue
        seen.add(key)
        out.append((d, round(v, 3)))
    return out


# sector ETFs, kept as weekly closes so the page can ask "in the windows
# that looked like today, which groups actually led?"
SECTOR_ETFS = [
    ("XLK",  "Technology",        "เทคโนโลยี"),
    ("XLF",  "Financials",        "การเงิน"),
    ("XLE",  "Energy",            "พลังงาน"),
    ("XLV",  "Health care",       "สุขภาพ"),
    ("XLY",  "Consumer cyclical", "สินค้าฟุ่มเฟือย"),
    ("XLP",  "Consumer staples",  "สินค้าจำเป็น"),
    ("XLI",  "Industrials",       "อุตสาหกรรม"),
    ("XLU",  "Utilities",         "สาธารณูปโภค"),
    ("XLB",  "Materials",         "วัสดุ"),
    ("SMH",  "Semiconductors",    "เซมิคอนดักเตอร์"),
    ("IWM",  "US small cap",      "หุ้นเล็กสหรัฐฯ"),
    ("TLT",  "Long Treasuries",   "พันธบัตรยาว"),
    ("GLD",  "Gold",              "ทองคำ"),
    ("EEM",  "Emerging markets",  "ตลาดเกิดใหม่"),
]


def fetch_sectors(grid):
    out = {}
    for sym, en, th in SECTOR_ETFS:
        print("[sector] %s" % sym)
        c = closes_of(sym)
        if len(c) < 300:
            continue
        out[sym] = {"en": en, "th": th, "s": weekly(c, grid)}
        time.sleep(0.15)
    return out


def main():
    print("benchmark…")
    bench = closes_of(BENCH)
    if len(bench) < 1000:
        print("benchmark history too short", file=sys.stderr)
        return 1
    grid = sorted(bench.keys())

    results, series_out = [], {}
    for spec in GAUGES:
        print("[gauge] %s" % spec["k"])
        try:
            s = build_series(spec, grid)
        except Exception as e:
            print("  build failed: %s" % e, file=sys.stderr)
            continue
        if not s:
            print("  no series", file=sys.stderr)
            continue
        res = evaluate(spec, s, grid, bench)
        if res:
            results.append(res)
            series_out[spec["k"]] = weekly(s, grid)
        time.sleep(0.2)

    # weekly benchmark, on the same grid, for the in-browser re-run
    bench_weekly = weekly(bench, grid)

    try:
        sectors = fetch_sectors(grid)
    except Exception as e:
        print("sectors failed: %s" % e, file=sys.stderr)
        sectors = {}

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "benchmark": BENCH,
        "horizons": HORIZONS,
        "cooldown_sessions": COOLDOWN,
        "method": ("Every day the gauge crosses into its red zone (after at "
                   "least %d sessions out of it) counts as one episode. The "
                   "benchmark's forward return from that day is compared with "
                   "the median forward return across every day in the same "
                   "sample, so a rising market cannot pass as a working signal."
                   % COOLDOWN),
        "gauges": results,
        "series": series_out,
        "bench_series": bench_weekly,
        "sectors": sectors,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"),
                  sort_keys=True)
    size = os.path.getsize(OUT) / 1024.0
    print("wrote %s — %d gauges, %d sector series, %.0f KB"
          % (OUT, len(results), len(sectors), size))
    for r in results:
        core = (r.get("h") or {}).get("63") or {}
        print("  %-26s grade %-3s episodes %-3s edge %s"
              % (r["k"], r["grade"], r["episodes"], core.get("edge")))
    return 0 if results else 1


if __name__ == "__main__":
    sys.exit(main())
