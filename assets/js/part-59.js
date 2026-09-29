
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
  function ping(){
    if(document.visibilityState === 'hidden') return; // a backgrounded tab
      // shouldn't keep counting as "here" -- it'll simply lapse and drop
      // off the count within the KV expiry window, then resume pinging
      // (and get counted again) once the tab is visible again.
    try {
      fetch(WORKER_BASE + '/api/presence/ping', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ id: presenceId() })
      }).catch(function(){});
    } catch(e){}
  }
  ping();
  setInterval(ping, PING_MS);
  document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible') ping(); });
})();
