/* ============================================================================
   SPACEZ STOCK START (2026-11-04) -- "start from zero" course + spotlight tour
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
    star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/>'
  };
  function ico(k, cls){ return '<svg class="sk-i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }

  /* ---------------- animated infographics (240 x 160) ---------------- */
  function svg(inner){ return '<svg class="sk-art" viewBox="0 0 240 160" aria-hidden="true">' + inner + '</svg>'; }
  function txt(x, y, s, cls){ return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'lb') + '" text-anchor="middle">' + esc(s) + '</text>'; }
  var ART = [
    /* 1 a company cut into pieces -- one piece is yours, it earns in two ways */
    function(){ return svg(
      '<rect x="34" y="40" width="86" height="96" rx="6" class="st"/>' +
      [0, 1, 2, 3].map(function(r){ return [0, 1, 2].map(function(c){ return '<rect x="' + (46 + c * 24) + '" y="' + (52 + r * 18) + '" width="14" height="10" rx="2" class="win" style="animation-delay:' + ((r * 3 + c) * 0.15) + 's"/>'; }).join(''); }).join('') +
      '<g class="pop"><path d="M150 96 L150 60 A36 36 0 0 1 184 84 Z" class="slice"/><circle cx="150" cy="96" r="36" class="ring"/></g>' +
      txt(172, 146, T(B('your share', 'ส่วนของคุณ'))) +
      '<g class="rise"><circle cx="196" cy="50" r="9" class="coin"/><text x="196" y="54" class="cs" text-anchor="middle">$</text></g>' +
      '<g class="rise d2"><circle cx="214" cy="70" r="7" class="coin"/></g>' +
      '<path d="M200 34 l8 -10 l8 10" class="up"/>' + txt(77, 30, T(B('a company', 'บริษัท')))); },
    /* 2 three jars: emergency first, then spending, then investing */
    function(){ var J = [[B('emergency', 'สำรองฉุกเฉิน'), 'j1', 0.95], [B('spending', 'ใช้จ่าย'), 'j2', 0.6], [B('investing', 'ลงทุน'), 'j3', 0.45]];
      return svg(J.map(function(j, i){ var x = 22 + i * 74;
        return '<path d="M' + (x + 6) + ' 44 h48 v8 c6 4 6 8 6 12 v62 a8 8 0 0 1 -8 8 h-52 a8 8 0 0 1 -8 -8 v-62 c0 -4 0 -8 6 -12 z" class="jar"/>' +
          '<clipPath id="skj' + i + '"><path d="M' + (x + 1) + ' 64 h58 v62 a7 7 0 0 1 -7 7 h-44 a7 7 0 0 1 -7 -7 z"/></clipPath>' +
          '<rect x="' + x + '" y="64" width="60" height="70" class="liq ' + j[1] + '" clip-path="url(#skj' + i + ')" style="--fl:' + j[2] + ';animation-delay:' + (i * 0.6) + 's"/>' +
          txt(x + 30, 154, T(j[0])) + '<text x="' + (x + 30) + '" y="36" class="num" text-anchor="middle">' + (i + 1) + '</text>'; }).join('')); },
    /* 3 the price swings, but over time the trend shows; spread across baskets */
    function(){ return svg(
      '<path d="M14 120 C 34 96, 44 132, 62 104 S 92 70, 108 92 S 138 60, 156 70 S 190 34, 226 30" class="draw"/>' +
      '<path d="M14 128 L226 46" class="trend"/>' +
      txt(60, 148, T(B('short run: bumpy', 'ระยะสั้น: แกว่ง'))) + txt(186, 148, T(B('long run: the trend', 'ระยะยาว: เห็นทิศ'))) +
      [0, 1, 2].map(function(i){ var x = 24 + i * 30; return '<g class="bk" style="animation-delay:' + (i * 0.3) + 's"><path d="M' + x + ' 22 h22 l-3 14 h-16 z" class="basket"/><circle cx="' + (x + 7) + '" cy="20" r="3" class="ball"/><circle cx="' + (x + 15) + '" cy="20" r="3" class="ball b2"/></g>'; }).join('')); },
    /* 4 phone + ID card + bank = an account */
    function(){ return svg(
      '<rect x="92" y="14" width="58" height="112" rx="10" class="st"/><rect x="99" y="26" width="44" height="76" rx="4" class="scr"/>' +
      '<rect x="104" y="34" width="34" height="6" rx="3" class="bar"/><rect x="104" y="46" width="24" height="6" rx="3" class="bar b2"/><rect x="104" y="58" width="30" height="6" rx="3" class="bar b3"/>' +
      '<path d="M108 84 l8 8 l14 -16" class="tick"/>' +
      '<g class="slideL"><rect x="14" y="56" width="64" height="42" rx="6" class="card"/><circle cx="32" cy="74" r="7" class="st"/><path d="M46 70 h24 M46 80 h16" class="st"/></g>' +
      '<g class="slideR"><path d="M168 66 l30 -16 l30 16 z" class="st"/><path d="M174 70 v24 M188 70 v24 M208 70 v24 M222 70 v24 M168 98 h60" class="st"/></g>' +
      txt(46, 116, T(B('ID card', 'บัตรประชาชน'))) + txt(121, 146, T(B('broker app', 'แอปโบรกเกอร์'))) + txt(198, 116, T(B('bank account', 'บัญชีธนาคาร')))); },
    /* 5 a magnifier sweeps a list and keeps the strong ones */
    function(){ var rows = [0.9, 0.5, 0.75, 0.35, 0.85];
      return svg(rows.map(function(v, i){ var y = 20 + i * 24, ok = v > 0.7; return '<rect x="20" y="' + y + '" width="150" height="16" rx="4" class="row' + (ok ? ' ok' : '') + '"/><rect x="24" y="' + (y + 4) + '" width="' + (v * 110) + '" height="8" rx="4" class="fill' + (ok ? ' ok' : '') + '" style="animation-delay:' + (i * 0.2) + 's"/>' + (ok ? '<path d="M178 ' + (y + 8) + ' l5 5 l9 -10" class="tick sm" style="animation-delay:' + (1 + i * 0.25) + 's"/>' : ''); }).join('') +
        '<g class="scan"><circle cx="200" cy="40" r="16" class="lens"/><path d="M211 52 l14 14" class="st thick"/></g>' + txt(100, 148, T(B('keep only the strong ones', 'เก็บไว้เฉพาะตัวที่แข็งแรง')))); },
    /* 6 a pie that fills in + coins dropping into a calendar every month */
    function(){ var seg = [[0, 0.3, 'p1'], [0.3, 0.55, 'p2'], [0.55, 0.75, 'p3'], [0.75, 1, 'p4']];
      var arc = function(a0, a1){ var r = 42, cx = 70, cy = 78, p = function(a){ var t = a * Math.PI * 2 - Math.PI / 2; return (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1); }; return 'M' + cx + ' ' + cy + ' L' + p(a0) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 0.5 ? 1 : 0) + ' 1 ' + p(a1) + ' Z'; };
      return svg(seg.map(function(s, i){ return '<path d="' + arc(s[0], s[1]) + '" class="seg ' + s[2] + '" style="animation-delay:' + (i * 0.35) + 's"/>'; }).join('') +
        '<rect x="140" y="52" width="80" height="70" rx="6" class="st"/><path d="M140 70 h80" class="st"/>' + [0, 1, 2, 3].map(function(i){ return '<rect x="' + (148 + i * 18) + '" y="80" width="12" height="10" rx="2" class="day' + (i === 1 ? ' on' : '') + '"/>'; }).join('') +
        '<g class="drop"><circle cx="180" cy="30" r="8" class="coin"/></g>' + txt(70, 146, T(B('split the money', 'แบ่งเงินเป็นส่วน'))) + txt(180, 146, T(B('same amount every month', 'ลงเท่ากันทุกเดือน')))); },
    /* 7 the order ticket: search, amount, limit, confirm */
    function(){ return svg(
      '<rect x="70" y="8" width="100" height="144" rx="12" class="st"/>' +
      '<rect x="80" y="22" width="80" height="14" rx="7" class="fieldx"/><circle cx="90" cy="29" r="3" class="st"/>' + '<text x="98" y="32" class="ft">PTT</text>' +
      '<rect x="80" y="44" width="80" height="16" rx="4" class="fieldx"/><text x="86" y="55" class="ft">' + esc(T(B('Shares 100', 'จำนวน 100 หุ้น'))) + '</text>' +
      '<rect x="80" y="66" width="38" height="16" rx="4" class="seg2 on"/><rect x="122" y="66" width="38" height="16" rx="4" class="seg2"/><text x="99" y="77" class="ft c" text-anchor="middle">Limit</text><text x="141" y="77" class="ft" text-anchor="middle">Market</text>' +
      '<rect x="80" y="112" width="80" height="22" rx="11" class="buy"/><text x="120" y="127" class="ft w" text-anchor="middle">' + esc(T(B('Buy', 'ซื้อ'))) + '</text>' +
      '<circle cx="132" cy="123" r="6" class="ripple"/>' +
      txt(36, 34, '1') + txt(36, 56, '2') + txt(36, 78, '3') + txt(36, 128, '4') + '<path d="M44 30 h30 M44 52 h30 M44 74 h30 M44 124 h30" class="guide"/>'); },
    /* 8 a monthly check on the calendar and a line that keeps going */
    function(){ return svg(
      '<rect x="16" y="26" width="96" height="96" rx="8" class="st"/><path d="M16 46 h96" class="st"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(i){ var c = i % 4, r = Math.floor(i / 4); return '<rect x="' + (26 + c * 22) + '" y="' + (56 + r * 20) + '" width="14" height="12" rx="2" class="day' + (c === 0 ? ' on' : '') + '" style="animation-delay:' + (i * 0.12) + 's"/>'; }).join('') +
      '<path d="M128 110 L148 96 L166 102 L186 78 L204 84 L226 56" class="draw"/>' + [[148, 96], [186, 78], [226, 56]].map(function(p, i){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" class="mk" style="animation-delay:' + (1.4 + i * 0.4) + 's"/>'; }).join('') +
      txt(64, 142, T(B('check once a month', 'ทบทวนเดือนละครั้ง'))) + txt(180, 142, T(B('keep, add or switch', 'ถือต่อ เติม หรือสลับ')))); }
  ];

  /* ---------------- the course ---------------- */
  var STEPS = [
    { i:'building', t:B('What is a stock?', 'หุ้นคืออะไร'), lead:B('A stock is a small piece of a real company. Buy it and you own a slice of that business.', 'หุ้นคือชิ้นส่วนเล็กๆ ของบริษัทจริง ซื้อหุ้น = เป็นเจ้าของบริษัทนั้นส่วนหนึ่ง'),
      p:[['coin', B('You can earn in two ways: the price rises (you sell higher than you bought), and dividends (the company shares its profit with owners).', 'ได้เงิน 2 ทาง: ราคาขึ้น (ขายได้แพงกว่าที่ซื้อ) และปันผล (บริษัทแบ่งกำไรให้ผู้ถือหุ้น)')],
         ['trend', B('Over time a price follows the company\'s profits; day to day it follows what people expect.', 'ระยะยาวราคาหุ้นวิ่งตามกำไรของบริษัท ส่วนรายวันวิ่งตามความคาดหวังของคน')],
         ['alert', B('It can also fall. If the business does badly the price can drop a lot — that is the risk you take for the chance of a gain.', 'ราคาลงได้ด้วย ถ้าธุรกิจแย่ราคาอาจลงมาก นี่คือความเสี่ยงที่แลกกับโอกาสได้กำไร')]],
      key:B('Buy businesses, not tickers: ask “would I want to own this company?”', 'ซื้อธุรกิจ ไม่ใช่ซื้อชื่อย่อ ถามตัวเองว่า “อยากเป็นเจ้าของบริษัทนี้ไหม”'), tour:'learn' },
    { i:'shield', t:B('Get your money ready first', 'เตรียมเงินให้พร้อมก่อน'), lead:B('Invest only money you will not need soon, after a safety cushion is in place.', 'ลงทุนด้วยเงินที่ไม่ต้องใช้เร็วๆ นี้ และหลังจากมีเงินสำรองแล้ว'),
      p:[['shield', B('Keep 3–6 months of living costs as an emergency fund in a savings account first.', 'มีเงินสำรองฉุกเฉิน 3–6 เดือนของค่าใช้จ่ายไว้ในบัญชีออมทรัพย์ก่อน')],
         ['alert', B('Pay off high-interest debt (credit cards, cash loans) before investing — its interest is higher than what stocks usually earn.', 'ปิดหนี้ดอกเบี้ยสูง (บัตรเครดิต สินเชื่อเงินสด) ก่อน เพราะดอกเบี้ยแพงกว่าที่หุ้นมักให้')],
         ['clock', B('Use “cold money” you can leave for 3–5 years or more.', 'ใช้ “เงินเย็น” ที่วางไว้ได้ 3–5 ปีขึ้นไป')],
         ['coin', B('You can start small — some apps let you buy US stocks from 50 baht.', 'เริ่มน้อยๆ ได้ บางแอปซื้อหุ้นสหรัฐฯ ได้ตั้งแต่ 50 บาท')]],
      key:B('Emergency fund → no expensive debt → then invest.', 'เงินสำรองฉุกเฉิน → ไม่มีหนี้ดอกแพง → แล้วค่อยลงทุน'), tour:null },
    { i:'wave', t:B('Know the risk — and use time', 'รู้จักความเสี่ยง และใช้เวลาช่วย'), lead:B('Prices swing. Time and spreading out are your two best protections.', 'ราคาหุ้นแกว่งเป็นปกติ เวลาและการกระจายคือเกราะที่ดีที่สุด'),
      p:[['wave', B('Falls of 20–30% in a bad year are normal for stocks. Expect them before they happen.', 'หุ้นลง 20–30% ในปีที่แย่ถือเป็นเรื่องปกติ ให้รู้ไว้ก่อนจะเจอ')],
         ['clock', B('The longer you hold a spread of good companies, the more the swings tend to even out.', 'ยิ่งถือหุ้นดีหลายตัวได้นาน การแกว่งมักเฉลี่ยกันจนเห็นทิศชัดขึ้น')],
         ['layers', B('Never put everything in one stock: hold several companies from different sectors.', 'อย่าใส่เงินทั้งหมดในหุ้นตัวเดียว ถือหลายบริษัท หลายกลุ่มอุตสาหกรรม')],
         ['alert', B('Do not borrow to buy stocks while you are learning.', 'ช่วงที่ยังเรียนรู้ อย่ากู้เงินมาซื้อหุ้น')]],
      key:B('Spread out + be patient = the beginner\'s edge.', 'กระจาย + อดทน = ข้อได้เปรียบของมือใหม่'), tour:null },
    { i:'phone', t:B('Choose an app and open an account', 'เลือกแอปและเปิดบัญชี'), lead:B('To buy stocks you need a trading account with a broker. Most can be opened online in a day or two.', 'จะซื้อหุ้นได้ต้องมีบัญชีซื้อขายกับโบรกเกอร์ ส่วนใหญ่เปิดออนไลน์ได้ภายใน 1–2 วัน'),
      p:[['phone', B('Examples: Dime! (US stocks as fractional shares from 50 baht, and Thai stocks), or a broker account used with the Streaming app for Thai stocks.', 'ตัวอย่างแอป: Dime! (หุ้นสหรัฐฯ แบบเศษหุ้นเริ่ม 50 บาท และหุ้นไทย) หรือเปิดบัญชีกับโบรกเกอร์แล้วใช้แอป Streaming ซื้อขายหุ้นไทย')],
         ['id', B('Have your ID card and a phone ready; identity is checked online (for example through NDID or your bank app).', 'เตรียมบัตรประชาชนและมือถือ ยืนยันตัวตนออนไลน์ (เช่น ผ่าน NDID หรือแอปธนาคาร)')],
         ['list', B('You will answer a short risk questionnaire (suitability test) — answer honestly.', 'จะมีแบบประเมินความเสี่ยงสั้นๆ (Suitability) ให้ตอบตามจริง')],
         ['bank', B('Link a bank account to move money in and out. Compare fees before choosing.', 'ผูกบัญชีธนาคารไว้โอนเงินเข้าออก และเทียบค่าธรรมเนียมก่อนเลือกแอป')]],
      key:B('One account to start is enough. Pick the app whose fees and markets fit you.', 'เริ่มจากบัญชีเดียวก็พอ เลือกแอปที่ค่าธรรมเนียมและตลาดที่ซื้อได้ตรงกับเรา'), tour:'apps' },
    { i:'search', t:B('Pick stocks the simple way', 'เลือกหุ้นแบบมือใหม่'), lead:B('Start from what the market is doing, then check each company with a short checklist.', 'เริ่มจากดูภาพตลาด แล้วเช็กบริษัททีละตัวด้วยเช็กลิสต์สั้นๆ'),
      p:[['eye', B('Look at the big picture first: “What to do now” tells you whether the market is calm or stormy.', 'ดูภาพใหญ่ก่อน: หน้า “ตอนนี้ควรทำอะไร” บอกว่าตลาดตอนนี้สงบหรือมีพายุ')],
         ['check', B('A simple checklist: a business you understand, profits that grow, debt that is not high, a price not far above its peers, and a price above its 200-day line.', 'เช็กลิสต์ง่ายๆ: ธุรกิจที่เข้าใจได้ กำไรโต หนี้ไม่สูง ราคาไม่แพงกว่าเพื่อนมาก และราคาอยู่เหนือเส้น 200 วัน')],
         ['search', B('Use “Stock Directory & Compare” and “One Stock, One Page” on this site to check those numbers.', 'ใช้หน้า “หุ้นตัวอย่างและเปรียบเทียบ” และ “ดูหุ้นรายตัว” ในเว็บนี้เช็กตัวเลขเหล่านี้')],
         ['star', B('Make a short list of 5–10 names and keep it in your Watchlist.', 'จดรายชื่อสั้นๆ 5–10 ตัว แล้วเก็บไว้ในวอทช์ลิสต์')]],
      key:B('Big picture → checklist → short list. No tips, no rumours.', 'ภาพใหญ่ → เช็กลิสต์ → รายชื่อสั้น ไม่ซื้อตามข่าวลือ'), tour:'pick' },
    { i:'pie', t:B('Split the money and add monthly', 'แบ่งเงิน และลงทุนทุกเดือน'), lead:B('Decide how much goes into each holding before you buy, then add a fixed amount every month.', 'กำหนดก่อนซื้อว่าจะใส่เงินแต่ละตัวเท่าไร แล้วลงเงินเท่าๆ กันทุกเดือน'),
      p:[['pie', B('Hold about 5–15 stocks; no single stock above 10–15% of the money, no sector above 30%.', 'ถือราว 5–15 ตัว หุ้นตัวเดียวไม่เกิน 10–15% ของเงิน และกลุ่มเดียวไม่เกิน 30%')],
         ['layers', B('A broad index fund or ETF is a good steady core; individual stocks go around it.', 'กองทุนดัชนีหรือ ETF เป็นแกนพอร์ตที่นิ่ง แล้วค่อยมีหุ้นรายตัวรอบๆ')],
         ['cal', B('Monthly investing (DCA): the same amount on the same day each month — no need to guess the perfect moment.', 'ลงทุนรายเดือน (DCA): ลงเงินเท่ากันวันเดิมทุกเดือน ไม่ต้องเดาจังหวะ')],
         ['coin', B('Put new money into the holdings that are below their target % first, instead of selling the others.', 'เงินใหม่ให้เติมตัวที่ต่ำกว่า % เป้าหมายก่อน แทนการขายตัวอื่น')]],
      key:B('Plan the % first, then let the monthly habit do the work.', 'วางสัดส่วนก่อน แล้วให้วินัยรายเดือนทำงานแทน'), tour:null },
    { i:'tap', t:B('Place your first order', 'ส่งคำสั่งซื้อครั้งแรก'), lead:B('Every app follows the same four moves: find the ticker, enter the amount, choose the order type, confirm.', 'ทุกแอปทำเหมือนกัน 4 อย่าง: ค้นชื่อย่อ ใส่จำนวน เลือกประเภทคำสั่ง แล้วยืนยัน'),
      p:[['search', B('Search the ticker (e.g. PTT, NVDA) and check the full company name matches.', 'ค้นชื่อย่อหุ้น (เช่น PTT, NVDA) แล้วเช็กชื่อบริษัทเต็มให้ตรง')],
         ['list', B('Thai stocks trade in lots of 100 shares; fewer than 100 goes on the odd-lot board. US stocks in apps like Dime! can be bought by amount (fractional shares).', 'หุ้นไทยซื้อขาย lot ละ 100 หุ้น น้อยกว่านั้นซื้อในกระดานหุ้นเศษ ส่วนหุ้นสหรัฐฯ ในแอปอย่าง Dime! ใส่เป็นจำนวนเงินได้ (เศษหุ้น)')],
         ['flag', B('Limit order = you set the price (safer for beginners). Market order = buy right now at the going price.', 'คำสั่ง Limit = ตั้งราคาเอง (ปลอดภัยกว่าสำหรับมือใหม่) คำสั่ง Market = ซื้อทันทีที่ราคาตลาด')],
         ['check', B('Read the summary (price, amount, fee) before you confirm. Start with a small first order.', 'อ่านสรุป (ราคา จำนวน ค่าธรรมเนียม) ก่อนกดยืนยัน ครั้งแรกให้ซื้อน้อยๆ ก่อน')]],
      key:B('Small first order + limit price = a calm first trade.', 'ซื้อครั้งแรกน้อยๆ + ตั้งราคาแบบ Limit = เริ่มแบบใจเย็น'), tour:null },
    { i:'cal', t:B('Check it — but not every day', 'ติดตามผล แต่ไม่ต้องดูทุกวัน'), lead:B('Once a month is enough: is each company still the reason you bought it?', 'เดือนละครั้งก็พอ ถามตัวเองว่าเหตุผลที่ซื้อแต่ละตัวยังอยู่ไหม'),
      p:[['cal', B('Pick a review day each month; look at results, news and your % split.', 'กำหนดวันทบทวนเดือนละครั้ง ดูผลประกอบการ ข่าว และสัดส่วนพอร์ต')],
         ['alert', B('Sell when the reason changes (profits shrinking, debt jumping, the up-trend broken) — not because of one scary day.', 'ขายเมื่อเหตุผลเปลี่ยน (กำไรลด หนี้พุ่ง ขาขึ้นเสีย) ไม่ใช่เพราะตกใจวันเดียว')],
         ['book', B('Write down why you bought each stock; it keeps you honest later.', 'จดเหตุผลที่ซื้อแต่ละตัวไว้ จะช่วยให้ตัดสินใจได้ตรงไปตรงมาภายหลัง')],
         ['star', B('Keep learning: the lessons below go deeper into each topic.', 'เรียนต่อเรื่อยๆ: บทเรียนด้านล่างลงลึกทีละหัวข้อ')]],
      key:B('Monthly check, written reasons, calm decisions.', 'ทบทวนรายเดือน จดเหตุผล ตัดสินใจอย่างใจเย็น'), tour:'track' }
  ];
  var U = {
    eb:B('Start from zero', 'เริ่มจากศูนย์'),
    h:B('8 steps from knowing nothing to your first stock', '8 ขั้น จากไม่รู้อะไรเลย สู่หุ้นตัวแรก'),
    lede:B('One step at a time, in the order that works. Each step has a picture, the few things that matter, and a “show me on the site” tour that points at the real buttons.', 'เรียนทีละขั้นตามลำดับที่ใช้ได้จริง แต่ละขั้นมีภาพอธิบาย สิ่งสำคัญไม่กี่ข้อ และปุ่ม “พาดูในเว็บ” ที่ชี้ปุ่มจริงให้ดู'),
    start:B('Start step 1', 'เริ่มขั้นที่ 1'), cont:B('Continue: step ', 'เรียนต่อขั้นที่ '), again:B('Review from step 1', 'ทบทวนตั้งแต่ขั้นที่ 1'),
    tour:B('Tour the site for beginners', 'พาทัวร์เว็บสำหรับมือใหม่'), done:B('done', 'เรียนแล้ว'), step:B('Step ', 'ขั้นที่ '),
    key:B('Remember', 'จำง่ายๆ'), next:B('Got it — next step', 'เข้าใจแล้ว ไปขั้นต่อไป'), finish:B('Finish the course', 'จบคอร์ส'), back:B('Back', 'ย้อนกลับ'),
    show:B('Show me on the site', 'พาดูในเว็บ'), fin:B('All 8 steps done. You know the whole path — now take it slowly, one small order at a time.', 'เรียนครบ 8 ขั้นแล้ว รู้เส้นทางทั้งหมดแล้ว ต่อจากนี้ค่อยๆ ทำ เริ่มจากคำสั่งเล็กๆ ทีละครั้ง'),
    lessons:B('Lessons by topic (below)', 'บทเรียนแยกหัวข้อ (ด้านล่าง)'), note:B('For learning only — not investment advice. App features and fees change; check the app itself before you open an account.', 'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน ฟีเจอร์และค่าธรรมเนียมของแอปเปลี่ยนได้ เช็กกับแอปอีกครั้งก่อนเปิดบัญชี')
  };
  var ST = { done:{}, cur:0, open:false };
  try { var s0 = JSON.parse(localStorage.getItem('spz.sks') || 'null'); if(s0){ ST.done = s0.done || {}; ST.cur = s0.cur || 0; } } catch(e){}
  function save(){ try { localStorage.setItem('spz.sks', JSON.stringify({ done:ST.done, cur:ST.cur })); } catch(e){} }
  function nDone(){ return STEPS.filter(function(_, i){ return ST.done[i]; }).length; }

  function heroHTML(){
    var n = nDone(), pct = Math.round(n / STEPS.length * 100), all = n === STEPS.length, first = STEPS.findIndex ? STEPS.findIndex(function(_, i){ return !ST.done[i]; }) : 0;
    var btnT = all ? T(U.again) : n ? T(U.cont) + (first + 1) : T(U.start);
    return '<div class="sks-hero"><div class="sks-hart">' + heroArt() + '</div><div class="sks-ht"><span class="sks-eb">' + ico('compass') + esc(T(U.eb)) + '</span><h3>' + esc(T(U.h)) + '</h3><p>' + esc(T(U.lede)) + '</p>' +
      '<div class="sks-prog"><i style="width:' + pct + '%"></i></div><small class="sks-pn">' + esc(T(U.done)) + ' ' + n + '/' + STEPS.length + '</small>' +
      '<div class="sks-hb"><button type="button" class="sks-btn pri" data-sk-open="' + (all ? 0 : Math.max(0, first)) + '">' + ico('play') + esc(btnT) + '</button><button type="button" class="sks-btn" data-sk-tour="main">' + ico('eye') + esc(T(U.tour)) + '</button></div></div></div>';
  }
  function heroArt(){
    return '<svg class="sk-art sk-hart-svg" viewBox="0 0 220 150" aria-hidden="true"><defs><linearGradient id="skHg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".45"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="M10 120 L40 104 L62 110 L88 82 L112 90 L140 58 L164 66 L200 28 L200 140 L10 140 Z" fill="url(#skHg)" class="area"/>' +
      '<path d="M10 120 L40 104 L62 110 L88 82 L112 90 L140 58 L164 66 L200 28" class="draw"/>' +
      [[40, 104], [88, 82], [140, 58], [200, 28]].map(function(p, i){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" class="mk" style="animation-delay:' + (0.5 + i * 0.45) + 's"/><text x="' + (i === 3 ? p[0] - 14 : p[0]) + '" y="' + (i === 3 ? p[1] + 4 : p[1] - 10) + '" class="num" text-anchor="middle" style="animation-delay:' + (0.5 + i * 0.45) + 's">' + (i * 2 + 2) + '</text>'; }).join('') +
      '<g class="flagup"><path d="M200 28 V6" class="st"/><path d="M200 6 h18 l-5 6 l5 6 h-18" class="flagf"/></g></svg>';
  }
  function railHTML(){
    return '<div class="sks-rail">' + STEPS.map(function(s, i){ var c = (ST.done[i] ? ' done' : '') + (ST.open && ST.cur === i ? ' on' : ''); return '<button type="button" class="sks-node' + c + '" data-sk-open="' + i + '"><i>' + ico(s.i) + '<u>' + (ST.done[i] ? ico('check') : i + 1) + '</u></i><span>' + esc(T(s.t)) + '</span></button>'; }).join('') + '</div>';
  }
  function panelHTML(){
    if(!ST.open) return '';
    var i = ST.cur, s = STEPS[i], last = i === STEPS.length - 1;
    return '<div class="sks-panel" data-sk-anim><div class="sks-pa">' + ART[i]() + '</div><div class="sks-pt"><span class="sks-ps">' + esc(T(U.step)) + (i + 1) + ' / ' + STEPS.length + '</span><h4>' + ico(s.i) + esc(T(s.t)) + '</h4><p class="sks-lead">' + esc(T(s.lead)) + '</p>' +
      '<ul class="sks-pts">' + s.p.map(function(p, k){ return '<li style="animation-delay:' + (0.1 + k * 0.12) + 's"><i>' + ico(p[0]) + '</i><span>' + esc(T(p[1])) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="sks-key">' + ico('star') + '<div><b>' + esc(T(U.key)) + '</b><span>' + esc(T(s.key)) + '</span></div></div>' +
      '<div class="sks-pb">' + (i > 0 ? '<button type="button" class="sks-btn" data-sk-open="' + (i - 1) + '">' + ico('arrowL') + esc(T(U.back)) + '</button>' : '') +
      (s.tour ? '<button type="button" class="sks-btn" data-sk-tour="' + s.tour + '">' + ico('eye') + esc(T(U.show)) + '</button>' : '') +
      '<button type="button" class="sks-btn pri" data-sk-next="' + i + '">' + esc(T(last ? U.finish : U.next)) + ico(last ? 'check' : 'arrowR') + '</button></div>' +
      (last && nDone() === STEPS.length ? '<p class="sks-fin">' + ico('check') + esc(T(U.fin)) + '</p>' : '') + '</div></div>';
  }
  var root = null;
  function paint(){
    if(!root) return;
    root.innerHTML = heroHTML() + railHTML() + panelHTML() + '<p class="sks-note">' + esc(T(U.note)) + '</p><h5 class="sks-lessons">' + ico('book') + esc(T(U.lessons)) + '</h5>';
  }
  function wire(){
    root.addEventListener('click', function(ev){
      var o = ev.target.closest('[data-sk-open]'), nx = ev.target.closest('[data-sk-next]'), tr = ev.target.closest('[data-sk-tour]');
      if(o){ ST.cur = +o.getAttribute('data-sk-open'); ST.open = true; save(); paint(); scrollPanel(); return; }
      if(nx){ var i = +nx.getAttribute('data-sk-next'); ST.done[i] = true; if(i < STEPS.length - 1){ ST.cur = i + 1; } save(); paint(); scrollPanel(); return; }
      if(tr){ ev.stopPropagation(); TOUR.start(tr.getAttribute('data-sk-tour')); }
    });
  }
  function scrollPanel(){
    var p = root.querySelector('.sks-panel'); if(!p) return;
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
