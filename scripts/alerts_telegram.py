#!/usr/bin/env python3
"""
Telegram alerts for SPACEZ TERMINAL.

Reads the snapshot that scripts/fetch_market.py already produces
(data/market.json) and pushes short Thai-language notifications to Telegram.

Runs inside the existing market-data workflow, so it sees the numbers the
site sees. It never fetches anything of its own.

CREDENTIALS
-----------
The bot token and chat id come from the environment only, supplied by GitHub
Actions from repository Secrets. They are never read from a file, never
logged, and must never be written into this repository - it is public.

    TELEGRAM_BOT_TOKEN   from @BotFather
    TELEGRAM_CHAT_ID     your own chat id

With either missing the script prints what it would have sent and exits 0,
so the data pipeline is never broken by a messaging problem.

TUNING (all optional, set as repository Variables)
--------------------------------------------------
    ALERT_ENABLE          comma list: turn,move,indicator,daily,fx
                          default: all five
    ALERT_MOVE_PCT        daily move that counts as "big"   default 5.0
    ALERT_DAILY_HOUR_UTC  hour for the daily digests        default 1 (08:00 ICT)
    ALERT_MAX_TURN        max turn signals per message      default 6
    ALERT_DRY_RUN         "1" to print instead of send

STATE
-----
data/alerts_state.json remembers what has already gone out, so a signal that
stays true for days does not re-notify every 30 minutes. The workflow commits
it back alongside the snapshot.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAPSHOT = os.path.join(ROOT, "data", "market.json")
STATE_FILE = os.path.join(ROOT, "data", "alerts_state.json")

ICT = timezone(timedelta(hours=7))

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

DRY_RUN = os.environ.get("ALERT_DRY_RUN", "").strip() == "1" or not (TOKEN and CHAT_ID)

ENABLED = set(
    x.strip()
    for x in os.environ.get("ALERT_ENABLE", "turn,move,indicator,daily,fx").split(",")
    if x.strip()
)


def _num(name, default):
    try:
        return float(os.environ.get(name, "").strip() or default)
    except ValueError:
        return default


MOVE_PCT = _num("ALERT_MOVE_PCT", 5.0)
DAILY_HOUR_UTC = int(_num("ALERT_DAILY_HOUR_UTC", 1))
MAX_TURN = int(_num("ALERT_MAX_TURN", 6))

# A signal that is still true a week later is worth repeating once; anything
# sooner is the same signal and stays quiet.
TURN_COOLDOWN_DAYS = 7
STATE_KEEP_DAYS = 40


# ---------------------------------------------------------------- state ----
def load_state():
    try:
        with open(STATE_FILE, encoding="utf-8") as fh:
            st = json.load(fh)
    except (OSError, ValueError):
        st = {}
    st.setdefault("sent", {})
    st.setdefault("indicators", {})
    st.setdefault("last_daily", "")
    st.setdefault("last_fx", "")
    return st


def save_state(st, today):
    cutoff = (today - timedelta(days=STATE_KEEP_DAYS)).isoformat()
    st["sent"] = {k: v for k, v in st["sent"].items() if v >= cutoff}
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(st, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write("\n")
    os.replace(tmp, STATE_FILE)


# ------------------------------------------------------------- telegram ----
def send(text):
    """Post one message. Never raises - a messaging failure must not fail the
    data pipeline, and must never print the token."""
    if DRY_RUN:
        print("\n----- would send -----")
        print(text)
        print("----------------------")
        return True
    payload = urllib.parse.urlencode(
        {
            "chat_id": CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": "true",
        }
    ).encode()
    url = "https://api.telegram.org/bot%s/sendMessage" % TOKEN
    try:
        req = urllib.request.Request(url, data=payload)
        with urllib.request.urlopen(req, timeout=25) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        if not body.get("ok"):
            print("telegram refused the message: %s" % body.get("description"))
            return False
        return True
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("description", "")
        except Exception:
            pass
        print("telegram HTTP %s %s" % (exc.code, detail))
        return False
    except Exception as exc:  # network, DNS, timeout
        print("telegram unreachable: %s" % type(exc).__name__)
        return False


def esc(s):
    return (
        str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )


def pct(v, digits=2):
    if v is None:
        return "-"
    return ("%+." + str(digits) + "f%%") % v


def arrow(v):
    if v is None:
        return "="
    return "▲" if v > 0 else ("▼" if v < 0 else "=")


def price(v):
    """Telegram renders a proportional font, so columns cannot be aligned with
    padding. Readable numbers do the work instead."""
    if v is None:
        return "-"
    try:
        v = float(v)
    except (TypeError, ValueError):
        return esc(v)
    if abs(v) >= 1000:
        return "{:,.2f}".format(v)
    if abs(v) >= 10:
        return "{:,.2f}".format(v)
    return "{:,.4f}".format(v).rstrip("0").rstrip(".")


# ------------------------------------------------------------- sections ----
def turn_signals(snap, st, today):
    """New RSI divergences and moving-average crosses - the site's own
    'turn signal' board, pushed as it changes."""
    reg = snap.get("regime") or {}
    out, keys = [], []
    cutoff = (today - timedelta(days=TURN_COOLDOWN_DAYS)).isoformat()

    for d in (reg.get("divergences") or [])[:MAX_TURN * 3]:
        t, kind = d.get("t"), d.get("kind")
        if not t or not kind:
            continue
        key = "turn:%s:%s" % (t, kind)
        if st["sent"].get(key, "") > cutoff:
            continue
        word = "อ่อนแรงที่ยอด" if kind == "bearish" else "เริ่มมีแรงซื้อที่ฐาน"
        out.append(
            "  %s <b>%s</b> %s - RSI %s→%s ขณะที่ราคายัง%s"
            % (
                "▼" if kind == "bearish" else "▲",
                esc(t),
                word,
                d.get("rsi_then"),
                d.get("rsi"),
                "ขึ้น" if kind == "bearish" else "ลง",
            )
        )
        keys.append(key)
        if len(out) >= MAX_TURN:
            break

    crosses = []
    for c in reg.get("crosses") or []:
        t, kind = c.get("t"), c.get("kind")
        if not t or not kind:
            continue
        key = "cross:%s:%s" % (t, kind)
        if st["sent"].get(key, "") > cutoff:
            continue
        crosses.append(
            "  %s <b>%s</b> %s (ราคาเทียบ MA200 %s)"
            % (
                "▲" if kind == "golden" else "▼",
                esc(t),
                "Golden cross - MA50 ตัดขึ้นเหนือ MA200"
                if kind == "golden"
                else "Death cross - MA50 ตัดลงใต้ MA200",
                pct(c.get("vs200")),
            )
        )
        keys.append(key)

    if not out and not crosses:
        return None, []

    msg = ["<b>⚠ สัญญาณกลับทิศ</b>"]
    if out:
        msg.append("\nสัญญาณขัดแย้ง RSI (RSI divergence):")
        msg.extend(out)
    if crosses:
        msg.append("\nเส้นค่าเฉลี่ยตัดกัน:")
        msg.extend(crosses)
    msg.append("\n<i>เป็นการรายงานสิ่งที่เกิดขึ้นในข้อมูล ไม่ใช่คำแนะนำให้ซื้อขาย</i>")
    return "\n".join(msg), keys


def big_moves(snap, st, today):
    """Anything that moved more than the threshold today, once per name."""
    stocks = snap.get("stocks") or {}
    day = today.isoformat()
    rows, keys = [], []
    for t, s in stocks.items():
        chg = s.get("chg_pct")
        if chg is None or abs(chg) < MOVE_PCT:
            continue
        key = "move:%s:%s" % (t, day)
        if key in st["sent"]:
            continue
        rows.append((abs(chg), t, s))
        keys.append(key)
    if not rows:
        return None, []
    rows.sort(reverse=True)

    msg = ["<b>ราคาขยับแรงเกิน %g%%</b>" % MOVE_PCT]
    for _, t, s in rows[:12]:
        msg.append(
            "  %s <b>%s</b> %s — %s <i>%s</i>"
            % (
                arrow(s.get("chg_pct")),
                esc(t),
                pct(s.get("chg_pct")),
                price(s.get("price")),
                esc((s.get("name") or "")[:34]),
            )
        )
    return "\n".join(msg), keys


def indicator_warnings(snap, st):
    """Edge-triggered: fires when a reading crosses a line, and again only
    when it crosses back and returns. No repeat while it simply stays there."""
    reg = snap.get("regime") or {}
    macro = snap.get("macro") or {}
    vix = (macro.get("vix") or {}).get("price")

    checks = [
        (
            "vix_high",
            vix is not None and vix >= 25,
            "⚠ VIX %s - ความผันผวนสูง ตลาดกำลังกลัว" % vix,
            "VIX กลับลงต่ำกว่า 25 แล้ว (%s)" % vix,
        ),
        (
            "breadth50_weak",
            reg.get("breadth_50") is not None and reg["breadth_50"] < 40,
            "⚠ หุ้นเหนือ MA50 เหลือ %s%% - หุ้นส่วนใหญ่หลุดเส้นระยะกลาง"
            % reg.get("breadth_50"),
            "หุ้นเหนือ MA50 กลับขึ้นเกิน 40%% แล้ว (%s%%)" % reg.get("breadth_50"),
        ),
        (
            "breadth200_weak",
            reg.get("breadth_200") is not None and reg["breadth_200"] < 50,
            "⚠ หุ้นเหนือ MA200 เหลือ %s%% - แนวโน้มระยะยาวเริ่มเสีย"
            % reg.get("breadth_200"),
            "หุ้นเหนือ MA200 กลับขึ้นเกิน 50%% แล้ว (%s%%)" % reg.get("breadth_200"),
        ),
        (
            "curve_inverted",
            reg.get("curve_10y_3m") is not None and reg["curve_10y_3m"] < 0,
            "⚠ เส้นผลตอบแทนกลับหัว (10 ปี ต่ำกว่า 3 เดือน %s) - "
            "ในอดีตมักมาก่อนภาวะถดถอย" % reg.get("curve_10y_3m"),
            "เส้นผลตอบแทนกลับมาปกติแล้ว (%s)" % reg.get("curve_10y_3m"),
        ),
    ]

    lines = []
    for name, is_on, on_text, off_text in checks:
        was_on = bool(st["indicators"].get(name))
        if is_on and not was_on:
            lines.append("  " + on_text)
        elif was_on and not is_on:
            lines.append("  ▲ " + off_text)
        st["indicators"][name] = bool(is_on)

    if not lines:
        return None
    return "<b>อินดิเคเตอร์เตือน</b>\n" + "\n".join(lines)


def daily_summary(snap):
    macro = snap.get("macro") or {}
    reg = snap.get("regime") or {}
    stocks = snap.get("stocks") or {}

    msg = ["<b>สรุปตลาดรายวัน</b>"]
    for key in ("set", "spx", "vix", "dxy", "us10y"):
        m = macro.get(key)
        if not m:
            continue
        msg.append(
            "  %s %s — <b>%s</b> (%s)"
            % (arrow(m.get("d1")), esc(m.get("th") or m.get("en") or key),
               price(m.get("price")), pct(m.get("d1")))
        )

    b50, b200 = reg.get("breadth_50"), reg.get("breadth_200")
    if b50 is not None and b200 is not None:
        msg.append(
            "\nหุ้นที่ยืนเหนือเส้นค่าเฉลี่ย (จาก %s ตัว)" % reg.get("breadth_n")
        )
        msg.append("  เหนือ MA50: %s%%   เหนือ MA200: %s%%" % (b50, b200))

    moved = [
        (s.get("chg_pct"), t, s)
        for t, s in stocks.items()
        if s.get("chg_pct") is not None
    ]
    if moved:
        moved.sort(reverse=True)
        up = [m for m in moved if m[0] > 0][:3]
        dn = [m for m in moved if m[0] < 0][-3:]
        if up:
            msg.append("\nขึ้นแรงสุด")
            for c, t, s in up:
                msg.append("  ▲ <b>%s</b> %s" % (esc(t), pct(c)))
        if dn:
            msg.append("ลงแรงสุด")
            for c, t, s in reversed(dn):
                msg.append("  ▼ <b>%s</b> %s" % (esc(t), pct(c)))

    msg.append("\n<i>ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน</i>")
    return "\n".join(msg)


def bootstrap(snap, st, day):
    """First ever run: the board is already full of signals that fired days or
    weeks ago. Record them all as seen so the first notification is not a wall
    of stale history - from here on only genuinely new signals arrive."""
    reg = snap.get("regime") or {}
    for d in reg.get("divergences") or []:
        if d.get("t") and d.get("kind"):
            st["sent"]["turn:%s:%s" % (d["t"], d["kind"])] = day
    for c in reg.get("crosses") or []:
        if c.get("t") and c.get("kind"):
            st["sent"]["cross:%s:%s" % (c["t"], c["kind"])] = day
    for t, s in (snap.get("stocks") or {}).items():
        if s.get("chg_pct") is not None and abs(s["chg_pct"]) >= MOVE_PCT:
            st["sent"]["move:%s:%s" % (t, day)] = day
    indicator_warnings(snap, st)          # records the current on/off states
    st["last_daily"] = day
    st["last_fx"] = day


def daily_fx(snap):
    ccy = snap.get("ccy") or {}
    thb = ccy.get("THB")
    if not thb or not thb.get("rate"):
        return None
    rate = thb["rate"]

    msg = ["<b>อัพเดทค่าเงินรายวัน</b>"]
    msg.append("  1 USD = <b>%.2f THB</b>  %s" % (rate, pct(thb.get("d1"))))
    msg.append(
        "  บาทเทียบดอลลาร์: 1 เดือน %s  ตั้งแต่ต้นปี %s"
        % (pct(thb.get("m1")), pct(thb.get("ytd")))
    )
    msg.append("  <i>ตัวเลขเป็นบวก = บาทอ่อนค่า (ใช้บาทมากขึ้นต่อ 1 ดอลลาร์)</i>")

    crosses = [("EUR", "ยูโร"), ("JPY", "เยน"), ("GBP", "ปอนด์"), ("CNY", "หยวน")]
    rows = []
    for code, name in crosses:
        c = ccy.get(code)
        if not c or not c.get("rate"):
            continue
        # every rate is "units per USD", so THB per unit is the ratio
        per = rate / c["rate"]
        unit = "100 JPY" if code == "JPY" else "1 " + code
        shown = per * 100 if code == "JPY" else per
        rows.append("  %s (%s) = %.2f THB" % (unit, name, shown))
    if rows:
        msg.append("\nสกุลอื่นคิดเป็นเงินบาท")
        msg.extend(rows)

    return "\n".join(msg)


# ------------------------------------------------------------------ main ---
def main():
    try:
        with open(SNAPSHOT, encoding="utf-8") as fh:
            snap = json.load(fh)
    except (OSError, ValueError) as exc:
        print("cannot read the snapshot, nothing to alert on: %s" % exc)
        return 0

    now = datetime.now(timezone.utc)
    today = now.date()
    first_run = not os.path.exists(STATE_FILE)
    st = load_state()

    if DRY_RUN:
        print("DRY RUN - no credentials, or ALERT_DRY_RUN=1. Nothing will be sent.")
    print("snapshot generated_at=%s  enabled=%s" % (snap.get("generated_at"), ",".join(sorted(ENABLED))))

    day = today.isoformat()

    if first_run:
        bootstrap(snap, st, day)
        bkk = now.astimezone(ICT).strftime("%d/%m/%Y %H:%M")
        hello = [
            "<b>✓ เชื่อมต่อ SPACEZ TERMINAL แล้ว</b>",
            "ตั้งค่าเสร็จเมื่อ %s (เวลาไทย)" % bkk,
            "",
            "จากนี้จะส่งให้อัตโนมัติ:",
            "  • สัญญาณกลับทิศ — เมื่อมีสัญญาณ<b>ใหม่</b>",
            "  • ราคาขยับแรงเกิน %g%% — วันละครั้งต่อตัว" % MOVE_PCT,
            "  • อินดิเคเตอร์เตือน — เฉพาะตอนที่ค่าข้ามเส้น",
            "  • สรุปตลาด + ค่าเงิน — ทุกวัน %02d:00 เวลาไทย" % ((DAILY_HOUR_UTC + 7) % 24),
            "",
            "<i>สัญญาณที่ค้างอยู่ก่อนหน้านี้ถูกบันทึกว่ารับทราบแล้ว "
            "เพื่อไม่ให้ข้อความแรกท่วม — ด้านล่างคือตัวอย่างสรุปประจำวัน</i>",
        ]
        for msg in ("\n".join(hello), daily_summary(snap), daily_fx(snap)):
            if msg:
                send(msg)
        save_state(st, today)
        print("first run: bootstrapped, sent the welcome digest")
        return 0

    pending = []          # (message, keys-to-remember)

    if "turn" in ENABLED:
        msg, keys = turn_signals(snap, st, today)
        if msg:
            pending.append((msg, keys))

    if "move" in ENABLED:
        msg, keys = big_moves(snap, st, today)
        if msg:
            pending.append((msg, keys))

    if "indicator" in ENABLED:
        msg = indicator_warnings(snap, st)
        if msg:
            pending.append((msg, []))

    # The digests go out once a day, on the first run at or after the chosen
    # hour. Comparing dates rather than counting runs keeps it correct even
    # when GitHub delays the schedule.
    if now.hour >= DAILY_HOUR_UTC:
        if "daily" in ENABLED and st.get("last_daily") != day:
            msg = daily_summary(snap)
            if msg:
                pending.append((msg, []))
                st["last_daily"] = day
        if "fx" in ENABLED and st.get("last_fx") != day:
            msg = daily_fx(snap)
            if msg:
                pending.append((msg, []))
                st["last_fx"] = day

    if not pending:
        print("nothing new to report")
        save_state(st, today)
        return 0

    sent_any = False
    for msg, keys in pending:
        if send(msg):
            sent_any = True
            for k in keys:
                st["sent"][k] = day
        else:
            # leave the keys unmarked so the next run tries again
            print("kept %d signal(s) pending for the next run" % len(keys))

    if sent_any or DRY_RUN:
        save_state(st, today)
    print("done: %d message(s)" % len(pending))
    return 0


if __name__ == "__main__":
    sys.exit(main())
