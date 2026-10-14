/* ============================================================================
   SPACEZ TERMINAL -- Stock Universe (#/universe)
   Every stock in data/market.json is a star. Sectors are galaxies orbiting a
   central black hole; a star's size follows market cap (log scale, THB
   converted to USD), its colour follows momentum (1M / 3M return or RSI):
   hot blue stars are rising, cool red stars are falling.
   The scene around the data is decoration only: deep starfield, drifting
   nebula, planets, comets that bend around (or fall into) the black hole.
   Drag to rotate, scroll or pinch to zoom, tap a star for its card.
   Plain canvas 2D with a small perspective projection -- no 3D library.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_UNIVERSE) return;
  window.__SPZ_UNIVERSE = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var U = {
    eb:{ en:'Market map · 3D', th:'แผนที่ตลาด · 3D' },
    h:{ en:'Stock universe', th:'จักรวาลหุ้น' },
    lede:{ en:'Every stock on the site is a star orbiting a black hole. Galaxies are sectors, star size is company size, colour is momentum: blue stars are rising, red stars are falling. Drag to spin, scroll or pinch to zoom, tap a star for details.', th:'หุ้นทุกตัวในเว็บคือดาวที่โคจรรอบหลุมดำ กาแล็กซีคือกลุ่มอุตสาหกรรม ขนาดดาวคือขนาดบริษัท สีคือโมเมนตัม ดาวสีน้ำเงินกำลังขึ้น ดาวสีแดงกำลังลง ลากเพื่อหมุน เลื่อนลูกกลิ้งหรือถ่างนิ้วเพื่อซูม แตะดาวเพื่อดูรายละเอียด' },
    mk:{ en:'Market', th:'ตลาด' }, all:{ en:'All', th:'ทั้งหมด' }, us:{ en:'US', th:'สหรัฐฯ' }, th:{ en:'Thailand', th:'ไทย' },
    m1:{ en:'1-month return', th:'ผลตอบแทน 1 เดือน' }, m3:{ en:'3-month return', th:'ผลตอบแทน 3 เดือน' }, rsi:{ en:'RSI', th:'RSI' },
    find:{ en:'Find a stock…', th:'ค้นหาหุ้น…' }, spin:{ en:'Auto-spin', th:'หมุนเอง' }, reset:{ en:'Reset view', th:'มุมเริ่มต้น' },
    full:{ en:'Full screen', th:'เต็มจอ' }, exitFull:{ en:'Exit full screen', th:'ออกจากเต็มจอ' },
    stars:{ en:'stars', th:'ดวง' }, mcap:{ en:'Market cap', th:'มูลค่าตลาด' }, price:{ en:'Price', th:'ราคา' }, sector:{ en:'Sector', th:'กลุ่ม' },
    wave:{ en:'Count its waves →', th:'นับคลื่นหุ้นนี้ →' }, close:{ en:'Close', th:'ปิด' },
    lgDn:{ en:'falling', th:'ลง' }, lgUp:{ en:'rising', th:'ขึ้น' }, lgSz:{ en:'bigger star = bigger company', th:'ดาวใหญ่ = บริษัทใหญ่' },
    bh:{ en:'Black hole · the market core', th:'หลุมดำ · ใจกลางตลาด' },
    opts:{ en:'Options', th:'ตัวเลือก' },
    zoomIn:{ en:'Zoom in ⤢', th:'ซูมเข้า ⤢' }, back:{ en:'← Back to the universe', th:'← กลับสู่จักรวาล' }, dbl:{ en:'Double-click a star to fly to it', th:'ดับเบิลคลิกดาวเพื่อบินเข้าไปดู' },
    agoNow:{ en:'now', th:'ล่าสุด' }, dAgo:{ en:'trading days ago', th:'วันทำการก่อน' }, chartT:{ en:'Price, last {n} trading days', th:'ราคา {n} วันทำการล่าสุด' },
    ma50:{ en:'50-day avg', th:'เส้นเฉลี่ย 50 วัน' }, ma200:{ en:'200-day avg', th:'เส้นเฉลี่ย 200 วัน' }, hi52:{ en:'52w high', th:'สูงสุด 52 สัปดาห์' }, lo52:{ en:'52w low', th:'ต่ำสุด 52 สัปดาห์' },
    fromLo:{ en:'From 52w low', th:'จากจุดต่ำสุด 52 สัปดาห์' }, fromHi:{ en:'From 52w high', th:'จากจุดสูงสุด 52 สัปดาห์' }, vsMa50:{ en:'vs 50-day avg', th:'เทียบเส้น 50 วัน' }, vsMa200:{ en:'vs 200-day avg', th:'เทียบเส้น 200 วัน' },
    vol:{ en:'Volatility (20d)', th:'ความผันผวน 20 วัน' }, roa:{ en:'ROA', th:'ROA' }, roic:{ en:'ROIC', th:'ROIC' }, debt:{ en:'Total debt', th:'หนี้รวม' },
    grpPrice:{ en:'Price & trend', th:'ราคาและแนวโน้ม' }, grpVal:{ en:'Valuation', th:'ความถูกแพง' }, grpQual:{ en:'Business quality', th:'คุณภาพธุรกิจ' },
    sub:{ en:'Stock universe', th:'จักรวาลหุ้น' }, day:{ en:'today', th:'วันนี้' }, r52:{ en:'52-week range', th:'ช่วงราคา 52 สัปดาห์' },
    roe:{ en:'ROE', th:'ROE' }, margin:{ en:'Margin', th:'อัตรากำไร' }, dy:{ en:'Div yield', th:'ปันผล' }, offHi:{ en:'from 52w high', th:'จากจุดสูงสุด 52 สัปดาห์' },
    above:{ en:'above 200-day avg', th:'เหนือเส้นเฉลี่ย 200 วัน' }, below:{ en:'below 200-day avg', th:'ใต้เส้นเฉลี่ย 200 วัน' },
    noData:{ en:'Market data is still loading…', th:'กำลังโหลดข้อมูลตลาด…' }
  };
  var SECT_TH = { 'Technology':'เทคโนโลยี', 'Financial Services':'การเงิน', 'Consumer Cyclical':'สินค้าฟุ่มเฟือย', 'Industrials':'อุตสาหกรรม', 'Healthcare':'สุขภาพ', 'Consumer Defensive':'สินค้าจำเป็น', 'Real Estate':'อสังหาฯ', 'Energy':'พลังงาน', 'Basic Materials':'วัตถุดิบ', 'Utilities':'สาธารณูปโภค', 'Communication Services':'สื่อสาร', 'Other':'อื่นๆ' };

  var REDUCED = false; try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var st = { mk:'all', col:'m1', spin:!REDUCED, rx:-0.38, ry:0, dist:1, sel:null, hover:null, q:'', orbit:0, tx:0, ty:0, tz:0, ox:0, oy:0 };
  var focus = null, camAnim = null, camWarp = 0, lastTap = { t:0, s:null };
  var sec = null, stage = null, cv = null, ctx = null, stars = [], galaxies = [], raf = 0, W = 0, H = 0, DPR = 1, sprites = {};
  var infall = [], jetSparks = [], flare = 0, nextFlare = 0, selT = 0, holoW = 300, holoH = 320, TRACES = null, holoSide = 1, holoAnchor = null;
  var sky = [], disk = [], planets = [], comets = [], streaks = [], flashes = [], nebula = null, tick = 0, warpT0 = 0, lastFrame = 0, fakeFs = false;
  var BH_R = 104, RING_R = 680;

  function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function mix(c1, c2, t){ return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))]; }
  /* momentum palette: red giant (falling) -> white dwarf (flat) -> blue giant (rising) */
  var C_DN2 = [255, 64, 118], C_DN1 = [255, 156, 128], C_MID = [236, 232, 255], C_UP1 = [138, 196, 255], C_UP2 = [64, 136, 255];
  function colorFor(v, kind){
    var t;
    if(kind === 'rsi') t = (v - 50) / 25; else t = v / (kind === 'm3' ? 20 : 10);
    if(isNaN(t)) t = 0;
    t = Math.max(-1, Math.min(1, t));
    if(t >= 0) return t < 0.5 ? mix(C_MID, C_UP1, t * 2) : mix(C_UP1, C_UP2, (t - 0.5) * 2);
    var u = -t; return u < 0.5 ? mix(C_MID, C_DN1, u * 2) : mix(C_DN1, C_DN2, (u - 0.5) * 2);
  }
  function sprite(rgb){
    var key = rgb.join(','); if(sprites[key]) return sprites[key];
    var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d');
    var gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.14, 'rgba(' + key + ',1)'); gr.addColorStop(0.38, 'rgba(' + key + ',.38)'); gr.addColorStop(0.7, 'rgba(' + key + ',.08)'); gr.addColorStop(1, 'rgba(' + key + ',0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    sprites[key] = c; return c;
  }

  /* ---------------- scene building ---------------- */
  function buildNebula(){
    var c = document.createElement('canvas'); c.width = 1600; c.height = 800; var x = c.getContext('2d');
    var cols = [[110, 40, 220], [40, 70, 200], [20, 160, 190], [200, 40, 140], [80, 30, 160]];
    var rnd = (function(seed){ return function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; })(7);
    for(var i = 0; i < 90; i++){
      var px = rnd() * 1600, py = 400 + (rnd() - 0.5) * 520 * (0.4 + rnd()), r = 60 + rnd() * 260, col = cols[Math.floor(rnd() * cols.length)];
      var g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(' + col + ',' + (0.05 + rnd() * 0.08).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
      if(px < r) { x.fillRect(px - r + 1600, py - r, r * 2, r * 2); }
      if(px > 1600 - r) { x.fillRect(px - r - 1600, py - r, r * 2, r * 2); }
    }
    /* dust lanes */
    x.globalCompositeOperation = 'destination-out';
    for(i = 0; i < 30; i++){
      var dx = rnd() * 1600, dy = 400 + (rnd() - 0.5) * 300, dr = 40 + rnd() * 120, dg = x.createRadialGradient(dx, dy, 0, dx, dy, dr);
      dg.addColorStop(0, 'rgba(0,0,0,.5)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = dg; x.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);
    }
    /* feather the top and bottom so the band never shows a hard edge */
    x.globalCompositeOperation = 'destination-in';
    var fg = x.createLinearGradient(0, 0, 0, 800); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(0.22, 'rgba(0,0,0,1)'); fg.addColorStop(0.78, 'rgba(0,0,0,1)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = fg; x.fillRect(0, 0, 1600, 800);
    nebula = c;
  }
  function buildSky(){
    var n = (W < 700 ? 900 : 1900);
    sky = [];
    for(var i = 0; i < n; i++){
      var u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      /* bias toward a galactic band */
      if(Math.random() < 0.45) u *= 0.22;
      s = Math.sqrt(1 - u * u);
      var tint = Math.random(), col = tint < 0.15 ? [255, 214, 170] : tint < 0.35 ? [170, 200, 255] : tint < 0.42 ? [210, 170, 255] : [235, 240, 255];
      sky.push({ x:Math.cos(a) * s, y:u, z:Math.sin(a) * s, m:Math.pow(Math.random(), 3), ph:Math.random() * 6.28, sp:0.5 + Math.random() * 2.5, c:col.join(','), rgb:'rgb(' + col.join(',') + ')' });
    }
  }
  function buildDisk(){
    var n = (W < 700 ? 650 : 1500);
    disk = [];
    for(var i = 0; i < n; i++){
      var r = BH_R * 1.35 + Math.pow(Math.random(), 1.6) * 470;
      disk.push({ r:r, a:Math.random() * Math.PI * 2, y:(Math.random() - 0.5) * (4 + r * 0.035), w:1.2 + Math.random() * 2.8 });
    }
  }
  function buildPlanets(){
    planets = [
      { r:1500, a:0.8, y:-260, rad:46, sp:0.00012, c1:[150, 210, 255], c2:[18, 40, 90], ring:false },
      { r:1900, a:2.9, y:180, rad:74, sp:0.00008, c1:[255, 190, 140], c2:[70, 25, 30], ring:true, rc:'255,214,170' },
      { r:1250, a:4.6, y:320, rad:30, sp:0.00016, c1:[205, 160, 255], c2:[40, 18, 80], ring:false },
      { r:2300, a:5.6, y:-520, rad:58, sp:0.00006, c1:[120, 255, 220], c2:[8, 50, 60], ring:true, rc:'170,240,255' }
    ];
  }
  function buildStars(){
    var snap = null; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    if(!snap || !snap.stocks) return false;
    var thb = (snap.fx && snap.fx.THB) || 33.5, S = snap.stocks, bySec = {}, k;
    for(k in S){
      var s = S[k]; if(!s || !s.mcap) continue;
      var secName = s.sector || 'Other';
      (bySec[secName] = bySec[secName] || []).push(k);
    }
    var names = Object.keys(bySec).sort(function(a, b){ return bySec[b].length - bySec[a].length; });
    galaxies = []; stars = [];
    names.forEach(function(n, gi){
      var ang = gi / names.length * Math.PI * 2, gy = (hash(n) - 0.5) * 240;
      var cx = Math.cos(ang) * RING_R, cz = Math.sin(ang) * RING_R, cy = gy;
      galaxies.push({ name:n, x:cx, y:cy - 175, z:cz, n:bySec[n].length });
      var tilt = hash(n + 't') * Math.PI;
      bySec[n].forEach(function(key, i){
        var s = S[key], usd = s.ccy === 'THB' ? s.mcap / thb : s.mcap;
        /* two-armed spiral: arm + distance + jitter */
        var rr = 22 + Math.pow(hash(key + 'r'), 0.75) * 160, arm = (i % 2) * Math.PI, a = arm + rr * 0.028 + (hash(key) - 0.5) * 0.9, h = (hash(key + 'h') - 0.5) * 34;
        var px = Math.cos(a) * rr, pz = Math.sin(a) * rr, py = h;
        var y2 = py * Math.cos(tilt) - pz * Math.sin(tilt), z2 = py * Math.sin(tilt) + pz * Math.cos(tilt);
        stars.push({ key:key, s:s, x:cx + px, y:cy + y2, z:cz + z2, size:Math.max(1.4, (Math.log10(Math.max(usd, 1e8)) - 8) * 2.6), mk:s.ccy === 'THB' ? 'th' : 'us', usd:usd, ph:hash(key + 'p') * 6.28 });
      });
    });
    return true;
  }

  /* ---------------- projection ---------------- */
  var CY = 1, SY = 0, CX = 1, SX = 0, KS = 1;
  function camPrep(){ CY = Math.cos(st.ry); SY = Math.sin(st.ry); CX = Math.cos(st.rx); SX = Math.sin(st.rx); KS = Math.min(W, H) / 900; }
  function project(x, y, z){
    x -= st.tx; y -= st.ty; z -= st.tz;
    var x1 = x * CY - z * SY, z1 = x * SY + z * CY;
    var y1 = y * CX - z1 * SX, z2 = y * SX + z1 * CX;
    var D = 1500 * st.dist, f = 900 / Math.max(60, D + z2);
    return { x:W / 2 + st.ox * W + x1 * f * KS, y:H / 2 + st.oy * H + y1 * f * KS, z:z2, f:f };
  }
  function orbitXZ(x, z){ var c = Math.cos(st.orbit), s = Math.sin(st.orbit); return [x * c - z * s, x * s + z * c]; }
  function visible(s){ return st.mk === 'all' || s.mk === st.mk; }

  /* ---------------- drawing ---------------- */
  function drawSky(warp){
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    var g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, 'rgba(10,6,20,.45)'); g.addColorStop(0.5, 'rgba(3,3,10,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* nebula band, parallax with the camera */
    if(nebula){
      var nh = H * 1.25, nw = nh * 2, off = ((-st.ry / (Math.PI * 2)) * nw) % nw; if(off > 0) off -= nw;
      var ny = H / 2 - nh / 2 + st.rx * H * 0.55;
      ctx.globalAlpha = 0.22; ctx.globalCompositeOperation = 'lighter';
      for(var xx = off; xx < W; xx += nw) ctx.drawImage(nebula, xx, ny, nw, nh);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'lighter';
    var fz = 900 * KS * 1.1, cx = W / 2, cy = H / 2;
    ctx.globalAlpha = 1;
    for(var i = 0; i < sky.length; i++){
      var s = sky[i];
      var x1 = s.x * CY - s.z * SY, z1 = s.x * SY + s.z * CY;
      var y1 = s.y * CX - z1 * SX, z2 = s.y * SX + z1 * CX;
      if(z2 < 0.05) continue; /* behind the camera (the camera looks toward +z) */
      var px = cx + x1 / z2 * fz, py = cy + y1 / z2 * fz;
      if(px < -4 || py < -4 || px > W + 4 || py > H + 4) continue;
      var tw = REDUCED ? 1 : 0.65 + 0.35 * Math.sin(tick * 0.02 * s.sp + s.ph);
      var a = (0.25 + s.m * 0.75) * tw, sz = 0.6 + s.m * 1.9;
      if(warp > 0){
        var dx = px - cx, dy = py - cy;
        ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(' + s.c + ',' + (a * 0.9).toFixed(2) + ')'; ctx.lineWidth = sz;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - dx * warp * 0.35, py - dy * warp * 0.35); ctx.stroke();
        continue;
      }
      ctx.globalAlpha = a; ctx.fillStyle = s.rgb;
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      if(s.m > 0.82){ ctx.globalAlpha = a * 0.35; ctx.fillRect(px - sz * 3, py - 0.4, sz * 6, 0.8); ctx.fillRect(px - 0.4, py - sz * 3, 0.8, sz * 6); }
    }
    ctx.globalAlpha = 1;
  }
  function diskColor(r){
    var t = Math.min(1, (r - BH_R * 1.35) / 470);
    var c = t < 0.15 ? mix([255, 250, 235], [255, 214, 140], t / 0.15) : t < 0.5 ? mix([255, 214, 140], [255, 120, 70], (t - 0.15) / 0.35) : mix([255, 120, 70], [190, 50, 160], (t - 0.5) / 0.5);
    return c.map(function(v){ return Math.round(v / 16) * 16; });
  }
  /* the accretion disk itself: concentric glowing rings in the y=0 plane, split
     into the half behind the hole and the half in front of it, with a swirl
     pattern that rotates faster near the centre and Doppler-brightening on the
     approaching side. The far half is also drawn a second time, bent over (and
     faintly under) the shadow -- the lensed image. */
  var RINGS = null;
  function ringsInit(){
    var nR = W < 700 ? 14 : 24, nS = W < 700 ? 44 : 72, rin = BH_R * 1.35, list = [];
    for(var i = 0; i < nR; i++){
      var u = i / (nR - 1), r = rin + Math.pow(u, 1.4) * 480, un = (i + 1) / (nR - 1), r2 = rin + Math.pow(Math.min(1, un), 1.4) * 480;
      list.push({ r:r, w:Math.max(6, r2 - r), c:diskColor(r).join(','), segs:nS, ph:Math.random() * 6.28 });
    }
    RINGS = list;
  }
  function drawRings(front, c0){
    if(!RINGS) ringsInit();
    var R = BH_R * c0.f * KS, rin = BH_R * 1.35, edge = Math.max(0, 1 - Math.abs(SX) * 1.25), farDir = SX < 0 ? 1 : -1, CH = 4;
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    for(var i = 0; i < RINGS.length; i++){
      var rg = RINGS[i], n = rg.segs, spin = tick * 0.012 * Math.pow(rin / rg.r, 1.5) * (REDUCED ? 0.2 : 1);
      var fade = Math.pow(Math.max(0, 1 - (rg.r - rin) / 500), 1.5), pts = [];
      for(var k = 0; k <= n; k++){ var a = k / n * Math.PI * 2; pts.push(project(Math.cos(a) * rg.r, 0, Math.sin(a) * rg.r)); }
      for(var c = 0; c < n; c += CH){
        var e = Math.min(n, c + CH), mid = pts[Math.floor((c + e) / 2)], am = (c + e) / 2 / n * Math.PI * 2;
        if(front ? mid.z > c0.z : mid.z <= c0.z) continue;
        var vx = -Math.sin(am), vz = Math.cos(am), toward = -(vx * SY + vz * CY) * CX;
        var swirl = 0.62 + 0.38 * Math.sin(am * 3 + rg.ph - spin * 9) * Math.sin(am * 7 - rg.ph * 2 - spin * 5);
        var al = fade * (0.28 + 0.72 * (0.5 + 0.5 * toward)) * swirl, m;
        ctx.strokeStyle = 'rgba(' + rg.c + ',' + Math.min(1, al * 0.42).toFixed(3) + ')';
        ctx.lineWidth = Math.max(1, rg.w * mid.f * KS * 0.95);
        ctx.beginPath(); ctx.moveTo(pts[c].x, pts[c].y); for(m = c + 1; m <= e; m++) ctx.lineTo(pts[m].x, pts[m].y); ctx.stroke();
        if(!front && edge > 0.05){
          var rr = rg.r * mid.f * KS, rho = R * 1.1 + (rg.r - rin) * mid.f * KS * 0.13;
          ctx.lineWidth = Math.max(1, rg.w * mid.f * KS * 0.5);
          for(var pass = 0; pass < 2; pass++){
            var dir = pass ? -farDir : farDir, sc = pass ? 0.9 : 1;
            ctx.strokeStyle = 'rgba(' + rg.c + ',' + Math.min(1, al * edge * (pass ? 0.22 : 0.85)).toFixed(3) + ')';
            ctx.beginPath();
            for(m = c; m <= e; m++){
              var sx = Math.max(-1, Math.min(1, (pts[m].x - c0.x) / rr)), sy = Math.sqrt(1 - sx * sx);
              var X = c0.x + rho * sc * sx, Y = c0.y + dir * rho * sc * sy;
              if(m === c) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
            }
            ctx.stroke();
          }
        }
      }
    }
  }
  /* one glowing ring in the disk plane, split into the half behind / in front of the hole */
  function diskRing(r, rgb, width, alpha, front, c0, segs){
    var n = segs || 72, pts = [], k;
    for(k = 0; k <= n; k++){ var a = k / n * Math.PI * 2; pts.push(project(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    for(var c = 0; c < n; c += 4){
      var e = Math.min(n, c + 4), mid = pts[Math.floor((c + e) / 2)], am = (c + e) / 2 / n * Math.PI * 2;
      if(front ? mid.z > c0.z : mid.z <= c0.z) continue;
      var vx = -Math.sin(am), vz = Math.cos(am), toward = -(vx * SY + vz * CY) * CX;
      ctx.strokeStyle = 'rgba(' + rgb + ',' + Math.min(1, alpha * (0.35 + 0.65 * (0.5 + 0.5 * toward))).toFixed(3) + ')';
      ctx.lineWidth = Math.max(0.8, width * mid.f * KS);
      ctx.beginPath(); ctx.moveTo(pts[c].x, pts[c].y); for(var m = c + 1; m <= e; m++) ctx.lineTo(pts[m].x, pts[m].y); ctx.stroke();
    }
  }
  function drawDiskPart(front, c0){
    var rin = BH_R * 1.35;
    drawRings(front, c0);
    /* white-hot inner edge (the last stable orbit) */
    diskRing(rin * 1.01, '255,236,200', 16, 0.22, front, c0);
    diskRing(rin * 1.01, '255,252,240', 3.5, 0.95, front, c0);
    /* orbiting clumps, motion-blurred along their orbit */
    ctx.lineCap = 'round';
    for(var i = 0; i < disk.length; i++){
      var d = disk[i];
      var p = project(Math.cos(d.a) * d.r, d.y, Math.sin(d.a) * d.r);
      if(front ? p.z > c0.z : p.z <= c0.z) continue;
      var tr = 0.05 + 0.22 * Math.pow(rin / d.r, 1.5), q = project(Math.cos(d.a - tr) * d.r, d.y, Math.sin(d.a - tr) * d.r);
      var vx = -Math.sin(d.a), vz = Math.cos(d.a), toward = -(vx * SY + vz * CY) * CX;
      var b = (0.35 + 0.75 * (0.5 + 0.5 * toward)) * (1 - (d.r - BH_R) / 720);
      ctx.globalAlpha = Math.max(0, Math.min(1, b));
      ctx.strokeStyle = d.cs || (d.cs = 'rgb(' + diskColor(d.r).join(',') + ')');
      ctx.lineWidth = Math.max(0.7, d.w * p.f * KS * 1.15);
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    /* matter spiralling in from the galaxies */
    for(i = 0; i < infall.length; i++){
      var f = infall[i], fp = project(Math.cos(f.a) * f.r, f.y, Math.sin(f.a) * f.r);
      if(front ? fp.z > c0.z : fp.z <= c0.z) continue;
      var ft = Math.min(0.35, f.w * 6), fq = project(Math.cos(f.a - ft) * f.r * 1.03, f.y * 1.05, Math.sin(f.a - ft) * f.r * 1.03);
      var heat = Math.min(1, rin / f.r);
      ctx.globalAlpha = Math.min(1, Math.pow(heat, 2) * 0.95) * Math.min(1, f.age / 40);
      ctx.strokeStyle = heat > 0.75 ? '#fff4e0' : heat > 0.5 ? '#ffc890' : '#ff8fb0';
      ctx.lineWidth = Math.max(0.5, (0.6 + heat * 1.8) * fp.f * KS);
      ctx.beginPath(); ctx.moveTo(fq.x, fq.y); ctx.lineTo(fp.x, fp.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function stepInfall(){
    var rin = BH_R * 1.35, n = W < 700 ? 40 : 90;
    while(infall.length < n) infall.push({ a:Math.random() * 6.28, r:300 + Math.random() * 220, y:(Math.random() - 0.5) * 60, w:0, age:Math.random() * 40 });
    for(var i = 0; i < infall.length; i++){
      var f = infall[i]; f.age++;
      f.w = 0.006 * Math.pow(rin / f.r, 1.5) * (REDUCED ? 0.2 : 1); f.a += f.w;
      f.r *= REDUCED ? 0.9995 : 0.9972; f.y *= 0.985;
      if(f.r < rin * 0.97){ f.a = Math.random() * 6.28; f.r = 330 + Math.random() * 190; f.y = (Math.random() - 0.5) * 60; f.age = 0; }
    }
  }
  function drawJets(cx, cy, R, top, bot, boost){
    var fl = (REDUCED ? 0.8 : 0.75 + 0.25 * Math.sin(tick * 0.11) * Math.sin(tick * 0.037)) * boost;
    [top, bot].forEach(function(e, ji){
      var jg = ctx.createLinearGradient(cx, cy, e.x, e.y);
      jg.addColorStop(0, 'rgba(180,210,255,' + Math.min(1, 0.36 * fl).toFixed(2) + ')'); jg.addColorStop(0.35, 'rgba(130,110,255,' + Math.min(1, 0.12 * fl).toFixed(2) + ')'); jg.addColorStop(1, 'rgba(80,60,255,0)');
      ctx.strokeStyle = jg; ctx.lineCap = 'round';
      ctx.lineWidth = R * 0.34; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e.x, e.y); ctx.stroke();
      ctx.lineWidth = R * 0.06; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e.x, e.y); ctx.stroke();
      /* plasma knots racing outward */
      var dx = e.x - cx, dy = e.y - cy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      var spr = sprite([170, 205, 255]);
      for(var k = 0; k < jetSparks.length; k++){
        var sp = jetSparks[k]; if(sp.j !== ji) continue;
        var t = sp.t, w = Math.sin(t * 18 + sp.ph) * R * 0.12 * (1 - t);
        var x = cx + dx * t + nx * w, y = cy + dy * t + ny * w, sz = (sp.s * (1 - t * 0.6)) * KS * (0.6 + 0.4 * top.f);
        ctx.globalAlpha = Math.min(1, (1 - t) * fl);
        ctx.drawImage(spr, x - sz, y - sz, sz * 2, sz * 2);
      }
      ctx.globalAlpha = 1;
    });
  }
  function drawBlackHole(c0){
    var R = BH_R * c0.f * KS, cx = c0.x, cy = c0.y, pulse = REDUCED ? 1 : 1 + 0.035 * Math.sin(tick * 0.03), now = performance.now();
    var fu = flare ? Math.min(1, (now - flare) / 2600) : 1, boost = 1 + 1.6 * Math.pow(1 - fu, 2);
    ctx.globalCompositeOperation = 'lighter';
    /* deep halo */
    var g = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 8 * pulse);
    g.addColorStop(0, 'rgba(255,170,90,' + (0.34 * boost).toFixed(2) + ')'); g.addColorStop(0.16, 'rgba(230,110,90,.12)'); g.addColorStop(0.4, 'rgba(120,50,90,.04)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - R * 8.5, cy - R * 8.5, R * 17, R * 17);
    drawJets(cx, cy, R, project(0, -800, 0), project(0, 800, 0), boost);
    /* back half of the accretion disk (and its lensed image) */
    drawDiskPart(false, c0);
    /* photon ring with a hot spot racing around it */
    var rg = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.5 * pulse);
    rg.addColorStop(0, 'rgba(255,240,210,.95)'); rg.addColorStop(0.1, 'rgba(255,190,120,.5)'); rg.addColorStop(0.45, 'rgba(230,110,150,.14)'); rg.addColorStop(1, 'rgba(120,60,200,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,235,.95)'; ctx.lineWidth = Math.max(1, R * 0.03);
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2); ctx.stroke();
    var hs = (REDUCED ? 0 : tick * 0.045);
    for(var h = 0; h < 2; h++){
      var a0 = hs + h * Math.PI;
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1.5, R * 0.05);
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.05, a0, a0 + 0.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,200,140,.35)'; ctx.lineWidth = Math.max(4, R * 0.16);
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.07, a0 - 0.1, a0 + 0.7); ctx.stroke();
    }
    /* event horizon */
    ctx.globalCompositeOperation = 'source-over';
    var sg = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.03);
    sg.addColorStop(0, '#000'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.03, 0, Math.PI * 2); ctx.fill();
    /* near half of the disk crosses in front of the shadow */
    ctx.globalCompositeOperation = 'lighter';
    drawDiskPart(true, c0);
    /* flare: a shock wave rolls out through the disk and the jets flash */
    if(flare && fu < 1){
      var rad = BH_R * 1.4 + fu * 1100, pts = [];
      for(var k = 0; k <= 72; k++){ var a = k / 72 * Math.PI * 2; pts.push(project(Math.cos(a) * rad, 0, Math.sin(a) * rad)); }
      ctx.strokeStyle = 'rgba(170,230,255,' + (0.55 * (1 - fu)).toFixed(3) + ')'; ctx.lineWidth = 2 + 8 * (1 - fu);
      ctx.beginPath(); pts.forEach(function(pt, n){ if(n) ctx.lineTo(pt.x, pt.y); else ctx.moveTo(pt.x, pt.y); }); ctx.stroke();
      var fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 5);
      fg.addColorStop(0, 'rgba(255,240,220,' + (0.45 * Math.pow(1 - fu, 3)).toFixed(3) + ')'); fg.addColorStop(1, 'rgba(255,240,220,0)');
      ctx.fillStyle = fg; ctx.fillRect(cx - R * 5, cy - R * 5, R * 10, R * 10);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  function drawPlanet(p, pl){
    var R = pl.rad * p.f * KS; if(R < 1) return;
    var lx = -0.5, ly = -0.45; /* lit from the black hole glow, roughly */
    if(pl.ring){
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-0.35);
      ctx.strokeStyle = 'rgba(' + pl.rc + ',.35)'; ctx.lineWidth = R * 0.22;
      ctx.beginPath(); ctx.ellipse(0, 0, R * 2.1, R * 0.55, 0, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    var g = ctx.createRadialGradient(p.x + lx * R, p.y + ly * R, R * 0.1, p.x, p.y, R * 1.05);
    g.addColorStop(0, 'rgb(' + pl.c1 + ')'); g.addColorStop(0.55, 'rgb(' + mix(pl.c1, pl.c2, 0.6) + ')'); g.addColorStop(1, 'rgb(' + pl.c2 + ')');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill();
    /* atmosphere rim */
    ctx.strokeStyle = 'rgba(' + pl.c1 + ',.35)'; ctx.lineWidth = Math.max(1, R * 0.08); ctx.beginPath(); ctx.arc(p.x, p.y, R * 1.02, 0, Math.PI * 2); ctx.stroke();
    if(pl.ring){
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-0.35);
      ctx.strokeStyle = 'rgba(' + pl.rc + ',.55)'; ctx.lineWidth = R * 0.22;
      ctx.beginPath(); ctx.ellipse(0, 0, R * 2.1, R * 0.55, 0, 0, Math.PI); ctx.stroke();
      ctx.strokeStyle = 'rgba(' + pl.rc + ',.25)'; ctx.lineWidth = R * 0.08;
      ctx.beginPath(); ctx.ellipse(0, 0, R * 2.5, R * 0.66, 0, 0, Math.PI); ctx.stroke();
      ctx.restore();
    }
  }
  function spawnComet(c0){
    var side = Math.floor(Math.random() * 4), x, y;
    if(side === 0){ x = -40; y = Math.random() * H; } else if(side === 1){ x = W + 40; y = Math.random() * H; } else if(side === 2){ x = Math.random() * W; y = -40; } else { x = Math.random() * W; y = H + 40; }
    var tx = c0.x + (Math.random() - 0.5) * W * 0.5, ty = c0.y + (Math.random() - 0.5) * H * 0.5, d = Math.hypot(tx - x, ty - y), sp = 3 + Math.random() * 3;
    comets.push({ x:x, y:y, vx:(tx - x) / d * sp, vy:(ty - y) / d * sp, tr:[], hue:Math.random() < 0.5 ? '150,230,255' : '200,170,255', life:0 });
  }
  function drawComets(c0){
    var R = BH_R * c0.f * KS;
    if(!REDUCED && comets.length < 3 && Math.random() < 0.006) spawnComet(c0);
    if(!REDUCED && streaks.length < 2 && Math.random() < 0.01){
      var a = Math.random() * Math.PI * 2; streaks.push({ x:Math.random() * W, y:Math.random() * H * 0.7, vx:Math.cos(a) * 14, vy:Math.abs(Math.sin(a)) * 9, t:0 });
    }
    ctx.globalCompositeOperation = 'lighter';
    for(var i = comets.length - 1; i >= 0; i--){
      var c = comets[i], dx = c0.x - c.x, dy = c0.y - c.y, d = Math.max(20, Math.hypot(dx, dy)), G = 2600 * (R / 40);
      c.vx += dx / d * G / (d * d); c.vy += dy / d * G / (d * d); c.x += c.vx; c.y += c.vy; c.life++;
      c.tr.push([c.x, c.y]); if(c.tr.length > 46) c.tr.shift();
      if(d < R * 1.15){ flashes.push({ x:c0.x, y:c0.y, t:0, R:R }); comets.splice(i, 1); continue; }
      if(c.life > 900 || c.x < -200 || c.y < -200 || c.x > W + 200 || c.y > H + 200){ comets.splice(i, 1); continue; }
      for(var k = 1; k < c.tr.length; k++){
        var a = k / c.tr.length;
        ctx.strokeStyle = 'rgba(' + c.hue + ',' + (a * a * 0.7).toFixed(3) + ')'; ctx.lineWidth = 0.5 + a * 3.2;
        ctx.beginPath(); ctx.moveTo(c.tr[k - 1][0], c.tr[k - 1][1]); ctx.lineTo(c.tr[k][0], c.tr[k][1]); ctx.stroke();
      }
      ctx.drawImage(sprite([230, 245, 255]), c.x - 12, c.y - 12, 24, 24);
    }
    for(i = streaks.length - 1; i >= 0; i--){
      var s = streaks[i]; s.t++; s.x += s.vx; s.y += s.vy;
      var al = Math.sin(Math.min(1, s.t / 40) * Math.PI);
      var lg = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 7, s.y - s.vy * 7);
      lg.addColorStop(0, 'rgba(255,255,255,' + (0.9 * al).toFixed(2) + ')'); lg.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.strokeStyle = lg; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 7, s.y - s.vy * 7); ctx.stroke();
      if(s.t > 40) streaks.splice(i, 1);
    }
    for(i = flashes.length - 1; i >= 0; i--){
      var f = flashes[i]; f.t++;
      var rr = f.R * (1.1 + f.t * 0.09), al2 = Math.max(0, 1 - f.t / 45);
      ctx.strokeStyle = 'rgba(255,230,190,' + (0.8 * al2).toFixed(2) + ')'; ctx.lineWidth = 2 + 6 * al2;
      ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, Math.PI * 2); ctx.stroke();
      if(f.t > 45) flashes.splice(i, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  /* the star we flew to: a full-size sun with corona, rotating rays and an orbit HUD */
  function drawHero(s, rgb, r0){
    var p = s.p, g = Math.min(1, (performance.now() - focus.t0) / 1500), e = 1 - Math.pow(1 - g, 3);
    var R = lerp(r0, Math.min(H * 0.17, 150), e), col = rgb.join(','), t = REDUCED ? 0 : tick;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var cg = ctx.createRadialGradient(p.x, p.y, R * 0.2, p.x, p.y, R * 3.2);
    cg.addColorStop(0, 'rgba(' + col + ',.4)'); cg.addColorStop(0.25, 'rgba(' + col + ',.18)'); cg.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = cg; ctx.fillRect(p.x - R * 3.2, p.y - R * 3.2, R * 6.4, R * 6.4);
    /* slowly turning light rays */
    for(var k = 0; k < 12; k++){
      var a = k / 12 * Math.PI * 2 + t * 0.002 * (k % 2 ? 1 : -1.4), len = R * (1.6 + 0.9 * Math.sin(k * 2.3 + t * 0.01));
      var lg = ctx.createLinearGradient(p.x, p.y, p.x + Math.cos(a) * len, p.y + Math.sin(a) * len);
      lg.addColorStop(0, 'rgba(' + col + ',.5)'); lg.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.strokeStyle = lg; ctx.lineWidth = k % 3 ? 1.2 : 2.4;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a) * len, p.y + Math.sin(a) * len); ctx.stroke();
    }
    /* body: hot white core fading to the star's colour, with a shimmering surface */
    var bg = ctx.createRadialGradient(p.x - R * 0.2, p.y - R * 0.2, 0, p.x, p.y, R);
    bg.addColorStop(0, 'rgba(255,255,255,.95)'); bg.addColorStop(0.22, 'rgba(' + col + ',.95)'); bg.addColorStop(0.85, 'rgba(' + col + ',.55)'); bg.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill();
    for(var j = 0; j < 3; j++){
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.12 + 0.06 * Math.sin(t * 0.05 + j)).toFixed(3) + ')'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, R * (0.55 + j * 0.13), R * (0.5 + j * 0.12), t * 0.004 + j, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    /* orbit HUD rings */
    ctx.translate(p.x, p.y);
    ctx.save(); ctx.rotate(t * 0.006); ctx.strokeStyle = 'rgba(140,230,255,' + (0.7 * e).toFixed(2) + ')'; ctx.lineWidth = 1.4;
    for(var q = 0; q < 6; q++){ ctx.beginPath(); ctx.arc(0, 0, R * 1.35, q * Math.PI / 3 + 0.12, q * Math.PI / 3 + Math.PI / 3 - 0.12); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.rotate(-t * 0.004); ctx.strokeStyle = 'rgba(190,150,255,' + (0.45 * e).toFixed(2) + ')'; ctx.setLineDash([2, 6]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.55, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.font = '800 ' + Math.round(Math.max(18, R * 0.32)) + 'px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(235,248,255,' + e.toFixed(2) + ')'; ctx.fillText(s.key, 0, R * 1.55 + Math.max(18, R * 0.32) + 10);
    ctx.restore();
    s.r = R;
  }
  function drawStar(s, q){
    var v = st.col === 'rsi' ? s.s.rsi : s.s[st.col];
    var rgb = colorFor(+v, st.col).map(function(c){ return Math.round(c / 12) * 12; });
    var tw = REDUCED ? 1 : 0.9 + 0.1 * Math.sin(tick * 0.05 + s.ph);
    var r = Math.min(70, s.size * s.p.f * KS * 3.4 * tw);
    if(focus && focus.s === s){ drawHero(s, rgb, r); return; }
    var hit = q && (s.key.indexOf(q) === 0 || String(s.s.name || '').toUpperCase().indexOf(q) !== -1);
    if(q && !hit) ctx.globalAlpha = 0.2;
    ctx.drawImage(sprite(rgb), s.p.x - r, s.p.y - r, r * 2, r * 2);
    if(r > 16){
      /* diffraction spikes on the biggest stars */
      var len = r * 1.6, col = 'rgba(' + rgb.join(',') + ',';
      var hg = ctx.createLinearGradient(s.p.x - len, 0, s.p.x + len, 0); hg.addColorStop(0, col + '0)'); hg.addColorStop(0.5, col + '.55)'); hg.addColorStop(1, col + '0)');
      ctx.fillStyle = hg; ctx.fillRect(s.p.x - len, s.p.y - 0.6, len * 2, 1.2);
      var vg = ctx.createLinearGradient(0, s.p.y - len, 0, s.p.y + len); vg.addColorStop(0, col + '0)'); vg.addColorStop(0.5, col + '.55)'); vg.addColorStop(1, col + '0)');
      ctx.fillStyle = vg; ctx.fillRect(s.p.x - 0.6, s.p.y - len, 1.2, len * 2);
    }
    ctx.globalAlpha = 1;
    s.r = r;
  }
  function draw(now){
    raf = requestAnimationFrame(draw);
    if(!cv || !sec || location.hash !== '#/universe' || document.hidden) return;
    /* keep the canvas matched to its box (the section may have been hidden when it was built) */
    var br = stage.getBoundingClientRect();
    if(br.width < 10 || br.height < 10) return;
    if(Math.abs(br.width - W) > 1 || Math.abs(br.height - H) > 1) resize();
    if(!stars.length) buildStars();
    tick++;
    if(st.spin && !st.dragging) st.ry += 0.0012;
    if(!REDUCED && !focus && !camAnim) st.orbit += 0.00035;
    stepCam(now);
    planets.forEach(function(pl){ pl.a += pl.sp * (REDUCED ? 0 : 1); });
    disk.forEach(function(d){ d.a += (REDUCED ? 0.2 : 1) * 0.9 * Math.pow(BH_R * 1.35 / d.r, 1.5) * 0.02; });
    stepInfall();
    if(!jetSparks.length) for(var js = 0; js < (W < 700 ? 24 : 56); js++) jetSparks.push({ j:js % 2, t:Math.random(), v:0.003 + Math.random() * 0.008, s:2 + Math.random() * 4, ph:Math.random() * 6.28 });
    jetSparks.forEach(function(sp){ sp.t += sp.v * (REDUCED ? 0.2 : 1); if(sp.t > 1){ sp.t = 0; sp.ph = Math.random() * 6.28; } });
    if(!REDUCED){ if(!nextFlare) nextFlare = now + 6000; if(now > nextFlare){ flare = now; nextFlare = now + 11000 + Math.random() * 9000; } }
    /* intro warp: fly in from far away */
    var warp = 0;
    if(warpT0){
      var u = Math.min(1, (now - warpT0) / 1700), e = 1 - Math.pow(1 - u, 3);
      st.dist = lerp(2.6, st.distTarget || 1, e); warp = u < 1 ? (1 - u) : 0;
      if(u >= 1) warpT0 = 0;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    camPrep();
    drawSky(Math.max(warp, camWarp));
    var c0 = project(0, 0, 0);
    var list = [];
    stars.forEach(function(s){
      if(!visible(s)) return;
      var o = orbitXZ(s.x, s.z); s.wx = o[0]; s.wz = o[1];
      var p = project(s.wx, s.y, s.wz); if(p.z < -1300) return; s.p = p; list.push({ k:'s', z:p.z, o:s });
    });
    planets.forEach(function(pl){ var p = project(Math.cos(pl.a) * pl.r, pl.y, Math.sin(pl.a) * pl.r); if(p.z > -1300) list.push({ k:'p', z:p.z, o:pl, p:p }); });
    list.push({ k:'bh', z:c0.z });
    list.sort(function(a, b){ return b.z - a.z; });
    var q = st.q.trim().toUpperCase(), stList = [];
    for(var i = 0; i < list.length; i++){
      var it = list[i];
      if(it.k === 'bh'){ drawBlackHole(c0); continue; }
      if(it.k === 'p'){ ctx.globalCompositeOperation = 'source-over'; drawPlanet(it.p, it.o); continue; }
      ctx.globalCompositeOperation = 'lighter'; drawStar(it.o, q); stList.push(it.o);
    }
    ctx.globalCompositeOperation = 'source-over';
    drawComets(c0);
    /* galaxy labels */
    var fs = Math.round(11 * Math.max(.85, Math.min(1.35, 1 / st.dist)));
    ctx.font = '700 ' + fs + 'px Inter, "Noto Sans Thai", sans-serif'; ctx.textAlign = 'center';
    if(!focus) galaxies.forEach(function(gx){
      var o = orbitXZ(gx.x, gx.z), p = project(o[0], gx.y, o[1]); if(p.z < -1200) return;
      if(p.z > c0.z && Math.hypot(p.x - c0.x, p.y - c0.y) < BH_R * c0.f * KS * 1.7) return; /* hidden behind the black hole */
      var a = Math.max(.3, Math.min(.9, p.f)).toFixed(2), label = (L() === 'th' ? (SECT_TH[gx.name] || gx.name) : gx.name.toUpperCase());
      ctx.fillStyle = 'rgba(190,175,255,' + a + ')'; ctx.fillText(label, p.x, p.y);
      ctx.font = '500 ' + Math.max(9, fs - 2) + 'px "IBM Plex Mono", monospace'; ctx.fillStyle = 'rgba(140,200,255,' + (a * 0.8).toFixed(2) + ')';
      ctx.fillText(gx.n + ' ' + T(U.stars), p.x, p.y + fs + 2);
      ctx.font = '700 ' + fs + 'px Inter, "Noto Sans Thai", sans-serif';
    });
    /* black hole caption when zoomed in */
    if(st.dist < 0.75){ ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.fillStyle = 'rgba(255,214,170,.7)'; ctx.fillText(T(U.bh), c0.x, c0.y + BH_R * c0.f * KS * 2.1 + 14); }
    /* labels for the biggest / matched / hovered stars */
    ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
    var big = stList.filter(function(s){ return s.r > 24; }).sort(function(a, b){ return b.r - a.r; }).slice(0, 14);
    stList.forEach(function(s){
      if(focus) return;
      var show = s === st.hover || s === st.sel || (q && q.length >= 2 && s.key.indexOf(q) === 0) || big.indexOf(s) !== -1;
      if(!show) return;
      ctx.fillStyle = s === st.sel ? '#9fe7ff' : 'rgba(235,240,255,.88)';
      ctx.fillText(s.key, s.p.x + s.r * 0.45, s.p.y - s.r * 0.35);
    });
    var showSel = st.sel && st.sel.p && visible(st.sel) && st.sel.p.z > -1300;
    if(showSel && !focus && !camAnim){ placeHolo(st.sel); drawReticle(st.sel, now); }
    else hideHolo();
  }
  /* ---------- selection HUD: a circuit-board reticle around the star, a
     leader line, and a holographic data panel that floats next to the star
     and keeps facing the viewer while the universe turns ---------- */
  function makeTraces(key){
    var out = [], n = 7, seed = hash(key || 'x');
    function rnd(k){ return hash(key + ':' + k); }
    for(var i = 0; i < n; i++){
      var a = (i / n) * Math.PI * 2 + seed * 6.28 + (rnd(i) - 0.5) * 0.5;
      var l1 = 14 + rnd(i + 'a') * 22, turn = (rnd(i + 'b') < 0.5 ? -1 : 1) * Math.PI / 4, l2 = 12 + rnd(i + 'c') * 30;
      var pts = [[Math.cos(a), Math.sin(a), 0]];
      var x = Math.cos(a) * l1, y = Math.sin(a) * l1; pts.push([Math.cos(a), Math.sin(a), l1]);
      var b = a + turn, x2 = x + Math.cos(b) * l2, y2 = y + Math.sin(b) * l2;
      out.push({ a:a, l1:l1, b:b, l2:l2, node:rnd(i + 'd') < 0.6, br:rnd(i + 'e') < 0.35 ? (b + (turn > 0 ? -1 : 1) * Math.PI / 2) : null });
    }
    return out;
  }
  function drawReticle(s, now){
    var p = s.p, rr = Math.max(14, s.r * 0.6), age = Math.max(0, Math.min(1, (now - selT) / 700)), e = 1 - Math.pow(1 - age, 3);
    if(!TRACES || TRACES.key !== s.key){ TRACES = makeTraces(s.key); TRACES.key = s.key; }
    ctx.save(); ctx.translate(p.x, p.y); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var C1 = 'rgba(120,230,255,', C2 = 'rgba(190,150,255,';
    /* inner glow */
    var gg = ctx.createRadialGradient(0, 0, 0, 0, 0, rr * 2.4); gg.addColorStop(0, 'rgba(120,220,255,.16)'); gg.addColorStop(1, 'rgba(120,220,255,0)');
    ctx.fillStyle = gg; ctx.fillRect(-rr * 2.4, -rr * 2.4, rr * 4.8, rr * 4.8);
    /* segmented ring */
    ctx.save(); ctx.rotate(tick * 0.012);
    ctx.strokeStyle = C1 + '.95)'; ctx.lineWidth = 1.8;
    for(var q = 0; q < 4; q++){ ctx.beginPath(); ctx.arc(0, 0, rr * e, q * Math.PI / 2 + 0.18, q * Math.PI / 2 + Math.PI / 2 - 0.18); ctx.stroke(); }
    ctx.restore();
    /* counter-rotating tick ring */
    ctx.save(); ctx.rotate(-tick * 0.02);
    ctx.strokeStyle = C2 + '.6)'; ctx.lineWidth = 1;
    for(var t = 0; t < 36; t++){
      var ta = t / 36 * Math.PI * 2, l = t % 3 === 0 ? 7 : 3, r0 = (rr + 8) * e;
      ctx.beginPath(); ctx.moveTo(Math.cos(ta) * r0, Math.sin(ta) * r0); ctx.lineTo(Math.cos(ta) * (r0 + l), Math.sin(ta) * (r0 + l)); ctx.stroke();
    }
    ctx.restore();
    /* corner brackets */
    var bq = (rr + 22) * e + Math.sin(tick * 0.08) * 1.5, bl = 9;
    ctx.strokeStyle = C1 + '.85)'; ctx.lineWidth = 1.6;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function(c){
      ctx.beginPath(); ctx.moveTo(c[0] * bq, c[1] * (bq - bl)); ctx.lineTo(c[0] * bq, c[1] * bq); ctx.lineTo(c[0] * (bq - bl), c[1] * bq); ctx.stroke();
    });
    /* circuit traces with nodes and running pulses */
    var base = rr + 4;
    TRACES.forEach(function(tr, i){
      var x0 = Math.cos(tr.a) * base, y0 = Math.sin(tr.a) * base;
      var x1 = x0 + Math.cos(tr.a) * tr.l1, y1 = y0 + Math.sin(tr.a) * tr.l1;
      var x2 = x1 + Math.cos(tr.b) * tr.l2, y2 = y1 + Math.sin(tr.b) * tr.l2;
      var total = tr.l1 + tr.l2, shown = total * Math.min(1, Math.max(0, e * 1.4 - i * 0.05));
      ctx.strokeStyle = C1 + '.55)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x0, y0);
      if(shown <= tr.l1){ ctx.lineTo(x0 + Math.cos(tr.a) * shown, y0 + Math.sin(tr.a) * shown); ctx.stroke(); return; }
      ctx.lineTo(x1, y1); var s2 = shown - tr.l1; ctx.lineTo(x1 + Math.cos(tr.b) * s2, y1 + Math.sin(tr.b) * s2); ctx.stroke();
      if(tr.br != null){ ctx.strokeStyle = C2 + '.45)'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + Math.cos(tr.br) * 10 * e, y1 + Math.sin(tr.br) * 10 * e); ctx.stroke(); }
      if(e > 0.95){
        ctx.fillStyle = C1 + '.9)';
        if(tr.node){ ctx.beginPath(); ctx.arc(x2, y2, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C1 + '.5)'; ctx.beginPath(); ctx.arc(x2, y2, 4.5, 0, Math.PI * 2); ctx.stroke(); }
        else ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
        /* pulse running outward along the trace */
        var ph = ((tick * 0.9 + i * 17) % (total + 20)) ; if(ph < total){
          var px, py; if(ph < tr.l1){ px = x0 + Math.cos(tr.a) * ph; py = y0 + Math.sin(tr.a) * ph; } else { px = x1 + Math.cos(tr.b) * (ph - tr.l1); py = y1 + Math.sin(tr.b) * (ph - tr.l1); }
          ctx.drawImage(sprite([140, 235, 255]), px - 5, py - 5, 10, 10);
        }
      }
    });
    ctx.restore();
    /* leader line to the panel: diagonal out of the reticle, then level into the panel */
    if(holoAnchor){
      var ax = holoAnchor[0], ay = holoAnchor[1], kx = ax - holoSide * 26, ky = ay;
      var dx = kx - p.x, dy = ky - p.y, dl = Math.hypot(dx, dy) || 1, sx = p.x + dx / dl * (rr + 26), sy = p.y + dy / dl * (rr + 26);
      var segA = Math.hypot(kx - sx, ky - sy), segB = Math.abs(ax - kx), tot = segA + segB, sh = tot * Math.min(1, Math.max(0, (now - selT - 250) / 450));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for(var pass = 0; pass < 2; pass++){
        ctx.strokeStyle = pass ? 'rgba(160,240,255,.95)' : 'rgba(120,200,255,.25)'; ctx.lineWidth = pass ? 1.3 : 5;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        if(sh <= segA) ctx.lineTo(sx + (kx - sx) * sh / segA, sy + (ky - sy) * sh / segA);
        else { ctx.lineTo(kx, ky); ctx.lineTo(kx + (ax - kx) * (sh - segA) / Math.max(1, segB), ky); }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(160,240,255,.95)'; ctx.beginPath(); ctx.arc(sx, sy, 2.6, 0, Math.PI * 2); ctx.fill();
      if(sh >= tot - 1){
        ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -3, 6, 6); ctx.restore();
        var pp = (tick * 2.2) % tot, qx, qy;
        if(pp < segA){ qx = sx + (kx - sx) * pp / segA; qy = sy + (ky - sy) * pp / segA; } else { qx = kx + (ax - kx) * (pp - segA) / Math.max(1, segB); qy = ky; }
        ctx.drawImage(sprite([170, 245, 255]), qx - 7, qy - 7, 14, 14);
      }
      ctx.restore();
    }
  }
  function hideHolo(){ var box = sec && sec.querySelector('[data-un="card"]'); if(box && box.classList.contains('on')){ box.style.visibility = 'hidden'; } holoAnchor = null; }
  function placeHolo(s){
    var box = sec.querySelector('[data-un="card"]'); if(!box || !box.classList.contains('on')) { holoAnchor = null; return; }
    box.style.visibility = '';
    var p = s.p, gap = Math.max(70, s.r * 0.6 + 60), w = holoW, h = holoH, x, y, side;
    var right = p.x + gap + w <= W - 12, left = p.x - gap - w >= 12;
    if(right || left){
      side = right && (!left || p.x < W * 0.6) ? 1 : -1;
      x = side > 0 ? p.x + gap : p.x - gap - w;
      y = Math.max(64, Math.min(H - h - 56, p.y - h * 0.32));
      holoAnchor = [side > 0 ? x : x + w, Math.max(y + 24, Math.min(y + h - 24, p.y - 20))];
    } else {
      /* narrow screens: dock the panel at the bottom and run the line down to it */
      side = 1; w = Math.min(w, W - 20); x = Math.max(10, Math.min(W - w - 10, p.x - w / 2)); y = p.y < H * 0.5 ? H - h - 50 : 60;
      holoAnchor = [Math.max(x + 20, Math.min(x + w - 20, p.x)), p.y < H * 0.5 ? y : y + h];
      holoSide = 0;
    }
    if(side !== 0 && (right || left)) holoSide = side;
    var ry = holoSide ? -holoSide * 9 : 0, rx = ((p.y - H / 2) / H) * 8, bob = REDUCED ? 0 : Math.sin(tick * 0.03) * 2;
    box.style.transformOrigin = holoSide > 0 ? 'left center' : holoSide < 0 ? 'right center' : 'center';
    box.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y + bob) + 'px,0) perspective(900px) rotateY(' + ry.toFixed(1) + 'deg) rotateX(' + rx.toFixed(1) + 'deg)';
  }
  function resize(){
    if(!cv || !stage) return;
    var r = stage.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
    var nw = Math.max(300, Math.round(r.width)), nh = Math.max(360, Math.round(r.height)), grew = (nw > W * 1.3);
    W = nw; H = nh;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if(!sky.length || grew) buildSky();
    if(!disk.length) buildDisk();
    if(focus) setTimeout(renderFocusChart, 30);
  }
  function pick(px, py){
    var best = null, bd = 1e9;
    stars.forEach(function(s){ if(!s.p || !visible(s)) return; var d = Math.hypot(s.p.x - px, s.p.y - py); var lim = Math.max(10, s.r * 0.5); if(d < lim && d < bd){ bd = d; best = s; } });
    return best;
  }
  function fmtCap(usd){ return usd >= 1e12 ? (usd / 1e12).toFixed(2) + 'T' : usd >= 1e9 ? (usd / 1e9).toFixed(1) + 'B' : (usd / 1e6).toFixed(0) + 'M'; }
  function spark(cs){
    var v = String(cs || '').split(',').map(Number).filter(function(x){ return !isNaN(x) && x > 0; });
    if(v.length < 5) return '';
    v = v.slice(-130);
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), rg = mx - mn || 1, W2 = 260, H2 = 46;
    var pts = v.map(function(x, i){ return (i / (v.length - 1) * W2).toFixed(1) + ',' + (H2 - (x - mn) / rg * (H2 - 4) - 2).toFixed(1); });
    var up = v[v.length - 1] >= v[0];
    return '<svg class="uh-spark" viewBox="0 0 ' + W2 + ' ' + H2 + '" preserveAspectRatio="none"><defs><linearGradient id="uhg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + (up ? '#6fb8ff' : '#ff6f9f') + '" stop-opacity=".45"/><stop offset="1" stop-color="' + (up ? '#6fb8ff' : '#ff6f9f') + '" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="0,' + H2 + ' ' + pts.join(' ') + ' ' + W2 + ',' + H2 + '" fill="url(#uhg)"/><polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (up ? '#8fd0ff' : '#ff8fb4') + '" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>';
  }
  function card(){
    var box = sec.querySelector('[data-un="card"]'); if(!box) return;
    var s = st.sel; if(!s){ box.innerHTML = ''; box.className = 'un-card un-holo'; box.style.transform = ''; holoAnchor = null; return; }
    var d = s.s, nm = String(d.name || '').replace(/^[A-Z0-9]+_/, '');
    function num(v, dp, suf){ return v == null || isNaN(v) ? '—' : Number(v).toFixed(dp) + (suf || ''); }
    function pc(v){ return v == null || isNaN(v) ? '—' : (v > 0 ? '+' : '') + Number(v).toFixed(1) + '%'; }
    function cls(v){ return v == null ? '' : v >= 0 ? 'up' : 'dn'; }
    var lo = +d.lo52, hi = +d.hi52, pos = (hi > lo) ? Math.max(0, Math.min(100, (d.price - lo) / (hi - lo) * 100)) : 50;
    var sect = L() === 'th' ? (SECT_TH[d.sector] || d.sector || '') : (d.sector || '');
    var cells = [['P/E', num(d.pe, 1), ''], ['P/B', num(d.pb, 1), ''], ['D/E', num(d.de, 2), ''], [T(U.roe), num(d.roe, 1, '%'), ''], [T(U.margin), num(d.margin, 1, '%'), ''], [T(U.dy), num(d.div, 2, '%'), ''],
      ['1M', pc(d.m1), cls(d.m1)], ['3M', pc(d.m3), cls(d.m3)], ['RSI', num(d.rsi, 0), d.rsi >= 70 ? 'dn' : d.rsi <= 30 ? 'up' : '']];
    box.className = 'un-card un-holo on' + (W < 640 ? ' compact' : '');
    box.innerHTML = '<i class="uh-c tl"></i><i class="uh-c tr"></i><i class="uh-c bl"></i><i class="uh-c br"></i><i class="uh-scan"></i>' +
      '<div class="uh-top"><div><b>' + esc(s.key) + '</b><span>' + esc(nm) + '</span></div><button type="button" class="un-x" data-un-act="close" aria-label="' + esc(T(U.close)) + '">×</button></div>' +
      '<div class="uh-sec">' + esc(sect) + (d.industry ? ' · ' + esc(d.industry) : '') + ' · ' + esc(T(U.mcap)) + ' $' + fmtCap(s.usd) + '</div>' +
      '<div class="uh-px"><strong>' + esc(d.price) + '</strong><em>' + esc(d.ccy) + '</em><span class="' + cls(d.chg_pct) + '">' + pc(d.chg_pct) + ' ' + esc(T(U.day)) + '</span></div>' +
      spark(d.c) +
      '<div class="uh-grid">' + cells.map(function(c){ return '<div><span>' + esc(c[0]) + '</span><b class="' + c[2] + '">' + esc(c[1]) + '</b></div>'; }).join('') + '</div>' +
      '<div class="uh-r52"><span>' + esc(T(U.r52)) + '</span><div class="uh-bar"><i style="left:' + pos.toFixed(1) + '%"></i></div><div class="uh-r52v"><em>' + num(lo, 2) + '</em><em>' + num(hi, 2) + '</em></div></div>' +
      '<div class="uh-note">' + (d.off_high != null ? pc(d.off_high) + ' ' + esc(T(U.offHi)) : '') + (d.above_ma200 != null ? ' · ' + esc(T(d.above_ma200 ? U.above : U.below)) : '') + '</div>' +
      '<div class="uh-btns"><button type="button" class="un-wave uh-zoom" data-un-act="focus">' + esc(T(U.zoomIn)) + '</button><button type="button" class="un-wave" data-un-act="wave">' + esc(T(U.wave)) + '</button></div>';
    holoW = box.offsetWidth || 300; holoH = box.offsetHeight || 340;
  }
  /* ---------- double-click: fly the camera into a star, then open its focus view ---------- */
  function ease(u){ return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function camTo(to, ms, done){
    var d = to.ry - st.ry; while(d > Math.PI) d -= Math.PI * 2; while(d < -Math.PI) d += Math.PI * 2;
    camAnim = { t0:performance.now(), ms:REDUCED ? 1 : ms, from:{ tx:st.tx, ty:st.ty, tz:st.tz, ox:st.ox, oy:st.oy, rx:st.rx, ry:st.ry, dist:st.dist }, to:{ tx:to.tx, ty:to.ty, tz:to.tz, ox:to.ox || 0, oy:to.oy || 0, rx:to.rx, ry:st.ry + d, dist:to.dist }, done:done, warp:!!to.warp };
  }
  function stepCam(now){
    camWarp = 0;
    if(!camAnim) return;
    var a = camAnim, u = Math.min(1, (now - a.t0) / a.ms), e = ease(u);
    ['tx', 'ty', 'tz', 'ox', 'oy', 'rx', 'ry'].forEach(function(k){ st[k] = lerp(a.from[k], a.to[k], e); });
    /* zoom on a log scale so the dolly feels like a steady rush */
    st.dist = Math.exp(lerp(Math.log(a.from.dist), Math.log(a.to.dist), e));
    if(a.warp) camWarp = Math.sin(u * Math.PI) * 0.9;
    if(u >= 1){ camAnim = null; if(a.done) a.done(); }
  }
  function focusStar(s){
    if(!s || camAnim) return;
    if(isFull() === false && W < 10) return;
    var prev = { tx:st.tx, ty:st.ty, tz:st.tz, rx:st.rx, ry:st.ry, dist:st.dist, spin:st.spin };
    st.spin = false; warpT0 = 0;
    if(st.sel !== s){ st.sel = s; selT = performance.now(); }
    card(); hideHolo();
    var wx = s.wx != null ? s.wx : s.x, wz = s.wz != null ? s.wz : s.z, vx = -wx, vz = -wz;
    var ry = Math.atan2(vx, vz) + (W >= 900 ? 0.55 : 0.75); /* look in from outside the ring, with the black hole off to the side */
    focus = { s:s, prev:prev, rng:252, t0:performance.now() };
    sec.querySelector('.un-stage').classList.add('un-focusing');
    var wide = W >= 900; camTo({ tx:wx, ty:s.y, tz:wz, ox:wide ? -0.33 : 0, oy:wide ? 0 : -0.36, rx:-0.14, ry:ry, dist:wide ? 0.16 : 0.2, warp:true }, 1500, function(){
      var fl = sec.querySelector('.un-flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
      openFocus();
    });
  }
  function unfocus(quick){
    if(!focus) return;
    var prev = focus.prev, box = sec.querySelector('[data-un="focus"]');
    box.classList.remove('on'); box.innerHTML = '';
    sec.querySelector('.un-stage').classList.remove('un-focusing');
    focus = null;
    if(quick){ st.ox = 0; st.oy = 0; st.tx = prev.tx; st.ty = prev.ty; st.tz = prev.tz; st.rx = prev.rx; st.ry = prev.ry; st.dist = prev.dist; camAnim = null; return; }
    camTo({ tx:0, ty:0, tz:0, rx:prev.rx, ry:prev.ry, dist:Math.max(0.6, prev.dist), warp:true }, 1300, function(){ selT = performance.now(); paintCtl(); });
  }
  function sma(v, n){ var out = [], s = 0; for(var i = 0; i < v.length; i++){ s += v[i]; if(i >= n) s -= v[i - n]; out.push(i >= n - 1 ? s / n : null); } return out; }
  function openFocus(){
    if(!focus) return;
    var s = focus.s, d = s.s, box = sec.querySelector('[data-un="focus"]');
    var nm = String(d.name || '').replace(/^[A-Z0-9]+_/, ''), sect = L() === 'th' ? (SECT_TH[d.sector] || d.sector || '') : (d.sector || '');
    function num(v, dp, suf){ return v == null || isNaN(v) ? '—' : Number(v).toFixed(dp) + (suf || ''); }
    function pc(v){ return v == null || isNaN(v) ? '—' : (v > 0 ? '+' : '') + Number(v).toFixed(1) + '%'; }
    function cls(v){ return v == null ? '' : v >= 0 ? 'up' : 'dn'; }
    function grp(title, rows){ return '<div class="uf-grp"><h4>' + esc(T(title)) + '</h4>' + rows.map(function(r){ return '<div class="uf-row"><span>' + esc(typeof r[0] === 'string' ? r[0] : T(r[0])) + '</span><b class="' + (r[2] || '') + '">' + esc(r[1]) + '</b></div>'; }).join('') + '</div>'; }
    var debt = d.debt ? '$' + fmtCap(d.ccy === 'THB' ? d.debt / (((window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot().fx) || {}).THB || 33.5) : d.debt) : '—';
    box.innerHTML = '<i class="uh-c tl"></i><i class="uh-c tr"></i><i class="uh-c bl"></i><i class="uh-c br"></i>' +
      '<div class="uf-head"><div class="uf-id"><b>' + esc(s.key) + '</b><span>' + esc(nm) + '</span><em>' + esc(sect) + (d.industry ? ' · ' + esc(d.industry) : '') + '</em></div>' +
        '<div class="uf-px"><strong>' + esc(d.price) + ' <small>' + esc(d.ccy) + '</small></strong><span class="' + cls(d.chg_pct) + '">' + pc(d.chg_pct) + ' ' + esc(T(U.day)) + '</span><em>' + esc(T(U.mcap)) + ' $' + fmtCap(s.usd) + '</em></div>' +
        '<button type="button" class="uf-back" data-un-act="unfocus">' + esc(T(U.back)) + '</button></div>' +
      '<div class="uf-body"><div class="uf-chartbox"><div class="uf-rng">' + [[21, '1M'], [63, '3M'], [126, '6M'], [252, '1Y'], [9999, '2Y']].map(function(r){ return '<button type="button" data-un-act="rng' + r[0] + '" class="' + (focus.rng === r[0] ? 'on' : '') + '">' + r[1] + '</button>'; }).join('') + '<span class="uf-ct" data-uf="ct"></span></div>' +
        '<div class="uf-chart" data-uf="chart"></div><div class="uf-lg"><i class="l1"></i>' + esc(T(U.ma50)) + '<i class="l2"></i>' + esc(T(U.ma200)) + '<i class="l3"></i>' + esc(T(U.hi52)) + ' / ' + esc(T(U.lo52)) + '</div></div>' +
        '<div class="uf-stats">' +
          grp(U.grpPrice, [['1M', pc(d.m1), cls(d.m1)], ['3M', pc(d.m3), cls(d.m3)], [U.fromHi, pc(d.off_high), cls(d.off_high)], [U.fromLo, pc(d.off_low), cls(d.off_low)], [U.vsMa50, pc(d.vs_ma50), cls(d.vs_ma50)], [U.vsMa200, pc(d.vs_ma200), cls(d.vs_ma200)], ['RSI', num(d.rsi, 0), ''], [U.vol, num(d.vol20, 1, '%'), '']]) +
          grp(U.grpVal, [['P/E', num(d.pe, 1), ''], ['P/B', num(d.pb, 2), ''], [U.dy, num(d.div, 2, '%'), '']]) +
          grp(U.grpQual, [[U.roe, num(d.roe, 1, '%'), ''], [U.roa, num(d.roa, 1, '%'), ''], [U.roic, num(d.roic, 1, '%'), ''], [U.margin, num(d.margin, 1, '%'), ''], ['D/E', num(d.de, 2), ''], [U.debt, debt, '']]) +
          '<button type="button" class="un-wave" data-un-act="wave">' + esc(T(U.wave)) + '</button>' +
        '</div></div>';
    box.classList.add('on');
    renderFocusChart();
  }
  function renderFocusChart(){
    if(!focus) return;
    var d = focus.s.s, host = sec.querySelector('[data-uf="chart"]'); if(!host) return;
    sec.querySelectorAll('.uf-rng button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-un-act') === 'rng' + focus.rng); });
    var all = String(d.c || '').split(',').map(Number).filter(function(x){ return !isNaN(x) && x > 0; });
    if(all.length < 5){ host.innerHTML = '<p class="uf-none">—</p>'; return; }
    var m50 = sma(all, 50), m200 = sma(all, 200), n = Math.min(all.length, focus.rng), off = all.length - n;
    var v = all.slice(off), a50 = m50.slice(off), a200 = m200.slice(off);
    var Wc = Math.max(280, host.clientWidth || 600), Hc = Math.max(200, host.clientHeight || 300), pl = 8, pr = 58, pt = 14, pb = 24;
    var ys = v.concat(a50.filter(Boolean), a200.filter(Boolean)); if(d.hi52) ys.push(+d.hi52); if(d.lo52) ys.push(+d.lo52);
    var mn = Math.min.apply(null, ys), mx = Math.max.apply(null, ys), pad = (mx - mn) * 0.06 || 1; mn -= pad; mx += pad;
    function X(i){ return pl + i / Math.max(1, n - 1) * (Wc - pl - pr); }
    function Y(y){ return pt + (1 - (y - mn) / (mx - mn)) * (Hc - pt - pb); }
    function line(arr){ var o = '', on = false; arr.forEach(function(y, i){ if(y == null){ on = false; return; } o += (on ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(y).toFixed(1); on = true; }); return o; }
    var up = v[v.length - 1] >= v[0], col = up ? '#7cc4ff' : '#ff7aa8', g = '';
    for(var k = 0; k <= 4; k++){ var gy = mn + (mx - mn) * k / 4; g += '<line x1="' + pl + '" x2="' + (Wc - pr) + '" y1="' + Y(gy).toFixed(1) + '" y2="' + Y(gy).toFixed(1) + '" class="uf-grid"/><text x="' + (Wc - pr + 6) + '" y="' + (Y(gy) + 3.5).toFixed(1) + '" class="uf-ax">' + gy.toFixed(gy > 100 ? 0 : 2) + '</text>'; }
    /* relative time ticks, in trading days */
    [[21, '-1M'], [63, '-3M'], [126, '-6M'], [252, '-1Y'], [378, '-18M'], [504, '-2Y']].forEach(function(t){ if(t[0] < n - 3){ var xi = X(n - 1 - t[0]); g += '<line x1="' + xi.toFixed(1) + '" x2="' + xi.toFixed(1) + '" y1="' + pt + '" y2="' + (Hc - pb) + '" class="uf-grid v"/><text x="' + xi.toFixed(1) + '" y="' + (Hc - 6) + '" class="uf-ax c">' + t[1] + '</text>'; } });
    var hl = '';
    if(d.hi52){ hl += '<line x1="' + pl + '" x2="' + (Wc - pr) + '" y1="' + Y(+d.hi52).toFixed(1) + '" y2="' + Y(+d.hi52).toFixed(1) + '" class="uf-hl"/>'; }
    if(d.lo52){ hl += '<line x1="' + pl + '" x2="' + (Wc - pr) + '" y1="' + Y(+d.lo52).toFixed(1) + '" y2="' + Y(+d.lo52).toFixed(1) + '" class="uf-hl"/>'; }
    var pth = line(v), area = pth + 'L' + X(n - 1).toFixed(1) + ',' + (Hc - pb) + 'L' + X(0).toFixed(1) + ',' + (Hc - pb) + 'Z', ly = Y(v[v.length - 1]);
    host.innerHTML = '<svg viewBox="0 0 ' + Wc + ' ' + Hc + '" width="100%" height="100%" class="uf-svg"><defs><linearGradient id="ufg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".38"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient><filter id="ufglow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      g + hl + '<path d="' + area + '" fill="url(#ufg)" class="uf-area"/><path d="' + line(a200) + '" class="uf-ma2"/><path d="' + line(a50) + '" class="uf-ma1"/>' +
      '<path d="' + pth + '" fill="none" stroke="' + col + '" stroke-width="2" filter="url(#ufglow)" class="uf-line" pathLength="1"/>' +
      '<circle cx="' + X(n - 1).toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="4" fill="#fff" class="uf-dot"/><rect x="' + (Wc - pr + 2) + '" y="' + (ly - 9).toFixed(1) + '" width="' + (pr - 4) + '" height="18" rx="3" fill="' + col + '"/><text x="' + (Wc - pr / 2) + '" y="' + (ly + 4).toFixed(1) + '" class="uf-last">' + v[v.length - 1].toFixed(v[v.length - 1] > 100 ? 1 : 2) + '</text>' +
      '<g class="uf-x" style="display:none"><line class="uf-xl" y1="' + pt + '" y2="' + (Hc - pb) + '"/><circle r="4.5" class="uf-xd"/></g><rect x="0" y="0" width="' + Wc + '" height="' + Hc + '" fill="transparent" class="uf-hit"/></svg><div class="uf-tip" style="display:none"></div>';
    var ctEl = sec.querySelector('[data-uf="ct"]'); if(ctEl) ctEl.textContent = T(U.chartT).replace('{n}', n) + ' · ' + (v[v.length - 1] >= v[0] ? '+' : '') + ((v[v.length - 1] / v[0] - 1) * 100).toFixed(1) + '%';
    var svg = host.querySelector('svg'), gx = svg.querySelector('.uf-x'), xl = svg.querySelector('.uf-xl'), xd = svg.querySelector('.uf-xd'), tip = host.querySelector('.uf-tip');
    function move(ev){
      var r = svg.getBoundingClientRect(), mx2 = (ev.clientX - r.left) / r.width * Wc;
      var i = Math.max(0, Math.min(n - 1, Math.round((mx2 - pl) / (Wc - pl - pr) * (n - 1)))), x = X(i), y = Y(v[i]);
      gx.style.display = ''; xl.setAttribute('x1', x); xl.setAttribute('x2', x); xd.setAttribute('cx', x); xd.setAttribute('cy', y);
      var ago = n - 1 - i;
      tip.style.display = ''; tip.innerHTML = '<b>' + v[i].toFixed(2) + '</b>' + (a50[i] ? '<span>MA50 ' + a50[i].toFixed(2) + '</span>' : '') + (a200[i] ? '<span>MA200 ' + a200[i].toFixed(2) + '</span>' : '') + '<em>' + (ago ? ago + ' ' + T(U.dAgo) : T(U.agoNow)) + '</em>';
      var tx = x / Wc * r.width; tip.style.left = Math.min(r.width - 150, Math.max(0, tx + 12)) + 'px'; tip.style.top = Math.max(0, y / Hc * r.height - 50) + 'px';
    }
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move);
    svg.addEventListener('pointerleave', function(){ gx.style.display = 'none'; tip.style.display = 'none'; });
  }
  function flyTo(s){
    var o = orbitXZ(s.x, s.z), targetRy = Math.atan2(o[0], -o[1]), a0 = st.ry, t0 = performance.now(), d0 = st.dist;
    var d = targetRy - a0; while(d > Math.PI) d -= Math.PI * 2; while(d < -Math.PI) d += Math.PI * 2;
    st.spin = false;
    (function step(now){ var u = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - u, 3); st.ry = a0 + d * e; st.dist = lerp(d0, 0.62, e); if(u < 1) requestAnimationFrame(step); else paintCtl(); })(t0);
  }
  function isFull(){ return fakeFs || document.fullscreenElement === stage || document.webkitFullscreenElement === stage; }
  function toggleFull(){
    if(isFull()){
      if(fakeFs){ fakeFs = false; stage.classList.remove('un-fs'); document.documentElement.classList.remove('un-fs-lock'); }
      else if(document.exitFullscreen) document.exitFullscreen().catch(function(){});
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
      var fallback = function(){ fakeFs = true; stage.classList.add('un-fs'); document.documentElement.classList.add('un-fs-lock'); paintCtl(); setTimeout(resize, 30); };
      if(req){ try { var pr = req.call(stage); if(pr && pr.catch) pr.catch(fallback); } catch(e){ fallback(); } }
      else fallback();
    }
    setTimeout(function(){ resize(); paintCtl(); }, 120);
  }
  var ICON = {
    full:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    exit:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    spin:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>',
    reset:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>'
  };
  function paintCtl(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-un="' + k + '"]'); };
    q('eb').textContent = T(U.eb); q('h').textContent = T(U.h); q('lede').textContent = T(U.lede);
    q('h2').textContent = 'SPACEZ TERMINAL'; q('h3').textContent = T(U.sub); q('lede2').textContent = T(U.lede); q('lede2').classList.toggle('on', !!st.info);
    var n = stars.filter(visible).length, full = isFull();
    q('ctl').innerHTML = '<div class="un-seg">' + ['all', 'us', 'th'].map(function(k){ return '<button type="button" data-un-mk="' + k + '" class="' + (st.mk === k ? 'on' : '') + '">' + esc(T(U[k])) + '</button>'; }).join('') + '</div>' +
      '<div class="un-seg">' + ['m1', 'm3', 'rsi'].map(function(k){ return '<button type="button" data-un-col="' + k + '" class="' + (st.col === k ? 'on' : '') + '">' + esc(T(U[k])) + '</button>'; }).join('') + '</div>' +
      '<input type="search" data-un-q placeholder="' + esc(T(U.find)) + '" value="' + esc(st.q) + '" list="unList">' +
      '<button type="button" class="un-b' + (st.spin ? ' on' : '') + '" data-un-act="spin">' + ICON.spin + '<span>' + esc(T(U.spin)) + '</span></button>' +
      '<button type="button" class="un-b" data-un-act="reset">' + ICON.reset + '<span>' + esc(T(U.reset)) + '</span></button>';
    q('fs').innerHTML = (full ? ICON.exit : ICON.full) + '<span>' + esc(T(full ? U.exitFull : U.full)) + '</span>';
    q('fs').setAttribute('aria-label', T(full ? U.exitFull : U.full));
    q('opts').textContent = (st.opts ? '✕ ' : '☰ ') + T(U.opts);
    q('hud').classList.toggle('open', !!st.opts);
    q('lg').innerHTML = '<em>' + esc(T(U.lgDn)) + '</em><span class="un-grad"></span><em>' + esc(T(U.lgUp)) + '</em><span class="un-sz">' + esc(T(U.lgSz)) + '</span><span class="un-sz">· ' + esc(T(U.dbl)) + '</span>';
    q('n').textContent = n ? n + ' ' + T(U.stars) : T(U.noData);
    var dl = document.getElementById('unList');
    if(dl && !dl.children.length && stars.length) dl.innerHTML = stars.map(function(s){ return '<option value="' + esc(s.key) + '">'; }).join('');
    card();
  }
  function wire(){
    var pts = {}, drag = null, pinch = null, moved = false;
    stage.addEventListener('pointerdown', function(ev){
      if(ev.target !== cv || focus || camAnim) return;
      pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY }; moved = false;
      var ids = Object.keys(pts);
      if(ids.length === 1) drag = { x:ev.clientX, y:ev.clientY, rx:st.rx, ry:st.ry };
      else if(ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d:Math.hypot(a.x - b.x, a.y - b.y), dist:st.dist }; drag = null; }
      st.dragging = true;
    });
    window.addEventListener('pointermove', function(ev){
      if(pts[ev.pointerId]){
        pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY };
        var ids = Object.keys(pts);
        if(pinch && ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; st.dist = Math.max(0.3, Math.min(2.6, pinch.dist * pinch.d / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)))); moved = true; return; }
        if(drag){ var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; if(Math.abs(dx) + Math.abs(dy) > 4) moved = true; st.ry = drag.ry + dx * 0.006; st.rx = Math.max(-1.45, Math.min(1.45, drag.rx + dy * 0.006)); }
        return;
      }
      if(ev.target === cv){ var r = cv.getBoundingClientRect(); var h = pick(ev.clientX - r.left, ev.clientY - r.top); if(h !== st.hover){ st.hover = h; cv.style.cursor = h ? 'pointer' : 'grab'; } }
    });
    function up(ev){
      if(!pts[ev.pointerId]) return;
      delete pts[ev.pointerId];
      if(Object.keys(pts).length < 2) pinch = null;
      if(!Object.keys(pts).length){
        drag = null; st.dragging = false;
        if(!moved && ev.target === cv && !focus && !camAnim){
          var r = cv.getBoundingClientRect(), s = pick(ev.clientX - r.left, ev.clientY - r.top), tnow = performance.now();
          if(s && lastTap.s === s && tnow - lastTap.t < 380){ lastTap = { t:0, s:null }; focusStar(s); return; }
          lastTap = { t:tnow, s:s };
          if(s !== st.sel) selT = tnow; st.sel = s; if(s) st.spin = false; paintCtl();
        }
      }
    }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function(ev){ if(ev.target !== cv || focus || camAnim) return; ev.preventDefault(); warpT0 = 0; st.dist = Math.max(0.3, Math.min(2.6, st.dist * (ev.deltaY > 0 ? 1.08 : 0.92))); }, { passive:false });
    sec.addEventListener('click', function(ev){
      var b;
      if((b = ev.target.closest('[data-un-mk]'))){ st.mk = b.getAttribute('data-un-mk'); paintCtl(); return; }
      if((b = ev.target.closest('[data-un-col]'))){ st.col = b.getAttribute('data-un-col'); paintCtl(); return; }
      if((b = ev.target.closest('[data-un-act]'))){
        var a = b.getAttribute('data-un-act');
        if(a === 'spin') st.spin = !st.spin;
        else if(a === 'reset'){ st.rx = -0.38; st.ry = 0; st.sel = null; st.q = ''; st.distTarget = 1; warpT0 = REDUCED ? 0 : performance.now(); if(REDUCED) st.dist = 1; }
        else if(a === 'close') st.sel = null;
        else if(a === 'focus' && st.sel){ focusStar(st.sel); return; }
        else if(a === 'unfocus'){ unfocus(); return; }
        else if(a.indexOf('rng') === 0){ if(focus){ focus.rng = +a.slice(3); renderFocusChart(); } return; }
        else if(a === 'info') st.info = !st.info;
        else if(a === 'opts') st.opts = !st.opts;
        else if(a === 'fs'){ toggleFull(); return; }
        else if(a === 'wave' && st.sel){
          var sym = st.sel.key;
          try { localStorage.setItem('spz.aw.sym', sym); } catch(e){}
          if(focus) unfocus(true);
          if(isFull()) toggleFull();
          if(window.__SPZ_AUTOWAVE_OPEN) window.__SPZ_AUTOWAVE_OPEN(sym); else location.hash = '#/autowave';
          return;
        }
        paintCtl(); return;
      }
    });
    sec.addEventListener('input', function(ev){
      if(!ev.target.hasAttribute('data-un-q')) return;
      st.q = ev.target.value;
      var qq = st.q.trim().toUpperCase(), m = qq && stars.filter(function(s){ return s.key === qq; })[0];
      if(m){ if(m !== st.sel) selT = performance.now(); st.sel = m; if(st.mk !== 'all' && m.mk !== st.mk) st.mk = 'all'; flyTo(m); card(); }
    });
    document.addEventListener('keydown', function(ev){ if(ev.key !== 'Escape') return; if(focus){ unfocus(); return; } if(fakeFs) toggleFull(); });
    window.addEventListener('resize', function(){ fit(false); resize(); });
    document.addEventListener('fullscreenchange', function(){ setTimeout(function(){ resize(); paintCtl(); }, 60); });
    document.addEventListener('webkitfullscreenchange', function(){ setTimeout(function(){ resize(); paintCtl(); }, 60); });
    if(window.ResizeObserver) new ResizeObserver(function(){ resize(); }).observe(stage);
  }
  /* size the stage to the space left under the fixed header and scroll it into place */
  function headerBottom(){
    var hb = 0;
    document.querySelectorAll('.top-fixed').forEach(function(el){ var r = el.getBoundingClientRect(), cs = getComputedStyle(el); if((cs.position === 'fixed' || cs.position === 'sticky') && r.bottom > hb && r.top <= 1) hb = r.bottom; });
    return Math.min(hb, window.innerHeight * 0.4);
  }
  function fit(scroll){
    if(!stage || isFull()) return;
    var hb = headerBottom(), h = Math.max(480, window.innerHeight - hb - 16);
    stage.style.height = h + 'px';
    if(scroll){ var y = stage.getBoundingClientRect().top + window.scrollY - hb - 8; window.scrollTo({ top:Math.max(0, y), behavior:'smooth' }); }
  }
  function enter(){
    setTimeout(function(){ fit(true); }, 260);
    setTimeout(function(){ resize(); if(!stars.length) buildStars(); paintCtl(); st.distTarget = st.distTarget || 1; if(!REDUCED){ warpT0 = performance.now(); } }, 50);
  }
  function build(){
    if(document.getElementById('universe')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'universe'; sec.setAttribute('data-route', 'universe');
    sec.innerHTML = '<div class="un-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-un="eb"></span></div><h2 data-un="h"></h2><p class="lede" data-un="lede"></p></div>' +
      '<datalist id="unList"></datalist>' +
      '<div class="un-stage"><canvas></canvas>' +
        '<div class="un-hud" data-un="hud"><div class="un-ctl" data-un="ctl"></div><div class="un-hbtn"><button type="button" class="un-optb" data-un-act="opts" data-un="opts"></button><button type="button" class="un-fsb" data-un-act="fs" data-un="fs"></button></div></div>' +
        '<div class="un-card un-holo" data-un="card"></div><div class="un-focus" data-un="focus"></div><div class="un-flash"></div>' +
        '<div class="un-foot"><div class="un-title"><div><b data-un="h2"></b><small data-un="h3"></small></div><button type="button" class="un-info" data-un-act="info" aria-label="i">i</button></div><p class="un-lede" data-un="lede2"></p><div class="un-lg" data-un="lg"></div></div>' +
        '<div class="un-n" data-un="n"></div></div></div>';
    document.body.appendChild(sec);
    stage = sec.querySelector('.un-stage'); cv = sec.querySelector('canvas'); ctx = cv.getContext('2d');
    window.__spzAddRoute({ id:'universe', after:'globe', t:U.h, d:{ en:'Every stock as a star orbiting a black hole: sectors are galaxies, size is market cap, colour is momentum.', th:'หุ้นทุกตัวเป็นดาวโคจรรอบหลุมดำ กลุ่มอุตสาหกรรมเป็นกาแล็กซี ขนาดตามมูลค่าตลาด สีตามโมเมนตัม' } });
    buildNebula(); buildPlanets();
    /* read-only helper for tests: where a star is on screen right now */
    window.__SPZ_UNI_POS = function(k){ var m = stars.filter(function(x){ return x.key === k; })[0]; return m && m.p ? { x:m.p.x, y:m.p.y } : null; };
    wire(); resize(); buildStars(); paintCtl();
    window.addEventListener('hashchange', function(){ if(location.hash === '#/universe') enter(); else { if(focus) unfocus(true); if(isFull()) toggleFull(); } });
    if(location.hash === '#/universe') enter();
    new MutationObserver(function(){ paintCtl(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    setInterval(function(){ if(location.hash === '#/universe' && !stars.length && buildStars()) paintCtl(); }, 1500);
    if(!raf) raf = requestAnimationFrame(draw);
    return true;
  }
  function boot(){ var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 400); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  else setTimeout(boot, 1500);
})();
