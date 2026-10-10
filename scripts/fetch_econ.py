#!/usr/bin/env python3
"""Builds data/econ.json -- the economic calendar the site reads (same-origin, no API key).

Source: the public weekly calendar feed from Faireconomy (this week + next week).
It has title / country (currency code) / date / impact / forecast / previous.
It does NOT carry the "actual" figure, so the page shows "pending" for actual.
Output events use the exact shape the page's calendar code already expects:
{event, country, impact, estimate, actual, prev, time, unit}.
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone

FEEDS = [
    "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
    "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
]
# feed uses currency codes; the site uses country codes
CUR2CTRY = {"USD": "US", "EUR": "EU", "GBP": "GB", "JPY": "JP", "CNY": "CN", "THB": "TH"}
# Germany releases are tagged EUR in the feed; keep them under EU (the site also allows DE
# but the feed gives no way to tell them apart from the title alone, so none are invented).
IMPACT = {"high": "high", "medium": "medium", "low": "low"}
NUM = re.compile(r"^\s*(-?\d+(?:\.\d+)?)\s*([%KMBT]?)\s*$", re.I)


def parse_val(s):
    """'0.3%' -> (0.3,'%'); '215K' -> (215.0,'K'); '' / text -> (None,'')."""
    m = NUM.match(str(s or ""))
    if not m:
        return None, ""
    return float(m.group(1)), m.group(2).upper() if m.group(2) != "%" else "%"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "spacez-terminal-econ/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def main():
    raw = []
    for u in FEEDS:
        try:
            raw += fetch(u)
        except Exception as e:  # next week's feed may not exist yet
            print("feed skipped:", u, e, file=sys.stderr)
    if not raw:
        print("no data fetched; keeping the existing file", file=sys.stderr)
        return 0
    out, seen = [], set()
    for r in raw:
        ctry = CUR2CTRY.get(str(r.get("country", "")).upper())
        impact = IMPACT.get(str(r.get("impact", "")).lower())
        if not ctry or not impact:
            continue
        try:
            dt = datetime.fromisoformat(r["date"]).astimezone(timezone.utc)
        except Exception:
            continue
        est, u1 = parse_val(r.get("forecast"))
        prev, u2 = parse_val(r.get("previous"))
        key = (r.get("title"), ctry, dt.isoformat())
        if key in seen:
            continue
        seen.add(key)
        out.append({
            "event": r.get("title", ""),
            "country": ctry,
            "impact": impact,
            "estimate": est,
            "actual": None,
            "prev": prev,
            "time": dt.strftime("%Y-%m-%d %H:%M:%S"),
            "unit": u1 or u2,
        })
    out.sort(key=lambda e: e["time"])
    doc = {"generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "source": "faireconomy weekly calendar (this + next week)", "economicCalendar": out}
    with open("data/econ.json", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    print("events:", len(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
