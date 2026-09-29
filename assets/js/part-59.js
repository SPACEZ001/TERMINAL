
(function(){
  'use strict';
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ID_KEY = 'spz_presence_id';
  var PING_MS = 60000; // well under the Worker's KV expiry (see PRESENCE_TTL_SECONDS
                        // in line-qr-worker.js), so a visitor who's still here never
                        // lapses between pings. Kept deliberately infrequent -- every
                        // open tab on the whole public site writes to the Worker's KV
                        // namespace on this interval, and that namespace's free-tier
                        // daily write quota is shared with every other feature that
                        // writes to KV (LINE session creation, likes, watchlist edits,
                        // admin broadcasts...). A shorter interval here quietly eats
                        // into that same budget and can starve those other features
                        // later in the day.
  function presenceId(){
    var id = null;
    try { id = sessionStorage.getItem(ID_KEY); } catch(e){}
    if(!id){
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2));
      try { sessionStorage.setItem(ID_KEY, id); } catch(e){}
    }
    return id;
  }
  /* Round T: who's actually logged in right now, not just "a tab is open"
     -- reads the same session code every other self-service call already
     sends (window.__SPZ_LINE.code() / window.__SPZ_TG.code()), never the
     underlying userId, which stays server-side. The Worker resolves the
     code to a userId itself before writing anything, so this lets the
     Connected Users admin page show a per-person "online now" flag on top
     of the anonymous traffic count it already had. LINE checked first only
     because that's the order every other dual-provider check in the
     codebase already uses (part-39.js's resolveActiveIdentity, part-57.js's
     isUnlocked) -- a visitor is never linked to both at once in practice.
     Anonymous visitors keep sending no code at all, same as before this
     round. */
  function loggedInCode(){
    try {
      if(window.__SPZ_LINE && window.__SPZ_LINE.code){
        var lc = window.__SPZ_LINE.code();
        if(lc) return lc;
      }
    } catch(e){}
    try {
      if(window.__SPZ_TG && window.__SPZ_TG.code){
        var tc = window.__SPZ_TG.code();
        if(tc) return tc;
      }
    } catch(e){}
    return null;
  }
  /* Round T: this beacon already round-trips to the Worker every PING_MS on
     every page, so its own success/failure doubles as a cheap "is the
     login/session backend reachable right now" health signal for the
     System Status popup (part-37.js), via window.__SPZ_BACKEND_STATUS().
     No extra request added for this -- just recording the outcome of the
     one this file already makes. */
  window.__SPZ_BACKEND_LAST_OK = null; // epoch ms of the last successful ping, or null before the first one lands
  window.__SPZ_BACKEND_STATUS = function(){
    if(window.__SPZ_BACKEND_LAST_OK === null) return 'pending'; // no ping has resolved yet -- treated as "syncing", not a failure
    return (Date.now() - window.__SPZ_BACKEND_LAST_OK) <= (PING_MS * 2.5) ? 'ok' : 'stale';
  };
  function ping(){
    if(document.visibilityState === 'hidden') return; // a backgrounded tab
      // shouldn't keep counting as "here" -- it'll simply lapse and drop
      // off the count within the KV expiry window, then resume pinging
      // (and get counted again) once the tab is visible again.
    try {
      var payload = { id: presenceId() };
      var code = loggedInCode();
      if(code) payload.code = code;
      fetch(WORKER_BASE + '/api/presence/ping', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      }).then(function(r){ if(r.ok) window.__SPZ_BACKEND_LAST_OK = Date.now(); }).catch(function(){});
    } catch(e){}
  }
  ping();
  setInterval(ping, PING_MS);
  document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible') ping(); });
  // Ping right away on login/logout too, instead of waiting up to PING_MS,
  // so the admin list's online flag catches up without a long lag.
  document.addEventListener('spz:line', ping);
  document.addEventListener('spz:tg', ping);
})();
