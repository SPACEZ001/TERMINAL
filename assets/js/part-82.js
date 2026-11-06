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
    d:{ en:'Everything about the economy and your portfolio on one board. Admin and editor only.', th:'สรุปเศรษฐกิจ แนวโน้ม และพอร์ตในบอร์ดเดียว เฉพาะแอดมินและ Editor' },
    lock:{ en:'Admin and Editor only. Sign in from the Terminal Admin panel (Admin or Editor tab) to open the Market Brain.', th:'เฉพาะแอดมินและ Editor ค่ะ เข้าสู่ระบบจากแผงแอดมินเทอร์มินอล (แท็บแอดมินหรือ Editor) เพื่อเปิดสมองตลาด' },
    load:{ en:'Loading the Market Brain…', th:'กำลังเปิดสมองตลาด…' },
    fail:{ en:'Could not load the board. Check the connection and open this page again.', th:'โหลดบอร์ดไม่สำเร็จ ลองเช็กอินเทอร์เน็ตแล้วเปิดหน้านี้ใหม่อีกครั้งค่ะ' }
  };
  var sec = null, state = 'idle';   // idle | loading | ready | fail
  /* 2026-11-04: Admin and Editor both open the board */
  function isAdmin(){ try { var t = typeof window.__SPZ_TIER === 'function' && window.__SPZ_TIER(); return t === 'full' || t === 'editor'; } catch(e){ return false; } }
  function msg(k){ if(sec && state !== 'ready') sec.querySelector('[data-bz="slot"]').innerHTML = '<div class="bz-stubmsg">' + T(U[k]) + '</div>'; }
  /* 2026-11-07 (user choice A): the board's code is stored ENCRYPTED in the public repo
     (assets/js/min/part-83.bin, AES-256-GCM). The key is a Cloudflare Worker secret
     (BRAIN_CODE_KEY) handed out by GET /api/brain/code-key only to an Admin (Worker admin
     key) or an Editor (Editor code / Editor account). The browser decrypts it in memory and
     runs it; nothing readable is ever published.
     PLAIN_FALLBACK: while the Worker is not set up yet, the old readable file still loads so
     the board keeps working. Turned off (and the readable file deleted) once she confirms. */
  var PLAIN_FALLBACK = true;
  var WORKER = 'https://spacez-line-link.spacezblack.workers.dev';
  function authKey(){
    try {
      var k = sessionStorage.getItem('spz_admin_users_key') || '';
      if(!k && window.__SPZ_TIER && window.__SPZ_TIER() === 'editor') k = sessionStorage.getItem('spz_editor_code') || '';
      return k;
    } catch(e){ return ''; }
  }
  function b64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function runCode(src, done){
    var url = URL.createObjectURL(new Blob([src], { type:'text/javascript' }));
    var s = document.createElement('script'); s.src = url; s.async = true;
    s.onload = function(){ URL.revokeObjectURL(url); done(true); };
    s.onerror = function(){ URL.revokeObjectURL(url); done(false); };
    document.head.appendChild(s);
  }
  function mounted(ok){
    if(ok && window.__SPZ_BRAIN && window.__SPZ_BRAIN.mount){ state = 'ready'; window.__SPZ_BRAIN.mount(sec.querySelector('[data-bz="slot"]')); }
    else { state = 'fail'; msg('fail'); }
  }
  function loadPlain(){
    var s = document.createElement('script'); s.src = 'assets/js/min/part-83.js'; s.async = true;
    s.onload = function(){ mounted(true); };
    s.onerror = function(){ s.remove(); mounted(false); };
    document.head.appendChild(s);
  }
  function askKey(why){
    state = 'need';
    var slot = sec.querySelector('[data-bz="slot"]');
    slot.innerHTML = '<div class="bz-stubmsg"><div style="max-width:440px;margin:0 auto;text-align:left">' +
      '<b style="display:block;font-size:16px;margin-bottom:6px">' + T(why === 'cfg' ? { en:'The Market Brain key is not set up on the Worker yet', th:'ยังไม่ได้ตั้งกุญแจสมองตลาดใน Worker' } : { en:'Enter the Worker admin key', th:'ใส่รหัสแอดมินของ Worker' }) + '</b>' +
      '<span style="display:block;font-size:13px;opacity:.8;line-height:1.6;margin-bottom:10px">' + T(why === 'cfg' ? { en:'Add the BRAIN_CODE_KEY secret in Cloudflare (Worker spacez-line-link → Settings → Variables and Secrets), then open this page again.', th:'เพิ่ม Secret ชื่อ BRAIN_CODE_KEY ใน Cloudflare (Worker spacez-line-link → Settings → Variables and Secrets) แล้วเปิดหน้านี้ใหม่ค่ะ' } : { en:'The board\'s code is encrypted. Admins unlock it with the same Worker admin key used on Connected Users (asked once per browser session).', th:'โค้ดของบอร์ดถูกเข้ารหัสไว้ แอดมินปลดล็อกด้วยรหัสแอดมินของ Worker ตัวเดียวกับหน้าผู้ใช้ที่เชื่อมต่อ (ถามครั้งเดียวต่อการเปิดเบราว์เซอร์)' }) + '</span>' +
      (why === 'cfg' ? '' : '<form data-bz="kf" style="display:flex;gap:8px"><input type="password" autocomplete="off" data-bz="ki" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:inherit" placeholder="ADMIN_USERS_KEY"><button type="submit" style="padding:10px 14px;border-radius:10px;border:0;background:linear-gradient(90deg,#22d3ee,#a78bfa);color:#071019;font-weight:800;cursor:pointer">' + T({ en:'Unlock', th:'ปลดล็อก' }) + '</button></form>') +
      '</div></div>';
    var f = slot.querySelector('[data-bz="kf"]');
    if(f) f.addEventListener('submit', function(e){ e.preventDefault(); var v = slot.querySelector('[data-bz="ki"]').value.trim(); if(!v) return; try { sessionStorage.setItem('spz_admin_users_key', v); } catch(x){} state = 'idle'; load(); });
  }
  function load(){
    if(state === 'loading' || state === 'ready') return;
    state = 'loading'; msg('load');
    if(!document.querySelector('link[data-bz-css]')){
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/min/part-83.css'; l.setAttribute('data-bz-css', '1');
      document.head.appendChild(l);
    }
    var key = authKey();
    var fallback = function(why){ if(PLAIN_FALLBACK) loadPlain(); else askKey(why); };
    if(!key || !window.crypto || !crypto.subtle){ fallback('key'); return; }
    fetch(WORKER + '/api/brain/code-key', { headers:{ 'X-Admin-Key':key }, cache:'no-store' })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j.__s = r.status; return j; }); })
      .then(function(j){
        if(!j || !j.key){ if(j && j.__s === 401){ try { sessionStorage.removeItem('spz_admin_users_key'); } catch(x){} } fallback(j && j.__s === 503 ? 'cfg' : 'key'); return; }
        return Promise.all([
          crypto.subtle.importKey('raw', b64(j.key), 'AES-GCM', false, ['decrypt']),
          fetch('assets/js/min/part-83.bin', { cache:'no-cache' }).then(function(r){ if(!r.ok) throw new Error('bin'); return r.arrayBuffer(); })
        ]).then(function(x){
          var buf = new Uint8Array(x[1]);
          if(String.fromCharCode.apply(null, buf.subarray(0, 5)) !== 'SPZB1') throw new Error('fmt');
          return crypto.subtle.decrypt({ name:'AES-GCM', iv:buf.subarray(5, 17) }, x[0], buf.subarray(17));
        }).then(function(plain){ runCode(new TextDecoder().decode(plain), mounted); });
      })
      .catch(function(){ fallback('key'); });
  }
  function check(){
    if(location.hash !== '#/brain') return;
    if(!isAdmin()){ if(state !== 'ready') msg('lock'); return; }
    if(state === 'fail') state = 'idle';
    if(state === 'need') return;
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
    /* 2026-10-26: the live-status strip (#spzLiveBar, a transparent full-width row inside
       .top-fixed, z 50) lies over the stuck tab bar and swallowed taps on it. Let clicks
       pass through the empty strip (and .top-fixed's own box); the ticker, the nav when
       opened, the live chip and its pop-up still take clicks. */
    'html.bz-route.spz-compact .top-fixed,html.bz-route.spz-compact #spzLiveBar{pointer-events:none;}html.bz-route.spz-compact .top-fixed>*:not(#spzLiveBar),html.bz-route.spz-compact #spzLiveBar>*{pointer-events:auto;}' +
    'html.bz-route.spz-compact.bz-navx .bz-tabs{top:calc(var(--spz-tickH,34px) + 62px)!important;}' +
    '@media(max-width:560px){html.bz-route.spz-compact .bz-tabs{margin-right:0;margin-left:0;top:calc(var(--spz-tickH,34px) + 54px)!important;}}';
  var dot = null;
  function navDot(){
    if(dot) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    dot = document.createElement('button'); dot.type = 'button'; dot.className = 'bz-navdot'; dot.setAttribute('aria-label', 'menu');
    var paint = function(){ var open = document.documentElement.classList.contains('bz-navx'); dot.innerHTML = (open ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>') + '<span>' + T(open ? { en:'Close', th:'ปิด' } : { en:'Menu', th:'เมนู' }) + '</span>'; };
    dot.addEventListener('click', function(){ document.documentElement.classList.toggle('bz-navx'); paint(); });
    /* 2026-11-05: with a mouse, just pointing at the folded menu opens it (a click still toggles) */
    dot.addEventListener('mouseenter', function(){ try { if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return; } catch(e){ return; } if(!document.documentElement.classList.contains('bz-navx')){ document.documentElement.classList.add('bz-navx'); paint(); dot.__hov = Date.now(); } });
    dot.addEventListener('click', function(ev){ if(dot.__hov && Date.now() - dot.__hov < 800){ dot.__hov = 0; ev.stopImmediatePropagation(); } }, true);
    document.body.appendChild(dot); paint();
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }
  function routeFlag(){
    /* 2026-11-07: the site router often moves with history.pushState (no hashchange), so also trust the
       section's own route-on class - otherwise arriving from the menu left the board without its bars */
    var bs = document.getElementById('brain'), on = /^#\/brain\b/.test(location.hash) || !!(bs && bs.classList.contains('route-on'));
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
    new MutationObserver(function(){ routeFlag(); if(sec.classList.contains('route-on') && state !== 'ready' && state !== 'loading') check(); }).observe(sec, { attributes:true, attributeFilter:['class'] });
    window.addEventListener('popstate', function(){ setTimeout(routeFlag, 0); });
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
