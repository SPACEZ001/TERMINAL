
/* ===========================================================================
   Round AB: Quiet Value Scanner. This page's "secret" was never static
   text -- it's a scoring FORMULA (value/quality/quiet/room weights and
   thresholds) applied to the site's own public market snapshot. Unlike
   every other admin-only page, this one had NO window.__SPZ_TIER() check
   at all AND no server gate: the formula ran straight in the browser from
   window.__SPZ_LIVE, so the weights/thresholds themselves were readable
   via view-source, not just the output.

   Fixed the same direction as the Classroom/Control Grid: the formula now
   runs only in the Worker (see line-qr-worker.js's computeQuietValue()),
   gated by the same X-Admin-Key. Unlike those two pages there is no KV and
   no uploader tool here -- there's nothing to seed. The raw input
   (data/market.json) is already public static data this site serves
   itself, so the Worker just re-fetches it and re-runs the math server-
   side on every authenticated request, always reflecting the live
   (30-minute-refreshed) snapshot without any manual publish step. Only
   the final top-12 ranked list crosses the wire -- never the formula. */
(function(){
  'use strict';
  if (window.__SPZ_QUIETVALUE) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  function fill(str, vars){
    return Object.keys(vars).reduce(function(s, k){ return s.split('{' + k + '}').join(vars[k]); }, str);
  }

  // Round AB: same Worker, same sessionStorage key as Connected Users /
  // Announcements / the Classroom / Control Grid -- one admin key unlocks
  // all of them.
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';

  function getAdminKey(){
    try { return sessionStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; }
  }
  function setAdminKey(k){
    try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){}
  }
  function clearAdminKey(){
    try { sessionStorage.removeItem(ADMIN_KEY_STORAGE); } catch(e){}
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
      th:'ตัวคัดกรองเชิงสถิติจากข้อมูลที่เว็บนี้มีอยู่แล้ว (P/E, P/B, ROE, ROIC, มาร์จิ้น, หนี้สินต่อทุน, RSI, การเปลี่ยนแปลงราคา 1 เดือน, ระยะห่างจากจุดสูงสุดรอบ 52 สัปดาห์) ไม่ใช่การพยากรณ์หรือคำแนะนำการลงทุน ใช้เป็นรายชื่อไปค้นคว้าต่อ ไม่ใช่รายการให้ซื้อ เฉพาะแอดมิน'},

    adminOnly: { en:'Admins only.', th:'เฉพาะแอดมินเท่านั้น' },
    keyLede: { en:'This screen\'s ranking is now computed on the server, not in the page you downloaded — enter the same admin key used on Connected Users / Announcements / the Classroom / Control Grid to view it.',
               th:'การจัดอันดับของหน้านี้ถูกคำนวณบนเซิร์ฟเวอร์แล้ว ไม่ได้คำนวณในหน้าเว็บที่ดาวน์โหลดมาอีกต่อไป — ใส่รหัสแอดมินเดียวกับที่ใช้ในหน้า Connected Users / ประกาศ / ห้องเรียน / ใครคุมเงินโลก เพื่อดูผลลัพธ์' },
    keyPh: { en:'Admin key', th:'รหัสแอดมิน' },
    keySubmit: { en:'Unlock', th:'ปลดล็อก' },
    keyErrBad: { en:'Incorrect key — try again.', th:'รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง' },
    keyErrNet: { en:'Could not reach the server — try again.', th:'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง' },
    loading: { en:'Loading…', th:'กำลังโหลด…' },
    retry: { en:'Try again', th:'ลองใหม่' }
  };

  var sec = null, q = '';

  var resultsCache = null; // null until fetched; then [{t,r:{name,sector,rsi,m1,off_high},val,qual,qualScore,quiet,room,composite}, ...]
  var resultsLoading = false;
  var resultsErr = null; // null | 'bad' | 'net'

  function fetchQuietValueResults(){
    var key = getAdminKey();
    if(!key) return;
    resultsLoading = true; resultsErr = null;
    paint();
    fetch(WORKER_BASE + '/api/quietvalue/results', { headers:{ 'X-Admin-Key': key } })
      .then(function(r){
        if(r.status === 401){ clearAdminKey(); resultsErr = 'bad'; resultsCache = null; resultsLoading = false; paint(); return null; }
        if(!r.ok) throw new Error('bad_status');
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        resultsCache = data.results || [];
        resultsLoading = false;
        paint();
      })
      .catch(function(){ resultsErr = 'net'; resultsLoading = false; paint(); });
  }

  function keyGateHTML(){
    return '<div class="ewv-keygate">' +
      '<div class="ewv-keygate-icon">🔑</div>' +
      '<p class="ewv-keygate-lede">' + esc(tx(T.keyLede)) + '</p>' +
      '<input type="password" class="ewv-key-input" data-qv-key="input" autocomplete="off" spellcheck="false" placeholder="' + esc(tx(T.keyPh)) + '">' +
      '<button type="button" class="ewv-key-btn" data-qv-key="submit">' + esc(tx(T.keySubmit)) + '</button>' +
      (resultsErr === 'bad' ? '<div class="ewv-key-err">' + esc(tx(T.keyErrBad)) + '</div>' : '') +
    '</div>';
  }

  function netErrorHTML(){
    return '<div class="ewv-content-err">' +
      '<p>' + esc(tx(T.keyErrNet)) + '</p>' +
      '<button type="button" class="ewv-key-btn" data-qv-key="retry">' + esc(tx(T.retry)) + '</button>' +
    '</div>';
  }

  function submitContentKey(){
    var input = sec && sec.querySelector('[data-qv-key="input"]');
    var key = input ? input.value.trim() : '';
    if(!key) return;
    setAdminKey(key);
    fetchQuietValueResults();
  }

  function wireContentGate(host){
    if(!host) return;
    var input = host.querySelector('[data-qv-key="input"]');
    if(input) input.addEventListener('keydown', function(ev){ if(ev.key === 'Enter') submitContentKey(); });
    var submit = host.querySelector('[data-qv-key="submit"]');
    if(submit) submit.addEventListener('click', submitContentKey);
    var retry = host.querySelector('[data-qv-key="retry"]');
    if(retry) retry.addEventListener('click', fetchQuietValueResults);
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

    if (window.__SPZ_TIER && window.__SPZ_TIER() !== 'full') {
      list.innerHTML = '<div class="qrp-locked">' + esc(tx(T.adminOnly)) + '</div>';
      return;
    }

    if (!getAdminKey()) { list.innerHTML = keyGateHTML(); wireContentGate(list); return; }
    if (resultsLoading) { list.innerHTML = '<div class="ewv-content-loading">' + esc(tx(T.loading)) + '</div>'; return; }
    if (resultsErr === 'net') { list.innerHTML = netErrorHTML(); wireContentGate(list); return; }
    if (resultsCache === null) {
      if (!resultsErr) fetchQuietValueResults(); // key present, nothing fetched yet -- kick it off
      return; // fetchQuietValueResults() repaints the loading state itself
    }

    var rows = rowsOf(resultsCache);
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
        if (list && resultsCache) {
          var rows = rowsOf(resultsCache);
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

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_QUIETVALUE = { repaint: paint, rows: function(){ return resultsCache; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
