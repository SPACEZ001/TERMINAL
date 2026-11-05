"""Long walk-forward test of the Market Brain stock-picking rules (2026-11-05).

The board's own 1-year test runs in the browser on ~2 years of prices and uses
today's company figures, so it flatters the rules. This job answers the honest
questions with 10+ years of weekly prices, using ONLY what was known each week:

  * re-pick every 4 weeks: names above their 40-week average, ranked by
    risk-adjusted momentum (12-month move skipping the last month / volatility),
    at most 2 per sector, 12 names, equal weight
  * trading costs 0.2% per side on every name that changes
  * benchmarks: the market (SPY / THD) AND an equal-weight basket of the whole
    list. The list is today's survivors (Yahoo has no delisted tickers), which
    flatters any test; comparing against the same survivors cancels that out,
    so "beat the whole list" is the real skill number.
  * year-by-year, worst drop, and the bad years (2018, 2020, 2022) on their own
  * stop-loss study: a trailing stop k x monthly volatility under the highest
    close since buying, for several k, per market. The best k (by return per
    unit of worst drop, and only if it beats no stop) is what the page uses to
    suggest a stop price for each stock.

Writes data/brain_wf.json. Run from .github/workflows/brain-data.yml.
"""
import json
import math
import os
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "brain_wf.json")
START = "2013-01-01"
N_PICK, STEP, FEE = 12, 4, 0.002
KS = [None, 1.5, 2.0, 2.5, 3.0, 4.0]


def _r(v, n=2):
    return None if v is None or (isinstance(v, float) and not math.isfinite(v)) else round(v, n)


def weekly(tickers):
    import yfinance as yf
    df = yf.download(tickers, start=START, interval="1wk", auto_adjust=True, progress=False, threads=True, group_by="column")
    col = df["Close"]
    if not hasattr(col, "columns"):
        col = col.to_frame(tickers[0])
    col = col.sort_index()
    col = col.resample("W-FRI").last()   # one row per week even when markets list the week on different days
    dates = [d.strftime("%Y-%m-%d") for d in col.index]
    out = {}
    for t in col.columns:
        s = col[t].tolist()
        out[str(t)] = [float(v) if v == v and v > 0 else None for v in s]
    return dates, out


def stdev(a):
    if len(a) < 2:
        return None
    m = sum(a) / len(a)
    return math.sqrt(sum((x - m) ** 2 for x in a) / (len(a) - 1))


def run(dates, px, sect, bench, k_stop):
    names = [t for t in px if t in sect]
    n = len(dates)
    eq = 1.0
    curve = [[dates[60], 1.0]]
    picks, entry_peak, alive = [], {}, {}
    turns = []
    for w in range(60, n - 1):
        if (w - 60) % STEP == 0:
            cand = []
            for t in names:
                p = px[t]
                if p[w] is None or p[w - 4] is None or p[w - 52] is None:
                    continue
                win = [x for x in p[w - 39:w + 1] if x is not None]
                if len(win) < 30 or p[w] < sum(win) / len(win):
                    continue
                rets = [p[j] / p[j - 1] - 1 for j in range(w - 25, w + 1) if p[j] is not None and p[j - 1] is not None]
                sd = stdev(rets)
                if not sd:
                    continue
                cand.append((math.log(p[w - 4] / p[w - 52]) / (sd * math.sqrt(52)), t, sd))
            cand.sort(reverse=True)
            per, new = {}, []
            for sc, t, sd in cand:
                if per.get(sect[t], 0) >= 2:
                    continue
                per[sect[t]] = per.get(sect[t], 0) + 1
                new.append((t, sd))
                if len(new) >= N_PICK:
                    break
            old = set(picks)
            nt = [t for t, _ in new]
            ch = len([t for t in nt if t not in old]) / max(1, len(nt))
            eq *= 1 - ch * FEE * (2 if old else 1)
            turns.append(ch)
            for t, sd in new:
                if t not in old or not alive.get(t, False):
                    entry_peak[t] = px[t][w]
                alive[t] = True
            vol_m = {t: sd * math.sqrt(52 / 12) for t, sd in new}
            picks = nt
        if not picks:
            curve.append([dates[w + 1], eq])
            continue
        r = 0.0
        for t in picks:
            p = px[t]
            if not alive.get(t) or p[w] is None or p[w + 1] is None:
                continue
            r += p[w + 1] / p[w] - 1
            entry_peak[t] = max(entry_peak.get(t, p[w + 1]), p[w + 1])
            if k_stop is not None and p[w + 1] < entry_peak[t] * (1 - k_stop * vol_m[t]):
                alive[t] = False          # sold at this close, cash until the next re-pick
                eq *= 1 - FEE / len(picks)
        eq *= 1 + r / len(picks)
        curve.append([dates[w + 1], eq])
    return curve, sum(turns) / max(1, len(turns))


def ew_curve(dates, px, names):
    eq, curve = 1.0, [[dates[60], 1.0]]
    for w in range(60, len(dates) - 1):
        rs = [px[t][w + 1] / px[t][w] - 1 for t in names if px[t][w] is not None and px[t][w + 1] is not None]
        eq *= 1 + (sum(rs) / len(rs) if rs else 0)
        curve.append([dates[w + 1], eq])
    return curve


def b_curve(dates, b):
    eq, curve, last = 1.0, [[dates[60], 1.0]], None
    for w in range(60, len(dates) - 1):
        if b[w] is not None and b[w + 1] is not None:
            eq *= b[w + 1] / b[w]
        curve.append([dates[w + 1], eq])
    return curve


def stats(c):
    v = [x[1] for x in c]
    yrs = (datetime.fromisoformat(c[-1][0]) - datetime.fromisoformat(c[0][0])).days / 365.25
    cagr = (v[-1] / v[0]) ** (1 / yrs) - 1 if yrs > 0 else 0
    peak, mdd = v[0], 0.0
    for x in v:
        peak = max(peak, x)
        mdd = min(mdd, x / peak - 1)
    by = {}
    for d, x in c:
        by.setdefault(d[:4], []).append(x)
    years, prev = {}, None
    for y in sorted(by):
        a = by[y]
        base = prev if prev is not None else a[0]
        years[y] = _r((a[-1] / base - 1) * 100, 1)
        prev = a[-1]
    return {"cagr": _r(cagr * 100, 1), "total": _r((v[-1] / v[0] - 1) * 100, 0), "mdd": _r(mdd * 100, 1), "years": years}


def thin(c, every=4):
    return [[d, _r((x - 1) * 100, 1)] for i, (d, x) in enumerate(c) if i % every == 0 or i == len(c) - 1]


def main():
    M = json.load(open(os.path.join(ROOT, "data", "market.json")))
    out = {"generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "rules": {"n": N_PICK, "step": STEP, "fee": FEE}, "mk": {}}
    for mkt, bsym in (("us", "SPY"), ("th", "THD")):
        S = {k: v for k, v in M["stocks"].items() if v.get("cal") == mkt and v.get("yahoo")}
        ysym = {v["yahoo"]: k for k, v in S.items()}
        dates, px = weekly(sorted(ysym) + [bsym])
        bench = px.pop(bsym, None)
        px = {ysym[y]: s for y, s in px.items() if y in ysym}
        sect = {k: (S[k].get("sector") or "?") for k in px}
        names = [t for t in px if sum(1 for x in px[t] if x is not None) > 60]
        px = {t: px[t] for t in names}
        variants = {}
        for k in KS:
            c, turn = run(dates, px, sect, bench, k)
            st = stats(c)
            st["turn"] = _r(turn * 100, 0)
            variants["none" if k is None else str(k)] = (c, st)
        base = variants["none"][1]
        score = lambda st: (st["cagr"] or 0) / max(5.0, abs(st["mdd"] or 0))
        best = max((k for k in variants if k != "none"), key=lambda k: score(variants[k][1]))
        if score(variants[best][1]) <= score(base):
            best = "none"
        else:
            # prefer the tightest stop that does almost as well (within 5%) - smaller losses for a beginner
            top = score(variants[best][1])
            best = min((k for k in variants if k != "none" and score(variants[k][1]) >= 0.95 * top and score(variants[k][1]) > score(base)), key=float)
        ew, bc = ew_curve(dates, px, names), b_curve(dates, bench) if bench else None
        out["mk"][mkt] = {
            "from": dates[60], "to": dates[-1], "names": len(names),
            "rules": variants["none"][1], "ew": stats(ew), "bench": stats(bc) if bc else None, "bsym": bsym,
            "stops": {k: v[1] for k, v in variants.items()}, "best_stop": best,
            "curve": {"rules": thin(variants["none"][0]), "best": thin(variants[best][0]) if best != "none" else None, "ew": thin(ew), "bench": thin(bc) if bc else None},
        }
        print(mkt, len(names), "rules", variants["none"][1]["cagr"], "ew", stats(ew)["cagr"], "bench", stats(bc)["cagr"] if bc else None, "best stop", best,
              {k: (v[1]["cagr"], v[1]["mdd"]) for k, v in variants.items()})
    json.dump(out, open(OUT, "w"), separators=(",", ":"))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001
        print("brain_wf failed:", type(e).__name__, e)
        sys.exit(1)
