
(function(){
  'use strict';
  if (window.__SPZ_LIVE) return;

  /* ---------------------------------------------------------------
     0. config
     --------------------------------------------------------------- */
  var CFG = {
    /* Optional baked-in Finnhub key. A page served publicly exposes this to
       anyone who views source — the in-page key box (localStorage) is the
       safer route for personal keys. */
    finnhubKey: '',
    quoteTTL   : 45 * 1000,          /* live quote cache            */
    metricTTL  : 12 * 60 * 60 * 1000,/* fundamentals cache          */
    fxTTL      : 60 * 60 * 1000,     /* fx cache                    */
    autoRefresh: 90 * 1000,          /* tape + visible cards        */
    budgetPerMin: 55,                /* Finnhub free tier is 60/min */
    concurrency: 4
  };

  var LS = {
    key:'spz_finnhub_key', quote:'spz_quote_cache_v1',
    metric:'spz_metric_cache_v1', fx:'spz_fx_cache_v1', proxy:'spz_proxy_idx_v1'
  };

  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  function jparse(s,d){ try{ return s ? JSON.parse(s) : d; }catch(e){ return d; } }

  /* ---------------------------------------------------------------
     1. symbol map — Thai tickers trade on SET, Yahoo suffix .BK
     --------------------------------------------------------------- */
  var TH_TICKERS = ['KBANK','BBL','SCB','KTB','PTT','SCC','TOP','DELTA','GULF','AOT',
    'CPALL','MINT','ADVANC','TISCO','LH','RATCH','EGCO','TTB','PTTEP','BDMS','BH',
    'CPF','OSP','TU','CPAXT'];

  function isThai(t){ return TH_TICKERS.indexOf(t) !== -1; }
  function yahooSym(t){ return isThai(t) ? t + '.BK' : t.replace('.', '-'); }
  function finnhubSym(t){ return t; }
  function ccy(t){ return isThai(t) ? 'THB' : 'USD'; }

  var FIN_SECTORS = ['Financial Services', 'Financial', 'Financials'];
  function isFinancial(s){
    return !!(s && s.sector && FIN_SECTORS.indexOf(s.sector) !== -1);
  }

  /* ---------------------------------------------------------------
     2. tiny scheduler: token bucket + limited concurrency
     --------------------------------------------------------------- */
  var callTimes = [], queue = [], running = 0;

  function budgetOk(){
    var now = Date.now();
    while (callTimes.length && now - callTimes[0] > 60000) callTimes.shift();
    return callTimes.length < CFG.budgetPerMin;
  }

  function pump(){
    while (running < CFG.concurrency && queue.length) {
      if (!budgetOk()) { setTimeout(pump, 1500); return; }
      var job = queue.shift();
      running++; callTimes.push(Date.now());
      job.fn().then(job.res, job.rej).then(function(){ running--; pump(); });
    }
  }

  function schedule(fn, priority){
    return new Promise(function(res, rej){
      var job = { fn:fn, res:res, rej:rej };
      if (priority) queue.unshift(job); else queue.push(job);
      pump();
    });
  }

  function getJSON(url, ms){
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var t = setTimeout(function(){ if (ctrl) ctrl.abort(); }, ms || 9000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(function(r){
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function(e){ clearTimeout(t); throw e; });
  }

  /* ---------------------------------------------------------------
     3. providers
     --------------------------------------------------------------- */
  function apiKey(){ return (lsGet(LS.key) || CFG.finnhubKey || '').trim(); }

  function finnhubQuote(t){
    var k = apiKey(); if (!k) return Promise.reject(new Error('no key'));
    return getJSON('https://finnhub.io/api/v1/quote?symbol=' + encodeURIComponent(finnhubSym(t)) + '&token=' + k)
      .then(function(d){
        if (!d || typeof d.c !== 'number' || d.c === 0) throw new Error('empty quote');
        return { price:d.c, chg:d.d, chgPct:d.dp, prev:d.pc, ccy:'USD', src:'finnhub', ts:Date.now() };
      });
  }

  /* public CORS proxies, tried in order; the winner is remembered */
  var PROXIES = [
    /* order tuned against a Thai residential connection, Aug 2026.
       `text: true` means the proxy wraps the payload in prose, so the JSON
       has to be cut back out of it. */
    { url: function(u){ return 'https://api.cors.lol/?url=' + encodeURIComponent(u); } },
    { url: function(u){ return 'https://r.jina.ai/' + u; }, text: true },
    { url: function(u){ return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); } },
    { url: function(u){ return 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(u); } },
    { url: function(u){ return u; } }   /* direct: where Yahoo sends CORS headers */
  ];

  function getText(url, ms){
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var t = setTimeout(function(){ if (ctrl) ctrl.abort(); }, ms || 8000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(function(r){
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }, function(e){ clearTimeout(t); throw e; });
  }

  function fetchThrough(p, url){
    if (!p.text) return getJSON(p.url(url), 7000);
    return getText(p.url(url), 8000).then(function(txt){
      var a = txt.indexOf('{'), b = txt.lastIndexOf('}');
      if (a < 0 || b <= a) throw new Error('no json in proxy body');
      return JSON.parse(txt.slice(a, b + 1));
    });
  }
  var proxyIdx = parseInt(lsGet(LS.proxy) || '0', 10) || 0;

  /* Free CORS proxies rate-limit hard: a burst of a dozen requests comes back
     without CORS headers and every one fails. So we trip a breaker after a few
     consecutive failures and leave the proxies alone for a while — the repo
     snapshot keeps the page populated in the meantime. */
  var proxyFails = 0, proxyPausedUntil = 0;
  function proxyAllowed(){ return Date.now() > proxyPausedUntil; }

  function viaProxy(url){
    if (!proxyAllowed()) return Promise.reject(new Error('proxy cooling down'));
    var order = [], i;
    for (i = 0; i < PROXIES.length; i++) order.push((proxyIdx + i) % PROXIES.length);
    return order.reduce(function(chain, idx){
      return chain.catch(function(){
        return fetchThrough(PROXIES[idx], url).then(function(d){
          if (idx !== proxyIdx) { proxyIdx = idx; lsSet(LS.proxy, String(idx)); }
          proxyFails = 0;
          return d;
        });
      });
    }, Promise.reject(new Error('init'))).catch(function(e){
      if (++proxyFails >= 4) { proxyPausedUntil = Date.now() + 10 * 60 * 1000; proxyFails = 0; }
      throw e;
    });
  }

  function yahooQuote(t){
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
              encodeURIComponent(yahooSym(t)) + '?range=5d&interval=1d';
    return viaProxy(url).then(function(d){
      var r = d && d.chart && d.chart.result && d.chart.result[0];
      var m = r && r.meta;
      if (!m || typeof m.regularMarketPrice !== 'number') throw new Error('no yahoo meta');
      var prev = (typeof m.chartPreviousClose === 'number') ? m.chartPreviousClose : m.previousClose;
      var px = m.regularMarketPrice, chg = (typeof prev === 'number') ? px - prev : null;
      return {
        price: px, chg: chg, prev: prev,
        chgPct: (chg !== null && prev) ? (chg / prev) * 100 : null,
        ccy: m.currency || ccy(t), src:'yahoo', ts: Date.now()
      };
    });
  }

  function fetchQuote(t){
    return schedule(function(){
      return (isThai(t) ? Promise.reject(new Error('non-US'))
                        : finnhubQuote(t)).catch(function(){ return yahooQuote(t); });
    });
  }

  function num(v){ return (typeof v === 'number' && isFinite(v)) ? v : null; }

  function fetchMetrics(t){
    var k = apiKey();
    if (!k || isThai(t)) return Promise.reject(new Error('unsupported'));
    return schedule(function(){
      return getJSON('https://finnhub.io/api/v1/stock/metric?symbol=' +
        encodeURIComponent(finnhubSym(t)) + '&metric=all&token=' + k)
        .then(function(d){
          var m = d && d.metric;
          if (!m) throw new Error('no metric');
          return {
            pe        : num(m.peTTM) || num(m.peBasicExclExtraTTM) || num(m.peNormalizedAnnual),
            roe       : num(m.roeTTM) || num(m.roeRfy),
            roi       : num(m.roiTTM) || num(m.roiAnnual),
            de        : num(m['totalDebt/totalEquityQuarterly']) || num(m['totalDebt/totalEquityAnnual']),
            margin    : num(m.netProfitMarginTTM) || num(m.netProfitMarginAnnual),
            pb        : num(m.pbQuarterly) || num(m.pbAnnual),
            divYield  : num(m.dividendYieldIndicatedAnnual) || num(m.currentDividendYieldTTM),
            hi52      : num(m['52WeekHigh']), lo52: num(m['52WeekLow']),
            ts        : Date.now()
          };
        });
    });
  }

  function fetchFX(){
    return getJSON('https://open.er-api.com/v6/latest/USD').then(function(d){
      if (!d || !d.rates) throw new Error('no rates');
      return { rates:d.rates, src:'open.er-api.com', ts:Date.now() };
    }).catch(function(){
      return getJSON('https://api.frankfurter.dev/v1/latest?base=USD').then(function(d){
        if (!d || !d.rates) throw new Error('no rates');
        var r = d.rates; r.USD = 1;
        return { rates:r, src:'frankfurter.dev', ts:Date.now() };
      });
    });
  }

  /* ---------------------------------------------------------------
     4. caches
     --------------------------------------------------------------- */
  var quoteCache  = jparse(lsGet(LS.quote), {});
  var metricCache = jparse(lsGet(LS.metric), {});
  var fxCache     = jparse(lsGet(LS.fx), null);
  var saveTimer = null;
  function persist(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      lsSet(LS.quote, JSON.stringify(quoteCache));
      lsSet(LS.metric, JSON.stringify(metricCache));
      if (fxCache) lsSet(LS.fx, JSON.stringify(fxCache));
    }, 400);
  }
  function fresh(o, ttl){ return o && (Date.now() - o.ts) < ttl; }

  function quoteOf(t, force){
    if (!force && fresh(quoteCache[t], CFG.quoteTTL)) return Promise.resolve(quoteCache[t]);
    return fetchQuote(t).then(function(q){ quoteCache[t] = q; persist(); return q; });
  }
  function metricOf(t){
    if (fresh(metricCache[t], CFG.metricTTL)) return Promise.resolve(metricCache[t]);
    return fetchMetrics(t).then(function(m){ metricCache[t] = m; persist(); return m; });
  }

  /* ---------------------------------------------------------------
     4b. repo snapshot — data/market.json, refreshed by GitHub Actions.
         No API key, no CORS proxy, always same-origin. This is what makes
         the page self-updating even for a visitor who never touches the
         key box; live browser quotes are layered on top when they work.
     --------------------------------------------------------------- */
  var SNAP_URL = 'data/market.json';
  var snapTs = 0, tapeTs = {};
  function n(v){ return (typeof v === 'number' && isFinite(v)) ? v : null; }

  var lastSnap = null;

  function applySnapshot(d){
    if (!d || !d.stocks) return;
    lastSnap = d;
    var ts = Date.parse(d.generated_at) || Date.now();
    snapTs = ts;
    var by = {};
    allStocks().forEach(function(s){ by[s.ticker] = s; });
    Object.keys(d.stocks).forEach(function(t){
      var r = d.stocks[t], s = by[t];
      if (!s) return;
      applyMetrics(s, { pe:n(r.pe), roe:n(r.roe), roi:n(r.roic), de:n(r.de),
                        margin:n(r.margin), pb:n(r.pb), divYield:n(r.div), ts:ts });
      if (r.sector) s.sector = r.sector;
      if (n(r.price) !== null && (!s.live_ts || s.live_ts < ts)) {
        s.live_price = r.price;
        s.live_chg   = n(r.chg_pct);
        s.live_ccy   = r.ccy || ccy(t);
        s.live_ts    = ts;
        s.live_src   = 'snapshot';
      }
      s.__metric_src = 'snapshot';
    });
    var h = window.__SPZ_HOOKS;
    if (h && h.tickers) {
      h.tickers.forEach(function(row){
        var r = d.stocks[row[0]];
        if (r && n(r.chg_pct) !== null && (!tapeTs[row[0]] || tapeTs[row[0]] < ts)) {
          if (n(r.price) !== null) row[1] = r.price;
          row[2] = (r.chg_pct >= 0 ? '+' : '') + r.chg_pct.toFixed(2) + '%';
          row[3] = r.chg_pct >= 0;
          tapeTs[row[0]] = ts;
        }
      });
      try { h.renderTicker(); } catch(e){}
    }
    if (d.fx && Object.keys(d.fx).length > 3 && !fresh(fxCache, CFG.fxTTL)) {
      applyFx({ rates:d.fx, src:'snapshot', ts:ts });
    }
    state.mSrc = 'auto-sync';
    noteSrc('auto-sync');
    state.last = Math.max(state.last, ts);
    try { if (h && h.renderDir) h.renderDir(); } catch(e){}
    decorate();
    paintBar();
    try {
      document.dispatchEvent(new CustomEvent('spz:snapshot', { detail: d }));
    } catch(e){}
  }

  function loadSnapshot(){
    return getJSON(SNAP_URL + '?v=' + Math.floor(Date.now() / 300000), 12000)
      .then(applySnapshot, function(){ /* file not deployed yet — fine */ });
  }

  /* ---------------------------------------------------------------
     5. status bar
     --------------------------------------------------------------- */
  var STR = {
    en:{ live:'LIVE', loading:'SYNCING', stat:'STATIC', off:'OFFLINE',
      quotes:'quotes', funda:'fundamentals', fx:'FX', updated:'updated',
      refresh:'⟳ REFRESH', keyBtn:'⚙ API KEY', never:'never',
      keyTitle:'Finnhub API key — free tier',
      keyNote:'Real-time US quotes and fundamentals (P/E, ROE, ROI, D/E, net margin, P/B, dividend yield) come from Finnhub. Grab a free key at finnhub.io, paste it here, and it is stored only in this browser (localStorage) — never uploaded anywhere. Without a key the page still pulls live prices from Yahoo Finance through a public proxy, and falls back to the built-in reference figures for fundamentals. Thai (SET) tickers get live prices only; their fundamentals stay as the built-in study figures.',
      save:'Save & sync', clear:'Clear', ph:'paste your Finnhub key…',
      saved:'Key saved — syncing live data…', cleared:'Key removed. Prices fall back to Yahoo.',
      bad:'That key was rejected by Finnhub. Check it and try again.',
      staticTag:'STATIC', liveTag:'LIVE', notice:'Live market data — for study, not investment advice. Delays vary by source.',
      naShort:'n/a', naWhy:'ROIC and net margin do not mean anything for a bank or insurer — lending IS the balance sheet. Read ROE, P/B and the loan book instead.',
      bubbleLbl:'bubble data', bubblePending:'pending first run', bubbleUpdated:'updated', bubbleNext:'next update',
      bubbleToday:'today', bubbleTomorrow:'tomorrow' },
    th:{ live:'สด', loading:'กำลังดึง', stat:'ค่าคงที่', off:'ออฟไลน์',
      quotes:'ราคา', funda:'พื้นฐาน', fx:'อัตราแลกเปลี่ยน', updated:'อัปเดต',
      refresh:'⟳ รีเฟรช', keyBtn:'⚙ API KEY', never:'ยังไม่มี',
      keyTitle:'Finnhub API key — แพลนฟรี',
      keyNote:'ราคาหุ้นสหรัฐฯ แบบเรียลไทม์และตัวเลขพื้นฐาน (P/E, ROE, ROI, D/E, อัตรากำไรสุทธิ, P/B, ปันผล) ดึงจาก Finnhub สมัครคีย์ฟรีได้ที่ finnhub.io แล้ววางคีย์ไว้ตรงนี้ ระบบเก็บไว้ในเบราว์เซอร์ของคุณเอง (localStorage) เท่านั้น ไม่ส่งไปที่ไหน ถ้าไม่ใส่คีย์ หน้านี้ยังดึงราคาสดจาก Yahoo Finance ผ่าน public proxy ได้ และใช้ตัวเลขพื้นฐานที่ฝังมาในไฟล์แทน ส่วนหุ้นไทย (SET) จะได้เฉพาะราคาสด ตัวเลขพื้นฐานยังเป็นค่าอ้างอิงเพื่อการศึกษา',
      save:'บันทึกและซิงก์', clear:'ล้างคีย์', ph:'วางคีย์ Finnhub ของคุณ…',
      saved:'บันทึกคีย์แล้ว — กำลังดึงข้อมูลสด…', cleared:'ลบคีย์แล้ว ราคาจะกลับไปใช้ Yahoo',
      bad:'Finnhub ปฏิเสธคีย์นี้ ลองตรวจสอบแล้วใส่ใหม่',
      staticTag:'ค่าคงที่', liveTag:'สด', notice:'ข้อมูลตลาดแบบสด — เพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน ความหน่วงขึ้นกับแหล่งข้อมูล',
      naShort:'ไม่ใช้', naWhy:'ROIC และอัตรากำไรสุทธิไม่มีความหมายกับธนาคารและประกัน เพราะงบดุลคือตัวสินค้าเอง ให้ดู ROE, P/B และคุณภาพพอร์ตสินเชื่อแทน',
      bubbleLbl:'ข้อมูลฟองสบู่', bubblePending:'รอรอบแรก', bubbleUpdated:'อัปเดต', bubbleNext:'รอบถัดไป',
      bubbleToday:'วันนี้', bubbleTomorrow:'พรุ่งนี้' }
  };

  /* ---------------------------------------------------------------
     freshness tags. Four honest tiers — a 30-minute snapshot is not
     "real-time", and free Yahoo quotes are delayed, so neither gets to
     wear that word.
     --------------------------------------------------------------- */
  var TAGS = {
    en:{ rt:'REAL-TIME', dl:'LIVE · ~15 MIN DELAY', auto:'AUTO · EVERY 30 MIN', stat:'REFERENCE',
         stale:'DATA IS STALE', open:'OPEN', closed:'CLOSED', lastClose:'last close',
         legend:'How fresh is a number:',
         lrt:'streaming from Finnhub as it prints (needs your free key)',
         ldl:'pulled live in your browser from Yahoo, delayed about 15 minutes',
         lauto:'rebuilt server-side every 30 minutes and shipped with the page',
         lstat:'a fixed study figure written into the page, not a market quote' },
    th:{ rt:'เรียลไทม์', dl:'สด · ดีเลย์ ~15 นาที', auto:'อัปเดตเอง · ทุก 30 นาที', stat:'ค่าอ้างอิง',
         stale:'ข้อมูลค้าง', open:'เปิด', closed:'ปิด', lastClose:'ราคาปิด',
         legend:'ตัวเลขสดแค่ไหน:',
         lrt:'ไหลจาก Finnhub ทันทีที่ราคาเกิด (ต้องใส่คีย์ฟรีของคุณ)',
         ldl:'เบราว์เซอร์ดึงสดจาก Yahoo ดีเลย์ราว 15 นาที',
         lauto:'เซิร์ฟเวอร์สร้างใหม่ทุก 30 นาทีแล้วส่งมากับหน้าเว็บ',
         lstat:'ตัวเลขคงที่ที่เขียนไว้ในไฟล์เพื่อการศึกษา ไม่ใช่ราคาตลาด' }
  };

  /* compact wording for tight spots like a stock card */
  var TAGS_SHORT = {
    en:{ rt:'REAL-TIME', dl:'~15m', auto:'AUTO 30m', stat:'REF', stale:'STALE' },
    th:{ rt:'เรียลไทม์', dl:'ดีเลย์ 15น.', auto:'ออโต้ 30น.', stat:'อ้างอิง', stale:'ค้าง' }
  };

  function tagText(kind, short){
    var d = short ? (TAGS_SHORT[lang()] || TAGS_SHORT.en) : (TAGS[lang()] || TAGS.en);
    return d[kind] || '';
  }

  function tagHTML(kind, extraClass, short){
    return '<span class="spz-tag spz-tag-' + kind + (extraClass ? ' ' + extraClass : '') +
           '" title="' + tagText(kind) + '">' + tagText(kind, short) + '</span>';
  }

  /* which tier a given source string belongs to */
  function tierOf(src){
    if (src === 'finnhub') return 'rt';
    if (src === 'yahoo')   return 'dl';
    if (src === 'auto-sync' || src === 'snapshot') {
      var age = snapAgeH();
      return (age !== null && age > 3) ? 'stale' : 'auto';
    }
    return 'stat';
  }

  function snapAgeH(){
    return snapTs ? (Date.now() - snapTs) / 36e5 : null;
  }

  function bestTier(){
    if (apiKey()) return 'rt';
    if (srcSeen && srcSeen.yahoo && Date.now() - srcSeen.yahoo < 10 * 60 * 1000) return 'dl';
    if (snapTs) {
      var age = snapAgeH();
      return (age !== null && age > 3) ? 'stale' : 'auto';
    }
    return 'stat';
  }

  /* Exchange clocks. The auto-sync file keeps refreshing after a market
     closes, so a price can be current AND be yesterday's close — worth
     saying out loud rather than letting 'live' imply trading. */
  function marketStatus(){
    var now = new Date();
    var utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    var bkk = new Date(utcMs + 7 * 3600000);
    var bMin = bkk.getHours() * 60 + bkk.getMinutes();
    var setOpen = bkk.getDay() >= 1 && bkk.getDay() <= 5 && bMin >= 600 && bMin <= 990;

    var m = now.getUTCMonth();
    var etOffset = (m >= 2 && m <= 10) ? -4 : -5;      /* close enough to DST */
    var et = new Date(utcMs + etOffset * 3600000);
    var eMin = et.getHours() * 60 + et.getMinutes();
    var usOpen = et.getDay() >= 1 && et.getDay() <= 5 && eMin >= 570 && eMin < 960;
    return { set: setOpen, us: usOpen };
  }

  function legendHTML(){
    var pairs = [['rt','lrt'],['dl','ldl'],['auto','lauto'],['stat','lstat']];
    return '<div class="spz-legend"><span style="opacity:.75">' + tagText('legend') + '</span>' +
      pairs.map(function(p){
        return '<span class="spz-lg">' + tagHTML(p[0]) + ' ' + tagText(p[1]) + '</span>';
      }).join('') + '</div>';
  }

  window.__SPZ_TAGS = { html: tagHTML, tier: tierOf, best: bestTier, legend: legendHTML,
                        text: tagText };

  function lang(){
    var h = window.__SPZ_HOOKS;
    if (h && typeof h.lang === 'function') { try { return h.lang(); } catch(e){} }
    return (document.documentElement.getAttribute('lang') === 'th') ? 'th' : 'en';
  }
  function S(k){ return (STR[lang()] || STR.en)[k]; }

  var state = { mode:'loading', last:0, qSrc:'—', mSrc:'—', fxSrc:'—' };
  var srcSeen = {};
  function noteSrc(name){
    srcSeen[name] = Date.now();
    var live = Object.keys(srcSeen).filter(function(k){ return Date.now() - srcSeen[k] < 5*60*1000; });
    state.qSrc = live.length ? live.sort().join(' + ') : '—';
  }
  var bar, panel, msgEl, inputEl;

  function buildBar(){
    var tape = document.querySelector('.ticker-bar');
    bar = document.createElement('div');
    bar.id = 'spzLiveBar';
    bar.innerHTML =
      '<span class="lb-chip lb-status" tabindex="0"><span class="spz-dot"></span><span class="spz-state">…</span><span class="lb-more">▾</span></span>' +
      '<div class="lb-pop">' +
        '<span class="lb-chip spz-src" id="spzSrc"></span>' +
        '<button type="button" id="spzRefreshBtn"><span class="lb-spin">⟳</span><span class="lb-lbl"></span></button>' +
        '<button type="button" id="spzKeyBtn"><span class="lb-ic">⚙</span><span class="lb-lbl"></span></button>' +
      '</div>';

    panel = document.createElement('div');
    panel.id = 'spzKeyPanel';
    panel.innerHTML =
      '<div class="spz-state" id="spzKeyTitle" style="color:inherit;font-weight:600;"></div>' +
      '<div class="spz-kp-note" id="spzKeyNote" style="margin-top:7px;"></div>' +
      '<div id="spzLegend"></div>' +
      '<div class="spz-kp-row">' +
        '<input type="password" id="spzKeyInput" autocomplete="off" spellcheck="false">' +
        '<button type="button" id="spzKeySave"></button>' +
        '<button type="button" id="spzKeyClear"></button>' +
      '</div><div class="spz-kp-msg" id="spzKeyMsg"></div>';

    if (tape && tape.parentNode) {
      tape.parentNode.insertBefore(bar, tape.nextSibling);
      bar.parentNode.insertBefore(panel, bar.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
      document.body.insertBefore(panel, bar.nextSibling);
    }

    msgEl = document.getElementById('spzKeyMsg');
    inputEl = document.getElementById('spzKeyInput');
    inputEl.value = lsGet(LS.key) || '';

    document.getElementById('spzRefreshBtn').addEventListener('click', function(){ refreshAll(true); });
    document.getElementById('spzKeyBtn').addEventListener('click', function(){
      panel.classList.toggle('open');
    });
    document.getElementById('spzKeySave').addEventListener('click', function(){
      var v = inputEl.value.trim();
      if (!v) return;
      lsSet(LS.key, v);
      msgEl.className = 'spz-kp-msg';
      msgEl.textContent = S('saved');
      metricCache = {}; quoteCache = {}; persist();
      finnhubQuote('AAPL').then(function(){
        msgEl.className = 'spz-kp-msg spz-ok'; msgEl.textContent = S('saved');
      }, function(){
        msgEl.className = 'spz-kp-msg spz-bad'; msgEl.textContent = S('bad');
      });
      refreshAll(true);
    });
    document.getElementById('spzKeyClear').addEventListener('click', function(){
      try{ localStorage.removeItem(LS.key); }catch(e){}
      inputEl.value = '';
      msgEl.className = 'spz-kp-msg'; msgEl.textContent = S('cleared');
      refreshAll(true);
    });

    /* the popup opens on hover/focus via CSS alone (desktop) -- this adds
       a tap-to-toggle path for touch devices, where :hover never fires,
       plus click-outside-to-close so a tap elsewhere dismisses it. */
    var statusChip = bar.querySelector('.lb-status');
    if (statusChip) {
      statusChip.addEventListener('click', function(e){
        e.stopPropagation();
        bar.classList.toggle('lb-pop-open');
      });
      statusChip.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); statusChip.click(); }
      });
    }
    document.addEventListener('click', function(e){
      if (bar && bar.classList.contains('lb-pop-open') && !bar.contains(e.target)) {
        bar.classList.remove('lb-pop-open');
      }
    });

    paintBar();
  }

  /* the fixed header got taller, so section anchors need a matching offset */
  function syncScrollOffset(){
    var top = document.querySelector('.top-fixed');
    if (!top) return;
    var h = Math.round(top.getBoundingClientRect().height) + 24;
    document.documentElement.style.scrollPaddingTop = h + 'px';
    var ids = ['types','directory','comparator','scenarios','glossary',
               'sizing','wealth','signals','quiz','fx','pro'];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.style.scrollMarginTop = h + 'px';
    });
  }
  window.addEventListener('resize', function(){ clearTimeout(syncScrollOffset.t);
    syncScrollOffset.t = setTimeout(syncScrollOffset, 200); });

  function fmtTime(ts){
    if (!ts) return S('never');
    var d = new Date(ts);
    return d.toLocaleTimeString(lang() === 'th' ? 'th-TH' : 'en-GB', { hour12:false });
  }

  var AGO = {
    en:{ now:'just now', s:'%Ns ago', m:'%Nm ago', h:'%Nh ago' },
    th:{ now:'เมื่อครู่นี้', s:'%N วิ ที่แล้ว', m:'%N น. ที่แล้ว', h:'%N ชม. ที่แล้ว' }
  };
  function fmtAgo(ts){
    if (!ts) return S('never');
    var s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    var d = AGO[lang()] || AGO.en;
    if (s < 5) return d.now;
    if (s < 60) return d.s.replace('%N', s);
    var m = Math.floor(s / 60);
    if (m < 60) return d.m.replace('%N', m);
    return d.h.replace('%N', Math.floor(m / 60));
  }

  /* ---------------------------------------------------------------
     5a. Bubble Radar status — the daily (not 30-min) CAPE/Buffett/
     margin-debt fetch is a different cadence from everything else in
     this bar, so it gets its own segment: what's known, and when the
     next run happens. scripts/fetch_bubble.py runs once a day at
     07:11 UTC via .github/workflows/bubble-data.yml — kept in sync
     with that cron by hand, since a static page can't read the
     workflow file.
     --------------------------------------------------------------- */
  function bubbleData(){
    try {
      var b = window.__SPZ_BUBBLE;
      return (b && typeof b.data === 'function') ? b.data() : null;
    } catch (e) { return null; }
  }
  function bubbleGeneratedTs(d){
    if (!d || !d.generated_at) return null;
    var t = Date.parse(d.generated_at);
    return isNaN(t) ? null : t;
  }
  function bubbleHasAnySignal(d){
    return !!(d && ((d.cape && d.cape.value != null) ||
      (d.margin_debt && d.margin_debt.yoy_pct != null) ||
      (d.buffett && d.buffett.value_pct != null)));
  }
  function nextBubbleRunTs(){
    var now = Date.now(), n = new Date();
    var next = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 7, 11, 0);
    if (next <= now) next += 24 * 3600 * 1000;
    return next;
  }
  /* "07:11" alone is ambiguous if that moment already passed today - say
     which calendar day (in the viewer's own timezone) it falls on */
  function isSameLocalDay(ts){
    var a = new Date(ts), b = new Date();
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function bubbleSegmentHTML(){
    var d = bubbleData(), gen = bubbleGeneratedTs(d), hasSignal = bubbleHasAnySignal(d);
    var known = hasSignal ? (S('bubbleUpdated') + ' ' + (gen ? fmtAgo(gen) : S('never'))) : S('bubblePending');
    var next = nextBubbleRunTs();
    var day = isSameLocalDay(next) ? S('bubbleToday') : S('bubbleTomorrow');
    return '<span class="spz-sep">·</span>' +
      '<span class="lb-ic">◔</span>' + S('bubbleLbl') + ' <b>' + known + '</b>' +
      ' <span class="spz-sep">·</span> ' + S('bubbleNext') + ' ' + day + ' <b>' + fmtTime(next) + '</b>';
  }
  /* the bubble module fetches on its own schedule (page load + every
     15 min) - repaint this bar the moment fresh bubble data lands,
     rather than waiting for this bar's own next refresh tick */
  document.addEventListener('spz:bubbleData', function(){ paintBar(); });

  function paintBar(){
    if (!bar) return;
    bar.className = 'is-' + (state.mode === 'loading' ? 'loading' : state.mode === 'live' ? 'live' : 'static') +
      (bar.classList.contains('lb-pop-open') ? ' lb-pop-open' : '');
    bar.querySelector('.spz-state').textContent =
      state.mode === 'loading' ? S('loading') : state.mode === 'live' ? S('live') : S('stat');
    var ms = marketStatus();
    var age = snapAgeH();
    document.getElementById('spzSrc').innerHTML =
      '<span class="lb-ic">◆</span>' + S('quotes') + ' <b>' + state.qSrc + '</b>' +
      '<span class="spz-sep">·</span>' +
      '<span class="lb-ic">▦</span>' + S('funda') + ' <b>' + state.mSrc + '</b>' +
      '<span class="spz-sep">·</span>' +
      '<span class="lb-mdot' + (ms.set ? ' on' : '') + '"></span>SET <b>' + tagText(ms.set ? 'open' : 'closed') + '</b>' +
      '<span class="spz-sep">·</span>' +
      '<span class="lb-mdot' + (ms.us ? ' on' : '') + '"></span>US <b>' + tagText(ms.us ? 'open' : 'closed') + '</b>' +
      '<span class="spz-sep">·</span>' +
      '<span class="lb-ic">◷</span>' + S('updated') + ' <b class="lb-ago">' + fmtAgo(state.last) + '</b>' +
      (age !== null && age > 3 ? ' <b style="color:var(--amber,#ffb020)">(' +
        age.toFixed(age > 24 ? 0 : 1) + 'h)</b>' : '') +
      bubbleSegmentHTML();
    var shortEl = bar.querySelector('.spz-short');
    if (shortEl) shortEl.innerHTML = S('updated') + ' <span class="lb-ago">' + fmtAgo(state.last) + '</span>';
    var refLbl = document.querySelector('#spzRefreshBtn .lb-lbl');
    if (refLbl) refLbl.textContent = S('refresh').replace(/^⟳\s*/, '');
    var keyLbl = document.querySelector('#spzKeyBtn .lb-lbl');
    if (keyLbl) keyLbl.textContent = S('keyBtn').replace(/^⚙\s*/, '');
    document.getElementById('spzKeyTitle').textContent = S('keyTitle');
    document.getElementById('spzKeyNote').textContent = S('keyNote');
    var lg = document.getElementById('spzLegend');
    if (lg) lg.innerHTML = legendHTML();
    mountHeadTags();
    document.getElementById('spzKeySave').textContent = S('save');
    document.getElementById('spzKeyClear').textContent = S('clear');
    if (inputEl) inputEl.placeholder = S('ph');
    bar.title = S('notice');
  }

  /* the only bit that should visibly tick on its own — cheap, and it is
     what actually reads as "live" to a person glancing at the bar */
  setInterval(function(){
    if (!bar) return;
    var ago = bar.querySelectorAll('.lb-ago');
    for (var i = 0; i < ago.length; i++) ago[i].textContent = fmtAgo(state.last);
  }, 1000);

  /* ---------------------------------------------------------------
     5b. section header tags — so each screen says how fresh it is
     --------------------------------------------------------------- */
  var HEAD_TAGS = [
    { sec:'directory',  id:'spzTagDir',  kind:function(){ return apiKey() ? 'rt' : (snapTs ? 'auto' : 'stat'); } },
    { sec:'comparator', id:'spzTagCmp',  kind:function(){ return apiKey() ? 'rt' : (snapTs ? 'auto' : 'stat'); } },
    { sec:'fx',         id:'spzTagFx',   kind:function(){ return (fxCache || snapTs) ? 'auto' : 'stat'; } }
  ];

  function mountHeadTags(){
    HEAD_TAGS.forEach(function(h){
      var sec = document.getElementById(h.sec);
      if (!sec) return;
      var eyebrow = sec.querySelector('.eyebrow');
      if (!eyebrow) return;
      var tag = document.getElementById(h.id);
      if (!tag) {
        tag = document.createElement('span');
        tag.id = h.id;
        eyebrow.appendChild(tag);
      }
      tag.outerHTML = tagHTML(h.kind(), '').replace('<span ', '<span id="' + h.id + '" ');
    });
  }

  /* ---------------------------------------------------------------
     6. ticker tape
     --------------------------------------------------------------- */
  var tapeCursor = 0;

  /* keyless mode: one symbol per tick, rotating — steady updates that stay
     well under any free proxy's rate limit */
  function trickleTape(){
    var h = window.__SPZ_HOOKS;
    if (!h || !h.tickers || !h.tickers.length || !proxyAllowed()) return Promise.resolve();
    var row = h.tickers[tapeCursor % h.tickers.length];
    tapeCursor++;
    return quoteOf(row[0], true).then(function(q){
      if (q.chgPct === null || q.chgPct === undefined) return;
      if (q.price !== null && q.price !== undefined && !isNaN(q.price)) row[1] = q.price;
      row[2] = (q.chgPct >= 0 ? '+' : '') + q.chgPct.toFixed(2) + '%';
      row[3] = q.chgPct >= 0;
      tapeTs[row[0]] = Date.now();
      noteSrc(q.src); state.last = Date.now();
      try { h.renderTicker(); } catch(e){}
      paintBar();
    }, function(){});
  }

  function refreshTape(force){
    var h = window.__SPZ_HOOKS;
    if (!h || !h.tickers) return Promise.resolve();
    if (!apiKey()) return trickleTape();
    var jobs = h.tickers.map(function(row){
      return quoteOf(row[0], force).then(function(q){
        if (q.chgPct === null || q.chgPct === undefined) return;
        if (q.price !== null && q.price !== undefined && !isNaN(q.price)) row[1] = q.price;
        row[2] = (q.chgPct >= 0 ? '+' : '') + q.chgPct.toFixed(2) + '%';
        row[3] = q.chgPct >= 0;
        tapeTs[row[0]] = Date.now();
        noteSrc(q.src); state.last = Date.now();
      }, function(){});
    });
    return Promise.all(jobs).then(function(){
      try { h.renderTicker(); } catch(e){}
      paintBar();
    });
  }

  /* ---------------------------------------------------------------
     7. stock directory + comparator data
     --------------------------------------------------------------- */
  function pct(v){ return (v >= 0 ? '' : '') + v.toFixed(2) + '%'; }

  function applyMetrics(stock, m){
    if (m.pe     !== null && m.pe > 0)  stock.pe = m.pe.toFixed(2);
    if (m.roe    !== null)              stock.roe = pct(m.roe);
    if (m.de     !== null)              stock.de_ratio = m.de.toFixed(2);
    if (m.margin !== null)              stock.net_margin = m.margin.toFixed(1);
    if (m.pb     !== null && m.pb > 0)  stock.pb_ratio = m.pb.toFixed(2);
    if (m.divYield !== null && m.divYield > 0) stock.div = pct(m.divYield);
    if (m.roi    !== null)              stock.roic_live = pct(m.roi);
    stock.__live = true; stock.__liveTs = m.ts;
  }

  function allStocks(){
    var h = window.__SPZ_HOOKS, out = [];
    if (!h || !h.dir) return out;
    Object.keys(h.dir).forEach(function(cat){
      h.dir[cat].forEach(function(s){ out.push(s); });
    });
    return out;
  }
  function stocksIn(cat){
    var h = window.__SPZ_HOOKS;
    return (h && h.dir && h.dir[cat]) ? h.dir[cat] : [];
  }

  function currentCat(){
    var tab = document.querySelector('.dir-tab.active');
    return (tab && tab.dataset.cat) || 'value';
  }

  var syncing = false;
  function syncStocks(list, force){
    if (!list.length) return Promise.resolve();
    var keyed = !!apiKey();
    var jobs = list.map(function(s){
      var t = s.ticker;
      /* without a key the card price comes from the snapshot: firing 20 proxy
         requests per tab switch only trips the proxy's rate limit */
      var p1 = (keyed ? quoteOf(t, force) : Promise.reject(new Error('snapshot'))).then(function(q){
        s.live_price = q.price; s.live_chg = q.chgPct; s.live_ccy = q.ccy || ccy(t);
        s.live_ts = q.ts; s.live_src = q.src; noteSrc(q.src); state.last = Date.now();
      }, function(){});
      var p2 = metricOf(t).then(function(m){
        applyMetrics(s, m); s.__metric_src = 'finnhub';
        state.mSrc = 'finnhub'; state.last = Date.now();
      }, function(){});
      return Promise.all([p1, p2]);
    });
    return Promise.all(jobs).then(function(){
      var h = window.__SPZ_HOOKS;
      try { if (h && h.renderDir) h.renderDir(); } catch(e){}
      decorate();
      paintBar();
    });
  }

  var fmtCache = {};
  function money(v, cur){
    var key = cur + (v < 1 ? 'a' : 'b');
    if (!fmtCache[key]) {
      fmtCache[key] = new Intl.NumberFormat('en-US', {
        style:'currency', currency:cur, minimumFractionDigits: v < 1 ? 4 : 2,
        maximumFractionDigits: v < 1 ? 4 : 2
      });
    }
    try { return fmtCache[key].format(v); } catch(e){ return v.toFixed(2) + ' ' + cur; }
  }

  function decorate(){
    var grid = document.getElementById('directoryGrid');
    if (!grid) return;
    var byTicker = {};
    allStocks().forEach(function(s){ byTicker[s.ticker] = s; });

    grid.querySelectorAll('.stock-card').forEach(function(card){
      var t = card.getAttribute('data-tk');
      var s = t && byTicker[t];
      if (!s) return;
      var old = card.querySelector('.spz-live-row');
      if (old) old.parentNode.removeChild(old);

      var row = document.createElement('div');
      row.className = 'spz-live-row';
      var html = '';
      if (typeof s.live_price === 'number') {
        var up = (s.live_chg || 0) >= 0;
        html += '<span class="spz-px">' + money(s.live_price, s.live_ccy || ccy(t)) + '</span>';
        if (typeof s.live_chg === 'number') {
          html += '<span class="spz-chg ' + (up ? 'up' : 'down') + '">' +
                  (up ? '▲ +' : '▼ ') + s.live_chg.toFixed(2) + '%</span>';
        }
        html += tagHTML(tierOf(s.live_src), 'spz-flag-slot', true);
      } else {
        html += tagHTML('stat', 'spz-flag-slot', true);
      }
      row.innerHTML = html;
      var desc = card.querySelector('.sc-desc');
      if (desc && desc.nextSibling) card.insertBefore(row, desc.nextSibling);
      else card.appendChild(row);

      if (s.__live) {
        card.querySelectorAll('.sc-metric').forEach(function(m){ m.classList.add('spz-fresh'); });
        if (!card.querySelector('.spz-roic')) {
          var wrap = card.querySelector('.sc-metrics');
          if (wrap && (s.roic_live || isFinancial(s))) {
            var d = document.createElement('div');
            d.className = 'sc-metric spz-fresh spz-roic';
            /* ROIC and net margin describe a company that turns assets into
               products. For a bank the balance sheet IS the product, so the
               ratio is arithmetic without meaning — say so instead of
               leaving a hole. */
            d.innerHTML = isFinancial(s)
              ? '<span>ROIC</span><b class="spz-na" title="' + S('naWhy') + '">' + S('naShort') + '</b>'
              : '<span>ROIC</span><b>' + s.roic_live + '</b>';
            wrap.appendChild(d);
          }
        }
      }
    });
  }

  /* re-decorate whenever the grid is re-rendered (tab switch, language switch) */
  function watchGrid(){
    var grid = document.getElementById('directoryGrid');
    if (!grid) return;
    var mo = new MutationObserver(function(){
      if (mo.__busy) return;
      mo.__busy = true;
      setTimeout(function(){ mo.__busy = false; decorate(); }, 0);
    });
    mo.observe(grid, { childList:true });
    document.addEventListener('click', function(e){
      var tab = e.target.closest && e.target.closest('.dir-tab');
      if (tab) setTimeout(function(){ syncStocks(stocksIn(currentCat()), false); }, 60);
    });
  }

  /* ---------------------------------------------------------------
     8. FX desk
     --------------------------------------------------------------- */
  var fxTouched = false;
  function watchFxInput(){
    var el = document.getElementById('fxRate');
    if (el) el.addEventListener('input', function(){ fxTouched = true; });
  }

  function applyFx(data){
    var h = window.__SPZ_HOOKS;
    if (!h || !h.fx || !data || !data.rates) return;
    var used = 0;
    h.fx.forEach(function(c){
      var r = data.rates[c.code];
      if (typeof r === 'number' && r > 0) { c.usd = r; used++; }
    });
    if (!used) return;
    state.fxSrc = data.src; state.last = Date.now();
    try {
      if (h.updateFxRateLabel) h.updateFxRateLabel();
      if (!fxTouched && h.fxFillReferenceRate) h.fxFillReferenceRate();
    } catch(e){}
    paintBar();
  }

  function refreshFx(force){
    if (!force && fresh(fxCache, CFG.fxTTL)) { applyFx(fxCache); return Promise.resolve(); }
    return fetchFX().then(function(d){
      fxCache = d; persist(); applyFx(d);
    }, function(){
      if (fxCache) applyFx(fxCache);
    });
  }

  /* ---------------------------------------------------------------
     9. orchestration
     --------------------------------------------------------------- */
  function refreshAll(force){
    state.mode = 'loading'; paintBar();
    if (!apiKey() && !snapTs) state.mSrc = lang() === 'th' ? 'ค่าในไฟล์' : 'built-in';
    return Promise.all([
      refreshTape(force),
      syncStocks(stocksIn(currentCat()), force),
      refreshFx(force)
    ]).then(function(){
      state.mode = state.last ? 'live' : 'static';
      paintBar();
    });
  }

  function warmRest(){
    /* Only worth doing when a Finnhub key is present: without one the repo
       snapshot already covers every category, and hammering a free public
       CORS proxy with 58 extra symbols just gets us rate-limited. */
    if (!apiKey()) return;
    var cats = ['value','growth','dividend','defensive'], i = 0;
    (function next(){
      if (i >= cats.length) return;
      var cat = cats[i++];
      if (cat === currentCat()) { next(); return; }
      syncStocks(stocksIn(cat), false).then(function(){ setTimeout(next, 2500); }, function(){ setTimeout(next, 4000); });
    })();
  }

  function boot(){
    if (!window.__SPZ_HOOKS || !document.querySelector('.ticker-bar')) { setTimeout(boot, 300); return; }
    buildBar();
    syncScrollOffset();
    watchGrid();
    watchFxInput();
    decorate();
    mountHeadTags();
    setInterval(mountHeadTags, 15000);
    /* never leave the badge spinning forever on a blocked network */
    setTimeout(function(){
      if (!state.last) { state.mode = 'static'; paintBar(); }
    }, 12000);
    /* keep bar + card labels in the right language */
    new MutationObserver(function(){ paintBar(); decorate(); })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    loadSnapshot().then(function(){
      return refreshAll(false);
    }).then(function(){ setTimeout(warmRest, 3000); });
    setInterval(function(){ if (!document.hidden) loadSnapshot(); }, 10 * 60 * 1000);
    setInterval(function(){
      if (document.hidden || !apiKey()) return;
      refreshTape(true);
      syncStocks(stocksIn(currentCat()), true);
    }, CFG.autoRefresh);
    setInterval(function(){
      if (document.hidden || apiKey()) return;
      trickleTape();
    }, 7000);
    setInterval(function(){ if (!document.hidden) refreshFx(false); }, CFG.fxTTL);
  }


  /* real daily/intraday OHLCV history via the same proxy rotation as
     the live quote fetcher above — shared rate limiter, shared breaker.
     Used by the Pro Desk's "Real Data" add-on (volume profile, factor
     attribution, Monte Carlo) — none of that needs anything beyond a
     free chart endpoint, unlike GEX/dark-pool/L2 book which do. */
  /* same fetch, but for a symbol that is already exact Yahoo spelling
     (index/futures symbols like "GC=F" or "DX-Y.NYB") -- yahooSym() above
     exists to turn a plain stock ticker into one, and would mangle a
     symbol that already has its own dot/dash in it (e.g. "DX-Y.NYB" ->
     "DX-Y-NYB", which Yahoo does not recognize), so this skips it. */
  function fetchHistoryRaw(sym, range, interval){
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
              encodeURIComponent(sym) + '?range=' + range + '&interval=' + interval;
    return viaProxy(url).then(function(d){
      var r = d && d.chart && d.chart.result && d.chart.result[0];
      if (!r || !r.timestamp) throw new Error('no yahoo history');
      var q = r.indicators && r.indicators.quote && r.indicators.quote[0];
      if (!q) throw new Error('no yahoo quote series');
      var out = [];
      for (var i = 0; i < r.timestamp.length; i++){
        var c = q.close ? q.close[i] : null;
        if (typeof c !== 'number') continue;
        out.push({ t: r.timestamp[i] * 1000, c: c });
      }
      if (!out.length) throw new Error('empty yahoo history');
      return out;
    });
  }
  function historyOfRaw(sym, range, interval){
    return schedule(function(){ return fetchHistoryRaw(sym, range, interval); });
  }

  function fetchHistory(t, range, interval){
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
              encodeURIComponent(yahooSym(t)) + '?range=' + range + '&interval=' + interval;
    return viaProxy(url).then(function(d){
      var r = d && d.chart && d.chart.result && d.chart.result[0];
      if (!r || !r.timestamp) throw new Error('no yahoo history');
      var q = r.indicators && r.indicators.quote && r.indicators.quote[0];
      if (!q) throw new Error('no yahoo quote series');
      var out = [];
      for (var i = 0; i < r.timestamp.length; i++){
        var c = q.close ? q.close[i] : null;
        if (typeof c !== 'number') continue;
        out.push({
          t: r.timestamp[i] * 1000,
          o: (q.open && typeof q.open[i] === 'number') ? q.open[i] : c,
          h: (q.high && typeof q.high[i] === 'number') ? q.high[i] : c,
          l: (q.low  && typeof q.low[i]  === 'number') ? q.low[i]  : c,
          c: c,
          v: (q.volume && typeof q.volume[i] === 'number') ? q.volume[i] : 0
        });
      }
      if (!out.length) throw new Error('empty yahoo history');
      return out;
    });
  }
  function historyOf(t, range, interval){
    return schedule(function(){ return fetchHistory(t, range, interval); });
  }

  window.__SPZ_LIVE = {
    refresh: refreshAll, quoteOf: quoteOf, metricOf: metricOf,
    cfg: CFG, state: state, decorate: decorate,
    snapshot: function(){ return lastSnap; },
    snapAgeH: snapAgeH, marketStatus: marketStatus,
    historyOf: historyOf, historyOfRaw: historyOfRaw
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 400); });
  else setTimeout(boot, 400);
})();
