/* ============================================================================
   SPACEZ STOCK START (2026-11-04) -- "start from zero" course + spotlight tour
   (v2 the same evening: 4 levels, 16 lessons, HTML infographics, calculators, one check question per lesson)
   ----------------------------------------------------------------------------
   User request: the Stock Classroom (#/stockclass, part-65.js) should teach a
   complete beginner step by step -- what a stock is, getting money ready,
   risk, choosing an app and opening an account, picking stocks, splitting the
   money, placing the first order, and checking it afterwards -- with animated
   infographics and icons (no emoji), plus a game-style guided tour that
   focuses one button at a time and blurs everything else.

   - Mounts one block (#skStart) inside #stockclass, above the lesson tree that
     part-65.js renders (part-65 only ever re-renders its own body element, so
     this block is never wiped).
   - Everything here is public learning material, so it lives client-side and
     is readable without signing in, same as the Stock Classroom itself.
   - Progress (which steps were finished) is a per-browser convenience in
     localStorage ('spz.sks'); nothing is sent anywhere.
   - The tour (window.__SPZ_TOUR.start(name)) highlights a real element: four
     blurred panels surround it, so the highlighted button itself stays
     clickable. Tooltip clicks stop propagation so part-15's "click outside
     closes the menu" listener does not fight the tour.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_SKSTART) return;
  window.__SPZ_SKSTART = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function B(en, th){ return { en:en, th:th }; }

  /* ---------------- icons (stroke, 24x24) ---------------- */
  var IC = {
    building:'<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-5h6v5"/><path d="M8 9h1M11.5 9h1M15 9h1M8 12.5h1M11.5 12.5h1M15 12.5h1"/>',
    coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2a3 3 0 00-2.8-1.4c-1.6 0-2.8.8-2.8 2.1 0 3 5.8 1.4 5.8 4.3 0 1.3-1.3 2.1-3 2.1a3.3 3.3 0 01-3-1.5M12 6.3v1.5M12 16.4v1.4"/>',
    trend:'<path d="M3 17l5-5 4 3 8-8"/><path d="M14 7h6v6"/>',
    shield:'<path d="M12 3l8 3v6c0 4.6-3.4 8-8 9-4.6-1-8-4.4-8-9V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    wave:'<path d="M2 14c2.5 0 2.5-5 5-5s2.5 7 5 7 2.5-9 5-9 2.5 5 5 5"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    phone:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    id:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.8 15.5c.6-1.4 1.6-2 2.7-2s2.1.6 2.7 2M13.5 10h5M13.5 13h3.5"/>',
    bank:'<path d="M3 9.5L12 4l9 5.5"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    pie:'<path d="M12 3a9 9 0 109 9h-9z"/><path d="M15 3.5A9 9 0 0120.5 9H15z"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    tap:'<path d="M9 11V5.5a1.5 1.5 0 013 0V11"/><path d="M12 10.5a1.5 1.5 0 013 0V12a1.5 1.5 0 013 0v3.5a5.5 5.5 0 01-5.5 5.5h-.8a5 5 0 01-4.1-2.1L5 15a1.5 1.5 0 012.3-1.9L9 15"/>',
    eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    alert:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.1"/>',
    flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    compass:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 23H20"/>',
    play:'<path d="M8 5.5v13l10.5-6.5z"/>',
    arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>',
    scale:'<path d="M12 3v18M7 21h10"/><path d="M5 7h14"/><path d="M5 7l-3 6a3 3 0 006 0zM19 7l-3 6a3 3 0 006 0z"/>',
    star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/>'
  };
  function ico(k, cls){ return '<svg class="sk-i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }

  /* ==================== course v2 (2026-11-04 evening): 4 levels, real-looking visuals,
     small calculators and one check question per lesson ==================== */
  function n0(v, d){ return isFinite(v) ? Number(v).toLocaleString('en-US', { minimumFractionDigits:d || 0, maximumFractionDigits:d || 0 }) : '—'; }
  /* a live example stock for the "read a stock" lessons: PTT from the site's own snapshot, with a fixed fallback */
  function ex(){
    var s = null;
    try { var sn = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); s = sn && sn.stocks && sn.stocks.PTT; } catch(e){}
    var o = { t:'PTT', n:B('PTT Public Company', 'บริษัท ปตท. จำกัด (มหาชน)'), px:40.25, chg:-0.62, pe:9.65, div:6.96, mcap:1.14e12, hi:43.75, lo:30, ma:37.3, live:false };
    if(s && isFinite(s.price)){ o.px = s.price; o.chg = s.chg_pct; o.pe = s.pe; o.div = s.div; o.mcap = s.mcap; o.hi = s.hi52; o.lo = s.lo52; o.ma = s.ma200; o.live = true; }
    o.dps = o.px * (o.div || 0) / 100;
    return o;
  }
  /* ---------------- visuals (HTML + CSS, animated) ---------------- */
  var V = {
    own:function(){ var cells = ''; for(var i = 0; i < 60; i++) cells += '<i' + (i === 27 ? ' class="me"' : '') + ' style="animation-delay:' + (i * 0.03).toFixed(2) + 's"></i>';
      return '<div class="v v-own"><div class="v-cap">' + ico('building') + esc(T(B('One company = many small pieces', 'บริษัท 1 แห่ง = ชิ้นส่วนเล็กๆ จำนวนมาก'))) + '</div><div class="own-g">' + cells + '</div><div class="own-l"><span><i></i>' + esc(T(B('shares other people own', 'หุ้นที่คนอื่นถือ'))) + '</span><span><i class="me"></i>' + esc(T(B('your shares', 'หุ้นของคุณ'))) + '</span></div><p class="v-note">' + esc(T(B('Own more pieces → own more of the profit and the votes.', 'ถือหลายชิ้น = ได้ส่วนแบ่งกำไรและสิทธิ์โหวตมากขึ้น'))) + '</p></div>'; },
    earn:function(){ return '<div class="v v-earn"><div class="earn-l"><div class="earn-h">' + ico('trend') + '<b>' + esc(T(B('1. Price goes up', '1. ราคาขึ้น'))) + '</b></div><svg viewBox="0 0 200 70" class="spark"><defs><linearGradient id="skEg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".45"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs><path d="M4 58 L30 50 L52 54 L80 38 L104 42 L132 26 L156 30 L196 10 L196 70 L4 70Z" fill="url(#skEg)"/><path class="dr" d="M4 58 L30 50 L52 54 L80 38 L104 42 L132 26 L156 30 L196 10"/><circle cx="4" cy="58" r="4" class="b"/><circle cx="196" cy="10" r="4" class="s"/></svg><div class="earn-f"><span>' + esc(T(B('buy 40', 'ซื้อ 40'))) + '</span>' + ico('arrowR') + '<span>' + esc(T(B('sell 44', 'ขาย 44'))) + '</span><b>+4 ' + esc(T(B('per share', 'ต่อหุ้น'))) + '</b></div></div>' +
      '<div class="earn-r"><div class="earn-h">' + ico('coin') + '<b>' + esc(T(B('2. Dividends', '2. ปันผล'))) + '</b></div><div class="coins">' + [0, 1, 2, 3].map(function(i){ return '<i style="animation-delay:' + (i * 0.5) + 's">' + ico('coin') + '</i>'; }).join('') + '</div><div class="earn-f"><span>' + esc(T(B('company profit', 'กำไรบริษัท'))) + '</span>' + ico('arrowR') + '<span>' + esc(T(B('your account', 'บัญชีคุณ'))) + '</span></div></div></div>'; },
    ready:function(){ var J = [[B('Emergency fund', 'เงินสำรองฉุกเฉิน'), B('3–6 months of costs', 'ค่าใช้จ่าย 3–6 เดือน'), 'g', 92], [B('Expensive debt', 'หนี้ดอกแพง'), B('pay it off', 'ปิดให้หมด'), 'r', 6], [B('Investing', 'เงินลงทุน'), B('cold money, 3–5 yrs+', 'เงินเย็น 3–5 ปีขึ้นไป'), 'c', 55]];
      return '<div class="v v-ready">' + J.map(function(j, i){ return '<div class="jar"><div class="jar-b"><i class="' + j[2] + '" style="--h:' + j[3] + '%;animation-delay:' + (i * 0.4) + 's"></i><u>' + (i + 1) + '</u></div><b>' + esc(T(j[0])) + '</b><small>' + esc(T(j[1])) + '</small></div>'; }).join('<em>' + ico('arrowR') + '</em>') + '</div>'; },
    risk:function(){ return '<div class="v v-risk"><svg viewBox="0 0 300 140"><defs><linearGradient id="skRg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity=".3"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="M10 112 L290 40" class="tl"/><path d="M10 120 C30 96 44 130 62 104 S94 66 112 92 S144 58 162 70 S200 30 222 52 S262 20 290 34 L290 140 L10 140 Z" fill="url(#skRg)"/><path class="dr" d="M10 120 C30 96 44 130 62 104 S94 66 112 92 S144 58 162 70 S200 30 222 52 S262 20 290 34"/>' +
      '<g class="dip"><circle cx="112" cy="92" r="5"/><text x="112" y="112">−25%</text></g></svg><div class="risk-l"><span><i class="a"></i>' + esc(T(B('day to day: bumpy', 'ระยะสั้น: ขึ้นลงแรง'))) + '</span><span><i class="b"></i>' + esc(T(B('over years: the trend', 'ระยะยาว: เห็นทิศทาง'))) + '</span></div><div class="baskets">' + [B('Tech', 'เทค'), B('Banks', 'ธนาคาร'), B('Energy', 'พลังงาน'), B('Food', 'อาหาร')].map(function(b, i){ return '<span style="animation-delay:' + (i * 0.2) + 's">' + ico('layers') + esc(T(b)) + '</span>'; }).join('') + '</div></div>'; },
    quote:function(){ var o = ex(), tag = function(n){ return '<u class="qn">' + n + '</u>'; };
      return '<div class="v v-quote"><div class="q-card"><div class="q-h"><div><b>' + o.t + '</b><span>' + esc(T(o.n)) + '</span></div>' + tag(1) + '</div>' +
        '<div class="q-p"><b>฿' + n0(o.px, 2) + '</b><em class="' + (o.chg >= 0 ? 'up' : 'dn') + '">' + (o.chg >= 0 ? '+' : '') + n0(o.chg, 2) + '%</em>' + tag(2) + '</div>' +
        '<div class="q-g"><div><small>' + esc(T(B('Market value', 'มูลค่าตลาด'))) + '</small><b>' + n0(o.mcap / 1e9, 0) + 'B</b>' + tag(3) + '</div><div><small>P/E</small><b>' + n0(o.pe, 1) + '</b>' + tag(4) + '</div><div><small>' + esc(T(B('Dividend yield', 'อัตราปันผล'))) + '</small><b class="up">' + n0(o.div, 2) + '%</b>' + tag(5) + '</div><div><small>' + esc(T(B('1-year range', 'ช่วงราคา 1 ปี'))) + '</small><b>' + n0(o.lo, 2) + '–' + n0(o.hi, 2) + '</b>' + tag(6) + '</div></div>' +
        '<div class="q-r"><i style="left:' + Math.max(0, Math.min(100, (o.px - o.lo) / ((o.hi - o.lo) || 1) * 100)).toFixed(0) + '%"></i></div>' +
        '<small class="q-src">' + esc(T(o.live ? B('live numbers from this site', 'ตัวเลขจริงจากเว็บนี้') : B('example numbers', 'ตัวเลขตัวอย่าง'))) + '</small></div></div>'; },
    div:function(){ var o = ex(), M = ['J','F','M','A','M','J','J','A','S','O','N','D'], MT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      var row = function(lab, pays, cls){ return '<div class="dv-r"><b>' + esc(T(lab)) + '</b><div class="dv-m">' + (L() === 'th' ? MT : M).map(function(m, i){ var on = pays.indexOf(i) >= 0; return '<span class="' + (on ? 'on ' + cls : '') + '" style="animation-delay:' + (i * 0.08) + 's">' + (on ? ico('coin') : '') + '<em>' + m + '</em></span>'; }).join('') + '</div></div>'; };
      return '<div class="v v-div"><div class="dv-f"><div><small>' + esc(T(B('Dividend per share / year', 'ปันผลต่อหุ้นต่อปี'))) + '</small><b>฿' + n0(o.dps, 2) + '</b></div><em>÷</em><div><small>' + esc(T(B('Share price', 'ราคาหุ้น'))) + '</small><b>฿' + n0(o.px, 2) + '</b></div><em>=</em><div class="hl"><small>' + esc(T(B('Dividend yield', 'อัตราปันผล'))) + '</small><b>' + n0(o.div, 2) + '%</b></div></div>' +
        row(B('Thai stock, e.g. PTT: 2 times a year', 'หุ้นไทย เช่น PTT: ปีละ 2 ครั้ง'), [4, 8], 'th') + row(B('US stock, e.g. KO: every 3 months', 'หุ้นสหรัฐฯ เช่น KO: ทุก 3 เดือน'), [2, 5, 8, 11], 'us') +
        '<p class="v-note">' + esc(T(B('Months are typical examples — each company announces its own dates.', 'เดือนเป็นตัวอย่างโดยประมาณ แต่ละบริษัทประกาศวันของตัวเอง'))) + '</p></div>'; },
    pe:function(){ var R = [[B('This company', 'บริษัทนี้'), 12, 'me'], [B('Same-sector average', 'เฉลี่ยกลุ่มเดียวกัน'), 18, 'peer'], [B('Whole market', 'ทั้งตลาด'), 22, 'mkt']];
      return '<div class="v v-pe"><div class="pe-f"><div><small>' + esc(T(B('Price', 'ราคา'))) + '</small><b>฿120</b></div><em>÷</em><div><small>' + esc(T(B('Profit per share (EPS)', 'กำไรต่อหุ้น (EPS)'))) + '</small><b>฿10</b></div><em>=</em><div class="hl"><small>P/E</small><b>12</b></div></div><div class="pe-b">' + R.map(function(r, i){ return '<div><span>' + esc(T(r[0])) + '</span><i class="' + r[2] + '" style="--w:' + (r[1] / 25 * 100) + '%;animation-delay:' + (i * 0.25) + 's"></i><b>' + r[1] + '</b></div>'; }).join('') + '</div><p class="v-note">' + esc(T(B('P/E 12 ≈ you pay 12 years of today\'s profit. Lower than its peers = cheaper, if the business is just as good.', 'P/E 12 ≈ จ่ายเท่ากับกำไร 12 ปีของวันนี้ ต่ำกว่าเพื่อนกลุ่มเดียวกัน = ถูกกว่า ถ้าธุรกิจดีพอกัน'))) + '</p></div>'; },
    health:function(){ var G = [[B('Profit growth (EPS, yearly)', 'กำไรโต (EPS ต่อปี)'), B('above 10% = good', 'เกิน 10% = ดี'), 72, 'g'], [B('Return on equity (ROE)', 'ผลตอบแทนต่อทุน (ROE)'), B('above 15% = strong', 'เกิน 15% = แข็งแรง'), 64, 'g'], [B('Debt to equity (D/E)', 'หนี้ต่อทุน (D/E)'), B('under 1 = not heavy (banks differ)', 'ต่ำกว่า 1 = หนี้ไม่หนัก (ธนาคารต่างออกไป)'), 30, 'a']];
      return '<div class="v v-health">' + G.map(function(g, i){ return '<div class="hg"><div class="hg-t"><b>' + esc(T(g[0])) + '</b><small>' + esc(T(g[1])) + '</small></div><div class="hg-b"><u class="z1"></u><u class="z2"></u><u class="z3"></u><i class="' + g[3] + '" style="--x:' + g[2] + '%;animation-delay:' + (i * 0.3) + 's"></i></div></div>'; }).join('') + '<div class="hg-l"><span><i class="z1"></i>' + esc(T(B('weak', 'อ่อน'))) + '</span><span><i class="z2"></i>' + esc(T(B('fair', 'พอใช้'))) + '</span><span><i class="z3"></i>' + esc(T(B('strong', 'แข็งแรง'))) + '</span></div></div>'; },
    trend:function(){ return '<div class="v v-trend"><svg viewBox="0 0 300 150"><path d="M10 110 C60 104 90 96 130 86 S210 64 290 52" class="ma"/><path class="dr px" d="M10 118 L36 104 L58 112 L84 92 L110 98 L136 74 L160 82 L186 60 L210 70 L236 46 L262 58 L290 38"/><path class="dr px2" d="M290 38 L300 70"/>' +
      '<g class="lab"><rect x="196" y="98" width="98" height="20" rx="6"/><text x="245" y="112">' + esc(T(B('200-day line', 'เส้น 200 วัน'))) + '</text></g></svg><div class="risk-l"><span><i class="b"></i>' + esc(T(B('price above the line = up-trend', 'ราคาอยู่เหนือเส้น = ขาขึ้น'))) + '</span><span><i class="r"></i>' + esc(T(B('closes below = trend broken', 'ปิดต่ำกว่าเส้น = ขาขึ้นเสีย'))) + '</span></div></div>'; },
    check:function(){ var C = [B('A business I understand', 'ธุรกิจที่เข้าใจได้'), B('Profits growing', 'กำไรโต'), B('Debt not heavy', 'หนี้ไม่หนัก'), B('Not far pricier than peers', 'ไม่แพงกว่าเพื่อนมาก'), B('Price above its 200-day line', 'ราคาเหนือเส้น 200 วัน')];
      return '<div class="v v-check"><div class="ck-h">' + ico('list') + '<b>' + esc(T(B('5-point check before you buy', 'เช็ก 5 ข้อก่อนซื้อ'))) + '</b></div>' + C.map(function(c, i){ return '<div class="ck" style="animation-delay:' + (0.2 + i * 0.35) + 's"><i>' + ico('check') + '</i><span>' + esc(T(c)) + '</span></div>'; }).join('') + '<div class="ck-s">' + ico('star') + esc(T(B('5 of 5 → put it on your short list', 'ผ่านครบ 5 ข้อ → ใส่ในรายชื่อที่จะซื้อ'))) + '</div></div>'; },
    app:function(){ return '<div class="v v-app"><div class="ph"><div class="ph-s"><div class="ph-t"><i></i><b>' + esc(T(B('Open an account', 'เปิดบัญชี'))) + '</b></div>' + [[ 'id', B('ID card + selfie', 'บัตรประชาชน + ถ่ายหน้า')], ['list', B('Risk questionnaire', 'แบบประเมินความเสี่ยง')], ['bank', B('Link your bank', 'ผูกบัญชีธนาคาร')], ['check', B('Ready to buy', 'พร้อมซื้อขาย')]].map(function(x, i){ return '<div class="ph-r" style="animation-delay:' + (i * 0.45) + 's"><i>' + ico(x[0]) + '</i><span>' + esc(T(x[1])) + '</span><u>' + ico('check') + '</u></div>'; }).join('') + '</div></div><div class="apps"><span><b>Dime!</b><small>' + esc(T(B('US from 50 ฿ + Thai', 'หุ้นสหรัฐฯ เริ่ม 50 บาท + หุ้นไทย'))) + '</small></span><span><b>Streaming</b><small>' + esc(T(B('Thai stocks via a broker', 'หุ้นไทย ผ่านโบรกเกอร์'))) + '</small></span><span><b>' + esc(T(B('Broker / bank apps', 'แอปโบรกเกอร์ / ธนาคาร'))) + '</b><small>' + esc(T(B('compare fees', 'เทียบค่าธรรมเนียม'))) + '</small></span></div></div>'; },
    split:function(){ return '<div class="v v-split"><div class="sp-d"><div class="sp-pie"></div><div class="sp-c"><b>100%</b><small>' + esc(T(B('your money', 'เงินทั้งหมด'))) + '</small></div></div><div class="sp-l">' + [['#34d399', B('Index fund / ETF core', 'กองทุนดัชนี / ETF แกนหลัก'), '40%'], ['#22d3ee', B('Stock A', 'หุ้น A'), '15%'], ['#a78bfa', B('Stock B', 'หุ้น B'), '15%'], ['#fbbf24', B('Stock C', 'หุ้น C'), '15%'], ['#f472b6', B('Stock D', 'หุ้น D'), '15%']].map(function(x){ return '<span><i style="background:' + x[0] + '"></i>' + esc(T(x[1])) + '<b>' + x[2] + '</b></span>'; }).join('') + '<div class="sp-m">' + ico('cal') + '<span>' + esc(T(B('Then the same amount on the same day every month', 'แล้วลงเงินเท่าเดิม วันเดิม ทุกเดือน'))) + '</span></div></div></div>'; },
    order:function(){ return '<div class="v v-order"><div class="ph"><div class="ph-s"><div class="ord-s"><span>' + ico('search') + 'PTT</span></div><div class="ord-f"><small>' + esc(T(B('Order', 'คำสั่ง'))) + '</small><div class="ord-seg"><b class="on">' + esc(T(B('Buy', 'ซื้อ'))) + '</b><b>' + esc(T(B('Sell', 'ขาย'))) + '</b></div></div><div class="ord-f"><small>' + esc(T(B('Shares', 'จำนวนหุ้น'))) + '</small><b>100</b></div><div class="ord-f"><small>' + esc(T(B('Price (Limit)', 'ราคา (Limit)'))) + '</small><b>40.25</b></div><div class="ord-f tot"><small>' + esc(T(B('Total', 'รวม'))) + '</small><b>฿4,025 + ' + esc(T(B('fee', 'ค่าธรรมเนียม'))) + '</b></div><div class="ord-go">' + esc(T(B('Confirm', 'ยืนยันคำสั่ง'))) + '<i class="tap"></i></div></div></div><ol class="ord-n"><li>' + esc(T(B('search the ticker', 'ค้นชื่อย่อ'))) + '</li><li>' + esc(T(B('Buy · number of shares', 'ซื้อ · จำนวนหุ้น'))) + '</li><li>' + esc(T(B('Limit = your price', 'Limit = ตั้งราคาเอง'))) + '</li><li>' + esc(T(B('check the total, confirm', 'เช็กยอดรวม แล้วยืนยัน'))) + '</li></ol></div>'; },
    track:function(){ var D2 = ''; for(var i = 1; i <= 28; i++) D2 += '<i class="' + (i === 1 ? 'on' : '') + '">' + i + '</i>';
      return '<div class="v v-track"><div class="tr-c"><div class="tr-h">' + ico('cal') + esc(T(B('Review day: the 1st of each month', 'วันทบทวน: วันที่ 1 ของทุกเดือน'))) + '</div><div class="tr-g">' + D2 + '</div></div><div class="tr-a"><span class="g">' + ico('check') + esc(T(B('Keep', 'ถือต่อ'))) + '</span><span class="c">' + ico('coin') + esc(T(B('Add money', 'เติมเงิน'))) + '</span><span class="r">' + ico('alert') + esc(T(B('Switch', 'สลับ'))) + '</span></div></div>'; },
    sell:function(){ var S = [[B('Profits shrinking 2 quarters in a row', 'กำไรลดลง 2 ไตรมาสติด'), 'r'], [B('Debt jumps', 'หนี้เพิ่มพรวด'), 'r'], [B('Closes below its 200-day line', 'ราคาปิดต่ำกว่าเส้น 200 วัน'), 'r'], [B('One scary red day', 'แดงแรงวันเดียว'), 'n']];
      return '<div class="v v-sell">' + S.map(function(x, i){ return '<div class="sl ' + x[1] + '" style="animation-delay:' + (i * 0.3) + 's"><i>' + ico(x[1] === 'r' ? 'alert' : 'x') + '</i><span>' + esc(T(x[0])) + '</span><b>' + esc(T(x[1] === 'r' ? B('reason to sell', 'เหตุผลให้ขาย') : B('not a reason', 'ยังไม่ใช่เหตุผล'))) + '</b></div>'; }).join('') + '</div>'; },
    tax:function(){ var X = [[B('Thai dividends', 'ปันผลหุ้นไทย'), '10%', B('withheld automatically', 'ถูกหัก ณ ที่จ่ายอัตโนมัติ')], [B('US dividends', 'ปันผลหุ้นสหรัฐฯ'), '15%', B('with a W-8BEN form (30% without)', 'เมื่อยื่นฟอร์ม W-8BEN (ไม่ยื่น 30%)')], [B('Thai shares sold at a profit', 'ขายหุ้นไทยได้กำไร (ในตลาด SET)'), '0%', B('no tax for individuals', 'บุคคลทั่วไปไม่เสียภาษี')], [B('Buying and selling', 'ทุกครั้งที่ซื้อขาย'), B('fee', 'ค่าธรรมเนียม'), B('varies by app — compare', 'แต่ละแอปต่างกัน ควรเทียบ')]];
      return '<div class="v v-tax">' + X.map(function(x, i){ return '<div class="tx" style="animation-delay:' + (i * 0.2) + 's"><span>' + esc(T(x[0])) + '</span><b' + (typeof x[1] === 'string' ? '' : ' class="sm"') + '>' + esc(typeof x[1] === 'string' ? x[1] : T(x[1])) + '</b><small>' + esc(T(x[2])) + '</small></div>'; }).join('') + '<p class="v-note">' + esc(T(B('Rules can change — check with the Revenue Department or your broker.', 'กฎภาษีเปลี่ยนได้ ตรวจสอบกับกรมสรรพากรหรือโบรกเกอร์อีกครั้ง'))) + '</p></div>'; }
  };

  /* ---------------- calculators ---------------- */
  var CALC = {
    gain:{ f:[['sh', B('Shares bought', 'จำนวนหุ้นที่ซื้อ'), 100], ['buy', B('Buy price (฿)', 'ราคาที่ซื้อ (บาท)'), 40], ['sell', B('Sell price (฿)', 'ราคาที่ขาย (บาท)'), 44], ['dps', B('Dividend per share (฿)', 'ปันผลต่อหุ้น (บาท)'), 2]],
      out:function(v){ var cost = v.sh * v.buy, g = v.sh * (v.sell - v.buy), d = v.sh * v.dps; return [[B('Money in', 'เงินที่ลง'), '฿' + n0(cost)], [B('Price gain', 'กำไรจากราคา'), (g >= 0 ? '+฿' : '−฿') + n0(Math.abs(g))], [B('Dividends', 'ปันผลที่ได้'), '+฿' + n0(d)], [B('Total return', 'รวมผลตอบแทน'), (cost ? n0((g + d) / cost * 100, 1) : '0') + '%', 1]]; } },
    div:{ f:[['px', B('Share price (฿)', 'ราคาหุ้น (บาท)'), 40.25], ['dps', B('Dividend per share per year (฿)', 'ปันผลต่อหุ้นต่อปี (บาท)'), 2.8], ['sh', B('Shares you hold', 'จำนวนหุ้นที่ถือ'), 500], ['times', B('Paid how many times a year', 'จ่ายปีละกี่ครั้ง'), 2], ['tax', B('Tax withheld (%)', 'ภาษีหัก ณ ที่จ่าย (%)'), 10]],
      out:function(v){ var y = v.px ? v.dps / v.px * 100 : 0, gross = v.sh * v.dps, net = gross * (1 - v.tax / 100); return [[B('Dividend yield', 'อัตราปันผล'), n0(y, 2) + '%', 1], [B('Per year (before tax)', 'ต่อปี (ก่อนภาษี)'), '฿' + n0(gross)], [B('Per year (after tax)', 'ต่อปี (หลังภาษี)'), '฿' + n0(net)], [B('Each payment', 'ได้ต่อครั้ง'), '฿' + n0(v.times ? net / v.times : 0)]]; } },
    pe:{ f:[['px', B('Share price (฿)', 'ราคาหุ้น (บาท)'), 120], ['eps', B('Profit per share per year, EPS (฿)', 'กำไรต่อหุ้นต่อปี EPS (บาท)'), 10], ['peer', B('Same-sector P/E', 'P/E เฉลี่ยกลุ่มเดียวกัน'), 18]],
      out:function(v){ var pe = v.eps > 0 ? v.px / v.eps : 0, cheap = pe && v.peer ? (1 - pe / v.peer) * 100 : 0; return [[B('P/E', 'P/E'), pe ? n0(pe, 1) : '—', 1], [B('Profit yield', 'ผลตอบแทนจากกำไร'), pe ? n0(100 / pe, 1) + '%' : '—'], [B('vs its sector', 'เทียบกลุ่ม'), pe ? (cheap >= 0 ? n0(cheap, 0) + '% ' + T(B('cheaper', 'ถูกกว่า')) : n0(-cheap, 0) + '% ' + T(B('pricier', 'แพงกว่า'))) : '—']]; } }
  };
  var CV = {};
  try { CV = JSON.parse(localStorage.getItem('spz.sks.calc') || '{}') || {}; } catch(e){}
  function calcVals(k){ var c = CALC[k], v = {}; c.f.forEach(function(x){ var s = CV[k] && CV[k][x[0]]; v[x[0]] = isFinite(+s) && s !== '' && s != null ? +s : x[2]; }); return v; }
  function calcOut(k){ return CALC[k].out(calcVals(k)).map(function(r){ return '<div class="' + (r[2] ? 'hl' : '') + '"><small>' + esc(T(r[0])) + '</small><b>' + esc(r[1]) + '</b></div>'; }).join(''); }
  function calcHTML(k){ if(!k) return ''; var v = calcVals(k);
    return '<div class="sk2-calc" data-calc="' + k + '"><div class="sk2-calch">' + ico('star') + esc(T(B('Try it — change the numbers', 'ลองคิดเอง — แก้ตัวเลขได้'))) + '</div><div class="sk2-calcf">' + CALC[k].f.map(function(x){ return '<label><span>' + esc(T(x[1])) + '</span><input type="number" step="any" value="' + v[x[0]] + '" data-cf="' + x[0] + '"></label>'; }).join('') + '</div><div class="sk2-calco" data-co>' + calcOut(k) + '</div></div>'; }

  /* ---------------- the levels ---------------- */
  var LV = [
    { id:'L1', c:'#34d399', i:'compass', t:B('Level 1 · Meet stocks', 'ระดับ 1 · รู้จักหุ้น'), s:B('what a stock is, how it pays you, getting ready', 'หุ้นคืออะไร ได้เงินยังไง เตรียมตัวก่อนลงทุน'), L:[
      { id:'own', i:'building', v:'own', t:B('What is a stock?', 'หุ้นคืออะไร'), lead:B('A stock is a small piece of a real company. Buy it and you own a slice of that business.', 'หุ้นคือชิ้นส่วนเล็กๆ ของบริษัทจริง ซื้อหุ้น = เป็นเจ้าของบริษัทนั้นส่วนหนึ่ง'),
        p:[['trend', B('Over the long run a price follows the company\'s profits; day to day it follows what people expect.', 'ระยะยาวราคาหุ้นวิ่งตามกำไรบริษัท ส่วนรายวันวิ่งตามความคาดหวังของคน')], ['alert', B('Prices can also fall a lot if the business does badly — that is the risk.', 'ถ้าธุรกิจแย่ ราคาก็ลงได้มาก นี่คือความเสี่ยง')], ['eye', B('Each stock has a short code (ticker): PTT, CPALL, AAPL, NVDA.', 'หุ้นทุกตัวมีชื่อย่อ เช่น PTT, CPALL, AAPL, NVDA')]],
        key:B('Buy businesses, not tickers: “would I want to own this company?”', 'ซื้อธุรกิจ ไม่ใช่ซื้อชื่อย่อ: “อยากเป็นเจ้าของบริษัทนี้ไหม”'), tour:'learn',
        quiz:{ q:B('If you buy 100 shares of a company, you…', 'ถ้าซื้อหุ้นบริษัทหนึ่ง 100 หุ้น แปลว่า…'), o:[B('lend it money and get interest', 'ให้บริษัทกู้เงินแล้วได้ดอกเบี้ย'), B('own a small part of the company', 'เป็นเจ้าของบริษัทส่วนเล็กๆ'), B('get a fixed return every year', 'ได้ผลตอบแทนคงที่ทุกปี')], a:1, why:B('A share is ownership. Lending is a bond; returns from shares are never fixed.', 'หุ้นคือความเป็นเจ้าของ การให้กู้คือหุ้นกู้/พันธบัตร และหุ้นไม่มีผลตอบแทนคงที่') } },
      { id:'earn', i:'coin', v:'earn', c:'gain', t:B('Two ways a stock pays you', 'หุ้นให้เงินเรา 2 ทาง'), lead:B('You earn when the price rises above what you paid, and when the company pays a dividend.', 'ได้เงินเมื่อราคาขึ้นเกินกว่าที่ซื้อ และเมื่อบริษัทจ่ายปันผล'),
        p:[['trend', B('Price gain = (sell price − buy price) × shares. You only “have” it once you sell.', 'กำไรส่วนต่าง = (ราคาขาย − ราคาซื้อ) × จำนวนหุ้น จะได้จริงก็ต่อเมื่อขาย')], ['coin', B('Dividend = cash the company shares from its profit, paid into your account.', 'ปันผล = เงินที่บริษัทแบ่งจากกำไรให้ผู้ถือหุ้น โอนเข้าบัญชีเรา')], ['layers', B('Growth companies often pay little dividend and reinvest; mature ones pay more.', 'บริษัทที่กำลังโตมักปันผลน้อยเพราะเอาเงินไปขยายกิจการ บริษัทที่โตเต็มที่มักปันผลมากกว่า')]],
        key:B('Total return = price gain + dividends.', 'ผลตอบแทนรวม = กำไรจากราคา + ปันผล'),
        quiz:{ q:B('Bought 100 shares at ฿40, sold at ฿44, received ฿2 dividend per share. Total?', 'ซื้อ 100 หุ้นที่ 40 บาท ขาย 44 บาท และได้ปันผลหุ้นละ 2 บาท ได้ทั้งหมดเท่าไร'), o:[B('฿400', '400 บาท'), B('฿600', '600 บาท'), B('฿200', '200 บาท')], a:1, why:B('(44 − 40) × 100 = 400 from the price + 2 × 100 = 200 dividends = 600.', '(44 − 40) × 100 = 400 จากราคา + 2 × 100 = 200 จากปันผล รวม 600') } },
      { id:'ready', i:'shield', v:'ready', t:B('Get your money ready first', 'เตรียมเงินให้พร้อมก่อน'), lead:B('Invest only money you will not need soon, after a safety cushion is in place.', 'ลงทุนด้วยเงินที่ไม่ต้องใช้เร็วๆ นี้ และหลังจากมีเงินสำรองแล้ว'),
        p:[['shield', B('Keep 3–6 months of living costs as an emergency fund first.', 'มีเงินสำรองฉุกเฉิน 3–6 เดือนของค่าใช้จ่ายก่อน')], ['alert', B('Pay off high-interest debt (credit cards, cash loans) before investing.', 'ปิดหนี้ดอกเบี้ยสูง (บัตรเครดิต สินเชื่อเงินสด) ก่อนลงทุน')], ['clock', B('Use “cold money” you can leave for 3–5 years or more.', 'ใช้ “เงินเย็น” ที่วางได้ 3–5 ปีขึ้นไป')], ['coin', B('You can start small — some apps let you buy US stocks from 50 baht.', 'เริ่มน้อยๆ ได้ บางแอปซื้อหุ้นสหรัฐฯ ได้ตั้งแต่ 50 บาท')]],
        key:B('Emergency fund → no expensive debt → then invest.', 'เงินสำรอง → ไม่มีหนี้ดอกแพง → แล้วค่อยลงทุน'),
        quiz:{ q:B('Which money is best for stocks?', 'เงินก้อนไหนเหมาะกับการลงทุนหุ้นที่สุด'), o:[B('Rent due next month', 'ค่าเช่าที่ต้องจ่ายเดือนหน้า'), B('Savings you will not touch for 5 years', 'เงินเก็บที่ไม่ต้องใช้ 5 ปี'), B('A cash loan', 'เงินกู้สินเชื่อเงินสด')], a:1, why:B('Stocks can drop for a while; only money you can leave alone for years should be in them.', 'หุ้นอาจลงอยู่นาน จึงควรใช้เงินที่วางไว้ได้หลายปี') } },
      { id:'risk', i:'wave', v:'risk', t:B('Risk, time and spreading out', 'ความเสี่ยง เวลา และการกระจาย'), lead:B('Prices swing. Time and holding several different companies are your best protection.', 'ราคาแกว่งเป็นปกติ เวลาและการถือหลายบริษัทคือเกราะที่ดีที่สุด'),
        p:[['wave', B('A fall of 20–30% in a bad year is normal for stocks.', 'หุ้นลง 20–30% ในปีที่แย่ถือเป็นเรื่องปกติ')], ['layers', B('Hold several companies from different sectors — never all in one.', 'ถือหลายบริษัท หลายกลุ่มอุตสาหกรรม อย่าใส่ทั้งหมดในตัวเดียว')], ['clock', B('The longer you hold good companies, the more the swings even out.', 'ยิ่งถือบริษัทดีได้นาน การแกว่งยิ่งเฉลี่ยกันจนเห็นทิศ')], ['alert', B('Do not borrow to buy stocks while learning.', 'ช่วงที่ยังเรียนรู้ อย่ากู้เงินมาซื้อหุ้น')]],
        key:B('Spread out + be patient = the beginner\'s edge.', 'กระจาย + อดทน = ข้อได้เปรียบของมือใหม่'),
        quiz:{ q:B('Your stock fell 15% this month. A sensible first step is…', 'หุ้นลง 15% ในเดือนนี้ สิ่งแรกที่ควรทำคือ…'), o:[B('Sell everything at once', 'ขายทั้งหมดทันที'), B('Check whether the company\'s reasons changed', 'เช็กว่าเหตุผลของบริษัทเปลี่ยนไปไหม'), B('Borrow money to buy more', 'กู้เงินมาซื้อเพิ่ม')], a:1, why:B('Falls are normal. Decide on the business, not on one month of price.', 'การลงเป็นเรื่องปกติ ตัดสินใจจากธุรกิจ ไม่ใช่จากราคาเดือนเดียว') } }
    ] },
    { id:'L2', c:'#22d3ee', i:'search', t:B('Level 2 · Read a stock', 'ระดับ 2 · อ่านหุ้นเป็น'), s:B('price, dividends, P/E, profit and debt, the trend', 'ราคา ปันผล P/E กำไรและหนี้ เทรนด์'), L:[
      { id:'quote', i:'eye', v:'quote', t:B('Reading one stock\'s page', 'อ่านหน้าข้อมูลหุ้น 1 ตัว'), lead:B('Every app shows the same handful of numbers. Here is what each one means.', 'ทุกแอปแสดงตัวเลขชุดเดียวกัน มาดูว่าแต่ละตัวหมายถึงอะไร'),
        p:[['flag', B('① Ticker and name — check you have the right company.', '① ชื่อย่อและชื่อบริษัท เช็กให้ตรงตัว')], ['trend', B('② Price of one share and today\'s change.', '② ราคาหุ้น 1 หุ้น และขึ้น/ลงวันนี้กี่ %')], ['building', B('③ Market value = price × all shares: how big the company is.', '③ มูลค่าตลาด = ราคา × จำนวนหุ้นทั้งหมด บอกว่าบริษัทใหญ่แค่ไหน')], ['coin', B('④ P/E (price vs profit) and ⑤ dividend yield — see the next lessons.', '④ P/E (ราคาเทียบกำไร) และ ⑤ อัตราปันผล ดูบทถัดไป')], ['wave', B('⑥ 1-year range: the lowest and highest price of the past year.', '⑥ ช่วงราคา 1 ปี: ราคาต่ำสุดและสูงสุดในรอบปี')]],
        key:B('Name → price → size → P/E → dividend → range: read in that order.', 'อ่านตามลำดับ: ชื่อ → ราคา → ขนาด → P/E → ปันผล → ช่วงราคา'), tour:'pick',
        quiz:{ q:B('“Market value” tells you…', '“มูลค่าตลาด” บอกอะไร'), o:[B('how big the company is', 'บริษัทใหญ่แค่ไหน'), B('how much dividend it pays', 'จ่ายปันผลเท่าไร'), B('tomorrow\'s price', 'ราคาพรุ่งนี้')], a:0, why:B('Market value = share price × number of shares — the price of the whole company.', 'มูลค่าตลาด = ราคาหุ้น × จำนวนหุ้นทั้งหมด = มูลค่าของทั้งบริษัท') } },
      { id:'div', i:'coin', v:'div', c:'div', t:B('Dividends: how much, how often', 'ปันผล: ได้เท่าไร จ่ายบ่อยแค่ไหน'), lead:B('Dividend yield tells you how much cash a year you get for every 100 baht invested.', 'อัตราปันผลบอกว่าลงเงิน 100 บาท จะได้เงินปันผลต่อปีราวกี่บาท'),
        p:[['coin', B('Dividend yield = dividend per share per year ÷ share price. 5% ≈ 5 baht a year per 100 baht.', 'อัตราปันผล = ปันผลต่อหุ้นต่อปี ÷ ราคาหุ้น เช่น 5% ≈ ลง 100 บาท ได้ปีละ 5 บาท')], ['cal', B('Thai stocks usually pay 1–2 times a year (interim + annual). Many US stocks pay every 3 months.', 'หุ้นไทยส่วนใหญ่จ่ายปีละ 1–2 ครั้ง (ระหว่างกาล + ประจำปี) หุ้นสหรัฐฯ หลายตัวจ่ายทุก 3 เดือน')], ['flag', B('To get it you must own the stock before the XD date. On XD day the price usually drops by about the dividend.', 'ต้องถือหุ้นก่อนวัน XD ถึงจะได้ปันผลรอบนั้น วัน XD ราคามักลดลงราวเท่าปันผล')], ['search', B('Check dates in your app or on set.or.th (company → rights & benefits).', 'ดูวัน XD และวันจ่ายได้ในแอป หรือเว็บ set.or.th (หน้าหุ้น → สิทธิประโยชน์)')], ['alert', B('A very high yield (10%+) is often a warning: the price fell hard or profits may not last.', 'ปันผลสูงผิดปกติ (10% ขึ้นไป) มักเป็นสัญญาณเตือน ราคาอาจร่วงแรงหรือกำไรอาจไม่ยั่งยืน')]],
        key:B('Good dividend = steady yield + profits that keep paying for it.', 'ปันผลที่ดี = จ่ายสม่ำเสมอ + กำไรพอจ่ายต่อเนื่อง'),
        quiz:{ q:B('A ฿50 stock pays ฿2.50 a year in dividends. Its yield is…', 'หุ้นราคา 50 บาท จ่ายปันผลปีละ 2.50 บาท อัตราปันผลคือ…'), o:[B('2.5%', '2.5%'), B('5%', '5%'), B('20%', '20%')], a:1, why:B('2.50 ÷ 50 = 0.05 = 5% a year.', '2.50 ÷ 50 = 0.05 = 5% ต่อปี') } },
      { id:'pe', i:'scale', v:'pe', c:'pe', t:B('P/E: cheap or expensive?', 'P/E: หุ้นแพงหรือถูก'), lead:B('P/E compares the price with the profit the company makes for each share.', 'P/E คือการเทียบราคาหุ้นกับกำไรที่บริษัททำได้ต่อหุ้น'),
        p:[['scale', B('P/E = price ÷ profit per share (EPS). P/E 12 ≈ you pay 12 years of today\'s profit.', 'P/E = ราคา ÷ กำไรต่อหุ้น (EPS) เช่น P/E 12 ≈ จ่ายเท่ากับกำไร 12 ปีของวันนี้')], ['layers', B('Compare with companies in the same sector — banks and tech have very different normal P/Es.', 'เทียบกับบริษัทกลุ่มเดียวกันเท่านั้น ธนาคารกับเทคมี P/E ปกติต่างกันมาก')], ['trend', B('A higher P/E can be fine if profits grow fast; a low P/E can be a trap if profits are falling.', 'P/E สูงอาจไม่แพงถ้ากำไรโตเร็ว P/E ต่ำอาจเป็นกับดักถ้ากำไรกำลังลด')]],
        key:B('Cheaper than its peers + profits still growing = interesting.', 'ถูกกว่าเพื่อนในกลุ่ม + กำไรยังโต = น่าสนใจ'),
        quiz:{ q:B('Two banks: A has P/E 8, B has P/E 14, similar profits growth. Which looks cheaper?', 'ธนาคาร 2 แห่ง A มี P/E 8 B มี P/E 14 กำไรโตใกล้กัน ตัวไหนดูถูกกว่า'), o:[B('A', 'A'), B('B', 'B'), B('Can\'t compare banks', 'เทียบกันไม่ได้')], a:0, why:B('Same sector, similar growth: the lower P/E is the cheaper price for the same profit.', 'กลุ่มเดียวกันและโตพอกัน P/E ต่ำกว่า = จ่ายถูกกว่าสำหรับกำไรเท่ากัน') } },
      { id:'health', i:'shield', v:'health', t:B('Profit and debt: is it healthy?', 'กำไรและหนี้: บริษัทแข็งแรงไหม'), lead:B('Three numbers tell you most of a company\'s health.', 'ตัวเลข 3 ตัวบอกสุขภาพบริษัทได้เกือบทั้งหมด'),
        p:[['trend', B('Profit growth (EPS): rising year after year is what pushes the price up over time.', 'กำไรโต (EPS): โตต่อเนื่องทุกปี คือสิ่งที่ดันราคาขึ้นในระยะยาว')], ['star', B('ROE: profit made from the owners\' money. Above about 15% is strong.', 'ROE: กำไรที่ทำได้จากเงินของผู้ถือหุ้น เกินราว 15% ถือว่าแข็งแรง')], ['alert', B('Debt to equity (D/E): under about 1 is usually not heavy (banks and utilities are different).', 'หนี้ต่อทุน (D/E): ต่ำกว่าราว 1 มักไม่หนัก (ธนาคารและสาธารณูปโภคต่างออกไป)')]],
        key:B('Growing profits, good ROE, manageable debt.', 'กำไรโต ROE ดี หนี้ไม่หนัก'), tour:'pick',
        quiz:{ q:B('Which looks healthiest?', 'บริษัทไหนดูแข็งแรงที่สุด'), o:[B('Profit −10%, D/E 3', 'กำไร −10% หนี้ต่อทุน 3'), B('Profit +15%, ROE 18%, D/E 0.5', 'กำไร +15% ROE 18% หนี้ต่อทุน 0.5'), B('Profit +2%, ROE 4%, D/E 2', 'กำไร +2% ROE 4% หนี้ต่อทุน 2')], a:1, why:B('Growing profit, strong ROE and low debt together.', 'กำไรโต ROE สูง และหนี้ต่ำ ครบทั้ง 3 ข้อ') } },
      { id:'trend', i:'trend', v:'trend', t:B('The trend: the 200-day line', 'ดูเทรนด์: เส้นเฉลี่ย 200 วัน'), lead:B('The 200-day line is the average price of the last 200 trading days — a simple trend filter.', 'เส้น 200 วัน คือราคาเฉลี่ยย้อนหลัง 200 วันทำการ ใช้กรองเทรนด์แบบง่าย'),
        p:[['trend', B('Price above the line → up-trend. Many investors only buy then.', 'ราคาอยู่เหนือเส้น → ขาขึ้น นักลงทุนหลายคนซื้อเฉพาะตอนนี้')], ['alert', B('A close below the line is an early warning that the trend is breaking.', 'ราคาปิดต่ำกว่าเส้น = สัญญาณเตือนแรกว่าขาขึ้นกำลังเสีย')], ['eye', B('“One Stock, One Page” and “Chart Lab” on this site draw the line for you.', 'หน้า “ดูหุ้นรายตัว” และ “ห้องทดลองกราฟ” ในเว็บนี้วาดเส้นให้ดู')]],
        key:B('Good company + price above its 200-day line.', 'บริษัทดี + ราคาอยู่เหนือเส้น 200 วัน'),
        quiz:{ q:B('Price ฿50, its 200-day line ฿45. The trend is…', 'ราคา 50 บาท เส้น 200 วันอยู่ที่ 45 บาท เทรนด์ตอนนี้คือ…'), o:[B('up', 'ขาขึ้น'), B('down', 'ขาลง'), B('cannot tell', 'บอกไม่ได้')], a:0, why:B('Price above the 200-day average = up-trend.', 'ราคาเหนือเส้นเฉลี่ย 200 วัน = ขาขึ้น') } }
    ] },
    { id:'L3', c:'#a78bfa', i:'tap', t:B('Level 3 · Choose and buy', 'ระดับ 3 · เลือกและลงมือซื้อ'), s:B('checklist, app and account, splitting money, the first order', 'เช็กลิสต์ เปิดบัญชี แบ่งเงิน ส่งคำสั่งแรก'), L:[
      { id:'check', i:'list', v:'check', t:B('A 5-point checklist', 'เช็กลิสต์ 5 ข้อก่อนซื้อ'), lead:B('Put each stock through the same five questions before it goes on your list.', 'ให้หุ้นทุกตัวผ่านคำถาม 5 ข้อเดียวกันก่อนจะใส่ในรายชื่อ'),
        p:[['building', B('Do I understand how it makes money?', 'เข้าใจไหมว่าบริษัทหาเงินยังไง')], ['trend', B('Are profits growing?', 'กำไรโตไหม')], ['shield', B('Is debt not heavy?', 'หนี้ไม่หนักใช่ไหม')], ['scale', B('Is it not far pricier than its peers (P/E)?', 'ไม่แพงกว่าเพื่อนกลุ่มเดียวกันมาก (P/E) ใช่ไหม')], ['wave', B('Is the price above its 200-day line?', 'ราคาอยู่เหนือเส้น 200 วันไหม')]],
        key:B('5 of 5 → short list. Fewer → wait.', 'ผ่าน 5 ข้อ → ใส่รายชื่อ ไม่ครบ → รอก่อน'), tour:'pick',
        quiz:{ q:B('A stock passes 3 of the 5 checks. You should…', 'หุ้นผ่านเช็กลิสต์ 3 จาก 5 ข้อ ควร…'), o:[B('buy anyway', 'ซื้อเลย'), B('keep watching and wait', 'เฝ้าดูและรอก่อน'), B('buy double', 'ซื้อเป็น 2 เท่า')], a:1, why:B('The checklist is there to stop impulse buys; wait until it passes.', 'เช็กลิสต์มีไว้กันการซื้อตามอารมณ์ รอจนกว่าจะผ่าน') } },
      { id:'app', i:'phone', v:'app', t:B('Choose an app and open an account', 'เลือกแอปและเปิดบัญชี'), lead:B('You need a trading account with a broker; most open online in a day or two.', 'ต้องมีบัญชีซื้อขายกับโบรกเกอร์ ส่วนใหญ่เปิดออนไลน์ได้ใน 1–2 วัน'),
        p:[['phone', B('Examples: Dime! (US stocks as fractional shares from 50 baht, and Thai stocks), or a broker account used with the Streaming app for Thai stocks.', 'ตัวอย่าง: Dime! (หุ้นสหรัฐฯ แบบเศษหุ้นเริ่ม 50 บาท และหุ้นไทย) หรือเปิดบัญชีโบรกเกอร์แล้วใช้แอป Streaming ซื้อขายหุ้นไทย')], ['id', B('Identity is checked online with your ID card (e.g. through NDID or a bank app).', 'ยืนยันตัวตนออนไลน์ด้วยบัตรประชาชน (เช่น NDID หรือแอปธนาคาร)')], ['list', B('Answer the risk questionnaire honestly.', 'ตอบแบบประเมินความเสี่ยงตามจริง')], ['bank', B('Link a bank account, and compare fees before choosing.', 'ผูกบัญชีธนาคาร และเทียบค่าธรรมเนียมก่อนเลือกแอป')]],
        key:B('One account is enough to start.', 'เริ่มจากบัญชีเดียวก็พอ'), tour:'apps',
        quiz:{ q:B('To buy US stocks with a small amount, look for an app that offers…', 'ถ้าอยากซื้อหุ้นสหรัฐฯ ด้วยเงินน้อยๆ ควรหาแอปที่มี…'), o:[B('fractional shares', 'การซื้อเป็นเศษหุ้น'), B('only 100-share lots', 'ซื้อขั้นต่ำ 100 หุ้น'), B('margin loans', 'สินเชื่อมาร์จิ้น')], a:0, why:B('Fractional shares let you buy by amount, e.g. 500 baht of a $200 stock.', 'เศษหุ้นทำให้ซื้อตามจำนวนเงินได้ เช่น 500 บาทของหุ้นราคา 200 ดอลลาร์') } },
      { id:'split', i:'pie', v:'split', t:B('Split the money, add monthly', 'แบ่งเงิน และลงทุนทุกเดือน'), lead:B('Decide how much goes into each holding before you buy, then add a fixed amount every month.', 'กำหนดก่อนซื้อว่าจะใส่เงินแต่ละตัวเท่าไร แล้วลงเงินเท่าๆ กันทุกเดือน'),
        p:[['pie', B('About 5–15 stocks; no single stock above 10–15%, no sector above 30%.', 'ถือราว 5–15 ตัว ตัวเดียวไม่เกิน 10–15% กลุ่มเดียวไม่เกิน 30%')], ['layers', B('An index fund or ETF makes a steady core.', 'กองทุนดัชนีหรือ ETF เป็นแกนพอร์ตที่นิ่ง')], ['cal', B('DCA: the same amount on the same day each month — no guessing the moment.', 'DCA: ลงเงินเท่ากันวันเดิมทุกเดือน ไม่ต้องเดาจังหวะ')], ['coin', B('Top up the holdings below their target % first instead of selling the others.', 'เงินใหม่เติมตัวที่ต่ำกว่า % เป้าหมายก่อน แทนการขายตัวอื่น')]],
        key:B('Plan the % first; let the monthly habit do the work.', 'วางสัดส่วนก่อน แล้วให้วินัยรายเดือนทำงาน'),
        quiz:{ q:B('With 10,000 baht, the most a single stock should get is about…', 'มีเงิน 10,000 บาท หุ้นตัวเดียวไม่ควรเกินราว…'), o:[B('1,000–1,500 baht', '1,000–1,500 บาท'), B('5,000 baht', '5,000 บาท'), B('10,000 baht', '10,000 บาท')], a:0, why:B('10–15% of 10,000 = 1,000–1,500, so one bad stock cannot sink you.', '10–15% ของ 10,000 = 1,000–1,500 บาท หุ้นตัวเดียวพังก็ไม่ทำให้ทั้งพอร์ตพัง') } },
      { id:'order', i:'tap', v:'order', t:B('Place your first order', 'ส่งคำสั่งซื้อครั้งแรก'), lead:B('Every app follows the same four moves.', 'ทุกแอปทำเหมือนกัน 4 อย่าง'),
        p:[['search', B('Search the ticker; check the full name.', 'ค้นชื่อย่อ แล้วเช็กชื่อบริษัทเต็มให้ตรง')], ['list', B('Thai stocks trade in lots of 100 shares (fewer = odd-lot board). US stocks in apps like Dime! can be bought by amount.', 'หุ้นไทยซื้อขาย lot ละ 100 หุ้น (น้อยกว่านั้น = กระดานหุ้นเศษ) หุ้นสหรัฐฯ ในแอปอย่าง Dime! ใส่เป็นจำนวนเงินได้')], ['flag', B('Limit = you set the price (safer). Market = buy now at the going price.', 'Limit = ตั้งราคาเอง (ปลอดภัยกว่า) Market = ซื้อทันทีราคาตลาด')], ['check', B('Read the total and the fee, then confirm. Make the first order small.', 'อ่านยอดรวมและค่าธรรมเนียมก่อนยืนยัน ครั้งแรกซื้อน้อยๆ')]],
        key:B('Small first order + Limit price.', 'ครั้งแรกซื้อน้อยๆ + ตั้งราคาแบบ Limit'),
        quiz:{ q:B('You want to buy only if the price is ฿40 or lower. Use a…', 'อยากซื้อเฉพาะตอนราคา 40 บาทหรือต่ำกว่า ควรใช้คำสั่ง…'), o:[B('Limit order at 40', 'Limit ที่ราคา 40'), B('Market order', 'Market'), B('Sell order', 'คำสั่งขาย')], a:0, why:B('A limit order never pays more than the price you set.', 'คำสั่ง Limit จะไม่ซื้อแพงกว่าราคาที่ตั้งไว้') } }
    ] },
    { id:'L4', c:'#fbbf24', i:'cal', t:B('Level 4 · Look after it', 'ระดับ 4 · ดูแลพอร์ต'), s:B('monthly check, when to sell, tax and fees', 'ทบทวนรายเดือน เมื่อไรควรขาย ภาษีและค่าธรรมเนียม'), L:[
      { id:'track', i:'cal', v:'track', t:B('Check once a month', 'ทบทวนเดือนละครั้ง'), lead:B('No need to watch every day. Once a month: is the reason you bought each stock still true?', 'ไม่ต้องดูทุกวัน เดือนละครั้งพอ ถามว่าเหตุผลที่ซื้อแต่ละตัวยังจริงอยู่ไหม'),
        p:[['cal', B('Pick a review day; look at results, news and your % split.', 'กำหนดวันทบทวน ดูผลประกอบการ ข่าว และสัดส่วนพอร์ต')], ['book', B('Write down why you bought each stock.', 'จดเหตุผลที่ซื้อแต่ละตัวไว้')], ['coin', B('Use new money to bring each holding back to its %.', 'ใช้เงินใหม่ปรับแต่ละตัวให้กลับมาตรง %')]],
        key:B('Monthly check, written reasons, calm decisions.', 'ทบทวนรายเดือน จดเหตุผล ตัดสินใจใจเย็น'), tour:'track',
        quiz:{ q:B('How often does a beginner really need to review?', 'มือใหม่ควรทบทวนพอร์ตบ่อยแค่ไหน'), o:[B('every hour', 'ทุกชั่วโมง'), B('about once a month', 'ราวเดือนละครั้ง'), B('never', 'ไม่ต้องดูเลย')], a:1, why:B('Monthly is enough to catch real changes without reacting to noise.', 'เดือนละครั้งพอจับการเปลี่ยนแปลงจริงได้ โดยไม่ตกใจกับความผันผวนรายวัน') } },
      { id:'sell', i:'alert', v:'sell', t:B('When to sell', 'เมื่อไรควรขาย'), lead:B('Sell when the reason changes, not because of one scary day.', 'ขายเมื่อเหตุผลเปลี่ยน ไม่ใช่เพราะตกใจวันเดียว'),
        p:[['alert', B('Profits shrinking for two quarters, or debt jumping.', 'กำไรลดลง 2 ไตรมาสติด หรือหนี้เพิ่มพรวด')], ['wave', B('The price closes below its 200-day line.', 'ราคาปิดต่ำกว่าเส้น 200 วัน')], ['pie', B('One stock has grown far above its % — trim it back.', 'หุ้นตัวเดียวโตจนเกิน % ที่วางไว้มาก ขายบางส่วนให้กลับมาตรงแผน')]],
        key:B('Sell on reasons; trim on weights; ignore noise.', 'ขายเพราะเหตุผล ลดเพราะสัดส่วน ไม่สนเสียงรบกวน'),
        quiz:{ q:B('Which is a real reason to sell?', 'ข้อไหนคือเหตุผลจริงที่ควรขาย'), o:[B('The price was red today', 'วันนี้ราคาแดง'), B('Profits have fallen two quarters in a row', 'กำไรลดลง 2 ไตรมาสติด'), B('A friend sold theirs', 'เพื่อนขายไปแล้ว')], a:1, why:B('A change in the business is a reason; one red day or a rumour is not.', 'ธุรกิจเปลี่ยนคือเหตุผล ราคาแดงวันเดียวหรือข่าวลือไม่ใช่') } },
      { id:'tax', i:'book', v:'tax', t:B('Tax and fees, the basics', 'ภาษีและค่าธรรมเนียมเบื้องต้น'), lead:B('A few simple rules decide how much of your gain you keep.', 'กฎง่ายๆ ไม่กี่ข้อที่บอกว่าเราจะเหลือกำไรเท่าไร'),
        p:[['coin', B('Thai dividends: 10% tax is withheld before you receive them.', 'ปันผลหุ้นไทย: ถูกหักภาษี 10% ก่อนเข้าบัญชี')], ['flag', B('US dividends: 15% withheld if you filed a W-8BEN form (otherwise 30%) — most apps do this when you open the account.', 'ปันผลหุ้นสหรัฐฯ: ถูกหัก 15% เมื่อยื่นฟอร์ม W-8BEN (ไม่ยื่น 30%) ส่วนใหญ่แอปให้ยื่นตอนเปิดบัญชี')], ['trend', B('Profits from selling Thai shares on the SET are tax-free for individuals.', 'กำไรจากการขายหุ้นไทยในตลาด SET บุคคลทั่วไปไม่ต้องเสียภาษี')], ['alert', B('Every buy and sell has a fee; trading less keeps more money working.', 'ทุกครั้งที่ซื้อขายมีค่าธรรมเนียม ซื้อขายน้อยลง = เงินทำงานได้มากขึ้น')]],
        key:B('Fewer trades, the right forms, and know what is withheld.', 'ซื้อขายไม่บ่อย ยื่นฟอร์มให้ครบ และรู้ว่าถูกหักอะไรบ้าง'),
        quiz:{ q:B('A Thai stock pays you a ฿1,000 dividend. Roughly how much reaches your account?', 'หุ้นไทยจ่ายปันผลให้ 1,000 บาท จะเข้าบัญชีราวเท่าไร'), o:[B('฿1,000', '1,000 บาท'), B('฿900', '900 บาท'), B('฿700', '700 บาท')], a:1, why:B('10% is withheld: 1,000 − 100 = 900.', 'ถูกหัก 10%: 1,000 − 100 = 900 บาท') } }
    ] }
  ];
  var ALL = []; LV.forEach(function(lv){ lv.L.forEach(function(l){ l.lv = lv; ALL.push(l); }); });
  function lessonById(id){ for(var i = 0; i < ALL.length; i++) if(ALL[i].id === id) return ALL[i]; return null; }
  var U = {
    eb:B('Start from zero', 'เริ่มจากศูนย์'),
    h:B('From knowing nothing to your first stock — 4 levels', 'จากไม่รู้อะไรเลย สู่หุ้นตัวแรก — 4 ระดับ'),
    lede:B('Go level by level. Every lesson has a picture, the few things that matter, a small calculator where it helps, and one question to check you got it.', 'เรียนทีละระดับ แต่ละบทมีภาพอธิบาย สิ่งสำคัญไม่กี่ข้อ เครื่องคิดเลขเล็กๆ ให้ลองเอง และคำถาม 1 ข้อไว้เช็กความเข้าใจ'),
    start:B('Start lesson 1', 'เริ่มบทที่ 1'), cont:B('Continue: ', 'เรียนต่อ: '), again:B('Review from the start', 'ทบทวนตั้งแต่ต้น'),
    tour:B('Tour the site for beginners', 'พาทัวร์เว็บสำหรับมือใหม่'), done:B('lessons done', 'บทที่เรียนแล้ว'),
    key:B('Remember', 'จำง่ายๆ'), next:B('Next lesson', 'บทถัดไป'), back:B('Back', 'ย้อนกลับ'), show:B('Show me on the site', 'พาดูในเว็บ'),
    qh:B('Check yourself', 'เช็กความเข้าใจ'), qok:B('Correct', 'ถูกต้อง'), qno:B('Not quite', 'ยังไม่ใช่'),
    fin:B('All levels done. Take it slowly — one small order at a time.', 'เรียนครบทุกระดับแล้ว ค่อยๆ เริ่มจากคำสั่งเล็กๆ ทีละครั้ง'),
    lessons:B('Lessons by topic (below)', 'บทเรียนแยกหัวข้อ (ด้านล่าง)'), note:B('For learning only — not investment advice. App features, fees and tax rules change; check them before you act.', 'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน ฟีเจอร์ ค่าธรรมเนียม และกฎภาษีเปลี่ยนได้ ตรวจสอบอีกครั้งก่อนลงมือ')
  };
  var ST = { done:{}, lv:'L1', cur:null, open:false, ans:{} };
  try { var s0 = JSON.parse(localStorage.getItem('spz.sks2') || 'null'); if(s0){ ST.done = s0.done || {}; ST.lv = s0.lv || 'L1'; ST.cur = s0.cur || null; } } catch(e){}
  function save(){ try { localStorage.setItem('spz.sks2', JSON.stringify({ done:ST.done, lv:ST.lv, cur:ST.cur })); } catch(e){} }
  function nDone(list){ return (list || ALL).filter(function(l){ return ST.done[l.id]; }).length; }
  function firstOpen(){ for(var i = 0; i < ALL.length; i++) if(!ST.done[ALL[i].id]) return ALL[i]; return null; }

  function heroHTML(){
    var n = nDone(), tot = ALL.length, pct = Math.round(n / tot * 100), fo = firstOpen();
    var btn = !fo ? [ALL[0].id, T(U.again)] : n ? [fo.id, T(U.cont) + T(fo.t)] : [ALL[0].id, T(U.start)];
    return '<div class="sks-hero"><div class="sks-hart">' + heroArt() + '</div><div class="sks-ht"><span class="sks-eb">' + ico('compass') + esc(T(U.eb)) + '</span><h3>' + esc(T(U.h)) + '</h3><p>' + esc(T(U.lede)) + '</p>' +
      '<div class="sks-prog"><i style="width:' + pct + '%"></i></div><small class="sks-pn">' + esc(T(U.done)) + ' ' + n + '/' + tot + '</small>' +
      '<div class="sks-hb"><button type="button" class="sks-btn pri" data-sk2-open="' + btn[0] + '">' + ico('play') + esc(btn[1]) + '</button><button type="button" class="sks-btn" data-sk-tour="main">' + ico('eye') + esc(T(U.tour)) + '</button></div></div></div>';
  }
  function heroArt(){
    return '<svg class="sk-art sk-hart-svg" viewBox="0 0 220 150" aria-hidden="true"><defs><linearGradient id="skHg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".45"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="M10 120 L40 104 L62 110 L88 82 L112 90 L140 58 L164 66 L200 28 L200 140 L10 140 Z" fill="url(#skHg)" class="area"/>' +
      '<path d="M10 120 L40 104 L62 110 L88 82 L112 90 L140 58 L164 66 L200 28" class="draw"/>' +
      [[40, 104], [88, 82], [140, 58], [200, 28]].map(function(p, i){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" class="mk" style="animation-delay:' + (0.5 + i * 0.45) + 's"/><text x="' + (i === 3 ? p[0] - 14 : p[0]) + '" y="' + (i === 3 ? p[1] + 4 : p[1] - 10) + '" class="num" text-anchor="middle" style="animation-delay:' + (0.5 + i * 0.45) + 's">' + (i + 1) + '</text>'; }).join('') +
      '<g class="flagup"><path d="M200 28 V6" class="st"/><path d="M200 6 h18 l-5 6 l5 6 h-18" class="flagf"/></g></svg>';
  }
  function levelsHTML(){
    return '<div class="sk2-lv">' + LV.map(function(lv, i){ var n = nDone(lv.L), pc = Math.round(n / lv.L.length * 100), on = ST.lv === lv.id;
      return '<button type="button" class="sk2-lc' + (on ? ' on' : '') + (n === lv.L.length ? ' full' : '') + '" data-sk2-lv="' + lv.id + '" style="--lc:' + lv.c + '"><span class="sk2-ring" style="--p:' + pc + '"><i>' + ico(lv.i) + '</i></span><span class="sk2-lt"><b>' + esc(T(lv.t)) + '</b><small>' + esc(T(lv.s)) + '</small><em>' + n + '/' + lv.L.length + ' ' + esc(T(B('lessons', 'บท'))) + '</em></span></button>'; }).join('') + '</div>';
  }
  function lessonsHTML(){
    var lv = LV.filter(function(x){ return x.id === ST.lv; })[0] || LV[0];
    return '<div class="sk2-ls" style="--lc:' + lv.c + '">' + lv.L.map(function(l, i){ var on = ST.open && ST.cur === l.id;
      return '<button type="button" class="sk2-li' + (ST.done[l.id] ? ' done' : '') + (on ? ' on' : '') + '" data-sk2-open="' + l.id + '"><i>' + ico(ST.done[l.id] ? 'check' : l.i) + '</i><span><small>' + esc(T(B('Lesson ', 'บทที่ '))) + (i + 1) + '</small><b>' + esc(T(l.t)) + '</b></span></button>'; }).join('') + '</div>';
  }
  function quizHTML(l){
    var q = l.quiz; if(!q) return ''; var a = ST.ans[l.id];
    return '<div class="sk2-q' + (a != null ? (a === q.a ? ' ok' : ' no') : '') + '"><div class="sk2-qh">' + ico('star') + esc(T(U.qh)) + '</div><p>' + esc(T(q.q)) + '</p><div class="sk2-qo">' + q.o.map(function(o, i){ var c = a == null ? '' : i === q.a ? ' right' : i === a ? ' wrong' : ''; return '<button type="button" data-sk2-ans="' + i + '" class="' + c + '"' + (a != null ? ' disabled' : '') + '><u>' + 'ABC'.charAt(i) + '</u>' + esc(T(o)) + '</button>'; }).join('') + '</div>' +
      (a != null ? '<div class="sk2-qr">' + ico(a === q.a ? 'check' : 'x') + '<div><b>' + esc(T(a === q.a ? U.qok : U.qno)) + '</b><span>' + esc(T(q.why)) + '</span></div>' + (a !== q.a ? '<button type="button" class="sks-btn" data-sk2-retry>' + esc(T(B('Try again', 'ลองใหม่'))) + '</button>' : '') + '</div>' : '') + '</div>';
  }
  function panelHTML(){
    if(!ST.open || !ST.cur) return '';
    var l = lessonById(ST.cur); if(!l) return '';
    var idx = ALL.indexOf(l), last = idx === ALL.length - 1, prev = ALL[idx - 1], nx = ALL[idx + 1], li = l.lv.L.indexOf(l);
    return '<div class="sk2-p" style="--lc:' + l.lv.c + '" data-sk-anim><div class="sk2-pv">' + (V[l.v] ? V[l.v]() : '') + '</div><div class="sk2-pt"><span class="sks-ps">' + esc(T(l.lv.t)) + ' · ' + esc(T(B('lesson ', 'บทที่ '))) + (li + 1) + '/' + l.lv.L.length + '</span><h4>' + ico(l.i) + esc(T(l.t)) + '</h4><p class="sks-lead">' + esc(T(l.lead)) + '</p>' +
      '<ul class="sks-pts">' + l.p.map(function(p, k){ return '<li style="animation-delay:' + (0.08 + k * 0.1) + 's"><i>' + ico(p[0]) + '</i><span>' + esc(T(p[1])) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="sks-key">' + ico('star') + '<div><b>' + esc(T(U.key)) + '</b><span>' + esc(T(l.key)) + '</span></div></div>' + calcHTML(l.c) + quizHTML(l) +
      '<div class="sks-pb">' + (prev ? '<button type="button" class="sks-btn" data-sk2-open="' + prev.id + '">' + ico('arrowL') + esc(T(U.back)) + '</button>' : '') + (l.tour ? '<button type="button" class="sks-btn" data-sk-tour="' + l.tour + '">' + ico('eye') + esc(T(U.show)) + '</button>' : '') +
      (nx ? '<button type="button" class="sks-btn pri" data-sk2-next="' + l.id + '">' + esc(T(U.next)) + ': ' + esc(T(nx.t)) + ico('arrowR') + '</button>' : '<button type="button" class="sks-btn pri" data-sk2-next="' + l.id + '">' + esc(T(B('Finish', 'จบคอร์ส'))) + ico('check') + '</button>') + '</div>' +
      (last && nDone() === ALL.length ? '<p class="sks-fin">' + ico('check') + esc(T(U.fin)) + '</p>' : '') + '</div></div>';
  }
  var root = null;
  function paint(){
    if(!root) return;
    root.innerHTML = heroHTML() + levelsHTML() + lessonsHTML() + panelHTML() + '<p class="sks-note">' + esc(T(U.note)) + '</p><h5 class="sks-lessons">' + ico('book') + esc(T(U.lessons)) + '</h5>';
  }
  function openLesson(id){ var l = lessonById(id); if(!l) return; ST.cur = id; ST.lv = l.lv.id; ST.open = true; save(); paint(); scrollPanel(); }
  function wire(){
    root.addEventListener('click', function(ev){
      var lv = ev.target.closest('[data-sk2-lv]'), o = ev.target.closest('[data-sk2-open]'), nx = ev.target.closest('[data-sk2-next]'), an = ev.target.closest('[data-sk2-ans]'), rt = ev.target.closest('[data-sk2-retry]'), tr = ev.target.closest('[data-sk-tour]');
      if(lv){ ST.lv = lv.getAttribute('data-sk2-lv'); var L0 = LV.filter(function(x){ return x.id === ST.lv; })[0]; var f = L0.L.filter(function(l){ return !ST.done[l.id]; })[0] || L0.L[0]; openLesson(f.id); return; }
      if(o){ openLesson(o.getAttribute('data-sk2-open')); return; }
      if(nx){ var id = nx.getAttribute('data-sk2-next'), l = lessonById(id); ST.done[id] = true; var n2 = ALL[ALL.indexOf(l) + 1]; if(n2) openLesson(n2.id); else { save(); paint(); } return; }
      if(an){ var c = lessonById(ST.cur); var k = +an.getAttribute('data-sk2-ans'); ST.ans[ST.cur] = k; if(c && c.quiz && k === c.quiz.a) ST.done[ST.cur] = true; save(); var y = window.pageYOffset; paint(); window.scrollTo(0, y); return; }
      if(rt){ delete ST.ans[ST.cur]; var y2 = window.pageYOffset; paint(); window.scrollTo(0, y2); return; }
      if(tr){ ev.stopPropagation(); TOUR.start(tr.getAttribute('data-sk-tour')); }
    });
    root.addEventListener('input', function(ev){
      var i = ev.target; if(!i.hasAttribute || !i.hasAttribute('data-cf')) return;
      var box = i.closest('[data-calc]'), k = box.getAttribute('data-calc'); CV[k] = CV[k] || {}; CV[k][i.getAttribute('data-cf')] = i.value;
      try { localStorage.setItem('spz.sks.calc', JSON.stringify(CV)); } catch(e){}
      box.querySelector('[data-co]').innerHTML = calcOut(k);
    });
  }
  function scrollPanel(){
    var p = root.querySelector('.sk2-p'); if(!p) return;
    var top = p.getBoundingClientRect().top, topH = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--spz-topH'), 10) || 90) + 12;
    if(top < topH || top > window.innerHeight * 0.6) window.scrollTo({ top:window.pageYOffset + top - topH, behavior:'smooth' });
  }

  /* ---------------- spotlight tour ---------------- */
  var MI = function(id){ return { menu:true, sel:'.navmenu .np-item[data-route-to="' + id + '"]' }; };
  var TOURS = {
    main:[
      { sel:'.navmenu .nav-trig', t:B('The menu', 'ปุ่มเมนู'), d:B('Every page of the site is in here. You can tap it now — the tour opens it for you on the next step.', 'ทุกหน้าในเว็บอยู่ในปุ่มนี้ กดได้เลย หรือกด “ต่อไป” แล้วระบบจะเปิดให้') },
      Object.assign(MI('basics'), { t:B('Start Investing', 'เริ่มต้นลงทุน'), d:B('The plain guide: what a share is and how to open a brokerage account.', 'คู่มือพื้นฐาน: หุ้นคืออะไร และวิธีเปิดบัญชีซื้อขายหุ้น') }),
      Object.assign(MI('stockclass'), { t:B('Stock Classroom — you are here', 'ห้องเรียนหุ้น — คุณอยู่ตรงนี้'), d:B('This course and the lessons by topic: business, financial statements, value, the economy, risk.', 'คอร์สนี้และบทเรียนแยกหัวข้อ: ธุรกิจ งบการเงิน มูลค่า เศรษฐกิจ ความเสี่ยง') }),
      Object.assign(MI('now'), { t:B('What to do now', 'ตอนนี้ควรทำอะไร'), d:B('The market on one screen: calm or stormy, and what that usually means.', 'ภาพตลาดหน้าเดียว: ตอนนี้สงบหรือมีพายุ และปกติแปลว่าอะไร') }),
      Object.assign(MI('directory'), { t:B('Stock Directory & Compare', 'หุ้นตัวอย่างและเปรียบเทียบ'), d:B('Real companies with their key numbers, side by side. Opens after signing in as a member (LINE, Telegram, Facebook or Google).', 'บริษัทจริงพร้อมตัวเลขสำคัญ เทียบกันได้ เปิดได้เมื่อล็อกอินสมาชิก (LINE, Telegram, Facebook หรือ Google)') }),
      Object.assign(MI('stock'), { t:B('One Stock, One Page', 'ดูหุ้นรายตัว'), d:B('Everything about one company on one page — use it for the checklist in step 5.', 'ทุกอย่างของบริษัทเดียวในหน้าเดียว ใช้เช็กลิสต์ในขั้นที่ 5') }),
      Object.assign(MI('watchlist'), { t:B('My Watchlist', 'วอทช์ลิสต์ของฉัน'), d:B('Keep your short list here and watch it over time.', 'เก็บรายชื่อหุ้นที่สนใจไว้ที่นี่ แล้วติดตามต่อเนื่อง') }),
      { sel:'#spzAdminTrigger', t:B('Sign in', 'เข้าสู่ระบบ'), d:B('Sign in with LINE, Telegram, Facebook or Google to open the member pages. It is free.', 'ล็อกอินด้วย LINE, Telegram, Facebook หรือ Google เพื่อเปิดหน้าสำหรับสมาชิก') },
      { sel:'#langToggle', t:B('Language', 'ภาษา'), d:B('Switch between Thai and English any time.', 'สลับภาษาไทย / อังกฤษได้ตลอด') }
    ],
    learn:[Object.assign(MI('types'), { t:B('Stock Types', 'ประเภทหุ้น'), d:B('Value, growth, dividend and defensive stocks — what each one is like.', 'หุ้นคุณค่า หุ้นเติบโต หุ้นปันผล หุ้นตั้งรับ แต่ละแบบเป็นอย่างไร') }),
      Object.assign(MI('glossary'), { t:B('Glossary', 'คำศัพท์และเมตริกหลัก'), d:B('P/E, ROE, dividend yield and the other words used everywhere.', 'P/E, ROE, อัตราปันผล และคำที่ใช้ทั่วเว็บ') })],
    apps:[Object.assign(MI('basics'), { t:B('Start Investing', 'เริ่มต้นลงทุน'), d:B('The step-by-step account opening guide lives here.', 'วิธีเปิดบัญชีแบบละเอียดทีละขั้นอยู่หน้านี้') }),
      { sel:'#spzAdminTrigger', t:B('Sign in here too', 'ล็อกอินเว็บนี้ด้วย'), d:B('Signing in to this site (free) opens the member tools you will use to pick stocks.', 'ล็อกอินเว็บนี้ (ฟรี) เพื่อเปิดเครื่องมือสมาชิกที่ใช้เลือกหุ้น') }],
    pick:[Object.assign(MI('now'), { t:B('1. The big picture', '1. ภาพใหญ่'), d:B('Is the market calm or stormy right now?', 'ตอนนี้ตลาดสงบหรือมีพายุ') }),
      Object.assign(MI('directory'), { t:B('2. Compare companies', '2. เทียบบริษัท'), d:B('P/E, dividend, ROE, debt — side by side. Member page.', 'P/E ปันผล ROE หนี้ เทียบกันได้ (หน้าสมาชิก)') }),
      Object.assign(MI('stock'), { t:B('3. Check one company', '3. เช็กทีละตัว'), d:B('Run the checklist on each name. Member page.', 'ไล่เช็กลิสต์ทีละตัว (หน้าสมาชิก)') }),
      Object.assign(MI('earlysignal'), { t:B('4. Timing', '4. จังหวะ'), d:B('Money already in the sector, the stock not yet running. Member page.', 'เงินเข้ากลุ่มแล้วแต่หุ้นยังไม่วิ่ง (หน้าสมาชิก)') }),
      Object.assign(MI('watchlist'), { t:B('5. Keep the short list', '5. เก็บรายชื่อ'), d:B('Save the names you chose.', 'บันทึกหุ้นที่เลือกไว้') })],
    track:[Object.assign(MI('watchlist'), { t:B('Your list', 'รายชื่อของคุณ'), d:B('Open it on your review day each month.', 'เปิดดูในวันทบทวนของแต่ละเดือน') }),
      Object.assign(MI('ecocal'), { t:B('Economic Calendar', 'ปฏิทินเศรษฐกิจ'), d:B('Big release days (inflation, the Fed) that can move prices.', 'วันประกาศตัวเลขใหญ่ (เงินเฟ้อ เฟด) ที่ทำให้ราคาขยับ') }),
      Object.assign(MI('daily'), { t:B('Daily Summary', 'สรุปประจำวัน'), d:B('A two-minute read of the whole market. Member page.', 'สรุปตลาดทั้งหมดอ่าน 2 นาที (หน้าสมาชิก)') })]
  };
  var TU = { next:B('Next', 'ต่อไป'), prev:B('Back', 'ย้อน'), end:B('Done', 'เสร็จแล้ว'), skip:B('Close the tour', 'ปิดทัวร์'), miss:B('This button is not on this screen right now.', 'ตอนนี้ปุ่มนี้ไม่อยู่บนหน้าจอ') };
  var TOUR = (function(){
    var box = null, steps = [], k = 0, tgt = null, iv = null;
    function menuEl(){ return document.querySelector('.navmenu'); }
    function openMenu(open){ var m = menuEl(); if(!m) return; var isOpen = m.classList.contains('open'); if(open !== isOpen){ var b = m.querySelector('.nav-trig'); if(b) b.click(); else m.classList.toggle('open', open); } }
    function build(){
      box = document.createElement('div'); box.className = 'skt';
      box.innerHTML = '<div class="skt-p t"></div><div class="skt-p l"></div><div class="skt-p r"></div><div class="skt-p b"></div><div class="skt-ring"></div><div class="skt-tip" role="dialog" aria-live="polite"></div>';
      document.body.appendChild(box);
      box.addEventListener('click', function(ev){
        ev.stopPropagation();
        var b = ev.target.closest('[data-skt]'); if(!b) return;
        var a = b.getAttribute('data-skt');
        if(a === 'next'){ if(k < steps.length - 1) go(k + 1); else stop(); }
        else if(a === 'prev'){ if(k > 0) go(k - 1); }
        else stop();
      });
      document.addEventListener('keydown', function(ev){ if(!box || box.hidden) return; if(ev.key === 'Escape') stop(); else if(ev.key === 'ArrowRight') { if(k < steps.length - 1) go(k + 1); } else if(ev.key === 'ArrowLeft'){ if(k > 0) go(k - 1); } });
      window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    }
    function find(st){ var e = document.querySelector(st.sel); if(!e) return null; var r = e.getBoundingClientRect(); return r.width || r.height ? e : null; }
    function go(i){
      k = i; var st = steps[k];
      openMenu(!!st.menu);
      setTimeout(function(){
        tgt = find(st);
        if(tgt){ try { tgt.scrollIntoView({ block:'nearest', inline:'nearest' }); } catch(e){} if(st.menu){ try { tgt.scrollIntoView({ block:'center' }); } catch(e){} } }
        var tip = box.querySelector('.skt-tip');
        tip.innerHTML = '<div class="skt-h"><span>' + (k + 1) + ' / ' + steps.length + '</span><button type="button" data-skt="x" aria-label="close">' + ico('x') + '</button></div><b>' + esc(T(st.t)) + '</b><p>' + esc(T(st.d)) + '</p>' + (tgt ? '' : '<p class="miss">' + esc(T(TU.miss)) + '</p>') +
          '<div class="skt-dots">' + steps.map(function(_, j){ return '<i class="' + (j === k ? 'on' : j < k ? 'past' : '') + '"></i>'; }).join('') + '</div>' +
          '<div class="skt-b">' + (k > 0 ? '<button type="button" data-skt="prev">' + ico('arrowL') + esc(T(TU.prev)) + '</button>' : '<button type="button" data-skt="x">' + esc(T(TU.skip)) + '</button>') + '<button type="button" class="pri" data-skt="next">' + esc(T(k < steps.length - 1 ? TU.next : TU.end)) + (k < steps.length - 1 ? ico('arrowR') : ico('check')) + '</button></div>';
        tip.classList.remove('in'); void tip.offsetWidth; tip.classList.add('in');
        place();
      }, st.menu ? 380 : 60);
    }
    function place(){
      if(!box || box.hidden) return;
      var W = window.innerWidth, H = window.innerHeight, pad = 8, r = tgt && tgt.isConnected ? tgt.getBoundingClientRect() : null;
      if(r && !(r.width || r.height)) r = null;
      var x0 = r ? Math.max(0, r.left - pad) : W / 2, y0 = r ? Math.max(0, r.top - pad) : H / 2, x1 = r ? Math.min(W, r.right + pad) : W / 2, y1 = r ? Math.min(H, r.bottom + pad) : H / 2;
      var P = function(c, s){ var e = box.querySelector('.skt-p.' + c); for(var kk in s) e.style[kk] = s[kk]; };
      P('t', { left:'0', top:'0', width:W + 'px', height:y0 + 'px' }); P('b', { left:'0', top:y1 + 'px', width:W + 'px', height:Math.max(0, H - y1) + 'px' });
      P('l', { left:'0', top:y0 + 'px', width:x0 + 'px', height:(y1 - y0) + 'px' }); P('r', { left:x1 + 'px', top:y0 + 'px', width:Math.max(0, W - x1) + 'px', height:(y1 - y0) + 'px' });
      var ring = box.querySelector('.skt-ring'); ring.style.display = r ? 'block' : 'none';
      if(r){ ring.style.left = x0 + 'px'; ring.style.top = y0 + 'px'; ring.style.width = (x1 - x0) + 'px'; ring.style.height = (y1 - y0) + 'px'; }
      var tip = box.querySelector('.skt-tip'), tw = Math.min(330, W - 24), th = tip.offsetHeight || 180;
      tip.style.width = tw + 'px';
      var tx, ty;
      if(!r){ tx = (W - tw) / 2; ty = (H - th) / 2; }
      else {
        var below = H - y1, above = y0, right = W - x1;
        if(below >= th + 16){ ty = y1 + 12; tx = Math.min(Math.max(12, x0), W - tw - 12); }
        else if(above >= th + 16){ ty = y0 - th - 12; tx = Math.min(Math.max(12, x0), W - tw - 12); }
        else if(right >= tw + 16){ tx = x1 + 12; ty = Math.min(Math.max(12, y0), H - th - 12); }
        else { tx = Math.max(12, x0 - tw - 12); ty = Math.min(Math.max(12, y0), H - th - 12); }
      }
      tip.style.left = Math.round(tx) + 'px'; tip.style.top = Math.round(ty) + 'px';
    }
    function start(name){
      steps = TOURS[name] || []; if(!steps.length) return;
      if(!box) build();
      box.hidden = false; document.documentElement.classList.add('skt-on');
      clearInterval(iv); iv = setInterval(place, 300);
      go(0);
    }
    function stop(){ if(!box) return; box.hidden = true; document.documentElement.classList.remove('skt-on'); clearInterval(iv); openMenu(false); tgt = null; }
    return { start:start, stop:stop };
  })();
  window.__SPZ_TOUR = TOUR;

  /* ---------------- mount ---------------- */
  function mount(){
    var sec = document.getElementById('stockclass'); if(!sec) return false;
    var wrap = sec.querySelector('.ewv-wrap'), body = sec.querySelector('[data-ewv="body"]'); if(!wrap || !body) return false;
    if(document.getElementById('skStart')) return true;
    root = document.createElement('div'); root.id = 'skStart'; root.className = 'sks';
    wrap.insertBefore(root, body);
    wire(); paint();
    return true;
  }
  var tries = 0;
  (function wait(){ if(mount()) return; if(++tries < 300) setTimeout(wait, 200); })();
  new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
})();
