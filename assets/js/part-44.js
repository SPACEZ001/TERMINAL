
(function(){
  'use strict';
  if (window.__SPZ_DAILY) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }

  var T = {
    eyebrow:{en:'DAILY SUMMARY',th:'สรุปประจำวันอัตโนมัติ'},
    h:{en:'The Last 30 Minutes, In Words',th:'สรุปข้อมูลรอบล่าสุดเป็นคำพูด'},
    lede:{en:'A plain-language readout of the same snapshot every screen here already uses, written fresh each time the data refreshes — nothing here is written by a person and nothing here is a prediction. Think of it as the two-minute version of clicking through every other page.',
      th:'สรุปข้อมูลชุดเดียวกับที่ทุกหน้าใช้อยู่แล้ว เขียนใหม่ทุกครั้งที่ข้อมูลรีเฟรช ไม่มีคนเขียน ไม่ใช่การคาดการณ์ ให้คิดว่าเป็นเวอร์ชัน 2 นาทีของการไล่ดูทุกหน้าทีละหน้า'},
    asof:{en:'As of',th:'ข้อมูล ณ'},
    waiting:{en:'Waiting for the first data sync…',th:'กำลังรอข้อมูลรอบแรก…'},
    headlineL:{en:'HEADLINE',th:'ประเด็นหลัก'},
    quiet:{en:'Nothing unusual is standing out in the early-warning gauges right now — a quiet day by that measure.',
      th:'ตอนนี้ไม่มีอะไรผิดปกติเด่นชัดในตัวชี้วัดเตือนล่วงหน้า — วันนี้ค่อนข้างเงียบตามเกณฑ์นี้'},
    scoreL:{en:'EARLY-WARNING GAUGES',th:'ตัวชี้วัดเตือนล่วงหน้า'},
    scoreTxt:{en:'{a} of {k} gauges are flashing red and {s} are on watch — the rest read normal.',
      th:'{a} จาก {k} ตัวชี้วัดกำลังแดง และอีก {s} ตัวอยู่ในระดับเฝ้าระวัง — ที่เหลืออ่านค่าปกติ'},
    scoreNA:{en:'The early-warning gauges haven’t loaded yet — open Turning Point Radar to see them.',
      th:'ตัวชี้วัดเตือนล่วงหน้ายังไม่โหลด — เปิดหน้าสัญญาณเปลี่ยนทิศเพื่อดู'},
    moversL:{en:'BIGGEST MOVERS TODAY',th:'ขยับแรงที่สุดวันนี้'},
    gainH:{en:'Up most',th:'ขึ้นมากที่สุด'}, loseH:{en:'Down most',th:'ลงมากที่สุด'},
    noMovers:{en:'No daily change data available yet.',th:'ยังไม่มีข้อมูลการเปลี่ยนแปลงรายวัน'},
    flowL:{en:'WHERE MONEY HAS LEANED, PAST MONTH',th:'เดือนที่ผ่านมา เงินเอียงไปทางไหน'},
    flowTxt:{en:'Over the past month, money has favored <b class="up">{a}</b> ({av}%) and avoided <b class="dn">{b}</b> ({bv}%) the most among tracked sectors.',
      th:'ในเดือนที่ผ่านมา เงินเอียงเข้า <b class="up">{a}</b> ({av}%) มากที่สุด และเลี่ยง <b class="dn">{b}</b> ({bv}%) มากที่สุดในกลุ่มที่ติดตาม'},
    flowNA:{en:'Sector flow data isn’t available in this snapshot.',th:'สแนปช็อตนี้ยังไม่มีข้อมูลเงินไหลรายกลุ่ม'},
    anomL:{en:'ANOMALY SCAN',th:'สแกนสัญญาณผิดปกติ'},
    anomTxt:{en:'The anomaly scan is currently flagging <b class="warn">{n}</b> tickers with a pattern break — momentum divergence, a moving-average cross, or sitting right at a 52-week edge.',
      th:'ตอนนี้สแกนสัญญาณผิดปกติกำลังชี้ <b class="warn">{n}</b> ตัวที่มีรูปแบบผิดไปจากเดิม — ไดเวอร์เจนซ์ของโมเมนตัม การตัดเส้นค่าเฉลี่ย หรืออยู่ติดขอบ 52 สัปดาห์'},
    anomZero:{en:'The anomaly scan has nothing flagged right now.',th:'ตอนนี้สแกนสัญญาณผิดปกติยังไม่พบอะไร'},
    anomNA:{en:'Open Anomaly Scan for the full breakdown.',th:'เปิดหน้าสแกนสัญญาณผิดปกติเพื่อดูรายละเอียดทั้งหมด'},
    goAnom:{en:'Open Anomaly Scan →',th:'เปิดหน้าสแกนสัญญาณผิดปกติ →'},
    goRegime:{en:'Open Turning Point Radar →',th:'เปิดหน้าสัญญาณเปลี่ยนทิศ →'},
    foot:{en:'Every line above is generated from the same numbers shown elsewhere on this site — nothing is fetched separately and nothing is written by a person. It refreshes with each 30-minute snapshot. This is a summary, not a forecast, and not investment advice.',
      th:'ทุกบรรทัดด้านบนสร้างจากตัวเลขชุดเดียวกับที่แสดงในหน้าอื่นของเว็บนี้ ไม่ได้ดึงข้อมูลแยก และไม่มีคนเขียน จะอัปเดตทุกรอบสแนปช็อต 30 นาที นี่คือบทสรุป ไม่ใช่การคาดการณ์ และไม่ใช่คำแนะนำการลงทุน'}
  };

  var snap = null;
  var sec = null;

  function snapshot(){
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
    catch(e){ return null; }
  }

  function fmtTime(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB',
      { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:false });
  }

  function regimeScore(){
    try { return window.__SPZ_REGIME && window.__SPZ_REGIME.score && window.__SPZ_REGIME.score(); }
    catch(e){ return null; }
  }
  function regimeAlert(){
    try { return window.__SPZ_REGIME && window.__SPZ_REGIME.alert && window.__SPZ_REGIME.alert(); }
    catch(e){ return null; }
  }
  function anomalyRows(){
    try { return (window.__SPZ_ANOMALY && window.__SPZ_ANOMALY.rows && window.__SPZ_ANOMALY.rows()) || null; }
    catch(e){ return null; }
  }

  function headlineHTML(){
    var al = regimeAlert();
    var txt = al && al.text ? esc(al.text) : esc(tx(T.quiet));
    return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.headlineL)) + '</div>' +
      '<div class="dy-txt">' + txt + '</div></div>';
  }

  function scoreHTML(){
    var sc = regimeScore();
    var body;
    if (sc && isNum(sc.known)) {
      body = esc(tx(T.scoreTxt))
        .replace('{a}', String(sc.alerts)).replace('{k}', String(sc.known)).replace('{s}', String(sc.soft));
    } else {
      body = esc(tx(T.scoreNA));
    }
    return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.scoreL)) + '</div>' +
      '<div class="dy-txt">' + body + '</div>' +
      '<button type="button" class="dy-go" data-dy-go="regime">' + esc(tx(T.goRegime)) + '</button></div>';
  }

  function moversHTML(){
    var s = snap; if (!s) return '';
    var rows = [];
    var stocks = s.stocks || {};
    Object.keys(stocks).forEach(function(tk){
      var r = stocks[tk];
      if (!r || r.stale || !isNum(r.chg_pct)) return;
      rows.push({ tk:tk, name:r.name || '', chg:r.chg_pct });
    });
    if (!rows.length) {
      return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.moversL)) + '</div>' +
        '<div class="dy-txt">' + esc(tx(T.noMovers)) + '</div></div>';
    }
    rows.sort(function(a,b){ return b.chg - a.chg; });
    var gainers = rows.slice(0, 3);
    var losers = rows.slice(-3).reverse();
    function rowHTML(r){
      return '<div class="dy-mrow"><span>' + esc(r.tk) + '</span><span class="' +
        (r.chg >= 0 ? 'up' : 'dn') + '">' + sgn(r.chg, 1) + '%</span></div>';
    }
    return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.moversL)) + '</div>' +
      '<div class="dy-movers">' +
        '<div class="dy-mcol"><div class="dy-mh">' + esc(tx(T.gainH)) + '</div>' + gainers.map(rowHTML).join('') + '</div>' +
        '<div class="dy-mcol"><div class="dy-mh">' + esc(tx(T.loseH)) + '</div>' + losers.map(rowHTML).join('') + '</div>' +
      '</div></div>';
  }

  function flowHTML(){
    var s = snap; if (!s) return '';
    var sect = (s.flows && s.flows.sector) || [];
    var rows = sect.filter(function(r){ return r && r.en && isNum(r.m1); });
    if (rows.length < 2) {
      return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.flowL)) + '</div>' +
        '<div class="dy-txt">' + esc(tx(T.flowNA)) + '</div></div>';
    }
    rows.sort(function(a,b){ return b.m1 - a.m1; });
    var top = rows[0], bot = rows[rows.length - 1];
    var txt = tx(T.flowTxt)
      .replace('{a}', esc(tx({en:top.en, th:top.th || top.en})))
      .replace('{av}', sgn(top.m1, 1))
      .replace('{b}', esc(tx({en:bot.en, th:bot.th || bot.en})))
      .replace('{bv}', sgn(bot.m1, 1));
    return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.flowL)) + '</div>' +
      '<div class="dy-txt">' + txt + '</div></div>';
  }

  function anomHTML(){
    var rows = anomalyRows();
    var body;
    if (rows) {
      body = rows.length
        ? tx(T.anomTxt).replace('{n}', String(rows.length))
        : esc(tx(T.anomZero));
    } else {
      body = esc(tx(T.anomNA));
    }
    return '<div class="dy-card"><div class="dy-lab">' + esc(tx(T.anomL)) + '</div>' +
      '<div class="dy-txt">' + body + '</div>' +
      '<button type="button" class="dy-go" data-dy-go="anomaly">' + esc(tx(T.goAnom)) + '</button></div>';
  }

  function bind(body){
    body.querySelectorAll('[data-dy-go]').forEach(function(b){
      b.addEventListener('click', function(){ location.hash = '#/' + b.getAttribute('data-dy-go'); });
    });
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-dy="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(T.eyebrow);
    if (q('h')) q('h').textContent = tx(T.h);
    if (q('lede')) q('lede').textContent = tx(T.lede);
    var body = q('body');
    if (!body) return;
    if (!snap) { body.innerHTML = '<div class="ss-empty">' + esc(tx(T.waiting)) + '</div>'; return; }
    body.innerHTML =
      '<div class="dy-asof">' + esc(tx(T.asof)) + ' ' + esc(fmtTime(snap.generated_at)) + '</div>' +
      headlineHTML() + scoreHTML() + moversHTML() + flowHTML() + anomHTML() +
      '<div class="ss-foot">' + esc(tx(T.foot)) + '</div>';
    bind(body);
  }

  function build(){
    if (document.getElementById('daily')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'daily';
    sec.setAttribute('data-route', 'daily');
    sec.innerHTML =
      '<div class="dy-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-dy="eb"></span></div>' +
          '<h2 data-dy="h"></h2>' +
          '<p class="lede" data-dy="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-dy="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'daily', feat:true, after:'rulelab',
      t:{en:'Daily Summary',th:'สรุปประจำวัน'},
      d:{en:'A plain-language, auto-written readout of the latest snapshot — headline gauges, biggest movers, sector flow and anomaly count. Admin-only.',
         th:'สรุปข้อมูลสแนปช็อตล่าสุดเป็นคำพูดแบบอัตโนมัติ — ตัวชี้วัดเด่น ขยับแรงที่สุด เงินไหลรายกลุ่ม และจำนวนสัญญาณผิดปกติ เฉพาะแอดมิน'}
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

  window.__SPZ_DAILY = { repaint: paint };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1100); });
  } else {
    setTimeout(boot, 1100);
  }
})();
