/* ===================== SPACEZ PRINT REPORT v2 (2026-11-23) =====================
   Print Report (#/printreport, part-49):
   1) a new type chooser for the left panel — the current type as one card ("change ▾"), and when opened:
      four tabs (market reports / official documents / classroom / elsewhere) of cards with an icon,
      a title and one line on what it makes. The old row of plain buttons stays in the page (hidden)
      and the cards press those buttons, so part-49 keeps working the same way.
   2) four more report types, registered in window.__SPZ_PR_EXT (part-49 renders them before the
      admin-key gate because they only use data already on the page):
        brief   — Institutional Outlook Brief, now inline like the others (was an overlay, part-57)
        cycle   — economic cycle & sector rotation (SPZ_CYCLE, __SPZ_OUTLOOK, live sector flows)
        compare — 2–5 stocks side by side, 20 numbers, best in each row marked
        stock   — one-stock fact sheet: price, 52-week range, 1-year chart with 50/200-day lines,
                  key numbers and a plain-words summary
      Report codes (part-70 PR_CODES): BR, CY, CP, SF.
   3) the cards for the official documents open the letter module (part-98) on a group directly
      (letters, memos, certificates, announcements & orders, MOUs).
   Settings: localStorage spz.pr99.v1 (open tab, compare list, fact-sheet ticker). Styles: part-99.css. */
(function(){
  'use strict';
  if(window.__SPZ_PR99) return;
  var LS = 'spz.pr99.v1';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : (typeof o === 'string' ? o : (o[L()] || o.en || '')); }
  function I(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function isN(v){ return typeof v === 'number' && isFinite(v); }
  var S = { tab:'', open:0, cmp:['AAPL', 'MSFT', 'NVDA'], tk:'AAPL', q:'', q2:'' }, seen = false;
  try { var sv = JSON.parse(localStorage.getItem(LS) || 'null'); if(sv && typeof sv === 'object'){ if(Array.isArray(sv.cmp)) S.cmp = sv.cmp.filter(function(x){ return typeof x === 'string'; }).slice(0, 5); if(typeof sv.tk === 'string') S.tk = sv.tk; if(typeof sv.tab === 'string') S.tab = sv.tab; } } catch(e){}
  function save(){ try { localStorage.setItem(LS, JSON.stringify({ cmp:S.cmp, tk:S.tk, tab:S.tab })); } catch(e){} }
  S.open = S.tab ? 0 : 1; /* first visit: show the choices open */

  /* ---------------- line icons ---------------- */
  var IC = {
    pulse:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    gold:'<path d="M3 19h18"/><path d="M5 19l2.2-5h9.6L19 19"/><path d="M8.5 14l1.8-5h3.4l1.8 5"/>',
    star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    bubble:'<circle cx="9" cy="14.5" r="5"/><circle cx="16.5" cy="7.5" r="3"/><circle cx="18.2" cy="16" r="1.6"/>',
    brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.2A1.2 1.2 0 0110.2 4h3.6A1.2 1.2 0 0115 5.2V7M3 12.5h18"/>',
    cycle:'<path d="M20 12a8 8 0 01-14.6 4.5M4 12a8 8 0 0114.6-4.5"/><path d="M19 3.5v4h-4M5 20.5v-4h4"/>',
    compare:'<rect x="3" y="4" width="7.5" height="16" rx="1.6"/><rect x="13.5" y="4" width="7.5" height="16" rx="1.6"/><path d="M5.5 9h2.5M16 9h2.5M5.5 13h2.5M16 13h2.5M5.5 17h2.5M16 17h2.5"/>',
    sheet:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 17l2.2-2.6 1.8 1.5 2.5-3.4"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    memo:'<rect x="5" y="3.5" width="14" height="17.5" rx="2"/><path d="M9 3.5v3h6v-3M8.5 11h7M8.5 14.5h7M8.5 18h4.5"/>',
    seal:'<circle cx="12" cy="9" r="5.8"/><path d="M12 6.4l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/><path d="M8.6 13.8L7.2 21l4.8-2.4 4.8 2.4-1.4-7.2"/>',
    mega:'<path d="M3 10.5v3a1 1 0 001 1h2.5l6.5 4.5V5L6.5 9.5H4a1 1 0 00-1 1z"/><path d="M16.5 9a4.2 4.2 0 010 6M19 6.5a8 8 0 010 11"/>',
    hand:'<path d="M2.5 11.5L7 7l3.5 1.6L13 7l3 .5 5.5 5"/><path d="M7 11.5l4.4 4.4a1.4 1.4 0 002-2L11 11.5"/><path d="M13.4 13.9l1.3 1.3a1.4 1.4 0 002-2l-3-3"/><path d="M2.5 11.5L6 15M21.5 12.5L18 16"/>',
    bell:'<path d="M18 16.5V11a6 6 0 10-12 0v5.5L4 18.5h16z"/><path d="M10 21a2 2 0 004 0"/>',
    award:'<rect x="3" y="4" width="18" height="12.5" rx="1.6"/><path d="M7 8.2h10M7 11.4h6"/><circle cx="16" cy="16.5" r="2.6"/><path d="M14.6 18.7L14 22l2-1.1 2 1.1-.6-3.3"/>',
    check:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7.8 9l1.6 1.6L12.2 8M7.8 15l1.6 1.6 2.8-2.6M14.2 9.4h3M14.2 15.4h3"/>',
    grad:'<path d="M2 9.5L12 4.5l10 5-10 5z"/><path d="M6.2 11.6v4.6c0 1.6 2.6 3.3 5.8 3.3s5.8-1.7 5.8-3.3v-4.6M21 9.8v5.2"/>',
    brain:'<path d="M9.5 4.5A2.8 2.8 0 006.7 7.3 2.9 2.9 0 004.5 12a2.9 2.9 0 002.2 4.7 2.8 2.8 0 002.8 2.8H11V4.5z"/><path d="M14.5 4.5a2.8 2.8 0 012.8 2.8A2.9 2.9 0 0119.5 12a2.9 2.9 0 01-2.2 4.7 2.8 2.8 0 01-2.8 2.8H13V4.5z"/>',
    stack:'<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.6l9 4.8 9-4.8"/><path d="M3 16.6l9 4.8 9-4.8"/>',
    org:'<rect x="9" y="3" width="6" height="4.5" rx="1"/><rect x="2.5" y="16.5" width="6" height="4.5" rx="1"/><rect x="15.5" y="16.5" width="6" height="4.5" rx="1"/><path d="M12 7.5v4.5M5.5 16.5v-3h13v3"/>',
    pen:'<path d="M4 20l4.2-1L19.5 7.7a2.1 2.1 0 00-3-3L5.2 15.9z"/><path d="M14.5 6.7l2.8 2.8"/>',
    chev:'<path d="M6 9l6 6 6-6"/>'
  };
  function ico(k, c){ return '<svg class="' + (c || 'p99-svg') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }

  /* ---------------- the catalogue ---------------- */
  var TABS = [['mkt', I('Market reports', 'รายงานตลาด')], ['doc', I('Official documents', 'เอกสารทางการ')], ['cls', I('Classroom', 'ห้องเรียน')], ['go', I('Elsewhere', 'หน้าอื่น')]];
  function letterN(g){ var LT = window.__SPZ_LETTER; if(!LT || !LT.groups) return 0; var n = 0; LT.groups().forEach(function(x){ if(g.indexOf(x.id) >= 0) n += x.n; }); return n; }
  var CAT = [
    { g:'mkt', id:'market', btn:'typeMarket', ic:'pulse', t:I('Market summary', 'สรุปภาพรวมตลาด'), d:I('prices, cycle, top picks and money flow', 'ราคา วัฏจักร หุ้นเด่น และเงินไหล') },
    { g:'mkt', id:'gold', btn:'typeGold', ic:'gold', t:I('Gold analysis', 'วิเคราะห์ทองคำ'), d:I('gold against the dollar and real yields', 'ทองเทียบดอลลาร์และดอกเบี้ยที่แท้จริง') },
    { g:'mkt', id:'idea', btn:'typeIdea', ic:'star', t:I('Alpha stock ideas', 'หุ้นอัลฟ่า'), d:I('high-score names for this cycle phase', 'หุ้นคะแนนสูงตามช่วงวัฏจักร') },
    { g:'mkt', id:'bubble', btn:'typeBubble', ic:'bubble', t:I('Bubble report', 'รายงานฟองสบู่'), d:I('bubble score and what bursts first', 'คะแนนฟองสบู่ และอะไรมักแตกก่อน') },
    { g:'mkt', id:'brief', ext:1, ic:'brief', t:I('Institutional outlook brief', 'บรีฟภาพรวมเชิงสถาบัน'), d:I('11 cross-asset gauges, rotation, cycle', 'สัญญาณ 11 ตัว การหมุนของเงิน วัฏจักร') },
    { g:'mkt', id:'cycle', ext:1, nw:1, ic:'cycle', t:I('Economic cycle & rotation', 'วัฏจักรเศรษฐกิจ & การหมุนกลุ่ม'), d:I('phase, indicators, scenarios, sectors', 'ช่วงวัฏจักร ตัวชี้วัด ฉากทัศน์ กลุ่มอุตฯ') },
    { g:'mkt', id:'compare', ext:1, nw:1, ic:'compare', t:I('Stock comparison', 'เปรียบเทียบหุ้น'), d:I('2–5 stocks side by side, 20 numbers', 'เทียบหุ้น 2–5 ตัว 20 ตัวเลข') },
    { g:'mkt', id:'stock', ext:1, nw:1, ic:'sheet', t:I('Stock fact sheet', 'สรุปหุ้นรายตัว (Fact sheet)'), d:I('one stock: chart, numbers, plain words', 'หุ้นตัวเดียว: กราฟ ตัวเลข สรุปภาษาง่าย') },
    { g:'doc', id:'letter', sub:'ask', grps:['ask', 'invite', 'work', 'notice'], ic:'mail', t:I('Official letter', 'หนังสือภายนอก (จดหมายทางการ)'), d:I('requests, invitations, replies, thanks', 'ขอความอนุเคราะห์ เชิญ ตอบกลับ ขอบคุณ') },
    { g:'doc', id:'letter', sub:'memo', grps:['memo'], nw:1, ic:'memo', t:I('Internal memo', 'บันทึกข้อความ'), d:I('reports, approvals, tasks, meetings', 'รายงาน ขออนุมัติ มอบหมายงาน นัดประชุม') },
    { g:'doc', id:'letter', sub:'cert', grps:['cert'], nw:1, ic:'seal', t:I('Certificate letter', 'หนังสือรับรอง'), d:I('work, expert reviewer, course, speaker', 'การปฏิบัติงาน ผู้ทรงคุณวุฒิ ผ่านการเรียน วิทยากร') },
    { g:'doc', id:'letter', sub:'ann', grps:['ann'], nw:1, ic:'mega', t:I('Announcement & order', 'ประกาศ · คำสั่ง'), d:I('rules, privacy, results, appointments', 'หลักเกณฑ์ ความเป็นส่วนตัว ผลการแข่งขัน แต่งตั้ง') },
    { g:'doc', id:'letter', sub:'mou', grps:['mou'], nw:1, ic:'hand', t:I('MOU & agreements', 'บันทึกข้อตกลง (MOU · NDA)'), d:I('two parties, clauses and witnesses', 'สองฝ่าย ข้อตกลง และพยาน') },
    { g:'doc', id:'announcement', btn:'typeAnnouncement', ic:'bell', t:I('Announcement post', 'ประกาศ (โพสต์พร้อมรูป)'), d:I('a notice with pictures for members', 'ข่าวประกาศพร้อมรูปภาพ') },
    { g:'doc', id:'cert', btn:'typeCert', ic:'award', t:I('Certificate of achievement', 'เกียรติบัตร'), d:I('A4 certificate with serial and QR', 'เกียรติบัตร A4 มีเลขที่และ QR') },
    { g:'doc', id:'review', btn:'typeReview', ic:'check', t:I('Evaluation form', 'แบบประเมินผลงาน'), d:I('for lecturers and expert reviewers', 'สำหรับอาจารย์และผู้ทรงคุณวุฒิ') },
    { g:'cls', id:'eval', btn:'typeEval', ic:'grad', t:I('Student evaluation', 'ประเมินนักเรียน'), d:I('scores, skills and comments', 'คะแนน ทักษะ และความเห็น') },
    { g:'go', go:'#/brain', ic:'brain', t:I('Market Brain report', 'รายงานสมองตลาด'), d:I('opens the Market Brain — use its Print tab', 'เปิดสมองตลาด แล้วใช้แท็บพิมพ์ / PDF') },
    { g:'go', go:'#/journal', ic:'pen', t:I('Analysis · Before/After', 'บทวิเคราะห์ · Before/After'), d:I('print an analysis or how it turned out', 'พิมพ์บทวิเคราะห์ หรือผลก่อน–หลัง') },
    { g:'go', go:'#/printall', admin:1, ic:'stack', t:I('Print the whole site', 'พิมพ์ทั้งเว็บ'), d:I('every page in one document', 'ทุกหน้าในเอกสารเดียว') },
    { g:'go', go:'#/board', admin:1, ic:'org', t:I('Company structure', 'เอกสารโครงสร้างบริษัท'), d:I('org chart and founder control (A4)', 'ผังองค์กรและอำนาจผู้ก่อตั้ง (A4)') }
  ];
  var UI = {
    kind:I('Type of document', 'ประเภทเอกสาร'), change:I('Change', 'เปลี่ยน'), close:I('Close', 'ปิด'), nw:I('NEW', 'ใหม่'), kinds:I('kinds', 'แบบ'),
    pick:I('Pick what to make — the form and the preview change at once.', 'เลือกสิ่งที่ต้องการทำ แบบฟอร์มและตัวอย่างจะเปลี่ยนทันที'), open:I('Open', 'เปิด')
  };
  function tier(){ try { return window.__SPZ_TIER ? window.__SPZ_TIER() : ''; } catch(e){ return ''; } }
  function curType(){ var P = window.__SPZ_PR; return P ? P.type() : 'market'; }
  function letterGroup(){ try { var a = document.querySelector('[data-pr="ltWrap"] .pr-lt-grp.has'); return a ? a.getAttribute('data-lt-grp') : ''; } catch(e){ return ''; } }
  function curItem(){
    var t = curType();
    if(t === 'letter'){ var g = letterGroup(); for(var i = 0; i < CAT.length; i++) if(CAT[i].id === 'letter' && CAT[i].grps.indexOf(g) >= 0) return CAT[i]; }
    for(var j = 0; j < CAT.length; j++) if(CAT[j].id === t) return CAT[j];
    return CAT[0];
  }
  function isOn(c){ var t = curType(); if(c.id !== t) return false; if(t !== 'letter') return true; return c.grps.indexOf(letterGroup()) >= 0; }

  /* ---------------- chooser ---------------- */
  var host = null;
  function chooserHTML(){
    var cur = curItem(), tab = S.tab || cur.g;
    var h = '<button type="button" class="p99-cur g-' + cur.g + '" data-p99="toggle" aria-expanded="' + (S.open ? 'true' : 'false') + '">' +
      '<span class="p99-ic">' + ico(cur.ic) + '</span><span class="p99-ct"><small>' + esc(T(UI.kind)) + '</small><b>' + esc(T(cur.t)) + '</b><em>' + esc(T(cur.d)) + '</em></span>' +
      '<span class="p99-chg">' + esc(T(S.open ? UI.close : UI.change)) + ico('chev', 'p99-chev') + '</span></button>';
    h += '<div class="p99-pan"' + (S.open ? '' : ' hidden') + '><div class="p99-hint">' + esc(T(UI.pick)) + '</div><div class="p99-tabs" role="tablist">' + TABS.map(function(tb){
      var n = CAT.filter(function(c){ return c.g === tb[0] && (!c.admin || tier() === 'full'); }).length;
      return '<button type="button" role="tab" class="p99-tab g-' + tb[0] + (tab === tb[0] ? ' on' : '') + '" data-p99-tab="' + tb[0] + '">' + esc(T(tb[1])) + ' <i>' + n + '</i></button>'; }).join('') + '</div>';
    h += '<div class="p99-grid">' + CAT.filter(function(c){ return c.g === tab && (!c.admin || tier() === 'full'); }).map(function(c){
      var k = CAT.indexOf(c), n = c.grps ? letterN(c.grps) : 0;
      return '<button type="button" class="p99-card g-' + c.g + (isOn(c) ? ' on' : '') + (c.go ? ' go' : '') + '" data-p99-pick="' + k + '">' +
        '<span class="p99-ic">' + ico(c.ic) + '</span><span class="p99-ct"><b>' + esc(T(c.t)) + (c.nw ? '<i class="p99-new">' + esc(T(UI.nw)) + '</i>' : '') + '</b><em>' + esc(T(c.d)) + (n ? ' · ' + n + ' ' + esc(T(UI.kinds)) : '') + '</em></span>' +
        (c.go ? '<span class="p99-go">↗</span>' : '') + '</button>'; }).join('') + '</div></div>';
    return h;
  }
  function paintChooser(){ if(host) host.innerHTML = chooserHTML(); }
  function choose(c){
    if(c.go){ location.hash = c.go; return; }
    var P = window.__SPZ_PR; if(!P) return;
    S.open = 0; S.tab = c.g; save();
    if(c.id === 'letter'){ var LT = window.__SPZ_LETTER; if(LT && LT.openGroup) LT.openGroup(c.sub); if(P.type() === 'letter') P.repaint(true); else P.type('letter'); }
    else if(c.ext) P.type(c.id);
    else { var b = document.querySelector('#printreport [data-pr="' + c.btn + '"]'); if(b) b.click(); else P.type(c.id); }
    paintChooser();
    try { var top = host.getBoundingClientRect().top; if(top < 70) window.scrollBy({ top:top - 90, behavior:'smooth' }); } catch(e){}
  }
  function mount(){
    var ctl = document.querySelector('#printreport .pr-controls'); if(!ctl) return false;
    if(ctl.querySelector('.p99-ch')) return true;
    var old = ctl.querySelector('[data-pr="typeLbl"]'); old = old && old.closest('.pr-row');
    if(old) old.classList.add('p99-old');
    host = document.createElement('div'); host.className = 'p99-ch';
    ctl.insertBefore(host, ctl.firstChild);
    host.addEventListener('click', function(e){
      var t = e.target;
      if(t.closest('[data-p99="toggle"]')){ S.open = S.open ? 0 : 1; if(S.open && !S.tab) S.tab = curItem().g; paintChooser(); return; }
      var tb = t.closest('[data-p99-tab]'); if(tb){ S.tab = tb.getAttribute('data-p99-tab'); save(); paintChooser(); return; }
      var pk = t.closest('[data-p99-pick]'); if(pk){ var c = CAT[+pk.getAttribute('data-p99-pick')]; if(c) choose(c); }
    });
    paintChooser();
    return true;
  }
  (function boot(){ var n = 0; (function go(){ if(mount()) return; if(++n < 200) setTimeout(go, 300); })(); })();
  document.addEventListener('spz:prpaint', function(){ if(!mount()) return; paintChooser(); });
  document.addEventListener('spz:tier', function(){ paintChooser(); });
  new MutationObserver(function(){ paintChooser(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  /* the CEWA switch (part-70) changes what letters and the reviewer form print */
  document.addEventListener('spz:cred', function(){ var P = window.__SPZ_PR; if(P && /^(letter|review)$/.test(P.type()) && document.querySelector('#printreport')) P.repaint(false); });

  /* =================== shared helpers for the new types =================== */
  var FULL = null, FULL_WAIT = false;
  function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }
  function stocks(){ var s = snap(); return (s && s.stocks) || {}; }
  function row(tk){ var r = stocks()[tk]; if(!r) return null; if(!r.c && FULL && FULL[tk] && FULL[tk].c) r = Object.assign({}, r, { c:FULL[tk].c }); return r; }
  function needFull(cb){
    if(FULL || FULL_WAIT) return; FULL_WAIT = true;
    fetch('data/market.json', { cache:'no-cache' }).then(function(r){ return r.json(); }).then(function(j){ FULL = (j && j.stocks) || {}; FULL_WAIT = false; cb(); }).catch(function(){ FULL_WAIT = false; });
  }
  function nm(tk, r){ var n = String((r && r.name) || tk); if(n.indexOf(tk + '_') === 0) n = n.slice(tk.length + 1); return n.replace(/\s+/g, ' ').trim(); }
  function isTh(r){ return r && (r.cal === 'th' || r.ccy === 'THB'); }
  function f2(v, d){ return isN(v) ? v.toLocaleString('en-US', { minimumFractionDigits:d == null ? 2 : d, maximumFractionDigits:d == null ? 2 : d }) : '—'; }
  function px(v){ return isN(v) ? f2(v, v >= 1000 ? 0 : 2) : '—'; }
  function pc(v){ return isN(v) ? (v > 0 ? '+' : '') + v.toFixed(2) + '%' : '—'; }
  function pp(v){ return isN(v) ? v.toFixed(v >= 100 ? 0 : 1) + '%' : '—'; }
  function xx(v){ return isN(v) ? v.toFixed(v >= 100 ? 0 : 1) + (L() === 'th' ? ' เท่า' : '×') : '—'; }
  function cap(v, ccy){ if(!isN(v) || v <= 0) return '—'; var u = v >= 1e12 ? [1e12, 'T'] : v >= 1e9 ? [1e9, 'B'] : [1e6, 'M']; return (v / u[0]).toFixed(v / u[0] >= 100 ? 0 : 2) + u[1] + ' ' + (ccy || ''); }
  function cls(v){ return isN(v) ? (v >= 0 ? 'pr-up' : 'pr-down') : ''; }
  function secH(t){ return '<div class="pr-sec-h">' + esc(t) + '</div>'; }
  function note(t){ return '<div class="pr-flow-note">' + esc(t) + '</div>'; }
  function search(q, max){
    q = String(q || '').trim().toUpperCase(); if(!q) return [];
    var st = stocks(), out = [];
    Object.keys(st).forEach(function(tk){ var r = st[tk], n = nm(tk, r).toUpperCase(); var sc = tk === q ? 0 : tk.indexOf(q) === 0 ? 1 : n.indexOf(q) >= 0 ? 2 : tk.indexOf(q) > 0 ? 3 : 9; if(sc < 9) out.push([sc, tk]); });
    out.sort(function(a, b){ return a[0] - b[0] || (a[1] < b[1] ? -1 : 1); });
    return out.slice(0, max || 8).map(function(x){ return x[1]; });
  }

  /* =================== 1) Institutional Outlook Brief (inline) =================== */
  var BR = {
    sig:I('Gauge', 'ตัวชี้วัด'), val:I('Now', 'ค่าล่าสุด'), mean:I('What it says', 'ความหมาย'),
    state:{ ok:I('calm', 'ปกติ'), warn:I('watch', 'เฝ้าระวัง'), alert:I('alert', 'เตือน'), na:I('n/a', '—') },
    read:I('Count', 'นับรวม')
  };
  function briefHTML(c){
    var B = window.__SPZ_BRIEFING, d = B && B.data ? B.data() : null, lb = function(k){ return B && B.label ? B.label(k) : ''; };
    var meta = d && d.cycleLabel ? '<span>' + esc(lb('briefCycleLbl')) + ': ' + esc(d.cycleLabel) + '</span>' : '';
    var h = '<div class="pr-sheet p99s p99-brief" data-style="' + esc(c.styleId) + '">' + c.head(lb('briefTitle') || T(I('Institutional Outlook Brief', 'บรีฟภาพรวมเชิงสถาบัน')), lb('briefSub'), meta);
    if(!d) return h + '<div class="pr-empty">' + esc(lb('briefNoData') || T(I('Live data is still loading — try again in a few seconds.', 'ข้อมูลสดยังโหลดไม่เสร็จ ลองใหม่อีกครั้งในอีกสักครู่'))) + '</div>' + c.foot(lb('briefDisclaimer')) + '</div>';
    var cnt = { ok:0, warn:0, alert:0 }; d.rows.forEach(function(r){ if(cnt[r.state] != null) cnt[r.state]++; });
    h += secH(lb('briefReadH')) + '<div class="p99-call"><div class="p99-cnt"><span class="ok"><b>' + cnt.ok + '</b>' + esc(T(BR.state.ok)) + '</span><span class="warn"><b>' + cnt.warn + '</b>' + esc(T(BR.state.warn)) + '</span><span class="alert"><b>' + cnt.alert + '</b>' + esc(T(BR.state.alert)) + '</span></div><p>' + esc(d.verdict) + '</p></div>';
    h += secH(lb('briefSignalsH')) + '<table class="pr-table p99-sig"><thead><tr><th>' + esc(T(BR.sig)) + '</th><th>' + esc(T(BR.val)) + '</th><th>' + esc(T(BR.mean)) + '</th></tr></thead><tbody>' +
      d.rows.map(function(r){ return '<tr><td><i class="p99-dot ' + esc(r.state) + '"></i><b>' + esc(r.name) + '</b><span class="p99-st ' + esc(r.state) + '">' + esc(T(BR.state[r.state] || BR.state.na)) + '</span></td><td class="num">' + esc(r.valStr) + '</td><td class="pr-why">' + esc(r.msg) + '</td></tr>'; }).join('') + '</tbody></table>';
    function rot(list, up){ return list.map(function(s){ var n = (s.en || s.th) ? T({ en:s.en, th:s.th }) : (s.sym || '—'); return '<div class="p99-rot"><span>' + esc(n) + (s.sym ? ' <small>' + esc(s.sym) + '</small>' : '') + '</span><b class="' + (up ? 'pr-up' : 'pr-down') + '">' + pc(s.m1) + '</b></div>'; }).join(''); }
    if(d.leaders.length) h += secH(lb('briefRotH')) + '<div class="p99-2col"><div><div class="p99-lab up">' + esc(lb('briefLeading')) + '</div>' + rot(d.leaders, true) + '</div><div><div class="p99-lab dn">' + esc(lb('briefLagging')) + '</div>' + rot(d.laggards, false) + '</div></div>';
    if(d.phase) h += secH(lb('briefForwardH')) + note(lb('briefForwardNote')) + '<div class="p99-phase">' + esc(T(d.phase.n)) + '</div>' +
      '<div class="p99-2col"><div><div class="p99-lab up">' + esc(lb('briefPhaseLead')) + '</div><p class="p99-p">' + esc(T(d.phase.lead).join(' · ')) + '</p></div><div><div class="p99-lab dn">' + esc(lb('briefPhaseLag')) + '</div><p class="p99-p">' + esc(T(d.phase.lag).join(' · ')) + '</p></div></div>';
    return h + c.foot(lb('briefDisclaimer')) + c.qrPage() + '</div>';
  }

  /* =================== 2) Economic cycle & sector rotation =================== */
  var CY = {
    title:I('Economic cycle & sector rotation', 'รายงานวัฏจักรเศรษฐกิจและการหมุนเวียนกลุ่มอุตสาหกรรม'),
    sub:I('Where the economy is in its cycle, what the data says, and where money is moving', 'เศรษฐกิจอยู่ช่วงไหนของวัฏจักร ข้อมูลบอกอะไร และเงินกำลังไหลไปทางไหน'),
    nowH:I('1 · The phase now', '1 · ช่วงวัฏจักรตอนนี้'), conf:I('Confidence', 'ความมั่นใจ'), asof:I('Data as of', 'ข้อมูล ณ'),
    indH:I('2 · The indicators behind it', '2 · ตัวชี้วัดที่ใช้ตัดสิน'), ind:I('Indicator', 'ตัวชี้วัด'), v:I('Latest', 'ล่าสุด'), n:I('What it means', 'ความหมาย'),
    rotH:I('3 · Who usually leads in this phase', '3 · กลุ่มที่มักนำ / ตามในช่วงนี้'), lead:I('Usually leads', 'มักนำตลาด'), lag:I('Usually lags', 'มักตามหลัง'),
    flowH:I('4 · Where money actually moved (sector ETFs)', '4 · เงินหมุนไปทางไหนจริง (กองทุนรายกลุ่ม)'), sec:I('Sector', 'กลุ่ม'), w1:I('1 week', '1 สัปดาห์'), m1:I('1 month', '1 เดือน'), m3:I('3 months', '3 เดือน'), ma:I('vs 200-day', 'เทียบเส้น 200 วัน'),
    flowN:I('Price change of each sector fund — a proxy for where money is going, not fund-flow data.', 'การเปลี่ยนแปลงราคาของกองทุนแต่ละกลุ่ม ใช้แทนทิศทางเงิน ไม่ใช่ข้อมูลเงินไหลเข้าออกจริง'),
    drvH:I('5 · What drives it', '5 · แรงขับเคลื่อนหลัก'), scnH:I('6 · Scenarios and what to watch', '6 · ฉากทัศน์และสิ่งที่ต้องเฝ้าดู'), watch:I('Watch', 'สิ่งที่ต้องดู'),
    state:{ good:I('firm', 'แข็งแรง'), warn:I('watch', 'เฝ้าระวัง'), bad:I('weak', 'อ่อนแอ') }
  };
  function cycleHTML(c){
    var C = window.SPZ_CYCLE, O = window.__SPZ_OUTLOOK && window.__SPZ_OUTLOOK.data, s = snap();
    var live = (C && C.live) || 'mid', phases = (O && O.phases) || [], ph = null;
    phases.forEach(function(p){ if(p.id === live) ph = p; });
    var asof = C && C.asOfDisplay ? C.asOfDisplay() : '';
    var h = '<div class="pr-sheet p99s p99-cycle" data-style="' + esc(c.styleId) + '">' + c.head(T(CY.title), T(CY.sub), asof ? '<span>' + esc(T(CY.asof)) + ': ' + esc(asof) + '</span>' : '');
    h += secH(T(CY.nowH));
    if(ph){
      var cf = C && C.confidence ? C.confidence : null;
      h += '<div class="p99-cyc">' + phases.map(function(p){ return '<div class="p99-cy' + (p.id === live ? ' on' : '') + '"><b>' + esc(T(p.n)) + '</b><span>' + esc(T(p.s)) + '</span></div>'; }).join('') + '</div>' +
        '<div class="p99-call"><div class="p99-cnt"><span class="ok"><b>' + esc(T(ph.n)) + '</b></span>' + (cf ? '<span><b>' + cf.n + '/' + cf.of + '</b>' + esc(T(CY.conf)) + '</span>' : '') + '</div><p>' + esc(T(ph.d)) + '</p></div>';
    } else h += '<div class="pr-empty">—</div>';
    var ind = (O && O.ind) || [];
    if(ind.length){
      h += secH(T(CY.indH)) + (O.snapDate ? note(T(O.snapDate)) : '') + '<table class="pr-table"><thead><tr><th>' + esc(T(CY.ind)) + '</th><th>' + esc(T(CY.v)) + '</th><th>' + esc(T(CY.n)) + '</th></tr></thead><tbody>' +
        ind.map(function(r){ var k = r.k === 'good' ? 'ok' : r.k === 'bad' ? 'alert' : 'warn'; return '<tr><td><i class="p99-dot ' + k + '"></i><b>' + esc(T(r.l)) + '</b></td><td class="num"><b>' + esc(T(r.v)) + '</b></td><td class="pr-why">' + esc(T(r.n)) + '</td></tr>'; }).join('') + '</tbody></table>';
    }
    if(ph) h += secH(T(CY.rotH)) + '<div class="p99-2col"><div><div class="p99-lab up">' + esc(T(CY.lead)) + '</div><p class="p99-p">' + esc(T(ph.lead).join(' · ')) + '</p></div><div><div class="p99-lab dn">' + esc(T(CY.lag)) + '</div><p class="p99-p">' + esc(T(ph.lag).join(' · ')) + '</p></div></div>';
    var fl = (s && s.flows && Array.isArray(s.flows.sector)) ? s.flows.sector.filter(function(x){ return x && isN(x.m1); }).slice() : [];
    if(fl.length){
      fl.sort(function(a, b){ return b.m1 - a.m1; });
      var mx = Math.max.apply(null, fl.map(function(x){ return Math.abs(x.m1); })) || 1;
      h += secH(T(CY.flowH)) + note(T(CY.flowN)) + '<table class="pr-table p99-flow"><thead><tr><th>' + esc(T(CY.sec)) + '</th><th>' + esc(T(CY.w1)) + '</th><th>' + esc(T(CY.m1)) + '</th><th></th><th>' + esc(T(CY.m3)) + '</th><th>' + esc(T(CY.ma)) + '</th></tr></thead><tbody>' +
        fl.map(function(x){ var w = Math.round(Math.abs(x.m1) / mx * 100); return '<tr><td><b>' + esc(T({ en:x.en, th:x.th })) + '</b> <small>' + esc(x.sym || '') + '</small></td><td class="num ' + cls(x.w1) + '">' + pc(x.w1) + '</td><td class="num ' + cls(x.m1) + '"><b>' + pc(x.m1) + '</b></td>' +
          '<td class="bar"><i class="' + (x.m1 >= 0 ? 'up' : 'dn') + '" style="width:' + w + '%"></i></td><td class="num ' + cls(x.m3) + '">' + pc(x.m3) + '</td><td class="num ' + cls(x.vs_ma200) + '">' + pc(x.vs_ma200) + '</td></tr>'; }).join('') + '</tbody></table>';
    }
    var dr = (O && O.drivers) || [];
    if(dr.length) h += secH(T(CY.drvH)) + dr.map(function(x){ return '<div class="p99-drv"><b>' + esc(T(x.t)) + '</b><p>' + esc(T(x.d)) + '</p></div>'; }).join('');
    var sc = (O && O.scen) || [];
    if(sc.length) h += secH(T(CY.scnH)) + '<div class="p99-scn">' + sc.map(function(x){ var w = T(x.w) || []; return '<div class="p99-sc ' + esc(x.c || '') + '"><small>' + esc(T(x.p)) + '</small><b>' + esc(T(x.t)) + '</b><p>' + esc(T(x.d)) + '</p>' +
      (w.length ? '<div class="p99-w"><span>' + esc(T(CY.watch)) + '</span><ul>' + w.map(function(z){ return '<li>' + esc(z) + '</li>'; }).join('') + '</ul></div>' : '') + '</div>'; }).join('') + '</div>';
    return h + c.foot((O && O.disc ? T(O.disc) + ' ' : '') + (O && O.src ? T(O.src) : '')) + c.qrPage() + '</div>';
  }

  /* =================== 3) Stock comparison =================== */
  var CP = {
    title:I('Stock comparison', 'รายงานเปรียบเทียบหุ้น'), sub:I('Side by side on the same 20 numbers — the best in each row is marked', 'เทียบกันด้วยตัวเลขชุดเดียวกัน 20 ตัว ตัวที่ดีที่สุดในแต่ละแถวมีเครื่องหมาย'),
    pickH:I('Stocks to compare (2–5)', 'หุ้นที่ต้องการเทียบ (2–5 ตัว)'), ph:I('Type a name or symbol, e.g. AAPL, PTT', 'พิมพ์ชื่อหรือสัญลักษณ์ เช่น AAPL, PTT'),
    sets:I('Ready-made sets', 'ชุดตัวอย่าง'), full:I('Up to 5 stocks — remove one to add another.', 'ได้สูงสุด 5 ตัว ลบออกก่อนแล้วค่อยเพิ่มตัวใหม่'), none:I('No stock found.', 'ไม่พบหุ้นที่ค้นหา'),
    need:I('Pick at least two stocks on the left.', 'เลือกหุ้นอย่างน้อย 2 ตัวทางด้านซ้าย'), metric:I('Number', 'ตัวเลข'), mixed:I('Prices are in each market’s own currency.', 'ราคาแสดงเป็นสกุลเงินของแต่ละตลาด'),
    sumH:I('In short', 'สรุปสั้น ๆ'), bestIn:I('best of the group in', 'ดีที่สุดในกลุ่มเรื่อง'), noBest:I('not the best in any row', 'ยังไม่เด่นที่สุดในแถวไหน'),
    tblH:I('The numbers', 'ตารางเปรียบเทียบ'), how:I('“Best” means higher for returns, profits and growth; lower for valuation, debt, volatility and the analyst rating. A number alone is not a reason to buy.', '“ดีที่สุด” หมายถึงสูงกว่าสำหรับผลตอบแทน กำไร การเติบโต และต่ำกว่าสำหรับราคาเทียบมูลค่า หนี้ ความผันผวน และคะแนนนักวิเคราะห์ ตัวเลขตัวเดียวไม่ใช่เหตุผลที่จะซื้อ')
  };
  var SETS = [[I('US big tech', 'บิ๊กเทคสหรัฐฯ'), ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN']], [I('Thai banks', 'ธนาคารไทย'), ['KBANK', 'SCB', 'BBL', 'KTB']], [I('Thai energy', 'พลังงานไทย'), ['PTT', 'PTTEP', 'GULF', 'OR']], [I('Consumer brands', 'แบรนด์ผู้บริโภค'), ['KO', 'PEP', 'CPALL']]];
  var MET = [
    { k:'price', l:I('Price', 'ราคา'), f:'px' },
    { k:'chg_pct', l:I('Today', 'วันนี้'), f:'pc', b:1, ns:1 },
    { k:'m1', l:I('1 month', '1 เดือน'), f:'pc', b:1, ns:1 },
    { k:'m3', l:I('3 months', '3 เดือน'), f:'pc', b:1, ns:1 },
    { k:'off_high', l:I('From the 52-week high', 'ห่างจุดสูงสุด 52 สัปดาห์'), f:'pc', b:1, ns:1 },
    { k:'vs_ma200', l:I('Against the 200-day average', 'เทียบเส้นเฉลี่ย 200 วัน'), f:'pc', b:1, ns:1 },
    { k:'rsi', l:I('RSI (14 days)', 'RSI (14 วัน)'), f:'n1' },
    { k:'pe', l:I('P/E', 'P/E'), f:'xx', b:-1, pos:1 },
    { k:'fpe', l:I('Forward P/E', 'Forward P/E'), f:'xx', b:-1, pos:1 },
    { k:'pb', l:I('P/BV', 'P/BV'), f:'xx', b:-1, pos:1 },
    { k:'roe', l:I('ROE', 'ROE'), f:'pp', b:1 },
    { k:'margin', l:I('Net profit margin', 'อัตรากำไรสุทธิ'), f:'pp', b:1 },
    { k:'rg', l:I('Revenue growth', 'รายได้เติบโต'), f:'pp', b:1 },
    { k:'eg', l:I('Earnings growth', 'กำไรเติบโต'), f:'pp', b:1 },
    { k:'de', l:I('Debt to equity', 'หนี้สินต่อทุน'), f:'n2', b:-1, pos:1 },
    { k:'div', l:I('Dividend yield', 'อัตราปันผล'), f:'pp', b:1 },
    { k:'up', l:I('To the analyst target', 'ถึงราคาเป้านักวิเคราะห์'), f:'pc', b:1, calc:function(r){ return isN(r.tgt) && isN(r.price) && r.price > 0 ? (r.tgt / r.price - 1) * 100 : null; } },
    { k:'rec', l:I('Analyst rating (1 buy … 5 sell)', 'คะแนนนักวิเคราะห์ (1 ซื้อ … 5 ขาย)'), f:'n2', b:-1, pos:1 },
    { k:'vol20', l:I('Volatility (20 days, a year)', 'ความผันผวน (20 วัน ต่อปี)'), f:'pp', b:-1, pos:1 },
    { k:'mcap', l:I('Market value', 'มูลค่าตลาด'), f:'cap' }
  ];
  function mv(m, r){ var v = m.calc ? m.calc(r) : r[m.k]; return isN(v) ? v : null; }
  function mfmt(m, v, r){ return m.f === 'px' ? px(v) + ' <small>' + esc(r.ccy || '') + '</small>' : m.f === 'pc' ? pc(v) : m.f === 'pp' ? pp(v) : m.f === 'xx' ? xx(v) : m.f === 'cap' ? cap(v, r.ccy) : m.f === 'n1' ? f2(v, 1) : f2(v, 2); }
  function cmpForm(){
    var res = search(S.q, 8);
    return '<div class="p99-f"><div class="pr-ev-h2" style="margin-top:0">' + esc(T(CP.pickH)) + '</div>' +
      '<div class="p99-picked">' + (S.cmp.length ? S.cmp.map(function(tk){ var r = stocks()[tk]; return '<button type="button" class="p99-pk" data-p99-del="' + esc(tk) + '"><b>' + esc(tk) + '</b><span>' + esc(r ? nm(tk, r) : '') + '</span><i>×</i></button>'; }).join('') : '') + '</div>' +
      '<input type="text" class="p99-q" data-p99-q="cmp" value="' + esc(S.q) + '" placeholder="' + esc(T(CP.ph)) + '" autocomplete="off" spellcheck="false">' +
      '<div class="p99-res" data-p99-res>' + resHTML(res, 'add', S.q) + '</div>' +
      (S.cmp.length >= 5 ? '<div class="pr-hint">' + esc(T(CP.full)) + '</div>' : '') +
      '<div class="p99-sets"><span>' + esc(T(CP.sets)) + '</span>' + SETS.map(function(s, i){ return '<button type="button" data-p99-set="' + i + '">' + esc(T(s[0])) + '</button>'; }).join('') + '</div></div>';
  }
  function resHTML(res, act, q){
    if(!String(q || '').trim()) return '';
    if(!res.length) return '<div class="pr-hint">' + esc(T(CP.none)) + '</div>';
    return res.map(function(tk){ var r = stocks()[tk]; return '<button type="button" class="p99-ri" data-p99-' + act + '="' + esc(tk) + '"><b>' + esc(tk) + '</b><span>' + esc(nm(tk, r)) + '</span><em>' + esc(isTh(r) ? 'TH' : 'US') + '</em></button>'; }).join('');
  }
  function cmpHTML(c){
    var list = S.cmp.filter(function(tk){ return stocks()[tk]; });
    var h = '<div class="pr-sheet p99s p99-cmp" data-style="' + esc(c.styleId) + '">' + c.head(T(CP.title) + (list.length ? ' · ' + list.join(' / ') : ''), T(CP.sub), '');
    if(list.length < 2) return h + '<div class="pr-empty">' + esc(T(CP.need)) + '</div>' + c.foot() + '</div>';
    var rows = list.map(function(tk){ return row(tk); }), best = {};
    MET.forEach(function(m){
      if(!m.b) return;
      var vals = rows.map(function(r){ var v = mv(m, r); return v != null && (!m.pos || v > 0) ? v : null; }), ok = vals.filter(function(v){ return v != null; });
      if(ok.length < 2) return;
      var t = m.b > 0 ? Math.max.apply(null, ok) : Math.min.apply(null, ok);
      best[m.k] = vals.map(function(v){ return v != null && v === t; });
    });
    var mixed = rows.some(isTh) && rows.some(function(r){ return !isTh(r); });
    /* summary first: one line per stock */
    h += secH(T(CP.sumH)) + '<div class="p99-cs">' + list.map(function(tk, i){
      var r = rows[i], wins = MET.filter(function(m){ return !m.ns && best[m.k] && best[m.k][i]; }).map(function(m){ return T(m.l); });
      return '<div class="p99-csi"><div class="t"><b>' + esc(tk) + '</b><span>' + esc(nm(tk, r)) + '</span><em>' + esc([r.sector, isTh(r) ? 'SET' : 'US'].filter(Boolean).join(' · ')) + '</em></div>' +
        '<div class="p"><b>' + px(r.price) + '</b> <small>' + esc(r.ccy || '') + '</small> <span class="' + cls(r.chg_pct) + '">' + pc(r.chg_pct) + '</span></div>' +
        '<p>' + (wins.length ? esc(T(CP.bestIn)) + ' <b>' + esc(wins.slice(0, 5).join(', ')) + '</b>' + (wins.length > 5 ? ' +' + (wins.length - 5) : '') : esc(T(CP.noBest))) + '</p></div>'; }).join('') + '</div>';
    h += secH(T(CP.tblH)) + (mixed ? note(T(CP.mixed)) : '') + '<table class="pr-table p99-cmpt"><thead><tr><th>' + esc(T(CP.metric)) + '</th>' + list.map(function(tk){ return '<th class="num">' + esc(tk) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      MET.map(function(m){ return '<tr><td>' + esc(T(m.l)) + '</td>' + rows.map(function(r, i){ var v = mv(m, r), b = best[m.k] && best[m.k][i]; return '<td class="num' + (b ? ' p99-best' : '') + ((m.f === 'pc') ? ' ' + cls(v) : '') + '">' + (v == null ? '—' : mfmt(m, v, r)) + (b ? '<i>★</i>' : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' + note(T(CP.how));
    return h + c.foot() + c.qrPage() + '</div>';
  }

  /* =================== 4) Stock fact sheet =================== */
  var SF = {
    title:I('Stock fact sheet', 'สรุปหุ้นรายตัว'), pickH:I('Which stock', 'เลือกหุ้น'), ph:I('Type a name or symbol, e.g. NVDA, CPALL', 'พิมพ์ชื่อหรือสัญลักษณ์ เช่น NVDA, CPALL'),
    none:I('Pick a stock on the left.', 'เลือกหุ้นทางด้านซ้าย'), price:I('Price', 'ราคา'), today:I('Today', 'วันนี้'), m1:I('1 month', '1 เดือน'), m3:I('3 months', '3 เดือน'),
    rangeH:I('52-week range', 'ช่วงราคา 52 สัปดาห์'), low:I('low', 'ต่ำสุด'), high:I('high', 'สูงสุด'),
    chartH:I('Price over about a year, with the 50- and 200-day averages', 'ราคาย้อนหลังราว 1 ปี พร้อมเส้นเฉลี่ย 50 และ 200 วัน'), loading:I('Loading the price history…', 'กำลังโหลดราคาย้อนหลัง…'),
    numH:I('Key numbers', 'ตัวเลขสำคัญ'), g1:I('Valuation', 'ราคาเทียบมูลค่า'), g2:I('Profitability', 'ความสามารถทำกำไร'), g3:I('Growth', 'การเติบโต'), g4:I('Health & risk', 'ฐานะและความเสี่ยง'), g5:I('Analysts', 'นักวิเคราะห์'),
    roa:I('ROA', 'ROA'), roic:I('ROIC', 'ROIC'), feg:I('Expected earnings growth', 'คาดการณ์กำไรเติบโต'), tgt:I('Average target', 'ราคาเป้าเฉลี่ย'),
    wordsH:I('In plain words', 'สรุปเป็นภาษาง่าย'), ma50:I('50-day', '50 วัน'), ma200:I('200-day', '200 วัน')
  };
  function sfForm(){
    var res = search(S.q2, 8), r = stocks()[S.tk];
    return '<div class="p99-f"><div class="pr-ev-h2" style="margin-top:0">' + esc(T(SF.pickH)) + '</div>' +
      (r ? '<div class="p99-picked"><span class="p99-pk one"><b>' + esc(S.tk) + '</b><span>' + esc(nm(S.tk, r)) + '</span></span></div>' : '') +
      '<input type="text" class="p99-q" data-p99-q="sf" value="' + esc(S.q2) + '" placeholder="' + esc(T(SF.ph)) + '" autocomplete="off" spellcheck="false">' +
      '<div class="p99-res" data-p99-res>' + resHTML(res, 'one', S.q2) + '</div>' +
      '<div class="p99-sets"><span>' + esc(T(CP.sets)) + '</span>' + ['NVDA', 'AAPL', 'MSFT', 'PTT', 'CPALL', 'KBANK', 'DELTA'].filter(function(tk){ return stocks()[tk]; }).map(function(tk){ return '<button type="button" data-p99-one="' + tk + '">' + tk + '</button>'; }).join('') + '</div></div>';
  }
  function avg(a, n, i){ if(i + 1 < n) return null; var s = 0; for(var k = i - n + 1; k <= i; k++) s += a[k]; return s / n; }
  function chartSVG(closes){
    var a = closes.slice(-252), W = 700, H = 210, pl = 44, pr = 10, pt = 10, pb = 20;
    var m50 = a.map(function(_, i){ var all = closes.length - a.length + i; return avg(closes, 50, all); }), m200 = a.map(function(_, i){ var all = closes.length - a.length + i; return avg(closes, 200, all); });
    var vals = a.concat(m50.filter(isN), m200.filter(isN)), lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = (hi - lo) * .06 || 1; lo -= pad; hi += pad;
    function X(i){ return pl + i / Math.max(1, a.length - 1) * (W - pl - pr); } function Y(v){ return pt + (hi - v) / (hi - lo) * (H - pt - pb); }
    function path(arr){ var d = '', on = false; arr.forEach(function(v, i){ if(!isN(v)){ on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); on = true; }); return d; }
    var grid = [0, .25, .5, .75, 1].map(function(f){ var v = lo + (hi - lo) * f, y = Y(v); return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#e3e6ea" stroke-width="1"/><text x="' + (pl - 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#777">' + px(v) + '</text>'; }).join('');
    var up = a[a.length - 1] >= a[0];
    return '<svg class="p99-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + grid +
      '<path d="' + path(m200) + '" fill="none" stroke="#9b6bd6" stroke-width="1.3" stroke-dasharray="4 3"/><path d="' + path(m50) + '" fill="none" stroke="#d69a2b" stroke-width="1.3"/>' +
      '<path d="' + path(a) + '" fill="none" stroke="' + (up ? '#0a7f45' : '#c81e4a') + '" stroke-width="1.8"/></svg>' +
      '<div class="p99-leg"><span><i style="background:' + (up ? '#0a7f45' : '#c81e4a') + '"></i>' + esc(T(SF.price)) + '</span><span><i style="background:#d69a2b"></i>' + esc(T(SF.ma50)) + '</span><span><i class="d" style="background:#9b6bd6"></i>' + esc(T(SF.ma200)) + '</span></div>';
  }
  function words(r){
    var th = L() === 'th', out = [];
    function w(en, tx){ out.push(th ? tx : en); }
    if(isN(r.vs_ma200)) r.vs_ma200 >= 0 ? w('The price is ' + pc(r.vs_ma200) + ' above its 200-day average — the long trend is still up.', 'ราคาอยู่เหนือเส้นเฉลี่ย 200 วัน ' + pc(r.vs_ma200) + ' แนวโน้มระยะยาวยังเป็นขาขึ้น')
      : w('The price is ' + pc(r.vs_ma200) + ' below its 200-day average — the long trend is weak.', 'ราคาอยู่ต่ำกว่าเส้นเฉลี่ย 200 วัน ' + pc(r.vs_ma200) + ' แนวโน้มระยะยาวอ่อนตัว');
    if(isN(r.vs_ma50)) r.vs_ma50 >= 0 ? w('In the short run it trades above the 50-day average.', 'ระยะสั้นราคายืนเหนือเส้นเฉลี่ย 50 วันได้') : w('In the short run it trades below the 50-day average.', 'ระยะสั้นราคายังอยู่ใต้เส้นเฉลี่ย 50 วัน');
    if(isN(r.rsi)) r.rsi >= 70 ? w('RSI ' + r.rsi.toFixed(0) + ' — hot; pullbacks are common from here.', 'RSI ' + r.rsi.toFixed(0) + ' ร้อนแรง มักมีการพักตัวจากระดับนี้') : r.rsi <= 30 ? w('RSI ' + r.rsi.toFixed(0) + ' — heavily sold; a bounce is possible but not certain.', 'RSI ' + r.rsi.toFixed(0) + ' ถูกขายมาก อาจเด้งได้แต่ไม่แน่นอน') : w('RSI ' + r.rsi.toFixed(0) + ' — neither hot nor cold.', 'RSI ' + r.rsi.toFixed(0) + ' อยู่ระดับกลาง ไม่ร้อนไม่เย็น');
    if(isN(r.pe) && isN(r.fpe) && r.pe > 0 && r.fpe > 0) r.fpe < r.pe ? w('Forward P/E (' + f2(r.fpe, 1) + ') is below today’s P/E (' + f2(r.pe, 1) + '): analysts expect profits to rise.', 'Forward P/E (' + f2(r.fpe, 1) + ') ต่ำกว่า P/E ปัจจุบัน (' + f2(r.pe, 1) + ') แปลว่านักวิเคราะห์คาดว่ากำไรจะเพิ่มขึ้น')
      : w('Forward P/E (' + f2(r.fpe, 1) + ') is above today’s P/E (' + f2(r.pe, 1) + '): profits are expected to fall.', 'Forward P/E (' + f2(r.fpe, 1) + ') สูงกว่า P/E ปัจจุบัน (' + f2(r.pe, 1) + ') แปลว่าคาดว่ากำไรจะลดลง');
    if(isN(r.roe)) r.roe >= 15 ? w('ROE ' + pp(r.roe) + ' — it earns well on its owners’ money.', 'ROE ' + pp(r.roe) + ' ทำกำไรจากเงินของผู้ถือหุ้นได้ดี') : r.roe < 8 ? w('ROE ' + pp(r.roe) + ' — returns on owners’ money are low.', 'ROE ' + pp(r.roe) + ' ผลตอบแทนต่อส่วนผู้ถือหุ้นค่อนข้างต่ำ') : null;
    if(isN(r.de)) r.de >= 2 ? w('Debt is high (' + f2(r.de) + '× equity).', 'หนี้ค่อนข้างสูง (' + f2(r.de) + ' เท่าของทุน)') : r.de <= .5 ? w('Debt is low (' + f2(r.de) + '× equity).', 'หนี้ต่ำ (' + f2(r.de) + ' เท่าของทุน)') : null;
    var up = isN(r.tgt) && isN(r.price) && r.price > 0 ? (r.tgt / r.price - 1) * 100 : null;
    if(up != null) w('The average analyst target is ' + px(r.tgt) + ' (' + pc(up) + ' from here).', 'ราคาเป้าเฉลี่ยของนักวิเคราะห์อยู่ที่ ' + px(r.tgt) + ' (' + pc(up) + ' จากราคาปัจจุบัน)');
    if(r.divergence === 'bearish') w('RSI shows a bearish divergence — momentum is fading while the price holds up.', 'RSI เกิด bearish divergence แรงส่งเริ่มอ่อนลงทั้งที่ราคายังยืนอยู่');
    else if(r.divergence === 'bullish') w('RSI shows a bullish divergence — selling pressure is fading.', 'RSI เกิด bullish divergence แรงขายเริ่มอ่อนลง');
    return out;
  }
  function sfHTML(c){
    var tk = S.tk, r = row(tk);
    var h = '<div class="pr-sheet p99s p99-sf" data-style="' + esc(c.styleId) + '">';
    if(!r) return h + c.head(T(SF.title), '', '') + '<div class="pr-empty">' + esc(T(SF.none)) + '</div>' + c.foot() + '</div>';
    h += c.head(tk + ' · ' + nm(tk, r), [r.sector, r.industry, isTh(r) ? T(I('Stock Exchange of Thailand', 'ตลาดหลักทรัพย์แห่งประเทศไทย')) : T(I('US market', 'ตลาดหุ้นสหรัฐฯ'))].filter(Boolean).join(' · '), '');
    h += '<div class="p99-tiles"><div><small>' + esc(T(SF.price)) + '</small><b>' + px(r.price) + '</b><em>' + esc(r.ccy || '') + '</em></div><div><small>' + esc(T(SF.today)) + '</small><b class="' + cls(r.chg_pct) + '">' + pc(r.chg_pct) + '</b></div>' +
      '<div><small>' + esc(T(SF.m1)) + '</small><b class="' + cls(r.m1) + '">' + pc(r.m1) + '</b></div><div><small>' + esc(T(SF.m3)) + '</small><b class="' + cls(r.m3) + '">' + pc(r.m3) + '</b></div></div>';
    if(isN(r.lo52) && isN(r.hi52) && r.hi52 > r.lo52){ var at = Math.max(0, Math.min(100, (r.price - r.lo52) / (r.hi52 - r.lo52) * 100));
      h += secH(T(SF.rangeH)) + '<div class="p99-rng"><span>' + esc(T(SF.low)) + ' <b>' + px(r.lo52) + '</b></span><div class="bar"><i style="left:' + at.toFixed(1) + '%"></i></div><span>' + esc(T(SF.high)) + ' <b>' + px(r.hi52) + '</b></span></div>'; }
    h += secH(T(SF.chartH));
    var cl = r.c ? String(r.c).split(',').map(Number).filter(isN) : [];
    if(cl.length > 20) h += '<div class="p99-chartbox">' + chartSVG(cl) + '</div>';
    else { h += '<div class="pr-empty">' + esc(T(SF.loading)) + '</div>'; needFull(function(){ c.repaint(); }); }
    function kv(l, v){ return '<tr><td>' + esc(T(l)) + '</td><td class="num"><b>' + v + '</b></td></tr>'; }
    var up = isN(r.tgt) && isN(r.price) && r.price > 0 ? (r.tgt / r.price - 1) * 100 : null;
    h += secH(T(SF.numH)) + '<div class="p99-kv">' +
      '<table class="pr-table"><thead><tr><th colspan="2">' + esc(T(SF.g1)) + '</th></tr></thead><tbody>' + kv(I('P/E', 'P/E'), xx(r.pe)) + kv(I('Forward P/E', 'Forward P/E'), xx(r.fpe)) + kv(I('P/BV', 'P/BV'), xx(r.pb)) + kv(I('Dividend yield', 'อัตราปันผล'), pp(r.div)) + kv(I('Market value', 'มูลค่าตลาด'), cap(r.mcap, r.ccy)) + '</tbody></table>' +
      '<table class="pr-table"><thead><tr><th colspan="2">' + esc(T(SF.g2)) + '</th></tr></thead><tbody>' + kv(I('ROE', 'ROE'), pp(r.roe)) + kv(SF.roa, pp(r.roa)) + kv(SF.roic, pp(r.roic)) + kv(I('Net profit margin', 'อัตรากำไรสุทธิ'), pp(r.margin)) + '</tbody></table>' +
      '<table class="pr-table"><thead><tr><th colspan="2">' + esc(T(SF.g3)) + '</th></tr></thead><tbody>' + kv(I('Revenue growth', 'รายได้เติบโต'), pp(r.rg)) + kv(I('Earnings growth', 'กำไรเติบโต'), pp(r.eg)) + kv(SF.feg, pp(r.feg)) + '</tbody></table>' +
      '<table class="pr-table"><thead><tr><th colspan="2">' + esc(T(SF.g4)) + '</th></tr></thead><tbody>' + kv(I('Debt to equity', 'หนี้สินต่อทุน'), isN(r.de) ? f2(r.de) : '—') + kv(I('Volatility (20 days, a year)', 'ความผันผวน (20 วัน ต่อปี)'), pp(r.vol20)) + kv(I('RSI (14 days)', 'RSI (14 วัน)'), isN(r.rsi) ? f2(r.rsi, 1) : '—') + '</tbody></table>' +
      '<table class="pr-table"><thead><tr><th colspan="2">' + esc(T(SF.g5)) + '</th></tr></thead><tbody>' + kv(SF.tgt, px(r.tgt) + (up != null ? ' <small class="' + cls(up) + '">' + pc(up) + '</small>' : '')) + kv(I('Rating (1 buy … 5 sell)', 'คะแนน (1 ซื้อ … 5 ขาย)'), isN(r.rec) ? f2(r.rec) : '—') + '</tbody></table></div>';
    var ws = words(r);
    if(ws.length) h += secH(T(SF.wordsH)) + '<ul class="p99-words">' + ws.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    return h + c.foot() + c.qrPage() + '</div>';
  }

  /* =================== the form events for compare / fact sheet =================== */
  function refreshRes(t, act, q){ var box = t.parentNode && t.parentNode.querySelector('[data-p99-res]'); if(box) box.innerHTML = resHTML(search(q, 8), act, q); }
  var EXT = window.__SPZ_PR_EXT = window.__SPZ_PR_EXT || {};
  EXT.brief = { label:function(){ return T(CAT[4].t); }, line:1, sheetHTML:briefHTML };
  EXT.cycle = { label:function(){ return T(CAT[5].t); }, line:1, sheetHTML:cycleHTML };
  EXT.compare = { label:function(){ return T(CAT[6].t); }, line:1, sheetHTML:cmpHTML, formHTML:cmpForm,
    handleInput:function(t){ if(t.getAttribute('data-p99-q') !== 'cmp') return false; S.q = t.value; refreshRes(t, 'add', S.q); return false; },
    handleClick:function(t){
      var a = t.closest('[data-p99-add]'); if(a){ var tk = a.getAttribute('data-p99-add'); if(S.cmp.indexOf(tk) < 0 && S.cmp.length < 5) S.cmp.push(tk); S.q = ''; save(); return 'form'; }
      var d = t.closest('[data-p99-del]'); if(d){ S.cmp = S.cmp.filter(function(x){ return x !== d.getAttribute('data-p99-del'); }); save(); return 'form'; }
      var s = t.closest('[data-p99-set]'); if(s){ var st = SETS[+s.getAttribute('data-p99-set')]; if(st){ S.cmp = st[1].filter(function(x){ return stocks()[x]; }).slice(0, 5); save(); } return 'form'; }
      return false; } };
  EXT.stock = { label:function(){ return T(CAT[7].t); }, line:1, sheetHTML:sfHTML, formHTML:sfForm,
    handleInput:function(t){ if(t.getAttribute('data-p99-q') !== 'sf') return false; S.q2 = t.value; refreshRes(t, 'one', S.q2); return false; },
    handleClick:function(t){ var a = t.closest('[data-p99-one]'); if(a){ S.tk = a.getAttribute('data-p99-one'); S.q2 = ''; save(); return 'form'; } return false; } };
  /* the live snapshot can arrive after the page: repaint a new type once it does */
  document.addEventListener('spz:snapshot', function(){ var P = window.__SPZ_PR; if(P && EXT[P.type()] && document.querySelector('#printreport')) P.repaint(true); });

  window.__SPZ_PR99 = { v:1, cat:CAT, open:function(id){ for(var i = 0; i < CAT.length; i++) if(CAT[i].id === id || (CAT[i].sub && CAT[i].sub === id)) return choose(CAT[i]); } };
})();
