/* ===========================================================================
   EXAM ARENA (#/arena) -- random CEWA-style practice questions with three
   modes (Practice / Ranked / Blitz) and a leaderboard with a top-3 podium.

   * Needs a LINE or Telegram login (the same session code every other
     personal feature uses: window.__SPZ_LINE.code() / window.__SPZ_TG.code()).
   * ALL grading, timing and scoring happens on the Worker (see the EXAM
     ARENA section of line-qr-worker.js). This file only draws the screens
     and relays the player's clicks -- it never sees a correct answer while a
     Ranked / Blitz round is running, so there is nothing to read in devtools.
   * Questions are English (like the real exam); every UI string and every
     explanation is EN + TH.
   =========================================================================== */
(function(){
  'use strict';

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var U = {
    eb: { en:'Exam Arena', th:'สนามสอบ' },
    h:  { en:'CEWA Exam Arena', th:'สนามสอบ CEWA' },
    lede: { en:'Random questions from our Elliott Wave mock-exam bank. Practice on your own, or compete for a place on the leaderboard. Practice material only — not an official CEWA exam.',
            th:'สุ่มข้อสอบจากคลังข้อสอบจำลอง Elliott Wave ของเรา ฝึกคนเดียว หรือแข่งเพื่อขึ้นอันดับ เป็นสื่อฝึกเท่านั้น ไม่ใช่ข้อสอบ CEWA จริง' },
    tabPlay: { en:'Play', th:'เล่น' },
    tabBoard: { en:'Leaderboard', th:'อันดับ' },
    loginH: { en:'Log in to play', th:'เข้าสู่ระบบเพื่อเล่น' },
    loginP: { en:'Scores are saved to your account, so you need to log in first. Choose LINE or Telegram.',
              th:'คะแนนจะผูกกับบัญชีของคุณ จึงต้องเข้าสู่ระบบก่อน เลือก LINE หรือ Telegram' },
    loginLine: { en:'Log in with LINE', th:'เข้าสู่ระบบด้วย LINE' },
    loginTg: { en:'Log in with Telegram', th:'เข้าสู่ระบบด้วย Telegram' },
    hello: { en:'Playing as', th:'กำลังเล่นในชื่อ' },
    noBank: { en:'The question bank is not ready yet. Please check back soon.', th:'คลังข้อสอบยังไม่พร้อม โปรดกลับมาใหม่เร็วๆ นี้' },
    bankInfo: { en:'questions from', th:'ข้อ จาก' },
    bankSets: { en:'mock exams', th:'ชุดข้อสอบ' },
    mPractice: { en:'Practice', th:'ฝึกส่วนตัว' },
    mPracticeD: { en:'Private. No timer, and each answer is explained straight away. Nothing is shown to anyone else.',
                  th:'เป็นส่วนตัว ไม่จับเวลา และเฉลยพร้อมคำอธิบายทันทีหลังตอบทุกข้อ ไม่แสดงให้ใครเห็น' },
    mRanked: { en:'Ranked', th:'โหมดแข่งขัน' },
    mRankedD: { en:'10 random questions, 45 seconds each. Correct and fast scores more. Your best score goes on the leaderboard.',
                th:'สุ่ม 10 ข้อ ข้อละ 45 วินาที ตอบถูกและเร็วได้คะแนนมากขึ้น คะแนนที่ดีที่สุดของคุณจะขึ้นกระดานอันดับ' },
    mBlitz: { en:'Blitz', th:'โหมดตอบเร็ว' },
    mBlitzD: { en:'10 questions, only 15 seconds each. Read it and answer on the spot — no time to look anything up. Has its own leaderboard.',
               th:'10 ข้อ ข้อละ 15 วินาทีเท่านั้น อ่านแล้วตอบทันที ไม่มีเวลาไปหาคำตอบ มีกระดานอันดับแยกต่างหาก' },
    howMany: { en:'Questions', th:'จำนวนข้อ' },
    start: { en:'Start', th:'เริ่ม' },
    starting: { en:'Preparing questions…', th:'กำลังเตรียมข้อสอบ…' },
    qOf: { en:'Question', th:'ข้อที่' },
    of: { en:'of', th:'จาก' },
    pickOne: { en:'Choose one answer', th:'เลือกหนึ่งคำตอบ' },
    pickMany: { en:'Select all that apply', th:'เลือกทุกข้อที่ถูก' },
    confirm: { en:'Confirm answer', th:'ยืนยันคำตอบ' },
    next: { en:'Next question', th:'ข้อถัดไป' },
    finish: { en:'See result', th:'ดูผลลัพธ์' },
    correct: { en:'Correct', th:'ถูกต้อง' },
    wrong: { en:'Not quite', th:'ยังไม่ถูก' },
    explain: { en:'Why', th:'เหตุผล' },
    noExplain: { en:'No explanation was written for this question.', th:'ข้อนี้ยังไม่มีคำอธิบาย' },
    secs: { en:'s', th:'วิ' },
    timeUp: { en:'Time is up', th:'หมดเวลา' },
    resultH: { en:'Round complete', th:'จบรอบ' },
    score: { en:'Score', th:'คะแนน' },
    rightN: { en:'correct', th:'ข้อถูก' },
    timeTotal: { en:'Time', th:'เวลารวม' },
    rankWeek: { en:'This week', th:'สัปดาห์นี้' },
    rankAll: { en:'All time', th:'ตลอดกาล' },
    rankPos: { en:'Rank', th:'อันดับ' },
    newBest: { en:'New personal best!', th:'สถิติใหม่ของคุณ!' },
    notBest: { en:'Your best score on the board is higher, so it stays.', th:'คะแนนที่ดีที่สุดของคุณบนกระดานสูงกว่านี้ จึงยังคงเดิม' },
    practiceDone: { en:'Practice round — not recorded anywhere.', th:'รอบฝึก — ไม่ถูกบันทึกที่ไหน' },
    review: { en:'Review', th:'ทบทวนคำตอบ' },
    yourAns: { en:'Your answer', th:'คำตอบของคุณ' },
    rightAns: { en:'Correct answer', th:'คำตอบที่ถูก' },
    none: { en:'(no answer)', th:'(ไม่ได้ตอบ)' },
    late: { en:'too late', th:'ช้าเกินเวลา' },
    again: { en:'Play again', th:'เล่นอีกรอบ' },
    toMenu: { en:'Back to menu', th:'กลับเมนู' },
    toBoard: { en:'View leaderboard', th:'ดูอันดับ' },
    bRanked: { en:'Ranked', th:'แข่งขัน' },
    bBlitz: { en:'Blitz', th:'ตอบเร็ว' },
    pWeek: { en:'This week', th:'สัปดาห์นี้' },
    pAll: { en:'All time', th:'ตลอดกาล' },
    players: { en:'players', th:'ผู้เล่น' },
    resets: { en:'Resets in', th:'รีเซ็ตใน' },
    empty: { en:'Nobody is on this board yet — be the first!', th:'ยังไม่มีใครบนกระดานนี้ มาเป็นคนแรกกันเถอะ!' },
    runners: { en:'Runners-up', th:'อันดับถัดไป' },
    you: { en:'You', th:'คุณ' },
    youRank: { en:'Your rank', th:'อันดับของคุณ' },
    pts: { en:'pts', th:'แต้ม' },
    err: { en:'Something went wrong. Please try again.', th:'เกิดข้อผิดพลาด โปรดลองอีกครั้ง' },
    errLogin: { en:'Your login has expired. Please log in again.', th:'การเข้าสู่ระบบหมดอายุ โปรดเข้าสู่ระบบใหม่' },
    errConf: { en:'The Arena is not configured on the server yet.', th:'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าสนามสอบ' },
    retry: { en:'Try again', th:'ลองใหม่' },
    nocopy: { en:'Copying is disabled in timed modes.', th:'โหมดจับเวลาปิดการคัดลอกข้อความ' },
    d: { en:'d', th:'ว.' }, h2: { en:'h', th:'ชม.' }, m2: { en:'m', th:'น.' }
  };

  var CSS = '' +
  '.az-wrap{max-width:900px;margin:0 auto;}' +
  '.az-tabs{display:flex;gap:8px;margin:0 0 22px;flex-wrap:wrap;}' +
  '.az-tab{font-family:var(--mono);font-size:12.5px;letter-spacing:1px;text-transform:uppercase;padding:10px 18px;border-radius:12px;border:1px solid var(--border-dim);background:var(--glass);color:var(--grey);cursor:pointer;}' +
  '.az-tab.on{border-color:var(--neon);color:var(--neon);background:rgba(204,255,0,.06);}' +
  '.az-card{border:1px solid var(--border-dim);background:#0b0c0a;border-radius:var(--radius);padding:22px;margin-bottom:16px;}' +
  '.az-me{display:flex;align-items:center;gap:12px;color:var(--grey);font-size:13.5px;margin-bottom:18px;}' +
  '.az-me img{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid var(--border);}' +
  '.az-me b{color:var(--white);}' +
  '.az-modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;}' +
  '.az-mode{border:1px solid var(--border-dim);background:#0b0c0a;border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:10px;}' +
  '.az-mode h3{margin:0;font-size:18px;color:var(--white);display:flex;align-items:center;gap:10px;}' +
  '.az-mode p{margin:0;color:var(--grey);font-size:13.5px;line-height:1.65;flex:1;}' +
  '.az-mode.ranked{border-color:rgba(204,255,0,.3);}' +
  '.az-mode.blitz{border-color:rgba(255,59,78,.4);}' +
  '.az-badge{font-family:var(--mono);font-size:10.5px;letter-spacing:1.5px;padding:3px 8px;border-radius:999px;border:1px solid var(--border);color:var(--neon);}' +
  '.az-mode.blitz .az-badge{border-color:rgba(255,59,78,.5);color:var(--red);}' +
  '.az-btn{font-family:var(--mono);font-size:13px;font-weight:700;letter-spacing:.5px;border:none;border-radius:12px;padding:12px 20px;cursor:pointer;background:var(--neon);color:#080808;}' +
  '.az-btn:disabled{opacity:.45;cursor:not-allowed;}' +
  '.az-btn.ghost{background:transparent;color:var(--neon);border:1px solid var(--border);}' +
  '.az-btn.red{background:var(--red);color:#fff;}' +
  '.az-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}' +
  '.az-sel{font-family:var(--mono);font-size:13px;background:#000;color:var(--white);border:1px solid var(--border-dim);border-radius:10px;padding:9px 10px;}' +
  '.az-note{color:var(--grey);font-size:12.5px;line-height:1.7;}' +
  '.az-err{color:var(--red);font-size:13.5px;margin:10px 0;}' +
  '.az-prog{height:6px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-bottom:6px;}' +
  '.az-prog i{display:block;height:100%;background:var(--neon);transition:width .3s;}' +
  '.az-qmeta{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;color:var(--grey);margin-bottom:14px;letter-spacing:1px;}' +
  '.az-timer{height:8px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-bottom:16px;}' +
  '.az-timer i{display:block;height:100%;background:var(--neon);width:100%;}' +
  '.az-timer.low i{background:var(--red);}' +
  '.az-qtext{font-size:17px;line-height:1.7;color:var(--white);margin:0 0 6px;}' +
  '.az-hint{font-family:var(--mono);font-size:11.5px;color:var(--grey);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;}' +
  '.az-opts{display:flex;flex-direction:column;gap:10px;margin:16px 0;}' +
  '.az-opt{text-align:left;display:flex;gap:12px;align-items:flex-start;width:100%;font-family:var(--sans);font-size:15px;line-height:1.55;color:var(--white);background:var(--glass);border:1px solid var(--border-dim);border-radius:12px;padding:13px 15px;cursor:pointer;}' +
  '.az-opt:hover{border-color:var(--border);}' +
  '.az-opt.sel{border-color:var(--neon);background:rgba(204,255,0,.07);}' +
  '.az-opt.ok{border-color:#5fa176;background:rgba(95,161,118,.14);}' +
  '.az-opt.bad{border-color:var(--red);background:rgba(255,59,78,.1);}' +
  '.az-opt .az-l{font-family:var(--mono);color:var(--neon);flex-shrink:0;width:20px;}' +
  '.az-opt:disabled{cursor:default;}' +
  '.az-nocopy,.az-nocopy *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}' +
  '.az-exp{border-left:3px solid var(--neon);padding:10px 14px;margin:12px 0;color:var(--grey);font-size:14px;line-height:1.7;background:rgba(204,255,0,.04);border-radius:0 10px 10px 0;}' +
  '.az-verdict{font-weight:700;font-size:15px;margin:10px 0 0;}' +
  '.az-verdict.ok{color:#7fd39c;} .az-verdict.bad{color:var(--red);}' +
  '.az-big{text-align:center;padding:10px 0 4px;}' +
  '.az-big .az-score{font-family:var(--mono);font-size:56px;color:var(--neon);line-height:1.1;}' +
  '.az-stats{display:flex;justify-content:center;gap:26px;flex-wrap:wrap;margin:10px 0 6px;font-family:var(--mono);font-size:13px;color:var(--grey);}' +
  '.az-stats b{color:var(--white);font-size:18px;display:block;}' +
  '.az-rev{border-top:1px solid var(--border-dim);padding:14px 0;}' +
  '.az-rev h4{margin:0 0 6px;font-size:14.5px;font-weight:600;color:var(--white);line-height:1.6;}' +
  '.az-rev .a{font-size:13px;color:var(--grey);line-height:1.7;}' +
  '.az-rev .a.bad{color:#ff8a98;} .az-rev .a.ok{color:#7fd39c;}' +
  '.az-seg{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}' +
  '.az-podium{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:12px;align-items:end;margin:18px 0 22px;}' +
  '.az-pod{border:1px solid var(--border-dim);background:#0b0c0a;border-radius:var(--radius);padding:16px 10px 14px;text-align:center;position:relative;}' +
  '.az-pod.p1{padding-top:26px;padding-bottom:22px;border-color:rgba(255,210,74,.55);box-shadow:0 0 28px rgba(255,210,74,.12);}' +
  '.az-pod.p2{border-color:rgba(207,214,220,.45);}' +
  '.az-pod.p3{border-color:rgba(208,138,74,.5);}' +
  '.az-pod svg{width:54px;height:54px;display:block;margin:0 auto 6px;}' +
  '.az-pod.p1 svg{width:72px;height:72px;}' +
  '.az-pod .nm{font-size:14px;color:var(--white);word-break:break-word;margin-top:4px;}' +
  '.az-pod .sc{font-family:var(--mono);font-size:18px;color:var(--neon);margin-top:2px;}' +
  '.az-pod.p1 .sc{font-size:22px;}' +
  '.az-pod .sub{font-family:var(--mono);font-size:11px;color:var(--grey);}' +
  '.az-pod img{width:40px;height:40px;border-radius:50%;object-fit:cover;margin:0 auto;display:block;border:2px solid var(--border);}' +
  '.az-pod.empty{opacity:.35;}' +
  '.az-runner{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;border:1px solid var(--border-dim);margin-bottom:8px;color:#a5aaa0;font-size:14px;background:rgba(255,255,255,.015);}' +
  '.az-runner .rk{font-family:var(--mono);width:28px;color:var(--grey-dim);}' +
  '.az-runner .nm{flex:1;word-break:break-word;}' +
  '.az-runner .sc{font-family:var(--mono);color:#b9c58a;}' +
  '.az-runner.me,.az-pod.me{border-color:var(--neon);}' +
  '.az-runner img{width:26px;height:26px;border-radius:50%;object-fit:cover;}' +
  '@media (max-width:560px){.az-podium{grid-template-columns:1fr;} .az-big .az-score{font-size:44px;}}';

  var sec = null, bodyEl = null;
  var meta = null, metaErr = false, metaLoading = false;
  var tab = 'play';              // play | board
  var view = 'menu';             // menu | loading | quiz | result
  var practiceCount = 10;
  var run = null;                // current round state
  var board = { mode:'ranked', period:'week', data:null, loading:false, err:false };
  var busy = false;
  var errMsg = '';
  var timerIv = null;
  var loginPoll = null;

  function sessionCode(){
    var c = null;
    try { if(window.__SPZ_LINE && window.__SPZ_LINE.code) c = window.__SPZ_LINE.code(); } catch(e){}
    if(!c){ try { if(window.__SPZ_TG && window.__SPZ_TG.code) c = window.__SPZ_TG.code(); } catch(e){} }
    return c || null;
  }
  function who(){
    var s = null;
    try { if(window.__SPZ_LINE && window.__SPZ_LINE.code && window.__SPZ_LINE.code()) s = window.__SPZ_LINE.state(); } catch(e){}
    if(!s){ try { if(window.__SPZ_TG && window.__SPZ_TG.code && window.__SPZ_TG.code()) s = window.__SPZ_TG.state(); } catch(e){} }
    return s;
  }

  function api(path, method, payload){
    var opt = { method: method || 'GET', headers: {} };
    if(payload){ opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(payload); }
    return fetch(WORKER_BASE + path, opt).then(function(r){
      return r.json().then(function(j){ return { status:r.status, j:j }; }, function(){ return { status:r.status, j:{} }; });
    });
  }
  function errText(r){
    if(r && r.status === 401) return T(U.errLogin);
    if(r && r.j && r.j.error === 'not_configured') return T(U.errConf);
    if(r && r.j && r.j.error === 'no_bank') return T(U.noBank);
    return T(U.err);
  }

  function stopTimer(){ if(timerIv){ clearInterval(timerIv); timerIv = null; } }
  function fmtMs(ms){
    var s = Math.round(ms / 100) / 10;
    if(s < 60) return s.toFixed(1) + ' ' + T(U.secs);
    var m = Math.floor(s / 60);
    return m + ':' + ('0' + Math.round(s - m * 60)).slice(-2);
  }
  function fmtLeft(ms){
    var d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
    if(d > 0) return d + T(U.d) + ' ' + h + T(U.h2);
    return h + T(U.h2) + ' ' + m + T(U.m2);
  }

  /* ------------------------------ menu ------------------------------ */
  function trophySVG(color){
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8h28v14a14 14 0 0 1-28 0V8z" fill="' + color + '" opacity=".95"/>' +
      '<path d="M18 12H8c0 10 4 16 12 18M46 12h10c0 10-4 16-12 18" fill="none" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<rect x="28" y="36" width="8" height="10" fill="' + color + '"/><rect x="20" y="46" width="24" height="7" rx="2" fill="' + color + '"/>' +
      '<rect x="16" y="53" width="32" height="4" rx="2" fill="' + color + '" opacity=".7"/></svg>';
  }

  function loginGateHTML(){
    return '<div class="az-card"><h3 style="margin:0 0 8px;color:var(--white)">' + esc(T(U.loginH)) + '</h3>' +
      '<p class="az-note">' + esc(T(U.loginP)) + '</p>' +
      '<div class="az-row" style="margin-top:14px">' +
      '<button type="button" class="az-btn" data-az="login-line">' + esc(T(U.loginLine)) + '</button>' +
      '<button type="button" class="az-btn ghost" data-az="login-tg">' + esc(T(U.loginTg)) + '</button></div></div>';
  }

  function menuHTML(){
    var me = who();
    var h = '';
    if(me){
      h += '<div class="az-me">' + (me.pictureUrl ? '<img src="' + esc(me.pictureUrl) + '" alt="">' : '') +
        '<span>' + esc(T(U.hello)) + ' <b>' + esc(me.nameOverride || me.displayName || '') + '</b></span></div>';
    }
    if(!sessionCode()) return h + loginGateHTML();
    if(metaErr) return h + '<div class="az-err">' + esc(T(U.err)) + '</div><button type="button" class="az-btn ghost" data-az="reload-meta">' + esc(T(U.retry)) + '</button>';
    if(!meta) return h + '<p class="az-note">' + esc(T(U.starting)) + '</p>';
    if(!meta.ready) return h + '<div class="az-card"><p class="az-note">' + esc(T(U.noBank)) + '</p></div>';
    h += '<p class="az-note" style="margin:0 0 14px">' + meta.questions + ' ' + esc(T(U.bankInfo)) + ' ' + meta.sets + ' ' + esc(T(U.bankSets)) + '</p>';
    if(errMsg) h += '<div class="az-err">' + esc(errMsg) + '</div>';
    var cnt = '<select class="az-sel" data-az="count">' + [5, 10, 20].map(function(n){
      return '<option value="' + n + '"' + (n === practiceCount ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>';
    h += '<div class="az-modes">' +
      '<div class="az-mode"><h3>' + esc(T(U.mPractice)) + ' <span class="az-badge">PRIVATE</span></h3><p>' + esc(T(U.mPracticeD)) + '</p>' +
        '<div class="az-row"><label class="az-note">' + esc(T(U.howMany)) + '</label>' + cnt + '</div>' +
        '<button type="button" class="az-btn" data-az="start" data-mode="practice">' + esc(T(U.start)) + '</button></div>' +
      '<div class="az-mode ranked"><h3>' + esc(T(U.mRanked)) + ' <span class="az-badge">45 ' + esc(T(U.secs)) + '</span></h3><p>' + esc(T(U.mRankedD)) + '</p>' +
        '<button type="button" class="az-btn" data-az="start" data-mode="ranked">' + esc(T(U.start)) + '</button></div>' +
      '<div class="az-mode blitz"><h3>' + esc(T(U.mBlitz)) + ' <span class="az-badge">15 ' + esc(T(U.secs)) + '</span></h3><p>' + esc(T(U.mBlitzD)) + '</p>' +
        '<button type="button" class="az-btn red" data-az="start" data-mode="blitz">' + esc(T(U.start)) + '</button></div>' +
      '</div>';
    return h;
  }

  /* ------------------------------ quiz ------------------------------ */
  function startRound(mode){
    if(busy) return;
    var code = sessionCode();
    if(!code){ paint(); return; }
    busy = true; errMsg = '';
    view = 'loading'; paint();
    api('/api/quiz/start', 'POST', { code: code, mode: mode, count: mode === 'practice' ? practiceCount : 10 }).then(function(r){
      busy = false;
      if(r.status !== 200){ errMsg = errText(r); view = 'menu'; paint(); return; }
      run = { mode: mode, token: r.j.token, q: r.j.q, qs: [r.j.q], picked: [], reveal: null, pending: null, sent: false };
      view = 'quiz'; beginQuestion(); paint();
    }).catch(function(){ busy = false; errMsg = T(U.err); view = 'menu'; paint(); });
  }

  function beginQuestion(){
    stopTimer();
    run.picked = []; run.reveal = null; run.sent = false;
    run.t0 = Date.now();
    if(run.q.tpq){
      run.deadline = run.t0 + run.q.tpq * 1000;
      timerIv = setInterval(tick, 100);
    } else { run.deadline = 0; }
  }
  function tick(){
    if(!run || view !== 'quiz' || run.sent){ stopTimer(); return; }
    var left = run.deadline - Date.now();
    var bar = bodyEl && bodyEl.querySelector('.az-timer');
    if(bar){
      var pct = Math.max(0, Math.min(100, left / (run.q.tpq * 1000) * 100));
      bar.firstChild.style.width = pct + '%';
      bar.classList.toggle('low', pct < 25);
      var lab = bodyEl.querySelector('[data-az-left]');
      if(lab) lab.textContent = Math.max(0, Math.ceil(left / 1000)) + ' ' + T(U.secs);
    }
    if(left <= 0){ stopTimer(); submitAnswer(true); }
  }

  function quizHTML(){
    var q = run.q, timed = !!q.tpq, locked = run.sent || !!run.reveal;
    var nocopy = run.mode !== 'practice';
    var pct = Math.round((q.i + (run.reveal ? 1 : 0)) / q.total * 100);
    var letters = 'ABCDEFGH';
    var h = '<div class="az-card' + (nocopy ? ' az-nocopy' : '') + '">' +
      '<div class="az-prog"><i style="width:' + pct + '%"></i></div>' +
      '<div class="az-qmeta"><span>' + esc(T(U.qOf)) + ' ' + (q.i + 1) + ' ' + esc(T(U.of)) + ' ' + q.total + '</span><span data-az-left>' + (timed ? q.tpq + ' ' + esc(T(U.secs)) : '') + '</span></div>' +
      (timed ? '<div class="az-timer"><i></i></div>' : '') +
      '<p class="az-qtext">' + esc(q.t) + '</p>' +
      '<div class="az-hint">' + esc(T(q.m ? U.pickMany : U.pickOne)) + '</div><div class="az-opts">';
    for(var k = 0; k < q.c.length; k++){
      var cls = 'az-opt';
      if(run.reveal){
        var isRight = run.reveal.k[k] === 1, isPick = run.picked.indexOf(k) >= 0;
        if(isRight) cls += ' ok'; else if(isPick) cls += ' bad';
      } else if(run.picked.indexOf(k) >= 0) cls += ' sel';
      h += '<button type="button" class="' + cls + '" data-az="opt" data-i="' + k + '"' + (locked ? ' disabled' : '') + '>' +
        '<span class="az-l">' + letters.charAt(k) + '</span><span>' + esc(q.c[k]) + '</span></button>';
    }
    h += '</div>';
    if(run.reveal){
      var ok = run.reveal.o === 1;
      var ex = run.reveal.e || ['', ''];
      var txt = (L() === 'th' ? (ex[1] || ex[0]) : ex[0]) || T(U.noExplain);
      h += '<div class="az-verdict ' + (ok ? 'ok' : 'bad') + '">' + esc(T(ok ? U.correct : U.wrong)) + '</div>' +
        '<div class="az-exp"><b>' + esc(T(U.explain)) + ':</b> ' + esc(txt) + '</div>' +
        '<button type="button" class="az-btn" data-az="next">' + esc(T(run.pending && run.pending.done ? U.finish : U.next)) + '</button>';
    } else {
      var needConfirm = !(run.mode === 'blitz' && !q.m);
      if(needConfirm) h += '<button type="button" class="az-btn" data-az="confirm"' + (run.sent || !run.picked.length ? ' disabled' : '') + '>' + esc(T(U.confirm)) + '</button>';
    }
    if(nocopy) h += '<p class="az-note" style="margin-top:12px">' + esc(T(U.nocopy)) + '</p>';
    return h + '</div>';
  }

  function onOpt(i){
    if(!run || run.sent || run.reveal) return;
    var q = run.q, p = run.picked, at = p.indexOf(i);
    if(q.m){ if(at >= 0) p.splice(at, 1); else p.push(i); }
    else { run.picked = [i]; }
    if(!q.m && run.mode === 'blitz'){ submitAnswer(false); return; }
    paint();
  }

  function submitAnswer(auto){
    if(!run || run.sent) return;
    run.sent = true; stopTimer();
    var code = sessionCode();
    paint();
    api('/api/quiz/answer', 'POST', { code: code, token: run.token, choice: run.picked.slice() }).then(function(r){
      if(r.status !== 200){ errMsg = errText(r); view = 'menu'; run = null; paint(); return; }
      var j = r.j;
      run.picks = run.picks || [];
      run.picks.push(run.picked.slice());
      if(j.done){
        if(run.mode === 'practice' && run.q && !run.reveal){
          // last practice question: show its explanation first, result after
        }
        run.final = j;
        if(run.mode === 'practice'){
          run.reveal = { k: j.review[j.review.length - 1].k, o: j.review[j.review.length - 1].o, e: j.review[j.review.length - 1].e };
          run.pending = { done: true };
          paint();
        } else { view = 'result'; paint(); }
        return;
      }
      if(run.mode === 'practice'){
        run.reveal = j.reveal; run.pending = j; paint();
      } else {
        advance(j);
      }
    }).catch(function(){ errMsg = T(U.err); view = 'menu'; run = null; paint(); });
  }

  function advance(j){
    run.token = j.token; run.q = j.q; run.qs.push(j.q);
    beginQuestion(); paint();
  }
  function onNext(){
    if(!run || !run.reveal) return;
    if(run.pending && run.pending.done){ view = 'result'; paint(); return; }
    var j = run.pending; run.pending = null;
    advance(j);
  }

  /* ------------------------------ result ------------------------------ */
  function resultHTML(){
    var f = run.final, letters = 'ABCDEFGH';
    var h = '<div class="az-card"><div class="az-big"><div class="az-qmeta" style="justify-content:center">' + esc(T(U.resultH)) + '</div>';
    if(run.mode !== 'practice'){
      h += '<div class="az-score">' + f.score + '</div><div class="az-note">' + esc(T(U.pts)) + '</div>';
    } else {
      h += '<div class="az-score">' + f.correct + '/' + f.total + '</div>';
    }
    h += '<div class="az-stats"><div><b>' + f.correct + '/' + f.total + '</b>' + esc(T(U.rightN)) + '</div>' +
      '<div><b>' + fmtMs(f.ms) + '</b>' + esc(T(U.timeTotal)) + '</div>';
    if(run.mode !== 'practice'){
      h += '<div><b>#' + (f.rankWeek || '–') + '</b>' + esc(T(U.rankWeek)) + '</div><div><b>#' + (f.rankAll || '–') + '</b>' + esc(T(U.rankAll)) + '</div>';
    }
    h += '</div>';
    if(run.mode === 'practice') h += '<p class="az-note">' + esc(T(U.practiceDone)) + '</p>';
    else h += '<p class="az-note">' + esc(T(f.newBest ? U.newBest : U.notBest)) + '</p>';
    h += '</div><div class="az-row" style="justify-content:center;margin-top:10px">' +
      '<button type="button" class="az-btn" data-az="again">' + esc(T(U.again)) + '</button>' +
      (run.mode !== 'practice' ? '<button type="button" class="az-btn ghost" data-az="goboard">' + esc(T(U.toBoard)) + '</button>' : '') +
      '<button type="button" class="az-btn ghost" data-az="menu">' + esc(T(U.toMenu)) + '</button></div></div>';
    h += '<div class="az-card"><h3 style="margin:0 0 6px;color:var(--white)">' + esc(T(U.review)) + '</h3>';
    for(var i = 0; i < f.review.length; i++){
      var rv = f.review[i], q = run.qs[i];
      if(!q) continue;
      var yours = (rv.d || []).map(function(d){ return letters.charAt(d) + '. ' + q.c[d]; }).join('; ');
      var right = rv.k.map(function(v, idx){ return v ? letters.charAt(idx) + '. ' + q.c[idx] : null; }).filter(Boolean).join('; ');
      var ex = rv.e || ['', ''];
      var txt = (L() === 'th' ? (ex[1] || ex[0]) : ex[0]);
      h += '<div class="az-rev"><h4>' + (i + 1) + '. ' + esc(q.t) + '</h4>' +
        '<div class="a ' + (rv.o ? 'ok' : 'bad') + '">' + esc(T(U.yourAns)) + ': ' + esc(yours || T(U.none)) + (rv.l ? ' (' + esc(T(U.late)) + ')' : '') + '</div>' +
        (rv.o ? '' : '<div class="a ok">' + esc(T(U.rightAns)) + ': ' + esc(right) + '</div>') +
        (txt ? '<div class="a" style="margin-top:6px">' + esc(txt) + '</div>' : '') + '</div>';
    }
    return h + '</div>';
  }

  /* ---------------------------- leaderboard ---------------------------- */
  function loadBoard(){
    board.loading = true; board.err = false; paint();
    var code = sessionCode() || '';
    api('/api/quiz/leaderboard?mode=' + board.mode + '&period=' + board.period + (code ? '&code=' + encodeURIComponent(code) : ''), 'GET').then(function(r){
      board.loading = false;
      if(r.status !== 200){ board.err = true; board.data = null; } else board.data = r.j;
      paint();
    }).catch(function(){ board.loading = false; board.err = true; paint(); });
  }
  function avatar(p){ return p ? '<img src="' + esc(p) + '" alt="" referrerpolicy="no-referrer">' : ''; }

  function boardHTML(){
    var seg = function(attr, cur, items){
      return '<div class="az-seg">' + items.map(function(it){
        return '<button type="button" class="az-tab' + (cur === it[0] ? ' on' : '') + '" data-az="' + attr + '" data-v="' + it[0] + '">' + esc(T(it[1])) + '</button>'; }).join('') + '</div>';
    };
    var h = seg('bmode', board.mode, [['ranked', U.bRanked], ['blitz', U.bBlitz]]) + seg('bper', board.period, [['week', U.pWeek], ['all', U.pAll]]);
    if(board.loading) return h + '<p class="az-note">' + esc(T(U.starting)) + '</p>';
    if(board.err || !board.data) return h + '<div class="az-err">' + esc(T(U.err)) + '</div><button type="button" class="az-btn ghost" data-az="reload-board">' + esc(T(U.retry)) + '</button>';
    var d = board.data, es = d.entries || [];
    h += '<p class="az-note">' + d.players + ' ' + esc(T(U.players)) + (d.weekEndsAt ? ' · ' + esc(T(U.resets)) + ' ' + fmtLeft(Math.max(0, d.weekEndsAt - Date.now())) : '') + '</p>';
    if(!es.length) return h + '<div class="az-card"><p class="az-note">' + esc(T(U.empty)) + '</p></div>';
    var colors = ['#ffd24a', '#cfd6dc', '#d08a4a'];
    function pod(e, pos){
      if(!e) return '<div class="az-pod p' + pos + ' empty">' + trophySVG(colors[pos - 1]) + '<div class="nm">–</div></div>';
      return '<div class="az-pod p' + pos + (e.me ? ' me' : '') + '">' + trophySVG(colors[pos - 1]) + avatar(e.p) +
        '<div class="nm">' + esc(e.n) + (e.me ? ' (' + esc(T(U.you)) + ')' : '') + '</div>' +
        '<div class="sc">' + e.s + '</div><div class="sub">' + e.c + '/10 · ' + fmtMs(e.ms) + '</div></div>';
    }
    h += '<div class="az-podium">' + pod(es[1], 2) + pod(es[0], 1) + pod(es[2], 3) + '</div>';
    if(es.length > 3){
      h += '<div class="az-qmeta">' + esc(T(U.runners)) + '</div>';
      for(var i = 3; i < es.length; i++){
        var e = es[i];
        h += '<div class="az-runner' + (e.me ? ' me' : '') + '"><span class="rk">' + e.rank + '</span>' + avatar(e.p) +
          '<span class="nm">' + esc(e.n) + (e.me ? ' (' + esc(T(U.you)) + ')' : '') + '</span><span class="sc">' + e.s + '</span></div>';
      }
    }
    if(d.you && d.you.rank > es.length){
      h += '<div class="az-qmeta" style="margin-top:14px">' + esc(T(U.youRank)) + '</div><div class="az-runner me"><span class="rk">' + d.you.rank + '</span>' + avatar(d.you.p) +
        '<span class="nm">' + esc(d.you.n) + '</span><span class="sc">' + d.you.s + '</span></div>';
    }
    return h;
  }

  /* ------------------------------ shell ------------------------------ */
  function loadMeta(){
    if(metaLoading) return;
    metaLoading = true; metaErr = false;
    api('/api/quiz/meta', 'GET').then(function(r){
      metaLoading = false;
      if(r.status !== 200){ metaErr = true; } else meta = r.j;
      paint();
    }).catch(function(){ metaLoading = false; metaErr = true; paint(); });
  }

  function paint(){
    if(!bodyEl) return;
    var tabs = '<div class="az-tabs"><button type="button" class="az-tab' + (tab === 'play' ? ' on' : '') + '" data-az="tab" data-v="play">' + esc(T(U.tabPlay)) +
      '</button><button type="button" class="az-tab' + (tab === 'board' ? ' on' : '') + '" data-az="tab" data-v="board">' + esc(T(U.tabBoard)) + '</button></div>';
    var inner;
    if(tab === 'board') inner = boardHTML();
    else if(view === 'loading') inner = '<p class="az-note">' + esc(T(U.starting)) + '</p>';
    else if(view === 'quiz' && run) inner = quizHTML();
    else if(view === 'result' && run && run.final) inner = resultHTML();
    else inner = menuHTML();
    // keep the quiz free of the tab strip so nobody leaves a timed round by accident
    var showTabs = !(tab === 'play' && (view === 'quiz' || view === 'loading'));
    bodyEl.innerHTML = '<div class="az-wrap">' + (showTabs ? tabs : '') + inner + '</div>';
    if(tab === 'play' && view === 'menu' && !sessionCode()) watchLogin(); else stopWatch();
    if(view === 'quiz' && run && run.q.tpq && !run.sent && !run.reveal) tick();
  }
  function watchLogin(){
    if(loginPoll) return;
    loginPoll = setInterval(function(){ if(sessionCode()){ stopWatch(); if(!meta) loadMeta(); paint(); } }, 1500);
  }
  function stopWatch(){ if(loginPoll){ clearInterval(loginPoll); loginPoll = null; } }

  function onClick(ev){
    var el = ev.target.closest('[data-az]');
    if(!el || !bodyEl.contains(el)) return;
    var a = el.getAttribute('data-az');
    if(a === 'tab'){ stopTimer(); tab = el.getAttribute('data-v'); if(tab === 'board') loadBoard(); else paint(); }
    else if(a === 'login-line'){ if(window.__SPZ_LINE) window.__SPZ_LINE.open(); }
    else if(a === 'login-tg'){ if(window.__SPZ_TG) window.__SPZ_TG.open(); }
    else if(a === 'reload-meta'){ loadMeta(); }
    else if(a === 'reload-board'){ loadBoard(); }
    else if(a === 'start'){ startRound(el.getAttribute('data-mode')); }
    else if(a === 'opt'){ onOpt(parseInt(el.getAttribute('data-i'), 10)); }
    else if(a === 'confirm'){ if(run && run.picked.length) submitAnswer(false); }
    else if(a === 'next'){ onNext(); }
    else if(a === 'again'){ var m = run ? run.mode : 'practice'; run = null; startRound(m); }
    else if(a === 'menu'){ run = null; view = 'menu'; paint(); }
    else if(a === 'goboard'){ board.mode = run && run.mode === 'blitz' ? 'blitz' : 'ranked'; tab = 'board'; loadBoard(); }
    else if(a === 'bmode'){ board.mode = el.getAttribute('data-v'); loadBoard(); }
    else if(a === 'bper'){ board.period = el.getAttribute('data-v'); loadBoard(); }
  }

  function build(){
    if(document.getElementById('arena')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    var st = document.createElement('style');
    st.id = 'arenaCss';
    st.textContent = CSS;
    document.head.appendChild(st);

    sec = document.createElement('section');
    sec.id = 'arena';
    sec.setAttribute('data-route', 'arena');
    sec.innerHTML =
      '<div class="ewv-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-az-h="eb"></span></div>' +
          '<h2 data-az-h="h"></h2>' +
          '<p class="lede" data-az-h="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-az-h="body"></div>' +
      '</div>';
    document.body.appendChild(sec);
    bodyEl = sec.querySelector('[data-az-h="body"]');
    bodyEl.addEventListener('click', onClick);
    bodyEl.addEventListener('change', function(ev){
      var el = ev.target.closest('[data-az="count"]');
      if(el) practiceCount = parseInt(el.value, 10) || 10;
    });
    ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach(function(evn){
      bodyEl.addEventListener(evn, function(ev){
        if(view === 'quiz' && run && run.mode !== 'practice' && !run.reveal) ev.preventDefault();
      });
    });

    window.__spzAddRoute({
      id: 'arena', after: 'elliott',
      t: { en: 'Exam Arena', th: 'สนามสอบ CEWA' },
      d: { en: 'Random mock-exam questions: private practice, ranked rounds, and a 15-second Blitz mode with a leaderboard.',
           th: 'สุ่มข้อสอบจำลอง ฝึกส่วนตัว แข่งขันขึ้นอันดับ และโหมดตอบเร็ว 15 วินาที พร้อมกระดานอันดับ' }
    });

    sec.__render = repaintText;
    repaintText();
    return true;
  }

  function repaintText(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-az-h="' + k + '"]'); };
    if(q('eb')) q('eb').textContent = T(U.eb);
    if(q('h')) q('h').textContent = T(U.h);
    if(q('lede')) q('lede').textContent = T(U.lede);
    if(!meta && !metaLoading && !metaErr) loadMeta();
    paint();
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) repaintText(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('hashchange', function(){
      if(location.hash !== '#/arena'){ stopTimer(); stopWatch(); }
      else if(sec){ if(view === 'quiz' && run && !run.sent && !run.reveal){ /* resume ticking */ if(run.q.tpq && !timerIv) timerIv = setInterval(tick, 100); } repaintText(); }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
