/* =====================================================================
   SPACEZ ADMIN BOARD (2026-11-17) — admin only, a first rough version
   User request: add an "executive board" (บอร์ดบริหาร) page that only the
   admin can open, listed in the menu's special section. Kept simple for now:
   * Route #/board (ADMIN_ONLY_ROUTES in part-46, NAV_HIDDEN in part-15, a
     featured card in the menu's "Executive suite" block).
   * Tab 1 (2026-11-17 b): organisation chart — shareholders → board → CEO →
     departments, names editable (localStorage 'spz.board.org').
   * Tab 2: site at a glance, data freshness (Last-Modified of data/*.json),
     admin shortcuts, a to-do list (localStorage 'spz.board.todo').
   Every paint re-checks __SPZ_TIER() === 'full'; others see a lock card.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_BOARD) return;
  window.__SPZ_BOARD = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] != null ? o[L()] : o.en); }
  function B(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function isAdmin(){ try { return window.__SPZ_TIER && window.__SPZ_TIER() === 'full'; } catch(e){ return false; } }
  function lsGet(k, d){ try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } }
  function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  var IC = {
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    check:'<path d="M4 12l5 5L20 6"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    shield:'<path d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6z"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    chev:'<path d="M6 9l6 6 6-6"/>',
    users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2 .7 3.5 2.8 3.5 6"/>',
    book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5"/>',
    print:'<path d="M6.5 9V3.5h11V9"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M6.5 14h11v6.5h-11z"/>',
    trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'
  };
  function ico(k){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }
  var DATA = [
    ['data/market_lite.json', B('Market snapshot', 'ข้อมูลตลาด'), 60],
    ['data/econ.json', B('Economic calendar', 'ปฏิทินเศรษฐกิจ'), 24 * 60],
    ['data/brain.json', B('Market Brain · macro', 'สมองตลาด · เศรษฐกิจ'), 16 * 60],
    ['data/brain_ext.json', B('Market Brain · forecasts', 'สมองตลาด · พยากรณ์'), 16 * 60],
    ['data/backtest.json', B('Signal backtest', 'ทดสอบย้อนหลังสัญญาณ'), 30 * 60],
    ['data/bubble.json', B('Bubble Radar', 'เรดาร์ฟองสบู่'), 30 * 60]
  ];
  var LINKS = [
    ['printall', B('Print the whole site', 'พิมพ์ทั้งเว็บ')], ['printreport', B('Print report', 'พิมพ์รายงาน')],
    ['brain', B('Market Brain', 'สมองตลาด')], ['exams', B('Exam room', 'ห้องสอบ')],
    ['connectedusers', B('Connected users', 'ผู้ใช้ที่เชื่อมต่อ')], ['quietValue', B('Quiet Value', 'Quiet Value')],
    ['earlysignal', B('Early signal', 'สัญญาณล่วงหน้า')], ['stockclass', B('Stock Classroom', 'ห้องเรียนหุ้น')]
  ];
  var fresh = {}, sec = null;
  function ago(ms){
    var m = Math.round(ms / 60000);
    if(m < 60) return T(B(m + ' min ago', m + ' นาทีที่แล้ว'));
    var h = Math.round(m / 60); if(h < 48) return T(B(h + ' h ago', h + ' ชม. ที่แล้ว'));
    return T(B(Math.round(h / 24) + ' days ago', Math.round(h / 24) + ' วันที่แล้ว'));
  }
  function loadFresh(){
    DATA.forEach(function(d){
      fetch(d[0] + '?h=' + Date.now(), { method:'HEAD', cache:'no-store' }).then(function(r){
        var lm = r.headers.get('last-modified'); fresh[d[0]] = r.ok && lm ? new Date(lm).getTime() : (r.ok ? -1 : -2); paint();
      }).catch(function(){ fresh[d[0]] = -2; paint(); });
    });
  }
  function stats(){
    var pages = 0, stocks = 0, lessons = 0;
    try { pages = (window.__spzRouteList ? window.__spzRouteList() : []).length; } catch(e){}
    try { var S = window.__SPZ_STOCK || window.__SPZ_LIVE; var list = S && (S.stocks || (S.data && S.data.stocks)); stocks = list ? (Array.isArray(list) ? list.length : Object.keys(list).length) : 0; } catch(e){}
    try { var C = window.__SPZ_CLASSROOM_PRINT; if(C) C.rooms().forEach(function(r){ lessons += r.ids.length; }); } catch(e){}
    return [[B('Menu pages', 'หน้าในเมนู'), pages || '–'], [B('Stocks tracked', 'หุ้นที่ติดตาม'), stocks || '550+'], [B('Classroom lessons', 'บทเรียนในห้องเรียน'), lessons || '–'], [B('Course chapters', 'บทในคอร์สมือใหม่'), 7]];
  }
  /* 2026-11-17 (b) (user request): the board is first of all an ORGANISATION CHART — shareholders → board of directors →
     CEO → the people in charge of each area. A skeleton for now; names are editable (admin, this browser only,
     localStorage 'spz.board.org'). The site tools moved to the second tab. */
  var ORG = [
    { k:'sh', lv:0, t:B('Shareholders', 'ผู้ถือหุ้น'), d:B('Own the company and appoint the board', 'เจ้าของกิจการ แต่งตั้งคณะกรรมการ'), n:'Noraset Boikaw · 100%', tone:'gold' },
    { k:'chair', lv:1, t:B('Chairman of the board', 'ประธานกรรมการ'), d:B('Leads the board, sets direction', 'นำคณะกรรมการ กำหนดทิศทาง'), n:'', tone:'violet' },
    { k:'dir', lv:1, t:B('Director', 'กรรมการ'), d:B('Oversees strategy and risk', 'กำกับกลยุทธ์และความเสี่ยง'), n:'', tone:'violet' },
    { k:'ind', lv:1, t:B('Independent director', 'กรรมการอิสระ'), d:B('Checks and balances, ethics', 'ถ่วงดุล ดูแลจริยธรรม'), n:'', tone:'violet' },
    { k:'ceo', lv:2, t:B('Founder & CEO', 'ผู้ก่อตั้ง · ประธานเจ้าหน้าที่บริหาร (CEO)'), d:B('Runs the company day to day', 'บริหารงานทั้งหมดในแต่ละวัน'), n:'Noraset Boikaw "Focus"', tone:'cyan' },
    { k:'cto', lv:3, t:B('CTO · Technology', 'CTO · เทคโนโลยี'), d:B('Website, data pipeline, security', 'เว็บไซต์ ระบบข้อมูล ความปลอดภัย'), n:'', tone:'blue' },
    { k:'cio', lv:3, t:B('Head of Research', 'หัวหน้าฝ่ายวิจัย · นักวิเคราะห์'), d:B('Market Brain, Elliott Wave analysis', 'สมองตลาด บทวิเคราะห์ Elliott Wave'), n:'', tone:'blue' },
    { k:'edu', lv:3, t:B('Head of Education', 'หัวหน้าฝ่ายการศึกษา'), d:B('Courses, classrooms, exams', 'คอร์ส ห้องเรียน ข้อสอบ'), n:'', tone:'blue' },
    { k:'cmo', lv:3, t:B('CMO · Marketing', 'CMO · การตลาดและชุมชน'), d:B('Social media, members, partners', 'โซเชียล สมาชิก พันธมิตร'), n:'', tone:'blue' },
    { k:'cfo', lv:3, t:B('CFO · Finance', 'CFO · การเงินและบัญชี'), d:B('Budget, memberships, accounts', 'งบประมาณ ค่าสมาชิก บัญชี'), n:'', tone:'blue' },
    { k:'cco', lv:3, t:B('Compliance', 'กำกับดูแลและกฎหมาย'), d:B('Rules, disclaimers, data privacy', 'กฎระเบียบ คำเตือน ข้อมูลส่วนบุคคล'), n:'', tone:'blue' }
  ];
  var LV = [B('Owners', 'เจ้าของ'), B('Board of directors', 'คณะกรรมการบริษัท'), B('Management', 'ผู้บริหารสูงสุด'), B('Departments', 'ฝ่ายงาน')];
  /* 2026-11-17 (d): how many people each seat needs, the sub-teams under each department, board committees */
  var CNT = { chair:B('1 person', '1 คน'), dir:B('1–2 people', '1–2 คน'), ind:B('1–2 people', '1–2 คน'), ceo:B('1 person', '1 คน') };
  var SUBS = {
    cto:[B('Web & app engineering', 'วิศวกรรมเว็บและแอป'), B('Data & automation', 'ระบบข้อมูลและงานอัตโนมัติ'), B('Cyber security', 'ความปลอดภัยไซเบอร์'), B('Servers & uptime', 'ดูแลระบบและเซิร์ฟเวอร์')],
    cio:[B('Elliott Wave analysis', 'วิเคราะห์ Elliott Wave'), B('Market Brain models', 'โมเดลสมองตลาด / พยากรณ์'), B('Macro research', 'วิจัยเศรษฐกิจมหภาค'), B('Stock screening', 'คัดกรองหุ้น')],
    edu:[B('Course design', 'ออกแบบหลักสูตร'), B('Stock & EW classrooms', 'ห้องเรียนหุ้นและ Elliott Wave'), B('CEWA · IC exam bank', 'คลังข้อสอบ CEWA · IC'), B('Teaching media', 'สื่อการสอน')],
    cmo:[B('Social & content', 'โซเชียลมีเดียและคอนเทนต์'), B('Member community', 'ชุมชนสมาชิก'), B('Partners & schools', 'พันธมิตรและสถาบัน'), B('Brand', 'แบรนด์')],
    cfo:[B('Accounting', 'บัญชี'), B('Budget', 'งบประมาณ'), B('Memberships & payments', 'ค่าสมาชิกและการชำระเงิน'), B('Tax', 'ภาษี')],
    cco:[B('Contracts & legal', 'สัญญาและกฎหมาย'), B('Securities rules (SEC)', 'กฎของ ก.ล.ต.'), B('Personal data (PDPA)', 'ข้อมูลส่วนบุคคล (PDPA)'), B('Risk', 'บริหารความเสี่ยง')]
  };
  var COMMIT = [B('Audit committee', 'คณะกรรมการตรวจสอบ'), B('Nomination & pay committee', 'คณะกรรมการสรรหาและค่าตอบแทน'), B('Risk committee', 'คณะกรรมการบริหารความเสี่ยง')];
  var openNode = null;
  function secOpen(){ return lsGet('spz.board.open', { org:1, ctrl:1, dil:0, scen:0, case:0, rule:0 }) || {}; }
  function secHTML(key, num, icon, t, d, body){
    var o = secOpen()[key];
    return '<div class="bd-s' + (o ? ' open' : '') + '" data-bd-sec="' + key + '"><button type="button" class="bd-sh" data-bd-fold="' + key + '" aria-expanded="' + (o ? 'true' : 'false') + '">' +
      '<span class="bd-sn">' + num + '</span><span class="bd-si">' + ico(icon) + '</span><span class="bd-st"><b>' + esc(T(t)) + '</b><small>' + esc(T(d)) + '</small></span><span class="bd-sc">' + ico('chev') + '</span></button>' +
      (o ? '<div class="bd-sb">' + body + '</div>' : '') + '</div>';
  }
  /* dilution: what several funding rounds do to the founder's shares and votes */
  var ROUNDS = [[B('Start', 'เริ่มต้น'), 0], [B('Seed round', 'รอบ Seed'), 15], [B('Series A', 'รอบ Series A'), 20], [B('Series B', 'รอบ Series B'), 15], [B('Listing (IPO)', 'เข้าตลาดหุ้น (IPO)'), 20]];
  function dilHTML(){
    var c = ctrl(), md = MODES.filter(function(x){ return x.k === c.m; })[0], f = c.f, rows = [];
    ROUNDS.forEach(function(r, i){
      if(i) f = f * (1 - r[1] / 100);
      var inv = 100 - f, vt = f + inv * md.v, v = vt > 0 ? f / vt * 100 : 100;
      rows.push({ t:r[0], cut:r[1], f:f, v:v });
    });
    var W = 640, H = 220, x = function(i){ return 50 + i * (W - 90) / (rows.length - 1); }, y = function(p){ return 20 + (100 - p) / 100 * (H - 50); };
    var line = function(key){ return rows.map(function(r, i){ return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(r[key]).toFixed(1); }).join(' '); };
    var g = [75, 50, 25].map(function(p){ return '<line x1="50" x2="' + (W - 40) + '" y1="' + y(p) + '" y2="' + y(p) + '" class="th t' + p + '"/><text x="' + (W - 36) + '" y="' + (y(p) + 4) + '" class="tl">' + p + '%</text>'; }).join('');
    var dots = function(key, cls){ return rows.map(function(r, i){ return '<circle cx="' + x(i) + '" cy="' + y(r[key]) + '" r="4.5" class="' + cls + '"/><text x="' + x(i) + '" y="' + (y(r[key]) + (key === 'v' ? -10 : 18)) + '" text-anchor="middle" class="dv ' + cls + '">' + Math.round(r[key]) + '%</text>'; }).join(''); };
    var labs = rows.map(function(r, i){ return '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" class="xl">' + esc(T(r.t)) + '</text>'; }).join('');
    var last = rows[rows.length - 1];
    return '<p class="bd-lead">' + esc(T(B('Each funding round sells new shares, so your slice shrinks. With the share type chosen in "Founder control" (', 'ทุกครั้งที่ระดมทุน บริษัทออกหุ้นใหม่ให้นักลงทุน สัดส่วนของเราจึงลดลง ใช้ประเภทหุ้นที่เลือกไว้ในส่วน "อำนาจผู้ก่อตั้ง" ('))) + esc(T(md.t)) + esc(T(B('), this is how shares and votes move.', ') หุ้นและเสียงของเราจะเป็นแบบนี้'))) + '</p>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bd-dil">' + g + '<path d="' + line('f') + '" class="ln sh"/><path d="' + line('v') + '" class="ln vt"/>' + dots('f', 'sh') + dots('v', 'vt') + labs + '</svg>' +
      '<div class="bd-leg"><span class="sh">' + esc(T(B('Your shares', 'หุ้นของเรา'))) + '</span><span class="vt">' + esc(T(B('Your votes', 'เสียงของเรา'))) + '</span><span>' + esc(T(B('Dashed lines: 75% · 50% · 25% thresholds', 'เส้นประ: เกณฑ์ 75% · 50% · 25%'))) + '</span></div>' +
      '<div class="bd-note2">' + esc(T(B('After the listing you would hold ', 'หลังเข้าตลาด เราจะเหลือหุ้น '))) + '<b>' + fmtP(last.f) + '</b>' + esc(T(B(' of the shares and ', ' และเสียง '))) + '<b>' + fmtP(last.v) + '</b>. ' +
        esc(T(last.v > 50 ? B('You still decide alone.', 'ยังตัดสินใจเองได้') : last.v > 25 ? B('You can still block rule changes — keep your founder clauses.', 'ยังขวางการแก้ข้อบังคับได้ — ต้องรักษาข้อบังคับคุ้มครองผู้ก่อตั้งไว้') : B('Your power now rests only on the articles and agreements — or choose a share type with fewer investor votes.', 'อำนาจตอนนี้เหลือแค่ข้อบังคับและสัญญา — หรือเลือกให้หุ้นนักลงทุนมีเสียงน้อยลง'))) +
        ' ' + esc(T(B('Note: a public company (PLC) generally cannot keep multiple-vote shares, so listing usually ends the two-class setup.', 'หมายเหตุ: บริษัทมหาชนโดยหลักใช้หุ้นหลายเสียงไม่ได้ การเข้าตลาดจึงมักทำให้โครงสร้างหุ้น 2 ชั้นสิ้นสุดลง'))) + '</div>';
  }
  /* what could happen, and what protects the founder */
  var SCEN = [
    { k:'oust', ic:'x', t:B('The board wants a new CEO', 'บอร์ดอยากเปลี่ยน CEO'), no:B('Directors vote; with a simple majority they replace you — the Steve Jobs (1985) and Sam Altman (2023) story.', 'กรรมการโหวต ถ้าได้เสียงข้างมากก็เปลี่ยนเราได้ทันที — แบบที่เกิดกับ Steve Jobs (1985) และ Sam Altman (2023)'), yes:B('Founder names most of the board, and removing the founder as CEO or director needs the founder\'s written consent.', 'ผู้ก่อตั้งแต่งตั้งกรรมการส่วนใหญ่ และการถอดผู้ก่อตั้งจากตำแหน่ง CEO/กรรมการ ต้องได้หนังสือยินยอมจากผู้ก่อตั้ง') },
    { k:'big', ic:'grid', t:B('A big investor buys in', 'นักลงทุนรายใหญ่เข้ามา'), no:B('They ask for board seats and vetoes; each round your share and votes fall.', 'ขอที่นั่งในบอร์ดและสิทธิ์วีโต้ ทุกรอบหุ้นและเสียงของเราลดลง'), yes:B('Investors take preference shares (priority dividend, fewer votes); seats they get stay a minority.', 'ให้นักลงทุนถือหุ้นบุริมสิทธิ (ได้ปันผลก่อน เสียงน้อยกว่า) ที่นั่งในบอร์ดที่ให้ไปยังเป็นเสียงข้างน้อย') },
    { k:'rules', ic:'key', t:B('Someone tries to change the rules', 'มีคนพยายามแก้ข้อบังคับ'), no:B('With 3/4 of the votes they can rewrite the articles — and delete your protections.', 'ถ้ามีเสียง 3/4 ก็แก้ข้อบังคับได้ และลบสิทธิ์คุ้มครองของเราทิ้งได้'), yes:B('Keep more than 1/4 of the votes, and write that the founder clauses can only change with the founder\'s consent.', 'รักษาเสียงให้เกิน 1/4 และเขียนว่าข้อบังคับส่วนของผู้ก่อตั้ง แก้ได้ต่อเมื่อผู้ก่อตั้งยินยอม') },
    { k:'sell', ic:'arrow', t:B('Pressure to sell the company', 'ถูกกดดันให้ขายกิจการ'), no:B('A majority can approve a sale or merger you do not want.', 'เสียงข้างมากอนุมัติขายหรือควบรวมได้ แม้เราไม่อยากขาย'), yes:B('Selling the business, merging or issuing new shares are reserved matters that need the founder\'s yes.', 'ขายกิจการ ควบรวม และออกหุ้นใหม่ อยู่ในรายการเรื่องที่ต้องได้รับความเห็นชอบจากผู้ก่อตั้ง') },
    { k:'fight', ic:'shield', t:B('Partners fall out', 'หุ้นส่วนขัดแย้งกัน'), no:B('Deadlock — nobody can decide, the company stalls.', 'ทางตัน ไม่มีใครตัดสินใจได้ บริษัทหยุดเดิน'), yes:B('An odd-numbered board with a founder-appointed chair who has the casting vote, plus a buy-out clause in the shareholders\' agreement.', 'บอร์ดจำนวนคี่ ประธานที่ผู้ก่อตั้งแต่งตั้งมีเสียงชี้ขาด และมีข้อซื้อหุ้นคืนในสัญญาผู้ถือหุ้น') },
    { k:'ipo', ic:'layers', t:B('Going public (IPO)', 'นำบริษัทเข้าตลาดหลักทรัพย์'), no:B('Public companies follow one share, one vote; two-class control usually ends and outside directors join.', 'บริษัทมหาชนใช้หลักหนึ่งหุ้นหนึ่งเสียง โครงสร้างหุ้น 2 ชั้นมักสิ้นสุด และต้องมีกรรมการอิสระเพิ่ม'), yes:B('Keep enough shares before listing (ideally above 50%, at least above 25%), or keep control through a holding company you own.', 'ถือหุ้นให้มากพอก่อนเข้าตลาด (ดีที่สุดเกิน 50% อย่างน้อยเกิน 25%) หรือคุมผ่านบริษัทโฮลดิ้งที่เราเป็นเจ้าของ') }
  ];
  function scenHTML(){
    var cur = lsGet('spz.board.scen', 'oust'); if(!SCEN.some(function(x){ return x.k === cur; })) cur = 'oust';
    var S = SCEN.filter(function(x){ return x.k === cur; })[0];
    return '<div class="bd-scen"><div class="bd-sl2">' + SCEN.map(function(x, i){ return '<button type="button" data-bd-sc="' + x.k + '" class="' + (x.k === cur ? 'on' : '') + '"><u>' + (i + 1) + '</u>' + ico(x.ic) + '<span>' + esc(T(x.t)) + '</span></button>'; }).join('') + '</div>' +
      '<div class="bd-sd"><h4>' + esc(T(S.t)) + '</h4><div class="bd-vs"><div class="no"><em>' + ico('x') + esc(T(B('Without protection', 'ถ้าไม่ได้วางโครงสร้าง'))) + '</em><p>' + esc(T(S.no)) + '</p></div>' +
        '<div class="yes"><em>' + ico('shield') + esc(T(B('With the founder structure', 'ถ้าวางโครงสร้างผู้ก่อตั้งไว้'))) + '</em><p>' + esc(T(S.yes)) + '</p></div></div></div></div>';
  }
  var CASES = [
    { n:'Steve Jobs · Apple (1985)', r:'warn', t:B('Founder pushed out by his own board', 'ผู้ก่อตั้งถูกบอร์ดของตัวเองดันออก'), d:B('After a boardroom fight with the CEO he had hired, Jobs lost his operating role and left; he came back in 1997.', 'หลังขัดแย้งกับ CEO ที่ตัวเองจ้างมา บอร์ดเข้าข้าง CEO Jobs เสียบทบาทบริหารและลาออก ก่อนกลับมาในปี 1997') },
    { n:'Sam Altman · OpenAI (2023)', r:'warn', t:B('Fired by the board, back within days', 'ถูกบอร์ดปลด แล้วกลับมาในไม่กี่วัน'), d:B('The board removed him in November 2023; staff and investors pushed back and he returned about five days later. He held no shares — his power was people, not structure.', 'บอร์ดปลดเขาเดือนพฤศจิกายน 2023 พนักงานและนักลงทุนกดดันกลับ เขาได้ตำแหน่งคืนราว 5 วันต่อมา เขาไม่มีหุ้นเลย อำนาจมาจากคน ไม่ใช่โครงสร้าง') },
    { n:'Mark Zuckerberg · Meta', r:'ok', t:B('Small share, majority of votes', 'หุ้นน้อย แต่เสียงข้างมาก'), d:B('Class B shares carry 10 votes each; with roughly 13% of the shares he controls about 61% of the votes, so no board or investor can remove him.', 'หุ้น Class B ได้ 10 เสียงต่อหุ้น ถือหุ้นราว 13% แต่คุมเสียงราว 61% ไม่มีบอร์ดหรือนักลงทุนคนไหนถอดเขาได้') },
    { n:'Jensen Huang · NVIDIA', r:'mid', t:B('~3.8% of the shares, trusted by the board', 'ถือหุ้นราว 3.8% แต่บอร์ดเชื่อมั่น'), d:B('One share class, no special votes. He has led NVIDIA since founding it in 1993 because results and the board\'s trust keep him there — a position that is earned, not locked.', 'มีหุ้นชั้นเดียว ไม่มีเสียงพิเศษ เป็นผู้นำตั้งแต่ก่อตั้งปี 1993 เพราะผลงานและความเชื่อมั่นของบอร์ด ตำแหน่งนี้ได้มาจากผลงาน ไม่ได้ถูกล็อกด้วยโครงสร้าง') },
    { n:'Elon Musk · Tesla', r:'mid', t:B('Big influence, no special shares', 'อิทธิพลสูง แต่ไม่มีหุ้นพิเศษ'), d:B('Tesla has one share class. In 2018 he had to step down as chairman under a settlement with the US SEC (he stayed CEO), and he has said he wants about 25% of the votes to feel secure.', 'Tesla มีหุ้นชั้นเดียว ปี 2018 เขาต้องลงจากประธานบอร์ดตามข้อตกลงกับ ก.ล.ต. สหรัฐ (ยังเป็น CEO) และเคยบอกว่าอยากมีเสียงราว 25% จึงจะมั่นใจ') }
  ];
  function casesHTML(){
    return '<div class="bd-cases">' + CASES.map(function(c){ return '<div class="bd-case r-' + c.r + '"><span class="bd-cr">' + esc(T(c.r === 'ok' ? B('Locked control', 'คุมได้ด้วยโครงสร้าง') : c.r === 'warn' ? B('Lesson: removed', 'บทเรียน: ถูกปลด') : B('Control by trust', 'คุมด้วยความเชื่อมั่น'))) + '</span><b>' + esc(c.n) + '</b><h5>' + esc(T(c.t)) + '</h5><p>' + esc(T(c.d)) + '</p></div>'; }).join('') + '</div>' +
      '<p class="bd-lead sm">' + esc(T(B('The lesson: shares alone did not protect Jobs; votes written into the structure protect Zuckerberg. Figures are approximate (public filings, 2024–2025).', 'บทเรียน: หุ้นอย่างเดียวไม่ได้ปกป้อง Jobs แต่เสียงที่เขียนไว้ในโครงสร้างปกป้อง Zuckerberg ตัวเลขเป็นค่าประมาณจากเอกสารเปิดเผยข้อมูลปี 2024–2025'))) + '</p>';
  }
  var CLAUSES = [
    [B('Two classes of shares', 'หุ้น 2 ชั้น'), B('"The Company\'s shares are divided into ordinary shares and preference shares. Each preference share carries one vote for every ten shares and is entitled to its dividend before the ordinary shares."', '"หุ้นของบริษัทแบ่งเป็นหุ้นสามัญและหุ้นบุริมสิทธิ หุ้นบุริมสิทธิมีสิทธิออกเสียงหนึ่งเสียงต่อสิบหุ้น และได้รับเงินปันผลก่อนหุ้นสามัญ"')],
    [B('Founder appoints the majority', 'ผู้ก่อตั้งแต่งตั้งกรรมการเสียงข้างมาก'), B('"The Founder has the right to appoint more than half of the directors, including the Chairman, and to replace them at any time."', '"ผู้ก่อตั้งมีสิทธิแต่งตั้งกรรมการจำนวนเกินกึ่งหนึ่งของคณะกรรมการ รวมถึงประธานกรรมการ และเปลี่ยนตัวได้ทุกเวลา"')],
    [B('Founder cannot be removed without consent', 'ถอดผู้ก่อตั้งต้องได้ความยินยอม'), B('"A resolution to remove the Founder as a director or as Chief Executive Officer requires the Founder\'s written consent."', '"มติให้ผู้ก่อตั้งพ้นจากตำแหน่งกรรมการหรือประธานเจ้าหน้าที่บริหาร ต้องได้รับความยินยอมเป็นหนังสือจากผู้ก่อตั้ง"')],
    [B('Reserved matters', 'เรื่องที่ต้องผ่านผู้ก่อตั้ง'), B('"Issuing new shares, selling or merging the business, changing the CEO and borrowing above the set limit require the prior approval of the Founder."', '"การออกหุ้นใหม่ การขายหรือควบรวมกิจการ การเปลี่ยนประธานเจ้าหน้าที่บริหาร และการกู้ยืมเกินวงเงินที่กำหนด ต้องได้รับความเห็นชอบจากผู้ก่อตั้งก่อน"')],
    [B('The lock on the lock', 'กุญแจล็อกข้อบังคับ'), B('"The clauses on founder rights may only be amended with the Founder\'s written consent."', '"ข้อบังคับในหมวดสิทธิของผู้ก่อตั้ง จะแก้ไขได้ต่อเมื่อได้รับความยินยอมเป็นหนังสือจากผู้ก่อตั้งเท่านั้น"')],
    [B('Casting vote', 'เสียงชี้ขาด'), B('"If the votes of the board are equal, the Chairman has a casting vote."', '"ในกรณีที่คะแนนเสียงของกรรมการเท่ากัน ให้ประธานกรรมการออกเสียงเพิ่มอีกหนึ่งเสียงเป็นเสียงชี้ขาด"')]
  ];
  function rulesHTML(){
    return '<div class="bd-size"><div><b>' + esc(T(B('Board size', 'ขนาดคณะกรรมการ'))) + '</b><p>' + esc(T(B('A private company needs at least one director by law. A good start is 3 (founder + one person you appoint + one independent), growing to 5 — always an odd number so votes never tie, with the founder naming the majority.', 'บริษัทจำกัดตามกฎหมายมีกรรมการอย่างน้อย 1 คน เริ่มต้นที่ดีคือ 3 คน (ผู้ก่อตั้ง + คนที่ผู้ก่อตั้งแต่งตั้ง + กรรมการอิสระ) แล้วขยายเป็น 5 คน ใช้จำนวนคี่เสมอเพื่อไม่ให้เสียงเท่ากัน และให้ผู้ก่อตั้งแต่งตั้งเสียงข้างมาก'))) + '</p></div>' +
      '<div><b>' + esc(T(B('If it becomes a public company', 'ถ้าเป็นบริษัทมหาชน'))) + '</b><p>' + esc(T(B('At least 5 directors, and listed companies need independent directors (at least one third of the board) and an audit committee.', 'ต้องมีกรรมการอย่างน้อย 5 คน และบริษัทจดทะเบียนต้องมีกรรมการอิสระอย่างน้อย 1 ใน 3 ของคณะกรรมการ และมีคณะกรรมการตรวจสอบ'))) + '</p></div></div>' +
      '<p class="bd-lead">' + esc(T(B('Sample wording to discuss with a lawyer — it goes into the articles of association or the shareholders\' agreement:', 'ตัวอย่างข้อความไว้คุยกับทนายความ ใส่ในข้อบังคับบริษัทหรือสัญญาผู้ถือหุ้น:'))) + '</p>' +
      '<ol class="bd-clauses">' + CLAUSES.map(function(c){ return '<li><b>' + esc(T(c[0])) + '</b><q>' + esc(T(c[1])).replace(/^&quot;|&quot;$/g, '') + '</q></li>'; }).join('') + '</ol>';
  }
  var editing = false;
  function orgData(){ return lsGet('spz.board.org', {}) || {}; }
  function tab(){ return lsGet('spz.board.tab', 'org'); }
  function orgHTML(){
    var o = orgData(), out = '<div class="bd-org' + (editing ? ' edit' : '') + '">';
    for(var lv = 0; lv < 4; lv++){
      var row = ORG.filter(function(x){ return x.lv === lv; });
      if(lv === 0){
        var cc = ctrl(), vv = votesOf(cc);
        row = [{ k:'sh', lv:0, t:B('Founder · shareholder', 'ผู้ก่อตั้ง · ผู้ถือหุ้น'), d:B('Shares ' + fmtP(cc.f) + ' · votes ' + fmtP(vv) + ' · founder rights in the articles', 'หุ้น ' + fmtP(cc.f) + ' · เสียง ' + fmtP(vv) + ' · มีสิทธิ์ผู้ก่อตั้งในข้อบังคับ'), n:'Noraset Boikaw', tone:'gold', me:1 }];
        if(cc.f < 100) row.push({ k:'inv', lv:0, t:B('Other shareholders / investors', 'ผู้ถือหุ้นรายอื่น · นักลงทุน'), d:B('Shares ' + fmtP(100 - cc.f) + ' · votes ' + fmtP(100 - vv), 'หุ้น ' + fmtP(100 - cc.f) + ' · เสียง ' + fmtP(100 - vv)), n:'', tone:'violet' });
      }
      out += '<div class="bd-lvl lv' + lv + '"><div class="bd-lvh">' + esc(T(LV[lv])) + '</div><div class="bd-row n' + row.length + '"' + (row.length === 2 ? ' style="--c:2"' : '') + '>' +
        row.map(function(x){
          var name = o[x.k] != null ? o[x.k] : x.n;
          var me = x.me || x.k === 'ceo';
          var av = me && window.__SPZ_DEV_AVATAR && !(o[x.k]) ? '<span class="bd-av ph"><img src="' + window.__SPZ_DEV_AVATAR + '" alt=""></span>' : '<span class="bd-av">' + esc((name || '?').replace(/[^A-Za-zก-๙]/g, '').slice(0, 1).toUpperCase() || '?') + '</span>';
          return '<div class="bd-node t-' + x.tone + (me ? ' me' : '') + '" data-node="' + x.k + '">' + (x.me ? '<span class="bd-badge">' + ico('crown') + esc(T(B('Founder control', 'สิทธิ์ผู้ก่อตั้ง'))) + '</span>' : '') + av +
            '<div class="bd-nt"><b>' + esc(T(x.t)) + '</b>' +
            (editing ? '<input type="text" maxlength="60" data-org="' + x.k + '" value="' + esc(name) + '" placeholder="' + esc(T(B('Name', 'ชื่อ'))) + '">' : '<span class="bd-nm' + (name ? '' : ' vac') + '">' + esc(name || T(B('Vacant — to be appointed', 'ว่าง · รอแต่งตั้ง'))) + '</span>') +
            '<small>' + esc(T(x.d)) + '</small>' + (CNT[x.k] ? '<span class="bd-cnt">' + ico('users') + esc(T(CNT[x.k])) + '</span>' : '') +
            (SUBS[x.k] ? '<button type="button" class="bd-subt" data-bd-node="' + x.k + '">' + esc(T(B(SUBS[x.k].length + ' teams', SUBS[x.k].length + ' ทีมย่อย'))) + ' ' + ico('chev') + '</button>' : '') + '</div>' +
            (SUBS[x.k] && openNode === x.k ? '<ul class="bd-subs">' + SUBS[x.k].map(function(u){ return '<li>' + esc(T(u)) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
        }).join('') + '</div>' + (lv === 1 ? '<div class="bd-comm"><span>' + esc(T(B('Board committees', 'คณะกรรมการชุดย่อย'))) + '</span>' + COMMIT.map(function(c){ return '<em>' + esc(T(c)) + '</em>'; }).join('') + '</div>' : '') + '</div>';
    }
    return out + '</div>';
  }
  function dashHTML(){
    var todo = lsGet('spz.board.todo', []) || [];
    var now = Date.now();
    return '<div class="bd-kpis">' + stats().map(function(s){ return '<div class="bd-kpi"><span>' + esc(T(s[0])) + '</span><b>' + esc(s[1]) + '</b></div>'; }).join('') + '</div>' +
      '<div class="bd-grid">' +
        '<div class="bd-card"><h3>' + ico('db') + esc(T(B('Data freshness', 'ความสดของข้อมูล'))) + '</h3><ul class="bd-data">' +
          DATA.map(function(d){ var t = fresh[d[0]], st = 'wait', txt = T(B('checking…', 'กำลังเช็ก…'));
            if(t > 0){ var age = now - t; st = age < d[2] * 60000 * 1.5 ? 'ok' : 'old'; txt = ago(age); } else if(t === -1){ st = 'ok'; txt = T(B('online', 'ออนไลน์')); } else if(t === -2){ st = 'bad'; txt = T(B('not reachable', 'เข้าไม่ได้')); }
            return '<li class="' + st + '"><i></i><span>' + esc(T(d[1])) + '</span><em>' + esc(txt) + '</em></li>'; }).join('') +
        '</ul><p class="bd-note">' + esc(T(B('Green = updated on schedule, amber = later than usual. Times come from the web server (Last-Modified).', 'เขียว = อัปเดตตามรอบ เหลือง = ช้ากว่าปกติ เวลามาจากเซิร์ฟเวอร์เว็บ (Last-Modified)'))) + '</p></div>' +
        '<div class="bd-card"><h3>' + ico('bolt') + esc(T(B('Admin shortcuts', 'ทางลัดแอดมิน'))) + '</h3><div class="bd-links">' +
          LINKS.filter(function(l){ return document.querySelector('section[data-route="' + l[0] + '"]') || document.getElementById(l[0]); }).map(function(l){ return '<a href="#/' + l[0] + '" data-route-to="' + l[0] + '"><span>' + esc(T(l[1])) + '</span>' + ico('arrow') + '</a>'; }).join('') +
        '</div></div>' +
        '<div class="bd-card bd-todo"><h3>' + ico('check') + esc(T(B('To-do list', 'งานที่ต้องทำ'))) + '<small>' + esc(T(B('this browser only', 'เก็บไว้ในเบราว์เซอร์นี้'))) + '</small></h3>' +
          '<form class="bd-add" data-bd-add><input type="text" maxlength="140" placeholder="' + esc(T(B('Add a task…', 'เพิ่มงาน…'))) + '"><button type="submit" aria-label="add">' + ico('plus') + '</button></form>' +
          '<ul class="bd-list">' + (todo.length ? todo.map(function(t, i){ return '<li class="' + (t.d ? 'done' : '') + '"><button type="button" data-bd-tg="' + i + '" class="bd-ck">' + ico('check') + '</button><span>' + esc(t.t) + '</span><button type="button" data-bd-rm="' + i + '" class="bd-rm" aria-label="remove">' + ico('x') + '</button></li>'; }).join('') : '<li class="bd-empty">' + esc(T(B('Nothing yet — add the first task above.', 'ยังไม่มีงาน เพิ่มงานแรกได้ด้านบน'))) + '</li>') + '</ul></div>' +
      '</div>';
  }
  /* ------------------------------------------------------------------
     2026-11-17 (c) (user request): "I own it — if others buy shares, how do I keep full control, even at 5%?"
     A founder-control planner: pick how much of the company you own (100 / 75 / 51 / 50 / 25 / 5 % or any number)
     and how investors' shares vote, and see shares vs votes side by side, which decisions you can carry or block,
     and the tools that keep a founder in charge. General education about Thai private limited companies under the
     Civil and Commercial Code — not legal advice (checked 2026-11-17: ordinary resolution = majority of votes,
     special resolution = at least 3/4 of the votes of shareholders present, directors can be removed by the meeting
     at any time unless the articles / a shareholders' agreement add protection; preference shares may carry fewer
     votes if the articles say so).
     ------------------------------------------------------------------ */
  var MODES = [
    { k:'common', v:1, t:B('All ordinary shares (1 share = 1 vote)', 'หุ้นสามัญทั้งหมด (1 หุ้น = 1 เสียง)') },
    { k:'pref10', v:0.1, t:B('Investors get preference shares: 10 shares = 1 vote', 'นักลงทุนถือหุ้นบุริมสิทธิ: 10 หุ้น = 1 เสียง') },
    { k:'nonvote', v:0, t:B('Investors get non-voting preference shares', 'นักลงทุนถือหุ้นบุริมสิทธิไม่มีสิทธิออกเสียง') }
  ];
  function ctrl(){ var c = lsGet('spz.board.ctrl', null) || {}; var f = +c.f; if(!(f > 0 && f <= 100)) f = 100; var m = MODES.some(function(x){ return x.k === c.m; }) ? c.m : 'common'; return { f:f, m:m }; }
  function votesOf(c){ var md = MODES.filter(function(x){ return x.k === c.m; })[0], inv = 100 - c.f, tot = c.f + inv * md.v; return tot > 0 ? c.f / tot * 100 : 100; }
  function fmtP(x){ return (Math.round(x * 10) / 10).toLocaleString(L() === 'th' ? 'th-TH' : 'en-US') + '%'; }
  function ring(pct, cls, r){ var C = 2 * Math.PI * r, d = Math.max(0, Math.min(100, pct)) / 100 * C; return '<circle r="' + r + '" cx="60" cy="60" class="bg"/><circle r="' + r + '" cx="60" cy="60" class="' + cls + '" stroke-dasharray="' + d.toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 60 60)"/>'; }
  function ctrlHTML(){
    var c = ctrl(), v = votesOf(c), inv = 100 - c.f;
    var checks = [
      { ok:v > 50, t:B('Carry an ordinary resolution (more than 50% of votes)', 'ผ่านมติธรรมดาได้เอง (เสียงเกิน 50%)'), d:B('Appoint or remove directors, approve the accounts, pay dividends.', 'แต่งตั้ง/ถอดถอนกรรมการ อนุมัติงบการเงิน จ่ายปันผล') },
      { ok:v >= 75, t:B('Carry a special resolution (at least 3/4 of votes present)', 'ผ่านมติพิเศษได้เอง (เสียงอย่างน้อย 3/4)'), d:B('Change the articles, raise or cut capital, merge, close the company.', 'แก้ข้อบังคับ เพิ่ม/ลดทุน ควบรวม เลิกบริษัท') },
      { ok:v > 25, t:B('Block any special resolution (more than 1/4 of votes)', 'ขวางมติพิเศษได้ (เสียงเกิน 1/4)'), d:B('Nobody can rewrite the articles — or take away your protections — without you.', 'ไม่มีใครแก้ข้อบังคับ หรือลบสิทธิ์คุ้มครองของเราได้ถ้าเราไม่ยอม') },
      { ok:v > 50, t:B('Nobody can vote you off the board', 'ไม่มีใครโหวตถอดเราออกจากกรรมการได้'), d:B(v > 50 ? 'You hold the majority of votes yourself.' : 'Only if the articles / shareholders\' agreement require your consent to remove the founder (see the tools below).', v > 50 ? 'เพราะเราถือเสียงข้างมากเอง' : 'ทำได้ถ้าข้อบังคับ/สัญญาผู้ถือหุ้นเขียนว่า ถอดผู้ก่อตั้งต้องได้รับความยินยอมจากผู้ก่อตั้ง (ดูเครื่องมือด้านล่าง)') }
    ];
    var level = v >= 75 ? { k:'full', t:B('Full control', 'คุมได้เบ็ดเสร็จ'), d:B('You decide everything alone, including changing the rules.', 'ตัดสินใจได้เองทุกเรื่อง รวมถึงแก้กติกาบริษัท') }
      : v > 50 ? { k:'major', t:B('Control — but not the rulebook', 'คุมบริษัทได้ แต่แก้ข้อบังคับคนเดียวไม่ได้'), d:B('You run the board; changing the articles needs others too. Lock your protections into the articles now.', 'คุมกรรมการได้ แต่การแก้ข้อบังคับต้องมีคนอื่นร่วม ควรเขียนสิทธิ์ผู้ก่อตั้งลงข้อบังคับไว้ก่อน') }
      : v > 25 ? { k:'block', t:B('Veto power', 'มีสิทธิ์ยับยั้ง (วีโต้)'), d:B('Others can outvote you on everyday matters, but cannot change the rules without you — protections in the articles stay.', 'คนอื่นโหวตชนะเราเรื่องทั่วไปได้ แต่แก้ข้อบังคับโดยไม่มีเราไม่ได้ สิทธิ์ที่เขียนไว้จึงอยู่ครบ') }
      : { k:'weak', t:B('Needs protection in writing', 'ต้องมีข้อบังคับคุ้มครอง'), d:B('With this many votes your power comes only from the articles and the shareholders\' agreement — set them up before anyone else buys in.', 'เสียงเท่านี้ อำนาจของเรามาจากข้อบังคับและสัญญาผู้ถือหุ้นเท่านั้น ต้องทำให้เสร็จก่อนมีผู้ถือหุ้นคนอื่น') };
    var tools = [
      ['layers', B('Two classes of shares', 'หุ้น 2 ชั้น'), B('Founder holds ordinary voting shares; investors get preference shares with fewer (or no) votes but a priority dividend. Written into the memorandum / articles from day one.', 'ผู้ก่อตั้งถือหุ้นสามัญที่มีสิทธิออกเสียง นักลงทุนได้หุ้นบุริมสิทธิที่เสียงน้อยกว่า (หรือไม่มีเสียง) แต่ได้ปันผลก่อน เขียนไว้ในหนังสือบริคณห์สนธิ/ข้อบังคับตั้งแต่แรก')],
      ['crown', B('Founder board seats', 'สิทธิ์แต่งตั้งกรรมการส่วนใหญ่'), B('The articles or a shareholders\' agreement let the founder name the chairman and most of the directors, whatever the share count.', 'ข้อบังคับหรือสัญญาผู้ถือหุ้นให้ผู้ก่อตั้งแต่งตั้งประธานและกรรมการส่วนใหญ่ได้ ไม่ว่าจะถือหุ้นเท่าไร')],
      ['shield', B('Founder cannot be removed without consent', 'ถอดผู้ก่อตั้งต้องได้ความยินยอมผู้ก่อตั้ง'), B('Articles may set a higher bar than a simple majority to remove a director — e.g. the founder\'s written consent, or a unanimous vote.', 'ข้อบังคับกำหนดเกณฑ์ถอดถอนกรรมการให้สูงกว่ามติธรรมดาได้ เช่น ต้องมีหนังสือยินยอมจากผู้ก่อตั้ง หรือเสียงเอกฉันท์')],
      ['key', B('Reserved matters (veto list)', 'เรื่องที่ต้องผ่านผู้ก่อตั้ง (Reserved matters)'), B('A list in the shareholders\' agreement — new shares, selling the business, changing the CEO, big loans — that need the founder\'s yes.', 'รายการในสัญญาผู้ถือหุ้น เช่น ออกหุ้นใหม่ ขายกิจการ เปลี่ยน CEO กู้เงินก้อนใหญ่ ต้องได้รับความเห็นชอบจากผู้ก่อตั้ง')],
      ['grid', B('Hold through your own holding company', 'ถือผ่านบริษัทโฮลดิ้งของเรา 100%'), B('Your shares sit in a company you own completely, so you can bring partners in at the holding level without diluting your vote below.', 'ถือหุ้นผ่านบริษัทที่เราเป็นเจ้าของ 100% ชวนหุ้นส่วนเข้ามาที่ชั้นโฮลดิ้งได้ โดยเสียงในบริษัทลูกยังเป็นของเรา')],
      ['lock', B('Never drop below 1/4 of the votes', 'อย่าให้เสียงต่ำกว่า 1/4'), B('Above 25% you can block any change to the articles — so every protection above stays locked in.', 'ถ้ามีเสียงเกิน 25% เราขวางการแก้ข้อบังคับได้ สิทธิ์คุ้มครองทั้งหมดข้างบนจึงไม่มีใครลบได้')]
    ];
    var presets = [100, 75, 51, 50, 25, 5];
    return '<div class="bd-ctrl">' +
      '<div class="bd-cin"><h3>' + ico('crown') + esc(T(B('Founder control planner', 'วางแผนอำนาจผู้ก่อตั้ง'))) + '</h3>' +
        '<p>' + esc(T(B('How much of the company do you own, and how do investors\' shares vote?', 'เราถือหุ้นกี่เปอร์เซ็นต์ และหุ้นของนักลงทุนออกเสียงแบบไหน?'))) + '</p>' +
        '<div class="bd-pre">' + presets.map(function(x){ return '<button type="button" data-bd-f="' + x + '" class="' + (c.f === x ? 'on' : '') + '">' + x + '%</button>'; }).join('') + '</div>' +
        '<label class="bd-sl"><span>' + esc(T(B('Your shares', 'หุ้นของเรา'))) + ' <b>' + fmtP(c.f) + '</b></span><input type="range" min="1" max="100" step="1" value="' + c.f + '" data-bd-fr></label>' +
        '<div class="bd-modes">' + MODES.map(function(m){ return '<button type="button" data-bd-m="' + m.k + '" class="' + (c.m === m.k ? 'on' : '') + '"><i></i>' + esc(T(m.t)) + '</button>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="bd-cout">' +
        '<div class="bd-rings"><div class="bd-ring"><svg viewBox="0 0 120 120">' + ring(c.f, 'sh', 50) + '</svg><b>' + fmtP(c.f) + '</b><span>' + esc(T(B('of the shares (money)', 'ของหุ้น (เงินลงทุน)'))) + '</span></div>' +
          '<span class="bd-arrow">' + ico('arrow') + '</span>' +
          '<div class="bd-ring"><svg viewBox="0 0 120 120">' + ring(v, 'vt', 50) + '</svg><b>' + fmtP(v) + '</b><span>' + esc(T(B('of the votes (power)', 'ของเสียงโหวต (อำนาจ)'))) + '</span></div></div>' +
        '<div class="bd-verdict v-' + level.k + '"><b>' + esc(T(level.t)) + '</b><span>' + esc(T(level.d)) + '</span></div>' +
        '<ul class="bd-checks">' + checks.map(function(x){ return '<li class="' + (x.ok ? 'ok' : 'no') + '"><i>' + ico(x.ok ? 'check' : 'x') + '</i><div><b>' + esc(T(x.t)) + '</b><span>' + esc(T(x.d)) + '</span></div></li>'; }).join('') + '</ul>' +
        (inv > 0 ? '<p class="bd-inv">' + esc(T(B('Investors: ', 'นักลงทุน: '))) + fmtP(inv) + T(B(' of the shares · ', ' ของหุ้น · ')) + fmtP(100 - v) + T(B(' of the votes', ' ของเสียง')) + '</p>' : '') +
      '</div></div>' +
      '<h3 class="bd-h3">' + ico('shield') + esc(T(B('Six tools that keep a founder in charge', '6 เครื่องมือที่ทำให้ผู้ก่อตั้งยังคุมบริษัทได้'))) + '</h3>' +
      '<div class="bd-tools">' + tools.map(function(t, i){ return '<div class="bd-tool"><span class="bd-tn">' + (i + 1) + '</span><i>' + ico(t[0]) + '</i><b>' + esc(T(t[1])) + '</b><p>' + esc(T(t[2])) + '</p></div>'; }).join('') + '</div>' +
      '';
  }
  /* 2026-11-17 (d): an official A4 "company structure" document of this page (admin). Founder's name optional. */
  function printDoc(){
    var th = L() === 'th', withName = !!lsGet('spz.board.prname', 1), o = orgData(), c = ctrl(), v = votesOf(c), md = MODES.filter(function(x){ return x.k === c.m; })[0];
    var G = window.__SPZ_PRINTGUARD, lim = G && G.limited();
    var ref = lim ? G.ref('OR') : (window.__SPZ_REPORTREF && window.__SPZ_REPORTREF.make ? window.__SPZ_REPORTREF.make('OR') : 'SPZ-OR-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''));
    var when = new Date().toLocaleDateString(th ? 'th-TH' : 'en-GB', { day:'numeric', month:'long', year:'numeric' });
    var fname = withName ? 'Noraset Boikaw ("Focus")' : T(B('The Founder', 'ผู้ก่อตั้ง'));
    var nm = function(k, def){ var x = o[k] != null && o[k] !== '' ? o[k] : def; if(!withName && /Noraset/i.test(x || '')) x = T(B('The Founder', 'ผู้ก่อตั้ง')); return x || T(B('Vacant', 'ว่าง (รอแต่งตั้ง)')); };
    var row = function(cells, h){ return '<tr>' + cells.map(function(x){ return h ? '<th>' + x + '</th>' : '<td>' + x + '</td>'; }).join('') + '</tr>'; };
    var board = ORG.filter(function(x){ return x.lv === 1; }), dept = ORG.filter(function(x){ return x.lv === 3; });
    var box = function(t, n, cls){ return '<div class="ob ' + (cls || '') + '"><b>' + esc(t) + '</b><span>' + esc(n) + '</span></div>'; };
    var chart = '<div class="oc"><div class="ol">' + box(T(B('Shareholders', 'ผู้ถือหุ้น')), fname + ' ' + fmtP(c.f) + (c.f < 100 ? ' · ' + T(B('others', 'รายอื่น')) + ' ' + fmtP(100 - c.f) : ''), 'g') + '</div><i></i>' +
      '<div class="ol">' + board.map(function(x){ return box(T(x.t), nm(x.k, x.n)); }).join('') + '</div><i></i>' +
      '<div class="ol">' + box(T(B('Chief Executive Officer (CEO)', 'ประธานเจ้าหน้าที่บริหาร (CEO)')), nm('ceo', 'Noraset Boikaw "Focus"'), 'c') + '</div><i></i>' +
      '<div class="ol six">' + dept.map(function(x){ return box(T(x.t), nm(x.k, '')); }).join('') + '</div></div>';
    var checks = [[v > 50, B('Ordinary resolutions (appoint / remove directors)', 'มติธรรมดา (แต่งตั้ง/ถอดถอนกรรมการ)')], [v >= 75, B('Special resolutions (change the articles, capital, merger)', 'มติพิเศษ (แก้ข้อบังคับ ทุน ควบรวม)')], [v > 25, B('Can block special resolutions', 'ขวางมติพิเศษได้')]];
    var css = '@page{size:A4;margin:16mm 15mm 18mm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
      'body{margin:0;font:12px/1.6 "Sarabun","Noto Sans Thai","Inter",sans-serif;color:#111;background:#fff;}' +
      '.hd{display:flex;align-items:center;gap:14px;border-bottom:3px double #111;padding-bottom:10px;margin-bottom:14px;} .hd img{width:46px;} .hd .t{flex:1;} .hd b{display:block;font-size:20px;letter-spacing:.5px;} .hd span{font-size:12px;color:#444;}' +
      '.meta{width:100%;border-collapse:collapse;margin:0 0 14px;font-size:11.5px;} .meta td{border:1px solid #bbb;padding:5px 8px;} .meta td:nth-child(odd){background:#f3f4f6;width:18%;font-weight:700;}' +
      'h2{font-size:14.5px;margin:18px 0 6px;padding-bottom:3px;border-bottom:1.5px solid #111;} h2 span{display:inline-block;min-width:22px;}' +
      'table.t{width:100%;border-collapse:collapse;font-size:11.5px;margin:4px 0 6px;} table.t th,table.t td{border:1px solid #999;padding:5px 7px;vertical-align:top;text-align:left;} table.t th{background:#eef0f4;}' +
      '.oc{display:flex;flex-direction:column;align-items:center;gap:0;margin:6px 0 4px;page-break-inside:avoid;} .oc > i{width:2px;height:14px;background:#111;}' +
      '.ol{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;width:100%;} .ol.six .ob{width:15.5%;}' +
      '.ob{border:1.5px solid #111;border-radius:6px;padding:6px 8px;text-align:center;min-width:120px;} .ob b{display:block;font-size:11px;} .ob span{display:block;font-size:10.5px;color:#333;} .ob.g{border-width:2.5px;} .ob.c{border-width:2.5px;background:#f3f4f6;}' +
      'ol.cl{margin:4px 0 0 18px;padding:0;} ol.cl li{margin:0 0 6px;} ol.cl q{display:block;color:#333;font-style:italic;}' +
      '.sig{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:30px;page-break-inside:avoid;} .sig div{border-top:1px solid #111;padding-top:6px;text-align:center;font-size:11.5px;}' +
      '.ft{margin-top:22px;border-top:1px solid #bbb;padding-top:6px;font-size:10px;color:#555;}' +
      (lim ? G.docCSS('') : '');
    var lg = window.__SPZ_PR_LOGO ? '<img src="' + window.__SPZ_PR_LOGO + '" alt="">' : '';
    var html = '<!doctype html><html lang="' + L() + '"><head><meta charset="utf-8"><title>' + esc(ref) + '</title><style>' + css + '</style></head><body>' + (lim ? G.docMark() : '') +
      '<div class="hd">' + lg + '<div class="t"><b>SPACEZ TERMINAL</b><span>' + esc(T(B('Company structure and governance', 'โครงสร้างองค์กรและอำนาจการบริหาร'))) + '</span></div></div>' +
      '<table class="meta"><tr><td>' + esc(T(B('Document no.', 'เลขที่เอกสาร'))) + '</td><td>' + esc(ref) + '</td><td>' + esc(T(B('Date', 'วันที่'))) + '</td><td>' + esc(when) + '</td></tr>' +
        '<tr><td>' + esc(T(B('Founder', 'ผู้ก่อตั้ง'))) + '</td><td>' + esc(fname) + '</td><td>' + esc(T(B('Status', 'สถานะ'))) + '</td><td>' + esc(T(lim ? B('Draft — not an official copy', 'ฉบับร่าง · ไม่ใช่ฉบับจริง') : B('Internal document — for the board', 'เอกสารภายใน · สำหรับคณะกรรมการ'))) + '</td></tr></table>' +
      '<h2><span>1.</span>' + esc(T(B('Shareholding', 'โครงสร้างการถือหุ้น'))) + '</h2><table class="t">' + row([T(B('Shareholder', 'ผู้ถือหุ้น')), T(B('Share type', 'ประเภทหุ้น')), T(B('Shares', 'สัดส่วนหุ้น')), T(B('Votes', 'สัดส่วนเสียง'))].map(esc), 1) +
        row([esc(fname), esc(T(B('Ordinary (voting)', 'หุ้นสามัญ (มีสิทธิออกเสียง)'))), fmtP(c.f), fmtP(v)]) +
        (c.f < 100 ? row([esc(T(B('Other shareholders / investors', 'ผู้ถือหุ้นรายอื่น · นักลงทุน'))), esc(T(md.t)), fmtP(100 - c.f), fmtP(100 - v)]) : '') + '</table>' +
      '<h2><span>2.</span>' + esc(T(B('Organisation chart', 'แผนผังองค์กร'))) + '</h2>' + chart +
      '<h2><span>3.</span>' + esc(T(B('Board of directors', 'คณะกรรมการบริษัท'))) + '</h2><table class="t">' + row([T(B('Position', 'ตำแหน่ง')), T(B('Seats', 'จำนวน')), T(B('Appointed by', 'ผู้แต่งตั้ง')), T(B('Duty', 'หน้าที่')), T(B('Name', 'ชื่อ'))].map(esc), 1) +
        board.map(function(x){ return row([esc(T(x.t)), esc(T(CNT[x.k] || B('1', '1'))), esc(T(x.k === 'ind' ? B('Shareholders\' meeting', 'ที่ประชุมผู้ถือหุ้น') : B('The Founder', 'ผู้ก่อตั้ง'))), esc(T(x.d)), esc(nm(x.k, x.n))]); }).join('') +
        row([esc(T(B('Board committees', 'คณะกรรมการชุดย่อย'))), '–', esc(T(B('The board', 'คณะกรรมการ'))), esc(COMMIT.map(T).join(' · ')), '–']) + '</table>' +
      '<h2><span>4.</span>' + esc(T(B('Management and departments', 'ฝ่ายบริหารและฝ่ายงาน'))) + '</h2><table class="t">' + row([T(B('Department', 'ฝ่าย')), T(B('Head', 'ผู้รับผิดชอบ')), T(B('Teams', 'ทีมย่อย'))].map(esc), 1) +
        row([esc(T(B('Chief Executive Officer (CEO)', 'ประธานเจ้าหน้าที่บริหาร (CEO)'))), esc(nm('ceo', 'Noraset Boikaw "Focus"')), esc(T(B('Runs the company; reports to the board', 'บริหารงานทั้งหมด รายงานต่อคณะกรรมการ')))]) +
        dept.map(function(x){ return row([esc(T(x.t)), esc(nm(x.k, '')), esc((SUBS[x.k] || []).map(T).join(' · '))]); }).join('') + '</table>' +
      '<h2><span>5.</span>' + esc(T(B('Founder control', 'อำนาจของผู้ก่อตั้ง'))) + '</h2><table class="t">' + checks.map(function(x){ return row([esc(T(x[1])), x[0] ? '✓ ' + esc(T(B('Yes', 'ได้'))) : '✗ ' + esc(T(B('No — protected by the articles', 'ไม่ได้ — ใช้ข้อบังคับคุ้มครอง')))]); }).join('') + '</table>' +
      '<h2><span>6.</span>' + esc(T(B('Clauses in the articles / shareholders\' agreement', 'ข้อบังคับ / สัญญาผู้ถือหุ้นที่ใช้'))) + '</h2><ol class="cl">' + CLAUSES.map(function(x){ return '<li><b>' + esc(T(x[0])) + '</b><q>' + esc(T(x[1])).replace(/^&quot;|&quot;$/g, '') + '</q></li>'; }).join('') + '</ol>' +
      '<div class="sig"><div>' + esc(T(B('Founder / Chairman', 'ผู้ก่อตั้ง / ประธานกรรมการ'))) + '<br>(' + esc(fname) + ')<br>' + esc(T(B('Date', 'วันที่'))) + ' ........................</div><div>' + esc(T(B('Director / Witness', 'กรรมการ / พยาน'))) + '<br>(......................................)<br>' + esc(T(B('Date', 'วันที่'))) + ' ........................</div></div>' +
      '<div class="ft">' + esc(ref) + ' · SPACEZ TERMINAL · ' + esc(T(B('General information about Thai private limited companies, not legal advice. Final wording must be drafted by a Thai lawyer and registered with the Department of Business Development.', 'ข้อมูลทั่วไปเกี่ยวกับบริษัทจำกัดในไทย ไม่ใช่คำปรึกษาทางกฎหมาย ข้อความจริงต้องให้ทนายความร่าง และจดทะเบียนกับกรมพัฒนาธุรกิจการค้า'))) + '</div>' +
      '</body></html>';
    var old = document.getElementById('bdPrintFrame'); if(old) old.remove();
    var f = document.createElement('iframe'); f.id = 'bdPrintFrame';
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:800px;height:600px;opacity:0;pointer-events:none;border:0;z-index:-1;';
    document.body.appendChild(f);
    var d = f.contentDocument; d.open(); d.write(html); d.close();
    window.__SPZ_BOARD_DOC = html;
    setTimeout(function(){ try { f.contentWindow.focus(); f.contentWindow.print(); } catch(e){} }, 700);
  }
  function paint(){
    if(!sec) return;
    var sy = window.pageYOffset;
    setTimeout(function(){ if(Math.abs(window.pageYOffset - sy) > 2 && document.getElementById('board').classList.contains('route-on')) window.scrollTo(0, sy); }, 0);
    if(!isAdmin()){
      sec.innerHTML = '<div class="bd-wrap"><div class="bd-lock">' + ico('lock') + '<b>' + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</b><p>' + esc(T(B('Sign in with the admin key to open the executive board.', 'เข้าสู่ระบบด้วยรหัสแอดมินเพื่อเปิดบอร์ดบริหาร'))) + '</p></div></div>';
      return;
    }
    var tb = tab() === 'dash' ? 'dash' : 'main';
    var c = ctrl(), v = votesOf(c);
    var ava = window.__SPZ_DEV_AVATAR ? '<img src="' + window.__SPZ_DEV_AVATAR + '" alt="">' : '<span>N</span>';
    var TABS = [['main', 'grid', B('Structure & control', 'โครงสร้างและอำนาจ')], ['dash', 'bolt', B('Site control panel', 'แผงควบคุมเว็บ')]];
    var withName = lsGet('spz.board.prname', 1);
    sec.innerHTML = '<div class="bd-wrap">' +
      '<header class="bd-head"><div class="bd-hgrid"><div>' +
        '<div class="bd-kick"><span class="bd-pill">' + ico('lock') + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</span><span>' + esc(T(B('Executive suite', 'พื้นที่ผู้บริหาร'))) + '</span></div>' +
        '<h2>' + esc(T(B('Executive board', 'บอร์ดบริหาร'))) + '</h2>' +
        '<p>' + esc(T(B('Who owns SPACEZ TERMINAL, who runs what, and how the founder keeps control as the company grows.', 'ใครเป็นเจ้าของ SPACEZ TERMINAL ใครดูแลอะไร และผู้ก่อตั้งจะคุมบริษัทไว้ได้อย่างไรเมื่อบริษัทโตขึ้น'))) + '</p></div>' +
        '<div class="bd-founder"><span class="bd-fava">' + ava + '</span><div><small>' + esc(T(B('Founder · CEO', 'ผู้ก่อตั้ง · CEO'))) + '</small><b>Noraset Boikaw "Focus"</b><span class="bd-fst"><em>' + esc(T(B('Shares', 'หุ้น'))) + ' ' + fmtP(c.f) + '</em><em class="v">' + esc(T(B('Votes', 'เสียง'))) + ' ' + fmtP(v) + '</em></span></div></div>' +
      '</div>' +
        '<div class="bd-tabs" role="tablist">' + TABS.map(function(x){ return '<button type="button" data-bd-tab="' + x[0] + '" class="' + (tb === x[0] ? 'on' : '') + '">' + ico(x[1]) + esc(T(x[2])) + '</button>'; }).join('') +
          (tb === 'main' ? '<span class="bd-tsp"></span><label class="bd-prn"><input type="checkbox" data-bd-prname' + (withName ? ' checked' : '') + '>' + esc(T(B('Founder\'s name on the print', 'ใส่ชื่อผู้ก่อตั้งในเอกสาร'))) + '</label>' +
            '<button type="button" class="bd-print" data-bd-print>' + ico('print') + esc(T(B('Print company structure (A4)', 'พิมพ์เอกสารโครงสร้างบริษัท (A4)'))) + '</button>' : '') + '</div>' +
      '</header>' +
      (tb === 'main' ?
        '<div class="bd-tools2"><button type="button" data-bd-all="1">' + esc(T(B('Open all', 'เปิดทั้งหมด'))) + '</button><button type="button" data-bd-all="0">' + esc(T(B('Close all', 'ปิดทั้งหมด'))) + '</button></div>' +
        secHTML('org', 1, 'grid', B('Organisation chart', 'โครงสร้างองค์กร'), B('Owners → board → CEO → departments and their teams. Tap a department to see its teams.', 'เจ้าของ → คณะกรรมการ → CEO → ฝ่ายงานและทีมย่อย กดที่ฝ่ายเพื่อดูทีมย่อย'),
          '<div class="bd-orgbar"><button type="button" class="bd-edit' + (editing ? ' on' : '') + '" data-bd-edit>' + esc(T(editing ? B('Save names', 'บันทึกรายชื่อ') : B('Edit names', 'แก้ไขรายชื่อ'))) + '</button><span>' + esc(T(B('Names are kept in this browser only.', 'รายชื่อเก็บไว้ในเบราว์เซอร์นี้เท่านั้น'))) + '</span></div>' + orgHTML()) +
        secHTML('ctrl', 2, 'crown', B('Founder control', 'อำนาจผู้ก่อตั้ง'), B('Your shares vs your votes, and what you can decide alone.', 'หุ้นของเรากับเสียงของเรา และเรื่องที่ตัดสินใจเองได้'), ctrlHTML()) +
        secHTML('dil', 3, 'trend', B('Funding rounds: how your share shrinks', 'จำลองการระดมทุน: หุ้นเราจะลดลงแค่ไหน'), B('Seed → Series A → Series B → listing, with your chosen share type.', 'Seed → Series A → Series B → เข้าตลาด ตามประเภทหุ้นที่เลือกไว้'), dilHTML()) +
        secHTML('scen', 4, 'shield', B('What if…? Six situations', 'ถ้าเกิดเหตุการณ์นี้ล่ะ? 6 สถานการณ์'), B('What happens without protection, and what keeps you in charge.', 'ถ้าไม่ได้ป้องกันจะเป็นยังไง และอะไรที่ทำให้เรายังคุมได้'), scenHTML()) +
        secHTML('case', 5, 'book', B('Real founders, real lessons', 'กรณีศึกษาจากผู้ก่อตั้งตัวจริง'), B('Jobs, Altman, Zuckerberg, Huang, Musk — who kept control and why.', 'Jobs · Altman · Zuckerberg · Huang · Musk ใครคุมได้ เพราะอะไร'), casesHTML()) +
        secHTML('rule', 6, 'key', B('Board size and the wording to write', 'ขนาดบอร์ด และข้อความที่ควรเขียน'), B('How many directors, and six sample clauses for the articles.', 'ควรมีกรรมการกี่คน และตัวอย่างข้อบังคับ 6 ข้อ'), rulesHTML()) +
        '<div class="bd-law bd-law2">' + ico('lock') + '<p><b>' + esc(T(B('Good to know', 'ควรรู้'))) + '</b> ' + esc(T(B('General information about Thai private limited companies, not legal advice. Have a Thai lawyer draft the memorandum, the articles and the shareholders\' agreement before anyone else buys shares.', 'ข้อมูลทั่วไปเกี่ยวกับบริษัทจำกัดในไทย ไม่ใช่คำปรึกษาทางกฎหมาย ให้ทนายความเขียนหนังสือบริคณห์สนธิ ข้อบังคับ และสัญญาผู้ถือหุ้น ก่อนรับผู้ถือหุ้นรายอื่น'))) + '</p></div>'
        : dashHTML()) +
      '</div>';
  }
  function build(){
    if(!window.__spzAddRoute) return false;
    if(document.getElementById('board')) return true;
    sec = document.createElement('section'); sec.id = 'board'; sec.className = 'bd-sec'; sec.setAttribute('data-route', 'board');
    var foot = document.querySelector('body > footer'); if(foot) document.body.insertBefore(sec, foot); else document.body.appendChild(sec);
    window.__spzAddRoute({ id:'board', after:'printall', t:B('Executive board', 'บอร์ดบริหาร'), d:B('Admin only: organisation chart (shareholders, board, CEO, departments) and the site control panel.', 'เฉพาะแอดมิน: โครงสร้างองค์กร (ผู้ถือหุ้น คณะกรรมการ CEO ฝ่ายงาน) และแผงควบคุมเว็บ') });
    sec.addEventListener('change', function(e){ var cb = e.target.closest('[data-bd-prname]'); if(cb) lsSet('spz.board.prname', cb.checked ? 1 : 0); });
    sec.addEventListener('input', function(e){
      var r = e.target.closest('[data-bd-fr]'); if(!r) return;
      var c2 = ctrl(); c2.f = +r.value; lsSet('spz.board.ctrl', c2);
      clearTimeout(sec.__rt); sec.__rt = setTimeout(function(){ paint(); var r2 = sec.querySelector('[data-bd-fr]'); if(r2) r2.focus(); }, 60);
    });
    sec.addEventListener('submit', function(e){
      var f = e.target.closest('[data-bd-add]'); if(!f) return; e.preventDefault();
      if(!isAdmin()) return paint();
      var v = f.querySelector('input').value.trim(); if(!v) return;
      var t = lsGet('spz.board.todo', []) || []; t.unshift({ t:v, d:0 }); lsSet('spz.board.todo', t.slice(0, 60)); paint();
      var inp = sec.querySelector('[data-bd-add] input'); if(inp) inp.focus();
    });
    sec.addEventListener('click', function(e){
      var t = lsGet('spz.board.todo', []) || [], b;
      if((b = e.target.closest('[data-bd-fold]'))){ var so = secOpen(), k = b.getAttribute('data-bd-fold'); so[k] = so[k] ? 0 : 1; lsSet('spz.board.open', so); paint(); return; }
      if((b = e.target.closest('[data-bd-all]'))){ var on = b.getAttribute('data-bd-all') === '1', sa = {}; ['org', 'ctrl', 'dil', 'scen', 'case', 'rule'].forEach(function(k){ sa[k] = on ? 1 : 0; }); lsSet('spz.board.open', sa); paint(); return; }
      if((b = e.target.closest('[data-bd-node]'))){ var nk = b.getAttribute('data-bd-node'); openNode = openNode === nk ? null : nk; paint(); return; }
      if((b = e.target.closest('[data-bd-sc]'))){ lsSet('spz.board.scen', b.getAttribute('data-bd-sc')); paint(); return; }
      if((b = e.target.closest('[data-bd-print]'))){ printDoc(); return; }
      if((b = e.target.closest('[data-bd-f]'))){ var c0 = ctrl(); c0.f = +b.getAttribute('data-bd-f'); lsSet('spz.board.ctrl', c0); paint(); return; }
      if((b = e.target.closest('[data-bd-m]'))){ var c1 = ctrl(); c1.m = b.getAttribute('data-bd-m'); lsSet('spz.board.ctrl', c1); paint(); return; }
      if((b = e.target.closest('[data-bd-tab]'))){ lsSet('spz.board.tab', b.getAttribute('data-bd-tab')); editing = false; paint(); return; }
      if((b = e.target.closest('[data-bd-edit]'))){
        if(editing){ var o = orgData(); sec.querySelectorAll('[data-org]').forEach(function(i){ o[i.getAttribute('data-org')] = i.value.trim(); }); lsSet('spz.board.org', o); }
        editing = !editing; paint(); if(editing){ var f = sec.querySelector('[data-org]'); if(f) f.focus(); } return;
      }
      if((b = e.target.closest('[data-bd-tg]'))){ var i = +b.getAttribute('data-bd-tg'); if(t[i]){ t[i].d = t[i].d ? 0 : 1; lsSet('spz.board.todo', t); paint(); } return; }
      if((b = e.target.closest('[data-bd-rm]'))){ t.splice(+b.getAttribute('data-bd-rm'), 1); lsSet('spz.board.todo', t); paint(); }
    });
    var loaded = false;
    var onB = false;
    var onRoute = function(){ var at = ''; try { at = window.__spzNav ? window.__spzNav.at() : ''; } catch(e){} var now = at === 'board' || /^#\/board\b/.test(location.hash);
      if(now && !onB){ if(!loaded){ loaded = true; loadFresh(); } paint(); } onB = now; };
    window.addEventListener('hashchange', onRoute);
    setInterval(onRoute, 500);
    document.addEventListener('spz:tier', paint);
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    paint(); onRoute();
    return true;
  }
  /* 2026-11-17 (c) (user request): the menu's special block shows its three cards in full colour for everyone (no grey
     "locked" look); a single line above them says who can open them. Access itself is unchanged (part-46 locks). */
  function featLock(){
    var tier = ''; try { tier = window.__SPZ_TIER ? window.__SPZ_TIER() : ''; } catch(e){}
    var staff = tier === 'full' || tier === 'editor';
    document.querySelectorAll('.np-feat').forEach(function(f){
      f.classList.toggle('np-feat-open', staff);
      var h = f.querySelector('.np-feat-h'); if(!h) return;
      var k = h.querySelector('.np-feat-lock');
      if(!k){ k = document.createElement('em'); k.className = 'np-feat-lock'; h.appendChild(k); }
      var txt = T(B('Locked · Admin, Editor and Reviewer only', 'ล็อกไว้ · เฉพาะแอดมิน Editor และผู้ประเมิน'));
      var html = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>' + esc(txt);
      if(k.innerHTML !== html) k.innerHTML = html;
      k.hidden = staff;
    });
  }
  setInterval(featLock, 800);
  document.addEventListener('spz:tier', featLock);
  var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 250);
})();
