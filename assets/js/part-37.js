
(function(){
  'use strict';

  var STR = {
    en:{ eb:'System status', note:'What each part of this page is actually doing right now — not an investment signal.',
         quotes:'Price feed', quotesOk:'Live', quotesLoad:'Syncing…', quotesWarn:'Reference only — no live feed connected',
         funda:'Fundamentals data', fundaOk:'Synced', fundaWarn:'Not loaded yet',
         sync:'Auto-sync pipeline', syncOk:'Normal', syncWarn:'Delayed', syncBad:'Stale — data has gone old', syncNever:'Not connected yet',
         waveLive:'receiving live updates', waveWarn:'sync is running behind', waveBad:'no recent updates',
         setMkt:'SET (Thailand)', usMkt:'US markets', open:'Open now', closed:'Closed',
         closesAt:'Closes ', opensAt:'Opens ', atSfx:'', inSep:' · in ',
         lastLbl:'Last sync', never:'never', src:'source',
         clock:'Bangkok time now', trig:'System status', close:'Close',
         tickers:'Tracked tickers', tickersD:'from the latest data snapshot',
         online:'Online', offline:'Offline', conn:'Connection',
         localT:'Your device time', session:'This session', sessionD:'time since you opened this page',
         bubble:'Bubble Radar data', bubbleOk:'Updated', bubbleWarn:'Pending first run',
         bubbleNextToday:'next update today', bubbleNextTomorrow:'next update tomorrow',
         loginSys:'Login system (LINE / Telegram)', loginOk:'Normal', loginWarn:'Delayed', loginPending:'Syncing…',
         postSys:'Analysis log (Firebase)', postOk:'Normal', postWarn:'Delayed', postOff:'Not connected',
         sumNormal:'normal', grpFeeds:'Data feeds', hpTitle:'Overall health', hpPing:'Response time', hpPingD:'round trip to the site, live', hpLoad:'Page load', hpLoadD:'from opening to ready', grpFiles:'Data files — how fresh', filesD:'bar = age vs how often it should update · green fresh · amber late · red stale', fMarket:'Prices & stocks', fEcon:'Economic calendar', fBrain:'Market Brain', fBrainX:'Brain forecasts', fWf:'Long backtest', fBt:'Strategy backtest', every:'every', checking:'checking…', ms:'ms', grpMarkets:'Markets', grpSession:'Session & device' },
    th:{ eb:'สถานะระบบ', note:'แต่ละส่วนของหน้านี้ตอนนี้กำลังทำงานยังไงบ้าง — ไม่ใช่สัญญาณลงทุน',
         quotes:'ระบบราคาหุ้น', quotesOk:'สด', quotesLoad:'กำลังซิงก์…', quotesWarn:'ใช้ค่าอ้างอิง — ยังไม่ต่อราคาสด',
         funda:'ข้อมูลพื้นฐานบริษัท', fundaOk:'ซิงก์แล้ว', fundaWarn:'ยังไม่โหลด',
         sync:'ระบบซิงก์ข้อมูลอัตโนมัติ', syncOk:'ปกติ', syncWarn:'ล่าช้า', syncBad:'ข้อมูลค้าง', syncNever:'ยังไม่เชื่อมต่อ',
         waveLive:'กำลังรับข้อมูลสด', waveWarn:'ซิงก์ช้ากว่าปกติ', waveBad:'ไม่มีข้อมูลใหม่เข้ามา',
         setMkt:'ตลาดหุ้นไทย (SET)', usMkt:'ตลาดหุ้นสหรัฐฯ', open:'เปิดทำการอยู่', closed:'ปิดทำการ',
         closesAt:'ปิด ', opensAt:'เปิด ', atSfx:' น.', inSep:' · อีก ',
         lastLbl:'ซิงก์ล่าสุด', never:'ยังไม่มี', src:'แหล่งข้อมูล',
         clock:'เวลากรุงเทพฯ ตอนนี้', trig:'สถานะระบบ', close:'ปิด',
         tickers:'จำนวนหุ้นที่ติดตาม', tickersD:'จากข้อมูลสแนปช็อตล่าสุด',
         online:'ออนไลน์', offline:'ออฟไลน์', conn:'การเชื่อมต่อ',
         localT:'เวลาที่เครื่องคุณ', session:'เซสชันนี้', sessionD:'เวลาที่คุณเปิดหน้านี้มา',
         bubble:'ข้อมูลเรดาร์ฟองสบู่', bubbleOk:'อัปเดตแล้ว', bubbleWarn:'รอรอบแรก',
         bubbleNextToday:'อัปเดตรอบถัดไปวันนี้', bubbleNextTomorrow:'อัปเดตรอบถัดไปพรุ่งนี้',
         loginSys:'ระบบล็อกอิน (LINE / Telegram)', loginOk:'ปกติ', loginWarn:'ล่าช้า', loginPending:'กำลังซิงก์…',
         postSys:'ระบบบทวิเคราะห์ (Firebase)', postOk:'ปกติ', postWarn:'ล่าช้า', postOff:'ยังไม่เชื่อมต่อ',
         sumNormal:'ปกติ', grpFeeds:'ฟีดข้อมูล', hpTitle:'สุขภาพระบบรวม', hpPing:'ความเร็วตอบสนอง', hpPingD:'เวลาไป-กลับถึงเว็บ (สด)', hpLoad:'เวลาโหลดหน้า', hpLoadD:'ตั้งแต่เปิดจนพร้อมใช้', grpFiles:'ไฟล์ข้อมูล — สดแค่ไหน', filesD:'แท่ง = อายุข้อมูลเทียบรอบที่ควรอัปเดต · เขียว สด · เหลือง ช้า · แดง ค้าง', fMarket:'ราคาและหุ้น', fEcon:'ปฏิทินเศรษฐกิจ', fBrain:'สมองตลาด', fBrainX:'คาดการณ์สมองตลาด', fWf:'ทดสอบย้อนหลังยาว', fBt:'ทดสอบกลยุทธ์', every:'ทุก', checking:'กำลังเช็ก…', ms:'มิลลิวินาที', grpMarkets:'ตลาดหุ้น', grpSession:'เซสชันและอุปกรณ์' }
  };
  var WD_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MO_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var WD_TH = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  var MO_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function S(k){ return (STR[L()] || STR.en)[k] || ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }
  function pad2(n){ return (n < 10 ? '0' : '') + n; }

  function fmtWhen(ts){
    if(!ts) return S('never');
    var d = new Date(ts);
    return d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB',
      { hour12:false, day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  }
  function fmtHM(min){ return pad2(Math.floor(min / 60)) + ':' + pad2(min % 60); }

  function formatDur(mins){
    mins = Math.max(0, Math.round(mins));
    var h = Math.floor(mins / 60), m = mins % 60;
    if(L() === 'th') return h > 0 ? (h + ' ชม. ' + m + ' นาที') : (m + ' นาที');
    return h > 0 ? (h + 'h ' + m + 'm') : (m + 'm');
  }
  function formatElapsed(ageHours){
    var dur = formatDur(ageHours * 60);
    return L() === 'th' ? (dur + 'ที่แล้ว') : (dur + ' ago');
  }

  /* minutes until the next open, given the current weekday/minute-of-day
     and a market's open minute -- same tz-shift trick used by
     window.__SPZ_LIVE.marketStatus(), extended to compute how long
     until the state actually flips. Trading days: Mon-Fri. */
  function minsToOpen(dow, minOfDay, openMin){
    if(dow >= 1 && dow <= 5 && minOfDay < openMin) return openMin - minOfDay;
    var d = (dow + 1) % 7, daysAhead = 1;
    while(!(d >= 1 && d <= 5)){ d = (d + 1) % 7; daysAhead++; }
    return (1440 - minOfDay) + (daysAhead - 1) * 1440 + openMin;
  }
  function sessionInfo(){
    var now = new Date();
    var utcMs = now.getTime() + now.getTimezoneOffset() * 60000;

    var bkk = new Date(utcMs + 7 * 3600000);
    var bDow = bkk.getDay(), bMin = bkk.getHours() * 60 + bkk.getMinutes();
    var setOpenMin = 600, setCloseMin = 990;
    var setOpen = bDow >= 1 && bDow <= 5 && bMin >= setOpenMin && bMin <= setCloseMin;
    var setMins = setOpen ? (setCloseMin - bMin) : minsToOpen(bDow, bMin, setOpenMin);

    var mo = now.getUTCMonth();
    var etOffset = (mo >= 2 && mo <= 10) ? -4 : -5;
    var et = new Date(utcMs + etOffset * 3600000);
    var eDow = et.getDay(), eMin = et.getHours() * 60 + et.getMinutes();
    var usOpenMin = 570, usCloseMin = 960;
    var usOpen = eDow >= 1 && eDow <= 5 && eMin >= usOpenMin && eMin < usCloseMin;
    var usMins = usOpen ? (usCloseMin - eMin) : minsToOpen(eDow, eMin, usOpenMin);

    var lang = L();
    var dateStr = lang === 'th'
      ? (WD_TH[bDow] + ' ' + pad2(bkk.getDate()) + ' ' + MO_TH[bkk.getMonth()])
      : (WD_EN[bDow] + ', ' + pad2(bkk.getDate()) + ' ' + MO_EN[bkk.getMonth()]);

    return {
      set:{ open:setOpen, mins:setMins, atMin: setOpen ? setCloseMin : setOpenMin },
      us:{ open:usOpen, mins:usMins, atMin: usOpen ? usCloseMin : usOpenMin },
      bkkClock: pad2(bkk.getHours()) + ':' + pad2(bkk.getMinutes()) + ':' + pad2(bkk.getSeconds()),
      bkkDate: dateStr
    };
  }

  function row(dotCls, label, value, detail, extraHTML, wide){
    return '<div class="sysx-row' + (wide ? ' wide' : '') + '"><span class="sysx-dot ' + dotCls + '"></span>' +
      '<span class="sysx-body"><span class="sysx-l">' + esc(label) + '</span>' +
      '<span class="sysx-v">' + esc(value) + '</span>' +
      (detail ? '<span class="sysx-d">' + esc(detail) + '</span>' : '') +
      (extraHTML || '') +
      '</span></div>';
  }

  /* small line-icons for the three modal sections below -- plain <path>
     strokes only (no emoji), matching the site's other de-emoji'd icon
     work: bar-signal for feeds, a globe for markets, a clock for session. */
  var ICO_FEED = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 12v-2M5.5 12V7M9 12V4M12.5 12V2"/></svg>';
  var ICO_MKT  = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M8 1.3a6.7 6.7 0 100 13.4 6.7 6.7 0 000-13.4z"/><path d="M1.5 8h13M8 1.3c1.8 1.8 2.8 4.2 2.8 6.7s-1 4.9-2.8 6.7c-1.8-1.8-2.8-4.2-2.8-6.7s1-4.9 2.8-6.7z"/></svg>';
  var ICO_SESS = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z"/><path d="M8 4.5V8l3 1.8"/></svg>';
  function groupHead(icon, label){
    return '<div class="sysx-group-h">' + icon + '<span class="sysx-group-lbl">' + esc(label) + '</span><span class="sysx-group-line"></span></div>';
  }

  /* Bubble Radar's once-a-day CAPE/Buffett/margin-debt fetch, read the
     same way the top status bar reads it (window.__SPZ_BUBBLE, a
     public export from that module) - kept in sync with the same
     07:11 UTC cron scripts/fetch_bubble.py runs on. */
  function bubbleRowHTML(){
    var d = null;
    try { d = window.__SPZ_BUBBLE && window.__SPZ_BUBBLE.data && window.__SPZ_BUBBLE.data(); } catch(e){}
    var hasSignal = !!(d && ((d.cape && d.cape.value != null) ||
      (d.margin_debt && d.margin_debt.yoy_pct != null) || (d.buffett && d.buffett.value_pct != null)));
    var gen = (d && d.generated_at) ? Date.parse(d.generated_at) : NaN;

    var now = Date.now(), n = new Date();
    var next = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 7, 11, 0);
    if(next <= now) next += 24 * 3600 * 1000;
    var nd = new Date(next), td = new Date();
    var sameDay = nd.getFullYear() === td.getFullYear() && nd.getMonth() === td.getMonth() && nd.getDate() === td.getDate();
    var nextTime = nd.toLocaleTimeString(L() === 'th' ? 'th-TH' : 'en-GB', { hour12:false, hour:'2-digit', minute:'2-digit' });
    var det = (sameDay ? S('bubbleNextToday') : S('bubbleNextTomorrow')) + ' ' + nextTime;

    var cls = hasSignal ? 'ok' : 'warn';
    var val = hasSignal ? S('bubbleOk') : S('bubbleWarn');
    if(hasSignal && !isNaN(gen)) det = fmtWhen(gen) + ' · ' + det;
    return row(cls, S('bubble'), val, det);
  }

  /* 2026-11-07: live checks shown at the top of the modal — a response-time sparkline (HEAD request to
     this site every 3s while open), page-load time, and how fresh each data file is (Last-Modified). */
  var PING = [], FILES = null, lastFiles = 0, pingT = 0;
  var FLIST = [['data/market.json', 'fMarket', 0.5], ['data/econ.json', 'fEcon', 12], ['data/brain.json', 'fBrain', 12], ['data/brain_ext.json', 'fBrainX', 12], ['data/brain_wf.json', 'fWf', 12]];
  function doPing(){
    var t0 = performance.now();
    fetch('data/econ.json?ping=' + Date.now(), { method:'HEAD', cache:'no-store' }).then(function(){ PING.push(Math.round(performance.now() - t0)); }, function(){ PING.push(-1); }).then(function(){ if(PING.length > 24) PING.shift(); if(back && back.classList.contains('on')) paint(); });
  }
  function doFiles(){
    lastFiles = Date.now();
    /* each file's own "generated_at" (first bytes only, via a Range request) - the server's Last-Modified
       would only say when the site was last deployed. Prices come from the live feed's own sync time. */
    Promise.all(FLIST.map(function(f, i){
      if(i === 0){ try { var LV = window.__SPZ_LIVE, ag = LV && typeof LV.snapAgeH === 'function' ? LV.snapAgeH() : null; return Promise.resolve(ag == null ? null : Date.now() - ag * 3.6e6); } catch(e){ return Promise.resolve(null); } }
      return fetch(f[0] + '?h=' + Date.now(), { headers:{ Range:'bytes=0-299' }, cache:'no-store' }).then(function(r){ return r.ok ? r.text() : ''; }).then(function(t){ var m = /"generated_at"\s*:\s*"([^"]+)"/.exec(t || ''); var v = m ? Date.parse(m[1]) : NaN; return isNaN(v) ? null : v; }, function(){ return null; }); }))
      .then(function(v){ FILES = v; if(back && back.classList.contains('on')) paint(); });
  }
  function ringHTML(pctOk, cls){
    var r = 34, c = 2 * Math.PI * r, col = cls === 'bad' ? '#ff5c5c' : cls === 'warn' ? '#ffd24a' : '#7CFFB2';
    return '<svg class="sysx-ring" viewBox="0 0 84 84"><circle cx="42" cy="42" r="' + r + '" class="bg"/><circle cx="42" cy="42" r="' + r + '" class="fg" style="stroke:' + col + ';stroke-dasharray:' + (c * pctOk / 100).toFixed(1) + ' ' + c.toFixed(1) + '"/><text x="42" y="47">' + pctOk + '%</text></svg>';
  }
  function sparkHTML(){
    var v = PING.filter(function(x){ return x >= 0; }); if(v.length < 2) return '<div class="sysx-spark empty">' + esc(S('checking')) + '</div>';
    var mx = Math.max.apply(null, v.concat([120])), W = 160, H = 38, n = PING.length;
    var pts = PING.map(function(x, i){ return [(i / (n - 1)) * W, x < 0 ? H : H - 3 - (x / mx) * (H - 8)]; });
    var d = pts.map(function(q, i){ return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
    return '<svg class="sysx-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><path class="a" d="' + d + ' L' + W + ' ' + H + ' L0 ' + H + 'Z"/><path class="l" d="' + d + '"/><circle cx="' + pts[n - 1][0].toFixed(1) + '" cy="' + pts[n - 1][1].toFixed(1) + '" r="2.6"/></svg>';
  }
  function heroHTML(okN, totalN, cls){
    var v = PING.filter(function(x){ return x >= 0; }), last = v.length ? v[v.length - 1] : null, avg = v.length ? Math.round(v.reduce(function(a, b){ return a + b; }, 0) / v.length) : null;
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0], loadS = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd / 1000 : (nav && nav.domContentLoadedEventEnd ? nav.domContentLoadedEventEnd / 1000 : null);
    var pc = last == null ? '' : last < 150 ? 'ok' : last < 400 ? 'warn' : 'bad';
    return '<div class="sysx-hero"><div class="sysx-hc sysx-hcr">' + ringHTML(totalN ? Math.round(okN / totalN * 100) : 0, cls) + '<div><span class="sysx-l">' + esc(S('hpTitle')) + '</span><span class="sysx-v">' + okN + '/' + totalN + ' ' + esc(S('sumNormal')) + '</span></div></div>' +
      '<div class="sysx-hc"><span class="sysx-l">' + esc(S('hpPing')) + '</span><span class="sysx-big ' + pc + '">' + (last == null ? '—' : last) + '<small> ' + esc(S('ms')) + '</small></span>' + sparkHTML() + '<span class="sysx-d">' + esc(S('hpPingD')) + (avg != null ? ' · avg ' + avg : '') + '</span></div>' +
      '<div class="sysx-hc"><span class="sysx-l">' + esc(S('hpLoad')) + '</span><span class="sysx-big ' + (loadS == null ? '' : loadS < 3 ? 'ok' : loadS < 6 ? 'warn' : 'bad') + '">' + (loadS == null ? '—' : loadS.toFixed(1)) + '<small> s</small></span><div class="sysx-lbar"><i style="width:' + (loadS == null ? 0 : Math.min(100, loadS / 8 * 100)).toFixed(0) + '%"></i><u style="left:37.5%"></u><u style="left:75%"></u></div><span class="sysx-d">' + esc(S('hpLoadD')) + '</span></div></div>';
  }
  function filesHTML(){
    var rows = FLIST.map(function(f, i){
      var lm = FILES ? FILES[i] : undefined, ageH = lm ? (Date.now() - lm) / 3.6e6 : null, due = f[2], ratio = ageH == null ? 0 : ageH / due;
      var cls = ageH == null ? '' : ratio <= 1.5 ? 'ok' : ratio <= 4 ? 'warn' : 'bad', w = ageH == null ? 0 : Math.min(100, ratio / 4 * 100);
      return '<div class="sysx-fr"><span class="n">' + esc(S(f[1])) + '</span><div class="b"><i class="' + cls + '" style="width:' + w.toFixed(0) + '%"></i><u></u></div><span class="a ' + cls + '">' + (lm === undefined ? '…' : ageH == null ? '—' : formatElapsed(ageH)) + '</span><span class="e">' + esc(S('every')) + ' ' + (due < 1 ? formatDur(due * 60) : formatDur(due * 60)) + '</span></div>';
    }).join('');
    return '<div class="sysx-group">' + groupHead(ICO_FEED, S('grpFiles')) + '<div class="sysx-files">' + rows + '</div><div class="sysx-note" style="margin:6px 0 0">' + esc(S('filesD')) + '</div></div>';
  }
  var trig, back, root, tick;
  var BOOT_TS = Date.now();

  function health(){
    var LIVE = window.__SPZ_LIVE;
    var st = (LIVE && LIVE.state) || {};
    var age = (LIVE && typeof LIVE.snapAgeH === 'function') ? LIVE.snapAgeH() : null;
    var cls = 'warn';
    if(age !== null) cls = age <= 1 ? 'ok' : (age <= 3 ? 'warn' : 'bad');
    if(st.mode !== 'live' && cls === 'ok') cls = 'warn';
    return cls;
  }

  function paintTrig(){
    if(!trig) return;
    var dot = trig.querySelector('.sysx-trig-dot');
    if(dot) dot.className = 'sysx-trig-dot ' + health();
    trig.setAttribute('aria-label', S('trig'));
    trig.title = S('trig');
  }

  function paint(){
    if(!root) return;
    var LIVE = window.__SPZ_LIVE;
    var st = (LIVE && LIVE.state) || {};
    var age = (LIVE && typeof LIVE.snapAgeH === 'function') ? LIVE.snapAgeH() : null;
    var sess = sessionInfo();

    var qCls = 'warn', qVal = S('quotesWarn'), qDet = null;
    if(st.mode === 'live'){
      qCls = 'ok'; qVal = S('quotesOk');
      qDet = (st.qSrc && st.qSrc !== '—') ? (S('src') + ': ' + st.qSrc) : null;
    } else if(st.mode === 'loading'){
      qCls = 'warn'; qVal = S('quotesLoad');
    }

    var fCls = (st.mSrc && st.mSrc !== '—') ? 'ok' : 'warn';
    var fVal = fCls === 'ok' ? S('fundaOk') : S('fundaWarn');
    var fDet = fCls === 'ok' ? (S('src') + ': ' + st.mSrc) : null;

    var sCls = 'warn', sVal = S('syncNever'), sDet = null, waveLbl = S('waveWarn');
    if(age !== null){
      if(age <= 1){ sCls = 'ok'; sVal = S('syncOk'); waveLbl = S('waveLive'); }
      else if(age <= 3){ sCls = 'warn'; sVal = S('syncWarn'); waveLbl = S('waveWarn'); }
      else { sCls = 'bad'; sVal = S('syncBad'); waveLbl = S('waveBad'); }
      sDet = S('lastLbl') + ': ' + fmtWhen(st.last) + ' · ' + formatElapsed(age);
    }
    var waveHTML = '<div class="sysx-wave ' + (sCls === 'ok' ? '' : sCls) + '">' +
      '<i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<span class="sysx-wave-lbl">' + esc(waveLbl) + '</span>';

    /* Round T: two more backend health rows, read from the flags those
       modules already keep for their own purposes -- window.__SPZ_BACKEND_STATUS()
       (part-59.js's presence beacon, which already round-trips to the Worker
       on a timer) for the login system, window.__SPZ_FB_STATUS() (part-57.js)
       for the Firebase-backed analysis log. Both modules load after this one
       in the boot order but this popup only ever reads them lazily, inside
       paint()/health(), never at parse time, so there's no race to worry
       about -- worst case (this popup opened in the first ~1.5s of a page
       load) is a "syncing"/"pending" row for a moment. */
    var loginCls = 'warn', loginVal = S('loginWarn');
    try {
      var loginSt = window.__SPZ_BACKEND_STATUS ? window.__SPZ_BACKEND_STATUS() : 'pending';
      if(loginSt === 'ok'){ loginCls = 'ok'; loginVal = S('loginOk'); }
      else if(loginSt === 'pending'){ loginCls = 'info'; loginVal = S('loginPending'); }
      else { loginCls = 'warn'; loginVal = S('loginWarn'); }
    } catch(e){}

    var postCls = 'warn', postVal = S('postWarn');
    try {
      var postSt = window.__SPZ_FB_STATUS ? window.__SPZ_FB_STATUS() : 'unconfigured';
      if(postSt === 'ok'){ postCls = 'ok'; postVal = S('postOk'); }
      else if(postSt === 'unconfigured'){ postCls = 'info'; postVal = S('postOff'); }
      else { postCls = 'warn'; postVal = S('postWarn'); }
    } catch(e){}

    var tickerCount = null;
    try {
      var snap = (LIVE && typeof LIVE.snapshot === 'function') ? LIVE.snapshot() : null;
      if(snap && snap.counts && typeof snap.counts.stocks === 'number') tickerCount = snap.counts.stocks;
    } catch(e){}

    var isOnline = (typeof navigator !== 'undefined') ? navigator.onLine !== false : true;

    var localD = new Date();
    var localClock = pad2(localD.getHours()) + ':' + pad2(localD.getMinutes()) + ':' + pad2(localD.getSeconds());
    var lang0 = L();
    var localDate = lang0 === 'th'
      ? (WD_TH[localD.getDay()] + ' ' + pad2(localD.getDate()) + ' ' + MO_TH[localD.getMonth()])
      : (WD_EN[localD.getDay()] + ', ' + pad2(localD.getDate()) + ' ' + MO_EN[localD.getMonth()]);

    var sessionMin = (Date.now() - BOOT_TS) / 60000;

    function mktRow(label, info){
      var val = info.open ? S('open') : S('closed');
      var det = (info.open ? S('closesAt') : S('opensAt')) + fmtHM(info.atMin) + S('atSfx') +
        S('inSep') + formatDur(info.mins);
      return row(info.open ? 'mkt' : '', label, val, det);
    }

    /* overall-health summary bar: how many of the 4 real health signals
       (price feed, fundamentals, auto-sync, bubble radar) are currently
       ok/warn/bad -- market-open state and device/session info aren't
       "health", so they're excluded from this score. */
    var bubCls = 'warn';
    try {
      var bd = window.__SPZ_BUBBLE && window.__SPZ_BUBBLE.data && window.__SPZ_BUBBLE.data();
      var bHas = !!(bd && ((bd.cape && bd.cape.value != null) ||
        (bd.margin_debt && bd.margin_debt.yoy_pct != null) || (bd.buffett && bd.buffett.value_pct != null)));
      bubCls = bHas ? 'ok' : 'warn';
    } catch(e){}
    var healthCls = [qCls, fCls, sCls, bubCls];
    var okN = 0, warnN = 0, badN = 0;
    healthCls.forEach(function(c){ if(c === 'ok') okN++; else if(c === 'bad') badN++; else warnN++; });
    var totalN = healthCls.length;
    var pct = function(n){ return totalN ? Math.round(n / totalN * 100) : 0; };
    var summaryHTML =
      '<div class="sysx-summary"><div class="sysx-sumbar">' +
      '<span class="seg-ok" style="width:' + pct(okN) + '%"></span>' +
      '<span class="seg-warn" style="width:' + pct(warnN) + '%"></span>' +
      '<span class="seg-bad" style="width:' + pct(badN) + '%"></span>' +
      '</div><span class="sysx-sumtxt">' + okN + '/' + totalN + ' ' + esc(S('sumNormal')) + '</span></div>';

    var html =
      '<div class="sysx-top"><span class="sysx-eb">' + esc(S('eb')) + '</span>' +
      '<button type="button" class="sysx-x" aria-label="' + esc(S('close')) + '">&times;</button></div>' +
      '<div class="sysx-note">' + esc(S('note')) + '</div>' +
      heroHTML(okN, totalN, badN ? 'bad' : warnN ? 'warn' : 'ok') +
      summaryHTML +
      '<div class="sysx-group">' +
      groupHead(ICO_FEED, S('grpFeeds')) +
      '<div class="sysx-list">' +
      row(qCls, S('quotes'), qVal, qDet) +
      row(sCls, S('sync'), sVal, sDet, waveHTML) +
      row(fCls, S('funda'), fVal, fDet) +
      bubbleRowHTML() +
      row(loginCls, S('loginSys'), loginVal, null) +
      row(postCls, S('postSys'), postVal, null) +
      '</div></div>' +
      filesHTML() +
      '<div class="sysx-group">' +
      groupHead(ICO_MKT, S('grpMarkets')) +
      '<div class="sysx-list">' +
      mktRow(S('setMkt'), sess.set) +
      mktRow(S('usMkt'), sess.us) +
      row('info', S('clock'), sess.bkkClock, sess.bkkDate, null, true) +
      '</div></div>' +
      '<div class="sysx-group">' +
      groupHead(ICO_SESS, S('grpSession')) +
      '<div class="sysx-list">' +
      row(tickerCount !== null ? 'info' : 'warn', S('tickers'), tickerCount !== null ? String(tickerCount) : '—', S('tickersD')) +
      row(isOnline ? 'ok' : 'bad', S('conn'), isOnline ? S('online') : S('offline'), null) +
      row('info', S('localT'), localClock, localDate) +
      row('info', S('session'), formatDur(sessionMin), S('sessionD')) +
      '</div></div>';
    root.innerHTML = html;
    var xBtn = root.querySelector('.sysx-x');
    if(xBtn) xBtn.addEventListener('click', closePop);
    paintTrig();
  }

  function openPop(){
    if(!back) return;
    back.classList.add('on');
    if(Date.now() - lastFiles > 60000) doFiles();
    doPing(); if(pingT) clearInterval(pingT); pingT = setInterval(doPing, 3000);
    paint();
    if(tick) clearInterval(tick);
    tick = setInterval(paint, 1000);
    document.addEventListener('keydown', onKey);
  }
  function closePop(){
    if(!back) return;
    back.classList.remove('on');
    if(tick){ clearInterval(tick); tick = null; }
    if(pingT){ clearInterval(pingT); pingT = 0; }
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if(e.key === 'Escape') closePop(); }
  function toggle(){
    if(back && back.classList.contains('on')) closePop(); else openPop();
  }

  function build(){
    if(trig) return true;
    trig = document.createElement('button');
    trig.type = 'button';
    trig.className = 'sysx-trig';
    trig.innerHTML = '<span class="sysx-trig-ico"><i></i><i></i><i></i></span><span class="sysx-trig-dot"></span>';
    trig.addEventListener('click', toggle);
    document.body.appendChild(trig);

    back = document.createElement('div');
    back.className = 'sysx-back';
    var box = document.createElement('div');
    box.className = 'sysx-box';
    root = box;
    back.appendChild(box);
    back.addEventListener('click', function(e){ if(e.target === back) closePop(); });
    document.body.appendChild(back);

    paintTrig();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if(build() || ++tries > 40) clearInterval(iv);
    }, 400);

    setInterval(paintTrig, 20000);
    document.addEventListener('spz:snapshot', function(){ paintTrig(); if(back && back.classList.contains('on')) paint(); });
    document.addEventListener('spz:bubbleData', function(){ if(back && back.classList.contains('on')) paint(); });
    new MutationObserver(function(){ paintTrig(); if(back && back.classList.contains('on')) paint(); })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  else setTimeout(boot, 1500);
})();
