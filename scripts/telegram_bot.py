#!/usr/bin/env python3
"""
Telegram command bot for the SPACEZ TERMINAL watchlist.

Polls Telegram's getUpdates for messages sent to the bot and turns
add / remove / edit / list / help commands into edits of
data/watchlist.json. Runs on its own fast schedule (see
.github/workflows/telegram-bot.yml) so a command feels answered within a
few minutes rather than waiting on the 30-minute market-data cycle.

Understands both slash commands and plain Thai/English phrasing, plus the
/start deep-link payload Telegram sends when someone taps a
t.me/<bot>?start=... button from the website's watchlist page.

MULTI-USER
----------
Anyone who finds the bot can talk to it - there is no single-chat gate
anymore. Each Telegram chat gets its own watchlist, keyed by chat id, in
data/watchlist.json under "users". The website itself cannot read a chat
id (it is a static site with no login), so a separate step ties a browser
to a chat: the site generates a random id for itself, opens
t.me/<bot>?start=link_<that id>, and this bot records the (site id -> chat
id) pairing in data/telegram_links.json when it sees that payload. The
site then looks its own id up in that file to know which chat's watchlist
to display.

A per-chat cap (ALERT_WATCHLIST_MAX, default 20) keeps one enthusiastic
user from filling the file or tripping Telegram's rate limits now that
anyone can add to it.

CREDENTIALS
-----------
TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID come from the environment only,
supplied by GitHub Actions from repository Secrets - never written into
this file, this repository is public. TELEGRAM_CHAT_ID is no longer a
gate on who the bot listens to; it is used only once, automatically, to
carry the old single-user data (the pre-upgrade flat watchlist.json) over
into its owner's own per-chat bucket the first time this runs.
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
WATCHLIST_FILE = os.path.join(ROOT, "data", "watchlist.json")
LINKS_FILE = os.path.join(ROOT, "data", "telegram_links.json")
BOT_STATE_FILE = os.path.join(ROOT, "data", "bot_state.json")

ICT = timezone(timedelta(hours=7))
SITE_URL = "https://spacez001.github.io/TERMINAL/SPACEZ_TERMINAL.html"
BOT_USERNAME = "spacez_terminal_alert_bot"

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()  # legacy-migration only, see module docstring
DRY_RUN = os.environ.get("ALERT_DRY_RUN", "").strip() == "1" or not TOKEN

try:
    MOVE_PCT_DEFAULT = float(os.environ.get("ALERT_MOVE_PCT", "").strip() or 5.0)
except ValueError:
    MOVE_PCT_DEFAULT = 5.0

try:
    WATCHLIST_MAX = int(os.environ.get("ALERT_WATCHLIST_MAX", "").strip() or 20)
except ValueError:
    WATCHLIST_MAX = 20

RULE = "━━━━━━━━━━━━━━━━━━━"


# --------------------------------------------------------------- helpers ---
def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def pct(v, digits=2):
    if v is None:
        return "-"
    return ("%+." + str(digits) + "f%%") % v


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


def stamp():
    dt = now_ict()
    return "🗓 %02d:%02d น." % (dt.hour, dt.minute)


def site_link(ticker):
    return SITE_URL + "?stock=" + urllib.parse.quote(ticker) + "#/stock"


# ------------------------------------------------------------------ json ---
def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def save_json(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write("\n")
    os.replace(tmp, path)


def load_watchlist():
    """Returns (wl, migrated). wl looks like:
    {"users": {"<chat_id>": {"tickers": {...}, "updated_at": "..."}}, ...}
    Transparently upgrades the old single-user flat format (a bare
    "tickers" dict at the top level) into the owner's own bucket the first
    time this runs post-upgrade, using TELEGRAM_CHAT_ID to know whose data
    it was. migrated is True the one time that happened, so the caller can
    persist the new shape right away instead of waiting for the next edit."""
    wl = load_json(WATCHLIST_FILE, {"users": {}, "updated_at": ""})
    migrated = "users" not in wl
    if migrated:
        legacy = wl.get("tickers") or {}
        old_updated = wl.get("updated_at", "")
        wl = {"users": {}, "updated_at": old_updated}
        if legacy and CHAT_ID:
            wl["users"][str(CHAT_ID)] = {"tickers": legacy, "updated_at": old_updated}
    wl.setdefault("users", {})
    return wl, migrated


def save_watchlist(wl):
    wl["updated_at"] = datetime.now(timezone.utc).isoformat()
    save_json(WATCHLIST_FILE, wl)


def user_bucket(wl, chat_id):
    key = str(chat_id)
    bucket = wl["users"].setdefault(key, {"tickers": {}, "updated_at": ""})
    bucket.setdefault("tickers", {})
    return bucket


def load_links():
    data = load_json(LINKS_FILE, {"links": {}, "updated_at": ""})
    data.setdefault("links", {})
    return data


def save_links(data):
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    save_json(LINKS_FILE, data)


def load_stocks():
    """Ticker -> row, upper-cased keys. None if the snapshot cannot be read,
    in which case ticker validation is skipped rather than blocking commands."""
    snap = load_json(SNAPSHOT, None)
    if not snap or not isinstance(snap.get("stocks"), dict):
        return None
    return {k.upper(): v for k, v in snap["stocks"].items()}


# --------------------------------------------------------------- telegram --
def api(method, params):
    if DRY_RUN:
        print("DRY RUN api(%s) params=%s" % (method, params))
        return None
    url = "https://api.telegram.org/bot%s/%s" % (TOKEN, method)
    data = urllib.parse.urlencode(params).encode()
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=25) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        if not body.get("ok"):
            print("telegram refused %s: %s" % (method, body.get("description")))
            return None
        return body.get("result")
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("description", "")
        except Exception:
            detail = ""
        print("telegram HTTP %s %s (%s)" % (exc.code, detail, method))
        return None
    except Exception as exc:
        print("telegram unreachable (%s): %s" % (method, type(exc).__name__))
        return None


def get_updates(offset):
    return api(
        "getUpdates",
        {
            "offset": offset,
            "timeout": 0,
            "allowed_updates": json.dumps(["message"]),
        },
    )


def send(chat_id, text):
    if DRY_RUN:
        print("\n----- would reply to %s -----" % chat_id)
        print(text)
        print("------------------------")
        return True
    return api(
        "sendMessage",
        {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": "true",
        },
    ) is not None


# --------------------------------------------------------- command verbs ---
ADD_WORDS = {"add", "watch", "เพิ่ม", "เพิ่มหุ้น", "ปักหมุด"}
DEL_WORDS = {"remove", "delete", "unwatch", "ลบ", "ลบหุ้น", "ถอด", "ถอดหุ้น"}
EDIT_WORDS = {"edit", "set", "threshold", "แก้ไข", "แก้", "ตั้งค่า"}
LIST_WORDS = {"list", "watchlist", "รายการ", "วอทช์ลิสต์", "ดูวอทช์ลิสต์", "ดูหุ้น"}
HELP_WORDS = {"help", "ช่วยเหลือ", "คำสั่ง", "วิธีใช้"}
RESET_WORDS = {"default", "reset", "ค่าเริ่มต้น", "ปกติ"}


def find_ticker(raw, stocks):
    """Exact match first (case-insensitive since everything is upper-cased
    already), falls back to accepting it unvalidated if the snapshot could
    not be read at all."""
    t = raw.upper().lstrip("$")
    if stocks is None:
        return t, True
    return t, t in stocks


def help_text():
    return "\n".join([
        "🤖 <b>คำสั่งวอทช์ลิสต์ค่ะ</b>",
        stamp(),
        "",
        RULE,
        "",
        "➕ <b>เพิ่มหุ้น</b>",
        "    <code>เพิ่ม PTT</code>  หรือ  <code>/add PTT</code>",
        "",
        "➖ <b>เอาออก</b>",
        "    <code>ลบ PTT</code>  หรือ  <code>/remove PTT</code>",
        "",
        "⚙️ <b>ตั้งเกณฑ์แจ้งเตือนเฉพาะตัว (%)</b>",
        "    <code>แก้ไข PTT 3</code>  → แจ้งเมื่อขยับเกิน 3%%",
        "    <code>แก้ไข PTT ค่าเริ่มต้น</code>  → กลับไปใช้ค่ากลาง (%g%%)" % MOVE_PCT_DEFAULT,
        "",
        "📋 <b>ดูรายการ</b>",
        "    <code>รายการ</code>  หรือ  <code>/list</code>",
        "",
        RULE,
        "",
        "หรือกดปุ่มปักหมุด/เอาออกจากหน้าเว็บได้เลย จะเปิดมาที่นี่ให้กดยืนยันอีกทีค่ะ 👍",
        "วอทช์ลิสต์นี้ผูกกับแชทนี้เท่านั้นค่ะ ใครทักบอทมาก็มีของตัวเองแยกกัน",
    ])


def link_confirmed_text():
    return "\n".join([
        "🔗 <b>เชื่อมต่อกับหน้าเว็บเรียบร้อยแล้วค่ะ</b>",
        stamp(),
        "",
        "จากนี้วอทช์ลิสต์ที่หน้าเว็บจะเป็นของแชทนี้โดยเฉพาะ",
        "กลับไปที่หน้าเว็บแล้วรีเฟรชได้เลยนะคะ (ถ้าเพิ่งกดอาจต้องรอสักครู่)",
        "",
        "พิมพ์ <code>เพิ่ม PTT</code> เพื่อเริ่มได้เลยค่ะ",
    ])


def cmd_add(chat_id, wl, ticker, ok, stocks):
    bucket = user_bucket(wl, chat_id)
    if ticker in bucket["tickers"]:
        send(chat_id, "👀 <b>%s</b> อยู่ในวอทช์ลิสต์อยู่แล้วค่ะ" % esc(ticker))
        return
    if not ok:
        send(
            chat_id,
            "🤔 ไม่พบ <b>%s</b> ในระบบข้อมูลค่ะ ลองพิมพ์ <code>รายการ</code> "
            "เพื่อดูตัวอย่างหุ้นที่มีก่อนได้นะคะ" % esc(ticker)
        )
        return
    if len(bucket["tickers"]) >= WATCHLIST_MAX:
        send(
            chat_id,
            "🙏 วอทช์ลิสต์เต็ม <b>%d ตัว</b> แล้วค่ะ ลบตัวที่ไม่ตามแล้วออกก่อนนะคะ "
            "(<code>ลบ ชื่อหุ้น</code>) ถึงจะเพิ่มตัวใหม่ได้" % WATCHLIST_MAX
        )
        return
    bucket["tickers"][ticker] = {
        "added_at": datetime.now(timezone.utc).isoformat(),
        "alert_pct": None,
    }
    save_watchlist(wl)
    row = (stocks or {}).get(ticker) or {}
    lines = ["✅ <b>เพิ่ม %s เข้าวอทช์ลิสต์แล้วค่ะ</b>" % esc(ticker), stamp(), ""]
    name = (row.get("name") or "").strip()
    if name:
        lines.append("🏷 %s" % esc(name))
    if row.get("price") is not None:
        lines.append(
            "💰 %s  %s"
            % (price(row.get("price")), pct(row.get("chg_pct")))
        )
    lines += ["", "จากนี้จะช่วยจับตาความเคลื่อนไหวของตัวนี้เป็นพิเศษให้นะคะ 👀",
              "🔗 " + site_link(ticker)]
    send(chat_id, "\n".join(lines))


def cmd_remove(chat_id, wl, ticker):
    bucket = user_bucket(wl, chat_id)
    if ticker not in bucket["tickers"]:
        send(chat_id, "🤔 ไม่มี <b>%s</b> ในวอทช์ลิสต์อยู่แล้วค่ะ" % esc(ticker))
        return
    del bucket["tickers"][ticker]
    save_watchlist(wl)
    send(chat_id, "🗑 <b>เอา %s ออกจากวอทช์ลิสต์แล้วค่ะ</b>" % esc(ticker))


def cmd_edit(chat_id, wl, ticker, rest):
    bucket = user_bucket(wl, chat_id)
    if ticker not in bucket["tickers"]:
        send(
            chat_id,
            "🤔 <b>%s</b> ยังไม่อยู่ในวอทช์ลิสต์ค่ะ พิมพ์ <code>เพิ่ม %s</code> ก่อนนะคะ"
            % (esc(ticker), esc(ticker))
        )
        return
    if not rest:
        send(chat_id, "พิมพ์เกณฑ์เป็นตัวเลข %% ต่อท้ายด้วยค่ะ เช่น <code>แก้ไข %s 3</code>" % esc(ticker))
        return
    word = rest[0].strip().lower()
    if word in RESET_WORDS:
        bucket["tickers"][ticker]["alert_pct"] = None
        save_watchlist(wl)
        send(chat_id, "♻️ <b>%s</b> กลับไปใช้เกณฑ์กลาง (%g%%) แล้วค่ะ" % (esc(ticker), MOVE_PCT_DEFAULT))
        return
    try:
        p = float(word.replace("%", ""))
        if p <= 0 or p > 100:
            raise ValueError
    except ValueError:
        send(chat_id, "ขอเป็นตัวเลข %% ระหว่าง 0-100 นะคะ เช่น <code>แก้ไข %s 3</code>" % esc(ticker))
        return
    bucket["tickers"][ticker]["alert_pct"] = p
    save_watchlist(wl)
    send(chat_id, "⚙️ <b>%s</b> จะแจ้งเตือนเมื่อขยับเกิน <b>%g%%</b> ต่อจากนี้ค่ะ" % (esc(ticker), p))


def cmd_list(chat_id, wl, stocks):
    bucket = user_bucket(wl, chat_id)
    tickers = sorted(bucket["tickers"].keys())
    if not tickers:
        send(
            chat_id,
            "📋 <b>วอทช์ลิสต์ว่างอยู่ค่ะ</b>\n\n"
            "พิมพ์ <code>เพิ่ม PTT</code> หรือกดปักหมุดจากหน้าเว็บได้เลยนะคะ"
        )
        return
    lines = ["📋 <b>วอทช์ลิสต์ของคุณ (%d ตัว)</b>" % len(tickers), stamp(), "", RULE, ""]
    for t in tickers:
        row = (stocks or {}).get(t) or {}
        extra = bucket["tickers"][t].get("alert_pct")
        bit = " · เกณฑ์ %g%%" % extra if extra else ""
        if row:
            lines.append(
                "▫️ <b>%s</b> %s %s%s"
                % (esc(t), price(row.get("price")), pct(row.get("chg_pct")), bit)
            )
        else:
            lines.append("▫️ <b>%s</b>%s" % (esc(t), bit))
    lines += ["", RULE, "", "🔗 ดูรายละเอียดทั้งหมด: " + SITE_URL + "#/watchlist"]
    send(chat_id, "\n".join(lines))


def handle_link(chat_id, uid):
    """/start link_<uid>: ties the browser that generated `uid` to this
    chat, so the static website (which cannot otherwise know who is
    looking at it) can find this chat's own watchlist bucket."""
    if not uid:
        send(chat_id, help_text())
        return
    links = load_links()
    links["links"][uid] = {
        "chat_id": str(chat_id),
        "linked_at": datetime.now(timezone.utc).isoformat(),
    }
    save_links(links)
    send(chat_id, link_confirmed_text())


def handle_text(chat_id, text, wl, stocks):
    text = (text or "").strip()
    if not text:
        return
    tokens = text.split()
    verb = tokens[0].lower().lstrip("/").split("@")[0]

    if verb == "start":
        payload = tokens[1] if len(tokens) > 1 else ""
        if payload.startswith("link_"):
            handle_link(chat_id, payload[5:])
            return
        if payload.startswith("add_"):
            ticker, ok = find_ticker(payload[4:], stocks)
            cmd_add(chat_id, wl, ticker, ok, stocks)
            return
        if payload.startswith("remove_"):
            ticker, _ = find_ticker(payload[7:], stocks)
            cmd_remove(chat_id, wl, ticker)
            return
        send(chat_id, help_text())
        return

    if verb in ADD_WORDS:
        if len(tokens) < 2:
            send(chat_id, "พิมพ์ตามด้วยชื่อหุ้นด้วยค่ะ เช่น <code>เพิ่ม PTT</code>")
            return
        ticker, ok = find_ticker(tokens[1], stocks)
        cmd_add(chat_id, wl, ticker, ok, stocks)
        return

    if verb in DEL_WORDS:
        if len(tokens) < 2:
            send(chat_id, "พิมพ์ตามด้วยชื่อหุ้นด้วยค่ะ เช่น <code>ลบ PTT</code>")
            return
        ticker, _ = find_ticker(tokens[1], stocks)
        cmd_remove(chat_id, wl, ticker)
        return

    if verb in EDIT_WORDS:
        if len(tokens) < 2:
            send(chat_id, "พิมพ์ตามด้วยชื่อหุ้นด้วยค่ะ เช่น <code>แก้ไข PTT 3</code>")
            return
        ticker, _ = find_ticker(tokens[1], stocks)
        cmd_edit(chat_id, wl, ticker, tokens[2:])
        return

    if verb in LIST_WORDS:
        cmd_list(chat_id, wl, stocks)
        return

    if verb in HELP_WORDS:
        send(chat_id, help_text())
        return

    send(
        chat_id,
        "🤔 ไม่แน่ใจว่าหมายถึงคำสั่งไหนค่ะ พิมพ์ <code>ช่วยเหลือ</code> "
        "เพื่อดูคำสั่งทั้งหมดได้เลยนะคะ"
    )


# ------------------------------------------------------------------ main ---
def main():
    if DRY_RUN:
        print("DRY RUN - no bot token. Nothing will be polled or sent.")
        return 0

    bot_state = load_json(BOT_STATE_FILE, {"offset": 0})
    updates = get_updates(bot_state.get("offset", 0))
    if updates is None:
        print("could not reach telegram, will retry next run")
        return 0

    stocks = load_stocks()
    wl, migrated = load_watchlist()
    if migrated:
        save_watchlist(wl)
    highest = bot_state.get("offset", 0) - 1
    handled = 0

    for u in updates:
        uid = u.get("update_id")
        if isinstance(uid, int) and uid > highest:
            highest = uid
        msg = u.get("message")
        if not msg:
            continue
        chat = msg.get("chat") or {}
        chat_id = chat.get("id")
        if chat_id is None:
            continue
        handle_text(chat_id, msg.get("text", ""), wl, stocks)
        handled += 1

    if highest >= bot_state.get("offset", 0) - 1:
        bot_state["offset"] = highest + 1
    save_json(BOT_STATE_FILE, bot_state)
    print("polled: %d update(s), %d handled" % (len(updates), handled))
    return 0


if __name__ == "__main__":
    sys.exit(main())
