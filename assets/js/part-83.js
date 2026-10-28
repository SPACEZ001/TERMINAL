/* ===========================================================================
   MARKET BRAIN (#/brain) -- admin-only board (2026-10-25). Loaded on demand
   by part-82.js. One screen that reads everything the site already knows
   and turns it into plain words:

     data/market.json  (every 30 min) yields, VIX, dollar, sectors, 555 stocks
     data/brain.json   (twice a day)  FRED economy series + ETF weekly closes
     data/bubble.json  (daily)        CAPE, Buffett indicator, margin debt, put/call
     data/econ.json    (twice a day)  this week's economic calendar
     data/brain_ext.json (twice a day) track record, look-alikes, warnings,
                       Fed liquidity, Thailand, event-day moves (2026-10-26)

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
  var D = { m:null, b:null, bub:null, econ:null, x:null, at:0 };
  function getJSON(u){ return fetch(u, { cache:'no-cache' }).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).catch(function(){ return null; }); }
  function loadData(){
    var live = null; try { live = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    return Promise.all([
      live && live.stocks ? Promise.resolve(live) : getJSON('data/market.json'),
      getJSON('data/brain.json'), getJSON('data/bubble.json'), getJSON('data/econ.json'), getJSON('data/brain_ext.json')
    ]).then(function(r){ D.m = r[0]; D.b = r[1]; D.bub = r[2]; D.econ = r[3]; D.x = r[4]; D.at = Date.now(); return D; });
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
  /* Simulated example paths for a forecast fan: f0 = [{x, v, lo, hi}] with
     the first point = today (lo = hi = v); lo/hi = the 68% range. Each path
     is a Brownian walk scaled so that at every date it is a draw from the
     forecast's own distribution (median v, 1 s.d. = half the 68% range), so
     the band, not the path, is the forecast. Seeded, so paths stay put. */
  function seedRng(str){ var h = 1779033703 ^ str.length; for(var i = 0; i < str.length; i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return function(){ h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; var t = (h >>> 0) / 4294967296; return t; }; }
  function simPaths(f0, n, steps, logS, seed){
    var rnd = seedRng(seed), gauss = function(){ var u = Math.max(rnd(), 1e-9), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    var xA = f0[0].x, xB = f0[f0.length - 1].x, tf = logS ? Math.log : function(v){ return v; }, itf = logS ? Math.exp : function(v){ return v; };
    var at = function(x){ for(var i = 1; i < f0.length; i++){ if(x <= f0[i].x){ var a = f0[i - 1], b = f0[i], w = (x - a.x) / (b.x - a.x || 1); var ma = tf(a.v), mb = tf(b.v), sa = (tf(a.hi) - tf(a.lo)) / 2, sb = (tf(b.hi) - tf(b.lo)) / 2; return [ma + (mb - ma) * w, sa + (sb - sa) * w]; } } var l = f0[f0.length - 1]; return [tf(l.v), (tf(l.hi) - tf(l.lo)) / 2]; };
    /* simulate a pool, keep only paths that stay inside about 2 s.d. the
       whole way, then pick ones ending spread across the range (low, mid-low,
       mid-high, high) so the examples are typical rather than extreme */
    var pool = [];
    for(var k = 0; k < 80; k++){
      var B = 0, mz = 0, path = [[xA, f0[0].v]];
      for(var j = 1; j <= steps; j++){
        var x = xA + (xB - xA) * j / steps, frac = j / steps; B += gauss() * Math.sqrt(1 / steps);
        var z = B / Math.sqrt(frac); if(j > steps / 8) mz = Math.max(mz, Math.abs(z));
        var ms = at(x); path.push([x, itf(ms[0] + ms[1] * z)]);
      }
      if(mz < 2) pool.push({ p:path, z:B });
    }
    var tg = n === 3 ? [-0.8, 0.1, 0.9] : [-1, -0.3, 0.35, 1.05], out = [];
    tg.slice(0, n).forEach(function(t){ var best = null; pool.forEach(function(c){ if(out.indexOf(c.p) < 0 && (!best || Math.abs(c.z - t) < Math.abs(best.z - t))) best = c; }); if(best) out.push(best.p); });
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
    var tags = [], simUsed = false;
    ser.forEach(function(s, i){
      var c = s.color || COL['abcdefg'[i]], d = '';
      s.pts.forEach(function(p, j){ d += (j ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p[1]).toFixed(1); });
      if(s.area){ g += '<path class="bz-area" d="' + d + 'L' + X(s.pts[s.pts.length - 1].x).toFixed(1) + ' ' + (H - P.b) + 'L' + X(s.pts[0].x).toFixed(1) + ' ' + (H - P.b) + 'Z" fill="' + c + '"/>'; }
      g += '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (s.w || 2) + '" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/>';
      var lp = s.pts[s.pts.length - 1];
      if(s.fc && s.fc.length){
        var fq = [{ x:lp.x, v:lp[1], lo:lp[1], hi:lp[1], lo2:lp[1], hi2:lp[1] }].concat(s.fc);
        if(isNum(s.fc[0].lo2)){ var b2 = fq.map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.hi2).toFixed(1); }).join('L') + 'L' + fq.slice().reverse().map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.lo2).toFixed(1); }).join('L'); g += '<path d="M' + b2 + 'Z" fill="' + c + '" opacity=".08"/>'; }
        if(isNum(s.fc[0].lo) && H >= 200 && opt.sim !== false){ simUsed = true; simPaths(fq.map(function(q){ return { x:q.x, v:q.v, lo:isNum(q.lo) ? q.lo : q.v, hi:isNum(q.hi) ? q.hi : q.v }; }), 3, Math.max(6, Math.min(36, Math.round((fq[fq.length - 1].x - fq[0].x) / (30.4 * 864e5)))), false, (T(s.name) || '') + lp[0] + lp[1]).forEach(function(pth){ g += '<path d="' + pth.map(function(q, j){ return (j ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(clamp(q[1], y0, y1)).toFixed(1); }).join('') + '" fill="none" stroke="' + c + '" stroke-width="1" opacity=".35" stroke-linejoin="round"/>'; }); }
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
    var leg = ser.length > 1 || opt.legend || simUsed ? '<div class="bz-leg">' + ser.map(function(s, i){ return '<span><i style="background:' + (s.color || COL['abcdefg'[i]]) + '"></i>' + esc(T(s.name)) + '</span>'; }).join('') + (simUsed ? '<span class="sim"><i></i>' + esc(T({ en:'thin lines = example paths inside the range (not a prediction)', th:'เส้นบาง = ตัวอย่างเส้นทางที่เป็นไปได้ในกรอบ (ไม่ใช่คำทำนาย)' })) + '</span>' : '') + '</div>' : '';
    return leg + '<div class="bz-chart" data-ch="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="bz-svg">' + g +
      '<line class="bz-xh" x1="0" x2="0" y1="' + P.t + '" y2="' + (H - P.b) + '" style="display:none"/></svg><div class="bz-tip" hidden></div></div>';
  }
  function onChartMove(ev){
    var host = ev.target.closest && ev.target.closest('.bz-chart');
    if(!host){ var sl = ev.currentTarget; if(sl && sl.querySelectorAll) sl.querySelectorAll('.bz-tip:not([hidden])').forEach(function(t){ hideTip(t.parentNode); }); return; }
    var c = CH[host.getAttribute('data-ch')]; if(!c) return;
    var r = host.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * c.W;
    if(px < c.P.l || px > c.W - c.P.r){ hideTip(host); return; }
    var xt = c.x0 + (px - c.P.l) / (c.W - c.P.l - c.P.r) * (c.x1 - c.x0), rows = [], when = null;
    c.ser.forEach(function(s, i){
      var best = null, bd = Infinity;
      for(var j = 0; j < s.pts.length; j++){ var dd = Math.abs(s.pts[j].x - xt); if(dd < bd){ bd = dd; best = s.pts[j]; } }
      (s.fc || []).forEach(function(q){ var dq = Math.abs(q.x - xt); if(dq < bd){ bd = dq; best = [q.t, q.v]; best.fc = q; } });
      if(best){ when = when || best[0]; rows.push('<div><i style="background:' + (s.color || COL['abcdefg'[i]]) + '"></i>' + esc(T(s.name) || '') + (best.fc ? ' <small>(' + esc(T({ en:'forecast', th:'คาด' })) + ')</small>' : '') + ' <b>' + (s.fmt ? s.fmt(best[1]) : c.fmt ? c.fmt(best[1]) : f(best[1], c.dec) + c.unit) + '</b>' + (best.fc && isNum(best.fc.lo) ? '<div class="bz-tr">' + (c.fmt ? T({ en:'likely ', th:'ช่วง 68%: ' }) + (c.fmtR || c.fmt)(best.fc.lo) + ' – ' + (c.fmtR || c.fmt)(best.fc.hi) : f(best.fc.lo, c.dec) + ' – ' + f(best.fc.hi, c.dec) + c.unit) + '</div>' : '') + '</div>'); }
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
    var sp = smartPick(mkt, n); if(sp && sp.length >= Math.min(n, 4)) return sp;
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
    return '<div class="bz-sec bz-fsec" id="bzfc-' + it.k + '"><h4>' + ico('radar') + esc(T(it.name)) + '<span class="bz-fq">' + pre + f(it.now, it.dec) + u + ' → <b>' + pre + f(b && b.v, it.dec) + u + '</b> <small>6M</small> → <b>' + pre + f(c && c.v, it.dec) + u + '</b> <small>12M</small></span></h4>' +
      lineChart({ series:[{ name:it.name, pts:hist, color:color, w:2.4, fc:it.fc }], unit:u, dec:it.dec, ref:it.ref, rec:D.b && D.b.recessions, band:extra && extra.band, zero:extra && extra.zero, h:280, sim:it.k !== 'ff' }) + basisList(it) + fcDetails(it, F_last, E_last) + '</div>';
  }
  function vFc(E, F){
    var h = releaseStrip(F) + '<div class="bz-fcgrid wide">' + ['core', 'ff', 'y10', 'un', 'spx', 'oil'].map(function(k, i){ return fcCard(F.items[k], ['#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f97316'][i]); }).join('') + '</div>';
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
    }).join('') + '</tbody></table></div>' + note({ en:'Picked by the same engine as “Best overall” on World outlook (scenario history + five factors), 8 names, max 2 per sector. For the full list of 12, other types (blue chips, dividends, growth) and keep/trim checks, open World outlook.', th:'คัดด้วยระบบเดียวกับ “ควรถือตอนนี้” ในหน้าแนวโน้มเศรษฐกิจโลก (สถิติฉากทัศน์ + 5 ปัจจัย) 8 ตัว กลุ่มละไม่เกิน 2 ตัว ถ้าอยากดูครบ 12 ตัว ดูแบบหุ้นใหญ่ ปันผล กำไรโต หรือเช็กหุ้นที่ถือ ให้เปิดหน้าแนวโน้มเศรษฐกิจโลก' }) + '<button type="button" class="bz-btn ghost" data-go="world">' + ico('globe') + esc(T({ en:'Open World outlook', th:'เปิดหน้าแนวโน้มเศรษฐกิจโลก' })) + '</button><button type="button" class="bz-btn" data-pfmode="auto' + mk + '">' + ico('flask') + esc(T({ en:'Analyse this basket as a portfolio', th:'วิเคราะห์ตะกร้านี้แบบพอร์ต' })) + '</button>' : note({ en:'Not enough data.', th:'ข้อมูลไม่พอ' }), 'star', 'bk');
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
    var whyOf = function(e){ var w = ''; for(var i = 0; i < EVT.length; i++){ if(EVT[i][0].test(e.event)){ w = T(EVT[i][1]); break; } } var st = evStat(e); if(st) w += (w ? ' · ' : '') + T({ en:'on days like this the S&P 500 moves ±' + f(st.s.abs, 2) + '% on average (normal ±' + f(st.n.abs, 2) + '%)', th:'วันแบบนี้ S&P 500 แกว่งเฉลี่ย ±' + f(st.s.abs, 2) + '% (วันปกติ ±' + f(st.n.abs, 2) + '%)' }); return w; };
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
      [{ en:'Red edge = high impact, amber = medium.', th:'ขอบแดง = สำคัญมาก ขอบเหลือง = สำคัญปานกลาง' }, { en:'Compare “actual” with “expected” when it comes out: a big miss moves markets.', th:'เทียบ “ออกจริง” กับ “คาด” ถ้าต่างกันมาก ตลาดจะขยับแรง' }, { en:'Tripwires closest to 100% are the ones to watch this week.', th:'เส้นเตือนที่ใกล้ 100% คือสิ่งที่ต้องจับตาสัปดาห์นี้' }]],
    ['px', 'coin', { en:'Gold & bitcoin forecast', th:'คาดการณ์ทอง & บิตคอยน์' }, { en:'Price forecasts from 1 week to 12 months with a full trend read and key levels.', th:'คาดการณ์ราคา 1 สัปดาห์ถึง 12 เดือน พร้อมวิเคราะห์แนวโน้มและระดับราคาสำคัญ' },
      [{ en:'Switch between gold and bitcoin with the two big buttons at the top.', th:'สลับทองคำ/บิตคอยน์ด้วยปุ่มใหญ่ 2 ปุ่มด้านบน' }, { en:'On the big chart: the coloured “NOW” label is today\'s price; purple labels are where the forecast points at 3, 6 and 12 months; the right-hand badges show now, the 12-month target, support (green) and resistance (red).', th:'บนกราฟใหญ่: ป้ายสี “ตอนนี้” คือราคาวันนี้ ป้ายม่วงคือราคาที่คาดใน 3, 6 และ 12 เดือน ป้ายด้านขวาบอกราคาตอนนี้ เป้า 12 เดือน แนวรับ (เขียว) และแนวต้าน (แดง)' }, { en:'Move the mouse or a finger over the chart to read the price on any past day, or the forecast and its range in the purple zone.', th:'เลื่อนเมาส์หรือนิ้วบนกราฟ เพื่อดูราคาวันไหนก็ได้ในอดีต หรือราคาคาดการณ์และช่วงที่น่าจะเป็นในโซนม่วง' }, { en:'The strip under the chart lists now → 1 week → 12 months with dates; “What to watch next” gives the levels and the odds of breaking them within a month.', th:'แถบใต้กราฟเรียงราคา ตอนนี้ → 1 สัปดาห์ → 12 เดือน พร้อมวันที่ ส่วน “จุดที่ต้องจับตาต่อไป” บอกระดับราคาและโอกาสที่จะทะลุภายใน 1 เดือน' }, { en:'“Why this forecast” shows each piece in %; the track-record table says how far to trust each horizon.', th:'ตาราง “ทำไมคาดการณ์ออกมาแบบนี้” แยกแต่ละส่วนเป็น % และตารางความแม่นบอกว่าควรเชื่อแต่ละกรอบเวลาแค่ไหน' }]],
    ['world', 'globe', { en:'World outlook', th:'แนวโน้มเศรษฐกิจโลก' }, { en:'Where the global economy is heading, why, and which countries, sectors and stocks benefit.', th:'เศรษฐกิจโลกกำลังไปทางไหน เพราะอะไร และประเทศ กลุ่มหุ้น หุ้นไหนได้ประโยชน์' },
      [{ en:'Read the top box first: the global phase and the one-paragraph summary.', th:'อ่านกล่องบนสุดก่อน: ช่วงเศรษฐกิจโลกและสรุปย่อหน้าเดียว' }, { en:'Each variable card says what it measures and whether it is helping (green) or hurting (red).', th:'การ์ดตัวแปรแต่ละใบบอกว่าวัดอะไร และกำลังช่วย (เขียว) หรือฉุด (แดง)' }, { en:'Switch the world map between score, growth, cycle, rates and inflation; the ranking table lists each country\'s ETF.', th:'สลับแผนที่โลกระหว่าง คะแนน GDP วัฏจักร ดอกเบี้ย เงินเฟ้อ ตารางจัดอันดับบอกชื่อ ETF ของแต่ละประเทศ' }]],
    ['track', 'target', { en:'Track record', th:'ความแม่นของสมอง' }, { en:'How often the forecasts were right, tested month by month since 2012.', th:'คาดการณ์เคยถูกบ่อยแค่ไหน ทดสอบทีละเดือนตั้งแต่ปี 2012' },
      [{ en:'Grade A/B = the model beats the “nothing changes” guess; C/D = lean on it less.', th:'เกรด A/B = โมเดลชนะการเดาว่า “ไม่เปลี่ยน” · C/D = เชื่อให้น้อยลง' }, { en:'“Inside the 68% range” should be near 68%: much lower = ranges were too narrow (the board now widens them automatically).', th:'“ตกในช่วง 68%” ควรใกล้ 68% ถ้าต่ำมาก = ช่วงเคยแคบเกินไป (ตอนนี้ระบบขยายให้อัตโนมัติ)' }, { en:'Grey dashed line = what was forecast 6 months earlier; coloured line = what happened.', th:'เส้นประเทา = ที่ทายไว้ 6 เดือนก่อน · เส้นสี = ที่เกิดขึ้นจริง' }]],
    ['analog', 'history', { en:'Past look-alikes', th:'อดีตที่คล้ายตอนนี้' }, { en:'The months since 1960 that looked most like today, and what came next.', th:'เดือนตั้งแต่ปี 1960 ที่หน้าตาคล้ายวันนี้ที่สุด และอะไรเกิดขึ้นต่อจากนั้น' },
      [{ en:'Compare the outcome cards with “normal”: green = better than usual for stocks.', th:'เทียบการ์ดผลลัพธ์กับ “ปกติ” สีเขียว = ดีกว่าปกติสำหรับหุ้น' }, { en:'The thick white line is the average path of the S&P 500 after the look-alikes.', th:'เส้นขาวหนาคือเส้นทางเฉลี่ยของ S&P 500 หลังช่วงที่คล้ายกัน' }, { en:'History rhymes, it does not repeat — read it as odds.', th:'ประวัติศาสตร์คล้ายเดิมแต่ไม่ซ้ำเป๊ะ ให้อ่านเป็นโอกาส' }]],
    ['alert', 'alert', { en:'Warning signals', th:'สัญญาณเตือน' }, { en:'15 classic warning rules, how close each is now, and their record since 1970.', th:'กฎเตือนคลาสสิก 15 ข้อ ใกล้จะทำงานแค่ไหน และผลงานตั้งแต่ปี 1970' },
      [{ en:'Red badge = firing now; amber = more than 70% of the way there.', th:'ป้ายแดง = ทำงานอยู่ · ป้ายเหลือง = มาแล้วเกิน 70%' }, { en:'“Recession ≤18M” tells you how often a recession followed — the higher, the more serious the rule.', th:'“ถดถอยใน 18 ด.” บอกว่าหลังสัญญาณมีภาวะถดถอยตามมาบ่อยแค่ไหน ยิ่งสูงยิ่งต้องจริงจัง' }, { en:'New signals are pushed to the admin Telegram automatically.', th:'สัญญาณใหม่จะส่งเข้า Telegram ของแอดมินอัตโนมัติ' }]],
    ['liq', 'drop', { en:'Fed liquidity', th:'สภาพคล่องเฟด' }, { en:'How much cash the Fed and Treasury are putting into (or pulling out of) markets.', th:'เฟดและกระทรวงการคลังกำลังเติมเงินเข้า (หรือดูดออกจาก) ตลาดเท่าไร' },
      [{ en:'Net liquidity rising = tailwind; falling = headwind.', th:'สภาพคล่องสุทธิเพิ่ม = แรงหนุน · ลด = แรงต้าน' }, { en:'Watch the Treasury account around tax dates and debt-ceiling deals — it can swing by hundreds of billions.', th:'จับตาบัญชีกระทรวงการคลังช่วงเก็บภาษีและช่วงเพดานหนี้ ขยับได้หลายแสนล้านดอลลาร์' }, { en:'Check the correlation note: sometimes stocks ignore liquidity for long stretches.', th:'ดูค่าความสัมพันธ์ด้วย บางช่วงหุ้นไม่สนสภาพคล่องเป็นเวลานาน' }]],
    ['thai', 'flag', { en:'Thailand', th:'เศรษฐกิจไทย' }, { en:'Bank of Thailand rate, Thai inflation, the baht and the IMF outlook.', th:'ดอกเบี้ย ธปท. เงินเฟ้อไทย เงินบาท และมุมมอง IMF' },
      [{ en:'Inflation inside the shaded 1–3% band = on target.', th:'เงินเฟ้ออยู่ในแถบ 1–3% = ตรงเป้า' }, { en:'A big negative gap versus the Fed rate tends to weaken the baht.', th:'ดอกเบี้ยไทยต่ำกว่าเฟดมาก มักทำให้บาทอ่อน' }, { en:'Shaded columns in the IMF table are forecasts.', th:'ช่องแรเงาในตาราง IMF คือค่าคาดการณ์' }]],
    ['whatif', 'sliders', { en:'What if…', th:'ลองสมมติ' }, { en:'Change oil, the Fed, inflation, jobs, yields, the dollar, VIX or stocks and see everything re-calculate.', th:'ปรับน้ำมัน เฟด เงินเฟ้อ การจ้างงาน ยีลด์ ดอลลาร์ VIX หรือหุ้น แล้วดูทุกอย่างคำนวณใหม่' },
      [{ en:'Start with a ready-made scenario, then fine-tune the sliders.', th:'เริ่มจากสถานการณ์สำเร็จรูป แล้วค่อยปรับแถบ' }, { en:'“Your portfolio” uses the one selected on “My portfolio”.', th:'“พอร์ตของคุณ” ใช้พอร์ตที่เลือกไว้ในหน้า “พอร์ตของฉัน”' }, { en:'If no driver changes, the shock is too small to cross any rule\'s threshold.', th:'ถ้าไม่มีปัจจัยไหนเปลี่ยน แปลว่าการขยับเล็กเกินกว่าจะข้ามเกณฑ์ของกฎ' }]]
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
    h += '<h3 class="bz-h3">' + ico('book') + esc(T(HB_T)) + '</h3>' + handbookHTML(false);
    h += '<h3 class="bz-h3">' + ico('book') + esc(T({ en:'Words used on this page', th:'คำศัพท์ที่ใช้ในหน้านี้' })) + '</h3><div class="bz-gloss">' + GLOSS.map(function(g){ return '<div><b>' + esc(g[0]) + '</b><span>' + esc(T(g[1])) + '</span></div>'; }).join('') + '</div>';
    h += '<div class="bz-callout mid">' + ico('star') + '<div><b>' + esc(T({ en:'Colours everywhere', th:'ความหมายของสีทั้งหน้า' })) + '</b><p>' + esc(T({ en:'Green = good for stocks · Amber = neutral / watch · Red = bad for stocks · Purple = forecast.', th:'เขียว = ดีต่อหุ้น · เหลือง = กลางๆ / จับตา · แดง = ไม่ดีต่อหุ้น · ม่วง = ค่าคาดการณ์' })) + '</p></div></div>';
    h += '<div class="bz-mwrap">' + vManual() + '</div>';
    return h;
  }

  /* ---------------------------------------------------------------- print */
  var PR = { type:'full', secs:{}, orient:'portrait', theme:'light', cover:true };
  var PR_TYPES = [
    ['full', 'book', { en:'Full report', th:'ฉบับเต็มทุกอย่าง' }, { en:'Every tab of the Market Brain in one document.', th:'ทุกแท็บของสมองตลาดในเอกสารเดียว' }, ['sum', 'fc', 'px', 'world', 'track', 'over', 'infl', 'liq', 'growth', 'alert', 'fx', 'thai', 'rot', 'out', 'analog', 'whatif', 'pf', 'cal']],
    ['brief', 'layers', { en:'Executive brief', th:'สรุปผู้บริหาร' }, { en:'Cover + summary: now, ahead, table, forecasts. ~3 pages.', th:'ปก + สรุป: ตอนนี้ ข้างหน้า ตาราง และคาดการณ์ ราว 3 หน้า' }, ['sum']],
    ['weekly', 'cal', { en:'Weekly report', th:'รายงานประจำสัปดาห์' }, { en:'Summary, market today and this week\'s calendar.', th:'สรุป ภาพรวมวันนี้ และปฏิทินสัปดาห์นี้' }, ['sum', 'over', 'cal']],
    ['forecast', 'radar', { en:'Forecast report', th:'รายงานพยากรณ์' }, { en:'All forecast charts with methods + the three scenarios.', th:'กราฟคาดการณ์ทั้งหมดพร้อมวิธีคิด + 3 สถานการณ์' }, ['fc', 'px', 'track', 'out']],
    ['economy', 'factory', { en:'Economy report', th:'รายงานเศรษฐกิจ' }, { en:'Inflation & rates, jobs & growth, currencies & commodities.', th:'เงินเฟ้อและดอกเบี้ย การจ้างงานและเศรษฐกิจ ค่าเงินและสินค้าโภคภัณฑ์' }, ['world', 'infl', 'liq', 'growth', 'alert', 'fx', 'thai']],
    ['portfolio', 'pie', { en:'Portfolio report', th:'รายงานพอร์ต' }, { en:'The portfolio currently selected on “My portfolio”.', th:'พอร์ตที่เลือกอยู่ในหน้า “พอร์ตของฉัน”' }, ['pf', 'rot']],
    ['price', 'coin', { en:'Gold & bitcoin price forecast', th:'รายงานคาดการณ์ราคาทองและบิตคอยน์' }, { en:'Big charts, 1 week → 12 month forecasts, trend, key levels and track record for gold and bitcoin.', th:'กราฟใหญ่ คาดการณ์ 1 สัปดาห์ → 12 เดือน แนวโน้ม ระดับราคาสำคัญ และความแม่นย้อนหลัง ของทองคำและบิตคอยน์' }, ['px']],
    ['history', 'history', { en:'History, warnings & track record', th:'รายงานย้อนหลัง สัญญาณเตือน และความแม่น' }, { en:'How accurate the brain has been, the past months most like today, and every warning rule since 1970.', th:'สมองตลาดแม่นแค่ไหน ช่วงในอดีตที่คล้ายวันนี้ และกฎเตือนทุกข้อตั้งแต่ปี 1970' }, ['track', 'analog', 'alert']],
    ['handbook', 'compass', { en:'Menu handbook', th:'คู่มือการใช้ทุกเมนู' }, { en:'What each menu is for, what to look at first, how to read it and what to do with it — plus “where do I find…?”.', th:'แต่ละเมนูไว้ทำอะไร ดูตรงไหนก่อน อ่านอย่างไร และเอาไปใช้อย่างไร พร้อม “อยากรู้… ดูเมนูไหน”' }, ['hb']],
    ['manual', 'flask', { en:'How the Market Brain thinks', th:'คู่มือ: สมองตลาดคิดอย่างไร' }, { en:'Every screen and model explained: what it looks at, how it decides, why — with today\'s numbers.', th:'อธิบายทุกหน้าและทุกโมเดล: ดูอะไร คิดอย่างไร เพราะอะไร พร้อมตัวเลขวันนี้' }, ['manual']],
    ['custom', 'check', { en:'Choose myself', th:'เลือกเอง' }, { en:'Tick exactly the sections you want.', th:'ติ๊กเลือกเฉพาะส่วนที่ต้องการ' }, null]
  ];
  var PR_SECS = ['sum', 'fc', 'px', 'world', 'track', 'over', 'infl', 'liq', 'growth', 'alert', 'fx', 'thai', 'rot', 'out', 'analog', 'whatif', 'pf', 'cal', 'hb', 'manual'];
  var MAN_T = { en:'How the Market Brain thinks', th:'คู่มือ: สมองตลาดคิดอย่างไร' };
  var WEB_URL = 'https://terminal.spacezblack.workers.dev/';
  try { PR.analyst = localStorage.getItem('spz.report.analyst') === '1'; } catch(e){}
  var IS_SAFARI = /^((?!chrome|chromium|android|crios|fxios|edg|opr).)*safari/i.test(navigator.userAgent || '');
  PR.br = 'auto'; try { PR.br = localStorage.getItem('spz.brain.prbr') || 'auto'; } catch(e){}
  function prBr(){ return PR.br === 'chrome' || PR.br === 'safari' ? PR.br : (IS_SAFARI ? 'safari' : 'chrome'); }
  PR.hd = { logo:1, brand:1, title:1, sub:1, dates:1, ref:1 };
  try { var hs = JSON.parse(localStorage.getItem('spz.brain.prhead') || 'null'); if(hs) PR.hd = hs; } catch(e){}
  function prType(){ for(var i = 0; i < PR_TYPES.length; i++) if(PR_TYPES[i][0] === PR.type) return PR_TYPES[i]; return PR_TYPES[0]; }
  function prRef(){
    var code = PR.type === 'manual' ? 'MG' : PR.type === 'handbook' ? 'HB' : 'MB';
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
  function prTitle(k){ if(k === 'manual') return MAN_T; if(k === 'hb') return HB_T; for(var i = 0; i < TABS.length; i++) if(TABS[i][0] === k) return TABS[i][1]; return { en:k, th:k }; }
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
      '<h6 class="bz-prh">' + esc(T({ en:'Printing from', th:'พิมพ์จากเบราว์เซอร์' })) + '</h6><div class="bz-pro bz-prbr">' + [['auto', { en:'Auto (' + (IS_SAFARI ? 'Safari' : 'Chrome') + ')', th:'อัตโนมัติ (' + (IS_SAFARI ? 'Safari' : 'Chrome') + ')' }], ['chrome', { en:'Chrome', th:'Chrome' }], ['safari', { en:'Safari', th:'Safari' }]].map(function(o){ return '<button type="button" data-prbr="' + o[0] + '" class="' + (PR.br === o[0] ? 'on' : '') + '">' + esc(T(o[1])) + '</button>'; }).join('') + '</div>' +
      '<p class="bz-note bz-prtip">' + esc(T(prBr() === 'safari' ? { en:'In Safari\'s print window: Paper size A4 · Scale 100% · tick “Print backgrounds” · untick “Print headers and footers”.', th:'ในหน้าต่างพิมพ์ของ Safari: ขนาดกระดาษ A4 · สเกล 100% · ติ๊ก “พิมพ์พื้นหลัง” · ไม่ติ๊ก “พิมพ์หัวกระดาษและท้ายกระดาษ”' } : { en:'In Chrome\'s print window: Paper A4 · Margins “Default” or “None” · Scale “Default” · tick “Background graphics”.', th:'ในหน้าต่างพิมพ์ของ Chrome: กระดาษ A4 · ระยะขอบ “ค่าเริ่มต้น” หรือ “ไม่มี” · สเกล “ค่าเริ่มต้น” · ติ๊ก “กราฟิกพื้นหลัง”' })) + '</p>' +
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
    return XV[k] ? XV[k](true) : k === 'sum' ? vSum(E, F) : k === 'fc' ? vFc(E, F) : k === 'over' ? vOver(E) : k === 'infl' ? vInfl(E) : k === 'growth' ? vGrowth(E) : k === 'fx' ? vFx(E) : k === 'rot' ? vRot(E) : k === 'out' ? vOut(E) : k === 'pf' ? vPf() : k === 'cal' ? vCal() : k === 'manual' ? vManual() : '';
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
      '.bz-sec>h4{break-after:avoid;}.bz-fdet{display:none!important;}.bz-hm{min-width:0!important;width:100%!important;font-size:9px!important;}.bz-hm col.n{width:118px!important;}.bz-hm col.v{width:50px!important;}.bz-hm col.d{width:18px!important;}.bz-hm td.n{min-width:0!important;font-size:9.5px!important;white-space:normal!important;line-height:1.2;padding:0 4px 0 0!important;}.bz-hm td.v{font-size:9px!important;padding:0 2px!important;}.bz-hm th{font-size:8px!important;}.bz-hm td{height:13px!important;}.bz-wmet,.bz-xpl{display:none!important;}.bz-wgl{animation:none!important;}.bz-wcin,.bz-wrin,.bz-wrot .bz-note{display:none!important;}.bz-wrot:not(:has(table)){display:none!important;}.bz-wsng{grid-template-columns:repeat(2,minmax(0,1fr))!important;}.bz-wsn,.bz-wpl2,.bz-wsc,.bz-wdog>div{break-inside:avoid;page-break-inside:avoid;}.bz-hbg,.bz-hbqg{grid-template-columns:1fr 1fr!important;}.bz-hbc,.bz-hbqg>div{break-inside:avoid;page-break-inside:avoid;}.bz-hbc{padding:10px!important;}.bz-hbp,.bz-hbb li{font-size:11px!important;line-height:1.5!important;}.bz-wplg{grid-template-columns:repeat(2,minmax(0,1fr))!important;}.bz-wadv,.bz-wrin,[data-wrres]>.bz-note{display:none!important;}.bz-wcalc,.bz-gr,.bz-wpk{grid-template-columns:1fr!important;}.bz-wh2{grid-template-columns:1fr 1fr!important;}.bz-wh2l{grid-column:1/-1;flex-direction:row!important;}.bz-wsig{grid-template-columns:26px 120px minmax(40px,1fr) 80px!important;}.bz-wrow{display:block!important;}.bz-wrow>.bz-sec{width:auto!important;max-width:none!important;margin:0 0 12px!important;}.bz-wmap{grid-template-rows:repeat(4,60px)!important;gap:4px!important;}.bz-wt{padding:4px 6px!important;border-radius:8px!important;}.bz-wt b{font-size:12.5px!important;}.bz-wt span,.bz-wt em{font-size:8.5px!important;}.bz-hm th{font-size:7px!important;}.bz-wkg{grid-template-columns:repeat(2,minmax(0,1fr))!important;}.bz-pxh2,.bz-whero{grid-template-columns:1fr!important;}.bz-trc,.bz-al,.bz-evc,.bz-anout>div,.bz-alrec>div{break-inside:avoid;page-break-inside:avoid;}.bz-pxr,.bz-wipre,.bz-wictl input,.bz-trmore>summary,.bz-more>summary{display:none!important;}.bz-trmore>div,.bz-more>div{display:grid!important;}.bz-trk,.bz-alg{grid-template-columns:repeat(2,minmax(0,1fr))!important;}.bz-evg{grid-template-columns:repeat(3,minmax(0,1fr))!important;}.bz-anout{grid-template-columns:repeat(4,minmax(0,1fr))!important;}.bz-wi{grid-template-columns:1fr!important;}.bz-hm td{height:11px!important;}' +
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
  var SAFE = '.bz-view>*,.bz-row>*,.bz-sec>*,.bz-two>*,tr,.bz-tiles>*,.bz-dtiles>*,.bz-pills>*,.bz-cards>*,.bz-fcgrid>*,.bz-mitems>*,.bz-calg>*,.bz-gcards>*,.bz-chkg>*,.bz-exp>*,.bz-flow li,.bz-dns>*,.bz-kpis>*,.bz-scen>*,.bz-pairs>*,.bz-cng>*,.bz-fxg>*,.bz-wires>*,.bz-fomcg>*,.bz-howg>*,.bz-gloss>*,.bz-day>*,.ab,.rh,.pt,.ph,.cv-main>*,.bz-mi dl>*,.bz-basis li,.bz-iss li,.bz-adds li,.bz-rank>*,.bz-trk>*,.bz-hbg>*,.bz-hbqg>*,.bz-wsng>*,.bz-wplg>*,.bz-wscg>*,.bz-wsbar>*,.bz-wrks>*,.bz-wdog>*,.bz-wfx>*,.bz-grside>*,.bz-wkg>*,.bz-wben>*,.bz-wpicks>*,.bz-pxh2l>*,.bz-pxh2r>*,.bz-pxfc>*,.bz-pxtf>*,.bz-pxind>*,.bz-pxlad>*,.bz-pxsig li,.bz-anout>*,.bz-alg>*,.bz-alrec>*,.bz-evg>*,.bz-wisc>*,.bz-wipl>*,.bz-anread li,.bz-reclist li,.bz-hm tr,.bz-wiscore>*,.bz-wis';
  function prDims(br){
    var land = PR.orient === 'landscape', PW = land ? 297 : 210, PH = land ? 210 : 297, M = 8, bg = PR.theme === 'dark' ? '#0a0d14' : '#ffffff';
    /* Safari prints inside its own margins (and may add a header/footer), so its page boxes are kept well inside any printable A4 area */
    if(br === 'safari') return { land:land, PW:PW, PH:PH, M:0, CW:land ? 262 : 180, CH:land ? 158 : 238, bg:bg, safari:true };
    return { land:land, PW:PW, PH:PH, M:M, CW:PW - 2 * M, CH:PH - 2 * M, bg:bg };
  }
  function renderPages(say, done, fail, mode, br){
    /* a private off-screen copy of the document, so a preview refresh can never pull the page out from under the renderer */
    var old = document.getElementById('bzRenderFrame'); if(old) old.remove();
    var fr = document.createElement('iframe'); fr.id = 'bzRenderFrame'; fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + ((PR.orient === 'landscape' ? 1080 : 760) + 40) + 'px;height:1200px;border:0;visibility:visible;pointer-events:none;';
    var d, w, G = prDims(br), timer = null, finished = false;
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
    var ATOM = '.bz-sec,.bz-mi,.bz-day,svg,img,p,li,tr,dt,dd,h2,h3,h4,h5,h6,.pt,.ph,.rh,.bz-kpi,.bz-fcc,.bz-tile,.bz-dt,.bz-pill,.bz-card,.bz-pair,.bz-er,.bz-chkg>div,.bz-wires>div,.bz-fomcg>div,.bz-ev,.bz-gc,.bz-hw,.bz-sc,.bz-cons,.bz-leg,.bz-callout,.bz-chart,.bz-dn,.bz-rank>div,.bz-fxg>div,.bz-cng>div,.bz-gloss>div,.bz-flow li,.bz-rc>div,.bz-parts>div,.bz-wtop>div,.bz-sw,.bz-play>div,.bz-steps,.bz-scbar,.bz-trig li,.bz-gdp>div,.bz-rec3>div,.bz-cone>div,.bz-mtab,.ab,.cv-score,.cv-k>div,.bz-verdict,.bz-hero,.bz-pfh,.bz-wdn,.bz-rmeter,.bz-flowline,.bz-wk,.bz-hbc,.bz-hbqg>div,.bz-wsn,.bz-wpl2,.bz-wsc,.bz-wsr,.bz-wrk,.bz-wdog>div,.bz-wfx>div,.bz-wh2r,.bz-wsig,.bz-grnow,.bz-grk,.bz-grst,.bz-wtrail,.bz-whero,.bz-wmap,.bz-wben>div>div,.bz-wpicks>div,.bz-pxh2g,.bz-pxh2x,.bz-pxpath>div,.bz-pxplan>div,.bz-pxfc>div,.bz-pxtf>div,.bz-pxind>div,.bz-pxlad>div,.bz-pxsc>div,.bz-pxhero,.bz-pxseas,.bz-pxtabs,.bz-pxfib,.bz-pxsig li,.bz-trc,.bz-anout>div,.bz-al,.bz-alrec>div,.bz-evc,.bz-wisc>div,.bz-wipl>div,.bz-anhero,.bz-alhero,.bz-thhero,.bz-hm tr,.bz-wiscore,.bz-wis,.bz-wipre,.bz-tl';
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
        var pages = Array.prototype.slice.call(d.querySelectorAll('.pg')), plan = [], solid = PR.theme === 'dark' ? '#a78bfa' : '#4f46e5';
        /* print engines (Safari above all) draw soft radial "glow" blobs as solid shapes and gradient text as a coloured box:
           mark them so the print page can drop the blobs and use a solid colour for the text */
        Array.prototype.forEach.call(d.querySelectorAll('.doc *'), function(el){
          if(el.ownerSVGElement || el.tagName === 'svg') return;
          var cs = w.getComputedStyle(el), clip = cs.webkitBackgroundClip || cs.backgroundClip || '';
          if(clip === 'text'){ el.style.setProperty('background', 'none', 'important'); el.style.setProperty('-webkit-text-fill-color', 'currentColor', 'important'); el.style.setProperty('color', solid, 'important'); }
          var a = w.getComputedStyle(el, '::after'); if(a && a.content && a.content !== 'none' && /radial-gradient/.test(a.backgroundImage || '')) el.classList.add('nxa');
          var b = w.getComputedStyle(el, '::before'); if(b && b.content && b.content !== 'none' && /radial-gradient/.test(b.backgroundImage || '')) el.classList.add('nxb');
        });
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
      /* body must be a plain block: the page wrapper is a flex column on the site, and Safari ignores page breaks inside flex boxes (that made the pages drift) */
      var pageCss = G.safari
        ? '@page{size:A4 ' + PR.orient + ';margin:12mm;}.p{display:block;width:' + G.CW + 'mm;margin:0 auto;page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid;overflow:hidden;position:relative;background:' + G.bg + ';}'
        : '@page{size:A4 ' + PR.orient + ';margin:0;}.p{display:block;width:' + G.PW + 'mm;height:' + G.PH + 'mm;box-sizing:border-box;padding:' + G.M + 'mm;page-break-after:always;break-after:page;overflow:hidden;position:relative;background:' + G.bg + ';}';
      var html = '<!doctype html><html lang="' + (R.lang || 'th') + '" data-theme="' + (R.theme || 'light') + '"><head>' + head + '<style>' + pageCss + 'html,body{margin:0!important;padding:0!important;background:' + G.bg + '!important;}body{display:block!important;gap:0!important;}' +
        '.p:last-child{page-break-after:auto;break-after:auto;}.nxa::after,.nxb::before{display:none!important;}' +
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
    }, function(err){ if(window.console) console.error(err); prBusy(btn, false); say({ en:'Could not prepare the pages (' + String(err && err.message || err).slice(0, 60) + ') — reload and try again.', th:'จัดหน้าไม่สำเร็จ (' + String(err && err.message || err).slice(0, 60) + ') ลองโหลดหน้าใหม่แล้วกดอีกครั้ง' }); }, 'dom', prBr());
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
      var b = ev.target.closest('[data-pro],[data-prth],[data-prbr],[data-prprint],[data-prpdf]'); if(!b || !root.contains(b)) return;
      if(b.hasAttribute('data-pro')){ PR.orient = b.getAttribute('data-pro'); paint(); }
      else if(b.hasAttribute('data-prbr')){ PR.br = b.getAttribute('data-prbr'); try { localStorage.setItem('spz.brain.prbr', PR.br); } catch(e){} paint(); }
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
    h += '<h3 class="bz-h3 bz-mh">' + esc(T({ en:'8 · Data dictionary (economy series)', th:'8 · พจนานุกรมข้อมูล (ข้อมูลเศรษฐกิจ)' })) + '</h3><div class="bz-tw"><table class="bz-tbl big bz-dict"><thead><tr><th></th><th>FRED</th><th>' + esc(T({ en:'Latest', th:'ล่าสุด' })) + '</th><th>' + esc(T({ en:'Value', th:'ค่า' })) + '</th><th>' + esc(T({ en:'1 year ago', th:'1 ปีก่อน' })) + '</th><th>' + esc(T({ en:'Frequency', th:'ความถี่' })) + '</th></tr></thead><tbody>' +
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
  /* US release times are set in New York time; Thai time = +11 h in summer
     (EDT), +12 h in winter (EST). DST: 2nd Sunday of March → 1st Sunday of
     November. */
  function nyOffset(d){
    var y = +d.slice(0, 4), m = +d.slice(5, 7), dd = +d.slice(8, 10);
    var sunAfter = function(mon, nth){ var first = new Date(Date.UTC(y, mon - 1, 1)).getUTCDay(); return 1 + (7 - first) % 7 + (nth - 1) * 7; };
    var a = sunAfter(3, 2), b = sunAfter(11, 1);
    var on = (m > 3 && m < 11) || (m === 3 && dd >= a) || (m === 11 && dd < b);
    return on ? -4 : -5;
  }
  function thaiAt(d, hh, mm){ return new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), hh - nyOffset(d) + 7, mm || 0)); }
  function thaiStr(dt){
    var loc = L() === 'th' ? 'th-TH' : 'en-GB';
    return dt.toLocaleDateString(loc, { weekday:'short', day:'numeric', month:'short', year:'2-digit', timeZone:'UTC' }) + ' · ' + String(dt.getUTCHours()).padStart(2, '0') + ':' + String(dt.getUTCMinutes()).padStart(2, '0') + (L() === 'th' ? ' น.' : '');
  }
  function untilStr(dt){
    var ms = dt.getTime() - 7 * 3600e3 - Date.now(), dd = Math.floor(ms / 864e5), hh = Math.floor((ms % 864e5) / 3600e3);
    if(ms < 0) return T({ en:'released', th:'ประกาศแล้ว' });
    return dd > 0 ? T({ en:'in ' + dd + ' d ' + hh + ' h', th:'อีก ' + dd + ' วัน ' + hh + ' ชม.' }) : T({ en:'in ' + hh + ' h', th:'อีก ' + hh + ' ชม.' });
  }
  function nextRel(kind){ var ev = X('events'), L2 = ev && ev.next && ev.next[kind] || []; var today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); for(var i = 0; i < L2.length; i++) if(L2[i] >= today) return L2[i]; return null; }
  function releaseStrip(F){
    var rows = [], fr = fomcRows(F)[0];
    var add = function(k, kind, hh, mm, nextV, nextLab){
      var it = F.items[k]; if(!it) return; var d = nextRel(kind), pre = it.unit === '$' ? '$' : '', u = it.unit === '%' ? '%' : '', dt = d ? thaiAt(d, hh, mm) : null;
      rows.push('<button type="button" class="bz-rel" data-fcgo="' + k + '"><span class="n">' + esc(T(it.name)) + '</span>' +
        '<div class="v"><div><small>' + esc(T({ en:'Now', th:'ตอนนี้' })) + ' · ' + esc(mshort(it.t)) + '</small><b>' + pre + f(it.now, it.dec) + u + '</b></div><i>→</i><div><small>' + esc(T(nextLab)) + '</small><b class="fc">' + pre + f(nextV, it.dec) + u + '</b></div></div>' +
        (dt ? '<div class="d">' + ico('cal') + '<span>' + esc(T({ en:'Announced ', th:'ประกาศ ' }) + thaiStr(dt)) + (L() === 'th' ? '' : ' (Thai time)') + '</span><em>' + esc(untilStr(dt)) + '</em></div>' : '<div class="d">' + ico('trend') + '<span>' + esc(T({ en:'Trades every day — no release date', th:'ซื้อขายทุกวัน ไม่มีวันประกาศ' })) + '</span></div>') + '</button>');
    };
    if(F.items.ff && fr) add('ff', 'fomc', 14, 0, fr.rate, { en:'Our call at the next meeting', th:'เราคาดในการประชุมหน้า' });
    var p1 = function(k){ var it = F.items[k]; return it ? pathAt(it, 1)[0] : null; };
    add('core', 'pce', 8, 30, p1('core'), { en:'Expected next print', th:'คาดตัวเลขครั้งหน้า' });
    add('cpi', 'cpi', 8, 30, p1('cpi'), { en:'Expected next print', th:'คาดตัวเลขครั้งหน้า' });
    add('un', 'jobs', 8, 30, p1('un'), { en:'Expected next print', th:'คาดตัวเลขครั้งหน้า' });
    ['y10', 'y2', 'oil', 'spx'].forEach(function(k){ var c = fcAt(F.items[k], 6); add(k, '-', 0, 0, c && c.v, { en:'In 6 months', th:'อีก 6 เดือน' }); });
    return '<div class="bz-sec bz-relw"><h4>' + ico('cal') + esc(T({ en:'Now → what we expect next, and when it is announced (Thai time)', th:'ตอนนี้ → เราคาดว่าจะเป็นเท่าไร และประกาศเมื่อไร (เวลาไทย)' })) + '</h4><div class="bz-relg">' + rows.join('') + '</div>' +
      note({ en:'Click a card to jump to its chart. US data come out at 8:30 New York time (19:30 or 20:30 in Thailand); the Fed decision at 14:00 New York time (01:00 or 02:00 the next day in Thailand). “Expected next print” = our forecast path one month ahead.', th:'กดการ์ดเพื่อเลื่อนไปที่กราฟของตัวนั้น ตัวเลขเศรษฐกิจสหรัฐฯ ประกาศ 8:30 น. เวลานิวยอร์ก (19:30 หรือ 20:30 น. เวลาไทย) ผลประชุมเฟดประกาศ 14:00 น. เวลานิวยอร์ก (ตี 1 หรือตี 2 ของวันถัดไปตามเวลาไทย) “คาดตัวเลขครั้งหน้า” = เส้นทางคาดการณ์ของเราล่วงหน้า 1 เดือน' }) + '</div>';
  }
  function fomcRows(F){
    var it = F.items.ff; if(!it) return [];
    var prev = it.now, out = [], ev = X('events'), cal = ev && ev.next && ev.next.fomc && ev.next.fomc.length ? ev.next.fomc.map(function(d){ return [d, d > '2026-12-31' ? 1 : 0]; }) : FOMC;
    cal.forEach(function(m){
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
    var it = F.items.ff, r0 = rows[0], t0 = thaiAt(r0.d, 14, 0), lab0 = r0.dir > 0 ? { en:'a hike', th:'ขึ้นดอกเบี้ย' } : r0.dir < 0 ? { en:'a cut', th:'ลดดอกเบี้ย' } : { en:'no change', th:'คงดอกเบี้ย' };
    var top = '<div class="bz-fomct"><div><small>' + esc(T({ en:'Fed rate now', th:'ดอกเบี้ยเฟดตอนนี้' })) + '</small><b>' + f(it.now, 2) + '%</b><em>' + esc(mshort(it.t)) + '</em></div><i>→</i><div><small>' + esc(T({ en:'Next meeting — our call', th:'ประชุมครั้งหน้า — เราคาด' })) + '</small><b class="fc">' + f(r0.rate, 2) + '%</b><em>' + esc(T(lab0)) + ' · ' + esc(T({ en:'odds of a 0.25 move ', th:'โอกาสขยับ 0.25 ' })) + f(r0.prob, 0) + '%</em></div><div class="when">' + ico('cal') + '<span>' + esc(T({ en:'Decision ', th:'ประกาศผล ' }) + thaiStr(t0)) + (L() === 'th' ? ' (เวลาไทย)' : ' (Thai time)') + '</span><em>' + esc(untilStr(t0)) + '</em></div></div>';
    return '<div class="bz-sec bz-fomc"><h4>' + ico('bank') + esc(T({ en:'Fed meeting by meeting (what the market is pricing)', th:'ดอกเบี้ยเฟดรายการประชุม (ตลาดกำลังคาดอะไร)' })) + '</h4>' + top + '<div class="bz-fomcg">' + rows.map(function(r){
      var dd = new Date(tms(r.d)).toLocaleDateString(loc, { day:'numeric', month:'short', year:'2-digit', timeZone:'UTC' });
      var lab = r.dir > 0 ? { en:'hike', th:'ขึ้น' } : r.dir < 0 ? { en:'cut', th:'ลด' } : { en:'hold', th:'คง' };
      var tt = thaiAt(r.d, 14, 0);
      return '<div data-fcgo="ff" class="' + (r.dir > 0 ? 'up' : r.dir < 0 ? 'dn' : 'fl') + '" title="' + esc(T({ en:'Decision ', th:'ประกาศผล ' }) + thaiStr(tt)) + '"><span>' + esc(dd) + (r.est ? ' *' : '') + '</span><small class="tt">' + esc(T({ en:'Thai ', th:'ไทย ' }) + String(tt.getUTCHours()).padStart(2, '0') + ':00 ' + tt.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', timeZone:'UTC' })) + '</small><b>' + f(r.rate, 2) + '%</b><em class="dec">' + esc(T(lab)) + '</em><i><u style="width:' + f(r.prob, 0) + '%"></u></i><small>' + esc(T({ en:'odds of a 0.25 move ', th:'โอกาสขยับ 0.25 ' })) + f(r.prob, 0) + '% · ' + esc(T({ en:'vs today ', th:'เทียบวันนี้ ' })) + sg(r.cum, 2) + '</small></div>';
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

  /* ============================================ EXTRA SCREENS (2026-10-26)
     Built on data/brain_ext.json (scripts/fetch_brain_ext.py):
       track   -- the forecast rules re-run on past data, scored vs reality
       analog  -- the past months that looked most like today, and what followed
       alert   -- warning rules over 50 years + how close each is now
       liq     -- Fed liquidity (balance sheet − Treasury account − reverse repo)
       thai    -- Bank of Thailand rate, Thai CPI, the baht, IMF outlook
       whatif  -- move the inputs, watch the score / forecasts / portfolio react
     plus a 24-month colour map on the Summary tab and event-day statistics on
     "This week". Forecast ranges are widened (or narrowed) by how accurate
     each model has actually been -- calibrate() below. */
  IC.history = '<path d="M3.5 12a8.5 8.5 0 102.5-6"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/>';
  IC.flag = '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>';
  IC.drop = '<path d="M12 3c3 4 6 7.2 6 10.5a6 6 0 01-12 0C6 10.2 9 7 12 3z"/><path d="M9.5 14a2.5 2.5 0 002.5 2.5"/>';
  IC.target = '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>';
  IC.sliders = '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>';
  IC.grid = '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>';

  function X(k){ return D.x && D.x[k] || null; }
  function noExt(){ return '<div class="bz-callout mid">' + ico('history') + '<div><b>' + esc(T({ en:'The long-history file is not ready yet', th:'ไฟล์ข้อมูลย้อนหลังยังไม่พร้อม' })) + '</b><p>' + esc(T({ en:'data/brain_ext.json is rebuilt twice a day. If this is the first run it may still be in progress — try Refresh in a few minutes.', th:'ไฟล์ data/brain_ext.json สร้างใหม่วันละ 2 ครั้ง ถ้าเป็นรอบแรกอาจยังสร้างไม่เสร็จ ลองกดโหลดใหม่อีกครั้งในอีกสักครู่' })) + '</p></div></div>'; }
  function mon(k){ if(!k) return '—'; var d = new Date(tms(k.length === 7 ? k + '-01' : k)); return d.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { month:'short', year:'numeric', timeZone:'UTC' }); }
  function fmtU(v, unit, dec){ if(!isNum(v)) return '—'; dec = dec == null ? 2 : dec; return unit === '$' ? '$' + f(v, dec) : unit === '%' ? f(v, dec) + '%' : unit === 'pt' ? sg(v, dec) : f(v, dec); }
  function bar(p, cls){ return '<i class="bz-xbar ' + (cls || '') + '"><u style="width:' + clamp(p, 0, 100).toFixed(0) + '%"></u></i>'; }

  /* -------------------------------------------- calibrate forecast ranges */
  function calibrate(F){
    var tr = X('track'); if(!F || !tr) return F;
    tr.models.forEach(function(m){
      var it = F.items[m.k]; if(!it || !it.fc || it.__cal) return;
      var used = [];
      it.fc.forEach(function(q){
        var h = m.h[String(q.m)]; if(!h) return;
        var c = clamp(h.cal || 1, 0.6, 3.5), shift = isNum(h.bias) ? -0.5 * h.bias : 0;
        ['lo', 'hi', 'lo2', 'hi2'].forEach(function(k){ if(isNum(q[k])) q[k] = q.v + (q[k] - q.v) * c; });
        q.v += shift; ['lo', 'hi', 'lo2', 'hi2'].forEach(function(k){ if(isNum(q[k])) q[k] += shift; });
        used.push(q.m + 'M ×' + f(c, 2));
      });
      it.__cal = true;
      if(used.length && it.basis) it.basis = it.basis.concat([{ en:'Calibrated on its own track record (2012→): ranges scaled ' + used.join(', ') + ' so ~68% of past outcomes would have landed inside; centre nudged by half its average past miss.', th:'ปรับตามความแม่นของตัวเองย้อนหลัง (ตั้งแต่ 2012): ขยาย/หดช่วงคาดการณ์ ' + used.join(', ') + ' ให้ผลจริงในอดีตราว 68% ตกอยู่ในช่วง และขยับค่ากลางครึ่งหนึ่งของความคลาดเคลื่อนเฉลี่ยในอดีต' }]);
    });
    return F;
  }

  /* ================================================================ TRACK */
  function grade(h){
    if(!h) return ['—', 'mid'];
    var r = h.mae / (h.mae0 || 1);
    return r < 0.8 ? ['A', 'good'] : r < 0.92 ? ['B', 'good'] : r < 1.03 ? ['C', 'mid'] : ['D', 'bad'];
  }
  function vTrack(){
    var tr = X('track'); if(!tr) return noExt();
    var M = tr.models, h6 = M.map(function(m){ return m.h['6']; }).filter(Boolean);
    var wins = h6.filter(function(h){ return h.mae < h.mae0; }).length;
    var avgDir = mean(h6.map(function(h){ return h.dir; }));
    var h = '<div class="bz-callout ' + (wins >= h6.length / 2 ? 'good' : 'mid') + '">' + ico('target') + '<div><b>' + esc(T({ en:'Over 6 months, ' + wins + ' of ' + h6.length + ' forecast models beat the “nothing changes” guess; they called the direction right ' + f(avgDir, 0) + '% of the time.', th:'ในกรอบ 6 เดือน โมเดลคาดการณ์ ' + wins + ' จาก ' + h6.length + ' ตัว แม่นกว่าการเดาว่า “ไม่เปลี่ยน” และทายทิศทางถูก ' + f(avgDir, 0) + '% ของครั้ง' })) + '</b>' +
      '<p>' + esc(T({ en:'Every month since ' + mon(tr.from) + ' the same rules the Forecast tab uses were re-run on the data that was public at the time, then checked against what really happened 3, 6 and 12 months later. ' + (wins < h6.length ? 'Models that do not beat the simple guess are flagged — lean on them less.' : ''), th:'ทุกเดือนตั้งแต่ ' + mon(tr.from) + ' ระบบนำกฎชุดเดียวกับหน้าพยากรณ์มารันใหม่บนข้อมูลที่มี ณ เวลานั้น แล้วเทียบกับสิ่งที่เกิดขึ้นจริงอีก 3, 6 และ 12 เดือนต่อมา ' + (wins < h6.length ? 'โมเดลที่ยังแพ้การเดาง่ายๆ จะถูกติดป้ายไว้ ให้เชื่อน้อยลง' : '') })) + '</p></div></div>';
    var VERD = { A:{ en:'Trust it fairly well', th:'เชื่อได้ค่อนข้างดี' }, B:{ en:'Useful — allow for misses', th:'ใช้ได้ แต่เผื่อพลาด' }, C:{ en:'About as good as guessing — rough guide only', th:'พอๆ กับเดา ใช้ดูคร่าวๆ' }, D:{ en:'Worse than guessing — do not rely on it', th:'แย่กว่าเดา อย่าเพิ่งเชื่อ' } };
    h += '<div class="bz-trhow"><div class="bz-trhowh">' + ico('book') + '<div><b>' + esc(T({ en:'How to read the grades — and how far to trust them', th:'อ่านเกรดอย่างไร และเชื่อได้แค่ไหน' })) + '</b><span>' + esc(T({ en:'A grade does NOT mean “very accurate”. It means: better or worse than the simplest guess, “the number stays where it is today”. Forecasting the economy is hard, so beating that guess by 20% is already good.', th:'เกรดไม่ได้แปลว่า “แม่นมาก” แต่แปลว่า แม่นกว่าหรือแย่กว่าการเดาง่ายที่สุด คือ “ตัวเลขจะอยู่ที่เดิมเหมือนวันนี้” การทายเศรษฐกิจยากมาก แค่ชนะการเดาแบบนี้ได้ 20% ก็ถือว่าดีแล้ว' })) + '</span></div></div>' +
      '<div class="bz-trhowg">' + ['A', 'B', 'C', 'D'].map(function(gk){ var c = gk === 'D' ? 'bad' : gk === 'C' ? 'mid' : 'good', n = M.filter(function(m){ return grade(m.h['6'])[0] === gk; }).map(function(m){ return T(m.name); }); return '<div class="' + c + '"><span class="bz-grade ' + c + '">' + gk + '</span><div><b>' + esc(T(VERD[gk])) + '</b><small>' + esc(T(gk === 'A' ? { en:'misses ≥20% smaller than the guess', th:'พลาดน้อยกว่าการเดา ≥20%' } : gk === 'B' ? { en:'8–20% smaller', th:'พลาดน้อยกว่า 8–20%' } : gk === 'C' ? { en:'about the same as the guess', th:'พอๆ กับการเดา' } : { en:'bigger misses than the guess', th:'พลาดมากกว่าการเดา' })) + '</small><em>' + esc(n.length ? n.join(' · ') : '—') + '</em></div></div>'; }).join('') + '</div>' +
      '<ul class="bz-basis"><li>' + esc(T({ en:'Even an A model beats the guess in only about half of individual months — the edge shows up on average, not every time.', th:'แม้โมเดลเกรด A ก็ชนะการเดาแค่ราวครึ่งหนึ่งของแต่ละเดือน ความได้เปรียบเห็นได้ “โดยเฉลี่ย” ไม่ใช่ทุกครั้ง' })) + '</li><li>' + esc(T({ en:'Tested on today\'s revised data and the ranges were tuned on the same history, so live accuracy is a little lower than shown.', th:'ทดสอบบนข้อมูลที่ถูกแก้ไขแล้ว และปรับช่วงคาดการณ์ด้วยประวัติชุดเดียวกัน ความแม่นจริงตอนใช้งานจึงต่ำกว่าที่แสดงเล็กน้อย' })) + '</li><li>' + esc(T({ en:'Use the forecasts for direction and range, not for an exact number.', th:'ใช้คาดการณ์ดูทิศทางและกรอบ ไม่ใช่ตัวเลขเป๊ะๆ' })) + '</li></ul></div>';
    h += '<div class="bz-trk">' + M.map(function(m){
      var x = m.h['6'], g = grade(x), imp = x ? (1 - x.mae / x.mae0) * 100 : null, itL = F_last && F_last.items && F_last.items[m.k], fc6 = itL && fcAt(itL, 6), pre = m.unit === '$' ? '$' : '', uu = m.unit === '%' ? '%' : '';
      return '<div class="bz-trc ' + g[1] + '"><div class="bz-trh"><b>' + esc(T(m.name)) + '</b><span class="bz-grade ' + g[1] + '">' + g[0] + '</span></div>' +
        '<p class="bz-trv ' + g[1] + '">' + esc(T(VERD[g[0]] || { en:'', th:'' })) + '</p>' +
        (itL ? '<div class="bz-trnow"><div><small>' + esc(T({ en:'Now', th:'ตอนนี้' })) + ' · ' + esc(mshort(itL.t)) + '</small><b>' + pre + f(itL.now, m.dec) + uu + '</b></div><i>→</i><div><small>' + esc(T({ en:'Forecast 6M', th:'คาด 6 เดือน' })) + '</small><b class="fc">' + pre + f(fc6 && fc6.v, m.dec) + uu + '</b></div><div><small>' + esc(T({ en:'usually off by', th:'มักพลาดราว' })) + '</small><b class="mi">±' + fmtU(x && x.mae, '', m.dec) + '</b></div></div>' : '') +
        '<div class="bz-trn"><div><span>' + esc(T({ en:'Better than “no change”', th:'แม่นกว่าเดาว่าไม่เปลี่ยน' })) + '</span><b class="' + (imp > 0 ? 'up' : 'dn') + '">' + spc(imp, 0) + '</b></div><div><span>' + esc(T({ en:'Direction right', th:'ทายทิศถูก' })) + '</span><b>' + pc(x && x.dir, 0) + '</b></div></div>' +
        '<div class="bz-trl"><span>' + esc(T({ en:'Typical miss', th:'คลาดเคลื่อนเฉลี่ย' })) + '</span><b>' + fmtU(x && x.mae, m.unit === '$' ? '$' : '', m.dec) + (m.unit === '%' ? ' pt' : '') + '</b><em>' + esc(T({ en:'vs ', th:'เทียบ ' })) + fmtU(x && x.mae0, m.unit === '$' ? '$' : '', m.dec) + '</em></div>' +
        '<div class="bz-trl"><span>' + esc(T({ en:'Inside the 68% range', th:'ตกในช่วง 68%' })) + '</span>' + bar(x && x.cov, (x && Math.abs(x.cov - 68) < 12) ? 'ok' : 'warn') + '<b>' + pc(x && x.cov, 0) + '</b></div>' +
        '<p>' + esc(T(x && x.cal > 1.15 ? { en:'Ranges were too narrow — the board now widens them ×' + f(x.cal, 2) + '.', th:'ช่วงคาดการณ์เคยแคบเกินไป ตอนนี้ระบบขยายให้ ×' + f(x.cal, 2) + ' แล้ว' } : x && x.cal < 0.87 ? { en:'Ranges were wider than needed — now tightened ×' + f(x.cal, 2) + '.', th:'ช่วงคาดการณ์เคยกว้างเกินจำเป็น ตอนนี้ระบบหดให้ ×' + f(x.cal, 2) + ' แล้ว' } : { en:'Ranges were about right.', th:'ช่วงคาดการณ์กว้างพอดีแล้ว' })) + '</p></div>';
    }).join('') + '</div>';
    /* table: every model x horizon */
    var rows = '';
    M.forEach(function(m){ ['3', '6', '12'].forEach(function(k, i){ var x = m.h[k]; if(!x) return; var imp = (1 - x.mae / x.mae0) * 100, g = grade(x);
      rows += '<tr' + (i === 0 ? ' class="first"' : '') + '><td>' + (i === 0 ? '<b>' + esc(T(m.name)) + '</b>' : '') + '</td><td>' + k + esc(T({ en:'M', th:' ด.' })) + '</td><td>' + fmtU(x.mae, m.unit === '$' ? '$' : '', m.dec) + '</td><td>' + fmtU(x.mae0, m.unit === '$' ? '$' : '', m.dec) + '</td><td class="' + (imp > 0 ? 'up' : 'dn') + '">' + spc(imp, 0) + '</td><td>' + pc(x.beat, 0) + '</td><td>' + pc(x.dir, 0) + '</td><td>' + pc(x.cov, 0) + '</td><td>×' + f(x.cal, 2) + '</td><td><span class="bz-grade sm ' + g[1] + '">' + g[0] + '</span></td></tr>'; }); });
    h += sec({ en:'Scorecard — every model, every horizon', th:'สมุดพกความแม่น — ทุกโมเดล ทุกกรอบเวลา' }, '<div class="bz-tw"><table class="bz-tbl big bz-trt"><thead><tr><th></th><th>' + esc(T({ en:'Ahead', th:'ล่วงหน้า' })) + '</th><th>' + esc(T({ en:'Avg miss', th:'พลาดเฉลี่ย' })) + '</th><th>' + esc(T({ en:'“No change” miss', th:'เดาไม่เปลี่ยน พลาด' })) + '</th><th>' + esc(T({ en:'Better by', th:'ดีกว่า' })) + '</th><th>' + esc(T({ en:'Months won', th:'เดือนที่ชนะ' })) + '</th><th>' + esc(T({ en:'Direction', th:'ทิศถูก' })) + '</th><th>' + esc(T({ en:'In 68% range', th:'ในช่วง 68%' })) + '</th><th>' + esc(T({ en:'Range fix', th:'ปรับช่วง' })) + '</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      note({ en:'“Avg miss” = mean absolute error. “No change” = assume the number stays where it was — the honest bar to beat. Grades: A ≥20% better, B 8–20%, C about the same, D worse. Tested on today\'s (revised) data, so real-time accuracy was a little lower.', th:'“พลาดเฉลี่ย” = ความคลาดเคลื่อนสัมบูรณ์เฉลี่ย “เดาไม่เปลี่ยน” = สมมติว่าตัวเลขอยู่ที่เดิม ซึ่งเป็นมาตรฐานที่ต้องชนะให้ได้ เกรด: A ดีกว่า ≥20% · B 8–20% · C พอๆ กัน · D แย่กว่า ทดสอบบนข้อมูลฉบับปรับปรุงล่าสุด ความแม่นจริงในเวลานั้นจึงอาจต่ำกว่านี้เล็กน้อย' }), 'grid', 'bz-sumt');
    /* charts: actual vs the forecast made 6 months before */
    var COLS = { core:'#f472b6', cpi:'#fb7185', ff:'#fbbf24', y10:'#a78bfa', y2:'#22d3ee', un:'#34d399', oil:'#f97316' };
    function trChart(m){
      if(!m) return '';
      var x = m.h['6']; if(!x) return '';
      var act = [], fc = [], itL = F_last && F_last.items && F_last.items[m.k], pre = m.unit === '$' ? '$' : '', uu = m.unit === '%' ? '%' : '';
      x.pts.forEach(function(p){ if(isNum(p[6])) act.push([p[1], p[6]]); fc.push([p[1], p[3]]); });
      if(itL && itL.hist){ var lastA = act.length ? act[act.length - 1][0] : ''; itL.hist.forEach(function(p){ if(p[0].slice(0, 7) > lastA) act.push([p[0], p[1]]); }); }
      var f6 = itL && fcAt(itL, 6), f12 = itL && fcAt(itL, 12);
      return '<div class="bz-sec"><h4>' + ico('target') + esc(T(m.name)) + '<span class="bz-fq">' + esc(T({ en:'miss ', th:'พลาด ' })) + fmtU(x.mae, m.unit === '$' ? '$' : '', m.dec) + ' · ' + esc(T({ en:'last 2y ', th:'2 ปีหลัง ' })) + fmtU(x.mae_recent, m.unit === '$' ? '$' : '', m.dec) + '</span></h4>' +
        (itL ? '<div class="bz-trnow wide"><div><small>' + esc(T({ en:'Now', th:'ตอนนี้' })) + ' · ' + esc(mshort(itL.t)) + '</small><b>' + pre + f(itL.now, m.dec) + uu + '</b></div><i>→</i><div><small>' + esc(T({ en:'in 6 months', th:'อีก 6 เดือน' })) + '</small><b class="fc">' + pre + f(f6 && f6.v, m.dec) + uu + '</b><em>' + pre + f(f6 && f6.lo, m.dec) + '–' + f(f6 && f6.hi, m.dec) + uu + '</em></div><i>→</i><div><small>' + esc(T({ en:'in 12 months', th:'อีก 12 เดือน' })) + '</small><b class="fc">' + pre + f(f12 && f12.v, m.dec) + uu + '</b><em>' + pre + f(f12 && f12.lo, m.dec) + '–' + f(f12 && f12.hi, m.dec) + uu + '</em></div></div>' : '') +
        lineChart({ series:[{ name:{ en:'What happened', th:'เกิดขึ้นจริง' }, pts:act, color:COLS[m.k], w:2.4, fc:itL && itL.fc && act.length ? itL.fc : null }, { name:{ en:'Forecast made 6 months earlier', th:'ที่ทายไว้ล่วงหน้า 6 เดือน' }, pts:fc, color:'#94a3b8', dash:'5 4', w:1.8 }], unit:m.unit === '%' ? '%' : '', dec:m.dec, h:250, legend:true, sim:m.k !== 'ff' }) + '</div>';
    }
    h += '<h3 class="bz-h3">' + ico('target') + esc(T({ en:'Forecast vs reality, month by month', th:'คาดการณ์เทียบของจริง รายเดือน' })) + '</h3>';
    var byK = {}; M.forEach(function(m){ byK[m.k] = m; });
    h += note({ en:'Solid line = what happened, ending with today\'s value. Grey dashes = what the model said 6 months before each date. The shaded fan on the right = today\'s live forecast (dark = 68% likely, light = 95%).', th:'เส้นทึบ = เกิดขึ้นจริง จนถึงค่าล่าสุดวันนี้ เส้นประเทา = ที่โมเดลทายไว้ 6 เดือนก่อนหน้าแต่ละจุด พัดสีด้านขวา = คาดการณ์ล่าสุดของวันนี้ (เข้ม = โอกาส 68% จาง = 95%)' });
    h += '<div class="bz-two">' + trChart(byK.core) + trChart(byK.cpi) + '</div><div class="bz-two">' + trChart(byK.ff) + trChart(byK.y2) + '</div><div class="bz-two">' + trChart(byK.y10) + trChart(byK.un) + '</div><div class="bz-two">' + trChart(byK.oil) + '<div></div></div>';
    /* recession model */
    var R = tr.rec, rc = (X('alerts') || {}).recessions || (D.b && D.b.recessions) || [];
    if(R){
      var fa = R.alarms.filter(function(a){ return !a.hit && !a.open; }).length, op = R.alarms.filter(function(a){ return a.open; }).length;
      h += '<div class="bz-row"><div class="bz-sec s8"><h4>' + ico('alert') + esc(T({ en:'Recession model since 1983 (NY Fed yield-curve probit)', th:'โมเดลถดถอยตั้งแต่ปี 1983 (โมเดลเส้นยีลด์ของเฟดนิวยอร์ก)' })) + '</h4>' +
        lineChart({ series:[{ name:{ en:'Recession odds 12m ahead', th:'โอกาสถดถอยใน 12 เดือน' }, pts:R.probs, color:'#fb7185', area:true }], unit:'%', dec:0, rec:rc, ref:[{ v:30, label:{ en:'30% alarm', th:'เตือน 30%' } }], h:240 }) + '</div>' +
        '<div class="bz-sec s4"><h4>' + ico('check') + esc(T({ en:'Its record', th:'ผลงานที่ผ่านมา' })) + '</h4><ul class="bz-reclist">' + R.calls.map(function(c){ return '<li class="' + (c.lead != null ? 'good' : 'bad') + '"><b>' + esc(T({ en:'Recession ', th:'ถดถอย ' })) + mon(c.start) + '</b><span>' + esc(T(c.lead != null ? { en:'warned ' + c.lead + ' months ahead', th:'เตือนล่วงหน้า ' + c.lead + ' เดือน' } : { en:'missed', th:'ไม่ได้เตือน' })) + '</span></li>'; }).join('') +
        '<li class="' + (fa ? 'mid' : 'good') + '"><b>' + esc(T({ en:'False alarms', th:'เตือนแล้วไม่เกิด' })) + '</b><span>' + fa + (op ? esc(T({ en:' (+' + op + ' still open)', th:' (+' + op + ' ยังรอดูผล)' })) : '') + '</span></li></ul>' +
        note({ en:'An alarm = odds above 30%. It caught every recession since 1983, 9–17 months early, but the 2022–24 inversion has not (yet) been followed by one — no single model is enough on its own.', th:'สัญญาณเตือน = โอกาสเกิน 30% จับได้ทุกครั้งที่ถดถอยตั้งแต่ปี 1983 ล่วงหน้า 9–17 เดือน แต่ช่วงกลับหัวปี 2022–24 ยังไม่ตามมาด้วยภาวะถดถอย จึงไม่ควรเชื่อโมเดลเดียว' }) + '</div></div>';
    }
    if(tr.spx && tr.spx.n){
      h += '<div class="bz-callout ' + (Math.abs(tr.spx.cov1 - 68) < 10 ? 'good' : 'mid') + '">' + ico('bolt') + '<div><b>' + esc(T({ en:'S&P 500 range from VIX: the real 6-month move landed inside the ±1 range ' + f(tr.spx.cov1, 0) + '% of the time (ideal 68%) and inside ±2 ' + f(tr.spx.cov2, 0) + '% (ideal 95%).', th:'กรอบ S&P 500 จาก VIX: การขยับจริงใน 6 เดือนอยู่ในช่วง ±1 เท่า ' + f(tr.spx.cov1, 0) + '% ของครั้ง (ควรเป็น 68%) และในช่วง ±2 เท่า ' + f(tr.spx.cov2, 0) + '% (ควรเป็น 95%)' })) + '</b><p>' + esc(T(tr.spx.cov1 > 78 ? { en:'VIX usually over-prices fear: the options market\'s range is wider than what actually happens. Treat the outer band as a worst case, not a forecast.', th:'VIX มักตั้งราคาความกลัวสูงเกินจริง ช่วงที่ตลาดออปชันคาดจึงกว้างกว่าที่เกิดขึ้นจริง ให้มองแถบนอกเป็นกรณีเลวร้าย ไม่ใช่ค่าคาดการณ์' } : { en:'The options market has been a fair judge of the range.', th:'ตลาดออปชันประเมินช่วงการแกว่งได้ค่อนข้างตรง' })) + ' (' + tr.spx.n + ' ' + esc(T({ en:'months tested', th:'เดือนที่ทดสอบ' })) + ')</p></div></div>';
    }
    return h;
  }

  /* =============================================================== ANALOG */
  var AN_COL = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#fb7185'];
  function vAnalog(){
    var A = X('analog'); if(!A) return noExt();
    var ms = A.matches, av = A.avg, bs = A.base;
    var read = [];
    if(isNum(av.spx12) && isNum(bs.spx12)) read.push(av.spx12 < bs.spx12 - 3 ? { en:'Stocks did worse than usual after look-alike months (' + spc(av.spx12, 1) + ' vs a normal ' + spc(bs.spx12, 1) + ').', th:'หลังช่วงที่คล้ายตอนนี้ หุ้นทำได้แย่กว่าปกติ (' + spc(av.spx12, 1) + ' เทียบปกติ ' + spc(bs.spx12, 1) + ')' } : av.spx12 > bs.spx12 + 3 ? { en:'Stocks did better than usual after look-alike months (' + spc(av.spx12, 1) + ' vs ' + spc(bs.spx12, 1) + ').', th:'หลังช่วงที่คล้ายตอนนี้ หุ้นทำได้ดีกว่าปกติ (' + spc(av.spx12, 1) + ' เทียบปกติ ' + spc(bs.spx12, 1) + ')' } : { en:'Stocks did about as well as usual after look-alike months (' + spc(av.spx12, 1) + ').', th:'หลังช่วงที่คล้ายตอนนี้ หุ้นทำได้ใกล้เคียงปกติ (' + spc(av.spx12, 1) + ')' });
    if(isNum(av.rec12)) read.push(av.rec12 > bs.rec12 + 10 ? { en:'A recession followed within a year ' + f(av.rec12, 0) + '% of the time — about ' + f(av.rec12 / Math.max(1, bs.rec12), 1) + '× the normal rate.', th:'ภายใน 1 ปีเกิดภาวะถดถอย ' + f(av.rec12, 0) + '% ของครั้ง ราว ' + f(av.rec12 / Math.max(1, bs.rec12), 1) + ' เท่าของปกติ' } : { en:'Recessions within a year: ' + f(av.rec12, 0) + '% (normal ' + f(bs.rec12, 0) + '%).', th:'ภาวะถดถอยภายใน 1 ปี: ' + f(av.rec12, 0) + '% (ปกติ ' + f(bs.rec12, 0) + '%)' });
    if(isNum(av.bond12) && isNum(av.spx12)) read.push(av.bond12 > av.spx12 ? { en:'Bonds beat stocks over the next year in these episodes (' + spc(av.bond12, 1) + ').', th:'ในช่วงเหล่านี้ บอนด์ให้ผลตอบแทนดีกว่าหุ้นในปีถัดมา (' + spc(av.bond12, 1) + ')' } : { en:'Stocks beat bonds over the next year (bonds ' + spc(av.bond12, 1) + ').', th:'หุ้นชนะบอนด์ในปีถัดมา (บอนด์ ' + spc(av.bond12, 1) + ')' });
    if(isNum(av.ff12)) read.push({ en:'The Fed rate moved ' + sg(av.ff12, 2) + ' pt on average over the following year.', th:'ดอกเบี้ยเฟดขยับเฉลี่ย ' + sg(av.ff12, 2) + ' จุดในปีถัดมา' });
    var h = '<div class="bz-anhero"><div class="bz-anl"><span>' + esc(T({ en:'Today (' + mon(A.now) + ') looks most like', th:'วันนี้ (' + mon(A.now) + ') คล้ายกับช่วง' })) + '</span><div class="bz-anchips">' + ms.map(function(m, i){ return '<b style="--c:' + AN_COL[i] + '">' + esc(mon(m.t)) + '<em>' + f(m.sim, 1) + '%</em></b>'; }).join('') + '</div>' +
      '<p>' + esc(T({ en:'Searched ' + A.pool + ' months since ' + mon(A.since) + ' on 8 traits. “99%” = closer to today than 99% of all past months.', th:'ค้นจาก ' + A.pool + ' เดือนตั้งแต่ ' + mon(A.since) + ' ด้วยลักษณะ 8 ด้าน “99%” = ใกล้เคียงวันนี้มากกว่า 99% ของทุกเดือนในอดีต' })) + '</p></div>' +
      '<ul class="bz-anread">' + read.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul></div>';
    /* outcome cards */
    var oc = [
      ['spx12', { en:'S&P 500, next 12 months', th:'S&P 500 ใน 12 เดือน' }, '%', 1, 1], ['dd12', { en:'Worst dip within the year', th:'จุดต่ำสุดระหว่างปี' }, '%', 1, 1], ['bond12', { en:'10-year bonds, 12 months', th:'บอนด์ 10 ปี ใน 12 เดือน' }, '%', 1, 1],
      ['cash12', { en:'Cash (T-bills), a year', th:'เงินสด (ตั๋วเงินคลัง) 1 ปี' }, '%', 1, 0], ['rec12', { en:'Recession within a year', th:'ถดถอยภายใน 1 ปี' }, '%', 0, -1], ['un12', { en:'Unemployment change', th:'ว่างงานเปลี่ยน' }, 'pt', 2, -1],
      ['core12', { en:'Core inflation change', th:'เงินเฟ้อพื้นฐานเปลี่ยน' }, 'pt', 2, -1], ['ff12', { en:'Fed rate change', th:'ดอกเบี้ยเฟดเปลี่ยน' }, 'pt', 2, 0]
    ];
    h += '<div class="bz-anout">' + oc.map(function(o){
      var v = av[o[0]], b = bs[o[0]], d = isNum(v) && isNum(b) ? v - b : null, good = o[4] === 0 || !isNum(d) ? 'mid' : (d * o[4] > 0.5 ? 'good' : d * o[4] < -0.5 ? 'bad' : 'mid');
      var fm = function(x){ return o[2] === '%' ? (o[0] === 'rec12' || o[0] === 'cash12' ? f(x, o[3]) + '%' : spc(x, o[3])) : sg(x, o[3]); };
      return '<div class="' + good + '"><span>' + esc(T(o[1])) + '</span><b>' + fm(v) + '</b><em>' + esc(T({ en:'normal ', th:'ปกติ ' })) + fm(b) + '</em></div>';
    }).join('') + '</div>';
    /* path chart: S&P 500 after each look-alike, indexed to 100 */
    var t0 = new Date().toISOString().slice(0, 8) + '01', ser = ms.map(function(m, i){ return { name:{ en:mon(m.t), th:mon(m.t) }, pts:(m.out.path || []).map(function(v, j){ return isNum(v) ? [addM(t0, j), v] : null; }).filter(Boolean), color:AN_COL[i], w:1.6 }; });
    var avgPath = []; for(var j = 0; j <= 12; j++){ var vs = ms.map(function(m){ return m.out.path && m.out.path[j]; }).filter(isNum); if(vs.length) avgPath.push([addM(t0, j), mean(vs)]); }
    ser.push({ name:{ en:'Average', th:'ค่าเฉลี่ย' }, pts:avgPath, color:'#e2e8f0', w:3.2 });
    h += '<div class="bz-row"><div class="bz-sec s7"><h4>' + ico('trend') + esc(T({ en:'If history rhymes: the S&P 500 in the 12 months after each look-alike (start = 100)', th:'ถ้าประวัติศาสตร์ซ้ำรอย: S&P 500 ใน 12 เดือนหลังแต่ละช่วงที่คล้ายกัน (จุดเริ่ม = 100)' })) + '</h4>' + lineChart({ series:ser, dec:1, h:300, ref:[{ v:100, label:{ en:'start', th:'จุดเริ่ม' } }] }) + note({ en:'Drawn forward from this month so you can read it as a rough map of the next year. Price only, before dividends.', th:'วาดต่อจากเดือนนี้ไปข้างหน้า ใช้อ่านเป็นแผนที่คร่าวๆ ของปีหน้า คิดเฉพาะราคา ไม่รวมปันผล' }) + '</div>';
    /* traits table */
    h += '<div class="bz-sec s5"><h4>' + ico('grid') + esc(T({ en:'How alike? The 8 traits', th:'คล้ายแค่ไหน? ลักษณะ 8 ด้าน' })) + '</h4><div class="bz-tw"><table class="bz-tbl bz-antab"><thead><tr><th></th><th>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</th>' + ms.slice(0, 4).map(function(m, i){ return '<th style="color:' + AN_COL[i] + '">' + esc(mon(m.t)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      A.feats.map(function(ft){ return '<tr><td>' + esc(T(ft.name)) + '</td><td><b>' + fmtU(ft.now, ft.unit, ft.unit === '%' && ft.k === 'oil' ? 0 : 1) + '</b></td>' + ms.slice(0, 4).map(function(m){ var v = m.f[ft.k], z = Math.abs(v - ft.now) / (ft.sd || 1); return '<td class="' + (z < 0.25 ? 'near' : z > 0.8 ? 'far' : '') + '">' + fmtU(v, ft.unit, ft.k === 'oil' ? 0 : 1) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' + note({ en:'Green cells are very close to today, faded ones far apart. Traits are compared in standard units, so a 1-pt gap in inflation and a 1-pt gap in the Fed rate count fairly.', th:'ช่องสีเขียว = ใกล้วันนี้มาก ช่องจาง = ต่างกันมาก เทียบกันในหน่วยมาตรฐาน ความต่าง 1 จุดของเงินเฟ้อกับของดอกเบี้ยจึงนับอย่างยุติธรรม' }) + '</div></div>';
    /* per-analog outcomes */
    h += sec({ en:'What happened next, episode by episode', th:'หลังจากนั้นเกิดอะไรขึ้น ทีละช่วง' }, '<div class="bz-tw"><table class="bz-tbl big"><thead><tr><th></th><th>' + esc(T({ en:'Alike', th:'ความคล้าย' })) + '</th><th>S&P 6M</th><th>S&P 12M</th><th>' + esc(T({ en:'Worst dip', th:'ต่ำสุด' })) + '</th><th>' + esc(T({ en:'Bonds 12M', th:'บอนด์ 12M' })) + '</th><th>' + esc(T({ en:'Unemp.', th:'ว่างงาน' })) + '</th><th>' + esc(T({ en:'Fed', th:'เฟด' })) + '</th><th>' + esc(T({ en:'Recession', th:'ถดถอย' })) + '</th></tr></thead><tbody>' +
      ms.map(function(m, i){ var o = m.out; return '<tr><td><b style="color:' + AN_COL[i] + '">' + esc(mon(m.t)) + '</b></td><td>' + f(m.sim, 1) + '%</td><td class="' + (o.spx6 >= 0 ? 'up' : 'dn') + '">' + spc(o.spx6, 1) + '</td><td class="' + (o.spx12 >= 0 ? 'up' : 'dn') + '">' + spc(o.spx12, 1) + '</td><td class="dn">' + spc(o.dd12, 1) + '</td><td class="' + (o.bond12 >= 0 ? 'up' : 'dn') + '">' + spc(o.bond12, 1) + '</td><td>' + sg(o.un12, 1) + '</td><td>' + sg(o.ff12, 2) + '</td><td>' + (o.rec12 ? '<span class="bz-chip bad">' + esc(T({ en:'yes', th:'เกิด' })) + '</span>' : o.rec18 ? '<span class="bz-chip mid">' + esc(T({ en:'within 18m', th:'ใน 18 ด.' })) + '</span>' : '<span class="bz-chip good">' + esc(T({ en:'no', th:'ไม่' })) + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>', 'history', 'bz-sumt');
    /* similarity over time */
    var rc = (X('alerts') || {}).recessions || [];
    h += sec({ en:'How similar every past period is to today (higher = more alike)', th:'แต่ละช่วงในอดีตคล้ายวันนี้แค่ไหน (ยิ่งสูงยิ่งคล้าย)' }, lineChart({ series:[{ name:{ en:'Similarity', th:'ความคล้าย' }, pts:A.simline, color:'#a78bfa', area:true }], unit:'%', dec:0, rec:rc, h:200 }) + note({ en:'Grey columns are recessions. Peaks show the eras that rhyme with today; history never repeats exactly, so read it as odds, not a script.', th:'แถบเทาคือช่วงถดถอย ยอดของเส้นคือยุคที่คล้ายวันนี้ ประวัติศาสตร์ไม่ซ้ำเดิมเป๊ะ ให้อ่านเป็นโอกาส ไม่ใช่บทที่ต้องเกิด' }), 'history');
    return h;
  }

  /* ================================================================ ALERT */
  var AL_SHORT = { inv3m:{ en:'Curve 10y−3m inverts', th:'ยีลด์ 10ป−3ด กลับหัว' }, uninv3m:{ en:'Curve un-inverts', th:'ยีลด์กลับมาเป็นบวก' }, inv2y:{ en:'Curve 10y−2y inverts', th:'ยีลด์ 10ป−2ป กลับหัว' }, sahm:{ en:'Sahm rule ≥ 0.5', th:'Sahm ≥ 0.5' }, sahm3:{ en:'Sahm ≥ 0.3', th:'Sahm ≥ 0.3' }, claims:{ en:'Claims +20%', th:'ขอสวัสดิการ +20%' }, credit:{ en:'Credit spread jump', th:'ส่วนต่างหุ้นกู้กระโดด' }, hy:{ en:'Junk spread jump', th:'หุ้นกู้เสี่ยงกระโดด' }, hot:{ en:'Core inflation > 3%', th:'เงินเฟ้อพื้นฐาน > 3%' }, cool:{ en:'Core inflation < 3%', th:'เงินเฟ้อพื้นฐาน < 3%' }, cut1:{ en:'Fed first cut', th:'เฟดลดครั้งแรก' }, hike1:{ en:'Fed first hike', th:'เฟดขึ้นครั้งแรก' }, oil:{ en:'Oil +50% in a year', th:'น้ำมัน +50% ใน 1 ปี' }, nfci:{ en:'Tight financial conditions', th:'สภาพการเงินตึง' }, bear:{ en:'S&P −20% (bear)', th:'S&P −20% (ตลาดหมี)' } };
  function timelineSVG(A){
    var rules = A.rules, ev = A.events, W = 1000, LW = 190, top = 10, lane = 22, H = top + rules.length * lane + 26;
    var x0 = Date.UTC(1970, 0, 1), x1 = Date.now(), Xf = function(t){ return LW + (tms(t.length === 7 ? t + '-01' : t) - x0) / (x1 - x0) * (W - LW - 10); };
    var s = '';
    (A.recessions || []).forEach(function(r){ var a = Xf(r[0]), b = Xf(r[1]) + 3; s += '<rect class="bz-rec" x="' + a.toFixed(1) + '" y="' + top + '" width="' + Math.max(2, b - a).toFixed(1) + '" height="' + (rules.length * lane) + '"/>'; });
    for(var y = 1970; y <= new Date().getUTCFullYear(); y += 5){ var xx = Xf(y + '-01'); s += '<line class="bz-gl v" x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + top + '" y2="' + (top + rules.length * lane) + '"/><text class="bz-ax" x="' + xx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + y + '</text>'; }
    rules.forEach(function(r, i){
      var yy = top + i * lane + lane / 2;
      s += '<line class="bz-gl" x1="' + LW + '" x2="' + (W - 10) + '" y1="' + yy + '" y2="' + yy + '"/><text class="bz-tll' + (r.on ? ' on ' + r.tone : '') + '" x="' + (LW - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(T(AL_SHORT[r.k] || r.name)) + '</text>';
      ev.filter(function(e){ return e.k === r.k; }).forEach(function(e){ s += '<circle cx="' + Xf(e.t).toFixed(1) + '" cy="' + yy + '" r="5" class="bz-tld ' + e.tone + '"><title>' + esc(mon(e.t) + ' · ' + T(r.name) + (isNum(e.spx12) ? ' · S&P 12M ' + spc(e.spx12, 1) : '')) + '</title></circle>'; });
    });
    return '<svg class="bz-svg bz-tl" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>';
  }
  function vAlert(){
    var A = X('alerts'); if(!A) return noExt();
    var R = A.rules, on = R.filter(function(r){ return r.on; }), near = R.filter(function(r){ return !r.on && r.close >= 70; });
    var badOn = on.filter(function(r){ return r.tone === 'bad'; }), goodOn = on.filter(function(r){ return r.tone === 'good'; });
    var tone = badOn.length >= 3 ? 'bad' : badOn.length ? 'mid' : 'good';
    var h = '<div class="bz-alhero ' + tone + '"><div class="bz-alnum"><b>' + badOn.length + '</b><span>' + esc(T({ en:'warning lights on', th:'ไฟเตือนที่ติดอยู่' })) + '</span></div><div class="bz-alnum"><b>' + near.length + '</b><span>' + esc(T({ en:'getting close', th:'ใกล้จะติด' })) + '</span></div><div class="bz-alnum g"><b>' + goodOn.length + '</b><span>' + esc(T({ en:'good signals on', th:'สัญญาณดีที่ติดอยู่' })) + '</span></div>' +
      '<div class="bz-altext"><p>' + esc(T(badOn.length ? { en:'On now: ' + badOn.map(function(r){ return T(AL_SHORT[r.k] || r.name); }).join(', ') + '.', th:'ที่ติดอยู่ตอนนี้: ' + badOn.map(function(r){ return T(AL_SHORT[r.k] || r.name); }).join(' · ') } : { en:'No warning rule is firing right now.', th:'ตอนนี้ไม่มีกฎเตือนข้อไหนทำงาน' })) + (near.length ? ' ' + esc(T({ en:'Closest to firing: ', th:'ใกล้จะทำงานที่สุด: ' })) + esc(near.map(function(r){ return T(AL_SHORT[r.k] || r.name) + ' (' + f(r.close, 0) + '%)'; }).join(', ')) : '') + '</p>' +
      '<p class="sm">' + ico('bolt') + esc(T({ en:'When a rule fires (or first gets within 80%), the admin Telegram chat gets a message automatically — same bot as the other alerts.', th:'เมื่อกฎข้อใดทำงาน (หรือเข้าใกล้ 80% ครั้งแรก) ระบบจะส่งข้อความเข้า Telegram ของแอดมินให้อัตโนมัติ ใช้บอทเดียวกับการแจ้งเตือนอื่น' })) + '</p></div></div>';
    var sorted = R.slice().sort(function(a, b){ return (b.on ? 200 : b.close) - (a.on ? 200 : a.close); });
    h += '<div class="bz-alg">' + sorted.map(function(r){
      var st = r.on ? (r.tone === 'good' ? ['good', { en:'ON · good sign', th:'ทำงาน · สัญญาณดี' }] : ['bad', { en:'ON', th:'ทำงานอยู่' }]) : r.close >= 70 ? ['mid', { en:'close', th:'ใกล้แล้ว' }] : ['off', { en:'quiet', th:'ปกติ' }];
      var sp = (r.spark || []).filter(isNum), col = r.tone === 'good' ? '#34d399' : r.on ? '#fb7185' : r.close >= 70 ? '#fbbf24' : '#94a3b8';
      return '<div class="bz-al ' + st[0] + '"><div class="bz-alh"><b>' + esc(T(r.name)) + '</b><span class="bz-alst ' + st[0] + '">' + esc(T(st[1])) + '</span></div>' +
        '<div class="bz-alv"><div><span>' + esc(T({ en:'now', th:'ตอนนี้' })) + '</span><b>' + fmtU(r.cur, r.unit, r.unit === '%' ? 1 : 2) + '</b><em>' + esc(T({ en:'trigger ', th:'จุดเตือน ' })) + (r.sign > 0 ? '≥ ' : '< ') + fmtU(r.thr, r.unit === 'pt' ? '' : r.unit, r.unit === '%' ? 0 : 2) + '</em></div>' + spark(sp, col, 130, 40) + '</div>' +
        '<div class="bz-alc"><span>' + esc(T({ en:'How close', th:'ใกล้แค่ไหน' })) + '</span>' + bar(r.close, st[0]) + '<b>' + f(r.close, 0) + '%</b></div>' +
        '<div class="bz-als"><div><span>' + esc(T({ en:'Times since 1970', th:'เกิดตั้งแต่ 1970' })) + '</span><b>' + r.n + '</b></div><div><span>' + esc(T({ en:'S&P 12M after', th:'S&P 12 ด. ต่อมา' })) + '</span><b class="' + (r.spx12 >= 0 ? 'up' : 'dn') + '">' + spc(r.spx12, 1) + '</b></div><div><span>' + esc(T({ en:'Recession ≤18M', th:'ถดถอยใน 18 ด.' })) + '</span><b>' + pc(r.rec18, 0) + '</b></div></div>' +
        '<p>' + esc(T(r.why)) + (r.last ? ' <em>' + esc(T({ en:'Last fired ', th:'ทำงานล่าสุด ' })) + esc(mon(r.last)) + '</em>' : '') + '</p></div>';
    }).join('') + '</div>';
    h += sec({ en:'Every warning since 1970 — one row per rule, one dot per time it fired', th:'สัญญาณเตือนทั้งหมดตั้งแต่ปี 1970 — 1 แถวต่อ 1 กฎ 1 จุดต่อ 1 ครั้งที่ทำงาน' }, timelineSVG(A) + '<div class="bz-leg"><span><i style="background:#fb7185"></i>' + esc(T({ en:'warning', th:'สัญญาณเตือน' })) + '</span><span><i style="background:#fbbf24"></i>' + esc(T({ en:'watch', th:'จับตา' })) + '</span><span><i style="background:#34d399"></i>' + esc(T({ en:'good sign', th:'สัญญาณดี' })) + '</span><span><i style="background:rgba(148,163,184,.35)"></i>' + esc(T({ en:'recession', th:'ช่วงถดถอย' })) + '</span></div>' + note({ en:'Dots that bunch up just before grey columns are the rules worth respecting. Hover a dot for the date and what the S&P 500 did over the next year.', th:'จุดที่กระจุกตัวก่อนแถบเทาคือกฎที่ควรให้ความสำคัญ ชี้ที่จุดเพื่อดูวันที่และผล S&P 500 ในปีถัดมา' }), 'history');
    var recent = A.events.slice(-12).reverse();
    h += sec({ en:'Latest signals', th:'สัญญาณล่าสุด' }, '<div class="bz-alrec">' + recent.map(function(e){ var r = R.filter(function(x){ return x.k === e.k; })[0] || {}; return '<div class="' + e.tone + '"><time>' + esc(mon(e.t)) + '</time><b>' + esc(T(r.name || AL_SHORT[e.k])) + '</b><em>' + (isNum(e.spx12) ? 'S&P 12M ' + spc(e.spx12, 1) : esc(T({ en:'still playing out', th:'ยังรอดูผล' }))) + '</em></div>'; }).join('') + '</div>', 'cal');
    return h;
  }

  /* ================================================================== LIQ */
  function vLiq(){
    var Lq = X('liq'); if(!Lq) return noExt();
    var H = Lq.hist, now = Lq.now, bn = function(v){ return isNum(v) ? (Math.abs(v) >= 1000 ? '$' + f(v / 1000, 2) + 'T' : '$' + f(v, 0) + 'B') : '—'; }, sbn = function(v){ return isNum(v) ? (v > 0 ? '+' : v < 0 ? '−' : '±') + bn(Math.abs(v)).slice(0) : '—'; };
    var c13 = Lq.chg13, dir = c13 > 150 ? 1 : c13 < -150 ? -1 : 0;
    var why = [];
    if(Math.abs(Lq.bs13) > 60) why.push(Lq.bs13 > 0 ? { en:'the Fed is growing its balance sheet (' + sbn(Lq.bs13) + ' in 13 weeks)', th:'เฟดขยายงบดุล (' + sbn(Lq.bs13) + ' ใน 13 สัปดาห์)' } : { en:'the Fed is shrinking its balance sheet (QT, ' + sbn(Lq.bs13) + ')', th:'เฟดหดงบดุล (QT ' + sbn(Lq.bs13) + ')' });
    if(Math.abs(Lq.tga13) > 60) why.push(Lq.tga13 > 0 ? { en:'the Treasury is pulling cash into its account (' + sbn(Lq.tga13) + ')', th:'กระทรวงการคลังดึงเงินเข้าบัญชีตัวเอง (' + sbn(Lq.tga13) + ')' } : { en:'the Treasury is spending its cash back out (' + sbn(Lq.tga13) + ')', th:'กระทรวงการคลังจ่ายเงินออกจากบัญชี (' + sbn(Lq.tga13) + ')' });
    if(Math.abs(Lq.rrp13) > 40) why.push(Lq.rrp13 < 0 ? { en:'money parked at the Fed (reverse repo) is flowing back to markets', th:'เงินที่พักไว้กับเฟด (reverse repo) ไหลกลับเข้าตลาด' } : { en:'money is being parked at the Fed (reverse repo)', th:'มีเงินไปพักไว้กับเฟดมากขึ้น (reverse repo)' });
    var h = '<div class="bz-callout ' + (dir > 0 ? 'good' : dir < 0 ? 'bad' : 'mid') + '">' + ico('drop') + '<div><b>' + esc(T(dir > 0 ? { en:'Liquidity is being ADDED: ' + sbn(c13) + ' over 13 weeks.', th:'สภาพคล่องกำลังถูกเติมเข้า: ' + sbn(c13) + ' ใน 13 สัปดาห์' } : dir < 0 ? { en:'Liquidity is being DRAINED: ' + sbn(c13) + ' over 13 weeks.', th:'สภาพคล่องกำลังถูกดูดออก: ' + sbn(c13) + ' ใน 13 สัปดาห์' } : { en:'Liquidity is roughly flat (' + sbn(c13) + ' over 13 weeks).', th:'สภาพคล่องทรงตัว (' + sbn(c13) + ' ใน 13 สัปดาห์)' })) + '</b><p>' + esc(why.length ? T({ en:'Mainly because ' + why.map(function(x){ return x.en; }).join('; ') + '.', th:'สาเหตุหลัก: ' + why.map(function(x){ return x.th; }).join(' · ') }) : T({ en:'No single driver moved much.', th:'ไม่มีตัวไหนขยับมากเป็นพิเศษ' })) + ' ' + esc(T(dir > 0 ? { en:'More cash in the system has usually been a tailwind for stocks and crypto.', th:'เงินในระบบมากขึ้นมักเป็นแรงหนุนหุ้นและคริปโต' } : dir < 0 ? { en:'Less cash in the system tends to be a headwind, especially for the most speculative assets.', th:'เงินในระบบลดลงมักเป็นแรงต้าน โดยเฉพาะสินทรัพย์ที่เก็งกำไรสูง' } : { en:'Not a driver for markets right now.', th:'ตอนนี้ยังไม่ใช่ปัจจัยหลักของตลาด' })) + '</p></div></div>';
    h += '<div class="bz-kpis">' + kpi({ en:'Net liquidity', th:'สภาพคล่องสุทธิ' }, bn(now[4]), esc(T({ en:'peak ', th:'สูงสุด ' })) + bn(Lq.peak[1]) + ' · ' + esc(mon(Lq.peak[0].slice(0, 7))), dir > 0 ? 'good' : dir < 0 ? 'bad' : '') +
      kpi({ en:'4 weeks', th:'4 สัปดาห์' }, sbn(Lq.chg4), '', Lq.chg4 > 0 ? 'good' : Lq.chg4 < 0 ? 'bad' : '') + kpi({ en:'13 weeks', th:'13 สัปดาห์' }, sbn(Lq.chg13), '', Lq.chg13 > 0 ? 'good' : Lq.chg13 < 0 ? 'bad' : '') + kpi({ en:'1 year', th:'1 ปี' }, sbn(Lq.chg52), '', Lq.chg52 > 0 ? 'good' : Lq.chg52 < 0 ? 'bad' : '') +
      kpi({ en:'Fed balance sheet', th:'งบดุลเฟด' }, bn(now[1]), esc(T({ en:'per week ', th:'ต่อสัปดาห์ ' })) + sbn(Lq.qt_week)) + kpi({ en:'Treasury account (TGA)', th:'บัญชีกระทรวงการคลัง (TGA)' }, bn(now[2]), sbn(Lq.tga13) + ' 13W') + kpi({ en:'Reverse repo', th:'Reverse repo' }, bn(now[3]), sbn(Lq.rrp13) + ' 13W') + kpi({ en:'Bank reserves', th:'เงินสำรองของธนาคาร' }, bn(now[5]), '') + '</div>';
    var since = H.filter(function(r){ return r[0] >= '2019-06'; });
    var base = since.filter(function(r){ return isNum(r[6]); }), b0 = base.length ? base[Math.max(0, base.length - 157)] : null;
    var two = base.slice(Math.max(0, base.length - 157));
    h += '<div class="bz-row"><div class="bz-sec s7"><h4>' + ico('drop') + esc(T({ en:'Net liquidity vs the S&P 500 (3 years, both start at 100)', th:'สภาพคล่องสุทธิเทียบ S&P 500 (3 ปี เริ่มที่ 100 ทั้งคู่)' })) + '</h4>' +
      lineChart({ series:[{ name:{ en:'Net liquidity', th:'สภาพคล่องสุทธิ' }, pts:two.map(function(r){ return [r[0], r[4] / two[0][4] * 100]; }), color:'#22d3ee', w:2.4 }, { name:{ en:'S&P 500', th:'S&P 500' }, pts:two.map(function(r){ return [r[0], r[6] / two[0][6] * 100]; }), color:'#a78bfa', w:2 }], dec:0, h:290 }) +
      note({ en:'Correlation of 13-week changes over 3 years: ' + f(Lq.corr0, 2) + (Math.abs(Lq.corr0) < 0.3 ? ' — weak lately: stocks have been driven more by earnings and rates than by Fed plumbing.' : Lq.corr0 > 0 ? ' — they have moved together.' : ' — they have moved apart.'), th:'ค่าความสัมพันธ์ของการเปลี่ยนแปลงราย 13 สัปดาห์ช่วง 3 ปี: ' + f(Lq.corr0, 2) + (Math.abs(Lq.corr0) < 0.3 ? ' ช่วงหลังสัมพันธ์กันน้อย หุ้นถูกขับด้วยกำไรและดอกเบี้ยมากกว่าสภาพคล่องเฟด' : Lq.corr0 > 0 ? ' ไปทางเดียวกัน' : ' สวนทางกัน') }) + '</div>' +
      '<div class="bz-sec s5"><h4>' + ico('bank') + esc(T({ en:'The three pieces ($ billions)', th:'3 ส่วนประกอบ (พันล้านดอลลาร์)' })) + '</h4>' +
      lineChart({ series:[{ name:{ en:'Treasury account', th:'บัญชีกระทรวงการคลัง' }, pts:since.map(function(r){ return [r[0], r[2]]; }), color:'#fbbf24' }, { name:{ en:'Reverse repo', th:'Reverse repo' }, pts:since.map(function(r){ return [r[0], r[3]]; }), color:'#f472b6' }], dec:0, h:290 }) +
      '<ul class="bz-basis"><li>' + esc(T({ en:'Net liquidity = Fed balance sheet − Treasury General Account − reverse repo.', th:'สภาพคล่องสุทธิ = งบดุลเฟด − บัญชีกระทรวงการคลัง (TGA) − reverse repo' })) + '</li><li>' + esc(T({ en:'Treasury account rising = cash pulled out of banks; reverse repo falling = idle cash released.', th:'บัญชีกระทรวงการคลังเพิ่ม = ดึงเงินออกจากระบบธนาคาร · reverse repo ลด = เงินที่พักไว้ถูกปล่อยออกมา' })) + '</li></ul></div></div>';
    h += sec({ en:'Fed balance sheet and net liquidity since 2019 ($ billions)', th:'งบดุลเฟดและสภาพคล่องสุทธิตั้งแต่ปี 2019 (พันล้านดอลลาร์)' }, lineChart({ series:[{ name:{ en:'Fed balance sheet', th:'งบดุลเฟด' }, pts:since.map(function(r){ return [r[0], r[1]]; }), color:'#94a3b8', w:1.8 }, { name:{ en:'Net liquidity', th:'สภาพคล่องสุทธิ' }, pts:since.map(function(r){ return [r[0], r[4]]; }), color:'#22d3ee', w:2.4, area:true }], dec:0, h:260, rec:D.b && D.b.recessions }), 'bank');
    return h;
  }

  /* ================================================================= THAI */
  function lastP(a){ return a && a.length ? a[a.length - 1] : null; }
  function vThai(){
    var Th = X('thai'); if(!Th) return noExt();
    var pol = Th.policy_now ? Th.policy_now[1] : null, cpi = lastP(Th.cpi), fx = Th.thb_now, ff = mv('ff');
    var real = isNum(pol) && cpi ? pol - cpi[1] : null, gap = isNum(pol) && isNum(ff) ? pol - ff : null;
    var thb = Th.thb || [], fx12 = thb.length > 12 ? thb[thb.length - 13][1] : null, fxY = fx && fx12 ? (fx[1] / fx12 - 1) * 100 : null;
    var W = Th.weo || {}, yr = new Date().getUTCFullYear(), wv = function(k, side, y){ var a = W[k] && W[k][side] || []; for(var i = 0; i < a.length; i++) if(a[i][0] === y) return a[i][1]; return null; };
    var tb = thaiBreadth(), thd = flow('THD'), ex = (F_last && F_last.exp || []).filter(function(e){ return e.sym === 'THD'; })[0];
    var rd = [];
    if(cpi) rd.push(cpi[1] < 1 ? { en:'Thai inflation (' + pc(cpi[1], 1) + ') is BELOW the Bank of Thailand\'s 1–3% target.', th:'เงินเฟ้อไทย (' + pc(cpi[1], 1) + ') ต่ำกว่ากรอบเป้าหมาย 1–3% ของ ธปท.' } : cpi[1] > 3 ? { en:'Thai inflation (' + pc(cpi[1], 1) + ') is ABOVE the 1–3% target.', th:'เงินเฟ้อไทย (' + pc(cpi[1], 1) + ') สูงกว่ากรอบเป้าหมาย 1–3%' } : { en:'Thai inflation (' + pc(cpi[1], 1) + ') is inside the 1–3% target.', th:'เงินเฟ้อไทย (' + pc(cpi[1], 1) + ') อยู่ในกรอบเป้าหมาย 1–3%' });
    if(isNum(real)) rd.push(real > 1 ? { en:'The real policy rate is ' + sg(real, 2) + ' pt — still restrictive, so there is room to cut further.', th:'ดอกเบี้ยนโยบายที่แท้จริง ' + sg(real, 2) + ' จุด ยังค่อนข้างตึง จึงยังมีช่องให้ลดดอกเบี้ยได้อีก' } : real < -0.5 ? { en:'The real policy rate is negative (' + sg(real, 2) + ') — policy is loose; more cuts are unlikely.', th:'ดอกเบี้ยที่แท้จริงติดลบ (' + sg(real, 2) + ') นโยบายผ่อนคลายแล้ว โอกาสลดอีกน้อย' } : { en:'The real policy rate is near neutral (' + sg(real, 2) + ').', th:'ดอกเบี้ยที่แท้จริงใกล้ระดับกลาง (' + sg(real, 2) + ')' });
    if(isNum(gap)) rd.push(gap < -1.5 ? { en:'Thai rates sit ' + f(Math.abs(gap), 2) + ' pt below US rates — that gap keeps pressure on the baht (money earns more in dollars).', th:'ดอกเบี้ยไทยต่ำกว่าสหรัฐฯ ' + f(Math.abs(gap), 2) + ' จุด ส่วนต่างนี้กดดันเงินบาท (ถือดอลลาร์ได้ดอกเบี้ยมากกว่า)' } : { en:'The rate gap with the US (' + sg(gap, 2) + ' pt) is not a big force on the baht.', th:'ส่วนต่างดอกเบี้ยกับสหรัฐฯ (' + sg(gap, 2) + ' จุด) ไม่ใช่แรงกดดันใหญ่ต่อเงินบาท' });
    if(isNum(fxY)) rd.push({ en:'The baht is ' + (fxY > 0 ? 'weaker' : 'stronger') + ' by ' + f(Math.abs(fxY), 1) + '% versus a year ago (' + f(fx[1], 2) + ' per $).', th:'เงินบาท' + (fxY > 0 ? 'อ่อนลง' : 'แข็งขึ้น') + ' ' + f(Math.abs(fxY), 1) + '% เทียบปีก่อน (' + f(fx[1], 2) + ' บาทต่อดอลลาร์)' });
    var g1 = wv('gdp', 'th', yr), g2 = wv('gdp', 'th', yr + 1), gu = wv('gdp', 'us', yr);
    if(isNum(g1)) rd.push({ en:'The IMF sees Thai growth at ' + pc(g1, 1) + ' this year and ' + pc(g2, 1) + ' next' + (isNum(gu) ? ' (US ' + pc(gu, 1) + ')' : '') + '.', th:'IMF คาดเศรษฐกิจไทยโต ' + pc(g1, 1) + ' ปีนี้ และ ' + pc(g2, 1) + ' ปีหน้า' + (isNum(gu) ? ' (สหรัฐฯ ' + pc(gu, 1) + ')' : '') });
    var h = '<div class="bz-thhero"><div class="bz-thf">' + ico('flag') + '<b>' + esc(T({ en:'Thailand at a glance', th:'ภาพรวมประเทศไทย' })) + '</b></div><ul class="bz-anread">' + rd.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="bz-kpis">' + kpi({ en:'BOT policy rate', th:'ดอกเบี้ยนโยบาย ธปท.' }, pc(pol, 2), Th.policy_now ? esc(dshort(Th.policy_now[0])) : '') + kpi({ en:'Thai inflation', th:'เงินเฟ้อไทย' }, pc(cpi && cpi[1], 2), cpi ? esc(mon(cpi[0])) + ' · ' + esc(T({ en:'target 1–3%', th:'เป้า 1–3%' })) : '', cpi && (cpi[1] < 1 || cpi[1] > 3) ? 'bad' : 'good') +
      kpi({ en:'Real policy rate', th:'ดอกเบี้ยที่แท้จริง' }, sg(real, 2), esc(T({ en:'rate − inflation', th:'ดอกเบี้ย − เงินเฟ้อ' }))) + kpi({ en:'Gap vs US Fed', th:'ส่วนต่างกับเฟด' }, sg(gap, 2), esc(T({ en:'negative = pressure on baht', th:'ติดลบ = กดดันเงินบาท' })), gap < -1.5 ? 'bad' : '') +
      kpi({ en:'Baht per $', th:'บาทต่อดอลลาร์' }, f(fx && fx[1], 2), esc(T({ en:'1y ', th:'1 ปี ' })) + spc(fxY, 1), fxY > 3 ? 'bad' : fxY < -3 ? 'good' : '') + kpi({ en:'IMF growth ' + yr, th:'IMF คาด GDP ' + (yr + 543) }, pc(g1, 1), (yr + 1) + ': ' + pc(g2, 1)) +
      kpi({ en:'Thai stocks in up-trends', th:'หุ้นไทยที่เป็นขาขึ้น' }, pc(tb.up, 0), esc(T({ en:'of ', th:'จาก ' })) + tb.n + esc(T({ en:' stocks', th:' ตัว' })), tb.up > 55 ? 'good' : tb.up < 40 ? 'bad' : '') + kpi({ en:'THD (Thai ETF) 6M model', th:'THD (ETF หุ้นไทย) โมเดล 6 ด.' }, spc(ex && ex.r, 1), '1M ' + spc(thd && thd.m1, 1), ex && ex.r > 3 ? 'good' : ex && ex.r < 0 ? 'bad' : '') + '</div>';
    var since = function(a, y){ return (a || []).filter(function(p){ return String(p[0]) >= y; }); };
    h += '<div class="bz-two">' + sec({ en:'Policy rates and inflation', th:'ดอกเบี้ยนโยบายและเงินเฟ้อ' }, lineChart({ series:[{ name:{ en:'BOT policy rate', th:'ดอกเบี้ย ธปท.' }, pts:since(Th.policy, '2015'), color:'#22d3ee', w:2.4 }, { name:{ en:'Thai inflation', th:'เงินเฟ้อไทย' }, pts:since(Th.cpi, '2015'), color:'#f472b6' }, { name:{ en:'US Fed rate', th:'ดอกเบี้ยเฟด' }, pts:since(Th.fedfunds, '2015'), color:'#94a3b8', dash:'5 4' }], unit:'%', dec:2, h:280, band:{ lo:1, hi:3, label:{ en:'BOT target', th:'เป้า ธปท.' } }, zero:true }), 'bank') +
      sec({ en:'The baht (per US dollar, up = weaker baht)', th:'เงินบาท (ต่อดอลลาร์ ขึ้น = บาทอ่อน)' }, lineChart({ series:[{ name:{ en:'THB per $', th:'บาท/ดอลลาร์' }, pts:since(thb, '2015'), color:'#fbbf24', w:2.2, area:true }], dec:2, h:280 }), 'coin') + '</div>';
    var yrs = []; for(var y = yr - 3; y <= yr + 3; y++) yrs.push(y);
    var rowW = function(k, nm, side, fmt){ return '<tr><td>' + esc(T(nm)) + '</td>' + yrs.map(function(y){ var v = wv(k, side, y); return '<td class="' + (y >= yr ? 'fc' : '') + (y === yr ? ' now' : '') + '">' + (isNum(v) ? (fmt ? fmt(v) : f(v, 1)) : '—') + '</td>'; }).join('') + '</tr>'; };
    h += sec({ en:'IMF outlook (World Economic Outlook) — shaded = forecast', th:'มุมมอง IMF (World Economic Outlook) — ช่องแรเงา = คาดการณ์' }, '<div class="bz-tw"><table class="bz-tbl big bz-weo"><thead><tr><th></th>' + yrs.map(function(y){ return '<th>' + (L() === 'th' ? y + 543 : y) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rowW('gdp', { en:'Thai GDP growth %', th:'GDP ไทยโต %' }, 'th') + rowW('gdp', { en:'US GDP growth %', th:'GDP สหรัฐฯ โต %' }, 'us') + rowW('infl', { en:'Thai inflation %', th:'เงินเฟ้อไทย %' }, 'th') + rowW('infl', { en:'US inflation %', th:'เงินเฟ้อสหรัฐฯ %' }, 'us') + rowW('un', { en:'Thai unemployment %', th:'ว่างงานไทย %' }, 'th') + rowW('ca', { en:'Current account % of GDP', th:'ดุลบัญชีเดินสะพัด % GDP' }, 'th') + rowW('debt', { en:'Government debt % of GDP', th:'หนี้สาธารณะ % GDP' }, 'th', function(v){ return f(v, 0); }) + '</tbody></table></div>' +
      (Th.policy_moves && Th.policy_moves.length ? '<div class="bz-chips bz-moves">' + Th.policy_moves.slice(-6).map(function(m){ return '<span class="bz-chip ' + (m[1] < 0 ? 'good' : 'bad') + '">' + esc(dshort(m[0])) + ' <b>' + sg(m[1], 2) + '</b></span>'; }).join('') + '</div>' + note({ en:'Chips = the Bank of Thailand\'s latest rate decisions that changed the rate.', th:'ป้าย = การปรับดอกเบี้ยครั้งล่าสุดของ ธปท.' }) : '') + note({ en:'Sources: Bank of Thailand rate and Thai CPI via the BIS; baht and Fed rate via FRED; outlook from the IMF.', th:'แหล่งข้อมูล: ดอกเบี้ย ธปท. และเงินเฟ้อไทยจาก BIS · ค่าเงินบาทและดอกเบี้ยเฟดจาก FRED · มุมมองจาก IMF' }), 'globe');
    return h;
  }

  /* =============================================================== WHAT-IF */
  var WI = { oil:0, fed:0, core:0, un:0, y10:0, usd:0, vix:0, spx:0 };
  var WI_DEF = [
    ['oil', { en:'Oil price', th:'ราคาน้ำมัน' }, -40, 60, 5, '%'], ['fed', { en:'Fed moves (×0.25)', th:'เฟดขยับ (ครั้งละ 0.25)' }, -4, 4, 1, 'x'], ['core', { en:'Core inflation', th:'เงินเฟ้อพื้นฐาน' }, -1, 1.5, 0.1, 'pt'],
    ['un', { en:'Unemployment', th:'อัตราว่างงาน' }, -0.5, 2, 0.1, 'pt'], ['y10', { en:'10-year yield', th:'บอนด์ยีลด์ 10 ปี' }, -100, 100, 10, 'bp'], ['usd', { en:'US dollar', th:'ค่าเงินดอลลาร์' }, -8, 8, 1, '%'],
    ['vix', { en:'VIX (fear)', th:'VIX (ความกลัว)' }, -8, 30, 1, 'pts'], ['spx', { en:'S&P 500', th:'S&P 500' }, -25, 15, 1, '%']
  ];
  var WI_PRE = [
    ['oil', { en:'Oil shock', th:'น้ำมันพุ่ง' }, { oil:40, core:0.3, usd:1, vix:6, spx:-6 }],
    ['cuts', { en:'Fed cuts twice', th:'เฟดลด 2 ครั้ง' }, { fed:-2, y10:-25, usd:-2, spx:3 }],
    ['rec', { en:'Recession', th:'เศรษฐกิจถดถอย' }, { un:1.2, fed:-4, y10:-80, oil:-30, vix:15, spx:-20, core:-0.4 }],
    ['infl', { en:'Inflation returns', th:'เงินเฟ้อกลับมา' }, { core:0.8, fed:2, y10:60, oil:20, usd:3, vix:5, spx:-8 }],
    ['soft', { en:'Soft landing', th:'ลงจอดนุ่มนวล' }, { core:-0.5, fed:-2, y10:-30, un:0.1, vix:-4, spx:6 }],
    ['usd', { en:'Strong dollar', th:'ดอลลาร์แข็ง' }, { usd:6, y10:20, oil:-5, spx:-3 }]
  ];
  function cloneSer(s){ if(!s) return s; var o = Object.assign({}, s); if(s.hist) o.hist = s.hist.map(function(p){ return [p[0], p[1]]; }); if(s.idx) o.idx = s.idx.map(function(p){ return [p[0], p[1]]; }); return o; }
  function shockedData(W){
    var B = Object.assign({}, D.b, { macro:Object.assign({}, D.b.macro), etf:Object.assign({}, D.b.etf) });
    var M = Object.assign({}, D.m, { macro:Object.assign({}, D.m.macro), ccy:Object.assign({}, D.m.ccy), regime:Object.assign({}, D.m.regime) });
    function bm(k, fn){ var s = B.macro[k]; if(!s) return; s = cloneSer(s); fn(s); B.macro[k] = s; }
    function mm(k, fn){ var s = M.macro[k]; if(!s) return; s = Object.assign({}, s); fn(s); M.macro[k] = s; }
    function setV(s, v){ s.v = v; if(s.hist && s.hist.length) s.hist[s.hist.length - 1][1] = v; }
    function add(s, d){ setV(s, s.v + d); }
    if(W.oil){ bm('oil', function(s){ setV(s, s.v * (1 + W.oil / 100)); }); }
    if(W.fed){ var d = W.fed * 0.25; bm('ff', function(s){ add(s, d); }); bm('y3m', function(s){ add(s, d); }); bm('y2', function(s){ add(s, d * 0.8); }); bm('t10y2y', function(s){ add(s, -d * 0.8); }); bm('t10y3m', function(s){ add(s, -d); }); mm('us3m', function(s){ s.price += d; }); if(isNum(M.regime.curve_10y_3m)) M.regime.curve_10y_3m -= d; }
    if(W.core){ ['core_pce', 'cpi', 'core_cpi'].forEach(function(k){ bm(k, function(s){ add(s, W.core); if(s.idx && s.idx.length > 6){ var n = s.idx.length; for(var j = 0; j < 6; j++) s.idx[n - 6 + j][1] *= 1 + W.core / 100 * (j + 1) / 6; } }); }); bm('be5', function(s){ add(s, W.core * 0.25); }); }
    if(W.un){ bm('unrate', function(s){ add(s, W.un); }); bm('sahm', function(s){ setV(s, Math.max(0, s.v + (W.un > 0 ? W.un * 0.9 : W.un * 0.5))); }); bm('claims', function(s){ setV(s, s.v * (1 + W.un * 0.12)); }); bm('payrolls', function(s){ var n = s.hist.length; for(var j = 1; j <= 3; j++) s.hist[n - j][1] -= W.un * 100; s.v = s.hist[n - 1][1]; }); }
    if(W.y10){ var b = W.y10 / 100; bm('y10', function(s){ add(s, b); }); bm('real10', function(s){ add(s, b * 0.6); }); bm('t10y2y', function(s){ add(s, b); }); bm('t10y3m', function(s){ add(s, b); }); bm('mort', function(s){ add(s, b * 0.9); });
      mm('us10y', function(s){ var prev = s.price / (1 + (s.m1 || 0) / 100); s.price += b; s.m1 = (s.price / prev - 1) * 100; }); mm('us30y', function(s){ s.price += b * 0.9; }); if(isNum(M.regime.curve_10y_3m)) M.regime.curve_10y_3m += b; }
    if(W.usd){ mm('dxy', function(s){ s.price *= 1 + W.usd / 100; s.m1 = (s.m1 || 0) + W.usd; s.m3 = (s.m3 || 0) + W.usd; }); if(M.ccy.THB) M.ccy.THB = Object.assign({}, M.ccy.THB, { rate:M.ccy.THB.rate * (1 + W.usd * 0.55 / 100) }); if(isNum(M.regime.thb_1m)) M.regime.thb_1m -= W.usd * 0.55; }
    if(W.vix){ mm('vix', function(s){ s.price = Math.max(9, s.price + W.vix); s.m1 = (s.m1 || 0) + W.vix / Math.max(9, s.price) * 100; }); }
    if(W.spx){ var p = W.spx / 100; mm('spx', function(s){ s.price *= 1 + p; s.m1 = (s.m1 || 0) + W.spx; s.m6 = (s.m6 || 0) + W.spx; s.vs_ma200 = ((1 + (s.vs_ma200 || 0) / 100) * (1 + p) - 1) * 100; s.above_ma200 = s.vs_ma200 > 0; s.off_high = Math.min(0, ((1 + (s.off_high || 0) / 100) * (1 + p) - 1) * 100); });
      if(B.etf.SPY){ var c = B.etf.SPY.c.slice(); c[c.length - 1] *= 1 + p; B.etf.SPY = { t:B.etf.SPY.t, c:c }; } if(isNum(M.regime.breadth_200)) M.regime.breadth_200 = clamp(M.regime.breadth_200 + W.spx * 1.5, 0, 100); if(isNum(M.regime.breadth_50)) M.regime.breadth_50 = clamp(M.regime.breadth_50 + W.spx * 2, 0, 100); }
    return { B:B, M:M };
  }
  function whatIfRun(W){
    var S = shockedData(W), b0 = D.b, m0 = D.m, E2 = null, F2 = null;
    D.b = S.B; D.m = S.M;
    try { E2 = compute(); F2 = calibrate(forecast(E2)); } catch(e){ if(window.console) console.error(e); }
    D.b = b0; D.m = m0;
    return { E:E2, F:F2 };
  }
  function pfProxy(t, F){
    var ex = {}; (F.exp || []).forEach(function(e){ ex[e.sym] = e.r; });
    if(isNum(ex[t])) return ex[t];
    var I = info(t); if(!I) return ex.SPY;
    if(I.cls === 'bond') return isNum(ex.IEF) ? ex.IEF : ex.SHY;
    if(I.cls === 'cash') return ex.SHV;
    if(I.cls === 'gold') return ex.GLD;
    if(I.cls === 'comm') return ex.DBC;
    if(I.geo === 'TH') return ex.THD;
    var sec2 = { Technology:'QQQ', 'Communication Services':'QQQ', Energy:'XLE', Healthcare:'XLV', 'Consumer Defensive':'XLP', Utilities:'XLP' }[I.sec];
    return isNum(ex[sec2]) ? ex[sec2] : ex.SPY;
  }
  function whatIfOut(){
    var E0 = E_last, F0 = F_last, any = Object.keys(WI).some(function(k){ return WI[k]; });
    if(!any) return '<div class="bz-wiempty">' + ico('sliders') + '<p>' + esc(T({ en:'Move a slider or pick a ready-made scenario — the score, phase, odds, forecasts and your portfolio will be recalculated with the same rules as the rest of the board.', th:'เลื่อนแถบปรับ หรือเลือกสถานการณ์สำเร็จรูป ระบบจะคำนวณคะแนน ช่วงเศรษฐกิจ โอกาส คาดการณ์ และพอร์ตของคุณใหม่ ด้วยกฎชุดเดียวกับทั้งหน้า' })) + '</p></div>';
    var R = whatIfRun(WI), E1 = R.E, F1 = R.F; if(!E1 || !F1) return note({ en:'Could not run this scenario.', th:'คำนวณสถานการณ์นี้ไม่สำเร็จ' });
    var ds = E1.score - E0.score;
    var h = '<div class="bz-wires2"><div class="bz-wiscore"><div><span>' + esc(T({ en:'Market score', th:'คะแนนตลาด' })) + '</span><b>' + Math.round(E0.score) + ' → <strong class="' + (ds > 0.5 ? 'up' : ds < -0.5 ? 'dn' : '') + '">' + Math.round(E1.score) + '</strong></b><em>' + esc(T(E0.weather.w)) + ' → ' + esc(T(E1.weather.w)) + '</em></div>' +
      '<div><span>' + esc(T({ en:'Economic phase', th:'ช่วงเศรษฐกิจ' })) + '</span><b class="sm">' + esc(T(PHASES[E0.phase].short)) + ' → <strong>' + esc(T(PHASES[E1.phase].short)) + '</strong></b><em>' + esc(T(PHASES[E1.phase].best)) + '</em></div>' +
      '<div><span>' + esc(T({ en:'Recession odds 12M', th:'โอกาสถดถอย 12 ด.' })) + '</span><b>' + f(F0.rec && F0.rec.p, 0) + '% → <strong class="' + ((F1.rec && F0.rec && F1.rec.p > F0.rec.p + 1) ? 'dn' : (F1.rec && F0.rec && F1.rec.p < F0.rec.p - 1) ? 'up' : '') + '">' + f(F1.rec && F1.rec.p, 0) + '%</strong></b></div></div>';
    /* scenarios */
    var sc0 = {}; E0.scen.forEach(function(s){ sc0[s.k] = s.p; });
    h += '<div class="bz-wisc">' + E1.scen.map(function(s){ var d = s.p - (sc0[s.k] || 0); return '<div class="bz-sc-' + s.k + '"><span>' + esc(T(s.name)) + '</span><b>' + (sc0[s.k] || 0) + '% → ' + s.p + '%</b><em class="' + (d > 0 ? 'up' : d < 0 ? 'dn' : '') + '">' + sg(d, 0) + '</em></div>'; }).join('') + '</div>';
    /* pillars that changed */
    var p0 = {}; E0.pillars.forEach(function(p){ p0[p.key] = p.score; });
    var ch = E1.pillars.filter(function(p){ return p.score !== p0[p.key]; });
    h += '<div class="bz-two"><div class="bz-sec"><h4>' + ico('layers') + esc(T({ en:'Drivers that change', th:'ปัจจัยที่เปลี่ยน' })) + '</h4>' + (ch.length ? '<div class="bz-wipl">' + ch.map(function(p){ var d = p.score - p0[p.key]; return '<div><span>' + ico(p.icon) + esc(T(p.title)) + '</span><b>' + sg(p0[p.key], 1) + ' → ' + sg(p.score, 1) + '</b><em class="' + (d > 0 ? 'up' : 'dn') + '">' + sg(d, 1) + '</em></div>'; }).join('') + '</div>' : note({ en:'None of the nine drivers crosses a scoring threshold — the move is too small to change the rules\' verdicts.', th:'ไม่มีปัจจัยไหนข้ามเกณฑ์คะแนน การขยับยังเล็กเกินกว่าจะเปลี่ยนข้อสรุปของกฎ' })) + '</div>';
    /* forecasts */
    var fk = [['core', { en:'Core PCE', th:'Core PCE' }], ['cpi', { en:'CPI', th:'CPI' }], ['ff', { en:'Fed rate', th:'ดอกเบี้ยเฟด' }], ['y10', { en:'10y yield', th:'บอนด์ 10 ปี' }], ['un', { en:'Unemployment', th:'ว่างงาน' }], ['oil', { en:'Oil', th:'น้ำมัน' }], ['spx', { en:'S&P 500', th:'S&P 500' }]];
    h += '<div class="bz-sec"><h4>' + ico('radar') + esc(T({ en:'6-month forecasts', th:'คาดการณ์ 6 เดือน' })) + '</h4><table class="bz-tbl bz-witab"><thead><tr><th></th><th>' + esc(T({ en:'Base', th:'ฐาน' })) + '</th><th>' + esc(T({ en:'Scenario', th:'สมมติ' })) + '</th><th>' + esc(T({ en:'Diff', th:'ต่าง' })) + '</th></tr></thead><tbody>' + fk.map(function(x){
      var a = fcAt(F0.items[x[0]], 6), b = fcAt(F1.items[x[0]], 6); if(!a || !b) return ''; var it = F0.items[x[0]], pre = it.unit === '$' ? '$' : '', u = it.unit === '%' ? '%' : '', d = b.v - a.v;
      return '<tr><td>' + esc(T(x[1])) + '</td><td>' + pre + f(a.v, it.dec) + u + '</td><td><b>' + pre + f(b.v, it.dec) + u + '</b></td><td class="' + (Math.abs(d) < 1e-6 ? '' : d > 0 ? 'up' : 'dn') + '">' + sg(d, it.dec) + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
    /* asset returns */
    var e0 = {}; F0.exp.forEach(function(e){ e0[e.sym] = e.r; });
    var rows = F1.exp.map(function(e){ return { sym:e.sym, n:e.I ? e.I.n : T(e.name), a:e0[e.sym], b:e.r, d:e.r - (e0[e.sym] || 0) }; }).sort(function(x, y){ return y.d - x.d; });
    h += '<div class="bz-two"><div class="bz-sec"><h4>' + ico('star') + esc(T({ en:'Expected 6-month return: who wins, who loses', th:'ผลตอบแทนคาด 6 เดือน: ใครได้ ใครเสีย' })) + '</h4>' + bars(rows.map(function(r){ return { n:{ en:r.sym, th:r.sym }, sub:{ en:spc(r.a, 1) + ' → ' + spc(r.b, 1), th:spc(r.a, 1) + ' → ' + spc(r.b, 1) }, v:r.d }; }), { fmt:function(v){ return sg(v, 1) + ' pt'; } }) + '</div>';
    /* portfolio */
    var W0 = {}; try { W0 = currentWeights(pfState()) || {}; } catch(e){}
    var ts = Object.keys(W0).filter(function(t){ return W0[t] > 0; }), tot = ts.reduce(function(s, t){ return s + W0[t]; }, 0);
    if(ts.length && tot){
      var r0 = 0, r1 = 0, lines = ts.map(function(t){ var w = W0[t] / tot, a = pfProxy(t, F0), b = pfProxy(t, F1); r0 += w * (a || 0); r1 += w * (b || 0); return { t:t, w:w, d:(b || 0) - (a || 0) }; }).sort(function(x, y){ return x.d - y.d; });
      h += '<div class="bz-sec"><h4>' + ico('pie') + esc(T({ en:'Your portfolio (from “My portfolio”)', th:'พอร์ตของคุณ (จากหน้า “พอร์ตของฉัน”)' })) + '</h4><div class="bz-wipf"><div><span>' + esc(T({ en:'Expected 6M', th:'คาด 6 เดือน' })) + '</span><b>' + spc(r0, 1) + ' → <strong class="' + (r1 > r0 ? 'up' : 'dn') + '">' + spc(r1, 1) + '</strong></b></div><div><span>' + esc(T({ en:'Effect on ฿100,000', th:'ผลต่อเงิน 100,000 บาท' })) + '</span><b class="' + (r1 > r0 ? 'up' : 'dn') + '">' + (r1 >= r0 ? '+' : '−') + '฿' + Math.abs((r1 - r0) * 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</b></div></div>' +
        bars(lines.slice(0, 8).map(function(l){ return { n:{ en:l.t, th:l.t }, sub:{ en:f(l.w * 100, 0) + '% weight', th:'น้ำหนัก ' + f(l.w * 100, 0) + '%' }, v:l.d }; }), { fmt:function(v){ return sg(v, 1) + ' pt'; } }) +
        note({ en:'Each holding is mapped to the closest modelled asset (its own ETF, its sector, Thai stocks → THD, bonds → IEF ...). A rough guide to direction and size, not a price target.', th:'แต่ละตัวในพอร์ตจับคู่กับสินทรัพย์ที่โมเดลคำนวณไว้ใกล้ที่สุด (ETF ตัวเอง กลุ่มหุ้น หุ้นไทย → THD บอนด์ → IEF ...) ใช้ดูทิศทางและขนาดคร่าวๆ ไม่ใช่ราคาเป้าหมาย' }) + '</div>';
    } else h += '<div class="bz-sec">' + note({ en:'Set up a portfolio on “My portfolio” to see its impact here.', th:'จัดพอร์ตในหน้า “พอร์ตของฉัน” ก่อน แล้วผลกระทบจะขึ้นที่นี่' }) + '</div>';
    h += '</div>';
    return h;
  }
  function wiLabel(d){ var v = WI[d[0]]; return d[5] === 'x' ? (v > 0 ? '+' + v + ' ' + T({ en:'hike' + (v > 1 ? 's' : ''), th:'ครั้ง (ขึ้น)' }) : v < 0 ? Math.abs(v) + ' ' + T({ en:'cut' + (v < -1 ? 's' : ''), th:'ครั้ง (ลด)' }) : T({ en:'no change', th:'คงที่' })) : d[5] === 'bp' ? sg(v, 0) + ' bp' : d[5] === 'pt' ? sg(v, 1) + ' pt' : d[5] === 'pts' ? sg(v, 0) : spc(v, 0); }
  function vWhatif(){
    var h = '<div class="bz-wi"><div class="bz-sec bz-wictl"><h4>' + ico('sliders') + esc(T({ en:'What if…?', th:'ถ้าเกิดว่า…?' })) + '<button type="button" class="bz-btn sm ghost" data-wireset>' + esc(T({ en:'Reset', th:'ล้างค่า' })) + '</button></h4>' +
      '<div class="bz-wipre">' + WI_PRE.map(function(p){ return '<button type="button" data-wipre="' + p[0] + '">' + esc(T(p[1])) + '</button>'; }).join('') + '</div>' +
      WI_DEF.map(function(d){ return '<label class="bz-wis"><span>' + esc(T(d[1])) + '<b data-wiv="' + d[0] + '">' + esc(wiLabel(d)) + '</b></span><input type="range" min="' + d[2] + '" max="' + d[3] + '" step="' + d[4] + '" value="' + WI[d[0]] + '" data-wi="' + d[0] + '"></label>'; }).join('') +
      note({ en:'Each slider is a change from today. Related numbers move with it (a Fed move also shifts bills and the 2-year; higher unemployment also lifts the Sahm rule and claims), then the whole engine re-runs.', th:'แต่ละแถบคือการเปลี่ยนจากวันนี้ ตัวเลขที่เกี่ยวข้องจะขยับตาม (เฟดขยับ ตั๋วเงินคลังและบอนด์ 2 ปีขยับด้วย ว่างงานเพิ่ม สัญญาณ Sahm และคนขอสวัสดิการเพิ่มด้วย) แล้วรันทั้งระบบใหม่' }) + '</div>' +
      '<div class="bz-wiout" data-wiout>' + whatIfOut() + '</div></div>';
    h += presetMatrix();
    return h;
  }
  function presetMatrix(){
    var E0 = E_last, F0 = F_last, W0 = {}; try { W0 = currentWeights(pfState()) || {}; } catch(e){}
    var ts = Object.keys(W0).filter(function(t){ return W0[t] > 0; }), tot = ts.reduce(function(s, t){ return s + W0[t]; }, 0);
    var pf = function(F){ if(!tot) return null; var r = 0; ts.forEach(function(t){ r += W0[t] / tot * (pfProxy(t, F) || 0); }); return r; };
    var g = function(F, k){ var q = fcAt(F.items[k], 6); return q ? q.v : null; };
    var rows = [{ n:{ en:'Today (base)', th:'วันนี้ (ฐาน)' }, E:E0, F:F0, base:true }].concat(WI_PRE.map(function(p){ var W = { oil:0, fed:0, core:0, un:0, y10:0, usd:0, vix:0, spx:0 }; Object.keys(p[2]).forEach(function(k){ W[k] = p[2][k]; }); var R = whatIfRun(W); return { k:p[0], n:p[1], E:R.E, F:R.F }; })).filter(function(r){ return r.E && r.F; });
    var p0 = pf(F0);
    return sec({ en:'All ready-made scenarios side by side', th:'สถานการณ์สำเร็จรูปทั้งหมด เทียบกันในตารางเดียว' }, '<div class="bz-tw"><table class="bz-tbl big bz-wimx"><thead><tr><th></th><th>' + esc(T({ en:'Score', th:'คะแนน' })) + '</th><th>' + esc(T({ en:'Phase', th:'ช่วงเศรษฐกิจ' })) + '</th><th>' + esc(T({ en:'Recession 12M', th:'ถดถอย 12 ด.' })) + '</th><th>Core PCE 6M</th><th>' + esc(T({ en:'Fed 6M', th:'เฟด 6 ด.' })) + '</th><th>' + esc(T({ en:'10y 6M', th:'10 ปี 6 ด.' })) + '</th><th>S&P 6M</th><th>' + esc(T({ en:'Your portfolio 6M', th:'พอร์ตคุณ 6 ด.' })) + '</th><th></th></tr></thead><tbody>' + rows.map(function(r){
      var sc = r.E.score, d = sc - E0.score, pr = pf(r.F), sp = fcAt(r.F.items.spx, 6), sp0 = fcAt(F0.items.spx, 6);
      return '<tr' + (r.base ? ' class="base"' : '') + '><td><b>' + esc(T(r.n)) + '</b></td><td class="' + (r.base ? '' : d > 0.5 ? 'up' : d < -0.5 ? 'dn' : '') + '">' + Math.round(sc) + (r.base ? '' : ' <small>(' + sg(d, 0) + ')</small>') + '</td><td>' + esc(T(PHASES[r.E.phase].short)) + '</td><td>' + f(r.F.rec && r.F.rec.p, 0) + '%</td><td>' + pc(g(r.F, 'core'), 2) + '</td><td>' + pc(g(r.F, 'ff'), 2) + '</td><td>' + pc(g(r.F, 'y10'), 2) + '</td><td class="' + (sp && sp0 && sp.v > sp0.v ? 'up' : sp && sp0 && sp.v < sp0.v ? 'dn' : '') + '">' + (sp && F0.items.spx ? spc((sp.v / F0.items.spx.now - 1) * 100, 1) : '—') + '</td><td class="' + (isNum(pr) && isNum(p0) ? (pr > p0 ? 'up' : pr < p0 ? 'dn' : '') : '') + '">' + spc(pr, 1) + '</td><td>' + (r.base ? '' : '<button type="button" class="bz-btn sm ghost" data-wipre="' + r.k + '">' + esc(T({ en:'Open', th:'เปิด' })) + '</button>') + '</td></tr>';
    }).join('') + '</tbody></table></div>' + note({ en:'Each row re-runs the whole engine with that preset. “S&P 6M” is the model\'s 6-month centre versus today\'s level.', th:'แต่ละแถวรันทั้งระบบใหม่ด้วยสถานการณ์นั้น “S&P 6 ด.” คือค่ากลางคาดการณ์ 6 เดือนของโมเดลเทียบกับระดับวันนี้' }), 'layers');
  }
  var wiTimer = null;
  function wireWhatif(root){
    root.addEventListener('input', function(ev){
      var i = ev.target; if(!i.hasAttribute || !i.hasAttribute('data-wi')) return;
      var k = i.getAttribute('data-wi'); WI[k] = parseFloat(i.value) || 0;
      var d = WI_DEF.filter(function(x){ return x[0] === k; })[0], lab = root.querySelector('[data-wiv="' + k + '"]'); if(lab && d) lab.textContent = wiLabel(d);
      clearTimeout(wiTimer); wiTimer = setTimeout(function(){ var o = root.querySelector('[data-wiout]'); if(o){ CH = CH || {}; o.innerHTML = whatIfOut(); } }, 120);
    });
    root.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-wipre],[data-wireset]'); if(!b || !root.contains(b)) return;
      Object.keys(WI).forEach(function(k){ WI[k] = 0; });
      if(b.hasAttribute('data-wipre')){ var p = WI_PRE.filter(function(x){ return x[0] === b.getAttribute('data-wipre'); })[0]; if(p) Object.keys(p[2]).forEach(function(k){ WI[k] = p[2][k]; }); }
      paint();
    });
  }

  /* =========================================================== HEATMAP (Summary) */
  var HM = [
    ['g1', { en:'Inflation', th:'เงินเฟ้อ' }], ['core_pce', -1], ['cpi', -1], ['be5', -1], ['wages', 0],
    ['g2', { en:'Rates', th:'ดอกเบี้ย' }], ['ff', -1], ['y2', -1], ['y10', -1], ['real10', -1], ['t10y3m', 1], ['mort', -1],
    ['g3', { en:'Jobs', th:'การจ้างงาน' }], ['unrate', -1], ['payrolls', 1], ['claims', -1], ['sahm', -1], ['jolts', 1],
    ['g4', { en:'Activity', th:'เศรษฐกิจ' }], ['retail', 1], ['indpro', 1], ['permits', 1], ['sent', 1], ['gdpnow', 1],
    ['g5', { en:'Money & stress', th:'การเงินและความเครียด' }], ['m2', 1], ['hy', -1], ['nfci', -1], ['oil', -1], ['recprob', -1]
  ];
  function hmMonths(n){ var d = new Date(), out = []; for(var i = n; i >= 1; i--){ var x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i + 1, 1)); out.push(x.toISOString().slice(0, 7)); } return out; }
  function heatmapHTML(){
    if(!D.b || !D.b.macro) return '';
    var months = hmMonths(24), colsum = months.map(function(){ return [0, 0]; }), body = '';
    HM.forEach(function(row){
      if(row[0][0] === 'g' && row[0].length === 2){ body += '<tr class="g"><td colspan="' + (months.length + 3) + '">' + esc(T(row[1])) + '</td></tr>'; return; }
      var s = mac(row[0]); if(!s || !s.hist || s.hist.length < 12) return;
      var vals = s.hist.map(function(p){ return p[1]; }), sorted = vals.slice().sort(function(a, b){ return a - b; });
      var pct = function(v){ var lo = 0, hi = sorted.length; while(lo < hi){ var m = (lo + hi) >> 1; if(sorted[m] < v) lo = m + 1; else hi = m; } return lo / (sorted.length - 1 || 1) * 100; };
      var byM = {}; s.hist.forEach(function(p){ byM[p[0].slice(0, 7)] = p[1]; });
      var cells = '', last = null, lastM = null;
      months.forEach(function(m, i){
        var v = byM[m];
        if(!isNum(v) && isNum(last) && lastM && (tms(m + '-01') - tms(lastM + '-01')) < 100 * 864e5) v = last;   // carry a quarterly / late print forward
        else if(isNum(v)){ last = v; lastM = m; }
        if(!isNum(v)){ cells += '<td class="na"></td>'; return; }
        var p = pct(v), sc = row[1] === 0 ? 0 : (p - 50) / 50 * row[1], cls = 'c' + Math.round(clamp((sc + 1) * 3, 0, 6));
        if(row[1] !== 0){ colsum[i][0] += sc; colsum[i][1]++; }
        cells += '<td class="' + (row[1] === 0 ? 'cn' : cls) + '" title="' + esc(mon(m) + ' · ' + (L() === 'th' ? s.th : s.en) + ': ' + f(v, 2) + ' (' + T({ en:'percentile ', th:'เปอร์เซ็นไทล์ ' }) + f(p, 0) + ')') + '"></td>';
      });
      var v6 = isNum(s.v) && s.hist.length > 6 ? s.v - (function(){ var t6 = tms(s.t) - 182 * 864e5, b = null; s.hist.forEach(function(p){ if(tms(p[0]) <= t6) b = p[1]; }); return b; })() : null;
      var good = row[1] === 0 || !isNum(v6) ? '' : v6 * row[1] > 0 ? 'up' : 'dn';
      body += '<tr><td class="n">' + esc(L() === 'th' ? s.th : s.en) + '</td>' + cells + '<td class="v">' + f(s.v, s.unit === 'k' || s.unit === '$' ? 0 : 2) + (s.unit === '%' ? '%' : s.unit === 'k' ? 'k' : '') + '</td><td class="d ' + good + '">' + (isNum(v6) ? (v6 > 0 ? '▲' : v6 < 0 ? '▼' : '▶') : '') + '</td></tr>';
    });
    var allRow = '<tr class="all"><td class="n"><b>' + esc(T({ en:'Overall', th:'ภาพรวม' })) + '</b></td>' + colsum.map(function(c){ var sc = c[1] ? c[0] / c[1] * 2.2 : 0; return '<td class="c' + Math.round(clamp((sc + 1) * 3, 0, 6)) + '" title="' + f(sc * 50 + 50, 0) + '"></td>'; }).join('') + '<td></td><td></td></tr>';
    var head = '<tr><th></th>' + months.map(function(m, i){ return '<th>' + (i % 3 === 0 || i === months.length - 1 ? esc(mon(m)) : '') + '</th>'; }).join('') + '<th>' + esc(T({ en:'Now', th:'ล่าสุด' })) + '</th><th>6M</th></tr>';
    var first = colsum[0][1] ? colsum[0][0] / colsum[0][1] : 0, lastc = colsum[colsum.length - 1][1] ? colsum[colsum.length - 1][0] / colsum[colsum.length - 1][1] : 0, mid = colsum[colsum.length - 7] && colsum[colsum.length - 7][1] ? colsum[colsum.length - 7][0] / colsum[colsum.length - 7][1] : 0;
    var trend = lastc - mid;
    return '<div class="bz-sec bz-hmsec"><h4>' + ico('grid') + esc(T({ en:'The whole economy in one colour map — 24 months', th:'เศรษฐกิจทั้งหมดในแผนที่สีเดียว — 24 เดือน' })) + '<span class="bz-fq">' + esc(T(trend > 0.08 ? { en:'getting greener over 6 months', th:'6 เดือนหลังเขียวขึ้น' } : trend < -0.08 ? { en:'getting redder over 6 months', th:'6 เดือนหลังแดงขึ้น' } : { en:'little change over 6 months', th:'6 เดือนหลังเปลี่ยนไม่มาก' })) + '</span></h4>' +
      '<div class="bz-tw"><table class="bz-hm"><colgroup><col class="n">' + months.map(function(){ return '<col>'; }).join('') + '<col class="v"><col class="d"></colgroup><thead>' + head + '</thead><tbody>' + body + allRow + '</tbody></table></div>' +
      '<div class="bz-hmleg"><span>' + esc(T({ en:'bad for stocks', th:'ไม่ดีต่อหุ้น' })) + '</span><i class="c0"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><i class="c5"></i><i class="c6"></i><span>' + esc(T({ en:'good for stocks', th:'ดีต่อหุ้น' })) + '</span><em>' + esc(T({ en:'Colour = where each reading sits in its own history (5–15 years), flipped so green always means “helps stocks”. Hover a cell for the number.', th:'สี = ค่านั้นอยู่ตรงไหนเทียบประวัติของตัวเอง (5–15 ปี) และกลับด้านให้เขียวหมายถึง “ช่วยหุ้น” เสมอ ชี้ที่ช่องเพื่อดูตัวเลข' })) + '</em></div></div>';
  }

  /* ======================================================= EVENT DAYS (This week) */
  var EV_K = [['cpi', /CPI|Consumer Price/i, { en:'CPI (inflation)', th:'CPI (เงินเฟ้อ)' }], ['jobs', /Non-Farm|Nonfarm|NFP|Employment Change|Unemployment Rate/i, { en:'Jobs report', th:'รายงานการจ้างงาน' }], ['fomc', /FOMC|Federal Funds|Fed Interest Rate/i, { en:'Fed decision', th:'ประกาศดอกเบี้ยเฟด' }], ['pce', /PCE|Personal (Income|Spending)/i, { en:'PCE (Fed\'s gauge)', th:'PCE (ตัวที่เฟดใช้)' }], ['gdp', /GDP/i, { en:'GDP', th:'GDP' }]];
  function evStat(e){
    var Ev = X('events'); if(!Ev || !e || e.country !== 'USD' && e.country !== 'US' || /Speaks|Minutes|Testif/i.test(e.event)) return null;
    for(var i = 0; i < EV_K.length; i++){ if(EV_K[i][1].test(e.event)){ var s = Ev.stats[EV_K[i][0]]; return s ? { k:EV_K[i][0], s:s, n:Ev.normal } : null; } }
    return null;
  }
  function eventsHTML(){
    var Ev = X('events'); if(!Ev || !Ev.stats) return '';
    var N = Ev.normal, mx = 0; EV_K.forEach(function(k){ var s = Ev.stats[k[0]]; if(s) mx = Math.max(mx, s.abs); });
    return '<h3 class="bz-h3">' + ico('bolt') + esc(T({ en:'How much markets move on the big days', th:'วันประกาศตัวเลขใหญ่ ตลาดแกว่งแค่ไหน' })) + '</h3><div class="bz-evg">' + EV_K.map(function(k){
      var s = Ev.stats[k[0]]; if(!s) return '';
      var nx = (Ev.next && Ev.next[k[0]] || [])[0];
      return '<div class="bz-evc"><div class="bz-evh"><b>' + esc(T(k[2])) + '</b>' + (nx ? '<span>' + esc(T({ en:'next ', th:'ครั้งถัดไป ' })) + esc(dshort(nx)) + '</span>' : '') + '</div>' +
        '<div class="bz-evn"><b>±' + f(s.abs, 2) + '%</b><em>' + esc(T({ en:'average S&P 500 move', th:'S&P 500 แกว่งเฉลี่ย' })) + '</em></div>' +
        '<div class="bz-evb"><i style="width:' + (s.abs / mx * 100).toFixed(0) + '%"></i><u style="left:' + (N.abs / mx * 100).toFixed(0) + '%" title="normal"></u></div>' +
        '<ul><li><span>' + esc(T({ en:'vs a normal day', th:'เทียบวันปกติ' })) + '</span><b class="' + (s.ratio > 1.1 ? 'dn' : '') + '">×' + f(s.ratio, 2) + '</b></li><li><span>' + esc(T({ en:'days moving 1%+', th:'วันที่แกว่ง 1%+' })) + '</span><b>' + f(s.big1, 0) + '% <small>(' + esc(T({ en:'normal ', th:'ปกติ ' })) + f(N.big1, 0) + '%)</small></b></li><li><span>' + esc(T({ en:'10y yield move', th:'บอนด์ 10 ปีขยับ' })) + '</span><b>±' + f(s.y10, 1) + ' bp</b></li><li><span>' + esc(T({ en:'up days', th:'วันที่หุ้นขึ้น' })) + '</span><b>' + f(s.up, 0) + '%</b></li></ul>' +
        '<details class="bz-more"><summary>' + esc(T({ en:'Biggest moves', th:'วันที่ขยับแรงสุด' })) + '</summary>' + s.big.map(function(b){ return '<div class="bz-evbig"><time>' + esc(dshort(b[0])) + '</time><b class="' + (b[1] >= 0 ? 'up' : 'dn') + '">' + spc(b[1], 2) + '</b></div>'; }).join('') + '</details>' +
        '<small class="bz-evsm">' + s.n + esc(T({ en:' releases since ', th:' ครั้ง ตั้งแต่ ' })) + esc(mon(s.from.slice(0, 7))) + '</small></div>';
    }).join('') + '</div>' + note({ en:'Close-to-close S&P 500 moves on release days versus every other trading day (normal ±' + f(N.abs, 2) + '%). Use it to size positions or avoid adding risk the day before.', th:'การขยับของ S&P 500 จากราคาปิดถึงราคาปิดในวันประกาศ เทียบกับวันซื้อขายอื่นทั้งหมด (ปกติ ±' + f(N.abs, 2) + '%) ใช้กำหนดขนาดการลงทุน หรือเลี่ยงเพิ่มความเสี่ยงก่อนวันประกาศ' });
  }

  /* ---------------------------------------------- hook into existing views */
  var vSum0 = vSum;
  vSum = function(E, F){ var h = vSum0(E, F), cut = h.indexOf('<div class="bz-sec bz-sumt">'); var hm = heatmapHTML(); return cut > 0 ? h.slice(0, cut) + hm + h.slice(cut) : h + hm; };
  var vCal0 = vCal;
  vCal = function(){ return vCal0() + eventsHTML(); };
  TABS.splice(2, 0, ['track', { en:'Track record', th:'ความแม่นของสมอง' }, 'target']);
  (function(){
    var at = function(k){ for(var i = 0; i < TABS.length; i++) if(TABS[i][0] === k) return i; return TABS.length; };
    TABS.splice(at('infl') + 1, 0, ['liq', { en:'Fed liquidity', th:'สภาพคล่องเฟด' }, 'drop']);
    TABS.splice(at('growth') + 1, 0, ['alert', { en:'Warning signals', th:'สัญญาณเตือน' }, 'alert']);
    TABS.splice(at('fx') + 1, 0, ['thai', { en:'Thailand', th:'เศรษฐกิจไทย' }, 'flag']);
    TABS.splice(at('out') + 1, 0, ['analog', { en:'Past look-alikes', th:'อดีตที่คล้ายตอนนี้' }, 'history'], ['whatif', { en:'What if…', th:'ลองสมมติ' }, 'sliders']);
  })();
  var XV = { track:vTrack, analog:vAnalog, alert:vAlert, liq:vLiq, thai:vThai, whatif:vWhatif };

  /* ------------------------------------------------- manual: the new tools */
  var manItems0 = manItems;
  manItems = function(E, F){
    var s = manItems0(E, F), tr = X('track'), A = X('analog'), Al = X('alerts'), Lq = X('liq'), Th = X('thai'), Ev = X('events');
    var h6 = tr ? tr.models.map(function(m){ return m.h['6']; }).filter(Boolean) : [], wins = h6.filter(function(h){ return h.mae < h.mae0; }).length;
    var onR = Al ? Al.rules.filter(function(r){ return r.on && r.tone !== 'good'; }).map(function(r){ return r.name; }) : [];
    s.push({ h:{ en:'7 · The newer tools', th:'7 · เครื่องมือชุดใหม่' }, items:[
      { t:{ en:'Track record', th:'ความแม่นของสมอง' },
        what:{ en:'Seven forecast models (core PCE, CPI, Fed rate, 2y and 10y yields, unemployment, oil) at 3, 6 and 12 months, plus the recession model and the VIX range.', th:'โมเดลคาดการณ์ 7 ตัว (Core PCE, CPI, ดอกเบี้ยเฟด, บอนด์ 2 ปีและ 10 ปี, ว่างงาน, น้ำมัน) ที่ 3, 6 และ 12 เดือน รวมถึงโมเดลถดถอยและกรอบจาก VIX' },
        how:{ en:'For every month since 2012 the same formulas are re-run using only what was published by the start of that month (monthly data two months old, daily data to the previous month-end), then compared with what happened. The bar to beat is “nothing changes”.', th:'ทุกเดือนตั้งแต่ปี 2012 รันสูตรเดิมใหม่โดยใช้เฉพาะข้อมูลที่ประกาศแล้ว ณ ต้นเดือนนั้น (ข้อมูลรายเดือนช้า 2 เดือน ข้อมูลรายวันถึงสิ้นเดือนก่อน) แล้วเทียบกับของจริง มาตรฐานที่ต้องชนะคือการเดาว่า “ไม่เปลี่ยน”' },
        why:{ en:'A forecast is only worth what its record says. Showing the misses keeps the board honest and tells you which numbers to trust.', th:'คาดการณ์มีค่าเท่ากับผลงานของมัน การโชว์ครั้งที่พลาดทำให้ระบบซื่อตรง และบอกได้ว่าควรเชื่อตัวเลขไหน' },
        now:{ en:wins + ' of ' + h6.length + ' models beat “no change” at 6 months.', th:'โมเดล ' + wins + ' จาก ' + h6.length + ' ตัว ชนะการเดาว่าไม่เปลี่ยนที่กรอบ 6 เดือน' } },
      { t:{ en:'Self-calibrating ranges', th:'ช่วงคาดการณ์ที่ปรับตัวเอง' },
        what:{ en:'How wide each forecast band would have had to be for ~68% of past outcomes to land inside, and the average past miss.', th:'ช่วงคาดการณ์แต่ละตัวต้องกว้างแค่ไหนผลจริงในอดีตราว 68% จึงจะตกในช่วง และค่าคลาดเคลื่อนเฉลี่ยในอดีต' },
        how:{ en:'Every forecast on the board has its 68% and 95% bands multiplied by that factor (0.6–3.5×), and its centre moved by half of its average past error.', th:'ทุกคาดการณ์ในหน้านี้คูณความกว้างแถบ 68% และ 95% ด้วยตัวคูณนั้น (0.6–3.5 เท่า) และขยับค่ากลางครึ่งหนึ่งของความคลาดเคลื่อนเฉลี่ยในอดีต' },
        why:{ en:'Simple models are usually over-confident. Correcting from their own record is the most honest fix.', th:'โมเดลง่ายๆ มักมั่นใจเกินไป การแก้จากผลงานของตัวเองคือวิธีที่ซื่อตรงที่สุด' },
        now:{ en:'Unemployment ranges ×' + f(tr && tr.models.filter(function(m){ return m.k === 'un'; })[0] && tr.models.filter(function(m){ return m.k === 'un'; })[0].h['6'].cal, 2) + ' at 6 months.', th:'ช่วงอัตราว่างงานถูกขยาย ×' + f(tr && tr.models.filter(function(m){ return m.k === 'un'; })[0] && tr.models.filter(function(m){ return m.k === 'un'; })[0].h['6'].cal, 2) + ' ที่ 6 เดือน' } },
      { t:{ en:'Past look-alikes', th:'อดีตที่คล้ายตอนนี้' },
        what:{ en:'8 traits every month since 1960: core inflation and its 6-month change, unemployment and its rise from the 12-month low, the Fed rate, the real Fed rate, the 10y−3m curve and oil\'s 1-year change.', th:'ลักษณะ 8 ด้านทุกเดือนตั้งแต่ปี 1960: เงินเฟ้อพื้นฐานและการเปลี่ยนใน 6 เดือน, ว่างงานและส่วนที่สูงกว่าจุดต่ำสุด 12 เดือน, ดอกเบี้ยเฟด, ดอกเบี้ยเฟดที่แท้จริง, เส้นยีลด์ 10 ปี−3 เดือน และน้ำมันเทียบปีก่อน' },
        how:{ en:'Each trait is turned into standard units, weighted, and the distance from today measured. The six closest months (at least two years apart) are kept; their next 12 months are averaged, closer ones counting more.', th:'แปลงแต่ละด้านเป็นหน่วยมาตรฐาน ให้น้ำหนัก แล้ววัดระยะห่างจากวันนี้ เก็บ 6 เดือนที่ใกล้ที่สุด (ห่างกันอย่างน้อย 2 ปี) แล้วเฉลี่ยผล 12 เดือนถัดมา ตัวที่ใกล้กว่าให้น้ำหนักมากกว่า' },
        why:{ en:'Markets react to combinations, not single numbers. Look-alikes show what that combination has led to before.', th:'ตลาดตอบสนองต่อส่วนผสมของปัจจัย ไม่ใช่ตัวเลขตัวเดียว ช่วงที่คล้ายกันบอกว่าส่วนผสมแบบนี้เคยนำไปสู่อะไร' },
        now:A ? { en:'Closest: ' + A.matches.slice(0, 3).map(function(m){ return mon(m.t); }).join(', ') + ' · S&P 12M after ' + spc(A.avg.spx12, 1) + ' (normal ' + spc(A.base.spx12, 1) + ').', th:'ใกล้ที่สุด: ' + A.matches.slice(0, 3).map(function(m){ return mon(m.t); }).join(', ') + ' · S&P 12 เดือนต่อมา ' + spc(A.avg.spx12, 1) + ' (ปกติ ' + spc(A.base.spx12, 1) + ')' } : { en:'—', th:'—' } },
      { t:{ en:'Warning signals', th:'สัญญาณเตือน' },
        what:{ en:'15 rules: yield-curve inversions and un-inversion, Sahm rule, jobless claims, credit spreads, core inflation crossing 3%, the Fed\'s first cut / hike, oil spikes, financial conditions, bear markets.', th:'กฎ 15 ข้อ: เส้นยีลด์กลับหัวและกลับมาเป็นบวก, Sahm, คนขอสวัสดิการว่างงาน, ส่วนต่างหุ้นกู้, เงินเฟ้อพื้นฐานข้าม 3%, เฟดลด/ขึ้นครั้งแรก, น้ำมันพุ่ง, สภาพการเงิน, ตลาดหมี' },
        how:{ en:'Each is checked monthly back to 1970: a "fire" is a fresh crossing after several months on the other side. For each we record the S&P 500 a year later and whether a recession began within 18 months. “How close” = distance from its 3-year calm extreme to the trigger.', th:'ตรวจทุกเดือนย้อนถึงปี 1970 “ทำงาน” คือการข้ามเส้นใหม่หลังอยู่อีกฝั่งหลายเดือน บันทึก S&P 500 อีก 1 ปีต่อมา และมีภาวะถดถอยใน 18 เดือนหรือไม่ “ใกล้แค่ไหน” = ระยะจากจุดสงบสุดใน 3 ปีถึงจุดเตือน' },
        why:{ en:'No single signal is reliable; a cluster of them firing together has preceded every modern recession.', th:'ไม่มีสัญญาณไหนเชื่อได้ตัวเดียว แต่เมื่อหลายตัวทำงานพร้อมกัน ก่อนภาวะถดถอยยุคใหม่ทุกครั้งมักเป็นแบบนั้น' },
        now:{ en:onR.length ? 'On now: ' + onR.map(function(n){ return n.en; }).join('; ') + '.' : 'No warning rule is on.', th:onR.length ? 'ที่ทำงานอยู่: ' + onR.map(function(n){ return n.th; }).join(' · ') : 'ไม่มีกฎเตือนข้อไหนทำงาน' } },
      { t:{ en:'Fed liquidity', th:'สภาพคล่องเฟด' },
        what:{ en:'Weekly: Fed balance sheet (WALCL), Treasury General Account (WTREGEN), overnight reverse repo (RRPONTSYD), bank reserves.', th:'รายสัปดาห์: งบดุลเฟด (WALCL), บัญชีกระทรวงการคลัง (WTREGEN), reverse repo ข้ามคืน (RRPONTSYD), เงินสำรองธนาคาร' },
        how:{ en:'Net liquidity = balance sheet − TGA − reverse repo. Changes over 4, 13 and 52 weeks; ±$150bn in 13 weeks counts as adding / draining. The correlation with the S&P 500 is shown so you can see when it matters.', th:'สภาพคล่องสุทธิ = งบดุล − TGA − reverse repo ดูการเปลี่ยนใน 4, 13 และ 52 สัปดาห์ ±150,000 ล้านดอลลาร์ใน 13 สัปดาห์ถือว่าเติม/ดูดเงิน แสดงค่าความสัมพันธ์กับ S&P 500 ให้เห็นว่าช่วงไหนสำคัญ' },
        why:{ en:'Cash created or withdrawn by the Fed and Treasury has to sit somewhere — often in risk assets.', th:'เงินที่เฟดและกระทรวงการคลังสร้างหรือดึงออก ต้องไปอยู่ที่ไหนสักแห่ง ซึ่งมักเป็นสินทรัพย์เสี่ยง' },
        now:{ en:Lq ? 'Net ' + f(Lq.now[4] / 1000, 2) + 'T, 13-week change ' + sg(Lq.chg13, 0) + 'B.' : '—', th:Lq ? 'สุทธิ ' + f(Lq.now[4] / 1000, 2) + ' ล้านล้านดอลลาร์ เปลี่ยนใน 13 สัปดาห์ ' + sg(Lq.chg13, 0) + ' พันล้าน' : '—' } },
      { t:{ en:'Thailand', th:'เศรษฐกิจไทย' },
        what:{ en:'Bank of Thailand policy rate and Thai CPI (BIS), baht per dollar (FRED), IMF World Economic Outlook, Thai stock breadth from the site\'s own data.', th:'ดอกเบี้ยนโยบาย ธปท. และเงินเฟ้อไทย (BIS), บาทต่อดอลลาร์ (FRED), มุมมองเศรษฐกิจโลกของ IMF และความกว้างตลาดหุ้นไทยจากข้อมูลของเว็บ' },
        how:{ en:'Inflation vs the 1–3% target, real policy rate (rate − inflation), the gap with the Fed rate, the baht\'s 1-year move, IMF growth.', th:'เงินเฟ้อเทียบเป้า 1–3%, ดอกเบี้ยที่แท้จริง (ดอกเบี้ย − เงินเฟ้อ), ส่วนต่างกับเฟด, เงินบาทเทียบปีก่อน, การเติบโตตามที่ IMF คาด' },
        why:{ en:'For a Thai investor the baht and local rates decide half the return of anything bought abroad.', th:'สำหรับนักลงทุนไทย เงินบาทและดอกเบี้ยในประเทศกำหนดผลตอบแทนครึ่งหนึ่งของทุกอย่างที่ซื้อจากต่างประเทศ' },
        now:{ en:Th && Th.policy_now ? 'Policy rate ' + pc(Th.policy_now[1], 2) + ', CPI ' + pc(lastP(Th.cpi) && lastP(Th.cpi)[1], 1) + '.' : '—', th:Th && Th.policy_now ? 'ดอกเบี้ยนโยบาย ' + pc(Th.policy_now[1], 2) + ' เงินเฟ้อ ' + pc(lastP(Th.cpi) && lastP(Th.cpi)[1], 1) : '—' } },
      { t:{ en:'What if…', th:'ลองสมมติ' },
        what:{ en:'Eight shocks from today: oil, Fed moves, core inflation, unemployment, 10-year yield, dollar, VIX and the S&P 500.', th:'การเปลี่ยนจากวันนี้ 8 แบบ: น้ำมัน, เฟด, เงินเฟ้อพื้นฐาน, ว่างงาน, บอนด์ 10 ปี, ดอลลาร์, VIX และ S&P 500' },
        how:{ en:'The shock is written into a copy of the data (with the obvious knock-ons), then the full engine — score, phase, scenarios, forecasts, expected returns — runs again. The portfolio is mapped to the closest modelled assets.', th:'เขียนการเปลี่ยนลงในสำเนาข้อมูล (พร้อมผลต่อเนื่องที่ชัดเจน) แล้วรันทั้งระบบใหม่ ทั้งคะแนน ช่วงเศรษฐกิจ สถานการณ์ คาดการณ์ และผลตอบแทนคาด พอร์ตจับคู่กับสินทรัพย์ที่โมเดลคำนวณไว้ใกล้ที่สุด' },
        why:{ en:'Thinking in scenarios before they happen is how professionals avoid panic decisions.', th:'การคิดเป็นสถานการณ์ก่อนเกิดจริง คือวิธีที่มืออาชีพใช้เลี่ยงการตัดสินใจตอนตื่นตระหนก' },
        now:{ en:'Pick a preset on the What-if tab.', th:'เลือกสถานการณ์สำเร็จรูปได้ที่แท็บ “ลองสมมติ”' } },
      { t:{ en:'Colour map and event days', th:'แผนที่สี และวันประกาศตัวเลข' },
        what:{ en:'Colour map: 25 economy series over 24 months. Event days: S&P 500 and 10-year moves on CPI, jobs-report, Fed, PCE and GDP days since 2010.', th:'แผนที่สี: ข้อมูลเศรษฐกิจ 25 ตัวย้อนหลัง 24 เดือน · วันประกาศ: การขยับของ S&P 500 และบอนด์ 10 ปีในวันประกาศ CPI การจ้างงาน เฟด PCE และ GDP ตั้งแต่ปี 2010' },
        how:{ en:'Each cell = percentile of the reading in its own history, flipped so green helps stocks. Event days = mean absolute close-to-close move vs every other day.', th:'แต่ละช่อง = เปอร์เซ็นไทล์ของค่านั้นในประวัติตัวเอง กลับด้านให้เขียว = ช่วยหุ้น · วันประกาศ = ค่าเฉลี่ยการขยับสัมบูรณ์ราคาปิดถึงราคาปิด เทียบกับวันอื่นทั้งหมด' },
        why:{ en:'One glance shows whether conditions are improving or deteriorating; event stats tell you when volatility is likely.', th:'ดูแวบเดียวรู้ว่าสภาวะดีขึ้นหรือแย่ลง และสถิติวันประกาศบอกว่าวันไหนตลาดน่าจะแกว่งแรง' },
        now:{ en:Ev && Ev.stats && Ev.stats.cpi ? 'CPI days: ±' + f(Ev.stats.cpi.abs, 2) + '% vs normal ±' + f(Ev.normal.abs, 2) + '%.' : '—', th:Ev && Ev.stats && Ev.stats.cpi ? 'วันประกาศ CPI: ±' + f(Ev.stats.cpi.abs, 2) + '% เทียบวันปกติ ±' + f(Ev.normal.abs, 2) + '%' : '—' } }
    ]});
    return s;
  };

  /* ======================================= PRICE FORECAST: GOLD & BITCOIN (2026-10-26)
     Sub-menu inside the Market Brain. Data: brain_ext.json -> px, built by
     scripts/brain_px.py (rules + a walk-forward test since 2008 / 2018). The
     page adds the macro piece from the board's own forecasts (gold: real
     yields + dollar; bitcoin: Nasdaq expectation x beta) and re-bases every
     number on the latest live price from market.json. */
  IC.btc = '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 7.5v9M9.5 7.5h3.6a2.1 2.1 0 010 4.2H9.5h4.1a2.2 2.2 0 010 4.4H9.5M11 6v1.5M11 16.5V18M13 6v1.5M13 16.5V18"/>';
  IC.gold = '<path d="M4 18l2.2-6h11.6L20 18H4z"/><path d="M7.5 12l1.6-4.5h5.8L16.5 12"/><path d="M10 7.5V6M14 7.5V6"/>';
  var PX = { a:'gold', r:'1y' };
  try { var px0 = JSON.parse(localStorage.getItem('spz.brain.px') || 'null'); if(px0 && px0.a) PX = px0; } catch(e){}
  var PXN = { gold:{ en:'Gold', th:'ทองคำ', ic:'gold', col:'#fbbf24', unit:{ en:'$ per ounce', th:'ดอลลาร์ต่อออนซ์' } }, btc:{ en:'Bitcoin', th:'บิตคอยน์', ic:'btc', col:'#f97316', unit:{ en:'$ per coin', th:'ดอลลาร์ต่อเหรียญ' } } };
  function pxMoney(v, a){ if(!isNum(v)) return '—'; var d = v >= 10000 ? 0 : v >= 1000 ? (a === 'btc' ? 0 : 1) : 2; return '$' + v.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function pxThb(v){ return isNum(v) ? '฿' + Math.round(v).toLocaleString('en-US') : '—'; }
  function addDays(t, d){ var x = new Date(tms(t) + d * 864e5); return x.toISOString().slice(0, 10); }
  function pxLive(A, a){
    /* latest price: bitcoin straight from market.json; gold via GLD's move since the file was built */
    var now = A.last[1], at = A.last[0], src = 'file';
    if(a === 'btc'){ var b = flow('BTC-USD'); if(b && isNum(b.price) && Math.abs(b.price / now - 1) < 0.25){ now = b.price; at = D.m.generated_at ? D.m.generated_at.slice(0, 10) : at; src = 'live'; } }
    if(a === 'gold' && A.gld_last){ var g = flow('GLD'); if(g && isNum(g.price)){ var k = g.price / A.gld_last[1]; if(Math.abs(k - 1) < 0.1 && Math.abs(k - 1) > 1e-6){ now = now * k; at = D.m.generated_at ? D.m.generated_at.slice(0, 10) : at; src = 'live'; } } }
    return { p:now, t:at, src:src, k:now / A.last[1] };
  }
  function pxMacro(A, a, days){
    var F = F_last; if(!F) return { v:0, txt:null };
    var mo = days / 30.44;
    if(a === 'gold' && A.beta){
      var y = F.items && F.items.y10, dRe = y ? (pathAt(y, mo)[0] - y.now) * 0.7 : 0;
      var dx = F.dxy ? (pathAt({ now:F.dxy.now, fc:F.dxy.fc.map(function(q){ return { m:q.m, v:q.v, lo:q.lo, hi:q.hi }; }) }, mo)[0] / F.dxy.now - 1) : 0;
      var v = 0.5 * ((A.beta.real || 0) * dRe + (A.beta.dollar || 0) * dx);
      return { v:v, dRe:dRe, dx:dx * 100 };
    }
    if(a === 'btc' && A.beta){
      var q = (F.exp || []).filter(function(e){ return e.sym === 'QQQ'; })[0];
      var v2 = q ? 0.5 * (A.beta.qqq || 0) * (q.r / 100) * Math.min(days, 365) / 182 : 0;
      return { v:v2, qqq:q && q.r };
    }
    return { v:0 };
  }
  function pxFc(A, a, LV){
    return A.fc.map(function(q){
      var m = pxMacro(A, a, q.d), e = q.exp + m.v, s = q.sig * (q.cal || 1), p = LV.p;
      return { d:q.d, lab:q.lab, e:e, s:s, mid:p * Math.exp(e), lo:p * Math.exp(e - s), hi:p * Math.exp(e + s), lo2:p * Math.exp(e - 2 * s), hi2:p * Math.exp(e + 2 * s),
        pup:Phi(e / s) * 100, p10u:(1 - Phi((Math.log(1.1) - e) / s)) * 100, p10d:Phi((Math.log(0.9) - e) / s) * 100, comp:q.comp, macro:m, cal:q.cal };
    });
  }
  function tlab(s){ return s >= 1.5 ? { en:'Strong uptrend', th:'ขาขึ้นแข็งแรง', c:'good' } : s >= 0.5 ? { en:'Uptrend', th:'ขาขึ้น', c:'good' } : s > -0.5 ? { en:'Sideways', th:'ออกข้าง', c:'mid' } : s > -1.5 ? { en:'Downtrend', th:'ขาลง', c:'bad' } : { en:'Strong downtrend', th:'ขาลงแรง', c:'bad' }; }
  function cycleChart(H){
    var W = 1000, Hh = 300, P = { l:56, r:70, t:14, b:28 }, cols = ['#94a3b8', '#a78bfa', '#f97316'], ys = [];
    H.cycles.forEach(function(c){ c.pts.forEach(function(p){ if(p[1] > 0) ys.push(Math.log10(p[1])); }); });
    if(!ys.length) return '';
    var y0 = Math.min.apply(null, ys) - 0.05, y1 = Math.max.apply(null, ys) + 0.08;
    var X = function(d){ return P.l + d / 1460 * (W - P.l - P.r); }, Y = function(v){ return P.t + (1 - (Math.log10(v) - y0) / (y1 - y0)) * (Hh - P.t - P.b); };
    var g = '';
    [50, 100, 200, 500, 1000, 2000, 5000].forEach(function(v){ var lv = Math.log10(v); if(lv < y0 || lv > y1) return; g += '<line class="bz-gl" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/><text class="bz-ax" x="' + (P.l - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + (v >= 1000 ? (v / 1000) + 'k' : v) + '</text>'; });
    for(var yr = 1; yr <= 4; yr++){ var xx = X(yr * 365); g += '<line class="bz-gl v" x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + P.t + '" y2="' + (Hh - P.b) + '"/><text class="bz-ax" x="' + (xx - 4).toFixed(1) + '" y="' + (Hh - 8) + '" text-anchor="end">' + esc(T({ en:'year ' + yr, th:'ปีที่ ' + yr })) + '</text>'; }
    var nx = X(H.now_day); g += '<line class="bz-ref" x1="' + nx.toFixed(1) + '" x2="' + nx.toFixed(1) + '" y1="' + P.t + '" y2="' + (Hh - P.b) + '"/><text class="bz-refl" x="' + (nx + 4).toFixed(1) + '" y="' + (P.t + 12) + '">' + esc(T({ en:'today (day ' + H.now_day + ')', th:'วันนี้ (วันที่ ' + H.now_day + ')' })) + '</text>';
    var leg = '';
    H.cycles.forEach(function(c, i){
      var col = cols[i % cols.length], d = '';
      c.pts.forEach(function(p, j){ if(p[1] > 0) d += (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); });
      var lp = c.pts[c.pts.length - 1];
      g += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (i === H.cycles.length - 1 ? 3 : 1.8) + '"/>';
      g += '<text class="bz-tag" x="' + (X(lp[0]) + 6).toFixed(1) + '" y="' + (Y(lp[1]) + 4).toFixed(1) + '" fill="' + col + '">×' + f(lp[1] / 100, 1) + '</text>';
      leg += '<span><i style="background:' + col + '"></i>' + esc(T({ en:'Halving ' + c.h.slice(0, 4), th:'ฮาล์ฟวิ่ง ' + c.h.slice(0, 4) })) + '</span>';
    });
    return '<div class="bz-leg">' + leg + '</div><svg class="bz-svg" viewBox="0 0 ' + W + ' ' + Hh + '">' + g + '</svg>';
  }
  function pxShort(v, a){ return a === 'btc' ? (v >= 1000 ? '$' + (v / 1000).toFixed(v >= 100000 ? 0 : 1) + 'k' : '$' + v.toFixed(0)) : '$' + Math.round(v).toLocaleString('en-US'); }
  /* gold (left axis, $) and the US 10-year real yield (right axis, %), not
     flipped, plus a plain-language reading of what happened since the last
     turn in real yields. */
  var GRINV = true;
  try { GRINV = localStorage.getItem('spz.brain.grinv') !== '0'; } catch(e){}
  function goldReal(A, N){
    var R = A.real.map(function(x){ return [x[0], x[1]]; }), t0 = R[0][0];
    var G = A.hist_w.filter(function(x){ return x[0] >= t0; }).map(function(x){ return [x[0], x[1]]; });
    if(G.length < 20) return '';
    var W = 960, H = 400, P = { l:66, r:64, t:34, b:28 };
    G.forEach(function(p){ p.x = tms(p[0]); }); R.forEach(function(p){ p.x = tms(p[0]); });
    var x0 = Math.min(G[0].x, R[0].x), x1 = Math.max(G[G.length - 1].x, R[R.length - 1].x);
    var mm = function(a){ var v = a.map(function(p){ return p[1]; }), lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), pd = (hi - lo) * 0.08 || 1; return [lo - pd, hi + pd]; };
    var gr = mm(G), rr = mm(R);
    var X = function(x){ return P.l + (x - x0) / (x1 - x0 || 1) * (W - P.l - P.r); };
    var YG = function(v){ return P.t + (1 - (v - gr[0]) / (gr[1] - gr[0])) * (H - P.t - P.b); }, YR = function(v){ var q = (v - rr[0]) / (rr[1] - rr[0]); return P.t + (GRINV ? q : 1 - q) * (H - P.t - P.b); };
    var money = function(v){ return '$' + Math.round(v).toLocaleString('en-US'); };
    var g = '';
    niceTicks(gr[0], gr[1], 5).forEach(function(v){ g += '<line class="bz-gl" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + YG(v).toFixed(1) + '" y2="' + YG(v).toFixed(1) + '"/><text class="bz-ax" x="' + (P.l - 6) + '" y="' + (YG(v) + 3.5).toFixed(1) + '" text-anchor="end" fill="' + N.col + '">' + money(v) + '</text>'; });
    niceTicks(rr[0], rr[1], 5).forEach(function(v){ g += '<text class="bz-ax" x="' + (W - P.r + 6) + '" y="' + (YR(v) + 3.5).toFixed(1) + '" fill="#a78bfa">' + (+v.toFixed(2)) + '%</text>'; });
    for(var yr = new Date(x0).getUTCFullYear() + 1; yr <= new Date(x1).getUTCFullYear(); yr++){ var xx = X(Date.UTC(yr, 0, 1)); g += '<line class="bz-gl v" x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + P.t + '" y2="' + (H - P.b) + '"/><text class="bz-ax" x="' + xx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + yr + '</text>'; }
    g += '<text class="bz-ax" x="' + P.l + '" y="14" fill="' + N.col + '">← ' + esc(T({ en:'gold, $ per ounce', th:'ทองคำ ดอลลาร์/ออนซ์' })) + '</text><text class="bz-ax" x="' + (W - P.r + 50) + '" y="14" text-anchor="end" fill="#a78bfa">' + esc(T(GRINV ? { en:'real 10y yield %, INVERTED (lower on chart = higher yield) →', th:'ยีลด์จริง 10 ปี % แกนกลับหัว (ยิ่งต่ำในกราฟ = ยีลด์ยิ่งสูง) →' } : { en:'real 10y yield, % →', th:'ยีลด์จริง 10 ปี % →' })) + '</text>';
    /* last turn in real yields: lowest or highest point of the last 52 weeks, whichever is further back from today's level */
    var last52 = R.slice(-52), lo = last52[0], hi = last52[0];
    last52.forEach(function(p){ if(p[1] < lo[1]) lo = p; if(p[1] > hi[1]) hi = p; });
    var rNow = R[R.length - 1], tp = Math.abs(rNow[1] - lo[1]) >= Math.abs(rNow[1] - hi[1]) ? lo : hi;
    var near = function(arr, x){ var b = arr[0], bd = Infinity; arr.forEach(function(p){ var d = Math.abs(p.x - x); if(d < bd){ bd = d; b = p; } }); return b; };
    var gTp = near(G, tp.x), gNow = G[G.length - 1];
    g += '<rect class="bz-grtp" x="' + X(tp.x).toFixed(1) + '" width="' + (X(x1) - X(tp.x)).toFixed(1) + '" y="' + P.t + '" height="' + (H - P.t - P.b) + '"/>' +
      '<text class="bz-grtpl" x="' + (X(x1) - 6).toFixed(1) + '" y="' + (H - P.b - 8) + '" text-anchor="end">' + esc(T({ en:'since ', th:'ตั้งแต่ ' }) + dshort(tp[0])) + '</text>';
    var path = function(arr, Y){ return arr.map(function(p, j){ return (j ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(''); };
    g += '<path d="' + path(R, YR) + '" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="' + path(G, YG) + 'L' + X(gNow.x).toFixed(1) + ' ' + (H - P.b) + 'L' + X(G[0].x).toFixed(1) + ' ' + (H - P.b) + 'Z" fill="' + N.col + '" opacity=".08"/>' +
      '<path d="' + path(G, YG) + '" fill="none" stroke="' + N.col + '" stroke-width="2.4" stroke-linejoin="round"/>';
    [[tp, YR, '#a78bfa', f(tp[1], 2) + '%', 1], [gTp, YG, N.col, money(gTp[1]), -1], [rNow, YR, '#a78bfa', '', 0], [gNow, YG, N.col, '', 0]].forEach(function(m){
      var x = X(m[0].x), y = m[1](m[0][1]);
      g += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" fill="var(--bz-bgc,#0b0f17)" stroke="' + m[2] + '" stroke-width="2.4"/>' +
        (m[3] ? '<text class="bz-grlb" x="' + (x - 9).toFixed(1) + '" y="' + (y + (m[4] > 0 ? 17 : -10)).toFixed(1) + '" text-anchor="end" fill="' + m[2] + '">' + esc(m[3]) + '</text>' : '');
    });
    g += '<rect x="' + (W - P.r + 2) + '" y="' + (YG(gNow[1]) - 9).toFixed(1) + '" width="' + (P.r - 4) + '" height="17" rx="5" fill="' + N.col + '" opacity=".18"/><text class="bz-tag" x="' + (W - P.r + 6) + '" y="' + (YG(gNow[1]) + 4).toFixed(1) + '" fill="' + N.col + '">' + esc(money(gNow[1])) + '</text>';
    var id = 'c' + (++chN);
    CH[id] = { ser:[{ name:N, pts:G, color:N.col, fmt:money }, { name:{ en:'Real 10y yield', th:'ยีลด์จริง 10 ปี' }, pts:R, color:'#a78bfa', fmt:function(v){ return f(v, 2) + '%'; } }], X:X, x0:x0, x1:x1, W:W, H:H, P:P, unit:'', dec:2 };
    var chart = '<div class="bz-leg"><span><i style="background:' + N.col + '"></i>' + esc(T({ en:'Gold (left axis)', th:'ทองคำ (แกนซ้าย)' })) + '</span><span><i style="background:#a78bfa"></i>' + esc(T(GRINV ? { en:'Real 10-year yield (right axis, inverted)', th:'ยีลด์จริง 10 ปี (แกนขวา กลับหัว)' } : { en:'Real 10-year yield (right axis)', th:'ยีลด์จริง 10 ปี (แกนขวา)' })) + '</span></div>' +
      '<div class="bz-chart" data-ch="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="bz-svg">' + g + '<line class="bz-xh" x1="0" x2="0" y1="' + P.t + '" y2="' + (H - P.b) + '" style="display:none"/></svg><div class="bz-tip" hidden></div></div>';
    /* what happened since the turn */
    var dR = rNow[1] - tp[1], dG = (gNow[1] / gTp[1] - 1) * 100, opp = (dR > 0 && dG < 0) || (dR < 0 && dG > 0);
    /* history since the start of the series: 13-week windows */
    var gm = {}; G.forEach(function(p){ gm[p[0]] = p; });
    var up = [0, 0], dn = [0, 0];
    for(var i = 0; i + 13 < R.length; i++){
      var a0 = near(G, R[i].x), a1 = near(G, R[i + 13].x), dr = R[i + 13][1] - R[i][1], dg = a1[1] / a0[1] - 1;
      if(dr >= 0.3){ up[1]++; if(dg < 0) up[0]++; } else if(dr <= -0.3){ dn[1]++; if(dg > 0) dn[0]++; }
    }
    /* correlation of weekly changes, last 26 weeks */
    var cs = [], k;
    for(k = Math.max(1, R.length - 26); k < R.length; k++){ var p0 = near(G, R[k - 1].x), p1 = near(G, R[k].x); cs.push([R[k][1] - R[k - 1][1], p1[1] / p0[1] - 1]); }
    var mx = cs.reduce(function(s, c){ return s + c[0]; }, 0) / (cs.length || 1), my = cs.reduce(function(s, c){ return s + c[1]; }, 0) / (cs.length || 1);
    var sxy = 0, sxx = 0, syy = 0; cs.forEach(function(c){ sxy += (c[0] - mx) * (c[1] - my); sxx += (c[0] - mx) * (c[0] - mx); syy += (c[1] - my) * (c[1] - my); });
    var corr = sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
    var dir = dR > 0 ? { en:'rose', th:'ขึ้น' } : { en:'fell', th:'ลง' }, gdir = dG < 0 ? { en:'fell', th:'ลง' } : { en:'rose', th:'ขึ้น' };
    var side = '<div class="bz-grside">' +
      '<div class="bz-grk"><h6>' + esc(T({ en:'How to read it', th:'อ่านกราฟนี้อย่างไร' })) + '</h6><ul>' +
        '<li><i style="background:' + N.col + '"></i>' + esc(T({ en:'Gold line, left axis in dollars.', th:'เส้นทอง ดูตัวเลขแกนซ้าย (ดอลลาร์)' })) + '</li>' +
        '<li><i style="background:#a78bfa"></i>' + esc(T({ en:'Purple line, right axis in %: the 10-year US Treasury yield minus expected inflation — the “real” return for holding a bond instead of gold (gold pays nothing).', th:'เส้นม่วง ดูแกนขวา (%) คือดอกเบี้ยพันธบัตรสหรัฐฯ 10 ปี หักเงินเฟ้อที่ตลาดคาด = ผลตอบแทน “ที่แท้จริง” ถ้าถือพันธบัตรแทนทอง (ทองไม่มีดอกเบี้ย)' })) + '</li>' +
        (GRINV ? '<li><b>' + esc(T({ en:'The right axis is upside down', th:'แกนขวากลับหัว' })) + '</b> ' + esc(T({ en:'(the way most banks and Bloomberg draw it): small yields at the top, big yields at the bottom. So the purple line going DOWN = real yields going UP.', th:'(แบบที่ธนาคารและ Bloomberg นิยมวาด): ยีลด์ต่ำอยู่บน ยีลด์สูงอยู่ล่าง เส้นม่วงลง = ยีลด์จริงขึ้น' })) + '</li>' +
          '<li>' + esc(T({ en:'Lines moving together = normal (real yields up → gold down). Gold far ABOVE the purple line = gold is dearer than rates alone explain (central-bank buying, fear, weak dollar).', th:'สองเส้นไปด้วยกัน = ปกติ (ยีลด์จริงขึ้น → ทองลง) ถ้าเส้นทองลอยสูงเหนือเส้นม่วงมาก = ทองแพงกว่าที่ดอกเบี้ยอธิบายได้ (ธนาคารกลางซื้อ ความกลัว ดอลลาร์อ่อน)' })) + '</li>'
        : '<li>' + esc(T({ en:'Normal axis: lines moving in OPPOSITE directions = normal. Real yield up → holding gold costs more interest → gold tends to fall.', th:'แกนปกติ: สองเส้นวิ่งสวนทางกัน = ปกติ ยีลด์จริงขึ้น → ถือทองแล้วเสียโอกาสได้ดอกเบี้ย → ทองมักลง' })) + '</li><li>' + esc(T({ en:'Both rising together = something else is lifting gold (central-bank buying, fear, a weak dollar).', th:'ถ้าขึ้นพร้อมกัน = มีแรงอื่นหนุนทอง (ธนาคารกลางซื้อ ความกลัว ดอลลาร์อ่อน)' })) + '</li>') +
        '</ul></div>' +
      '<div class="bz-grnow ' + (opp ? 'good' : 'mid') + '"><span>' + esc(T({ en:'Since ', th:'ตั้งแต่ ' }) + dshort(tp[0]) + T({ en:' (the shaded area)', th:' (พื้นที่แรเงา)' })) + '</span>' +
        '<div class="bz-grd"><div><small>' + esc(T({ en:'Real yield', th:'ยีลด์จริง' })) + '</small><b style="color:#a78bfa">' + f(tp[1], 2) + '% → ' + f(rNow[1], 2) + '%</b><em>' + sg(dR, 2) + ' ' + esc(T({ en:'pts', th:'จุด' })) + '</em></div><div><small>' + esc(T({ en:'Gold', th:'ทอง' })) + '</small><b style="color:' + N.col + '">' + money(gTp[1]) + ' → ' + money(gNow[1]) + '</b><em>' + spc(dG, 1) + '</em></div></div>' +
        '<p>' + esc(T(opp ? { en:'Real yields ' + dir.en + ' and gold ' + gdir.en + ' — the textbook relationship is working. ' + (GRINV ? 'On this inverted chart the two lines therefore move the same way.' : 'On this normal chart the lines move in opposite directions.'), th:'ยีลด์จริง' + dir.th + ' ทอง' + gdir.th + ' = เป็นไปตามตำรา ' + (GRINV ? '(ในกราฟแกนกลับหัวนี้ สองเส้นจึง' + (dG < 0 ? 'ลง' : 'ขึ้น') + 'ไปด้วยกัน)' : '(ในกราฟแกนปกติ สองเส้นจึงวิ่งสวนทางกัน)') } : { en:'Real yields ' + dir.en + ' and gold ' + gdir.en + ' too — gold is being driven by something other than rates right now (central-bank buying, fear or the dollar).', th:'ยีลด์จริง' + dir.th + ' และทองก็' + gdir.th + 'ด้วย = ตอนนี้ทองถูกขับด้วยปัจจัยอื่นที่ไม่ใช่ดอกเบี้ย (ธนาคารกลางซื้อ ความกลัว หรือดอลลาร์)' })) + '</p></div>' +
      '<div class="bz-grst"><div><b>' + (up[1] ? Math.round(up[0] / up[1] * 100) + '%' : '—') + '</b><span>' + esc(T({ en:'of 3-month spells when real yields rose ≥0.3 pt, gold fell (' + up[1] + ' weeks since ' + t0.slice(0, 4) + ')', th:'ของช่วง 3 เดือนที่ยีลด์จริงขึ้น ≥0.3 จุด ทองลง (' + up[1] + ' สัปดาห์ ตั้งแต่ปี ' + t0.slice(0, 4) + ')' })) + '</span></div>' +
        '<div><b>' + (dn[1] ? Math.round(dn[0] / dn[1] * 100) + '%' : '—') + '</b><span>' + esc(T({ en:'of spells when real yields fell ≥0.3 pt, gold rose (' + dn[1] + ' weeks)', th:'ของช่วงที่ยีลด์จริงลด ≥0.3 จุด ทองขึ้น (' + dn[1] + ' สัปดาห์)' })) + '</span></div>' +
        '<div><b>' + (isNum(corr) ? sg(corr, 2) : '—') + '</b><span>' + esc(T({ en:'last 26 weeks: ' + (corr < -0.2 ? 'normal link (yield up, gold down)' : corr > 0.2 ? 'unusual (both up or both down)' : 'little connection'), th:'26 สัปดาห์ล่าสุด: ' + (corr < -0.2 ? 'สัมพันธ์แบบปกติ (ยีลด์ขึ้น ทองลง)' : corr > 0.2 ? 'ผิดปกติ (ขึ้นหรือลงพร้อมกัน)' : 'แทบไม่สัมพันธ์กัน') })) + '</span></div></div>' +
      '<p class="bz-grw">' + esc(T({ en:'What to watch: if real yields start falling (e.g. the Fed hints at cuts, inflation expectations rise faster than bond yields), gold usually turns up. The price model uses about ' + f(A.beta.real * 100, 1) + '% per +1 pt of real yield.', th:'สิ่งที่ต้องจับตา: ถ้ายีลด์จริงเริ่มลง (เช่น เฟดส่งสัญญาณลดดอกเบี้ย หรือเงินเฟ้อคาดการณ์ขึ้นเร็วกว่ายีลด์พันธบัตร) ทองมักกลับขึ้น โมเดลราคาใช้ผลราว ' + f(A.beta.real * 100, 1) + '% ต่อยีลด์จริง +1 จุด' })) + '</p></div>';
    return '<div class="bz-gr">' + '<div class="bz-grc">' + chart + '</div>' + side + '</div>';
  }
  function pxChart(o){
    var W = 1100, H = 580, P = { l:14, r:96, t:70, b:34 }, a = o.a, col = o.N.col, lg = !!o.log;
    var pts = o.price.map(function(p){ return { t:p[0], v:p[1], x:tms(p[0]) }; }), fcs = o.fc.map(function(q){ var r = Object.assign({}, q); r.x = tms(q.t); return r; });
    var x0 = pts[0].x, xNow = tms(o.now.t), xEnd = fcs.length ? fcs[fcs.length - 1].x : xNow;
    xEnd = xEnd + (xEnd - x0) * 0.02;
    var vs = pts.map(function(p){ return p.v; });
    fcs.forEach(function(q){ vs.push(q.lo, q.hi); });
    var lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
    if(o.res && o.res.p < hi * 1.15) hi = Math.max(hi, o.res.p); if(o.sup && o.sup.p > lo * 0.85) lo = Math.min(lo, o.sup.p);
    var tf = function(v){ return lg ? Math.log10(Math.max(v, 1e-9)) : v; };
    var y0 = tf(lo), y1 = tf(hi), pad = (y1 - y0) * 0.07; y0 -= pad; y1 += pad * 1.6;
    var X = function(x){ return P.l + (x - x0) / (xEnd - x0) * (W - P.l - P.r); }, Y = function(v){ return P.t + (1 - (tf(v) - y0) / (y1 - y0)) * (H - P.t - P.b); };
    var id = 'c' + (++chN), g = '';
    g += '<defs><linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".38"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a78bfa" stop-opacity=".05"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".14"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><rect x="' + P.l + '" y="' + P.t + '" width="' + (W - P.l - P.r) + '" height="' + (H - P.t - P.b) + '"/></clipPath></defs>';
    /* y grid + right-hand price scale */
    var ticks = [];
    if(lg){ [1, 2, 5].forEach(function(m){ for(var e = 0; e < 7; e++){ var v = m * Math.pow(10, e); if(tf(v) >= y0 && tf(v) <= y1) ticks.push(v); } }); ticks.sort(function(p, q){ return p - q; }); }
    else ticks = niceTicks(y0, y1, 6);
    ticks.forEach(function(v){ var yy = Y(v); g += '<line class="bz-gl" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '"/><text class="bz-ax" x="' + (W - P.r + 8) + '" y="' + (yy + 4).toFixed(1) + '">' + pxShort(v, a) + '</text>'; });
    /* x labels */
    var span = (xEnd - x0) / 864e5, stepM = span > 2500 ? 24 : span > 1200 ? 6 : span > 500 ? 3 : 2, d0 = new Date(x0), mm = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + 1, 1));
    while(mm.getTime() < xEnd){
      if(mm.getUTCMonth() % stepM === 0 || (stepM >= 12 && mm.getUTCMonth() === 0)){
        var xx = X(mm.getTime()); g += '<line class="bz-gl v" x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + P.t + '" y2="' + (H - P.b) + '"/><text class="bz-ax" x="' + xx.toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle">' + esc(span > 1200 ? String(mm.getUTCFullYear() + (L() === 'th' ? 543 : 0)) : mshort(mm.toISOString().slice(0, 10))) + '</text>';
      }
      mm = new Date(Date.UTC(mm.getUTCFullYear(), mm.getUTCMonth() + 1, 1));
    }
    /* forecast zone */
    g += '<rect x="' + X(xNow).toFixed(1) + '" y="' + P.t + '" width="' + (X(xEnd) - X(xNow)).toFixed(1) + '" height="' + (H - P.t - P.b) + '" fill="url(#' + id + 'f)"/><text class="bz-pxzone" x="' + (X(xNow) + 10).toFixed(1) + '" y="' + (P.t + 16) + '">' + esc(T({ en:'FORECAST →', th:'คาดการณ์ →' })) + '</text>';
    g += '<g clip-path="url(#' + id + 'c)">';
    /* support / resistance */
    [[o.sup, '#34d399', { en:'support', th:'แนวรับ' }], [o.res, '#fb7185', { en:'resistance', th:'แนวต้าน' }]].forEach(function(z){ if(!z[0]) return; var yy = Y(z[0].p); g += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + z[1] + '" stroke-width="1.3" stroke-dasharray="7 5" opacity=".85"/>'; });
    /* price area + line */
    var d = pts.map(function(p, i){ return (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join('');
    g += '<path d="' + d + 'L' + X(pts[pts.length - 1].x).toFixed(1) + ' ' + (H - P.b) + 'L' + X(pts[0].x).toFixed(1) + ' ' + (H - P.b) + 'Z" fill="url(#' + id + 'a)"/>';
    [[o.ma200, '#a78bfa', '6 4'], [o.ma50, '#22d3ee', '']].forEach(function(m){ if(!m[0] || m[0].length < 2) return; g += '<path d="' + m[0].map(function(p, i){ return (i ? 'L' : 'M') + X(tms(p[0])).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('') + '" fill="none" stroke="' + m[1] + '" stroke-width="1.5"' + (m[2] ? ' stroke-dasharray="' + m[2] + '"' : '') + ' opacity=".9"/>'; });
    g += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linejoin="round"/>';
    /* forecast fan */
    if(fcs.length){
      var f0 = [{ x:xNow, v:o.now.p, lo:o.now.p, hi:o.now.p, lo2:o.now.p, hi2:o.now.p }].concat(fcs);
      var band = function(k1, k2){ return 'M' + f0.map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q[k2]).toFixed(1); }).join('L') + 'L' + f0.slice().reverse().map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q[k1]).toFixed(1); }).join('L') + 'Z'; };
      g += '<path d="' + band('lo2', 'hi2') + '" fill="#a78bfa" opacity=".14"/><path d="' + band('lo', 'hi') + '" fill="#a78bfa" opacity=".28"/>';
      var wk = Math.max(8, Math.round((f0[f0.length - 1].x - xNow) / (7 * 864e5)));
      simPaths(f0, 4, wk, true, a + o.now.t + Math.round(o.now.p)).forEach(function(pth, k){ g += '<path d="' + pth.map(function(q, j){ return (j ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join('') + '" fill="none" stroke="' + ['#e9d5ff', '#c4b5fd', '#a5b4fc', '#f0abfc'][k] + '" stroke-width="1.2" opacity=".5" stroke-linejoin="round" pathLength="1" class="bz-pxsim"/>'; });
      g += '<path d="M' + f0.map(function(q){ return X(q.x).toFixed(1) + ' ' + Y(q.v).toFixed(1); }).join('L') + '" fill="none" stroke="#c4b5fd" stroke-width="2.8" stroke-dasharray="7 5"/>';
    }
    g += '</g>';
    /* notable points: high / low in view */
    var ih = 0, il = 0; pts.forEach(function(p, i){ if(p.v > pts[ih].v) ih = i; if(p.v < pts[il].v) il = i; });
    [[ih, { en:'high', th:'สูงสุด' }, -12], [il, { en:'low', th:'ต่ำสุด' }, 20]].forEach(function(m){ var p = pts[m[0]]; if(!p || m[0] === pts.length - 1) return; var xx = X(p.x), yy = Y(p.v), anc = xx < P.l + 90 ? 'start' : xx > W - P.r - 90 ? 'end' : 'middle'; g += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3.5" fill="' + col + '"/><text class="bz-pxnote" x="' + xx.toFixed(1) + '" y="' + (yy + m[2]).toFixed(1) + '" text-anchor="' + anc + '">' + esc(T(m[1])) + ' ' + pxMoney(p.v, a) + ' · ' + esc(dshort(p.t)) + '</text>'; });
    /* forecast points with callouts */
    var lastLX = X(xNow) + 18;
    fcs.forEach(function(q, i){
      var xx = X(q.x), yy = Y(q.v), up = q.v >= o.now.p, ch = (q.v / o.now.p - 1) * 100;
      g += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="5" fill="#c4b5fd" stroke="var(--bz-bgc,#0b0f17)" stroke-width="2"/>';
      if(xx - lastLX < 84 && i < fcs.length - 1) return;
      lastLX = xx;
      var above = q.v >= o.now.p ? true : false; if(i % 2) above = !above; var by = above ? yy - 42 : yy + 14, bw = 92, bx = Math.min(W - P.r - bw - 2, Math.max(P.l, xx - bw / 2));
      g += '<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + (above ? yy - 6 : yy + 6).toFixed(1) + '" y2="' + (above ? by + 32 : by).toFixed(1) + '" stroke="#c4b5fd" stroke-width="1" opacity=".6"/>' +
        '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + bw + '" height="32" rx="8" class="bz-pxcall"/>' +
        '<text x="' + (bx + bw / 2).toFixed(1) + '" y="' + (by + 13).toFixed(1) + '" text-anchor="middle" class="bz-pxcl1">' + esc(T(q.lab)) + ' · <tspan class="' + (up ? 'u' : 'd') + '">' + spc(ch, 1) + '</tspan></text>' +
        '<text x="' + (bx + bw / 2).toFixed(1) + '" y="' + (by + 27).toFixed(1) + '" text-anchor="middle" class="bz-pxcl2">' + pxMoney(q.v, a) + '</text>';
    });
    /* today marker */
    var nx = X(xNow), ny = Y(o.now.p);
    g += '<line x1="' + nx.toFixed(1) + '" x2="' + nx.toFixed(1) + '" y1="' + P.t + '" y2="' + (H - P.b) + '" stroke="var(--white)" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>' +
      '<circle cx="' + nx.toFixed(1) + '" cy="' + ny.toFixed(1) + '" r="13" fill="' + col + '" opacity=".22" class="bz-pxpulse"/><circle cx="' + nx.toFixed(1) + '" cy="' + ny.toFixed(1) + '" r="6" fill="' + col + '" stroke="#fff" stroke-width="2"/>';
    /* the NOW label sits in the top margin so it never covers the price line */
    var bw2 = 168, bx2 = Math.max(P.l, nx - bw2 + 20), byy = 12;
    g += '<line x1="' + nx.toFixed(1) + '" y1="' + (byy + 42).toFixed(1) + '" x2="' + nx.toFixed(1) + '" y2="' + P.t + '" stroke="' + col + '" stroke-width="1.6"/>';
    g += '<rect x="' + bx2.toFixed(1) + '" y="' + byy.toFixed(1) + '" width="' + bw2 + '" height="42" rx="10" fill="' + col + '"/><text x="' + (bx2 + 12).toFixed(1) + '" y="' + (byy + 16).toFixed(1) + '" class="bz-pxnowt">' + esc(T({ en:'NOW', th:'ตอนนี้' })) + ' · ' + esc(dshort(o.now.t)) + '</text><text x="' + (bx2 + 12).toFixed(1) + '" y="' + (byy + 34).toFixed(1) + '" class="bz-pxnowv">' + pxMoney(o.now.p, a) + '</text>';
    /* right-axis badges: now + 12M */
    var badge = function(v, c, txt){ var yy = Y(v); return '<rect x="' + (W - P.r + 2) + '" y="' + (yy - 10).toFixed(1) + '" width="' + (P.r - 4) + '" height="20" rx="6" fill="' + c + '"/><text x="' + (W - P.r + 8) + '" y="' + (yy + 4).toFixed(1) + '" class="bz-pxbadge">' + txt + '</text>'; };
    var used = [Y(o.now.p)];
    var lvlBadge = function(z, c, lab){ if(!z) return; var yy = Y(z.p); if(used.some(function(u){ return Math.abs(u - yy) < 21; })) return; used.push(yy); g += '<rect x="' + (W - P.r + 2) + '" y="' + (yy - 10).toFixed(1) + '" width="' + (P.r - 4) + '" height="20" rx="6" fill="var(--bz-bgc,#0b0f17)" stroke="' + c + '"/><text x="' + (W - P.r + 8) + '" y="' + (yy + 4).toFixed(1) + '" class="bz-pxbadge" fill="' + c + '" style="fill:' + c + '">' + esc(T(lab)) + ' ' + pxShort(z.p, a) + '</text>'; };
    g += badge(o.now.p, col, pxShort(o.now.p, a));
    lvlBadge(o.res, '#fb7185', { en:'R', th:'ต้าน' }); lvlBadge(o.sup, '#34d399', { en:'S', th:'รับ' });
    if(fcs.length){ var lq = fcs[fcs.length - 1]; if(!used.some(function(u){ return Math.abs(u - Y(lq.v)) < 21; })) g += badge(lq.v, '#8b5cf6', pxShort(lq.v, a)); }
    /* hover: reuse the board's crosshair / tooltip */
    var ser = [{ name:o.N, color:col, pts:pts.map(function(p){ var r = [p.t, p.v]; r.x = p.x; return r; }), fc:fcs.map(function(q){ return { t:q.t, x:q.x, v:q.v, lo:q.lo, hi:q.hi }; }) }];
    CH[id] = { ser:ser, X:X, Y:Y, x0:x0, x1:xEnd, W:W, H:H, P:P, unit:'', dec:a === 'btc' ? 0 : 1, fmt:function(v){ return pxMoney(v, a) + ' <small>(' + spc((v / o.now.p - 1) * 100, 1) + ' ' + T({ en:'vs now', th:'เทียบวันนี้' }) + ')</small>'; }, fmtR:function(v){ return pxMoney(v, a); } };
    return '<div class="bz-chart bz-pxc" data-ch="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + '" class="bz-svg">' + g + '<line class="bz-xh" x1="0" x2="0" y1="' + P.t + '" y2="' + (H - P.b) + '" style="display:none"/></svg><div class="bz-tip" hidden></div></div>';
  }
  function vPxOne(a){
    var P = X('px'), A = P && P[a]; if(!A) return noExt();
    var N = PXN[a], LV = pxLive(A, a), fc = pxFc(A, a, LV), Tr = A.trend, Lv = A.levels, thb = (D.m && D.m.ccy && D.m.ccy.THB && D.m.ccy.THB.rate) || (P.thb && P.thb[1]);
    var toThb = function(v){ return a === 'gold' ? v * thb * 15.244 / 31.1035 * 0.965 : v * thb; };
    var fl = flow(a === 'gold' ? 'GLD' : 'BTC-USD') || {}, f12 = fc[fc.length - 1], f6 = fc[3], f1 = fc[1];
    var sc = Tr.score, all = (sc.short + sc.medium * 1.5 + sc.long * 2) / 4.5, ov = tlab(all);
    var h = '';
    /* hero */
    var recon = all < -0.4 && f12.e > 0.02 ? { en:'Price is still trending down, but over a full year the slower forces (long-run growth, pull-back to the average' + (a === 'btc' ? ', halving cycle' : '') + ') point higher.', th:'ราคายังเป็นขาลงอยู่ แต่เมื่อมองทั้งปี ปัจจัยที่ช้ากว่า (การเติบโตระยะยาว แรงดึงกลับหาค่าเฉลี่ย' + (a === 'btc' ? ' วัฏจักรฮาล์ฟวิ่ง' : '') + ') ชี้ขึ้น' } : all > 0.4 && f12.e < -0.02 ? { en:'Price is trending up, but the slower forces point lower over a year — the rally may be stretched.', th:'ราคายังเป็นขาขึ้น แต่ปัจจัยระยะยาวชี้ลงในรอบปี ขาขึ้นอาจยืดเกินไปแล้ว' } : all > 0.4 ? { en:'Trend and forecast agree: higher.', th:'แนวโน้มและคาดการณ์ไปทางเดียวกัน: ขึ้น' } : all < -0.4 ? { en:'Trend and forecast agree: weak.', th:'แนวโน้มและคาดการณ์ไปทางเดียวกัน: อ่อนตัว' } : { en:'No clear trend — the forecast leans on slower forces.', th:'ยังไม่มีแนวโน้มชัด คาดการณ์อิงปัจจัยระยะยาวเป็นหลัก' };
    /* hero (2026-10-26 c): price + 6-month sparkline on the left; odds ring, 12-month target and trend on the right */
    var sp = A.hist_d.slice(-130).map(function(x){ return x[1]; }); if(LV.src === 'live') sp.push(LV.p);
    var spMin = Math.min.apply(null, sp), spMax = Math.max.apply(null, sp), SW = 520, SH = 92;
    var spd = sp.map(function(v, i){ return (i ? 'L' : 'M') + (i / (sp.length - 1) * SW).toFixed(1) + ' ' + (SH - 6 - (v - spMin) / (spMax - spMin || 1) * (SH - 14)).toFixed(1); }).join('');
    var sparkSvg = '<svg class="bz-pxspk" viewBox="0 0 ' + SW + ' ' + SH + '" preserveAspectRatio="none"><defs><linearGradient id="pxsg' + a + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + N.col + '" stop-opacity=".45"/><stop offset="1" stop-color="' + N.col + '" stop-opacity="0"/></linearGradient></defs><path d="' + spd + 'L' + SW + ' ' + SH + 'L0 ' + SH + 'Z" fill="url(#pxsg' + a + ')"/><path d="' + spd + '" fill="none" stroke="' + N.col + '" stroke-width="2.4" vector-effect="non-scaling-stroke"/></svg>';
    var d1 = fl.d1, ring = function(p){ var r = 46, c = 2 * Math.PI * r, v = clamp(p, 0, 100) / 100; return '<svg viewBox="0 0 120 120" class="bz-pxring"><circle cx="60" cy="60" r="' + r + '" fill="none" stroke="var(--bz-card2)" stroke-width="12"/><circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + (p >= 55 ? '#34d399' : p <= 45 ? '#fb7185' : '#fbbf24') + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (c * v).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 60 60)"/><text x="60" y="60" text-anchor="middle" class="bz-pxrv">' + f(p, 0) + '%</text><text x="60" y="78" text-anchor="middle" class="bz-pxrl">' + esc(T({ en:'higher in 6M', th:'สูงขึ้นใน 6 ด.' })) + '</text></svg>'; };
    var lo = Math.min(f12.lo, LV.p), hi = Math.max(f12.hi, LV.p), pos = function(v){ return clamp((v - lo) / (hi - lo || 1) * 100, 0, 100).toFixed(1); };
    h += '<div class="bz-pxh2 ' + a + '"><div class="bz-pxh2l">' +
      '<div class="bz-pxh2n"><i>' + ico(N.ic) + '</i><div><b>' + esc(T(N)) + '</b><em>' + esc(T(N.unit)) + ' · ' + (a === 'gold' ? 'COMEX GC=F' : 'BTC-USD') + '</em></div><span class="bz-pxlive ' + LV.src + '">' + esc(T(LV.src === 'live' ? { en:'live', th:'ล่าสุด' } : { en:'close', th:'ราคาปิด' })) + ' · ' + esc(dshort(LV.t)) + '</span></div>' +
      '<div class="bz-pxh2p"><b>' + pxMoney(LV.p, a) + '</b>' + (isNum(d1) ? '<span class="' + (d1 >= 0 ? 'up' : 'dn') + '">' + (d1 >= 0 ? '▲ ' : '▼ ') + spc(d1, 2) + ' ' + esc(T({ en:'today', th:'วันนี้' })) + '</span>' : '') + '</div>' +
      '<div class="bz-pxh2s">' + sparkSvg + '<span class="hi">' + pxMoney(spMax, a) + '</span><span class="lo">' + pxMoney(spMin, a) + '</span><span class="ln">' + esc(T({ en:'last 6 months', th:'6 เดือนล่าสุด' })) + '</span></div>' +
      '<div class="bz-pxh2c">' + [['1M', Tr.m1], ['3M', Tr.m3], ['6M', Tr.m6], ['1Y', Tr.m12], [T({ en:'from ATH', th:'จากจุดสูงสุด' }), Tr.dd]].map(function(x){ return '<span class="' + (x[1] >= 0 ? 'up' : 'dn') + '"><small>' + esc(x[0]) + '</small>' + spc(x[1], 1) + '</span>'; }).join('') + '</div>' +
      '<div class="bz-pxh2t">' + (a === 'gold' ? '<b>' + esc(T({ en:'Thai gold ≈ ', th:'ทองไทย ≈ ' })) + pxThb(toThb(LV.p)) + '</b> ' + esc(T({ en:'per baht-weight (96.5%)', th:'ต่อบาททองคำ (96.5%)' })) : '<b>' + esc(T({ en:'≈ ', th:'≈ ' })) + pxThb(toThb(LV.p)) + '</b> ' + esc(T({ en:'per coin', th:'ต่อเหรียญ' }))) + '<small>' + esc(T({ en:'world price × ' + f(thb, 2) + ' THB/$', th:'ราคาโลก × ' + f(thb, 2) + ' บาท/ดอลลาร์' })) + '</small></div></div>' +
      '<div class="bz-pxh2r"><div class="bz-pxh2g">' + ring(f6.pup) + '<div class="bz-pxh2o"><div><span>' + esc(T({ en:'+10% or more', th:'ขึ้น 10% ขึ้นไป' })) + '</span>' + bar(f6.p10u, 'good') + '<b>' + f(f6.p10u, 0) + '%</b></div><div><span>' + esc(T({ en:'−10% or worse', th:'ลง 10% ขึ้นไป' })) + '</span>' + bar(f6.p10d, 'bad') + '<b>' + f(f6.p10d, 0) + '%</b></div><div class="bz-pxtr2 ' + ov.c + '"><span>' + esc(T({ en:'Trend', th:'แนวโน้ม' })) + '</span><b>' + esc(T(ov)) + '</b></div></div></div>' +
      '<div class="bz-pxh2x"><span>' + esc(T({ en:'Target in 12 months', th:'เป้าหมาย 12 เดือน' })) + '</span><b>' + pxMoney(f12.mid, a) + ' <em class="' + (f12.e >= 0 ? 'up' : 'dn') + '">' + spc((Math.exp(f12.e) - 1) * 100, 1) + '</em></b>' +
      '<div class="bz-pxh2bar"><i style="left:' + pos(f12.lo) + '%;right:' + (100 - pos(f12.hi)) + '%"></i><u class="now" style="left:' + pos(LV.p) + '%"><small>' + esc(T({ en:'now', th:'ตอนนี้' })) + '</small></u><u class="tg" style="left:' + pos(f12.mid) + '%"><small>' + esc(T({ en:'target', th:'เป้า' })) + '</small></u></div>' +
      '<small>' + esc(T({ en:'68% range ', th:'ช่วง 68% ' })) + pxMoney(f12.lo, a) + ' – ' + pxMoney(f12.hi, a) + '</small></div>' +
      '<p class="bz-pxh2m">' + esc(T(recon)) + '</p></div></div>';
    /* big chart */
    var rng = PX.r, cut = { '6m':183, '1y':366, '3y':1100, 'all':20000 }[rng] || 366;
    var lastT = A.last[0], t0 = addDays(lastT, -cut);
    var src = rng === 'all' ? A.hist_w.map(function(x){ return [x[0], x[1]]; }) : A.hist_d.filter(function(x){ return x[0] >= t0; });
    var price = src.map(function(x){ return [x[0], x[1] * (x[0] === lastT ? LV.k : 1)]; });
    if(LV.src === 'live' && LV.t > lastT) price.push([LV.t, LV.p]);
    var t1 = price[price.length - 1][0];
    var fcPtsX = fc.map(function(q){ return { t:addDays(t1, q.d), v:q.mid, lo:q.lo, hi:q.hi, lo2:q.lo2, hi2:q.hi2, lab:q.lab, d:q.d, e:q.e }; });
    if(rng === '6m') fcPtsX = fcPtsX.filter(function(q){ return q.d <= 182; });
    var gapOk = function(v){ return Math.abs(v / LV.p - 1) > 0.012; };
    var r1 = (Lv.res || []).filter(function(r){ return gapOk(r.p); })[0], s1 = (Lv.sup || []).filter(function(r){ return gapOk(r.p); })[0];
    h += '<div class="bz-sec bz-pxchart"><h4>' + ico('trend') + esc(T({ en:N.en + ' — price, trend and forecast', th:N.th + ' — ราคา แนวโน้ม และคาดการณ์' })) + '<span class="bz-pxr">' + [['6m', '6M'], ['1y', '1Y'], ['3y', '3Y'], ['all', T({ en:'All', th:'ทั้งหมด' })]].map(function(r){ return '<button type="button" data-pxr="' + r[0] + '" class="' + (rng === r[0] ? 'on' : '') + '">' + esc(r[1]) + '</button>'; }).join('') + '</span></h4>' +
      pxChart({ a:a, N:N, price:price, ma50:rng === 'all' ? [] : src.filter(function(x){ return isNum(x[2]); }).map(function(x){ return [x[0], x[2]]; }), ma200:rng === 'all' ? [] : src.filter(function(x){ return isNum(x[3]); }).map(function(x){ return [x[0], x[3]]; }),
        fc:fcPtsX, now:{ t:t1, p:LV.p }, res:rng === 'all' ? null : r1, sup:rng === 'all' ? null : s1, Tr:Tr, log:rng === 'all' && a === 'btc' }) +
      '<div class="bz-pxleg"><span><i style="background:' + N.col + '"></i>' + esc(T({ en:'price', th:'ราคา' })) + '</span>' + (rng === 'all' ? '' : '<span><i style="background:#22d3ee"></i>' + esc(T({ en:'50-day average', th:'เฉลี่ย 50 วัน' })) + '</span><span><i class="d" style="background:#a78bfa"></i>' + esc(T({ en:'200-day average', th:'เฉลี่ย 200 วัน' })) + '</span>') + '<span><i style="background:rgba(167,139,250,.45)"></i>' + esc(T({ en:'forecast 68%', th:'คาดการณ์ 68%' })) + '</span><span><i style="background:rgba(167,139,250,.18)"></i>' + esc(T({ en:'forecast 95%', th:'คาดการณ์ 95%' })) + '</span><span><i class="d" style="background:#34d399"></i>' + esc(T({ en:'support', th:'แนวรับ' })) + '</span><span><i class="d" style="background:#fb7185"></i>' + esc(T({ en:'resistance', th:'แนวต้าน' })) + '</span><span class="sim"><i></i>' + esc(T({ en:'thin lines = 4 example paths the price could take (not predictions)', th:'เส้นบาง = ตัวอย่าง 4 เส้นทางที่ราคาอาจวิ่ง (ไม่ใช่คำทำนาย)' })) + '</span></div>' +
      note({ en:'Move the mouse (or finger) over the chart to read the price on any day; in the purple zone it shows the forecast and its range.', th:'เลื่อนเมาส์ (หรือนิ้ว) บนกราฟเพื่อดูราคาวันไหนก็ได้ ในโซนสีม่วงจะแสดงราคาคาดการณ์และช่วงที่น่าจะเป็น' }) + '</div>';
    /* path strip: now -> each horizon */
    h += '<div class="bz-pxpath"><div class="now"><span>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</span><b>' + pxMoney(LV.p, a) + '</b><em>' + esc(dshort(LV.t)) + '</em></div>' + fc.map(function(q){ var ch = (Math.exp(q.e) - 1) * 100; return '<i>→</i><div class="' + (ch >= 0 ? 'up' : 'dn') + '"><span>' + esc(T(q.lab)) + '</span><b>' + pxMoney(q.mid, a) + '</b><em>' + spc(ch, 1) + '</em><small>' + esc(dshort(addDays(LV.t, q.d))) + '</small></div>'; }).join('') + '</div>';
    /* playbook: what to watch from the key levels, with odds from the 1-month forecast */
    var q1 = fc[1], pAbove = function(lv){ return (1 - Phi((Math.log(lv / LV.p) - q1.e) / q1.s)) * 100; };
    var r2 = (Lv.res || []).filter(function(r){ return r1 && r.p > r1.p * 1.01; })[0], s2 = (Lv.sup || []).filter(function(r){ return s1 && r.p < s1.p * 0.99; })[0];
    var plan = [];
    if(r1) plan.push({ c:'good', h:{ en:'If it closes above ' + pxMoney(r1.p, a), th:'ถ้าปิดเหนือ ' + pxMoney(r1.p, a) }, p:{ en:'Next resistance ' + (r2 ? pxMoney(r2.p, a) + ' (' + spc((r2.p / LV.p - 1) * 100, 1) + ')' : 'the 52-week high ' + pxMoney(Tr.hi52, a)) + '. Chance of trading above it within a month: ' + f(pAbove(r1.p), 0) + '%.', th:'แนวต้านถัดไป ' + (r2 ? pxMoney(r2.p, a) + ' (' + spc((r2.p / LV.p - 1) * 100, 1) + ')' : 'จุดสูงสุด 52 สัปดาห์ ' + pxMoney(Tr.hi52, a)) + ' โอกาสขึ้นไปเหนือระดับนี้ภายใน 1 เดือน ' + f(pAbove(r1.p), 0) + '%' } });
    if(r1 && s1) plan.push({ c:'mid', h:{ en:'Range to watch: ' + pxMoney(s1.p, a) + ' – ' + pxMoney(r1.p, a), th:'กรอบที่ต้องดู: ' + pxMoney(s1.p, a) + ' – ' + pxMoney(r1.p, a) }, p:{ en:'Chance it is still inside this range a month from now: ' + f(Math.max(0, pAbove(s1.p) - pAbove(r1.p)), 0) + '%. ' + (LV.p > Tr.ma200 ? 'Above the 200-day average (' + pxMoney(Tr.ma200, a) + '): the long trend is intact.' : 'Below the 200-day average (' + pxMoney(Tr.ma200, a) + '): reclaiming it would repair the long trend.'), th:'โอกาสที่อีก 1 เดือนราคายังอยู่ในกรอบนี้ ' + f(Math.max(0, pAbove(s1.p) - pAbove(r1.p)), 0) + '% ' + (LV.p > Tr.ma200 ? 'ราคายังอยู่เหนือเส้นเฉลี่ย 200 วัน (' + pxMoney(Tr.ma200, a) + ') แนวโน้มระยะยาวยังดี' : 'ราคาอยู่ใต้เส้นเฉลี่ย 200 วัน (' + pxMoney(Tr.ma200, a) + ') ถ้ากลับขึ้นไปได้ แนวโน้มระยะยาวจะฟื้น') } });
    if(s1) plan.push({ c:'bad', h:{ en:'If it closes below ' + pxMoney(s1.p, a), th:'ถ้าปิดต่ำกว่า ' + pxMoney(s1.p, a) }, p:{ en:'Next support ' + (s2 ? pxMoney(s2.p, a) + ' (' + spc((s2.p / LV.p - 1) * 100, 1) + ')' : 'the 52-week low ' + pxMoney(Tr.lo52, a)) + '. Chance of trading below it within a month: ' + f(100 - pAbove(s1.p), 0) + '%.', th:'แนวรับถัดไป ' + (s2 ? pxMoney(s2.p, a) + ' (' + spc((s2.p / LV.p - 1) * 100, 1) + ')' : 'จุดต่ำสุด 52 สัปดาห์ ' + pxMoney(Tr.lo52, a)) + ' โอกาสลงไปต่ำกว่าระดับนี้ภายใน 1 เดือน ' + f(100 - pAbove(s1.p), 0) + '%' } });
    if(plan.length) h += '<div class="bz-sec"><h4>' + ico('compass') + esc(T({ en:'What to watch next — levels and their odds', th:'จุดที่ต้องจับตาต่อไป — ระดับราคาและโอกาส' })) + '</h4><div class="bz-pxplan">' + plan.map(function(x){ return '<div class="' + x.c + '"><b>' + esc(T(x.h)) + '</b><p>' + esc(T(x.p)) + '</p></div>'; }).join('') + '</div>' + note({ en:'Odds come from the 1-month forecast range, so they already include the trend, the pull-back and the calibration.', th:'โอกาสคำนวณจากช่วงคาดการณ์ 1 เดือน จึงรวมแนวโน้ม แรงดึงกลับ และการปรับจากผลทดสอบย้อนหลังไว้แล้ว' }) + '</div>';
    /* horizon cards */
    h += '<div class="bz-pxfc">' + fc.map(function(q){
      var ch = (Math.exp(q.e) - 1) * 100;
      return '<div class="' + (ch >= 0 ? 'up' : 'dn') + '"><span>' + esc(T(q.lab)) + '</span><b>' + pxMoney(q.mid, a) + '</b><em>' + spc(ch, 1) + '</em>' +
        '<div class="bz-pxrg"><i style="left:' + clamp((q.lo - q.lo2) / (q.hi2 - q.lo2) * 100, 0, 100).toFixed(0) + '%;right:' + clamp((q.hi2 - q.hi) / (q.hi2 - q.lo2) * 100, 0, 100).toFixed(0) + '%"></i><u style="left:' + clamp((q.mid - q.lo2) / (q.hi2 - q.lo2) * 100, 0, 100).toFixed(0) + '%"></u></div>' +
        '<small>68%: ' + pxMoney(q.lo, a) + ' – ' + pxMoney(q.hi, a) + '</small><small>95%: ' + pxMoney(q.lo2, a) + ' – ' + pxMoney(q.hi2, a) + '</small>' +
        '<ul><li><span>' + esc(T({ en:'chance higher', th:'โอกาสสูงขึ้น' })) + '</span><b>' + f(q.pup, 0) + '%</b></li><li><span>' + esc(T(a === 'gold' ? { en:'Thai gold', th:'ทองไทย' } : { en:'in baht', th:'เป็นเงินบาท' })) + '</span><b>' + pxThb(toThb(q.mid)) + '</b></li></ul></div>';
    }).join('') + '</div>';
    /* why */
    var CN = [['base', { en:'Long-run drift', th:'การเติบโตระยะยาว' }], ['mom', { en:'Trend (momentum)', th:'แนวโน้ม (โมเมนตัม)' }], ['mr', { en:'Pull back to the 200-day', th:'แรงดึงกลับหาเส้น 200 วัน' }], ['seas', { en:'Seasonality', th:'ฤดูกาล' }]].concat(a === 'btc' ? [['halv', { en:'Halving cycle', th:'วัฏจักรฮาล์ฟวิ่ง' }]] : []).concat([['macro', a === 'gold' ? { en:'Real yields + dollar', th:'ยีลด์จริง + ดอลลาร์' } : { en:'Nasdaq (risk appetite)', th:'Nasdaq (ความกล้าเสี่ยง)' }]]);
    var mx = 0; fc.forEach(function(q){ CN.forEach(function(c){ var v = c[0] === 'macro' ? q.macro.v * 100 : q.comp[c[0]] || 0; mx = Math.max(mx, Math.abs(v)); }); });
    var why = '<div class="bz-tw"><table class="bz-tbl bz-pxwhy"><thead><tr><th></th>' + fc.map(function(q){ return '<th>' + esc(T(q.lab)) + '</th>'; }).join('') + '</tr></thead><tbody>' + CN.map(function(c){
      return '<tr><td>' + esc(T(c[1])) + '</td>' + fc.map(function(q){ var v = c[0] === 'macro' ? q.macro.v * 100 : q.comp[c[0]] || 0; return '<td><span class="bz-pxbar ' + (v >= 0 ? 'up' : 'dn') + '"><i style="width:' + (Math.abs(v) / (mx || 1) * 100).toFixed(0) + '%"></i></span>' + sg(v, 1) + '</td>'; }).join('') + '</tr>';
    }).join('') + '<tr class="tot"><td><b>' + esc(T({ en:'Total (log %)', th:'รวม (% แบบลอการิทึม)' })) + '</b></td>' + fc.map(function(q){ return '<td><b class="' + (q.e >= 0 ? 'up' : 'dn') + '">' + sg(q.e * 100, 1) + '</b></td>'; }).join('') + '</tr></tbody></table></div>';
    var c0 = A.fc[4], m6 = fc[3].macro, bullets = [
      { en:'Long-run drift: half of ' + N.en.toLowerCase() + '\'s own growth over the last ' + (a === 'gold' ? '10' : '4') + ' years, capped — so a past boom is not simply extended.', th:'การเติบโตระยะยาว: ครึ่งหนึ่งของการเติบโตของ' + N.th + 'เองในช่วง ' + (a === 'gold' ? '10' : '4') + ' ปีที่ผ่านมา และมีเพดาน เพื่อไม่ให้ต่อเส้นช่วงพุ่งแรงในอดีตออกไปตรงๆ' },
      { en:'Trend: the 12-month move is ' + sg(c0.z12, 1) + ' and the 3-month move ' + sg(c0.z3, 1) + ' “volatility units”; trends tend to persist a little (time-series momentum).', th:'แนวโน้ม: การขยับ 12 เดือนเท่ากับ ' + sg(c0.z12, 1) + ' และ 3 เดือนเท่ากับ ' + sg(c0.z3, 1) + ' “หน่วยความผันผวน” แนวโน้มมักไปต่ออีกเล็กน้อย (โมเมนตัม)' },
      { en:'Pull-back: only the part of the gap to the 200-day average that is bigger than usual is expected to close, 35% over about 6 months.', th:'แรงดึงกลับ: คาดว่าเฉพาะส่วนของระยะห่างจากเส้นเฉลี่ย 200 วันที่มากกว่าปกติจะถูกปิด 35% ในราว 6 เดือน' },
      { en:'Seasonality: the average of the calendar months ahead versus a normal month, at half weight.', th:'ฤดูกาล: ค่าเฉลี่ยของเดือนที่กำลังจะมาถึงเทียบเดือนปกติ ให้น้ำหนักครึ่งเดียว' }
    ];
    if(a === 'btc') bullets.push({ en:'Halving cycle: what bitcoin did from day ' + (A.halving && A.halving.now_day) + ' after earlier halvings, 35% weight (newer cycles count more).', th:'วัฏจักรฮาล์ฟวิ่ง: บิตคอยน์เคยไปทางไหนจากวันที่ ' + (A.halving && A.halving.now_day) + ' หลังฮาล์ฟวิ่งครั้งก่อนๆ ให้น้ำหนัก 35% (รอบหลังนับมากกว่า)' });
    bullets.push(a === 'gold' ? { en:'Macro: gold moves about ' + f(A.beta.real * 100, 1) + '% per +1 pt in real yields and ' + f(A.beta.dollar, 2) + '% per 1% dollar move (fitted on monthly data since 2007). The board expects real yields ' + sg(m6.dRe, 2) + ' pt and the dollar ' + spc(m6.dx, 1) + ' in 6 months; half of that effect is used.', th:'เศรษฐกิจมหภาค: ทองขยับราว ' + f(A.beta.real * 100, 1) + '% ต่อยีลด์จริง +1 จุด และ ' + f(A.beta.dollar, 2) + '% ต่อดอลลาร์ขยับ 1% (คำนวณจากข้อมูลรายเดือนตั้งแต่ 2007) สมองตลาดคาดว่าใน 6 เดือนยีลด์จริงจะ ' + sg(m6.dRe, 2) + ' จุด และดอลลาร์ ' + spc(m6.dx, 1) + ' ใช้ผลนี้ครึ่งเดียว' }
      : { en:'Macro: bitcoin\'s beta to the Nasdaq is ' + f(A.beta.qqq, 2) + ' (correlation ' + f(A.beta.corr, 2) + ', 2 years weekly). The board expects the Nasdaq ' + spc(m6.qqq, 1) + ' in 6 months; half of that effect is used.', th:'เศรษฐกิจมหภาค: บิตคอยน์มีเบต้าต่อ Nasdaq ' + f(A.beta.qqq, 2) + ' (ความสัมพันธ์ ' + f(A.beta.corr, 2) + ' รายสัปดาห์ 2 ปี) สมองตลาดคาด Nasdaq ' + spc(m6.qqq, 1) + ' ใน 6 เดือน ใช้ผลนี้ครึ่งเดียว' });
    bullets.push({ en:'Ranges: recent volatility blended into the 3-year average, then scaled by the walk-forward test so ~68% of past outcomes fell inside.', th:'ช่วงคาดการณ์: ความผันผวนล่าสุดผสมกับค่าเฉลี่ย 3 ปี แล้วปรับตามผลทดสอบย้อนหลังให้ผลจริงราว 68% ตกอยู่ในช่วง' });
    h += '<div class="bz-row"><div class="bz-sec s7"><h4>' + ico('flask') + esc(T({ en:'Why this forecast — each piece, in %', th:'ทำไมคาดการณ์ออกมาแบบนี้ — แยกทีละส่วน (%)' })) + '</h4>' + why + '<ul class="bz-basis">' + bullets.map(function(b){ return '<li>' + esc(T(b)) + '</li>'; }).join('') + '</ul></div>';
    /* scenarios 6M */
    var q6 = fc[3];
    h += '<div class="bz-sec s5"><h4>' + ico('radar') + esc(T({ en:'Three paths for the next 6 months', th:'3 เส้นทางใน 6 เดือนข้างหน้า' })) + '</h4><div class="bz-pxsc">' +
      '<div class="good"><span>' + esc(T({ en:'Bull case (1 in 6)', th:'กรณีดี (1 ใน 6)' })) + '</span><b>' + pxMoney(q6.hi, a) + '</b><em>' + spc((q6.hi / LV.p - 1) * 100, 1) + '</em></div>' +
      '<div class="mid"><span>' + esc(T({ en:'Base case', th:'กรณีกลาง' })) + '</span><b>' + pxMoney(q6.mid, a) + '</b><em>' + spc((q6.mid / LV.p - 1) * 100, 1) + '</em></div>' +
      '<div class="bad"><span>' + esc(T({ en:'Bear case (1 in 6)', th:'กรณีแย่ (1 ใน 6)' })) + '</span><b>' + pxMoney(q6.lo, a) + '</b><em>' + spc((q6.lo / LV.p - 1) * 100, 1) + '</em></div></div>' +
      '<ul class="bz-basis"><li>' + esc(T({ en:'Bull / bear = the edges of the 68% range: each has roughly a 1-in-6 chance of being beaten.', th:'กรณีดี/แย่ = ขอบของช่วง 68% แต่ละด้านมีโอกาสราว 1 ใน 6 ที่ราคาจะไปไกลกว่านั้น' })) + '</li><li>' + esc(T({ en:'Chance of +10% or more: ' + f(q6.p10u, 0) + '% · −10% or worse: ' + f(q6.p10d, 0) + '%.', th:'โอกาสขึ้น 10% ขึ้นไป ' + f(q6.p10u, 0) + '% · ลง 10% ขึ้นไป ' + f(q6.p10d, 0) + '%' })) + '</li></ul></div></div>';
    /* trend read */
    var tf = [['short', { en:'Short term (days–weeks)', th:'ระยะสั้น (วัน–สัปดาห์)' }, { en:'price vs 20-day · its slope · RSI · MACD', th:'ราคาเทียบเส้น 20 วัน · ความชัน · RSI · MACD' }], ['medium', { en:'Medium term (1–3 months)', th:'ระยะกลาง (1–3 เดือน)' }, { en:'price vs 50-day · its slope · 3-month move · 20 vs 50', th:'ราคาเทียบเส้น 50 วัน · ความชัน · 3 เดือน · เส้น 20 เทียบ 50' }], ['long', { en:'Long term (6–12 months)', th:'ระยะยาว (6–12 เดือน)' }, { en:'price vs 200-day · its slope · 12-month move · 50 vs 200', th:'ราคาเทียบเส้น 200 วัน · ความชัน · 12 เดือน · เส้น 50 เทียบ 200' }]];
    h += '<h3 class="bz-h3">' + ico('compass') + esc(T({ en:'Trend analysis', th:'วิเคราะห์แนวโน้ม' })) + '</h3><div class="bz-pxtf">' + tf.map(function(x){ var s = sc[x[0]], lb = tlab(s); return '<div class="' + lb.c + '"><span>' + esc(T(x[1])) + '</span><b>' + esc(T(lb)) + '</b><div class="bz-pxdots">' + [-2, -1, 0, 1, 2].map(function(v){ return '<i class="' + (Math.round(s) === v ? 'on' : '') + '"></i>'; }).join('') + '</div><small>' + esc(T(x[2])) + '</small></div>'; }).join('') + '</div>';
    var ind = [
      [{ en:'vs 20-day avg', th:'เทียบเส้น 20 วัน' }, spc((LV.p / Tr.ma20 - 1) * 100, 1), LV.p > Tr.ma20], [{ en:'vs 50-day avg', th:'เทียบเส้น 50 วัน' }, spc((LV.p / Tr.ma50 - 1) * 100, 1), LV.p > Tr.ma50], [{ en:'vs 200-day avg', th:'เทียบเส้น 200 วัน' }, spc((LV.p / Tr.ma200 - 1) * 100, 1), LV.p > Tr.ma200],
      [{ en:'RSI (14)', th:'RSI (14)' }, f(Tr.rsi, 0), Tr.rsi > 50, Tr.rsi >= 70 || Tr.rsi <= 30], [{ en:'MACD', th:'MACD' }, T(Tr.macd_up ? { en:'above signal', th:'เหนือเส้นสัญญาณ' } : { en:'below signal', th:'ใต้เส้นสัญญาณ' }), Tr.macd_up],
      [{ en:'Trend strength (60d)', th:'ความแรงของเทรนด์ (60 วัน)' }, f(Tr.er60 * 100, 0) + '/100', null], [{ en:'From all-time high', th:'จากจุดสูงสุดตลอดกาล' }, spc(Tr.dd, 1), Tr.dd > -10], [{ en:'52-week range position', th:'ตำแหน่งในกรอบ 52 สัปดาห์' }, f(Tr.pos52, 0) + '%', Tr.pos52 > 50],
      [{ en:'Volatility (20d, yearly)', th:'ความผันผวน (20 วัน ต่อปี)' }, f(Tr.vol20, 0) + '%', null, Tr.vol_pct > 85], [{ en:'55-day breakout', th:'เบรก 55 วัน' }, T(Tr.breakout > 0 ? { en:'up', th:'ขึ้น' } : Tr.breakout < 0 ? { en:'down', th:'ลง' } : { en:'inside range', th:'ยังอยู่ในกรอบ' }), Tr.breakout > 0 ? true : Tr.breakout < 0 ? false : null]
    ];
    h += '<div class="bz-row"><div class="bz-sec s7"><h4>' + ico('grid') + esc(T({ en:'Indicators', th:'ตัวชี้วัด' })) + '</h4><div class="bz-pxind">' + ind.map(function(x){ return '<div class="' + (x[3] ? 'mid' : x[2] === true ? 'good' : x[2] === false ? 'bad' : '') + '"><span>' + esc(T(x[0])) + '</span><b>' + esc(x[1]) + '</b></div>'; }).join('') + '</div>' +
      '<div class="bz-pxrange"><span>' + esc(T({ en:'52-week low', th:'ต่ำสุด 52 สัปดาห์' })) + ' ' + pxMoney(Tr.lo52, a) + '</span><i><u style="left:' + clamp(Tr.pos52, 0, 100) + '%"></u></i><span>' + esc(T({ en:'high', th:'สูงสุด' })) + ' ' + pxMoney(Tr.hi52, a) + '</span></div>' +
      (Tr.signals.length ? '<ul class="bz-pxsig">' + Tr.signals.map(function(s){ return '<li class="' + s.tone + '">' + esc(T(s)) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    /* key levels ladder */
    var lad = [].concat((Lv.res || []).slice().reverse().map(function(r){ return { k:'res', p:r.p, n:r.n, last:r.last }; }), [{ k:'now', p:LV.p }], (Lv.sup || []).map(function(r){ return { k:'sup', p:r.p, n:r.n, last:r.last }; }));
    h += '<div class="bz-sec s5"><h4>' + ico('layers') + esc(T({ en:'Key price levels', th:'ระดับราคาสำคัญ' })) + '</h4><div class="bz-pxlad">' + lad.map(function(x){
      return '<div class="' + x.k + '"><span>' + esc(T(x.k === 'res' ? { en:'Resistance', th:'แนวต้าน' } : x.k === 'sup' ? { en:'Support', th:'แนวรับ' } : { en:'Now', th:'ตอนนี้' })) + '</span><b>' + pxMoney(x.p, a) + '</b><em>' + (x.k === 'now' ? '' : spc((x.p / LV.p - 1) * 100, 1) + ' · ' + x.n + esc(T({ en:' touch' + (x.n > 1 ? 'es' : ''), th:' ครั้ง' }))) + '</em></div>';
    }).join('') + '</div><h6 class="bz-pxh6">' + esc(T({ en:'Fibonacci of the last big swing', th:'ฟีโบนัชชีของคลื่นใหญ่ล่าสุด' })) + ' <small>' + esc(T(Lv.fib.up ? { en:'up-swing', th:'ขาขึ้น' } : { en:'down-swing', th:'ขาลง' })) + ' ' + pxMoney(Lv.fib.from[1], a) + ' → ' + pxMoney(Lv.fib.to[1], a) + '</small></h6><div class="bz-pxfib">' + Lv.fib.lv.map(function(x){ var near = Math.abs(x[1] / LV.p - 1) < 0.02; return '<div class="' + (near ? 'near' : '') + '"><span>' + (x[0] * 100).toFixed(1) + '%</span><b>' + pxMoney(x[1], a) + '</b></div>'; }).join('') + '</div>' +
      note({ en:'Levels come from swing highs and lows of the last 18 months, grouped when close together; more touches = stronger. Fibonacci ' + (Lv.fib.up ? 'pull-backs' : 'bounces') + ' are measured on the 52-week ' + (Lv.fib.up ? 'low → high' : 'high → low') + ' swing.', th:'ระดับมาจากจุดกลับตัวสูง/ต่ำในช่วง 18 เดือน รวมกลุ่มที่อยู่ใกล้กัน ยิ่งแตะหลายครั้งยิ่งแข็งแรง ฟีโบนัชชีวัด' + (Lv.fib.up ? 'การย่อตัว' : 'การเด้งกลับ') + 'จากคลื่น 52 สัปดาห์ (' + (Lv.fib.up ? 'ต่ำ → สูง' : 'สูง → ต่ำ') + ')' }) + '</div></div>';
    /* seasonality + asset specific */
    var cm = new Date().getUTCMonth() + 1, sm = A.seas, smx = Math.max.apply(null, sm.map(function(x){ return Math.abs(x.avg || 0); })) || 1;
    var MN = L() === 'th' ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var seasH = '<div class="bz-pxseas">' + sm.map(function(x){ var v = x.avg || 0, hh = Math.abs(v) / smx * 34; return '<div class="' + (x.m === cm ? 'cur' : '') + '"><em>' + sg(v, 1) + '</em><i class="' + (v >= 0 ? 'up' : 'dn') + '" style="height:' + hh.toFixed(0) + '%;' + (v >= 0 ? 'bottom:50%' : 'top:50%') + '"></i><b>' + MN[x.m - 1] + '</b><small>' + f(x.up, 0) + '% ↑</small></div>'; }).join('') + '</div>';
    var spec = '';
    if(a === 'btc' && A.halving){
      var Hv = A.halving, dn = Math.round((tms(Hv.next) - Date.now()) / 864e5);
      spec = '<div class="bz-sec s7"><h4>' + ico('history') + esc(T({ en:'Halving cycles (each line starts at 100 on halving day, log scale)', th:'วัฏจักรฮาล์ฟวิ่ง (ทุกเส้นเริ่มที่ 100 ในวันฮาล์ฟวิ่ง สเกลลอการิทึม)' })) + '</h4>' + cycleChart(Hv) +
        note({ en:'Today is day ' + Hv.now_day + ' of the cycle that began ' + dshort(Hv.last) + '. Next halving ≈ ' + dshort(Hv.next) + ' (about ' + dn + ' days). Each cycle has been smaller than the last, which is why only 35% of the pattern is used.', th:'วันนี้คือวันที่ ' + Hv.now_day + ' ของรอบที่เริ่ม ' + dshort(Hv.last) + ' ฮาล์ฟวิ่งครั้งถัดไปราว ' + dshort(Hv.next) + ' (อีกประมาณ ' + dn + ' วัน) แต่ละรอบขึ้นน้อยลงกว่ารอบก่อน จึงใช้รูปแบบนี้แค่ 35%' }) + '</div>';
    }
    if(a === 'gold' && A.real && A.real.length > 20){
      h += '<div class="bz-row"><div class="bz-sec s12"><h4>' + ico('flame') + esc(T({ en:'Gold vs real yields — how to read them together', th:'ทองคำเทียบยีลด์จริง — อ่านคู่กันอย่างไร' })) + '<span class="bz-pxr bz-grtg"><button type="button" data-grinv="1" class="' + (GRINV ? 'on' : '') + '">' + esc(T({ en:'Inverted (bank style)', th:'กลับหัว (แบบสถาบัน)' })) + '</button><button type="button" data-grinv="0" class="' + (GRINV ? '' : 'on') + '">' + esc(T({ en:'Normal', th:'แกนปกติ' })) + '</button></span></h4>' + goldReal(A, N) + '</div></div>';
    }
    h += '<div class="bz-row">' + spec + '<div class="bz-sec ' + (spec ? 's5' : 's12') + '"><h4>' + ico('cal') + esc(T({ en:'Seasonality — average return by month', th:'ฤดูกาล — ผลตอบแทนเฉลี่ยรายเดือน' })) + '</h4>' + seasH + note({ en:'Since ' + A.first.slice(0, 4) + '. Highlighted = this month. “↑” = share of years the month was positive. Seasonality is weak — it only tilts the forecast a little.', th:'ตั้งแต่ปี ' + A.first.slice(0, 4) + ' ช่องที่เน้น = เดือนนี้ “↑” = สัดส่วนปีที่เดือนนั้นเป็นบวก ฤดูกาลมีผลน้อย ใช้แค่เอียงคาดการณ์เล็กน้อย' }) + '</div></div>';
    /* track record */
    var bt = A.bt, rows = fc.map(function(q){ var x = bt[String(q.d)]; if(!x) return ''; var imp = (1 - x.mae / x.mae0) * 100; return '<tr><td><b>' + esc(T(q.lab)) + '</b></td><td>' + f(x.mae, 1) + '%</td><td>' + f(x.mae0, 1) + '%</td><td class="' + (imp > 0 ? 'up' : 'dn') + '">' + spc(imp, 0) + '</td><td>' + pc(x.dir, 0) + '</td><td>' + pc(x.upbase, 0) + '</td><td class="' + (x.dir > x.upbase ? 'up' : 'dn') + '">' + sg(x.dir - x.upbase, 0) + '</td><td>' + pc(x.cov, 0) + '</td><td>' + x.n + '</td></tr>'; }).join('');
    var p30 = A.bt30 || [];
    h += '<div class="bz-row"><div class="bz-sec s7"><h4>' + ico('target') + esc(T({ en:'How accurate has this been? (walk-forward test since ' + (bt['30'] ? bt['30'].from.slice(0, 4) : '') + ')', th:'ที่ผ่านมาแม่นแค่ไหน? (ทดสอบย้อนหลังแบบเดินหน้า ตั้งแต่ ' + (bt['30'] ? bt['30'].from.slice(0, 4) : '') + ')' })) + '</h4><div class="bz-tw"><table class="bz-tbl big"><thead><tr><th></th><th>' + esc(T({ en:'Avg miss', th:'พลาดเฉลี่ย' })) + '</th><th>' + esc(T({ en:'“No change” miss', th:'เดาไม่เปลี่ยน' })) + '</th><th>' + esc(T({ en:'Better by', th:'ดีกว่า' })) + '</th><th>' + esc(T({ en:'Direction right', th:'ทิศถูก' })) + '</th><th>' + esc(T({ en:'“Always up” right', th:'เดาว่าขึ้นเสมอ' })) + '</th><th>' + esc(T({ en:'Edge', th:'ได้เปรียบ' })) + '</th><th>' + esc(T({ en:'In 68% range', th:'ในช่วง 68%' })) + '</th><th>n</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      note({ en:'Every week the model was re-run on prices known at the time and checked later. Prices are hard to forecast: beating “no change” by a few % and calling direction better than “always up” is a real edge. Short horizons are close to a coin flip — use them for ranges, not direction. (The macro piece is not in this test.)', th:'ทุกสัปดาห์ระบบรันโมเดลใหม่ด้วยราคาที่รู้ ณ ตอนนั้น แล้วตรวจกับของจริงภายหลัง ราคาคาดการณ์ยากมาก การชนะ “เดาไม่เปลี่ยน” ได้ไม่กี่ % และทายทิศได้ดีกว่า “เดาว่าขึ้นเสมอ” ถือว่ามีความได้เปรียบจริง กรอบสั้นใกล้เคียงการโยนเหรียญ ให้ใช้ดูช่วงราคามากกว่าทิศทาง (ส่วนเศรษฐกิจมหภาคไม่ได้รวมในการทดสอบนี้)' }) + '</div>' +
      '<div class="bz-sec s5"><h4>' + ico('history') + esc(T({ en:'1 month ahead: forecast vs what happened', th:'ล่วงหน้า 1 เดือน: คาดการณ์เทียบของจริง' })) + '</h4>' + lineChart({ series:[{ name:{ en:'Actual', th:'ของจริง' }, pts:p30.map(function(x){ return [x[0], x[1]]; }), color:N.col, w:2 }, { name:{ en:'Forecast made 1 month earlier', th:'ที่ทายไว้ 1 เดือนก่อน' }, pts:p30.map(function(x){ return [x[0], x[2]]; }), color:'#94a3b8', dash:'5 4', w:1.6 }], dec:0, h:260, legend:true }) + '</div></div>';
    return h;
  }
  function vPx(all){
    var P = X('px'); if(!P) return noExt();
    if(all) return ['gold', 'btc'].filter(function(a){ return P[a]; }).map(function(a, i){ return (i ? '<h3 class="bz-h3 bz-pxph">' + ico(PXN[a].ic) + esc(T(PXN[a])) + '</h3>' : '') + vPxOne(a); }).join('');
    var tabs = '<div class="bz-pxtabs">' + ['gold', 'btc'].map(function(a){ var A = P[a]; if(!A) return ''; var LV = pxLive(A, a), f12 = pxFc(A, a, LV)[4]; return '<button type="button" data-pxa="' + a + '" class="' + a + (PX.a === a ? ' on' : '') + '">' + ico(PXN[a].ic) + '<span><b>' + esc(T(PXN[a])) + '</b><em>' + pxMoney(LV.p, a) + ' · 12M ' + spc((Math.exp(f12.e) - 1) * 100, 0) + '</em></span></button>'; }).join('') + '</div>';
    return tabs + vPxOne(P[PX.a] ? PX.a : 'gold');
  }
  function wirePx(root){
    root.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-pxa],[data-pxr]'); if(!b || !root.contains(b)) return;
      if(b.hasAttribute('data-pxa')) PX.a = b.getAttribute('data-pxa'); else PX.r = b.getAttribute('data-pxr');
      try { localStorage.setItem('spz.brain.px', JSON.stringify(PX)); } catch(e){}
      paint();
    });
  }
  XV.px = vPx;
  (function(){ var i = 0; for(; i < TABS.length; i++) if(TABS[i][0] === 'fc') break; TABS.splice(i + 1, 0, ['px', { en:'Gold & bitcoin forecast', th:'คาดการณ์ทอง & บิตคอยน์' }, 'coin']); })();

  /* manual entry */
  var manItems1 = manItems;
  manItems = function(E, F){
    var s = manItems1(E, F), P = X('px'), g = P && P.gold, b = P && P.btc;
    var sec7 = s[s.length - 1];
    sec7.items.unshift({ t:{ en:'Gold & bitcoin price forecast', th:'คาดการณ์ราคาทองและบิตคอยน์' },
      what:{ en:'Daily prices: gold futures (GC=F) since 2000, bitcoin (BTC-USD) since 2014, plus real yields, the broad dollar and the Nasdaq-100 for the macro piece.', th:'ราคารายวัน: ทองคำ (GC=F) ตั้งแต่ปี 2000 บิตคอยน์ (BTC-USD) ตั้งแต่ปี 2014 รวมถึงยีลด์จริง ดัชนีดอลลาร์ และ Nasdaq-100 สำหรับส่วนเศรษฐกิจมหภาค' },
      how:{ en:'Expected move = half its own long-run growth + trend (12m and 3m momentum in volatility units) + a partial pull back when the gap to the 200-day average is bigger than usual + seasonality (half weight) + for bitcoin the halving cycle (35%) + macro (half of: real-yield and dollar betas for gold, Nasdaq beta for bitcoin). Ranges = blended volatility × a factor from a weekly walk-forward test.', th:'การขยับที่คาด = ครึ่งหนึ่งของการเติบโตระยะยาวของตัวเอง + แนวโน้ม (โมเมนตัม 12 และ 3 เดือนในหน่วยความผันผวน) + แรงดึงกลับบางส่วนเมื่อห่างเส้น 200 วันมากกว่าปกติ + ฤดูกาล (น้ำหนักครึ่ง) + วัฏจักรฮาล์ฟวิ่งสำหรับบิตคอยน์ (35%) + เศรษฐกิจมหภาค (ครึ่งหนึ่งของผลจากยีลด์จริงและดอลลาร์สำหรับทอง และจาก Nasdaq สำหรับบิตคอยน์) ช่วงคาดการณ์ = ความผันผวนผสม × ตัวคูณจากการทดสอบย้อนหลังรายสัปดาห์' },
      why:{ en:'Levels to watch: support and resistance are clusters of swing highs/lows of the last 18 months; the odds of breaking each within a month come from the same 1-month forecast range. Each piece is a well-documented tendency, each is small, and each is shown separately — so a forecast can be checked and argued with. The walk-forward table shows honestly where it adds value (6–12 months) and where it does not (1 week).', th:'จุดที่ต้องจับตา: แนวรับแนวต้านคือกลุ่มจุดกลับตัวสูง/ต่ำในช่วง 18 เดือน โอกาสที่จะทะลุแต่ละระดับภายใน 1 เดือนคำนวณจากช่วงคาดการณ์ 1 เดือนเดียวกัน แต่ละส่วนเป็นแนวโน้มที่มีงานวิจัยรองรับ แต่ละส่วนมีผลไม่มาก และแสดงแยกให้เห็น จึงตรวจสอบและโต้แย้งได้ ตารางทดสอบย้อนหลังบอกตรงๆ ว่าช่วยได้ตรงไหน (6–12 เดือน) และช่วยไม่ได้ตรงไหน (1 สัปดาห์)' },
      now:{ en:(g ? 'Gold ' + pxMoney(g.last[1], 'gold') + ' → 12M ' + pxMoney(g.fc[4].mid, 'gold') : '') + (b ? ' · Bitcoin ' + pxMoney(b.last[1], 'btc') + ' → 12M ' + pxMoney(b.fc[4].mid, 'btc') : '') + ' (before the macro piece).', th:(g ? 'ทอง ' + pxMoney(g.last[1], 'gold') + ' → 12 เดือน ' + pxMoney(g.fc[4].mid, 'gold') : '') + (b ? ' · บิตคอยน์ ' + pxMoney(b.last[1], 'btc') + ' → 12 เดือน ' + pxMoney(b.fc[4].mid, 'btc') : '') + ' (ก่อนรวมส่วนเศรษฐกิจมหภาค)' } });
    return s;
  };

  /* ============================================== WORLD OUTLOOK (2026-10-26)
     Where the global economy is heading, why, and who benefits. Data:
     brain_ext.json -> world (scripts/brain_world.py: IMF, OECD leading
     indicators, BIS policy rates + CPI, copper/gold) plus the board's own
     forecasts (Fed, yields, S&P, dollar, oil) and the gold/bitcoin models.
     Market momentum of each country comes from the country ETFs in
     market.json. Every number is shown with what it measures. */
  var WM = 'score';
  try { WM = localStorage.getItem('spz.brain.wm') || 'score'; } catch(e){}
  var CPH = { expansion:{ en:'Expansion', th:'ขยายตัว', c:'#34d399', d:{ en:'above trend and rising', th:'สูงกว่าแนวโน้มและกำลังเร่ง' } }, downturn:{ en:'Peaking', th:'เริ่มแผ่ว', c:'#fbbf24', d:{ en:'above trend but falling', th:'สูงกว่าแนวโน้มแต่กำลังลดลง' } },
    slowdown:{ en:'Slowdown', th:'ชะลอตัว', c:'#fb7185', d:{ en:'below trend and falling', th:'ต่ำกว่าแนวโน้มและยังลดลง' } }, recovery:{ en:'Recovery', th:'ฟื้นตัว', c:'#22d3ee', d:{ en:'below trend but rising', th:'ต่ำกว่าแนวโน้มแต่เริ่มฟื้น' } } };
  var SECT_WHY = {
    'Energy':{ en:'oil and gas producers earn more when demand and prices rise', th:'ผู้ผลิตน้ำมันและก๊าซได้กำไรเพิ่มเมื่อความต้องการและราคาสูงขึ้น' },
    'Basic Materials':{ en:'metals, chemicals and mining follow factory demand', th:'โลหะ เคมี และเหมืองแร่ ขยับตามความต้องการของภาคการผลิต' },
    'Industrials':{ en:'machinery, transport and construction ride capital spending', th:'เครื่องจักร ขนส่ง และก่อสร้าง ได้ประโยชน์จากการลงทุน' },
    'Financial Services':{ en:'banks earn a wider margin when rates are higher', th:'ธนาคารได้ส่วนต่างดอกเบี้ยกว้างขึ้นเมื่อดอกเบี้ยสูง' },
    'Technology':{ en:'growth companies are worth more when rates and inflation fall', th:'บริษัทเติบโตมีมูลค่าสูงขึ้นเมื่อดอกเบี้ยและเงินเฟ้อลดลง' },
    'Consumer Cyclical':{ en:'shoppers spend more on wants when jobs and incomes grow', th:'ผู้บริโภคใช้จ่ายของฟุ่มเฟือยมากขึ้นเมื่อมีงานและรายได้เพิ่ม' },
    'Communication Services':{ en:'advertising and platforms grow with the economy', th:'โฆษณาและแพลตฟอร์มเติบโตตามเศรษฐกิจ' },
    'Consumer Defensive':{ en:'food and household staples sell in any economy', th:'อาหารและของใช้จำเป็นขายได้ทุกสภาวะ' },
    'Healthcare':{ en:'demand for health care barely depends on the cycle', th:'ความต้องการด้านสุขภาพแทบไม่ขึ้นกับวัฏจักร' },
    'Utilities':{ en:'steady regulated income, like a bond', th:'รายได้สม่ำเสมอแบบมีกำกับ คล้ายพันธบัตร' },
    'Real Estate':{ en:'property values benefit when rates fall', th:'มูลค่าอสังหาฯ ได้ประโยชน์เมื่อดอกเบี้ยลดลง' }
  };
  function wPhase(S){ return S.gmom >= 0 ? (S.imom >= 0 ? 'overheat' : 'recovery') : (S.imom >= 0 ? 'stagflation' : 'reflation'); }
  function wScore(r){ var fl = flow(r.etf), mom = fl && isNum(fl.m3) ? clamp(fl.m3 / 8, -2, 2) : null; var s = isNum(r.score) ? r.score : 0; return { s:isNum(mom) ? 0.75 * s + 0.25 * mom : s, mom:mom, m3:fl && fl.m3 }; }
  function scoreCol(v){ v = clamp(v, -2, 2); if(v >= 0){ var t = v / 2; return 'rgba(' + Math.round(52 + (5 - 52) * t) + ',' + Math.round(211 - 61 * t) + ',' + Math.round(153 - 48 * t) + ',' + (0.25 + 0.6 * t).toFixed(2) + ')'; } var u = -v / 2; return 'rgba(' + Math.round(251 - 26 * u) + ',' + Math.round(113 - 84 * u) + ',' + Math.round(133 - 61 * u) + ',' + (0.25 + 0.6 * u).toFixed(2) + ')'; }
  function wTile(r, yr){
    var w = wScore(r), v, lab, col;
    if(WM === 'gdp'){ v = r.gdp[String(yr + 1)]; lab = pc(v, 1); col = scoreCol(isNum(v) && isNum(r.gdp_avg) ? (v - r.gdp_avg) : 0); }
    else if(WM === 'cli'){ lab = r.cli ? f(r.cli.v, 1) : '—'; col = r.phase ? CPH[r.phase].c + '66' : 'rgba(148,163,184,.18)'; }
    else if(WM === 'rate'){ v = r.rate && r.rate.c6; lab = r.rate ? pc(r.rate.v, 2) : '—'; col = isNum(v) ? scoreCol(-v / 0.5) : 'rgba(148,163,184,.18)'; }
    else if(WM === 'cpi'){ v = r.cpi && r.cpi.c6; lab = r.cpi ? pc(r.cpi.v, 1) : '—'; col = isNum(v) ? scoreCol(-v) : 'rgba(148,163,184,.18)'; }
    else { lab = sg(w.s, 1); col = scoreCol(w.s); }
    var sub = WM === 'cli' ? (r.phase ? T(CPH[r.phase]) : T({ en:'no CLI', th:'ไม่มีข้อมูล' })) : WM === 'rate' ? (r.rate && isNum(r.rate.c6) ? (r.rate.c6 < 0 ? T({ en:'cutting ', th:'ลด ' }) + sg(r.rate.c6, 2) : r.rate.c6 > 0 ? T({ en:'hiking ', th:'ขึ้น ' }) + sg(r.rate.c6, 2) : T({ en:'on hold', th:'คงที่' })) : '') : WM === 'cpi' ? (r.cpi && isNum(r.cpi.c6) ? T({ en:'6M ', th:'6 ด. ' }) + sg(r.cpi.c6, 1) : '') : WM === 'gdp' ? T({ en:'avg ', th:'เฉลี่ย ' }) + pc(r.gdp_avg, 1) : r.etf;
    return '<div class="bz-wt" style="grid-column:' + (r.x + 1) + ';grid-row:' + (r.y + 1) + ';--tc:' + col + '" title="' + esc(T(r)) + '"><span>' + esc(T(r)) + '</span><b>' + esc(lab) + '</b><em>' + esc(sub) + '</em></div>';
  }
  function cliScatter(rows){
    var W = 640, H = 380, P = { l:46, r:16, t:16, b:36 }, pts = rows.filter(function(r){ return r.cli && isNum(r.cli.c6); });
    if(!pts.length) return '';
    var xm = Math.max(2.5, Math.max.apply(null, pts.map(function(r){ return Math.abs(r.cli.v - 100); })) + 0.3), ym = Math.max(1.2, Math.max.apply(null, pts.map(function(r){ return Math.abs(r.cli.c6); })) + 0.2);
    var X = function(v){ return P.l + (v + xm) / (2 * xm) * (W - P.l - P.r); }, Y = function(v){ return P.t + (1 - (v + ym) / (2 * ym)) * (H - P.t - P.b); };
    var g = '', cx = X(0), cy = Y(0);
    [['expansion', cx, P.t, W - P.r - cx, cy - P.t, 1, 1], ['downturn', cx, cy, W - P.r - cx, H - P.b - cy, 1, -1], ['slowdown', P.l, cy, cx - P.l, H - P.b - cy, -1, -1], ['recovery', P.l, P.t, cx - P.l, cy - P.t, -1, 1]].forEach(function(q){
      g += '<rect x="' + q[1].toFixed(1) + '" y="' + q[2].toFixed(1) + '" width="' + q[3].toFixed(1) + '" height="' + q[4].toFixed(1) + '" fill="' + CPH[q[0]].c + '" opacity=".07"/>' +
        '<text x="' + (q[5] > 0 ? W - P.r - 8 : P.l + 8) + '" y="' + (q[6] > 0 ? P.t + 18 : H - P.b - 10) + '" text-anchor="' + (q[5] > 0 ? 'end' : 'start') + '" class="bz-wq" fill="' + CPH[q[0]].c + '">' + esc(T(CPH[q[0]])) + '</text>';
    });
    g += '<line class="bz-zero" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + cy + '" y2="' + cy + '"/><line class="bz-zero" x1="' + cx + '" x2="' + cx + '" y1="' + P.t + '" y2="' + (H - P.b) + '"/>';
    g += '<text class="bz-ax" x="' + ((W + P.l) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(T({ en:'leading indicator vs trend (100) →', th:'ดัชนีชี้นำเทียบแนวโน้ม (100) →' })) + '</text><text class="bz-ax" x="12" y="' + ((H) / 2) + '" transform="rotate(-90 12 ' + (H / 2) + ')" text-anchor="middle">' + esc(T({ en:'6-month change ↑', th:'เปลี่ยนใน 6 เดือน ↑' })) + '</text>';
    pts.forEach(function(r){ var x = X(r.cli.v - 100), y = Y(r.cli.c6), c = r.phase ? CPH[r.phase].c : '#94a3b8'; g += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r.c === 'USA' || r.c === 'CHN' ? 8 : 6) + '" fill="' + c + '" stroke="var(--bz-bgc,#0b0f17)" stroke-width="1.5"><title>' + esc(T(r) + ': CLI ' + f(r.cli.v, 2) + ' · 6M ' + sg(r.cli.c6, 2)) + '</title></circle><text x="' + (x + 9).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" class="bz-wpl">' + esc(T(r)) + '</text>'; });
    return '<svg class="bz-svg" viewBox="0 0 ' + W + ' ' + H + '">' + g + '</svg>';
  }
  /* ---------------------------------------------------------- playbook
     brain_ext.json -> wpb (scripts/brain_world.py build_playbook): the global
     clock rebuilt month by month since 2000, and what followed each month. */
  var PHK = ['recovery', 'overheat', 'stagflation', 'reflation'];
  var PHC = { recovery:'#22d3ee', overheat:'#fb923c', stagflation:'#f43f5e', reflation:'#a78bfa' };
  var PHX = {
    recovery:{ en:'growth up, inflation down', th:'เศรษฐกิจดีขึ้น เงินเฟ้อลดลง' },
    overheat:{ en:'growth up, inflation up', th:'เศรษฐกิจดีขึ้น เงินเฟ้อเร่งขึ้น' },
    stagflation:{ en:'growth down, inflation up', th:'เศรษฐกิจแผ่ว แต่เงินเฟ้อยังขึ้น' },
    reflation:{ en:'growth down, inflation down', th:'เศรษฐกิจแผ่ว เงินเฟ้อก็ลด' }
  };
  var AST_N = { SPY:{ en:'US stock market (S&P 500)', th:'หุ้นสหรัฐฯ ทั้งตลาด (S&P 500)' }, QQQ:{ en:'Big tech (Nasdaq-100)', th:'หุ้นเทคใหญ่ (Nasdaq-100)' }, IWM:{ en:'US small caps', th:'หุ้นเล็กสหรัฐฯ' },
    XLK:'Technology', XLF:'Financial Services', XLE:'Energy', XLV:'Healthcare', XLI:'Industrials', XLB:'Basic Materials', XLU:'Utilities', XLP:'Consumer Defensive', XLY:'Consumer Cyclical', XLC:'Communication Services', XLRE:'Real Estate',
    GLD:{ en:'Gold', th:'ทองคำ' }, TLT:{ en:'Long US bonds (20y+)', th:'บอนด์สหรัฐฯ ระยะยาว 20 ปี+' }, SHY:{ en:'Short bonds (near cash)', th:'บอนด์ระยะสั้น (ใกล้เงินสด)' }, EEM:{ en:'Emerging markets', th:'ตลาดเกิดใหม่' }, EFA:{ en:'Developed markets ex-US', th:'ตลาดพัฒนาแล้วนอกสหรัฐฯ' }, THD:{ en:'Thai stocks (MSCI Thailand)', th:'หุ้นไทย (MSCI Thailand)' }, DBC:{ en:'Commodities basket', th:'ตะกร้าสินค้าโภคภัณฑ์' } };
  var SEC_ETF = { 'Technology':'XLK', 'Financial Services':'XLF', 'Energy':'XLE', 'Healthcare':'XLV', 'Industrials':'XLI', 'Basic Materials':'XLB', 'Utilities':'XLU', 'Consumer Defensive':'XLP', 'Consumer Cyclical':'XLY', 'Communication Services':'XLC', 'Real Estate':'XLRE' };
  var AST_WHY = { XLK:SECT_WHY['Technology'], XLF:SECT_WHY['Financial Services'], XLE:SECT_WHY['Energy'], XLV:SECT_WHY['Healthcare'], XLI:SECT_WHY['Industrials'], XLB:SECT_WHY['Basic Materials'], XLU:SECT_WHY['Utilities'], XLP:SECT_WHY['Consumer Defensive'], XLY:SECT_WHY['Consumer Cyclical'], XLC:SECT_WHY['Communication Services'], XLRE:SECT_WHY['Real Estate'],
    QQQ:{ en:'long-duration growth; sensitive to rates', th:'หุ้นเติบโต อ่อนไหวต่อดอกเบี้ย' }, IWM:{ en:'small firms need cheap credit and a growing economy', th:'บริษัทเล็กต้องการสินเชื่อถูกและเศรษฐกิจที่โต' }, GLD:{ en:'a hedge when inflation or fear rise and real yields fall', th:'ที่หลบภัยเมื่อเงินเฟ้อหรือความกลัวสูง และยีลด์จริงลด' },
    TLT:{ en:'gains when yields fall — usually in slowdowns', th:'ได้ประโยชน์เมื่อยีลด์ลด มักเป็นช่วงเศรษฐกิจชะลอ' }, SHY:{ en:'safe and steady, beats stocks only in bad times', th:'ปลอดภัย นิ่ง ชนะหุ้นเฉพาะช่วงแย่' }, EEM:{ en:'needs global growth and a soft dollar', th:'ต้องการเศรษฐกิจโลกโตและดอลลาร์อ่อน' }, EFA:{ en:'Europe and Japan, more cyclical and value-heavy', th:'ยุโรปและญี่ปุ่น เป็นหุ้นวัฏจักรและหุ้นคุณค่ามากกว่า' },
    THD:{ en:'Thailand: banks, energy, tourism — follows China and the dollar', th:'ไทย: ธนาคาร พลังงาน ท่องเที่ยว ขยับตามจีนและดอลลาร์' }, DBC:{ en:'oil, metals and crops — rises with inflation', th:'น้ำมัน โลหะ พืชผล ขึ้นตามเงินเฟ้อ' }, SPY:{ en:'', th:'' } };
  var WSC = null, WROT = '';
  try { WROT = localStorage.getItem('spz.brain.wrot') || ''; } catch(e){}
  function astName(a){ var n = AST_N[a]; return typeof n === 'string' ? sectName(n) : n ? T(n) : a; }
  function phName(k){ return T(PHASES[k].short); }
  function sq(v){ return v * v; }
  function fedN(v){ return isNum(v) ? clamp(v / 1.5, -1, 1) : 0; }
  function pbRows(pb){ return (pb && pb.rows || []).filter(function(r){ return r[5] != null; }); }
  function pbNear(pb, g, i, fed, k){
    var d = pbRows(pb).map(function(r){ return [Math.sqrt(sq(r[1] - g) + sq(r[2] - i) + 0.25 * sq(fedN(r[3]) - fedN(fed))), r]; });
    d.sort(function(a, b){ return a[0] - b[0]; });
    return d.slice(0, k || 36).map(function(x){ return x[1]; });
  }
  function pbOut(rows, pb){
    var o = { n:rows.length, ph6:[0, 0, 0, 0], ph12:[0, 0, 0, 0], ast:{} }, t6 = 0, t12 = 0;
    rows.forEach(function(r){ if(r[5] != null){ o.ph6[r[5]]++; t6++; } if(r[6] != null){ o.ph12[r[6]]++; t12++; } });
    o.ph6 = o.ph6.map(function(v){ return t6 ? v / t6 * 100 : null; }); o.ph12 = o.ph12.map(function(v){ return t12 ? v / t12 * 100 : null; });
    var rate = function(fn){ var m = 0, t = 0; rows.forEach(function(r){ var v = fn(r); if(v == null) return; t++; if(v) m++; }); return t ? m / t * 100 : null; };
    o.rec = rate(function(r){ return r[7] == null ? null : r[7] === 1; });
    o.dd = rate(function(r){ return r[9] == null ? null : r[9] <= -10; });
    o.up = rate(function(r){ return r[8] == null ? null : r[8] > 0; });
    var sx = rows.map(function(r){ return r[8]; }).filter(isNum).sort(function(a, b){ return a - b; });
    o.spx = sx.length ? sx[Math.floor(sx.length / 2)] : null;
    (pb.assets || []).forEach(function(a, j){ var v = rows.map(function(r){ return r[10 + j]; }).filter(isNum); if(v.length >= 6) o.ast[a] = [v.reduce(function(s, x){ return s + x; }, 0) / v.length, v.filter(function(x){ return x > 0; }).length / v.length * 100, v.length]; });
    return o;
  }
  function episodes(pb, p){ var n = 0, prev = null; (pb.rows || []).forEach(function(r){ if(r[4] === p && prev !== p) n++; prev = r[4]; }); return n; }
  function stockEdge(t, p){
    var pb = X('wpb'), st = pb && pb.stk && pb.stk[t]; if(!st) return null;
    var a = st[(typeof p === 'string' ? PHK.indexOf(p) : p) + 1], al = st[0]; if(!a) return null;
    return { m:a[0], hit:a[1], n:a[2], sh:a[0] * a[2] / (a[2] + 30), all:al && al[0], allHit:al && al[1] };
  }
  function wPicks(p, cal, n, skip){
    var out = [], per = {};
    Object.keys(D.m.stocks || {}).forEach(function(t){
      var s = D.m.stocks[t]; if(s.cal !== cal || (skip && skip.indexOf(t) >= 0)) return;
      var e = stockEdge(t, p); if(!e || e.n < 24 || e.hit < 55 || e.m <= 0 || !s.above_ma200) return;
      out.push({ t:t, s:s, e:e, sc:e.sh + clamp(s.m3 || 0, -20, 30) * 0.05 + (s.vs_ma200 > 40 ? -2 : 0) });
    });
    out.sort(function(a, b){ return b.sc - a.sc; });
    return out.filter(function(x){ var k = x.s.sector || '?'; per[k] = (per[k] || 0) + 1; return per[k] <= 2; }).slice(0, n);
  }
  function wAvoid(p, cal, n){
    var out = [], per = {}, caps = Object.keys(D.m.stocks || {}).map(function(t){ return D.m.stocks[t]; }).filter(function(s){ return s.cal === cal && s.mcap; }).map(function(s){ return s.mcap; }).sort(function(a, b){ return a - b; }), mid = caps[Math.floor(caps.length / 2)] || 0;
    Object.keys(D.m.stocks || {}).forEach(function(t){
      var s = D.m.stocks[t]; if(s.cal !== cal || !(s.mcap >= mid)) return;
      var e = stockEdge(t, p); if(!e || e.n < 24 || e.hit > 42 || e.m >= 0) return;
      out.push({ t:t, s:s, e:e, sc:e.sh + (s.above_ma200 ? 1 : -1) });
    });
    out.sort(function(a, b){ return a.sc - b.sc; });
    return out.filter(function(x){ var k = x.s.sector || '?'; per[k] = (per[k] || 0) + 1; return per[k] <= 2; }).slice(0, n);
  }
  function tick(t){ return t.replace(/\.BK$/, ''); }
  function word(v, W5){ return v > 0.4 ? W5[0] : v > 0.1 ? W5[1] : v >= -0.1 ? W5[2] : v >= -0.4 ? W5[3] : W5[4]; }
  var GW = [{ en:'booming', th:'โตแรง' }, { en:'growing', th:'ยังโต' }, { en:'flat', th:'ทรงตัว' }, { en:'softening', th:'เริ่มแผ่ว' }, { en:'contracting', th:'หดตัว' }];
  var IW = [{ en:'surging', th:'เร่งแรง' }, { en:'rising', th:'เร่งขึ้น' }, { en:'steady', th:'ทรงตัว' }, { en:'cooling', th:'ชะลอลง' }, { en:'falling fast', th:'ลดเร็ว' }];
  function meter(v, rev){ var x = clamp((v + 1) / 2, 0, 1) * 100, good = rev ? v < 0 : v > 0; return '<div class="bz-wmeter"><i></i><u class="' + (Math.abs(v) < 0.1 ? 'mid' : good ? 'good' : 'bad') + '" style="left:' + x.toFixed(1) + '%"></u></div>'; }
  function probBar(arr, lab){
    return '<div class="bz-wstk">' + (lab ? '<span>' + esc(T(lab)) + '</span>' : '') + '<div>' + arr.map(function(v, j){ return isNum(v) && v > 0 ? '<i style="width:' + v.toFixed(1) + '%;background:' + PHC[PHK[j]] + '" title="' + esc(phName(PHK[j]) + ' ' + Math.round(v) + '%') + '">' + (v >= 12 ? Math.round(v) + '%' : '') + '</i>' : ''; }).join('') + '</div></div>';
  }
  function phLegend(){ return '<div class="bz-wphl">' + PHK.map(function(k){ return '<span><i style="background:' + PHC[k] + '"></i><b>' + esc(phName(k)) + '</b> ' + esc(T(PHX[k])) + '</span>'; }).join('') + '</div>'; }
  /* the world's path on the growth x inflation plane */
  function trailSVG(pb, live, probs){
    var W = 360, H = 300, P = 26, rows = (pb.rows || []).slice(-24), pts = rows.map(function(r){ return [r[1], r[2], r[0]]; });
    if(live) pts.push([live.g, live.i, 'now']);
    var X = function(v){ return P + (clamp(v, -1, 1) + 1) / 2 * (W - 2 * P); }, Y = function(v){ return P + (1 - (clamp(v, -1, 1) + 1) / 2) * (H - 2 * P); };
    var g = '', cx = X(0), cy = Y(0);
    [['overheat', cx, P, 1, 1], ['recovery', cx, cy, 1, -1], ['reflation', P, cy, -1, -1], ['stagflation', P, P, -1, 1]].forEach(function(q){
      g += '<rect x="' + q[1] + '" y="' + q[2] + '" width="' + (W / 2 - P) + '" height="' + (H / 2 - P) + '" fill="' + PHC[q[0]] + '" opacity=".1"/><text x="' + (q[3] > 0 ? W - P - 6 : P + 6) + '" y="' + (q[4] > 0 ? P + 15 : H - P - 8) + '" text-anchor="' + (q[3] > 0 ? 'end' : 'start') + '" class="bz-wq" fill="' + PHC[q[0]] + '">' + esc(phName(q[0])) + '</text>';
    });
    g += '<line class="bz-zero" x1="' + P + '" x2="' + (W - P) + '" y1="' + cy + '" y2="' + cy + '"/><line class="bz-zero" x1="' + cx + '" x2="' + cx + '" y1="' + P + '" y2="' + (H - P) + '"/>';
    g += '<text class="bz-ax" x="' + (W - P) + '" y="' + (cy - 5) + '" text-anchor="end">' + esc(T({ en:'growth →', th:'เศรษฐกิจ →' })) + '</text><text class="bz-ax" x="' + (cx + 5) + '" y="' + (P - 8) + '">' + esc(T({ en:'↑ inflation', th:'↑ เงินเฟ้อ' })) + '</text>';
    if(pts.length > 1){
      g += '<defs><marker id="wtA" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9z" fill="var(--grey)"/></marker><marker id="wtP" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fff"/></marker></defs>';
      g += '<path d="' + pts.map(function(p, j){ return (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('') + '" fill="none" stroke="var(--white)" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="3 3" marker-mid="url(#wtA)" class="bz-wtpath"/>';
      pts.forEach(function(p, j){ var last = j === pts.length - 1; g += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="' + (last ? 8 : 2.2 + j / pts.length * 2.5) + '" fill="' + (last ? '#fff' : 'var(--grey)') + '" opacity="' + (last ? 1 : 0.35 + j / pts.length * 0.6) + '"' + (last ? ' stroke="' + PHC[PHK[(p[0] >= 0 ? (p[1] >= 0 ? 1 : 0) : (p[1] >= 0 ? 2 : 3))]] + '" stroke-width="4"' : '') + '><title>' + esc(p[2] === 'now' ? T({ en:'now', th:'ตอนนี้' }) : mon(p[2])) + '</title></circle>'; });
      var f0 = pts[0]; g += '<text class="bz-ax" x="' + (X(f0[0]) + 6).toFixed(1) + '" y="' + (Y(f0[1]) - 6).toFixed(1) + '">' + esc(mon(f0[2])) + '</text>';
      var lp = pts[pts.length - 1]; g += '<circle cx="' + X(lp[0]).toFixed(1) + '" cy="' + Y(lp[1]).toFixed(1) + '" r="8" fill="none" stroke="#fff" stroke-width="2" class="bz-wpulse"/><text class="bz-wnow" x="' + (X(lp[0]) + 12).toFixed(1) + '" y="' + (Y(lp[1]) + 4).toFixed(1) + '">' + esc(T({ en:'NOW', th:'ตอนนี้' })) + '</text>';
      if(probs){
        var C2 = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]], tx = 0, ty = 0, tw = 0, best = 0;
        probs.forEach(function(p, q){ if(!isNum(p)) return; tx += p * C2[q][0]; ty += p * C2[q][1]; tw += p; if(p > probs[best]) best = q; });
        if(tw){ var k2 = clamp(probs[best] / 60, 0.4, 0.9), dx = lp[0] + (C2[best][0] - lp[0]) * k2, dy = lp[1] + (C2[best][1] - lp[1]) * k2;
          g += '<line x1="' + X(lp[0]).toFixed(1) + '" y1="' + Y(lp[1]).toFixed(1) + '" x2="' + X(dx).toFixed(1) + '" y2="' + Y(dy).toFixed(1) + '" stroke="' + PHC[PHK[best]] + '" stroke-width="3" stroke-linecap="round" marker-end="url(#wtP)" class="bz-wproj"/>' +
            '<text class="bz-wprojl" x="' + X(dx).toFixed(1) + '" y="' + (Y(dy) + (dy < lp[1] ? -10 : 18)).toFixed(1) + '" text-anchor="middle" fill="' + PHC[PHK[best]] + '">' + esc(T({ en:'6M: ', th:'คาด 6 ด.: ' }) + phName(PHK[best]) + ' ' + Math.round(probs[best]) + '%') + '</text>'; }
      }
    }
    return '<svg class="bz-svg bz-wtrail" viewBox="0 0 ' + W + ' ' + H + '">' + g + '</svg>';
  }
  /* calculator */
  var WPRE = [
    ['now', { en:'Today', th:'ตอนนี้' }, null],
    ['boom', { en:'Boom continues', th:'บูมต่อ' }, [0.6, 0.3, 0.5]],
    ['stag', { en:'Inflation shock, growth stalls', th:'เงินเฟ้อพุ่ง เศรษฐกิจสะดุด' }, [-0.5, 0.7, 0.75]],
    ['soft', { en:'Soft landing', th:'ลงจอดนุ่มนวล' }, [0.2, -0.5, -0.5]],
    ['bust', { en:'Recession scare', th:'เศรษฐกิจทรุด' }, [-0.8, -0.4, -1.25]]
  ];
  function calcRes(pb, sc){
    var near = pbNear(pb, sc.g, sc.i, sc.fed, 36), o = pbOut(near, pb), base = pbOut(pbRows(pb), pb);
    var p = sc.g >= 0 ? (sc.i >= 0 ? 'overheat' : 'recovery') : (sc.i >= 0 ? 'stagflation' : 'reflation');
    var risk = function(lab, v, b, bad){ var hi = isNum(v) && isNum(b) && v > b * 1.25, lo = isNum(v) && isNum(b) && v < b * 0.75; return '<div class="bz-wrk ' + (bad ? (hi ? 'bad' : lo ? 'good' : 'mid') : (hi ? 'good' : lo ? 'bad' : 'mid')) + '"><b>' + (isNum(v) ? Math.round(v) + '%' : '—') + '</b><span>' + esc(T(lab)) + '</span><em>' + esc(T({ en:'normally ', th:'ปกติ ' })) + (isNum(b) ? Math.round(b) + '%' : '—') + '</em></div>'; };
    var ar = Object.keys(o.ast).filter(function(a){ return a !== 'SPY'; }).map(function(a){ return [a, o.ast[a]]; }).sort(function(a, b){ return b[1][0] - a[1][0]; });
    var chip = function(x, up){ return '<span class="bz-wcp ' + (up ? 'up' : 'dn') + '"><b>' + esc(astName(x[0])) + '</b><em>' + spc(x[1][0], 1) + ' · ' + Math.round(x[1][1]) + '%</em></span>'; };
    var dates = near.slice(0, 8).map(function(r){ return r[0]; }).sort();
    return '<div class="bz-wcr"><div class="bz-wcrh"><i style="background:' + PHC[p] + '"></i><div><span>' + esc(T({ en:'This is a', th:'สถานการณ์นี้คือช่วง' })) + '</span><b>' + esc(phName(p)) + '</b><em>' + esc(T(PHX[p])) + '</em></div></div>' +
      '<p class="bz-wcrn">' + esc(T({ en:'Looking at the ' + o.n + ' past months most like this (since ' + pb.first.slice(0, 4) + '), what happened next:', th:'ดู ' + o.n + ' เดือนในอดีตที่คล้ายสถานการณ์นี้ที่สุด (ตั้งแต่ปี ' + (+pb.first.slice(0, 4) + 543) + ') แล้วดูว่าหลังจากนั้นเกิดอะไรขึ้น:' })) + '</p>' +
      probBar(o.ph6, { en:'Phase 6 months later', th:'ช่วงเศรษฐกิจใน 6 เดือนต่อมา' }) + probBar(o.ph12, { en:'12 months later', th:'12 เดือนต่อมา' }) +
      '<div class="bz-wrks">' + risk({ en:'US recession within 12 months', th:'สหรัฐฯ เข้าสู่ภาวะถดถอยใน 12 เดือน' }, o.rec, base.rec, true) + risk({ en:'turns into stagflation in 6 months', th:'กลายเป็น “ชะลอแต่ของแพง” ใน 6 เดือน' }, o.ph6[2], base.ph6[2], true) + risk({ en:'US stocks drop 10%+ at some point in 12 months', th:'หุ้นสหรัฐฯ เคยร่วง 10%+ ระหว่าง 12 เดือน' }, o.dd, base.dd, true) + risk({ en:'US stocks higher 12 months later (median ' + spc(o.spx, 0) + ')', th:'หุ้นสหรัฐฯ สูงขึ้นใน 12 เดือน (ค่ากลาง ' + spc(o.spx, 0) + ')' }, o.up, base.up, false) + '</div>' +
      '<div class="bz-wcw"><div><h6>' + esc(T({ en:'Did best vs S&P 500 (6M)', th:'ชนะ S&P 500 มากที่สุด (6 เดือน)' })) + '</h6>' + ar.slice(0, 5).map(function(x){ return chip(x, true); }).join('') + '</div><div><h6>' + esc(T({ en:'Did worst', th:'แพ้มากที่สุด' })) + '</h6>' + ar.slice(-5).reverse().map(function(x){ return chip(x, false); }).join('') + '</div></div>' +
      '<p class="bz-wcrd">' + esc(T({ en:'Closest matches: ', th:'เดือนที่คล้ายที่สุด: ' })) + dates.map(function(d){ return mon(d); }).join(' · ') + '</p></div>';
  }
  function calcHTML(pb, S){
    if(!WSC) WSC = { g:S.gmom || 0, i:S.imom || 0, fed:pb.now && isNum(pb.now.fed) ? pb.now.fed : 0, pre:'now' };
    var sl = function(k, lab, lo, hi, st, fmt, ends){ return '<label class="bz-wsl"><span>' + esc(T(lab)) + ' <b data-wslv="' + k + '">' + fmt(WSC[k]) + '</b></span><input type="range" min="' + lo + '" max="' + hi + '" step="' + st + '" value="' + WSC[k] + '" data-wsl="' + k + '"><em><i>' + esc(T(ends[0])) + '</i><i>' + esc(T(ends[1])) + '</i></em></label>'; };
    return '<div class="bz-wcalc"><div class="bz-wcin"><div class="bz-wpre">' + WPRE.map(function(p){ return '<button type="button" data-wsc="' + p[0] + '" class="' + (WSC.pre === p[0] ? 'on' : '') + '">' + esc(T(p[1])) + '</button>'; }).join('') + '</div>' +
      sl('g', { en:'Global growth momentum', th:'แรงส่งเศรษฐกิจโลก' }, -1, 1, 0.05, function(v){ return sg(v, 2) + ' · ' + T(word(v, GW)); }, [{ en:'contracting', th:'หดตัว' }, { en:'booming', th:'โตแรง' }]) +
      sl('i', { en:'Global inflation momentum', th:'แรงส่งเงินเฟ้อโลก' }, -1, 1, 0.05, function(v){ return sg(v, 2) + ' · ' + T(word(v, IW)); }, [{ en:'falling fast', th:'ลดเร็ว' }, { en:'surging', th:'เร่งแรง' }]) +
      sl('fed', { en:'Fed rate change over 6 months', th:'เฟดเปลี่ยนดอกเบี้ยใน 6 เดือน' }, -2, 2, 0.25, function(v){ return sg(v, 2) + ' ' + T({ en:'pts', th:'จุด' }); }, [{ en:'cutting', th:'ลด' }, { en:'hiking', th:'ขึ้น' }]) +
      '<p class="bz-note">' + esc(T({ en:'Growth momentum = G20 leading indicator change + share of countries improving + copper/gold. Inflation momentum = change in median inflation + share of countries where it is rising. Both run from −1 to +1. Pick a preset or drag the sliders.', th:'แรงส่งเศรษฐกิจ = ดัชนีชี้นำ G20 ที่เปลี่ยน + สัดส่วนประเทศที่ดีขึ้น + ทองแดง/ทอง แรงส่งเงินเฟ้อ = เงินเฟ้อกลางที่เปลี่ยน + สัดส่วนประเทศที่เงินเฟ้อกำลังขึ้น ทั้งคู่อยู่ระหว่าง −1 ถึง +1 กดสถานการณ์สำเร็จรูป หรือเลื่อนแถบเองได้' })) + '</p></div>' +
      '<div data-wcres>' + calcRes(pb, WSC) + '</div></div>';
  }
  /* ------------------------------------------------------ auto plan
     Everything below is worked out by the page, no input needed:
       scenarios  = the phases the world moved into 6 months after the 36 past
                    months most like today (probabilities), each with the
                    signals that would show it is happening and what to own
       hold now   = sector/asset and stock scores weighted by those
                    probabilities, stocks also scored on quality, momentum and
                    price (the factors fund managers screen on)
       your plan  = for each stock you hold (typed, or taken from “My
                    portfolio”): keep or trim now, and what to switch to if
                    each scenario happens */
  /* Multi-factor scores, the way quant funds screen stocks. Each raw
     number becomes a z-score (how many standard deviations from the
     average), capped at ±2; quality and price are compared within the same
     sector of the same market (a bank's P/E against other banks), the rest
     within the whole market. Missing data counts as average.
       q  quality   ROE, profit margin, low debt/equity
       g  earnings  latest-quarter earnings growth, revenue growth, forward EPS vs trailing
       mo momentum  3-month return, distance above the 200-day average
       va price     P/E, forward P/E, price/book (cheaper = higher)
       an analysts  upside to the mean target, mean rating (only with 3+ analysts) */
  var FCACHE = null;
  var FNAME = { q:{ en:'Quality', th:'คุณภาพ' }, g:{ en:'Earnings', th:'กำไรโต' }, mo:{ en:'Momentum', th:'โมเมนตัม' }, va:{ en:'Price', th:'ราคา' }, an:{ en:'Analysts', th:'นักวิเคราะห์' } };
  function factors(){
    var key = D.m && D.m.generated_at; if(FCACHE && FCACHE.k === key) return FCACHE.v;
    var v = {}, all = Object.keys(D.m.stocks || {}).filter(function(t){ var c = D.m.stocks[t].cal; return c === 'us' || c === 'th'; });
    var zs = function(ts, get){ var xs = ts.map(function(t){ return get(D.m.stocks[t]); }), ok = xs.filter(isNum); if(ok.length < 5) return null; var m = ok.reduce(function(a, b){ return a + b; }, 0) / ok.length, sd = Math.sqrt(ok.reduce(function(a, b){ return a + (b - m) * (b - m); }, 0) / ok.length) || 1, o = {}; ts.forEach(function(t, j){ o[t] = isNum(xs[j]) ? clamp((xs[j] - m) / sd, -2, 2) : null; }); return o; };
    var grp = function(byS){ var G = {}; all.forEach(function(t){ var s = D.m.stocks[t], k = s.cal + (byS ? '|' + (s.sector || '?') : ''); (G[k] = G[k] || []).push(t); }); return G; };
    var Gm = grp(false), Gs = grp(true);
    var run = function(get, sectorRel){ var out = {}; Object.keys(Gm).forEach(function(k){ var base = zs(Gm[k], get) || {}; if(sectorRel){ Object.keys(Gs).forEach(function(ks){ if(ks.indexOf(k + '|') !== 0 || Gs[ks].length < 6) return; var z = zs(Gs[ks], get); if(z) Object.keys(z).forEach(function(t){ base[t] = z[t]; }); }); } Object.keys(base).forEach(function(t){ out[t] = base[t]; }); }); return out; };
    var avg = function(arr){ var a = arr.filter(isNum); return a.length ? a.reduce(function(x, y){ return x + y; }, 0) / a.length : null; };
    var F = {
      roe:run(function(s){ return isNum(s.roe) ? clamp(s.roe, -20, 50) : null; }, true), mar:run(function(s){ return isNum(s.margin) ? clamp(s.margin, -30, 60) : null; }, true), de:run(function(s){ return isNum(s.de) ? -clamp(s.de, 0, 5) : null; }, true),
      eg:run(function(s){ return isNum(s.eg) ? clamp(s.eg, -60, 120) : null; }), rg:run(function(s){ return isNum(s.rg) ? clamp(s.rg, -40, 80) : null; }), feg:run(function(s){ return isNum(s.feg) ? clamp(s.feg, -50, 100) : null; }),
      m3:run(function(s){ return isNum(s.m3) ? clamp(s.m3, -40, 60) : null; }), ma:run(function(s){ return isNum(s.vs_ma200) ? clamp(s.vs_ma200, -40, 35) : null; }),
      pe:run(function(s){ return isNum(s.pe) && s.pe > 0 ? -Math.log(clamp(s.pe, 3, 150)) : null; }, true), fpe:run(function(s){ return isNum(s.fpe) && s.fpe > 0 ? -Math.log(clamp(s.fpe, 3, 150)) : null; }, true), pb:run(function(s){ return isNum(s.pb) && s.pb > 0 ? -Math.log(clamp(s.pb, 0.2, 60)) : null; }, true),
      up:run(function(s){ return s.nan >= 3 && isNum(s.tgt) && s.price ? clamp((s.tgt / s.price - 1) * 100, -40, 80) : null; }), rec:run(function(s){ return s.nan >= 3 && isNum(s.rec) ? -s.rec : null; })
    };
    all.forEach(function(t){
      var g = function(k){ return F[k][t]; };
      var r = { q:avg([g('roe'), g('mar'), g('de')]), g:avg([g('eg'), g('rg'), g('feg')]), mo:avg([g('m3'), g('ma')]), va:avg([g('pe'), g('fpe'), g('pb')]), an:avg([g('up'), g('rec')]) };
      var have = ['q', 'g', 'mo', 'va', 'an'].filter(function(k){ return isNum(r[k]); });
      ['q', 'g', 'mo', 'va', 'an'].forEach(function(k){ if(!isNum(r[k])) r[k] = 0; });
      r.n = have.length; r.f = have.length ? have.reduce(function(a, k){ return a + r[k]; }, 0) / have.length : 0; r.has = have;
      v[t] = r;
    });
    FCACHE = { k:key, v:v }; return v;
  }
  function pbS(t){ var pb = X('wpb'); return t !== 'SPY' && pb && pb.stk && pb.stk[t]; }
  function fzRaw(k, s){
    var P = function(v, d){ return isNum(v) ? f(v, d == null ? 1 : d) : '—'; };
    return k === 'q' ? 'ROE ' + P(s.roe) + '% · margin ' + P(s.margin) + '% · D/E ' + P(s.de, 2) : k === 'g' ? 'EPS q/q ' + spc(s.eg, 0) + ' · sales ' + spc(s.rg, 0) + ' · fwd EPS ' + spc(s.feg, 0) : k === 'mo' ? '3M ' + spc(s.m3, 0) + ' · vs 200d ' + spc(s.vs_ma200, 0) : k === 'va' ? 'P/E ' + P(s.pe) + ' · fwd ' + P(s.fpe) + ' · P/B ' + P(s.pb) : s.nan >= 3 ? 'target ' + spc(isNum(s.tgt) && s.price ? (s.tgt / s.price - 1) * 100 : null, 0) + ' · rating ' + P(s.rec, 1) + ' (' + s.nan + ')' : 'no analyst cover';
  }
  function fzBadges(fz, s){ return '<div class="bz-wfz">' + ['q', 'g', 'mo', 'va', 'an'].map(function(k){ var on = fz.has && fz.has.indexOf(k) >= 0; return '<span class="' + (on ? 'g' + fzGrade(fz[k]) : 'gN') + '" title="' + esc(fzRaw(k, s)) + '">' + esc(T(FNAME[k])) + ' ' + (on ? fzGrade(fz[k]) : '–') + '</span>'; }).join('') + '</div>'; }
  function fzText(fz){ return ['q', 'g', 'mo', 'va', 'an'].filter(function(k){ return fz.has && fz.has.indexOf(k) >= 0; }).map(function(k){ return T(FNAME[k]) + ' ' + fzGrade(fz[k]); }).join(', '); }
  function fzGrade(z){ return z > 0.5 ? 'A' : z > 0 ? 'B' : z > -0.5 ? 'C' : 'D'; }
  function oneHot(q){ var a = [0, 0, 0, 0]; a[q] = 100; return a; }
  function stockExp(t, probs){ var e = 0, w = 0, per = []; for(var q = 0; q < 4; q++){ var pr = probs[q] || 0; if(pr <= 0) continue; var ed = stockEdge(t, q); per[q] = ed; if(ed){ e += pr * ed.sh; w += pr; } } return w ? { e:e / w, per:per, cov:w } : null; }
  function astExp(pb, a, probs){ var e = 0, w = 0, wins = 0, nS = 0; for(var q = 0; q < 4; q++){ var pr = probs[q] || 0, st = pb.ast[a] && pb.ast[a].ph[q]; if(pr <= 0 || !st) continue; var sh = st[0] * st[2] / (st[2] + 30); e += pr * sh; w += pr; if(pr >= 10){ nS++; if(st[0] > 0) wins++; } } return w ? { e:e / w, wins:wins, nS:nS } : null; }
  function holdNow(probs, cal, n, skip, loose){
    var F = factors(), out = [], per = {};
    Object.keys(D.m.stocks || {}).forEach(function(t){
      var s = D.m.stocks[t]; if(s.cal !== cal || (skip && skip.indexOf(t) >= 0)) return;
      var x = stockExp(t, probs); if(!x || x.cov < 60 || x.e <= 0 || !s.above_ma200) return;
      var fz = F[t] || { f:0, q:0, mo:0, va:0 }; if(!loose && fz.q < -0.8) return;
      out.push({ t:t, s:s, x:x, fz:fz, sc:0.5 * clamp(x.e / 3, -2, 2) + 0.5 * fz.f - (s.vs_ma200 > 45 ? 0.5 : 0) });
    });
    out.sort(function(a, b){ return b.sc - a.sc; });
    return out.filter(function(x){ var k = x.s.sector || '?'; per[k] = (per[k] || 0) + 1; return per[k] <= 2; }).slice(0, n);
  }
  function autoCtx(){
    var Wd = X('world'), pb = X('wpb'); if(!Wd || !pb) return null;
    var S = Wd.summary || {}, fedNow = pb.now && isNum(pb.now.fed) ? pb.now.fed : 0;
    var O = pbOut(pbNear(pb, S.gmom || 0, S.imom || 0, fedNow, 36), pb), probs = O.ph6.map(function(v){ return v || 0; });
    var scen = [0, 1, 2, 3].filter(function(q){ return probs[q] >= 8; }).sort(function(a, b){ return probs[b] - probs[a]; });
    return { Wd:Wd, pb:pb, S:S, O:O, probs:probs, scen:scen, ph:wPhase(S) };
  }
  /* signals that would show a scenario is arriving, checked against today */
  function watchList(S, q){
    var gUp = q === 0 || q === 1, iUp = q === 1 || q === 2, g20 = S.g20 || {}, W2 = [];
    W2.push(gUp ? [{ en:'Copper beats gold (6M > +5%)', th:'ทองแดงแรงกว่าทอง (6 ด. > +5%)' }, spc(S.cugold_6m, 0), (S.cugold_6m || 0) > 5] : [{ en:'Copper/gold stalls (6M < +5%)', th:'ทองแดง/ทองหยุดขึ้น (6 ด. < +5%)' }, spc(S.cugold_6m, 0), (S.cugold_6m || 0) < 5]);
    W2.push(gUp ? [{ en:'G20 leading indicator rising', th:'ดัชนีชี้นำ G20 กำลังขึ้น' }, sg(g20.c6, 2), (g20.c6 || 0) > 0] : [{ en:'G20 leading indicator falling', th:'ดัชนีชี้นำ G20 กำลังลด' }, sg(g20.c6, 2), (g20.c6 || 0) < 0]);
    W2.push(gUp ? [{ en:'Most countries improving (> 50%)', th:'ประเทศส่วนใหญ่ดีขึ้น (> 50%)' }, f(S.rising_share, 0) + '%', (S.rising_share || 0) > 50] : [{ en:'Most countries weakening (< 50% improving)', th:'ประเทศส่วนใหญ่แย่ลง (ดีขึ้น < 50%)' }, f(S.rising_share, 0) + '%', (S.rising_share || 0) < 50]);
    W2.push(iUp ? [{ en:'Median inflation still rising', th:'เงินเฟ้อกลางยังขึ้น' }, sg(S.cpi_median_6m, 2), (S.cpi_median_6m || 0) > 0] : [{ en:'Median inflation turns down', th:'เงินเฟ้อกลางเริ่มลง' }, sg(S.cpi_median_6m, 2), (S.cpi_median_6m || 0) < 0]);
    W2.push(iUp ? [{ en:'Inflation rising in most countries', th:'เงินเฟ้อขึ้นในประเทศส่วนใหญ่' }, f(S.cpi_rising, 0) + '%', (S.cpi_rising || 0) > 50] : [{ en:'Inflation falling in most countries', th:'เงินเฟ้อลดในประเทศส่วนใหญ่' }, f(S.cpi_rising, 0) + '%', (S.cpi_rising || 0) < 50]);
    return W2;
  }
  function scenCard(C, q){
    var k = PHK[q], pb = C.pb, W2 = watchList(C.S, q), met = W2.filter(function(w){ return w[2]; }).length, now = C.ph === k;
    var ast = Object.keys(pb.ast).filter(function(a){ return a !== 'SPY' && pb.ast[a].ph[q]; }).map(function(a){ return [a, pb.ast[a].ph[q]]; }).sort(function(a, b){ return b[1][0] - a[1][0]; });
    var top = ast.filter(function(x){ return x[1][0] > 0; }).slice(0, 3), bot = ast.slice(-2).reverse();
    var su = holdNow(oneHot(q), 'us', 2), st = holdNow(oneHot(q), 'th', 2);
    return '<div class="bz-wsn" style="--sc:' + PHC[k] + '"><div class="bz-wsnh"><div><span>' + esc(T({ en:'Scenario', th:'ฉากทัศน์' })) + '</span><b>' + esc(phName(k)) + '</b><em>' + esc(T(PHX[k])) + '</em></div><strong>' + Math.round(C.probs[q]) + '%</strong></div>' +
      '<div class="bz-wsnp"><i style="width:' + Math.round(C.probs[q]) + '%"></i></div>' +
      '<p class="bz-wsnst ' + (now ? 'now' : met >= 4 ? 'hot' : met >= 2 ? 'warm' : '') + '">' + esc(T(now ? { en:'Happening now', th:'กำลังเป็นอยู่ตอนนี้' } : { en:'Signals: ' + met + ' of ' + W2.length, th:'มีสัญญาณแล้ว ' + met + ' จาก ' + W2.length })) + '</p>' +
      '<h6>' + esc(T({ en:'How you would know', th:'จะรู้ได้อย่างไรว่ากำลังเกิด' })) + '</h6><ul class="bz-wsnw">' + W2.map(function(w){ return '<li class="' + (w[2] ? 'y' : '') + '"><i>' + (w[2] ? '✓' : '○') + '</i>' + esc(T(w[0])) + '<b>' + esc(w[1]) + '</b></li>'; }).join('') + '</ul>' +
      '<h6>' + esc(T({ en:'If it happens, own', th:'ถ้าเกิด ควรถือ' })) + '</h6><div class="bz-wsnc up">' + top.map(function(x){ return '<span>' + esc(astName(x[0])) + ' <em>' + spc(x[1][0], 1) + '</em></span>'; }).join('') + '</div>' +
      '<div class="bz-wsnk">' + su.concat(st).map(function(x){ return '<span><b>' + esc(tick(x.t)) + '</b><em>' + esc(sectName(x.s.sector || '')) + '</em></span>'; }).join('') + '</div>' +
      '<h6>' + esc(T({ en:'Trim', th:'ควรลด' })) + '</h6><div class="bz-wsnc dn">' + bot.map(function(x){ return '<span>' + esc(astName(x[0])) + ' <em>' + spc(x[1][0], 1) + '</em></span>'; }).join('') + '</div></div>';
  }
  function dataDates(){
    var Wd = X('world') || {}, S = Wd.summary || {}, pb = X('wpb') || {}, cpiT = '';
    (Wd.countries || []).forEach(function(r){ if(r.cpi && r.cpi.t > cpiT) cpiT = r.cpi.t; });
    var mk = D.m && D.m.generated_at, ex = D.x && D.x.generated_at, dt = function(t){ if(!t) return '—'; var d = new Date(t); return d.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', year:'2-digit', timeZone:'Asia/Bangkok' }) + ' ' + d.toLocaleTimeString(L() === 'th' ? 'th-TH' : 'en-GB', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Bangkok' }); };
    var it = function(lab, v){ return '<span><small>' + esc(T(lab)) + '</small><b>' + esc(v) + '</b></span>'; };
    return '<div class="bz-wdates">' + ico('cal') + it({ en:'Leading indicators', th:'ดัชนีชี้นำ' }, S.g20 ? mon(S.g20.t) : '—') + it({ en:'Inflation (CPI)', th:'เงินเฟ้อ (CPI)' }, cpiT ? mon(cpiT) : '—') + it({ en:'Stock & ETF prices', th:'ราคาหุ้นและ ETF' }, dt(mk)) + it({ en:'Economy file', th:'ไฟล์เศรษฐกิจ' }, dt(ex)) + it({ en:'History (2000→)', th:'ประวัติ (2543→)' }, pb.gen ? dt(pb.gen.replace('Z', ':00Z')) : '—') + '</div>';
  }
  /* animated emblem: up/down arrows for growth and inflation + where it is heading */
  function phaseEmblem(S, ph, next){
    var gU = (S.gmom || 0) >= 0, iU = (S.imom || 0) >= 0;
    var arr = function(up, cls, lab, val){ return '<div class="bz-wemb ' + cls + ' ' + (up ? 'up' : 'dn') + '"><div class="ar"><svg viewBox="0 0 24 24"><path d="' + (up ? 'M12 4l7 8h-4.5v8h-5v-8H5z' : 'M12 20l7-8h-4.5V4h-5v8H5z') + '"/></svg><svg viewBox="0 0 24 24" class="g2"><path d="' + (up ? 'M12 4l7 8h-4.5v8h-5v-8H5z' : 'M12 20l7-8h-4.5V4h-5v8H5z') + '"/></svg></div><span>' + esc(T(lab)) + '</span><b>' + esc(val) + '</b></div>'; };
    return '<div class="bz-wembw">' + arr(gU, 'gr', { en:'Economy', th:'เศรษฐกิจ' }, T(word(S.gmom || 0, GW))) + arr(iU, 'in', { en:'Inflation', th:'เงินเฟ้อ' }, T(word(S.imom || 0, IW))) +
      (next ? '<div class="bz-wnext" style="--nc:' + PHC[PHK[next[1]]] + '"><span>' + esc(T({ en:'Most likely in 6 months', th:'6 เดือนข้างหน้ามีแนวโน้มเป็น' })) + '</span><b>→ ' + esc(phName(PHK[next[1]])) + '</b><em>' + Math.round(next[0]) + '%</em></div>' : '') + '</div>';
  }
  var WCAT = 'all';
  try { WCAT = localStorage.getItem('spz.brain.wcat') || 'all'; } catch(e){}
  var CATS = [['all', { en:'Best overall', th:'ควรถือตอนนี้' }, 'star'], ['big', { en:'Blue chips', th:'หุ้นใหญ่หลัก' }, 'bank'], ['div', { en:'Dividend payers', th:'ปันผลเด่น' }, 'coin'], ['grow', { en:'Fast earnings growth', th:'กำไรโตแรง' }, 'trend']];
  function catPicks(probs, cal, cat){
    if(cat === 'all') return holdNow(probs, cal, 12);
    var list = holdNow(probs, cal, 400, null, true), caps = Object.keys(D.m.stocks || {}).map(function(t){ return D.m.stocks[t]; }).filter(function(s){ return s.cal === cal && s.mcap; }).map(function(s){ return s.mcap; }).sort(function(a, b){ return b - a; }), cut = caps[Math.max(0, Math.floor(caps.length * (cal === 'th' ? 0.3 : 0.2)) - 1)] || 0, per = {};
    var keep = list.filter(function(x){ var s = x.s, fz = x.fz;
      if(cat === 'big') return s.mcap >= cut && fz.q > -0.5;
      if(cat === 'div') return isNum(s.div) && s.div >= (cal === 'th' ? 4 : 2.5) && s.div <= 12 && fz.q > -0.3;
      if(cat === 'grow') return fz.has && fz.has.indexOf('g') >= 0 && fz.g >= 0.5 && isNum(s.eg) && s.eg > 0;
      return true; });
    keep.forEach(function(x){ x.sc2 = x.sc + (cat === 'div' ? 0.12 * Math.min(x.s.div, 9) : cat === 'grow' ? 0.3 * x.fz.g : cat === 'big' ? 0.2 * x.fz.q : 0); });
    keep.sort(function(a, b){ return b.sc2 - a.sc2; });
    return keep.filter(function(x){ var k = x.s.sector || '?'; per[k] = (per[k] || 0) + 1; return per[k] <= 2; }).slice(0, 12);
  }
  function stocksBlock(C){
    var cat = WCAT === 'res' ? 'all' : WCAT, hu = catPicks(C.probs, 'us', cat), ht = catPicks(C.probs, 'th', cat);
    var why = { all:{ en:'The 12 highest total scores in each market: 50% how the stock did vs its market in the scenarios likely over the next 6 months (weighted by their odds), 50% the five factors. Only stocks in an up-trend. This is the main list.', th:'12 ตัวที่คะแนนรวมสูงสุดของแต่ละตลาด: 50% สถิติว่าหุ้นเคยชนะตลาดแค่ไหนในฉากทัศน์ที่น่าจะเกิดใน 6 เดือนข้างหน้า (ถ่วงตามโอกาส) และ 50% จาก 5 ปัจจัย เฉพาะหุ้นที่เป็นขาขึ้น นี่คือรายชื่อหลัก' },
      big:{ en:'Same scoring, but only the biggest companies (top 20% by size in the US, 30% in Thailand) with solid quality — steadier, easier to trade, a good core.', th:'ใช้คะแนนเดียวกัน แต่เลือกเฉพาะบริษัทใหญ่สุด (20% แรกของสหรัฐฯ 30% แรกของไทย) ที่คุณภาพดี นิ่งกว่า ซื้อขายง่าย เหมาะเป็นแกนของพอร์ต' },
      div:{ en:'Same scoring, but only companies paying a solid dividend (2.5%+ US, 4%+ Thai, under 12% to avoid traps) with good quality — for income.', th:'ใช้คะแนนเดียวกัน แต่เลือกเฉพาะหุ้นที่จ่ายปันผลดี (สหรัฐฯ 2.5% ขึ้นไป ไทย 4% ขึ้นไป ไม่เกิน 12% เพื่อเลี่ยงกับดัก) และคุณภาพดี เหมาะกับคนอยากได้รายได้' },
      grow:{ en:'Same scoring, but only companies whose profits are growing fast (earnings grade A–B, profit up on a year ago) — more upside, more swing.', th:'ใช้คะแนนเดียวกัน แต่เลือกเฉพาะบริษัทที่กำไรโตเร็ว (เกรดกำไรโต A–B และกำไรสูงกว่าปีก่อน) โอกาสขึ้นมากกว่า แต่แกว่งมากกว่า' } }[cat];
    return '<div class="bz-wcatw" data-wcatbox><div class="bz-wcat">' + CATS.map(function(c){ return '<button type="button" data-wcat="' + c[0] + '" class="' + (cat === c[0] ? 'on' : '') + '">' + ico(c[2]) + esc(T(c[1])) + '</button>'; }).join('') + '</div><p class="bz-wcatn">' + esc(T(why)) + '</p>' +
      '<div class="bz-wpk"><div><h6>' + ico('flag') + esc(T({ en:'US stocks', th:'หุ้นสหรัฐฯ' })) + '</h6><div class="bz-wscg">' + (hu.length ? hu.map(function(x){ return holdCard(x, C, cat); }).join('') : note({ en:'None pass every filter right now.', th:'ตอนนี้ยังไม่มีตัวที่ผ่านทุกเงื่อนไข' })) + '</div></div><div><h6>' + ico('flag') + esc(T({ en:'Thai stocks', th:'หุ้นไทย' })) + '</h6><div class="bz-wscg">' + (ht.length ? ht.map(function(x){ return holdCard(x, C, cat); }).join('') : note({ en:'None pass every filter right now.', th:'ตอนนี้ยังไม่มีตัวที่ผ่านทุกเงื่อนไข' })) + '</div></div></div></div>';
  }
  function holdCard(x, C, cat){
    var e = x.x, fz = x.fz, s = x.s, best = C.scen[0];
    return '<div class="bz-wsc"><div class="bz-wsch"><b>' + esc(tick(x.t)) + '</b><span>' + esc((s.name || '').replace(/^[A-Z0-9&.\-]+_/, '').slice(0, 34)) + '</span><em>' + esc(sectName(s.sector || '')) + '</em></div>' +
      '<div class="bz-wscn"><div><small>' + esc(T({ en:'all scenarios, weighted', th:'ทุกฉากทัศน์ ถ่วงตามโอกาส' })) + '</small><b class="' + (e.e >= 0 ? 'up' : 'dn') + '">' + spc(e.e, 1) + '</b></div><div><small>' + esc(T({ en:'if ', th:'ถ้า' }) + phName(PHK[best])) + '</small><b>' + (e.per[best] ? spc(e.per[best].m, 1) : '—') + '</b></div>' + (cat === 'div' ? '<div><small>' + esc(T({ en:'dividend', th:'ปันผล' })) + '</small><b class="up">' + pc(s.div, 1) + '</b></div>' : cat === 'grow' ? '<div><small>' + esc(T({ en:'EPS y/y', th:'กำไร y/y' })) + '</small><b class="up">' + spc(s.eg, 0) + '</b></div>' : cat === 'big' ? '<div><small>' + esc(T({ en:'market cap', th:'มูลค่าตลาด' })) + '</small><b>' + (s.mcap >= 1e12 ? f(s.mcap / 1e12, 1) + 'T' : f(s.mcap / 1e9, 0) + 'B') + '</b></div>' : '<div><small>3M</small><b>' + spc(s.m3, 0) + '</b></div>') + '</div>' +
      fzBadges(fz, s) + '</div>';
  }
  function factorTable(probs){
    var F = factors(), one = function(cal){
      var rows = Object.keys(D.m.stocks || {}).filter(function(t){ var s = D.m.stocks[t]; return s.cal === cal && F[t] && F[t].n >= 3 && pbS(t); }).map(function(t){ var x = stockExp(t, probs), sc = x ? clamp(x.e / 3, -2, 2) : 0; return { t:t, s:D.m.stocks[t], fz:F[t], sc:sc, tot:0.5 * sc + 0.5 * F[t].f, e:x && x.e }; }).sort(function(a, b){ return b.tot - a.tot; }).slice(0, 15);
      var cell = function(r, k){ var on = r.fz.has.indexOf(k) >= 0; return '<td class="fz ' + (on ? 'g' + fzGrade(r.fz[k]) : 'gN') + '" title="' + esc(fzRaw(k, r.s)) + '"><b>' + (on ? fzGrade(r.fz[k]) : '–') + '</b><i style="width:' + (on ? Math.round((clamp(r.fz[k], -2, 2) + 2) / 4 * 100) : 0) + '%"></i></td>'; };
      return '<div><h6>' + ico('flag') + esc(T(cal === 'us' ? { en:'US — top 15', th:'สหรัฐฯ — 15 อันดับแรก' } : { en:'Thai — top 15', th:'ไทย — 15 อันดับแรก' })) + '</h6><div class="bz-tw"><table class="bz-tbl bz-wfzt"><thead><tr><th></th><th>' + esc(T({ en:'Scenarios', th:'ฉากทัศน์' })) + '</th>' + ['q', 'g', 'mo', 'va', 'an'].map(function(k){ return '<th>' + esc(T(FNAME[k])) + '</th>'; }).join('') + '<th>' + esc(T({ en:'Total', th:'รวม' })) + '</th></tr></thead><tbody>' +
        rows.map(function(r){ return '<tr><td><b>' + esc(tick(r.t)) + '</b><small>' + esc(sectName(r.s.sector || '')) + (r.s.above_ma200 ? '' : ' · ' + T({ en:'below 200d', th:'ใต้เส้น 200 วัน' })) + '</small></td><td class="' + (r.e >= 0 ? 'up' : 'dn') + '">' + spc(r.e, 1) + '</td>' + ['q', 'g', 'mo', 'va', 'an'].map(function(k){ return cell(r, k); }).join('') + '<td class="tot">' + sg(r.tot, 2) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    };
    return '<details class="bz-wadv bz-wfzd"><summary>' + ico('layers') + '<b>' + esc(T({ en:'Multi-factor scorecard — how fund managers would rank them', th:'ตารางคะแนนหลายปัจจัย — จัดอันดับแบบที่กองทุนใช้' })) + '</b><span>' + esc(T({ en:'Five factors, each graded A–D against the same market (quality and price against the same sector). Hover a grade to see the raw numbers.', th:'5 ปัจจัย ให้เกรด A–D เทียบกับหุ้นในตลาดเดียวกัน (คุณภาพและราคาเทียบกับกลุ่มเดียวกัน) ชี้ที่เกรดเพื่อดูตัวเลขจริง' })) + '</span></summary>' +
      '<div class="bz-wfzk">' + [['q', { en:'ROE, profit margin, low debt', th:'ROE อัตรากำไร หนี้ต่ำ' }], ['g', { en:'quarterly earnings growth, sales growth, next-year EPS vs last year', th:'กำไรไตรมาสล่าสุดเทียบปีก่อน ยอดขายโต กำไรต่อหุ้นปีหน้าเทียบปีนี้' }], ['mo', { en:'3-month return, height above the 200-day average', th:'ผลตอบแทน 3 เดือน และระยะเหนือเส้น 200 วัน' }], ['va', { en:'P/E, forward P/E, price/book — cheaper scores higher', th:'P/E, P/E ล่วงหน้า, P/BV ยิ่งถูกยิ่งได้คะแนน' }], ['an', { en:'upside to analysts\' mean target and their average rating (3+ analysts)', th:'ส่วนต่างถึงราคาเป้าหมายเฉลี่ยของนักวิเคราะห์ และคำแนะนำเฉลี่ย (อย่างน้อย 3 คน)' }]].map(function(x){ return '<span><b>' + esc(T(FNAME[x[0]])) + '</b>' + esc(T(x[1])) + '</span>'; }).join('') + '</div>' +
      '<div class="bz-wpk">' + one('us') + one('th') + '</div>' + note({ en:'Total = 50% scenario history + 50% the average of the five factors. Grades: A = well above average, B = above, C = below, D = well below. “–” = no data (e.g. no analyst coverage). Factor data from Yahoo Finance, refreshed every 30 minutes.', th:'รวม = สถิติฉากทัศน์ 50% + ค่าเฉลี่ย 5 ปัจจัย 50% เกรด A = ดีกว่าค่าเฉลี่ยมาก B = ดีกว่าค่าเฉลี่ย C = ต่ำกว่าค่าเฉลี่ย D = ต่ำกว่ามาก “–” = ไม่มีข้อมูล (เช่น ไม่มีนักวิเคราะห์ติดตาม) ข้อมูลปัจจัยจาก Yahoo Finance อัปเดตทุก 30 นาที' }) + '</details>';
  }
  function autoHTML(C){
    var pb = C.pb, ph = C.ph, probs = C.probs;
    var assets = Object.keys(pb.ast).filter(function(a){ return a !== 'SPY'; }).map(function(a){ return [a, astExp(pb, a, probs)]; }).filter(function(x){ return x[1]; }).sort(function(a, b){ return b[1].e - a[1].e; });
    var ow = assets.filter(function(x){ return x[1].e > 0; }).slice(0, 5), uw = assets.filter(function(x){ return x[1].e < 0; }).slice(-4).reverse();
    var rowA = function(x, up){ return '<p><b>' + esc(astName(x[0])) + '</b><span>' + spc(x[1].e, 1) + ' · ' + esc(T({ en:'wins in ', th:'ชนะใน ' })) + x[1].wins + '/' + x[1].nS + esc(T({ en:' scenarios', th:' ฉาก' })) + '</span></p>'; };
    var h = '<div class="bz-wauto"><div class="bz-wautoh"><div class="bz-wautoi"><svg viewBox="0 0 48 48"><defs><linearGradient id="wauG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><circle cx="24" cy="24" r="21" fill="none" stroke="url(#wauG)" stroke-width="2" stroke-dasharray="4 5" class="spin"/><path d="M26 8L14 27h9l-2 13 13-20h-9z" fill="url(#wauG)"/></svg><i>AUTO</i></div><div><b>' + esc(T({ en:'Auto plan — worked out by the system, updated with every data refresh', th:'แผนอัตโนมัติ — ระบบคิดให้เอง อัปเดตทุกครั้งที่ข้อมูลใหม่เข้า' })) + '</b><span>' + esc(T({ en:'1) where the world could go in 6 months and how to tell  2) what to own now, weighing every scenario by its odds  3) your stocks: keep, trim, or switch to what', th:'1) อีก 6 เดือนโลกจะไปทางไหนได้บ้าง และดูอย่างไร  2) ตอนนี้ควรถืออะไร โดยคิดทุกฉากทัศน์ถ่วงตามโอกาส  3) หุ้นที่คุณถือ ควรถือต่อ ลด หรือย้ายไปตัวไหน' })) + '</span></div></div>';
    h += dataDates();
    h += '<h5 class="bz-wstep"><i>1</i>' + esc(T({ en:'Next 6 months — the scenarios and their odds', th:'6 เดือนข้างหน้า — ฉากทัศน์และโอกาสเกิด' })) + '</h5><div class="bz-wsng">' + C.scen.map(function(q){ return scenCard(C, q); }).join('') + '</div>' +
      note({ en:'Odds = what the world turned into 6 months after the ' + C.O.n + ' past months most like today (growth, inflation and Fed moves), since ' + pb.first.slice(0, 4) + '. “Own” = groups with the best 6-month return vs the S&P 500 in that phase, plus the top-scoring stocks for it.', th:'โอกาส = ดูจาก ' + C.O.n + ' เดือนในอดีตที่คล้ายตอนนี้ที่สุด (เศรษฐกิจ เงินเฟ้อ และการขยับของเฟด) ตั้งแต่ปี ' + (+pb.first.slice(0, 4) + 543) + ' ว่า 6 เดือนต่อมากลายเป็นช่วงไหน “ควรถือ” = กลุ่มที่ชนะ S&P 500 ใน 6 เดือนมากที่สุดในช่วงนั้น และหุ้นที่ได้คะแนนสูงสุดสำหรับช่วงนั้น' });
    h += '<h5 class="bz-wstep"><i>2</i>' + esc(T({ en:'What to own now — every scenario weighed by its odds', th:'ตอนนี้ควรถืออะไร — คิดรวมทุกฉากทัศน์ ถ่วงตามโอกาสเกิด' })) + '</h5>' +
      '<div class="bz-wdog"><div class="up"><h6>' + esc(T({ en:'Lean toward (groups)', th:'ควรเพิ่มน้ำหนัก (กลุ่ม)' })) + '</h6>' + ow.map(function(x){ return rowA(x, true); }).join('') + '</div><div class="dn"><h6>' + esc(T({ en:'Lean away from', th:'ควรลดน้ำหนัก' })) + '</h6>' + uw.map(function(x){ return rowA(x, false); }).join('') + '</div>' +
      '<div class="st"><h6>' + esc(T({ en:'How the stocks are scored', th:'คะแนนหุ้นคิดอย่างไร' })) + '</h6><p class="bz-wsx">' + esc(T({ en:'50% history: how much the stock beat its market in each scenario, weighted by the odds. 50% the five factors fund managers screen on: quality, earnings growth, momentum, price and analysts (scorecard below). Only stocks above their 200-day average are listed.', th:'50% สถิติ: หุ้นเคยชนะตลาดแค่ไหนในแต่ละฉากทัศน์ ถ่วงตามโอกาส อีก 50% คือ 5 ปัจจัยที่กองทุนใช้คัดหุ้น: คุณภาพ กำไรโต โมเมนตัม ราคา และนักวิเคราะห์ (ดูตารางคะแนนด้านล่าง) แสดงเฉพาะหุ้นที่อยู่เหนือเส้น 200 วัน' })) + '</p></div></div>' +
      stocksBlock(C);
    h += factorTable(probs);
    h += '<h5 class="bz-wstep"><i>3</i>' + esc(T({ en:'Your stocks — keep, trim or switch', th:'หุ้นที่คุณถือ — ถือต่อ ลด หรือย้ายไปตัวไหน' })) + '</h5><div data-wrres>' + planHTML(C) + '</div><datalist id="bzWrList">' + Object.keys(D.m.stocks || {}).map(function(t){ return '<option value="' + esc(t) + '">'; }).join('') + '</datalist>';
    return h + note({ en:'A rules-based plan from history and today\'s data — not personal advice. Check the company yourself before you trade.', th:'เป็นแผนตามกฎจากสถิติและข้อมูลวันนี้ ไม่ใช่คำแนะนำเฉพาะบุคคล ควรศึกษาบริษัทเองก่อนซื้อขาย' }) + '</div>';
  }
  function planHTML(C){
    var auto = false, src = WROT;
    if(!src){ try { var w = currentWeights(pfState()); src = Object.keys(w).filter(function(t){ return w[t] > 0 && D.m.stocks[t] && pbS(t); }).join(', '); auto = !!src; } catch(e){} }
    var toks = (src || '').toUpperCase().split(/[\s,;]+/).map(tick).filter(Boolean), seen = {}, hold = [], miss = [];
    toks.forEach(function(t){ if(seen[t]) return; seen[t] = 1; if(D.m.stocks && D.m.stocks[t] && pbS(t)) hold.push(t); else miss.push(t); });
    var h = '<div class="bz-wrin"><input type="text" data-wrin placeholder="' + esc(T({ en:'Type the stocks you hold, e.g. AAPL, NVDA, PTT, KBANK', th:'พิมพ์หุ้นที่ถืออยู่ เช่น AAPL, NVDA, PTT, KBANK' })) + '" value="' + esc(WROT) + '" list="bzWrList"><button type="button" data-wrgo>' + ico('check') + esc(T({ en:'Check', th:'ตรวจ' })) + '</button><button type="button" data-wrpf>' + ico('pie') + esc(T({ en:'Use “My portfolio”', th:'ใช้พอร์ตของฉัน' })) + '</button></div>';
    if(auto) h += note({ en:'Showing the stocks in “My portfolio” automatically. Type your own list to replace it.', th:'ดึงหุ้นจาก “พอร์ตของฉัน” มาให้อัตโนมัติ พิมพ์รายชื่อเองเพื่อเปลี่ยนได้' });
    if(!hold.length) return h + note({ en:'Type the stocks you hold (US or Thai). For each one the system says whether to keep or trim it now, and what to switch to if each scenario happens.', th:'พิมพ์หุ้นที่ถืออยู่ (สหรัฐฯ หรือไทย) ระบบจะบอกว่าแต่ละตัวควรถือต่อหรือลดตอนนี้ และถ้าเกิดแต่ละฉากทัศน์ควรย้ายไปตัวไหน' }) + (miss.length ? note({ en:'Not found: ' + miss.join(', '), th:'ไม่พบ: ' + miss.join(', ') }) : '');
    var F = factors(), keep = [], trim = [], moves = [];
    var cards = hold.map(function(t){
      var s = D.m.stocks[t], x = stockExp(t, C.probs), fz = F[t] || { f:0, q:0, mo:0, va:0 };
      var v = !x ? 'mid' : (x.e >= 1 && s.above_ma200 && fz.f > -0.5) ? 'good' : (x.e <= -1 || (x.e < 0 && !s.above_ma200)) ? 'bad' : 'mid';
      var cand = holdNow(C.probs, s.cal, 12, hold, true), same = cand.filter(function(y){ return y.s.sector === s.sector; })[0], sw = (same && (!x || same.x.e > x.e + 1)) ? same : cand.filter(function(y){ return !x || y.x.e > x.e + 1; })[0];
      if(v === 'good') keep.push(t); if(v === 'bad'){ trim.push(t); if(sw) moves.push(t + ' → ' + sw.t); }
      var vt = { good:{ en:'Keep', th:'ถือต่อได้' }, mid:{ en:'Hold, watch', th:'ถือไว้ก่อน แต่จับตา' }, bad:{ en:'Trim / switch', th:'ควรลดหรือย้าย' } }[v];
      var why = !x ? { en:'Not enough history for this stock.', th:'หุ้นตัวนี้มีข้อมูลย้อนหลังไม่พอ' } : { en:'Across the likely scenarios it has ' + (x.e >= 0 ? 'beaten' : 'lagged') + ' its market by ' + f(Math.abs(x.e), 1) + '% per 6 months on average; price is ' + (s.above_ma200 ? 'above' : 'below') + ' its 200-day average; ' + fzText(fz) + '.', th:'ในฉากทัศน์ที่น่าจะเกิด หุ้นนี้เคย' + (x.e >= 0 ? 'ชนะ' : 'แพ้') + 'ตลาดเฉลี่ย ' + f(Math.abs(x.e), 1) + '% ต่อ 6 เดือน ราคา' + (s.above_ma200 ? 'เหนือ' : 'ใต้') + 'เส้น 200 วัน ' + fzText(fz) };
      var ifs = C.scen.slice(0, 3).map(function(q){
        var ed = x && x.per[q], k = PHK[q], alt = null;
        if(!ed || ed.sh < 0){ alt = holdNow(oneHot(q), s.cal, 6, hold, true).filter(function(y){ return y.s.sector === s.sector; })[0] || holdNow(oneHot(q), s.cal, 1, hold, true)[0]; }
        var w2 = watchList(C.S, q).filter(function(w){ return !w[2]; })[0];
        return '<li><i style="background:' + PHC[k] + '"></i><div><b>' + esc(T({ en:'If ', th:'ถ้า' }) + phName(k)) + ' <small>' + Math.round(C.probs[q]) + '%</small></b>' +
          '<span>' + (ed ? esc(T({ en:t + ' did ', th:t + ' เคยทำได้ ' })) + '<u class="' + (ed.m >= 0 ? 'up' : 'dn') + '">' + spc(ed.m, 1) + '</u> ' : '') + (alt ? '→ ' + esc(T({ en:'switch to ', th:'ย้ายไป ' })) + '<b>' + esc(tick(alt.t)) + '</b> <u class="up">' + spc(alt.x.per[q] ? alt.x.per[q].m : alt.x.e, 1) + '</u>' : '→ ' + esc(T({ en:'keep', th:'ถือต่อได้' }))) + '</span>' +
          (w2 && C.ph !== k ? '<em>' + esc(T({ en:'Watch: ', th:'สัญญาณให้ขยับ: ' }) + T(w2[0])) + '</em>' : '') + '</div></li>';
      }).join('');
      return '<div class="bz-wpl2 ' + v + '"><div class="bz-wpl2h"><div><b>' + esc(t) + '</b><span>' + esc(sectName(s.sector || '')) + '</span></div><strong class="bz-wv ' + v + '">' + esc(T(vt)) + '</strong></div><p>' + esc(T(why)) + '</p>' +
        (v !== 'good' && sw ? '<p class="bz-wpl2s">' + esc(T({ en:'Better now: ', th:'ตัวที่ดีกว่าตอนนี้: ' })) + '<b>' + esc(tick(sw.t)) + '</b> (' + esc(sectName(sw.s.sector || '')) + ' · ' + spc(sw.x.e, 1) + ')</p>' : '') +
        '<ul class="bz-wif">' + ifs + '</ul></div>';
    }).join('');
    h += '<div class="bz-wrsum"><b>' + esc(T({ en:'Plan in one line', th:'สรุปแผนในบรรทัดเดียว' })) + '</b><p>' + esc(T({
      en:(keep.length ? 'Keep ' + keep.join(', ') + '. ' : '') + (trim.length ? 'Trim ' + trim.join(', ') + (moves.length ? ' — switch ' + moves.join(', ') : '') + '. ' : 'Nothing needs to be sold now. ') + 'If the most likely scenario (“' + phName(PHK[C.scen[0]]) + '”, ' + Math.round(C.probs[C.scen[0]]) + '%) arrives, follow the “If” lines on each card.',
      th:(keep.length ? 'ถือต่อ ' + keep.join(', ') + ' ' : '') + (trim.length ? 'ควรลด ' + trim.join(', ') + (moves.length ? ' — ย้าย ' + moves.join(', ') : '') + ' ' : 'ตอนนี้ยังไม่มีตัวที่ต้องขาย ') + 'ถ้าฉากทัศน์ที่น่าจะเกิดที่สุด (“' + phName(PHK[C.scen[0]]) + '” ' + Math.round(C.probs[C.scen[0]]) + '%) มาถึง ให้ทำตามบรรทัด “ถ้า…” ในแต่ละการ์ด'
    })) + '</p></div><div class="bz-wplg">' + cards + '</div>';
    if(miss.length) h += note({ en:'Not found: ' + miss.join(', '), th:'ไม่พบ: ' + miss.join(', ') });
    return h;
  }

  function vWorld(){
    var Wd = X('world'); if(!Wd) return noExt();
    var pb = X('wpb'), S = Wd.summary || {}, yr = Wd.year, rows = Wd.countries || [], F = F_last || { items:{} };
    var ph = wPhase(S), P0 = PHASES[ph], pi = PHK.indexOf(ph), g20 = S.g20 || {}, cp = S.phase ? CPH[S.phase] : null;
    var tight = (S.hikes || 0) > (S.cuts || 0) + 1, easy = (S.cuts || 0) > (S.hikes || 0) + 1;
    var wg = S.world_gdp || {}, wi = S.world_infl || {}, dxy = mkt('dxy') || {};
    var ranked = rows.map(function(r){ var w = wScore(r); return { r:r, s:w.s, mom:w.mom, m3:w.m3 }; }).sort(function(a, b){ return b.s - a.s; });
    var best = ranked.slice(0, 4), worst = ranked.slice(-3).reverse();
    var fedNow = pb && pb.now && isNum(pb.now.fed) ? pb.now.fed : 0;
    var near = pb ? pbNear(pb, S.gmom || 0, S.imom || 0, fedNow, 36) : [], O = pb ? pbOut(near, pb) : null, B = pb ? pbOut(pbRows(pb), pb) : null;
    var astPh = pb ? Object.keys(pb.ast).filter(function(a){ return a !== 'SPY' && pb.ast[a].ph[pi]; }).map(function(a){ return [a, pb.ast[a].ph[pi], pb.ast[a].all]; }).sort(function(a, b){ return b[1][0] - a[1][0]; }) : [];
    var mostNext = O ? O.ph6.map(function(v, j){ return [v, j]; }).sort(function(a, b){ return b[0] - a[0]; }) : [];
    /* ---------------- 1. hero: the world right now */
    var gW = T(word(S.gmom || 0, GW)), iW = T(word(S.imom || 0, IW));
    var head = { en:'The world economy is ' + gW + ' while inflation is ' + iW + ' — a “' + P0.short.en + '” phase (' + PHX[ph].en + '). ' + (S.cuts != null ? S.hikes + ' central banks hiked and ' + S.cuts + ' cut in the last 6 months' + (tight ? ', so money is getting tighter.' : easy ? ', so money is getting cheaper.' : '.') : '') + (O ? ' In the ' + O.n + ' past months most like today, the most common phase 6 months later was “' + phName(PHK[mostNext[0][1]]) + '” (' + Math.round(mostNext[0][0]) + '%).' : ''),
      th:'เศรษฐกิจโลก' + gW + ' ขณะที่เงินเฟ้อ' + iW + ' — อยู่ช่วง “' + P0.short.th + '” (' + PHX[ph].th + ') ' + (S.cuts != null ? 'ใน 6 เดือนที่ผ่านมา ธนาคารกลาง ' + S.hikes + ' แห่งขึ้นดอกเบี้ย และ ' + S.cuts + ' แห่งลด' + (tight ? ' เงินทั่วโลกจึงตึงขึ้น' : easy ? ' เงินทั่วโลกจึงถูกลง' : '') : '') + (O ? ' จาก ' + O.n + ' เดือนในอดีตที่คล้ายตอนนี้ที่สุด 6 เดือนต่อมามักเป็นช่วง “' + phName(PHK[mostNext[0][1]]) + '” (' + Math.round(mostNext[0][0]) + '%)' : '') };
    var sig = function(icon, lab, wv, val, m, sub){ return '<div class="bz-wsig"><i>' + ico(icon) + '</i><div><span>' + esc(T(lab)) + '</span><b>' + esc(wv) + '</b></div>' + m + '<em>' + esc(val) + '<small>' + esc(T(sub)) + '</small></em></div>'; };
    var h = '<div class="bz-wh2"><div class="bz-wh2l"><div class="bz-wglw"><svg viewBox="0 0 120 120" class="bz-wgl"><defs><radialGradient id="wgG" cx="35%" cy="30%"><stop offset="0" stop-color="#67e8f9"/><stop offset=".55" stop-color="#6366f1"/><stop offset="1" stop-color="#1e1b4b"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#wgG)"/><g fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"><ellipse cx="60" cy="60" rx="52" ry="18"/><ellipse cx="60" cy="60" rx="52" ry="38"/><ellipse cx="60" cy="60" rx="18" ry="52"/><ellipse cx="60" cy="60" rx="38" ry="52"/><line x1="8" y1="60" x2="112" y2="60"/><line x1="60" y1="8" x2="60" y2="112"/></g></svg><i class="orb" style="--oc:' + PHC[ph] + '"></i></div>' +
      '<span>' + esc(T({ en:'The world economy now', th:'เศรษฐกิจโลกตอนนี้' })) + '</span><b class="bz-wph" style="color:' + PHC[ph] + '">' + esc(T(P0.short)) + '</b>' + phaseEmblem(S, ph, mostNext[0]) + '</div>' +
      '<div class="bz-wh2m"><p>' + esc(T(head)) + '</p>' +
        sig('factory', { en:'Global growth', th:'เศรษฐกิจโลก' }, gW, sg(S.gmom, 2), meter(S.gmom || 0), { en:' momentum', th:' แรงส่ง' }) +
        sig('flame', { en:'Global inflation', th:'เงินเฟ้อโลก' }, iW, pc(S.cpi_median, 1), meter(S.imom || 0, true), { en:' median', th:' ค่ากลาง' }) +
        sig('bank', { en:'Interest rates', th:'ดอกเบี้ยทั่วโลก' }, T(tight ? { en:'tightening', th:'กำลังขึ้น' } : easy ? { en:'easing', th:'กำลังลด' } : { en:'mixed', th:'ปนกัน' }), (S.cuts != null ? S.cuts + '↓ ' + S.hikes + '↑' : '—'), meter(S.n_cb ? ((S.hikes || 0) - (S.cuts || 0)) / S.n_cb * 2 : 0, true), { en:' banks', th:' แห่ง' }) +
        sig('coin', { en:'What markets price', th:'ตลาดมองอย่างไร' }, T((S.cugold_6m || 0) > 5 ? { en:'stronger industry', th:'อุตสาหกรรมแข็งแรง' } : (S.cugold_6m || 0) < -5 ? { en:'defensive', th:'ตั้งรับ' } : { en:'neutral', th:'กลางๆ' }), spc(S.cugold_6m, 0), meter(clamp((S.cugold_6m || 0) / 15, -1, 1)), { en:' copper/gold', th:' ทองแดง/ทอง' }) + '</div>' +
      (O ? '<div class="bz-wh2r"><h6>' + ico('radar') + esc(T({ en:'What history says comes next', th:'สถิติบอกว่าข้างหน้าจะเป็นอย่างไร' })) + '</h6>' + probBar(O.ph6, { en:'6 months', th:'อีก 6 เดือน' }) + probBar(O.ph12, { en:'12 months', th:'อีก 12 เดือน' }) +
        '<div class="bz-wh2k"><div><b>' + Math.round(O.rec) + '%</b><span>' + esc(T({ en:'US recession within 12M', th:'สหรัฐฯ ถดถอยใน 12 เดือน' })) + '</span><em>' + esc(T({ en:'normally ', th:'ปกติ ' })) + Math.round(B.rec) + '%</em></div><div><b>' + Math.round(O.up) + '%</b><span>' + esc(T({ en:'US stocks up 12M later', th:'หุ้นสหรัฐฯ ขึ้นใน 12 เดือน' })) + '</span><em>' + esc(T({ en:'median ', th:'ค่ากลาง ' })) + spc(O.spx, 0) + '</em></div></div>' +
        '<p class="bz-note">' + esc(T({ en:'From the ' + O.n + ' most similar months since ' + pb.first.slice(0, 4) + '.', th:'จาก ' + O.n + ' เดือนที่คล้ายที่สุดตั้งแต่ปี ' + (+pb.first.slice(0, 4) + 543) })) + '</p></div>' : '') + '</div>';
    h += phLegend();
    /* ---------------- 2. auto plan */
    if(pb){ var AC = autoCtx(); if(AC) h += autoHTML(AC); }
    /* ---------------- 3. how it is worked out: the formula, piece by piece */
    var comp = function(lab, raw, sc, how){ return '<div class="bz-wfr"><span>' + esc(T(lab)) + '<small>' + esc(T(how)) + '</small></span><b>' + esc(raw) + '</b><div class="bz-wfb"><i class="' + (sc >= 0 ? 'p' : 'n') + '" style="' + (sc >= 0 ? 'left:50%;width:' + (clamp(sc, 0, 1) * 50).toFixed(1) : 'right:50%;width:' + (clamp(-sc, 0, 1) * 50).toFixed(1)) + '%"></i></div><em>' + sg(sc, 2) + '</em></div>'; };
    var gc = [], ic = [];
    if(isNum(g20.c6)) gc.push(comp({ en:'G20 leading indicator, 6M change', th:'ดัชนีชี้นำ G20 เปลี่ยนใน 6 เดือน' }, sg(g20.c6, 2), clamp(g20.c6, -1, 1), { en:'±1 pt = ±1', th:'±1 จุด = ±1' }));
    if(isNum(S.rising_share)) gc.push(comp({ en:'Countries whose indicator is rising', th:'ประเทศที่ดัชนีชี้นำกำลังขึ้น' }, f(S.rising_share, 0) + '%', (S.rising_share - 50) / 50, { en:'50% = 0, 100% = +1', th:'50% = 0, 100% = +1' }));
    if(isNum(S.cugold_6m)) gc.push(comp({ en:'Copper / gold, 6M change', th:'ทองแดง/ทอง เปลี่ยนใน 6 เดือน' }, spc(S.cugold_6m, 1), clamp(S.cugold_6m / 15, -1, 1), { en:'±15% = ±1', th:'±15% = ±1' }));
    if(isNum(S.cpi_median_6m)) ic.push(comp({ en:'Median inflation, 6M change', th:'เงินเฟ้อกลาง เปลี่ยนใน 6 เดือน' }, sg(S.cpi_median_6m, 2) + ' pt', clamp(S.cpi_median_6m, -1, 1), { en:'±1 pt = ±1', th:'±1 จุด = ±1' }));
    if(isNum(S.cpi_rising)) ic.push(comp({ en:'Countries where inflation is rising', th:'ประเทศที่เงินเฟ้อกำลังขึ้น' }, f(S.cpi_rising, 0) + '%', (S.cpi_rising - 50) / 50, { en:'50% = 0, 100% = +1', th:'50% = 0, 100% = +1' }));
    h += '<div class="bz-row"><div class="bz-sec s12"><h4>' + ico('flask') + esc(T({ en:'How the phase is worked out — every input and its score', th:'คิดช่วงเศรษฐกิจอย่างไร — ทุกตัวแปรและคะแนนของมัน' })) + '</h4><div class="bz-wfx"><div><h6>' + esc(T({ en:'Growth momentum = average of', th:'แรงส่งเศรษฐกิจ = ค่าเฉลี่ยของ' })) + '</h6>' + gc.join('') + '<div class="bz-wft2"><span>' + esc(T({ en:'Growth momentum', th:'แรงส่งเศรษฐกิจ' })) + '</span><b class="' + (S.gmom >= 0 ? 'up' : 'dn') + '">' + sg(S.gmom, 2) + '</b><em>' + esc(T(S.gmom >= 0 ? { en:'right half of the clock', th:'ครึ่งขวาของนาฬิกา = เศรษฐกิจดีขึ้น' } : { en:'left half of the clock', th:'ครึ่งซ้ายของนาฬิกา = เศรษฐกิจแย่ลง' })) + '</em></div></div>' +
      '<div><h6>' + esc(T({ en:'Inflation momentum = average of', th:'แรงส่งเงินเฟ้อ = ค่าเฉลี่ยของ' })) + '</h6>' + ic.join('') + '<div class="bz-wft2"><span>' + esc(T({ en:'Inflation momentum', th:'แรงส่งเงินเฟ้อ' })) + '</span><b class="' + (S.imom >= 0 ? 'dn' : 'up') + '">' + sg(S.imom, 2) + '</b><em>' + esc(T(S.imom >= 0 ? { en:'top half: inflation heating', th:'ครึ่งบน = เงินเฟ้อเร่ง' } : { en:'bottom half: inflation cooling', th:'ครึ่งล่าง = เงินเฟ้อชะลอ' })) + '</em></div>' +
      '<div class="bz-wfph"><span>' + esc(T({ en:'Growth ', th:'เศรษฐกิจ ' })) + (S.gmom >= 0 ? '+' : '−') + ' & ' + esc(T({ en:'inflation ', th:'เงินเฟ้อ ' })) + (S.imom >= 0 ? '+' : '−') + ' =</span><b style="color:' + PHC[ph] + '">' + esc(T(P0.name)) + '</b></div></div></div>' +
      note({ en:'Each input is turned into a score between −1 and +1 using the scale on the left, then averaged. The same formula has been rebuilt for every month since 2000 — that history is what the probabilities on this page come from.', th:'แต่ละตัวแปรถูกแปลงเป็นคะแนน −1 ถึง +1 ตามสเกลที่เขียนไว้ใต้ชื่อ แล้วนำมาเฉลี่ย สูตรเดียวกันนี้คำนวณย้อนหลังทุกเดือนตั้งแต่ปี 2543 และประวัติชุดนั้นคือที่มาของความน่าจะเป็นในหน้านี้' }) + '</div></div>';
    /* the 8 variable cards */
    var K = [
      [{ en:'World GDP growth (IMF)', th:'เศรษฐกิจโลกโต (IMF)' }, pc(wg[String(yr)], 1) + ' → ' + pc(wg[String(yr + 1)], 1), { en:yr + ' → ' + (yr + 1) + ' forecast', th:'คาดการณ์ ' + (yr + 543) + ' → ' + (yr + 544) }, { en:'Real GDP growth of the whole world from the IMF World Economic Outlook. Around 3% is normal; below 2.5% feels like a global recession.', th:'การเติบโตของ GDP จริงทั้งโลกจาก IMF ราว 3% คือปกติ ต่ำกว่า 2.5% เทียบเท่าโลกถดถอย' }, (wg[String(yr + 1)] || 0) >= (wg[String(yr)] || 0) ? 'good' : 'bad'],
      [{ en:'G20 leading indicator (OECD)', th:'ดัชนีชี้นำ G20 (OECD)' }, f(g20.v, 2), { en:'6M ' + sg(g20.c6, 2) + ' · ' + mon(g20.t || ''), th:'6 ด. ' + sg(g20.c6, 2) + ' · ' + mon(g20.t || '') }, { en:'Orders, confidence, housing, credit and markets combined; turns 6–9 months before the economy. 100 = trend.', th:'รวมคำสั่งซื้อ ความเชื่อมั่น ที่อยู่อาศัย สินเชื่อ ตลาดเงิน เปลี่ยนทิศก่อนเศรษฐกิจ 6–9 เดือน 100 = แนวโน้ม' }, g20.v >= 100 ? (g20.c6 >= 0 ? 'good' : 'mid') : 'bad'],
      [{ en:'Countries improving', th:'ประเทศที่กำลังดีขึ้น' }, f(S.rising_share, 0) + '%', { en:f(S.above_share, 0) + '% above trend', th:f(S.above_share, 0) + '% อยู่เหนือแนวโน้ม' }, { en:'Share of 17 big economies whose leading indicator rose last month. Above 60% = broad upturn.', th:'สัดส่วนของ 17 เศรษฐกิจใหญ่ที่ดัชนีชี้นำขึ้นในเดือนล่าสุด เกิน 60% = ฟื้นทั่วโลก' }, S.rising_share >= 60 ? 'good' : S.rising_share < 40 ? 'bad' : 'mid'],
      [{ en:'Central banks: cuts / hikes', th:'ธนาคารกลาง: ลด / ขึ้น' }, (S.cuts != null ? S.cuts + ' / ' + S.hikes : '—'), { en:'of ' + S.n_cb + ', last 6 months', th:'จาก ' + S.n_cb + ' แห่ง ใน 6 เดือน' }, { en:'Policy rates from the BIS. More cuts = cheaper money worldwide.', th:'ดอกเบี้ยนโยบายจาก BIS ลดมากกว่า = เงินทั่วโลกถูกลง' }, tight ? 'bad' : easy ? 'good' : 'mid'],
      [{ en:'Median inflation', th:'เงินเฟ้อกลาง' }, pc(S.cpi_median, 1), { en:'6M ' + sg(S.cpi_median_6m, 2) + ' · ' + f(S.cpi_rising, 0) + '% rising', th:'6 ด. ' + sg(S.cpi_median_6m, 2) + ' · กำลังขึ้น ' + f(S.cpi_rising, 0) + '%' }, { en:'Consumer-price inflation across the countries (BIS), middle value. Rising inflation keeps rates high.', th:'เงินเฟ้อผู้บริโภคของทุกประเทศ (BIS) ใช้ค่ากลาง ถ้าขึ้น ดอกเบี้ยจะยังสูง' }, (S.cpi_median_6m || 0) > 0.2 ? 'bad' : (S.cpi_median_6m || 0) < -0.2 ? 'good' : 'mid'],
      [{ en:'Copper / gold', th:'ทองแดง/ทองคำ' }, spc(S.cugold_6m, 1), { en:'change in 6 months', th:'เปลี่ยนใน 6 เดือน' }, { en:'Factories buy copper, the fearful buy gold. Rising = markets expect stronger growth.', th:'โรงงานซื้อทองแดง คนกลัวซื้อทอง อัตราส่วนขึ้น = ตลาดคาดเศรษฐกิจแข็งแรง' }, (S.cugold_6m || 0) > 5 ? 'good' : (S.cugold_6m || 0) < -5 ? 'bad' : 'mid'],
      [{ en:'US dollar (DXY)', th:'ดอลลาร์ (DXY)' }, f(dxy.price, 1), { en:'3M ' + spc(dxy.m3, 1), th:'3 ด. ' + spc(dxy.m3, 1) }, { en:'A strong dollar pulls money out of emerging markets, including Thailand.', th:'ดอลลาร์แข็งดึงเงินออกจากตลาดเกิดใหม่ รวมถึงไทย' }, dxy.m3 > 2 ? 'bad' : dxy.m3 < -2 ? 'good' : 'mid'],
      [{ en:'World inflation (IMF)', th:'เงินเฟ้อโลก (IMF)' }, pc(wi[String(yr)], 1) + ' → ' + pc(wi[String(yr + 1)], 1), { en:yr + ' → ' + (yr + 1), th:(yr + 543) + ' → ' + (yr + 544) }, { en:'IMF average inflation. Falling toward 3% lets central banks cut.', th:'เงินเฟ้อเฉลี่ยที่ IMF คาด ถ้าลงใกล้ 3% ธนาคารกลางลดดอกเบี้ยได้' }, (wi[String(yr + 1)] || 0) < (wi[String(yr)] || 0) ? 'good' : 'bad']
    ];
    h += '<div class="bz-wkg">' + K.map(function(k){ return '<div class="bz-wk ' + k[4] + '"><span>' + esc(T(k[0])) + '</span><b>' + esc(k[1]) + '</b><em>' + esc(T(k[2])) + '</em><p>' + esc(T(k[3])) + '</p></div>'; }).join('') + '</div>';
    /* ---------------- 4. what comes next + scenario calculator */
    if(pb){
      h += '<div class="bz-row"><div class="bz-sec s4"><h4>' + ico('history') + esc(T({ en:'The world\'s path, last 2 years', th:'เส้นทางของโลก 2 ปีล่าสุด' })) + '</h4>' + trailSVG(pb, { g:S.gmom || 0, i:S.imom || 0 }, O && O.ph6) + note({ en:'Each dot is a month (small arrows show the direction); the big dot is today. The coloured arrow points where history says the world is likely heading over the next 6 months. The world usually travels anticlockwise: recovery → overheat → stagflation → slowdown → recovery.', th:'แต่ละจุดคือ 1 เดือน (ลูกศรเล็กบอกทิศที่วิ่ง) จุดใหญ่คือตอนนี้ ลูกศรสีคือทิศที่สถิติบอกว่าโลกน่าจะไปใน 6 เดือนข้างหน้า โลกมักวนทวนเข็มนาฬิกา: ฟื้นตัว → ร้อนแรง → ชะลอแต่ของแพง → ชะลอตัว → ฟื้นตัว' }) + '</div>' +
        '<div class="bz-sec s8"><details class="bz-wadv"><summary>' + ico('sliders') + '<b>' + esc(T({ en:'Try your own scenario (advanced)', th:'ลองตั้งสถานการณ์เอง (ขั้นสูง)' })) + '</b><span>' + esc(T({ en:'The auto plan above already does this for you. Open to drag the sliders yourself.', th:'แผนอัตโนมัติด้านบนคำนวณให้แล้ว เปิดตรงนี้ถ้าอยากเลื่อนแถบลองเอง' })) + '</span></summary>' + calcHTML(pb, S) + '</details></div></div>';
    }
    /* ---------------- 5. sectors that gain / lose */
    if(pb && astPh.length){
      var mx = Math.max.apply(null, astPh.map(function(x){ return Math.abs(x[1][0]); }).concat([1]));
      var tb = P0.etf || [], ta = P0.avoid || [];
      var bar = function(x){ var v = x[1][0], w = Math.abs(v) / mx * 50, why = AST_WHY[x[0]]; return '<div class="bz-wsr ' + (v >= 0 ? 'up' : 'dn') + '"><div class="n"><b>' + esc(astName(x[0])) + ' <small>' + esc(x[0]) + '</small>' + (tb.indexOf(x[0]) >= 0 ? '<u title="' + esc(T({ en:'textbook pick for this phase', th:'ตำราบอกว่าเด่นในช่วงนี้' })) + '">★</u>' : ta.indexOf(x[0]) >= 0 ? '<u class="x" title="' + esc(T({ en:'textbook says avoid', th:'ตำราบอกให้เลี่ยง' })) + '">✕</u>' : '') + '</b><span>' + esc(why ? T(why) : '') + '</span></div><div class="b"><i style="' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%"></i></div><div class="v"><b>' + spc(v, 1) + '</b><span>' + esc(T({ en:'won ', th:'ชนะ ' })) + Math.round(x[1][1]) + '% · ' + x[1][2] + esc(T({ en:' mo', th:' ด.' })) + '</span></div></div>'; };
      var spyS = pb.ast.SPY && pb.ast.SPY.ph[pi];
      var mods = [];
      if(tight) mods.push({ en:'Global tightening favours banks and cash-rich “value” companies over expensive growth stocks.', th:'โลกขึ้นดอกเบี้ย เอื้อธนาคารและหุ้นคุณค่าที่มีเงินสดมาก มากกว่าหุ้นเติบโตราคาแพง' });
      if(easy) mods.push({ en:'Global easing lifts growth stocks, small caps, real estate and emerging markets.', th:'โลกลดดอกเบี้ย หนุนหุ้นเติบโต หุ้นเล็ก อสังหาฯ และตลาดเกิดใหม่' });
      if((S.cugold_6m || 0) > 8) mods.push({ en:'Copper outrunning gold: markets price stronger industry — materials, industrials and commodity exporters benefit.', th:'ทองแดงแรงกว่าทอง: ตลาดมองภาคอุตสาหกรรมแข็งแรง กลุ่มวัสดุ อุตสาหกรรม และประเทศส่งออกสินค้าโภคภัณฑ์ได้ประโยชน์' });
      if((S.cugold_6m || 0) < -8) mods.push({ en:'Gold outrunning copper: markets are defensive — gold, quality and defensive sectors lead.', th:'ทองแรงกว่าทองแดง: ตลาดตั้งรับ ทอง หุ้นคุณภาพ และกลุ่มตั้งรับนำ' });
      if((dxy.m3 || 0) > 2) mods.push({ en:'A firm dollar is a headwind for emerging markets, including Thailand.', th:'ดอลลาร์แข็งเป็นแรงต้านต่อตลาดเกิดใหม่รวมถึงไทย' });
      if((dxy.m3 || 0) < -2) mods.push({ en:'A softer dollar helps emerging markets, Thailand and commodities.', th:'ดอลลาร์อ่อนช่วยตลาดเกิดใหม่ ไทย และสินค้าโภคภัณฑ์' });
      var chn = rows.filter(function(r){ return r.c === 'CHN'; })[0];
      if(chn && chn.phase) mods.push(chn.phase === 'slowdown' || chn.phase === 'downturn' ? { en:'China is ' + T(CPH[chn.phase]).toLowerCase() + ': Thai exporters to China, tourism and petrochemicals face softer demand.', th:'จีนกำลัง' + CPH[chn.phase].th + ': ผู้ส่งออกไทยไปจีน ท่องเที่ยว และปิโตรเคมี เจอความต้องการที่อ่อนลง' } : { en:'China is in ' + T(CPH[chn.phase]).toLowerCase() + ': supportive for Thai exports, tourism and metals.', th:'จีนอยู่ช่วง' + CPH[chn.phase].th + ': เป็นผลดีต่อการส่งออกของไทย ท่องเที่ยว และโลหะ' });
      h += '<div class="bz-row"><div class="bz-sec s8"><h4>' + ico('layers') + esc(T({ en:'Which groups gain and which lose in a “' + P0.short.en + '” world', th:'กลุ่มไหนได้ประโยชน์ กลุ่มไหนเสียประโยชน์ เมื่อโลกอยู่ช่วง “' + P0.short.th + '”' })) + '</h4>' +
        '<p class="bz-wsl0">' + esc(T({ en:'Bar = average return over the next 6 months minus the S&P 500, across every past month in this phase since ' + pb.first.slice(0, 4) + '. The US market itself averaged ' + spc(spyS && spyS[0], 1) + ' (up ' + Math.round(spyS ? spyS[1] : 0) + '% of the time).', th:'แท่ง = ผลตอบแทนเฉลี่ย 6 เดือนถัดไป ลบด้วย S&P 500 จากทุกเดือนในอดีตที่อยู่ช่วงนี้ (ตั้งแต่ปี ' + (+pb.first.slice(0, 4) + 543) + ') ส่วนตลาดหุ้นสหรัฐฯ เองเฉลี่ย ' + spc(spyS && spyS[0], 1) + ' (บวก ' + Math.round(spyS ? spyS[1] : 0) + '% ของครั้ง)' })) + '</p>' +
        '<div class="bz-wsbar">' + astPh.map(bar).join('') + '</div>' + note({ en:'★ = textbook favourite for this phase, ✕ = textbook says avoid. Where the bars disagree with the textbook, the real data since 2000 wins — shown so you can judge. Overlapping 6-month windows: months are not independent, so treat small differences as noise.', th:'★ = ตำราว่าเด่นในช่วงนี้ ✕ = ตำราว่าควรเลี่ยง ถ้าแท่งไม่ตรงกับตำรา แปลว่าข้อมูลจริงตั้งแต่ปี 2543 ไม่ได้เป็นตามตำรา (ให้ดูเทียบเอง) แต่ละเดือนใช้ช่วง 6 เดือนที่ซ้อนกัน จึงไม่อิสระต่อกัน ส่วนต่างเล็กๆ ถือว่าเป็นสัญญาณรบกวน' }) + '</div>' +
        '<div class="bz-sec s4"><h4>' + ico('star') + esc(T({ en:'Why — and what else matters now', th:'ทำไม — และปัจจัยอื่นที่ต้องดูตอนนี้' })) + '</h4><p class="bz-wwhy">' + esc(T(P0.why)) + '</p>' +
        (mods.length ? '<ul class="bz-basis">' + mods.map(function(m){ return '<li>' + esc(T(m)) + '</li>'; }).join('') + '</ul>' : '') +
        '<h6 class="bz-wh6">' + esc(T({ en:'Countries with the best backdrop', th:'ประเทศที่สภาวะเอื้อที่สุด' })) + '</h6><div class="bz-wctry">' + best.map(function(x){ return '<span><b>' + esc(T(x.r)) + '</b><em>' + esc(x.r.etf) + ' · ' + sg(x.s, 2) + '</em></span>'; }).join('') + '</div>' +
        '<h6 class="bz-wh6">' + esc(T({ en:'Weakest backdrop', th:'สภาวะอ่อนที่สุด' })) + '</h6><div class="bz-wctry dn">' + worst.map(function(x){ return '<span><b>' + esc(T(x.r)) + '</b><em>' + esc(x.r.etf) + ' · ' + sg(x.s, 2) + '</em></span>'; }).join('') + '</div></div></div>';
    }
    /* ---------------- 8. map + clock, cycle scatter */
    var MET = [['score', { en:'Overall score', th:'คะแนนรวม' }], ['gdp', { en:'Growth next year', th:'GDP ปีหน้า' }], ['cli', { en:'Cycle phase', th:'ช่วงวัฏจักร' }], ['rate', { en:'Policy rate', th:'ดอกเบี้ยนโยบาย' }], ['cpi', { en:'Inflation', th:'เงินเฟ้อ' }]];
    h += '<div class="bz-row bz-wrow"><div class="bz-sec s8"><h4>' + ico('globe') + esc(T({ en:'World map — click a measure', th:'แผนที่โลก — กดเลือกสิ่งที่อยากดู' })) + '<span class="bz-pxr bz-wmet">' + MET.map(function(m){ return '<button type="button" data-wm="' + m[0] + '" class="' + (WM === m[0] ? 'on' : '') + '">' + esc(T(m[1])) + '</button>'; }).join('') + '</span></h4>' +
      '<div class="bz-wmap">' + rows.map(function(r){ return wTile(r, yr); }).join('') + '<i class="bz-wreg am">' + esc(T({ en:'Americas', th:'อเมริกา' })) + '</i><i class="bz-wreg eu">' + esc(T({ en:'Europe & Africa', th:'ยุโรปและแอฟริกา' })) + '</i><i class="bz-wreg as">' + esc(T({ en:'Asia-Pacific', th:'เอเชียแปซิฟิก' })) + '</i></div>' +
      note(WM === 'score' ? { en:'Score = growth next year vs its own 10-year average (35%) + leading indicator level and direction (35%) + policy easing (15%) + inflation cooling (15%), then 25% market momentum of the country ETF. Green = favourable, red = headwinds.', th:'คะแนน = GDP ปีหน้าเทียบค่าเฉลี่ย 10 ปีของตัวเอง (35%) + ระดับและทิศของดัชนีชี้นำ (35%) + การลดดอกเบี้ย (15%) + เงินเฟ้อที่ชะลอ (15%) แล้วผสมโมเมนตัมตลาดของ ETF ประเทศนั้น 25% เขียว = เอื้อ แดง = มีแรงต้าน' } : WM === 'gdp' ? { en:'IMF growth forecast for next year; colour compares it with the country\'s own 10-year average.', th:'GDP ปีหน้าที่ IMF คาด สีเทียบกับค่าเฉลี่ย 10 ปีของประเทศนั้นเอง' } : WM === 'cli' ? { en:'OECD leading indicator: green = expansion, amber = peaking, red = slowdown, cyan = recovery.', th:'ดัชนีชี้นำ OECD: เขียว = ขยายตัว เหลือง = เริ่มแผ่ว แดง = ชะลอ ฟ้า = ฟื้นตัว' } : WM === 'rate' ? { en:'Policy rate now; green = cut in the last 6 months, red = hiked. Euro members share the ECB rate.', th:'ดอกเบี้ยนโยบายตอนนี้ เขียว = ลดใน 6 เดือน แดง = ขึ้น ประเทศยูโรใช้ดอกเบี้ย ECB ร่วมกัน' } : { en:'Inflation now; green = falling over 6 months, red = rising.', th:'เงินเฟ้อตอนนี้ เขียว = ลดลงใน 6 เดือน แดง = เพิ่มขึ้น' }) + '</div>' +
      '<div class="bz-sec s4"><h4>' + ico('compass') + esc(T({ en:'Global investment clock', th:'นาฬิกาการลงทุนของโลก' })) + '</h4><div class="bz-clk">' + clockSVG(clamp(S.gmom * 1.4, -1, 1), clamp(S.imom * 1.4, -1, 1), ph) + '</div>' +
      '<ul class="bz-basis"><li>' + esc(T({ en:'Right/left = global growth momentum (' + sg(S.gmom, 2) + ').', th:'ขวา/ซ้าย = แรงส่งเศรษฐกิจโลก (' + sg(S.gmom, 2) + ')' })) + '</li><li>' + esc(T({ en:'Up/down = global inflation momentum (' + sg(S.imom, 2) + ').', th:'บน/ล่าง = แรงส่งเงินเฟ้อโลก (' + sg(S.imom, 2) + ')' })) + '</li><li>' + esc(T({ en:'Overheat with high inflation tends to end in stagflation or a slowdown — see the probabilities above.', th:'ช่วงร้อนแรงที่เงินเฟ้อสูงมักจบด้วยช่วง “ชะลอแต่ของแพง” หรือ “ชะลอตัว” ดูความน่าจะเป็นด้านบน' })) + '</li></ul></div></div>';
    h += '<div class="bz-row"><div class="bz-sec s6"><h4>' + ico('radar') + esc(T({ en:'Where each economy is in its cycle', th:'แต่ละประเทศอยู่ตรงไหนของวัฏจักร' })) + '</h4>' + cliScatter(rows) + note({ en:'Each dot is a country: right of centre = above its long-run trend; above centre = improving over 6 months. Countries tend to move clockwise: recovery → expansion → peaking → slowdown.', th:'แต่ละจุดคือ 1 ประเทศ ขวาของกลาง = สูงกว่าแนวโน้มระยะยาว เหนือกลาง = ดีขึ้นใน 6 เดือน ประเทศมักวนตามเข็มนาฬิกา: ฟื้นตัว → ขยายตัว → เริ่มแผ่ว → ชะลอ' }) + '</div>';
    /* forecasts table */
    var fr = [];
    var add = function(n, now, a, b, how){ fr.push('<tr><td><b>' + esc(T(n)) + '</b></td><td>' + now + '</td><td>' + a + '</td><td>' + b + '</td><td class="how">' + esc(T(how)) + '</td></tr>'); };
    add({ en:'World GDP growth', th:'เศรษฐกิจโลกโต' }, pc(wg[String(yr - 1)], 1) + ' <small>(' + (yr - 1) + ')</small>', pc(wg[String(yr)], 1) + ' <small>(' + yr + ')</small>', pc(wg[String(yr + 1)], 1) + ' <small>(' + (yr + 1) + ')</small>', { en:'IMF World Economic Outlook', th:'IMF World Economic Outlook' });
    add({ en:'World inflation', th:'เงินเฟ้อโลก' }, pc(wi[String(yr - 1)], 1), pc(wi[String(yr)], 1), pc(wi[String(yr + 1)], 1), { en:'IMF', th:'IMF' });
    var it = function(k, m){ var q = fcAt(F.items[k], m); return q ? q.v : null; };
    if(F.items.ff) add({ en:'Fed policy rate', th:'ดอกเบี้ยนโยบายเฟด' }, pc(F.items.ff.now, 2), pc(it('ff', 6), 2), pc(it('ff', 12), 2), { en:'T-bills + 2-year pricing, Taylor rule', th:'ราคาตั๋วเงินคลังและบอนด์ 2 ปี + กฎเทย์เลอร์' });
    if(F.items.y10) add({ en:'US 10-year yield', th:'บอนด์ยีลด์สหรัฐฯ 10 ปี' }, pc(F.items.y10.now, 2), pc(it('y10', 6), 2), pc(it('y10', 12), 2), { en:'fair value + trend, calibrated', th:'มูลค่าเหมาะสม + แนวโน้ม ปรับตามความแม่น' });
    if(F.items.spx) add({ en:'S&P 500 (SPY)', th:'S&P 500 (SPY)' }, f(F.items.spx.now, 0), f(it('spx', 6), 0), f(it('spx', 12), 0), { en:'earnings yield + regime + trend', th:'ผลตอบแทนกำไร + สภาวะ + แนวโน้ม' });
    if(F.dxy) add({ en:'US dollar (DXY)', th:'ดอลลาร์ (DXY)' }, f(F.dxy.now, 1), f(fcAt({ fc:F.dxy.fc }, 6).v, 1), f(fcAt({ fc:F.dxy.fc }, 12).v, 1), { en:'trend + rate differential', th:'แนวโน้ม + ส่วนต่างดอกเบี้ย' });
    if(F.items.oil) add({ en:'Crude oil (WTI)', th:'น้ำมันดิบ WTI' }, '$' + f(F.items.oil.now, 1), '$' + f(it('oil', 6), 1), '$' + f(it('oil', 12), 1), { en:'mean reversion + trend', th:'กลับหาค่าเฉลี่ย + แนวโน้ม' });
    var PXd = X('px');
    ['gold', 'btc'].forEach(function(a){ var A = PXd && PXd[a]; if(!A) return; var LV = pxLive(A, a), fc = pxFc(A, a, LV); add(PXN[a], pxMoney(LV.p, a), pxMoney(fc[3].mid, a), pxMoney(fc[4].mid, a), { en:'price model (Gold & bitcoin tab)', th:'โมเดลราคา (แท็บทอง & บิตคอยน์)' }); });
    ['EFA', 'EEM', 'THD'].forEach(function(sym){ var e = (F.exp || []).filter(function(x){ return x.sym === sym; })[0]; if(!e) return; add({ en:sym + ' (' + (e.I ? e.I.n : sym) + ')', th:sym + ' (' + (e.I ? e.I.n : sym) + ')' }, '—', spc(e.r, 1) + ' <small>' + esc(T({ en:'expected', th:'คาด' })) + '</small>', '', e.how); });
    h += '<div class="bz-sec s6"><h4>' + ico('radar') + esc(T({ en:'What comes next — forecasts for the big numbers', th:'ข้างหน้าจะเป็นอย่างไร — คาดการณ์ตัวเลขใหญ่' })) + '</h4><div class="bz-tw"><table class="bz-tbl bz-wft"><thead><tr><th></th><th>' + esc(T({ en:'Now', th:'ตอนนี้' })) + '</th><th>' + esc(T({ en:'6M / this yr', th:'6 ด. / ปีนี้' })) + '</th><th>' + esc(T({ en:'12M / next yr', th:'12 ด. / ปีหน้า' })) + '</th><th>' + esc(T({ en:'How', th:'คาดอย่างไร' })) + '</th></tr></thead><tbody>' + fr.join('') + '</tbody></table></div></div></div>';
    /* charts */
    var yrT = function(y){ return y + '-07-01'; };
    var GC = ['#e2e8f0', '#22d3ee', '#f472b6', '#a78bfa'];
    var gser = (Wd.groups || []).map(function(g, i){ var hh = g.gdp.filter(function(p){ return p[0] < yr; }).map(function(p){ return [yrT(p[0]), p[1]]; }), ff = g.gdp.filter(function(p){ return p[0] >= yr; }).map(function(p){ return { t:yrT(p[0]), v:p[1] }; }); return { name:{ en:g.en, th:g.th }, pts:hh, fc:ff, color:GC[i], w:i ? 1.8 : 2.8 }; });
    h += '<div class="bz-two">' + sec({ en:'GDP growth — history and IMF forecast', th:'การเติบโตของ GDP — อดีตและคาดการณ์ IMF' }, lineChart({ series:gser, unit:'%', dec:1, h:280, zero:true, legend:true }), 'globe') +
      sec({ en:'Leading indicators (100 = trend)', th:'ดัชนีชี้นำ (100 = แนวโน้ม)' }, lineChart({ series:[{ name:{ en:'G20', th:'G20' }, pts:(Wd.cli_G20 || []).filter(function(p){ return p[0] >= (yr - 6) + '-01'; }), color:'#e2e8f0', w:2.6 }, { name:{ en:'G7', th:'G7' }, pts:(Wd.cli_G7 || []).filter(function(p){ return p[0] >= (yr - 6) + '-01'; }), color:'#22d3ee' }, { name:{ en:'Big-5 Asia', th:'เอเชีย 5 ประเทศใหญ่' }, pts:(Wd.cli_A5M || []).filter(function(p){ return p[0] >= (yr - 6) + '-01'; }), color:'#f472b6' }, { name:{ en:'Big-4 Europe', th:'ยุโรป 4 ประเทศใหญ่' }, pts:(Wd.cli_G4E || []).filter(function(p){ return p[0] >= (yr - 6) + '-01'; }), color:'#fbbf24' }], dec:1, h:280, ref:[{ v:100, label:{ en:'trend', th:'แนวโน้ม' } }], rec:D.b && D.b.recessions }), 'trend') + '</div>';
    var eb = (Wd.easing || []).map(function(e){ return [e[0] + '-01', e[1] - e[2]]; }), ib = Wd.infl_breadth || [];
    h += '<div class="bz-row"><div class="bz-sec s4"><h4>' + ico('bank') + esc(T({ en:'Global easing: cuts minus hikes (6M)', th:'โลกผ่อนคลาย: จำนวนลด ลบ จำนวนขึ้น (6 ด.)' })) + '</h4>' + barChart(eb.slice(-72), { dec:0, h:240 }) + note({ en:'Above zero = more central banks cutting than hiking. Big positive waves have led global stocks higher 6–12 months later.', th:'เหนือศูนย์ = ธนาคารกลางที่ลดดอกเบี้ยมากกว่าที่ขึ้น คลื่นบวกใหญ่ๆ มักตามมาด้วยหุ้นทั่วโลกขึ้นใน 6–12 เดือน' }) + '</div>' +
      '<div class="bz-sec s4"><h4>' + ico('flame') + esc(T({ en:'Global inflation (median of big economies)', th:'เงินเฟ้อโลก (ค่ากลางของเศรษฐกิจใหญ่)' })) + '</h4>' + lineChart({ series:[{ name:{ en:'Median CPI', th:'เงินเฟ้อกลาง' }, pts:ib.slice(-72).map(function(x){ return [x[0], x[1]]; }), color:'#f472b6', w:2.4, area:true }], unit:'%', dec:1, h:240, band:{ lo:1.5, hi:3, label:{ en:'comfort zone', th:'โซนสบาย' } } }) + '</div>' +
      '<div class="bz-sec s4"><h4>' + ico('coin') + esc(T({ en:'Copper / gold — the market\'s growth gauge', th:'ทองแดง/ทองคำ — มาตรวัดเศรษฐกิจของตลาด' })) + '</h4>' + lineChart({ series:[{ name:{ en:'Copper ÷ gold (×1000)', th:'ทองแดง ÷ ทอง (×1000)' }, pts:(Wd.cugold || []).slice(-260), color:'#f97316', w:2.2 }], dec:2, h:240 }) + '</div></div>';
    /* country table */
    var trs = ranked.map(function(x, i){ var r = x.r, p = r.parts || {}; var chip = function(v, n){ return isNum(v) ? '<span class="bz-wpc ' + (v > 0.3 ? 'up' : v < -0.3 ? 'dn' : '') + '">' + esc(T(n)) + ' ' + sg(v, 1) + '</span>' : ''; };
      return '<tr><td><b>' + (i + 1) + '. ' + esc(T(r)) + '</b><small>' + esc(r.etf) + '</small></td><td>' + pc(r.gdp[String(yr)], 1) + ' → ' + pc(r.gdp[String(yr + 1)], 1) + '</td><td>' + (r.cli ? f(r.cli.v, 1) + ' <span style="color:' + CPH[r.phase].c + '">' + esc(T(CPH[r.phase])) + '</span>' : '—') + '</td><td>' + (r.rate ? pc(r.rate.v, 2) + ' <small>' + sg(r.rate.c6, 2) + '</small>' : '—') + '</td><td>' + (r.cpi ? pc(r.cpi.v, 1) + ' <small>' + sg(r.cpi.c6, 1) + '</small>' : '—') + '</td><td>' + spc(x.m3, 1) + '</td><td class="sc"><i style="background:' + scoreCol(x.s) + '"></i>' + sg(x.s, 2) + '</td><td class="parts">' + chip(p.growth, { en:'growth', th:'โต' }) + chip(p.cli, { en:'cycle', th:'วัฏจักร' }) + chip(p.easing, { en:'easing', th:'ลดดอกเบี้ย' }) + chip(p.cooling, { en:'cooling', th:'เงินเฟ้อลด' }) + chip(x.mom, { en:'market', th:'ตลาด' }) + '</td></tr>'; }).join('');
    h += sec({ en:'Every country, ranked', th:'จัดอันดับทุกประเทศ' }, '<div class="bz-tw"><table class="bz-tbl big bz-wct"><thead><tr><th></th><th>GDP ' + yr + ' → ' + (yr + 1) + '</th><th>' + esc(T({ en:'Leading indicator', th:'ดัชนีชี้นำ' })) + '</th><th>' + esc(T({ en:'Policy rate (6M)', th:'ดอกเบี้ย (6 ด.)' })) + '</th><th>' + esc(T({ en:'Inflation (6M)', th:'เงินเฟ้อ (6 ด.)' })) + '</th><th>ETF 3M</th><th>' + esc(T({ en:'Score', th:'คะแนน' })) + '</th><th>' + esc(T({ en:'What drives it', th:'อะไรขับเคลื่อน' })) + '</th></tr></thead><tbody>' + trs + '</tbody></table></div>' + note({ en:'Small numbers in brackets are the 6-month change.', th:'ตัวเลขเล็กคือการเปลี่ยนใน 6 เดือน' }), 'layers');
    /* variable dictionary */
    var V = [
      [{ en:'IMF GDP & inflation forecasts', th:'คาดการณ์ GDP และเงินเฟ้อของ IMF' }, 'IMF DataMapper', { en:'twice a year', th:'ปีละ 2 ครั้ง' }, { en:'Economists\' country-by-country projections, real GDP % and average CPI %.', th:'ประมาณการรายประเทศของนักเศรษฐศาสตร์ GDP จริง % และ CPI เฉลี่ย %' }],
      [{ en:'OECD leading indicators (CLI)', th:'ดัชนีชี้นำ OECD (CLI)' }, 'OECD SDMX', { en:'monthly', th:'รายเดือน' }, { en:'A blend of forward-looking series (orders, confidence, housing permits, yield spreads, share prices), smoothed and scaled so 100 = trend.', th:'ผสมข้อมูลที่มองไปข้างหน้า (คำสั่งซื้อ ความเชื่อมั่น ใบอนุญาตก่อสร้าง ส่วนต่างยีลด์ ราคาหุ้น) ปรับให้เรียบ และตั้ง 100 = แนวโน้ม' }],
      [{ en:'Central-bank policy rates', th:'ดอกเบี้ยนโยบายธนาคารกลาง' }, 'BIS', { en:'monthly', th:'รายเดือน' }, { en:'The official rate each central bank sets; we count how many cut or hiked over 6 months.', th:'อัตราดอกเบี้ยที่ธนาคารกลางแต่ละแห่งกำหนด นับจำนวนที่ลดหรือขึ้นใน 6 เดือน' }],
      [{ en:'Consumer prices (CPI y/y)', th:'ราคาผู้บริโภค (CPI เทียบปีก่อน)' }, 'BIS', { en:'monthly', th:'รายเดือน' }, { en:'% change in consumer prices vs a year earlier; median and share rising across countries.', th:'% เปลี่ยนของราคาผู้บริโภคเทียบปีก่อน ใช้ค่ากลางและสัดส่วนประเทศที่กำลังขึ้น' }],
      [{ en:'Copper ÷ gold', th:'ทองแดง ÷ ทองคำ' }, 'COMEX via Yahoo', { en:'weekly', th:'รายสัปดาห์' }, { en:'Industrial metal vs safe haven, a real-time market read of global growth.', th:'โลหะอุตสาหกรรมเทียบสินทรัพย์ปลอดภัย เป็นการอ่านเศรษฐกิจโลกแบบเรียลไทม์จากตลาด' }],
      [{ en:'Country ETFs (momentum)', th:'ETF รายประเทศ (โมเมนตัม)' }, 'Yahoo Finance', { en:'every 30 min', th:'ทุก 30 นาที' }, { en:'3-month return of each country\'s main ETF — where money is actually going.', th:'ผลตอบแทน 3 เดือนของ ETF หลักแต่ละประเทศ บอกว่าเงินกำลังไหลไปไหนจริงๆ' }],
      [{ en:'Phase history & outcomes', th:'ประวัติช่วงเศรษฐกิจและผลที่ตามมา' }, 'OECD · BIS · Yahoo · FRED', { en:'every 3 days', th:'ทุก 3 วัน' }, { en:'The two momentum scores rebuilt for every month since 2000, then what followed: phase 6/12 months later, US recession (FRED USREC), S&P 500 12-month return and worst drop, and the 6-month return of 20 sector/asset ETFs and ' + (pb ? Object.keys(pb.stk || {}).length : '—') + ' stocks vs their market. Measured from one month after each reading, because the data are published late.', th:'คำนวณคะแนนแรงส่งทั้งสองย้อนหลังทุกเดือนตั้งแต่ปี 2543 แล้วดูผลที่ตามมา: ช่วงเศรษฐกิจใน 6/12 เดือน การถดถอยของสหรัฐฯ (FRED USREC) ผลตอบแทนและการร่วงสูงสุดของ S&P 500 ใน 12 เดือน และผลตอบแทน 6 เดือนของ ETF 20 กลุ่ม และหุ้น ' + (pb ? Object.keys(pb.stk || {}).length : '—') + ' ตัวเทียบตลาด วัดผลเริ่ม 1 เดือนหลังข้อมูลแต่ละเดือน เพราะข้อมูลประกาศช้า' }]
    ];
    h += sec({ en:'Every input used here — where it comes from and how it is measured', th:'ตัวแปรทั้งหมดที่ใช้ในหน้านี้ — มาจากไหน วัดอย่างไร' }, '<div class="bz-tw"><table class="bz-tbl bz-wvt"><thead><tr><th></th><th>' + esc(T({ en:'Source', th:'แหล่ง' })) + '</th><th>' + esc(T({ en:'Updates', th:'อัปเดต' })) + '</th><th>' + esc(T({ en:'What it measures', th:'วัดอะไร' })) + '</th></tr></thead><tbody>' + V.map(function(v){ return '<tr><td><b>' + esc(T(v[0])) + '</b></td><td>' + esc(v[1]) + '</td><td>' + esc(T(v[2])) + '</td><td class="how">' + esc(T(v[3])) + '</td></tr>'; }).join('') + '</tbody></table></div>', 'book');
    return h;
  }
  function wireWorld(root){
    root.addEventListener('click', function(ev){
      var wc = ev.target.closest('[data-wcat]');
      if(wc && root.contains(wc)){ WCAT = wc.getAttribute('data-wcat'); try { localStorage.setItem('spz.brain.wcat', WCAT); } catch(e){} var bx = wc.closest('[data-wcatbox]'), AC3 = autoCtx(); if(bx && AC3) bx.outerHTML = stocksBlock(AC3); return; }
      var fg = ev.target.closest('[data-fcgo]');
      if(fg && root.contains(fg)){ var tgt = document.getElementById('bzfc-' + fg.getAttribute('data-fcgo')); if(tgt){ var y = tgt.getBoundingClientRect().top + window.pageYOffset - 140; window.scrollTo({ top:y, behavior:'smooth' }); tgt.classList.remove('bz-flash'); void tgt.offsetWidth; tgt.classList.add('bz-flash'); } return; }
      var gi = ev.target.closest('[data-grinv]');
      if(gi && root.contains(gi)){ GRINV = gi.getAttribute('data-grinv') === '1'; try { localStorage.setItem('spz.brain.grinv', GRINV ? '1' : '0'); } catch(e){} paint(); return; }
      var b = ev.target.closest('[data-wm]');
      if(b && root.contains(b)){ WM = b.getAttribute('data-wm'); try { localStorage.setItem('spz.brain.wm', WM); } catch(e){} paint(); return; }
      var pr = ev.target.closest('[data-wsc]');
      if(pr && root.contains(pr)){
        var Wd = X('world'), pb = X('wpb'), S = Wd && Wd.summary || {}, k = pr.getAttribute('data-wsc'), P = WPRE.filter(function(x){ return x[0] === k; })[0];
        if(!pb || !P) return;
        WSC = P[2] ? { g:P[2][0], i:P[2][1], fed:P[2][2], pre:k } : { g:S.gmom || 0, i:S.imom || 0, fed:pb.now && isNum(pb.now.fed) ? pb.now.fed : 0, pre:'now' };
        var box = pr.closest('.bz-wcalc'); if(box) box.outerHTML = calcHTML(pb, S);
        return;
      }
      var go = ev.target.closest('[data-wrgo],[data-wrpf]');
      if(go && root.contains(go)){
        var wrap = go.closest('[data-wrres]'), inp = wrap && wrap.querySelector('[data-wrin]');
        if(go.hasAttribute('data-wrpf')){ try { var w = currentWeights(pfState()); WROT = Object.keys(w).filter(function(t){ return w[t] > 0; }).join(', '); } catch(e){} }
        else if(inp) WROT = inp.value;
        try { localStorage.setItem('spz.brain.wrot', WROT); } catch(e){}
        var AC2 = autoCtx(); if(wrap && AC2) wrap.innerHTML = planHTML(AC2);
      }
    });
    root.addEventListener('input', function(ev){
      var s = ev.target.closest && ev.target.closest('[data-wsl]'); if(!s || !root.contains(s) || !WSC) return;
      var k = s.getAttribute('data-wsl'), v = parseFloat(s.value); WSC[k] = v; WSC.pre = '';
      var box = s.closest('.bz-wcalc'), pb = X('wpb'); if(!box || !pb) return;
      var lv = box.querySelector('[data-wslv="' + k + '"]'); if(lv) lv.textContent = k === 'fed' ? sg(v, 2) + ' ' + T({ en:'pts', th:'จุด' }) : sg(v, 2) + ' · ' + T(word(v, k === 'g' ? GW : IW));
      box.querySelectorAll('[data-wsc]').forEach(function(b){ b.classList.remove('on'); });
      var res = box.querySelector('[data-wcres]'); if(res) res.innerHTML = calcRes(pb, WSC);
    });
    root.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && ev.target.matches && ev.target.matches('[data-wrin]')){ var b = ev.target.parentNode.querySelector('[data-wrgo]'); if(b) b.click(); } });
  }
  XV.world = vWorld;
  (function(){ var i = 0; for(; i < TABS.length; i++) if(TABS[i][0] === 'px') break; TABS.splice(i + 1, 0, ['world', { en:'World outlook', th:'แนวโน้มเศรษฐกิจโลก' }, 'globe']); })();

  /* manual entry */
  var manItems2 = manItems;
  manItems = function(E, F){
    var s = manItems2(E, F), Wd = X('world'), S = Wd && Wd.summary || {};
    s[s.length - 1].items.splice(1, 0, { t:{ en:'World outlook', th:'แนวโน้มเศรษฐกิจโลก' },
      what:{ en:'IMF growth/inflation forecasts, OECD leading indicators for 17 big economies + G20/G7, BIS policy rates and CPI, copper/gold, country ETF momentum.', th:'คาดการณ์ GDP/เงินเฟ้อของ IMF ดัชนีชี้นำ OECD ของ 17 เศรษฐกิจใหญ่ + G20/G7 ดอกเบี้ยนโยบายและ CPI จาก BIS ทองแดง/ทอง และโมเมนตัม ETF รายประเทศ' },
      how:{ en:'Global growth momentum = G20 indicator 6-month change, share of countries rising, copper/gold trend. Inflation momentum = median CPI change and share rising. The two place the world on the investment clock; country score = growth vs own average 35% + leading indicator 35% + easing 15% + cooling inflation 15%, then 25% ETF momentum. History: the same two scores rebuilt monthly since 2000; probabilities and sector/stock stats come from what followed in similar months (6-month returns, measured one month after each reading).', th:'แรงส่งเศรษฐกิจโลก = ดัชนี G20 เปลี่ยนใน 6 เดือน + สัดส่วนประเทศที่ดัชนีขึ้น + แนวโน้มทองแดง/ทอง แรงส่งเงินเฟ้อ = ค่ากลางเงินเฟ้อที่เปลี่ยนไป + สัดส่วนที่กำลังขึ้น ทั้งสองตัววางโลกบนนาฬิกาการลงทุน คะแนนประเทศ = GDP เทียบค่าเฉลี่ยตัวเอง 35% + ดัชนีชี้นำ 35% + การลดดอกเบี้ย 15% + เงินเฟ้อชะลอ 15% แล้วผสมโมเมนตัม ETF 25% ประวัติ: คำนวณคะแนนทั้งสองย้อนหลังทุกเดือนตั้งแต่ปี 2543 ความน่าจะเป็นและสถิติกลุ่มหุ้น/หุ้นรายตัวมาจากสิ่งที่เกิดตามมาในเดือนที่คล้ายกัน (ผลตอบแทน 6 เดือน เริ่มวัด 1 เดือนหลังข้อมูล)' },
      why:{ en:'Thai and US stocks are moved by the world cycle; knowing the phase tells which sectors and countries usually lead.', th:'หุ้นไทยและสหรัฐฯ ขยับตามวัฏจักรโลก การรู้ช่วงทำให้รู้ว่ากลุ่มหุ้นและประเทศไหนมักนำ' },
      now:{ en:'G20 indicator ' + f(S.g20 && S.g20.v, 2) + ' · cuts ' + S.cuts + ' / hikes ' + S.hikes + ' · median inflation ' + pc(S.cpi_median, 1) + '.', th:'ดัชนี G20 ' + f(S.g20 && S.g20.v, 2) + ' · ลด ' + S.cuts + ' / ขึ้น ' + S.hikes + ' · เงินเฟ้อกลาง ' + pc(S.cpi_median, 1) } });
    return s;
  };

  /* ============================================ "WHAT AM I LOOKING AT?" (2026-10-26)
     A fold-out panel at the top of every tab: what each number on the page is
     and what to do with it. Screen only (not printed). */
  var X_ = function(label, what, use){ return { l:label, w:what, u:use }; };
  var EXPLAIN = {
    sum:[
      X_({ en:'Market score (0–100) and the weather', th:'คะแนนตลาด (0–100) และสภาพอากาศ' }, { en:'One number that sums up nine drivers (inflation, Fed, curve, jobs, dollar, credit, valuation, oil, trend). 50 = neutral. ≥70 clear skies · 56–70 partly cloudy · 44–56 overcast · 30–44 rain · <30 storm.', th:'ตัวเลขเดียวที่รวม 9 ปัจจัย (เงินเฟ้อ เฟด เส้นยีลด์ การจ้างงาน ดอลลาร์ สินเชื่อ ความแพง น้ำมัน แนวโน้ม) 50 = กลางๆ ≥70 ฟ้าใส · 56–70 มีเมฆบางส่วน · 44–56 ฟ้าครึ้ม · 30–44 ฝนตั้งเค้า · <30 พายุ' }, { en:'Use it to size how much risk to carry: above 56 lean toward stocks, 44–56 stay balanced, below 44 hold more bonds/cash and be choosier.', th:'ใช้กำหนดว่าจะรับความเสี่ยงแค่ไหน: เกิน 56 เอียงไปหุ้นได้ 44–56 ถือแบบสมดุล ต่ำกว่า 44 ถือบอนด์/เงินสดมากขึ้นและเลือกหุ้นให้เข้มขึ้น' }),
      X_({ en:'Positive / neutral / negative bar', th:'แถบ บวก / กลาง / ลบ' }, { en:'How many signals point up versus down, and how strongly they agree.', th:'สัญญาณกี่ตัวชี้ขึ้นเทียบกับชี้ลง และเห็นตรงกันแค่ไหน' }, { en:'Below 60% agreement = a mixed picture: keep positions smaller.', th:'ถ้าเห็นตรงกันต่ำกว่า 60% = ภาพปนกัน ควรลงทุนไม้เล็กลง' }),
      X_({ en:'Forecast cards (now → 6 months)', th:'การ์ดคาดการณ์ (ตอนนี้ → 6 เดือน)' }, { en:'Black number = today, coloured number = the forecast in 6 months, the small chart shows history + the likely range.', th:'เลขดำ = วันนี้ เลขสี = คาดการณ์อีก 6 เดือน กราฟเล็กคืออดีต + ช่วงที่น่าจะเป็น' }, { en:'Watch which way inflation, rates and jobs are heading — that drives which assets win.', th:'ดูว่าเงินเฟ้อ ดอกเบี้ย และการจ้างงานกำลังไปทางไหน เพราะเป็นตัวกำหนดว่าสินทรัพย์ไหนชนะ' }),
      X_({ en:'Colour map (24 months)', th:'แผนที่สี (24 เดือน)' }, { en:'Each row is one economic series, each square one month. Green = good for stocks, red = bad, judged against that series\' own history. The last row “Overall” averages every row.', th:'แต่ละแถวคือข้อมูลเศรษฐกิจ 1 ตัว แต่ละช่องคือ 1 เดือน เขียว = ดีต่อหุ้น แดง = ไม่ดี เทียบกับประวัติของตัวมันเอง แถวสุดท้าย “ภาพรวม” คือค่าเฉลี่ยทุกแถว' }, { en:'Scan from left to right: rows turning red are the problems that are growing; if the Overall row gets redder for several months, reduce risk.', th:'ไล่ดูจากซ้ายไปขวา แถวที่ค่อยๆ แดงขึ้นคือปัญหาที่กำลังโต ถ้าแถวภาพรวมแดงขึ้นหลายเดือนติด ควรลดความเสี่ยง' }),
      X_({ en:'Big table and “Where to lean”', th:'ตารางใหญ่ และ “ควรเอียงไปทางไหน”' }, { en:'Every key number with its 3- and 12-month forecast, what it is built from and what it means for stocks; then expected 6-month returns by asset.', th:'ตัวเลขสำคัญทุกตัว พร้อมคาดการณ์ 3 และ 12 เดือน วัดจากอะไร และผลต่อหุ้น จากนั้นคือผลตอบแทนคาด 6 เดือนของแต่ละสินทรัพย์' }, { en:'Tilt a portfolio toward the top of the list and away from the bottom; the faint band shows how much each can swing.', th:'เอียงพอร์ตไปทางตัวบนๆ ของรายการ และลดตัวล่างๆ แถบจางบอกว่าแต่ละตัวแกว่งได้แค่ไหน' })
    ],
    fc:[
      X_({ en:'Now → next, with announcement times', th:'ตอนนี้ → ครั้งหน้า พร้อมเวลาประกาศ' }, { en:'Each card: today\'s value and its month, what we expect at the next release (or in 6 months for market prices), and the next announcement date and time in Thai time, with a countdown.', th:'แต่ละการ์ด: ค่าล่าสุดพร้อมเดือนของข้อมูล ค่าที่เราคาดในการประกาศครั้งหน้า (หรืออีก 6 เดือนสำหรับราคาตลาด) และวันเวลาประกาศครั้งถัดไปตามเวลาไทย พร้อมนับถอยหลัง' }, { en:'Click a card to jump to its chart. Big surprises versus our number tend to move markets on the day.', th:'กดการ์ดเพื่อไปที่กราฟของตัวนั้น ถ้าตัวเลขจริงต่างจากที่คาดมาก ตลาดมักผันผวนในวันนั้น' }),
      X_({ en:'Top cards', th:'การ์ดด้านบน' }, { en:'Now → 6-month forecast for core inflation, the Fed rate, the 10-year yield, unemployment, the S&P 500 and oil.', th:'ตอนนี้ → คาดการณ์ 6 เดือน ของเงินเฟ้อพื้นฐาน ดอกเบี้ยเฟด บอนด์ 10 ปี ว่างงาน S&P 500 และน้ำมัน' }, { en:'A quick read of where the economy is going; open each chart below for the why.', th:'อ่านเร็วว่าเศรษฐกิจกำลังไปทางไหน แล้วดูเหตุผลในกราฟด้านล่าง' }),
      X_({ en:'Fan charts (purple zone)', th:'กราฟพัด (โซนม่วง)' }, { en:'Solid line = history; dashed = forecast; dark band = 68% likely, light band = 95%. Ranges are widened or narrowed by each model\'s real past accuracy.', th:'เส้นทึบ = อดีต เส้นประ = คาดการณ์ แถบเข้ม = โอกาส 68% แถบจาง = 95% ความกว้างปรับตามความแม่นจริงในอดีตของแต่ละโมเดล' }, { en:'Plan for the band, not only the line: if the bad edge would hurt you, protect against it.', th:'วางแผนตามช่วง ไม่ใช่แค่เส้นกลาง ถ้าขอบด้านแย่ทำให้เสียหาย ให้ป้องกันไว้ก่อน' }),
      X_({ en:'“Show the detail” under each chart', th:'“ดูละเอียด” ใต้กราฟ' }, { en:'Month-by-month path, the odds of crossing levels that matter (e.g. inflation above 3%) and what would change the forecast.', th:'เส้นทางรายเดือน โอกาสข้ามระดับสำคัญ (เช่น เงินเฟ้อเกิน 3%) และอะไรจะทำให้คาดการณ์เปลี่ยน' }, { en:'Use the odds to judge how likely a scenario you worry about really is.', th:'ใช้โอกาสนี้ประเมินว่าเรื่องที่กังวลมีโอกาสเกิดจริงแค่ไหน' }),
      X_({ en:'Fed meeting by meeting', th:'ดอกเบี้ยเฟดรายการประชุม' }, { en:'The rate now, our call for the next meeting and the decision time in Thai time (01:00 or 02:00 the next day); then the expected rate at each FOMC date and the odds of a 0.25 move, from T-bills and the 2-year yield. Thin lines on the fan charts are example paths, not predictions.', th:'ดอกเบี้ยตอนนี้ ค่าที่เราคาดในการประชุมครั้งหน้า และเวลาประกาศผลตามเวลาไทย (ตี 1 หรือตี 2 ของวันถัดไป) ตามด้วยดอกเบี้ยที่คาดในแต่ละวันประชุม และโอกาสขยับ 0.25 จากตั๋วเงินคลังและบอนด์ 2 ปี เส้นบางในกราฟพัดคือตัวอย่างเส้นทาง ไม่ใช่คำทำนาย' }, { en:'Know which meeting the market expects to move — surprises there move every asset.', th:'รู้ว่าตลาดคาดว่าจะขยับในการประชุมครั้งไหน ถ้าเฟดทำต่างจากที่คาด ทุกสินทรัพย์จะขยับ' }),
      X_({ en:'Leading index and recession odds', th:'ดัชนีชี้นำ และโอกาสถดถอย' }, { en:'Leading index (0–100 gauge) combines permits, claims, the curve, job openings, sentiment, credit, stocks and output; recession odds blend the NY Fed curve model with jobs/credit.', th:'ดัชนีชี้นำ (เกจ 0–100) รวมใบอนุญาตก่อสร้าง คนขอสวัสดิการ เส้นยีลด์ ตำแหน่งงานว่าง ความเชื่อมั่น สินเชื่อ หุ้น และการผลิต โอกาสถดถอยผสมโมเดลเส้นยีลด์ของเฟดนิวยอร์กกับข้อมูลการจ้างงาน/สินเชื่อ' }, { en:'Gauge under 45 or odds above 35% = time to be defensive.', th:'เกจต่ำกว่า 45 หรือโอกาสถดถอยเกิน 35% = ควรตั้งรับ' }),
      X_({ en:'S&P 500 range', th:'กรอบ S&P 500' }, { en:'Where the index could be in 1/3/6/12 months: centre from valuation + regime + trend, width from VIX.', th:'ดัชนีอาจอยู่ตรงไหนใน 1/3/6/12 เดือน ค่ากลางมาจากความแพง + สภาวะ + แนวโน้ม ความกว้างมาจาก VIX' }, { en:'Use the 95% low as a stress test for your portfolio.', th:'ใช้ขอบล่าง 95% เป็นสถานการณ์ทดสอบพอร์ตของคุณ' })
    ],
    px:[
      X_({ en:'Big chart', th:'กราฟใหญ่' }, { en:'Price history, 50/200-day averages, support (green) and resistance (red), the NOW label and purple forecast labels for 3, 6 and 12 months.', th:'ราคาย้อนหลัง เส้นเฉลี่ย 50/200 วัน แนวรับ (เขียว) แนวต้าน (แดง) ป้าย “ตอนนี้” และป้ายม่วงคาดการณ์ 3, 6, 12 เดือน' }, { en:'Hover anywhere to read the price on that day or the forecast range.', th:'ชี้ตรงไหนก็ได้เพื่อดูราคาวันนั้นหรือช่วงคาดการณ์' }),
      X_({ en:'Chance higher / +10% / −10%', th:'โอกาสสูงขึ้น / +10% / −10%' }, { en:'Probabilities from the calibrated forecast range.', th:'ความน่าจะเป็นจากช่วงคาดการณ์ที่ปรับตามความแม่นแล้ว' }, { en:'Above 60% “higher” with low −10% odds = a favourable set-up; near 50% = no edge.', th:'โอกาสสูงขึ้นเกิน 60% และโอกาสลง 10% ต่ำ = จังหวะเอื้อ ถ้าใกล้ 50% = ไม่ได้เปรียบ' }),
      X_({ en:'What to watch next', th:'จุดที่ต้องจับตาต่อไป' }, { en:'The nearest support and resistance and the odds of breaking each within a month.', th:'แนวรับแนวต้านที่ใกล้ที่สุด และโอกาสที่จะทะลุภายใน 1 เดือน' }, { en:'Natural places to set alerts, add on dips or cut losses.', th:'จุดที่เหมาะจะตั้งแจ้งเตือน ซื้อเพิ่มตอนย่อ หรือตัดขาดทุน' }),
      X_({ en:'Trend analysis', th:'วิเคราะห์แนวโน้ม' }, { en:'Short / medium / long trend from moving averages, RSI, MACD and momentum; signals list below.', th:'แนวโน้มสั้น/กลาง/ยาว จากเส้นเฉลี่ย RSI MACD และโมเมนตัม พร้อมรายการสัญญาณ' }, { en:'Act in the direction of the longer trend; use the short one for timing.', th:'ลงทุนตามทิศของแนวโน้มที่ยาวกว่า ใช้แนวโน้มสั้นเพื่อหาจังหวะ' }),
      X_({ en:'Gold vs real yields (gold only)', th:'ทองคำเทียบยีลด์จริง (เฉพาะทอง)' }, { en:'Gold on the left axis in $, the US 10-year real yield on the right axis in %, drawn upside down by default as banks do — so the lines move together when the textbook holds. Switch to a normal axis with the buttons; the shaded area starts at the last turn in real yields.', th:'ทองดูแกนซ้าย (ดอลลาร์) ยีลด์จริง 10 ปีดูแกนขวา (%) ค่าเริ่มต้นกลับหัวแบบที่สถาบันใช้ เวลาเป็นไปตามตำราสองเส้นจะไปทางเดียวกัน กดปุ่มเปลี่ยนเป็นแกนปกติได้ พื้นที่แรเงาเริ่มจากจุดกลับตัวล่าสุดของยีลด์จริง' }, { en:'If real yields start to fall, that is usually good for gold; if gold rises while yields rise, something else is driving it.', th:'ถ้ายีลด์จริงเริ่มลง มักดีต่อทอง ถ้าทองขึ้นทั้งที่ยีลด์ขึ้น แปลว่ามีแรงอื่นขับเคลื่อน' }),
      X_({ en:'Track record', th:'ความแม่นย้อนหลัง' }, { en:'Weekly walk-forward test since 2008 (gold) / 2018 (bitcoin).', th:'ทดสอบย้อนหลังรายสัปดาห์ ตั้งแต่ 2008 (ทอง) / 2018 (บิตคอยน์)' }, { en:'Trust 6–12 month calls more than 1-week ones.', th:'เชื่อคาดการณ์ 6–12 เดือนได้มากกว่า 1 สัปดาห์' })
    ],
    world:[
      X_({ en:'Top box: the world now', th:'กล่องบนสุด: เศรษฐกิจโลกตอนนี้' }, { en:'The phase name, one paragraph in plain words and four signals (growth, inflation, rates, what markets price), each on a red-to-green meter. On the right: what happened next in the 36 past months most like today.', th:'ชื่อช่วงเศรษฐกิจ ย่อหน้าสรุปภาษาง่าย และสัญญาณ 4 ตัว (เศรษฐกิจ เงินเฟ้อ ดอกเบี้ย ตลาดมองอย่างไร) บนแถบแดง-เขียว ด้านขวาคือสิ่งที่เกิดตามมาใน 36 เดือนในอดีตที่คล้ายตอนนี้ที่สุด' }, { en:'Coloured bar = chance of each phase 6 / 12 months ahead; compare the recession number with “normally”.', th:'แถบสี = โอกาสของแต่ละช่วงในอีก 6 / 12 เดือน ดูตัวเลขถดถอยเทียบกับ “ปกติ”' }),
      X_({ en:'Auto plan (yellow box)', th:'แผนอัตโนมัติ (กล่องสีเหลือง)' }, { en:'Worked out by the system on every refresh: (1) the scenarios for the next 6 months with their odds, the signals that would confirm each (✓ = already showing) and what to own if it happens; (2) what to own now with every scenario weighed by its odds — stocks also scored on five fund-manager factors (quality, earnings growth, momentum, price, analysts) — open the multi-factor scorecard to see every grade; (3) your stocks: keep, trim or switch, with an “If …” line per scenario.', th:'ระบบคำนวณให้ทุกครั้งที่ข้อมูลใหม่เข้า: (1) ฉากทัศน์ 6 เดือนข้างหน้าพร้อมโอกาส สัญญาณยืนยัน (✓ = เริ่มเห็นแล้ว) และควรถืออะไรถ้าเกิด (2) ตอนนี้ควรถืออะไร คิดรวมทุกฉากถ่วงตามโอกาส หุ้นให้คะแนน 5 ปัจจัยแบบกองทุนด้วย (คุณภาพ กำไรโต โมเมนตัม ราคา นักวิเคราะห์) เปิดตารางคะแนนหลายปัจจัยเพื่อดูเกรดทุกตัว (3) หุ้นที่คุณถือ ควรถือต่อ ลด หรือย้าย พร้อมบรรทัด “ถ้า…” ของแต่ละฉาก' }, { en:'When a scenario\'s ✓ count rises, follow its “If” line on your stock cards.', th:'เมื่อเครื่องหมาย ✓ ของฉากไหนเพิ่มขึ้น ให้ทำตามบรรทัด “ถ้า…” ของฉากนั้นในการ์ดหุ้นของคุณ' }),
      X_({ en:'How the phase is worked out', th:'คิดช่วงเศรษฐกิจอย่างไร' }, { en:'Every input with its raw value and the score (−1 to +1) it contributes; growth and inflation momentum are the averages.', th:'ทุกตัวแปรพร้อมค่าจริงและคะแนน (−1 ถึง +1) ที่มันให้ แรงส่งเศรษฐกิจและเงินเฟ้อคือค่าเฉลี่ย' }, { en:'See which input is pushing the world into this phase, and which one would have to change to leave it.', th:'ดูว่าตัวไหนดันโลกเข้าช่วงนี้ และต้องเปลี่ยนตัวไหนถึงจะออกจากช่วงนี้' }),
      X_({ en:'Path and your-own-scenario calculator', th:'เส้นทางของโลก และตัวช่วยตั้งสถานการณ์เอง' }, { en:'The last 24 months on the growth × inflation map; then pick a scenario (or drag the sliders) to see the odds of recession, stagflation and a 10% stock drop, and which groups did best in similar past months.', th:'24 เดือนล่าสุดบนแผนที่ เศรษฐกิจ × เงินเฟ้อ แล้วเลือกสถานการณ์ (หรือเลื่อนแถบ) เพื่อดูโอกาสถดถอย โอกาส “ชะลอแต่ของแพง” โอกาสหุ้นร่วง 10% และกลุ่มที่ทำได้ดีในอดีตที่คล้ายกัน' }, { en:'Ask “what if inflation keeps rising?” before it happens and see what history says to own.', th:'ถามว่า “ถ้าเงินเฟ้อยังขึ้นต่อจะเป็นอย่างไร” ก่อนเกิดจริง แล้วดูว่าสถิติบอกให้ถืออะไร' }),
      X_({ en:'Groups that gain / lose', th:'กลุ่มที่ได้ / เสียประโยชน์' }, { en:'21 sectors and assets ranked by their 6-month return vs the S&P 500 in this phase since 2000; ★ = textbook favourite, ✕ = textbook avoid.', th:'21 กลุ่มและสินทรัพย์ เรียงตามผลตอบแทน 6 เดือนเทียบ S&P 500 ในช่วงนี้ตั้งแต่ปี 2543 ★ = ตำราว่าเด่น ✕ = ตำราว่าเลี่ยง' }, { en:'Favour the top of the list, trim the bottom; the right panel adds today\'s dollar, China and rate effects.', th:'เพิ่มน้ำหนักตัวบนๆ ลดตัวล่างๆ แผงขวาเสริมผลของดอลลาร์ จีน และดอกเบี้ยตอนนี้' }),
      X_({ en:'Stock lists by type', th:'รายชื่อหุ้นตามประเภท' }, { en:'Buttons above the stock cards switch between the main list of 12, blue chips, dividend payers and fast earnings growth — all ranked by the same scenario + five-factor score.', th:'ปุ่มเหนือการ์ดหุ้นสลับได้ระหว่าง ควรถือตอนนี้ (รายชื่อหลัก 12 ตัว) หุ้นใหญ่หลัก ปันผลเด่น และกำไรโตแรง ทุกแบบเรียงด้วยคะแนนฉากทัศน์ + 5 ปัจจัยเดียวกัน' }, { en:'Pick the list that fits your goal (income, growth, safety), then check the company yourself.', th:'เลือกรายการที่ตรงเป้าหมาย (รายได้ปันผล เติบโต ความมั่นคง) แล้วศึกษาบริษัทเองอีกครั้ง' }),
      X_({ en:'Map, cycle chart, forecasts, ranking', th:'แผนที่ กราฟวัฏจักร คาดการณ์ และอันดับ' }, { en:'Country tiles (switch the measure), each country\'s position in its cycle, forecasts for the big numbers and every country ranked with its ETF.', th:'ช่องประเทศ (สลับสิ่งที่ดูได้) ตำแหน่งในวัฏจักรของแต่ละประเทศ คาดการณ์ตัวเลขใหญ่ และอันดับทุกประเทศพร้อม ETF' }, { en:'Green countries have the best backdrop; their ETFs are the simple way to own them.', th:'ประเทศสีเขียวมีสภาวะเอื้อที่สุด ซื้อผ่าน ETF ของประเทศนั้นได้ง่ายที่สุด' })
    ],
    track:[
      X_({ en:'Grade A–D', th:'เกรด A–D' }, { en:'How much better each forecast model has been than simply assuming “no change” — not how exact it is. A = misses ≥20% smaller, D = bigger misses than that guess.', th:'แต่ละโมเดลแม่นกว่าการเดาว่า “ไม่เปลี่ยน” มากแค่ไหน ไม่ได้บอกว่าแม่นเป๊ะ A = พลาดน้อยกว่าการเดา ≥20% D = พลาดมากกว่าการเดา' }, { en:'Lean on A/B models for direction and range; treat C/D as rough guides. Each card also shows today\'s value, the 6-month forecast and the usual miss.', th:'ใช้โมเดล A/B ดูทิศทางและกรอบ ส่วน C/D ใช้คร่าวๆ แต่ละการ์ดมีค่าวันนี้ คาด 6 เดือน และขนาดที่มักพลาด' }),
      X_({ en:'Inside the 68% range', th:'ตกในช่วง 68%' }, { en:'How often reality landed inside the forecast band; ideal ≈ 68%.', th:'ของจริงตกอยู่ในช่วงคาดการณ์บ่อยแค่ไหน ที่ดีคือราว 68%' }, { en:'The board already rescales the bands using this.', th:'ระบบใช้ค่านี้ปรับความกว้างช่วงให้อัตโนมัติแล้ว' })
    ],
    over:[
      X_({ en:'Gauge, clock and nine drivers', th:'เกจ นาฬิกา และ 9 ปัจจัย' }, { en:'The market score, the economic phase and each driver scored −2…+2 with its number.', th:'คะแนนตลาด ช่วงเศรษฐกิจ และแต่ละปัจจัยที่ให้คะแนน −2…+2 พร้อมตัวเลข' }, { en:'Red drivers are the reasons the score is not higher — watch them.', th:'ปัจจัยสีแดงคือเหตุผลที่คะแนนไม่สูงกว่านี้ ให้จับตา' }),
      X_({ en:'What changed / signals that disagree', th:'อะไรเปลี่ยนไป / สัญญาณที่ขัดกัน' }, { en:'Unusually large moves this month, and contradictions between markets.', th:'การขยับที่แรงผิดปกติในเดือนนี้ และความขัดแย้งระหว่างตลาด' }, { en:'Contradictions often resolve with a sharp move — be careful there.', th:'ความขัดแย้งมักจบด้วยการขยับแรง ให้ระวัง' })
    ],
    infl:[X_({ en:'Inflation, Fed and yields', th:'เงินเฟ้อ เฟด และยีลด์' }, { en:'Prices vs the 2% goal, the 2-year yield vs the Fed rate (what the market expects), real yields.', th:'ราคาเทียบเป้า 2% บอนด์ 2 ปีเทียบดอกเบี้ยเฟด (สิ่งที่ตลาดคาด) และยีลด์จริง' }, { en:'Inflation falling + 2-year below the Fed = cuts coming (good for bonds and growth stocks).', th:'เงินเฟ้อลด + บอนด์ 2 ปีต่ำกว่าดอกเบี้ยเฟด = ใกล้ลดดอกเบี้ย (ดีต่อบอนด์และหุ้นเติบโต)' })],
    liq:[X_({ en:'Net liquidity', th:'สภาพคล่องสุทธิ' }, { en:'Fed balance sheet − Treasury account − reverse repo: the cash the system has to invest.', th:'งบดุลเฟด − บัญชีกระทรวงการคลัง − reverse repo คือเงินที่ระบบมีไว้ลงทุน' }, { en:'Rising = tailwind for stocks and crypto; falling = headwind.', th:'เพิ่มขึ้น = แรงหนุนหุ้นและคริปโต ลดลง = แรงต้าน' })],
    growth:[X_({ en:'Recession checklist', th:'เช็กลิสต์ถดถอย' }, { en:'Ten warning lights (curve, Sahm rule, claims, jobs, credit, output, spending, sentiment, Fed model, trend).', th:'ไฟเตือน 10 ดวง (เส้นยีลด์ Sahm คนขอสวัสดิการ การจ้างงาน สินเชื่อ การผลิต การใช้จ่าย ความเชื่อมั่น โมเดลเฟด แนวโน้ม)' }, { en:'6 or more lit = serious: favour bonds, quality and cash.', th:'ติด 6 ดวงขึ้นไป = น่าห่วง ควรเน้นบอนด์ หุ้นคุณภาพ และเงินสด' })],
    alert:[X_({ en:'Warning cards', th:'การ์ดสัญญาณเตือน' }, { en:'Each rule: value now, trigger, how close (%), how often it fired since 1970, S&P 500 a year later and recession odds.', th:'แต่ละกฎ: ค่าตอนนี้ จุดเตือน ใกล้แค่ไหน (%) เกิดกี่ครั้งตั้งแต่ 1970 S&P 500 อีก 1 ปีต่อมา และโอกาสถดถอย' }, { en:'Several red cards together = reduce risk; Telegram tells you when a new one fires.', th:'หลายการ์ดแดงพร้อมกัน = ลดความเสี่ยง Telegram จะแจ้งเมื่อมีสัญญาณใหม่' })],
    fx:[X_({ en:'Currencies and commodities', th:'ค่าเงินและสินค้าโภคภัณฑ์' }, { en:'Dollar, baht and other currencies vs the dollar, oil, gold and every asset class\'s returns.', th:'ดอลลาร์ เงินบาท และสกุลอื่นเทียบดอลลาร์ น้ำมัน ทอง และผลตอบแทนของทุกสินทรัพย์' }, { en:'Strong dollar = headwind for Thailand and emerging markets.', th:'ดอลลาร์แข็ง = แรงต้านต่อไทยและตลาดเกิดใหม่' })],
    thai:[X_({ en:'Thailand', th:'เศรษฐกิจไทย' }, { en:'BOT policy rate vs Thai inflation (target 1–3%), gap with the Fed, the baht, IMF outlook.', th:'ดอกเบี้ย ธปท. เทียบเงินเฟ้อไทย (เป้า 1–3%) ส่วนต่างกับเฟด เงินบาท และมุมมอง IMF' }, { en:'High real rate + low inflation = room to cut (good for Thai stocks and bonds).', th:'ดอกเบี้ยแท้จริงสูง + เงินเฟ้อต่ำ = มีช่องลดดอกเบี้ย (ดีต่อหุ้นและบอนด์ไทย)' })],
    rot:[X_({ en:'Rotation map', th:'แผนที่การหมุนเวียน' }, { en:'Sectors and countries by 1-month vs 3-month strength.', th:'กลุ่มหุ้นและประเทศ ตามความแรง 1 เดือนเทียบ 3 เดือน' }, { en:'Bottom-right = just turning up (often the best entries); top-left = fading.', th:'ขวาล่าง = เพิ่งเริ่มขึ้น (มักเป็นจุดเข้าที่ดี) ซ้ายบน = กำลังหมดแรง' })],
    out:[X_({ en:'Three scenarios', th:'3 สถานการณ์' }, { en:'Odds for steady growth, inflation coming back and a growth scare, with tripwires.', th:'โอกาสของ ไปต่อแบบนุ่มนวล เงินเฟ้อกลับมา และเศรษฐกิจชะลอแรง พร้อมเส้นเตือน' }, { en:'Hold a little of what wins in the second-most-likely scenario as insurance.', th:'ถือสินทรัพย์ที่ชนะในสถานการณ์อันดับ 2 ไว้บ้างเป็นประกัน' })],
    analog:[X_({ en:'Past look-alikes', th:'อดีตที่คล้ายตอนนี้' }, { en:'The months since 1960 closest to today on 8 traits, and what followed.', th:'เดือนตั้งแต่ปี 1960 ที่คล้ายวันนี้ที่สุดใน 8 ด้าน และอะไรเกิดขึ้นต่อจากนั้น' }, { en:'Compare with “normal”: if look-alikes did worse than normal, be more careful.', th:'เทียบกับ “ปกติ” ถ้าช่วงที่คล้ายกันแย่กว่าปกติ ให้ระวังมากขึ้น' })],
    whatif:[X_({ en:'What if…', th:'ลองสมมติ' }, { en:'Move a slider (oil, Fed, inflation, jobs, yields, dollar, VIX, stocks) and the whole engine re-runs.', th:'เลื่อนแถบ (น้ำมัน เฟด เงินเฟ้อ การจ้างงาน ยีลด์ ดอลลาร์ VIX หุ้น) แล้วระบบคำนวณใหม่ทั้งหมด' }, { en:'Find which shock would hurt your portfolio most — then hedge it.', th:'หาว่าเหตุการณ์ไหนทำร้ายพอร์ตมากที่สุด แล้วป้องกันไว้' })],
    pf:[X_({ en:'My portfolio', th:'พอร์ตของฉัน' }, { en:'Health score, risk, stress tests, rebalancing and report cards for the selected portfolio.', th:'คะแนนสุขภาพ ความเสี่ยง ทดสอบวิกฤต การปรับสัดส่วน และสมุดพกของพอร์ตที่เลือก' }, { en:'Fix the red items first; “Use these weights” applies the suggestion.', th:'แก้ข้อสีแดงก่อน ปุ่ม “ใช้สัดส่วนนี้” ปรับตามคำแนะนำให้' })],
    cal:[X_({ en:'This week', th:'จับตาสัปดาห์นี้' }, { en:'Releases by day in Thai time, how much markets usually move on them, and our tripwires.', th:'ตัวเลขที่จะประกาศรายวันตามเวลาไทย ตลาดมักแกว่งแค่ไหนในวันนั้น และเส้นเตือนของเรา' }, { en:'Avoid adding big positions just before CPI, jobs or Fed days.', th:'หลีกเลี่ยงการเพิ่มไม้ใหญ่ก่อนวันประกาศ CPI การจ้างงาน หรือเฟด' })]
  };
  var XPL_OPEN = true;
  try { XPL_OPEN = localStorage.getItem('spz.brain.xpl') !== '0'; } catch(e){}
  function explainPanel(k){
    var L2 = EXPLAIN[k]; if(!L2) return '';
    var g = null; for(var i = 0; i < GUIDE.length; i++) if(GUIDE[i][0] === k) g = GUIDE[i];
    return '<details class="bz-xpl"' + (XPL_OPEN ? ' open' : '') + ' data-xpl><summary>' + ico('book') + '<b>' + esc(T({ en:'What is on this page — and what to do with it', th:'หน้านี้มีค่าอะไรบ้าง — และเอาไปใช้ทำอะไร' })) + '</b>' + (g ? '<em>' + esc(T(g[3])) + '</em>' : '') + '</summary><div class="bz-xplg">' + L2.map(function(x){
      return '<div><h6>' + esc(T(x.l)) + '</h6><p><span>' + esc(T({ en:'What it is', th:'คืออะไร' })) + '</span>' + esc(T(x.w)) + '</p><p class="u"><span>' + esc(T({ en:'Use it to', th:'เอาไปใช้' })) + '</span>' + esc(T(x.u)) + '</p></div>';
    }).join('') + '</div></details>';
  }
  document.addEventListener('toggle', function(ev){ var d = ev.target; if(d && d.hasAttribute && d.hasAttribute('data-xpl')){ XPL_OPEN = d.open; try { localStorage.setItem('spz.brain.xpl', d.open ? '1' : '0'); } catch(e){} } }, true);

  /* ================================================== MENU HANDBOOK (2026-10-28)
     "What is each menu for, what do I look at, how do I read it, what do I
     do with it" — one card per menu, plus a "where do I find…?" finder.
     Shown on the How-to-read tab and printable as its own PDF. */
  var HB_T = { en:'Menu handbook — what each menu is for and how to use it', th:'คู่มือการใช้ทุกเมนู — แต่ละเมนูไว้ทำอะไร ดูอย่างไร' };
  var HBC = { sum:'#22d3ee', fc:'#f472b6', px:'#fbbf24', world:'#818cf8', track:'#34d399', over:'#a78bfa', infl:'#fb7185', liq:'#38bdf8', growth:'#fb923c', alert:'#f43f5e', fx:'#2dd4bf', thai:'#e879f9', rot:'#a3e635', out:'#c084fc', analog:'#fcd34d', whatif:'#60a5fa', pf:'#f472b6', cal:'#facc15', guide:'#67e8f9', print:'#cbd5e1' };
  var B_ = function(en, th){ return { en:en, th:th }; };
  var HB = {
    sum:{ p:B_('The whole picture on one screen: how the market is now, where it is heading and how to position.', 'ภาพรวมทั้งหมดในหน้าเดียว: ตอนนี้ตลาดเป็นอย่างไร ข้างหน้าจะไปทางไหน และควรวางเงินอย่างไร'),
      l:[B_('Market score 0–100 and its “weather” (clear skies → storm).', 'คะแนนตลาด 0–100 และ “สภาพอากาศ” (ฟ้าใส → พายุ)'), B_('The three lines: Now → Ahead → Positioning.', 'สรุป 3 บรรทัด: ตอนนี้ → ข้างหน้า → การจัดพอร์ต'), B_('The 6-month forecast cards and the 24-month colour map.', 'การ์ดคาดการณ์ 6 เดือน และแผนที่สี 24 เดือน')],
      r:[B_('Score 56+ helps stocks, 44–56 neutral, below 44 be careful.', 'คะแนน 56 ขึ้นไป เอื้อหุ้น · 44–56 กลางๆ · ต่ำกว่า 44 ระวัง'), B_('Colour map: a row turning red month after month is a growing problem; the “Overall” row red for several months = risk is rising.', 'แผนที่สี: แถวไหนแดงขึ้นเรื่อยๆ คือปัญหาที่กำลังโต แถว “ภาพรวม” แดงติดกันหลายเดือน = ความเสี่ยงสูงขึ้น'), B_('Positive/negative bar agreeing less than 60% = a mixed picture.', 'แถบบวก/ลบ เห็นตรงกันต่ำกว่า 60% = ภาพยังปนกัน')],
      a:[B_('Set how much risk the whole portfolio should carry.', 'ใช้กำหนดว่าพอร์ตโดยรวมควรรับความเสี่ยงแค่ไหน'), B_('Use the “Where to lean” table to see which assets to add or trim.', 'ดูตาราง “ควรเอียงไปทางไหน” ว่าสินทรัพย์ไหนควรเพิ่มหรือลด')], w:['over', 'fc'] },
    fc:{ p:B_('Where each key number (inflation, Fed rate, yields, jobs, oil, S&P 500) is heading over 3, 6 and 12 months — and when the next figure is announced.', 'ตัวเลขสำคัญ (เงินเฟ้อ ดอกเบี้ยเฟด ยีลด์ การจ้างงาน น้ำมัน S&P 500) จะไปทางไหนใน 3, 6, 12 เดือน และประกาศครั้งหน้าเมื่อไร'),
      l:[B_('Top row of cards: now → what we expect next → announcement date and Thai time.', 'แถวการ์ดบนสุด: ตอนนี้ → ค่าที่เราคาดครั้งหน้า → วันและเวลาประกาศ (เวลาไทย)'), B_('“Fed meeting by meeting”: rate now, our call, decision time.', '“ดอกเบี้ยเฟดรายการประชุม”: ดอกเบี้ยตอนนี้ ค่าที่เราคาด เวลาประกาศผล'), B_('The fan chart of each number.', 'กราฟพัดของแต่ละตัว')],
      r:[B_('Solid line = past, dashed = forecast, dark band = 68% likely, light = 95%. Thin lines = example paths, not predictions.', 'เส้นทึบ = อดีต · เส้นประ = ค่าคาด · แถบเข้ม = โอกาส 68% · แถบจาง = 95% · เส้นบาง = ตัวอย่างเส้นทาง ไม่ใช่คำทำนาย'), B_('Inflation falling + Fed cutting = good for stocks and bonds; 10-year yield rising = pressure on growth stocks.', 'เงินเฟ้อลง + เฟดลดดอกเบี้ย = ดีต่อหุ้นและบอนด์ · ยีลด์ 10 ปีขึ้น = กดดันหุ้นเติบโต')],
      a:[B_('On announcement day compare the real figure with ours — a big gap usually moves markets.', 'วันประกาศ ให้เทียบตัวเลขจริงกับที่เราคาด ถ้าต่างมาก ตลาดมักผันผวน'), B_('Plan for the bad edge of the band, not just the middle line.', 'วางแผนเผื่อขอบด้านแย่ของแถบ ไม่ใช่แค่เส้นกลาง')], w:['track', 'cal'] },
    px:{ p:B_('Gold and bitcoin: today\'s price and the likely range from 1 week to 12 months.', 'ทองคำและบิตคอยน์: ราคาวันนี้ และกรอบราคาที่น่าจะเป็นตั้งแต่ 1 สัปดาห์ถึง 12 เดือน'),
      l:[B_('Top box: price now (also in baht), chance of being higher in 6 months, 12-month target.', 'กล่องบนสุด: ราคาตอนนี้ (มีเป็นบาทด้วย) โอกาสสูงขึ้นใน 6 เดือน และเป้า 12 เดือน'), B_('Big chart: purple labels for 3, 6 and 12 months; support (green) and resistance (red).', 'กราฟใหญ่: ป้ายม่วง 3, 6, 12 เดือน · แนวรับ (เขียว) แนวต้าน (แดง)'), B_('Gold only: gold vs real yields.', 'เฉพาะทอง: กราฟทองเทียบยีลด์จริง')],
      r:[B_('“Higher in 6M” above 60% with low −10% odds = a favourable set-up; near 50% = no edge.', 'โอกาสสูงขึ้นเกิน 60% และโอกาสลง 10% ต่ำ = จังหวะเอื้อ · ใกล้ 50% = ไม่ได้เปรียบ'), B_('Price above the 200-day average = up-trend. Real yields falling usually helps gold.', 'ราคาเหนือเส้น 200 วัน = ขาขึ้น · ยีลด์จริงลดลงมักดีต่อทอง')],
      a:[B_('Use it for trend and range, not short-term timing (1-week calls have almost no edge).', 'ใช้ดูแนวโน้มและกรอบราคา ไม่ใช่จับจังหวะสั้น (คาด 1 สัปดาห์แทบไม่ได้เปรียบ)'), B_('Support/resistance = natural places to add on dips or set a stop.', 'แนวรับ/แนวต้าน = จุดที่เหมาะจะซื้อเพิ่มตอนย่อ หรือตั้งจุดตัดขาดทุน')], w:['world', 'infl'] },
    world:{ p:B_('Which phase the world economy is in, where it is heading, and which groups and stocks to own — worked out automatically.', 'เศรษฐกิจโลกอยู่ช่วงไหน กำลังไปทางไหน และควรถือกลุ่ม/หุ้นอะไร ระบบคำนวณให้อัตโนมัติ'),
      l:[B_('Top box: phase now, growth and inflation arrows, most likely phase in 6 months.', 'กล่องบน: ช่วงตอนนี้ ลูกศรเศรษฐกิจและเงินเฟ้อ ช่วงที่น่าจะเป็นใน 6 เดือน'), B_('Yellow “Auto plan”: 1) scenarios 2) what to own now 3) your stocks.', 'กล่องเหลือง “แผนอัตโนมัติ”: 1) ฉากทัศน์ 2) ควรถืออะไรตอนนี้ 3) หุ้นที่คุณถือ')],
      r:[B_('Four phases: recovery (stocks lead), overheat (commodities lead), stagflation (cash and gold), slowdown (bonds).', '4 ช่วง: ฟื้นตัว (หุ้นเด่น) · ร้อนแรง (สินค้าโภคภัณฑ์เด่น) · ชะลอแต่ของแพง (เงินสด/ทอง) · ชะลอตัว (บอนด์)'), B_('A scenario card with 4–5 of 5 ✓ = it is really happening.', 'การ์ดฉากทัศน์ที่มี ✓ 4–5 จาก 5 = กำลังเกิดจริง'), B_('Stock grades A–D on five factors: quality, earnings growth, momentum, price, analysts.', 'เกรดหุ้น A–D จาก 5 ปัจจัย: คุณภาพ กำไรโต โมเมนตัม ราคา นักวิเคราะห์')],
      a:[B_('Step 2: 12 stocks per market — the main list, or only blue chips, dividend payers or fast growers.', 'ขั้น 2: หุ้นตลาดละ 12 ตัว — รายชื่อหลัก หรือเฉพาะหุ้นใหญ่ ปันผลเด่น กำไรโตแรง'), B_('Step 3: type your stocks → keep / trim / switch, plus an “If …” line for each scenario.', 'ขั้น 3: พิมพ์หุ้นที่ถือ → ถือต่อ / ลด / ย้าย และบรรทัด “ถ้า…” ของแต่ละฉาก')], w:['rot', 'pf'] },
    track:{ p:B_('How accurate the forecasts have been, so you know which ones to trust.', 'ตรวจว่าคาดการณ์ในเว็บเคยแม่นแค่ไหน จะได้รู้ว่าควรเชื่อตัวไหนมากหรือน้อย'),
      l:[B_('“How to read the grades” box.', 'กล่อง “อ่านเกรดอย่างไร”'), B_('Each model card: grade, now → 6-month forecast, usual miss.', 'การ์ดแต่ละโมเดล: เกรด ตอนนี้ → คาด 6 เดือน และมักพลาดราวเท่าไร'), B_('Forecast vs reality charts.', 'กราฟคาดการณ์เทียบของจริง')],
      r:[B_('A grade = better than guessing “no change”, not “exact”. A ≥20% better, B 8–20%, C about the same, D worse.', 'เกรด = แม่นกว่าการเดาว่า “ไม่เปลี่ยน” ไม่ใช่แม่นเป๊ะ · A ดีกว่า ≥20% · B 8–20% · C พอๆ กัน · D แย่กว่า'), B_('“Inside the 68% range” near 68% = the band width is right.', '“ตกในช่วง 68%” ใกล้ 68% = ความกว้างของแถบพอดี')],
      a:[B_('Lean on A/B models for direction and range; treat C/D as rough guides.', 'ใช้โมเดล A/B ดูทิศทางและกรอบ ส่วน C/D ดูคร่าวๆ'), B_('Add the “usual miss” as a safety margin in your plan.', 'บวก “มักพลาดราว ±” เผื่อไว้ในแผน')], w:['fc', 'px'] },
    over:{ p:B_('Today\'s market conditions: the weather gauge, the investment clock and the nine things that move markets.', 'สภาวะตลาดวันนี้: เกจสภาพอากาศ นาฬิกาการลงทุน และ 9 เรื่องที่ขับเคลื่อนตลาด'),
      l:[B_('Gauge 0–100 and the clock quadrant.', 'เกจ 0–100 และตำแหน่งบนนาฬิกาการลงทุน'), B_('Nine pillars: inflation, Fed, yield curve, jobs, dollar, credit, valuation, oil, trend.', '9 เสา: เงินเฟ้อ เฟด เส้นยีลด์ งาน ดอลลาร์ สินเชื่อ ความแพง น้ำมัน แนวโน้ม'), B_('“What changed this month” and “Signals that disagree”.', '“อะไรเปลี่ยนไปในเดือนนี้” และ “สัญญาณที่ขัดกัน”')],
      r:[B_('Above 55 helps stocks, below 45 hurts. Red pillars are the ones dragging.', 'เกิน 55 ช่วยหุ้น ต่ำกว่า 45 กดดัน · เสาสีแดงคือตัวที่ฉุด')],
      a:[B_('Pillars that changed colour this month = what to watch next.', 'เสาที่เปลี่ยนสีในเดือนนี้ = เรื่องที่ต้องติดตามต่อ'), B_('Pick a style for the phase (growth, value, defensive).', 'เลือกสไตล์การลงทุนให้เข้ากับช่วง (เติบโต คุณค่า ตั้งรับ)')], w:['sum', 'infl'] },
    infl:{ p:B_('Prices, the Fed and bond yields.', 'ราคาสินค้า (เงินเฟ้อ) ธนาคารกลางสหรัฐฯ และยีลด์พันธบัตร'),
      l:[B_('Core inflation vs the 2% goal; Fed rate vs the Taylor rule.', 'เงินเฟ้อพื้นฐานเทียบเป้า 2% · ดอกเบี้ยเฟดเทียบกฎเทย์เลอร์'), B_('2-year vs 10-year yields and what bonds expect from the Fed.', 'ยีลด์ 2 ปีเทียบ 10 ปี และตลาดบอนด์คาดอะไรจากเฟด')],
      r:[B_('Inflation inside the green band (≈2%) = the Fed can relax.', 'เงินเฟ้ออยู่ในแถบเขียว (≈2%) = เฟดผ่อนคลายได้'), B_('2-year clearly below the Fed rate = market expects cuts; above = hikes. Inverted curve = recession warning.', 'บอนด์ 2 ปีต่ำกว่าดอกเบี้ยเฟดชัด = ตลาดคาดลด · สูงกว่า = คาดขึ้น · เส้นยีลด์กลับหัว = เตือนถดถอย')],
      a:[B_('Falling inflation + cuts → growth stocks and bonds benefit.', 'เงินเฟ้อลง + ลดดอกเบี้ย → หุ้นเติบโตและบอนด์ได้ประโยชน์'), B_('Rising inflation → careful with expensive stocks; commodities and banks hold up better.', 'เงินเฟ้อขึ้น → ระวังหุ้นแพง สินค้าโภคภัณฑ์และธนาคารมักทนกว่า')], w:['fc', 'liq'] },
    liq:{ p:B_('How much cash the Fed and the Treasury are putting into, or pulling out of, the financial system.', 'เงินที่เฟดและกระทรวงการคลังสหรัฐฯ อัดเข้า หรือดึงออกจากระบบการเงิน'),
      l:[B_('Net liquidity (Fed balance sheet − Treasury account − reverse repo) and its 3-month trend.', 'สภาพคล่องสุทธิ (งบดุลเฟด − บัญชีกระทรวงการคลัง − reverse repo) และแนวโน้ม 3 เดือน')],
      r:[B_('Rising = tailwind for stocks and crypto; falling = headwind.', 'เพิ่มขึ้น = แรงหนุนหุ้นและคริปโต · ลดลง = แรงต้าน')],
      a:[B_('Use it to confirm a trend: shrinking liquidity while stocks are expensive = extra caution.', 'ใช้ยืนยันแนวโน้ม: สภาพคล่องลดลงขณะที่หุ้นแพง = ต้องระวังเป็นพิเศษ')], w:['infl', 'px'] },
    growth:{ p:B_('Jobs, spending and the recession checklist.', 'การจ้างงาน การใช้จ่าย และเช็กลิสต์ภาวะถดถอย'),
      l:[B_('Unemployment and the Sahm rule; new jobs; GDPNow.', 'อัตราว่างงานและ Sahm rule · การจ้างงานใหม่ · GDPNow'), B_('The recession checklist tiles.', 'ช่องเช็กลิสต์ถดถอย')],
      r:[B_('6+ red tiles = serious. Sahm rule 0.5+ = a recession has likely started.', 'ช่องแดง 6 ช่องขึ้นไป = จริงจัง · Sahm rule 0.5 ขึ้นไป = ถดถอยน่าจะเริ่มแล้ว')],
      a:[B_('Many warnings → more defensive stocks and quality bonds, fewer cyclicals.', 'เตือนมาก → เพิ่มหุ้นตั้งรับและบอนด์คุณภาพ ลดหุ้นวัฏจักร')], w:['alert', 'world'] },
    alert:{ p:B_('15 classic warning signals, how close each one is right now, and how reliable each has been.', '15 สัญญาณเตือนคลาสสิก ตอนนี้ใกล้ทำงานแค่ไหน และในอดีตเชื่อได้แค่ไหน'),
      l:[B_('Red badge = firing now; amber = more than 70% of the way there.', 'ป้ายแดง = ทำงานอยู่ · ป้ายเหลือง = ใกล้เกิน 70%'), B_('Each rule\'s record after it fired.', 'ผลงานของแต่ละกฎหลังจากที่มันเตือน')],
      r:[B_('Several signals together matter much more than one.', 'หลายสัญญาณพร้อมกันสำคัญกว่าตัวเดียวมาก')],
      a:[B_('Reduce risk step by step — not sell everything on one signal.', 'ลดความเสี่ยงทีละขั้น ไม่ใช่ขายหมดเพราะสัญญาณเดียว')], w:['growth', 'analog'] },
    fx:{ p:B_('The dollar, the baht, oil, gold and copper.', 'ค่าเงินดอลลาร์ เงินบาท น้ำมัน ทองคำ และทองแดง'),
      l:[B_('Currency tiles (green = stronger vs the dollar), the DXY, oil, copper/gold.', 'ช่องค่าเงิน (เขียว = แข็งค่าเทียบดอลลาร์) · ดอลลาร์ DXY · น้ำมัน · ทองแดง/ทอง')],
      r:[B_('Strong dollar = pressure on emerging markets including Thailand. Copper beating gold = markets expect growth.', 'ดอลลาร์แข็ง = กดดันตลาดเกิดใหม่รวมถึงไทย · ทองแดงแรงกว่าทอง = ตลาดมองเศรษฐกิจดี')],
      a:[B_('Weak baht helps Thai exporters and tourism; include currency moves when you invest abroad.', 'บาทอ่อนช่วยผู้ส่งออกและท่องเที่ยวไทย · ลงทุนต่างประเทศต้องคิดผลของค่าเงินด้วย')], w:['thai', 'world'] },
    thai:{ p:B_('The Thai economy: Bank of Thailand rate, Thai inflation, the baht and the IMF outlook.', 'เศรษฐกิจไทย: ดอกเบี้ยแบงก์ชาติ เงินเฟ้อไทย เงินบาท และคาดการณ์ของ IMF'),
      l:[B_('Thai inflation vs the 1–3% target band; policy rate; baht; IMF growth.', 'เงินเฟ้อไทยเทียบแถบเป้าหมาย 1–3% · ดอกเบี้ยนโยบาย · เงินบาท · GDP ที่ IMF คาด')],
      r:[B_('Inflation below the band + slow growth = room to cut rates.', 'เงินเฟ้อต่ำกว่าแถบ + เศรษฐกิจโตช้า = มีโอกาสลดดอกเบี้ย')],
      a:[B_('Rate cuts help property and dividend stocks; banks\' margins narrow.', 'ลดดอกเบี้ย → อสังหาฯ และหุ้นปันผลได้ประโยชน์ ส่วนต่างดอกเบี้ยของธนาคารแคบลง')], w:['fx', 'world'] },
    rot:{ p:B_('Which sectors and countries money is flowing into or out of right now.', 'ตอนนี้เงินกำลังไหลเข้า หรือออกจาก กลุ่มอุตสาหกรรมและประเทศไหน'),
      l:[B_('Rotation map, flowing in / out lists, stock ideas.', 'แผนที่การหมุนเวียน · รายการไหลเข้า/ไหลออก · ไอเดียหุ้น')],
      r:[B_('Top-right = leading; bottom-right = just starting to improve (often the best entry); top-left to bottom-left = losing steam.', 'มุมขวาบน = กำลังนำ · ขวาล่าง = เพิ่งเริ่มดีขึ้น (มักเป็นจังหวะเข้าที่ดี) · ซ้ายบนไปซ้ายล่าง = กำลังหมดแรง')],
      a:[B_('Time entries and exits of a group; combine with the groups history favours on World outlook.', 'ใช้หาจังหวะเข้า/ออกของกลุ่ม คู่กับกลุ่มที่สถิติเข้าข้างในหน้าแนวโน้มเศรษฐกิจโลก')], w:['world', 'pf'] },
    out:{ p:B_('Three scenarios for the next 1–3 months, their odds and the tripwires that show which is unfolding.', '3 ฉากทัศน์ใน 1–3 เดือนข้างหน้า พร้อมโอกาส และสัญญาณที่บอกว่าฉากไหนกำลังเกิด'),
      l:[B_('The glowing card = the most likely path; the tripwires under each.', 'การ์ดขอบเรืองแสง = เส้นทางที่น่าจะเป็นที่สุด · สัญญาณเตือน (tripwire) ใต้แต่ละการ์ด')],
      r:[B_('If another scenario\'s tripwire trips, change your view.', 'ถ้าสัญญาณของอีกฉากเริ่มเกิด ให้ปรับมุมมอง')],
      a:[B_('Have a plan for all three — do not bet everything on one.', 'เตรียมแผนรับทั้ง 3 ฉาก ไม่เดิมพันฉากเดียว')], w:['world', 'whatif'] },
    analog:{ p:B_('The past months (since 1960) that looked most like today, and what happened next.', 'เดือนในอดีต (ตั้งแต่ปี 1960) ที่ภาพเศรษฐกิจคล้ายวันนี้ที่สุด และหลังจากนั้นเกิดอะไรขึ้น'),
      l:[B_('The list of look-alike periods and the outcome cards (stocks, bonds, gold afterwards).', 'รายชื่อช่วงที่คล้าย และการ์ดผลลัพธ์ (หุ้น บอนด์ ทอง หลังจากนั้น)')],
      r:[B_('Compare each outcome with “normal”: green = better than usual for stocks.', 'เทียบผลลัพธ์กับ “ปกติ”: เขียว = ดีกว่าปกติสำหรับหุ้น')],
      a:[B_('A range of possibilities, not a prediction — history never repeats exactly.', 'ใช้ดูความเป็นไปได้ ไม่ใช่คำทำนาย ประวัติศาสตร์ไม่ซ้ำเป๊ะ')], w:['alert', 'world'] },
    whatif:{ p:B_('Change oil, the Fed, inflation, jobs, yields, the dollar, VIX or stocks and see the effect on the market score and your portfolio.', 'ลองเปลี่ยนน้ำมัน เฟด เงินเฟ้อ งาน ยีลด์ ดอลลาร์ VIX หรือหุ้น แล้วดูผลต่อคะแนนตลาดและพอร์ต'),
      l:[B_('Ready-made scenarios first, then the sliders, then the result.', 'เริ่มจากสถานการณ์สำเร็จรูป → แถบเลื่อน → ผลลัพธ์')],
      r:[B_('See which factor moves the score the most.', 'ดูว่าปัจจัยไหนกระทบคะแนนมากที่สุด')],
      a:[B_('Stress-test your portfolio against the news you worry about (e.g. “oil spikes”) before it happens.', 'ทดสอบพอร์ตกับข่าวที่กังวล (เช่น “น้ำมันพุ่ง”) ก่อนเกิดจริง')], w:['pf', 'out'] },
    pf:{ p:B_('A health check of your portfolio: risk, stress tests, rebalancing and a report card per holding.', 'ตรวจสุขภาพพอร์ต: ความเสี่ยง การทดสอบวิกฤต การปรับสมดุล และการ์ดรายตัว'),
      l:[B_('Source (your account, a model or a simulation), holdings, overall risk, stress tests, rebalancing advice.', 'แหล่งพอร์ต (บัญชีของคุณ โมเดล หรือจำลอง) · หุ้นที่ถือ · ความเสี่ยงรวม · การทดสอบวิกฤต · คำแนะนำปรับพอร์ต')],
      r:[B_('High correlation = they fall together; one holding above 20% = too concentrated.', 'สหสัมพันธ์สูง = ลงพร้อมกัน · ตัวเดียวเกิน 20% = กระจุกเกินไป')],
      a:[B_('Use “Compare every portfolio style” to see which mix gives the best return for the risk; auto-picked baskets are judged by the honest walk-forward line.', 'ใช้ตาราง “เทียบพอร์ตทุกแบบ” ดูว่าแบบไหนคุ้มความเสี่ยงที่สุด ส่วนพอร์ตคัดอัตโนมัติให้ดูเส้นทดสอบแบบไม่รู้อนาคตเป็นหลัก'), B_('Rebalance with the suggestions; use “Your stocks” on World outlook to see what to switch to.', 'ปรับน้ำหนักตามคำแนะนำ และใช้ “หุ้นที่คุณถือ” ในหน้าแนวโน้มเศรษฐกิจโลกดูว่าควรย้ายไปตัวไหน')], w:['world', 'whatif'] },
    cal:{ p:B_('The economic releases due this week, in Thai time, and what to watch for.', 'ตัวเลขเศรษฐกิจที่จะประกาศในสัปดาห์นี้ (เวลาไทย) และสิ่งที่ต้องจับตา'),
      l:[B_('Day and time; red edge = high impact, amber = medium; the expected value.', 'วันและเวลา · ขอบแดง = สำคัญมาก · ขอบเหลือง = ปานกลาง · ค่าที่คาด')],
      r:[B_('A big gap between the real figure and the forecast = a volatile day.', 'ตัวเลขจริงต่างจากที่คาดมาก = วันนั้นตลาดมักผันผวน')],
      a:[B_('Avoid opening big positions just before a high-impact release.', 'หลีกเลี่ยงการเปิดสถานะใหญ่ก่อนตัวเลขสำคัญ')], w:['fc'] },
    guide:{ p:B_('This page: how to use the Market Brain, every menu explained, the glossary and the full manual.', 'หน้านี้: วิธีใช้สมองตลาด คำอธิบายทุกเมนู คำศัพท์ และคู่มือฉบับเต็ม'),
      l:[B_('“Where do I find…?” then the menu cards.', '“อยากรู้… ดูที่ไหน?” แล้วตามด้วยการ์ดของแต่ละเมนู')], r:[], a:[B_('Every tab also has a “What is on this page” panel at the top.', 'ทุกแท็บมีกล่อง “หน้านี้มีค่าอะไรบ้าง” อยู่ด้านบนด้วย')], w:[] },
    print:{ p:B_('Print or save any part as a PDF — full report, weekly, forecast, economy, portfolio, gold & bitcoin, history, this handbook or your own pick.', 'พิมพ์หรือบันทึกเป็น PDF ได้ทุกส่วน — ฉบับเต็ม รายสัปดาห์ พยากรณ์ เศรษฐกิจ พอร์ต ทอง & บิตคอยน์ ย้อนหลัง คู่มือนี้ หรือเลือกเอง'),
      l:[B_('1) choose a document 2) options 3) preview, then Print / Download PDF.', '1) เลือกเอกสาร 2) ตั้งค่า 3) ดูตัวอย่าง แล้วกดพิมพ์ / ดาวน์โหลด PDF')], r:[], a:[B_('On Safari choose the Safari option before printing so pages do not split.', 'ถ้าใช้ Safari ให้เลือกตัวเลือก Safari ก่อนพิมพ์ หน้าจะได้ไม่แตก')], w:[] }
  };
  var HB_Q = [
    [B_('Is the market good or bad right now?', 'ตอนนี้ตลาดดีหรือไม่ดี?'), ['sum', 'over']],
    [B_('What will the Fed do at the next meeting, and when is it announced?', 'เฟดจะขึ้น/ลดดอกเบี้ยไหม ประกาศกี่โมง?'), ['fc']],
    [B_('What will inflation / jobs come out at?', 'เงินเฟ้อ / ว่างงานจะออกมาเท่าไร?'), ['fc', 'cal']],
    [B_('Where will gold or bitcoin be in the future?', 'ทองหรือบิตคอยน์อนาคตจะเป็นเท่าไร?'), ['px']],
    [B_('Which stocks or groups should I own now?', 'ตอนนี้ควรถือหุ้น/กลุ่มไหน?'), ['world', 'rot']],
    [B_('Should I switch out of what I hold?', 'หุ้นที่ถืออยู่ควรถือต่อหรือย้าย?'), ['world', 'pf']],
    [B_('Is a recession coming?', 'เศรษฐกิจจะถดถอยไหม?'), ['fc', 'alert', 'growth']],
    [B_('How far can I trust these forecasts?', 'คาดการณ์เชื่อได้แค่ไหน?'), ['track']],
    [B_('What if oil spikes or the Fed hikes?', 'ถ้าน้ำมันพุ่ง หรือเฟดขึ้นดอกเบี้ย จะเป็นอย่างไร?'), ['whatif', 'world']],
    [B_('What is announced this week?', 'สัปดาห์นี้มีอะไรประกาศบ้าง?'), ['cal']],
    [B_('Thai economy and the baht?', 'เศรษฐกิจไทยและค่าเงินบาท?'), ['thai', 'fx']],
    [B_('I want a PDF report.', 'อยากได้รายงาน PDF'), ['print']]
  ];
  function tabInfo(k){ for(var i = 0; i < TABS.length; i++) if(TABS[i][0] === k) return TABS[i]; return null; }
  function hbChip(k){ var t = tabInfo(k); return t ? '<button type="button" class="bz-hbchip" data-go="' + k + '" style="--hc:' + (HBC[k] || '#22d3ee') + '">' + ico(t[2]) + esc(T(t[1])) + '</button>' : ''; }
  function handbookHTML(pr){
    var order = TABS.map(function(t){ return t[0]; }).filter(function(k){ return HB[k]; });
    var h = '<div class="bz-hbq"><h4>' + ico('compass') + esc(T({ en:'Where do I find…?', th:'อยากรู้… ต้องดูเมนูไหน?' })) + '</h4><div class="bz-hbqg">' + HB_Q.map(function(q){ return '<div><span>' + esc(T(q[0])) + '</span><div>' + q[1].map(hbChip).join('') + '</div></div>'; }).join('') + '</div></div>';
    var blk = function(cls, icon, lab, arr){ return arr && arr.length ? '<div class="bz-hbb ' + cls + '"><h6>' + ico(icon) + esc(T(lab)) + '</h6><ul>' + arr.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul></div>' : ''; };
    h += '<div class="bz-hbg">' + order.map(function(k, i){
      var t = tabInfo(k), e = HB[k];
      return '<div class="bz-hbc" style="--hc:' + (HBC[k] || '#22d3ee') + '"><div class="bz-hbh"><i>' + ico(t[2]) + '</i><div><small>' + esc(T({ en:'Menu ', th:'เมนูที่ ' })) + (i + 1) + '</small><b>' + esc(T(t[1])) + '</b></div>' + (pr ? '' : '<button type="button" class="bz-btn sm ghost" data-go="' + k + '">' + esc(T({ en:'Open', th:'เปิด' })) + ' →</button>') + '</div>' +
        '<p class="bz-hbp"><span>' + esc(T({ en:'What it is for', th:'เอาไว้ทำอะไร' })) + '</span>' + esc(T(e.p)) + '</p>' +
        blk('l', 'eye', { en:'Look at first', th:'ดูตรงไหนก่อน' }, e.l) + blk('r', 'book', { en:'How to read it', th:'อ่าน / วิเคราะห์อย่างไร' }, e.r) + blk('a', 'check', { en:'What to do with it', th:'เอาไปใช้ตัดสินใจอย่างไร' }, e.a) +
        (e.w && e.w.length ? '<div class="bz-hbw"><span>' + esc(T({ en:'Use together with', th:'ใช้คู่กับ' })) + '</span>' + e.w.map(hbChip).join('') + '</div>' : '') + '</div>';
    }).join('') + '</div>';
    return '<div class="bz-hb">' + h + '</div>';
  }
  XV.hb = function(){ return handbookHTML(true); };

  /* ============================================ ONE BRAIN FOR STOCK PICKS (2026-10-29)
     The World outlook, Rotation and My portfolio pages now pick stocks with
     the same engine: scenario history (how each stock did vs its market in
     the phases the world is likely to move into, weighted by the odds) +
     five fund-manager factors. My portfolio also gets:
       * an honest walk-forward test for the auto-picked baskets — the rules
         re-run every 4 weeks over the past year using only the prices known
         at the time (today's picks replayed on last year's prices would look
         better than reality, because stocks that already rose get picked)
       * a 12-month forecast fan for the portfolio and the market
       * a side-by-side comparison of every portfolio style */
  function smartPick(mkt, n){
    var AC = autoCtx(); if(!AC) return null;
    var caps = Object.keys(D.m.stocks).filter(function(t){ return D.m.stocks[t].cal === mkt; }).map(function(t){ return D.m.stocks[t].mcap || 0; }).sort(function(a, b){ return a - b; }), medCap = caps[Math.floor(caps.length / 2)] || 0;
    return holdNow(AC.probs, mkt, 60).filter(function(x){ return (x.s.mcap || 0) >= medCap * 0.6; }).slice(0, n).map(function(x){ return { t:x.t, sc:x.sc, sec:x.s.sector, c:card(x.t), x:x }; });
  }
  function wkDate(k){ return new Date((k * 7 - 3) * 864e5).toISOString().slice(0, 10); }
  function walkForward(mkt, n){
    var AC = autoCtx(); if(!AC) return null;
    var F = factors(), bench = weekly('SPY'), loc = mkt === 'th' ? weekly('THD') : null; if(!bench) return null;
    var weeks = Object.keys(bench).map(Number).sort(function(a, b){ return a - b; }), end = weeks[weeks.length - 1], start = end - 52;
    var at = function(m, k){ for(var j = 0; j < 3; j++){ var v = m[k - j]; if(v != null) return v; } return null; };
    var U = {}; Object.keys(D.m.stocks).forEach(function(t){ var s = D.m.stocks[t]; if(s.cal !== mkt || !pbS(t)) return; var m = weekly(t); if(m) U[t] = m; });
    var eq = 1, sp = 1, lc = 1, P = [[wkDate(start), 0]], S = [[wkDate(start), 0]], Lc = [[wkDate(start), 0]], picksLog = [];
    for(var k = start; k < end; k += 4){
      var c = [];
      Object.keys(U).forEach(function(t){
        var m = U[t], p = at(m, k), p13 = at(m, k - 13); if(!p || !p13) return;
        var ma = 0, cn = 0; for(var j = 0; j < 40; j++){ var v = at(m, k - j); if(v){ ma += v; cn++; } } if(cn < 30 || p < ma / cn) return;
        var x = stockExp(t, AC.probs); if(!x || x.cov < 60 || x.e <= 0) return;
        c.push({ t:t, sec:D.m.stocks[t].sector || '?', e:x.e, mom:p / p13 - 1, fz:F[t] || { q:0, g:0, va:0, an:0, has:[] } });
      });
      if(!c.length) continue;
      var mm = c.reduce(function(a, b){ return a + b.mom; }, 0) / c.length, sd = Math.sqrt(c.reduce(function(a, b){ return a + (b.mom - mm) * (b.mom - mm); }, 0) / c.length) || 1;
      c.forEach(function(z){ var fs = ['q', 'g', 'va', 'an'].filter(function(f2){ return z.fz.has && z.fz.has.indexOf(f2) >= 0; }).map(function(f2){ return z.fz[f2]; }); fs.push(clamp((z.mom - mm) / sd, -2, 2)); z.sc = 0.5 * clamp(z.e / 3, -2, 2) + 0.5 * fs.reduce(function(a, b){ return a + b; }, 0) / fs.length; });
      c.sort(function(a, b){ return b.sc - a.sc; });
      var per = {}, pk = c.filter(function(z){ per[z.sec] = (per[z.sec] || 0) + 1; return per[z.sec] <= 2; }).slice(0, n);
      picksLog.push([wkDate(k), pk.map(function(z){ return z.t; })]);
      for(var w = k; w < Math.min(k + 4, end); w++){
        var rs = pk.map(function(z){ var a = at(U[z.t], w), b = at(U[z.t], w + 1); return a && b ? b / a - 1 : 0; });
        eq *= 1 + rs.reduce(function(a, b){ return a + b; }, 0) / rs.length;
        var sa = at(bench, w), sb = at(bench, w + 1); if(sa && sb) sp *= sb / sa;
        if(loc){ var la = at(loc, w), lb = at(loc, w + 1); if(la && lb) lc *= lb / la; }
        P.push([wkDate(w + 1), (eq - 1) * 100]); S.push([wkDate(w + 1), (sp - 1) * 100]); if(loc) Lc.push([wkDate(w + 1), (lc - 1) * 100]);
      }
    }
    return { p:P, s:S, l:loc ? Lc : null, ret:(eq - 1) * 100, spy:(sp - 1) * 100, loc:loc ? (lc - 1) * 100 : null, picks:picksLog };
  }
  /* expected 12-month return of a weight map: ETFs from the board's 6-month
     expectations (x2); stocks = their market's expectation + their
     scenario-weighted edge (counted once, so a conservative 12-month tilt) */
  function pfExp12(W){
    var AC = autoCtx(), F = F_last || {}, spx = F.items && F.items.spx, s12 = spx && fcAt(spx, 12), spxE = s12 ? (s12.v / spx.now - 1) * 100 : 6;
    var exOf = function(sym){ return (F.exp || []).filter(function(z){ return z.sym === sym; })[0]; }, thd = exOf('THD'), thE = thd ? thd.r * 2 : spxE * 0.8;
    var tot = 0, e = 0;
    Object.keys(W).forEach(function(t){ var w = W[t]; if(!(w > 0)) return; var s = D.m.stocks && D.m.stocks[t], ex = exOf(t), x;
      if(ex) x = ex.r * 2; else if(t === 'SPY') x = spxE; else if(s && (s.cal === 'us' || s.cal === 'th')){ var se = AC ? stockExp(t, AC.probs) : null; x = (s.cal === 'th' ? thE : spxE) + (se ? clamp(se.e, -10, 10) : 0); } else x = spxE * 0.5;
      tot += w; e += w * x; });
    return tot ? { e:e / tot, spx:spxE, th:thE } : null;
  }
  function fanFrom(curve, exp, vol){
    if(!curve || !curve.length || !isNum(exp)) return null;
    var last = curve[curve.length - 1], base = 1 + last[1] / 100, d0 = new Date(tms(last[0]));
    return [3, 6, 12].map(function(m){ var d = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + m, d0.getUTCDate())), g = exp * m / 12, s = (vol || 15) * Math.sqrt(m / 12); return { t:d.toISOString().slice(0, 10), m:m, v:(base * (1 + g / 100) - 1) * 100, lo:(base * (1 + (g - s) / 100) - 1) * 100, hi:(base * (1 + (g + s) / 100) - 1) * 100 }; });
  }
  function spxFan(curve){
    var F = F_last || {}, it = F.items && F.items.spx; if(!it || !curve || !curve.length) return null;
    var base = 1 + curve[curve.length - 1][1] / 100;
    return it.fc.map(function(q){ return { t:q.t, m:q.m, v:(base * (q.v / it.now) - 1) * 100, lo:(base * (q.lo / it.now) - 1) * 100, hi:(base * (q.hi / it.now) - 1) * 100 }; });
  }
  var PFMODE_N = {
    cons:{ en:'ETFs: about 60% bonds, 25% stocks, 10% gold. Smallest swings, lowest return — for money you may need soon or if drops keep you awake.', th:'ETF: บอนด์ราว 60% หุ้น 25% ทอง 10% แกว่งน้อยที่สุด ผลตอบแทนต่ำสุด เหมาะกับเงินที่อาจต้องใช้เร็ว หรือคนที่รับการขาดทุนไม่ได้' },
    bal:{ en:'ETFs: about 50% world stocks, 35% bonds, 15% gold and commodities. The classic middle road.', th:'ETF: หุ้นทั่วโลกราว 50% บอนด์ 35% ทองและสินค้าโภคภัณฑ์ 15% สายกลางแบบคลาสสิก' },
    grow:{ en:'ETFs: about 85% stocks with a tech tilt. Higher long-run return, much bigger drops.', th:'ETF: หุ้นราว 85% เอียงไปทางเทค ระยะยาวได้มากกว่า แต่ร่วงแรงกว่ามาก' },
    autous:{ en:'8 US stocks chosen by the same engine as World outlook (scenario history + five factors), max 2 per sector. Can beat the market, but it is one country, all stocks, no bonds or gold.', th:'หุ้นสหรัฐฯ 8 ตัว คัดด้วยระบบเดียวกับหน้าแนวโน้มเศรษฐกิจโลก (สถิติฉากทัศน์ + 5 ปัจจัย) กลุ่มละไม่เกิน 2 ตัว มีโอกาสชนะตลาด แต่เป็นหุ้นล้วนประเทศเดียว ไม่มีบอนด์หรือทองช่วยพยุง' },
    autoth:{ en:'8 Thai stocks from the same engine. Same idea for the SET; Thai stocks also swing with the baht and China.', th:'หุ้นไทย 8 ตัว จากระบบเดียวกัน หลักการเดียวกันแต่เป็นตลาดไทย ซึ่งแกว่งตามค่าเงินบาทและจีนด้วย' }
  };
  function pfCompare(s){
    var rows = ['cons', 'bal', 'grow', 'autous', 'autoth'].map(function(k){
      var W = k.indexOf('auto') === 0 ? (function(){ var o = {}; autoPick(k === 'autous' ? 'us' : 'th', 8).forEach(function(r){ o[r.t] = 12.5; }); return o; })() : presetWeights(k, s.tilt);
      var A = analyse(W), X2 = pfExp12(W), wf = k.indexOf('auto') === 0 ? walkForward(k === 'autous' ? 'us' : 'th', 8) : null;
      var vol = A.risk && A.risk.vol, past = wf ? wf.ret : A.risk && A.risk.ret;
      return { k:k, n:k === 'autous' ? { en:'Auto-picked US', th:'คัดอัตโนมัติ US' } : k === 'autoth' ? { en:'Auto-picked Thai', th:'คัดอัตโนมัติ ไทย' } : PRESETS[k].n, past:past, vol:vol, dd:A.risk && A.risk.dd, exp:X2 && X2.e, ratio:X2 && vol ? X2.e / vol : null };
    });
    var best = function(key, hi){ var b = null; rows.forEach(function(r){ if(isNum(r[key]) && (!b || (hi ? r[key] > b[key] : r[key] < b[key]))) b = r; }); return b && b.k; };
    var bR = best('ratio', true), bE = best('exp', true), bV = best('vol', false);
    return '<div class="bz-tw"><table class="bz-tbl bz-pfcmp"><thead><tr><th></th><th>' + esc(T({ en:'Past year*', th:'ย้อนหลัง 1 ปี*' })) + '</th><th>' + esc(T({ en:'Swings / yr', th:'แกว่ง/ปี' })) + '</th><th>' + esc(T({ en:'Worst drop', th:'ร่วงหนักสุด' })) + '</th><th>' + esc(T({ en:'Expected 12M', th:'คาด 12 เดือน' })) + '</th><th>' + esc(T({ en:'Return per risk', th:'ผลตอบแทนต่อความเสี่ยง' })) + '</th><th></th></tr></thead><tbody>' +
      rows.map(function(r){ var tags = []; if(r.k === bR) tags.push(['good', { en:'best for the risk', th:'คุ้มความเสี่ยงที่สุด' }]); if(r.k === bE) tags.push(['mid', { en:'highest expected', th:'คาดได้มากสุด' }]); if(r.k === bV) tags.push(['cy', { en:'calmest', th:'แกว่งน้อยสุด' }]);
        return '<tr class="' + (s.mode === r.k ? 'on' : '') + '" data-pfmode="' + r.k + '"><td><b>' + esc(T(r.n)) + '</b><small>' + esc(T(PFMODE_N[r.k])) + '</small></td><td class="' + (r.past >= 0 ? 'up' : 'dn') + '">' + spc(r.past, 1) + '</td><td>' + pc(r.vol, 0) + '</td><td class="dn">' + spc(r.dd, 0) + '</td><td class="' + (r.exp >= 0 ? 'up' : 'dn') + '"><b>' + spc(r.exp, 1) + '</b></td><td>' + f(r.ratio, 2) + '</td><td>' + tags.map(function(g){ return '<span class="bz-pftag ' + g[0] + '">' + esc(T(g[1])) + '</span>'; }).join('') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      note({ en:'Click a row to switch. *Auto-picked rows use the honest walk-forward test (rules re-run every 4 weeks with only the prices known then); ETF rows use the fixed mix on last year\'s prices. Expected 12M = the board\'s forecasts for each holding (ETFs) or the market forecast plus the stock\'s scenario edge. Return per risk = expected ÷ swings: higher is better value for the risk taken. There is no single “best” — pick the highest return-per-risk you can live with when it drops.', th:'กดแถวเพื่อสลับไปดูพอร์ตนั้น *แถวคัดอัตโนมัติใช้การทดสอบแบบไม่รู้อนาคต (คัดใหม่ทุก 4 สัปดาห์ด้วยราคาที่รู้ ณ ตอนนั้น) ส่วนแถว ETF ใช้สัดส่วนคงที่กับราคาปีที่แล้ว คาด 12 เดือน = คาดการณ์ของระบบสำหรับแต่ละตัว (ETF) หรือคาดการณ์ตลาด + ความได้เปรียบตามฉากทัศน์ของหุ้นนั้น ผลตอบแทนต่อความเสี่ยง = คาด ÷ แกว่ง ยิ่งสูงยิ่งคุ้ม ไม่มีแบบไหน “ดีที่สุด” สำหรับทุกคน ให้เลือกแบบที่ผลตอบแทนต่อความเสี่ยงสูง และทนการร่วงของมันได้' });
  }
  function pfCurveBlock(A, W, s){
    var auto = s.mode === 'autous' || s.mode === 'autoth', mkt = s.mode === 'autoth' ? 'th' : 'us', wf = auto ? walkForward(mkt, 8) : null, X2 = pfExp12(W);
    var main = wf ? wf.p : A.curve.p, fanP = fanFrom(main, X2 && X2.e, A.risk && A.risk.vol), fanS = spxFan(A.curve.s);
    var ser = [{ name:wf ? { en:'Auto-pick, walk-forward (no hindsight)', th:'คัดอัตโนมัติ ทดสอบแบบไม่รู้อนาคต' } : { en:'This portfolio', th:'พอร์ตนี้' }, pts:main, color:COL.a, w:3, area:true, fc:fanP }, { name:{ en:'S&P 500', th:'S&P 500' }, pts:A.curve.s, color:COL.g, dash:'5 4', fc:fanS }];
    if(wf) ser.push({ name:{ en:'Today\'s 8 picks replayed (hindsight)', th:'หุ้น 8 ตัววันนี้ย้อนไปถือ (รู้อนาคต)' }, pts:A.curve.p, color:'#fbbf24', w:1.4, dash:'2 4' });
    if(wf && wf.l) ser.push({ name:{ en:'Thai market (THD)', th:'ตลาดหุ้นไทย (THD)' }, pts:wf.l, color:'#e879f9', w:1.6, dash:'5 4' });
    var lastP = main[main.length - 1][1], lastS = A.curve.s[A.curve.s.length - 1][1], p12 = fanP && fanP[2], s12 = fanS && fanS.filter(function(q){ return q.m === 12; })[0];
    var top = '<div class="bz-pfnow"><div><small>' + esc(T({ en:'Past year — now', th:'ย้อนหลัง 1 ปี — ตอนนี้' })) + '</small><b class="' + (lastP >= 0 ? 'up' : 'dn') + '">' + spc(lastP, 1) + '</b><em>S&P 500 ' + spc(lastS, 1) + (wf && wf.l ? ' · THD ' + spc(wf.loc, 1) : '') + '</em></div><i>→</i><div><small>' + esc(T({ en:'Expected next 12 months', th:'คาด 12 เดือนข้างหน้า' })) + '</small><b class="fc">' + spc(X2 && X2.e, 1) + '</b><em>' + esc(T({ en:'likely ', th:'ช่วง 68%: ' })) + spc(X2 && A.risk ? X2.e - A.risk.vol : null, 0) + ' … ' + spc(X2 && A.risk ? X2.e + A.risk.vol : null, 0) + '</em></div><div><small>' + esc(T({ en:'S&P 500 expected 12M', th:'S&P 500 คาด 12 เดือน' })) + '</small><b class="fc">' + spc(X2 && X2.spx, 1) + '</b></div></div>';
    var warn = wf ? '<p class="bz-pfwarn">' + ico('alert') + esc(T({ en:'Why two lines? The thin amber line holds today\'s 8 picks for the whole past year — it looks great because the rules pick stocks that already rose (hindsight). The thick line is the honest test: the same rules re-run every 4 weeks using only what was known then. Judge the basket by the thick line: ' + spc(wf.ret, 1) + ' vs ' + (wf.l ? 'the Thai market ' + spc(wf.loc, 1) : 'S&P 500 ' + spc(wf.spy, 1)) + '.', th:'ทำไมมี 2 เส้น? เส้นเหลืองบางคือเอาหุ้น 8 ตัวที่คัดวันนี้ไปถือย้อนหลังทั้งปี ซึ่งดูดีเกินจริง เพราะกฎมักเลือกหุ้นที่ขึ้นมาแล้ว (รู้อนาคต) เส้นหนาคือการทดสอบที่ยุติธรรม: ใช้กฎเดิมคัดใหม่ทุก 4 สัปดาห์ด้วยข้อมูลที่รู้ ณ ตอนนั้นเท่านั้น ให้ตัดสินจากเส้นหนา: ' + spc(wf.ret, 1) + ' เทียบ ' + (wf.l ? 'ตลาดหุ้นไทย ' + spc(wf.loc, 1) : 'S&P 500 ' + spc(wf.spy, 1)) })) + '</p>' : '';
    return top + lc({ series:ser, unit:'%', zero:true, legend:true }, MID) + warn +
      note({ en:'Right side = forecast fan for the next 12 months (dark = 68% likely, light = 95%). ' + (wf ? 'The walk-forward still uses today\'s company fundamentals and scenario statistics that include the past year, so it is still somewhat optimistic.' : 'Uses today\'s weights on last year\'s prices (weekly), so it shows how this mix behaved — not what you actually earned.'), th:'ด้านขวา = พัดคาดการณ์ 12 เดือนข้างหน้า (เข้ม = โอกาส 68% จาง = 95%) ' + (wf ? 'การทดสอบแบบไม่รู้อนาคตยังใช้ข้อมูลพื้นฐานบริษัทของวันนี้ และสถิติฉากทัศน์ที่รวมปีที่ผ่านมาแล้ว จึงยังดูดีกว่าจริงอยู่บ้าง' : 'ใช้สัดส่วนวันนี้กับราคาปีที่แล้ว (รายสัปดาห์) จึงบอกว่าพอร์ตแบบนี้เคยขยับอย่างไร ไม่ใช่กำไรที่ได้จริง') });
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
    if(s.mode === 'autous' || s.mode === 'autoth') h += '<div class="bz-preset"><p>' + esc(T(PFMODE_N[s.mode])) + ' ' + esc(T({ en:'Equal weights; the list updates with the data. The same picks appear as “Best overall” on World outlook and in the Rotation tab.', th:'น้ำหนักเท่ากัน รายชื่ออัปเดตตามข้อมูล หุ้นชุดเดียวกันนี้คือ “ควรถือตอนนี้” ในหน้าแนวโน้มเศรษฐกิจโลก และในแท็บเงินไหลไปไหน' })) + '</p></div>';
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
    h += '<details class="bz-more bz-pfcmpw"' + (s.cmpOpen === false ? '' : ' open') + '><summary>' + ico('scale') + esc(T({ en:'Compare every portfolio style — which suits you?', th:'เทียบพอร์ตทุกแบบ — แบบไหนดีกว่า และเหมาะกับใคร' })) + '</summary>' + pfCompare(s) + '</details>';
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
      (A.curve ? cell(7, { en:'Past year → next 12 months: this portfolio vs the S&P 500', th:'ย้อนหลัง 1 ปี → คาด 12 เดือนข้างหน้า: พอร์ตนี้ vs S&P 500' }, pfCurveBlock(A, W, s), 'trend') : '') + '</div>';
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
      var b = ev.target.closest('button,input[data-pftilt],tr[data-pfmode]'); if(!b || !root.contains(b)) return;
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
    var keepX = nav.scrollLeft;
    nav.innerHTML = '<button type="button" class="bz-tarr l" data-tscroll="-1" aria-label="previous">‹</button>' + TABS.map(function(t){ return '<button type="button" role="tab" data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '" aria-selected="' + (tab === t[0]) + '">' + ico(t[2]) + '<span>' + esc(T(t[1])) + '</span></button>'; }).join('') + '<button type="button" class="bz-tarr r" data-tscroll="1" aria-label="next">›</button>';
    nav.scrollLeft = keepX;
    /* 2026-10-26: keep the chosen tab in view and show the arrows only when there is more to scroll */
    setTimeout(function(){ var on = nav.querySelector('[data-tab].on'); if(on){ var nl = nav.getBoundingClientRect(), r = on.getBoundingClientRect(); if(r.left < nl.left + 40 || r.right > nl.right - 40) nav.scrollTo({ left:nav.scrollLeft + (r.left - nl.left) - nl.width / 2 + r.width / 2, behavior:'smooth' }); } tabArrows(nav); }, 30);
    if(!D.m || !D.m.stocks){ body.innerHTML = '<div class="bz-wait">' + esc(T(UX.loading)) + '</div>'; return; }
    var E = E_last;
    var meta = '<div class="bz-meta"><span>' + ico('eye') + esc(T(UX.upd)) + ': ' + (D.m.generated_at ? new Date(D.m.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—') + '</span>' +
      '<span>' + esc(T(UX.eco)) + ': ' + (D.b && D.b.generated_at ? new Date(D.b.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—') + '</span>' +
      '<button type="button" class="bz-btn sm ghost" data-bzref>' + ico('radar') + esc(T(UX.refresh)) + '</button></div>';
    var html = (D.b ? '' : '<div class="bz-callout bad">' + ico('alert') + '<div><p>' + esc(T(UX.nobrain)) + '</p></div></div>');
    try {
      html += tab === 'guide' ? vGuide() : tab === 'print' ? vPrint() : XV[tab] ? XV[tab]() : tab === 'sum' ? vSum(E, F_last) : tab === 'fc' ? vFc(E, F_last) : tab === 'over' ? vOver(E) : tab === 'infl' ? vInfl(E) : tab === 'growth' ? vGrowth(E) : tab === 'fx' ? vFx(E) : tab === 'rot' ? vRot(E) : tab === 'out' ? vOut(E) : tab === 'pf' ? vPf() : vCal();
    } catch(err){ html += '<div class="bz-callout bad">' + ico('alert') + '<div><p>' + esc(String(err && err.message || err)) + '</p></div></div>'; if(window.console) console.error(err); }
    html += '<footer class="bz-foot"><p>' + esc(T({ en:'Sources: FRED (St. Louis Fed) · Yahoo Finance via yfinance · Shiller/Yale · FINRA · Cboe · Faireconomy calendar. Market data refreshes every ~30 min; economy data twice a day; some series (GDP, CPI) are monthly or quarterly.', th:'แหล่งข้อมูล: FRED (เฟดสาขาเซนต์หลุยส์) · Yahoo Finance ผ่าน yfinance · Shiller/Yale · FINRA · Cboe · ปฏิทิน Faireconomy ข้อมูลตลาดอัปเดตราวทุก 30 นาที ข้อมูลเศรษฐกิจวันละ 2 ครั้ง บางตัว (GDP, CPI) ออกรายเดือนหรือรายไตรมาส' })) + '</p></footer>';
    body.innerHTML = meta + '<div class="bz-view bz-v-' + tab + '">' + (tab === 'guide' || tab === 'print' ? '' : explainPanel(tab)) + html + '</div>';
    if(scrollTop){ var top = host.getBoundingClientRect().top + window.scrollY - 90; if(window.scrollY > top) window.scrollTo({ top:top, behavior:'smooth' }); }
  }
  function tabArrows(nav){ var max = nav.scrollWidth - nav.clientWidth - 2; nav.classList.toggle('cl', nav.scrollLeft > 2); nav.classList.toggle('cr', nav.scrollLeft < max); }
  function refresh(){
    wkCache = {}; medCache = null; calCache = {};
    return loadData().then(function(){ if(D.m && D.m.stocks){ E_last = compute(); try { F_last = calibrate(forecast(E_last)); } catch(e){ if(window.console) console.error(e); } } paint(); });
  }
  function mount(slot){
    host = slot;
    slot.innerHTML = '<div class="bz-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-bz="eb"></span></div><h2 data-bz="h"></h2><p class="lede" data-bz="lede"></p><div class="rule"></div></div>' +
      '<nav class="bz-tabs" role="tablist" data-bz="tabs"></nav><div data-bz="body"></div></div>';
    try { var t0 = sessionStorage.getItem('spz.brain.tab'); if(t0 && TABS.some(function(x){ return x[0] === t0; })) tab = t0; } catch(e){}
    var navEl = slot.querySelector('[data-bz="tabs"]');
    navEl.addEventListener('scroll', function(){ tabArrows(navEl); }, { passive:true });
    navEl.addEventListener('wheel', function(ev){ if(Math.abs(ev.deltaY) > Math.abs(ev.deltaX) && navEl.scrollWidth > navEl.clientWidth){ navEl.scrollLeft += ev.deltaY; ev.preventDefault(); } }, { passive:false });
    window.addEventListener('resize', function(){ tabArrows(navEl); });
    slot.addEventListener('click', function(ev){
      var ar = ev.target.closest('[data-tscroll]'); if(ar && slot.contains(ar)){ navEl.scrollBy({ left:+ar.getAttribute('data-tscroll') * navEl.clientWidth * 0.7, behavior:'smooth' }); return; }
      var b = ev.target.closest('[data-tab],[data-go],[data-bzref]'); if(!b || !slot.contains(b)) return;
      if(b.hasAttribute('data-bzref')){ refresh(); return; }
      tab = b.getAttribute('data-tab') || b.getAttribute('data-go');
      try { sessionStorage.setItem('spz.brain.tab', tab); } catch(e){}
      paint(true);
    });
    slot.addEventListener('pointermove', onChartMove);
    /* 2026-10-26: was a capture listener, so moving between two lines inside a chart fired it and hid the tooltip */
    slot.addEventListener('pointerleave', function(){ slot.querySelectorAll('.bz-chart').forEach(hideTip); });
    wirePf(slot); wirePrint(slot); wireWhatif(slot); wirePx(slot); wireWorld(slot);
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('spz:line', function(){ PF.acctTickers = null; if(tab === 'pf') paint(); });
    document.addEventListener('spz:acc', function(){ PF.acctTickers = null; if(tab === 'pf') paint(); });
    paint();
    refresh();
  }
  window.__SPZ_BRAIN = { mount:mount, compute:function(){ return E_last; }, data:function(){ return D; }, analyse:function(W){ return analyse(W); } };
})();
