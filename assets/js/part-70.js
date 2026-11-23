/* ============================================================================
   SPACEZ TERMINAL -- Round AD2: report reference codes + analyst signature block
   ----------------------------------------------------------------------------
   1) Every report gets an easy-to-read reference code:
        SPZ-<TYPE>-<YYMMDD>-<HHMM>-<6 random chars>      e.g. SPZ-GD-261010-1538-K7X4P9
      It is shown in the report header, and when the reader presses Print / Save
      as PDF the browser's document.title is set to that code for the duration
      of the print, so the saved PDF is named after it automatically.
        MK/GD/ID/AN/BB = Print Report (market / gold / idea / announcement / bubble)
        JR = analysis report   BA = Before/After   BR = Institutional Briefing
        CP = stock comparison  WL = watchlist share card
        (2026-11-23) BR / CP / SF / CY = Print Report brief / comparison / stock fact sheet / economic cycle
   2) A "Show analyst" checkbox on every report adds a closing block: photo,
      "Noraset Boikaw", "Elliott Wave Analyst . SPACEZ TERMINAL" and a web QR code.
      The choice is remembered in localStorage.
   Nothing here changes how a report is built: the existing modules keep making
   their own markup, and this file only decorates it (MutationObserver + a
   window.print wrapper). part-49.js serial() calls forPrintReport() below.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_REPORTREF) return;

  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   /* no I / O / 0 / 1 -- easy to read aloud */
  var REF_RE = /SPZ-[A-Z]{2}-\d{6}-\d{4}-[A-Z0-9]{4,10}/;
  var PR_CODES = { market:'MK', gold:'GD', idea:'ID', announcement:'AN', bubble:'BB', eval:'EV', cert:'CT', gradebook:'GB', review:'RV', letter:'LT', brief:'BR', compare:'CP', stock:'SF', cycle:'CY' };
  var WEB_URL = 'https://terminal.spacezblack.workers.dev/';
  var LS_KEY = 'spz.report.analyst';
  var NAME = 'Noraset Boikaw';
  var ROLE = 'Elliott Wave Analyst · SPACEZ TERMINAL';

  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ return o[L()] || o.en; }
  function q1(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function p2(n){ return (n < 10 ? '0' : '') + n; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var UI = {
    refLbl:  { en:'Report ID', th:'รหัสรายงาน' },
    toggle:  { en:'Include analyst name', th:'ใส่ชื่อนักวิเคราะห์' },
    by:      { en:'Prepared by', th:'จัดทำโดย' },
    scan:    { en:'Scan to open SPACEZ TERMINAL', th:'สแกนเพื่อเปิด SPACEZ TERMINAL' }
  };

  /* ---------------------------------------------------------------- codes */
  function rnd2(){
    var s = '';
    for(var i = 0; i < 6; i++) s += ALPHA.charAt(Math.floor(Math.random() * ALPHA.length));
    return s;
  }
  function make(code){
    /* 2026-11-17 print guard (part-92): non-admin prints carry a draft code with no serial number */
    var G = window.__SPZ_PRINTGUARD; if(G && G.limited()) return G.ref(code);
    var d = new Date();
    return 'SPZ-' + code + '-' +
      String(d.getFullYear()).slice(2) + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' +
      p2(d.getHours()) + p2(d.getMinutes()) + '-' + rnd2();
  }

  /* part-49 asks for the code once per paint (and paints repeatedly while the
     reader ticks options), so the same type keeps one code until a print has
     finished -- or 15 minutes pass -- instead of changing on every repaint. */
  var prCache = {};
  function forPrintReport(type){
    var c = prCache[type], now = Date.now();
    var G = window.__SPZ_PRINTGUARD; if(G && G.limited()) return G.ref(PR_CODES[type] || 'PR');
    if(c && now - c.t < 15 * 60000) return c.ref;
    var ref = make(PR_CODES[type] || 'PR');
    prCache[type] = { ref:ref, t:now };
    return ref;
  }

  window.__SPZ_REPORTREF = { make:make, forPrintReport:forPrintReport, pattern:REF_RE };

  /* ------------------------------------- 2026-11-23: analyst credential (CEWA / CEWA-M)
     Elliott Wave International awards two designations: CEWA (all three exams passed) and CEWA-M
     (Master: Exams II and III with 90% or more); holders write them after the name ("Name, CEWA").
     OFF until the owner ticks it — never claim a credential that has not been earned.
     One switch (localStorage spz.cred.v1) for every document: the analyst block below (Print Report,
     Before/After, analysis, briefing, comparison), the official letters (part-98) and the reviewer form
     (part-95). Turning it on also turns the analyst name on, since the credential sits under the name. */
  var CR_LS = 'spz.cred.v1';
  var cred = { on:0, lv:'cewa', yr:'', no:'' };
  try { var cs = JSON.parse(localStorage.getItem(CR_LS) || 'null'); if(cs && typeof cs === 'object'){ cred.on = cs.on ? 1 : 0; cred.lv = cs.lv === 'cewam' ? 'cewam' : 'cewa'; cred.yr = String(cs.yr || '').slice(0, 16); cred.no = String(cs.no || '').slice(0, 40); } } catch(e){}
  var CR = {
    cewa: { tag:'CEWA', en:'Certified Elliott Wave Analyst', th:'นักวิเคราะห์คลื่นเอลเลียตที่ได้รับการรับรอง' },
    cewam:{ tag:'CEWA-M', en:'Certified Elliott Wave Analyst — Master', th:'นักวิเคราะห์คลื่นเอลเลียตที่ได้รับการรับรอง ระดับมาสเตอร์' }
  };
  var CR_UI = {
    tick:{ en:'Show my CEWA credential', th:'แสดงคุณวุฒิ CEWA' },
    head:{ en:'Analyst credential', th:'คุณวุฒินักวิเคราะห์' },
    note:{ en:'Tick only after you have passed — CEWA: all three exams; CEWA-M: Exams II and III with 90% or more (Elliott Wave International). The line then appears on every report, Before/After, letter and form.',
           th:'ติ๊กเมื่อสอบผ่านแล้วเท่านั้น — CEWA = ผ่านครบทั้ง 3 ชุด · CEWA-M = ผ่านชุดที่ 2 และ 3 ด้วยคะแนน 90% ขึ้นไป (Elliott Wave International) เมื่อติ๊กแล้ว บรรทัดนี้จะขึ้นในทุกรายงาน Before/After จดหมาย และแบบฟอร์ม' },
    lv:{ en:'Level', th:'ระดับ' }, yr:{ en:'Year awarded (optional)', th:'ปีที่ได้รับ (ถ้ามี)' }, no:{ en:'Credential no. (optional)', th:'เลขที่ใบรับรอง (ถ้ามี)' },
    by:{ en:'awarded by Elliott Wave International', th:'รับรองโดย Elliott Wave International' },
    shows:{ en:'It will read:', th:'จะแสดงในเอกสารว่า:' }
  };
  function credOn(){ return !!cred.on; }
  function crTitle(l){ var c = CR[cred.lv]; return c[l] + ' (' + c.tag + ')'; }
  function crBy(l){ return CR_UI.by[l] + (cred.yr ? (l === 'th' ? ' · ปี ' : ' · ') + cred.yr : '') + (cred.no ? (l === 'th' ? ' · เลขที่ ' : ' · No. ') + cred.no : ''); }
  function crSave(){
    try { localStorage.setItem(CR_LS, JSON.stringify(cred)); } catch(e){}
    if(cred.on && !analystOn){ analystOn = true; try { localStorage.setItem(LS_KEY, '1'); } catch(e){} }
    applyAnalyst();
    try { document.dispatchEvent(new CustomEvent('spz:cred', { detail:{ on:cred.on, lv:cred.lv } })); } catch(e){}
  }
  function applyCred(){
    if(!document.body) return;
    document.body.classList.toggle('spz-cred-on', !!cred.on);
    var l = L(), tag = CR[cred.lv].tag;
    qa('.spz70-ab-post').forEach(function(e){ e.textContent = cred.on ? ', ' + tag : ''; });
    qa('.spz70-ab-badge').forEach(function(e){ e.textContent = tag; });
    qa('.spz70-ab-cred span').forEach(function(e){ e.textContent = crTitle(l) + ' · ' + crBy(l); });
    qa('input[data-spz70-cr]').forEach(function(c){ c.checked = !!cred.on; });
    qa('select[data-spz70-crlv]').forEach(function(c){ c.value = cred.lv; c.hidden = !cred.on; });
    qa('input[data-cred="on"]').forEach(function(c){ c.checked = !!cred.on; var b = c.closest('.spz-cred-box'); if(b) b.classList.toggle('on', !!cred.on); });
    qa('[data-cred-prev]').forEach(function(e){ e.textContent = crTitle(l) + ' · ' + crBy(l); });
    qa('[data-cred-lv]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-cred-lv') === cred.lv); });
  }
  /* the fuller panel used inside the letter / reviewer forms */
  function credFormHTML(){
    var l = L();
    return '<div class="spz-cred-box' + (cred.on ? ' on' : '') + '">' +
      '<label class="spz-cred-tick"><input type="checkbox" data-cred="on"' + (cred.on ? ' checked' : '') + '><span>' + esc(T(CR_UI.tick)) + '</span><em>EWI</em></label>' +
      '<div class="spz-cred-more"><div class="spz-cred-lv"><span>' + esc(T(CR_UI.lv)) + '</span>' +
        '<button type="button" data-cred-lv="cewa"' + (cred.lv === 'cewa' ? ' class="on"' : '') + '>CEWA</button><button type="button" data-cred-lv="cewam"' + (cred.lv === 'cewam' ? ' class="on"' : '') + '>CEWA-M</button></div>' +
        '<div class="spz-cred-g"><input type="text" data-cred="yr" value="' + esc(cred.yr) + '" placeholder="' + esc(T(CR_UI.yr)) + '" autocomplete="off"><input type="text" data-cred="no" value="' + esc(cred.no) + '" placeholder="' + esc(T(CR_UI.no)) + '" autocomplete="off"></div>' +
        '<div class="spz-cred-prev"><small>' + esc(T(CR_UI.shows)) + '</small><b data-cred-prev>' + esc(crTitle(l) + ' · ' + crBy(l)) + '</b></div></div>' +
      '<div class="spz-cred-note">' + esc(T(CR_UI.note)) + '</div></div>';
  }
  function credInput(t){
    var k = t && t.getAttribute && t.getAttribute('data-cred'); if(!k) return false;
    if(k === 'on') cred.on = t.checked ? 1 : 0;
    else if(k === 'yr') cred.yr = String(t.value || '').slice(0, 16);
    else if(k === 'no') cred.no = String(t.value || '').slice(0, 40);
    else return false;
    crSave(); return true;
  }
  function credClick(t){
    var b = t && t.closest && t.closest('[data-cred-lv]'); if(!b) return false;
    cred.lv = b.getAttribute('data-cred-lv') === 'cewam' ? 'cewam' : 'cewa'; crSave(); return true;
  }
  window.__SPZ_CRED = {
    on:credOn, tag:function(){ return CR[cred.lv].tag; },
    title:function(l){ return crTitle(l || L()); },
    line:function(l){ l = l || L(); return crTitle(l) + ' · ' + crBy(l); },
    docHTML:function(l){ l = l || L(); return '<b>' + esc(crTitle(l)) + '</b><br>' + esc(crBy(l)); },
    get:function(){ return { on:cred.on, lv:cred.lv, yr:cred.yr, no:cred.no }; },
    formHTML:credFormHTML, handleInput:credInput, handleClick:credClick
  };
  /* small switch next to "Include analyst name" */
  function makeCredToggle(){
    var lab = document.createElement('label');
    lab.className = 'spz70-tg spz70-cr';
    lab.innerHTML = '<input type="checkbox" data-spz70-cr><span></span><select data-spz70-crlv><option value="cewa">CEWA</option><option value="cewam">CEWA-M</option></select>';
    lab.querySelector('span').textContent = T(CR_UI.tick);
    lab.title = T(CR_UI.note);
    var cb = lab.querySelector('input'), sel = lab.querySelector('select');
    cb.checked = !!cred.on; sel.value = cred.lv; sel.hidden = !cred.on;
    cb.addEventListener('change', function(){ cred.on = cb.checked ? 1 : 0; crSave(); });
    sel.addEventListener('change', function(){ cred.lv = sel.value === 'cewam' ? 'cewam' : 'cewa'; crSave(); });
    return lab;
  }

  /* --------------------------------------------------------- analyst block */
  var analystOn = false;
  try { analystOn = localStorage.getItem(LS_KEY) === '1'; } catch(e){}

  function qrSvg(){
    try {
      if(typeof qrcode !== 'function') return '';
      var qr = qrcode(0, 'M');
      qr.addData(WEB_URL);
      qr.make();
      return qr.createSvgTag({ cellSize:4, margin:0, scalable:true });
    } catch(e){ return ''; }
  }
  function analystHTML(dark){
    var ava = window.__SPZ_DEV_AVATAR || '';
    return '<div class="spz70-ab' + (dark ? ' dark' : '') + '">' +
      (ava ? '<img class="spz70-ab-ava" src="' + esc(ava) + '" alt="">' : '') +
      '<div class="spz70-ab-txt">' +
        '<div class="spz70-ab-cap">' + esc(T(UI.by)) + '</div>' +
        '<div class="spz70-ab-name">' + esc(NAME) + '<span class="spz70-ab-post">' + esc(credOn() ? ', ' + CR[cred.lv].tag : '') + '</span></div>' +
        '<div class="spz70-ab-role">' + esc(ROLE) + '</div>' +
        /* 2026-11-23: the CEWA credential line — present in every block, shown only while it is ticked (body.spz-cred-on) */
        '<div class="spz70-ab-cred"><i class="spz70-ab-badge">' + esc(CR[cred.lv].tag) + '</i><span>' + esc(crTitle(L()) + ' · ' + crBy(L())) + '</span></div>' +
      '</div>' +
      '<div class="spz70-ab-qr"><div class="spz70-ab-qrbox">' + qrSvg() + '</div>' +
        '<span>' + esc(T(UI.scan)) + '</span></div>' +
    '</div>';
  }
  function putBlock(sheet, beforeSel, dark){
    if(!sheet || q1('.spz70-ab', sheet)) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = analystHTML(dark);
    var node = tmp.firstChild;
    var ref = beforeSel ? q1(beforeSel, sheet) : null;
    if(ref && ref.parentNode) ref.parentNode.insertBefore(node, ref);
    else sheet.appendChild(node);
  }

  /* one shared on/off switch: a body class decides whether every block shows */
  function applyAnalyst(){
    document.body.classList.toggle('spz-analyst-on', analystOn);
    qa('input[data-spz70-tg]').forEach(function(c){ c.checked = analystOn; });
    applyCred();
  }
  function makeToggle(){
    var lab = document.createElement('label');
    lab.className = 'spz70-tg';
    lab.innerHTML = '<input type="checkbox" data-spz70-tg><span></span>';
    lab.querySelector('span').textContent = T(UI.toggle);
    var cb = lab.querySelector('input');
    cb.checked = analystOn;
    cb.addEventListener('change', function(){
      analystOn = !!cb.checked;
      try { localStorage.setItem(LS_KEY, analystOn ? '1' : '0'); } catch(e){}
      applyAnalyst();
    });
    return lab;
  }
  function refreshToggleText(){
    qa('.spz70-tg:not(.spz70-cr) span').forEach(function(s){ s.textContent = T(UI.toggle); });
    qa('.spz70-cr span').forEach(function(s){ s.textContent = T(CR_UI.tick); });
  }

  /* ----------------------------------------------------------- decorating */
  function mark(el, ref){
    el.setAttribute('data-spz70', '1');
    if(ref) el.setAttribute('data-ref', ref);
  }
  function addRefSpan(metaEl, ref){
    if(!metaEl) return;
    var s = document.createElement('span');
    s.className = 'spz70-ref';
    s.textContent = T(UI.refLbl) + ': ' + ref;
    metaEl.appendChild(s);
  }

  function prepOverlay(ov){            /* analysis report / Before-After / Briefing */
    var sheet = q1('.jrp-sheet', ov);
    if(!sheet){ return; }
    var code = sheet.classList.contains('jrp-ba-sheet') ? 'BA' : (q1('[data-jrp="briefBody"]', ov) ? 'BR' : 'JR');
    var ref = make(code);
    mark(ov, ref);
    addRefSpan(q1('.jrp-meta', sheet), ref);
    putBlock(sheet, '.jrp-foot', false);
    var actions = q1('.jrp-actions', ov);
    if(actions && !q1('.spz70-tg', actions)){ actions.appendChild(makeToggle()); actions.appendChild(makeCredToggle()); }
  }
  function prepPrintReport(sheet){
    var meta = q1('.pr-meta', sheet);
    var m = meta ? meta.textContent.match(REF_RE) : null;
    /* 2026-11-23: official documents (part-98) and the reviewer form (part-95) carry their own signature block --
       never append the analyst card after their A4 pages (the CEWA switch turns the analyst card on) */
    if(sheet.classList.contains('pr-lt') || sheet.classList.contains('pr-rv') || sheet.classList.contains('pr-rv2')){ mark(sheet, ''); return; }
    if(sheet.classList.contains('pr-cert')){            /* the certificate carries its own signature + QR */
      mark(sheet, m ? m[0] : forPrintReport('cert'));   /* PDF file name SPZ-CT-... so the REPORTS sorter can file it */
      return;
    }
    mark(sheet, m ? m[0] : '');
    putBlock(sheet, '.pr-foot', false);
  }
  function prepCompare(sheet){
    var ref = make('CP');
    mark(sheet, ref);
    addRefSpan(q1('.cmp-meta', sheet), ref);
    putBlock(sheet, '.cmp-foot', false);
  }
  function prepWatchShare(card){
    var ref = make('WL');
    mark(card, ref);
    var top = q1('.wlshare-top', card);
    if(top){
      var s = document.createElement('span');
      s.className = 'spz70-ref spz70-ref-card';
      s.textContent = ref;
      top.appendChild(s);
    }
    putBlock(card, '.wlshare-foot-row', true);
  }

  function addStaticToggles(){
    /* Print Report: next to the "include final page" checkbox */
    var qrCb = q1('[data-pr="qrToggle"]');
    if(qrCb){
      var row = qrCb.closest('.pr-row');
      if(row && !q1('.spz70-tg', row)){ row.appendChild(makeToggle()); row.appendChild(makeCredToggle()); }
    }
    /* Stock comparison: next to the Download PDF button */
    var cmpRow = q1('.compare-pdf-row');
    if(cmpRow && !q1('.spz70-tg', cmpRow)){
      var btn = q1('#compareDownloadBtn', cmpRow);
      var t = makeToggle(), tc = makeCredToggle();
      if(btn && btn.nextSibling) cmpRow.insertBefore(t, btn.nextSibling); else cmpRow.appendChild(t);
      cmpRow.insertBefore(tc, t.nextSibling);
    }
    /* Watchlist share card: in the modal's action row */
    var wl = q1('.wlshare-actions');
    if(wl && !q1('.spz70-tg', wl)){ wl.appendChild(makeToggle()); wl.appendChild(makeCredToggle()); }
  }

  function tierClass(){
    var tier = '';
    try { tier = window.__SPZ_TIER ? window.__SPZ_TIER() : ''; } catch(e){}
    document.body.classList.toggle('spz-tier-editor', tier === 'editor');
  }

  function scan(){
    if(!document.body) return;
    qa('.jrp-overlay:not([data-spz70])').forEach(prepOverlay);
    qa('.pr-sheet:not([data-spz70])').forEach(prepPrintReport);
    qa('#cmpPrintSheet .cmp-sheet:not([data-spz70])').forEach(prepCompare);
    qa('.wlshare-card:not([data-spz70])').forEach(prepWatchShare);
    addStaticToggles();
    tierClass();
    refreshToggleText();
    applyAnalyst();
  }

  /* ------------------------------------------------- PDF file name = ref */
  function activeSheet(){
    var c = document.body.classList;
    if(c.contains('spz-printing-compare')) return q1('#cmpPrintSheet .cmp-sheet');
    if(c.contains('spz-printing-journal')) return q1('.jrp-overlay');
    if(c.contains('spz-printing-wlshare')) return q1('.wlshare-card');
    if(c.contains('spz-printing-report')) return q1('.pr-sheet');
    return null;
  }
  var restoreTimer = null, savedTitle = null;
  function restoreTitle(){
    if(restoreTimer){ clearTimeout(restoreTimer); restoreTimer = null; }
    if(savedTitle !== null){ document.title = savedTitle; savedTitle = null; }
    prCache = {};                         /* next report generated gets a fresh code */
  }
  window.addEventListener('afterprint', restoreTitle);

  var origPrint = window.print;
  window.print = function(){
    try {
      scan();                             /* sheets built a moment ago are decorated before printing */
      var sheet = activeSheet();
      var ref = sheet ? sheet.getAttribute('data-ref') : '';
      if(ref){
        if(savedTitle === null) savedTitle = document.title;
        document.title = ref;
        if(restoreTimer) clearTimeout(restoreTimer);
        restoreTimer = setTimeout(restoreTitle, 120000);   /* safety net if afterprint never fires */
      }
    } catch(e){}
    return origPrint.apply(window, arguments);
  };

  /* ------------------------------------------- keep the page on refresh */
  /* The router runs once while the page is still loading, before most pages
     have been added, so a reload of e.g. #/printreport used to fall back to the
     hub. The URL the browser actually loaded is still in the navigation entry,
     so wait for that page to exist, then go back to it. */
  function wantedRoute(){
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      var u = (nav && nav.name) || '';
      var i = u.indexOf('#/');
      if(i >= 0){
        var id = u.slice(i + 2).split(/[?&]/)[0];
        if(/^[a-z0-9_-]+$/i.test(id) && id !== 'home') return id;
      }
    } catch(e){}
    return '';
  }
  function restoreRoute(){
    var id = wantedRoute();
    if(!id) return;
    var tries = 0, acted = false, t0 = Date.now();
    ['mousedown', 'keydown', 'touchstart', 'wheel'].forEach(function(n){
      document.addEventListener(n, function(){ acted = true; }, { once:true, capture:true, passive:true });
    });
    (function go(){
      if(acted) return;                                   /* the reader took over: leave it alone */
      var cur = (location.hash || '').replace(/^#\/?/, '').split(/[?&]/)[0];
      if(cur !== id && document.getElementById(id) && tries < 4){ tries++; location.hash = '#/' + id; }
      if(Date.now() - t0 < 12000) setTimeout(go, 400);
    })();
  }

  /* ------------------------------------------------------------- boot */
  var pending = false;
  /* Round AM (speed): live tickers rewrite parts of the page every second;
     only rescan when something that could be a report sheet was added. */
  var WATCH_SEL = '.pr-sheet, .compare-pdf-row, .jrp-overlay, .cmp-sheet, .wlshare-card, .pr-actions, .jrp-actions, .cmp-actions, .wlshare-actions, [data-pr]';
  function relevant(records){
    if(!records) return true;
    for(var i = 0; i < records.length; i++){
      var add = records[i].addedNodes;
      for(var j = 0; j < add.length; j++){
        var n = add[j];
        if(n.nodeType !== 1) continue;
        if((n.matches && n.matches(WATCH_SEL)) || (n.querySelector && n.querySelector(WATCH_SEL))) return true;
      }
    }
    return false;
  }
  function schedule(records){
    if(!relevant(records)) return;
    if(pending) return;
    pending = true;
    setTimeout(function(){ pending = false; try { scan(); } catch(e){} }, 120);
  }
  function boot(){
    if(!document.body){ setTimeout(boot, 50); return; }
    new MutationObserver(schedule).observe(document.body, { childList:true, subtree:true });
    document.addEventListener('spz:tier', tierClass);
    scan();
    restoreRoute();
  }
  boot();
})();
