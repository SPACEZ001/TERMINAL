#!/usr/bin/env python3
"""
Telegram alerts for SPACEZ TERMINAL.

Reads the snapshot that scripts/fetch_market.py already produces
(data/market.json) and pushes Thai-language notifications to Telegram,
written in the voice of a personal assistant rather than a raw data dump.

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
    ALERT_OWNER           who the assistant is writing to    default คุณโฟกัส
    ALERT_DRY_RUN         "1" to print instead of send
    ALERT_TEST            "1"/"true" to send one sample of every message type
                          without touching the saved state

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
TEST_MODE = os.environ.get("ALERT_TEST", "").strip().lower() in ("1", "true", "yes")

OWNER = os.environ.get("ALERT_OWNER", "").strip() or "คุณโฟกัส"

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

TURN_COOLDOWN_DAYS = 7
STATE_KEEP_DAYS = 40

RULE = "━━━━━━━━━━━━━━━━━━━"

TH_DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]
TH_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]


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


# ------------------------------------------------------------ formatting --
def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def pct(v, digits=2):
    if v is None:
        return "-"
    return ("%+." + str(digits) + "f%%") % v


def mark(v):
    """Telegram renders a proportional font, so columns cannot be aligned with
    padding. Colour does the scanning work instead."""
    if v is None:
        return "⬜"
    return "🔺" if v > 0 else ("🔻" if v < 0 else "➖")


def price(v):
    if v is None:
        return "-"
    try:
        v = float(v)
    except (TypeError, ValueError):
        return esc(v)
    if abs(v) >= 10:
        return "{:,.2f}".format(v)
    return "{:,.4f}".format(v).rstrip("0").rstrip(".")


def now_ict():
    return datetime.now(timezone.utc).astimezone(ICT)


def th_date(dt=None):
    dt = dt or now_ict()
    return "วัน%sที่ %d %s %d" % (
        TH_DAYS[dt.weekday()], dt.day, TH_MONTHS[dt.month - 1], dt.year + 543,
    )


def stamp(dt=None):
    dt = dt or now_ict()
    return "🗓 %s · %02d:%02d น." % (th_date(dt), dt.hour, dt.minute)


def greeting(dt=None):
    h = (dt or now_ict()).hour
    if h < 12:
        return "☀️ อรุณสวัสดิ์ค่ะ %s" % OWNER
    if h < 17:
        return "🌤 สวัสดีตอนบ่ายค่ะ %s" % OWNER
    return "🌙 สวัสดีตอนเย็นค่ะ %s" % OWNER


DISCLAIMER = "📌 <i>ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุนนะคะ</i>"


# ------------------------------------------------------------- sections ----
def turn_signals(snap, st, today, force=False):
    """New RSI divergences and moving-average crosses - the site's own
    'turn signal' board, pushed as it changes."""
    reg = snap.get("regime") or {}
    bear, bull, crosses, keys = [], [], [], []
    cutoff = (today - timedelta(days=TURN_COOLDOWN_DAYS)).isoformat()

    for d in (reg.get("divergences") or []):
        t, kind = d.get("t"), d.get("kind")
        if not t or not kind:
            continue
        key = "turn:%s:%s" % (t, kind)
        if not force and st["sent"].get(key, "") > cutoff:
            continue
        line = "▫️ <b>%s</b> · RSI %s → %s" % (esc(t), d.get("rsi_then"), d.get("rsi"))
        (bear if kind == "bearish" else bull).append(line)
        keys.append(key)
        if len(bear) + len(bull) >= MAX_TURN:
            break

    for c in reg.get("crosses") or []:
        t, kind = c.get("t"), c.get("kind")
        if not t or not kind:
            continue
        key = "cross:%s:%s" % (t, kind)
        if not force and st["sent"].get(key, "") > cutoff:
            continue
        crosses.append(
            "%s <b>%s</b> · %s (ห่าง MA200 %s)"
            % (
                "🟢" if kind == "golden" else "🔴",
                esc(t),
                "Golden cross" if kind == "golden" else "Death cross",
                pct(c.get("vs200")),
            )
        )
        keys.append(key)

    if not (bear or bull or crosses):
        return None, []

    msg = ["🔔 <b>เรียนแจ้งค่ะ — มีสัญญาณกลับทิศใหม่</b>", stamp(), "", RULE]

    if bear:
        msg.append("")
        msg.append("⚠️ <b>อ่อนแรงที่ยอด</b> · Bearish divergence")
        msg.extend(bear)
        msg.append("<i>ราคายังทำจุดสูงใหม่ แต่แรงซื้อเริ่มหมดค่ะ</i>")

    if bull:
        msg.append("")
        msg.append("✨ <b>เริ่มมีแรงซื้อที่ฐาน</b> · Bullish divergence")
        msg.extend(bull)
        msg.append("<i>ราคายังลง แต่แรงขายเริ่มเบาลงค่ะ</i>")

    if crosses:
        msg.append("")
        msg.append("📐 <b>เส้นค่าเฉลี่ยตัดกัน</b>")
        msg.extend(crosses)

    msg += ["", RULE, "", "📌 <i>เป็นการรายงานสิ่งที่เกิดขึ้นในข้อมูล ไม่ใช่คำแนะนำให้ซื้อขายนะคะ</i>"]
    return "\n".join(msg), keys


def big_moves(snap, st, today, force=False):
    """Anything that moved more than the threshold today, once per name."""
    stocks = snap.get("stocks") or {}
    day = today.isoformat()
    rows, keys = [], []
    for t, s in stocks.items():
        chg = s.get("chg_pct")
        if chg is None or abs(chg) < MOVE_PCT:
            continue
        key = "move:%s:%s" % (t, day)
        if not force and key in st["sent"]:
            continue
        rows.append((abs(chg), t, s))
        keys.append(key)
    if not rows:
        return None, []
    rows.sort(reverse=True)

    up = [r for r in rows if r[2].get("chg_pct", 0) > 0]
    dn = [r for r in rows if r[2].get("chg_pct", 0) < 0]

    msg = [
        "📢 <b>รายงานหุ้นที่ขยับแรงค่ะ</b>",
        stamp(),
        "<i>เกณฑ์ที่ตั้งไว้: เกิน ±%g%%</i>" % MOVE_PCT,
        "",
        RULE,
    ]

    def block(title, items):
        out = ["", title]
        for _, t, s in items[:8]:
            out.append(
                "%s <b>%s</b> %s · %s"
                % (mark(s.get("chg_pct")), esc(t), pct(s.get("chg_pct")), price(s.get("price")))
            )
            name = (s.get("name") or "").strip()
            if name:
                out.append("     <i>%s</i>" % esc(name[:38]))
        return out

    if up:
        msg += block("🟢 <b>ขึ้นแรง</b>", up)
    if dn:
        msg += block("🔴 <b>ลงแรง</b>", dn)

    msg += ["", RULE, "", DISCLAIMER]
    return "\n".join(msg), keys


def indicator_warnings(snap, st, force=False):
    """Edge-triggered: fires when a reading crosses a line, and again only
    when it crosses back and returns. No repeat while it simply stays there."""
    reg = snap.get("regime") or {}
    macro = snap.get("macro") or {}
    vix = (macro.get("vix") or {}).get("price")

    checks = [
        (
            "vix_high",
            vix is not None and vix >= 25,
            "😰 <b>VIX %s</b> — ความผันผวนพุ่งสูง ตลาดกำลังกลัวค่ะ" % vix,
            "😌 <b>VIX %s</b> — ความผันผวนกลับลงต่ำกว่า 25 แล้วค่ะ" % vix,
        ),
        (
            "breadth50_weak",
            reg.get("breadth_50") is not None and reg["breadth_50"] < 40,
            "📉 <b>หุ้นเหนือ MA50 เหลือ %s%%</b> — หุ้นส่วนใหญ่หลุดเส้นระยะกลางค่ะ"
            % reg.get("breadth_50"),
            "📈 <b>หุ้นเหนือ MA50 กลับขึ้นเกิน 40%%</b> (%s%%) ค่ะ" % reg.get("breadth_50"),
        ),
        (
            "breadth200_weak",
            reg.get("breadth_200") is not None and reg["breadth_200"] < 50,
            "📉 <b>หุ้นเหนือ MA200 เหลือ %s%%</b> — แนวโน้มระยะยาวเริ่มเสียค่ะ"
            % reg.get("breadth_200"),
            "📈 <b>หุ้นเหนือ MA200 กลับขึ้นเกิน 50%%</b> (%s%%) ค่ะ" % reg.get("breadth_200"),
        ),
        (
            "curve_inverted",
            reg.get("curve_10y_3m") is not None and reg["curve_10y_3m"] < 0,
            "🏦 <b>เส้นผลตอบแทนกลับหัว</b> (10 ปี ต่ำกว่า 3 เดือน %s) — "
            "ในอดีตมักมาก่อนภาวะถดถอยค่ะ" % reg.get("curve_10y_3m"),
            "🏦 <b>เส้นผลตอบแทนกลับมาปกติแล้ว</b> (%s) ค่ะ" % reg.get("curve_10y_3m"),
        ),
    ]

    lines = []
    for name, is_on, on_text, off_text in checks:
        was_on = bool(st["indicators"].get(name))
        if force:
            lines.append(on_text if is_on else off_text)
            continue
        if is_on and not was_on:
            lines.append(on_text)
        elif was_on and not is_on:
            lines.append(off_text)
        st["indicators"][name] = bool(is_on)

    if not lines:
        return None
    head = ["🚨 <b>สัญญาณเตือนจากอินดิเคเตอร์ค่ะ</b>", stamp(), "", RULE, ""]
    if force:
        head.append("<i>ตัวอย่าง — นี่คือสถานะปัจจุบันของทุกตัวชี้วัดค่ะ</i>")
        head.append("")
    return "\n".join(head + lines + ["", RULE, "", DISCLAIMER])


def daily_summary(snap):
    macro = snap.get("macro") or {}
    reg = snap.get("regime") or {}
    stocks = snap.get("stocks") or {}

    ICONS = {"set": "🇹🇭", "spx": "🇺🇸", "vix": "😰", "dxy": "💵", "us10y": "🏦"}
    NAMES = {
        "set": "SET · หุ้นไทย",
        "spx": "S&P 500 · หุ้นสหรัฐฯ",
        "vix": "VIX · ความผันผวน",
        "dxy": "Dollar Index",
        "us10y": "พันธบัตรสหรัฐฯ 10 ปี",
    }

    msg = [greeting(), stamp(), "", "สรุปภาพรวมตลาดให้แล้วนะคะ 📋", "", RULE, "",
           "📊 <b>ดัชนีหลัก</b>"]
    for key in ("set", "spx", "vix", "dxy", "us10y"):
        m = macro.get(key)
        if not m:
            continue
        msg.append(
            "%s %s\n     <b>%s</b>  %s %s"
            % (ICONS[key], NAMES[key], price(m.get("price")),
               mark(m.get("d1")), pct(m.get("d1")))
        )

    b50, b200 = reg.get("breadth_50"), reg.get("breadth_200")
    if b50 is not None and b200 is not None:
        msg += ["", "🌡 <b>สุขภาพตลาด</b>",
                "▫️ ยืนเหนือ MA50 · <b>%s%%</b>" % b50,
                "▫️ ยืนเหนือ MA200 · <b>%s%%</b>" % b200,
                "     <i>จากหุ้น %s ตัวที่ติดตามอยู่</i>" % reg.get("breadth_n")]

    moved = [(s.get("chg_pct"), t) for t, s in stocks.items() if s.get("chg_pct") is not None]
    if moved:
        moved.sort(reverse=True)
        up = [m for m in moved if m[0] > 0][:3]
        dn = [m for m in moved if m[0] < 0][-3:]
        if up:
            msg += ["", "🟢 <b>ขึ้นแรงสุด</b>"]
            msg += ["🔺 <b>%s</b> %s" % (esc(t), pct(c)) for c, t in up]
        if dn:
            msg += ["", "🔴 <b>ลงแรงสุด</b>"]
            msg += ["🔻 <b>%s</b> %s" % (esc(t), pct(c)) for c, t in reversed(dn)]

    msg += ["", RULE, "", DISCLAIMER, "ขอให้เป็นวันที่ดีค่ะ 🙏"]
    return "\n".join(msg)


def daily_fx(snap):
    ccy = snap.get("ccy") or {}
    thb = ccy.get("THB")
    if not thb or not thb.get("rate"):
        return None
    rate = thb["rate"]

    msg = [
        "💱 <b>อัพเดทค่าเงินประจำวันค่ะ</b>",
        stamp(),
        "",
        RULE,
        "",
        "🇹🇭 <b>เงินบาท</b>",
        "     1 USD = <b>%.2f THB</b>  %s %s" % (rate, mark(thb.get("d1")), pct(thb.get("d1"))),
        "▫️ 1 เดือน · %s" % pct(thb.get("m1")),
        "▫️ ตั้งแต่ต้นปี · %s" % pct(thb.get("ytd")),
        "     <i>ตัวเลขบวก = บาทอ่อนค่า (ใช้บาทมากขึ้นต่อ 1 ดอลลาร์)</i>",
    ]

    crosses = [("EUR", "🇪🇺", "ยูโร"), ("JPY", "🇯🇵", "เยน"),
               ("GBP", "🇬🇧", "ปอนด์"), ("CNY", "🇨🇳", "หยวน")]
    rows = []
    for code, flag, name in crosses:
        c = ccy.get(code)
        if not c or not c.get("rate"):
            continue
        # every rate is "units per USD", so THB per unit is the ratio
        per = rate / c["rate"]
        unit = "100 JPY" if code == "JPY" else "1 " + code
        shown = per * 100 if code == "JPY" else per
        rows.append("%s %s (%s) = <b>%.2f THB</b>" % (flag, unit, name, shown))
    if rows:
        msg += ["", "🌏 <b>สกุลอื่นคิดเป็นเงินบาท</b>"] + rows

    msg += ["", RULE, "", DISCLAIMER]
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


def welcome():
    return "\n".join([
        "✨ <b>ยินดีที่ได้ดูแลค่ะ %s</b>" % OWNER,
        stamp(),
        "",
        "ดิฉันเป็นผู้ช่วยจาก SPACEZ TERMINAL",
        "จะคอยรายงานความเคลื่อนไหวให้นะคะ 💼",
        "",
        RULE,
        "",
        "📬 <b>สิ่งที่จะส่งให้</b>",
        "🔔 สัญญาณกลับทิศ · เมื่อมีสัญญาณ<b>ใหม่</b>",
        "📢 ราคาขยับแรงเกิน %g%% · วันละครั้งต่อตัว" % MOVE_PCT,
        "🚨 อินดิเคเตอร์เตือน · เฉพาะตอนค่าข้ามเส้น",
        "📊 สรุปตลาด + 💱 ค่าเงิน · ทุกวัน %02d:00 น." % ((DAILY_HOUR_UTC + 7) % 24),
        "",
        RULE,
        "",
        "<i>สัญญาณที่ค้างอยู่ก่อนหน้านี้ ดิฉันบันทึกว่ารับทราบแล้ว "
        "เพื่อไม่ให้ข้อความแรกท่วมนะคะ</i>",
        "",
        "ด้านล่างคือตัวอย่างรายงานประจำวันค่ะ 👇",
    ])


def test_banner():
    return "\n".join([
        "🧪 <b>ทดสอบระบบแจ้งเตือนค่ะ %s</b>" % OWNER,
        stamp(),
        "",
        "ดิฉันจะส่งตัวอย่างข้อความ<b>ทุกแบบ</b>ให้ดูนะคะ",
        "ข้อความชุดนี้เป็นการทดสอบ ไม่ได้บันทึกลงระบบ",
        "และไม่กระทบการแจ้งเตือนจริงค่ะ",
        "",
        RULE,
    ])


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
    day = today.isoformat()
    first_run = not os.path.exists(STATE_FILE)
    st = load_state()

    if DRY_RUN:
        print("DRY RUN - no credentials, or ALERT_DRY_RUN=1. Nothing will be sent.")
    print("snapshot generated_at=%s  enabled=%s%s"
          % (snap.get("generated_at"), ",".join(sorted(ENABLED)),
             "  TEST MODE" if TEST_MODE else ""))

    # ------------------------------------------------ one-off test send ----
    # Sends a sample of every message type using the real snapshot, without
    # reading or writing the saved state, so a test can never make a real
    # alert go missing later.
    if TEST_MODE:
        blank = {"sent": {}, "indicators": {}, "last_daily": "", "last_fx": ""}
        send(test_banner())
        turn, _ = turn_signals(snap, blank, today, force=True)
        move, _ = big_moves(snap, blank, today, force=True)
        for msg in (turn, move, indicator_warnings(snap, blank, force=True),
                    daily_summary(snap), daily_fx(snap)):
            if msg:
                send(msg)
        send("✅ <b>ทดสอบเสร็จเรียบร้อยค่ะ</b>\nระบบพร้อมทำงานตามปกตินะคะ 🙏")
        print("test mode: sent the sample set, state untouched")
        return 0

    if first_run:
        bootstrap(snap, st, day)
        for msg in (welcome(), daily_summary(snap), daily_fx(snap)):
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
