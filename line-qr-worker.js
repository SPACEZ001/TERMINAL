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

/* ---- Admin key (Round AO: hardened + rotatable) ---------------------------
   1. The admin can set a NEW admin key from the site (Security map page):
      POST /api/admin/key/rotate { newKey } with the current key. Only a salted
      PBKDF2-SHA256 (210,000 rounds) hash is stored in KV ("admin:keyhash");
      from then on the old key (the Cloudflare secret) stops working.
   2. Recovery: the hash record remembers a fingerprint of the Cloudflare
      secret at the time of rotation. Changing ADMIN_USERS_KEY in the Cloudflare
      dashboard makes that record stale, so the new secret works again.
   3. Different wrong keys are counted per IP (admin:fail:<ip>); 30 different
      wrong keys in 15 minutes locks admin checks for that IP for 15 minutes.
      (An old tab repeating the same stale key counts once.)
   4. Comparisons are constant-time. A verified key is cached per isolate so
      the slow hash runs once, not on every request. */
const ADMIN_HASH_KEY = "admin:keyhash";
const ADMIN_FAIL_PREFIX = "admin:fail:";
const ADMIN_PBKDF2_ITER = 210000;
let adminCache = { rec: null, recAt: 0, okKey: "", okVer: "" };
function ctEqual(a, b) {
  a = String(a); b = String(b);
  let d = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
async function sha256Hex(str) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function adminPbkdf2(key, saltB64, iter) {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, k, 256);
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function adminRecord(env) {
  const now = Date.now();
  if (adminCache.recAt && now - adminCache.recAt < 30000) return adminCache.rec;
  let rec = null;
  try { rec = JSON.parse((await env.SESSIONS.get(ADMIN_HASH_KEY)) || "null"); } catch (e) { rec = null; }
  if (rec && env.ADMIN_USERS_KEY) {
    // the Cloudflare secret was changed after this rotation -> the secret wins again (recovery path)
    const fp = await sha256Hex("spz-admin-fp|" + env.ADMIN_USERS_KEY);
    if (!ctEqual(fp, rec.envFp || "")) rec = null;
  }
  adminCache.rec = rec; adminCache.recAt = now;
  return rec;
}
function adminIp(request) { return request.headers.get("CF-Connecting-IP") || "0"; }
async function isAdminKeyValid(request, env, noCount) {
  const key = request.headers.get("X-Admin-Key") || "";
  if (!key || key.length > 256 || !env.ADMIN_USERS_KEY) return false;
  if (key.indexOf("acc.") === 0 || (editorKeyVerified && key === editorKeyVerified)) return false; // editor credentials are never admin
  const failKey = ADMIN_FAIL_PREFIX + adminIp(request);
  let fails = 0;
  try { fails = (JSON.parse((await env.SESSIONS.get(failKey)) || "{}").n) || 0; } catch (e) {}
  if (fails >= 30) return false;
  const rec = await adminRecord(env);
  let ok = false;
  if (rec && rec.hash) {
    const ver = rec.salt + rec.hash;
    if (adminCache.okKey && adminCache.okVer === ver && ctEqual(key, adminCache.okKey)) ok = true;
    else {
      ok = ctEqual(await adminPbkdf2(key, rec.salt, rec.iter || ADMIN_PBKDF2_ITER), rec.hash);
      if (ok) { adminCache.okKey = key; adminCache.okVer = ver; }
    }
  } else {
    ok = ctEqual(key, env.ADMIN_USERS_KEY);
  }
  if (!ok && !noCount) await adminCountFail(request, env);
  return ok;
}
async function adminCountFail(request, env) {
  const key = request.headers.get("X-Admin-Key") || "";
  if (!key) return;
  const failKey = ADMIN_FAIL_PREFIX + adminIp(request);
  try {
    // count DIFFERENT wrong keys only: an old tab that keeps polling with a stale key counts once,
    // a guessing attack (a new key every try) is counted every time
    const fp = (await sha256Hex("spz-fail|" + key)).slice(0, 16);
    let r = {}; try { r = JSON.parse((await env.SESSIONS.get(failKey)) || "{}") || {}; } catch (e) { r = {}; }
    const seen = Array.isArray(r.s) ? r.s : [];
    if (seen.indexOf(fp) !== -1) return;
    seen.push(fp);
    await env.SESSIONS.put(failKey, JSON.stringify({ n: (r.n || 0) + 1, s: seen.slice(-40) }), { expirationTtl: 900 });
  } catch (e) {}
}
async function handleAdminKeyRotate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const nk = String(body.newKey || "");
  if (nk.length < 16 || nk.length > 128 || !/[A-Za-z]/.test(nk) || !/[0-9]/.test(nk)) return json({ error: "weak_key" }, env, 400);
  if (nk.indexOf("acc.") === 0) return json({ error: "weak_key" }, env, 400);
  const saltU8 = new Uint8Array(16); crypto.getRandomValues(saltU8);
  let sb = ""; for (let i = 0; i < saltU8.length; i++) sb += String.fromCharCode(saltU8[i]);
  const salt = btoa(sb);
  const rec = { v: 1, salt, iter: ADMIN_PBKDF2_ITER, hash: await adminPbkdf2(nk, salt, ADMIN_PBKDF2_ITER),
    envFp: await sha256Hex("spz-admin-fp|" + env.ADMIN_USERS_KEY), at: Date.now() };
  await env.SESSIONS.put(ADMIN_HASH_KEY, JSON.stringify(rec));
  adminCache = { rec, recAt: Date.now(), okKey: nk, okVer: rec.salt + rec.hash };
  return json({ ok: true, at: rec.at }, env);
}
async function handleAdminKeyStatus(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const rec = await adminRecord(env);
  return json({ rotated: !!rec, at: rec ? rec.at : null, iter: rec ? rec.iter : null }, env);
}

/* ---- Editor READ-ONLY access (Round AD2) ----------------------------------
   An "Editor" has no admin key. The Editor code the visitor types on the site
   is sent in the same X-Admin-Key header; here it is checked against the SAME
   PBKDF2-SHA256 (100,000 rounds) salt + hash that the site keeps as
   EDITOR_SALT / EDITOR_HASH in assets/js/part-46.js. Used ONLY by the four GET
   handlers below (classroom / control grid / quiet value / print report
   analysis). Every write/update endpoint still calls isAdminKeyValid(). */
const EDITOR_SALT_B64 = "nvW5Nk2WzNHZhmZ7ntVq/w==";
const EDITOR_HASH_HEX = "bb2c41992b2748b99f43d468a2ff7d1852b8d446c11c3f2dfb366abce5ec5d41";
let editorKeyVerified = ""; // last code that passed, so PBKDF2 runs once per isolate, not per request

async function isEditorKeyValid(request) {
  const key = request.headers.get("X-Admin-Key") || "";
  if (!key || key.length > 128) return false;
  if (key === editorKeyVerified) return true;
  try {
    const salt = Uint8Array.from(atob(EDITOR_SALT_B64), (c) => c.charCodeAt(0));
    const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, baseKey, 256);
    const hex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hex === EDITOR_HASH_HEX) { editorKeyVerified = key; return true; }
  } catch (e) { /* fall through: not valid */ }
  return false;
}

// Admin key (any method) OR a valid Editor code on a GET.
async function isAdminOrEditorRead(request, env) {
  if (await isAdminKeyValid(request, env, true)) return true;
  if (request.method === "GET") {
    if (await isEditorKeyValid(request)) return true;
    if (await isEditorAccountKey(request, env)) return true;
  }
  await adminCountFail(request, env);
  return false;
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
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
    const lastSeenAt = Number(await env.SESSIONS.get(LASTSEEN_KEY_PREFIX + userId)) || null;
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
      lastSeenAt: presenceKey ? Date.now() : lastSeenAt,
    });
  }
  return json({ users }, env);
}

async function handleAdminUsersUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const data = normalizeJournalSettings(body);
  await env.SESSIONS.put(JOURNAL_SETTINGS_KV_KEY, JSON.stringify(data));
  return json({ ok: true, data }, env);
}

// Round AM: small site-wide settings that every visitor's page reads.
// arenaVis = which tier sees the CEWA Exam Arena in the menu
// ("admin" | "editor" | "member" | "all"); default admin only.
const SITE_SETTINGS_KV_KEY = "site:settings";
const SITE_VIS = ["admin", "editor", "member", "all"];
function normalizeSiteSettings(o) {
  o = o && typeof o === "object" ? o : {};
  return { arenaVis: SITE_VIS.indexOf(o.arenaVis) !== -1 ? o.arenaVis : "admin" };
}
async function handleSiteSettingsGet(request, env) {
  let data = normalizeSiteSettings(null);
  try { const raw = await env.SESSIONS.get(SITE_SETTINGS_KV_KEY); if (raw) data = normalizeSiteSettings(JSON.parse(raw)); } catch (e) {}
  return json(data, env);
}
async function handleSiteSettingsUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  let cur = {};
  try { const raw = await env.SESSIONS.get(SITE_SETTINGS_KV_KEY); if (raw) cur = JSON.parse(raw) || {}; } catch (e) {}
  const data = normalizeSiteSettings(Object.assign({}, cur, body || {}));
  await env.SESSIONS.put(SITE_SETTINGS_KV_KEY, JSON.stringify(data));
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
const LASTSEEN_KEY_PREFIX = "lastSeen:";
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
      // Round AE: remember WHEN this person was last on the site (admin-only, shown on the Connected
      // Users page). Read-then-write at most once per 10 minutes so it adds almost no KV writes.
      const seenKey = LASTSEEN_KEY_PREFIX + sess.userId;
      const prevSeen = Number(await env.SESSIONS.get(seenKey)) || 0;
      if (Date.now() - prevSeen > 10 * 60 * 1000) {
        await env.SESSIONS.put(seenKey, String(Date.now()));
      }
    }
  }
  return json({ ok: true }, env);
}

async function handleAdminPresenceCount(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const list = await getAnnouncementsList(env);
  return json({ items: list }, env);
}

async function handleAdminAnnouncementsCreate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
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
  if (!(await isAdminOrEditorRead(request, env))) return localToolJson({ error: "unauthorized" }, 401);
  const content = await getClassroomContent(env);
  return localToolJson({ content });
}

async function handleAdminClassroomContentUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return localToolJson({ error: "unauthorized" }, 401);
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
  if (!(await isAdminOrEditorRead(request, env))) return localToolJson({ error: "unauthorized" }, 401);
  const content = await getControlGridContent(env);
  return localToolJson({ content });
}

async function handleAdminControlGridContentUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return localToolJson({ error: "unauthorized" }, 401);
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
  if (!(await isAdminOrEditorRead(request, env))) return localToolJson({ error: "unauthorized" }, 401);
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
// Round AB: Print Report -- same situation as Quiet Value Scanner, no
// server gate AND no client-side window.__SPZ_TIER() check at all. Two
// sub-sections (Market Cycle, Gold Analysis) each turn several public
// market.json readings into ONE classification -- a regime phase, an
// up/down/mixed gold verdict. The descriptive bullets built around these
// (part-49.js's goldForecastHTML()) stay client-side: they're generic
// prose over numbers that are already public (dxy.m1 < 0 is visible in
// the number itself), nothing worth protecting there. Only the AGGREGATE
// RULE -- how several signals combine into one classification -- is
// hidden here, mirroring exactly what's hidden for Quiet Value's
// composite. Ported verbatim from part-49.js's cycleSignal() and
// goldForecastHTML()'s scoring block.
// ---------------------------------------------------------------------
const PRINTREPORT_SNAPSHOT_URL = QUIETVALUE_SNAPSHOT_URL; // same public data/market.json

function prIsNum(v) { return typeof v === "number" && isFinite(v); }

function prFindAssetRow(list, enName) {
  for (let i = 0; i < (list || []).length; i++) if (list[i] && list[i].en === enName) return list[i];
  return null;
}

function computeCyclePhaseId(regime) {
  if (!regime) return "mid";
  let score = 0;
  const curveInv = prIsNum(regime.curve_10y_3m) && regime.curve_10y_3m < 0;
  if (prIsNum(regime.cyclical_vs_defensive_1m)) score += regime.cyclical_vs_defensive_1m > 0 ? 1 : -1;
  if (prIsNum(regime.cyclical_vs_defensive_3m)) score += regime.cyclical_vs_defensive_3m > 0 ? 1 : -1;
  if (prIsNum(regime.curve_10y_3m)) score += curveInv ? -2 : 1;
  if (prIsNum(regime.breadth_200)) score += regime.breadth_200 >= 60 ? 1 : regime.breadth_200 <= 40 ? -1 : 0;
  return curveInv && score <= -1 ? "rec" : score >= 2 ? "early" : score <= -2 ? "late" : "mid";
}

function computeGoldVerdict(macro, regime, flowsAsset) {
  if (!macro && !regime) return { verdict: "mixed", rateNote: null };
  let score = 0;
  const m = macro, r = regime, list = flowsAsset || [];

  if (m && m.dxy && prIsNum(m.dxy.m1)) score += m.dxy.m1 < 0 ? 1 : -1;
  if (m && m.us10y && prIsNum(m.us10y.m1) && prIsNum(m.us10y.price)) score += m.us10y.m1 < 0 ? 1 : -1;
  const curveInv = r && prIsNum(r.curve_10y_3m) && r.curve_10y_3m < 0;
  if (r && prIsNum(r.curve_10y_3m)) score += curveInv ? 1 : 0;
  let vixV = null;
  if (m) { if (prIsNum(m.vix)) vixV = m.vix; else if (m.vix && prIsNum(m.vix.price)) vixV = m.vix.price; }
  const vixRow = prFindAssetRow(list, "Volatility (VIX)");
  const vixM1 = vixRow && prIsNum(vixRow.m1) ? vixRow.m1 : null;
  if (prIsNum(vixV) && prIsNum(vixM1)) score += vixM1 > 0 ? 1 : -1;
  if (r && prIsNum(r.cyclical_vs_defensive_1m)) score += r.cyclical_vs_defensive_1m < 0 ? 1 : -1;

  const verdict = score >= 2 ? "up" : score <= -2 ? "down" : "mixed";
  let rateNote = null;
  if (m && m.us10y && prIsNum(m.us10y.m1) && m.us10y.m1 > 0.5) rateNote = "hike";
  else if (m && m.us10y && prIsNum(m.us10y.m1) && m.us10y.m1 < -0.5) rateNote = "cut";
  return { verdict, rateNote };
}

async function handlePrintReportAnalysis(request, env) {
  if (!(await isAdminOrEditorRead(request, env))) return localToolJson({ error: "unauthorized" }, 401);
  let snap;
  try {
    const r = await fetch(PRINTREPORT_SNAPSHOT_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!r.ok) return localToolJson({ error: "snapshot_unavailable" }, 502);
    snap = await r.json();
  } catch (e) {
    return localToolJson({ error: "snapshot_unavailable" }, 502);
  }
  let cyclePhaseId, gold;
  try {
    cyclePhaseId = computeCyclePhaseId(snap && snap.regime);
    gold = computeGoldVerdict(snap && snap.macro, snap && snap.regime, snap && snap.flows && snap.flows.asset);
  } catch (e) {
    return localToolJson({ error: "compute_failed" }, 500);
  }
  return localToolJson({
    generated_at: snap.generated_at || null,
    cyclePhaseId,
    goldVerdict: gold.verdict,
    goldRateNote: gold.rateNote,
  });
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

/* =====================================================================
   EXAM ARENA (CEWA practice / ranked / blitz) -- server-graded quiz.

   Design goals (KV free plan = ~1,000 writes/day, Worker CPU is small):
   * The question bank lives in KV, one key per exam set ("qz:set:<n>"),
     uploaded once with QUIZ_BANK_UPLOADER.html. Answers NEVER leave the
     Worker while a ranked/blitz round is running.
   * A round is STATELESS: everything the server needs (who, mode, which
     questions, shuffle, score so far, when the current question was shown)
     rides in an AES-GCM encrypted token that the browser hands back with
     each answer. So a round costs ZERO KV writes while it is played.
   * Only a FINISHED ranked/blitz round may write, and only when it beats
     that player's previous best on the board (so spamming rounds does not
     burn the write quota).
   * Timing is measured by the Worker's own clock from the moment the
     question was sent. Replaying an old token only makes the answer later,
     never earlier, so it cannot buy extra thinking time.

   Secret: uses QUIZ_SECRET if set, otherwise falls back to the existing
   ADMIN_USERS_KEY (no new secret is required).
   ===================================================================== */

const QZ_META_KEY = "qz:meta";
const QZ_SET_PREFIX = "qz:set:";
const QZ_MODES = {
  // tpq = seconds per question (0 = untimed). multi-answer questions get x1.5.
  practice: { tpq: 0, ranked: false, counts: [5, 10, 20] },
  ranked:   { tpq: 45, ranked: true, counts: [10] },
  blitz:    { tpq: 15, ranked: true, counts: [10] },
};
const QZ_GRACE_MS = 2500;         // network slack added to every question timer
const QZ_TOKEN_MAX_AGE_MS = 3 * 60 * 60 * 1000;
const QZ_BOARD_MAX = 100;
const QZ_BOARD_SHOW = 20;
const QZ_BASE_POINTS = 100;
const QZ_SPEED_POINTS = 50;

let _qzKey = null;
const _qzSetCache = new Map(); // per-isolate cache of parsed sets: n -> {at, data}

function b64uEnc(buf) {
  let s = "";
  const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64uDec(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const s = atob(str);
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}

async function qzCryptoKey(env) {
  const secret = env.QUIZ_SECRET || env.ADMIN_USERS_KEY;
  if (!secret) return null;
  if (_qzKey && _qzKey.secret === secret) return _qzKey.key;
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("spz-quiz-v1|" + secret));
  const key = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  _qzKey = { secret, key };
  return key;
}
async function qzSeal(obj, env) {
  const key = await qzCryptoKey(env);
  if (!key) throw new Error("quiz_not_configured");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  const out = new Uint8Array(12 + ct.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ct), 12);
  return b64uEnc(out);
}
async function qzOpen(token, env) {
  try {
    const key = await qzCryptoKey(env);
    if (!key || typeof token !== "string" || token.length > 8000) return null;
    const b = b64uDec(token);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, key, b.slice(12));
    return JSON.parse(new TextDecoder().decode(pt));
  } catch (e) { return null; }
}

function qzRandInt(n) {
  // unbiased integer in [0, n)
  const lim = Math.floor(4294967296 / n) * n;
  const a = new Uint32Array(1);
  do { crypto.getRandomValues(a); } while (a[0] >= lim);
  return a[0] % n;
}
function qzShuffle(len) {
  const p = [];
  for (let i = 0; i < len; i++) p.push(i);
  if (len <= 2) return p; // True/False keeps its natural order
  for (let i = len - 1; i > 0; i--) {
    const j = qzRandInt(i + 1);
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  return p;
}

async function qzGetMeta(env) {
  const raw = await env.SESSIONS.get(QZ_META_KEY, "json");
  if (!raw || !raw.sets) return null;
  return raw;
}
async function qzGetSet(n, env) {
  const hit = _qzSetCache.get(n);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.data;
  const data = await env.SESSIONS.get(QZ_SET_PREFIX + n, "json");
  if (!Array.isArray(data)) return null;
  _qzSetCache.set(n, { at: Date.now(), data });
  return data;
}
async function qzGetQuestion(ref, env) {
  const set = await qzGetSet(ref[0], env);
  return set ? set[ref[1]] || null : null;
}

/* Picks `count` distinct questions uniformly from the whole pool. */
function qzPickRefs(meta, count) {
  const ns = Object.keys(meta.sets).map(Number).filter(function (n) { return meta.sets[n] > 0; });
  let total = 0;
  const cum = [];
  ns.forEach(function (n) { total += meta.sets[n]; cum.push(total); });
  if (total < count) return null;
  const chosen = new Set();
  const refs = [];
  let guard = 0;
  while (refs.length < count && guard++ < 5000) {
    const r = qzRandInt(total);
    let k = 0;
    while (cum[k] <= r) k++;
    const base = k ? cum[k - 1] : 0;
    const ref = [ns[k], r - base];
    const id = ref[0] + ":" + ref[1];
    if (chosen.has(id)) continue;
    chosen.add(id);
    refs.push(ref);
  }
  return refs.length === count ? refs : null;
}

function qzTpqFor(mode, q) {
  const base = QZ_MODES[mode].tpq;
  if (!base) return 0;
  return q.m ? Math.round(base * 1.5) : base;
}

/* What the browser may see about a question: text + choices in the shuffled
   order, never the answer. */
function qzPublicQuestion(q, perm, i, total, mode) {
  return {
    i: i,
    total: total,
    t: q.t,
    c: perm.map(function (k) { return q.c[k]; }),
    m: q.m ? 1 : 0,
    tpq: qzTpqFor(mode, q),
  };
}

async function qzSessionOr401(code, env) {
  const sess = await getLinkedSession(code, env);
  return sess;
}

function qzBangkokWeekKey(now) {
  // weeks start Monday 00:00 Asia/Bangkok (UTC+7); 1970-01-05 was a Monday
  const MON = Date.UTC(1970, 0, 5);
  const idx = Math.floor((now + 7 * 3600 * 1000 - MON) / (7 * 86400000));
  const endsAt = MON + (idx + 1) * 7 * 86400000 - 7 * 3600 * 1000;
  return { key: "w" + idx, endsAt: endsAt };
}
function qzBoardKey(mode, period, now) {
  return "qzlb:" + mode + ":" + (period === "week" ? qzBangkokWeekKey(now).key : "all");
}
async function qzGetBoard(key, env) {
  const raw = await env.SESSIONS.get(key, "json");
  return Array.isArray(raw) ? raw : [];
}
function qzBetter(a, b) {
  // is entry a better than entry b ?
  if (a.s !== b.s) return a.s > b.s;
  return a.ms < b.ms;
}
async function qzBoardSubmit(key, entry, env) {
  const board = await qzGetBoard(key, env);
  const idx = board.findIndex(function (e) { return e.u === entry.u; });
  if (idx >= 0) {
    if (!qzBetter(entry, board[idx])) {
      // not an improvement: no write, but keep the display name fresh only
      // when it already changed nothing important -- skipped to save writes
      return { rank: idx + 1, improved: false };
    }
    board.splice(idx, 1);
  }
  board.push(entry);
  board.sort(function (a, b) { return a.s !== b.s ? b.s - a.s : a.ms - b.ms; });
  const kept = board.slice(0, QZ_BOARD_MAX);
  await env.SESSIONS.put(key, JSON.stringify(kept));
  const r = kept.findIndex(function (e) { return e.u === entry.u; });
  return { rank: r >= 0 ? r + 1 : null, improved: true };
}

function qzSetEq(a, b) {
  if (a.length !== b.length) return false;
  const x = a.slice().sort(), y = b.slice().sort();
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}

/* ------------------------------ public API ------------------------------ */

async function handleQuizMeta(request, env) {
  const meta = await qzGetMeta(env);
  if (!meta) return json({ ready: false }, env);
  let total = 0;
  Object.keys(meta.sets).forEach(function (k) { total += meta.sets[k]; });
  return json({
    ready: true,
    sets: Object.keys(meta.sets).length,
    questions: total,
    modes: {
      practice: { counts: QZ_MODES.practice.counts },
      ranked: { tpq: QZ_MODES.ranked.tpq, count: 10 },
      blitz: { tpq: QZ_MODES.blitz.tpq, count: 10 },
    },
  }, env);
}

async function handleQuizStart(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const sess = await qzSessionOr401(body.code, env);
  if (!sess) return json({ error: "not_linked" }, env, 401);
  if (!(await qzCryptoKey(env))) return json({ error: "not_configured" }, env, 503);
  const mode = typeof body.mode === "string" && QZ_MODES[body.mode] ? body.mode : null;
  if (!mode) return json({ error: "bad_mode" }, env, 400);
  let count = parseInt(body.count, 10);
  if (QZ_MODES[mode].counts.indexOf(count) === -1) count = QZ_MODES[mode].counts[Math.min(1, QZ_MODES[mode].counts.length - 1)];
  const meta = await qzGetMeta(env);
  if (!meta) return json({ error: "no_bank" }, env, 503);
  const refs = qzPickRefs(meta, count);
  if (!refs) return json({ error: "no_bank" }, env, 503);
  const q0 = await qzGetQuestion(refs[0], env);
  if (!q0) return json({ error: "no_bank" }, env, 503);
  const perm = qzShuffle(q0.c.length);
  const state = {
    u: sess.userId, m: mode, n: count, r: refs, i: 0, p: perm,
    ts: Date.now(), t0: Date.now(), sc: 0, ok: 0, ms: 0, lg: [],
  };
  return json({
    mode: mode,
    token: await qzSeal(state, env),
    q: qzPublicQuestion(q0, perm, 0, count, mode),
  }, env);
}

async function handleQuizAnswer(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const sess = await qzSessionOr401(body.code, env);
  if (!sess) return json({ error: "not_linked" }, env, 401);
  const st = await qzOpen(body.token, env);
  if (!st || st.u !== sess.userId) return json({ error: "bad_token" }, env, 400);
  const now = Date.now();
  if (now - st.t0 > QZ_TOKEN_MAX_AGE_MS) return json({ error: "expired" }, env, 400);
  const mode = st.m;
  const cfg = QZ_MODES[mode];
  if (!cfg) return json({ error: "bad_token" }, env, 400);

  const q = await qzGetQuestion(st.r[st.i], env);
  if (!q) return json({ error: "no_bank" }, env, 503);

  // translate the player's displayed picks back to the real option indexes
  let picks = Array.isArray(body.choice) ? body.choice : [];
  picks = picks.map(function (x) { return parseInt(x, 10); })
    .filter(function (x, k, a) { return x >= 0 && x < st.p.length && a.indexOf(x) === k; });
  const real = picks.map(function (d) { return st.p[d]; });

  const tpq = qzTpqFor(mode, q);
  const elapsed = Math.max(0, now - st.ts);
  const late = !!tpq && elapsed > tpq * 1000 + QZ_GRACE_MS;
  const right = !late && real.length > 0 && qzSetEq(real, q.a);
  let pts = 0;
  if (right) {
    pts = QZ_BASE_POINTS;
    if (tpq) pts += Math.round(QZ_SPEED_POINTS * Math.max(0, 1 - elapsed / (tpq * 1000)));
  }

  // log.k = for each DISPLAYED slot, 1 if that slot is a correct option
  const logEntry = { k: st.p.map(function (x) { return q.a.indexOf(x) >= 0 ? 1 : 0; }), d: picks, o: right ? 1 : 0, l: late ? 1 : 0, ms: Math.min(elapsed, 600000) };
  st.lg.push(logEntry);
  st.sc += pts;
  st.ok += right ? 1 : 0;
  st.ms += Math.min(elapsed, tpq ? tpq * 1000 : 600000);

  const reveal = cfg.ranked ? null : { k: logEntry.k, o: logEntry.o, e: q.e || ["", ""] };

  if (st.i + 1 < st.n) {
    const nq = await qzGetQuestion(st.r[st.i + 1], env);
    if (!nq) return json({ error: "no_bank" }, env, 503);
    st.i += 1;
    st.p = qzShuffle(nq.c.length);
    st.ts = Date.now();
    const out = { token: await qzSeal(st, env), q: qzPublicQuestion(nq, st.p, st.i, st.n, mode) };
    if (reveal) out.reveal = reveal;
    return json(out, env);
  }

  // ---- finished ----
  const review = [];
  for (let z = 0; z < st.lg.length; z++) {
    const l = st.lg[z];
    const rq = z === st.i ? q : await qzGetQuestion(st.r[z], env);
    review.push({ k: l.k, d: l.d, o: l.o, l: l.l, ms: l.ms, e: (rq && rq.e) || ["", ""] });
  }
  const done = { done: true, mode: mode, score: st.sc, correct: st.ok, total: st.n, ms: st.ms, review: review };
  if (cfg.ranked) {
    let name = sess.displayName || "";
    let pic = sess.pictureUrl || "";
    try {
      const prof = await getProfile(sess.userId, env);
      if (prof && prof.nameOverride) name = prof.nameOverride;
    } catch (e) { /* name fallback is fine */ }
    const entry = {
      u: sess.userId, n: (name || "Player").slice(0, 40), p: pic, s: st.sc, c: st.ok, ms: st.ms, at: now,
    };
    const all = await qzBoardSubmit(qzBoardKey(mode, "all", now), entry, env);
    const wk = await qzBoardSubmit(qzBoardKey(mode, "week", now), entry, env);
    done.rankAll = all.rank; done.rankWeek = wk.rank;
    done.newBest = !!(all.improved || wk.improved);
  }
  return json(done, env);
}

async function handleQuizLeaderboard(request, env) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "blitz" ? "blitz" : "ranked";
  const period = url.searchParams.get("period") === "all" ? "all" : "week";
  const code = url.searchParams.get("code") || "";
  const now = Date.now();
  const board = await qzGetBoard(qzBoardKey(mode, period, now), env);
  let me = null;
  if (code) {
    const sess = await getLinkedSession(code, env);
    if (sess) me = sess.userId;
  }
  const shown = board.slice(0, QZ_BOARD_SHOW).map(function (e, i) {
    return { rank: i + 1, n: e.n, p: e.p, s: e.s, c: e.c, ms: e.ms, me: me === e.u };
  });
  let you = null;
  if (me) {
    const idx = board.findIndex(function (e) { return e.u === me; });
    if (idx >= 0) you = { rank: idx + 1, n: board[idx].n, p: board[idx].p, s: board[idx].s, c: board[idx].c, ms: board[idx].ms, me: true };
  }
  return json({
    mode: mode, period: period, entries: shown, you: you, players: board.length,
    weekEndsAt: period === "week" ? qzBangkokWeekKey(now).endsAt : null,
  }, env);
}

/* ------------------------ admin: bank upload tool ------------------------ */

function qzValidSet(arr) {
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 400) return false;
  for (let i = 0; i < arr.length; i++) {
    const q = arr[i];
    if (!q || typeof q.t !== "string" || !Array.isArray(q.c) || q.c.length < 2 || q.c.length > 8) return false;
    if (!Array.isArray(q.a) || !q.a.length) return false;
    for (let j = 0; j < q.a.length; j++) if (!(q.a[j] >= 0 && q.a[j] < q.c.length)) return false;
    if (!q.m && q.a.length !== 1) return false;
  }
  return true;
}

async function handleAdminQuizBankSet(request, env) {
  if (!(await isAdminKeyValid(request, env))) return localToolJson({ error: "unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return localToolJson({ error: "bad_request" }, 400); }
  const n = parseInt(body && body.n, 10);
  if (!(n >= 1 && n <= 9999) || !qzValidSet(body.questions)) return localToolJson({ error: "bad_set" }, 400);
  await env.SESSIONS.put(QZ_SET_PREFIX + n, JSON.stringify(body.questions));
  _qzSetCache.delete(n);
  return localToolJson({ ok: true, n: n, count: body.questions.length });
}

async function handleAdminQuizBankFinalize(request, env) {
  if (!(await isAdminKeyValid(request, env))) return localToolJson({ error: "unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return localToolJson({ error: "bad_request" }, 400); }
  const sets = body && body.sets && typeof body.sets === "object" ? body.sets : null;
  if (!sets) return localToolJson({ error: "bad_request" }, 400);
  const clean = {};
  Object.keys(sets).forEach(function (k) {
    const n = parseInt(k, 10), c = parseInt(sets[k], 10);
    if (n >= 1 && c >= 1) clean[n] = c;
  });
  await env.SESSIONS.put(QZ_META_KEY, JSON.stringify({ sets: clean, updatedAt: Date.now() }));
  return localToolJson({ ok: true, sets: Object.keys(clean).length });
}

/* ====================== end of EXAM ARENA ====================== */

/* ============================================================================
   CLASSROOM EXAM (Round AH) -- teacher-issued logins, one attempt each.
   The admin generates a username + password per student, writes the question
   bank, and reads the results. A student logs in on the site's "Classroom
   Exam" page, answers once, and sees their score. Grading is done here, so the
   page never receives the correct answers until the student has submitted.
   KV (SESSIONS):  cex:bank            { settings, questions[] }
                   cex:u:<username>    one record per student
                   cex:tok:<token>     login token -> username (6 h)
                   cex:fail:<username> failed-login counter (15 min)
   ========================================================================== */
const CEX_USER_PREFIX = "cex:u:";
const CEX_BANK_KEY = "cex:bank";
const CEX_TOK_PREFIX = "cex:tok:";
const CEX_FAIL_PREFIX = "cex:fail:";
const CEX_ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CEX_DEFAULT_SETTINGS = { title: "Elliott Wave Classroom Exam", timeLimitMin: 30, shuffle: true, passPercent: 60 };

function cexRand(n) {
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  let s = ""; for (let i = 0; i < n; i++) s += CEX_ALPHA[a[i] % CEX_ALPHA.length];
  return s;
}
function cexToken() {
  const a = new Uint8Array(24); crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function cexSafeEq(a, b) {
  a = String(a); b = String(b);
  let d = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
function cexUserName(s) { return String(s || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24); }

// ---- several exam sets: "main" = the original bank (legacy key); others live at cex:bank:<id> ----
const CEX_SETS_KEY = "cex:sets";
function cexSetId(s) { return String(s || "main").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "main"; }
function cexBankKey(id) { return id === "main" ? CEX_BANK_KEY : CEX_BANK_KEY + ":" + id; }
async function cexSetIds(env) {
  let ids = [];
  try { const j = JSON.parse((await env.SESSIONS.get(CEX_SETS_KEY)) || "{}"); if (Array.isArray(j.ids)) ids = j.ids.map(cexSetId); } catch (e) { ids = []; }
  if (ids.indexOf("main") === -1) ids.unshift("main");
  return ids.filter((v, i) => ids.indexOf(v) === i);
}
async function cexPutSetIds(ids, env) { await env.SESSIONS.put(CEX_SETS_KEY, JSON.stringify({ ids })); }
async function cexSetsInfo(env) {
  const ids = await cexSetIds(env), out = [];
  for (const id of ids) { const b = await cexGetBank(env, id); out.push({ id, title: b.settings.title, count: b.questions.length, timeLimitMin: b.settings.timeLimitMin }); }
  return out;
}
async function cexGetBank(env, setId) {
  const raw = await env.SESSIONS.get(cexBankKey(cexSetId(setId)));
  let bank = null;
  try { bank = raw ? JSON.parse(raw) : null; } catch (e) { bank = null; }
  if (!bank || !Array.isArray(bank.questions)) bank = { settings: { ...CEX_DEFAULT_SETTINGS }, questions: [] };
  bank.settings = { ...CEX_DEFAULT_SETTINGS, ...(bank.settings || {}) };
  return bank;
}
async function cexGetUser(username, env) {
  const raw = await env.SESSIONS.get(CEX_USER_PREFIX + username);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
async function cexPutUser(u, env) { await env.SESSIONS.put(CEX_USER_PREFIX + u.username, JSON.stringify(u)); }
async function cexAllUsers(env) {
  const out = []; let cursor;
  do {
    const page = await env.SESSIONS.list({ prefix: CEX_USER_PREFIX, cursor });
    for (const k of page.keys) {
      const raw = await env.SESSIONS.get(k.name);
      if (!raw) continue;
      try { out.push(JSON.parse(raw)); } catch (e) { /* skip */ }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  out.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return out;
}
function cexShuffle(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const r = new Uint32Array(1); crypto.getRandomValues(r);
    const j = r[0] % (i + 1); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function cexCleanQuestions(list) {
  const out = [];
  for (const q of (Array.isArray(list) ? list : []).slice(0, 300)) {
    const text = String(q && q.q || "").trim().slice(0, 1200);
    const choices = (Array.isArray(q && q.choices) ? q.choices : []).map((c) => String(c || "").trim().slice(0, 500)).filter((c) => c);
    const ans = parseInt(q && q.ans, 10);
    if (!text || choices.length < 2 || choices.length > 6 || !(ans >= 0 && ans < choices.length)) continue;
    out.push({
      id: String(q.id || ("q" + out.length + "-" + cexRand(4))).slice(0, 24),
      q: text, choices, ans,
      expl: String(q.expl || "").trim().slice(0, 1500),
      topic: String(q.topic || "").trim().slice(0, 60),
      skill: /^(ew([1-9]|1[0-4])|ot[1-8])$/.test(String(q.skill || "")) ? String(q.skill) : "",
    });
  }
  return out;
}
// Per-set results: the ACTIVE set's state lives on the user itself; results of the other sets are parked in u.sets[<id>].
// ---- Per-set state (v3): u.sx[<setId>] = { allow, openAt, status, startedAt, finishedAt, score, total, percent,
//      late, order, answers, review, history[] }. Older records (one active set on the user itself, u.sets archive,
//      u.openAt) are converted the first time they are read.
const CEX_STATE_FIELDS = ["status", "startedAt", "finishedAt", "score", "total", "percent", "late", "order", "answers", "review"];
function cexNorm(u) {
  if (!u || u.sx) return u;
  const sx = {};
  const act = cexSetId(u.setId);
  const top = {}; CEX_STATE_FIELDS.forEach((k) => { if (u[k] !== undefined) top[k] = u[k]; delete u[k]; });
  sx[act] = Object.assign({ allow: true, status: "new" }, top);
  if (u.openAt) sx[act].openAt = u.openAt;
  Object.keys(u.sets || {}).forEach((id) => { sx[cexSetId(id)] = Object.assign({ allow: true, status: "new" }, u.sets[id]); });
  (u.history || []).forEach((h) => {
    const id = cexSetId(h.setId), e = sx[id] || (sx[id] = { allow: true, status: "new" });
    const rec = { finishedAt: h.finishedAt, score: h.score, total: h.total, percent: h.percent };
    if (!h.retake && e.status === "new" && h.finishedAt) Object.assign(e, { status: "done" }, rec);
    else e.history = (e.history || []).concat([rec]).slice(-10);
  });
  delete u.sets; delete u.openAt; delete u.setId; delete u.history;
  u.sx = sx;
  return u;
}
function cexEntry(u, id) { cexNorm(u); return u.sx[id] || null; }
function cexEntryOrNew(u, id) { cexNorm(u); return u.sx[id] || (u.sx[id] = { allow: false, status: "new" }); }
function cexClear(e) { CEX_STATE_FIELDS.forEach((k) => { delete e[k]; }); e.status = "new"; }
function cexRetake(e) {
  if (e.finishedAt) e.history = (e.history || []).concat([{ finishedAt: e.finishedAt, score: e.score, total: e.total, percent: e.percent }]).slice(-10);
  cexClear(e);
}
// A set the student already finished before its (new) open date: when that date arrives, give one fresh attempt.
function cexRearmAll(u) {
  let changed = false;
  Object.keys(u.sx || {}).forEach((id) => {
    const e = u.sx[id];
    if (e.status === "done" && e.openAt && Date.now() >= e.openAt && e.finishedAt && e.finishedAt < e.openAt) { cexRetake(e); changed = true; }
  });
  return changed;
}
function cexExamView(u, ids, withHistory) {
  cexNorm(u);
  return ids.map((id) => {
    const e = u.sx[id] || { allow: false, status: "new" };
    const o = { setId: id, allow: !!e.allow, openAt: e.openAt || null, status: e.status || "new",
      percent: e.percent == null ? null : e.percent, score: e.score == null ? null : e.score, total: e.total == null ? null : e.total,
      finishedAt: e.finishedAt || null, startedAt: e.startedAt || null, late: !!e.late };
    if (withHistory) o.history = (e.history || []).map((h) => ({ percent: h.percent, score: h.score, total: h.total, finishedAt: h.finishedAt }));
    return o;
  });
}
function cexAdminView(u, ids) {
  cexNorm(u);
  ids = ids || Object.keys(u.sx);
  const exams = cexExamView(u, ids, true);
  const cur = exams.find((x) => x.allow && x.status !== "done") || exams.find((x) => x.allow) || exams[0] || { setId: "main", status: "new" };
  return {
    username: u.username, password: u.password, note: u.note || "", displayName: u.displayName || "", createdAt: u.createdAt, learned: u.learned || {},
    exams, results: exams, grades: Array.isArray(u.gb) ? u.gb : [],
    // summary of the "current" set, kept for older screens
    setId: cur.setId, status: cur.status, percent: cur.percent, score: cur.score, total: cur.total, finishedAt: cur.finishedAt, openAt: cur.openAt,
  };
}

// ---------- admin ----------
async function handleCexAdminCreate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { body = {}; }
  const count = Math.max(1, Math.min(30, parseInt(body.count, 10) || 1));
  const note = String(body.note || "").trim().slice(0, 120);
  const ids = await cexSetIds(env);
  const allowSet = cexSetId(body.set || "main");
  const created = [];
  for (let i = 0; i < count; i++) {
    let username = "";
    for (let t = 0; t < 8; t++) {
      username = "EW-" + cexRand(5);
      if (!(await cexGetUser(username, env))) break;
    }
    const u = { username, password: cexRand(8), note, createdAt: Date.now(), sx: {} };
    if (ids.indexOf(allowSet) !== -1) u.sx[allowSet] = { allow: true, status: "new" };
    await cexPutUser(u, env);
    created.push(cexAdminView(u, ids));
  }
  return json({ created }, env);
}
/* =====================================================================
   CERTIFICATES (Round AK) -- Print Report > Certificate.
   Each issued certificate is stored as CERT:<id>. The printed certificate
   carries the id and a QR code to #/cert/<id> on the site, which calls the
   public /api/cert/verify -- so anyone can check the real name, course and
   date. Editing a screenshot cannot change what the verification page shows.
   ===================================================================== */
const CERT_PREFIX = "CERT:";
function certId(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24); }
function certClean(b) {
  const t = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n);
  return { name: t(b.name, 80), nameEn: t(b.nameEn, 80), course: t(b.course, 120), level: t(b.level, 60), date: t(b.date, 20), score: t(b.score, 20), issuedBy: t(b.issuedBy, 80) || "Noraset Boikaw", note: t(b.note, 200), layout: b.layout === "port" ? "port" : "land" };
}
async function handleCertSave(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const c = certClean(body || {});
  if (!c.name) return json({ error: "need_name" }, env, 400);
  let id = certId(body.id);
  let rec = id ? JSON.parse((await env.SESSIONS.get(CERT_PREFIX + id)) || "null") : null;
  if (!rec) {
    for (let t = 0; t < 6; t++) {
      id = "SPZ-" + cexRand(4) + "-" + cexRand(4);
      if (!(await env.SESSIONS.get(CERT_PREFIX + id))) break;
    }
    rec = { id, createdAt: Date.now() };
  }
  Object.assign(rec, c, { updatedAt: Date.now() });
  await env.SESSIONS.put(CERT_PREFIX + id, JSON.stringify(rec));
  return json({ ok: true, id, cert: rec }, env);
}
async function handleCertList(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const out = []; let cursor;
  do {
    const page = await env.SESSIONS.list({ prefix: CERT_PREFIX, cursor });
    for (const k of page.keys) { try { const r = JSON.parse(await env.SESSIONS.get(k.name)); if (r) out.push(r); } catch (e) { /* skip */ } }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  out.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return json({ certs: out.slice(0, 300) }, env);
}
async function handleCertRevoke(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const id = certId(body.id);
  const raw = id && await env.SESSIONS.get(CERT_PREFIX + id);
  if (!raw) return json({ error: "not_found" }, env, 404);
  if (body.delete === true) { await env.SESSIONS.delete(CERT_PREFIX + id); return json({ ok: true, deleted: true }, env); }
  const rec = JSON.parse(raw); rec.updatedAt = Date.now();
  if (typeof body.archive === "boolean") rec.archived = body.archive;   /* Round AN: move into / out of the archive folder */
  else rec.revoked = body.revoke !== false;
  await env.SESSIONS.put(CERT_PREFIX + id, JSON.stringify(rec));
  return json({ ok: true, cert: rec }, env);
}
/* =====================================================================
   EBOOK DISTRIBUTION REGISTRY -- every personal copy of the ebook gets its
   own record: who it was given to, a random code (EB-XXXXXX), a serial
   number that is also hidden in the PDF as a dot pattern, a seed for the
   per-copy wording variants, and the recipient's acceptance of the terms
   (time, IP, country, browser, the name they typed). The admin uploads the
   personalised PDF; the recipient can only download it from the public
   ebook.html page after accepting the terms with their private link.
   KV: EBK:<id> record, EBKF:<id> PDF bytes, EBK_SERIAL counter.
   ===================================================================== */
const EBK_PREFIX = "EBK:", EBKF_PREFIX = "EBKF:", EBK_MAX_PDF = 24 * 1024 * 1024;
const EBK_TERMS_VERSION = "2026-10-14", EBKH_PREFIX = "EBKH:";
function ebkId(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20); }
function ebkClean(v, n) { return String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n); }
function ebkPublic(r) { return { id: r.id, name: r.name, lang: r.lang, title: r.title, accepted: !!r.accepted, revoked: !!r.revoked, hasFile: !!r.hasFile, termsVersion: EBK_TERMS_VERSION }; }
async function ebkGet(env, id) { const raw = id && await env.SESSIONS.get(EBK_PREFIX + id); return raw ? JSON.parse(raw) : null; }
async function ebkPut(env, r) { r.updatedAt = Date.now(); await env.SESSIONS.put(EBK_PREFIX + r.id, JSON.stringify(r)); }
async function handleEbookIssue(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const name = ebkClean(body.name, 80);
  if (!name) return json({ error: "need_name" }, env, 400);
  const serial = (parseInt(await env.SESSIONS.get("EBK_SERIAL") || "0", 10) || 0) + 1;
  if (serial > 65535) return json({ error: "full" }, env, 400);
  await env.SESSIONS.put("EBK_SERIAL", String(serial));
  let id = "";
  for (let t = 0; t < 6; t++) { id = "EB-" + cexRand(6); if (!(await env.SESSIONS.get(EBK_PREFIX + id))) break; }
  const seedBytes = new Uint8Array(4); crypto.getRandomValues(seedBytes);
  const rec = {
    id, serial, token: cexToken(), seed: (seedBytes[0] << 24 | seedBytes[1] << 16 | seedBytes[2] << 8 | seedBytes[3]) >>> 0,
    name, contact: ebkClean(body.contact, 120), note: ebkClean(body.note, 300), lang: body.lang === "en" ? "en" : "th",
    title: ebkClean(body.title, 120) || "Elliott Wave Classroom", createdAt: Date.now(), accepted: null, revoked: false, hasFile: false, downloads: []
  };
  await ebkPut(env, rec);
  return json({ ok: true, ebook: rec }, env);
}
async function handleEbookList(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const out = []; let cursor;
  do {
    const page = await env.SESSIONS.list({ prefix: EBK_PREFIX, cursor });
    for (const k of page.keys) { try { const r = JSON.parse(await env.SESSIONS.get(k.name)); if (r && r.id) out.push(r); } catch (e) { /* skip */ } }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  out.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return json({ ebooks: out, termsVersion: EBK_TERMS_VERSION }, env);
}
async function handleEbookUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const rec = await ebkGet(env, ebkId(body.id));
  if (!rec) return json({ error: "not_found" }, env, 404);
  if (body.delete === true) {
    await env.SESSIONS.delete(EBK_PREFIX + rec.id); await env.SESSIONS.delete(EBKF_PREFIX + rec.id);
    if (rec.fileSha256) await env.SESSIONS.delete(EBKH_PREFIX + rec.fileSha256);
    /* numbering continues from the highest copy still in the registry, so deleting test copies frees their numbers */
    let max = 0, cursor;
    do {
      const page = await env.SESSIONS.list({ prefix: EBK_PREFIX, cursor });
      for (const k of page.keys) { try { const r = JSON.parse(await env.SESSIONS.get(k.name)); if (r && r.serial > max) max = r.serial; } catch (e) { /* skip */ } }
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    await env.SESSIONS.put("EBK_SERIAL", String(max));
    return json({ ok: true, deleted: true, nextSerial: max + 1 }, env);
  }
  if (typeof body.revoke === "boolean") rec.revoked = body.revoke;
  if (typeof body.note === "string") rec.note = ebkClean(body.note, 300);
  if (typeof body.contact === "string") rec.contact = ebkClean(body.contact, 120);
  await ebkPut(env, rec);
  return json({ ok: true, ebook: rec }, env);
}
async function handleEbookUpload(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const rec = await ebkGet(env, ebkId(new URL(request.url).searchParams.get("id")));
  if (!rec) return json({ error: "not_found" }, env, 404);
  const buf = await request.arrayBuffer();
  if (!buf || buf.byteLength < 100) return json({ error: "empty" }, env, 400);
  if (buf.byteLength > EBK_MAX_PDF) return json({ error: "too_big" }, env, 413);
  const head = new Uint8Array(buf.slice(0, 5));
  if (String.fromCharCode.apply(null, head) !== "%PDF-") return json({ error: "not_pdf" }, env, 400);
  await env.SESSIONS.put(EBKF_PREFIX + rec.id, buf);
  const dig = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  if (rec.fileSha256) await env.SESSIONS.delete(EBKH_PREFIX + rec.fileSha256);
  rec.hasFile = true; rec.fileSize = buf.byteLength; rec.fileAt = Date.now();
  rec.fileSha256 = Array.prototype.map.call(dig, (x) => ("0" + x.toString(16)).slice(-2)).join("");
  await env.SESSIONS.put(EBKH_PREFIX + rec.fileSha256, rec.id);
  await ebkPut(env, rec);
  return json({ ok: true, ebook: rec }, env);
}
function ebkTokenOk(rec, t) { return !!(rec && t && typeof t === "string" && t.length === rec.token.length && ctEqual(t, rec.token)); }
async function handleEbookTerms(request, env) {
  const u = new URL(request.url), rec = await ebkGet(env, ebkId(u.searchParams.get("id")));
  if (!ebkTokenOk(rec, u.searchParams.get("t"))) return json({ error: "not_found" }, env, 404);
  return json({ ok: true, ebook: ebkPublic(rec) }, env);
}
async function handleEbookAccept(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const rec = await ebkGet(env, ebkId(body.id));
  if (!ebkTokenOk(rec, body.t)) return json({ error: "not_found" }, env, 404);
  if (rec.revoked) return json({ error: "revoked" }, env, 403);
  const typed = ebkClean(body.typedName, 80);
  if (body.agree !== true || !typed) return json({ error: "need_agree" }, env, 400);
  if (!rec.accepted) {
    rec.accepted = {
      at: Date.now(), typedName: typed, typedContact: ebkClean(body.typedContact, 120), termsVersion: EBK_TERMS_VERSION, termsHash: ebkClean(body.termsHash, 80),
      ip: request.headers.get("CF-Connecting-IP") || "", country: (request.cf && request.cf.country) || "",
      ua: ebkClean(request.headers.get("User-Agent"), 300)
    };
    await ebkPut(env, rec);
  }
  return json({ ok: true, ebook: ebkPublic(rec) }, env);
}
async function handleEbookDownload(request, env, origin) {
  const u = new URL(request.url), rec = await ebkGet(env, ebkId(u.searchParams.get("id")));
  if (!ebkTokenOk(rec, u.searchParams.get("t"))) return json({ error: "not_found" }, env, 404);
  if (rec.revoked) return json({ error: "revoked" }, env, 403);
  if (!rec.accepted) return json({ error: "need_agree" }, env, 403);
  const buf = await env.SESSIONS.get(EBKF_PREFIX + rec.id, "arrayBuffer");
  if (!buf) return json({ error: "no_file" }, env, 404);
  rec.downloads = (rec.downloads || []).concat([{ at: Date.now(), ip: request.headers.get("CF-Connecting-IP") || "", country: (request.cf && request.cf.country) || "" }]).slice(-30);
  await ebkPut(env, rec);
  return new Response(buf, { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store", ...corsHeaders(env) } });
}
/* public check, no login: is this code or this file an official copy? Never returns the recipient name. */
async function handleEbookVerify(request, env) {
  const u = new URL(request.url), sha = String(u.searchParams.get("sha") || "").toLowerCase();
  let rec = null, by = "code";
  if (/^[0-9a-f]{64}$/.test(sha)) { by = "sha"; const id = await env.SESSIONS.get(EBKH_PREFIX + sha); rec = id ? await ebkGet(env, id) : null; }
  else { let c = ebkId(u.searchParams.get("code")); if (c && c.indexOf("EB-") !== 0) c = "EB-" + c; rec = await ebkGet(env, c); }
  if (!rec) return json({ ok: true, found: false, by }, env);
  return json({ ok: true, found: true, by, id: rec.id, title: rec.title, issuedAt: rec.createdAt, revoked: !!rec.revoked, accepted: !!rec.accepted, fileMatch: by === "sha" }, env);
}
async function handleCertVerify(request, env) {
  const id = certId(new URL(request.url).searchParams.get("id"));
  const raw = id && await env.SESSIONS.get(CERT_PREFIX + id);
  if (!raw) return json({ valid: false, error: "not_found" }, env, 404);
  const r = JSON.parse(raw);
  return json({ valid: !r.revoked, revoked: !!r.revoked, id: r.id, name: r.name, nameEn: r.nameEn || "", course: r.course, level: r.level, date: r.date, score: r.score || "", issuedBy: r.issuedBy }, env);
}

/* =====================================================================
   STUDENT EVALUATIONS (Print Report > Student Evaluation)
   Admin saves an evaluation online (KV: EVAL:<id>). Each one may have a
   READ-ONLY share link token (EVALTOK:<token> -> id), printed as a QR code
   on the report. Anyone holding the token can read that one evaluation --
   no login -- so the token is long and random, and the admin can switch it
   off or replace it at any time. Editing always needs the admin key.
   ===================================================================== */
const EVAL_PREFIX = "EVAL:";
const EVALTOK_PREFIX = "EVALTOK:";
const EVAL_MAX_BYTES = 60000;
function evalRandom(len, alphabet) {
  const a = new Uint8Array(len); crypto.getRandomValues(a);
  let s = ""; for (let i = 0; i < len; i++) s += alphabet[a[i] % alphabet.length];
  return s;
}
const EVAL_ID_ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
function evalNewId() { return evalRandom(12, EVAL_ID_ALPHA); }
function evalNewToken() { return evalRandom(26, EVAL_ID_ALPHA); }
function evalSafeId(v) { return typeof v === "string" && /^[a-z0-9]{6,32}$/.test(v) ? v : ""; }
async function evalGet(id, env) {
  const raw = await env.SESSIONS.get(EVAL_PREFIX + id);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function evalSummary(r) {
  const d = r.data || {};
  return { id: r.id, name: String(d.name || "").slice(0, 80), cls: String(d.cls || "").slice(0, 80), date: String(d.date || ""),
    updatedAt: r.updatedAt || 0, shared: !!r.token, revokedBy: r.revokedBy || "" };
}
async function handleEvalSave(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  if (!body || typeof body.data !== "object" || body.data === null || Array.isArray(body.data)) return json({ error: "bad_request" }, env, 400);
  const dataStr = JSON.stringify(body.data);
  if (dataStr.length > EVAL_MAX_BYTES) return json({ error: "too_large" }, env, 413);
  const now = Date.now();
  let rec = null;
  const id = evalSafeId(body.id);
  if (id) rec = await evalGet(id, env);
  if (!rec) rec = { id: evalNewId(), token: null, createdAt: now };
  rec.data = body.data; rec.updatedAt = now;
  if (body.share === true && !rec.token) {
    rec.token = evalNewToken();
    await env.SESSIONS.put(EVALTOK_PREFIX + rec.token, rec.id);
  }
  await env.SESSIONS.put(EVAL_PREFIX + rec.id, JSON.stringify(rec));
  return json({ ok: true, id: rec.id, token: rec.token, updatedAt: rec.updatedAt }, env);
}
async function handleEvalList(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const out = []; let cursor;
  do {
    const page = await env.SESSIONS.list({ prefix: EVAL_PREFIX, cursor });
    for (const k of page.keys) {
      const raw = await env.SESSIONS.get(k.name);
      if (!raw) continue;
      try { out.push(evalSummary(JSON.parse(raw))); } catch (e) { /* skip */ }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return json({ evals: out }, env);
}
async function handleEvalGet(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const id = evalSafeId(new URL(request.url).searchParams.get("id") || "");
  const rec = id ? await evalGet(id, env) : null;
  if (!rec) return json({ error: "not_found" }, env, 404);
  return json({ id: rec.id, token: rec.token || null, data: rec.data, updatedAt: rec.updatedAt }, env);
}
// action: "share" (create link if none), "rotate" (new link, old one stops), "revoke" (switch link off), "delete"
async function handleEvalLink(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const id = evalSafeId(body && body.id);
  const rec = id ? await evalGet(id, env) : null;
  if (!rec) return json({ error: "not_found" }, env, 404);
  const act = body.action;
  if (act === "delete") {
    if (rec.token) await env.SESSIONS.delete(EVALTOK_PREFIX + rec.token);
    await env.SESSIONS.delete(EVAL_PREFIX + rec.id);
    return json({ ok: true, deleted: true }, env);
  }
  if (act === "revoke" || act === "rotate") {
    if (rec.token) await env.SESSIONS.delete(EVALTOK_PREFIX + rec.token);
    rec.token = null; rec.revokedBy = "";
  }
  if ((act === "share" || act === "rotate") && !rec.token) {
    rec.token = evalNewToken();
    await env.SESSIONS.put(EVALTOK_PREFIX + rec.token, rec.id);
  }
  if (["share", "rotate", "revoke"].indexOf(act) === -1) return json({ error: "bad_request" }, env, 400);
  await env.SESSIONS.put(EVAL_PREFIX + rec.id, JSON.stringify(rec));
  return json({ ok: true, id: rec.id, token: rec.token }, env);
}
// PUBLIC: the student (token holder) can switch THEIR OWN link off for privacy. Data stays with the teacher.
async function handleEvalSelfRevoke(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const t = String((body && body.t) || "").toLowerCase();
  if (!/^[a-z0-9]{20,40}$/.test(t)) return json({ error: "not_found" }, env, 404);
  const id = await env.SESSIONS.get(EVALTOK_PREFIX + t);
  const rec = id ? await evalGet(id, env) : null;
  if (!rec || rec.token !== t) return json({ error: "not_found" }, env, 404);
  await env.SESSIONS.delete(EVALTOK_PREFIX + t);
  rec.token = null; rec.revokedBy = "student"; rec.revokedAt = Date.now();
  await env.SESSIONS.put(EVAL_PREFIX + rec.id, JSON.stringify(rec));
  return json({ ok: true }, env);
}
// PUBLIC read-only: whoever has the long random token can read exactly that one evaluation.
async function handleEvalView(request, env) {
  const t = (new URL(request.url).searchParams.get("t") || "").toLowerCase();
  if (!/^[a-z0-9]{20,40}$/.test(t)) return json({ error: "not_found" }, env, 404);
  const id = await env.SESSIONS.get(EVALTOK_PREFIX + t);
  const rec = id ? await evalGet(id, env) : null;
  if (!rec || rec.token !== t) return json({ error: "not_found" }, env, 404);
  const res = json({ data: rec.data, updatedAt: rec.updatedAt }, env);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

async function handleCexAdminList(request, env) {
  if (!(await isAdminOrEditorRead(request, env))) return json({ error: "unauthorized" }, env, 401);
  const ids = await cexSetIds(env);
  const users = (await cexAllUsers(env)).map((x) => cexAdminView(x, ids));
  return json({ users }, env);
}
function cexOpenAtVal(v) {
  if (v === null || v === 0) return 0;
  if (typeof v === "number" && isFinite(v) && v > 946684800000 && v < Date.now() + 5 * 365 * 86400000) return Math.floor(v);
  return undefined;
}
async function handleCexAdminUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const username = cexUserName(body.username);
  const u = username ? await cexGetUser(username, env) : null;
  if (!u) return json({ error: "not_found" }, env, 404);
  if (body.delete === true) { await env.SESSIONS.delete(CEX_USER_PREFIX + username); return json({ ok: true, deleted: true }, env); }
  cexNorm(u);
  const ids = await cexSetIds(env);
  if (typeof body.note === "string") u.note = body.note.trim().slice(0, 120);
  if (body.clearName === true) delete u.displayName;
  if (body.learned && typeof body.learned === "object") {
    u.learned = u.learned || {};
    Object.keys(body.learned).slice(0, 60).forEach((k) => {
      if (!/^[a-z0-9]{2,12}$/.test(k)) return;
      if (body.learned[k]) u.learned[k] = u.learned[k] || Date.now(); else delete u.learned[k];
    });
  }
  // which set? "set" (new screens) or "setId" (older Print Report button = also allow it)
  let sid = null;
  if (typeof body.set === "string") sid = cexSetId(body.set);
  else if (typeof body.setId === "string") { sid = cexSetId(body.setId); if (body.allow === undefined) body.allow = true; }
  else if (body.openAt !== undefined || body.reset === true) {
    sid = (ids.find((id) => u.sx[id] && u.sx[id].allow && u.sx[id].status !== "done") || ids.find((id) => u.sx[id] && u.sx[id].allow) || "main");
  }
  if (sid) {
    if (ids.indexOf(sid) === -1) return json({ error: "no_set" }, env, 404);
    const e = cexEntryOrNew(u, sid);
    if (typeof body.allow === "boolean") e.allow = body.allow;
    const oa = cexOpenAtVal(body.openAt);
    if (oa === 0) delete e.openAt; else if (oa) e.openAt = oa;
    if (body.reset === true) cexRetake(e);
  }
  await cexPutUser(u, env);
  return json({ ok: true, user: cexAdminView(u, ids) }, env);
}
async function handleCexAdminBankGet(request, env) {
  if (!(await isAdminOrEditorRead(request, env))) return json({ error: "unauthorized" }, env, 401);
  return json(await cexGetBank(env, new URL(request.url).searchParams.get("set")), env);
}
async function handleCexAdminBankSet(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const st = body.settings || {};
  const settings = {
    title: String(st.title || CEX_DEFAULT_SETTINGS.title).trim().slice(0, 120),
    timeLimitMin: Math.max(0, Math.min(300, parseInt(st.timeLimitMin, 10) || 0)),
    shuffle: st.shuffle !== false,
    passPercent: st.passPercent === undefined || st.passPercent === "" ? CEX_DEFAULT_SETTINGS.passPercent : Math.max(0, Math.min(100, parseInt(st.passPercent, 10) || 0)),
  };
  const questions = cexCleanQuestions(body.questions);
  const sid = cexSetId(body.set);
  if ((await cexSetIds(env)).indexOf(sid) === -1) return json({ error: "no_set" }, env, 404);
  await env.SESSIONS.put(cexBankKey(sid), JSON.stringify({ settings, questions }));
  return json({ ok: true, count: questions.length, settings }, env);
}
// ---------- Round AO: gradebook -- manual score entries stored on the classroom exam account ----------
const GB_KINDS = ["exam", "quiz", "homework", "practice", "project", "attendance", "other"];
function gbClean(e) {
  if (!e || typeof e !== "object") return null;
  const num = (v) => { const n = Number(v); return isFinite(n) ? Math.round(n * 100) / 100 : null; };
  const score = num(e.score), max = num(e.max);
  if (score === null || max === null || max <= 0 || score < 0 || score > max * 2) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(e.date || "")) ? String(e.date) : new Date().toISOString().slice(0, 10);
  return {
    date, kind: GB_KINDS.indexOf(e.kind) !== -1 ? e.kind : "other",
    title: String(e.title || "").trim().slice(0, 100) || "-",
    score, max, note: String(e.note || "").trim().slice(0, 240),
  };
}
async function handleCexAdminGrades(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const username = cexUserName(body.username);
  const u = username ? await cexGetUser(username, env) : null;
  if (!u) return json({ error: "not_found" }, env, 404);
  cexNorm(u);
  const gb = Array.isArray(u.gb) ? u.gb : [];
  const op = String(body.op || "");
  if (op === "add" || op === "edit") {
    const e = gbClean(body.entry);
    if (!e) return json({ error: "bad_entry" }, env, 400);
    if (op === "add") {
      if (gb.length >= 300) return json({ error: "too_many" }, env, 400);
      e.id = "g" + cexRand(8).toLowerCase(); e.at = Date.now();
      gb.push(e);
    } else {
      const i = gb.findIndex((x) => x.id === body.id);
      if (i === -1) return json({ error: "not_found" }, env, 404);
      gb[i] = Object.assign({ id: gb[i].id, at: gb[i].at }, e, { editedAt: Date.now() });
    }
  } else if (op === "del") {
    const i = gb.findIndex((x) => x.id === body.id);
    if (i === -1) return json({ error: "not_found" }, env, 404);
    gb.splice(i, 1);
  } else {
    return json({ error: "bad_op" }, env, 400);
  }
  u.gb = gb;
  await cexPutUser(u, env);
  return json({ ok: true, grades: gb }, env);
}

async function handleCexAdminSets(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  return json({ sets: await cexSetsInfo(env) }, env);
}
async function handleCexAdminSetCreate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { body = {}; }
  const ids = await cexSetIds(env);
  if (ids.length >= 20) return json({ error: "too_many_sets" }, env, 400);
  const id = "s" + cexRand(5).toLowerCase();
  const title = String(body.title || "").trim().slice(0, 120) || ("Exam set " + ids.length);
  await env.SESSIONS.put(cexBankKey(id), JSON.stringify({ settings: { ...CEX_DEFAULT_SETTINGS, title }, questions: [] }));
  ids.push(id); await cexPutSetIds(ids, env);
  return json({ ok: true, id, sets: await cexSetsInfo(env) }, env);
}
async function handleCexAdminSetDelete(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let body; try { body = await request.json(); } catch (e) { body = {}; }
  const id = cexSetId(body.id);
  if (id === "main") return json({ error: "cannot_delete_main" }, env, 400);
  const ids = (await cexSetIds(env)).filter((x) => x !== id);
  await cexPutSetIds(ids, env); await env.SESSIONS.delete(cexBankKey(id));
  return json({ ok: true, sets: await cexSetsInfo(env) }, env);
}
async function handleCexAdminResult(request, env) {
  if (!(await isAdminOrEditorRead(request, env))) return json({ error: "unauthorized" }, env, 401);
  const q = new URL(request.url).searchParams;
  const username = cexUserName(q.get("username"));
  const u = username ? await cexGetUser(username, env) : null;
  if (!u) return json({ error: "not_found" }, env, 404);
  const ids = await cexSetIds(env);
  const view = cexAdminView(u, ids);
  const want = cexSetId(q.get("set") || view.setId);
  const e = u.sx[want] || {};
  return json({ user: view, setId: want, result: { status: e.status || "new", percent: e.percent == null ? null : e.percent, score: e.score == null ? null : e.score, total: e.total == null ? null : e.total, finishedAt: e.finishedAt || null }, review: e.review || [], history: e.history || [] }, env);
}

// ---------- student ----------
async function cexUserFromToken(body, env) {
  const tok = String(body && body.token || "");
  if (!/^[a-f0-9]{48}$/.test(tok)) return null;
  const username = await env.SESSIONS.get(CEX_TOK_PREFIX + tok);
  if (!username) return null;
  return cexNorm(await cexGetUser(username, env));
}
function cexPublicQuestions(bank, e) {
  const byId = {}; bank.questions.forEach((q) => { byId[q.id] = q; });
  return (e.order || []).map((id) => byId[id]).filter(Boolean).map((q) => ({ id: q.id, q: q.q, choices: q.choices, topic: q.topic }));
}
function cexTiming(bank, e) {
  const lim = bank.settings.timeLimitMin;
  if (!lim || !e.startedAt) return { limitMin: lim || 0, remainingMs: null };
  return { limitMin: lim, remainingMs: Math.max(0, e.startedAt + lim * 60000 - Date.now()) };
}
// Everything the student page needs: only the sets the teacher allowed.
async function cexStudentExams(u, env) {
  const ids = await cexSetIds(env), out = [];
  for (const id of ids) {
    const e = u.sx[id];
    if (!e || !e.allow) continue;
    const b = await cexGetBank(env, id);
    out.push({ setId: id, title: b.settings.title, total: b.questions.length, limitMin: b.settings.timeLimitMin, passPercent: b.settings.passPercent,
      status: e.status || "new", openAt: e.openAt || 0, percent: e.percent == null ? null : e.percent, score: e.score == null ? null : e.score,
      pass: e.status === "done" ? e.percent >= b.settings.passPercent : null });
  }
  return out;
}
function cexPickSet(u, ids, want, statusPick) {
  if (want) return cexSetId(want);
  return ids.find((id) => u.sx[id] && u.sx[id].allow && u.sx[id].status === statusPick) || null;
}
async function handleCexLogin(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const username = cexUserName(body.username);
  const password = String(body.password || "").trim().toUpperCase();
  if (!username || !password) return json({ error: "bad_login" }, env, 400);
  const failKey = CEX_FAIL_PREFIX + username;
  const fails = parseInt(await env.SESSIONS.get(failKey), 10) || 0;
  if (fails >= 8) return json({ error: "too_many" }, env, 429);
  const u = await cexGetUser(username, env);
  if (!u || !cexSafeEq(String(u.password).toUpperCase(), password)) {
    await env.SESSIONS.put(failKey, String(fails + 1), { expirationTtl: 900 });
    return json({ error: "bad_login" }, env, 401);
  }
  const hadSx = !!u.sx;
  cexNorm(u);
  if (cexRearmAll(u) || !hadSx) await cexPutUser(u, env);
  const token = cexToken();
  await env.SESSIONS.put(CEX_TOK_PREFIX + token, username, { expirationTtl: 21600 });
  return json({ token, username, note: u.note || "", displayName: u.displayName || "", learned: Object.keys(u.learned || {}), exams: await cexStudentExams(u, env) }, env);
}
// Student sets their own display name ONCE (locked afterwards; only the teacher can clear it).
async function handleCexSetName(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const u = await cexUserFromToken(body, env);
  if (!u) return json({ error: "bad_token" }, env, 401);
  if (u.displayName) return json({ error: "name_locked", displayName: u.displayName }, env, 409);
  const name = String(body.name || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (name.length < 2) return json({ error: "bad_name" }, env, 400);
  u.displayName = name; u.nameSetAt = Date.now();
  await cexPutUser(u, env);
  return json({ ok: true, displayName: name }, env);
}
async function handleCexMyResult(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const u = await cexUserFromToken(body, env);
  if (!u) return json({ error: "bad_token" }, env, 401);
  const sid = cexSetId(body.set);
  const e = u.sx[sid];
  if (!e || !e.allow || e.status !== "done") return json({ error: "not_found" }, env, 404);
  const bank = await cexGetBank(env, sid);
  return json({ setId: sid, title: bank.settings.title, score: e.score, total: e.total, percent: e.percent, pass: e.percent >= bank.settings.passPercent, passPercent: bank.settings.passPercent, late: !!e.late, review: e.review || [] }, env);
}
async function handleCexStart(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const u = await cexUserFromToken(body, env);
  if (!u) return json({ error: "bad_token" }, env, 401);
  if (!u.displayName) return json({ error: "need_name" }, env, 403);
  if (cexRearmAll(u)) await cexPutUser(u, env);
  const ids = await cexSetIds(env);
  const sid = cexPickSet(u, ids, body.set, "started") || cexPickSet(u, ids, null, "new");
  const e = sid && u.sx[sid];
  if (!e || !e.allow || ids.indexOf(sid) === -1) return json({ error: "not_allowed" }, env, 403);
  if (e.status === "done") return json({ error: "already_done" }, env, 409);
  if (e.status !== "started" && e.openAt && Date.now() < e.openAt) return json({ error: "not_open", openAt: e.openAt }, env, 403);
  const bank = await cexGetBank(env, sid);
  if (!bank.questions.length) return json({ error: "no_questions" }, env, 503);
  if (e.status !== "started") {
    const idx = bank.settings.shuffle ? cexShuffle(bank.questions.length) : bank.questions.map((_, i) => i);
    e.order = idx.map((i) => bank.questions[i].id);
    e.status = "started"; e.startedAt = Date.now();
    await cexPutUser(u, env);
  }
  const t = cexTiming(bank, e);
  return json({ setId: sid, title: bank.settings.title, questions: cexPublicQuestions(bank, e), limitMin: t.limitMin, remainingMs: t.remainingMs }, env);
}
async function handleCexSubmit(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const u = await cexUserFromToken(body, env);
  if (!u) return json({ error: "bad_token" }, env, 401);
  const ids = await cexSetIds(env);
  const sid = cexPickSet(u, ids, body.set, "started");
  const e = sid && u.sx[sid];
  if (!e) return json({ error: "not_started" }, env, 409);
  if (e.status === "done") return json({ error: "already_done" }, env, 409);
  if (e.status !== "started") return json({ error: "not_started" }, env, 409);
  const bank = await cexGetBank(env, sid);
  const answers = (body.answers && typeof body.answers === "object") ? body.answers : {};
  const byId = {}; bank.questions.forEach((q) => { byId[q.id] = q; });
  const qids = (e.order || []).filter((id) => byId[id]);
  let score = 0; const review = [];
  for (const id of qids) {
    const q = byId[id];
    const a = parseInt(answers[id], 10);
    const given = a >= 0 && a < q.choices.length ? a : -1;
    const ok = given === q.ans; if (ok) score++;
    review.push({ q: q.q, choices: q.choices, given, correct: q.ans, ok, expl: q.expl || "", topic: q.topic || "", skill: q.skill || "" });
  }
  const lim = bank.settings.timeLimitMin;
  e.late = !!(lim && Date.now() > e.startedAt + lim * 60000 + 20000);
  e.status = "done"; e.finishedAt = Date.now();
  e.score = score; e.total = qids.length; e.percent = qids.length ? Math.round((score / qids.length) * 100) : 0;
  e.answers = answers; e.review = review;
  await cexPutUser(u, env);
  return json({ setId: sid, title: bank.settings.title, score, total: e.total, percent: e.percent, pass: e.percent >= bank.settings.passPercent, passPercent: bank.settings.passPercent, late: e.late, review }, env);
}

/* =====================================================================
   SITE ACCOUNTS (Round AM)
   The admin creates username + password accounts from Connected Users.
   Each account has a role: "member" (member pages), "editor" (member pages
   + read-only Editor content) or "student" (member pages; for classroom
   students). Passwords are never stored: only a salted PBKDF2-SHA256
   (100,000 rounds) hash. The admin sees a password once, at creation or
   on "reset password". On first login the user must set a display name.
   KV: ACC:<username> = account, acc:index = [usernames],
       ACCTOK:<token> = username (30-day TTL), acc:fail:<ip> = fail count.
   ===================================================================== */
const ACC_PREFIX = "ACC:", ACC_INDEX = "acc:index", ACCTOK_PREFIX = "ACCTOK:";
const ACC_ROLES = ["member", "editor", "student"];
const ACC_TTL = 60 * 60 * 24 * 30;
const ACC_PW_ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function accRand(n, alpha) {
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  let s = ""; for (let i = 0; i < n; i++) s += alpha[a[i] % alpha.length];
  return s;
}
function accB64(u8) { let b = ""; for (let i = 0; i < u8.length; i++) b += String.fromCharCode(u8[i]); return btoa(b); }
async function accHash(pw, saltB64) {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, k, 256);
  return accB64(new Uint8Array(bits));
}
async function accSetPassword(acc) {
  const pw = accRand(10, ACC_PW_ALPHA);
  const salt = new Uint8Array(16); crypto.getRandomValues(salt);
  acc.salt = accB64(salt);
  acc.hash = await accHash(pw, acc.salt);
  acc.pwSetAt = Date.now();
  return pw;
}
async function accGet(env, u) { try { const r = await env.SESSIONS.get(ACC_PREFIX + u); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
async function accPut(env, a) { await env.SESSIONS.put(ACC_PREFIX + a.username, JSON.stringify(a)); }
async function accIndex(env) { try { const r = await env.SESSIONS.get(ACC_INDEX); const a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function accPublic(a) {
  return { username: a.username, displayName: a.displayName || "", role: a.role, note: a.note || "", disabled: !!a.disabled,
    needName: !a.displayName, createdAt: a.createdAt, lastLoginAt: a.lastLoginAt || 0, pwSetAt: a.pwSetAt || 0, links: a.links || {} };
}
function accCleanName(s) { return String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 60); }
async function accFromToken(env, token) {
  if (!token || typeof token !== "string" || token.length > 80) return null;
  const v = await env.SESSIONS.get(ACCTOK_PREFIX + token);
  if (!v) return null;
  const parts = v.split("|");
  const a = await accGet(env, parts[0]);
  if (!a || a.disabled) return null;
  if ((parseInt(parts[1], 10) || 0) !== (a.tokVer || 0)) return null;   /* password was reset -> old logins end */
  return a;
}
async function handleAccCreate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let b; try { b = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const count = Math.max(1, Math.min(30, parseInt(b.count, 10) || 1));
  const role = ACC_ROLES.indexOf(b.role) !== -1 ? b.role : "member";
  const note = accCleanName(b.note);
  const idx = await accIndex(env), created = [];
  for (let i = 0; i < count; i++) {
    let username = "";
    for (let t = 0; t < 8; t++) { const c = "SPZ-" + accRand(5, ACC_PW_ALPHA); if (idx.indexOf(c) === -1 && !(await accGet(env, c))) { username = c; break; } }
    if (!username) continue;
    const a = { username, role, note, displayName: "", createdAt: Date.now(), disabled: false };
    const password = await accSetPassword(a);
    await accPut(env, a); idx.push(username);
    created.push({ username, password, role });
  }
  await env.SESSIONS.put(ACC_INDEX, JSON.stringify(idx));
  return json({ ok: true, created }, env);
}
async function handleAccList(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  const idx = await accIndex(env), out = [];
  for (const u of idx) { const a = await accGet(env, u); if (a) out.push(accPublic(a)); }
  return json({ accounts: out }, env);
}
async function handleAccUpdate(request, env) {
  if (!(await isAdminKeyValid(request, env))) return json({ error: "unauthorized" }, env, 401);
  let b; try { b = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const a = await accGet(env, String(b.username || ""));
  if (!a) return json({ error: "not_found" }, env, 404);
  if (b.delete === true) {
    await env.SESSIONS.delete(ACC_PREFIX + a.username);
    const idx = (await accIndex(env)).filter((x) => x !== a.username);
    await env.SESSIONS.put(ACC_INDEX, JSON.stringify(idx));
    return json({ ok: true, deleted: a.username }, env);
  }
  let password;
  if (ACC_ROLES.indexOf(b.role) !== -1) a.role = b.role;
  if (typeof b.disabled === "boolean") a.disabled = b.disabled;
  if (typeof b.note === "string") a.note = accCleanName(b.note);
  if (typeof b.displayName === "string") a.displayName = accCleanName(b.displayName);
  if (b.clearName === true) a.displayName = "";
  if (b.resetPassword === true) { password = await accSetPassword(a); a.tokVer = (a.tokVer || 0) + 1; }
  await accPut(env, a);
  return json({ ok: true, account: accPublic(a), password }, env);
}
function accIp(request) { return request.headers.get("CF-Connecting-IP") || "0"; }
async function handleAccLogin(request, env) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const ip = accIp(request), fk = "acc:fail:" + ip;
  const fails = parseInt((await env.SESSIONS.get(fk)) || "0", 10) || 0;
  if (fails >= 10) return json({ error: "locked" }, env, 429);
  const username = String(b.username || "").trim().toUpperCase().slice(0, 20);
  const password = String(b.password || "").trim().toUpperCase().slice(0, 40);
  const a = username ? await accGet(env, username) : null;
  let ok = false;
  if (a && a.salt && password) ok = cexSafeEq(await accHash(password, a.salt), a.hash);
  if (!ok || a.disabled) {
    await env.SESSIONS.put(fk, String(fails + 1), { expirationTtl: 900 });
    return json({ error: a && a.disabled && ok ? "disabled" : "bad_login" }, env, 401);
  }
  const token = accRand(32, "abcdefghijkmnpqrstuvwxyz23456789");
  await env.SESSIONS.put(ACCTOK_PREFIX + token, a.username + "|" + (a.tokVer || 0), { expirationTtl: ACC_TTL });
  a.lastLoginAt = Date.now(); await accPut(env, a);
  return json({ ok: true, token, account: accPublic(a) }, env);
}
async function handleAccMe(request, env) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const a = await accFromToken(env, b.token);
  if (!a) return json({ error: "no_session" }, env, 401);
  return json({ ok: true, account: accPublic(a) }, env);
}
async function handleAccSetName(request, env) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  const a = await accFromToken(env, b.token);
  if (!a) return json({ error: "no_session" }, env, 401);
  const name = accCleanName(b.name);
  if (name.length < 2) return json({ error: "bad_name" }, env, 400);
  a.displayName = name; await accPut(env, a);
  return json({ ok: true, account: accPublic(a) }, env);
}
async function handleAccLogout(request, env) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: "bad_request" }, env, 400); }
  if (b && typeof b.token === "string" && b.token.length <= 80) await env.SESSIONS.delete(ACCTOK_PREFIX + b.token);
  return json({ ok: true }, env);
}
/* An Editor-role account reads Editor content by sending "acc.<token>" as its key. */
async function isEditorAccountKey(request, env) {
  const key = request.headers.get("X-Admin-Key") || "";
  if (key.indexOf("acc.") !== 0) return false;
  const a = await accFromToken(env, key.slice(4));
  return !!(a && a.role === "editor");
}

const SPZ_ROUTES = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const allowOrigin = pickAllowedOrigin(request, env);

    // Every route served to a standalone local uploader tool (see
    // localToolCorsHeaders() above) -- add a new one here and its preflight,
    // dispatch and error-catch handling all pick it up automatically.
    const LOCAL_TOOL_PATHS = [
      "/api/classroom/content", "/api/admin/classroom-content/update",
      "/api/controlgrid/content", "/api/admin/controlgrid-content/update",
      "/api/quietvalue/results", "/api/printreport/analysis",
      "/api/admin/quiz-bank/set", "/api/admin/quiz-bank/finalize",
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
      if (url.pathname === "/api/admin/accounts/create" && request.method === "POST") return withCorsOrigin(await handleAccCreate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/accounts/list" && request.method === "GET") return withCorsOrigin(await handleAccList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/accounts/update" && request.method === "POST") return withCorsOrigin(await handleAccUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/acc/login" && request.method === "POST") return withCorsOrigin(await handleAccLogin(request, env), allowOrigin);
      if (url.pathname === "/api/acc/me" && request.method === "POST") return withCorsOrigin(await handleAccMe(request, env), allowOrigin);
      if (url.pathname === "/api/acc/setname" && request.method === "POST") return withCorsOrigin(await handleAccSetName(request, env), allowOrigin);
      if (url.pathname === "/api/acc/logout" && request.method === "POST") return withCorsOrigin(await handleAccLogout(request, env), allowOrigin);
      if (url.pathname === "/api/site-settings" && request.method === "GET") return withCorsOrigin(await handleSiteSettingsGet(request, env), allowOrigin);
      if (url.pathname === "/api/admin/site-settings" && request.method === "POST") return withCorsOrigin(await handleSiteSettingsUpdate(request, env), allowOrigin);
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
      if (url.pathname === "/api/quiz/meta" && request.method === "GET") return withCorsOrigin(await handleQuizMeta(request, env), allowOrigin);
      if (url.pathname === "/api/quiz/start" && request.method === "POST") return withCorsOrigin(await handleQuizStart(request, env), allowOrigin);
      if (url.pathname === "/api/quiz/answer" && request.method === "POST") return withCorsOrigin(await handleQuizAnswer(request, env), allowOrigin);
      if (url.pathname === "/api/quiz/leaderboard" && request.method === "GET") return withCorsOrigin(await handleQuizLeaderboard(request, env), allowOrigin);
      if (url.pathname === "/api/admin/quiz-bank/set" && request.method === "POST") return await handleAdminQuizBankSet(request, env);
      if (url.pathname === "/api/admin/quiz-bank/finalize" && request.method === "POST") return await handleAdminQuizBankFinalize(request, env);
      if (url.pathname === "/api/cexam/login" && request.method === "POST") return withCorsOrigin(await handleCexLogin(request, env), allowOrigin);
      if (url.pathname === "/api/cexam/myresult" && request.method === "POST") return withCorsOrigin(await handleCexMyResult(request, env), allowOrigin);
      if (url.pathname === "/api/cexam/setname" && request.method === "POST") return withCorsOrigin(await handleCexSetName(request, env), allowOrigin);
      if (url.pathname === "/api/cexam/start" && request.method === "POST") return withCorsOrigin(await handleCexStart(request, env), allowOrigin);
      if (url.pathname === "/api/cexam/submit" && request.method === "POST") return withCorsOrigin(await handleCexSubmit(request, env), allowOrigin);
      if (url.pathname === "/api/admin/evals/save" && request.method === "POST") return withCorsOrigin(await handleEvalSave(request, env), allowOrigin);
      if (url.pathname === "/api/admin/evals/list" && request.method === "GET") return withCorsOrigin(await handleEvalList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/evals/get" && request.method === "GET") return withCorsOrigin(await handleEvalGet(request, env), allowOrigin);
      if (url.pathname === "/api/admin/evals/link" && request.method === "POST") return withCorsOrigin(await handleEvalLink(request, env), allowOrigin);
      if (url.pathname === "/api/eval/revoke" && request.method === "POST") return withCorsOrigin(await handleEvalSelfRevoke(request, env), allowOrigin);
      if (url.pathname === "/api/eval/view" && request.method === "GET") return withCorsOrigin(await handleEvalView(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/create" && request.method === "POST") return withCorsOrigin(await handleCexAdminCreate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/list" && request.method === "GET") return withCorsOrigin(await handleCexAdminList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/update" && request.method === "POST") return withCorsOrigin(await handleCexAdminUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/certs/save" && request.method === "POST") return withCorsOrigin(await handleCertSave(request, env), allowOrigin);
      if (url.pathname === "/api/admin/certs/list" && request.method === "GET") return withCorsOrigin(await handleCertList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/certs/revoke" && request.method === "POST") return withCorsOrigin(await handleCertRevoke(request, env), allowOrigin);
      if (url.pathname === "/api/cert/verify" && request.method === "GET") return withCorsOrigin(await handleCertVerify(request, env), allowOrigin);
      if (url.pathname === "/api/admin/ebook/issue" && request.method === "POST") return withCorsOrigin(await handleEbookIssue(request, env), allowOrigin);
      if (url.pathname === "/api/admin/ebook/list" && request.method === "GET") return withCorsOrigin(await handleEbookList(request, env), allowOrigin);
      if (url.pathname === "/api/admin/ebook/update" && request.method === "POST") return withCorsOrigin(await handleEbookUpdate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/ebook/upload" && request.method === "POST") return withCorsOrigin(await handleEbookUpload(request, env), allowOrigin);
      if (url.pathname === "/api/ebook/terms" && request.method === "GET") return withCorsOrigin(await handleEbookTerms(request, env), allowOrigin);
      if (url.pathname === "/api/ebook/accept" && request.method === "POST") return withCorsOrigin(await handleEbookAccept(request, env), allowOrigin);
      if (url.pathname === "/api/ebook/verify" && request.method === "GET") return withCorsOrigin(await handleEbookVerify(request, env), allowOrigin);
      if (url.pathname === "/api/ebook/file" && request.method === "GET") return withCorsOrigin(await handleEbookDownload(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/sets" && request.method === "GET") return withCorsOrigin(await handleCexAdminSets(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/sets/create" && request.method === "POST") return withCorsOrigin(await handleCexAdminSetCreate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/sets/delete" && request.method === "POST") return withCorsOrigin(await handleCexAdminSetDelete(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/bank" && request.method === "GET") return withCorsOrigin(await handleCexAdminBankGet(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/bank/set" && request.method === "POST") return withCorsOrigin(await handleCexAdminBankSet(request, env), allowOrigin);
      if (url.pathname === "/api/admin/key/rotate" && request.method === "POST") return withCorsOrigin(await handleAdminKeyRotate(request, env), allowOrigin);
      if (url.pathname === "/api/admin/key/status" && request.method === "GET") return withCorsOrigin(await handleAdminKeyStatus(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/grades" && request.method === "POST") return withCorsOrigin(await handleCexAdminGrades(request, env), allowOrigin);
      if (url.pathname === "/api/admin/cexam/result" && request.method === "GET") return withCorsOrigin(await handleCexAdminResult(request, env), allowOrigin);
      if (url.pathname === "/api/quietvalue/results" && request.method === "GET") return await handleQuietValueResults(request, env);
      if (url.pathname === "/api/printreport/analysis" && request.method === "GET") return await handlePrintReportAnalysis(request, env);

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

/* ---- Brute-force guard for the admin / editor key (Round AJ) ----------------
   Every admin or editor screen sends its key in X-Admin-Key. Without a limit,
   someone could try thousands of guesses. After 20 wrong keys from the same IP
   within 15 minutes, that IP gets "too_many" (429) on every keyed request until
   the window expires. Correct keys are never slowed down, and requests without
   a key (normal visitors) are not affected at all. */
const ADM_FAIL_PREFIX = "adm:fail:";
const ADM_FAIL_MAX = 20;
export default {
  async fetch(request, env, ctx) {
    const keyed = request.method !== "OPTIONS" && !!request.headers.get("X-Admin-Key");
    const ip = request.headers.get("CF-Connecting-IP") || "";
    let fails = 0;
    if (keyed && ip) {
      try { fails = parseInt(await env.SESSIONS.get(ADM_FAIL_PREFIX + ip), 10) || 0; } catch (e) { fails = 0; }
      if (fails >= ADM_FAIL_MAX) {
        const origin = pickAllowedOrigin(request, env);
        const r = new Response(JSON.stringify({ error: "too_many" }), { status: 429, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin || "*", "Retry-After": "900" } });
        return r;
      }
    }
    const resp = await SPZ_ROUTES.fetch(request, env, ctx);
    if (keyed && ip && resp.status === 401) {
      const p = env.SESSIONS.put(ADM_FAIL_PREFIX + ip, String(fails + 1), { expirationTtl: 900 }).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(p); else await p;
    }
    return resp;
  },
};
