/* ===========================================================================
   MARKET NOW (top of Macro Lab, #/macrolab) -- "What is the market saying
   right now?" A plain-language reading of the live snapshot (data/market.json,
   refreshed every 30 min by the market-data job): US Treasury yields at four
   maturities (3M / 5Y / 10Y / 30Y), how each moved over the last month, the
   shape of the curve, the fear gauge (VIX), the dollar, gold and credit.

   Rules of thumb only -- the same ones taught in intro macro courses -- turned
   into sentences. It never predicts; it describes what the numbers are doing
   and what that usually means. EN + TH. Mounts above the Macro Lab body so the
   lab's own repaint() never wipes it.
   =========================================================================== */
(function(){
  'use strict';
  if (window.__SPZ_MKTNOW) return;
  window.__SPZ_MKTNOW = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }
  function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }
  function sgn(v, d){ return (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(d == null ? 1 : d); }

  var U = {
    eb:   { en:'LIVE READING', th:'อ่านจากตัวเลขจริง' },
    h:    { en:'What is the market saying right now?', th:'ตลาดตอนนี้กำลังบอกอะไร' },
    sub:  { en:'Bond yields, fear, the dollar and gold — read in plain words. Updated about every 30 minutes from the same data as the rest of the site.',
            th:'ผลตอบแทนพันธบัตร ความกลัว ดอลลาร์ และทองคำ แปลเป็นภาษาคน อัปเดตประมาณทุก 30 นาที จากข้อมูลชุดเดียวกับทั้งเว็บ' },
    asof: { en:'Data as of', th:'ข้อมูล ณ' },
    wait: { en:'Waiting for the market snapshot…', th:'กำลังรอข้อมูลตลาด…' },
    moodH:{ en:'Overall mood', th:'อารมณ์ตลาดโดยรวม' },
    on:   { en:'Confident (risk-on)', th:'มั่นใจ (กล้าเสี่ยง)' },
    mix:  { en:'Undecided (mixed)', th:'ลังเล (สัญญาณปนกัน)' },
    off:  { en:'Nervous (risk-off)', th:'กลัว (หนีความเสี่ยง)' },
    onP:  { en:'Most gauges lean toward investors being willing to take risk.', th:'ตัวชี้วัดส่วนใหญ่บอกว่านักลงทุนยังกล้าเสี่ยงอยู่' },
    mixP: { en:'Gauges disagree with each other — the market has not picked a side.', th:'ตัวชี้วัดขัดกันเอง ตลาดยังไม่เลือกข้าง' },
    offP: { en:'Most gauges lean toward investors protecting themselves.', th:'ตัวชี้วัดส่วนใหญ่บอกว่านักลงทุนกำลังป้องกันตัว' },
    whyMood:{ en:'What went into it', th:'คิดจากอะไรบ้าง' },
    ladH: { en:'US Treasury yields — now vs 1 month ago', th:'ผลตอบแทนพันธบัตรรัฐบาลสหรัฐฯ — ตอนนี้ เทียบ 1 เดือนก่อน' },
    now:  { en:'Now', th:'ตอนนี้' },
    ago:  { en:'1 month ago', th:'1 เดือนก่อน' },
    bp:   { en:'bp in 1 month', th:'bp ใน 1 เดือน' },
    bpTip:{ en:'1 bp (basis point) = 0.01 percentage point. +25 bp means 4.00% → 4.25%.', th:'1 bp (เบซิสพอยต์) = 0.01% เช่น +25 bp คือ 4.00% → 4.25%' },
    na:   { en:'not in this snapshot yet', th:'ยังไม่มีในข้อมูลรอบนี้' },
    readH:{ en:'The reading, one sentence at a time', th:'อ่านทีละประโยค' },
    mean: { en:'What it usually means', th:'ปกติแปลว่าอะไร' },
    learnH:{ en:'Short rates vs long rates — why they behave differently', th:'ดอกเบี้ยระยะสั้น กับ ระยะยาว ต่างกันยังไง' },
    disc: { en:'Rules of thumb applied to live numbers, for learning. They describe what the numbers are doing, not what will happen next — not investment advice.',
            th:'เป็นหลักคิดทั่วไปที่ใช้กับตัวเลขจริง เพื่อการเรียนรู้ บอกว่าตัวเลขกำลังทำอะไร ไม่ได้ทำนายอนาคต และไม่ใช่คำแนะนำการลงทุน' },
    m3: { en:'3-month', th:'3 เดือน' }, y5:{ en:'5-year', th:'5 ปี' }, y10:{ en:'10-year', th:'10 ปี' }, y30:{ en:'30-year', th:'30 ปี' },
    shortTag:{ en:'set mostly by the Fed', th:'ธนาคารกลางคุมเป็นหลัก' },
    longTag:{ en:'set mostly by the market', th:'ตลาดเป็นคนกำหนด' }
  };

  var LEARN = [
    { t:{ en:'Short end (3 months – 2 years)', th:'ฝั่งสั้น (3 เดือน – 2 ปี)' },
      p:{ en:'Follows the central bank. If the Fed holds its policy rate at 4%, a 3-month Treasury cannot drift far from 4% — anyone could just roll short loans to the Fed’s rate. So short yields mostly tell you what the market expects the Fed to do over the next few meetings.',
          th:'วิ่งตามธนาคารกลาง ถ้า Fed ตรึงดอกเบี้ยนโยบายไว้ที่ 4% พันธบัตร 3 เดือนก็หนีจาก 4% ไม่ได้ไกล เพราะใครๆ ก็ฝากเงินระยะสั้นที่อัตรานั้นได้ ดังนั้นดอกเบี้ยระยะสั้นบอกเป็นหลักว่า ตลาดคาดว่า Fed จะทำอะไรในการประชุมไม่กี่ครั้งข้างหน้า' } },
    { t:{ en:'Long end (10 – 30 years)', th:'ฝั่งยาว (10 – 30 ปี)' },
      p:{ en:'Nobody controls it directly. It is a vote by buyers and sellers about the next decade: expected inflation, expected growth, and how much extra they demand for locking money away that long (the “term premium”). The Fed can influence it, but not dictate it.',
          th:'ไม่มีใครคุมได้ตรงๆ เป็นการโหวตของคนซื้อคนขายว่า 10 ปีข้างหน้าจะเป็นยังไง: เงินเฟ้อจะสูงไหม เศรษฐกิจจะโตไหม และต้องการผลตอบแทนเพิ่มเท่าไรถึงยอมผูกเงินไว้นานขนาดนั้น (เรียกว่า term premium) Fed มีผลได้ แต่สั่งไม่ได้' } },
    { t:{ en:'Example: the government borrows more', th:'ตัวอย่าง: รัฐบาลสหรัฐฯ กู้เงินเพิ่ม' },
      p:{ en:'To borrow, the Treasury sells more bonds. More bonds to sell means sellers must offer a better deal to find buyers — a higher yield. That pressure lands mostly on the long end, so 10- and 30-year yields can climb even while the Fed leaves short rates unchanged.',
          th:'การกู้คือการขายพันธบัตรเพิ่ม พอมีพันธบัตรให้ขายเยอะขึ้น ผู้ขายต้องเสนอดีลที่ดีขึ้นถึงจะมีคนซื้อ ก็คือให้ผลตอบแทนสูงขึ้น แรงกดดันนี้ตกที่ฝั่งยาวเป็นหลัก ผลตอบแทน 10 และ 30 ปีจึงขึ้นได้ แม้ Fed จะไม่ขยับดอกเบี้ยระยะสั้นเลย' } },
    { t:{ en:'Yield up = bond price down', th:'ผลตอบแทนขึ้น = ราคาพันธบัตรลง' },
      p:{ en:'A bond pays a fixed coupon. If new bonds start paying more, an old bond paying less is only worth buying at a discount — so its price falls. Rising yields hurt people already holding long bonds the most, because they are stuck with the low coupon for longest.',
          th:'พันธบัตรจ่ายดอกเบี้ยคงที่ ถ้าพันธบัตรออกใหม่จ่ายมากกว่า พันธบัตรเก่าที่จ่ายน้อยกว่าก็ต้องขายลดราคาถึงจะมีคนซื้อ ราคาจึงลง คนที่ถือพันธบัตรระยะยาวเจ็บที่สุด เพราะติดดอกเบี้ยต่ำไปนานที่สุด' } },
    { t:{ en:'Why stocks care', th:'ทำไมหุ้นต้องสนใจ' },
      p:{ en:'When a safe Treasury pays 5%, a stock has to promise more to be worth the risk. Higher yields also make borrowing dearer for companies and shrink what future profits are worth today — growth and tech stocks feel this most.',
          th:'ถ้าพันธบัตรรัฐบาลที่แทบไม่มีความเสี่ยงให้ 5% หุ้นก็ต้องให้ได้มากกว่านั้นถึงจะคุ้มเสี่ยง ผลตอบแทนสูงยังทำให้บริษัทกู้แพงขึ้น และทำให้กำไรในอนาคตมีมูลค่าวันนี้น้อยลง หุ้นเติบโตและหุ้นเทคโดนผลกระทบนี้มากที่สุด' } }
  ];

  /* ---------------------------- the numbers ---------------------------- */
  function bpChange(row){
    if (!row || !isNum(row.price) || !isNum(row.m1)) return null;
    var old = row.price / (1 + row.m1 / 100);
    return (row.price - old) * 100;
  }
  function yields(s){
    var m = (s && s.macro) || {};
    var keys = [['us3m','m3',0.25],['us5y','y5',5],['us10y','y10',10],['us30y','y30',30]];
    return keys.map(function(k){
      var r = m[k[0]];
      var now = r && isNum(r.price) ? r.price : null;
      var bp = bpChange(r);
      return { k:k[0], lab:U[k[1]], yrs:k[2], now:now, bp:bp, ago: (now != null && bp != null) ? now - bp / 100 : null };
    });
  }

  function readings(s){
    var m = s.macro || {}, g = s.regime || {}, out = [], score = 0, why = [];
    var Y = yields(s), y3 = Y[0], y10 = Y[2], y30 = Y[3];
    var spx1 = m.spx && isNum(m.spx.m1) ? m.spx.m1 : (isNum(g.spy_1m) ? g.spy_1m : null);
    var vix = m.vix && isNum(m.vix.price) ? m.vix.price : (isNum(g.vix) ? g.vix : null);
    var dxy1 = m.dxy && isNum(m.dxy.m1) ? m.dxy.m1 : null;
    var curve = (y10.now != null && y3.now != null) ? y10.now - y3.now : (isNum(g.curve_10y_3m) ? g.curve_10y_3m : null);
    var gold1 = isNum(g.gld_1m) ? g.gld_1m : null;
    var credit1 = isNum(g.credit_1m) ? g.credit_1m : null;
    var breadth = isNum(g.breadth_200) ? g.breadth_200 : null;

    /* 1. long yields x stocks */
    if (y10.bp != null && spx1 != null) {
      var yu = y10.bp >= 15, yd = y10.bp <= -15, su = spx1 >= 1.5, sd = spx1 <= -1.5, r;
      var nums = 'US10Y ' + sgn(y10.bp, 0) + ' bp · S&P 500 ' + sgn(spx1) + '%';
      if (yu && su) r = { tone:'on', h:{ en:'Yields up and stocks up', th:'ดอกเบี้ยขึ้น หุ้นก็ขึ้น' },
        p:{ en:'The “good news” kind of rise: investors expect a stronger economy, so they sell safe bonds (yields go up) and buy stocks.',
            th:'เป็นการขึ้นแบบ "ข่าวดี" นักลงทุนคาดว่าเศรษฐกิจจะแข็งแรง เลยขายพันธบัตรที่ปลอดภัย (ผลตอบแทนเลยขึ้น) แล้วย้ายไปซื้อหุ้น' } };
      else if (yu && sd) r = { tone:'off', h:{ en:'Yields up, stocks down', th:'ดอกเบี้ยขึ้น แต่หุ้นลง' },
        p:{ en:'Rates are squeezing stocks. Bonds now pay enough that money leaves shares for them — often a worry about sticky inflation or heavy government borrowing pushing long yields up.',
            th:'ดอกเบี้ยกำลังกดหุ้น พันธบัตรให้ผลตอบแทนสูงพอจนเงินย้ายออกจากหุ้นไปพันธบัตร มักมาจากความกังวลว่าเงินเฟ้อยังไม่ลง หรือรัฐบาลกู้เยอะจนดันผลตอบแทนระยะยาวขึ้น' } };
      else if (yd && su) r = { tone:'on', h:{ en:'Yields down, stocks up', th:'ดอกเบี้ยลง หุ้นขึ้น' },
        p:{ en:'The friendliest mix for stocks: cheaper money and no panic. The market is pricing easier conditions ahead.',
            th:'ส่วนผสมที่ดีที่สุดสำหรับหุ้น เงินถูกลงและไม่มีใครตกใจ ตลาดกำลังคาดว่าสภาพคล่องจะผ่อนคลายขึ้น' } };
      else if (yd && sd) r = { tone:'off', h:{ en:'Yields down and stocks down', th:'ดอกเบี้ยลง หุ้นก็ลง' },
        p:{ en:'A flight to safety: people sell shares and hide in government bonds, pushing yields down. Usually a fear of slowdown, not a reward for lower rates.',
            th:'เป็นการหนีไปที่ปลอดภัย คนขายหุ้นแล้วไปหลบในพันธบัตรรัฐบาล ทำให้ผลตอบแทนลง มักมาจากความกลัวเศรษฐกิจชะลอ ไม่ใช่เพราะดีใจที่ดอกเบี้ยลง' } };
      else r = { tone:'mix', h:{ en:'Neither yields nor stocks moved much', th:'ทั้งดอกเบี้ยและหุ้นยังไม่ขยับมาก' },
        p:{ en:'No strong message from this pair this month — the tug-of-war between bonds and stocks is roughly even.',
            th:'เดือนนี้คู่นี้ยังไม่ส่งสัญญาณชัด แรงดึงระหว่างพันธบัตรกับหุ้นยังพอๆ กัน' } };
      r.n = nums; out.push(r);
      score += r.tone === 'on' ? 1 : r.tone === 'off' ? -1 : 0;
      why.push(r.tone);
    }

    /* 2. short vs long: who moved more */
    if (y10.bp != null && y3.bp != null) {
      var d10 = y10.bp, d3 = y3.bp, longEnd = (y30.bp != null ? (d10 + y30.bp) / 2 : d10), r2;
      var n2 = '3M ' + sgn(d3, 0) + ' bp · 10Y ' + sgn(d10, 0) + ' bp' + (y30.bp != null ? ' · 30Y ' + sgn(y30.bp, 0) + ' bp' : '');
      if (Math.abs(longEnd) < 8 && Math.abs(d3) < 8) r2 = { tone:'mix', h:{ en:'Short and long rates both steady', th:'ดอกเบี้ยสั้นและยาวนิ่งทั้งคู่' },
        p:{ en:'Neither the Fed outlook nor the long-term vote changed much this month.', th:'ทั้งมุมมองต่อ Fed และการโหวตระยะยาวไม่ค่อยเปลี่ยนในเดือนนี้' } };
      else if (longEnd > d3 && longEnd > 0) r2 = { tone:'off', h:{ en:'The long end is rising faster (bear steepening)', th:'ฝั่งยาวขึ้นเร็วกว่าฝั่งสั้น (bear steepening)' },
        p:{ en:'This move is the market’s, not the Fed’s. Buyers want more to lend for 10–30 years — typical when people worry about inflation staying high or about how much the government must borrow. It is the classic “yields up because the US is borrowing more” picture.',
            th:'การขยับแบบนี้มาจากตลาด ไม่ใช่จาก Fed คนให้กู้ต้องการผลตอบแทนเพิ่มถึงจะยอมให้กู้ 10–30 ปี เกิดบ่อยตอนที่คนกังวลว่าเงินเฟ้อจะค้างสูง หรือรัฐบาลต้องกู้เยอะ เป็นภาพ "ผลตอบแทนขึ้นเพราะสหรัฐฯ กู้เพิ่ม" แบบคลาสสิก' } };
      else if (d3 > longEnd && d3 > 0) r2 = { tone:'off', h:{ en:'The short end is rising faster (bear flattening)', th:'ฝั่งสั้นขึ้นเร็วกว่าฝั่งยาว (bear flattening)' },
        p:{ en:'The market expects the Fed to keep rates high or raise them. Tight money today, while the long end doubts growth will last.',
            th:'ตลาดคาดว่า Fed จะคงดอกเบี้ยสูงหรือขึ้นต่อ เงินตึงตัวตอนนี้ ขณะที่ฝั่งยาวไม่ค่อยเชื่อว่าเศรษฐกิจจะโตได้นาน' } };
      else if (d3 < longEnd && d3 < 0) r2 = { tone:'on', h:{ en:'The short end is falling faster (bull steepening)', th:'ฝั่งสั้นลงเร็วกว่าฝั่งยาว (bull steepening)' },
        p:{ en:'The market is pricing Fed rate cuts. Often good for borrowers and stocks — unless the cuts are expected because something is breaking.',
            th:'ตลาดกำลังคาดว่า Fed จะลดดอกเบี้ย มักดีต่อคนกู้และหุ้น ยกเว้นว่าคาดว่าจะลดเพราะเศรษฐกิจเริ่มมีปัญหา' } };
      else r2 = { tone:'off', h:{ en:'The long end is falling faster (bull flattening)', th:'ฝั่งยาวลงเร็วกว่าฝั่งสั้น (bull flattening)' },
        p:{ en:'Investors are locking in long bonds — a bet that growth and inflation will cool over the coming years.',
            th:'นักลงทุนรีบล็อกพันธบัตรระยะยาว เป็นการเดิมพันว่าเศรษฐกิจและเงินเฟ้อจะเย็นลงในอีกไม่กี่ปีข้างหน้า' } };
      r2.n = n2; out.push(r2);
    }

    /* 3. curve shape */
    if (curve != null) {
      var r3, n3 = '10Y − 3M = ' + sgn(curve, 2) + ' pp';
      if (curve < 0) { r3 = { tone:'off', h:{ en:'The curve is inverted', th:'เส้นผลตอบแทนกลับหัว' },
        p:{ en:'Lending for 3 months pays more than lending for 10 years. It means the market expects rates — and probably the economy — to come down later. Inversions have come before most US recessions, though often a year or more early.',
            th:'ให้กู้ 3 เดือนได้ดอกเบี้ยมากกว่าให้กู้ 10 ปี แปลว่าตลาดคาดว่าดอกเบี้ยและเศรษฐกิจจะชะลอลงในอนาคต เส้นกลับหัวมักเกิดก่อนเศรษฐกิจสหรัฐฯ ถดถอยเกือบทุกครั้ง แต่บ่อยครั้งก็เกิดก่อนเป็นปีหรือนานกว่านั้น' } }; score -= 1; why.push('off'); }
      else if (curve < 0.5) r3 = { tone:'mix', h:{ en:'The curve is nearly flat', th:'เส้นผลตอบแทนเกือบแบน' },
        p:{ en:'Short and long loans pay about the same. The market is unsure whether growth will speed up or slow down.',
            th:'กู้สั้นกับกู้ยาวได้ดอกเบี้ยพอๆ กัน ตลาดยังไม่แน่ใจว่าเศรษฐกิจจะเร่งขึ้นหรือชะลอลง' } };
      else { r3 = { tone:'on', h:{ en:'The curve slopes upward (normal)', th:'เส้นผลตอบแทนชันขึ้น (ปกติ)' },
        p:{ en:'Longer loans pay more, the way it normally works. Nothing in the curve shape is flashing a recession warning right now.',
            th:'ให้กู้ยาวได้ดอกเบี้ยมากกว่า ซึ่งเป็นแบบปกติ ตอนนี้รูปทรงเส้นผลตอบแทนยังไม่เตือนเรื่องเศรษฐกิจถดถอย' } }; score += 1; why.push('on'); }
      r3.n = n3; out.push(r3);
    }

    /* 4. fear gauge */
    if (vix != null) {
      var r4, n4 = 'VIX ' + vix.toFixed(1);
      if (vix < 15) { r4 = { tone:'on', h:{ en:'Fear gauge is low', th:'มาตรวัดความกลัวต่ำ' }, p:{ en:'Options are cheap — traders are not paying up for protection. Calm, sometimes too calm.', th:'คนไม่ค่อยจ่ายเงินซื้อประกันความเสี่ยง ตลาดสงบ บางครั้งก็สงบเกินไป' } }; score += 1; why.push('on'); }
      else if (vix < 20) r4 = { tone:'mix', h:{ en:'Fear gauge is normal', th:'มาตรวัดความกลัวปกติ' }, p:{ en:'Ordinary day-to-day nerves, nothing unusual.', th:'ความกังวลระดับปกติทั่วไป ไม่มีอะไรผิดสังเกต' } };
      else if (vix < 30) { r4 = { tone:'off', h:{ en:'Fear gauge is elevated', th:'มาตรวัดความกลัวสูงขึ้น' }, p:{ en:'Traders are paying for protection. Expect bigger daily swings.', th:'คนเริ่มจ่ายเงินซื้อประกัน คาดได้ว่าราคาจะแกว่งแรงขึ้นในแต่ละวัน' } }; score -= 1; why.push('off'); }
      else { r4 = { tone:'off', h:{ en:'Fear gauge is very high', th:'มาตรวัดความกลัวสูงมาก' }, p:{ en:'Panic-level hedging. Moves are big in both directions.', th:'ระดับตื่นตระหนก ราคาวิ่งแรงทั้งขึ้นและลง' } }; score -= 2; why.push('off'); }
      r4.n = n4; out.push(r4);
    }

    /* 5. dollar */
    if (dxy1 != null) {
      var r5, n5 = 'DXY ' + sgn(dxy1) + '% (1M)';
      if (dxy1 >= 2) { r5 = { tone:'off', h:{ en:'The dollar is strengthening fast', th:'ดอลลาร์แข็งเร็ว' }, p:{ en:'Money is flowing into dollars. That tends to pressure emerging markets (Thailand included), commodities and gold, and makes dollar debts heavier for the rest of the world.', th:'เงินไหลเข้าดอลลาร์ มักกดดันตลาดเกิดใหม่ (รวมไทย) สินค้าโภคภัณฑ์ และทองคำ และทำให้ประเทศอื่นที่มีหนี้เป็นดอลลาร์ต้องจ่ายหนักขึ้น' } }; score -= 1; why.push('off'); }
      else if (dxy1 <= -2) { r5 = { tone:'on', h:{ en:'The dollar is weakening', th:'ดอลลาร์อ่อนค่า' }, p:{ en:'Money is leaving the dollar for other places. Usually a tailwind for emerging markets, commodities and gold.', th:'เงินไหลออกจากดอลลาร์ไปที่อื่น มักเป็นลมส่งให้ตลาดเกิดใหม่ สินค้าโภคภัณฑ์ และทองคำ' } }; score += 1; why.push('on'); }
      else r5 = { tone:'mix', h:{ en:'The dollar is steady', th:'ดอลลาร์ทรงตัว' }, p:{ en:'No big currency story this month.', th:'เดือนนี้ไม่มีเรื่องค่าเงินที่เด่น' } };
      r5.n = n5; out.push(r5);
    }

    /* 6. gold vs yields */
    if (gold1 != null && y10.bp != null) {
      var r6, n6 = 'GLD ' + sgn(gold1) + '% · 10Y ' + sgn(y10.bp, 0) + ' bp';
      if (gold1 >= 3 && y10.bp >= 10) r6 = { tone:'off', h:{ en:'Gold is rising even though yields are rising', th:'ทองขึ้น ทั้งที่ดอกเบี้ยก็ขึ้น' }, p:{ en:'Normally higher yields make gold (which pays nothing) less attractive. When both rise together, people are buying insurance — against inflation, debt worries or a shock.', th:'ปกติดอกเบี้ยสูงทำให้ทอง (ซึ่งไม่ให้ดอกเบี้ย) น่าถือน้อยลง ถ้าขึ้นพร้อมกัน แปลว่าคนกำลังซื้อประกัน กันเงินเฟ้อ กันเรื่องหนี้ หรือกันเหตุช็อก' } };
      else if (gold1 >= 3) r6 = { tone:'mix', h:{ en:'Gold is climbing', th:'ทองกำลังขึ้น' }, p:{ en:'Demand for a safe store of value. Read it together with the dollar and yields above.', th:'มีความต้องการที่เก็บมูลค่าแบบปลอดภัย ควรอ่านคู่กับดอลลาร์และดอกเบี้ยด้านบน' } };
      else if (gold1 <= -3) r6 = { tone:'mix', h:{ en:'Gold is falling', th:'ทองกำลังลง' }, p:{ en:'Less demand for insurance — often when yields or the dollar rise and fear eases.', th:'คนต้องการประกันน้อยลง มักเกิดตอนดอกเบี้ยหรือดอลลาร์ขึ้นและความกลัวลดลง' } };
      else r6 = { tone:'mix', h:{ en:'Gold is quiet', th:'ทองนิ่ง' }, p:{ en:'No strong safe-haven signal from gold this month.', th:'เดือนนี้ทองไม่ได้ส่งสัญญาณหลุมหลบภัยชัดเจน' } };
      r6.n = n6; out.push(r6);
    }

    /* 7. credit */
    if (credit1 != null) {
      var r7, n7 = (L() === 'th' ? 'หุ้นกู้เสี่ยงสูงเทียบพันธบัตรรัฐ ' : 'High-yield vs Treasuries ') + sgn(credit1) + '% (1M)';
      if (credit1 <= -1.5) { r7 = { tone:'off', h:{ en:'Risky company debt is lagging', th:'หุ้นกู้เสี่ยงสูงกำลังแย่กว่า' }, p:{ en:'Lenders are getting pickier about weaker companies — an early stress sign that often shows up before stocks react.', th:'คนให้กู้เริ่มเลือกมากขึ้นกับบริษัทที่อ่อนแอ เป็นสัญญาณตึงเครียดแต่เนิ่นๆ ที่มักโผล่ก่อนหุ้นจะตอบสนอง' } }; score -= 1; why.push('off'); }
      else if (credit1 >= 0.5) { r7 = { tone:'on', h:{ en:'Risky company debt is doing fine', th:'หุ้นกู้เสี่ยงสูงยังไปได้ดี' }, p:{ en:'Lenders are comfortable — no sign of a credit squeeze.', th:'คนให้กู้ยังสบายใจ ยังไม่เห็นภาวะสินเชื่อตึงตัว' } }; score += 1; why.push('on'); }
      else r7 = { tone:'mix', h:{ en:'Credit is calm', th:'ตลาดหุ้นกู้สงบ' }, p:{ en:'Nothing unusual in corporate borrowing costs.', th:'ต้นทุนการกู้ของบริษัทไม่มีอะไรผิดปกติ' } };
      r7.n = n7; out.push(r7);
    }

    if (breadth != null) { if (breadth >= 60) { score += 1; why.push('on'); } else if (breadth <= 40) { score -= 1; why.push('off'); } }
    if (spx1 != null) { if (spx1 >= 2) { score += 1; why.push('on'); } else if (spx1 <= -2) { score -= 1; why.push('off'); } }

    var mood = score >= 2 ? 'on' : score <= -2 ? 'off' : 'mix';
    var cnt = { on:0, off:0, mix:0 }; why.forEach(function(w){ cnt[w]++; });
    return { list:out, mood:mood, score:score, cnt:cnt, Y:Y };
  }

  /* ------------------------------ drawing ------------------------------ */
  function curveSVG(Y){
    var pts = Y.filter(function(y){ return y.now != null; });
    if (pts.length < 2) return '';
    var all = []; pts.forEach(function(y){ all.push(y.now); if (y.ago != null) all.push(y.ago); });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    var pad = Math.max(0.15, (hi - lo) * 0.25); lo -= pad; hi += pad;
    var W = 560, H = 190, X0 = 46, X1 = W - 20, Y0 = 18, Y1 = H - 34;
    function px(yrs){ return X0 + 30 + (Math.log(yrs / 0.25) / Math.log(30 / 0.25)) * (X1 - X0 - 50); }
    function py(v){ return Y1 - (v - lo) / (hi - lo) * (Y1 - Y0); }
    function line(key){
      var p = pts.filter(function(y){ return y[key] != null; });
      return p.map(function(y, i){ return (i ? 'L' : 'M') + px(y.yrs).toFixed(1) + ',' + py(y[key]).toFixed(1); }).join(' ');
    }
    var grid = '', step = (hi - lo) > 2 ? 0.5 : 0.25, v;
    for (v = Math.ceil(lo / step) * step; v <= hi; v += step)
      grid += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + py(v).toFixed(1) + '" y2="' + py(v).toFixed(1) + '" class="mln-gl"/><text x="' + (X0 - 6) + '" y="' + (py(v) + 3.5).toFixed(1) + '" class="mln-gt" text-anchor="end">' + v.toFixed(2) + '%</text>';
    var dots = pts.map(function(y){
      return '<circle cx="' + px(y.yrs).toFixed(1) + '" cy="' + py(y.now).toFixed(1) + '" r="4.5" class="mln-dn"/>' +
        '<text x="' + px(y.yrs).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" class="mln-xt">' + esc(T(y.lab)) + '</text>' +
        '<text x="' + px(y.yrs).toFixed(1) + '" y="' + (py(y.now) - 10).toFixed(1) + '" text-anchor="middle" class="mln-vt">' + y.now.toFixed(2) + '%</text>';
    }).join('');
    return '<svg class="mln-curve" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="yield curve">' + grid +
      '<path d="' + line('ago') + '" class="mln-ago"/><path d="' + line('now') + '" class="mln-now"/>' + dots + '</svg>' +
      '<div class="mln-lg"><span><i class="n"></i>' + esc(T(U.now)) + '</span><span><i class="a"></i>' + esc(T(U.ago)) + '</span></div>';
  }

  function ladderHTML(Y){
    return '<div class="mln-lad">' + Y.map(function(y, i){
      var tag = i === 0 ? U.shortTag : (i >= 2 ? U.longTag : null);
      if (y.now == null) return '<div class="mln-yc na"><b>' + esc(T(y.lab)) + '</b><em>—</em><small>' + esc(T(U.na)) + '</small></div>';
      var cls = y.bp == null ? '' : y.bp >= 5 ? 'up' : y.bp <= -5 ? 'dn' : '';
      return '<div class="mln-yc ' + cls + '"><b>' + esc(T(y.lab)) + '</b><em>' + y.now.toFixed(2) + '%</em>' +
        (y.bp != null ? '<span>' + (y.bp >= 5 ? '▲ ' : y.bp <= -5 ? '▼ ' : '') + sgn(y.bp, 0) + ' ' + esc(T(U.bp)) + '</span>' : '') +
        (tag ? '<small>' + esc(T(tag)) + '</small>' : '') + '</div>';
    }).join('') + '</div><div class="mln-tip">' + esc(T(U.bpTip)) + '</div>';
  }

  function html(){
    var s = snap();
    var head = '<div class="mln-head"><div class="mln-eb"><span class="mln-live"></span>' + esc(T(U.eb)) + '</div>' +
      '<h3>' + esc(T(U.h)) + '</h3><p>' + esc(T(U.sub)) + '</p></div>';
    if (!s || !s.macro) return head + '<div class="mln-wait">' + esc(T(U.wait)) + '</div>';
    var R = readings(s);
    var asof = '';
    if (s.generated_at) { try { var d = new Date(s.generated_at); asof = d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); } catch(e){} }
    var moodTxt = { on:[U.on, U.onP], mix:[U.mix, U.mixP], off:[U.off, U.offP] }[R.mood];
    var pos = Math.max(0, Math.min(100, 50 + R.score * 10));
    var mood = '<div class="mln-mood ' + R.mood + '"><div class="mln-ml">' + esc(T(U.moodH)) + '</div>' +
      '<div class="mln-mv">' + esc(T(moodTxt[0])) + '</div><p>' + esc(T(moodTxt[1])) + '</p>' +
      '<div class="mln-gauge"><i style="left:' + pos + '%"></i></div>' +
      '<div class="mln-gx"><span>' + esc(T(U.off)) + '</span><span>' + esc(T(U.on)) + '</span></div>' +
      '<div class="mln-why">' + esc(T(U.whyMood)) + ': <b class="on">' + R.cnt.on + '</b> ' + (L() === 'th' ? 'ด้านบวก' : 'positive') +
        ' · <b class="off">' + R.cnt.off + '</b> ' + (L() === 'th' ? 'ด้านลบ' : 'negative') + '</div>' +
      (asof ? '<div class="mln-asof">' + esc(T(U.asof)) + ' ' + esc(asof) + '</div>' : '') + '</div>';
    var yl = '<div class="mln-yl"><div class="mln-ml">' + esc(T(U.ladH)) + '</div>' + curveSVG(R.Y) + ladderHTML(R.Y) + '</div>';
    var reads = '<div class="mln-sh">' + esc(T(U.readH)) + '</div><div class="mln-reads">' + R.list.map(function(r, i){
      return '<div class="mln-rd ' + r.tone + '"><div class="mln-rn">' + (i + 1) + '</div><div><h4>' + esc(T(r.h)) + '</h4>' +
        '<div class="mln-nums">' + esc(r.n) + '</div><p><b>' + esc(T(U.mean)) + ':</b> ' + esc(T(r.p)) + '</p></div></div>';
    }).join('') + '</div>';
    var learn = '<details class="mln-learn"><summary>' + esc(T(U.learnH)) + '</summary><div class="mln-lgrid">' +
      LEARN.map(function(x){ return '<div><h5>' + esc(T(x.t)) + '</h5><p>' + esc(T(x.p)) + '</p></div>'; }).join('') + '</div></details>';
    return head + '<div class="mln-top">' + mood + yl + '</div>' + reads + learn + '<div class="mln-disc">' + esc(T(U.disc)) + '</div>';
  }

  var CSS =
  '#mlNow{position:relative;z-index:1;margin:8px 0 46px;padding:24px 22px 20px;border-radius:20px;border:1px solid color-mix(in srgb,var(--neon,#ccff00) 30%,var(--border-dim,rgba(255,255,255,.1)));background:linear-gradient(160deg,rgba(18,22,34,.92),rgba(8,9,14,.92));box-shadow:0 18px 60px rgba(0,0,0,.45);}' +
  '#mlNow .mln-eb{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--neon,#ccff00);}' +
  '#mlNow .mln-live{width:8px;height:8px;border-radius:50%;background:#28cd7d;box-shadow:0 0 0 0 rgba(40,205,125,.6);animation:mlnP 2s infinite;}' +
  '@keyframes mlnP{0%{box-shadow:0 0 0 0 rgba(40,205,125,.55)}70%{box-shadow:0 0 0 9px rgba(40,205,125,0)}100%{box-shadow:0 0 0 0 rgba(40,205,125,0)}}' +
  '#mlNow h3{margin:8px 0 6px;font-size:26px;line-height:1.25;color:var(--white,#fff);}' +
  '#mlNow .mln-head p{margin:0 0 18px;color:var(--grey,#aab);font-size:14px;line-height:1.7;max-width:760px;}' +
  '#mlNow .mln-wait{padding:30px;text-align:center;color:var(--grey-dim,#778);font-family:var(--mono);font-size:12px;}' +
  '#mlNow .mln-top{display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:16px;align-items:stretch;}' +
  '#mlNow .mln-mood,#mlNow .mln-yl{padding:16px;border-radius:16px;border:1px solid var(--border-dim,rgba(255,255,255,.1));background:rgba(255,255,255,.025);min-width:0;}' +
  '#mlNow .mln-ml,#mlNow .mln-sh{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--grey-dim,#778);margin-bottom:8px;}' +
  '#mlNow .mln-mv{font-size:22px;font-weight:800;margin-bottom:4px;}' +
  '#mlNow .mln-mood.on .mln-mv{color:#28cd7d;} #mlNow .mln-mood.off .mln-mv{color:#ff4d5e;} #mlNow .mln-mood.mix .mln-mv{color:#ffc24b;}' +
  '#mlNow .mln-mood p{margin:0 0 14px;font-size:13px;line-height:1.6;color:var(--grey,#aab);}' +
  '#mlNow .mln-gauge{position:relative;height:10px;border-radius:99px;background:linear-gradient(90deg,#ff4d5e,#ffc24b 50%,#28cd7d);}' +
  '#mlNow .mln-gauge i{position:absolute;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#fff;border:3px solid #0b0c12;box-shadow:0 0 0 2px rgba(255,255,255,.35);transition:left .6s;}' +
  '#mlNow .mln-gx{display:flex;justify-content:space-between;margin-top:6px;font-size:10.5px;color:var(--grey-dim,#778);}' +
  '#mlNow .mln-why{margin-top:12px;font-size:12px;color:var(--grey,#aab);} #mlNow .mln-why b.on{color:#28cd7d;} #mlNow .mln-why b.off{color:#ff4d5e;}' +
  '#mlNow .mln-asof{margin-top:8px;font-family:var(--mono);font-size:10.5px;color:var(--grey-dim,#778);}' +
  '#mlNow .mln-curve{width:100%;height:auto;display:block;}' +
  '#mlNow .mln-gl{stroke:rgba(255,255,255,.07);} #mlNow .mln-gt,#mlNow .mln-xt{fill:var(--grey-dim,#778);font-family:var(--mono);font-size:10px;}' +
  '#mlNow .mln-vt{fill:var(--white,#fff);font-family:var(--mono);font-size:11px;font-weight:700;}' +
  '#mlNow .mln-now{fill:none;stroke:var(--neon,#ccff00);stroke-width:2.6;stroke-linejoin:round;}' +
  '#mlNow .mln-ago{fill:none;stroke:rgba(160,170,200,.55);stroke-width:1.8;stroke-dasharray:5 5;}' +
  '#mlNow .mln-dn{fill:#0b0c12;stroke:var(--neon,#ccff00);stroke-width:2.4;}' +
  '#mlNow .mln-lg{display:flex;gap:16px;justify-content:center;font-size:11px;color:var(--grey,#aab);margin:2px 0 10px;}' +
  '#mlNow .mln-lg i{display:inline-block;width:18px;height:0;margin-right:6px;vertical-align:middle;border-top:2.6px solid var(--neon,#ccff00);}' +
  '#mlNow .mln-lg i.a{border-top:2px dashed rgba(160,170,200,.7);}' +
  '#mlNow .mln-lad{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}' +
  '#mlNow .mln-yc{padding:10px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid var(--border-dim,rgba(255,255,255,.08));display:flex;flex-direction:column;gap:3px;min-width:0;}' +
  '#mlNow .mln-yc b{font-size:11px;color:var(--grey,#aab);font-weight:600;} #mlNow .mln-yc em{font-style:normal;font-family:var(--mono);font-size:19px;font-weight:800;color:var(--white,#fff);}' +
  '#mlNow .mln-yc span{font-family:var(--mono);font-size:11px;color:var(--grey,#aab);} #mlNow .mln-yc.up span{color:#ff7a86;} #mlNow .mln-yc.dn span{color:#28cd7d;}' +
  '#mlNow .mln-yc small{font-size:10.5px;color:var(--grey-dim,#778);line-height:1.35;} #mlNow .mln-yc.na em{color:var(--grey-dim,#778);}' +
  '#mlNow .mln-tip{margin-top:8px;font-size:11px;color:var(--grey-dim,#778);}' +
  '#mlNow .mln-sh{margin-top:22px;}' +
  '#mlNow .mln-reads{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;}' +
  '#mlNow .mln-rd{display:flex;gap:12px;padding:14px;border-radius:14px;border:1px solid var(--border-dim,rgba(255,255,255,.08));background:rgba(255,255,255,.02);border-left:3px solid #ffc24b;}' +
  '#mlNow .mln-rd.on{border-left-color:#28cd7d;} #mlNow .mln-rd.off{border-left-color:#ff4d5e;}' +
  '#mlNow .mln-rn{flex:0 0 26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;font-weight:700;background:rgba(255,255,255,.06);color:var(--white,#fff);}' +
  '#mlNow .mln-rd h4{margin:2px 0 4px;font-size:15px;color:var(--white,#fff);}' +
  '#mlNow .mln-nums{font-family:var(--mono);font-size:11px;color:var(--neon,#ccff00);margin-bottom:6px;}' +
  '#mlNow .mln-rd p{margin:0;font-size:13px;line-height:1.7;color:var(--grey,#aab);} #mlNow .mln-rd p b{color:var(--white,#fff);font-weight:600;}' +
  '#mlNow .mln-learn{margin-top:18px;border-radius:14px;border:1px solid var(--border-dim,rgba(255,255,255,.1));background:rgba(79,123,255,.06);}' +
  '#mlNow .mln-learn summary{cursor:pointer;padding:14px 16px;font-weight:700;color:var(--white,#fff);font-size:14.5px;}' +
  '#mlNow .mln-lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;padding:0 16px 16px;}' +
  '#mlNow .mln-lgrid h5{margin:0 0 6px;font-size:13.5px;color:#9db4ff;} #mlNow .mln-lgrid p{margin:0;font-size:13px;line-height:1.7;color:var(--grey,#aab);}' +
  '#mlNow .mln-disc{margin-top:14px;font-size:11.5px;color:var(--grey-dim,#778);line-height:1.6;}' +
  'html[data-theme="light"] #mlNow{background:linear-gradient(160deg,#fff,#f4f6fb);box-shadow:0 12px 40px rgba(0,0,0,.08);}' +
  'html[data-theme="light"] #mlNow .mln-dn{fill:#fff;} html[data-theme="light"] #mlNow .mln-gl{stroke:rgba(0,0,0,.08);}' +
  '@media (max-width:760px){#mlNow{padding:20px 14px 16px;} #mlNow h3{font-size:21px;} #mlNow .mln-top{grid-template-columns:1fr;} #mlNow .mln-lad{grid-template-columns:repeat(2,1fr);} #mlNow .mln-reads{grid-template-columns:1fr;}}';

  var box = null;
  function paint(){ if (box) { var open = box.querySelector('details[open]'); box.innerHTML = html(); if (open) { var d = box.querySelector('details'); if (d) d.open = true; } } }
  function mount(){
    var sec = document.getElementById('macrolab');
    if (!sec) return false;
    var body = sec.querySelector('[data-ml-h="body"]');
    if (!body) return false;
    if (!document.getElementById('mlNowCss')) { var s = document.createElement('style'); s.id = 'mlNowCss'; s.textContent = CSS; document.head.appendChild(s); }
    box = document.createElement('div'); box.id = 'mlNow';
    body.parentNode.insertBefore(box, body);
    paint();
    return true;
  }
  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if (mount() || ++tries > 120) clearInterval(iv); }, 500);
    document.addEventListener('spz:snapshot', function(){ setTimeout(paint, 50); });
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  else setTimeout(boot, 1500);
})();
