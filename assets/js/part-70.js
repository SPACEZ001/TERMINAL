/* ============================================================================
   SPACEZ TERMINAL -- Round AD2: report reference codes + analyst signature block
   ----------------------------------------------------------------------------
   1) Every report gets an easy-to-read reference code:
        SPZ-<TYPE>-<YYMMDD>-<HHMM>-<2 random chars>      e.g. SPZ-GD-261010-1538-K7
      It is shown in the report header, and when the reader presses Print / Save
      as PDF the browser's document.title is set to that code for the duration
      of the print, so the saved PDF is named after it automatically.
        MK/GD/ID/AN/BB = Print Report (market / gold / idea / announcement / bubble)
        JR = analysis report   BA = Before/After   BR = Institutional Briefing
        CP = stock comparison  WL = watchlist share card
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
  var REF_RE = /SPZ-[A-Z]{2}-\d{6}-\d{4}-[A-Z0-9]{2}/;
  var PR_CODES = { market:'MK', gold:'GD', idea:'ID', announcement:'AN', bubble:'BB' };
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
    for(var i = 0; i < 2; i++) s += ALPHA.charAt(Math.floor(Math.random() * ALPHA.length));
    return s;
  }
  function make(code){
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
    if(c && now - c.t < 15 * 60000) return c.ref;
    var ref = make(PR_CODES[type] || 'PR');
    prCache[type] = { ref:ref, t:now };
    return ref;
  }

  window.__SPZ_REPORTREF = { make:make, forPrintReport:forPrintReport, pattern:REF_RE };

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
        '<div class="spz70-ab-name">' + esc(NAME) + '</div>' +
        '<div class="spz70-ab-role">' + esc(ROLE) + '</div>' +
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
    qa('.spz70-tg span').forEach(function(s){ s.textContent = T(UI.toggle); });
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
    if(actions && !q1('.spz70-tg', actions)) actions.appendChild(makeToggle());
  }
  function prepPrintReport(sheet){
    var meta = q1('.pr-meta', sheet);
    var m = meta ? meta.textContent.match(REF_RE) : null;
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
      if(row && !q1('.spz70-tg', row)) row.appendChild(makeToggle());
    }
    /* Stock comparison: next to the Download PDF button */
    var cmpRow = q1('.compare-pdf-row');
    if(cmpRow && !q1('.spz70-tg', cmpRow)){
      var btn = q1('#compareDownloadBtn', cmpRow);
      var t = makeToggle();
      if(btn && btn.nextSibling) cmpRow.insertBefore(t, btn.nextSibling); else cmpRow.appendChild(t);
    }
    /* Watchlist share card: in the modal's action row */
    var wl = q1('.wlshare-actions');
    if(wl && !q1('.spz70-tg', wl)) wl.appendChild(makeToggle());
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

  /* ------------------------------------------------------------- boot */
  var pending = false;
  function schedule(){
    if(pending) return;
    pending = true;
    setTimeout(function(){ pending = false; try { scan(); } catch(e){} }, 120);
  }
  function boot(){
    if(!document.body){ setTimeout(boot, 50); return; }
    new MutationObserver(schedule).observe(document.body, { childList:true, subtree:true });
    document.addEventListener('spz:tier', tierClass);
    scan();
  }
  boot();
})();
