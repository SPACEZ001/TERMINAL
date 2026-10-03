/**
 * SPACEZ TERMINAL — LINE QR session-linking backend.
 *
 * Deployed as a single Cloudflare Worker (paste this whole file into the
 * dashboard's "Edit code" editor for the Worker — no build step, no other
 * files needed). Requires one KV namespace bound as SESSIONS, and these
 * Variables/Secrets set under the Worker's Settings:
 *
 *   LINE_LOGIN_CHANNEL_ID       (Variable, plain text — not sensitive, it's
 *                                the OAuth "client_id", already visible in
 *                                the QR code's URL anyway)
 *   LINE_LOGIN_CHANNEL_SECRET   (Secret — used only in the server-side token
 *                                exchange below, never sent to the browser)
 *   REDIRECT_URI                (Variable — this Worker's own
 *                                https://<name>.<subdomain>.workers.dev/callback
 *                                URL. Must exactly match the Callback URL
 *                                registered on the LINE Login channel.)
 *   ALLOWED_ORIGIN               (Variable — the frontend origin(s) allowed
 *                                to call this API, e.g.
 *                                https://spacez001.github.io -- or, since
 *                                Round S6d, a COMMA-SEPARATED list when the
 *                                site is mirrored on more than one host, e.g.
 *                                https://spacez001.github.io,https://terminal.spacezblack.workers.dev
 *                                The actual Access-Control-Allow-Origin sent
 *                                back is whichever one of these matches the
 *                                real incoming request's Origin header --
 *                                see pickAllowedOrigin()/withCorsOrigin()
 *                                near the bottom of this file.)
 *   ADMIN_USERS_KEY              (Secret — a password you make up, used ONLY
 *                                by the site's "Connected Users" admin page.
 *                                Deliberately separate from the site's own
 *                                50-field admin code: that code is checked
 *                                entirely in the browser and proves nothing
 *                                to this Worker, so the admin list/edit
 *                                endpoints below need their own real,
 *                                server-checked secret. Set this to any long
 *                                random string and enter that same string
 *                                once in the Connected Users page.)
 *
 *   FMP_KEY                       (Secret — a free Financial Modeling Prep
 *                                API key, from https://site.financial
 *                                modelingprep.com/register, no card needed.
 *                                Powers the site's Economic Calendar page
 *                                for EVERY visitor, server-side, so nobody
 *                                has to paste their own key just to see it.
 *                                Get one key, paste it in here once; it is
 *                                never sent to the browser. NOTE: an
 *                                earlier build of this Worker used a
 *                                FINNHUB_KEY secret for this same feature --
 *                                Finnhub's free plan turned out to block
 *                                the economic-calendar endpoint entirely, so
 *                                this was switched to FMP. A leftover
 *                                FINNHUB_KEY secret is harmless to leave in
 *                                place; this file no longer reads it.)
 *
 *   OWNER_WATCHLIST_KEY is no longer used by this file (see below) but you
 *   don't need to remove it from the Worker's settings -- it's harmless to
 *   leave it there.
 *
 *   TELEGRAM_LOGIN_BOT_TOKEN      (Secret — from a NEW, separate Telegram bot
 *                                made via @BotFather just for this login, not
 *                                the site's existing watchlist bot. See the
 *                                "TELEGRAM LOGIN" section further down in
 *                                this file for the full one-time setup,
 *                                including the one setWebhook call it needs.)
 *   TELEGRAM_LOGIN_BOT_USERNAME   (Variable — that bot's @username, no @,
 *                                used to build the QR's t.me deep link. Not
 *                                sensitive, same reasoning as
 *                                LINE_LOGIN_CHANNEL_ID above.)
 *   TELEGRAM_LOGIN_WEBHOOK_SECRET (Secret — any long random string you make
 *                                up yourself; proves a /telegram-webhook call
 *                                really came from Telegram.)
 *
 * WHAT THIS DOES
 * --------------
 * 1. The site asks for a new session code (/api/session/new). This Worker
 *    makes one, stores it in KV as "pending", and hands back a LINE Login
 *    authorize URL with that code as the OAuth `state` — the site renders
 *    that URL as a QR code.
 * 2. Whoever scans it with their phone's camera / LINE app approves the
 *    LINE Login consent screen, and LINE redirects their phone's browser to
 *    this Worker's /callback with an authorization `code` + the original
 *    `state`. This Worker exchanges that code for LINE's own access token
 *    (server-side only — the channel secret never leaves this Worker),
 *    fetches the LINE profile, and marks that session as "linked".
 * 3. Meanwhile the ORIGINAL browser tab (the one that showed the QR code)
 *    has been polling /api/session/status?code=... every couple of
 *    seconds. Once it sees "linked" it calls /api/session/data?code=...
 *    to get that person's own tracked tickers, and shows them.
 * 4. A session stays linked for SESSION_TTL_SECONDS so a page refresh
 *    doesn't force a re-scan; only an explicit logout (the site clearing
 *    its own stored code) or the TTL expiring requires scanning again.
 *
 * PER-PERSON DATA (changed from the very first version of this file)
 * --------------------------------------------------------------------
 * Every LINE login used to hand back the SAME fixed watchlist (the site
 * owner's own, read from data/watchlist.json on GitHub) -- a LINE login only
 * proved "this is really the owner's phone". Now each distinct LINE account
 * (identified by LINE's own `userId`, which never changes for that person)
 * gets its OWN watchlist, stored right here in the SESSIONS KV namespace
 * under the key "wl:<userId>" -- completely separate from the Telegram bot's
 * per-chat lists in data/watchlist.json, and separate from every other LINE
 * account. Nobody sees anyone else's list; nobody's LINE login can touch the
 * site's own content or settings (that still requires the separate admin
 * password login elsewhere on the site, which this file has nothing to do
 * with).
 *
 * LIKES ON JOURNAL POSTS
 * -----------------------
 * A visitor who has linked LINE can "like" a published journal/analysis
 * entry. Each entry's likes are stored under "like:<postId>" as a plain
 * array of {userId, displayName, pictureUrl, likedAt}. Reading who liked a
 * post (GET /api/likes) needs no login -- anyone can see the list, same as
 * likes on any public post elsewhere. Only *adding or removing your own*
 * like (POST /api/likes/toggle) needs a linked LINE session, so nobody can
 * like a post as somebody else.
 *
 * CONNECTED-USERS ADMIN PAGE
 * --------------------------
 * Every account that ever completes a LINE login gets a small persistent
 * "profile:<userId>" record here (display name/photo -- kept fresh on every
 * login even after a 30-day session expires -- a UID, an optional access-
 * until date, and self-editable Facebook/Instagram handles), and its userId
 * is added to a "users:index" list. GET /api/admin/users reads that whole
 * index and returns everyone's profile + holdings; POST /api/admin/users/update
 * lets the admin set a person's UID or access-until date. Both endpoints
 * check the request's X-Admin-Key header against env.ADMIN_USERS_KEY --
 * this is a real server-side secret, separate from the site's own client-
 * side admin code, since this data (other people's names/photos/holdings)
 * must never be servable to just anyone who finds this Worker's URL.
 * A UID is auto-generated (random 5-7 digits) the first time someone logs
 * in; the admin can change it to anything memorable (their own, say) later.
 * POST /api/session/profile is the one self-service write a LINE-linked
 * visitor can make without the admin key -- their own Facebook/Instagram
 * handles, gated the same way as watchlist add/remove (a valid linked
 * session code, checked via getLinkedSession).
 */

const PENDING_TTL_SECONDS = 5 * 60;          // time to scan the QR before it expires
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // how long a linked session stays valid

const MAX_TICKERS_PER_USER = 60;   // generous personal-list cap, mirrors the Telegram bot's own limit
const MAX_TICKER_LEN = 12;
const MAX_LIKES_PER_POST = 2000;   // defensive cap, not a real-world limit for this site

function randomCode() {
  // 24 random bytes, base64url-encoded -> a 32-char unguessable session id.
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Vary": "Origin",
  };
}

function json(data, env, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(env) },
  });
}

function html(body, status = 200) {
  return new Response(
    "<!doctype html><html lang=\"th\"><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
      "<title>SPACEZ TERMINAL</title>" +
      "<body style=\"font-family:system-ui,sans-serif;background:#0b0e14;color:#e8e8e8;" +
      "display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;\">" +
      "<div style=\"max-width:420px;\">" + body + "</div></body></html>",
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

/* Looks up a session by its browser-side code and returns it only if it is
   actually linked (not pending/expired/missing) -- every mutation below
   goes through this first, so nobody can add tickers or like a post without
   a real completed LINE login. Returns null on any failure. */
async function getLinkedSession(code, env) {
  if (!code) return null;
  const raw = await env.SESSIONS.get("sess:" + code);
  if (!raw) return null;
  let sess;
  try { sess = JSON.parse(raw); } catch (e) { return null; }
  if (sess.status !== "linked" || !sess.userId) return null;
  return sess;
}

function sanitizeTicker(t) {
  if (typeof t !== "string") return null;
  const clean = t.trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
  if (!clean || clean.length > MAX_TICKER_LEN) return null;
  return clean;
}

async function getUserWatchlist(userId, env) {
  const raw = await env.SESSIONS.get("wl:" + userId);
  if (!raw) return {};
  try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
}

async function putUserWatchlist(userId, tickers, env) {
  await env.SESSIONS.put("wl:" + userId, JSON.stringify(tickers));
}

/* ---------------------- per-user profile (Connected Users) ---------------------- */

const MAX_SOCIAL_LEN = 80;
const MAX_NAME_OVERRIDE_LEN = 40;
const MAX_NOTE_LEN = 280;

function randomUid(len) {
  // random string of `len` digits, never starting with 0 -- auto-assigned
  // the first time someone logs in; the admin can freely change it after.
  let s = String(1 + Math.floor(Math.random() * 9));
  for (let i = 1; i < len; i++) s += String(Math.floor(Math.random() * 10));
  return s;
}

// Auto-generated UIDs start at 5-7 digits; if every random draw at a given
// length collides with someone already in the index (only plausible once
// there are thousands of accounts), this grows one digit at a time rather
// than looping forever on the same crowded range.
async function generateUniqueUid(env) {
  const ids = await getUserIndex(env);
  const taken = new Set();
  for (const id of ids) {
    const p = await getProfile(id, env);
    if (p && p.uid) taken.add(p.uid);
  }
  let len = 5 + Math.floor(Math.random() * 3);
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = randomUid(len);
    if (!taken.has(candidate)) return candidate;
    if ((attempt + 1) % 20 === 0) len++; // crowded at this length -- widen the range
  }
  return randomUid(len + 4); // astronomically unlikely fallback
}

function sanitizeUid(v) {
  if (typeof v !== "string") return null;
  const clean = v.trim().replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
  return clean || null;
}

function sanitizeSocial(v) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, MAX_SOCIAL_LEN);
}

// A visitor's own override of their displayed name on the Home page's
// personal LINE card (defaults to their real LINE display name if they
// never set one) -- plain text, no markup, just length-capped like the
// social handles above.
function sanitizeNameOverride(v) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, MAX_NAME_OVERRIDE_LEN);
}

// The free-text "about me" note on that same card. Newlines are kept
// (it's a short paragraph, not a single-line field like the socials).
function sanitizeNote(v) {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n/g, "\n").trim().slice(0, MAX_NOTE_LEN);
}

function sanitizeDate(v) {
  // expects "YYYY-MM-DD" or null/empty to clear it
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return undefined; // undefined = invalid
  return v.trim();
}

async function getProfile(userId, env) {
  const raw = await env.SESSIONS.get("profile:" + userId);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function putProfile(userId, profile, env) {
  await env.SESSIONS.put("profile:" + userId, JSON.stringify(profile));
}

async function getUserIndex(env) {
  const raw = await env.SESSIONS.get("users:index");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

async function addUserToIndex(userId, env) {
  const ids = await getUserIndex(env);
  if (ids.indexOf(userId) === -1) {
    ids.push(userId);
    await env.SESSIONS.put("users:index", JSON.stringify(ids));
  }
}

/* Called after every successful LINE login (handleCallback). Keeps the
   profile's name/photo fresh, assigns a UID the very first time, and never
   overwrites fields the admin or the user already set. */
async function upsertProfileOnLogin(userId, displayName, pictureUrl, env) {
  const existing = await getProfile(userId, env);
  // generateUniqueUid scans the index -- add this user to it AFTER that scan
  // so a first-time login never sees (and can never collide with) itself.
  const uid = (existing && existing.uid) || (await generateUniqueUid(env));
  await addUserToIndex(userId, env);
  const profile = {
    uid,
    displayName: displayName || (existing && existing.displayName) || "",
    pictureUrl: pictureUrl || (existing && existing.pictureUrl) || "",
    facebook: (existing && existing.facebook) || "",
    instagram: (existing && existing.instagram) || "",
    nameOverride: (existing && existing.nameOverride) || "",
    note: (existing && existing.note) || "",
    accessUntil: (existing && existing.accessUntil) || null,
    // "rights" is a purely decorative badge for now (see handleAdminUsersUpdate) --
    // one of the RIGHTS_LEVELS ids, or null for the plain Free look. Admin-only,
    // never touched by the user or by login.
    rights: (existing && existing.rights) || null,
    linkedAt: (existing && existing.linkedAt) || Date.now(),
    updatedAt: Date.now(),
  };
  await putProfile(userId, profile, env);
  return profile;
}

// Kept in sync with the site's own membership tiers (TIERS in the
// #membership module) plus one extra, site-only "admin" badge -- so a UID's
// assigned "rights" always maps to a real, recognizable label.
const RIGHTS_LEVELS = ["member", "pass", "ultra", "cryptolab", "stocklab", "academy", "admin"];

function sanitizeRights(v) {
  if (v === null) return null;
  if (typeof v !== "string") return undefined; // undefined = invalid
  return RIGHTS_LEVELS.indexOf(v) !== -1 ? v : undefined;
}

function isAdminKeyValid(request, env) {
  const key = request.headers.get("X-Admin-Key") || "";
  return !!env.ADMIN_USERS_KEY && key === env.ADMIN_USERS_KEY;
}

/* provider: "line" (default, unchanged behavior) or "telegram" (Round R --
   a second, independent QR login, see the TELEGRAM LOGIN section below).
   Both providers share this one session code + KV row shape ({status,
   createdAt} -> later {status:"linked", userId, displayName, pictureUrl,
   linkedAt}) and every endpoint below this one (/api/session/status,
   /api/session/data, /api/session/logout, /api/session/profile, likes) --
   they only ever read/write by the session's own code or its generic
   userId, so NONE of them needed to change for Telegram to work; only
   how a session gets FROM "pending" TO "linked" differs (LINE: this
   Worker's own /callback below, via LINE's OAuth redirect. Telegram:
   /telegram-webhook further down, via Telegram calling this Worker
   directly the moment someone taps Start on the bot). */
async function handleNewSession(request, env) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") === "telegram" ? "telegram" : "line";
  const code = randomCode();
  await env.SESSIONS.put(
    "sess:" + code,
    JSON.stringify({ status: "pending", provider, createdAt: Date.now() }),
    { expirationTtl: PENDING_TTL_SECONDS }
  );

  if (provider === "telegram") {
    if (!env.TELEGRAM_LOGIN_BOT_USERNAME) {
      return json({ error: "not_configured" }, env, 501);
    }
    const loginUrl =
      "https://t.me/" + env.TELEGRAM_LOGIN_BOT_USERNAME + "?start=" + encodeURIComponent("login_" + code);
    return json({ code, loginUrl, expiresIn: PENDING_TTL_SECONDS }, env);
  }

  const authorizeUrl =
    "https://access.line.me/oauth2/v2.1/authorize" +
    "?response_type=code" +
    "&client_id=" + encodeURIComponent(env.LINE_LOGIN_CHANNEL_ID) +
    "&redirect_uri=" + encodeURIComponent(env.REDIRECT_URI) +
    "&state=" + encodeURIComponent(code) +
    "&scope=" + encodeURIComponent("profile openid") +
    "&bot_prompt=normal";
  return json({ code, loginUrl: authorizeUrl, expiresIn: PENDING_TTL_SECONDS }, env);
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const authCode = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const lineError = url.searchParams.get("error");

  if (lineError) {
    return html(
      "<h2>เข้าสู่ระบบไม่สำเร็จ</h2><p>LINE ปฏิเสธการเข้าสู่ระบบ (" +
        (url.searchParams.get("error_description") || lineError) +
        ") ปิดหน้านี้แล้วลองสแกนใหม่อีกครั้งได้เลยค่ะ</p>"
    );
  }
  if (!authCode || !state) {
    return html("<h2>ลิงก์ไม่ถูกต้อง</h2><p>ไม่พบรหัสเซสชัน กรุณาสแกน QR ใหม่อีกครั้งค่ะ</p>", 400);
  }

  const raw = await env.SESSIONS.get("sess:" + state);
  if (!raw) {
    return html("<h2>QR หมดอายุแล้ว</h2><p>กรุณากลับไปที่เว็บแล้วขอ QR ใหม่อีกครั้งค่ะ</p>", 400);
  }

  try {
    const tokenResp = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: env.REDIRECT_URI,
        client_id: env.LINE_LOGIN_CHANNEL_ID,
        client_secret: env.LINE_LOGIN_CHANNEL_SECRET,
      }),
    });
    if (!tokenResp.ok) {
      const errBody = await tokenResp.text();
      console.log("line token exchange failed", tokenResp.status, errBody);
      return html("<h2>เข้าสู่ระบบไม่สำเร็จ</h2><p>ไม่สามารถยืนยันตัวตนกับ LINE ได้ ลองใหม่อีกครั้งนะคะ</p>", 502);
    }
    const tokenData = await tokenResp.json();

    const profileResp = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: "Bearer " + tokenData.access_token },
    });
    if (!profileResp.ok) {
      return html("<h2>เข้าสู่ระบบไม่สำเร็จ</h2><p>ดึงข้อมูลโปรไฟล์ LINE ไม่สำเร็จ ลองใหม่อีกครั้งนะคะ</p>", 502);
    }
    const profile = await profileResp.json();

    await env.SESSIONS.put(
      "sess:" + state,
      JSON.stringify({
        status: "linked",
        userId: profile.userId,
        displayName: profile.displayName || "",
        pictureUrl: profile.pictureUrl || "",
        linkedAt: Date.now(),
      }),
      { expirationTtl: SESSION_TTL_SECONDS }
    );

    // keep the persistent Connected-Users record fresh (name/photo, UID
    // assigned on first login) -- independent of this session's own TTL,
    // so the admin list still shows this person after their session expires.
    await upsertProfileOnLogin(profile.userId, profile.displayName || "", profile.pictureUrl || "", env);

    return html(
      "<div style=\"font-size:40px;margin-bottom:8px;\">✅</div>" +
        "<h2>เชื่อมต่อสำเร็จค่ะ</h2>" +
        "<p>สวัสดีค่ะคุณ " + (profile.displayName || "") +
        " กลับไปที่หน้าเว็บที่เปิดไว้ได้เลย ข้อมูลของคุณจะขึ้นให้อัตโนมัติ</p>" +
        "<p style=\"opacity:.6;font-size:13px;\">ปิดหน้านี้ได้เลยค่ะ</p>"
    );
  } catch (err) {
    console.log("callback error", err && err.message);
    return html("<h2>เกิดข้อผิดพลาด</h2><p>ลองสแกน QR ใหม่อีกครั้งนะคะ</p>", 500);
  }
}

async function handleStatus(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const raw = code && (await env.SESSIONS.get("sess:" + code));
  if (!raw) return json({ status: "not_found" }, env);
  const sess = JSON.parse(raw);
  return json({ status: sess.status, displayName: sess.displayName || null, pictureUrl: sess.pictureUrl || null }, env);
}

async function handleData(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const sess = await getLinkedSession(code, env);
  if (!sess) {
    // distinguish "never heard of this code" from "exists but not linked yet"
    const raw = code && (await env.SESSIONS.get("sess:" + code));
    return json({ error: raw ? "not_linked" : "not_found" }, env, raw ? 401 : 404);
  }
  const wl = await getUserWatchlist(sess.userId, env);
  const tickers = Object.keys(wl);
  const profile = await getProfile(sess.userId, env);
  const likedIds = await getUserLikedPostIds(sess.userId, env);
  return json({
    displayName: sess.displayName || null,
    pictureUrl: sess.pictureUrl || null,
    tickers,
    uid: profile ? profile.uid : null,
    facebook: profile ? profile.facebook || "" : "",
    instagram: profile ? profile.instagram || "" : "",
    nameOverride: profile ? profile.nameOverride || "" : "",
    note: profile ? profile.note || "" : "",
    accessUntil: profile ? profile.accessUntil || null : null,
    // Decorative tier badge (see RIGHTS_META on the frontend's Connected Users
    // page) -- exposed on the visitor's own self-service session data too so
    // their personal nav-bar card can color itself to match, same as the
    // admin-only Connected Users list already shows for this user.
    rights: profile ? profile.rights || null : null,
    // How many Asset Analysis Log posts this visitor has liked -- shown as a
    // small stat on their own personal LINE card.
    likedCount: likedIds.length,
  }, env);
}

async function handleWatchlistAdd(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const sess = await getLinkedSession(body.code, env);
  if (!sess) return json({ error: "not_linked" }, env, 401);
  const ticker = sanitizeTicker(body.ticker);
  if (!ticker) return json({ error: "invalid_ticker" }, env, 400);

  const wl = await getUserWatchlist(sess.userId, env);
  if (!wl[ticker] && Object.keys(wl).length >= MAX_TICKERS_PER_USER) {
    return json({ error: "list_full", tickers: Object.keys(wl) }, env, 400);
  }
  wl[ticker] = { addedAt: Date.now() };
  await putUserWatchlist(sess.userId, wl, env);
  return json({ tickers: Object.keys(wl) }, env);
}

async function handleWatchlistRemove(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const sess = await getLinkedSession(body.code, env);
  if (!sess) return json({ error: "not_linked" }, env, 401);
  const ticker = sanitizeTicker(body.ticker);
  if (!ticker) return json({ error: "invalid_ticker" }, env, 400);

  const wl = await getUserWatchlist(sess.userId, env);
  delete wl[ticker];
  await putUserWatchlist(sess.userId, wl, env);
  return json({ tickers: Object.keys(wl) }, env);
}

/* ---------------------------- likes ---------------------------- */

async function getPostLikes(postId, env) {
  const raw = await env.SESSIONS.get("like:" + postId);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

// Reverse index: which post ids a given user has liked, so a visitor's own
// "N posts liked" count (shown on their personal LINE card) doesn't require
// scanning every "like:<postId>" key in KV -- maintained alongside that key
// in handleLikeToggle, never written anywhere else.
async function getUserLikedPostIds(userId, env) {
  const raw = await env.SESSIONS.get("userlikes:" + userId);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
async function putUserLikedPostIds(userId, ids, env) {
  await env.SESSIONS.put("userlikes:" + userId, JSON.stringify(ids));
}

async function handleLikesGet(request, env) {
  const url = new URL(request.url);
  const postId = (url.searchParams.get("postId") || "").trim();
  if (!postId) return json({ error: "bad_request" }, env, 400);
  const code = url.searchParams.get("code") || "";
  const likes = await getPostLikes(postId, env);
  let youLiked = false;
  if (code) {
    const sess = await getLinkedSession(code, env);
    if (sess) youLiked = likes.some(function (l) { return l.userId === sess.userId; });
  }
  return json({
    likes: likes.map(function (l) { return { displayName: l.displayName, pictureUrl: l.pictureUrl }; }),
    count: likes.length,
    youLiked: youLiked,
  }, env);
}

async function handleLikeToggle(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const sess = await getLinkedSession(body.code, env);
  if (!sess) return json({ error: "not_linked" }, env, 401);
  const postId = (body.postId || "").trim();
  if (!postId) return json({ error: "bad_request" }, env, 400);

  let likes = await getPostLikes(postId, env);
  const idx = likes.findIndex(function (l) { return l.userId === sess.userId; });
  let youLiked;
  if (idx >= 0) {
    likes.splice(idx, 1);
    youLiked = false;
  } else {
    if (likes.length >= MAX_LIKES_PER_POST) return json({ error: "limit_reached" }, env, 400);
    likes.push({
      userId: sess.userId,
      displayName: sess.displayName || "",
      pictureUrl: sess.pictureUrl || "",
      likedAt: Date.now(),
    });
    youLiked = true;
  }
  await env.SESSIONS.put("like:" + postId, JSON.stringify(likes));

  // keep this user's own liked-post-id index in sync with the toggle above
  let likedIds = await getUserLikedPostIds(sess.userId, env);
  const likedIdx = likedIds.indexOf(postId);
  if (youLiked && likedIdx === -1) likedIds.push(postId);
  if (!youLiked && likedIdx !== -1) likedIds.splice(likedIdx, 1);
  await putUserLikedPostIds(sess.userId, likedIds, env);

  return json({
    likes: likes.map(function (l) { return { displayName: l.displayName, pictureUrl: l.pictureUrl }; }),
    count: likes.length,
    youLiked: youLiked,
  }, env);
}

/* ------------------- self-service profile edit (LINE-linked visitor) ------------------- */

async function handleProfileUpdate(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const sess = await getLinkedSession(body.code, env);
  if (!sess) return json({ error: "not_linked" }, env, 401);

  let profile = await getProfile(sess.userId, env);
  if (!profile) profile = await upsertProfileOnLogin(sess.userId, sess.displayName || "", sess.pictureUrl || "", env);

  if (typeof body.facebook === "string") profile.facebook = sanitizeSocial(body.facebook);
  if (typeof body.instagram === "string") profile.instagram = sanitizeSocial(body.instagram);
  // Both optional and independent of the socials above -- the Home page's
  // personal LINE card sends these, the Watchlist page's own edit panel
  // never does, so neither call site has to know about the other's fields.
  if (typeof body.nameOverride === "string") profile.nameOverride = sanitizeNameOverride(body.nameOverride);
  if (typeof body.note === "string") profile.note = sanitizeNote(body.note);
  profile.updatedAt = Date.now();
  await putProfile(sess.userId, profile, env);

  return json({
    ok: true, uid: profile.uid,
    facebook: profile.facebook || "", instagram: profile.instagram || "",
    nameOverride: profile.nameOverride || "", note: profile.note || "",
  }, env);
}

/* ------------------------- admin: Connected Users page ------------------------- */

async function handleAdminUsersList(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  const ids = await getUserIndex(env);
  const users = [];
  for (const userId of ids) {
    const profile = await getProfile(userId, env);
    if (!profile) continue;
    const wl = await getUserWatchlist(userId, env);
    // Same live/not-live check the presence beacon writes (see
    // handlePresencePing above) -- a plain KV existence check, cheap next to
    // the profile/watchlist reads already happening in this loop.
    const presenceKey = await env.SESSIONS.get(PRESENCE_USER_KEY_PREFIX + userId);
    users.push({
      userId,
      uid: profile.uid || null,
      displayName: profile.displayName || "",
      pictureUrl: profile.pictureUrl || "",
      facebook: profile.facebook || "",
      instagram: profile.instagram || "",
      accessUntil: profile.accessUntil || null,
      rights: profile.rights || null,
      linkedAt: profile.linkedAt || null,
      tickers: Object.keys(wl),
      online: !!presenceKey,
    });
  }
  return json({ users }, env);
}

async function handleAdminUsersUpdate(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const userId = (body.userId || "").trim();
  if (!userId) return json({ error: "bad_request" }, env, 400);
  const profile = await getProfile(userId, env);
  if (!profile) return json({ error: "not_found" }, env, 404);

  if (typeof body.uid === "string") {
    const uid = sanitizeUid(body.uid);
    if (!uid) return json({ error: "invalid_uid" }, env, 400);
    if (uid !== profile.uid) {
      const ids = await getUserIndex(env);
      for (const otherId of ids) {
        if (otherId === userId) continue;
        const other = await getProfile(otherId, env);
        if (other && other.uid === uid) return json({ error: "uid_taken" }, env, 400);
      }
    }
    profile.uid = uid;
  }

  if ("accessUntil" in body) {
    const d = sanitizeDate(body.accessUntil);
    if (d === undefined) return json({ error: "invalid_date" }, env, 400);
    profile.accessUntil = d;
  }

  if ("rights" in body) {
    const r = sanitizeRights(body.rights);
    if (r === undefined) return json({ error: "invalid_rights" }, env, 400);
    profile.rights = r;
  }

  profile.updatedAt = Date.now();
  await putProfile(userId, profile, env);
  return json({ ok: true, profile }, env);
}

/* ---------------------- LINE Official Account broadcast ----------------------
   Separate from the LINE LOGIN channel (env.LINE_LOGIN_CHANNEL_ID/SECRET) used
   everywhere else in this file -- this calls the LINE MESSAGING API on the
   admin's LINE Official Account, using a distinct secret
   (env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, a long-lived channel access token
   from the Messaging API tab of that OA's channel in the LINE Developers
   Console). "Broadcast" sends to every friend of that OA -- exactly the
   "people who added my LINE as a friend" audience the admin asked for, no
   per-recipient targeting needed. Gated by the same X-Admin-Key header as the
   other /api/admin/* endpoints. */
async function handleAdminBroadcast(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  if (!env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
    return json({ error: "messaging_not_configured" }, env, 400);
  }
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const text = String(body.text || "").trim().slice(0, 1000);
  if (!text) return json({ error: "bad_request" }, env, 400);
  // Optional: the post's own saved imageUrl, forwarded to LINE as-is (never
  // fetched or re-hosted here) so friends see the chart/screenshot, not just
  // a bare link. LINE requires https and fetches it directly from wherever
  // it's already stored (e.g. Firebase Storage), so anything else is dropped
  // rather than sent broken.
  const imageUrl = String(body.imageUrl || "").trim();
  const messages = [];
  if (imageUrl && /^https:\/\//i.test(imageUrl)) {
    messages.push({ type: "image", originalContentUrl: imageUrl, previewImageUrl: imageUrl });
  }
  messages.push({ type: "text", text });

  let resp;
  try {
    resp = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
      },
      body: JSON.stringify({ messages }),
    });
  } catch (e) {
    return json({ error: "network" }, env, 502);
  }
  if (!resp.ok) {
    let detail = "";
    try { detail = await resp.text(); } catch (e) {}
    return json({ error: "line_api_error", status: resp.status, detail: detail.slice(0, 500) }, env, 502);
  }
  return json({ ok: true }, env);
}

// ---- Journal feed display settings (Round K) ----
// Was a client-side `settings/journal` Firestore doc, gated only by the
// journal admin page's own Firebase-Auth sign-in. That sign-in proves
// nothing to Firestore's own security rules, and (unlike journal_entries,
// which has its own explicit rule) there was never a matching rule for the
// `settings` collection, so every save silently hit Firestore's default
// deny and came back as "could not save". Moved here instead, next to every
// other piece of this site's own admin-controlled state (profiles, rights,
// broadcast) that already goes through this Worker's KV store rather than
// Firestore rules. Reads are public (every visitor's feed needs to know
// whether to show likers/stats), writes need the same X-Admin-Key as the
// rest of this admin surface.
const JOURNAL_SETTINGS_KV_KEY = "journalsettings:main";
const JOURNAL_SETTINGS_DEFAULT = {
  showLikers: true,
  statsVisible: { total: true, month: true, top: true, accuracy: true },
};

function normalizeJournalSettings(v) {
  v = v && typeof v === "object" ? v : {};
  const sv = v.statsVisible && typeof v.statsVisible === "object" ? v.statsVisible : {};
  return {
    showLikers: v.showLikers !== false,
    statsVisible: {
      total: sv.total !== false,
      month: sv.month !== false,
      top: sv.top !== false,
      accuracy: sv.accuracy !== false,
    },
  };
}

async function handleJournalSettingsGet(request, env) {
  let data = JOURNAL_SETTINGS_DEFAULT;
  try {
    const raw = await env.SESSIONS.get(JOURNAL_SETTINGS_KV_KEY);
    if (raw) data = normalizeJournalSettings(JSON.parse(raw));
  } catch (e) {}
  return json(data, env);
}

async function handleJournalSettingsUpdate(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const data = normalizeJournalSettings(body);
  await env.SESSIONS.put(JOURNAL_SETTINGS_KV_KEY, JSON.stringify(data));
  return json({ ok: true, data }, env);
}

// Round K8: "how many people are on the site right now" gauge for the
// admin panel. Every page load pings this with a random per-tab id (see
// the site-wide presence-beacon script near the end of the HTML file);
// each ping just re-writes that id's KV entry with a short TTL, so a
// closed tab or a dead connection ages out on its own within ~90s without
// needing any cleanup job. The count is simply "how many of those keys
// are still live" -- deliberately not a list of who they are, since a
// bare visitor count isn't sensitive the way the Connected Users list is,
// so the ping itself needs no admin key; only the count read for the
// admin panel does.
const PRESENCE_KEY_PREFIX = "presence:";
const PRESENCE_USER_KEY_PREFIX = "presenceUser:";
const PRESENCE_TTL_SECONDS = 180; // matches the front end's slower ping interval
                                   // (assets/js/part-59.js) -- see the note there on
                                   // why this write volume is kept low

// Round T: same beacon, one more optional write. When the visitor sending
// this ping is logged in (LINE or Telegram), the front end also sends their
// own session code -- the same short-lived opaque token already used for
// every other self-service call (watchlist add/remove, profile update...),
// never the raw LINE/Telegram userId itself, which stays server-side. That
// code is resolved to sess.userId here (same lookup getLinkedSession()
// already does for those other endpoints) and refreshes a
// presenceUser:<userId> key with the same short TTL. That's what lets the
// Connected Users admin list show "online now" per person -- an anonymous
// visitor still sends no code and gets no identity tracked (the plain
// presence:<id> key above is untouched and still needs no admin key), and
// the per-user key only ever exists for someone already in users:index, so
// this adds no new PII, just a live/not-live flag next to data the admin
// key already gates.
async function handlePresencePing(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const id = (body && typeof body.id === "string" ? body.id : "").slice(0, 128);
  if (!id) return json({ error: "bad_request" }, env, 400);
  await env.SESSIONS.put(PRESENCE_KEY_PREFIX + id, "1", { expirationTtl: PRESENCE_TTL_SECONDS });
  const code = (body && typeof body.code === "string" ? body.code : "").slice(0, 128);
  if (code) {
    const sess = await getLinkedSession(code, env);
    if (sess && sess.userId) {
      await env.SESSIONS.put(PRESENCE_USER_KEY_PREFIX + sess.userId, "1", { expirationTtl: PRESENCE_TTL_SECONDS });
    }
  }
  return json({ ok: true }, env);
}

async function handleAdminPresenceCount(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  let count = 0;
  let cursor;
  // A KV list() page tops out at 1000 keys; loop a few pages just in case
  // this small personal site ever somehow has that much concurrent
  // traffic, capped so a bug elsewhere can never turn this into a runaway
  // loop against KV.
  for (let i = 0; i < 20; i++) {
    const page = await env.SESSIONS.list({ prefix: PRESENCE_KEY_PREFIX, cursor });
    count += page.keys.length;
    if (page.list_complete || !page.cursor) break;
    cursor = page.cursor;
  }
  return json({ count }, env);
}

// ---------------------------------------------------------------------
// ECONOMIC CALENDAR (Round M) — proxies a free calendar feed so EVERY
// visitor sees it with zero setup of their own, instead of each person
// needing to paste their own key into the page (the site's stock-quote
// panel still works that way, but she asked for this one feature to
// "just work" for anyone who opens the page).
//
// Round M6: switched the upstream provider from Finnhub to Financial
// Modeling Prep (FMP). Finnhub's free plan turned out to block
// /calendar/economic outright ("You don't have access to this
// resource") -- confirmed live, not just from docs -- so a free
// Finnhub key alone was never going to make this endpoint work. FMP's
// free plan (250 requests/day, ~150-country economic calendar coverage)
// is not called out as a premium-only dataset in their docs, unlike
// endpoints explicitly flagged "Premium". This Worker holds ONE FMP key
// as a Secret (FMP_KEY, set the same way as ADMIN_USERS_KEY) and calls
// FMP server-side; nothing here needs a login or an admin key since the
// data itself is public macro news, not anything private to a visitor.
//
// FMP's raw response uses different field names than the site's client
// code expects (date/previous instead of time/prev, capitalized impact
// strings, etc.), so this function normalizes every event into the
// exact same {event, country, impact, estimate, actual, prev, time,
// unit} shape the page's existing calendar UI already renders --
// meaning the client-side calendar code needs no changes at all.
// ---------------------------------------------------------------------
const ECONCAL_CACHE_TTL_SECONDS = 900; // 15 min -- calendar data doesn't
  // change minute to minute, and this keeps well inside FMP's free-tier
  // daily request limit even with many concurrent site visitors, since
  // they all now share these few cached KV reads instead of each calling
  // FMP directly.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeEconEvent(raw) {
  var impactRaw = String((raw && raw.impact) || "").toLowerCase();
  var impact = (impactRaw === "high" || impactRaw === "medium" || impactRaw === "low") ? impactRaw : "";
  function num(v) {
    if (typeof v === "number" && isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && isFinite(Number(v))) return Number(v);
    return null;
  }
  return {
    event: (raw && raw.event) || "",
    country: (raw && raw.country) || "",
    impact: impact,
    estimate: num(raw && raw.estimate),
    actual: num(raw && raw.actual),
    prev: num(raw && raw.previous),
    time: (raw && raw.date) || "",
    unit: "",
  };
}

async function handleEconCalendar(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return json({ error: "bad_request" }, env, 400);
  }
  if (!env.FMP_KEY) {
    // Not configured yet -- tell the page plainly rather than a bare 500,
    // so its own UI can explain this is a one-time setup step for her.
    return json({ error: "not_configured" }, env, 501);
  }

  const cacheKey = "econcal:fmp:" + from + ":" + to;
  const cached = await env.SESSIONS.get(cacheKey, "json");
  if (cached) return json(cached, env);

  let upstream;
  try {
    const res = await fetch(
      "https://financialmodelingprep.com/stable/economic-calendar?from=" + from + "&to=" + to +
        "&apikey=" + encodeURIComponent(env.FMP_KEY)
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    upstream = await res.json();
  } catch (e) {
    return json({ error: "upstream" }, env, 502);
  }

  const rawEvents = Array.isArray(upstream) ? upstream : ((upstream && upstream.economicCalendar) || []);
  const events = rawEvents.map(normalizeEconEvent);
  await env.SESSIONS.put(cacheKey, JSON.stringify({ economicCalendar: events }), {
    expirationTtl: ECONCAL_CACHE_TTL_SECONDS,
  });
  return json({ economicCalendar: events }, env);
}

// ---------------------------------------------------------------------
// ANNOUNCEMENTS (Round N) — a small admin-managed notice board shown in two
// places on the site: a bar in the page header and a slide-in card inside
// the "what would your portfolio look like" popup. Everything lives as one
// JSON list under a single KV key (low write frequency, small payload --
// no need for the per-item key scheme the user index uses). The public GET
// only ever returns items that have not expired; every /api/admin/* route
// below reuses the same X-Admin-Key gate as Connected Users and the LINE
// broadcast, so this needs no new secret -- her existing ADMIN_USERS_KEY
// already covers it.
// ---------------------------------------------------------------------
const ANNOUNCEMENTS_KV_KEY = "announcements:list";
const ANNOUNCEMENTS_MAX = 30; // keep the stored list bounded
const ANNOUNCEMENT_TEXT_MAX = 2000; // raised from 500 per her request -- some notices run long
// Round S: expired items used to only be HIDDEN from display (announcementIsActive)
// -- the record itself sat in KV forever until she deleted it by hand. This purges
// an item for real once it has been expired this long, no cron trigger needed:
// every call to getAnnouncementsList() (every public GET, admin list, and every
// create/update/delete, since they all read the list first) sweeps it lazily.
const ANNOUNCEMENT_PURGE_AFTER_DAYS = 30;
const ANNOUNCEMENT_PURGE_AFTER_MS = ANNOUNCEMENT_PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000;

async function getAnnouncementsList(env) {
  const raw = await env.SESSIONS.get(ANNOUNCEMENTS_KV_KEY, "json");
  const list = Array.isArray(raw) ? raw : [];
  const now = Date.now();
  const kept = list.filter((a) => !(a.expiresAt && now - a.expiresAt > ANNOUNCEMENT_PURGE_AFTER_MS));
  if (kept.length !== list.length) {
    // fire-and-forget the write-back; never let a KV hiccup here break a read
    try { await env.SESSIONS.put(ANNOUNCEMENTS_KV_KEY, JSON.stringify(kept)); } catch (e) {}
  }
  return kept;
}
async function putAnnouncementsList(list, env) {
  await env.SESSIONS.put(ANNOUNCEMENTS_KV_KEY, JSON.stringify(list.slice(0, ANNOUNCEMENTS_MAX)));
}
function announcementIsActive(a, now) {
  return !a.expiresAt || a.expiresAt > now;
}
function sanitizeDurationMin(v) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null; // null = no auto-expiry (admin deletes it manually)
}
function sanitizeImageUrl(v) {
  const s = String(v || "").trim();
  return s && /^https:\/\//i.test(s) ? s : "";
}
// Round O: where this shows up on the main site -- 'bar' (default, the strip
// under the header ticker) or 'modal' (an immediate center-screen popup, no
// click needed). The portfolio-popup overlay is unaffected either way; it
// always shows every active item regardless of this field.
function sanitizeDisplayMode(v) {
  return v === "modal" ? "modal" : "bar";
}

async function handleAnnouncementsPublic(request, env) {
  const list = await getAnnouncementsList(env);
  const now = Date.now();
  const items = list
    .filter((a) => announcementIsActive(a, now))
    .map((a) => ({ id: a.id, text: a.text, imageUrl: a.imageUrl || "", createdAt: a.createdAt, expiresAt: a.expiresAt || null, displayMode: sanitizeDisplayMode(a.displayMode) }));
  return json({ items }, env);
}

async function handleAdminAnnouncementsList(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  const list = await getAnnouncementsList(env);
  return json({ items: list }, env);
}

async function handleAdminAnnouncementsCreate(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const text = String(body.text || "").trim().slice(0, ANNOUNCEMENT_TEXT_MAX);
  if (!text) return json({ error: "bad_request" }, env, 400);
  const now = Date.now();
  const durationMin = sanitizeDurationMin(body.durationMin);
  const item = {
    id: "ann_" + now.toString(36) + Math.random().toString(36).slice(2, 8),
    text,
    imageUrl: sanitizeImageUrl(body.imageUrl),
    displayMode: sanitizeDisplayMode(body.displayMode),
    createdAt: now,
    expiresAt: durationMin ? now + durationMin * 60000 : null,
  };
  const list = await getAnnouncementsList(env);
  list.unshift(item);
  await putAnnouncementsList(list, env);
  return json({ ok: true, item }, env);
}

async function handleAdminAnnouncementsUpdate(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const id = String(body.id || "");
  if (!id) return json({ error: "bad_request" }, env, 400);
  const list = await getAnnouncementsList(env);
  const item = list.find((a) => a.id === id);
  if (!item) return json({ error: "not_found" }, env, 404);

  if (typeof body.text === "string") {
    const text = body.text.trim().slice(0, ANNOUNCEMENT_TEXT_MAX);
    if (!text) return json({ error: "bad_request" }, env, 400);
    item.text = text;
  }
  if (typeof body.imageUrl === "string") item.imageUrl = sanitizeImageUrl(body.imageUrl);
  if (typeof body.displayMode === "string") item.displayMode = sanitizeDisplayMode(body.displayMode);
  // Editing resets the expiry clock from the moment of the edit -- simplest
  // rule to reason about (a fresh "durationMin from now"), rather than
  // trying to preserve/extend the original timer.
  if ("durationMin" in body) {
    const durationMin = sanitizeDurationMin(body.durationMin);
    item.expiresAt = durationMin ? Date.now() + durationMin * 60000 : null;
  }
  await putAnnouncementsList(list, env);
  return json({ ok: true, item }, env);
}

async function handleAdminAnnouncementsDelete(request, env) {
  if (!isAdminKeyValid(request, env)) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const id = String(body.id || "");
  if (!id) return json({ error: "bad_request" }, env, 400);
  let list = await getAnnouncementsList(env);
  const before = list.length;
  list = list.filter((a) => a.id !== id);
  if (list.length === before) return json({ error: "not_found" }, env, 404);
  await putAnnouncementsList(list, env);
  return json({ ok: true }, env);
}

// ---------------------------------------------------------------------
// ELLIOTT WAVE CLASSROOM content gate -- the lesson text/diagrams used to
// ship straight to every visitor inside part-65.js's own client JS, so the
// admin-only check on that page was only a show/hide switch: anyone could
// read the content from the downloaded file via devtools regardless of
// tier, even after the sessionStorage-forgery bug was closed. This moves
// the actual content into KV, served only after a real server-checked
// X-Admin-Key -- the same gate already used for Connected Users and
// Announcements, so it needs no new secret and no new KV binding: it
// reuses env.ADMIN_USERS_KEY and env.SESSIONS exactly as those do.
// content shape: { [nodeId]: { en: "<html>", th: "<html>" } }, written
// whole by the standalone local uploader tool (never shipped to the
// public site) and read whole by the classroom page itself.
// ---------------------------------------------------------------------
const CLASSROOM_CONTENT_KV_KEY = "classroom:content";

// Shared by every "local uploader tool" content-update route below
// (CLASSROOM_CONTENT_UPLOADER.html, CONTROLGRID_CONTENT_UPLOADER.html, and
// any future one): each is a standalone local-only HTML file opened straight
// off disk (file://) or from whatever localhost port happens to be free that
// day -- never from one of the site's own deployed origins. The shared
// corsHeaders()/pickAllowedOrigin() above only ever allow the site's own
// known origins (ALLOWED_ORIGIN), so a file:// request would be silently
// dropped by the BROWSER as a CORS failure before the X-Admin-Key check
// below even runs -- indistinguishable from a real network error, which is
// exactly the generic "Load failed" dead end this used to hit. These routes
// use a wildcard origin instead: that only controls who may READ the
// response in a browser, never who may call the endpoint (anyone could
// already curl it with no Origin header at all) -- the actual gate stays
// isAdminKeyValid() below, unchanged.
function localToolCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
  };
}
function localToolJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...localToolCorsHeaders() },
  });
}

async function getClassroomContent(env) {
  const raw = await env.SESSIONS.get(CLASSROOM_CONTENT_KV_KEY, "json");
  return raw && typeof raw === "object" ? raw : {};
}
async function putClassroomContent(content, env) {
  await env.SESSIONS.put(CLASSROOM_CONTENT_KV_KEY, JSON.stringify(content));
}

async function handleClassroomContent(request, env) {
  if (!isAdminKeyValid(request, env)) return localToolJson({ error: "unauthorized" }, 401);
  const content = await getClassroomContent(env);
  return localToolJson({ content });
}

async function handleAdminClassroomContentUpdate(request, env) {
  if (!isAdminKeyValid(request, env)) return localToolJson({ error: "unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return localToolJson({ error: "bad_request" }, 400); }
  const content = body && typeof body.content === "object" && body.content ? body.content : null;
  if (!content) return localToolJson({ error: "bad_request" }, 400);
  await putClassroomContent(content, env);
  return localToolJson({ ok: true });
}

// ---------------------------------------------------------------------
// CONTROL GRID content gate -- same reasoning and same pattern as the
// Elliott Wave Classroom above, applied to the "Who Controls the World's
// Money?" admin briefing (part-54.js). That page had NO content protection
// at all before this -- not even a client-side __SPZ_TIER() check -- so its
// full bilingual essay, the ten-spoke diagram data, the confirmed/
// speculation lists and the stats table were always present in the shipped
// JS regardless of tier. Single blob per language (the page has no node
// tree to preserve, unlike the classroom), still gated by the same
// ADMIN_USERS_KEY/env.SESSIONS -- no new secret or binding here either.
// ---------------------------------------------------------------------
const CONTROLGRID_CONTENT_KV_KEY = "controlgrid:content";

async function getControlGridContent(env) {
  const raw = await env.SESSIONS.get(CONTROLGRID_CONTENT_KV_KEY, "json");
  return raw && typeof raw === "object" ? raw : {};
}
async function putControlGridContent(content, env) {
  await env.SESSIONS.put(CONTROLGRID_CONTENT_KV_KEY, JSON.stringify(content));
}

async function handleControlGridContent(request, env) {
  if (!isAdminKeyValid(request, env)) return localToolJson({ error: "unauthorized" }, 401);
  const content = await getControlGridContent(env);
  return localToolJson({ content });
}

async function handleAdminControlGridContentUpdate(request, env) {
  if (!isAdminKeyValid(request, env)) return localToolJson({ error: "unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return localToolJson({ error: "bad_request" }, 400); }
  const content = body && typeof body.content === "object" && body.content ? body.content : null;
  if (!content) return localToolJson({ error: "bad_request" }, 400);
  await putControlGridContent(content, env);
  return localToolJson({ ok: true });
}

// ---------------------------------------------------------------------
// Round AB: Quiet Value Scanner -- unlike the Classroom/Control Grid, this
// page's "secret" was never static text, it's a scoring FORMULA (the
// value/quality/quiet/room weights and thresholds below) applied to the
// site's own public market snapshot. part-62.js had no server gate AND no
// client-side window.__SPZ_TIER() check at all -- it just computed the
// composite ranking straight in the browser from window.__SPZ_LIVE, so the
// formula itself (not just its output) was fully readable via view-source.
//
// Fix: the formula now runs HERE, never shipped to the browser. The raw
// input (data/market.json) is already public static data served by this
// site's own GitHub Pages, so there's nothing secret to protect in the
// fetch -- only in the math applied to it, which this endpoint keeps
// server-side and returns only the final top-12 result list for. No KV,
// no uploader tool: unlike the static-content pages, there's nothing to
// seed -- every authenticated request recomputes fresh off the live
// (30-minute-refreshed) snapshot.
// ---------------------------------------------------------------------
const QUIETVALUE_SNAPSHOT_URL = "https://spacez001.github.io/TERMINAL/data/market.json";

function qvIsNum(v) { return typeof v === "number" && isFinite(v); }
function qvClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

function qvPctRank(list, val, lowerIsBetter) {
  if (!list.length) return null;
  const beat = list.filter((x) => (lowerIsBetter ? x > val : x < val)).length;
  return (beat / list.length) * 100;
}

function qvValueScore(universePE, universePB, r) {
  let parts = [];
  if (qvIsNum(r.pe) && r.pe > 0 && universePE.length >= 8) parts.push(qvPctRank(universePE, r.pe, true));
  if (qvIsNum(r.pb) && r.pb > 0 && universePB.length >= 8) parts.push(qvPctRank(universePB, r.pb, true));
  parts = parts.filter((p) => p != null);
  if (!parts.length) return null;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

function qvQualityScore(universe, r) {
  let parts = [];
  if (qvIsNum(r.roe) && universe.roe.length >= 8) parts.push(qvPctRank(universe.roe, r.roe, false));
  if (qvIsNum(r.roic) && universe.roic.length >= 8) parts.push(qvPctRank(universe.roic, r.roic, false));
  if (qvIsNum(r.margin) && universe.margin.length >= 8) parts.push(qvPctRank(universe.margin, r.margin, false));
  parts = parts.filter((p) => p != null);
  if (!parts.length) return null;
  const base = parts.reduce((a, b) => a + b, 0) / parts.length;
  let penalty = 1;
  if (qvIsNum(r.de)) {
    if (r.de > 4) penalty = 0.55;
    else if (r.de > 2) penalty = 0.75;
    else if (r.de > 1) penalty = 0.9;
  }
  return { score: base * penalty, penalized: penalty < 1 };
}

function qvQuietScore(r) {
  if (!qvIsNum(r.rsi) || !qvIsNum(r.m1)) return null;
  return qvClamp(100 - qvClamp(Math.abs(r.rsi - 50) * 2, 0, 60) - qvClamp(Math.abs(r.m1) * 3, 0, 40), 0, 100);
}

function qvRoomScore(r) {
  if (!qvIsNum(r.off_high)) return null;
  const dist = Math.abs(r.off_high - -35);
  return qvClamp(100 - dist * 3, 0, 100);
}

function computeQuietValue(stocks) {
  const tickers = Object.keys(stocks);
  const universePE = [];
  const universePB = [];
  const universeQ = { roe: [], roic: [], margin: [] };
  tickers.forEach((t) => {
    const r = stocks[t];
    if (!r || r.stale) return;
    if (qvIsNum(r.pe) && r.pe > 0) universePE.push(r.pe);
    if (qvIsNum(r.pb) && r.pb > 0) universePB.push(r.pb);
    if (qvIsNum(r.roe)) universeQ.roe.push(r.roe);
    if (qvIsNum(r.roic)) universeQ.roic.push(r.roic);
    if (qvIsNum(r.margin)) universeQ.margin.push(r.margin);
  });

  const out = [];
  tickers.forEach((t) => {
    const r = stocks[t];
    if (!r || r.stale) return;
    const val = qvValueScore(universePE, universePB, r);
    if (val == null) return;
    const quiet = qvQuietScore(r);
    if (quiet == null) return;
    const room = qvRoomScore(r);
    if (room == null) return;
    const qual = qvQualityScore(universeQ, r);
    const qualScore = qual ? qual.score : 50;
    const composite = val * 0.35 + qualScore * 0.3 + quiet * 0.2 + room * 0.15;
    out.push({
      t,
      r: { name: r.name || "", sector: r.sector || "", rsi: r.rsi, m1: r.m1, off_high: r.off_high },
      val,
      qual: qual ? { penalized: qual.penalized } : null,
      qualScore,
      quiet,
      room,
      composite,
    });
  });

  out.sort((a, b) => b.composite - a.composite);
  return out.filter((x) => x.composite >= 60).slice(0, 12);
}

async function handleQuietValueResults(request, env) {
  if (!isAdminKeyValid(request, env)) return localToolJson({ error: "unauthorized" }, 401);
  let snap;
  try {
    const r = await fetch(QUIETVALUE_SNAPSHOT_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!r.ok) return localToolJson({ error: "snapshot_unavailable" }, 502);
    snap = await r.json();
  } catch (e) {
    return localToolJson({ error: "snapshot_unavailable" }, 502);
  }
  const stocks = snap && typeof snap.stocks === "object" ? snap.stocks : null;
  if (!stocks) return localToolJson({ error: "snapshot_unavailable" }, 502);
  let results;
  try {
    results = computeQuietValue(stocks);
  } catch (e) {
    return localToolJson({ error: "compute_failed" }, 500);
  }
  return localToolJson({ generated_at: snap.generated_at || null, results });
}

// ---------------------------------------------------------------------
// TELEGRAM LOGIN (Round R) — a second, independent QR login next to LINE,
// added per her request for "another way to log in besides LINE". Deliberately
// a SEPARATE bot from the site's existing watchlist bot (scripts/telegram_bot.py,
// polled every few minutes via GitHub Actions for /add /remove /list commands) --
// Telegram only lets a bot use EITHER getUpdates polling OR a webhook, never
// both, so pointing a webhook at the existing bot would silently break that
// already-working polling setup. This new bot exists purely so someone can
// tap "Start" and be logged in within a second or two, the same way LINE's
// QR scan feels instant.
//
// SETUP (one-time, see the top of this file for how LINE's own secrets are
// set the same way):
//   1. Create a new bot via @BotFather (/newbot) -- any name/username, it
//      only ever sends one confirmation message, nothing else.
//   2. Add to this Worker's Settings:
//        TELEGRAM_LOGIN_BOT_TOKEN     (Secret -- BotFather's token)
//        TELEGRAM_LOGIN_BOT_USERNAME  (Variable -- the bot's @username,
//                                       without the @, e.g. spacez_login_bot)
//        TELEGRAM_LOGIN_WEBHOOK_SECRET (Secret -- any long random string you
//                                       make up; Telegram echoes it back on
//                                       every webhook call so this Worker can
//                                       tell a real Telegram request apart
//                                       from anyone who finds this URL)
//   3. Point Telegram at this Worker (run once, from any machine with curl --
//      replace <TOKEN>, <SECRET>, and <worker-url> with your own):
//        curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<worker-url>/telegram-webhook&secret_token=<SECRET>"
//      A reply with "ok":true means it's live. No further setup needed --
//      Telegram now calls /telegram-webhook the instant anyone messages the
//      bot, for as long as this Worker is deployed at that URL.
//
// FLOW
// ----
// 1. Site calls GET /api/session/new?provider=telegram (see handleNewSession
//    above), gets back {code, loginUrl}, renders loginUrl as a QR exactly
//    like the LINE flow already does.
// 2. Visitor scans it -> opens Telegram -> t.me/<bot>?start=login_<code> ->
//    taps Start -> Telegram sends that as a /start message, and (because a
//    webhook is set) calls this Worker's /telegram-webhook immediately,
//    carrying that chat's id and Telegram profile name.
// 3. handleTelegramWebhook below marks sess:<code> "linked" with userId
//    "tg:<chat id>" and upserts a Connected-Users profile for it -- from
//    here on this session behaves exactly like a LINE session (same
//    /api/session/status polling, same /api/session/data shape, same
//    Connected Users admin list, same Member-tier access on the site).
// 4. This Worker replies to the chat so the person sees a confirmation
//    without needing to switch back to the browser first.
//
// No profile photo is fetched (Telegram requires a second/third API round
// trip -- getUserProfilePhotos, then getFile -- to turn a photo into a URL);
// left out for now since LINE's avatar already covers that need for anyone
// who wants a picture. Easy to add later without touching anything else here.
// ---------------------------------------------------------------------

async function tgSend(chatId, text, env) {
  if (!env.TELEGRAM_LOGIN_BOT_TOKEN) return;
  try {
    await fetch("https://api.telegram.org/bot" + env.TELEGRAM_LOGIN_BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    // best-effort only -- the login itself does not depend on this reply
  }
}

/* Telegram's own photo URLs are "https://api.telegram.org/file/bot<TOKEN>/<path>" --
   the bot token sits right in that URL, so it can never be handed to the
   browser directly (that would leak a live secret into a public <img src>).
   Instead we look up the visitor's largest profile photo file_id once at
   login time and store just that id; /api/telegram/avatar (below) fetches
   the actual bytes server-side, on demand, keeping the token server-only. */
async function tgFetchAvatarFileId(chatId, env) {
  if (!env.TELEGRAM_LOGIN_BOT_TOKEN) return "";
  try {
    const resp = await fetch(
      "https://api.telegram.org/bot" + env.TELEGRAM_LOGIN_BOT_TOKEN +
      "/getUserProfilePhotos?user_id=" + encodeURIComponent(chatId) + "&limit=1"
    );
    if (!resp.ok) return "";
    const data = await resp.json();
    const photos = data && data.result && data.result.photos;
    if (!photos || !photos.length || !photos[0] || !photos[0].length) return "";
    const sizes = photos[0];
    return sizes[sizes.length - 1].file_id || ""; // last = largest size
  } catch (e) {
    return "";
  }
}

/* GET /api/telegram/avatar?uid=tg:<chatId> -- streams the visitor's Telegram
   profile photo through this Worker so the token in Telegram's own file URL
   never reaches the browser. Re-resolves getFile on every request (file_path
   values can expire; the stored file_id does not) and is cheap to cache
   client-side, hence the long Cache-Control below. */
async function handleTelegramAvatar(request, env) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid") || "";
  if (!uid.startsWith("tg:") || !env.TELEGRAM_LOGIN_BOT_TOKEN) {
    return new Response("", { status: 404 });
  }
  try {
    const fileId = await env.SESSIONS.get("tgphoto:" + uid);
    if (!fileId) return new Response("", { status: 404 });
    const fileResp = await fetch(
      "https://api.telegram.org/bot" + env.TELEGRAM_LOGIN_BOT_TOKEN +
      "/getFile?file_id=" + encodeURIComponent(fileId)
    );
    const fileData = await fileResp.json();
    const filePath = fileData && fileData.result && fileData.result.file_path;
    if (!filePath) return new Response("", { status: 404 });
    const imgResp = await fetch(
      "https://api.telegram.org/file/bot" + env.TELEGRAM_LOGIN_BOT_TOKEN + "/" + filePath
    );
    if (!imgResp.ok) return new Response("", { status: 404 });
    const headers = new Headers();
    headers.set("Content-Type", imgResp.headers.get("Content-Type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=3600");
    return new Response(imgResp.body, { status: 200, headers });
  } catch (e) {
    return new Response("", { status: 502 });
  }
}

async function handleTelegramWebhook(request, env) {
  // Telegram sends this on every webhook call when a secret_token was set on
  // setWebhook -- the only real proof this request came from Telegram and not
  // from anyone who found this URL. No secret configured yet, or a mismatch,
  // both refuse rather than silently trusting an unverified caller.
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "";
  if (!env.TELEGRAM_LOGIN_WEBHOOK_SECRET || secret !== env.TELEGRAM_LOGIN_WEBHOOK_SECRET) {
    return json({ error: "unauthorized" }, env, 401);
  }

  let update;
  try {
    update = await request.json();
  } catch (e) {
    return json({ ok: true }, env); // malformed body -- nothing to do, still 200 so Telegram doesn't retry
  }

  const msg = update && update.message;
  const chat = msg && msg.chat;
  const from = msg && msg.from;
  const text = (msg && msg.text) || "";
  if (!chat || !chat.id || !text.startsWith("/start")) {
    return json({ ok: true }, env); // some other update type (edited message, callback query, ...) -- ignore
  }

  const payload = text.split(/\s+/)[1] || "";
  if (!payload.startsWith("login_")) {
    // someone opened the bot without the site's own deep link
    await tgSend(chat.id, "สวัสดีค่ะ 👋 บอทนี้ใช้สำหรับเข้าสู่ระบบเว็บ SPACEZ TERMINAL เท่านั้น กลับไปที่หน้าเว็บแล้วกดสแกน QR ใหม่อีกครั้งได้เลยค่ะ", env);
    return json({ ok: true }, env);
  }

  const code = payload.slice(6);
  const raw = code && (await env.SESSIONS.get("sess:" + code));
  if (!raw) {
    await tgSend(chat.id, "QR หมดอายุแล้วค่ะ กลับไปที่หน้าเว็บแล้วขอ QR ใหม่อีกครั้งนะคะ", env);
    return json({ ok: true }, env);
  }

  const displayName = [from && from.first_name, from && from.last_name].filter(Boolean).join(" ").trim() ||
    (from && from.username) || "Telegram";
  const userId = "tg:" + chat.id;

  // fetch + store the profile-photo file_id (best-effort -- a visitor with
  // no photo, or a getUserProfilePhotos hiccup, just means no avatar this
  // round; never blocks the login itself) and build this Worker's own proxy
  // URL for it (see handleTelegramAvatar above -- never Telegram's raw URL,
  // which would embed the bot token).
  const photoFileId = await tgFetchAvatarFileId(chat.id, env);
  if (photoFileId) await env.SESSIONS.put("tgphoto:" + userId, photoFileId);
  const pictureUrl = photoFileId
    ? new URL(request.url).origin + "/api/telegram/avatar?uid=" + encodeURIComponent(userId)
    : "";

  await env.SESSIONS.put(
    "sess:" + code,
    JSON.stringify({
      status: "linked",
      provider: "telegram",
      userId,
      displayName,
      pictureUrl,
      linkedAt: Date.now(),
    }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );

  // same Connected-Users profile upsert LINE's /callback uses -- keeps this
  // person's name fresh and assigns a UID the first time, no separate code path
  await upsertProfileOnLogin(userId, displayName, pictureUrl, env);

  await tgSend(
    chat.id,
    "✅ เชื่อมต่อสำเร็จค่ะ สวัสดีค่ะคุณ " + displayName + "\nกลับไปที่หน้าเว็บที่เปิดไว้ได้เลย ข้อมูลจะขึ้นให้อัตโนมัติค่ะ",
    env
  );

  return json({ ok: true }, env);
}

async function handleLogout(request, env) {
  let code = "";
  try {
    const body = await request.json();
    code = body.code || "";
  } catch (e) {}
  if (code) await env.SESSIONS.delete("sess:" + code);
  return json({ ok: true }, env);
}

/* Round S6d: pick the one Access-Control-Allow-Origin value to actually send
   back, given the real incoming request and an ALLOWED_ORIGIN env value that
   may now be a comma-separated list (see the header comment above). Falls
   back to the first configured origin if the request's Origin isn't in the
   list (or sent no Origin at all, e.g. a same-worker /callback navigation),
   which matches the old single-origin behavior exactly when ALLOWED_ORIGIN
   holds just one value. */
function pickAllowedOrigin(request, env) {
  const allowed = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && allowed.indexOf(requestOrigin) !== -1) return requestOrigin;
  return allowed[0] || null;
}

/* Rewrites just the Access-Control-Allow-Origin header on whatever Response
   a route handler already produced (all of them build their headers via the
   unchanged corsHeaders()/json()/html() above), so every existing handler
   function needed zero changes -- this is the one and only place that now
   knows about the real request. */
function withCorsOrigin(response, origin) {
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const allowOrigin = pickAllowedOrigin(request, env);

    // Every route served to a standalone local uploader tool (see
    // localToolCorsHeaders() above) -- add a new one here and its preflight,
    // dispatch and error-catch handling all pick it up automatically.
    const LOCAL_TOOL_PATHS = [
      "/api/classroom/content", "/api/admin/classroom-content/update",
      "/api/controlgrid/content", "/api/admin/controlgrid-content/update",
      "/api/quietvalue/results",
    ];

    if (request.method === "OPTIONS") {
      // Local-tool routes always answer preflight with a wildcard origin --
      // the standalone uploader tools call these from file:// or an
      // arbitrary localhost port, neither of which is in ALLOWED_ORIGIN, so
      // the normal allowlisted preflight below would fail before
      // isAdminKeyValid() ever ran.
      if (LOCAL_TOOL_PATHS.indexOf(url.pathname) !== -1) {
        return new Response(null, { headers: localToolCorsHeaders() });
      }
      return withCorsOrigin(new Response(null, { headers: corsHeaders(env) }), allowOrigin);
    }

    try {
      if (url.pathname === "/api/session/new") return withCorsOrigin(await handleNewSession(request, env), allowOrigin);
      if (url.pathname === "/callback") return withCorsOrigin(await handleCallback(request, env), allowOrigin);
      if (url.pathname === "/telegram-webhook" && request.method === "POST") return withCorsOrigin(await handleTelegramWebhook(request, env), allowOrigin);
      if (url.pathname === "/api/telegram/avatar") return withCorsOrigin(await handleTelegramAvatar(request, env), allowOrigin);
      if (url.pathname === "/api/session/status") return withCorsOrigin(await handleStatus(request, env), allowOrigin);
      if (url.pathname === "/api/session/data") return withCorsOrigin(await handleData(request, env), allowOrigin);
      if (url.pathname === "/api/session/logout" && request.method === "POST") return withCorsOrigin(await handleLogout(request, env), allowOrigin);
      if (url.pathname === "/api/session/watchlist/add" && request.method === "POST") return withCorsOrigin(await handleWatchlistAdd(request, env), allowOrigin);
      if (url.pathname === "/api/session/watchlist/remove" && request.method === "POST") return withCorsOrigin(await handleWatchlistRemove(request, env), allowOrigin);
      if (url.pathname === "/api/likes" && request.method === "GET") return withCorsOrigin(await handleLikesGet(request, env), allowOrigin);
      if (url.pathname === "/api/likes/toggle" && request.method === "POST") return withCorsOrigin(await handleLikeToggle(request, env), allowOrigin);
      if (url.pathname === "/api/session/profile" && request.method === "POST") return withCorsOrigin(await handleProfileUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/users" && request.method === "GET") return withCorsOrigin(await handleAdminUsersList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/users/update" && request.method === "POST") return withCorsOrigin(await handleAdminUsersUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/broadcast" && request.method === "POST") return withCorsOrigin(await handleAdminBroadcast(request, env), allowOrigin);
      if (url.pathname === "/api/presence/ping" && request.method === "POST") return withCorsOrigin(await handlePresencePing(request, env), allowOrigin);
      if (url.pathname === "/api/admin/presence-count" && request.method === "GET") return withCorsOrigin(await handleAdminPresenceCount(request, env), allowOrigin);
      if (url.pathname === "/api/journal-settings" && request.method === "GET") return withCorsOrigin(await handleJournalSettingsGet(request, env), allowOrigin);
      if (url.pathname === "/api/admin/journal-settings" && request.method === "POST") return withCorsOrigin(await handleJournalSettingsUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/econ-calendar" && request.method === "GET") return withCorsOrigin(await handleEconCalendar(request, env), allowOrigin);
      if (url.pathname === "/api/announcements" && request.method === "GET") return withCorsOrigin(await handleAnnouncementsPublic(request, env), allowOrigin);
      if (url.pathname === "/api/admin/announcements" && request.method === "GET") return withCorsOrigin(await handleAdminAnnouncementsList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/announcements/create" && request.method === "POST") return withCorsOrigin(await handleAdminAnnouncementsCreate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/announcements/update" && request.method === "POST") return withCorsOrigin(await handleAdminAnnouncementsUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/announcements/delete" && request.method === "POST") return withCorsOrigin(await handleAdminAnnouncementsDelete(request, env), allowOrigin);
      if (url.pathname === "/api/classroom/content" && request.method === "GET") return await handleClassroomContent(request, env);
      if (url.pathname === "/api/admin/classroom-content/update" && request.method === "POST") return await handleAdminClassroomContentUpdate(request, env);
      if (url.pathname === "/api/controlgrid/content" && request.method === "GET") return await handleControlGridContent(request, env);
      if (url.pathname === "/api/admin/controlgrid-content/update" && request.method === "POST") return await handleAdminControlGridContentUpdate(request, env);
      if (url.pathname === "/api/quietvalue/results" && request.method === "GET") return await handleQuietValueResults(request, env);

      return withCorsOrigin(json({ error: "not_found" }, env, 404), allowOrigin);
    } catch (err) {
      // Cloudflare's KV binding throws when the account's daily quota (reads,
      // writes, or list operations -- 1,000 writes/day on the Free plan,
      // resetting 00:00 UTC) is exceeded. Uncaught, that crashes the whole
      // Worker and the caller just sees Cloudflare's generic "error code:
      // 1101" page. Caught here instead, so every route -- LINE session
      // creation included -- fails softly with a JSON error the front end
      // can show a real message for, rather than a dead end.
      const msg = String((err && err.message) || err || "");
      const quota = /quota|limit|429|too many/i.test(msg);
      const status = quota ? 503 : 500;
      const body = { error: quota ? "quota_exceeded" : "internal_error" };
      if (LOCAL_TOOL_PATHS.indexOf(url.pathname) !== -1) {
        return localToolJson(body, status);
      }
      return withCorsOrigin(json(body, env, status), allowOrigin);
    }
  },
};
