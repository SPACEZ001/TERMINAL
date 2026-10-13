/* ============================================================================
   SPACEZ TERMINAL -- Round AO: Stock Universe 3D (#/universe)
   Every stock in data/market.json is a star. Sectors are galaxies arranged on
   a ring; a star's size follows market cap (log scale, THB converted to USD),
   its colour follows momentum (1M / 3M return or RSI). Drag to rotate, scroll
   or pinch to zoom, tap a star for its card. Plain canvas 2D with a small
   perspective projection -- no external 3D library.
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
    lede:{ en:'Every stock on the site is a star. Galaxies are sectors, star size is company size, colour is momentum. Drag to spin, scroll or pinch to zoom, tap a star for details.', th:'หุ้นทุกตัวในเว็บคือดาวหนึ่งดวง กาแล็กซีคือกลุ่มอุตสาหกรรม ขนาดดาวคือขนาดบริษัท สีคือโมเมนตัม ลากเพื่อหมุน เลื่อนลูกกลิ้งหรือถ่างนิ้วเพื่อซูม แตะดาวเพื่อดูรายละเอียด' },
    mk:{ en:'Market', th:'ตลาด' }, all:{ en:'All', th:'ทั้งหมด' }, us:{ en:'US', th:'สหรัฐฯ' }, th:{ en:'Thailand', th:'ไทย' },
    col:{ en:'Colour by', th:'สีตาม' }, m1:{ en:'1-month return', th:'ผลตอบแทน 1 เดือน' }, m3:{ en:'3-month return', th:'ผลตอบแทน 3 เดือน' }, rsi:{ en:'RSI', th:'RSI' },
    find:{ en:'Find a stock…', th:'ค้นหาหุ้น…' }, spin:{ en:'Auto-spin', th:'หมุนอัตโนมัติ' }, reset:{ en:'Reset', th:'รีเซ็ต' }, full:{ en:'Full screen', th:'เต็มจอ' },
    stars:{ en:'stars', th:'ดวง' }, mcap:{ en:'Market cap', th:'มูลค่าตลาด' }, price:{ en:'Price', th:'ราคา' }, sector:{ en:'Sector', th:'กลุ่ม' },
    wave:{ en:'Count its waves →', th:'นับคลื่นหุ้นนี้ →' }, close:{ en:'Close', th:'ปิด' },
    lgDn:{ en:'falling', th:'ลง' }, lgUp:{ en:'rising', th:'ขึ้น' }, lgSz:{ en:'bigger star = bigger company', th:'ดาวใหญ่ = บริษัทใหญ่' },
    noData:{ en:'Market data is still loading…', th:'กำลังโหลดข้อมูลตลาด…' }
  };
  var SECT_TH = { 'Technology':'เทคโนโลยี', 'Financial Services':'การเงิน', 'Consumer Cyclical':'สินค้าฟุ่มเฟือย', 'Industrials':'อุตสาหกรรม', 'Healthcare':'สุขภาพ', 'Consumer Defensive':'สินค้าจำเป็น', 'Real Estate':'อสังหาฯ', 'Energy':'พลังงาน', 'Basic Materials':'วัตถุดิบ', 'Utilities':'สาธารณูปโภค', 'Communication Services':'สื่อสาร', 'Other':'อื่นๆ' };

  var st = { mk:'all', col:'m1', spin:true, rx:-0.42, ry:0, dist:1, sel:null, hover:null, q:'' };
  var sec = null, cv = null, ctx = null, stars = [], galaxies = [], bg = [], raf = 0, W = 0, H = 0, DPR = 1, sprites = {}, lastSnapAt = 0;

  function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function colorFor(v, kind){
    var t;
    if(kind === 'rsi') t = Math.max(-1, Math.min(1, (v - 50) / 25));
    else t = Math.max(-1, Math.min(1, v / (kind === 'm3' ? 20 : 10)));
    if(isNaN(t)) t = 0;
    var r, g, b;
    if(t >= 0){ r = Math.round(150 - 120 * t); g = Math.round(170 + 60 * t); b = Math.round(190 - 80 * t); }
    else { var u = -t; r = Math.round(150 + 105 * u); g = Math.round(170 - 110 * u); b = Math.round(190 - 100 * u); }
    return [r, g, b];
  }
  function sprite(rgb){
    var key = rgb.join(','); if(sprites[key]) return sprites[key];
    var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d');
    var gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(' + key + ',1)'); gr.addColorStop(0.45, 'rgba(' + key + ',.35)'); gr.addColorStop(1, 'rgba(' + key + ',0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    sprites[key] = c; return c;
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
    var R = 520;
    names.forEach(function(n, gi){
      var ang = gi / names.length * Math.PI * 2, gy = (hash(n) - 0.5) * 220;
      var cx = Math.cos(ang) * R, cz = Math.sin(ang) * R, cy = gy;
      galaxies.push({ name:n, x:cx, y:cy - 150, z:cz, n:bySec[n].length });
      var tilt = hash(n + 't') * Math.PI;
      bySec[n].forEach(function(key, i){
        var s = S[key], usd = s.ccy === 'THB' ? s.mcap / thb : s.mcap;
        var a = hash(key) * Math.PI * 2 + i * 0.35, rr = 30 + Math.pow(hash(key + 'r'), 0.7) * 150, h = (hash(key + 'h') - 0.5) * 60;
        // a flattened spiral disc per sector, tilted
        var px = Math.cos(a) * rr, pz = Math.sin(a) * rr, py = h;
        var y2 = py * Math.cos(tilt) - pz * Math.sin(tilt), z2 = py * Math.sin(tilt) + pz * Math.cos(tilt);
        stars.push({ key:key, s:s, x:cx + px, y:cy + y2, z:cz + z2, size:Math.max(1.4, (Math.log10(Math.max(usd, 1e8)) - 8) * 2.6), mk:s.ccy === 'THB' ? 'th' : 'us', usd:usd });
      });
    });
    if(!bg.length) for(var i = 0; i < 600; i++) bg.push({ x:(Math.random() - 0.5) * 6000, y:(Math.random() - 0.5) * 6000, z:(Math.random() - 0.5) * 6000, a:Math.random() * 0.6 + 0.1 });
    lastSnapAt = Date.now();
    return true;
  }
  function project(x, y, z){
    var cy = Math.cos(st.ry), sy = Math.sin(st.ry), cx = Math.cos(st.rx), sx = Math.sin(st.rx);
    var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    var D = 1500 * st.dist, f = 900 / (D + z2);
    return { x:W / 2 + x1 * f * (Math.min(W, H) / 900), y:H / 2 + y1 * f * (Math.min(W, H) / 900), z:z2, f:f };
  }
  function visible(s){ return st.mk === 'all' || s.mk === st.mk; }
  function draw(){
    raf = requestAnimationFrame(draw);
    if(!cv || !sec || location.hash !== '#/universe' || document.hidden) return;
    if(!stars.length && !buildStars()) return;
    if(st.spin && !st.dragging) st.ry += 0.0018;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.75);
    g.addColorStop(0, '#0b1426'); g.addColorStop(1, '#03050a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    bg.forEach(function(b){ var p = project(b.x, b.y, b.z); if(p.z < -1400) return; ctx.fillStyle = 'rgba(200,220,255,' + (b.a * Math.min(1, p.f)).toFixed(2) + ')'; ctx.fillRect(p.x, p.y, 1.2, 1.2); });
    var list = [];
    stars.forEach(function(s){ if(!visible(s)) return; var p = project(s.x, s.y, s.z); if(p.z < -1400) return; s.p = p; list.push(s); });
    list.sort(function(a, b){ return b.p.z - a.p.z; });
    var q = st.q.trim().toUpperCase();
    ctx.globalCompositeOperation = 'lighter';
    list.forEach(function(s){
      var v = st.col === 'rsi' ? s.s.rsi : s.s[st.col];
      var rgb = colorFor(+v, st.col);
      rgb = rgb.map(function(c){ return Math.round(c / 16) * 16; });
      var r = s.size * s.p.f * (Math.min(W, H) / 900) * 3.4;
      var hit = q && (s.key.indexOf(q) === 0 || String(s.s.name || '').toUpperCase().indexOf(q) !== -1);
      if(q && !hit) ctx.globalAlpha = 0.25;
      ctx.drawImage(sprite(rgb), s.p.x - r, s.p.y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      s.r = r;
    });
    ctx.globalCompositeOperation = 'source-over';
    // galaxy labels
    ctx.font = '600 ' + Math.round(12 * Math.max(.8, Math.min(1.3, 1 / st.dist))) + 'px Inter, "Noto Sans Thai", sans-serif'; ctx.textAlign = 'center';
    galaxies.forEach(function(gx){
      var p = project(gx.x, gx.y, gx.z); if(p.z < -1200) return;
      ctx.fillStyle = 'rgba(200,225,255,' + Math.max(.25, Math.min(.85, p.f)).toFixed(2) + ')';
      ctx.fillText((L() === 'th' ? (SECT_TH[gx.name] || gx.name) : gx.name) + ' · ' + gx.n, p.x, p.y);
    });
    // labels for the biggest / matched / hovered stars
    ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
    var big = list.filter(function(s){ return s.r > 26; }).sort(function(a, b){ return b.r - a.r; }).slice(0, 14);
    list.forEach(function(s){
      var show = s === st.hover || s === st.sel || (q && q.length >= 2 && s.key.indexOf(q) === 0) || big.indexOf(s) !== -1;
      if(!show) return;
      ctx.fillStyle = s === st.sel ? '#ffd27a' : 'rgba(235,245,255,.9)';
      ctx.fillText(s.key, s.p.x + s.r * 0.45, s.p.y - s.r * 0.35);
    });
    if(st.sel && st.sel.p){
      ctx.strokeStyle = 'rgba(255,210,122,.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(st.sel.p.x, st.sel.p.y, Math.max(8, st.sel.r * 0.6), 0, Math.PI * 2); ctx.stroke();
    }
  }
  function resize(){
    if(!cv) return;
    var r = cv.parentNode.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(300, r.width); H = Math.max(360, r.height);
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
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
    // rotate so the star comes to the front
    var targetRy = Math.atan2(s.x, -s.z) ; var a0 = st.ry, t0 = performance.now();
    var d = targetRy - a0; while(d > Math.PI) d -= Math.PI * 2; while(d < -Math.PI) d += Math.PI * 2;
    st.spin = false;
    (function step(now){ var u = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - u, 3); st.ry = a0 + d * e; st.dist = Math.max(0.55, st.dist + (0.62 - st.dist) * e * 0.2); if(u < 1) requestAnimationFrame(step); else paintCtl(); })(t0);
  }
  function paintCtl(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-un="' + k + '"]'); };
    q('eb').textContent = T(U.eb); q('h').textContent = T(U.h); q('lede').textContent = T(U.lede);
    var n = stars.filter(visible).length;
    q('ctl').innerHTML = '<div class="un-seg">' + ['all', 'us', 'th'].map(function(k){ return '<button type="button" data-un-mk="' + k + '" class="' + (st.mk === k ? 'on' : '') + '">' + esc(T(U[k])) + '</button>'; }).join('') + '</div>' +
      '<div class="un-seg">' + ['m1', 'm3', 'rsi'].map(function(k){ return '<button type="button" data-un-col="' + k + '" class="' + (st.col === k ? 'on' : '') + '">' + esc(T(U[k])) + '</button>'; }).join('') + '</div>' +
      '<input type="search" data-un-q placeholder="' + esc(T(U.find)) + '" value="' + esc(st.q) + '" list="unList">' +
      '<button type="button" class="un-b' + (st.spin ? ' on' : '') + '" data-un-act="spin">' + esc(T(U.spin)) + '</button>' +
      '<button type="button" class="un-b" data-un-act="reset">' + esc(T(U.reset)) + '</button>' +
      '<button type="button" class="un-b" data-un-act="fs">' + esc(T(U.full)) + '</button>' +
      '<span class="un-n">' + n + ' ' + esc(T(U.stars)) + '</span>';
    q('lg').innerHTML = '<span class="un-grad"></span><em>' + esc(T(U.lgDn)) + '</em><em>' + esc(T(U.lgUp)) + '</em><span class="un-sz">' + esc(T(U.lgSz)) + '</span>';
    var dl = document.getElementById('unList');
    if(dl && !dl.children.length && stars.length) dl.innerHTML = stars.map(function(s){ return '<option value="' + esc(s.key) + '">'; }).join('');
    card();
  }
  function wire(){
    var stage = sec.querySelector('.un-stage'), pts = {}, drag = null, pinch = null, moved = false;
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
        if(pinch && ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; st.dist = Math.max(0.35, Math.min(2.6, pinch.dist * pinch.d / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)))); moved = true; return; }
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
    stage.addEventListener('wheel', function(ev){ if(ev.target !== cv) return; ev.preventDefault(); st.dist = Math.max(0.35, Math.min(2.6, st.dist * (ev.deltaY > 0 ? 1.08 : 0.92))); }, { passive:false });
    sec.addEventListener('click', function(ev){
      var b;
      if((b = ev.target.closest('[data-un-mk]'))){ st.mk = b.getAttribute('data-un-mk'); paintCtl(); return; }
      if((b = ev.target.closest('[data-un-col]'))){ st.col = b.getAttribute('data-un-col'); paintCtl(); return; }
      if((b = ev.target.closest('[data-un-act]'))){
        var a = b.getAttribute('data-un-act');
        if(a === 'spin') st.spin = !st.spin;
        else if(a === 'reset'){ st.rx = -0.42; st.ry = 0; st.dist = 1; st.sel = null; st.q = ''; }
        else if(a === 'close') st.sel = null;
        else if(a === 'fs'){ if(document.fullscreenElement) document.exitFullscreen(); else if(stage.requestFullscreen) stage.requestFullscreen().catch(function(){}); }
        else if(a === 'wave' && st.sel){
          var sym = st.sel.s.yahoo && st.sel.s.cal === 'th' ? st.sel.key : st.sel.key;
          try { localStorage.setItem('spz.aw.sym', sym); } catch(e){}
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
      if(m){ st.sel = m; flyTo(m); card(); }
    });
    window.addEventListener('resize', resize);
    document.addEventListener('fullscreenchange', function(){ setTimeout(resize, 60); });
  }
  function build(){
    if(document.getElementById('universe')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'universe'; sec.setAttribute('data-route', 'universe');
    sec.innerHTML = '<div class="un-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-un="eb"></span></div><h2 data-un="h"></h2><p class="lede" data-un="lede"></p><div class="rule"></div></div>' +
      '<div class="un-ctl" data-un="ctl"></div><datalist id="unList"></datalist>' +
      '<div class="un-stage"><canvas></canvas><div class="un-card" data-un="card"></div><div class="un-lg" data-un="lg"></div></div></div>';
    document.body.appendChild(sec);
    cv = sec.querySelector('canvas'); ctx = cv.getContext('2d');
    window.__spzAddRoute({ id:'universe', after:'globe', t:U.h, d:{ en:'Every stock as a star: sectors are galaxies, size is market cap, colour is momentum.', th:'หุ้นทุกตัวเป็นดาว กลุ่มอุตสาหกรรมเป็นกาแล็กซี ขนาดตามมูลค่าตลาด สีตามโมเมนตัม' } });
    wire(); resize(); buildStars(); paintCtl();
    window.addEventListener('hashchange', function(){ if(location.hash === '#/universe'){ setTimeout(function(){ resize(); if(!stars.length) buildStars(); paintCtl(); }, 50); } });
    new MutationObserver(function(){ paintCtl(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    setInterval(function(){ if(location.hash === '#/universe' && !stars.length && buildStars()) paintCtl(); }, 1500);
    if(!raf) raf = requestAnimationFrame(draw);
    return true;
  }
  function boot(){ var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 400); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  else setTimeout(boot, 1500);
})();
