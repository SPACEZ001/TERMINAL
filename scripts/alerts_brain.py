#!/usr/bin/env python3
"""Telegram heads-up for the admin-only Market Brain (#/brain), added 2026-10-26.

Reads data/brain_ext.json (built by scripts/fetch_brain_ext.py) and sends a
short Thai message to the OWNER's Telegram chat when one of the board's
warning rules fires (yield-curve inversion, Sahm rule, claims, credit, oil,
the Fed's first cut / hike, ...) or first comes within 80% of firing.

Same credentials as scripts/alerts_telegram.py -- environment only, from
GitHub repository Secrets, never written to this public repository:
    TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
Without them it prints what it would have sent and exits 0.

data/alerts_state_brain.json remembers what has gone out. On the very first
run it only records the current state (no flood of old signals).
"""
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = os.path.join(ROOT, "data", "brain_ext.json")
STATE = os.path.join(ROOT, "data", "alerts_state_brain.json")
LINK = "https://spacez001.github.io/TERMINAL/SPACEZ_TERMINAL.html#/brain"


def mdiff(a, b):
    return (int(a[:4]) - int(b[:4])) * 12 + int(a[5:7]) - int(b[5:7])


def fmt(v, unit):
    if v is None:
        return "—"
    return ("%+.2f" % v if unit in ("pt", "") else "%.1f%%" % v) if unit != "%" else "%.2f%%" % v


def send(text):
    tok, chat = os.environ.get("TELEGRAM_BOT_TOKEN", ""), os.environ.get("TELEGRAM_CHAT_ID", "")
    if not tok or not chat or os.environ.get("ALERT_DRY_RUN") == "1":
        print("[dry-run]\n" + text)
        return True
    data = urllib.parse.urlencode({"chat_id": chat, "text": text, "disable_web_page_preview": "true"}).encode()
    try:
        with urllib.request.urlopen("https://api.telegram.org/bot%s/sendMessage" % tok, data=data, timeout=20) as r:
            return r.status == 200
    except Exception as e:  # noqa: BLE001 -- never break the data job
        print("telegram send failed: %s" % type(e).__name__, file=sys.stderr)
        return False


def main():
    try:
        ext = json.load(open(EXT, encoding="utf-8"))
        rules = ext["alerts"]["rules"]
    except Exception:  # noqa: BLE001
        print("no alerts block - nothing to do")
        return
    first = not os.path.exists(STATE)
    st = {} if first else json.load(open(STATE, encoding="utf-8"))
    last, near = st.get("last", {}), st.get("near", {})
    today = "%04d-%02d" % (date.today().year, date.today().month)
    owner = os.environ.get("ALERT_OWNER", "คุณโฟกัส")
    lines = []
    for r in rules:
        k = r["k"]
        nm = r["name"]["th"]
        if r.get("last") and r["last"] != last.get(k) and mdiff(today, r["last"]) <= 3:
            stat = "ในอดีตเกิด %d ครั้ง" % r["n"]
            if r.get("spx12") is not None:
                stat += " · 12 เดือนต่อมา S&P 500 เฉลี่ย %+.1f%%" % r["spx12"]
            if r.get("rec18") is not None:
                stat += " · ตามด้วยภาวะถดถอย %d%%" % r["rec18"]
            icon = "🟢" if r["tone"] == "good" else "🔴" if r["tone"] == "bad" else "🟡"
            lines.append("%s %s (ค่าล่าสุด %s)\n   %s" % (icon, nm, fmt(r.get("cur"), r.get("unit")), stat))
        is_near = (r.get("close") or 0) >= 80 and not r.get("on")
        if is_near and not near.get(k):
            lines.append("⚠️ ใกล้ทำงาน: %s (ไปแล้ว %d%% ของทาง ค่า %s)" % (nm, r["close"], fmt(r.get("cur"), r.get("unit"))))
        near[k] = is_near
        if r.get("last"):
            last[k] = r["last"]
    if lines and not first:
        ok = send("🧠 สมองตลาด · สัญญาณเตือนใหม่\n%sคะ มีเรื่องที่ควรรู้:\n\n%s\n\nดูรายละเอียด: %s" % (owner, "\n".join(lines), LINK))
        if not ok:
            return
    elif first:
        print("first run: recording the current state only")
    else:
        print("no new signals")
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump({"last": last, "near": near, "updated": date.today().isoformat()}, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
