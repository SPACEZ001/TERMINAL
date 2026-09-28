
(function(){
  'use strict';
  if (window.__SPZ_ANOMALY) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  function tpl(o, vars){
    var s = tx(o);
    for (var k in vars) { if (vars.hasOwnProperty(k)) s = s.split('{' + k + '}').join(vars[k]); }
    return s;
  }

  var T = {
    eyebrow:{en:'MARKET ANOMALY SCAN',th:'สแกนสัญญาณผิดปกติทั้งตลาด'},
    h:{en:'What’s Breaking From The Pattern',th:'ตอนนี้อะไรผิดไปจากรูปแบบเดิม'},
    lede:{en:'Every ticker the site tracks, checked against itself: price making a new high or low while momentum quietly disagrees, a 200-day trend line just crossed, or a stock sitting right at its 52-week edge with RSI fading. Computed straight from the same 30-minute snapshot every other screen uses — nothing new fetched, nothing paid for. A pattern showing up here is a reason to look closer, not a signal to trade.',
      th:'เช็คทุกตัวที่เว็บนี้ติดตามกับตัวมันเอง: ราคาทำจุดสูงหรือต่ำใหม่ทั้งที่โมเมนตัมไม่ยืนยันตาม เส้นค่าเฉลี่ย 200 วันเพิ่งถูกตัดผ่าน หรือหุ้นอยู่ติดขอบสูง/ต่ำรอบ 52 สัปดาห์ทั้งที่ RSI เริ่มอ่อนแรง คำนวณจากข้อมูลสแนปช็อตทุก 30 นาทีชุดเดียวกับหน้าอื่น ๆ ไม่ได้ดึงอะไรใหม่ ไม่มีค่าใช้จ่ายเพิ่ม เจอสัญญาณตรงนี้แปลว่าควรดูให้ละเอียดขึ้น ไม่ใช่สัญญาณให้ซื้อขายทันที'},
    all:{en:'All',th:'ทั้งหมด'},
    bear:{en:'Bearish divergence',th:'ไดเวอร์เจนซ์ขาลง'},
    bull:{en:'Bullish divergence',th:'ไดเวอร์เจนซ์ขาขึ้น'},
    golden:{en:'Golden cross',th:'ตัดขึ้น (Golden Cross)'},
    death:{en:'Death cross',th:'ตัดลง (Death Cross)'},
    high:{en:'Near high, fading',th:'ใกล้จุดสูงสุด แรงอ่อน'},
    low:{en:'Near low, turning',th:'ใกล้จุดต่ำสุด เริ่มกลับตัว'},
    searchPh:{en:'Search ticker or company…',th:'ค้นหาชื่อย่อหรือชื่อบริษัท…'},
    thTk:{en:'Ticker',th:'สัญลักษณ์'}, thType:{en:'Type',th:'ประเภท'},
    thWhat:{en:'What’s happening',th:'กำลังเกิดอะไร'},
    empty:{en:'Nothing in this category right now — try "All" or check back after the next sync.',
      th:'ยังไม่มีอะไรในหมวดนี้ตอนนี้ — ลองดู "ทั้งหมด" หรือกลับมาเช็คหลังรอบซิงก์ถัดไป'},
    waiting:{en:'Waiting for the first data sync…',th:'กำลังรอข้อมูลรอบแรก…'},
    foot:{en:'Divergences and cross events come straight from the same 30-minute market snapshot (Yahoo Finance price history, RSI and moving averages computed server-side). "Near high/low, fading/turning" is a simpler check run in your browser on the same data. None of this predicts direction — it only flags where the usual pattern of price and momentum agreeing has broken. Educational use only, not investment advice.',
      th:'ไดเวอร์เจนซ์และการตัดเส้นค่าเฉลี่ยมาจากสแนปช็อตตลาดชุดเดียวกันทุก 30 นาที (ราคาย้อนหลังจาก Yahoo Finance คำนวณ RSI และเส้นค่าเฉลี่ยที่ฝั่งเซิร์ฟเวอร์) ส่วน "ใกล้จุดสูง/ต่ำ แรงอ่อน/กลับตัว" เป็นการเช็คแบบง่ายที่คำนวณในเบราว์เซอร์จากข้อมูลชุดเดียวกัน ทั้งหมดนี้ไม่ได้ทำนายทิศทาง แค่ชี้ว่าจุดที่ราคากับโมเมนตัมปกติไปด้วยกันเริ่มไม่ตรงกัน ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน'},
    bearT:{en:'Price made a new high ({p}%) but RSI weakened from {a} to {b} — momentum isn’t confirming.',
      th:'ราคาทำจุดสูงใหม่ ({p}%) แต่ RSI อ่อนลงจาก {a} เป็น {b} — โมเมนตัมไม่ยืนยันตาม'},
    bullT:{en:'Price made a new low ({p}%) but RSI strengthened from {a} to {b} — selling pressure may be fading.',
      th:'ราคาทำจุดต่ำใหม่ ({p}%) แต่ RSI แข็งขึ้นจาก {a} เป็น {b} — แรงขายอาจเริ่มหมด'},
    goldenT:{en:'Just crossed above its 200-day average, now {v}% above it.',
      th:'เพิ่งตัดขึ้นเหนือเส้นค่าเฉลี่ย 200 วัน ตอนนี้อยู่เหนือเส้นนั้น {v}%'},
    deathT:{en:'Just crossed below its 200-day average, now {v}% below it.',
      th:'เพิ่งตัดลงใต้เส้นค่าเฉลี่ย 200 วัน ตอนนี้อยู่ใต้เส้นนั้น {v}%'},
    highT:{en:'Sitting {h}% off its 52-week high, but RSI has faded from {a} to {b} over the last 20 sessions.',
      th:'อยู่ห่างจากจุดสูงสุดรอบ 52 สัปดาห์แค่ {h}% แต่ RSI อ่อนลงจาก {a} เป็น {b} ในช่วง 20 วันทำการล่าสุด'},
    lowT:{en:'Sitting {l}% off its 52-week low, but RSI has strengthened from {a} to {b} over the last 20 sessions.',
      th:'อยู่ห่างจากจุดต่ำสุดรอบ 52 สัปดาห์แค่ {l}% แต่ RSI แข็งขึ้นจาก {a} เป็น {b} ในช่วง 20 วันทำการล่าสุด'}
  };

  var CATS = ['bear','bull','golden','death','high','low'];

  var sec = null, snap = null;
  var state = { filter:'all', q:'' };

  function snapshot(){
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
    catch(e){ return null; }
  }

  function computeRows(){
    var s = snap; if (!s) return [];
    var rows = [];
    var reg = s.regime || {};
    (reg.divergences || []).forEach(function(d){
      if (!d || !d.t) return;
      var bear = d.kind === 'bearish';
      rows.push({
        tk: d.t, name: d.name || '', etf: !!d.etf, cat: bear ? 'bear' : 'bull',
        mag: Math.abs(d.gap || 0),
        detail: tpl(bear ? T.bearT : T.bullT, {
          p: isNum(d.price_gap) ? sgn(d.price_gap, 1) : '—',
          a: isNum(d.rsi_then) ? d.rsi_then : '—',
          b: isNum(d.rsi) ? d.rsi : '—'
        })
      });
    });
    (reg.crosses || []).forEach(function(c){
      if (!c || !c.t) return;
      var golden = c.kind === 'golden';
      rows.push({
        tk: c.t, name: c.name || '', etf: false, cat: golden ? 'golden' : 'death',
        mag: Math.abs(c.vs200 || 0),
        detail: tpl(golden ? T.goldenT : T.deathT, {
          v: isNum(c.vs200) ? Math.abs(c.vs200).toFixed(1) : '—'
        })
      });
    });
    var stocks = s.stocks || {};
    Object.keys(stocks).forEach(function(tk){
      var r = stocks[tk];
      if (!r || r.stale) return;
      if (!isNum(r.off_high) || !isNum(r.off_low) || !isNum(r.rsi) || !isNum(r.rsi_20d_ago)) return;
      var chg = r.rsi - r.rsi_20d_ago;
      if (r.off_high >= -5 && chg <= -5) {
        rows.push({ tk:tk, name:r.name || '', etf:false, cat:'high', mag:Math.abs(chg),
          detail: tpl(T.highT, { h: Math.abs(r.off_high).toFixed(1), a: r.rsi_20d_ago, b: r.rsi }) });
      }
      if (r.off_low <= 5 && chg >= 5) {
        rows.push({ tk:tk, name:r.name || '', etf:false, cat:'low', mag:Math.abs(chg),
          detail: tpl(T.lowT, { l: Math.abs(r.off_low).toFixed(1), a: r.rsi_20d_ago, b: r.rsi }) });
      }
    });
    return rows;
  }

  function counts(rows){
    var c = { bear:0, bull:0, golden:0, death:0, high:0, low:0 };
    rows.forEach(function(r){ if (c[r.cat] !== undefined) c[r.cat]++; });
    return c;
  }

  function chipsHTML(rows){
    var c = counts(rows);
    return CATS.map(function(k){
      return '<button type="button" class="an-chip ' + k + (state.filter === k ? ' on' : '') +
        '" data-an-f="' + k + '"><div class="an-cn">' + c[k] + '</div>' +
        '<div class="an-cl">' + esc(tx(T[k])) + '</div></button>';
    }).join('');
  }

  function pillsHTML(){
    var items = ['all'].concat(CATS);
    return items.map(function(k){
      return '<button type="button" class="ss-pill' + (state.filter === k ? ' on' : '') +
        '" data-an-f="' + k + '">' + esc(tx(T[k])) + '</button>';
    }).join('');
  }

  var CAT_ORDER = { bear:0, bull:1, golden:2, death:3, high:4, low:5 };

  function rowsHTML(rows){
    var filtered = rows.filter(function(r){ return state.filter === 'all' || r.cat === state.filter; });
    if (state.q) {
      var q = state.q.toLowerCase();
      filtered = filtered.filter(function(r){
        return r.tk.toLowerCase().indexOf(q) !== -1 || String(r.name).toLowerCase().indexOf(q) !== -1;
      });
    }
    if (!filtered.length) return '<div class="ss-empty">' + esc(tx(T.empty)) + '</div>';
    filtered.sort(function(a, b){
      if (state.filter === 'all') {
        var d = CAT_ORDER[a.cat] - CAT_ORDER[b.cat];
        if (d) return d;
      }
      return b.mag - a.mag;
    });
    return '<div class="ss-tab-wrap"><table class="ss-tab"><thead><tr>' +
      '<th style="text-align:left">' + esc(tx(T.thTk)) + '</th>' +
      '<th style="text-align:left">' + esc(tx(T.thType)) + '</th>' +
      '<th style="text-align:left">' + esc(tx(T.thWhat)) + '</th>' +
      '</tr></thead><tbody>' +
      filtered.map(function(r){
        return '<tr' + (r.etf ? '' : ' class="an-clickable" data-an-go="' + esc(r.tk) + '"') + '>' +
          '<td class="an-row-tk">' + esc(r.tk) + (r.etf ? '<span class="an-etf">ETF</span>' : '') +
            (r.name ? '<small>' + esc(String(r.name).slice(0, 30)) + '</small>' : '') + '</td>' +
          '<td style="text-align:left"><span class="an-tag ' + r.cat + '">' + esc(tx(T[r.cat])) + '</span></td>' +
          '<td style="text-align:left;white-space:normal;color:var(--grey);font-size:11.5px;line-height:1.6;max-width:460px;">' +
            esc(r.detail) + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function bindControls(body){
    body.querySelectorAll('[data-an-f]').forEach(function(b){
      b.addEventListener('click', function(){ state.filter = b.getAttribute('data-an-f'); paint(); });
    });
    var input = body.querySelector('[data-an="q"]');
    if (input) {
      input.addEventListener('input', function(){
        state.q = input.value;
        var rr = body.querySelector('[data-an="rows"]');
        if (rr) { rr.innerHTML = rowsHTML(computeRows()); bindRowClicks(rr); }
      });
    }
    bindRowClicks(body.querySelector('[data-an="rows"]') || body);
  }

  function bindRowClicks(host){
    if (!host) return;
    host.querySelectorAll('tr[data-an-go]').forEach(function(tr){
      tr.addEventListener('click', function(){
        var tk = tr.getAttribute('data-an-go');
        if (window.__SPZ_STOCK && typeof window.__SPZ_STOCK.open === 'function') window.__SPZ_STOCK.open(tk);
      });
    });
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-an="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(T.eyebrow);
    if (q('h')) q('h').textContent = tx(T.h);
    if (q('lede')) q('lede').textContent = tx(T.lede);
    var body = q('body');
    if (!body) return;
    if (!snap) { body.innerHTML = '<div class="ss-empty">' + esc(tx(T.waiting)) + '</div>'; return; }
    var rows = computeRows();
    body.innerHTML =
      '<div class="spz-scan reveal in-view">' +
        '<div class="an-sum">' + chipsHTML(rows) + '</div>' +
        '<div class="an-ctl">' +
          '<div class="ss-pills" style="margin:0;">' + pillsHTML() + '</div>' +
          '<input class="an-in" data-an="q" type="search" autocomplete="off" placeholder="' +
            esc(tx(T.searchPh)) + '" value="' + esc(state.q) + '">' +
        '</div>' +
        '<div data-an="rows">' + rowsHTML(rows) + '</div>' +
        '<div class="ss-foot">' + esc(tx(T.foot)) + '</div>' +
      '</div>';
    bindControls(body);
  }

  function build(){
    if (document.getElementById('anomaly')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'anomaly';
    sec.setAttribute('data-route', 'anomaly');
    sec.innerHTML =
      '<div class="an-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-an="eb"></span></div>' +
          '<h2 data-an="h"></h2>' +
          '<p class="lede" data-an="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-an="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'anomaly', feat:true, after:'regime',
      t:{en:'Anomaly Scan',th:'สแกนสัญญาณผิดปกติ'},
      d:{en:'Every tracked ticker checked against itself — RSI divergence, 200-day cross events, and stocks sitting right at a 52-week edge with momentum fading. Admin-only.',
         th:'เช็คทุกตัวที่ติดตามกับตัวมันเอง — ไดเวอร์เจนซ์ของ RSI การตัดเส้นค่าเฉลี่ย 200 วัน และหุ้นที่อยู่ติดขอบ 52 สัปดาห์ทั้งที่โมเมนตัมเริ่มอ่อน เฉพาะแอดมิน'}
    });

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(e){
      snap = e.detail;
      paint();
    });
    var seed = setInterval(function(){
      var s = snapshot();
      if (s) { snap = s; paint(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_ANOMALY = { repaint: paint, rows: computeRows };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1100); });
  } else {
    setTimeout(boot, 1100);
  }
})();
