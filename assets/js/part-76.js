/* ============================================================================
   SPACEZ TERMINAL -- Round AO: Auto Wave Count (#/autowave)  [beta]
   Real price history (Yahoo via the site's proxy, window.__SPZ_LIVE) ->
   swing pivots (ZigZag, size scaled to the symbol's own volatility) ->
   every Elliott template that could explain the latest pivots is tested
   against the hard rules (broken = thrown away), the survivors are scored
   on the usual guidelines (Fibonacci ratios, alternation, wave-3 length,
   trend context), and the best 3 are shown with their probability share,
   the price that invalidates each one, and Fibonacci targets for the next
   wave. It is a teaching assistant, not a signal.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_AUTOWAVE) return;
  window.__SPZ_AUTOWAVE = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }

  var U = {
    eb:{ en:'Elliott Wave · beta', th:'Elliott Wave · ทดลอง' },
    h:{ en:'Auto wave count', th:'นับคลื่นอัตโนมัติ' },
    lede:{ en:'Pick a stock, index, gold or crypto. The engine finds the swings on the real chart, tries every wave pattern that could fit, throws out any that break a rule, and shows the best counts with the price that proves each one wrong and Fibonacci targets for the next move.', th:'เลือกหุ้น ดัชนี ทองคำ หรือคริปโต ระบบจะหาจุดกลับตัวบนกราฟจริง ลองนับทุกรูปแบบที่เป็นไปได้ ตัดแบบที่ผิดกฎทิ้ง แล้วแสดงการนับที่ดีที่สุด พร้อมราคาที่ทำให้การนับนั้นผิด และเป้าฟีโบนัชชีของคลื่นถัดไป' },
    sym:{ en:'Symbol', th:'สัญลักษณ์' }, tf:{ en:'Chart', th:'กราฟ' }, size:{ en:'Wave size', th:'ขนาดคลื่น' },
    sS:{ en:'Small', th:'เล็ก' }, sM:{ en:'Medium', th:'กลาง' }, sL:{ en:'Large', th:'ใหญ่' },
    tf1:{ en:'6 months · daily', th:'6 เดือน · รายวัน' }, tf2:{ en:'1 year · daily', th:'1 ปี · รายวัน' }, tf3:{ en:'2 years · weekly', th:'2 ปี · รายสัปดาห์' }, tf4:{ en:'5 years · weekly', th:'5 ปี · รายสัปดาห์' },
    go:{ en:'Count the waves', th:'นับคลื่น' },
    loading:{ en:'Loading price history…', th:'กำลังโหลดข้อมูลราคา…' },
    fail:{ en:'Could not load this symbol right now. Check the spelling (Yahoo style, e.g. AAPL, GC=F, BTC-USD, ^SET.BK) or try again in a minute.', th:'โหลดสัญลักษณ์นี้ไม่ได้ในตอนนี้ ตรวจตัวสะกด (แบบ Yahoo เช่น AAPL, GC=F, BTC-USD, ^SET.BK) หรือลองใหม่อีกครั้ง' },
    none:{ en:'No valid count with this wave size. Try another size — the swings may be too small or too big.', th:'ไม่พบการนับที่ผ่านกฎด้วยขนาดคลื่นนี้ ลองเปลี่ยนขนาดคลื่น — สวิงอาจเล็กหรือใหญ่เกินไป' },
    beta:{ en:'Automatic counts are a starting point for study, not a trade signal. Always check the count yourself.', th:'การนับอัตโนมัติเป็นจุดเริ่มต้นสำหรับศึกษา ไม่ใช่สัญญาณซื้อขาย ตรวจการนับด้วยตัวเองทุกครั้ง' },
    cand:{ en:'Count', th:'การนับ' }, share:{ en:'likelihood share', th:'สัดส่วนความน่าจะเป็น' },
    status:{ en:'Where we are', th:'ตอนนี้อยู่ตรงไหน' }, inval:{ en:'Invalidation', th:'จุดยกเลิก' }, tgt:{ en:'Next targets', th:'เป้าถัดไป' },
    rules:{ en:'Rules checked', th:'กฎที่ผ่าน' }, guide:{ en:'Guidelines', th:'แนวทาง' },
    last:{ en:'Last', th:'ล่าสุด' }, invShort:{ en:'invalidation', th:'จุดยกเลิก' },
    pivots:{ en:'swing points', th:'จุดกลับตัว' }, legend:{ en:'Blue = price · amber = counted waves · red dashed = invalidation · green = target zone', th:'ฟ้า = ราคา · ส้ม = คลื่นที่นับ · เส้นประแดง = จุดยกเลิก · เขียว = โซนเป้าหมาย' }
  };
  var QUICK = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'MSFT', 'PTT', 'CPALL', 'ADVANC', 'GC=F', 'BTC-USD', '^SET.BK'];
  var TFS = { tf1:['6mo', '1d'], tf2:['1y', '1d'], tf3:['2y', '1wk'], tf4:['5y', '1wk'] };

  /* ------------------------------------------------------------ engine */
  function stdev(a){ var m = 0, i; for(i = 0; i < a.length; i++) m += a[i]; m /= a.length; var v = 0; for(i = 0; i < a.length; i++) v += (a[i] - m) * (a[i] - m); return Math.sqrt(v / Math.max(1, a.length - 1)); }
  function zigzag(c, th){
    var piv = [{ i:0, p:c[0] }], dir = 0, ext = 0, i;
    for(i = 1; i < c.length; i++){
      var e = piv[piv.length - 1];
      if(dir === 0){
        if(c[i] >= e.p * (1 + th)){ dir = 1; ext = i; }
        else if(c[i] <= e.p * (1 - th)){ dir = -1; ext = i; }
        continue;
      }
      if(dir === 1){
        if(c[i] > c[ext]) ext = i;
        else if(c[i] <= c[ext] * (1 - th)){ piv.push({ i:ext, p:c[ext] }); dir = -1; ext = i; }
      } else {
        if(c[i] < c[ext]) ext = i;
        else if(c[i] >= c[ext] * (1 + th)){ piv.push({ i:ext, p:c[ext] }); dir = 1; ext = i; }
      }
    }
    if(dir !== 0) piv.push({ i:ext, p:c[ext], live:true });
    return piv;
  }
  function close(x, t, tol){ return Math.max(0, 1 - Math.abs(x - t) / tol); }
  function fmt(p){ return p >= 1000 ? p.toFixed(0) : p >= 100 ? p.toFixed(1) : p >= 1 ? p.toFixed(2) : p.toPrecision(3); }

  var NAMES = {
    impDone:{ en:'Impulse 1-2-3-4-5 complete', th:'Impulse 1-2-3-4-5 จบแล้ว' },
    impW4:{ en:'Impulse — wave 4 done, wave 5 next', th:'Impulse — จบ wave 4 กำลังรอ wave 5' },
    impW3:{ en:'Impulse — wave 3 in progress', th:'Impulse — กำลังอยู่ใน wave 3' },
    impW2:{ en:'Impulse — wave 2 done, wave 3 next', th:'Impulse — จบ wave 2 กำลังรอ wave 3' },
    zzDone:{ en:'Zigzag A-B-C complete', th:'Zigzag A-B-C จบแล้ว' },
    zzC:{ en:'Zigzag — wave C in progress', th:'Zigzag — กำลังอยู่ใน wave C' },
    flatDone:{ en:'Flat A-B-C complete', th:'Flat A-B-C จบแล้ว' }
  };
  /* each template: n pivots, labels, test(P, d, ctx) -> null (rule broken) or { score, rules[], guides[], inval, targets[], next } */
  function legs(P){ var o = []; for(var k = 1; k < P.length; k++) o.push(Math.abs(P[k].p - P[k - 1].p)); return o; }
  function lgT(P){ var o = []; for(var k = 1; k < P.length; k++) o.push(P[k].i - P[k - 1].i); return o; }
  function R(en, th){ return { en:en, th:th }; }
  var TPL = [
    { id:'impDone', n:6, lab:['0', '1', '2', '3', '4', '5'], test:function(P, d){
      var w = legs(P), s = 40, g = [];
      if(d * (P[2].p - P[0].p) <= 0) return null;                 // wave 2 beyond start of 1
      if(w[2] < w[0] && w[2] < w[4]) return null;                  // wave 3 shortest
      if(d * (P[4].p - P[1].p) <= 0) return null;                  // wave 4 into wave 1
      if(d * (P[3].p - P[1].p) <= 0 || d * (P[5].p - P[3].p) <= 0 && w[4] < w[0] * 0.3) return null;
      var r2 = w[1] / w[0], r3 = w[2] / w[0], r4 = w[3] / w[2], r5a = w[4] / w[0], r5b = w[4] / Math.abs(P[3].p - P[0].p);
      s += 10 * close(r2, 0.59, 0.3) + 14 * Math.max(close(r3, 1.618, 0.45), close(r3, 2.618, 0.6)) + 10 * close(r4, 0.382, 0.22) + 10 * Math.max(close(r5a, 1, 0.3), close(r5b, 0.618, 0.2));
      if(Math.abs(r2 - r4) > 0.15){ s += 5; g.push(R('Alternation: wave 2 and wave 4 differ in depth (' + Math.round(r2 * 100) + '% vs ' + Math.round(r4 * 100) + '%)', 'Alternation: wave 2 กับ wave 4 ลึกต่างกัน (' + Math.round(r2 * 100) + '% กับ ' + Math.round(r4 * 100) + '%)')); }
      if(w[2] >= w[0] && w[2] >= w[4]){ s += 5; g.push(R('Wave 3 is the longest', 'Wave 3 ยาวที่สุด')); }
      g.push(R('Wave 3 = ' + r3.toFixed(2) + ' × wave 1', 'Wave 3 = ' + r3.toFixed(2) + ' × wave 1'));
      var A = P[0].p, E = P[5].p, len = E - A;
      return { score:s, rules:[R('Wave 2 stays above the start of wave 1', 'Wave 2 ไม่เลยจุดเริ่ม wave 1'), R('Wave 3 is not the shortest', 'Wave 3 ไม่สั้นที่สุด'), R('Wave 4 does not enter wave 1', 'Wave 4 ไม่เข้าเขต wave 1')], guides:g,
        inval:{ p:E, from:5, txt:R('A move beyond the end of wave 5 means wave 5 is still extending', 'ถ้าราคาไปไกลกว่าปลาย wave 5 แปลว่า wave 5 ยังยืดต่อ') },
        targets:[{ a:E - len * 0.382, b:E - len * 0.618, t:R('Correction zone 38.2–61.8% of 0→5 (also near wave 4: ' + fmt(P[4].p) + ')', 'โซนปรับฐาน 38.2–61.8% ของช่วง 0→5 (ใกล้ wave 4: ' + fmt(P[4].p) + ')') }],
        next:R('A correction (A-B-C) against the whole move is due.', 'คาดว่าจะมีการปรับฐาน (A-B-C) สวนทั้งช่วงที่ผ่านมา') };
    } },
    { id:'impW4', n:5, lab:['0', '1', '2', '3', '4'], test:function(P, d){
      var w = legs(P), s = 38, g = [];
      if(d * (P[2].p - P[0].p) <= 0) return null;
      if(d * (P[3].p - P[1].p) <= 0) return null;
      if(d * (P[4].p - P[1].p) <= 0) return null;
      if(w[2] < w[0] * 0.9) return null;                          // wave 3 must be able to stay not-shortest
      var r2 = w[1] / w[0], r3 = w[2] / w[0], r4 = w[3] / w[2];
      s += 10 * close(r2, 0.59, 0.3) + 14 * Math.max(close(r3, 1.618, 0.45), close(r3, 2.618, 0.6)) + 10 * close(r4, 0.382, 0.22);
      if(Math.abs(r2 - r4) > 0.15){ s += 5; g.push(R('Alternation between wave 2 and wave 4', 'มี Alternation ระหว่าง wave 2 กับ wave 4')); }
      g.push(R('Wave 4 retraced ' + Math.round(r4 * 100) + '% of wave 3', 'Wave 4 ย่อ ' + Math.round(r4 * 100) + '% ของ wave 3'));
      var b = P[4].p, t1 = b + d * w[0], t2 = b + d * 0.618 * Math.abs(P[3].p - P[0].p), cap = b + d * w[2];
      return { score:s, rules:[R('Wave 2 stays above the start of wave 1', 'Wave 2 ไม่เลยจุดเริ่ม wave 1'), R('Wave 3 went beyond wave 1', 'Wave 3 ไปไกลกว่า wave 1'), R('Wave 4 stays out of wave 1', 'Wave 4 ไม่เข้าเขต wave 1')], guides:g,
        inval:{ p:P[1].p, from:1, txt:R('Wave 4 may not enter wave 1 — a break of the wave 1 end kills this count', 'Wave 4 ห้ามเข้าเขต wave 1 — ถ้าหลุดปลาย wave 1 การนับนี้ผิด') },
        targets:[{ a:t1, b:t2, t:R('Wave 5 = wave 1 (' + fmt(t1) + ') to 0.618 × (0→3) (' + fmt(t2) + ')', 'Wave 5 = wave 1 (' + fmt(t1) + ') ถึง 0.618 × (0→3) (' + fmt(t2) + ')') }],
        next:R('One more push in the trend direction (wave 5). It must not be longer than wave 3 if wave 1 is shorter than wave 3 (' + fmt(cap) + ').', 'อีกหนึ่งแรงส่งตามเทรนด์ (wave 5) และ wave 5 ไม่ควรยาวกว่า wave 3 (' + fmt(cap) + ')') };
    } },
    { id:'impW3', n:4, lab:['0', '1', '2', '3?'], liveOnly:true, test:function(P, d){
      var w = legs(P), s = 34, g = [];
      if(d * (P[2].p - P[0].p) <= 0) return null;
      if(d * (P[3].p - P[1].p) <= 0) return null;
      var r2 = w[1] / w[0], r3 = w[2] / w[0];
      s += 12 * close(r2, 0.59, 0.3) + (r3 < 1.618 ? 8 : 4);
      g.push(R('Wave 2 retraced ' + Math.round(r2 * 100) + '% of wave 1', 'Wave 2 ย่อ ' + Math.round(r2 * 100) + '% ของ wave 1'));
      var b = P[2].p, t1 = b + d * 1.618 * w[0], t2 = b + d * 2.618 * w[0];
      return { score:s, rules:[R('Wave 2 stays above the start of wave 1', 'Wave 2 ไม่เลยจุดเริ่ม wave 1'), R('Wave 3 already beyond wave 1', 'Wave 3 ไปไกลกว่า wave 1 แล้ว')], guides:g,
        inval:{ p:P[0].p, from:0, txt:R('A fall back below the start of wave 1 ends this count', 'ถ้าหลุดจุดเริ่ม wave 1 การนับนี้จบ') },
        targets:[{ a:t1, b:t2, t:R('Wave 3 = 1.618 × wave 1 (' + fmt(t1) + ') to 2.618 × (' + fmt(t2) + ')', 'Wave 3 = 1.618 × wave 1 (' + fmt(t1) + ') ถึง 2.618 × (' + fmt(t2) + ')') }],
        next:R('Wave 3 usually runs the farthest; then a shallower wave 4.', 'Wave 3 มักไปไกลที่สุด แล้วตามด้วย wave 4 ที่ตื้นกว่า wave 2') };
    } },
    { id:'impW2', n:3, lab:['0', '1', '2'], test:function(P, d){
      var w = legs(P), s = 30, g = [];
      if(d * (P[2].p - P[0].p) <= 0) return null;
      var r2 = w[1] / w[0];
      s += 14 * close(r2, 0.59, 0.25);
      g.push(R('Wave 2 retraced ' + Math.round(r2 * 100) + '% of wave 1', 'Wave 2 ย่อ ' + Math.round(r2 * 100) + '% ของ wave 1'));
      var b = P[2].p, t1 = b + d * w[0], t2 = b + d * 1.618 * w[0];
      return { score:s, rules:[R('Wave 2 stays above the start of wave 1', 'Wave 2 ไม่เลยจุดเริ่ม wave 1')], guides:g,
        inval:{ p:P[0].p, from:0, txt:R('Wave 2 may never go beyond the start of wave 1', 'Wave 2 ห้ามเลยจุดเริ่มของ wave 1') },
        targets:[{ a:t1, b:t2, t:R('Wave 3 ≥ 1.0–1.618 × wave 1 (' + fmt(t1) + ' – ' + fmt(t2) + ')', 'Wave 3 ≥ 1.0–1.618 × wave 1 (' + fmt(t1) + ' – ' + fmt(t2) + ')') }],
        next:R('If wave 3 starts, it should be the strongest leg.', 'ถ้า wave 3 เริ่ม มักเป็นขาที่แรงที่สุด') };
    } },
    { id:'zzDone', n:4, lab:['', 'A', 'B', 'C'], corr:true, test:function(P, d){
      var w = legs(P), s = 36, g = [];
      if(d * (P[2].p - P[0].p) <= 0) return null;                  // B beyond start of A
      if(d * (P[3].p - P[1].p) <= 0) return null;                  // C must go beyond A
      var rb = w[1] / w[0], rc = w[2] / w[0];
      if(rb > 0.9) return null;
      s += 10 * close(rb, 0.55, 0.3) + 14 * Math.max(close(rc, 1, 0.25), close(rc, 1.618, 0.35), close(rc, 0.618, 0.15) * 0.7);
      g.push(R('C = ' + rc.toFixed(2) + ' × A', 'C = ' + rc.toFixed(2) + ' × A'));
      var C = P[3].p, len = P[0].p - C;
      return { score:s, rules:[R('B stays inside A (does not pass its start)', 'B ไม่เลยจุดเริ่ม A'), R('C goes beyond the end of A', 'C ไปไกลกว่าปลาย A')], guides:g,
        inval:{ p:C, from:3, txt:R('A new extreme beyond C means the correction is extending (double zigzag or flat)', 'ถ้าราคาไปไกลกว่าปลาย C แปลว่าการปรับฐานยังไม่จบ (อาจเป็น Double Zigzag หรือ Flat)') },
        targets:[{ a:C + len * 0.618, b:C + len, t:R('Back toward the start of A: 61.8–100% (' + fmt(C + len * 0.618) + ' – ' + fmt(P[0].p) + ')', 'ย้อนกลับไปทางจุดเริ่ม A: 61.8–100% (' + fmt(C + len * 0.618) + ' – ' + fmt(P[0].p) + ')') }],
        next:R('The larger trend (opposite to A-B-C) should resume.', 'เทรนด์ใหญ่ (ทิศตรงข้าม A-B-C) น่าจะกลับมา') };
    } },
    { id:'zzC', n:3, lab:['', 'A', 'B'], corr:true, test:function(P, d){
      var w = legs(P), s = 30, g = [];
      if(d * (P[2].p - P[0].p) <= 0) return null;
      var rb = w[1] / w[0];
      if(rb > 0.9) return null;
      s += 12 * close(rb, 0.55, 0.3);
      g.push(R('B retraced ' + Math.round(rb * 100) + '% of A', 'B ย่อ ' + Math.round(rb * 100) + '% ของ A'));
      var B = P[2].p, t1 = B + d * 0.618 * w[0] * 1, t2 = B + d * w[0], t3 = B + d * 1.618 * w[0];
      return { score:s, rules:[R('B stays inside A', 'B ไม่เลยจุดเริ่ม A')], guides:g,
        inval:{ p:P[0].p, from:0, txt:R('B may not go beyond the start of A', 'B ห้ามเลยจุดเริ่มของ A') },
        targets:[{ a:t2, b:t3, t:R('C = A (' + fmt(t2) + ') to 1.618 × A (' + fmt(t3) + ')', 'C = A (' + fmt(t2) + ') ถึง 1.618 × A (' + fmt(t3) + ')') }],
        next:R('Wave C is a five in the direction of A.', 'Wave C เป็น 5 คลื่นไปทางเดียวกับ A') };
    } },
    { id:'flatDone', n:4, lab:['', 'A', 'B', 'C'], corr:true, test:function(P, d){
      var w = legs(P), s = 32, g = [];
      var rb = w[1] / w[0], rc = w[2] / w[0];
      if(rb < 0.9 || rb > 1.45) return null;
      if(rc < 0.85) return null;
      s += 10 * close(rb, 1.0, 0.25) + 10 * Math.max(close(rc, 1, 0.2), close(rc, 1.618, 0.3));
      g.push(R('B retraced ' + Math.round(rb * 100) + '% of A' + (rb > 1 ? ' (expanded flat)' : ''), 'B ย่อ ' + Math.round(rb * 100) + '% ของ A' + (rb > 1 ? ' (Expanded Flat)' : '')));
      var C = P[3].p, len = P[2].p - C;
      return { score:s, rules:[R('B retraced at least ~90% of A', 'B ย่ออย่างน้อยราว 90% ของ A')], guides:g,
        inval:{ p:C, from:3, txt:R('A new extreme beyond C means the correction continues', 'ถ้าไปไกลกว่าปลาย C แปลว่ายังปรับฐานต่อ') },
        targets:[{ a:C + len * 0.618, b:C + len, t:R('Back toward the end of B: 61.8–100%', 'ย้อนกลับไปทางปลาย B: 61.8–100%') }],
        next:R('The larger trend should resume.', 'เทรนด์ใหญ่น่าจะกลับมา') };
    } }
  ];
  function analyse(c, sizeMul){
    var rets = []; for(var i = 1; i < c.length; i++) rets.push(Math.log(c[i] / c[i - 1]));
    var th = Math.max(0.012, Math.min(0.35, stdev(rets) * Math.sqrt(20) * sizeMul));
    var piv = zigzag(c, th), out = [];
    var trend = c[c.length - 1] > c[Math.max(0, c.length - 200)] ? 1 : -1;
    TPL.forEach(function(t){
      if(piv.length < t.n) return;
      var P = piv.slice(piv.length - t.n);
      if(t.liveOnly && !P[P.length - 1].live) return;
      var d = P[1].p > P[0].p ? 1 : -1;
      var r = t.test(P, d);
      if(!r) return;
      // context: impulses with the larger trend, corrections against it
      var dir = d;
      if((t.corr && dir !== trend) || (!t.corr && dir === trend)) r.score += 6;
      r.id = t.id; r.P = P; r.lab = t.lab; r.d = d;
      out.push(r);
    });
    out.sort(function(a, b){ return b.score - a.score; });
    out = out.slice(0, 3);
    var sum = 0; out.forEach(function(r){ r.w = Math.exp(r.score / 9); sum += r.w; });
    out.forEach(function(r){ r.pct = Math.round(r.w / sum * 100); });
    return { th:th, piv:piv, cands:out };
  }

  /* ------------------------------------------------------------ chart */
  function chartSVG(c, dates, A, k){
    var W = 980, H = 440, pl = 12, pr = 150, pt = 24, pb = 30, n = c.length, cand = A.cands[k];
    var lo = Math.min.apply(null, c), hi = Math.max.apply(null, c);
    if(cand){
      cand.targets.forEach(function(t){ lo = Math.min(lo, t.a, t.b); hi = Math.max(hi, t.a, t.b); });
      lo = Math.min(lo, cand.inval.p); hi = Math.max(hi, cand.inval.p);
    }
    var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    function X(i){ return pl + (W - pl - pr) * i / (n - 1); }
    function Y(p){ return pt + (H - pt - pb) * (1 - (p - lo) / (hi - lo)); }
    var s = '', i;
    for(i = 0; i <= 4; i++){ var gp = lo + (hi - lo) * i / 4; s += '<path d="M' + pl + ' ' + Y(gp).toFixed(1) + 'H' + (W - pr + 60) + '" class="aw-grid"/><text x="' + (W - 4) + '" y="' + (Y(gp) + 4).toFixed(1) + '" class="aw-ax">' + fmt(gp) + '</text>'; }
    var d = 'M' + c.map(function(v, j){ return X(j).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' L');
    s += '<path d="' + d + ' L' + X(n - 1).toFixed(1) + ' ' + (H - pb) + ' L' + X(0) + ' ' + (H - pb) + 'Z" class="aw-area"/><path d="' + d + '" class="aw-line"/>';
    A.piv.forEach(function(p){ s += '<circle cx="' + X(p.i).toFixed(1) + '" cy="' + Y(p.p).toFixed(1) + '" r="2.4" class="aw-piv"/>'; });
    if(cand){
      var xr = X(n - 1);
      cand.targets.forEach(function(t){
        var y1 = Y(Math.max(t.a, t.b)), y2 = Y(Math.min(t.a, t.b));
        s += '<rect x="' + xr.toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + (W - xr - 8).toFixed(1) + '" height="' + Math.max(3, y2 - y1).toFixed(1) + '" rx="4" class="aw-tgt"/>' +
          '<text x="' + (xr + 8).toFixed(1) + '" y="' + (y1 - 5).toFixed(1) + '" class="aw-tgtt">' + fmt(t.a) + ' – ' + fmt(t.b) + '</text>';
      });
      var ix = X(cand.P[cand.inval.from].i);
      s += '<path d="M' + ix.toFixed(1) + ' ' + Y(cand.inval.p).toFixed(1) + 'H' + (W - 8) + '" class="aw-inv"/><text x="' + (W - 10) + '" y="' + (Y(cand.inval.p) - 6).toFixed(1) + '" class="aw-invt">' + esc(T(U.invShort)) + ' ' + fmt(cand.inval.p) + '</text>';
      s += '<path d="M' + cand.P.map(function(p){ return X(p.i).toFixed(1) + ' ' + Y(p.p).toFixed(1); }).join(' L') + '" class="aw-skel"/>';
      cand.P.forEach(function(p, j){
        var lab = cand.lab[j]; if(!lab) return;
        var prev = j ? cand.P[j - 1].p : (cand.P[1].p < p.p ? -Infinity : Infinity), up = p.p >= prev;
        s += '<circle cx="' + X(p.i).toFixed(1) + '" cy="' + Y(p.p).toFixed(1) + '" r="5" class="aw-cp"/><text x="' + X(p.i).toFixed(1) + '" y="' + (Y(p.p) + (up ? -12 : 22)).toFixed(1) + '" class="aw-lab">' + lab + '</text>';
      });
    }
    s += '<circle cx="' + X(n - 1).toFixed(1) + '" cy="' + Y(c[n - 1]).toFixed(1) + '" r="4" class="aw-last"/>';
    s += '<text x="' + pl + '" y="' + (H - 8) + '" class="aw-ax aw-axl">' + esc(dates[0]) + '</text><text x="' + (W - pr) + '" y="' + (H - 8) + '" class="aw-ax" text-anchor="end">' + esc(dates[n - 1]) + '</text>';
    return '<svg class="aw-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' + s + '</svg>';
  }

  /* ------------------------------------------------------------ page */
  var st = { sym:lsGet('spz.aw.sym') || 'SPY', tf:lsGet('spz.aw.tf') || 'tf2', size:lsGet('spz.aw.size') || 'M', k:0, busy:false, err:'', data:null, res:null };
  var sec = null;
  var SIZE = { S:0.6, M:1.0, L:1.8 };
  /* local first: data/market.json already carries ~2 years of daily closes for 550+ stocks
     (same origin, always available); anything else (gold futures, crypto, indexes) goes
     through the live proxy. */
  function localSeries(sym, tf){
    var snap = null; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var S = snap && snap.stocks; if(!S) return null;
    var key = S[sym] ? sym : null;
    if(!key){ for(var k in S){ if(S[k] && (S[k].yahoo === sym || (S[k].yahoo || '').toUpperCase() === sym)) { key = k; break; } } }
    if(!key && /\.BK$/.test(sym) && S[sym.replace(/\.BK$/, '')]) key = sym.replace(/\.BK$/, '');
    if(!key || !S[key].c) return null;
    var c = String(S[key].c).split(',').map(Number).filter(function(x){ return x > 0; });
    var cal = (snap.charts && snap.charts.cal && snap.charts.cal[S[key].cal || 'us']) || '';
    var days = cal ? String(cal).split(',') : [];
    var dates = c.map(function(_, i){ return days[days.length - c.length + i] || ''; });
    var take = tf === 'tf1' ? 126 : tf === 'tf2' ? 252 : c.length;
    c = c.slice(-take); dates = dates.slice(-take);
    if(tf === 'tf3' || tf === 'tf4'){ var cw = [], dw = []; for(var i = c.length - 1; i >= 0; i -= 5){ cw.unshift(c[i]); dw.unshift(dates[i]); } c = cw; dates = dw; }
    return c.length >= 30 ? { sym:key + (S[key].yahoo && S[key].yahoo !== key ? ' (' + S[key].yahoo + ')' : ''), c:c, dates:dates, local:true } : null;
  }
  function run(){
    var live = window.__SPZ_LIVE;
    st.err = ''; st.busy = true; st.res = null; paint();
    var tf = TFS[st.tf] || TFS.tf2, sym = st.sym.trim().toUpperCase();
    lsSet('spz.aw.sym', sym); lsSet('spz.aw.tf', st.tf); lsSet('spz.aw.size', st.size);
    var loc = st.tf !== 'tf4' ? localSeries(sym, st.tf) : null;
    if(loc){ st.data = loc; compute(); st.busy = false; paint(); return; }
    if(!live || !live.historyOfRaw){ st.busy = false; st.err = 'fail'; paint(); return; }
    live.historyOfRaw(sym, tf[0], tf[1]).then(function(rows){
      var c = [], dates = [];
      rows.forEach(function(r){ if(typeof r.c === 'number' && r.c > 0){ c.push(r.c); dates.push(new Date(r.t).toISOString().slice(0, 10)); } });
      if(c.length < 30) throw new Error('short');
      st.data = { sym:sym, c:c, dates:dates }; compute(); st.busy = false; paint();
    }).catch(function(){
      var fb = localSeries(sym, 'tf3');
      if(fb){ st.data = fb; compute(); st.busy = false; paint(); return; }
      st.busy = false; st.err = 'fail'; paint();
    });
  }
  function compute(){ if(!st.data) return; st.res = analyse(st.data.c, SIZE[st.size] || 1); st.k = 0; }
  function paint(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-aw="' + k + '"]'); };
    q('eb').textContent = T(U.eb); q('h').textContent = T(U.h); q('lede').textContent = T(U.lede);
    var body = q('body');
    if(document.activeElement && body.contains(document.activeElement) && document.activeElement.tagName === 'INPUT' && !st.force) { /* keep typing */ }
    st.force = false;
    var h = '<div class="aw-ctl"><label class="aw-f"><span>' + esc(T(U.sym)) + '</span><input type="text" data-aw-sym value="' + esc(st.sym) + '" spellcheck="false" autocomplete="off"></label>' +
      '<label class="aw-f"><span>' + esc(T(U.tf)) + '</span><select data-aw-tf>' + Object.keys(TFS).map(function(k){ return '<option value="' + k + '"' + (k === st.tf ? ' selected' : '') + '>' + esc(T(U[k])) + '</option>'; }).join('') + '</select></label>' +
      '<div class="aw-f"><span>' + esc(T(U.size)) + '</span><div class="aw-seg">' + ['S', 'M', 'L'].map(function(k){ return '<button type="button" data-aw-size="' + k + '" class="' + (st.size === k ? 'on' : '') + '">' + esc(T(U['s' + k])) + '</button>'; }).join('') + '</div></div>' +
      '<button type="button" class="aw-go" data-aw-go>' + esc(T(U.go)) + '</button></div>' +
      '<div class="aw-quick">' + QUICK.map(function(s){ return '<button type="button" data-aw-q="' + s + '"' + (s === st.sym ? ' class="on"' : '') + '>' + s + '</button>'; }).join('') + '</div>' +
      '<p class="aw-beta">' + esc(T(U.beta)) + '</p>';
    if(st.busy) h += '<div class="aw-empty">' + esc(T(U.loading)) + '</div>';
    else if(st.err) h += '<div class="aw-empty bad">' + esc(T(U.fail)) + '</div>';
    else if(st.res){
      var R0 = st.res, c = R0.cands;
      h += '<div class="aw-head"><b>' + esc(st.data.sym) + '</b><span>' + esc(T(U.last)) + ' ' + fmt(st.data.c[st.data.c.length - 1]) + ' · ' + R0.piv.length + ' ' + esc(T(U.pivots)) + ' · ' + (R0.th * 100).toFixed(1) + '%</span></div>';
      if(!c.length) h += '<div class="aw-empty">' + esc(T(U.none)) + '</div>' + '<div class="aw-chart">' + chartSVG(st.data.c, st.data.dates, R0, -1) + '</div>';
      else {
        h += '<div class="aw-tabs">' + c.map(function(r, i){ return '<button type="button" data-aw-k="' + i + '" class="' + (i === st.k ? 'on' : '') + '"><span>' + esc(T(U.cand)) + ' ' + (i + 1) + '</span><b>' + r.pct + '%</b><em>' + esc(T(NAMES[r.id])) + '</em><i style="width:' + r.pct + '%"></i></button>'; }).join('') + '</div>';
        var r = c[st.k];
        h += '<div class="aw-grid2"><div class="aw-chart">' + chartSVG(st.data.c, st.data.dates, R0, st.k) + '<p class="aw-lg">' + esc(T(U.legend)) + '</p></div>' +
          '<div class="aw-side"><div class="aw-card"><span>' + esc(T(U.status)) + '</span><b>' + esc(T(NAMES[r.id])) + '</b><p>' + esc(T(r.next)) + '</p></div>' +
          '<div class="aw-card inv"><span>' + esc(T(U.inval)) + '</span><b>' + fmt(r.inval.p) + '</b><p>' + esc(T(r.inval.txt)) + '</p></div>' +
          '<div class="aw-card tgt"><span>' + esc(T(U.tgt)) + '</span>' + r.targets.map(function(t){ return '<b>' + fmt(t.a) + ' – ' + fmt(t.b) + '</b><p>' + esc(T(t.t)) + '</p>'; }).join('') + '</div>' +
          '<div class="aw-card"><span>' + esc(T(U.rules)) + '</span><ul>' + r.rules.map(function(x){ return '<li class="ok">' + esc(T(x)) + '</li>'; }).join('') + '</ul><span>' + esc(T(U.guide)) + '</span><ul>' + r.guides.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul></div></div></div>';
      }
    }
    body.innerHTML = h;
  }
  function wire(){
    sec.addEventListener('click', function(ev){
      var t = ev.target, b;
      if((b = t.closest('[data-aw-q]'))){ st.sym = b.getAttribute('data-aw-q'); run(); return; }
      if((b = t.closest('[data-aw-size]'))){ st.size = b.getAttribute('data-aw-size'); lsSet('spz.aw.size', st.size); if(st.data){ compute(); } st.force = true; paint(); return; }
      if((b = t.closest('[data-aw-k]'))){ st.k = +b.getAttribute('data-aw-k'); paint(); return; }
      if(t.closest('[data-aw-go]')){ var i = sec.querySelector('[data-aw-sym]'); if(i) st.sym = i.value || st.sym; run(); }
    });
    sec.addEventListener('change', function(ev){ if(ev.target.hasAttribute('data-aw-tf')){ st.tf = ev.target.value; var i = sec.querySelector('[data-aw-sym]'); if(i) st.sym = i.value || st.sym; run(); } });
    sec.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && ev.target.hasAttribute('data-aw-sym')){ st.sym = ev.target.value || st.sym; run(); } });
  }
  function build(){
    if(document.getElementById('autowave')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'autowave'; sec.setAttribute('data-route', 'autowave');
    sec.innerHTML = '<div class="aw-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-aw="eb"></span></div><h2 data-aw="h"></h2><p class="lede" data-aw="lede"></p><div class="rule"></div></div><div data-aw="body"></div></div>';
    document.body.appendChild(sec);
    window.__spzAddRoute({ id:'autowave', after:'elliott', t:U.h, d:{ en:'Real charts, counted automatically: best counts, invalidation and Fibonacci targets.', th:'นับคลื่นบนกราฟจริงอัตโนมัติ: การนับที่ดีที่สุด จุดยกเลิก และเป้าฟีโบนัชชี' } });
    wire(); paint();
    var started = false;
    function maybeStart(){ if(!started && location.hash === '#/autowave'){ started = true; run(); } }
    window.addEventListener('hashchange', maybeStart); maybeStart();
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  window.__SPZ_AUTOWAVE_ENGINE = { analyse:analyse, zigzag:zigzag };
  function boot(){ var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 400); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1400); });
  else setTimeout(boot, 1400);
})();
