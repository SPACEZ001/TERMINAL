/* =====================================================================
   SPACEZ HOME HERO v2 (2026-11-07)
   User request: a new, prettier first screen instead of the scroll-story
   "clock" instrument. A clear promise (learn from zero → read the market),
   two actions, live numbers, and a "market pulse" card built from the same
   data/market.json snapshot the rest of the site uses (window.__SPZ_LIVE):
   S&P 500, an equal-weight line of the US list, today's up/down breadth for
   US and Thai stocks, sector tiles and the biggest movers. The old hero
   (section.hero.hv) is hidden by part-85.css, not deleted.
   ===================================================================== */
(function(){
  'use strict';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function num(v){ return typeof v === 'number' && isFinite(v); }
  function sg(v, d){ return num(v) ? (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d == null ? 2 : d) : '—'; }
  function fmt(v, d){ return num(v) ? v.toLocaleString('en-US', { minimumFractionDigits:d, maximumFractionDigits:d }) : '—'; }
  var B = function(en, th){ return { en:en, th:th }; };

  var TX = {
    eb:B('Live market data · updated every 30 minutes', 'ข้อมูลตลาดจริง · อัปเดตทุก 30 นาที'),
    h1a:B('Learn stocks from zero', 'เรียนหุ้นจากศูนย์'),
    h1b:B('until you can read the market', 'จนอ่านตลาดเป็น'),
    p:B('A step-by-step classroom and real analysis tools in one place — every number explained in plain language, in Thai and English.', 'ห้องเรียนทีละขั้น และเครื่องมือวิเคราะห์จริงในที่เดียว ทุกตัวเลขอธิบายเป็นภาษาคน ทั้งภาษาไทยและอังกฤษ'),
    go1:B('Start lesson 1', 'เริ่มบทเรียนแรก'), go2:B('See today\'s market', 'ดูตลาดวันนี้'), all:B('See every menu', 'ดูทุกเมนู'),
    s1:B('stocks tracked', 'หุ้นที่ติดตาม'), s2:B('lessons, 6 levels', 'บทเรียน 6 ระดับ'), s3:B('price updates', 'อัปเดตราคา'), s3v:B('30 min', '30 นาที'), s4:B('languages', 'ภาษา'),
    pulse:B('Market pulse', 'ชีพจรตลาด'), ago:B(' ago', 'ที่แล้ว'), spx:B('S&P 500', 'S&P 500'), today:B('today', 'วันนี้'), ytd:B('this year', 'ปีนี้'),
    line:B('US list, equal parts · last 6 months', 'หุ้นสหรัฐฯ ทั้งรายชื่อ ถือเท่าๆ กัน · 6 เดือน'),
    br:B('Up vs down today', 'หุ้นขึ้น vs ลง วันนี้'), us:B('US', 'สหรัฐฯ'), th:B('Thai', 'ไทย'), up:B('up', 'ขึ้น'), dn:B('down', 'ลง'),
    sec:B('Sectors today', 'กลุ่มอุตสาหกรรมวันนี้'), mov:B('Biggest moves today', 'ขยับแรงสุดวันนี้'),
    fear:B('Fear gauge (VIX)', 'ดัชนีความกลัว (VIX)'), y10:B('US 10-year yield', 'บอนด์สหรัฐฯ 10 ปี'), usd:B('Dollar index', 'ดัชนีดอลลาร์'),
    open:B('open', 'เปิด'), closed:B('closed', 'ปิด'), wait:B('Loading live data…', 'กำลังโหลดข้อมูลสด…'),
    pathH:B('Your path — four steps', 'เส้นทางของคุณ — 4 ขั้น'),
    p1:B('Learn the basics', 'เรียนพื้นฐาน'), p1d:B('What a stock is, dividends, P/E — 26 short lessons with quizzes.', 'หุ้นคืออะไร ปันผล P/E — 26 บทสั้นๆ พร้อมคำถามเช็กความเข้าใจ'),
    p2:B('Read the market', 'อ่านภาพรวมตลาด'), p2d:B('Is now a good time? The economy, rates and risk in one screen.', 'ตอนนี้ดีไหม เศรษฐกิจ ดอกเบี้ย และความเสี่ยงในหน้าเดียว'),
    p3:B('Check one stock', 'เช็กหุ้นรายตัว'), p3d:B('Price, dividend, valuation and trend of any stock, explained.', 'ราคา ปันผล ความแพง และแนวโน้มของหุ้นทุกตัว พร้อมคำอธิบาย'),
    p4:B('Build a watchlist', 'สร้างรายการหุ้นของฉัน'), p4d:B('Follow the stocks you like and see when something changes.', 'ติดตามหุ้นที่สนใจ และดูว่ามีอะไรเปลี่ยนไป')
  };

  var IC = {
    book:'<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', down:'<path d="M12 5v14M6 13l6 6 6-6"/>'
  };
  function ico(k){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }

  /* ---------- numbers from the snapshot ---------- */
  function ewLine(d, n){
    var S = d && d.stocks; if(!S) return null;
    var series = [], k;
    for(k in S){ var s = S[k]; if(s.cal !== 'us' || !s.c) continue; var c = typeof s.c === 'string' ? s.c.split(',').map(Number) : s.c; if(c.length >= n + 1) series.push(c.slice(-(n + 1))); }
    if(series.length < 20) return null;
    var out = [1];
    for(var i = 1; i <= n; i++){ var r = 0, m = 0; series.forEach(function(c){ var a = c[i - 1], b = c[i]; if(a > 0 && b > 0){ var x = b / a - 1; if(Math.abs(x) < 0.5){ r += x; m++; } } }); out.push(out[i - 1] * (1 + (m ? r / m : 0))); }
    return { v:out, n:series.length };
  }
  function breadth(d, cal){
    var S = d && d.stocks, up = 0, dn = 0; if(!S) return null;
    for(var k in S){ var s = S[k]; if(s.cal !== cal || !num(s.chg_pct)) continue; if(s.chg_pct > 0) up++; else if(s.chg_pct < 0) dn++; }
    return up + dn ? { up:up, dn:dn } : null;
  }
  function movers(d){
    var S = d && d.stocks, a = []; if(!S) return [];
    for(var k in S){ var s = S[k]; if(num(s.chg_pct) && num(s.price) && (s.mcap || 0) > 5e9) a.push([k, s.chg_pct, s.cal]); }
    a.sort(function(x, y){ return Math.abs(y[1]) - Math.abs(x[1]); });
    return a.slice(0, 6);
  }
  function mkOpen(){
    try { var ms = window.__SPZ_LIVE && window.__SPZ_LIVE.marketStatus && window.__SPZ_LIVE.marketStatus(); if(ms) return ms; } catch(e){}
    return null;
  }

  /* ---------- pieces ---------- */
  function sparkSVG(line){
    var W = 420, H = 120, v = line.v, n = v.length, lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), pad = (hi - lo) * 0.12 || 0.01;
    lo -= pad; hi += pad;
    var X = function(i){ return (i / (n - 1)) * W; }, Y = function(x){ return H - ((x - lo) / (hi - lo)) * H; };
    var d = v.map(function(x, i){ return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1); }).join(' ');
    var up = v[n - 1] >= v[0], col = up ? '#34d399' : '#fb7185';
    return '<svg class="spzh-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><defs><linearGradient id="spzhG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".35"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
      [0.25, 0.5, 0.75].map(function(f){ return '<line x1="0" x2="' + W + '" y1="' + (H * f).toFixed(0) + '" y2="' + (H * f).toFixed(0) + '" class="gl"/>'; }).join('') +
      '<path d="' + d + ' L' + W + ' ' + H + ' L0 ' + H + 'Z" fill="url(#spzhG)" class="ar"/><path d="' + d + '" class="ln" style="stroke:' + col + '"/>' +
      '<circle class="pt" cx="' + X(n - 1).toFixed(1) + '" cy="' + Y(v[n - 1]).toFixed(1) + '" r="4" style="fill:' + col + '"/><circle class="pp" cx="' + X(n - 1).toFixed(1) + '" cy="' + Y(v[n - 1]).toFixed(1) + '" r="4" style="stroke:' + col + '"/></svg>';
  }
  function brRow(lab, b){
    if(!b) return '';
    var t = b.up + b.dn, pu = b.up / t * 100;
    return '<div class="spzh-br"><span class="l">' + esc(T(lab)) + '</span><div class="bar"><i class="u" style="width:' + pu.toFixed(1) + '%"></i><i class="d" style="width:' + (100 - pu).toFixed(1) + '%"></i></div><span class="n"><b class="u">' + b.up + '</b> / <b class="d">' + b.dn + '</b></span></div>';
  }
  function pulseHTML(d){
    if(!d || !d.stocks) return '<div class="spzh-card spzh-wait"><div class="spzh-shim"></div><div class="spzh-shim s2"></div><div class="spzh-shim s3"></div><span>' + esc(T(TX.wait)) + '</span></div>';
    var M = d.macro || {}, spx = M.spx || {}, line = ewLine(d, 126), age = null;
    try { age = window.__SPZ_LIVE.snapAgeH(); } catch(e){}
    var agoTxt = age == null ? '' : (age < 1 ? Math.max(1, Math.round(age * 60)) + (L() === 'th' ? ' นาที' : ' min') : Math.round(age) + (L() === 'th' ? ' ชม.' : ' h')) + T(TX.ago);
    var secs = ((d.flows && d.flows.sector) || []).slice().sort(function(a, b){ return (b.d1 || 0) - (a.d1 || 0); });
    var mx = 0.5; secs.forEach(function(s){ if(num(s.d1)) mx = Math.max(mx, Math.abs(s.d1)); });
    var tiles = secs.map(function(s){ var v = s.d1 || 0, a = Math.min(1, Math.abs(v) / mx); return '<div class="spzh-tile ' + (v >= 0 ? 'u' : 'd') + '" style="--a:' + (0.12 + a * 0.55).toFixed(2) + '"><span>' + esc(L() === 'th' ? (s.th || s.en) : s.en) + '</span><b>' + sg(v, 1) + '%</b></div>'; }).join('');
    var mv = movers(d).map(function(m){ return '<span class="spzh-mv ' + (m[1] >= 0 ? 'u' : 'd') + '"><b>' + esc(m[0]) + '</b>' + sg(m[1], 1) + '%</span>'; }).join('');
    var ms = mkOpen(), stTxt = '';
    if(ms && typeof ms === 'object'){ var us = ms.us, th = ms.set; var f = function(x){ return x == null ? '' : (x.open || x === 'open' || x === true) ? T(TX.open) : T(TX.closed); }; if(us != null) stTxt = T(TX.us) + ' ' + f(us) + (th != null ? ' · ' + T(TX.th) + ' ' + f(th) : ''); }
    return '<div class="spzh-card">' +
      '<div class="spzh-ch"><span class="spzh-live"><i></i>' + esc(T(TX.pulse)) + '</span><span class="spzh-age">' + esc(stTxt ? stTxt + ' · ' : '') + esc(agoTxt) + '</span></div>' +
      '<div class="spzh-ix"><div><small>' + esc(T(TX.spx)) + '</small><b>' + fmt(spx.price, 0) + '</b></div><span class="spzh-chip ' + ((spx.d1 || 0) >= 0 ? 'u' : 'd') + '">' + sg(spx.d1, 2) + '% ' + esc(T(TX.today)) + '</span><span class="spzh-chip g">' + sg(spx.ytd, 1) + '% ' + esc(T(TX.ytd)) + '</span></div>' +
      (line ? '<div class="spzh-lw">' + sparkSVG(line) + '<small>' + esc(T(TX.line)) + ' · ' + line.n + (L() === 'th' ? ' ตัว' : ' stocks') + ' · ' + sg((line.v[line.v.length - 1] - 1) * 100, 1) + '%</small></div>' : '') +
      '<h6>' + esc(T(TX.br)) + '</h6>' + brRow(TX.us, breadth(d, 'us')) + brRow(TX.th, breadth(d, 'th')) +
      '<h6>' + esc(T(TX.sec)) + '</h6><div class="spzh-tiles">' + tiles + '</div>' +
      (mv ? '<h6>' + esc(T(TX.mov)) + '</h6><div class="spzh-mvs">' + mv + '</div>' : '') +
      '</div>' +
      '<div class="spzh-float f1"><small>' + esc(T(TX.fear)) + '</small><b>' + fmt((M.vix || {}).price, 1) + '</b><em class="' + (((M.vix || {}).d1 || 0) <= 0 ? 'u' : 'd') + '">' + sg((M.vix || {}).d1, 1) + '%</em></div>' +
      '<div class="spzh-float f2"><small>' + esc(T(TX.y10)) + '</small><b>' + fmt((M.us10y || {}).price, 2) + '%</b></div>' +
      '<div class="spzh-float f3"><small>' + esc(T(TX.usd)) + '</small><b>' + fmt((M.dxy || {}).price, 1) + '</b></div>';
  }
  function heroHTML(d){
    var cnt = d && d.counts && d.counts.stocks ? d.counts.stocks : 555;
    var st = [[cnt, TX.s1], [26, TX.s2], [T(TX.s3v), TX.s3], ['TH · EN', TX.s4]];
    var path = [['stockclass', 'book', TX.p1, TX.p1d, '#34d399'], ['now', 'globe', TX.p2, TX.p2d, '#22d3ee'], ['stock', 'search', TX.p3, TX.p3d, '#a78bfa'], ['watchlist', 'star', TX.p4, TX.p4d, '#f472b6']];
    return '<div class="spzh-bg" aria-hidden="true"><i class="o1"></i><i class="o2"></i><i class="o3"></i><div class="spzh-floor"></div></div>' +
      '<div class="spzh-in"><div class="spzh-l">' +
        '<div class="spzh-eb"><span class="dot"></span>' + esc(T(TX.eb)) + '</div>' +
        '<h1><span class="a">' + esc(T(TX.h1a)) + '</span><span class="b">' + esc(T(TX.h1b)) + '</span></h1>' +
        '<p class="spzh-p">' + esc(T(TX.p)) + '</p>' +
        '<div class="spzh-cta"><button type="button" class="spzh-go" data-spzh-go="stockclass">' + esc(T(TX.go1)) + ico('arrow') + '</button><button type="button" class="spzh-gh" data-spzh-go="now">' + esc(T(TX.go2)) + '</button></div>' +
        '<div class="spzh-stats">' + st.map(function(s, i){ return '<div style="animation-delay:' + (0.5 + i * 0.08).toFixed(2) + 's"><b>' + esc(s[0]) + '</b><span>' + esc(T(s[1])) + '</span></div>'; }).join('') + '</div>' +
      '</div><div class="spzh-r" data-spzh="pulse">' + pulseHTML(d) + '</div></div>' +
      '<div class="spzh-path"><h2>' + esc(T(TX.pathH)) + '</h2><div class="spzh-pg">' + path.map(function(p, i){ return '<button type="button" class="spzh-step" data-spzh-go="' + p[0] + '" style="--c:' + p[4] + '"><span class="no">0' + (i + 1) + '</span><i>' + ico(p[1]) + '</i><b>' + esc(T(p[2])) + '</b><span class="d">' + esc(T(p[3])) + '</span><em>' + ico('arrow') + '</em></button>'; }).join('') + '</div>' +
      '<button type="button" class="spzh-all" data-spzh-all="1">' + esc(T(TX.all)) + ico('down') + '</button></div>';
  }

  var sec = null;
  function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }
  function paint(){ if(sec) sec.innerHTML = heroHTML(snap()); }
  function paintPulse(){ var r = sec && sec.querySelector('[data-spzh="pulse"]'); if(r) r.innerHTML = pulseHTML(snap()); var b = sec && sec.querySelector('.spzh-stats b'); var d = snap(); if(b && d && d.counts && d.counts.stocks) b.textContent = d.counts.stocks; }
  function mount(){
    if(document.getElementById('spzHome')) return;
    var old = document.querySelector('section.hero.hv');
    sec = document.createElement('section');
    sec.id = 'spzHome'; sec.className = 'spzh'; sec.setAttribute('data-route', 'home');
    if(old && old.parentNode) old.parentNode.insertBefore(sec, old); else { var hub = document.getElementById('hub'); if(hub && hub.parentNode) hub.parentNode.insertBefore(sec, hub); else document.body.appendChild(sec); }
    if(!location.hash || /^#\/?(home)?$/.test(location.hash)) sec.classList.add('route-on');
    paint();
    sec.addEventListener('click', function(ev){
      var g = ev.target.closest('[data-spzh-go]'); if(g){ location.hash = '#/' + g.getAttribute('data-spzh-go'); return; }
      if(ev.target.closest('[data-spzh-all]')){ var hub = document.getElementById('hub'); if(hub) hub.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
    document.addEventListener('spz:snapshot', paintPulse);
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    var n = 0, iv = setInterval(function(){ if(snap() || ++n > 40){ clearInterval(iv); paintPulse(); } }, 500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
