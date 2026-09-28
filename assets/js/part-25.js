
/* ============================================================================
   SPACEZ TERMINAL v21 — BACK / FORWARD CONTROLS
   Buttons in the top bar, plus a floating pair on mobile. They drive the
   browser's own history, so the browser buttons and swipe gestures agree.
   ========================================================================= */
(function(){
  'use strict';

  var TXT = {
    back:{en:'Back',th:'ย้อนกลับ'},
    fwd:{en:'Forward',th:'ไปข้างหน้า'},
    none:{en:'nothing to go back to',th:'ไม่มีหน้าก่อนหน้า'},
    noneF:{en:'nothing ahead',th:'ไม่มีหน้าถัดไป'}
  };
  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }

  /* the router knows the route ids; ask it for a readable name */
  function nameOf(id){
    if(!id) return '';
    if(id === 'home') return L() === 'th' ? 'หน้าแรก' : 'Home';
    var a = document.querySelector('.np-item[data-route-to="' + id + '"] .np-t');
    return a ? a.textContent.trim() : id;
  }

  var wrap, fbar;

  function pair(cls){
    var box = el('div', 'nv-pair ' + (cls || ''));
    var b = el('button', 'nv-b nv-back', '<span class="nv-ico">‹</span>');
    var f = el('button', 'nv-b nv-fwd', '<span class="nv-ico">›</span>');
    b.type = 'button'; f.type = 'button';
    b.addEventListener('click', function(){ if(window.__spzNav) window.__spzNav.back(); });
    f.addEventListener('click', function(){ if(window.__spzNav) window.__spzNav.fwd(); });
    box.appendChild(b); box.appendChild(f);
    return box;
  }

  function paint(){
    var N = window.__spzNav;
    if(!N) return;
    var cb = N.canBack(), cf = N.canFwd();
    var boxes = document.querySelectorAll('.nv-pair');
    for(var i = 0; i < boxes.length; i++){
      var b = boxes[i].querySelector('.nv-back');
      var f = boxes[i].querySelector('.nv-fwd');
      b.disabled = !cb;
      f.disabled = !cf;
      b.title = cb ? T(TXT.back) + ' — ' + nameOf(N.prevId()) : T(TXT.none);
      f.title = cf ? T(TXT.fwd) + ' — ' + nameOf(N.nextId()) : T(TXT.noneF);
      b.setAttribute('aria-label', b.title);
      f.setAttribute('aria-label', f.title);
    }
    if(fbar) fbar.classList.toggle('on', cb || cf);
  }
  window.__spzNavPaint = paint;

  function boot(){
    var cluster = document.querySelector('.nav-cluster');
    if(!cluster || document.querySelector('.nv-pair')) return false;

    wrap = pair('in-nav');
    cluster.insertBefore(wrap, cluster.firstChild);

    /* a floating pair for phones, where the top bar is cramped */
    fbar = pair('floating');
    document.body.appendChild(fbar);

    paint();
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }

  function start(){
    if(boot()) return;
    var n = 0;
    var iv = setInterval(function(){
      if(boot() || ++n > 40) clearInterval(iv);
    }, 250);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 700); });
  else setTimeout(start, 700);
})();
