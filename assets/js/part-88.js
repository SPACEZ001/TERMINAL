/* =====================================================================
   SPACEZ SEARCH + APP INSTALL (2026-11-15)
   User request: a search box at the top of the site, and a way to install
   the website as an app on a phone.
   * Search: a button in the top bar (and the "/" or Ctrl/Cmd+K keys) opens a
     palette that searches every page in the menu (title + description, both
     languages), every stock in the market snapshot (ticker + name) and the
     other SPACEZ sites. Locked pages still show; opening one goes through the
     normal lock pop-up (part-46), because results are plain [data-route-to]
     links.
   * App: registers sw.js (network-first, offline fallback) and adds an
     "Install app" button to the palette and to the SPACEZ apps pop-up. Uses
     the browser's own install prompt when it offers one; otherwise shows the
     steps for iPhone / Android / computer.
   ===================================================================== */
(function(){
  'use strict';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function B(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function norm(s){ return String(s || '').toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim(); }

  var TX = {
    btn:B('Search', 'ค้นหา'),
    ph:B('Search pages, lessons, stocks…', 'ค้นหาหน้า บทเรียน หุ้น…'),
    pages:B('Pages', 'หน้าในเว็บ'), stocks:B('Stocks', 'หุ้น'), apps:B('Other SPACEZ sites', 'เว็บอื่นของ SPACEZ'),
    none:B('Nothing found. Try another word — e.g. dividend, P/E, gold, calendar.', 'ไม่พบ ลองคำอื่น เช่น ปันผล, P/E, ทองคำ, ปฏิทิน'),
    hint:B('Try:', 'ลองพิมพ์:'),
    keys:B('↑↓ move · Enter open · Esc close', '↑↓ เลื่อน · Enter เปิด · Esc ปิด'),
    install:B('Install as an app', 'ติดตั้งเป็นแอป'),
    installed:B('Already installed — you are using the app', 'ติดตั้งแล้ว — ตอนนี้ใช้งานแบบแอปอยู่'),
    newtab:B('new tab', 'แถบใหม่'),
    close:B('Close', 'ปิด')
  };
  var TRY = { en:['dividend', 'P/E', 'gold', 'calendar', 'AAPL', 'PTT'], th:['ปันผล', 'P/E', 'ทองคำ', 'ปฏิทิน', 'AAPL', 'PTT'] };
  var APPS = [
    ['IC_License.html', B('IC licence guide', 'สอบใบอนุญาต IC'), B('IC Plain exam topics, summaries, practice', 'เนื้อหา สรุป และข้อสอบ IC Plain')],
    ['SPACEZ_ISLAND.html', B('SPACEZ ISLAND (economy game)', 'เกม SPACEZ ISLAND (เกมเศรษฐกิจ)'), B('Run an island economy, learn by playing', 'บริหารเศรษฐกิจเกาะ เรียนผ่านเกม')],
    ['SPACEZ_TAX_TERMINAL.html', B('Tax calculator', 'คำนวณภาษี'), B('Thai personal income tax', 'ภาษีเงินได้บุคคลธรรมดา')],
    ['SPACEZ_VOCAB_LAB.html', B('Exam vocabulary', 'คำศัพท์เตรียมสอบ'), B('CEWA terms, EN + TH', 'ศัพท์ CEWA อังกฤษ-ไทย')]
  ];
  /* extra words people type that the page titles do not contain */
  var ALIAS = {
    stockclass:'เริ่มต้น มือใหม่ beginner course หุ้นคืออะไร what is a stock',
    basics:'เปิดบัญชี โบรกเกอร์ broker account ปันผล dividend',
    glossary:'pe p/e roe pb ศัพท์ คำศัพท์ ratio อัตราส่วน',
    guided:'forex ฟอเร็กซ์ crypto คริปโต bitcoin options ออปชั่น ตลาด markets',
    ecocal:'ปฏิทิน calendar cpi fed ดอกเบี้ย เงินเฟ้อ ข่าวเศรษฐกิจ',
    brain:'gold ทองคำ bitcoin บิตคอยน์ forecast พยากรณ์',
    stock:'หุ้นรายตัว chart กราฟ',
    signals:'กราฟ chart rsi macd แนวรับ แนวต้าน'
  };

  function routes(){
    try { return typeof window.__spzRouteList === 'function' ? window.__spzRouteList() : []; } catch(e){ return []; }
  }
  function stocks(){
    try { var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); return (s && s.stocks) || {}; } catch(e){ return {}; }
  }
  function score(hay, toks){
    var sc = 0;
    for(var i = 0; i < toks.length; i++){
      var at = hay.indexOf(toks[i]);
      if(at < 0) return -1;
      sc += at === 0 ? 6 : (hay.charAt(at - 1) === ' ' ? 4 : 1);
    }
    return sc;
  }
  function search(q){
    var toks = norm(q).split(' ').filter(Boolean), res = { pages:[], stocks:[], apps:[] };
    if(!toks.length) return res;
    routes().forEach(function(r){
      var title = norm(T(r.t) || r.id);
      var hay = norm([r.t && r.t.en, r.t && r.t.th, r.d && r.d.en, r.d && r.d.th, r.id, ALIAS[r.id]].join(' '));
      var sc = score(hay, toks); if(sc < 0) return;
      if(score(title, toks) >= 0) sc += 20;
      res.pages.push({ id:r.id, t:T(r.t) || r.id, d:T(r.d), sc:sc });
    });
    res.pages.sort(function(a, b){ return b.sc - a.sc; }); res.pages = res.pages.slice(0, 8);
    var S = stocks(), q1 = toks.join(' ');
    Object.keys(S).forEach(function(t){
      var s = S[t] || {}, tk = norm(t.replace(/\.BK$/i, '')), nm = norm(s.name);
      var sc = tk === q1 ? 100 : tk.indexOf(q1) === 0 ? 60 : -1;
      if(sc < 0){ var ns = score(nm + ' ' + tk, toks); if(ns >= 0) sc = 10 + ns; }
      if(sc < 0) return;
      res.stocks.push({ t:t, name:s.name || '', px:s.price, chg:s.chg_pct, ccy:s.ccy || '', sc:sc + Math.min(5, Math.log10((s.mcap || 1)) / 3) });
    });
    res.stocks.sort(function(a, b){ return b.sc - a.sc; }); res.stocks = res.stocks.slice(0, 6);
    APPS.forEach(function(a){
      var hay = norm([a[1].en, a[1].th, a[2].en, a[2].th, a[0]].join(' '));
      if(score(hay, toks) >= 0) res.apps.push(a);
    });
    return res;
  }

  /* ---------------- palette ---------------- */
  var ov = null, inp = null, list = null, sel = 0, lastFocus = null;
  var ICO = {
    s:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
    pg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/></svg>',
    st:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 17l5-5.5 4 3.5 7.5-8.5"/><path d="M15.5 6.5H20V11"/></svg>',
    ap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M19 14v4.5A1.5 1.5 0 0 1 17.5 20h-12A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5H10"/></svg>',
    dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7.5v7M9 11.5l3 3 3-3M10.5 18.5h3"/></svg>'
  };
  function build(){
    if(ov) return;
    ov = document.createElement('div');
    ov.className = 'spzq'; ov.hidden = true;
    ov.innerHTML =
      '<div class="spzq-back" data-x></div>' +
      '<div class="spzq-box" role="dialog" aria-modal="true">' +
        '<div class="spzq-in">' + ICO.s + '<input type="search" autocomplete="off" spellcheck="false" enterkeyhint="go"><button type="button" class="spzq-esc" data-x>Esc</button><button type="button" class="spzq-x" data-x aria-label="close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<div class="spzq-list" role="listbox"></div>' +
        '<div class="spzq-foot"><span class="spzq-keys"></span><button type="button" class="spzq-inst" data-install>' + ICO.dl + '<span></span></button></div>' +
      '</div>';
    document.body.appendChild(ov);
    inp = ov.querySelector('input'); list = ov.querySelector('.spzq-list');
    ov.addEventListener('click', function(e){
      if(e.target.closest('[data-x]')){ close(); return; }
      if(e.target.closest('[data-install]')){ close(); installApp(); return; }
      var a = e.target.closest('[data-q-stock]');
      if(a){ e.preventDefault(); var t = a.getAttribute('data-q-stock'); close();
        try { if(window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(t); else location.hash = '#/stock'; } catch(err){}
        return; }
      var ty = e.target.closest('[data-q-try]');
      if(ty){ inp.value = ty.getAttribute('data-q-try'); paint(); inp.focus(); return; }
      if(e.target.closest('.spzq-it')) setTimeout(close, 0);
    });
    inp.addEventListener('input', function(){ sel = 0; paint(); });
    inp.addEventListener('keydown', function(e){
      var its = list.querySelectorAll('.spzq-it');
      if(e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(its.length - 1, sel + 1); mark(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if(e.key === 'Enter'){ e.preventDefault(); if(its[sel]) its[sel].click(); }
      else if(e.key === 'Escape'){ e.preventDefault(); close(); }
    });
  }
  function mark(){
    var its = list.querySelectorAll('.spzq-it');
    for(var i = 0; i < its.length; i++){ its[i].classList.toggle('on', i === sel); its[i].setAttribute('aria-selected', i === sel ? 'true' : 'false'); }
    if(its[sel] && its[sel].scrollIntoView) its[sel].scrollIntoView({ block:'nearest' });
  }
  function hl(text, q){
    var t = esc(text), toks = norm(q).split(' ').filter(function(x){ return x.length > 0; });
    toks.forEach(function(k){
      var i = t.toLowerCase().indexOf(esc(k));
      if(i >= 0) t = t.slice(0, i) + '<mark>' + t.slice(i, i + esc(k).length) + '</mark>' + t.slice(i + esc(k).length);
    });
    return t;
  }
  function paint(){
    var q = inp.value, h = '';
    ov.querySelector('.spzq-keys').textContent = T(TX.keys);
    inp.placeholder = T(TX.ph);
    var ib = ov.querySelector('[data-install]');
    ib.hidden = isStandalone();
    ib.querySelector('span').textContent = T(TX.install);
    if(!norm(q)){
      h = '<div class="spzq-empty"><span>' + esc(T(TX.hint)) + '</span>' + TRY[L()].map(function(w){ return '<button type="button" class="spzq-chip" data-q-try="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>';
      var feat = ['stockclass', 'guided', 'now', 'ecocal', 'glossary'], rl = routes(), pick = [];
      feat.forEach(function(id){ rl.forEach(function(r){ if(r.id === id) pick.push(r); }); });
      if(pick.length) h += '<div class="spzq-h">' + esc(T(TX.pages)) + '</div>' + pick.map(function(r){ return pageRow({ id:r.id, t:T(r.t) || r.id, d:T(r.d) }, ''); }).join('');
    } else {
      var r = search(q);
      if(r.pages.length) h += '<div class="spzq-h">' + esc(T(TX.pages)) + '</div>' + r.pages.map(function(p){ return pageRow(p, q); }).join('');
      if(r.stocks.length) h += '<div class="spzq-h">' + esc(T(TX.stocks)) + '</div>' + r.stocks.map(function(s){
        var up = typeof s.chg === 'number' && s.chg >= 0;
        var px = typeof s.px === 'number' ? s.px.toLocaleString(undefined, { maximumFractionDigits:2 }) + (s.ccy ? ' ' + esc(s.ccy) : '') : '';
        var ch = typeof s.chg === 'number' ? '<b class="' + (up ? 'up' : 'dn') + '">' + (up ? '+' : '') + s.chg.toFixed(2) + '%</b>' : '';
        return '<a class="spzq-it" href="#/stock" data-q-stock="' + esc(s.t) + '"><i class="k-st">' + ICO.st + '</i><span class="spzq-tx"><b>' + hl(s.t.replace(/\.BK$/i, ''), q) + (/\.BK$/i.test(s.t) ? ' <em>SET</em>' : '') + '</b><small>' + hl(s.name, q) + '</small></span><span class="spzq-px">' + px + ch + '</span></a>';
      }).join('');
      if(r.apps.length) h += '<div class="spzq-h">' + esc(T(TX.apps)) + '</div>' + r.apps.map(function(a){
        return '<a class="spzq-it" href="' + a[0] + '" target="_blank" rel="noopener"><i class="k-ap">' + ICO.ap + '</i><span class="spzq-tx"><b>' + hl(T(a[1]), q) + '</b><small>' + esc(T(a[2])) + ' · ' + esc(T(TX.newtab)) + '</small></span></a>';
      }).join('');
      if(!h) h = '<div class="spzq-none">' + esc(T(TX.none)) + '</div>';
    }
    list.innerHTML = h;
    mark();
  }
  function pageRow(p, q){
    var d = p.d || ''; if(d.length > 110) d = d.slice(0, 108) + '…';
    return '<a class="spzq-it" href="#/' + esc(p.id) + '" data-route-to="' + esc(p.id) + '"><i class="k-pg">' + ICO.pg + '</i><span class="spzq-tx"><b>' + hl(p.t, q) + '</b>' + (d ? '<small>' + hl(d, q) + '</small>' : '') + '</span><span class="spzq-go">→</span></a>';
  }
  function open(){
    build();
    lastFocus = document.activeElement;
    ov.hidden = false;
    document.documentElement.classList.add('spzq-open');
    sel = 0; paint();
    requestAnimationFrame(function(){ ov.classList.add('on'); inp.focus(); inp.select(); });
  }
  function close(){
    if(!ov || ov.hidden) return;
    ov.classList.remove('on');
    document.documentElement.classList.remove('spzq-open');
    setTimeout(function(){ ov.hidden = true; }, 160);
    try { if(lastFocus && lastFocus.focus) lastFocus.focus(); } catch(e){}
  }
  window.__SPZ_SEARCH = { open:open, close:close };
  /* window-capture runs before part-46's document-capture lock check, so a locked result closes the
     palette first and its lock pop-up (and then the sign-in gate) are not hidden behind it */
  window.addEventListener('click', function(e){
    if(!ov || ov.hidden) return;
    var it = e.target && e.target.closest && e.target.closest('.spzq-it[data-route-to]');
    if(it && ov.contains(it)) close();
  }, true);

  document.addEventListener('keydown', function(e){
    var tg = e.target, typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable);
    if((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)){ e.preventDefault(); if(ov && !ov.hidden) close(); else open(); return; }
    if(e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey){ e.preventDefault(); open(); }
  });

  /* ---------------- top-bar button ---------------- */
  var qBtn = null;
  function paintBtn(){
    if(!qBtn) return;
    qBtn.querySelector('.spzq-bl').textContent = T(TX.btn);
    qBtn.setAttribute('aria-label', T(TX.btn)); qBtn.title = T(TX.btn) + '  ( / )';
  }
  function buildBtn(){
    if(qBtn) return true;
    var cluster = document.querySelector('.nav-cluster');
    var menuWrap = cluster && (cluster.querySelector('.nav-links-wrap') || cluster.querySelector('.nav-links'));
    if(!cluster || !menuWrap) return false;
    qBtn = document.createElement('button');
    qBtn.type = 'button'; qBtn.className = 'spzq-btn';
    qBtn.innerHTML = ICO.s + '<span class="spzq-bl"></span><kbd>/</kbd>';
    var anchor = menuWrap;
    while(anchor.parentNode && anchor.parentNode !== cluster) anchor = anchor.parentNode;
    cluster.insertBefore(qBtn, anchor);
    qBtn.addEventListener('click', function(e){ e.stopPropagation(); open(); });
    paintBtn();
    new MutationObserver(function(){ paintBtn(); if(ov && !ov.hidden) paint(); paintAppsInstall(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  var tq = 0, ivq = setInterval(function(){ if(buildBtn() || ++tq > 80) clearInterval(ivq); }, 250);

  /* ---------------- install as an app (PWA) ---------------- */
  var deferred = null;
  function isStandalone(){
    try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch(e){ return false; }
  }
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; paintAppsInstall(); });
  window.addEventListener('appinstalled', function(){ deferred = null; paintAppsInstall(); });
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load', function(){
      setTimeout(function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }, 2500);
    });
  }
  function platform(){
    var ua = navigator.userAgent || '';
    if(/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    if(/Android/i.test(ua)) return 'android';
    return 'desk';
  }
  var STEPS = {
    ios:{ t:B('iPhone / iPad (Safari)', 'iPhone / iPad (ใช้ Safari)'), s:[
      B('Open this site in Safari (not inside LINE or Facebook).', 'เปิดเว็บนี้ใน Safari (ไม่ใช่เปิดในแอป LINE หรือ Facebook)'),
      B('Tap the Share button — the square with an arrow pointing up.', 'แตะปุ่มแชร์ — รูปสี่เหลี่ยมมีลูกศรชี้ขึ้น'),
      B('Scroll down and tap “Add to Home Screen”.', 'เลื่อนลงแล้วแตะ “เพิ่มไปยังหน้าจอโฮม”'),
      B('Tap “Add”. The SPACEZ icon appears on your home screen.', 'แตะ “เพิ่ม” ไอคอน SPACEZ จะอยู่บนหน้าจอโฮม')] },
    android:{ t:B('Android (Chrome)', 'Android (ใช้ Chrome)'), s:[
      B('Open this site in Chrome.', 'เปิดเว็บนี้ใน Chrome'),
      B('Tap the ⋮ menu at the top right.', 'แตะเมนู ⋮ มุมขวาบน'),
      B('Tap “Install app” (or “Add to Home screen”).', 'แตะ “ติดตั้งแอป” (หรือ “เพิ่มลงในหน้าจอหลัก”)'),
      B('Confirm. The SPACEZ icon appears with your other apps.', 'กดยืนยัน ไอคอน SPACEZ จะอยู่รวมกับแอปอื่น')] },
    desk:{ t:B('Computer (Chrome or Edge)', 'คอมพิวเตอร์ (Chrome หรือ Edge)'), s:[
      B('Look for the install icon at the right end of the address bar (a screen with a down arrow).', 'ดูที่ปลายขวาของช่องที่อยู่เว็บ จะมีไอคอนติดตั้ง (รูปจอมีลูกศรลง)'),
      B('Click it, then click “Install”.', 'คลิก แล้วกด “ติดตั้ง”'),
      B('No icon? Open the browser menu ⋮ → “Cast, save and share” → “Install page as app”.', 'ไม่เห็นไอคอน? เปิดเมนู ⋮ → “แคสต์ บันทึก และแชร์” → “ติดตั้งหน้าเว็บเป็นแอป”'),
      B('Safari on Mac: File → “Add to Dock”.', 'Safari บน Mac: เมนู ไฟล์ → “เพิ่มไปยัง Dock”')] }
  };
  var instEl = null;
  function installApp(){
    if(isStandalone()){ guide(true); return; }
    if(deferred){
      var d = deferred; deferred = null;
      try { d.prompt(); d.userChoice.then(function(){ paintAppsInstall(); }, function(){}); } catch(e){ guide(false); }
      return;
    }
    guide(false);
  }
  function guide(already){
    if(!instEl){
      instEl = document.createElement('div'); instEl.className = 'spzi'; instEl.hidden = true;
      document.body.appendChild(instEl);
      instEl.addEventListener('click', function(e){
        if(e.target === instEl || e.target.closest('[data-x]')){ instEl.classList.remove('on'); setTimeout(function(){ instEl.hidden = true; }, 160); }
        var tb = e.target.closest('[data-pf]');
        if(tb){ instEl.__pf = tb.getAttribute('data-pf'); guide(false); }
      });
      document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && instEl && !instEl.hidden){ instEl.classList.remove('on'); instEl.hidden = true; } });
    }
    var pf = instEl.__pf || platform(), st = STEPS[pf];
    instEl.innerHTML = '<div class="spzi-box" role="dialog" aria-modal="true">' +
      '<button type="button" class="spzi-x" data-x aria-label="' + esc(T(TX.close)) + '">✕</button>' +
      '<div class="spzi-top"><img src="assets/icons/icon-192.png" alt="" width="56" height="56"><div><b>SPACEZ TERMINAL</b><span>' +
        esc(T(already ? TX.installed : B('Put the site on your home screen — opens full screen like an app, works offline for pages you have opened.', 'วางเว็บไว้บนหน้าจอโฮม เปิดเต็มจอเหมือนแอป และหน้าที่เคยเปิดแล้วดูได้แม้ไม่มีเน็ต'))) + '</span></div></div>' +
      (already ? '' :
      '<div class="spzi-tabs">' + ['ios', 'android', 'desk'].map(function(k){ return '<button type="button" data-pf="' + k + '" class="' + (k === pf ? 'on' : '') + '">' + esc(T(STEPS[k].t)) + '</button>'; }).join('') + '</div>' +
      '<ol class="spzi-steps">' + st.s.map(function(x, i){ return '<li><i>' + (i + 1) + '</i><span>' + esc(T(x)) + '</span></li>'; }).join('') + '</ol>') +
      '</div>';
    instEl.hidden = false;
    requestAnimationFrame(function(){ instEl.classList.add('on'); });
  }
  window.__SPZ_INSTALL = installApp;

  /* an "Install app" row at the end of the SPACEZ apps pop-up (part-86 repaints it, so re-add when it changes) */
  function paintAppsInstall(){
    var pop = document.querySelector('.spz-apps-pop');
    if(!pop) return;
    var row = pop.querySelector('.spzq-appinst');
    if(isStandalone()){ if(row) row.remove(); return; }
    if(!row){
      row = document.createElement('button'); row.type = 'button'; row.className = 'spzq-appinst';
      row.addEventListener('click', function(){ var w = pop.closest('.spz-apps'); if(w) w.classList.remove('open'); installApp(); });
      pop.appendChild(row);
    }
    row.innerHTML = ICO.dl + '<span>' + esc(T(TX.install)) + '</span>';
  }
  var ta = 0, iva = setInterval(function(){
    var pop = document.querySelector('.spz-apps-pop');
    if(pop){ clearInterval(iva); paintAppsInstall(); new MutationObserver(function(){ if(!pop.querySelector('.spzq-appinst')) paintAppsInstall(); }).observe(pop, { childList:true }); }
    else if(++ta > 80) clearInterval(iva);
  }, 300);
  /* ---------------- 2026-11-16: search opens on hover (mouse) ---------------- */
  (function(){
    var t = 0;
    document.addEventListener('pointerout', function(e){
      var b = e.target && e.target.closest && e.target.closest('.spzq-btn');
      if(b && (!e.relatedTarget || !b.contains(e.relatedTarget))) clearTimeout(t);
    });
    /* 2026-11-17 (user request): a search opened only by hovering is a "peek" — it closes again when the pointer leaves the
       button and the search box. Clicking the button, clicking inside the box or typing keeps it open (then Esc, the ✕
       button or a click outside closes it, as before). */
    var peek = false, pt = 0;
    var oldOpen = open;
    function unpeek(){ peek = false; clearTimeout(pt); if(ov) ov.classList.remove('peek'); }
    document.addEventListener('pointerover', function(e){
      var b = e.target && e.target.closest && e.target.closest('.spzq-btn');
      if(!b || e.pointerType !== 'mouse') return;
      clearTimeout(t); t = setTimeout(function(){ if(!ov || ov.hidden){ oldOpen(); peek = true; ov.classList.add('peek'); } }, 260);
    }, true);
    document.addEventListener('pointermove', function(e){
      if(!peek || !ov || ov.hidden || e.pointerType !== 'mouse') return;
      var inside = e.target && e.target.closest && (e.target.closest('.spzq-box') || e.target.closest('.spzq-btn'));
      if(inside){ clearTimeout(pt); return; }
      clearTimeout(pt); pt = setTimeout(function(){ if(peek) { close(); unpeek(); } }, 380);
    }, { passive:true });
    document.addEventListener('pointerdown', function(e){
      if(!peek) return;
      if(e.target && e.target.closest && (e.target.closest('.spzq-box') || e.target.closest('.spzq-btn'))) unpeek();
    }, true);
    document.addEventListener('keydown', function(e){ if(peek && ov && !ov.hidden && e.key !== 'Escape') unpeek(); }, true);
    document.documentElement.addEventListener('mouseleave', function(){ if(peek){ close(); unpeek(); } });
  })();

  /* ---------------- 2026-11-16: bottom-right dock (sign-in + system status) ----------------
     User request: more life when the pointer comes near them, and a little panel of their own.
     Hover (mouse only) shows a glass preview card above the button; click still opens the full
     sign-in gate / status panel exactly as before. */
  (function(){
    if(!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var card = null, hideT = 0, cur = null;
    var TIERN = { full:B('Admin', 'แอดมิน'), editor:B('Editor', 'Editor'), member:B('Member', 'สมาชิก'), basic:B('Visitor', 'ผู้เยี่ยมชม') };
    function tier(){ try { return window.__SPZ_TIER ? window.__SPZ_TIER() : 'basic'; } catch(e){ return 'basic'; } }
    function reviewer(){ try { return sessionStorage.getItem('spz.role') === 'reviewer'; } catch(e){ return false; } }
    function ago(ts){ var m = Math.round((Date.now() - ts) / 60000); if(!isFinite(m)) return ''; if(m < 1) return T(B('just now', 'เมื่อสักครู่')); if(m < 60) return m + T(B(' min ago', ' นาทีที่แล้ว')); var h = Math.round(m / 60); return h + T(B(' h ago', ' ชม.ที่แล้ว')); }
    function loginHTML(){
      var tr = tier(), name = tr === 'editor' && reviewer() ? B('Reviewer', 'ผู้ประเมิน') : TIERN[tr] || TIERN.basic, inn = tr !== 'basic';
      return '<div class="spzd-h"><i class="' + (inn ? 'ok' : '') + '"></i><b>' + esc(T(inn ? B('Signed in', 'เข้าสู่ระบบแล้ว') : B('Sign in', 'เข้าสู่ระบบ'))) + '</b><span>' + esc(T(name)) + '</span></div>' +
        '<p>' + esc(T(inn ? B('Open your panel: shortcuts, Market Brain, sign out.', 'เปิดแผงของคุณ: ทางลัด สมองตลาด และออกจากระบบ') : B('Unlock the analysis pages and save your watchlist.', 'ปลดล็อกหน้าวิเคราะห์ และบันทึกหุ้นที่ติดตามไว้'))) + '</p>' +
        (inn ? '' : '<div class="spzd-chips">' + ['LINE', 'Telegram', 'Google', 'Editor', T(B('Reviewer', 'ผู้ประเมิน')), T(B('Admin', 'แอดมิน'))].map(function(x){ return '<em>' + esc(x) + '</em>'; }).join('') + '</div>') +
        '<div class="spzd-go">' + esc(T(B('Click to open', 'คลิกเพื่อเปิด'))) + ' →</div>';
    }
    function statusHTML(){
      var dot = document.querySelector('.sysx-trig-dot'), h = dot ? (/\bbad\b/.test(dot.className) ? 'bad' : /\bwarn\b/.test(dot.className) ? 'warn' : 'ok') : 'ok';
      var snap = null; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
      var gt = snap && snap.generated_at ? Date.parse(snap.generated_at) : NaN, ok = navigator.onLine !== false;
      var lab = { ok:B('All systems normal', 'ระบบทำงานปกติ'), warn:B('Some data is late', 'ข้อมูลบางส่วนมาช้า'), bad:B('A data source has a problem', 'แหล่งข้อมูลบางตัวมีปัญหา') }[h];
      return '<div class="spzd-h"><i class="' + (h === 'ok' ? 'ok' : h) + '"></i><b>' + esc(T(B('System status', 'สถานะระบบ'))) + '</b><span>' + esc(T(lab)) + '</span></div>' +
        '<ul class="spzd-l"><li><span>' + esc(T(B('Market data', 'ข้อมูลตลาด'))) + '</span><b>' + (isFinite(gt) ? esc(ago(gt)) : '–') + '</b></li>' +
        '<li><span>' + esc(T(B('Internet', 'อินเทอร์เน็ต'))) + '</span><b>' + esc(T(ok ? B('online', 'เชื่อมต่ออยู่') : B('offline', 'ออฟไลน์'))) + '</b></li>' +
        '<li><span>' + esc(T(B('App mode', 'โหมดแอป'))) + '</span><b>' + esc(T(isStandalone() ? B('installed', 'ติดตั้งแล้ว') : B('browser', 'เบราว์เซอร์'))) + '</b></li></ul>' +
        '<div class="spzd-go">' + esc(T(B('Click for the full report', 'คลิกเพื่อดูรายละเอียดทั้งหมด'))) + ' →</div>';
    }
    function show(btn, kind){
      if(!card){
        card = document.createElement('div'); card.className = 'spzd-card'; card.setAttribute('role', 'tooltip');
        card.addEventListener('mouseenter', function(){ clearTimeout(hideT); });
        card.addEventListener('mouseleave', function(){ hide(); });
        card.addEventListener('click', function(){ var b = cur; hide(true); if(b) b.click(); });
        document.body.appendChild(card);
      }
      clearTimeout(hideT);
      if(cur && cur !== btn) linger(cur);
      cur = btn;
      btn.classList.remove('spzd-fade');
      card.className = 'spzd-card k-' + kind;
      card.innerHTML = kind === 'login' ? loginHTML() : statusHTML();
      var r = btn.getBoundingClientRect();
      card.style.right = Math.max(10, window.innerWidth - r.right - 4) + 'px';
      card.style.bottom = (window.innerHeight - r.top + 12) + 'px';
      card.style.setProperty('--ax', Math.max(18, window.innerWidth - r.right + r.width / 2 - Math.max(10, window.innerWidth - r.right - 4)) + 'px');
      requestAnimationFrame(function(){ card.classList.add('on'); });
      btn.classList.add('spzd-hot');
    }
    /* 2026-11-17 (user request): the preview card sometimes stayed open after the pointer left. Now the card closes as soon
       as the pointer is off both the button and the card (a short 140 ms grace to cross the gap), a watchdog closes it if a
       mouseout was missed, and only the glowing ring stays a moment and fades out (.spzd-fade). */
    var fadeT = {};
    function linger(b){
      b.classList.remove('spzd-hot'); b.classList.add('spzd-fade');
      var k = b.id || 'sys'; clearTimeout(fadeT[k]);
      fadeT[k] = setTimeout(function(){ b.classList.remove('spzd-fade'); }, 1100);
    }
    function hide(now){
      clearTimeout(hideT);
      hideT = setTimeout(function(){ if(card) card.classList.remove('on'); if(cur) linger(cur); cur = null; }, now ? 0 : 140);
    }
    document.addEventListener('pointermove', function(e){
      if(!cur || !card || e.pointerType !== 'mouse') return;
      var t = e.target;
      if(cur.contains(t) || card.contains(t)){ clearTimeout(hideT); return; }
      var r = cur.getBoundingClientRect(), c = card.getBoundingClientRect(), x = e.clientX, y = e.clientY, P = 10;
      var inBox = function(q){ return x >= q.left - P && x <= q.right + P && y >= q.top - P && y <= q.bottom + P; };
      var inGap = x >= Math.min(r.left, c.left) - P && x <= Math.max(r.right, c.right) + P && y >= c.bottom - P && y <= r.top + P;
      if(inBox(r) || inBox(c) || inGap){ clearTimeout(hideT); return; }
      hide();
    }, { passive:true });
    window.addEventListener('scroll', function(){ if(cur) hide(true); }, { passive:true });
    window.addEventListener('blur', function(){ if(cur) hide(true); });
    document.documentElement.addEventListener('mouseleave', function(){ if(cur) hide(true); });
    document.addEventListener('mouseover', function(e){
      var b = e.target && e.target.closest && e.target.closest('#spzAdminTrigger, .sysx-trig');
      if(!b) return;
      if(cur === b){ clearTimeout(hideT); return; }
      show(b, b.id === 'spzAdminTrigger' ? 'login' : 'status');
    });
    document.addEventListener('mouseout', function(e){
      var b = e.target && e.target.closest && e.target.closest('#spzAdminTrigger, .sysx-trig');
      if(b && !(e.relatedTarget && (b.contains(e.relatedTarget) || (card && card.contains(e.relatedTarget))))) hide();
    });
    document.addEventListener('click', function(e){ if(card && cur && !card.contains(e.target)) hide(true); }, true);
  })();
})();
/* 2026-11-17 (b) — the page footer ("SPACEZ TERMINAL © 2026 — Educational Use Only · Back to Hub") must sit after every page.
   Some screens append their <section> to the end of <body>, which put them AFTER the footer, so on those pages the footer
   showed up at the top, right under the menu bar (user report on the Membership page). Keep the footer last. */
(function(){
  'use strict';
  function fix(){
    var f = document.querySelector('body > footer'); if(!f) return;
    var secs = document.querySelectorAll('body > section[data-route]'), last = secs[secs.length - 1];
    if(last && (f.compareDocumentPosition(last) & 4)) last.parentNode.insertBefore(f, last.nextSibling);
  }
  var busy = false;
  new MutationObserver(function(){ if(busy) return; busy = true; fix(); busy = false; }).observe(document.body, { childList:true });
  fix(); setTimeout(fix, 1500); setTimeout(fix, 5000);
})();
