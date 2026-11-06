/* =====================================================================
   SPACEZ EXAM ROOM + APPS (2026-11-07)
   User request: bring the old exam portal (index.html) into the Terminal.
   * #/exams  "Exam room" — CEWA International mock exams (one card per set,
     same browser-window chart cards + hover replay as the old portal), the
     IC Plain mock exams, a random-set button and a link to the Exam Arena.
     Opening a set is for admin + editor only (user choice); everyone else
     sees the room locked. Sets open in a new tab.
   * #/apps   "SPACEZ apps" — the other SPACEZ sites (tax calculator, IC
     licence guide, CEWA vocabulary, passphrase generator, the classic exam
     portal), each opening in a new tab. Public.
   ===================================================================== */
(function(){
  'use strict';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  var B = function(en, th){ return { en:en, th:th }; };
  function tier(){ try { return typeof window.__SPZ_TIER === 'function' ? window.__SPZ_TIER() : ''; } catch(e){ return ''; } }
  function allowed(){ var t = tier(); return t === 'full' || t === 'editor'; }

  /* set file names are scrambled so the list isn't plain text in the source (not real security: see CLAUDE.md) */
  var CEWA = (function(){ try { var k = 'spz-exam-room', b = atob('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'), o = ''; for(var i = 0; i < b.length; i++) o += String.fromCharCode(b.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return JSON.parse(o); } catch(e){ return []; } })();
  var IC = [1, 2, 3, 4, 5, 6];
  var APPS = [
    ['SPACEZ_TAX_TERMINAL.html', 'calc', B('Tax calculator', 'คำนวณภาษี'), B('Thai personal income tax, explained step by step and calculated for you.', 'ภาษีเงินได้บุคคลธรรมดา อธิบายทีละขั้น และคำนวณให้'), '#fbbf24'],
    ['IC_License.html', 'badge', B('IC licence guide', 'สอบใบอนุญาต IC'), B('Everything for the IC Plain exam: topics, summaries and practice.', 'ทุกอย่างสำหรับสอบ IC Plain: หัวข้อ สรุปเนื้อหา และแบบฝึก'), '#34d399'],
    ['SPACEZ_VOCAB_LAB.html', 'book', B('Exam vocabulary', 'คำศัพท์เตรียมสอบ'), B('CEWA terms in English and Thai, with flashcards.', 'ศัพท์ CEWA อังกฤษ-ไทย พร้อมแฟลชการ์ด'), '#a78bfa'],
    ['SPPG.html', 'key', B('Passphrase generator', 'ระบบสุ่มพาสเวิร์ด'), B('Strong, easy-to-remember passwords made on your own device.', 'สร้างรหัสผ่านที่แข็งแรงและจำง่าย บนเครื่องของคุณเอง'), '#22d3ee'],
    ['SPACEZ_EXAM_PORTAL.html', 'grid', B('Classic exam portal', 'หน้าข้อสอบแบบเดิม'), B('The original password-protected exam catalogue.', 'คลังข้อสอบแบบเดิมที่ใช้รหัสผ่าน'), '#f472b6']
  ];
  var IC_ = {
    calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4"/>',
    badge:'<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-3 5 3-1.5-8"/>',
    book:'<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    dice:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="16" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="16" cy="8" r="1.3"/><circle cx="8" cy="16" r="1.3"/>',
    trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    cewa:'<path d="M2 19 7 11 11 14 15 6 18 10 22 5"/>'
  };
  function ico(k){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC_[k] || '') + '</svg>'; }

  var TX = {
    eb:B('SPACEZ · Exam room', 'SPACEZ · ห้องสอบ'),
    h:B('Mock exams: CEWA International · IC Thailand', 'ทดลองสอบ CEWA International · IC Thailand'),
    p:B('Full-length, timed practice papers. Pick a set yourself, or let the room pick one for you. Each set opens in a new tab.', 'ข้อสอบจำลองเต็มชุด แบบจับเวลา เลือกชุดเอง หรือให้ระบบสุ่มให้ก็ได้ ทุกชุดเปิดในแถบใหม่'),
    tCewa:B('CEWA International', 'CEWA International'), tIc:B('IC Thailand (IC Plain)', 'IC Thailand (IC Plain)'), tMore:B('More', 'เพิ่มเติม'),
    cewaD:B('Elliott Wave International certification — timed practice papers.', 'ข้อสอบรับรอง Elliott Wave International — ฝึกทำแบบจับเวลา'),
    icD:B('Thai investment consultant licence (IC Plain) — 100 questions, 150 minutes, like the real exam.', 'ใบอนุญาตผู้แนะนำการลงทุนของไทย (IC Plain) — 100 ข้อ 150 นาที เหมือนสอบจริง'),
    sets:B('sets', 'ชุด'), set:B('Set', 'ข้อสอบชุดที่'), rnd:B('Random set', 'สุ่มข้อสอบ'), rndAll:B('all sets', 'ทุกชุด'), rndPage:B('this page', 'หน้านี้'),
    arena:B('Exam Arena', 'สนามสอบ CEWA'), arenaD:B('Random questions, ranked rounds and a leaderboard.', 'สุ่มข้อ แข่งจัดอันดับ และตารางคะแนน'),
    lockH:B('Admin and editor only', 'เฉพาะแอดมินและ Editor'), lockP:B('Log in as admin or editor to open the exam sets.', 'เข้าสู่ระบบเป็นแอดมินหรือ Editor เพื่อเปิดข้อสอบ'), login:B('Log in', 'เข้าสู่ระบบ'),
    open:B('Open', 'เปิด'), newTab:B('opens in a new tab', 'เปิดในแถบใหม่'),
    appsEb:B('SPACEZ · Apps', 'SPACEZ · รวมเว็บ'), appsH:B('All SPACEZ sites in one place', 'รวมทุกเว็บของ SPACEZ ในที่เดียว'), appsP:B('Each one opens in a new tab, so you never lose your place here.', 'ทุกเว็บเปิดในแถบใหม่ หน้านี้จะไม่หายไปไหน'),
    exams:B('Exam room', 'ห้องสอบ')
  };

  /* the same seeded "market" sparkline as the classic portal cards */
  function rng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function spark(n, salt){
    var r = rng(n * 7919 + (salt || 0)), N = 46, W = 300, H = 54, v = 0, pts = [];
    var drift = (r() - 0.42) * 0.9;
    for(var i = 0; i < N; i++){ v += drift + (r() - 0.5) * 2.4; pts.push(v); }
    var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts); if(hi - lo < 1) hi = lo + 1;
    var x = function(i){ return i / (N - 1) * W; }, y = function(p){ return 6 + (1 - (p - lo) / (hi - lo)) * (H - 22); };
    var up = pts[N - 1] >= pts[0], col = up ? '#3b82f6' : '#f97316', chg = (pts[N - 1] - pts[0]) / (Math.abs(lo) + 12) * 4.2;
    var line = pts.map(function(p, i){ return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p).toFixed(1); }).join(' ');
    var bars = ''; for(var b = 0; b < N; b += 2){ var bh = 3 + r() * 10; bars += '<rect x="' + (x(b) - 2).toFixed(1) + '" y="' + (H - bh).toFixed(1) + '" width="3.6" height="' + bh.toFixed(1) + '" class="vb"/>'; }
    var gid = 'ex' + n + '_' + (salt || 0);
    return { up:up, chg:chg, svg:'<svg class="ex-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".36"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
      '<line class="gl" x1="0" y1="14" x2="' + W + '" y2="14"/><line class="gl" x1="0" y1="28" x2="' + W + '" y2="28"/>' + bars +
      '<path class="ar" d="' + line + ' L' + W + ' ' + H + ' L0 ' + H + 'Z" fill="url(#' + gid + ')"/><path class="ln" d="' + line + '" stroke="' + col + '" pathLength="1"/>' +
      '<circle class="tp" cx="' + x(N - 1).toFixed(1) + '" cy="' + y(pts[N - 1]).toFixed(1) + '" r="2.2" fill="' + col + '"/><rect class="sc" x="-2" y="0" width="2" height="' + H + '" fill="' + col + '"/></svg>' };
  }
  function card(kind, n, href, ok){
    var d = spark(n, kind === 'ic' ? 77 : 0), name = kind === 'ic' ? 'IC_' + n : 'CEWA' + n, tag = ok ? 'a' : 'div';
    return '<' + tag + ' class="ex-card' + (ok ? '' : ' locked') + '"' + (ok ? ' href="' + esc(href) + '" target="_blank" rel="noopener"' : '') + ' data-n="' + n + '" style="animation-delay:' + ((n % 20) * 22) + 'ms">' +
      '<div class="ex-prev"><div class="ex-win"><div class="ex-bar"><i class="r"></i><i class="y"></i><i class="g"></i><span>spacez://' + esc(name.toLowerCase()) + '</span><u></u></div><div class="ex-body">' + d.svg + '</div></div></div>' +
      '<div class="ex-meter"><i></i></div>' +
      '<div class="ex-foot"><div><b>' + esc(name) + '</b><span>' + esc(T(TX.set)) + ' ' + n + '</span></div><em class="' + (d.up ? 'up' : 'dn') + '">' + (d.chg >= 0 ? '+' : '') + d.chg.toFixed(2) + '%</em></div>' +
      (ok ? '' : '<div class="ex-veil">' + ico('lock') + '</div>') + '</' + tag + '>';
  }

  var ST = { tab:'cewa', page:1 }, PER = 12;
  try { var sv = JSON.parse(sessionStorage.getItem('spz.exams') || '{}'); if(sv.tab) ST.tab = sv.tab; if(sv.page) ST.page = sv.page; } catch(e){}
  function save(){ try { sessionStorage.setItem('spz.exams', JSON.stringify(ST)); } catch(e){} }
  function list(){ return ST.tab === 'ic' ? IC.map(function(n){ return ['ic', n, 'IC_' + n + '.html']; }) : CEWA.map(function(s, i){ return ['cewa', i + 1, s + '.html']; }); }
  function examsHTML(){
    var ok = allowed(), L0 = list(), pages = Math.max(1, Math.ceil(L0.length / PER));
    if(ST.page > pages) ST.page = pages;
    var slice = L0.slice((ST.page - 1) * PER, ST.page * PER);
    var tabs = [['cewa', TX.tCewa, CEWA.length], ['ic', TX.tIc, IC.length]].map(function(t){ return '<button type="button" class="ex-tab' + (ST.tab === t[0] ? ' on' : '') + '" data-ex-tab="' + t[0] + '">' + esc(T(t[1])) + '<em>' + t[2] + '</em></button>'; }).join('');
    var pg = '';
    if(pages > 1){ for(var p = 1; p <= pages; p++) pg += '<button type="button" class="ex-pg' + (p === ST.page ? ' on' : '') + '" data-ex-page="' + p + '">' + p + '</button>'; pg = '<div class="ex-pgs"><button type="button" class="ex-pg" data-ex-page="' + Math.max(1, ST.page - 1) + '">‹</button>' + pg + '<button type="button" class="ex-pg" data-ex-page="' + Math.min(pages, ST.page + 1) + '">›</button></div>'; }
    return '<div class="ex-wrap"><div class="ex-hero"><div class="ex-logo">' + ico('cewa') + '</div><div><span class="ex-eb">' + esc(T(TX.eb)) + '</span><h1>' + esc(T(TX.h)) + '</h1><p>' + esc(T(TX.p)) + '</p></div>' +
        '<div class="ex-stats"><div><b>' + CEWA.length + '</b><span>CEWA</span></div><div><b>' + IC.length + '</b><span>IC</span></div></div></div>' +
      (ok ? '' : '<div class="ex-lock">' + ico('lock') + '<div><b>' + esc(T(TX.lockH)) + '</b><span>' + esc(T(TX.lockP)) + '</span></div><button type="button" class="ex-btn" data-ex-login="1">' + esc(T(TX.login)) + '</button></div>') +
      '<div class="ex-top"><div class="ex-rnd"><span class="ex-rico">' + ico('dice') + '</span><div><b>' + esc(T(TX.rnd)) + '</b><small>' + esc(ST.tab === 'ic' ? 'IC Thailand' : 'CEWA International') + ' · ' + L0.length + ' ' + esc(T(TX.sets)) + '</small></div><button type="button" class="ex-btn"' + (ok ? '' : ' disabled') + ' data-ex-rnd="all">' + esc(T(TX.rndAll)) + '</button><button type="button" class="ex-btn ghost"' + (ok ? '' : ' disabled') + ' data-ex-rnd="page">' + esc(T(TX.rndPage)) + '</button></div>' +
        '<button type="button" class="ex-arena" data-ex-go="arena"><span>' + ico('trophy') + '</span><div><b>' + esc(T(TX.arena)) + '</b><small>' + esc(T(TX.arenaD)) + '</small></div></button>' +
        '<button type="button" class="ex-arena apps" data-ex-go="apps"><span>' + ico('grid') + '</span><div><b>' + esc(T(B('SPACEZ apps', 'รวมเว็บ SPACEZ'))) + '</b><small>' + esc(T(B('Tax, IC guide, vocabulary…', 'ภาษี คู่มือ IC คำศัพท์…'))) + '</small></div></button></div>' +
      '<div class="ex-tabs">' + tabs + '<span class="ex-tabd">' + esc(T(ST.tab === 'ic' ? TX.icD : TX.cewaD)) + '</span></div>' +
      '<div class="ex-grid">' + slice.map(function(x){ return card(x[0], x[1], x[2], ok); }).join('') + '</div>' + pg + '</div>';
  }
  function appsHTML(){
    return '<div class="ex-wrap"><div class="ex-hero ap"><div class="ex-logo">' + ico('grid') + '</div><div><span class="ex-eb">' + esc(T(TX.appsEb)) + '</span><h1>' + esc(T(TX.appsH)) + '</h1><p>' + esc(T(TX.appsP)) + '</p></div></div>' +
      '<div class="ap-grid">' + APPS.map(function(a, i){ return '<a class="ap-card" href="' + a[0] + '" target="_blank" rel="noopener" style="--c:' + a[4] + ';animation-delay:' + (i * 60) + 'ms"><i>' + ico(a[1]) + '</i><b>' + esc(T(a[2])) + '</b><span>' + esc(T(a[3])) + '</span><em>' + esc(T(TX.newTab)) + ico('ext') + '</em></a>'; }).join('') +
      '<button type="button" class="ap-card" data-ex-go="exams" style="--c:#60a5fa;animation-delay:' + (APPS.length * 60) + 'ms"><i>' + ico('cewa') + '</i><b>' + esc(T(TX.exams)) + '</b><span>' + esc(T(TX.h)) + '</span><em>' + esc(T(B('inside this site', 'อยู่ในเว็บนี้'))) + '</em></button></div></div>';
  }
  var secE, secA;
  function paintE(){ if(secE) secE.innerHTML = examsHTML(); }
  function paintA(){ if(secA) secA.innerHTML = appsHTML(); }
  function replay(c){ var s = c.querySelector('.ex-spark'); if(!s) return; ['.ln', '.ar', '.sc'].forEach(function(q){ var e = s.querySelector(q); if(e){ e.style.animation = 'none'; void e.getBoundingClientRect(); e.style.animation = ''; } }); }
  function build(){
    if(!window.__spzAddRoute || document.getElementById('exams')) return !!document.getElementById('exams');
    secE = document.createElement('section'); secE.id = 'exams'; secE.className = 'ex-sec'; secE.setAttribute('data-route', 'exams');
    secA = document.createElement('section'); secA.id = 'apps'; secA.className = 'ex-sec'; secA.setAttribute('data-route', 'apps');
    var foot = document.querySelector('body > footer'); [secE, secA].forEach(function(s){ if(foot) document.body.insertBefore(s, foot); else document.body.appendChild(s); });
    window.__spzAddRoute({ id:'exams', after:'arena', t:B('Exam room — CEWA International · IC Thailand', 'ห้องสอบ — ทดลองสอบ CEWA International · IC Thailand'), d:B('Mock exam sets for CEWA International and IC Thailand (IC Plain), with a random-set button. Admin and editor only.', 'ข้อสอบจำลอง CEWA International และ IC Thailand (IC Plain) พร้อมปุ่มสุ่มชุด เฉพาะแอดมินและ Editor') });
    window.__spzAddRoute({ id:'apps', after:'exams', t:B('SPACEZ apps', 'รวมเว็บ SPACEZ'), d:B('Tax calculator, IC licence guide, exam vocabulary and more — each opens in a new tab.', 'คำนวณภาษี คู่มือสอบ IC คำศัพท์เตรียมสอบ และอื่นๆ เปิดในแถบใหม่') });
    paintE(); paintA();
    secE.addEventListener('click', function(ev){
      var t;
      if((t = ev.target.closest('[data-ex-tab]'))){ ST.tab = t.getAttribute('data-ex-tab'); ST.page = 1; save(); paintE(); return; }
      if((t = ev.target.closest('[data-ex-page]'))){ ST.page = +t.getAttribute('data-ex-page'); save(); paintE(); secE.querySelector('.ex-tabs').scrollIntoView({ behavior:'smooth', block:'start' }); return; }
      if((t = ev.target.closest('[data-ex-rnd]'))){ if(!allowed()) return; var L0 = list(), pool = t.getAttribute('data-ex-rnd') === 'page' ? L0.slice((ST.page - 1) * PER, ST.page * PER) : L0, pick = pool[Math.floor(Math.random() * pool.length)];
        var c = secE.querySelector('.ex-card[data-n="' + pick[1] + '"]'); if(c){ c.classList.add('pick'); setTimeout(function(){ c.classList.remove('pick'); }, 1400); }
        setTimeout(function(){ window.open(pick[2], '_blank', 'noopener'); }, c ? 650 : 0); return; }
      if((t = ev.target.closest('[data-ex-go]'))){ location.hash = '#/' + t.getAttribute('data-ex-go'); return; }
      if(ev.target.closest('[data-ex-login]')){ var g = document.getElementById('spzAdminTrigger'); if(g) g.click(); }
    });
    secA.addEventListener('click', function(ev){ var t = ev.target.closest('[data-ex-go]'); if(t) location.hash = '#/' + t.getAttribute('data-ex-go'); });
    secE.addEventListener('mouseover', function(ev){ var c = ev.target.closest('.ex-card'); if(c && !c.__h){ c.__h = 1; replay(c); c.addEventListener('mouseleave', function(){ c.__h = 0; }, { once:true }); } });
    new MutationObserver(function(){ paintE(); paintA(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    /* re-check access when the visitor logs in or out on this page */
    var last = allowed(); setInterval(function(){ var a = allowed(); if(a !== last){ last = a; paintE(); } }, 1500);
    return true;
  }
  var tries = 0, iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 300);
  /* ---------- 2026-11-07: SPACEZ apps as an icon button in the top bar, next to the guide pill (user request) ---------- */
  var appsBtn = null, appsPop = null;
  function paintAppsPop(){
    if(!appsPop) return;
    appsPop.innerHTML = '<div class="sab-h">' + esc(T(B('SPACEZ apps · open in a new tab', 'รวมเว็บ SPACEZ · เปิดในแถบใหม่'))) + '</div>' +
      APPS.map(function(a){ return '<a class="sab-i" href="' + a[0] + '" target="_blank" rel="noopener" style="--c:' + a[4] + '"><i>' + ico(a[1]) + '</i><span><b>' + esc(T(a[2])) + '</b><small>' + esc(T(a[3])) + '</small></span>' + ico('ext') + '</a>'; }).join('') +
      '<a class="sab-all" href="#/apps">' + esc(T(B('See all on one page', 'ดูทั้งหมดในหน้าเดียว'))) + ' →</a>';
    if(appsBtn){ var lab = T(B('SPACEZ apps', 'รวมเว็บ SPACEZ')); appsBtn.setAttribute('aria-label', lab); appsBtn.title = lab; }
  }
  function buildAppsBtn(){
    if(appsBtn) return true;
    var host = document.querySelector('.gmh-pill') || document.getElementById('langToggle');
    if(!host || !host.parentNode || !document.querySelector('.nav-cluster')) return false;
    var wrap = document.createElement('div'); wrap.className = 'spz-apps';
    appsBtn = document.createElement('button'); appsBtn.type = 'button'; appsBtn.className = 'spz-apps-btn';
    appsBtn.setAttribute('aria-haspopup', 'true'); appsBtn.setAttribute('aria-expanded', 'false');
    appsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="5" r="2.2"/><circle cx="12" cy="5" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="12" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/></svg>';
    appsPop = document.createElement('div'); appsPop.className = 'spz-apps-pop';
    wrap.appendChild(appsBtn); wrap.appendChild(appsPop);
    host.parentNode.insertBefore(wrap, host);
    function setOpen(on){ wrap.classList.toggle('open', on); appsBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); }
    appsBtn.addEventListener('click', function(e){ e.stopPropagation(); setOpen(!wrap.classList.contains('open')); });
    document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });
    appsPop.addEventListener('click', function(e){ if(e.target.closest('a')) setOpen(false); });
    paintAppsPop();
    new MutationObserver(paintAppsPop).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  var tb = 0, ivb = setInterval(function(){ if(buildAppsBtn() || ++tb > 80) clearInterval(ivb); }, 250);

})();

/* =====================================================================
   LIGHT-THEME READABILITY GUARD (2026-11-07)
   User report: in the white theme some text melts into the background.
   Most pages were drawn for the black theme first, with neon text colours.
   In the light theme only, this walks the text on the page you are looking
   at, works out the real background behind it, and if the contrast is too
   low it darkens that text's colour just enough (inline style, marked with
   data-spzlc so it is undone when you switch back to black).
   Gradient-filled text and text on images/gradients are left alone.
   ===================================================================== */
(function(){
  'use strict';
  var MARK = 'data-spzlc', busy = false, timer = null;
  function light(){ return document.documentElement.dataset.theme === 'light'; }
  function rgba(s){ var m = s && s.match(/rgba?\(([^)]+)\)/); if(!m) return null; var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  function lum(c){ var a = [0, 1, 2].map(function(k){ var v = c[k] / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
  function ratio(a, b){ var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var cache = null;
  function bgOf(el){
    if(cache.has(el)) return cache.get(el);
    var stack = [], e, res = null;
    for(e = el; e && e.nodeType === 1; e = e.parentElement){
      var cs = getComputedStyle(e);
      if(cs.backgroundImage && cs.backgroundImage !== 'none'){ res = 'skip'; break; }
      var c = rgba(cs.backgroundColor);
      if(c && c[3] > 0){ stack.push(c); if(c[3] >= 0.95) break; }
    }
    if(res !== 'skip'){
      var cb = stack.length && stack[stack.length - 1][3] >= 0.95 ? stack.pop().slice(0, 3) : [255, 255, 255];
      for(var i = stack.length - 1; i >= 0; i--){ var s = stack[i]; cb = [0, 1, 2].map(function(k){ return s[k] * s[3] + cb[k] * (1 - s[3]); }); }
      res = cb;
    }
    cache.set(el, res);
    return res;
  }
  function undo(){ document.querySelectorAll('[' + MARK + ']').forEach(function(el){ el.style.removeProperty('color'); el.removeAttribute(MARK); }); }
  function scopes(){ var a = Array.prototype.slice.call(document.querySelectorAll('section[data-route].route-on')); return a.length ? a : [document.body]; }
  function pass(){
    if(busy) return; busy = true;
    try {
      if(!light()){ undo(); return; }
      cache = new WeakMap();
      var roots = scopes().concat([document.querySelector('.top-fixed'), document.querySelector('.nav-pop')]).filter(Boolean), seen = new Set(), n = 0;
      roots.forEach(function(root){
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), t;
        while((t = w.nextNode()) && n < 4000){
          if(t.textContent.trim().length < 1) continue;
          var el = t.parentElement; if(!el || seen.has(el)) continue; seen.add(el); n++;
          if(el.closest('svg,canvas,.ex-win,.ex-prev,[data-nolc]')) continue;
          var cs = getComputedStyle(el);
          if(cs.visibility === 'hidden' || cs.display === 'none') continue;
          var fill = cs.webkitTextFillColor; if(fill && /rgba\(0, 0, 0, 0\)/.test(fill)) continue;
          var fg = rgba(cs.color); if(!fg || fg[3] < 0.3) continue;
          var bg = bgOf(el); if(bg === 'skip') continue;
          if(lum(bg) < 0.45) continue;                    /* dark box inside the light theme: its own colours are fine */
          var f = [0, 1, 2].map(function(k){ return fg[k] * fg[3] + bg[k] * (1 - fg[3]); });
          if(ratio(f, bg) >= 3.2) continue;
          var k = 1, c = f;
          while(k > 0.08 && ratio(c, bg) < 4.5){ k -= 0.08; c = f.map(function(v){ return v * k; }); }
          el.style.setProperty('color', 'rgb(' + c.map(Math.round).join(',') + ')', 'important');
          el.setAttribute(MARK, '1');
        }
      });
    } catch(e){} finally { busy = false; }
  }
  function soon(ms){ clearTimeout(timer); timer = setTimeout(pass, ms || 500); }
  new MutationObserver(function(){ if(light() || document.querySelector('[' + MARK + ']')) soon(450); })
    .observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
  new MutationObserver(function(){ soon(60); }).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme', 'lang'] });
  window.addEventListener('hashchange', function(){ soon(500); });
  soon(1500);
})();
