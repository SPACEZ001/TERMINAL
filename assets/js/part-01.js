
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
    var THEMES_EARLY = ['void', 'light'];   /* 2026-11-07: 'lime' removed */
    var savedTheme = localStorage.getItem('ma.theme') || 'void';
    if (THEMES_EARLY.indexOf(savedTheme) === -1) savedTheme = 'void';
    document.documentElement.dataset.theme = savedTheme;
  } catch(e){}
  /* 2026-11-13: (1) cover the page from the very first paint while the boot screen gets ready.
     Before this, a returning visitor saw the bare top bar / page flash for a moment before the
     boot loader (part-18, deferred) appeared. Only when the disclaimer gate will NOT show
     (it has its own cover). runBoot() removes the class; a timer is the safety net. */
  try {
    if (window.__spzAckFresh()) {
      document.documentElement.classList.add('spz-pre');
      setTimeout(function(){ document.documentElement.classList.remove('spz-pre'); }, 7000);
    }
  } catch(e){}

  /* 2026-11-13: (2) share identical same-origin data/*.json downloads. Several screens each
     fetched data/backtest.json (~850 KB) at the same time on every load, so it was downloaded
     three times. Every caller still gets its own Response (a clone); finished copies are kept
     for 60 s, then dropped so a later refresh reads fresh data. */
  try {
    var _fetch = window.fetch;
    if (_fetch && window.Promise) {
      var SHARE = {}, KEEP_MS = 60000;
      window.fetch = function(input, init){
        try {
          var url = typeof input === 'string' ? input : (input && input.url) || '';
          var m = init && init.method ? String(init.method).toUpperCase() : (input && input.method) || 'GET';
          var a = document.createElement('a'); a.href = url;
          var same = a.host === location.host, isData = /\/data\/[^?#]+\.json(?:[?#]|$)/.test(a.pathname + a.search);
          if (m === 'GET' && same && isData && !(init && (init.body || init.signal || init.cache === 'no-store'))) {
            var key = a.href, hit = SHARE[key];
            if (!hit || Date.now() - hit.t > KEEP_MS) {
              var p = _fetch.call(window, input, init).then(function(r){ if (!r.ok) delete SHARE[key]; return r; }, function(e){ delete SHARE[key]; throw e; });
              hit = SHARE[key] = { p: p, t: Date.now() };
            }
            return hit.p.then(function(r){ return r.clone(); });
          }
        } catch(e){}
        return _fetch.apply(window, arguments);
      };
    }
  } catch(e){}

  /* 2026-11-13: (3) pause looping animations while they are off screen. The home page and the
     menu keep ~150 infinite CSS animations running below the fold (lock pulses, spinning card
     rings, star drifts); pausing the ones you can't see makes scrolling smoother and saves battery.
     They resume exactly where they were when scrolled back into view. */
  try {
    var startPauser = function(){
      if (!('IntersectionObserver' in window) || !document.getAnimations) return;
      var seen = new WeakSet();
      var io = new IntersectionObserver(function(list){
        list.forEach(function(e){ e.target.classList.toggle('spz-anim-off', !e.isIntersecting); });
      }, { rootMargin: '200px 0px' });
      var scan = function(){
        try {
          document.getAnimations().forEach(function(an){
            var ef = an.effect, t = ef && ef.target;
            if (!t || t.nodeType !== 1 || seen.has(t)) return;
            var tm = ef.getTiming ? ef.getTiming() : null;
            if (!tm || tm.iterations !== Infinity) return;
            if (t === document.documentElement || t === document.body) return;
            seen.add(t); io.observe(t);
          });
        } catch(e){}
      };
      setTimeout(scan, 1500); setTimeout(scan, 5000);
      window.addEventListener('hashchange', function(){ setTimeout(scan, 700); setTimeout(scan, 2500); });
    };
    if (document.readyState === 'complete') startPauser(); else window.addEventListener('load', startPauser, { once: true });
  } catch(e){}
})();
