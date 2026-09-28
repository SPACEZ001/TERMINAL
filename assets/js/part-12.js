
/* ============================================================================
   SPACEZ TERMINAL — animated glossary metric infographics
   Self-contained: own rAF scheduler, own IntersectionObserver viewport gate,
   only paints while the parent <details> is open. Honours prefers-reduced-motion
   by settling each visual to a readable static frame instead of animating.
   ============================================================================ */
(function(){
  'use strict';

  var nodes = document.querySelectorAll('.term-viz[data-viz]');
  if(!nodes.length) return;

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS = 'http://www.w3.org/2000/svg';

  function L(en, th){ return document.documentElement.lang === 'th' ? th : en; }
  function q(root, name){ return root.querySelector('[data-el="' + name + '"]'); }
  function ease(cur, tgt, dt, k){ return cur + (tgt - cur) * (1 - Math.exp(-(k || 5) * dt)); }
  function clamp(v, a, b){ return Math.min(b, Math.max(a, v)); }
  function mk(tag, attrs){
    var e = document.createElementNS(NS, tag);
    for(var k in attrs){ if(Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]); }
    return e;
  }
  /* pick the preset whose key value is closest to the currently animated value,
     so the caption never says "burning cash" while the number still reads +25 */
  function pick(set, val, key, log){
    var best = 0, bd = Infinity;
    for(var i = 0; i < set.length; i++){
      var a = set[i][key], b = val;
      if(log){ a = Math.log(Math.max(1e-6, a)); b = Math.log(Math.max(1e-6, b)); }
      var d = Math.abs(a - b);
      if(d < bd){ bd = d; best = i; }
    }
    return set[best];
  }

  function money(n){
    if(n >= 1000) return '$' + (n / 1000).toFixed(2) + 'T';
    if(n >= 1)    return '$' + n.toFixed(n < 10 ? 2 : 0) + 'B';
    return '$' + Math.round(n * 1000) + 'M';
  }

  var B = {};

  /* ---------------- 01 · P/E — cheap vs expensive scale ---------------- */
  B.pe = function(r){
    var mark = q(r,'mark'), lbl = q(r,'lbl'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:8.4,  cls:'good', en:'VALUE ZONE',    th:'โซนหุ้นถูก',
        sen:'Cheap — or the market expects no growth.', sth:'ถูก — หรือตลาดไม่ได้คาดหวังการเติบโตเลย' },
      { v:18.6, cls:'',     en:'MARKET AVERAGE', th:'ค่าเฉลี่ยตลาด',
        sen:'Roughly where the whole index trades.', sth:'ประมาณระดับที่ทั้งดัชนีซื้อขายกันอยู่' },
      { v:34.0, cls:'warn', en:'GROWTH PRICING', th:'ราคาแบบหุ้นเติบโต',
        sen:'You are paying up front for future profit.', sth:'คุณกำลังจ่ายล่วงหน้าให้กำไรในอนาคต' },
      { v:63.0, cls:'bad',  en:'PRICED FOR PERFECTION', th:'แพงจนไม่มีที่ให้พลาด',
        sen:'One weak quarter and it re-rates hard.', sth:'ไตรมาสเดียวที่แย่ ราคาก็ถูกปรับลงแรง' }
    ];
    function xOf(v){
      var t = (Math.log(clamp(v,4,78)) - Math.log(4)) / (Math.log(78) - Math.log(4));
      return 12 + t * 276;
    }
    var i = 0, cur = SET[0].v, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.4){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.6);
      },
      paint:function(){
        var s = pick(SET, cur, 'v', true), x = xOf(cur);
        mark.setAttribute('transform','translate(' + x.toFixed(1) + ',0)');
        lbl.setAttribute('x', clamp(x, 30, 270).toFixed(1));
        lbl.textContent = 'P/E ' + cur.toFixed(1);
        num.textContent = cur.toFixed(1) + '×';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('P/E scale · cheap → expensive','สเกล P/E · ถูก → แพง');
      }
    };
  };

  /* ---------------- 02 · EPS — one profit pool split across shares ---------------- */
  B.eps = function(r){
    var dots = q(r,'dots'), flow = q(r,'flow'), pl = q(r,'pl'), capt = q(r,'cap2'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var COLS = 12, ROWS = 3, cells = [];
    for(var row = 0; row < ROWS; row++){
      for(var col = 0; col < COLS; col++){
        var c = mk('rect',{ x:(14 + col*23).toFixed(1), y:(48 + row*13).toFixed(1),
                            width:16, height:9, rx:2, fill:'rgba(255,255,255,.07)' });
        dots.appendChild(c); cells.push(c);
      }
    }
    var head = 0, epsShown = 0, EPS = 6.00;
    return {
      step:function(dt){ head += dt * 11; if(head > cells.length + 14) head = 0;
                         epsShown = ease(epsShown, EPS, dt, 1.9); },
      paint:function(){
        for(var k = 0; k < cells.length; k++){
          var d = head - k, on = d >= 0 && d < 14 ? 1 - d / 14 : 0;
          cells[k].setAttribute('fill','rgba(204,255,0,' + (0.07 + on * 0.72).toFixed(3) + ')');
        }
        flow.setAttribute('opacity', (0.35 + 0.4 * Math.abs(Math.sin(head * 0.35))).toFixed(2));
        pl.textContent = L('NET PROFIT  900M','กำไรสุทธิ  900 ล้าน');
        capt.textContent = L('÷ 150M shares outstanding','÷ หุ้นทั้งหมด 150 ล้านหุ้น');
        num.textContent = epsShown.toFixed(2);
        num.className = 'tv-num';
        tag.textContent = L('PROFIT PER SHARE','กำไรต่อ 1 หุ้น');
        sub.textContent = L('Every share in your account owns this slice.','หุ้นทุกหุ้นในพอร์ตคุณเป็นเจ้าของส่วนนี้');
        cap.textContent = L('One profit pool ÷ every share','กำไรก้อนเดียว ÷ หุ้นทุกหุ้น');
      }
    };
  };

  /* ---------------- 03 · VOL — streaming volume histogram ---------------- */
  B.vol = function(r){
    var bars = q(r,'bars'), avgLn = q(r,'avg'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var N = 24, W = 9, GAP = 2.5, BASE = 74, MAXH = 60, vals = [], rects = [], i;
    function nextV(){
      var v = 0.28 + Math.random() * 0.34;
      if(Math.random() < 0.14) v += 0.35 + Math.random() * 0.32;
      return Math.min(1, v);
    }
    for(i = 0; i < N; i++){
      vals.push(nextV());
      var rc = mk('rect',{ x:(12 + i*(W+GAP)).toFixed(1), y:BASE, width:W, height:0, rx:1.5,
                           fill:'rgba(255,255,255,.16)' });
      bars.appendChild(rc); rects.push(rc);
    }
    var acc = 0, rel = 1;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 0.42){ acc = 0; vals.shift(); vals.push(nextV()); }
      },
      paint:function(dt){
        var sum = 0, k;
        for(k = 0; k < vals.length; k++) sum += vals[k];
        var avg = sum / vals.length;
        for(k = 0; k < rects.length; k++){
          var h = vals[k] * MAXH, hot = vals[k] > avg * 1.5;
          rects[k].setAttribute('y',(BASE - h).toFixed(1));
          rects[k].setAttribute('height', h.toFixed(1));
          rects[k].setAttribute('fill', hot ? 'rgba(204,255,0,.85)' : 'rgba(255,255,255,.17)');
        }
        var ay = BASE - avg * MAXH;
        avgLn.setAttribute('d','M12,' + ay.toFixed(1) + ' L288,' + ay.toFixed(1));
        rel = ease(rel, vals[vals.length-1] / avg, dt || 0.03, 4);
        num.textContent = rel.toFixed(2) + '×';
        num.className = 'tv-num ' + (rel > 1.5 ? '' : rel < 0.75 ? 'bad' : 'warn');
        tag.textContent = rel > 1.5 ? L('CONVICTION','มีแรงซื้อขายจริง')
                        : rel < 0.75 ? L('THIN TAPE','กระดานบาง')
                                     : L('NORMAL FLOW','ปกติ');
        sub.textContent = L('Dashed line = 20-day average volume.','เส้นประ = ค่าเฉลี่ยวอลุ่ม 20 วัน');
        cap.textContent = L('Relative volume · live tape','วอลุ่มเทียบค่าเฉลี่ย · กระดานสด');
      }
    };
  };

  /* ---------------- 04 · MCAP — company size bubble ---------------- */
  B.mcap = function(r){
    var bub = q(r,'bub'), t1 = q(r,'t1'), t2 = q(r,'t2'), t3 = q(r,'t3'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { x:46,  rad:11, v:0.9,  cls:'bad',  en:'SMALL CAP', th:'หุ้นเล็ก',
        sen:'Moves violently — both directions.', sth:'เหวี่ยงแรง ทั้งขาขึ้นและขาลง' },
      { x:150, rad:22, v:6.4,  cls:'warn', en:'MID CAP', th:'หุ้นกลาง',
        sen:'Room to grow, still able to fall hard.', sth:'ยังมีที่ให้โต แต่ก็ยังร่วงแรงได้' },
      { x:252, rad:34, v:2400, cls:'good', en:'LARGE CAP', th:'หุ้นใหญ่',
        sen:'Slow, liquid, survives recessions.', sth:'ช้า สภาพคล่องสูง รอดช่วงเศรษฐกิจถดถอย' }
    ];
    var i = 0, cx = SET[0].x, rr = SET[0].rad, val = SET[0].v, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.0){ acc = 0; i = (i + 1) % SET.length; }
        cx = ease(cx, SET[i].x, dt, 2.4);
        rr = ease(rr, SET[i].rad, dt, 2.4);
        val = ease(val, SET[i].v, dt, 2.4);
      },
      paint:function(dt, t){
        var pulse = 1 + 0.05 * Math.sin((t || 0) * 3.2);
        bub.setAttribute('cx', cx.toFixed(1));
        bub.setAttribute('r', (rr * pulse).toFixed(1));
        t1.textContent = L('SMALL','เล็ก'); t2.textContent = L('MID','กลาง'); t3.textContent = L('LARGE','ใหญ่');
        var s = pick(SET, val, 'v', true);
        num.textContent = money(val);
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Price × shares = whole company','ราคา × จำนวนหุ้น = ทั้งบริษัท');
      }
    };
  };

  /* ---------------- 05 · DIV YLD — dividend cash dripping in ---------------- */
  B.divyld = function(r){
    var coins = q(r,'coins'), fill = q(r,'fill'), srcT = q(r,'src'), jarT = q(r,'jar'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var POOL = 5, list = [], k;
    for(k = 0; k < POOL; k++){
      var c = mk('circle',{ cx:108, cy:34, r:6.5, fill:'rgba(204,255,0,.35)',
                            stroke:'#ccff00', 'stroke-width':1.4, opacity:0 });
      coins.appendChild(c); list.push({ el:c, t:-k * 0.55 - 0.2 });
    }
    var collected = 0, phase = 0, YLD = 4.2;
    return {
      step:function(dt){
        for(var j = 0; j < list.length; j++){
          var o = list[j];
          o.t += dt * 0.62;
          if(o.t > 1.25){ o.t -= POOL * 0.55 + 0.25; }
        }
        phase += dt;
        if(phase > 6.4) phase = 0;
        collected = phase < 5 ? (phase / 5) * 4.2 : 4.2;
      },
      paint:function(){
        for(var j = 0; j < list.length; j++){
          var o = list[j], p = o.t;
          if(p < 0 || p > 1){ o.el.setAttribute('opacity', 0); continue; }
          var e = p * p;
          o.el.setAttribute('cx', (108 + (222 - 108) * p).toFixed(1));
          o.el.setAttribute('cy', (34 + 44 * e).toFixed(1));
          o.el.setAttribute('opacity', (p < 0.12 ? p / 0.12 : p > 0.9 ? (1 - p) / 0.1 : 1).toFixed(2));
        }
        var lvl = clamp(collected / 4.2, 0, 1) * 40;
        fill.setAttribute('y', (86 - lvl).toFixed(1));
        fill.setAttribute('height', lvl.toFixed(1));
        srcT.textContent = L('QUARTERLY PAYOUT','ปันผลรายไตรมาส');
        jarT.textContent = L('YOUR CASH','เงินสดของคุณ');
        num.textContent = YLD.toFixed(2) + '%';
        num.className = 'tv-num';
        tag.textContent = L('CASH YIELD / YEAR','ผลตอบแทนเงินสด / ปี');
        sub.textContent = L('Paid whether the price rises or falls.','ได้รับไม่ว่าราคาหุ้นจะขึ้นหรือลง');
        cap.textContent = L('Dividend ÷ price you paid','เงินปันผล ÷ ราคาที่คุณจ่าย');
      }
    };
  };

  /* ---------------- 06 · ROE — efficiency gauge ---------------- */
  B.roe = function(r){
    var arc = q(r,'arc'), pct = q(r,'pct'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var C = 2 * Math.PI * 40;
    var SET = [
      { v:6,  cls:'bad',  en:'WEAK ENGINE', th:'เครื่องยนต์อ่อนแรง',
        sen:'Capital in, very little profit out.', sth:'ใส่ทุนเข้าไป แต่ได้กำไรออกมานิดเดียว' },
      { v:15, cls:'warn', en:'SOLID', th:'ใช้ได้',
        sen:'Around the long-run market average.', sth:'ประมาณค่าเฉลี่ยตลาดระยะยาว' },
      { v:27, cls:'good', en:'HIGH QUALITY', th:'คุณภาพสูง',
        sen:'Usually a sign of a real moat — check debt.', sth:'มักแปลว่ามีความได้เปรียบจริง — แต่ต้องเช็คหนี้ด้วย' }
    ];
    var i = 0, cur = 2, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.1){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.3);
      },
      paint:function(){
        var f = clamp(cur / 40, 0, 1);
        arc.setAttribute('stroke-dasharray', C.toFixed(1));
        arc.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(1));
        arc.setAttribute('stroke', cur >= 20 ? '#00ff66' : cur >= 11 ? '#ccff00' : '#ff3b4e');
        var s = pick(SET, cur, 'v');
        pct.textContent = cur.toFixed(0) + '%';
        num.textContent = cur.toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Profit made per ฿1 of owners\u2019 capital','กำไรที่ทำได้ต่อทุนเจ้าของ 1 บาท');
      }
    };
  };

  /* ---------------- 07 · P/B — price vs book value ---------------- */
  B.pb = function(r){
    var b1 = q(r,'b1'), b2 = q(r,'b2'), l1 = q(r,'l1'), l2 = q(r,'l2'), who = q(r,'who'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:0.8, cls:'good', en:'BELOW BOOK', th:'ต่ำกว่ามูลค่าทางบัญชี', wen:'TYPICAL BANK', wth:'แบบธนาคารทั่วไป',
        sen:'Bargain — or the assets are worth less than stated.', sth:'ของถูก — หรือสินทรัพย์ไม่ได้มีค่าอย่างที่บัญชีบอก' },
      { v:2.1, cls:'',     en:'FAIR RANGE', th:'ช่วงราคาสมเหตุผล', wen:'INDUSTRIAL', wth:'แบบกลุ่มอุตสาหกรรม',
        sen:'Paying a modest premium over net assets.', sth:'จ่ายพรีเมียมเหนือสินทรัพย์สุทธิพอประมาณ' },
      { v:6.5, cls:'warn', en:'ASSET-LIGHT', th:'ธุรกิจสินทรัพย์เบา', wen:'SOFTWARE', wth:'แบบบริษัทซอฟต์แวร์',
        sen:'Real value is people and code, not machinery.', sth:'มูลค่าจริงอยู่ที่คนและโค้ด ไม่ใช่เครื่องจักร' }
    ];
    var i = 0, cur = 0.8, acc = 0, BOOKW = 42;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        b1.setAttribute('width', clamp(BOOKW * cur, 4, 276).toFixed(1));
        b2.setAttribute('width', BOOKW);
        l1.textContent = L('MARKET PRICE','ราคาตลาด');
        l2.textContent = L('BOOK VALUE (=1.0×)','มูลค่าทางบัญชี (=1.0×)');
        var s = pick(SET, cur, 'v', true);
        who.textContent = L(s.wen, s.wth);
        num.textContent = cur.toFixed(2) + '×';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('What you pay vs what is on the books','สิ่งที่คุณจ่าย เทียบกับสิ่งที่อยู่ในบัญชี');
      }
    };
  };

  /* ---------------- 08 · D/E — balance-sheet seesaw ---------------- */
  B.de = function(r){
    var beam = q(r,'beam'), eqL = q(r,'eqL'), dbL = q(r,'dbL'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:0.3, cls:'good', en:'FORTRESS BALANCE SHEET', th:'งบดุลแข็งแกร่ง',
        sen:'Barely borrows — survives almost anything.', sth:'แทบไม่กู้เลย รอดได้เกือบทุกสถานการณ์' },
      { v:1.0, cls:'',     en:'BALANCED', th:'สมดุล',
        sen:'฿1 borrowed for every ฿1 of owners\u2019 money.', sth:'กู้ 1 บาท ต่อเงินเจ้าของ 1 บาท' },
      { v:2.6, cls:'bad',  en:'LEVERAGED', th:'ใช้หนี้สูง',
        sen:'Interest is due even in a bad quarter.', sth:'ดอกเบี้ยต้องจ่าย แม้ไตรมาสนั้นจะแย่' }
    ];
    var i = 0, cur = 0.3, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.1){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.2);
      },
      paint:function(dt, t){
        var ang = clamp((Math.log(clamp(cur, 0.12, 4)) / Math.log(4)) * 15, -17, 17);
        var wob = 0.55 * Math.sin((t || 0) * 1.7);
        beam.setAttribute('transform','translate(150,84) rotate(' + (ang + wob).toFixed(2) + ')');
        eqL.textContent = L('EQUITY','ทุนเจ้าของ');
        dbL.textContent = L('DEBT','หนี้สิน');
        var s = pick(SET, cur, 'v', true);
        num.textContent = cur.toFixed(2) + '×';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Borrowed money vs owners\u2019 money','เงินกู้ เทียบกับเงินของเจ้าของ');
      }
    };
  };

  /* ---------------- 09 · MARGIN — where every ฿100 of sales goes ---------------- */
  B.margin = function(r){
    var s0 = q(r,'s0'), s1 = q(r,'s1'), s2 = q(r,'s2'), s3 = q(r,'s3'),
        g0 = q(r,'g0'), g1 = q(r,'g1'), g2 = q(r,'g2'), g3 = q(r,'g3'), rev = q(r,'rev'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { c:[72,18,8], cls:'bad',  en:'SUPERMARKET', th:'ซูเปอร์มาร์เก็ต',
        sen:'Huge revenue, almost nothing survives.', sth:'รายได้มหาศาล แต่แทบไม่เหลืออะไร' },
      { c:[55,25,8], cls:'warn', en:'MANUFACTURER', th:'โรงงานผลิต',
        sen:'Costs eat most of it — scale is everything.', sth:'ต้นทุนกินไปเกือบหมด — ขนาดคือทุกอย่าง' },
      { c:[24,32,12], cls:'good', en:'SOFTWARE', th:'บริษัทซอฟต์แวร์',
        sen:'Each extra sale costs almost nothing to serve.', sth:'ขายเพิ่มอีกหนึ่งหน่วย แทบไม่มีต้นทุนเพิ่ม' }
    ];
    var i = 0, cur = [72,18,8], acc = 0, FULL = 276;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.3){ acc = 0; i = (i + 1) % SET.length; }
        for(var k = 0; k < 3; k++) cur[k] = ease(cur[k], SET[i].c[k], dt, 2.4);
      },
      paint:function(){
        var profit = Math.max(0, 100 - cur[0] - cur[1] - cur[2]);
        var parts = [cur[0], cur[1], cur[2], profit], els = [s0,s1,s2,s3], x = 12, k;
        for(k = 0; k < 4; k++){
          var w = FULL * parts[k] / 100;
          els[k].setAttribute('x', x.toFixed(1));
          els[k].setAttribute('width', Math.max(0, w).toFixed(1));
          x += w;
        }
        rev.textContent = L('REVENUE = 100%','รายได้ = 100%');
        g0.textContent = L('COST OF GOODS','ต้นทุนสินค้า');
        g1.textContent = L('OPERATING COST','ค่าใช้จ่ายดำเนินงาน');
        g2.textContent = L('INTEREST + TAX','ดอกเบี้ย + ภาษี');
        g3.textContent = L('NET PROFIT','กำไรสุทธิ');
        var pr = [];
        for(var m = 0; m < SET.length; m++){
          pr.push({ v:100 - SET[m].c[0] - SET[m].c[1] - SET[m].c[2],
                    cls:SET[m].cls, en:SET[m].en, th:SET[m].th, sen:SET[m].sen, sth:SET[m].sth });
        }
        var s = pick(pr, profit, 'v');
        num.textContent = profit.toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('What survives out of every ฿100 sold','จากยอดขายทุก 100 บาท เหลือเท่าไหร่');
      }
    };
  };

  /* ---------------- 10 · FCF — cash waterfall ---------------- */
  B.fcf = function(r){
    var w0 = q(r,'w0'), w1 = q(r,'w1'), w2 = q(r,'w2'), lnk = q(r,'lnk'),
        t0 = q(r,'t0'), t1 = q(r,'t1'), t2 = q(r,'t2'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { op:100, cx:32, cls:'good', en:'CASH MACHINE', th:'เครื่องจักรผลิตเงินสด',
        sen:'Plenty left for dividends and buybacks.', sth:'เหลือเยอะสำหรับจ่ายปันผลและซื้อหุ้นคืน' },
      { op:100, cx:74, cls:'warn', en:'CAPITAL HUNGRY', th:'กินเงินลงทุนหนัก',
        sen:'Most cash goes straight back into the plant.', sth:'เงินสดเกือบทั้งหมดกลับเข้าไปในโรงงาน' },
      { op:100, cx:112, cls:'bad', en:'BURNING CASH', th:'เผาเงินสด',
        sen:'Reported profit, but the bank balance shrinks.', sth:'รายงานว่ากำไร แต่เงินในบัญชีลดลง' }
    ];
    var i = 0, capx = 32, acc = 0, BASE = 84, SC = 0.60;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        capx = ease(capx, SET[i].cx, dt, 2.4);
      },
      paint:function(){
        var h0 = 100 * SC, h1 = capx * SC, free = 100 - capx, h2 = Math.abs(free) * SC;
        w0.setAttribute('y',(BASE - h0).toFixed(1)); w0.setAttribute('height', h0.toFixed(1));
        w1.setAttribute('y',(BASE - h0).toFixed(1)); w1.setAttribute('height', h1.toFixed(1));
        if(free >= 0){ w2.setAttribute('y',(BASE - h2).toFixed(1)); }
        else { w2.setAttribute('y', BASE); }
        w2.setAttribute('height', h2.toFixed(1));
        w2.setAttribute('fill', free >= 0 ? 'rgba(204,255,0,.42)' : 'rgba(255,59,78,.42)');
        w2.setAttribute('stroke', free >= 0 ? '#ccff00' : '#ff3b4e');
        lnk.setAttribute('d','M88,' + (BASE - h0).toFixed(1) + ' L119,' + (BASE - h0).toFixed(1) +
                             ' M181,' + (BASE - h0 + h1).toFixed(1) + ' L212,' + (BASE - h0 + h1).toFixed(1));
        t0.textContent = L('CASH IN','เงินสดเข้า');
        t1.textContent = L('CAPEX','เงินลงทุน');
        t2.textContent = L('FREE CASH','เงินสดอิสระ');
        var s = pick(SET, capx, 'cx');
        num.textContent = (free >= 0 ? '' : '−') + Math.abs(free).toFixed(0);
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Out of every 100 of operating cash','จากกระแสเงินสดดำเนินงานทุก 100');
      }
    };
  };

  /* ---------------- 11 · BETA — stock swing vs the market ---------------- */
  B.beta = function(r){
    var mkt = q(r,'mkt'), stk = q(r,'stk'), lm = q(r,'lm'), ls = q(r,'ls'), swatch = q(r,'sw'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var N = 30, STEP = 10.5, walk = [], v = 0, i;
    function nextV(){ v += (Math.random() - 0.5) * 0.55; v *= 0.9; return clamp(v, -1, 1); }
    for(i = 0; i < 150; i++) nextV();
    for(i = 0; i < N; i++) walk.push(nextV());
    var SET = [
      { b:0.45, cls:'good', en:'DEFENSIVE', th:'หุ้นตั้งรับ',
        sen:'Barely flinches when the index drops.', sth:'แทบไม่สะเทือนตอนดัชนีร่วง' },
      { b:1.00, cls:'',     en:'MOVES WITH MARKET', th:'ขยับตามตลาด',
        sen:'Step for step with the index.', sth:'ก้าวต่อก้าวไปกับดัชนี' },
      { b:1.85, cls:'bad',  en:'HIGH VOLATILITY', th:'ผันผวนสูง',
        sen:'Market −10% has historically meant −18%.', sth:'ตลาด −10% ในอดีตหุ้นนี้มัก −18%' }
    ];
    var idx = 0, beta = 0.45, acc = 0, off = 0;
    function path(centre, scale){
      var d = '', k;
      for(k = 0; k < walk.length; k++){
        var x = -STEP + k * STEP - off;
        var y = clamp(centre + walk[k] * 12 * scale, 3, 97);
        d += (k ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
      }
      return d;
    }
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; idx = (idx + 1) % SET.length; }
        beta = ease(beta, SET[idx].b, dt, 2.2);
        off += 14 * dt;
        while(off >= STEP){ off -= STEP; walk.shift(); walk.push(nextV()); }
      },
      paint:function(){
        var s = pick(SET, beta, 'b');
        var col = beta >= 1.4 ? '#ff3b4e' : beta <= 0.7 ? '#00ff66' : '#ccff00';
        mkt.setAttribute('d', path(30, 1));
        stk.setAttribute('d', path(74, beta));
        stk.setAttribute('stroke', col);
        if(swatch) swatch.setAttribute('fill', col);
        lm.textContent = L('MARKET INDEX','ดัชนีตลาด');
        ls.textContent = L('THIS STOCK','หุ้นตัวนี้');
        num.textContent = beta.toFixed(2);
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Same market move, different swing','ตลาดขยับเท่ากัน แต่เหวี่ยงไม่เท่ากัน');
      }
    };
  };

  /* ---------------- 12 · 52W — where price sits in its year ---------------- */
  B.range52 = function(r){
    var fill = q(r,'fill'), mark = q(r,'mark'), px = q(r,'px'), lo = q(r,'lo'), hi = q(r,'hi'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var LO = 42, HI = 98;
    var SET = [
      { p:6,  cls:'bad',  en:'NEAR 52W LOW', th:'ใกล้จุดต่ำสุดรอบปี',
        sen:'Deeply out of favour — or genuinely broken.', sth:'ถูกตลาดเมินหนัก — หรือพังจริงๆ' },
      { p:48, cls:'warn', en:'MID RANGE', th:'กลางกรอบราคา',
        sen:'No trend to speak of yet.', sth:'ยังไม่มีแนวโน้มที่ชัดเจน' },
      { p:94, cls:'good', en:'NEAR 52W HIGH', th:'ใกล้จุดสูงสุดรอบปี',
        sen:'Buyers keep validating the uptrend.', sth:'ผู้ซื้อยังยืนยันแนวโน้มขาขึ้นซ้ำๆ' }
    ];
    var i = 0, cur = 6, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.1){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].p, dt, 2.3);
      },
      paint:function(){
        var w = 276 * cur / 100, x = 12 + w;
        fill.setAttribute('width', Math.max(0, w).toFixed(1));
        mark.setAttribute('transform','translate(' + x.toFixed(1) + ',0)');
        px.setAttribute('x', clamp(x, 34, 266).toFixed(1));
        px.textContent = (LO + (HI - LO) * cur / 100).toFixed(2);
        lo.textContent = L('52W LOW ' + LO.toFixed(2), 'ต่ำสุดปี ' + LO.toFixed(2));
        hi.textContent = L('52W HIGH ' + HI.toFixed(2), 'สูงสุดปี ' + HI.toFixed(2));
        var s = pick(SET, cur, 'p');
        num.textContent = cur.toFixed(0) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Position inside the 1-year range','ตำแหน่งภายในกรอบราคา 1 ปี');
      }
    };
  };

  /* ---------------- 13 · PAYOUT — profit split, paid vs kept ---------------- */
  B.payout = function(r){
    var pay = q(r,'pay'), pctA = q(r,'pctA'), pctB = q(r,'pctB'), lA = q(r,'lA'), lB = q(r,'lB'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:22, cls:'good', en:'REINVESTING', th:'เก็บไว้ลงทุนต่อ',
        sen:'Most profit stays in to fund growth.', sth:'กำไรส่วนใหญ่ถูกเก็บไว้ใช้ขยายธุรกิจ' },
      { v:55, cls:'',     en:'BALANCED PAYER', th:'จ่ายแบบสมดุล',
        sen:'Pays you and still funds the business.', sth:'จ่ายให้คุณ และยังมีเงินหล่อเลี้ยงธุรกิจ' },
      { v:96, cls:'bad',  en:'STRETCHED', th:'ตึงเกินไป',
        sen:'One weak quarter away from a dividend cut.', sth:'ห่างจากการถูกตัดปันผลแค่ไตรมาสแย่ๆ ไตรมาสเดียว' }
    ];
    var i = 0, cur = 22, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.3);
      },
      paint:function(){
        var w = 276 * cur / 100;
        pay.setAttribute('width', Math.max(0, w).toFixed(1));
        pay.setAttribute('fill', cur > 85 ? 'rgba(255,59,78,.5)' : 'rgba(204,255,0,.5)');
        pctA.setAttribute('opacity', w > 44 ? 1 : 0);
        pctB.setAttribute('opacity', (276 - w) > 44 ? 1 : 0);
        pctA.textContent = cur.toFixed(0) + '%';
        pctB.textContent = (100 - cur).toFixed(0) + '%';
        lA.textContent = L('PAID TO YOU','จ่ายให้คุณ');
        lB.textContent = L('KEPT FOR GROWTH','เก็บไว้เติบโต');
        var s = pick(SET, cur, 'v');
        num.textContent = cur.toFixed(0) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Every ฿100 of profit, split','กำไรทุก 100 บาท ถูกแบ่งอย่างไร');
      }
    };
  };

  /* ---------------- 14 · SPREAD — the bid/ask ladder ---------------- */
  B.spread = function(r){
    var gapT = q(r,'gapT'), askL = q(r,'askL'), bidL = q(r,'bidL'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var A = [q(r,'ap0'), q(r,'ap1'), q(r,'ap2')], AR = [q(r,'ar0'), q(r,'ar1'), q(r,'ar2')],
        Bp = [q(r,'bp0'), q(r,'bp1'), q(r,'bp2')], BR = [q(r,'br0'), q(r,'br1'), q(r,'br2')];
    var SET = [
      { s:0.01, cls:'good', en:'TIGHT · DEEP BOOK', th:'สเปรดแคบ · กระดานลึก',
        sen:'Large caps: costs a satang to get in and out.', sth:'หุ้นใหญ่: เข้าออกเสียแค่หนึ่งสตางค์' },
      { s:0.12, cls:'warn', en:'MODERATE', th:'ปานกลาง',
        sen:'A real, but survivable, round-trip cost.', sth:'เป็นต้นทุนจริง แต่ยังพอรับได้' },
      { s:0.62, cls:'bad',  en:'WIDE · THIN BOOK', th:'สเปรดกว้าง · กระดานบาง',
        sen:'You lose ~1% the instant you buy.', sth:'คุณเสียราว 1% ทันทีที่กดซื้อ' }
    ];
    var i = 0, cur = 0.01, acc = 0, flick = 0, sizes = [40,66,92,88,60,36];
    return {
      step:function(dt){
        acc += dt; flick += dt;
        if(acc > 3.3){ acc = 0; i = (i + 1) % SET.length; }
        if(flick > 0.5){
          flick = 0;
          for(var k = 0; k < sizes.length; k++){
            sizes[k] = clamp(sizes[k] + (Math.random() - 0.5) * 34, 16, 100);
          }
        }
        cur = ease(cur, SET[i].s, dt, 2.4);
      },
      paint:function(){
        var mid = 52.00, k;
        for(k = 0; k < 3; k++){
          A[k].textContent = (mid + cur / 2 + (2 - k) * Math.max(0.01, cur)).toFixed(2);
          Bp[k].textContent = (mid - cur / 2 - k * Math.max(0.01, cur)).toFixed(2);
          AR[k].setAttribute('width', sizes[k].toFixed(1));
          BR[k].setAttribute('width', sizes[k + 3].toFixed(1));
        }
        askL.textContent = L('ASK · sellers','Ask · ฝั่งขาย');
        bidL.textContent = L('BID · buyers','Bid · ฝั่งซื้อ');
        gapT.textContent = L('SPREAD ' + cur.toFixed(2), 'สเปรด ' + cur.toFixed(2));
        var s = pick(SET, cur, 's', true);
        num.textContent = (cur / mid * 100).toFixed(2) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Live order book · buy high, sell low','กระดานคำสั่งซื้อขายสด · ซื้อแพง ขายถูก');
      }
    };
  };

  /* ---------------- 15 · ROI — cost vs current value ---------------- */
  B.roi = function(r){
    var b1 = q(r,'b1'), b2 = q(r,'b2'), l1 = q(r,'l1'), l2 = q(r,'l2'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:0.70, cls:'bad',  en:'LOSS', th:'ขาดทุน',
        sen:'Selling now returns less than you put in.', sth:'ถ้าขายตอนนี้ จะได้เงินคืนน้อยกว่าที่ลงทุนไป' },
      { v:1.12, cls:'',     en:'MODEST GAIN', th:'กำไรพอประมาณ',
        sen:'Ahead, but check what it cost to get here.', sth:'ยังกำไรอยู่ แต่ต้องดูว่าแลกอะไรมาบ้าง' },
      { v:1.80, cls:'good', en:'STRONG GAIN', th:'กำไรแข็งแกร่ง',
        sen:'The position has paid for itself and then some.', sth:'เงินลงทุนคืนทุนแล้วและได้กำไรเพิ่มอีกมาก' }
    ];
    var i = 0, cur = 0.70, acc = 0, BASEW = 42;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        b1.setAttribute('width', clamp(BASEW * cur, 4, 276).toFixed(1));
        b1.setAttribute('fill', cur >= 1 ? 'rgba(204,255,0,0.28)' : 'rgba(255,59,78,0.24)');
        b1.setAttribute('stroke', cur >= 1 ? '#ccff00' : '#ff3b4e');
        b2.setAttribute('width', BASEW);
        l1.textContent = L('CURRENT VALUE','มูลค่าปัจจุบัน');
        l2.textContent = L('COST (=1.0×)','เงินลงทุน (=1.0×)');
        var s = pick(SET, cur, 'v', true);
        num.textContent = (cur >= 1 ? '+' : '') + ((cur - 1) * 100).toFixed(0) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('What you\'d get back vs what you put in','สิ่งที่จะได้คืน เทียบกับสิ่งที่ลงทุนไป');
      }
    };
  };

  /* ---------------- 16 · ROA — profit engine on total assets ---------------- */
  B.roa = function(r){
    var arc = q(r,'arc'), pct = q(r,'pct'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var C = 2 * Math.PI * 40;
    var SET = [
      { v:1.5, cls:'bad',  en:'ASSET-HEAVY DRAG', th:'สินทรัพย์หนักแต่กำไรน้อย',
        sen:'A lot of assets working to produce very little profit.', sth:'สินทรัพย์เยอะ แต่สร้างกำไรได้น้อยมาก' },
      { v:5,   cls:'warn', en:'AVERAGE', th:'ปานกลาง',
        sen:'A reasonable, unremarkable return on what it owns.', sth:'ผลตอบแทนพอสมควร ไม่โดดเด่นมาก' },
      { v:11,  cls:'good', en:'ASSET-EFFICIENT', th:'ใช้สินทรัพย์คุ้มค่า',
        sen:'Every ฿1 of assets is being put to hard work.', sth:'สินทรัพย์ทุกบาทถูกใช้งานอย่างคุ้มค่า' }
    ];
    var i = 0, cur = 1.5, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.1){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.3);
      },
      paint:function(){
        var f = clamp(cur / 15, 0, 1);
        arc.setAttribute('stroke-dasharray', C.toFixed(1));
        arc.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(1));
        arc.setAttribute('stroke', cur >= 8 ? '#00ff66' : cur >= 3 ? '#ccff00' : '#ff3b4e');
        var s = pick(SET, cur, 'v');
        pct.textContent = cur.toFixed(0) + '%';
        num.textContent = cur.toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Profit made per ฿1 of everything owned','กำไรที่ทำได้ต่อสินทรัพย์ 1 บาทที่บริษัทมี');
      }
    };
  };

  /* ---------------- 17 · PEG — price vs growth scale ---------------- */
  B.peg = function(r){
    var mark = q(r,'mark'), lbl = q(r,'lbl'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:0.6, cls:'good', en:'UNDERVALUED GROWTH', th:'โตเร็วแต่ราคายังถูก',
        sen:'Paying less than the growth rate arguably justifies.', sth:'จ่ายราคาต่ำกว่าที่อัตราการเติบโตควรได้รับ' },
      { v:1.0, cls:'',     en:'FAIRLY PRICED', th:'ราคาสมเหตุสมผล',
        sen:'Price and growth are roughly in balance.', sth:'ราคากับการเติบโตสมดุลกันพอดี' },
      { v:2.3, cls:'warn', en:'GROWTH FULLY PRICED IN', th:'ราคาสะท้อนการเติบโตไปหมดแล้ว',
        sen:'A rich premium is being paid for that growth rate.', sth:'จ่ายพรีเมียมสูงมากสำหรับอัตราการเติบโตนั้น' }
    ];
    function xOf(v){ return 12 + clamp(v, 0, 3.2) / 3.2 * 276; }
    var i = 0, cur = SET[0].v, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.4){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.6);
      },
      paint:function(){
        var s = pick(SET, cur, 'v'), x = xOf(cur);
        mark.setAttribute('transform','translate(' + x.toFixed(1) + ',0)');
        lbl.setAttribute('x', clamp(x, 30, 270).toFixed(1));
        lbl.textContent = 'PEG ' + cur.toFixed(2);
        num.textContent = cur.toFixed(2);
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('PEG scale · undervalued → overpriced growth','สเกล PEG · ต่ำเกินจริง → แพงเกินการเติบโต');
      }
    };
  };

  /* ---------------- 18 · EV/EBITDA — whole-business price vs cash profit ---------------- */
  B.evebitda = function(r){
    var b1 = q(r,'b1'), b2 = q(r,'b2'), l1 = q(r,'l1'), l2 = q(r,'l2'), who = q(r,'who'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:5.5, cls:'good', en:'CHEAP CASH ENGINE', th:'เครื่องทำเงินสดราคาถูก', wen:'MATURE INDUSTRIAL', wth:'อุตสาหกรรมที่โตเต็มที่แล้ว',
        sen:'Buying a baht of core cash earnings cheaply.', sth:'ซื้อกำไรเงินสดหลักของธุรกิจได้ในราคาถูก' },
      { v:11,  cls:'',     en:'MARKET AVERAGE', th:'ค่าเฉลี่ยตลาด', wen:'BROAD INDEX', wth:'แบบดัชนีรวม',
        sen:'Roughly where a typical healthy business trades.', sth:'ประมาณระดับที่ธุรกิจสุขภาพดีทั่วไปซื้อขายกัน' },
      { v:22,  cls:'warn', en:'PRICED FOR GROWTH', th:'ราคาตั้งไว้เผื่อการเติบโต', wen:'HIGH-GROWTH TECH', wth:'เทคโนโลยีโตเร็ว',
        sen:'Paying many years of core cash earnings up front.', sth:'จ่ายล่วงหน้าหลายปีของกำไรเงินสดหลักไปแล้ว' }
    ];
    var i = 0, cur = 5.5, acc = 0, BOOKW = 42;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        b1.setAttribute('width', clamp(BOOKW * cur / 11, 4, 276).toFixed(1));
        b2.setAttribute('width', BOOKW);
        l1.textContent = L('ENTERPRISE VALUE','มูลค่ากิจการ');
        l2.textContent = L('EBITDA (=1.0×)','EBITDA (=1.0×)');
        var s = pick(SET, cur, 'v', true);
        who.textContent = L(s.wen, s.wth);
        num.textContent = cur.toFixed(1) + '×';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('What the whole business costs vs its cash profit','ราคาทั้งธุรกิจ เทียบกับกำไรเงินสดที่ทำได้');
      }
    };
  };

  /* ---------------- 19 · CURRENT RATIO — short-term assets vs liabilities seesaw ---------------- */
  B.curratio = function(r){
    var beam = q(r,'beam'), liL = q(r,'liL'), asL = q(r,'asL'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:0.7, cls:'bad',  en:'LIQUIDITY STRAIN', th:'สภาพคล่องตึงตัว',
        sen:'Short-term bills outrun what can quickly turn to cash.', sth:'หนี้ระยะสั้นมากกว่าสิ่งที่แปลงเป็นเงินสดได้เร็ว' },
      { v:1.8, cls:'good', en:'HEALTHY CUSHION', th:'มีกันชนสภาพคล่องดี',
        sen:'Comfortable room to cover bills due within a year.', sth:'มีพื้นที่สบายพอจ่ายหนี้ที่ครบกำหนดภายในปีนี้' },
      { v:4.5, cls:'warn', en:'CASH SITTING IDLE', th:'เงินสดกองอยู่เฉยๆ',
        sen:'Very safe, but that much idle cash could work harder.', sth:'ปลอดภัยมาก แต่เงินสดกองขนาดนี้น่าจะเอาไปทำงานได้มากกว่านี้' }
    ];
    var i = 0, cur = 0.7, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.1){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.2);
      },
      paint:function(dt, t){
        var ang = clamp((Math.log(clamp(cur, 0.25, 6)) / Math.log(6)) * 15, -17, 17);
        var wob = 0.55 * Math.sin((t || 0) * 1.7);
        beam.setAttribute('transform','translate(150,84) rotate(' + (ang + wob).toFixed(2) + ')');
        liL.textContent = L('LIABILITIES','หนี้สินหมุนเวียน');
        asL.textContent = L('ASSETS','สินทรัพย์หมุนเวียน');
        var s = pick(SET, cur, 'v', true);
        num.textContent = cur.toFixed(2) + '×';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('What can be quickly cashed vs what is owed soon','สิ่งที่แปลงเป็นเงินสดได้เร็ว เทียบกับหนี้ที่ใกล้ครบกำหนด');
      }
    };
  };

  /* ---------------- 20 · CAGR — compounding growth curve ---------------- */
  B.cagr = function(r){
    var curve = q(r,'curve'), dot = q(r,'dot'), y0 = q(r,'y0'), y10 = q(r,'y10'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:2,  cls:'bad',  en:'BARELY OUTPACES CASH', th:'แทบไม่ต่างจากถือเงินสด',
        sen:'At this pace, doubling your money takes over 30 years.', sth:'ด้วยอัตรานี้ เงินจะโตเป็นสองเท่าใช้เวลากว่า 30 ปี' },
      { v:9,  cls:'',     en:'LONG-RUN MARKET AVERAGE', th:'ค่าเฉลี่ยตลาดระยะยาว',
        sen:'Roughly what a broad index has compounded at historically.', sth:'ประมาณอัตราที่ดัชนีตลาดกว้างๆ เคยโตเฉลี่ยในอดีต' },
      { v:22, cls:'good', en:'EXCEPTIONAL COMPOUNDING', th:'การทบต้นที่โดดเด่นมาก',
        sen:'Rare, and rarely sustainable for a full decade.', sth:'พบได้ยาก และมักรักษาไว้ตลอดสิบปีเต็มไม่ได้' }
    ];
    var YEARS = 10, W = 276, H = 56, X0 = 12, Y0 = 74;
    var i = 0, cur = 2, acc = 0, t = 0;
    function curveD(rate){
      var d = '', k, val, endv = Math.pow(1 + rate / 100, YEARS);
      for(k = 0; k <= YEARS; k++){
        val = Math.pow(1 + rate / 100, k);
        var x = X0 + (k / YEARS) * W;
        var y = Y0 - (val / endv) * H;
        d += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
      }
      return d.trim();
    }
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.6){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.0);
        t += dt * 0.7; if(t > YEARS) t = 0;
      },
      paint:function(){
        curve.setAttribute('d', curveD(cur));
        var endVal = Math.pow(1 + cur / 100, YEARS);
        var tv = Math.pow(1 + cur / 100, t);
        var dx = X0 + (t / YEARS) * W, dy = Y0 - (tv / endVal) * H;
        dot.setAttribute('cx', dx.toFixed(1));
        dot.setAttribute('cy', dy.toFixed(1));
        y0.textContent = L('YEAR 0 · 100','ปีที่ 0 · 100');
        y10.textContent = L('YEAR 10 · ' + Math.round(endVal * 100), 'ปีที่ 10 · ' + Math.round(endVal * 100));
        var s = pick(SET, cur, 'v', true);
        num.textContent = cur.toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('100 compounding for 10 years at this rate','เงิน 100 ทบต้นสิบปีที่อัตรานี้');
      }
    };
  };

  /* ---------------- 21 · STOP-LOSS — price drifting toward a fixed exit level ---------------- */
  B.stoploss = function(r){
    var mark = q(r,'mark'), lbl = q(r,'lbl'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:78, cls:'good', en:'WELL CLEAR OF STOP', th:'ห่างจากจุดตัดขาดทุนมาก',
        sen:'Plenty of room before the stop would trigger.', sth:'ยังมีระยะห่างเยอะก่อนจะโดนตัดขาดทุน' },
      { v:32, cls:'warn', en:'APPROACHING STOP', th:'ราคาเข้าใกล้จุดตัดขาดทุน',
        sen:'Getting close to the level that exits automatically.', sth:'ราคาใกล้ระดับที่จะขายอัตโนมัติแล้ว' },
      { v:3,  cls:'bad',  en:'STOPPED OUT', th:'โดนตัดขาดทุนแล้ว',
        sen:'Price hit the stop - the position closed automatically.', sth:'ราคาชนจุดตัดขาดทุน ระบบขายออกให้อัตโนมัติแล้ว' }
    ];
    function xOf(v){ return 12 + clamp(v, 0, 100) / 100 * 276; }
    var i = 0, cur = SET[0].v, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        var s = pick(SET, cur, 'v'), x = xOf(cur);
        mark.setAttribute('transform','translate(' + x.toFixed(1) + ',0)');
        lbl.setAttribute('x', clamp(x, 30, 270).toFixed(1));
        lbl.textContent = L('PRICE','ราคา');
        num.textContent = cur.toFixed(0) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Headroom above the stop price','ระยะห่างเหนือจุดตัดขาดทุน');
      }
    };
  };

  /* ---------------- 22 · TRAILING STOP — a floor that only ever rises ---------------- */
  B.trailstop = function(r){
    var priceLn = q(r,'price'), stopLn = q(r,'stopline'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { cls:'', en:'RATCHETING UP', th:'ขยับตามขึ้นเรื่อยๆ',
        sen:'New highs keep pulling the stop up with them.', sth:'จุดสูงสุดใหม่ดึงจุดตัดขาดทุนให้ขยับขึ้นตาม' },
      { cls:'good', en:'PROFIT LOCKED IN', th:'ล็อกกำไรไว้แล้ว',
        sen:'The stop now sits above your entry price.', sth:'จุดตัดขาดทุนตอนนี้อยู่สูงกว่าราคาที่ซื้อมาแล้ว' },
      { cls:'bad', en:'TRIGGERED', th:'ถูกกระตุ้นแล้ว',
        sen:'Price fell far enough to hit the trailing stop.', sth:'ราคาร่วงลงมาชนจุดตัดขาดทุนที่ขยับตามแล้ว' }
    ];
    var N = 40, STEP = 7.2, price = [], peak = 30, off = 0, phase = 0, phaseIdx = 0, v = 0;
    function nextV(){ v += (Math.random() - 0.5) * 4.2; v *= 0.86; return v; }
    for(var k = 0; k < 120; k++) nextV();
    var y = 55;
    for(k = 0; k < N; k++){ y = clamp(y + nextV(), 12, 82); price.push(y); }
    var trail = [];
    (function seedTrail(){
      var pk = 82;
      for(var j = 0; j < price.length; j++){ pk = Math.min(pk, price[j] - 22); trail.push(pk); }
    })();
    return {
      step:function(dt){
        off += 26 * dt;
        phase += dt;
        if(phase > 3.4){ phase = 0; phaseIdx = (phaseIdx + 1) % SET.length; }
        while(off >= STEP){
          off -= STEP;
          price.shift();
          var bias = phaseIdx === 2 ? 3.2 : phaseIdx === 1 ? -1.4 : -2.0;
          var ny = clamp(price[price.length - 1] + nextV() + bias, 10, 84);
          price.push(ny);
          var lastTrail = trail.shift();
          trail.push(Math.min(82, Math.max(lastTrail, ny - 22)));
        }
      },
      paint:function(){
        var dP = '', dS = '', j;
        for(j = 0; j < price.length; j++){
          var x = 12 + j * (276 / (price.length - 1));
          dP += (j ? ' L' : 'M') + x.toFixed(1) + ',' + price[j].toFixed(1);
          dS += (j ? ' L' : 'M') + x.toFixed(1) + ',' + trail[j].toFixed(1);
        }
        priceLn.setAttribute('d', dP);
        stopLn.setAttribute('d', dS);
        var s = SET[phaseIdx];
        var gapPct = ((trail[trail.length - 1] - price[price.length - 1]) / price[price.length - 1] * -100);
        num.textContent = (phaseIdx === 2 ? '−' : '+') + Math.abs(gapPct).toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('The stop rises with new highs, never falls back','จุดตัดขาดทุนขยับขึ้นตามจุดสูงสุดใหม่ ไม่เคยขยับลง');
      }
    };
  };

  /* ---------------- 23 · MARKET ORDER — instant fill vs the quoted price ---------------- */
  B.mktorder = function(r){
    var b1 = q(r,'b1'), b2 = q(r,'b2'), l1 = q(r,'l1'), l2 = q(r,'l2'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:1.00, cls:'good', en:'FILLED AT QUOTE', th:'ได้ราคาตรงตามที่เสนอ',
        sen:'Deep, liquid book - almost no slippage.', sth:'กระดานลึกและสภาพคล่องสูง แทบไม่มีสลิปเพจ' },
      { v:1.10, cls:'warn', en:'SOME SLIPPAGE', th:'มีสลิปเพจเล็กน้อย',
        sen:'Filled a bit worse than the last quoted price.', sth:'ได้ราคาแย่กว่าที่เสนอไว้เล็กน้อย' },
      { v:1.35, cls:'bad',  en:'HEAVY SLIPPAGE', th:'สลิปเพจหนัก',
        sen:'Thin book - the order walked through several price levels.', sth:'กระดานบางมาก คำสั่งไล่ซื้อผ่านหลายระดับราคา' }
    ];
    var i = 0, cur = 1.00, acc = 0, BASEW = 42;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        b1.setAttribute('width', clamp(BASEW * cur, 4, 276).toFixed(1));
        b2.setAttribute('width', BASEW);
        l1.textContent = L('FILL PRICE','ราคาที่ได้จริง');
        l2.textContent = L('QUOTED PRICE (=1.0×)','ราคาที่เสนอ (=1.0×)');
        var s = pick(SET, cur, 'v', true);
        num.textContent = '+' + ((cur - 1) * 100).toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('How far the real fill drifts from the quote','ราคาที่ได้จริงห่างจากราคาที่เสนอแค่ไหน');
      }
    };
  };

  /* ---------------- 24 · LIMIT ORDER — waiting for the price to come to you ---------------- */
  B.limitorder = function(r){
    var mark = q(r,'mark'), lbl = q(r,'lbl'), limitLn = q(r,'limitln'), limitLbl = q(r,'limitlbl'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var LIMIT = 25;
    var SET = [
      { v:82, cls:'',     en:'WAITING ABOVE LIMIT', th:'รอราคาลงมาถึงจุดที่ตั้งไว้',
        sen:'Current price is still above your buy limit.', sth:'ราคาตอนนี้ยังอยู่สูงกว่าราคาที่คุณตั้งซื้อไว้' },
      { v:18, cls:'good', en:'FILLED AT YOUR PRICE', th:'ซื้อสำเร็จตามราคาที่ตั้ง',
        sen:'Price touched the limit - the order filled.', sth:'ราคาลงมาแตะจุดที่ตั้งไว้ ออเดอร์ถูกเติมเต็มแล้ว' },
      { v:95, cls:'warn', en:'RUNNING AWAY', th:'ราคาวิ่งหนีไปเรื่อยๆ',
        sen:'Price never came down to your order - it may never fill.', sth:'ราคาไม่เคยลงมาถึงจุดที่ตั้งไว้เลย อาจไม่มีวันได้ซื้อ' }
    ];
    function xOf(v){ return 12 + clamp(v, 0, 100) / 100 * 276; }
    var i = 0, cur = SET[0].v, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.3){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        var s = pick(SET, cur, 'v'), x = xOf(cur), lx = xOf(LIMIT);
        mark.setAttribute('transform','translate(' + x.toFixed(1) + ',0)');
        lbl.setAttribute('x', clamp(x, 30, 270).toFixed(1));
        lbl.textContent = L('PRICE','ราคา');
        limitLn.setAttribute('transform','translate(' + lx.toFixed(1) + ',0)');
        limitLbl.setAttribute('x', lx.toFixed(1));
        limitLbl.textContent = L('LIMIT','ราคาที่ตั้ง');
        num.textContent = cur.toFixed(0) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Waits until the market comes to your price','รอจนกว่าราคาตลาดจะลงมาถึงที่คุณตั้งไว้');
      }
    };
  };

  /* ---------------- 25 · DCF — future cash discounted back to today ---------------- */
  B.dcf = function(r){
    var w0 = q(r,'w0'), w1 = q(r,'w1'), w2 = q(r,'w2'), lnk = q(r,'lnk'),
        t0 = q(r,'t0'), t1 = q(r,'t1'), t2 = q(r,'t2'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { cx:18, cls:'good', en:'LOW DISCOUNT RATE', th:'อัตราคิดลดต่ำ',
        sen:'Future cash keeps most of its value today.', sth:'เงินสดในอนาคตยังคงมูลค่าไว้ได้เกือบเต็ม' },
      { cx:42, cls:'',     en:'MARKET-TYPICAL RATE', th:'อัตราคิดลดระดับทั่วไป',
        sen:'A reasonable middle-of-the-road assumption.', sth:'เป็นสมมติฐานระดับกลางๆ ที่สมเหตุสมผล' },
      { cx:70, cls:'bad',  en:'HIGH DISCOUNT RATE', th:'อัตราคิดลดสูง',
        sen:'Future cash is worth much less in today\'s money.', sth:'เงินสดในอนาคตเหลือมูลค่าน้อยมากเมื่อคิดเป็นเงินวันนี้' }
    ];
    var i = 0, capx = 18, acc = 0, BASE = 78, SC = 0.56;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        capx = ease(capx, SET[i].cx, dt, 2.4);
      },
      paint:function(){
        var h0 = 100 * SC, h1 = capx * SC, free = 100 - capx, h2 = free * SC;
        w0.setAttribute('y',(BASE - h0).toFixed(1)); w0.setAttribute('height', h0.toFixed(1));
        w1.setAttribute('y',(BASE - h0).toFixed(1)); w1.setAttribute('height', h1.toFixed(1));
        w2.setAttribute('y',(BASE - h2).toFixed(1)); w2.setAttribute('height', h2.toFixed(1));
        lnk.setAttribute('x1', 54); lnk.setAttribute('x2', 182);
        lnk.setAttribute('y1', (BASE - h0).toFixed(1)); lnk.setAttribute('y2', (BASE - h2).toFixed(1));
        t0.textContent = L('FUTURE CASH','เงินสดในอนาคต');
        t1.textContent = L('DISCOUNTED AWAY','ถูกคิดลดออกไป');
        t2.textContent = L('PRESENT VALUE','มูลค่าปัจจุบัน');
        var s = pick(SET, capx, 'cx');
        num.textContent = free.toFixed(0) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Share of the future cash flow retained today','สัดส่วนเงินสดในอนาคตที่ยังคงมูลค่าไว้ถึงวันนี้');
      }
    };
  };

  /* ---------------- 26 · GDP — quarterly growth above/below the zero line ---------------- */
  B.gdp = function(r){
    var barsG = q(r,'bars'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { vals:[0.55,0.60,0.62,0.65,0.68,0.70,0.72,0.75], cls:'good', en:'STEADY EXPANSION', th:'เศรษฐกิจขยายตัวต่อเนื่อง',
        sen:'Output growing quarter after quarter.', sth:'ผลผลิตทางเศรษฐกิจโตขึ้นทุกไตรมาส' },
      { vals:[0.50,0.35,0.20,0.10,0.05,-0.05,0.10,0.20], cls:'warn', en:'SLOWING GROWTH', th:'การเติบโตชะลอตัว',
        sen:'Still growing overall, but losing momentum fast.', sth:'โดยรวมยังโตอยู่ แต่แรงส่งอ่อนลงเร็ว' },
      { vals:[0.10,-0.15,-0.25,-0.10,0.05,0.15,0.25,0.30], cls:'bad', en:'RECESSION', th:'ภาวะเศรษฐกิจถดถอย',
        sen:'Two straight shrinking quarters - the common recession signal.', sth:'หดตัวติดต่อกันสองไตรมาส สัญญาณถดถอยที่ใช้กันทั่วไป' }
    ];
    var N = 8, cur = SET[0].vals.slice(), i = 0, acc = 0, rects = [], k;
    for(k = 0; k < N; k++){
      var rc = mk('rect',{ x:(16 + k * 34).toFixed(1), y:42, width:22, height:0, rx:2, fill:'rgba(255,255,255,.2)' });
      barsG.appendChild(rc); rects.push(rc);
    }
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.4){ acc = 0; i = (i + 1) % SET.length; }
        var tgt = SET[i].vals;
        for(k = 0; k < N; k++){ cur[k] = ease(cur[k], tgt[k], dt, 2.2); }
      },
      paint:function(){
        for(k = 0; k < N; k++){
          var v = cur[k], h = Math.abs(v) * 26;
          rects[k].setAttribute('height', h.toFixed(1));
          rects[k].setAttribute('y', v >= 0 ? (42 - h).toFixed(1) : '42');
          rects[k].setAttribute('fill', v >= 0 ? 'rgba(0,255,102,.55)' : 'rgba(255,59,78,.55)');
        }
        var s = SET[i], last = cur[N - 1];
        num.textContent = (last >= 0 ? '+' : '') + (last * 4.4).toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Quarterly output growth, above or below zero','การเติบโตของผลผลิตรายไตรมาส เหนือหรือใต้เส้นศูนย์');
      }
    };
  };

  /* ---------------- 27 · CPI — purchasing power eroding against a fixed 100 ---------------- */
  B.cpi = function(r){
    var b1 = q(r,'b1'), b2 = q(r,'b2'), l1 = q(r,'l1'), l2 = q(r,'l2'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { v:0.98, cls:'good', en:'LOW INFLATION', th:'เงินเฟ้อต่ำ',
        sen:'Your money barely loses value over a year.', sth:'เงินแทบไม่เสียมูลค่าเลยตลอดทั้งปี' },
      { v:0.92, cls:'warn', en:'MODERATE INFLATION', th:'เงินเฟ้อปานกลาง',
        sen:'A noticeable, steady erosion of buying power.', sth:'มูลค่าเงินถูกกัดกร่อนไปทีละน้อยอย่างต่อเนื่อง' },
      { v:0.88, cls:'bad',  en:'HIGH INFLATION', th:'เงินเฟ้อสูง',
        sen:'Cash sitting idle loses real value fast.', sth:'เงินสดที่นอนเฉยๆ เสียมูลค่าจริงไปอย่างรวดเร็ว' }
    ];
    var i = 0, cur = 0.98, acc = 0, BASEW = 42;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.4);
      },
      paint:function(){
        b1.setAttribute('width', clamp(BASEW * cur, 4, 276).toFixed(1));
        b2.setAttribute('width', BASEW);
        l1.textContent = L('BUYING POWER OF 100','กำลังซื้อของเงิน 100');
        l2.textContent = L('A YEAR AGO (=100)','เมื่อปีก่อน (=100)');
        var s = pick(SET, cur, 'v', true);
        var inflation = (1 / cur - 1) * 100;
        num.textContent = inflation.toFixed(1) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('What 100 from a year ago can still buy today','เงิน 100 เมื่อปีก่อน วันนี้ซื้อของได้แค่ไหน');
      }
    };
  };

  /* ---------------- 28 · POLICY RATE — how tight or loose money is right now ---------------- */
  B.policyrate = function(r){
    var arc = q(r,'arc'), pct = q(r,'pct'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var C = 2 * Math.PI * 40;
    var SET = [
      { v:1.5, cls:'good', en:'EASING / STIMULATING', th:'ผ่อนคลาย / กระตุ้นเศรษฐกิจ',
        sen:'Cheap to borrow - meant to speed the economy up.', sth:'กู้ยืมถูก มีไว้เพื่อกระตุ้นเศรษฐกิจให้โตเร็วขึ้น' },
      { v:4.0, cls:'warn', en:'NEUTRAL', th:'เป็นกลาง',
        sen:'Neither pushing the economy nor holding it back.', sth:'ไม่ได้ผลักดันหรือหน่วงเศรษฐกิจ' },
      { v:7.5, cls:'bad',  en:'TIGHTENING / RESTRICTIVE', th:'ตึงตัว / สกัดเศรษฐกิจ',
        sen:'Expensive to borrow - deliberately cooling things down.', sth:'กู้ยืมแพง ตั้งใจชะลอเศรษฐกิจให้เย็นลง' }
    ];
    var i = 0, cur = 1.5, acc = 0;
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.2){ acc = 0; i = (i + 1) % SET.length; }
        cur = ease(cur, SET[i].v, dt, 2.3);
      },
      paint:function(){
        var f = clamp(cur / 10, 0, 1);
        arc.setAttribute('stroke-dasharray', C.toFixed(1));
        arc.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(1));
        arc.setAttribute('stroke', cur >= 6 ? '#ff3b4e' : cur >= 3 ? '#ffb020' : '#00ff66');
        var s = pick(SET, cur, 'v');
        pct.textContent = cur.toFixed(1) + '%';
        num.textContent = cur.toFixed(2) + '%';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('The rate every other rate in the economy prices off','อัตราตั้งต้นที่ดอกเบี้ยอื่นในระบบอิงราคาตาม');
      }
    };
  };

  /* ---------------- 29 · YIELD CURVE — shape across maturities, normal vs inverted ---------------- */
  B.yieldcurve = function(r){
    var curve = q(r,'curve'), m0 = q(r,'m0'), m1 = q(r,'m1'), m2 = q(r,'m2'), m3 = q(r,'m3'),
        num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub'), cap = q(r,'cap');
    var SET = [
      { y:[3.0,3.8,4.3,4.6], cls:'good', en:'NORMAL CURVE', th:'เส้นปกติ (ชันขึ้น)',
        sen:'Longer bonds pay more - the healthy, typical shape.', sth:'พันธบัตรระยะยาวให้ผลตอบแทนสูงกว่า รูปร่างปกติของเศรษฐกิจที่แข็งแรง' },
      { y:[4.0,3.9,3.85,3.9], cls:'warn', en:'FLAT CURVE', th:'เส้นแบนราบ',
        sen:'Short and long yields nearly equal - the market is unsure.', sth:'ผลตอบแทนสั้นและยาวใกล้เคียงกัน ตลาดยังไม่แน่ใจทิศทาง' },
      { y:[4.8,4.3,3.8,4.0], cls:'bad',  en:'INVERTED CURVE', th:'เส้นกลับด้าน',
        sen:'Short-term yields exceed long-term - a classic recession warning.', sth:'ผลตอบแทนระยะสั้นสูงกว่าระยะยาว สัญญาณเตือนภาวะถดถอยแบบคลาสสิก' }
    ];
    var X = [12, 104, 196, 288], YLO = 2, YHI = 6, TOP = 14, BOT = 78;
    var i = 0, cur = SET[0].y.slice(), acc = 0;
    function yPix(v){ return BOT - clamp((v - YLO) / (YHI - YLO), 0, 1) * (BOT - TOP); }
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.4){ acc = 0; i = (i + 1) % SET.length; }
        var tgt = SET[i].y;
        for(var k = 0; k < 4; k++){ cur[k] = ease(cur[k], tgt[k], dt, 2.2); }
      },
      paint:function(){
        var d = '';
        for(var k = 0; k < 4; k++){ d += (k ? ' L' : 'M') + X[k] + ',' + yPix(cur[k]).toFixed(1); }
        curve.setAttribute('d', d);
        m0.textContent = '3M';
        m1.textContent = '2Y';
        m2.textContent = '10Y';
        m3.textContent = '30Y';
        var spread = cur[2] - cur[1];
        num.textContent = (spread >= 0 ? '+' : '') + spread.toFixed(2) + '%';
        num.className = 'tv-num ' + SET[i].cls;
        tag.textContent = L(SET[i].en, SET[i].th);
        sub.textContent = L(SET[i].sen, SET[i].sth);
        cap.textContent = L('Yield across maturities - shape signals the mood','ผลตอบแทนตามอายุคงเหลือ - รูปร่างบอกอารมณ์เศรษฐกิจ');
      }
    };
  };


  /* ======================================================================
     CHART SIGNALS — animated readers for the "Read The Chart" section
     ====================================================================== */

  /* --- 01/02/03 legacy visuals: geometry is animated by the tape engine,
         these builders only drive the live readout + captions --- */
  B.sig_cndl = function(r){
    var cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var viz = r.querySelector('.candle-viz');
    return { paint:function(){
      var up = viz ? viz.querySelectorAll('.candle.up').length : 0;
      var dn = viz ? viz.querySelectorAll('.candle.down').length : 0;
      var net = up - dn;
      num.textContent = up + ' : ' + dn;
      num.className = 'tv-num ' + (net > 0 ? 'good' : net < 0 ? 'bad' : 'warn');
      tag.textContent = net > 0 ? L('BUYERS AHEAD','ฝั่งซื้อนำ')
                      : net < 0 ? L('SELLERS AHEAD','ฝั่งขายนำ')
                                : L('EVENLY MATCHED','สูสีกัน');
      sub.textContent = L('Green closes vs red closes currently on the tape.','จำนวนแท่งเขียวเทียบแท่งแดงที่อยู่บนกระดานตอนนี้');
      cap.textContent = L('Live candle tape','กระดานแท่งเทียนสด');
    }};
  };

  B.sig_ma = function(r){
    var cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var svg = r.querySelector('.ma-viz');
    function lastY(sel){
      var p = svg && svg.querySelector(sel);
      var d = p && p.getAttribute('d');
      if(!d) return null;
      var m = d.trim().split(/[ ,LM]+/).filter(function(s){ return s !== ''; });
      return parseFloat(m[m.length - 1]);
    }
    return { paint:function(){
      var py = lastY('path.price'), my = lastY('path.ma');
      var gap = (py !== null && my !== null && isFinite(py) && isFinite(my)) ? (my - py) : 0;
      num.textContent = (gap >= 0 ? '+' : '') + gap.toFixed(1);
      num.className = 'tv-num ' + (gap > 1.5 ? 'good' : gap < -1.5 ? 'bad' : 'warn');
      tag.textContent = gap > 1.5 ? L('PRICE ABOVE MA','ราคาอยู่เหนือเส้นค่าเฉลี่ย')
                      : gap < -1.5 ? L('PRICE BELOW MA','ราคาอยู่ใต้เส้นค่าเฉลี่ย')
                                   : L('HUGGING THE MA','ราคาเกาะเส้นค่าเฉลี่ย');
      sub.textContent = L('Distance between the last price and the average.','ระยะห่างระหว่างราคาล่าสุดกับเส้นค่าเฉลี่ย');
      cap.textContent = L('Price vs its own average','ราคาเทียบค่าเฉลี่ยของตัวเอง');
    }};
  };

  B.sig_rsi = function(r){
    var cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var mk2 = r.querySelector('.rsi-marker');
    return { paint:function(){
      var v = mk2 ? parseFloat(mk2.style.left) : 50;
      if(!isFinite(v)) v = 50;
      num.textContent = v.toFixed(0);
      num.className = 'tv-num ' + (v >= 70 ? 'bad' : v <= 30 ? 'good' : 'warn');
      tag.textContent = v >= 70 ? L('OVERBOUGHT','ซื้อมากเกินไป')
                      : v <= 30 ? L('OVERSOLD','ขายมากเกินไป')
                                : L('NEUTRAL ZONE','โซนปกติ');
      sub.textContent = L('Above 70 stretched up, below 30 stretched down.','เกิน 70 คือตึงขาขึ้น ต่ำกว่า 30 คือตึงขาลง');
      cap.textContent = L('Momentum gauge 0-100','เกจโมเมนตัม 0-100');
    }};
  };

  /* ---- shared: a scrolling price series ---- */
  function scroller(n, step, seedFn){
    var vals = [], i;
    for(i = 0; i < 200; i++) seedFn();
    for(i = 0; i < n; i++) vals.push(seedFn());
    return { vals:vals, off:0, step:step,
      advance:function(dt, speed){
        this.off += (speed || 16) * dt;
        while(this.off >= this.step){ this.off -= this.step; this.vals.shift(); this.vals.push(seedFn()); }
      },
      pathAt:function(map){
        var d = '', k;
        for(k = 0; k < this.vals.length; k++){
          var x = -this.step + k * this.step - this.off;
          d += (k ? ' L' : 'M') + x.toFixed(1) + ',' + map(this.vals[k], k).toFixed(1);
        }
        return d;
      }
    };
  }

  /* --- 04 support & resistance --- */
  B.sig_sr = function(r){
    var px = q(r,'px'), hitR = q(r,'hitR'), hitS = q(r,'hitS'),
        lr = q(r,'lr'), ls = q(r,'ls'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var v = 0.5, dir = 1;
    var s = scroller(24, 13, function(){
      v += dir * (0.035 + Math.random() * 0.03);
      if(v > 0.90){ v = 0.90; dir = -1; }
      if(v < 0.10){ v = 0.10; dir = 1; }
      return v;
    });
    var flashR = 0, flashS = 0;
    return {
      step:function(dt){
        s.advance(dt, 15);
        var last = s.vals[s.vals.length - 1];
        if(last > 0.9) flashR = 1;
        if(last < 0.1) flashS = 1;
        flashR = Math.max(0, flashR - dt * 1.1);
        flashS = Math.max(0, flashS - dt * 1.1);
      },
      paint:function(){
        px.setAttribute('d', s.pathAt(function(y){ return 84 - y * 56; }));
        hitR.setAttribute('opacity', flashR.toFixed(2));
        hitS.setAttribute('opacity', flashS.toFixed(2));
        var last = s.vals[s.vals.length - 1];
        lr.textContent = L('RESISTANCE','แนวต้าน');
        ls.textContent = L('SUPPORT','แนวรับ');
        num.textContent = (last * 100).toFixed(0) + '%';
        num.className = 'tv-num ' + (last > 0.75 ? 'bad' : last < 0.25 ? 'good' : 'warn');
        tag.textContent = last > 0.75 ? L('TESTING RESISTANCE','กำลังทดสอบแนวต้าน')
                        : last < 0.25 ? L('TESTING SUPPORT','กำลังทดสอบแนวรับ')
                                      : L('MID RANGE','กลางกรอบ');
        sub.textContent = L('Each rejection makes the level more respected.','ทุกครั้งที่ราคาถูกตีกลับ เส้นนั้นยิ่งมีน้ำหนักขึ้น');
        cap.textContent = L('Price trapped between two levels','ราคาติดอยู่ระหว่างสองแนว');
      }
    };
  };

  /* --- 05 trend lines --- */
  B.sig_trend = function(r){
    var px = q(r,'px'), tl = q(r,'tl'), lt = q(r,'lt'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var SET = [
      { sl: 0.85, cls:'good', en:'HIGHER HIGHS + HIGHER LOWS', th:'ยอดสูงขึ้น ฐานสูงขึ้น',
        sen:'A textbook uptrend: buyers step in earlier each time.', sth:'แนวโน้มขาขึ้นตามตำรา ผู้ซื้อเข้ามารับเร็วขึ้นทุกครั้ง' },
      { sl: 0.0, cls:'warn', en:'SIDEWAYS RANGE', th:'ออกข้าง',
        sen:'No trend — neither side is winning the argument.', sth:'ไม่มีแนวโน้ม ยังไม่มีฝ่ายไหนชนะ' },
      { sl:-0.85, cls:'bad', en:'LOWER HIGHS + LOWER LOWS', th:'ยอดต่ำลง ฐานต่ำลง',
        sen:'A downtrend: every bounce is sold into sooner.', sth:'แนวโน้มขาลง ทุกการเด้งถูกขายเร็วขึ้นเรื่อยๆ' }
    ];
    var i = 0, sl = SET[0].sl, acc = 0, ph = 0;
    return {
      step:function(dt){
        acc += dt; ph += dt * 0.85;
        if(acc > 3.6){ acc = 0; i = (i + 1) % SET.length; }
        sl = ease(sl, SET[i].sl, dt, 1.7);
      },
      paint:function(){
        var d = '', tld = '', k, N = 26;
        for(k = 0; k < N; k++){
          var x = 10 + k * 11.2;
          var base = 56 - (k - N / 2) * sl * 2.5;
          var y = clamp(base + Math.sin(k * 0.72 + ph) * 17, 8, 100);
          d += (k ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
        }
        var y0 = 56 + (N / 2) * sl * 2.5 + 19, y1 = 56 - (N / 2) * sl * 2.5 + 19;
        tld = 'M10,' + clamp(y0, 6, 106).toFixed(1) + ' L' + (10 + (N - 1) * 11.2).toFixed(1) + ',' + clamp(y1, 6, 106).toFixed(1);
        px.setAttribute('d', d);
        tl.setAttribute('d', tld);
        var s = pick(SET, sl, 'sl');
        tl.setAttribute('stroke', sl > 0.3 ? '#00ff66' : sl < -0.3 ? '#ff3b4e' : '#ffb020');
        lt.textContent = L('TREND LINE','เส้นแนวโน้ม');
        num.textContent = (sl > 0.3 ? '↗' : sl < -0.3 ? '↘' : '→');
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('The shape of the swing points','รูปทรงของจุดสูงสุด-ต่ำสุด');
      }
    };
  };

  /* --- 06 bollinger bands --- */
  B.sig_bb = function(r){
    var band = q(r,'band'), up = q(r,'up'), dn = q(r,'dn'), mid = q(r,'mid'), px = q(r,'px'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var N = 26, STEP = 11.4, ph = 0, wid = 26, cyc = 0;
    return {
      step:function(dt){
        ph += dt * 1.15; cyc += dt;
        if(cyc > 9) cyc = 0;
        var target = cyc < 4 ? 7 : cyc < 5.2 ? 34 : 20;   // squeeze -> expansion -> normal
        wid = ease(wid, target, dt, 1.5);
      },
      paint:function(){
        var upPts = [], dnPts = [], midPts = [], pxPts = [], k;
        for(k = 0; k < N; k++){
          var x = 10 + k * STEP;
          var m = 58 + Math.sin(k * 0.34 + ph * 0.4) * 9;
          var w = wid * (0.75 + 0.25 * Math.sin(k * 0.5 + ph));
          midPts.push([x, m]);
          upPts.push([x, m - w]);
          dnPts.push([x, m + w]);
          pxPts.push([x, clamp(m + Math.sin(k * 0.95 + ph * 2.1) * w * 0.95, 6, 112)]);
        }
        function d(pts){ return pts.map(function(p, i){ return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
        up.setAttribute('d', d(upPts));
        dn.setAttribute('d', d(dnPts));
        mid.setAttribute('d', d(midPts));
        px.setAttribute('d', d(pxPts));
        band.setAttribute('d', d(upPts) + ' L' + dnPts[dnPts.length-1][0].toFixed(1) + ',' + dnPts[dnPts.length-1][1].toFixed(1) +
                               ' ' + d(dnPts.slice().reverse()).replace('M','L') + ' Z');
        var squeeze = wid < 13, wide = wid > 27;
        num.textContent = (wid * 2).toFixed(0);
        num.className = 'tv-num ' + (squeeze ? 'warn' : wide ? 'bad' : '');
        tag.textContent = squeeze ? L('SQUEEZE','บีบตัว') : wide ? L('EXPANSION','ขยายตัว') : L('NORMAL WIDTH','ความกว้างปกติ');
        sub.textContent = squeeze
          ? L('Volatility has collapsed — a bigger move often follows.','ความผันผวนหดตัว มักตามมาด้วยการเคลื่อนไหวครั้งใหญ่')
          : L('Price rides the band when a trend is strong.','เมื่อแนวโน้มแรง ราคาจะเกาะขอบแบนด์ไปเรื่อยๆ');
        cap.textContent = L('Volatility envelope around the average','กรอบความผันผวนรอบเส้นค่าเฉลี่ย');
      }
    };
  };

  /* --- 07 MACD --- */
  B.sig_macd = function(r){
    var bars = q(r,'bars'), m1 = q(r,'m1'), m2 = q(r,'m2'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var N = 24, STEP = 11.5, rects = [], k;
    for(k = 0; k < N; k++){
      var rc = mk('rect',{ x:(10 + k*STEP).toFixed(1), y:60, width:7.5, height:0, rx:1.5, fill:'rgba(255,255,255,.2)' });
      bars.appendChild(rc); rects.push(rc);
    }
    var ph = 0;
    return {
      step:function(dt){ ph += dt * 0.95; },
      paint:function(){
        var d1 = '', d2 = '', j, last = 0;
        for(j = 0; j < N; j++){
          var x = 10 + j * STEP;
          var a = Math.sin(j * 0.42 + ph) * 22 + Math.sin(j * 0.17 + ph * 0.5) * 8;
          var b = Math.sin(j * 0.42 + ph - 0.85) * 20;
          var h = (a - b);
          last = h;
          d1 += (j ? ' L' : 'M') + x.toFixed(1) + ',' + (60 - a).toFixed(1);
          d2 += (j ? ' L' : 'M') + x.toFixed(1) + ',' + (60 - b).toFixed(1);
          var hh = Math.abs(h) * 1.15;
          rects[j].setAttribute('y', (h >= 0 ? 60 - hh : 60).toFixed(1));
          rects[j].setAttribute('height', hh.toFixed(1));
          rects[j].setAttribute('fill', h >= 0 ? 'rgba(0,255,102,.5)' : 'rgba(255,59,78,.5)');
        }
        m1.setAttribute('d', d1);
        m2.setAttribute('d', d2);
        num.textContent = (last >= 0 ? '+' : '') + last.toFixed(1);
        num.className = 'tv-num ' + (last >= 0 ? 'good' : 'bad');
        tag.textContent = last >= 0 ? L('BULLISH CROSS','ตัดขึ้น') : L('BEARISH CROSS','ตัดลง');
        sub.textContent = L('Bars flip colour the moment the two lines cross.','แท่งเปลี่ยนสีทันทีที่เส้นสองเส้นตัดกัน');
        cap.textContent = L('Momentum crossover + histogram','การตัดกันของโมเมนตัม + ฮิสโทแกรม');
      }
    };
  };

  /* --- 08 volume confirmation --- */
  B.sig_volcf = function(r){
    var px = q(r,'px'), bars = q(r,'bars'), brk = q(r,'brk'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var N = 24, STEP = 11.5, rects = [], k;
    for(k = 0; k < N; k++){
      var rc = mk('rect',{ x:(10 + k*STEP).toFixed(1), y:112, width:7.5, height:0, rx:1.5, fill:'rgba(255,255,255,.16)' });
      bars.appendChild(rc); rects.push(rc);
    }
    var cyc = 0, strong = true;
    return {
      step:function(dt){
        cyc += dt;
        if(cyc > 4.6){ cyc = 0; strong = !strong; }
      },
      paint:function(){
        var d = '', j;
        var prog = clamp(cyc / 3.2, 0, 1);
        for(j = 0; j < N; j++){
          var x = 10 + j * STEP;
          var t = j / (N - 1);
          var base = 52 + Math.sin(j * 0.9) * 5;
          var lift = t > 0.55 ? (t - 0.55) / 0.45 * 34 * prog : 0;
          d += (j ? ' L' : 'M') + x.toFixed(1) + ',' + (base - lift).toFixed(1);
          var vol = 14 + Math.abs(Math.sin(j * 1.3)) * 8;
          if(t > 0.55) vol = strong ? vol + (t - 0.55) / 0.45 * 30 * prog : vol * 0.55;
          rects[j].setAttribute('y', (112 - vol).toFixed(1));
          rects[j].setAttribute('height', vol.toFixed(1));
          rects[j].setAttribute('fill', (t > 0.55 && strong) ? 'rgba(204,255,0,.8)' : 'rgba(255,255,255,.16)');
        }
        px.setAttribute('d', d);
        px.setAttribute('stroke', strong ? '#ccff00' : '#ffb020');
        brk.setAttribute('opacity', prog.toFixed(2));
        num.textContent = strong ? '2.4×' : '0.5×';
        num.className = 'tv-num ' + (strong ? '' : 'bad');
        tag.textContent = strong ? L('CONFIRMED BREAKOUT','เบรกที่ยืนยันแล้ว') : L('UNCONFIRMED','ยังไม่ยืนยัน');
        sub.textContent = strong
          ? L('Real money is behind the move.','มีเงินจริงหนุนอยู่เบื้องหลังการเคลื่อนไหวนี้')
          : L('Same breakout, no volume — treat it as noise.','เบรกแบบเดียวกันแต่ไม่มีวอลุ่ม ให้ถือเป็นสัญญาณรบกวน');
        cap.textContent = L('Breakout with and without volume','การเบรกที่มีและไม่มีวอลุ่ม');
      }
    };
  };

  /* --- 09 gaps --- */
  B.sig_gap = function(r){
    var zone = q(r,'zone'), pre = q(r,'pre'), post = q(r,'post'), dot = q(r,'dot'), lz = q(r,'lz'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var CLOSE = 88, OPEN = 42, BREAK_X = 128, RESUME_X = 158;
    var cyc = 0;
    return {
      step:function(dt){ cyc += dt; if(cyc > 8) cyc = 0; },
      paint:function(){
        var jumped = clamp(cyc / 1.3, 0, 1);            /* the overnight leap */
        var filled = clamp((cyc - 3.6) / 3.0, 0, 1);    /* price crawling back down */

        var openY = CLOSE - (CLOSE - OPEN) * jumped;
        pre.setAttribute('d','M10,' + (CLOSE - 2) + ' L44,' + (CLOSE - 5) +
                             ' L78,' + (CLOSE + 1) + ' L' + BREAK_X + ',' + CLOSE);

        var tail = openY + (CLOSE - openY) * filled * 0.92;
        post.setAttribute('d','M' + RESUME_X + ',' + openY.toFixed(1) +
                              ' L196,' + (openY - 5).toFixed(1) +
                              ' L242,' + ((openY + tail) / 2).toFixed(1) +
                              ' L286,' + tail.toFixed(1));
        dot.setAttribute('cy', tail.toFixed(1));

        /* the shaded band is the price range nobody actually traded in */
        var top = Math.min(openY, CLOSE), bot = Math.max(openY, CLOSE);
        zone.setAttribute('y', top.toFixed(1));
        zone.setAttribute('height', Math.max(0, bot - top).toFixed(1));
        zone.setAttribute('opacity', (jumped * (1 - filled * 0.8)).toFixed(2));

        lz.textContent = filled > 0.15 ? L('GAP CLOSING','ช่องว่างกำลังถูกปิด') : L('UNFILLED GAP','ช่องว่างที่ยังไม่ถูกปิด');
        num.textContent = filled > 0.05 ? (filled * 100).toFixed(0) + '%' : L('OPEN','เปิดค้าง');
        num.className = 'tv-num ' + (filled > 0.5 ? 'warn' : 'good');
        tag.textContent = filled > 0.15 ? L('FILLING THE GAP','กำลังปิดช่องว่าง') : L('GAP UP','เปิดกระโดดขึ้น');
        sub.textContent = L('Nobody traded inside the band, so price often returns.','ไม่มีใครซื้อขายในแถบนั้นเลย ราคาจึงมักย้อนกลับมา');
        cap.textContent = L('Overnight jump leaves a hole','การกระโดดข้ามคืนทิ้งช่องว่างไว้');
      }
    };
  };

  /* --- 10 golden / death cross --- */
  B.sig_xover = function(r){
    var fast = q(r,'fast'), slow = q(r,'slow'), burst = q(r,'burst'),
        lf = q(r,'lf'), lsw = q(r,'lsw'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var cyc = 0, golden = true;
    return {
      step:function(dt){ cyc += dt; if(cyc > 6.2){ cyc = 0; golden = !golden; } },
      paint:function(){
        var p = clamp(cyc / 5.2, 0, 1);
        var dF = '', dS = '', j, N = 26, cross = 0.45;
        for(j = 0; j < N; j++){
          var x = 10 + j * 11.2, t = j / (N - 1);
          var slowY = 60 - (t - 0.5) * (golden ? 12 : -12);
          var spread = (t - cross) * (golden ? 62 : -62) * p;
          var fastY = slowY - spread + Math.sin(j * 0.8) * 3.5;
          dS += (j ? ' L' : 'M') + x.toFixed(1) + ',' + clamp(slowY, 8, 112).toFixed(1);
          dF += (j ? ' L' : 'M') + x.toFixed(1) + ',' + clamp(fastY, 8, 112).toFixed(1);
        }
        fast.setAttribute('d', dF);
        slow.setAttribute('d', dS);
        fast.setAttribute('stroke', golden ? '#00ff66' : '#ff3b4e');
        var bx = 10 + cross * (N - 1) * 11.2;
        burst.setAttribute('cx', bx.toFixed(1));
        burst.setAttribute('cy', 60);
        burst.setAttribute('r', (3 + 9 * Math.max(0, 1 - Math.abs(p - 0.25) * 5)).toFixed(1));
        burst.setAttribute('opacity', Math.max(0, 1 - Math.abs(p - 0.25) * 4).toFixed(2));
        burst.setAttribute('fill', golden ? '#00ff66' : '#ff3b4e');
        lf.textContent = L('50-DAY','50 วัน');
        lsw.textContent = L('200-DAY','200 วัน');
        num.textContent = golden ? '↗' : '↘';
        num.className = 'tv-num ' + (golden ? 'good' : 'bad');
        tag.textContent = golden ? L('GOLDEN CROSS','โกลเดนครอส') : L('DEATH CROSS','เดธครอส');
        sub.textContent = golden
          ? L('Short average cuts up through the long one.','เส้นค่าเฉลี่ยสั้นตัดขึ้นเหนือเส้นยาว')
          : L('Short average cuts down through the long one.','เส้นค่าเฉลี่ยสั้นตัดลงใต้เส้นยาว');
        cap.textContent = L('Fast average crossing the slow one','เส้นเฉลี่ยเร็วตัดกับเส้นเฉลี่ยช้า');
      }
    };
  };

  /* --- 11 divergence --- */
  B.sig_divg = function(r){
    var px = q(r,'px'), mo = q(r,'mo'), lp = q(r,'lp'), lm = q(r,'lm'),
        lpx = q(r,'lpx'), lmo = q(r,'lmo'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var cyc = 0;
    return {
      step:function(dt){ cyc += dt; if(cyc > 6) cyc = 0; },
      paint:function(){
        var p = clamp(cyc / 3.4, 0, 1);
        var peaks = [[70, 36], [170, 30 - 6 * p], [270, 26 - 12 * p]];
        var mPeaks = [[70, 104], [170, 108 + 5 * p], [270, 112 + 10 * p]];
        function wave(pk, base){
          var d = 'M10,' + base;
          pk.forEach(function(q2, i){
            d += ' Q' + (q2[0] - 26) + ',' + q2[1] + ' ' + q2[0] + ',' + q2[1].toFixed(1);
            d += ' Q' + (q2[0] + 26) + ',' + q2[1] + ' ' + (q2[0] + (i === pk.length - 1 ? 22 : 50)) + ',' + base;
          });
          return d;
        }
        px.setAttribute('d', wave(peaks, 52));
        mo.setAttribute('d', wave(mPeaks, 124));
        lp.setAttribute('d', 'M70,' + peaks[0][1].toFixed(1) + ' L270,' + peaks[2][1].toFixed(1));
        lm.setAttribute('d', 'M70,' + mPeaks[0][1].toFixed(1) + ' L270,' + mPeaks[2][1].toFixed(1));
        lpx.textContent = L('PRICE','ราคา');
        lmo.textContent = L('MOMENTUM','โมเมนตัม');
        num.textContent = p > 0.5 ? '↗↘' : '—';
        num.className = 'tv-num ' + (p > 0.5 ? 'bad' : 'warn');
        tag.textContent = p > 0.5 ? L('BEARISH DIVERGENCE','ไดเวอร์เจนซ์ขาลง') : L('FORMING','กำลังก่อตัว');
        sub.textContent = L('Price makes a higher high, momentum does not.','ราคาทำจุดสูงใหม่ แต่โมเมนตัมทำไม่ได้');
        cap.textContent = L('Price vs momentum disagreeing','ราคากับโมเมนตัมขัดแย้งกัน');
      }
    };
  };

  /* --- 12 chart patterns --- */
  B.sig_ptrn = function(r){
    var shape = q(r,'shape'), gl = q(r,'gl'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var P = [
      { pts:[[10,96],[60,40],[105,74],[150,38],[195,76],[250,104],[292,110]], gl:[[10,74],[292,74]],
        en:'DOUBLE TOP', th:'ดับเบิลท็อป', cls:'bad',
        sen:'Two failed pushes at the same ceiling — sellers defend it.', sth:'พยายามทะลุเพดานเดิมสองครั้งแล้วไม่ผ่าน ฝั่งขายยังคุมอยู่' },
      { pts:[[10,92],[52,58],[92,80],[140,26],[188,80],[232,56],[292,104]], gl:[[10,80],[292,80]],
        en:'HEAD & SHOULDERS', th:'หัวและไหล่', cls:'bad',
        sen:'A high peak between two lower ones — a classic reversal shape.', sth:'ยอดสูงตรงกลางขนาบด้วยยอดที่ต่ำกว่าสองข้าง เป็นรูปทรงกลับตัวคลาสสิก' },
      { pts:[[10,96],[58,46],[104,72],[152,46],[196,62],[244,46],[292,20]], gl:[[10,46],[292,46]],
        en:'ASCENDING TRIANGLE', th:'สามเหลี่ยมขาขึ้น', cls:'good',
        sen:'Flat ceiling, rising floor — pressure builds toward a breakout.', sth:'เพดานราบแต่ฐานยกสูงขึ้น แรงกดดันสะสมจนพร้อมเบรก' }
    ];
    var i = 0, acc = 0, cur = P[0].pts.map(function(p){ return p.slice(); });
    var glCur = P[0].gl.map(function(p){ return p.slice(); });
    return {
      step:function(dt){
        acc += dt;
        if(acc > 3.8){ acc = 0; i = (i + 1) % P.length; }
        for(var k = 0; k < cur.length; k++){
          cur[k][0] = ease(cur[k][0], P[i].pts[k][0], dt, 2.2);
          cur[k][1] = ease(cur[k][1], P[i].pts[k][1], dt, 2.2);
        }
        for(k = 0; k < glCur.length; k++){
          glCur[k][1] = ease(glCur[k][1], P[i].gl[k][1], dt, 2.2);
        }
      },
      paint:function(){
        shape.setAttribute('d', cur.map(function(p, k){ return (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
        gl.setAttribute('d', 'M' + glCur[0][0] + ',' + glCur[0][1].toFixed(1) + ' L' + glCur[1][0] + ',' + glCur[1][1].toFixed(1));
        var s = P[i];
        shape.setAttribute('stroke', s.cls === 'good' ? '#00ff66' : '#ff3b4e');
        num.textContent = s.cls === 'good' ? '↗' : '↘';
        num.className = 'tv-num ' + s.cls;
        tag.textContent = L(s.en, s.th);
        sub.textContent = L(s.sen, s.sth);
        cap.textContent = L('Recurring shapes traders watch for','รูปทรงที่เทรดเดอร์เฝ้าดูซ้ำๆ');
      }
    };
  };

  /* --- 13 fibonacci retracement --- */
  B.sig_fib = function(r){
    var swing = q(r,'swing'), mark = q(r,'mark'),
        cap = q(r,'cap'), num = q(r,'num'), tag = q(r,'tag'), sub = q(r,'sub');
    var LV = [0, 23.6, 38.2, 50, 61.8, 100];
    var lines = [];
    for(var k = 0; k < LV.length; k++){ lines.push(q(r,'f' + k)); }
    var cyc = 0;
    return {
      step:function(dt){ cyc += dt; if(cyc > 7) cyc = 0; },
      paint:function(){
        var HI = 14, LO = 110;
        var up = clamp(cyc / 2.2, 0, 1);
        var back = clamp((cyc - 2.6) / 2.2, 0, 1);
        var bounce = clamp((cyc - 5.2) / 1.6, 0, 1);
        var topY = LO - (LO - HI) * up;
        var retr = 0.618 * back * (1 - bounce * 0.75);
        var curY = topY + (LO - topY) * retr;
        swing.setAttribute('d', 'M10,' + LO + ' L120,' + topY.toFixed(1) +
                                ' L206,' + curY.toFixed(1) + ' L292,' + (curY - (LO - topY) * bounce * 0.3).toFixed(1));
        mark.setAttribute('cx', 292);
        mark.setAttribute('cy', (curY - (LO - topY) * bounce * 0.3).toFixed(1));
        for(var j = 0; j < LV.length; j++){
          var y = topY + (LO - topY) * (LV[j] / 100);
          if(lines[j]){ lines[j].setAttribute('y1', y.toFixed(1)); lines[j].setAttribute('y2', y.toFixed(1)); }
          var lab = q(r,'t' + j);
          if(lab){ lab.setAttribute('y', (y - 3).toFixed(1)); lab.textContent = LV[j].toFixed(1) + '%'; }
        }
        var pct = retr * 100;
        num.textContent = pct.toFixed(1) + '%';
        num.className = 'tv-num ' + (pct > 65 ? 'bad' : pct > 30 ? 'warn' : 'good');
        tag.textContent = pct > 65 ? L('DEEP RETRACEMENT','ย่อลึก')
                        : pct > 30 ? L('HEALTHY PULLBACK','ย่อในระดับปกติ')
                                   : L('SHALLOW DIP','ย่อตื้น');
        sub.textContent = L('38.2% and 61.8% are the levels traders watch most.','ระดับ 38.2% และ 61.8% คือจุดที่เทรดเดอร์จับตามากที่สุด');
        cap.textContent = L('How far a rally gives back','การขึ้นรอบนี้คืนกำไรไปเท่าไหร่');
      }
    };
  };

  /* ---------------- scheduler + viewport gating ---------------- */
  var live = [], all = [];
  var seen = (typeof WeakSet === 'function') ? new WeakSet() : null;
  var vio = (seen && 'IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
  }, { threshold: 0.01 }) : null;

  function visible(el){
    if(!vio) return true;
    if(!seen.has(el)) return false;
    var d = el.closest ? el.closest('details') : null;
    return !d || d.open;
  }

  Array.prototype.forEach.call(nodes, function(node){
    var build = B[node.getAttribute('data-viz')];
    if(!build) return;
    var api;
    try { api = build(node); } catch(err){ return; }
    if(!api) return;
    if(reduce){
      for(var k = 0; k < 140; k++){
        if(api.step) api.step(0.05, k * 0.05);
      }
      if(api.paint) api.paint(0.05, 7);
      all.push({ api:api, t:7 });
      return;
    }
    if(api.paint) api.paint(0.016, 0);
    if(vio) vio.observe(node);
    var item = { node:node, api:api, t:0 };
    live.push(item); all.push(item);
  });

  /* repaint every panel the instant the site language flips, so captions on
     collapsed / off-screen / reduced-motion panels are never left in EN */
  if(typeof MutationObserver === 'function'){
    new MutationObserver(function(){
      for(var k = 0; k < all.length; k++){
        if(all[k].api.paint) all[k].api.paint(0.016, all[k].t);
      }
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(!live.length) return;

  var last = 0;
  function loop(ts){
    requestAnimationFrame(loop);
    if(!last){ last = ts; return; }
    var dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if(document.hidden) return;
    for(var k = 0; k < live.length; k++){
      var it = live[k];
      if(!visible(it.node)) continue;
      it.t += dt;
      if(it.api.step)  it.api.step(dt, it.t);
      if(it.api.paint) it.api.paint(dt, it.t);
    }
  }
  requestAnimationFrame(loop);
})();
