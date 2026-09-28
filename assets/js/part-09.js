
/* ---------- Pro Desk: Real Data Add-On ----------
   Independent of the simulated-modules script above; only touches its
   own DOM ids and reads window.__SPZ_LIVE.historyOf, which the live
   quote script exposes. Never throws into the rest of the page.
   Bilingual via a tiny local bi(en, th) helper, mirroring the rest of
   the site's document.documentElement.lang convention. */
(function(){
  'use strict';

  function isTH(){ return document.documentElement.lang === 'th'; }
  function bi(en, th){ return isTH() ? th : en; }

  function fmtPct(x){ return (x >= 0 ? '+' : '') + (x * 100).toFixed(2) + '%'; }
  function fmtMoney(x){ return '$' + x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function mean(a){ return a.reduce(function(s,v){ return s+v; }, 0) / a.length; }
  function dailyReturns(closes){
    var out = [];
    for (var i = 1; i < closes.length; i++){
      if (closes[i-1]) out.push((closes[i] - closes[i-1]) / closes[i-1]);
    }
    return out;
  }
  function stdev(a, m){
    if (a.length < 2) return 0;
    var v = a.reduce(function(s,x){ return s + (x-m)*(x-m); }, 0) / (a.length - 1);
    return Math.sqrt(v);
  }
  function randn(){
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* ---- Volume Profile: real intraday bars -> volume-by-price ---- */
  function renderVolumeProfile(bars, ticker){
    var body = document.getElementById('proRealVP');
    if (!bars || bars.length < 5){
      body.innerHTML = '<p class="w-note">' + bi(
        'Not enough intraday bars came back for ' + ticker + ' (thin volume, or market closed for this name). Try a heavily-traded US ticker during US market hours.',
        'ข้อมูลรายบาร์ระหว่างวันของ ' + ticker + ' กลับมาไม่พอ (วอลุ่มบางหรือตลาดของหุ้นนี้ปิดอยู่) ลองใช้หุ้นสหรัฐฯ ที่มีการซื้อขายหนาแน่นในช่วงเวลาตลาดเปิด'
      ) + '</p>';
      return;
    }
    var lo = Math.min.apply(null, bars.map(function(b){ return b.l; }));
    var hi = Math.max.apply(null, bars.map(function(b){ return b.h; }));
    if (!(hi > lo)) { body.innerHTML = '<p class="w-note">' + bi('Range was flat — nothing to bucket.', 'ราคานิ่งเกินไป ไม่มีช่วงให้แบ่งกลุ่ม') + '</p>'; return; }
    var BINS = 12;
    var width = (hi - lo) / BINS;
    var buckets = new Array(BINS).fill(0);
    bars.forEach(function(b){
      var idx = Math.min(BINS - 1, Math.max(0, Math.floor((b.c - lo) / width)));
      buckets[idx] += b.v;
    });
    var total = buckets.reduce(function(s,v){ return s+v; }, 0) || 1;
    var pocIdx = buckets.indexOf(Math.max.apply(null, buckets));
    /* expand outward from POC until >=70% of volume is covered -> value area */
    var covered = buckets[pocIdx], lo_i = pocIdx, hi_i = pocIdx, vaLo = pocIdx, vaHi = pocIdx;
    while (covered / total < 0.70 && (lo_i > 0 || hi_i < BINS - 1)){
      var downVol = lo_i > 0 ? buckets[lo_i - 1] : -1;
      var upVol = hi_i < BINS - 1 ? buckets[hi_i + 1] : -1;
      if (upVol >= downVol){ hi_i++; covered += buckets[hi_i]; vaHi = hi_i; }
      else { lo_i--; covered += buckets[lo_i]; vaLo = lo_i; }
    }
    var maxB = Math.max.apply(null, buckets);
    var rowsHtml = '';
    var pocTag = bi('POC', 'POC'), vaTag = bi('VA', 'VA');
    for (var i = BINS - 1; i >= 0; i--){
      var priceLo = lo + i * width;
      var pct = maxB ? (buckets[i] / maxB * 100) : 0;
      var isPoc = (i === pocIdx);
      rowsHtml += '<div class="pr-row' + (isPoc ? ' poc' : '') + '">' +
        '<span class="pr-l">' + priceLo.toFixed(1) + '</span>' +
        '<span class="pr-bar-wrap"><span class="pr-bar" style="width:' + pct.toFixed(1) + '%"></span></span>' +
        '<span class="pr-v">' + (isPoc ? pocTag : (i >= vaLo && i <= vaHi ? vaTag : '')) + '</span></div>';
    }
    var last = bars[bars.length - 1].c;
    var pocPrice = lo + (pocIdx + 0.5) * width;
    body.innerHTML =
      '<div class="pr-stat-row"><span>' + ticker + ' ' + bi('last', 'ราคาล่าสุด') + '</span><b>' + last.toFixed(2) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Point of Control', 'จุด Point of Control') + '</span><b>' + pocPrice.toFixed(2) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Value area (70%)', 'Value Area (70%)') + '</span><b>' + (lo + vaLo*width).toFixed(2) + ' – ' + (lo + (vaHi+1)*width).toFixed(2) + '</b></div>' +
      '<div style="margin-top:10px;display:flex;flex-direction:column;gap:3px;">' + rowsHtml + '</div>';
  }

  /* ---- Factor Attribution + inputs for Monte Carlo ---- */
  function computeFactors(stockBars, benchBars){
    var n = Math.min(stockBars.length, benchBars.length);
    var sC = stockBars.slice(stockBars.length - n).map(function(b){ return b.c; });
    var bC = benchBars.slice(benchBars.length - n).map(function(b){ return b.c; });
    var sR = dailyReturns(sC), bR = dailyReturns(bC);
    var m = Math.min(sR.length, bR.length);
    sR = sR.slice(sR.length - m); bR = bR.slice(bR.length - m);
    if (m < 20) return null;
    var meanS = mean(sR), meanB = mean(bR);
    var cov = 0;
    for (var i = 0; i < m; i++) cov += (sR[i]-meanS) * (bR[i]-meanB);
    cov /= (m - 1);
    var varB = stdev(bR, meanB); varB = varB * varB;
    var beta = varB ? (cov / varB) : 0;
    var totalStock = sC[sC.length-1] / sC[0] - 1;
    var totalBench = bC[bC.length-1] / bC[0] - 1;
    var marketContribution = beta * totalBench;
    var residual = totalStock - marketContribution;
    var annVol = stdev(sR, meanS) * Math.sqrt(252);
    var annReturn = meanS * 252;
    return {
      beta: beta, totalStock: totalStock, totalBench: totalBench,
      marketContribution: marketContribution, residual: residual,
      annVol: annVol, annReturn: annReturn, days: m
    };
  }

  function renderFactors(f, ticker, bench){
    var body = document.getElementById('proRealFA');
    if (!f){ body.innerHTML = '<p class="w-note">' + bi(
      'Not enough overlapping trading days between ' + ticker + ' and ' + bench + ' to compute this yet.',
      'จำนวนวันซื้อขายที่ทับซ้อนกันระหว่าง ' + ticker + ' กับ ' + bench + ' ยังไม่พอให้คำนวณ'
    ) + '</p>'; return; }
    body.innerHTML =
      '<div class="pr-stat-row"><span>' + ticker + ' ' + bi('total return (' + f.days + 'd)', 'ผลตอบแทนรวม (' + f.days + ' วัน)') + '</span><b>' + fmtPct(f.totalStock) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Beta vs ' + bench, 'เบต้าเทียบกับ ' + bench) + '</span><b>' + f.beta.toFixed(2) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Market contribution (β·R_mkt)', 'ส่วนที่มาจากตลาด (β·R_mkt)') + '</span><b>' + fmtPct(f.marketContribution) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Residual (alpha)', 'ส่วนที่เหลือ (alpha)') + '</span><b>' + fmtPct(f.residual) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Annualized volatility', 'ความผันผวนต่อปี') + '</span><b>' + (f.annVol*100).toFixed(1) + '%</b></div>' +
      '<p class="w-note" style="margin-top:8px;">' + bi(
        'Residual is whatever the stock did beyond what its beta to ' + bench + ' explains — real skill, real idiosyncratic risk, or just noise over ' + f.days + ' trading days. Not a Barra-grade multi-factor model, just market beta.',
        'ส่วนที่เหลือคือสิ่งที่หุ้นทำได้เกินกว่าที่เบต้าต่อ ' + bench + ' อธิบายได้ — อาจเป็นฝีมือจริง ความเสี่ยงเฉพาะตัวจริง หรือแค่ noise ตลอด ' + f.days + ' วันซื้อขาย ไม่ใช่โมเดลหลายปัจจัยแบบ Barra เต็มรูปแบบ เป็นแค่เบต้าต่อตลาดเท่านั้น'
      ) + '</p>';
  }

  /* ---- Monte Carlo from real drift/vol ---- */
  function renderMonteCarlo(f){
    var body = document.getElementById('proRealMC');
    if (!f){ body.innerHTML = '<p class="w-note">' + bi('Needs the factor calculation above to succeed first (same fetch).', 'ต้องรอให้การคำนวณ Factor ด้านบนสำเร็จก่อน (ดึงข้อมูลชุดเดียวกัน)') + '</p>'; return; }
    var mu = f.annReturn, sigma = Math.max(f.annVol, 0.02);
    var dt = 1/252, steps = 252, paths = 2000, S0 = 10000;
    var finals = new Array(paths);
    for (var p = 0; p < paths; p++){
      var S = S0;
      for (var t = 0; t < steps; t++){
        S *= Math.exp((mu - sigma*sigma/2) * dt + sigma * Math.sqrt(dt) * randn());
      }
      finals[p] = S;
    }
    finals.sort(function(a,b){ return a-b; });
    var p5 = finals[Math.floor(paths*0.05)], p50 = finals[Math.floor(paths*0.50)], p95 = finals[Math.floor(paths*0.95)];
    var lo = Math.min(p5, S0*0.4), hi = Math.max(p95, S0*1.6);
    var pct = function(v){ return ((v - lo) / (hi - lo)) * 100; };
    body.innerHTML =
      '<div class="pr-stat-row"><span>' + bi('Drift used (real, annualized)', 'ดริฟท์ที่ใช้ (จริง, ต่อปี)') + '</span><b>' + fmtPct(mu) + '</b></div>' +
      '<div class="pr-stat-row"><span>' + bi('Volatility used (real, annualized)', 'ความผันผวนที่ใช้ (จริง, ต่อปี)') + '</span><b>' + (sigma*100).toFixed(1) + '%</b></div>' +
      '<p class="w-note" style="margin-top:6px;">' + bi(
        '$10,000 hypothetical position, 2,000 simulated one-year paths, real drift/vol as inputs:',
        'สมมติเงินลงทุน $10,000 จำลอง 2,000 เส้นทางระยะเวลา 1 ปี โดยใช้ดริฟท์/ความผันผวนจริงเป็นตัวป้อน:'
      ) + '</p>' +
      '<div class="pr-mc-range">' +
        '<span class="pr-mc-band" style="left:' + pct(p5).toFixed(1) + '%;width:' + (pct(p95)-pct(p5)).toFixed(1) + '%"></span>' +
        '<span class="pr-mc-med" style="left:' + pct(p50).toFixed(1) + '%"></span>' +
      '</div>' +
      '<div class="pr-mc-labels"><span>' + bi('5th', 'เปอร์เซ็นไทล์ 5') + ': ' + fmtMoney(p5) + '</span><span>' + bi('median', 'ค่ากลาง') + ': ' + fmtMoney(p50) + '</span><span>' + bi('95th', 'เปอร์เซ็นไทล์ 95') + ': ' + fmtMoney(p95) + '</span></div>';
  }

  function setStatus(msg, isErr){
    var s = document.getElementById('proRealStatus');
    if (!s) return;
    s.textContent = msg;
    s.classList.toggle('err', !!isErr);
  }

  function runFetch(){
    var live = window.__SPZ_LIVE;
    if (!live || !live.historyOf){
      setStatus(bi('Live data module not ready yet — try again in a moment.', 'โมดูลข้อมูลสดยังไม่พร้อม ลองใหม่อีกครั้งในอีกสักครู่'), true);
      return;
    }
    var tEl = document.getElementById('proRealTicker'), bEl = document.getElementById('proRealBench');
    var ticker = (tEl.value || 'AAPL').trim().toUpperCase();
    var bench = (bEl.value || 'SPY').trim().toUpperCase();
    var btn = document.getElementById('proRealFetch');
    btn.disabled = true;
    setStatus(bi('Fetching real data for ' + ticker + '…', 'กำลังดึงข้อมูลจริงของ ' + ticker + '…'));

    var vpDone = live.historyOf(ticker, '1d', '5m')
      .then(function(bars){ renderVolumeProfile(bars, ticker); })
      .catch(function(){ document.getElementById('proRealVP').innerHTML = '<p class="w-note">' + bi(
        'Intraday fetch failed for ' + ticker + ' — proxy may be rate-limited. Try again shortly.',
        'ดึงข้อมูลระหว่างวันของ ' + ticker + ' ไม่สำเร็จ — proxy อาจถูกจำกัดจำนวนครั้ง ลองใหม่อีกสักครู่'
      ) + '</p>'; });

    var faDone = Promise.all([
      live.historyOf(ticker, '1y', '1d'),
      live.historyOf(bench, '1y', '1d')
    ]).then(function(res){
      var f = computeFactors(res[0], res[1]);
      renderFactors(f, ticker, bench);
      renderMonteCarlo(f);
    }).catch(function(){
      document.getElementById('proRealFA').innerHTML = '<p class="w-note">' + bi(
        '1-year history fetch failed for ' + ticker + ' or ' + bench + ' — proxy may be rate-limited. Try again shortly.',
        'ดึงข้อมูลย้อนหลัง 1 ปีของ ' + ticker + ' หรือ ' + bench + ' ไม่สำเร็จ — proxy อาจถูกจำกัดจำนวนครั้ง ลองใหม่อีกสักครู่'
      ) + '</p>';
      document.getElementById('proRealMC').innerHTML = '<p class="w-note">' + bi('Needs the factor fetch above to succeed first.', 'ต้องรอให้การดึงข้อมูล Factor ด้านบนสำเร็จก่อน') + '</p>';
    });

    Promise.all([vpDone, faDone]).finally(function(){
      btn.disabled = false;
      setStatus(bi('Last fetched ' + new Date().toLocaleTimeString() + '.', 'ดึงข้อมูลล่าสุดเมื่อ ' + new Date().toLocaleTimeString() + ' น.'));
    });
  }

  function wire(){
    var btn = document.getElementById('proRealFetch');
    if (!btn || btn.__wired) return;
    btn.__wired = true;
    btn.addEventListener('click', runFetch);
    [document.getElementById('proRealTicker'), document.getElementById('proRealBench')].forEach(function(el){
      if (!el) return;
      el.addEventListener('keydown', function(e){ if (e.key === 'Enter') runFetch(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
