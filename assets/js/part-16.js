
/* ============================================================================
   SPACEZ TERMINAL v10 — ENTRY GATE · ANIMATED INFOGRAPHICS · RADAR · CROSSHAIR
   ========================================================================= */
(function(){
  'use strict';

  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var repaint = [];

  /* ======================= 1. ENTRY GATE ======================= */
  var GATE = {
    h:{en:'Before you go in — read this',th:'ก่อนเข้าใช้งาน — อ่านตรงนี้ก่อน'},
    l:{en:[
      'This is an educational terminal. Nothing in it is investment advice, a recommendation, or a solicitation to buy or sell any security.',
      'Price charts in the Chart Lab are simulated data for practising chart reading. They are not real quotes and must never be used to value anything or to place a trade.',
      'Company examples, metric figures and market-cycle readings are illustrations. Verify every number at the primary source before you act on it.',
      'Live prices and fundamentals are pulled straight from free third-party APIs (Finnhub, Yahoo Finance via public proxies, open.er-api.com for FX). They can be delayed, rate-limited, partially wrong, or unavailable — treat every live number as indicative and confirm it at the primary source before acting.',
      'Investing carries risk of permanent loss. Past performance tells you nothing reliable about the future.',
      'The author is not a licensed financial advisor and knows nothing about your finances, tax position or goals. Speak to a licensed professional before committing money.'
    ],th:[
      'นี่คือเทอร์มินัลเพื่อการศึกษา ไม่มีส่วนใดเป็นคำแนะนำการลงทุน การชี้ชวน หรือการเสนอให้ซื้อขายหลักทรัพย์ใดๆ',
      'กราฟราคาในห้องทดลองกราฟเป็นข้อมูลจำลองสำหรับฝึกอ่านกราฟ ไม่ใช่ราคาจริง และห้ามใช้ประเมินมูลค่าหรือใช้ตัดสินใจเทรดเด็ดขาด',
      'ชื่อบริษัท ตัวเลขเมตริก และการอ่านวัฏจักรตลาด เป็นเพียงตัวอย่างประกอบ ให้ตรวจสอบทุกตัวเลขจากแหล่งต้นทางก่อนนำไปใช้',
      'ราคาสดและตัวเลขพื้นฐานดึงตรงจาก API ฟรีของบุคคลที่สาม (Finnhub, Yahoo Finance ผ่าน public proxy และ open.er-api.com สำหรับอัตราแลกเปลี่ยน) ข้อมูลอาจหน่วง ถูกจำกัดจำนวนครั้ง คลาดเคลื่อน หรือใช้ไม่ได้ชั่วคราว ให้ถือเป็นตัวเลขอ้างอิงและตรวจสอบกับแหล่งต้นทางก่อนใช้ตัดสินใจเสมอ',
      'การลงทุนมีความเสี่ยงที่จะสูญเงินต้นอย่างถาวร ผลตอบแทนในอดีตไม่ได้บอกอะไรที่เชื่อถือได้เกี่ยวกับอนาคต',
      'ผู้จัดทำไม่ใช่ผู้แนะนำการลงทุนที่มีใบอนุญาต และไม่รู้อะไรเลยเกี่ยวกับการเงิน ภาษี หรือเป้าหมายของคุณ ควรปรึกษาผู้เชี่ยวชาญที่มีใบอนุญาตก่อนลงเงินจริง'
    ]},
    chk:{en:'I understand this is educational content only, that the chart data is simulated, and that I am responsible for my own decisions.',
         th:'ผมเข้าใจว่านี่เป็นเนื้อหาเพื่อการศึกษาเท่านั้น ข้อมูลกราฟเป็นข้อมูลจำลอง และผมรับผิดชอบการตัดสินใจของตัวเอง'},
    go:{en:'Enter terminal',th:'เข้าสู่เทอร์มินัล'},
    fine:{en:'Not affiliated with any broker, exchange or issuer. No personal data is collected — your browser calls the free market-data APIs directly, and any API key you enter stays in this browser only.',
          th:'ไม่มีความเกี่ยวข้องกับโบรกเกอร์ ตลาดหลักทรัพย์ หรือผู้ออกหลักทรัพย์ใดๆ ไม่มีการเก็บข้อมูลส่วนตัว เบราว์เซอร์ของคุณเรียก API ข้อมูลตลาดฟรีโดยตรง และคีย์ API ที่ใส่ไว้จะถูกเก็บในเบราว์เซอร์นี้เท่านั้น'}
  };

  function buildGate(){
    var done = false;
    try { done = window.__spzAckFresh ? window.__spzAckFresh() : false; } catch(e){}
    var g = el('div', 'gate');
    g.id = 'spzGate';
    g.setAttribute('role', 'dialog');
    g.innerHTML =
      '<div class="gate-box">' +
        '<div class="gate-mark"><span class="gate-blip"></span><span class="gate-brand">SPACEZ</span>' +
        '<span class="gate-sub">// TERMINAL</span>' +
        '<span class="gate-lang"><button type="button" class="gate-lg" data-x="en">EN</button>' +
        '<button type="button" class="gate-lg" data-x="th">TH</button></span></div>' +
        '<h2 class="gate-h" data-x="h"></h2><ul class="gate-l" data-x="l"></ul>' +
        '<div class="gate-chk" data-x="chk"><span class="gate-cb">✓</span><span data-x="ct"></span></div>' +
        '<button type="button" class="btn btn-primary gate-go" data-x="go" disabled></button>' +
        '<div class="gate-fine" data-x="fine"></div>' +
      '</div>';
    document.body.appendChild(g);

    var chk = g.querySelector('[data-x="chk"]'), go = g.querySelector('[data-x="go"]');

    /* language pick inside the gate — English is the default */
    function setLang(want){
      var btn = document.getElementById('langToggle');
      if(btn && document.documentElement.lang !== want) btn.click();
      var en = g.querySelector('[data-x="en"]'), th = g.querySelector('[data-x="th"]');
      setTimeout(function(){
        en.classList.toggle('on', L() === 'en');
        th.classList.toggle('on', L() === 'th');
      }, 20);
    }
    g.querySelector('[data-x="en"]').addEventListener('click', function(){ setLang('en'); });
    g.querySelector('[data-x="th"]').addEventListener('click', function(){ setLang('th'); });
    var ok = false;
    chk.addEventListener('click', function(){
      ok = !ok;
      chk.classList.toggle('on', ok);
      go.disabled = !ok;
    });
    go.addEventListener('click', function(){
      try { (window.__spzAckStamp ? window.__spzAckStamp()
             : localStorage.setItem('spacez.ack', String(Date.now()))); } catch(e){}
      g.hidden = true;
      document.body.style.overflow = '';
      document.documentElement.classList.remove('spz-gate-wait');
    });

    function paint(){
      g.querySelector('[data-x="h"]').textContent = T(GATE.h);
      var ul = g.querySelector('[data-x="l"]');
      ul.innerHTML = '';
      var arr = T(GATE.l);
      for(var i = 0; i < arr.length; i++){ ul.appendChild(el('li', null, esc(arr[i]))); }
      g.querySelector('[data-x="ct"]').textContent = T(GATE.chk);
      go.textContent = T(GATE.go);
      g.querySelector('[data-x="fine"]').textContent = T(GATE.fine);
      g.querySelector('[data-x="en"]').classList.toggle('on', L() === 'en');
      g.querySelector('[data-x="th"]').classList.toggle('on', L() === 'th');
    }
    repaint.push(paint);
    paint();

    if(done){ g.hidden = true; document.documentElement.classList.remove('spz-gate-wait'); }
    else { document.body.style.overflow = 'hidden'; }
  }

  /* ======================= 2. ARCHETYPE ANIMATIONS ======================= */
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  /* SMIL rather than CSS keyframes: it survives class overrides and keeps
     looping inside sections the router hides and re-shows. */
  function an(attr, values, dur, delay, keyTimes){
    if(RM) return '';
    return '<animate attributeName="' + attr + '" values="' + values + '"' +
      (keyTimes ? ' keyTimes="' + keyTimes + '"' : '') +
      ' dur="' + dur + 's" begin="' + (delay || 0) + 's" repeatCount="indefinite"' +
      ' calcMode="spline" keySplines="' + (keyTimes ? '.2 .8 .2 1;0 0 1 1;.4 0 .6 1' : '.4 0 .6 1') + '"/>';
  }
  function dashLoop(delay){
    if(RM) return '';
    return '<animate attributeName="stroke-dashoffset" values="520;0;0;-520" keyTimes="0;.36;.8;1"' +
      ' dur="6.5s" begin="' + delay + 's" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="1;1;1;0;1" keyTimes="0;.36;.86;.99;1"' +
      ' dur="6.5s" begin="' + delay + 's" repeatCount="indefinite"/>';
  }
  function sweep(){
    if(RM) return '';
    return '<defs><linearGradient id="avSw" x1="0" x2="1">' +
      '<stop offset="0" stop-color="var(--neon)" stop-opacity="0"/>' +
      '<stop offset=".5" stop-color="var(--neon)" stop-opacity=".2"/>' +
      '<stop offset="1" stop-color="var(--neon)" stop-opacity="0"/></linearGradient></defs>' +
      '<rect y="0" width="34" height="80" fill="url(#avSw)">' +
      '<animate attributeName="x" values="-34;250" dur="5.6s" repeatCount="indefinite"/></rect>';
  }
  var DASH = ' stroke-dasharray="520" stroke-dashoffset="520" fill="none" stroke-width="2.2"' +
             ' stroke-linecap="round" stroke-linejoin="round"';

  var ARCH_VIZ = {
    value:{cap:{en:'Price below intrinsic value — the gap is the trade',th:'ราคาต่ำกว่ามูลค่าที่แท้จริง — ช่องว่างนั้นคือกำไร'},
      svg:function(){
        return sweep() +
          '<path class="av-grid" d="M6 62 H244 M6 44 H244 M6 26 H244"/>' +
          '<path' + DASH + ' stroke="rgba(255,255,255,.42)" d="M8 30 C50 27,86 24,120 22 C158 20,200 17,242 15">' +
            dashLoop(0.1) + '</path>' +
          '<path' + DASH + ' stroke="var(--neon)" d="M8 40 C46 47,74 62,112 60 C152 58,196 44,242 34">' +
            dashLoop(0.5) + '</path>' +
          '<line x1="120" y1="22" x2="120" y2="60" stroke="var(--amber)" stroke-width="1.2" stroke-dasharray="3 3"/>' +
          '<path d="M116 27 L120 21 L124 27" fill="none" stroke="var(--amber)" stroke-width="1.2"/>' +
          '<path d="M116 55 L120 61 L124 55" fill="none" stroke="var(--amber)" stroke-width="1.2"/>' +
          '<circle cx="120" cy="41" fill="var(--amber)" opacity=".3" r="12">' +
            an('r', '11;16;11', 3.2) + an('opacity', '.32;.1;.32', 3.2) + '</circle>' +
          '<text class="av-lbl" x="8" y="12">INTRINSIC VALUE</text>' +
          '<text class="av-lbl" x="130" y="45" fill="var(--amber)">MARGIN OF SAFETY' +
            an('opacity', '.35;1;.35', 2.4) + '</text>' +
          '<text class="av-lbl" x="8" y="74" fill="var(--neon)">MARKET PRICE</text>';
      }},
    growth:{cap:{en:'Revenue compounding — volatility is the entry fee',th:'รายได้ทบต้นขึ้นไป ความผันผวนคือค่าผ่านประตู'},
      svg:function(){
        var s = sweep() + '<path class="av-grid" d="M6 62 H244 M6 44 H244 M6 26 H244"/>';
        var hs = [10, 16, 13, 24, 20, 33, 29, 44, 40, 56];
        for(var i = 0; i < hs.length; i++){
          var h = hs[i], y = 66 - h, d = (i * 0.16).toFixed(2);
          s += '<rect x="' + (14 + i * 23) + '" y="' + y + '" width="13" height="' + h + '" rx="2" fill="' +
               (i % 2 ? 'rgba(204,255,0,.45)' : 'var(--neon)') + '">' +
               an('height', '2;' + h + ';' + h + ';2', 5.2, d, '0;.26;.76;1') +
               an('y', '64;' + y + ';' + y + ';64', 5.2, d, '0;.26;.76;1') + '</rect>';
        }
        s += '<path' + DASH + ' stroke="rgba(255,255,255,.55)" stroke-dasharray="4 4" ' +
             'd="M14 58 C80 52,150 34,240 10">' +
             (RM ? '' : '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.3;.45;.85;1" dur="5.2s" begin="1.4s" repeatCount="indefinite"/>') +
             '</path>' +
             '<text class="av-lbl" x="8" y="12">REVENUE / EPS</text>' +
             '<text class="av-lbl" x="176" y="74" fill="var(--neon)">COMPOUNDING' +
             an('opacity', '.35;1;.35', 2.4) + '</text>';
        return s;
      }},
    dividend:{cap:{en:'Cash lands on a schedule, chart or no chart',th:'เงินสดเข้าตามตาราง ไม่ว่ากราฟจะเป็นยังไง'},
      svg:function(){
        var s = sweep() +
          '<rect x="150" y="30" width="92" height="38" rx="6" fill="none" stroke="var(--border)" stroke-width="1.2"/>' +
          '<text class="av-lbl" x="158" y="44" fill="var(--neon)">YOUR ACCOUNT</text>' +
          '<path' + DASH + ' stroke="var(--neon)" d="M158 58 H234">' + dashLoop(0.2) + '</path>' +
          '<rect x="10" y="24" width="66" height="44" rx="6" fill="none" stroke="var(--border-dim)"/>' +
          '<text class="av-lbl" x="17" y="40">COMPANY</text>' +
          '<text class="av-lbl" x="17" y="56" fill="var(--neon-2)">CASH FLOW</text>' +
          '<path d="M80 46 H146" stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="3 4"/>';
        for(var i = 0; i < 4; i++){
          var d = (i * 0.62).toFixed(2);
          s += '<circle cx="88" cy="46" r="4.5" fill="var(--amber)" opacity="0">' +
               (RM ? '' :
                '<animateTransform attributeName="transform" type="translate" values="0,0;104,0" dur="2.5s" begin="' + d + 's" repeatCount="indefinite"/>' +
                '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.8;1" dur="2.5s" begin="' + d + 's" repeatCount="indefinite"/>') +
               '</circle>';
        }
        s += '<text class="av-lbl" x="88" y="74" fill="var(--amber)">QUARTERLY PAYOUT' +
             an('opacity', '.35;1;.35', 2.5) + '</text>';
        return s;
      }},
    defensive:{cap:{en:'Market falls, demand does not',th:'ตลาดลง แต่ความต้องการไม่ลง'},
      svg:function(){
        return sweep() +
          '<path class="av-grid" d="M6 62 H244 M6 44 H244 M6 26 H244"/>' +
          '<path' + DASH + ' stroke="var(--red)" d="M8 20 C44 24,66 30,92 44 C118 58,152 66,242 62">' +
            dashLoop(0.1) + '</path>' +
          '<path' + DASH + ' stroke="var(--neon-2)" d="M8 34 C48 34,74 38,104 40 C142 42,190 36,242 32">' +
            dashLoop(0.55) + '</path>' +
          '<circle cx="180" cy="40" fill="var(--neon-2)" opacity=".3" r="13">' +
            an('r', '12;18;12', 3.4) + an('opacity', '.3;.08;.3', 3.4) + '</circle>' +
          '<text class="av-lbl" x="8" y="12" fill="var(--red)">MARKET</text>' +
          '<text class="av-lbl" x="8" y="74" fill="var(--neon-2)">DEFENSIVE HOLDING</text>';
      }}
  };

  function mountArchViz(){
    var cards = document.querySelectorAll('#types .archetype-card');
    var keys = ['value', 'growth', 'dividend', 'defensive'];
    for(var i = 0; i < cards.length && i < 4; i++){
      (function(card, k){
        if(card.querySelector('.arch-viz')) return;
        var d = ARCH_VIZ[k];
        var box = el('div', 'arch-viz',
          '<svg class="arch-svg" viewBox="0 0 250 80" preserveAspectRatio="xMidYMid meet">' + d.svg() + '</svg>' +
          '<div class="cl-hint" data-av="cap" style="margin-top:6px"></div>');
        var pills = card.querySelector('.sector-pills');
        pills ? card.insertBefore(box, pills) : card.appendChild(box);
        function paint(){ box.querySelector('[data-av="cap"]').textContent = T(d.cap); }
        repaint.push(paint); paint();
      })(cards[i], keys[i]);
    }
  }

  /* ======================= 3. COMPARATOR RADAR ======================= */
  var CMP_MAXVIZ = 6;
  var CMP = {
    h:{en:'Head-to-head shape',th:'รูปทรงเปรียบเทียบ'},
    trim:{en:'Showing the top %A of %B selected, ranked by score — the full table below covers all of them.',
          th:'แสดง %A อันดับแรกจาก %B ตัวที่เลือก เรียงตามคะแนน — ตารางด้านล่างมีครบทุกตัว'},
    hint:{en:'Every axis is normalised so further out is always better. Tap a name to isolate it.',
          th:'ทุกแกนถูกปรับให้ยิ่งออกนอกยิ่งดีเสมอ แตะชื่อหุ้นเพื่อดูเฉพาะตัวนั้น'},
    score:{en:'Overall score',th:'คะแนนรวม'}
  };
  var CMP_AX = [
    {l:{en:'P/E',th:'P/E'}, low:true},
    {l:{en:'Yield',th:'ปันผล'}, low:false},
    {l:{en:'ROE',th:'ROE'}, low:false},
    {l:{en:'D/E',th:'D/E'}, low:true},
    {l:{en:'Margin',th:'มาร์จิ้น'}, low:false},
    {l:{en:'P/B',th:'P/B'}, low:true}
  ];
  var CMP_COL = ['#ccff00', '#4dd8ff', '#ff9f45', '#b98cff'];

  function readCompareTable(){
    var t = document.getElementById('compareTable');
    if(!t || !t.tBodies.length) return null;
    var ths = t.querySelectorAll('thead th');
    var names = [];
    for(var i = 1; i < ths.length; i++){ names.push(ths[i].textContent.replace('$', '').trim()); }
    if(names.length < 2) return null;
    var rows = t.tBodies[0].rows, vals = [], scores = [];
    for(var r = 0; r < rows.length; r++){
      var cells = rows[r].cells, line = [];
      for(var c = 1; c < cells.length; c++){
        var m = cells[c].textContent.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
        line.push(m ? parseFloat(m[0]) : NaN);
      }
      if(rows[r].classList.contains('score-row')) scores = line;
      else if(vals.length < 6) vals.push(line);
    }
    if(vals.length < 6) return null;
    return { names:names, vals:vals, scores:scores };
  }

  function radarSVG(d, hidden){
    var N = 6, R = 78, CX = 108, CY = 104, s = '';
    var norm = [];
    for(var a = 0; a < N; a++){
      var row = d.vals[a], mn = Infinity, mx = -Infinity, i;
      for(i = 0; i < row.length; i++){
        if(!isFinite(row[i])) continue;
        if(row[i] < mn) mn = row[i];
        if(row[i] > mx) mx = row[i];
      }
      var out = [];
      for(i = 0; i < row.length; i++){
        if(!isFinite(row[i])){ out.push(0.42); continue; }
        var t = mx === mn ? 0.62 : (row[i] - mn) / (mx - mn);
        out.push(0.24 + (CMP_AX[a].low ? 1 - t : t) * 0.72);
      }
      norm.push(out);
    }
    for(var ring = 1; ring <= 4; ring++){
      var pts = [];
      for(var k = 0; k < N; k++){
        var ang = -Math.PI / 2 + k * 2 * Math.PI / N, rr = R * ring / 4;
        pts.push((CX + Math.cos(ang) * rr).toFixed(1) + ',' + (CY + Math.sin(ang) * rr).toFixed(1));
      }
      s += '<polygon class="rd-web" points="' + pts.join(' ') + '"/>';
    }
    for(var k2 = 0; k2 < N; k2++){
      var an = -Math.PI / 2 + k2 * 2 * Math.PI / N;
      var lx = CX + Math.cos(an) * (R + 18), ly = CY + Math.sin(an) * (R + 18);
      s += '<line class="rd-spoke" x1="' + CX + '" y1="' + CY + '" x2="' + (CX + Math.cos(an) * R).toFixed(1) +
           '" y2="' + (CY + Math.sin(an) * R).toFixed(1) + '"/>' +
           '<text class="rd-ax" x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle">' +
           esc(T(CMP_AX[k2].l)) + '</text>';
    }
    for(var p = 0; p < d.names.length; p++){
      var col = CMP_COL[p % 4], poly = [], dots = '';
      for(var q = 0; q < N; q++){
        var a2 = -Math.PI / 2 + q * 2 * Math.PI / N, rad = R * norm[q][p];
        var x = CX + Math.cos(a2) * rad, y = CY + Math.sin(a2) * rad;
        poly.push(x.toFixed(1) + ',' + y.toFixed(1));
        dots += '<circle class="rd-dot" r="1.7" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" fill="' + col + '"/>';
      }
      var off = hidden.indexOf(d.names[p]) !== -1;
      var solo = !off && hidden.length === d.names.length - 1;
      s += '<g class="rd-poly ' + (off ? 'mute' : (solo ? 'solo' : '')) + '" data-nm="' + esc(d.names[p]) + '">' +
           '<polygon points="' + poly.join(' ') + '" fill="' + col + '" fill-opacity=".055" stroke="' + col +
           '" stroke-width="1.15" stroke-linejoin="round"/>' + dots + '</g>';
    }
    return '<svg class="radar-svg" viewBox="0 0 216 208" preserveAspectRatio="xMidYMid meet">' + s + '</svg>';
  }

  function mountCompareViz(){
    var d = readCompareTable();
    var host = document.getElementById('compareResults');
    if(!host) return;
    var box = document.getElementById('cmpViz');
    if(!d){ if(box) box.remove(); return; }

    /* keep the SVG light: chart only the strongest few, table below keeps all */
    var totalPicked = d.names.length, trimmed = false;
    if(totalPicked > CMP_MAXVIZ){
      var order = [];
      for(var z = 0; z < totalPicked; z++){ order.push(z); }
      order.sort(function(a, b){
        return (isFinite(d.scores[b]) ? d.scores[b] : -1) - (isFinite(d.scores[a]) ? d.scores[a] : -1);
      });
      order = order.slice(0, CMP_MAXVIZ);
      var nn = [], nv = [], ns = [];
      for(var y = 0; y < order.length; y++){
        nn.push(d.names[order[y]]);
        ns.push(d.scores[order[y]]);
      }
      for(var x = 0; x < d.vals.length; x++){
        var line = [];
        for(var w = 0; w < order.length; w++){ line.push(d.vals[x][order[w]]); }
        nv.push(line);
      }
      d = { names:nn, vals:nv, scores:ns };
      trimmed = true;
    }
    if(!box){
      box = el('div', 'cmp-viz');
      box.id = 'cmpViz';
      var rank = host.querySelector('.compare-ranking-panel');
      rank ? host.insertBefore(box, rank) : host.appendChild(box);
    }
    var hidden = box.__hidden || (box.__hidden = []);

    var rings = '';
    for(var i = 0; i < d.names.length; i++){
      var sc = isFinite(d.scores[i]) ? d.scores[i] : 0, col = CMP_COL[i % 4];
      var C = 2 * Math.PI * 38;
      rings += '<div class="ring"><svg viewBox="0 0 96 96">' +
        '<circle class="ring-bg" cx="48" cy="48" r="38"/>' +
        '<circle class="ring-fg" cx="48" cy="48" r="38" stroke="' + col + '" ' +
        'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" data-off="' +
        (C * (1 - sc / 100)).toFixed(1) + '"/>' +
        '<text class="ring-v" x="48" y="50" text-anchor="middle">' + sc + '</text>' +
        '<text class="ring-u" x="48" y="63" text-anchor="middle">/100</text></svg>' +
        '<div class="ring-t" style="color:' + col + '">$' + esc(d.names[i]) + '</div></div>';
    }

    var rows = '';
    for(var a = 0; a < 6; a++){
      var row = d.vals[a], mn = Infinity, mx = -Infinity, j;
      for(j = 0; j < row.length; j++){
        if(!isFinite(row[j])) continue;
        if(row[j] < mn) mn = row[j];
        if(row[j] > mx) mx = row[j];
      }
      var segs = '';
      for(j = 0; j < row.length; j++){
        var t = (!isFinite(row[j]) || mx === mn) ? 0.5 : (row[j] - mn) / (mx - mn);
        var v = CMP_AX[a].low ? 1 - t : t;
        segs += '<span class="cmp-seg" style="width:0;background:' + CMP_COL[j % 4] + '" data-w="' +
                (8 + v * 92 / row.length).toFixed(1) + '"></span>';
      }
      rows += '<div class="cmp-row"><div class="cmp-rl"><span>' + esc(T(CMP_AX[a].l)) +
              '</span><span>' + (CMP_AX[a].low ? '↓ better' : '↑ better') + '</span></div>' +
              '<div class="cmp-track">' + segs + '</div></div>';
    }

    var lg = '';
    for(var n = 0; n < d.names.length; n++){
      lg += '<span class="cmp-lg' + (hidden.indexOf(d.names[n]) !== -1 ? ' off' : '') + '" data-nm="' + esc(d.names[n]) + '">' +
            '<span class="cmp-sw" style="background:' + CMP_COL[n % 4] + '"></span>$' + esc(d.names[n]) + '</span>';
    }

    box.innerHTML =
      '<div class="cmp-viz-h">▲ ' + esc(T(CMP.h)) + '</div>' +
      '<div class="cmp-grid"><div>' + radarSVG(d, hidden) +
      '<div class="cmp-legend">' + lg + '</div>' +
      '<div class="cl-hint">' + esc(T(CMP.hint)) +
        (trimmed ? ' — ' + esc(T(CMP.trim).replace('%A', CMP_MAXVIZ).replace('%B', totalPicked)) : '') +
      '</div></div>' +
      '<div><div class="cmp-rows">' + rows + '</div>' +
      '<div class="cl-hint" style="margin:16px 0 6px">' + esc(T(CMP.score)) + '</div>' +
      '<div class="cmp-rings">' + rings + '</div></div></div>';

    requestAnimationFrame(function(){
      var segs = box.querySelectorAll('.cmp-seg');
      for(var i2 = 0; i2 < segs.length; i2++){ segs[i2].style.width = segs[i2].getAttribute('data-w') + '%'; }
      var rf = box.querySelectorAll('.ring-fg');
      for(var r2 = 0; r2 < rf.length; r2++){ rf[r2].style.strokeDashoffset = rf[r2].getAttribute('data-off'); }
    });

    var lgs = box.querySelectorAll('.cmp-lg');
    for(var q = 0; q < lgs.length; q++){
      (function(node){
        node.addEventListener('click', function(){
          var nm = node.getAttribute('data-nm'), k = hidden.indexOf(nm);
          k === -1 ? hidden.push(nm) : hidden.splice(k, 1);
          mountCompareViz();
        });
      })(lgs[q]);
    }
  }

  /* ======================= 4. PHASE EVIDENCE + EXAMPLES ======================= */
  var EV = {
    h:{en:'Why the data reads mid-cycle',th:'ทำไมข้อมูลถึงอ่านว่าเป็นกลางวัฏจักร'},
    lede:{en:'Six indicators, each pointing at a phase. The read is mid-cycle because most of them cluster there — not because any single number says so.',
          th:'ตัวชี้วัดหกตัว แต่ละตัวชี้ไปที่ช่วงหนึ่ง ที่อ่านว่ากลางวัฏจักรเพราะส่วนใหญ่กระจุกอยู่ตรงนั้น ไม่ใช่เพราะตัวเลขตัวใดตัวหนึ่งบอก'},
    scale:{en:['Early','Mid','Late','Recession'],th:['ต้น','กลาง','ปลาย','ถดถอย']},
    flipH:{en:'What would change the read',th:'อะไรจะทำให้การอ่านเปลี่ยน'},
    exH:{en:'Example names in the leading sectors',th:'หุ้นตัวอย่างในกลุ่มที่มักนำ'},
    exNote:{en:'Illustrations of what each sector looks like, not recommendations. Tap any ticker to open it in the Chart Lab.',
            th:'ตัวอย่างให้เห็นว่าแต่ละกลุ่มหน้าตาเป็นยังไง ไม่ใช่คำแนะนำให้ซื้อ แตะชื่อย่อเพื่อเปิดในห้องทดลองกราฟ'},
    items:[
      {l:{en:'ISM Manufacturing',th:'PMI ภาคผลิต ISM'},v:'55.6',ph:1,
       n:{en:'Well above the 50 line. Factories expanding this firmly is a mid-cycle reading — late cycle usually shows it rolling over.',
          th:'สูงกว่าเส้น 50 พอสมควร ภาคผลิตที่ขยายตัวแข็งขนาดนี้คือค่าของกลางวัฏจักร ส่วนปลายวัฏจักรมักเห็นมันเริ่มพลิกลง'}},
      {l:{en:'ISM Services',th:'PMI ภาคบริการ ISM'},v:'54.1',ph:1,
       n:{en:'Both halves of the economy expanding at once. Breadth like this rarely survives into late cycle.',
          th:'เศรษฐกิจทั้งสองซีกขยายตัวพร้อมกัน ความกว้างแบบนี้แทบไม่รอดไปถึงปลายวัฏจักร'}},
      {l:{en:'GDP growth',th:'การเติบโต GDP'},v:'1.5–2.1%',ph:1,
       n:{en:'Positive but not a rebound spike. Early cycle prints much faster; recession prints negative.',
          th:'เป็นบวกแต่ไม่ใช่การเด้งแรง ต้นวัฏจักรจะโตเร็วกว่านี้มาก ส่วนถดถอยจะติดลบ'}},
      {l:{en:'Core capex orders',th:'คำสั่งซื้อสินค้าทุนหลัก'},v:'+12.5%',ph:1,
       n:{en:'Businesses still committing capital years ahead. Companies stop doing this first when the cycle turns.',
          th:'ธุรกิจยังผูกพันเงินลงทุนล่วงหน้าเป็นปีๆ บริษัทจะหยุดทำสิ่งนี้เป็นอย่างแรกเมื่อวัฏจักรพลิก'}},
      {l:{en:'CPI inflation',th:'เงินเฟ้อ CPI'},v:'3.5%',ph:2,warm:true,
       n:{en:'The one indicator leaning late. Above target with tariff pressure is a classic maturing-expansion signature.',
          th:'ตัวเดียวที่เอียงไปทางปลายวัฏจักร สูงกว่าเป้าพร้อมแรงกดดันจากภาษีนำเข้า คือลายเซ็นคลาสสิกของการขยายตัวที่โตเต็มที่'}},
      {l:{en:'Earnings revision breadth',th:'ความกว้างการปรับประมาณการกำไร'},v:'+0.64',ph:1,
       n:{en:'More companies being revised up than down, and it is the largest positive contributor to the composite.',
          th:'มีบริษัทที่ถูกปรับประมาณการขึ้นมากกว่าถูกปรับลง และเป็นตัวหนุนบวกมากที่สุดในดัชนีรวม'}}
    ],
    flip:{en:['Two consecutive ISM prints below 50 would move the read to late cycle.',
              'Core capex orders turning negative year on year would do the same, faster.',
              'Inflation re-accelerating above 4% would force a policy response and compress the runway.',
              'Earnings revision breadth turning negative is usually the earliest of the four to move.'],
          th:['ค่า ISM ต่ำกว่า 50 สองครั้งติดจะเลื่อนการอ่านไปเป็นปลายวัฏจักร',
              'คำสั่งซื้อสินค้าทุนหลักติดลบเมื่อเทียบปีก่อน จะทำแบบเดียวกันแต่เร็วกว่า',
              'เงินเฟ้อกลับมาเร่งเกิน 4% จะบังคับให้เกิดการตอบสนองเชิงนโยบายและบีบเวลาที่เหลือ',
              'ความกว้างการปรับประมาณการกำไรพลิกเป็นลบ มักเป็นตัวแรกในสี่ตัวที่ขยับ']}
  };

  var PHASE_EX = {
    early:[
      {s:{en:'Cyclicals',th:'หุ้นวัฏจักร'},t:['SCC','MINT','AMD']},
      {s:{en:'Financials',th:'การเงิน'},t:['JPM','KBANK','SCB']},
      {s:{en:'Small caps',th:'หุ้นเล็ก'},t:['TDEX','VTI']},
      {s:{en:'Consumer discretionary',th:'สินค้าฟุ่มเฟือย'},t:['AMZN','MINT','AOT']}
    ],
    mid:[
      {s:{en:'Technology',th:'เทคโนโลยี'},t:['MSFT','NVDA','META']},
      {s:{en:'Industrials',th:'อุตสาหกรรม'},t:['DELTA','SCC']},
      {s:{en:'Capital goods / power',th:'สินค้าทุน / ไฟฟ้า'},t:['GULF','DELTA']},
      {s:{en:'Communication',th:'สื่อสาร'},t:['META','ADVANC']}
    ],
    late:[
      {s:{en:'Energy',th:'พลังงาน'},t:['XOM','PTT']},
      {s:{en:'Materials',th:'วัสดุ'},t:['SCC']},
      {s:{en:'Healthcare',th:'สุขภาพ'},t:['JNJ','BDMS','BH']},
      {s:{en:'Staples',th:'สินค้าจำเป็น'},t:['PG','KO','CPALL']}
    ],
    rec:[
      {s:{en:'Utilities',th:'สาธารณูปโภค'},t:['DUK','RATCH']},
      {s:{en:'Staples',th:'สินค้าจำเป็น'},t:['KO','PG','CPF']},
      {s:{en:'Healthcare',th:'สุขภาพ'},t:['JNJ','BDMS']},
      {s:{en:'Strong balance sheets',th:'งบดุลแข็งแรง'},t:['MSFT','JNJ','ADVANC']}
    ]
  };

  function evidenceHTML(){
    var sc = T(EV.scale);
    var cards = '';
    for(var i = 0; i < EV.items.length; i++){
      var it = EV.items[i], segs = '';
      for(var g = 0; g < 4; g++){
        segs += '<span class="ev-seg' + (g === it.ph ? ' on' + (it.warm ? ' warm' : '') : '') +
                '" style="transition-delay:' + (i * 0.09 + g * 0.04).toFixed(2) + 's"></span>';
      }
      cards += '<div class="ev-card"><div class="ev-l">' + esc(T(it.l)) + '</div>' +
        '<div class="ev-v">' + esc(it.v) + '</div>' +
        '<div class="ev-scale"><span>' + esc(sc[0]) + '</span><span>' + esc(sc[1]) + '</span><span>' +
        esc(sc[2]) + '</span><span>' + esc(sc[3]) + '</span></div>' +
        '<div class="ev-gauge">' + segs + '</div>' +
        '<div class="ev-tag' + (it.warm ? ' warm' : '') + '">→ ' + esc(sc[it.ph]) + '</div>' +
        '<div class="ev-n" style="margin-top:7px">' + esc(T(it.n)) + '</div></div>';
    }
    var flips = '<ul>';
    var fa = T(EV.flip);
    for(var f = 0; f < fa.length; f++){ flips += '<li>' + esc(fa[f]) + '</li>'; }
    flips += '</ul>';
    return '<div class="v8-sub">' + esc(T(EV.h)) + '</div>' +
      '<p class="lede" style="margin-bottom:18px">' + esc(T(EV.lede)) + '</p>' +
      '<div class="ev-grid">' + cards + '</div>' +
      '<div class="res-card w" style="margin-top:14px"><div class="rc-h warn">' + esc(T(EV.flipH)) + '</div>' + flips + '</div>';
  }

  function examplesHTML(ph){
    var arr = PHASE_EX[ph] || [];
    var h = '<div class="rc-h" style="margin:22px 0 11px">' + esc(T(EV.exH)) + '</div><div class="px-grid">';
    for(var i = 0; i < arr.length; i++){
      var tks = '';
      for(var j = 0; j < arr[i].t.length; j++){
        tks += '<button type="button" class="px-b" data-px="' + esc(arr[i].t[j]) + '">$' + esc(arr[i].t[j]) + '</button>';
      }
      h += '<div class="px-card"><div class="px-s">' + esc(T(arr[i].s)) + '</div><div class="px-t">' + tks + '</div></div>';
    }
    return h + '</div><div class="cl-hint" style="margin-top:11px">' + esc(T(EV.exNote)) + '</div>';
  }

  function jumpTicker(tk){
    var nav = document.querySelector('.nav-links a[data-route-to="chartlab"]');
    if(nav) nav.click();
    setTimeout(function(){
      var sel = document.querySelector('#chartlab .cl-sel');
      if(!sel) return;
      for(var i = 0; i < sel.options.length; i++){
        if(sel.options[i].value === tk){
          sel.value = tk;
          sel.dispatchEvent(new Event('change', { bubbles:true }));
          return;
        }
      }
    }, 160);
  }

  function mountOutlookExtras(){
    var det = document.querySelector('#outlook [data-o="det"]');
    if(!det || det.querySelector('[data-px]')) return;
    var on = document.querySelector('#outlook .cyc-btn.on .cb-t');
    var ids = ['early', 'mid', 'late', 'rec'];
    var btns = document.querySelectorAll('#outlook .cyc-btn');
    var ph = 'mid';
    for(var i = 0; i < btns.length; i++){ if(btns[i].classList.contains('on')) ph = ids[i]; }
    det.insertAdjacentHTML('beforeend', examplesHTML(ph));
    var bs = det.querySelectorAll('[data-px]');
    for(var b = 0; b < bs.length; b++){
      (function(n){ n.addEventListener('click', function(){ jumpTicker(n.getAttribute('data-px')); }); })(bs[b]);
    }
  }

  function mountEvidence(){
    var sec = document.getElementById('outlook');
    if(!sec) return;
    var old = document.getElementById('evBlock');
    if(old) old.remove();
    var box = el('div');
    box.id = 'evBlock';
    box.innerHTML = evidenceHTML();
    var anchor = sec.querySelector('[data-o="s2"]');
    anchor ? sec.insertBefore(box, anchor) : sec.appendChild(box);
    requestAnimationFrame(function(){});
  }

  /* ======================= 5. CHART LAB CROSSHAIR ======================= */
  function mountCrosshair(){
    var cv = document.querySelector('#chartlab [data-c="cv"]');
    if(!cv || cv.__cross) return;
    cv.__cross = 1;
    var panel = cv.parentNode;
    var stage = el('div', 'cl-stage');
    panel.insertBefore(stage, cv);
    stage.appendChild(cv);
    var ov = document.createElement('canvas');
    ov.className = 'cl-over';
    stage.appendChild(ov);
    var tip = el('div', 'cl-tip');
    stage.appendChild(tip);
    var hint = el('div', 'cl-hint');
    panel.insertBefore(hint, stage.nextSibling);
    repaint.push(function(){
      hint.textContent = L() === 'th'
        ? 'เลื่อนเมาส์ (หรือลากนิ้ว) บนกราฟเพื่อดูค่า OHLC ของแต่ละแท่ง'
        : 'Move the mouse — or drag a finger — across the chart to read each bar.';
    });
    hint.textContent = 'Move the mouse — or drag a finger — across the chart to read each bar.';

    function clear(){
      var g = ov.getContext('2d');
      g.clearRect(0, 0, ov.width, ov.height);
      tip.classList.remove('on');
    }

    function at(clientX, clientY){
      var meta = cv.__meta;
      if(!meta){ clear(); return; }
      var rect = cv.getBoundingClientRect();
      var x = clientX - rect.left, y = clientY - rect.top;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ov.width = cv.width; ov.height = cv.height;
      ov.style.width = rect.width + 'px';
      ov.style.height = rect.height + 'px';
      var g = ov.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, rect.width, rect.height);

      var i = Math.round((x - meta.padL) / meta.cw - 0.5);
      if(i < 0) i = 0;
      if(i > meta.bars.length - 1) i = meta.bars.length - 1;
      var b = meta.bars[i];
      if(!b){ clear(); return; }
      var cx = meta.padL + meta.cw * (i + 0.5);

      g.save();
      g.strokeStyle = 'rgba(255,255,255,.32)';
      g.setLineDash([3, 4]);
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, rect.height); g.stroke();
      if(y < meta.mainH){
        g.beginPath(); g.moveTo(meta.padL, y); g.lineTo(meta.padL + meta.plotW, y); g.stroke();
      }
      g.restore();
      g.fillStyle = b.c >= b.o ? 'rgba(0,255,102,.9)' : 'rgba(255,59,78,.9)';
      var yc = meta.y0 + (meta.mainH - meta.y0) * (1 - (b.c - meta.lo) / (meta.hi - meta.lo));
      g.beginPath(); g.arc(cx, yc, 3.6, 0, Math.PI * 2); g.fill();

      var up = b.c >= b.o;
      var pct = ((b.c - b.o) / b.o * 100);
      var f = function(v){ return v >= 100 ? v.toFixed(1) : v.toFixed(2); };
      var lab = L() === 'th'
        ? ['เปิด', 'สูง', 'ต่ำ', 'ปิด', 'แท่งที่']
        : ['O', 'H', 'L', 'C', 'Bar'];
      tip.innerHTML =
        '<b>' + lab[4] + ' ' + (i + 1) + '/' + meta.bars.length + '</b><br>' +
        lab[0] + ' ' + f(b.o) + '  ' + lab[1] + ' <b>' + f(b.h) + '</b><br>' +
        lab[2] + ' <b>' + f(b.l) + '</b>  ' + lab[3] + ' ' + f(b.c) + '<br>' +
        '<span class="' + (up ? 'up' : 'dn') + '">' + (up ? '▲ +' : '▼ ') + pct.toFixed(2) + '%</span>';
      tip.classList.add('on');
      var tw = tip.offsetWidth || 130;
      var tl = cx + 16;
      if(tl + tw > rect.width) tl = cx - tw - 16;
      tip.style.left = Math.max(4, tl) + 'px';
      tip.style.top = Math.max(4, Math.min(y - 20, rect.height - 90)) + 'px';
    }

    cv.addEventListener('mousemove', function(e){ at(e.clientX, e.clientY); });
    cv.addEventListener('mouseleave', clear);
    cv.addEventListener('touchmove', function(e){
      if(e.touches.length !== 1) return;
      e.preventDefault();
      at(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive:false });
    cv.addEventListener('touchend', clear);
  }

  /* ======================= BOOT ======================= */
  function boot(){
    buildGate();
    mountArchViz();
    mountEvidence();
    mountOutlookExtras();
    mountCrosshair();

    var det = document.querySelector('#outlook [data-o="det"]');
    if(det) new MutationObserver(function(){ mountOutlookExtras(); }).observe(det, { childList:true });

    var tbl = document.getElementById('compareTable');
    if(tbl) new MutationObserver(function(){ setTimeout(mountCompareViz, 30); }).observe(tbl, { childList:true, subtree:true });

    var lab = document.getElementById('chartlab');
    if(lab) new MutationObserver(function(){ mountCrosshair(); }).observe(lab, { childList:true, subtree:true });

    new MutationObserver(function(){
      for(var i = 0; i < repaint.length; i++){ try { repaint[i](); } catch(e){} }
      mountEvidence();
      setTimeout(function(){ mountOutlookExtras(); mountCompareViz(); }, 40);
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 30); });
  else setTimeout(boot, 30);
})();
