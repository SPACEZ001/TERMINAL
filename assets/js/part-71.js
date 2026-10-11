/* ============================================================================
   SPACEZ TERMINAL -- Round AH: Classroom Exam (#/classexam)
   ----------------------------------------------------------------------------
   Teacher-issued logins, one attempt per login. Everything is graded on the
   Worker (see CLASSROOM EXAM in line-qr-worker.js), so the correct answers
   never reach the page until the student has submitted.
     Student  : username + password -> answer all questions -> score + review
     Admin    : (full tier) generate usernames/passwords with copy buttons and
                a note per student, manage the question bank + settings, read
                every result, reset an attempt, delete a login.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_CLASSEXAM) return;
  window.__SPZ_CLASSEXAM = true;

  var WORKER = 'https://spacez-line-link.spacezblack.workers.dev';
  var KEY_STORE = 'spz_admin_users_key';
  var ANS_STORE = 'spz_cex_ans';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function ss(k, v){
    try { if(v === undefined) return sessionStorage.getItem(k); if(v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch(e){}
    return null;
  }

  var U = {
    eb:{en:'Classroom',th:'ห้องเรียน'}, h:{en:'Classroom Exam',th:'ข้อสอบห้องเรียน'},
    lede:{en:'Enter the username and password your teacher gave you. You can take the exam once.',th:'ใส่ชื่อผู้ใช้และรหัสผ่านที่ครูให้ สอบได้ครั้งเดียว'},
    user:{en:'Username',th:'ชื่อผู้ใช้'}, pass:{en:'Password',th:'รหัสผ่าน'}, login:{en:'Log in',th:'เข้าสู่ระบบ'},
    badLogin:{en:'Wrong username or password.',th:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'},
    tooMany:{en:'Too many wrong attempts. Wait 15 minutes and try again.',th:'ใส่ผิดหลายครั้งเกินไป รอ 15 นาทีแล้วลองใหม่'},
    netErr:{en:'Could not reach the server. Try again.',th:'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง'},
    hello:{en:'Hello',th:'สวัสดี'}, qs:{en:'questions',th:'ข้อ'}, minutes:{en:'minutes',th:'นาที'}, noLimit:{en:'No time limit',th:'ไม่จำกัดเวลา'},
    rules:{en:'Once you press Start the timer runs and you cannot take the exam again. Pick one answer per question, then submit.',th:'เมื่อกดเริ่ม เวลาจะเดินและสอบซ้ำไม่ได้ เลือกคำตอบข้อละ 1 ตัวเลือก แล้วกดส่งคำตอบ'},
    start:{en:'Start exam',th:'เริ่มสอบ'}, resume:{en:'Continue exam',th:'ทำข้อสอบต่อ'},
    noQ:{en:'The exam is not ready yet. Ask your teacher.',th:'ข้อสอบยังไม่พร้อม ถามครูผู้สอน'},
    timeLeft:{en:'Time left',th:'เวลาที่เหลือ'}, answered:{en:'Answered',th:'ตอบแล้ว'},
    submit:{en:'Submit answers',th:'ส่งคำตอบ'}, sure:{en:'Press again to confirm',th:'กดอีกครั้งเพื่อยืนยัน'}, unans:{en:'unanswered',th:'ข้อที่ยังไม่ตอบ'},
    done:{en:'Exam finished',th:'สอบเสร็จแล้ว'}, score:{en:'Score',th:'คะแนน'}, passed:{en:'Passed',th:'ผ่าน'}, notPassed:{en:'Not passed yet',th:'ยังไม่ผ่านเกณฑ์'},
    passAt:{en:'Pass mark',th:'เกณฑ์ผ่าน'}, late:{en:'Submitted after the time limit.',th:'ส่งหลังหมดเวลา'},
    review:{en:'Review',th:'ทบทวนข้อสอบ'}, yours:{en:'Your answer',th:'คำตอบของคุณ'}, correct:{en:'Correct answer',th:'คำตอบที่ถูก'}, none:{en:'No answer',th:'ไม่ได้ตอบ'},
    opensOn:{en:'Next exam opens on', th:'ข้อสอบครั้งถัดไปจะเปิดวันที่'}, notOpenYet:{en:'This exam is not open yet.', th:'ข้อสอบยังไม่เปิด ยังเริ่มทำไม่ได้'}, colOpen:{en:'Opens on', th:'เปิดสอบวันที่'}, openAuto:{en:'opens automatically', th:'เปิดเองอัตโนมัติ'},
    logout:{en:'Log out',th:'ออกจากระบบ'}, already:{en:'This login has already been used.',th:'รหัสนี้สอบไปแล้ว'},
    /* admin */
    adminBtn:{en:'Teacher panel',th:'หน้าครู (แอดมิน)'}, studentBtn:{en:'Student view',th:'หน้านักเรียน'},
    needKey:{en:'Enter the admin key to open the teacher panel.',th:'ใส่รหัสแอดมินเพื่อเปิดหน้าครู'}, keyPh:{en:'Admin key',th:'รหัสแอดมิน'}, unlock:{en:'Unlock',th:'ปลดล็อก'},
    badKey:{en:'Wrong admin key.',th:'รหัสแอดมินไม่ถูกต้อง'},
    tUsers:{en:'Students',th:'นักเรียน'}, tBank:{en:'Questions',th:'คำถาม'}, tSettings:{en:'Settings',th:'ตั้งค่า'},
    gen:{en:'Generate login',th:'สร้างรหัสผู้ใช้'}, genCount:{en:'How many',th:'จำนวน'}, genNote:{en:'Note (e.g. student name)',th:'โน้ต (เช่น ชื่อนักเรียน)'},
    newCreds:{en:'New logins — copy them now',th:'รหัสที่สร้างใหม่ — คัดลอกได้เลย'}, copy:{en:'Copy',th:'คัดลอก'}, copied:{en:'Copied',th:'คัดลอกแล้ว'}, copyAll:{en:'Copy all',th:'คัดลอกทั้งหมด'},
    colUser:{en:'Username',th:'ชื่อผู้ใช้'}, colPass:{en:'Password',th:'รหัสผ่าน'}, colNote:{en:'Note',th:'โน้ต'}, colStatus:{en:'Status',th:'สถานะ'}, colScore:{en:'Score',th:'คะแนน'},
    sNew:{en:'Not started',th:'ยังไม่สอบ'}, sStarted:{en:'In progress',th:'กำลังสอบ'}, sDone:{en:'Finished',th:'สอบแล้ว'},
    view:{en:'Result',th:'ดูผล'}, reset:{en:'Allow retake',th:'ให้สอบใหม่'}, del:{en:'Delete',th:'ลบ'}, delSure:{en:'Confirm delete',th:'ยืนยันลบ'},
    noUsers:{en:'No logins yet. Press “Generate login”.',th:'ยังไม่มีรหัส กด “สร้างรหัสผู้ใช้”'},
    show:{en:'Show',th:'แสดง'}, hide:{en:'Hide',th:'ซ่อน'}, refresh:{en:'Refresh',th:'รีเฟรช'},
    addQ:{en:'Add question',th:'เพิ่มคำถาม'}, samples:{en:'Insert 5 sample questions',th:'ใส่คำถามตัวอย่าง 5 ข้อ'}, saveBank:{en:'Save',th:'บันทึก'}, saved:{en:'Saved',th:'บันทึกแล้ว'},
    qText:{en:'Question',th:'โจทย์'}, choice:{en:'Choice',th:'ตัวเลือก'}, addChoice:{en:'+ choice',th:'+ ตัวเลือก'}, expl:{en:'Explanation (shown after submit)',th:'เฉลย/คำอธิบาย (แสดงหลังส่ง)'},
    topic:{en:'Topic (optional)',th:'หัวข้อ (ไม่บังคับ)'}, correctMark:{en:'Correct',th:'ถูก'}, qNo:{en:'Question',th:'ข้อ'},
    noBankQ:{en:'No questions yet.',th:'ยังไม่มีคำถาม'},
    sTitle:{en:'Exam title',th:'ชื่อชุดข้อสอบ'}, sTime:{en:'Time limit (minutes, 0 = none)',th:'เวลาสอบ (นาที, 0 = ไม่จำกัด)'}, sShuffle:{en:'Shuffle question order for each student',th:'สลับลำดับข้อสำหรับนักเรียนแต่ละคน'}, sPass:{en:'Pass mark (%)',th:'เกณฑ์ผ่าน (%)'},
    totalQ:{en:'questions in the bank',th:'ข้อในคลัง'}, saveFail:{en:'Could not save.',th:'บันทึกไม่สำเร็จ'}, loading:{en:'Loading…',th:'กำลังโหลด…'},
    attempts:{en:'Earlier attempts',th:'ครั้งก่อนหน้า'}, close:{en:'Close',th:'ปิด'},
    oldWorker:{en:'The Cloudflare Worker is still the old version (no classroom-exam endpoints). Paste the new line-qr-worker.js into Cloudflare and Deploy, then press Refresh.',th:'Worker บน Cloudflare ยังเป็นไฟล์เก่า (ยังไม่มีระบบข้อสอบห้องเรียน) — ให้วางไฟล์ line-qr-worker.js ตัวใหม่ใน Cloudflare แล้วกด Deploy จากนั้นกดรีเฟรชที่นี่'},
    adminNet:{en:'Could not reach the Worker. If you have not yet pasted the new line-qr-worker.js into Cloudflare (Deploy), do that first, then press Refresh.',th:'ติดต่อ Worker ไม่ได้ — ถ้ายังไม่ได้วางไฟล์ line-qr-worker.js ตัวใหม่ใน Cloudflare (แล้วกด Deploy) ให้ทำก่อน จากนั้นกดรีเฟรชที่นี่'},
    skillLbl:{en:'Linked skill (for Student Evaluation)',th:'ทักษะที่เชื่อมกับการประเมิน (Student Evaluation)'}, noSkill:{en:'— none —',th:'— ไม่เชื่อม —'},
    impJson:{en:'Import JSON',th:'นำเข้า JSON'}, expJson:{en:'Export JSON',th:'ส่งออก JSON'}, impOk:{en:'Imported',th:'นำเข้าแล้ว'}, impBad:{en:'Not a valid question file.',th:'ไฟล์คำถามไม่ถูกต้อง'}, impNote:{en:'Imported questions are added to the list. Press Save to publish.',th:'คำถามที่นำเข้าจะถูกเพิ่มต่อท้าย แล้วกด “บันทึก” เพื่อใช้งานจริง'}
  };

  var SAMPLES = [
    { q:'ในโครงสร้างอิมพัลส์ (impulse) เวฟ 2 ย้อนกลับได้ไม่เกินเท่าใดของเวฟ 1?', choices:['ไม่เกิน 50%','ไม่เกิน 100% (ห้ามต่ำกว่าจุดเริ่มเวฟ 1)','ไม่เกิน 161.8%','ย้อนได้ไม่จำกัด'], ans:1, expl:'กฎข้อ 1 ของอิมพัลส์: เวฟ 2 ห้ามย้อนกลับเกินจุดเริ่มต้นของเวฟ 1', topic:'กฎอิมพัลส์' },
    { q:'ข้อใดถูกต้องเกี่ยวกับเวฟ 3 ในอิมพัลส์?', choices:['เวฟ 3 ต้องยาวที่สุดเสมอ','เวฟ 3 ห้ามสั้นที่สุดในบรรดาเวฟ 1, 3, 5','เวฟ 3 ต้องสั้นกว่าเวฟ 1','เวฟ 3 ต้องเท่ากับเวฟ 5'], ans:1, expl:'เวฟ 3 อาจไม่ใช่เวฟที่ยาวที่สุด แต่ห้ามเป็นเวฟที่สั้นที่สุดในสามเวฟขับเคลื่อน', topic:'กฎอิมพัลส์' },
    { q:'ในอิมพัลส์มาตรฐาน (ไม่ใช่ไดอะโกนัล) เวฟ 4 ควรทำอย่างไรกับพื้นที่ราคาของเวฟ 1?', choices:['ซ้อนทับ (overlap) ได้เสมอ','ห้ามเข้าไปซ้อนทับพื้นที่ราคาของเวฟ 1','ต้องปิดต่ำกว่าเวฟ 1','ไม่เกี่ยวข้องกัน'], ans:1, expl:'กฎข้อ 3: เวฟ 4 ห้ามเข้าไปในพื้นที่ราคาของเวฟ 1 (ยกเว้นรูปแบบไดอะโกนัล)', topic:'กฎอิมพัลส์' },
    { q:'คลื่นแก้ (corrective) แบบพื้นฐานติดป้ายเป็นลำดับใด?', choices:['1-2-3-4-5','A-B-C','W-X-Y เท่านั้น','I-II-III'], ans:1, expl:'คลื่นแก้แบบพื้นฐาน เช่น ซิกแซก และแฟลต ติดป้ายเป็น A-B-C', topic:'รูปแบบคลื่นแก้' },
    { q:'เวฟ 2 มักย้อนกลับของเวฟ 1 ที่ระดับฟีโบนัชชีใดบ่อยที่สุด?', choices:['0-10%','50% ถึง 61.8%','100% ขึ้นไป','161.8% ขึ้นไป'], ans:1, expl:'แนวทาง (guideline): เวฟ 2 มักย้อนลึก โดยพบมากที่ราว 50%–61.8% ของเวฟ 1 (เป็นแนวทาง ไม่ใช่กฎตายตัว)', topic:'ฟีโบนัชชี' }
  ];

  var SKILLS = [['ew1','EW1 พื้นฐานการนับเวฟ'],['ew2','EW2 กฎ 3 ข้ออิมพัลส์'],['ew3','EW3 แนวทาง (guidelines)'],['ew4','EW4 รูปแบบการแก้'],['ew5','EW5 ฟีโบนัชชี'],['ew6','EW6 ระดับเวฟ/ป้าย'],['ew7','EW7 อ่านกราฟจริง'],['ew8','EW8 จุดยกเลิก/แผนเทรด'],
    ['ot1','OT1 เทรนด์/แนวรับต้าน'],['ot2','OT2 บริหารความเสี่ยง'],['ot3','OT3 พื้นฐาน/มหภาค'],['ot4','OT4 วินัย/จิตวิทยา'],['ot5','OT5 การมีส่วนร่วม'],['ot6','OT6 การบ้าน']];
  var sec = null, bodyEl = null;
  var isAdminTier = false;
  var mode = 'student';
  // student
  var sv = { stage:'login', err:'', busy:false, token:'', username:'', info:null, exam:null, answers:{}, deadline:0, result:null, confirm:false };
  var timerIv = null;
  // admin
  var adm = { key:'', keyErr:false, tab:'users', users:null, bank:null, loading:false, msg:'', newCreds:null, view:null, revealed:{}, delArm:'', dirty:false, err:'' };

  function api(path, method, payload, key){
    var opt = { method: method || 'GET', headers: {} };
    if(payload){ opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(payload); }
    if(key) opt.headers['X-Admin-Key'] = key;
    return fetch(WORKER + path, opt).then(function(r){
      return r.json().then(function(j){ return { status:r.status, j:j }; }, function(){ return { status:r.status, j:{} }; });
    });
  }
  function copyText(text, btn){
    function ok(){ if(btn){ var o = btn.getAttribute('data-lbl') || btn.textContent; btn.setAttribute('data-lbl', o); btn.textContent = T(U.copied); setTimeout(function(){ btn.textContent = o; }, 1200); } }
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(ok, fallback); return; }
    } catch(e){}
    fallback();
    function fallback(){
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch(e){} document.body.removeChild(ta); ok();
    }
  }
  function tier(){ try { return window.__SPZ_TIER ? window.__SPZ_TIER() : ''; } catch(e){ return ''; } }
  function pad2(n){ return n < 10 ? '0' + n : '' + n; }
  function fmtMs(ms){ var s = Math.max(0, Math.round(ms / 1000)); return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }
  function fmtDay(t){ var d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); }
  function dayVal(t){ if(!t) return ''; var d = new Date(t); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function isClosed(i){ return !!(i && i.openAt && i.openAt > Date.now()); }
  function fmtDate(t){ if(!t) return '—'; var d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }

  /* ---------------------------------------------------------------- student */
  function doLogin(user, pass){
    sv.busy = true; sv.err = ''; paint();
    api('/api/cexam/login', 'POST', { username:user, password:pass }).then(function(r){
      sv.busy = false;
      if(r.status === 200){
        sv.token = r.j.token; sv.username = r.j.username; sv.info = r.j;
        if(r.j.status === 'done'){ sv.result = r.j.result; sv.stage = 'result'; }
        else sv.stage = 'ready';
      } else sv.err = r.status === 429 ? T(U.tooMany) : (r.status === 401 ? T(U.badLogin) : T(U.netErr));
      paint();
    }).catch(function(){ sv.busy = false; sv.err = T(U.netErr); paint(); });
  }
  function startExam(){
    sv.busy = true; sv.err = ''; paint();
    api('/api/cexam/start', 'POST', { token:sv.token }).then(function(r){
      sv.busy = false;
      if(r.status === 200){
        sv.exam = r.j; sv.stage = 'exam'; sv.confirm = false;
        try { sv.answers = JSON.parse(ss(ANS_STORE) || '{}') || {}; } catch(e){ sv.answers = {}; }
        sv.deadline = r.j.remainingMs == null ? 0 : Date.now() + r.j.remainingMs;
        startTimer();
      } else if(r.status === 409){ sv.err = T(U.already); }
      else if(r.status === 503){ sv.err = T(U.noQ); }
      else if(r.status === 403 && r.j && r.j.error === 'not_open'){ if(sv.info) sv.info.openAt = r.j.openAt; sv.err = ''; }
      else if(r.status === 401){ logoutStudent(); return; }
      else sv.err = T(U.netErr);
      paint();
    }).catch(function(){ sv.busy = false; sv.err = T(U.netErr); paint(); });
  }
  function submitExam(){
    stopTimer(); sv.busy = true; paint();
    api('/api/cexam/submit', 'POST', { token:sv.token, answers:sv.answers }).then(function(r){
      sv.busy = false;
      if(r.status === 200){ sv.result = r.j; sv.stage = 'result'; ss(ANS_STORE, null); }
      else if(r.status === 409){ sv.err = T(U.already); sv.stage = 'login'; }
      else { sv.err = T(U.netErr); if(sv.deadline) startTimer(); }
      paint();
    }).catch(function(){ sv.busy = false; sv.err = T(U.netErr); startTimer(); paint(); });
  }
  function logoutStudent(){
    stopTimer(); sv = { stage:'login', err:'', busy:false, token:'', username:'', info:null, exam:null, answers:{}, deadline:0, result:null, confirm:false };
    ss(ANS_STORE, null); paint();
  }
  function startTimer(){
    stopTimer();
    if(!sv.deadline) return;
    timerIv = setInterval(function(){
      var el = sec && sec.querySelector('[data-cx="timer"]');
      var left = sv.deadline - Date.now();
      if(el) el.textContent = fmtMs(left);
      if(left <= 0){ stopTimer(); submitExam(); }
    }, 500);
  }
  function stopTimer(){ if(timerIv){ clearInterval(timerIv); timerIv = null; } }

  function studentHTML(){
    if(sv.stage === 'login'){
      return '<div class="cx2-card cx2-narrow">' +
        '<label class="cx2-lab">' + esc(T(U.user)) + '</label><input class="cx2-in" data-cx="user" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="EW-XXXXX">' +
        '<label class="cx2-lab">' + esc(T(U.pass)) + '</label><input class="cx2-in" type="password" data-cx="pass" autocomplete="off" spellcheck="false">' +
        (sv.err ? '<div class="cx2-err">' + esc(sv.err) + '</div>' : '') +
        '<button class="cx2-btn" data-cx="login"' + (sv.busy ? ' disabled' : '') + '>' + esc(T(U.login)) + '</button></div>';
    }
    if(sv.stage === 'ready'){
      var i = sv.info || {};
      return '<div class="cx2-card cx2-narrow">' +
        '<div class="cx2-hi">' + esc(T(U.hello)) + ', <b>' + esc(i.note || sv.username) + '</b></div>' +
        '<div class="cx2-title">' + esc(i.title || '') + '</div>' +
        '<div class="cx2-chips"><span>' + esc(i.total) + ' ' + esc(T(U.qs)) + '</span><span>' + (i.limitMin ? esc(i.limitMin) + ' ' + esc(T(U.minutes)) : esc(T(U.noLimit))) + '</span></div>' +
        (isClosed(i) ? '<div class="cx2-err" style="border-color:#e8a417;color:#f1d08a">' + esc(T(U.notOpenYet)) + ' ' + esc(T(U.opensOn)) + ' <b>' + esc(fmtDay(i.openAt)) + '</b></div>' : '<p class="cx2-note">' + esc(T(U.rules)) + '</p>') +
        (sv.err ? '<div class="cx2-err">' + esc(sv.err) + '</div>' : '') +
        '<button class="cx2-btn" data-cx="start"' + (sv.busy || !i.total || isClosed(i) ? ' disabled' : '') + '>' + esc(T(i.status === 'started' ? U.resume : U.start)) + '</button> ' +
        '<button class="cx2-btn ghost" data-cx="logout">' + esc(T(U.logout)) + '</button></div>';
    }
    if(sv.stage === 'exam' && sv.exam){
      var qs = sv.exam.questions, n = Object.keys(sv.answers).length;
      var h = '<div class="cx2-bar"><div><span>' + esc(T(U.answered)) + '</span> <b>' + n + ' / ' + qs.length + '</b></div>' +
        (sv.deadline ? '<div><span>' + esc(T(U.timeLeft)) + '</span> <b class="cx2-time" data-cx="timer">' + fmtMs(sv.deadline - Date.now()) + '</b></div>' : '') + '</div>';
      qs.forEach(function(q, qi){
        h += '<div class="cx2-card cx2-q"><div class="cx2-qn">' + esc(T(U.qNo)) + ' ' + (qi + 1) + (q.topic ? ' · <i>' + esc(q.topic) + '</i>' : '') + '</div>' +
          '<div class="cx2-qt">' + esc(q.q) + '</div>' +
          q.choices.map(function(c, ci){
            var on = sv.answers[q.id] === ci;
            return '<button class="cx2-opt' + (on ? ' on' : '') + '" data-cx="opt" data-q="' + esc(q.id) + '" data-i="' + ci + '"><b>' + String.fromCharCode(65 + ci) + '</b><span>' + esc(c) + '</span></button>';
          }).join('') + '</div>';
      });
      var un = qs.length - n;
      h += '<div class="cx2-submitrow">' + (sv.err ? '<div class="cx2-err">' + esc(sv.err) + '</div>' : '') +
        '<button class="cx2-btn' + (sv.confirm ? ' warn' : '') + '" data-cx="submit"' + (sv.busy ? ' disabled' : '') + '>' + esc(T(sv.confirm ? U.sure : U.submit)) + (sv.confirm && un ? ' (' + un + ' ' + esc(T(U.unans)) + ')' : '') + '</button></div>';
      return h;
    }
    if(sv.stage === 'result' && sv.result){
      var r = sv.result, pass = r.pass;
      var h2 = '<div class="cx2-card cx2-narrow cx2-resultcard"><div class="cx2-done">' + esc(T(U.done)) + '</div>' +
        '<div class="cx2-big ' + (pass ? 'ok' : 'no') + '">' + esc(r.percent) + '%</div>' +
        '<div class="cx2-chips"><span>' + esc(T(U.score)) + ' ' + esc(r.score) + ' / ' + esc(r.total) + '</span><span class="' + (pass ? 'ok' : 'no') + '">' + esc(T(pass ? U.passed : U.notPassed)) + '</span><span>' + esc(T(U.passAt)) + ' ' + esc(r.passPercent) + '%</span></div>' +
        (r.late ? '<p class="cx2-note">' + esc(T(U.late)) + '</p>' : '') +
        (isClosed(sv.info) ? '<p class="cx2-note">' + esc(T(U.opensOn)) + ' <b>' + esc(fmtDay(sv.info.openAt)) + '</b></p>' : '') +
        '<button class="cx2-btn ghost" data-cx="logout">' + esc(T(U.logout)) + '</button></div>';
      h2 += '<div class="cx2-h2">' + esc(T(U.review)) + '</div>' + reviewHTML(r.review || []);
      return h2;
    }
    return '';
  }
  function reviewHTML(list){
    return list.map(function(x, i){
      return '<div class="cx2-card cx2-q ' + (x.ok ? 'okc' : 'noc') + '"><div class="cx2-qn">' + esc(T(U.qNo)) + ' ' + (i + 1) + (x.topic ? ' · <i>' + esc(x.topic) + '</i>' : '') + '</div>' +
        '<div class="cx2-qt">' + esc(x.q) + '</div>' +
        x.choices.map(function(c, ci){
          var cls = ci === x.correct ? ' good' : (ci === x.given ? ' bad' : '');
          return '<div class="cx2-opt static' + cls + '"><b>' + String.fromCharCode(65 + ci) + '</b><span>' + esc(c) + '</span>' +
            (ci === x.given ? '<em>' + esc(T(U.yours)) + '</em>' : '') + (ci === x.correct ? '<em>' + esc(T(U.correct)) + '</em>' : '') + '</div>';
        }).join('') +
        (x.given < 0 ? '<div class="cx2-note">' + esc(T(U.none)) + '</div>' : '') +
        (x.expl ? '<div class="cx2-expl">' + esc(x.expl) + '</div>' : '') + '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------------ admin */
  function adminKey(){ return adm.key || ss(KEY_STORE) || (tier() === 'editor' ? ss('spz_editor_code') : '') || ''; }
  function loadUsers(){
    adm.loading = true; paint();
    api('/api/admin/cexam/list', 'GET', null, adminKey()).then(function(r){
      adm.loading = false;
      if(r.status === 401){ ss(KEY_STORE, null); adm.key = ''; adm.keyErr = true; adm.users = null; }
      else if(r.status === 200){ adm.users = r.j.users || []; adm.err = ''; }
      else { adm.users = []; adm.err = (r.status === 404 || r.status === 405) ? 'old' : 'net'; }
      paint();
    }).catch(function(){ adm.loading = false; adm.err = 'net'; paint(); });
  }
  function loadBank(){
    api('/api/admin/cexam/bank', 'GET', null, adminKey()).then(function(r){
      if(r.status === 200){ adm.bank = r.j; adm.dirty = false; if(!adm.users || adm.err !== 'old') adm.err = adm.err === 'net' ? '' : adm.err; }
      else { adm.bank = { settings:{ title:'', timeLimitMin:0, passPercent:60, shuffle:true }, questions:[] }; adm.err = (r.status === 404 || r.status === 405) ? 'old' : 'net'; }
      paint();
    }).catch(function(){ adm.bank = { settings:{ title:'', timeLimitMin:0, passPercent:60, shuffle:true }, questions:[] }; adm.err = 'net'; paint(); });
  }
  function adminPanelHTML(){
    if(!adminKey()){
      return '<div class="cx2-card cx2-narrow"><p class="cx2-note">' + esc(T(U.needKey)) + '</p>' +
        '<input class="cx2-in" type="password" data-cx="akey" placeholder="' + esc(T(U.keyPh)) + '" autocomplete="off">' +
        (adm.keyErr ? '<div class="cx2-err">' + esc(T(U.badKey)) + '</div>' : '') +
        '<button class="cx2-btn" data-cx="unlock">' + esc(T(U.unlock)) + '</button></div>';
    }
    var tabs = [['users', U.tUsers], ['bank', U.tBank], ['settings', U.tSettings]].map(function(t){
      return '<button class="cx2-tab' + (adm.tab === t[0] ? ' on' : '') + '" data-cx="atab" data-v="' + t[0] + '">' + esc(T(t[1])) + '</button>';
    }).join('');
    var inner = adm.tab === 'users' ? usersHTML() : adm.tab === 'bank' ? bankHTML() : settingsHTML();
    var banner = adm.err ? '<div class="cx2-card cx2-warn">' + esc(adm.err === 'old' ? T(U.oldWorker) : T(U.adminNet)) + '</div>' : '';
    return banner + '<div class="cx2-tabs">' + tabs + '</div>' + inner;
  }
  function usersHTML(){
    var h = '<div class="cx2-card"><div class="cx2-gen">' +
      '<label><span>' + esc(T(U.genCount)) + '</span><input class="cx2-in sm" type="number" min="1" max="30" value="1" data-cx="gcount"></label>' +
      '<label class="grow"><span>' + esc(T(U.genNote)) + '</span><input class="cx2-in" data-cx="gnote" maxlength="120"></label>' +
      '<button class="cx2-btn" data-cx="generate">' + esc(T(U.gen)) + '</button></div></div>';
    if(adm.newCreds && adm.newCreds.length){
      h += '<div class="cx2-card cx2-newcreds"><div class="cx2-h3">' + esc(T(U.newCreds)) + '</div>' +
        adm.newCreds.map(function(c){
          return '<div class="cx2-cred"><div><span>' + esc(T(U.colUser)) + '</span><code>' + esc(c.username) + '</code></div>' +
            '<div><span>' + esc(T(U.colPass)) + '</span><code>' + esc(c.password) + '</code></div>' +
            (c.note ? '<div><span>' + esc(T(U.colNote)) + '</span><b>' + esc(c.note) + '</b></div>' : '') +
            '<button class="cx2-mini" data-cx="copy" data-t="' + esc(c.username + '\n' + c.password) + '">' + esc(T(U.copy)) + '</button></div>';
        }).join('') +
        '<button class="cx2-mini" data-cx="copyall">' + esc(T(U.copyAll)) + '</button></div>';
    }
    h += '<div class="cx2-row"><button class="cx2-mini" data-cx="refresh">' + esc(T(U.refresh)) + '</button></div>';
    if(adm.loading && !adm.users) return h + '<p class="cx2-note">' + esc(T(U.loading)) + '</p>';
    if(!adm.users || !adm.users.length) return h + '<p class="cx2-note">' + esc(T(U.noUsers)) + '</p>';
    h += '<div class="cx2-tblwrap"><table class="cx2-tbl"><thead><tr><th>' + esc(T(U.colUser)) + '</th><th>' + esc(T(U.colPass)) + '</th><th>' + esc(T(U.colNote)) + '</th><th>' + esc(T(U.colStatus)) + '</th><th>' + esc(T(U.colScore)) + '</th><th>' + esc(T(U.colOpen)) + '</th><th></th></tr></thead><tbody>';
    adm.users.forEach(function(u){
      var st = u.status === 'done' ? U.sDone : u.status === 'started' ? U.sStarted : U.sNew;
      var shown = !!adm.revealed[u.username];
      h += '<tr><td><code>' + esc(u.username) + '</code></td>' +
        '<td><code>' + (shown ? esc(u.password) : '••••••••') + '</code> <button class="cx2-mini" data-cx="reveal" data-u="' + esc(u.username) + '">' + esc(T(shown ? U.hide : U.show)) + '</button> <button class="cx2-mini" data-cx="copy" data-t="' + esc(u.username + '\n' + u.password) + '">' + esc(T(U.copy)) + '</button></td>' +
        '<td><input class="cx2-in sm wide" data-cx="note" data-u="' + esc(u.username) + '" value="' + esc(u.note) + '" maxlength="120"></td>' +
        '<td><span class="cx2-st ' + esc(u.status) + '">' + esc(T(st)) + '</span></td>' +
        '<td>' + (u.status === 'done' ? '<b>' + esc(u.percent) + '%</b> <small>(' + esc(u.score) + '/' + esc(u.total) + ')</small>' + (u.late ? ' <small>⏱</small>' : '') : '—') + '</td>' +
        '<td><input class="cx2-in sm" type="date" data-cx="openat" data-u="' + esc(u.username) + '" value="' + esc(dayVal(u.openAt)) + '">' + (u.openAt && u.openAt > Date.now() ? '<div class="cx2-note" style="margin:4px 0 0">' + esc(T(U.openAuto)) + '</div>' : '') + '</td>' +
        '<td class="cx2-act">' + (u.status === 'done' ? '<button class="cx2-mini" data-cx="result" data-u="' + esc(u.username) + '">' + esc(T(U.view)) + '</button>' : '') +
        (u.status !== 'new' ? '<button class="cx2-mini" data-cx="reset" data-u="' + esc(u.username) + '">' + esc(T(U.reset)) + '</button>' : '') +
        '<button class="cx2-mini danger" data-cx="del" data-u="' + esc(u.username) + '">' + esc(T(adm.delArm === u.username ? U.delSure : U.del)) + '</button></td></tr>';
    });
    h += '</tbody></table></div>';
    if(adm.view){
      var v = adm.view;
      h += '<div class="cx2-card"><div class="cx2-h3">' + esc(v.user.username) + (v.user.note ? ' — ' + esc(v.user.note) : '') + ' · ' + esc(v.user.percent) + '% (' + esc(v.user.score) + '/' + esc(v.user.total) + ') · ' + esc(fmtDate(v.user.finishedAt)) + '</div>' +
        (v.history && v.history.length ? '<div class="cx2-note">' + esc(T(U.attempts)) + ': ' + v.history.map(function(x){ return esc(x.percent) + '% (' + esc(fmtDate(x.finishedAt)) + ')'; }).join(' · ') + '</div>' : '') +
        reviewHTML(v.review || []) + '<button class="cx2-mini" data-cx="closeview">' + esc(T(U.close)) + '</button></div>';
    }
    return h;
  }
  function bankHTML(){
    if(!adm.bank) { return '<p class="cx2-note">' + esc(T(U.loading)) + '</p>'; }
    var qs = adm.bank.questions;
    var h = '<div class="cx2-row"><button class="cx2-btn" data-cx="addq">' + esc(T(U.addQ)) + '</button> <button class="cx2-btn ghost" data-cx="samples">' + esc(T(U.samples)) + '</button> <button class="cx2-btn" data-cx="savebank">' + esc(T(U.saveBank)) + '</button> <button class="cx2-btn ghost" data-cx="impjson">' + esc(T(U.impJson)) + '</button> <button class="cx2-btn ghost" data-cx="expjson">' + esc(T(U.expJson)) + '</button> <input type="file" accept=".json,application/json" data-cx="impfile" style="display:none"> <span class="cx2-note" data-cx="bankmsg">' + esc(adm.msg || '') + '</span></div>' +
      '<div class="cx2-note">' + esc(T(U.impNote)) + '</div><div class="cx2-note">' + qs.length + ' ' + esc(T(U.totalQ)) + '</div>';
    if(!qs.length) h += '<p class="cx2-note">' + esc(T(U.noBankQ)) + '</p>';
    qs.forEach(function(q, qi){
      h += '<div class="cx2-card cx2-edq"><div class="cx2-qn">' + esc(T(U.qNo)) + ' ' + (qi + 1) + ' <button class="cx2-mini danger" data-cx="delq" data-i="' + qi + '">' + esc(T(U.del)) + '</button></div>' +
        '<label class="cx2-lab">' + esc(T(U.qText)) + '</label><textarea class="cx2-in" rows="2" data-cx="qf" data-i="' + qi + '" data-f="q">' + esc(q.q) + '</textarea>' +
        q.choices.map(function(c, ci){
          return '<div class="cx2-chrow"><label class="cx2-radio"><input type="radio" name="cx-ans-' + qi + '" data-cx="qans" data-i="' + qi + '" data-c="' + ci + '"' + (q.ans === ci ? ' checked' : '') + '><span>' + esc(T(U.correctMark)) + '</span></label>' +
            '<b>' + String.fromCharCode(65 + ci) + '</b><input class="cx2-in" data-cx="qch" data-i="' + qi + '" data-c="' + ci + '" value="' + esc(c) + '">' +
            (q.choices.length > 2 ? '<button class="cx2-mini" data-cx="delch" data-i="' + qi + '" data-c="' + ci + '">×</button>' : '') + '</div>';
        }).join('') +
        (q.choices.length < 6 ? '<button class="cx2-mini" data-cx="addch" data-i="' + qi + '">' + esc(T(U.addChoice)) + '</button>' : '') +
        '<label class="cx2-lab">' + esc(T(U.expl)) + '</label><textarea class="cx2-in" rows="2" data-cx="qf" data-i="' + qi + '" data-f="expl">' + esc(q.expl || '') + '</textarea>' +
        '<label class="cx2-lab">' + esc(T(U.topic)) + '</label><input class="cx2-in" data-cx="qf" data-i="' + qi + '" data-f="topic" value="' + esc(q.topic || '') + '">' +
        '<label class="cx2-lab">' + esc(T(U.skillLbl)) + '</label><select class="cx2-in" data-cx="qskill" data-i="' + qi + '"><option value="">' + esc(T(U.noSkill)) + '</option>' +
        SKILLS.map(function(k){ return '<option value="' + k[0] + '"' + (q.skill === k[0] ? ' selected' : '') + '>' + esc(k[1]) + '</option>'; }).join('') + '</select></div>';
    });
    return h;
  }
  function settingsHTML(){
    if(!adm.bank) return '<p class="cx2-note">' + esc(T(U.loading)) + '</p>';
    var s = adm.bank.settings;
    return '<div class="cx2-card cx2-narrow">' +
      '<label class="cx2-lab">' + esc(T(U.sTitle)) + '</label><input class="cx2-in" data-cx="sf" data-f="title" value="' + esc(s.title) + '">' +
      '<label class="cx2-lab">' + esc(T(U.sTime)) + '</label><input class="cx2-in sm" type="number" min="0" max="300" data-cx="sf" data-f="timeLimitMin" value="' + esc(s.timeLimitMin) + '">' +
      '<label class="cx2-lab">' + esc(T(U.sPass)) + '</label><input class="cx2-in sm" type="number" min="0" max="100" data-cx="sf" data-f="passPercent" value="' + esc(s.passPercent) + '">' +
      '<label class="cx2-radio" style="margin:12px 0;"><input type="checkbox" data-cx="sshuffle"' + (s.shuffle ? ' checked' : '') + '><span>' + esc(T(U.sShuffle)) + '</span></label>' +
      '<div><button class="cx2-btn" data-cx="savebank">' + esc(T(U.saveBank)) + '</button> <span class="cx2-note" data-cx="bankmsg">' + esc(adm.msg || '') + '</span></div></div>';
  }
  function saveBank(){
    adm.msg = '…';
    var m = sec.querySelector('[data-cx="bankmsg"]'); if(m) m.textContent = '…';
    api('/api/admin/cexam/bank/set', 'POST', adm.bank, adminKey()).then(function(r){
      adm.msg = r.status === 200 ? T(U.saved) + ' (' + r.j.count + ')' : (r.status === 404 ? T(U.oldWorker) : T(U.saveFail));
      if(r.status === 200){ adm.dirty = false; loadBank(); }
      var m2 = sec.querySelector('[data-cx="bankmsg"]'); if(m2) m2.textContent = adm.msg;
    }).catch(function(){ var m3 = sec.querySelector('[data-cx="bankmsg"]'); if(m3) m3.textContent = T(U.saveFail); });
  }

  /* ----------------------------------------------------------------- shell */
  function paint(){
    if(!bodyEl) return;
    var top = '';
    if(isAdminTier){
      top = '<div class="cx2-toggle"><button class="cx2-mini" data-cx="mode">' + esc(T(mode === 'admin' ? U.studentBtn : U.adminBtn)) + '</button></div>';
    }
    var focusInfo = null, ae = document.activeElement;
    bodyEl.innerHTML = '<div class="cx2-wrap">' + top + (mode === 'admin' && isAdminTier ? adminPanelHTML() : '<div class="cx2-center">' + studentHTML() + '</div>') + '</div>';
    void focusInfo; void ae;
  }
  function repaintText(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-cx-h="' + k + '"]'); };
    if(q('eb')) q('eb').textContent = T(U.eb);
    if(q('h')) q('h').textContent = T(U.h);
    if(q('lede')) q('lede').textContent = T(U.lede);
    if(!(document.activeElement && bodyEl && bodyEl.contains(document.activeElement) && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) paint();
  }

  function onClick(ev){
    var el = ev.target.closest('[data-cx]');
    if(!el || !bodyEl.contains(el)) return;
    var a = el.getAttribute('data-cx');
    if(a === 'login'){
      var u = bodyEl.querySelector('[data-cx="user"]'), p = bodyEl.querySelector('[data-cx="pass"]');
      if(u && p && u.value.trim() && p.value.trim()) doLogin(u.value, p.value);
    }
    else if(a === 'start') startExam();
    else if(a === 'logout') logoutStudent();
    else if(a === 'opt'){
      sv.answers[el.getAttribute('data-q')] = parseInt(el.getAttribute('data-i'), 10);
      sv.confirm = false; ss(ANS_STORE, JSON.stringify(sv.answers));
      var y = window.pageYOffset; paint(); window.scrollTo(0, y);
    }
    else if(a === 'submit'){ if(!sv.confirm){ sv.confirm = true; var y2 = window.pageYOffset; paint(); window.scrollTo(0, y2); } else submitExam(); }
    else if(a === 'mode'){ mode = mode === 'admin' ? 'student' : 'admin'; if(mode === 'admin' && adminKey()){ if(!adm.users) loadUsers(); if(!adm.bank) loadBank(); } paint(); }
    else if(a === 'unlock'){
      var k = bodyEl.querySelector('[data-cx="akey"]');
      if(k && k.value.trim()){ adm.key = k.value.trim(); ss(KEY_STORE, adm.key); adm.keyErr = false; loadUsers(); loadBank(); }
    }
    else if(a === 'atab'){ adm.tab = el.getAttribute('data-v'); if(!adm.bank) loadBank(); paint(); }
    else if(a === 'generate'){
      var c = parseInt(bodyEl.querySelector('[data-cx="gcount"]').value, 10) || 1, n = bodyEl.querySelector('[data-cx="gnote"]').value;
      api('/api/admin/cexam/create', 'POST', { count:c, note:n }, adminKey()).then(function(r){
        if(r.status === 200){ adm.newCreds = r.j.created; loadUsers(); }
        else { adm.err = (r.status === 404 || r.status === 405) ? 'old' : (r.status === 401 ? '' : 'net'); if(r.status === 401){ ss(KEY_STORE, null); adm.key = ''; adm.keyErr = true; } paint(); }
      }).catch(function(){ adm.err = 'net'; paint(); });
    }
    else if(a === 'copy') copyText(el.getAttribute('data-t'), el);
    else if(a === 'copyall'){
      copyText((adm.newCreds || []).map(function(c){ return c.username + '  ' + c.password + (c.note ? '  ' + c.note : ''); }).join('\n'), el);
    }
    else if(a === 'refresh') loadUsers();
    else if(a === 'reveal'){ var un = el.getAttribute('data-u'); adm.revealed[un] = !adm.revealed[un]; paint(); }
    else if(a === 'reset'){
      api('/api/admin/cexam/update', 'POST', { username:el.getAttribute('data-u'), reset:true }, adminKey()).then(function(){ adm.view = null; loadUsers(); });
    }
    else if(a === 'del'){
      var du = el.getAttribute('data-u');
      if(adm.delArm !== du){ adm.delArm = du; paint(); setTimeout(function(){ if(adm.delArm === du){ adm.delArm = ''; paint(); } }, 4000); }
      else { adm.delArm = ''; api('/api/admin/cexam/update', 'POST', { username:du, delete:true }, adminKey()).then(function(){ loadUsers(); }); }
    }
    else if(a === 'result'){
      api('/api/admin/cexam/result?username=' + encodeURIComponent(el.getAttribute('data-u')), 'GET', null, adminKey()).then(function(r){ if(r.status === 200){ adm.view = r.j; paint(); } });
    }
    else if(a === 'closeview'){ adm.view = null; paint(); }
    else if(a === 'addq'){ adm.bank.questions.push({ id:'q' + Date.now().toString(36), q:'', choices:['', '', '', ''], ans:0, expl:'', topic:'' }); paint(); }
    else if(a === 'samples'){
      SAMPLES.forEach(function(s, i){ adm.bank.questions.push({ id:'s' + Date.now().toString(36) + i, q:s.q, choices:s.choices.slice(), ans:s.ans, expl:s.expl, topic:s.topic, skill:s.skill || '' }); }); paint();
    }
    else if(a === 'delq'){ adm.bank.questions.splice(parseInt(el.getAttribute('data-i'), 10), 1); paint(); }
    else if(a === 'addch'){ var q1 = adm.bank.questions[parseInt(el.getAttribute('data-i'), 10)]; if(q1.choices.length < 6) q1.choices.push(''); paint(); }
    else if(a === 'delch'){
      var q2 = adm.bank.questions[parseInt(el.getAttribute('data-i'), 10)], ci = parseInt(el.getAttribute('data-c'), 10);
      if(q2.choices.length > 2){ q2.choices.splice(ci, 1); if(q2.ans >= q2.choices.length) q2.ans = 0; else if(q2.ans > ci) q2.ans--; } paint();
    }
    else if(a === 'savebank') saveBank();
    else if(a === 'impjson'){ var f = bodyEl.querySelector('[data-cx="impfile"]'); if(f) f.click(); }
    else if(a === 'expjson'){
      try {
        var blob = new Blob([JSON.stringify(adm.bank, null, 1)], { type:'application/json' }), aEl = document.createElement('a');
        aEl.href = URL.createObjectURL(blob); aEl.download = 'classroom-exam-bank.json'; document.body.appendChild(aEl); aEl.click();
        setTimeout(function(){ URL.revokeObjectURL(aEl.href); document.body.removeChild(aEl); }, 500);
      } catch(e){}
    }
  }
  function importBank(text){
    var j; try { j = JSON.parse(text); } catch(e){ adm.msg = T(U.impBad); paint(); return; }
    var arr = Array.isArray(j) ? j : (j && j.questions);
    if(!Array.isArray(arr) || !adm.bank){ adm.msg = T(U.impBad); paint(); return; }
    var n = 0;
    arr.forEach(function(x, i){
      if(!x || typeof x.q !== 'string' || !Array.isArray(x.choices) || x.choices.length < 2) return;
      var ans = parseInt(x.ans, 10); if(!(ans >= 0 && ans < x.choices.length)) ans = 0;
      adm.bank.questions.push({ id:'i' + Date.now().toString(36) + i, q:x.q, choices:x.choices.map(String).slice(0, 6), ans:ans, expl:String(x.expl || ''), topic:String(x.topic || ''), skill:/^(ew[1-8]|ot[1-6])$/.test(x.skill || '') ? x.skill : '' });
      n++;
    });
    adm.msg = n ? T(U.impOk) + ' ' + n : T(U.impBad); paint();
  }
  function onInput(ev){
    var el = ev.target, a = el.getAttribute && el.getAttribute('data-cx');
    if(!a) return;
    if(a === 'qf'){ adm.bank.questions[+el.getAttribute('data-i')][el.getAttribute('data-f')] = el.value; }
    else if(a === 'qch'){ adm.bank.questions[+el.getAttribute('data-i')].choices[+el.getAttribute('data-c')] = el.value; }
    else if(a === 'qans'){ adm.bank.questions[+el.getAttribute('data-i')].ans = +el.getAttribute('data-c'); }
    else if(a === 'sf'){ adm.bank.settings[el.getAttribute('data-f')] = el.getAttribute('data-f') === 'title' ? el.value : (parseInt(el.value, 10) || 0); }
    else if(a === 'qskill'){ adm.bank.questions[+el.getAttribute('data-i')].skill = el.value; }
    else if(a === 'sshuffle'){ adm.bank.settings.shuffle = !!el.checked; }
  }
  function onChange(ev){
    var el = ev.target;
    if(el.getAttribute && el.getAttribute('data-cx') === 'qskill'){ adm.bank.questions[+el.getAttribute('data-i')].skill = el.value; return; }
    if(el.getAttribute && el.getAttribute('data-cx') === 'impfile'){
      var fl = el.files && el.files[0]; if(!fl) return;
      var rd = new FileReader(); rd.onload = function(){ importBank(String(rd.result || '')); }; rd.readAsText(fl); return;
    }
    if(el.getAttribute && el.getAttribute('data-cx') === 'openat'){
      var un2 = el.getAttribute('data-u'), ms = null;
      if(el.value){ var pp = el.value.split('-'); ms = new Date(+pp[0], +pp[1] - 1, +pp[2], 0, 0, 0).getTime(); }
      api('/api/admin/cexam/update', 'POST', { username:un2, openAt:ms }, adminKey()).then(function(){ loadUsers(); });
      return;
    }
    if(el.getAttribute && el.getAttribute('data-cx') === 'note'){
      var un = el.getAttribute('data-u');
      api('/api/admin/cexam/update', 'POST', { username:un, note:el.value }, adminKey());
      (adm.users || []).forEach(function(u){ if(u.username === un) u.note = el.value; });
    }
  }
  function onKey(ev){
    if(ev.key !== 'Enter') return;
    var a = ev.target.getAttribute && ev.target.getAttribute('data-cx');
    if(a === 'user' || a === 'pass'){ var b = bodyEl.querySelector('[data-cx="login"]'); if(b) b.click(); }
    else if(a === 'akey'){ var c = bodyEl.querySelector('[data-cx="unlock"]'); if(c) c.click(); }
  }

  function build(){
    if(document.getElementById('classexam')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section');
    sec.id = 'classexam';
    sec.setAttribute('data-route', 'classexam');
    sec.innerHTML =
      '<div class="ewv-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-cx-h="eb"></span></div>' +
          '<h2 data-cx-h="h"></h2><p class="lede" data-cx-h="lede"></p><div class="rule"></div>' +
        '</div>' +
        '<div data-cx-h="body"></div>' +
      '</div>';
    document.body.appendChild(sec);
    bodyEl = sec.querySelector('[data-cx-h="body"]');
    bodyEl.addEventListener('click', onClick);
    bodyEl.addEventListener('input', onInput);
    bodyEl.addEventListener('change', onChange);
    bodyEl.addEventListener('keydown', onKey);
    ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(function(n){
      bodyEl.addEventListener(n, function(ev){ if(sv.stage === 'exam') ev.preventDefault(); });
    });
    window.__spzAddRoute({
      id:'classexam', after:'arena',
      t:{ en:'Classroom Exam', th:'ข้อสอบห้องเรียน' },
      d:{ en:'Take the exam your teacher set up with the login they gave you. One attempt per login.',
          th:'สอบตามข้อสอบที่ครูเตรียมไว้ ด้วยรหัสที่ครูให้ สอบได้ครั้งเดียวต่อรหัส' }
    });
    refreshTier();
    repaintText();
    return true;
  }
  function refreshTier(){
    var t = tier();
    var was = isAdminTier;
    isAdminTier = (t === 'full' || t === 'editor');
    if(!isAdminTier) mode = 'student';
    if(was !== isAdminTier && bodyEl) paint();
  }
  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) repaintText(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('spz:tier', refreshTier);
    window.addEventListener('hashchange', function(){
      if(location.hash === '#/classexam'){ refreshTier(); repaintText(); }
      else { /* keep the timer's deadline; it fires submit even if the tab is elsewhere */ }
    });
    setInterval(refreshTier, 3000);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1400); });
  else setTimeout(boot, 1400);
})();
