/* ============================================================================
   SPACEZ TERMINAL -- Round AO: two admin-only pages
   1) #/gradebook  "Gradebook" -- one place for every classroom-exam student:
      the exam results the site records automatically + scores the admin types
      in by hand (quizzes, homework, practice, attendance ...). Stored on the
      student's classroom exam account in the Worker (POST /api/admin/cexam/
      grades). Prints a formal report (one student or the whole class) and
      saves the data to a local file (CSV for Excel, JSON backup).
   2) #/secmap  "Security map" -- an animated, zoomable infographic of how the
      site protects logins, accounts, the classroom, notes, the editor code
      and the admin key. Full screen, wheel/pinch zoom, drag to pan.
   Both pages are reached from the admin panel in the login gate (part-46).
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_GB) return;
  window.__SPZ_GB = true;

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function key(){ try { return sessionStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; } }
  function setKey(k){ try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){} }
  function api(method, path, body){
    var h = { 'X-Admin-Key':key() }; if(body) h['Content-Type'] = 'application/json';
    return fetch(WORKER_BASE + path, { method:method, headers:h, body: body ? JSON.stringify(body) : undefined })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j = j || {}; j.__status = r.status; return j; }); })
      .catch(function(){ return { error:'net' }; });
  }
  function today(){ var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fmtDate(v){
    if(!v) return '—';
    var d = typeof v === 'number' ? new Date(v) : new Date(String(v) + 'T00:00:00');
    if(isNaN(d)) return String(v);
    try { return d.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', year:'numeric' }); } catch(e){ return d.toISOString().slice(0, 10); }
  }
  function download(name, text, type){
    var blob = new Blob([text], { type:type });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  /* =========================================================== GRADEBOOK */
  var G = {
    eb:{ en:'Admin · Classroom', th:'แอดมิน · ห้องเรียน' },
    h:{ en:'Gradebook', th:'สมุดคะแนน' },
    lede:{ en:'Every classroom student in one place: exam results the site records automatically, plus scores you add by hand. Print a formal report or save the data to a file.', th:'นักเรียนทุกคนของห้องเรียนในที่เดียว: ผลสอบที่ระบบบันทึกให้อัตโนมัติ และคะแนนที่แอดมินกรอกเอง พิมพ์เป็นรายงานทางการ หรือบันทึกข้อมูลเป็นไฟล์ได้' },
    keyH:{ en:'Enter the admin key to open the gradebook', th:'ใส่รหัสแอดมินเพื่อเปิดสมุดคะแนน' },
    keyPh:{ en:'Admin key', th:'รหัสแอดมิน' }, keyGo:{ en:'Open', th:'เปิด' }, keyBad:{ en:'That key was not accepted.', th:'รหัสไม่ถูกต้อง' },
    search:{ en:'Search name or username…', th:'ค้นหาชื่อหรือชื่อผู้ใช้…' },
    refresh:{ en:'Refresh', th:'รีเฟรช' }, printClass:{ en:'Print class report', th:'พิมพ์รายงานทั้งห้อง' },
    csv:{ en:'Save CSV (Excel)', th:'บันทึก CSV (Excel)' }, json:{ en:'Save backup (JSON)', th:'บันทึกสำรอง (JSON)' },
    loading:{ en:'Loading students…', th:'กำลังโหลดรายชื่อนักเรียน…' }, none:{ en:'No classroom students yet. Create exam accounts in the classroom admin first.', th:'ยังไม่มีนักเรียน สร้างบัญชีสอบในหน้าจัดการห้องเรียนก่อนนะคะ' },
    netErr:{ en:'Could not reach the server.', th:'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' },
    pick:{ en:'Pick a student on the left.', th:'เลือกนักเรียนทางซ้าย' },
    avg:{ en:'Average', th:'เฉลี่ย' }, grade:{ en:'Grade', th:'เกรด' }, entries:{ en:'Entries', th:'รายการ' }, best:{ en:'Best', th:'สูงสุด' },
    auto:{ en:'Exam results (automatic)', th:'ผลสอบ (บันทึกอัตโนมัติ)' }, manual:{ en:'Scores added by the admin', th:'คะแนนที่แอดมินกรอก' },
    noAuto:{ en:'No finished exams yet.', th:'ยังไม่มีการสอบที่ทำเสร็จ' }, noManual:{ en:'No scores added yet.', th:'ยังไม่มีคะแนนที่กรอก' },
    cDate:{ en:'Date', th:'วันที่' }, cItem:{ en:'Item', th:'รายการ' }, cKind:{ en:'Type', th:'ประเภท' }, cScore:{ en:'Score', th:'คะแนน' }, cPct:{ en:'%', th:'%' }, cNote:{ en:'Note', th:'หมายเหตุ' },
    add:{ en:'Add a score', th:'เพิ่มคะแนน' }, title:{ en:'Item name (e.g. Quiz 3)', th:'ชื่อรายการ (เช่น แบบทดสอบที่ 3)' }, max:{ en:'Full marks', th:'คะแนนเต็ม' }, note:{ en:'Note (optional)', th:'หมายเหตุ (ไม่บังคับ)' },
    save:{ en:'Save', th:'บันทึก' }, del:{ en:'Delete', th:'ลบ' }, delSure:{ en:'Tap again to delete', th:'แตะอีกครั้งเพื่อลบ' },
    badEntry:{ en:'Check the score and full marks.', th:'ตรวจคะแนนและคะแนนเต็มอีกครั้ง' }, saved:{ en:'Saved.', th:'บันทึกแล้ว' },
    printOne:{ en:'Print this student', th:'พิมพ์รายงานนักเรียนคนนี้' },
    repT:{ en:'Student Grade Report', th:'รายงานผลการเรียน' }, repClass:{ en:'Class Grade Report', th:'รายงานผลการเรียนทั้งห้อง' },
    repSub:{ en:'Elliott Wave Classroom', th:'ห้องเรียนคลื่นเอลเลียต' }, student:{ en:'Student', th:'นักเรียน' }, user:{ en:'Username', th:'ชื่อผู้ใช้' },
    issued:{ en:'Issued', th:'ออกให้วันที่' }, teacher:{ en:'Instructor', th:'ผู้สอน' }, summary:{ en:'Summary', th:'สรุป' },
    scale:{ en:'Grade scale: 4 = 80–100 · 3.5 = 75–79 · 3 = 70–74 · 2.5 = 65–69 · 2 = 60–64 · 1.5 = 55–59 · 1 = 50–54 · 0 = below 50', th:'เกณฑ์: 4 = 80–100 · 3.5 = 75–79 · 3 = 70–74 · 2.5 = 65–69 · 2 = 60–64 · 1.5 = 55–59 · 1 = 50–54 · 0 = ต่ำกว่า 50' },
    noName:{ en:'(no name yet)', th:'(ยังไม่ตั้งชื่อ)' }, exam:{ en:'Exam', th:'สอบ' }
  };
  var KINDS = {
    exam:{ en:'Exam', th:'สอบ' }, quiz:{ en:'Quiz', th:'แบบทดสอบ' }, homework:{ en:'Homework', th:'การบ้าน' }, practice:{ en:'Practice', th:'แบบฝึก' },
    project:{ en:'Project', th:'โปรเจกต์' }, attendance:{ en:'Attendance', th:'การเข้าเรียน' }, other:{ en:'Other', th:'อื่นๆ' }
  };
  function gradeOf(p){ if(p == null || isNaN(p)) return '—'; return p >= 80 ? '4' : p >= 75 ? '3.5' : p >= 70 ? '3' : p >= 65 ? '2.5' : p >= 60 ? '2' : p >= 55 ? '1.5' : p >= 50 ? '1' : '0'; }

  var gb = { users:null, sets:{}, sel:null, q:'', err:'', busy:false, delArm:null, msg:'' };
  var gsec = null;

  function rows(u){
    var out = [];
    (u.exams || []).forEach(function(e){
      if(e.status === 'done' && e.total) out.push({ auto:true, date:e.finishedAt, title:(gb.sets[e.setId] || e.setId), kind:'exam', score:e.score, max:e.total, pct:(e.percent != null ? e.percent : e.score / e.total * 100) });
      (e.history || []).forEach(function(h){ if(h.total) out.push({ auto:true, date:h.finishedAt, title:(gb.sets[e.setId] || e.setId) + ' (' + T({ en:'earlier try', th:'ครั้งก่อน' }) + ')', kind:'exam', score:h.score, max:h.total, pct:(h.percent != null ? h.percent : h.score / h.total * 100), old:true }); });
    });
    (u.grades || []).forEach(function(g){ out.push({ auto:false, id:g.id, date:g.date, title:g.title, kind:g.kind, score:g.score, max:g.max, pct:g.score / g.max * 100, note:g.note }); });
    return out;
  }
  function stats(u){
    var r = rows(u).filter(function(x){ return !x.old; });
    if(!r.length) return { n:0, avg:null, best:null };
    var s = 0, b = 0; r.forEach(function(x){ s += x.pct; if(x.pct > b) b = x.pct; });
    return { n:r.length, avg:s / r.length, best:b };
  }
  function nameOf(u){ return u.displayName || T(G.noName); }

  function load(){
    gb.err = ''; gb.busy = true; gpaint();
    Promise.all([api('GET', '/api/admin/cexam/list'), api('GET', '/api/admin/cexam/sets')]).then(function(r){
      gb.busy = false;
      if(r[0].__status === 401){ gb.err = 'key'; setKey(''); gpaint(); return; }
      if(r[0].error){ gb.err = 'net'; gpaint(); return; }
      gb.users = (r[0].users || []).sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); });
      gb.sets = {}; ((r[1] && r[1].sets) || []).forEach(function(s){ gb.sets[s.id] = s.title || s.name || s.id; });
      if(gb.sel && !gb.users.some(function(u){ return u.username === gb.sel; })) gb.sel = null;
      if(!gb.sel && gb.users.length) gb.sel = gb.users[0].username;
      gpaint();
    });
  }

  function tableHTML(list, withDel){
    if(!list.length) return '';
    return '<table class="gb-t"><thead><tr><th>' + esc(T(G.cDate)) + '</th><th>' + esc(T(G.cItem)) + '</th><th>' + esc(T(G.cKind)) + '</th><th class="r">' + esc(T(G.cScore)) + '</th><th class="r">' + esc(T(G.cPct)) + '</th><th>' + esc(T(G.cNote)) + '</th>' + (withDel ? '<th></th>' : '') + '</tr></thead><tbody>' +
      list.map(function(x){
        return '<tr' + (x.old ? ' class="old"' : '') + '><td>' + esc(fmtDate(x.date)) + '</td><td>' + esc(x.title) + '</td><td>' + esc(T(KINDS[x.kind] || KINDS.other)) + '</td><td class="r">' + esc(x.score) + ' / ' + esc(x.max) + '</td><td class="r"><b>' + Math.round(x.pct) + '</b></td><td class="n">' + esc(x.note || '') + '</td>' +
          (withDel ? '<td class="r"><button type="button" class="gb-del' + (gb.delArm === x.id ? ' arm' : '') + '" data-gb-del="' + esc(x.id) + '">' + esc(T(gb.delArm === x.id ? G.delSure : G.del)) + '</button></td>' : '') + '</tr>';
      }).join('') + '</tbody></table>';
  }

  function gpaint(){
    if(!gsec) return;
    var q = function(k){ return gsec.querySelector('[data-gb="' + k + '"]'); };
    q('eb').textContent = T(G.eb); q('h').textContent = T(G.h); q('lede').textContent = T(G.lede);
    var body = q('body');
    var active = document.activeElement;
    if(active && body.contains(active) && active.matches && active.matches('input,textarea,select') && !gb.forcePaint) return;
    gb.forcePaint = false;
    if(!key() || gb.err === 'key'){
      body.innerHTML = '<div class="gb-key"><b>' + esc(T(G.keyH)) + '</b><div class="gb-row"><input type="password" data-gb-key placeholder="' + esc(T(G.keyPh)) + '" autocomplete="off"><button type="button" class="gb-go" data-gb-act="key">' + esc(T(G.keyGo)) + '</button></div>' + (gb.err === 'key' ? '<p class="gb-err">' + esc(T(G.keyBad)) + '</p>' : '') + '</div>';
      return;
    }
    if(gb.users === null){
      body.innerHTML = '<div class="gb-empty">' + esc(T(gb.err === 'net' ? G.netErr : G.loading)) + (gb.err === 'net' ? ' <button type="button" class="gb-btn" data-gb-act="refresh">' + esc(T(G.refresh)) + '</button>' : '') + '</div>';
      if(!gb.busy && !gb.err) load();
      return;
    }
    var bar = '<div class="gb-bar"><input type="search" data-gb-q placeholder="' + esc(T(G.search)) + '" value="' + esc(gb.q) + '">' +
      '<button type="button" class="gb-btn" data-gb-act="refresh">' + esc(T(G.refresh)) + '</button>' +
      '<button type="button" class="gb-btn" data-gb-act="printClass">⎙ ' + esc(T(G.printClass)) + '</button>' +
      '<button type="button" class="gb-btn" data-gb-act="csv">⭳ ' + esc(T(G.csv)) + '</button>' +
      '<button type="button" class="gb-btn" data-gb-act="json">⭳ ' + esc(T(G.json)) + '</button></div>';
    if(!gb.users.length){ body.innerHTML = bar + '<div class="gb-empty">' + esc(T(G.none)) + '</div>'; return; }
    var qq = gb.q.trim().toLowerCase();
    var list = gb.users.filter(function(u){ return !qq || (u.username + ' ' + (u.displayName || '') + ' ' + (u.note || '')).toLowerCase().indexOf(qq) !== -1; });
    var left = '<div class="gb-list">' + list.map(function(u){
      var s = stats(u);
      return '<button type="button" class="gb-li' + (u.username === gb.sel ? ' on' : '') + '" data-gb-sel="' + esc(u.username) + '"><span class="nm">' + esc(nameOf(u)) + '</span><span class="un">' + esc(u.username) + (u.note ? ' · ' + esc(u.note) : '') + '</span>' +
        '<span class="sc">' + (s.avg == null ? '—' : Math.round(s.avg) + '%') + '<i>' + esc(gradeOf(s.avg)) + '</i></span></button>';
    }).join('') + '</div>';
    var u = gb.users.filter(function(x){ return x.username === gb.sel; })[0];
    var right = '<div class="gb-detail">';
    if(!u) right += '<div class="gb-empty">' + esc(T(G.pick)) + '</div>';
    else {
      var s = stats(u), all = rows(u);
      var autos = all.filter(function(x){ return x.auto; }), mans = all.filter(function(x){ return !x.auto; });
      autos.sort(function(a, b){ return (a.date || 0) > (b.date || 0) ? 1 : -1; }); mans.sort(function(a, b){ return a.date > b.date ? 1 : -1; });
      right += '<div class="gb-head"><div><div class="gb-nm">' + esc(nameOf(u)) + '</div><div class="gb-un">' + esc(u.username) + (u.note ? ' · ' + esc(u.note) : '') + '</div></div>' +
        '<button type="button" class="gb-btn" data-gb-act="printOne">⎙ ' + esc(T(G.printOne)) + '</button></div>' +
        '<div class="gb-kpis"><div><span>' + esc(T(G.avg)) + '</span><b>' + (s.avg == null ? '—' : Math.round(s.avg) + '%') + '</b></div><div><span>' + esc(T(G.grade)) + '</span><b>' + esc(gradeOf(s.avg)) + '</b></div><div><span>' + esc(T(G.best)) + '</span><b>' + (s.best == null ? '—' : Math.round(s.best) + '%') + '</b></div><div><span>' + esc(T(G.entries)) + '</span><b>' + s.n + '</b></div></div>' +
        '<h4>' + esc(T(G.auto)) + '</h4>' + (autos.length ? tableHTML(autos, false) : '<p class="gb-muted">' + esc(T(G.noAuto)) + '</p>') +
        '<h4>' + esc(T(G.manual)) + '</h4>' + (mans.length ? tableHTML(mans, true) : '<p class="gb-muted">' + esc(T(G.noManual)) + '</p>') +
        '<div class="gb-add"><b>' + esc(T(G.add)) + '</b><div class="gb-form">' +
          '<input type="date" data-gf="date" value="' + today() + '">' +
          '<select data-gf="kind">' + Object.keys(KINDS).map(function(k){ return '<option value="' + k + '"' + (k === 'quiz' ? ' selected' : '') + '>' + esc(T(KINDS[k])) + '</option>'; }).join('') + '</select>' +
          '<input type="text" data-gf="title" maxlength="100" placeholder="' + esc(T(G.title)) + '">' +
          '<span class="gb-sc"><input type="number" data-gf="score" min="0" step="0.5" placeholder="' + esc(T(G.cScore)) + '"> / <input type="number" data-gf="max" min="1" step="0.5" value="10" title="' + esc(T(G.max)) + '"></span>' +
          '<input type="text" data-gf="note" maxlength="240" placeholder="' + esc(T(G.note)) + '">' +
          '<button type="button" class="gb-go" data-gb-act="add">' + esc(T(G.save)) + '</button></div>' + (gb.msg ? '<p class="gb-msg">' + esc(gb.msg) + '</p>' : '') + '</div>';
    }
    right += '</div>';
    body.innerHTML = bar + '<div class="gb-grid">' + left + right + '</div>';
  }

  function printSheet(html){
    var old = document.getElementById('gbPrint'); if(old) old.remove();
    var d = document.createElement('div'); d.id = 'gbPrint'; d.innerHTML = html; document.body.appendChild(d);
    document.body.classList.add('spz-printing-gb');
    var oldTitle = document.title;
    try { if(window.__SPZ_REPORTREF) document.title = window.__SPZ_REPORTREF.make('GB'); } catch(e){}   /* PDF file name SPZ-GB-... */
    var done = false;
    function clean(){ if(done) return; done = true; document.title = oldTitle; document.body.classList.remove('spz-printing-gb'); var x = document.getElementById('gbPrint'); if(x) x.remove(); window.removeEventListener('afterprint', clean); }
    window.addEventListener('afterprint', clean);
    setTimeout(function(){ window.print(); }, 60);
    setTimeout(clean, 120000);
  }
  function sheetHead(title){
    return '<div class="gbp-top"><div><div class="gbp-org">SPACEZ TERMINAL</div><div class="gbp-sub">' + esc(T(G.repSub)) + '</div></div><div class="gbp-date">' + esc(T(G.issued)) + ' ' + esc(fmtDate(Date.now())) + '</div></div><h1>' + esc(title) + '</h1>';
  }
  function sheetFoot(){
    return '<p class="gbp-scale">' + esc(T(G.scale)) + '</p><div class="gbp-sign"><div><span></span>' + esc(T(G.teacher)) + '<br><b>Noraset Boikaw (Focus)</b></div></div>';
  }
  function printOne(u){
    var s = stats(u), all = rows(u).sort(function(a, b){ return String(a.date) > String(b.date) ? 1 : -1; });
    var t = '<table class="gbp-t"><thead><tr><th>' + esc(T(G.cDate)) + '</th><th>' + esc(T(G.cItem)) + '</th><th>' + esc(T(G.cKind)) + '</th><th class="r">' + esc(T(G.cScore)) + '</th><th class="r">%</th><th>' + esc(T(G.cNote)) + '</th></tr></thead><tbody>' +
      all.map(function(x){ return '<tr' + (x.old ? ' class="old"' : '') + '><td>' + esc(fmtDate(x.date)) + '</td><td>' + esc(x.title) + '</td><td>' + esc(T(KINDS[x.kind] || KINDS.other)) + '</td><td class="r">' + esc(x.score) + ' / ' + esc(x.max) + '</td><td class="r">' + Math.round(x.pct) + '</td><td>' + esc(x.note || '') + '</td></tr>'; }).join('') + '</tbody></table>';
    printSheet('<div class="gbp-sheet">' + sheetHead(T(G.repT)) +
      '<div class="gbp-info"><div><span>' + esc(T(G.student)) + '</span><b>' + esc(nameOf(u)) + '</b></div><div><span>' + esc(T(G.user)) + '</span><b>' + esc(u.username) + '</b></div></div>' +
      '<div class="gbp-kpi"><div><span>' + esc(T(G.avg)) + '</span><b>' + (s.avg == null ? '—' : Math.round(s.avg) + '%') + '</b></div><div><span>' + esc(T(G.grade)) + '</span><b>' + esc(gradeOf(s.avg)) + '</b></div><div><span>' + esc(T(G.best)) + '</span><b>' + (s.best == null ? '—' : Math.round(s.best) + '%') + '</b></div><div><span>' + esc(T(G.entries)) + '</span><b>' + s.n + '</b></div></div>' +
      (all.length ? t : '<p>' + esc(T(G.noManual)) + '</p>') + sheetFoot() + '</div>');
  }
  function printClass(){
    var us = gb.users || [];
    var t = '<table class="gbp-t"><thead><tr><th>#</th><th>' + esc(T(G.student)) + '</th><th>' + esc(T(G.user)) + '</th><th class="r">' + esc(T(G.entries)) + '</th><th class="r">' + esc(T(G.avg)) + '</th><th class="r">' + esc(T(G.best)) + '</th><th class="r">' + esc(T(G.grade)) + '</th></tr></thead><tbody>' +
      us.map(function(u, i){ var s = stats(u); return '<tr><td>' + (i + 1) + '</td><td>' + esc(nameOf(u)) + '</td><td>' + esc(u.username) + '</td><td class="r">' + s.n + '</td><td class="r">' + (s.avg == null ? '—' : Math.round(s.avg) + '%') + '</td><td class="r">' + (s.best == null ? '—' : Math.round(s.best) + '%') + '</td><td class="r"><b>' + esc(gradeOf(s.avg)) + '</b></td></tr>'; }).join('') + '</tbody></table>';
    printSheet('<div class="gbp-sheet">' + sheetHead(T(G.repClass)) + t + sheetFoot() + '</div>');
  }
  function csvCell(v){ v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function exportCSV(){
    var lines = [['username', 'name', 'date', 'type', 'item', 'score', 'full_marks', 'percent', 'source', 'note'].join(',')];
    (gb.users || []).forEach(function(u){
      rows(u).forEach(function(x){
        var d = typeof x.date === 'number' ? new Date(x.date).toISOString().slice(0, 10) : (x.date || '');
        lines.push([u.username, u.displayName || '', d, x.kind, x.title, x.score, x.max, Math.round(x.pct * 10) / 10, x.auto ? (x.old ? 'exam-earlier' : 'exam') : 'manual', x.note || ''].map(csvCell).join(','));
      });
    });
    download('gradebook-' + today() + '.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }
  function exportJSON(){
    var data = { exportedAt:new Date().toISOString(), sets:gb.sets, students:(gb.users || []).map(function(u){ return { username:u.username, displayName:u.displayName || '', note:u.note || '', exams:u.exams || [], grades:u.grades || [] }; }) };
    download('gradebook-backup-' + today() + '.json', JSON.stringify(data, null, 2), 'application/json');
  }

  function gwire(){
    gsec.addEventListener('click', function(ev){
      var t = ev.target;
      var sel = t.closest('[data-gb-sel]'); if(sel){ gb.sel = sel.getAttribute('data-gb-sel'); gb.msg = ''; gb.delArm = null; gb.forcePaint = true; gpaint(); return; }
      var del = t.closest('[data-gb-del]');
      if(del){
        var id = del.getAttribute('data-gb-del');
        if(gb.delArm !== id){ gb.delArm = id; gb.forcePaint = true; gpaint(); return; }
        gb.delArm = null;
        api('POST', '/api/admin/cexam/grades', { username:gb.sel, op:'del', id:id }).then(function(j){ if(j.ok) setGrades(gb.sel, j.grades); gb.forcePaint = true; gpaint(); });
        return;
      }
      var b = t.closest('[data-gb-act]'); if(!b) return;
      var a = b.getAttribute('data-gb-act');
      if(a === 'key'){ var k = gsec.querySelector('[data-gb-key]'); if(k && k.value.trim()){ setKey(k.value.trim()); gb.err = ''; gb.users = null; gb.forcePaint = true; document.activeElement && document.activeElement.blur(); gpaint(); } return; }
      if(a === 'refresh'){ gb.users = null; gb.err = ''; gb.forcePaint = true; gpaint(); return; }
      if(a === 'csv') return exportCSV();
      if(a === 'json') return exportJSON();
      if(a === 'printClass') return printClass();
      var u = (gb.users || []).filter(function(x){ return x.username === gb.sel; })[0];
      if(a === 'printOne' && u) return printOne(u);
      if(a === 'add' && u){
        var f = function(n){ var el = gsec.querySelector('[data-gf="' + n + '"]'); return el ? el.value : ''; };
        var e = { date:f('date'), kind:f('kind'), title:f('title'), score:parseFloat(f('score')), max:parseFloat(f('max')), note:f('note') };
        if(!(e.max > 0) || !(e.score >= 0) || e.score > e.max * 2){ gb.msg = T(G.badEntry); gb.forcePaint = true; gpaint(); return; }
        b.disabled = true;
        api('POST', '/api/admin/cexam/grades', { username:u.username, op:'add', entry:e }).then(function(j){
          if(j.ok){ setGrades(u.username, j.grades); gb.msg = T(G.saved); } else gb.msg = j.error === 'net' ? T(G.netErr) : T(G.badEntry);
          gb.forcePaint = true; gpaint();
        });
      }
    });
    gsec.addEventListener('input', function(ev){ if(ev.target.hasAttribute('data-gb-q')){ gb.q = ev.target.value; var pos = ev.target.selectionStart; gb.forcePaint = true; gpaint(); var s = gsec.querySelector('[data-gb-q]'); if(s){ s.focus(); try { s.setSelectionRange(pos, pos); } catch(e){} } } });
    gsec.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && ev.target.hasAttribute('data-gb-key')){ var b = gsec.querySelector('[data-gb-act="key"]'); if(b) b.click(); } });
  }
  function setGrades(un, grades){ (gb.users || []).forEach(function(u){ if(u.username === un) u.grades = grades || []; }); }

  /* =========================================================== SECURITY MAP */
  var S = {
    eb:{ en:'Admin · Security', th:'แอดมิน · ความปลอดภัย' },
    h:{ en:'Security map', th:'แผนผังความปลอดภัย' },
    lede:{ en:'How the site protects every door — follow the moving dots from left to right. Tap any box for details. Scroll or pinch to zoom, drag to move.', th:'เว็บป้องกันทุกประตูอย่างไร — ดูจุดที่วิ่งจากซ้ายไปขวา แตะกล่องไหนก็ได้เพื่อดูรายละเอียด เลื่อนลูกกลิ้งหรือถ่างนิ้วเพื่อซูม ลากเพื่อเลื่อน' },
    full:{ en:'Full screen', th:'เต็มจอ' }, exit:{ en:'Exit full screen', th:'ออกจากเต็มจอ' }, reset:{ en:'Reset view', th:'รีเซ็ตมุมมอง' },
    tip:{ en:'Tap a box', th:'แตะกล่องเพื่อดูรายละเอียด' },
    legend:{ en:'Blue = in your browser · Green = on the Cloudflare Worker (server) · Amber = the secret never leaves this step', th:'ฟ้า = ทำในเบราว์เซอร์ · เขียว = ทำบนเซิร์ฟเวอร์ Cloudflare Worker · ส้ม = ความลับไม่หลุดออกจากขั้นนี้' }
  };
  // lanes: [title, color, steps[[label_en,label_th, where('b'|'s'|'k'), detail_en, detail_th]]]
  var LANES = [
    [{ en:'Login gate (member / full access)', th:'ประตูล็อกอิน (สมาชิก / สิทธิ์เต็ม)' }, [
      ['Password typed', 'พิมพ์รหัสผ่าน', 'b', 'The password is typed in the browser and never sent anywhere.', 'รหัสผ่านพิมพ์ในเบราว์เซอร์ และไม่ถูกส่งไปที่ไหนเลย'],
      ['PBKDF2-SHA512 ×200,000', 'PBKDF2-SHA512 ×200,000', 'b', 'Stretches the password into a key. 200,000 rounds make every single guess slow for an attacker.', 'ยืดรหัสผ่านเป็นกุญแจ ทำซ้ำ 200,000 รอบ ทำให้การเดารหัสแต่ละครั้งช้ามากสำหรับผู้โจมตี'],
      ['7 rounds · random hash order', '7 รอบ · ลำดับแฮชสุ่ม', 'b', 'Each vault has its own random schedule choosing SHA-256 / 384 / 512 for every HKDF, PBKDF2 and HMAC step, with 40k–80k iterations per round.', 'แต่ละ vault มีตารางสุ่มของตัวเอง เลือก SHA-256 / 384 / 512 ให้ทุกขั้น HKDF, PBKDF2 และ HMAC และทำซ้ำ 40,000–80,000 รอบต่อรอบ'],
      ['HMAC-SHA384 seal', 'ตรา HMAC-SHA384', 'k', 'All fields of the vault are sealed together. Change a single byte and the seal fails — tampering is detected before anything is decrypted.', 'ทุกช่องของ vault ถูกปิดผนึกรวมกัน แก้แม้แต่ 1 ไบต์ ตราจะไม่ผ่าน — ตรวจจับการดัดแปลงได้ก่อนถอดรหัส'],
      ['HKDF-SHA512 → AES-CTR + AES-GCM', 'HKDF-SHA512 → AES-CTR + AES-GCM', 'b', 'Two layers of AES-256. GCM also checks integrity.', 'เข้ารหัส AES-256 สองชั้น ชั้น GCM ตรวจความถูกต้องของข้อมูลด้วย'],
      ['Access for this tab only', 'เปิดสิทธิ์เฉพาะแท็บนี้', 'b', 'The unlocked level lives in sessionStorage and disappears when the tab is closed.', 'สิทธิ์ที่ปลดล็อกเก็บใน sessionStorage และหายไปเมื่อปิดแท็บ']
    ]],
    [{ en:'Site accounts (username + password)', th:'บัญชีผู้ใช้ (ชื่อผู้ใช้ + รหัสผ่าน)' }, [
      ['Username + password', 'ชื่อผู้ใช้ + รหัสผ่าน', 'b', 'Typed on the login screen.', 'พิมพ์ในหน้าล็อกอิน'],
      ['HTTPS to the Worker', 'HTTPS ไปที่ Worker', 'b', 'Sent only over an encrypted HTTPS connection.', 'ส่งผ่านการเชื่อมต่อ HTTPS ที่เข้ารหัสเท่านั้น'],
      ['10 wrong tries → 15-min lock', 'ผิด 10 ครั้ง → ล็อก 15 นาที', 's', 'Wrong attempts are counted per network address to stop password guessing.', 'นับจำนวนครั้งที่ผิดต่อที่อยู่เครือข่าย เพื่อกันการสุ่มเดารหัส'],
      ['Salted PBKDF2-SHA256 ×100,000', 'PBKDF2-SHA256 ×100,000 + salt', 'k', 'Passwords are never stored — only a salted hash. Even the admin cannot read a password later.', 'ไม่เก็บรหัสผ่านจริง เก็บแค่ค่าแฮชที่ผสม salt แม้แต่แอดมินก็อ่านรหัสย้อนหลังไม่ได้'],
      ['Random token · 30 days', 'โทเคนสุ่ม · 30 วัน', 's', 'A random token replaces the password for later visits and expires automatically. Reset / turn off revokes it.', 'โทเคนสุ่มใช้แทนรหัสผ่านในการเข้าครั้งถัดไป และหมดอายุเอง การรีเซ็ตหรือปิดบัญชีจะยกเลิกทันที'],
      ['Role: member / editor / student', 'สิทธิ์: สมาชิก / Editor / นักเรียน', 's', 'The Worker decides what each role may read.', 'Worker เป็นผู้ตัดสินว่าแต่ละสิทธิ์อ่านอะไรได้']
    ]],
    [{ en:'Classroom & exams', th:'ห้องเรียนและการสอบ' }, [
      ['Student exam account', 'บัญชีสอบของนักเรียน', 'b', 'EW-xxxxx accounts created by the admin.', 'บัญชี EW-xxxxx ที่แอดมินสร้างให้'],
      ['Lessons kept on the server', 'บทเรียนเก็บบนเซิร์ฟเวอร์', 's', 'Lesson content is not in the public code — it is served only to signed-in readers.', 'เนื้อหาบทเรียนไม่อยู่ในโค้ดสาธารณะ ส่งให้เฉพาะผู้ที่ล็อกอินแล้ว'],
      ['Answers sealed with AES-GCM', 'เฉลยถูกปิดผนึกด้วย AES-GCM', 'k', 'Exam questions reach the browser without readable answers; the answer data is encrypted with a server-only key.', 'ข้อสอบส่งถึงเบราว์เซอร์โดยไม่มีเฉลยที่อ่านได้ ข้อมูลเฉลยเข้ารหัสด้วยกุญแจที่อยู่บนเซิร์ฟเวอร์เท่านั้น'],
      ['Graded on the server', 'ตรวจคะแนนบนเซิร์ฟเวอร์', 's', 'Scores are calculated by the Worker, so they cannot be edited in the browser.', 'Worker เป็นผู้คิดคะแนน จึงแก้คะแนนในเบราว์เซอร์ไม่ได้'],
      ['Results → admin only', 'ผลสอบ → แอดมินเท่านั้น', 's', 'Results and the gradebook are readable only with the admin key.', 'ผลสอบและสมุดคะแนนอ่านได้เฉพาะเมื่อมีรหัสแอดมิน']
    ]],
    [{ en:'Admin notes', th:'บันทึกของแอดมิน' }, [
      ['Notes written', 'เขียนบันทึก', 'b', 'Notes are edited in the browser.', 'แก้ไขบันทึกในเบราว์เซอร์'],
      ['PBKDF2-SHA512 ×400,000', 'PBKDF2-SHA512 ×400,000', 'b', 'An even slower key stretch than the login gate.', 'ยืดกุญแจช้ากว่าประตูล็อกอินอีก'],
      ['5 cascade gates', 'Cascade 5 ชั้น', 'b', 'HKDF-SHA384 → AES-CTR → PBKDF2-SHA256 ×120,000 → HMAC-SHA512, five times.', 'HKDF-SHA384 → AES-CTR → PBKDF2-SHA256 ×120,000 → HMAC-SHA512 ทำ 5 ชั้น'],
      ['AES-CTR + AES-GCM', 'AES-CTR + AES-GCM', 'k', 'Double AES-256; GCM detects any tampering.', 'AES-256 สองชั้น GCM ตรวจจับการดัดแปลง'],
      ['Only ciphertext is stored', 'เก็บแค่ข้อมูลที่เข้ารหัสแล้ว', 'b', 'The public repository only ever holds the encrypted vault.', 'ใน repository สาธารณะมีแค่ vault ที่เข้ารหัสแล้ว']
    ]],
    [{ en:'Editor code (read-only)', th:'รหัส Editor (อ่านอย่างเดียว)' }, [
      ['Editor code typed', 'พิมพ์รหัส Editor', 'b', 'Or an editor account signs in.', 'หรือบัญชีที่มีสิทธิ์ Editor ล็อกอิน'],
      ['Sent in a header', 'ส่งใน header', 'b', 'Sent with each request over HTTPS.', 'ส่งไปกับทุกคำขอผ่าน HTTPS'],
      ['PBKDF2-SHA256 ×100,000 check', 'ตรวจด้วย PBKDF2-SHA256 ×100,000', 'k', 'Compared against a stored salted hash — the code itself is not stored.', 'เทียบกับค่าแฮชที่ผสม salt — ไม่เก็บตัวรหัสจริง'],
      ['Read-only endpoints', 'อ่านได้อย่างเดียว', 's', 'Only four read (GET) endpoints accept it.', 'ใช้ได้กับคำขอแบบอ่าน (GET) 4 ตัวเท่านั้น'],
      ['Every write refused', 'ห้ามเขียนทุกกรณี', 's', 'All add / edit / delete actions still need the admin key.', 'การเพิ่ม / แก้ / ลบ ทุกอย่างยังต้องใช้รหัสแอดมิน']
    ]],
    [{ en:'Admin key', th:'รหัสแอดมิน' }, [
      ['Typed once per session', 'พิมพ์ครั้งเดียวต่อเซสชัน', 'b', 'Kept in sessionStorage — gone when the tab closes.', 'เก็บใน sessionStorage — หายเมื่อปิดแท็บ'],
      ['HTTPS header', 'ส่งใน header ผ่าน HTTPS', 'b', 'Sent only to the site’s own Worker.', 'ส่งไปเฉพาะ Worker ของเว็บเท่านั้น'],
      ['Cloudflare secret', 'ความลับใน Cloudflare', 'k', 'Compared with a secret stored in Cloudflare — it is never in the code or the public repository.', 'เทียบกับค่าลับที่เก็บใน Cloudflare — ไม่เคยอยู่ในโค้ดหรือ repository สาธารณะ'],
      ['Write access', 'สิทธิ์แก้ไขข้อมูล', 's', 'Only this key can create accounts, change lessons, edit grades or revoke certificates.', 'มีแค่รหัสนี้ที่สร้างบัญชี แก้บทเรียน แก้คะแนน หรือยกเลิกเกียรติบัตรได้']
    ]]
  ];
  var sm = { k:1, x:0, y:0, sel:null };
  var ssec = null;
  var VW = 1640, LH = 150, TOP = 70;
  function smSVG(){
    var h = TOP + LANES.length * LH + 20, out = '';
    out += '<defs><filter id="smGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<marker id="smArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="sm-arrh"/></marker></defs>';
    LANES.forEach(function(lane, li){
      var y = TOP + li * LH, steps = lane[1], n = steps.length;
      var x0 = 290, gap = (VW - x0 - 40) / n, bw = Math.min(200, gap - 40), bh = 74;
      out += '<rect x="20" y="' + (y + 6) + '" width="' + (VW - 40) + '" height="' + (LH - 12) + '" rx="18" class="sm-lane"></rect>';
      out += '<text x="44" y="' + (y + LH / 2 - 4) + '" class="sm-lt">' + esc(T(lane[0])).replace(/ \(/, '</text><text x="44" y="' + (y + LH / 2 + 18) + '" class="sm-lt2">(') + '</text>';
      for(var i = 0; i < n; i++){
        var s = steps[i], bx = x0 + i * gap + (gap - bw) / 2, by = y + (LH - bh) / 2;
        if(i < n - 1){
          var ax = bx + bw, nx = x0 + (i + 1) * gap + (gap - bw) / 2, cy = y + LH / 2;
          out += '<path d="M' + (ax + 4) + ' ' + cy + ' L' + (nx - 6) + ' ' + cy + '" class="sm-edge" marker-end="url(#smArr)"></path>';
          out += '<path d="M' + (ax + 4) + ' ' + cy + ' L' + (nx - 6) + ' ' + cy + '" class="sm-flow" style="animation-delay:' + ((li * 0.35 + i * 0.5) % 3).toFixed(2) + 's"></path>';
        }
        var id = li + '-' + i;
        out += '<g class="sm-node sm-' + s[2] + (sm.sel === id ? ' on' : '') + '" data-sm="' + id + '" tabindex="0">' +
          '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="14"></rect>' +
          '<text x="' + (bx + bw / 2) + '" y="' + (by + 22) + '" class="sm-i">' + (s[2] === 'k' ? '🔒' : s[2] === 's' ? '☁' : '◉') + '</text>' +
          wrapText(L() === 'th' ? s[1] : s[0], bx + bw / 2, by + 44, bw - 20) + '</g>';
      }
    });
    return '<svg class="sm-svg" viewBox="0 0 ' + VW + ' ' + h + '" preserveAspectRatio="xMidYMid meet"><g data-sm-view transform="translate(' + sm.x + ' ' + sm.y + ') scale(' + sm.k + ')">' + out + '</g></svg>';
  }
  function wrapText(t, cx, y, w){
    var max = Math.max(10, Math.floor(w / 8.4)), words = String(t).split(' '), lines = [], cur = '';
    words.forEach(function(wd){ if((cur + ' ' + wd).trim().length > max && cur){ lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); });
    if(cur) lines.push(cur);
    lines = lines.slice(0, 2);
    return lines.map(function(l, i){ return '<text x="' + cx + '" y="' + (y + i * 17) + '" class="sm-t">' + esc(l) + '</text>'; }).join('');
  }
  function smDetail(){
    if(!sm.sel) return '<div class="sm-detail sm-hint">' + esc(T(S.tip)) + '</div>';
    var p = sm.sel.split('-'), lane = LANES[+p[0]], s = lane[1][+p[1]];
    return '<div class="sm-detail"><span class="sm-dl">' + esc(T(lane[0])) + ' · ' + (+p[1] + 1) + '/' + lane[1].length + '</span><b>' + esc(L() === 'th' ? s[1] : s[0]) + '</b><p>' + esc(L() === 'th' ? s[4] : s[3]) + '</p></div>';
  }
  function spaint(){
    if(!ssec) return;
    var q = function(k){ return ssec.querySelector('[data-sm-x="' + k + '"]'); };
    q('eb').textContent = T(S.eb); q('h').textContent = T(S.h); q('lede').textContent = T(S.lede);
    var isFs = document.fullscreenElement === q('stage');
    q('stage').innerHTML = '<div class="sm-tools"><button type="button" data-sm-act="in">＋</button><button type="button" data-sm-act="out">－</button><button type="button" data-sm-act="reset">' + esc(T(S.reset)) + '</button><button type="button" data-sm-act="fs">' + esc(T(isFs ? S.exit : S.full)) + '</button></div>' +
      smSVG() + smDetail() + '<div class="sm-legend">' + esc(T(S.legend)) + '</div>';
  }
  function applyView(){ var g = ssec && ssec.querySelector('[data-sm-view]'); if(g) g.setAttribute('transform', 'translate(' + sm.x + ' ' + sm.y + ') scale(' + sm.k + ')'); }
  function zoomAt(f, px, py){ var nk = Math.max(0.6, Math.min(4, sm.k * f)); f = nk / sm.k; sm.x = px - (px - sm.x) * f; sm.y = py - (py - sm.y) * f; sm.k = nk; applyView(); }
  function svgPoint(ev){
    var svg = ssec.querySelector('.sm-svg'); if(!svg) return { x:0, y:0 };
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sc = Math.min(r.width / vb.width, r.height / vb.height);
    var ox = (r.width - vb.width * sc) / 2, oy = (r.height - vb.height * sc) / 2;
    return { x:(ev.clientX - r.left - ox) / sc, y:(ev.clientY - r.top - oy) / sc, sc:sc };
  }
  function swire(){
    var stage = ssec.querySelector('[data-sm-x="stage"]');
    var drag = null, pts = {}, pinch = null, moved = false;
    stage.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-sm-act]');
      if(b){
        var a = b.getAttribute('data-sm-act'), svg = ssec.querySelector('.sm-svg'), vb = svg.viewBox.baseVal;
        if(a === 'in') zoomAt(1.25, vb.width / 2, vb.height / 2);
        else if(a === 'out') zoomAt(0.8, vb.width / 2, vb.height / 2);
        else if(a === 'reset'){ sm.k = 1; sm.x = 0; sm.y = 0; applyView(); }
        else if(a === 'fs'){
          if(document.fullscreenElement) document.exitFullscreen();
          else if(stage.requestFullscreen) stage.requestFullscreen().catch(function(){ stage.classList.toggle('sm-pseudo-fs'); });
          else stage.classList.toggle('sm-pseudo-fs');
        }
        return;
      }
      if(moved) return;
      var n = ev.target.closest('[data-sm]');
      sm.sel = n ? (sm.sel === n.getAttribute('data-sm') ? null : n.getAttribute('data-sm')) : sm.sel;
      if(n){ ssec.querySelectorAll('.sm-node').forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-sm') === sm.sel); }); var d = ssec.querySelector('.sm-detail'); if(d) d.outerHTML = smDetail(); }
    });
    stage.addEventListener('wheel', function(ev){ if(!ev.target.closest('.sm-svg')) return; ev.preventDefault(); var p = svgPoint(ev); zoomAt(ev.deltaY < 0 ? 1.12 : 0.89, p.x, p.y); }, { passive:false });
    stage.addEventListener('pointerdown', function(ev){
      if(!ev.target.closest('.sm-svg')) return;
      pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY };
      var ids = Object.keys(pts);
      moved = false;
      if(ids.length === 1) drag = { x:ev.clientX, y:ev.clientY, sx:sm.x, sy:sm.y };
      else if(ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d:Math.hypot(a.x - b.x, a.y - b.y), k:sm.k }; drag = null; }
    });
    window.addEventListener('pointermove', function(ev){
      if(!pts[ev.pointerId]) return;
      pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY };
      var ids = Object.keys(pts);
      if(pinch && ids.length === 2){
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), mid = svgPoint({ clientX:(a.x + b.x) / 2, clientY:(a.y + b.y) / 2 });
        zoomAt((pinch.k * d / pinch.d) / sm.k, mid.x, mid.y); moved = true; return;
      }
      if(drag){
        var p = svgPoint(ev), sc = p.sc || 1;
        var dx = (ev.clientX - drag.x) / sc, dy = (ev.clientY - drag.y) / sc;
        if(Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        sm.x = drag.sx + dx; sm.y = drag.sy + dy; applyView();
      }
    });
    function up(ev){ delete pts[ev.pointerId]; if(Object.keys(pts).length < 2) pinch = null; if(!Object.keys(pts).length){ drag = null; setTimeout(function(){ moved = false; }, 0); } }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    document.addEventListener('fullscreenchange', function(){ spaint(); });
  }

  /* =========================================================== build both pages */
  function build(){
    if(document.getElementById('gradebook')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    gsec = document.createElement('section'); gsec.id = 'gradebook'; gsec.setAttribute('data-route', 'gradebook');
    gsec.innerHTML = '<div class="gb-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-gb="eb"></span></div><h2 data-gb="h"></h2><p class="lede" data-gb="lede"></p><div class="rule"></div></div><div data-gb="body"></div></div>';
    document.body.appendChild(gsec);
    ssec = document.createElement('section'); ssec.id = 'secmap'; ssec.setAttribute('data-route', 'secmap');
    ssec.innerHTML = '<div class="sm-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-sm-x="eb"></span></div><h2 data-sm-x="h"></h2><p class="lede" data-sm-x="lede"></p><div class="rule"></div></div><div class="sm-stage" data-sm-x="stage"></div></div>';
    document.body.appendChild(ssec);
    window.__spzAddRoute({ id:'gradebook', feat:true, after:'connectedusers', t:G.h, d:{ en:'Scores and results for every classroom student. Admin only.', th:'คะแนนและผลสอบของนักเรียนทุกคน เฉพาะแอดมิน' } });
    window.__spzAddRoute({ id:'secmap', feat:true, after:'gradebook', t:S.h, d:{ en:'An animated map of how the site is protected. Admin only.', th:'แผนผังเคลื่อนไหวแสดงการป้องกันของเว็บ เฉพาะแอดมิน' } });
    gwire(); swire(); gpaint(); spaint();
    new MutationObserver(function(){ gb.forcePaint = true; gpaint(); spaint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    window.addEventListener('hashchange', function(){ if(location.hash === '#/gradebook' && gb.users === null){ gb.forcePaint = true; gpaint(); } });
    return true;
  }
  function boot(){ var tries = 0; var iv = setInterval(function(){ if(build() || ++tries > 80) clearInterval(iv); }, 400); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1300); });
  else setTimeout(boot, 1300);
})();
