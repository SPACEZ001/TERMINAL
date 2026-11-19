/* =====================================================================
   SPACEZ BUBBLE RADAR — WIDE LAYOUT (2026-11-16)
   User request: the Bubble Radar (#/bubble) only used a narrow column in the
   middle of the screen; make it prettier and use the left / right space.
   part-40 builds the page as one flat list of blocks inside its body element
   (and rebuilds it with innerHTML on every refresh). This layer groups each
   heading with its block into a "section" and lays the sections out on a
   12-column grid: gauge | what the score means, risk shape (sticky) | the 5
   signals, other signals, flows | where money goes, the burst checklist, the
   playbook. It re-runs whenever part-40 repaints. Nothing in part-40 changed.
   ===================================================================== */
(function(){
  'use strict';
  var SPAN = [
    ['bb-top', 'bbx-hero'], ['bb-scale', 'bbx-scale'], ['bb-radarbox', 'bbx-radar'],
    ['bb-grid', 'bbx-grid'], ['bbFlowBlock', 'bbx-flow'], ['bb-burst', 'bbx-burst'],
    ['bb-flowmap', 'bbx-flowmap'], ['bb-edu', 'bbx-edu'], ['bb-arch', 'bbx-arch'], ['bb-scenlink', 'bbx-scen']
  ];
  function kindOf(el){
    for(var i = 0; i < SPAN.length; i++) if(el.id === SPAN[i][0] || el.classList.contains(SPAN[i][0])) return SPAN[i][1];
    return 'bbx-misc';
  }
  var busy = false;
  function arrange(body){
    if(busy || !body) return;
    var kids = Array.prototype.slice.call(body.children);
    if(!kids.length || kids.every(function(k){ return k.classList.contains('bbx-sec'); })) return;
    busy = true;
    var secs = [], cur = null, grids = 0;
    kids.forEach(function(k){
      if(k.classList.contains('bbx-sec')){ secs.push({ el:k }); cur = null; return; }
      var head = k.classList.contains('bb-sec-h'), para = k.classList.contains('bb-sec-p');
      if(head || !cur || cur.main){ cur = { parts:[], main:null }; secs.push(cur); }
      cur.parts.push(k);
      if(!head && !para){ cur.main = k; }
    });
    var frag = document.createDocumentFragment();
    secs.forEach(function(s){
      if(s.el){ frag.appendChild(s.el); return; }
      var w = document.createElement('div');
      var kind = s.main ? kindOf(s.main) : 'bbx-misc';
      if(kind === 'bbx-grid'){ grids++; kind = grids === 1 ? 'bbx-sig' : 'bbx-other'; }
      w.className = 'bbx-sec ' + kind;
      s.parts.forEach(function(p){ w.appendChild(p); });
      frag.appendChild(w);
    });
    body.appendChild(frag);
    /* risk shape + the 5 signals share one row box, so the sticky radar stays
       inside that row instead of sliding over the sections below it (2026-11-17) */
    var rad = body.querySelector(':scope > .bbx-radar'), sig = body.querySelector(':scope > .bbx-sig');
    if(rad && sig){
      var pair = document.createElement('div');
      pair.className = 'bbx-sec bbx-pair';
      body.insertBefore(pair, rad);
      pair.appendChild(rad); pair.appendChild(sig);
    }
    body.classList.add('bbx-body');
    busy = false;
  }
  function find(){
    var sec = document.getElementById('bubble'); if(!sec) return null;
    var wrap = sec.querySelector('.bb-wrap'); if(!wrap) return null;
    var body = null;
    Array.prototype.forEach.call(wrap.children, function(c){ if(!body && !c.classList.contains('section-head') && !c.classList.contains('bb-disclaimer') && !c.classList.contains('pzx-hero')) body = c; });
    return body;
  }
  var watched = null, mo = null;
  function tick(){
    var sec = document.getElementById('bubble');
    var body = find();
    if(body && body !== watched){
      watched = body;
      if(mo) mo.disconnect();
      mo = new MutationObserver(function(){ arrange(body); });
      mo.observe(body, { childList:true });
    }
    if(body) arrange(body);
    if(sec && !sec.__bbxRoot){
      sec.__bbxRoot = true;
      new MutationObserver(function(){ var b = find(); if(b && b !== watched) tick(); }).observe(sec, { childList:true });
    }
  }
  var n = 0, iv = setInterval(function(){ tick(); if(watched && ++n > 40) clearInterval(iv); }, 500);
})();
