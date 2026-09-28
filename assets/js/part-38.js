
(function(){
  'use strict';
  /* Heartbeat read by the head script on the next load: it is what tells a
     refresh apart from coming back to a tab left open overnight. */
  function mark(){
    try { localStorage.setItem('spacez.lastSeen', String(Date.now())); } catch(e){}
  }
  mark();
  setInterval(mark, 60000);
  document.addEventListener('visibilitychange', mark);
  window.addEventListener('pagehide', mark);

  /* ---- publish the real header height so section padding can follow it
     instead of assuming one nav row. ---------------------------------- */
  function measureTop(){
    var t = document.querySelector('.top-fixed');
    if(!t) return;
    var h = Math.round(t.getBoundingClientRect().height);
    if(h > 0) document.documentElement.style.setProperty('--spz-topH', h + 'px');
  }
  measureTop();
  window.addEventListener('resize', measureTop);
  window.addEventListener('orientationchange', measureTop);
  if(window.ResizeObserver){
    var t0 = document.querySelector('.top-fixed');
    if(t0) new ResizeObserver(measureTop).observe(t0);
  }
  window.addEventListener('load', measureTop);

  /* ---- the disclaimer's own "enter terminal" handler never fires, so the
     gate could not be dismissed and the acceptance was never recorded. A
     delegated listener does the work instead; it is additive, so if the
     original handler ever starts firing the two simply agree. ---------- */
  document.addEventListener('click', function(ev){
    var t = ev.target;
    if(!t || !t.closest) return;
    var btn = t.closest('.gate-go');
    if(!btn || btn.disabled) return;
    var g = document.getElementById('spzGate') || document.querySelector('.gate');
    if(!g) return;
    try { if(window.__spzAckStamp) window.__spzAckStamp(); } catch(e){}
    g.hidden = true;
    g.style.display = 'none';
    try {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('spz-gate-wait');
    } catch(e){}
  }, true);

  /* ---- restore the route the page was opened with. The router lands on
     home regardless of the incoming hash, so without this every refresh
     lost your place. Stale sessions deliberately stay on home. --------- */
  function restoreRoute(){
    var h = window.__spzEntryHash || '';
    if(!window.__spzSessionFresh) return;
    var m = /^#\/([a-z0-9_-]+)$/i.exec(h);
    if(!m) return;
    var route = m[1];
    if(route === 'home') return;
    var link = document.querySelector('[data-route-to="' + route + '"]');
    if(link) link.click();
    else if(location.hash !== h) location.hash = h;
  }
  if(document.readyState === 'complete') setTimeout(restoreRoute, 60);
  else window.addEventListener('load', function(){ setTimeout(restoreRoute, 60); });
})();
