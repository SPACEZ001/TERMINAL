#!/usr/bin/env python3
"""Offline sanity tests for the combo/benchmark machinery.

No network: synthetic price paths with a KNOWN answer, so a wiring mistake
(off-by-one in the forward window, base rate drawn from the wrong window,
episodes double-counted) shows up as a failed assertion rather than as a
plausible-looking number on the page.
"""
import os, random, sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_backtest as B

FAIL = []


def check(name, cond, detail=""):
    print(("  PASS  " if cond else "  FAIL  ") + name + ("   " + detail if detail else ""))
    if not cond:
        FAIL.append(name)


def daygrid(n, start=date(2000, 1, 3)):
    out, d = [], start
    while len(out) < n:
        if d.weekday() < 5:
            out.append(d.strftime("%Y-%m-%d"))
        d += timedelta(days=1)
    return out


# ---------------------------------------------------------------- Bench --
print("Bench forward returns")
g = daygrid(400)
closes = {d: 100.0 * (1.001 ** i) for i, d in enumerate(g)}
b = B.Bench("T", closes)
exp = (1.001 ** 21 - 1) * 100
check("fwd 21 sessions", abs(b.fwd(g[0], 21) - exp) < 1e-6,
      "%.4f vs %.4f" % (b.fwd(g[0], 21), exp))
check("fwd past the end is None", b.fwd(g[-2], 21) is None)
check("pos() snaps to the next session", b.pos("2000-01-01") == 0)
pool = b.pool(g[0], g[-1], 21)
check("pool length = sample - horizon", len(pool) == len(g) - 21, str(len(pool)))
check("pool window is honoured", len(b.pool(g[100], g[199], 21)) == 100 - 21 + 21,
      str(len(b.pool(g[100], g[199], 21))))

# a benchmark on a DIFFERENT calendar (Thai holidays) must still line up
print("Bench on a foreign calendar")
g2 = [d for i, d in enumerate(g) if i % 17 != 0]          # drop some sessions
c2 = {d: 100.0 for d in g2}
b2 = B.Bench("SET", c2)
missing = g[0]
check("episode on a non-session date still resolves", b2.pos(missing) is not None)
check("flat market gives 0% forward", abs(b2.fwd(g[50], 10)) < 1e-9)

# ------------------------------------------------------------- episodes --
print("Episode detection")
flags = [False] * 300
for i in range(50, 60):
    flags[i] = True                     # one run
for i in range(70, 75):
    flags[i] = True                     # inside cooldown -> ignored
for i in range(200, 205):
    flags[i] = True                     # separate episode
eps = B.episodes_from(flags, daygrid(300), 42)
check("runs collapse to their first day, cooldown respected", len(eps) == 2, str(eps))

# ------------------------------------------------------------ p-values ---
print("Permutation p-value")
random.seed(1)
pool = [random.gauss(0, 5) for _ in range(2000)]
check("a median at the pool median gives p near 0.5",
      0.35 < B.p_value(B.median(pool), 20, pool) < 0.65,
      str(B.p_value(B.median(pool), 20, pool)))
check("a very bad median gives p near 0", B.p_value(-12.0, 20, pool) < 0.02,
      str(B.p_value(-12.0, 20, pool)))
check("a very good median gives p near 1", B.p_value(12.0, 20, pool) > 0.98,
      str(B.p_value(12.0, 20, pool)))
check("p is None when n exceeds the pool", B.p_value(0.0, 5000, pool) is None)

# ------------------------------------------------------- end-to-end -----
print("A signal that genuinely works must grade well")
G = daygrid(4000)
random.seed(3)
px, v = {}, 100.0
crash_at = set(range(500, 4000, 400))
for i, d in enumerate(G):
    drift = -0.004 if any(0 <= i - c < 63 for c in crash_at) else 0.0006
    v *= (1 + drift + random.gauss(0, 0.004))
    px[d] = v
bench = B.Bench("X", px)
flags = [i in crash_at for i in range(len(G))]
eps = B.episodes_from(flags, G, 42)
stats = B.measure(eps, G[0], G[-1], bench)
core = stats["63"]
check("edge is clearly negative", core["edge"] < -8, "edge %s" % core["edge"])
check("p-value is small", core["p"] < 0.05, "p %s" % core["p"])
check("grades A", B.grade_of(stats) == "A", B.grade_of(stats))

print("A signal that is pure noise must NOT grade well")
random.seed(4)
noise = sorted(random.sample(range(300, 3700), 12))
flags = [i in noise for i in range(len(G))]
eps2 = B.episodes_from(flags, G, 42)
st2 = B.measure(eps2, G[0], G[-1], bench)
gr2 = B.grade_of(st2)
check("noise does not earn A or B", gr2 not in ("A", "B"),
      "grade %s edge %s p %s" % (gr2, st2["63"]["edge"], st2["63"]["p"]))

print("A big edge with a high p-value is blocked from A/B")
fake = {"63": {"n": 6, "edge": -9.0, "p": 0.55},
        "21": {"n": 6, "edge": -1.0, "p": 0.4},
        "126": {"n": 6, "edge": -2.0, "p": 0.4},
        "252": {"n": 6, "edge": -1.0, "p": 0.4}}
check("p-gate downgrades to C", B.grade_of(fake) == "C", B.grade_of(fake))

print("Two benchmarks are scored independently")
px2 = {d: 100.0 for d in G}                    # a flat second market
benches = {"A": bench, "B": B.Bench("B", px2)}
row = B.pack({"k": "t", "en": "t", "th": "t"}, eps, G[0], G[-1], benches, "A", len(G))
check("primary benchmark is the one asked for", row["bench"] == "A")
check("alt benchmark is carried alongside",
      len(row["alt"]) == 1 and row["alt"][0]["bench"] == "B", str(len(row["alt"])))
check("flat market shows no edge", abs(row["alt"][0]["h"]["63"]["edge"]) < 1e-6)

print("")
if FAIL:
    print("FAILED: " + ", ".join(FAIL))
    sys.exit(1)
print("all checks passed")
