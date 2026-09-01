#!/usr/bin/env python3
"""Offline tests for the per-stock price series packing.

A price line drawn one day out of place is worse than no line at all, and it
would look perfectly plausible on screen. So the alignment is tested against
handmade calendars with deliberate holes in them.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_market as F

FAIL = []


def check(name, cond, detail=""):
    print(("  PASS  " if cond else "  FAIL  ") + name + ("   " + detail if detail else ""))
    if not cond:
        FAIL.append(name)


def days(n, start=1):
    return ["2026-01-%02d" % d for d in range(start, start + n)]


print("price formatting")
check("thousands lose the noise", F._price_str(1025.9012) == "1025.9", F._price_str(1025.9012))
check("normal prices keep two places", F._price_str(220.7841) == "220.78", F._price_str(220.7841))
check("small prices keep three", F._price_str(4.56789) == "4.568", F._price_str(4.56789))
check("penny prices keep four", F._price_str(0.123456) == "0.1235", F._price_str(0.123456))
check("trailing zeros are dropped", F._price_str(12.50) == "12.5", F._price_str(12.5))
check("a round number stays readable", F._price_str(100.0) == "100", F._price_str(100.0))

print("\npacking against a shared calendar")
d = days(40)
stocks = {
    "AAA": {"ccy": "USD", "_hist": [(x, 100.0 + i) for i, x in enumerate(d)]},
    # BBB missed two sessions in the middle — a halt
    "BBB": {"ccy": "USD", "_hist": [(x, 50.0 + i) for i, x in enumerate(d)
                                    if x not in (d[10], d[11])]},
    # CCC listed late
    "CCC": {"ccy": "USD", "_hist": [(x, 10.0 + i) for i, x in enumerate(d) if i >= 6]},
    # a Thai name on its own calendar, one day the US market did not trade
    "TTT": {"ccy": "THB", "_hist": [(x, 5.0 + i) for i, x in enumerate(days(40))]},
    # a failed fetch carrying stale fields from the previous run
    "OLD": {"ccy": "USD", "c": "1,2,3", "cal": "us", "stale": True},
}
meta = F.build_charts(stocks)

usd = meta["cal"]["us"].split(",")
check("the US calendar is the union of its stocks' dates", len(usd) == 40, str(len(usd)))
check("Thailand gets its own calendar", "th" in meta["cal"])

a = stocks["AAA"]["c"].split(",")
check("a full series fills every slot", len(a) == 40 and "" not in a, str(len(a)))
check("the last close lands on the last date", a[-1] == "139", a[-1])

b = stocks["BBB"]["c"].split(",")
check("a halt leaves holes, not a shift", len(b) == 40 and b[10] == "" and b[11] == "",
      "%s | %s | %s" % (b[9], b[10], b[12]))
check("prices after a halt stay on their own dates", b[12] == "62", b[12])

c = stocks["CCC"]["c"].split(",")
check("a late listing pads at the front", c[:6] == [""] * 6 and c[6] == "16",
      c[5] + " | " + c[6])
check("a late listing still ends on the last date", c[-1] == "49", c[-1])

check("a stale row loses its old line rather than drawing it shifted",
      "c" not in stocks["OLD"] and "cal" not in stocks["OLD"])
check("every packed stock names its calendar",
      all(stocks[k].get("cal") == "us" for k in ("AAA", "BBB", "CCC")) and
      stocks["TTT"].get("cal") == "th")
check("the raw history is stripped from the payload",
      all("_hist" not in v for v in stocks.values()))

print("\ntoo little history is not published")
tiny = {"XXX": {"ccy": "USD", "_hist": [(x, 1.0) for x in days(9)]}}
F.build_charts(tiny)
check("a series under 30 days is dropped", "c" not in tiny["XXX"])

print("\nthe series really does reconstruct")
d2 = days(31)
one = {"ZZZ": {"ccy": "USD", "_hist": [(x, 10.0 + i * 0.5) for i, x in enumerate(d2)]}}
m2 = F.build_charts(one)
cal2 = m2["cal"]["us"].split(",")
vals = one["ZZZ"]["c"].split(",")
pairs = [(cal2[i], float(v)) for i, v in enumerate(vals) if v]
check("every point maps back to its own date and price",
      pairs == [(x, 10.0 + i * 0.5) for i, x in enumerate(d2)],
      str(pairs[:2]))

print("")
if FAIL:
    print("FAILED: " + ", ".join(FAIL))
    sys.exit(1)
print("all checks passed")
