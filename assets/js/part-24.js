
/* ============================================================================
   SPACEZ TERMINAL v22 — LOGO MARK, GATE BACKDROP, BOOT SEQUENCE
   The mark is drawn in code so it inherits the theme colour and can animate.
   ========================================================================= */
(function(){
  'use strict';

  /* Outer arrowhead split down the middle, inner diamond cut out,
     two side brackets and a chevron under the base. */
  var P = {
    left:  'M48 6 L16 74 L48 118 L48 96 L32 78 L48 50 Z',
    right: 'M52 6 L84 74 L52 118 L52 96 L68 78 L52 50 Z',
    brL:   'M12 64 L22 60 L14 78 L12 76 Z',
    brR:   'M88 64 L78 60 L86 78 L88 76 Z',
    baseL: 'M14 80 L50 122 L50 116 L18 80 Z',
    baseR: 'M86 80 L50 122 L50 116 L82 80 Z'
  };

  function mark(cls, opts){
    opts = opts || {};
    var st = opts.stroke;
    var f = st ? 'none' : 'currentColor';
    var s = st ? 'currentColor' : 'none';
    var sw = opts.w || 1.6;
    var g = '';
    var keys = ['left', 'right', 'brL', 'brR', 'baseL', 'baseR'];
    for(var i = 0; i < keys.length; i++){
      g += '<path class="lg-p lg-' + keys[i] + '" d="' + P[keys[i]] + '" fill="' + f +
           '" stroke="' + s + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
    }
    return '<svg class="' + (cls || 'spz-mark') + '" viewBox="0 0 100 128" ' +
           'preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + g + '</svg>';
  }
  window.__spzMark = mark;

  /* ---------------- gate: marks drifting behind the card ---------------- */
  function gateBackdrop(){
    var gate = document.getElementById('spzGate');
    if(!gate || gate.querySelector('.gate-bg')) return false;
    var bg = document.createElement('div');
    bg.className = 'gate-bg';
    var spec = [
      [8, 14, 46, 26, 0], [78, 9, 34, 31, 1.6], [16, 72, 58, 24, 3.1],
      [86, 66, 40, 28, 4.4], [46, 4, 28, 36, 2.2], [62, 84, 30, 22, 5.3],
      [4, 44, 24, 34, 0.8], [92, 38, 26, 29, 3.7]
    ];
    var h = '';
    for(var i = 0; i < spec.length; i++){
      var s = spec[i];
      h += '<span class="gb-i" style="left:' + s[0] + '%;top:' + s[1] + '%;width:' + s[2] +
           'px;animation-duration:' + s[3] + 's;animation-delay:-' + s[4] + 's">' +
           mark('gb-m', { stroke:true, w:2.2 }) + '</span>';
    }
    bg.innerHTML = h;
    gate.insertBefore(bg, gate.firstChild);
    return true;
  }

  /* ---------------- boot: mark and wordmark trading places ---------------- */
  function upgradeBoot(node){
    var m = node.querySelector('.boot-mark');
    if(!m || m.__up) return;
    m.__up = 1;
    m.classList.add('boot-stage');
    m.innerHTML =
      '<span class="bs-face bs-logo">' + mark('bs-mark', { stroke:true, w:2.6 }) + '</span>' +
      '<span class="bs-face bs-word"><span class="boot-blip"></span>' +
      '<span class="boot-brand">SPACEZ</span></span>';

    /* wordmark split into letters so it can stagger in */
    var brand = m.querySelector('.boot-brand');
    if(brand){
      var txt = brand.textContent, h = '';
      for(var i = 0; i < txt.length; i++){
        h += '<span class="bs-l" style="animation-delay:' + (i * 0.07).toFixed(2) + 's">' + txt[i] + '</span>';
      }
      brand.innerHTML = h;
    }

    var showLogo = true;
    m.classList.add('show-logo');
    var iv = setInterval(function(){
      if(!document.body.contains(m)){ clearInterval(iv); return; }
      showLogo = !showLogo;
      m.classList.toggle('show-logo', showLogo);
      m.classList.toggle('show-word', !showLogo);
    }, 1000);
  }

  function watchBoot(){
    new MutationObserver(function(muts){
      for(var i = 0; i < muts.length; i++){
        var added = muts[i].addedNodes;
        for(var j = 0; j < added.length; j++){
          var n = added[j];
          if(n.nodeType === 1 && n.classList && n.classList.contains('boot')) upgradeBoot(n);
        }
      }
    }).observe(document.body, { childList:true });
    var existing = document.querySelector('.boot');
    if(existing) upgradeBoot(existing);
  }

  function boot(){
    watchBoot();
    if(!gateBackdrop()){
      var n = 0;
      var iv = setInterval(function(){
        if(gateBackdrop() || ++n > 40) clearInterval(iv);
      }, 200);
    }
    /* a small mark next to the wordmark in the top bar */
    var logo = document.querySelector('.logo');
    if(logo && !logo.querySelector('.nav-mark')){
      var span = document.createElement('span');
      span.className = 'nav-mark';
      span.innerHTML = mark('nm-svg', { stroke:true, w:3 });
      logo.insertBefore(span, logo.firstChild);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 40); });
  else setTimeout(boot, 40);
})();
