
  (function(){
    'use strict';
    if (window.__SPZ_ESSGUIDE) return;
    window.__SPZ_ESSGUIDE = true;

    function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
    function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
    function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }

    var C = {
      h:{en:'How To Read The Screener',th:'วิธีอ่านตัวคัดกรองด้านล่าง'},
      lede:{en:'Every card in the Early Signal Screener below is built the same way. Watch the highlighted example cycle through each part, then try the sliders yourself to see how the three scores combine into one.',
            th:'การ์ดแต่ละใบใน Early Signal Screener ด้านล่างมีโครงสร้างเดียวกันหมด ดูตัวอย่างที่ไล่ไฮไลต์ทีละส่วนด้านล่างนี้ก่อน แล้วลองเลื่อนแถบปรับค่าเองเพื่อดูว่า 3 คะแนนรวมกันเป็นคะแนนเดียวได้ยังไง'},
      legTech:{en:'Technical room',th:'พื้นที่ทางเทคนิค'},
      legVal:{en:'Cheap vs peers',th:'ถูกกว่าเพื่อน'},
      legFlow:{en:'Sector catch-up',th:'ตามกระแสกลุ่ม'},
      sampleWhy:{en:'18.4% off its 12-month high · RSI at 52 · cheaper than 70% of its sector peers · money has rotated into Technology +2.1% while this stock moved +0.3%',
                 th:'ห่างจากจุดสูงสุดรอบปี 18.4% · RSI อยู่ที่ 52 · ถูกกว่าเพื่อนในกลุ่มเดียวกัน 70% · เงินหมุนเข้ากลุ่ม Technology +2.1% ขณะที่หุ้นตัวนี้ขยับแค่ +0.3%'},
      tryH:{en:'Try it: drag the three bars',th:'ลองเล่น: ลากแถบทั้ง 3 ดู'},
      tryLede:{en:'These three sliders are stand-ins for a real stock’s three leg scores. The composite below is always their average — drag any of them and watch it update live.',
               th:'แถบเลื่อนทั้ง 3 นี้แทนคะแนนของหุ้นสมมติทั้ง 3 ด้าน คะแนนรวมด้านล่างคือค่าเฉลี่ยของทั้ง 3 เสมอ — ลองลากแถบไหนก็ได้แล้วดูคะแนนเปลี่ยนสด ๆ'},
      needMin:{en:'The real screener only lists stocks scoring 55 or higher — below that, a stock simply would not appear in the Top 8.',
               th:'ตัวคัดกรองจริงจะแสดงเฉพาะหุ้นที่ได้ 55 คะแนนขึ้นไป — ต่ำกว่านั้นหุ้นตัวนั้นจะไม่ติด Top 8 เลย'},
      wouldShow:{en:'This score would make the Top 8 list.',th:'คะแนนนี้จะติด Top 8 ในลิสต์จริง'}
    };

    var PARTS = [
      { sel:'[data-esg-part="id"]',
        text:{en:'Rank, ticker, company name and sector — which stock this is, and which industry group it belongs to.',
              th:'อันดับ ชื่อย่อหุ้น ชื่อบริษัท และกลุ่มอุตสาหกรรม — บอกว่าเป็นหุ้นตัวไหน อยู่กลุ่มไหน'} },
      { sel:'[data-esg-part="score"]',
        text:{en:'The composite score out of 100 — the average of the three bars below. 70+ shows green, 55–69 shows amber; below 55 would not make the list at all.',
              th:'คะแนนรวมเต็ม 100 — เฉลี่ยจาก 3 แถบด้านล่าง ตั้งแต่ 70 ขึ้นไปเป็นสีเขียว 55-69 เป็นสีเหลือง ต่ำกว่า 55 จะไม่ติดลิสต์เลย'} },
      { sel:'[data-esg-part="legs"]',
        text:{en:'The three ingredients that get averaged: room left technically, how cheap it is against sector peers, and whether its sector’s money flow is outrunning the stock itself.',
              th:'องค์ประกอบ 3 อย่างที่ถูกนำมาเฉลี่ยกัน: พื้นที่ทางเทคนิคที่ยังไปได้ ความถูกเทียบเพื่อนในกลุ่ม และเงินในกลุ่มอุตสาหกรรมวิ่งนำหน้าตัวหุ้นเองหรือยัง'} },
      { sel:'[data-esg-part="why"]',
        text:{en:'The plain-language reason, written out with the actual numbers behind the three bars above.',
              th:'เหตุผลแบบภาษาคน เขียนด้วยตัวเลขจริงที่อยู่เบื้องหลัง 3 แถบด้านบน'} }
    ];

    var root = document.getElementById('essGuide');
    var cycleIdx = 0, cycleTimer = null;

    function paintStatic(){
      if (!root) return;
      var q = function(k){ return root.querySelector('[data-esg="' + k + '"]'); };
      if (q('h')) q('h').textContent = tx(C.h);
      if (q('lede')) q('lede').textContent = tx(C.lede);
      ['legTech','legVal','legFlow','legTech2','legVal2','legFlow2','legTech3','legVal3','legFlow3'].forEach(function(k){
        var base = k.replace(/[0-9]$/, '');
        var el = q(k);
        if (el) el.textContent = tx(C[base]);
      });
      if (q('sampleWhy')) q('sampleWhy').textContent = tx(C.sampleWhy);
      if (q('tryH')) q('tryH').textContent = tx(C.tryH);
      if (q('tryLede')) q('tryLede').textContent = tx(C.tryLede);
      renderTry();
      highlight(cycleIdx);
    }

    function highlight(i){
      var card = root.querySelector('[data-esg-card]');
      if (!card) return;
      PARTS.forEach(function(p){
        var el = card.querySelector(p.sel);
        if (el) el.classList.remove('esg-spot');
      });
      var cur = card.querySelector(PARTS[i].sel);
      if (cur) cur.classList.add('esg-spot');
      var cb = root.querySelector('[data-esg="callout"]');
      if (cb) cb.textContent = tx(PARTS[i].text);
      var dots = root.querySelector('[data-esg="dots"]');
      if (dots) {
        if (!dots.__built) {
          dots.innerHTML = PARTS.map(function(){ return '<span></span>'; }).join('');
          dots.__built = true;
        }
        var spans = dots.querySelectorAll('span');
        spans.forEach(function(s, si){ s.classList.toggle('on', si === i); });
      }
    }

    function startCycle(){
      stopCycle();
      highlight(cycleIdx);
      cycleTimer = setInterval(function(){
        cycleIdx = (cycleIdx + 1) % PARTS.length;
        highlight(cycleIdx);
      }, 3200);
    }
    function stopCycle(){ if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } }

    function renderTry(){
      var sliders = root.querySelectorAll('[data-esg-slider]');
      var vals = [0,0,0];
      sliders.forEach(function(s){ vals[+s.getAttribute('data-esg-slider')] = +s.value; });
      var composite = (vals[0] + vals[1] + vals[2]) / 3;
      [0,1,2].forEach(function(i){
        var lbl = root.querySelector('[data-esg="tv' + i + '"]');
        if (lbl) lbl.textContent = vals[i];
        var n = root.querySelector('[data-esg="tn' + i + '"]');
        if (n) n.textContent = vals[i];
        var b = root.querySelector('[data-esg="tb' + i + '"]');
        if (b) b.style.width = vals[i] + '%';
      });
      var scoreEl = root.querySelector('[data-esg="tryScore"]');
      if (scoreEl) {
        scoreEl.innerHTML = Math.round(composite) + '<small>/100</small>';
        scoreEl.className = 'esg-sc ' + (composite >= 70 ? 'hi' : composite >= 55 ? 'mid' : 'lo');
      }
      var note = root.querySelector('[data-esg="tryNote"]');
      if (note) note.textContent = composite >= 55 ? tx(C.wouldShow) : tx(C.needMin);
    }

    if (root) {
      paintStatic();
      startCycle();
      root.querySelectorAll('[data-esg-slider]').forEach(function(s){
        s.addEventListener('input', renderTry);
      });
      var card = root.querySelector('[data-esg-card]');
      if (card) {
        card.addEventListener('mouseenter', stopCycle);
        card.addEventListener('mouseleave', startCycle);
      }
      new MutationObserver(paintStatic).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    }
  })();
  