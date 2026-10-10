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
    navGroupMotive: { en:'Motive waves', th:'คลื่นโมทีฟ' },
    navGroupCorrective: { en:'Corrective waves', th:'คลื่นคอเรคทีฟ' },
    navGroupFib: { en:'Fibonacci tools', th:'เครื่องมือฟีโบนัชชี' },
    navImpulse: { en:'Impulse', th:'อิมพัลส์' },
    navDiagLead: { en:'Diagonal — Leading', th:'ไดแอกอนัล — ลีดดิ้ง' },
    navDiagEnd: { en:'Diagonal — Ending', th:'ไดแอกอนัล — เอนดิ้ง' },
    navZigzag: { en:'Zigzag (5-3-5)', th:'ซิกแซก (5-3-5)' },
    navFlat: { en:'Flat (3-3-5)', th:'แฟลต (3-3-5)' },
    navTriangle: { en:'Triangle (3-3-3-3-3)', th:'แทรงเกิล (3-3-3-3-3)' },
    navCombination: { en:'Combination', th:'คอมบิเนชัน' },
    navDegree: { en:'Wave degree', th:'ระดับขนาดคลื่น' },
    navFibRetrace: { en:'Retracement & guidelines', th:'การย่อกลับและแนวทาง' },
    navFibProj: { en:'Wave 5 projection', th:'คาดคะเนคลื่น 5' },
    navMistakes: { en:'Common mistakes', th:'ข้อผิดพลาดที่พบบ่อย' },
    navFurther: { en:'Further reading', th:'อ่านเพิ่มเติม' },
    navFlatRegular: { en:'Regular', th:'รีกูลาร์' },
    navFlatExpanded: { en:'Expanded', th:'เอ็กซ์แพนเดด' },
    navFlatRunning: { en:'Running', th:'รันนิ่ง' },
    navTriContracting: { en:'Contracting (incl. Barrier)', th:'คอนแทร็กติ้ง (รวมแบริเออร์)' },
    navTriExpanding: { en:'Expanding', th:'เอ็กซ์แพนดิ้ง' },
    navTriRunning: { en:'Running', th:'รันนิ่ง' },
    navFibProj3: { en:'Wave 3 projection', th:'คาดคะเนคลื่น 3' },
    navFibAo: { en:'Momentum check (AO)', th:'เช็กโมเมนตัม (AO)' },

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
    mistakes:UI.navMistakes, further:UI.navFurther
  };
  var TREE = [
    { id:'overview' },
    { id:'motive', children:['impulse', 'diag-lead', 'diag-end'] },
    { id:'corrective', children:[
      'zigzag',
      'flat', 'flat-regular', 'flat-expanded', 'flat-running',
      'triangle', 'tri-contracting', 'tri-expanding', 'tri-running',
      'combination'
    ] },
    { id:'degree' },
    { id:'fib', children:['fib-retrace', 'fib-proj', 'fib-proj3', 'fib-ao'] },
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
    var subCls = isSub ? ' ewv-gl-sub' : '';
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
    var navHTML = TREE.map(function(entry){
      var html = navItemHTML(entry.id, false);
      if(entry.children) html += entry.children.map(function(cid){ return navItemHTML(cid, true); }).join('');
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
      renderShell();
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

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
