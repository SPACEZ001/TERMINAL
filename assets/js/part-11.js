
/* ============================================================================
   SPACEZ TERMINAL — LIVE MOTION LAYER
   Streaming hero tape, live candlesticks, live MA, live RSI,
   smooth-curve helper + count-up used by the Wealth Builder.
   ============================================================================ */
(function(){
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Catmull-Rom -> cubic bezier smoothing ---------- */
  function smoothPath(points, monotone){
    if(!points || points.length < 2) return '';
    var f = function(n){ return n.toFixed(2); };
    if(points.length === 2){
      return 'M' + f(points[0].x) + ',' + f(points[0].y) + ' L' + f(points[1].x) + ',' + f(points[1].y);
    }
    var d = 'M' + f(points[0].x) + ',' + f(points[0].y);
    for(var i = 0; i < points.length - 1; i++){
      var p0 = points[i - 1] || points[i];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      if(monotone){
        var lo = Math.min(p1.y, p2.y), hi = Math.max(p1.y, p2.y);
        c1y = Math.min(hi, Math.max(lo, c1y));
        c2y = Math.min(hi, Math.max(lo, c2y));
      }
      d += ' C' + f(c1x) + ',' + f(c1y) + ' ' + f(c2x) + ',' + f(c2y) + ' ' + f(p2.x) + ',' + f(p2.y);
    }
    return d;
  }

  /* ---------- easing count-up for big result numbers ---------- */
  function countUp(el, target, dur, fmt){
    if(!el) return;
    fmt = fmt || function(n){ return String(Math.round(n)); };
    if(reduce || !isFinite(target)){ el.textContent = fmt(target); return; }
    var start = null, D = dur || 1600;
    function step(now){
      if(start === null) start = now;
      var t = Math.min(1, (now - start) / D);
      var e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * e);
      if(t < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  window.__ALFA = { smoothPath: smoothPath, countUp: countUp };

  if(reduce) return;

  /* ---------- shared rAF scheduler + viewport gating ---------- */
  var tasks = [];
  var seen = (typeof WeakSet === 'function') ? new WeakSet() : null;
  var vio = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!seen) return;
      if(e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
    });
  }, { threshold: 0.01 }) : null;

  function watch(el){ if(vio) vio.observe(el); }
  function onScreen(el){
    if(!vio || !seen) return true;
    return seen.has(el);
  }
  function openAndVisible(el){
    if(!onScreen(el)) return false;
    var det = el.closest ? el.closest('details') : null;
    return !det || det.open;
  }

  function loop(ts){
    if(!document.hidden){
      for(var i = 0; i < tasks.length; i++) tasks[i](ts);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function ticker(fn){
    var last = 0;
    tasks.push(function(ts){
      if(!last){ last = ts; return; }
      var dt = Math.min(0.06, (ts - last) / 1000);
      last = ts;
      fn(dt);
    });
  }

  /* ========================================================================
     1. HERO — endless scrolling tape, old points fade out on the left
     ======================================================================== */
  (function heroTape(){
    var svg = document.querySelector('.hero-chart');
    if(!svg) return;
    var line = svg.querySelector('path.spark');
    var area = svg.querySelector('path.hero-area');
    var dot  = svg.querySelector('circle.hero-dot');
    var ring = svg.querySelector('circle.hero-ring');
    if(!line) return;

    var W = 400, H = 160, STEP = 36, SPEED = 15, DOT_X = 394;
    var N = Math.ceil(W / STEP) + 5;
    var v = 0.42, vals = [];

    function nextVal(){
      v += (Math.random() - 0.47) * 0.34;
      v += (0.5 - v) * 0.055;
      v = Math.min(0.94, Math.max(0.07, v));
      return v;
    }
    for(var i = 0; i < 240; i++) nextVal();
    for(i = 0; i < N; i++) vals.push(nextVal());

    var offset = 0;
    watch(svg);

    ticker(function(dt){
      if(!onScreen(svg)) return;
      offset += SPEED * dt;
      while(offset >= STEP){ offset -= STEP; vals.shift(); vals.push(nextVal()); }

      var pts = [], j;
      for(j = 0; j < vals.length; j++){
        pts.push({ x: -STEP * 2 + j * STEP - offset, y: H - 14 - vals[j] * (H - 40) });
      }
      var d = smoothPath(pts);
      line.setAttribute('d', d);
      if(area){
        area.setAttribute('d', d + ' L' + pts[pts.length - 1].x.toFixed(2) + ',' + H +
                               ' L' + pts[0].x.toFixed(2) + ',' + H + ' Z');
      }
      if(dot){
        var y = pts[pts.length - 1].y;
        for(j = 0; j < pts.length - 1; j++){
          if(pts[j].x <= DOT_X && pts[j + 1].x >= DOT_X){
            var t = (DOT_X - pts[j].x) / (pts[j + 1].x - pts[j].x);
            y = pts[j].y + (pts[j + 1].y - pts[j].y) * t;
            break;
          }
        }
        dot.setAttribute('cy', y.toFixed(2));
        if(ring) ring.setAttribute('cy', y.toFixed(2));
      }
    });
  })();

  /* ========================================================================
     2. SIGNALS 01 — live candlestick tape
     ======================================================================== */
  (function liveCandles(){
    var viz = document.querySelector('.candle-viz');
    if(!viz) return;
    var els = Array.prototype.slice.call(viz.querySelectorAll('.candle'));
    if(!els.length) return;
    while(els.length < 9){                       /* widen the tape */
      var clone = els[els.length - 1].cloneNode(true);
      viz.appendChild(clone);
      els.push(clone);
    }

    var AREA = 70;           // usable px height inside .candle-viz
    var price = 50;

    function makeBar(){
      var open  = price;
      var close = open + (Math.random() - 0.47) * 22;
      if(close > 82) close = 82;
      if(close < 18) close = 18;
      var high = Math.max(open, close) + Math.random() * 3.5 + 0.8;
      var low  = Math.min(open, close) - Math.random() * 3.5 - 0.8;
      price = close;
      return { open: open, close: close, high: high, low: low };
    }

    for(var wi = 0; wi < 60; wi++) makeBar();
    var bars = els.map(makeBar);

    function paint(){
      var lo = Infinity, hi = -Infinity;
      bars.forEach(function(b){ if(b.low < lo) lo = b.low; if(b.high > hi) hi = b.high; });
      var range = (hi - lo) || 1;
      var k = AREA / range;

      bars.forEach(function(b, i){
        var el = els[i];
        var up = b.close >= b.open;
        el.classList.toggle('up', up);
        el.classList.toggle('down', !up);
        el.classList.toggle('live', i === els.length - 1);

        var bodyTop = Math.max(b.open, b.close);
        var bodyBot = Math.min(b.open, b.close);
        var upperW  = Math.max(2, (b.high - bodyTop) * k);
        var bodyH   = Math.max(3, (bodyTop - bodyBot) * k);
        var lowerW  = Math.max(2, (bodyBot - b.low) * k);

        var kids = el.children;
        if(kids.length >= 3){
          kids[0].style.height = upperW.toFixed(1) + 'px';
          kids[1].style.height = bodyH.toFixed(1) + 'px';
          kids[2].style.height = lowerW.toFixed(1) + 'px';
        }
        el.style.marginBottom = Math.max(0, (b.low - lo) * k).toFixed(1) + 'px';
      });
    }

    paint();
    watch(viz);

    var acc = 0;
    ticker(function(dt){
      if(!openAndVisible(viz)) return;
      acc += dt;
      if(acc < 1.25) return;
      acc = 0;
      bars.shift();
      bars.push(makeBar());
      paint();
    });
  })();

  /* ========================================================================
     3. SIGNALS 02 — live price + moving average
     ======================================================================== */
  (function liveMA(){
    var svg = document.querySelector('.ma-viz');
    if(!svg) return;
    var priceP = svg.querySelector('path.price');
    var maP    = svg.querySelector('path.ma');
    var maDot  = svg.querySelector('circle.ma-dot');
    if(!priceP || !maP) return;

    var W = 300, H = 70, STEP = 26, SPEED = 11, PERIOD = 5;
    var N = Math.ceil(W / STEP) + 5;
    var v = 0.4, series = [];

    function nextVal(){
      v += (Math.random() - 0.48) * 0.46;
      v += (0.5 - v) * 0.055;
      v = Math.min(0.95, Math.max(0.05, v));
      return v;
    }
    for(var i = 0; i < 200; i++) nextVal();
    for(i = 0; i < N + PERIOD; i++) series.push(nextVal());

    var offset = 0;
    watch(svg);

    ticker(function(dt){
      if(!openAndVisible(svg)) return;
      offset += SPEED * dt;
      while(offset >= STEP){ offset -= STEP; series.shift(); series.push(nextVal()); }

      var pricePts = [], maPts = [], j, k, sum;
      for(j = PERIOD; j < series.length; j++){
        var x = -STEP * 2 + (j - PERIOD) * STEP - offset;
        pricePts.push({ x: x, y: H - 5 - series[j] * (H - 14) });
        sum = 0;
        for(k = 0; k < PERIOD; k++) sum += series[j - k];
        maPts.push({ x: x, y: H - 5 - (sum / PERIOD) * (H - 14) });
      }
      priceP.setAttribute('d', smoothPath(pricePts));
      maP.setAttribute('d', smoothPath(maPts));

      if(maDot){
        var DX = 294, y = maPts[maPts.length - 1].y;
        for(j = 0; j < maPts.length - 1; j++){
          if(maPts[j].x <= DX && maPts[j + 1].x >= DX){
            var t = (DX - maPts[j].x) / (maPts[j + 1].x - maPts[j].x);
            y = maPts[j].y + (maPts[j + 1].y - maPts[j].y) * t;
            break;
          }
        }
        maDot.setAttribute('cy', y.toFixed(2));
      }
    });
  })();

  /* ========================================================================
     4. SIGNALS 03 — live RSI gauge
     ======================================================================== */
  (function liveRSI(){
    var marker = document.querySelector('.rsi-marker');
    if(!marker) return;
    var viz = marker.closest('.rsi-viz');
    var out = marker.querySelector('.rsi-val');
    if(!viz) return;

    var r = 78, acc = 0;
    watch(viz);

    ticker(function(dt){
      if(!openAndVisible(viz)) return;
      acc += dt;
      if(acc < 1.6) return;
      acc = 0;
      r += (Math.random() - 0.5) * 28;
      r += (52 - r) * 0.13;
      r = Math.min(93, Math.max(8, r));
      marker.style.left = r.toFixed(1) + '%';
      if(out) out.textContent = Math.round(r);
      marker.classList.toggle('hot', r >= 70);
      marker.classList.toggle('cold', r <= 30);
    });
  })();

})();
