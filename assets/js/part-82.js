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
  function build(){
    if(document.getElementById('brain')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'brain'; sec.setAttribute('data-route', 'brain');
    sec.innerHTML = '<div data-bz="slot"></div>';
    document.body.appendChild(sec);
    window.__spzAddRoute({ id:'brain', after:'secmap', t:U.h, d:U.d });
    window.addEventListener('hashchange', check);
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
