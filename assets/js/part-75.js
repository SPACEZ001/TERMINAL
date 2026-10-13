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

  /* =========================================================== SECURITY MAP (Round AO v2: motion graphic) */
  var S = {
    eb:{ en:'Admin · Security', th:'แอดมิน · ความปลอดภัย' },
    h:{ en:'Security map', th:'แผนผังความปลอดภัย' },
    lede:{ en:'A moving picture of how the site protects every door. It plays like a short film — press pause to explore on your own: drag to move, scroll or pinch to zoom, tap any step for details.', th:'ภาพเคลื่อนไหวแสดงว่าเว็บป้องกันทุกประตูอย่างไร เล่นเองเหมือนวิดีโอสั้น กดหยุดแล้วสำรวจเองได้: ลากเพื่อเลื่อน เลื่อนลูกกลิ้งหรือถ่างนิ้วเพื่อซูม แตะขั้นไหนก็ได้เพื่อดูรายละเอียด' },
    full:{ en:'Full screen', th:'เต็มจอ' }, exit:{ en:'Exit', th:'ออก' }, all:{ en:'Overview', th:'ภาพรวม' },
    play:{ en:'Play', th:'เล่น' }, pause:{ en:'Pause', th:'หยุด' },
    lgB:{ en:'In the browser', th:'ทำในเบราว์เซอร์' }, lgS:{ en:'On the server (Cloudflare Worker)', th:'ทำบนเซิร์ฟเวอร์ (Cloudflare Worker)' }, lgK:{ en:'The secret is locked here', th:'ความลับถูกล็อกไว้ที่ขั้นนี้' },
    ovT:{ en:'Six doors, one rule', th:'หกประตู กฎเดียว' },
    ovS:{ en:'Nothing secret is ever stored in plain text — only slow hashes and encrypted vaults.', th:'ไม่มีความลับใดถูกเก็บเป็นข้อความธรรมดา — มีแค่ค่าแฮชที่คำนวณช้าและ vault ที่เข้ารหัสแล้ว' },
    order:{ en:'This vault’s round order', th:'ลำดับการทำงานของ vault นี้' }
  };
  /* steps: [en, th, where b|s|k, icon, detail en, detail th] */
  var LANES = [
    { t:{ en:'Login gate', th:'ประตูล็อกอิน' }, s:{ en:'The member / full-access password opens an encrypted vault in the browser.', th:'รหัสสมาชิก / สิทธิ์เต็ม ใช้เปิด vault ที่เข้ารหัสไว้ในเบราว์เซอร์' }, perm:true, steps:[
      ['Password typed', 'พิมพ์รหัสผ่าน', 'b', 'user', 'Typed in the browser. It is never sent anywhere.', 'พิมพ์ในเบราว์เซอร์ และไม่ถูกส่งไปที่ไหนเลย'],
      ['PBKDF2-SHA512 ×200k', 'PBKDF2-SHA512 ×200k', 'b', 'hash', 'Stretches the password into a key. 200,000 rounds make every guess slow.', 'ยืดรหัสผ่านเป็นกุญแจ ทำซ้ำ 200,000 รอบ ทำให้การเดาแต่ละครั้งช้ามาก'],
      ['12 shuffled rounds', 'สลับลำดับ 12 รอบ', 'b', 'shuffle', 'Four operations — A stretch (PBKDF2), B mix (HMAC), C gate (HKDF → AES-CTR seed), D expand (HKDF) — run in a different order every round (ABCD, ACBD, BDAC …), each with its own randomly chosen SHA-256 / 384 / 512. The order is unique to every vault.', 'สี่ขั้นตอน — A ยืดกุญแจ (PBKDF2), B ผสม (HMAC), C ประตู (HKDF → AES-CTR), D ขยาย (HKDF) — สลับลำดับใหม่ทุกรอบ (ABCD, ACBD, BDAC …) และสุ่มชนิดแฮช SHA-256 / 384 / 512 ให้แต่ละขั้น ลำดับนี้ไม่ซ้ำกันเลยในแต่ละ vault'],
      ['HMAC-SHA384 seal', 'ตรา HMAC-SHA384', 'k', 'shield', 'Every field of the vault is sealed together. Change one byte and the seal fails before anything is decrypted.', 'ทุกช่องของ vault ถูกปิดผนึกรวมกัน แก้แม้ 1 ไบต์ ตราจะไม่ผ่านตั้งแต่ก่อนถอดรหัส'],
      ['AES-CTR + CBC + GCM', 'AES-CTR + CBC + GCM', 'k', 'layers', 'Three layers of AES-256. The GCM layer checks integrity a second time.', 'เข้ารหัส AES-256 สามชั้น ชั้น GCM ตรวจความถูกต้องซ้ำอีกรอบ'],
      ['Unlocked for this tab', 'ปลดล็อกเฉพาะแท็บนี้', 'b', 'check', 'The access level lives in sessionStorage and disappears when the tab closes.', 'สิทธิ์ที่ปลดล็อกเก็บใน sessionStorage และหายไปเมื่อปิดแท็บ']
    ] },
    { t:{ en:'Site accounts', th:'บัญชีผู้ใช้' }, s:{ en:'Username + password accounts created by the admin.', th:'บัญชีชื่อผู้ใช้ + รหัสผ่านที่แอดมินสร้างให้' }, steps:[
      ['Username + password', 'ชื่อผู้ใช้ + รหัสผ่าน', 'b', 'user', 'Typed on the sign-in form.', 'พิมพ์ในหน้าล็อกอิน'],
      ['HTTPS to the Worker', 'ส่งผ่าน HTTPS', 'b', 'globe', 'Sent only over an encrypted connection.', 'ส่งผ่านการเชื่อมต่อที่เข้ารหัสเท่านั้น'],
      ['10 wrong → 15-min lock', 'ผิด 10 ครั้ง ล็อก 15 นาที', 's', 'clock', 'Wrong attempts are counted per network address.', 'นับครั้งที่ผิดต่อที่อยู่เครือข่าย กันการสุ่มเดา'],
      ['Salted PBKDF2 ×100k', 'PBKDF2 ×100k + salt', 'k', 'hash', 'Only a salted hash is stored. Nobody can read a password back.', 'เก็บแค่ค่าแฮชผสม salt ไม่มีใครอ่านรหัสย้อนกลับได้'],
      ['Random 30-day token', 'โทเคนสุ่ม 30 วัน', 's', 'key', 'Replaces the password on later visits; reset or turn-off revokes it.', 'ใช้แทนรหัสผ่านครั้งต่อไป รีเซ็ตหรือปิดบัญชีแล้วยกเลิกทันที'],
      ['Role decides access', 'สิทธิ์กำหนดการเข้าถึง', 's', 'server', 'The Worker decides what member, editor and student may read.', 'Worker ตัดสินว่าสมาชิก Editor และนักเรียนอ่านอะไรได้']
    ] },
    { t:{ en:'Classroom & exams', th:'ห้องเรียนและการสอบ' }, s:{ en:'Lessons and answers never sit in the public code.', th:'บทเรียนและเฉลยไม่อยู่ในโค้ดสาธารณะ' }, steps:[
      ['Student account', 'บัญชีนักเรียน', 'b', 'user', 'EW-xxxxx exam accounts made by the admin.', 'บัญชีสอบ EW-xxxxx ที่แอดมินสร้าง'],
      ['Lessons on the server', 'บทเรียนอยู่บนเซิร์ฟเวอร์', 's', 'server', 'Served only to signed-in readers.', 'ส่งให้เฉพาะผู้ที่ล็อกอินแล้ว'],
      ['Answers sealed AES-GCM', 'เฉลยปิดผนึก AES-GCM', 'k', 'lock', 'Answer data is encrypted with a key that exists only on the server.', 'ข้อมูลเฉลยเข้ารหัสด้วยกุญแจที่มีแค่บนเซิร์ฟเวอร์'],
      ['Graded on the server', 'ตรวจคะแนนบนเซิร์ฟเวอร์', 's', 'check', 'Scores cannot be edited in the browser.', 'แก้คะแนนในเบราว์เซอร์ไม่ได้'],
      ['Results: admin only', 'ผลสอบ: แอดมินเท่านั้น', 's', 'shield', 'Results and the gradebook need the admin key.', 'ผลสอบและสมุดคะแนนต้องใช้รหัสแอดมิน']
    ] },
    { t:{ en:'Admin notes', th:'บันทึกแอดมิน' }, s:{ en:'Private notes live only as ciphertext.', th:'บันทึกส่วนตัวเก็บแบบเข้ารหัสเท่านั้น' }, steps:[
      ['Notes written', 'เขียนบันทึก', 'b', 'doc', 'Edited in the browser.', 'แก้ไขในเบราว์เซอร์'],
      ['PBKDF2-SHA512 ×400k', 'PBKDF2-SHA512 ×400k', 'b', 'hash', 'An even slower stretch than the login gate.', 'ยืดกุญแจช้ากว่าประตูล็อกอินอีก'],
      ['5 cascade gates', 'Cascade 5 ชั้น', 'b', 'layers', 'HKDF-SHA384 → AES-CTR → PBKDF2 ×120k → HMAC-SHA512, five times.', 'HKDF-SHA384 → AES-CTR → PBKDF2 ×120k → HMAC-SHA512 ห้าชั้น'],
      ['AES-CTR + AES-GCM', 'AES-CTR + AES-GCM', 'k', 'lock', 'Double AES-256 with tamper detection.', 'AES-256 สองชั้น ตรวจจับการดัดแปลง'],
      ['Only ciphertext stored', 'เก็บแค่ข้อมูลเข้ารหัส', 'b', 'shield', 'The public repository only ever holds the encrypted vault.', 'repository สาธารณะมีแค่ vault ที่เข้ารหัสแล้ว']
    ] },
    { t:{ en:'Editor access', th:'สิทธิ์ Editor' }, s:{ en:'Read-only access for helpers.', th:'สิทธิ์อ่านอย่างเดียวสำหรับผู้ช่วย' }, steps:[
      ['Editor code or account', 'รหัสหรือบัญชี Editor', 'b', 'user', 'An editor code, or an account with the editor role.', 'รหัส Editor หรือบัญชีที่มีสิทธิ์ Editor'],
      ['Sent over HTTPS', 'ส่งผ่าน HTTPS', 'b', 'globe', 'Sent with each request.', 'ส่งไปกับทุกคำขอ'],
      ['PBKDF2 ×100k check', 'ตรวจ PBKDF2 ×100k', 'k', 'hash', 'Compared with a stored salted hash.', 'เทียบกับค่าแฮชผสม salt ที่เก็บไว้'],
      ['Read-only', 'อ่านได้อย่างเดียว', 's', 'eye', 'Only read requests are accepted.', 'รับเฉพาะคำขอแบบอ่าน'],
      ['Writes refused', 'ห้ามเขียนทุกกรณี', 's', 'block', 'Every add / edit / delete still needs the admin key.', 'เพิ่ม / แก้ / ลบ ทุกอย่างต้องใช้รหัสแอดมิน']
    ] },
    { t:{ en:'Admin key', th:'รหัสแอดมิน' }, s:{ en:'The master key for every change — hashed, rate-limited and replaceable.', th:'กุญแจหลักของทุกการแก้ไข — เก็บแบบแฮช จำกัดการเดา และเปลี่ยนได้' }, steps:[
      ['Typed once per tab', 'พิมพ์ครั้งเดียวต่อแท็บ', 'b', 'key', 'Kept in sessionStorage; gone when the tab closes.', 'เก็บใน sessionStorage หายเมื่อปิดแท็บ'],
      ['Distinct-guess lockout', 'ล็อกเมื่อเดาผิดหลายแบบ', 's', 'clock', '30 different wrong keys in 15 minutes locks that network address for 15 minutes.', 'เดาผิด 30 แบบใน 15 นาที ล็อกที่อยู่เครือข่ายนั้น 15 นาที'],
      ['PBKDF2 ×210k hash', 'แฮช PBKDF2 ×210k', 'k', 'hash', 'After you set a new key, only its salted hash is stored — compared in constant time.', 'เมื่อเปลี่ยนรหัสใหม่ จะเก็บแค่ค่าแฮชผสม salt และเปรียบเทียบแบบเวลาคงที่'],
      ['Old key retired', 'รหัสเก่าใช้ไม่ได้', 's', 'block', 'The moment a new key is set, the old one stops working.', 'ทันทีที่ตั้งรหัสใหม่ รหัสเก่าใช้ไม่ได้อีก'],
      ['Write access', 'สิทธิ์แก้ไขข้อมูล', 's', 'check', 'Only this key can create accounts, change lessons, edit grades or revoke certificates.', 'มีแค่รหัสนี้ที่สร้างบัญชี แก้บทเรียน แก้คะแนน หรือยกเลิกเกียรติบัตรได้']
    ] }
  ];
  var ICON = {
    user:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>',
    hash:'<path d="M9 3 7 21M17 3l-2 18M4 9h16M3 15h16"/>',
    shuffle:'<path d="M3 7h4l10 10h4"/><path d="M3 17h4l3-3"/><path d="M14 10l3-3h4"/><path d="M18 4l3 3-3 3"/><path d="M18 14l3 3-3 3"/>',
    shield:'<path d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9.5C7.4 20.2 4 16.6 4 12V6l8-3z"/><path d="M8.5 12l2.4 2.4 4.6-4.8"/>',
    layers:'<path d="M12 3 2.5 8 12 13l9.5-5L12 3z"/><path d="M2.5 12.5 12 17.5l9.5-5"/><path d="M2.5 17 12 22l9.5-5"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M7.5 12.3l3 3 6-6.3"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    key:'<circle cx="7.5" cy="14.5" r="4"/><path d="M10.5 11.5 20 2M16 6l3 3M14 8l2 2"/>',
    server:'<rect x="4" y="3.5" width="16" height="7" rx="2"/><rect x="4" y="13.5" width="16" height="7" rx="2"/><path d="M8 7h.01M8 17h.01"/>',
    lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    block:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'
  };
  var VW = 1680, LH = 168, TOP = 40, X0 = 300, NW = 196, NH = 70;
  var sm = { k:0.86, x:117.6, y:126, sel:null, ch:0, playing:true, timer:null, anim:null, permTimer:null };
  var ssec = null;
  function laneY(i){ return TOP + i * LH; }
  function nodePos(li, i){ var n = LANES[li].steps.length, gap = (VW - X0 - 40) / n; return { x:X0 + i * gap + (gap - NW) / 2, y:laneY(li) + (LH - NH) / 2 - 8 }; }
  function smSVG(){
    var H = TOP + LANES.length * LH + 30, out = '', dur = 6;
    out += '<defs>' +
      '<pattern id="smGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" class="sm-gridl"/></pattern>' +
      '<linearGradient id="smSweep" x1="0" x2="1"><stop offset="0" stop-color="#11b8e8" stop-opacity="0"/><stop offset=".5" stop-color="#11b8e8" stop-opacity=".07"/><stop offset="1" stop-color="#11b8e8" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="smDot"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#7fe3ff"/><stop offset="1" stop-color="#11b8e8" stop-opacity="0"/></radialGradient>' +
      '<filter id="smGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';
    out += '<rect x="0" y="0" width="' + VW + '" height="' + H + '" fill="url(#smGrid)"/>';
    out += '<rect class="sm-sweep" x="-400" y="0" width="400" height="' + H + '" fill="url(#smSweep)"/>';
    LANES.forEach(function(L, li){
      var y = laneY(li), n = L.steps.length, cy = y + LH / 2 - 8;
      out += '<g class="sm-lane-g" data-lane="' + li + '">';
      out += '<rect x="16" y="' + (y + 8) + '" width="' + (VW - 32) + '" height="' + (LH - 16) + '" rx="20" class="sm-lane"/>';
      out += '<text x="44" y="' + (y + 52) + '" class="sm-ln">' + ('0' + (li + 1)).slice(-2) + '</text>';
      out += '<text x="44" y="' + (y + 82) + '" class="sm-lt">' + esc(T(L.t)) + '</text>';
      out += wrapText(T(L.s), 44, y + 104, 230, 'sm-ls', 3, 6.6);
      var p0 = nodePos(li, 0), pN = nodePos(li, n - 1);
      var d = 'M' + (p0.x + NW / 2) + ' ' + cy + ' L' + (pN.x + NW / 2) + ' ' + cy;
      out += '<path d="' + d + '" class="sm-rail"/>';
      out += '<path d="' + d + '" class="sm-beam" style="animation-duration:' + dur + 's;animation-delay:' + (li * 0.45) + 's"/>';
      out += '<circle r="9" fill="url(#smDot)" class="sm-pkt"><animateMotion dur="' + dur + 's" begin="' + (li * 0.45) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
      for(var i = 0; i < n; i++){
        var s = L.steps[i], p = nodePos(li, i), id = li + '-' + i;
        var delay = (li * 0.45 + dur * i / Math.max(1, n - 1)).toFixed(2);
        out += '<g class="sm-node sm-' + s[2] + (sm.sel === id ? ' on' : '') + '" data-sm="' + id + '" tabindex="0">' +
          '<rect x="' + p.x + '" y="' + p.y + '" width="' + NW + '" height="' + NH + '" rx="14" class="sm-card"/>' +
          '<rect x="' + p.x + '" y="' + p.y + '" width="' + NW + '" height="' + NH + '" rx="14" class="sm-flash" style="animation-duration:' + dur + 's;animation-delay:' + delay + 's"/>' +
          '<circle cx="' + (p.x + 30) + '" cy="' + (p.y + NH / 2) + '" r="17" class="sm-ib"/>' +
          '<g transform="translate(' + (p.x + 19) + ' ' + (p.y + NH / 2 - 11) + ') scale(.92)" class="sm-ic">' + (ICON[s[3]] || ICON.check) + '</g>' +
          wrapText((L_() === 'th' ? s[1] : s[0]), p.x + 56, p.y + NH / 2 - 3, NW - 64, 'sm-t', 2, 7.2, true) +
          '<text x="' + (p.x + NW - 10) + '" y="' + (p.y + 14) + '" class="sm-step">' + (i + 1) + '</text>' +
          '</g>';
      }
      if(L.perm) out += '<g class="sm-perm" data-sm-perm transform="translate(' + (nodePos(li, 2).x - 8) + ' ' + (y + LH - 38) + ')"></g>';
      out += '</g>';
    });
    return '<svg class="sm-svg" viewBox="0 0 ' + VW + ' ' + H + '" preserveAspectRatio="xMidYMid meet"><g data-sm-view transform="translate(' + sm.x + ' ' + sm.y + ') scale(' + sm.k + ')">' + out + '</g></svg>';
  }
  function L_(){ return L(); }
  function wrapText(t, x, y, w, cls, maxLines, cw, left){
    var max = Math.max(8, Math.floor(w / (cw || 8))), words = String(t).split(' '), lines = [], cur = '';
    words.forEach(function(wd){ if((cur + ' ' + wd).trim().length > max && cur){ lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); });
    if(cur) lines.push(cur);
    lines = lines.slice(0, maxLines || 2);
    var off = left ? -(lines.length - 1) * 8 : 0;
    return lines.map(function(l, i){ return '<text x="' + x + '" y="' + (y + off + i * 16 + 5) + '" class="' + cls + '">' + esc(l) + '</text>'; }).join('');
  }
  /* the shuffled-order strip under the login lane: re-rolls every second to show that every vault runs its own order */
  var PERM24 = (function(){ var out = []; function go(p, r){ if(!r.length){ out.push(p); return; } for(var i = 0; i < r.length; i++) go(p + r[i], r.slice(0, i) + r.slice(i + 1)); } go('', 'ABCD'); return out; })();
  function rollPerm(){
    var g = ssec && ssec.querySelector('[data-sm-perm]'); if(!g) return;
    var h = '<text x="0" y="-8" class="sm-pl">' + esc(T(S.order)) + '</text>';
    for(var r = 0; r < 12; r++){
      var o = PERM24[Math.floor(Math.random() * 24)];
      h += '<g transform="translate(' + (r * 72) + ' 0)"><rect width="64" height="22" rx="6" class="sm-pb"/>' +
        o.split('').map(function(c, j){ return '<text x="' + (10 + j * 14) + '" y="15.5" class="sm-pc sm-pc-' + c + '">' + c + '</text>'; }).join('') + '</g>';
    }
    g.innerHTML = h;
  }
  function smDetail(){
    if(!sm.sel){
      var L0 = sm.ch > 0 ? LANES[sm.ch - 1] : null;
      return '<div class="sm-cap"><span class="sm-cap-n">' + (L0 ? ('0' + sm.ch).slice(-2) + ' / 06' : '00 / 06') + '</span><b>' + esc(L0 ? T(L0.t) : T(S.ovT)) + '</b><p>' + esc(L0 ? T(L0.s) : T(S.ovS)) + '</p></div>';
    }
    var p = sm.sel.split('-'), lane = LANES[+p[0]], s = lane.steps[+p[1]];
    return '<div class="sm-cap sm-cap-d"><span class="sm-cap-n">' + esc(T(lane.t)) + ' · ' + (+p[1] + 1) + '/' + lane.steps.length + '</span><b>' + esc(L() === 'th' ? s[1] : s[0]) + '</b><p>' + esc(L() === 'th' ? s[5] : s[4]) + '</p></div>';
  }
  function controlsHTML(){
    var isFs = document.fullscreenElement && ssec && document.fullscreenElement === ssec.querySelector('[data-sm-x="stage"]');
    var dots = '';
    for(var i = 0; i <= LANES.length; i++) dots += '<button type="button" class="sm-dot' + (sm.ch === i ? ' on' : '') + '" data-sm-ch="' + i + '" aria-label="' + (i ? esc(T(LANES[i - 1].t)) : esc(T(S.all))) + '"></button>';
    var pp = sm.playing ? '<svg viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>';
    return '<div class="sm-bar"><button type="button" class="sm-btn sm-pp" data-sm-act="play" aria-label="' + esc(T(sm.playing ? S.pause : S.play)) + '">' + pp + '</button>' +
      '<button type="button" class="sm-btn" data-sm-act="prev" aria-label="prev"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<div class="sm-dots">' + dots + '</div>' +
      '<button type="button" class="sm-btn" data-sm-act="next" aria-label="next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<span class="sm-sp"></span>' +
      '<button type="button" class="sm-btn" data-sm-act="out" aria-label="zoom out"><svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>' +
      '<button type="button" class="sm-btn" data-sm-act="in" aria-label="zoom in"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>' +
      '<button type="button" class="sm-btn sm-txt" data-sm-act="fs">' + esc(T(isFs ? S.exit : S.full)) + '</button></div>' +
      '<div class="sm-prog"><i style="animation-duration:' + (sm.playing ? CH_MS : 0) + 'ms"></i></div>';
  }
  var CH_MS = 7000;
  function spaint(){
    if(!ssec) return;
    var q = function(k){ return ssec.querySelector('[data-sm-x="' + k + '"]'); };
    q('eb').textContent = T(S.eb); q('h').textContent = T(S.h); q('lede').textContent = T(S.lede);
    q('stage').innerHTML = smSVG() + '<div class="sm-hud">' + smDetail() + '</div>' + controlsHTML() +
      '<div class="sm-legend"><span class="b"></span>' + esc(T(S.lgB)) + '<span class="s"></span>' + esc(T(S.lgS)) + '<span class="k"></span>' + esc(T(S.lgK)) + '</div>';
    rollPerm(); markLanes();
    keyPaint();
  }
  function repaintUI(){
    var st = ssec && ssec.querySelector('[data-sm-x="stage"]'); if(!st) return;
    var hud = st.querySelector('.sm-hud'); if(hud) hud.innerHTML = smDetail();
    var bar = st.querySelector('.sm-bar'), prog = st.querySelector('.sm-prog');
    if(bar){ var tmp = document.createElement('div'); tmp.innerHTML = controlsHTML(); bar.replaceWith(tmp.children[0]); if(prog) prog.replaceWith(tmp.children[0]); }
    ssec.querySelectorAll('.sm-node').forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-sm') === sm.sel); });
    markLanes();
  }
  function markLanes(){ if(!ssec) return; ssec.querySelectorAll('.sm-lane-g').forEach(function(g){ var li = +g.getAttribute('data-lane'); g.classList.toggle('dim', sm.ch > 0 && li !== sm.ch - 1); }); }
  function applyView(){ var g = ssec && ssec.querySelector('[data-sm-view]'); if(g) g.setAttribute('transform', 'translate(' + sm.x.toFixed(2) + ' ' + sm.y.toFixed(2) + ') scale(' + sm.k.toFixed(4) + ')'); }
  function targetFor(ch){
    if(!ch){ var sv = ssec.querySelector('.sm-svg').viewBox.baseVal, k0 = 0.86; return { k:k0, x:(sv.width - VW * k0) / 2, y:sv.height * 0.11 }; }
    var svg = ssec.querySelector('.sm-svg'), vb = svg.viewBox.baseVal, y = laneY(ch - 1);
    var k = Math.min(vb.width / (VW - 20), vb.height / (LH * 1.6)), cyL = y + LH / 2;
    return { k:k, x:(vb.width - VW * k) / 2, y:vb.height / 2 - cyL * k };
  }
  function flyTo(t, ms){
    if(sm.anim) cancelAnimationFrame(sm.anim);
    var a = { k:sm.k, x:sm.x, y:sm.y }, t0 = performance.now();
    function ease(u){ return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
    function step(now){
      var u = Math.min(1, (now - t0) / (ms || 1100)), e = ease(u);
      sm.k = a.k + (t.k - a.k) * e; sm.x = a.x + (t.x - a.x) * e; sm.y = a.y + (t.y - a.y) * e; applyView();
      if(u < 1) sm.anim = requestAnimationFrame(step);
    }
    sm.anim = requestAnimationFrame(step);
  }
  function goCh(ch, keepPlay){
    sm.ch = (ch + LANES.length + 1) % (LANES.length + 1); sm.sel = null;
    flyTo(targetFor(sm.ch)); repaintUI();
    if(keepPlay !== false && sm.playing) schedule();
  }
  function schedule(){ clearTimeout(sm.timer); if(sm.playing && onSm()) sm.timer = setTimeout(function(){ goCh(sm.ch + 1); }, CH_MS); }
  function onSm(){ return location.hash === '#/secmap'; }
  function stopPlay(){ if(sm.playing){ sm.playing = false; clearTimeout(sm.timer); repaintUI(); } }
  function zoomAt(f, px, py){ var nk = Math.max(0.5, Math.min(5, sm.k * f)); f = nk / sm.k; sm.x = px - (px - sm.x) * f; sm.y = py - (py - sm.y) * f; sm.k = nk; applyView(); }
  function svgPoint(ev){
    var svg = ssec.querySelector('.sm-svg'); if(!svg) return { x:0, y:0, sc:1 };
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sc = Math.min(r.width / vb.width, r.height / vb.height);
    var ox = (r.width - vb.width * sc) / 2, oy = (r.height - vb.height * sc) / 2;
    return { x:(ev.clientX - r.left - ox) / sc, y:(ev.clientY - r.top - oy) / sc, sc:sc };
  }
  function swire(){
    var stage = ssec.querySelector('[data-sm-x="stage"]');
    var drag = null, pts = {}, pinch = null, moved = false;
    stage.addEventListener('click', function(ev){
      var dot = ev.target.closest('[data-sm-ch]'); if(dot){ goCh(+dot.getAttribute('data-sm-ch')); return; }
      var b = ev.target.closest('[data-sm-act]');
      if(b){
        var a = b.getAttribute('data-sm-act'), svg = ssec.querySelector('.sm-svg'), vb = svg.viewBox.baseVal;
        if(a === 'play'){ sm.playing = !sm.playing; sm.sel = null; if(sm.playing){ goCh(sm.ch); } else { clearTimeout(sm.timer); repaintUI(); } }
        else if(a === 'prev') goCh(sm.ch - 1);
        else if(a === 'next') goCh(sm.ch + 1);
        else if(a === 'in'){ stopPlay(); zoomAt(1.25, vb.width / 2, vb.height / 2); }
        else if(a === 'out'){ stopPlay(); zoomAt(0.8, vb.width / 2, vb.height / 2); }
        else if(a === 'fs'){
          if(document.fullscreenElement) document.exitFullscreen();
          else if(stage.requestFullscreen) stage.requestFullscreen().catch(function(){ stage.classList.toggle('sm-pseudo-fs'); repaintUI(); });
          else { stage.classList.toggle('sm-pseudo-fs'); repaintUI(); }
        }
        return;
      }
      if(moved) return;
      var n = ev.target.closest('[data-sm]');
      if(n){ stopPlay(); sm.sel = sm.sel === n.getAttribute('data-sm') ? null : n.getAttribute('data-sm'); repaintUI(); }
    });
    stage.addEventListener('wheel', function(ev){ if(!ev.target.closest('.sm-svg')) return; ev.preventDefault(); stopPlay(); var p = svgPoint(ev); zoomAt(ev.deltaY < 0 ? 1.12 : 0.89, p.x, p.y); }, { passive:false });
    stage.addEventListener('pointerdown', function(ev){
      if(!ev.target.closest('.sm-svg')) return;
      pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY };
      var ids = Object.keys(pts); moved = false;
      if(ids.length === 1) drag = { x:ev.clientX, y:ev.clientY, sx:sm.x, sy:sm.y };
      else if(ids.length === 2){ var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d:Math.hypot(a.x - b.x, a.y - b.y), k:sm.k }; drag = null; }
    });
    window.addEventListener('pointermove', function(ev){
      if(!pts[ev.pointerId]) return;
      pts[ev.pointerId] = { x:ev.clientX, y:ev.clientY };
      var ids = Object.keys(pts);
      if(pinch && ids.length === 2){
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), mid = svgPoint({ clientX:(a.x + b.x) / 2, clientY:(a.y + b.y) / 2 });
        stopPlay(); zoomAt((pinch.k * d / pinch.d) / sm.k, mid.x, mid.y); moved = true; return;
      }
      if(drag){
        var p = svgPoint(ev), sc = p.sc || 1, dx = (ev.clientX - drag.x) / sc, dy = (ev.clientY - drag.y) / sc;
        if(Math.abs(dx) + Math.abs(dy) > 3){ moved = true; stopPlay(); }
        if(moved){ sm.x = drag.sx + dx; sm.y = drag.sy + dy; applyView(); }
      }
    });
    function up(ev){ delete pts[ev.pointerId]; if(Object.keys(pts).length < 2) pinch = null; if(!Object.keys(pts).length){ drag = null; setTimeout(function(){ moved = false; }, 0); } }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    document.addEventListener('fullscreenchange', function(){ repaintUI(); });
    window.addEventListener('hashchange', function(){ if(onSm()){ if(sm.playing) schedule(); } else clearTimeout(sm.timer); });
    if(!sm.permTimer) sm.permTimer = setInterval(function(){ if(onSm() && !document.hidden) rollPerm(); }, 1100);
    schedule();
    ssec.addEventListener('click', keyClick);
  }

  /* ---------------- change the admin key (Worker: /api/admin/key/rotate) ---------------- */
  var K = {
    h:{ en:'Change the admin key', th:'เปลี่ยนรหัสแอดมิน' },
    p:{ en:'Type the current key and a new one here — never send a key in a chat or a message. The old key stops working the moment the new one is saved.', th:'พิมพ์รหัสปัจจุบันและรหัสใหม่ที่นี่ — ห้ามส่งรหัสทางแชตหรือข้อความ เมื่อบันทึกรหัสใหม่ รหัสเก่าจะใช้ไม่ได้ทันที' },
    cur:{ en:'Current admin key', th:'รหัสแอดมินปัจจุบัน' }, nw:{ en:'New admin key', th:'รหัสแอดมินใหม่' }, cf:{ en:'Type the new key again', th:'พิมพ์รหัสใหม่อีกครั้ง' },
    gen:{ en:'Make a strong key for me', th:'สุ่มรหัสที่แข็งแรงให้' }, go:{ en:'Save the new key', th:'บันทึกรหัสใหม่' },
    rule:{ en:'At least 16 characters, with letters and numbers.', th:'อย่างน้อย 16 ตัวอักษร มีทั้งตัวอักษรและตัวเลข' },
    mismatch:{ en:'The two new keys are not the same.', th:'รหัสใหม่สองช่องไม่ตรงกัน' }, weak:{ en:'Too weak — see the rule above.', th:'รหัสอ่อนเกินไป — ดูเงื่อนไขด้านบน' },
    bad:{ en:'The current key is not correct (or this address is locked for 15 minutes).', th:'รหัสปัจจุบันไม่ถูกต้อง (หรือถูกล็อก 15 นาที)' },
    noWorker:{ en:'The Worker on Cloudflare is an older version — deploy line-qr-worker_NEW.js first.', th:'Worker บน Cloudflare ยังเป็นเวอร์ชันเก่า — deploy ไฟล์ line-qr-worker_NEW.js ก่อนนะคะ' },
    ok:{ en:'Saved. The old key no longer works. Keep the new key somewhere safe.', th:'บันทึกแล้ว รหัสเก่าใช้ไม่ได้แล้ว เก็บรหัสใหม่ไว้ในที่ปลอดภัยนะคะ' },
    st0:{ en:'Status: using the key stored in Cloudflare.', th:'สถานะ: ใช้รหัสที่ตั้งไว้ใน Cloudflare' }, st1:{ en:'Status: changed from this page on', th:'สถานะ: เปลี่ยนจากหน้านี้เมื่อ' },
    rec:{ en:'Forgot the new key? Change ADMIN_USERS_KEY in the Cloudflare dashboard — that value then works again.', th:'ลืมรหัสใหม่? เปลี่ยนค่า ADMIN_USERS_KEY ในหน้า Cloudflare แล้วใช้ค่านั้นเข้าได้อีกครั้ง' },
    copy:{ en:'Copy', th:'คัดลอก' }, copied:{ en:'Copied', th:'คัดลอกแล้ว' }
  };
  var ks = { status:null, msg:'', ok:false, busy:false };
  function keyStatus(){
    if(!key()){ ks.status = null; return; }
    api('GET', '/api/admin/key/status').then(function(j){ ks.status = j.__status === 404 ? 'old' : (j.error ? null : j); keyPaint(); });
  }
  function keyPaint(){
    var box = ssec && ssec.querySelector('[data-sm-x="key"]'); if(!box) return;
    var act = document.activeElement; if(act && box.contains(act) && act.tagName === 'INPUT' && !ks.force) return;
    ks.force = false;
    var st = ks.status === 'old' ? T(K.noWorker) : (ks.status && ks.status.rotated ? T(K.st1) + ' ' + fmtDate(ks.status.at) : (ks.status ? T(K.st0) : ''));
    box.innerHTML = '<div class="smk-h"><svg viewBox="0 0 24 24">' + ICON.key + '</svg><b>' + esc(T(K.h)) + '</b></div><p class="smk-p">' + esc(T(K.p)) + '</p>' +
      (st ? '<p class="smk-st">' + esc(st) + '</p>' : '') +
      '<div class="smk-g"><label>' + esc(T(K.cur)) + '<input type="password" data-k="cur" autocomplete="off"></label>' +
      '<label>' + esc(T(K.nw)) + '<input type="text" data-k="nw" autocomplete="off" spellcheck="false"></label>' +
      '<label>' + esc(T(K.cf)) + '<input type="text" data-k="cf" autocomplete="off" spellcheck="false"></label></div>' +
      '<p class="smk-rule">' + esc(T(K.rule)) + '</p>' +
      '<div class="smk-row"><button type="button" class="gb-btn" data-k-act="gen">' + esc(T(K.gen)) + '</button><button type="button" class="gb-go" data-k-act="go"' + (ks.busy ? ' disabled' : '') + '>' + esc(T(K.go)) + '</button></div>' +
      (ks.msg ? '<p class="smk-msg ' + (ks.ok ? 'ok' : 'bad') + '">' + esc(ks.msg) + '</p>' : '') +
      '<p class="smk-rec">' + esc(T(K.rec)) + '</p>';
  }
  function strongKey(){
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', r = window.crypto.getRandomValues(new Uint8Array(28)), s = '';
    for(var i = 0; i < r.length; i++){ s += a[r[i] % a.length]; if(i % 7 === 6 && i < 27) s += '-'; }
    if(!/[0-9]/.test(s)) s += '7';
    return s;
  }
  function keyClick(ev){
    var b = ev.target.closest('[data-k-act]'); if(!b) return;
    var box = ssec.querySelector('[data-sm-x="key"]'), v = function(n){ var el = box.querySelector('[data-k="' + n + '"]'); return el ? el.value : ''; };
    if(b.getAttribute('data-k-act') === 'gen'){
      var k = strongKey(); box.querySelector('[data-k="nw"]').value = k; box.querySelector('[data-k="cf"]').value = k; return;
    }
    var cur = v('cur').trim(), nw = v('nw').trim(), cf = v('cf').trim();
    if(nw !== cf){ ks.msg = T(K.mismatch); ks.ok = false; ks.force = true; keyPaint(); return; }
    if(nw.length < 16 || !/[A-Za-z]/.test(nw) || !/[0-9]/.test(nw)){ ks.msg = T(K.weak); ks.ok = false; ks.force = true; keyPaint(); return; }
    ks.busy = true;
    fetch(WORKER_BASE + '/api/admin/key/rotate', { method:'POST', headers:{ 'X-Admin-Key':cur, 'Content-Type':'application/json' }, body:JSON.stringify({ newKey:nw }) })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j.__status = r.status; return j; }); })
      .catch(function(){ return { error:'net' }; })
      .then(function(j){
        ks.busy = false;
        if(j.ok){ setKey(nw); ks.msg = T(K.ok); ks.ok = true; ks.status = { rotated:true, at:j.at }; }
        else if(j.__status === 404){ ks.msg = T(K.noWorker); ks.ok = false; }
        else if(j.error === 'weak_key'){ ks.msg = T(K.weak); ks.ok = false; }
        else { ks.msg = T(K.bad); ks.ok = false; }
        ks.force = true; keyPaint();
      });
  }

  /* =========================================================== build both pages */
  function build(){
    if(document.getElementById('gradebook')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    gsec = document.createElement('section'); gsec.id = 'gradebook'; gsec.setAttribute('data-route', 'gradebook');
    gsec.innerHTML = '<div class="gb-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-gb="eb"></span></div><h2 data-gb="h"></h2><p class="lede" data-gb="lede"></p><div class="rule"></div></div><div data-gb="body"></div></div>';
    document.body.appendChild(gsec);
    ssec = document.createElement('section'); ssec.id = 'secmap'; ssec.setAttribute('data-route', 'secmap');
    ssec.innerHTML = '<div class="sm-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-sm-x="eb"></span></div><h2 data-sm-x="h"></h2><p class="lede" data-sm-x="lede"></p><div class="rule"></div></div><div class="sm-stage" data-sm-x="stage"></div><div class="smk" data-sm-x="key"></div></div>';
    document.body.appendChild(ssec);
    window.__spzAddRoute({ id:'gradebook', feat:true, after:'connectedusers', t:G.h, d:{ en:'Scores and results for every classroom student. Admin only.', th:'คะแนนและผลสอบของนักเรียนทุกคน เฉพาะแอดมิน' } });
    window.__spzAddRoute({ id:'secmap', feat:true, after:'gradebook', t:S.h, d:{ en:'An animated map of how the site is protected. Admin only.', th:'แผนผังเคลื่อนไหวแสดงการป้องกันของเว็บ เฉพาะแอดมิน' } });
    gwire(); spaint(); swire(); gpaint(); keyStatus();
    new MutationObserver(function(){ gb.forcePaint = true; gpaint(); spaint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    window.addEventListener('hashchange', function(){ if(location.hash === '#/gradebook' && gb.users === null){ gb.forcePaint = true; gpaint(); } if(location.hash === '#/secmap'){ keyStatus(); } });
    return true;
  }
  function boot(){ var tries = 0; var iv = setInterval(function(){ if(build() || ++tries > 80) clearInterval(iv); }, 400); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1300); });
  else setTimeout(boot, 1300);
})();
