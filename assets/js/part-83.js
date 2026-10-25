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
    book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5"/><path d="M9 7h7M9 10.5h5"/>',
    printer:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/><circle cx="17.5" cy="12" r=".8" fill="currentColor"/>',
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
    var W = opt.W || 640, H = opt.h || 300, P = { l:42, r:58, t:14, b:24 };
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
    return '<svg class="bz-gauge" viewBox="0 0 220 162">' + segs +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (r - 22) * Math.cos(a)).toFixed(1) + '" y2="' + (cy + (r - 22) * Math.sin(a)).toFixed(1) + '" class="bz-needle"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="7" class="bz-hub"/>' +
      '<text x="' + cx + '" y="' + (cy + 35) + '" text-anchor="middle" class="bz-gv">' + Math.round(v) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 54) + '" text-anchor="middle" class="bz-gl2">' + esc(label || '') + '</text></svg>';
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
      if(ivs) x = x.map(function(v, i){ return iv[i] ? v * 0.85 + 0.15 * iv[i] / ivs : v; });
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
    ['pf', { en:'My portfolio', th:'พอร์ตของฉัน' }, 'pie'], ['cal', { en:'This week', th:'จับตาสัปดาห์นี้' }, 'cal'],
    ['guide', { en:'How to read', th:'วิธีดูหน้านี้' }, 'book'], ['print', { en:'Print / PDF', th:'พิมพ์ / PDF' }, 'printer']
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

  function sec(title, inner, icon, extra){ return '<div class="bz-sec' + (extra ? ' ' + extra : '') + '"><h4>' + (icon ? ico(icon) : '') + esc(T(title)) + '</h4>' + inner + '</div>'; }
  function kpi(label, val, sub, tn){ return '<div class="bz-kpi ' + (tn || '') + '"><span>' + esc(T(label)) + '</span><b>' + val + '</b>' + (sub ? '<em>' + sub + '</em>' : '') + '</div>'; }
  function chip(t, tn){ return '<span class="bz-chip ' + (tn || '') + '">' + t + '</span>'; }
  function note(t){ return '<p class="bz-note">' + esc(T(t)) + '</p>'; }

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
    var W = opt.W || 640, H = opt.h || 280, P = { l:42, r:12, t:12, b:24 }, vs = pts.map(function(p){ return p[1]; }), lo = Math.min(0, Math.min.apply(null, vs)), hi = Math.max(0, Math.max.apply(null, vs));
    var Y = function(v){ return P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b); }, bw = (W - P.l - P.r) / pts.length, s = '';
    niceTicks(lo, hi, 4).forEach(function(v){ s += '<line class="bz-gl" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="bz-ax" x="' + (P.l - 6) + '" y="' + (Y(v) + 3) + '" text-anchor="end">' + v + '</text>'; });
    pts.forEach(function(p, i){
      var x = P.l + i * bw + bw * 0.15, y = Math.min(Y(p[1]), Y(0)), hh = Math.abs(Y(p[1]) - Y(0));
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + Math.max(1, hh).toFixed(1) + '" rx="2" fill="' + (p[1] >= 0 ? (opt.up || '#34d399') : '#fb7185') + '"><title>' + dshort(p[0]) + ': ' + f(p[1], opt.dec || 0) + (opt.unit || '') + '</title></rect>';
      if(i % Math.ceil(pts.length / 6) === 0) s += '<text class="bz-ax" x="' + (x + bw * 0.35).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + mshort(p[0]) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg">' + s + '</svg>';
  }
  function thaiBreadth(){
    var n = 0, up = 0, m1 = [];
    Object.keys(D.m.stocks).forEach(function(t){ var s = D.m.stocks[t]; if(s.cal !== 'th') return; n++; if(s.above_ma200) up++; if(isNum(s.m1)) m1.push(s.m1); });
    return { n:n, up:n ? up / n * 100 : null, m1:median(m1) };
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
    var h = '<div class="bz-verdict"><div class="bz-vl">' + ico(E.weather.k, 'bz-wxi') + '<div><span>' + esc(T({ en:'Market score', th:'คะแนนตลาด' })) + '</span><b>' + Math.round(E.score) + '</b><em>' + esc(T(E.weather.w)) + '</em></div>' + consensusHTML(E, F) + '</div>' +
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
      lineChart({ series:[{ name:it.name, pts:hist, color:color, w:2.4, fc:it.fc }], unit:u, dec:it.dec, ref:it.ref, rec:D.b && D.b.recessions, band:extra && extra.band, zero:extra && extra.zero, h:280 }) + basisList(it) + fcDetails(it, F_last, E_last) + '</div>';
  }
  function vFc(E, F){
    var h = '<div class="bz-fcgrid wide">' + ['core', 'ff', 'y10', 'un', 'spx', 'oil'].map(function(k, i){ return fcCard(F.items[k], ['#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f97316'][i]); }).join('') + '</div>';
    h += '<div class="bz-two">' + fanSec(F.items.core, '#f472b6', 4, { band:{ lo:1.5, hi:2.5, label:{ en:'Fed goal', th:'เป้าเฟด' } } }) + fanSec(F.items.cpi, '#fb7185', 4, { band:{ lo:1.5, hi:2.5 } }) + '</div>';
    h += '<div class="bz-two">' + fanSec(F.items.ff, '#fbbf24', 4) + fanSec(F.items.y2, '#22d3ee', 4) + '</div>' + fomcHTML(F);
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

  /* ============================================ RE-LAID-OUT TABS (2026-10-25 c)
     12-column rows (.bz-row + .s3/.s4/.s5/.s6/.s7/.s8/.s12), bigger charts. */
  function row(cells){ return '<div class="bz-row">' + cells.join('') + '</div>'; }
  function cell(span, title, inner, icon, extra){ return '<div class="bz-sec s' + span + (extra ? ' ' + extra : '') + '"><h4>' + (icon ? ico(icon) : '') + esc(T(title)) + '</h4>' + inner + '</div>'; }
  var BIG = { W:1100, h:380 }, MID = { W:760, h:340 };
  function lc(o, size){ o.W = size.W; o.h = o.h || size.h; return lineChart(o); }

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
    /* what changed: big tiles */
    h += '<h3 class="bz-h3">' + ico('bolt') + esc(T(UX.changed)) + '</h3>' + (E.changes.length ? '<div class="bz-tiles">' + E.changes.map(function(c){
      var cls = c.good === true ? 'good' : c.good === false ? 'bad' : 'mid', val = c.pct ? spc(c.d, 1) : sg(c.d, c.unit === '%' ? 2 : 1) + (c.unit === '%' ? ' pt' : c.unit);
      var w = clamp(c.mag / 3 * 100, 12, 100);
      return '<div class="bz-tile ' + cls + '"><span class="n">' + esc(T(c.n)) + '</span><b>' + val + '</b><em>' + esc(T({ en:'now', th:'ตอนนี้' })) + ' <strong>' + f(c.now, c.unit === '%' ? 2 : 1) + (c.unit === '%' ? '%' : '') + '</strong></em>' +
        '<i class="bar"><u style="width:' + w.toFixed(0) + '%"></u></i><small>' + esc(T(c.good === true ? { en:'good for stocks', th:'ดีต่อหุ้น' } : c.good === false ? { en:'bad for stocks', th:'ไม่ดีต่อหุ้น' } : { en:'watch', th:'จับตา' })) + ' · ' + esc(T({ en:'size ', th:'ขนาด ' })) + f(c.mag, 1) + '×</small></div>';
    }).join('') + '</div>' : note(UX.nochg));
    h += '<h3 class="bz-h3">' + ico('swap') + esc(T(UX.div)) + '</h3>' + (E.diverge.length ? '<div class="bz-dtiles">' + E.diverge.map(function(d, i){ return '<div class="bz-dt"><span class="k">' + (i + 1) + '</span><p>' + esc(T(d)) + '</p></div>'; }).join('') + '</div>' : note(UX.nodiv));
    h += row([cell(12, UX.play, '<div class="bz-play">' + PLAY[E.phase].map(function(t, i){ return '<div><b>' + esc(T(STYLE[i])) + '</b><p>' + esc(T(t)) + '</p></div>'; }).join('') + '</div>' +
      '<p class="bz-note">' + esc(T({ en:'Usually strongest now: ', th:'กลุ่มที่มักเด่นช่วงนี้: ' })) + ph.etf.map(function(t){ return '<code>' + t + '</code>'; }).join(' ') + ' · ' + esc(T({ en:'usually weakest: ', th:'มักอ่อน: ' })) + ph.avoid.map(function(t){ return '<code>' + t + '</code>'; }).join(' ') + '</p>', 'layers')]);
    return h;
  }

  function curveSVG(){
    var mk = function(k){ var o = mkt(k); return o ? [o.price, isNum(o.m1) ? o.price / (1 + o.m1 / 100) : null] : [null, null]; };
    var y2 = mac('y2'), pts = [['3M', mk('us3m')], ['2Y', y2 ? [y2.v, y2.m1] : [null, null]], ['5Y', mk('us5y')], ['10Y', mk('us10y')], ['30Y', mk('us30y')]];
    var vals = []; pts.forEach(function(p){ vals.push(p[1][0], p[1][1]); }); vals = vals.filter(isNum);
    if(vals.length < 4) return '';
    var lo = Math.min.apply(null, vals) - 0.15, hi = Math.max.apply(null, vals) + 0.15, W = 760, H = 340, P = 50;
    var X = function(i){ return P + i * (W - 2 * P) / (pts.length - 1); }, Y = function(v){ return 24 + (1 - (v - lo) / (hi - lo)) * (H - 60); };
    var s = '', pa = '', pb = '', area = '';
    niceTicks(lo, hi, 5).forEach(function(v){ s += '<line class="bz-gl" x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="bz-ax" x="' + (P - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '%</text>'; });
    pts.forEach(function(p, i){
      if(isNum(p[1][1])) pb += (pb ? 'L' : 'M') + X(i) + ' ' + Y(p[1][1]);
      if(isNum(p[1][0])){ pa += (pa ? 'L' : 'M') + X(i) + ' ' + Y(p[1][0]); }
      s += '<text class="bz-ax big" x="' + X(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + p[0] + '</text>';
    });
    area = pa + 'L' + X(pts.length - 1) + ' ' + (H - 36) + 'L' + X(0) + ' ' + (H - 36) + 'Z';
    pts.forEach(function(p, i){ if(isNum(p[1][0])){ var d = isNum(p[1][1]) ? p[1][0] - p[1][1] : null; s += '<circle cx="' + X(i) + '" cy="' + Y(p[1][0]) + '" r="6" fill="#22d3ee" stroke="var(--bz-bgc,#0b0f17)" stroke-width="2.5"/><text class="bz-tag big" x="' + X(i) + '" y="' + (Y(p[1][0]) - 14) + '" text-anchor="middle" fill="#22d3ee">' + f(p[1][0], 2) + '%</text>' + (isNum(d) ? '<text class="bz-ax" x="' + X(i) + '" y="' + (Y(p[1][0]) + 22) + '" text-anchor="middle" fill="' + (d > 0 ? '#fb7185' : '#34d399') + '">' + sg(d, 2) + '</text>' : ''); } });
    return '<div class="bz-leg"><span><i style="background:#22d3ee"></i>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</span><span><i style="background:#94a3b8"></i>' + esc(T({ en:'1 month ago', th:'1 เดือนก่อน' })) + '</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg"><defs><linearGradient id="bzCv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity=".28"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient></defs>' + s + '<path d="' + area + '" fill="url(#bzCv)"/><path d="' + pb + '" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-dasharray="6 6"/><path d="' + pa + '" fill="none" stroke="#22d3ee" stroke-width="3"/></svg>';
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
    h += row([cell(6, { en:'Inflation vs the 2% goal', th:'เงินเฟ้อเทียบเป้า 2%' }, lc({ series:[
        { name:{ en:'CPI', th:'CPI' }, pts:histSince('cpi', 6), color:COL.c }, { name:{ en:'Core CPI', th:'Core CPI' }, pts:histSince('core_cpi', 6), color:COL.b }, { name:{ en:'Core PCE', th:'Core PCE' }, pts:histSince('core_pce', 6), color:COL.a, w:2.8 }],
        unit:'%', band:{ lo:1.5, hi:2.5, label:{ en:'Fed goal ≈ 2%', th:'เป้าเฟด ≈ 2%' } }, rec:D.b && D.b.recessions }, MID), 'flame'),
      cell(6, { en:'Fed rate vs bond yields', th:'ดอกเบี้ยเฟดเทียบบอนด์ยีลด์' }, lc({ series:[
        { name:{ en:'Fed funds', th:'ดอกเบี้ยเฟด' }, pts:histSince('ff', 5), color:COL.d, w:2.8 }, { name:{ en:'2y', th:'2 ปี' }, pts:histSince('y2', 5), color:COL.a }, { name:{ en:'10y', th:'10 ปี' }, pts:histSince('y10', 5), color:COL.b }], unit:'%', dec:2 }, MID), 'bank')]);
    h += row([cell(6, { en:'Yield curve: now vs a month ago', th:'เส้นอัตราผลตอบแทน: ตอนนี้ vs เดือนก่อน' }, curveSVG() + note({ en:'Upward-sloping is normal. When short maturities sit above long ones the curve is “inverted”, a classic slowdown warning. Small numbers = change over the month.', th:'เส้นชันขึ้นคือปกติ ถ้าระยะสั้นสูงกว่าระยะยาวเรียกว่า “กลับหัว” เป็นสัญญาณเตือนเศรษฐกิจชะลอแบบคลาสสิก ตัวเลขเล็กใต้จุด = เปลี่ยนไปเท่าไหร่ในเดือนนี้' }), 'curve'),
      cell(6, { en:'Real yield & inflation expectations', th:'ยีลด์จริงและเงินเฟ้อที่ตลาดคาด' }, lc({ series:[
        { name:{ en:'Real 10y yield', th:'ยีลด์จริง 10 ปี' }, pts:histSince('real10', 5), color:COL.e, w:2.6 }, { name:{ en:'5y breakeven', th:'เงินเฟ้อคาด 5 ปี' }, pts:histSince('be5', 5), color:COL.f }, { name:{ en:'Consumers 1y', th:'ผู้บริโภคคาด 1 ปี' }, pts:histSince('mich', 5), color:COL.d, dash:'4 4', w:1.6 }], unit:'%', dec:2, zero:true }, MID) +
        note({ en:'Real yield = what bonds pay after inflation. Above ~2% money is genuinely expensive, which usually weighs on high-valuation growth stocks and gold.', th:'ยีลด์จริง = ผลตอบแทนบอนด์หลังหักเงินเฟ้อ ถ้าสูงกว่าราว 2% แปลว่าเงินแพงจริง มักกดดันหุ้นเติบโตที่ราคาแพงและทองคำ' }), 'scale')]);
    return h;
  }

  function vGrowth(E){
    var G = E.growth, sig = recessionSignals(E), lit = sig.filter(function(s){ return s[1]; }).length;
    var slow = E.scen.filter(function(s){ return s.k === 'slow'; })[0];
    var h = '<div class="bz-kpis">' +
      kpi({ en:'Unemployment', th:'ว่างงาน' }, pc(G.un, 1), esc(T({ en:'12m low ', th:'ต่ำสุด 12 เดือน ' })) + pc(G.unMin, 1), G.un - G.unMin > 0.4 ? 'bad' : '') +
      kpi({ en:'New jobs (3m avg)', th:'จ้างงานเพิ่ม (เฉลี่ย 3 เดือน)' }, f(G.pay3, 0) + 'k', '', G.pay3 < 50 ? 'bad' : G.pay3 > 150 ? 'good' : '') +
      kpi({ en:'Weekly claims', th:'ขอสวัสดิการ/สัปดาห์' }, f(G.cl, 0) + 'k', spc(G.clY, 0) + ' y/y', G.clY > 15 ? 'bad' : '') +
      kpi({ en:'Job openings', th:'ตำแหน่งงานว่าง' }, f(mv('jolts'), 1) + 'm', mshort(mac('jolts') && mac('jolts').t)) +
      kpi({ en:'Wage growth', th:'ค่าจ้างโต' }, pc(mv('wages'), 1), 'y/y') +
      kpi({ en:'Sahm rule', th:'สัญญาณ Sahm' }, f(G.sahm, 2), esc(T({ en:'≥0.5 = recession', th:'≥0.5 = ถดถอย' })), G.sahm >= 0.5 ? 'bad' : G.sahm < 0.2 ? 'good' : '') +
      kpi({ en:'Real GDP', th:'GDP จริง' }, pc(G.gdp, 1), 'GDPNow ' + pc(mv('gdpnow'), 1), G.gdp < 1 ? 'bad' : G.gdp > 2 ? 'good' : '') +
      kpi({ en:'Retail sales', th:'ยอดค้าปลีก' }, spc(mv('retail'), 1), esc(T({ en:'after inflation ', th:'หลังหักเงินเฟ้อ ' })) + spc(G.realRetail, 1)) +
      kpi({ en:'Consumer mood', th:'ความเชื่อมั่นผู้บริโภค' }, f(G.sent, 1), esc(T({ en:'avg ≈ 85', th:'ค่าเฉลี่ยราว 85' })), G.sent < 60 ? 'bad' : '') + '</div>';
    h += '<div class="bz-sec"><h4>' + ico('alert') + esc(T({ en:'Recession checklist', th:'เช็กลิสต์สัญญาณถดถอย' })) + '</h4><div class="bz-rmeter"><div class="bz-rbar"><i style="width:' + (lit * 10) + '%"></i></div><b>' + lit + '/10</b><span>' + esc(T(lit >= 6 ? { en:'many warning lights on', th:'ไฟเตือนติดหลายดวง' } : lit >= 3 ? { en:'a few warning lights', th:'มีไฟเตือนบางดวง' } : { en:'mostly clear', th:'ส่วนใหญ่ยังปกติ' })) + (slow ? ' · ' + esc(T({ en:'“growth scare” odds ', th:'โอกาส “เศรษฐกิจชะลอแรง” ' })) + slow.p + '%' : '') + '</span></div>' +
      '<div class="bz-chkg">' + sig.map(function(s){ return '<div class="' + (s[1] ? 'on' : '') + '">' + ico(s[1] ? 'alert' : 'check') + '<span>' + esc(T(s[0])) + '</span><b>' + s[2] + '</b></div>'; }).join('') + '</div></div>';
    h += row([cell(12, { en:'Unemployment & the Sahm rule', th:'อัตราว่างงานและสัญญาณ Sahm' }, lc({ series:[{ name:{ en:'Unemployment', th:'ว่างงาน' }, pts:histSince('unrate', 10), color:COL.a, w:2.8 }, { name:{ en:'Sahm rule', th:'Sahm' }, pts:histSince('sahm', 10), color:COL.f }], unit:'%', ref:[{ v:0.5, label:{ en:'Sahm trigger 0.5', th:'เส้นเตือน Sahm 0.5' } }], rec:D.b && D.b.recessions, h:340 }, BIG), 'user')]);
    h += row([cell(6, { en:'New jobs each month (thousands)', th:'จำนวนงานใหม่ต่อเดือน (พันตำแหน่ง)' }, barChart(lastN(mac('payrolls') && mac('payrolls').hist, 36), { unit:'k', W:760, h:330 }), 'factory'),
      cell(6, { en:'Weekly jobless claims (thousands)', th:'คนขอสวัสดิการว่างงานรายสัปดาห์ (พันคน)' }, lc({ series:[{ name:{ en:'Claims', th:'ขอสวัสดิการ' }, pts:histSince('claims', 3), color:COL.d, area:true }], unit:'k', dec:0 }, MID), 'user')]);
    h += row([cell(6, { en:'Spending & production growth (y/y)', th:'การใช้จ่ายและการผลิตโต (เทียบปีก่อน)' }, lc({ series:[{ name:{ en:'Retail sales', th:'ค้าปลีก' }, pts:histSince('retail', 6), color:COL.e }, { name:{ en:'Industrial output', th:'การผลิต' }, pts:histSince('indpro', 6), color:COL.b }, { name:{ en:'Wages', th:'ค่าจ้าง' }, pts:histSince('wages', 6), color:COL.d }, { name:{ en:'CPI', th:'เงินเฟ้อ' }, pts:histSince('cpi', 6), color:COL.g, dash:'4 4', w:1.5 }], unit:'%', zero:true }, MID), 'trend'),
      cell(6, { en:'Real GDP growth (annualised, by quarter)', th:'GDP จริงรายไตรมาส (ปรับเป็นต่อปี)' }, barChart(lastN(mac('gdp') && mac('gdp').hist, 20), { unit:'%', dec:1, up:'#22d3ee', W:760, h:330 }), 'globe')]);
    return h;
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
    if(C.oilY > 25) thSay.push({ en:'Thailand imports most of its oil, so expensive crude widens the import bill and pushes local prices up — energy producers gain, airlines and transport lose.', th:'ไทยนำเข้าน้ำมันเกือบทั้งหมด น้ำมันแพงทำให้ค่าใช้จ่ายนำเข้าสูงและดันราคาสินค้าในประเทศ ผู้ผลิตพลังงานได้ประโยชน์ สายการบินและขนส่งเสียประโยชน์' });
    if(!thSay.length) thSay.push({ en:'No strong currency or commodity pressure on Thailand right now.', th:'ตอนนี้ยังไม่มีแรงกดดันจากค่าเงินหรือสินค้าโภคภัณฑ์ต่อไทยมากนัก' });
    h += '<div class="bz-callout mid">' + ico('globe') + '<div><b>' + esc(T({ en:'What it means for Thailand', th:'แปลว่าอะไรสำหรับไทย' })) + '</b>' + thSay.map(function(t){ return '<p>' + esc(T(t)) + '</p>'; }).join('') + '</div></div>';
    var ccy = D.m.ccy || {}, rows = Object.keys(ccy).filter(function(k){ return k !== 'USD' && isNum(ccy[k].m1); }).map(function(k){ return { k:k, m1:ccy[k].m1, ytd:ccy[k].ytd, r:ccy[k].rate }; }).sort(function(a, b){ return b.m1 - a.m1; });
    h += '<div class="bz-sec"><h4>' + ico('coin') + esc(T({ en:'Currencies vs the US dollar', th:'ค่าเงินทั่วโลกเทียบดอลลาร์' })) + '</h4><div class="bz-fxg">' + rows.map(function(r){
      return '<div class="' + heatCls(r.m1, 0.6) + (r.k === 'THB' ? ' me' : '') + '"><b>' + r.k + '</b><strong>' + spc(r.m1, 1) + '</strong><em>1M · YTD ' + spc(r.ytd, 1) + '</em><small>' + f(r.r, r.r > 100 ? 0 : 3) + ' / $</small></div>';
    }).join('') + '</div>' + note({ en:'Positive = the currency strengthened against the US dollar. Thai baht is outlined.', th:'บวก = ค่าเงินนั้นแข็งขึ้นเมื่อเทียบดอลลาร์ ช่องที่มีกรอบคือเงินบาท' }) + '</div>';
    h += row([cell(12, { en:'Crude oil (WTI, $ per barrel)', th:'น้ำมันดิบ WTI (ดอลลาร์ต่อบาร์เรล)' }, lc({ series:[{ name:{ en:'WTI', th:'WTI' }, pts:histSince('oil', 6), color:COL.d, area:true, w:2.6 }], unit:'', dec:1, rec:D.b && D.b.recessions, h:340 }, BIG), 'barrel')]);
    var A = (D.m.flows && D.m.flows.asset) || [];
    h += '<div class="bz-sec"><h4>' + ico('layers') + esc(T({ en:'Every asset class at a glance', th:'สินทรัพย์ทุกประเภทในตารางเดียว' })) + '</h4><div class="bz-tw"><table class="bz-heat big"><thead><tr><th></th><th>' + esc(T({ en:'Price', th:'ราคา' })) + '</th><th>1W</th><th>1M</th><th>3M</th><th>6M</th><th>YTD</th><th>RSI</th><th>' + esc(T({ en:'trend', th:'แนวโน้ม' })) + '</th></tr></thead><tbody>' +
      A.map(function(a){ return '<tr><td><b>' + esc(a.sym) + '</b><em>' + esc(L() === 'th' ? a.th : a.en) + '</em></td><td>' + f(a.price, 2) + '</td>' + ['w1', 'm1', 'm3', 'm6', 'ytd'].map(function(k){ return '<td class="' + heatCls(a[k], k === 'w1' ? 0.4 : k === 'm1' ? 1 : k === 'm3' ? 1.8 : 2.5) + '">' + spc(a[k], 1) + '</td>'; }).join('') + '<td>' + f(a.rsi, 0) + '</td><td>' + (a.above_ma200 ? '<span class="bz-up">' + esc(T({ en:'up', th:'ขาขึ้น' })) + '</span>' : '<span class="bz-dn">' + esc(T({ en:'down', th:'ขาลง' })) + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    return h;
  }

  function quadrant(list){
    if(!list.length) return '';
    var W = 1000, H = 560, P = 50, xs = list.map(function(s){ return s.m1; }), ys = list.map(function(s){ return s.m3; });
    var xm = Math.max(3, Math.max.apply(null, xs.map(Math.abs))) * 1.2, ym = Math.max(5, Math.max.apply(null, ys.map(Math.abs))) * 1.2;
    var X = function(v){ return P + (v + xm) / (2 * xm) * (W - 2 * P); }, Y = function(v){ return P / 2 + (1 - (v + ym) / (2 * ym)) * (H - 1.5 * P); };
    var s = '<rect class="bz-qd lead" x="' + X(0) + '" y="' + Y(ym) + '" width="' + (X(xm) - X(0)) + '" height="' + (Y(0) - Y(ym)) + '"/><rect class="bz-qd weak" x="' + X(-xm) + '" y="' + Y(ym) + '" width="' + (X(0) - X(-xm)) + '" height="' + (Y(0) - Y(ym)) + '"/>' +
      '<rect class="bz-qd lag" x="' + X(-xm) + '" y="' + Y(0) + '" width="' + (X(0) - X(-xm)) + '" height="' + (Y(-ym) - Y(0)) + '"/><rect class="bz-qd imp" x="' + X(0) + '" y="' + Y(0) + '" width="' + (X(xm) - X(0)) + '" height="' + (Y(-ym) - Y(0)) + '"/>';
    [[xm, ym, { en:'LEADING', th:'นำตลาด' }, 'end', 22], [-xm, ym, { en:'FADING', th:'เริ่มแผ่ว' }, 'start', 22], [-xm, -ym, { en:'LAGGING', th:'ตามหลัง' }, 'start', -10], [xm, -ym, { en:'IMPROVING', th:'เริ่มฟื้น' }, 'end', -10]].forEach(function(l){ s += '<text class="bz-qdl big" x="' + (X(l[0]) + (l[3] === 'end' ? -12 : 12)) + '" y="' + (Y(l[1]) + l[4]) + '" text-anchor="' + l[3] + '">' + esc(T(l[2])) + '</text>'; });
    niceTicks(-xm, xm, 6).forEach(function(v){ s += '<text class="bz-ax" x="' + X(v) + '" y="' + (Y(0) + 16) + '" text-anchor="middle">' + v + '%</text>'; });
    niceTicks(-ym, ym, 6).forEach(function(v){ if(v) s += '<text class="bz-ax" x="' + (X(0) - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '%</text>'; });
    s += '<line class="bz-qa" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + Y(ym) + '" y2="' + Y(-ym) + '"/><line class="bz-qa" x1="' + X(-xm) + '" x2="' + X(xm) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    s += '<text class="bz-ax big" x="' + (W - P) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(T({ en:'1-month return →', th:'ผลตอบแทน 1 เดือน →' })) + '</text><text class="bz-ax big" x="' + (P + 4) + '" y="' + (P / 2 + 14) + '">' + esc(T({ en:'↑ 3-month return', th:'↑ ผลตอบแทน 3 เดือน' })) + '</text>';
    list.forEach(function(it){
      s += '<g class="bz-qp' + (it.fav ? ' fav' : '') + '"><circle cx="' + X(it.m1).toFixed(1) + '" cy="' + Y(it.m3).toFixed(1) + '" r="' + (it.fav ? 11 : 8) + '"/><text x="' + (X(it.m1) + 14).toFixed(1) + '" y="' + (Y(it.m3) - 2).toFixed(1) + '">' + esc(it.label) + '</text><text class="sub" x="' + (X(it.m1) + 14).toFixed(1) + '" y="' + (Y(it.m3) + 13).toFixed(1) + '">' + esc(it.title) + '</text><title>' + esc(it.title) + ': 1M ' + spc(it.m1, 1) + ', 3M ' + spc(it.m3, 1) + '</title></g>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg">' + s + '</svg>';
  }
  function vRot(E){
    var ph = PHASES[E.phase], S = (D.m.flows && D.m.flows.sector) || [], Cn = (D.m.flows && D.m.flows.country) || [];
    var ETF_SEC = { XLK:'Technology', XLF:'Financial Services', XLE:'Energy', XLV:'Healthcare', XLY:'Consumer Cyclical', XLP:'Consumer Defensive', XLI:'Industrials', XLU:'Utilities', XLB:'Basic Materials', XLRE:'Real Estate', XLC:'Communication Services', SMH:'Technology' };
    var isFav = function(sym){ return ph.sectors.indexOf(ETF_SEC[sym]) >= 0 || ph.etf.indexOf(sym) >= 0; };
    var list = S.map(function(s){ return { label:s.sym, title:L() === 'th' ? s.th : s.en, m1:s.m1, m3:s.m3, fav:isFav(s.sym) }; });
    var ranked = S.slice().sort(function(a, b){ return (b.m3 + b.m1) - (a.m3 + a.m1); }), leaders = ranked.slice(0, 4).map(function(s){ return s.sym; });
    var match = leaders.filter(isFav).length;
    var h = '<div class="bz-callout ' + (match >= 2 ? 'good' : 'mid') + '">' + ico('compass') + '<div><b>' + esc(T({ en:'Does the market agree with the phase?', th:'ตลาดจริงตรงกับช่วงเศรษฐกิจไหม' })) + '</b><p>' +
      esc(T({ en:'Leading sectors now: ' + leaders.join(', ') + '. ' + match + ' of 4 are ones the “' + ph.short.en + '” phase usually favours' + (match >= 2 ? ' — the market is behaving as the phase suggests.' : ' — the market is not following the textbook yet; the phase call may be early.'),
        th:'กลุ่มที่นำตอนนี้: ' + leaders.join(', ') + ' ตรงกับกลุ่มที่ช่วง “' + ph.short.th + '” มักเด่น ' + match + ' จาก 4 กลุ่ม' + (match >= 2 ? ' แปลว่าตลาดเคลื่อนไหวตามสภาวะเศรษฐกิจ' : ' แปลว่าตลาดยังไม่เป็นไปตามตำรา การอ่านช่วงเศรษฐกิจอาจเร็วไป') })) + '</p></div></div>';
    var rk = '<div class="bz-rank">' + ranked.map(function(s, i){ return '<div class="' + (isFav(s.sym) ? 'fav' : '') + '"><span class="i">' + (i + 1) + '</span><b>' + s.sym + '</b><em>' + esc(L() === 'th' ? s.th : s.en) + '</em><span class="' + (s.m1 >= 0 ? 'up' : 'dn') + '">1M ' + spc(s.m1, 1) + '</span><span class="' + (s.m3 >= 0 ? 'up' : 'dn') + '">3M ' + spc(s.m3, 1) + '</span></div>'; }).join('') + '</div>';
    h += row([cell(8, { en:'Sector rotation map', th:'แผนที่การหมุนเวียนกลุ่มหุ้น' }, quadrant(list) + note({ en:'Bigger cyan dots = sectors the current phase usually favours. Money tends to rotate clockwise: improving → leading → fading → lagging.', th:'จุดใหญ่สีฟ้า = กลุ่มที่ช่วงเศรษฐกิจตอนนี้มักเอื้อ เงินมักหมุนตามเข็มนาฬิกา: เริ่มฟื้น → นำตลาด → เริ่มแผ่ว → ตามหลัง' }), 'compass'),
      cell(4, { en:'Sector ranking (1M + 3M)', th:'อันดับกลุ่มหุ้น (1 + 3 เดือน)' }, rk, 'trend')]);
    var cn = Cn.slice().sort(function(a, b){ return b.m3 - a.m3; });
    h += '<div class="bz-sec"><h4>' + ico('globe') + esc(T({ en:'Stock markets by country', th:'ตลาดหุ้นแต่ละประเทศ' })) + '</h4><div class="bz-cng">' + cn.map(function(c){
      return '<div class="' + heatCls(c.m3, 1.8) + (c.sym === 'THD' ? ' me' : '') + '"><b>' + esc(L() === 'th' ? c.th : c.en) + '</b><small>' + c.sym + '</small><strong>' + spc(c.m3, 1) + '</strong><em>1M ' + spc(c.m1, 1) + ' · YTD ' + spc(c.ytd, 1) + '</em></div>';
    }).join('') + '</div>' + note({ en:'Big number = 3-month return.', th:'ตัวเลขใหญ่ = ผลตอบแทน 3 เดือน' }) + '</div>';
    var P = pairs();
    h += '<div class="bz-sec"><h4>' + ico('swap') + esc(T({ en:'Pairs that work well together right now', th:'คู่สินทรัพย์ที่ถือคู่กันแล้วดี ตอนนี้' })) + '</h4>' + (P.length ? '<div class="bz-pairs">' + P.map(function(p){
      var a = info(p.a), b = info(p.b), cw = clamp((1 - p.c) / 2 * 100, 0, 100);
      return '<div class="bz-pair"><div class="pa"><b>' + p.a + '</b><em>' + esc(a ? a.n : '') + '</em></div><span class="pl">' + ico('plus') + '</span><div class="pb"><b>' + p.b + '</b><em>' + esc(b ? b.n : '') + '</em></div>' +
        '<div class="pm"><span>' + esc(T({ en:'Correlation', th:'ความสัมพันธ์' })) + '</span><i><u style="width:' + cw.toFixed(0) + '%"></u></i><b>' + f(p.c, 2) + '</b></div><div class="pm"><span>' + esc(T({ en:'50/50 swings', th:'แกว่งเมื่อถือคู่' })) + '</span><b>' + f(p.vol, 0) + '% / ' + esc(T({ en:'yr', th:'ปี' })) + '</b></div>' +
        '<p>' + esc(T({ en:p.c < 0 ? 'Often move in opposite directions — one cushions the other.' : p.c < 0.4 ? 'Move fairly independently — good spread of risk.' : 'Move somewhat together — modest diversification.', th:p.c < 0 ? 'มักเคลื่อนไหวสวนทางกัน ตัวหนึ่งช่วยรองรับอีกตัว' : p.c < 0.4 ? 'เคลื่อนไหวค่อนข้างอิสระ กระจายความเสี่ยงได้ดี' : 'เคลื่อนไหวไปด้วยกันบ้าง กระจายความเสี่ยงได้พอประมาณ' })) + '</p></div>';
    }).join('') + '</div>' : note({ en:'Needs the weekly ETF data in brain.json.', th:'ต้องใช้ข้อมูล ETF รายสัปดาห์ใน brain.json' })) + '</div>';
    h += row([basket('us', { en:'US stocks that fit today', th:'หุ้นสหรัฐฯ ที่เข้ากับสภาวะตอนนี้' }), basket('th', { en:'Thai stocks that fit today', th:'หุ้นไทยที่เข้ากับสภาวะตอนนี้' })]);
    return h;
  }
  function basket(mk, title){
    var rows = autoPick(mk, 8);
    return cell(6, title, rows.length ? '<div class="bz-tw"><table class="bz-tbl big"><thead><tr><th></th><th>' + esc(T({ en:'Quality', th:'คุณภาพ' })) + '</th><th>' + esc(T({ en:'Price', th:'ราคา' })) + '</th><th>' + esc(T({ en:'Trend', th:'แนวโน้ม' })) + '</th><th>P/E</th><th>ROE</th><th>' + esc(T({ en:'Div', th:'ปันผล' })) + '</th><th>3M</th></tr></thead><tbody>' + rows.map(function(r){
      var s = r.c.I.s;
      return '<tr><td><b>' + esc(r.t) + '</b><em>' + esc(sectName(r.sec)) + '</em></td><td>' + stars(r.c.q) + '</td><td>' + stars(r.c.v) + '</td><td>' + stars(r.c.m) + '</td><td>' + f(s.pe, 1) + '</td><td>' + pc(s.roe, 0) + '</td><td>' + pc(s.div, 1) + '</td><td class="' + (s.m3 >= 0 ? 'up' : 'dn') + '">' + spc(s.m3, 1) + '</td></tr>';
    }).join('') + '</tbody></table></div><button type="button" class="bz-btn" data-pfmode="auto' + mk + '">' + ico('flask') + esc(T({ en:'Analyse this basket as a portfolio', th:'วิเคราะห์ตะกร้านี้แบบพอร์ต' })) + '</button>' : note({ en:'Not enough data.', th:'ข้อมูลไม่พอ' }), 'star', 'bk');
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
    var F = F_last || {}, sig = recessionSignals(E).filter(function(s){ return s[1]; }).length;
    var mtr = function(label, v, lo, hi, txt, col){ var p = clamp((v - lo) / (hi - lo) * 100, 0, 100); return '<div class="bz-wm"><span>' + esc(T(label)) + '</span><div class="bz-wmb"><i style="left:' + p.toFixed(0) + '%;background:' + col + '"></i></div><div class="bz-wml"><em>' + lo + '</em><b style="color:' + col + '">' + txt + '</b><em>+' + hi + '</em></div></div>'; };
    h += '<div class="bz-sec bz-how"><h4>' + ico('radar') + esc(T({ en:'How the odds were weighed', th:'คิดโอกาสจากอะไร' })) + '</h4><div class="bz-howg">' +
      '<div class="bz-hw a">' + ico('factory') + '<h5>' + esc(T({ en:'Growth momentum', th:'แรงส่งเศรษฐกิจ' })) + '</h5>' + mtr({ en:'−1 slowing … +1 accelerating', th:'−1 ชะลอ … +1 เร่งตัว' }, E.g, -1, 1, sg(E.g, 2), E.g >= 0 ? '#34d399' : '#fb7185') + '<p>' + esc(T({ en:'Jobs, spending, output, sentiment and cyclical stocks vs defensives.', th:'การจ้างงาน การใช้จ่าย การผลิต ความเชื่อมั่น และหุ้นวัฏจักรเทียบหุ้นตั้งรับ' })) + '</p></div>' +
      '<div class="bz-hw b">' + ico('flame') + '<h5>' + esc(T({ en:'Inflation momentum', th:'แรงส่งเงินเฟ้อ' })) + '</h5>' + mtr({ en:'−1 cooling … +1 heating', th:'−1 เย็นลง … +1 ร้อนขึ้น' }, E.i, -1, 1, sg(E.i, 2), E.i >= 0 ? '#fb923c' : '#22d3ee') + '<p>' + esc(T({ en:'Core PCE and CPI trend, 5-year expectations, oil.', th:'ทิศทาง Core PCE และ CPI เงินเฟ้อคาด 5 ปี และน้ำมัน' })) + '</p></div>' +
      '<div class="bz-hw c">' + ico('alert') + '<h5>' + esc(T({ en:'Recession clues', th:'เบาะแสถดถอย' })) + '</h5><div class="bz-big">' + sig + '<small>/10</small></div><p>' + esc(T({ en:'Sahm rule, claims, credit spreads, curve history, breadth and the Fed\'s recession model' + (F.rec ? ' · 12-month odds ' + f(F.rec.p, 0) + '%' : '') + '.', th:'สัญญาณ Sahm คนขอสวัสดิการ ส่วนต่างหุ้นกู้ ประวัติเส้นยีลด์ ความกว้างตลาด และโมเดลของเฟด' + (F.rec ? ' · โอกาส 12 เดือน ' + f(F.rec.p, 0) + '%' : '') })) + '</p></div>' +
      '<div class="bz-hw d">' + ico('bank') + '<h5>' + esc(T({ en:'Rate pressure', th:'แรงกดดันดอกเบี้ย' })) + '</h5><div class="bz-big">' + sg(E.fed.gap, 2) + '<small>pt</small></div><p>' + esc(T({ en:'2-year yield minus the Fed rate' + (F.fed ? '; Taylor rule ' + pc(F.fed.taylor, 2) : '') + '.', th:'บอนด์ 2 ปีลบดอกเบี้ยเฟด' + (F.fed ? ' · กฎเทย์เลอร์ ' + pc(F.fed.taylor, 2) : '') })) + '</p></div>' +
      '</div><div class="bz-flowline">' + E.scen.map(function(s){ return '<span class="bz-sc-' + s.k + '" style="flex:' + Math.max(4, s.p) + '"><b>' + esc(T(s.name)) + '</b> ' + s.p + '%</span>'; }).join('') + '</div>' +
      '<p class="bz-note">' + esc(T({ en:'The four readings are combined into a score for each path and turned into odds that add up to 100%. They update automatically whenever the data does.', th:'นำค่าทั้ง 4 ด้านมารวมเป็นคะแนนของแต่ละเส้นทาง แล้วแปลงเป็นโอกาสที่รวมกันได้ 100% อัปเดตเองทุกครั้งที่ข้อมูลเปลี่ยน' })) + '</p></div>';
    return h;
  }

  function vCal(){
    var ev = (D.econ && D.econ.economicCalendar) || [], now = Date.now() - 6 * 3600e3;
    var ts = function(e){ return Date.parse(e.time.replace(' ', 'T') + 'Z'); };
    var show = ev.filter(function(e){ return e.impact === 'high' || e.impact === 'medium'; }).sort(function(a, b){ return ts(a) - ts(b); });
    var days = {}, order = [];
    show.forEach(function(e){ var d = new Date(ts(e) + 7 * 3600e3).toISOString().slice(0, 10); if(!days[d]){ days[d] = []; order.push(d); } days[d].push(e); });
    var todayK = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
    var whyOf = function(e){ for(var i = 0; i < EVT.length; i++){ if(EVT[i][0].test(e.event)) return T(EVT[i][1]); } return ''; };
    var upcoming = show.filter(function(e){ return ts(e) >= now; }).length;
    var h = !show.length ? '' : '<div class="bz-callout ' + (upcoming ? 'good' : 'mid') + '">' + ico('cal') + '<div><b>' + esc(T(upcoming ? { en:upcoming + ' important releases still to come', th:'ยังมีตัวเลขสำคัญรอประกาศอีก ' + upcoming + ' รายการ' } : { en:'This week\'s releases are done', th:'ตัวเลขของสัปดาห์นี้ประกาศครบแล้ว' })) + '</b><p>' + esc(T(upcoming ? { en:'Times are Thailand time. Red edge = market-moving.', th:'เวลาเป็นเวลาไทย ขอบแดง = ตัวเลขที่ขยับตลาดแรง' } : { en:'Next week\'s calendar is usually published over the weekend and appears here automatically. Below is the week that just ended.', th:'ปฏิทินสัปดาห์หน้ามักออกช่วงเสาร์–อาทิตย์ และจะขึ้นที่นี่เองอัตโนมัติ ด้านล่างคือสัปดาห์ที่เพิ่งผ่านไป' })) + '</p></div></div>';
    h += '<div class="bz-calg">' + (order.length ? order.map(function(d){
      var past = d < todayK, dd = new Date(tms(d));
      return '<div class="bz-day' + (past ? ' past' : '') + (d === todayK ? ' today' : '') + '"><div class="bz-dh"><b>' + dd.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { weekday:'long', timeZone:'UTC' }) + '</b><span>' + dd.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', timeZone:'UTC' }) + '</span>' + (d === todayK ? '<i>' + esc(T({ en:'today', th:'วันนี้' })) + '</i>' : past ? '<i class="p">' + esc(T({ en:'done', th:'ผ่านแล้ว' })) + '</i>' : '') + '</div>' +
        (function(list){ var hi = list.filter(function(e){ return e.impact === 'high'; }), md = list.filter(function(e){ return e.impact !== 'high'; }), first = hi.concat(md).slice(0, Math.max(4, hi.length)), rest = hi.concat(md).slice(first.length); return first.concat(rest.length ? [{ __more:rest }] : []); })(days[d]).map(function(e){ if(e.__more) return '<details class="bz-more"><summary>+' + e.__more.length + ' ' + esc(T({ en:'more (medium impact)', th:'รายการ (สำคัญปานกลาง)' })) + '</summary>' + e.__more.map(function(x){ return '<div class="bz-ev ' + x.impact + '"><time>' + new Date(ts(x)).toLocaleTimeString(L() === 'th' ? 'th-TH' : 'en-GB', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Bangkok' }) + '</time><span class="ct">' + esc(x.country) + '</span><div><b>' + esc(x.event) + '</b><small>' + (x.estimate != null ? esc(T({ en:'exp ', th:'คาด ' })) + x.estimate + (x.unit || '') : '') + (x.prev != null ? ' · ' + esc(T({ en:'prev ', th:'ครั้งก่อน ' })) + x.prev + (x.unit || '') : '') + '</small></div></div>'; }).join('') + '</details>'; var w = whyOf(e); return '<div class="bz-ev ' + e.impact + '"><time>' + new Date(ts(e)).toLocaleTimeString(L() === 'th' ? 'th-TH' : 'en-GB', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Bangkok' }) + '</time><span class="ct">' + esc(e.country) + '</span><div><b>' + esc(e.event) + '</b>' + (w ? '<em>' + esc(w) + '</em>' : '') + '<small>' + (e.estimate != null ? esc(T({ en:'exp ', th:'คาด ' })) + e.estimate + (e.unit || '') : '') + (e.prev != null ? ' · ' + esc(T({ en:'prev ', th:'ครั้งก่อน ' })) + e.prev + (e.unit || '') : '') + (e.actual != null ? ' · <strong>' + esc(T({ en:'actual ', th:'ออกจริง ' })) + e.actual + (e.unit || '') + '</strong>' : '') + '</small></div></div>'; }).join('') + '</div>';
    }).join('') : note({ en:'No medium/high-impact releases in the calendar file right now. It refreshes twice a day.', th:'ตอนนี้ยังไม่มีตัวเลขสำคัญในปฏิทิน ไฟล์ปฏิทินอัปเดตวันละ 2 ครั้ง' })) + '</div>';
    var E = E_last, w = [];
    E.scen.forEach(function(s){ s.trig.forEach(function(t){ if(isNum(t.cur)){ var dist = t.dir > 0 ? (t.thr - t.cur) / Math.abs(t.thr) : (t.cur - t.thr) / Math.abs(t.thr); w.push({ s:s, t:t, dist:dist }); } }); });
    w.sort(function(a, b){ return a.dist - b.dist; });
    h += '<h3 class="bz-h3">' + ico('radar') + esc(T({ en:'Our own tripwires — closest first', th:'เส้นเตือนของเรา — เรียงจากที่ใกล้จะถึงที่สุด' })) + '</h3><div class="bz-wires">' + w.slice(0, 8).map(function(x){
      var hit = x.dist <= 0, p = clamp(100 - x.dist * 100, 0, 100);
      return '<div class="' + (hit ? 'on' : '') + '"><span>' + esc(T(x.s.name)) + '</span><b>' + esc(T(x.t.n)) + ' ' + f(x.t.thr, x.t.d) + x.t.unit + '</b><i><u style="width:' + p.toFixed(0) + '%"></u></i><em>' + esc(T({ en:'now', th:'ตอนนี้' })) + ' ' + f(x.t.cur, x.t.d) + x.t.unit + ' · ' + (hit ? esc(T({ en:'reached', th:'ถึงแล้ว' })) : esc(T({ en:'distance ', th:'ห่าง ' })) + f(x.dist * 100, 0) + '%') + '</em></div>';
    }).join('') + '</div>';
    return h;
  }

  /* ================================================== GUIDE + PRINT (2026-10-25 c) */
  var GUIDE = [
    ['sum', 'layers', { en:'Summary', th:'สรุปทุกอย่าง' }, { en:'The whole picture on one screen: now, ahead and how to position.', th:'ภาพรวมทั้งหมดในหน้าเดียว: ตอนนี้ ข้างหน้า และควรจัดพอร์ตอย่างไร' },
      [{ en:'Read the three lines in the gradient box first: Now → Ahead → Positioning.', th:'อ่าน 3 บรรทัดในกล่องขอบไล่สีก่อน: ตอนนี้ → ข้างหน้า → การจัดพอร์ต' }, { en:'Forecast cards: left number = now, coloured number = 6 months ahead; the shaded fan is the likely range.', th:'การ์ดคาดการณ์: เลขซ้าย = ตอนนี้ เลขสี = อีก 6 เดือน แถบจางคือช่วงที่น่าจะเป็น' }, { en:'In the big table, the dot colour in the last column tells you if it is good (green) or bad (red) for stocks. Click a row to open its details.', th:'ในตารางใหญ่ จุดสีในคอลัมน์สุดท้ายบอกว่าดี (เขียว) หรือไม่ดี (แดง) ต่อหุ้น กดที่แถวเพื่อดูรายละเอียด' }]],
    ['fc', 'radar', { en:'Forecast', th:'พยากรณ์ล่วงหน้า' }, { en:'Where each key number is heading over 3, 6 and 12 months, and why.', th:'ตัวเลขสำคัญแต่ละตัวกำลังจะไปทางไหนใน 3, 6 และ 12 เดือน และเพราะอะไร' },
      [{ en:'Solid line = history. Dashed line in the purple zone = forecast. Darker band = 68% likely, lighter = 95%.', th:'เส้นทึบ = ข้อมูลจริง เส้นประในโซนม่วง = คาดการณ์ แถบเข้ม = โอกาส 68% แถบจาง = 95%' }, { en:'Bullets under each chart say exactly what the forecast is built from.', th:'ข้อความใต้กราฟบอกชัดเจนว่าคาดการณ์มาจากอะไร' }, { en:'Leading index above 50 = economy should keep expanding; below 50 = slowing.', th:'ดัชนีชี้นำเกิน 50 = เศรษฐกิจน่าจะยังขยายตัว ต่ำกว่า 50 = กำลังชะลอ' }]],
    ['over', 'brain', { en:'Market today', th:'ภาพรวมวันนี้' }, { en:'The weather gauge, investment clock and nine drivers of the market.', th:'เกจสภาพอากาศตลาด นาฬิกาการลงทุน และ 9 เรื่องที่ขับเคลื่อนตลาด' },
      [{ en:'Gauge 0–100: above 55 the backdrop helps stocks, below 45 it hurts.', th:'เกจ 0–100: เกิน 55 สภาวะช่วยหุ้น ต่ำกว่า 45 กดดันหุ้น' }, { en:'The white dot on the clock shows the economic phase and which assets usually lead.', th:'จุดขาวบนนาฬิกาบอกช่วงเศรษฐกิจ และสินทรัพย์ที่มักนำในช่วงนั้น' }, { en:'“What changed” tiles: bigger bar = a bigger-than-usual move.', th:'ช่อง “อะไรเปลี่ยนไป”: แถบยิ่งยาว = ขยับแรงกว่าปกติมาก' }]],
    ['infl', 'flame', { en:'Inflation & rates', th:'เงินเฟ้อ & ดอกเบี้ย' }, { en:'Prices, the Fed and bond yields.', th:'ราคาสินค้า เฟด และบอนด์ยีลด์' },
      [{ en:'Inflation inside the green band (≈2%) = the Fed is relaxed.', th:'เงินเฟ้ออยู่ในแถบเขียว (≈2%) = เฟดสบายใจ' }, { en:'2-year yield far above the Fed rate = hikes being priced.', th:'บอนด์ 2 ปีสูงกว่าดอกเบี้ยเฟดมาก = ตลาดคาดว่าจะขึ้นดอกเบี้ย' }, { en:'Real yield above 2% = expensive money, tough for growth stocks.', th:'ยีลด์จริงเกิน 2% = เงินแพง ยากสำหรับหุ้นเติบโต' }]],
    ['growth', 'factory', { en:'Economy & jobs', th:'เศรษฐกิจ & การจ้างงาน' }, { en:'Jobs, spending and the recession checklist.', th:'การจ้างงาน การใช้จ่าย และเช็กลิสต์ถดถอย' },
      [{ en:'Red tiles in the checklist are warning lights; 6+ lit is serious.', th:'ช่องแดงในเช็กลิสต์คือไฟเตือน ถ้าติด 6 ดวงขึ้นไปถือว่าน่าห่วง' }, { en:'Sahm line crossing 0.5 has marked every US recession since 1970.', th:'เส้น Sahm ทะลุ 0.5 เกิดขึ้นทุกครั้งที่สหรัฐฯ ถดถอยตั้งแต่ปี 1970' }, { en:'Grey columns on charts are official recessions.', th:'แถบเทาในกราฟคือช่วงถดถอยอย่างเป็นทางการ' }]],
    ['fx', 'coin', { en:'Currencies & commodities', th:'ค่าเงิน & สินค้าโภคภัณฑ์' }, { en:'Dollar, baht, oil, gold and every asset class.', th:'ดอลลาร์ เงินบาท น้ำมัน ทอง และสินทรัพย์ทุกประเภท' },
      [{ en:'Green tiles = currency strengthened vs the dollar.', th:'ช่องเขียว = ค่าเงินแข็งขึ้นเทียบดอลลาร์' }, { en:'“What it means for Thailand” translates moves into local impact.', th:'กล่อง “แปลว่าอะไรสำหรับไทย” แปลการเคลื่อนไหวเป็นผลต่อไทย' }, { en:'In the asset table, scan the 3M column for leaders.', th:'ในตารางสินทรัพย์ ดูคอลัมน์ 3M เพื่อหาตัวนำ' }]],
    ['rot', 'compass', { en:'Rotation & ideas', th:'เงินไหลไปไหน & ไอเดีย' }, { en:'Which sectors and countries money is moving into, plus stock ideas.', th:'เงินกำลังไหลเข้ากลุ่มหุ้นและประเทศไหน พร้อมไอเดียหุ้น' },
      [{ en:'Top-right of the map = leading; bottom-right = just starting to improve (often the best entries).', th:'มุมขวาบนของแผนที่ = นำตลาด มุมขวาล่าง = เพิ่งเริ่มฟื้น (มักเป็นจุดเข้าที่ดี)' }, { en:'Pairs: lower correlation = better protection when held together.', th:'คู่สินทรัพย์: ความสัมพันธ์ยิ่งต่ำ ยิ่งช่วยกันกันความเสี่ยงได้ดี' }, { en:'Stock baskets use quality, price, trend and phase fit — open one as a portfolio to test it.', th:'ตะกร้าหุ้นคัดจากคุณภาพ ราคา แนวโน้ม และความเข้ากับช่วงเศรษฐกิจ กดเปิดเป็นพอร์ตเพื่อทดสอบได้' }]],
    ['out', 'radar', { en:'Outlook 1–3 months', th:'แนวโน้ม 1–3 เดือน' }, { en:'Three scenarios with odds and tripwires.', th:'3 สถานการณ์พร้อมโอกาสและเส้นเตือน' },
      [{ en:'The card with the glowing border is the most likely path.', th:'การ์ดที่มีขอบเรืองแสงคือเส้นทางที่น่าจะเกิดมากที่สุด' }, { en:'Tripwire bars fill up as the number approaches its trigger.', th:'แถบเส้นเตือนจะเต็มขึ้นเรื่อยๆ เมื่อตัวเลขเข้าใกล้จุดเตือน' }, { en:'If tripwires of a less likely scenario start lighting up, the odds will shift.', th:'ถ้าเส้นเตือนของสถานการณ์ที่โอกาสน้อยเริ่มติด โอกาสจะเปลี่ยนตาม' }]],
    ['pf', 'pie', { en:'My portfolio', th:'พอร์ตของฉัน' }, { en:'Health check, risk, stress tests, re-balancing and report cards.', th:'ตรวจสุขภาพพอร์ต ความเสี่ยง ทดสอบวิกฤต ปรับสัดส่วน และสมุดพก' },
      [{ en:'Signed in with LINE/Telegram = your account\'s tickers; otherwise pick a model or your simulation.', th:'ล็อกอิน LINE/Telegram = ใช้หุ้นในบัญชี ถ้าไม่ล็อกอินเลือกพอร์ตตัวอย่างหรือพอร์ตจำลอง' }, { en:'Health above 70 = well built; fix the red items first.', th:'สุขภาพเกิน 70 = จัดพอร์ตดี แก้ข้อสีแดงก่อน' }, { en:'“Use these weights” applies the suggested re-balance in one click.', th:'ปุ่ม “ใช้สัดส่วนนี้” ปรับตามคำแนะนำได้ในคลิกเดียว' }]],
    ['cal', 'cal', { en:'This week', th:'จับตาสัปดาห์นี้' }, { en:'Economic releases by day (Thai time) and our tripwires.', th:'ตัวเลขเศรษฐกิจรายวัน (เวลาไทย) และเส้นเตือนของเรา' },
      [{ en:'Red edge = high impact, amber = medium.', th:'ขอบแดง = สำคัญมาก ขอบเหลือง = สำคัญปานกลาง' }, { en:'Compare “actual” with “expected” when it comes out: a big miss moves markets.', th:'เทียบ “ออกจริง” กับ “คาด” ถ้าต่างกันมาก ตลาดจะขยับแรง' }, { en:'Tripwires closest to 100% are the ones to watch this week.', th:'เส้นเตือนที่ใกล้ 100% คือสิ่งที่ต้องจับตาสัปดาห์นี้' }]]
  ];
  var GLOSS = [
    ['Core PCE', { en:'Inflation without food and energy — the Fed\'s favourite gauge.', th:'เงินเฟ้อที่ไม่รวมอาหารและพลังงาน เป็นตัวที่เฟดชอบใช้ที่สุด' }],
    ['Fed funds', { en:'The overnight interest rate the US central bank controls.', th:'ดอกเบี้ยข้ามคืนที่ธนาคารกลางสหรัฐฯ ควบคุม' }],
    ['Yield', { en:'The interest a bond pays per year at today\'s price.', th:'ผลตอบแทนต่อปีของพันธบัตร ณ ราคาวันนี้' }],
    ['Yield curve', { en:'Long-term minus short-term yields. Negative (inverted) = warning.', th:'ยีลด์ระยะยาวลบระยะสั้น ถ้าติดลบ (กลับหัว) = สัญญาณเตือน' }],
    ['Real yield', { en:'Bond yield after inflation.', th:'ผลตอบแทนพันธบัตรหลังหักเงินเฟ้อ' }],
    ['Taylor rule', { en:'A formula for where the policy rate “should” be given inflation and jobs.', th:'สูตรคำนวณว่าดอกเบี้ยนโยบาย “ควร” อยู่ที่เท่าไหร่ จากเงินเฟ้อและการจ้างงาน' }],
    ['Sahm rule', { en:'Rise in unemployment vs its 12-month low. ≥0.5 = recession has started.', th:'อัตราว่างงานที่เพิ่มขึ้นจากจุดต่ำสุด 12 เดือน ≥0.5 = เข้าสู่ภาวะถดถอยแล้ว' }],
    ['GDPNow', { en:'The Atlanta Fed\'s live estimate of this quarter\'s growth.', th:'ประมาณการเศรษฐกิจไตรมาสนี้แบบสดของเฟดแอตแลนตา' }],
    ['VIX', { en:'Expected S&P 500 swings from options. Above 25 = fear.', th:'ความผันผวนที่ตลาดออปชันคาดไว้สำหรับ S&P 500 เกิน 25 = ตลาดกลัว' }],
    ['CAPE', { en:'Price ÷ 10-year average earnings. Long-run average ≈ 17.', th:'ราคา ÷ กำไรเฉลี่ย 10 ปี ค่าเฉลี่ยระยะยาวประมาณ 17' }],
    ['Credit spread', { en:'Extra yield junk bonds pay over Treasuries. Widening = stress.', th:'ดอกเบี้ยส่วนเพิ่มของหุ้นกู้เสี่ยงสูงเทียบพันธบัตรรัฐ ถ้ากว้างขึ้น = ตลาดเครียด' }],
    ['Correlation', { en:'−1 move opposite, 0 unrelated, +1 move together.', th:'−1 สวนทาง · 0 ไม่เกี่ยวกัน · +1 ไปทางเดียวกัน' }],
    ['Beta', { en:'How much a holding moves when the market moves 1%.', th:'หุ้นตัวนั้นขยับเท่าไหร่เมื่อตลาดขยับ 1%' }],
    ['Volatility', { en:'Typical yearly swing, in %.', th:'การแกว่งตัวปกติต่อปี เป็น %' }],
    ['Breakeven', { en:'Inflation the bond market expects (nominal minus real yield).', th:'เงินเฟ้อที่ตลาดบอนด์คาด (ยีลด์ปกติลบยีลด์จริง)' }],
    ['DXY', { en:'The US dollar against six major currencies.', th:'ค่าเงินดอลลาร์เทียบ 6 สกุลหลัก' }]
  ];
  function vGuide(){
    var h = '<div class="bz-gintro"><div>' + ico('compass', 'bz-gi') + '</div><div><h3>' + esc(T({ en:'How to use the Market Brain', th:'วิธีใช้สมองตลาด' })) + '</h3><p>' + esc(T({ en:'A 5-minute routine: 1) Summary — read the three lines. 2) Forecast — check the fans for anything turning. 3) This week — note what is released. 4) Rotation — see where money is moving. 5) My portfolio — fix the red items.', th:'ทำ 5 นาทีต่อวัน: 1) สรุปทุกอย่าง อ่าน 3 บรรทัด 2) พยากรณ์ล่วงหน้า ดูว่ามีอะไรกำลังเปลี่ยนทิศ 3) จับตาสัปดาห์นี้ ดูตัวเลขที่จะประกาศ 4) เงินไหลไปไหน ดูว่าเงินกำลังย้ายไปทางไหน 5) พอร์ตของฉัน แก้ข้อสีแดง' })) + '</p></div></div>';
    h += '<div class="bz-steps">' + [1, 2, 3, 4, 5].map(function(n, i){ var g = GUIDE[[0, 1, 9, 6, 8][i]]; return '<button type="button" data-go="' + g[0] + '"><span>' + n + '</span>' + ico(g[1]) + '<b>' + esc(T(g[2])) + '</b></button>'; }).join('') + '</div>';
    h += '<div class="bz-gcards">' + GUIDE.map(function(g){
      return '<div class="bz-gc"><div class="bz-gch">' + ico(g[1]) + '<b>' + esc(T(g[2])) + '</b><button type="button" class="bz-btn sm ghost" data-go="' + g[0] + '">' + esc(T({ en:'Open', th:'เปิด' })) + ' →</button></div><p>' + esc(T(g[3])) + '</p><ul>' + g[4].map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul></div>';
    }).join('') + '</div>';
    h += '<h3 class="bz-h3">' + ico('book') + esc(T({ en:'Words used on this page', th:'คำศัพท์ที่ใช้ในหน้านี้' })) + '</h3><div class="bz-gloss">' + GLOSS.map(function(g){ return '<div><b>' + esc(g[0]) + '</b><span>' + esc(T(g[1])) + '</span></div>'; }).join('') + '</div>';
    h += '<div class="bz-callout mid">' + ico('star') + '<div><b>' + esc(T({ en:'Colours everywhere', th:'ความหมายของสีทั้งหน้า' })) + '</b><p>' + esc(T({ en:'Green = good for stocks · Amber = neutral / watch · Red = bad for stocks · Purple = forecast.', th:'เขียว = ดีต่อหุ้น · เหลือง = กลางๆ / จับตา · แดง = ไม่ดีต่อหุ้น · ม่วง = ค่าคาดการณ์' })) + '</p></div></div>';
    h += '<div class="bz-mwrap">' + vManual() + '</div>';
    return h;
  }

  /* ---------------------------------------------------------------- print */
  var PR = { type:'full', secs:{}, orient:'portrait', theme:'light', cover:true };
  var PR_TYPES = [
    ['full', 'book', { en:'Full report', th:'ฉบับเต็มทุกอย่าง' }, { en:'Every tab of the Market Brain in one document.', th:'ทุกแท็บของสมองตลาดในเอกสารเดียว' }, ['sum', 'fc', 'over', 'infl', 'growth', 'fx', 'rot', 'out', 'pf', 'cal']],
    ['brief', 'layers', { en:'Executive brief', th:'สรุปผู้บริหาร' }, { en:'Cover + summary: now, ahead, table, forecasts. ~3 pages.', th:'ปก + สรุป: ตอนนี้ ข้างหน้า ตาราง และคาดการณ์ ราว 3 หน้า' }, ['sum']],
    ['weekly', 'cal', { en:'Weekly report', th:'รายงานประจำสัปดาห์' }, { en:'Summary, market today and this week\'s calendar.', th:'สรุป ภาพรวมวันนี้ และปฏิทินสัปดาห์นี้' }, ['sum', 'over', 'cal']],
    ['forecast', 'radar', { en:'Forecast report', th:'รายงานพยากรณ์' }, { en:'All forecast charts with methods + the three scenarios.', th:'กราฟคาดการณ์ทั้งหมดพร้อมวิธีคิด + 3 สถานการณ์' }, ['fc', 'out']],
    ['economy', 'factory', { en:'Economy report', th:'รายงานเศรษฐกิจ' }, { en:'Inflation & rates, jobs & growth, currencies & commodities.', th:'เงินเฟ้อและดอกเบี้ย การจ้างงานและเศรษฐกิจ ค่าเงินและสินค้าโภคภัณฑ์' }, ['infl', 'growth', 'fx']],
    ['portfolio', 'pie', { en:'Portfolio report', th:'รายงานพอร์ต' }, { en:'The portfolio currently selected on “My portfolio”.', th:'พอร์ตที่เลือกอยู่ในหน้า “พอร์ตของฉัน”' }, ['pf', 'rot']],
    ['manual', 'flask', { en:'How the Market Brain thinks', th:'คู่มือ: สมองตลาดคิดอย่างไร' }, { en:'Every screen and model explained: what it looks at, how it decides, why — with today\'s numbers.', th:'อธิบายทุกหน้าและทุกโมเดล: ดูอะไร คิดอย่างไร เพราะอะไร พร้อมตัวเลขวันนี้' }, ['manual']],
    ['custom', 'check', { en:'Choose myself', th:'เลือกเอง' }, { en:'Tick exactly the sections you want.', th:'ติ๊กเลือกเฉพาะส่วนที่ต้องการ' }, null]
  ];
  var PR_SECS = ['sum', 'fc', 'over', 'infl', 'growth', 'fx', 'rot', 'out', 'pf', 'cal', 'manual'];
  var MAN_T = { en:'How the Market Brain thinks', th:'คู่มือ: สมองตลาดคิดอย่างไร' };
  var WEB_URL = 'https://terminal.spacezblack.workers.dev/';
  try { PR.analyst = localStorage.getItem('spz.report.analyst') === '1'; } catch(e){}
  PR.hd = { logo:1, brand:1, title:1, sub:1, dates:1, ref:1 };
  try { var hs = JSON.parse(localStorage.getItem('spz.brain.prhead') || 'null'); if(hs) PR.hd = hs; } catch(e){}
  function prType(){ for(var i = 0; i < PR_TYPES.length; i++) if(PR_TYPES[i][0] === PR.type) return PR_TYPES[i]; return PR_TYPES[0]; }
  function prRef(){
    var code = PR.type === 'manual' ? 'MG' : 'MB';
    if(!PR.ref || PR.refCode !== code || Date.now() - PR.refAt > 15 * 60000){
      var mk = window.__SPZ_REPORTREF && window.__SPZ_REPORTREF.make;
      if(mk) PR.ref = mk(code);
      else { var d = new Date(), p2 = function(n){ return (n < 10 ? '0' : '') + n; }, A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = ''; for(var i = 0; i < 6; i++) r += A.charAt(Math.floor(Math.random() * A.length)); PR.ref = 'SPZ-' + code + '-' + String(d.getFullYear()).slice(2) + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes()) + '-' + r; }
      PR.refCode = code; PR.refAt = Date.now();
    }
    return PR.ref;
  }
  function qrSvg(){ try { if(typeof qrcode !== 'function') return ''; var q = qrcode(0, 'M'); q.addData(WEB_URL); q.make(); return q.createSvgTag({ cellSize:4, margin:0, scalable:true }); } catch(e){ return ''; } }
  function docHead(title){
    var lg = window.__SPZ_PR_LOGO || '', loc = L() === 'th' ? 'th-TH' : 'en-GB', H = PR.hd || {};
    var meta = (H.dates ? '<span>' + esc(T({ en:'Generated', th:'สร้างเมื่อ' })) + ': ' + esc(new Date().toLocaleString(loc)) + '</span><span>' + esc(T({ en:'Market data as of', th:'ข้อมูลตลาด ณ' })) + ': ' + esc(D.m && D.m.generated_at ? new Date(D.m.generated_at).toLocaleString(loc) : '—') + '</span><span>' + esc(T({ en:'Economy data', th:'ข้อมูลเศรษฐกิจ' })) + ': ' + esc(D.b && D.b.generated_at ? new Date(D.b.generated_at).toLocaleString(loc) : '—') + '</span>' : '') +
      (H.ref ? '<span>' + esc(T({ en:'Report ID', th:'รหัสรายงาน' })) + ': ' + esc(prRef()) + '</span>' : '');
    var inner = (H.logo && lg ? '<img class="rh-logo" src="' + lg + '" alt="">' : '') + (H.brand ? '<div class="rh-brand">SPACEZ TERMINAL</div>' : '') + (H.title ? '<div class="rh-title">' + esc(T(title)) + '</div>' : '') +
      (H.sub ? '<div class="rh-sub">' + esc(T({ en:'Market Brain · economy, markets and outlook', th:'สมองตลาด · เศรษฐกิจ ตลาด และแนวโน้ม' })) + '</div>' : '') + (meta ? '<div class="rh-meta">' + meta + '</div>' : '');
    return inner ? '<div class="rh">' + inner + '</div>' : '';
  }
  function analystBlock(){
    var ava = window.__SPZ_DEV_AVATAR || '';
    return '<div class="ab">' + (ava ? '<img class="ab-ava" src="' + esc(ava) + '" alt="">' : '') + '<div class="ab-txt"><div class="ab-cap">' + esc(T({ en:'Prepared by', th:'จัดทำโดย' })) + '</div><div class="ab-name">Noraset Boikaw</div><div class="ab-role">Elliott Wave Analyst · SPACEZ TERMINAL</div><div class="ab-ref">' + esc(prRef()) + '</div></div>' +
      '<div class="ab-qr"><div class="ab-qrbox">' + qrSvg() + '</div><span>' + esc(T({ en:'Scan to open SPACEZ TERMINAL', th:'สแกนเพื่อเปิด SPACEZ TERMINAL' })) + '</span></div></div>';
  }
  function prTitle(k){ if(k === 'manual') return MAN_T; for(var i = 0; i < TABS.length; i++) if(TABS[i][0] === k) return TABS[i][1]; return { en:k, th:k }; }
  function prList(){ if(PR.type === 'custom') return PR_SECS.filter(function(k){ return PR.secs[k]; }); for(var i = 0; i < PR_TYPES.length; i++) if(PR_TYPES[i][0] === PR.type) return PR_TYPES[i][4]; return ['sum']; }
  function vPrint(){
    var h = '<div class="bz-row bz-prw"><div class="bz-sec s4"><h4><span class="bz-pn">1</span>' + esc(T({ en:'Choose a document', th:'เลือกเอกสาร' })) + '</h4><div class="bz-prt">' + PR_TYPES.map(function(p){
      return '<label class="' + (PR.type === p[0] ? 'on' : '') + '"><input type="radio" name="bzPrT" value="' + p[0] + '"' + (PR.type === p[0] ? ' checked' : '') + '>' + ico(p[1]) + '<span><b>' + esc(T(p[2])) + '</b><em>' + esc(T(p[3])) + '</em></span></label>';
    }).join('') + '</div></div>';
    var list = prList();
    h += '<div class="bz-sec s3"><h4><span class="bz-pn">2</span>' + esc(T({ en:'Options', th:'ตั้งค่า' })) + '</h4>' +
      '<h6 class="bz-prh">' + esc(T({ en:'Sections', th:'ส่วนที่จะพิมพ์' })) + '</h6><div class="bz-prs">' + PR_SECS.map(function(k){ var on = list.indexOf(k) >= 0; return '<label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-prs="' + k + '"' + (on ? ' checked' : '') + '><span>' + esc(T(prTitle(k))) + '</span></label>'; }).join('') + '</div>' +
      '<h6 class="bz-prh">' + esc(T({ en:'Paper', th:'แนวกระดาษ' })) + '</h6><div class="bz-pro">' + [['portrait', { en:'Portrait A4', th:'แนวตั้ง A4' }], ['landscape', { en:'Landscape A4', th:'แนวนอน A4' }]].map(function(o){ return '<button type="button" data-pro="' + o[0] + '" class="' + (PR.orient === o[0] ? 'on' : '') + '"><span class="paper ' + o[0][0] + '"><i></i><i></i><i></i></span>' + esc(T(o[1])) + '</button>'; }).join('') + '</div>' +
      '<h6 class="bz-prh">' + esc(T({ en:'Colours', th:'โทนสี' })) + '</h6><div class="bz-pro">' + [['light', { en:'Light (saves ink)', th:'สว่าง (ประหยัดหมึก)' }], ['dark', { en:'Dark (like the site)', th:'มืด (เหมือนเว็บ)' }]].map(function(o){ return '<button type="button" data-prth="' + o[0] + '" class="' + (PR.theme === o[0] ? 'on' : '') + '"><span class="sw ' + o[0] + '"></span>' + esc(T(o[1])) + '</button>'; }).join('') + '</div>' +
      '<h6 class="bz-prh">' + esc(T({ en:'Document header', th:'หัวเอกสาร' })) + '</h6><div class="bz-prs">' + [['logo', { en:'Logo', th:'โลโก้' }], ['brand', { en:'Site name', th:'ชื่อเว็บ' }], ['title', { en:'Report name', th:'ชื่อรายงาน' }], ['sub', { en:'Subtitle', th:'คำอธิบายใต้ชื่อ' }], ['dates', { en:'Created / data dates', th:'วันที่สร้าง / วันที่ข้อมูล' }], ['ref', { en:'Report ID', th:'รหัสรายงาน' }]].map(function(o){ var on = PR.hd[o[0]]; return '<label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-prhd="' + o[0] + '"' + (on ? ' checked' : '') + '><span>' + esc(T(o[1])) + '</span></label>'; }).join('') + '</div>' +
      '<label class="bz-tg"><input type="checkbox" data-prcover' + (PR.cover ? ' checked' : '') + '><span>' + esc(T({ en:'Cover page with key numbers', th:'มีหน้าปกพร้อมตัวเลขสำคัญ' })) + '</span></label>' +
      '<label class="bz-tg"><input type="checkbox" data-pranalyst' + (PR.analyst ? ' checked' : '') + '><span>' + esc(T({ en:'Analyst name, photo and web QR (last page)', th:'ชื่อนักวิเคราะห์ รูป และ QR เว็บ (หน้าสุดท้าย)' })) + '</span></label>' +
      '<div class="bz-prref">' + ico('layers') + '<span>' + esc(T({ en:'Report ID', th:'รหัสรายงาน' })) + '</span><b>' + esc(prRef()) + '</b><em>' + esc(T({ en:'The PDF is named after this code, so the REPORTS sorter on the Mac files it into “market-brain (สมองตลาด)”.', th:'ไฟล์ PDF จะตั้งชื่อตามรหัสนี้ ตัวจัดรายงานในเครื่อง Mac จะย้ายไปโฟลเดอร์ “market-brain (สมองตลาด)” ให้เอง' })) + '</em></div>' +
      '<div class="bz-prgo"><button type="button" class="bz-btn" data-prprint>' + ico('printer') + esc(T({ en:'Print / Save as PDF', th:'พิมพ์ / บันทึกเป็น PDF' })) + '</button><button type="button" class="bz-btn ghost" data-prpdf>' + ico('book') + esc(T({ en:'Download PDF file', th:'ดาวน์โหลดไฟล์ PDF' })) + '</button><p class="bz-note" data-prmsg>' + esc(T({ en:'Both buttons lay the pages out first (about 10–40 seconds), so every browser prints the same pages.', th:'ทั้งสองปุ่มจะจัดหน้าก่อน (ราว 10–40 วินาที) ทุกเบราว์เซอร์จึงพิมพ์ออกมาเหมือนกัน' })) + '</p></div></div>';
    h += '<div class="bz-sec s5 bz-prv"><h4>' + ico('eye') + esc(T({ en:'Preview', th:'ตัวอย่างเอกสาร' })) + '<span class="bz-fq">' + list.length + ' ' + esc(T({ en:'sections', th:'ส่วน' })) + (PR.cover ? ' + ' + esc(T({ en:'cover', th:'ปก' })) : '') + '</span></h4><div class="bz-paperbox ' + PR.orient + '"><iframe title="preview" data-prframe></iframe><div class="bz-prload">' + esc(T({ en:'Building the document…', th:'กำลังสร้างเอกสาร…' })) + '</div></div></div></div>';
    setTimeout(buildPreview, 30);
    return h;
  }
  function coverHTML(E, F){
    var ph = PHASES[E.phase], it = F.items, c6 = fcAt(it.core, 6), f12 = fcAt(it.ff, 12), y6 = fcAt(it.y10, 6), u6 = fcAt(it.un, 6), s6 = fcAt(it.spx, 6), o6 = fcAt(it.oil, 6);
    var tn = E.score >= 56 ? 'good' : E.score >= 44 ? 'mid' : 'bad';
    var k = function(lbl, now, nx, dir){ return '<div class="' + (dir || '') + '"><span>' + esc(T(lbl)) + '</span><b>' + now + '</b>' + (nx ? '<em>→ ' + nx + '</em>' : '') + '</div>'; };
    var d = function(a, b, inv){ if(!isNum(a) || !isNum(b)) return ''; var x = b - a; return Math.abs(x) < 1e-9 ? '' : ((x > 0) !== !!inv ? 'up' : 'dn'); };
    return '<section class="pg cover">' + docHead(PR.type === 'custom' ? { en:'Market Brain report', th:'รายงานสมองตลาด' } : prType()[2]) +
      '<div class="cv-main"><div class="cv-score ' + tn + '"><div class="cv-sl"><div class="cv-w">' + ico(E.weather.k) + '<b>' + esc(T(E.weather.w)) + '</b></div><div class="cv-g">' + gauge(E.score, '') + '</div><div class="cv-n">' + esc(T({ en:'Market score', th:'คะแนนตลาด' })) + ' <b>' + Math.round(E.score) + '</b>/100</div></div>' +
        '<div class="cv-sr"><span class="cv-ph">' + esc(T(ph.short)) + '</span><b>' + esc(T(ph.name)) + '</b><p>' + esc(T(E.head)) + '</p></div></div>' +
      '<h6 class="cv-kh">' + esc(T({ en:'Key numbers: now → 6 months (Fed: 12 months)', th:'ตัวเลขสำคัญ: ตอนนี้ → อีก 6 เดือน (เฟด: 12 เดือน)' })) + '</h6><div class="cv-k">' +
        k({ en:'Core inflation', th:'เงินเฟ้อพื้นฐาน' }, pc(E.infl.v, 2), pc(c6 && c6.v, 2), d(E.infl.v, c6 && c6.v, true)) + k({ en:'Fed rate', th:'ดอกเบี้ยเฟด' }, pc(E.fed.ff, 2), pc(f12 && f12.v, 2), d(E.fed.ff, f12 && f12.v, true)) +
        k({ en:'10-year yield', th:'บอนด์ 10 ปี' }, pc(E.fed.y10, 2), pc(y6 && y6.v, 2), d(E.fed.y10, y6 && y6.v, true)) + k({ en:'Unemployment', th:'ว่างงาน' }, pc(E.growth.un, 1), pc(u6 && u6.v, 2), d(E.growth.un, u6 && u6.v, true)) +
        k({ en:'GDP next quarter', th:'GDP ไตรมาสหน้า' }, pc(F.gdp.q1, 1), '', F.gdp.q1 >= 2 ? 'up' : F.gdp.q1 < 1 ? 'dn' : '') + k({ en:'Recession odds 12m', th:'โอกาสถดถอย 12 เดือน' }, f(F.rec && F.rec.p, 0) + '%', '', F.rec && F.rec.p < 20 ? 'up' : F.rec && F.rec.p > 35 ? 'dn' : '') +
        k({ en:'S&P 500 (SPY)', th:'S&P 500 (SPY)' }, f(F.spx && F.spx.last, 0), f(s6 && s6.v, 0), d(F.spx && F.spx.last, s6 && s6.v)) + k({ en:'Oil (WTI)', th:'น้ำมัน WTI' }, '$' + f(it.oil && it.oil.now, 0), '$' + f(o6 && o6.v, 0), d(it.oil && it.oil.now, o6 && o6.v, true)) + '</div>' +
      '<div class="cv-toc"><h6>' + esc(T({ en:'Contents', th:'สารบัญ' })) + '</h6><ol>' + prList().map(function(s){ return '<li>' + esc(T(prTitle(s))) + '</li>'; }).join('') + '</ol></div></div>' +
      '<div class="cv-foot">' + esc(T({ en:'SPACEZ TERMINAL · Market Brain · data: FRED, Yahoo Finance, Shiller, FINRA, Cboe', th:'SPACEZ TERMINAL · สมองตลาด · ข้อมูล: FRED, Yahoo Finance, Shiller, FINRA, Cboe' })) + (PR.hd.ref ? ' · ' + esc(prRef()) : '') + '</div></section>';
  }
  function renderTab(k){
    var E = E_last, F = F_last;
    return k === 'sum' ? vSum(E, F) : k === 'fc' ? vFc(E, F) : k === 'over' ? vOver(E) : k === 'infl' ? vInfl(E) : k === 'growth' ? vGrowth(E) : k === 'fx' ? vFx(E) : k === 'rot' ? vRot(E) : k === 'out' ? vOut(E) : k === 'pf' ? vPf() : k === 'cal' ? vCal() : k === 'manual' ? vManual() : '';
  }
  function docHTML(){
    var list = prList(), ds = new Date().toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', year:'numeric' });
    var css = new URL('assets/css/min/part-83.css', location.href).href;
    var fonts = Array.prototype.map.call(document.querySelectorAll('link[href*="fonts.googleapis"],link[href*="fonts.gstatic"]'), function(l){ return l.outerHTML; }).join('');
    var lg = window.__SPZ_PR_LOGO || '';
    var body = (PR.cover ? coverHTML(E_last, F_last) : '') + list.map(function(k, i){
      var html = ''; try { html = renderTab(k); } catch(e){ html = '<p>' + esc(String(e && e.message || e)) + '</p>'; }
      return '<section class="pg">' + (!PR.cover && i === 0 ? docHead(PR.type === 'custom' ? { en:'Market Brain report', th:'รายงานสมองตลาด' } : prType()[2]) : '<header class="ph"><span>' + (lg ? '<img src="' + lg + '" alt="">' : '') + '<b>SPACEZ TERMINAL</b> · ' + esc(T({ en:'Market Brain', th:'สมองตลาด' })) + '</span><span>' + esc(T(prTitle(k))) + '</span><span>' + esc(prRef()) + ' · ' + esc(ds) + '</span></header>') + '<h2 class="pt"><i>' + (i + 1) + '</i>' + esc(T(prTitle(k))) + '</h2><div class="bz-view">' + html + '</div>' + (i === list.length - 1 && PR.analyst ? analystBlock() : '') + '</section>';
    }).join('');
    var dark = PR.theme === 'dark';
    return '<!doctype html><html lang="' + L() + '" data-theme="' + (dark ? 'dark' : 'light') + '"><head><meta charset="utf-8"><title>' + esc(prRef()) + '</title>' + fonts + '<link rel="stylesheet" href="' + css + '"><style>' +
      ':root{--sans:"Inter","Noto Sans Thai",sans-serif;--mono:"IBM Plex Mono","Noto Sans Thai",monospace;' + (dark ? '--bg:#0a0d14;--white:#f4f6f1;--grey:#9aa3b2;--border-dim:rgba(255,255,255,.12);' : '--bg:#ffffff;--white:#1f2547;--grey:#5a628c;--border-dim:#e2e6fb;') + '}' +
      '@page{size:A4 ' + PR.orient + ';margin:10mm;}*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}' +
      'html,body{margin:0;background:' + (dark ? '#05070c' : '#e9ecf8') + ';font-family:var(--sans);color:var(--white);}' +
      '.doc{width:' + (PR.orient === 'landscape' ? '1080px' : '760px') + ';margin:0 auto;padding:18px 0;}' +
      '.pg{background:var(--bg);padding:26px 26px 30px;margin:0 0 18px;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.15);page-break-after:always;break-after:page;position:relative;}' +
      '.pg:last-child{page-break-after:auto;break-after:auto;}' +
      '.ph{display:flex;justify-content:space-between;gap:10px;font-size:10px;color:var(--grey);border-bottom:2px solid transparent;border-image:linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6) 1;padding-bottom:6px;margin-bottom:14px;font-family:var(--mono);}' +
      '.pt{display:flex;align-items:center;gap:10px;font-size:22px;margin:0 0 14px;}.pt i{font-style:normal;display:inline-flex;width:32px;height:32px;border-radius:10px;align-items:center;justify-content:center;font-size:15px;color:#fff;background:linear-gradient(135deg,#22d3ee,#a78bfa);}' +
      '.bz-wrap,.doc{--bz-good:' + (dark ? '#34d399' : '#059669') + ';--bz-mid:' + (dark ? '#fbbf24' : '#d97706') + ';--bz-bad:' + (dark ? '#fb7185' : '#e11d48') + ';--bz-card:' + (dark ? 'rgba(255,255,255,.04)' : '#f6f7ff') + ';--bz-card2:' + (dark ? 'rgba(255,255,255,.07)' : '#eef0fd') + ';--bz-line:' + (dark ? 'rgba(255,255,255,.1)' : '#e3e6f8') + ';--bz-bgc:var(--bg);--bz-ringbg:var(--bg);}' +
      '.bz-view{animation:none!important;gap:12px;}.bz-sec,.bz-callout,.bz-kpi,.bz-pill,.bz-fcc,.bz-sc,.bz-card,.bz-hero,.bz-verdict,.bz-tile,.bz-day,.bz-gc{break-inside:avoid;page-break-inside:avoid;box-shadow:none!important;}' +
      '.bz-sec{background:var(--bz-card)!important;padding:12px!important;}' +
      '.bz-btn,.bz-modes,.bz-add,.bz-x,.bz-preset,.bz-tg,.bz-acct,.bz-hold input{display:none!important;}' +
      '.bz-row{grid-template-columns:repeat(12,minmax(0,1fr))!important;gap:10px!important;}.bz-row>.s7,.bz-row>.s8{grid-column:span 7!important;}.bz-row>.s5,.bz-row>.s4{grid-column:span 5!important;}.bz-row>.s6{grid-column:span 6!important;}.bz-row>.s12{grid-column:span 12!important;}' +
      '.bz-two{grid-template-columns:1fr 1fr!important;}.bz-fcgrid{grid-template-columns:repeat(4,minmax(0,1fr))!important;}.bz-dns{grid-template-columns:repeat(3,minmax(0,1fr))!important;}.bz-scen{grid-template-columns:1fr!important;}' +
      '.bz-hero{grid-template-columns:200px 1fr!important;}.bz-clk{grid-column:1/-1;flex-direction:row!important;text-align:left!important;}.bz-pills{grid-template-columns:repeat(3,minmax(0,1fr))!important;}' +
      '.bz-verdict{grid-template-columns:150px 1fr!important;}.bz-sum{min-width:0!important;font-size:11px!important;}.bz-tw{overflow:visible!important;}' +
      '.pg::before{content:"";display:block;height:5px;margin:-26px -26px 16px;border-radius:6px 6px 0 0;background:linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6);}.pg:first-child::before{display:none;}' +
      '.rh{display:flex;flex-direction:column;align-items:center;text-align:center;border-bottom:2px solid var(--white);padding:4px 0 16px;margin-bottom:18px;font-family:"Sarabun","Noto Sans Thai","Inter",sans-serif;}.cover .rh{margin:26px 26px 18px;}' +
      '.rh-logo{width:46px;height:auto;margin-bottom:10px;}.rh-brand{font-size:15px;font-weight:800;letter-spacing:2px;}html[lang=th] .rh-brand{letter-spacing:2px;}' +
      '.rh-title{font-size:20px;font-weight:800;letter-spacing:.5px;margin-top:8px;}.rh-sub{font-size:10.5px;color:var(--grey);letter-spacing:1px;margin-top:5px;}' +
      '.rh-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px 18px;font-size:10px;color:var(--grey);margin-top:12px;width:100%;}' +
      '.cv-score{display:grid;grid-template-columns:230px 1fr;gap:22px;align-items:center;padding:20px;border-radius:18px;background:var(--bz-card);border-left:5px solid var(--bz-mid);}.cv-score.good{border-left-color:var(--bz-good);}.cv-score.bad{border-left-color:var(--bz-bad);}' +
      '.cv-sl{display:flex;flex-direction:column;align-items:center;gap:2px;}.cv-w{display:flex;align-items:center;gap:8px;}.cv-w .bz-i{width:30px;height:30px;color:var(--bz-mid);}.cv-score.good .cv-w .bz-i{color:#f59e0b;}.cv-w b{font-size:24px;font-weight:800;}' +
      '.cv-g{width:190px;}.cv-g .bz-gl2{display:none;}.cv-n{font-size:12px;color:var(--grey);}.cv-n b{font-family:var(--mono);font-size:15px;color:var(--white);}' +
      '.cv-sr b{display:block;font-size:17px;line-height:1.4;}.cv-ph{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6366f1,#a78bfa);margin-bottom:6px;}.cv-sr p{margin:8px 0 0;font-size:13px;line-height:1.75;color:var(--grey);}' +
      '.cv-kh{margin:0 0 -8px;font-size:12px;color:var(--grey);letter-spacing:.04em;}' +
      '.ph img{width:16px;height:auto;vertical-align:-3px;margin-right:6px;}' +
      '.ab{display:flex;align-items:center;gap:16px;margin:18px 0 0;padding:14px 18px;border-radius:14px;border:1px solid var(--bz-line);background:var(--bz-card);break-inside:avoid;}' +
      '.ab-ava{width:58px;height:58px;border-radius:50%;object-fit:cover;}.ab-txt{flex:1;}.ab-cap{font-size:10.5px;color:var(--grey);letter-spacing:.08em;}.ab-name{font-size:17px;font-weight:800;}.ab-role{font-size:11.5px;color:var(--grey);}.ab-ref{font-family:var(--mono);font-size:10px;color:var(--grey);margin-top:3px;}' +
      '.ab-qr{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:9.5px;color:var(--grey);}.ab-qrbox{width:74px;height:74px;padding:5px;background:#fff;border-radius:8px;}.ab-qrbox svg{width:100%;height:100%;display:block;}' +
      '.bz-row>.bk{grid-column:span 12!important;}.bz-tbl.big{font-size:11px!important;}.bz-tbl.big td,.bz-tbl.big th{padding:6px 5px!important;}.bz-stars i{width:7px!important;height:7px!important;}' +
      '.bz-mi{break-inside:avoid;}.bz-mitems{grid-template-columns:1fr!important;}.bz-mi dl{grid-template-columns:120px 1fr!important;}' +
      '.bz-verdict{grid-template-columns:190px 1fr!important;}.bz-verdict::after{display:none;}.bz-cons p{display:none;}.bz-vl{padding-right:14px;}' +
      '.cover{height:' + (PR.orient === 'landscape' ? '700px' : '1000px') + ';display:flex;flex-direction:column;overflow:hidden;padding:0!important;}.cover .cv-main{gap:16px;padding-top:0;padding-bottom:10px;}.cover .cv-g{width:170px;}' +
      '.cv-band{height:14px;background:linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6);}.cv-top{display:flex;justify-content:space-between;padding:22px 34px 0;font-family:var(--mono);font-size:12px;letter-spacing:.14em;color:var(--grey);}' +
      '.cv-main{flex:1;padding:40px 34px 20px;display:flex;flex-direction:column;gap:22px;}.cv-eb{font-family:var(--mono);font-size:13px;letter-spacing:.2em;color:#0891b2;}' +
      '.cover h1{margin:0;font-size:44px;line-height:1.15;background:linear-gradient(100deg,var(--white),#6366f1 60%,#db2777);-webkit-background-clip:text;background-clip:text;color:transparent;}' +
      '.cv-score{display:grid;grid-template-columns:210px 1fr;gap:20px;align-items:center;padding:18px;border-radius:18px;background:var(--bz-card);}.cv-score b{font-size:16px;}.cv-score p{margin:6px 0 0;font-size:13px;line-height:1.75;color:var(--grey);}' +
      '.cv-k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}.cv-k div{padding:12px 14px;border-radius:14px;background:var(--bz-card);border-left:4px solid #a78bfa;}.cv-k div.up{border-left-color:var(--bz-good);}.cv-k div.dn{border-left-color:var(--bz-bad);}' +
      '.cv-k div.up,.cv-k div.dn{color:var(--white);}.cv-k span{display:block;font-size:12px;font-weight:600;color:var(--grey);}.cv-k b{display:block;font-family:var(--mono);font-size:20px;margin-top:2px;}.cv-k em{font-style:normal;font-family:var(--mono);font-size:13px;color:#6366f1;font-weight:700;}.cv-k div.up em{color:var(--bz-good);}.cv-k div.dn em{color:var(--bz-bad);}' +
      'h2,h3,h4,h5,h6,.pt,.bz-h3,.rh{break-after:avoid;page-break-after:avoid;}p,li,dd{orphans:3;widows:3;}tr,.bz-er,.bz-chkg div,.bz-tile,.bz-dt,.bz-fcc,.bz-pair,.bz-hw,.bz-wires div,.bz-ev,.bz-gloss div,.ab,.bz-mi dl,.cv-score,.cv-k div{break-inside:avoid;page-break-inside:avoid;}thead{display:table-header-group;}' +
      '.bz-sec>h4{break-after:avoid;}.bz-fdet{display:none!important;}' +
      '.cv-toc h6{margin:0 0 6px;font-size:12px;letter-spacing:.1em;color:var(--grey);}.cv-toc ol{margin:0;padding-left:20px;display:grid;grid-template-columns:1fr 1fr;column-gap:28px;font-size:13px;line-height:1.85;}' +
      '.cv-foot{padding:14px 34px;font-size:10.5px;color:var(--grey);border-top:1px solid var(--bz-line);}' +
      '@media print{html,body{background:var(--bg);}.doc{width:auto;padding:0;}.pg{box-shadow:none;border-radius:0;margin:0;padding:0 0 6px;}.cover{height:' + (PR.orient === 'landscape' ? '180mm' : '262mm') + ';min-height:0;}.doc,.pg{max-width:100%;}.pg *{max-width:100%;}svg{max-width:100%;height:auto;}}' +
      '</style></head><body><div class="doc bz-wrap">' + body + '</div></body></html>';
  }
  var prTimer = null;
  function buildPreview(){
    if(!host) return;
    var fr = host.querySelector('[data-prframe]'); if(!fr) return;
    var box = fr.parentNode, ld = box.querySelector('.bz-prload'); ld.hidden = false;
    var w = PR.orient === 'landscape' ? 1080 : 760;
    fr.onload = function(){
      try {
        var d = fr.contentDocument, hgt = d.documentElement.scrollHeight; var s = box.clientWidth / (w + 40);
        fr.style.width = (w + 40) + 'px'; fr.style.height = hgt + 'px'; fr.style.transform = 'scale(' + s + ')';
        box.querySelector('.bz-pscale') ; box.style.height = Math.min(hgt * s, window.innerHeight * 0.78) + 'px';
        box.dataset.h = hgt * s; ld.hidden = true;
        setTimeout(function(){ try { var h2 = d.documentElement.scrollHeight; fr.style.height = h2 + 'px'; } catch(e){} }, 900);
      } catch(e){ ld.hidden = true; }
    };
    fr.srcdoc = docHTML();
  }
  /* Print and PDF share one renderer: each section is drawn to a canvas and
     cut into A4 pages at gaps between blocks (never through a card or chart),
     so Safari, Chrome and the PDF all get exactly the same pages. */
  var SAFE = '.bz-view>*,.bz-row>*,.bz-sec>*,.bz-two>*,tr,.bz-tiles>*,.bz-dtiles>*,.bz-pills>*,.bz-cards>*,.bz-fcgrid>*,.bz-mitems>*,.bz-calg>*,.bz-gcards>*,.bz-chkg>*,.bz-exp>*,.bz-flow li,.bz-dns>*,.bz-kpis>*,.bz-scen>*,.bz-pairs>*,.bz-cng>*,.bz-fxg>*,.bz-wires>*,.bz-fomcg>*,.bz-howg>*,.bz-gloss>*,.bz-day>*,.ab,.rh,.pt,.ph,.cv-main>*,.bz-mi dl>*,.bz-basis li,.bz-iss li,.bz-adds li,.bz-rank>*';
  function prDims(){ var land = PR.orient === 'landscape', PW = land ? 297 : 210, PH = land ? 210 : 297, M = 8; return { land:land, PW:PW, PH:PH, M:M, CW:PW - 2 * M, CH:PH - 2 * M, bg:PR.theme === 'dark' ? '#0a0d14' : '#ffffff' }; }
  function renderPages(say, done, fail, mode){
    /* a private off-screen copy of the document, so a preview refresh can never pull the page out from under the renderer */
    var old = document.getElementById('bzRenderFrame'); if(old) old.remove();
    var fr = document.createElement('iframe'); fr.id = 'bzRenderFrame'; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + ((PR.orient === 'landscape' ? 1080 : 760) + 40) + 'px;height:1200px;border:0;visibility:visible;pointer-events:none;';
    var d, w, G = prDims(), timer = null, finished = false;
    var fail0 = fail, done0 = done;
    fail = function(e){ if(finished) return; finished = true; clearTimeout(timer); fr.remove(); fail0(e); };
    done = function(o, g){ if(finished) return; finished = true; clearTimeout(timer); fr.remove(); done0(o, g); };
    function watchdog(){ clearTimeout(timer); timer = setTimeout(function(){ fail('timeout'); }, 45000); }
    function load(src, test, cb){ if(test()) return cb(); var s = d.createElement('script'); s.src = src; s.onload = cb; s.onerror = function(){ fail('load ' + src); }; d.head.appendChild(s); }
    function prep(){
      var root = d.querySelector('.doc'); if(root.classList.contains('h2p')) return; root.classList.add('h2p'); root.style.padding = '0';
      var PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-family', 'font-weight', 'text-anchor', 'letter-spacing'];
      d.querySelectorAll('svg').forEach(function(svg){
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        var r = svg.getBoundingClientRect(); if(r.width && !svg.getAttribute('width')){ svg.setAttribute('width', r.width); svg.setAttribute('height', r.height); }
        var cs0 = w.getComputedStyle(svg); if(!svg.getAttribute('color')) svg.setAttribute('color', cs0.color);
        svg.querySelectorAll('*').forEach(function(n){ var cs = w.getComputedStyle(n), st = ''; PROPS.forEach(function(k){ var v = cs.getPropertyValue(k); if(v && v !== 'normal') st += k + ':' + v + ';'; }); n.setAttribute('style', st + (n.getAttribute('style') || '')); });
      });
      var hx = d.createElement('style'); hx.textContent = '.h2p .rh-title,.h2p .bz-vl b,.h2p .bz-fcv b.nx{background:none!important;-webkit-text-fill-color:currentColor!important;color:#4f46e5!important;}.h2p .pg{box-shadow:none!important;margin:0!important;border-radius:0!important;}'; d.head.appendChild(hx);
    }
    /* page cuts: candidate y = top of any block; a cut is allowed only if it does not pass through an
       "atomic" box (chart, card, row, line of text...) in ANY column, and never right after a heading */
    var ATOM = '.bz-sec,.bz-mi,.bz-day,svg,img,p,li,tr,dt,dd,h2,h3,h4,h5,h6,.pt,.ph,.rh,.bz-kpi,.bz-fcc,.bz-tile,.bz-dt,.bz-pill,.bz-card,.bz-pair,.bz-er,.bz-chkg>div,.bz-wires>div,.bz-fomcg>div,.bz-ev,.bz-gc,.bz-hw,.bz-sc,.bz-cons,.bz-leg,.bz-callout,.bz-chart,.bz-dn,.bz-rank>div,.bz-fxg>div,.bz-cng>div,.bz-gloss>div,.bz-flow li,.bz-rc>div,.bz-parts>div,.bz-wtop>div,.bz-sw,.bz-play>div,.bz-steps,.bz-scbar,.bz-trig li,.bz-gdp>div,.bz-rec3>div,.bz-cone>div,.bz-mtab,.ab,.cv-score,.cv-k>div,.bz-verdict,.bz-hero,.bz-pfh,.bz-wdn,.bz-rmeter,.bz-flowline';
    function cuts(pg, pageH){
      var top = pg.getBoundingClientRect().top, H = pg.scrollHeight, c = [], atoms = [];
      pg.querySelectorAll(SAFE).forEach(function(el){ var r = el.getBoundingClientRect(); if(r.height > 0) c.push(r.top - top - 3); });
      pg.querySelectorAll(ATOM).forEach(function(el){
        var r = el.getBoundingClientRect(); if(r.height <= 0 || r.height > pageH * 0.9) return;
        var b = r.bottom - top;
        if(/^H[2-6]$/.test(el.tagName) || el.classList.contains('pt') || el.classList.contains('bz-leg')){ var nx = el.nextElementSibling; if(nx){ var rn = nx.getBoundingClientRect(); if(rn.height > 0 && rn.height < pageH * 0.6) b = Math.max(b, rn.bottom - top); } }
        atoms.push([r.top - top, b]);
      });
      var ok = function(y){ for(var i = 0; i < atoms.length; i++){ if(atoms[i][0] < y - 1 && atoms[i][1] > y + 1) return false; } return true; };
      c = c.filter(function(y){ return y > 0 && y < H; }).sort(function(a, b){ return a - b; });
      var out = [], start = 0;
      while(H - start > pageH){
        var lim = start + pageH, best = null, loose = null;
        for(var i = 0; i < c.length; i++){ if(c[i] > start + pageH * 0.25 && c[i] <= lim){ loose = c[i]; if(ok(c[i])) best = c[i]; } }
        var e = best || loose || lim; out.push([start, e]); start = e;
      }
      out.push([start, H]); return out;
    }
    function runDom(){
      try {
        var pages = Array.prototype.slice.call(d.querySelectorAll('.pg')), plan = [];
        pages.forEach(function(pg){ var wpx = pg.offsetWidth; plan.push({ html:pg.outerHTML, w:wpx, parts:cuts(pg, wpx * G.CH / G.CW) }); });
        var de = d.documentElement;
        done({ plan:plan, head:d.head.innerHTML, theme:de.getAttribute('data-theme'), lang:de.getAttribute('lang') }, G);
      } catch(e){ fail(e); }
    }
    function run(){
      try { prep(); } catch(e){ return fail(e); }
      var pages = Array.prototype.slice.call(d.querySelectorAll('.pg')), n = 0, out = [];
      function next(){
        if(n >= pages.length) return done(out, G);
        watchdog();
        var pg = pages[n++], wpx = pg.offsetWidth, pageHpx = wpx * G.CH / G.CW, parts = cuts(pg, pageHpx);
        var scale = Math.min(2, Math.sqrt(12e6 / Math.max(1, wpx * pg.scrollHeight)));
        say({ en:'Preparing pages… section ' + n + ' of ' + pages.length, th:'กำลังจัดหน้า… ส่วนที่ ' + n + ' จาก ' + pages.length });
        w.html2canvas(pg, { scale:scale, useCORS:true, backgroundColor:G.bg, logging:false }).then(function(cv){
          var k = cv.width / wpx;
          parts.forEach(function(p){
            var sh = Math.max(1, Math.round((p[1] - p[0]) * k)), sc = d.createElement('canvas'); sc.width = cv.width; sc.height = sh;
            var cx = sc.getContext('2d'); cx.fillStyle = G.bg; cx.fillRect(0, 0, sc.width, sh); cx.drawImage(cv, 0, Math.round(p[0] * k), cv.width, sh, 0, 0, cv.width, sh);
            out.push({ src:sc.toDataURL('image/jpeg', 0.92), hmm:sh / sc.width * G.CW });
          });
          setTimeout(next, 20);
        }).catch(fail);
      }
      next();
    }
    fr.onload = function(){
      d = fr.contentDocument; w = fr.contentWindow;
      if(!d || !d.querySelector('.doc')) return;   /* Safari also fires load for the initial blank page */
      if(fr.__started) return; fr.__started = true; watchdog();
      var ready = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
      ready.then(function(){ setTimeout(function(){ if(mode === 'dom') return runDom(); load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', function(){ return !!w.html2canvas; }, run); }, 400); });
    };
    fr.srcdoc = docHTML();
    document.body.appendChild(fr);
  }
  function prBusy(btn, on){ host.querySelectorAll('[data-prprint],[data-prpdf]').forEach(function(b){ b.disabled = on; }); }
  function prPrint(btn){
    var msg = host.querySelector('[data-prmsg]'), say = function(o){ if(msg) msg.textContent = T(o); };
    prBusy(btn, true); say({ en:'Preparing pages…', th:'กำลังจัดหน้า…' });
    renderPages(say, function(R, G){
      var CWpx = G.CW * 96 / 25.4, total = 0, body = '';
      R.plan.forEach(function(s){
        var k = CWpx / s.w;
        s.parts.forEach(function(p){
          total++;
          body += '<div class="p"><div class="clip" style="height:' + ((p[1] - p[0]) * k).toFixed(1) + 'px"><div class="mv" style="width:' + s.w + 'px;transform:scale(' + k.toFixed(5) + ') translateY(-' + p[0].toFixed(1) + 'px);-webkit-transform:scale(' + k.toFixed(5) + ') translateY(-' + p[0].toFixed(1) + 'px)">' + s.html + '</div></div></div>';
        });
      });
      var head = R.head.replace(/@media print\{[\s\S]*?\}\}/, '').replace(/@page\{[^}]*\}/, '');   /* the preview's own print rules would re-flow the pages */
      var html = '<!doctype html><html lang="' + (R.lang || 'th') + '" data-theme="' + (R.theme || 'light') + '"><head>' + head + '<style>@page{size:A4 ' + PR.orient + ';margin:0;}html,body{margin:0!important;padding:0!important;background:' + G.bg + '!important;}' +
        '.p{width:' + G.PW + 'mm;height:' + G.PH + 'mm;box-sizing:border-box;padding:' + G.M + 'mm;page-break-after:always;break-after:page;overflow:hidden;position:relative;background:' + G.bg + ';}.p:last-child{page-break-after:auto;break-after:auto;}' +
        '.clip{width:' + G.CW + 'mm;overflow:hidden;position:relative;}.mv{transform-origin:0 0;-webkit-transform-origin:0 0;}.mv .pg{margin:0!important;box-shadow:none!important;border-radius:0!important;page-break-after:auto!important;break-after:auto!important;}' +
        '.mv .cover{height:' + (PR.orient === 'landscape' ? '700px' : '1000px') + '!important;min-height:0!important;}</style></head><body class="doc bz-wrap" style="width:auto;padding:0">' + body + '</body></html>';
      var old = document.getElementById('bzPrintFrame'); if(old) old.remove();
      var f = document.createElement('iframe'); f.id = 'bzPrintFrame'; f.setAttribute('aria-hidden', 'true');
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:820px;height:1100px;border:0;opacity:0;pointer-events:none;z-index:-1;';
      var fired = false;
      f.onload = function(){
        var fd = f.contentDocument; if(fired || !fd || !fd.querySelector('.p')) return; fired = true;
        var ready = fd.fonts && fd.fonts.ready ? fd.fonts.ready : Promise.resolve();
        ready.then(function(){ setTimeout(function(){
          prBusy(btn, false); say({ en:total + ' pages ready — choose “Save as PDF” in the print window for a file.', th:'พร้อม ' + total + ' หน้า — ในหน้าต่างพิมพ์เลือก “บันทึกเป็น PDF” ถ้าต้องการไฟล์' });
          try { f.contentWindow.focus(); f.contentWindow.print(); } catch(e){}
          PR.ref = null; setTimeout(function(){ if(tab === 'print') paint(); }, 4000);
        }, 500); });
      };
      f.srcdoc = html; document.body.appendChild(f);
    }, function(err){ if(window.console) console.error(err); prBusy(btn, false); say({ en:'Could not prepare the pages (' + String(err && err.message || err).slice(0, 60) + ') — reload and try again.', th:'จัดหน้าไม่สำเร็จ (' + String(err && err.message || err).slice(0, 60) + ') ลองโหลดหน้าใหม่แล้วกดอีกครั้ง' }); }, 'dom');
  }
  function prPdf(btn){
    var msg = host.querySelector('[data-prmsg]'), say = function(o){ if(msg) msg.textContent = T(o); };
    var w = window, d = document;
    prBusy(btn, true); say({ en:'Creating the PDF…', th:'กำลังสร้างไฟล์ PDF…' });
    function fail(err){ if(window.console) console.error(err); prBusy(btn, false); var why = String(err && err.message || err).slice(0, 60); say({ en:'Could not create the file (' + why + ') — use “Print / Save as PDF” and pick “Save as PDF”.', th:'สร้างไฟล์ไม่สำเร็จ (' + why + ') ใช้ปุ่ม “พิมพ์ / บันทึกเป็น PDF” แล้วเลือก “บันทึกเป็น PDF” แทนได้' }); }
    function make(){
      renderPages(say, function(pages, G){
        try {
          var J = w.jspdf.jsPDF, pdf = new J({ unit:'mm', format:'a4', orientation:G.land ? 'landscape' : 'portrait' });
          pages.forEach(function(p, i){ if(i) pdf.addPage(); if(PR.theme === 'dark'){ pdf.setFillColor(10, 13, 20); pdf.rect(0, 0, G.PW, G.PH, 'F'); } pdf.addImage(p.src, 'JPEG', G.M, G.M, G.CW, p.hmm); });
          var name = prRef() + '.pdf', blob = pdf.output('blob'), u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click();
          setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 4000);
          prBusy(btn, false); PR.ref = null; say({ en:'Saved: ' + name, th:'บันทึกแล้ว: ' + name }); setTimeout(function(){ if(tab === 'print') paint(); }, 2500);
        } catch(e){ fail(e); }
      }, fail);
    }
    if(w && w.jspdf && w.jspdf.jsPDF) return make();
    var s = d.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = make; s.onerror = function(){ fail('jspdf'); }; d.head.appendChild(s);
  }
  function wirePrint(root){
    root.addEventListener('change', function(ev){
      var t = ev.target; if(tab !== 'print' || !t.closest('.bz-prw')) return;
      if(t.name === 'bzPrT'){ PR.type = t.value; if(PR.type === 'custom' && !Object.keys(PR.secs).some(function(k){ return PR.secs[k]; })) PR.secs = { sum:1, fc:1 }; paint(); return; }
      if(t.hasAttribute('data-prs')){ if(PR.type !== 'custom'){ PR.secs = {}; prList().forEach(function(k){ PR.secs[k] = 1; }); PR.type = 'custom'; } PR.secs[t.getAttribute('data-prs')] = t.checked ? 1 : 0; paint(); return; }
      if(t.hasAttribute('data-prcover')){ PR.cover = t.checked; paint(); return; }
      if(t.hasAttribute('data-prhd')){ PR.hd[t.getAttribute('data-prhd')] = t.checked ? 1 : 0; try { localStorage.setItem('spz.brain.prhead', JSON.stringify(PR.hd)); } catch(e){} paint(); return; }
      if(t.hasAttribute('data-pranalyst')){ PR.analyst = t.checked; try { localStorage.setItem('spz.report.analyst', t.checked ? '1' : '0'); } catch(e){} paint(); return; }
    });
    root.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-pro],[data-prth],[data-prprint],[data-prpdf]'); if(!b || !root.contains(b)) return;
      if(b.hasAttribute('data-pro')){ PR.orient = b.getAttribute('data-pro'); paint(); }
      else if(b.hasAttribute('data-prth')){ PR.theme = b.getAttribute('data-prth'); paint(); }
      else if(b.hasAttribute('data-prprint')) prPrint(b);
      else if(b.hasAttribute('data-prpdf')) prPdf(b);
    });
    window.addEventListener('resize', function(){ if(tab === 'print'){ clearTimeout(prTimer); prTimer = setTimeout(buildPreview, 300); } });
  }

  /* ============================================================ MANUAL (2026-10-25 d)
     "How the Market Brain thinks" -- every screen, every rule, with the live
     numbers plugged in. Shown at the bottom of the guide tab and printable as
     its own document (report code SPZ-MG-...). Each item answers four things:
     what it looks at, how it decides, why that rule, and what it says now. */
  function manItems(E, F){
    var P = function(k){ for(var i = 0; i < E.pillars.length; i++) if(E.pillars[i].key === k) return E.pillars[i]; return {}; };
    var sc = function(k){ var p = P(k); return sg(p.score, 1) + ' (' + T(toneWord(p.score || 0)) + ')'; };
    var it = F.items || {}, fa = function(k, m){ var q = fcAt(it[k], m); return q ? q.v : null; };
    return [
      { h:{ en:'1 · What the Market Brain is', th:'1 · สมองตลาดคืออะไร' }, items:[
        { t:{ en:'A rules engine, not a black box', th:'ระบบกฎ ไม่ใช่กล่องดำ' },
          what:{ en:'Public data only: Yahoo Finance prices (every ~30 min), 31 US economic series from FRED (twice a day), Shiller CAPE, FINRA margin debt, Cboe put/call, and the weekly economic calendar.', th:'ใช้ข้อมูลสาธารณะเท่านั้น: ราคาจาก Yahoo Finance (ทุก ~30 นาที) ข้อมูลเศรษฐกิจสหรัฐฯ 31 ชุดจาก FRED (วันละ 2 ครั้ง) CAPE ของ Shiller หนี้มาร์จิ้นจาก FINRA อัตราส่วน put/call จาก Cboe และปฏิทินเศรษฐกิจรายสัปดาห์' },
          how:{ en:'Each conclusion is a written if/then rule on those numbers. Rules are combined into scores, scores into phases, odds and forecasts.', th:'ทุกข้อสรุปมาจากกฎ “ถ้า…แล้ว…” ที่เขียนไว้บนตัวเลขเหล่านั้น กฎหลายข้อรวมเป็นคะแนน คะแนนรวมเป็นช่วงเศรษฐกิจ โอกาส และคาดการณ์' },
          why:{ en:'Rules can be checked, argued with and improved. Every screen shows the inputs next to the answer.', th:'กฎตรวจสอบได้ แย้งได้ และปรับปรุงได้ ทุกหน้าจึงแสดงตัวเลขที่ใช้คิดไว้ข้างคำตอบเสมอ' },
          now:{ en:'Market data ' + (D.m && D.m.generated_at ? new Date(D.m.generated_at).toLocaleString('en-GB') : '—') + ' · economy data ' + (D.b && D.b.generated_at ? new Date(D.b.generated_at).toLocaleString('en-GB') : '—') + '.', th:'ข้อมูลตลาด ' + (D.m && D.m.generated_at ? new Date(D.m.generated_at).toLocaleString('th-TH') : '—') + ' · ข้อมูลเศรษฐกิจ ' + (D.b && D.b.generated_at ? new Date(D.b.generated_at).toLocaleString('th-TH') : '—') } }
      ]},
      { h:{ en:'2 · The market score (0–100) and the nine drivers', th:'2 · คะแนนตลาด (0–100) และ 9 ปัจจัยขับเคลื่อน' }, items:[
        { t:{ en:'How the score is built', th:'คะแนนสร้างอย่างไร' },
          what:{ en:'Nine drivers, each scored −2 (hurts stocks) to +2 (helps stocks).', th:'9 ปัจจัย ให้คะแนนแต่ละตัว −2 (กดดันหุ้น) ถึง +2 (ช่วยหุ้น)' },
          how:{ en:'Weighted average → 50 + average × 25. Weights: inflation 14%, Fed 14%, credit & fear 14%, growth 16%, trend 12%, curve 8%, valuation 8%, commodities 8%, dollar 6%. ≥70 clear skies · 56–70 partly cloudy · 44–56 overcast · 30–44 rain · <30 storm.', th:'เฉลี่ยถ่วงน้ำหนัก → 50 + ค่าเฉลี่ย × 25 น้ำหนัก: เงินเฟ้อ 14% เฟด 14% สินเชื่อและความกลัว 14% เศรษฐกิจ 16% แนวโน้มตลาด 12% เส้นยีลด์ 8% ความแพง 8% สินค้าโภคภัณฑ์ 8% ดอลลาร์ 6% · ≥70 ฟ้าใส · 56–70 มีเมฆบางส่วน · 44–56 ฟ้าครึ้ม · 30–44 ฝนตั้งเค้า · <30 พายุ' },
          why:{ en:'Growth, rates and credit move stock prices the most, so they carry the most weight.', th:'เศรษฐกิจ ดอกเบี้ย และสินเชื่อ ขยับราคาหุ้นมากที่สุด จึงได้น้ำหนักมากที่สุด' },
          now:{ en:'Score ' + Math.round(E.score) + ' — ' + E.weather.w.en + '.', th:'คะแนน ' + Math.round(E.score) + ' — ' + E.weather.w.th } },
        { t:{ en:'Inflation', th:'เงินเฟ้อ' }, what:{ en:'Core PCE level and its 3-month change.', th:'ระดับ Core PCE และการเปลี่ยนแปลงใน 3 เดือน' },
          how:{ en:'≤2.3% → +2, ≤2.8 → +1, ≤3.5 → 0, ≤4.5 → −1, else −2; ±1 if it moved more than 0.15 pt in 3 months.', th:'≤2.3% → +2, ≤2.8 → +1, ≤3.5 → 0, ≤4.5 → −1 มากกว่านั้น −2 และบวก/ลบอีก 1 ถ้าเปลี่ยนเกิน 0.15 จุดใน 3 เดือน' },
          why:{ en:'The Fed targets 2% on this exact measure; above target means rates stay high.', th:'เฟดตั้งเป้า 2% โดยใช้ตัวนี้ ถ้าสูงกว่าเป้า ดอกเบี้ยจะอยู่สูงนาน' }, now:{ en:pc(E.infl.v, 2) + ', 3m ' + sg(E.infl.c3, 2) + ' → ' + sc('infl'), th:pc(E.infl.v, 2) + ' · 3 เดือน ' + sg(E.infl.c3, 2) + ' → ' + sc('infl') } },
        { t:{ en:'Fed & interest rates', th:'เฟดและดอกเบี้ย' }, what:{ en:'2-year yield minus Fed funds; real 10-year yield; 10-year change over a month.', th:'บอนด์ 2 ปีลบดอกเบี้ยเฟด ยีลด์จริง 10 ปี และการเปลี่ยนแปลงของบอนด์ 10 ปีใน 1 เดือน' },
          how:{ en:'Gap < −0.25 (cuts priced) +1, > +0.25 (hikes priced) −1; real yield > 2.3 −1, < 1.2 +1; 10y up > 0.25 −1, down > 0.25 +1.', th:'ส่วนต่าง < −0.25 (ตลาดคาดลด) +1 · > +0.25 (คาดขึ้น) −1 · ยีลด์จริง > 2.3 −1 · < 1.2 +1 · บอนด์ 10 ปีขึ้นเกิน 0.25 −1 ลงเกิน 0.25 +1' },
          why:{ en:'The 2-year is the market\'s best guess of where the Fed goes; real yields are the true cost of money.', th:'บอนด์ 2 ปีคือการเดาที่ดีที่สุดของตลาดว่าเฟดจะไปทางไหน ส่วนยีลด์จริงคือต้นทุนเงินที่แท้จริง' }, now:{ en:'Gap ' + sg(E.fed.gap, 2) + ', real ' + pc(E.fed.real, 2) + ' → ' + sc('fed'), th:'ส่วนต่าง ' + sg(E.fed.gap, 2) + ' ยีลด์จริง ' + pc(E.fed.real, 2) + ' → ' + sc('fed') } },
        { t:{ en:'Yield curve', th:'เส้นอัตราผลตอบแทน' }, what:{ en:'10y − 2y spread and its lowest point in 3 years.', th:'ส่วนต่าง 10 ปี − 2 ปี และจุดต่ำสุดใน 3 ปี' },
          how:{ en:'Inverted −1; 0–0.3 neutral; above 0.3 +1; −1 more if it just turned positive after an inversion deeper than −0.3.', th:'กลับหัว −1 · 0–0.3 กลาง · เกิน 0.3 +1 · ลบเพิ่ม 1 ถ้าเพิ่งกลับมาเป็นบวกหลังกลับหัวลึกกว่า −0.3' },
          why:{ en:'Every US recession since the 1960s was preceded by an inversion; the danger zone is often the re-steepening.', th:'ทุกครั้งที่สหรัฐฯ ถดถอยตั้งแต่ทศวรรษ 1960 มีเส้นกลับหัวนำมาก่อน และช่วงอันตรายมักเป็นตอนที่เส้นกลับมาชันอีกครั้ง' }, now:{ en:sg(E.curve.s, 2) + ' (3-yr low ' + sg(E.curve.min3y, 2) + ') → ' + sc('curve'), th:sg(E.curve.s, 2) + ' (ต่ำสุด 3 ปี ' + sg(E.curve.min3y, 2) + ') → ' + sc('curve') } },
        { t:{ en:'Growth & jobs', th:'เศรษฐกิจและการจ้างงาน' }, what:{ en:'Payrolls (3-month average), Sahm rule, claims vs a year ago, real retail sales, industrial output, GDP, the Fed\'s recession model.', th:'การจ้างงาน (เฉลี่ย 3 เดือน) สัญญาณ Sahm คนขอสวัสดิการเทียบปีก่อน ยอดค้าปลีกหลังหักเงินเฟ้อ การผลิต GDP และโมเดลถดถอยของเฟด' },
          how:{ en:'Payrolls >150k +1, <50k −1; Sahm ≥0.5 −2, ≥0.3 −1; claims +15% −1; real retail >1% +0.5; output >1% +0.5; GDP >2% +0.5, <0.5% −1; model odds >20% −1.', th:'จ้างงาน >150k +1 · <50k −1 · Sahm ≥0.5 −2 · ≥0.3 −1 · คนขอสวัสดิการเพิ่ม 15% −1 · ค้าปลีกจริง >1% +0.5 · การผลิต >1% +0.5 · GDP >2% +0.5 · <0.5% −1 · โมเดลถดถอย >20% −1' },
          why:{ en:'Jobs drive spending, spending drives profits.', th:'การจ้างงานขับการใช้จ่าย การใช้จ่ายขับกำไรบริษัท' }, now:{ en:'Payrolls ' + f(E.growth.pay3, 0) + 'k, Sahm ' + f(E.growth.sahm, 2) + ' → ' + sc('growth'), th:'จ้างงาน ' + f(E.growth.pay3, 0) + 'k · Sahm ' + f(E.growth.sahm, 2) + ' → ' + sc('growth') } },
        { t:{ en:'Dollar, credit, valuation, commodities, trend', th:'ดอลลาร์ สินเชื่อ ความแพง สินค้าโภคภัณฑ์ และแนวโน้ม' }, what:{ en:'DXY 1m/3m; junk spread, VIX, financial conditions; CAPE, Buffett ratio, margin debt, put/call; oil vs a year ago; S&P vs 200-day, breadth, cyclicals vs defensives.', th:'ดอลลาร์ 1/3 เดือน · ส่วนต่างหุ้นกู้ VIX ดัชนีสภาพคล่อง · CAPE อัตราส่วนบัฟเฟตต์ หนี้มาร์จิ้น put/call · น้ำมันเทียบปีก่อน · S&P เทียบเส้น 200 วัน ความกว้างตลาด หุ้นวัฏจักรเทียบหุ้นตั้งรับ' },
          how:{ en:'Each has fixed thresholds (e.g. VIX <15 +0.5, >25 −1, >32 −2; CAPE >40 −1.5; oil +40% y/y −2; S&P above 200-day +1).', th:'แต่ละตัวมีเกณฑ์ตายตัว เช่น VIX <15 +0.5 · >25 −1 · >32 −2 · CAPE >40 −1.5 · น้ำมันขึ้น 40% ต่อปี −2 · S&P อยู่เหนือเส้น 200 วัน +1' },
          why:{ en:'They capture money flows, fear, how stretched prices are, cost pressure and what the market itself is doing.', th:'จับการไหลของเงิน ความกลัว ความตึงของราคา แรงกดดันต้นทุน และสิ่งที่ตลาดกำลังทำจริง' }, now:{ en:'Dollar ' + sc('fx') + ' · credit ' + sc('stress') + ' · valuation ' + sc('val') + ' · commodities ' + sc('comm') + ' · trend ' + sc('trend'), th:'ดอลลาร์ ' + sc('fx') + ' · สินเชื่อ ' + sc('stress') + ' · ความแพง ' + sc('val') + ' · สินค้าโภคภัณฑ์ ' + sc('comm') + ' · แนวโน้ม ' + sc('trend') } }
      ]},
      { h:{ en:'3 · The investment clock (economic phase)', th:'3 · นาฬิกาการลงทุน (ช่วงเศรษฐกิจ)' }, items:[
        { t:{ en:'Growth × inflation direction', th:'ทิศทางเศรษฐกิจ × ทิศทางเงินเฟ้อ' },
          what:{ en:'Growth momentum from payrolls vs their 12-month average, unemployment change, output, retail, sentiment, cyclicals vs defensives and GDP vs 2%. Inflation momentum from core PCE and CPI change, 5-year expectations, oil and the level of core inflation.', th:'แรงส่งเศรษฐกิจจาก: จ้างงานเทียบค่าเฉลี่ย 12 เดือน การเปลี่ยนของอัตราว่างงาน การผลิต ค้าปลีก ความเชื่อมั่น หุ้นวัฏจักรเทียบตั้งรับ และ GDP เทียบ 2% · แรงส่งเงินเฟ้อจาก: การเปลี่ยนของ Core PCE และ CPI เงินเฟ้อคาด 5 ปี น้ำมัน และระดับเงินเฟ้อพื้นฐาน' },
          how:{ en:'Each input is scaled to −1…+1 and averaged. Growth ≥0 & inflation <0 = Recovery; both ≥0 = Overheat; growth <0 & inflation ≥0 = Stagflation; both <0 = Slowdown.', th:'แต่ละตัวแปลงเป็น −1…+1 แล้วเฉลี่ย · เศรษฐกิจ ≥0 และเงินเฟ้อ <0 = ฟื้นตัว · ทั้งคู่ ≥0 = ร้อนแรง · เศรษฐกิจ <0 และเงินเฟ้อ ≥0 = ชะลอแต่ของแพง · ทั้งคู่ <0 = ชะลอตัว' },
          why:{ en:'The Merrill Lynch investment clock (2004) showed that each quadrant has a consistent winner: stocks, commodities, cash or bonds.', th:'นาฬิกาการลงทุนของ Merrill Lynch (2004) พบว่าแต่ละช่องมีผู้ชนะที่ชัดเจน: หุ้น สินค้าโภคภัณฑ์ เงินสด หรือบอนด์' },
          now:{ en:'Growth ' + sg(E.g, 2) + ', inflation ' + sg(E.i, 2) + ' → ' + PHASES[E.phase].short.en + ' (clarity ' + E.phaseConf + '%).', th:'เศรษฐกิจ ' + sg(E.g, 2) + ' เงินเฟ้อ ' + sg(E.i, 2) + ' → ' + PHASES[E.phase].short.th + ' (ความชัดเจน ' + E.phaseConf + '%)' } }
      ]},
      { h:{ en:'4 · Forecast models', th:'4 · โมเดลพยากรณ์' }, items:[
        { t:{ en:'Inflation path', th:'เส้นทางเงินเฟ้อ' }, what:{ en:'The monthly price index itself (last 30 months).', th:'ดัชนีราคารายเดือนโดยตรง (30 เดือนล่าสุด)' },
          how:{ en:'Monthly pace = 45% last 3 months + 35% last 6 + 20% last 12, drifting toward 2% over two years; CPI adds oil pass-through. The index is rolled forward and divided by the known value 12 months earlier, so base effects are exact. Band = monthly volatility × √months.', th:'ความเร็วรายเดือน = 45% ของ 3 เดือนล่าสุด + 35% ของ 6 เดือน + 20% ของ 12 เดือน แล้วค่อยๆ เข้าหา 2% ใน 2 ปี CPI บวกผลจากน้ำมันเพิ่ม · ต่อดัชนีไปข้างหน้าแล้วหารด้วยค่าจริงเมื่อ 12 เดือนก่อน ฐานเปรียบเทียบจึงแม่นยำ · ช่วงกว้าง = ความผันผวนรายเดือน × √จำนวนเดือน' },
          why:{ en:'Most of next year\'s y/y number is already decided by what happened last year (base effects) and by today\'s pace.', th:'ตัวเลขเทียบปีก่อนในปีหน้าส่วนใหญ่ถูกกำหนดแล้วโดยสิ่งที่เกิดเมื่อปีก่อน (ฐานเปรียบเทียบ) และความเร็วตอนนี้' }, now:{ en:'Core PCE ' + pc(E.infl.v, 2) + ' → ' + pc(fa('core', 6), 2) + ' in 6m, ' + pc(fa('core', 12), 2) + ' in 12m.', th:'Core PCE ' + pc(E.infl.v, 2) + ' → ' + pc(fa('core', 6), 2) + ' ใน 6 เดือน และ ' + pc(fa('core', 12), 2) + ' ใน 12 เดือน' } },
        { t:{ en:'Fed path and Taylor rule', th:'เส้นทางดอกเบี้ยเฟดและกฎเทย์เลอร์' }, what:{ en:'3-month T-bill, 2-year yield, Fed funds, core PCE, unemployment.', th:'ตั๋วเงินคลัง 3 เดือน บอนด์ 2 ปี ดอกเบี้ยเฟด Core PCE และอัตราว่างงาน' },
          how:{ en:'The bill is the average expected rate over 3 months; the 2-year (less a 0.15 premium) the average over 24. A straight path is fitted through them. Taylor rule = 1.0 + inflation + 0.5×(inflation − 2) + 0.5×output gap, with the gap ≈ −2×(unemployment − 4.2).', th:'ตั๋วเงินคลังคือค่าเฉลี่ยดอกเบี้ยที่คาดใน 3 เดือน บอนด์ 2 ปี (หักค่าชดเชย 0.15) คือค่าเฉลี่ยใน 24 เดือน แล้วลากเส้นตรงผ่าน · กฎเทย์เลอร์ = 1.0 + เงินเฟ้อ + 0.5×(เงินเฟ้อ − 2) + 0.5×ช่องว่างการผลิต โดยช่องว่าง ≈ −2×(ว่างงาน − 4.2)' },
          why:{ en:'Market pricing is the best free forecast of the Fed; the Taylor rule shows which way the pressure is.', th:'ราคาในตลาดคือการพยากรณ์เฟดที่ดีที่สุดที่หาได้ฟรี ส่วนกฎเทย์เลอร์บอกว่าแรงกดดันไปทางไหน' }, now:{ en:'Fed ' + pc(E.fed.ff, 2) + ' → ' + pc(F.fed && F.fed.r12, 2) + ' in 12m; Taylor ' + pc(F.fed && F.fed.taylor, 2) + '.', th:'เฟด ' + pc(E.fed.ff, 2) + ' → ' + pc(F.fed && F.fed.r12, 2) + ' ใน 12 เดือน · กฎเทย์เลอร์ ' + pc(F.fed && F.fed.taylor, 2) } },
        { t:{ en:'Bond yields', th:'บอนด์ยีลด์' }, what:{ en:'5-year inflation expectations, expected Fed path, Taylor rate, 13-week trend.', th:'เงินเฟ้อคาด 5 ปี เส้นทางเฟดที่คาด กฎเทย์เลอร์ และแนวโน้ม 13 สัปดาห์' },
          how:{ en:'10y fair value = ½(expected inflation + 1.0 real + 0.6 term premium) + ½(expected Fed rate + 0.55). Yields close ~3% of the gap per week plus a quarter of the recent trend. 2y fair = 60% Fed path + 40% Taylor.', th:'มูลค่าเหมาะสม 10 ปี = ½(เงินเฟ้อคาด + ดอกเบี้ยจริง 1.0 + ค่าชดเชยระยะยาว 0.6) + ½(ดอกเบี้ยเฟดที่คาด + 0.55) · ยีลด์ปิดช่องว่างราว 3% ต่อสัปดาห์ บวกแนวโน้มล่าสุด 1 ใน 4 · มูลค่าเหมาะสม 2 ปี = เส้นทางเฟด 60% + กฎเทย์เลอร์ 40%' },
          why:{ en:'Long yields = expected short rates + compensation for inflation and time; they gravitate to that level.', th:'ยีลด์ระยะยาว = ดอกเบี้ยระยะสั้นที่คาด + ค่าชดเชยเงินเฟ้อและเวลา และมักถูกดึงเข้าหาระดับนั้น' }, now:{ en:'10y ' + pc(E.fed.y10, 2) + ' vs fair ' + pc(F.fair10, 2) + ' → ' + pc(fa('y10', 6), 2) + ' in 6m.', th:'10 ปี ' + pc(E.fed.y10, 2) + ' เทียบมูลค่าเหมาะสม ' + pc(F.fair10, 2) + ' → ' + pc(fa('y10', 6), 2) + ' ใน 6 เดือน' } },
        { t:{ en:'Unemployment', th:'อัตราว่างงาน' }, what:{ en:'Payrolls vs ~80k break-even, claims trend, job openings, recent momentum.', th:'จ้างงานเทียบจุดคุ้มทุน ~80k แนวโน้มคนขอสวัสดิการ ตำแหน่งงานว่าง และแรงส่งล่าสุด' },
          how:{ en:'Quarterly change = −(payrolls − 80)/450 + 1.2×claims trend − 0.8×openings trend + 0.35×last quarter\'s change, capped −0.4…+0.6 pt.', th:'การเปลี่ยนต่อไตรมาส = −(จ้างงาน − 80)/450 + 1.2×แนวโน้มคนขอสวัสดิการ − 0.8×แนวโน้มตำแหน่งงานว่าง + 0.35×การเปลี่ยนไตรมาสก่อน จำกัดที่ −0.4…+0.6 จุด' },
          why:{ en:'If fewer jobs are added than people join the workforce, unemployment must rise.', th:'ถ้าจ้างงานเพิ่มน้อยกว่าคนที่เข้าสู่ตลาดแรงงาน อัตราว่างงานต้องขยับขึ้น' }, now:{ en:pc(E.growth.un, 1) + ' → ' + pc(fa('un', 6), 2) + ' in 6m.', th:pc(E.growth.un, 1) + ' → ' + pc(fa('un', 6), 2) + ' ใน 6 เดือน' } },
        { t:{ en:'Leading index, GDP and recession odds', th:'ดัชนีชี้นำ GDP และโอกาสถดถอย' }, what:{ en:'Permits, claims, 10y−3m curve, openings, sentiment, credit, stock trend, output; GDPNow; NY Fed probit.', th:'ใบอนุญาตก่อสร้าง คนขอสวัสดิการ เส้นยีลด์ 10 ปี−3 เดือน ตำแหน่งงานว่าง ความเชื่อมั่น หุ้นกู้ แนวโน้มหุ้น การผลิต · GDPNow · โมเดล probit ของเฟดนิวยอร์ก' },
          how:{ en:'Each input scored −2…+2 and averaged. GDP next quarter = ½ GDPNow + ½(2% + 1.6×index). Recession odds = ½ × Φ(−0.533 − 0.633×(10y−3m)) + ½ × a logistic score of the index, Sahm rule, credit and jobs.', th:'ให้คะแนนแต่ละตัว −2…+2 แล้วเฉลี่ย · GDP ไตรมาสหน้า = ½ GDPNow + ½(2% + 1.6×ดัชนี) · โอกาสถดถอย = ½ × Φ(−0.533 − 0.633×(10 ปี−3 เดือน)) + ½ × คะแนน logistic จากดัชนี Sahm หุ้นกู้ และการจ้างงาน' },
          why:{ en:'These series historically turn 6–9 months before the economy does; the curve model is the one the New York Fed publishes.', th:'ข้อมูลชุดนี้ในอดีตมักเปลี่ยนทิศก่อนเศรษฐกิจ 6–9 เดือน และโมเดลเส้นยีลด์คือโมเดลที่เฟดนิวยอร์กเผยแพร่จริง' }, now:{ en:'Index ' + sg(F.lei && F.lei.v, 2) + ', GDP next quarter ' + pc(F.gdp && F.gdp.q1, 1) + ', recession odds ' + f(F.rec && F.rec.p, 0) + '%.', th:'ดัชนี ' + sg(F.lei && F.lei.v, 2) + ' · GDP ไตรมาสหน้า ' + pc(F.gdp && F.gdp.q1, 1) + ' · โอกาสถดถอย ' + f(F.rec && F.rec.p, 0) + '%' } },
        { t:{ en:'S&P 500, oil, dollar and baht', th:'S&P 500 น้ำมัน ดอลลาร์ และเงินบาท' }, what:{ en:'CAPE, inflation, market score, 6-month trend, VIX; 3-year averages and volatility; rate expectations.', th:'CAPE เงินเฟ้อ คะแนนตลาด แนวโน้ม 6 เดือน VIX · ค่าเฉลี่ย 3 ปีและความผันผวน · ความคาดหวังดอกเบี้ย' },
          how:{ en:'S&P expected return = 1/CAPE + 0.8×inflation + regime + trend; range = VIX × √(months/12). Oil pulls 45%/yr toward its 3-year average plus trend. Dollar = 35% of its 3-month trend + 1.5×expected 2y change. Baht moves 0.55× the dollar.', th:'ผลตอบแทนคาดของ S&P = 1/CAPE + 0.8×เงินเฟ้อ + คะแนนสภาวะ + แนวโน้ม · ช่วงกว้าง = VIX × √(เดือน/12) · น้ำมันถูกดึงเข้าหาค่าเฉลี่ย 3 ปีปีละ 45% บวกแนวโน้ม · ดอลลาร์ = 35% ของแนวโน้ม 3 เดือน + 1.5×การเปลี่ยนของบอนด์ 2 ปีที่คาด · เงินบาทขยับ 0.55 เท่าของดอลลาร์' },
          why:{ en:'Earnings yield sets the long-run return; options prices tell you how far the market can move.', th:'อัตราผลตอบแทนกำไรกำหนดผลตอบแทนระยะยาว ส่วนราคาออปชันบอกว่าตลาดแกว่งได้ไกลแค่ไหน' }, now:{ en:'SPY ' + f(F.spx && F.spx.last, 0) + ' → ' + f(fa('spx', 6), 0) + ' in 6m (expected ' + f(F.spx && F.spx.annual, 1) + '%/yr).', th:'SPY ' + f(F.spx && F.spx.last, 0) + ' → ' + f(fa('spx', 6), 0) + ' ใน 6 เดือน (คาด ' + f(F.spx && F.spx.annual, 1) + '% ต่อปี)' } }
      ]},
      { h:{ en:'5 · Scenarios, positioning and money flows', th:'5 · สถานการณ์ การจัดพอร์ต และการไหลของเงิน' }, items:[
        { t:{ en:'Three scenarios', th:'3 สถานการณ์' }, what:{ en:'Growth, credit and trend scores; inflation momentum, oil, hikes priced; Sahm, recession model, curve, spreads, breadth, claims.', th:'คะแนนเศรษฐกิจ สินเชื่อ แนวโน้ม · แรงส่งเงินเฟ้อ น้ำมัน ตลาดคาดขึ้นดอกเบี้ย · Sahm โมเดลถดถอย เส้นยีลด์ ส่วนต่างหุ้นกู้ ความกว้างตลาด คนขอสวัสดิการ' },
          how:{ en:'Each scenario gets a score; odds = e^score ÷ the sum of all three (softmax), so they always add to 100%. Tripwires are fixed levels that would confirm each path.', th:'แต่ละสถานการณ์ได้คะแนน แล้วโอกาส = e^คะแนน ÷ ผลรวมทั้งสาม (softmax) จึงรวมกันได้ 100% เสมอ · เส้นเตือนคือระดับตายตัวที่จะยืนยันแต่ละเส้นทาง' },
          why:{ en:'Thinking in scenarios avoids betting everything on one forecast.', th:'คิดเป็นสถานการณ์ช่วยไม่ให้ทุ่มทั้งหมดไว้กับคาดการณ์เดียว' }, now:{ en:E.scen.map(function(s){ return s.name.en + ' ' + s.p + '%'; }).join(' · '), th:E.scen.map(function(s){ return s.name.th + ' ' + s.p + '%'; }).join(' · ') } },
        { t:{ en:'Expected 6-month returns', th:'ผลตอบแทนคาด 6 เดือน' }, what:{ en:'Bond yields and duration; the S&P model, beta, phase bias, trend and dollar effect; real yields for gold; the oil forecast for commodities.', th:'ยีลด์และดูเรชันของบอนด์ · โมเดล S&P เบต้า ความเอียงตามช่วงเศรษฐกิจ แนวโน้ม และผลจากดอลลาร์ · ยีลด์จริงสำหรับทอง · คาดการณ์น้ำมันสำหรับสินค้าโภคภัณฑ์' },
          how:{ en:'Bonds: half-year yield − duration × forecast yield change. Stocks: S&P model × beta + phase bias + 0.12×3-month trend (+ dollar effect abroad). Ratio = return ÷ typical swing.', th:'บอนด์: ดอกเบี้ยครึ่งปี − ดูเรชัน × ยีลด์ที่คาดว่าจะเปลี่ยน · หุ้น: โมเดล S&P × เบต้า + ความเอียงตามช่วงเศรษฐกิจ + 0.12×แนวโน้ม 3 เดือน (+ ผลดอลลาร์สำหรับต่างประเทศ) · อัตราส่วน = ผลตอบแทน ÷ การแกว่งปกติ' },
          why:{ en:'Puts every asset on the same scale so you can see where to lean.', th:'ทำให้ทุกสินทรัพย์เทียบกันได้บนสเกลเดียว จะได้เห็นว่าควรเอียงไปทางไหน' }, now:{ en:'Top: ' + (F.exp || []).slice(0, 3).map(function(e){ return e.sym + ' ' + spc(e.r, 1); }).join(', '), th:'อันดับต้น: ' + (F.exp || []).slice(0, 3).map(function(e){ return e.sym + ' ' + spc(e.r, 1); }).join(', ') } },
        { t:{ en:'Where money is going', th:'เงินกำลังไหลไปไหน' }, what:{ en:'48 ETFs across asset classes, sectors and countries.', th:'ETF 48 ตัว ครอบคลุมสินทรัพย์ กลุ่มหุ้น และประเทศ' },
          how:{ en:'Score = 35% one-month strength + 30% acceleration (1M vs the 3M pace) + 20% above/below 200-day + 10% volume + 15% phase fit.', th:'คะแนน = ความแรง 1 เดือน 35% + การเร่งตัว (1 เดือนเทียบความเร็ว 3 เดือน) 30% + อยู่เหนือ/ใต้เส้น 200 วัน 20% + ปริมาณซื้อขาย 10% + ความเข้ากับช่วงเศรษฐกิจ 15%' },
          why:{ en:'Acceleration catches rotation early — money arriving before the 3-month numbers show it.', th:'การเร่งตัวช่วยจับการหมุนเวียนได้เร็ว คือเห็นเงินไหลเข้าก่อนที่ตัวเลข 3 เดือนจะสะท้อน' }, now:{ en:'In: ' + (F.flowIn || []).slice(0, 3).map(function(r){ return r.sym; }).join(', ') + ' · out: ' + (F.flowOut || []).slice(0, 3).map(function(r){ return r.sym; }).join(', '), th:'ไหลเข้า: ' + (F.flowIn || []).slice(0, 3).map(function(r){ return r.sym; }).join(', ') + ' · ไหลออก: ' + (F.flowOut || []).slice(0, 3).map(function(r){ return r.sym; }).join(', ') } }
      ]},
      { h:{ en:'6 · Portfolio analysis', th:'6 · การวิเคราะห์พอร์ต' }, items:[
        { t:{ en:'Health score and risk', th:'คะแนนสุขภาพและความเสี่ยง' }, what:{ en:'Weekly prices for one year (stocks and ETFs aligned by week), fundamentals from the stock universe.', th:'ราคารายสัปดาห์ 1 ปี (หุ้นและ ETF จัดให้ตรงสัปดาห์กัน) และข้อมูลพื้นฐานจากรายชื่อหุ้นทั้งหมด' },
          how:{ en:'Health = diversification 25% + risk level 15% + quality 20% + value 10% + trend 15% + phase fit 15%. Volatility, beta, worst drop, correlations, risk contribution and “independent bets” = 1 ÷ Σ(risk share²).', th:'สุขภาพ = การกระจายความเสี่ยง 25% + ระดับความเสี่ยง 15% + คุณภาพ 20% + ความถูก 10% + แนวโน้ม 15% + ความเข้ากับสภาวะ 15% · คำนวณความผันผวน เบต้า การร่วงหนักสุด ความสัมพันธ์ ส่วนแบ่งความเสี่ยง และ “จำนวนเดิมพันอิสระ” = 1 ÷ Σ(ส่วนแบ่งความเสี่ยง²)' },
          why:{ en:'Owning 10 stocks that move together is really one bet; the risk share shows who is really driving the portfolio.', th:'ถือ 10 ตัวที่ขยับไปด้วยกัน ก็เท่ากับเดิมพันเดียว ส่วนแบ่งความเสี่ยงบอกว่าใครเป็นตัวขับพอร์ตจริงๆ' }, now:{ en:PF.last ? 'Current portfolio health ' + Math.round(PF.last.health) + '/100.' : 'Open “My portfolio” to analyse one.', th:PF.last ? 'พอร์ตที่เลือกอยู่มีสุขภาพ ' + Math.round(PF.last.health) + '/100' : 'เปิด “พอร์ตของฉัน” เพื่อวิเคราะห์' } },
        { t:{ en:'Stress tests, re-balance and report cards', th:'ทดสอบวิกฤต ปรับสัดส่วน และสมุดพก' }, what:{ en:'Sensitivity of the portfolio to SPY, TLT, UUP, USO; ROE, margin, debt, P/E vs sector median, trend, dividend, volatility.', th:'ความไวของพอร์ตต่อ SPY TLT UUP USO · ROE อัตรากำไร หนี้ P/E เทียบค่ากลางของกลุ่ม แนวโน้ม ปันผล ความผันผวน' },
          how:{ en:'Stress = beta to each factor × shock. Re-balance: caps (20% stock, 30% sector ETF, 40% broad fund), 15% toward lower volatility, +10% phase fit, −15% weak fundamentals. Report cards: 1–5 stars from fixed bands.', th:'ทดสอบวิกฤต = เบต้าต่อแต่ละปัจจัย × ขนาดช็อก · ปรับสัดส่วน: เพดาน (หุ้น 20% ETF รายกลุ่ม 30% กองทุนกว้าง 40%) เอียงไปทางตัวแกว่งน้อย 15% เพิ่ม 10% ให้ตัวที่เข้ากับสภาวะ ลด 15% ให้ตัวพื้นฐานอ่อน · สมุดพก: ดาว 1–5 ตามเกณฑ์ตายตัว' },
          why:{ en:'Simple, transparent rules beat clever optimisers that over-fit noisy data.', th:'กฎง่ายและโปร่งใส มักดีกว่าโปรแกรมหาค่าที่ซับซ้อนซึ่งไปจับเอาความบังเอิญในข้อมูล' }, now:{ en:'—', th:'—' } }
      ]}
    ];
  }
  function vManual(){
    var E = E_last, F = F_last || {}, secs = manItems(E, F);
    var h = '<div class="bz-mhead"><div>' + ico('book', 'bz-gi') + '</div><div><h3>' + esc(T({ en:'How the Market Brain thinks', th:'สมองตลาดคิดอย่างไร' })) + '</h3><p>' + esc(T({ en:'Every screen, every rule and every model — what it looks at, how it decides, why, and what it says right now.', th:'ทุกหน้า ทุกกฎ และทุกโมเดล — ดูอะไร คิดอย่างไร เพราะอะไร และตอนนี้บอกอะไร' })) + '</p></div></div>';
    secs.forEach(function(s){
      h += '<h3 class="bz-h3 bz-mh">' + esc(T(s.h)) + '</h3><div class="bz-mitems">' + s.items.map(function(it){
        return '<div class="bz-mi"><h5>' + esc(T(it.t)) + '</h5><dl>' +
          '<dt class="a">' + ico('eye') + esc(T({ en:'Looks at', th:'ดูอะไร' })) + '</dt><dd>' + esc(T(it.what)) + '</dd>' +
          '<dt class="b">' + ico('flask') + esc(T({ en:'How it decides', th:'คิดอย่างไร' })) + '</dt><dd>' + esc(T(it.how)) + '</dd>' +
          '<dt class="c">' + ico('compass') + esc(T({ en:'Why', th:'เพราะอะไร' })) + '</dt><dd>' + esc(T(it.why)) + '</dd>' +
          '<dt class="d">' + ico('radar') + esc(T({ en:'Right now', th:'ตอนนี้' })) + '</dt><dd class="now">' + esc(T(it.now)) + '</dd></dl></div>';
      }).join('') + '</div>';
    });
    var M = (D.b && D.b.macro) || {};
    h += '<h3 class="bz-h3 bz-mh">' + esc(T({ en:'7 · Data dictionary (economy series)', th:'7 · พจนานุกรมข้อมูล (ข้อมูลเศรษฐกิจ)' })) + '</h3><div class="bz-tw"><table class="bz-tbl big bz-dict"><thead><tr><th></th><th>FRED</th><th>' + esc(T({ en:'Latest', th:'ล่าสุด' })) + '</th><th>' + esc(T({ en:'Value', th:'ค่า' })) + '</th><th>' + esc(T({ en:'1 year ago', th:'1 ปีก่อน' })) + '</th><th>' + esc(T({ en:'Frequency', th:'ความถี่' })) + '</th></tr></thead><tbody>' +
      Object.keys(M).map(function(k){ var s = M[k]; return '<tr><td><b>' + esc(L() === 'th' ? s.th : s.en) + '</b></td><td>' + esc(s.sid) + '</td><td>' + esc(s.t) + '</td><td>' + f(s.v, 2) + (s.unit === '%' ? '%' : s.unit === 'k' ? 'k' : '') + '</td><td>' + f(s.y1, 2) + '</td><td>' + esc(T(s.freq === 'w' ? { en:'weekly+', th:'รายสัปดาห์/วัน' } : s.freq === 'q' ? { en:'quarterly', th:'รายไตรมาส' } : { en:'monthly', th:'รายเดือน' })) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return h;
  }
  /* how many signals point the same way -- a quick "do the models agree?" */
  function consensus(E, F){
    var up = 0, dn = 0, mid = 0, add = function(v){ if(v > 0) up++; else if(v < 0) dn++; else mid++; };
    E.pillars.forEach(function(p){ add(p.score >= 1 ? 1 : p.score <= -1 ? -1 : 0); });
    if(F.lei) add(F.lei.v > 0.25 ? 1 : F.lei.v < -0.25 ? -1 : 0);
    if(F.rec) add(F.rec.p < 20 ? 1 : F.rec.p > 35 ? -1 : 0);
    if(F.spx) add(F.spx.annual > 6 ? 1 : F.spx.annual < 2 ? -1 : 0);
    var risk = { SPY:1, QQQ:1, IWM:1, EEM:1, EFA:1, HYG:1, XLK:1, XLY:1, SMH:1, XLF:1, XLI:1 };
    var inRisk = (F.flowIn || []).filter(function(r){ return risk[r.sym]; }).length, outRisk = (F.flowOut || []).filter(function(r){ return risk[r.sym]; }).length;
    add(inRisk > outRisk ? 1 : inRisk < outRisk ? -1 : 0);
    var core = fcAt(F.items && F.items.core, 6); if(core) add(core.v < E.infl.v - 0.1 ? 1 : core.v > E.infl.v + 0.1 ? -1 : 0);
    var tot = up + dn + mid, agree = (up + dn) ? Math.max(up, dn) / (up + dn) : 0;
    return { up:up, dn:dn, mid:mid, tot:tot, agree:agree * 100, side:up > dn ? 1 : dn > up ? -1 : 0 };
  }
  function consensusHTML(E, F){
    var c = consensus(E, F);
    return '<div class="bz-cons"><div class="bz-consb"><i class="u" style="flex:' + c.up + '"></i><i class="m" style="flex:' + c.mid + '"></i><i class="d" style="flex:' + c.dn + '"></i></div><div class="bz-consl"><span class="u">' + esc(T({ en:'positive ', th:'บวก ' })) + c.up + '</span><span class="m">' + esc(T({ en:'neutral ', th:'กลาง ' })) + c.mid + '</span><span class="d">' + esc(T({ en:'negative ', th:'ลบ ' })) + c.dn + '</span></div><p>' +
      esc(T({ en:'Signals agree ' + f(c.agree, 0) + '% ' + (c.side > 0 ? 'on the positive side' : c.side < 0 ? 'on the negative side' : '— evenly split') + (c.agree < 60 ? ': a mixed picture, size positions modestly.' : c.agree > 75 ? ': a clear message.' : '.'), th:'สัญญาณเห็นตรงกัน ' + f(c.agree, 0) + '% ' + (c.side > 0 ? 'ไปทางบวก' : c.side < 0 ? 'ไปทางลบ' : '— แบ่งครึ่ง') + (c.agree < 60 ? ' ภาพยังปนกัน ควรลงทุนแบบพอประมาณ' : c.agree > 75 ? ' ข้อความชัดเจน' : '') })) + '</p></div>';
  }

  /* ======================================== FORECAST DETAIL (2026-10-25 e)
     "Show more" panels under every forecast: a month-by-month path, the odds
     of crossing levels that matter, and what would move the forecast. Plus a
     meeting-by-meeting Fed path. */
  var FOMC = [['2026-10-28', 0], ['2026-12-09', 0], ['2027-01-27', 1], ['2027-03-17', 1], ['2027-04-28', 1], ['2027-06-16', 1], ['2027-07-28', 1], ['2027-09-22', 1], ['2027-10-27', 1], ['2027-12-15', 1]];
  function pathAt(it, months){
    /* linear between now (0) and the 3 / 6 / 12-month points */
    var pts = [[0, it.now, it.now, it.now]].concat(it.fc.map(function(q){ return [q.m, q.v, q.lo, q.hi]; }));
    for(var i = 1; i < pts.length; i++){ if(months <= pts[i][0]){ var a = pts[i - 1], b = pts[i], w = (months - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w, a[3] + (b[3] - a[3]) * w]; } }
    var l = pts[pts.length - 1]; return [l[1], l[2], l[3]];
  }
  function monthsTo(t){ return (tms(t) - Date.now()) / (30.44 * 864e5); }
  function fomcRows(F){
    var it = F.items.ff; if(!it) return [];
    var prev = it.now, out = [];
    FOMC.forEach(function(m){
      var mo = monthsTo(m[0]); if(mo < -0.1 || mo > 13) return;
      var p = pathAt(it, Math.max(0, mo)), d = p[0] - prev, pr = clamp(Math.abs(d) / 0.25, 0, 1);
      out.push({ d:m[0], est:m[1], rate:p[0], chg:d, cum:p[0] - it.now, prob:pr * 100, dir:d > 0.0625 ? 1 : d < -0.0625 ? -1 : 0, lo:p[1], hi:p[2] });
      prev = p[0];
    });
    return out;
  }
  function fomcHTML(F){
    var rows = fomcRows(F); if(!rows.length) return '';
    var loc = L() === 'th' ? 'th-TH' : 'en-GB';
    return '<div class="bz-sec bz-fomc"><h4>' + ico('bank') + esc(T({ en:'Fed meeting by meeting (what the market is pricing)', th:'ดอกเบี้ยเฟดรายการประชุม (ตลาดกำลังคาดอะไร)' })) + '</h4><div class="bz-fomcg">' + rows.map(function(r){
      var dd = new Date(tms(r.d)).toLocaleDateString(loc, { day:'numeric', month:'short', year:'2-digit', timeZone:'UTC' });
      var lab = r.dir > 0 ? { en:'hike', th:'ขึ้น' } : r.dir < 0 ? { en:'cut', th:'ลด' } : { en:'hold', th:'คง' };
      return '<div class="' + (r.dir > 0 ? 'up' : r.dir < 0 ? 'dn' : 'fl') + '"><span>' + esc(dd) + (r.est ? ' *' : '') + '</span><b>' + f(r.rate, 2) + '%</b><em class="dec">' + esc(T(lab)) + '</em><i><u style="width:' + f(r.prob, 0) + '%"></u></i><small>' + esc(T({ en:'odds of a 0.25 move ', th:'โอกาสขยับ 0.25 ' })) + f(r.prob, 0) + '% · ' + esc(T({ en:'vs today ', th:'เทียบวันนี้ ' })) + sg(r.cum, 2) + '</small></div>';
    }).join('') + '</div>' + note({ en:'Built from the 3-month T-bill and the 2-year yield (the same path as the forecast chart), read at each meeting date. * 2027 dates are approximate until the Fed publishes its calendar.', th:'สร้างจากตั๋วเงินคลัง 3 เดือนและบอนด์ 2 ปี (เส้นทางเดียวกับกราฟคาดการณ์) อ่านค่า ณ วันประชุมแต่ละครั้ง * วันประชุมปี 2027 เป็นค่าประมาณจนกว่าเฟดจะประกาศปฏิทิน' }) + '</div>';
  }
  function probAbove(it, months, level){
    var p = pathAt(it, months), sd = (p[2] - p[1]) / 2 || 1e-9;
    return (1 - Phi((level - p[0]) / sd)) * 100;
  }
  function fcSens(it, F, E){
    var k = it.k, s = [];
    if(k === 'core' || k === 'cpi'){ s.push({ en:'If prices rise 0.05% a month faster than expected, the 12-month figure ends ≈ +0.6 pt higher.', th:'ถ้าราคาขึ้นเร็วกว่าคาดเดือนละ 0.05% ตัวเลข 12 เดือนข้างหน้าจะสูงกว่าคาดราว +0.6 จุด' });
      if(k === 'cpi') s.push({ en:'Each 10% move in oil shifts headline CPI by roughly 0.2 pt within a quarter.', th:'น้ำมันขยับทุก 10% ทำให้ CPI ขยับราว 0.2 จุดภายในไตรมาส' }); }
    if(k === 'ff'){ s.push({ en:'If core inflation is 0.5 pt higher, the Taylor rule rises 0.75 pt — pressure to hike.', th:'ถ้าเงินเฟ้อพื้นฐานสูงขึ้น 0.5 จุด กฎเทย์เลอร์จะสูงขึ้น 0.75 จุด เป็นแรงกดดันให้ขึ้นดอกเบี้ย' }, { en:'If unemployment rises 0.5 pt, the Taylor rule falls 0.5 pt — room to cut.', th:'ถ้าว่างงานเพิ่ม 0.5 จุด กฎเทย์เลอร์จะลดลง 0.5 จุด เปิดทางให้ลดดอกเบี้ย' }); }
    if(k === 'y10' || k === 'y2'){ s.push({ en:'+0.2 pt in 5-year inflation expectations lifts 10y fair value ≈ +0.1 pt.', th:'เงินเฟ้อคาด 5 ปีเพิ่ม 0.2 จุด ทำให้มูลค่าเหมาะสมของบอนด์ 10 ปีเพิ่มราว 0.1 จุด' }, { en:'One extra 0.25 Fed hike priced lifts the 2y ≈ 0.15 and the 10y ≈ 0.07.', th:'ถ้าตลาดคาดเฟดขึ้นเพิ่ม 1 ครั้ง (0.25) บอนด์ 2 ปีเพิ่มราว 0.15 และ 10 ปีราว 0.07' }); }
    if(k === 'un'){ s.push({ en:'If job growth stalls at 0, unemployment rises ≈ 0.18 pt a quarter.', th:'ถ้าการจ้างงานเพิ่มเป็นศูนย์ อัตราว่างงานจะขึ้นราว 0.18 จุดต่อไตรมาส' }, { en:'A 10% rise in weekly claims adds ≈ 0.12 pt a quarter.', th:'คนขอสวัสดิการว่างงานเพิ่ม 10% เพิ่มอัตราว่างงานราว 0.12 จุดต่อไตรมาส' }); }
    if(k === 'spx'){ s.push({ en:'Every 5 points on the market score moves the expected yearly return ≈ 0.6 pt.', th:'คะแนนตลาดเปลี่ยน 5 แต้ม ผลตอบแทนคาดต่อปีเปลี่ยนราว 0.6 จุด' }, { en:'If VIX doubles, the likely range doubles too — the centre does not move.', th:'ถ้า VIX เพิ่มเป็น 2 เท่า ช่วงที่น่าจะเป็นจะกว้างขึ้น 2 เท่า แต่ค่ากลางไม่เปลี่ยน' }); }
    if(k === 'oil') s.push({ en:'Oil has drifted back about 45% of the way to its 3-year average per year; a supply shock can override that quickly.', th:'น้ำมันมักกลับหาค่าเฉลี่ย 3 ปีราว 45% ต่อปี แต่เหตุการณ์ด้านอุปทานสามารถเปลี่ยนเรื่องนี้ได้เร็ว' });
    return s;
  }
  function fcLevels(it){
    var k = it.k, L2 = [];
    var add = function(lbl, lvl, m){ L2.push({ n:lbl, p:probAbove(it, m, lvl) }); };
    if(k === 'core' || k === 'cpi'){ add({ en:'above 3% in 6 months', th:'เกิน 3% ใน 6 เดือน' }, 3, 6); add({ en:'back below 2.5% in 12 months', th:'กลับต่ำกว่า 2.5% ใน 12 เดือน' }, 2.5, 12); L2[1].p = 100 - L2[1].p; }
    if(k === 'ff'){ add({ en:'higher than today in 12 months', th:'สูงกว่าวันนี้ใน 12 เดือน' }, it.now + 0.01, 12); }
    if(k === 'y10'){ add({ en:'above 5% in 6 months', th:'เกิน 5% ใน 6 เดือน' }, 5, 6); add({ en:'below 4.5% in 12 months', th:'ต่ำกว่า 4.5% ใน 12 เดือน' }, 4.5, 12); L2[1].p = 100 - L2[1].p; }
    if(k === 'y2'){ add({ en:'above today in 6 months', th:'สูงกว่าวันนี้ใน 6 เดือน' }, it.now, 6); }
    if(k === 'un'){ add({ en:'4.5% or more in 12 months', th:'ถึง 4.5% ขึ้นไปใน 12 เดือน' }, 4.5, 12); }
    if(k === 'spx'){ add({ en:'higher in 6 months', th:'สูงกว่าวันนี้ใน 6 เดือน' }, it.now, 6); add({ en:'down 10% or more in 6 months', th:'ลง 10% ขึ้นไปใน 6 เดือน' }, it.now * 0.9, 6); L2[1].p = 100 - L2[1].p; }
    if(k === 'oil'){ add({ en:'above $100 in 6 months', th:'เกิน $100 ใน 6 เดือน' }, 100, 6); add({ en:'below $80 in 12 months', th:'ต่ำกว่า $80 ใน 12 เดือน' }, 80, 12); L2[1].p = 100 - L2[1].p; }
    return L2;
  }
  function fcDetails(it, F, E){
    if(!it || !it.fc) return '';
    var pre = it.unit === '$' ? '$' : '', u = it.unit === '%' ? '%' : '', rows = '';
    for(var m = 1; m <= 12; m++){ var p = pathAt(it, m); rows += '<tr' + (m % 3 === 0 ? ' class="q"' : '') + '><td>' + esc(mshort(addM(it.t, m))) + '</td><td><b>' + pre + f(p[0], it.dec) + u + '</b></td><td>' + pre + f(p[1], it.dec) + ' – ' + f(p[2], it.dec) + u + '</td><td class="' + (p[0] - it.now >= 0 ? 'up' : 'dn') + '">' + sg(p[0] - it.now, it.dec) + '</td></tr>'; }
    var lv = fcLevels(it), sn = fcSens(it, F, E);
    return '<details class="bz-fdet"><summary>' + ico('plus') + esc(T({ en:'Show the detail: month by month, odds and what would change it', th:'ดูละเอียด: รายเดือน โอกาส และอะไรจะทำให้เปลี่ยน' })) + '</summary><div class="bz-fdg">' +
      '<div><h6>' + esc(T({ en:'Month by month (68% range)', th:'รายเดือน (ช่วงโอกาส 68%)' })) + '</h6><table class="bz-mtab"><thead><tr><th></th><th>' + esc(T({ en:'Forecast', th:'คาด' })) + '</th><th>' + esc(T({ en:'Range', th:'ช่วง' })) + '</th><th>' + esc(T({ en:'vs now', th:'เทียบตอนนี้' })) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div>' + (lv.length ? '<h6>' + esc(T({ en:'Odds of levels that matter', th:'โอกาสถึงระดับสำคัญ' })) + '</h6><div class="bz-odds">' + lv.map(function(o){ var p = clamp(o.p, 1, 99); return '<div><span>' + esc(T(o.n)) + '</span><i><u style="width:' + p.toFixed(0) + '%"></u></i><b>' + p.toFixed(0) + '%</b></div>'; }).join('') + '</div>' : '') +
        (sn.length ? '<h6>' + esc(T({ en:'What would change the forecast', th:'อะไรจะทำให้คาดการณ์เปลี่ยน' })) + '</h6><ul class="bz-basis">' + sn.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul>' : '') + '</div></div></details>';
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
    var maxW = Math.max.apply(null, ts.map(function(t){ return W[t]; }).concat([1]));
    var holdInner = (ts.length ? '<div class="bz-tw"><table class="bz-tbl bz-hold"><thead><tr><th></th><th>' + esc(T({ en:'Weight', th:'สัดส่วน' })) + '</th><th>%</th><th class="wbh"></th><th>3M</th><th></th></tr></thead><tbody>' + ts.map(function(t, k){
        var I = info(t), fl = I && (I.s || flow(t)) || {}, m3 = fl.m3;
        return '<tr' + (I ? '' : ' class="miss"') + '><td><i class="dot" style="background:' + DCOL[k % DCOL.length] + '"></i><b>' + esc(t) + '</b><em>' + esc(I ? I.n : T({ en:'not in our data', th:'ไม่มีในข้อมูลของเว็บ' })) + '</em></td><td>' + (ed ? '<input type="number" min="0" step="1" value="' + (+W[t].toFixed(2)) + '" data-pfw="' + esc(t) + '">' : f(W[t], 1)) + '</td><td><b>' + f(W[t] / tot * 100, 1) + '%</b></td><td class="wb"><i style="width:' + (W[t] / maxW * 100).toFixed(0) + '%;background:' + DCOL[k % DCOL.length] + '"></i></td><td class="' + (m3 >= 0 ? 'up' : 'dn') + '">' + spc(m3, 1) + '</td><td>' + (ed ? '<button type="button" class="bz-x" data-pfdel="' + esc(t) + '" aria-label="remove">' + ico('x') + '</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>' : note(s.mode === 'acct' ? { en:'Your account has no tickers yet — add some on the Watchlist page, or add them here (kept in this browser only).', th:'บัญชีนี้ยังไม่มีหุ้น เพิ่มได้ที่หน้า Watchlist หรือเพิ่มตรงนี้ (เก็บเฉพาะในเครื่องนี้)' } : { en:'Empty — add a ticker below.', th:'ยังว่าง เพิ่มหุ้นด้านล่างได้เลย' })) +
      (ed ? '<div class="bz-add">' + universeList() + '<input list="bzUni" data-pfnew placeholder="' + esc(T({ en:'Ticker, e.g. AAPL, PTT, SPY', th:'ชื่อหุ้น เช่น AAPL, PTT, SPY' })) + '"><input type="number" min="1" value="10" data-pfneww><button type="button" class="bz-btn sm" data-pfadd>' + ico('plus') + esc(T({ en:'Add', th:'เพิ่ม' })) + '</button><button type="button" class="bz-btn sm ghost" data-pfeq>' + esc(T({ en:'Equal weights', th:'แบ่งเท่ากันทุกตัว' })) + '</button></div>' : '') +
      note({ en:'Weights are relative: 2 and 1 means two-thirds and one-third.', th:'สัดส่วนเป็นแบบเทียบกัน เช่น 2 กับ 1 คือ สองในสามกับหนึ่งในสาม' });
    if(!ts.length) return h + row([cell(12, { en:'Holdings', th:'สินทรัพย์ในพอร์ต' }, holdInner, 'layers')]);
    var A = analyse(W); PF.last = A;
    var parts = ts.map(function(t, k){ return { n:t, v:W[t] / tot, c:DCOL[k % DCOL.length] }; });
    h += row([cell(7, { en:'Holdings', th:'สินทรัพย์ในพอร์ต' }, holdInner, 'layers'), cell(5, { en:'Weights at a glance', th:'สัดส่วนแบบเห็นภาพ' }, '<div class="bz-wdn">' + donut(parts.slice().sort(function(a, b){ return b.v - a.v; }), 220) + '<div class="bz-wdc"><b>' + ts.length + '</b><span>' + esc(T({ en:'holdings', th:'ตัว' })) + '</span></div></div><div class="bz-wtop">' + parts.slice().sort(function(a, b){ return b.v - a.v; }).slice(0, 6).map(function(p){ return '<div><i style="background:' + p.c + '"></i><b>' + esc(p.n) + '</b><span>' + f(p.v * 100, 1) + '%</span></div>'; }).join('') + '</div>', 'pie')]);
    var hs = Math.round(A.health), htone = hs >= 70 ? 'good' : hs >= 50 ? 'mid' : 'bad';
    h += '<div class="bz-pfh"><div class="bz-ring ' + htone + '" style="--p:' + hs + '"><b>' + hs + '</b><span>' + esc(T({ en:'health', th:'สุขภาพพอร์ต' })) + '</span></div><div class="bz-parts">' + A.parts.map(function(p){
      return '<div><span>' + esc(T(p.n)) + '</span><i><u style="width:' + clamp(p.v, 0, 100).toFixed(0) + '%" class="' + (p.v >= 70 ? 'good' : p.v >= 45 ? 'mid' : 'bad') + '"></u></i><b>' + Math.round(p.v) + '</b></div>';
    }).join('') + '</div>' + (A.risk ? '<div class="bz-kpis sm">' + kpi({ en:'1-year return', th:'ผลตอบแทน 1 ปี' }, spc(A.risk.ret, 1), 'S&P 500 ' + spc(A.risk.spyRet, 1), A.risk.ret >= A.risk.spyRet ? 'good' : '') +
      kpi({ en:'Swings (volatility)', th:'ความผันผวน' }, pc(A.risk.vol, 1), esc(T({ en:'per year', th:'ต่อปี' }))) + kpi({ en:'Worst drop', th:'ร่วงหนักสุด' }, spc(A.risk.dd, 1), esc(T({ en:'past year', th:'ในรอบปี' })), A.risk.dd < -20 ? 'bad' : '') +
      kpi({ en:'Beta vs S&P 500', th:'เบต้าเทียบ S&P 500' }, f(A.risk.beta, 2), esc(T({ en:'1 = moves like the market', th:'1 = ขยับเท่าตลาด' }))) +
      kpi({ en:'Independent bets', th:'จำนวนเดิมพันอิสระ' }, f(A.risk.effBets, 1), esc(T({ en:'of ', th:'จาก ' })) + A.ts.length, A.risk.effBets < 2 ? 'bad' : A.risk.effBets > 4 ? 'good' : '') + '</div>' : '') + '</div>';
    h += '<div class="bz-row">' + cell(5, { en:'What to fix first', th:'สิ่งที่ควรแก้ก่อน' }, '<ul class="bz-iss">' + A.issues.map(function(x){ return '<li class="' + x.k + '">' + ico(x.k === 'good' ? 'check' : 'alert') + '<span>' + esc(T(x.t)) + '</span></li>'; }).join('') + '</ul>' + (function(){ var st = A.parts.filter(function(p){ return p.v >= 65; }), wk = A.parts.filter(function(p){ return p.v < 45; }); return '<h6 class="bz-prh">' + esc(T({ en:'Strengths', th:'จุดแข็ง' })) + '</h6><div class="bz-sw">' + (st.length ? st.map(function(p){ return '<span class="good">' + ico('check') + esc(T(p.n)) + ' <b>' + Math.round(p.v) + '</b></span>'; }).join('') : '<span>—</span>') + '</div><h6 class="bz-prh">' + esc(T({ en:'Weak spots', th:'จุดที่ยังอ่อน' })) + '</h6><div class="bz-sw">' + (wk.length ? wk.map(function(p){ return '<span class="bad">' + ico('alert') + esc(T(p.n)) + ' <b>' + Math.round(p.v) + '</b></span>'; }).join('') : '<span class="good">' + ico('check') + esc(T({ en:'none below 45', th:'ไม่มีด้านไหนต่ำกว่า 45' })) + '</span>') + '</div>'; })() + (A.missing.length ? note({ en:'Not analysed (no data on this site): ' + A.missing.join(', '), th:'ไม่ได้วิเคราะห์ (ไม่มีข้อมูลในเว็บ): ' + A.missing.join(', ') }) : ''), 'alert') +
      (A.curve ? cell(7, { en:'Past year: this mix vs the S&P 500', th:'ย้อนหลัง 1 ปี: พอร์ตนี้ vs S&P 500' }, lc({ series:[{ name:{ en:'This portfolio', th:'พอร์ตนี้' }, pts:A.curve.p, color:COL.a, w:3, area:true }, { name:{ en:'S&P 500', th:'S&P 500' }, pts:A.curve.s, color:COL.g, dash:'5 4' }], unit:'%', zero:true }, MID) + note({ en:'Uses today\'s weights on last year\'s prices (weekly), so it shows how this mix behaved — not what you actually earned.', th:'ใช้สัดส่วนวันนี้กับราคาปีที่แล้ว (รายสัปดาห์) จึงบอกว่าพอร์ตแบบนี้เคยขยับอย่างไร ไม่ใช่กำไรที่ได้จริง' }), 'trend') : '') + '</div>';
    h += '<div class="bz-dns">' + donutBlock({ en:'Asset types', th:'ประเภทสินทรัพย์' }, Object.keys(A.mix.cls).map(function(k){ return { n:CLS_N[k], v:A.mix.cls[k] }; })) +
      donutBlock({ en:'Sectors (stocks only)', th:'กลุ่มอุตสาหกรรม (เฉพาะหุ้น)' }, Object.keys(A.mix.sec).map(function(k){ return { n:sectName(k), v:A.mix.sec[k] }; })) +
      donutBlock({ en:'Where', th:'ประเทศ' }, Object.keys(A.mix.geo).map(function(k){ return { n:GEO_N[k] || k, v:A.mix.geo[k] }; })) + '</div>';
    if(A.risk){
      h += '<div class="bz-two">' + sec({ en:'Stress test — what if…', th:'ทดสอบภาวะวิกฤต — ถ้าเกิด…' }, bars(A.risk.stress.map(function(x){ return { n:x.n, v:x.v }; }), { fmt:function(v){ return spc(v, 1); } }) + note({ en:'Estimated from how this mix actually moved with each factor over the past year, one factor at a time.', th:'ประมาณจากการที่พอร์ตแบบนี้เคยขยับตามแต่ละปัจจัยในปีที่ผ่านมา คิดทีละปัจจัย' }), 'bolt') +
        sec({ en:'Who drives the risk', th:'ใครเป็นต้นเหตุความเสี่ยง' }, '<div class="bz-rc">' + A.risk.cts.map(function(t, i){ return { t:t, w:A.risk.wd[i] * 100, r:A.risk.rc[i] * 100 }; }).sort(function(x, y){ return y.r - x.r; }).map(function(x){
          return '<div><b>' + esc(x.t) + '</b><span><i class="w" style="width:' + clamp(x.w, 0, 100).toFixed(1) + '%"></i><i class="r" style="width:' + clamp(x.r, 0, 100).toFixed(1) + '%"></i></span><em>' + f(x.w, 0) + '% → ' + f(x.r, 0) + '%</em></div>';
        }).join('') + '</div>' + note({ en:'Top bar = share of money, bottom bar = share of risk. When the bottom bar is much longer, that holding swings the whole portfolio.', th:'แถบบน = สัดส่วนเงิน แถบล่าง = สัดส่วนความเสี่ยง ถ้าแถบล่างยาวกว่ามาก ตัวนั้นคือตัวที่เขย่าทั้งพอร์ต' }), 'pie') + '</div>';
      if(A.risk.cts.length > 1 && A.risk.cts.length <= 14){
        h += '<div class="bz-row">' + cell(12, { en:'Do they move together? (correlation, 1 year weekly)', th:'ขึ้นลงไปด้วยกันไหม? (ค่าสหสัมพันธ์ รายสัปดาห์ 1 ปี)' }, '<div class="bz-tw"><table class="bz-corr"><thead><tr><th></th>' + A.risk.cts.map(function(t){ return '<th>' + esc(t) + '</th>'; }).join('') + '</tr></thead><tbody>' + A.risk.cts.map(function(t, i){
          return '<tr><th>' + esc(t) + '</th>' + A.risk.C[i].map(function(c, j){ var a2 = Math.abs(c); return '<td style="background:' + (i === j ? 'transparent' : c >= 0 ? 'rgba(251,113,133,' + (a2 * 0.75).toFixed(2) + ')' : 'rgba(52,211,153,' + (a2 * 0.75).toFixed(2) + ')') + '">' + (i === j ? '' : f(c, 2)) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>' + note({ en:'Red = move together (less protection). Green = move opposite (good for diversification).', th:'แดง = ขึ้นลงพร้อมกัน (ช่วยกันกระจายความเสี่ยงได้น้อย) เขียว = สวนทางกัน (ดีต่อการกระจายความเสี่ยง)' }), 'swap') + '</div>';
      }
    }
    if(A.rebal){
      h += '<div class="bz-row">' + cell(7, { en:'Suggested re-balance', th:'แนวทางปรับสัดส่วน' }, '<div class="bz-tw"><table class="bz-tbl bz-reb"><thead><tr><th></th><th>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</th><th>' + esc(T({ en:'Suggested', th:'แนะนำ' })) + '</th><th></th></tr></thead><tbody>' + A.rebal.map(function(r){
        var d = r.to - r.now;
        return '<tr><td><b>' + esc(r.t) + '</b><em>' + r.why.map(function(w){ return esc(T(w)); }).join(' · ') + '</em></td><td>' + f(r.now, 1) + '%</td><td><b>' + f(r.to, 1) + '%</b></td><td class="' + (d > 0.5 ? 'up' : d < -0.5 ? 'dn' : '') + '">' + (Math.abs(d) < 0.5 ? '—' : spc(d, 1)) + '</td></tr>';
      }).join('') + '</tbody></table></div>' + (editable(s) ? '<button type="button" class="bz-btn sm" data-pfapply>' + ico('check') + esc(T({ en:'Use these weights', th:'ใช้สัดส่วนนี้' })) + '</button>' : '') +
        note({ en:'Rules: cap any single stock at 20% (sector ETFs 30%, broad funds 40%), lean slightly (15%) toward steadier holdings, then +10% for phase fit and −15% for weak fundamentals.', th:'กฎที่ใช้: หุ้นตัวเดียวไม่เกิน 20% (ETF รายกลุ่ม 30% กองทุนกว้าง 40%) เอียงไปทางตัวที่แกว่งน้อยเล็กน้อย (15%) แล้วเพิ่ม 10% ให้ตัวที่เข้ากับสภาวะ และลด 15% ให้ตัวที่พื้นฐานอ่อน' }), 'scale') +
        cell(5, { en:'Would help diversify', th:'ตัวที่ช่วยกระจายความเสี่ยงได้' }, A.adds.length ? '<ul class="bz-adds">' + A.adds.map(function(x){ var I = info(x.t); return '<li><b>' + x.t + '</b><span>' + esc(I ? I.n : '') + '</span><em>' + esc(T({ en:'correlation with your mix ', th:'สหสัมพันธ์กับพอร์ต ' })) + f(x.c, 2) + (x.fit > 0 ? ' · ' + esc(T({ en:'suits the phase', th:'เข้ากับสภาวะ' })) : '') + '</em>' + (editable(s) ? '<button type="button" class="bz-btn sm ghost" data-pfaddt="' + x.t + '">' + ico('plus') + '</button>' : '') + '</li>'; }).join('') + '</ul>' : note({ en:'Needs weekly data.', th:'ต้องใช้ข้อมูลรายสัปดาห์' }), 'plus') + '</div>';
    }
    h += sec({ en:'Report card for each holding', th:'สมุดพกรายตัว' }, '<div class="bz-cards">' + A.cards.filter(Boolean).map(function(c){
      var s2 = c.I.s, rows = c.I.etf ? [[{ en:'Trend', th:'แนวโน้ม' }, c.m], [{ en:'Steadiness', th:'ความนิ่ง' }, c.r]] : [[{ en:'Business quality', th:'คุณภาพธุรกิจ' }, c.q], [{ en:'Price vs peers', th:'ราคาเทียบกลุ่ม' }, c.v], [{ en:'Trend', th:'แนวโน้ม' }, c.m], [{ en:'Dividend', th:'ปันผล' }, c.inc], [{ en:'Steadiness', th:'ความนิ่ง' }, c.r]];
      var avgS = mean(rows.map(function(r){ return r[1]; }).filter(isNum)) || 0;
      return '<div class="bz-card"><div class="bz-cl"><div class="bz-cs ' + (avgS >= 3.7 ? 'good' : avgS >= 2.7 ? 'mid' : 'bad') + '">' + f(avgS, 1) + '<small>/5</small></div><div class="bz-ch"><b>' + esc(c.t) + '</b><span>' + esc(c.I.n) + '</span>' + (c.fit > 0 ? chip(esc(T({ en:'fits phase', th:'เข้ากับสภาวะ' })), 'good') : c.fit < 0 ? chip(esc(T({ en:'phase headwind', th:'สภาวะไม่เอื้อ' })), 'bad') : '') + '</div></div>' +
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
      html += tab === 'guide' ? vGuide() : tab === 'print' ? vPrint() : tab === 'sum' ? vSum(E, F_last) : tab === 'fc' ? vFc(E, F_last) : tab === 'over' ? vOver(E) : tab === 'infl' ? vInfl(E) : tab === 'growth' ? vGrowth(E) : tab === 'fx' ? vFx(E) : tab === 'rot' ? vRot(E) : tab === 'out' ? vOut(E) : tab === 'pf' ? vPf() : vCal();
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
    wirePf(slot); wirePrint(slot);
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('spz:line', function(){ PF.acctTickers = null; if(tab === 'pf') paint(); });
    document.addEventListener('spz:acc', function(){ PF.acctTickers = null; if(tab === 'pf') paint(); });
    paint();
    refresh();
  }
  window.__SPZ_BRAIN = { mount:mount, compute:function(){ return E_last; }, data:function(){ return D; }, analyse:function(W){ return analyse(W); } };
})();
