
  (function(){
    'use strict';
    if (window.__SPZ_SHM) return;
    window.__SPZ_SHM = true;

    function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
    function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
    function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function isNum(v){ return typeof v === 'number' && isFinite(v); }
    function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
    function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
    function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }

    var C = {
      h:{en:'Sector Heatmap',th:'ฮีตแมปเซกเตอร์'},
      lede:{en:'Fund flow across the 12 major sectors, from the same data the flow widgets elsewhere on this site use. Bright green means money has been moving in over the selected window, red means it has been moving out — brightness tracks the size of the move.',
            th:'กระแสเงินใน 12 เซกเตอร์หลัก จากข้อมูลชุดเดียวกับที่วิดเจ็ตกระแสเงินจุดอื่นในเว็บนี้ใช้ สีเขียวสว่าง = เงินไหลเข้าในกรอบเวลาที่เลือก สีแดง = เงินไหลออก ความสว่างสื่อถึงขนาดของการเคลื่อนไหว'},
      waiting:{en:'Waiting for the market snapshot…',th:'รอข้อมูลตลาด…'},
      legend:{en:'Educational snapshot, not investment advice — sector ETFs proxy each group’s fund flow, they are not a signal to trade.',
              th:'ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน — ใช้ ETF ของแต่ละกลุ่มเป็นตัวแทนกระแสเงิน ไม่ใช่สัญญาณให้ซื้อขาย'}
    };

    var TF = [
      { key:'d1', lbl:{en:'1D',th:'1 วัน'} },
      { key:'w1', lbl:{en:'1W',th:'1 สัปดาห์'} },
      { key:'m1', lbl:{en:'1M',th:'1 เดือน'} },
      { key:'ytd', lbl:{en:'YTD',th:'ตั้งแต่ต้นปี'} }
    ];

    var state = { tf:'m1' };
    var root = document.getElementById('sectorHeatmap');

    function sectorRows(){
      var s = snap();
      var rows = (s && s.flows && s.flows.sector) || [];
      return rows.filter(function(r){ return r && isNum(r[state.tf]); });
    }

    function tileHTML(r, maxAbs){
      var v = r[state.tf];
      var up = v >= 0;
      var mag = maxAbs > 0 ? clamp(Math.abs(v) / maxAbs, 0, 1) : 0;
      var rgb = up ? '0,255,102' : '255,59,78';
      var op = (0.10 + mag * 0.34).toFixed(2);
      return '<div class="shm-tile" style="--shm-c:rgb(' + rgb + ');--shm-o:' + op + '">' +
        '<div><div class="nm">' + esc(tx(r)) + '</div><div class="sym">' + esc(r.sym || '') + '</div></div>' +
        '<div class="val ' + (up ? 'up' : 'dn') + '">' + sgn(v, 1) + '%</div>' +
      '</div>';
    }

    function paint(){
      if (!root) return;
      var q = function(k){ return root.querySelector('[data-shm="' + k + '"]'); };
      if (q('h')) q('h').textContent = tx(C.h);
      if (q('lede')) q('lede').textContent = tx(C.lede);
      if (q('legend')) q('legend').textContent = tx(C.legend);

      var tfHost = q('tf');
      if (tfHost && !tfHost.__built) {
        tfHost.innerHTML = TF.map(function(t){
          return '<button type="button" data-tf="' + t.key + '"></button>';
        }).join('');
        tfHost.querySelectorAll('button').forEach(function(b, i){
          b.addEventListener('click', function(){
            state.tf = TF[i].key;
            paint();
          });
        });
        tfHost.__built = true;
      }
      if (tfHost) {
        tfHost.querySelectorAll('button').forEach(function(b, i){
          b.textContent = tx(TF[i].lbl);
          b.className = state.tf === TF[i].key ? 'on' : '';
        });
      }

      var grid = q('grid');
      if (!grid) return;
      var s = snap();
      var rows = sectorRows().slice().sort(function(a,b){ return (b[state.tf]||0) - (a[state.tf]||0); });
      if (!s || !rows.length) { grid.innerHTML = '<div class="shm-empty">' + esc(tx(C.waiting)) + '</div>'; return; }
      var maxAbs = rows.reduce(function(m,r){ return Math.max(m, Math.abs(r[state.tf]||0)); }, 1);
      grid.innerHTML = rows.map(function(r){ return tileHTML(r, maxAbs); }).join('');
    }

    if (root) {
      paint();
      document.addEventListener('spz:snapshot', function(){ paint(); });
      new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    }
  })();
  