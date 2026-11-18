/* ============================================================================
   SPACEZ TERMINAL -- Stock Universe (#/universe) · v2 (2026-11-19)
   Redrawn in the owner's "Second Brain" style: a black-and-white star map
   around an Interstellar-type black hole (bright horizontal accretion disk,
   lensed halo, photon ring, lens flare), sectors as labelled star clusters
   with counts, thin constellation lines between stocks whose prices move
   together (correlation of daily returns), smoky grey clouds, big faint
   orbit rings with comets, small pill buttons on top, one small toolbar at
   the bottom (− + ↺ ⏸ ⛶) and a "Stocks" side panel with search, a picker
   and a card for the chosen stock or sector.
   Interaction: drag = turn, wheel / pinch = zoom, click a sector name or a
   star = fly into that sector, click a star = its card + its closest
   "moves-together" stocks lit up. Esc / Overview = back.
   Plain canvas 2D with a small perspective projection; the black hole is
   pre-rendered into a cached sprite, so a frame stays cheap. The loop only
   runs while the page is on screen.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_UNIVERSE) return;
  window.__SPZ_UNIVERSE = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function I(en, th){ return { en:en, th:th }; }

  var U = {
    h:I('Stock universe', 'จักรวาลหุ้น'),
    d:I('Every stock as a star around a black hole: sectors are clusters, lines join stocks that move together.', 'หุ้นทุกตัวเป็นดาวรอบหลุมดำ กลุ่มดาวคือกลุ่มอุตสาหกรรม เส้นเชื่อมหุ้นที่ราคาขึ้นลงคล้ายกัน'),
    sub:I('SPACEZ TERMINAL', 'SPACEZ TERMINAL'),
    home:I('Overview', 'ภาพรวม'), core:I('Market core', 'ใจกลางตลาด'),
    pages:I('Stocks', 'รายชื่อหุ้น'), close:I('Close', 'ปิด'),
    search:I('Search stocks — e.g. NVDA, PTT', 'ค้นหาหุ้น — เช่น NVDA, PTT'),
    pick:I('— choose a stock —', '— เลือกหุ้น —'),
    all:I('All', 'ทั้งหมด'), us:I('US', 'สหรัฐฯ'), th:I('Thailand', 'ไทย'),
    mono:I('White stars', 'ดาวสีขาว'), mom:I('Colour by 1M move', 'สีตาม 1 เดือน'),
    nStocks:I('stocks', 'หุ้น'), stars:I('stars', 'ดวง'),
    zoomOut:I('Zoom out', 'ซูมออก'), zoomIn:I('Zoom in', 'ซูมเข้า'), reset:I('Reset view', 'มุมเริ่มต้น'),
    pause:I('Pause', 'หยุดหมุน'), play:I('Play', 'หมุนต่อ'), full:I('Full screen', 'เต็มจอ'), exitFull:I('Exit full screen', 'ออกจากเต็มจอ'),
    legend:I('star = a stock · cluster = a sector · line = prices move together · bigger star = bigger company', 'ดาว = หุ้น 1 ตัว · กลุ่มดาว = กลุ่มอุตสาหกรรม · เส้น = ราคาขึ้นลงคล้ายกัน · ดาวใหญ่ = บริษัทใหญ่'),
    loading:I('Loading market data…', 'กำลังโหลดข้อมูลตลาด…'),
    badgeStock:I('Stock', 'หุ้น'), badgeSector:I('Sector', 'กลุ่มอุตสาหกรรม'), badgeHow:I('How to read', 'วิธีอ่าน'),
    updated:I('Updated', 'อัปเดต'), wave:I('Count its waves ↗', 'นับคลื่น ↗'), focus:I('Show in its sector', 'ดูในกลุ่ม'),
    summary:I('Summary', 'สรุป'), facts:I('Key numbers', 'ตัวเลขสำคัญ'), together:I('Moves together with', 'ราคาเคลื่อนไหวคล้ายกับ'),
    chart:I('Price, last 6 months', 'ราคา 6 เดือนล่าสุด'), ma50:I('50-day avg', 'เส้นเฉลี่ย 50 วัน'),
    r52:I('52-week range', 'ช่วงราคา 52 สัปดาห์'),
    gain:I('Up most in 1 month', 'ขึ้นแรงสุดใน 1 เดือน'), lose:I('Down most in 1 month', 'ลงแรงสุดใน 1 เดือน'), big:I('Largest companies', 'บริษัทใหญ่ที่สุด'),
    sectors:I('Sectors', 'กลุ่มอุตสาหกรรม'),
    note:I('For learning only — not investment advice.', 'ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'),
    howT:I('Reading the stock universe', 'อ่านจักรวาลหุ้นอย่างไร'),
    how:[
      I('Every star is one stock on the site; the bigger the star, the bigger the company.', 'ดาวแต่ละดวงคือหุ้น 1 ตัวในเว็บ ดาวยิ่งใหญ่ บริษัทยิ่งใหญ่'),
      I('Each cluster is a sector. Click its name to fly in.', 'แต่ละกลุ่มดาวคือกลุ่มอุตสาหกรรม กดที่ชื่อกลุ่มเพื่อบินเข้าไปดู'),
      I('Thin lines join stocks whose daily prices have moved together over the last 6 months — holding many linked stocks spreads risk less than it seems.', 'เส้นบาง ๆ เชื่อมหุ้นที่ราคารายวันขึ้นลงไปด้วยกันในช่วง 6 เดือน ถ้าถือหุ้นที่โยงกันหลายตัว ความเสี่ยงจะกระจายได้น้อยกว่าที่คิด'),
      I('Click a star to see its card here and light up the stocks it moves with.', 'กดที่ดาวเพื่อดูการ์ดของหุ้นตัวนั้น และดูว่าหุ้นตัวไหนเคลื่อนไหวคล้ายกัน'),
      I('Drag to turn, scroll or pinch to zoom.', 'ลากเพื่อหมุน เลื่อนลูกกลิ้งหรือถ่างนิ้วเพื่อซูม')
    ],
    sumUp:I('rose', 'ขึ้น'), sumDn:I('fell', 'ลง'),
    rsiHot:I('high — the price has run up fast', 'สูง ราคาวิ่งขึ้นเร็ว'), rsiCold:I('low — the price has fallen fast', 'ต่ำ ราคาลงเร็ว'), rsiMid:I('in the middle', 'อยู่ระดับกลาง ๆ'),
    aboveMa:I('above its 200-day average (long-term uptrend)', 'อยู่เหนือเส้นเฉลี่ย 200 วัน (แนวโน้มระยะยาวเป็นขาขึ้น)'),
    belowMa:I('below its 200-day average (long-term downtrend)', 'อยู่ใต้เส้นเฉลี่ย 200 วัน (แนวโน้มระยะยาวเป็นขาลง)'),
    today:I('today', 'วันนี้'), mcap:I('Market cap', 'มูลค่าตลาด'), dy:I('Dividend', 'ปันผล'), margin:I('Net margin', 'อัตรากำไร'), vol:I('Volatility 20d', 'ความผันผวน 20 วัน'),
    avg1m:I('average 1-month move', 'ผลตอบแทนเฉลี่ย 1 เดือน'), breadth:I('above their 200-day average', 'อยู่เหนือเส้นเฉลี่ย 200 วัน')
  };
  var SECT_TH = { 'Technology':'เทคโนโลยี', 'Financial Services':'การเงิน', 'Consumer Cyclical':'สินค้าฟุ่มเฟือย', 'Industrials':'อุตสาหกรรม', 'Healthcare':'สุขภาพ', 'Consumer Defensive':'สินค้าจำเป็น', 'Real Estate':'อสังหาฯ', 'Energy':'พลังงาน', 'Basic Materials':'วัตถุดิบ', 'Utilities':'สาธารณูปโภค', 'Communication Services':'สื่อสาร', 'Other':'อื่น ๆ' };
  function secName(n){ return L() === 'th' ? (SECT_TH[n] || n) : n; }

  var REDUCED = false; try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var DEF = { yaw:0.34, pitch:-0.26, dist:1 };
  var st = { mk:'all', col:'mono', play:!REDUCED, yaw:1.42, pitch:-0.05, roll:0, dist:1.18, sel:null, hover:null, grp:null, panel:false, q:'', tgt:{ x:0, y:0, z:0 } };
  var sec = null, stage = null, cv = null, ctx = null, W = 0, H = 0, DPR = 1, raf = 0, active = false, fakeFs = false;
  var stars = [], groups = [], links = [], dust = [], sky = [], orbits = [], specks = [], clouds = null, glow = null, bhCache = {}, bhKeys = [];
  var builtSnap = null, anim = null, lastT = 0, fps = 60, fpsN = 0, fpsT = 0, labelBoxes = [], asOf = '', built = false;
  var RING = 560, BH_R = 86, CAM = 1750;

  function hash(s){ var h = 2166136261; s = String(s); for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function rng(seed){ var x = Math.floor(seed * 2147483646) + 1; return function(){ x = (x * 16807) % 2147483647; return x / 2147483647; }; }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function num(v){ v = +v; return isNaN(v) ? null : v; }

  /* ---------------- data → scene ---------------- */
  function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }
  function buildStars(){
    var sn = snap(); if(!sn || !sn.stocks) return false;
    var thb = (sn.fx && sn.fx.THB) || 33.5, S = sn.stocks, by = {}, k, keepSel = st.sel && st.sel.key, keepGrp = st.grp && st.grp.name;
    builtSnap = sn;
    asOf = sn.generated_at || '';
    for(k in S){ var s = S[k]; if(!s || !s.mcap) continue; var n = s.sector || 'Other'; (by[n] = by[n] || []).push(k); }
    var names = Object.keys(by).sort(function(a, b){ return by[b].length - by[a].length; });
    if(!names.length) return false;
    groups = []; stars = []; dust = [];
    names.forEach(function(n, gi){
      var ang = -Math.PI / 2 + gi / names.length * Math.PI * 2 + (hash(n) - 0.5) * 0.18;
      var rad = RING * (0.86 + hash(n + 'r') * 0.3);
      var g = { name:n, x:Math.cos(ang) * rad, y:Math.sin(ang) * rad, z:(hash(n + 'z') - 0.5) * 160, n:by[n].length, keys:by[n], idx:gi };
      g.rc = 80 + Math.sqrt(g.n) * 15;
      groups.push(g);
      var R = rng(hash(n + 'seed'));
      by[n].forEach(function(key){
        var s = S[key], usd = s.ccy === 'THB' ? s.mcap / thb : s.mcap;
        var KR = rng(hash(key)), u = KR(), v = KR(), w = KR();
        /* gaussian-like cloud: dense core, soft edge */
        var th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), rr = g.rc * Math.min(2.1, Math.sqrt(-2 * Math.log(Math.max(1e-4, w))) * 0.5);
        var sz = clamp(0.55 + (Math.log10(Math.max(usd, 3e8)) - 9) * 0.62, 0.55, 2.7);
        stars.push({ key:key, s:s, g:g, usd:usd, mk:s.ccy === 'THB' ? 'th' : 'us', size:sz, ph:hash(key + 'p') * 6.28,
          x:g.x + Math.sin(ph) * Math.cos(th) * rr, y:g.y + Math.sin(ph) * Math.sin(th) * rr * 0.92, z:g.z + Math.cos(ph) * rr * 0.62, r:null });
      });
      /* fine dust around each cluster (decoration) */
      for(var i = 0, m = g.n * 4 + 60; i < m; i++){
        var a = R() * Math.PI * 2, b = Math.acos(2 * R() - 1), d = g.rc * Math.min(2.4, Math.sqrt(-2 * Math.log(Math.max(1e-4, R()))) * 0.62);
        dust.push({ x:g.x + Math.sin(b) * Math.cos(a) * d, y:g.y + Math.sin(b) * Math.sin(a) * d, z:g.z + Math.cos(b) * d * 0.6, a:0.08 + R() * 0.22, s:R() < 0.12 ? 1.1 : 0.7 });
      }
    });
    /* the swarm around the black hole */
    var R2 = rng(0.4242);
    for(var j = 0; j < 2600; j++){
      var a2 = R2() * Math.PI * 2, b2 = Math.acos(2 * R2() - 1), d2 = BH_R * 1.9 + Math.pow(R2(), 1.7) * 420;
      dust.push({ x:Math.sin(b2) * Math.cos(a2) * d2, y:Math.sin(b2) * Math.sin(a2) * d2, z:Math.cos(b2) * d2 * 0.55, a:0.06 + R2() * 0.2, s:R2() < 0.08 ? 1.1 : 0.7 });
    }
    stars.forEach(function(s, i){ s.i = i; });
    /* a rebuild (the full data file arrived) keeps what was open */
    st.sel = keepSel ? stars.filter(function(x){ return x.key === keepSel; })[0] || null : null;
    st.grp = keepGrp ? groups.filter(function(g){ return g.name === keepGrp; })[0] || null : null;
    buildLinks();
    return true;
  }
  /* daily returns (last ~6 months), standardised so a dot product / n = correlation */
  function rets(s){
    if(s.ret !== undefined) return s.ret;
    var v = String(s.s.c || '').split(',').map(Number).filter(function(x){ return x > 0; });
    if(v.length < 60){ s.ret = null; return null; }
    v = v.slice(-127);
    var r = [], i, m = 0, sd = 0;
    for(i = 1; i < v.length; i++) r.push(Math.log(v[i] / v[i - 1]));
    for(i = 0; i < r.length; i++) m += r[i]; m /= r.length;
    for(i = 0; i < r.length; i++){ r[i] -= m; sd += r[i] * r[i]; }
    sd = Math.sqrt(sd / r.length) || 1;
    for(i = 0; i < r.length; i++) r[i] /= sd;
    s.ret = r; return r;
  }
  function corr(a, b){
    var x = rets(a), y = rets(b); if(!x || !y) return null;
    var n = Math.min(x.length, y.length), o1 = x.length - n, o2 = y.length - n, d = 0;
    for(var i = 0; i < n; i++) d += x[o1 + i] * y[o2 + i];
    return d / n;
  }
  function buildLinks(){
    links = [];
    var seen = {};
    function add(a, b, c, far){ var k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; if(seen[k]) return; seen[k] = 1; links.push({ a:a, b:b, c:c, far:far }); }
    groups.forEach(function(g){
      var mem = stars.filter(function(s){ return s.g === g; });
      mem.forEach(function(s){
        var best = [];
        mem.forEach(function(o){
          if(o === s) return;
          var c = corr(s, o);
          if(c == null) c = 1 - Math.hypot(s.x - o.x, s.y - o.y, s.z - o.z) / (g.rc * 3);
          best.push([c, o]);
        });
        best.sort(function(p, q){ return q[0] - p[0]; });
        best.slice(0, 2).forEach(function(p){ add(s, p[1], p[0], false); });
      });
    });
    /* a few long lines between sectors: strongest cross-sector pairs */
    setTimeout(function(){
      var cand = [];
      for(var i = 0; i < stars.length; i += 1){
        var s = stars[i], bc = -1, bo = null;
        for(var j = 0; j < stars.length; j++){ var o = stars[j]; if(o.g === s.g) continue; var c = corr(s, o); if(c != null && c > bc){ bc = c; bo = o; } }
        if(bo && bc > 0.62) cand.push([bc, s, bo]);
      }
      cand.sort(function(p, q){ return q[0] - p[0]; });
      cand.slice(0, 70).forEach(function(p){ add(p[1], p[2], p[0], true); });
    }, 400);
  }
  function together(s, k){
    var out = [];
    stars.forEach(function(o){ if(o === s) return; var c = corr(s, o); if(c != null) out.push([c, o]); });
    out.sort(function(p, q){ return q[0] - p[0]; });
    return out.slice(0, k || 6);
  }

  function buildSky(){
    var R = rng(0.913), n = W < 700 ? 700 : 1500; sky = [];
    for(var i = 0; i < n; i++) sky.push({ x:R(), y:R(), m:Math.pow(R(), 3.2), ph:R() * 6.28 });
    orbits = [];
    [[820, 0.10, 0.05], [990, -0.18, 0.12], [1180, 0.22, -0.08], [1420, -0.06, 0.2], [1650, 0.15, 0.02]].forEach(function(o, i){
      orbits.push({ r:o[0], tx:o[1], ty:o[2], comets:[{ a:R() * 6.28, sp:(0.05 + R() * 0.05) * (i % 2 ? -1 : 1), len:0.34 + R() * 0.3 }].concat(R() < 0.6 ? [{ a:R() * 6.28, sp:(0.04 + R() * 0.05) * (i % 2 ? 1 : -1), len:0.25 + R() * 0.3 }] : []) });
    });
    specks = [];
    for(var j = 0; j < (W < 700 ? 120 : 260); j++) specks.push({ a:1.45 + Math.pow(R(), 1.3) * 3.3, t:R() * 6.28, w:0.3 + R() * 1.3 });
  }
  /* smoky grey clouds, mostly on the left like the reference */
  function buildClouds(){
    var c = document.createElement('canvas'); c.width = 1400; c.height = 900; var x = c.getContext('2d'), R = rng(0.377);
    for(var i = 0; i < 260; i++){
      var lx = R(), px = (lx < 0.62 ? lx * 0.55 : 0.35 + lx * 0.65) * 1400, py = R() * 900, r = 40 + R() * 210, a = 0.018 + R() * 0.05;
      if(px > 900) a *= 0.45;
      var g = x.createRadialGradient(px, py, 0, px, py, r), sh = 150 + Math.floor(R() * 60);
      g.addColorStop(0, 'rgba(' + sh + ',' + sh + ',' + (sh + 8) + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + sh + ',' + sh + ',' + sh + ',0)');
      x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
    }
    x.globalCompositeOperation = 'destination-out';
    for(i = 0; i < 80; i++){ var dx = R() * 1400, dy = R() * 900, dr = 30 + R() * 120, dg = x.createRadialGradient(dx, dy, 0, dx, dy, dr); dg.addColorStop(0, 'rgba(0,0,0,.55)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = dg; x.fillRect(dx - dr, dy - dr, dr * 2, dr * 2); }
    clouds = c;
    var gc = document.createElement('canvas'); gc.width = gc.height = 48; var gx = gc.getContext('2d'), gg = gx.createRadialGradient(24, 24, 0, 24, 24, 24);
    gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(0.18, 'rgba(235,240,255,.55)'); gg.addColorStop(0.5, 'rgba(220,228,255,.12)'); gg.addColorStop(1, 'rgba(220,228,255,0)');
    gx.fillStyle = gg; gx.fillRect(0, 0, 48, 48); glow = gc;
  }

  /* ---------------- black hole sprite (cached) ---------------- */
  function bhSprite(R, k){
    R = Math.max(6, Math.round(R / 2) * 2); k = Math.round(k * 50) / 50;
    var key = R + ':' + k; if(bhCache[key]) return bhCache[key];
    var w = Math.ceil(R * 12), h = Math.ceil(R * 11.2), c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'), cx = w / 2, cy = h / 2, rn = rng(0.61), i, t, a, g;
    x.globalCompositeOperation = 'lighter';
    g = x.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 5.5);
    g.addColorStop(0, 'rgba(255,214,160,.26)'); g.addColorStop(0.35, 'rgba(255,176,104,.08)'); g.addColorStop(1, 'rgba(255,150,80,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    function col(t){ return t < 0.12 ? [255, 250, 236] : t < 0.4 ? [255, 222, 168] : t < 0.7 ? [250, 184, 112] : [214, 136, 74]; }
    function disk(front){
      var a0 = R * 1.42, a1 = R * 5.3, N = 150;
      for(i = 0; i < N; i++){
        t = i / (N - 1); a = a0 + (a1 - a0) * Math.pow(t, 1.45);
        var al = Math.pow(1 - t, 1.7) * (0.55 + rn() * 0.75) * 0.2, cc = col(t);
        var gr = x.createLinearGradient(cx - a, 0, cx + a, 0);
        gr.addColorStop(0, 'rgba(' + cc + ',' + (al * 1.15).toFixed(3) + ')'); gr.addColorStop(0.32, 'rgba(' + cc + ',' + (al * 1.35).toFixed(3) + ')');
        gr.addColorStop(0.5, 'rgba(' + cc + ',' + (al * 0.9).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + cc + ',' + (al * 0.55).toFixed(3) + ')');
        x.strokeStyle = gr; x.lineWidth = Math.max(0.8, (a1 - a0) / N * 1.9);
        x.beginPath(); x.ellipse(cx, cy, a, Math.max(0.6, a * k), 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); x.stroke();
      }
    }
    disk(false);
    /* lensed image of the far side of the disk: a halo round the shadow, heavier on top */
    for(i = 0; i < 70; i++){
      t = i / 69; var rr = R * (1.07 + 0.95 * Math.pow(t, 1.25)), al2 = Math.pow(1 - t, 2.1) * (0.6 + rn() * 0.6) * 0.2, cc2 = col(t * 0.8);
      var vg = x.createLinearGradient(0, cy - rr, 0, cy + rr);
      vg.addColorStop(0, 'rgba(' + cc2 + ',' + al2.toFixed(3) + ')'); vg.addColorStop(0.45, 'rgba(' + cc2 + ',' + (al2 * 0.32).toFixed(3) + ')');
      vg.addColorStop(0.55, 'rgba(' + cc2 + ',' + (al2 * 0.32).toFixed(3) + ')'); vg.addColorStop(1, 'rgba(' + cc2 + ',' + (al2 * 0.7).toFixed(3) + ')');
      x.strokeStyle = vg; x.lineWidth = Math.max(0.7, R * 0.018);
      x.beginPath(); x.ellipse(cx, cy, rr, rr * (0.93 + k * 0.1), 0, 0, Math.PI * 2); x.stroke();
    }
    /* the shadow */
    x.globalCompositeOperation = 'source-over';
    var sg = x.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.04); sg.addColorStop(0, 'rgba(0,0,0,1)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sg; x.beginPath(); x.arc(cx, cy, R * 1.04, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#000'; x.beginPath(); x.arc(cx, cy, R * 0.92, 0, Math.PI * 2); x.fill();
    x.globalCompositeOperation = 'lighter';
    /* photon rings */
    x.strokeStyle = 'rgba(255,246,228,.95)'; x.lineWidth = Math.max(1, R * 0.034); x.beginPath(); x.arc(cx, cy, R * 1.035, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = 'rgba(255,226,180,.35)'; x.lineWidth = Math.max(0.8, R * 0.05); x.beginPath(); x.arc(cx, cy, R * 1.12, 0, Math.PI * 2); x.stroke();
    disk(true);
    /* lens flare along the disk */
    var fg = x.createLinearGradient(cx - R * 5.8, 0, cx + R * 5.8, 0);
    fg.addColorStop(0, 'rgba(255,214,160,0)'); fg.addColorStop(0.3, 'rgba(255,226,180,.35)'); fg.addColorStop(0.43, 'rgba(255,248,232,.95)');
    fg.addColorStop(0.57, 'rgba(255,240,215,.8)'); fg.addColorStop(0.72, 'rgba(255,210,150,.3)'); fg.addColorStop(1, 'rgba(255,190,120,0)');
    x.fillStyle = fg; x.beginPath(); x.ellipse(cx, cy, R * 5.8, Math.max(1.1, R * 0.06), 0, 0, Math.PI * 2); x.fill();
    x.globalAlpha = 0.35; x.beginPath(); x.ellipse(cx, cy, R * 4.6, Math.max(2, R * 0.22), 0, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    var hg = x.createRadialGradient(cx - R * 1.25, cy, 0, cx - R * 1.25, cy, R * 1.1); hg.addColorStop(0, 'rgba(255,250,238,.55)'); hg.addColorStop(1, 'rgba(255,230,190,0)');
    x.fillStyle = hg; x.fillRect(cx - R * 2.5, cy - R * 1.1, R * 2.5, R * 2.2);
    bhCache[key] = c; bhKeys.push(key);
    if(bhKeys.length > 26){ delete bhCache[bhKeys.shift()]; }
    return c;
  }

  /* ---------------- projection ---------------- */
  var CR = 1, SR = 0, CYW = 1, SYW = 0, CP = 1, SP = 0, KS = 1, CX0 = 0, CY0 = 0, TG = { x:0, y:0, z:0 };
  function camPrep(){
    CR = Math.cos(st.roll); SR = Math.sin(st.roll); CYW = Math.cos(st.yaw); SYW = Math.sin(st.yaw); CP = Math.cos(st.pitch); SP = Math.sin(st.pitch);
    KS = Math.min(W * 0.92, H) * 0.45 / 800; CX0 = W / 2 - (st.panel && W > 900 ? 170 : 0); CY0 = H / 2 + 6;
    TG = st.tgt;
  }
  function roll(x, y){ return [x * CR - y * SR, x * SR + y * CR]; }
  function project(x, y, z, out){
    var r = roll(x, y), x1 = r[0] - TG.x, y1 = r[1] - TG.y, z1 = z - TG.z;
    var x2 = x1 * CYW + z1 * SYW, z2 = -x1 * SYW + z1 * CYW;
    var y3 = y1 * CP - z2 * SP, z3 = y1 * SP + z2 * CP;
    var camZ = CAM * st.dist, d = camZ + z3;
    out = out || {};
    if(d < 40){ out.ok = false; return out; }
    var k = CAM * KS / d;
    out.x = CX0 + x2 * k; out.y = CY0 + y3 * k; out.k = k; out.z = z3; out.ok = true;
    return out;
  }
  function visible(s){ return st.mk === 'all' || s.mk === st.mk; }
  function starRGB(s){
    if(st.col === 'mono') return '236,240,255';
    var v = num(s.s.m1); if(v == null) return '236,240,255';
    var t = clamp(v / 12, -1, 1);
    return t >= 0 ? Math.round(lerp(236, 120, t)) + ',' + Math.round(lerp(240, 200, t)) + ',255' : '255,' + Math.round(lerp(240, 130, -t)) + ',' + Math.round(lerp(255, 150, -t));
  }

  /* ---------------- frame ---------------- */
  var P = {}, Q = {};
  function draw(now){
    raf = 0;
    if(!active || !ctx){ return; }
    raf = requestAnimationFrame(draw);
    var dt = lastT ? Math.min(60, now - lastT) : 16; lastT = now;
    fpsN++; if(now - fpsT > 1000){ fps = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; var f = sec.querySelector('[data-uv="fps"]'); if(f) f.textContent = T(U.sub) + ' · ' + fps + ' fps'; }
    stepAnim(now);
    if(st.play && !st.drag) st.roll += dt * 0.000022;
    camPrep();
    var c = ctx;
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    /* clouds + sky with a little parallax */
    var px = ((st.yaw * 120) % W + W) % W, py = st.pitch * 80;
    if(clouds){ c.globalAlpha = 0.95; var cw = Math.max(W, H * 1.55) * 1.15, ch = cw * 900 / 1400; c.drawImage(clouds, -cw * 0.08 - st.yaw * 30, (H - ch) / 2 + py * 0.3, cw, ch); c.globalAlpha = 1; }
    c.globalCompositeOperation = 'lighter';
    for(var i = 0; i < sky.length; i++){
      var s0 = sky[i], sx = (s0.x * W + px * 0.25) % W, sy = (s0.y * H + py * 0.2 + H) % H, al = 0.12 + s0.m * 0.65 + (st.play ? Math.sin(now * 0.0012 + s0.ph) * 0.06 : 0);
      c.fillStyle = 'rgba(225,230,245,' + al.toFixed(3) + ')';
      var sz = 0.5 + s0.m * 1.1; c.fillRect(sx, sy, sz, sz);
    }
    /* orbit rings + comets (behind everything) */
    drawOrbits(c, dt);
    /* black hole screen position */
    var b = project(0, 0, 0, {}), bR = BH_R * b.k, zBH = b.z;
    /* dust + links + stars behind the hole */
    drawField(c, now, zBH, true);
    if(b.ok){
      var kk = clamp(0.075 + Math.abs(Math.sin(st.pitch)) * 0.62, 0.075, 0.45);
      drawSpecks(c, b, bR, kk, dt, false);
      c.globalCompositeOperation = 'source-over';
      var sp = bhSprite(bR * DPR, kk), sw = sp.width / DPR, sh = sp.height / DPR; c.drawImage(sp, b.x - sw / 2, b.y - sh / 2, sw, sh);
      c.globalCompositeOperation = 'lighter';
      drawSpecks(c, b, bR, kk, dt, true);
    }
    drawField(c, now, zBH, false);
    drawSelection(c, now);
    c.globalCompositeOperation = 'source-over';
    drawLabels(c, b, bR);
  }
  function drawOrbits(c, dt){
    c.lineWidth = 1;
    orbits.forEach(function(o){
      var N = 120, pts = [];
      for(var i = 0; i <= N; i++){
        var a = i / N * Math.PI * 2, x = Math.cos(a) * o.r, y = Math.sin(a) * o.r, z = x * o.tx + y * o.ty;
        pts.push(project(x, y, z, {}));
      }
      c.strokeStyle = 'rgba(210,215,230,.055)'; c.beginPath();
      var on = false; pts.forEach(function(p){ if(!p.ok){ on = false; return; } if(on) c.lineTo(p.x, p.y); else { c.moveTo(p.x, p.y); on = true; } }); c.stroke();
      o.comets.forEach(function(cm){
        if(st.play) cm.a += cm.sp * dt * 0.001;
        var M = 40, prev = null;
        for(var j = 0; j <= M; j++){
          var t = j / M, a = cm.a - (cm.sp > 0 ? 1 : -1) * cm.len * (1 - t), x = Math.cos(a) * o.r, y = Math.sin(a) * o.r, p = project(x, y, x * o.tx + y * o.ty, {});
          if(p.ok && prev){ c.strokeStyle = 'rgba(236,240,250,' + (Math.pow(t, 1.8) * 0.75).toFixed(3) + ')'; c.lineWidth = 0.6 + t * 1.3; c.beginPath(); c.moveTo(prev.x, prev.y); c.lineTo(p.x, p.y); c.stroke(); }
          prev = p.ok ? p : null;
        }
        if(prev){ c.drawImage(glow, prev.x - 9, prev.y - 9, 18, 18); c.fillStyle = '#fff'; c.fillRect(prev.x - 1.2, prev.y - 1.2, 2.4, 2.4); }
      });
    });
  }
  function drawSpecks(c, b, bR, k, dt, front){
    for(var i = 0; i < specks.length; i++){
      var s = specks[i];
      if(front && st.play) s.t += dt * 0.00045 / Math.pow(s.a, 1.2);
      var sn = Math.sin(s.t); if((sn > 0) !== front) continue;
      var x = b.x + Math.cos(s.t) * s.a * bR, y = b.y + sn * s.a * bR * k;
      var al = (1 - (s.a - 1.45) / 3.4) * 0.5;
      c.fillStyle = 'rgba(255,' + (200 + Math.round(s.w * 30)) + ',150,' + al.toFixed(3) + ')'; c.fillRect(x, y, s.w, s.w * 0.8);
    }
  }
  function drawField(c, now, zBH, back){
    /* dust */
    for(var i = 0, stp = W < 700 ? 2 : 1; i < dust.length; i += stp){
      var d = dust[i], p = project(d.x, d.y, d.z, P); if(!p.ok || (p.z > zBH) !== back) continue;
      var a = d.a * clamp(p.k / KS, 0.35, 1.6); c.fillStyle = 'rgba(220,226,240,' + a.toFixed(3) + ')'; var z = d.s * clamp(p.k / KS, 0.6, 1.8); c.fillRect(p.x, p.y, z, z);
    }
    /* constellation lines */
    if(links.length){
      c.lineWidth = 0.6;
      c.strokeStyle = back ? 'rgba(205,212,232,.13)' : 'rgba(210,216,236,.17)'; c.beginPath();
      for(i = 0; i < links.length; i++){
        var l = links[i]; if(!visible(l.a) || !visible(l.b)) continue;
        var pa = project(l.a.x, l.a.y, l.a.z, P), pb = project(l.b.x, l.b.y, l.b.z, Q);
        if(!pa.ok || !pb.ok || ((pa.z + pb.z) / 2 > zBH) !== back) continue;
        c.moveTo(pa.x, pa.y); c.lineTo(pb.x, pb.y);
      }
      c.stroke();
    }
    /* stars */
    for(i = 0; i < stars.length; i++){
      var s = stars[i]; if(!visible(s)){ s.p = null; continue; }
      var q = project(s.x, s.y, s.z, s.p || (s.p = {})); if(!q.ok || (q.z > zBH) !== back) continue;
      var zf = clamp(q.k / KS, 0.5, 3.2), r = s.size * Math.sqrt(zf), tw = st.play ? 0.82 + Math.sin(now * 0.0016 + s.ph) * 0.18 : 1;
      if(st.grp && s.g !== st.grp) tw *= 0.55;
      s.r = r; var rgb = starRGB(s);
      if(r > 1.05 || s === st.hover){ var gs = r * (s === st.hover ? 9 : 6.5); c.globalAlpha = 0.55 * tw; c.drawImage(glow, q.x - gs / 2, q.y - gs / 2, gs, gs); c.globalAlpha = 1; }
      c.fillStyle = 'rgba(' + rgb + ',' + (0.75 + 0.25 * tw).toFixed(3) + ')';
      c.beginPath(); c.arc(q.x, q.y, Math.max(0.55, r * 0.62), 0, 6.283); c.fill();
    }
  }
  function drawSelection(c, now){
    var s = st.sel; if(!s || !s.p || !s.p.ok) return;
    var nb = s.nb || (s.nb = together(s, 6));
    c.lineWidth = 1.05;
    nb.forEach(function(p){
      var o = p[1]; if(!o.p || !o.p.ok || !visible(o)) return;
      var g = c.createLinearGradient(s.p.x, s.p.y, o.p.x, o.p.y);
      g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,.35)');
      c.strokeStyle = g; c.beginPath(); c.moveTo(s.p.x, s.p.y); c.lineTo(o.p.x, o.p.y); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(o.p.x, o.p.y, 1.8, 0, 6.283); c.fill();
    });
    var pulse = 0.5 + 0.5 * Math.sin(now * 0.004);
    c.globalAlpha = 0.9; c.drawImage(glow, s.p.x - 16 - pulse * 4, s.p.y - 16 - pulse * 4, 32 + pulse * 8, 32 + pulse * 8); c.globalAlpha = 1;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(s.p.x, s.p.y, 2.6, 0, 6.283); c.fill();
  }
  function pill(c, x, y, text, strong){
    c.font = (strong ? '600 ' : '500 ') + '12px Inter, "Noto Sans Thai", sans-serif';
    var w = c.measureText(text).width + 22, h = 26, r = 13;
    c.fillStyle = 'rgba(28,30,36,.86)'; c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1;
    c.beginPath(); if(c.roundRect) c.roundRect(x - w / 2, y - h / 2, w, h, r); else c.rect(x - w / 2, y - h / 2, w, h); c.fill(); c.stroke();
    c.fillStyle = 'rgba(240,242,248,.95)'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x, y + 0.5);
    return { x:x - w / 2, y:y - h / 2, w:w, h:h };
  }
  function drawLabels(c, b, bR){
    labelBoxes = [];
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    groups.forEach(function(g){
      var cnt = stars.filter(function(s){ return s.g === g && visible(s); }).length; if(!cnt) return;
      var p = project(g.x, g.y, g.z - 0, {}); if(!p.ok) return;
      var off = g.rc * p.k * 0.15, y = p.y - off;
      var dim = st.grp && st.grp !== g ? 0.45 : 1;
      c.shadowColor = 'rgba(0,0,0,.9)'; c.shadowBlur = 6;
      c.font = '600 ' + (st.grp === g ? 14 : 12.5) + 'px Inter, "Noto Sans Thai", sans-serif';
      c.fillStyle = 'rgba(248,249,252,' + (0.96 * dim).toFixed(2) + ')';
      var t1 = secName(g.name); c.fillText(t1, p.x, y);
      c.font = '500 10.5px Inter, "Noto Sans Thai", sans-serif'; c.fillStyle = 'rgba(160,166,180,' + (0.9 * dim).toFixed(2) + ')';
      c.fillText(cnt + ' ' + T(U.nStocks), p.x, y + 14);
      c.shadowBlur = 0;
      var w = Math.max(c.measureText(t1).width + 30, 70);
      labelBoxes.push({ g:g, x:p.x - w / 2, y:y - 16, w:w, h:36 });
    });
    if(b.ok && !st.grp){ var bx = pill(c, b.x, b.y + Math.max(26, bR * 1.6), T(U.core)); labelBoxes.push({ core:1, x:bx.x, y:bx.y, w:bx.w, h:bx.h }); }
    var s = st.sel;
    if(s && s.p && s.p.ok){
      var nm = String(s.s.name || '').replace(/^[A-Z0-9]+_/, ''); if(nm.length > 26) nm = nm.slice(0, 25) + '…';
      pill(c, s.p.x + (s.p.x > W - 200 ? -110 : 110) * 0 , s.p.y - 22, s.key + ' · ' + nm, true);
    }
  }

  /* ---------------- camera animation ---------------- */
  function ease(u){ return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  /* aim a bit short of the cluster so the black hole stays in the picture beside it */
  function grpTarget(g){ if(!g) return { x:0, y:0, z:0 }; var f = 0.64, r = [g.x * Math.cos(st.roll) - g.y * Math.sin(st.roll), g.x * Math.sin(st.roll) + g.y * Math.cos(st.roll)]; return { x:r[0] * f, y:r[1] * f, z:g.z * f }; }
  function camTo(to, ms){
    var d = to.yaw - st.yaw; while(d > Math.PI) d -= Math.PI * 2; while(d < -Math.PI) d += Math.PI * 2;
    anim = { t0:performance.now(), ms:REDUCED ? 1 : ms, f:{ yaw:st.yaw, pitch:st.pitch, dist:st.dist, tgt:{ x:st.tgt.x, y:st.tgt.y, z:st.tgt.z } }, to:{ yaw:st.yaw + d, pitch:to.pitch, dist:to.dist }, g:to.g || null };
  }
  function stepAnim(now){
    if(!anim){ if(st.grp) st.tgt = grpTarget(st.grp); return; }
    var a = anim, u = Math.min(1, (now - a.t0) / a.ms), e = ease(u), gt = grpTarget(a.g);
    st.yaw = lerp(a.f.yaw, a.to.yaw, e); st.pitch = lerp(a.f.pitch, a.to.pitch, e);
    st.dist = Math.exp(lerp(Math.log(a.f.dist), Math.log(a.to.dist), e));
    st.tgt = { x:lerp(a.f.tgt.x, gt.x, e), y:lerp(a.f.tgt.y, gt.y, e), z:lerp(a.f.tgt.z, gt.z, e) };
    if(u >= 1) anim = null;
  }
  function goGroup(g){
    st.grp = g; st.hover = null;
    if(g) camTo({ yaw:st.yaw, pitch:clamp(st.pitch, -0.5, -0.12), dist:0.46, g:g }, 1300);
    else camTo({ yaw:DEF.yaw, pitch:DEF.pitch, dist:DEF.dist, g:null }, 1200);
    paint();
  }
  function select(s, fly){
    st.sel = s; if(s){ s.nb = null; if(W > 900) st.panel = true; }
    if(s && fly && st.grp !== s.g) goGroup(s.g); else paint();
  }

  /* ---------------- UI ---------------- */
  var ICON = {
    minus:'<svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg>', plus:'<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>',
    reset:'<svg viewBox="0 0 24 24"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4.5v4h4"/></svg>',
    pause:'<svg viewBox="0 0 24 24"><path d="M9 6.5v11M15 6.5v11"/></svg>', play:'<svg viewBox="0 0 24 24"><path d="M8.5 6.5v11l9-5.5z"/></svg>',
    full:'<svg viewBox="0 0 24 24"><path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4"/></svg>', exit:'<svg viewBox="0 0 24 24"><path d="M9 5v4H5M15 5v4h4M9 19v-4H5M15 19v-4h4"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>', x:'<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    back:'<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg>', ext:'<svg viewBox="0 0 24 24"><path d="M9 6h9v9M18 6L7 17"/></svg>'
  };
  function fmtCap(usd){ return usd >= 1e12 ? (usd / 1e12).toFixed(2) + 'T' : usd >= 1e9 ? (usd / 1e9).toFixed(1) + 'B' : (usd / 1e6).toFixed(0) + 'M'; }
  function pc(v){ v = num(v); return v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%'; }
  function n2(v, dp, suf){ v = num(v); return v == null ? '—' : v.toFixed(dp) + (suf || ''); }
  function cls(v){ v = num(v); return v == null ? '' : v >= 0 ? 'up' : 'dn'; }
  function dateTxt(){
    if(!asOf) return '';
    var d = new Date(asOf); if(isNaN(d)) return asOf;
    var th = L() === 'th', mo = th ? ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + mo[d.getMonth()] + ' ' + (th ? d.getFullYear() + 543 : d.getFullYear()) + ' · ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function chartSVG(s){
    var v = String(s.s.c || '').split(',').map(Number).filter(function(x){ return x > 0; }); if(v.length < 20) return '';
    var all = v.slice(), ma = [], acc = 0;
    for(var i = 0; i < all.length; i++){ acc += all[i]; if(i >= 50) acc -= all[i - 50]; ma.push(i >= 49 ? acc / 50 : null); }
    var n = Math.min(126, v.length); v = all.slice(-n); ma = ma.slice(-n);
    var vals = v.concat(ma.filter(function(x){ return x != null; })), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rg = (mx - mn) || 1, Wc = 300, Hc = 92;
    function X(i){ return (i / (n - 1) * Wc).toFixed(1); } function Y(y){ return (Hc - 4 - (y - mn) / rg * (Hc - 10)).toFixed(1); }
    var line = v.map(function(y, i){ return (i ? 'L' : 'M') + X(i) + ',' + Y(y); }).join(''), on = false, ml = '';
    ma.forEach(function(y, i){ if(y == null){ on = false; return; } ml += (on ? 'L' : 'M') + X(i) + ',' + Y(y); on = true; });
    var up = v[v.length - 1] >= v[0];
    return '<div class="uv-ch"><div class="uv-ch-h"><span>' + esc(T(U.chart)) + '</span><em><i></i>' + esc(T(U.ma50)) + '</em></div><svg viewBox="0 0 ' + Wc + ' ' + Hc + '" preserveAspectRatio="none">' +
      '<path d="' + line + 'L' + Wc + ',' + Hc + 'L0,' + Hc + 'Z" fill="' + (up ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.05)') + '"/>' +
      '<path d="' + ml + '" fill="none" stroke="rgba(255,214,160,.7)" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + line + '" fill="none" stroke="#f2f4f8" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg></div>';
  }
  function summary(s){
    var d = s.s, th = L() === 'th', out = [];
    var m1 = num(d.m1), m3 = num(d.m3), rsi = num(d.rsi), off = num(d.off_high);
    if(th){
      out.push('ราคาล่าสุด ' + d.price + ' ' + d.ccy + ' (' + pc(d.chg_pct) + ' วันนี้)');
      if(m1 != null) out.push('ใน 1 เดือน' + (m1 >= 0 ? 'ขึ้น ' : 'ลง ') + Math.abs(m1).toFixed(1) + '%' + (m3 != null ? ' และใน 3 เดือน' + (m3 >= 0 ? 'ขึ้น ' : 'ลง ') + Math.abs(m3).toFixed(1) + '%' : ''));
      if(d.above_ma200 != null) out.push('ราคา' + T(d.above_ma200 ? U.aboveMa : U.belowMa));
      if(off != null) out.push('ห่างจากจุดสูงสุดรอบ 52 สัปดาห์ ' + Math.abs(off).toFixed(1) + '%');
      if(rsi != null) out.push('RSI ' + rsi.toFixed(0) + ' ' + T(rsi >= 70 ? U.rsiHot : rsi <= 30 ? U.rsiCold : U.rsiMid));
      if(num(d.pe) != null) out.push('P/E ' + (+d.pe).toFixed(1) + ' เท่า' + (num(d.roe) != null ? ' และ ROE ' + (+d.roe).toFixed(1) + '%' : ''));
      return out.join(' · ') + '';
    }
    out.push('Last price ' + d.price + ' ' + d.ccy + ' (' + pc(d.chg_pct) + ' today)');
    if(m1 != null) out.push('it ' + (m1 >= 0 ? 'rose ' : 'fell ') + Math.abs(m1).toFixed(1) + '% in a month' + (m3 != null ? ' and ' + (m3 >= 0 ? 'rose ' : 'fell ') + Math.abs(m3).toFixed(1) + '% in three' : ''));
    if(d.above_ma200 != null) out.push('the price is ' + T(d.above_ma200 ? U.aboveMa : U.belowMa));
    if(off != null) out.push(Math.abs(off).toFixed(1) + '% below its 52-week high');
    if(rsi != null) out.push('RSI ' + rsi.toFixed(0) + ' is ' + T(rsi >= 70 ? U.rsiHot : rsi <= 30 ? U.rsiCold : U.rsiMid));
    if(num(d.pe) != null) out.push('P/E ' + (+d.pe).toFixed(1) + (num(d.roe) != null ? ', ROE ' + (+d.roe).toFixed(1) + '%' : ''));
    return out.join(' · ');
  }
  function stockCard(s){
    var d = s.s, nm = String(d.name || '').replace(/^[A-Z0-9]+_/, ''), lo = num(d.lo52), hi = num(d.hi52), pos = (lo != null && hi > lo) ? clamp((d.price - lo) / (hi - lo) * 100, 0, 100) : 50;
    var nb = s.nb || (s.nb = together(s, 6));
    var facts = [['P/E', n2(d.pe, 1)], ['P/B', n2(d.pb, 2)], ['ROE', n2(d.roe, 1, '%')], [T(U.margin), n2(d.margin, 1, '%')], [T(U.dy), n2(d.div, 2, '%')], ['D/E', n2(d.de, 2)], ['RSI', n2(d.rsi, 0)], [T(U.vol), n2(d.vol20, 1, '%')], ['1M', pc(d.m1), cls(d.m1)], ['3M', pc(d.m3), cls(d.m3)]];
    return '<div class="uv-badge">' + esc(secName(s.g.name)) + '</div>' +
      '<h3>' + esc(s.key) + ' <span>· ' + esc(nm) + '</span></h3>' +
      '<div class="uv-upd">' + esc(T(U.updated)) + ' ' + esc(dateTxt()) + ' · ' + esc(T(U.mcap)) + ' $' + fmtCap(s.usd) + '</div>' +
      '<div class="uv-btns"><button type="button" data-uv-act="wave">' + esc(T(U.wave)) + '</button>' + (st.grp !== s.g ? '<button type="button" data-uv-act="ingrp">' + esc(T(U.focus)) + '</button>' : '') + '</div>' +
      '<div class="uv-px"><b>' + esc(d.price) + '</b><em>' + esc(d.ccy) + '</em><span class="' + cls(d.chg_pct) + '">' + pc(d.chg_pct) + ' ' + esc(T(U.today)) + '</span></div>' +
      chartSVG(s) +
      '<p class="uv-p">' + esc(summary(s)) + '</p>' +
      (nb.length ? '<h4>' + esc(T(U.together)) + '</h4><p class="uv-links">' + nb.map(function(p){ return '<a href="#" data-uv-sel="' + esc(p[1].key) + '">' + esc(p[1].key) + '</a><em>' + (p[0] * 100).toFixed(0) + '%</em>'; }).join(', ') + '</p>' : '') +
      '<h4>' + esc(T(U.facts)) + '</h4><div class="uv-facts">' + facts.map(function(f){ return '<div><span>' + esc(f[0]) + '</span><b class="' + (f[2] || '') + '">' + esc(f[1]) + '</b></div>'; }).join('') + '</div>' +
      '<div class="uv-r52"><span>' + esc(T(U.r52)) + '</span><div class="uv-rbar"><i style="left:' + pos.toFixed(1) + '%"></i></div><div class="uv-r52v"><em>' + n2(lo, 2) + '</em><em>' + n2(hi, 2) + '</em></div></div>' +
      '<p class="uv-note">' + esc(T(U.note)) + '</p>';
  }
  function list(title, arr, fmt){ return arr.length ? '<h4>' + esc(T(title)) + '</h4><ol class="uv-ol">' + arr.map(function(s){ return '<li><a href="#" data-uv-sel="' + esc(s.key) + '">' + esc(s.key) + '</a><span>' + fmt(s) + '</span></li>'; }).join('') + '</ol>' : ''; }
  function groupCard(g){
    var mem = stars.filter(function(s){ return s.g === g && visible(s); }), m1s = mem.map(function(s){ return num(s.s.m1); }).filter(function(v){ return v != null; });
    var avg = m1s.length ? m1s.reduce(function(a, b){ return a + b; }, 0) / m1s.length : null;
    var ab = mem.filter(function(s){ return s.s.above_ma200 === true || s.s.above_ma200 === 'True'; }).length;
    var by = function(f){ return mem.filter(function(s){ return num(s.s.m1) != null; }).sort(f); };
    return '<div class="uv-badge">' + esc(T(U.badgeSector)) + '</div><h3>' + esc(secName(g.name)) + '</h3>' +
      '<div class="uv-upd">' + mem.length + ' ' + esc(T(U.nStocks)) + ' · ' + esc(T(U.updated)) + ' ' + esc(dateTxt()) + '</div>' +
      '<div class="uv-facts two"><div><span>' + esc(T(U.avg1m)) + '</span><b class="' + cls(avg) + '">' + pc(avg) + '</b></div><div><span>' + esc(T(U.breadth)) + '</span><b>' + (mem.length ? Math.round(ab / mem.length * 100) : 0) + '%</b></div></div>' +
      list(U.gain, by(function(a, b){ return b.s.m1 - a.s.m1; }).slice(0, 5), function(s){ return '<b class="up">' + pc(s.s.m1) + '</b>'; }) +
      list(U.lose, by(function(a, b){ return a.s.m1 - b.s.m1; }).slice(0, 5), function(s){ return '<b class="dn">' + pc(s.s.m1) + '</b>'; }) +
      list(U.big, mem.slice().sort(function(a, b){ return b.usd - a.usd; }).slice(0, 5), function(s){ return '$' + fmtCap(s.usd); }) +
      '<p class="uv-note">' + esc(T(U.note)) + '</p>';
  }
  function howCard(){
    return '<div class="uv-badge">' + esc(T(U.badgeHow)) + '</div><h3>' + esc(T(U.howT)) + '</h3>' +
      '<div class="uv-upd">' + stars.filter(visible).length + ' ' + esc(T(U.stars)) + ' · ' + esc(T(U.updated)) + ' ' + esc(dateTxt()) + '</div>' +
      '<ul class="uv-how">' + U.how.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul>' +
      '<h4>' + esc(T(U.sectors)) + '</h4><p class="uv-links">' + groups.map(function(g){ return '<a href="#" data-uv-grp="' + g.idx + '">' + esc(secName(g.name)) + '</a><em>' + stars.filter(function(s){ return s.g === g && visible(s); }).length + '</em>'; }).join(', ') + '</p>' +
      '<p class="uv-note">' + esc(T(U.note)) + '</p>';
  }
  function options(){
    var h = '<option value="">' + esc(T(U.pick)) + '</option>';
    groups.forEach(function(g){
      var mem = stars.filter(function(s){ return s.g === g && visible(s); }).sort(function(a, b){ return a.key < b.key ? -1 : 1; });
      if(!mem.length) return;
      h += '<optgroup label="' + esc(secName(g.name)) + '">' + mem.map(function(s){ return '<option value="' + esc(s.key) + '"' + (st.sel === s ? ' selected' : '') + '>' + esc(s.key + ' · ' + String(s.s.name || '').replace(/^[A-Z0-9]+_/, '').slice(0, 34)) + '</option>'; }).join('') + '</optgroup>';
    });
    return h;
  }
  function paint(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-uv="' + k + '"]'); }, full = isFull();
    q('tl').innerHTML = st.grp
      ? '<button type="button" class="uv-pill uv-back" data-uv-act="back">' + ICON.back + '<span>' + esc(secName(st.grp.name)) + '</span></button>'
      : '<div class="uv-title"><b>' + esc(T(U.h)) + '</b><span data-uv="fps">' + esc(T(U.sub)) + ' · ' + fps + ' fps</span></div>';
    q('tc').innerHTML = '<button type="button" class="uv-pill" data-uv-act="home">' + esc(T(U.home)) + '</button>';
    q('tr').innerHTML = '<button type="button" class="uv-pill' + (st.panel ? ' on' : '') + '" data-uv-act="panel">' + esc(T(U.pages)) + '</button>';
    q('bar').innerHTML = [['zout', ICON.minus, U.zoomOut], ['zin', ICON.plus, U.zoomIn], ['reset', ICON.reset, U.reset], ['play', st.play ? ICON.pause : ICON.play, st.play ? U.pause : U.play], ['fs', full ? ICON.exit : ICON.full, full ? U.exitFull : U.full]]
      .map(function(b){ return '<button type="button" data-uv-act="' + b[0] + '" title="' + esc(T(b[2])) + '" aria-label="' + esc(T(b[2])) + '">' + b[1] + '</button>'; }).join('');
    q('lg').textContent = stars.length ? T(U.legend) : T(U.loading);
    var pn = q('panel');
    pn.classList.toggle('on', !!st.panel);
    if(st.panel){
      var keep = document.activeElement && document.activeElement.hasAttribute && document.activeElement.hasAttribute('data-uv-q');
      if(!keep || !pn.innerHTML){
        pn.innerHTML = '<div class="uv-ph"><b>' + esc(T(U.pages)) + '</b><button type="button" class="uv-x" data-uv-act="panel" aria-label="' + esc(T(U.close)) + '">' + ICON.x + '</button></div>' +
          '<label class="uv-search">' + ICON.search + '<input type="search" data-uv-q autocomplete="off" placeholder="' + esc(T(U.search)) + '" value="' + esc(st.q) + '"></label>' +
          '<div class="uv-res" data-uv="res"></div>' +
          '<select class="uv-sel" data-uv-pick>' + options() + '</select>' +
          '<div class="uv-chips">' + ['all', 'us', 'th'].map(function(k){ return '<button type="button" data-uv-mk="' + k + '" class="' + (st.mk === k ? 'on' : '') + '">' + esc(T(U[k])) + '</button>'; }).join('') +
            '<span></span>' + ['mono', 'mom'].map(function(k){ return '<button type="button" data-uv-col="' + k + '" class="' + (st.col === k ? 'on' : '') + '">' + esc(T(U[k])) + '</button>'; }).join('') + '</div>' +
          '<div class="uv-card" data-uv="card"></div>';
      }
      var cd = q('card'); if(cd) cd.innerHTML = st.sel ? stockCard(st.sel) : st.grp ? groupCard(st.grp) : howCard();
      results();
    }
  }
  function results(){
    var box = sec.querySelector('[data-uv="res"]'); if(!box) return;
    var qq = st.q.trim().toUpperCase();
    if(!qq){ box.innerHTML = ''; box.classList.remove('on'); return; }
    var hit = stars.filter(function(s){ return visible(s) && (s.key.indexOf(qq) === 0 || String(s.s.name || '').toUpperCase().indexOf(qq) >= 0); }).slice(0, 7);
    box.innerHTML = hit.map(function(s){ return '<button type="button" data-uv-sel="' + esc(s.key) + '"><b>' + esc(s.key) + '</b><span>' + esc(String(s.s.name || '').replace(/^[A-Z0-9]+_/, '')) + '</span><em>' + esc(secName(s.g.name)) + '</em></button>'; }).join('');
    box.classList.toggle('on', hit.length > 0);
  }
  function tip(s, x, y){
    var t = sec.querySelector('[data-uv="tip"]'); if(!t) return;
    if(!s){ t.classList.remove('on'); return; }
    var nm = String(s.s.name || '').replace(/^[A-Z0-9]+_/, '');
    t.innerHTML = '<b>' + esc(s.key) + ' · ' + esc(nm) + '</b><span>' + esc(secName(s.g.name)) + ' · 1M ' + pc(s.s.m1) + ' · RSI ' + n2(s.s.rsi, 0) + '</span>';
    t.classList.add('on');
    var r = stage.getBoundingClientRect(), tw = t.offsetWidth || 220;
    var lx = x + 14; if(lx + tw > r.width - 8) lx = x - tw - 14;
    t.style.transform = 'translate(' + Math.round(lx) + 'px,' + Math.round(y + 14) + 'px)';
  }

  /* ---------------- input ---------------- */
  function pick(px, py){
    var best = null, bd = 1e9;
    stars.forEach(function(s){ if(!s.p || !s.p.ok || !visible(s)) return; var d = Math.hypot(s.p.x - px, s.p.y - py), lim = Math.max(8, (s.r || 1) * 3); if(d < lim && d < bd){ bd = d; best = s; } });
    return best;
  }
  function pickLabel(px, py){ for(var i = 0; i < labelBoxes.length; i++){ var b = labelBoxes[i]; if(px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return b; } return null; }
  function isFull(){ return fakeFs || document.fullscreenElement === stage || document.webkitFullscreenElement === stage; }
  function toggleFull(){
    if(isFull()){
      if(fakeFs){ fakeFs = false; stage.classList.remove('uv-fs'); document.documentElement.classList.remove('uv-fs-lock'); }
      else if(document.exitFullscreen) document.exitFullscreen().catch(function(){});
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
      var fb = function(){ fakeFs = true; stage.classList.add('uv-fs'); document.documentElement.classList.add('uv-fs-lock'); paint(); setTimeout(resize, 30); };
      if(req){ try { var pr = req.call(stage); if(pr && pr.catch) pr.catch(fb); } catch(e){ fb(); } } else fb();
    }
    setTimeout(function(){ resize(); paint(); }, 120);
  }
  function wire(){
    var pts = {}, drag = null, pinch = null, moved = false;
    stage.addEventListener('pointerdown', function(ev){
      if(ev.target !== cv) return;
      pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY }; moved = false;
      var ids = Object.keys(pts);
      if(ids.length === 1) drag = { x:ev.clientX, y:ev.clientY, yaw:st.yaw, pitch:st.pitch };
      else if(ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d:Math.hypot(a.x - b.x, a.y - b.y), dist:st.dist }; drag = null; }
      st.drag = true; anim = null;
    });
    window.addEventListener('pointermove', function(ev){
      if(pts[ev.pointerId]){
        pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY };
        var ids = Object.keys(pts);
        if(pinch && ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; st.dist = clamp(pinch.dist * pinch.d / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), 0.22, 2.4); moved = true; return; }
        if(drag){ var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; if(Math.abs(dx) + Math.abs(dy) > 4) moved = true; st.yaw = drag.yaw + dx * 0.005; st.pitch = clamp(drag.pitch + dy * 0.005, -1.35, 1.35); }
        tip(null); return;
      }
      if(ev.target === cv){
        var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, h = pick(x, y), lb = h ? null : pickLabel(x, y);
        st.hover = h; cv.style.cursor = (h || lb) ? 'pointer' : 'grab'; tip(h, x, y);
      } else if(st.hover){ st.hover = null; tip(null); }
    });
    function up(ev){
      if(!pts[ev.pointerId]) return;
      delete pts[ev.pointerId];
      if(Object.keys(pts).length < 2) pinch = null;
      if(!Object.keys(pts).length){
        drag = null; st.drag = false;
        if(!moved && ev.target === cv){
          var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, s = pick(x, y);
          if(s){ tip(null); select(s, true); return; }
          var lb = pickLabel(x, y);
          if(lb){ if(lb.core){ st.sel = null; goGroup(null); } else { st.sel = null; goGroup(lb.g); } return; }
          if(st.sel){ st.sel = null; paint(); }
        }
      }
    }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    stage.addEventListener('pointerleave', function(){ st.hover = null; tip(null); });
    stage.addEventListener('wheel', function(ev){ if(ev.target !== cv) return; ev.preventDefault(); anim = null; st.dist = clamp(st.dist * (ev.deltaY > 0 ? 1.08 : 0.926), 0.22, 2.4); }, { passive:false });
    sec.addEventListener('click', function(ev){
      var b;
      if((b = ev.target.closest('[data-uv-sel]'))){ ev.preventDefault(); var k = b.getAttribute('data-uv-sel'), m = stars.filter(function(s){ return s.key === k; })[0]; if(m){ st.q = ''; if(!visible(m)) st.mk = 'all'; var inp = sec.querySelector('[data-uv-q]'); if(inp) inp.value = ''; inp && inp.blur(); select(m, true); } return; }
      if((b = ev.target.closest('[data-uv-grp]'))){ ev.preventDefault(); st.sel = null; goGroup(groups[+b.getAttribute('data-uv-grp')]); return; }
      if((b = ev.target.closest('[data-uv-mk]'))){ st.mk = b.getAttribute('data-uv-mk'); if(st.sel && !visible(st.sel)) st.sel = null; sec.querySelector('[data-uv="panel"]').innerHTML = ''; paint(); return; }
      if((b = ev.target.closest('[data-uv-col]'))){ st.col = b.getAttribute('data-uv-col'); sec.querySelector('[data-uv="panel"]').innerHTML = ''; paint(); return; }
      if((b = ev.target.closest('[data-uv-act]'))){
        var a = b.getAttribute('data-uv-act');
        if(a === 'zin'){ anim = null; st.dist = clamp(st.dist / 1.3, 0.22, 2.4); }
        else if(a === 'zout'){ anim = null; st.dist = clamp(st.dist * 1.3, 0.22, 2.4); }
        else if(a === 'reset' || a === 'home'){ st.sel = null; goGroup(null); return; }
        else if(a === 'back'){ if(st.sel){ st.sel = null; } goGroup(null); return; }
        else if(a === 'play') st.play = !st.play;
        else if(a === 'panel'){ st.panel = !st.panel; }
        else if(a === 'fs'){ toggleFull(); return; }
        else if(a === 'ingrp' && st.sel){ goGroup(st.sel.g); return; }
        else if(a === 'wave' && st.sel){
          var sym = st.sel.key;
          try { localStorage.setItem('spz.aw.sym', sym); } catch(e){}
          if(isFull()) toggleFull();
          if(window.__SPZ_AUTOWAVE_OPEN) window.__SPZ_AUTOWAVE_OPEN(sym); else location.hash = '#/autowave';
          return;
        }
        paint(); return;
      }
    });
    sec.addEventListener('input', function(ev){ if(ev.target.hasAttribute('data-uv-q')){ st.q = ev.target.value; results(); } });
    sec.addEventListener('change', function(ev){
      if(!ev.target.hasAttribute('data-uv-pick')) return;
      var k = ev.target.value, m = stars.filter(function(s){ return s.key === k; })[0]; if(m) select(m, true);
    });
    sec.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' && ev.target.hasAttribute('data-uv-q')){ var f = sec.querySelector('[data-uv="res"] [data-uv-sel]'); if(f) f.click(); }
    });
    document.addEventListener('keydown', function(ev){
      if(ev.key !== 'Escape' || !active) return;
      if(st.sel){ st.sel = null; paint(); return; }
      if(st.grp){ goGroup(null); return; }
      if(fakeFs) toggleFull();
    });
    window.addEventListener('resize', function(){ fit(false); resize(); });
    document.addEventListener('fullscreenchange', function(){ setTimeout(function(){ resize(); paint(); }, 60); });
    document.addEventListener('webkitfullscreenchange', function(){ setTimeout(function(){ resize(); paint(); }, 60); });
    if(window.ResizeObserver) new ResizeObserver(function(){ resize(); }).observe(stage);
  }
  function resize(){
    if(!stage || !cv) return;
    var r = stage.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
    DPR = Math.min(2, window.devicePixelRatio || 1); var w = Math.round(r.width), h = Math.round(r.height);
    if(w === W && h === H && cv.width === Math.round(w * DPR)) return;
    W = w; H = h; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    buildSky();
  }
  function headerBottom(){
    var hb = 0;
    document.querySelectorAll('.top-fixed').forEach(function(el){ var r = el.getBoundingClientRect(), cs = getComputedStyle(el); if((cs.position === 'fixed' || cs.position === 'sticky') && r.bottom > hb && r.top <= 1) hb = r.bottom; });
    return Math.min(hb, window.innerHeight * 0.4);
  }
  function fit(scroll){
    if(!stage || isFull()) return;
    var hb = headerBottom(), h = Math.max(520, window.innerHeight - hb - 14);
    stage.style.height = h + 'px';
    if(scroll){ var y = stage.getBoundingClientRect().top + window.scrollY - hb - 8; window.scrollTo({ top:Math.max(0, y), behavior:'smooth' }); }
  }
  function hasCloses(sn){ if(!sn || !sn.stocks) return false; for(var k in sn.stocks){ var s = sn.stocks[k]; if(s && s.mcap) return !!s.c; } return false; }
  function isShown(){ return !!(sec && sec.offsetParent !== null && sec.getBoundingClientRect().height > 50); }
  function enter(){
    setTimeout(function(){ fit(true); }, 260);
    setTimeout(function(){
      resize(); if(!stars.length) buildStars(); paint();
      /* opening move: from the edge-on view into the full map */
      if(!REDUCED && !st.grp && !st.sel){ st.yaw = 1.42; st.pitch = -0.04; st.dist = 1.2; st.tgt = { x:0, y:0, z:0 }; camTo({ yaw:DEF.yaw, pitch:DEF.pitch, dist:DEF.dist, g:null }, 2600); }
    }, 60);
  }
  function watch(){
    var on = isShown();
    if(on && !active){ active = true; lastT = 0; enter(); if(!raf) raf = requestAnimationFrame(draw); }
    else if(!on && active){ active = false; tip(null); if(isFull()) toggleFull(); }
    if(on){
      var sn = snap();
      /* first data, or the full file (with price history) replaced the light one */
      if(sn && sn.stocks && (!stars.length || (sn !== builtSnap && hasCloses(sn) && !hasCloses(builtSnap)))){ if(buildStars()){ var p = sec.querySelector('[data-uv="panel"]'); if(p) p.innerHTML = ''; paint(); } }
    }
  }
  function build(){
    if(document.getElementById('universe')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'universe'; sec.setAttribute('data-route', 'universe');
    sec.innerHTML = '<div class="uv-wrap"><div class="uv-stage" data-nolc><canvas></canvas>' +
      '<div class="uv-tl" data-uv="tl"></div><div class="uv-tc" data-uv="tc"></div><div class="uv-tr" data-uv="tr"></div>' +
      '<div class="uv-tip" data-uv="tip"></div><aside class="uv-panel" data-uv="panel"></aside>' +
      '<div class="uv-bar" data-uv="bar"></div><div class="uv-lg" data-uv="lg"></div></div></div>';
    document.body.appendChild(sec);
    stage = sec.querySelector('.uv-stage'); cv = sec.querySelector('canvas'); ctx = cv.getContext('2d');
    window.__spzAddRoute({ id:'universe', after:'globe', t:U.h, d:U.d });
    buildClouds();
    /* read-only helper for tests: where a star is on screen right now */
    window.__SPZ_UNI_DBG = function(){ return { stars:stars.length, links:links.length, groups:groups.length, active:active, dist:st.dist, sel:st.sel && st.sel.key, grp:st.grp && st.grp.name, full:hasCloses(builtSnap) }; };
    window.__SPZ_UNI_POS = function(k){ var m = stars.filter(function(x){ return x.key === k; })[0]; return m && m.p && m.p.ok ? { x:m.p.x, y:m.p.y } : null; };
    wire(); resize(); buildStars(); paint();
    new MutationObserver(function(){ var p = sec.querySelector('[data-uv="panel"]'); if(p) p.innerHTML = ''; paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    setInterval(watch, 500); watch();
    built = true;
    return true;
  }
  function boot(){ var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 400); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  else setTimeout(boot, 1500);
})();
