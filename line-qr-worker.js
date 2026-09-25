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
 *   ALLOWED_ORIGIN               (Variable — the site's origin, e.g.
 *                                https://spacez001.github.io, so only that
 *                                site's pages can call this API)
 *   OWNER_WATCHLIST_KEY          (Variable — the site owner's own watchlist
 *                                key in data/watchlist.json, i.e. the same
 *                                value as the TELEGRAM_CHAT_ID secret used
 *                                by scripts/alerts_telegram.py. A LINE login
 *                                only proves "this is really the owner's
 *                                phone" — it always hands back the ONE
 *                                owner watchlist, same as the Telegram bot
 *                                only ever tracks the owner's own list.)
 *
 * WHAT THIS DOES
 * --------------
 * 1. The site asks for a new session code (/api/session/new). This Worker
 *    makes one, stores it in KV as "pending", and hands back a LINE Login
 *    authorize URL with that code as the OAuth `state` — the site renders
 *    that URL as a QR code.
 * 2. The owner scans it with her phone's camera / LINE app, approves the
 *    LINE Login consent screen, and LINE redirects her phone's browser to
 *    this Worker's /callback with an authorization `code` + the original
 *    `state`. This Worker exchanges that code for LINE's own access token
 *    (server-side only — the channel secret never leaves this Worker),
 *    fetches the LINE profile, and marks that session as "linked".
 * 3. Meanwhile the ORIGINAL browser tab (the one that showed the QR code)
 *    has been polling /api/session/status?code=... every couple of
 *    seconds. Once it sees "linked" it calls /api/session/data?code=...
 *    to get the owner's tracked tickers, and shows them.
 * 4. A session stays linked for SESSION_TTL_SECONDS so a page refresh
 *    doesn't force a re-scan; only an explicit logout (the site clearing
 *    its own stored code) or the TTL expiring requires scanning again.
 *
 * There is no separate concept of "which LINE user is allowed in" beyond a
 * successful LINE Login — this mirrors the Telegram bot, which likewise
 * only ever tracks one owner. If this is ever opened up to other real
 * members, that check belongs right where PENDING_TTL/OWNER_WATCHLIST_KEY
 * are used below.
 */

const PENDING_TTL_SECONDS = 5 * 60;          // time to scan the QR before it expires
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // how long a linked session stays valid

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
    "Access-Control-Allow-Headers": "Content-Type",
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

async function handleNewSession(env) {
  const code = randomCode();
  await env.SESSIONS.put(
    "sess:" + code,
    JSON.stringify({ status: "pending", createdAt: Date.now() }),
    { expirationTtl: PENDING_TTL_SECONDS }
  );
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
  const raw = code && (await env.SESSIONS.get("sess:" + code));
  if (!raw) return json({ error: "not_found" }, env, 404);
  const sess = JSON.parse(raw);
  if (sess.status !== "linked") return json({ error: "not_linked" }, env, 401);

  try {
    const wlResp = await fetch(
      "https://raw.githubusercontent.com/SPACEZ001/TERMINAL/main/data/watchlist.json",
      { cf: { cacheTtl: 30, cacheEverything: true } }
    );
    const wl = wlResp.ok ? await wlResp.json() : {};
    const bucket = (wl.users && wl.users[env.OWNER_WATCHLIST_KEY]) || {};
    const tickers = Object.keys(bucket.tickers || {});
    return json({ displayName: sess.displayName || null, pictureUrl: sess.pictureUrl || null, tickers }, env);
  } catch (err) {
    return json({ error: "upstream_failed" }, env, 502);
  }
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }

    if (url.pathname === "/api/session/new") return handleNewSession(env);
    if (url.pathname === "/callback") return handleCallback(request, env);
    if (url.pathname === "/api/session/status") return handleStatus(request, env);
    if (url.pathname === "/api/session/data") return handleData(request, env);
    if (url.pathname === "/api/session/logout" && request.method === "POST") return handleLogout(request, env);

    return json({ error: "not_found" }, env, 404);
  },
};
