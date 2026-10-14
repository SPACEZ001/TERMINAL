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
    noData:{ en:'Market data is still loading…', th:'กำลังโหลดข้อมูลตลาด…' }
  };
  var SECT_TH = { 'Technology':'เทคโนโลยี', 'Financial Services':'การเงิน', 'Consumer Cyclical':'สินค้าฟุ่มเฟือย', 'Industrials':'อุตสาหกรรม', 'Healthcare':'สุขภาพ', 'Consumer Defensive':'สินค้าจำเป็น', 'Real Estate':'อสังหาฯ', 'Energy':'พลังงาน', 'Basic Materials':'วัตถุดิบ', 'Utilities':'สาธารณูปโภค', 'Communication Services':'สื่อสาร', 'Other':'อื่นๆ' };

  var REDUCED = false; try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var st = { mk:'all', col:'m1', spin:!REDUCED, rx:-0.38, ry:0, dist:1, sel:null, hover:null, q:'', orbit:0 };
  var sec = null, stage = null, cv = null, ctx = null, stars = [], galaxies = [], raf = 0, W = 0, H = 0, DPR = 1, sprites = {};
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
    var n = (W < 700 ? 450 : 1000);
    disk = [];
    for(var i = 0; i < n; i++){
      var r = BH_R * 1.35 + Math.pow(Math.random(), 1.8) * 300;
      disk.push({ r:r, a:Math.random() * Math.PI * 2, y:(Math.random() - 0.5) * (4 + r * 0.04), w:0.9 + Math.random() * 2.2 });
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
    var x1 = x * CY - z * SY, z1 = x * SY + z * CY;
    var y1 = y * CX - z1 * SX, z2 = y * SX + z1 * CX;
    var D = 1500 * st.dist, f = 900 / Math.max(60, D + z2);
    return { x:W / 2 + x1 * f * KS, y:H / 2 + y1 * f * KS, z:z2, f:f };
  }
  function orbitXZ(x, z){ var c = Math.cos(st.orbit), s = Math.sin(st.orbit); return [x * c - z * s, x * s + z * c]; }
  function visible(s){ return st.mk === 'all' || s.mk === st.mk; }

  /* ---------------- drawing ---------------- */
  function drawSky(warp){
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    var g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, 'rgba(26,14,52,.55)'); g.addColorStop(0.5, 'rgba(8,8,26,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* nebula band, parallax with the camera */
    if(nebula){
      var nh = H * 1.25, nw = nh * 2, off = ((-st.ry / (Math.PI * 2)) * nw) % nw; if(off > 0) off -= nw;
      var ny = H / 2 - nh / 2 + st.rx * H * 0.55;
      ctx.globalAlpha = 0.9; ctx.globalCompositeOperation = 'lighter';
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
    var t = Math.min(1, (r - BH_R * 1.35) / 300);
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
    var nR = W < 700 ? 11 : 18, nS = W < 700 ? 44 : 72, rin = BH_R * 1.35, list = [];
    for(var i = 0; i < nR; i++){
      var u = i / (nR - 1), r = rin + Math.pow(u, 1.5) * 310, un = (i + 1) / (nR - 1), r2 = rin + Math.pow(Math.min(1, un), 1.5) * 310;
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
      var fade = Math.pow(1 - (rg.r - rin) / 330, 1.8), pts = [];
      for(var k = 0; k <= n; k++){ var a = k / n * Math.PI * 2; pts.push(project(Math.cos(a) * rg.r, 0, Math.sin(a) * rg.r)); }
      for(var c = 0; c < n; c += CH){
        var e = Math.min(n, c + CH), mid = pts[Math.floor((c + e) / 2)], am = (c + e) / 2 / n * Math.PI * 2;
        if(front ? mid.z > c0.z : mid.z <= c0.z) continue;
        var vx = -Math.sin(am), vz = Math.cos(am), toward = -(vx * SY + vz * CY) * CX;
        var swirl = 0.62 + 0.38 * Math.sin(am * 3 + rg.ph - spin * 9) * Math.sin(am * 7 - rg.ph * 2 - spin * 5);
        var al = fade * (0.28 + 0.72 * (0.5 + 0.5 * toward)) * swirl, m;
        ctx.strokeStyle = 'rgba(' + rg.c + ',' + Math.min(1, al * 0.3).toFixed(3) + ')';
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
  function drawDiskPart(front, c0){
    drawRings(front, c0);
    for(var i = 0; i < disk.length; i++){
      var d = disk[i];
      var x = Math.cos(d.a) * d.r, z = Math.sin(d.a) * d.r;
      var p = project(x, d.y, z);
      if(front ? p.z > c0.z : p.z <= c0.z) continue;
      /* Doppler beaming: the side moving toward us is brighter */
      var vx = -Math.sin(d.a), vz = Math.cos(d.a), toward = -(vx * SY + vz * CY) * CX;
      var b = (0.35 + 0.65 * (0.5 + 0.5 * toward)) * (1 - (d.r - BH_R) / 520);
      var s = d.w * p.f * KS * 3.0, spr = d.spr || (d.spr = sprite(diskColor(d.r)));
      ctx.globalAlpha = Math.max(0, Math.min(1, b));
      ctx.drawImage(spr, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }
  function drawBlackHole(c0){
    var R = BH_R * c0.f * KS, cx = c0.x, cy = c0.y, pulse = REDUCED ? 1 : 1 + 0.04 * Math.sin(tick * 0.03);
    ctx.globalCompositeOperation = 'lighter';
    /* outer halo */
    var g = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 6.5);
    g.addColorStop(0, 'rgba(255,170,90,.30)'); g.addColorStop(0.25, 'rgba(200,80,160,.14)'); g.addColorStop(0.6, 'rgba(90,50,200,.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - R * 7, cy - R * 7, R * 14, R * 14);
    /* relativistic jets along the spin axis */
    var top = project(0, -760, 0), bot = project(0, 760, 0), fl = REDUCED ? 0.8 : 0.75 + 0.25 * Math.sin(tick * 0.11) * Math.sin(tick * 0.037);
    [top, bot].forEach(function(e){
      var jg = ctx.createLinearGradient(cx, cy, e.x, e.y);
      jg.addColorStop(0, 'rgba(170,200,255,' + (0.32 * fl).toFixed(2) + ')'); jg.addColorStop(0.35, 'rgba(130,110,255,' + (0.1 * fl).toFixed(2) + ')'); jg.addColorStop(1, 'rgba(80,60,255,0)');
      ctx.strokeStyle = jg; ctx.lineCap = 'round';
      ctx.lineWidth = R * 0.26; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e.x, e.y); ctx.stroke();
      ctx.lineWidth = R * 0.05; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e.x, e.y); ctx.stroke();
    });
    /* back half of the accretion disk */
    drawDiskPart(false, c0);
    /* photon ring: thin and bright, with a soft glow, slightly brighter on the approaching side */
    var rg = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.45 * pulse);
    rg.addColorStop(0, 'rgba(255,236,200,.9)'); rg.addColorStop(0.12, 'rgba(255,190,120,.45)'); rg.addColorStop(0.45, 'rgba(230,110,150,.12)'); rg.addColorStop(1, 'rgba(120,60,200,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.45 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,248,230,.95)'; ctx.lineWidth = Math.max(1, R * 0.035);
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2); ctx.stroke();
    /* event horizon shadow */
    ctx.globalCompositeOperation = 'source-over';
    var sg = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.04);
    sg.addColorStop(0, '#000'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2); ctx.fill();
    /* near half of the disk crosses in front of the shadow */
    ctx.globalCompositeOperation = 'lighter';
    drawDiskPart(true, c0);
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
  function drawStar(s, q){
    var v = st.col === 'rsi' ? s.s.rsi : s.s[st.col];
    var rgb = colorFor(+v, st.col).map(function(c){ return Math.round(c / 12) * 12; });
    var tw = REDUCED ? 1 : 0.9 + 0.1 * Math.sin(tick * 0.05 + s.ph);
    var r = Math.min(70, s.size * s.p.f * KS * 3.4 * tw);
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
    if(!REDUCED) st.orbit += 0.00035;
    planets.forEach(function(pl){ pl.a += pl.sp * (REDUCED ? 0 : 1); });
    disk.forEach(function(d){ d.a += (REDUCED ? 0.2 : 1) * 0.9 * Math.pow(BH_R * 1.35 / d.r, 1.5) * 0.02; });
    /* intro warp: fly in from far away */
    var warp = 0;
    if(warpT0){
      var u = Math.min(1, (now - warpT0) / 1700), e = 1 - Math.pow(1 - u, 3);
      st.dist = lerp(2.6, st.distTarget || 1, e); warp = u < 1 ? (1 - u) : 0;
      if(u >= 1) warpT0 = 0;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    camPrep();
    drawSky(warp);
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
    galaxies.forEach(function(gx){
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
      var show = s === st.hover || s === st.sel || (q && q.length >= 2 && s.key.indexOf(q) === 0) || big.indexOf(s) !== -1;
      if(!show) return;
      ctx.fillStyle = s === st.sel ? '#9fe7ff' : 'rgba(235,240,255,.88)';
      ctx.fillText(s.key, s.p.x + s.r * 0.45, s.p.y - s.r * 0.35);
    });
    if(st.sel && st.sel.p && visible(st.sel)){
      var sp = st.sel.p, rr = Math.max(10, st.sel.r * 0.62);
      ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(tick * 0.02);
      ctx.strokeStyle = 'rgba(160,230,255,.95)'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(180,140,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, rr + 6 + 2 * Math.sin(tick * 0.08), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
  function resize(){
    if(!cv || !stage) return;
    var r = stage.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
    var nw = Math.max(300, Math.round(r.width)), nh = Math.max(360, Math.round(r.height)), grew = (nw > W * 1.3);
    W = nw; H = nh;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if(!sky.length || grew) buildSky();
    if(!disk.length) buildDisk();
  }
  function pick(px, py){
    var best = null, bd = 1e9;
    stars.forEach(function(s){ if(!s.p || !visible(s)) return; var d = Math.hypot(s.p.x - px, s.p.y - py); var lim = Math.max(10, s.r * 0.5); if(d < lim && d < bd){ bd = d; best = s; } });
    return best;
  }
  function fmtCap(usd){ return usd >= 1e12 ? (usd / 1e12).toFixed(2) + 'T' : usd >= 1e9 ? (usd / 1e9).toFixed(1) + 'B' : (usd / 1e6).toFixed(0) + 'M'; }
  function card(){
    var box = sec.querySelector('[data-un="card"]'); if(!box) return;
    var s = st.sel; if(!s){ box.innerHTML = ''; box.className = 'un-card'; return; }
    var d = s.s, nm = String(d.name || '').replace(/^[A-Z0-9]+_/, '');
    function pc(v){ return v == null ? '—' : (v > 0 ? '+' : '') + Number(v).toFixed(1) + '%'; }
    box.className = 'un-card on';
    box.innerHTML = '<button type="button" class="un-x" data-un-act="close" aria-label="' + esc(T(U.close)) + '">×</button><b>' + esc(s.key) + '</b><span class="un-nm">' + esc(nm) + '</span>' +
      '<div class="un-kv"><span>' + esc(T(U.price)) + '</span><i>' + esc(d.price) + ' ' + esc(d.ccy) + '</i><span>' + esc(T(U.mcap)) + '</span><i>$' + fmtCap(s.usd) + '</i>' +
      '<span>1M</span><i class="' + (d.m1 >= 0 ? 'up' : 'dn') + '">' + pc(d.m1) + '</i><span>3M</span><i class="' + (d.m3 >= 0 ? 'up' : 'dn') + '">' + pc(d.m3) + '</i>' +
      '<span>RSI</span><i>' + (d.rsi == null ? '—' : Number(d.rsi).toFixed(0)) + '</i><span>' + esc(T(U.sector)) + '</span><i>' + esc(L() === 'th' ? (SECT_TH[d.sector] || d.sector || '') : (d.sector || '')) + '</i></div>' +
      '<button type="button" class="un-wave" data-un-act="wave">' + esc(T(U.wave)) + '</button>';
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
    q('h2').textContent = T(U.h); q('lede2').textContent = T(U.lede); q('lede2').classList.toggle('on', !!st.info);
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
    q('lg').innerHTML = '<em>' + esc(T(U.lgDn)) + '</em><span class="un-grad"></span><em>' + esc(T(U.lgUp)) + '</em><span class="un-sz">' + esc(T(U.lgSz)) + '</span>';
    q('n').textContent = n ? n + ' ' + T(U.stars) : T(U.noData);
    var dl = document.getElementById('unList');
    if(dl && !dl.children.length && stars.length) dl.innerHTML = stars.map(function(s){ return '<option value="' + esc(s.key) + '">'; }).join('');
    card();
  }
  function wire(){
    var pts = {}, drag = null, pinch = null, moved = false;
    stage.addEventListener('pointerdown', function(ev){
      if(ev.target !== cv) return;
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
        if(!moved && ev.target === cv){ var r = cv.getBoundingClientRect(); var s = pick(ev.clientX - r.left, ev.clientY - r.top); st.sel = s; if(s) st.spin = false; paintCtl(); }
      }
    }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function(ev){ if(ev.target !== cv) return; ev.preventDefault(); warpT0 = 0; st.dist = Math.max(0.3, Math.min(2.6, st.dist * (ev.deltaY > 0 ? 1.08 : 0.92))); }, { passive:false });
    sec.addEventListener('click', function(ev){
      var b;
      if((b = ev.target.closest('[data-un-mk]'))){ st.mk = b.getAttribute('data-un-mk'); paintCtl(); return; }
      if((b = ev.target.closest('[data-un-col]'))){ st.col = b.getAttribute('data-un-col'); paintCtl(); return; }
      if((b = ev.target.closest('[data-un-act]'))){
        var a = b.getAttribute('data-un-act');
        if(a === 'spin') st.spin = !st.spin;
        else if(a === 'reset'){ st.rx = -0.38; st.ry = 0; st.sel = null; st.q = ''; st.distTarget = 1; warpT0 = REDUCED ? 0 : performance.now(); if(REDUCED) st.dist = 1; }
        else if(a === 'close') st.sel = null;
        else if(a === 'info') st.info = !st.info;
        else if(a === 'opts') st.opts = !st.opts;
        else if(a === 'fs'){ toggleFull(); return; }
        else if(a === 'wave' && st.sel){
          var sym = st.sel.key;
          try { localStorage.setItem('spz.aw.sym', sym); } catch(e){}
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
      if(m){ st.sel = m; if(st.mk !== 'all' && m.mk !== st.mk) st.mk = 'all'; flyTo(m); card(); }
    });
    document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape' && fakeFs) toggleFull(); });
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
        '<div class="un-card" data-un="card"></div>' +
        '<div class="un-foot"><div class="un-title"><b data-un="h2"></b><button type="button" class="un-info" data-un-act="info" aria-label="i">i</button></div><p class="un-lede" data-un="lede2"></p><div class="un-lg" data-un="lg"></div></div>' +
        '<div class="un-n" data-un="n"></div></div></div>';
    document.body.appendChild(sec);
    stage = sec.querySelector('.un-stage'); cv = sec.querySelector('canvas'); ctx = cv.getContext('2d');
    window.__spzAddRoute({ id:'universe', after:'globe', t:U.h, d:{ en:'Every stock as a star orbiting a black hole: sectors are galaxies, size is market cap, colour is momentum.', th:'หุ้นทุกตัวเป็นดาวโคจรรอบหลุมดำ กลุ่มอุตสาหกรรมเป็นกาแล็กซี ขนาดตามมูลค่าตลาด สีตามโมเมนตัม' } });
    buildNebula(); buildPlanets();
    wire(); resize(); buildStars(); paintCtl();
    window.addEventListener('hashchange', function(){ if(location.hash === '#/universe') enter(); else if(isFull()) toggleFull(); });
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
