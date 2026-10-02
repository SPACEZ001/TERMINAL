
/* ============================================================================
   SPACEZ TERMINAL v7 — WHAT-IF SCENARIO ENGINE + CONTENT CONTROL RAIL
   Self-contained. Reads document.documentElement.lang for EN/TH.
   ========================================================================= */
(function(){
  'use strict';

  /* ---------- 14 CORE METRICS — calc mode ---------- */
  var METRICS = {

  pe:{cat:'val',mode:'calc',unit:'x',dec:1,
    f:'P/E = Price / EPS',
    base:{p:120,e:6},
    vars:[['p',{en:'Price',th:'ราคา'}],['e',{en:'EPS',th:'กำไรต่อหุ้น'}]],
    calc:function(v){ return v.e<=0 ? NaN : v.p/v.e; },
    sc:[
      {t:{en:'Price −50%, earnings unchanged',th:'ราคาร่วง 50% กำไรเท่าเดิม'},v:{p:60},k:'good',
       n:{en:'20x becomes 10x. This is the only version where "cheaper" is real — the business still earns the same, you just pay half. But verify the market is not front-running an earnings collapse.',th:'จาก 20 เท่า เหลือ 10 เท่า นี่คือกรณีเดียวที่ "ถูกลง" เป็นเรื่องจริง เพราะบริษัทยังทำกำไรเท่าเดิม แต่คุณจ่ายครึ่งเดียว อย่างไรก็ตามต้องเช็คว่าตลาดกำลังล่วงหน้าเรื่องกำไรที่กำลังจะพังหรือเปล่า'}},
      {t:{en:'Earnings −50%, price unchanged',th:'กำไรหด 50% ราคาเท่าเดิม'},v:{e:3},k:'bad',
       n:{en:'20x jumps to 40x without the price moving one baht. The stock got twice as expensive while your screen showed nothing. This is how a "hold" quietly turns into an overpay.',th:'จาก 20 เท่า พุ่งเป็น 40 เท่า ทั้งที่ราคาไม่ขยับสักบาท หุ้นแพงขึ้นเท่าตัวโดยที่หน้าจอไม่แสดงอะไรเลย นี่คือวิธีที่การ "ถือเฉยๆ" กลายเป็นการจ่ายแพงเกินแบบเงียบๆ'}},
      {t:{en:'Price −30% AND earnings −40%',th:'ราคาร่วง 30% + กำไรหด 40%'},v:{p:84,e:3.6},k:'bad',
       n:{en:'Price fell, yet P/E rose from 20x to 23.3x. The value trap in one line: a falling price is not a discount if profit falls faster. Always re-run the ratio, never eyeball the chart.',th:'ราคาลง แต่ P/E กลับขึ้นจาก 20 เป็น 23.3 เท่า นี่คือ value trap ในบรรทัดเดียว — ราคาที่ร่วงไม่ใช่ส่วนลด ถ้ากำไรร่วงเร็วกว่า ต้องคำนวณอัตราส่วนใหม่เสมอ อย่าดูแค่กราฟ'}},
      {t:{en:'New shares issued +20% (dilution)',th:'เพิ่มทุนออกหุ้นใหม่ 20% (dilution)'},v:{e:5},k:'warn',
       n:{en:'Total profit is identical, but spread over more shares EPS drops 6.00 → 5.00 and P/E rises to 24x. Dilution is a price increase that never appears on the price chart.',th:'กำไรรวมเท่าเดิมทุกบาท แต่เมื่อหารด้วยจำนวนหุ้นที่มากขึ้น EPS ลดจาก 6.00 เหลือ 5.00 และ P/E ขึ้นเป็น 24 เท่า — dilution คือการขึ้นราคาที่ไม่เคยโผล่บนกราฟราคา'}}
    ],
    play:{en:['Never read P/E alone — pair it with the EPS trend for the last 4 quarters. Falling P/E + falling EPS is a trap, falling P/E + flat EPS is an opportunity.',
              'Use forward P/E (next-year estimate) alongside trailing. Trailing P/E is a rear-view mirror.',
              'Compare only inside the same sector, and against the stock\'s own 5-year P/E band — cheap for a bank is expensive for software.',
              'Watch the share count in every quarterly filing. Rising share count silently inflates P/E.'],
          th:['อย่าอ่าน P/E เดี่ยวๆ ให้ดูคู่กับเทรนด์ EPS ย้อนหลัง 4 ไตรมาส — P/E ลด + EPS ลด คือกับดัก แต่ P/E ลด + EPS ทรงตัว คือโอกาส',
              'ใช้ Forward P/E (ประมาณการปีหน้า) ควบคู่กับ Trailing เพราะ Trailing P/E คือกระจกมองหลัง',
              'เทียบเฉพาะในกลุ่มอุตสาหกรรมเดียวกัน และเทียบกับกรอบ P/E 5 ปีของหุ้นตัวเอง — ถูกสำหรับแบงก์ อาจแพงสำหรับซอฟต์แวร์',
              'ตามดูจำนวนหุ้นในงบทุกไตรมาส จำนวนหุ้นที่เพิ่มขึ้นจะดัน P/E ขึ้นแบบเงียบๆ']}},

  eps:{cat:'qual',mode:'calc',unit:'',dec:2,pre:'',
    f:'EPS = Net Profit / Shares',
    base:{n:900,s:150},
    vars:[['n',{en:'Net profit (M)',th:'กำไรสุทธิ (ล้าน)'}],['s',{en:'Shares (M)',th:'จำนวนหุ้น (ล้าน)'}]],
    calc:function(v){ return v.n/v.s; },
    sc:[
      {t:{en:'Capital raise +30% shares, profit flat',th:'เพิ่มทุน 30% กำไรเท่าเดิม'},v:{s:195},k:'bad',
       n:{en:'EPS falls 6.00 → 4.62 with the business performing exactly as before. Your slice of the same pie got 23% smaller. Every valuation ratio built on EPS deteriorates at the same time.',th:'EPS ลดจาก 6.00 เหลือ 4.62 ทั้งที่ธุรกิจทำได้เท่าเดิมเป๊ะ ชิ้นพายของคุณเล็กลง 23% และทุกอัตราส่วนที่สร้างบน EPS ก็แย่ลงพร้อมกันหมด'}},
      {t:{en:'Buyback −10% shares, profit flat',th:'ซื้อหุ้นคืน 10% กำไรเท่าเดิม'},v:{s:135},k:'warn',
       n:{en:'EPS rises 6.00 → 6.67 without the company selling one extra unit. Growth that comes from the denominator is real for shareholders but it is not operating growth — check whether the buyback was funded by cash or by debt.',th:'EPS ขึ้นจาก 6.00 เป็น 6.67 โดยบริษัทไม่ได้ขายของเพิ่มเลยสักชิ้น การโตที่มาจากตัวหารเป็นเรื่องจริงสำหรับผู้ถือหุ้น แต่ไม่ใช่การโตของธุรกิจ — ต้องเช็คว่าซื้อหุ้นคืนด้วยเงินสดหรือด้วยหนี้'}},
      {t:{en:'One-off asset sale +200M booked as profit',th:'ขายสินทรัพย์ครั้งเดียว +200 ล้าน ลงเป็นกำไร'},v:{n:1100},k:'warn',
       n:{en:'EPS prints 7.33, a 22% "beat". Next year the 200M is gone and EPS falls back to 6.00 — which the market will read as a 18% decline. Low-quality earnings borrow from next year\'s headline.',th:'EPS ออกมา 7.33 ดูเหมือน "ชนะคาด" 22% แต่ปีหน้า 200 ล้านนี้หายไป EPS กลับมา 6.00 ซึ่งตลาดจะอ่านว่าติดลบ 18% — กำไรคุณภาพต่ำคือการยืมพาดหัวของปีหน้ามาใช้'}},
      {t:{en:'Core profit +20%, share count flat',th:'กำไรหลักโต 20% จำนวนหุ้นเท่าเดิม'},v:{n:1080},k:'good',
       n:{en:'EPS 6.00 → 7.20. This is the only clean version: more profit, same slices. If P/E stays constant at 20x, the price mathematically follows to 144.',th:'EPS 6.00 → 7.20 นี่คือเวอร์ชันสะอาดเวอร์ชันเดียว — กำไรมากขึ้น จำนวนชิ้นเท่าเดิม ถ้า P/E คงที่ที่ 20 เท่า ราคาจะตามขึ้นไปที่ 144 โดยอัตโนมัติ'}}
    ],
    play:{en:['Read "diluted EPS", not basic EPS — it already counts convertibles, warrants and options.',
              'Strip one-off items and rebuild EPS from operating profit only, then compare that series year on year.',
              'Track the share count line in the balance sheet every quarter; treat any rise above 3%/yr as a red flag.',
              'A beat driven by a lower share count or a tax credit deserves a lower multiple than one driven by revenue.'],
          th:['ให้อ่าน "EPS ปรับลด (diluted)" ไม่ใช่ EPS พื้นฐาน เพราะรวมหุ้นกู้แปลงสภาพ วอร์แรนต์ และออปชันไว้แล้ว',
              'ตัดรายการพิเศษครั้งเดียวออก แล้วสร้าง EPS ใหม่จากกำไรจากการดำเนินงานล้วนๆ จากนั้นค่อยเทียบปีต่อปี',
              'ตามดูบรรทัดจำนวนหุ้นในงบดุลทุกไตรมาส ถ้าเพิ่มเกิน 3% ต่อปีให้ถือเป็นสัญญาณเตือน',
              'กำไรที่ชนะคาดเพราะหุ้นลดลงหรือเครดิตภาษี ควรได้ multiple ต่ำกว่ากำไรที่ชนะคาดเพราะยอดขาย']}},

  vol:{cat:'flow',mode:'calc',unit:'x',dec:2,
    f:'RelVol = Today / 20-day Avg',
    base:{t:2.4,a:1.0},
    vars:[['t',{en:'Today (M shares)',th:'วันนี้ (ล้านหุ้น)'}],['a',{en:'20d avg (M)',th:'ค่าเฉลี่ย 20 วัน (ล้าน)'}]],
    calc:function(v){ return v.t/v.a; },
    sc:[
      {t:{en:'Breakout on 0.4x volume',th:'เบรกเอาต์บนวอลุ่ม 0.4 เท่า'},v:{t:0.4},k:'bad',
       n:{en:'The price cleared resistance on 40% of normal turnover. Almost nobody participated — a handful of orders pushed a thin book. Most of these round-trip back inside the range within days.',th:'ราคาผ่านแนวต้านด้วยปริมาณเพียง 40% ของปกติ แทบไม่มีใครร่วมวง — แค่ออเดอร์ไม่กี่ไม้ดันหนังสือคำสั่งที่บาง ส่วนใหญ่จะย้อนกลับเข้ากรอบเดิมภายในไม่กี่วัน'}},
      {t:{en:'Breakout on 3.0x volume',th:'เบรกเอาต์บนวอลุ่ม 3.0 เท่า'},v:{t:3.0},k:'good',
       n:{en:'Triple the normal turnover behind the move — institutions had to be involved to absorb that much stock. Volume confirmation is the single cheapest filter against fake breakouts.',th:'ปริมาณสามเท่าของปกติหนุนอยู่หลังการเคลื่อนไหว ต้องมีสถาบันเข้ามาเกี่ยวข้องถึงจะดูดของได้ขนาดนั้น การยืนยันด้วยวอลุ่มคือตัวกรองเบรกเอาต์ปลอมที่ถูกที่สุด'}},
      {t:{en:'Price −8% on 5.0x volume',th:'ราคาลง 8% บนวอลุ่ม 5.0 เท่า'},v:{t:5.0},k:'bad',
       n:{en:'Five times normal turnover on a down day is distribution, not a dip. Large holders are exiting into whoever is buying the discount. Heavy volume points the direction, it does not make it bullish.',th:'ปริมาณห้าเท่าในวันที่ราคาลง คือการระบายของ ไม่ใช่ย่อให้ซื้อ ผู้ถือรายใหญ่กำลังออกใส่คนที่มาช้อนของถูก วอลุ่มหนักบอกทิศทาง ไม่ได้แปลว่าเป็นบวก'}},
      {t:{en:'2.8x spike from index rebalancing',th:'วอลุ่มพุ่ง 2.8 เท่าจากการปรับดัชนี'},v:{t:2.8},k:'warn',
       n:{en:'The number looks identical to genuine conviction but carries zero information about the company. Mechanical flows from index funds evaporate the next session. Always check the news wire before reading intent into a spike.',th:'ตัวเลขดูเหมือนแรงซื้อจริงทุกประการ แต่ไม่ได้บอกอะไรเกี่ยวกับบริษัทเลย กระแสเงินเชิงกลไกจากกองทุนดัชนีจะหายไปในวันถัดไป ต้องเช็คข่าวก่อนเสมอก่อนจะตีความว่าวอลุ่มพุ่งแปลว่าอะไร'}}
    ],
    play:{en:['Set a hard rule: no breakout entry below 1.5x relative volume, no exceptions.',
              'Check the news wire and the index rebalance calendar before treating a spike as conviction.',
              'Read volume together with the close — heavy volume closing near the low is distribution, near the high is accumulation.',
              'For illiquid names, size positions off average daily volume: never take more than 5–10% of ADV.'],
          th:['ตั้งกฎตายตัว: ไม่เข้าเบรกเอาต์ถ้า relative volume ต่ำกว่า 1.5 เท่า ไม่มีข้อยกเว้น',
              'เช็คข่าวและปฏิทินการปรับดัชนีก่อน ก่อนจะเชื่อว่าวอลุ่มที่พุ่งคือแรงซื้อจริง',
              'อ่านวอลุ่มคู่กับราคาปิด — วอลุ่มหนักแล้วปิดใกล้จุดต่ำสุดคือการระบายของ ปิดใกล้จุดสูงสุดคือการสะสม',
              'สำหรับหุ้นสภาพคล่องต่ำ ให้คำนวณขนาดไม้จากวอลุ่มเฉลี่ยต่อวัน อย่าถือเกิน 5–10% ของ ADV']}},

  mcap:{cat:'val',mode:'calc',unit:'M',dec:0,
    f:'Market Cap = Price x Shares',
    base:{p:100,s:150},
    vars:[['p',{en:'Price',th:'ราคา'}],['s',{en:'Shares (M)',th:'จำนวนหุ้น (ล้าน)'}]],
    calc:function(v){ return v.p*v.s; },
    sc:[
      {t:{en:'Price −50% → drops out of mid-cap',th:'ราคาร่วง 50% → หลุดออกจาก mid-cap'},v:{p:50},k:'bad',
       n:{en:'15,000M becomes 7,500M. Below the index threshold, funds tracking that index are forced to sell regardless of fundamentals — a second wave of selling that has nothing to do with the business.',th:'จาก 15,000 ล้าน เหลือ 7,500 ล้าน เมื่อหลุดเกณฑ์ดัชนี กองทุนที่อ้างอิงดัชนีนั้นถูกบังคับให้ขายไม่ว่าพื้นฐานจะเป็นอย่างไร — เกิดคลื่นขายลูกที่สองที่ไม่เกี่ยวกับธุรกิจเลย'}},
      {t:{en:'Capital raise +20% shares at same price',th:'เพิ่มทุน 20% ที่ราคาเดิม'},v:{s:180},k:'warn',
       n:{en:'Market cap rises to 18,000M and the headline looks like growth — but your ownership percentage fell by 17%. Company got bigger, your claim on it got smaller.',th:'มาร์เก็ตแคปขึ้นเป็น 18,000 ล้าน พาดหัวดูเหมือนโต แต่สัดส่วนความเป็นเจ้าของของคุณลดลง 17% — บริษัทใหญ่ขึ้น แต่สิทธิ์ของคุณในบริษัทเล็กลง'}},
      {t:{en:'Price doubles → enters major index',th:'ราคาขึ้น 2 เท่า → เข้าดัชนีหลัก'},v:{p:200},k:'good',
       n:{en:'30,000M crosses the inclusion threshold and passive funds must buy, mechanically, on the effective date. That flow is a one-off — the fundamentals must justify the level after the buying stops.',th:'30,000 ล้านผ่านเกณฑ์เข้าดัชนี กองทุน passive ถูกบังคับให้ซื้อเชิงกลไกในวันมีผล กระแสเงินนี้เกิดครั้งเดียว — หลังแรงซื้อหมด พื้นฐานต้องรองรับระดับราคานั้นให้ได้เอง'}}
    ],
    play:{en:['Track your ownership percentage, not the market cap headline — cap can rise while your slice shrinks.',
              'Know the index inclusion/exclusion thresholds for the names you hold; forced flows are predictable.',
              'Use enterprise value (cap + net debt) when comparing leveraged companies — market cap alone hides the debt.',
              'Smaller cap means wider spreads and thinner books: cut position size as cap falls, don\'t hold it constant.'],
          th:['ตามดูสัดส่วนความเป็นเจ้าของของคุณ ไม่ใช่พาดหัวมาร์เก็ตแคป — แคปโตได้ทั้งที่ชิ้นของคุณเล็กลง',
              'รู้เกณฑ์เข้า-ออกดัชนีของหุ้นที่คุณถือ เพราะแรงซื้อขายที่ถูกบังคับนั้นคาดการณ์ได้',
              'ใช้ Enterprise Value (แคป + หนี้สุทธิ) เวลาเทียบบริษัทที่มีหนี้เยอะ เพราะมาร์เก็ตแคปเดี่ยวๆ ซ่อนหนี้ไว้',
              'แคปเล็กลงแปลว่าสเปรดกว้างขึ้นและหนังสือคำสั่งบางลง ให้ลดขนาดไม้ตามแคปที่ลด อย่าถือขนาดเดิม']}},

  divyld:{cat:'inc',mode:'calc',unit:'%',dec:2,
    f:'Yield = (Dividend / Price) x 100',
    base:{d:4.00,p:100},
    vars:[['d',{en:'Dividend/share',th:'ปันผลต่อหุ้น'}],['p',{en:'Price',th:'ราคา'}]],
    calc:function(v){ return v.d/v.p*100; },
    sc:[
      {t:{en:'Price collapses 100 → 50, dividend unchanged',th:'ราคาร่วง 100 → 50 ปันผลเท่าเดิม'},v:{p:50},k:'bad',
       n:{en:'Yield doubles from 4.00% to 8.00% — and this is the classic yield trap. The company did not pay you one baht more. The percentage rose only because your capital lost half its value. Collecting 4 baht on a 50 baht stock you bought at 100 is a 46% loss, not an 8% income stream.',th:'Yield เด้งจาก 4.00% เป็น 8.00% — และนี่คือกับดักปันผลคลาสสิก บริษัทไม่ได้จ่ายคุณเพิ่มสักบาทเดียว เปอร์เซ็นต์ที่ขึ้นมาเกิดจากเงินต้นคุณหายไปครึ่งหนึ่งล้วนๆ การรับ 4 บาทบนหุ้นราคา 50 ที่คุณซื้อมาที่ 100 คือขาดทุน 46% ไม่ใช่รายได้ 8%'}},
      {t:{en:'Then the dividend is cut in half, price at 50',th:'จากนั้นปันผลถูกตัดครึ่ง ราคาอยู่ที่ 50'},v:{d:2.00,p:50},k:'bad',
       n:{en:'Yield falls straight back to 4.00% — exactly where it started — but you now hold half the capital and half the income. The 8% never existed; it was the market pricing in this cut before it was announced.',th:'Yield กลับลงมาที่ 4.00% พอดี — จุดเดิมเป๊ะ — แต่ตอนนี้คุณเหลือเงินต้นครึ่งเดียวและรายได้ครึ่งเดียว 8% นั้นไม่เคยมีอยู่จริง มันคือตลาดกำลังคิดล่วงหน้าถึงการตัดปันผลครั้งนี้ ก่อนที่จะมีการประกาศ'}},
      {t:{en:'Price doubles 100 → 200, dividend unchanged',th:'ราคาขึ้น 100 → 200 ปันผลเท่าเดิม'},v:{p:200},k:'good',
       n:{en:'Yield halves to 2.00% and the screener now calls it a bad income stock — but your position is up 100%. Yield on cost is still 4%. A falling yield on a rising price is the good outcome, and screeners systematically hide it.',th:'Yield ลดครึ่งเหลือ 2.00% และสกรีนเนอร์จะบอกว่าเป็นหุ้นปันผลที่แย่ — แต่พอร์ตคุณกำไร 100% Yield on cost ของคุณยังเป็น 4% อยู่ Yield ที่ลดเพราะราคาขึ้นคือผลลัพธ์ที่ดี และสกรีนเนอร์ซ่อนเรื่องนี้ไว้อย่างเป็นระบบ'}},
      {t:{en:'Dividend raised 4.00 → 4.80, price unchanged',th:'ขึ้นปันผล 4.00 → 4.80 ราคาเท่าเดิม'},v:{d:4.80},k:'good',
       n:{en:'Yield rises to 4.80% from the numerator, not the denominator. This is the only high yield worth chasing — the cash actually went up. Check the payout ratio still leaves room before celebrating.',th:'Yield ขึ้นเป็น 4.80% จากตัวเศษ ไม่ใช่ตัวส่วน นี่คือ yield สูงแบบเดียวที่ควรไล่ตาม เพราะเงินสดเพิ่มขึ้นจริง แต่ต้องเช็คว่า payout ratio ยังเหลือพื้นที่อยู่ก่อนจะดีใจ'}}
    ],
    play:{en:['Before trusting any yield above ~6%, open the price chart. If the yield rose because the price fell, treat it as a warning, not a bargain.',
              'Check payout ratio and free cash flow cover: a payout above 80% of EPS or above 100% of FCF is a cut waiting to happen.',
              'Read the 5-year dividend history. A company that has held or raised the payout through a downturn is a different animal from one paying a record dividend for the first time.',
              'Track yield on cost (your dividend ÷ your entry price), not the screen yield — that is your actual income rate.',
              'If you own it for income, decide in advance what a dividend cut means: cut announced = position reviewed, not "wait and see".'],
          th:['ก่อนจะเชื่อ yield ที่สูงเกิน ~6% ให้เปิดกราฟราคาดูก่อน ถ้า yield ขึ้นเพราะราคาร่วง ให้ถือเป็นสัญญาณเตือน ไม่ใช่ของถูก',
              'เช็ค payout ratio และความสามารถของกระแสเงินสดอิสระในการจ่าย: payout เกิน 80% ของ EPS หรือเกิน 100% ของ FCF คือการตัดปันผลที่รอวันเกิด',
              'อ่านประวัติปันผลย้อนหลัง 5 ปี บริษัทที่รักษาหรือขึ้นปันผลได้ตลอดช่วงเศรษฐกิจแย่ เป็นคนละสัตว์กับบริษัทที่เพิ่งจ่ายปันผลสูงเป็นครั้งแรก',
              'ติดตาม Yield on cost (ปันผลที่ได้ ÷ ราคาที่คุณซื้อ) ไม่ใช่ yield บนหน้าจอ เพราะนั่นคืออัตรารายได้จริงของคุณ',
              'ถ้าถือเพื่อกินปันผล ให้ตัดสินใจไว้ล่วงหน้าว่าการตัดปันผลแปลว่าอะไร: ประกาศตัด = ทบทวนสถานะทันที ไม่ใช่ "รอดูก่อน"']}},

  roe:{cat:'qual',mode:'calc',unit:'%',dec:1,
    f:'ROE = (Net Profit / Equity) x 100',
    base:{n:900,q:5000},
    vars:[['n',{en:'Net profit (M)',th:'กำไรสุทธิ (ล้าน)'}],['q',{en:'Equity (M)',th:'ส่วนของผู้ถือหุ้น (ล้าน)'}]],
    calc:function(v){ return v.n/v.q*100; },
    sc:[
      {t:{en:'Debt-funded buyback shrinks equity 5,000 → 3,000',th:'กู้เงินมาซื้อหุ้นคืน ส่วนทุนลด 5,000 → 3,000'},v:{q:3000},k:'warn',
       n:{en:'ROE leaps from 18.0% to 30.0% and the company looks world-class — but profit did not move. The improvement came entirely from a smaller denominator funded by borrowing. High ROE built on leverage reverses violently in a downturn.',th:'ROE พุ่งจาก 18.0% เป็น 30.0% บริษัทดูระดับโลกทันที — แต่กำไรไม่ได้ขยับ การปรับตัวดีขึ้นมาจากตัวส่วนที่เล็กลงเพราะการกู้ล้วนๆ ROE สูงที่สร้างจากหนี้จะย้อนกลับมาอย่างรุนแรงตอนเศรษฐกิจแย่'}},
      {t:{en:'Profit −30%, equity unchanged',th:'กำไรหด 30% ส่วนทุนเท่าเดิม'},v:{n:630},k:'bad',
       n:{en:'ROE drops 18.0% → 12.6%. This is the honest signal: the same capital base is now generating a third less return. Falling ROE with flat equity is real deterioration, not accounting noise.',th:'ROE ลดจาก 18.0% เหลือ 12.6% นี่คือสัญญาณที่ซื่อสัตย์ — ฐานทุนเท่าเดิมแต่สร้างผลตอบแทนได้น้อยลงหนึ่งในสาม ROE ที่ลดโดยส่วนทุนคงที่คือการถดถอยจริง ไม่ใช่เสียงรบกวนทางบัญชี'}},
      {t:{en:'Asset write-down cuts equity 20%',th:'ตัดจำหน่ายสินทรัพย์ ส่วนทุนลด 20%'},v:{q:4000},k:'warn',
       n:{en:'ROE improves to 22.5% in the same quarter the company admitted an asset was worthless. Write-downs flatter ROE and P/B simultaneously. A ratio that improves on bad news is a ratio to distrust.',th:'ROE ดีขึ้นเป็น 22.5% ในไตรมาสเดียวกับที่บริษัทยอมรับว่าสินทรัพย์ไร้ค่า การตัดจำหน่ายทำให้ทั้ง ROE และ P/B ดูสวยขึ้นพร้อมกัน อัตราส่วนที่ดีขึ้นเพราะข่าวร้ายคืออัตราส่วนที่ห้ามเชื่อ'}}
    ],
    play:{en:['Always pull ROE apart with DuPont: margin x asset turnover x leverage. If the gain came from leverage, discount it.',
              'Cross-check with ROA (return on assets). ROE high but ROA low = the return is borrowed.',
              'Look for ROE consistently above cost of equity for 5+ years, not one strong year.',
              'Be suspicious of any ratio that improved in the same quarter as a write-down or a buyback.'],
          th:['แยก ROE ด้วยสูตร DuPont เสมอ: อัตรากำไร × การหมุนสินทรัพย์ × อัตราหนี้ ถ้าที่ดีขึ้นมาจากหนี้ ให้หักส่วนลด',
              'เช็คไขว้กับ ROA (ผลตอบแทนต่อสินทรัพย์) ROE สูงแต่ ROA ต่ำ = ผลตอบแทนนั้นมาจากการกู้',
              'มองหา ROE ที่สูงกว่าต้นทุนส่วนทุนต่อเนื่องเกิน 5 ปี ไม่ใช่แค่ปีเดียวที่แข็ง',
              'ระแวงอัตราส่วนใดก็ตามที่ดีขึ้นในไตรมาสเดียวกับที่มีการตัดจำหน่ายหรือซื้อหุ้นคืน']}},

  pb:{cat:'val',mode:'calc',unit:'x',dec:2,
    f:'P/B = Price / Book Value per Share',
    base:{p:100,b:40},
    vars:[['p',{en:'Price',th:'ราคา'}],['b',{en:'Book/share',th:'มูลค่าทางบัญชี/หุ้น'}]],
    calc:function(v){ return v.p/v.b; },
    sc:[
      {t:{en:'Price −50%, book value unchanged',th:'ราคาร่วง 50% มูลค่าทางบัญชีเท่าเดิม'},v:{p:50},k:'good',
       n:{en:'P/B falls 2.50x → 1.25x. You are now paying 1.25 baht for each baht of accounting net worth. Genuine discount — provided the book value is real and not stale property or goodwill.',th:'P/B ลดจาก 2.50 เหลือ 1.25 เท่า ตอนนี้คุณจ่าย 1.25 บาทต่อทุก 1 บาทของมูลค่าสุทธิทางบัญชี เป็นส่วนลดจริง — ถ้ามูลค่าทางบัญชีนั้นเป็นของจริง ไม่ใช่ที่ดินราคาเก่าหรือ goodwill'}},
      {t:{en:'Book written down 40 → 20, price unchanged',th:'ตัดมูลค่าทางบัญชี 40 → 20 ราคาเท่าเดิม'},v:{b:20},k:'bad',
       n:{en:'P/B doubles from 2.50x to 5.00x without the price moving. The company just told you a chunk of its net worth never existed. Book value is an opinion, and it can be revised downwards overnight.',th:'P/B เพิ่มเท่าตัวจาก 2.50 เป็น 5.00 เท่า โดยราคาไม่ขยับ บริษัทเพิ่งบอกคุณว่ามูลค่าสุทธิส่วนหนึ่งไม่เคยมีอยู่จริง มูลค่าทางบัญชีคือความเห็น และถูกปรับลดข้ามคืนได้'}},
      {t:{en:'Price −50% AND book −50%',th:'ราคาร่วง 50% + มูลค่าทางบัญชีลด 50%'},v:{p:50,b:20},k:'bad',
       n:{en:'P/B stays at exactly 2.50x. The stock is 50% cheaper and not one bit better value. This is why "it\'s down 50%, it must be cheap" is not an argument.',th:'P/B ยังอยู่ที่ 2.50 เท่าพอดี หุ้นถูกลง 50% แต่ไม่ได้คุ้มค่าขึ้นแม้แต่นิดเดียว นี่คือเหตุผลที่ประโยค "มันลงมา 50% แล้ว ต้องถูกแล้วสิ" ไม่ใช่เหตุผล'}}
    ],
    play:{en:['Check what book value is made of. Cash and hard assets are real; goodwill and intangibles from acquisitions often are not.',
              'For asset-light businesses (software, services) P/B is close to meaningless — use it mainly on banks, insurers, property and industrials.',
              'Pair P/B with ROE: low P/B + low ROE is usually correct pricing, low P/B + high ROE is where the mispricing lives.',
              'Re-run P/B after every write-down. Never carry forward last quarter\'s book value.'],
          th:['เช็คว่ามูลค่าทางบัญชีประกอบด้วยอะไร เงินสดและสินทรัพย์จับต้องได้คือของจริง แต่ goodwill และสินทรัพย์ไม่มีตัวตนจากการซื้อกิจการมักไม่ใช่',
              'สำหรับธุรกิจที่ใช้สินทรัพย์น้อย (ซอฟต์แวร์ บริการ) P/B แทบไม่มีความหมาย ให้ใช้กับแบงก์ ประกัน อสังหา และอุตสาหกรรมเป็นหลัก',
              'ใช้ P/B คู่กับ ROE: P/B ต่ำ + ROE ต่ำ มักคือราคาที่ถูกต้องแล้ว แต่ P/B ต่ำ + ROE สูง คือจุดที่ตลาดตีราคาผิด',
              'คำนวณ P/B ใหม่ทุกครั้งหลังมีการตัดจำหน่าย อย่ายกมูลค่าทางบัญชีของไตรมาสก่อนมาใช้ต่อ']}},

  de:{cat:'risk',mode:'calc',unit:'',dec:2,
    f:'D/E = Total Debt / Equity',
    base:{d:3000,q:5000},
    vars:[['d',{en:'Debt (M)',th:'หนี้สิน (ล้าน)'}],['q',{en:'Equity (M)',th:'ส่วนของผู้ถือหุ้น (ล้าน)'}]],
    calc:function(v){ return v.d/v.q; },
    sc:[
      {t:{en:'Two loss-making years eat equity 5,000 → 3,000',th:'ขาดทุนสองปีกินส่วนทุน 5,000 → 3,000'},v:{q:3000},k:'bad',
       n:{en:'D/E rises 0.60 → 1.00 without the company borrowing a single baht more. Losses raise leverage through the denominator. This is how a covenant gets breached in a year with no new debt.',th:'D/E ขึ้นจาก 0.60 เป็น 1.00 โดยบริษัทไม่ได้กู้เพิ่มสักบาท ผลขาดทุนทำให้อัตราหนี้สูงขึ้นผ่านตัวส่วน นี่คือวิธีที่เงื่อนไขเงินกู้ถูกละเมิดในปีที่ไม่มีการก่อหนี้ใหม่เลย'}},
      {t:{en:'New borrowing +1,000M for expansion',th:'กู้เพิ่ม 1,000 ล้านเพื่อขยายกิจการ'},v:{d:4000},k:'warn',
       n:{en:'D/E moves 0.60 → 0.80. Not fatal on its own — the question is whether the return on that 1,000M beats its interest cost. Debt used for productive assets differs from debt used to plug a cash hole.',th:'D/E ขยับจาก 0.60 เป็น 0.80 ไม่ถึงตาย — คำถามคือผลตอบแทนจาก 1,000 ล้านนั้นชนะต้นทุนดอกเบี้ยหรือไม่ หนี้ที่ใช้ซื้อสินทรัพย์ที่สร้างรายได้ ต่างจากหนี้ที่ใช้อุดรูรั่วเงินสด'}},
      {t:{en:'Rates rise 3% → 7%, debt unchanged',th:'ดอกเบี้ยขึ้น 3% → 7% หนี้เท่าเดิม'},v:{},k:'bad',
       n:{en:'D/E is frozen at 0.60 and tells you nothing — yet the annual interest bill goes from 90M to 210M, which is 13% of net profit vanishing. The ratio missed the risk entirely; the interest coverage ratio would have caught it.',th:'D/E ค้างอยู่ที่ 0.60 และไม่บอกอะไรเลย — แต่ดอกเบี้ยจ่ายต่อปีขึ้นจาก 90 ล้านเป็น 210 ล้าน เท่ากับ 13% ของกำไรสุทธิหายไป อัตราส่วนนี้พลาดความเสี่ยงไปทั้งดุ้น แต่ Interest Coverage จะจับได้'}}
    ],
    play:{en:['Read D/E next to interest coverage (EBIT ÷ interest expense). Below 3x coverage is where trouble starts.',
              'Check the debt maturity schedule: 3,000M due in five years is a different company from 3,000M due next year.',
              'Prefer net debt (debt − cash). A company with 3,000M debt and 2,500M cash is not leveraged.',
              'Compare against sector norms — utilities and REITs run high D/E by design, software should run near zero.'],
          th:['อ่าน D/E คู่กับ Interest Coverage (EBIT ÷ ดอกเบี้ยจ่าย) ต่ำกว่า 3 เท่าคือจุดที่ปัญหาเริ่ม',
              'เช็คตารางครบกำหนดหนี้: หนี้ 3,000 ล้านที่ครบใน 5 ปี เป็นคนละบริษัทกับ 3,000 ล้านที่ครบปีหน้า',
              'ให้ดูหนี้สุทธิ (หนี้ − เงินสด) บริษัทที่มีหนี้ 3,000 ล้านแต่มีเงินสด 2,500 ล้าน ไม่ได้มีหนี้สูง',
              'เทียบกับค่ามาตรฐานของกลุ่ม — สาธารณูปโภคและ REIT ออกแบบมาให้ D/E สูง ส่วนซอฟต์แวร์ควรใกล้ศูนย์']}},

  margin:{cat:'qual',mode:'calc',unit:'%',dec:1,
    f:'Net Margin = (Net Profit / Revenue) x 100',
    base:{n:900,r:9000},
    vars:[['n',{en:'Net profit (M)',th:'กำไรสุทธิ (ล้าน)'}],['r',{en:'Revenue (M)',th:'รายได้ (ล้าน)'}]],
    calc:function(v){ return v.n/v.r*100; },
    sc:[
      {t:{en:'Input costs rise 5% of revenue, prices held',th:'ต้นทุนขึ้น 5% ของรายได้ ตรึงราคาขาย'},v:{n:450},k:'bad',
       n:{en:'Margin halves 10.0% → 5.0% and net profit halves with it. At a 10% margin, a 5-point cost shock wipes out half the profit. Thin margins have almost no shock absorber.',th:'อัตรากำไรลดครึ่งจาก 10.0% เหลือ 5.0% และกำไรสุทธิลดครึ่งตามไปด้วย ที่อัตรากำไร 10% แรงกระแทกต้นทุนแค่ 5 จุดกวาดกำไรไปครึ่งหนึ่ง อัตรากำไรบางแทบไม่มีกันชนเลย'}},
      {t:{en:'Revenue +20% but margin compresses to 8.3%',th:'รายได้โต 20% แต่อัตรากำไรหดเหลือ 8.3%'},v:{n:900,r:10800},k:'warn',
       n:{en:'Revenue grew 20% and net profit is unchanged at 900M. The company bought growth by discounting. Top-line growth headlines are worthless without the margin line beside them.',th:'รายได้โต 20% แต่กำไรสุทธิเท่าเดิมที่ 900 ล้าน บริษัทซื้อการเติบโตมาด้วยการลดราคา พาดหัวการเติบโตของรายได้ไร้ค่าถ้าไม่มีบรรทัดอัตรากำไรอยู่ข้างๆ'}},
      {t:{en:'Price increase +5%, volume holds',th:'ขึ้นราคาขาย 5% ยอดขายไม่ตก'},v:{n:1350,r:9450},k:'good',
       n:{en:'Margin expands 10.0% → 14.3% and profit jumps 50% on a 5% price move. This is pricing power, the single most valuable trait a business can have — and the reason margin trend matters more than margin level.',th:'อัตรากำไรขยายจาก 10.0% เป็น 14.3% และกำไรพุ่ง 50% จากการขึ้นราคาแค่ 5% นี่คืออำนาจในการตั้งราคา คุณสมบัติที่มีค่าที่สุดของธุรกิจ และเป็นเหตุผลว่าทำไมเทรนด์อัตรากำไรสำคัญกว่าระดับอัตรากำไร'}}
    ],
    play:{en:['Track gross → operating → net margin as a chain. Where the compression happens tells you the cause (input costs, opex bloat, or interest and tax).',
              'Compare margin trend over 8 quarters, not one. One weak quarter is weather; four is climate.',
              'Test pricing power directly: did the company pass through the last cost shock, or absorb it?',
              'Benchmark inside the sector — 4% is excellent for a retailer and alarming for software.'],
          th:['ไล่ดูอัตรากำไรขั้นต้น → จากการดำเนินงาน → สุทธิ เป็นห่วงโซ่ จุดที่หดบอกสาเหตุ (ต้นทุนวัตถุดิบ ค่าใช้จ่ายบวม หรือดอกเบี้ยและภาษี)',
              'เทียบเทรนด์อัตรากำไร 8 ไตรมาส ไม่ใช่ไตรมาสเดียว ไตรมาสแย่หนึ่งครั้งคือดินฟ้าอากาศ สี่ครั้งคือภูมิอากาศ',
              'ทดสอบอำนาจตั้งราคาตรงๆ: ครั้งที่แล้วบริษัทผลักภาระต้นทุนไปให้ลูกค้าได้ หรือรับไว้เอง',
              'เทียบภายในกลุ่มอุตสาหกรรม — 4% คือยอดเยี่ยมสำหรับค้าปลีก แต่น่าตกใจสำหรับซอฟต์แวร์']}},

  fcf:{cat:'qual',mode:'calc',unit:'M',dec:0,
    f:'FCF = Operating Cash Flow − CapEx',
    base:{o:1200,c:500},
    vars:[['o',{en:'Operating CF (M)',th:'กระแสเงินสดดำเนินงาน (ล้าน)'}],['c',{en:'CapEx (M)',th:'เงินลงทุน (ล้าน)'}]],
    calc:function(v){ return v.o-v.c; },
    sc:[
      {t:{en:'Receivables balloon — OCF 1,200 → 700',th:'ลูกหนี้การค้าค้างบาน — OCF 1,200 → 700'},v:{o:700},k:'bad',
       n:{en:'FCF collapses 700M → 200M while reported net profit is completely unchanged. The company booked the sales but never collected the cash. This is the single most reliable early warning in the whole financial statement.',th:'FCF ทรุดจาก 700 ล้านเหลือ 200 ล้าน ทั้งที่กำไรสุทธิที่รายงานไม่เปลี่ยนแม้แต่บาทเดียว บริษัทบันทึกยอดขายแล้วแต่ยังเก็บเงินไม่ได้ นี่คือสัญญาณเตือนล่วงหน้าที่เชื่อถือได้ที่สุดในงบการเงินทั้งเล่ม'}},
      {t:{en:'Capacity expansion — CapEx 500 → 1,100',th:'ขยายกำลังผลิต — CapEx 500 → 1,100'},v:{c:1100},k:'warn',
       n:{en:'FCF drops to 100M, which screens as terrible. But this is investment, not decay — the question is only whether the new capacity earns above the cost of capital. Judge growth CapEx by future return, maintenance CapEx by necessity.',th:'FCF ลดเหลือ 100 ล้าน ซึ่งสกรีนออกมาดูแย่มาก แต่นี่คือการลงทุน ไม่ใช่การเสื่อมถอย — คำถามเดียวคือกำลังผลิตใหม่ให้ผลตอบแทนเหนือต้นทุนเงินทุนหรือไม่ ตัดสิน CapEx เพื่อเติบโตด้วยผลตอบแทนอนาคต ส่วน CapEx บำรุงรักษาด้วยความจำเป็น'}},
      {t:{en:'CapEx slashed to zero to flatter cash flow',th:'ตัด CapEx เหลือศูนย์เพื่อให้กระแสเงินสดสวย'},v:{c:0},k:'bad',
       n:{en:'FCF prints a beautiful 1,200M this year. But maintenance was deferred, not cancelled — the bill arrives in two or three years as an oversized catch-up spend, usually at the worst possible moment.',th:'FCF ออกมาสวยที่ 1,200 ล้านในปีนี้ แต่การบำรุงรักษาถูกเลื่อน ไม่ได้ถูกยกเลิก — บิลจะมาถึงในอีกสองสามปีในรูปของรายจ่ายชดเชยก้อนโต และมักมาในจังหวะที่แย่ที่สุด'}}
    ],
    play:{en:['Compare FCF to net profit every year. If profit consistently exceeds FCF, the earnings are on paper, not in the bank.',
              'Split CapEx into maintenance vs growth (management usually discloses it). Only growth CapEx justifies weak FCF.',
              'Watch the working capital lines — receivables and inventory growing faster than revenue is a cash leak forming.',
              'Value from FCF yield (FCF ÷ market cap), not from earnings yield, for capital-intensive businesses.'],
          th:['เทียบ FCF กับกำไรสุทธิทุกปี ถ้ากำไรสูงกว่า FCF อย่างต่อเนื่อง แปลว่ากำไรอยู่บนกระดาษ ไม่ได้อยู่ในธนาคาร',
              'แยก CapEx เป็นบำรุงรักษากับเพื่อการเติบโต (ผู้บริหารมักเปิดเผยไว้) มีแต่ CapEx เพื่อเติบโตเท่านั้นที่ทำให้ FCF อ่อนแอได้อย่างมีเหตุผล',
              'จับตาบรรทัดเงินทุนหมุนเวียน — ลูกหนี้และสินค้าคงคลังที่โตเร็วกว่ารายได้คือรอยรั่วเงินสดที่กำลังก่อตัว',
              'ประเมินมูลค่าด้วย FCF Yield (FCF ÷ มาร์เก็ตแคป) แทน Earnings Yield สำหรับธุรกิจที่ใช้เงินลงทุนหนัก']}},

  beta:{cat:'risk',mode:'calc',unit:'%',dec:1,sig:true,
    f:'Expected move = Beta x Market move',
    base:{b:1.2,m:10},
    vars:[['b',{en:'Beta',th:'ค่าเบต้า'}],['m',{en:'Market move %',th:'ตลาดขยับ %'}]],
    calc:function(v){ return v.b*v.m; },
    sc:[
      {t:{en:'Market −20% (correction)',th:'ตลาดลง 20% (ย่อตัว)'},v:{m:-20},k:'bad',
       n:{en:'Expected move −24%. On a 1M baht position that is 240,000 baht, not 200,000. Beta above 1 means every market drawdown is amplified before any company-specific news even lands.',th:'คาดว่าจะขยับ −24% บนพอร์ต 1 ล้านบาทคือ 240,000 บาท ไม่ใช่ 200,000 เบต้าเกิน 1 แปลว่าทุกครั้งที่ตลาดย่อ ความเสียหายถูกขยาย ก่อนที่ข่าวเฉพาะตัวบริษัทจะมาถึงด้วยซ้ำ'}},
      {t:{en:'Market +10% (rally)',th:'ตลาดขึ้น 10% (ขาขึ้น)'},v:{m:10},k:'good',
       n:{en:'Expected move +12%. The same leverage that hurts on the way down helps on the way up — which is exactly why beta is not "risk", it is amplification in both directions.',th:'คาดว่าจะขยับ +12% แรงขยายตัวเดียวกันที่ทำร้ายตอนขาลง ก็ช่วยตอนขาขึ้น — นี่คือเหตุผลที่เบต้าไม่ใช่ "ความเสี่ยง" แต่คือการขยายผลทั้งสองทิศทาง'}},
      {t:{en:'Beta re-rates 1.2 → 1.8 in a stress regime',th:'เบต้าเปลี่ยนจาก 1.2 → 1.8 ในภาวะตลาดเครียด'},v:{b:1.8,m:-20},k:'bad',
       n:{en:'Expected move −36%. Beta is not a constant — correlations converge towards 1 in a crisis and high-beta names re-rate higher still. The number you hedged with in calm markets understates the loss in a crash.',th:'คาดว่าจะขยับ −36% เบต้าไม่ใช่ค่าคงที่ — ในภาวะวิกฤตค่าสหสัมพันธ์วิ่งเข้าหา 1 และหุ้นเบต้าสูงจะยิ่งถูกปรับขึ้นไปอีก ตัวเลขที่คุณใช้ป้องกันความเสี่ยงตอนตลาดสงบ จะประเมินความเสียหายตอนตลาดพังต่ำเกินไป'}},
      {t:{en:'Same market fall, but beta 0.6 defensive name',th:'ตลาดลงเท่าเดิม แต่ถือหุ้นตั้งรับเบต้า 0.6'},v:{b:0.6,m:-20},k:'good',
       n:{en:'Expected move −12% instead of −24%. Half the drawdown is not a small edge — it means you need a 13.6% recovery instead of 31.6% to get back to even.',th:'คาดว่าจะขยับ −12% แทนที่จะเป็น −24% การลดความเสียหายลงครึ่งหนึ่งไม่ใช่ความได้เปรียบเล็กๆ เพราะคุณต้องการการฟื้นตัวแค่ 13.6% แทนที่จะเป็น 31.6% เพื่อกลับมาเท่าทุน'}}
    ],
    play:{en:['Compute your portfolio beta (weighted average), not just each stock\'s. That number is your true market exposure.',
              'Size positions by beta-adjusted risk: a 1.8-beta name should hold a smaller weight than a 0.6-beta name for the same risk budget.',
              'Re-measure beta over the last 12 months, not 5 years — it drifts with the business model and the regime.',
              'Beta only describes market risk. It says nothing about a fraud, a debt wall, or a product failure.'],
          th:['คำนวณเบต้าของพอร์ตทั้งพอร์ต (ถ่วงน้ำหนัก) ไม่ใช่แค่รายตัว ตัวเลขนั้นคือความเสี่ยงต่อตลาดที่แท้จริงของคุณ',
              'กำหนดขนาดไม้ตามความเสี่ยงที่ปรับด้วยเบต้า: หุ้นเบต้า 1.8 ควรมีน้ำหนักน้อยกว่าหุ้นเบต้า 0.6 ภายใต้งบความเสี่ยงเท่ากัน',
              'วัดเบต้าใหม่จากข้อมูล 12 เดือนล่าสุด ไม่ใช่ 5 ปี เพราะมันเลื่อนไปตามโมเดลธุรกิจและภาวะตลาด',
              'เบต้าอธิบายเฉพาะความเสี่ยงตลาด ไม่ได้บอกอะไรเลยเรื่องการทุจริต กำแพงหนี้ หรือสินค้าที่ล้มเหลว']}},

  range52:{cat:'val',mode:'calc',unit:'%',dec:0,
    f:'Position = (Price − Low) / (High − Low) x 100',
    base:{p:100,l:60,h:130},
    vars:[['p',{en:'Price',th:'ราคา'}],['l',{en:'52w low',th:'ต่ำสุด 52 สัปดาห์'}],['h',{en:'52w high',th:'สูงสุด 52 สัปดาห์'}]],
    calc:function(v){ return (v.p-v.l)/(v.h-v.l)*100; },
    sc:[
      {t:{en:'Price falls 100 → 65',th:'ราคาร่วง 100 → 65'},v:{p:65},k:'bad',
       n:{en:'Position drops from 57% to 7% of the range. Sitting near the 52-week low is where value investors and falling-knife catchers meet — the number alone cannot tell you which one you are.',th:'ตำแหน่งลดจาก 57% เหลือ 7% ของกรอบ การอยู่ใกล้จุดต่ำสุด 52 สัปดาห์คือจุดที่นักลงทุนเน้นคุณค่ากับคนรับมีดที่กำลังตกมาเจอกัน ตัวเลขนี้อย่างเดียวบอกไม่ได้ว่าคุณเป็นแบบไหน'}},
      {t:{en:'Price flat, but last year\'s high rolls off 130 → 108',th:'ราคานิ่ง แต่จุดสูงสุดปีก่อนหลุดกรอบ 130 → 108'},v:{h:108},k:'warn',
       n:{en:'Position jumps 57% → 83% while the price did not move one satang. The 52-week window is a rolling window — the metric changes as old bars expire. Never treat a rising range position as a rising stock.',th:'ตำแหน่งกระโดดจาก 57% เป็น 83% ทั้งที่ราคาไม่ขยับแม้แต่สตางค์เดียว กรอบ 52 สัปดาห์เป็นกรอบที่เลื่อนไปเรื่อยๆ — ค่าเปลี่ยนเมื่อแท่งเก่าหมดอายุ อย่าตีความว่าตำแหน่งในกรอบที่สูงขึ้นแปลว่าหุ้นกำลังขึ้น'}},
      {t:{en:'New 52-week high at 135',th:'ทำจุดสูงสุดใหม่ 52 สัปดาห์ที่ 135'},v:{p:135,h:135},k:'good',
       n:{en:'Position pins at 100%. Statistically, stocks at new highs have no overhead supply — nobody above is waiting to break even. That is why momentum screens filter for it, and why "too expensive to buy at highs" is often wrong.',th:'ตำแหน่งปักที่ 100% ในเชิงสถิติ หุ้นที่ทำจุดสูงสุดใหม่ไม่มีอุปทานค้างอยู่ข้างบน — ไม่มีใครรอเท่าทุนเหนือราคานี้ นี่คือเหตุผลที่สกรีนโมเมนตัมกรองหาสิ่งนี้ และทำไมประโยค "แพงเกินจะซื้อที่จุดสูงสุด" มักผิด'}}
    ],
    play:{en:['Always look at the raw high and low, not just the percentage — a 57% position means nothing without knowing the range is 60–130.',
              'Remember the window rolls. Recompute rather than reusing last month\'s figure.',
              'Near the low, demand a catalyst before buying; near the high, demand volume confirmation before chasing.',
              'Use the range width as a volatility proxy: a 60–130 range is a very different risk profile from a 95–105 one.'],
          th:['ดูตัวเลขสูงสุดต่ำสุดดิบเสมอ ไม่ใช่แค่เปอร์เซ็นต์ — ตำแหน่ง 57% ไม่มีความหมายถ้าไม่รู้ว่ากรอบคือ 60–130',
              'จำไว้ว่ากรอบนี้เลื่อนไปเรื่อยๆ ให้คำนวณใหม่ อย่าใช้ตัวเลขของเดือนที่แล้วซ้ำ',
              'ใกล้จุดต่ำสุด ต้องมีตัวกระตุ้นก่อนถึงจะซื้อ ใกล้จุดสูงสุด ต้องมีวอลุ่มยืนยันก่อนถึงจะไล่',
              'ใช้ความกว้างของกรอบเป็นตัวแทนความผันผวน: กรอบ 60–130 มีโปรไฟล์ความเสี่ยงต่างจากกรอบ 95–105 มาก']}},

  payout:{cat:'inc',mode:'calc',unit:'%',dec:0,
    f:'Payout = (DPS / EPS) x 100',
    base:{d:4.00,e:6.00},
    vars:[['d',{en:'Dividend/share',th:'ปันผลต่อหุ้น'}],['e',{en:'EPS',th:'กำไรต่อหุ้น'}]],
    calc:function(v){ return v.d/v.e*100; },
    sc:[
      {t:{en:'EPS halves 6.00 → 3.00, dividend held',th:'EPS ลดครึ่ง 6.00 → 3.00 คงปันผลไว้'},v:{e:3.00},k:'bad',
       n:{en:'Payout goes 67% → 133%. The company is paying out more than it earns, funding the difference from cash reserves or debt. This is unsustainable by definition — the cut is a matter of when, not if.',th:'Payout ขึ้นจาก 67% เป็น 133% บริษัทกำลังจ่ายมากกว่าที่หาได้ โดยเอาส่วนต่างมาจากเงินสำรองหรือหนี้ นี่คือสิ่งที่ยั่งยืนไม่ได้ตามนิยาม — การตัดปันผลเป็นเรื่องของ "เมื่อไหร่" ไม่ใช่ "จะเกิดไหม"'}},
      {t:{en:'EPS grows 6.00 → 8.00, dividend held',th:'EPS โต 6.00 → 8.00 คงปันผลไว้'},v:{e:8.00},k:'good',
       n:{en:'Payout falls 67% → 50%, which looks like a downgrade on a screener but is the healthiest possible move. The company now has genuine headroom to raise the dividend — falling payout on rising EPS is a buy signal, not a sell one.',th:'Payout ลดจาก 67% เหลือ 50% ซึ่งบนสกรีนเนอร์ดูเหมือนแย่ลง แต่จริงๆ คือสิ่งที่ดีที่สุดที่เกิดขึ้นได้ บริษัทมีพื้นที่จริงในการขึ้นปันผลแล้ว — payout ที่ลดเพราะ EPS โต คือสัญญาณซื้อ ไม่ใช่สัญญาณขาย'}},
      {t:{en:'Dividend raised 4.00 → 5.00, EPS unchanged',th:'ขึ้นปันผล 4.00 → 5.00 EPS เท่าเดิม'},v:{d:5.00},k:'warn',
       n:{en:'Payout climbs 67% → 83%. Shareholders get more cash today, but the buffer against one bad quarter just got thin. Above 80%, a single earnings miss forces management to choose between the dividend and the balance sheet.',th:'Payout ขึ้นจาก 67% เป็น 83% ผู้ถือหุ้นได้เงินสดมากขึ้นวันนี้ แต่กันชนสำหรับไตรมาสแย่หนึ่งครั้งบางลงมาก เกิน 80% แล้ว กำไรพลาดเป้าครั้งเดียวก็บังคับให้ผู้บริหารต้องเลือกระหว่างปันผลกับงบดุล'}}
    ],
    play:{en:['Use FCF payout (dividend ÷ free cash flow), not just EPS payout. Cash pays dividends, accounting profit does not.',
              'Treat 80%+ as the caution zone and 100%+ as a cut in progress, except for REITs and utilities where high payout is structural.',
              'Read the payout trend across a full cycle: holding a 60% payout through a recession beats a 90% payout in a boom.',
              'Falling payout with rising EPS is the profile you actually want to own — screeners rank it badly, which is the opportunity.'],
          th:['ใช้ FCF Payout (ปันผล ÷ กระแสเงินสดอิสระ) ไม่ใช่แค่ EPS Payout เพราะเงินสดคือสิ่งที่จ่ายปันผล กำไรทางบัญชีไม่ใช่',
              'ถือว่า 80% ขึ้นไปคือโซนระวัง และ 100% ขึ้นไปคือการตัดปันผลที่กำลังดำเนินอยู่ ยกเว้น REIT และสาธารณูปโภคที่ payout สูงเป็นเรื่องโครงสร้าง',
              'อ่านเทรนด์ payout ตลอดทั้งวัฏจักร: การรักษา payout 60% ผ่านช่วงถดถอย ดีกว่า payout 90% ในช่วงเฟื่องฟู',
              'Payout ที่ลดพร้อม EPS ที่โต คือโปรไฟล์ที่คุณอยากถือจริงๆ — สกรีนเนอร์ให้คะแนนมันแย่ ซึ่งนั่นแหละคือโอกาส']}},

  spread:{cat:'flow',mode:'calc',unit:'%',dec:2,
    f:'Spread % = (Ask − Bid) / Mid x 100',
    base:{b:99.75,a:100.25},
    vars:[['b',{en:'Bid',th:'ราคาเสนอซื้อ'}],['a',{en:'Ask',th:'ราคาเสนอขาย'}]],
    calc:function(v){ return (v.a-v.b)/((v.a+v.b)/2)*100; },
    sc:[
      {t:{en:'Volatility spike — spread widens 4x',th:'ความผันผวนพุ่ง — สเปรดกว้างขึ้น 4 เท่า'},v:{b:99.0,a:101.0},k:'bad',
       n:{en:'Spread goes 0.50% → 2.00%. A full round trip now costs 2% before any commission — you are down 2% the instant you fill. Spreads widen exactly when you most want to exit, which is the definition of liquidity risk.',th:'สเปรดขยายจาก 0.50% เป็น 2.00% การเข้าออกครบรอบตอนนี้มีต้นทุน 2% ก่อนค่าคอมมิชชั่น — คุณติดลบ 2% ทันทีที่จับคู่ได้ สเปรดจะกว้างพอดีในจังหวะที่คุณอยากออกที่สุด ซึ่งนั่นคือนิยามของความเสี่ยงสภาพคล่อง'}},
      {t:{en:'Illiquid small cap — 3% spread, 3 trades/month',th:'หุ้นเล็กสภาพคล่องต่ำ — สเปรด 3% เทรด 3 ครั้ง/เดือน'},v:{b:98.5,a:101.5},k:'bad',
       n:{en:'Each round trip burns 3%. Trading three times a month means roughly 108% of capital paid away in spread over a year. Any strategy on this name has to beat that before it earns anything.',th:'การเข้าออกแต่ละรอบเผา 3% เทรดเดือนละสามครั้งเท่ากับจ่ายค่าสเปรดราวๆ 108% ของเงินทุนใน 1 ปี กลยุทธ์ใดก็ตามบนหุ้นตัวนี้ต้องเอาชนะตัวเลขนั้นให้ได้ก่อนถึงจะเริ่มมีกำไร'}},
      {t:{en:'Deep liquidity — spread tightens to 0.05%',th:'สภาพคล่องหนา — สเปรดแคบเหลือ 0.05%'},v:{b:99.975,a:100.025},k:'good',
       n:{en:'Cost of entry becomes negligible, which is why liquid large caps suit active strategies and illiquid names suit long holding periods. Match your holding period to the spread, not the other way round.',th:'ต้นทุนการเข้าซื้อแทบไม่มีนัยสำคัญ นี่คือเหตุผลที่หุ้นใหญ่สภาพคล่องสูงเหมาะกับกลยุทธ์เทรดถี่ ส่วนหุ้นสภาพคล่องต่ำเหมาะกับการถือยาว ให้จับคู่ระยะเวลาถือกับสเปรด ไม่ใช่กลับกัน'}}
    ],
    play:{en:['Use limit orders, never market orders, on anything with a spread above ~0.3%.',
              'Add spread cost to your expected return before entering: a 10% target on a 3% spread is really a 7% target.',
              'Check the spread at the time you actually trade — the open and the close are the worst moments in most names.',
              'Let spread set your holding period: wide spread means fewer, longer trades.'],
          th:['ใช้คำสั่ง Limit อย่าใช้ Market กับอะไรก็ตามที่สเปรดกว้างกว่า ~0.3%',
              'บวกต้นทุนสเปรดเข้าไปในผลตอบแทนที่คาดหวังก่อนเข้าซื้อ: เป้า 10% บนสเปรด 3% จริงๆ แล้วคือเป้า 7%',
              'เช็คสเปรดในเวลาที่คุณจะเทรดจริง เพราะช่วงเปิดและปิดตลาดคือจังหวะที่แย่ที่สุดของหุ้นส่วนใหญ่',
              'ให้สเปรดเป็นตัวกำหนดระยะเวลาถือ: สเปรดกว้างแปลว่าต้องเทรดน้อยครั้งลงและถือยาวขึ้น']}}

  };

  /* ---------- 13 CHART SIGNALS — case mode ---------- */
  var SIGNALS = {

  sig_cndl:{cat:'struct',mode:'case',
    sc:[
      {t:{en:'Big green candle — on 0.3x volume',th:'แท่งเขียวใหญ่ — บนวอลุ่ม 0.3 เท่า'},k:'bad',
       n:{en:'The shape says buyers dominated; the volume says almost nobody traded. A wide body on thin turnover is usually one order walking up an empty book, and it fills back in within days.',th:'รูปทรงบอกว่าฝั่งซื้อคุมเกม แต่วอลุ่มบอกว่าแทบไม่มีใครเทรด แท่งกว้างบนปริมาณบางมักคือออเดอร์ไม้เดียวไล่ราคาขึ้นบนหนังสือคำสั่งที่ว่างเปล่า และจะย้อนกลับลงมาภายในไม่กี่วัน'}},
      {t:{en:'Long lower wick at support, close near high',th:'ไส้ล่างยาวที่แนวรับ ปิดใกล้จุดสูงสุด'},k:'good',
       n:{en:'Sellers pushed price down and were fully rejected inside the session. When this lands exactly on a tested support level with above-average volume, it is one of the highest-quality single-candle signals there is.',th:'ฝั่งขายกดราคาลงแล้วถูกปฏิเสธจนหมดภายในวันเดียว เมื่อสิ่งนี้เกิดพอดีบนแนวรับที่เคยถูกทดสอบมาแล้วพร้อมวอลุ่มเหนือค่าเฉลี่ย มันคือสัญญาณแท่งเทียนเดี่ยวคุณภาพสูงที่สุดแบบหนึ่ง'}},
      {t:{en:'Gap-up candle that closes below its open',th:'แท่งเปิดกระโดดขึ้นแต่ปิดต่ำกว่าราคาเปิด'},k:'bad',
       n:{en:'Good news came out and the stock still finished red. Everyone who wanted in bought the open and got trapped. This "buy the rumour, sell the news" shape often marks a short-term top.',th:'ข่าวดีออกมาแต่หุ้นยังปิดแดง ทุกคนที่อยากเข้าซื้อไปซื้อตอนเปิดแล้วติดดอย รูปแบบ "ซื้อข่าวลือ ขายข่าวจริง" นี้มักเป็นจุดสูงสุดระยะสั้น'}}
    ],
    play:{en:['Never read a candle without the volume bar underneath it.','Only trust reversal candles that form at a level you marked in advance.','Wait for the next candle to confirm before acting — a single candle is a hypothesis, not a signal.'],
          th:['อย่าอ่านแท่งเทียนโดยไม่ดูแท่งวอลุ่มข้างล่าง','เชื่อแท่งกลับตัวเฉพาะที่เกิดบนแนวที่คุณขีดไว้ล่วงหน้าแล้วเท่านั้น','รอแท่งถัดไปยืนยันก่อนลงมือ — แท่งเดียวคือสมมติฐาน ไม่ใช่สัญญาณ']}},

  sig_ma:{cat:'trend',mode:'case',
    sc:[
      {t:{en:'Sideways market — price crosses the MA 9 times in a month',th:'ตลาด sideway — ราคาตัดเส้น MA 9 ครั้งในเดือนเดียว'},k:'bad',
       n:{en:'Every cross is a signal, so you take nine trades and lose commission and spread on most of them. Moving averages are trend tools; in a range they are a machine for producing whipsaw losses.',th:'ทุกการตัดคือสัญญาณ คุณจึงเทรด 9 ครั้งและเสียค่าคอมกับสเปรดเกือบทุกครั้ง เส้นค่าเฉลี่ยเป็นเครื่องมือสำหรับตลาดมีเทรนด์ ในตลาดกรอบมันคือเครื่องผลิตการขาดทุนจากการเหวี่ยง'}},
      {t:{en:'Price −25% but still above the 200-day MA',th:'ราคาลง 25% แต่ยังอยู่เหนือเส้น MA 200 วัน'},k:'warn',
       n:{en:'The MA is a lagging average of past prices, so it can sit far below a stock that has already been cut. "Above the 200-day" is not the same as "healthy" — check how far below the MA sits and how fast it is flattening.',th:'MA คือค่าเฉลี่ยของราคาในอดีตที่ตามหลัง มันจึงลอยอยู่ต่ำกว่าหุ้นที่ถูกหั่นไปแล้วได้ "อยู่เหนือเส้น 200 วัน" ไม่เท่ากับ "แข็งแรง" ให้ดูว่าเส้นอยู่ต่ำแค่ไหนและกำลังแบนราบเร็วแค่ไหน'}},
      {t:{en:'MA flat and price hugging it for 6 weeks',th:'MA แบนราบ ราคาเกาะเส้นอยู่ 6 สัปดาห์'},k:'warn',
       n:{en:'A flat MA means no trend exists to follow. The correct action is usually no action — most losses in trend systems come from trading them during the flat periods between trends.',th:'MA ที่แบนราบแปลว่าไม่มีเทรนด์ให้ตาม สิ่งที่ควรทำมักคือไม่ทำอะไรเลย เพราะการขาดทุนส่วนใหญ่ของระบบตามเทรนด์เกิดจากการเทรดในช่วงแบนราบระหว่างเทรนด์'}}
    ],
    play:{en:['Add a trend filter (ADX above 20, or MA slope) and stand aside when it fails.','Use the MA slope, not just price position relative to it — a rising 200-day is worth more than being above a falling one.','Pair a fast and slow MA so one confirms the other instead of trading every touch.'],
          th:['เพิ่มตัวกรองเทรนด์ (ADX เกิน 20 หรือความชันของ MA) และอยู่เฉยๆ เมื่อมันไม่ผ่าน','ใช้ความชันของ MA ไม่ใช่แค่ตำแหน่งราคาเทียบเส้น — เส้น 200 วันที่ชี้ขึ้นมีค่ากว่าการอยู่เหนือเส้นที่ชี้ลง','ใช้ MA เร็วคู่กับ MA ช้าให้ยืนยันกัน แทนที่จะเทรดทุกครั้งที่ราคาแตะเส้น']}},

  sig_rsi:{cat:'mom',mode:'case',
    sc:[
      {t:{en:'RSI hits 78 and the stock rises another 40%',th:'RSI แตะ 78 แล้วหุ้นขึ้นต่ออีก 40%'},k:'bad',
       n:{en:'"Overbought" is not "about to fall". In a strong uptrend RSI can pin above 70 for months — shorting on that reading alone is one of the most expensive beginner mistakes in technical analysis.',th:'"Overbought" ไม่ได้แปลว่า "กำลังจะลง" ในเทรนด์ขาขึ้นที่แข็งแรง RSI ค้างเหนือ 70 ได้เป็นเดือน การชอร์ตเพราะค่านี้อย่างเดียวคือความผิดพลาดของมือใหม่ที่แพงที่สุดอย่างหนึ่งในการวิเคราะห์ทางเทคนิค'}},
      {t:{en:'RSI at 22 during a fraud investigation',th:'RSI อยู่ที่ 22 ระหว่างการสอบสวนการทุจริต'},k:'bad',
       n:{en:'The indicator says oversold, the news says the business may not survive. RSI only measures the speed of past price change — it has no idea why the price fell, and it will read 22 all the way to zero.',th:'อินดิเคเตอร์บอกว่า oversold แต่ข่าวบอกว่าธุรกิจอาจไม่รอด RSI วัดแค่ความเร็วของการเปลี่ยนแปลงราคาในอดีต มันไม่รู้ว่าราคาลงเพราะอะไร และมันจะอ่านค่า 22 ไปเรื่อยๆ จนถึงศูนย์'}},
      {t:{en:'RSI fails to reach 30 on a pullback in an uptrend',th:'RSI ลงไม่ถึง 30 ในการย่อของขาขึ้น'},k:'good',
       n:{en:'In a genuine uptrend the RSI floor lifts to around 40. A pullback that stops at 42 and turns up is the trend confirming itself — this range shift is far more useful than the fixed 30/70 lines.',th:'ในขาขึ้นที่แท้จริง พื้นของ RSI จะยกขึ้นมาราวๆ 40 การย่อที่หยุดที่ 42 แล้วเด้งขึ้นคือเทรนด์กำลังยืนยันตัวเอง การเลื่อนกรอบแบบนี้มีประโยชน์กว่าเส้น 30/70 ตายตัวมาก'}}
    ],
    play:{en:['Trade RSI in the direction of the trend only — buy oversold in uptrends, sell overbought in downtrends.','Watch where the RSI range sits (40–80 in uptrends, 20–60 in downtrends), not just the 30/70 lines.','Always check the news before acting on an extreme reading; an oversold fraud is not a bargain.'],
          th:['เทรด RSI ตามทิศทางเทรนด์เท่านั้น — ซื้อ oversold ในขาขึ้น ขาย overbought ในขาลง','ดูว่ากรอบ RSI อยู่ตรงไหน (40–80 ในขาขึ้น, 20–60 ในขาลง) ไม่ใช่แค่เส้น 30/70','เช็คข่าวก่อนลงมือเสมอเมื่อเจอค่าสุดขั้ว — บริษัทที่ oversold เพราะทุจริตไม่ใช่ของถูก']}},

  sig_sr:{cat:'struct',mode:'case',
    sc:[
      {t:{en:'Support at 50 breaks, price rebounds to 50 and stalls',th:'แนวรับ 50 แตก ราคาเด้งกลับมา 50 แล้วไปต่อไม่ได้'},k:'warn',
       n:{en:'Broken support becomes resistance — every trader who bought at 50 and sat through the loss now sells at break-even. That trapped supply is exactly what caps the rebound.',th:'แนวรับที่แตกกลายเป็นแนวต้าน — ทุกคนที่ซื้อที่ 50 แล้วทนขาดทุนมา จะขายตอนกลับมาเท่าทุน อุปทานที่ติดอยู่นั่นแหละคือสิ่งที่ปิดฝาการเด้ง'}},
      {t:{en:'Level breaks by 1.5% then closes back inside',th:'ราคาทะลุแนว 1.5% แล้วปิดกลับเข้ามาในกรอบ'},k:'bad',
       n:{en:'A false break, and often a deliberate one — stops sit just beyond obvious levels and get harvested before price reverses. Intraday breaks mean little; only the close counts.',th:'เบรกหลอก และบ่อยครั้งเป็นการจงใจ — จุดตัดขาดทุนวางอยู่เลยแนวที่เห็นชัด และถูกเก็บเกี่ยวก่อนราคากลับตัว การทะลุระหว่างวันแทบไม่มีความหมาย นับเฉพาะราคาปิดเท่านั้น'}},
      {t:{en:'Fourth test of the same support',th:'ทดสอบแนวรับเดิมเป็นครั้งที่สี่'},k:'warn',
       n:{en:'Each retest consumes the buy orders resting there. Levels are not walls; they are inventory, and repeated tests deplete it. A support tested four times is weaker than one tested once, not stronger.',th:'การกลับมาทดสอบแต่ละครั้งกินคำสั่งซื้อที่วางรออยู่ตรงนั้นไปเรื่อยๆ แนวไม่ใช่กำแพง แต่คือสินค้าคงคลัง และการทดสอบซ้ำๆ ทำให้มันหมดลง แนวรับที่ถูกทดสอบสี่ครั้งอ่อนแอกว่าที่ถูกทดสอบครั้งเดียว ไม่ใช่แข็งแรงกว่า'}}
    ],
    play:{en:['Require a closing break, plus above-average volume, before treating a level as broken.','Place stops away from the obvious round number, not right behind it.','Treat levels as zones a few percent wide, not exact prices.'],
          th:['ต้องเห็นการปิดทะลุแนว พร้อมวอลุ่มเหนือค่าเฉลี่ย ก่อนจะถือว่าแนวนั้นแตกจริง','วางจุดตัดขาดทุนให้ห่างจากเลขกลมที่เห็นชัด ไม่ใช่ชิดหลังมัน','มองแนวเป็นโซนกว้างไม่กี่เปอร์เซ็นต์ ไม่ใช่ราคาจุดเดียว']}},

  sig_trend:{cat:'trend',mode:'case',
    sc:[
      {t:{en:'Higher highs continue but each one is smaller',th:'ยอดสูงขึ้นต่อเนื่อง แต่แต่ละยอดสั้นลง'},k:'warn',
       n:{en:'The trend is technically intact and quietly dying. Shrinking impulse legs with deeper pullbacks is the standard signature of a trend running out of buyers before the structure actually breaks.',th:'ทางเทคนิคเทรนด์ยังอยู่ครบ แต่กำลังตายอย่างเงียบๆ ขาขึ้นที่สั้นลงพร้อมการย่อที่ลึกขึ้น คือลายเซ็นมาตรฐานของเทรนด์ที่กำลังหมดแรงซื้อ ก่อนที่โครงสร้างจะแตกจริง'}},
      {t:{en:'One violent down day breaks the trendline',th:'วันลงแรงวันเดียวทำลายเส้นเทรนด์'},k:'warn',
       n:{en:'A trendline break is a change of pace, not automatically a change of direction. Many strong trends break their line, consolidate sideways for weeks, then resume. Wait for a lower high to confirm reversal.',th:'การหลุดเส้นเทรนด์คือการเปลี่ยนจังหวะ ไม่ใช่การเปลี่ยนทิศทางโดยอัตโนมัติ เทรนด์แข็งแรงหลายครั้งหลุดเส้น แล้วออกข้างเป็นสัปดาห์ ก่อนจะไปต่อ ให้รอยอดที่ต่ำลงเพื่อยืนยันการกลับตัว'}},
      {t:{en:'Trend looks perfect on the daily, broken on the weekly',th:'เทรนด์ดูสมบูรณ์แบบใน timeframe วัน แต่แตกแล้วใน timeframe สัปดาห์'},k:'bad',
       n:{en:'Timeframe conflict. The larger timeframe wins almost every time — a daily uptrend inside a weekly downtrend is usually just a bounce, and it will end sooner and harder than the daily chart suggests.',th:'ความขัดแย้งระหว่าง timeframe กรอบเวลาที่ใหญ่กว่าชนะแทบทุกครั้ง — ขาขึ้นราย วันที่อยู่ในขาลงรายสัปดาห์ มักเป็นแค่การเด้ง และจะจบเร็วกว่าและแรงกว่าที่กราฟรายวันบอก'}}
    ],
    play:{en:['Always check the higher timeframe before entering; trade in the direction of the larger structure.','Define trend by structure (higher highs and higher lows), not by a drawn line you can move.','Track the size of impulse legs versus pullbacks — shrinking impulses are the early warning.'],
          th:['เช็ค timeframe ที่ใหญ่กว่าเสมอก่อนเข้า และเทรดตามทิศทางของโครงสร้างใหญ่','นิยามเทรนด์ด้วยโครงสร้าง (ยอดสูงขึ้นและฐานสูงขึ้น) ไม่ใช่ด้วยเส้นที่คุณลากแล้วขยับได้','ตามดูขนาดของขาขึ้นเทียบกับการย่อ — ขาที่สั้นลงคือสัญญาณเตือนล่วงหน้า']}},

  sig_bb:{cat:'volat',mode:'case',
    sc:[
      {t:{en:'Price rides the upper band for 12 sessions',th:'ราคาเกาะแบนด์บนติดต่อกัน 12 วัน'},k:'bad',
       n:{en:'Touching the upper band is not a sell signal — in a strong trend price "walks the band" and every short gets stopped out. The bands measure volatility, they do not predict reversal.',th:'การแตะแบนด์บนไม่ใช่สัญญาณขาย — ในเทรนด์แข็งแรงราคาจะ "เดินบนแบนด์" และคนที่ชอร์ตจะโดนตัดขาดทุนทุกราย แบนด์วัดความผันผวน ไม่ได้ทำนายการกลับตัว'}},
      {t:{en:'Bands squeeze to the tightest level in a year',th:'แบนด์บีบแคบที่สุดในรอบปี'},k:'warn',
       n:{en:'A squeeze reliably predicts that a large move is coming, and gives no information at all about the direction. Positioning before the break is a coin flip with extra steps — trade the expansion, not the squeeze.',th:'การบีบตัวทำนายได้แม่นยำว่ากำลังจะมีการเคลื่อนไหวใหญ่ แต่ไม่ได้บอกทิศทางเลยแม้แต่นิดเดียว การเข้าไม้ก่อนเบรกคือการโยนเหรียญที่มีขั้นตอนเพิ่ม — ให้เทรดตอนแบนด์ขยาย ไม่ใช่ตอนบีบ'}},
      {t:{en:'Price breaks out, bands expand, then price returns to the middle',th:'ราคาเบรก แบนด์ขยาย แล้วราคากลับเข้าเส้นกลาง'},k:'warn',
       n:{en:'The middle band is a moving average and acts as the magnet after volatility spikes. A failed band breakout that closes back inside is often the start of a move in the opposite direction.',th:'แบนด์กลางคือเส้นค่าเฉลี่ยและทำหน้าที่เป็นแม่เหล็กหลังความผันผวนพุ่ง การเบรกแบนด์ที่ล้มเหลวและปิดกลับเข้ามาข้างใน มักเป็นจุดเริ่มของการเคลื่อนไหวไปทางตรงข้าม'}}
    ],
    play:{en:['Use band touches as mean-reversion signals only inside a range, never inside a trend.','Trade the expansion after a squeeze, with a stop back inside the bands.','Combine bands with a trend filter so you know which mode the market is in first.'],
          th:['ใช้การแตะแบนด์เป็นสัญญาณกลับสู่ค่าเฉลี่ยเฉพาะในตลาดกรอบเท่านั้น ห้ามใช้ในตลาดมีเทรนด์','เทรดตอนแบนด์ขยายหลังการบีบตัว โดยวางจุดตัดขาดทุนกลับเข้ามาในแบนด์','ใช้แบนด์คู่กับตัวกรองเทรนด์ เพื่อให้รู้ก่อนว่าตลาดอยู่ในโหมดไหน']}},

  sig_macd:{cat:'mom',mode:'case',
    sc:[
      {t:{en:'Bullish cross appears — 3 weeks after the low',th:'สัญญาณตัดขึ้นปรากฏ — 3 สัปดาห์หลังจุดต่ำสุด'},k:'warn',
       n:{en:'MACD is built from two moving averages, so it is lagging by construction. By the time the cross prints, a large part of the move is gone and your stop distance has widened accordingly.',th:'MACD สร้างจากเส้นค่าเฉลี่ยสองเส้น มันจึงตามหลังโดยโครงสร้าง กว่าสัญญาณตัดจะออก การเคลื่อนไหวส่วนใหญ่ผ่านไปแล้ว และระยะจุดตัดขาดทุนของคุณก็กว้างขึ้นตามไปด้วย'}},
      {t:{en:'Repeated crosses around the zero line in a range',th:'ตัดขึ้นตัดลงซ้ำๆ รอบเส้นศูนย์ในตลาดกรอบ'},k:'bad',
       n:{en:'Crosses near zero carry almost no information — the two averages are on top of each other. Most MACD losses come from taking these signals; crosses far from zero are the ones with an edge.',th:'การตัดใกล้เส้นศูนย์แทบไม่มีข้อมูลอะไรเลย เพราะเส้นค่าเฉลี่ยสองเส้นทับกันอยู่ การขาดทุนจาก MACD ส่วนใหญ่มาจากการเข้าสัญญาณพวกนี้ ส่วนการตัดที่ห่างจากศูนย์คือสัญญาณที่มีความได้เปรียบ'}},
      {t:{en:'Histogram shrinks for 5 bars while price makes new highs',th:'ฮิสโตแกรมหดตัว 5 แท่ง ขณะราคาทำจุดสูงใหม่'},k:'warn',
       n:{en:'Momentum is fading before price does. This is the most useful thing MACD offers — not the cross, but the loss of acceleration that precedes it, giving you time to tighten stops rather than enter late.',th:'โมเมนตัมกำลังจางก่อนที่ราคาจะจาง นี่คือสิ่งที่มีประโยชน์ที่สุดที่ MACD ให้ได้ — ไม่ใช่จุดตัด แต่คือการสูญเสียความเร่งที่เกิดขึ้นก่อน ซึ่งให้เวลาคุณขยับจุดตัดขาดทุนให้แคบลง แทนที่จะเข้าช้า'}}
    ],
    play:{en:['Ignore crosses that occur within a narrow band around zero.','Use the histogram for early warning and the cross for confirmation, not the other way round.','Never use MACD as a standalone entry — combine it with structure or a level.'],
          th:['ละเลยจุดตัดที่เกิดในกรอบแคบๆ รอบเส้นศูนย์','ใช้ฮิสโตแกรมเป็นสัญญาณเตือนล่วงหน้า และใช้จุดตัดเป็นการยืนยัน ไม่ใช่กลับกัน','อย่าใช้ MACD เป็นสัญญาณเข้าเดี่ยวๆ ให้ใช้ร่วมกับโครงสร้างหรือแนวราคา']}},

  sig_volcf:{cat:'flow',mode:'case',
    sc:[
      {t:{en:'Price +6%, volume 0.5x average',th:'ราคาขึ้น 6% วอลุ่ม 0.5 เท่าของค่าเฉลี่ย'},k:'bad',
       n:{en:'A move nobody participated in. Prices set on thin volume are not agreed prices — there was no real negotiation between size buyers and size sellers, so the level has no memory and no support.',th:'การเคลื่อนไหวที่ไม่มีใครร่วม ราคาที่เกิดบนวอลุ่มบางไม่ใช่ราคาที่ตกลงกันจริง เพราะไม่มีการต่อรองจริงระหว่างผู้ซื้อรายใหญ่กับผู้ขายรายใหญ่ แนวราคานั้นจึงไม่มีความทรงจำและไม่มีแนวรับ'}},
      {t:{en:'Volume rising steadily while price goes sideways',th:'วอลุ่มค่อยๆ เพิ่ม ขณะราคาออกข้าง'},k:'good',
       n:{en:'Someone is accumulating without moving the price — the classic footprint of institutional buying that has to be worked over days. Rising volume in a base is usually more informative than the breakout that follows.',th:'มีคนกำลังสะสมโดยไม่ดันราคา — รอยเท้าคลาสสิกของการซื้อของสถาบันที่ต้องทยอยทำหลายวัน วอลุ่มที่เพิ่มขึ้นในช่วงสร้างฐาน มักบอกอะไรได้มากกว่าการเบรกที่ตามมา'}},
      {t:{en:'Huge volume day, price closes unchanged',th:'วันวอลุ่มมหาศาล ราคาปิดเท่าเดิม'},k:'warn',
       n:{en:'Enormous turnover with no price change means one side absorbed everything the other side had. That is a transfer of ownership at a level — the next directional move from there tends to be significant.',th:'ปริมาณมหาศาลแต่ราคาไม่เปลี่ยน แปลว่าฝ่ายหนึ่งดูดของทั้งหมดที่อีกฝ่ายมี นั่นคือการเปลี่ยนมือของความเป็นเจ้าของที่แนวราคานั้น การเคลื่อนไหวมีทิศทางครั้งถัดไปจากจุดนั้นมักมีนัยสำคัญ'}}
    ],
    play:{en:['Read volume relative to that stock\'s own 20-day average, never as a raw number.','Look for volume expanding in the direction of the trend and contracting on pullbacks — the reverse is a warning.','Check where the candle closed on a high-volume day: near the high is accumulation, near the low is distribution.'],
          th:['อ่านวอลุ่มเทียบกับค่าเฉลี่ย 20 วันของหุ้นตัวนั้นเอง อย่าดูเป็นตัวเลขดิบ','มองหาวอลุ่มที่ขยายไปตามทิศเทรนด์และหดตัวตอนย่อ — ถ้ากลับกันคือสัญญาณเตือน','ดูว่าแท่งเทียนปิดตรงไหนในวันวอลุ่มสูง ปิดใกล้ยอดคือการสะสม ปิดใกล้ฐานคือการระบาย']}},

  sig_gap:{cat:'volat',mode:'case',
    sc:[
      {t:{en:'Gap up 8% on earnings, filled by lunch',th:'เปิดกระโดดขึ้น 8% รับงบ ปิดแก็ปตอนเที่ยง'},k:'bad',
       n:{en:'A gap that fills fast means the market re-priced and then rejected the new price. Buying the open here is buying the exact worst tick of the session — the classic retail gap trap.',th:'แก็ปที่ถูกปิดเร็วแปลว่าตลาดตีราคาใหม่แล้วปฏิเสธราคานั้น การซื้อตอนเปิดในกรณีนี้คือการซื้อที่ราคาแย่ที่สุดของวันพอดี — กับดักแก็ปคลาสสิกของรายย่อย'}},
      {t:{en:'Gap up 8% and price never trades back into the gap',th:'เปิดกระโดดขึ้น 8% และราคาไม่เคยกลับลงมาในแก็ปเลย'},k:'good',
       n:{en:'An unfilled gap is a genuine repricing — the market decided the old range was wrong and refuses to go back. These "breakaway" gaps often mark the start of a multi-week trend rather than the end of a move.',th:'แก็ปที่ไม่ถูกปิดคือการตีราคาใหม่ของจริง — ตลาดตัดสินว่ากรอบราคาเดิมผิดและไม่ยอมกลับไป แก็ปแบบ "breakaway" นี้มักเป็นจุดเริ่มของเทรนด์หลายสัปดาห์ ไม่ใช่จุดจบของการเคลื่อนไหว'}},
      {t:{en:'Gap down 15%, stop-loss set at −8%',th:'เปิดกระโดดลง 15% ตั้งจุดตัดขาดทุนไว้ −8%'},k:'bad',
       n:{en:'The stop does not protect you — it executes at the open, 15% down, not at your 8% level. Gap risk is why position sizing, not stop placement, is the real risk control for overnight positions.',th:'จุดตัดขาดทุนไม่ได้ปกป้องคุณ — มันทำงานที่ราคาเปิดซึ่งลง 15% ไม่ใช่ที่ระดับ 8% ที่คุณตั้งไว้ ความเสี่ยงจากแก็ปคือเหตุผลที่การกำหนดขนาดไม้ ไม่ใช่การวางจุดตัดขาดทุน คือการควบคุมความเสี่ยงที่แท้จริงของการถือข้ามคืน'}}
    ],
    play:{en:['Size overnight positions assuming your stop can be jumped — the maximum loss is the position, not the stop distance.','Wait 30–60 minutes after the open before trading a gap; let the first range establish.','Distinguish gap types: exhaustion gaps fill, breakaway gaps do not. Volume tells you which.'],
          th:['กำหนดขนาดไม้ที่ถือข้ามคืนโดยสมมติว่าจุดตัดขาดทุนจะถูกข้าม — ความเสียหายสูงสุดคือทั้งไม้ ไม่ใช่ระยะจุดตัดขาดทุน','รอ 30–60 นาทีหลังตลาดเปิดก่อนเทรดแก็ป ปล่อยให้กรอบราคาแรกก่อตัวก่อน','แยกประเภทแก็ป: แก็ปหมดแรงจะถูกปิด แก็ป breakaway จะไม่ถูกปิด วอลุ่มเป็นตัวบอกว่าเป็นแบบไหน']}},

  sig_xover:{cat:'trend',mode:'case',
    sc:[
      {t:{en:'Golden cross prints at the top of the rally',th:'Golden cross ปรากฏที่ยอดของขาขึ้น'},k:'bad',
       n:{en:'A 50/200 cross needs roughly 200 sessions of data to move, so it confirms trends that are already mature. Historically it is a decent regime filter and a poor entry timer — many golden crosses mark the last third of a move.',th:'การตัดกันของเส้น 50/200 ต้องใช้ข้อมูลราว 200 วันกว่าจะขยับ มันจึงยืนยันเทรนด์ที่โตเต็มที่แล้ว ในเชิงสถิติมันเป็นตัวกรองภาวะตลาดที่ใช้ได้ แต่เป็นตัวจับจังหวะเข้าที่แย่ — golden cross หลายครั้งเกิดในหนึ่งในสามสุดท้ายของการเคลื่อนไหว'}},
      {t:{en:'Death cross, then price rallies 30%',th:'Death cross แล้วราคาขึ้นต่อ 30%'},k:'bad',
       n:{en:'Crosses fail often enough that trading them mechanically loses money in choppy markets. The cross describes where price has been over two very different lookbacks — nothing more.',th:'การตัดกันล้มเหลวบ่อยพอที่การเทรดตามมันแบบกลไกจะขาดทุนในตลาดเหวี่ยง จุดตัดอธิบายแค่ว่าราคาเคยอยู่ตรงไหนภายใต้ช่วงมองย้อนสองแบบที่ต่างกันมาก — ไม่มีอะไรมากกว่านั้น'}},
      {t:{en:'Cross confirmed with rising volume and a rising 200-day',th:'จุดตัดยืนยันด้วยวอลุ่มที่เพิ่มและเส้น 200 วันที่ชี้ขึ้น'},k:'good',
       n:{en:'The cross alone is weak; the cross plus a rising long-term average plus volume expansion is a regime change. Use it to decide whether to be long at all, not when to click buy.',th:'จุดตัดเดี่ยวๆ อ่อนแอ แต่จุดตัด + เส้นค่าเฉลี่ยระยะยาวที่ชี้ขึ้น + วอลุ่มที่ขยาย คือการเปลี่ยนภาวะตลาด ใช้มันเพื่อตัดสินใจว่าจะถือ long หรือไม่ ไม่ใช่ใช้ตัดสินว่าจะกดซื้อเมื่อไหร่'}}
    ],
    play:{en:['Use crosses as a regime filter (long allowed / not allowed), not as trade triggers.','Require the slower average to be sloping in the same direction as the cross.','Enter on a pullback after the cross, not at the cross itself, to keep stop distance sane.'],
          th:['ใช้จุดตัดเป็นตัวกรองภาวะตลาด (อนุญาตให้ long / ไม่อนุญาต) ไม่ใช่เป็นตัวจุดชนวนการเทรด','เส้นค่าเฉลี่ยที่ช้ากว่าต้องชี้ไปทางเดียวกับจุดตัด','เข้าตอนย่อหลังจุดตัด ไม่ใช่ที่จุดตัดเอง เพื่อให้ระยะจุดตัดขาดทุนสมเหตุสมผล']}},

  sig_divg:{cat:'mom',mode:'case',
    sc:[
      {t:{en:'Bearish divergence forms — price rises 4 more months',th:'เกิดสัญญาณขัดแย้งขาลง — ราคาขึ้นต่ออีก 4 เดือน'},k:'bad',
       n:{en:'Divergence signals a loss of momentum, not a reversal date. Strong trends produce divergence repeatedly on the way up. Shorting the first divergence is one of the fastest ways to lose money in a bull market.',th:'สัญญาณขัดแย้งบอกว่าโมเมนตัมกำลังหาย ไม่ได้บอกวันที่จะกลับตัว เทรนด์แข็งแรงสร้างสัญญาณขัดแย้งซ้ำๆ ระหว่างทางขึ้น การชอร์ตที่สัญญาณขัดแย้งครั้งแรกคือวิธีเสียเงินที่เร็วที่สุดวิธีหนึ่งในตลาดขาขึ้น'}},
      {t:{en:'Divergence plus a break of the last higher low',th:'สัญญาณขัดแย้ง + หลุดฐานที่สูงขึ้นล่าสุด'},k:'good',
       n:{en:'Now the momentum warning has structural confirmation. Divergence tells you to get ready; the structure break tells you to act. Used in that order it is a genuine edge.',th:'ตอนนี้คำเตือนเรื่องโมเมนตัมได้รับการยืนยันจากโครงสร้างแล้ว สัญญาณขัดแย้งบอกให้เตรียมตัว การหลุดโครงสร้างบอกให้ลงมือ ใช้ตามลำดับนี้แล้วมันคือความได้เปรียบจริง'}},
      {t:{en:'Divergence visible on RSI but absent on MACD',th:'เห็นสัญญาณขัดแย้งบน RSI แต่ไม่มีบน MACD'},k:'warn',
       n:{en:'Divergence is indicator-dependent — change the lookback period and it disappears. If it only shows on one setting, it is likely an artefact of that setting rather than a real change in participation.',th:'สัญญาณขัดแย้งขึ้นอยู่กับอินดิเคเตอร์ — เปลี่ยนช่วงมองย้อนแล้วมันหายไป ถ้ามันโผล่แค่บนค่าตั้งเดียว มันมักเป็นผลข้างเคียงของค่าตั้งนั้น ไม่ใช่การเปลี่ยนแปลงจริงของการมีส่วนร่วมในตลาด'}}
    ],
    play:{en:['Never trade divergence alone — require a structure break as the trigger.','Check the same divergence on a second indicator and a second timeframe before trusting it.','Treat repeated divergence in a strong trend as a reason to tighten stops, not to reverse position.'],
          th:['อย่าเทรดสัญญาณขัดแย้งเดี่ยวๆ ต้องมีการหลุดโครงสร้างเป็นตัวจุดชนวน','เช็คสัญญาณขัดแย้งเดียวกันบนอินดิเคเตอร์ตัวที่สองและ timeframe ที่สองก่อนจะเชื่อ','ถ้าเจอสัญญาณขัดแย้งซ้ำๆ ในเทรนด์แข็งแรง ให้ถือเป็นเหตุผลขยับจุดตัดขาดทุนให้แคบลง ไม่ใช่กลับข้างไม้']}},

  sig_ptrn:{cat:'struct',mode:'case',
    sc:[
      {t:{en:'Head and shoulders breaks the neckline — then reverses up',th:'หัวไหล่ทะลุเส้นคอ — แล้วกลับตัวขึ้น'},k:'bad',
       n:{en:'Failed patterns are common and they move fast, because everyone positioned for the pattern has to exit at once. A failed bearish pattern is often a stronger bullish signal than any bullish pattern.',th:'รูปแบบที่ล้มเหลวเกิดบ่อยและวิ่งเร็ว เพราะทุกคนที่เข้าไม้ตามรูปแบบต้องออกพร้อมกัน รูปแบบขาลงที่ล้มเหลวมักเป็นสัญญาณขาขึ้นที่แรงกว่ารูปแบบขาขึ้นใดๆ'}},
      {t:{en:'You can only see the pattern after drawing three trendlines',th:'ต้องลากเส้นเทรนด์สามเส้นถึงจะเห็นรูปแบบ'},k:'warn',
       n:{en:'If the pattern needs that much help to appear, it is in your head rather than in the market. Real patterns are obvious at a glance on a clean chart with no annotations.',th:'ถ้ารูปแบบต้องอาศัยการช่วยเหลือขนาดนั้นถึงจะปรากฏ มันอยู่ในหัวคุณ ไม่ได้อยู่ในตลาด รูปแบบจริงจะเห็นชัดทันทีบนกราฟสะอาดที่ไม่มีการขีดเขียนอะไรเลย'}},
      {t:{en:'Textbook pattern, but volume flat throughout',th:'รูปแบบตามตำรา แต่วอลุ่มแบนตลอด'},k:'warn',
       n:{en:'Classical patterns come with a volume signature — contracting into the formation, expanding on the break. Without it you have a shape, not a pattern, and the break is far more likely to fail.',th:'รูปแบบคลาสสิกมาพร้อมลายเซ็นวอลุ่ม — หดตัวระหว่างก่อรูป และขยายตอนเบรก ถ้าไม่มีสิ่งนี้ คุณมีแค่รูปทรง ไม่ใช่รูปแบบ และการเบรกมีโอกาสล้มเหลวสูงกว่ามาก'}}
    ],
    play:{en:['Zoom out first. If the pattern is not obvious on a clean chart, it does not exist.','Require the volume signature to match the pattern before trading it.','Plan the failure trade in advance — failed patterns often offer the better setup.'],
          th:['ซูมออกก่อน ถ้ารูปแบบไม่เห็นชัดบนกราฟสะอาด แปลว่ามันไม่มีอยู่จริง','ต้องมีลายเซ็นวอลุ่มที่ตรงกับรูปแบบก่อนถึงจะเทรด','วางแผนไม้สำหรับกรณีรูปแบบล้มเหลวไว้ล่วงหน้า เพราะรูปแบบที่ล้มเหลวมักให้จังหวะที่ดีกว่า']}},

  sig_fib:{cat:'struct',mode:'case',
    sc:[
      {t:{en:'Price respects 61.8% — measured from a different swing it is 50%',th:'ราคาเคารพระดับ 61.8% — แต่วัดจากอีกสวิงกลายเป็น 50%'},k:'warn',
       n:{en:'Fibonacci levels depend entirely on which high and low you pick. Two analysts on the same chart routinely produce different levels, which means the level is not in the market — the choice is.',th:'ระดับฟีโบนักชีขึ้นอยู่กับว่าคุณเลือกจุดสูงสุดและต่ำสุดจุดไหนล้วนๆ นักวิเคราะห์สองคนบนกราฟเดียวกันได้ระดับต่างกันเป็นเรื่องปกติ ซึ่งแปลว่าระดับนั้นไม่ได้อยู่ในตลาด แต่อยู่ที่การเลือก'}},
      {t:{en:'Retracement cuts through 61.8% without pausing',th:'การย่อทะลุ 61.8% ไปเลยโดยไม่หยุด'},k:'bad',
       n:{en:'Beyond about 61.8%, a "pullback" is statistically closer to a trend reversal. Adding to a position because "there is still the 78.6% level" is how a small loss becomes a large one.',th:'เลยประมาณ 61.8% ไปแล้ว "การย่อ" ในเชิงสถิติใกล้เคียงกับการกลับตัวของเทรนด์มากกว่า การถัวเพิ่มเพราะ "ยังมีระดับ 78.6% อยู่" คือวิธีที่ขาดทุนเล็กกลายเป็นขาดทุนใหญ่'}},
      {t:{en:'61.8% coincides with the 200-day MA and prior support',th:'ระดับ 61.8% ทับกับเส้น MA 200 วันและแนวรับเดิม'},k:'good',
       n:{en:'Confluence is where Fibonacci earns its keep. One level alone is arbitrary; three independent methods pointing at the same price is where real orders cluster.',th:'จุดบรรจบคือที่ที่ฟีโบนักชีมีค่าจริง ระดับเดียวคือการสุ่ม แต่สามวิธีที่เป็นอิสระต่อกันชี้ไปที่ราคาเดียวกัน คือจุดที่คำสั่งซื้อขายจริงกระจุกตัว'}}
    ],
    play:{en:['Only trade Fibonacci levels that coincide with an independent level (MA, prior high/low, volume node).','Fix your swing points by a rule and do not redraw them to fit the outcome.','Treat a break beyond 61.8% as trend failure and exit rather than average down.'],
          th:['เทรดเฉพาะระดับฟีโบนักชีที่ทับกับแนวอิสระอื่น (MA, จุดสูง/ต่ำเดิม, โซนวอลุ่ม)','กำหนดจุดสวิงด้วยกฎตายตัว และอย่าลากใหม่เพื่อให้เข้ากับผลลัพธ์','ถือว่าการหลุดเลย 61.8% คือเทรนด์ล้มเหลว ให้ออก อย่าถัวเฉลี่ยลง']}}

  };


  /* ---------- category labels ---------- */
  var CATS = {
    val:{en:'Valuation',th:'มูลค่า'},
    qual:{en:'Quality',th:'คุณภาพกำไร'},
    inc:{en:'Income',th:'ปันผล'},
    risk:{en:'Risk',th:'ความเสี่ยง'},
    flow:{en:'Liquidity',th:'สภาพคล่อง'},
    trend:{en:'Trend',th:'เทรนด์'},
    mom:{en:'Momentum',th:'โมเมนตัม'},
    volat:{en:'Volatility',th:'ความผันผวน'},
    struct:{en:'Structure',th:'โครงสร้าง'}
  };

  var T = {
    whatif:{en:'What-If Scenario',th:'เหตุการณ์สมมุติ'},
    base:{en:'Baseline',th:'ค่าตั้งต้น'},
    after:{en:'After scenario',th:'หลังเกิดเหตุการณ์'},
    play:{en:'How to handle it',th:'วิธีรับมือ'},
    pick:{en:'Pick a scenario',th:'เลือกเหตุการณ์'},
    all:{en:'All',th:'ทั้งหมด'},
    filter:{en:'Filter',th:'กรอง'},
    sort:{en:'Sort',th:'เรียง'},
    search:{en:'Search a term…',th:'ค้นหาคำศัพท์…'},
    expand:{en:'Expand all',th:'เปิดทั้งหมด'},
    collapse:{en:'Collapse all',th:'ปิดทั้งหมด'},
    showing:{en:'showing',th:'แสดง'},
    of:{en:'of',th:'จาก'},
    none:{en:'No entries match this filter.',th:'ไม่มีรายการที่ตรงกับตัวกรองนี้'},
    s_def:{en:'Default order',th:'ลำดับเริ่มต้น'},
    s_az:{en:'A → Z',th:'ก → ฮ / A → Z'},
    s_cat:{en:'By category',th:'ตามหมวด'},
    s_risk:{en:'Most trap-prone first',th:'เสี่ยงตีความผิดมากสุดก่อน'},
    level:{en:'Level',th:'ระดับ'},
    beginner:{en:'Beginner',th:'มือใหม่'},
    advanced:{en:'Advanced',th:'แอดวานซ์'}
  };

  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function tx(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }

  var DATA = {};
  var k;
  for(k in METRICS){ if(METRICS.hasOwnProperty(k)) DATA[k] = METRICS[k]; }
  for(k in SIGNALS){ if(SIGNALS.hasOwnProperty(k)) DATA[k] = SIGNALS[k]; }

  /* ---------- number formatting ---------- */
  function fmt(n, d, unit){
    if(!isFinite(n)) return '—';
    var s = Math.abs(n) >= 1000
      ? n.toLocaleString('en-US', {minimumFractionDigits:d, maximumFractionDigits:d})
      : n.toFixed(d);
    if(unit === '%') return s + '%';
    if(unit === 'x') return s + 'x';
    if(unit === 'M') return s + 'M';
    return s;
  }

  function merge(base, over){
    var o = {}, key;
    for(key in base){ if(base.hasOwnProperty(key)) o[key] = base[key]; }
    for(key in over){ if(over.hasOwnProperty(key)) o[key] = over[key]; }
    return o;
  }

  function inputLine(def, vals){
    var parts = [];
    for(var i = 0; i < def.vars.length; i++){
      var vk = def.vars[i][0];
      var lbl = tx(def.vars[i][1]);
      var v = vals[vk];
      parts.push(lbl + ' ' + (Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : v));
    }
    return parts.join('  ·  ');
  }

  /* ---------- build one what-if panel ---------- */
  function buildPanel(key, def){
    var wrap = document.createElement('div');
    wrap.className = 'wif';
    wrap.dataset.wifKey = key;

    var head = document.createElement('div');
    head.className = 'wif-head';
    head.innerHTML = '<span class="wif-icon"></span><span class="wif-title" data-el="ttl"></span>' +
                     (def.f ? '<span class="wif-f">' + def.f + '</span>' : '');
    wrap.appendChild(head);

    var body = document.createElement('div');
    body.className = 'wif-body';

    var scn = document.createElement('div');
    scn.className = 'wif-scn';
    body.appendChild(scn);

    if(def.mode === 'calc'){
      var calc = document.createElement('div');
      calc.className = 'wif-calc';
      calc.innerHTML =
        '<div class="wif-cell"><div class="wif-cap" data-el="capA"></div>' +
        '<div class="wif-val" data-el="valA">—</div><div class="wif-in" data-el="inA"></div></div>' +
        '<div class="wif-arrow">▶</div>' +
        '<div class="wif-cell"><div class="wif-cap" data-el="capB"></div>' +
        '<div class="wif-val" data-el="valB">—</div><div class="wif-in" data-el="inB"></div>' +
        '<div class="wif-delta" data-el="dlt"></div></div>';
      body.appendChild(calc);
    }

    var note = document.createElement('p');
    note.className = 'wif-note';
    note.setAttribute('data-el', 'note');
    body.appendChild(note);

    var play = document.createElement('div');
    play.className = 'wif-play';
    play.innerHTML = '<div class="wif-play-h" data-el="playh"></div><ul data-el="playl"></ul>';
    body.appendChild(play);

    wrap.appendChild(body);

    var state = { i: 0 };

    function render(){
      var lang = L();
      wrap.querySelector('[data-el="ttl"]').textContent = T.whatif[lang];
      var s = def.sc[state.i];

      /* scenario buttons */
      scn.innerHTML = '';
      for(var i = 0; i < def.sc.length; i++){
        (function(idx){
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'wif-btn k-' + def.sc[idx].k + (idx === state.i ? ' active' : '');
          b.textContent = tx(def.sc[idx].t);
          b.addEventListener('click', function(){ state.i = idx; render(); });
          scn.appendChild(b);
        })(i);
      }

      if(def.mode === 'calc'){
        var baseV = def.base;
        var newV = merge(baseV, s.v || {});
        var a = def.calc(baseV);
        var bv = def.calc(newV);
        wrap.querySelector('[data-el="capA"]').textContent = T.base[lang];
        wrap.querySelector('[data-el="capB"]').textContent = T.after[lang];
        wrap.querySelector('[data-el="valA"]').textContent = fmt(a, def.dec, def.unit);
        var vb = wrap.querySelector('[data-el="valB"]');
        vb.textContent = fmt(bv, def.dec, def.unit);
        vb.className = 'wif-val k-' + s.k;
        wrap.querySelector('[data-el="inA"]').textContent = inputLine(def, baseV);
        wrap.querySelector('[data-el="inB"]').textContent = inputLine(def, newV);
        var d = wrap.querySelector('[data-el="dlt"]');
        if(isFinite(a) && isFinite(bv) && a !== 0){
          var pct = (bv - a) / Math.abs(a) * 100;
          d.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct.toFixed(1) + '%';
          d.style.color = pct >= 0 ? 'var(--neon-2)' : 'var(--red)';
        } else { d.textContent = ''; }
      }

      var nt = wrap.querySelector('[data-el="note"]');
      nt.className = 'wif-note k-' + s.k;
      nt.textContent = tx(s.n);

      wrap.querySelector('[data-el="playh"]').textContent = T.play[lang];
      var ul = wrap.querySelector('[data-el="playl"]');
      ul.innerHTML = '';
      var list = def.play[lang] || def.play.en;
      for(var j = 0; j < list.length; j++){
        var li = document.createElement('li');
        li.textContent = list[j];
        ul.appendChild(li);
      }
    }

    wrap.__render = render;
    render();
    return wrap;
  }

  /* ---------- attach panels + tag rows ---------- */
  var panels = [];
  function attach(){
    var vizes = document.querySelectorAll('.term-viz[data-viz]');
    for(var i = 0; i < vizes.length; i++){
      var key = vizes[i].getAttribute('data-viz');
      var def = DATA[key];
      if(!def) continue;
      var row = vizes[i].closest('details.term-row');
      var text = row ? row.querySelector('.term-text') : null;
      if(!row || !text || row.querySelector('.wif')) continue;

      row.dataset.cat = def.cat;
      row.dataset.key = key;
      var bad = 0;
      for(var s = 0; s < def.sc.length; s++){ if(def.sc[s].k === 'bad') bad++; }
      row.dataset.trap = bad;

      var sum = row.querySelector('summary');
      var nameEl = row.querySelector('.term-name');
      if(sum && nameEl && !sum.querySelector('.term-cat')){
        var chip = document.createElement('span');
        chip.className = 'term-cat';
        chip.setAttribute('data-catkey', def.cat);
        chip.textContent = tx(CATS[def.cat]);
        nameEl.parentNode.insertBefore(chip, nameEl.nextSibling);
      }

      var p = buildPanel(key, def);
      text.appendChild(p);
      panels.push(p);
    }
  }

  /* ---------- control rail ---------- */
  var rails = [];
  function buildRail(list){
    var rows = [].slice.call(list.querySelectorAll('details.term-row'));
    if(!rows.length) return;
    for(var i = 0; i < rows.length; i++){ rows[i].dataset.ord = i; }

    var cats = [];
    for(var j = 0; j < rows.length; j++){
      var c = rows[j].dataset.cat;
      if(c && cats.indexOf(c) === -1) cats.push(c);
    }

    var rail = document.createElement('div');
    rail.className = 'ctl-rail';
    rail.innerHTML =
      '<div class="ctl-row" data-el="chips"><span class="ctl-label" data-el="lblF"></span></div>' +
      '<div class="ctl-row" data-el="chipsLvl" hidden></div>' +
      '<div class="ctl-row">' +
        '<input type="text" class="ctl-search" data-el="q">' +
        '<select class="ctl-select" data-el="sort"></select>' +
        '<button type="button" class="ctl-mini" data-el="exp"></button>' +
        '<button type="button" class="ctl-mini" data-el="col"></button>' +
        '<span class="ctl-count" data-el="cnt"></span>' +
      '</div>';
    list.parentNode.insertBefore(rail, list);

    var empty = document.createElement('div');
    empty.className = 'ctl-empty';
    empty.hidden = true;
    list.appendChild(empty);

    var state = { cat: 'all', q: '', sort: 'def', lvl: 'all' };
    var chipWrap = rail.querySelector('[data-el="chips"]');
    var chipWrapLvl = rail.querySelector('[data-el="chipsLvl"]');
    var qEl = rail.querySelector('[data-el="q"]');
    var sortEl = rail.querySelector('[data-el="sort"]');
    var hasLevels = false;
    for(var lv = 0; lv < rows.length; lv++){ if(rows[lv].dataset.level){ hasLevels = true; break; } }

    function apply(){
      var shown = 0;
      var q = state.q.trim().toLowerCase();
      for(var i = 0; i < rows.length; i++){
        var r = rows[i];
        var okCat = state.cat === 'all' || r.dataset.cat === state.cat;
        // once buildMasterDetail (below) has moved a row's real content into
        // the fixed detail pane, r.textContent shrinks to just its summary --
        // __searchText is a one-time snapshot taken before any of that
        // moving starts, so search still matches on the full definition text
        var okQ = !q || (r.__searchText || r.textContent.toLowerCase()).indexOf(q) !== -1;
        var okLvl = state.lvl === 'all' || r.dataset.level === state.lvl;
        var vis = okCat && okQ && okLvl;
        r.classList.toggle('ctl-hidden', !vis);
        if(vis) shown++;
      }
      empty.hidden = shown !== 0;
      empty.textContent = T.none[L()];
      rail.querySelector('[data-el="cnt"]').textContent =
        T.showing[L()] + ' ' + shown + ' ' + T.of[L()] + ' ' + rows.length;
    }

    function resort(){
      var arr = rows.slice();
      if(state.sort === 'az'){
        arr.sort(function(a, b){
          var an = a.querySelector('.term-name'), bn = b.querySelector('.term-name');
          return (an ? an.textContent : '').localeCompare(bn ? bn.textContent : '', L());
        });
      } else if(state.sort === 'cat'){
        arr.sort(function(a, b){
          var c = (a.dataset.cat || '').localeCompare(b.dataset.cat || '');
          return c !== 0 ? c : (+a.dataset.ord) - (+b.dataset.ord);
        });
      } else if(state.sort === 'risk'){
        arr.sort(function(a, b){
          var d = (+b.dataset.trap || 0) - (+a.dataset.trap || 0);
          return d !== 0 ? d : (+a.dataset.ord) - (+b.dataset.ord);
        });
      } else {
        arr.sort(function(a, b){ return (+a.dataset.ord) - (+b.dataset.ord); });
      }
      for(var i = 0; i < arr.length; i++){ list.appendChild(arr[i]); }
      list.appendChild(empty);
    }

    function paintChips(){
      chipWrap.innerHTML = '<span class="ctl-label">' + T.filter[L()] + '</span>';
      var mk = function(id, label, n){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ctl-chip' + (state.cat === id ? ' active' : '');
        b.innerHTML = label + '<span class="cc-n">' + n + '</span>';
        b.addEventListener('click', function(){ state.cat = id; paintChips(); apply(); });
        chipWrap.appendChild(b);
      };
      mk('all', T.all[L()], rows.length);
      for(var i = 0; i < cats.length; i++){
        var n = 0;
        for(var j = 0; j < rows.length; j++){ if(rows[j].dataset.cat === cats[i]) n++; }
        mk(cats[i], tx(CATS[cats[i]]) , n);
      }
    }

    function paintLevelChips(){
      if(!hasLevels) return;
      chipWrapLvl.hidden = false;
      chipWrapLvl.innerHTML = '<span class="ctl-label">' + T.level[L()] + '</span>';
      var mk = function(id, label, n){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ctl-chip' + (state.lvl === id ? ' active' : '');
        b.innerHTML = label + '<span class="cc-n">' + n + '</span>';
        b.addEventListener('click', function(){ state.lvl = id; paintLevelChips(); apply(); });
        chipWrapLvl.appendChild(b);
      };
      mk('all', T.all[L()], rows.length);
      var nBeg = 0, nAdv = 0;
      for(var lv = 0; lv < rows.length; lv++){
        if(rows[lv].dataset.level === 'beginner') nBeg++;
        else if(rows[lv].dataset.level === 'advanced') nAdv++;
      }
      mk('beginner', T.beginner[L()], nBeg);
      mk('advanced', T.advanced[L()], nAdv);
    }

    function paintStatic(){
      qEl.placeholder = T.search[L()];
      rail.querySelector('[data-el="exp"]').textContent = T.expand[L()];
      rail.querySelector('[data-el="col"]').textContent = T.collapse[L()];
      var opts = [['def', T.s_def], ['az', T.s_az], ['cat', T.s_cat], ['risk', T.s_risk]];
      sortEl.innerHTML = '';
      for(var i = 0; i < opts.length; i++){
        var o = document.createElement('option');
        o.value = opts[i][0];
        o.textContent = opts[i][1][L()];
        sortEl.appendChild(o);
      }
      sortEl.value = state.sort;
    }

    qEl.addEventListener('input', function(){ state.q = qEl.value; apply(); });
    sortEl.addEventListener('change', function(){ state.sort = sortEl.value; resort(); });
    rail.querySelector('[data-el="exp"]').addEventListener('click', function(){
      for(var i = 0; i < rows.length; i++){ if(!rows[i].classList.contains('ctl-hidden')) rows[i].open = true; }
    });
    rail.querySelector('[data-el="col"]').addEventListener('click', function(){
      for(var i = 0; i < rows.length; i++){ rows[i].open = false; }
    });

    rail.__repaint = function(){ paintStatic(); paintChips(); paintLevelChips(); apply(); };
    rails.push(rail);
    paintStatic(); paintChips(); paintLevelChips(); apply();
  }

  /* ---------- glossary master-detail (Round R) ----------
     #glossary specifically: instead of a long accordion, a sticky left index
     plus a fixed right-hand pane that shows one term at a time. Only ever
     MOVES each term's existing .term-content-wrap node into the pane (never
     clones it), because the live gauge visuals in part-12.js bind to the
     exact DOM nodes present when that module runs at load -- a clone would
     just sit there static. The original list stays in the DOM (display:none
     via .gl-source) purely so buildRail's search/category filter above still
     has full rows -- see __searchText -- to filter against; it is never shown. */
  var mdInstances = [];
  function buildMasterDetail(list){
    var rows = [].slice.call(list.querySelectorAll('details.term-row'));
    if(!rows.length) return;
    var rail = list.previousElementSibling;
    if(rail && rail.classList && rail.classList.contains('ctl-rail')){
      // "expand all / collapse all" don't mean anything once only one term
      // is ever shown at a time -- hide them rather than leave a dead button
      var expBtn = rail.querySelector('[data-el="exp"]');
      var colBtn = rail.querySelector('[data-el="col"]');
      if(expBtn) expBtn.hidden = true;
      if(colBtn) colBtn.hidden = true;
    }

    for(var s = 0; s < rows.length; s++){ rows[s].__searchText = rows[s].textContent.toLowerCase(); }

    var shell = document.createElement('div');
    shell.className = 'gl-shell';
    list.parentNode.insertBefore(shell, list);

    var nav = document.createElement('div');
    nav.className = 'gl-nav';
    shell.appendChild(nav);

    var detail = document.createElement('div');
    detail.className = 'gl-detail';
    detail.innerHTML =
      '<div class="gl-detail-head"><span class="gl-detail-idx"></span><span class="gl-detail-tag"></span><span class="gl-detail-name"></span></div>' +
      '<div class="gl-detail-body"></div>';
    shell.appendChild(detail);

    list.classList.add('gl-source');
    shell.appendChild(list);

    var detailBody = detail.querySelector('.gl-detail-body');
    var detailIdx = detail.querySelector('.gl-detail-idx');
    var detailTag = detail.querySelector('.gl-detail-tag');
    var detailName = detail.querySelector('.gl-detail-name');
    var navButtons = [];
    var activeI = -1;

    function select(i){
      var row = rows[i];
      var wrap = row.querySelector('.term-content-wrap');
      if(!wrap) return;
      detailBody.innerHTML = '';
      detailBody.appendChild(wrap);
      var idx = row.querySelector('.term-idx');
      var tag = row.querySelector('.term-tag');
      var name = row.querySelector('.term-name');
      detailIdx.textContent = idx ? idx.textContent : '';
      detailTag.textContent = tag ? tag.textContent : '';
      detailName.textContent = name ? name.textContent : '';
      for(var j = 0; j < navButtons.length; j++){ navButtons[j].classList.toggle('active', j === i); }
      row.open = true;
      activeI = i;
      detail.classList.remove('gl-anim');
      void detail.offsetWidth; // restart the CSS animation on repeat selections
      detail.classList.add('gl-anim');
    }

    for(var i = 0; i < rows.length; i++){
      (function(i, row){
        var idx = row.querySelector('.term-idx');
        var tag = row.querySelector('.term-tag');
        var name = row.querySelector('.term-name');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gl-nav-item';
        btn.innerHTML =
          '<span class="gl-nav-idx">' + (idx ? idx.textContent : '') + '</span>' +
          '<span class="gl-nav-tag">' + (tag ? tag.textContent : '') + '</span>' +
          '<span class="gl-nav-name">' + (name ? name.textContent : '') + '</span>';
        btn.addEventListener('click', function(){ select(i); });
        nav.appendChild(btn);
        navButtons.push(btn);
      })(i, rows[i]);
    }

    // Keeps the nav list and the active selection honest whenever the filter
    // rail above hides/shows rows (typing a search, picking a category chip)
    function syncVisibility(){
      var stillVisible = activeI !== -1 && !rows[activeI].classList.contains('ctl-hidden');
      for(var k = 0; k < rows.length; k++){ navButtons[k].hidden = rows[k].classList.contains('ctl-hidden'); }
      if(!stillVisible){
        for(var f = 0; f < rows.length; f++){
          if(!rows[f].classList.contains('ctl-hidden')){ select(f); break; }
        }
      }
    }
    var mo = new MutationObserver(syncVisibility);
    for(var m = 0; m < rows.length; m++){ mo.observe(rows[m], { attributes: true, attributeFilter: ['class'] }); }

    select(0);

    /* ROUND U: #signals now also runs through buildMasterDetail (see boot()
       below), so this module can have two of these instances alive at once
       (glossary's rows and signals' rows) -- window.__spzGlossJump used to
       just get overwritten by whichever instance ran last, which would have
       silently broken deep-links into the other one. Each instance now
       registers itself instead, and the dispatcher (defined once, guarded)
       tries every registered instance until one of them actually has that
       key, so a jump into a glossary term and a jump into a signal term
       both keep working no matter which page built its master-detail last. */
    mdInstances.push({ rows: rows, select: select });
    if(!window.__spzGlossJump){
      window.__spzGlossJump = function(key){
        for(var mi = 0; mi < mdInstances.length; mi++){
          var inst = mdInstances[mi];
          for(var gi = 0; gi < inst.rows.length; gi++){
            if(inst.rows[gi].dataset.key === key){
              inst.rows[gi].classList.remove('ctl-hidden');
              inst.select(gi);
              return;
            }
          }
        }
      };
    }
  }

  /* ---------- theme switch ---------- */
  var THEMES = ['void', 'lime', 'light'];
  function initTheme(){
    var nav = document.querySelector('.nav');
    var langBtn = document.getElementById('langToggle');
    if(!nav) return;
    var box = document.createElement('div');
    box.className = 'theme-switch';
    var saved = 'void';
    try { saved = localStorage.getItem('ma.theme') || 'void'; } catch(e){}
    if(THEMES.indexOf(saved) === -1) saved = 'void';
    document.documentElement.dataset.theme = saved;

    for(var i = 0; i < THEMES.length; i++){
      (function(t){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'theme-dot' + (t === saved ? ' active' : '');
        b.dataset.theme = t;
        b.setAttribute('aria-label', 'Theme ' + t);
        b.addEventListener('click', function(){
          document.documentElement.dataset.theme = t;
          try { localStorage.setItem('ma.theme', t); } catch(e){}
          var dots = box.querySelectorAll('.theme-dot');
          for(var d = 0; d < dots.length; d++){ dots[d].classList.toggle('active', dots[d].dataset.theme === t); }
        });
        box.appendChild(b);
      })(THEMES[i]);
    }
    if(langBtn && langBtn.parentNode === nav) nav.insertBefore(box, langBtn);
    else nav.appendChild(box);
  }

  /* ---------- language memory ---------- */
  function initLangMemory(){
    var btn = document.getElementById('langToggle');
    if(!btn) return;
    var saved = null;
    try { saved = localStorage.getItem('ma.lang'); } catch(e){}
    if(saved === 'th' && document.documentElement.lang !== 'th') btn.click();
  }

  /* ---------- back to top ---------- */
  function initTop(){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'to-top';
    b.setAttribute('aria-label', 'Back to top');
    b.textContent = '↑';
    b.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(b);
    var tick;
    window.addEventListener('scroll', function(){
      clearTimeout(tick);
      tick = setTimeout(function(){ b.classList.toggle('show', window.scrollY > 700); }, 90);
    }, { passive: true });
  }

  /* ---------- language repaint ---------- */
  function repaintAll(){
    for(var i = 0; i < panels.length; i++){ if(panels[i].__render) panels[i].__render(); }
    for(var j = 0; j < rails.length; j++){ if(rails[j].__repaint) rails[j].__repaint(); }
    var chips = document.querySelectorAll('.term-cat[data-catkey]');
    for(var c = 0; c < chips.length; c++){ chips[c].textContent = tx(CATS[chips[c].getAttribute('data-catkey')]); }
    try { localStorage.setItem('ma.lang', L()); } catch(e){}
  }

  /* ---------- boot ---------- */
  function boot(){
    attach();
    var lists = document.querySelectorAll('#glossary .glossary-list, #signals .glossary-list');
    for(var i = 0; i < lists.length; i++){ buildRail(lists[i]); }
    // ROUND U: #signals now gets the same left-index + fixed-detail-pane
    // layout as #glossary (13 signals read just fine as a nav list, and she
    // asked for this page to match the glossary page's layout) -- reusing
    // buildMasterDetail as-is since it was already written generically
    // against whichever `list` element it's handed, never hardcoded to
    // #glossary specifically.
    var glossList = document.querySelector('#glossary .glossary-list');
    if(glossList) buildMasterDetail(glossList);
    var signalsList = document.querySelector('#signals .glossary-list');
    if(signalsList) buildMasterDetail(signalsList);
    initTheme();
    initTop();
    initLangMemory();
    new MutationObserver(repaintAll).observe(document.documentElement, {
      attributes: true, attributeFilter: ['lang']
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
