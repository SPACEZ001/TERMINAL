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
    pathH:B('Your path', 'เส้นทางของคุณ'), pathH2:B('Four steps from beginner to reading the market', '4 ขั้น จากมือใหม่ สู่การอ่านตลาดเป็น'),
    /* 2026-11-11 (home v3): trust line, topic ribbon, closing band */
    t1:B('Start from zero', 'เริ่มจากศูนย์ได้'), t2:B('Every number explained', 'ทุกตัวเลขมีคำอธิบาย'), t3:B('Education only — not investment advice', 'เพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'),
    endE:B('Ready when you are', 'พร้อมเมื่อไหร่ เริ่มได้เลย'), endH:B('Start with lesson 1 today', 'เริ่มบทเรียนแรกวันนี้'),
    endP:B('Short lessons, real market numbers and tools that explain themselves. Go at your own pace.', 'บทเรียนสั้นๆ ตัวเลขตลาดจริง และเครื่องมือที่อธิบายตัวเอง เรียนตามจังหวะของคุณได้เลย'),
    endI:B('IC licence exam prep', 'ติวสอบใบอนุญาต IC'), endG:B('SPACEZ ISLAND — the economy game', 'SPACEZ ISLAND — เกมสร้างเศรษฐกิจ'),
    p1:B('Learn the basics', 'เรียนพื้นฐาน'), p1d:B('What a stock is, dividends, P/E — 26 short lessons with quizzes.', 'หุ้นคืออะไร ปันผล P/E — 26 บทสั้นๆ พร้อมคำถามเช็กความเข้าใจ'),
    p2:B('Read the market', 'อ่านภาพรวมตลาด'), p2d:B('Is now a good time? The economy, rates and risk in one screen.', 'ตอนนี้ดีไหม เศรษฐกิจ ดอกเบี้ย และความเสี่ยงในหน้าเดียว'),
    p3:B('Check one stock', 'เช็กหุ้นรายตัว'), p3d:B('Price, dividend, valuation and trend of any stock, explained.', 'ราคา ปันผล ความแพง และแนวโน้มของหุ้นทุกตัว พร้อมคำอธิบาย'),
    p4:B('Build a watchlist', 'สร้างรายการหุ้นของฉัน'), p4d:B('Follow the stocks you like and see when something changes.', 'ติดตามหุ้นที่สนใจ และดูว่ามีอะไรเปลี่ยนไป')
  };

  var TAGS = [B('What is a stock', 'หุ้นคืออะไร'), B('Dividends', 'เงินปันผล'), B('P/E & valuation', 'P/E และความแพง'), B('Candlesticks', 'กราฟแท่งเทียน'), B('Financial statements', 'งบการเงิน'), B('Interest rates', 'ดอกเบี้ย'), B('Inflation', 'เงินเฟ้อ'), B('Market cycles', 'วัฏจักรตลาด'), B('Elliott Wave', 'Elliott Wave'), B('Risk & diversification', 'ความเสี่ยงและการกระจาย'), B('Funds & ETFs', 'กองทุนและ ETF'), B('Bonds', 'ตราสารหนี้'), B('Watchlist', 'รายการหุ้นของฉัน'), B('IC exam prep', 'ติวสอบ IC')];
  var TAGC = ['#22d3ee', '#818cf8', '#f472b6', '#34d399', '#fbbf24'];
  function tagsHTML(){
    var one = function(hid){ return TAGS.map(function(t, i){ return '<span' + (hid ? ' aria-hidden="true"' : '') + ' style="--c:' + TAGC[i % TAGC.length] + '"><i></i>' + esc(T(t)) + '</span>'; }).join(''); };
    return '<div class="spzh-mq"><div class="spzh-mqt">' + one(false) + one(true) + '</div></div>';
  }
  var IC = {
    book:'<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
    cap:'<path d="M2.5 9.5L12 5l9.5 4.5L12 14 2.5 9.5z"/><path d="M6.5 11.6V16c1.6 1.4 3.4 2 5.5 2s3.9-.6 5.5-2v-4.4M21.5 9.5V15"/>',
    game:'<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 11v3M6 12.5h3M15.5 11.6v.1M18 13.4v.1"/>'
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

  /* ---------- 2026-11-07: "stocks in one minute" infographic under the hero (user request) ---------- */
  var BX = {
    eb:B('The basics · one minute', 'พื้นฐาน · อ่าน 1 นาที'),
    h:B('How stocks work, in four pictures', 'หุ้นทำงานยังไง ใน 4 ภาพ'),
    c1:B('A share is a small piece of a company', 'หุ้น 1 หุ้น = เป็นเจ้าของบริษัทชิ้นเล็กๆ'),
    c1d:B('A company splits itself into many equal pieces and sells some of them to raise money. Buy one and you own part of the business — its profits and its risks.', 'บริษัทแบ่งตัวเองเป็นชิ้นเท่าๆ กันจำนวนมาก แล้วขายบางส่วนเพื่อระดมเงิน ซื้อมา 1 ชิ้น คุณก็เป็นเจ้าของธุรกิจส่วนหนึ่ง ทั้งกำไรและความเสี่ยง'),
    c1k:B('own 1 of 1,000 pieces = 0.1% of the company', 'ถือ 1 ใน 1,000 ชิ้น = เป็นเจ้าของ 0.1%'),
    c2:B('Two ways to earn', 'ได้เงินจากหุ้น 2 ทาง'),
    c2d:B('The price can rise above what you paid (a capital gain), and many companies share part of their profit as dividends.', 'ราคาขึ้นสูงกว่าที่ซื้อ (กำไรส่วนต่าง) และบริษัทจำนวนมากแบ่งกำไรให้ผู้ถือหุ้นเป็น "เงินปันผล"'),
    c3:B('What moves the price', 'อะไรทำให้ราคาขยับ'),
    c3d:B('Over years, profit growth matters most. Over weeks, interest rates and the crowd\'s mood — fear and greed — can push prices far from fair value.', 'ระยะยาว กำไรที่โตขึ้นสำคัญที่สุด ระยะสั้น ดอกเบี้ยและอารมณ์ของคนในตลาด (กลัว/โลภ) ดันราคาให้ห่างจากมูลค่าจริงได้มาก'),
    f1:B('Profit', 'กำไรบริษัท'), f2:B('Interest rates', 'ดอกเบี้ย'), f3:B('Mood', 'อารมณ์ตลาด'), f1s:B('years', 'หลายปี'), f2s:B('months', 'หลายเดือน'), f3s:B('days', 'รายวัน'),
    c4:B('Lower the risk', 'ลดความเสี่ยง'),
    c4d:B('Prices can fall, sometimes a lot. Spread money across many companies, add money regularly, and give it years — not days.', 'ราคาลงได้ บางครั้งลงหนัก กระจายเงินไปหลายบริษัท ทยอยลงทุนสม่ำเสมอ และให้เวลาเป็นปี ไม่ใช่เป็นวัน'),
    ex:B('Worked example', 'ตัวอย่างคิดเลข'),
    exa:B('Buy 100 shares at ฿50', 'ซื้อ 100 หุ้น ราคา ฿50'), exb:B('Price rises to ฿60', 'ราคาขึ้นเป็น ฿60'), exc:B('Dividend ฿2 a share', 'ปันผลหุ้นละ ฿2'), exd:B('Total after one year', 'รวมผลตอบแทน 1 ปี'),
    cp:B('Time does the heavy lifting', 'เวลาคือตัวช่วยที่ใหญ่ที่สุด'),
    cpd:B('฿10,000 growing 7% a year, gains reinvested. An illustration of compounding, not a promise — real returns go up and down.', '฿10,000 โตปีละ 7% และนำผลตอบแทนลงทุนต่อ เป็นภาพอธิบายดอกเบี้ยทบต้น ไม่ใช่คำสัญญา ผลตอบแทนจริงขึ้นลงได้'),
    yr:B('yr', 'ปี'), more:B('Learn this properly in lesson 1', 'เรียนเรื่องนี้แบบละเอียดในบทที่ 1')
  };
  function svgWrap(inner){ return '<svg class="spzb-art" viewBox="0 0 200 120" fill="none" aria-hidden="true">' + inner + '</svg>'; }
  function art1(){
    var cells = '';
    for(var r = 0; r < 5; r++) for(var c = 0; c < 10; c++){ var on = r === 1 && c === 6; cells += '<rect x="' + (42 + c * 12) + '" y="' + (22 + r * 12) + '" width="9" height="9" rx="2" class="' + (on ? 'own' : 'cl') + '" style="--d:' + ((r * 10 + c) * 12) + 'ms"/>'; }
    return svgWrap('<path d="M34 92 V18 l30 -10 30 10 30 -10 30 10 V92 Z" class="bld"/>' + cells + '<path d="M120 46 C140 56 152 74 160 96" class="lk"/><circle cx="166" cy="102" r="7" class="pp"/><path d="M155 118 c2-9 20-9 22 0" class="pp"/>');
  }
  function art2(){
    return svgWrap('<path d="M14 100 L60 78 L92 86 L132 52 L176 30" class="ln2"/><path d="M164 28 l12 2 -2 12" class="ln2"/>' +
      '<line x1="14" y1="100" x2="186" y2="100" class="ax"/><g class="coin c1"><circle cx="60" cy="58" r="11"/><text x="60" y="62">฿</text></g><g class="coin c2"><circle cx="132" cy="30" r="11"/><text x="132" y="34">฿</text></g>' +
      '<rect x="140" y="64" width="40" height="18" rx="9" class="tag"/><text x="160" y="77" class="tt">+%</text>');
  }
  function art3(){
    var g = function(x, col, v, d){ var a = -Math.PI + v * Math.PI, r = 20, cx = x, cy = 70; return '<path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" class="ga"/><path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1) + '" class="gv" style="stroke:' + col + ';--d:' + d + 'ms"/><line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (r - 6) * Math.cos(a)).toFixed(1) + '" y2="' + (cy + (r - 6) * Math.sin(a)).toFixed(1) + '" class="nd"/>'; };
    return svgWrap(g(40, '#34d399', 0.8, 0) + g(100, '#fbbf24', 0.45, 150) + g(160, '#f472b6', 0.62, 300) +
      '<path d="M16 34 C40 14 56 40 78 26 S118 8 134 24 S170 30 186 12" class="ln3"/>');
  }
  function art4(){
    var dots = '', cols = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#fb7185', '#2dd4bf'];
    for(var i = 0; i < 8; i++){ dots += '<circle cx="' + (36 + (i % 4) * 18) + '" cy="' + (58 + Math.floor(i / 4) * 18) + '" r="6.5" style="fill:' + cols[i] + ';--d:' + (i * 70) + 'ms" class="dt"/>'; }
    return svgWrap('<path d="M22 50 h96 l-10 52 h-76 z" class="bk"/>' + dots +
      '<path d="M132 92 h50" class="ax"/><path d="M132 92 C146 88 150 70 160 74 S172 52 182 44" class="ln4"/><text x="157" y="110" class="tt2">' + esc(L() === 'th' ? 'เวลา' : 'time') + ' →</text>');
  }
  function compound(){
    var ys = [0, 5, 10, 15, 20, 25, 30], v = ys.map(function(y){ return 10000 * Math.pow(1.07, y); }), mx = v[v.length - 1];
    return '<div class="spzb-cp"><div class="spzb-cph"><b>' + esc(T(BX.cp)) + '</b><span>' + esc(T(BX.cpd)) + '</span></div><div class="spzb-bars">' +
      ys.map(function(y, i){ var h = Math.max(4, v[i] / mx * 100); return '<div class="spzb-bar" style="--h:' + h.toFixed(1) + '%;--d:' + (i * 90) + 'ms"><em>฿' + Math.round(v[i]).toLocaleString('en-US') + '</em><i></i><span>' + y + ' ' + esc(T(BX.yr)) + '</span></div>'; }).join('') + '</div></div>';
  }
  function basicsHTML(){
    var cards = [[art1(), BX.c1, BX.c1d, '<span class="spzb-k">' + esc(T(BX.c1k)) + '</span>', '#22d3ee'],
      [art2(), BX.c2, BX.c2d, '', '#34d399'],
      [art3(), BX.c3, BX.c3d, '<div class="spzb-fs"><span style="--c:#34d399">' + esc(T(BX.f1)) + '<small>' + esc(T(BX.f1s)) + '</small></span><span style="--c:#fbbf24">' + esc(T(BX.f2)) + '<small>' + esc(T(BX.f2s)) + '</small></span><span style="--c:#f472b6">' + esc(T(BX.f3)) + '<small>' + esc(T(BX.f3s)) + '</small></span></div>', '#fbbf24'],
      [art4(), BX.c4, BX.c4d, '', '#a78bfa']];
    var ex = [[BX.exa, '฿5,000', ''], [BX.exb, '+฿1,000', 'u'], [BX.exc, '+฿200', 'u'], [BX.exd, '+฿1,200 · +24%', 'g']];
    return '<div class="spzb" data-spzb="1"><div class="spzb-hd"><span class="spzb-eb">' + esc(T(BX.eb)) + '</span><h2>' + esc(T(BX.h)) + '</h2></div>' +
      '<div class="spzb-grid">' + cards.map(function(c, i){ return '<article class="spzb-c" style="--c:' + c[4] + ';--i:' + i + '"><span class="spzb-no">0' + (i + 1) + '</span>' + c[0] + '<h3>' + esc(T(c[1])) + '</h3><p>' + esc(T(c[2])) + '</p>' + c[3] + '</article>'; }).join('') + '</div>' +
      '<div class="spzb-row"><div class="spzb-ex"><b class="spzb-exh">' + esc(T(BX.ex)) + '</b>' + ex.map(function(e, i){ return '<div class="spzb-exr ' + e[2] + '" style="--d:' + (i * 120) + 'ms"><span>' + esc(T(e[0])) + '</span><b>' + e[1] + '</b></div>'; }).join('') +
        '<small>' + esc(L() === 'th' ? '(60 − 50) × 100 = 1,000 · 2 × 100 = 200 · 1,200 ÷ 5,000 = 24% (ยังไม่หักค่าธรรมเนียมและภาษี)' : '(60 − 50) × 100 = 1,000 · 2 × 100 = 200 · 1,200 ÷ 5,000 = 24% (before fees and tax)') + '</small></div>' + compound() + '</div>' +
      '<button type="button" class="spzb-more" data-spzh-go="stockclass">' + esc(T(BX.more)) + ico('arrow') + '</button></div>';
  }

  /* ---------- 2026-11-07: five short lessons before entering the site (user request: "more basics") ---------- */
  var LX = {
    eb:B('Before you start · 5 short lessons', 'ก่อนเริ่ม · 5 บทสั้นๆ'),
    h:B('The basics everyone should know first', 'พื้นฐานที่ควรรู้ก่อนเริ่มลงทุน'),
    tabs:[B('Your first purchase', 'ซื้อหุ้นครั้งแรก'), B('Reading a candle', 'อ่านแท่งเทียน'), B('6 words you will see', '6 คำที่เจอบ่อย'), B('Risk vs return', 'ความเสี่ยง vs ผลตอบแทน'), B('Checklist', 'เช็กลิสต์ก่อนลงทุน')],
    next:B('Next lesson', 'บทถัดไป'), go:B('Continue in the Stock Classroom', 'เรียนต่อในห้องเรียนหุ้น')
  };
  function stepsLesson(){
    var S = [[B('Open a brokerage account', 'เปิดบัญชีกับโบรกเกอร์'), B('Through a licensed securities company\'s app. You need your ID card and a bank account; most apps take a few days to approve.', 'ผ่านแอปของบริษัทหลักทรัพย์ที่ได้รับอนุญาต ใช้บัตรประชาชนและบัญชีธนาคาร ส่วนใหญ่อนุมัติภายในไม่กี่วัน'), '#22d3ee'],
      [B('Put money in', 'ฝากเงินเข้าบัญชี'), B('Start with money you will not need for years. There is no minimum to learn with — start small.', 'เริ่มจากเงินที่ไม่ต้องใช้ไปอีกหลายปี ไม่ต้องเริ่มเยอะ เริ่มน้อยๆ เพื่อเรียนรู้ก่อน'), '#34d399'],
      [B('Choose what to buy', 'เลือกหุ้นที่จะซื้อ'), B('Pick a business you understand. Check its profit, debt and dividend — this site explains each number.', 'เลือกธุรกิจที่เข้าใจ ดูกำไร หนี้ และปันผล ทุกตัวเลขมีคำอธิบายในเว็บนี้'), '#a78bfa'],
      [B('Place the order', 'ส่งคำสั่งซื้อ'), B('Thai shares trade in lots of 100. Set the price you are willing to pay (a limit order). Payment settles 2 working days later (T+2).', 'หุ้นไทยซื้อขั้นต่ำทีละ 100 หุ้น ตั้งราคาที่ยอมจ่าย (Limit Order) เงินตัดจริงอีก 2 วันทำการ (T+2)'), '#f472b6']];
    return '<div class="spzl-steps">' + S.map(function(x, i){ return '<div class="spzl-step" style="--c:' + x[2] + ';--d:' + (i * 110) + 'ms"><span class="n">' + (i + 1) + '</span><b>' + esc(T(x[0])) + '</b><p>' + esc(T(x[1])) + '</p></div>'; }).join('') + '</div>';
  }
  function candleLesson(){
    var lab = function(en, th){ return esc(T(B(en, th))); };
    return '<div class="spzl-cd"><svg class="spzl-cdsvg" viewBox="0 0 360 200" aria-hidden="true">' +
      '<line x1="95" y1="18" x2="95" y2="182" class="wk"/><rect x="72" y="52" width="46" height="96" rx="4" class="up"/>' +
      '<line x1="265" y1="18" x2="265" y2="182" class="wk"/><rect x="242" y="52" width="46" height="96" rx="4" class="dn"/>' +
      '<g class="lb"><text x="128" y="22">' + lab('High', 'ราคาสูงสุด') + '</text><text x="128" y="56">' + lab('Close', 'ราคาปิด') + '</text><text x="128" y="152">' + lab('Open', 'ราคาเปิด') + '</text><text x="128" y="184">' + lab('Low', 'ราคาต่ำสุด') + '</text></g>' +
      '<g class="lb r"><text x="232" y="22">' + lab('High', 'สูงสุด') + '</text><text x="232" y="56">' + lab('Open', 'เปิด') + '</text><text x="232" y="152">' + lab('Close', 'ปิด') + '</text><text x="232" y="184">' + lab('Low', 'ต่ำสุด') + '</text></g>' +
      '</svg><div class="spzl-cdt"><div><i class="u"></i><b>' + lab('Green candle = price went up', 'แท่งเขียว = ราคาขึ้น') + '</b><span>' + lab('It closed higher than it opened.', 'ปิดสูงกว่าตอนเปิด') + '</span></div>' +
      '<div><i class="d"></i><b>' + lab('Red candle = price went down', 'แท่งแดง = ราคาลง') + '</b><span>' + lab('It closed lower than it opened.', 'ปิดต่ำกว่าตอนเปิด') + '</span></div>' +
      '<div><i class="w"></i><b>' + lab('The thin lines (wicks)', 'เส้นบางด้านบน-ล่าง (ไส้เทียน)') + '</b><span>' + lab('The highest and lowest prices during that day. One candle = one day (or one week, one hour…).', 'ราคาสูงสุดและต่ำสุดระหว่างวัน 1 แท่ง = 1 วัน (หรือ 1 สัปดาห์ 1 ชั่วโมง แล้วแต่ที่เลือก)') + '</span></div></div></div>';
  }
  function wordsLesson(){
    var W = [['฿', B('Price', 'ราคาหุ้น'), B('What one share costs right now. It moves every minute the market is open.', 'ราคาต่อ 1 หุ้นตอนนี้ ขยับตลอดเวลาที่ตลาดเปิด'), '#22d3ee'],
      ['%', B('Dividend yield', 'อัตราปันผล'), B('Yearly dividend ÷ price. ฿2 a year on a ฿50 share = 4%.', 'ปันผลต่อปี ÷ ราคา เช่น ปันผล 2 บาท ราคา 50 บาท = 4%'), '#34d399'],
      ['P/E', B('Price / earnings', 'P/E'), B('How many years of today\'s profit you pay for. Lower = cheaper, but compare within the same industry.', 'จ่ายแพงกี่เท่าของกำไร ยิ่งต่ำยิ่งถูก แต่ต้องเทียบในอุตสาหกรรมเดียวกัน'), '#a78bfa'],
      ['M', B('Market cap', 'มูลค่าบริษัท (Market Cap)'), B('Price × number of shares = the whole company\'s price tag.', 'ราคา × จำนวนหุ้นทั้งหมด = ราคาของทั้งบริษัท'), '#fbbf24'],
      ['V', B('Volume', 'ปริมาณซื้อขาย (Volume)'), B('How many shares changed hands. A big move on big volume matters more.', 'มีการซื้อขายกี่หุ้น ราคาขยับแรงพร้อมวอลุ่มสูง = น่าสนใจกว่า'), '#f472b6'],
      ['∑', B('Index', 'ดัชนี (SET, S&P 500)'), B('One number for a whole market — the average move of many big stocks.', 'ตัวเลขเดียวแทนทั้งตลาด คือการขยับเฉลี่ยของหุ้นใหญ่หลายตัว'), '#60a5fa']];
    return '<div class="spzl-words">' + W.map(function(w, i){ return '<div class="spzl-w" style="--c:' + w[3] + ';--d:' + (i * 70) + 'ms"><i>' + w[0] + '</i><div><b>' + esc(T(w[1])) + '</b><span>' + esc(T(w[2])) + '</span></div></div>'; }).join('') + '</div>';
  }
  function riskLesson(){
    var R = [[B('Bank deposit', 'เงินฝากธนาคาร'), 1, 1], [B('Government bonds', 'พันธบัตรรัฐบาล'), 2, 2], [B('Mixed / bond funds', 'กองทุนผสม / ตราสารหนี้'), 3, 3], [B('Large, steady companies', 'หุ้นบริษัทใหญ่'), 4, 4], [B('Small companies, crypto', 'หุ้นเล็ก คริปโต'), 5, 5]];
    return '<div class="spzl-risk"><div class="spzl-rh"><span>' + esc(T(B('Lower risk, lower expected return', 'เสี่ยงต่ำ ผลตอบแทนคาดหวังต่ำ'))) + '</span><span>' + esc(T(B('Higher risk, higher expected return', 'เสี่ยงสูง ผลตอบแทนคาดหวังสูง'))) + '</span></div>' +
      R.map(function(r, i){ return '<div class="spzl-rr" style="--d:' + (i * 90) + 'ms"><span>' + esc(T(r[0])) + '</span><div class="bars"><i class="rk" style="--w:' + (r[1] * 20) + '%"></i><i class="rt" style="--w:' + (r[2] * 20) + '%"></i></div></div>'; }).join('') +
      '<div class="spzl-rl"><span><i class="rk"></i>' + esc(T(B('How much it can swing', 'ขึ้นลงแรงแค่ไหน'))) + '</span><span><i class="rt"></i>' + esc(T(B('Return you can expect over many years', 'ผลตอบแทนที่คาดหวังในระยะยาว'))) + '</span></div>' +
      '<p class="spzl-note">' + esc(T(B('Nothing pays more without more risk. Spreading money across several of these is called diversification.', 'ไม่มีอะไรให้ผลตอบแทนสูงโดยไม่มีความเสี่ยง การแบ่งเงินไว้หลายอย่างเรียกว่า "การกระจายความเสี่ยง"'))) + '</p></div>';
  }
  function checkLesson(){
    var C = [B('I have 3–6 months of living costs saved for emergencies.', 'มีเงินสำรองฉุกเฉิน 3–6 เดือนของค่าใช้จ่าย'), B('I have no expensive debt (credit cards, cash loans).', 'ไม่มีหนี้ดอกเบี้ยแพง (บัตรเครดิต สินเชื่อเงินสด)'), B('This is money I will not need for at least 3–5 years.', 'เป็นเงินที่ไม่ต้องใช้อย่างน้อย 3–5 ปี'),
      B('I can watch it drop 20–30% without selling in a panic.', 'รับได้ถ้าราคาลง 20–30% โดยไม่ตกใจขายทิ้ง'), B('I understand what the company does and how it makes money.', 'เข้าใจว่าบริษัททำธุรกิจอะไร และหาเงินยังไง'), B('I will spread my money, not put it all in one stock.', 'จะกระจายเงิน ไม่ทุ่มหุ้นตัวเดียว')];
    return '<div class="spzl-chk">' + C.map(function(c, i){ return '<label class="spzl-ck"><input type="checkbox" data-spzl-ck="' + i + '"><span class="bx"></span><span>' + esc(T(c)) + '</span></label>'; }).join('') +
      '<div class="spzl-ckr" data-spzl-ckr="1"></div></div>';
  }
  var LESSONS = [stepsLesson, candleLesson, wordsLesson, riskLesson, checkLesson], curL = 0;
  function lessonsHTML(){
    return '<div class="spzl" data-spzl="1"><div class="spzb-hd"><span class="spzb-eb">' + esc(T(LX.eb)) + '</span><h2>' + esc(T(LX.h)) + '</h2></div>' +
      '<div class="spzl-tabs" role="tablist">' + LX.tabs.map(function(t, i){ return '<button type="button" role="tab" class="spzl-tab' + (i === curL ? ' on' : '') + '" data-spzl-tab="' + i + '"><span>' + (i + 1) + '</span>' + esc(T(t)) + '</button>'; }).join('') + '</div>' +
      '<div class="spzl-body" data-spzl-body="1">' + LESSONS[curL]() + '</div>' +
      '<div class="spzl-foot">' + (curL < LESSONS.length - 1 ? '<button type="button" class="spzl-next" data-spzl-tab="' + (curL + 1) + '">' + esc(T(LX.next)) + ': ' + esc(T(LX.tabs[curL + 1])) + ' →</button>' : '') +
        '<button type="button" class="spzb-more" data-spzh-go="stockclass">' + esc(T(LX.go)) + ico('arrow') + '</button></div></div>';
  }
  function ckScore(){
    var box = sec && sec.querySelector('[data-spzl-ckr]'); if(!box) return;
    var n = sec.querySelectorAll('[data-spzl-ck]:checked').length;
    box.className = 'spzl-ckr ' + (n === 6 ? 'g' : n >= 4 ? 'a' : 'r');
    box.textContent = n === 6 ? T(B('6 / 6 — you are ready to start small. Begin with lesson 1 in the Stock Classroom.', '6 / 6 — พร้อมเริ่มแบบเงินน้อยๆ แล้วค่ะ เริ่มที่บทที่ 1 ในห้องเรียนหุ้นได้เลย')) :
      n >= 4 ? T(B(n + ' / 6 — nearly there. Sort out the unticked items before putting in real money.', n + ' / 6 — ใกล้แล้ว จัดการข้อที่ยังไม่ติ๊กก่อนใส่เงินจริง')) :
      T(B(n + ' / 6 — learn first, invest later. Read the lessons and practise without real money for now.', n + ' / 6 — เรียนก่อน ลงทุนทีหลัง ตอนนี้อ่านบทเรียนและฝึกโดยยังไม่ใช้เงินจริง'));
  }
  function heroHTML(d){
    var cnt = d && d.counts && d.counts.stocks ? d.counts.stocks : 555;
    var st = [[cnt, TX.s1], [26, TX.s2], [T(TX.s3v), TX.s3], ['TH · EN', TX.s4]];
    var path = [['stockclass', 'book', TX.p1, TX.p1d, '#34d399'], ['now', 'globe', TX.p2, TX.p2d, '#22d3ee'], ['stock', 'search', TX.p3, TX.p3d, '#a78bfa'], ['watchlist', 'star', TX.p4, TX.p4d, '#f472b6']];
    return '<div class="spzh-bg" aria-hidden="true"><div class="spzh-aur"></div><i class="o1"></i><i class="o2"></i><i class="o3"></i><div class="spzh-dots"></div>' +
      '<svg class="spzh-wave" viewBox="0 0 1440 260" preserveAspectRatio="none"><defs><linearGradient id="spzhWg" x1="0" x2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity="0"/><stop offset=".25" stop-color="#22d3ee"/><stop offset=".6" stop-color="#818cf8"/><stop offset="1" stop-color="#f472b6"/></linearGradient><linearGradient id="spzhWa" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#818cf8" stop-opacity=".16"/><stop offset="1" stop-color="#818cf8" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="ar" d="M0 214 C120 206 170 176 260 184 S400 226 500 192 S640 120 740 146 S880 196 980 130 S1140 44 1230 76 S1380 30 1440 18 L1440 260 L0 260Z" fill="url(#spzhWa)"/><path class="ln" pathLength="1" d="M0 214 C120 206 170 176 260 184 S400 226 500 192 S640 120 740 146 S880 196 980 130 S1140 44 1230 76 S1380 30 1440 18" fill="none" stroke="url(#spzhWg)" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<div class="spzh-floor"></div></div>' +
      '<div class="spzh-in"><div class="spzh-l">' +
        '<div class="spzh-eb"><span class="dot"></span>' + esc(T(TX.eb)) + '</div>' +
        '<h1><span class="a">' + esc(T(TX.h1a)) + '</span><span class="b">' + esc(T(TX.h1b)) + '</span></h1>' +
        '<p class="spzh-p">' + esc(T(TX.p)) + '</p>' +
        '<div class="spzh-cta"><button type="button" class="spzh-go" data-spzh-go="stockclass">' + esc(T(TX.go1)) + ico('arrow') + '</button><button type="button" class="spzh-gh" data-spzh-go="now">' + esc(T(TX.go2)) + '</button></div>' +
        '<ul class="spzh-trust">' + [TX.t1, TX.t2, TX.t3].map(function(t){ return '<li>' + ico('check') + esc(T(t)) + '</li>'; }).join('') + '</ul>' +
        '<div class="spzh-stats">' + st.map(function(s, i){ return '<div style="animation-delay:' + (0.5 + i * 0.08).toFixed(2) + 's"><b>' + esc(s[0]) + '</b><span>' + esc(T(s[1])) + '</span></div>'; }).join('') + '</div>' +
      '</div><div class="spzh-r" data-spzh="pulse">' + pulseHTML(d) + '</div></div>' +
      tagsHTML() + basicsHTML() + lessonsHTML() +
      '<div class="spzh-path"><div class="spzb-hd"><span class="spzb-eb">' + esc(T(TX.pathH)) + '</span><h2>' + esc(T(TX.pathH2)) + '</h2></div><div class="spzh-pg">' + path.map(function(p, i){ return '<button type="button" class="spzh-step" data-spzh-go="' + p[0] + '" style="--c:' + p[4] + '"><span class="no">0' + (i + 1) + '</span><i>' + ico(p[1]) + '</i><b>' + esc(T(p[2])) + '</b><span class="d">' + esc(T(p[3])) + '</span><em>' + ico('arrow') + '</em></button>'; }).join('') + '</div>' +
      '</div><div class="spzh-end"><span class="spzb-eb">' + esc(T(TX.endE)) + '</span><h2>' + esc(T(TX.endH)) + '</h2><p>' + esc(T(TX.endP)) + '</p>' +
      '<div class="spzh-cta"><button type="button" class="spzh-go" data-spzh-go="stockclass">' + esc(T(TX.go1)) + ico('arrow') + '</button><button type="button" class="spzh-gh" data-spzh-go="now">' + esc(T(TX.go2)) + '</button></div>' +
      '<div class="spzh-endl"><a href="IC_License.html">' + ico('cap') + esc(T(TX.endI)) + '</a><a href="SPACEZ_ISLAND.html">' + ico('game') + esc(T(TX.endG)) + '</a></div></div>' +
      '<div class="spzh-allw"><button type="button" class="spzh-all" data-spzh-all="1">' + esc(T(TX.all)) + ico('down') + '</button></div>';
  }

  var sec = null;
  function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }
  var io = null;
  function reveal(){
    var bl = sec && sec.querySelector('[data-spzl]'); if(bl && 'IntersectionObserver' in window){ var io2 = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io2.unobserve(e.target); } }); }, { threshold:0.1 }); io2.observe(bl); } else if(bl) bl.classList.add('in');
    var b = sec && sec.querySelector('[data-spzb]'); if(!b) return;
    if(!('IntersectionObserver' in window)){ b.classList.add('in'); return; }
    if(!io) io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold:0.15 });
    io.observe(b);
  }
  function paint(){ if(sec){ sec.innerHTML = heroHTML(snap()); reveal(); } }
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
      var lt = ev.target.closest('[data-spzl-tab]');
      if(lt){ curL = +lt.getAttribute('data-spzl-tab'); var old = sec.querySelector('[data-spzl]'); if(old){ var nw = document.createElement('div'); nw.innerHTML = lessonsHTML(); var el2 = nw.firstChild; el2.classList.add('in'); old.parentNode.replaceChild(el2, old); var top = el2.getBoundingClientRect().top; if(top < 80) window.scrollBy({ top:top - 120, behavior:'smooth' }); } return; }
      if(ev.target.closest('[data-spzh-all]')){ var hub = document.getElementById('hub'); if(hub) hub.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
    sec.addEventListener('change', function(ev){ if(ev.target.matches('[data-spzl-ck]')) ckScore(); });
    document.addEventListener('spz:snapshot', paintPulse);
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    var n = 0, iv = setInterval(function(){ if(snap() || ++n > 40){ clearInterval(iv); paintPulse(); } }, 500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
