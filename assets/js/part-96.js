/* ============================================================================
   SPACEZ TERMINAL -- PRO SKIN (2026-11-19)
   The Market Brain look (deep navy glass, cyan → violet → pink → amber edge)
   brought to the pages the owner asked for, keeping the space theme:
   1. Cycle pill in the top bar: fixed width, long text (the date) scrolls
      inside it, a light runs round its edge, and the chooser is a glass card
      with a colour + one-line meaning per phase.
   2. A "30-second summary" hero at the top of Daily summary (#daily), Market
      overview (#outlook, menu 11), Money flow (#flow, menu 12) and Bubble
      Radar (#bubble) — built from the same live data those pages already use.
   3. Bubble Radar "brain": which signals push the score, which hold it back,
      how far to the next level, and whether there is a trigger (VIX, credit,
      breadth) — valuation x trigger read in plain words.
   4. New drawn infographics for the four stock types (#types, menu 04).
   Styles: assets/css/part-96.css. Nothing here changes how other pages work.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_PROSKIN) return;
  window.__SPZ_PROSKIN = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function I(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function isN(v){ return typeof v === 'number' && isFinite(v); }
  function sg(v, d){ return isN(v) ? (v > 0 ? '+' : '') + v.toFixed(d == null ? 1 : d) : '–'; }
  function snap(){ try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot()) || null; } catch(e){ return null; } }
  var RM = false; try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  /* ======================= 1. CYCLE PILL ======================= */
  var PH_DESC = {
    early:I('Economy recovering, rates low — cyclicals and banks lead', 'เศรษฐกิจฟื้น ดอกเบี้ยต่ำ หุ้นวัฏจักรและธนาคารนำ'),
    mid:I('Steady growth — growth and tech stocks lead', 'เศรษฐกิจโตต่อเนื่อง หุ้นเติบโตและเทคนำ'),
    late:I('Prices and rates high — energy and defensives hold up', 'เงินเฟ้อและดอกเบี้ยสูง หุ้นพลังงานและหุ้นตั้งรับเด่น'),
    rec:I('Economy shrinking — defensives and bonds hold up', 'เศรษฐกิจหดตัว หุ้นตั้งรับและพันธบัตรเด่น')
  };
  var PH_KEYS = ['early', 'mid', 'late', 'rec'];
  var PH_COL = { early:'#34d399', mid:'#22d3ee', late:'#fbbf24', rec:'#fb7185' };
  function chipCol(){
    var box = document.getElementById('spzCyc'), C = window.SPZ_CYCLE; if(!box || !C) return;
    var ph = C.phase || 'mid'; box.style.setProperty('--cycc', PH_COL[ph] || '#22d3ee'); box.setAttribute('data-ph', ph);
  }
  function chip(){
    chipCol();
    var box = document.getElementById('spzCyc'); if(!box || box.__pzx) return !!box;
    var lbl = box.querySelector('[data-c="lbl"]'); if(!lbl) return false;
    box.__pzx = 1; box.classList.add('pzx-cyc');
    var vp = document.createElement('span'); vp.className = 'cyc-vp';
    lbl.parentNode.insertBefore(vp, lbl); vp.appendChild(lbl);
    function fit(){
      var over = lbl.scrollWidth - vp.clientWidth;
      var on = over > 2 && !RM;
      box.classList.toggle('cyc-mq', on);
      vp.style.setProperty('--mq', on ? (-(over + 12)) + 'px' : '0px');
      vp.style.setProperty('--mqd', Math.max(3.2, (over + 12) / 16).toFixed(1) + 's');
    }
    new MutationObserver(function(){ requestAnimationFrame(fit); }).observe(lbl, { childList:true, characterData:true, subtree:true });
    fit(); setTimeout(fit, 600);
    var pop = box.querySelector('[data-c="pop"]');
    function deco(){
      if(!pop) return;
      var bs = pop.querySelectorAll('.cyc-b:not(.cyc-reset)');
      bs.forEach(function(b, i){
        var k = PH_KEYS[i]; if(!k || b.__pzx) return; b.__pzx = 1;
        b.setAttribute('data-ph', k);
        var nm = document.createElement('span'); nm.className = 'cyc-bt';
        while(b.firstChild && !(b.firstChild.classList && b.firstChild.classList.contains('cyc-live'))) nm.appendChild(b.firstChild);
        var tx = document.createElement('span'); tx.className = 'cyc-btx'; tx.appendChild(nm);
        var ds = document.createElement('span'); ds.className = 'cyc-bd'; ds.textContent = T(PH_DESC[k]); tx.appendChild(ds);
        var dot = document.createElement('i'); dot.className = 'cyc-bi';
        b.insertBefore(tx, b.firstChild); b.insertBefore(dot, tx);
      });
    }
    if(pop){ new MutationObserver(deco).observe(pop, { childList:true }); deco(); }
    return true;
  }

  /* ======================= 2. HERO helper ======================= */
  function hero(sec, key, html, before){
    var h = sec.querySelector('.pzx-hero[data-pzx="' + key + '"]');
    if(!h){
      h = document.createElement('div'); h.className = 'pzx-hero'; h.setAttribute('data-pzx', key);
      var head = sec.querySelector('.section-head');
      var anchor = before ? sec.querySelector(before) : null;
      if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(h, anchor);
      else if(head && head.parentNode) head.parentNode.insertBefore(h, head.nextSibling);
      else sec.insertBefore(h, sec.firstChild);
    }
    if(h.__html !== html){ h.innerHTML = html; h.__html = html; }
    return h;
  }
  function tone(v, good, bad){ return !isN(v) ? '' : v >= good ? 'good' : v <= bad ? 'bad' : 'mid'; }
  function kpi(lbl, val, cls, note){
    return '<div class="pzx-k ' + (cls || '') + '"><span class="pzx-kl">' + esc(T(lbl)) + '</span><b class="pzx-kv">' + val + '</b>' + (note ? '<span class="pzx-kn">' + esc(T(note)) + '</span>' : '') + '</div>';
  }
  function head(eb, title, lede, badge){
    return '<div class="pzx-top"><div class="pzx-eb"><i></i>' + esc(T(eb)) + (badge ? '<span class="pzx-badge">' + esc(badge) + '</span>' : '') + '</div>' +
      '<div class="pzx-h">' + title + '</div>' + (lede ? '<p class="pzx-p">' + lede + '</p>' : '') + '</div>';
  }
  function bars(rows, max){
    return '<div class="pzx-bars">' + rows.map(function(r){
      var w = Math.min(100, Math.abs(r.v) / (max || 1) * 100);
      return '<div class="pzx-bar ' + (r.v >= 0 ? 'up' : 'dn') + '"><span class="n">' + esc(r.n) + '</span><span class="t"><i style="width:' + w.toFixed(1) + '%"></i></span><b>' + sg(r.v) + '%</b></div>';
    }).join('') + '</div>';
  }
  function ago(iso){
    var d = new Date(iso); if(isNaN(d)) return '';
    var m = Math.round((Date.now() - d.getTime()) / 60000);
    if(m < 60) return T(I(m + ' min ago', m + ' นาทีที่แล้ว'));
    var h = Math.round(m / 60); if(h < 48) return T(I(h + ' h ago', h + ' ชั่วโมงที่แล้ว'));
    return T(I(Math.round(h / 24) + ' days ago', Math.round(h / 24) + ' วันที่แล้ว'));
  }
  var PHN = { early:I('Early cycle', 'ต้นวัฏจักร'), mid:I('Mid cycle', 'กลางวัฏจักร'), late:I('Late cycle', 'ปลายวัฏจักร'), rec:I('Recession', 'ถดถอย') };
  function sectors(sn){ return (sn && sn.flows && sn.flows.sector || []).filter(function(x){ return isN(x.m1); }); }
  function assetBy(sn, sym){ var a = sn && sn.flows && sn.flows.asset || []; for(var i = 0; i < a.length; i++) if(a[i].sym === sym) return a[i]; return null; }
  function secNm(x){ return L() === 'th' ? (x.th || x.en) : x.en; }

  /* ======================= 3. DAILY SUMMARY ======================= */
  function daily(){
    var sec = document.getElementById('daily'), sn = snap(); if(!sec || !sn || !sn.stocks) return;
    var S = sn.stocks, ks = Object.keys(S), up = 0, dn = 0, sum = 0, n = 0, ab = 0, nab = 0;
    ks.forEach(function(k){ var c = S[k] && S[k].chg_pct; if(isN(c)){ n++; sum += c; if(c > 0) up++; else if(c < 0) dn++; } if(S[k] && typeof S[k].above_ma200 === 'boolean'){ nab++; if(S[k].above_ma200) ab++; } });
    var avg = n ? sum / n : null, breadth = nab ? ab / nab * 100 : null, rg = sn.regime || {}, ph = window.SPZ_CYCLE ? window.SPZ_CYCLE.live : null;
    var mood = !isN(avg) ? I('No data yet', 'ยังไม่มีข้อมูล') : avg > 0.6 ? I('Strong day', 'วันนี้ตลาดคึกคัก') : avg > 0.1 ? I('Mildly positive', 'บวกเล็กน้อย') : avg > -0.1 ? I('Flat', 'ทรงตัว') : avg > -0.6 ? I('Mildly negative', 'ลบเล็กน้อย') : I('Weak day', 'วันนี้ตลาดอ่อนแรง');
    var title = esc(T(mood)) + (isN(avg) ? ' <em class="' + (avg >= 0 ? 'good' : 'bad') + '">' + sg(avg, 2) + '%</em>' : '');
    var lede = isN(avg) ? esc(T(I(up + ' of ' + n + ' stocks rose today and ' + dn + ' fell. ' + (isN(breadth) ? Math.round(breadth) + '% are above their 200-day line.' : ''),
      'วันนี้หุ้นขึ้น ' + up + ' ตัว ลง ' + dn + ' ตัว จาก ' + n + ' ตัว ' + (isN(breadth) ? 'และมีหุ้น ' + Math.round(breadth) + '% ที่ยังยืนเหนือเส้นเฉลี่ย 200 วัน' : '')))) : '';
    var vix = isN(rg.vix) ? rg.vix : null;
    var html = head(I('Daily summary · 30-second read', 'สรุปประจำวัน · อ่าน 30 วินาที'), title, lede, sn.generated_at ? ago(sn.generated_at) : '') +
      '<div class="pzx-kpis">' +
        kpi(I('Up / down', 'ขึ้น / ลง'), up + ' <small>/ ' + dn + '</small>', up >= dn ? 'good' : 'bad', I('stocks today', 'ตัว วันนี้')) +
        kpi(I('Above 200-day line', 'เหนือเส้น 200 วัน'), isN(breadth) ? Math.round(breadth) + '%' : '–', tone(breadth, 60, 40), I('over 60% = healthy market', 'เกิน 60% = ตลาดแข็งแรง')) +
        kpi(I('Fear gauge (VIX)', 'ดัชนีความกลัว (VIX)'), isN(vix) ? vix.toFixed(1) : '–', !isN(vix) ? '' : vix < 18 ? 'good' : vix < 25 ? 'mid' : 'bad', I('below 18 calm · above 25 scared', 'ต่ำกว่า 18 สงบ · เกิน 25 ตื่นกลัว')) +
        kpi(I('US 10-year yield', 'ดอกเบี้ยพันธบัตร 10 ปี'), isN(rg.yield_10y) ? rg.yield_10y.toFixed(2) + '%' : '–', '', I('higher = harder for stocks', 'ยิ่งสูง หุ้นยิ่งเหนื่อย')) +
        kpi(I('Cycle (live)', 'วัฏจักร (ค่าจริง)'), ph ? esc(T(PHN[ph])) : '–', 'cy', ph ? PH_DESC[ph] : null) +
      '</div>';
    hero(sec, 'daily', html);
  }

  /* ======================= 4. MARKET OVERVIEW (menu 11) ======================= */
  function outlook(){
    var sec = document.getElementById('outlook'), sn = snap(), C = window.SPZ_CYCLE; if(!sec || !C) return;
    var ph = C.live || C.phase, cf = C.confidence, rg = (sn && sn.regime) || {}, m = (sn && sn.macro) || {};
    var spx = m.spx || {}, vix = rg.vix, y10 = rg.yield_10y, cur = rg.curve_10y_3m, br = rg.breadth_200;
    var title = esc(T(I('The cycle now: ', 'ตอนนี้วัฏจักรอยู่ที่: '))) + '<em class="cy">' + esc(T(PHN[ph] || I('–', '–'))) + '</em>';
    var conf = cf && cf.of ? T(I('The data ticks ' + cf.n + ' of ' + cf.of + ' checks for this phase.', 'ข้อมูลผ่านเกณฑ์ของช่วงนี้ ' + cf.n + ' จาก ' + cf.of + ' ข้อ')) : '';
    var lede = esc(T(PH_DESC[ph] || I('', ''))) + (conf ? ' · ' + esc(conf) : '');
    var steps = PH_KEYS.map(function(k){ return '<span class="pzx-st' + (k === ph ? ' on' : '') + '" data-ph="' + k + '"><i></i>' + esc(T(PHN[k])) + '</span>'; }).join('<span class="pzx-stl"></span>');
    var todo = {
      early:I('Lean toward cyclicals, banks and smaller companies; keep some cash for dips.', 'เน้นหุ้นวัฏจักร ธนาคาร และหุ้นขนาดเล็ก เก็บเงินสดไว้บางส่วนรอจังหวะย่อ'),
      mid:I('Quality growth leads; keep winners but trim what has run far above its 200-day line.', 'หุ้นเติบโตคุณภาพดีนำตลาด ถือตัวที่ดีต่อ แต่ทยอยลดตัวที่วิ่งห่างเส้น 200 วันมากเกินไป'),
      late:I('Shift toward defensives, energy and strong balance sheets; avoid heavy debt.', 'ค่อย ๆ ย้ายไปหุ้นตั้งรับ พลังงาน และบริษัทงบแข็ง เลี่ยงบริษัทหนี้สูง'),
      rec:I('Protect first: defensives, bonds and cash; buy slowly only when credit calms.', 'ป้องกันก่อน: หุ้นตั้งรับ พันธบัตร และเงินสด ค่อยทยอยซื้อเมื่อตลาดหุ้นกู้สงบลง')
    }[ph];
    var html = head(I('Market overview · 30-second read', 'ภาพรวมตลาด · อ่าน 30 วินาที'), title, lede, C.asOf ? T(I('data ', 'ข้อมูล ')) + C.asOf : '') +
      '<div class="pzx-steps">' + steps + '</div>' +
      '<div class="pzx-kpis">' +
        kpi(I('S&P 500, 1 month', 'S&P 500 ใน 1 เดือน'), sg(spx.m1) + '%', tone(spx.m1, 1, -1), spx.above_ma200 === true ? I('still above its 200-day line', 'ยังยืนเหนือเส้น 200 วัน') : spx.above_ma200 === false ? I('below its 200-day line', 'หลุดเส้น 200 วัน') : null) +
        kpi(I('Fear gauge (VIX)', 'ดัชนีความกลัว (VIX)'), isN(vix) ? vix.toFixed(1) : '–', !isN(vix) ? '' : vix < 18 ? 'good' : vix < 25 ? 'mid' : 'bad', I('below 18 calm · above 25 scared', 'ต่ำกว่า 18 สงบ · เกิน 25 ตื่นกลัว')) +
        kpi(I('10-year yield', 'ดอกเบี้ย 10 ปี'), isN(y10) ? y10.toFixed(2) + '%' : '–', isN(y10) && y10 > 4.8 ? 'bad' : '', I('above ~4.8% weighs on stocks', 'เกินราว 4.8% กดดันหุ้น')) +
        kpi(I('Yield curve 10y−3m', 'ส่วนต่าง 10 ปี − 3 เดือน'), isN(cur) ? sg(cur, 2) : '–', isN(cur) ? (cur < 0 ? 'bad' : cur < 0.5 ? 'mid' : 'good') : '', I('below 0 = recession warning', 'ต่ำกว่า 0 = สัญญาณเตือนถดถอย')) +
        kpi(I('Stocks above 200-day', 'หุ้นเหนือเส้น 200 วัน'), isN(br) ? Math.round(br) + '%' : '–', tone(br, 60, 40), I('over 60% = broad strength', 'เกิน 60% = แข็งแรงทั้งตลาด')) +
      '</div>' +
      (todo ? '<div class="pzx-todo"><b>' + esc(T(I('What usually works now', 'ช่วงนี้มักได้ผลกับ'))) + '</b><span>' + esc(T(todo)) + '</span></div>' : '');
    hero(sec, 'outlook', html);
  }

  /* ======================= 5. MONEY FLOW (menu 12) ======================= */
  function flow(){
    var sec = document.getElementById('flow'), sn = snap(); if(!sec || !sn) return;
    var xs = sectors(sn); if(!xs.length) return;
    var s = xs.slice().sort(function(a, b){ return b.m1 - a.m1; });
    var ins = s.slice(0, 3), outs = s.slice(-3).reverse(), max = Math.max.apply(null, s.map(function(x){ return Math.abs(x.m1); })) || 1;
    var risky = ['SPY', 'QQQ', 'IWM', 'EEM', 'HYG', 'BTC-USD'], safe = ['TLT', 'IEF', 'SHY', 'GLD', 'UUP'];
    function avg(list){ var v = list.map(function(k){ var a = assetBy(sn, k); return a && isN(a.m1) ? a.m1 : null; }).filter(isN); return v.length ? v.reduce(function(a, b){ return a + b; }, 0) / v.length : null; }
    var rOn = avg(risky), rOff = avg(safe), gap = isN(rOn) && isN(rOff) ? rOn - rOff : null;
    var mood = !isN(gap) ? I('Mixed', 'ปะปน') : gap > 2 ? I('Risk-on — money is chasing growth', 'เสี่ยงขึ้น — เงินวิ่งหาการเติบโต') : gap < -2 ? I('Risk-off — money is hiding', 'หนีความเสี่ยง — เงินหลบเข้าที่ปลอดภัย') : I('Undecided — no strong side', 'ยังไม่เลือกข้าง — ไม่มีฝั่งไหนชัด');
    var title = esc(T(I('Money is leaning: ', 'เงินกำลังเอียงไปทาง: '))) + '<em class="' + (!isN(gap) ? 'cy' : gap > 2 ? 'good' : gap < -2 ? 'bad' : 'mid') + '">' + esc(T(mood)) + '</em>';
    var lede = esc(T(I('Into ' + secNm(ins[0]) + ' (' + sg(ins[0].m1) + '%) the most, out of ' + secNm(outs[0]) + ' (' + sg(outs[0].m1) + '%) the most, over the last month.',
      'เดือนที่ผ่านมา เงินไหลเข้า ' + secNm(ins[0]) + ' (' + sg(ins[0].m1) + '%) มากที่สุด และไหลออกจาก ' + secNm(outs[0]) + ' (' + sg(outs[0].m1) + '%) มากที่สุด')));
    var gl = assetBy(sn, 'GLD'), tl = assetBy(sn, 'TLT'), us = assetBy(sn, 'UUP'), bt = assetBy(sn, 'BTC-USD');
    var html = head(I('Money flow · 30-second read', 'เงินทุนไหลไปไหน · อ่าน 30 วินาที'), title, lede, sn.generated_at ? ago(sn.generated_at) : '') +
      '<div class="pzx-two">' +
        '<div class="pzx-col"><div class="pzx-ch up">' + esc(T(I('Money flowing in (1 month)', 'เงินไหลเข้า (1 เดือน)'))) + '</div>' + bars(ins.map(function(x){ return { n:secNm(x), v:x.m1 }; }), max) + '</div>' +
        '<div class="pzx-col"><div class="pzx-ch dn">' + esc(T(I('Money flowing out (1 month)', 'เงินไหลออก (1 เดือน)'))) + '</div>' + bars(outs.map(function(x){ return { n:secNm(x), v:x.m1 }; }), max) + '</div>' +
      '</div>' +
      '<div class="pzx-kpis">' +
        kpi(I('Risky assets', 'สินทรัพย์เสี่ยง'), sg(rOn) + '%', tone(rOn, 1, -1), I('stocks, high-yield, bitcoin · 1M', 'หุ้น หุ้นกู้เสี่ยงสูง บิตคอยน์ · 1 เดือน')) +
        kpi(I('Safe havens', 'ที่หลบภัย'), sg(rOff) + '%', tone(rOff, 1, -1), I('bonds, gold, dollar · 1M', 'พันธบัตร ทองคำ ดอลลาร์ · 1 เดือน')) +
        kpi(I('Gold', 'ทองคำ'), gl ? sg(gl.m1) + '%' : '–', gl ? tone(gl.m1, 1, -1) : '', I('1 month', '1 เดือน')) +
        kpi(I('Long US bonds', 'พันธบัตรยาวสหรัฐฯ'), tl ? sg(tl.m1) + '%' : '–', tl ? tone(tl.m1, 1, -1) : '', I('1 month', '1 เดือน')) +
        kpi(I('US dollar', 'ดอลลาร์สหรัฐฯ'), us ? sg(us.m1) + '%' : '–', '', I('up = money leaving other markets', 'ขึ้น = เงินออกจากตลาดอื่น')) +
        (bt ? kpi(I('Bitcoin', 'บิตคอยน์'), sg(bt.m1) + '%', tone(bt.m1, 3, -3), I('1 month', '1 เดือน')) : '') +
      '</div>';
    hero(sec, 'flow', html);
  }

  /* ======================= 6. BUBBLE RADAR brain ======================= */
  var TIERS = [[35, I('Low', 'ต่ำ')], [60, I('Moderate', 'ปานกลาง')], [80, I('High', 'สูง')], [101, I('Very high', 'สูงมาก')]];
  function tierOf(v){ for(var i = 0; i < TIERS.length; i++) if(v <= TIERS[i][0]) return i; return 3; }
  function ring(v, cls){
    var r = 52, c = 2 * Math.PI * r, f = Math.max(0, Math.min(100, v)) / 100;
    return '<svg class="pzx-ring ' + cls + '" viewBox="0 0 130 130"><defs><linearGradient id="pzxRg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs>' +
      '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/>' +
      '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="url(#pzxRg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 65 65)"/>' +
      '<text x="65" y="66" text-anchor="middle" class="v">' + Math.round(v) + '<tspan class="u">%</tspan></text>' +
      '<text x="65" y="86" text-anchor="middle" class="l">' + esc(T(TIERS[tierOf(v)][1])) + '</text></svg>';
  }
  function bubble(){
    var sec = document.getElementById('bubble'), B = window.__SPZ_BUBBLE; if(!sec || !B || !B.indicators) return;
    var ind = []; try { ind = B.indicators().filter(function(d){ return isN(d.risk); }); } catch(e){}
    var cp = null; try { cp = B.composite(); } catch(e){}
    if(!ind.length || !cp || !isN(cp.composite)) return;
    var sn = snap(), rg = (sn && sn.regime) || {}, v = cp.composite, ti = tierOf(v);
    var sorted = ind.slice().sort(function(a, b){ return b.risk - a.risk; });
    var push = sorted.slice(0, 2), hold = sorted.slice(-2).reverse();
    var toNext = ti < 3 ? Math.max(1, TIERS[ti][0] + 1 - v) : null, toPrev = ti > 0 ? Math.max(1, v - TIERS[ti - 1][0]) : null;
    /* triggers: what usually pricks an expensive market */
    var trig = [];
    if(isN(rg.vix)) trig.push({ n:I('Fear gauge VIX', 'ดัชนีความกลัว VIX'), v:rg.vix.toFixed(1), hot:rg.vix >= 25, warm:rg.vix >= 18 });
    if(isN(rg.credit_1m)) trig.push({ n:I('Credit (high-yield vs safe, 1M)', 'หุ้นกู้เสี่ยงเทียบปลอดภัย (1 เดือน)'), v:sg(rg.credit_1m) + '%', hot:rg.credit_1m <= -2, warm:rg.credit_1m <= -0.5 });
    if(isN(rg.breadth_200)) trig.push({ n:I('Stocks above 200-day line', 'หุ้นเหนือเส้น 200 วัน'), v:Math.round(rg.breadth_200) + '%', hot:rg.breadth_200 < 40, warm:rg.breadth_200 < 55 });
    if(isN(rg.spy_1m)) trig.push({ n:I('S&P 500, 1 month', 'S&P 500 ใน 1 เดือน'), v:sg(rg.spy_1m) + '%', hot:rg.spy_1m <= -8, warm:rg.spy_1m <= -3 });
    var heat = trig.reduce(function(a, t){ return a + (t.hot ? 2 : t.warm ? 1 : 0); }, 0), heatMax = trig.length * 2 || 1, hot = heat / heatMax >= 0.5, warm = heat / heatMax >= 0.25;
    var expensive = v >= 60, rising = v >= 35 && v < 60;
    var q = rising ? (hot ? { c:'bad', t:I('Prices are getting high and fear is rising — be more careful.', 'ราคาเริ่มสูง และตลาดเริ่มกลัว — ควรระวังเพิ่มขึ้น'), d:I('Not a bubble yet, but this mix can turn fast. Avoid borrowing to buy and keep some cash.', 'ยังไม่ใช่ฟองสบู่ แต่ส่วนผสมนี้เปลี่ยนเร็ว ไม่ควรกู้มาลงทุน และเก็บเงินสดไว้บ้าง') }
        : warm ? { c:'mid', t:I('Prices are getting high, with a few warning lights.', 'ราคาเริ่มสูง และมีไฟเตือนบางดวง'), d:I('Careful but no panic: keep investing in steps, favour quality, and watch the triggers below.', 'ระวังได้แต่ไม่ต้องตกใจ ลงทุนแบบทยอย เน้นหุ้นคุณภาพ และคอยดูตัวจุดชนวนด้านล่าง') }
        : { c:'cy', t:I('Prices are getting high, but nothing is pricking them.', 'ราคาเริ่มสูง แต่ยังไม่มีอะไรมาเจาะ'), d:I('Markets can stay here for a long time. Stick to your plan and avoid chasing the hottest names.', 'ตลาดอยู่ระดับนี้ได้อีกนาน ลงทุนตามแผน และไม่ไล่ซื้อหุ้นที่ร้อนแรงที่สุด') })
      : expensive && hot ? { c:'bad', t:I('Expensive AND a trigger is showing — the riskiest mix.', 'แพง และเริ่มมีตัวจุดชนวน — ส่วนผสมที่เสี่ยงที่สุด'), d:I('Bubbles usually burst when stretched prices meet fear or tight credit. Keep position sizes small, hold cash, have a stop-loss.', 'ฟองสบู่มักแตกเมื่อราคาแพงมาเจอความกลัวหรือเงินตึงตัว ควรลดขนาดการลงทุน ถือเงินสด และตั้งจุดตัดขาดทุน') }
      : expensive && warm ? { c:'mid', t:I('Expensive, and the first cracks are appearing.', 'แพง และเริ่มเห็นรอยร้าวบางจุด'), d:I('Not a crash signal on its own. Watch VIX and credit — if they keep worsening, the risk jumps.', 'ยังไม่ใช่สัญญาณตลาดถล่ม ให้จับตา VIX และหุ้นกู้ ถ้าแย่ลงต่อ ความเสี่ยงจะพุ่งขึ้นเร็ว') }
      : expensive ? { c:'mid', t:I('Expensive, but nothing is pricking it yet.', 'แพง แต่ยังไม่มีอะไรมาเจาะ'), d:I('Expensive markets can keep rising for a long time. Stay invested with care: favour quality and avoid buying on borrowed money.', 'ตลาดแพงขึ้นต่อได้อีกนาน ลงทุนต่อได้แต่ระวัง เน้นหุ้นคุณภาพ และไม่กู้มาซื้อ') }
      : hot ? { c:'cy', t:I('Not expensive, but fear is high — often a chance, not a bubble.', 'ยังไม่แพง แต่ตลาดกลัวมาก — มักเป็นโอกาสมากกว่าฟองสบู่'), d:I('Fear without stretched prices tends to pass. Buying slowly in steps has usually worked better than selling.', 'ความกลัวที่ราคาไม่แพงมักผ่านไปเร็ว การทยอยซื้อเป็นงวดมักได้ผลดีกว่าการขายทิ้ง') }
      : { c:'good', t:I('Normal — no bubble pressure and no trigger.', 'ปกติ — ไม่มีแรงดันฟองสบู่และไม่มีตัวจุดชนวน'), d:I('A good time to stick to your plan and keep investing regularly.', 'เป็นช่วงที่ควรลงทุนตามแผนและสะสมต่อเนื่อง') };
    function sigRow(d){ var r = Math.round(d.risk); return '<div class="pzx-sig"><span class="n">' + esc(T(d.nm)) + '</span><span class="t"><i class="' + (r >= 60 ? 'bad' : r >= 35 ? 'mid' : 'good') + '" style="width:' + Math.max(3, Math.min(100, r)) + '%"></i></span><b>' + r + '%</b><em>' + esc(d.val || '') + '</em></div>'; }
    var html = '<div class="pzx-bub">' +
      '<div class="pzx-bub-l">' + ring(v, ['good', 'mid', 'bad', 'bad'][ti]) +
        '<div class="pzx-next">' + (toNext ? esc(T(I(toNext.toFixed(0) + ' pts to the next level', 'อีก ' + toNext.toFixed(0) + ' คะแนนจะขึ้นระดับถัดไป'))) : '') +
        (toPrev ? '<span>' + esc(T(I(toPrev.toFixed(0) + ' pts down to the level below', 'ลดลง ' + toPrev.toFixed(0) + ' คะแนนจะลงระดับล่าง'))) + '</span>' : '') + '</div></div>' +
      '<div class="pzx-bub-r">' + head(I('Bubble brain · what it all means', 'สมองเรดาร์ · สรุปความหมาย'), '<em class="' + q.c + '">' + esc(T(q.t)) + '</em>', esc(T(q.d)), cp.n + ' ' + T(I('signals', 'สัญญาณ'))) +
        '<div class="pzx-two">' +
          '<div class="pzx-col"><div class="pzx-ch dn">' + esc(T(I('Pushing the score up', 'ตัวที่ดันคะแนนขึ้น'))) + '</div>' + push.map(sigRow).join('') + '</div>' +
          '<div class="pzx-col"><div class="pzx-ch up">' + esc(T(I('Holding it down', 'ตัวที่ช่วยเบรก'))) + '</div>' + hold.map(sigRow).join('') + '</div>' +
        '</div>' +
        '<div class="pzx-ch cy" style="margin-top:14px">' + esc(T(I('Triggers — what usually pricks a bubble', 'ตัวจุดชนวน — สิ่งที่มักทำให้ฟองสบู่แตก'))) + '<span class="pzx-heat">' + heat + ' / ' + heatMax + '</span></div>' +
        '<div class="pzx-trig">' + trig.map(function(t){ return '<span class="' + (t.hot ? 'bad' : t.warm ? 'mid' : 'good') + '"><i></i>' + esc(T(t.n)) + '<b>' + esc(t.v) + '</b></span>'; }).join('') + '</div>' +
      '</div></div>';
    hero(sec, 'bubble', html, '[data-bb="body"]');
  }

  /* ======================= 7. STOCK TYPES infographics (menu 04) ======================= */
  function an(attr, vals, dur, begin, extra){ return RM ? '' : '<animate attributeName="' + attr + '" values="' + vals + '" dur="' + dur + 's" begin="' + (begin || 0) + 's" repeatCount="indefinite"' + (extra || '') + '/>'; }
  function draw(len, dur, begin){ return RM ? '' : '<animate attributeName="stroke-dashoffset" values="' + len + ';0;0;' + len + '" keyTimes="0;.4;.85;1" dur="' + dur + 's" begin="' + (begin || 0) + 's" repeatCount="indefinite"/>'; }
  function tx(x, y, s, cls, anchor){ return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'lb') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>'; }
  var DEFS = '<defs>' +
    '<linearGradient id="pzG1" x1="0" x2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>' +
    '<linearGradient id="pzG2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#22d3ee" stop-opacity=".55"/></linearGradient>' +
    '<linearGradient id="pzGap" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".38"/><stop offset="1" stop-color="#34d399" stop-opacity=".04"/></linearGradient>' +
    '<linearGradient id="pzRed" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fb7185" stop-opacity=".32"/><stop offset="1" stop-color="#fb7185" stop-opacity="0"/></linearGradient>' +
    '<radialGradient id="pzCoin"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></radialGradient>' +
    '<pattern id="pzGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(148,163,184,.08)" stroke-width="1"/></pattern>' +
    '</defs><rect width="320" height="150" fill="url(#pzGrid)"/>';
  var VIZ = {
    value:function(){
      var val = 'M14 64 C70 58,130 52,190 46 S280 36,306 32', px = 'M14 78 C50 92,80 112,112 116 C146 120,170 92,200 70 C230 50,262 40,306 34';
      return DEFS +
        '<path d="M112 116 C146 120,170 92,200 70 L200 47 C170 50,140 55,112 58 Z" fill="url(#pzGap)">' + an('opacity', '.5;1;.5', 3.6) + '</path>' +
        '<path d="' + val + '" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6 5" stroke-linecap="round"/>' +
        '<path d="' + px + '" fill="none" stroke="url(#pzG1)" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="420" stroke-dashoffset="420">' + draw(420, 6) + '</path>' +
        '<line x1="128" y1="56" x2="128" y2="117" stroke="#34d399" stroke-width="1.4"/><path d="M124 61 L128 55 L132 61 M124 112 L128 118 L132 112" fill="none" stroke="#34d399" stroke-width="1.4"/>' +
        '<circle cx="112" cy="116" r="5" fill="#22d3ee"/><circle cx="112" cy="116" r="10" fill="none" stroke="#22d3ee" stroke-width="1.4">' + an('r', '6;15;6', 2.4) + an('opacity', '1;0;1', 2.4) + '</circle>' +
        tx(16, 22, T(I('INTRINSIC VALUE', 'มูลค่าที่แท้จริง')), 'lb gold') + tx(16, 140, T(I('MARKET PRICE', 'ราคาตลาด')), 'lb cy') +
        tx(138, 80, T(I('DISCOUNT', 'ส่วนลด')), 'lb green') + tx(138, 92, 'Margin of safety', 'lb dim') +
        '<g transform="translate(64 120)"><rect x="-26" y="-12" width="52" height="18" rx="9" fill="rgba(34,211,238,.16)" stroke="#22d3ee" stroke-width=".8"/>' + tx(0, 1, T(I('BUY ZONE', 'จุดซื้อ')), 'lb cy', 'middle') + '</g>';
    },
    growth:function(){
      var hs = [18, 26, 34, 46, 60, 78, 98], s = DEFS;
      hs.forEach(function(h, i){
        var x = 22 + i * 40, y = 124 - h;
        s += '<rect x="' + x + '" y="' + y + '" width="22" height="' + h + '" rx="5" fill="url(#pzG2)">' +
          (RM ? '' : '<animate attributeName="height" values="0;' + h + ';' + h + ';0" keyTimes="0;.3;.85;1" dur="6s" begin="' + (i * .12).toFixed(2) + 's" repeatCount="indefinite"/><animate attributeName="y" values="124;' + y + ';' + y + ';124" keyTimes="0;.3;.85;1" dur="6s" begin="' + (i * .12).toFixed(2) + 's" repeatCount="indefinite"/>') + '</rect>' +
          tx(x + 11, 138, T(I('Y', 'ปี')) + (i + 1), 'lb dim', 'middle');
      });
      s += '<path d="M33 102 L73 98 L113 88 L153 80 L193 62 L233 48 L273 22" fill="none" stroke="rgba(244,114,182,.8)" stroke-width="1.6" stroke-dasharray="3 4"/>' +
        '<path d="M33 110 L50 96 L66 108 L84 90 L101 100 L120 80 L138 92 L160 66 L176 82 L198 54 L214 70 L236 40 L252 58 L274 26" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>' +
        '<g transform="translate(262 30)"><rect x="-42" y="-14" width="84" height="22" rx="11" fill="rgba(167,139,250,.18)" stroke="#a78bfa" stroke-width=".8"/>' + tx(0, 1, T(I('+25%/yr', 'โต 25%/ปี')), 'lb violet', 'middle') + '</g>' +
        tx(16, 22, T(I('REVENUE & PROFIT', 'รายได้และกำไร')), 'lb violet') + tx(16, 36, T(I('white line = price swings more', 'เส้นขาว = ราคาแกว่งแรงกว่า')), 'lb dim');
      return s;
    },
    dividend:function(){
      var s = DEFS +
        '<g transform="translate(22 46)"><rect width="62" height="58" rx="8" fill="rgba(34,211,238,.10)" stroke="#22d3ee" stroke-width="1"/><path d="M10 50V22l21-12 21 12v28" fill="none" stroke="#22d3ee" stroke-width="1.6"/><rect x="24" y="32" width="14" height="18" fill="none" stroke="#22d3ee" stroke-width="1.4"/></g>' +
        tx(53, 120, T(I('COMPANY PROFIT', 'กำไรบริษัท')), 'lb cy', 'middle') +
        '<g transform="translate(232 44)"><rect width="70" height="60" rx="10" fill="rgba(52,211,153,.10)" stroke="#34d399" stroke-width="1"/><path d="M12 22h46v28H12z" fill="none" stroke="#34d399" stroke-width="1.5"/><circle cx="46" cy="36" r="3" fill="#34d399"/></g>' +
        tx(267, 120, T(I('YOUR ACCOUNT', 'บัญชีของคุณ')), 'lb green', 'middle') +
        '<path id="pzDivP" d="M86 74 C130 40,190 40,230 74" fill="none" stroke="rgba(251,191,36,.35)" stroke-width="1.4" stroke-dasharray="4 5"/>';
      for(var i = 0; i < 4; i++) s += '<circle r="6" fill="url(#pzCoin)" stroke="#b45309" stroke-width=".6" opacity="' + (RM ? 1 : 0) + '"' + (RM ? ' cx="' + (100 + i * 36) + '" cy="52"' : '') + '>' +
        (RM ? '' : '<animateMotion dur="3.2s" begin="' + (i * .8) + 's" repeatCount="indefinite"><mpath href="#pzDivP"/></animateMotion><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.85;1" dur="3.2s" begin="' + (i * .8) + 's" repeatCount="indefinite"/>') + '</circle>';
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(function(qn, i){
        var x = 112 + i * 26;
        s += '<g transform="translate(' + x + ' 104)"><rect x="-10" y="-2" width="20" height="' + (8 + i * 5) + '" rx="3" fill="rgba(251,191,36,.25)" stroke="#fbbf24" stroke-width=".6"/>' + tx(0, 30, qn, 'lb gold', 'middle') + '</g>';
      });
      return s + tx(16, 22, T(I('CASH ON A SCHEDULE', 'เงินปันผลเข้าตามรอบ')), 'lb gold') + tx(304, 22, T(I('≈ 3–6% a year', 'ราว 3–6% ต่อปี')), 'lb dim', 'end');
    },
    defensive:function(){
      var mk = 'M14 40 C60 40,90 46,120 66 C150 90,180 112,210 114 C240 116,270 96,306 86', df = 'M14 46 C60 46,96 50,126 56 C160 62,190 66,220 64 C250 62,280 58,306 54';
      return DEFS +
        '<path d="' + mk + ' L306 140 L14 140 Z" fill="url(#pzRed)"/>' +
        '<path d="' + mk + '" fill="none" stroke="#fb7185" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="400">' + draw(400, 6) + '</path>' +
        '<path d="' + df + '" fill="none" stroke="#34d399" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="400">' + draw(400, 6, .4) + '</path>' +
        '<g transform="translate(228 30)"><path d="M0 -12 L12 -7 V3 C12 11,6 16,0 19 C-6 16,-12 11,-12 3 V-7 Z" fill="rgba(52,211,153,.18)" stroke="#34d399" stroke-width="1.4">' + an('opacity', '.6;1;.6', 2.6) + '</path><path d="M-5 3 L-1 7 L6 -2" fill="none" stroke="#34d399" stroke-width="1.6"/></g>' +
        tx(16, 22, T(I('WHEN THE MARKET FALLS', 'เวลาตลาดลง')), 'lb dim') +
        '<g transform="translate(150 132)"><rect x="-40" y="-12" width="80" height="18" rx="9" fill="rgba(251,113,133,.14)" stroke="#fb7185" stroke-width=".7"/>' + tx(0, 1, T(I('Market −30%', 'ตลาด −30%')), 'lb red', 'middle') + '</g>' +
        '<g transform="translate(262 84)"><rect x="-46" y="-12" width="92" height="18" rx="9" fill="rgba(52,211,153,.14)" stroke="#34d399" stroke-width=".7"/>' + tx(0, 1, T(I('Defensive −8%', 'หุ้นตั้งรับ −8%')), 'lb green', 'middle') + '</g>';
    }
  };
  function types(){
    var cards = document.querySelectorAll('#types .archetype-card'); if(cards.length < 4) return;
    var keys = ['value', 'growth', 'dividend', 'defensive'], lang = L();
    cards.forEach(function(card, i){
      var box = card.querySelector('.arch-viz'); if(!box || !keys[i]) return;
      if(box.__pzx === lang) return;
      var svg = box.querySelector('svg');
      var neu = '<svg class="arch-svg pzx-arch" viewBox="0 0 320 150" preserveAspectRatio="xMidYMid meet" role="img">' + VIZ[keys[i]]() + '</svg>';
      if(svg) svg.outerHTML = neu; else box.insertAdjacentHTML('afterbegin', neu);
      box.__pzx = lang; box.classList.add('pzx-av'); card.classList.add('pzx-arch-card'); card.setAttribute('data-arch', keys[i]);
    });
  }

  /* ======================= run ======================= */
  function routeOn(id){ var s = document.getElementById(id); return !!(s && s.offsetParent !== null && s.getBoundingClientRect().height > 40); }
  function tick(){
    try { chip(); } catch(e){}
    try { if(routeOn('daily')) daily(); } catch(e){}
    try { if(routeOn('outlook')) outlook(); } catch(e){}
    try { if(routeOn('flow')) flow(); } catch(e){}
    try { if(routeOn('bubble')) bubble(); } catch(e){}
    try { if(routeOn('types')) types(); } catch(e){}
  }
  function clear(){ document.querySelectorAll('.pzx-hero').forEach(function(h){ h.__html = null; }); document.querySelectorAll('.arch-viz').forEach(function(b){ b.__pzx = null; }); }
  setInterval(tick, 1500);
  ['spz:snapshot', 'spz:cycle', 'spz:bubbleData'].forEach(function(ev){ document.addEventListener(ev, function(){ setTimeout(tick, 120); }); });
  new MutationObserver(function(){ clear(); var p = document.querySelector('#spzCyc [data-c="pop"]'); if(p) p.querySelectorAll('.cyc-bd').forEach(function(d){ var b = d.closest('.cyc-b'); var k = b && b.getAttribute('data-ph'); if(k) d.textContent = T(PH_DESC[k]); }); setTimeout(tick, 60); })
    .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  setTimeout(tick, 900);
})();
