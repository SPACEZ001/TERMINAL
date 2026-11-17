/* =====================================================================
   SPACEZ TOOLS PANEL v2 (2026-11-17) — the "เครื่องมือ" modal (#v8Tools)
   User request: each tool (position size, currency, wealth builder) should
   read on one screen without much scrolling, look like the rest of the site,
   and have nicer pictures. The three calculators themselves (part-08 etc.)
   are untouched; this layer:
   * fills sensible example numbers the first time, and recalculates as you
     type (it presses the tool's own Calculate button, 300 ms after typing);
   * draws a small price ladder for the position-size result (entry, stop,
     risk zone, 1R / 2R targets);
   * folds the long Paper Trading block under "Position size" into one card;
   * scrolls back to the top when you switch tabs.
   Layout and looks are in part-94.css.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_TOOLS2) return;
  window.__SPZ_TOOLS2 = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o[L()] != null ? o[L()] : o.en; }
  function B(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  var DEF = {
    sizing:{ btn:'szCalcBtn', v:{ szAccount:10000, szRisk:1, szEntry:52.3, szStop:49.8 } },
    fx:{ btn:'fxCalcBtn', v:{ fxAmount:1000 } },
    wealth:{ btn:'wbCalcBtn', v:{ wbPrincipal:5000, wbMonthly:300, wbReturn:7, wbYears:20, wbInflation:3, wbFees:1 } }
  };
  var filled = {}, tmr = {};
  function num(id){ var e = document.getElementById(id); var x = e ? parseFloat(e.value) : NaN; return isFinite(x) ? x : NaN; }
  function fill(k){
    if(filled[k]) return; filled[k] = true;
    var d = DEF[k]; if(!d) return;
    Object.keys(d.v).forEach(function(id){ var e = document.getElementById(id); if(e && e.value === '') e.value = d.v[id]; });
    run(k, true);
  }
  function run(k, quiet){
    var d = DEF[k], b = d && document.getElementById(d.btn); if(!b) return;
    try { b.click(); } catch(e){}
    if(k === 'sizing') setTimeout(ladder, 60);
    if(quiet){ var er = document.querySelector('#' + k + ' .calc-error'); if(er && !er.textContent.trim()) er.textContent = ''; }
  }
  function ladder(){
    var res = document.getElementById('szResults'); if(!res) return;
    var old = res.querySelector('.t2-ladder'); if(old) old.remove();
    var en = num('szEntry'), st = num('szStop'), acct = num('szAccount'), rk = num('szRisk');
    if(!(en > 0) || !(st > 0) || en === st || res.querySelector('.calc-placeholder')) return;
    var long = en > st, r = Math.abs(en - st), t1 = long ? en + r : en - r, t2 = long ? en + 2 * r : en - 2 * r;
    var hi = Math.max(t2, st, en) , lo = Math.min(t2, st, en), pad = (hi - lo) * .12, H = 165, W = 560;
    var y = function(v){ return 16 + (hi + pad - v) / ((hi - lo) + 2 * pad) * (H - 32); };
    var f = function(v){ return v.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US', { maximumFractionDigits:2 }); };
    var row = function(v, cls, lab){ var yy = y(v); return '<line x1="70" x2="' + (W - 150) + '" y1="' + yy + '" y2="' + yy + '" class="' + cls + '"/><text x="' + (W - 140) + '" y="' + (yy + 4) + '" class="tl ' + cls + '">' + esc(lab) + '</text><text x="62" y="' + (yy + 4) + '" text-anchor="end" class="tv">' + f(v) + '</text>'; };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="t2-svg" role="img" aria-label="price ladder">' +
      '<defs><linearGradient id="t2Risk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171" stop-opacity=".28"/><stop offset="1" stop-color="#f87171" stop-opacity=".08"/></linearGradient>' +
      '<linearGradient id="t2Gain" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#34d399" stop-opacity=".08"/><stop offset="1" stop-color="#34d399" stop-opacity=".26"/></linearGradient></defs>' +
      '<rect x="70" width="' + (W - 220) + '" y="' + Math.min(y(en), y(st)) + '" height="' + Math.abs(y(en) - y(st)) + '" fill="url(#t2Risk)" rx="6"/>' +
      '<rect x="70" width="' + (W - 220) + '" y="' + Math.min(y(en), y(t2)) + '" height="' + Math.abs(y(en) - y(t2)) + '" fill="url(#t2Gain)" rx="6"/>' +
      row(t2, 'g2', T(B('Target 2R', 'เป้า 2R'))) + row(t1, 'g1', T(B('Target 1R', 'เป้า 1R'))) + row(en, 'en', T(B('Entry', 'จุดซื้อ'))) + row(st, 'sl', T(B('Stop', 'จุดตัดขาดทุน'))) +
      '</svg>';
    var risk = isFinite(acct) && isFinite(rk) ? acct * rk / 100 : NaN;
    var box = document.createElement('div'); box.className = 'calc-result t2-ladder';
    box.innerHTML = '<div class="rc-label">' + esc(T(B('Your trade on one picture', 'ภาพเดียวของการเทรดนี้'))) + '</div>' + svg +
      '<p class="t2-cap">' + esc(T(B('Red = what you lose if the stop is hit' + (isFinite(risk) ? ' (≈ $' + f(risk) + ')' : '') + '. Green = the move to 2× that risk. A good trade usually aims for at least 2R.',
        'สีแดง = เงินที่เสียถ้าโดนจุดตัดขาดทุน' + (isFinite(risk) ? ' (ราว $' + f(risk) + ')' : '') + ' สีเขียว = ระยะกำไร 2 เท่าของความเสี่ยง เทรดที่ดีมักตั้งเป้าอย่างน้อย 2R'))) + '</p>';
    res.appendChild(box);
  }
  function foldPaper(){
    var pt = document.getElementById('paperTrading'); if(!pt || pt.__t2) return;
    pt.__t2 = true;
    var head = document.createElement('button'); head.type = 'button'; head.className = 't2-fold';
    var paintHead = function(){ var open = pt.classList.contains('t2-open'); head.innerHTML = '<span class="t2-fi">◎</span><span class="t2-ft"><b>' + esc(T(B('Paper trading — practise with pretend money', 'ลองเทรดจำลอง — ฝึกด้วยเงินสมมุติ'))) + '</b><small>' + esc(T(B('Open a pretend position, follow it with live prices, close it and see the result.', 'เปิดสถานะสมมุติ ติดตามด้วยราคาจริง ปิดแล้วดูผลกำไรขาดทุน'))) + '</small></span><span class="t2-fc">' + esc(T(open ? B('Hide', 'ย่อ') : B('Open', 'เปิด'))) + ' ' + (open ? '▴' : '▾') + '</span>'; };
    pt.parentNode.insertBefore(head, pt);
    head.addEventListener('click', function(){ pt.classList.toggle('t2-open'); paintHead(); });
    paintHead();
    new MutationObserver(paintHead).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }
  function current(){ var on = document.querySelector('#v8Tools .modal-body > section.on'); return on ? on.id : null; }
  function mount(){
    var m = document.getElementById('v8Tools'); if(!m) return false;
    var body = m.querySelector('.modal-body'); if(!body) return false;
    m.classList.add('t2');
    foldPaper();
    var last = null;
    var check = function(){ if(!m.classList.contains('on')) { last = null; return; } var c = current(); if(c && c !== last){ last = c; body.scrollTop = 0; fill(c); if(c === 'sizing') setTimeout(ladder, 80); } };
    new MutationObserver(check).observe(m, { attributes:true, attributeFilter:['class'], subtree:true });
    body.addEventListener('input', function(e){
      var sec = e.target.closest('section'); if(!sec || !DEF[sec.id]) return;
      clearTimeout(tmr[sec.id]); tmr[sec.id] = setTimeout(function(){ run(sec.id); }, 300);
    });
    body.addEventListener('change', function(e){ var sec = e.target.closest('section'); if(sec && sec.id === 'fx') run('fx'); });
    document.addEventListener('click', function(e){ if(e.target.closest && e.target.closest('#szCalcBtn')) setTimeout(ladder, 60); });
    check();
    return true;
  }
  var n = 0, iv = setInterval(function(){ if(mount() || ++n > 80) clearInterval(iv); }, 300);
})();
