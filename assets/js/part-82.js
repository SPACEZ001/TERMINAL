/* ===========================================================================
   MARKET BRAIN (#/brain) -- admin-only board, loader stub (2026-10-25).
   Registers the route and the empty section; the board itself
   (assets/js/min/part-83.js + assets/css/min/part-83.css, ~100 KB) is
   fetched only when an admin actually opens #/brain, so it costs nothing on
   a normal page load. Listed only in the Terminal Admin panel (part-46.js),
   never in the public nav (NAV_HIDDEN in part-15.js).
   =========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_BRAIN_STUB) return;
  window.__SPZ_BRAIN_STUB = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  var U = {
    h:{ en:'Market Brain', th:'สมองตลาด (Market Brain)' },
    d:{ en:'Everything about the economy and your portfolio on one board. Admin only.', th:'สรุปเศรษฐกิจ แนวโน้ม และพอร์ตในบอร์ดเดียว เฉพาะแอดมิน' },
    lock:{ en:'Admins only. Log in from the Terminal Admin panel to open the Market Brain.', th:'เฉพาะแอดมินค่ะ เข้าสู่ระบบจากแผงแอดมินเทอร์มินอลก่อน แล้วจึงเปิดสมองตลาดได้' },
    load:{ en:'Loading the Market Brain…', th:'กำลังเปิดสมองตลาด…' },
    fail:{ en:'Could not load the board. Check the connection and open this page again.', th:'โหลดบอร์ดไม่สำเร็จ ลองเช็กอินเทอร์เน็ตแล้วเปิดหน้านี้ใหม่อีกครั้งค่ะ' }
  };
  var sec = null, state = 'idle';   // idle | loading | ready | fail
  function isAdmin(){ try { return typeof window.__SPZ_TIER === 'function' && window.__SPZ_TIER() === 'full'; } catch(e){ return false; } }
  function msg(k){ if(sec && state !== 'ready') sec.querySelector('[data-bz="slot"]').innerHTML = '<div class="bz-stubmsg">' + T(U[k]) + '</div>'; }
  function load(){
    if(state === 'loading' || state === 'ready') return;
    state = 'loading'; msg('load');
    if(!document.querySelector('link[data-bz-css]')){
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/min/part-83.css'; l.setAttribute('data-bz-css', '1');
      document.head.appendChild(l);
    }
    var s = document.createElement('script'); s.src = 'assets/js/min/part-83.js'; s.async = true;
    s.onload = function(){
      if(window.__SPZ_BRAIN && window.__SPZ_BRAIN.mount){ state = 'ready'; window.__SPZ_BRAIN.mount(sec.querySelector('[data-bz="slot"]')); }
      else { state = 'fail'; msg('fail'); }
    };
    s.onerror = function(){ state = 'fail'; msg('fail'); s.remove(); };
    document.head.appendChild(s);
  }
  function check(){
    if(location.hash !== '#/brain') return;
    if(!isAdmin()){ if(state !== 'ready') msg('lock'); return; }
    if(state === 'fail') state = 'idle';
    load();
  }
  /* 2026-10-25: on this page the site's floating nav pill would sit on top of
     the board's own tab bar once the header turns compact. Here it folds into
     a small oval button at the top-right; clicking it opens the full pill. */
  var CSS = 'html.bz-route .gmh-banner{display:none!important;}' +
    'html.bz-route.spz-compact:not(.bz-navx) .top-fixed .nav{display:none!important;}' +
    'html.bz-route.spz-compact.bz-navx .top-fixed .nav{right:64px!important;}' +
    '.bz-navdot{position:fixed;top:calc(var(--spz-tickH,34px) + 9px);right:14px;z-index:1300;display:none;align-items:center;gap:6px;height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(8,10,16,.82);color:#e5e7eb;font:600 12.5px/1 var(--sans,sans-serif);cursor:pointer;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 10px 26px rgba(0,0,0,.4);}' +
    '.bz-navdot svg{width:16px;height:16px;}' +
    '.bz-navdot:hover{border-color:#22d3ee;color:#fff;}' +
    'html.bz-route.spz-compact .bz-navdot{display:inline-flex;}' +
    'html.bz-navx .bz-navdot{background:linear-gradient(135deg,#22d3ee,#a78bfa);color:#071019;border-color:transparent;}' +
    'html[data-theme="light"] .bz-navdot{background:rgba(255,255,255,.92);color:#312e81;border-color:#c7d2fe;box-shadow:0 10px 24px rgba(99,102,241,.18);}' +
    'html.bz-route.spz-compact .bz-tabs{top:calc(var(--spz-tickH,34px) + 8px)!important;margin-right:116px;margin-left:86px;transition:top .25s ease;}' +
    'html.bz-route.spz-compact.bz-navx .bz-tabs{top:calc(var(--spz-tickH,34px) + 62px)!important;}' +
    '@media(max-width:560px){html.bz-route.spz-compact .bz-tabs{margin-right:0;margin-left:0;top:calc(var(--spz-tickH,34px) + 54px)!important;}}';
  var dot = null;
  function navDot(){
    if(dot) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    dot = document.createElement('button'); dot.type = 'button'; dot.className = 'bz-navdot'; dot.setAttribute('aria-label', 'menu');
    var paint = function(){ var open = document.documentElement.classList.contains('bz-navx'); dot.innerHTML = (open ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>') + '<span>' + T(open ? { en:'Close', th:'ปิด' } : { en:'Menu', th:'เมนู' }) + '</span>'; };
    dot.addEventListener('click', function(){ document.documentElement.classList.toggle('bz-navx'); paint(); });
    document.body.appendChild(dot); paint();
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }
  function routeFlag(){
    var on = location.hash === '#/brain';
    document.documentElement.classList.toggle('bz-route', on);
    if(!on) document.documentElement.classList.remove('bz-navx');
    if(on) navDot();
  }
  window.addEventListener('hashchange', routeFlag);
  function build(){
    if(document.getElementById('brain')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'brain'; sec.setAttribute('data-route', 'brain');
    sec.innerHTML = '<div data-bz="slot"></div>';
    document.body.appendChild(sec);
    window.__spzAddRoute({ id:'brain', after:'secmap', t:U.h, d:U.d });
    window.addEventListener('hashchange', check); routeFlag();
    /* the admin may log in while already sitting on #/brain */
    setInterval(function(){ if(location.hash === '#/brain' && state !== 'ready' && state !== 'loading') check(); }, 1500);
    new MutationObserver(function(){ if(state !== 'ready' && state !== 'loading') check(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    check();
    return true;
  }
  function boot(){ var n = 0, iv = setInterval(function(){ if(build() || ++n > 90) clearInterval(iv); }, 500); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  else setTimeout(boot, 1200);
})();
