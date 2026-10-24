/* ===========================================================================
   MARKET BRAIN (#/brain) -- admin-only board (2026-10-25). Loaded on demand
   by part-82.js. One screen that reads everything the site already knows
   and turns it into plain words:

     data/market.json  (every 30 min) yields, VIX, dollar, sectors, 555 stocks
     data/brain.json   (twice a day)  FRED economy series + ETF weekly closes
     data/bubble.json  (daily)        CAPE, Buffett indicator, margin debt, put/call
     data/econ.json    (twice a day)  this week's economic calendar

   The "brain" is a set of written rules (no AI service, no API key): each
   rule is the kind taught in macro / portfolio courses, with its numbers
   shown next to it so every conclusion can be checked. It describes and
   ranks possibilities; it never says buy or sell. EN + TH everywhere.

   Portfolio: if the visitor is logged in with LINE or Telegram, the holdings
   are that account's own watchlist tickers (synced by the Worker, same list
   as the Watchlist page) and the weights they type are kept in this browser;
   otherwise the board offers model portfolios (and a free-form simulated
   one) so there is always something to analyse.
   =========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_BRAIN) return;

  var WORKER = 'https://spacez-line-link.spacezblack.workers.dev';
  var LS_KEY = 'spz.brain.v1';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; if(typeof o === 'string') return o; var v = o[L()]; return v !== undefined ? v : o.en; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function f(v, d){ return isNum(v) ? v.toFixed(d == null ? 1 : d) : '—'; }
  function sg(v, d){ return isNum(v) ? (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(d == null ? 1 : d) : '—'; }
  function pc(v, d){ return isNum(v) ? f(v, d) + '%' : '—'; }
  function spc(v, d){ return isNum(v) ? sg(v, d) + '%' : '—'; }
  function mean(a){ var s = 0, n = 0; a.forEach(function(x){ if(isNum(x)){ s += x; n++; } }); return n ? s / n : null; }
  function median(a){ a = a.filter(isNum).sort(function(x, y){ return x - y; }); if(!a.length) return null; var m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  function std(a){ var m = mean(a); if(m == null || a.length < 3) return null; var s = 0; a.forEach(function(x){ s += (x - m) * (x - m); }); return Math.sqrt(s / (a.length - 1)); }
  function lsGet(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch(e){ return {}; } }
  function lsSet(o){ try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch(e){} }
  function tms(t){ return Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +(t.slice(8, 10) || 1)); }
  function dshort(t){ if(!t) return '—'; var d = new Date(tms(t)); return d.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', year:'2-digit', timeZone:'UTC' }); }
  function mshort(t){ if(!t) return '—'; var d = new Date(tms(t)); return d.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { month:'short', year:'2-digit', timeZone:'UTC' }); }

  /* ---------------------------------------------------------------- icons */
  var IC = {
    sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    psun:'<path d="M8 3.5v1.6M3.2 8.3h1.6M4.6 4.9l1.1 1.1M12.4 4.9l-1.1 1.1"/><path d="M5.9 10.6a3 3 0 015.2-2.4"/><path d="M7.5 20h10a4 4 0 00.6-7.95A5.5 5.5 0 007.6 13.1 3.5 3.5 0 007.5 20z"/>',
    cloud:'<path d="M6.5 19h11a4.5 4.5 0 00.7-8.95A6 6 0 006.6 11.1 4 4 0 006.5 19z"/>',
    rain:'<path d="M6.5 15h11a4.5 4.5 0 00.7-8.95A6 6 0 006.6 7.1 4 4 0 006.5 15z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>',
    storm:'<path d="M6.5 14h11a4.5 4.5 0 00.7-8.95A6 6 0 006.6 6.1 4 4 0 006.5 14z"/><path d="M12.5 14l-2.5 4h3l-2 4"/>',
    flame:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1 2.5 2 3 0-3 .5-5.5.5-8z"/>',
    bank:'<path d="M3 10h18L12 4 3 10z"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/>',
    curve:'<path d="M3 18c4-1 6-6 9-8s6-3 9-3"/><circle cx="3" cy="18" r="1.2"/><circle cx="12" cy="10" r="1.2"/><circle cx="21" cy="7" r="1.2"/>',
    factory:'<path d="M3 20V10l5 3V10l5 3V7l8 4v9H3z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
    coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.5-1-1.6-1.6-2.8-1.6-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.5 5.8 4.4 0 1.2-1.3 2.2-3 2.2-1.3 0-2.4-.6-2.9-1.6M12 6v1.6M12 16.4V18"/>',
    shield:'<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6L12 3z"/><path d="M12 8v4.5M12 15.5v.2"/>',
    scale:'<path d="M12 4v16M6 20h12M4 8h16"/><path d="M4 8l-2.5 6a3 3 0 005 0L4 8zM20 8l-2.5 6a3 3 0 005 0L20 8z"/>',
    barrel:'<path d="M7 3h10c1 2 1.5 5.5 1.5 9s-.5 7-1.5 9H7c-1-2-1.5-5.5-1.5-9S6 5 7 3z"/><path d="M6 8h12M6 16h12"/>',
    trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    brain:'<path d="M9 4.5a3 3 0 00-3 3v.2A3 3 0 004 10.5a3 3 0 001 2.3A3 3 0 006 18a3 3 0 003 2.5V4.5zM15 4.5a3 3 0 013 3v.2a3 3 0 012 2.8 3 3 0 01-1 2.3A3 3 0 0118 18a3 3 0 01-3 2.5V4.5z"/><path d="M9 9h-1.5M9 14H7.5M15 9h1.5M15 14h1.5"/>',
    radar:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-6"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    pie:'<path d="M12 3v9h9a9 9 0 11-9-9z"/><path d="M15 3.5a9 9 0 015.5 5.5H15V3.5z"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    compass:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
    globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5S9.5 6 12 3.5z"/>',
    alert:'<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4.5M12 17.2v.2"/>',
    bolt:'<path d="M13 3L5 13.5h6l-1 7.5 8-10.5h-6L13 3z"/>',
    swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    user:'<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>',
    flask:'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 001.3 2h12.4a1.5 1.5 0 001.3-2L14 9V3"/><path d="M7 15h10"/>',
    star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5z"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function ico(k, cls){ return '<svg class="bz-i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }

  /* ------------------------------------------------------------------ data */
  var D = { m:null, b:null, bub:null, econ:null, at:0 };
  function getJSON(u){ return fetch(u, { cache:'no-cache' }).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).catch(function(){ return null; }); }
  function loadData(){
    var live = null; try { live = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    return Promise.all([
      live && live.stocks ? Promise.resolve(live) : getJSON('data/market.json'),
      getJSON('data/brain.json'), getJSON('data/bubble.json'), getJSON('data/econ.json')
    ]).then(function(r){ D.m = r[0]; D.b = r[1]; D.bub = r[2]; D.econ = r[3]; D.at = Date.now(); return D; });
  }
  function mac(k){ return D.b && D.b.macro && D.b.macro[k] || null; }
  function mv(k){ var s = mac(k); return s ? s.v : null; }
  function mchg(k, w){ var s = mac(k); return s && isNum(s.v) && isNum(s[w]) ? s.v - s[w] : null; }
  function mkt(k){ return D.m && D.m.macro && D.m.macro[k] || null; }
  function reg(k){ return D.m && D.m.regime ? D.m.regime[k] : null; }
  function flow(sym){
    var F = D.m && D.m.flows; if(!F) return null;
    var all = [].concat(F.asset || [], F.sector || [], F.country || []);
    for(var i = 0; i < all.length; i++) if(all[i].sym === sym) return all[i];
    return null;
  }
  function bub(k){ return D.bub && D.bub[k] || null; }
  function lastN(arr, n){ return arr ? arr.slice(Math.max(0, arr.length - n)) : []; }
  function histSince(k, years){
    var s = mac(k); if(!s || !s.hist || !s.hist.length) return [];
    var last = tms(s.hist[s.hist.length - 1][0]), cut = last - years * 365.25 * 864e5;
    return s.hist.filter(function(p){ return tms(p[0]) >= cut; });
  }
  function hmin(k, years){ var h = histSince(k, years); return h.length ? Math.min.apply(null, h.map(function(p){ return p[1]; })) : null; }
  function hmax(k, years){ var h = histSince(k, years); return h.length ? Math.max.apply(null, h.map(function(p){ return p[1]; })) : null; }

  /* ---------------------------------------------------------------- charts
     Hand-drawn SVG (no chart library). Every line chart registers its data
     in CH so one delegated pointer handler can show a crosshair + values. */
  var CH = {}, chN = 0;
  var COL = { a:'#22d3ee', b:'#a78bfa', c:'#f472b6', d:'#fbbf24', e:'#34d399', f:'#fb7185', g:'#94a3b8' };
  function niceTicks(lo, hi, n){
    var span = hi - lo || 1, step = Math.pow(10, Math.floor(Math.log10(span / n))), err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
    var out = [], v = Math.ceil(lo / step) * step;
    for(; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }
  /* opt: { series:[{name, pts:[[t,v]], color, dash, w}], h, unit, band:{lo,hi,label}, zero, ref:[{v,label}], dec } */
  function lineChart(opt){
    var W = 640, H = opt.h || 220, P = { l:42, r:58, t:14, b:24 };
    var ser = opt.series.filter(function(s){ return s.pts && s.pts.length > 1; });
    if(!ser.length) return '<div class="bz-nodata">' + T({ en:'No data yet', th:'ยังไม่มีข้อมูล' }) + '</div>';
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    ser.forEach(function(s){ s.pts.forEach(function(p){ var x = tms(p[0]); p.x = x; if(x < x0) x0 = x; if(x > x1) x1 = x; if(p[1] < y0) y0 = p[1]; if(p[1] > y1) y1 = p[1]; });
      (s.fc || []).forEach(function(q){ q.x = tms(q.t); if(q.x > x1) x1 = q.x; [q.v, q.lo, q.hi, q.lo2, q.hi2].forEach(function(v){ if(isNum(v)){ if(v < y0) y0 = v; if(v > y1) y1 = v; } }); }); });
    var xNow = x1; ser.forEach(function(s){ if(s.fc && s.fc.length){ var lp = s.pts[s.pts.length - 1]; xNow = Math.min(xNow, lp.x); } });
    if(opt.band){ y0 = Math.min(y0, opt.band.lo); y1 = Math.max(y1, opt.band.hi); }
    (opt.ref || []).forEach(function(r){ y0 = Math.min(y0, r.v); y1 = Math.max(y1, r.v); });
    if(opt.zero){ y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); }
    var pad = (y1 - y0) * 0.08 || 1; y0 -= pad; y1 += pad;
    var X = function(x){ return P.l + (x - x0) / (x1 - x0 || 1) * (W - P.l - P.r); };
    var Y = function(v){ return P.t + (1 - (v - y0) / (y1 - y0)) * (H - P.t - P.b); };
    var dec = opt.dec == null ? 1 : opt.dec, g = '';
    niceTicks(y0, y1, 4).forEach(function(v){
      g += '<line class="bz-gl" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/>' +
           '<text class="bz-ax" x="' + (P.l - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + (+v.toFixed(3)) + '</text>';
    });
    var yr0 = new Date(x0).getUTCFullYear(), yr1 = new Date(x1).getUTCFullYear(), every = Math.max(1, Math.ceil((yr1 - yr0 + 1) / 7));
    if(yr1 - yr0 >= 1){
      for(var yr = yr0 + 1; yr <= yr1; yr += every){ var xx = X(Date.UTC(yr, 0, 1)); g += '<line class="bz-gl v" x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + P.t + '" y2="' + (H - P.b) + '"/><text class="bz-ax" x="' + xx.toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + yr + '</text>'; }
    } else {
      for(var mm = 0; mm < 13; mm += 2){ var xm = Date.UTC(yr0, mm, 1); if(xm > x0 && xm < x1) g += '<text class="bz-ax" x="' + X(xm).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + mshort(new Date(xm).toISOString().slice(0, 10)) + '</text>'; }
    }
    if(opt.band){
      g += '<rect class="bz-band" x="' + P.l + '" width="' + (W - P.l - P.r) + '" y="' + Y(opt.band.hi).toFixed(1) + '" height="' + Math.max(1, Y(opt.band.lo) - Y(opt.band.hi)).toFixed(1) + '"/>';
      if(opt.band.label) g += '<text class="bz-bandl" x="' + (P.l + 6) + '" y="' + (Y(opt.band.hi) - 4).toFixed(1) + '">' + esc(T(opt.band.label)) + '</text>';
    }
    (opt.rec || []).forEach(function(r){ var a = Math.max(x0, tms(r[0])), b = Math.min(x1, tms(r[1]) + 30 * 864e5); if(b > a) g += '<rect class="bz-rec" x="' + X(a).toFixed(1) + '" width="' + Math.max(2, X(b) - X(a)).toFixed(1) + '" y="' + P.t + '" height="' + (H - P.t - P.b) + '"/>'; });
    if(xNow < x1){ g += '<rect class="bz-fz" x="' + X(xNow).toFixed(1) + '" width="' + (X(x1) - X(xNow)).toFixed(1) + '" y="' + P.t + '" height="' + (H - P.t - P.b) + '"/><text class="bz-fzl" x="' + (X(xNow) + 5).toFixed(1) + '" y="' + (P.t + 11) + '">' + esc(T({ en:'FORECAST', th:'คาดการณ์' })) + '</text>'; }
    if(opt.zero && y0 < 0 && y1 > 0) g += '<line class="bz-zero" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '"/>';
    (opt.ref || []).forEach(function(r){ g += '<line class="bz-ref" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(r.v).toFixed(1) + '" y2="' + Y(r.v).toFixed(1) + '"/><text class="bz-refl" x="' + (W - P.r - 4) + '" y="' + (Y(r.v) - 4).toFixed(1) + '" text-anchor="end">' + esc(T(r.label)) + '</text>'; });
    var tags = [];
    ser.forEach(function(s, i){
      var c = s.color || COL['abcdefg'[i]], d = '';
      s.pts.forEach(function(p, j){ d += (j ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p[1]).toFixed(1); });
      if(s.area){ g += '<path class="bz-area" d="' + d + 'L' + X(s.pts[s.pts.length - 1].x).toFixed(1) + ' ' + (H - P.b) + 'L' + X(s.pts[0].x).toFixed(1) + ' ' + (H - P.b) + 'Z" fill="' + c + '"/>'; }
      g += '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (s.w || 2) + '" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/>';
      var lp = s.pts[s.pts.length - 1];
      if(s.fc && s.fc.length){
        var fq = [{ x:lp.x, v:lp[1], lo:lp[1], hi:lp[1], lo2:lp[1], hi2:lp[1] }].concat(s.fc);
        if(isNum(s.fc[0].lo2)){ var b2 = fq.map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.hi2).toFixed(1); }).join('L') + 'L' + fq.slice().reverse().map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.lo2).toFixed(1); }).join('L'); g += '<path d="M' + b2 + 'Z" fill="' + c + '" opacity=".08"/>'; }
        if(isNum(s.fc[0].lo)){ var b1 = fq.map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.hi).toFixed(1); }).join('L') + 'L' + fq.slice().reverse().map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.lo).toFixed(1); }).join('L'); g += '<path d="M' + b1 + 'Z" fill="' + c + '" opacity=".18"/>'; }
        g += '<path d="M' + fq.map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.v).toFixed(1); }).join('L') + '" fill="none" stroke="' + c + '" stroke-width="2.2" stroke-dasharray="6 5"/>';
        var lq = s.fc[s.fc.length - 1];
        g += '<circle cx="' + X(lq.x).toFixed(1) + '" cy="' + Y(lq.v).toFixed(1) + '" r="4" fill="var(--bz-bgc,#0b0f17)" stroke="' + c + '" stroke-width="2"/>';
        s.fc.forEach(function(q){ g += '<circle cx="' + X(q.x).toFixed(1) + '" cy="' + Y(q.v).toFixed(1) + '" r="2.6" fill="' + c + '"/>'; });
        lp = { x:lq.x, 1:lq.v };
      }
      tags.push({ y:Y(lp[1]), c:c, t:f(lp[1], dec) + (opt.unit || '') });
      if(!s.fc) g += '<circle cx="' + X(lp.x).toFixed(1) + '" cy="' + Y(lp[1]).toFixed(1) + '" r="3.2" fill="' + c + '"/>';
    });
    tags.sort(function(a, b){ return a.y - b.y; });
    for(var k = 1; k < tags.length; k++){ if(tags[k].y - tags[k - 1].y < 15) tags[k].y = tags[k - 1].y + 15; }
    tags.forEach(function(tg){ g += '<rect x="' + (W - P.r + 4) + '" y="' + (tg.y - 9).toFixed(1) + '" width="' + (P.r - 6) + '" height="17" rx="5" fill="' + tg.c + '" opacity=".16"/><text class="bz-tag" x="' + (W - P.r + 8) + '" y="' + (tg.y + 4).toFixed(1) + '" fill="' + tg.c + '">' + esc(tg.t) + '</text>'; });
    var id = 'c' + (++chN);
    CH[id] = { ser:ser, X:X, Y:Y, x0:x0, x1:x1, W:W, H:H, P:P, unit:opt.unit || '', dec:dec };
    var leg = ser.length > 1 || opt.legend ? '<div class="bz-leg">' + ser.map(function(s, i){ return '<span><i style="background:' + (s.color || COL['abcdefg'[i]]) + '"></i>' + esc(T(s.name)) + '</span>'; }).join('') + '</div>' : '';
    return leg + '<div class="bz-chart" data-ch="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="bz-svg">' + g +
      '<line class="bz-xh" x1="0" x2="0" y1="' + P.t + '" y2="' + (H - P.b) + '" style="display:none"/></svg><div class="bz-tip" hidden></div></div>';
  }
  function onChartMove(ev){
    var host = ev.target.closest && ev.target.closest('.bz-chart'); if(!host) return;
    var c = CH[host.getAttribute('data-ch')]; if(!c) return;
    var r = host.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * c.W;
    if(px < c.P.l || px > c.W - c.P.r){ hideTip(host); return; }
    var xt = c.x0 + (px - c.P.l) / (c.W - c.P.l - c.P.r) * (c.x1 - c.x0), rows = [], when = null;
    c.ser.forEach(function(s, i){
      var best = null, bd = Infinity;
      for(var j = 0; j < s.pts.length; j++){ var dd = Math.abs(s.pts[j].x - xt); if(dd < bd){ bd = dd; best = s.pts[j]; } }
      (s.fc || []).forEach(function(q){ var dq = Math.abs(q.x - xt); if(dq < bd){ bd = dq; best = [q.t, q.v]; best.fc = q; } });
      if(best){ when = when || best[0]; rows.push('<div><i style="background:' + (s.color || COL['abcdefg'[i]]) + '"></i>' + esc(T(s.name) || '') + (best.fc ? ' <small>(' + esc(T({ en:'forecast', th:'คาด' })) + ')</small>' : '') + ' <b>' + f(best[1], c.dec) + c.unit + '</b>' + (best.fc && isNum(best.fc.lo) ? '<div class="bz-tr">' + f(best.fc.lo, c.dec) + ' – ' + f(best.fc.hi, c.dec) + c.unit + '</div>' : '') + '</div>'); }
    });
    var xh = host.querySelector('.bz-xh'); xh.style.display = ''; xh.setAttribute('x1', px); xh.setAttribute('x2', px);
    var tip = host.querySelector('.bz-tip'); tip.hidden = false; tip.innerHTML = '<em>' + dshort(when) + '</em>' + rows.join('');
    var left = ev.clientX - r.left + 14; if(left + 170 > r.width) left = ev.clientX - r.left - 180;
    tip.style.left = Math.max(0, left) + 'px'; tip.style.top = '8px';
  }
  function hideTip(host){ var t = host.querySelector('.bz-tip'); if(t) t.hidden = true; var x = host.querySelector('.bz-xh'); if(x) x.style.display = 'none'; }

  function spark(vals, color, w, h){
    vals = (vals || []).filter(isNum); w = w || 120; h = h || 34;
    if(vals.length < 2) return '';
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), d = '';
    vals.forEach(function(v, i){ d += (i ? 'L' : 'M') + (i / (vals.length - 1) * w).toFixed(1) + ' ' + (h - 3 - (v - lo) / (hi - lo || 1) * (h - 6)).toFixed(1); });
    return '<svg class="bz-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><path d="' + d + 'L' + w + ' ' + h + 'L0 ' + h + 'Z" fill="' + color + '" opacity=".12"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }
  /* semicircle gauge, v in 0..100 */
  function gauge(v, label){
    var cx = 110, cy = 104, r = 84, a0 = Math.PI, segs = '', cols = ['#f43f5e', '#fb923c', '#facc15', '#a3e635', '#22c55e'];
    for(var i = 0; i < 5; i++){
      var s = a0 + i / 5 * Math.PI + 0.02, e = a0 + (i + 1) / 5 * Math.PI - 0.02;
      segs += '<path d="M' + (cx + r * Math.cos(s)).toFixed(1) + ' ' + (cy + r * Math.sin(s)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(e)).toFixed(1) + ' ' + (cy + r * Math.sin(e)).toFixed(1) + '" stroke="' + cols[i] + '" stroke-width="14" fill="none" stroke-linecap="round" opacity=".9"/>';
    }
    var a = a0 + clamp(v, 0, 100) / 100 * Math.PI;
    return '<svg class="bz-gauge" viewBox="0 0 220 128">' + segs +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (r - 22) * Math.cos(a)).toFixed(1) + '" y2="' + (cy + (r - 22) * Math.sin(a)).toFixed(1) + '" class="bz-needle"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="7" class="bz-hub"/>' +
      '<text x="' + cx + '" y="' + (cy - 26) + '" text-anchor="middle" class="bz-gv">' + Math.round(v) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle" class="bz-gl2">' + esc(label || '') + '</text></svg>';
  }
  /* investment clock: g = growth momentum (-1..1, right = stronger), i = inflation momentum (-1..1, up = hotter) */
  function clockSVG(g, i, phase){
    var c = 120, R = 98, q = [
      { k:'overheat', x:1, y:-1 }, { k:'stagflation', x:-1, y:-1 }, { k:'reflation', x:-1, y:1 }, { k:'recovery', x:1, y:1 }
    ], s = '';
    q.forEach(function(o){
      var on = o.k === phase, sx = o.x > 0 ? 0 : -1, sy = o.y > 0 ? 0 : -1;
      var a1 = Math.atan2(o.y < 0 ? -1 : 1, 0), p = '';
      var start = (o.x > 0 && o.y < 0) ? -Math.PI / 2 : (o.x < 0 && o.y < 0) ? Math.PI : (o.x < 0 && o.y > 0) ? Math.PI / 2 : 0;
      p = 'M' + c + ' ' + c + ' L' + (c + R * Math.cos(start)).toFixed(1) + ' ' + (c + R * Math.sin(start)).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (c + R * Math.cos(start + Math.PI / 2)).toFixed(1) + ' ' + (c + R * Math.sin(start + Math.PI / 2)).toFixed(1) + 'Z';
      s += '<path d="' + p + '" class="bz-q bz-q-' + o.k + (on ? ' on' : '') + '"/>';
      var lx = c + o.x * 50, ly = c + o.y * 52;
      s += '<text x="' + lx + '" y="' + (ly - 2) + '" text-anchor="middle" class="bz-ql' + (on ? ' on' : '') + '">' + esc(T(PHASES[o.k].short)) + '</text>';
      s += '<text x="' + lx + '" y="' + (ly + 13) + '" text-anchor="middle" class="bz-qs">' + esc(T(PHASES[o.k].best)) + '</text>';
      void sx; void sy; void a1;
    });
    var dx = c + clamp(g, -1, 1) * (R - 14), dy = c - clamp(i, -1, 1) * (R - 14);
    s += '<line x1="' + c + '" y1="' + (c - R) + '" x2="' + c + '" y2="' + (c + R) + '" class="bz-qa"/><line x1="' + (c - R) + '" y1="' + c + '" x2="' + (c + R) + '" y2="' + c + '" class="bz-qa"/>';
    s += '<text x="' + (c + R - 2) + '" y="' + (c - 5) + '" text-anchor="end" class="bz-qx">' + esc(T({ en:'growth ↑', th:'เศรษฐกิจโต →' })) + '</text>';
    s += '<text x="' + (c + 5) + '" y="' + (c - R + 12) + '" class="bz-qx">' + esc(T({ en:'inflation ↑', th:'เงินเฟ้อขึ้น ↑' })) + '</text>';
    s += '<circle cx="' + dx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="13" class="bz-dot-h"/><circle cx="' + dx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="6.5" class="bz-dot"/>';
    return '<svg class="bz-clock" viewBox="0 0 240 240">' + s + '</svg>';
  }
  function donut(parts, size){
    size = size || 150; var c = size / 2, r = size / 2 - 12, tot = 0, a = -Math.PI / 2, s = '';
    parts.forEach(function(p){ tot += p.v; });
    if(!tot) return '';
    parts.forEach(function(p, i){
      var da = p.v / tot * Math.PI * 2, e = a + da, big = da > Math.PI ? 1 : 0, col = p.c || DCOL[i % DCOL.length];
      if(da >= Math.PI * 2 - 1e-6){ s += '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="20"/>'; }
      else s += '<path d="M' + (c + r * Math.cos(a)).toFixed(2) + ' ' + (c + r * Math.sin(a)).toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + big + ' 1 ' + (c + r * Math.cos(e)).toFixed(2) + ' ' + (c + r * Math.sin(e)).toFixed(2) + '" fill="none" stroke="' + col + '" stroke-width="20"/>';
      a = e;
    });
    return '<svg class="bz-donut" viewBox="0 0 ' + size + ' ' + size + '">' + s + '</svg>';
  }
  var DCOL = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#fb7185', '#60a5fa', '#c084fc', '#2dd4bf', '#f97316', '#94a3b8', '#e879f9'];
  function donutBlock(title, parts){
    parts = parts.filter(function(p){ return p.v > 0.0001; }).sort(function(a, b){ return b.v - a.v; });
    var tot = parts.reduce(function(s, p){ return s + p.v; }, 0);
    return '<div class="bz-dn"><h5>' + esc(T(title)) + '</h5><div class="bz-dnb">' + donut(parts) + '<ul>' + parts.map(function(p, i){
      return '<li><i style="background:' + (p.c || DCOL[i % DCOL.length]) + '"></i><span>' + esc(T(p.n)) + '</span><b>' + f(p.v / tot * 100, 0) + '%</b></li>';
    }).join('') + '</ul></div></div>';
  }
  function bars(rows, opt){
    opt = opt || {}; var mx = 0;
    rows.forEach(function(r){ if(isNum(r.v)) mx = Math.max(mx, Math.abs(r.v)); });
    mx = mx || 1;
    return '<div class="bz-bars' + (opt.cls ? ' ' + opt.cls : '') + '">' + rows.map(function(r){
      var w = isNum(r.v) ? Math.abs(r.v) / mx * 50 : 0, pos = r.v >= 0;
      return '<div class="bz-br' + (r.hi ? ' hi' : '') + '"><span class="n">' + esc(T(r.n)) + (r.sub ? '<em>' + esc(T(r.sub)) + '</em>' : '') + '</span><span class="t"><i class="' + (pos ? 'up' : 'dn') + '" style="' + (pos ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%"></i></span><b class="' + (pos ? 'up' : 'dn') + '">' + (opt.fmt ? opt.fmt(r.v) : spc(r.v)) + '</b></div>';
    }).join('') + '</div>';
  }
  function heatCls(v, k){ if(!isNum(v)) return ''; k = k || 1; return v > 4 * k ? 'h5' : v > 1.5 * k ? 'h4' : v > 0 ? 'h3' : v > -1.5 * k ? 'h2' : v > -4 * k ? 'h1' : 'h0'; }
  function stars(n){ var s = ''; for(var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return '<span class="bz-stars" title="' + n + '/5">' + s + '</span>'; }

  /* ================================================================ ENGINE
     Every rule below is a plain if/then on numbers that are shown on the
     page next to the conclusion. Scores run -2 (bad for risk assets) .. +2. */
  var PHASES = {
    recovery:{ short:{ en:'Recovery', th:'ฟื้นตัว' }, best:{ en:'stocks lead', th:'หุ้นเด่น' }, tone:'good',
      name:{ en:'Recovery — growth picking up, inflation cooling', th:'ฟื้นตัว — เศรษฐกิจเร่งขึ้น เงินเฟ้อเย็นลง' },
      why:{ en:'The friendliest phase for stocks: profits recover while rates are not a threat.', th:'ช่วงที่เป็นมิตรกับหุ้นที่สุด กำไรบริษัทฟื้น ส่วนดอกเบี้ยยังไม่น่ากลัว' },
      sectors:['Technology', 'Consumer Cyclical', 'Communication Services', 'Financial Services'],
      etf:['QQQ', 'XLY', 'IWM', 'XLK', 'EEM'], avoid:['DBC', 'SHY', 'XLU'] },
    overheat:{ short:{ en:'Overheat', th:'ร้อนแรง' }, best:{ en:'commodities lead', th:'สินค้าโภคภัณฑ์เด่น' }, tone:'mid',
      name:{ en:'Overheat — growth strong, inflation rising', th:'ร้อนแรง — เศรษฐกิจยังแรง แต่เงินเฟ้อเร่งขึ้น' },
      why:{ en:'Real assets and companies that can raise prices do best; long bonds suffer as rates go up.', th:'สินทรัพย์จริงและบริษัทที่ขึ้นราคาได้มักทำได้ดี ส่วนบอนด์ระยะยาวมักเสียหายเพราะดอกเบี้ยขึ้น' },
      sectors:['Energy', 'Basic Materials', 'Industrials', 'Financial Services'],
      etf:['DBC', 'XLE', 'XLB', 'XLI', 'TIP'], avoid:['TLT', 'XLU', 'XLRE'] },
    stagflation:{ short:{ en:'Stagflation', th:'ชะลอแต่ของแพง' }, best:{ en:'cash & gold lead', th:'เงินสด/ทองเด่น' }, tone:'bad',
      name:{ en:'Stagflation — growth slowing, inflation still high', th:'ชะลอแต่ของแพง — เศรษฐกิจแผ่ว แต่เงินเฟ้อยังสูง' },
      why:{ en:'The hardest phase: both stocks and long bonds struggle. Defence, short-term bonds and gold hold up best.', th:'ช่วงที่ยากที่สุด ทั้งหุ้นและบอนด์ระยะยาวมักแย่ ตัวที่ประคองได้ดีคือหุ้นตั้งรับ บอนด์ระยะสั้น และทองคำ' },
      sectors:['Consumer Defensive', 'Healthcare', 'Utilities', 'Energy'],
      etf:['GLD', 'SHY', 'XLP', 'XLV', 'TIP'], avoid:['QQQ', 'IWM', 'XLY'] },
    reflation:{ short:{ en:'Slowdown', th:'ชะลอตัว' }, best:{ en:'bonds lead', th:'บอนด์เด่น' }, tone:'mid',
      name:{ en:'Slowdown — growth and inflation both cooling', th:'ชะลอตัว — ทั้งเศรษฐกิจและเงินเฟ้อเย็นลง' },
      why:{ en:'Central banks tend to cut rates: quality bonds and defensive stocks usually lead until growth turns up.', th:'ธนาคารกลางมักเริ่มลดดอกเบี้ย บอนด์คุณภาพดีและหุ้นตั้งรับมักนำ จนกว่าเศรษฐกิจจะกลับมาเร่ง' },
      sectors:['Healthcare', 'Consumer Defensive', 'Utilities', 'Real Estate'],
      etf:['TLT', 'IEF', 'XLV', 'XLP', 'LQD'], avoid:['DBC', 'XLE', 'XLB'] }
  };
  var SECT_TH = { 'Technology':'เทคโนโลยี', 'Financial Services':'การเงิน', 'Consumer Cyclical':'สินค้าฟุ่มเฟือย', 'Industrials':'อุตสาหกรรม', 'Healthcare':'สุขภาพ', 'Consumer Defensive':'สินค้าจำเป็น', 'Real Estate':'อสังหาฯ', 'Energy':'พลังงาน', 'Basic Materials':'วัสดุพื้นฐาน', 'Utilities':'สาธารณูปโภค', 'Communication Services':'สื่อสาร', 'Diversified':'กระจายหลายกลุ่ม', 'Bonds':'พันธบัตร', 'Gold':'ทองคำ', 'Commodities':'สินค้าโภคภัณฑ์', 'Cash':'เงินสด/ดอลลาร์' };
  function sectName(s){ return L() === 'th' ? (SECT_TH[s] || s) : s; }

  function pillar(key, score, title, icon, value, valueSub, say, tab, sparkVals){
    score = clamp(Math.round(score * 2) / 2, -2, 2);
    return { key:key, score:score, title:title, icon:icon, value:value, sub:valueSub, say:say, tab:tab, spark:sparkVals || [] };
  }
  function tone(s){ return s >= 1 ? 'good' : s <= -1 ? 'bad' : 'mid'; }
  function toneWord(s){ return s >= 1.5 ? { en:'Supportive', th:'เอื้อมาก' } : s >= 0.5 ? { en:'Mildly supportive', th:'ค่อนข้างเอื้อ' } : s > -0.5 ? { en:'Neutral', th:'กลางๆ' } : s > -1.5 ? { en:'Headwind', th:'เป็นแรงต้าน' } : { en:'Strong headwind', th:'กดดันมาก' }; }
  function hv(k, n){ var s = mac(k); return s ? lastN(s.hist, n).map(function(p){ return p[1]; }) : []; }

  function compute(){
    var E = { pillars:[], changes:[], diverge:[], notes:[] };
    var core = mac('core_pce'), cpi = mac('cpi'), ccpi = mac('core_cpi'), be5 = mac('be5');
    var ff = mv('ff'), y2 = mv('y2'), y10m = mkt('us10y'), y10 = y10m ? y10m.price : mv('y10'), real = mv('real10');
    var vix = mkt('vix'), dxy = mkt('dxy'), spx = mkt('spx');
    var oil = mac('oil'), hy = mac('hy');

    /* 1 inflation */
    var cv = core ? core.v : (cpi ? cpi.v : null), c3 = core ? mchg('core_pce', 'm3') : mchg('cpi', 'm3');
    var sI = 0;
    if(isNum(cv)){ sI = cv <= 2.3 ? 2 : cv <= 2.8 ? 1 : cv <= 3.5 ? 0 : cv <= 4.5 ? -1 : -2; if(c3 > 0.15) sI -= 1; if(c3 < -0.15) sI += 1; }
    E.infl = { v:cv, c3:c3, cpi:cpi && cpi.v, core_cpi:ccpi && ccpi.v, be5:be5 && be5.v };
    E.pillars.push(pillar('infl', sI, { en:'Inflation', th:'เงินเฟ้อ' }, 'flame', pc(cv, 1), { en:'core PCE, ' + sg(c3, 2) + ' pt in 3m', th:'Core PCE · 3 เดือน ' + sg(c3, 2) },
      { en:'Core inflation is ' + pc(cv, 1) + (c3 > 0.1 ? ' and rising' : c3 < -0.1 ? ' and easing' : ' and flat') + (cv > 2.5 ? ' — still above the Fed\'s 2% goal.' : ' — close to the Fed\'s 2% goal.'),
        th:'เงินเฟ้อพื้นฐานอยู่ที่ ' + pc(cv, 1) + (c3 > 0.1 ? ' และกำลังเร่งขึ้น' : c3 < -0.1 ? ' และกำลังชะลอลง' : ' ทรงตัว') + (cv > 2.5 ? ' ยังสูงกว่าเป้า 2% ของเฟด' : ' ใกล้เป้า 2% ของเฟดแล้ว') }, 'infl', hv('core_pce', 24)));

    /* 2 the Fed and rates */
    var gap = isNum(y2) && isNum(ff) ? y2 - ff : null, dy10 = y10m && isNum(y10m.m1) ? y10m.price - y10m.price / (1 + y10m.m1 / 100) : mchg('y10', 'm1');
    var sF = (gap < -0.25 ? 1 : gap > 0.25 ? -1 : 0) + (real > 2.3 ? -1 : real < 1.2 ? 1 : 0) + (dy10 > 0.25 ? -1 : dy10 < -0.25 ? 1 : 0);
    var fedSay = gap == null ? { en:'—', th:'—' } : gap < -0.25 ? { en:'the bond market expects rate CUTS', th:'ตลาดบอนด์คาดว่าเฟดจะลดดอกเบี้ย' } : gap > 0.25 ? { en:'the bond market is leaning toward rate HIKES', th:'ตลาดบอนด์เริ่มเอนไปทางเฟดขึ้นดอกเบี้ย' } : { en:'the bond market expects rates to stay put', th:'ตลาดบอนด์คาดว่าเฟดจะคงดอกเบี้ย' };
    E.fed = { ff:ff, y2:y2, y10:y10, gap:gap, real:real, dy10:dy10, say:fedSay };
    E.pillars.push(pillar('fed', sF, { en:'Fed & interest rates', th:'เฟดและดอกเบี้ย' }, 'bank', pc(ff, 2), { en:'2y ' + pc(y2, 2) + ' · real 10y ' + pc(real, 2), th:'บอนด์ 2 ปี ' + pc(y2, 2) + ' · ยีลด์จริง ' + pc(real, 2) },
      { en:'Fed funds ' + pc(ff, 2) + ', 2-year yield ' + pc(y2, 2) + ': ' + fedSay.en + '. Real yield ' + pc(real, 2) + (real > 2 ? ' is restrictive (money is expensive).' : ' is not very restrictive.'),
        th:'ดอกเบี้ยเฟด ' + pc(ff, 2) + ' บอนด์ 2 ปี ' + pc(y2, 2) + ' แปลว่า' + fedSay.th + ' ยีลด์จริง ' + pc(real, 2) + (real > 2 ? ' ถือว่าสูง เงินกู้แพง' : ' ยังไม่สูงมาก') }, 'infl', hv('y2', 52)));

    /* 3 yield curve */
    var cs = mv('t10y2y'), c3m = reg('curve_10y_3m'), cmin = hmin('t10y2y', 3), sC = 0, unInv = false;
    if(isNum(cs)){ sC = cs < 0 ? -1 : cs < 0.3 ? 0 : 1; if(cs > 0 && isNum(cmin) && cmin < -0.3){ unInv = true; sC -= 1; } }
    E.curve = { s:cs, s3m:c3m, min3y:cmin, unInv:unInv };
    E.pillars.push(pillar('curve', sC, { en:'Yield curve', th:'เส้นอัตราผลตอบแทน' }, 'curve', sg(cs, 2) + ' pt', { en:'10y − 2y · 10y − 3m ' + sg(c3m, 2), th:'10 ปี − 2 ปี · 10 ปี − 3 เดือน ' + sg(c3m, 2) },
      cs < 0 ? { en:'The curve is inverted (short rates above long rates) — historically a warning that a slowdown may follow within 6–18 months.', th:'เส้นกลับหัว (ดอกเบี้ยสั้นสูงกว่ายาว) ในอดีตมักเตือนว่าเศรษฐกิจอาจชะลอใน 6–18 เดือน' }
      : unInv ? { en:'The curve has turned positive again after a long inversion. In past cycles, slowdowns often began around this point — watch jobs data closely.', th:'เส้นกลับมาเป็นบวกหลังจากกลับหัวนาน ในอดีตเศรษฐกิจมักเริ่มชะลอช่วงนี้ ควรดูข้อมูลการจ้างงานใกล้ๆ' }
      : { en:'The curve slopes upward normally — no recession warning from bonds.', th:'เส้นชันขึ้นตามปกติ ตลาดบอนด์ยังไม่ส่งสัญญาณถดถอย' }, 'growth', hv('t10y2y', 52)));

    /* 4 growth and jobs */
    var un = mac('unrate'), sahm = mv('sahm'), pay = mac('payrolls'), cl = mac('claims'), rt = mac('retail'), ip = mac('indpro'), gdp = mv('gdp'), sent = mv('sent'), rp = mv('recprob');
    var pay3 = pay ? mean(lastN(pay.hist, 3).map(function(p){ return p[1]; })) : null, pay12 = pay ? mean(lastN(pay.hist, 12).map(function(p){ return p[1]; })) : null;
    var clY = cl && isNum(cl.y1) ? (cl.v / cl.y1 - 1) * 100 : null, realRetail = rt && cpi ? rt.v - cpi.v : null;
    var sG = 0;
    if(isNum(pay3)) sG += pay3 > 150 ? 1 : pay3 < 50 ? -1 : 0;
    if(isNum(sahm)) sG += sahm >= 0.5 ? -2 : sahm >= 0.3 ? -1 : 0;
    if(isNum(clY)) sG += clY > 15 ? -1 : clY < -5 ? 0.5 : 0;
    if(isNum(realRetail)) sG += realRetail > 1 ? 0.5 : realRetail < -0.5 ? -0.5 : 0;
    if(ip) sG += ip.v > 1 ? 0.5 : ip.v < -1 ? -0.5 : 0;
    if(isNum(gdp)) sG += gdp > 2 ? 0.5 : gdp < 0.5 ? -1 : 0;
    if(isNum(rp)) sG += rp > 20 ? -1 : 0;
    E.growth = { un:un && un.v, unMin:hmin('unrate', 1), sahm:sahm, pay3:pay3, pay12:pay12, clY:clY, cl:cl && cl.v, realRetail:realRetail, ip:ip && ip.v, gdp:gdp, sent:sent, rp:rp };
    E.pillars.push(pillar('growth', sG, { en:'Growth & jobs', th:'เศรษฐกิจและการจ้างงาน' }, 'factory', pc(un && un.v, 1), { en:'unemployment · jobs +' + f(pay3, 0) + 'k/mo', th:'ว่างงาน · จ้างงานเพิ่ม ' + f(pay3, 0) + 'k/เดือน' },
      { en:'Unemployment ' + pc(un && un.v, 1) + ', about ' + f(pay3, 0) + 'k new jobs a month (3-month average), GDP ' + pc(gdp, 1) + '. ' + (sahm >= 0.5 ? 'The Sahm rule is triggered — a classic recession signal.' : sG >= 1 ? 'The economy looks solid.' : sG <= -1 ? 'The economy is losing steam.' : 'Growth is moderate.'),
        th:'ว่างงาน ' + pc(un && un.v, 1) + ' จ้างงานเพิ่มเฉลี่ย ' + f(pay3, 0) + 'k ตำแหน่งต่อเดือน GDP โต ' + pc(gdp, 1) + ' ' + (sahm >= 0.5 ? 'สัญญาณ Sahm ทำงานแล้ว ซึ่งเป็นสัญญาณถดถอยแบบคลาสสิก' : sG >= 1 ? 'เศรษฐกิจยังแข็งแรง' : sG <= -1 ? 'เศรษฐกิจเริ่มแผ่วลง' : 'เศรษฐกิจโตปานกลาง') }, 'growth', hv('unrate', 24)));

    /* 5 dollar and baht */
    var thb1 = reg('thb_1m'), dx1 = dxy && dxy.m1, dx3 = dxy && dxy.m3;
    var sD = (dx3 > 3 ? -1 : dx3 < -3 ? 1 : 0) + (dx1 > 1.5 ? -0.5 : dx1 < -1.5 ? 0.5 : 0);
    E.fx = { dxy:dxy && dxy.price, dx1:dx1, dx3:dx3, thb:D.m && D.m.ccy && D.m.ccy.THB, thb1:thb1, thbY:reg('thb_ytd') };
    E.pillars.push(pillar('fx', sD, { en:'Dollar & baht', th:'ดอลลาร์และเงินบาท' }, 'coin', f(dxy && dxy.price, 1), { en:'DXY · baht 1m ' + spc(thb1, 1), th:'ดัชนีดอลลาร์ · บาท 1 เดือน ' + spc(thb1, 1) },
      { en:'The dollar ' + (dx3 > 1 ? 'has strengthened ' : dx3 < -1 ? 'has weakened ' : 'is flat ') + spc(dx3, 1) + ' in 3 months. ' + (dx3 > 2 ? 'A strong dollar usually pulls money out of emerging markets like Thailand.' : dx3 < -2 ? 'A softer dollar usually helps emerging markets and commodities.' : '') + ' The baht moved ' + spc(thb1, 1) + ' this month (negative = weaker).',
        th:'ดอลลาร์' + (dx3 > 1 ? 'แข็งขึ้น ' : dx3 < -1 ? 'อ่อนลง ' : 'ทรงตัว ') + spc(dx3, 1) + ' ใน 3 เดือน ' + (dx3 > 2 ? 'ดอลลาร์แข็งมักดึงเงินออกจากตลาดเกิดใหม่อย่างไทย' : dx3 < -2 ? 'ดอลลาร์อ่อนมักช่วยตลาดเกิดใหม่และสินค้าโภคภัณฑ์' : '') + ' เงินบาทเดือนนี้ ' + spc(thb1, 1) + ' (ติดลบ = บาทอ่อน)' }, 'fx', []));

    /* 6 credit and stress */
    var hyv = hy && hy.v, dhy = mchg('hy', 'm1'), nf = mv('nfci'), vx = vix && vix.price;
    var sS = (hyv < 3.2 ? 1 : hyv > 6 ? -2 : hyv > 4.5 ? -1 : 0) + (dhy > 0.4 ? -1 : 0) + (vx < 15 ? 0.5 : vx > 32 ? -2 : vx > 25 ? -1 : 0) + (nf > 0 ? -1 : nf < -0.4 ? 0.5 : 0);
    E.stress = { hy:hyv, dhy:dhy, nfci:nf, vix:vx, vix1:vix && vix.m1 };
    E.pillars.push(pillar('stress', sS, { en:'Credit & fear', th:'สินเชื่อและความกลัว' }, 'shield', f(vx, 1), { en:'VIX · junk spread ' + pc(hyv, 2), th:'VIX · ส่วนต่างหุ้นกู้เสี่ยง ' + pc(hyv, 2) },
      { en:'VIX at ' + f(vx, 1) + (vx < 16 ? ' — calm.' : vx > 25 ? ' — fearful.' : ' — normal.') + ' Junk-bond spread ' + pc(hyv, 2) + (dhy > 0.3 ? ', widening (lenders getting nervous).' : hyv < 3.5 ? ', tight (lenders relaxed).' : '.'),
        th:'VIX ' + f(vx, 1) + (vx < 16 ? ' ตลาดสงบ' : vx > 25 ? ' ตลาดกลัว' : ' ระดับปกติ') + ' ส่วนต่างหุ้นกู้เสี่ยงสูง ' + pc(hyv, 2) + (dhy > 0.3 ? ' กำลังกว้างขึ้น (ผู้ให้กู้เริ่มกังวล)' : hyv < 3.5 ? ' แคบ (ผู้ให้กู้ยังสบายใจ)' : '') }, 'growth', hv('hy', 52)));

    /* 7 valuation and sentiment (long-run risk, not timing) */
    var cape = bub('cape'), buf = bub('buffett'), md = bub('margin_debt'), pcr = bub('putcall');
    var cv2 = cape && cape.value, bv = buf && buf.value_pct, mdy = md && md.yoy_pct, pv = pcr && pcr.value;
    var sV = (cv2 > 40 ? -1.5 : cv2 > 32 ? -1 : cv2 < 20 ? 1 : 0) + (bv > 200 ? -0.5 : 0) + (mdy > 25 ? -0.5 : mdy < -10 ? 0.5 : 0) + (pv < 0.75 ? -0.5 : pv > 1.1 ? 0.5 : 0);
    E.val = { cape:cv2, buf:bv, mdy:mdy, pcr:pv };
    E.pillars.push(pillar('val', sV, { en:'Valuation & mood', th:'ความแพงและอารมณ์ตลาด' }, 'scale', f(cv2, 1), { en:'Shiller CAPE · margin debt ' + spc(mdy, 0) + ' y/y', th:'CAPE · หนี้มาร์จิ้น ' + spc(mdy, 0) + ' ต่อปี' },
      { en:'US stocks trade at a CAPE of ' + f(cv2, 1) + (cv2 > 32 ? ' — very expensive by history (long-run average ~17). Expensive markets can keep rising, but they fall harder on bad news.' : ' — not stretched.'),
        th:'หุ้นสหรัฐฯ มี CAPE ' + f(cv2, 1) + (cv2 > 32 ? ' ถือว่าแพงมากเมื่อเทียบอดีต (ค่าเฉลี่ยระยะยาวประมาณ 17) ตลาดแพงยังขึ้นต่อได้ แต่เวลามีข่าวร้ายมักร่วงแรงกว่า' : ' ยังไม่แพงเกินไป') }, 'growth', bub('cape') && bub('cape').history ? lastN(bub('cape').history, 36).map(function(p){ return p.v; }) : []));

    /* 8 commodities */
    var oilY = oil && isNum(oil.y1) ? (oil.v / oil.y1 - 1) * 100 : null, oil3 = oil && isNum(oil.m3) ? (oil.v / oil.m3 - 1) * 100 : null, gld = flow('GLD');
    var sO = (oilY > 40 ? -2 : oilY > 15 ? -1 : oilY < -15 ? 1 : 0) + (oil3 > 20 ? -0.5 : 0);
    E.comm = { oil:oil && oil.v, oilY:oilY, oil3:oil3, gold3:gld && gld.m3, gold1:gld && gld.m1, dbc3:reg('dbc_3m') };
    E.pillars.push(pillar('comm', sO, { en:'Oil & commodities', th:'น้ำมันและสินค้าโภคภัณฑ์' }, 'barrel', '$' + f(oil && oil.v, 0), { en:'WTI · ' + spc(oilY, 0) + ' in a year', th:'น้ำมัน WTI · 1 ปี ' + spc(oilY, 0) },
      { en:'Oil is ' + spc(oilY, 0) + ' versus a year ago' + (oilY > 25 ? ' — that feeds into inflation and squeezes consumers.' : oilY < -15 ? ' — cheaper energy helps consumers and inflation.' : '.') + ' Gold ' + spc(gld && gld.m3, 1) + ' in 3 months.',
        th:'น้ำมันเทียบปีก่อน ' + spc(oilY, 0) + (oilY > 25 ? ' ส่งแรงกดดันเงินเฟ้อและกดกำลังซื้อผู้บริโภค' : oilY < -15 ? ' พลังงานถูกลงช่วยทั้งผู้บริโภคและเงินเฟ้อ' : '') + ' ทองคำ 3 เดือน ' + spc(gld && gld.m3, 1) }, 'fx', hv('oil', 52)));

    /* 9 market trend and breadth */
    var b200 = reg('breadth_200'), b50 = reg('breadth_50'), cd3 = reg('cyclical_vs_defensive_3m');
    var sT = (spx && spx.above_ma200 ? 1 : -1) + (b200 > 60 ? 0.5 : b200 < 40 ? -0.5 : 0) + (cd3 > 2 ? 0.5 : cd3 < -2 ? -0.5 : 0) + (spx && spx.off_high > -5 ? 0.3 : spx && spx.off_high < -15 ? -0.5 : 0);
    E.trend = { spx:spx && spx.price, ab:spx && spx.above_ma200, off:spx && spx.off_high, b200:b200, b50:b50, cd3:cd3, sm1:reg('smallcap_vs_market_1m') };
    E.pillars.push(pillar('trend', sT, { en:'Market trend', th:'แนวโน้มตลาดหุ้น' }, 'trend', f(spx && spx.price, 0), { en:'S&P 500 · ' + f(b200, 0) + '% of stocks above 200-day', th:'S&P 500 · หุ้น ' + f(b200, 0) + '% อยู่เหนือเส้น 200 วัน' },
      { en:'The S&P 500 is ' + (spx && spx.above_ma200 ? 'above' : 'below') + ' its 200-day average, ' + spc(spx && spx.off_high, 1) + ' from its high; ' + f(b200, 0) + '% of stocks are in up-trends' + (b50 < 45 ? ' and short-term breadth is weak.' : '.'),
        th:'S&P 500 อยู่' + (spx && spx.above_ma200 ? 'เหนือ' : 'ใต้') + 'เส้นค่าเฉลี่ย 200 วัน ห่างจุดสูงสุด ' + spc(spx && spx.off_high, 1) + ' หุ้น ' + f(b200, 0) + '% ยังเป็นขาขึ้น' + (b50 < 45 ? ' แต่ระยะสั้นหุ้นส่วนใหญ่เริ่มอ่อนแรง' : '') }, 'rot', []));

    /* overall weather 0..100 */
    var W = { infl:.14, fed:.14, curve:.08, growth:.16, fx:.06, stress:.14, val:.08, comm:.08, trend:.12 }, acc = 0, wsum = 0;
    E.pillars.forEach(function(p){ acc += p.score * W[p.key]; wsum += W[p.key]; });
    E.score = clamp(50 + acc / wsum * 25, 0, 100);
    E.weather = E.score >= 70 ? { k:'sun', w:{ en:'Clear skies', th:'ฟ้าใส' }, s:{ en:'conditions favour taking risk', th:'สภาวะเอื้อต่อการลงทุนในหุ้น' } }
      : E.score >= 56 ? { k:'psun', w:{ en:'Partly cloudy', th:'มีเมฆบางส่วน' }, s:{ en:'mostly fine, a few things to watch', th:'โดยรวมยังดี แต่มีบางเรื่องต้องจับตา' } }
      : E.score >= 44 ? { k:'cloud', w:{ en:'Overcast', th:'ฟ้าครึ้ม' }, s:{ en:'signals are mixed — no clear edge', th:'สัญญาณปนกัน ยังไม่มีฝั่งไหนได้เปรียบชัด' } }
      : E.score >= 30 ? { k:'rain', w:{ en:'Rain likely', th:'ฝนตั้งเค้า' }, s:{ en:'headwinds outweigh tailwinds — be selective', th:'แรงต้านมากกว่าแรงหนุน ควรเลือกมากขึ้นและระวังความเสี่ยง' } }
      : { k:'storm', w:{ en:'Storm', th:'พายุ' }, s:{ en:'risk-off conditions — protect capital first', th:'ตลาดหนีความเสี่ยง ควรปกป้องเงินต้นก่อน' } };

    /* investment-clock position */
    var gMom = 0, n = 0;
    function addG(v, k){ if(isNum(v)){ gMom += clamp(v * k, -1, 1); n++; } }
    addG(isNum(pay3) && isNum(pay12) ? pay3 - pay12 : null, 1 / 80);
    addG(un && isNum(un.m3) ? -(un.v - un.m3) : null, 2.5);
    addG(ip && isNum(ip.m3) ? ip.v - ip.m3 : null, 1 / 2);
    addG(rt && isNum(rt.m3) ? rt.v - rt.m3 : null, 1 / 2);
    addG(isNum(sent) && mac('sent') && isNum(mac('sent').m3) ? sent - mac('sent').m3 : null, 1 / 8);
    addG(cd3, 1 / 5);
    addG(isNum(gdp) ? gdp - 2 : null, 1 / 2);
    var g = n ? gMom / n : 0;
    var iMom = 0, m = 0;
    function addI(v, k){ if(isNum(v)){ iMom += clamp(v * k, -1, 1); m++; } }
    addI(c3, 3); addI(cpi && isNum(cpi.m3) ? cpi.v - cpi.m3 : null, 2); addI(be5 && isNum(be5.m3) ? be5.v - be5.m3 : null, 3);
    addI(oil3, 1 / 25); addI(isNum(cv) ? cv - 2.5 : null, 1 / 1.5);
    var i = m ? iMom / m : 0;
    E.g = clamp(g * 1.6, -1, 1); E.i = clamp(i * 1.6, -1, 1);
    E.phase = E.g >= 0 ? (E.i >= 0 ? 'overheat' : 'recovery') : (E.i >= 0 ? 'stagflation' : 'reflation');
    E.phaseConf = Math.round(clamp(Math.sqrt(E.g * E.g + E.i * E.i) / 1.0, 0, 1) * 100);

    changes(E); diverge(E); scenarios(E); headline(E);
    return E;
  }

  /* what moved this month (each against a size that counts as "notable") */
  function changes(E){
    var out = [];
    function add(name, now, before, unit, thr, pctMode, good){
      if(!isNum(now) || !isNum(before)) return;
      var d = pctMode ? (now / before - 1) * 100 : now - before;
      if(Math.abs(d) < thr) return;
      out.push({ n:name, now:now, d:d, unit:unit, pct:pctMode, mag:Math.abs(d) / thr, good:good ? good(d) : null });
    }
    var s = function(k){ return mac(k) || {}; };
    add({ en:'10y yield', th:'บอนด์ 10 ปี' }, s('y10').v, s('y10').m1, '%', 0.2, false, function(d){ return d < 0; });
    add({ en:'2y yield', th:'บอนด์ 2 ปี' }, s('y2').v, s('y2').m1, '%', 0.2, false, function(d){ return d < 0; });
    add({ en:'Oil (WTI)', th:'น้ำมัน WTI' }, s('oil').v, s('oil').m1, '$', 8, true, function(d){ return d < 0; });
    add({ en:'Junk-bond spread', th:'ส่วนต่างหุ้นกู้เสี่ยงสูง' }, s('hy').v, s('hy').m1, '%', 0.3, false, function(d){ return d < 0; });
    add({ en:'Unemployment', th:'อัตราว่างงาน' }, s('unrate').v, s('unrate').m1, '%', 0.2, false, function(d){ return d < 0; });
    add({ en:'Jobless claims', th:'ผู้ขอสวัสดิการว่างงาน' }, s('claims').v, s('claims').m1, 'k', 10, true, function(d){ return d < 0; });
    add({ en:'CPI inflation', th:'เงินเฟ้อ CPI' }, s('cpi').v, s('cpi').m1, '%', 0.2, false, function(d){ return d < 0; });
    add({ en:'Inflation expectations (5y)', th:'เงินเฟ้อคาดการณ์ 5 ปี' }, s('be5').v, s('be5').m1, '%', 0.12, false, function(d){ return d < 0; });
    add({ en:'Mortgage rate', th:'ดอกเบี้ยบ้าน' }, s('mort').v, s('mort').m1, '%', 0.25, false, function(d){ return d < 0; });
    add({ en:'Consumer sentiment', th:'ความเชื่อมั่นผู้บริโภค' }, s('sent').v, s('sent').m1, '', 4, false, function(d){ return d > 0; });
    var mk = function(k){ return mkt(k) || {}; };
    [['vix', { en:'VIX (fear)', th:'VIX (ความกลัว)' }, 15, function(d){ return d < 0; }], ['dxy', { en:'US dollar', th:'ดอลลาร์' }, 1.8, null], ['spx', { en:'S&P 500', th:'S&P 500' }, 4, function(d){ return d > 0; }]].forEach(function(r){
      var o = mk(r[0]); if(isNum(o.m1) && Math.abs(o.m1) >= r[2]) out.push({ n:r[1], now:o.price, d:o.m1, unit:'', pct:true, mag:Math.abs(o.m1) / r[2], good:r[3] ? r[3](o.m1) : null });
    });
    var g = flow('GLD'); if(g && Math.abs(g.m1) >= 4) out.push({ n:{ en:'Gold', th:'ทองคำ' }, now:g.price, d:g.m1, unit:'', pct:true, mag:Math.abs(g.m1) / 4, good:null });
    var th = reg('thb_1m'); if(isNum(th) && Math.abs(th) >= 1.5) out.push({ n:{ en:'Thai baht', th:'เงินบาท' }, now:D.m.ccy.THB && D.m.ccy.THB.rate, d:th, unit:'', pct:true, mag:Math.abs(th) / 1.5, good:th > 0 });
    out.sort(function(a, b){ return b.mag - a.mag; });
    E.changes = out.slice(0, 8);
  }

  /* signals that disagree with each other -- often the most useful thing to know */
  function diverge(E){
    var o = [], spx = mkt('spx') || {}, gld = flow('GLD') || {}, dxy = mkt('dxy') || {};
    if(spx.off_high > -4 && isNum(E.stress.dhy) && E.stress.dhy > 0.3) o.push({ en:'Stocks are near their high, but junk-bond spreads are widening. Bond investors often notice trouble first.', th:'หุ้นยังใกล้จุดสูงสุด แต่ส่วนต่างหุ้นกู้เสี่ยงสูงกว้างขึ้น นักลงทุนตราสารหนี้มักเห็นปัญหาก่อน' });
    if(E.val.cape > 33 && E.stress.vix < 17) o.push({ en:'Prices are very expensive yet fear is low. That combination leaves little cushion if bad news arrives.', th:'ราคาแพงมาก แต่ความกลัวต่ำ ถ้ามีข่าวร้ายเข้ามา ตลาดแทบไม่มีกันชนรองรับ' });
    if(E.fed.dy10 > 0.2 && spx.m1 < -2) o.push({ en:'Yields up while stocks fall: the market is worried about interest rates, not growth.', th:'บอนด์ยีลด์ขึ้นแต่หุ้นลง แปลว่าตลาดกังวลเรื่องดอกเบี้ย ไม่ใช่เรื่องเศรษฐกิจ' });
    if(E.fed.dy10 > 0.2 && spx.m1 > 2) o.push({ en:'Yields and stocks both up: the market is pricing stronger growth.', th:'บอนด์ยีลด์และหุ้นขึ้นพร้อมกัน ตลาดกำลังมองว่าเศรษฐกิจจะโตดี' });
    if(gld.m1 > 3 && dxy.m1 > 1) o.push({ en:'Gold and the dollar rising together — investors are looking for safety.', th:'ทองคำกับดอลลาร์ขึ้นพร้อมกัน นักลงทุนกำลังหาที่หลบภัย' });
    if(isNum(E.fed.gap) && E.fed.gap > 0.3) o.push({ en:'The 2-year yield sits well above the Fed rate: bonds are betting the Fed may have to raise rates, not cut.', th:'บอนด์ 2 ปีสูงกว่าดอกเบี้ยเฟดมาก ตลาดบอนด์กำลังเดิมพันว่าเฟดอาจต้องขึ้นดอกเบี้ย ไม่ใช่ลด' });
    if(isNum(E.fed.gap) && E.fed.gap < -0.5 && E.growth.sahm < 0.3) o.push({ en:'Bonds price big rate cuts although jobs data is still fine — one of them is wrong.', th:'ตลาดบอนด์คาดว่าจะลดดอกเบี้ยเยอะ ทั้งที่ข้อมูลการจ้างงานยังดี ต้องมีฝั่งหนึ่งที่คาดผิด' });
    if(E.trend.b50 < 45 && E.trend.ab && E.trend.off > -5) o.push({ en:'The index looks healthy but most stocks are weakening — the rally is narrow and leans on a few giants.', th:'ดัชนีดูดี แต่หุ้นส่วนใหญ่เริ่มอ่อนแรง ขาขึ้นแคบลงและพึ่งหุ้นใหญ่ไม่กี่ตัว' });
    if(E.growth.sent < 60 && E.growth.realRetail > 1) o.push({ en:'Consumers say they feel bad, yet they keep spending more than inflation.', th:'ผู้บริโภคบอกว่ารู้สึกแย่ แต่ยังใช้จ่ายเพิ่มเร็วกว่าเงินเฟ้อ' });
    if(E.comm.oilY > 30 && E.infl.c3 < 0) o.push({ en:'Oil has jumped but core inflation is still easing — watch whether energy costs start leaking into other prices.', th:'น้ำมันพุ่งแรง แต่เงินเฟ้อพื้นฐานยังชะลอ ต้องดูว่าต้นทุนพลังงานจะลามไปราคาสินค้าอื่นหรือไม่' });
    if(E.comm.oilY > 30 && E.infl.c3 > 0.1) o.push({ en:'Oil has jumped AND core inflation is picking up — the Fed will find it hard to cut rates.', th:'น้ำมันพุ่งแรง และเงินเฟ้อพื้นฐานเริ่มเร่ง เฟดจะลดดอกเบี้ยได้ยาก' });
    if(E.fx.dx3 > 2 && reg('em_vs_us_3m') < -3) o.push({ en:'A firm dollar is coinciding with emerging markets lagging the US — the usual pattern, a headwind for Thai stocks.', th:'ดอลลาร์แข็งพร้อมกับตลาดเกิดใหม่แพ้สหรัฐฯ เป็นรูปแบบปกติที่กดดันหุ้นไทย' });
    E.diverge = o.slice(0, 6);
  }

  /* three scenarios for the next 1-3 months, probabilities from the evidence */
  function scenarios(E){
    var a = 1.0 + 0.35 * pScore(E, 'growth') + 0.3 * pScore(E, 'stress') + 0.25 * pScore(E, 'trend');
    var b = 0.35 + 1.0 * Math.max(0, E.i) + (E.comm.oilY > 30 ? 0.45 : E.comm.oilY > 15 ? 0.2 : 0) + (E.fed.gap > 0.25 ? 0.3 : 0) + (mchg('be5', 'm3') > 0.15 ? 0.3 : 0) + (E.infl.c3 > 0.1 ? 0.25 : 0);
    var c = 0.3 + 1.0 * Math.max(0, -E.g) + (E.growth.sahm >= 0.5 ? 1.2 : E.growth.sahm >= 0.3 ? 0.5 : 0) + (E.growth.rp > 20 ? 0.6 : 0) + (E.curve.unInv ? 0.3 : 0) + (E.stress.dhy > 0.3 ? 0.4 : 0) + (E.trend.b200 < 45 ? 0.3 : 0) + (E.growth.clY > 15 ? 0.3 : 0);
    var ex = [Math.exp(a), Math.exp(b), Math.exp(c)], s = ex[0] + ex[1] + ex[2];
    var p = ex.map(function(x){ return Math.round(x / s * 100); }); p[0] = 100 - p[1] - p[2];
    var tr = function(name, cur, thr, dir, unit, d){ return { n:name, cur:cur, thr:thr, dir:dir, unit:unit, d:d == null ? 1 : d }; };
    E.scen = [
      { k:'soft', p:p[0], icon:'psun', name:{ en:'Steady as she goes', th:'ไปต่อแบบนุ่มนวล' },
        story:{ en:'Growth stays positive, inflation drifts lower, no shock from rates. Stocks grind higher with normal dips.', th:'เศรษฐกิจยังโต เงินเฟ้อค่อยๆ ลง ดอกเบี้ยไม่ช็อกตลาด หุ้นค่อยๆ ไต่ขึ้นและย่อตามปกติ' },
        win:['Stocks (quality growth)', 'Small caps', 'Emerging markets'], winTh:['หุ้นเติบโตคุณภาพดี', 'หุ้นขนาดเล็ก', 'ตลาดเกิดใหม่รวมไทย'], lose:['Cash', 'Gold (relative)'], loseTh:['เงินสด', 'ทองคำ (เมื่อเทียบหุ้น)'],
        trig:[tr({ en:'Core PCE below', th:'Core PCE ต่ำกว่า' }, E.infl.v, 2.8, -1, '%'), tr({ en:'Unemployment below', th:'ว่างงานต่ำกว่า' }, E.growth.un, 4.5, -1, '%'), tr({ en:'Junk spread below', th:'ส่วนต่างหุ้นกู้ต่ำกว่า' }, E.stress.hy, 3.8, -1, '%', 2)] },
      { k:'hot', p:p[1], icon:'flame', name:{ en:'Inflation comes back', th:'เงินเฟ้อกลับมา' },
        story:{ en:'Prices re-accelerate (oil, wages), the Fed stays tight or hikes, long-term yields jump. Expensive growth stocks and long bonds get hit.', th:'ของกลับมาแพงขึ้น (น้ำมัน ค่าแรง) เฟดคงดอกเบี้ยสูงหรือขึ้นอีก บอนด์ยีลด์ระยะยาวพุ่ง หุ้นเติบโตที่แพงและบอนด์ระยะยาวโดนหนัก' },
        win:['Energy & materials', 'Commodities', 'Short-term bonds', 'Value stocks / banks'], winTh:['พลังงานและวัสดุ', 'สินค้าโภคภัณฑ์', 'บอนด์ระยะสั้น', 'หุ้นคุณค่า/ธนาคาร'], lose:['Long bonds', 'Expensive tech', 'Real estate'], loseTh:['บอนด์ระยะยาว', 'หุ้นเทคราคาแพง', 'อสังหาฯ'],
        trig:[tr({ en:'Core PCE above', th:'Core PCE สูงกว่า' }, E.infl.v, 3.3, 1, '%'), tr({ en:'5y inflation expectation above', th:'เงินเฟ้อคาดการณ์ 5 ปี สูงกว่า' }, mv('be5'), 2.7, 1, '%', 2), tr({ en:'10y yield above', th:'บอนด์ 10 ปี สูงกว่า' }, E.fed.y10, 5.25, 1, '%', 2)] },
      { k:'slow', p:p[2], icon:'rain', name:{ en:'Growth scare', th:'เศรษฐกิจชะลอแรง' },
        story:{ en:'Jobs weaken, profits get cut, credit spreads widen. Stocks fall 10–20%, bonds and defensive sectors hold up, the Fed starts cutting.', th:'การจ้างงานแย่ลง กำไรถูกปรับลด หุ้นกู้ถูกเทขาย หุ้นอาจลง 10–20% บอนด์และหุ้นตั้งรับประคองได้ เฟดเริ่มลดดอกเบี้ย' },
        win:['Long Treasury bonds', 'Gold', 'Health care & staples', 'Cash'], winTh:['บอนด์รัฐบาลระยะยาว', 'ทองคำ', 'หุ้นสุขภาพและสินค้าจำเป็น', 'เงินสด'], lose:['Cyclicals & small caps', 'Banks', 'Oil'], loseTh:['หุ้นวัฏจักรและหุ้นเล็ก', 'ธนาคาร', 'น้ำมัน'],
        trig:[tr({ en:'Sahm rule at or above', th:'สัญญาณ Sahm ถึง' }, E.growth.sahm, 0.5, 1, '', 2), tr({ en:'Weekly jobless claims above', th:'คนขอสวัสดิการว่างงานต่อสัปดาห์เกิน' }, E.growth.cl, 260, 1, 'k', 0), tr({ en:'Junk spread above', th:'ส่วนต่างหุ้นกู้กว้างกว่า' }, E.stress.hy, 4.5, 1, '%', 2)] }
    ];
    E.scen.sort(function(x, y){ return y.p - x.p; });
  }
  function pScore(E, k){ for(var i = 0; i < E.pillars.length; i++) if(E.pillars[i].key === k) return E.pillars[i].score; return 0; }

  function headline(E){
    var ph = PHASES[E.phase], top = E.pillars.slice().sort(function(a, b){ return Math.abs(b.score) - Math.abs(a.score); });
    var good = E.pillars.filter(function(p){ return p.score >= 1; }), bad = E.pillars.filter(function(p){ return p.score <= -1; });
    E.head = {
      en:'The economy looks like the “' + ph.short.en + '” phase (' + ph.name.en.split('— ')[1] + '). Overall: ' + E.weather.w.en.toLowerCase() + ' — ' + E.weather.s.en + '. ' +
        (good.length ? 'Helping: ' + good.map(function(p){ return p.title.en.toLowerCase(); }).join(', ') + '. ' : '') + (bad.length ? 'Holding back: ' + bad.map(function(p){ return p.title.en.toLowerCase(); }).join(', ') + '.' : ''),
      th:'เศรษฐกิจตอนนี้ดูเหมือนอยู่ช่วง “' + ph.short.th + '” (' + ph.name.th.split('— ')[1] + ') ภาพรวม' + E.weather.w.th + ' คือ' + E.weather.s.th + ' ' +
        (good.length ? 'ตัวที่ช่วยหนุน: ' + good.map(function(p){ return p.title.th; }).join(' · ') + ' ' : '') + (bad.length ? 'ตัวที่ฉุดรั้ง: ' + bad.map(function(p){ return p.title.th; }).join(' · ') : '')
    };
    E.top = top.slice(0, 4);
  }

  /* ============================================================= PORTFOLIO */
  var ETF_INFO = {
    SPY:{ n:'S&P 500', th:'หุ้นใหญ่สหรัฐฯ (S&P 500)', cls:'eq', sec:'Diversified', geo:'US' },
    QQQ:{ n:'Nasdaq 100', th:'หุ้นเทคสหรัฐฯ (Nasdaq 100)', cls:'eq', sec:'Technology', geo:'US' },
    IWM:{ n:'US small caps', th:'หุ้นเล็กสหรัฐฯ', cls:'eq', sec:'Diversified', geo:'US' },
    EFA:{ n:'Developed ex-US', th:'หุ้นประเทศพัฒนาแล้ว (นอกสหรัฐฯ)', cls:'eq', sec:'Diversified', geo:'Global' },
    EEM:{ n:'Emerging markets', th:'หุ้นตลาดเกิดใหม่', cls:'eq', sec:'Diversified', geo:'Global' },
    THD:{ n:'Thailand (MSCI)', th:'หุ้นไทย (MSCI Thailand)', cls:'eq', sec:'Diversified', geo:'TH' },
    VNQ:{ n:'US REITs', th:'กองทรัสต์อสังหาฯ สหรัฐฯ', cls:'reit', sec:'Real Estate', geo:'US' },
    TLT:{ n:'20y+ Treasuries', th:'บอนด์รัฐบาลสหรัฐฯ 20 ปีขึ้นไป', cls:'bond', sec:'Bonds', geo:'US' },
    IEF:{ n:'7–10y Treasuries', th:'บอนด์รัฐบาลสหรัฐฯ 7–10 ปี', cls:'bond', sec:'Bonds', geo:'US' },
    SHY:{ n:'1–3y Treasuries', th:'บอนด์รัฐบาลสหรัฐฯ 1–3 ปี', cls:'bond', sec:'Bonds', geo:'US' },
    TIP:{ n:'Inflation-linked bonds', th:'บอนด์ป้องกันเงินเฟ้อ (TIPS)', cls:'bond', sec:'Bonds', geo:'US' },
    LQD:{ n:'Investment-grade corporate', th:'หุ้นกู้เอกชนคุณภาพดี', cls:'bond', sec:'Bonds', geo:'US' },
    HYG:{ n:'High-yield corporate', th:'หุ้นกู้ผลตอบแทนสูง', cls:'bond', sec:'Bonds', geo:'US' },
    GLD:{ n:'Gold', th:'ทองคำ', cls:'gold', sec:'Gold', geo:'Global' },
    DBC:{ n:'Commodities basket', th:'ตะกร้าสินค้าโภคภัณฑ์', cls:'comm', sec:'Commodities', geo:'Global' },
    USO:{ n:'Crude oil', th:'น้ำมันดิบ', cls:'comm', sec:'Commodities', geo:'Global' },
    UUP:{ n:'US dollar', th:'ดอลลาร์สหรัฐฯ', cls:'cash', sec:'Cash', geo:'US' },
    XLK:{ n:'Tech sector', th:'กลุ่มเทคโนโลยี', cls:'eq', sec:'Technology', geo:'US' },
    XLF:{ n:'Financials', th:'กลุ่มการเงิน', cls:'eq', sec:'Financial Services', geo:'US' },
    XLE:{ n:'Energy', th:'กลุ่มพลังงาน', cls:'eq', sec:'Energy', geo:'US' },
    XLV:{ n:'Health care', th:'กลุ่มสุขภาพ', cls:'eq', sec:'Healthcare', geo:'US' },
    XLY:{ n:'Consumer cyclical', th:'กลุ่มสินค้าฟุ่มเฟือย', cls:'eq', sec:'Consumer Cyclical', geo:'US' },
    XLP:{ n:'Consumer staples', th:'กลุ่มสินค้าจำเป็น', cls:'eq', sec:'Consumer Defensive', geo:'US' },
    XLI:{ n:'Industrials', th:'กลุ่มอุตสาหกรรม', cls:'eq', sec:'Industrials', geo:'US' },
    XLU:{ n:'Utilities', th:'กลุ่มสาธารณูปโภค', cls:'eq', sec:'Utilities', geo:'US' },
    XLB:{ n:'Materials', th:'กลุ่มวัสดุพื้นฐาน', cls:'eq', sec:'Basic Materials', geo:'US' },
    XLRE:{ n:'Real estate', th:'กลุ่มอสังหาฯ', cls:'reit', sec:'Real Estate', geo:'US' },
    XLC:{ n:'Communication', th:'กลุ่มสื่อสาร', cls:'eq', sec:'Communication Services', geo:'US' },
    SMH:{ n:'Semiconductors', th:'กลุ่มชิป', cls:'eq', sec:'Technology', geo:'US' },
    VIG:{ n:'Dividend growers', th:'หุ้นปันผลเติบโต', cls:'eq', sec:'Diversified', geo:'US' },
    USMV:{ n:'Low-volatility US', th:'หุ้นสหรัฐฯ ผันผวนต่ำ', cls:'eq', sec:'Diversified', geo:'US' }
  };
  var CLS_N = { eq:{ en:'Stocks', th:'หุ้น' }, bond:{ en:'Bonds', th:'พันธบัตร/หุ้นกู้' }, gold:{ en:'Gold', th:'ทองคำ' }, comm:{ en:'Commodities', th:'สินค้าโภคภัณฑ์' }, reit:{ en:'Real estate', th:'อสังหาฯ' }, cash:{ en:'Cash / dollar', th:'เงินสด/ดอลลาร์' } };
  var GEO_N = { US:{ en:'United States', th:'สหรัฐฯ' }, TH:{ en:'Thailand', th:'ไทย' }, Global:{ en:'Global', th:'ทั่วโลก' } };
  var PRESETS = {
    cons:{ n:{ en:'Careful', th:'ระมัดระวัง' }, d:{ en:'Mostly bonds, some stocks and gold. Small swings.', th:'เน้นบอนด์ มีหุ้นและทองบางส่วน แกว่งน้อย' },
      w:{ SHY:20, IEF:20, LQD:10, TIP:10, SPY:15, USMV:10, THD:5, GLD:10 } },
    bal:{ n:{ en:'Balanced', th:'สมดุล' }, d:{ en:'60/40-style: stocks around the world plus bonds and gold.', th:'สไตล์ 60/40 หุ้นทั่วโลก + บอนด์ + ทอง' },
      w:{ SPY:30, EFA:10, EEM:5, THD:5, IEF:20, LQD:10, TIP:5, GLD:10, DBC:5 } },
    grow:{ n:{ en:'Growth', th:'เติบโต' }, d:{ en:'Mostly stocks with a tech tilt; bigger swings.', th:'เน้นหุ้น เอียงไปทางเทค แกว่งมากกว่า' },
      w:{ SPY:30, QQQ:25, SMH:5, EFA:10, EEM:10, THD:5, IEF:10, GLD:5 } }
  };

  function stock(t){ return D.m && D.m.stocks && D.m.stocks[t] || null; }
  function info(t){
    var e = ETF_INFO[t], s = stock(t);
    if(e && (D.b && D.b.etf && D.b.etf[t] || !s)) return { t:t, n:T({ en:e.n, th:e.th }), cls:e.cls, sec:e.sec, geo:e.geo, etf:true, s:s };
    if(s) return { t:t, n:s.name || t, cls:'eq', sec:s.sector || 'Diversified', geo:s.cal === 'th' ? 'TH' : 'US', etf:false, s:s };
    return null;
  }
  var calCache = {};
  function calDays(k){ if(!calCache[k]) calCache[k] = (D.m.charts && D.m.charts.cal && D.m.charts.cal[k] || '').split(','); return calCache[k]; }
  function wk(t){ return Math.floor((tms(t) / 864e5 + 3) / 7); }   // weeks since a Monday
  var wkCache = {};
  /* weekly closes as { week -> close } (last close in each week) */
  function weekly(t){
    if(wkCache[t]) return wkCache[t];
    var out = {}, e = D.b && D.b.etf && D.b.etf[t];
    if(e){ for(var i = 0; i < e.t.length; i++) out[wk(e.t[i])] = e.c[i]; }
    else {
      var s = stock(t); if(!s || !s.c) return null;
      var c = s.c.split(','), days = calDays(s.cal || 'us');
      var off = days.length - c.length;
      for(var j = 0; j < c.length; j++){ var v = parseFloat(c[j]), d = days[j + off]; if(isNum(v) && d) out[wk(d)] = v; }
    }
    wkCache[t] = out; return out;
  }
  function returnsFor(list, weeks){
    /* aligned weekly returns over the last `weeks` weeks where every series has data */
    var maps = list.map(weekly), keys = null;
    maps.forEach(function(m){ if(!m) return; var ks = Object.keys(m).map(Number); keys = keys ? keys.filter(function(k){ return m[k] != null; }) : ks; });
    if(!keys) return null;
    keys.sort(function(a, b){ return a - b; });
    var cutoff = keys[keys.length - 1] - weeks; keys = keys.filter(function(k){ return k >= cutoff; });
    var R = list.map(function(){ return []; }); R.wk = [];
    for(var i = 1; i < keys.length; i++){
      if(keys[i] - keys[i - 1] > 2) continue;
      R.wk.push(keys[i]);
      list.forEach(function(t, j){ var m = maps[j]; R[j].push(m[keys[i]] / m[keys[i - 1]] - 1); });
    }
    return R;
  }
  function cov(a, b){ var ma = mean(a), mb = mean(b), s = 0; for(var i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb); return s / (a.length - 1); }
  function corr(a, b){ var sa = std(a), sb = std(b); return sa && sb ? cov(a, b) / (sa * sb) : 0; }

  /* report card for one holding: 1..5 stars per angle + a verdict */
  var medCache = null;
  function sectorMedians(){
    if(medCache) return medCache;
    var g = {};
    Object.keys(D.m.stocks).forEach(function(k){
      var s = D.m.stocks[k], key = (s.cal || 'us') + '|' + (s.sector || '');
      (g[key] = g[key] || { pe:[], pb:[] });
      if(s.pe > 0 && s.pe < 300) g[key].pe.push(s.pe); if(s.pb > 0 && s.pb < 100) g[key].pb.push(s.pb);
    });
    medCache = {}; Object.keys(g).forEach(function(k){ medCache[k] = { pe:median(g[k].pe), pb:median(g[k].pb) }; });
    return medCache;
  }
  function band(v, cuts, rev){ if(!isNum(v)) return null; for(var i = 0; i < cuts.length; i++){ if(rev ? v <= cuts[i] : v >= cuts[i]) return 5 - i; } return 1; }
  function card(t){
    var I = info(t); if(!I) return null;
    var c = { t:t, I:I, q:null, v:null, m:null, inc:null, r:null, flags:[], say:null };
    var w = weekly(t), ks = w ? Object.keys(w).map(Number).sort(function(a, b){ return a - b; }) : [];
    var cl = ks.map(function(k){ return w[k]; });
    if(!I.etf && I.s){
      var s = I.s, md = sectorMedians()[(s.cal || 'us') + '|' + (s.sector || '')] || {};
      var qa = [band(s.roe, [20, 15, 10, 5]), band(s.margin, [20, 12, 7, 3]), band(s.de, [0.5, 1, 2, 3], true)].filter(isNum);
      c.q = qa.length ? Math.round(mean(qa)) : null;
      var rp = s.pe > 0 && md.pe ? s.pe / md.pe : null, rb = s.pb > 0 && md.pb ? s.pb / md.pb : null;
      var va = [rp == null ? (s.pe != null && s.pe <= 0 ? 1 : null) : band(rp, [0.7, 0.9, 1.1, 1.4], true), rb == null ? null : band(rb, [0.7, 0.9, 1.1, 1.5], true)].filter(isNum);
      c.v = va.length ? Math.round((va[0] * 2 + (va[1] || va[0])) / 3) : null;
      c.relPE = rp; c.medPE = md.pe;
      c.m = band(s.vs_ma200, [10, 3, -3, -10]); if(c.m && s.m3 > 10) c.m = Math.min(5, c.m + 1); if(c.m && s.m3 < -10) c.m = Math.max(1, c.m - 1);
      c.inc = s.div > 0 ? band(s.div, [5, 3, 1.5, 0.01]) : 1;
      c.r = band(s.vol20, [15, 22, 30, 40], true);
      if(s.cross === 'death') c.flags.push({ k:'bad', t:{ en:'death cross (50-day fell below 200-day)', th:'Death cross (เส้น 50 วันตัดลงใต้ 200 วัน)' } });
      if(s.cross === 'golden') c.flags.push({ k:'good', t:{ en:'golden cross', th:'Golden cross (เส้น 50 วันตัดขึ้นเหนือ 200 วัน)' } });
      if(s.rsi > 70) c.flags.push({ k:'mid', t:{ en:'RSI ' + f(s.rsi, 0) + ' — stretched short-term', th:'RSI ' + f(s.rsi, 0) + ' ร้อนแรงระยะสั้น' } });
      if(s.rsi < 30) c.flags.push({ k:'mid', t:{ en:'RSI ' + f(s.rsi, 0) + ' — oversold', th:'RSI ' + f(s.rsi, 0) + ' ถูกขายมากเกินไป' } });
      if(s.off_high > -3) c.flags.push({ k:'good', t:{ en:'near its 52-week high', th:'ใกล้จุดสูงสุด 52 สัปดาห์' } });
      if(s.off_high < -30) c.flags.push({ k:'bad', t:{ en:spc(s.off_high, 0) + ' from its 52-week high', th:'ต่ำกว่าจุดสูงสุด 52 สัปดาห์ ' + spc(s.off_high, 0) } });
      if(s.de > 3) c.flags.push({ k:'bad', t:{ en:'heavy debt (D/E ' + f(s.de, 1) + ')', th:'หนี้สูง (D/E ' + f(s.de, 1) + ')' } });
      if(s.pe != null && s.pe <= 0) c.flags.push({ k:'bad', t:{ en:'currently loss-making', th:'ตอนนี้ยังขาดทุน' } });
    } else if(cl.length > 20){
      var last = cl[cl.length - 1], ma40 = mean(lastN(cl, 40)), r13 = cl.length > 13 ? last / cl[cl.length - 14] - 1 : null;
      var rr = []; for(var i = 1; i < cl.length; i++) rr.push(cl[i] / cl[i - 1] - 1);
      var vol = std(lastN(rr, 52)) * Math.sqrt(52) * 100;
      c.m = band((last / ma40 - 1) * 100, [8, 2, -2, -8]); c.r = band(vol, [8, 14, 20, 28], true);
      c.r13 = r13 == null ? null : r13 * 100; c.vol = vol;
      var fl = flow(t); if(fl && fl.rsi > 70) c.flags.push({ k:'mid', t:{ en:'RSI ' + f(fl.rsi, 0) + ' — stretched', th:'RSI ' + f(fl.rsi, 0) + ' ร้อนแรงระยะสั้น' } });
    }
    var fav = PHASES[E_last.phase];
    c.fit = fav.sectors.indexOf(I.sec) >= 0 || fav.etf.indexOf(t) >= 0 ? 1 : fav.avoid.indexOf(t) >= 0 ? -1 : 0;
    c.say = verdict(c);
    return c;
  }
  function verdict(c){
    if(c.I.etf){
      return c.m >= 4 ? { en:'In a healthy up-trend.', th:'อยู่ในขาขึ้นที่แข็งแรง' } : c.m <= 2 ? { en:'Trending down — check why before adding.', th:'กำลังเป็นขาลง ควรดูเหตุผลก่อนเพิ่ม' } : { en:'Moving sideways.', th:'เคลื่อนไหวออกข้าง' };
    }
    if(c.q >= 4 && c.v >= 4) return { en:'Strong business at a reasonable price — worth studying further.', th:'ธุรกิจแข็งแรง ราคายังไม่แพง น่าศึกษาต่อ' };
    if(c.q >= 4 && c.v <= 2) return { en:'Great business, but the price already reflects it — be patient on entries.', th:'ธุรกิจดีมาก แต่ราคาสะท้อนไปมากแล้ว ควรใจเย็นเรื่องจังหวะซื้อ' };
    if(c.q <= 2 && c.v >= 4) return { en:'Cheap for a reason? The numbers behind the business are weak.', th:'ถูกเพราะมีเหตุผลหรือเปล่า? ตัวเลขพื้นฐานของธุรกิจยังอ่อน' };
    if(c.q <= 2) return { en:'Weak fundamentals — keep the position small.', th:'พื้นฐานยังอ่อน ถ้าถือควรถือน้อย' };
    if(c.m <= 2) return { en:'Fundamentals OK, but the chart is in a down-trend.', th:'พื้นฐานพอใช้ แต่กราฟยังเป็นขาลง' };
    return { en:'Solid, nothing alarming.', th:'โดยรวมพอใช้ ไม่มีจุดน่ากังวลมาก' };
  }

  /* full analysis of a {ticker: weight} map */
  function analyse(W){
    var ts = Object.keys(W).filter(function(t){ return W[t] > 0 && info(t); });
    var tot = ts.reduce(function(s, t){ return s + W[t]; }, 0) || 1;
    var w = ts.map(function(t){ return W[t] / tot; });
    var A = { ts:ts, w:w, cards:ts.map(card), issues:[], missing:Object.keys(W).filter(function(t){ return !info(t); }) };
    if(!ts.length) return A;
    var withData = ts.filter(function(t){ return weekly(t); });
    var R = returnsFor(withData.concat(['SPY', 'TLT', 'UUP', 'USO']), 52);
    if(R && R[0] && R[0].length > 20){
      var nH = withData.length, wd = withData.map(function(t){ return W[t]; }), sw = wd.reduce(function(s, x){ return s + x; }, 0);
      wd = wd.map(function(x){ return x / sw; });
      var port = R[0].map(function(_, k){ var s = 0; for(var j = 0; j < nH; j++) s += wd[j] * R[j][k]; return s; });
      var spy = R[nH], tlt = R[nH + 1], uup = R[nH + 2], uso = R[nH + 3];
      var eq = 1, peak = 1, dd = 0, path = [1];
      port.forEach(function(r){ eq *= 1 + r; path.push(eq); peak = Math.max(peak, eq); dd = Math.min(dd, eq / peak - 1); });
      var sp = 1; spy.forEach(function(r){ sp *= 1 + r; });
      var vol = std(port) * Math.sqrt(52), beta = cov(port, spy) / Math.pow(std(spy), 2);
      var C = withData.map(function(a, i){ return withData.map(function(b, j){ return i === j ? 1 : corr(R[i], R[j]); }); });
      var vols = withData.map(function(_, i){ return std(R[i]) * Math.sqrt(52); });
      var sigW = 0; for(var i = 0; i < nH; i++) for(var j = 0; j < nH; j++) sigW += wd[i] * wd[j] * C[i][j] * vols[i] * vols[j];
      var rc = withData.map(function(_, i){ var s = 0; for(var j = 0; j < nH; j++) s += wd[j] * C[i][j] * vols[i] * vols[j]; return wd[i] * s / (sigW || 1); });
      var effBets = 1 / rc.reduce(function(s, x){ return s + x * x; }, 0);
      var avgCorr = null; if(nH > 1){ var cs = 0, cn = 0; for(i = 0; i < nH; i++) for(j = i + 1; j < nH; j++){ cs += C[i][j]; cn++; } avgCorr = cs / cn; }
      var bf = function(x){ var v = cov(port, x) / Math.pow(std(x), 2); return isNum(v) ? v : 0; };
      var wkD = function(k){ return new Date((k * 7 - 3) * 864e5).toISOString().slice(0, 10); };
      var spyPath = [1]; spy.forEach(function(r){ spyPath.push(spyPath[spyPath.length - 1] * (1 + r)); });
      var d0 = wkD(R.wk[0] - 1), dates = [d0].concat(R.wk.map(wkD));
      A.curve = { p:path.map(function(v, k){ return [dates[k], (v - 1) * 100]; }), s:spyPath.map(function(v, k){ return [dates[k], (v - 1) * 100]; }) };
      A.risk = { n:port.length, ret:(eq - 1) * 100, spyRet:(sp - 1) * 100, vol:vol * 100, dd:dd * 100, beta:beta, path:path, C:C, cts:withData, vols:vols, rc:rc, wd:wd, effBets:effBets, avgCorr:avgCorr,
        divRatio:wd.reduce(function(s, x, k){ return s + x * vols[k]; }, 0) / (vol || 1),
        stress:[
          { n:{ en:'US stocks drop 10%', th:'หุ้นสหรัฐฯ ร่วง 10%' }, v:-10 * bf(spy) },
          { n:{ en:'Rates jump (long bonds −8%)', th:'ดอกเบี้ยพุ่ง (บอนด์ยาว −8%)' }, v:-8 * bf(tlt) },
          { n:{ en:'Dollar +5%', th:'ดอลลาร์แข็งขึ้น 5%' }, v:5 * bf(uup) },
          { n:{ en:'Oil +20%', th:'น้ำมันพุ่ง 20%' }, v:20 * bf(uso) }
        ] };
    }
    /* mix */
    var mix = { cls:{}, sec:{}, geo:{} };
    ts.forEach(function(t, k){ var I = info(t); mix.cls[I.cls] = (mix.cls[I.cls] || 0) + w[k]; mix.geo[I.geo] = (mix.geo[I.geo] || 0) + w[k]; if(I.cls === 'eq' || I.cls === 'reit') mix.sec[I.sec] = (mix.sec[I.sec] || 0) + w[k]; });
    A.mix = mix;
    /* health score */
    var maxW = Math.max.apply(null, w), maxSec = 0, maxSecN = '';
    Object.keys(mix.sec).forEach(function(s){ if(s !== 'Diversified' && mix.sec[s] > maxSec){ maxSec = mix.sec[s]; maxSecN = s; } });
    var cards = A.cards.filter(Boolean), avg = function(k){ return mean(cards.map(function(c){ return c[k]; })); };
    var fit = mean(cards.map(function(c, k){ return c.fit * w[k] * cards.length; }));
    var div = A.risk ? clamp((A.risk.effBets - 1) / 5, 0, 1) * 70 + (maxW < 0.25 ? 30 : maxW < 0.4 ? 15 : 0) : (ts.length >= 6 ? 60 : ts.length * 10);
    var rk = A.risk ? clamp(100 - Math.max(0, A.risk.vol - 12) * 4, 0, 100) : 50;
    var qual = avg('q') != null ? (avg('q') - 1) / 4 * 100 : 60, val = avg('v') != null ? (avg('v') - 1) / 4 * 100 : 55, mom = avg('m') != null ? (avg('m') - 1) / 4 * 100 : 50;
    var fitS = clamp(50 + fit * 50, 0, 100);
    A.parts = [
      { n:{ en:'Diversification', th:'การกระจายความเสี่ยง' }, v:div, w:.25 }, { n:{ en:'Risk level', th:'ระดับความเสี่ยง' }, v:rk, w:.15 },
      { n:{ en:'Business quality', th:'คุณภาพธุรกิจ' }, v:qual, w:.2 }, { n:{ en:'Price (value)', th:'ความถูก/แพง' }, v:val, w:.1 },
      { n:{ en:'Trend', th:'แนวโน้มราคา' }, v:mom, w:.15 }, { n:{ en:'Fit with today\'s phase', th:'เข้ากับสภาวะตอนนี้' }, v:fitS, w:.15 }
    ];
    A.health = A.parts.reduce(function(s, p){ return s + p.v * p.w; }, 0);
    /* issues -> plain-language advice */
    var top = ts[w.indexOf(maxW)];
    if(maxW > 0.3 && !(info(top).etf && ['eq'].indexOf(info(top).cls) >= 0 && info(top).sec === 'Diversified')) A.issues.push({ k:'bad', t:{ en:top + ' is ' + f(maxW * 100, 0) + '% of the portfolio. One bad quarter there hurts everything — many investors cap a single stock at 15–20%.', th:top + ' มีสัดส่วน ' + f(maxW * 100, 0) + '% ของพอร์ต ถ้าตัวนี้มีข่าวร้ายทั้งพอร์ตจะเจ็บหนัก นักลงทุนหลายคนจำกัดหุ้นตัวเดียวไว้ไม่เกิน 15–20%' } });
    if(maxSec > 0.4) A.issues.push({ k:'bad', t:{ en:f(maxSec * 100, 0) + '% sits in one sector (' + maxSecN + '). Sectors move together, so this is less diversified than it looks.', th:'มี ' + f(maxSec * 100, 0) + '% อยู่ในกลุ่มเดียว (' + sectName(maxSecN) + ') หุ้นกลุ่มเดียวกันมักขึ้นลงพร้อมกัน จึงกระจายความเสี่ยงน้อยกว่าที่เห็น' } });
    if(A.risk && A.risk.avgCorr > 0.6 && ts.length > 2) A.issues.push({ k:'mid', t:{ en:'Average correlation between holdings is ' + f(A.risk.avgCorr, 2) + ' — they tend to fall together. Adding something that zigs when the rest zags would help.', th:'หุ้นในพอร์ตมีความสัมพันธ์กันเฉลี่ย ' + f(A.risk.avgCorr, 2) + ' มักลงพร้อมกัน ควรเพิ่มสินทรัพย์ที่เคลื่อนไหวต่างออกไป' } });
    if(A.risk && A.risk.vol > 25) A.issues.push({ k:'mid', t:{ en:'Expected swings are large (about ' + f(A.risk.vol, 0) + '% a year). A drop of ' + f(A.risk.vol * 1.5, 0) + '% in a bad year would be normal for this mix.', th:'พอร์ตนี้แกว่งแรง (ประมาณ ' + f(A.risk.vol, 0) + '% ต่อปี) ในปีที่แย่ การลง ' + f(A.risk.vol * 1.5, 0) + '% ถือเป็นเรื่องปกติของพอร์ตแบบนี้' } });
    if(!mix.cls.bond && !mix.cls.gold && ts.length > 1) A.issues.push({ k:'mid', t:{ en:'No bonds or gold at all — nothing in the portfolio is likely to rise when stocks fall.', th:'ไม่มีบอนด์หรือทองเลย เวลาหุ้นลงจะไม่มีอะไรในพอร์ตที่ช่วยพยุง' } });
    if((mix.geo.TH || 0) > 0.7) A.issues.push({ k:'mid', t:{ en:'Over 70% in Thailand — one economy and one currency. A slice abroad spreads country risk.', th:'มากกว่า 70% อยู่ในไทย พึ่งเศรษฐกิจและค่าเงินเดียว การมีส่วนต่างประเทศช่วยกระจายความเสี่ยงของประเทศ' } });
    if(fit < -0.15) A.issues.push({ k:'mid', t:{ en:'The mix leans toward what usually struggles in a “' + PHASES[E_last.phase].short.en + '” phase.', th:'สัดส่วนเอียงไปทางกลุ่มที่มักไม่เด่นในช่วง “' + PHASES[E_last.phase].short.th + '”' } });
    if(cards.some(function(c){ return c.q && c.q <= 2; })) A.issues.push({ k:'mid', t:{ en:'Some holdings have weak fundamentals (see the report cards).', th:'มีบางตัวที่พื้นฐานยังอ่อน (ดูการ์ดรายตัวด้านล่าง)' } });
    if(!A.issues.length) A.issues.push({ k:'good', t:{ en:'No red flags — the portfolio is reasonably spread.', th:'ไม่พบจุดอันตราย พอร์ตกระจายได้ดีพอสมควร' } });
    A.rebal = rebalance(ts, w, A);
    A.adds = diversifiers(ts, w);
    return A;
  }
  /* suggested weights: caps, then a tilt toward lower risk, then toward the phase */
  function rebalance(ts, w, A){
    var n = ts.length; if(n < 2) return null;
    var cap = ts.map(function(t){ var I = info(t); return I.etf && I.sec === 'Diversified' ? 0.4 : I.etf ? 0.3 : 0.2; });
    var x = w.slice();
    for(var it = 0; it < 6; it++){
      var over = 0, freeIdx = [];
      x = x.map(function(v, i){ if(v > cap[i]){ over += v - cap[i]; return cap[i]; } freeIdx.push(i); return v; });
      if(over < 1e-6 || !freeIdx.length) break;
      var fs = freeIdx.reduce(function(s, i){ return s + x[i]; }, 0) || freeIdx.length;
      freeIdx.forEach(function(i){ x[i] += over * (x[i] || 1 / freeIdx.length) / fs; });
    }
    if(A.risk){
      var iv = ts.map(function(t){ var k = A.risk.cts.indexOf(t); return k >= 0 && A.risk.vols[k] ? 1 / A.risk.vols[k] : null; });
      var ivs = iv.reduce(function(s, v){ return s + (v || 0); }, 0);
      if(ivs) x = x.map(function(v, i){ return iv[i] ? v * 0.75 + 0.25 * iv[i] / ivs : v; });
    }
    var cards = A.cards;
    x = x.map(function(v, i){ var c = cards[i]; return v * (c && c.fit > 0 ? 1.1 : c && c.fit < 0 ? 0.9 : 1) * (c && c.q && c.q <= 2 ? 0.85 : 1); });
    var s = x.reduce(function(a, b){ return a + b; }, 0); x = x.map(function(v){ return v / s; });
    return ts.map(function(t, i){
      var why = [];
      if(w[i] > cap[i] + 0.005) why.push({ en:'above the ' + f(cap[i] * 100, 0) + '% cap', th:'เกินเพดาน ' + f(cap[i] * 100, 0) + '%' });
      if(cards[i] && cards[i].fit > 0) why.push({ en:'suits the phase', th:'เข้ากับสภาวะ' });
      if(cards[i] && cards[i].fit < 0) why.push({ en:'phase headwind', th:'สภาวะไม่เอื้อ' });
      if(cards[i] && cards[i].q && cards[i].q <= 2) why.push({ en:'weak fundamentals', th:'พื้นฐานอ่อน' });
      var k = A.risk ? A.risk.cts.indexOf(t) : -1; if(k >= 0 && A.risk.vols[k] > 0.35) why.push({ en:'very volatile', th:'ผันผวนสูงมาก' });
      return { t:t, now:w[i] * 100, to:x[i] * 100, why:why };
    });
  }
  function diversifiers(ts, w){
    var cand = ['IEF', 'TLT', 'SHY', 'GLD', 'TIP', 'XLV', 'XLP', 'XLU', 'USMV', 'EFA', 'EEM', 'THD', 'DBC', 'XLE', 'VIG'].filter(function(t){ return ts.indexOf(t) < 0 && weekly(t); });
    var hold = ts.filter(function(t){ return weekly(t); }); if(!hold.length) return [];
    var R = returnsFor(hold.concat(cand), 52); if(!R || !R[0] || R[0].length < 20) return [];
    var nH = hold.length, ws = hold.map(function(t){ return w[ts.indexOf(t)]; }), sw = ws.reduce(function(a, b){ return a + b; }, 0);
    var port = R[0].map(function(_, k){ var s = 0; for(var j = 0; j < nH; j++) s += ws[j] / sw * R[j][k]; return s; });
    var fav = PHASES[E_last.phase];
    return cand.map(function(t, i){ var c = corr(port, R[nH + i]); var fit = fav.etf.indexOf(t) >= 0 || fav.sectors.indexOf(ETF_INFO[t].sec) >= 0 ? 1 : fav.avoid.indexOf(t) >= 0 ? -1 : 0; return { t:t, c:c, fit:fit, sc:-c + fit * 0.25 }; })
      .sort(function(a, b){ return b.sc - a.sc; }).slice(0, 4);
  }

  /* model portfolios, optionally tilted toward the current phase */
  function presetWeights(k, tilt){
    var base = {}, src = PRESETS[k].w; Object.keys(src).forEach(function(t){ base[t] = src[t]; });
    if(!tilt) return base;
    var fav = PHASES[E_last.phase].etf.filter(function(t){ return ETF_INFO[t]; }).slice(0, 2), take = 10, tot = 0;
    Object.keys(base).forEach(function(t){ tot += base[t]; });
    Object.keys(base).forEach(function(t){ base[t] = base[t] * (tot - take) / tot; });
    fav.forEach(function(t){ base[t] = (base[t] || 0) + take / fav.length; });
    return base;
  }
  /* auto-picked stock baskets: quality + value + trend (+ income for Thailand), phase sectors favoured */
  function autoPick(mkt, n){
    var fav = PHASES[E_last.phase].sectors, rows = [];
    var caps = Object.keys(D.m.stocks).filter(function(t){ return (D.m.stocks[t].cal || 'us') === mkt; }).map(function(t){ return D.m.stocks[t].mcap || 0; });
    var medCap = median(caps) || 0;
    Object.keys(D.m.stocks).forEach(function(t){
      var s = D.m.stocks[t]; if((s.cal || 'us') !== mkt || !s.sector || (s.mcap || 0) < medCap * 0.6) return;
      var c = card(t); if(!c || !c.q || !c.v || !c.m) return;
      var sc = c.q * 0.38 + c.v * 0.24 + c.m * 0.26 + (c.inc || 1) * (mkt === 'th' ? 0.18 : 0.06) + (fav.indexOf(s.sector) >= 0 ? 0.45 : 0) - (c.r && c.r <= 1 ? 0.3 : 0);
      rows.push({ t:t, sc:sc, sec:s.sector, c:c });
    });
    rows.sort(function(a, b){ return b.sc - a.sc; });
    var out = [], per = {};
    for(var i = 0; i < rows.length && out.length < n; i++){ var r = rows[i]; if((per[r.sec] || 0) >= 2) continue; per[r.sec] = (per[r.sec] || 0) + 1; out.push(r); }
    return out;
  }
  /* pairs that work well together right now: one from the phase's leaders + one low-correlation partner */
  function pairs(){
    var fav = PHASES[E_last.phase].etf.filter(function(t){ return weekly(t); });
    var partners = ['IEF', 'TLT', 'GLD', 'SHY', 'TIP', 'XLV', 'XLP', 'XLU', 'USMV', 'EFA', 'THD', 'DBC', 'XLE', 'QQQ', 'SPY'].filter(function(t){ return weekly(t); });
    var all = fav.concat(partners.filter(function(t){ return fav.indexOf(t) < 0; }));
    var R = returnsFor(all, 52); if(!R || !R[0] || R[0].length < 20) return [];
    var out = [];
    fav.forEach(function(a, i){
      all.forEach(function(b, j){
        if(j <= i && fav.indexOf(b) >= 0) return; if(a === b) return;
        var c = corr(R[i], R[j]), fa = flow(a), fb = flow(b);
        var mom = ((fa && fa.m3) || 0) / 10 + ((fb && fb.m3) || 0) / 20;
        var combo = R[i].map(function(x, k){ return 0.5 * x + 0.5 * R[j][k]; }), sv = std(combo) * Math.sqrt(52) * 100;
        out.push({ a:a, b:b, c:c, vol:sv, sc:-c + mom * 0.3 });
      });
    });
    out.sort(function(x, y){ return y.sc - x.sc; });
    var seen = {}, res = [];
    out.forEach(function(p){ if(res.length < 5 && !seen[p.a + p.b] && !seen[p.b + p.a] && (seen['_' + p.a] || 0) < 2){ seen[p.a + p.b] = 1; seen['_' + p.a] = (seen['_' + p.a] || 0) + 1; res.push(p); } });
    return res;
  }

  /* ================================================================== VIEW */
  var E_last = null, host = null, tab = 'sum';
  var TABS = [
    ['sum', { en:'Summary', th:'สรุปทุกอย่าง' }, 'layers'], ['fc', { en:'Forecast', th:'พยากรณ์ล่วงหน้า' }, 'radar'],
    ['over', { en:'Market today', th:'ภาพรวมวันนี้' }, 'brain'], ['infl', { en:'Inflation & rates', th:'เงินเฟ้อ & ดอกเบี้ย' }, 'flame'],
    ['growth', { en:'Economy & jobs', th:'เศรษฐกิจ & การจ้างงาน' }, 'factory'], ['fx', { en:'Currencies & commodities', th:'ค่าเงิน & สินค้าโภคภัณฑ์' }, 'coin'],
    ['rot', { en:'Rotation & ideas', th:'เงินไหลไปไหน & ไอเดีย' }, 'compass'], ['out', { en:'Outlook 1–3 months', th:'แนวโน้ม 1–3 เดือน' }, 'radar'],
    ['pf', { en:'My portfolio', th:'พอร์ตของฉัน' }, 'pie'], ['cal', { en:'This week', th:'จับตาสัปดาห์นี้' }, 'cal']
  ];
  var UX = {
    eb:{ en:'ADMIN · MARKET BRAIN', th:'แอดมิน · สมองตลาด' },
    h:{ en:'Market Brain', th:'สมองตลาด' },
    lede:{ en:'The economy, rates, currencies, sectors and your portfolio — read together and explained in plain words. Every conclusion shows the numbers behind it.', th:'เศรษฐกิจ ดอกเบี้ย ค่าเงิน กลุ่มหุ้น และพอร์ตของคุณ อ่านรวมกันแล้วสรุปเป็นภาษาง่ายๆ ทุกข้อสรุปมีตัวเลขกำกับให้ตรวจสอบได้' },
    upd:{ en:'Market data', th:'ข้อมูลตลาด' }, eco:{ en:'Economy data', th:'ข้อมูลเศรษฐกิจ' }, refresh:{ en:'Refresh', th:'โหลดใหม่' },
    loading:{ en:'Reading the market…', th:'กำลังอ่านตลาด…' },
    nobrain:{ en:'The economy file (data/brain.json) is not available yet — its first run may still be in progress. Market-based parts still work.', th:'ไฟล์ข้อมูลเศรษฐกิจ (data/brain.json) ยังไม่พร้อม อาจกำลังสร้างรอบแรกอยู่ ส่วนที่ใช้ข้อมูลตลาดยังใช้ได้ตามปกติ' },
    disc:{ en:'Educational analysis from rules applied to public data. Not investment advice — decisions and risks are your own.', th:'เป็นการวิเคราะห์เพื่อการศึกษา จากกฎที่ใช้กับข้อมูลสาธารณะ ไม่ใช่คำแนะนำการลงทุน การตัดสินใจและความเสี่ยงเป็นของผู้ลงทุนเอง' },
    today:{ en:'TODAY IN ONE PARAGRAPH', th:'สรุปวันนี้ในย่อหน้าเดียว' }, phase:{ en:'Economic phase', th:'ช่วงของเศรษฐกิจ' },
    conf:{ en:'clarity', th:'ความชัดเจน' }, pillars:{ en:'Nine things that move markets', th:'9 เรื่องที่ขับเคลื่อนตลาด' },
    changed:{ en:'What changed this month', th:'อะไรเปลี่ยนไปในเดือนนี้' }, nochg:{ en:'Nothing moved more than usual this month.', th:'เดือนนี้ไม่มีตัวไหนขยับแรงผิดปกติ' },
    div:{ en:'Signals that disagree', th:'สัญญาณที่ขัดกัน' }, nodiv:{ en:'No major contradictions — the signals mostly agree.', th:'ไม่พบสัญญาณขัดกันที่สำคัญ ตัวชี้วัดส่วนใหญ่ไปทางเดียวกัน' },
    play:{ en:'How each style might play this phase', th:'แต่ละสไตล์อาจรับมือช่วงนี้อย่างไร' },
    clockH:{ en:'Investment clock', th:'นาฬิกาการลงทุน' },
    clockP:{ en:'Growth direction (left–right) × inflation direction (down–up). Each quarter has assets that usually do best.', th:'ทิศทางเศรษฐกิจ (ซ้าย–ขวา) × ทิศทางเงินเฟ้อ (ล่าง–บน) แต่ละช่องมีสินทรัพย์ที่มักทำได้ดีที่สุด' },
    open:{ en:'details', th:'ดูละเอียด' }
  };
  var PLAY = {
    recovery:[{ en:'Keep a core of broad index funds; trim cash slowly.', th:'ถือกองทุนดัชนีเป็นแกน ค่อยๆ ลดเงินสด' }, { en:'Lean toward stocks; add quality growth on dips.', th:'เอียงไปทางหุ้น ซื้อหุ้นเติบโตคุณภาพดีตอนย่อ' }, { en:'Small caps, tech and emerging markets tend to lead.', th:'หุ้นเล็ก เทค และตลาดเกิดใหม่มักนำ' }],
    overheat:[{ en:'Shorter-term bonds and inflation-linked bonds over long bonds.', th:'เลือกบอนด์ระยะสั้นหรือบอนด์ป้องกันเงินเฟ้อ แทนบอนด์ระยะยาว' }, { en:'Balance tech with energy, materials and banks.', th:'ถ่วงหุ้นเทคด้วยพลังงาน วัสดุ และธนาคาร' }, { en:'Commodity producers and pricing-power companies.', th:'ผู้ผลิตสินค้าโภคภัณฑ์และบริษัทที่ขึ้นราคาได้' }],
    stagflation:[{ en:'Raise cash/short bonds; add some gold.', th:'เพิ่มเงินสด/บอนด์ระยะสั้น และมีทองบางส่วน' }, { en:'Shift toward health care, staples and utilities.', th:'ย้ายไปหุ้นสุขภาพ สินค้าจำเป็น และสาธารณูปโภค' }, { en:'Keep positions small; this phase punishes leverage.', th:'ถือไม้เล็กลง ช่วงนี้ลงโทษคนที่กู้มาลงทุน' }],
    reflation:[{ en:'Lock in yields with quality medium/long bonds.', th:'ล็อกผลตอบแทนด้วยบอนด์คุณภาพดีระยะกลาง-ยาว' }, { en:'Defensive stocks and dividend growers.', th:'หุ้นตั้งรับและหุ้นปันผลเติบโต' }, { en:'Start a watch list of beaten-down leaders for the next recovery.', th:'เริ่มทำรายชื่อหุ้นผู้นำที่ถูกทุบ รอรอบฟื้นตัวถัดไป' }]
  };
  var STYLE = [{ en:'Careful', th:'ระมัดระวัง' }, { en:'Balanced', th:'สมดุล' }, { en:'Growth', th:'เติบโต' }];

  function sec(title, inner, icon, extra){ return '<section class="bz-sec' + (extra ? ' ' + extra : '') + '"><h4>' + (icon ? ico(icon) : '') + esc(T(title)) + '</h4>' + inner + '</section>'; }
  function kpi(label, val, sub, tn){ return '<div class="bz-kpi ' + (tn || '') + '"><span>' + esc(T(label)) + '</span><b>' + val + '</b>' + (sub ? '<em>' + sub + '</em>' : '') + '</div>'; }
  function chip(t, tn){ return '<span class="bz-chip ' + (tn || '') + '">' + t + '</span>'; }
  function note(t){ return '<p class="bz-note">' + esc(T(t)) + '</p>'; }

  function vOver(E){
    var ph = PHASES[E.phase];
    var h = '<div class="bz-hero">' +
      '<div class="bz-wx bz-' + tone((E.score - 50) / 25) + '">' + ico(E.weather.k, 'bz-wxi') + gauge(E.score, T(E.weather.w)) + '<p>' + esc(T(E.weather.s)) + '</p></div>' +
      '<div class="bz-htx"><div class="bz-eb">' + esc(T(UX.today)) + '</div><p class="bz-head">' + esc(T(E.head)) + '</p>' +
        '<div class="bz-chips">' + chip(ico('compass') + esc(T(UX.phase)) + ': <b>' + esc(T(ph.short)) + '</b>', ph.tone) + chip(esc(T(UX.conf)) + ' ' + E.phaseConf + '%') +
        chip(esc(T({ en:'Score', th:'คะแนนรวม' })) + ' <b>' + Math.round(E.score) + '/100</b>') + '</div>' +
        '<ol class="bz-top">' + E.top.map(function(p){ return '<li class="' + tone(p.score) + '">' + esc(T(p.say)) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="bz-clk">' + clockSVG(E.g, E.i, E.phase) + '<b>' + esc(T(ph.name)) + '</b><p>' + esc(T(ph.why)) + '</p></div></div>';
    h += '<h3 class="bz-h3">' + esc(T(UX.pillars)) + '</h3><div class="bz-pills">' + E.pillars.map(function(p){
      return '<button type="button" class="bz-pill ' + tone(p.score) + '" data-go="' + p.tab + '"><div class="bz-pt">' + ico(p.icon) + '<span>' + esc(T(p.title)) + '</span><i>' + esc(T(toneWord(p.score))) + '</i></div>' +
        '<div class="bz-pv"><b>' + p.value + '</b><em>' + esc(T(p.sub)) + '</em></div>' + spark(p.spark, p.score >= 1 ? '#34d399' : p.score <= -1 ? '#fb7185' : '#fbbf24') +
        '<p>' + esc(T(p.say)) + '</p><span class="bz-meter">' + [-2, -1, 0, 1, 2].map(function(k){ return '<i class="' + (Math.round(p.score) === k ? 'on' : '') + '"></i>'; }).join('') + '</span></button>';
    }).join('') + '</div>';
    h += '<div class="bz-two">' + sec(UX.changed, E.changes.length ? '<ul class="bz-chg">' + E.changes.map(function(c){
      var cls = c.good === true ? 'good' : c.good === false ? 'bad' : 'mid';
      return '<li class="' + cls + '"><span>' + esc(T(c.n)) + '</span><b>' + (c.pct ? spc(c.d, 1) : sg(c.d, c.unit === '%' ? 2 : 1) + (c.unit === '%' ? ' pt' : c.unit)) + '</b><em>' + esc(T({ en:'now', th:'ตอนนี้' })) + ' ' + f(c.now, c.unit === '%' ? 2 : 1) + (c.unit === '%' ? '%' : '') + '</em></li>';
    }).join('') + '</ul>' : note(UX.nochg), 'bolt') +
      sec(UX.div, E.diverge.length ? '<ul class="bz-div">' + E.diverge.map(function(d){ return '<li>' + ico('alert') + '<span>' + esc(T(d)) + '</span></li>'; }).join('') + '</ul>' : note(UX.nodiv), 'swap') + '</div>';
    h += sec(UX.play, '<div class="bz-play">' + PLAY[E.phase].map(function(t, i){ return '<div><b>' + esc(T(STYLE[i])) + '</b><p>' + esc(T(t)) + '</p></div>'; }).join('') + '</div>' +
      '<p class="bz-note">' + esc(T({ en:'Usually strongest now: ', th:'กลุ่มที่มักเด่นช่วงนี้: ' })) + ph.etf.map(function(t){ return '<code>' + t + '</code>'; }).join(' ') + ' · ' + esc(T({ en:'usually weakest: ', th:'มักอ่อน: ' })) + ph.avoid.map(function(t){ return '<code>' + t + '</code>'; }).join(' ') + '</p>', 'layers');
    return h;
  }

  function curveSVG(){
    var mk = function(k){ var o = mkt(k); return o ? [o.price, isNum(o.m1) ? o.price / (1 + o.m1 / 100) : null] : [null, null]; };
    var y2 = mac('y2'), pts = [['3M', mk('us3m')], ['2Y', y2 ? [y2.v, y2.m1] : [null, null]], ['5Y', mk('us5y')], ['10Y', mk('us10y')], ['30Y', mk('us30y')]];
    var vals = []; pts.forEach(function(p){ vals.push(p[1][0], p[1][1]); }); vals = vals.filter(isNum);
    if(vals.length < 4) return '';
    var lo = Math.min.apply(null, vals) - 0.15, hi = Math.max.apply(null, vals) + 0.15, W = 640, H = 210, P = 46;
    var X = function(i){ return P + i * (W - 2 * P) / (pts.length - 1); }, Y = function(v){ return 18 + (1 - (v - lo) / (hi - lo)) * (H - 50); };
    var s = '', pa = '', pb = '';
    niceTicks(lo, hi, 4).forEach(function(v){ s += '<line class="bz-gl" x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="bz-ax" x="' + (P - 6) + '" y="' + (Y(v) + 3) + '" text-anchor="end">' + v + '%</text>'; });
    pts.forEach(function(p, i){
      if(isNum(p[1][1])) pb += (pb ? 'L' : 'M') + X(i) + ' ' + Y(p[1][1]);
      if(isNum(p[1][0])) pa += (pa ? 'L' : 'M') + X(i) + ' ' + Y(p[1][0]);
      s += '<text class="bz-ax" x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + p[0] + '</text>';
      if(isNum(p[1][0])) s += '<circle cx="' + X(i) + '" cy="' + Y(p[1][0]) + '" r="4.5" fill="#22d3ee"/><text class="bz-tag" x="' + X(i) + '" y="' + (Y(p[1][0]) - 10) + '" text-anchor="middle" fill="#22d3ee">' + f(p[1][0], 2) + '</text>';
    });
    return '<div class="bz-leg"><span><i style="background:#22d3ee"></i>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</span><span><i style="background:#94a3b8"></i>' + esc(T({ en:'1 month ago', th:'1 เดือนก่อน' })) + '</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg">' + s + '<path d="' + pb + '" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/><path d="' + pa + '" fill="none" stroke="#22d3ee" stroke-width="2.6"/></svg>';
  }
  function vInfl(E){
    var I = E.infl, F = E.fed;
    var h = '<div class="bz-kpis">' +
      kpi({ en:'CPI', th:'เงินเฟ้อ CPI' }, pc(I.cpi, 1), mshort(mac('cpi') && mac('cpi').t), I.cpi > 3 ? 'bad' : I.cpi < 2.5 ? 'good' : '') +
      kpi({ en:'Core CPI', th:'Core CPI' }, pc(I.core_cpi, 1), '', I.core_cpi > 3 ? 'bad' : '') +
      kpi({ en:'Core PCE (Fed)', th:'Core PCE (เฟดใช้)' }, pc(I.v, 2), sg(I.c3, 2) + ' / 3m', I.v > 3 ? 'bad' : I.v < 2.5 ? 'good' : '') +
      kpi({ en:'5y expected', th:'คาดการณ์ 5 ปี' }, pc(I.be5, 2), '', I.be5 > 2.6 ? 'bad' : '') +
      kpi({ en:'Fed funds', th:'ดอกเบี้ยเฟด' }, pc(F.ff, 2)) + kpi({ en:'2y yield', th:'บอนด์ 2 ปี' }, pc(F.y2, 2), sg(F.gap, 2) + ' vs Fed') +
      kpi({ en:'10y yield', th:'บอนด์ 10 ปี' }, pc(F.y10, 2), sg(F.dy10, 2) + ' / 1m', F.dy10 > 0.25 ? 'bad' : F.dy10 < -0.25 ? 'good' : '') +
      kpi({ en:'Real 10y', th:'ยีลด์จริง 10 ปี' }, pc(F.real, 2), '', F.real > 2.2 ? 'bad' : '') + kpi({ en:'Mortgage 30y', th:'ดอกเบี้ยบ้าน 30 ปี' }, pc(mv('mort'), 2)) + '</div>';
    h += '<div class="bz-callout ' + (F.gap > 0.25 ? 'bad' : F.gap < -0.25 ? 'good' : 'mid') + '">' + ico('bank') + '<div><b>' + esc(T({ en:'What the bond market expects from the Fed', th:'ตลาดบอนด์คาดอะไรจากเฟด' })) + '</b><p>' + esc(T(F.say)) + '. ' +
      esc(T({ en:'Rule of thumb: when the 2-year yield is clearly below the Fed rate, traders expect cuts; clearly above, hikes. Today the gap is ' + sg(F.gap, 2) + ' points.', th:'หลักจำง่าย: ถ้าบอนด์ 2 ปีต่ำกว่าดอกเบี้ยเฟดชัดเจน ตลาดคาดว่าจะลดดอกเบี้ย ถ้าสูงกว่าชัดเจน คาดว่าจะขึ้น ตอนนี้ต่างกัน ' + sg(F.gap, 2) + ' จุด' })) + '</p></div></div>';
    h += '<div class="bz-two">' + sec({ en:'Inflation vs the 2% goal', th:'เงินเฟ้อเทียบเป้า 2%' }, lineChart({ series:[
        { name:{ en:'CPI', th:'CPI' }, pts:histSince('cpi', 6), color:COL.c }, { name:{ en:'Core CPI', th:'Core CPI' }, pts:histSince('core_cpi', 6), color:COL.b }, { name:{ en:'Core PCE', th:'Core PCE' }, pts:histSince('core_pce', 6), color:COL.a, w:2.6 }],
        unit:'%', band:{ lo:1.5, hi:2.5, label:{ en:'Fed goal ≈ 2%', th:'เป้าเฟด ≈ 2%' } } }), 'flame') +
      sec({ en:'Fed rate vs bond yields', th:'ดอกเบี้ยเฟดเทียบบอนด์ยีลด์' }, lineChart({ series:[
        { name:{ en:'Fed funds', th:'ดอกเบี้ยเฟด' }, pts:histSince('ff', 5), color:COL.d, w:2.6 }, { name:{ en:'2y', th:'2 ปี' }, pts:histSince('y2', 5), color:COL.a }, { name:{ en:'10y', th:'10 ปี' }, pts:histSince('y10', 5), color:COL.b }], unit:'%', dec:2 }), 'bank') + '</div>';
    h += '<div class="bz-two">' + sec({ en:'Yield curve: now vs a month ago', th:'เส้นอัตราผลตอบแทน: ตอนนี้ vs เดือนก่อน' }, curveSVG() + note({ en:'Upward-sloping is normal. When short maturities sit above long ones the curve is “inverted”, a classic slowdown warning.', th:'เส้นชันขึ้นคือปกติ ถ้าระยะสั้นสูงกว่าระยะยาวเรียกว่า “กลับหัว” เป็นสัญญาณเตือนเศรษฐกิจชะลอแบบคลาสสิก' }), 'curve') +
      sec({ en:'Real yield & inflation expectations', th:'ยีลด์จริงและเงินเฟ้อที่ตลาดคาด' }, lineChart({ series:[
        { name:{ en:'Real 10y yield', th:'ยีลด์จริง 10 ปี' }, pts:histSince('real10', 5), color:COL.e, w:2.4 }, { name:{ en:'5y breakeven', th:'เงินเฟ้อคาด 5 ปี' }, pts:histSince('be5', 5), color:COL.f }], unit:'%', dec:2, zero:true }) +
        note({ en:'Real yield = what bonds pay after inflation. Above ~2% money is genuinely expensive, which usually weighs on high-valuation growth stocks and gold.', th:'ยีลด์จริง = ผลตอบแทนบอนด์หลังหักเงินเฟ้อ ถ้าสูงกว่าราว 2% แปลว่าเงินแพงจริง มักกดดันหุ้นเติบโตที่ราคาแพงและทองคำ' }), 'scale') + '</div>';
    return h;
  }

  function recessionSignals(E){
    var G = E.growth, S = [
      [{ en:'Yield curve inverted or just un-inverted', th:'เส้นอัตราผลตอบแทนกลับหัวหรือเพิ่งกลับมาเป็นบวก' }, E.curve.s < 0 || E.curve.unInv, sg(E.curve.s, 2)],
      [{ en:'Sahm rule ≥ 0.5', th:'สัญญาณ Sahm ≥ 0.5' }, G.sahm >= 0.5, f(G.sahm, 2)],
      [{ en:'Jobless claims up >15% on the year', th:'คนขอสวัสดิการว่างงานเพิ่ม >15% จากปีก่อน' }, G.clY > 15, spc(G.clY, 0)],
      [{ en:'Job growth below 50k a month', th:'จ้างงานเพิ่มต่ำกว่า 50k ต่อเดือน' }, G.pay3 < 50, f(G.pay3, 0) + 'k'],
      [{ en:'Junk-bond spread above 4.5%', th:'ส่วนต่างหุ้นกู้เสี่ยงสูงเกิน 4.5%' }, E.stress.hy > 4.5, pc(E.stress.hy, 2)],
      [{ en:'Factory output shrinking', th:'การผลิตอุตสาหกรรมหดตัว' }, G.ip < 0, spc(G.ip, 1)],
      [{ en:'Retail sales falling after inflation', th:'ยอดค้าปลีกหลังหักเงินเฟ้อติดลบ' }, G.realRetail < 0, spc(G.realRetail, 1)],
      [{ en:'Consumer sentiment very low (<60)', th:'ความเชื่อมั่นผู้บริโภคต่ำมาก (<60)' }, G.sent < 60, f(G.sent, 1)],
      [{ en:'Fed model: recession odds >20%', th:'โมเดลเฟด: โอกาสถดถอย >20%' }, G.rp > 20, pc(G.rp, 1)],
      [{ en:'S&P 500 below its 200-day average', th:'S&P 500 ต่ำกว่าเส้น 200 วัน' }, E.trend.ab === false, spc(mkt('spx') && mkt('spx').vs_ma200, 1)]
    ];
    return S;
  }
  function barChart(pts, opt){
    opt = opt || {}; if(!pts || pts.length < 2) return '';
    var W = 640, H = opt.h || 180, P = { l:42, r:12, t:12, b:24 }, vs = pts.map(function(p){ return p[1]; }), lo = Math.min(0, Math.min.apply(null, vs)), hi = Math.max(0, Math.max.apply(null, vs));
    var Y = function(v){ return P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b); }, bw = (W - P.l - P.r) / pts.length, s = '';
    niceTicks(lo, hi, 4).forEach(function(v){ s += '<line class="bz-gl" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="bz-ax" x="' + (P.l - 6) + '" y="' + (Y(v) + 3) + '" text-anchor="end">' + v + '</text>'; });
    pts.forEach(function(p, i){
      var x = P.l + i * bw + bw * 0.15, y = Math.min(Y(p[1]), Y(0)), hh = Math.abs(Y(p[1]) - Y(0));
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + Math.max(1, hh).toFixed(1) + '" rx="2" fill="' + (p[1] >= 0 ? (opt.up || '#34d399') : '#fb7185') + '"><title>' + dshort(p[0]) + ': ' + f(p[1], opt.dec || 0) + (opt.unit || '') + '</title></rect>';
      if(i % Math.ceil(pts.length / 6) === 0) s += '<text class="bz-ax" x="' + (x + bw * 0.35).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + mshort(p[0]) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg">' + s + '</svg>';
  }
  function vGrowth(E){
    var G = E.growth, sig = recessionSignals(E), lit = sig.filter(function(s){ return s[1]; }).length;
    var slow = E.scen.filter(function(s){ return s.k === 'slow'; })[0];
    var h = '<div class="bz-kpis">' +
      kpi({ en:'Unemployment', th:'ว่างงาน' }, pc(G.un, 1), esc(T({ en:'12m low ', th:'ต่ำสุด 12 เดือน ' })) + pc(G.unMin, 1), G.un - G.unMin > 0.4 ? 'bad' : '') +
      kpi({ en:'New jobs (3m avg)', th:'จ้างงานเพิ่ม (เฉลี่ย 3 เดือน)' }, f(G.pay3, 0) + 'k', '', G.pay3 < 50 ? 'bad' : G.pay3 > 150 ? 'good' : '') +
      kpi({ en:'Weekly claims', th:'ขอสวัสดิการ/สัปดาห์' }, f(G.cl, 0) + 'k', spc(G.clY, 0) + ' y/y', G.clY > 15 ? 'bad' : '') +
      kpi({ en:'Sahm rule', th:'สัญญาณ Sahm' }, f(G.sahm, 2), esc(T({ en:'≥0.5 = recession', th:'≥0.5 = ถดถอย' })), G.sahm >= 0.5 ? 'bad' : G.sahm < 0.2 ? 'good' : '') +
      kpi({ en:'Real GDP', th:'GDP จริง' }, pc(G.gdp, 1), mshort(mac('gdp') && mac('gdp').t), G.gdp < 1 ? 'bad' : G.gdp > 2 ? 'good' : '') +
      kpi({ en:'Retail sales', th:'ยอดค้าปลีก' }, spc(mv('retail'), 1), esc(T({ en:'after inflation ', th:'หลังหักเงินเฟ้อ ' })) + spc(G.realRetail, 1)) +
      kpi({ en:'Industrial output', th:'การผลิตอุตสาหกรรม' }, spc(G.ip, 1), 'y/y', G.ip < 0 ? 'bad' : '') +
      kpi({ en:'Consumer mood', th:'ความเชื่อมั่นผู้บริโภค' }, f(G.sent, 1), esc(T({ en:'avg ≈ 85', th:'ค่าเฉลี่ยราว 85' })), G.sent < 60 ? 'bad' : '') +
      kpi({ en:'Recession odds (Fed model)', th:'โอกาสถดถอย (โมเดลเฟด)' }, pc(G.rp, 1), '', G.rp > 20 ? 'bad' : 'good') + '</div>';
    h += '<div class="bz-two">' + sec({ en:'Recession checklist', th:'เช็กลิสต์สัญญาณถดถอย' }, '<div class="bz-rmeter"><div class="bz-rbar"><i style="width:' + (lit * 10) + '%"></i></div><b>' + lit + '/10</b><span>' + esc(T(lit >= 6 ? { en:'many warning lights on', th:'ไฟเตือนติดหลายดวง' } : lit >= 3 ? { en:'a few warning lights', th:'มีไฟเตือนบางดวง' } : { en:'mostly clear', th:'ส่วนใหญ่ยังปกติ' })) + '</span></div>' +
        '<ul class="bz-chk">' + sig.map(function(s){ return '<li class="' + (s[1] ? 'on' : '') + '">' + ico(s[1] ? 'alert' : 'check') + '<span>' + esc(T(s[0])) + '</span><b>' + s[2] + '</b></li>'; }).join('') + '</ul>' +
        (slow ? note({ en:'The outlook engine currently gives the “growth scare” scenario about ' + slow.p + '%.', th:'ตอนนี้ระบบให้โอกาสสถานการณ์ “เศรษฐกิจชะลอแรง” ประมาณ ' + slow.p + '%' }) : ''), 'alert') +
      sec({ en:'Unemployment & the Sahm rule', th:'อัตราว่างงานและสัญญาณ Sahm' }, lineChart({ series:[{ name:{ en:'Unemployment', th:'ว่างงาน' }, pts:histSince('unrate', 8), color:COL.a, w:2.6 }, { name:{ en:'Sahm rule', th:'Sahm' }, pts:histSince('sahm', 8), color:COL.f }], unit:'%', ref:[{ v:0.5, label:{ en:'Sahm trigger 0.5', th:'เส้นเตือน Sahm 0.5' } }] }), 'user') + '</div>';
    h += '<div class="bz-two">' + sec({ en:'New jobs each month (thousands)', th:'จำนวนงานใหม่ต่อเดือน (พันตำแหน่ง)' }, barChart(lastN(mac('payrolls') && mac('payrolls').hist, 30), { unit:'k' }), 'factory') +
      sec({ en:'Weekly jobless claims (thousands)', th:'คนขอสวัสดิการว่างงานรายสัปดาห์ (พันคน)' }, lineChart({ series:[{ name:{ en:'Claims', th:'ขอสวัสดิการ' }, pts:histSince('claims', 3), color:COL.d, area:true }], unit:'k', dec:0 }), 'user') + '</div>';
    h += '<div class="bz-two">' + sec({ en:'Spending & production growth (y/y)', th:'การใช้จ่ายและการผลิตโต (เทียบปีก่อน)' }, lineChart({ series:[{ name:{ en:'Retail sales', th:'ค้าปลีก' }, pts:histSince('retail', 6), color:COL.e }, { name:{ en:'Industrial output', th:'การผลิต' }, pts:histSince('indpro', 6), color:COL.b }, { name:{ en:'CPI', th:'เงินเฟ้อ' }, pts:histSince('cpi', 6), color:COL.g, dash:'4 4', w:1.5 }], unit:'%', zero:true }), 'trend') +
      sec({ en:'Real GDP growth (annualised, by quarter)', th:'GDP จริงรายไตรมาส (ปรับเป็นต่อปี)' }, barChart(lastN(mac('gdp') && mac('gdp').hist, 16), { unit:'%', dec:1, up:'#22d3ee' }), 'globe') + '</div>';
    return h;
  }

  function thaiBreadth(){
    var n = 0, up = 0, m1 = [];
    Object.keys(D.m.stocks).forEach(function(t){ var s = D.m.stocks[t]; if(s.cal !== 'th') return; n++; if(s.above_ma200) up++; if(isNum(s.m1)) m1.push(s.m1); });
    return { n:n, up:n ? up / n * 100 : null, m1:median(m1) };
  }
  function vFx(E){
    var X = E.fx, C = E.comm, tb = thaiBreadth(), thd = flow('THD') || {};
    var h = '<div class="bz-kpis">' +
      kpi({ en:'Dollar index', th:'ดัชนีดอลลาร์' }, f(X.dxy, 2), spc(X.dx1, 1) + ' / 1m', X.dx3 > 2 ? 'bad' : X.dx3 < -2 ? 'good' : '') +
      kpi({ en:'USD/THB', th:'1 ดอลลาร์ = บาท' }, f(X.thb && X.thb.rate, 2), esc(T({ en:'baht ', th:'บาท ' })) + spc(X.thb1, 1) + ' / 1m', X.thb1 < -1.5 ? 'bad' : X.thb1 > 1.5 ? 'good' : '') +
      kpi({ en:'Baht this year', th:'เงินบาทปีนี้' }, spc(X.thbY, 1), esc(T({ en:'− = weaker', th:'ลบ = อ่อนค่า' }))) +
      kpi({ en:'Oil (WTI)', th:'น้ำมัน WTI' }, '$' + f(C.oil, 1), spc(C.oilY, 0) + ' y/y', C.oilY > 25 ? 'bad' : '') +
      kpi({ en:'Gold', th:'ทองคำ' }, spc(C.gold1, 1), spc(C.gold3, 1) + ' / 3m') + kpi({ en:'Commodities', th:'สินค้าโภคภัณฑ์' }, spc(C.dbc3, 1), '3m') +
      kpi({ en:'Thai stocks (THD)', th:'หุ้นไทย (THD)' }, spc(thd.m1, 1), spc(thd.m3, 1) + ' / 3m', thd.m3 > 3 ? 'good' : thd.m3 < -3 ? 'bad' : '') +
      kpi({ en:'Thai stocks in up-trend', th:'หุ้นไทยที่ยังเป็นขาขึ้น' }, pc(tb.up, 0), tb.n + esc(T({ en:' stocks', th:' ตัว' })), tb.up < 40 ? 'bad' : tb.up > 60 ? 'good' : '') + '</div>';
    var thSay = [];
    if(X.dx3 > 2) thSay.push({ en:'A firmer dollar tends to pull foreign money out of Thai stocks and weaken the baht.', th:'ดอลลาร์ที่แข็งขึ้นมักดึงเงินต่างชาติออกจากหุ้นไทยและทำให้บาทอ่อน' });
    if(X.dx3 < -2) thSay.push({ en:'A softer dollar usually helps flows into Thailand and other emerging markets.', th:'ดอลลาร์อ่อนมักช่วยให้เงินไหลเข้าไทยและตลาดเกิดใหม่' });
    if(X.thb1 < -1) thSay.push({ en:'A weaker baht helps exporters and tourism earnings, hurts importers and anyone paying in dollars.', th:'บาทอ่อนช่วยผู้ส่งออกและรายได้ท่องเที่ยว แต่ไม่ดีกับผู้นำเข้าและคนที่ต้องจ่ายเป็นดอลลาร์' });
    if(X.thb1 > 1) thSay.push({ en:'A stronger baht cheapens imports and foreign assets for Thai investors, but trims exporters\' baht income.', th:'บาทแข็งทำให้ของนำเข้าและการลงทุนต่างประเทศถูกลงสำหรับคนไทย แต่รายได้ผู้ส่งออกที่แปลงเป็นบาทลดลง' });
    if(C.oilY > 25) thSay.push({ en:'Thailand imports most of its oil, so expensive crude widens the import bill and pushes local prices up — PTT-type producers gain, airlines and transport lose.', th:'ไทยนำเข้าน้ำมันเกือบทั้งหมด น้ำมันแพงทำให้ค่าใช้จ่ายนำเข้าสูงและดันราคาสินค้าในประเทศ ผู้ผลิตพลังงานได้ประโยชน์ สายการบินและขนส่งเสียประโยชน์' });
    if(!thSay.length) thSay.push({ en:'No strong currency or commodity pressure on Thailand right now.', th:'ตอนนี้ยังไม่มีแรงกดดันจากค่าเงินหรือสินค้าโภคภัณฑ์ต่อไทยมากนัก' });
    h += '<div class="bz-callout mid">' + ico('globe') + '<div><b>' + esc(T({ en:'What it means for Thailand', th:'แปลว่าอะไรสำหรับไทย' })) + '</b>' + thSay.map(function(t){ return '<p>' + esc(T(t)) + '</p>'; }).join('') + '</div></div>';
    var ccy = D.m.ccy || {}, rows = Object.keys(ccy).filter(function(k){ return k !== 'USD' && isNum(ccy[k].m1); }).map(function(k){ return { n:k, v:ccy[k].m1, hi:k === 'THB' }; }).sort(function(a, b){ return b.v - a.v; });
    h += '<div class="bz-two">' + sec({ en:'Currencies vs the dollar, last month', th:'ค่าเงินเทียบดอลลาร์ 1 เดือนล่าสุด' }, bars(rows) + note({ en:'Positive = the currency strengthened against the US dollar.', th:'บวก = ค่าเงินนั้นแข็งขึ้นเมื่อเทียบดอลลาร์' }), 'coin') +
      sec({ en:'Crude oil (WTI, $ per barrel)', th:'น้ำมันดิบ WTI (ดอลลาร์ต่อบาร์เรล)' }, lineChart({ series:[{ name:{ en:'WTI', th:'WTI' }, pts:histSince('oil', 5), color:COL.d, area:true }], unit:'', dec:1 }), 'barrel') + '</div>';
    var A = (D.m.flows && D.m.flows.asset) || [];
    h += sec({ en:'Every asset class at a glance', th:'สินทรัพย์ทุกประเภทในตารางเดียว' }, '<div class="bz-tw"><table class="bz-heat"><thead><tr><th></th><th>1W</th><th>1M</th><th>3M</th><th>YTD</th><th>' + esc(T({ en:'trend', th:'แนวโน้ม' })) + '</th></tr></thead><tbody>' +
      A.map(function(a){ return '<tr><td><b>' + esc(a.sym) + '</b><em>' + esc(L() === 'th' ? a.th : a.en) + '</em></td>' + ['w1', 'm1', 'm3', 'ytd'].map(function(k){ return '<td class="' + heatCls(a[k], k === 'w1' ? 0.4 : k === 'm1' ? 1 : k === 'm3' ? 1.8 : 2.5) + '">' + spc(a[k], 1) + '</td>'; }).join('') + '<td>' + (a.above_ma200 ? '<span class="bz-up">' + esc(T({ en:'up', th:'ขาขึ้น' })) + '</span>' : '<span class="bz-dn">' + esc(T({ en:'down', th:'ขาลง' })) + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>', 'layers');
    return h;
  }

  function quadrant(list){
    if(!list.length) return '';
    var W = 640, H = 330, P = 40, xs = list.map(function(s){ return s.m1; }), ys = list.map(function(s){ return s.m3; });
    var xm = Math.max(3, Math.max.apply(null, xs.map(Math.abs))) * 1.15, ym = Math.max(5, Math.max.apply(null, ys.map(Math.abs))) * 1.15;
    var X = function(v){ return P + (v + xm) / (2 * xm) * (W - 2 * P); }, Y = function(v){ return P / 2 + (1 - (v + ym) / (2 * ym)) * (H - 1.5 * P); };
    var s = '<rect class="bz-qd lead" x="' + X(0) + '" y="' + Y(ym) + '" width="' + (X(xm) - X(0)) + '" height="' + (Y(0) - Y(ym)) + '"/><rect class="bz-qd weak" x="' + X(-xm) + '" y="' + Y(ym) + '" width="' + (X(0) - X(-xm)) + '" height="' + (Y(0) - Y(ym)) + '"/>' +
      '<rect class="bz-qd lag" x="' + X(-xm) + '" y="' + Y(0) + '" width="' + (X(0) - X(-xm)) + '" height="' + (Y(-ym) - Y(0)) + '"/><rect class="bz-qd imp" x="' + X(0) + '" y="' + Y(0) + '" width="' + (X(xm) - X(0)) + '" height="' + (Y(-ym) - Y(0)) + '"/>';
    var lab = [[xm, ym, { en:'LEADING', th:'นำตลาด' }, 'end', 14], [-xm, ym, { en:'FADING', th:'เริ่มแผ่ว' }, 'start', 14], [-xm, -ym, { en:'LAGGING', th:'ตามหลัง' }, 'start', -6], [xm, -ym, { en:'IMPROVING', th:'เริ่มฟื้น' }, 'end', -6]];
    lab.forEach(function(l){ s += '<text class="bz-qdl" x="' + (X(l[0]) + (l[3] === 'end' ? -8 : 8)) + '" y="' + (Y(l[1]) + l[4]) + '" text-anchor="' + l[3] + '">' + esc(T(l[2])) + '</text>'; });
    s += '<line class="bz-qa" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + Y(ym) + '" y2="' + Y(-ym) + '"/><line class="bz-qa" x1="' + X(-xm) + '" x2="' + X(xm) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    s += '<text class="bz-ax" x="' + (W - P) + '" y="' + (H - 8) + '" text-anchor="end">' + esc(T({ en:'1-month return →', th:'ผลตอบแทน 1 เดือน →' })) + '</text><text class="bz-ax" x="' + (P + 4) + '" y="' + (P / 2 + 10) + '">' + esc(T({ en:'↑ 3-month return', th:'↑ ผลตอบแทน 3 เดือน' })) + '</text>';
    list.forEach(function(it){
      var fav = it.fav ? ' fav' : '';
      s += '<g class="bz-qp' + fav + '"><circle cx="' + X(it.m1).toFixed(1) + '" cy="' + Y(it.m3).toFixed(1) + '" r="' + (it.fav ? 8 : 6) + '"/><text x="' + (X(it.m1) + 10).toFixed(1) + '" y="' + (Y(it.m3) + 4).toFixed(1) + '">' + esc(it.label) + '</text><title>' + esc(it.title) + ': 1M ' + spc(it.m1, 1) + ', 3M ' + spc(it.m3, 1) + '</title></g>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg">' + s + '</svg>';
  }
  function vRot(E){
    var ph = PHASES[E.phase], S = (D.m.flows && D.m.flows.sector) || [], Cn = (D.m.flows && D.m.flows.country) || [];
    var ETF_SEC = { XLK:'Technology', XLF:'Financial Services', XLE:'Energy', XLV:'Healthcare', XLY:'Consumer Cyclical', XLP:'Consumer Defensive', XLI:'Industrials', XLU:'Utilities', XLB:'Basic Materials', XLRE:'Real Estate', XLC:'Communication Services', SMH:'Technology' };
    var list = S.map(function(s){ return { label:s.sym, title:L() === 'th' ? s.th : s.en, m1:s.m1, m3:s.m3, fav:ph.sectors.indexOf(ETF_SEC[s.sym]) >= 0 || ph.etf.indexOf(s.sym) >= 0 }; });
    var leaders = S.slice().sort(function(a, b){ return (b.m3 + b.m1) - (a.m3 + a.m1); }).slice(0, 4).map(function(s){ return s.sym; });
    var match = leaders.filter(function(t){ return ph.sectors.indexOf(ETF_SEC[t]) >= 0 || ph.etf.indexOf(t) >= 0; }).length;
    var h = '<div class="bz-callout ' + (match >= 2 ? 'good' : 'mid') + '">' + ico('compass') + '<div><b>' + esc(T({ en:'Does the market agree with the phase?', th:'ตลาดจริงตรงกับช่วงเศรษฐกิจไหม' })) + '</b><p>' +
      esc(T({ en:'Leading sectors now: ' + leaders.join(', ') + '. ' + match + ' of 4 are ones the “' + ph.short.en + '” phase usually favours' + (match >= 2 ? ' — the market is behaving as the phase suggests.' : ' — the market is not following the textbook yet; the phase call may be early or wrong.'),
        th:'กลุ่มที่นำตอนนี้: ' + leaders.join(', ') + ' ตรงกับกลุ่มที่ช่วง “' + ph.short.th + '” มักเด่น ' + match + ' จาก 4 กลุ่ม' + (match >= 2 ? ' แปลว่าตลาดเคลื่อนไหวตามสภาวะเศรษฐกิจ' : ' แปลว่าตลาดยังไม่เป็นไปตามตำรา การอ่านช่วงเศรษฐกิจอาจเร็วไปหรือคลาดได้') })) + '</p></div></div>';
    h += '<div class="bz-two">' + sec({ en:'Sector rotation map', th:'แผนที่การหมุนเวียนกลุ่มหุ้น' }, quadrant(list) + note({ en:'Bigger dots = sectors the current phase usually favours. Money tends to rotate clockwise: improving → leading → fading → lagging.', th:'จุดใหญ่ = กลุ่มที่ช่วงเศรษฐกิจตอนนี้มักเอื้อ เงินมักหมุนตามเข็มนาฬิกา: เริ่มฟื้น → นำตลาด → เริ่มแผ่ว → ตามหลัง' }), 'compass') +
      sec({ en:'Countries, last 3 months', th:'ตลาดหุ้นแต่ละประเทศ 3 เดือนล่าสุด' }, bars(Cn.map(function(c){ return { n:L() === 'th' ? c.th : c.en, sub:c.sym, v:c.m3, hi:c.sym === 'THD' }; }).sort(function(a, b){ return b.v - a.v; })), 'globe') + '</div>';
    var P = pairs();
    h += sec({ en:'Pairs that work well together right now', th:'คู่สินทรัพย์ที่ถือคู่กันแล้วดี ตอนนี้' }, P.length ? '<div class="bz-pairs">' + P.map(function(p){
      var a = info(p.a), b = info(p.b);
      return '<div class="bz-pair"><div><b>' + p.a + '</b><em>' + esc(a ? a.n : '') + '</em></div>' + ico('plus') + '<div><b>' + p.b + '</b><em>' + esc(b ? b.n : '') + '</em></div><p>' +
        esc(T({ en:'Correlation ' + f(p.c, 2) + ' — they ' + (p.c < 0 ? 'often move in opposite directions' : p.c < 0.4 ? 'move fairly independently' : 'move somewhat together') + '. A 50/50 mix swung about ' + f(p.vol, 0) + '% a year.', th:'ความสัมพันธ์ ' + f(p.c, 2) + ' ' + (p.c < 0 ? 'มักเคลื่อนไหวสวนทางกัน' : p.c < 0.4 ? 'เคลื่อนไหวค่อนข้างอิสระต่อกัน' : 'เคลื่อนไหวไปด้วยกันบ้าง') + ' ถ้าถือคู่กันอย่างละครึ่ง แกว่งประมาณ ' + f(p.vol, 0) + '% ต่อปี' })) + '</p></div>';
    }).join('') + '</div>' + note({ en:'Built from the phase\'s favoured assets, each paired with the partner that lowered risk the most over the past year.', th:'สร้างจากสินทรัพย์ที่ช่วงเศรษฐกิจนี้มักเอื้อ จับคู่กับตัวที่ช่วยลดความเสี่ยงได้มากที่สุดในปีที่ผ่านมา' }) : note({ en:'Needs the weekly ETF data in brain.json.', th:'ต้องใช้ข้อมูล ETF รายสัปดาห์ใน brain.json' }), 'swap');
    h += '<div class="bz-two">' + basket('us', { en:'US stocks that fit today', th:'หุ้นสหรัฐฯ ที่เข้ากับสภาวะตอนนี้' }) + basket('th', { en:'Thai stocks that fit today', th:'หุ้นไทยที่เข้ากับสภาวะตอนนี้' }) + '</div>';
    return h;
  }
  function basket(mk, title){
    var rows = autoPick(mk, 8);
    return sec(title, rows.length ? '<div class="bz-tw"><table class="bz-tbl"><thead><tr><th></th><th>' + esc(T({ en:'Quality', th:'คุณภาพ' })) + '</th><th>' + esc(T({ en:'Price', th:'ราคา' })) + '</th><th>' + esc(T({ en:'Trend', th:'แนวโน้ม' })) + '</th><th>P/E</th></tr></thead><tbody>' + rows.map(function(r){
      return '<tr><td><b>' + esc(r.t) + '</b><em>' + esc(sectName(r.sec)) + '</em></td><td>' + stars(r.c.q) + '</td><td>' + stars(r.c.v) + '</td><td>' + stars(r.c.m) + '</td><td>' + f(r.c.I.s.pe, 1) + '</td></tr>';
    }).join('') + '</tbody></table></div><button type="button" class="bz-btn" data-pfmode="auto' + mk + '">' + ico('flask') + esc(T({ en:'Analyse this basket as a portfolio', th:'วิเคราะห์ตะกร้านี้แบบพอร์ต' })) + '</button>' : note({ en:'Not enough data.', th:'ข้อมูลไม่พอ' }), 'star');
  }

  function vOut(E){
    var h = '<p class="bz-lead">' + esc(T({ en:'The three paths that matter most, with odds weighed from today\'s evidence, what wins or loses in each, and the exact numbers that tell you which one is unfolding.', th:'3 เส้นทางที่สำคัญที่สุด พร้อมโอกาสที่คำนวณจากหลักฐานวันนี้ สิ่งที่ชนะหรือแพ้ในแต่ละแบบ และตัวเลขที่บอกว่ากำลังเกิดแบบไหน' })) + '</p>';
    h += '<div class="bz-scen">' + E.scen.map(function(s, i){
      return '<div class="bz-sc bz-sc-' + s.k + (i === 0 ? ' top' : '') + '"><div class="bz-sch">' + ico(s.icon) + '<b>' + esc(T(s.name)) + '</b><span class="bz-scp">' + s.p + '%</span></div><div class="bz-scbar"><i style="width:' + s.p + '%"></i></div>' +
        '<p>' + esc(T(s.story)) + '</p><div class="bz-wl"><div><h6>' + esc(T({ en:'Tends to win', th:'มักได้ประโยชน์' })) + '</h6>' + (L() === 'th' ? s.winTh : s.win).map(function(x){ return '<span class="up">' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<div><h6>' + esc(T({ en:'Tends to lose', th:'มักเสียประโยชน์' })) + '</h6>' + (L() === 'th' ? s.loseTh : s.lose).map(function(x){ return '<span class="dn">' + esc(x) + '</span>'; }).join('') + '</div></div>' +
        '<h6>' + esc(T({ en:'You will know it is happening when…', th:'จะรู้ว่ากำลังเกิดแบบนี้เมื่อ…' })) + '</h6><ul class="bz-trig">' + s.trig.map(function(t){
          var ok = isNum(t.cur) && (t.dir > 0 ? t.cur >= t.thr : t.cur <= t.thr), prog = isNum(t.cur) ? clamp(t.dir > 0 ? t.cur / t.thr : t.thr / Math.max(t.cur, 0.01), 0, 1) * 100 : 0;
          return '<li class="' + (ok ? 'on' : '') + '"><span>' + esc(T(t.n)) + ' <b>' + f(t.thr, t.d) + t.unit + '</b></span><i><u style="width:' + prog.toFixed(0) + '%"></u></i><em>' + esc(T({ en:'now', th:'ตอนนี้' })) + ' ' + f(t.cur, t.d) + t.unit + (ok ? ' ✓' : '') + '</em></li>';
        }).join('') + '</ul></div>';
    }).join('') + '</div>';
    h += sec({ en:'How the odds were weighed', th:'คิดโอกาสจากอะไร' }, '<ul class="bz-why">' +
      '<li>' + esc(T({ en:'Growth momentum ' + sg(E.g, 2) + ' and inflation momentum ' + sg(E.i, 2) + ' (−1 … +1) from jobs, spending, output, sentiment, prices and oil.', th:'แรงส่งเศรษฐกิจ ' + sg(E.g, 2) + ' และแรงส่งเงินเฟ้อ ' + sg(E.i, 2) + ' (ช่วง −1 ถึง +1) คิดจากการจ้างงาน การใช้จ่าย การผลิต ความเชื่อมั่น ราคาสินค้า และน้ำมัน' })) + '</li>' +
      '<li>' + esc(T({ en:'Recession clues: Sahm rule, claims, credit spreads, curve history, breadth and the Fed\'s own recession model.', th:'เบาะแสถดถอย: สัญญาณ Sahm คนขอสวัสดิการว่างงาน ส่วนต่างหุ้นกู้ ประวัติเส้นอัตราผลตอบแทน ความกว้างของตลาด และโมเดลของเฟด' })) + '</li>' +
      '<li>' + esc(T({ en:'Inflation clues: core PCE trend, 5-year expectations, oil versus a year ago, and whether bonds are pricing hikes.', th:'เบาะแสเงินเฟ้อ: ทิศทาง Core PCE เงินเฟ้อคาดการณ์ 5 ปี น้ำมันเทียบปีก่อน และตลาดบอนด์คาดว่าจะขึ้นดอกเบี้ยไหม' })) + '</li>' +
      '<li>' + esc(T({ en:'The scores are combined and turned into odds that add to 100%. They update automatically whenever the data does.', th:'นำคะแนนมารวมกันแล้วแปลงเป็นโอกาสที่รวมกันได้ 100% และอัปเดตเองทุกครั้งที่ข้อมูลเปลี่ยน' })) + '</li></ul>', 'radar');
    return h;
  }

  var EVT = [
    [/CPI|Consumer Price/i, { en:'Inflation for consumers. Hotter than expected = rates stay high longer.', th:'เงินเฟ้อฝั่งผู้บริโภค ถ้าสูงกว่าคาด ดอกเบี้ยมักอยู่สูงนานขึ้น' }],
    [/PCE/i, { en:'The Fed\'s preferred inflation gauge.', th:'ตัววัดเงินเฟ้อที่เฟดใช้ตัดสินใจ' }],
    [/PPI|Producer Price/i, { en:'Factory-gate prices — an early hint for future consumer inflation.', th:'ราคาหน้าโรงงาน บอกล่วงหน้าว่าเงินเฟ้อผู้บริโภคอาจไปทางไหน' }],
    [/Non-Farm|Nonfarm|NFP|Employment Change/i, { en:'Jobs report — the single biggest monthly data point for markets.', th:'รายงานการจ้างงาน ตัวเลขรายเดือนที่ตลาดให้ความสำคัญที่สุด' }],
    [/Unemployment Claims|Jobless/i, { en:'Weekly layoffs. A steady rise is an early recession clue.', th:'จำนวนคนตกงานรายสัปดาห์ ถ้าเพิ่มต่อเนื่องเป็นเบาะแสถดถอยแรกๆ' }],
    [/Unemployment Rate/i, { en:'Share of people looking for work.', th:'สัดส่วนคนที่หางานอยู่' }],
    [/FOMC|Federal Funds|Fed Chair|Powell|Fed /i, { en:'The Fed — anything about future rates moves every market.', th:'เฟด ทุกอย่างที่เกี่ยวกับดอกเบี้ยในอนาคตขยับทุกตลาด' }],
    [/Interest Rate|Rate Decision|Cash Rate|Refinancing|Policy Rate/i, { en:'A central-bank rate decision.', th:'การตัดสินดอกเบี้ยของธนาคารกลาง' }],
    [/GDP/i, { en:'How fast the whole economy grew.', th:'เศรษฐกิจทั้งประเทศโตเร็วแค่ไหน' }],
    [/Retail Sales/i, { en:'Shopping spending — about two-thirds of the US economy is consumers.', th:'การใช้จ่ายซื้อของ ผู้บริโภคคือประมาณ 2 ใน 3 ของเศรษฐกิจสหรัฐฯ' }],
    [/PMI|ISM/i, { en:'Survey of purchasing managers: above 50 = expanding, below 50 = shrinking.', th:'ผลสำรวจผู้จัดการฝ่ายจัดซื้อ: เกิน 50 = ขยายตัว ต่ำกว่า 50 = หดตัว' }],
    [/Sentiment|Confidence/i, { en:'How confident people or firms feel.', th:'คนหรือธุรกิจรู้สึกมั่นใจแค่ไหน' }],
    [/Trade Balance/i, { en:'Exports minus imports.', th:'ส่งออกลบนำเข้า' }]
  ];
  var CTRY = { US:{ en:'US', th:'สหรัฐฯ' }, EU:{ en:'Euro area', th:'ยูโรโซน' }, GB:{ en:'UK', th:'อังกฤษ' }, JP:{ en:'Japan', th:'ญี่ปุ่น' }, CN:{ en:'China', th:'จีน' }, TH:{ en:'Thailand', th:'ไทย' }, DE:{ en:'Germany', th:'เยอรมนี' } };
  function vCal(){
    var ev = (D.econ && D.econ.economicCalendar) || [], now = Date.now() - 6 * 3600e3;
    var up = ev.filter(function(e){ return Date.parse(e.time.replace(' ', 'T') + 'Z') >= now && (e.impact === 'high' || e.impact === 'medium'); });
    var past = ev.filter(function(e){ return Date.parse(e.time.replace(' ', 'T') + 'Z') < now && e.impact === 'high'; }).slice(-6);
    function row(e){
      var why = ''; for(var i = 0; i < EVT.length; i++){ if(EVT[i][0].test(e.event)){ why = T(EVT[i][1]); break; } }
      var d = new Date(Date.parse(e.time.replace(' ', 'T') + 'Z'));
      return '<li class="' + e.impact + '"><time>' + d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Bangkok' }) + '</time><span class="bz-ct">' + esc(T(CTRY[e.country] || { en:e.country })) + '</span><div><b>' + esc(e.event) + '</b>' + (why ? '<em>' + esc(why) + '</em>' : '') + '</div><span class="bz-num">' +
        (e.estimate != null ? esc(T({ en:'exp ', th:'คาด ' })) + e.estimate + (e.unit || '') : '') + (e.prev != null ? ' · ' + esc(T({ en:'prev ', th:'ก่อน ' })) + e.prev + (e.unit || '') : '') + '</span></li>';
    }
    var h = sec({ en:'Coming up (times in Thailand)', th:'กำลังจะประกาศ (เวลาไทย)' }, up.length ? '<ul class="bz-cal">' + up.map(row).join('') + '</ul>' : note({ en:'No medium/high-impact releases left in the calendar file. It refreshes twice a day.', th:'ไม่มีตัวเลขสำคัญเหลือในปฏิทินช่วงนี้ ไฟล์ปฏิทินอัปเดตวันละ 2 ครั้ง' }), 'cal');
    if(past.length) h += sec({ en:'Recently released (high impact)', th:'เพิ่งประกาศไป (สำคัญมาก)' }, '<ul class="bz-cal past">' + past.map(row).join('') + '</ul>', 'eye');
    var E = E_last, w = [];
    E.scen.forEach(function(s){ s.trig.forEach(function(t){ if(isNum(t.cur)){ var dist = t.dir > 0 ? (t.thr - t.cur) / Math.abs(t.thr) : (t.cur - t.thr) / Math.abs(t.thr); w.push({ s:s, t:t, dist:dist }); } }); });
    w.sort(function(a, b){ return a.dist - b.dist; });
    h += sec({ en:'Our own tripwires — closest first', th:'เส้นเตือนของเรา — เรียงจากที่ใกล้จะถึงที่สุด' }, '<ul class="bz-trig wide">' + w.slice(0, 6).map(function(x){
      var hit = x.dist <= 0;
      return '<li class="' + (hit ? 'on' : '') + '"><span>' + esc(T(x.t.n)) + ' <b>' + f(x.t.thr, x.t.d) + x.t.unit + '</b> <small>(' + esc(T(x.s.name)) + ')</small></span><em>' + esc(T({ en:'now', th:'ตอนนี้' })) + ' ' + f(x.t.cur, x.t.d) + x.t.unit + ' · ' + (hit ? esc(T({ en:'reached', th:'ถึงแล้ว' })) : esc(T({ en:'distance ', th:'ห่าง ' })) + f(x.dist * 100, 0) + '%') + '</em></li>';
    }).join('') + '</ul>', 'radar');
    return h;
  }

  /* ============================================================== FORECAST
     Forward-looking models, each simple enough to state in one line and each
     shown with the numbers it is built from:
       inflation   -> price-index momentum carried forward + base effects (+ oil pass-through)
       Fed         -> path implied by T-bills and the 2-year yield, checked against a Taylor rule
       yields      -> drift toward a building-block fair value (+ trend)
       jobs        -> payroll gap vs break-even + claims trend + openings
       growth      -> GDPNow + a leading index (permits, claims, curve, openings, sentiment, credit)
       recession   -> NY Fed yield-curve probit blended with a stress/jobs score
       markets     -> earnings yield + regime + momentum, ranges from VIX / realised volatility
       money flows -> momentum, acceleration and trend across 48 ETFs */
  function addM(t, m){ var d = new Date(tms(t)); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10); }
  function erf(x){ var s = x < 0 ? -1 : 1; x = Math.abs(x); var t1 = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t1 - 1.453152027) * t1) + 1.421413741) * t1 - 0.284496736) * t1 + 0.254829592) * t1 * Math.exp(-x * x); return s * y; }
  function Phi(x){ return 0.5 * (1 + erf(x / Math.SQRT2)); }
  function logistic(x){ return 1 / (1 + Math.exp(-x)); }
  function wchg(k, weeks){ var s = mac(k); if(!s || !s.hist || s.hist.length < weeks + 1) return null; var h = s.hist; return h[h.length - 1][1] - h[h.length - 1 - weeks][1]; }
  function wsd(k, n){ var s = mac(k); if(!s || !s.hist) return null; var h = lastN(s.hist, n + 1), d = []; for(var i = 1; i < h.length; i++) d.push(h[i][1] - h[i - 1][1]); return std(d); }
  function fcPts(t0, now, steps){ return steps.map(function(s){ return { t:addM(t0, s.m), m:s.m, v:s.v, lo:s.lo, hi:s.hi, lo2:s.lo2, hi2:s.hi2 }; }); }

  function forecast(E){
    var F = { items:{} };
    var core = mac('core_pce'), cpi = mac('cpi'), oil = mac('oil');
    /* ---- inflation: carry the recent monthly pace forward on the price index */
    function inflPath(s, isHeadline){
      if(!s || !s.idx || s.idx.length < 26) return null;
      var I = s.idx.map(function(p){ return p[1]; }), n = I.length, mm = [];
      for(var i = 1; i < n; i++) mm.push(Math.log(I[i] / I[i - 1]));
      var m3 = mean(lastN(mm, 3)), m6 = mean(lastN(mm, 6)), m12 = mean(lastN(mm, 12)), sd = std(lastN(mm, 24));
      var target = Math.log(1.02) / 12, drift = 0.45 * m3 + 0.35 * m6 + 0.2 * m12;
      var oilAdj = isHeadline && E.comm.oil3 != null ? clamp(E.comm.oil3, -40, 40) / 100 * 0.02 / 3 : 0;
      var lvl = I[n - 1], out = [], cur = Math.log(lvl), path = [];
      for(var k = 1; k <= 12; k++){
        var d = drift + (target - drift) * Math.min(1, k / 24) + (k <= 3 ? oilAdj : 0);
        cur += d; path.push(cur);
      }
      [3, 6, 12].forEach(function(k){
        var base = I[n - 1 - 12 + k], yoy = (Math.exp(path[k - 1]) / base - 1) * 100, band = sd * Math.sqrt(k) * 100 * 1.1;
        out.push({ m:k, v:yoy, lo:yoy - band, hi:yoy + band, lo2:yoy - 2 * band, hi2:yoy + 2 * band });
      });
      var dropping = []; for(var j = 0; j < 3; j++) dropping.push(mm[n - 1 - 12 + j]);   // monthly moves that leave the y/y window next
      return { now:s.v, t:s.t, fc:out, ann3:(Math.exp(m3 * 12) - 1) * 100, ann6:(Math.exp(m6 * 12) - 1) * 100, baseOut:(Math.exp(mean(dropping) * 12) - 1) * 100, oilAdj:oilAdj };
    }
    var ip = inflPath(core, false), ic = inflPath(cpi, true);
    F.items.core = ip && { k:'core', name:{ en:'Core PCE inflation', th:'เงินเฟ้อพื้นฐาน (Core PCE)' }, unit:'%', dec:2, now:ip.now, t:ip.t, fc:fcPts(ip.t, ip.now, ip.fc), hist:histSince('core_pce', 4),
      basis:[{ en:'Recent pace: ' + f(ip.ann3, 1) + '% annualised over 3 months, ' + f(ip.ann6, 1) + '% over 6.', th:'ความเร็วล่าสุด: ' + f(ip.ann3, 1) + '% ต่อปี (3 เดือน) และ ' + f(ip.ann6, 1) + '% ต่อปี (6 เดือน)' },
        { en:'Base effect: the months leaving the 12-month window ran at ' + f(ip.baseOut, 1) + '% annualised — ' + (ip.baseOut > ip.ann3 ? 'higher than today\'s pace, which pulls y/y DOWN.' : 'lower than today\'s pace, which pushes y/y UP.'), th:'ฐานเปรียบเทียบ: เดือนที่จะหลุดจากการคำนวณ 12 เดือนวิ่ง ' + f(ip.baseOut, 1) + '% ต่อปี ' + (ip.baseOut > ip.ann3 ? 'สูงกว่าความเร็วตอนนี้ จึงดึงตัวเลขเทียบปีก่อนให้ลดลง' : 'ต่ำกว่าความเร็วตอนนี้ จึงดันตัวเลขเทียบปีก่อนให้สูงขึ้น') },
        { en:'Pace drifts toward 2% over two years.', th:'สมมติว่าความเร็วค่อยๆ เข้าหา 2% ภายใน 2 ปี' }] };
    F.items.cpi = ic && { k:'cpi', name:{ en:'CPI inflation', th:'เงินเฟ้อทั่วไป (CPI)' }, unit:'%', dec:2, now:ic.now, t:ic.t, fc:fcPts(ic.t, ic.now, ic.fc), hist:histSince('cpi', 4),
      basis:[{ en:'Same method as core, plus oil: ' + spc(E.comm.oil3, 0) + ' in 3 months adds ' + sg(ic.oilAdj * 3 * 100, 2) + ' pt over the next quarter.', th:'วิธีเดียวกับเงินเฟ้อพื้นฐาน บวกผลจากน้ำมัน: น้ำมัน 3 เดือน ' + spc(E.comm.oil3, 0) + ' เพิ่มเงินเฟ้อ ' + sg(ic.oilAdj * 3 * 100, 2) + ' จุดในไตรมาสหน้า' },
        { en:'Pace: ' + f(ic.ann3, 1) + '% (3m) · ' + f(ic.ann6, 1) + '% (6m) annualised.', th:'ความเร็ว: ' + f(ic.ann3, 1) + '% (3 เดือน) · ' + f(ic.ann6, 1) + '% (6 เดือน) ต่อปี' }] };

    /* ---- the Fed: what bills and the 2-year are pricing, and what a Taylor rule says */
    var ff = mv('ff'), bill = mv('y3m') != null ? mv('y3m') : (mkt('us3m') && mkt('us3m').price), y2 = mv('y2'), un = mv('unrate'), cv = E.infl.v;
    var taylor = isNum(cv) && isNum(un) ? 1.0 + cv + 0.5 * (cv - 2) + 0.5 * (-2 * (un - 4.2)) : null;
    if(isNum(ff) && isNum(y2)){
      var slope = (y2 - 0.15 - ff) / 12, r3b = clamp(2 * bill - ff, ff - 0.75, ff + 0.75);
      var r3 = isNum(bill) ? 0.7 * r3b + 0.3 * (ff + 3 * slope) : ff + 3 * slope, r6 = ff + 6 * slope * 0.9 + (r3 - ff - 3 * slope) * 0.5, r12 = ff + 12 * slope * 0.85;
      var mk = function(m, v){ var b = 0.18 * Math.sqrt(m / 3); return { m:m, v:v, lo:v - b, hi:v + b, lo2:v - 2 * b, hi2:v + 2 * b }; };
      var moves = Math.round((r12 - ff) / 0.25);
      F.fed = { now:ff, taylor:taylor, r3:r3, r6:r6, r12:r12, moves:moves, bill:bill };
      F.items.ff = { k:'ff', name:{ en:'Fed funds rate', th:'ดอกเบี้ยนโยบายเฟด' }, unit:'%', dec:2, now:ff, t:mac('ff').t, fc:fcPts(mac('ff').t, ff, [mk(3, r3), mk(6, r6), mk(12, r12)]), hist:histSince('ff', 4),
        ref:isNum(taylor) ? [{ v:taylor, label:{ en:'Taylor rule ' + f(taylor, 2) + '%', th:'กฎเทย์เลอร์ ' + f(taylor, 2) + '%' } }] : null,
        basis:[{ en:'3-month T-bill ' + pc(bill, 2) + ' → the market expects about ' + pc(r3, 2) + ' in 3 months.', th:'ตั๋วเงินคลัง 3 เดือน ' + pc(bill, 2) + ' → ตลาดคาดดอกเบี้ยเฟดราว ' + pc(r3, 2) + ' ใน 3 เดือน' },
          { en:'2-year yield ' + pc(y2, 2) + ' → a path that ends near ' + pc(r12, 2) + ' in a year (' + (moves > 0 ? '+' + moves + ' hike' + (moves > 1 ? 's' : '') : moves < 0 ? Math.abs(moves) + ' cut' + (moves < -1 ? 's' : '') : 'no change') + ' of 0.25).', th:'บอนด์ 2 ปี ' + pc(y2, 2) + ' → เส้นทางที่จบราว ' + pc(r12, 2) + ' ในอีก 1 ปี (' + (moves > 0 ? 'ขึ้น ' + moves + ' ครั้ง' : moves < 0 ? 'ลด ' + Math.abs(moves) + ' ครั้ง' : 'คงที่') + ' ครั้งละ 0.25)' },
          { en:'Taylor rule (inflation ' + pc(cv, 1) + ', unemployment ' + pc(un, 1) + ') says ' + pc(taylor, 2) + ' — ' + (taylor > ff + 0.5 ? 'the Fed looks too loose, pressure is UP.' : taylor < ff - 0.5 ? 'the Fed looks too tight, room to CUT.' : 'about right.'), th:'กฎเทย์เลอร์ (เงินเฟ้อ ' + pc(cv, 1) + ' ว่างงาน ' + pc(un, 1) + ') บอกว่าควรอยู่ที่ ' + pc(taylor, 2) + ' ' + (taylor > ff + 0.5 ? 'แปลว่าเฟดผ่อนคลายเกินไป มีแรงกดดันให้ขึ้น' : taylor < ff - 0.5 ? 'แปลว่าเฟดตึงเกินไป มีช่องให้ลด' : 'ใกล้เคียงระดับที่เหมาะสม') }] };
    }

    /* ---- yields */
    var y10 = mv('y10'), be5 = mv('be5');
    if(isNum(y10) && isNum(y2)){
      var fair10 = 0.5 * ((be5 || 2.3) + 1.0 + 0.6) + 0.5 * ((F.fed ? F.fed.r12 : y2) + 0.55), mom10 = wchg('y10', 13) || 0, sd10 = wsd('y10', 104) || 0.1;
      var fair2 = 0.6 * (F.fed ? F.fed.r12 : y2) + 0.4 * (isNum(taylor) ? clamp(taylor, 0, 8) : y2), mom2 = wchg('y2', 13) || 0, sd2 = wsd('y2', 104) || 0.1;
      var yf = function(now, fair, mom, sd, m){ var w = m * 4.33, v = now + (fair - now) * (1 - Math.pow(0.97, w)) + mom * 0.25 * Math.min(1, m / 6), b = sd * Math.sqrt(w); return { m:m, v:v, lo:v - b, hi:v + b, lo2:v - 2 * b, hi2:v + 2 * b }; };
      F.items.y10 = { k:'y10', name:{ en:'10-year Treasury yield', th:'บอนด์ยีลด์ 10 ปี' }, unit:'%', dec:2, now:y10, t:mac('y10').t, fc:fcPts(mac('y10').t, y10, [3, 6, 12].map(function(m){ return yf(y10, fair10, mom10, sd10, m); })), hist:histSince('y10', 4),
        basis:[{ en:'Fair value ≈ ' + pc(fair10, 2) + ': half building blocks (5y inflation ' + pc(be5, 2) + ' + 1.0 real + 0.6 term premium), half the expected Fed rate + a normal 0.55 slope.', th:'มูลค่าเหมาะสม ≈ ' + pc(fair10, 2) + ' ครึ่งหนึ่งมาจาก (เงินเฟ้อคาด 5 ปี ' + pc(be5, 2) + ' + ดอกเบี้ยจริง 1.0 + ค่าชดเชยระยะยาว 0.6) อีกครึ่งจากดอกเบี้ยเฟดที่คาด + ส่วนต่างปกติ 0.55' },
          { en:'Yields close about 3% of the gap to fair value per week; the last 13 weeks\' trend (' + sg(mom10, 2) + ' pt) adds momentum. Band = 2 years of weekly swings.', th:'ยีลด์ปิดช่องว่างกับมูลค่าเหมาะสมราว 3% ต่อสัปดาห์ บวกแรงส่งจากแนวโน้ม 13 สัปดาห์ (' + sg(mom10, 2) + ' จุด) ช่วงกว้างคิดจากความผันผวนรายสัปดาห์ 2 ปี' }] };
      F.items.y2 = { k:'y2', name:{ en:'2-year Treasury yield', th:'บอนด์ยีลด์ 2 ปี' }, unit:'%', dec:2, now:y2, t:mac('y2').t, fc:fcPts(mac('y2').t, y2, [3, 6, 12].map(function(m){ return yf(y2, fair2, mom2, sd2, m); })), hist:histSince('y2', 4),
        basis:[{ en:'Anchored to the expected Fed path (60%) and the Taylor-rule rate (40%): fair ≈ ' + pc(fair2, 2) + '.', th:'ยึดกับเส้นทางดอกเบี้ยเฟดที่คาด (60%) และกฎเทย์เลอร์ (40%) มูลค่าเหมาะสม ≈ ' + pc(fair2, 2) }] };
      F.fair10 = fair10; F.fair2 = fair2;
    }

    /* ---- jobs */
    var pay = mac('payrolls'), cl = mac('claims'), jo = mac('jolts');
    if(isNum(un)){
      var pay3 = E.growth.pay3, brk = 80, clTr = cl && cl.hist.length > 14 ? (mean(lastN(cl.hist, 4).map(function(p){ return p[1]; })) / mean(cl.hist.slice(-17, -13).map(function(p){ return p[1]; })) - 1) : 0;
      var joTr = jo && isNum(jo.m3) ? (jo.v / jo.m3 - 1) : 0, unMom = isNum(mac('unrate').m3) ? un - mac('unrate').m3 : 0;
      var dq = clamp(-(pay3 - brk) / 450 + clTr * 1.2 - joTr * 0.8 + unMom * 0.35, -0.4, 0.6);
      var uf = function(m){ var v = un + dq * (m / 3) * (m > 6 ? 0.8 : 1), b = 0.14 * Math.sqrt(m / 3); return { m:m, v:v, lo:v - b, hi:v + b, lo2:v - 2 * b, hi2:v + 2 * b }; };
      F.items.un = { k:'un', name:{ en:'Unemployment rate', th:'อัตราว่างงาน' }, unit:'%', dec:2, now:un, t:mac('unrate').t, fc:fcPts(mac('unrate').t, un, [uf(3), uf(6), uf(12)]), hist:histSince('unrate', 4),
        basis:[{ en:'Jobs added ' + f(pay3, 0) + 'k/month vs ~' + brk + 'k needed to keep unemployment flat → ' + (pay3 < brk ? 'not enough, rate drifts up.' : 'enough, rate holds or falls.'), th:'จ้างงานเพิ่ม ' + f(pay3, 0) + 'k ต่อเดือน เทียบกับราว ' + brk + 'k ที่ต้องมีเพื่อให้ว่างงานคงที่ → ' + (pay3 < brk ? 'ไม่พอ อัตราว่างงานมีแนวโน้มขยับขึ้น' : 'พอ อัตราว่างงานทรงหรือลดลง') },
          { en:'Weekly claims ' + spc(clTr * 100, 1) + ' vs a quarter ago; job openings ' + spc(joTr * 100, 1) + ' in 3 months.', th:'คนขอสวัสดิการว่างงาน ' + spc(clTr * 100, 1) + ' เทียบไตรมาสก่อน ตำแหน่งงานว่าง ' + spc(joTr * 100, 1) + ' ใน 3 เดือน' }] };
      F.jobs = { dq:dq, clTr:clTr, joTr:joTr };
    }

    /* ---- leading index + growth */
    var comp = [];
    function lc(name, val, z, txt){ if(isNum(z)) comp.push({ n:name, val:val, z:clamp(z, -2, 2), txt:txt }); }
    var pm = mac('permits'); lc({ en:'Building permits', th:'ใบอนุญาตก่อสร้าง' }, pm && f(pm.v, 0) + 'k', pm && isNum(pm.y1) ? (pm.v / pm.y1 - 1) * 10 : null);
    lc({ en:'Jobless claims (trend)', th:'คนขอสวัสดิการว่างงาน (แนวโน้ม)' }, cl && f(cl.v, 0) + 'k', F.jobs ? -F.jobs.clTr * 12 : null);
    var t3 = mv('t10y3m'); lc({ en:'Yield curve 10y−3m', th:'เส้นยีลด์ 10 ปี−3 เดือน' }, sg(t3, 2), isNum(t3) ? t3 / 0.8 : null);
    lc({ en:'Job openings', th:'ตำแหน่งงานว่าง' }, jo && f(jo.v, 1) + 'm', jo && isNum(jo.y1) ? (jo.v / jo.y1 - 1) * 8 : null);
    var se = mac('sent'); lc({ en:'Consumer sentiment', th:'ความเชื่อมั่นผู้บริโภค' }, se && f(se.v, 1), se && isNum(se.m3) ? (se.v - se.m3) / 4 + (se.v - 70) / 25 : null);
    lc({ en:'Credit spreads', th:'ส่วนต่างหุ้นกู้' }, pc(E.stress.hy, 2), isNum(E.stress.hy) ? (3.8 - E.stress.hy) / 0.8 - (E.stress.dhy || 0) * 2 : null);
    lc({ en:'Stock market trend', th:'แนวโน้มตลาดหุ้น' }, spc(mkt('spx') && mkt('spx').vs_ma200, 1), mkt('spx') ? mkt('spx').vs_ma200 / 5 : null);
    lc({ en:'Industrial output', th:'การผลิตอุตสาหกรรม' }, spc(mv('indpro'), 1), isNum(mv('indpro')) ? mv('indpro') / 2 : null);
    var lei = comp.length ? mean(comp.map(function(c){ return c.z; })) : 0;
    F.lei = { v:lei, comp:comp };
    var gn = mac('gdpnow'), gLast = mv('gdp');
    var gNow = gn && isNum(gn.v) ? gn.v : gLast;
    F.gdp = { now:gLast, nowcast:gNow, nowT:gn && gn.t, q1:clamp(0.5 * gNow + 0.5 * (2 + 1.6 * lei), -3, 6), q2:clamp(0.3 * gNow + 0.7 * (2 + 1.8 * lei), -3, 6) };

    /* ---- recession odds: NY Fed curve probit + jobs/credit */
    if(isNum(t3)){
      var nyf = Phi(-0.5333 - 0.6330 * t3) * 100;
      var cmp = logistic(-2.4 - 1.4 * lei + 3 * Math.max(0, (E.growth.sahm || 0) - 0.2) + 0.8 * Math.max(0, (E.stress.hy || 3) - 4) + (F.jobs && F.jobs.dq > 0.15 ? 0.6 : 0)) * 100;
      F.rec = { ny:nyf, cmp:cmp, p:0.5 * nyf + 0.5 * cmp };
      var th = mac('t10y3m');
      F.recHist = th ? th.hist.filter(function(p){ return tms(p[0]) > tms(th.t) - 6 * 365 * 864e5; }).map(function(p){ return [p[0], Phi(-0.5333 - 0.6330 * p[1]) * 100]; }) : [];
    }

    /* ---- markets: S&P cone from VIX, expected return from valuation + regime + trend */
    var spy = D.b && D.b.etf && D.b.etf.SPY, vix = E.stress.vix, cape = E.val.cape;
    if(spy && isNum(vix)){
      var last = spy.c[spy.c.length - 1], lt = spy.t[spy.t.length - 1];
      var ey = isNum(cape) ? 100 / cape : 4.5, infl = isNum(cv) ? cv : 2.5;
      var annual = ey + infl * 0.8 + (E.score - 50) / 50 * 6 + clamp((mkt('spx') && mkt('spx').m6) || 0, -20, 20) * 0.15;
      var cone = [1, 3, 6, 12].map(function(m){ var mu = annual * m / 12, sig = vix * Math.sqrt(m / 12); var v = last * (1 + mu / 100); return { m:m, v:v, lo:last * (1 + (mu - sig) / 100), hi:last * (1 + (mu + sig) / 100), lo2:last * (1 + (mu - 2 * sig) / 100), hi2:last * (1 + (mu + 2 * sig) / 100), mu:mu, sig:sig }; });
      F.spx = { last:last, t:lt, annual:annual, ey:ey, cone:cone };
      F.items.spx = { k:'spx', name:{ en:'S&P 500 (SPY)', th:'ดัชนี S&P 500 (SPY)' }, unit:'', dec:0, now:last, t:lt, fc:fcPts(lt, last, cone.slice(1)), hist:spy.t.map(function(t, i){ return [t, spy.c[i]]; }),
        basis:[{ en:'Expected return ≈ ' + f(annual, 1) + '% a year: earnings yield ' + f(ey, 1) + '% (1/CAPE) + inflation + regime score ' + Math.round(E.score) + ' + 6-month trend.', th:'ผลตอบแทนคาด ≈ ' + f(annual, 1) + '% ต่อปี = อัตราผลตอบแทนกำไร ' + f(ey, 1) + '% (1/CAPE) + เงินเฟ้อ + คะแนนสภาวะ ' + Math.round(E.score) + ' + แนวโน้ม 6 เดือน' },
          { en:'Range from the options market: VIX ' + f(vix, 1) + ' means a typical ±' + f(vix * Math.sqrt(0.25), 1) + '% move over 3 months (68% band), ±' + f(2 * vix * Math.sqrt(0.25), 1) + '% (95%).', th:'ช่วงคาดการณ์จากตลาดออปชัน: VIX ' + f(vix, 1) + ' แปลว่าใน 3 เดือนมักแกว่ง ±' + f(vix * Math.sqrt(0.25), 1) + '% (โอกาส 68%) และ ±' + f(2 * vix * Math.sqrt(0.25), 1) + '% (95%)' }] };
    }

    /* ---- oil, dollar, baht: trend + pull back toward the 3-year average */
    function mr(k, name, unit, dec, years, pull, momW, basisFn){
      var s = mac(k); if(!s) return null;
      var h3 = histSince(k, years).map(function(p){ return p[1]; }), avg = mean(h3), mom = s.m3 != null ? s.v - s.m3 : 0;
      var rets = []; var hh = lastN(s.hist, 105); for(var i = 1; i < hh.length; i++) rets.push(Math.log(hh[i][1] / hh[i - 1][1]));
      var vol = std(rets) * Math.sqrt(52);
      var steps = [3, 6, 12].map(function(m){ var v = s.v + (avg - s.v) * pull * m / 12 + mom * momW * Math.min(1, m / 6), sg2 = vol * Math.sqrt(m / 12); return { m:m, v:v, lo:v * Math.exp(-sg2), hi:v * Math.exp(sg2), lo2:v * Math.exp(-2 * sg2), hi2:v * Math.exp(2 * sg2) }; });
      return { k:k, name:name, unit:unit, dec:dec, now:s.v, t:s.t, fc:fcPts(s.t, s.v, steps), hist:histSince(k, 4), avg:avg, vol:vol * 100, basis:basisFn(avg, mom, vol * 100) };
    }
    F.items.oil = mr('oil', { en:'Crude oil (WTI)', th:'น้ำมันดิบ WTI' }, '$', 1, 3, 0.45, 0.25, function(avg, mom, vol){ return [{ en:'3-year average $' + f(avg, 0) + '; oil tends to drift back toward it (about 45% of the gap a year), while the last 3 months\' move (' + sg(mom, 1) + ') carries some momentum.', th:'ค่าเฉลี่ย 3 ปี $' + f(avg, 0) + ' น้ำมันมักค่อยๆ กลับหาค่าเฉลี่ย (ราว 45% ของช่องว่างต่อปี) ส่วนการขยับ 3 เดือนล่าสุด (' + sg(mom, 1) + ') ยังมีแรงส่งอยู่บ้าง' }, { en:'Range from oil\'s own volatility (' + f(vol, 0) + '% a year).', th:'ช่วงกว้างคิดจากความผันผวนของน้ำมันเอง (' + f(vol, 0) + '% ต่อปี)' }]; });
    var dxyM = mkt('dxy');
    if(dxyM){
      var dfc = [3, 6, 12].map(function(m){ var trend = (dxyM.m3 || 0) * 0.35 * Math.min(1, m / 6), rate = ((F.items.y2 ? F.items.y2.fc[1].v : y2) - y2) * 1.5, v = dxyM.price * (1 + (trend + rate * m / 6) / 100), sg2 = (dxyM.vol20 || 6) * Math.sqrt(m / 12) / 100; return { m:m, v:v, lo:v * (1 - sg2), hi:v * (1 + sg2), lo2:v * (1 - 2 * sg2), hi2:v * (1 + 2 * sg2) }; });
      F.dxy = { now:dxyM.price, fc:dfc };
      var thb = D.m.ccy && D.m.ccy.THB;
      if(thb){
        var tfc = dfc.map(function(q){ var dpct = (q.v / dxyM.price - 1) * 100, v = thb.rate * (1 + dpct * 0.55 / 100), sg2 = 0.055 * Math.sqrt(q.m / 12); return { m:q.m, v:v, lo:v * (1 - sg2), hi:v * (1 + sg2) }; });
        F.thb = { now:thb.rate, fc:tfc };
      }
    }

    /* ---- where money goes next: momentum, acceleration, trend, phase fit */
    var all = [].concat((D.m.flows.asset || []).map(function(a){ a._g = 'asset'; return a; }), (D.m.flows.sector || []).map(function(a){ a._g = 'sector'; return a; }), (D.m.flows.country || []).map(function(a){ a._g = 'country'; return a; }));
    var seen = {}, ph = PHASES[E.phase];
    var rows = all.filter(function(a){ if(seen[a.sym] || a.sym === '^VIX' || !isNum(a.m1) || !isNum(a.m3)) return false; seen[a.sym] = 1; return true; }).map(function(a){
      var accel = a.m1 - a.m3 / 3, fit = ph.etf.indexOf(a.sym) >= 0 ? 1 : ph.avoid.indexOf(a.sym) >= 0 ? -1 : 0;
      var sc = 0.35 * clamp(a.m1 / 4, -2, 2) + 0.3 * clamp(accel / 3, -2, 2) + 0.2 * (a.above_ma200 ? 1 : -1) + 0.1 * clamp((a.vol_ratio || 1) - 1, -1, 1) * Math.sign(a.m1) + 0.15 * fit;
      return { sym:a.sym, n:L() === 'th' ? a.th : a.en, g:a._g, m1:a.m1, m3:a.m3, w1:a.w1, accel:accel, sc:sc };
    }).sort(function(a, b){ return b.sc - a.sc; });
    F.flowIn = rows.slice(0, 7); F.flowOut = rows.slice(-7).reverse();

    /* ---- expected 6-month return by asset: carry + rate change + equity model */
    var ex = [];
    var y10f = F.items.y10 ? F.items.y10.fc[1].v : y10, y2f = F.items.y2 ? F.items.y2.fc[1].v : y2;
    function bond(sym, yld, dur, dy){ ex.push({ sym:sym, r:yld / 2 - dur * dy, vol:dur * (wsd('y10', 104) || 0.1) * Math.sqrt(26), how:{ en:'half-year yield ' + f(yld / 2, 2) + '% − duration ' + dur + ' × yield change ' + sg(dy, 2), th:'ดอกเบี้ยครึ่งปี ' + f(yld / 2, 2) + '% − ดูเรชัน ' + dur + ' × ยีลด์เปลี่ยน ' + sg(dy, 2) } }); }
    if(isNum(bill)) ex.push({ sym:'SHV', r:((F.fed ? (F.fed.now + F.fed.r6) / 2 : bill)) / 2, vol:0.3, how:{ en:'cash earns the expected Fed rate', th:'เงินสดได้ดอกเบี้ยตามดอกเบี้ยเฟดที่คาด' }, name:{ en:'Cash / T-bills', th:'เงินสด/ตั๋วเงินคลัง' } });
    if(isNum(y2)) bond('SHY', y2, 1.9, y2f - y2);
    if(isNum(y10)) bond('IEF', y10 - 0.15, 7.3, y10f - y10);
    if(isNum(y10)) bond('TLT', (mkt('us30y') ? mkt('us30y').price : y10 + 0.3), 16, (y10f - y10) * 0.85);
    if(F.spx){
      var base6 = F.spx.annual / 2, phB = { recovery:{ QQQ:2, IWM:2.5, EEM:1.5, THD:1, EFA:0.5 }, overheat:{ QQQ:-1.5, IWM:0.5, EEM:1, THD:0.5, EFA:0.5, XLE:3, DBC:3, XLB:2 }, stagflation:{ QQQ:-2.5, IWM:-2.5, EEM:-2, THD:-1.5, EFA:-1, XLV:1.5, XLP:1.5, GLD:3, DBC:1 }, reflation:{ QQQ:0, IWM:-1.5, EEM:-1, THD:-0.5, XLV:1, XLP:1, GLD:1.5, DBC:-2 } }[E.phase];
      var dxF = F.dxy ? (F.dxy.fc[1].v / F.dxy.now - 1) * 100 : 0;
      [['SPY', 1, 0], ['QQQ', 1.15, 0], ['IWM', 1.2, 0], ['EFA', 0.85, -0.5], ['EEM', 1.0, -1], ['THD', 0.8, -1.2], ['XLV', 0.7, 0], ['XLP', 0.6, 0], ['XLE', 0.9, 0]].forEach(function(r){
        var fl = flow(r[0]) || {}, mom = clamp((fl.m3 || 0), -15, 15) * 0.12;
        var v = base6 * r[1] + ((phB && phB[r[0]]) || 0) + mom + r[2] * dxF * 0.6, vol = (fl.vol20 || 18) * Math.sqrt(0.5);
        ex.push({ sym:r[0], r:v, vol:vol, how:{ en:'S&P model ' + f(base6, 1) + '% × beta ' + r[1] + ', phase ' + sg((phB && phB[r[0]]) || 0, 1) + ', trend ' + sg(mom, 1) + (r[2] ? ', dollar ' + sg(r[2] * dxF * 0.6, 1) : ''), th:'โมเดล S&P ' + f(base6, 1) + '% × เบต้า ' + r[1] + ' ช่วงเศรษฐกิจ ' + sg((phB && phB[r[0]]) || 0, 1) + ' แนวโน้ม ' + sg(mom, 1) + (r[2] ? ' ดอลลาร์ ' + sg(r[2] * dxF * 0.6, 1) : '') } });
      });
      var g = flow('GLD') || {}, realF = (mv('real10') || 2) + ((y10f - y10) - 0) * 0.6, gr = clamp(g.m3 || 0, -15, 15) * 0.15 - ((realF - (mv('real10') || 2)) * 6) + ((phB && phB.GLD) || 0) + 2;
      ex.push({ sym:'GLD', r:gr, vol:(g.vol20 || 15) * Math.sqrt(0.5), how:{ en:'trend + falling/rising real yields + phase', th:'แนวโน้ม + ยีลด์จริงที่คาดว่าจะขึ้น/ลง + ช่วงเศรษฐกิจ' } });
      var o = F.items.oil; if(o){ var dbc = flow('DBC') || {}; ex.push({ sym:'DBC', r:(o.fc[1].v / o.now - 1) * 100 * 0.5 + ((phB && phB.DBC) || 0), vol:(dbc.vol20 || 18) * Math.sqrt(0.5), how:{ en:'half the oil forecast + phase', th:'ครึ่งหนึ่งของคาดการณ์น้ำมัน + ช่วงเศรษฐกิจ' } }); }
    }
    ex.forEach(function(e){ e.ratio = e.r / Math.max(0.5, e.vol); e.I = info(e.sym); });
    F.exp = ex.sort(function(a, b){ return b.r - a.r; });
    return F;
  }

  /* ============================================================ SUMMARY + FORECAST VIEWS */
  var F_last = null;
  function arrow(d, thr){ thr = thr || 0.05; return !isNum(d) ? '' : d > thr ? '<i class="bz-ar up">▲</i>' : d < -thr ? '<i class="bz-ar dn">▼</i>' : '<i class="bz-ar fl">▶</i>'; }
  function fcAt(it, m){ if(!it || !it.fc) return null; for(var i = 0; i < it.fc.length; i++) if(it.fc[i].m === m) return it.fc[i]; return null; }
  function fanMini(it, color){
    if(!it || !it.hist || it.hist.length < 3) return '';
    var h = lastN(it.hist, 40).map(function(p){ return [tms(p[0]), p[1]]; }), fc = it.fc.map(function(q){ return [tms(q.t), q.v, q.lo, q.hi]; });
    var xs = h.map(function(p){ return p[0]; }).concat(fc.map(function(p){ return p[0]; })), ys = [];
    h.forEach(function(p){ ys.push(p[1]); }); fc.forEach(function(p){ ys.push(p[1], p[2], p[3]); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys.filter(isNum)), y1 = Math.max.apply(null, ys.filter(isNum)), W = 220, H = 64;
    var X = function(x){ return 2 + (x - x0) / (x1 - x0 || 1) * (W - 4); }, Y = function(v){ return 4 + (1 - (v - y0) / (y1 - y0 || 1)) * (H - 8); };
    var lp = h[h.length - 1], d = h.map(function(p, i){ return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('');
    var band = [[lp[0], lp[1], lp[1]]].concat(fc.map(function(q){ return [q[0], q[2], q[3]]; }));
    var bp = 'M' + band.map(function(b){ return X(b[0]).toFixed(1) + ' ' + Y(b[2]).toFixed(1); }).join('L') + 'L' + band.slice().reverse().map(function(b){ return X(b[0]).toFixed(1) + ' ' + Y(b[1]).toFixed(1); }).join('L') + 'Z';
    var fl = 'M' + X(lp[0]).toFixed(1) + ' ' + Y(lp[1]).toFixed(1) + fc.map(function(q){ return 'L' + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join('');
    return '<svg class="bz-fan" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><rect x="' + X(lp[0]).toFixed(1) + '" y="0" width="' + (W - X(lp[0])).toFixed(1) + '" height="' + H + '" class="bz-fz"/><path d="' + bp + '" fill="' + color + '" opacity=".22"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2"/><path d="' + fl + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="4 4"/></svg>';
  }
  function fcCard(it, color, tone2){
    if(!it) return '';
    var a = fcAt(it, 3), b = fcAt(it, 6), c = fcAt(it, 12), d = b ? b.v - it.now : 0, u = it.unit === '%' ? '%' : '', pre = it.unit === '$' ? '$' : '';
    return '<button type="button" class="bz-fcc ' + (tone2 || '') + '" data-go="fc"><div class="bz-fch"><span>' + esc(T(it.name)) + '</span>' + arrow(d, Math.abs(it.now) * 0.01) + '</div>' +
      '<div class="bz-fcv"><b>' + pre + f(it.now, it.dec) + u + '</b><span>→</span><b class="nx">' + pre + f(b ? b.v : null, it.dec) + u + '</b><em>' + esc(T({ en:'in 6m', th:'ใน 6 เดือน' })) + '</em></div>' + fanMini(it, color) +
      '<div class="bz-fcs"><span>3M ' + pre + f(a && a.v, it.dec) + u + '</span><span>12M ' + pre + f(c && c.v, it.dec) + u + '</span><span class="rg">' + pre + f(b && b.lo, it.dec) + '–' + f(b && b.hi, it.dec) + u + '</span></div></button>';
  }
  function impact(k, E, F){
    var it = F.items[k], b = fcAt(it, 6), d = b && it ? b.v - it.now : 0;
    var M = {
      core:d > 0.15 ? [-1, { en:'hotter prices keep rates high — bad for expensive growth stocks', th:'ของแพงขึ้นทำให้ดอกเบี้ยสูงนาน ไม่ดีกับหุ้นเติบโตราคาแพง' }] : d < -0.15 ? [1, { en:'cooling prices give the Fed room — good for stocks and bonds', th:'เงินเฟ้อเย็นลงเปิดทางให้เฟด ดีต่อหุ้นและบอนด์' }] : [0, { en:'little change in the rate outlook', th:'มุมมองดอกเบี้ยไม่ค่อยเปลี่ยน' }],
      ff:d > 0.12 ? [-1, { en:'tighter money — valuations under pressure', th:'เงินตึงขึ้น ราคาหุ้นถูกกดดัน' }] : d < -0.12 ? [1, { en:'easier money supports valuations', th:'เงินผ่อนคลายขึ้น ช่วยหนุนราคาหุ้น' }] : [0, { en:'policy steady', th:'นโยบายทรงตัว' }],
      y10:d > 0.15 ? [-1, { en:'higher discount rate weighs on stocks and real estate', th:'ยีลด์สูงขึ้นกดดันหุ้นและอสังหาฯ' }] : d < -0.15 ? [1, { en:'falling yields lift bonds, growth stocks and REITs', th:'ยีลด์ลงช่วยบอนด์ หุ้นเติบโต และอสังหาฯ' }] : [0, { en:'yields range-bound', th:'ยีลด์แกว่งในกรอบ' }],
      un:d > 0.15 ? [-1, { en:'weaker jobs → weaker spending and profits', th:'การจ้างงานแย่ลง → การใช้จ่ายและกำไรแย่ลง' }] : d < -0.1 ? [1, { en:'tight labour market supports spending', th:'ตลาดแรงงานแน่นช่วยการใช้จ่าย' }] : [0, { en:'labour market stable', th:'ตลาดแรงงานทรงตัว' }],
      oil:d / (it ? it.now : 1) > 0.08 ? [-1, { en:'costlier energy squeezes consumers and Thailand', th:'พลังงานแพงขึ้นกดกำลังซื้อและไม่ดีต่อไทย' }] : d / (it ? it.now : 1) < -0.08 ? [1, { en:'cheaper energy helps consumers and Thailand', th:'พลังงานถูกลงช่วยผู้บริโภคและไทย' }] : [0, { en:'energy neutral', th:'พลังงานไม่ส่งผลมาก' }],
      cpi:d > 0.2 ? [-1, { en:'headline prices rising again — squeezes consumers', th:'ราคาสินค้าทั่วไปกลับมาเร่ง กดกำลังซื้อผู้บริโภค' }] : d < -0.2 ? [1, { en:'headline relief for consumers', th:'ค่าครองชีพเบาลง ดีต่อผู้บริโภค' }] : [0, { en:'headline inflation steady', th:'เงินเฟ้อทั่วไปทรงตัว' }],
      y2:d > 0.15 ? [-1, { en:'market pricing a tighter Fed', th:'ตลาดเริ่มคาดว่าเฟดจะตึงขึ้น' }] : d < -0.15 ? [1, { en:'market pricing an easier Fed', th:'ตลาดเริ่มคาดว่าเฟดจะผ่อนคลาย' }] : [0, { en:'Fed expectations stable', th:'ความคาดหวังต่อเฟดทรงตัว' }],
      spx:d > 0 ? [1, { en:'positive expected drift', th:'แนวโน้มคาดเป็นบวก' }] : [-1, { en:'negative expected drift', th:'แนวโน้มคาดเป็นลบ' }]
    };
    return M[k] || [0, { en:'', th:'' }];
  }
  function sumRow(name, now, d3, f3, f12, basis, imp, tabGo){
    var tn = imp[0] > 0 ? 'good' : imp[0] < 0 ? 'bad' : 'mid';
    return '<tr data-go="' + (tabGo || 'fc') + '"><td><b>' + esc(T(name)) + '</b></td><td class="v">' + now + '</td><td class="v">' + d3 + '</td><td class="v nx">' + f3 + '</td><td class="v nx">' + f12 + '</td><td class="bs">' + esc(T(basis)) + '</td><td class="im ' + tn + '"><i></i>' + esc(T(imp[1])) + '</td></tr>';
  }
  function vSum(E, F){
    var ph = PHASES[E.phase], core = F.items.core, ff = F.items.ff, y10 = F.items.y10, un = F.items.un, spx = F.items.spx, oil = F.items.oil;
    var c6 = fcAt(core, 6), f12 = fcAt(ff, 12), y6 = fcAt(y10, 6), u6 = fcAt(un, 6), s6 = fcAt(spx, 6);
    var best = F.exp.slice(0, 3), worst = F.exp.slice(-2);
    var nm = function(e){ return e.I ? e.sym : T(e.name); };
    var fwd = {
      en:'Next 3–6 months: core inflation heads to ' + pc(c6 && c6.v, 1) + ', the Fed path ends the year near ' + pc(f12 && f12.v, 2) + (F.fed ? ' (' + (F.fed.moves > 0 ? F.fed.moves + ' hike(s) priced' : F.fed.moves < 0 ? Math.abs(F.fed.moves) + ' cut(s) priced' : 'no change priced') + ')' : '') + ', the 10-year settles around ' + pc(y6 && y6.v, 2) + ', unemployment ' + pc(u6 && u6.v, 1) + '. Growth next quarter ≈ ' + pc(F.gdp.q1, 1) + '; 12-month recession odds ' + f(F.rec && F.rec.p, 0) + '%.',
      th:'3–6 เดือนข้างหน้า: เงินเฟ้อพื้นฐานไปทาง ' + pc(c6 && c6.v, 1) + ' ดอกเบี้ยเฟดปลายปีราว ' + pc(f12 && f12.v, 2) + (F.fed ? ' (' + (F.fed.moves > 0 ? 'ตลาดคาดขึ้น ' + F.fed.moves + ' ครั้ง' : F.fed.moves < 0 ? 'ตลาดคาดลด ' + Math.abs(F.fed.moves) + ' ครั้ง' : 'ตลาดคาดคงที่') + ')' : '') + ' บอนด์ 10 ปีราว ' + pc(y6 && y6.v, 2) + ' ว่างงาน ' + pc(u6 && u6.v, 1) + ' GDP ไตรมาสหน้าราว ' + pc(F.gdp.q1, 1) + ' โอกาสถดถอยใน 12 เดือน ' + f(F.rec && F.rec.p, 0) + '%'
    };
    var act = {
      en:'Best expected 6-month returns: ' + best.map(function(e){ return nm(e) + ' ' + spc(e.r, 1); }).join(', ') + '. Weakest: ' + worst.map(function(e){ return nm(e) + ' ' + spc(e.r, 1); }).join(', ') + '. Money is flowing into ' + F.flowIn.slice(0, 3).map(function(r){ return r.sym; }).join(', ') + ' and out of ' + F.flowOut.slice(0, 3).map(function(r){ return r.sym; }).join(', ') + '.',
      th:'ผลตอบแทนคาด 6 เดือนดีสุด: ' + best.map(function(e){ return nm(e) + ' ' + spc(e.r, 1); }).join(' · ') + ' อ่อนสุด: ' + worst.map(function(e){ return nm(e) + ' ' + spc(e.r, 1); }).join(' · ') + ' เงินกำลังไหลเข้า ' + F.flowIn.slice(0, 3).map(function(r){ return r.sym; }).join(', ') + ' และไหลออกจาก ' + F.flowOut.slice(0, 3).map(function(r){ return r.sym; }).join(', ')
    };
    var h = '<div class="bz-verdict"><div class="bz-vl">' + ico(E.weather.k, 'bz-wxi') + '<div><span>' + esc(T({ en:'Market score', th:'คะแนนตลาด' })) + '</span><b>' + Math.round(E.score) + '</b><em>' + esc(T(E.weather.w)) + '</em></div></div>' +
      '<div class="bz-vt"><div class="bz-vrow"><h6>' + ico('eye') + esc(T({ en:'Now', th:'ตอนนี้' })) + '</h6><p>' + esc(T(E.head)) + '</p></div>' +
      '<div class="bz-vrow"><h6>' + ico('radar') + esc(T({ en:'Ahead', th:'ข้างหน้า' })) + '</h6><p>' + esc(T(fwd)) + '</p></div>' +
      '<div class="bz-vrow"><h6>' + ico('compass') + esc(T({ en:'Positioning', th:'การจัดพอร์ต' })) + '</h6><p>' + esc(T(act)) + '</p></div></div></div>';
    h += '<div class="bz-fcgrid">' + fcCard(core, '#f472b6') + fcCard(F.items.cpi, '#fb7185') + fcCard(ff, '#fbbf24') + fcCard(F.items.y2, '#22d3ee') + fcCard(y10, '#a78bfa') + fcCard(un, '#34d399') + fcCard(oil, '#f97316') + fcCard(spx, '#60a5fa') + '</div>';
    var rows = '';
    var g = F.gdp;
    rows += sumRow({ en:'Economy (GDP)', th:'เศรษฐกิจ (GDP)' }, pc(g.now, 1), esc(T({ en:'nowcast ', th:'ประมาณการสด ' })) + pc(g.nowcast, 1), pc(g.q1, 1), pc(g.q2, 1), { en:'GDPNow + leading index ' + sg(F.lei.v, 2), th:'GDPNow + ดัชนีชี้นำ ' + sg(F.lei.v, 2) }, F.lei.v > 0.2 ? [1, { en:'expansion continuing', th:'เศรษฐกิจยังขยายตัว' }] : F.lei.v < -0.3 ? [-1, { en:'leading signals point to slowing', th:'ตัวชี้นำบอกว่าจะชะลอ' }] : [0, { en:'moderate growth', th:'โตปานกลาง' }]);
    function itRow(k, name, basis){ var it = F.items[k]; if(!it) return ''; var a = fcAt(it, 3), c = fcAt(it, 12), u = it.unit === '%' ? '%' : '', pre = it.unit === '$' ? '$' : ''; var s = mac(k === 'core' ? 'core_pce' : k === 'un' ? 'unrate' : k); var d3 = s && isNum(s.m3) ? it.now - s.m3 : null;
      rows += sumRow(name, pre + f(it.now, it.dec) + u, arrow(d3, 0.03) + ' ' + (isNum(d3) ? sg(d3, it.dec) : ''), pre + f(a && a.v, it.dec) + u, pre + f(c && c.v, it.dec) + u, basis, impact(k, E, F)); }
    itRow('un', { en:'Jobs (unemployment)', th:'การจ้างงาน (ว่างงาน)' }, { en:'payroll gap, claims, openings', th:'จ้างงานเทียบจุดคุ้มทุน คนขอสวัสดิการ ตำแหน่งงานว่าง' });
    itRow('core', { en:'Inflation (core PCE)', th:'เงินเฟ้อ (Core PCE)' }, { en:'index momentum + base effects', th:'แรงส่งดัชนีราคา + ฐานเปรียบเทียบ' });
    itRow('cpi', { en:'Inflation (CPI)', th:'เงินเฟ้อ (CPI)' }, { en:'momentum + oil pass-through', th:'แรงส่ง + ผลจากราคาน้ำมัน' });
    itRow('ff', { en:'Fed policy rate', th:'ดอกเบี้ยนโยบายเฟด' }, { en:'T-bill + 2y pricing, Taylor rule', th:'ราคาตั๋วเงินคลัง + บอนด์ 2 ปี และกฎเทย์เลอร์' });
    itRow('y2', { en:'2-year yield', th:'บอนด์ยีลด์ 2 ปี' }, { en:'Fed path + Taylor anchor', th:'เส้นทางเฟด + กฎเทย์เลอร์' });
    itRow('y10', { en:'10-year yield', th:'บอนด์ยีลด์ 10 ปี' }, { en:'fair value ' + pc(F.fair10, 2) + ' + trend', th:'มูลค่าเหมาะสม ' + pc(F.fair10, 2) + ' + แนวโน้ม' });
    var cs = mv('t10y2y'), csF = F.items.y10 && F.items.y2 ? fcAt(F.items.y10, 6).v - fcAt(F.items.y2, 6).v : null;
    rows += sumRow({ en:'Yield curve (10y−2y)', th:'เส้นยีลด์ (10 ปี−2 ปี)' }, sg(cs, 2), arrow(mchg('t10y2y', 'm3'), 0.05), sg(F.items.y10 && F.items.y2 ? fcAt(F.items.y10, 3).v - fcAt(F.items.y2, 3).v : null, 2), sg(F.items.y10 && F.items.y2 ? fcAt(F.items.y10, 12).v - fcAt(F.items.y2, 12).v : null, 2), { en:'difference of the two yield forecasts', th:'ส่วนต่างของคาดการณ์ยีลด์ทั้งสอง' }, csF > cs + 0.1 ? [0, { en:'steepening — watch for late-cycle signals', th:'ชันขึ้น ระวังสัญญาณปลายวัฏจักร' }] : csF < 0 ? [-1, { en:'re-inversion would warn of recession', th:'ถ้ากลับหัวอีกเป็นสัญญาณเตือนถดถอย' }] : [0, { en:'stable shape', th:'รูปร่างคงที่' }]);
    if(F.dxy){ var d3x = fcAt({ fc:F.dxy.fc }, 3), d12 = fcAt({ fc:F.dxy.fc }, 12); rows += sumRow({ en:'US dollar (DXY)', th:'ดอลลาร์ (DXY)' }, f(F.dxy.now, 1), arrow(mkt('dxy').m1, 0.5) + ' ' + spc(mkt('dxy').m1, 1), f(d3x.v, 1), f(d12.v, 1), { en:'trend + rate differential', th:'แนวโน้ม + ส่วนต่างดอกเบี้ย' }, d12.v > F.dxy.now * 1.01 ? [-1, { en:'strong dollar drains emerging markets', th:'ดอลลาร์แข็งดึงเงินออกจากตลาดเกิดใหม่' }] : d12.v < F.dxy.now * 0.99 ? [1, { en:'weaker dollar helps EM and Thailand', th:'ดอลลาร์อ่อนช่วยตลาดเกิดใหม่และไทย' }] : [0, { en:'dollar steady', th:'ดอลลาร์ทรงตัว' }], 'fx'); }
    if(F.thb){ var t3x = fcAt({ fc:F.thb.fc }, 3), t12 = fcAt({ fc:F.thb.fc }, 12); rows += sumRow({ en:'Baht (per $)', th:'เงินบาท (ต่อ $)' }, f(F.thb.now, 2), arrow(-(reg('thb_1m') || 0), 0.5), f(t3x.v, 2), f(t12.v, 2), { en:'follows the dollar (β≈0.55)', th:'ขยับตามดอลลาร์ (เบต้า ≈ 0.55)' }, t12.v > F.thb.now * 1.01 ? [0, { en:'weaker baht: exporters gain, importers pay more', th:'บาทอ่อน: ผู้ส่งออกได้ ผู้นำเข้าจ่ายแพงขึ้น' }] : [0, { en:'baht stable to firmer', th:'บาททรงตัวถึงแข็งขึ้น' }], 'fx'); }
    itRow('oil', { en:'Oil (WTI)', th:'น้ำมัน (WTI)' }, { en:'3-year mean reversion + trend', th:'กลับหาค่าเฉลี่ย 3 ปี + แนวโน้ม' });
    var gx = F.exp.filter(function(e){ return e.sym === 'GLD'; })[0]; if(gx) rows += sumRow({ en:'Gold', th:'ทองคำ' }, spc(flow('GLD') && flow('GLD').m1, 1) + ' 1M', arrow(flow('GLD') && flow('GLD').m3, 1), '', spc(gx.r, 1) + ' / 6M', { en:'real-yield direction + trend', th:'ทิศทางยีลด์จริง + แนวโน้ม' }, gx.r > 2 ? [1, { en:'supportive backdrop', th:'ปัจจัยหนุน' }] : gx.r < -1 ? [-1, { en:'headwind from real yields', th:'ยีลด์จริงเป็นแรงต้าน' }] : [0, { en:'neutral', th:'กลางๆ' }], 'fx');
    itRow('spx', { en:'US stocks (S&P 500)', th:'หุ้นสหรัฐฯ (S&P 500)' }, { en:'earnings yield + regime + VIX range', th:'อัตราผลตอบแทนกำไร + สภาวะ + ช่วงจาก VIX' });
    var thd = F.exp.filter(function(e){ return e.sym === 'THD'; })[0]; if(thd) rows += sumRow({ en:'Thai stocks (THD)', th:'หุ้นไทย (THD)' }, spc(flow('THD') && flow('THD').m1, 1) + ' 1M', arrow(flow('THD') && flow('THD').m3, 1), '', spc(thd.r, 1) + ' / 6M', { en:'S&P model × 0.8 + dollar + phase', th:'โมเดล S&P × 0.8 + ดอลลาร์ + ช่วงเศรษฐกิจ' }, thd.r > 3 ? [1, { en:'tailwinds', th:'มีแรงหนุน' }] : thd.r < 0 ? [-1, { en:'headwinds', th:'มีแรงต้าน' }] : [0, { en:'mixed', th:'ปนกัน' }], 'rot');
    if(F.rec) rows += sumRow({ en:'Recession risk (12m)', th:'ความเสี่ยงถดถอย (12 เดือน)' }, f(F.rec.p, 0) + '%', '', '', 'NY Fed ' + f(F.rec.ny, 0) + '%', { en:'curve probit + jobs/credit model', th:'โมเดลเส้นยีลด์ + โมเดลการจ้างงาน/หุ้นกู้' }, F.rec.p > 35 ? [-1, { en:'elevated', th:'สูง' }] : F.rec.p < 20 ? [1, { en:'low', th:'ต่ำ' }] : [0, { en:'moderate', th:'ปานกลาง' }], 'growth');
    h += '<div class="bz-sec bz-sumt"><h4>' + ico('layers') + esc(T({ en:'Everything in one table — now, direction, forecast, what it is measured from, what it means', th:'ทุกอย่างในตารางเดียว — ตอนนี้ ทิศทาง คาดการณ์ วัดจากอะไร และแปลว่าอะไร' })) + '</h4><div class="bz-tw"><table class="bz-sum"><thead><tr><th></th><th>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</th><th>' + esc(T({ en:'3M change', th:'เปลี่ยน 3 เดือน' })) + '</th><th>' + esc(T({ en:'In 3M', th:'อีก 3 เดือน' })) + '</th><th>' + esc(T({ en:'In 12M', th:'อีก 12 เดือน' })) + '</th><th>' + esc(T({ en:'Measured from', th:'วัดจาก' })) + '</th><th>' + esc(T({ en:'For stocks', th:'ผลต่อหุ้น' })) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    h += '<div class="bz-two">' + expBlock(F) + flowBlock(F) + '</div>';
    return h;
  }
  function expBlock(F){
    var mx = Math.max.apply(null, F.exp.map(function(e){ return Math.abs(e.r) + e.vol * 0.6; })) || 1;
    return '<div class="bz-sec"><h4>' + ico('star') + esc(T({ en:'Where to lean: expected 6-month return by asset', th:'ควรเอียงไปทางไหน: ผลตอบแทนคาด 6 เดือนของแต่ละสินทรัพย์' })) + '</h4><div class="bz-exp">' + F.exp.map(function(e, i){
      var w = Math.abs(e.r) / mx * 50, rw = e.vol * 0.6 / mx * 50;
      return '<div class="bz-er' + (i < 3 ? ' top' : '') + '" title="' + esc(T(e.how)) + '"><span class="n"><b>' + esc(e.sym) + '</b><em>' + esc(e.I ? e.I.n : T(e.name)) + '</em><small>' + esc(T({ en:'return/risk ', th:'ผลตอบแทน/ความเสี่ยง ' })) + f(e.ratio, 2) + '</small></span><span class="t"><u style="left:' + (50 + (e.r - e.vol * 0.6) / mx * 50).toFixed(1) + '%;width:' + (rw * 2).toFixed(1) + '%"></u><i class="' + (e.r >= 0 ? 'up' : 'dn') + '" style="' + (e.r >= 0 ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%"></i></span><b class="' + (e.r >= 0 ? 'up' : 'dn') + '">' + spc(e.r, 1) + '</b></div>';
    }).join('') + '</div><p class="bz-note">' + esc(T({ en:'Bar = model expectation; faint band = typical ±range. Hover a row for how it was built.', th:'แท่ง = ค่าคาดการณ์ของโมเดล แถบจาง = ช่วงแกว่งปกติ ชี้ที่แถวเพื่อดูวิธีคิด' })) + '</p></div>';
  }
  function flowBlock(F){
    var li = function(r, dir){ return '<li class="' + dir + '"><b>' + esc(r.sym) + '</b><span>' + esc(r.n) + '</span><em>1W ' + spc(r.w1, 1) + ' · 1M ' + spc(r.m1, 1) + ' · ' + esc(T({ en:'accel ', th:'เร่ง ' })) + sg(r.accel, 1) + '</em><i style="width:' + clamp(Math.abs(r.sc) * 60, 6, 100).toFixed(0) + '%"></i></li>'; };
    return '<div class="bz-sec"><h4>' + ico('swap') + esc(T({ en:'Where money is going next', th:'เงินกำลังจะไหลไปไหนต่อ' })) + '</h4><div class="bz-flow"><div><h6 class="up">' + esc(T({ en:'Flowing in', th:'ไหลเข้า' })) + '</h6><ul>' + F.flowIn.map(function(r){ return li(r, 'up'); }).join('') + '</ul></div><div><h6 class="dn">' + esc(T({ en:'Flowing out', th:'ไหลออก' })) + '</h6><ul>' + F.flowOut.map(function(r){ return li(r, 'dn'); }).join('') + '</ul></div></div>' +
      '<p class="bz-note">' + esc(T({ en:'Score = 1-month strength + acceleration (1M vs the 3M pace) + trend + volume + phase fit, across asset classes, sectors and countries.', th:'คะแนน = ความแรง 1 เดือน + การเร่งตัว (1 เดือนเทียบความเร็ว 3 เดือน) + แนวโน้ม + ปริมาณซื้อขาย + ความเข้ากับช่วงเศรษฐกิจ ครอบคลุมสินทรัพย์ กลุ่มหุ้น และประเทศ' })) + '</p></div>';
  }
  function basisList(it){ return it && it.basis ? '<ul class="bz-basis">' + it.basis.map(function(b){ return '<li>' + esc(T(b)) + '</li>'; }).join('') + '</ul>' : ''; }
  function fanSec(it, color, years, extra){
    if(!it) return '';
    var hist = it.hist.filter(function(p){ return tms(p[0]) > tms(it.t) - years * 365 * 864e5; });
    var b = fcAt(it, 6), c = fcAt(it, 12), pre = it.unit === '$' ? '$' : '', u = it.unit === '%' ? '%' : '';
    return '<div class="bz-sec bz-fsec"><h4>' + ico('radar') + esc(T(it.name)) + '<span class="bz-fq">' + pre + f(it.now, it.dec) + u + ' → <b>' + pre + f(b && b.v, it.dec) + u + '</b> <small>6M</small> → <b>' + pre + f(c && c.v, it.dec) + u + '</b> <small>12M</small></span></h4>' +
      lineChart({ series:[{ name:it.name, pts:hist, color:color, w:2.4, fc:it.fc }], unit:u, dec:it.dec, ref:it.ref, rec:D.b && D.b.recessions, band:extra && extra.band, zero:extra && extra.zero, h:240 }) + basisList(it) + '</div>';
  }
  function vFc(E, F){
    var h = '<div class="bz-fcgrid wide">' + ['core', 'ff', 'y10', 'un', 'spx', 'oil'].map(function(k, i){ return fcCard(F.items[k], ['#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f97316'][i]); }).join('') + '</div>';
    h += '<div class="bz-two">' + fanSec(F.items.core, '#f472b6', 4, { band:{ lo:1.5, hi:2.5, label:{ en:'Fed goal', th:'เป้าเฟด' } } }) + fanSec(F.items.cpi, '#fb7185', 4, { band:{ lo:1.5, hi:2.5 } }) + '</div>';
    h += '<div class="bz-two">' + fanSec(F.items.ff, '#fbbf24', 4) + fanSec(F.items.y2, '#22d3ee', 4) + '</div>';
    h += '<div class="bz-two">' + fanSec(F.items.y10, '#a78bfa', 4) + fanSec(F.items.un, '#34d399', 6) + '</div>';
    /* leading index + recession model */
    var L2 = F.lei, lv = L2.v;
    h += '<div class="bz-two"><div class="bz-sec"><h4>' + ico('compass') + esc(T({ en:'SPACEZ leading index (looks 6–9 months ahead)', th:'ดัชนีชี้นำ SPACEZ (มองล่วงหน้า 6–9 เดือน)' })) + '</h4>' +
      '<div class="bz-lei"><div class="bz-leig">' + gauge(clamp(50 + lv * 25, 0, 100), T(lv > 0.25 ? { en:'expanding', th:'ขยายตัว' } : lv < -0.25 ? { en:'contracting', th:'หดตัว' } : { en:'flat', th:'ทรงตัว' })) + '</div><div class="bz-leic">' + L2.comp.map(function(c){
        return '<div><span>' + esc(T(c.n)) + '</span><i><u class="' + (c.z >= 0 ? 'up' : 'dn') + '" style="' + (c.z >= 0 ? 'left:50%' : 'right:50%') + ';width:' + (Math.abs(c.z) / 2 * 50).toFixed(0) + '%"></u></i><b>' + esc(c.val || '') + '</b></div>';
      }).join('') + '</div></div>' +
      '<div class="bz-gdp"><div><span>' + esc(T({ en:'Last GDP', th:'GDP ล่าสุด' })) + '</span><b>' + pc(F.gdp.now, 1) + '</b></div><div><span>GDPNow</span><b>' + pc(F.gdp.nowcast, 1) + '</b><em>' + mshort(F.gdp.nowT) + '</em></div><div class="nx"><span>' + esc(T({ en:'Next quarter', th:'ไตรมาสหน้า' })) + '</span><b>' + pc(F.gdp.q1, 1) + '</b></div><div class="nx"><span>' + esc(T({ en:'Quarter after', th:'ไตรมาสถัดไป' })) + '</span><b>' + pc(F.gdp.q2, 1) + '</b></div></div>' +
      '<ul class="bz-basis"><li>' + esc(T({ en:'Each input is scored −2…+2 versus its normal level and recent change, then averaged. GDP forecast = GDPNow blended toward 2% trend + 1.6–1.8 × the index.', th:'แต่ละตัวให้คะแนน −2 ถึง +2 เทียบระดับปกติและการเปลี่ยนแปลงล่าสุด แล้วเฉลี่ย คาดการณ์ GDP = GDPNow ผสมกับแนวโน้ม 2% + 1.6–1.8 × ดัชนีนี้' })) + '</li></ul></div>';
    h += '<div class="bz-sec"><h4>' + ico('alert') + esc(T({ en:'Recession odds, next 12 months', th:'โอกาสเกิดภาวะถดถอยใน 12 เดือน' })) + '<span class="bz-fq"><b>' + f(F.rec && F.rec.p, 0) + '%</b></span></h4>' +
      (F.rec ? '<div class="bz-rec3"><div><span>' + esc(T({ en:'NY Fed yield-curve model', th:'โมเดลเส้นยีลด์ของเฟดนิวยอร์ก' })) + '</span><b>' + f(F.rec.ny, 0) + '%</b></div><div><span>' + esc(T({ en:'Jobs + credit + leading index', th:'การจ้างงาน + หุ้นกู้ + ดัชนีชี้นำ' })) + '</span><b>' + f(F.rec.cmp, 0) + '%</b></div><div class="nx"><span>' + esc(T({ en:'Blended', th:'รวม' })) + '</span><b>' + f(F.rec.p, 0) + '%</b></div></div>' : '') +
      lineChart({ series:[{ name:{ en:'NY Fed model', th:'โมเดลเฟดนิวยอร์ก' }, pts:F.recHist || [], color:'#fb7185', area:true }], unit:'%', dec:0, rec:D.b && D.b.recessions, h:190 }) +
      '<ul class="bz-basis"><li>' + esc(T({ en:'Probit: P = Φ(−0.533 − 0.633 × (10y − 3m)), the model the New York Fed publishes. Shaded columns = official US recessions.', th:'สูตร Probit: P = Φ(−0.533 − 0.633 × (10 ปี − 3 เดือน)) ซึ่งเป็นโมเดลที่เฟดนิวยอร์กเผยแพร่ แถบเทา = ช่วงที่สหรัฐฯ ถดถอยจริง' })) + '</li></ul></div></div>';
    h += '<div class="bz-two">' + fanSec(F.items.spx, '#60a5fa', 2) + fanSec(F.items.oil, '#f97316', 4) + '</div>';
    if(F.spx){
      h += '<div class="bz-sec"><h4>' + ico('bolt') + esc(T({ en:'S&P 500 range the options market is pricing', th:'กรอบ S&P 500 ที่ตลาดออปชันคาดไว้' })) + '</h4><div class="bz-cone">' + F.spx.cone.map(function(q){
        return '<div><span>' + q.m + esc(T({ en:'M', th:' เดือน' })) + '</span><b>' + f(q.v, 0) + '</b><em>68%: ' + f(q.lo, 0) + '–' + f(q.hi, 0) + '</em><em>95%: ' + f(q.lo2, 0) + '–' + f(q.hi2, 0) + '</em><small>' + spc(q.mu, 1) + ' ± ' + f(q.sig, 1) + '%</small></div>';
      }).join('') + '</div></div>';
    }
    return h;
  }

  /* ------------------------------------------------------- portfolio view */
  var PF = { acct:null, acctTickers:null, acctErr:null, loading:false };
  function account(){
    try {
      var l = window.__SPZ_LINE && window.__SPZ_LINE.state && window.__SPZ_LINE.state();
      if(l && l.status === 'linked') return { prov:'LINE', code:window.__SPZ_LINE.code && window.__SPZ_LINE.code(), name:l.displayName || 'LINE', id:'line:' + (l.uid || l.displayName || 'me') };
      var g = window.__SPZ_TG && window.__SPZ_TG.state && window.__SPZ_TG.state();
      if(g && g.status === 'linked') return { prov:'Telegram', code:window.__SPZ_TG.code && window.__SPZ_TG.code(), name:g.displayName || 'Telegram', id:'tg:' + (g.uid || g.displayName || 'me') };
      var a = window.__SPZ_ACC && window.__SPZ_ACC.state && window.__SPZ_ACC.state();
      if(a && a.status === 'linked') return { prov:'account', code:null, name:a.displayName || a.username, id:'acc:' + a.username };
    } catch(e){}
    return null;
  }
  function loadAcctTickers(cb){
    var a = account(); PF.acct = a;
    if(!a || !a.code){ PF.acctTickers = []; cb(); return; }
    if(PF.loading) return; PF.loading = true;
    fetch(WORKER + '/api/session/data?code=' + encodeURIComponent(a.code)).then(function(r){ return r.json(); }).then(function(d){
      PF.loading = false; PF.acctErr = d && d.error ? d.error : null;
      PF.acctTickers = ((d && d.tickers) || []).map(function(x){ return typeof x === 'string' ? x : (x && (x.t || x.ticker)) || ''; }).filter(Boolean).map(function(x){ return x.toUpperCase(); });
      cb();
    }).catch(function(){ PF.loading = false; PF.acctErr = 'net'; PF.acctTickers = []; cb(); });
  }
  function pfState(){
    var s = lsGet(); s.custom = s.custom || { SPY:40, IEF:30, GLD:10, THD:20 }; s.acct = s.acct || {}; if(s.tilt == null) s.tilt = true;
    if(!s.mode) s.mode = account() ? 'acct' : 'bal';
    return s;
  }
  function currentWeights(s){
    if(s.mode === 'acct'){
      var a = PF.acct, mine = (a && s.acct[a.id]) || {}, out = {};
      (PF.acctTickers || []).forEach(function(t){ out[t] = isNum(mine[t]) ? mine[t] : 10; });
      Object.keys(mine).forEach(function(t){ if(!(t in out) && mine[t] > 0) out[t] = mine[t]; });
      return out;
    }
    if(s.mode === 'custom') return s.custom;
    if(s.mode === 'autous' || s.mode === 'autoth'){ var o = {}; autoPick(s.mode === 'autous' ? 'us' : 'th', 8).forEach(function(r){ o[r.t] = 12.5; }); return o; }
    return presetWeights(s.mode, s.tilt);
  }
  function editable(s){ return s.mode === 'acct' || s.mode === 'custom'; }
  function setWeight(s, t, v){
    if(s.mode === 'acct' && PF.acct){ s.acct[PF.acct.id] = s.acct[PF.acct.id] || {}; s.acct[PF.acct.id][t] = v; }
    else if(s.mode === 'custom'){ s.custom[t] = v; }
    lsSet(s);
  }
  function delTicker(s, t){
    if(s.mode === 'acct' && PF.acct){ s.acct[PF.acct.id] = s.acct[PF.acct.id] || {}; s.acct[PF.acct.id][t] = 0; }
    else if(s.mode === 'custom') delete s.custom[t];
    lsSet(s);
  }
  function universeList(){
    var o = Object.keys(ETF_INFO).map(function(t){ return '<option value="' + t + '">' + esc(T({ en:ETF_INFO[t].n, th:ETF_INFO[t].th })) + '</option>'; });
    Object.keys(D.m.stocks).sort().forEach(function(t){ if(!ETF_INFO[t]) o.push('<option value="' + t + '">' + esc(D.m.stocks[t].name || '') + '</option>'); });
    return '<datalist id="bzUni">' + o.join('') + '</datalist>';
  }

  function vPf(){
    var s = pfState(), a = PF.acct = account();
    if(s.mode === 'acct' && !a) s.mode = 'bal';
    if(s.mode === 'acct' && PF.acctTickers == null){ loadAcctTickers(function(){ if(tab === 'pf') paint(); }); return '<div class="bz-wait">' + esc(T({ en:'Reading your account\'s holdings…', th:'กำลังอ่านหุ้นจากบัญชีของคุณ…' })) + '</div>'; }
    var modes = [];
    if(a) modes.push(['acct', { en:'My account (' + a.prov + ')', th:'บัญชีของฉัน (' + a.prov + ')' }, 'user']);
    modes.push(['cons', PRESETS.cons.n, 'shield'], ['bal', PRESETS.bal.n, 'scale'], ['grow', PRESETS.grow.n, 'trend'], ['autous', { en:'Auto-picked US', th:'คัดอัตโนมัติ US' }, 'star'], ['autoth', { en:'Auto-picked Thai', th:'คัดอัตโนมัติ ไทย' }, 'star'], ['custom', { en:'My simulation', th:'พอร์ตจำลองของฉัน' }, 'flask']);
    var h = '<div class="bz-pfsrc">' + (a ? '<p class="bz-acct">' + ico('user') + esc(T({ en:'Signed in as ' + a.name + ' via ' + a.prov + '. “My account” uses the tickers saved in your account (same list as the Watchlist page, synced on every device); the weights you type are kept in this browser.', th:'เข้าสู่ระบบในชื่อ ' + a.name + ' ผ่าน ' + a.prov + ' โหมด “บัญชีของฉัน” ใช้รายชื่อหุ้นที่บันทึกในบัญชี (รายการเดียวกับหน้า Watchlist ซิงก์ทุกเครื่อง) ส่วนสัดส่วนที่พิมพ์จะเก็บไว้ในเบราว์เซอร์นี้' })) + '</p>'
      : '<p class="bz-acct">' + ico('user') + esc(T({ en:'Not signed in with LINE or Telegram — use a model or simulated portfolio. Sign in (corner login) to analyse your own account\'s holdings.', th:'ยังไม่ได้เข้าสู่ระบบผ่าน LINE หรือ Telegram จึงใช้พอร์ตตัวอย่างหรือพอร์ตจำลองได้ ถ้าเข้าสู่ระบบ (ปุ่มล็อกอินมุมจอ) จะวิเคราะห์หุ้นในบัญชีของคุณเองได้' })) + '</p>') +
      '<div class="bz-modes">' + modes.map(function(m){ return '<button type="button" class="' + (s.mode === m[0] ? 'on' : '') + '" data-pfmode="' + m[0] + '">' + ico(m[2]) + esc(T(m[1])) + '</button>'; }).join('') + '</div>';
    if(PRESETS[s.mode]) h += '<div class="bz-preset"><p>' + esc(T(PRESETS[s.mode].d)) + '</p><label class="bz-tg"><input type="checkbox" data-pftilt' + (s.tilt ? ' checked' : '') + '><span>' + esc(T({ en:'Tilt 10% toward what the “' + PHASES[E_last.phase].short.en + '” phase favours', th:'เอียง 10% ไปทางสินทรัพย์ที่ช่วง “' + PHASES[E_last.phase].short.th + '” มักเอื้อ' })) + '</span></label><button type="button" class="bz-btn sm" data-pfcopy>' + esc(T({ en:'Copy into my simulation to edit', th:'คัดลอกไปแก้ในพอร์ตจำลองของฉัน' })) + '</button></div>';
    if(s.mode === 'autous' || s.mode === 'autoth') h += '<div class="bz-preset"><p>' + esc(T({ en:'8 stocks picked by the rules (quality, price, trend, sector fit to the phase), max 2 per sector, equal weights.', th:'หุ้น 8 ตัวที่คัดตามกฎ (คุณภาพ ราคา แนวโน้ม และกลุ่มที่เข้ากับช่วงเศรษฐกิจ) กลุ่มละไม่เกิน 2 ตัว น้ำหนักเท่ากัน' })) + '</p><button type="button" class="bz-btn sm" data-pfcopy>' + esc(T({ en:'Copy into my simulation to edit', th:'คัดลอกไปแก้ในพอร์ตจำลองของฉัน' })) + '</button></div>';
    if(s.mode === 'acct' && PF.acctErr) h += note({ en:'Could not read the account list (' + PF.acctErr + ').', th:'อ่านรายชื่อหุ้นจากบัญชีไม่ได้ (' + PF.acctErr + ')' });
    h += '</div>';
    var W = currentWeights(s), ts = Object.keys(W).filter(function(t){ return W[t] > 0; }), tot = ts.reduce(function(x, t){ return x + W[t]; }, 0) || 1;
    var ed = editable(s);
    h += sec({ en:'Holdings', th:'สินทรัพย์ในพอร์ต' }, (ts.length ? '<div class="bz-tw"><table class="bz-tbl bz-hold"><thead><tr><th></th><th>' + esc(T({ en:'Weight', th:'สัดส่วน' })) + '</th><th>%</th><th></th></tr></thead><tbody>' + ts.map(function(t){
        var I = info(t);
        return '<tr' + (I ? '' : ' class="miss"') + '><td><b>' + esc(t) + '</b><em>' + esc(I ? I.n : T({ en:'not in our data', th:'ไม่มีในข้อมูลของเว็บ' })) + '</em></td><td>' + (ed ? '<input type="number" min="0" step="1" value="' + (+W[t].toFixed(2)) + '" data-pfw="' + esc(t) + '">' : f(W[t], 1)) + '</td><td>' + f(W[t] / tot * 100, 1) + '%</td><td>' + (ed ? '<button type="button" class="bz-x" data-pfdel="' + esc(t) + '" aria-label="remove">' + ico('x') + '</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>' : note(s.mode === 'acct' ? { en:'Your account has no tickers yet — add some on the Watchlist page, or add them here (kept in this browser only).', th:'บัญชีนี้ยังไม่มีหุ้น เพิ่มได้ที่หน้า Watchlist หรือเพิ่มตรงนี้ (เก็บเฉพาะในเครื่องนี้)' } : { en:'Empty — add a ticker below.', th:'ยังว่าง เพิ่มหุ้นด้านล่างได้เลย' })) +
      (ed ? '<div class="bz-add">' + universeList() + '<input list="bzUni" data-pfnew placeholder="' + esc(T({ en:'Ticker, e.g. AAPL, PTT, SPY', th:'ชื่อหุ้น เช่น AAPL, PTT, SPY' })) + '"><input type="number" min="1" value="10" data-pfneww><button type="button" class="bz-btn sm" data-pfadd>' + ico('plus') + esc(T({ en:'Add', th:'เพิ่ม' })) + '</button><button type="button" class="bz-btn sm ghost" data-pfeq>' + esc(T({ en:'Equal weights', th:'แบ่งเท่ากันทุกตัว' })) + '</button></div>' : '') +
      note({ en:'Weights are relative: 2 and 1 means two-thirds and one-third.', th:'สัดส่วนเป็นแบบเทียบกัน เช่น 2 กับ 1 คือ สองในสามกับหนึ่งในสาม' }), 'layers');
    if(!ts.length) return h;
    var A = analyse(W); PF.last = A;
    var hs = Math.round(A.health), htone = hs >= 70 ? 'good' : hs >= 50 ? 'mid' : 'bad';
    h += '<div class="bz-pfh"><div class="bz-ring ' + htone + '" style="--p:' + hs + '"><b>' + hs + '</b><span>' + esc(T({ en:'health', th:'สุขภาพพอร์ต' })) + '</span></div><div class="bz-parts">' + A.parts.map(function(p){
      return '<div><span>' + esc(T(p.n)) + '</span><i><u style="width:' + clamp(p.v, 0, 100).toFixed(0) + '%" class="' + (p.v >= 70 ? 'good' : p.v >= 45 ? 'mid' : 'bad') + '"></u></i><b>' + Math.round(p.v) + '</b></div>';
    }).join('') + '</div>' + (A.risk ? '<div class="bz-kpis sm">' + kpi({ en:'1-year return', th:'ผลตอบแทน 1 ปี' }, spc(A.risk.ret, 1), 'S&P 500 ' + spc(A.risk.spyRet, 1), A.risk.ret >= A.risk.spyRet ? 'good' : '') +
      kpi({ en:'Swings (volatility)', th:'ความผันผวน' }, pc(A.risk.vol, 1), esc(T({ en:'per year', th:'ต่อปี' }))) + kpi({ en:'Worst drop', th:'ร่วงหนักสุด' }, spc(A.risk.dd, 1), esc(T({ en:'past year', th:'ในรอบปี' })), A.risk.dd < -20 ? 'bad' : '') +
      kpi({ en:'Beta vs S&P 500', th:'เบต้าเทียบ S&P 500' }, f(A.risk.beta, 2), esc(T({ en:'1 = moves like the market', th:'1 = ขยับเท่าตลาด' }))) +
      kpi({ en:'Independent bets', th:'จำนวนเดิมพันอิสระ' }, f(A.risk.effBets, 1), esc(T({ en:'of ', th:'จาก ' })) + A.ts.length, A.risk.effBets < 2 ? 'bad' : A.risk.effBets > 4 ? 'good' : '') + '</div>' : '') + '</div>';
    h += '<div class="bz-two">' + sec({ en:'What to fix first', th:'สิ่งที่ควรแก้ก่อน' }, '<ul class="bz-iss">' + A.issues.map(function(x){ return '<li class="' + x.k + '">' + ico(x.k === 'good' ? 'check' : 'alert') + '<span>' + esc(T(x.t)) + '</span></li>'; }).join('') + '</ul>' + (A.missing.length ? note({ en:'Not analysed (no data on this site): ' + A.missing.join(', '), th:'ไม่ได้วิเคราะห์ (ไม่มีข้อมูลในเว็บ): ' + A.missing.join(', ') }) : ''), 'alert') +
      (A.curve ? sec({ en:'Past year: this mix vs the S&P 500', th:'ย้อนหลัง 1 ปี: พอร์ตนี้ vs S&P 500' }, lineChart({ series:[{ name:{ en:'This portfolio', th:'พอร์ตนี้' }, pts:A.curve.p, color:COL.a, w:2.6 }, { name:{ en:'S&P 500', th:'S&P 500' }, pts:A.curve.s, color:COL.g, dash:'5 4' }], unit:'%', zero:true }) + note({ en:'Uses today\'s weights on last year\'s prices (weekly), so it shows how this mix behaved — not what you actually earned.', th:'ใช้สัดส่วนวันนี้กับราคาปีที่แล้ว (รายสัปดาห์) จึงบอกว่าพอร์ตแบบนี้เคยขยับอย่างไร ไม่ใช่กำไรที่ได้จริง' }), 'trend') : '') + '</div>';
    h += '<div class="bz-dns">' + donutBlock({ en:'Asset types', th:'ประเภทสินทรัพย์' }, Object.keys(A.mix.cls).map(function(k){ return { n:CLS_N[k], v:A.mix.cls[k] }; })) +
      donutBlock({ en:'Sectors (stocks only)', th:'กลุ่มอุตสาหกรรม (เฉพาะหุ้น)' }, Object.keys(A.mix.sec).map(function(k){ return { n:sectName(k), v:A.mix.sec[k] }; })) +
      donutBlock({ en:'Where', th:'ประเทศ' }, Object.keys(A.mix.geo).map(function(k){ return { n:GEO_N[k] || k, v:A.mix.geo[k] }; })) + '</div>';
    if(A.risk){
      h += '<div class="bz-two">' + sec({ en:'Stress test — what if…', th:'ทดสอบภาวะวิกฤต — ถ้าเกิด…' }, bars(A.risk.stress.map(function(x){ return { n:x.n, v:x.v }; }), { fmt:function(v){ return spc(v, 1); } }) + note({ en:'Estimated from how this mix actually moved with each factor over the past year, one factor at a time.', th:'ประมาณจากการที่พอร์ตแบบนี้เคยขยับตามแต่ละปัจจัยในปีที่ผ่านมา คิดทีละปัจจัย' }), 'bolt') +
        sec({ en:'Who drives the risk', th:'ใครเป็นต้นเหตุความเสี่ยง' }, '<div class="bz-rc">' + A.risk.cts.map(function(t, i){ return { t:t, w:A.risk.wd[i] * 100, r:A.risk.rc[i] * 100 }; }).sort(function(x, y){ return y.r - x.r; }).map(function(x){
          return '<div><b>' + esc(x.t) + '</b><span><i class="w" style="width:' + clamp(x.w, 0, 100).toFixed(1) + '%"></i><i class="r" style="width:' + clamp(x.r, 0, 100).toFixed(1) + '%"></i></span><em>' + f(x.w, 0) + '% → ' + f(x.r, 0) + '%</em></div>';
        }).join('') + '</div>' + note({ en:'Top bar = share of money, bottom bar = share of risk. When the bottom bar is much longer, that holding swings the whole portfolio.', th:'แถบบน = สัดส่วนเงิน แถบล่าง = สัดส่วนความเสี่ยง ถ้าแถบล่างยาวกว่ามาก ตัวนั้นคือตัวที่เขย่าทั้งพอร์ต' }), 'pie') + '</div>';
      if(A.risk.cts.length > 1 && A.risk.cts.length <= 14){
        h += sec({ en:'Do they move together? (correlation, 1 year weekly)', th:'ขึ้นลงไปด้วยกันไหม? (ค่าสหสัมพันธ์ รายสัปดาห์ 1 ปี)' }, '<div class="bz-tw"><table class="bz-corr"><thead><tr><th></th>' + A.risk.cts.map(function(t){ return '<th>' + esc(t) + '</th>'; }).join('') + '</tr></thead><tbody>' + A.risk.cts.map(function(t, i){
          return '<tr><th>' + esc(t) + '</th>' + A.risk.C[i].map(function(c, j){ var a2 = Math.abs(c); return '<td style="background:' + (i === j ? 'transparent' : c >= 0 ? 'rgba(251,113,133,' + (a2 * 0.75).toFixed(2) + ')' : 'rgba(52,211,153,' + (a2 * 0.75).toFixed(2) + ')') + '">' + (i === j ? '' : f(c, 2)) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>' + note({ en:'Red = move together (less protection). Green = move opposite (good for diversification).', th:'แดง = ขึ้นลงพร้อมกัน (ช่วยกันกระจายความเสี่ยงได้น้อย) เขียว = สวนทางกัน (ดีต่อการกระจายความเสี่ยง)' }), 'swap');
      }
    }
    if(A.rebal){
      h += '<div class="bz-two">' + sec({ en:'Suggested re-balance', th:'แนวทางปรับสัดส่วน' }, '<div class="bz-tw"><table class="bz-tbl bz-reb"><thead><tr><th></th><th>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</th><th>' + esc(T({ en:'Suggested', th:'แนะนำ' })) + '</th><th></th></tr></thead><tbody>' + A.rebal.map(function(r){
        var d = r.to - r.now;
        return '<tr><td><b>' + esc(r.t) + '</b><em>' + r.why.map(function(w){ return esc(T(w)); }).join(' · ') + '</em></td><td>' + f(r.now, 1) + '%</td><td><b>' + f(r.to, 1) + '%</b></td><td class="' + (d > 0.5 ? 'up' : d < -0.5 ? 'dn' : '') + '">' + (Math.abs(d) < 0.5 ? '—' : spc(d, 1)) + '</td></tr>';
      }).join('') + '</tbody></table></div>' + (editable(s) ? '<button type="button" class="bz-btn sm" data-pfapply>' + ico('check') + esc(T({ en:'Use these weights', th:'ใช้สัดส่วนนี้' })) + '</button>' : '') +
        note({ en:'Rules: cap any single stock at 20% (sector ETFs 30%, broad funds 40%), lean a little toward steadier holdings, then +10% for phase fit and −15% for weak fundamentals.', th:'กฎที่ใช้: หุ้นตัวเดียวไม่เกิน 20% (ETF รายกลุ่ม 30% กองทุนกว้าง 40%) เอียงไปทางตัวที่แกว่งน้อยเล็กน้อย แล้วเพิ่ม 10% ให้ตัวที่เข้ากับสภาวะ และลด 15% ให้ตัวที่พื้นฐานอ่อน' }), 'scale') +
        sec({ en:'Would help diversify', th:'ตัวที่ช่วยกระจายความเสี่ยงได้' }, A.adds.length ? '<ul class="bz-adds">' + A.adds.map(function(x){ var I = info(x.t); return '<li><b>' + x.t + '</b><span>' + esc(I ? I.n : '') + '</span><em>' + esc(T({ en:'correlation with your mix ', th:'สหสัมพันธ์กับพอร์ต ' })) + f(x.c, 2) + (x.fit > 0 ? ' · ' + esc(T({ en:'suits the phase', th:'เข้ากับสภาวะ' })) : '') + '</em>' + (editable(s) ? '<button type="button" class="bz-btn sm ghost" data-pfaddt="' + x.t + '">' + ico('plus') + '</button>' : '') + '</li>'; }).join('') + '</ul>' : note({ en:'Needs weekly data.', th:'ต้องใช้ข้อมูลรายสัปดาห์' }), 'plus') + '</div>';
    }
    h += sec({ en:'Report card for each holding', th:'สมุดพกรายตัว' }, '<div class="bz-cards">' + A.cards.filter(Boolean).map(function(c){
      var s2 = c.I.s, rows = c.I.etf ? [[{ en:'Trend', th:'แนวโน้ม' }, c.m], [{ en:'Steadiness', th:'ความนิ่ง' }, c.r]] : [[{ en:'Business quality', th:'คุณภาพธุรกิจ' }, c.q], [{ en:'Price vs peers', th:'ราคาเทียบกลุ่ม' }, c.v], [{ en:'Trend', th:'แนวโน้ม' }, c.m], [{ en:'Dividend', th:'ปันผล' }, c.inc], [{ en:'Steadiness', th:'ความนิ่ง' }, c.r]];
      return '<div class="bz-card"><div class="bz-ch"><b>' + esc(c.t) + '</b><span>' + esc(c.I.n) + '</span>' + (c.fit > 0 ? chip(esc(T({ en:'fits phase', th:'เข้ากับสภาวะ' })), 'good') : c.fit < 0 ? chip(esc(T({ en:'phase headwind', th:'สภาวะไม่เอื้อ' })), 'bad') : '') + '</div>' +
        '<ul>' + rows.map(function(r){ return '<li><span>' + esc(T(r[0])) + '</span>' + (isNum(r[1]) ? stars(r[1]) : '<em>—</em>') + '</li>'; }).join('') + '</ul>' +
        (s2 && !c.I.etf ? '<div class="bz-fund"><span>P/E <b>' + f(s2.pe, 1) + '</b>' + (c.medPE ? ' <em>(' + esc(T({ en:'peers ', th:'กลุ่ม ' })) + f(c.medPE, 1) + ')</em>' : '') + '</span><span>ROE <b>' + pc(s2.roe, 0) + '</b></span><span>' + esc(T({ en:'margin', th:'อัตรากำไร' })) + ' <b>' + pc(s2.margin, 0) + '</b></span><span>D/E <b>' + f(s2.de, 2) + '</b></span><span>' + esc(T({ en:'yield', th:'ปันผล' })) + ' <b>' + pc(s2.div, 1) + '</b></span><span>3M <b>' + spc(s2.m3, 1) + '</b></span></div>'
          : '<div class="bz-fund"><span>3M <b>' + spc(c.r13, 1) + '</b></span><span>' + esc(T({ en:'volatility', th:'ผันผวน' })) + ' <b>' + pc(c.vol, 0) + '</b></span></div>') +
        '<p class="bz-verd">' + esc(T(c.say)) + '</p>' + (c.flags.length ? '<div class="bz-flags">' + c.flags.map(function(fl){ return '<span class="' + fl.k + '">' + esc(T(fl.t)) + '</span>'; }).join('') + '</div>' : '') + '</div>';
    }).join('') + '</div>', 'star');
    return h;
  }
  function wirePf(root){
    root.addEventListener('click', function(ev){
      var b = ev.target.closest('button,input[data-pftilt]'); if(!b || !root.contains(b)) return;
      var s = pfState();
      if(b.hasAttribute('data-pfmode')){ s.mode = b.getAttribute('data-pfmode'); lsSet(s); if(s.mode === 'acct') PF.acctTickers = null; tab = 'pf'; paint(true); return; }
      if(b.hasAttribute('data-pftilt')){ s.tilt = b.checked; lsSet(s); paint(); return; }
      if(b.hasAttribute('data-pfcopy')){ s.custom = {}; var W = currentWeights(s); Object.keys(W).forEach(function(t){ s.custom[t] = +W[t].toFixed(2); }); s.mode = 'custom'; lsSet(s); paint(); return; }
      if(b.hasAttribute('data-pfdel')){ delTicker(s, b.getAttribute('data-pfdel')); paint(); return; }
      if(b.hasAttribute('data-pfadd')){
        var inp = root.querySelector('[data-pfnew]'), t = (inp.value || '').trim().toUpperCase().replace(/\.BK$/, ''), w = parseFloat(root.querySelector('[data-pfneww]').value) || 10;
        if(!t) return; if(!info(t)){ inp.classList.add('bad'); inp.value = ''; inp.placeholder = T({ en:t + ' is not in our data', th:'ไม่พบ ' + t + ' ในข้อมูลของเว็บ' }); return; }
        setWeight(s, t, w); paint(); return;
      }
      if(b.hasAttribute('data-pfaddt')){ setWeight(s, b.getAttribute('data-pfaddt'), 10); paint(); return; }
      if(b.hasAttribute('data-pfeq')){ var W2 = currentWeights(s); Object.keys(W2).forEach(function(t){ if(W2[t] > 0) setWeight(s, t, 10); }); paint(); return; }
      if(b.hasAttribute('data-pfapply') && PF.last && PF.last.rebal){ PF.last.rebal.forEach(function(r){ setWeight(s, r.t, +r.to.toFixed(1)); }); paint(); return; }
    });
    root.addEventListener('change', function(ev){
      var i = ev.target; if(!i.hasAttribute || !i.hasAttribute('data-pfw')) return;
      var v = parseFloat(i.value); if(!isNum(v) || v < 0) v = 0;
      setWeight(pfState(), i.getAttribute('data-pfw'), v); paint();
    });
    root.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && ev.target.hasAttribute && ev.target.hasAttribute('data-pfnew')){ var b = root.querySelector('[data-pfadd]'); if(b) b.click(); } });
  }

  /* ----------------------------------------------------------------- shell */
  function paint(scrollTop){
    if(!host) return;
    CH = {}; chN = 0;
    var body = host.querySelector('[data-bz="body"]'), nav = host.querySelector('[data-bz="tabs"]');
    host.querySelector('[data-bz="eb"]').textContent = T(UX.eb);
    host.querySelector('[data-bz="h"]').textContent = T(UX.h);
    host.querySelector('[data-bz="lede"]').textContent = T(UX.lede);
    nav.innerHTML = TABS.map(function(t){ return '<button type="button" role="tab" data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '" aria-selected="' + (tab === t[0]) + '">' + ico(t[2]) + '<span>' + esc(T(t[1])) + '</span></button>'; }).join('');
    if(!D.m || !D.m.stocks){ body.innerHTML = '<div class="bz-wait">' + esc(T(UX.loading)) + '</div>'; return; }
    var E = E_last;
    var meta = '<div class="bz-meta"><span>' + ico('eye') + esc(T(UX.upd)) + ': ' + (D.m.generated_at ? new Date(D.m.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—') + '</span>' +
      '<span>' + esc(T(UX.eco)) + ': ' + (D.b && D.b.generated_at ? new Date(D.b.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—') + '</span>' +
      '<button type="button" class="bz-btn sm ghost" data-bzref>' + ico('radar') + esc(T(UX.refresh)) + '</button></div>';
    var html = (D.b ? '' : '<div class="bz-callout bad">' + ico('alert') + '<div><p>' + esc(T(UX.nobrain)) + '</p></div></div>');
    try {
      html += tab === 'sum' ? vSum(E, F_last) : tab === 'fc' ? vFc(E, F_last) : tab === 'over' ? vOver(E) : tab === 'infl' ? vInfl(E) : tab === 'growth' ? vGrowth(E) : tab === 'fx' ? vFx(E) : tab === 'rot' ? vRot(E) : tab === 'out' ? vOut(E) : tab === 'pf' ? vPf() : vCal();
    } catch(err){ html += '<div class="bz-callout bad">' + ico('alert') + '<div><p>' + esc(String(err && err.message || err)) + '</p></div></div>'; if(window.console) console.error(err); }
    html += '<footer class="bz-foot"><p>' + esc(T({ en:'Sources: FRED (St. Louis Fed) · Yahoo Finance via yfinance · Shiller/Yale · FINRA · Cboe · Faireconomy calendar. Market data refreshes every ~30 min; economy data twice a day; some series (GDP, CPI) are monthly or quarterly.', th:'แหล่งข้อมูล: FRED (เฟดสาขาเซนต์หลุยส์) · Yahoo Finance ผ่าน yfinance · Shiller/Yale · FINRA · Cboe · ปฏิทิน Faireconomy ข้อมูลตลาดอัปเดตราวทุก 30 นาที ข้อมูลเศรษฐกิจวันละ 2 ครั้ง บางตัว (GDP, CPI) ออกรายเดือนหรือรายไตรมาส' })) + '</p></footer>';
    body.innerHTML = meta + '<div class="bz-view bz-v-' + tab + '">' + html + '</div>';
    if(scrollTop){ var top = host.getBoundingClientRect().top + window.scrollY - 90; if(window.scrollY > top) window.scrollTo({ top:top, behavior:'smooth' }); }
  }
  function refresh(){
    wkCache = {}; medCache = null; calCache = {};
    return loadData().then(function(){ if(D.m && D.m.stocks){ E_last = compute(); try { F_last = forecast(E_last); } catch(e){ if(window.console) console.error(e); } } paint(); });
  }
  function mount(slot){
    host = slot;
    slot.innerHTML = '<div class="bz-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-bz="eb"></span></div><h2 data-bz="h"></h2><p class="lede" data-bz="lede"></p><div class="rule"></div></div>' +
      '<nav class="bz-tabs" role="tablist" data-bz="tabs"></nav><div data-bz="body"></div></div>';
    try { var t0 = sessionStorage.getItem('spz.brain.tab'); if(t0 && TABS.some(function(x){ return x[0] === t0; })) tab = t0; } catch(e){}
    slot.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-tab],[data-go],[data-bzref]'); if(!b || !slot.contains(b)) return;
      if(b.hasAttribute('data-bzref')){ refresh(); return; }
      tab = b.getAttribute('data-tab') || b.getAttribute('data-go');
      try { sessionStorage.setItem('spz.brain.tab', tab); } catch(e){}
      paint(true);
    });
    slot.addEventListener('pointermove', onChartMove);
    slot.addEventListener('pointerleave', function(){ slot.querySelectorAll('.bz-chart').forEach(hideTip); }, true);
    wirePf(slot);
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('spz:line', function(){ PF.acctTickers = null; if(tab === 'pf') paint(); });
    document.addEventListener('spz:acc', function(){ PF.acctTickers = null; if(tab === 'pf') paint(); });
    paint();
    refresh();
  }
  window.__SPZ_BRAIN = { mount:mount, compute:function(){ return E_last; }, data:function(){ return D; }, analyse:function(W){ return analyse(W); } };
})();
