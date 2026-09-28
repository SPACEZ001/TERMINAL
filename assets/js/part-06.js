
  (function(){
    'use strict';
    if (window.__SPZ_ESS) return;
    window.__SPZ_ESS = true;

    function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
    function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
    function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function isNum(v){ return typeof v === 'number' && isFinite(v); }
    function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
    function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
    function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }

    var C = {
      h:{en:'Early Signal Screener',th:'สแกนหุ้นก่อนกระแส'},
      lede:{en:'A composite score out of 100, blending three things this site already tracks: technical positioning (overheated, or still room to run), valuation against sector peers (cheap or expensive), and sector fund flow (is money rotating into its group faster than the stock itself has moved). A high score flags a stock that has not been bid up yet but shows signs money may follow — not a stock that is already trending.',
            th:'คะแนนรวมเต็ม 100 จาก 3 อย่างที่เว็บนี้มีข้อมูลอยู่แล้ว: ตำแหน่งทางเทคนิค (ร้อนแรงเกินไปหรือยังมีที่ว่าง), มูลค่าเทียบเพื่อนในกลุ่มเดียวกัน (ถูกหรือแพง), และกระแสเงินในกลุ่มอุตสาหกรรม (เงินหมุนเข้ากลุ่มเร็วกว่าที่หุ้นตัวนี้ขยับหรือยัง) คะแนนสูง = หุ้นที่ยังไม่ถูกไล่ราคา แต่เริ่มมีสัญญาณว่าเงินอาจตามมา ไม่ใช่หุ้นที่กำลังติดกระแสอยู่แล้ว'},
      waiting:{en:'Waiting for the market snapshot…',th:'รอข้อมูลตลาด…'},
      empty:{en:'Nothing scores high enough right now — no strong candidates in this snapshot.',th:'ตอนนี้ยังไม่มีหุ้นตัวไหนคะแนนสูงพอ — ไม่มีตัวเด่นในชุดข้อมูลนี้ตอนนี้'},
      legTech:{en:'Technical room',th:'พื้นที่ทางเทคนิค'},
      legVal:{en:'Cheap vs peers',th:'ถูกกว่าเพื่อน'},
      legFlow:{en:'Sector catch-up',th:'ตามกระแสกลุ่ม'},
      noVal:{en:'no peer valuation data',th:'ไม่มีข้อมูลมูลค่าเทียบเพื่อน'},
      whyOff:{en:'{v}% off its 12-month high',th:'ห่างจากจุดสูงสุดรอบปี {v}%'},
      whyRsi:{en:'RSI at {v}',th:'RSI อยู่ที่ {v}'},
      whyVal:{en:'cheaper than {v}% of its sector peers',th:'ถูกกว่าเพื่อนในกลุ่มเดียวกัน {v}%'},
      whyFlow:{en:'money has rotated into {s} {a}% while this stock moved {b}%',
               th:'เงินหมุนเข้ากลุ่ม {s} {a}% ขณะที่หุ้นตัวนี้ขยับแค่ {b}%'},
      legend:{en:'A statistical screen built from historical patterns already used elsewhere on this site (RSI, moving averages, peer valuation, sector fund flow) — not a forecast, not investment advice, and no guarantee any of these actually move. A shortlist to research further, not a buy list.',
              th:'เป็นตัวคัดกรองเชิงสถิติจากรูปแบบเดิมที่เว็บนี้ใช้อยู่แล้ว (RSI เส้นค่าเฉลี่ย มูลค่าเทียบเพื่อน กระแสเงินในกลุ่ม) ไม่ใช่การพยากรณ์หรือคำแนะนำการลงทุน และไม่มีอะไรรับประกันว่าหุ้นเหล่านี้จะขึ้นจริง ใช้เป็นรายชื่อไปค้นคว้าต่อ ไม่ใช่รายการให้ซื้อ'}
    };

    /* map this site's stock-level sector labels onto the sector-flow ETF
       group names — the two data sets were built independently and do not
       always spell a sector the same way (e.g. "Healthcare" vs "Health care") */
    var SECTOR_MAP = {
      'Communication Services':'Communication',
      'Consumer Cyclical':'Consumer cyclical',
      'Consumer Defensive':'Consumer staples',
      'Energy':'Energy',
      'Financial Services':'Financials',
      'Healthcare':'Health care',
      'Industrials':'Industrials',
      'Real Estate':'Real estate',
      'Technology':'Technology',
      'Utilities':'Utilities'
    };

    function pctRank(list, val, lowerIsBetter){
      if (!list.length) return null;
      var beat = list.filter(function(x){ return lowerIsBetter ? x > val : x < val; }).length;
      return beat / list.length * 100;
    }

    /* leg 1 — how much technical room is left: healthy-zone RSI, a
       constructive distance off the 52-week high (not already there),
       still inside the longer uptrend structure */
    function techLeg(r){
      if (!isNum(r.rsi) || !isNum(r.off_high)) return null;
      var rsiScore = clamp(100 - Math.abs(r.rsi - 55) * 2.2, 0, 100);
      if (r.rsi >= 72) rsiScore *= 0.4;
      if (r.rsi <= 25) rsiScore *= 0.6;

      var oh = r.off_high, ohScore;
      if (oh >= -3) ohScore = 20;
      else if (oh >= -35) ohScore = clamp(100 - Math.abs(oh + 20) * 2.2, 0, 100);
      else ohScore = clamp(60 - (Math.abs(oh) - 35) * 1.5, 0, 100);

      var structScore = 50;
      if (r.above_ma200) structScore += 25; else structScore -= 15;
      if (isNum(r.vs_ma50)) {
        if (r.vs_ma50 < 0 && r.vs_ma50 > -8) structScore += 15;
        else if (r.vs_ma50 >= 0 && r.vs_ma50 < 5) structScore += 10;
        else if (r.vs_ma50 <= -8) structScore -= 10;
      }
      if (r.divergence === 'bullish') structScore += 15;
      if (r.divergence === 'bearish') structScore -= 20;
      if (r.cross === 'golden') structScore += 15;
      if (r.cross === 'death') structScore -= 20;
      structScore = clamp(structScore, 0, 100);

      return { score: rsiScore * 0.4 + ohScore * 0.3 + structScore * 0.3, rsi: r.rsi, off: oh };
    }

    /* leg 2 — cheaper or pricier than same-sector, same-currency peers */
    function valLeg(t, r, allRows){
      var peers = Object.keys(allRows).filter(function(k){
        return k !== t && allRows[k].sector === r.sector && allRows[k].ccy === r.ccy;
      });
      if (peers.length < 4) {
        peers = Object.keys(allRows).filter(function(k){ return k !== t && allRows[k].sector === r.sector; });
      }
      if (peers.length < 4) return null;
      var parts = [], pePct = null, pbPct = null;
      if (isNum(r.pe) && r.pe > 0) {
        var peList = peers.map(function(k){ return allRows[k].pe; }).filter(function(v){ return isNum(v) && v > 0; });
        pePct = pctRank(peList, r.pe, true);
        if (pePct != null) parts.push(pePct);
      }
      if (isNum(r.pb) && r.pb > 0) {
        var pbList = peers.map(function(k){ return allRows[k].pb; }).filter(function(v){ return isNum(v) && v > 0; });
        pbPct = pctRank(pbList, r.pb, true);
        if (pbPct != null) parts.push(pbPct);
      }
      if (!parts.length) return null;
      var score = parts.reduce(function(a,b){ return a+b; }, 0) / parts.length;
      return { score: score, pePct: pePct != null ? pePct : pbPct };
    }

    /* leg 3 — is this stock's sector attracting flow faster than the
       stock itself has already moved (catch-up room), and how does that
       sector's flow rank against the other 11 */
    function flowLeg(r, flowRows){
      var mapped = SECTOR_MAP[r.sector];
      if (!mapped) return null;
      var row = null;
      for (var i = 0; i < flowRows.length; i++) { if (flowRows[i].en === mapped) { row = flowRows[i]; break; } }
      if (!row || !isNum(row.m1)) return null;
      var others = flowRows.filter(function(x){ return x !== row && isNum(x.m1); }).map(function(x){ return x.m1; });
      var rankPct = pctRank(others, row.m1, false);
      if (rankPct == null) rankPct = 50;
      var stockM1 = isNum(r.m1) ? r.m1 : 0;
      var gap = row.m1 - stockM1;
      var gapScore = clamp(50 + gap * 4, 0, 100);
      return { score: rankPct * 0.45 + gapScore * 0.55, sector: row, stockM1: stockM1 };
    }

    function compute(){
      var s = snap();
      if (!s || !s.stocks) return null;
      var allRows = s.stocks;
      var flowRows = (s.flows && s.flows.sector) || [];
      var out = [];
      Object.keys(allRows).forEach(function(t){
        var r = allRows[t];
        var tech = techLeg(r);
        var flow = flowLeg(r, flowRows);
        if (!tech || !flow) return;
        var val = valLeg(t, r, allRows);
        var legs = [tech.score, flow.score], wsum = 2;
        if (val) { legs.push(val.score); wsum = 3; }
        var composite = legs.reduce(function(a,b){ return a+b; }, 0) / wsum;
        out.push({ t:t, r:r, tech:tech, val:val, flow:flow, composite:composite });
      });
      out.sort(function(a,b){ return b.composite - a.composite; });
      return out.filter(function(x){ return x.composite >= 55; }).slice(0, 8);
    }

    function fill(str, vals){
      return Object.keys(vals).reduce(function(s, k){ return s.split('{' + k + '}').join(vals[k]); }, str);
    }

    function whyHTML(x){
      var parts = [];
      parts.push(fill(tx(C.whyOff), { v: Math.abs(x.tech.off).toFixed(1) }));
      parts.push(fill(tx(C.whyRsi), { v: x.tech.rsi.toFixed(0) }));
      if (x.val) parts.push(fill(tx(C.whyVal), { v: x.val.pePct.toFixed(0) }));
      parts.push(fill(tx(C.whyFlow), {
        s: esc(tx(x.flow.sector)), a: sgn(x.flow.sector.m1, 1), b: sgn(x.flow.stockM1, 1)
      }));
      return parts.join(' · ');
    }

    function legHTML(label, score){
      return '<div class="ess-leg"><div class="ess-leg-l"><span>' + esc(label) + '</span><span>' +
        Math.round(score) + '</span></div><div class="ess-bar"><i style="width:' + clamp(score,0,100).toFixed(0) + '%"></i></div></div>';
    }

    function rowHTML(x, i){
      var scCls = x.composite >= 70 ? 'hi' : 'mid';
      return '<div class="ess-row" data-ess-go="' + esc(x.t) + '">' +
        '<div class="ess-top">' +
          '<div class="ess-id"><span class="ess-rank">' + (i + 1) + '</span>' +
            '<span class="ess-tk">' + esc(x.t) + '</span>' +
            '<span class="ess-nm">' + esc(x.r.name || '') + '</span>' +
            '<span class="ess-sec">' + esc(x.r.sector || '') + '</span></div>' +
          '<div class="ess-sc ' + scCls + '">' + Math.round(x.composite) + '<small>/100</small></div>' +
        '</div>' +
        '<div class="ess-legs">' +
          legHTML(tx(C.legTech), x.tech.score) +
          legHTML(tx(C.legVal), x.val ? x.val.score : 50) +
          legHTML(tx(C.legFlow), x.flow.score) +
        '</div>' +
        '<div class="ess-why">' + whyHTML(x) + (x.val ? '' : ' · ' + esc(tx(C.noVal))) + '</div>' +
      '</div>';
    }

    var root = document.getElementById('earlySignalScreener');
    var cache = null;

    function paint(){
      if (!root) return;
      var q = function(k){ return root.querySelector('[data-ess="' + k + '"]'); };
      if (q('h')) q('h').textContent = tx(C.h);
      if (q('lede')) q('lede').textContent = tx(C.lede);
      if (q('legend')) q('legend').textContent = tx(C.legend);

      var list = q('list');
      if (!list) return;
      var s = snap();
      if (!s) { list.innerHTML = '<div class="ess-empty">' + esc(tx(C.waiting)) + '</div>'; return; }
      cache = compute();
      if (!cache || !cache.length) { list.innerHTML = '<div class="ess-empty">' + esc(tx(C.empty)) + '</div>'; return; }
      list.innerHTML = cache.map(rowHTML).join('');
      list.querySelectorAll('[data-ess-go]').forEach(function(el){
        el.addEventListener('click', function(){
          var tk = el.getAttribute('data-ess-go');
          if (window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(tk);
        });
      });
    }

    if (root) {
      paint();
      document.addEventListener('spz:snapshot', function(){ cache = null; paint(); });
      new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    }
  })();
  