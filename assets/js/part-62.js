
(function(){
  'use strict';
  if (window.__SPZ_QUIETVALUE) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  function fill(str, vars){
    return Object.keys(vars).reduce(function(s, k){ return s.split('{' + k + '}').join(vars[k]); }, str);
  }
  function snapshot(){
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
    catch(e){ return null; }
  }

  var T = {
    eyebrow:{en:'ADMIN — QUIET VALUE SCANNER',th:'แอดมิน — สแกนหุ้นถูกที่ยังเงียบ'},
    h:{en:'Cheap, Solid, And Nobody’s Watching Yet',th:'ถูก พื้นฐานดี และยังไม่มีใครสนใจ'},
    lede:{en:'A different lens from the Early Signal Screener on purpose: that tool looks for stocks with bullish technical structure already forming. This one looks for the opposite — stocks trading cheap against the ENTIRE tracked universe (not just their own sector), with solid fundamentals, that are technically dead quiet (RSI near neutral, barely moved this month) and sitting a meaningful — but not catastrophic — distance below their 52-week high. The idea Micron-style: not yet in the spotlight, nothing broken, just unnoticed.',
      th:'ตั้งใจให้มองต่างมุมจากสแกนหุ้นก่อนกระแส (Early Signal Screener) — ตัวนั้นหาหุ้นที่โครงสร้างเทคนิคเริ่มเป็นขาขึ้นแล้ว ส่วนตัวนี้หาหุ้นที่ตรงข้าม: ถูกเมื่อเทียบกับ "หุ้นทั้งหมด" ที่ติดตาม (ไม่ใช่แค่กลุ่มอุตสาหกรรมเดียวกัน) พื้นฐานแข็งแรง เทคนิคเงียบสนิท (RSI ใกล้กลาง ขยับน้อยมากในเดือนนี้) และอยู่ห่างจากจุดสูงสุดรอบ 52 สัปดาห์พอสมควรแต่ไม่ถึงขั้นพังยับเยิน แนวคิดแบบ Micron: ยังไม่เป็นกระแส แต่ก็ไม่มีอะไรเสียหาย แค่ยังไม่มีใครมอง'},
    waiting:{en:'Waiting for the market snapshot…',th:'รอข้อมูลตลาด…'},
    empty:{en:'Nothing scores high enough right now — no quiet-value candidates in this snapshot.',th:'ตอนนี้ยังไม่มีหุ้นตัวไหนคะแนนสูงพอ — ไม่มีตัวเข้าเกณฑ์ในชุดข้อมูลนี้ตอนนี้'},
    searchPh:{en:'Search ticker or company…',th:'ค้นหาชื่อย่อหรือชื่อบริษัท…'},
    legVal:{en:'Cheap vs whole market',th:'ถูกเทียบทั้งตลาด'},
    legQual:{en:'Fundamentals',th:'พื้นฐาน'},
    legQuiet:{en:'Technically quiet',th:'เทคนิคเงียบ'},
    legRoom:{en:'Room below high',th:'ระยะห่างจากจุดสูงสุด'},
    whyVal:{en:'cheaper than {v}% of every tracked stock on P/E and P/B',th:'ถูกกว่าหุ้นที่ติดตามทั้งหมด {v}% ทั้งด้าน P/E และ P/B'},
    whyQual:{en:'fundamentals rank ahead of {v}% of the universe',th:'พื้นฐานอยู่ในอันดับดีกว่าหุ้นทั้งหมด {v}%'},
    whyQuiet:{en:'RSI at {r}, only {m}% moved this month — barely on anyone’s radar',th:'RSI อยู่ที่ {r} ขยับแค่ {m}% ในเดือนนี้ — แทบไม่มีใครสนใจ'},
    whyRoom:{en:'{v}% below its 52-week high — the sweet spot, not a falling knife',th:'ห่างจากจุดสูงสุดรอบ 52 สัปดาห์ {v}% — อยู่ในโซนที่พอดี ไม่ใช่หุ้นร่วงหนัก'},
    noQual:{en:'no ROE/ROIC/margin data',th:'ไม่มีข้อมูล ROE/ROIC/มาร์จิ้น'},
    dePenalty:{en:'debt load trims the fundamentals score',th:'ภาระหนี้ทำให้คะแนนพื้นฐานลดลง'},
    legend:{en:'A statistical screen built from data this site already tracks (P/E, P/B, ROE, ROIC, margin, debt/equity, RSI, 1-month price change, distance from 52-week high) — not a forecast, not investment advice. A shortlist to research further, not a buy list. Admin-only.',
      th:'ตัวคัดกรองเชิงสถิติจากข้อมูลที่เว็บนี้มีอยู่แล้ว (P/E, P/B, ROE, ROIC, มาร์จิ้น, หนี้สินต่อทุน, RSI, การเปลี่ยนแปลงราคา 1 เดือน, ระยะห่างจากจุดสูงสุดรอบ 52 สัปดาห์) ไม่ใช่การพยากรณ์หรือคำแนะนำการลงทุน ใช้เป็นรายชื่อไปค้นคว้าต่อ ไม่ใช่รายการให้ซื้อ เฉพาะแอดมิน'}
  };

  function pctRank(list, val, lowerIsBetter){
    if (!list.length) return null;
    var beat = list.filter(function(x){ return lowerIsBetter ? x > val : x < val; }).length;
    return beat / list.length * 100;
  }

  /* leg 1 -- value, universe-wide (deliberately NOT sector-relative like the
     Early Signal Screener's valLeg): a stock's P/E and P/B ranked against
     every tracked stock's, not just same-sector peers. A different lens on
     "cheap" -- a truly under-the-radar name may not even have obvious
     sector peers worth comparing to yet. */
  function valueScore(allRows, universePE, universePB, r){
    var parts = [];
    if (isNum(r.pe) && r.pe > 0 && universePE.length >= 8) parts.push(pctRank(universePE, r.pe, true));
    if (isNum(r.pb) && r.pb > 0 && universePB.length >= 8) parts.push(pctRank(universePB, r.pb, true));
    parts = parts.filter(function(p){ return p != null; });
    if (!parts.length) return null;
    return parts.reduce(function(a,b){ return a+b; }, 0) / parts.length;
  }

  /* leg 2 -- fundamental quality: ROE/ROIC/margin ranked (higher = better)
     against the same universe, then trimmed for heavy debt. Any leg that's
     missing for this stock is simply left out of the average rather than
     failing the whole score -- data coverage on these fields is patchy. */
  function qualityScore(universe, r){
    var parts = [];
    if (isNum(r.roe) && universe.roe.length >= 8) parts.push(pctRank(universe.roe, r.roe, false));
    if (isNum(r.roic) && universe.roic.length >= 8) parts.push(pctRank(universe.roic, r.roic, false));
    if (isNum(r.margin) && universe.margin.length >= 8) parts.push(pctRank(universe.margin, r.margin, false));
    parts = parts.filter(function(p){ return p != null; });
    if (!parts.length) return null;
    var base = parts.reduce(function(a,b){ return a+b; }, 0) / parts.length;
    var penalty = 1;
    if (isNum(r.de)) {
      if (r.de > 4) penalty = 0.55;
      else if (r.de > 2) penalty = 0.75;
      else if (r.de > 1) penalty = 0.9;
    }
    return { score: base * penalty, penalized: penalty < 1 };
  }

  /* leg 3 -- rewards DULLNESS, the exact opposite of the Early Signal
     Screener's techLeg (which rewards bullish structure already forming).
     RSI near 50 and a small 1-month move score highest; anything already
     moving fast in either direction scores low -- that's the point, this
     scanner is for names nobody's chasing yet. */
  function quietScore(r){
    if (!isNum(r.rsi) || !isNum(r.m1)) return null;
    return clamp(100 - clamp(Math.abs(r.rsi - 50) * 2, 0, 60) - clamp(Math.abs(r.m1) * 3, 0, 40), 0, 100);
  }

  /* leg 4 -- a "sweet spot" band below the 52-week high: meaningfully off
     the high (so it isn't already back near the top, which is the Early
     Signal Screener's and Anomaly Scan's territory) but not a name that's
     been crushed. Centered on -35% off-high, tapering both directions. */
  function roomScore(r){
    if (!isNum(r.off_high)) return null;
    var dist = Math.abs(r.off_high - (-35));
    return clamp(100 - dist * 3, 0, 100);
  }

  function compute(){
    var s = snapshot();
    if (!s || !s.stocks) return null;
    var allRows = s.stocks;
    var tickers = Object.keys(allRows);

    var universePE = [], universePB = [];
    var universeQ = { roe:[], roic:[], margin:[] };
    tickers.forEach(function(t){
      var r = allRows[t];
      if (!r || r.stale) return;
      if (isNum(r.pe) && r.pe > 0) universePE.push(r.pe);
      if (isNum(r.pb) && r.pb > 0) universePB.push(r.pb);
      if (isNum(r.roe)) universeQ.roe.push(r.roe);
      if (isNum(r.roic)) universeQ.roic.push(r.roic);
      if (isNum(r.margin)) universeQ.margin.push(r.margin);
    });

    var out = [];
    tickers.forEach(function(t){
      var r = allRows[t];
      if (!r || r.stale) return;
      var val = valueScore(allRows, universePE, universePB, r);
      if (val == null) return;
      var quiet = quietScore(r);
      if (quiet == null) return;
      var room = roomScore(r);
      if (room == null) return;
      var qual = qualityScore(universeQ, r);
      var qualScore = qual ? qual.score : 50;

      var composite = val * 0.35 + qualScore * 0.30 + quiet * 0.20 + room * 0.15;
      out.push({ t:t, r:r, val:val, qual:qual, qualScore:qualScore, quiet:quiet, room:room, composite:composite });
    });

    out.sort(function(a, b){ return b.composite - a.composite; });
    return out.filter(function(x){ return x.composite >= 60; }).slice(0, 12);
  }

  function legHTML(label, score){
    return '<div class="qv-leg"><div class="qv-leg-l"><span>' + esc(label) + '</span><span>' +
      Math.round(score) + '</span></div><div class="qv-bar"><i style="width:' + clamp(score,0,100).toFixed(0) + '%"></i></div></div>';
  }

  function whyHTML(x){
    var parts = [];
    parts.push(fill(tx(T.whyVal), { v: x.val.toFixed(0) }));
    if (x.qual) parts.push(fill(tx(T.whyQual), { v: x.qualScore.toFixed(0) }));
    parts.push(fill(tx(T.whyQuiet), { r: x.r.rsi.toFixed(0), m: sgn(x.r.m1, 1) }));
    parts.push(fill(tx(T.whyRoom), { v: Math.abs(x.r.off_high).toFixed(1) }));
    if (x.qual && x.qual.penalized) parts.push(tx(T.dePenalty));
    if (!x.qual) parts.push(tx(T.noQual));
    return parts.join(' · ');
  }

  function rowHTML(x, i){
    var scCls = x.composite >= 75 ? 'hi' : 'mid';
    return '<div class="qv-row" data-qv-go="' + esc(x.t) + '">' +
      '<div class="qv-top">' +
        '<div class="qv-id"><span class="qv-rank">' + (i + 1) + '</span>' +
          '<span class="qv-tk">' + esc(x.t) + '</span>' +
          '<span class="qv-nm">' + esc(x.r.name || '') + '</span>' +
          '<span class="qv-sec">' + esc(x.r.sector || '') + '</span></div>' +
        '<div class="qv-sc ' + scCls + '">' + Math.round(x.composite) + '<small>/100</small></div>' +
      '</div>' +
      '<div class="qv-legs">' +
        legHTML(tx(T.legVal), x.val) +
        legHTML(tx(T.legQual), x.qualScore) +
        legHTML(tx(T.legQuiet), x.quiet) +
        legHTML(tx(T.legRoom), x.room) +
      '</div>' +
      '<div class="qv-why">' + whyHTML(x) + '</div>' +
    '</div>';
  }

  var sec = null, cache = null, q = '';

  function rowsOf(list){
    var filtered = list;
    if (q) {
      var qq = q.toLowerCase();
      filtered = filtered.filter(function(x){
        return x.t.toLowerCase().indexOf(qq) !== -1 || String(x.r.name || '').toLowerCase().indexOf(qq) !== -1;
      });
    }
    return filtered;
  }

  function bindRowClicks(host){
    if (!host) return;
    host.querySelectorAll('[data-qv-go]').forEach(function(el){
      el.addEventListener('click', function(){
        var tk = el.getAttribute('data-qv-go');
        if (window.__SPZ_STOCK && typeof window.__SPZ_STOCK.open === 'function') window.__SPZ_STOCK.open(tk);
      });
    });
  }

  function paint(){
    if (!sec) return;
    var g = function(k){ return sec.querySelector('[data-qv="' + k + '"]'); };
    if (g('eb')) g('eb').textContent = tx(T.eyebrow);
    if (g('h')) g('h').textContent = tx(T.h);
    if (g('lede')) g('lede').textContent = tx(T.lede);
    if (g('legend')) g('legend').textContent = tx(T.legend);
    if (g('qinput')) g('qinput').setAttribute('placeholder', tx(T.searchPh));

    var list = g('list');
    if (!list) return;
    var s = snapshot();
    if (!s) { list.innerHTML = '<div class="ss-empty">' + esc(tx(T.waiting)) + '</div>'; return; }
    cache = compute();
    if (!cache) { list.innerHTML = '<div class="ss-empty">' + esc(tx(T.waiting)) + '</div>'; return; }
    var rows = rowsOf(cache);
    if (!rows.length) { list.innerHTML = '<div class="ss-empty">' + esc(tx(T.empty)) + '</div>'; return; }
    list.innerHTML = rows.map(rowHTML).join('');
    bindRowClicks(list);
  }

  function build(){
    if (document.getElementById('quietValue')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'quietValue';
    sec.setAttribute('data-route', 'quietValue');
    sec.innerHTML =
      '<div class="qv-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-qv="eb"></span></div>' +
          '<h2 data-qv="h"></h2>' +
          '<p class="lede" data-qv="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div class="qv-ctl">' +
          '<input class="an-in" data-qv="qinput" type="search" autocomplete="off">' +
        '</div>' +
        '<div class="qv-list" data-qv="list"></div>' +
        '<div class="qv-legend" data-qv="legend"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'quietValue', feat:true, after:'anomaly',
      t:{en:'Quiet Value Scanner',th:'สแกนหุ้นถูกที่ยังเงียบ'},
      d:{en:'Cheap against the whole tracked universe, solid fundamentals, technically dead quiet, and sitting a meaningful but not catastrophic distance below its 52-week high. The opposite lens from the Early Signal Screener. Admin-only.',
         th:'ถูกเทียบกับหุ้นทั้งหมดที่ติดตาม พื้นฐานแข็งแรง เทคนิคเงียบสนิท และอยู่ห่างจากจุดสูงสุดรอบ 52 สัปดาห์พอสมควรแต่ไม่ถึงขั้นพัง มองต่างมุมจากสแกนหุ้นก่อนกระแส เฉพาะแอดมิน'}
    });

    var input = sec.querySelector('[data-qv="qinput"]');
    if (input) {
      input.addEventListener('input', function(){
        q = input.value;
        var list = sec.querySelector('[data-qv="list"]');
        if (list && cache) {
          var rows = rowsOf(cache);
          list.innerHTML = rows.length ? rows.map(rowHTML).join('') : '<div class="ss-empty">' + esc(tx(T.empty)) + '</div>';
          bindRowClicks(list);
        }
      });
    }

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(){ paint(); });
    var seed = setInterval(function(){
      var s = snapshot();
      if (s) { paint(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_QUIETVALUE = { repaint: paint, rows: function(){ return cache; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1100); });
  } else {
    setTimeout(boot, 1100);
  }
})();
