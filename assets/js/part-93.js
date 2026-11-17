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
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'
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
      out += '<div class="bd-lvl lv' + lv + '"><div class="bd-lvh">' + esc(T(LV[lv])) + '</div><div class="bd-row n' + row.length + '">' +
        row.map(function(x){
          var name = o[x.k] != null ? o[x.k] : x.n;
          return '<div class="bd-node t-' + x.tone + '" data-node="' + x.k + '"><span class="bd-av">' + esc((name || '?').replace(/[^A-Za-zก-๙]/g, '').slice(0, 1).toUpperCase() || '?') + '</span>' +
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
  function paint(){
    if(!sec) return;
    if(!isAdmin()){
      sec.innerHTML = '<div class="bd-wrap"><div class="bd-lock">' + ico('lock') + '<b>' + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</b><p>' + esc(T(B('Sign in with the admin key to open the executive board.', 'เข้าสู่ระบบด้วยรหัสแอดมินเพื่อเปิดบอร์ดบริหาร'))) + '</p></div></div>';
      return;
    }
    var tb = tab();
    sec.innerHTML = '<div class="bd-wrap">' +
      '<header class="bd-head"><div class="bd-kick"><span class="bd-pill">' + ico('lock') + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</span><span>' + esc(T(B('Executive suite · draft', 'พื้นที่ผู้บริหาร · ฉบับร่าง'))) + '</span></div>' +
        '<h2>' + esc(T(B('Executive board', 'บอร์ดบริหาร'))) + '</h2>' +
        '<p>' + esc(T(B('Who owns SPACEZ TERMINAL and who is in charge of what — from the shareholders and the board down to each department. A first outline; fill the names in as the team grows.', 'ใครเป็นเจ้าของ SPACEZ TERMINAL และใครดูแลอะไร ตั้งแต่ผู้ถือหุ้น คณะกรรมการ จนถึงแต่ละฝ่าย เป็นโครงร่างแรก เติมชื่อได้เมื่อทีมโตขึ้น'))) + '</p>' +
        '<div class="bd-tabs" role="tablist"><button type="button" data-bd-tab="org" class="' + (tb === 'org' ? 'on' : '') + '">' + ico('grid') + esc(T(B('Organisation chart', 'โครงสร้างองค์กร'))) + '</button><button type="button" data-bd-tab="dash" class="' + (tb === 'dash' ? 'on' : '') + '">' + ico('bolt') + esc(T(B('Site control panel', 'แผงควบคุมเว็บ'))) + '</button>' +
          (tb === 'org' ? '<button type="button" class="bd-edit' + (editing ? ' on' : '') + '" data-bd-edit>' + esc(T(editing ? B('Save names', 'บันทึกรายชื่อ') : B('Edit names', 'แก้ไขรายชื่อ'))) + '</button>' : '') + '</div>' +
      '</header>' + (tb === 'org' ? orgHTML() + '<p class="bd-note bd-onote">' + esc(T(B('Names are kept in this browser only. Titles follow a common Thai company structure (shareholders appoint the board, the board appoints the CEO).', 'รายชื่อเก็บไว้ในเบราว์เซอร์นี้เท่านั้น ตำแหน่งเรียงตามโครงสร้างบริษัททั่วไป (ผู้ถือหุ้นแต่งตั้งกรรมการ กรรมการแต่งตั้ง CEO)'))) + '</p>' : dashHTML()) +
      '</div>';
  }
  function build(){
    if(!window.__spzAddRoute) return false;
    if(document.getElementById('board')) return true;
    sec = document.createElement('section'); sec.id = 'board'; sec.className = 'bd-sec'; sec.setAttribute('data-route', 'board');
    var foot = document.querySelector('body > footer'); if(foot) document.body.insertBefore(sec, foot); else document.body.appendChild(sec);
    window.__spzAddRoute({ id:'board', after:'printall', t:B('Executive board', 'บอร์ดบริหาร'), d:B('Admin only: organisation chart (shareholders, board, CEO, departments) and the site control panel.', 'เฉพาะแอดมิน: โครงสร้างองค์กร (ผู้ถือหุ้น คณะกรรมการ CEO ฝ่ายงาน) และแผงควบคุมเว็บ') });
    sec.addEventListener('submit', function(e){
      var f = e.target.closest('[data-bd-add]'); if(!f) return; e.preventDefault();
      if(!isAdmin()) return paint();
      var v = f.querySelector('input').value.trim(); if(!v) return;
      var t = lsGet('spz.board.todo', []) || []; t.unshift({ t:v, d:0 }); lsSet('spz.board.todo', t.slice(0, 60)); paint();
      var inp = sec.querySelector('[data-bd-add] input'); if(inp) inp.focus();
    });
    sec.addEventListener('click', function(e){
      var t = lsGet('spz.board.todo', []) || [], b;
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
  var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 250);
})();
