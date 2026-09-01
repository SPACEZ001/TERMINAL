#!/usr/bin/env python3
"""End-to-end dry run of build_backtest.main() on synthetic prices.

No network. Every symbol gets a random walk (VIX and the yield symbols get
level-appropriate ones), so the OUTPUT is meaningless as market history — the
point is that the whole combo/benchmark/packaging path executes, produces the
JSON shape the page expects, and that a pure-noise world produces no A grades.
The payload is written to a temp directory, never over the repo's own
data/backtest.json — copy it out if you want one to build the UI against.
"""
import json, math, os, random, sys, tempfile
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_backtest as B

random.seed(11)

def daygrid(n, start=date(1998, 1, 5)):
    out, d = [], start
    while len(out) < n:
        if d.weekday() < 5:
            out.append(d.strftime("%Y-%m-%d"))
        d += timedelta(days=1)
    return out

FULL = daygrid(7000)

def walk(dates, start, vol, drift=0.0003, floor=None):
    out, v = {}, float(start)
    for d in dates:
        v *= (1 + drift + random.gauss(0, vol))
        if floor is not None and v < floor:
            v = floor
        out[d] = v
    return out

LATE = {"HYG": 2500, "LQD": 3000, "DBC": 2900, "UUP": 2800, "SMH": 2000,
        "TLT": 2200, "IWM": 1500, "THB=X": 1200}

def synth(sym):
    dates = FULL[LATE.get(sym, 0):]
    if sym == "^VIX":
        return {d: max(9.0, 19 + 7 * math.sin(i / 120.0) + random.gauss(0, 3))
                for i, d in enumerate(dates)}
    if sym == "^TNX":
        return {d: max(0.4, 3.0 + 1.6 * math.sin(i / 900.0) + random.gauss(0, .05))
                for i, d in enumerate(dates)}
    if sym == "^IRX":
        return {d: max(0.02, 2.4 + 2.2 * math.sin(i / 700.0 + 1.0) + random.gauss(0, .05))
                for i, d in enumerate(dates)}
    if sym == "THB=X":
        return walk(dates, 33, 0.003, 0.0)
    return walk(dates, 40 + random.random() * 60, 0.011,
                0.0004 if sym != "^SET.BK" else 0.0002)

B.closes_of = lambda sym, period="max": synth(sym)
B.time.sleep = lambda *_: None
B.TRIALS = 4000
# never touch the repo's real data file
B.OUT = os.path.join(tempfile.mkdtemp(prefix="spz-bt-"), "backtest.json")

rc = B.main()
print("\nexit code", rc)

p = json.load(open(B.OUT, encoding="utf-8"))
ok = True
def check(name, cond, detail=""):
    global ok
    print(("  PASS  " if cond else "  FAIL  ") + name + ("   " + detail if detail else ""))
    if not cond:
        ok = False

print("\nshape of the payload")
check("gauges present", len(p["gauges"]) >= 10, str(len(p["gauges"])))
check("combos present", len(p["combos"]) >= 8, str(len(p["combos"])))
check("both benchmarks listed", set(p["benchmarks"]) == {"SPY", "^SET.BK"},
      str(list(p["benchmarks"])))
check("SET weekly series exported", len(p["bench_series_th"]) > 500,
      str(len(p["bench_series_th"])))
check("sector series exported", len(p["sectors"]) >= 10, str(len(p["sectors"])))

thb = [g for g in p["gauges"] if g["k"] == "thb_1m"]
check("baht gauge is graded on SET", thb and thb[0]["bench"] == "^SET.BK",
      thb[0]["bench"] if thb else "missing")
check("every gauge with episodes carries an alt benchmark",
      all(len(g.get("alt", [])) >= 1 for g in p["gauges"] if g["episodes"] > 1),
      str([g["k"] for g in p["gauges"] if g["episodes"] > 1 and not g.get("alt")]))
check("every signal reports how often it is switched on",
      all(g.get("on_rate") is not None for g in p["gauges"] + p["combos"]))
check("count combos cover 2..6",
      {c["k"] for c in p["combos"] if c.get("kind") == "count"} ==
      {"any2", "any3", "any4", "any5", "any6"},
      str(sorted(c["k"] for c in p["combos"] if c.get("kind") == "count")))
check("named clusters all built",
      len([c for c in p["combos"] if c.get("kind") == "cluster"]) == 5,
      str(len([c for c in p["combos"] if c.get("kind") == "cluster"])))
check("every combo has a p-value at 3m",
      all(("p" in (c.get("h", {}).get("63") or {"p": None}))
          for c in p["combos"]))

# Episode COUNTS are not monotonic in n — a condition that is on almost every
# day yields one long episode — but the share of days it is ON must be.
rates = {c["k"]: c["on_rate"] for c in p["combos"] if c.get("kind") == "count"}
mono = all(rates.get("any%d" % n, 0) >= rates.get("any%d" % (n + 1), 0)
           for n in range(2, 6))
check("a stricter bar is on fewer days", mono, str(rates))

print("\nin a world made of noise, nothing should earn an A or a B")
best = [(r["k"], r["grade"]) for r in p["gauges"] + p["combos"]
        if r["grade"] in ("A", "B")]
check("multiple-testing correction blocks lucky winners", not best, str(best))
check("the correction is reported", p.get("n_tests", 0) >= 20, str(p.get("n_tests")))

print("\nsize %.0f KB" % (os.path.getsize(B.OUT) / 1024.0))
sys.exit(0 if ok and rc == 0 else 1)
