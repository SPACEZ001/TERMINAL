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
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'
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
            '<small>' + esc(T(x.d)) + '</small></div></div>';
        }).join('') + '</div></div>';
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
      '<div class="bd-law">' + ico('lock') + '<p><b>' + esc(T(B('Good to know', 'ควรรู้'))) + '</b> ' + esc(T(B('General information about Thai private limited companies (Civil and Commercial Code), not legal advice. No structure is 100% bullet-proof — a director who breaks the law or their duties can still be removed by a court. Public companies (PLC) follow stricter one-share-one-vote rules. Before anyone else buys shares, have a Thai lawyer write the memorandum, the articles and the shareholders\' agreement.', 'ข้อมูลทั่วไปเกี่ยวกับบริษัทจำกัดตามประมวลกฎหมายแพ่งและพาณิชย์ ไม่ใช่คำปรึกษาทางกฎหมาย ไม่มีโครงสร้างไหนกันได้ 100% เช่น กรรมการที่ทำผิดกฎหมายหรือผิดหน้าที่ยังถูกศาลสั่งให้พ้นตำแหน่งได้ ส่วนบริษัทมหาชนมีกฎเข้มกว่า (โดยหลักหนึ่งหุ้นหนึ่งเสียง) ก่อนรับผู้ถือหุ้นรายอื่น ควรให้ทนายความเขียนหนังสือบริคณห์สนธิ ข้อบังคับ และสัญญาผู้ถือหุ้นให้'))) + '</p></div>';
  }
  function paint(){
    if(!sec) return;
    if(!isAdmin()){
      sec.innerHTML = '<div class="bd-wrap"><div class="bd-lock">' + ico('lock') + '<b>' + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</b><p>' + esc(T(B('Sign in with the admin key to open the executive board.', 'เข้าสู่ระบบด้วยรหัสแอดมินเพื่อเปิดบอร์ดบริหาร'))) + '</p></div></div>';
      return;
    }
    var tb = tab(); if(['org', 'ctrl', 'dash'].indexOf(tb) < 0) tb = 'org';
    var c = ctrl(), v = votesOf(c);
    var ava = window.__SPZ_DEV_AVATAR ? '<img src="' + window.__SPZ_DEV_AVATAR + '" alt="">' : '<span>N</span>';
    var TABS = [['org', 'grid', B('Organisation chart', 'โครงสร้างองค์กร')], ['ctrl', 'crown', B('Founder control', 'อำนาจผู้ก่อตั้ง')], ['dash', 'bolt', B('Site control panel', 'แผงควบคุมเว็บ')]];
    sec.innerHTML = '<div class="bd-wrap">' +
      '<header class="bd-head"><div class="bd-hgrid"><div>' +
        '<div class="bd-kick"><span class="bd-pill">' + ico('lock') + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</span><span>' + esc(T(B('Executive suite', 'พื้นที่ผู้บริหาร'))) + '</span></div>' +
        '<h2>' + esc(T(B('Executive board', 'บอร์ดบริหาร'))) + '</h2>' +
        '<p>' + esc(T(B('Who owns SPACEZ TERMINAL, who runs what, and how the founder keeps control as the company grows.', 'ใครเป็นเจ้าของ SPACEZ TERMINAL ใครดูแลอะไร และผู้ก่อตั้งจะคุมบริษัทไว้ได้อย่างไรเมื่อบริษัทโตขึ้น'))) + '</p></div>' +
        '<div class="bd-founder"><span class="bd-fava">' + ava + '</span><div><small>' + esc(T(B('Founder · CEO', 'ผู้ก่อตั้ง · CEO'))) + '</small><b>Noraset Boikaw "Focus"</b><span class="bd-fst"><em>' + esc(T(B('Shares', 'หุ้น'))) + ' ' + fmtP(c.f) + '</em><em class="v">' + esc(T(B('Votes', 'เสียง'))) + ' ' + fmtP(v) + '</em></span></div></div>' +
      '</div>' +
        '<div class="bd-tabs" role="tablist">' + TABS.map(function(x){ return '<button type="button" data-bd-tab="' + x[0] + '" class="' + (tb === x[0] ? 'on' : '') + '">' + ico(x[1]) + esc(T(x[2])) + '</button>'; }).join('') +
          (tb === 'org' ? '<button type="button" class="bd-edit' + (editing ? ' on' : '') + '" data-bd-edit>' + esc(T(editing ? B('Save names', 'บันทึกรายชื่อ') : B('Edit names', 'แก้ไขรายชื่อ'))) + '</button>' : '') + '</div>' +
      '</header>' +
      (tb === 'org' ? orgHTML() + '<p class="bd-note bd-onote">' + esc(T(B('Names are kept in this browser only. Shareholders appoint the board, the board appoints the CEO — the founder-control tab shows how to keep that chain in your hands.', 'รายชื่อเก็บไว้ในเบราว์เซอร์นี้เท่านั้น ผู้ถือหุ้นแต่งตั้งกรรมการ กรรมการแต่งตั้ง CEO — แท็บ "อำนาจผู้ก่อตั้ง" แสดงวิธีคุมทั้งสายนี้ไว้ในมือเรา'))) + '</p>'
        : tb === 'ctrl' ? ctrlHTML() : dashHTML()) +
      '</div>';
  }
  function build(){
    if(!window.__spzAddRoute) return false;
    if(document.getElementById('board')) return true;
    sec = document.createElement('section'); sec.id = 'board'; sec.className = 'bd-sec'; sec.setAttribute('data-route', 'board');
    var foot = document.querySelector('body > footer'); if(foot) document.body.insertBefore(sec, foot); else document.body.appendChild(sec);
    window.__spzAddRoute({ id:'board', after:'printall', t:B('Executive board', 'บอร์ดบริหาร'), d:B('Admin only: organisation chart (shareholders, board, CEO, departments) and the site control panel.', 'เฉพาะแอดมิน: โครงสร้างองค์กร (ผู้ถือหุ้น คณะกรรมการ CEO ฝ่ายงาน) และแผงควบคุมเว็บ') });
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
