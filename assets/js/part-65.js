/* ===========================================================================
   Round W (#231): "Elliott Wave Classroom" -- a new teaching page explaining
   Elliott Wave theory at a beginner level.

   Round X (#235/#236): added wave subdivision + the four corrective pattern
   types, and the Fibonacci wave-5 projection technique.

   Round Y (#243): full redesign -- rebuilt around a hierarchical,
   infographic-led master-detail layout instead of one long scroll. A small
   clickable "map" diagram at the top of Overview cascades Motive vs.
   Corrective down to every named shape (Impulse / Diagonal -- Leading /
   Diagonal -- Ending under Motive; Zigzag / Flat / Triangle / Combination
   under Corrective), and the same choices live permanently in a left-hand
   index -- same visual shell (.gl-shell/.gl-nav/.gl-detail, part-01.css)
   the Glossary page already uses, so this reads as the same kind of page as
   its "learn" nav neighbors, not a new UI pattern. Every leaf gets its own
   small hand-labeled SVG, including the two diagonal variants (contracting
   vs. expanding) and all four corrective shapes -- nothing is still
   text-only. All of the original content survives, just reorganized under
   16 nodes instead of one scroll: Overview, Motive (+3 children), Corrective
   (+4 children), Wave Degree, Fibonacci Tools (+2 children), Common
   Mistakes, Further Reading.

   IMPORTANT / legal: Elliott Wave International is a real, separate
   commercial education company. This page cites it once, in its own boxed
   "further reading" section, worded as a citation -- never as a partner,
   sponsor, source of this page's content, or endorser of this site -- and
   the box says so explicitly. The theory itself (developed by Ralph Nelson
   Elliott in the 1930s) is a public analytical framework, not EWI's
   intellectual property, so describing and illustrating it here is not a
   trademark or affiliation issue on its own; the citation box exists so a
   reader who wants to go deeper has a named, real starting point, phrased
   so nobody could read it as "built with" or "in partnership with" EWI.

   Round AB: the lesson content itself (every xxxBody() function, every
   diagram/SVG generator, and the UI dict's body/caption text) used to ship
   straight to every visitor inside THIS file -- a static JS bundle, same
   for every tier. The __SPZ_TIER() check below only ever controlled
   show/hide in the browser, so even after closing the sessionStorage-forgery
   bug (Round AA), the content itself was still fully readable via devtools'
   Sources/Network tab regardless of tier, simply because it had already
   been downloaded. That is fixed here by moving all of it server-side: the
   content is no longer present in this file at all. It is fetched on demand
   from the Worker's /api/classroom/content, which is gated by the same
   X-Admin-Key the Connected Users and Announcements admin pages already use
   (see line-qr-worker.js) -- a credential the Worker itself verifies and the
   browser never holds a copy of, unlike the old client-side tier flag. Only
   the page chrome, the nav labels (NODE_TITLE) and the nav tree shape
   (TREE) remain client-side, since neither reveals any lesson content on
   its own. */
(function(){
  'use strict';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // Round AB: matches Connected Users / Announcements exactly -- same
  // Worker, same sessionStorage key, so an admin key entered on either of
  // those pages already unlocks this one too, with nothing extra to type.
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';

  function getAdminKey(){
    try {
      var k = sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
      /* Round AD: an Editor reads the same content with their own code --
         the Worker accepts it for this read-only endpoint only. */
      if(!k && window.__SPZ_TIER && window.__SPZ_TIER() === 'editor') k = sessionStorage.getItem('spz_editor_code') || '';
      return k;
    } catch(e){ return ''; }
  }
  function canRead(){
    var t = window.__SPZ_TIER ? window.__SPZ_TIER() : 'basic';
    return t === 'full' || t === 'editor';
  }
  /* Round AD: everyone can open the classroom now, but until it is ready
     only Admin / Editor see real lessons. Everyone else gets the real index
     plus deliberately scrambled text and a blurred placeholder chart, under
     a clear "in development" notice -- no lesson content is ever sent to
     them (it still lives only on the Worker). */
  var GLYPHS = 'ꙮᚠᚢᚦᛃᛉᛗΞΨΩλψϟϠабвгджзлфцщ๏๛ฯๆฺ꧁꧂ꕥꕤ⟁⟟⟒⏃⌰⍀⋔⏁⎍⟟⍜⊑';
  function garble(seed, n){
    var x = 0, out = [], i, w, k;
    for(i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
    function r(){ x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }
    for(w = 0; w < n; w++){
      var len = 2 + Math.floor(r() * 7), word = '';
      for(k = 0; k < len; k++) word += GLYPHS.charAt(Math.floor(r() * GLYPHS.length));
      out.push(word);
    }
    return out.join(' ');
  }
  function lockedPreviewHTML(){
    var id = currentId || 'overview';
    return '<div class="ewv-dev-note">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>' +
        '<div><b>' + esc(T(UI.devT)) + '</b><span>' + esc(T(UI.devS)) + '</span></div>' +
      '</div>' +
      '<div class="ewv-garble">' +
        '<p>' + esc(garble(id + 'a', 46)) + '</p>' +
        '<div class="ewv-garble-chart"><svg viewBox="0 0 400 150" preserveAspectRatio="none"><polyline fill="none" stroke="currentColor" stroke-width="3" points="0,120 60,60 95,85 170,20 210,70 260,50 300,110 340,80 400,130"/></svg><span>' + esc(T(UI.devLock)) + '</span></div>' +
        '<p>' + esc(garble(id + 'b', 38)) + '</p>' +
        '<p>' + esc(garble(id + 'c', 30)) + '</p>' +
      '</div>';
  }
  function setAdminKey(k){
    try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){}
  }
  function clearAdminKey(){
    try { sessionStorage.removeItem(ADMIN_KEY_STORAGE); } catch(e){}
  }

  var UI = {
    eb: { en:'Classroom', th:'ห้องเรียน' },
    h:  { en:'Elliott Wave Classroom', th:'ห้องเรียน Elliott Wave' },
    lede: { en:'A beginner-level map of how Elliott Wave analysts read a price chart. Pick a branch below, or use the index on the left. Educational only: this describes a way of reading a chart, not a prediction of what any chart will do next.',
            th:'แผนที่ระดับเริ่มต้นของวิธีที่นักวิเคราะห์ Elliott Wave อ่านกราฟราคา เลือกกิ่งด้านล่าง หรือใช้เมนูด้านซ้ายก็ได้ เป็นสื่อการเรียนรู้เท่านั้น นี่คือวิธีอ่านกราฟแบบหนึ่ง ไม่ใช่การพยากรณ์ว่ากราฟตัวไหนจะไปทางไหนต่อ' },

    adminOnly: { en:'Admins only.', th:'เฉพาะแอดมินเท่านั้น' },
    devT: { en:'This classroom is still being built', th:'ห้องเรียนนี้อยู่ในช่วงพัฒนา' },
    devS: { en:'The text below is scrambled on purpose until the lessons open. Admins and Editors can read the real content.',
            th:'ข้อความด้านล่างถูกสลับให้อ่านไม่ออกโดยตั้งใจ จนกว่าบทเรียนจะเปิดให้เรียน แอดมินและ Editor อ่านเนื้อหาจริงได้' },
    devLock: { en:'Locked during development', th:'ปิดไว้ระหว่างพัฒนา' },
    note: { en:'Educational only — not investment advice, a signal, or a recommendation. Nothing here is affiliated with any broker, exchange or issuer.',
            th:'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน สัญญาณซื้อขาย หรือการชี้ชวน ไม่มีความเกี่ยวข้องกับโบรกเกอร์ ตลาดหลักทรัพย์ หรือผู้ออกหลักทรัพย์ใดๆ' },

    /* ---- nav labels / detail titles -- stay client-side: a label alone
       reveals no lesson content, and the left-hand index has to render
       before (and even without) a successful content fetch. ---- */
    navOverview: { en:'Overview', th:'ภาพรวม' },
    navGroupMotive: { en:'Motive waves', th:'Motive waves' },
    navGroupCorrective: { en:'Corrective waves', th:'Corrective waves' },
    navGroupFib: { en:'Fibonacci & momentum', th:'ฟีโบนัชชีและโมเมนตัม' },
    navImpulse: { en:'Impulse', th:'Impulse' },
    navDiagLead: { en:'Diagonal — Leading', th:'Diagonal — Leading' },
    navDiagEnd: { en:'Diagonal — Ending', th:'Diagonal — Ending' },
    navZigzag: { en:'Zigzag (5-3-5)', th:'Zigzag (5-3-5)' },
    navFlat: { en:'Flat (3-3-5)', th:'Flat (3-3-5)' },
    navTriangle: { en:'Triangle (3-3-3-3-3)', th:'Triangle (3-3-3-3-3)' },
    navCombination: { en:'Combination', th:'Combination' },
    navDegree: { en:'Wave degree', th:'ระดับขนาดคลื่น' },
    navFibRetrace: { en:'Retracement summary', th:'สรุปการย่อกลับ' },
    navFibProj: { en:'Wave 5 projection', th:'คาดคะเนคลื่น 5' },
    navMistakes: { en:'Common mistakes', th:'ข้อผิดพลาดที่พบบ่อย' },
    navFurther: { en:'Further reading', th:'อ่านเพิ่มเติม' },
    navFlatRegular: { en:'Regular', th:'Regular' },
    navFlatExpanded: { en:'Expanded', th:'Expanded' },
    navFlatRunning: { en:'Running', th:'Running' },
    navTriContracting: { en:'Contracting (incl. Barrier)', th:'Contracting (incl. Barrier)' },
    navTriExpanding: { en:'Expanding', th:'Expanding' },
    navTriRunning: { en:'Running', th:'Running' },
    navFibProj3: { en:'Wave 3 projection', th:'คาดคะเนคลื่น 3' },
    navFibAo: { en:'Momentum check (AO)', th:'เช็กโมเมนตัม (AO)' },
    navGuide: { en:'Guidelines', th:'แนวทาง (Guidelines)' },
    navGdAlt: { en:'Alternation', th:'Alternation (สลับรูปแบบ)' },
    navGdChannel: { en:'Channeling', th:'Channeling (ช่องราคา)' },
    navGdExt: { en:'Extension & equality', th:'Extension และ Equality' },
    navGdTrunc: { en:'Truncation', th:'Truncation (wave 5 สั้น)' },
    navGdDepth: { en:'Depth of corrections', th:'ความลึกของการปรับฐาน' },
    navVolume: { en:'Volume & momentum', th:'Volume และ Momentum' },
    navPersonality: { en:'Wave personality', th:'บุคลิกของแต่ละคลื่น' },
    navHowto: { en:'How to count, step by step', th:'วิธีนับคลื่นทีละขั้น' },
    navW3c: { en:'Wave 3 or wave C? (advanced)', th:'Wave 3 หรือ Wave C? (ขั้นสูง)' },
    navMarkets: { en:'Where Elliott Wave works', th:'ใช้ Elliott Wave กับตลาดไหนได้บ้าง' },
    navBasics: { en:'The basic pattern: 5 & 3', th:'พื้นฐาน: 5 กับ 3 คืออะไร' },
    navGlossary: { en:'Glossary', th:'คำศัพท์ (Glossary)' },
    navExample: { en:'Worked example', th:'ตัวอย่างการนับทั้งรอบ' },
    navFibIntro: { en:'Fibonacci basics: how to draw', th:'พื้นฐานฟีโบนัชชี: วิธีลากเส้น' },
    navFrW2: { en:'Wave 2 retracement', th:'การย่อกลับของ Wave 2' },
    navFrW4: { en:'Wave 4 retracement', th:'การย่อกลับของ Wave 4' },
    navFrB: { en:'Wave B retracement', th:'การย่อกลับของ Wave B' },
    navFrX: { en:'Wave X retracement', th:'การย่อกลับของ Wave X' },
    navFibC: { en:'Wave C targets', th:'เป้าหมายของ Wave C' },
    navFibCluster: { en:'Fibonacci clusters', th:'โซนซ้อนของฟีโบนัชชี (Cluster)' },
    navRulesSheet: { en:'Rules cheat sheet', th:'สรุปกฎทั้งหมด (Cheat sheet)' },
    navGdStart: { en:'Spotting a new wave 1', th:'สังเกตจุดเริ่ม wave 1' },
    navGdNest: { en:'Nested 1-2s (before wave 3)', th:'1-2 ซ้อนกัน (ก่อน wave 3 พุ่ง)' },
    navGdThrust: { en:'Triangle thrust & diagonal reversal', th:'แรงพุ่งหลัง Triangle / กลับตัวหลัง Diagonal' },
    navGdCorrDone: { en:'Is the correction over?', th:'การปรับฐานจบหรือยัง?' },
    navFibTime: { en:'Time relationships', th:'ฟีโบนัชชีด้านเวลา' },
    navAltCount: { en:'Primary & alternate counts', th:'การนับหลักและการนับสำรอง' },
    navMtf: { en:'Multi-timeframe counting', th:'นับคลื่นหลายไทม์เฟรม' },
    navGallery: { en:'Pattern gallery (all patterns)', th:'รวมตัวอย่างทุกรูปแบบ' },
    navComboVs: { en:'Double zigzag vs double three', th:'Double Zigzag ต่างกับ Double Three ยังไง' },
    navPractice: { en:'Practice: name the waves', th:'ฝึกนับ: เลือกรูปแบบของแต่ละคลื่น' },
    navAdv: { en:'Advanced principles', th:'หลักการขั้นสูง' },
    navAdvOrthodox: { en:'Orthodox tops & bottoms', th:'ยอด/ก้นแบบ Orthodox' },
    navAdvFunction: { en:'Function vs mode & terms', th:'Function กับ Mode และศัพท์เพิ่มเติม' },
    navAdvErrors: { en:'Erroneous concepts', th:'ความเชื่อที่ผิด' },
    navAdvAfter5: { en:'After a fifth-wave extension', th:'หลัง wave 5 ยืด' },
    navAdvScale: { en:'Arithmetic vs semilog scale', th:'สเกล Arithmetic กับ Semilog' },
    navAdvThrow: { en:'Throw-over', th:'Throw-over' },
    navAdvLook: { en:'The right look', th:'Right Look — สัดส่วนที่ถูกต้อง' },
    navTimeObs: { en:'Time behaviour (teacher\u2019s notes)', th:'พฤติกรรมด้านเวลา (ข้อสังเกตผู้สอน)' },
    navAdvPractice: { en:'Practical application', th:'การนำไปใช้จริง' },
    navFibHistory: { en:'Fibonacci & the golden ratio', th:'ฟีโบนัชชีและอัตราส่วนทองคำ' },
    navFibRatio: { en:'Ratio analysis summary', th:'สรุป Ratio Analysis' },
    navFibTimeSeq: { en:'Fibonacci time sequences & Benner', th:'ลำดับเวลาฟีโบนัชชีและ Benner' },
    navRecount: { en:'Recount simulations', th:'จำลองการนับใหม่' },
    navRcTri2: { en:'Wave 2 became a triangle → W-X-Y', th:'Wave 2 เป็น Triangle → W-X-Y' },
    navRcOverlap: { en:'Wave 4 overlapped wave 1', th:'Wave 4 ซ้อน wave 1' },
    navRcFlat: { en:'B beyond the start of A → flat', th:'B เลยจุดเริ่ม A → Flat' },
    navRcExt: { en:'The fifth kept going → extension', th:'Wave 5 ยังไม่จบ → Extension' },
    navCtx: { en:'Long view & other approaches', th:'ภาพระยะยาวและแนวทางอื่น' },
    navCtxLong: { en:'Long-term waves', th:'คลื่นระยะยาว' },
    navCtxAssets: { en:'Stocks, commodities, gold', th:'หุ้น สินค้าโภคภัณฑ์ ทองคำ' },
    navCtxOther: { en:'Other approaches', th:'แนวทางวิเคราะห์อื่น' },
    /* 2026-10-16: new lesson groups (content uploaded separately) */
    nx_history: { en:'History: who created the theory', th:'ประวัติ: ใครคิดค้นทฤษฎีนี้' },
    nx_diag_101: { en:'Diagonals explained', th:'Diagonal คืออะไร (ครบในหน้าเดียว)' },
    nx_alt: { en:'Alternation in practice', th:'Alternation ในการใช้งานจริง' },
    nx_alt_21: { en:'Wave 2 sharp → wave 4 sideways', th:'Wave 2 ชัน → wave 4 ออกข้าง' },
    nx_alt_22: { en:'Wave 2 sideways → wave 4 sharp', th:'Wave 2 ออกข้าง → wave 4 ชัน' },
    nx_alt_depth: { en:'Deep vs shallow, quick vs slow', th:'ลึกกับตื้น เร็วกับช้า' },
    nx_alt_cx: { en:'Simple vs complex', th:'แบบเดี่ยวกับแบบซับซ้อน' },
    nx_alt_ext: { en:'Which wave will extend?', th:'คลื่นไหนจะยืด (Extension)' },
    nx_alt_corr: { en:'Alternation inside corrections', th:'Alternation ภายในการปรับฐาน' },
    nx_scn: { en:'Advanced: when the count does not fit', th:'วิเคราะห์ขั้นสูง: เมื่อการนับไม่ลงตัว' },
    nx_scn_w4short: { en:'Wave 4 too quick to be finished', th:'Wave 4 เร็วเกินกว่าจะจบ' },
    nx_scn_3_not_done: { en:'Wave 3 is not over yet', th:'Wave 3 ยังไม่จบ' },
    nx_scn_c_is_3: { en:'The "C" is really wave 3', th:'"C" ที่เห็นอาจเป็น wave 3' },
    nx_scn_w3short: { en:'Wave 3 looks the shortest', th:'Wave 3 ดูสั้นที่สุด' },
    nx_scn_1212: { en:'A series of 1-2s', th:'1-2 ซ้อน 1-2' },
    nx_scn_trunc: { en:'Truncated fifth or unfinished fifth?', th:'Wave 5 ขาด (Truncation) หรือยังไม่จบ?' },
    nx_scn_bhigh: { en:'New high: wave 5 or wave B?', th:'ทำยอดใหม่: wave 5 หรือ wave B?' },
    nx_scn_tri_diag: { en:'Triangle or ending diagonal?', th:'Triangle หรือ Ending Diagonal?' },
    nx_scn_dzz_imp: { en:'Double zigzag or impulse?', th:'Double Zigzag หรือ Impulse?' },
    nx_scn_deep2: { en:'A very deep wave 2', th:'Wave 2 ลึกมาก' },
    nx_scn_lead: { en:'Overlap at the start of a trend', th:'ซ้อนทับตั้งแต่ต้นเทรนด์' },
    nx_scn_running: { en:'Corrections that never reach their target', th:'การปรับฐานที่ไปไม่ถึงเป้า' },
    nx_scn_degree: { en:'Which degree is ending?', th:'คลื่นระดับไหนกำลังจบ?' },
    nx_trade: { en:'Trading with Elliott Wave', th:'การเทรดด้วย Elliott Wave' },
    nx_tr_basics: { en:'Entries, stops and targets', th:'จุดเข้า จุดตัดขาดทุน และเป้าหมาย' },
    nx_tr_w3: { en:'Trading wave 3', th:'เทรด wave 3' },
    nx_tr_w5: { en:'Trading wave 5', th:'เทรด wave 5' },
    nx_tr_c: { en:'Zigzag and flat: trading wave C', th:'Zigzag และ Flat: เทรด wave C' },
    nx_tr_c_exit: { en:'Taking profit on wave C', th:'เก็บกำไร wave C' },
    nx_tr_tri: { en:'Trading triangles', th:'เทรดด้วย Triangle' },
    nx_tr_ed: { en:'Ending diagonal reversals', th:'เทรดการกลับตัวจาก Ending Diagonal' },
    nx_tr_top: { en:'Selling the end of an impulse', th:'ขายตอนจบ Impulse' },
    nx_tr_channel: { en:'Trading with channels', th:'เทรดด้วยช่องราคา (Channel)' },
    nx_tr_manage: { en:'Managing an open trade', th:'การบริหารออเดอร์ที่เปิดอยู่' },
    nx_tr_check: { en:'Pre-trade checklist', th:'เช็กลิสต์ก่อนเข้าเทรด' },
    nx_fm: { en:'Measuring Fibonacci correctly', th:'วัดฟีโบนัชชีให้ถูก' },
    nx_fm_map: { en:'What to measure against what', th:'คลื่นไหนวัดเทียบกับคลื่นไหน' },
    nx_fm_retr: { en:'Retracement: where to click', th:'Retracement: คลิกที่จุดไหน' },
    nx_fm_ext: { en:'Extension: the three clicks', th:'Extension: คลิก 3 จุด' },
    nx_fm_corr: { en:'A-B-C, triangles and W-X-Y', th:'A-B-C, Triangle และ W-X-Y' },
    nx_fm_err: { en:'Common measuring mistakes', th:'ข้อผิดพลาดในการวัดที่พบบ่อย' },

    /* ---- Round AB: admin-key gate + content-loading states, mirroring
       Connected Users (part-50.js) exactly in wording style/tone. ---- */
    keyLede: { en:'This page\'s lesson content now lives on the server, not in the page you downloaded — enter the same admin key used on Connected Users / Announcements to view it.',
               th:'เนื้อหาบทเรียนของหน้านี้ย้ายไปอยู่บนเซิร์ฟเวอร์แล้ว ไม่ได้อยู่ในหน้าเว็บที่ดาวน์โหลดมาอีกต่อไป — ใส่รหัสแอดมินเดียวกับที่ใช้ในหน้า Connected Users / ประกาศ เพื่อดูเนื้อหา' },
    keyPh: { en:'Admin key', th:'รหัสแอดมิน' },
    keySubmit: { en:'Unlock', th:'ปลดล็อก' },
    keyErrBad: { en:'Incorrect key — try again.', th:'รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง' },
    keyErrNet: { en:'Could not reach the server — try again.', th:'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง' },
    loading: { en:'Loading lesson content…', th:'กำลังโหลดเนื้อหาบทเรียน…' },
    retry: { en:'Try again', th:'ลองใหม่' },
    contentMissing: { en:'This section hasn\'t been uploaded yet.', th:'ยังไม่มีการอัปโหลดเนื้อหาหัวข้อนี้' }
  };

  var NODE_TITLE = {
    overview:UI.navOverview, motive:UI.navGroupMotive, impulse:UI.navImpulse,
    'diag-lead':UI.navDiagLead, 'diag-end':UI.navDiagEnd, corrective:UI.navGroupCorrective,
    zigzag:UI.navZigzag, flat:UI.navFlat,
    'flat-regular':UI.navFlatRegular, 'flat-expanded':UI.navFlatExpanded, 'flat-running':UI.navFlatRunning,
    triangle:UI.navTriangle,
    'tri-contracting':UI.navTriContracting, 'tri-expanding':UI.navTriExpanding, 'tri-running':UI.navTriRunning,
    combination:UI.navCombination,
    degree:UI.navDegree, fib:UI.navGroupFib, 'fib-retrace':UI.navFibRetrace, 'fib-proj':UI.navFibProj,
    'fib-proj3':UI.navFibProj3, 'fib-ao':UI.navFibAo,
    'fib-intro':UI.navFibIntro, 'fr-w2':UI.navFrW2, 'fr-w4':UI.navFrW4, 'fr-b':UI.navFrB, 'fr-x':UI.navFrX,
    'fib-c':UI.navFibC, 'fib-cluster':UI.navFibCluster, 'rules-sheet':UI.navRulesSheet,
    'gd-start':UI.navGdStart, 'gd-nest':UI.navGdNest, 'gd-thrust':UI.navGdThrust, 'gd-corrdone':UI.navGdCorrDone,
    'fib-time':UI.navFibTime, 'alt-count':UI.navAltCount, mtf:UI.navMtf,
    gallery:UI.navGallery, 'combo-vs':UI.navComboVs, practice:UI.navPractice,
    adv:UI.navAdv, 'adv-orthodox':UI.navAdvOrthodox, 'adv-function':UI.navAdvFunction, 'adv-errors':UI.navAdvErrors, 'adv-after5':UI.navAdvAfter5,
    'adv-scale':UI.navAdvScale, 'adv-throw':UI.navAdvThrow, 'adv-look':UI.navAdvLook, 'time-obs':UI.navTimeObs, 'adv-practice':UI.navAdvPractice,
    'fib-history':UI.navFibHistory, 'fib-ratio':UI.navFibRatio, 'fib-timeseq':UI.navFibTimeSeq,
    recount:UI.navRecount, 'rc-tri2':UI.navRcTri2, 'rc-overlap':UI.navRcOverlap, 'rc-flat':UI.navRcFlat, 'rc-ext':UI.navRcExt,
    ctx:UI.navCtx, 'ctx-long':UI.navCtxLong, 'ctx-assets':UI.navCtxAssets, 'ctx-other':UI.navCtxOther,
    guide:UI.navGuide, 'gd-alternation':UI.navGdAlt, 'gd-channel':UI.navGdChannel, 'gd-extension':UI.navGdExt, 'gd-truncation':UI.navGdTrunc, 'gd-depth':UI.navGdDepth,
    volume:UI.navVolume, personality:UI.navPersonality, howto:UI.navHowto, w3c:UI.navW3c, markets:UI.navMarkets, basics:UI.navBasics, glossary:UI.navGlossary, example:UI.navExample,
    mistakes:UI.navMistakes, further:UI.navFurther,
    'history':UI.nx_history,
    'diag-101':UI.nx_diag_101,
    'alt':UI.nx_alt,
    'alt-21':UI.nx_alt_21,
    'alt-22':UI.nx_alt_22,
    'alt-depth':UI.nx_alt_depth,
    'alt-cx':UI.nx_alt_cx,
    'alt-ext':UI.nx_alt_ext,
    'alt-corr':UI.nx_alt_corr,
    'scn':UI.nx_scn,
    'scn-w4short':UI.nx_scn_w4short,
    'scn-3-not-done':UI.nx_scn_3_not_done,
    'scn-c-is-3':UI.nx_scn_c_is_3,
    'scn-w3short':UI.nx_scn_w3short,
    'scn-1212':UI.nx_scn_1212,
    'scn-trunc':UI.nx_scn_trunc,
    'scn-bhigh':UI.nx_scn_bhigh,
    'scn-tri-diag':UI.nx_scn_tri_diag,
    'scn-dzz-imp':UI.nx_scn_dzz_imp,
    'scn-deep2':UI.nx_scn_deep2,
    'scn-lead':UI.nx_scn_lead,
    'scn-running':UI.nx_scn_running,
    'scn-degree':UI.nx_scn_degree,
    'trade':UI.nx_trade,
    'tr-basics':UI.nx_tr_basics,
    'tr-w3':UI.nx_tr_w3,
    'tr-w5':UI.nx_tr_w5,
    'tr-c':UI.nx_tr_c,
    'tr-c-exit':UI.nx_tr_c_exit,
    'tr-tri':UI.nx_tr_tri,
    'tr-ed':UI.nx_tr_ed,
    'tr-top':UI.nx_tr_top,
    'tr-channel':UI.nx_tr_channel,
    'tr-manage':UI.nx_tr_manage,
    'tr-check':UI.nx_tr_check,
    'fm':UI.nx_fm,
    'fm-map':UI.nx_fm_map,
    'fm-retr':UI.nx_fm_retr,
    'fm-ext':UI.nx_fm_ext,
    'fm-corr':UI.nx_fm_corr,
    'fm-err':UI.nx_fm_err
  };
  // Ordered from the basics a beginner needs first down to the advanced material.
  var TREE = [
    { id:'overview' },
    { id:'history' },
    { id:'basics' },
    { id:'degree' },
    { id:'motive', children:['impulse', 'diag-101', 'diag-lead', 'diag-end'] },
    { id:'corrective', children:[
      'zigzag',
      'flat', 'flat-regular', 'flat-expanded', 'flat-running',
      'triangle', 'tri-contracting', 'tri-expanding', 'tri-running',
      'combination', 'combo-vs'
    ] },
    { id:'gallery' },
    { id:'personality' },
    { id:'guide', children:['gd-start', 'gd-alternation', 'gd-channel', 'gd-extension', 'gd-nest', 'gd-truncation', 'gd-depth', 'gd-thrust', 'gd-corrdone'] },
    { id:'alt', children:['alt-21', 'alt-22', 'alt-depth', 'alt-cx', 'alt-ext', 'alt-corr'] },
    { id:'adv', children:['adv-orthodox', 'adv-function', 'adv-errors', 'adv-after5', 'adv-scale', 'adv-throw', 'adv-look', 'time-obs', 'adv-practice'] },
    { id:'fib', children:[
      'fib-intro', 'fib-history',
      'fib-retrace', 'fr-w2', 'fr-w4', 'fr-b', 'fr-x',
      'fib-proj3', 'fib-proj', 'fib-c', 'fib-cluster', 'fib-ratio', 'fib-time', 'fib-timeseq',
      'fib-ao', 'volume'
    ] },
    { id:'fm', children:['fm-map', 'fm-retr', 'fm-ext', 'fm-corr', 'fm-err'] },
    { id:'howto' },
    { id:'rules-sheet' },
    { id:'practice' },
    { id:'alt-count' },
    { id:'recount', children:['rc-tri2', 'rc-overlap', 'rc-flat', 'rc-ext'] },
    { id:'scn', children:['scn-w4short', 'scn-3-not-done', 'scn-c-is-3', 'scn-w3short', 'scn-1212', 'scn-trunc', 'scn-bhigh', 'scn-tri-diag', 'scn-dzz-imp', 'scn-deep2', 'scn-lead', 'scn-running', 'scn-degree'] },
    { id:'mtf' },
    { id:'example' },
    { id:'trade', children:['tr-basics', 'tr-w3', 'tr-w5', 'tr-c', 'tr-c-exit', 'tr-tri', 'tr-ed', 'tr-top', 'tr-channel', 'tr-manage', 'tr-check'] },
    { id:'w3c' },
    { id:'markets' },
    { id:'ctx', children:['ctx-long', 'ctx-assets', 'ctx-other'] },
    { id:'glossary' },
    { id:'mistakes' },
    { id:'further' }
  ];

  var sec = null;
  var bodyEl = null;
  var currentId = 'overview';

  /* Round AB: fetched once per page load (both languages come back in the
     same response, so a language toggle never needs a second round trip).
     null = not yet fetched; {} shaped as { [nodeId]: { en, th } } once a
     fetch succeeds. */
  var contentCache = null;
  var contentLoading = false;
  var contentErr = null; // null | 'bad' (401, key cleared) | 'net'

  function fetchClassroomContent(){
    var key = getAdminKey();
    if(!key) return;
    contentLoading = true; contentErr = null;
    renderShell();
    fetch(WORKER_BASE + '/api/classroom/content', { headers:{ 'X-Admin-Key': key } })
      .then(function(r){
        if(r.status === 401){ clearAdminKey(); contentErr = 'bad'; contentCache = null; contentLoading = false; renderShell(); return null; }
        if(!r.ok) throw new Error('bad_status');
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        contentCache = data.content || {};
        contentLoading = false;
        renderShell();
      })
      .catch(function(){ contentErr = 'net'; contentLoading = false; renderShell(); });
  }

  function keyGateHTML(){
    return '<div class="ewv-keygate">' +
      '<div class="ewv-keygate-icon">🔑</div>' +
      '<p class="ewv-keygate-lede">' + esc(T(UI.keyLede)) + '</p>' +
      '<input type="password" class="ewv-key-input" data-ewv-key="input" autocomplete="off" spellcheck="false" placeholder="' + esc(T(UI.keyPh)) + '">' +
      '<button type="button" class="ewv-key-btn" data-ewv-key="submit">' + esc(T(UI.keySubmit)) + '</button>' +
      (contentErr === 'bad' ? '<div class="ewv-key-err">' + esc(T(UI.keyErrBad)) + '</div>' : '') +
    '</div>';
  }

  function netErrorHTML(){
    return '<div class="ewv-content-err">' +
      '<p>' + esc(T(UI.keyErrNet)) + '</p>' +
      '<button type="button" class="ewv-key-btn" data-ewv-key="retry">' + esc(T(UI.retry)) + '</button>' +
    '</div>';
  }

  function detailBodyHTML(){
    if(!getAdminKey()) return keyGateHTML();
    if(contentLoading) return '<div class="ewv-content-loading">' + esc(T(UI.loading)) + '</div>';
    if(contentErr === 'net') return netErrorHTML();
    if(!contentCache) return keyGateHTML(); // defensive fallback; renderShell() normally triggers a fetch before this is reached
    var node = contentCache[currentId];
    var out = node ? T(node) : '';
    if(currentId === 'practice' && out.indexOf('data-ewv-practice') === -1) out += '<div data-ewv-practice="1"></div>';
    return out || ('<div class="ewv-content-err"><p>' + esc(T(UI.contentMissing)) + '</p></div>');
  }

  function submitContentKey(){
    var input = bodyEl && bodyEl.querySelector('[data-ewv-key="input"]');
    var key = input ? input.value.trim() : '';
    if(!key) return;
    setAdminKey(key);
    fetchClassroomContent();
  }

  function wireContentGate(){
    if(!bodyEl) return;
    var input = bodyEl.querySelector('[data-ewv-key="input"]');
    if(input) input.addEventListener('keydown', function(ev){ if(ev.key === 'Enter') submitContentKey(); });
    var submit = bodyEl.querySelector('[data-ewv-key="submit"]');
    if(submit) submit.addEventListener('click', submitContentKey);
    var retry = bodyEl.querySelector('[data-ewv-key="retry"]');
    if(retry) retry.addEventListener('click', fetchClassroomContent);
  }

  function navItemHTML(id, isSub){
    var active = id === currentId ? ' active' : '';
    var subCls = isSub ? (/^(flat|tri|fr)-/.test(id) ? ' ewv-gl-sub ewv-gl-sub2' : ' ewv-gl-sub') : '';
    return '<button type="button" class="gl-nav-item' + active + subCls + '" data-node="' + id + '">' +
      '<span class="gl-nav-name">' + esc(T(NODE_TITLE[id])) + '</span></button>';
  }

  function renderShell(){
    if(!bodyEl) return;
    if(!NODE_TITLE[currentId]) currentId = 'overview';
    var reader = canRead();
    // Kick off the one-time content fetch, then bail out of this render --
    // fetchClassroomContent() calls renderShell() itself right away to paint
    // the loading state, so falling through here would just rebuild the
    // same markup twice.
    if(reader && getAdminKey() && !contentCache && !contentLoading && !contentErr){
      fetchClassroomContent();
      return;
    }
    /* a lesson that is in the menu but not on the server yet stays hidden until it is uploaded */
    function has(id){ return !contentCache || id === 'practice' || !!contentCache[id]; }
    var navHTML = TREE.map(function(entry){
      var kids = (entry.children || []).filter(has);
      if(!has(entry.id) && !kids.length) return '';
      var html = has(entry.id) ? navItemHTML(entry.id, false) : '';
      html += kids.map(function(cid){ return navItemHTML(cid, true); }).join('');
      return html;
    }).join('');
    bodyEl.innerHTML =
      '<div class="gl-shell ewv-gl-shell">' +
        '<div class="gl-nav">' + navHTML + '</div>' +
        '<div class="gl-detail gl-anim">' +
          '<div class="gl-detail-head"><span class="gl-detail-name">' + esc(T(NODE_TITLE[currentId])) + '</span></div>' +
          '<div class="gl-detail-body">' + (reader ? detailBodyHTML() : lockedPreviewHTML()) + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="ewv-note">' + esc(T(UI.note)) + '</p>';
    wireContentGate();
    var pm = bodyEl.querySelector('[data-ewv-practice]');
    if(pm) mountPractice(pm);
  }

  /* ================= Round AN: practice -- pick the pattern of every wave =================
     Each structure lists its waves; each wave has the set of patterns that are allowed.
     The chart redraws every leg with the chosen pattern's real shape. */
  var PT = {
    impulse:{ en:'Impulse', th:'Impulse' }, lead:{ en:'Leading diagonal', th:'Leading Diagonal' }, end:{ en:'Ending diagonal', th:'Ending Diagonal' },
    zigzag:{ en:'Zigzag', th:'Zigzag' }, flat:{ en:'Flat', th:'Flat' }, triangle:{ en:'Triangle', th:'Triangle' },
    dzz:{ en:'Double zigzag', th:'Double Zigzag' }, combo:{ en:'Double three (combination)', th:'Double Three (Combination)' }
  };
  var PT_ORDER = ['impulse', 'lead', 'end', 'zigzag', 'flat', 'triangle', 'dzz', 'combo'];
  var MOTIVE = { impulse:1, lead:1, end:1 };
  var SHAPE = {
    none:[[0,0],[1,1]],
    impulse:[[0,0],[.2,.38],[.32,.22],[.66,.78],[.78,.62],[1,1]],
    lead:[[0,0],[.22,.55],[.34,.3],[.6,.85],[.72,.62],[1,1]],
    end:[[0,0],[.22,.55],[.34,.3],[.6,.85],[.72,.62],[1,1]],
    zigzag:[[0,0],[.42,.64],[.62,.38],[1,1]],
    flat:[[0,0],[.3,.6],[.62,.04],[1,1]],
    triangle:[[0,0],[.2,1.2],[.4,.28],[.6,1.02],[.78,.5],[1,1]],
    dzz:[[0,0],[.18,.42],[.28,.28],[.46,.64],[.56,.5],[.74,.8],[.84,.7],[1,1]],
    combo:[[0,0],[.22,.72],[.44,.12],[.6,.86],[.8,.36],[1,1]]
  };
  var CORR = ['zigzag', 'flat', 'triangle', 'dzz', 'combo'], CORR_NT = ['zigzag', 'flat', 'dzz', 'combo'];
  var STRUCTS = {
    impulse:{ t:{en:'Impulse (1-2-3-4-5)',th:'Impulse (1-2-3-4-5)'}, legs:['1','2','3','4','5'],
      pts:[[0,.05],[.22,.36],[.32,.22],[.56,.84],[.7,.64],[1,.98]],
      ok:[['impulse','lead'], CORR_NT, ['impulse'], CORR, ['impulse','end']],
      why:[{en:'Wave 1 moves with the trend: impulse or leading diagonal.',th:'Wave 1 ไปตามเทรนด์: ต้องเป็น Impulse หรือ Leading Diagonal'},
           {en:'Wave 2 is a correction — any three except a triangle (a triangle is never wave 2).',th:'Wave 2 เป็นการปรับฐาน — เป็น 3 คลื่นแบบไหนก็ได้ ยกเว้น Triangle (Triangle ไม่เป็น wave 2)'},
           {en:'Wave 3 is always an impulse — never a diagonal, never a correction.',th:'Wave 3 เป็น Impulse เสมอ — ไม่เป็น Diagonal และไม่เป็นการปรับฐาน'},
           {en:'Wave 4 is a correction — any three, triangles included.',th:'Wave 4 เป็นการปรับฐาน — เป็น 3 คลื่นแบบไหนก็ได้ รวมถึง Triangle'},
           {en:'Wave 5 moves with the trend: impulse or ending diagonal.',th:'Wave 5 ไปตามเทรนด์: ต้องเป็น Impulse หรือ Ending Diagonal'}] },
    zigzag:{ t:{en:'Zigzag (A-B-C)',th:'Zigzag (A-B-C)'}, legs:['A','B','C'],
      pts:[[0,.95],[.3,.5],[.46,.68],[1,.08]],
      ok:[['impulse','lead'], CORR, ['impulse','end']],
      why:[{en:'Wave A of a zigzag is a five: impulse or leading diagonal.',th:'Wave A ของ Zigzag เป็น 5 คลื่น: Impulse หรือ Leading Diagonal'},
           {en:'Wave B is a correction — any three.',th:'Wave B เป็นการปรับฐาน — เป็น 3 คลื่นแบบไหนก็ได้'},
           {en:'Wave C is a five: impulse or ending diagonal.',th:'Wave C เป็น 5 คลื่น: Impulse หรือ Ending Diagonal'}] },
    flat:{ t:{en:'Flat (A-B-C)',th:'Flat (A-B-C)'}, legs:['A','B','C'],
      pts:[[0,.9],[.33,.42],[.66,.9],[1,.36]],
      ok:[CORR_NT, CORR, ['impulse','end']],
      why:[{en:'Wave A of a flat is a three (not a five, and not a triangle).',th:'Wave A ของ Flat เป็น 3 คลื่น (ไม่ใช่ 5 คลื่น และไม่ใช่ Triangle)'},
           {en:'Wave B is a three that returns to about the start of A.',th:'Wave B เป็น 3 คลื่นที่ย้อนกลับไปราวจุดเริ่ม A'},
           {en:'Wave C is a five: impulse or ending diagonal.',th:'Wave C เป็น 5 คลื่น: Impulse หรือ Ending Diagonal'}] },
    triangle:{ t:{en:'Triangle (A-B-C-D-E)',th:'Triangle (A-B-C-D-E)'}, legs:['A','B','C','D','E'],
      pts:[[0,.95],[.22,.2],[.44,.8],[.62,.34],[.8,.66],[1,.48]],
      ok:[CORR_NT, CORR_NT, CORR_NT, CORR_NT, CORR],
      why:[{en:'Every triangle leg is a three.',th:'ทุกขาของ Triangle เป็น 3 คลื่น'},{en:'Every triangle leg is a three.',th:'ทุกขาของ Triangle เป็น 3 คลื่น'},{en:'Every triangle leg is a three.',th:'ทุกขาของ Triangle เป็น 3 คลื่น'},{en:'Every triangle leg is a three.',th:'ทุกขาของ Triangle เป็น 3 คลื่น'},
           {en:'Wave E is a three — it may itself be a small triangle.',th:'Wave E เป็น 3 คลื่น — อาจเป็น Triangle ย่อยได้'}] },
    enddiag:{ t:{en:'Ending diagonal (1-2-3-4-5)',th:'Ending Diagonal (1-2-3-4-5)'}, legs:['1','2','3','4','5'],
      pts:[[0,.05],[.26,.6],[.38,.38],[.64,.86],[.76,.66],[1,.98]],
      ok:[['zigzag','dzz'], ['zigzag','dzz'], ['zigzag','dzz'], ['zigzag','dzz'], ['zigzag','dzz']],
      why:[{en:'Every leg of an ending diagonal is a three (usually a zigzag).',th:'ทุกขาของ Ending Diagonal เป็น 3 คลื่น (ส่วนใหญ่เป็น Zigzag)'},{en:'Every leg of an ending diagonal is a three (usually a zigzag).',th:'ทุกขาของ Ending Diagonal เป็น 3 คลื่น (ส่วนใหญ่เป็น Zigzag)'},{en:'Every leg of an ending diagonal is a three (usually a zigzag).',th:'ทุกขาของ Ending Diagonal เป็น 3 คลื่น (ส่วนใหญ่เป็น Zigzag)'},{en:'Every leg of an ending diagonal is a three (usually a zigzag).',th:'ทุกขาของ Ending Diagonal เป็น 3 คลื่น (ส่วนใหญ่เป็น Zigzag)'},{en:'Every leg of an ending diagonal is a three (usually a zigzag).',th:'ทุกขาของ Ending Diagonal เป็น 3 คลื่น (ส่วนใหญ่เป็น Zigzag)'}] },
    dzz:{ t:{en:'Double zigzag (W-X-Y)',th:'Double Zigzag (W-X-Y)'}, legs:['W','X','Y'],
      pts:[[0,.95],[.38,.5],[.55,.66],[1,.06]],
      ok:[['zigzag'], CORR, ['zigzag']],
      why:[{en:'In a double zigzag, W is a zigzag.',th:'ใน Double Zigzag ส่วน W เป็น Zigzag'},{en:'X is any correction.',th:'X เป็นการปรับฐานแบบไหนก็ได้'},{en:'Y is a zigzag too — otherwise it would be a double three.',th:'Y ต้องเป็น Zigzag ด้วย — ถ้าไม่ใช่จะกลายเป็น Double Three'}] },
    combo:{ t:{en:'Double three (W-X-Y)',th:'Double Three (W-X-Y)'}, legs:['W','X','Y'],
      pts:[[0,.86],[.38,.4],[.55,.78],[1,.36]],
      ok:[['zigzag','flat'], CORR, ['zigzag','flat','triangle']],
      why:[{en:'W is a simple correction (zigzag or flat).',th:'W เป็นการปรับฐานแบบเดี่ยว (Zigzag หรือ Flat)'},{en:'X is any correction.',th:'X เป็นการปรับฐานแบบไหนก็ได้'},{en:'Y is a zigzag, flat or triangle (a triangle only as the last part). W and Y cannot both be zigzags.',th:'Y เป็น Zigzag, Flat หรือ Triangle (Triangle อยู่ได้แค่ส่วนสุดท้าย) และ W กับ Y เป็น Zigzag ทั้งคู่ไม่ได้'}] }
  };
  var PU = {
    pick:{ en:'Structure', th:'โครงสร้าง' }, chk:{ en:'Check answers', th:'ตรวจคำตอบ' }, rnd:{ en:'Random', th:'สุ่มโจทย์' }, ans:{ en:'Show an answer', th:'ดูเฉลย' }, clr:{ en:'Clear', th:'ล้าง' },
    choose:{ en:'— choose —', th:'— เลือก —' }, wave:{ en:'Wave', th:'คลื่น' },
    allOk:{ en:'All correct! Every wave fits the rules of this pattern.', th:'ถูกทั้งหมด! ทุกคลื่นเข้ากฎของรูปแบบนี้' },
    some:{ en:'{n} of {t} correct — read the notes on the red waves.', th:'ถูก {n} จาก {t} ข้อ — อ่านคำอธิบายในช่องสีแดง' },
    bothZZ:{ en:'W and Y are both zigzags — that is a double zigzag, not a double three.', th:'W และ Y เป็น Zigzag ทั้งคู่ — นั่นคือ Double Zigzag ไม่ใช่ Double Three' },
    okPick:{ en:'Allowed here.', th:'ใช้ได้ในตำแหน่งนี้' },
    allowed:{ en:'Allowed:', th:'ที่ใช้ได้:' }
  };
  var PU2 = {
    tapWave:{ en:'Tap a wave on the chart (or a box below), then pick its pattern from the cards.', th:'แตะคลื่นบนกราฟ (หรือกล่องด้านล่าง) แล้วเลือกรูปแบบจากการ์ด' },
    pickFor:{ en:'Pick the pattern for wave', th:'เลือกรูปแบบของคลื่น' },
    close:{ en:'Close', th:'ปิด' },
    five:{ en:'5 waves', th:'5 คลื่น' }, three:{ en:'3 waves', th:'3 คลื่น' },
    timeH:{ en:'Time behaviour — a practitioner’s guideline', th:'พฤติกรรมด้านเวลา — แนวทางจากประสบการณ์ผู้สอน' },
    timeNote:{ en:'These are observations from practice (Focus), not rules. Use them as an extra clue when two counts look equally good.', th:'ข้อสังเกตจากการใช้งานจริงของผู้สอน (Focus) ไม่ใช่กฎ ใช้เป็นเบาะแสเพิ่มเติมเวลามีการนับสองแบบที่ดูดีพอกัน' },
    t1:{ en:'Impulse wave 1 tends to take <b>longer</b> than zigzag wave A — even though both are fives. A new trend starts slowly; a correction starts quickly.', th:'Wave 1 ของ Impulse มักใช้เวลา<b>นานกว่า</b> wave A ของ Zigzag — แม้ทั้งคู่จะเป็น 5 คลื่น เทรนด์ใหม่เริ่มช้า แต่การปรับฐานเริ่มเร็ว' },
    t2:{ en:'Zigzag wave C tends to take <b>longer</b> than wave A.', th:'Wave C ของ Zigzag มักใช้เวลา<b>นานกว่า</b> wave A' },
    t3:{ en:'Impulse wave 3 is the <b>steepest</b>: it covers the most distance in relatively little time.', th:'Wave 3 ของ Impulse <b>ชันที่สุด</b>: ไปได้ระยะไกลในเวลาค่อนข้างสั้น' },
    impL:{ en:'Impulse', th:'Impulse' }, zzL:{ en:'Zigzag', th:'Zigzag' },
    slow:{ en:'slower', th:'ช้ากว่า' }, steep:{ en:'steep', th:'ชัน' }, fast:{ en:'quick', th:'เร็ว' }, longer:{ en:'longer', th:'นานกว่า' }
  };
  var PT_HINT = {
    impulse:{ en:'Waves 1, 3, 5, A, C', th:'Wave 1, 3, 5, A, C' }, lead:{ en:'Wave 1 or A', th:'Wave 1 หรือ A' }, end:{ en:'Wave 5 or C', th:'Wave 5 หรือ C' },
    zigzag:{ en:'Sharp correction', th:'ปรับฐานแบบชัน' }, flat:{ en:'Sideways correction', th:'ปรับฐานแบบออกข้าง' }, triangle:{ en:'Wave 4, B, X, E — never 2', th:'Wave 4, B, X, E — ไม่เป็น 2' },
    dzz:{ en:'W-X-Y, both zigzags', th:'W-X-Y เป็น Zigzag ทั้งคู่' }, combo:{ en:'W-X-Y, sideways', th:'W-X-Y ออกข้าง' }
  };
  var SHAPE_LAB = {
    impulse:{1:'1',2:'2',3:'3',4:'4',5:'5'}, lead:{1:'1',2:'2',3:'3',4:'4',5:'5'}, end:{1:'1',2:'2',3:'3',4:'4',5:'5'},
    zigzag:{1:'a',2:'b',3:'c'}, flat:{1:'a',2:'b',3:'c'}, triangle:{1:'a',2:'b',3:'c',4:'d',5:'e'},
    dzz:{3:'w',4:'x',7:'y'}, combo:{3:'w',4:'x',5:'y'}
  };
  function prMini(key, w, h){
    var sh = SHAPE[key], pd = 12, out = '';
    function X(t){ return pd + (w - 2 * pd) * t; }
    function Y(v){ var lo = -0.05, hi = 1.25; return pd + (h - 2 * pd) * (1 - (v - lo) / (hi - lo)); }
    if(key === 'lead' || key === 'end' || key === 'triangle'){
      var a = sh[1], b = sh[3], c = sh[2], d = sh[4];
      out += '<path d="M' + X(a[0]) + ' ' + Y(a[1]) + ' L' + X(b[0] + (b[0] - a[0]) * .35) + ' ' + Y(b[1] + (b[1] - a[1]) * .35) + '" class="ewv-pr-mguide"></path>';
      out += '<path d="M' + X(c[0]) + ' ' + Y(c[1]) + ' L' + X(d[0] + (d[0] - c[0]) * .35) + ' ' + Y(d[1] + (d[1] - c[1]) * .35) + '" class="ewv-pr-mguide"></path>';
    }
    out += '<path d="M' + sh.map(function(p){ return X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' L') + '" class="ewv-pr-mpath"></path>';
    var lab = SHAPE_LAB[key] || {};
    sh.forEach(function(p, i){
      if(!lab[i]) return;
      var prev = sh[i - 1] ? sh[i - 1][1] : 0, up = p[1] >= prev;
      out += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="2.2" class="ewv-pr-mdot"></circle><text x="' + X(p[0]).toFixed(1) + '" y="' + (Y(p[1]) + (up ? -5 : 11)).toFixed(1) + '" class="ewv-pr-mlab">' + lab[i] + '</text>';
    });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="ewv-pr-mini">' + out + '</svg>';
  }
  function prStructMini(k){
    var S = STRUCTS[k], w = 120, h = 60, pd = 9;
    function X(t){ return pd + (w - 2 * pd) * t; }
    function Y(v){ return pd + (h - 2 * pd) * (1 - v); }
    var d = 'M' + S.pts.map(function(p){ return X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' L');
    var lb = S.legs.map(function(l, i){ var p = S.pts[i + 1], up = p[1] > S.pts[i][1]; return '<text x="' + X(p[0]).toFixed(1) + '" y="' + (Y(p[1]) + (up ? -3 : 9)).toFixed(1) + '" class="ewv-pr-mlab">' + l + '</text>'; }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="ewv-pr-mini"><path d="' + d + '" class="ewv-pr-mpath"></path>' + lb + '</svg>';
  }
  var pr = { s:'impulse', pick:{}, checked:false, open:null };
  function prDraw(){
    var S = STRUCTS[pr.s], W = 720, H = 330, pad = 30, d = '', i, k;
    function X(t){ return pad + (W - 2 * pad) * t; }
    function Y(v){ return pad + (H - 2 * pad) * (1 - v); }
    var labels = '', hits = '', grid = '';
    for(i = 1; i < 10; i++) grid += '<path d="M' + X(i / 10).toFixed(1) + ' ' + (pad - 8) + ' L' + X(i / 10).toFixed(1) + ' ' + (H - pad + 8) + '" class="ewv-pr-grid"></path>';
    for(i = 0; i < S.legs.length; i++){
      var a = S.pts[i], b = S.pts[i + 1], sh = SHAPE[pr.pick[i] || 'none'], seg = '';
      for(k = 0; k < sh.length; k++){
        var tx = X(a[0] + (b[0] - a[0]) * sh[k][0]), ty = Y(a[1] + (b[1] - a[1]) * sh[k][1]);
        d += (d ? ' L' : 'M') + tx.toFixed(1) + ' ' + ty.toFixed(1);
      }
      var up = b[1] > a[1], r = pr.checked ? prCheck(i) : null;
      var hc = 'ewv-pr-hit' + (pr.open === i ? ' on' : '') + (r === true ? ' ok' : (pr.checked && r !== true ? ' bad' : ''));
      hits += '<rect x="' + X(a[0]).toFixed(1) + '" y="' + (pad - 14) + '" width="' + (X(b[0]) - X(a[0])).toFixed(1) + '" height="' + (H - 2 * pad + 28) + '" rx="10" class="' + hc + '" data-pr-open="' + i + '"></rect>';
      labels += '<circle cx="' + X(b[0]).toFixed(1) + '" cy="' + Y(b[1]).toFixed(1) + '" r="3.2" class="ewv-dot"></circle><text x="' + X(b[0]).toFixed(1) + '" y="' + (Y(b[1]) + (up ? -11 : 21)).toFixed(1) + '" class="ewv-lab">' + S.legs[i] + '</text>';
      var mid = (X(a[0]) + X(b[0])) / 2;
      labels += '<text x="' + mid.toFixed(1) + '" y="' + (H - 6) + '" class="ewv-pr-legtag' + (pr.pick[i] ? ' set' : '') + '">' + esc(pr.pick[i] ? T(PT[pr.pick[i]]) : '?') + '</text>';
    }
    var skel = 'M' + S.pts.map(function(p){ return X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' L');
    return '<svg class="ewv-svg ewv-pr-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' + grid + hits + '<path d="' + skel + '" class="ewv-skel" fill="none"></path><path d="' + d + '" class="ewv-sub ewv-pr-line" fill="none"></path>' + labels + '</svg>';
  }
  function prCheck(i){
    var S = STRUCTS[pr.s], v = pr.pick[i];
    if(!v) return null;
    var ok = S.ok[i].indexOf(v) !== -1;
    if(ok && pr.s === 'combo' && i === 2 && pr.pick[0] === 'zigzag' && v === 'zigzag') return 'zz';
    return ok;
  }
  function prCards(i){
    var S = STRUCTS[pr.s];
    return '<div class="ewv-pr-cards"><div class="ewv-pr-cards-h"><b>' + esc(T(PU2.pickFor)) + ' ' + S.legs[i] + '</b><button type="button" data-pr-act="close">' + esc(T(PU2.close)) + ' ✕</button></div><div class="ewv-pr-cgrid">' +
      PT_ORDER.map(function(k){
        return '<button type="button" class="ewv-pr-card' + (pr.pick[i] === k ? ' on' : '') + '" data-pr-pick="' + k + '">' + prMini(k, 150, 84) +
          '<span class="n">' + esc(T(PT[k])) + '</span><span class="c ' + (MOTIVE[k] ? 'm' : 'k') + '">' + esc(T(MOTIVE[k] ? PU2.five : PU2.three)) + '</span><span class="h">' + esc(T(PT_HINT[k])) + '</span></button>';
      }).join('') + '</div></div>';
  }
  function prTimeGuide(){
    var w = 300, h = 130, pd = 16;
    function X(t){ return pd + (w - 2 * pd) * t; }
    function Y(v){ return pd + (h - 2 * pd) * (1 - v); }
    function path(pts){ return 'M' + pts.map(function(p){ return X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' L'); }
    var imp = [[0,.05],[.22,.36],[.32,.22],[.56,.84],[.7,.64],[1,.98]];
    var zz = [[0,.95],[.24,.5],[.4,.68],[1,.06]];
    function brk(x0, x1, y, lab, cls){ return '<path d="M' + X(x0).toFixed(1) + ' ' + (y - 4) + ' L' + X(x0).toFixed(1) + ' ' + y + ' L' + X(x1).toFixed(1) + ' ' + y + ' L' + X(x1).toFixed(1) + ' ' + (y - 4) + '" class="ewv-pr-tb ' + cls + '"></path><text x="' + ((X(x0) + X(x1)) / 2).toFixed(1) + '" y="' + (y + 11) + '" class="ewv-pr-tt ' + cls + '">' + lab + '</text>'; }
    var labI = ['1','2','3','4','5'].map(function(l, i){ var p = imp[i + 1], up = p[1] > imp[i][1]; return '<text x="' + X(p[0]).toFixed(1) + '" y="' + (Y(p[1]) + (up ? -5 : 12)).toFixed(1) + '" class="ewv-pr-mlab">' + l + '</text>'; }).join('');
    var labZ = ['A','B','C'].map(function(l, i){ var p = zz[i + 1], up = p[1] > zz[i][1]; return '<text x="' + X(p[0]).toFixed(1) + '" y="' + (Y(p[1]) + (up ? -5 : 12)).toFixed(1) + '" class="ewv-pr-mlab">' + l + '</text>'; }).join('');
    var svgI = '<svg viewBox="0 0 ' + w + ' ' + (h + 26) + '" class="ewv-pr-tsvg"><path d="' + path(imp) + '" class="ewv-pr-mpath"></path><path d="' + path([imp[2], imp[3]]) + '" class="ewv-pr-steep"></path>' + labI +
      brk(0, .22, h + 6, '1 · ' + T(PU2.slow), 'a') + brk(.32, .56, h + 6, '3 · ' + T(PU2.steep), 'b') + '</svg>';
    var svgZ = '<svg viewBox="0 0 ' + w + ' ' + (h + 26) + '" class="ewv-pr-tsvg"><path d="' + path(zz) + '" class="ewv-pr-mpath"></path>' + labZ +
      brk(0, .24, h + 6, 'A · ' + T(PU2.fast), 'b') + brk(.4, 1, h + 6, 'C · ' + T(PU2.longer), 'a') + '</svg>';
    return '<div class="ewv-pr-time"><div class="ewv-pr-time-h">⏱ ' + esc(T(PU2.timeH)) + '</div><div class="ewv-pr-time-g"><figure>' + svgI + '<figcaption>' + esc(T(PU2.impL)) + '</figcaption></figure><figure>' + svgZ + '<figcaption>' + esc(T(PU2.zzL)) + '</figcaption></figure></div>' +
      '<ul><li>' + T(PU2.t1) + '</li><li>' + T(PU2.t2) + '</li><li>' + T(PU2.t3) + '</li></ul><p>' + esc(T(PU2.timeNote)) + '</p></div>';
  }
  function prHTML(){
    var S = STRUCTS[pr.s];
    /* the structure picker and the action buttons live in one narrow bar that sticks under the header */
    var h = '<div class="ewv-pr"><div class="ewv-pr-bar"><span class="ewv-pr-lbl">' + esc(T(PU.pick)) + '</span><div class="ewv-pr-structs">' +
      Object.keys(STRUCTS).map(function(k){ return '<button type="button" class="ewv-pr-st' + (k === pr.s ? ' on' : '') + '" data-pr-st="' + k + '" title="' + esc(T(STRUCTS[k].t)) + '">' + prStructMini(k) + '<span>' + esc(T(STRUCTS[k].t).replace(/\s*\(.*\)\s*$/, '')) + '</span></button>'; }).join('') + '</div>' +
      '<div class="ewv-pr-top"><button type="button" class="go" data-pr-act="check">' + esc(T(PU.chk)) + '</button><button type="button" data-pr-act="rnd">' + esc(T(PU.rnd)) + '</button><button type="button" data-pr-act="ans">' + esc(T(PU.ans)) + '</button><button type="button" data-pr-act="clr">' + esc(T(PU.clr)) + '</button></div></div>' +
      '<p class="ewv-pr-tip">' + esc(T(PU2.tapWave)) + '</p>';
    h += '<div class="ewv-diagram ewv-pr-chart">' + prDraw() + '</div>';
    if(pr.open !== null && pr.open < S.legs.length) h += prCards(pr.open);
    h += '<div class="ewv-pr-legs">';
    var nOk = 0;
    S.legs.forEach(function(lg, i){
      var r = pr.checked ? prCheck(i) : null, cls = '';
      if(pr.checked){ cls = r === true ? ' ok' : ' bad'; if(r === true) nOk++; }
      if(pr.open === i) cls += ' open';
      var note = '';
      if(pr.checked){
        if(r === true) note = T(PU.okPick);
        else if(r === 'zz') note = T(PU.bothZZ);
        else note = T(S.why[i]) + ' ' + T(PU.allowed) + ' ' + S.ok[i].map(function(k){ return T(PT[k]); }).join(', ');
      }
      var v = pr.pick[i];
      h += '<button type="button" class="ewv-pr-leg' + cls + '" data-pr-open="' + i + '"><b>' + esc(T(PU.wave)) + ' ' + lg + '</b>' +
        (v ? prMini(v, 120, 56) + '<span class="pk">' + esc(T(PT[v])) + '</span>' : '<span class="pk none">' + esc(T(PU.choose)) + '</span>') +
        (note ? '<em>' + esc(note) + '</em>' : '') + '</button>';
    });
    h += '</div>';
    if(pr.checked) h += '<div class="ewv-pr-sum ' + (nOk === S.legs.length ? 'ok' : 'bad') + '">' + esc(nOk === S.legs.length ? T(PU.allOk) : T(PU.some).replace('{n}', nOk).replace('{t}', S.legs.length)) + '</div>';
    h += prTimeGuide();
    return h + '</div>';
  }
  function mountPractice(host){
    host.innerHTML = prHTML();
    if(host.__wired) return;
    host.__wired = true;
    host.addEventListener('click', function(ev){
      var st = ev.target.closest('[data-pr-st]');
      if(st){ pr.s = st.getAttribute('data-pr-st'); pr.pick = {}; pr.checked = false; pr.open = 0; host.innerHTML = prHTML(); return; }
      var op = ev.target.closest('[data-pr-open]');
      if(op){ var n = +op.getAttribute('data-pr-open'); pr.open = pr.open === n ? null : n; host.innerHTML = prHTML(); var cd = host.querySelector('.ewv-pr-cards'); if(cd && cd.scrollIntoView) try { cd.scrollIntoView({ block:'nearest', behavior:'smooth' }); } catch(e){} return; }
      var pk = ev.target.closest('[data-pr-pick]');
      if(pk && pr.open !== null){
        pr.pick[pr.open] = pk.getAttribute('data-pr-pick'); pr.checked = false;
        var S0 = STRUCTS[pr.s], nx = null;
        for(var j = 1; j <= S0.legs.length; j++){ var c = (pr.open + j) % S0.legs.length; if(!pr.pick[c]){ nx = c; break; } }
        pr.open = nx; host.innerHTML = prHTML(); return;
      }
      var b = ev.target.closest('[data-pr-act]'); if(!b) return;
      var a = b.getAttribute('data-pr-act'), S = STRUCTS[pr.s];
      if(a === 'check'){ pr.checked = true; pr.open = null; }
      else if(a === 'close') pr.open = null;
      else if(a === 'clr'){ pr.pick = {}; pr.checked = false; pr.open = 0; }
      else if(a === 'ans'){ pr.pick = {}; S.ok.forEach(function(arr, i){ pr.pick[i] = arr[0]; }); if(pr.s === 'combo') pr.pick[2] = 'flat'; pr.checked = true; pr.open = null; }
      else if(a === 'rnd'){ var ks = Object.keys(STRUCTS); pr.s = ks[Math.floor(Math.random() * ks.length)]; pr.pick = {}; pr.checked = false; pr.open = 0; }
      host.innerHTML = prHTML();
    });
  }

  function paint(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-ewv="' + k + '"]'); };
    if(q('eb')) q('eb').textContent = T(UI.eb);
    if(q('h')) q('h').textContent = T(UI.h);
    if(q('lede')) q('lede').textContent = T(UI.lede);
    bodyEl = q('body');
    if(bodyEl) renderShell();
  }

  function build(){
    if(document.getElementById('elliott')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'elliott';
    sec.setAttribute('data-route', 'elliott');
    sec.innerHTML =
      '<div class="ewv-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-ewv="eb"></span></div>' +
          '<h2 data-ewv="h"></h2>' +
          '<p class="lede" data-ewv="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-ewv="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    bodyEl = sec.querySelector('[data-ewv="body"]');
    // One delegated click listener on the (never-replaced) body container
    // handles every nav item, every map box/leaf, every thumbnail card, and
    // every "Fibonacci Tools" sub-list row inside the fetched content -- they
    // all just carry a data-node attribute. renderShell() replaces this
    // container's innerHTML on every click, but the listener itself survives
    // because it's bound to bodyEl, not to any node that gets re-created.
    // Validity is checked against NODE_TITLE (not fetched content) since the
    // nav tree -- unlike the lesson text -- is always available client-side.
    bodyEl.addEventListener('click', function(ev){
      var el = ev.target.closest('[data-node]');
      if(!el || !NODE_TITLE[el.getAttribute('data-node')]) return;
      currentId = el.getAttribute('data-node');
      // Keep the reader where they are: the nav list keeps its own scroll position and the page does not
      // jump to the top; if the lesson header ended up above the screen, bring just the header into view.
      var nav0 = bodyEl.querySelector('.gl-nav'), navTop = nav0 ? nav0.scrollTop : 0, y0 = window.pageYOffset;
      renderShell();
      var nav1 = bodyEl.querySelector('.gl-nav'); if(nav1) nav1.scrollTop = navTop;
      window.scrollTo(0, y0);
      var head = bodyEl.querySelector('.gl-detail');
      if(head){
        var top = head.getBoundingClientRect().top, topH = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--spz-topH'), 10) || 90) + 16;
        if(top < topH) window.scrollTo({ top: window.pageYOffset + top - topH, behavior: 'smooth' });
      }
    });

    window.__spzAddRoute({
      id:'elliott', after:'signals',
      t:{en:'Elliott Wave Classroom',th:'ห้องเรียน Elliott Wave'},
      d:{en:'The 5-3 wave pattern, the three hard rules, the common guidelines, and an honest look at where the whole framework goes wrong.',
         th:'รูปแบบคลื่น 5-3 กฎหลักสามข้อ แนวทางที่ใช้กันทั่วไป และมุมมองตรงไปตรงมาว่าทฤษฎีนี้มักผิดพลาดตรงไหน'}
    });

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('spz:tier', function(){ contentCache = null; contentErr = null; if(sec) paint(); });
  }

  /* read-only hook for the ebook builder (part-78.js): the lesson tree and
     titles. The lesson bodies still come from the Worker with the admin key. */
  window.__SPZ_EWV_BOOK = { tree:TREE, title:function(id){ return NODE_TITLE[id] || null; } };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
