
(function(){
  'use strict';
  if (window.__SPZ_LOGIN_HINT) return;
  window.__SPZ_LOGIN_HINT = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }

  var SEEN_KEY = 'spacez.hint.seen';
  var COPY = {
    t:{en:'Click here to sign in',th:'คลิกเข้าสู่ระบบที่นี่'},
    d:{en:'Unlock more tools with a Member or Admin login.',th:'ปลดล็อกเครื่องมือเพิ่มเติมด้วยการเข้าสู่ระบบเมมเบอร์หรือแอดมิน'}
  };

  function loggedIn(){
    try {
      var raw = sessionStorage.getItem('spacez.auth');
      if (!raw) return false;
      var o = JSON.parse(raw);
      return !!(o && (o.tier === 'member' || o.tier === 'full'));
    } catch(e){ return false; }
  }
  function seen(){
    try { return !!localStorage.getItem(SEEN_KEY); } catch(e){ return true; }
  }
  function markSeen(){
    try { localStorage.setItem(SEEN_KEY, '1'); } catch(e){}
  }

  var box, hideTimer;
  function build(){
    if (document.getElementById('spzLoginHint')) return true;
    if (!document.getElementById('spzAdminTrigger')) return false;

    box = document.createElement('div');
    box.id = 'spzLoginHint';
    box.innerHTML =
      '<button type="button" class="lh-close" aria-label="close">×</button>' +
      '<div class="lh-bob">' +
        '<div class="lh-row"><span class="lh-arrow">👇</span><span class="lh-t" data-lh="t"></span></div>' +
        '<div class="lh-d" data-lh="d"></div>' +
      '</div>' +
      '<span class="lh-point"></span>';
    document.body.appendChild(box);
    repaint();

    box.addEventListener('click', function(e){
      var closeBtn = e.target.closest ? e.target.closest('.lh-close') : null;
      dismiss();
      if (!closeBtn){
        var t = document.getElementById('spzAdminTrigger');
        if (t) t.click();
      }
    });

    new MutationObserver(repaint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    return true;
  }

  function repaint(){
    if (!box) return;
    var q = function(k){ return box.querySelector('[data-lh="' + k + '"]'); };
    if (q('t')) q('t').textContent = tx(COPY.t);
    if (q('d')) q('d').textContent = tx(COPY.d);
  }

  function dismiss(){
    if (!box) return;
    box.classList.remove('on');
    clearTimeout(hideTimer);
  }

  function maybeShow(){
    if (seen() || loggedIn()) return;
    if (!build()) return;
    markSeen();
    setTimeout(function(){
      if (loggedIn()) return;
      box.classList.add('on');
      hideTimer = setTimeout(function(){ box.classList.remove('on'); }, 12000);
    }, 60);
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (seen() || loggedIn()){ clearInterval(iv); return; }
      if (document.getElementById('spzAdminTrigger') || ++tries > 40){
        clearInterval(iv);
        setTimeout(maybeShow, 1500);
      }
    }, 300);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
