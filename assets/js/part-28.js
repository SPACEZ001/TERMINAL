
(function(){
  'use strict';
  if (window.__SPZ_RC) return;
  window.__SPZ_RC = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
  function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }

  var C = {
    h:{en:'Risk-On / Risk-Off Compass',th:'เข็มทิศ Risk-On / Risk-Off'},
    lede:{en:'A needle built from the momentum gap between risk assets (emerging markets, US small caps, US tech, high-yield credit) and safe havens (long Treasuries, gold, the dollar) — pulled back whenever the VIX is rising. Right = money leaning into risk, left = money leaning toward safety. From data already on this page (flows.asset), not a new source.',
          th:'เข็มที่คำนวณจากส่วนต่างโมเมนตัมระหว่างสินทรัพย์เสี่ยง (ตลาดเกิดใหม่ หุ้นเล็กสหรัฐฯ หุ้นเทคสหรัฐฯ High-yield credit) กับสินทรัพย์ปลอดภัย (พันธบัตรยาว ทองคำ ดอลลาร์) แล้วถูกดึงกลับเมื่อ VIX กำลังขึ้น ขวา = เอียงเข้าสินทรัพย์เสี่ยง ซ้าย = เอียงเข้าสินทรัพย์ปลอดภัย ใช้ข้อมูลชุดเดียวกับที่มีอยู่แล้วในหน้านี้ (flows.asset) ไม่ได้ดึงจากแหล่งใหม่'},
    riskH:{en:'Risk basket',th:'ตะกร้าสินทรัพย์เสี่ยง'},
    safeH:{en:'Safe-haven basket',th:'ตะกร้าสินทรัพย์ปลอดภัย'},
    on:{en:'Leaning Risk-On',th:'เอียงไปทาง Risk-On'},
    off:{en:'Leaning Risk-Off',th:'เอียงไปทาง Risk-Off'},
    mid:{en:'Roughly neutral',th:'ค่อนข้างเป็นกลาง'},
    waiting:{en:'Waiting for the market snapshot…',th:'รอข้อมูลตลาด…'},
    legend:{en:'A teaching gauge, not a trading signal — it reads today’s relative momentum across a handful of ETFs, nothing more. VIX contributes at half weight since it typically swings several times larger than the other legs.',
            th:'มาตรวัดเพื่อการศึกษา ไม่ใช่สัญญาณเทรด — อ่านแค่โมเมนตัมเชิงเปรียบเทียบของ ETF กลุ่มเล็กๆ ในวันนี้เท่านั้น VIX ถูกให้น้ำหนักครึ่งหนึ่งเพราะปกติแล้วแกว่งแรงกว่าตัวอื่นหลายเท่า'},
    explainSum:{en:'What is this, and how do I read it?',th:'นี่คืออะไร และดูยังไง?'},
    explainBody:{en:'The needle swings between two poles. Push it right and the market is favoring risk assets over safe havens — money is comfortable taking chances. Push it left and the market is rotating toward safety — money is playing defense. Try the two examples below to see what each extreme looks like.',
                 th:'เข็มแกว่งอยู่ระหว่างสองขั้ว ถ้าเข็มเอียงขวา แปลว่าตลาดกำลังให้น้ำหนักกับสินทรัพย์เสี่ยงมากกว่าสินทรัพย์ปลอดภัย — เงินกล้าเสี่ยง ถ้าเข็มเอียงซ้าย แปลว่าตลาดกำลังหมุนเข้าหาความปลอดภัย — เงินตั้งรับ ลองกดดูตัวอย่างสองแบบด้านล่างเพื่อดูว่าแต่ละสุดขั้วหน้าตาเป็นยังไง'},
    exOffLbl:{en:'See a Risk-Off example',th:'ดูตัวอย่าง Risk-Off'},
    exOnLbl:{en:'See a Risk-On example',th:'ดูตัวอย่าง Risk-On'},
    exOffDemo:{en:'Needle pinned left: safe havens (gold, long Treasuries, the dollar) are outrunning risk assets, often alongside a rising VIX. This is the market bracing for bad news.',
               th:'เข็มชิดซ้ายสุด: สินทรัพย์ปลอดภัย (ทองคำ พันธบัตรยาว ดอลลาร์) วิ่งนำสินทรัพย์เสี่ยง มักมาพร้อม VIX ที่กำลังขึ้น เป็นสัญญาณว่าตลาดกำลังตั้งรับข่าวร้าย'},
    exOnDemo:{en:'Needle pinned right: risk assets (emerging markets, small caps, tech, high-yield credit) are outrunning safe havens, with a calm VIX. This is the market leaning into growth and confidence.',
              th:'เข็มชิดขวาสุด: สินทรัพย์เสี่ยง (ตลาดเกิดใหม่ หุ้นเล็ก หุ้นเทค High-yield credit) วิ่งนำสินทรัพย์ปลอดภัย พร้อม VIX ที่นิ่งสงบ เป็นสัญญาณว่าตลาดกำลังเอียงเข้าหาการเติบโตและความมั่นใจ'}
  };

  var TF = [
    { key:'d1', lbl:{en:'1D',th:'1 วัน'}, clamp:6 },
    { key:'w1', lbl:{en:'1W',th:'1 สัปดาห์'}, clamp:8 },
    { key:'m1', lbl:{en:'1M',th:'1 เดือน'}, clamp:10 },
    { key:'ytd', lbl:{en:'YTD',th:'ตั้งแต่ต้นปี'}, clamp:20 }
  ];

  var RISK_KEYS = ['US tech / Nasdaq', 'Emerging markets', 'US small cap', 'High-yield credit'];
  var SAFE_KEYS = ['Long Treasuries', 'Gold', 'US dollar'];
  var VIX_KEY = 'Volatility (VIX)';

  var state = { tf:'m1' };

  function assetRows(){
    var s = snap();
    return (s && s.flows && s.flows.asset) || [];
  }
  function findRow(list, en){
    for (var i = 0; i < list.length; i++) { if (list[i].en === en) return list[i]; }
    return null;
  }
  function tfDef(){
    for (var i = 0; i < TF.length; i++) { if (TF[i].key === state.tf) return TF[i]; }
    return TF[2];
  }

  function compute(){
    var list = assetRows();
    if (!list.length) return null;
    var tf = state.tf;
    function rowsFor(keys){
      return keys.map(function(k){ return findRow(list, k); }).filter(function(r){ return r && isNum(r[tf]); });
    }
    var riskRows = rowsFor(RISK_KEYS), safeRows = rowsFor(SAFE_KEYS);
    if (!riskRows.length || !safeRows.length) return null;
    function avg(rows){ return rows.reduce(function(a, r){ return a + r[tf]; }, 0) / rows.length; }
    var riskAvg = avg(riskRows), safeAvg = avg(safeRows);
    var vixRow = findRow(list, VIX_KEY);
    var vixV = (vixRow && isNum(vixRow[tf])) ? vixRow[tf] : 0;
    var tilt = riskAvg - safeAvg - vixV * 0.5;
    return { tilt:tilt, riskRows:riskRows, safeRows:safeRows, vixRow:vixRow };
  }

  function gaugeSVG(){
    function pol(r, deg){
      var rad = (deg - 90) * Math.PI / 180;
      return [150 + r * Math.cos(rad), 148 + r * Math.sin(rad)];
    }
    function arcPath(r, a0, a1){
      var p0 = pol(r, a0), p1 = pol(r, a1);
      var large = (a1 - a0) > 180 ? 1 : 0;
      return 'M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) +
             ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1);
    }
    var fullArc = arcPath(118, -90, 90);
    var s = '<svg class="rc-gauge" viewBox="0 0 300 168" aria-hidden="true">';
    s += '<defs><linearGradient id="rcNebula" gradientUnits="userSpaceOnUse" x1="32" y1="148" x2="268" y2="148">' +
      '<stop offset="0%" stop-color="#0a84ff"/>' +
      '<stop offset="35%" stop-color="#5e5ce6"/>' +
      '<stop offset="65%" stop-color="#bf5af2"/>' +
      '<stop offset="100%" stop-color="#ff375f"/>' +
    '</linearGradient></defs>';
    s += '<path d="' + fullArc + '" fill="none" stroke="url(#rcNebula)" stroke-width="16" stroke-linecap="round" opacity=".85"/>';
    s += '<g class="rc-needle" data-rc="needle">' +
           '<line x1="150" y1="148" x2="150" y2="42" stroke="var(--white)" stroke-width="3" stroke-linecap="round"/>' +
           '<circle cx="150" cy="148" r="7" fill="var(--white)"/>' +
         '</g>';
    s += '<circle r="4" fill="#fff" class="rc-gauge-scan"><animateMotion dur="5s" repeatCount="indefinite" path="' + fullArc + '"/></circle>';
    s += '</svg>';
    return s;
  }

  function rowsHTML(rows, tf, cls){
    var max = rows.reduce(function(m, r){ return Math.max(m, Math.abs(r[tf] || 0)); }, 1);
    return rows.map(function(r){
      var v = r[tf] || 0, up = v >= 0;
      var w = clamp(Math.abs(v) / max * 50, 2, 50);
      return '<div class="rc-row"><span class="rc-row-l">' + esc(tx(r)) + '</span>' +
        '<span class="rc-row-bar"><i class="' + (up ? 'pos' : 'neg') + '" style="width:' + w.toFixed(0) + '%"></i></span>' +
        '<span class="rc-row-v">' + sgn(v, 1) + '%</span></div>';
    }).join('');
  }

  var root = null;

  function paint(){
    if (!root) return;
    var q = function(k){ return root.querySelector('[data-rc="' + k + '"]'); };
    if (q('h')) q('h').textContent = tx(C.h);
    if (q('lede')) q('lede').textContent = tx(C.lede);
    if (q('legend')) q('legend').textContent = tx(C.legend);
    if (q('riskH')) q('riskH').textContent = tx(C.riskH);
    if (q('safeH')) q('safeH').textContent = tx(C.safeH);
    if (q('explainSum')) q('explainSum').textContent = tx(C.explainSum);
    if (q('explainBody')) q('explainBody').textContent = tx(C.explainBody);
    if (q('exOffLbl')) q('exOffLbl').textContent = tx(C.exOffLbl);
    if (q('exOnLbl')) q('exOnLbl').textContent = tx(C.exOnLbl);

    var exDemo = q('exDemo');
    if (exDemo && !exDemo.__built) {
      var exBtns = root.querySelectorAll('.rc-ex-btn');
      for (var xi = 0; xi < exBtns.length; xi++) {
        exBtns[xi].addEventListener('click', function(){
          var which = this.getAttribute('data-ex');
          root.querySelectorAll('.rc-ex-btn').forEach(function(b){ b.classList.toggle('on-active', b === this); }, this);
          exDemo.innerHTML = '<div class="rc-ex-demo-card ' + which + '">' +
            esc(tx(which === 'off' ? C.exOffDemo : C.exOnDemo)) + '</div>';
        });
      }
      exDemo.__built = true;
    }

    var tfHost = q('tf');
    if (tfHost && !tfHost.__built) {
      tfHost.innerHTML = TF.map(function(t){ return '<button type="button" data-tf="' + t.key + '"></button>'; }).join('');
      tfHost.querySelectorAll('button').forEach(function(b, i){
        b.addEventListener('click', function(){ state.tf = TF[i].key; paint(); });
      });
      tfHost.__built = true;
    }
    if (tfHost) {
      tfHost.querySelectorAll('button').forEach(function(b, i){
        b.textContent = tx(TF[i].lbl);
        b.className = state.tf === TF[i].key ? 'on' : '';
      });
    }

    var body = q('body');
    var data = compute();
    if (!body) return;
    if (!data) { body.innerHTML = '<div class="rc-empty">' + esc(tx(C.waiting)) + '</div>'; return; }

    if (!body.__built) {
      body.innerHTML =
        '<div class="rc-gaugebox">' + gaugeSVG() +
          '<div class="rc-tilt" data-rc="tilt"></div>' +
          '<div class="rc-verdict" data-rc="verdict"></div></div>' +
        '<div class="rc-cols">' +
          '<div><div class="rc-col-h" data-rc="riskH"></div><div data-rc="riskRows"></div></div>' +
          '<div><div class="rc-col-h" data-rc="safeH"></div><div data-rc="safeRows"></div></div>' +
        '</div>';
      body.__built = true;
    }

    var tf = state.tf, clampRange = tfDef().clamp;
    var angle = clamp(data.tilt / clampRange * 90, -90, 90);
    var needle = root.querySelector('[data-rc="needle"]');
    if (needle) needle.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)';

    var tiltEl = q('tilt');
    if (tiltEl) {
      tiltEl.textContent = sgn(data.tilt, 1);
      tiltEl.className = 'rc-tilt ' + (data.tilt >= 1.5 ? 'on' : data.tilt <= -1.5 ? 'off' : 'mid');
    }
    var verdictEl = q('verdict');
    if (verdictEl) verdictEl.textContent = tx(data.tilt >= 1.5 ? C.on : data.tilt <= -1.5 ? C.off : C.mid);

    var riskRowsEl = q('riskRows'); if (riskRowsEl) riskRowsEl.innerHTML = rowsHTML(data.riskRows, tf);
    var safeRowsEl = q('safeRows'); if (safeRowsEl) safeRowsEl.innerHTML = rowsHTML(data.safeRows, tf);
  }

  function mount(sec){
    if (document.getElementById('spzRiskCompass')) { root = document.getElementById('spzRiskCompass'); return true; }
    root = document.createElement('div');
    root.id = 'spzRiskCompass';
    root.className = 'rc-wrap';
    root.innerHTML =
      '<div class="rc-h" data-rc="h"></div>' +
      '<p class="rc-p" data-rc="lede"></p>' +
      '<div class="rc-tf" data-rc="tf"></div>' +
      '<div class="rc-body" data-rc="body"></div>' +
      '<p class="rc-legend" data-rc="legend"></p>' +
      '<details class="rc-explain" open>' +
        '<summary data-rc="explainSum"></summary>' +
        '<div class="rc-explain-body">' +
          '<p data-rc="explainBody"></p>' +
          '<div class="rc-ex-row">' +
            '<button type="button" class="rc-ex-btn off" data-ex="off"><span data-rc="exOffLbl"></span></button>' +
            '<button type="button" class="rc-ex-btn on" data-ex="on"><span data-rc="exOnLbl"></span></button>' +
          '</div>' +
          '<div class="rc-ex-demo" data-rc="exDemo"></div>' +
        '</div>' +
      '</details>';
    var anchor = sec.querySelector('[data-f="lead"]');
    if (anchor) sec.insertBefore(root, anchor); else sec.appendChild(root);
    return true;
  }

  function tryMount(){
    var sec = document.getElementById('flow');
    if (!sec) return false;
    mount(sec);
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (tryMount() || ++tries > 60) clearInterval(iv);
    }, 400);
    document.addEventListener('spz:snapshot', function(){ if (root) paint(); });
    new MutationObserver(function(){ if (root) paint(); })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 950); });
  else setTimeout(boot, 950);
})();
