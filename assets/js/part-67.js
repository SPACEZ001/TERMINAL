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

  var QP_BASE = 100, QP_SPEED = 50;
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
    timedNote: { en:'Pick an answer, then press Confirm to move on. If time runs out, the answer you have selected is submitted automatically.', th:'เลือกคำตอบแล้วกดยืนยันเพื่อไปข้อถัดไป ถ้าหมดเวลาโดยที่เลือกไว้แล้วแต่ยังไม่ได้ยืนยัน ระบบจะส่งคำตอบที่เลือกไว้ให้อัตโนมัติ' },
    podiumHit: { en:'You are on the podium!', th:'คุณติดโพเดียม!' },
    nocopy: { en:'Copying is disabled in timed modes.', th:'โหมดจับเวลาปิดการคัดลอกข้อความ' },
    d: { en:'d', th:'ว.' }, h2: { en:'h', th:'ชม.' }, m2: { en:'m', th:'น.' }
  };

  var CSS = '' +
  '.az-wrap{max-width:none;margin:0;}' +
  '.az-tabs{display:flex;gap:8px;margin:0 0 22px;flex-wrap:wrap;}' +
  '.az-tab{font-family:var(--mono);font-size:12.5px;letter-spacing:1px;text-transform:uppercase;padding:10px 18px;border-radius:12px;border:1px solid var(--border-dim);background:var(--glass);color:var(--grey);cursor:pointer;}' +
  '.az-tab.on{border-color:var(--neon);color:var(--neon);background:rgba(204,255,0,.06);}' +
  '.az-card{border:1px solid var(--border-dim);background:rgba(10,11,18,.74);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:var(--radius);padding:22px;margin-bottom:16px;}' +
  '.az-me{display:flex;align-items:center;gap:12px;color:var(--grey);font-size:13.5px;margin-bottom:18px;}' +
  '.az-me img{width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid var(--border);}' +
  '.az-me b{color:var(--white);}' +
  '.az-modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;}' +
  '.az-mode{border:1px solid var(--border-dim);background:rgba(10,11,18,.74);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:10px;}' +
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
  '.az-runner{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;border:1px solid var(--border-dim);margin-bottom:8px;color:#a5aaa0;font-size:14px;background:rgba(255,255,255,.015);}' +
  '.az-runner .nm{flex:1;word-break:break-word;}' +
  '.az-runner .sc{font-family:var(--mono);color:#b9c58a;}' +
  '.az-runner.me{border-color:var(--neon);box-shadow:0 0 14px rgba(204,255,0,.15);}' +
  '@media (max-width:560px){.az-big .az-score{font-size:44px;}}' +
  '#arena{position:relative;}' +
  '#arena>.ewv-wrap{position:relative;z-index:1;}' +
  '.az-sky{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:radial-gradient(ellipse 55% 38% at 12% 6%,rgba(110,78,255,.20),transparent 70%),radial-gradient(ellipse 48% 36% at 92% 24%,rgba(0,210,255,.12),transparent 70%),radial-gradient(ellipse 60% 40% at 50% 104%,rgba(204,255,0,.07),transparent 70%);}' +
  '.az-sky i{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 90px 120px,#bfeaff,transparent),radial-gradient(1.6px 1.6px at 160px 60px,#fff,transparent),radial-gradient(1px 1px at 230px 180px,#ffe9a8,transparent),radial-gradient(1px 1px at 40px 190px,#fff,transparent);background-size:260px 220px;opacity:.6;animation:azTw 5s ease-in-out infinite alternate;}' +
  '.az-sky i:nth-child(2){background-size:350px 310px;background-position:70px 90px;animation-duration:8s;opacity:.4;}' +
  '.az-sky i:nth-child(3){background-size:190px 170px;background-position:20px 40px;animation-duration:3.6s;opacity:.3;}' +
  '.az-sky u{position:absolute;top:12%;left:-20%;width:160px;height:2px;background:linear-gradient(90deg,transparent,#fff);transform:rotate(18deg);opacity:0;animation:azShoot 11s linear infinite;}' +
  '.az-sky u:nth-of-type(2){top:46%;animation-delay:5.5s;animation-duration:14s;}' +
  '.az-sky svg{position:absolute;right:-70px;top:90px;width:260px;height:260px;opacity:.5;animation:azFloat 16s ease-in-out infinite;}' +
  '.az-card,.az-mode{box-shadow:0 0 0 1px rgba(255,255,255,.02),0 10px 40px rgba(0,0,0,.35);}' +
  '.az-mode{transition:transform .25s,box-shadow .25s,border-color .25s;}' +
  '.az-mode:hover{transform:translateY(-3px);box-shadow:0 14px 44px rgba(0,0,0,.5),0 0 28px rgba(204,255,0,.10);}' +
  '.az-mode.blitz:hover{box-shadow:0 14px 44px rgba(0,0,0,.5),0 0 28px rgba(255,59,78,.16);}' +
  '.az-mi{width:34px;height:34px;flex-shrink:0;filter:drop-shadow(0 0 8px rgba(204,255,0,.45));}' +
  '.az-mode.blitz .az-mi{filter:drop-shadow(0 0 8px rgba(255,59,78,.55));}' +
  '.az-tab{transition:all .2s;} .az-tab.on{box-shadow:0 0 16px rgba(204,255,0,.18);}' +
  '.az-btn{transition:transform .15s,box-shadow .2s;} .az-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 0 18px rgba(204,255,0,.35);} .az-btn.red:not(:disabled):hover{box-shadow:0 0 18px rgba(255,59,78,.45);}' +
  '.az-timer i{box-shadow:0 0 10px currentColor;color:var(--neon);} .az-timer.low i{color:var(--red);animation:azPulse .6s ease-in-out infinite alternate;}' +
  '.az-opt{transition:border-color .15s,background .15s,transform .15s;} .az-opt:not(:disabled):hover{transform:translateX(3px);} .az-opt.sel{box-shadow:0 0 16px rgba(204,255,0,.15);}' +
  '.az-ringwrap{position:relative;width:176px;height:176px;margin:6px auto 4px;}' +
  '.az-ring{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 10px rgba(204,255,0,.4));}' +
  '.az-ringin{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}' +
  '.az-ringin .az-score{font-size:42px !important;}' +
  '.az-podhit{display:flex;align-items:center;justify-content:center;gap:10px;color:#ffd24a;font-family:var(--mono);font-size:13px;letter-spacing:1px;margin:8px 0;}' +
  '.az-podhit svg{width:44px;height:auto;margin:0 !important;animation:none !important;flex-shrink:0;filter:drop-shadow(0 0 10px rgba(255,210,74,.6));}' +
  '.az-podium{max-width:980px;margin-left:auto !important;margin-right:auto !important;display:grid;grid-template-columns:1fr 1.12fr 1fr;gap:14px;align-items:end;margin:30px 0 28px;}' +
  '.az-slot{display:flex;flex-direction:column;position:relative;}' +
  '.az-slot.s1{--mc:255,210,74;z-index:2;} .az-slot.s2{--mc:207,214,220;} .az-slot.s3{--mc:208,138,74;}' +
  '.az-pod{position:relative;text-align:center;padding:16px 8px 14px;border:1px solid rgba(var(--mc),.5);border-bottom:0;border-radius:var(--radius) var(--radius) 0 0;background:linear-gradient(180deg,rgba(var(--mc),.12),rgba(10,11,18,.78) 75%);}' +
  '.az-slot.s1 .az-pod{padding-top:22px;box-shadow:0 -12px 44px rgba(var(--mc),.20);}' +
  '.az-pod>*{position:relative;z-index:1;}' +
  '.az-pod.me{box-shadow:0 0 0 1px var(--neon),0 0 22px rgba(204,255,0,.25);}' +
  '.az-rays{position:absolute !important;z-index:0 !important;left:50%;top:-20px;width:380px;height:380px;margin-left:-190px;background:repeating-conic-gradient(rgba(255,210,74,.16) 0 5deg,transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 66%);mask-image:radial-gradient(circle,#000 0,transparent 66%);animation:azSpin 46s linear infinite;pointer-events:none;}' +
  '.az-troph{width:84px;height:auto;display:block;margin:0 auto 4px;filter:drop-shadow(0 0 14px rgba(var(--mc),.6));animation:azBob 4.2s ease-in-out infinite;overflow:visible;}' +
  '.az-slot.s1 .az-troph{width:118px;}' +
  '.az-slot.s2 .az-troph{animation-delay:-1.2s;} .az-slot.s3 .az-troph{animation-delay:-2.4s;}' +
  '.az-troph .sp{transform-box:fill-box;transform-origin:center;animation:azSpark 2.6s ease-in-out infinite;}' +
  '.az-troph .sp2{animation-delay:-.9s;} .az-troph .sp3{animation-delay:-1.7s;}' +
  '.az-ava{width:46px;height:46px;border-radius:50%;margin:8px auto 0;display:flex;align-items:center;justify-content:center;object-fit:cover;background:#10131c;color:rgb(var(--mc,204,255,0));font-family:var(--mono);font-weight:700;font-size:18px;border:2px solid rgb(var(--mc,204,255,0));box-shadow:0 0 14px rgba(var(--mc,204,255,0),.55);}' +
  '.az-slot.s1 .az-ava{width:56px;height:56px;}' +
  '.az-pod .nm{font-size:14px;color:var(--white);word-break:break-word;margin-top:8px;}' +
  '.az-pod .sc{font-family:var(--mono);font-size:19px;color:rgb(var(--mc));margin-top:2px;text-shadow:0 0 12px rgba(var(--mc),.55);}' +
  '.az-slot.s1 .az-pod .sc{font-size:24px;}' +
  '.az-pod .sub{font-family:var(--mono);font-size:11px;color:var(--grey);}' +
  '.az-pod.empty{opacity:.4;}' +
  '.az-ped{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid rgba(var(--mc),.5);background:linear-gradient(180deg,rgba(var(--mc),.38),rgba(var(--mc),.09) 60%,rgba(10,11,18,.85));box-shadow:inset 0 1px 0 rgba(var(--mc),.95),0 14px 30px rgba(var(--mc),.10);}' +
  '.az-slot.s1 .az-ped{height:118px;} .az-slot.s2 .az-ped{height:82px;} .az-slot.s3 .az-ped{height:56px;}' +
  '.az-ped b{font-family:var(--mono);font-weight:800;font-size:46px;line-height:1;background:linear-gradient(180deg,#fff,rgb(var(--mc)));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 8px rgba(var(--mc),.5));}' +
  '.az-ped::after{content:"";position:absolute;top:0;left:-70%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.32),transparent);transform:skewX(-20deg);animation:azSweep 5s ease-in-out infinite;}' +
  '.az-runner{position:relative;overflow:hidden;}' +
  '.az-runner .rk{position:relative;width:34px;height:34px;flex-shrink:0;}' +
  '.az-runner .rk svg{width:34px;height:34px;display:block;}' +
  '.az-runner .az-ava{width:28px;height:28px;font-size:12px;margin:0;border-width:1px;box-shadow:none;}' +
  '.az-tabs{margin:0 0 20px;}' +
  '.az-segc{display:inline-flex;gap:4px;padding:4px;border-radius:999px;border:1px solid var(--border-dim);background:rgba(10,11,18,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 6px 24px rgba(0,0,0,.35);max-width:100%;}' +
  '.az-segc.big .az-sg{padding:12px 26px;font-size:13.5px;}' +
  '.az-sg{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--mono);font-size:12.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:9px 18px;border-radius:999px;border:1px solid transparent;background:transparent;color:var(--grey);cursor:pointer;white-space:nowrap;transition:color .2s,background .2s,box-shadow .2s,border-color .2s,transform .15s;}' +
  '.az-sg svg{width:16px;height:16px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;}' +
  '.az-sg:hover{color:var(--white);background:rgba(255,255,255,.05);}' +
  '.az-sg.on{color:var(--neon);border-color:color-mix(in srgb,var(--neon) 65%,transparent);background:linear-gradient(135deg,color-mix(in srgb,var(--neon) 24%,transparent),color-mix(in srgb,var(--neon) 7%,transparent));box-shadow:0 0 18px color-mix(in srgb,var(--neon) 32%,transparent),inset 0 1px 0 rgba(255,255,255,.12);}' +
  '.az-sg.on.red{color:var(--red);border-color:rgba(255,59,78,.65);background:linear-gradient(135deg,rgba(255,59,78,.24),rgba(255,59,78,.06));box-shadow:0 0 18px rgba(255,59,78,.3),inset 0 1px 0 rgba(255,255,255,.12);}' +
  '.az-filters{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 16px;}' +
  '@media (max-width:560px){.az-segc{display:flex;width:100%;} .az-sg{flex:1;padding:10px 8px;font-size:11.5px;letter-spacing:.5px;gap:6px;} .az-segc.big .az-sg{padding:12px 8px;font-size:12px;} .az-filters{gap:8px;} .az-filters .az-segc{width:100%;}}' +
  '@keyframes azTw{from{opacity:.25}to{opacity:.8}}' +
  '@keyframes azShoot{0%{transform:translate(0,0) rotate(18deg);opacity:0}2%{opacity:.9}9%{transform:translate(1100px,360px) rotate(18deg);opacity:0}100%{opacity:0}}' +
  '@keyframes azFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}' +
  '@keyframes azBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
  '@keyframes azSpin{to{transform:rotate(360deg)}}' +
  '@keyframes azSweep{0%,55%{left:-70%}100%{left:130%}}' +
  '@keyframes azSpark{0%,100%{opacity:.15;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}' +
  '@keyframes azPulse{from{opacity:.65}to{opacity:1}}' +
  '@keyframes azRing{from{stroke-dashoffset:var(--c)}to{stroke-dashoffset:var(--o)}}' +
  '@media (prefers-reduced-motion:reduce){.az-sky *,.az-troph,.az-troph .sp,.az-rays,.az-ped::after,.az-timer i{animation:none !important;}}' +
  '@media (max-width:560px){.az-podium{gap:6px;} .az-troph{width:58px;} .az-slot.s1 .az-troph{width:78px;} .az-ped b{font-size:30px;} .az-slot.s1 .az-ped{height:88px;} .az-slot.s2 .az-ped{height:62px;} .az-slot.s3 .az-ped{height:42px;} .az-pod .nm{font-size:12px;} .az-pod .sc{font-size:15px;} .az-slot.s1 .az-pod .sc{font-size:18px;} .az-ava{width:36px;height:36px;} .az-slot.s1 .az-ava{width:44px;height:44px;} .az-sky svg{display:none;}}';

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
  var MET = {
    1:{hi:'#fff6c4',mid:'#ffd24a',lo:'#9a6a08',g:'255,210,74'},
    2:{hi:'#ffffff',mid:'#cfd6dc',lo:'#66717c',g:'207,214,220'},
    3:{hi:'#ffdcb4',mid:'#d08a4a',lo:'#6a3510',g:'208,138,74'}
  };
  var uid = 0;
  function starPts(cx, cy, ro, ri){
    var p = [];
    for(var k = 0; k < 10; k++){
      var a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? ri : ro;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  function sparkle(x, y, r, cls, col){
    return '<path class="sp ' + cls + '" d="M' + x + ' ' + (y - r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'Z" fill="' + col + '"/>';
  }
  function trophySVG(pos, dim){
    var m = MET[pos], id = 'azg' + (++uid);
    var A = 'url(#' + id + 'a)', B = 'url(#' + id + 'b)';
    var crown = pos === 1 ?
      '<path d="M40 8L35 -8l12 8 13-14 13 14 12-8-5 16z" fill="' + A + '" stroke="' + m.lo + '" stroke-width=".8"/>' +
      '<circle cx="60" cy="-7" r="2.4" fill="#ff5a7a"/><circle cx="43" cy="-2" r="1.8" fill="#47e0ff"/><circle cx="77" cy="-2" r="1.8" fill="#47e0ff"/>' : '';
    return '<svg class="az-troph" viewBox="0 -20 120 146" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + 'a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + m.lo + '"/><stop offset=".28" stop-color="' + m.hi + '"/><stop offset=".62" stop-color="' + m.mid + '"/><stop offset="1" stop-color="' + m.lo + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + m.mid + '"/><stop offset="1" stop-color="' + m.lo + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'c"><stop offset="0" stop-color="rgb(' + m.g + ')" stop-opacity=".5"/><stop offset="1" stop-color="rgb(' + m.g + ')" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="60" cy="56" r="60" fill="url(#' + id + 'c)"/>' +
      '<path d="M30 28H15c0 20 8 31 22 35" fill="none" stroke="' + B + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M90 28h15c0 20-8 31-22 35" fill="none" stroke="' + B + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M28 18h64v26c0 22-14 38-32 38S28 66 28 44z" fill="' + A + '"/>' +
      '<rect x="23" y="11" width="74" height="10" rx="5" fill="' + A + '"/>' +
      '<path d="M39 28c0 17 4 29 12 38" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<polygon points="' + starPts(62, 45, 12, 5) + '" fill="#fff" fill-opacity=".9"/>' +
      '<path d="M53 80h14l3 16H50z" fill="' + B + '"/>' +
      '<rect x="38" y="95" width="44" height="9" rx="3" fill="' + A + '"/>' +
      '<rect x="29" y="104" width="62" height="16" rx="4" fill="' + A + '"/>' +
      '<rect x="44" y="108" width="32" height="8" rx="2.5" fill="#080a10" fill-opacity=".6"/>' +
      '<text x="60" y="114.6" text-anchor="middle" font-size="8" font-weight="700" fill="rgb(' + m.g + ')" font-family="monospace">' + (dim ? '' : pos) + '</text>' +
      crown +
      sparkle(12, 10, 7, 'sp1', m.hi) + sparkle(110, 34, 6, 'sp2', '#fff') + sparkle(100, 92, 5, 'sp3', m.hi) +
      '</svg>';
  }
  function rankBadge(n){
    return '<span class="rk"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 2l14 8v16l-14 8L4 26V10z" fill="rgba(204,255,0,.07)" stroke="rgba(204,255,0,.5)" stroke-width="1.4"/>' +
      '<text x="18" y="22" text-anchor="middle" font-size="' + (n > 99 ? 10 : 12) + '" font-weight="700" fill="#b9c58a" font-family="monospace">' + n + '</text></svg></span>';
  }
  function modeIcon(kind){
    var g = '<defs><linearGradient id="azmi' + kind + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:' + (kind === 'blitz' ? '#ff8a98' : 'var(--neon)') + '"/><stop offset="1" stop-color="' + (kind === 'blitz' ? '#ff3b4e' : '#00e5ff') + '"/></linearGradient></defs>';
    var f = 'url(#azmi' + kind + ')', body;
    if(kind === 'practice') body = '<circle cx="16" cy="16" r="7" fill="' + f + '"/><ellipse cx="16" cy="16" rx="13" ry="4.2" fill="none" stroke="' + f + '" stroke-width="1.8" transform="rotate(-24 16 16)"/>';
    else if(kind === 'ranked') body = '<path d="M16 2.5l11 3.6v8.2c0 7-4.6 12-11 15.2C9.6 26.3 5 21.3 5 14.3V6.1z" fill="none" stroke="' + f + '" stroke-width="2"/><polygon points="' + starPts(16, 15, 6.5, 2.8) + '" fill="' + f + '"/>';
    else body = '<path d="M18.5 2L7 18h7.5L12.5 30 25 13h-7.5z" fill="' + f + '"/>';
    return '<svg class="az-mi" viewBox="0 0 32 32" aria-hidden="true">' + g + body + '</svg>';
  }
  function ringSVG(frac){
    var C = 2 * Math.PI * 52, o = C * (1 - Math.max(0, Math.min(1, frac)));
    return '<svg class="az-ring" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="azrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--neon)"/><stop offset="1" stop-color="#00e5ff"/></linearGradient></defs>' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="7"/>' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="url(#azrg)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" transform="rotate(-90 60 60)" style="--c:' + C.toFixed(1) + ';--o:' + o.toFixed(1) + ';animation:azRing 1.3s .15s cubic-bezier(.2,.7,.2,1) forwards"/></svg>';
  }
  function skyHTML(){
    return '<i></i><i></i><i></i><u></u><u></u>' +
      '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="azpl" cx=".35" cy=".3"><stop offset="0" stop-color="#8a7bff"/><stop offset=".6" stop-color="#3a2f9a"/><stop offset="1" stop-color="#120e3a"/></radialGradient></defs>' +
      '<ellipse cx="100" cy="100" rx="94" ry="22" fill="none" stroke="rgba(160,190,255,.35)" stroke-width="3" transform="rotate(-20 100 100)"/>' +
      '<circle cx="100" cy="100" r="46" fill="url(#azpl)"/>' +
      '<path d="M10 118c40 18 150-8 182-52" fill="none" stroke="rgba(160,190,255,.55)" stroke-width="3" transform="rotate(0)" opacity=".0"/>' +
      '<ellipse cx="100" cy="100" rx="94" ry="22" fill="none" stroke="rgba(160,190,255,.55)" stroke-width="3" transform="rotate(-20 100 100)" stroke-dasharray="150 400" stroke-dashoffset="-60"/></svg>';
  }

  function ico(k){
    var d = {
      play:'<circle cx="8" cy="8" r="3.6"/><ellipse cx="8" cy="8" rx="7" ry="2.4" transform="rotate(-24 8 8)"/>',
      board:'<path d="M5 2.5h6v4a3 3 0 0 1-6 0z"/><path d="M5 3.8H2.6c0 2 1 3.2 2.6 3.4M11 3.8h2.4c0 2-1 3.2-2.6 3.4M8 9.8v2.4M5.4 13.5h5.2"/>',
      ranked:'<path d="M8 1.6l5.4 2v4.1c0 3.1-2.2 5.3-5.4 6.7-3.2-1.4-5.4-3.6-5.4-6.7V3.6z"/><polygon points="' + starPts(8, 7.6, 2.8, 1.2) + '"/>',
      blitz:'<path d="M9.2 1.5L3.4 9h4.4l-1 5.5L12.6 7H8.2z"/>',
      week:'<path d="M12.6 9.6A5.6 5.6 0 0 1 6.4 3.4a5.6 5.6 0 1 0 6.2 6.2z"/>',
      all:'<polygon points="' + starPts(8, 8.3, 6.6, 2.9) + '"/>'
    };
    return '<svg viewBox="0 0 16 16" aria-hidden="true">' + (d[k] || '') + '</svg>';
  }
  function segHTML(attr, cur, items, big){
    return '<div class="az-segc' + (big ? ' big' : '') + '" role="tablist">' + items.map(function(it){
      var on = cur === it[0];
      return '<button type="button" role="tab" aria-selected="' + on + '" class="az-sg' + (on ? ' on' : '') + (it[0] === 'blitz' ? ' red' : '') + '" data-az="' + attr + '" data-v="' + it[0] + '">' + ico(it[2]) + '<span>' + esc(T(it[1])) + '</span></button>';
    }).join('') + '</div>';
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
      '<div class="az-mode"><h3>' + modeIcon('practice') + esc(T(U.mPractice)) + ' <span class="az-badge">PRIVATE</span></h3><p>' + esc(T(U.mPracticeD)) + '</p>' +
        '<div class="az-row"><label class="az-note">' + esc(T(U.howMany)) + '</label>' + cnt + '</div>' +
        '<button type="button" class="az-btn" data-az="start" data-mode="practice">' + esc(T(U.start)) + '</button></div>' +
      '<div class="az-mode ranked"><h3>' + modeIcon('ranked') + esc(T(U.mRanked)) + ' <span class="az-badge">45 ' + esc(T(U.secs)) + '</span></h3><p>' + esc(T(U.mRankedD)) + '</p>' +
        '<button type="button" class="az-btn" data-az="start" data-mode="ranked">' + esc(T(U.start)) + '</button></div>' +
      '<div class="az-mode blitz"><h3>' + modeIcon('blitz') + esc(T(U.mBlitz)) + ' <span class="az-badge">15 ' + esc(T(U.secs)) + '</span></h3><p>' + esc(T(U.mBlitzD)) + '</p>' +
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
      h += '<button type="button" class="az-btn" data-az="confirm"' + (run.sent || !run.picked.length ? ' disabled' : '') + '>' + esc(T(U.confirm)) + '</button>';
    }
    if(timed) h += '<p class="az-note" style="margin-top:12px">' + esc(T(U.timedNote)) + '</p>';
    if(nocopy) h += '<p class="az-note" style="margin-top:6px">' + esc(T(U.nocopy)) + '</p>';
    return h + '</div>';
  }

  function onOpt(i){
    if(!run || run.sent || run.reveal) return;
    var q = run.q, p = run.picked, at = p.indexOf(i);
    if(q.m){ if(at >= 0) p.splice(at, 1); else p.push(i); }
    else { run.picked = [i]; }
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
    var ranked = run.mode !== 'practice';
    var frac = ranked ? f.score / (f.total * (QP_BASE + QP_SPEED)) : f.correct / f.total;
    h += '<div class="az-ringwrap">' + ringSVG(frac) + '<div class="az-ringin">';
    if(ranked) h += '<div class="az-score" data-count="' + f.score + '">0</div><div class="az-note">' + esc(T(U.pts)) + '</div>';
    else h += '<div class="az-score">' + f.correct + '/' + f.total + '</div>';
    h += '</div></div>';
    var best = Math.min(f.rankWeek || 99, f.rankAll || 99);
    if(ranked && best <= 3) h += '<div class="az-podhit" style="--mc:' + MET[best].g + '">' + trophySVG(best) + '<span>' + esc(T(U.podiumHit)) + '</span></div>';
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
  function avatar(p, n){
    if(p) return '<img class="az-ava" src="' + esc(p) + '" alt="" referrerpolicy="no-referrer">';
    var ch = String(n || '?').replace(/^\s+/, '').charAt(0).toUpperCase() || '?';
    return '<span class="az-ava">' + esc(ch) + '</span>';
  }

  function boardHTML(){
    var h = '<div class="az-filters">' + segHTML('bmode', board.mode, [['ranked', U.bRanked, 'ranked'], ['blitz', U.bBlitz, 'blitz']]) + segHTML('bper', board.period, [['week', U.pWeek, 'week'], ['all', U.pAll, 'all']]) + '</div>';
    if(board.loading) return h + '<p class="az-note">' + esc(T(U.starting)) + '</p>';
    if(board.err || !board.data) return h + '<div class="az-err">' + esc(T(U.err)) + '</div><button type="button" class="az-btn ghost" data-az="reload-board">' + esc(T(U.retry)) + '</button>';
    var d = board.data, es = d.entries || [];
    h += '<p class="az-note">' + d.players + ' ' + esc(T(U.players)) + (d.weekEndsAt ? ' · ' + esc(T(U.resets)) + ' ' + fmtLeft(Math.max(0, d.weekEndsAt - Date.now())) : '') + '</p>';
    if(!es.length) return h + '<div class="az-card"><p class="az-note">' + esc(T(U.empty)) + '</p></div>';
    function pod(e, pos){
      var inner;
      if(!e) inner = '<div class="az-pod empty">' + trophySVG(pos, true) + '<div class="nm">–</div></div>';
      else inner = '<div class="az-pod' + (e.me ? ' me' : '') + '">' + (pos === 1 ? '<div class="az-rays"></div>' : '') + trophySVG(pos) + avatar(e.p, e.n) +
        '<div class="nm">' + esc(e.n) + (e.me ? ' (' + esc(T(U.you)) + ')' : '') + '</div>' +
        '<div class="sc">' + e.s + '</div><div class="sub">' + e.c + '/10 · ' + fmtMs(e.ms) + '</div></div>';
      return '<div class="az-slot s' + pos + '">' + inner + '<div class="az-ped"><b>' + pos + '</b></div></div>';
    }
    h += '<div class="az-podium">' + pod(es[1], 2) + pod(es[0], 1) + pod(es[2], 3) + '</div>';
    if(es.length > 3){
      h += '<div class="az-qmeta">' + esc(T(U.runners)) + '</div>';
      for(var i = 3; i < es.length; i++){
        var e = es[i];
        h += '<div class="az-runner' + (e.me ? ' me' : '') + '">' + rankBadge(e.rank) + avatar(e.p, e.n) +
          '<span class="nm">' + esc(e.n) + (e.me ? ' (' + esc(T(U.you)) + ')' : '') + '</span><span class="sc">' + e.s + '</span></div>';
      }
    }
    if(d.you && d.you.rank > es.length){
      h += '<div class="az-qmeta" style="margin-top:14px">' + esc(T(U.youRank)) + '</div><div class="az-runner me">' + rankBadge(d.you.rank) + avatar(d.you.p, d.you.n) +
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
    var tabs = '<div class="az-tabs">' + segHTML('tab', tab, [['play', U.tabPlay, 'play'], ['board', U.tabBoard, 'board']], true) + '</div>';
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
    countUp();
  }
  function countUp(){
    var els = bodyEl.querySelectorAll('[data-count]');
    Array.prototype.forEach.call(els, function(el){
      var to = parseInt(el.getAttribute('data-count'), 10) || 0, t0 = Date.now(), dur = 1100;
      (function step(){
        var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if(k < 1 && document.body.contains(el)) requestAnimationFrame(step);
      })();
    });
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
      '<div class="az-sky">' + skyHTML() + '</div>' +
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
