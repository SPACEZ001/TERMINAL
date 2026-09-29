
(function(){
  'use strict';
  if (window.__SPZ_WATCHLIST) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function pct(v){ if(!isNum(v)) return '—'; return (v>=0?'+':'') + v.toFixed(2) + '%'; }
  function price(v){
    if(!isNum(v)) return '—';
    var a = Math.abs(v);
    return v.toFixed(a>=10?2:a>=1?3:4).replace(/0+$/,'').replace(/\.$/,'');
  }

  var BOT = 'spacez_terminal_alert_bot';
  function deepLink(action, ticker){
    return 'https://t.me/' + BOT + '?start=' + action + '_' + encodeURIComponent(ticker);
  }
  function plainTgLink(){ return 'https://t.me/' + BOT; }

  var UID_KEY = 'spacez.wl.uid';
  function getUid(create){
    var v = null;
    try{ v = localStorage.getItem(UID_KEY); }catch(e){}
    if(!v && create){
      v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
          : ('u' + Date.now().toString(36) + Math.random().toString(36).slice(2));
      try{ localStorage.setItem(UID_KEY, v); }catch(e){}
    }
    return v;
  }
  function forgetUid(){ try{ localStorage.removeItem(UID_KEY); }catch(e){} }
  function linkDeepLink(uid){ return 'https://t.me/' + BOT + '?start=link_' + encodeURIComponent(uid); }

  /* ---- LINE QR session-link (see line-qr-worker.js): a small Cloudflare
     Worker backend that turns a QR scan in the LINE app into a linked
     browser session, mirroring the Telegram uid/chat_id link above but for
     LINE. Session persists via sessionStorage; an explicit "log out" (or
     the code's own expiry) is what unlinks it, matching the Telegram flow's
     "forget this browser". ---------------------------------------------- */
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var LINE_STORAGE_KEY = 'spz_line_link';
  function lineWorkerReady(){ return WORKER_BASE.indexOf('REPLACE-ME') === -1; }
  function lineApi(path){ return WORKER_BASE.replace(/\/$/, '') + path; }
  function lineSaveSession(){
    try {
      sessionStorage.setItem(LINE_STORAGE_KEY, JSON.stringify({
        code: state.line.code, displayName: state.line.displayName, pictureUrl: state.line.pictureUrl
      }));
    } catch(e){}
  }
  function lineLoadSession(){
    try { var raw = sessionStorage.getItem(LINE_STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
    catch(e){ return null; }
  }
  function lineClearSession(){ try { sessionStorage.removeItem(LINE_STORAGE_KEY); } catch(e){} }

  function cmdText(kind, t){
    var th = L() === 'th';
    switch(kind){
      case 'add':    return th ? ('เพิ่ม ' + t)        : ('/add ' + t);
      case 'remove': return th ? ('ลบ ' + t)           : ('/remove ' + t);
      case 'edit':   return th ? ('แก้ไข ' + t + ' 3') : ('/edit ' + t + ' 3');
      case 'list':   return th ? 'รายการ'              : '/list';
      case 'help':   return th ? 'ช่วยเหลือ'            : '/help';
    }
    return '';
  }

  function legacyCopy(str){
    var ta = document.createElement('textarea');
    ta.value = str;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.left = '-1000px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try{ ta.setSelectionRange(0, str.length); }catch(e){}
    var ok = false;
    try{ ok = document.execCommand('copy'); }catch(e){ ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(str, btn){
    function done(ok){
      if(!btn) return;
      var label = btn.getAttribute('data-label');
      if(!label){ label = btn.textContent; btn.setAttribute('data-label', label); }
      btn.textContent = ok ? tx(C.copied) : tx(C.copyFail);
      btn.classList.toggle('copied', !!ok);
      if(btn.__wlCopyTO) clearTimeout(btn.__wlCopyTO);
      btn.__wlCopyTO = setTimeout(function(){
        btn.textContent = label;
        btn.classList.remove('copied');
      }, 1700);
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(str).then(function(){ done(true); }, function(){ done(legacyCopy(str)); });
    } else {
      done(legacyCopy(str));
    }
  }

  var C = {
    eyebrow:{en:'Stocks you chose to follow',th:'หุ้นที่คุณเลือกติดตาม'},
    h:{en:'My Watchlist',th:'วอทช์ลิสต์ของฉัน'},
    lede:{en:'Add any of the site’s tracked stocks here and it gets a closer look: its own risk flags, how it compares with its sector this month, and a Telegram check-in once a day. Adding or removing goes through Telegram, since this page has nowhere of its own to save anything — tap the button below and confirm with one tap there, or copy a command and paste it in yourself if the tap doesn’t carry through.',
          th:'เพิ่มหุ้นตัวไหนที่เว็บนี้ติดตามอยู่เข้ามาที่นี่ จะได้รับการจับตาเป็นพิเศษ — มีสัญญาณเสี่ยงของตัวเอง เทียบกับกลุ่มอุตสาหกรรมเดียวกันให้ในแต่ละเดือน และมีเช็คอินทาง Telegram ให้ทุกวัน การเพิ่ม/เอาออกจะทำผ่าน Telegram เพราะหน้านี้เองไม่มีที่เก็บข้อมูลถาวร — กดปุ่มด้านล่างแล้วไปกดยืนยันอีกทีในแอป หรือถ้ากดแล้วคำสั่งไม่เข้า ให้คัดลอกคำสั่งไปวางเองก็ได้'},
    addLabel:{en:'Add a ticker',th:'เพิ่มหุ้นด้วยชื่อย่อ'},
    addPh:{en:'e.g. PTT, AAPL…',th:'เช่น PTT, AAPL…'},
    addBtn:{en:'Add via Telegram',th:'เพิ่มผ่าน Telegram'},
    addNote:{en:'Opens Telegram with the command ready to send. On iPhone, if it only opens the chat and the command doesn’t appear, tap “Copy” and paste it in yourself.',
             th:'จะเปิด Telegram พร้อมคำสั่งให้กดส่งได้เลย ถ้าเป็น iPhone แล้วเปิดมาแค่หน้าแชทเฉยๆ คำสั่งไม่ขึ้นมาให้ ให้กด “คัดลอก” แล้วไปวางเองอีกที'},
    open:{en:'Full page',th:'ดูหน้าเต็ม'},
    remove:{en:'Remove',th:'เอาออก'},
    copy:{en:'Copy',th:'คัดลอก'},
    copied:{en:'Copied ✓',th:'คัดลอกแล้ว ✓'},
    copyFail:{en:'Select the text & copy manually',th:'เลือกข้อความแล้วคัดลอกเอง'},
    emptyH:{en:'Nothing pinned yet',th:'ยังไม่มีหุ้นที่ปักหมุดไว้'},
    emptyB:{en:'Add a stock above, or message the bot directly — it understands both slash commands and plain Thai.',
            th:'เพิ่มหุ้นจากช่องด้านบน หรือพิมพ์คุยกับบอทโดยตรงก็ได้ — เข้าใจทั้งคำสั่งสั้นๆ และพิมพ์เป็นประโยคปกติ'},
    unknownNote:{en:'This snapshot has no data for it yet.',th:'สแนปช็อตนี้ยังไม่มีข้อมูลของตัวนี้'},
    howtoH:{en:'How to use the bot',th:'วิธีใช้บอท'},
    howtoLede:{en:'A tap on a button above should just work. If it only opens the chat without filling anything in — this happens sometimes on iPhone — copy any line below and paste it into the chat yourself. The bot understands both the slash form and plain words, so either works.',
               th:'กดปุ่มด้านบนแล้วปกติจะใช้ได้เลย แต่ถ้ากดแล้วเปิดมาแค่หน้าแชทเฉยๆ ไม่มีคำสั่งกรอกมาให้ (บางทีเกิดขึ้นกับ iPhone) ให้คัดลอกบรรทัดด้านล่างแล้วไปวางในแชทเอง บอทเข้าใจทั้งคำสั่งขึ้นต้นด้วย / และพิมพ์เป็นคำธรรมดา ใช้แบบไหนก็ได้'},
    lbAdd:{en:'Add a stock',th:'เพิ่มหุ้น'},
    lbRemove:{en:'Remove a stock',th:'เอาหุ้นออก'},
    lbEdit:{en:'Set your own alert threshold (% move)',th:'ตั้งเกณฑ์แจ้งเตือนเอง (% ที่ขยับ)'},
    lbList:{en:'See your whole list',th:'ดูรายการทั้งหมด'},
    lbHelp:{en:'Show every command',th:'ดูคำสั่งทั้งหมด'},
    opentg:{en:'Open the Telegram chat directly',th:'เปิดแชท Telegram โดยตรง'},
    connectLede:{en:'Each connection is tied to your own account, so what you pin here is yours alone — nobody else sees it, and you don’t see anyone else’s. Connect Telegram for full add/remove control from the chat — it’s the most reliable option and always available — or connect LINE to quickly view your list by scanning a QR code (LINE can occasionally be briefly unavailable at busy times; Telegram never is).',
                 th:'การเชื่อมต่อแต่ละช่องทางผูกกับบัญชีของคุณเอง สิ่งที่คุณปักหมุดจะเป็นของคุณคนเดียว คนอื่นไม่เห็นของคุณ และคุณก็ไม่เห็นของคนอื่น เชื่อมต่อ Telegram เพื่อเพิ่ม/ลบหุ้นผ่านแชทได้เต็มรูปแบบ — เป็นช่องทางที่เสถียรที่สุดและใช้ได้ตลอด — หรือเชื่อมต่อ LINE เพื่อดูรายการของคุณเร็วๆ ด้วยการสแกน QR (LINE อาจใช้งานไม่ได้ชั่วคราวในบางช่วงที่มีคนใช้งานเยอะ แต่ Telegram ไม่มีปัญหานี้)'},
    connectBtn:{en:'Connect Telegram',th:'เชื่อมต่อ Telegram'},
    connectPendingH:{en:'Waiting for confirmation…',th:'กำลังรอการยืนยัน…'},
    connectPendingB:{en:'Tap the button again if the chat didn’t open, then tap Start there. This page checks again automatically every minute.',
                     th:'ถ้าแชทไม่เปิดให้กดปุ่มอีกครั้ง แล้วกด Start ในแชท หน้านี้จะเช็คซ้ำให้อัตโนมัติทุกๆ นาทีค่ะ'},
    connectedNote:{en:'Connected ✓',th:'เชื่อมต่อแล้ว ✓'},
    forgetBtn:{en:'Forget this browser',th:'ลืมการเชื่อมต่อในเบราว์เซอร์นี้'},
    notConnH:{en:'Not connected yet',th:'ยังไม่ได้เชื่อมต่อ'},
    notConnB:{en:'Connect Telegram or LINE below to see and manage your personal watchlist here.',
              th:'เชื่อมต่อ Telegram หรือ LINE ด้านล่างเพื่อดูและจัดการวอทช์ลิสต์ส่วนตัวของคุณที่นี่'},
    tgLabel:{en:'Telegram',th:'Telegram'},
    lineLabel:{en:'LINE',th:'LINE'},
    connectLineBtn:{en:'Connect LINE',th:'เชื่อมต่อ LINE'},
    lineConnectedNote:{en:'Connected ✓',th:'เชื่อมต่อแล้ว ✓'},
    lineNotConn:{en:'Not connected',th:'ยังไม่ได้เชื่อมต่อ'},
    lineWaiting:{en:'Waiting for scan…',th:'รอการสแกนอยู่ค่ะ…'},
    lineProcessing:{en:'Scanned ✓ verifying your account…',th:'สแกนสำเร็จ ✓ กำลังตรวจสอบบัญชีของคุณ…'},
    lineExpired:{en:'Code expired — tap Connect LINE again.',th:'โค้ดหมดอายุแล้ว กดเชื่อมต่อ LINE อีกครั้งนะคะ'},
    lineErr:{en:'Could not reach the LINE link service. Tap to try again.',
             th:'เชื่อมต่อระบบ LINE ไม่ได้ตอนนี้ กดเพื่อลองใหม่นะคะ'},
    lineQuotaErr:{en:'LINE has hit today’s connection limit — it resets automatically at midnight UTC (~07:00 Bangkok time). Connect via Telegram instead for now.',
                  th:'ระบบเชื่อมต่อ LINE เต็มโควตาของวันนี้แล้วค่ะ จะรีเซ็ตอัตโนมัติราว 07:00 น. (เวลาไทย) พรุ่งนี้เช้า ระหว่างนี้เชื่อมต่อผ่าน Telegram แทนได้เลยนะคะ'},
    lineNotReady:{en:'LINE connect isn’t switched on yet.',th:'ฟีเจอร์เชื่อมต่อ LINE ยังไม่เปิดใช้งานค่ะ'},
    lineForget:{en:'Log out of LINE',th:'ออกจากระบบ LINE'},
    lineEditProfileBtn:{en:'Edit profile',th:'แก้ไขโปรไฟล์'},
    lineProfileUidLabel:{en:'Your UID (tell this to admin to request access)',th:'UID ของคุณ (แจ้งแอดมินเพื่อขอสิทธิ์การใช้งาน)'},
    lineProfileFbPh:{en:'Facebook (optional)',th:'Facebook (ถ้ามี)'},
    lineProfileIgPh:{en:'Instagram (optional)',th:'Instagram (ถ้ามี)'},
    lineProfileSaveBtn:{en:'Save',th:'บันทึก'},
    lineProfileSaved:{en:'Saved',th:'บันทึกแล้ว'},
    lineProfileSaveErr:{en:'Could not save — try again.',th:'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'},
    lineOwnListNote:{en:'This is your own personal list, linked to your LINE account — separate from a Telegram-linked list, even on the same browser. Add or remove tickers right here.',
                     th:'นี่คือรายการส่วนตัวของคุณเอง ผูกกับบัญชี LINE ของคุณ — แยกจากรายการที่เชื่อมผ่าน Telegram แม้จะเป็นเบราว์เซอร์เดียวกันก็ตาม เพิ่ม/ลบหุ้นได้จากตรงนี้เลย'},
    lineAddH:{en:'Add a stock to your list',th:'เพิ่มหุ้นเข้าไลสต์ของคุณ'},
    lineAddPh:{en:'e.g. PTT, AAPL…',th:'เช่น PTT, AAPL…'},
    lineAddBtn:{en:'Add',th:'เพิ่ม'},
    lineBrowseBtn:{en:'Browse by category',th:'เลือกตามหมวดหมู่'},
    pickTitle:{en:'Add a stock',th:'เพิ่มหุ้นเข้าไลสต์'},
    pickSearchPh:{en:'Search ticker or company…',th:'ค้นหาชื่อหุ้นหรือบริษัท…'},
    pickNoResults:{en:'No matches for that search.',th:'ไม่พบผลลัพธ์ที่ค้นหา'},
    pickAdded:{en:'Added ✓',th:'เพิ่มแล้ว ✓'},
    pickAdding:{en:'Adding…',th:'กำลังเพิ่ม…'},
    pickClose:{en:'Done',th:'เสร็จสิ้น'},
    lineAddErrInvalid:{en:'That doesn’t look like a valid ticker.',th:'รูปแบบชื่อหุ้นนี้ดูไม่ถูกต้องค่ะ'},
    lineAddErrFull:{en:'Your list is full (60 max) — remove one first.',th:'รายการเต็มแล้ว (สูงสุด 60 ตัว) เอาออกสักตัวก่อนนะคะ'},
    lineAddErrNet:{en:'Could not reach the server — try again.',th:'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้งนะคะ'},
    title:{en:'Link your LINE',th:'เชื่อมต่อ LINE ของคุณ'},
    lineSub:{en:'Open LINE on your phone and scan this code to link your watchlist to this browser.',
             th:'เปิด LINE บนมือถือแล้วสแกนโค้ดนี้ เพื่อเชื่อมวอทช์ลิสต์ของคุณเข้ากับเบราว์เซอร์นี้'},

    paH:{en:'Portfolio analysis',th:'วิเคราะห์พอร์ตของคุณ'},
    paLede:{en:'Built from the same sector and risk data as the cards below — which group your money is in, and how concentrated or flagged the list looks as a whole.',
            th:'สร้างจากข้อมูลกลุ่มอุตสาหกรรมและสัญญาณเสี่ยงชุดเดียวกับการ์ดด้านล่าง — เงินของคุณอยู่ในกลุ่มไหนบ้าง และภาพรวมทั้งลิสต์กระจุกตัวหรือมีสัญญาณเสี่ยงมากแค่ไหน'},
    paSectorLabel:{en:'Sector allocation',th:'สัดส่วนตามกลุ่มอุตสาหกรรม'},
    paSectorOther:{en:'Uncategorized',th:'ยังไม่จัดกลุ่ม'},
    paConcHigh:{en:'Concentrated: {p}% of this list sits in a single sector ({s}). A move against that sector hits most of the list at once.',
                th:'กระจุกตัวสูง: {p}% ของลิสต์นี้อยู่ในกลุ่มเดียว ({s}) ถ้ากลุ่มนี้ร่วง จะกระทบลิสต์ส่วนใหญ่พร้อมกัน'},
    paConcMed:{en:'Somewhat concentrated: {p}% of this list is in {s}. Worth knowing before adding more from the same group.',
               th:'กระจุกตัวปานกลาง: {p}% ของลิสต์อยู่ในกลุ่ม {s} ควรรู้ไว้ก่อนเพิ่มหุ้นกลุ่มเดียวกันอีก'},
    paConcOk:{en:'Reasonably spread across sectors — no single group dominates the list.',
              th:'กระจายกลุ่มอุตสาหกรรมได้พอสมควร ไม่มีกลุ่มไหนครองลิสต์นี้มากเกินไป'},
    paRiskLabel:{en:'Risk read, ticker by ticker',th:'ประเมินความเสี่ยงรายตัว'},
    paRiskHigh:{en:'Flagged (bearish signal)',th:'มีสัญญาณเสี่ยง (แนวโน้มลบ)'},
    paRiskMed:{en:'Worth watching',th:'ควรจับตา'},
    paRiskLow:{en:'Looks steady',th:'ดูนิ่ง'},
    paNone:{en:'Not enough signal data yet for these tickers.',th:'ยังไม่มีข้อมูลสัญญาณพอสำหรับหุ้นกลุ่มนี้'},
    paMeterLabel:{en:'Overall risk level',th:'ระดับความเสี่ยงโดยรวม'},
    paSectorOtherShort:{en:'Other',th:'อื่นๆ'},

    secgH:{en:'Sector snapshot — today, ticker by ticker',th:'ภาพรวมรายเซกเตอร์ — วันนี้ รายตัว'},
    secgLede:{en:'A closer look inside each sector you hold — how far each ticker moved today, side by side.',
              th:'ดูลึกลงไปในแต่ละกลุ่มอุตสาหกรรมที่คุณถือ — วันนี้แต่ละตัวขยับไปเท่าไหร่ เทียบกันชัดๆ'},
    secgNoData:{en:'No live change data yet',th:'ยังไม่มีข้อมูลการเปลี่ยนแปลงวันนี้'},

    shockH:{en:'Market Shock Simulator — your holdings',th:'จำลองแรงกระแทกตลาด — พอร์ตของคุณ'},
    shockLede:{en:'Pick a scenario and see which of your own tickers would likely rise, fall, or sit mixed — based on the same 18-scenario simulator as the Market Shock Simulator page, mapped onto each ticker\'s sector.',
               th:'เลือกสถานการณ์สมมุติ แล้วดูว่าหุ้นที่คุณถืออยู่ตัวไหนน่าจะขึ้น ลง หรือผสม — โดยใช้ชุดข้อมูลจำลอง 18 สถานการณ์เดียวกับหน้าจำลองแรงกระแทกตลาด จับคู่ตามกลุ่มอุตสาหกรรมของแต่ละตัว'},
    shockRises:{en:'Likely rises',th:'มีแนวโน้มขึ้น'},
    shockFalls:{en:'Likely falls',th:'มีแนวโน้มลง'},
    shockMixed:{en:'Mixed / depends',th:'ผสม / ไม่แน่นอน'},
    shockUnclassified:{en:'Sector not classified',th:'ยังจัดกลุ่มไม่ได้'},
    shockRotateH:{en:'Sectors that tend to hold up in this scenario',th:'กลุ่มที่มักจะไปได้ดีในสถานการณ์นี้'},
    shockBadge:{en:'Hypothetical — not your current risk',th:'สถานการณ์สมมติ — ไม่ใช่ความเสี่ยงจริงตอนนี้'},
    shockToggleOpen:{en:'Tap to try a scenario',th:'แตะเพื่อลองสถานการณ์สมมติ'},
    shockToggleClose:{en:'Hide',th:'ซ่อน'},

    /* Round K11: floating bottom-right popup version of the same simulator
       (see spzShockFab/spzShockPopup below) -- a punchier, question-style
       title than the plain page heading above, since the whole point of a
       floating popup is to grab attention rather than sit and wait to be
       scrolled to. */
    shockFabLabel:{en:'What if the market shocks?',th:'ถ้าตลาดเกิดแรงกระแทกล่ะ?'},
    shockPopupTitle:{en:'What would happen to YOUR portfolio?',th:'พอร์ตของคุณจะเป็นยังไง?'},
    shockDisclaimer:{en:'Educational simulation only — not investment advice. These are historical tendencies, not guarantees: a sector that "usually" holds up can still fall in any single real event.',
                     th:'เป็นการจำลองเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน แนวโน้มนี้มาจากสถิติในอดีต ไม่ใช่การรับประกัน — กลุ่มที่ "มักจะ" ไปได้ดี ก็ยังลงได้ในเหตุการณ์จริงแต่ละครั้ง'},

    /* Round L: two-way mode switch inside the same popup -- "My Portfolio"
       (a condensed real-holdings card) vs "What-If Scenario" (the K11
       simulator, unchanged). */
    shockModePortfolio:{en:'My Portfolio',th:'พอร์ตของฉัน'},
    shockModeScenario:{en:'What-If Scenario',th:'จำลองสถานการณ์'},
    shockPfViewFull:{en:'Open Full Watchlist →',th:'ดูพอร์ตแบบเต็ม →'},
    shockPfDisc:{en:'Live indicative prices — not guaranteed, not investment advice.',
                 th:'ราคาสดเพื่ออ้างอิงเท่านั้น ไม่รับประกันความถูกต้อง และไม่ใช่คำแนะนำการลงทุน'},
    pfHoldingsCountLbl:{en:'holdings',th:'รายการที่ถือ'},
    shockAnnounceLbl:{en:'Announcement',th:'ประกาศ'},

    profileHoldings:{en:'holdings',th:'ตัวที่ถือ'},
    profileTopSector:{en:'Mostly',th:'ส่วนใหญ่'},
    profileGuest:{en:'Your Watchlist',th:'วอทช์ลิสต์ของคุณ'},
    profileShareBtn:{en:'Share / Save image',th:'แชร์ / บันทึกรูป'},

    shareEyebrow:{en:'Portfolio Snapshot',th:'สรุปพอร์ตการลงทุน'},
    shareTag:{en:'My Portfolio',th:'พอร์ตของฉัน'},
    shareHoldingsLabel:{en:'Holdings',th:'หุ้นที่ถือ'},
    shareFooter:{en:'spacez001.github.io/TERMINAL · Educational use only, not financial advice.',
                 th:'spacez001.github.io/TERMINAL · เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน'},
    shareQrCap:{en:'Scan to try SPACEZ TERMINAL',th:'สแกนเพื่อลองใช้ SPACEZ TERMINAL'},
    shareDownload:{en:'Download image',th:'บันทึกเป็นรูปภาพ'},
    sharePrint:{en:'Print / Save as PDF',th:'พิมพ์ / บันทึกเป็น PDF'},
    shareRendering:{en:'Preparing image…',th:'กำลังเตรียมรูป…'},
    shareRenderErr:{en:'Could not generate the image — try Print / Save as PDF instead.',th:'สร้างรูปไม่สำเร็จ ลองใช้ปุ่มพิมพ์ / PDF แทน'}
  };

  var FLAG_COPY = {
    bear:{en:'Bearish divergence — price up, momentum fading',th:'ราคาขึ้นแต่แรงซื้อลด (bearish divergence)'},
    bull:{en:'Bullish divergence — price down, momentum turning',th:'ราคาลงแต่แรงขายเริ่มเบา (bullish divergence)'},
    death:{en:'Recent death cross',th:'เพิ่งเกิด death cross'},
    golden:{en:'Recent golden cross',th:'เพิ่งเกิด golden cross'},
    belowMA:{en:'Below its 200-day average',th:'อยู่ใต้เส้นค่าเฉลี่ย 200 วัน'}
  };

  function peerNote(t, s, stocks){
    var sector = s.sector, m1 = s.m1;
    if(!sector || !isNum(m1)) return null;
    var peers = [], k;
    for(k in stocks){
      if(k === t) continue;
      var p = stocks[k];
      if(p && p.sector === sector && isNum(p.m1)) peers.push(p.m1);
    }
    if(peers.length < 3) return null;
    var avg = peers.reduce(function(a,b){return a+b;},0) / peers.length;
    var gap = m1 - avg;
    if(gap <= -4) return { k:'info', en:'Sector (' + sector + ') is up ~' + Math.abs(gap).toFixed(1) + 'pt more on average this month.',
                                     th:'หุ้นกลุ่ม ' + sector + ' ตัวอื่นเฉลี่ยเดือนนี้แรงกว่านี้ราว ' + Math.abs(gap).toFixed(1) + ' จุด' };
    if(gap >= 4) return { k:'good', en:'Beating its sector (' + sector + ') average by ~' + gap.toFixed(1) + 'pt this month.',
                                    th:'เดือนนี้แรงกว่าค่าเฉลี่ยกลุ่ม ' + sector + ' อยู่ราว ' + gap.toFixed(1) + ' จุด' };
    return null;
  }

  function flagsOf(t, s, stocks){
    var out = [];
    if(!s) return out;
    if(s.divergence === 'bearish') out.push({k:'bad', t:FLAG_COPY.bear});
    if(s.divergence === 'bullish') out.push({k:'good', t:FLAG_COPY.bull});
    if(s.cross === 'death') out.push({k:'bad', t:FLAG_COPY.death});
    if(s.cross === 'golden') out.push({k:'good', t:FLAG_COPY.golden});
    if(isNum(s.vs_ma200) && s.vs_ma200 < 0) out.push({k:'warn', t:FLAG_COPY.belowMA});
    var peer = peerNote(t, s, stocks);
    if(peer) out.push({k:peer.k === 'good' ? 'good' : 'info', t:peer});
    return out;
  }

  var sec, state = { wl:null, stocks:null, exampleTicker:'', links:null, uid:null, chatId:null,
    line:{ status:'idle', code:null, loginUrl:null, displayName:null, pictureUrl:null, tickers:[] },
    /* Round S: mirrors window.__SPZ_TG (part-61.js) so a visitor who signed
       in via the corner gate's Telegram QR login gets the exact same
       personal-watchlist experience below as a LINE-linked visitor --
       see resolveActiveIdentity()/syncTgState() further down. Deliberately
       a SEPARATE slot from state.line/window.__SPZ_LINE, never merged into
       it, so "LINE-linked" keeps meaning exactly that everywhere else on
       the site (the corner gate's own LINE tab among them). */
    tg:{ status:'idle', code:null, displayName:null, pictureUrl:null, tickers:[], uid:null,
         facebook:'', instagram:'', nameOverride:'', note:'', rights:null, accessUntil:null,
         likedCount:0, provider:'telegram' },
    linePoll:null, lineModalOpen:false };
  var lineModal, lineModalBody;

  function loadLinks(cb){
    fetch('data/telegram_links.json?v=' + Math.floor(Date.now()/60000))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ state.links = (d && d.links) || {}; if(cb) cb(); })
      .catch(function(){ state.links = state.links || {}; if(cb) cb(); });
  }

  function loadWatchlist(cb){
    loadLinks(function(){
      var uid = getUid(false);
      var chatId = uid && state.links && state.links[uid] && state.links[uid].chat_id;
      state.uid = uid;
      state.chatId = chatId || null;
      if(!chatId){
        state.wl = {};
        if(cb) cb();
        return;
      }
      fetch('data/watchlist.json?v=' + Math.floor(Date.now()/60000))
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){
          var users = (d && d.users) || {};
          var bucket = users[chatId] || users[String(chatId)];
          state.wl = (bucket && bucket.tickers) || {};
          if(cb) cb();
        })
        .catch(function(){ state.wl = state.wl || {}; if(cb) cb(); });
    });
  }

  function stocksSnapshot(){
    var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
    return (s && s.stocks) || null;
  }

  /* ---- Round S: whichever corner-gate identity is actually linked right
     now drives this page's personal-watchlist view -- LINE if LINE is
     linked (unchanged, always wins if somehow both are), otherwise the
     Telegram QR login if THAT'S linked, otherwise state.line as-is (idle/
     pending/error, same as before this round). Every renderer below already
     takes a generic "lineSt"-shaped object as a parameter, so passing
     whichever one resolves here is enough to make the whole page work
     correctly for either provider with no other logic duplicated. -------- */
  function resolveActiveIdentity(){
    if(state.line.status === 'linked') return state.line;
    if(state.tg.status === 'linked') return state.tg;
    return state.line;
  }

  function syncTgState(){
    if(!window.__SPZ_TG) return;
    var tg = window.__SPZ_TG.state();
    if(tg.status !== 'linked'){
      if(state.tg.status === 'linked'){
        state.tg = { status:'idle', code:null, displayName:null, pictureUrl:null, tickers:[], uid:null,
          facebook:'', instagram:'', nameOverride:'', note:'', rights:null, accessUntil:null,
          likedCount:0, provider:'telegram' };
        paint();
      }
      return;
    }
    var tgCode = window.__SPZ_TG.code ? window.__SPZ_TG.code() : null;
    if(!tgCode) return;
    if(state.tg.code === tgCode && state.tg.status === 'linked') return; // already synced
    state.tg.code = tgCode;
    state.tg.status = 'linked';
    state.tg.displayName = tg.displayName || state.tg.displayName;
    state.tg.pictureUrl = tg.pictureUrl || state.tg.pictureUrl;
    fetch(lineApi('/api/session/data?code=' + encodeURIComponent(tgCode)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!data || data.error) return;
        state.tg.tickers = data.tickers || [];
        state.tg.displayName = data.displayName || state.tg.displayName;
        state.tg.pictureUrl = data.pictureUrl || state.tg.pictureUrl;
        state.tg.uid = data.uid || null;
        state.tg.facebook = data.facebook || '';
        state.tg.instagram = data.instagram || '';
        state.tg.nameOverride = data.nameOverride || '';
        state.tg.note = data.note || '';
        state.tg.rights = data.rights || null;
        state.tg.accessUntil = data.accessUntil || null;
        state.tg.likedCount = typeof data.likedCount === 'number' ? data.likedCount : 0;
        paint();
      })
      .catch(function(){});
    paint();
  }

  function lineStopPolling(){ if(state.linePoll){ clearInterval(state.linePoll); state.linePoll = null; } }

  /* ---- the big centered QR popup. Built once and appended to <body> (so
     it isn't clipped by the section's own layout), opened from the
     "Connect LINE" button and closed on success (after a short "linked ✓"
     beat), on the X, on a click outside the card, or on Escape. ------- */
  function buildLineModal(){
    if(lineModal) return;
    lineModal = document.createElement('div');
    lineModal.id = 'wlLineModal';
    lineModal.hidden = true;
    lineModal.innerHTML =
      '<div class="wllm-card">' +
        '<button type="button" class="wllm-close" data-wllm="close">&times;</button>' +
        '<div data-wllm="body"></div>' +
      '</div>';
    document.body.appendChild(lineModal);
    lineModalBody = lineModal.querySelector('[data-wllm="body"]');
    lineModal.querySelector('[data-wllm="close"]').addEventListener('click', closeLineModal);
    lineModal.addEventListener('click', function(ev){ if(ev.target === lineModal) closeLineModal(); });
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape' && !lineModal.hidden) closeLineModal();
    });
  }

  function openLineModal(){
    buildLineModal();
    state.lineModalOpen = true;
    lineModal.hidden = false;
    if(state.line.status === 'linked'){
      paintLineModal();
    } else {
      lineStartPending();
    }
  }

  function closeLineModal(){
    state.lineModalOpen = false;
    if(lineModal) lineModal.hidden = true;
  }

  function paintLineModal(){
    if(!lineModal || lineModal.hidden || !lineModalBody) return;
    var st = state.line;
    if(st.status === 'linked'){
      var avatarImg = st.pictureUrl
        ? '<img src="' + esc(st.pictureUrl) + '" alt="" class="wllm-avatar">'
        : '';
      lineModalBody.innerHTML =
        avatarImg +
        '<div class="wllm-title">LINE</div>' +
        '<div class="wllm-status ok">' + esc(tx(C.lineConnectedNote)) +
          (st.displayName ? ' · ' + esc(st.displayName) : '') + '</div>';
      setTimeout(function(){ if(state.lineModalOpen) closeLineModal(); }, 1200);
    } else if(st.status === 'processing'){
      lineModalBody.innerHTML =
        '<div class="wllm-title">LINE</div>' +
        '<div class="wllm-proc"><div class="wllm-proc-ring"></div>' +
          '<div class="wllm-proc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg></div>' +
        '</div>' +
        '<div class="wllm-status">' + esc(tx(C.lineProcessing)) + '</div>';
    } else if(!lineWorkerReady()){
      lineModalBody.innerHTML = '<div class="wllm-title">LINE</div><div class="wllm-status err">' + esc(tx(C.lineNotReady)) + '</div>';
    } else if(st.status === 'error' || st.status === 'expired' || st.status === 'quota'){
      var errMsg = st.status === 'expired' ? C.lineExpired : (st.status === 'quota' ? C.lineQuotaErr : C.lineErr);
      lineModalBody.innerHTML =
        '<div class="wllm-title">LINE</div>' +
        '<div class="wllm-status err">' + esc(tx(errMsg)) + '</div>' +
        // A quota hit won't clear until the daily reset -- a "try again"
        // button there would just fail again, so it's left out on purpose;
        // every other error state still offers one.
        (st.status === 'quota' ? '' :
          '<button type="button" class="wllm-retry" data-wllm="retry">' + esc(tx(C.connectLineBtn)) + '</button>');
      var retryBtn = lineModalBody.querySelector('[data-wllm="retry"]');
      if(retryBtn) retryBtn.addEventListener('click', lineStartPending);
    } else if(st.loginUrl){
      lineModalBody.innerHTML =
        '<div class="wllm-title">' + esc(tx(C.title)) + '</div>' +
        '<div class="wllm-sub">' + esc(tx(C.lineSub)) + '</div>' +
        '<div class="wllm-qr-wrap"><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
          encodeURIComponent(st.loginUrl) + '" alt="QR"></div>' +
        '<div class="wllm-status"><span class="wllm-spin"></span>' + esc(tx(C.lineWaiting)) + '</div>';
    } else {
      lineModalBody.innerHTML =
        '<div class="wllm-title">' + esc(tx(C.title)) + '</div>' +
        '<div class="wllm-status"><span class="wllm-spin"></span>' + esc(tx(C.lineWaiting)) + '</div>';
    }
  }

  function lineStartPending(){
    state.line.status = 'pending';
    state.line.code = null;
    state.line.loginUrl = null;
    if(!lineWorkerReady()){ paint(); paintLineModal(); return; }
    paint();
    paintLineModal();
    fetch(lineApi('/api/session/new'))
      .then(function(r){ return r.json(); })
      .then(function(data){
        // The Worker still answers with a normal JSON body on failure (see
        // line-qr-worker.js's top-level try/catch) -- data.error distinguishes
        // "the daily KV quota is exhausted, try again tomorrow" from any other
        // failure, so this doesn't lump a quota hit in with a generic error.
        if(data && data.error){
          state.line.status = (data.error === 'quota_exceeded') ? 'quota' : 'error';
          paint();
          paintLineModal();
          return;
        }
        state.line.code = data.code;
        state.line.loginUrl = data.loginUrl;
        paint();
        paintLineModal();
        lineStopPolling();
        state.linePoll = setInterval(linePollStatus, 2500);
      })
      .catch(function(){ state.line.status = 'error'; paint(); paintLineModal(); });
  }

  function linePollStatus(){
    if(!state.line.code) return;
    fetch(lineApi('/api/session/status?code=' + encodeURIComponent(state.line.code)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.error === 'quota_exceeded'){
          lineStopPolling();
          state.line.status = 'quota';
          paint();
          paintLineModal();
        } else if(data.status === 'linked'){
          lineStopPolling();
          state.line.displayName = data.displayName || '';
          // A brief "scanned, verifying" beat between the phone-side scan and
          // the panel settling in, so the transition never feels like the
          // modal just abruptly vanishes -- see paintLineModal()'s
          // 'processing' branch for the graphic.
          state.line.status = 'processing';
          paint();
          paintLineModal();
          setTimeout(lineFetchData, 650);
        } else if(data.status === 'not_found'){
          lineStopPolling();
          state.line.status = 'expired';
          paint();
          paintLineModal();
        }
      })
      .catch(function(){ /* transient network hiccup - just try again next tick */ });
  }

  // Fired whenever state.line changes in a way another module might care
  // about -- the corner-trigger auth gate (#spzAuthGate) listens for this
  // so its own LINE tab/row stays in sync no matter which UI (this page's
  // connect strip, its QR modal, or the corner gate itself) made the change.
  function lineNotify(){ try { document.dispatchEvent(new CustomEvent('spz:line')); } catch(e){} }

  function lineFetchData(){
    fetch(lineApi('/api/session/data?code=' + encodeURIComponent(state.line.code)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.error === 'quota_exceeded'){
          state.line.status = 'quota';
          paint();
          paintLineModal();
          return;
        }
        state.line.status = 'linked';
        state.line.tickers = data.tickers || [];
        state.line.displayName = data.displayName || state.line.displayName;
        state.line.pictureUrl = data.pictureUrl || state.line.pictureUrl;
        state.line.uid = data.uid || state.line.uid || null;
        state.line.facebook = data.facebook || '';
        state.line.instagram = data.instagram || '';
        state.line.nameOverride = data.nameOverride || '';
        state.line.note = data.note || '';
        state.line.rights = data.rights || null;
        state.line.accessUntil = data.accessUntil || null;
        state.line.likedCount = typeof data.likedCount === 'number' ? data.likedCount : 0;
        lineSaveSession();
        paint();
        paintLineModal();
        lineNotify();
      })
      .catch(function(){ state.line.status = 'error'; paint(); paintLineModal(); });
  }

  /* ---- LINE-linked users manage their OWN watchlist directly (no Telegram
     needed) via the Worker's per-account KV bucket added alongside this UI.
     Both helpers optimistically leave the grid alone until the Worker
     confirms the change, then repaint from its response so state.line.tickers
     is always exactly what the server has -- never guessed locally. -------- */
  function lineAddTicker(ticker, cb, identity){
    identity = identity || state.line;
    if(!identity.code) { if(cb) cb('not_linked'); return; }
    fetch(lineApi('/api/session/watchlist/add'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code: identity.code, ticker: ticker })
    })
      .then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); })
      .then(function(res){
        if(!res.ok){ if(cb) cb(res.d && res.d.error || 'error'); return; }
        identity.tickers = res.d.tickers || [];
        paint();
        if(cb) cb(null, identity.tickers);
      })
      .catch(function(){ if(cb) cb('network'); });
  }

  function lineRemoveTicker(ticker, cb, identity){
    identity = identity || state.line;
    if(!identity.code) { if(cb) cb('not_linked'); return; }
    fetch(lineApi('/api/session/watchlist/remove'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code: identity.code, ticker: ticker })
    })
      .then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); })
      .then(function(res){
        if(!res.ok){ if(cb) cb(res.d && res.d.error || 'error'); return; }
        identity.tickers = res.d.tickers || [];
        paint();
        if(cb) cb(null, identity.tickers);
      })
      .catch(function(){ if(cb) cb('network'); });
  }

  /* ---- self-service edit: a linked visitor (LINE or, since Round S,
     Telegram -- see the optional identity param) can add their own social
     handles (shown to the admin on the Connected Users page), never anything
     the admin controls (UID, access date) -- those stay admin-only server side. */
  function lineUpdateProfile(facebook, instagram, cb, identity){
    identity = identity || state.line;
    if(!identity.code) { if(cb) cb('not_linked'); return; }
    fetch(lineApi('/api/session/profile'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code: identity.code, facebook: facebook, instagram: instagram })
    })
      .then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); })
      .then(function(res){
        if(!res.ok){ if(cb) cb(res.d && res.d.error || 'error'); return; }
        identity.facebook = res.d.facebook || '';
        identity.instagram = res.d.instagram || '';
        if(cb) cb(null);
      })
      .catch(function(){ if(cb) cb('network'); });
  }

  /* ---- same self-service endpoint, different fields: the Home page's own
     personal LINE card (a separate card from this page's connect strip) lets
     a linked visitor override their displayed name and write a free-text
     "about me" note -- independent of the Facebook/Instagram handles above,
     so editing one here never touches the other. */
  function lineUpdateIdentity(nameOverride, note, cb){
    if(!state.line.code) { if(cb) cb('not_linked'); return; }
    fetch(lineApi('/api/session/profile'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code: state.line.code, nameOverride: nameOverride, note: note })
    })
      .then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); })
      .then(function(res){
        if(!res.ok){ if(cb) cb(res.d && res.d.error || 'error'); return; }
        state.line.nameOverride = res.d.nameOverride || '';
        state.line.note = res.d.note || '';
        // Deliberately NOT calling paint()/lineNotify() here (unlike a real
        // link/unlink) -- the Home page card that called this already updates
        // its own name/note/status text directly below, and a global
        // 'spz:line' rebroadcast would rebuild that exact card out from under
        // itself mid-edit, wiping the "Saved." confirmation and collapsing
        // the still-open edit panel before the visitor sees it.
        // We DO still tell everyone else, though (e.g. the Watchlist page's
        // profile header/connect strip/share card) via a narrower event, so
        // the new name shows up there without needing a reload -- see the
        // 'spz:identity' listener near this module's build().
        try { document.dispatchEvent(new CustomEvent('spz:identity')); } catch(e){}
        if(cb) cb(null);
      })
      .catch(function(){ if(cb) cb('network'); });
  }

  /* ---- likes on journal posts, via the same shared LINE session. Exposed
     on window.__SPZ_LINE (below) so the Journal module never needs to know
     the session code or talk to the Worker itself -- one place holds the
     LINE identity, everything else just asks it to act. --------------- */
  function lineLikeToggle(postId, cb){
    if(!state.line.code) { if(cb) cb('not_linked'); return; }
    fetch(lineApi('/api/likes/toggle'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code: state.line.code, postId: postId })
    })
      .then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); })
      .then(function(res){
        if(!res.ok){ if(cb) cb(res.d && res.d.error || 'error'); return; }
        if(cb) cb(null, res.d);
      })
      .catch(function(){ if(cb) cb('network'); });
  }

  function lineLikesGet(postId, cb){
    var qs = '/api/likes?postId=' + encodeURIComponent(postId) +
      (state.line.code ? '&code=' + encodeURIComponent(state.line.code) : '');
    fetch(lineApi(qs))
      .then(function(r){ return r.json(); })
      .then(function(d){ if(cb) cb(null, d); })
      .catch(function(){ if(cb) cb('network'); });
  }

  function lineRestoreFromWorker(saved){
    state.line.code = saved.code;
    state.line.displayName = saved.displayName;
    state.line.pictureUrl = saved.pictureUrl || null;
    fetch(lineApi('/api/session/status?code=' + encodeURIComponent(saved.code)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data.status === 'linked'){
          fetch(lineApi('/api/session/data?code=' + encodeURIComponent(saved.code)))
            .then(function(r){ return r.json(); })
            .then(function(dd){
              state.line.status = 'linked';
              state.line.tickers = dd.tickers || [];
              state.line.displayName = dd.displayName || state.line.displayName;
              state.line.pictureUrl = dd.pictureUrl || state.line.pictureUrl;
              state.line.uid = dd.uid || state.line.uid || null;
              state.line.facebook = dd.facebook || '';
              state.line.instagram = dd.instagram || '';
              state.line.nameOverride = dd.nameOverride || '';
              state.line.note = dd.note || '';
              state.line.rights = dd.rights || null;
              state.line.accessUntil = dd.accessUntil || null;
              state.line.likedCount = typeof dd.likedCount === 'number' ? dd.likedCount : 0;
              paint();
              lineNotify();
            })
            .catch(function(){});
        } else {
          lineClearSession();
          state.line = { status:'idle', code:null, loginUrl:null, displayName:null, pictureUrl:null, tickers:[] };
          paint();
          lineNotify();
        }
      })
      .catch(function(){ /* worker unreachable - keep whatever we had locally, retry next reload */ });
  }

  function lineLogout(){
    var code = state.line.code;
    lineStopPolling();
    lineClearSession();
    state.line = { status:'idle', code:null, loginUrl:null, displayName:null, pictureUrl:null, tickers:[] };
    closeLineModal();
    paint();
    lineNotify();
    if(code && lineWorkerReady()){
      fetch(lineApi('/api/session/logout'), {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code: code })
      }).catch(function(){});
    }
  }

  function cardHTML(t, s, stocks){
    var chgCls = !s || !isNum(s.chg_pct) ? 'fl' : (s.chg_pct > 0 ? 'up' : s.chg_pct < 0 ? 'dn' : 'fl');
    var flags = flagsOf(t, s, stocks || {});
    return '<div class="wl-card" data-wl-tk="' + esc(t) + '">' +
      '<div class="wl-top"><span class="wl-tk">$' + esc(t) + '</span>' +
      (s ? '<span class="wl-px">' + esc(price(s.price)) + '</span>' : '') + '</div>' +
      (s ? ('<span class="wl-nm">' + esc((s.name||'').slice(0,42)) + '</span>' +
            '<span class="wl-chg ' + chgCls + '">' + esc(pct(s.chg_pct)) + '</span>')
          : '<span class="wl-nm">' + esc(tx(C.unknownNote)) + '</span>') +
      (flags.length ? '<div class="wl-flags">' + flags.map(function(f){
        return '<div class="wl-flag ' + f.k + '">' + esc(tx(f.t)) + '</div>';
      }).join('') + '</div>' : '') +
      '<div class="wl-btns">' +
        '<button type="button" class="wl-btn open" data-wl-open="' + esc(t) + '">' + esc(tx(C.open)) + '</button>' +
        '<a class="wl-btn rm" href="' + deepLink('remove', t) + '" target="_blank" rel="noopener noreferrer">' + esc(tx(C.remove)) + '</a>' +
        '<button type="button" class="wl-btn cp" data-wl-copy-rm="' + esc(t) + '">' + esc(tx(C.copy)) + '</button>' +
      '</div></div>';
  }

  function howtoRowHTML(key, label, cmd){
    return '<div class="wl-howto-row">' +
      '<span class="wl-howto-label">' + esc(label) + '</span>' +
      '<code class="wl-howto-code" data-wl-ex="' + key + '">' + esc(cmd) + '</code>' +
      '<button type="button" class="wl-copybtn" data-wl-copy="' + key + '">' + esc(tx(C.copy)) + '</button>' +
    '</div>';
  }

  function lineCardHTML(t, s){
    var chgCls = !s || !isNum(s.chg_pct) ? 'fl' : (s.chg_pct > 0 ? 'up' : s.chg_pct < 0 ? 'dn' : 'fl');
    return '<div class="wl-card" data-wl-tk="' + esc(t) + '">' +
      '<div class="wl-top"><span class="wl-tk">$' + esc(t) + '</span>' +
      (s ? '<span class="wl-px">' + esc(price(s.price)) + '</span>' : '') + '</div>' +
      (s ? ('<span class="wl-nm">' + esc((s.name||'').slice(0,42)) + '</span>' +
            '<span class="wl-chg ' + chgCls + '">' + esc(pct(s.chg_pct)) + '</span>')
          : '<span class="wl-nm">' + esc(tx(C.unknownNote)) + '</span>') +
      '<div class="wl-btns">' +
        '<button type="button" class="wl-btn open" data-wl-open="' + esc(t) + '">' + esc(tx(C.open)) + '</button>' +
        '<button type="button" class="wl-btn rm" data-wl-line-rm="' + esc(t) + '">' + esc(tx(C.remove)) + '</button>' +
      '</div></div>';
  }

  function fmt1(o, map){
    var s = tx(o);
    for(var k in map) s = s.split('{' + k + '}').join(map[k]);
    return s;
  }

  /* ---- portfolio analysis: the "zoomed out" view above the per-stock
     cards -- which sector each holding sits in, whether the list leans
     concentrated in one group, and a risk-tier read built from the exact
     same flagsOf() signals already shown per-card (bearish/bullish
     divergence, golden/death cross, below its 200-day average, and how it
     compares with its own sector this month). No new data source: this is
     the same stocks snapshot + flag logic, just rolled up across the whole
     list instead of one ticker at a time. ------------------------------

     Sector colors: the site's theme only defines a handful of semantic
     tokens (accent, red, amber) -- fine for high/medium/low risk, but there
     is no existing multi-hue set for telling arbitrary sector NAMES apart.
     This fixed 6-hue order is validated (adjacent-pair CVD delta-E clears
     the safety target in dark mode; see the dataviz skill's palette) and is
     never cycled past slot 6 -- a 7th+ sector folds into a neutral "other"
     grey rather than generating a new hue. Assignment is by each sector's
     rank in this ticker list's OWN sector breakdown (biggest sectors -- the
     ones that matter for the concentration story -- get a distinct color;
     smaller tail sectors share the neutral), not by alphabetical accident,
     so the color for "the sector I'm most exposed to" stays intuitive. */
  var SECTOR_HUES = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];
  var SECTOR_OTHER_HUE = '#5a5f54';

  /* a small scattered starfield -- decorative only, used by the profile
     header and the shareable card to read as "space" rather than a plain
     dark card. A fixed pseudo-random sequence (not Math.random) so the
     layout doesn't jump every repaint. */
  var STAR_SEED = [
    [8,14,1.6,0], [22,62,1,0.6], [37,28,1.8,1.4], [51,80,1.2,2.1], [63,18,1.4,0.3],
    [76,55,1,1.8], [88,32,1.6,2.6], [14,88,1.2,1.1], [45,8,1,2.9], [95,70,1.8,0.9],
    [30,95,1.4,1.6], [68,90,1,2.3], [5,45,1.2,0.5], [58,40,1,1.3], [82,12,1.4,2.0]
  ];
  function starsHTML(cls, count){
    var n = Math.min(count || STAR_SEED.length, STAR_SEED.length);
    var out = '';
    for(var i=0;i<n;i++){
      var s = STAR_SEED[i];
      out += '<i style="left:' + s[0] + '%;top:' + s[1] + '%;width:' + s[2] + 'px;height:' + s[2] + 'px;animation-delay:' + s[3] + 's;"></i>';
    }
    return '<div class="' + cls + '">' + out + '</div>';
  }

  /* shared by the detailed panel, the profile header and the shareable
     card -- one calculation so all three always agree with each other. */
  function computePortfolioSummary(tickers, stocks){
    stocks = stocks || {};
    var bySector = {}, sectorOrder = [];
    var tiers = { high:[], medium:[], low:[] };
    var known = 0;

    tickers.forEach(function(t){
      var s = stocks[t];
      var sector = (s && s.sector) || null;
      var key = sector || '__other';
      if(!bySector[key]){ bySector[key] = 0; sectorOrder.push(key); }
      bySector[key]++;

      if(s) known++;
      var flags = flagsOf(t, s || {}, stocks);
      var bad = flags.filter(function(f){ return f.k === 'bad'; }).length;
      var warn = flags.filter(function(f){ return f.k === 'warn'; }).length;
      var tier = bad > 0 ? 'high' : (warn > 0 ? 'medium' : 'low');
      tiers[tier].push(t);
    });

    var total = tickers.length;
    var sectorRows = sectorOrder
      .sort(function(a, b){ return bySector[b] - bySector[a]; })
      .map(function(key){
        var count = bySector[key];
        var pct = Math.round((count / total) * 100);
        var label = key === '__other' ? tx(C.paSectorOther) : key;
        return { key:key, label:label, count:count, pct:pct };
      });

    /* color by rank in THIS list (biggest exposure gets the most
       distinguishable slot), never cycled past the 6-hue theme -- a 7th+
       sector (or the uncategorized bucket) shares the neutral "other" grey
       instead of inventing a new hue. */
    sectorRows.forEach(function(row, i){
      row.color = (row.key !== '__other' && i < SECTOR_HUES.length) ? SECTOR_HUES[i] : SECTOR_OTHER_HUE;
    });

    /* a single "how risky is this list as a whole" score -- a ratio against
       a fixed 0-100 limit is exactly the Meter form (not a gauge/speedometer,
       which reads position more precisely than people can judge by eye). */
    var riskScore = known ? Math.round((tiers.high.length * 100 + tiers.medium.length * 50) / total) : 0;
    var riskLevel = riskScore >= 60 ? 'high' : (riskScore >= 30 ? 'medium' : 'low');

    return { total:total, known:known, tiers:tiers, sectorRows:sectorRows, riskScore:riskScore, riskLevel:riskLevel };
  }

  /* single source of truth for "what name do we show this LINE-linked
     visitor as", shared by every card on this page (profile header, connect
     strip, share card). The topbar/nav "Signed in with LINE" card lets the
     visitor override their raw LINE name with one of their own choosing
     (state.line.nameOverride) -- everywhere on the site that shows their
     name must prefer that override the same way, or an edit made up there
     would look like it "didn't save" down here. Falls back to the raw LINE
     profile name, then a generic guest label. */
  function lineEffectiveName(lineSt, guestLabel){
    return (lineSt.nameOverride || lineSt.displayName || '').trim() || guestLabel || '';
  }

  /* the top-of-page "this is your board" strip -- site logo, the LINE-linked
     person's own name + photo, and a quick-glance summary, so the page reads
     as a personal profile the moment it loads rather than a bare list. Also
     hosts the entry point into the shareable portfolio card (below). */
  function profileHeaderHTML(tickers, stocks, lineSt){
    if(!tickers.length) return '';
    var sum = computePortfolioSummary(tickers, stocks);
    var top = sum.sectorRows[0];
    var riskText = sum.riskLevel === 'high' ? C.paRiskHigh : sum.riskLevel === 'medium' ? C.paRiskMed : C.paRiskLow;
    var shownName = lineEffectiveName(lineSt, tx(C.profileGuest));
    var avatarHTML = lineSt.pictureUrl
      ? '<img class="wl-profile-avatar" src="' + esc(lineSt.pictureUrl) + '" alt="">'
      : '<div class="wl-profile-avatar wl-profile-avatar-fallback">' + esc((shownName || '?').charAt(0).toUpperCase()) + '</div>';

    return '<div class="wl-profile">' +
      starsHTML('wl-profile-stars', 10) +
      '<div class="wl-profile-top">' +
        '<div class="wl-profile-logo">' + (window.__spzMark ? window.__spzMark('wl-profile-mark', { stroke:true, w:3 }) : '') + '<span>SPACEZ TERMINAL</span></div>' +
        '<button type="button" class="wl-profile-share-btn" data-wl="openShare">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>' +
          '<span>' + esc(tx(C.profileShareBtn)) + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="wl-profile-main">' +
        avatarHTML +
        '<div class="wl-profile-info">' +
          '<div class="wl-profile-name">' + esc(shownName || tx(C.profileGuest)) + '</div>' +
          '<div class="wl-profile-stats">' +
            '<span class="wl-profile-stat"><b>' + sum.total + '</b> ' + esc(tx(C.profileHoldings)) + '</span>' +
            (top ? '<span class="wl-profile-stat">' + esc(tx(C.profileTopSector)) + ' <b>' + esc(top.label) + '</b></span>' : '') +
            (sum.known ? '<span class="wl-profile-stat wl-profile-risk ' + sum.riskLevel + '">' + esc(tx(riskText)) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function portfolioAnalysisHTML(tickers, stocks){
    if(!tickers.length) return '';
    stocks = stocks || {};
    var sum = computePortfolioSummary(tickers, stocks);
    var total = sum.total, known = sum.known, tiers = sum.tiers, sectorRows = sum.sectorRows;

    var stackBarHTML = '<div class="wl-pa-stackbar">' + sectorRows.map(function(row){
      return '<span style="width:' + row.pct + '%;background:' + row.color + ';" title="' + esc(row.label) + ' · ' + row.pct + '%"></span>';
    }).join('') + '</div>';

    var sectorsHTML = sectorRows.map(function(row){
      return '<div class="wl-pa-sector-row">' +
        '<span class="wl-pa-sector-dot" style="background:' + row.color + ';"></span>' +
        '<span class="wl-pa-sector-name">' + esc(row.label) + '</span>' +
        '<span class="wl-pa-sector-track"><span class="wl-pa-sector-bar" style="width:' + row.pct + '%;background:' + row.color + ';"></span></span>' +
        '<span class="wl-pa-sector-pct">' + row.pct + '% · ' + row.count + '</span>' +
      '</div>';
    }).join('');

    var top = sectorRows[0];
    var concCls = 'good', concText = tx(C.paConcOk);
    if(top && sectorRows.length > 1 && top.key !== '__other'){
      if(top.pct >= 50){
        concCls = 'bad';
        concText = fmt1(C.paConcHigh, { p:top.pct, s:top.label });
      } else if(top.pct >= 35){
        concCls = 'warn';
        concText = fmt1(C.paConcMed, { p:top.pct, s:top.label });
      }
    } else if(top && sectorRows.length === 1 && top.key !== '__other' && total >= 2){
      concCls = 'bad';
      concText = fmt1(C.paConcHigh, { p:100, s:top.label });
    }

    var riskRowsHTML = ['high','medium','low'].map(function(tier){
      if(!tiers[tier].length) return '';
      var tagText = tier === 'high' ? C.paRiskHigh : tier === 'medium' ? C.paRiskMed : C.paRiskLow;
      var chips = tiers[tier].map(function(t){
        return '<button type="button" class="wl-pa-chip ' + tier + '" data-wl-open="' + esc(t) + '">$' + esc(t) + '</button>';
      }).join('');
      return '<div class="wl-pa-risk-row"><span class="wl-pa-risk-tag ' + tier + '">' + esc(tx(tagText)) + '</span>' +
        '<span class="wl-pa-chips">' + chips + '</span></div>';
    }).join('');

    var riskLevel = sum.riskLevel, riskScore = sum.riskScore;
    var riskLevelText = riskLevel === 'high' ? C.paRiskHigh : riskLevel === 'medium' ? C.paRiskMed : C.paRiskLow;
    var meterHTML = known ? (
      '<div class="wl-pa-meter-row">' +
        '<div class="wl-pa-meter-track"><div class="wl-pa-meter-fill ' + riskLevel + '" style="width:' + riskScore + '%;"></div></div>' +
        '<span class="wl-pa-meter-tag ' + riskLevel + '">' + esc(tx(riskLevelText)) + '</span>' +
      '</div>'
    ) : '';

    return '<div class="wl-pa">' +
      '<div class="wl-pa-h">' + esc(tx(C.paH)) + '</div>' +
      '<p class="wl-pa-lede">' + esc(tx(C.paLede)) + '</p>' +
      (known ? '<div class="wl-pa-block">' +
        '<div class="wl-pa-label">' + esc(tx(C.paMeterLabel)) + '</div>' +
        meterHTML +
      '</div>' : '') +
      '<div class="wl-pa-block">' +
        '<div class="wl-pa-label">' + esc(tx(C.paSectorLabel)) + '</div>' +
        stackBarHTML +
        '<div class="wl-pa-sectors">' + sectorsHTML + '</div>' +
        '<div class="wl-pa-note ' + concCls + '" style="margin-top:10px;">' + esc(concText) + '</div>' +
      '</div>' +
      (known ? '<div class="wl-pa-block">' +
        '<div class="wl-pa-label">' + esc(tx(C.paRiskLabel)) + '</div>' +
        riskRowsHTML +
      '</div>' : '<div class="wl-pa-block"><p class="wl-pa-none">' + esc(tx(C.paNone)) + '</p></div>') +
    '</div>';
  }

  /* ---- Market Shock Simulator, applied to the LINE-linked user's own
     holdings. The site already has a full 18-scenario x 4-archetype
     (value/growth/dividend/defensive) simulator (window.__SPZ_SCENARIOS,
     the "scenarios" route) built for teaching -- this reuses that exact
     data set rather than inventing a second one, and answers the one
     question that generic tool can't: "given what I actually hold, do
     I rise or fall in this scenario, and what should I look at instead?"
     Real per-ticker sector names (from the live snapshot) are mapped to
     the simulator's 4 archetypes by keyword; a sector this can't place
     is shown as unclassified rather than guessed at. ------------------ */
  var SHOCK_ARCH_KEYWORDS = {
    value: ['bank','financ','insur','energy','oil','gas','petro','industr','material','steel','cement','construct','property','real estate','conglomerate',
            'ธนาคาร','การเงิน','ประกัน','พลังงาน','น้ำมัน','ปิโตร','อุตสาหกรรม','วัสดุ','อสังหา','ก่อสร้าง'],
    growth: ['tech','software','semiconductor','internet','ecommerce','electronic','media','entertainment',
             'เทคโนโลยี','ไอที','อิเล็กทรอนิกส์','สื่อ','บันเทิง'],
    dividend: ['telecom','utilit','infrastructure','transport','communicat','reit','logistics',
               'โทรคมนาคม','สาธารณูปโภค','ขนส่ง','สื่อสาร','กองทุนอสังหา','โลจิสติกส์'],
    defensive: ['health','hospital','pharma','staple','food','beverage','consumer','retail','agri',
                'สาธารณสุข','โรงพยาบาล','ยา','อาหาร','เครื่องดื่ม','อุปโภคบริโภค','ค้าปลีก','เกษตร']
  };
  function shockArchetypeForSector(sector, archOrder){
    if(!sector) return null;
    var s = String(sector).toLowerCase();
    for(var i=0;i<archOrder.length;i++){
      var kws = SHOCK_ARCH_KEYWORDS[archOrder[i]] || [];
      for(var j=0;j<kws.length;j++){ if(s.indexOf(kws[j].toLowerCase()) !== -1) return archOrder[i]; }
    }
    return null;
  }
  var SHOCK_ARCH_LABEL = {
    value:{en:'Value',th:'คุณค่า'}, growth:{en:'Growth',th:'เติบโต'},
    dividend:{en:'Dividend',th:'ปันผล'}, defensive:{en:'Defensive',th:'ตั้งรับ'}
  };

  /* ---- big, one-card-per-sector graphs: a closer look inside each sector
     the user holds, ticker by ticker, using real live chg_pct data (never
     a fabricated "weight" -- this list has no share counts). Reuses
     computePortfolioSummary's sectorRows for both the sort order AND the
     exact colors already shown in the sector-allocation chart above it, so
     the same sector never gets two different colors on one page. Answers
     the "add bigger sector graphs, like Technology / Consumer / Healthcare"
     request as an addition inside the existing centered layout, instead of
     the riskier sitewide full-width relayout that was also floated. */
  function sectorGraphsHTML(tickers, stocks){
    if(!tickers.length) return '';
    var sum = computePortfolioSummary(tickers, stocks);
    if(!sum.total) return '';
    var bySector = {};
    tickers.forEach(function(t){
      var s = stocks ? stocks[t] : null;
      var key = (s && s.sector) || '__other';
      var chg = s && isNum(s.chg_pct) ? s.chg_pct : null;
      (bySector[key] = bySector[key] || []).push({ t:t, chg:chg });
    });
    var maxAbs = 0;
    Object.keys(bySector).forEach(function(k){
      bySector[k].forEach(function(it){ if(it.chg !== null) maxAbs = Math.max(maxAbs, Math.abs(it.chg)); });
    });
    if(!maxAbs) maxAbs = 2;

    var cardsHTML = sum.sectorRows.map(function(row){
      var items = bySector[row.key] || [];
      var rowsHTML = items.map(function(it){
        var cls = it.chg === null ? 'fl' : it.chg > 0 ? 'up' : it.chg < 0 ? 'down' : 'fl';
        var half = it.chg === null ? 0 : Math.min(50, (Math.abs(it.chg) / maxAbs) * 50);
        var barStyle = cls === 'up' ? ('left:50%;width:' + half + '%;')
          : cls === 'down' ? ('left:' + (50 - half) + '%;width:' + half + '%;') : '';
        return '<div class="wl-secg-row">' +
          '<button type="button" class="wl-secg-tk" data-wl-open="' + esc(it.t) + '">$' + esc(it.t) + '</button>' +
          '<div class="wl-secg-track"><span class="wl-secg-mid"></span>' +
            (cls !== 'fl' ? '<span class="wl-secg-fill ' + cls + '" style="' + barStyle + '"></span>' : '') +
          '</div>' +
          '<span class="wl-secg-val ' + cls + '">' + pct(it.chg) + '</span>' +
        '</div>';
      }).join('');
      return '<div class="wl-secg-card">' +
        '<div class="wl-secg-head"><i style="background:' + row.color + ';"></i><b>' + esc(row.label) + '</b>' +
          '<span>' + row.count + ' · ' + row.pct + '%</span></div>' +
        '<div class="wl-secg-rows">' + rowsHTML + '</div>' +
      '</div>';
    }).join('');

    return '<div class="wl-pa wl-secg-wrap">' +
      '<div class="wl-pa-h">' + esc(tx(C.secgH)) + '</div>' +
      '<p class="wl-pa-lede">' + esc(tx(C.secgLede)) + '</p>' +
      '<div class="wl-secg">' + cardsHTML + '</div>' +
    '</div>';
  }

  /* shared by both the inline Watchlist-page card (shockSimulatorHTML,
     collapsed behind its own tap-to-open toggle) and the Round K11
     floating bottom-right popup (shockPopupBodyHTML, always "open" the
     moment the popup itself is open) -- same scenario picker + result
     slot, same wireShockPicker/shockRenderResult behind it either way, so
     a scenario picked in one place behaves identically in the other. */
  function shockPickerAndResultHTML(list, archOrder){
    var optionsHTML = list.map(function(s, i){
      return '<option value="' + i + '">' + esc(L() === 'th' ? s.title_th : s.title_en) + '</option>';
    }).join('');
    var titleOf = function(s){ return L() === 'th' ? s.title_th : s.title_en; };
    var dropdownHTML = list.map(function(s, i){
      return '<button type="button" class="wl-shock-opt' + (i === 0 ? ' active' : '') + '" data-wl-opt="' + i + '" role="option">' +
        '<i></i><span>' + esc(titleOf(s)) + '</span></button>';
    }).join('');
    return '<p class="wl-pa-lede">' + esc(tx(C.shockLede)) + '</p>' +
        '<div class="wl-shock-picker" data-wl="shockPicker">' +
          '<button type="button" class="wl-shock-trigger" data-wl="shockTrigger" aria-haspopup="listbox" aria-expanded="false">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z"/></svg>' +
            '<span data-wl="shockTriggerLabel">' + esc(titleOf(list[0])) + '</span>' +
            '<svg class="wl-shock-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="wl-shock-dropdown" data-wl="shockDropdown" role="listbox">' + dropdownHTML + '</div>' +
          '<select class="wl-shock-select-native" data-wl="shockSelect" tabindex="-1" aria-hidden="true">' + optionsHTML + '</select>' +
        '</div>' +
        '<div data-wl="shockResult"></div>';
  }

  function shockSimulatorHTML(tickers, stocks){
    if(!tickers.length || !window.__SPZ_SCENARIOS) return '';
    var list = window.__SPZ_SCENARIOS.list();
    var archOrder = window.__SPZ_SCENARIOS.archetypes();
    if(!list.length) return '';
    return '<div class="wl-pa wl-shock" data-wl-shock-root>' +
      starsHTML('wl-shock-stars', 8) +
      '<button type="button" class="wl-shock-toggle" data-wl="shockToggle" aria-expanded="false">' +
        '<span class="wl-shock-toggle-left">' +
          '<span class="wl-pa-h" style="margin:0;">' + esc(tx(C.shockH)) + '</span>' +
          '<span class="wl-shock-badge">' + esc(tx(C.shockBadge)) + '</span>' +
        '</span>' +
        '<span style="display:flex;align-items:center;gap:8px;">' +
          '<span class="wl-shock-toggle-hint" data-wl="shockToggleHint">' + esc(tx(C.shockToggleOpen)) + '</span>' +
          '<svg class="wl-shock-toggle-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
        '</span>' +
      '</button>' +
      '<div class="wl-shock-collapse" data-wl="shockCollapse">' +
        shockPickerAndResultHTML(list, archOrder) +
      '</div>' +
    '</div>';
  }

  /* Round K11: the same simulator, rendered for the floating bottom-right
     popup instead of the inline Watchlist-page card -- no toggle/collapse
     chrome, since the popup's own open/close already serves that role.
     wireShockPicker/shockRenderResult don't care which wrapper they're
     called on, so this reuses both unchanged. */
  function shockPopupBodyHTML(tickers, stocks){
    if(!tickers.length || !window.__SPZ_SCENARIOS) return '';
    var list = window.__SPZ_SCENARIOS.list();
    var archOrder = window.__SPZ_SCENARIOS.archetypes();
    if(!list.length) return '';
    return shockPickerAndResultHTML(list, archOrder);
  }

  /* wires the custom trigger + dropdown to the hidden native <select> --
     picking a row updates the select's value and dispatches 'change', so
     the existing shockSelect 'change' listener (unchanged) still does all
     the actual re-rendering of the result block. The click-outside-closes
     listener is registered on document ONCE (module-level flag), not per
     paint(), so repeated add/remove-ticker repaints never pile up extra
     global listeners referencing stale, detached DOM. */
  var shockPickerGlobalWired = false;
  function wireShockPicker(root){
    var trigger = root.querySelector('[data-wl="shockTrigger"]');
    var dropdown = root.querySelector('[data-wl="shockDropdown"]');
    var nativeSelect = root.querySelector('[data-wl="shockSelect"]');
    var label = root.querySelector('[data-wl="shockTriggerLabel"]');
    if(!trigger || !dropdown || !nativeSelect) return;
    function closeDd(){
      dropdown.classList.remove('open');
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function openDd(){
      dropdown.classList.add('open');
      trigger.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      if(dropdown.classList.contains('open')) closeDd(); else openDd();
    });
    var opts = dropdown.querySelectorAll('[data-wl-opt]');
    for(var i=0;i<opts.length;i++){
      (function(opt){
        opt.addEventListener('click', function(){
          var idx = opt.getAttribute('data-wl-opt');
          nativeSelect.value = idx;
          label.textContent = opt.querySelector('span').textContent;
          for(var j=0;j<opts.length;j++) opts[j].classList.remove('active');
          opt.classList.add('active');
          closeDd();
          nativeSelect.dispatchEvent(new Event('change'));
        });
      })(opts[i]);
    }
    if(!shockPickerGlobalWired){
      shockPickerGlobalWired = true;
      document.addEventListener('click', function(e){
        var openDds = document.querySelectorAll('.wl-shock-dropdown.open');
        for(var k=0;k<openDds.length;k++){
          var dd = openDds[k];
          var picker = dd.closest('.wl-shock-picker');
          if(!picker || !picker.contains(e.target)){
            dd.classList.remove('open');
            var trg = picker ? picker.querySelector('[data-wl="shockTrigger"]') : null;
            if(trg){ trg.classList.remove('open'); trg.setAttribute('aria-expanded', 'false'); }
          }
        }
      });
    }
  }

  /* renders just the result block for one chosen scenario -- called once on
     first paint and again whenever the dropdown changes, so the page never
     needs a full repaint just to switch scenarios. */
  function shockRenderResult(root, tickers, stocks, scenarioIndex){
    var resultEl = root.querySelector('[data-wl="shockResult"]');
    if(!resultEl || !window.__SPZ_SCENARIOS) return;
    var list = window.__SPZ_SCENARIOS.list();
    var archOrder = window.__SPZ_SCENARIOS.archetypes();
    var scen = list[scenarioIndex] || list[0];
    if(!scen){ resultEl.innerHTML = ''; return; }

    var buckets = { rises:[], falls:[], mixed:[], unclassified:[] };
    tickers.forEach(function(t){
      var s = stocks ? stocks[t] : null;
      var arch = s ? shockArchetypeForSector(s.sector, archOrder) : null;
      if(!arch){ buckets.unclassified.push(t); return; }
      var state = scen.impacts[arch] ? scen.impacts[arch].state : 'mixed';
      (buckets[state] || buckets.mixed).push({ t:t, arch:arch });
    });

    var total = tickers.length;
    var risesPct = Math.round((buckets.rises.length / total) * 100);
    var fallsPct = Math.round((buckets.falls.length / total) * 100);
    var mixedPct = 100 - risesPct - fallsPct;

    var barHTML = '<div class="wl-pa-stackbar wl-shock-bar">' +
      (buckets.rises.length ? '<span style="width:' + risesPct + '%;background:var(--neon-2,var(--neon));" title="' + esc(tx(C.shockRises)) + ' ' + risesPct + '%"></span>' : '') +
      (buckets.mixed.length + buckets.unclassified.length ? '<span style="width:' + (mixedPct) + '%;background:var(--grey-dim);" title="' + esc(tx(C.shockMixed)) + ' ' + mixedPct + '%"></span>' : '') +
      (buckets.falls.length ? '<span style="width:' + fallsPct + '%;background:var(--red);" title="' + esc(tx(C.shockFalls)) + ' ' + fallsPct + '%"></span>' : '') +
    '</div>';

    /* three headline stat tiles (rises/mixed/falls %) with directional
       glyphs -- the bland old version was just the bar with no upfront
       numbers, so the eye had nothing to land on before reading chips. */
    var arrowUp = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    var arrowDown = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
    var arrowMixed = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h4l2-5 4 10 2-5h4"/></svg>';
    var statsHTML = '<div class="wl-shock-stats">' +
      '<div class="wl-shock-stat rises">' + arrowUp + '<b>' + risesPct + '%</b><span>' + esc(tx(C.shockRises)) + '</span></div>' +
      '<div class="wl-shock-stat mixed">' + arrowMixed + '<b>' + mixedPct + '%</b><span>' + esc(tx(C.shockMixed)) + '</span></div>' +
      '<div class="wl-shock-stat falls">' + arrowDown + '<b>' + fallsPct + '%</b><span>' + esc(tx(C.shockFalls)) + '</span></div>' +
    '</div>';

    function tierBlock(key, labelTxt, cls){
      var items = buckets[key];
      if(!items.length) return '';
      var chips = items.map(function(it){
        return '<button type="button" class="wl-pa-chip ' + cls + '" data-wl-open="' + esc(it.t) + '">$' + esc(it.t) + '</button>';
      }).join('');
      return '<div class="wl-pa-risk-row"><span class="wl-pa-risk-tag ' + cls + '">' + esc(labelTxt) + '</span>' +
        '<span class="wl-pa-chips">' + chips + '</span></div>';
    }

    var riskClsFor = { rises:'low', falls:'high', mixed:'medium' };
    var tiersHTML =
      tierBlock('rises', tx(C.shockRises), riskClsFor.rises) +
      tierBlock('falls', tx(C.shockFalls), riskClsFor.falls) +
      tierBlock('mixed', tx(C.shockMixed), riskClsFor.mixed);
    var unclassifiedHTML = buckets.unclassified.length
      ? '<div class="wl-pa-risk-row"><span class="wl-pa-risk-tag">' + esc(tx(C.shockUnclassified)) + '</span>' +
          '<span class="wl-pa-chips">' + buckets.unclassified.map(function(t){
            return '<button type="button" class="wl-pa-chip" data-wl-open="' + esc(t) + '">$' + esc(t) + '</button>';
          }).join('') + '</span></div>'
      : '';

    /* rotation idea: which archetype(s) rise in this scenario, in the
       simulator's own words -- no invented example tickers, since the
       site's directory examples are US mega-caps that would mismatch a
       Thai-heavy holding list. */
    var risingArch = archOrder.filter(function(a){ return scen.impacts[a] && scen.impacts[a].state === 'rises'; });
    var rotateHTML = risingArch.length ? '<div class="wl-shock-rotate">' +
      '<div class="wl-pa-label">' + esc(tx(C.shockRotateH)) + '</div>' +
      risingArch.map(function(a){
        var label = SHOCK_ARCH_LABEL[a] ? (L() === 'th' ? SHOCK_ARCH_LABEL[a].th : SHOCK_ARCH_LABEL[a].en) : a;
        var reason = L() === 'th' ? scen.impacts[a].reason_th : scen.impacts[a].reason_en;
        return '<div class="wl-shock-rotate-row"><b>' + esc(label) + '</b> — ' + esc(reason) + '</div>';
      }).join('') +
    '</div>' : '';

    resultEl.innerHTML =
      '<p class="wl-shock-desc">' + esc(L() === 'th' ? scen.desc_th : scen.desc_en) + '</p>' +
      statsHTML +
      barHTML +
      tiersHTML + unclassifiedHTML +
      rotateHTML;

    var openBtns = resultEl.querySelectorAll('[data-wl-open]');
    for(var i=0;i<openBtns.length;i++){
      openBtns[i].addEventListener('click', function(){
        var t = this.getAttribute('data-wl-open');
        if(window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(t);
      });
    }
  }

  /* ---- shareable portfolio infographic card -- a dark, styled rectangle
     (deliberately NOT a plain white-background/black-text screenshot) with
     the site logo, the LINE-linked person's own name + photo, and the same
     sector/risk graphics as this page, sized to be saved or shared. The
     rasterizer (html2canvas) is lazy-loaded on first use so visitors who
     never click "Share" never pay for it; "Print / Save as PDF" instead
     reuses the browser's own print dialog rather than a second library. */
  var shareModalEl = null, html2canvasLoading = null;
  var pickModalEl = null;

  /* Round K11: floating bottom-right "what if the market shocks" popup --
     the FAB sits above the site's existing bottom-right button row (back
     to top / admin login / system status, all at bottom:18px) so it never
     visually collides with them, and both the FAB and the popup are
     appended straight to document.body (like shareModalEl/pickModalEl
     above) so they survive this page's own paint() re-renders and stay
     reachable from any route, not just while #watchlist is scrolled into
     view. Built once, then just shown/hidden by paintShockFab() below. */
  var shockFabEl = null, shockPopupEl = null;

  /* Round L: which of the two tabs is showing -- "portfolio" (a condensed
     real-holdings card) or "scenario" (the original K11 simulator). One
     shared module var since only one popup instance ever exists; the last
     tickers/stocks/lineSt paintShockFab was called with are cached here so
     a tab click can re-render without needing paint() to run again. */
  var shockPopupMode = 'portfolio';
  var shockLastArgs = null;

  function ensureShockPopup(){
    if(shockFabEl) return;
    shockFabEl = document.createElement('button');
    shockFabEl.type = 'button';
    shockFabEl.id = 'spzShockFab';
    shockFabEl.setAttribute('aria-label', tx(C.shockFabLabel));
    shockFabEl.title = tx(C.shockFabLabel);
    shockFabEl.innerHTML =
      '<span class="spz-shock-fab-ring"></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z"/></svg>';
    document.body.appendChild(shockFabEl);

    shockPopupEl = document.createElement('div');
    shockPopupEl.id = 'spzShockPopup';
    shockPopupEl.innerHTML =
      '<div class="spz-shock-pop-inner" data-spzshock="inner">' +
        '<div class="spz-shock-pop-head">' +
          '<span class="spz-shock-pop-icon">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z"/></svg>' +
          '</span>' +
          '<span class="spz-shock-pop-title" data-spzshock="title"></span>' +
          '<button type="button" class="spz-shock-pop-close" data-spzshock="close" aria-label="close">&times;</button>' +
        '</div>' +
        '<div class="spz-shock-modetabs" data-spzshock="modetabs">' +
          '<button type="button" class="spz-shock-modetab" data-spzshock-mode="portfolio">' + esc(tx(C.shockModePortfolio)) + '</button>' +
          '<button type="button" class="spz-shock-modetab" data-spzshock-mode="scenario">' + esc(tx(C.shockModeScenario)) + '</button>' +
        '</div>' +
        '<div class="spz-shock-pop-disc" data-spzshock="disc"></div>' +
        '<div class="spz-shock-pop-body" data-spzshock="body"></div>' +
      '</div>' +
      '<div class="spz-shock-announce-ov" data-spzshock="announceOv" hidden>' +
        '<div class="spz-shock-announce-card">' +
          '<div class="spz-shock-announce-head">' +
            '<span class="spz-shock-announce-ico">📣</span>' +
            '<span class="spz-shock-announce-lbl" data-spzshock="announceLbl"></span>' +
            '<button type="button" class="spz-shock-announce-close" data-spzshock="announceClose" aria-label="close">&times;</button>' +
          '</div>' +
          '<div data-spzshock="announceImgWrap"></div>' +
          '<div class="spz-shock-announce-txt" data-spzshock="announceTxt"></div>' +
          '<div class="spz-shock-announce-bar"><i data-spzshock="announceBarFill"></i></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(shockPopupEl);

    shockFabEl.addEventListener('click', function(){
      var opening = !shockPopupEl.classList.contains('open');
      shockPopupEl.classList.toggle('open');
      shockFabEl.classList.toggle('on', shockPopupEl.classList.contains('open'));
      if(opening) maybeShowAnnounceOverlay();
    });
    shockPopupEl.querySelector('[data-spzshock="close"]').addEventListener('click', function(){
      shockPopupEl.classList.remove('open');
      shockFabEl.classList.remove('on');
    });
    shockPopupEl.querySelector('[data-spzshock="modetabs"]').addEventListener('click', function(e){
      var btn = e.target.closest('[data-spzshock-mode]');
      if(!btn) return;
      var mode = btn.getAttribute('data-spzshock-mode');
      if(mode === shockPopupMode) return;
      shockPopupMode = mode;
      renderShockPopupBody();
    });
    shockPopupEl.querySelector('[data-spzshock="announceClose"]').addEventListener('click', function(){
      dismissAnnounceOverlay();
    });
  }

  /* Round N: shown once per fresh "open" click of the FAB (not while it
     stays open), per her explicit request -- blurs the existing tab content
     behind a slide-in card for whichever announcement window.__SPZ_ANNOUNCE
     currently considers active/undismissed, then self-clears after ~30s or
     on manual close, whichever comes first. Nothing renders at all when
     there's no active announcement (window.__SPZ_ANNOUNCE.latest() is null),
     so this is a no-op on every open until an admin actually posts one. */
  var announceTimer = null;
  function dismissAnnounceOverlay(){
    if(announceTimer){ clearTimeout(announceTimer); announceTimer = null; }
    if(!shockPopupEl) return;
    var a = shockPopupEl.__spzAnnounceCurrent;
    shockPopupEl.classList.remove('announcing');
    shockPopupEl.__spzAnnounceCurrent = null;
    if(a && window.__SPZ_ANNOUNCE) window.__SPZ_ANNOUNCE.dismiss(a.id);
  }
  function maybeShowAnnounceOverlay(){
    if(!window.__SPZ_ANNOUNCE || !shockPopupEl) return;
    var a = window.__SPZ_ANNOUNCE.latest();
    if(!a) return;
    shockPopupEl.__spzAnnounceCurrent = a;
    shockPopupEl.querySelector('[data-spzshock="announceLbl"]').textContent = tx(C.shockAnnounceLbl);
    shockPopupEl.querySelector('[data-spzshock="announceTxt"]').textContent = a.text;
    var imgWrap = shockPopupEl.querySelector('[data-spzshock="announceImgWrap"]');
    imgWrap.innerHTML = a.imageUrl ? '<img class="spz-shock-announce-img" src="' + esc(a.imageUrl) + '" alt="">' : '';
    shockPopupEl.querySelector('[data-spzshock="announceOv"]').hidden = false;
    shockPopupEl.classList.add('announcing');
    var fill = shockPopupEl.querySelector('[data-spzshock="announceBarFill"]');
    var AUTO_MS = 30000;
    if(fill){
      fill.style.transition = 'none';
      fill.style.transform = 'scaleX(1)';
      // eslint-disable-next-line no-unused-expressions
      fill.offsetHeight; // force reflow so the transition below actually animates from 1 -> 0
      fill.style.transition = 'transform ' + (AUTO_MS / 1000) + 's linear';
      fill.style.transform = 'scaleX(0)';
    }
    if(announceTimer) clearTimeout(announceTimer);
    announceTimer = setTimeout(dismissAnnounceOverlay, AUTO_MS);
  }

  /* condensed "My Portfolio" card: who's holding what, right now, from the
     exact same lineSt/stocks data the full Watchlist page renders from --
     ends in a button to jump to that full page for anything beyond a
     glance (adding/removing tickers, the sector breakdown, the share card). */
  function shockPortfolioCardHTML(tickers, stocks, lineSt){
    lineSt = lineSt || {};
    var shownName = lineEffectiveName(lineSt, tx(C.profileGuest));
    var avatarHTML = lineSt.pictureUrl
      ? '<img class="spz-shock-pf-avatar" src="' + esc(lineSt.pictureUrl) + '" alt="">'
      : '<div class="spz-shock-pf-avatar-fallback">' + esc((shownName || '?').charAt(0).toUpperCase()) + '</div>';
    var rowsHTML = tickers.map(function(t){
      var s = stocks ? stocks[t] : null;
      var chgCls = !s || !isNum(s.chg_pct) ? 'fl' : (s.chg_pct > 0 ? 'up' : s.chg_pct < 0 ? 'dn' : 'fl');
      return '<div class="spz-shock-pf-row" data-spz-pf-open="' + esc(t) + '">' +
        '<span class="spz-shock-pf-tk">$' + esc(t) + '</span>' +
        '<span class="spz-shock-pf-nm">' + esc(s && s.name ? String(s.name).slice(0, 28) : tx(C.unknownNote)) + '</span>' +
        (s ? '<span class="spz-shock-pf-px">' + esc(price(s.price)) + '</span>' : '') +
        '<span class="spz-shock-pf-chg ' + chgCls + '">' + (s ? esc(pct(s.chg_pct)) : '—') + '</span>' +
      '</div>';
    }).join('');
    return '<div class="spz-shock-pf-name">' + avatarHTML +
        '<div><div class="spz-shock-pf-nametxt">' + esc(shownName) + '</div>' +
        '<div class="spz-shock-pf-namesub">' + tickers.length + ' ' + esc(tx(C.pfHoldingsCountLbl)) + '</div></div>' +
      '</div>' +
      '<div class="spz-shock-pf-list">' + rowsHTML + '</div>' +
      '<button type="button" class="spz-shock-pf-viewfull" data-spzshock="viewfull">' + esc(tx(C.shockPfViewFull)) + '</button>';
  }

  /* repaints just the tab strip + disclaimer + body for whichever mode is
     active, from the last (tickers, stocks, lineSt) paintShockFab saw --
     called both on first open and on every tab click, so switching tabs
     never needs a fresh paint() pass from the page itself. */
  function renderShockPopupBody(){
    if(!shockLastArgs || !shockPopupEl) return;
    var tickers = shockLastArgs.tickers, stocks = shockLastArgs.stocks, lineSt = shockLastArgs.lineSt;

    var tabs = shockPopupEl.querySelectorAll('[data-spzshock-mode]');
    for(var t=0;t<tabs.length;t++){
      tabs[t].classList.toggle('active', tabs[t].getAttribute('data-spzshock-mode') === shockPopupMode);
    }
    var discEl = shockPopupEl.querySelector('[data-spzshock="disc"]');
    if(discEl) discEl.textContent = tx(shockPopupMode === 'portfolio' ? C.shockPfDisc : C.shockDisclaimer);

    var bodyEl = shockPopupEl.querySelector('[data-spzshock="body"]');

    if(shockPopupMode === 'portfolio'){
      bodyEl.innerHTML = shockPortfolioCardHTML(tickers, stocks, lineSt);
      var viewFullBtn = bodyEl.querySelector('[data-spzshock="viewfull"]');
      if(viewFullBtn) viewFullBtn.addEventListener('click', function(){
        shockPopupEl.classList.remove('open');
        if(shockFabEl) shockFabEl.classList.remove('on');
        location.hash = '#/watchlist';
      });
      var pfRows = bodyEl.querySelectorAll('[data-spz-pf-open]');
      for(var p=0;p<pfRows.length;p++){
        pfRows[p].addEventListener('click', function(){
          var tk = this.getAttribute('data-spz-pf-open');
          if(window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(tk);
        });
      }
      return;
    }

    bodyEl.innerHTML = shockPopupBodyHTML(tickers, stocks);
    var select = bodyEl.querySelector('[data-wl="shockSelect"]');
    shockRenderResult(bodyEl, tickers, stocks, select ? Number(select.value) : 0);
    if(select) select.addEventListener('change', function(){
      shockRenderResult(bodyEl, tickers, stocks, Number(this.value));
    });
    wireShockPicker(bodyEl);
    var openBtns = bodyEl.querySelectorAll('[data-wl-open]');
    for(var i=0;i<openBtns.length;i++){
      openBtns[i].addEventListener('click', function(){
        var tk2 = this.getAttribute('data-wl-open');
        if(window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(tk2);
      });
    }
  }

  /* shows/hides the FAB (only once a LINE-linked visitor actually has
     holdings to simulate against -- same gating shockSimulatorHTML already
     uses) and keeps the popup's own scenario picker in sync with whatever
     the visitor currently holds, so adding/removing a ticker elsewhere on
     the page updates it the next time paint() runs. */
  function paintShockFab(tickers, stocks, lineSt){
    var hasData = !!(tickers && tickers.length && window.__SPZ_SCENARIOS);
    if(!hasData){
      if(shockFabEl) shockFabEl.classList.remove('show');
      if(shockPopupEl) shockPopupEl.classList.remove('open', 'show');
      return;
    }
    ensureShockPopup();
    shockFabEl.classList.add('show');
    shockPopupEl.classList.add('show');
    shockPopupEl.querySelector('[data-spzshock="title"]').textContent = tx(C.shockPopupTitle);
    shockLastArgs = { tickers:tickers, stocks:stocks, lineSt: lineSt || (window.__SPZ_LINE ? window.__SPZ_LINE.state() : null) };
    renderShockPopupBody();
  }

  /* categorized, searchable ticker picker -- groups every known symbol by
     sector so people can browse instead of having to already know a ticker.
     Appended to document.body (like the share modal) so it survives the
     watchlist's own paint() re-renders while it's open. */
  function pickerGroupsData(stocks, filterText){
    var q = (filterText || '').trim().toUpperCase();
    var bySector = {};
    var order = [];
    Object.keys(stocks || {}).sort().forEach(function(t){
      var s = stocks[t] || {};
      if(q && t.toUpperCase().indexOf(q) === -1 && String(s.name || '').toUpperCase().indexOf(q) === -1) return;
      var key = s.sector || tx(C.paSectorOtherShort);
      if(!bySector[key]){ bySector[key] = []; order.push(key); }
      bySector[key].push({ t:t, name:s.name || '' });
    });
    order.sort(function(a, b){ return bySector[b].length - bySector[a].length || a.localeCompare(b); });
    return order.map(function(key){ return { label:key, items:bySector[key] }; });
  }

  function renderPickerGroups(stocks, heldTickers, filterText){
    var groupsEl = pickModalEl.querySelector('[data-pick="groups"]');
    var groups = pickerGroupsData(stocks, filterText);
    var heldSet = {};
    (heldTickers || []).forEach(function(t){ heldSet[t] = true; });
    if(!groups.length){
      groupsEl.innerHTML = '<div class="wl-pick-empty">' + esc(tx(C.pickNoResults)) + '</div>';
      return;
    }
    groupsEl.innerHTML = groups.map(function(g){
      return '<div class="wl-pick-group">' +
        '<div class="wl-pick-group-h"><b>' + esc(g.label) + '</b><span>' + g.items.length + '</span></div>' +
        '<div class="wl-pick-grid">' + g.items.map(function(it){
          var held = !!heldSet[it.t];
          return '<button type="button" class="wl-pick-item' + (held ? ' held' : '') + '" data-pick-add="' + esc(it.t) + '"' + (held ? ' disabled' : '') + '>' +
            '<b>' + esc(it.t) + '</b>' +
            (held ? '<small>' + esc(tx(C.pickAdded)) + '</small>' : (it.name ? '<small>' + esc(it.name) + '</small>' : '')) +
          '</button>';
        }).join('') + '</div>' +
      '</div>';
    }).join('');
  }

  function openTickerPicker(stocks, heldTickers, onAdd){
    if(!pickModalEl){
      pickModalEl = document.createElement('div');
      pickModalEl.className = 'wl-pick-modal';
      pickModalEl.innerHTML =
        '<div class="wl-pick-inner">' +
          '<div class="wl-pick-top">' +
            '<span class="wl-pick-title">' + esc(tx(C.pickTitle)) + '</span>' +
            '<button type="button" class="wl-pick-close" data-pick="close" aria-label="close">&times;</button>' +
          '</div>' +
          '<input type="text" class="wl-pick-search" data-pick="search" placeholder="' + esc(tx(C.pickSearchPh)) + '">' +
          '<div class="wl-pick-groups" data-pick="groups"></div>' +
          '<div class="wl-pick-foot"><span class="wl-pick-status" data-pick="status"></span><button type="button" class="wl-pick-done" data-pick="done">' + esc(tx(C.pickClose)) + '</button></div>' +
        '</div>';
      document.body.appendChild(pickModalEl);
      pickModalEl.querySelector('[data-pick="close"]').addEventListener('click', function(){ pickModalEl.classList.remove('open'); });
      pickModalEl.querySelector('[data-pick="done"]').addEventListener('click', function(){ pickModalEl.classList.remove('open'); });
      pickModalEl.addEventListener('click', function(e){ if(e.target === pickModalEl) pickModalEl.classList.remove('open'); });
    }
    var searchEl = pickModalEl.querySelector('[data-pick="search"]');
    searchEl.value = '';
    searchEl.oninput = function(){ renderPickerGroups(stocks, pickModalEl.__held || heldTickers, searchEl.value); };
    pickModalEl.__held = heldTickers;
    var groupsEl = pickModalEl.querySelector('[data-pick="groups"]');
    groupsEl.onclick = function(e){
      var btn = e.target.closest('[data-pick-add]');
      if(!btn || btn.disabled) return;
      var t = btn.getAttribute('data-pick-add');
      var statusEl = pickModalEl.querySelector('[data-pick="status"]');
      statusEl.textContent = '';
      btn.classList.add('adding');
      btn.querySelector('small') && (btn.querySelector('small').textContent = tx(C.pickAdding));
      onAdd(t, function(err, newTickers){
        if(err){
          btn.classList.remove('adding');
          var errMap = { invalid_ticker:C.lineAddErrInvalid, list_full:C.lineAddErrFull, network:C.lineAddErrNet, error:C.lineAddErrNet };
          statusEl.textContent = tx(errMap[err] || C.lineAddErrNet);
          renderPickerGroups(stocks, pickModalEl.__held || heldTickers, searchEl.value);
          return;
        }
        pickModalEl.__held = newTickers || heldTickers;
        renderPickerGroups(stocks, pickModalEl.__held, searchEl.value);
      });
    };
    renderPickerGroups(stocks, heldTickers, '');
    pickModalEl.classList.add('open');
    setTimeout(function(){ searchEl.focus(); }, 50);
  }

  function ensureHtml2Canvas(cb){
    if(window.html2canvas){ cb(); return; }
    if(html2canvasLoading){ html2canvasLoading.push(cb); return; }
    html2canvasLoading = [cb];
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = function(){ var cbs = html2canvasLoading; html2canvasLoading = null; cbs.forEach(function(f){ f(); }); };
    s.onerror = function(){ var cbs = html2canvasLoading; html2canvasLoading = null; cbs.forEach(function(f){ f('error'); }); };
    document.head.appendChild(s);
  }

  function shareCardHTML(tickers, stocks, lineSt){
    var sum = computePortfolioSummary(tickers, stocks);
    var riskText = sum.riskLevel === 'high' ? C.paRiskHigh : sum.riskLevel === 'medium' ? C.paRiskMed : C.paRiskLow;
    var shareName = lineEffectiveName(lineSt, tx(C.profileGuest));
    var avatarHTML = lineSt.pictureUrl
      ? '<img class="wlshare-avatar" src="' + esc(lineSt.pictureUrl) + '" crossorigin="anonymous" alt="">'
      : '<div class="wlshare-avatar wlshare-avatar-fallback">' + esc((shareName || '?').charAt(0).toUpperCase()) + '</div>';

    var barHTML = '<div class="wlshare-stackbar">' + sum.sectorRows.map(function(row){
      return '<span style="width:' + row.pct + '%;background:' + row.color + ';"></span>';
    }).join('') + '</div>';
    var legendHTML = sum.sectorRows.slice(0, 6).map(function(row){
      return '<span class="wlshare-legend-item"><i style="background:' + row.color + ';"></i>' + esc(row.label) + ' ' + row.pct + '%</span>';
    }).join('');

    var chipsHTML = tickers.slice(0, 14).map(function(t){ return '<span class="wlshare-chip">$' + esc(t) + '</span>'; }).join('') +
      (tickers.length > 14 ? '<span class="wlshare-chip more">+' + (tickers.length - 14) + '</span>' : '');

    var dateStr = new Date().toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'numeric' });

    return '<div class="wlshare-card" id="wlshareCard">' +
      starsHTML('wlshare-stars', 15) +
      '<div class="wlshare-glow"></div>' +
      '<div class="wlshare-glow-2"></div>' +
      '<div class="wlshare-top">' +
        '<div class="wlshare-eyebrow"><span class="wlshare-live-dot"></span>' + esc(tx(C.shareEyebrow)) + '</div>' +
        '<span class="wlshare-date">' + esc(dateStr) + '</span>' +
      '</div>' +
      '<div class="wlshare-logo"><div class="wlshare-logo-rule"></div>' + (window.__spzMark ? window.__spzMark('wlshare-mark', { stroke:true, w:3 }) : '') + '<span>SPACEZ TERMINAL</span></div>' +
      '<div class="wlshare-person">' +
        avatarHTML +
        '<div>' +
          '<div class="wlshare-name">' + esc(shareName || tx(C.profileGuest)) + '</div>' +
          '<div class="wlshare-tag">' + esc(tx(C.shareTag)) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wlshare-stats">' +
        '<div class="wlshare-stat"><b>' + sum.total + '</b><span>' + esc(tx(C.profileHoldings)) + '</span></div>' +
        (sum.known ? '<div class="wlshare-stat"><b class="risk-' + sum.riskLevel + '">' + esc(tx(riskText)) + '</b><span>' + esc(tx(C.paMeterLabel)) + '</span></div>' : '') +
      '</div>' +
      (sum.known ? '<div class="wlshare-meter-track"><div class="wlshare-meter-fill ' + sum.riskLevel + '" style="width:' + sum.riskScore + '%;"></div></div>' : '') +
      '<div class="wlshare-block">' +
        '<div class="wlshare-label">' + esc(tx(C.paSectorLabel)) + '</div>' +
        barHTML +
        '<div class="wlshare-legend">' + legendHTML + '</div>' +
      '</div>' +
      '<div class="wlshare-block">' +
        '<div class="wlshare-label">' + esc(tx(C.shareHoldingsLabel)) + '</div>' +
        '<div class="wlshare-chips">' + chipsHTML + '</div>' +
      '</div>' +
      '<div class="wlshare-foot-row">' +
        '<div class="wlshare-foot">' + esc(tx(C.shareFooter)) + '</div>' +
        '<div class="wlshare-qr">' +
          '<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=' + encodeURIComponent('https://spacez001.github.io/TERMINAL/') + '" alt="QR" crossorigin="anonymous">' +
          '<span>' + esc(tx(C.shareQrCap)) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function openShareCard(tickers, stocks, lineSt){
    if(!tickers.length) return;
    if(!shareModalEl){
      shareModalEl = document.createElement('div');
      shareModalEl.className = 'wlshare-modal';
      shareModalEl.innerHTML =
        '<div class="wlshare-modal-inner">' +
          '<button type="button" class="wlshare-close" data-wlshare="close" aria-label="close">&times;</button>' +
          '<div class="wlshare-scroll" data-wlshare="scroll"></div>' +
          '<div class="wlshare-actions">' +
            '<button type="button" class="wlshare-action-btn primary" data-wlshare="download">' + esc(tx(C.shareDownload)) + '</button>' +
            '<button type="button" class="wlshare-action-btn" data-wlshare="print">' + esc(tx(C.sharePrint)) + '</button>' +
          '</div>' +
          '<div class="wlshare-status" data-wlshare="status"></div>' +
        '</div>';
      document.body.appendChild(shareModalEl);
      shareModalEl.querySelector('[data-wlshare="close"]').addEventListener('click', function(){
        shareModalEl.classList.remove('open');
      });
      shareModalEl.addEventListener('click', function(e){ if(e.target === shareModalEl) shareModalEl.classList.remove('open'); });
    }
    var scrollEl = shareModalEl.querySelector('[data-wlshare="scroll"]');
    scrollEl.innerHTML = shareCardHTML(tickers, stocks, lineSt);
    shareModalEl.classList.add('open');
    var statusEl = shareModalEl.querySelector('[data-wlshare="status"]');
    statusEl.textContent = '';
    statusEl.classList.remove('err');

    var downloadBtn = shareModalEl.querySelector('[data-wlshare="download"]');
    downloadBtn.onclick = function(){
      statusEl.textContent = tx(C.shareRendering);
      statusEl.classList.remove('err');
      ensureHtml2Canvas(function(err){
        if(err || !window.html2canvas){ statusEl.textContent = tx(C.shareRenderErr); statusEl.classList.add('err'); return; }
        var cardEl = document.getElementById('wlshareCard');
        // Round K4: rounded corners + a transparent capture used to leave a
        // white fringe/line along the curve once the PNG got re-shared
        // somewhere that flattens to JPEG (no alpha channel to blend
        // against). Fix is two parts: square the outer corners just for
        // the capture (".exporting", see its CSS), and bake in the card's
        // own dark background instead of leaving it transparent -- so even
        // if some future edit re-rounds a corner, there's no alpha left
        // for a downstream flatten to fringe. The class comes off again
        // right after the capture whether it succeeds or fails, so the
        // on-screen card always goes back to its normal rounded look.
        cardEl.classList.add('exporting');
        window.html2canvas(cardEl, { backgroundColor:'#050810', scale:2, useCORS:true }).then(function(canvas){
          cardEl.classList.remove('exporting');
          statusEl.textContent = '';
          var link = document.createElement('a');
          link.download = 'spacez-portfolio.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }).catch(function(){
          cardEl.classList.remove('exporting');
          statusEl.textContent = tx(C.shareRenderErr); statusEl.classList.add('err');
        });
      });
    };

    var printBtn = shareModalEl.querySelector('[data-wlshare="print"]');
    printBtn.onclick = function(){
      document.body.classList.add('spz-printing-wlshare');
      window.print();
      setTimeout(function(){ document.body.classList.remove('spz-printing-wlshare'); }, 500);
    };
  }

  /* ---- the two-channel "Connect" strip shown at the top of the page in
     every state: Telegram (full add/remove-by-chat control, existing
     per-visitor uid -> chat_id -> watchlist.json lookup) and LINE (QR scan
     via the Cloudflare Worker, view-only for now). Both render side by
     side so connecting either one happens from right here, instead of a
     separate floating button elsewhere on the site. --------------------- */
  function profilePanelHTML(lineSt){
    if(lineSt.status !== 'linked') return '';
    return '<div class="wl-conn-profile-panel hidden" data-wl="profilePanel">' +
      '<div class="wl-conn-profile-uid">' + esc(tx(C.lineProfileUidLabel)) + ': <b>' + esc(lineSt.uid || '—') + '</b></div>' +
      '<input type="text" class="wl-conn-profile-input" data-wl="profileFb" placeholder="' + esc(tx(C.lineProfileFbPh)) + '" value="' + esc(lineSt.facebook || '') + '" maxlength="80">' +
      '<input type="text" class="wl-conn-profile-input" data-wl="profileIg" placeholder="' + esc(tx(C.lineProfileIgPh)) + '" value="' + esc(lineSt.instagram || '') + '" maxlength="80">' +
      '<div class="wl-conn-profile-row">' +
        '<button type="button" class="wl-conn-profile-save" data-wl="profileSave">' + esc(tx(C.lineProfileSaveBtn)) + '</button>' +
        '<span class="wl-conn-profile-status" data-wl="profileStatus"></span>' +
      '</div>' +
    '</div>';
  }

  function connStripHTML(uid, chatId, hadUid, lineSt){
    /* Round S: when the corner-gate identity actively driving this page IS
       the newer Telegram QR login (not the old chat-command bot), showing
       this old bot's own "connect Telegram" card here would say the exact
       opposite of the "Connected" card right next to it -- the redundant,
       confusing prompt this round exists to remove. Omit that card entirely
       in that one case; every other combination (old-bot-only, LINE-linked,
       nothing linked) renders exactly as before. */
    var tgViaNewLogin = lineSt.status === 'linked' && lineSt.provider === 'telegram';

    var tgCardHTML = '';
    if(!tgViaNewLogin){
      var tgBlock;
      if(chatId){
        tgBlock = '<div class="wl-conn-status ok">' + esc(tx(C.connectedNote)) + '</div>' +
          '<button type="button" class="wl-conn-forget" data-wl="forgetTg">' + esc(tx(C.forgetBtn)) + '</button>';
      } else {
        var uid2 = uid || getUid(true);
        var dl = linkDeepLink(uid2);
        tgBlock = '<div class="wl-conn-status">' + esc(tx(hadUid ? C.connectPendingH : C.lineNotConn)) + '</div>' +
          '<a class="wl-conn-btn" href="' + dl + '" target="_blank" rel="noopener noreferrer">' + esc(tx(C.connectBtn)) + '</a>';
      }
      tgCardHTML = '<div class="wl-conn-card"><div class="wl-conn-top"><span class="wl-conn-label tg">' + esc(tx(C.tgLabel)) + '</span></div>' + tgBlock + '</div>';
    }

    /* the card itself only ever shows a short status line -- the QR (when
       there is one to show) lives in the big centered #wlLineModal popup,
       not squeezed in here. */
    var lineBlock;
    if(lineSt.status === 'linked'){
      var avatarThumb = lineSt.pictureUrl ? '<img src="' + esc(lineSt.pictureUrl) + '" alt="" class="wl-conn-avatar">' : '';
      var connName = lineEffectiveName(lineSt, '');
      lineBlock = '<div class="wl-conn-status ok">' + avatarThumb + esc(tx(C.lineConnectedNote)) +
        (connName ? ' · ' + esc(connName) : '') + '</div>' +
        '<div class="wl-conn-btnrow">' +
          '<button type="button" class="wl-conn-forget" data-wl="forgetLine">' + esc(tx(C.lineForget)) + '</button>' +
          '<button type="button" class="wl-conn-editbtn" data-wl="editProfile">' + esc(tx(C.lineEditProfileBtn)) + '</button>' +
        '</div>' +
        profilePanelHTML(lineSt);
    } else if(lineSt.status === 'pending'){
      lineBlock = '<div class="wl-conn-status">' + esc(tx(C.lineWaiting)) + '</div>' +
        '<button type="button" class="wl-conn-btn line-btn" data-wl="lineConnect">' + esc(tx(C.connectLineBtn)) + '</button>';
    } else if(lineSt.status === 'processing'){
      lineBlock = '<div class="wl-conn-status ok">' + esc(tx(C.lineProcessing)) + '</div>';
    } else if(lineSt.status === 'error' || lineSt.status === 'expired' || lineSt.status === 'quota'){
      var stripErrMsg = lineSt.status === 'expired' ? C.lineExpired : (lineSt.status === 'quota' ? C.lineQuotaErr : C.lineErr);
      lineBlock = '<div class="wl-conn-status" style="color:#ff6b6b;">' + esc(tx(stripErrMsg)) + '</div>' +
        // see paintLineModal()'s matching branch -- no retry button while
        // the daily quota is the cause, since tapping it would just fail again
        (lineSt.status === 'quota' ? '' :
          '<button type="button" class="wl-conn-btn line-btn" data-wl="lineConnect">' + esc(tx(C.connectLineBtn)) + '</button>');
    } else {
      lineBlock = '<div class="wl-conn-status">' + esc(tx(C.lineNotConn)) + '</div>' +
        '<button type="button" class="wl-conn-btn line-btn" data-wl="lineConnect">' + esc(tx(C.connectLineBtn)) + '</button>';
    }

    var lineCardLabel = tgViaNewLogin ? tx(C.tgLabel) : tx(C.lineLabel);
    var lineCardCls = tgViaNewLogin ? 'tg' : 'line';

    return '<div class="wl-conn-strip">' +
      tgCardHTML +
      '<div class="wl-conn-card"><div class="wl-conn-top"><span class="wl-conn-label ' + lineCardCls + '">' + esc(lineCardLabel) + '</span></div>' + lineBlock + '</div>' +
    '</div>';
  }

  function wireConnStrip(body, identity){
    identity = identity || state.line;
    var forgetTg = body.querySelector('[data-wl="forgetTg"]');
    if(forgetTg){
      forgetTg.addEventListener('click', function(){
        forgetUid();
        state.uid = null;
        state.chatId = null;
        state.wl = {};
        paint();
      });
    }
    var forgetLine = body.querySelector('[data-wl="forgetLine"]');
    if(forgetLine){
      forgetLine.addEventListener('click', function(){
        // Round S: this card can now be showing a Telegram-linked identity --
        // "forget" needs to sign out of whichever provider actually owns it,
        // or it would clear an already-empty LINE session and leave the real
        // (Telegram) one still linked.
        if(identity.provider === 'telegram' && window.__SPZ_TG) window.__SPZ_TG.logout();
        else lineLogout();
      });
    }
    var lineConnectBtn = body.querySelector('[data-wl="lineConnect"]');
    if(lineConnectBtn){
      lineConnectBtn.addEventListener('click', openLineModal);
    }
    var editBtn = body.querySelector('[data-wl="editProfile"]');
    if(editBtn){
      editBtn.addEventListener('click', function(){
        var panel = body.querySelector('[data-wl="profilePanel"]');
        if(panel) panel.classList.toggle('hidden');
      });
    }
    var profileSave = body.querySelector('[data-wl="profileSave"]');
    if(profileSave){
      profileSave.addEventListener('click', function(){
        var fbInput = body.querySelector('[data-wl="profileFb"]');
        var igInput = body.querySelector('[data-wl="profileIg"]');
        var statusEl = body.querySelector('[data-wl="profileStatus"]');
        var fb = fbInput ? fbInput.value.trim() : '';
        var ig = igInput ? igInput.value.trim() : '';
        if(statusEl){ statusEl.className = 'wl-conn-profile-status'; statusEl.textContent = '…'; }
        lineUpdateProfile(fb, ig, function(err){
          if(!statusEl) return;
          if(err){ statusEl.classList.add('err'); statusEl.textContent = tx(C.lineProfileSaveErr); return; }
          statusEl.classList.add('ok'); statusEl.textContent = tx(C.lineProfileSaved);
        }, identity);
      });
    }
  }

  function paint(){
    if(!sec) return;
    var body = sec.querySelector('[data-wl="body"]');
    if(!body) return;
    sec.querySelector('[data-wl="eb"]').textContent = tx(C.eyebrow);
    sec.querySelector('[data-wl="h"]').textContent = tx(C.h);
    sec.querySelector('[data-wl="lede"]').textContent = tx(C.lede);

    var stocks = stocksSnapshot();
    var tickers = state.wl ? Object.keys(state.wl).sort() : [];
    var exT = state.exampleTicker || 'PTT';

    var uid = state.uid !== undefined ? state.uid : getUid(false);
    var chatId = state.chatId;
    var hadUid = !!uid;
    var lineSt = resolveActiveIdentity();
    var strip = connStripHTML(uid, chatId, hadUid, lineSt);

    if(!chatId && lineSt.status !== 'linked'){
      body.innerHTML = strip +
        '<div class="wl-empty" style="margin-top:6px;">' +
          '<b>' + esc(tx(C.notConnH)) + '</b><br>' +
          esc(tx(C.notConnB)) + '<br><br>' +
          esc(tx(C.connectLede)) +
        '</div>';
      wireConnStrip(body, lineSt);
      paintShockFab(null, stocks, lineSt);
      return;
    }

    if(!chatId && lineSt.status === 'linked'){
      var lineTickers = lineSt.tickers || [];
      var lineGrid = lineTickers.length
        ? '<div class="wl-grid">' + lineTickers.map(function(t){ return lineCardHTML(t, stocks ? stocks[t] : null); }).join('') + '</div>'
        : '<div class="wl-empty"><b>' + esc(tx(C.emptyH)) + '</b><br>' + esc(tx(C.emptyB)) + '</div>';
      /* LINE-linked users now manage their own list right here -- a real
         add/remove round-trip to the Worker's per-account bucket, no
         Telegram command needed (Telegram is still its own separate list,
         see lineOwnListNote below). */
      var lineAddBox =
        '<div class="wl-add wl-add-line">' +
          '<div class="wl-add-line-h">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>' +
            '<span>' + esc(tx(C.lineAddH)) + '</span>' +
          '</div>' +
          '<div class="wl-add-line-row">' +
            '<input type="text" list="wlTickers" data-wl="lineInput" placeholder="' + esc(tx(C.lineAddPh)) + '">' +
            '<button type="button" class="wl-addbtn" data-wl="lineAddBtn">' + esc(tx(C.lineAddBtn)) + '</button>' +
            '<span class="wl-add-line-or">' + esc(L() === 'th' ? 'หรือ' : 'or') + '</span>' +
            '<button type="button" class="wl-browse-btn" data-wl="openPicker">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>' +
              '<span>' + esc(tx(C.lineBrowseBtn)) + '</span>' +
            '</button>' +
          '</div>' +
          '<span class="wl-line-status" data-wl="lineAddStatus"></span>' +
          '<datalist id="wlTickers">' + (stocks ? Object.keys(stocks).sort().map(function(k){
            return '<option value="' + esc(k) + '">';
          }).join('') : '') + '</datalist>' +
        '</div>';
      body.innerHTML = profileHeaderHTML(lineTickers, stocks, lineSt) + strip +
        '<div class="wl-addnote" style="margin:14px 0;">' + esc(tx(C.lineOwnListNote)) + '</div>' +
        lineAddBox +
        portfolioAnalysisHTML(lineTickers, stocks) +
        sectorGraphsHTML(lineTickers, stocks) +
        shockSimulatorHTML(lineTickers, stocks) +
        lineGrid;
      wireConnStrip(body, lineSt);
      var openBtnsLine = body.querySelectorAll('[data-wl-open]');
      for(var iL=0;iL<openBtnsLine.length;iL++){
        openBtnsLine[iL].addEventListener('click', function(){
          var t = this.getAttribute('data-wl-open');
          if(window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(t);
        });
      }

      var shockRoot = body.querySelector('[data-wl-shock-root]');
      if(shockRoot){
        var shockSelect = shockRoot.querySelector('[data-wl="shockSelect"]');
        shockRenderResult(shockRoot, lineTickers, stocks, shockSelect ? Number(shockSelect.value) : 0);
        if(shockSelect) shockSelect.addEventListener('change', function(){
          shockRenderResult(shockRoot, lineTickers, stocks, Number(this.value));
        });
        wireShockPicker(shockRoot);

        /* closed by default (see the CSS comment above .wl-shock-toggle) --
           an explicit tap is required before any hypothetical scenario
           numbers become visible at all, so a quick glance down the page
           can't mistake this for the real portfolio analysis above it. */
        var shockToggle = shockRoot.querySelector('[data-wl="shockToggle"]');
        var shockCollapse = shockRoot.querySelector('[data-wl="shockCollapse"]');
        var shockToggleHint = shockRoot.querySelector('[data-wl="shockToggleHint"]');
        if(shockToggle && shockCollapse){
          shockToggle.addEventListener('click', function(){
            var willOpen = !shockCollapse.classList.contains('open');
            shockCollapse.classList.toggle('open', willOpen);
            shockToggle.classList.toggle('open', willOpen);
            shockToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            if(shockToggleHint) shockToggleHint.textContent = tx(willOpen ? C.shockToggleClose : C.shockToggleOpen);
          });
        }
      }

      paintShockFab(lineTickers, stocks, lineSt);

      var openShareBtn = body.querySelector('[data-wl="openShare"]');
      if(openShareBtn) openShareBtn.addEventListener('click', function(){
        openShareCard(lineTickers, stocks, lineSt);
      });

      var lineErrMap = { invalid_ticker:C.lineAddErrInvalid, list_full:C.lineAddErrFull, network:C.lineAddErrNet, error:C.lineAddErrNet };
      var lineInput = body.querySelector('[data-wl="lineInput"]');
      var lineAddBtn = body.querySelector('[data-wl="lineAddBtn"]');
      var lineAddStatus = body.querySelector('[data-wl="lineAddStatus"]');
      function doLineAdd(){
        var t = (lineInput.value || '').trim();
        if(!t || lineAddBtn.disabled) return;
        lineAddBtn.disabled = true;
        lineAddStatus.textContent = '';
        lineAddStatus.classList.remove('err');
        lineAddTicker(t, function(err){
          lineAddBtn.disabled = false;
          if(err){
            lineAddStatus.textContent = tx(lineErrMap[err] || C.lineAddErrNet);
            lineAddStatus.classList.add('err');
          } else {
            lineInput.value = '';
          }
        }, lineSt);
      }
      if(lineAddBtn) lineAddBtn.addEventListener('click', doLineAdd);
      if(lineInput) lineInput.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); doLineAdd(); } });

      var openPickerBtn = body.querySelector('[data-wl="openPicker"]');
      if(openPickerBtn) openPickerBtn.addEventListener('click', function(){
        openTickerPicker(stocks, lineTickers, function(ticker, cb){ lineAddTicker(ticker, cb, lineSt); });
      });

      var lineRmBtns = body.querySelectorAll('[data-wl-line-rm]');
      for(var lr=0; lr<lineRmBtns.length; lr++){
        (function(btn){
          btn.addEventListener('click', function(){
            if(btn.disabled) return;
            btn.disabled = true;
            lineRemoveTicker(btn.getAttribute('data-wl-line-rm'), function(){ /* paint() already refreshed the grid */ }, lineSt);
          });
        })(lineRmBtns[lr]);
      }
      return;
    }

    var addBox =
      '<div class="wl-add">' +
        '<input type="text" list="wlTickers" data-wl="input" placeholder="' + esc(tx(C.addPh)) + '" value="' + esc(state.exampleTicker || '') + '">' +
        '<a class="wl-addbtn" data-wl="addbtn" href="' + (state.exampleTicker ? deepLink('add', state.exampleTicker) : plainTgLink()) + '" target="_blank" rel="noopener noreferrer">' + esc(tx(C.addBtn)) + '</a>' +
        '<button type="button" class="wl-copybtn" data-wl="addcopy">' + esc(tx(C.copy)) + '</button>' +
        '<span class="wl-addnote">' + esc(tx(C.addNote)) + '</span>' +
        '<datalist id="wlTickers">' + (stocks ? Object.keys(stocks).sort().map(function(k){
          return '<option value="' + esc(k) + '">';
        }).join('') : '') + '</datalist>' +
      '</div>';

    var grid;
    if(!tickers.length){
      grid = '<div class="wl-empty"><b>' + esc(tx(C.emptyH)) + '</b><br>' + esc(tx(C.emptyB)) + '</div>';
    } else {
      grid = '<div class="wl-grid">' + tickers.map(function(t){
        return cardHTML(t, stocks ? stocks[t] : null, stocks);
      }).join('') + '</div>';
    }
    var portfolioAnalysis = portfolioAnalysisHTML(tickers, stocks);

    var howto = '<div class="wl-howto">' +
      '<div class="wl-howto-h">' + esc(tx(C.howtoH)) + '</div>' +
      '<p class="wl-howto-lede">' + esc(tx(C.howtoLede)) + '</p>' +
      '<div class="wl-howto-rows">' +
        howtoRowHTML('add', tx(C.lbAdd), cmdText('add', exT)) +
        howtoRowHTML('remove', tx(C.lbRemove), cmdText('remove', exT)) +
        howtoRowHTML('edit', tx(C.lbEdit), cmdText('edit', exT)) +
        howtoRowHTML('list', tx(C.lbList), cmdText('list', exT)) +
        howtoRowHTML('help', tx(C.lbHelp), cmdText('help', exT)) +
      '</div>' +
      '<a class="wl-opentg" href="' + plainTgLink() + '" target="_blank" rel="noopener noreferrer">' + esc(tx(C.opentg)) + ' →</a>' +
    '</div>';

    body.innerHTML = strip + addBox + portfolioAnalysis + grid + howto;
    wireConnStrip(body, lineSt);
    paintShockFab(null, stocks, lineSt);

    var openBtns = body.querySelectorAll('[data-wl-open]');
    for(var i=0;i<openBtns.length;i++){
      openBtns[i].addEventListener('click', function(){
        var t = this.getAttribute('data-wl-open');
        if(window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(t);
      });
    }

    var rmCopyBtns = body.querySelectorAll('[data-wl-copy-rm]');
    for(var r=0;r<rmCopyBtns.length;r++){
      (function(btn){
        btn.addEventListener('click', function(){
          copyText(cmdText('remove', btn.getAttribute('data-wl-copy-rm')), btn);
        });
      })(rmCopyBtns[r]);
    }

    var addAnchor = body.querySelector('[data-wl="addbtn"]');
    var addCopyBtn = body.querySelector('[data-wl="addcopy"]');
    var input = body.querySelector('[data-wl="input"]');

    function refresh(){
      var t = (input.value || '').trim().toUpperCase();
      state.exampleTicker = t;
      if(addAnchor) addAnchor.href = t ? deepLink('add', t) : plainTgLink();
      var exampleT = t || 'PTT';
      ['add','remove','edit','list','help'].forEach(function(k){
        var el = body.querySelector('[data-wl-ex="' + k + '"]');
        if(el) el.textContent = cmdText(k, exampleT);
      });
    }

    if(input && addAnchor){
      input.addEventListener('input', refresh);
      input.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); addAnchor.click(); }
      });
    }
    if(addCopyBtn){
      addCopyBtn.addEventListener('click', function(){
        var t = (input && input.value || '').trim().toUpperCase() || 'PTT';
        copyText(cmdText('add', t), addCopyBtn);
      });
    }

    var howtoCopyBtns = body.querySelectorAll('[data-wl-copy]');
    for(var j=0;j<howtoCopyBtns.length;j++){
      (function(btn){
        btn.addEventListener('click', function(){
          var key = btn.getAttribute('data-wl-copy');
          var codeEl = body.querySelector('[data-wl-ex="' + key + '"]');
          copyText(codeEl ? codeEl.textContent : '', btn);
        });
      })(howtoCopyBtns[j]);
    }
  }

  function build(){
    if (document.getElementById('watchlist')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'watchlist';
    sec.setAttribute('data-route', 'watchlist');
    sec.innerHTML =
      '<div class="wl-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-wl="eb"></span></div>' +
          '<h2 data-wl="h"></h2>' +
          '<p class="lede" data-wl="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-wl="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'watchlist', after:'stock',
      t:{en:'My Watchlist',th:'วอทช์ลิสต์ของฉัน'},
      d:{en:'The stocks you chose to follow, each with its own risk flags, a sector comparison, and a daily Telegram check-in.',
         th:'หุ้นที่คุณเลือกติดตาม พร้อมสัญญาณเสี่ยงของตัวเอง เทียบกับกลุ่มอุตสาหกรรม และเช็คอินทาง Telegram ทุกวัน'}
    });

    sec.__render = paint;
    loadWatchlist(paint);
    setInterval(function(){ loadWatchlist(paint); }, 60000);
    document.addEventListener('spz:snapshot', function(){ paint(); });
    /* the topbar/nav "Signed in with LINE" card edits the display name via
       window.__SPZ_LINE.updateIdentity() -- that call updates the SAME
       state.line object this module already reads (single source of truth),
       but deliberately skips the broad 'spz:line' rebroadcast (see the
       comment on lineUpdateIdentity) so it doesn't blow away that other
       card's own "Saved." confirmation mid-edit. It dispatches this
       narrower 'spz:identity' event instead, purely so read-only surfaces
       like this page's profile header/connect strip/share card repaint
       with the new name. */
    document.addEventListener('spz:identity', function(){ paint(); });
    new MutationObserver(function(){ try { sec.__render(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    if(lineWorkerReady()){
      var savedLine = lineLoadSession();
      if(savedLine && savedLine.code) lineRestoreFromWorker(savedLine);
    }

    // Round S: pick up a Telegram QR login already restored by part-61.js
    // (or one that completes later, corner-gate side, while this page is
    // open) -- see syncTgState()/resolveActiveIdentity() above.
    syncTgState();
    document.addEventListener('spz:tg', syncTgState);

    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 350);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.__SPZ_WATCHLIST = { paint: function(){ paint(); }, reload: function(){ loadWatchlist(paint); },
    /* read-only: this browser's own already-loaded list (ticker -> alert
       threshold), plus whether it is linked to a Telegram account at all,
       plus the LINE-linked ticker list if that's connected instead -- for
       the Command Center's watchlist card. No new fetch, no other user's
       data: same state this page's own cards already render. */
    state: function(){
      return { wl: state.wl || null, chatId: state.chatId || null,
        line: { status: (state.line && state.line.status) || 'idle',
                tickers: (state.line && state.line.tickers) || [] } };
    } };

  /* ---- shared with other modules (right now: the corner admin/member
     login trigger's "Login via LINE" tab) so there is exactly ONE LINE
     session, ONE QR popup, and ONE place that talks to the Worker --
     connecting from the corner trigger and connecting from this page are
     the same login, not two separate ones. ---------------------------- */
  window.__SPZ_LINE = {
    open: function(){ openLineModal(); },
    // Same read-only pattern as window.__SPZ_TG.code() (part-61.js) -- the
    // session code, not the underlying LINE userId, which never leaves the
    // Worker. Used by the site-wide presence beacon (part-59.js) so the
    // admin-only Connected Users page can show who's online right now.
    code: function(){ return state.line.status === 'linked' ? state.line.code : null; },
    state: function(){
      return { status: state.line.status, displayName: state.line.displayName || null,
        pictureUrl: state.line.pictureUrl || null, tickers: (state.line.tickers || []).slice(),
        uid: state.line.uid || null, facebook: state.line.facebook || '', instagram: state.line.instagram || '',
        nameOverride: state.line.nameOverride || '', note: state.line.note || '',
        rights: state.line.rights || null, accessUntil: state.line.accessUntil || null,
        likedCount: typeof state.line.likedCount === 'number' ? state.line.likedCount : 0 };
    },
    logout: function(){ lineLogout(); },
    like: function(postId, cb){ lineLikeToggle(postId, cb); },
    likesGet: function(postId, cb){ lineLikesGet(postId, cb); },
    /* Home page's personal card: override the displayed name and/or set the
       free-text "about me" note. Independent of updateProfile's facebook/
       instagram fields (used only by this page's own connect strip). */
    updateIdentity: function(nameOverride, note, cb){ lineUpdateIdentity(nameOverride, note, cb); },
    /* Read-only exposure for the admin-only Connected Users page, which wants
       the exact same "portfolio analysis" breakdown (sector mix + risk read)
       used on this page's own board -- rather than re-deriving that logic a
       second time, it calls straight into it with any user's ticker list.
       Never mutates state.line -- these two are pure functions of whatever
       tickers/stocks are handed in. */
    portfolioAnalysisHTML: function(tickers, stocks){ return portfolioAnalysisHTML(tickers || [], stocks || stocksSnapshot() || {}); },
    stocksSnapshot: function(){ return stocksSnapshot() || {}; }
  };
})();
