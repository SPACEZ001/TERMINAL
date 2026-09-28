
/* Runs synchronously before <body> is parsed, so the disclaimer gate can
   never lose a race with the rest of the page: without this, on a slow
   parse the hero/ticker/nav were sometimes visible and interactive for a
   moment before the gate's own (much later) boot script got to run. The
   matching CSS is next to .gate below; this only ever adds a class. */
(function(){
  /* The disclaimer used to be a permanent '1', so once accepted it never came
     back. It now stores the acceptance time and goes stale after 3 days; the
     old '1' reads as stale, so existing visitors see it once more. */
  var ACK_MS = 3 * 24 * 60 * 60 * 1000;
  window.__spzAckFresh = function(){
    try {
      var v = localStorage.getItem('spacez.ack');
      if (!v) return false;
      var t = parseInt(v, 10);
      if (!t || t < 1000000000000) return false; /* legacy '1' or junk */
      var age = Date.now() - t;
      return age >= 0 && age < ACK_MS;
    } catch(e) { return false; }
  };
  window.__spzAckStamp = function(){
    try { localStorage.setItem('spacez.ack', String(Date.now())); } catch(e){}
  };

  try {
    if (!window.__spzAckFresh()) {
      document.documentElement.classList.add('spz-gate-wait');
      setTimeout(function(){
        document.documentElement.classList.remove('spz-gate-wait');
      }, 6000); /* safety net: never leave the page permanently hidden */
    }
  } catch(e){}

  /* The router resets to home on every load, so a refresh always lost your
     place. Remember the route the page was opened with, here in the head
     before anything else runs; the module at the end of the body restores
     it once the router has booted - but only if the session is still fresh,
     so a tab left open overnight starts at home instead of mid-terminal. */
  try {
    window.__spzEntryHash = location.hash || '';
    var STALE_MS = 6 * 60 * 60 * 1000;
    var seen = parseInt(localStorage.getItem('spacez.lastSeen') || '0', 10);
    window.__spzSessionFresh = !!(seen && (Date.now() - seen) <= STALE_MS);
  } catch(e){}

  /* Same-turn fix for a visible flash-on-load: the bare :root palette
     (no data-theme set) reads as a brighter "lime" look, and the saved
     theme (void by default) previously wasn't applied until initTheme()
     ran deep in the body after DOMContentLoaded -- late enough that the
     browser could paint at least one frame in the untstyled lime look
     first. Resolving and setting html[data-theme] right here, before
     <body> is even parsed, means the very first paint already uses the
     right theme. initTheme() (later in the file) is unchanged and still
     builds the theme-switch UI; it just re-applies the same value. */
  try {
    var THEMES_EARLY = ['void', 'lime', 'light'];
    var savedTheme = localStorage.getItem('ma.theme') || 'void';
    if (THEMES_EARLY.indexOf(savedTheme) === -1) savedTheme = 'void';
    document.documentElement.dataset.theme = savedTheme;
  } catch(e){}
})();
