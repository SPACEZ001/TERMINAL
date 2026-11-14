/* =====================================================================
   SPACEZ LIVE OUTLOOK + LIVE SHOCK WATCH (2026-11-15)
   User request: Market Outlook 2026 (#/outlook) and the Market Shock
   Simulator (#/scenarios) were written by hand in August 2026 — make them
   update themselves.
   * Reads data/brain.json (public FRED series refreshed twice a day by the
     brain-data job) and the market snapshot (window.__SPZ_LIVE, every 30 min).
     Only raw public indicators are used here; nothing from the Market Brain's
     own model.
   * Outlook: a rule-of-thumb cycle reading (each rule shown on screen) sets
     SPZ_CYCLE.live, so every page that reads the cycle follows it; the
     indicator cards, the "data as of" line and each scenario's "what to
     watch" list are rebuilt from the latest numbers. The framework text and
     the narrative drivers stay as written (labelled as such).
   * Scenarios: a "what the data points at now" strip on top of the 18
     teaching shocks — each scenario that has a measurable trigger gets a
     heat level from live numbers, with the evidence, and a button to open it.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_LIVEOUT) return;
  window.__SPZ_LIVEOUT = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] != null ? o[L()] : o.en); }
  function B(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function isN(v){ return typeof v === 'number' && isFinite(v); }
  function f(v, d){ return isN(v) ? Number(v).toFixed(d == null ? 1 : d) : '–'; }
  function sg(v, d){ return isN(v) ? (v >= 0 ? '+' : '') + Number(v).toFixed(d == null ? 1 : d) : '–'; }
  var MTH = { en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], th:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'] };
  function mon(t){ var d = new Date(String(t || '') + 'T00:00:00Z'); if(isNaN(d)) return ''; return MTH[L()][d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function day(t){ var d = new Date(t); if(isNaN(d)) return ''; return d.getUTCDate() + ' ' + MTH[L()][d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }

  var BR = null, snap = null;
  function M(k){ return (BR && BR.macro && BR.macro[k]) || null; }
  function R(){ return (snap && snap.regime) || {}; }

  /* ------------------------------------------------------------------
     1. cycle reading — every rule is printed on the page
     ------------------------------------------------------------------ */
  function rules(){
    var gdp = M('gdp'), un = M('unrate'), pay = M('payrolls'), pce = M('core_pce'), cpi = M('cpi'), cur = M('t10y2y'), hy = M('hy'), ff = M('ff'), sent = M('sent'), oil = M('oil'), sahm = M('sahm');
    function v(o, k){ return o && isN(o[k || 'v']) ? o[k || 'v'] : null; }
    var payAvg = pay && isN(pay.v) && isN(pay.m1) && isN(pay.m3) ? (pay.v + pay.m1 + pay.m3) / 3 : null;
    var unD = v(un) != null && v(un, 'y1') != null ? Math.round((un.v - un.y1) * 100) / 100 : null;   /* rounded: 4.1 − 4.4 is −0.30000000000000027 in floating point */
    var oilY = v(oil) != null && v(oil, 'y1') ? (oil.v / oil.y1 - 1) * 100 : null;
    var real = v(ff) != null && v(pce) != null ? Math.round((ff.v - pce.v) * 100) / 100 : null;
    var R0 = [
      /* phase, test, label, value shown */
      ['rec', v(sahm) != null && sahm.v >= 0.5, B('Sahm rule ≥ 0.5 (jobless rate jumped)', 'กฎ Sahm ≥ 0.5 (คนว่างงานพุ่ง)'), f(v(sahm), 2)],
      ['rec', v(gdp) != null && gdp.v < 0, B('Real GDP shrinking', 'GDP จริงหดตัว'), f(v(gdp)) + '%'],
      ['rec', payAvg != null && payAvg < 0, B('Jobs falling (3-month average)', 'การจ้างงานลดลง (เฉลี่ย 3 เดือน)'), f(payAvg, 0) + 'k'],
      ['rec', unD != null && unD >= 0.8, B('Unemployment up ≥ 0.8 pt in a year', 'ว่างงานเพิ่ม ≥ 0.8 จุดใน 1 ปี'), sg(unD)],
      ['rec', v(hy) != null && hy.v >= 6, B('Credit spread ≥ 6% (stress)', 'ส่วนต่างหุ้นกู้เสี่ยง ≥ 6% (ตึงเครียด)'), f(v(hy), 2) + '%'],
      ['late', v(pce) != null && pce.v >= 3, B('Core inflation ≥ 3%', 'เงินเฟ้อพื้นฐาน ≥ 3%'), f(v(pce), 2) + '%'],
      ['late', v(cpi) != null && v(cpi, 'm3') != null && cpi.v > cpi.m3, B('Inflation rising vs 3 months ago', 'เงินเฟ้อสูงขึ้นจาก 3 เดือนก่อน'), f(v(cpi, 'm3'), 2) + ' → ' + f(v(cpi), 2) + '%'],
      ['late', v(cur) != null && cur.v < 0.5, B('Yield curve flat (10y − 2y < 0.5)', 'เส้นอัตราผลตอบแทนแบน (10ปี − 2ปี < 0.5)'), f(v(cur), 2)],
      ['late', real != null && real >= 1, B('Policy rate well above inflation (≥ 1 pt)', 'ดอกเบี้ยนโยบายสูงกว่าเงินเฟ้อ ≥ 1 จุด'), sg(real, 2)],
      ['late', unD != null && unD >= 0.3 && unD < 0.8, B('Unemployment creeping up', 'ว่างงานค่อยๆ เพิ่ม'), sg(unD)],
      ['late', v(sent) != null && v(sent, 'y1') != null && sent.v < sent.y1 - 5, B('Consumer mood clearly worse than a year ago', 'ความเชื่อมั่นผู้บริโภคแย่กว่าปีก่อนชัดเจน'), f(v(sent, 'y1'), 1) + ' → ' + f(v(sent), 1)],
      ['late', oilY != null && oilY >= 25, B('Oil up ≥ 25% in a year', 'น้ำมันขึ้น ≥ 25% ใน 1 ปี'), sg(oilY, 0) + '%'],
      ['early', unD != null && unD > 0 && v(un, 'm3') != null && un.v < un.m3, B('Jobless rate high but turning down', 'ว่างงานสูงแต่เริ่มลดลง'), f(v(un)) + '%'],
      ['early', v(ff) != null && v(ff, 'y1') != null && ff.y1 - ff.v >= 0.75, B('Fed has cut ≥ 0.75 pt in a year', 'เฟดลดดอกเบี้ย ≥ 0.75 จุดใน 1 ปี'), f(v(ff, 'y1'), 2) + ' → ' + f(v(ff), 2) + '%'],
      ['early', v(cur) != null && cur.v >= 1, B('Steep yield curve (≥ 1)', 'เส้นอัตราผลตอบแทนชัน (≥ 1)'), f(v(cur), 2)],
      ['early', v(gdp) != null && v(gdp, 'y1') != null && gdp.y1 < 1 && gdp.v > gdp.y1 + 1, B('GDP rebounding from weak', 'GDP เด้งกลับจากจุดอ่อน'), f(v(gdp, 'y1')) + ' → ' + f(v(gdp)) + '%'],
      ['mid', v(gdp) != null && gdp.v >= 1.5 && gdp.v <= 4, B('Real GDP growing 1.5–4%', 'GDP จริงโต 1.5–4%'), f(v(gdp)) + '%'],
      ['mid', unD != null && Math.abs(unD) <= 0.3, B('Unemployment stable (±0.3 pt)', 'ว่างงานทรงตัว (±0.3 จุด)'), sg(unD)],
      ['mid', v(pce) != null && pce.v >= 1.8 && pce.v < 3, B('Core inflation 1.8–3%', 'เงินเฟ้อพื้นฐาน 1.8–3%'), f(v(pce), 2) + '%'],
      ['mid', v(cur) != null && cur.v >= 0 && cur.v < 1.5, B('Normal yield curve (0–1.5)', 'เส้นอัตราผลตอบแทนปกติ (0–1.5)'), f(v(cur), 2)],
      ['mid', v(hy) != null && hy.v < 4.5, B('Credit calm (spread < 4.5%)', 'ตลาดหุ้นกู้สงบ (ส่วนต่าง < 4.5%)'), f(v(hy), 2) + '%']
    ];
    return R0;
  }
  function reading(){
    var rs = rules(), sc = {}, of = {}, ph = ['early', 'mid', 'late', 'rec'];
    ph.forEach(function(p){ sc[p] = 0; of[p] = 0; });
    rs.forEach(function(r){ of[r[0]]++; if(r[1]) sc[r[0]]++; });
    var best = 'mid', bv = -1;
    ph.forEach(function(p){ var x = of[p] ? sc[p] / of[p] : 0; if(x > bv + 1e-9 || (Math.abs(x - bv) < 1e-9 && p === 'mid')){ bv = x; best = p; } });
    if(bv <= 0) best = null;
    /* a recession call needs at least two hard signals, not one */
    if(best === 'rec' && sc.rec < 2){ var alt = ph.filter(function(p){ return p !== 'rec'; }).sort(function(a, b){ return sc[b] / of[b] - sc[a] / of[a]; })[0]; best = alt; }
    return { rules:rs, sc:sc, of:of, phase:best };
  }

  /* ------------------------------------------------------------------
     2. outlook page
     ------------------------------------------------------------------ */
  var PH = { early:B('Early cycle', 'ต้นวัฏจักร'), mid:B('Mid cycle', 'กลางวัฏจักร'), late:B('Late cycle', 'ปลายวัฏจักร'), rec:B('Recession', 'ถดถอย') };
  function card(l, val, k, n){ return { l:l, v:val, k:k, n:n }; }
  function liveInd(){
    var out = [], g = M('gdp'), gn = M('gdpnow'), c = M('cpi'), p = M('core_pce'), u = M('unrate'), pay = M('payrolls'), ff = M('ff'), cur = M('t10y2y'), hy = M('hy'), s = M('sent'), o = M('oil'), y10 = M('y10');
    if(g && isN(g.v)) out.push(card(B('Real GDP growth, annualised (' + mon(g.t) + ' quarter)', 'GDP จริงโต ต่อปี (ไตรมาส ' + mon(g.t) + ')'), f(g.v) + '%', g.v < 0 ? 'bad' : g.v < 1.5 ? 'warn' : 'good',
      B('A year earlier: ' + f(g.y1) + '%.' + (gn && isN(gn.v) ? ' The Atlanta Fed nowcast for the current quarter: ' + f(gn.v) + '%.' : ''), 'ปีก่อนหน้า: ' + f(g.y1) + '%' + (gn && isN(gn.v) ? ' · ประมาณการสดของ Atlanta Fed สำหรับไตรมาสนี้: ' + f(gn.v) + '%' : ''))));
    if(c && isN(c.v)) out.push(card(B('CPI inflation, y/y (' + mon(c.t) + ')', 'เงินเฟ้อ CPI เทียบปีก่อน (' + mon(c.t) + ')'), f(c.v, 1) + '%', c.v >= 4 ? 'bad' : c.v >= 2.5 ? 'warn' : 'good',
      B('3 months ago ' + f(c.m3, 1) + '%, a year ago ' + f(c.y1, 1) + '%. The Fed aims for 2%.', '3 เดือนก่อน ' + f(c.m3, 1) + '% ปีก่อน ' + f(c.y1, 1) + '% เป้าของเฟดคือ 2%')));
    if(p && isN(p.v)) out.push(card(B('Core PCE — the Fed\'s gauge (' + mon(p.t) + ')', 'Core PCE ตัวที่เฟดใช้ (' + mon(p.t) + ')'), f(p.v, 2) + '%', p.v >= 3 ? 'warn' : 'good',
      B('Strips out food and energy. Above 3% keeps rate cuts on hold.', 'ตัดอาหารและพลังงานออก ถ้าเกิน 3% เฟดมักยังไม่ลดดอกเบี้ย')));
    if(u && isN(u.v)) out.push(card(B('Unemployment rate (' + mon(u.t) + ')', 'อัตราว่างงาน (' + mon(u.t) + ')'), f(u.v, 1) + '%', isN(u.y1) && u.v - u.y1 >= 0.5 ? 'bad' : isN(u.y1) && u.v > u.y1 ? 'warn' : 'good',
      B('A year ago ' + f(u.y1, 1) + '%.' + (pay && isN(pay.v) ? ' New jobs last month: ' + f(pay.v, 0) + 'k.' : ''), 'ปีก่อน ' + f(u.y1, 1) + '%' + (pay && isN(pay.v) ? ' · งานเพิ่มเดือนล่าสุด ' + f(pay.v, 0) + ' พันตำแหน่ง' : ''))));
    if(ff && isN(ff.v)) out.push(card(B('Fed funds rate', 'ดอกเบี้ยนโยบายเฟด'), f(ff.v, 2) + '%', 'warn',
      B('3 months ago ' + f(ff.m3, 2) + '%, a year ago ' + f(ff.y1, 2) + '%.' + (y10 && isN(y10.v) ? ' 10-year Treasury: ' + f(y10.v, 2) + '%.' : ''), '3 เดือนก่อน ' + f(ff.m3, 2) + '% ปีก่อน ' + f(ff.y1, 2) + '%' + (y10 && isN(y10.v) ? ' · พันธบัตร 10 ปี ' + f(y10.v, 2) + '%' : ''))));
    if(cur && isN(cur.v)) out.push(card(B('Yield curve, 10y − 2y', 'ส่วนต่างพันธบัตร 10 ปี − 2 ปี'), f(cur.v, 2), cur.v < 0 ? 'bad' : cur.v < 0.5 ? 'warn' : 'good',
      B('Below zero (inverted) has come before most US recessions. Flat = late-cycle; steep = early-cycle.', 'ต่ำกว่าศูนย์ (กลับหัว) มักเกิดก่อนถดถอยในสหรัฐฯ แบน = ปลายวัฏจักร ชัน = ต้นวัฏจักร')));
    if(hy && isN(hy.v)) out.push(card(B('High-yield credit spread', 'ส่วนต่างดอกเบี้ยหุ้นกู้เสี่ยงสูง'), f(hy.v, 2) + '%', hy.v >= 6 ? 'bad' : hy.v >= 4.5 ? 'warn' : 'good',
      B('Extra yield risky companies pay over government bonds. It widens fast when lenders get scared.', 'ดอกเบี้ยส่วนเพิ่มที่บริษัทเสี่ยงต้องจ่ายเหนือพันธบัตรรัฐ ถ้าผู้ให้กู้กลัว ตัวนี้จะกว้างขึ้นเร็ว')));
    if(o && isN(o.v)) out.push(card(B('Oil (WTI, $/barrel)', 'น้ำมัน WTI (ดอลลาร์/บาร์เรล)'), '$' + f(o.v, 1), isN(o.y1) && o.v > o.y1 * 1.25 ? 'warn' : 'good',
      B('A year ago $' + f(o.y1, 1) + '. A big rise feeds inflation and squeezes margins.', 'ปีก่อน $' + f(o.y1, 1) + ' ขึ้นแรงจะดันเงินเฟ้อและบีบกำไรบริษัท')));
    if(s && isN(s.v)) out.push(card(B('Consumer sentiment (Michigan)', 'ความเชื่อมั่นผู้บริโภค (มิชิแกน)'), f(s.v, 1), isN(s.y1) && s.v < s.y1 - 5 ? 'warn' : 'good',
      B('A year ago ' + f(s.y1, 1) + '. Households spend about two-thirds of US GDP.', 'ปีก่อน ' + f(s.y1, 1) + ' การใช้จ่ายครัวเรือนคิดเป็นราวสองในสามของ GDP สหรัฐฯ')));
    return out;
  }
  /* each scenario's watch list becomes three live checks */
  function liveWatch(){
    var c = M('cpi'), p = M('core_pce'), cur = M('t10y2y'), ff = M('ff'), pay = M('payrolls'), ip = M('indpro'), hy = M('hy'), u = M('unrate'), g = M('gdp'), rg = R();
    function chk(ok, en, th, val){ return { ok:ok, l:B(en, th), val:val }; }
    var payAvg = pay && isN(pay.v) && isN(pay.m1) && isN(pay.m3) ? (pay.v + pay.m1 + pay.m3) / 3 : null;
    return [
      [chk(g && g.v >= 1.5, 'Real GDP growth ≥ 1.5%', 'GDP จริงโต ≥ 1.5%', g ? f(g.v) + '%' : '–'),
       chk(payAvg != null && payAvg > 0, 'Jobs still being added (3-mo avg)', 'ยังมีการจ้างงานเพิ่ม (เฉลี่ย 3 เดือน)', payAvg != null ? f(payAvg, 0) + 'k' : '–'),
       chk(ip && ip.v > 0, 'Industrial production growing y/y', 'การผลิตภาคอุตสาหกรรมโตกว่าปีก่อน', ip ? sg(ip.v) + '%' : '–')],
      [chk(p && p.v <= 2.7, 'Core PCE at or below 2.7%', 'Core PCE ไม่เกิน 2.7%', p ? f(p.v, 2) + '%' : '–'),
       chk(ff && isN(ff.m3) && ff.v < ff.m3, 'Fed cutting (rate lower than 3 months ago)', 'เฟดกำลังลดดอกเบี้ย (ต่ำกว่า 3 เดือนก่อน)', ff ? f(ff.m3, 2) + ' → ' + f(ff.v, 2) + '%' : '–'),
       chk(isN(rg.smallcap_vs_market_1m) && rg.smallcap_vs_market_1m > 0, 'Small caps beating the market (1 month)', 'หุ้นเล็กชนะตลาด (1 เดือน)', isN(rg.smallcap_vs_market_1m) ? sg(rg.smallcap_vs_market_1m) + '%' : '–')],
      [chk(isN(rg.semis_vs_market_1m) && rg.semis_vs_market_1m <= -5, 'Chip stocks lagging the market by 5%+ (1 month)', 'หุ้นชิปแพ้ตลาด 5% ขึ้นไป (1 เดือน)', isN(rg.semis_vs_market_1m) ? sg(rg.semis_vs_market_1m) + '%' : '–'),
       chk(c && c.v >= 4, 'Inflation back above 4%', 'เงินเฟ้อกลับขึ้นเกิน 4%', c ? f(c.v, 1) + '%' : '–'),
       chk((hy && hy.v >= 4.5) || (u && isN(u.y1) && u.v - u.y1 >= 0.5), 'Credit stress or jobs weakening', 'ตลาดหุ้นกู้ตึงเครียด หรือการจ้างงานอ่อนลง', (hy ? f(hy.v, 2) + '%' : '–') + ' · ' + (u ? f(u.v, 1) + '%' : '–'))]
    ];
  }
  var outlookDone = false, lastLive = null;
  function applyOutlook(){
    var O = window.__SPZ_OUTLOOK, C = window.SPZ_CYCLE;
    if(!O || !BR || !BR.macro) return false;
    var r = reading(), D = O.data;
    if(r.phase){
      D.here = r.phase;
      if(C){
        var wasLive = C.live, follow = C.phase === wasLive;
        C.live = r.phase;
        if(BR.generated_at) C.asOf = String(BR.generated_at).slice(0, 10);
        C.confidence = { n:r.sc[r.phase], of:r.of[r.phase] };
        if(follow && C.phase !== r.phase){ C.phase = r.phase; try { document.dispatchEvent(new CustomEvent('spz:cycle', { detail:{ phase:r.phase, src:'live' } })); } catch(e){} }
        lastLive = r.phase;
      }
    }
    var ind = liveInd(); if(ind.length) D.ind = ind;
    D.snapDate = B('Updates itself · data ' + day(BR.generated_at), 'อัปเดตเอง · ข้อมูล ณ ' + day(BR.generated_at));
    D.snapLede = B('Where the US economy sits now, rebuilt automatically from public FRED data (refreshed twice a day). Each card says which month it covers — some series are published monthly or quarterly, so they lag.',
      'ตอนนี้เศรษฐกิจสหรัฐฯ อยู่ตรงไหน สร้างใหม่อัตโนมัติจากข้อมูลสาธารณะของ FRED (ดึงวันละ 2 รอบ) แต่ละการ์ดบอกว่าเป็นข้อมูลเดือนไหน บางชุดประกาศรายเดือนหรือรายไตรมาส จึงช้ากว่าปัจจุบัน');
    var W = liveWatch();
    (D.scen || []).forEach(function(s, i){
      if(!W[i]) return;
      s.w = { en:W[i].map(function(x){ return (x.ok ? '✓ ' : '○ ') + x.l.en + ' — now ' + x.val; }), th:W[i].map(function(x){ return (x.ok ? '✓ ' : '○ ') + x.l.th + ' — ตอนนี้ ' + x.val; }) };
      s.__hits = W[i].filter(function(x){ return x.ok; }).length;
    });
    D.disc = B('Educational, not advice. The cycle reading and the indicator cards update themselves from public data; the four-phase framework, the "drivers" and the scenario stories were written by hand in 2026 and change only when the site is edited. ✓ marks a watch item that is true in the latest data. No probabilities are given — nobody knows them.',
      'เพื่อการศึกษา ไม่ใช่คำแนะนำ การอ่านวัฏจักรและการ์ดตัวชี้วัดอัปเดตเองจากข้อมูลสาธารณะ ส่วนกรอบ 4 ช่วง "ปัจจัยขับเคลื่อน" และเรื่องเล่าของฉากทัศน์เขียนด้วยมือในปี 2026 และเปลี่ยนเมื่อมีการแก้เว็บเท่านั้น ✓ คือสิ่งที่ต้องจับตาซึ่งเป็นจริงในข้อมูลล่าสุด ไม่มีการระบุความน่าจะเป็น เพราะไม่มีใครรู้จริง');
    D.src = B('Sources (live): FRED — BEA real GDP, BLS CPI & unemployment & payrolls, BEA core PCE, Fed funds, Treasury yields, ICE BofA high-yield spread, University of Michigan sentiment, EIA WTI oil, Atlanta Fed GDPNow. Market snapshot: Yahoo Finance via the site\'s own 30-minute job.',
      'แหล่งข้อมูล (สด): FRED — GDP จริง (BEA), CPI / ว่างงาน / การจ้างงาน (BLS), Core PCE (BEA), ดอกเบี้ยเฟด, ผลตอบแทนพันธบัตร, ส่วนต่างหุ้นกู้เสี่ยงสูง (ICE BofA), ความเชื่อมั่นผู้บริโภค (มิชิแกน), น้ำมัน WTI (EIA), GDPNow (Atlanta Fed) · ข้อมูลตลาด: Yahoo Finance ผ่านงานอัตโนมัติทุก 30 นาทีของเว็บ');
    O.repaint();
    paintReading(r);
    outlookDone = true;
    return true;
  }
  function paintReading(r){
    var sec = document.getElementById('outlook'); if(!sec) return;
    var host = sec.querySelector('.spzlo');
    if(!host){
      host = document.createElement('div'); host.className = 'spzlo';
      var anchor = sec.querySelector('[data-o="s2"]');
      if(anchor) anchor.parentNode.insertBefore(host, anchor); else sec.appendChild(host);
    }
    var ph = ['early', 'mid', 'late', 'rec'];
    host.innerHTML = '<div class="spzlo-h"><span class="spzlo-live"><i></i>' + esc(T(B('LIVE READING', 'อ่านจากข้อมูลจริง'))) + '</span><b>' +
      esc(T(B('Where the latest data puts the cycle: ', 'ข้อมูลล่าสุดบอกว่าวัฏจักรอยู่ที่: '))) + '<em>' + esc(T(PH[r.phase] || B('unclear', 'ยังไม่ชัด'))) + '</em></b><small>' + esc(T(B('updated ', 'อัปเดต '))) + esc(day(BR.generated_at)) + '</small></div>' +
      '<div class="spzlo-g">' + ph.map(function(p){
        var pct = r.of[p] ? Math.round(r.sc[p] / r.of[p] * 100) : 0;
        return '<div class="spzlo-c' + (p === r.phase ? ' on' : '') + '"><div class="spzlo-ct"><b>' + esc(T(PH[p])) + '</b><span>' + r.sc[p] + '/' + r.of[p] + '</span></div><div class="spzlo-bar"><i style="width:' + pct + '%"></i></div><ul>' +
          r.rules.filter(function(x){ return x[0] === p; }).map(function(x){ return '<li class="' + (x[1] ? 'y' : 'n') + '"><span>' + (x[1] ? '✓' : '·') + '</span>' + esc(T(x[2])) + ' <em>' + esc(x[3]) + '</em></li>'; }).join('') + '</ul></div>';
      }).join('') + '</div>' +
      '<p class="spzlo-n">' + esc(T(B('How it is read: each phase has a few textbook signs; the phase with the largest share of its signs true wins (a recession needs two hard signs). It is a rule of thumb that only describes the data — not a forecast.', 'วิธีอ่าน: แต่ละช่วงมีสัญญาณตามตำราไม่กี่ข้อ ช่วงที่สัญญาณเป็นจริงมากที่สุดเมื่อคิดเป็นสัดส่วนจะถูกเลือก (ถดถอยต้องมีสัญญาณหนักอย่างน้อย 2 ข้อ) เป็นกฎง่ายๆ ที่บรรยายข้อมูล ไม่ใช่การพยากรณ์'))) + '</p>';
  }

  /* ------------------------------------------------------------------
     3. scenarios page — which shocks the data points at now
     ------------------------------------------------------------------ */
  function heat(){
    var rg = R(), ff = M('ff'), y2 = M('y2'), c = M('cpi'), sahm = M('sahm'), g = M('gdp'), pay = M('payrolls'), o = M('oil'), hy = M('hy'), mort = M('mort'), per = M('permits'), ex = M('exp1y');
    var payAvg = pay && isN(pay.v) && isN(pay.m1) && isN(pay.m3) ? (pay.v + pay.m1 + pay.m3) / 3 : null;
    function lv(x){ return x >= 3 ? 3 : x >= 2 ? 2 : x >= 1 ? 1 : 0; }
    var out = [];
    function add(title, score, ev){ out.push({ title:title, h:lv(score), ev:ev }); }
    var ffm = ff && isN(ff.m3) ? ff.v - ff.m3 : null, y2m = y2 && isN(y2.m3) ? y2.v - y2.m3 : null;
    add('Interest Rate Hike', (ffm != null && ffm >= 0.25 ? 1.5 : 0) + (y2m != null && y2m >= 0.4 ? 1 : 0) + (y2m != null && y2m >= 0.8 ? 1 : 0),
      [B('Fed funds 3 months: ' + sg(ffm, 2) + ' pt', 'ดอกเบี้ยเฟดใน 3 เดือน: ' + sg(ffm, 2) + ' จุด'), B('2-year yield 3 months: ' + sg(y2m, 2) + ' pt', 'ผลตอบแทน 2 ปีใน 3 เดือน: ' + sg(y2m, 2) + ' จุด')]);
    add('Interest Rate Cut', (ffm != null && ffm <= -0.25 ? 2 : 0) + (y2m != null && y2m <= -0.4 ? 1 : 0),
      [B('Fed funds 3 months: ' + sg(ffm, 2) + ' pt', 'ดอกเบี้ยเฟดใน 3 เดือน: ' + sg(ffm, 2) + ' จุด')]);
    add('Inflation Surge', (c && c.v >= 3.5 ? 1 : 0) + (c && isN(c.m3) && c.v - c.m3 >= 0.3 ? 1 : 0) + (c && c.v >= 4.5 ? 1 : 0) + (ex && isN(ex.m3) && ex.v - ex.m3 >= 0.4 ? 0.5 : 0),
      [B('CPI ' + f(c && c.v, 1) + '% (3 months ago ' + f(c && c.m3, 1) + '%)', 'CPI ' + f(c && c.v, 1) + '% (3 เดือนก่อน ' + f(c && c.m3, 1) + '%)'), B('1-year inflation expectations ' + f(ex && ex.v, 2) + '%', 'คาดการณ์เงินเฟ้อ 1 ปี ' + f(ex && ex.v, 2) + '%')]);
    add('Economic Recession', (sahm && sahm.v >= 0.3 ? 1 : 0) + (sahm && sahm.v >= 0.5 ? 1 : 0) + (g && g.v < 0.5 ? 1 : 0) + (payAvg != null && payAvg < 0 ? 1 : 0),
      [B('Sahm rule ' + f(sahm && sahm.v, 2) + ' (0.5 = recession signal)', 'กฎ Sahm ' + f(sahm && sahm.v, 2) + ' (0.5 = สัญญาณถดถอย)'), B('Real GDP ' + f(g && g.v) + '% · jobs 3-mo avg ' + f(payAvg, 0) + 'k', 'GDP จริง ' + f(g && g.v) + '% · งานเพิ่มเฉลี่ย 3 เดือน ' + f(payAvg, 0) + 'k')]);
    var oy = o && isN(o.y1) ? (o.v / o.y1 - 1) * 100 : null, om = o && isN(o.m1) ? (o.v / o.m1 - 1) * 100 : null;
    add('Oil Price Shock', (oy != null && oy >= 25 ? 1.5 : 0) + (oy != null && oy >= 50 ? 1 : 0) + (om != null && om >= 10 ? 1 : 0),
      [B('WTI $' + f(o && o.v, 1) + ' · 1 year ' + sg(oy, 0) + '%', 'WTI $' + f(o && o.v, 1) + ' · 1 ปี ' + sg(oy, 0) + '%'), B('1 month ' + sg(om, 0) + '%', '1 เดือน ' + sg(om, 0) + '%')]);
    var hym = hy && isN(hy.m3) ? hy.v - hy.m3 : null;
    add('Banking / Credit Crisis', (hy && hy.v >= 4.5 ? 1 : 0) + (hy && hy.v >= 6 ? 1 : 0) + (hym != null && hym >= 0.75 ? 1 : 0),
      [B('High-yield spread ' + f(hy && hy.v, 2) + '% (3 months: ' + sg(hym, 2) + ')', 'ส่วนต่างหุ้นกู้เสี่ยง ' + f(hy && hy.v, 2) + '% (3 เดือน: ' + sg(hym, 2) + ')')]);
    add('Baht Weakens Sharply', (isN(rg.thb_ytd) && rg.thb_ytd <= -5 ? 1.5 : 0) + (isN(rg.thb_1m) && rg.thb_1m <= -2 ? 1 : 0) + (isN(rg.thb_ytd) && rg.thb_ytd <= -10 ? 1 : 0),
      [B('Baht vs USD this year: ' + sg(rg.thb_ytd, 1) + '% (minus = weaker)', 'เงินบาทเทียบดอลลาร์ปีนี้: ' + sg(rg.thb_ytd, 1) + '% (ติดลบ = อ่อนค่า)'), B('Last month: ' + sg(rg.thb_1m, 1) + '%', 'เดือนล่าสุด: ' + sg(rg.thb_1m, 1) + '%')]);
    add('US Dollar Collapse', (isN(rg.uup_3m) && rg.uup_3m <= -5 ? 2 : 0) + (isN(rg.uup_1m) && rg.uup_1m <= -3 ? 1 : 0),
      [B('Dollar index fund 3 months: ' + sg(rg.uup_3m, 1) + '%', 'กองทุนดัชนีดอลลาร์ 3 เดือน: ' + sg(rg.uup_3m, 1) + '%')]);
    add('Tech Bubble Bursts', (isN(rg.semis_vs_market_1m) && rg.semis_vs_market_1m <= -8 ? 1.5 : 0) + (isN(rg.vix) && rg.vix >= 25 ? 1 : 0) + (isN(rg.spy_1m) && rg.spy_1m <= -5 ? 1 : 0),
      [B('Chips vs market, 1 month: ' + sg(rg.semis_vs_market_1m, 1) + '%', 'หุ้นชิปเทียบตลาด 1 เดือน: ' + sg(rg.semis_vs_market_1m, 1) + '%'), B('VIX ' + f(rg.vix, 1) + ' · S&P 500 1 month ' + sg(rg.spy_1m, 1) + '%', 'VIX ' + f(rg.vix, 1) + ' · S&P 500 1 เดือน ' + sg(rg.spy_1m, 1) + '%')]);
    add('Tech / AI Boom', (isN(rg.semis_vs_market_1m) && rg.semis_vs_market_1m >= 6 ? 2 : 0) + (isN(rg.spy_3m) && rg.spy_3m >= 6 ? 1 : 0),
      [B('Chips vs market, 1 month: ' + sg(rg.semis_vs_market_1m, 1) + '%', 'หุ้นชิปเทียบตลาด 1 เดือน: ' + sg(rg.semis_vs_market_1m, 1) + '%')]);
    var pmY = per && isN(per.y1) ? (per.v / per.y1 - 1) * 100 : null;
    add('Housing Market Crash', (mort && mort.v >= 7 ? 1 : 0) + (pmY != null && pmY <= -10 ? 1 : 0) + (pmY != null && pmY <= -20 ? 1 : 0),
      [B('30-year mortgage ' + f(mort && mort.v, 2) + '%', 'ดอกเบี้ยบ้าน 30 ปี ' + f(mort && mort.v, 2) + '%'), B('Building permits vs a year ago ' + sg(pmY, 0) + '%', 'ใบอนุญาตก่อสร้างเทียบปีก่อน ' + sg(pmY, 0) + '%')]);
    add('Geopolitical Conflict', (isN(rg.vix) && rg.vix >= 25 ? 1 : 0) + (om != null && om >= 10 ? 1 : 0) + (isN(rg.gld_1m) && rg.gld_1m >= 6 ? 1 : 0),
      [B('Fear gauge VIX ' + f(rg.vix, 1) + ' · gold 1 month ' + sg(rg.gld_1m, 1) + '%', 'ดัชนีความกลัว VIX ' + f(rg.vix, 1) + ' · ทอง 1 เดือน ' + sg(rg.gld_1m, 1) + '%')]);
    return out;
  }
  var HEAT = [B('calm', 'สงบ'), B('worth watching', 'น่าจับตา'), B('elevated', 'สูงขึ้น'), B('hot now', 'ร้อนแรงตอนนี้')];
  function paintScen(){
    var sec = document.getElementById('scenarios'); if(!sec || !BR || !BR.macro) return;
    var api = window.__SPZ_SCENARIOS, list = [];
    try { list = api && api.list ? api.list() : []; } catch(e){}
    var idx = {}; list.forEach(function(s, i){ idx[s.title_en || (s.title && s.title.en) || ''] = i; });
    var hs = heat().sort(function(a, b){ return b.h - a.h; });
    var host = sec.querySelector('.spzls');
    if(!host){
      host = document.createElement('div'); host.className = 'spzls';
      var head = sec.querySelector('.section-head');
      if(head) head.parentNode.insertBefore(host, head.nextSibling); else sec.insertBefore(host, sec.firstChild);
      host.addEventListener('click', function(e){ var b = e.target.closest('[data-sopen]'); if(b && window.__SPZ_SCENARIOS){ window.__SPZ_SCENARIOS.open(+b.getAttribute('data-sopen')); var p = sec.querySelector('.scenario-panel'); if(p) setTimeout(function(){ p.scrollIntoView({ behavior:'smooth', block:'start' }); }, 120); } });
    }
    var hot = hs.filter(function(x){ return x.h >= 1; });
    var show = (hot.length ? hot : hs).slice(0, 6);
    host.innerHTML = '<div class="spzls-h"><span class="spzlo-live"><i></i>' + esc(T(B('LIVE', 'สด'))) + '</span><b>' + esc(T(B('Which of these shocks the data is pointing at right now', 'ตอนนี้ข้อมูลจริงชี้ไปที่สถานการณ์ไหน'))) + '</b><small>' + esc(T(B('updated ', 'อัปเดต '))) + esc(day(BR.generated_at)) + '</small></div>' +
      (hot.length ? '' : '<p class="spzls-calm">' + esc(T(B('No shock with a measurable trigger is flashing — the most relevant ones are listed for reference.', 'ยังไม่มีสถานการณ์ไหนที่ตัวเลขส่งสัญญาณ รายการด้านล่างแสดงไว้เพื่ออ้างอิง'))) + '</p>') +
      '<div class="spzls-g">' + show.map(function(x){
        var i = idx[x.title], s = list[i] || {};
        var name = L() === 'th' ? (s.title_th || x.title) : (s.title_en || x.title);
        return '<div class="spzls-c h' + x.h + '"><div class="spzls-ct"><b>' + esc(name) + '</b><span class="spzls-hl">' + esc(T(HEAT[x.h])) + '</span></div><div class="spzls-m">' + [0, 1, 2].map(function(k){ return '<i class="' + (k < x.h ? 'on' : '') + '"></i>'; }).join('') + '</div><ul>' +
          x.ev.map(function(e){ return '<li>' + esc(T(e)) + '</li>'; }).join('') + '</ul>' + (i != null ? '<button type="button" data-sopen="' + i + '">' + esc(T(B('See who wins and loses →', 'ดูว่าหุ้นแบบไหนได้/เสีย →'))) + '</button>' : '') + '</div>';
      }).join('') + '</div>' +
      '<p class="spzlo-n">' + esc(T(B('Heat comes from simple thresholds on public data (FRED, the market snapshot) and only says the conditions of a scenario are showing up — not that it will happen. Shocks with no measurable trigger (pandemic, elections…) are never flagged here.', 'ระดับความร้อนมาจากเกณฑ์ง่ายๆ บนข้อมูลสาธารณะ (FRED และข้อมูลตลาด) แปลว่าเงื่อนไขของสถานการณ์นั้นเริ่มปรากฏ ไม่ได้แปลว่าจะเกิดแน่ สถานการณ์ที่วัดเป็นตัวเลขไม่ได้ (โรคระบาด เลือกตั้ง…) จะไม่ถูกขึ้นป้ายที่นี่'))) + '</p>';
  }

  /* ------------------------------------------------------------------
     4. load + badges
     ------------------------------------------------------------------ */
  function all(){ if(!BR) return; applyOutlook(); paintScen(); }
  function load(){
    fetch('data/brain.json?v=' + Math.floor(Date.now() / 3600000)).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){ BR = d; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){} all(); }, function(){ /* no data: pages stay as written */ });
  }
  var tries = 0, iv = setInterval(function(){
    if(window.__SPZ_OUTLOOK && document.getElementById('scenarios')){ clearInterval(iv); load(); }
    else if(++tries > 100){ clearInterval(iv); load(); }
  }, 300);
  document.addEventListener('spz:snapshot', function(e){ snap = (e && e.detail) || snap; if(BR) { paintScen(); } });
  new MutationObserver(function(){ if(BR) setTimeout(all, 30); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  setInterval(function(){ if(!document.hidden) load(); }, 3 * 3600 * 1000);
})();
