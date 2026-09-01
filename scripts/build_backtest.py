#!/usr/bin/env python3
"""
SPACEZ TERMINAL — did the radar ever work?

Rebuilds every Turning Point Radar gauge from as much history as Yahoo will
give (most reach back 15-25 years), finds every episode where the gauge
crossed into its red zone, and measures what the market actually did over the
following 1 / 3 / 6 / 12 months — against the base rate over the same sample,
so "the market usually goes up" cannot masquerade as a working signal.

Two things this pass adds over the first one:

  · COMBINATIONS. Nobody trades off one gauge. Every gauge is also tested as
    part of a group: "N gauges red at the same time" for N = 2..6, plus five
    named clusters that describe one idea each (credit + risk appetite +
    stocks-vs-bonds is the risk-off cluster, and so on). Testing many
    combinations invites luck, so every result also carries a permutation
    p-value: the share of random date-draws of the same size that would have
    produced a median at least this bad. A combo with a big edge and p = 0.4
    is noise wearing a costume.

  · TWO BENCHMARKS. Every signal is scored against the US market (SPY) and
    against the Thai market (^SET.BK). The baht gauge is graded on SET, where
    it belongs; the rest are graded on SPY with the SET result shown beside
    it, because a US gauge that also moves SET is telling you something and
    one that does not is telling you something else.

Writes data/backtest.json:
  · per-gauge and per-combo episode stats, grades and p-values, on both markets
  · a weekly series per gauge plus both benchmarks, so the page can re-run the
    whole test in the browser at a threshold and horizon the reader picks

Nothing here is tuned to make the gauges look good. A gauge that shows no
edge is graded F and the page says so.
"""

import bisect
import json
import os
import random
import sys
import time
from datetime import datetime, timezone

import yfinance as yf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "backtest.json")

BENCH = "SPY"                          # the grid every gauge is sampled on
BENCH_TH = "SET"                       # canonical id; the actual source is
                                       # whichever of THAI_SOURCES answers
HORIZONS = [21, 63, 126, 252]          # ~1m, 3m, 6m, 12m in sessions
COOLDOWN = 42                          # sessions before a new episode counts
TRIALS = 4000                          # permutation draws per p-value
MIN_GAUGES_FOR_COUNT = 8               # a day needs this many live gauges to
                                       # be eligible for the "N red" test

BENCH_LABEL = {
    "SPY": {"en": "US market (SPY)", "th": "ตลาดสหรัฐฯ (SPY)"},
    "SET": {"en": "Thai market (SET)", "th": "ตลาดไทย (SET)"},
}

# Yahoo does not serve ^SET.BK — it returns nothing, quietly, which is how it
# went missing from the collector's macro block too. So the Thai benchmark is
# tried from several places and the first one that answers with a real history
# wins. Which one it was is written into the payload, because "Thai market"
# meaning the SET index in baht and "Thai market" meaning a US-listed ETF in
# dollars are not the same claim.
THAI_SOURCES = [
    ("^SET.BK", "yahoo", {"en": "Thai market (SET)", "th": "ตลาดไทย (SET)"}),
    ("^set", "stooq", {"en": "Thai market (SET)", "th": "ตลาดไทย (SET)"}),
    ("^seti", "stooq", {"en": "Thai market (SET)", "th": "ตลาดไทย (SET)"}),
    ("THD", "yahoo", {"en": "Thai equities (THD ETF, priced in USD)",
                      "th": "หุ้นไทย (กองทุน THD ราคาสกุลดอลลาร์)"}),
]

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
     "ok": -1, "warn": -3, "bench": BENCH_TH,
     "en": "Thai baht", "th": "ค่าเงินบาท"},
]

# Named clusters. Each one is a single idea, not a search over pairs: the
# members were chosen because they describe the same thing through different
# instruments. A cluster fires when EVERY member is amber-or-red and at least
# one is outright red — the whole theme deteriorating, not one loud member.
CLUSTERS = [
    {"k": "cl_riskoff",
     "members": ["credit_1m", "cyclical_vs_defensive_1m", "stocks_vs_bonds_1m"],
     "en": "Risk-off cluster",
     "th": "กลุ่มหนีความเสี่ยง",
     "en_d": "Credit, risk appetite and stocks-versus-bonds all sagging together — money leaving risk through three different doors at once.",
     "th_d": "ตลาดหุ้นกู้ ความอยากเสี่ยง และหุ้นเทียบพันธบัตร อ่อนพร้อมกันทั้งสามตัว — เงินออกจากสินทรัพย์เสี่ยงพร้อมกันสามทาง"},
    {"k": "cl_leader",
     "members": ["breadth_200", "semis_vs_market_1m", "smallcap_vs_market_1m"],
     "en": "Leadership breaking",
     "th": "ผู้นำตลาดเริ่มพัง",
     "en_d": "Breadth thinning while both the aggressive groups — semis and small caps — lag the index. The NVDA-shaped case: the index can still be at a high while the engine underneath stalls.",
     "th_d": "ความกว้างของตลาดแคบลง พร้อมกับสองกลุ่มที่ดุที่สุด (เซมิฯ กับหุ้นเล็ก) แพ้ดัชนี — เคสแบบ NVDA คือดัชนียังทำจุดสูงสุดได้ ทั้งที่เครื่องยนต์ข้างล่างเริ่มดับ"},
    {"k": "cl_macro",
     "members": ["curve_10y_3m", "uup_3m", "dbc_3m"],
     "en": "Macro squeeze",
     "th": "แรงบีบเชิงมหภาค",
     "en_d": "Flat or inverted curve, a rising dollar and rising commodities at the same time — the funding cost of everything going up while the input cost of everything goes up too.",
     "th_d": "เส้นผลตอบแทนแบนหรือกลับหัว ดอลลาร์แข็ง และสินค้าโภคภัณฑ์แพงขึ้นพร้อมกัน — ต้นทุนเงินขึ้น ต้นทุนของก็ขึ้น"},
    {"k": "cl_fear",
     "members": ["vix", "credit_1m"],
     "en": "Fear priced in credit",
     "th": "ความกลัวที่ลามถึงหุ้นกู้",
     "en_d": "Volatility elevated AND the credit market confirming it. Volatility alone is often just noise; volatility that the bond market agrees with is not.",
     "th_d": "ความผันผวนสูง และตลาดหุ้นกู้ยืนยันด้วย — ความผันผวนเดี่ยวๆ มักเป็นแค่เสียงรบกวน แต่ถ้าตลาดตราสารหนี้เห็นด้วย มันไม่ใช่"},
    {"k": "cl_thin",
     "members": ["breadth_200", "credit_1m"],
     "en": "Thin market, tight credit",
     "th": "ตลาดแคบ เงินตึง",
     "en_d": "Fewer and fewer stocks holding their trend while lenders start asking for more. The two classic pre-turn conditions, together.",
     "th_d": "หุ้นที่ยังยืนเทรนด์ได้เหลือน้อยลงเรื่อยๆ ขณะที่ฝั่งปล่อยกู้เริ่มขอมากขึ้น — สองเงื่อนไขคลาสสิกก่อนตลาดเปลี่ยนทิศ มาพร้อมกัน"},
]

COUNT_LEVELS = [2, 3, 4, 5, 6]


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


def stooq_closes(sym):
    """Daily closes from Stooq's free CSV endpoint — no key, no account.

    An unknown symbol comes back as a one-line "No data" body rather than an
    HTTP error, which the reader below turns into an empty dict.
    """
    import csv
    import io
    import urllib.parse
    import urllib.request

    url = "https://stooq.com/q/d/l/?s=%s&i=d" % urllib.parse.quote(sym, safe="")
    req = urllib.request.Request(url, headers={"User-Agent": "spacez-terminal/1.0"})
    txt = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
    out = {}
    for row in csv.DictReader(io.StringIO(txt)):
        d = (row.get("Date") or "").strip()
        try:
            v = float(row.get("Close"))
        except (TypeError, ValueError):
            continue
        if len(d) == 10 and v > 0:
            out[d] = v
    return out


def fetch_thai_bench():
    """The first Thai benchmark that actually answers. (symbol, source, label, closes)"""
    for sym, src, label in THAI_SOURCES:
        try:
            closes = stooq_closes(sym) if src == "stooq" else closes_of(sym)
        except Exception as e:
            print("  thai %-10s via %-6s failed: %s" % (sym, src, str(e)[:90]),
                  file=sys.stderr)
            continue
        n = len(closes)
        print("  thai %-10s via %-6s %6d sessions %s"
              % (sym, src, n, (min(closes) + " → " + max(closes)) if n else ""))
        if n > 1000:
            return sym, src, label, closes
    return None, None, None, {}


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


# --------------------------------------------------------- benchmarks ----

class Bench(object):
    """Forward returns on one market's own trading calendar."""

    def __init__(self, sym, closes):
        self.sym = sym
        self.closes = closes
        self.dates = sorted(closes.keys())

    def ok(self):
        return len(self.dates) > 1000

    def pos(self, d):
        """Index of the first session on or after d, or None."""
        i = bisect.bisect_left(self.dates, d)
        return i if i < len(self.dates) else None

    def fwd(self, d, h):
        i = self.pos(d)
        if i is None or i + h >= len(self.dates):
            return None
        a = self.closes[self.dates[i]]
        b = self.closes[self.dates[i + h]]
        return ((b - a) / a * 100.0) if a else None

    def pool(self, first, last, h):
        """Every forward return inside the sample window — the base rate."""
        out = []
        lo = bisect.bisect_left(self.dates, first)
        hi = bisect.bisect_right(self.dates, last)
        for i in range(lo, hi):
            if i + h >= len(self.dates):
                break
            a = self.closes[self.dates[i]]
            b = self.closes[self.dates[i + h]]
            if a:
                out.append((b - a) / a * 100.0)
        return out


# ---------------------------------------------------------- evaluation ----

def median(xs):
    if not xs:
        return None
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2.0


def p_value(med, n, pool):
    """How often would n random dates from the same window do this badly?

    Low p = the episodes were not an ordinary draw. This is the guard against
    testing many combinations and reporting whichever one looked best.
    """
    if med is None or not pool or n < 2 or n > len(pool):
        return None
    hits = 0
    for _ in range(TRIALS):
        if median(random.sample(pool, n)) <= med:
            hits += 1
    return round(hits / float(TRIALS), 3)


def episodes_from(flags, dates, cooldown):
    """First day of each run of True, with a cooldown between episodes."""
    eps = []
    last = -10 ** 9
    prev = False
    for i, d in enumerate(dates):
        f = bool(flags[i])
        if f and not prev and (i - last) >= cooldown:
            eps.append(d)
            last = i
        prev = f
    return eps


def grade_of(stats, min_n=3):
    """Grade on the 3-month horizon; consistency and evidence as gates.

    The evidence gate uses the multiple-testing-corrected p-value when one has
    been attached. Around forty signals are tested here; at p = 0.05 you would
    expect two of them to look convincing on pure chance, so an uncorrected
    p-value cannot be allowed to hand out an A on its own.
    """
    core = stats.get("63") or {}
    edge = core.get("edge")
    n = core.get("n", 0)
    p = core.get("p_adj", core.get("p"))
    signs = [v.get("edge") for v in stats.values() if v.get("edge") is not None]
    consistent = sum(1 for e in signs if e < 0)

    if edge is None or n < min_n:
        return "n/a"
    if edge <= -4 and n >= 5 and consistent >= 3 and (p is not None and p <= 0.20):
        return "A"
    if edge <= -2 and n >= 4 and consistent >= 3 and (p is not None and p <= 0.50):
        return "B"
    if edge <= -0.75 and consistent >= 2:
        return "C"
    if edge < 0:
        return "D"
    return "F"


def correct(rows):
    """Bonferroni across every (signal, market, horizon-63) test, then re-grade."""
    blocks = []
    for r in rows:
        blocks.append(r)
        blocks.extend(r.get("alt") or [])
    tests = sum(1 for b in blocks if (b.get("h") or {}).get("63"))
    if tests < 1:
        return 0
    for b in blocks:
        h = b.get("h") or {}
        for v in h.values():
            if v.get("p") is not None:
                v["p_adj"] = min(1.0, round(v["p"] * tests, 3))
        if h:
            b["grade"] = grade_of(h)
    for r in rows:
        r["tests"] = tests
    return tests


def measure(episodes, first, last, bench):
    """Per-horizon stats for one set of episode dates on one benchmark."""
    stats = {}
    for h in HORIZONS:
        rows = []
        for d in episodes:
            r = bench.fwd(d, h)
            if r is not None:
                rows.append((d, r))
        if len(rows) < 2:
            continue
        rets = [r for _, r in rows]
        pool = bench.pool(first, last, h)
        b = median(pool)
        med = median(rets)
        worst = max(rows, key=lambda x: x[1])       # biggest false alarm
        best = min(rows, key=lambda x: x[1])        # biggest correct call
        stats[str(h)] = {
            "n": len(rows),
            "median": round(med, 2),
            "base": round(b, 2) if b is not None else None,
            "edge": round(med - b, 2) if b is not None else None,
            "neg_rate": round(sum(1 for r in rets if r < 0) / float(len(rets)) * 100.0, 1),
            "beat_base": round(sum(1 for r in rets if b is not None and r < b)
                               / float(len(rets)) * 100.0, 1),
            "p": p_value(med, len(rets), pool),
            "worst_miss": {"d": worst[0], "r": round(worst[1], 2)},
            "best_call": {"d": best[0], "r": round(best[1], 2)},
        }
    return stats


def score_on(episodes, first, last, benches, primary):
    """Stats on the primary benchmark plus every other one, as a dict."""
    out = {}
    for sym, b in benches.items():
        if not b.ok():
            continue
        st = measure(episodes, first, last, b)
        if st:
            out[sym] = {"bench": sym, "h": st, "grade": grade_of(st),
                        "label": BENCH_LABEL.get(sym, {"en": sym, "th": sym})}
    return out


def pack(base_fields, episodes, first, last, benches, primary, sample_days,
         on_days=None):
    scored = score_on(episodes, first, last, benches, primary)
    prim = scored.get(primary) or {}
    others = {k: v for k, v in scored.items() if k != primary}
    row = dict(base_fields)
    row.update({
        "episodes": len(episodes),
        # share of the sample the condition was actually switched on. A
        # "warning" that is on half the time is a description of the weather,
        # not a warning, and this is the number that gives that away.
        "on_rate": (round(on_days / float(sample_days) * 100.0, 1)
                    if on_days is not None and sample_days else None),
        "first": first, "last": last, "sample_days": sample_days,
        "dates": episodes[-14:],
        "bench": primary,
        "h": prim.get("h", {}),
        "grade": prim.get("grade", "n/a"),
        "base": {k: (v.get("base") if v else None)
                 for k, v in (prim.get("h") or {}).items()},
        "alt": list(others.values()),
    })
    return row


# ----------------------------------------------------------- packaging ----

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
    random.seed(7)

    print("benchmarks…")
    spy = Bench(BENCH, closes_of(BENCH))
    if not spy.ok():
        print("benchmark history too short", file=sys.stderr)
        return 1
    grid = spy.dates
    benches = {BENCH: spy}

    th_sym, th_src, th_label, th_closes = fetch_thai_bench()
    st = Bench(BENCH_TH, th_closes)
    if st.ok():
        benches[BENCH_TH] = st
        BENCH_LABEL[BENCH_TH] = dict(th_label)
        print("Thai benchmark: %s via %s (%d sessions)"
              % (th_sym, th_src, len(st.dates)))
    else:
        print("no Thai benchmark answered — grading on the US market only",
              file=sys.stderr)

    # ---- build every gauge series and its daily state -------------------
    built = []            # (spec, series, states aligned to grid)
    series_out = {}
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
        if len([1 for d in grid if d in s]) < 500:
            print("  sample too short", file=sys.stderr)
            continue
        states = [state_of(spec, s.get(d)) for d in grid]
        built.append((spec, s, states))
        series_out[spec["k"]] = weekly(s, grid)
        time.sleep(0.2)

    if not built:
        print("no gauges built", file=sys.stderr)
        return 1

    # ---- single gauges --------------------------------------------------
    results = []
    for spec, s, states in built:
        have = [d for d in grid if s.get(d) is not None]
        first, last = have[0], have[-1]
        flags = [st == "alert" for st in states]
        eps = episodes_from(flags, grid, COOLDOWN)
        primary = spec.get("bench", BENCH)
        if primary not in benches:
            primary = BENCH
        base_fields = {"k": spec["k"], "en": spec["en"], "th": spec["th"],
                       "thresholds": {"dir": spec["dir"], "ok": spec["ok"],
                                      "warn": spec["warn"]}}
        results.append(pack(base_fields, eps, first, last, benches, primary,
                            len(have), sum(1 for f in flags if f)))

    # ---- combinations ---------------------------------------------------
    keys = [spec["k"] for spec, _, _ in built]
    state_by_key = {spec["k"]: states for spec, _, states in built}

    alert_count = []
    avail_count = []
    for i in range(len(grid)):
        a = c = 0
        for k in keys:
            stt = state_by_key[k][i]
            if stt == "na":
                continue
            a += 1
            if stt == "alert":
                c += 1
        avail_count.append(a)
        alert_count.append(c)

    eligible = [i for i in range(len(grid)) if avail_count[i] >= MIN_GAUGES_FOR_COUNT]
    combos = []
    if eligible:
        cfirst, clast = grid[eligible[0]], grid[eligible[-1]]
        elig_set = set(eligible)
        for n in COUNT_LEVELS:
            flags = [(i in elig_set and alert_count[i] >= n) for i in range(len(grid))]
            eps = episodes_from(flags, grid, COOLDOWN)
            if len(eps) < 2:
                continue
            base_fields = {
                "k": "any%d" % n, "kind": "count", "need": n,
                "members": keys,
                "en": "%d gauges red at once" % n,
                "th": "มาตรวัดแดงพร้อมกัน %d ตัว" % n,
                "en_d": ("Any %d of the %d gauges in the red zone on the same day. "
                         "No opinion about which ones — just how much of the board "
                         "is lit." % (n, len(keys))),
                "th_d": ("มาตรวัดตัวไหนก็ได้ %d ตัวจาก %d ตัว อยู่ในโซนแดงวันเดียวกัน "
                         "ไม่สนว่าตัวไหน สนแค่ว่ากระดานติดไฟไปเท่าไหร่"
                         % (n, len(keys))),
            }
            combos.append(pack(base_fields, eps, cfirst, clast, benches, BENCH,
                               len(eligible), sum(1 for f in flags if f)))

    # named clusters: every member amber-or-red, at least one red
    for cl in CLUSTERS:
        mem = [m for m in cl["members"] if m in state_by_key]
        if len(mem) < len(cl["members"]):
            print("[combo] %s skipped — missing member" % cl["k"], file=sys.stderr)
            continue
        # a day only counts if every member actually has data
        flags = []
        live = []
        for i in range(len(grid)):
            sts = [state_by_key[m][i] for m in mem]
            if any(x == "na" for x in sts):
                flags.append(False)
                continue
            live.append(i)
            hot = all(x in ("warn", "alert") for x in sts) and any(x == "alert" for x in sts)
            flags.append(hot)
        if not live:
            continue
        cfirst, clast = grid[live[0]], grid[live[-1]]
        eps = episodes_from(flags, grid, COOLDOWN)
        if len(eps) < 2:
            print("[combo] %s only %d episodes" % (cl["k"], len(eps)), file=sys.stderr)
        base_fields = {"k": cl["k"], "kind": "cluster", "members": mem,
                       "en": cl["en"], "th": cl["th"],
                       "en_d": cl["en_d"], "th_d": cl["th_d"]}
        combos.append(pack(base_fields, eps, cfirst, clast, benches, BENCH,
                           len(live), sum(1 for f in flags if f)))

    # ---- correct for having tested this many things ---------------------
    n_tests = correct(results + combos)
    print("multiple-testing correction over %d tests" % n_tests)

    # ---- packaging ------------------------------------------------------
    bench_weekly = weekly(spy.closes, grid)
    bench_th_weekly = weekly(st.closes, st.dates) if st.ok() else []

    try:
        sectors = fetch_sectors(grid)
    except Exception as e:
        print("sectors failed: %s" % e, file=sys.stderr)
        sectors = {}

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "benchmark": BENCH,
        "benchmarks": dict(
            (sym, dict(BENCH_LABEL.get(sym, {"en": sym, "th": sym}),
                       symbol=(th_sym if sym == BENCH_TH else sym),
                       source=(th_src if sym == BENCH_TH else "yahoo")))
            for sym in benches),
        "horizons": HORIZONS,
        "cooldown_sessions": COOLDOWN,
        "trials": TRIALS,
        "n_tests": n_tests,
        "method": ("Every day a signal crosses into its red zone (after at "
                   "least %d sessions out of it) counts as one episode. The "
                   "benchmark's forward return from that day is compared with "
                   "the median forward return across every day in the same "
                   "sample, so a rising market cannot pass as a working signal. "
                   "Combinations are tested the same way, and each result "
                   "carries a permutation p-value from %d random draws of the "
                   "same number of dates — the share of random draws that "
                   "would have looked at least this bad. Testing many "
                   "combinations guarantees some look good by luck, so that "
                   "p-value is then multiplied by the number of tests run "
                   "before it is allowed to earn a grade."
                   % (COOLDOWN, TRIALS)),
        "gauges": results,
        "combos": combos,
        "series": series_out,
        "bench_series": bench_weekly,
        "bench_series_th": bench_th_weekly,
        "sectors": sectors,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"),
                  sort_keys=True)
    size = os.path.getsize(OUT) / 1024.0
    print("wrote %s — %d gauges, %d combos, %d sector series, %.0f KB"
          % (OUT, len(results), len(combos), len(sectors), size))
    for r in results + combos:
        core = (r.get("h") or {}).get("63") or {}
        print("  %-26s grade %-3s ep %-3s on %-6s edge %-7s p %-6s p_adj %s"
              % (r["k"], r["grade"], r["episodes"], r.get("on_rate"),
                 core.get("edge"), core.get("p"), core.get("p_adj")))
    return 0 if results else 1


if __name__ == "__main__":
    sys.exit(main())
