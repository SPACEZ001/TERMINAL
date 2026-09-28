
(function(){
  'use strict';
  if (window.__SPZ_HERO) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  var clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
  var TAU = Math.PI * 2;

  var reduced = false;
  try {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mq.matches;
    mq.addEventListener ? mq.addEventListener('change', function(e){ reduced = e.matches; })
                        : mq.addListener(function(e){ reduced = e.matches; });
  } catch(e){}

  /* ---------------------------------------------------------------
     the five faces, and what each one is actually about
     --------------------------------------------------------------- */
  var PANELS = [
    { k:'radar', hue:'#ff3b4e', go:'regime',
      eb:{en:'Turning Point Radar',th:'เรดาร์จุดเปลี่ยนทิศ'},
      h:{en:'Know before\nthe price does.',th:'รู้ก่อน\nที่ราคาจะบอก'},
      sub:{en:'Eleven readings that historically move before price does — breadth, credit, leadership, the yield curve — checked every thirty minutes and translated into plain language.',
           th:'ตัวชี้วัด 11 ตัวที่ในอดีตขยับก่อนราคา — ความกว้างของตลาด ตลาดหุ้นกู้ ผู้นำตลาด เส้นผลตอบแทน — เช็คทุก 30 นาที แล้วแปลเป็นภาษาคน'},
      li:[{en:'11 early-warning gauges',th:'มาตรวัดเตือนล่วงหน้า 11 ตัว'},
          {en:'Combinations, not single dials',th:'ดูเป็นชุด ไม่ใช่ทีละเข็ม'},
          {en:'A banner when the board lights up',th:'มีแบนเนอร์เตือนเมื่อกระดานติดไฟ'}],
      cta:{en:'Open the radar',th:'เปิดเรดาร์'} },

    { k:'price', hue:'#ccff00', go:'stock',
      eb:{en:'One Stock, One Page',th:'หนึ่งหุ้น หนึ่งหน้า'},
      h:{en:'Compared to\nwhat, exactly?',th:'ถูกหรือแพง\nเทียบกับอะไร'},
      sub:{en:'P/E 27 means nothing on its own. Every figure sits beside the companies it should be compared with, over the real price history, with one sentence saying what it all adds up to.',
           th:'P/E 27 เฉยๆ ไม่ได้แปลว่าอะไร ทุกตัวเลขถูกวางข้างบริษัทที่ควรเอามาเทียบ บนราคาจริงย้อนหลัง พร้อมหนึ่งประโยคที่สรุปว่ามันแปลว่าอะไร'},
      li:[{en:'Real 2-year price history',th:'ราคาจริงย้อนหลัง 2 ปี'},
          {en:'Every metric ranked against peers',th:'ทุกตัวเลขเทียบกับเพื่อนในกลุ่ม'},
          {en:'81 companies, US and Thai',th:'81 บริษัท ทั้งไทยและอเมริกา'}],
      cta:{en:'Look up a stock',th:'เปิดดูหุ้นรายตัว'} },

    { k:'flow', hue:'#7CFFB2', go:'flow',
      eb:{en:'Capital Flow',th:'การไหลของเงินทุน'},
      h:{en:'Money leaves\nbefore the news.',th:'เงินออกก่อน\nข่าวเสมอ'},
      sub:{en:'Which sectors, countries and asset classes are being bought and which are being left — ranked, dated, and refreshed on its own without you pressing anything.',
           th:'กลุ่มไหน ประเทศไหน สินทรัพย์ไหน กำลังถูกซื้อ และตรงไหนกำลังถูกทิ้ง — จัดอันดับ ลงวันที่ และอัปเดตเองโดยไม่ต้องกดอะไร'},
      li:[{en:'Sectors, countries, asset classes',th:'กลุ่มธุรกิจ ประเทศ สินทรัพย์'},
          {en:'Where the most and least went',th:'เข้ามากสุด ออกมากสุด'},
          {en:'Updates itself every 30 minutes',th:'อัปเดตเองทุก 30 นาที'}],
      cta:{en:'Follow the money',th:'ตามรอยเงิน'} },

    { k:'proof', hue:'#5ec8ff', go:'proof',
      eb:{en:'Proof Lab',th:'ห้องพิสูจน์'},
      h:{en:'Untested is\njust decoration.',th:'ไม่เคยทดสอบ\nก็แค่ของประดับ'},
      sub:{en:'Every signal on this site re-run over twenty-five years of history and graded on whether the market actually behaved differently afterwards. Most of them failed. It says so.',
           th:'ทุกสัญญาณบนเว็บนี้ถูกรันย้อนหลัง 25 ปี แล้วให้เกรดว่าตลาดทำอะไรต่างจริงไหมหลังจากนั้น ส่วนใหญ่สอบตก และหน้านั้นก็บอกตรงๆ'},
      li:[{en:'25 years, graded A to F',th:'ย้อนหลัง 25 ปี ให้เกรด A ถึง F'},
          {en:'Run it yourself in the browser',th:'กดรันเองได้ในเบราว์เซอร์'},
          {en:'Corrected for testing many things',th:'ปรับค่าตามจำนวนที่ทดสอบแล้ว'}],
      cta:{en:'See what failed',th:'ดูว่าตัวไหนสอบตก'} },

    { k:'learn', hue:'#ffb020', go:'guided',
      eb:{en:'Start Here',th:'เริ่มต้นที่นี่'},
      h:{en:'Built for\nsomeone new.',th:'ทำมาเพื่อ\nคนเพิ่งเริ่ม'},
      sub:{en:'Four ways to own a company, fourteen numbers decoded, thirteen chart signals and a guided route through all of it in the order that actually works.',
           th:'สี่วิธีในการเป็นเจ้าของบริษัท ถอดรหัส 14 ตัวเลข สัญญาณกราฟ 13 แบบ และเส้นทางที่พาไปทีละขั้นในลำดับที่ใช้ได้จริง'},
      li:[{en:'4 archetypes · 14 metrics',th:'4 ประเภทหุ้น · 14 ตัวเลข'},
          {en:'Every term in Thai and English',th:'ทุกคำศัพท์มีทั้งไทยและอังกฤษ'},
          {en:'Educational only — never advice',th:'เพื่อการศึกษา ไม่ใช่คำแนะนำลงทุน'}],
      cta:{en:'Start the guide',th:'เริ่มไกด์'} }
  ];

  var HINT = {en:'scroll',th:'เลื่อนลง'};

  /* ---------------------------------------------------------------
     geometry
     --------------------------------------------------------------- */
  var VB = 1000, C = 500;
  var R_RING = 470, R_TRACK = 470;
  var R_TICK_IN = 398, R_TICK_LEN = 34, N_TICKS = 132;
  var R_BEZEL = 384, R_FACE = 366;

  function pol(r, deg){
    var a = (deg - 90) * Math.PI / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  }
  function arc(r, a0, a1){
    var p0 = pol(r, a0), p1 = pol(r, a1);
    var large = (a1 - a0) % 360 > 180 ? 1 : 0;
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
           ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }
  function svgEl(tag, at){
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]);
    return e;
  }

  /* ---------------------------------------------------------------
     live data, if it has arrived
     --------------------------------------------------------------- */
  function snap(){
    try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); }
    catch(e){ return null; }
  }
  function gaugeStates(){
    try {
      var R = window.__SPZ_REGIME;
      if (R && R.score) {
        var s = R.score();
        if (s && s.states && s.states.length) return s.states;
      }
    } catch(e){}
    return null;
  }
  function backtestGrades(){
    try {
      var d = window.__SPZ_REGIME && window.__SPZ_REGIME.raw && window.__SPZ_REGIME.raw();
      if (!d) return null;
      return (d.gauges || []).concat(d.combos || []).map(function(x){ return x.grade; });
    } catch(e){ return null; }
  }
  /* the biggest US name that shipped a price series */
  function headlineSeries(){
    var s = snap();
    if (!s || !s.stocks || !s.charts) return null;
    var best = null, bestCap = -1;
    for (var k in s.stocks) {
      var r = s.stocks[k];
      if (!r.c || !r.cal) continue;
      var cap = isNum(r.mcap) ? r.mcap : 0;
      if (cap > bestCap) { bestCap = cap; best = r; }
    }
    if (!best) return null;
    var raw = best.c.split(',');
    var v = [];
    for (var i = Math.max(0, raw.length - 260); i < raw.length; i++) {
      if (raw[i] === '') continue;
      var n = parseFloat(raw[i]);
      if (n > 0) v.push(n);
    }
    return v.length > 40 ? { v:v, name:best.name, ccy:best.ccy } : null;
  }
  function sectorFlows(){
    var s = snap();
    var rows = (s && s.flows && s.flows.sector) || [];
    return rows.filter(function(r){ return isNum(r.m1); });
  }

  /* ---------------------------------------------------------------
     build
     --------------------------------------------------------------- */
  var root, sticky, copyHost, instHost, scrubHost, hintHost, svg;
  var G = {};                        /* the mutable pieces of the drawing */
  var state = { i:0, t:0, p:0, on:false, vis:false, raf:0, t0:0 };

  function buildSVG(){
    svg = svgEl('svg', { viewBox:'0 0 ' + VB + ' ' + VB, 'aria-hidden':'true' });

    var defs = svgEl('defs', {});
    var sweep = svgEl('radialGradient', { id:'hvSweep' });
    sweep.appendChild(svgEl('stop', { offset:'40%', 'stop-color':'#ffffff', 'stop-opacity':'0' }));
    sweep.appendChild(svgEl('stop', { offset:'100%', 'stop-color':'#ffffff', 'stop-opacity':'.07' }));
    defs.appendChild(sweep);
    var fade = svgEl('linearGradient', { id:'hvFade', x1:'0', y1:'0', x2:'0', y2:'1' });
    fade.appendChild(svgEl('stop', { offset:'0%', 'stop-color':'currentColor', 'stop-opacity':'.30' }));
    fade.appendChild(svgEl('stop', { offset:'100%', 'stop-color':'currentColor', 'stop-opacity':'0' }));
    defs.appendChild(fade);
    svg.appendChild(defs);

    /* bezel rings */
    [R_RING + 14, R_BEZEL, R_FACE].forEach(function(r, i){
      svg.appendChild(svgEl('circle', { cx:C, cy:C, r:r, fill:'none',
        stroke:'rgba(255,255,255,' + (i === 0 ? .07 : .05) + ')', 'stroke-width':1 }));
    });
    svg.appendChild(svgEl('circle', { cx:C, cy:C, r:R_FACE, fill:'rgba(255,255,255,.012)' }));

    /* the faint dot matrix inside the face */
    var dots = svgEl('g', { opacity:'.5' });
    for (var y = -300; y <= 300; y += 40) {
      for (var x = -300; x <= 300; x += 40) {
        if (x * x + y * y > 300 * 300) continue;
        dots.appendChild(svgEl('circle', { cx:C + x, cy:C + y, r:1.4, fill:'rgba(255,255,255,.10)' }));
      }
    }
    svg.appendChild(dots);

    /* the slow sweep — a band hugging the rim, not a pie slice */
    G.sweep = svgEl('g', {});
    G.sweep.appendChild(svgEl('path', {
      d:arc(R_BEZEL - 6, -54, 4), fill:'none', stroke:'rgba(255,255,255,.055)',
      'stroke-width':64, 'stroke-linecap':'round' }));
    G.sweep.appendChild(svgEl('path', {
      d:arc(R_BEZEL - 6, -30, 2), fill:'none', stroke:'rgba(255,255,255,.045)',
      'stroke-width':64, 'stroke-linecap':'round' }));
    svg.appendChild(G.sweep);

    /* the outer ring: one arc per section, so the ring is the site map */
    G.segTrack = []; G.segFill = [];
    var span = 360 / PANELS.length, gap = 7;
    PANELS.forEach(function(p, i){
      var a0 = i * span + gap / 2, a1 = (i + 1) * span - gap / 2;
      var t = svgEl('path', { d:arc(R_TRACK, a0, a1), fill:'none', stroke:p.hue,
        'stroke-width':7, 'stroke-linecap':'round', opacity:'.3' });
      var f = svgEl('path', { d:arc(R_TRACK, a0, a1), fill:'none', stroke:p.hue,
        'stroke-width':7, 'stroke-linecap':'round', opacity:'0' });
      f.__a0 = a0; f.__a1 = a1;
      var len = (a1 - a0) / 360 * TAU * R_TRACK;
      f.setAttribute('stroke-dasharray', len.toFixed(1));
      f.setAttribute('stroke-dashoffset', len.toFixed(1));
      f.__len = len;
      svg.appendChild(t); svg.appendChild(f);
      G.segTrack.push(t); G.segFill.push(f);
    });

    /* the tick ring */
    G.ticks = [];
    var tg = svgEl('g', {});
    for (var i2 = 0; i2 < N_TICKS; i2++) {
      var deg = i2 / N_TICKS * 360;
      var a = pol(R_TICK_IN, deg), b = pol(R_TICK_IN + 12, deg);
      var ln = svgEl('line', { x1:a[0].toFixed(2), y1:a[1].toFixed(2),
        x2:b[0].toFixed(2), y2:b[1].toFixed(2), stroke:'#cf0', 'stroke-width':2.4,
        opacity:'.5', 'stroke-linecap':'round' });
      ln.__deg = deg;
      tg.appendChild(ln);
      G.ticks.push(ln);
    }
    svg.appendChild(tg);

    /* the faces */
    G.faces = {};
    PANELS.forEach(function(p){
      var g = svgEl('g', { class:'hv-face' });
      g.setAttribute('data-face', p.k);
      svg.appendChild(g);
      G.faces[p.k] = g;
    });

    buildRadarFace(G.faces.radar);
    buildPriceFace(G.faces.price);
    buildFlowFace(G.faces.flow);
    buildProofFace(G.faces.proof);
    buildLearnFace(G.faces.learn);

    instHost.appendChild(svg);
  }

  /* ---- face 1: the eleven gauges as blips on a scope ---- */
  function buildRadarFace(g){
    [110, 185, 260, 320].forEach(function(r){
      g.appendChild(svgEl('circle', { cx:C, cy:C, r:r, fill:'none',
        stroke:'rgba(255,59,78,.16)', 'stroke-width':1 }));
    });
    g.appendChild(svgEl('line', { x1:C - 320, y1:C, x2:C + 320, y2:C,
      stroke:'rgba(255,59,78,.14)', 'stroke-width':1 }));
    g.appendChild(svgEl('line', { x1:C, y1:C - 320, x2:C, y2:C + 320,
      stroke:'rgba(255,59,78,.14)', 'stroke-width':1 }));
    G.radarSweep = svgEl('line', { x1:C, y1:C, x2:C, y2:C - 320,
      stroke:'#ff3b4e', 'stroke-width':2, opacity:'.55' });
    g.appendChild(G.radarSweep);
    G.blips = [];
    for (var i = 0; i < 11; i++) {
      var b = svgEl('circle', { cx:C, cy:C, r:7, fill:'#ff3b4e', opacity:'.85' });
      g.appendChild(b);
      G.blips.push(b);
    }
  }

  /* ---- face 2: the real price line of the biggest name on file ---- */
  function buildPriceFace(g){
    G.priceArea = svgEl('path', { d:'', fill:'url(#hvFade)', color:'#ccff00', opacity:'.9' });
    G.priceLine = svgEl('path', { d:'', fill:'none', stroke:'#ccff00', 'stroke-width':3,
      'stroke-linejoin':'round', 'stroke-linecap':'round' });
    G.priceMa = svgEl('path', { d:'', fill:'none', stroke:'#ccff00', 'stroke-width':1.6,
      opacity:'.35' });
    G.priceDot = svgEl('circle', { cx:C, cy:C, r:6, fill:'#ccff00', opacity:'0' });
    g.appendChild(G.priceArea); g.appendChild(G.priceMa);
    g.appendChild(G.priceLine); g.appendChild(G.priceDot);
    G.priceLabel = svgEl('text', { x:C, y:C + 250, fill:'rgba(255,255,255,.45)',
      'font-size':'22', 'font-family':'monospace', 'text-anchor':'middle', 'letter-spacing':'3' });
    /* intentionally not appended: the face shows the chart only, no ticker/name label */
  }

  /* ---- face 3: sector flow as bars out of the centre ---- */
  function buildFlowFace(g){
    g.appendChild(svgEl('circle', { cx:C, cy:C, r:96, fill:'none',
      stroke:'rgba(124,255,178,.22)', 'stroke-width':1 }));
    G.flowBars = [];
    for (var i = 0; i < 14; i++) {
      var b = svgEl('path', { d:'', fill:'none', stroke:'#7CFFB2',
        'stroke-width':13, 'stroke-linecap':'round', opacity:'.85' });
      g.appendChild(b);
      G.flowBars.push(b);
    }
    G.flowDots = [];
    for (var j = 0; j < 26; j++) {
      var d = svgEl('circle', { cx:C, cy:C, r:3, fill:'#7CFFB2', opacity:'0' });
      g.appendChild(d);
      G.flowDots.push(d);
    }
  }

  /* ---- face 4: every graded signal as one dot ---- */
  function buildProofFace(g){
    G.proofDots = [];
    var n = 7, step = 78, off = (n - 1) / 2 * step;
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        var cx = C - off + x * step, cy = C - off + y * step;
        if ((cx - C) * (cx - C) + (cy - C) * (cy - C) > 310 * 310) continue;
        var d = svgEl('circle', { cx:cx, cy:cy, r:12, fill:'#5ec8ff', opacity:'.75' });
        d.__i = G.proofDots.length;
        g.appendChild(d);
        G.proofDots.push(d);
      }
    }
  }

  /* ---- face 5: what the site teaches, as a small system ---- */
  function buildLearnFace(g){
    [130, 215, 300].forEach(function(r){
      g.appendChild(svgEl('circle', { cx:C, cy:C, r:r, fill:'none',
        stroke:'rgba(255,176,32,.18)', 'stroke-width':1 }));
    });
    g.appendChild(svgEl('circle', { cx:C, cy:C, r:34, fill:'none',
      stroke:'rgba(255,176,32,.55)', 'stroke-width':2 }));
    G.orbits = [];
    var counts = [4, 6, 8], radii = [130, 215, 300], sizes = [13, 9, 6];
    for (var o = 0; o < 3; o++) {
      for (var i = 0; i < counts[o]; i++) {
        var d = svgEl('circle', { cx:C, cy:C, r:sizes[o], fill:'#ffb020',
          opacity:(0.9 - o * 0.22).toFixed(2) });
        d.__r = radii[o];
        d.__deg = i / counts[o] * 360;
        d.__sp = (o % 2 ? -1 : 1) * (10 - o * 2.5);
        g.appendChild(d);
        G.orbits.push(d);
      }
    }
  }

  /* ---------------------------------------------------------------
     copy + scrubber
     --------------------------------------------------------------- */
  function paintCopy(){
    copyHost.innerHTML = PANELS.map(function(p, i){
      return '<div class="hv-panel' + (i === state.i ? ' on' : '') + '" data-hp="' + i +
        '" style="--hv-hue:' + p.hue + '">' +
        '<div class="hv-eb"><i></i>' + esc(tx(p.eb)) + '</div>' +
        '<h1 class="hv-h">' + esc(tx(p.h)).replace(/\n/g, '<br>') + '</h1>' +
        '<p class="hv-sub">' + esc(tx(p.sub)) + '</p>' +
        '<div class="hv-rule"></div>' +
        '<div class="hv-list">' + p.li.map(function(l){
          return '<span class="hv-li"><b>&rarr;</b>' + esc(tx(l)) + '</span>';
        }).join('') + '</div>' +
        '<button type="button" class="hv-go" data-hvgo="' + p.go + '">' +
          esc(tx(p.cta)) + ' &rarr;</button>' +
      '</div>';
    }).join('');

    copyHost.querySelectorAll('[data-hvgo]').forEach(function(b){
      b.addEventListener('click', function(){
        var id = b.getAttribute('data-hvgo');
        var link = document.querySelector('[data-route-to="' + id + '"]');
        if (link) link.click(); else location.hash = '#/' + id;
      });
    });

    scrubHost.innerHTML = '';
    for (var i = 0; i < 72; i++) scrubHost.appendChild(document.createElement('i'));
    scrubHost.querySelectorAll('i').forEach(function(t){ t.className = 'hv-tick'; });
    hintHost.innerHTML = '<span>&darr;</span>' + esc(tx(HINT));
    paintScrub();
  }

  function paintScrub(){
    var ticks = scrubHost.querySelectorAll('.hv-tick');
    var at = Math.round(state.p * (ticks.length - 1));
    for (var i = 0; i < ticks.length; i++) {
      ticks[i].className = 'hv-tick' + (i === at ? ' now' : i < at ? ' past' : '');
    }
    var p = PANELS[clamp(state.i, 0, PANELS.length - 1)];
    scrubHost.style.setProperty('--hv-hue', p.hue);
    hintHost.style.opacity = state.p > 0.03 ? '0' : '1';
  }

  function showPanel(i){
    if (i === state.i) return;
    state.i = i;
    copyHost.querySelectorAll('.hv-panel').forEach(function(el, n){
      el.classList.toggle('on', n === i);
    });
    PANELS.forEach(function(p, n){
      G.faces[p.k].classList.toggle('on', n === i);
    });
  }

  /* ---------------------------------------------------------------
     per-frame drawing
     --------------------------------------------------------------- */
  var cache = { series:null, seriesAt:0, flows:null, flowsAt:0, grades:null, gradesAt:0 };
  function every(key, ms, fn){
    var now = Date.now();
    if (cache[key] === null || now - cache[key + 'At'] > ms) {
      cache[key] = fn();
      cache[key + 'At'] = now;
    }
    return cache[key];
  }

  function drawRing(){
    var hue = PANELS[clamp(state.i, 0, PANELS.length - 1)].hue;
    /* the ring is the site map: every screen keeps its colour, the one you
       are standing in burns brighter and fills as you move through it */
    G.segTrack.forEach(function(t, i){
      t.setAttribute('opacity', i === state.i ? '.5' : '.24');
    });
    G.segFill.forEach(function(f, i){
      var done = i < state.i ? 1 : i > state.i ? 0 : state.t;
      f.setAttribute('opacity', done > 0 ? '1' : '0');
      f.setAttribute('stroke-dashoffset', (f.__len * (1 - done)).toFixed(1));
    });
    return hue;
  }

  function drawTicks(now, hue){
    var amp = faceAmp();
    for (var i = 0; i < G.ticks.length; i++) {
      var ln = G.ticks[i];
      var a = amp(i / G.ticks.length);
      var wave = reduced ? 0 : Math.sin(i * 0.22 - now * 0.0016) * 0.28 + 0.28;
      var len = 8 + (a * 0.78 + wave * 0.22) * R_TICK_LEN;
      var p = pol(R_TICK_IN + len, ln.__deg);
      ln.setAttribute('x2', p[0].toFixed(2));
      ln.setAttribute('y2', p[1].toFixed(2));
      ln.setAttribute('stroke', hue);
      ln.setAttribute('opacity', (0.25 + a * 0.6).toFixed(2));
    }
  }

  /* each face lends the tick ring its own silhouette */
  function faceAmp(){
    var k = PANELS[state.i].k;
    if (k === 'radar') {
      var st = gaugeStates();
      return function(u){
        if (!st || !st.length) return 0.35;
        var s = st[Math.floor(u * st.length) % st.length];
        return s === 'alert' ? 1 : s === 'warn' ? 0.6 : s === 'na' ? 0.15 : 0.3;
      };
    }
    if (k === 'price') {
      var ser = every('series', 60000, headlineSeries);
      return function(u){
        if (!ser) return 0.4;
        var v = ser.v, i = Math.floor(u * (v.length - 1));
        var lo = ser.lo, hi = ser.hi;
        if (lo === undefined) {
          lo = Math.min.apply(null, v); hi = Math.max.apply(null, v);
          ser.lo = lo; ser.hi = hi;
        }
        return hi > lo ? (v[i] - lo) / (hi - lo) : 0.5;
      };
    }
    if (k === 'flow') {
      var rows = every('flows', 60000, sectorFlows);
      return function(u){
        if (!rows || !rows.length) return 0.4;
        var r = rows[Math.floor(u * rows.length) % rows.length];
        return clamp(Math.abs(r.m1) / 8, 0.12, 1);
      };
    }
    if (k === 'proof') {
      var gr = every('grades', 60000, backtestGrades);
      return function(u){
        if (!gr || !gr.length) return 0.35;
        var g = gr[Math.floor(u * gr.length) % gr.length];
        return g === 'A' || g === 'B' ? 1 : g === 'C' ? 0.6 : g === 'n/a' ? 0.15 : 0.32;
      };
    }
    return function(u){ return 0.3 + 0.45 * Math.abs(Math.sin(u * Math.PI * 3)); };
  }

  function drawRadar(now){
    var st = gaugeStates();
    var deg = reduced ? 40 : (now * 0.045) % 360;
    var p = pol(320, deg);
    G.radarSweep.setAttribute('x2', p[0].toFixed(2));
    G.radarSweep.setAttribute('y2', p[1].toFixed(2));
    for (var i = 0; i < G.blips.length; i++) {
      var s = st && st[i] ? st[i] : 'na';
      var rr = s === 'alert' ? 300 : s === 'warn' ? 215 : s === 'na' ? 120 : 155;
      var bd = i / G.blips.length * 360 + 16;
      var b = pol(rr, bd);
      var near = Math.abs(((deg - bd) % 360 + 360) % 360);
      var lit = near < 60 ? 1 - near / 60 : 0;
      G.blips[i].setAttribute('cx', b[0].toFixed(2));
      G.blips[i].setAttribute('cy', b[1].toFixed(2));
      G.blips[i].setAttribute('r', (s === 'alert' ? 9 : 6) + lit * 5);
      G.blips[i].setAttribute('opacity', (0.28 + lit * 0.72).toFixed(2));
      G.blips[i].setAttribute('fill', s === 'alert' ? '#ff3b4e' : s === 'warn' ? '#ffb020' : '#7CFFB2');
    }
  }

  function drawPrice(){
    var ser = every('series', 60000, headlineSeries);
    if (!ser) {
      G.priceLabel.textContent = '';
      return;
    }
    var v = ser.v, n = v.length;
    var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
    var span = (hi - lo) || 1;
    var W = 600, H = 300, x0 = C - W / 2, y0 = C - H / 2;
    var X = function(i){ return x0 + i / (n - 1) * W; };
    var Y = function(p){ return y0 + (hi - p) / span * H; };
    var upto = reduced ? n : Math.max(2, Math.round(clamp(state.t * 1.35, 0, 1) * n));
    var d = '', ma = '', run = 0, first = true;
    for (var i = 0; i < upto; i++) {
      d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v[i]).toFixed(1);
      run += v[i];
      if (i >= 50) run -= v[i - 50];
      if (i >= 49) {
        ma += (first ? 'M' : 'L') + X(i).toFixed(1) + ' ' + Y(run / 50).toFixed(1);
        first = false;
      }
    }
    G.priceLine.setAttribute('d', d);
    G.priceMa.setAttribute('d', ma);
    G.priceArea.setAttribute('d', d ? d + 'L' + X(upto - 1).toFixed(1) + ' ' + (y0 + H) +
      'L' + X(0).toFixed(1) + ' ' + (y0 + H) + 'Z' : '');
    G.priceDot.setAttribute('cx', X(upto - 1).toFixed(1));
    G.priceDot.setAttribute('cy', Y(v[upto - 1]).toFixed(1));
    G.priceDot.setAttribute('opacity', '1');
    G.priceLabel.textContent = String(ser.name || '').toUpperCase().slice(0, 26);
  }

  function drawFlow(now){
    var rows = every('flows', 60000, sectorFlows);
    var spin = reduced ? 0 : (now * 0.008) % 360;
    var max = 1;
    (rows || []).forEach(function(r){ max = Math.max(max, Math.abs(r.m1)); });
    for (var i = 0; i < G.flowBars.length; i++) {
      var r = rows && rows[i];
      var bar = G.flowBars[i];
      if (!r) { bar.setAttribute('d', ''); continue; }
      var deg = i / G.flowBars.length * 360 + spin;
      var len = clamp(Math.abs(r.m1) / max, 0.08, 1) * 210;
      var up = r.m1 >= 0;
      var a = pol(96, deg), b = pol(96 + len, deg);
      bar.setAttribute('d', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) +
                            'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1));
      bar.setAttribute('stroke', up ? '#7CFFB2' : '#ff3b4e');
      bar.setAttribute('opacity', (0.35 + 0.55 * (len / 210)).toFixed(2));
    }
    for (var j = 0; j < G.flowDots.length; j++) {
      var t = ((now * 0.00022) + j / G.flowDots.length) % 1;
      var dd = j / G.flowDots.length * 360 - spin * 1.6;
      var pr = 96 + t * 220;
      var pp = pol(pr, dd);
      G.flowDots[j].setAttribute('cx', pp[0].toFixed(1));
      G.flowDots[j].setAttribute('cy', pp[1].toFixed(1));
      G.flowDots[j].setAttribute('opacity', (Math.sin(t * Math.PI) * 0.5).toFixed(2));
    }
  }

  var GRADE_COLOR = { A:'#7CFFB2', B:'#7CFFB2', C:'#ffb020', D:'#ff3b4e', F:'#ff3b4e' };
  function drawProof(now){
    var gr = every('grades', 60000, backtestGrades);
    for (var i = 0; i < G.proofDots.length; i++) {
      var d = G.proofDots[i];
      var g = gr && gr.length ? gr[i % gr.length] : null;
      var col = g ? (GRADE_COLOR[g] || '#54594f') : '#5ec8ff';
      var wave = reduced ? 1 : 0.68 + 0.32 * Math.sin(now * 0.0022 - i * 0.28);
      d.setAttribute('r', (7 + 9 * wave).toFixed(1));
      d.setAttribute('fill', col);
      d.setAttribute('opacity', (0.35 + 0.5 * wave).toFixed(2));
    }
  }

  function drawLearn(now){
    for (var i = 0; i < G.orbits.length; i++) {
      var o = G.orbits[i];
      var deg = o.__deg + (reduced ? 0 : now * 0.001 * o.__sp);
      var p = pol(o.__r, deg);
      o.setAttribute('cx', p[0].toFixed(1));
      o.setAttribute('cy', p[1].toFixed(1));
    }
  }

  function frame(now){
    state.raf = 0;
    if (!state.on) return;
    var hue = drawRing();
    drawTicks(now, hue);
    if (!reduced) G.sweep.setAttribute('transform',
      'rotate(' + ((now * 0.012) % 360).toFixed(2) + ' ' + C + ' ' + C + ')');
    var k = PANELS[state.i].k;
    if (k === 'radar') drawRadar(now);
    else if (k === 'price') drawPrice();
    else if (k === 'flow') drawFlow(now);
    else if (k === 'proof') drawProof(now);
    else drawLearn(now);
    if (state.on) state.raf = requestAnimationFrame(frame);
  }

  function kick(){
    if (!state.raf && state.on) state.raf = requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     scroll
     --------------------------------------------------------------- */
  function measure(){
    var top = document.querySelector('.top-fixed');
    var h = top ? Math.round(top.getBoundingClientRect().height) : 150;
    root.style.setProperty('--hv-top', h + 'px');
    root.style.setProperty('--hv-panels', PANELS.length);
  }

  function onScroll(){
    if (!root) return;
    var box = root.getBoundingClientRect();
    var stickyH = sticky ? sticky.offsetHeight : window.innerHeight;
    var travel = Math.max(1, root.offsetHeight - stickyH);
    var p = clamp(-box.top / travel, 0, 1);
    state.p = p;
    var raw = p * PANELS.length;
    var i = clamp(Math.floor(raw), 0, PANELS.length - 1);
    state.t = clamp(raw - i, 0, 1);
    showPanel(i);
    paintScrub();
    kick();
  }

  /* ---------------------------------------------------------------
     mount
     --------------------------------------------------------------- */
  function build(){
    root = document.querySelector('.hero.hv[data-hv="root"]');
    if (!root) return false;
    sticky = root.querySelector('[data-hv="sticky"]');
    copyHost = root.querySelector('[data-hv="copy"]');
    instHost = root.querySelector('[data-hv="inst"]');
    scrubHost = root.querySelector('[data-hv="scrub"]');
    hintHost = root.querySelector('[data-hv="hint"]');
    if (!sticky || !copyHost || !instHost) return false;

    measure();
    buildSVG();
    paintCopy();
    PANELS.forEach(function(p, n){ G.faces[p.k].classList.toggle('on', n === 0); });
    onScroll();
    return true;
  }

  function boot(){
    if (build()) { wireUp(); return; }
    /* the shell was not ready yet — keep trying, but wire up when it lands
       rather than returning and leaving the hero with no scroll listener */
    var tries = 0;
    var iv = setInterval(function(){
      if (build()) { clearInterval(iv); wireUp(); }
      else if (++tries > 40) clearInterval(iv);
    }, 300);
  }

  function wireUp(){
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', function(){
      clearTimeout(wireUp.t);
      wireUp.t = setTimeout(function(){ measure(); onScroll(); }, 160);
    });

    /* The loop runs only while the dial is on screen AND the tab is visible.
       These are two independent facts, so they are stored separately: folding
       them into one flag meant a page opened in a background tab latched off
       and never started, because coming back could only AND with false. */
    function sync(){
      state.on = state.vis && !document.hidden;
      if (state.on) kick();
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function(es){
        state.vis = es[0].isIntersecting;
        sync();
      }, { threshold:0 }).observe(sticky);
    } else {
      state.vis = true;
      sync();
    }
    document.addEventListener('visibilitychange', sync);

    /* paintCopy already marks the active panel from state.i, so a language
       switch is just a re-render — no need to fake a state change first */
    new MutationObserver(function(){
      paintCopy();
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    /* the header grows and shrinks (ticker, live bar, alert banner) */
    var top = document.querySelector('.top-fixed');
    if (top && window.ResizeObserver) {
      new ResizeObserver(function(){ measure(); onScroll(); }).observe(top);
    }

    /* real data can land after the first paint — redraw when it does */
    document.addEventListener('spz:snapshot', function(){
      cache.series = null; cache.flows = null;
      kick();
    });
    setTimeout(function(){ cache.grades = null; kick(); }, 6000);
  }

  window.__SPZ_HERO = { panels:PANELS, state:state, scroll:onScroll,
                        series:headlineSeries, faces:function(){ return G.faces; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 400); });
  } else {
    setTimeout(boot, 400);
  }
})();
