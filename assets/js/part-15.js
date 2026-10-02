
/* ============================================================================
   SPACEZ TERMINAL v8 — HUB ROUTER · TOOLS MODAL · BEGINNER GUIDE · MARKET OUTLOOK
   ========================================================================= */
(function(){
  'use strict';

/* ---------------- BEGINNER GUIDE ---------------- */
var GUIDE = {
  intro:{
    en:'A short quiz. No right answers — they only map your goal, your time and your stomach onto the four stock archetypes taught in this terminal. Educational only: this is not personalised investment advice.',
    th:'แบบทดสอบสั้นๆ ไม่มีคำตอบถูกผิด มันแค่จับคู่เป้าหมาย เวลา และความทนต่อความผันผวนของคุณ เข้ากับหุ้นทั้งสี่ประเภทที่สอนอยู่ในเทอร์มินัลนี้ — เป็นสื่อการเรียนรู้เท่านั้น ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล'
  },
  q:[
    {t:{en:'What do you actually want the money to do?',th:'คุณอยากให้เงินก้อนนี้ทำอะไรกันแน่?'},
     o:[
      {l:{en:'Grow as much as possible over 10+ years',th:'โตให้มากที่สุดในระยะ 10 ปีขึ้นไป'},w:{g:3,v:1}},
      {l:{en:'Pay me regular cash I can spend',th:'จ่ายเงินสดสม่ำเสมอให้ผมใช้ได้'},w:{d:3,f:1}},
      {l:{en:'Beat inflation without big swings',th:'ชนะเงินเฟ้อโดยไม่เหวี่ยงแรง'},w:{f:3,d:1}},
      {l:{en:'Buy things cheap and wait for the market to notice',th:'ซื้อของถูกแล้วรอให้ตลาดมองเห็น'},w:{v:3,d:1}}
     ]},
    {t:{en:'Your portfolio falls 30% in one month. What do you actually do?',th:'พอร์ตคุณลง 30% ในเดือนเดียว คุณจะทำอะไรจริงๆ?'},
     o:[
      {l:{en:'Buy more — it is on sale',th:'ซื้อเพิ่ม — ของลดราคาแล้ว'},w:{v:3,g:1},r:3},
      {l:{en:'Do nothing and stop opening the app',th:'ไม่ทำอะไร แล้วเลิกเปิดแอปดู'},w:{f:2,d:2},r:2},
      {l:{en:'Sell part of it to sleep at night',th:'ขายบางส่วนเพื่อให้นอนหลับ'},w:{f:3,d:1},r:1},
      {l:{en:'Sell everything — I cannot handle that',th:'ขายทั้งหมด — ผมรับไม่ไหว'},w:{f:4},r:0}
     ]},
    {t:{en:'How long can this money stay invested without you touching it?',th:'เงินก้อนนี้อยู่ในตลาดได้นานแค่ไหนโดยไม่ต้องถอน?'},
     o:[
      {l:{en:'Under 1 year',th:'ไม่ถึง 1 ปี'},w:{f:3},r:0,h:0},
      {l:{en:'1–3 years',th:'1–3 ปี'},w:{d:2,f:2},r:1,h:1},
      {l:{en:'3–10 years',th:'3–10 ปี'},w:{v:2,d:1,g:1},r:2,h:2},
      {l:{en:'10 years or more',th:'10 ปีขึ้นไป'},w:{g:3,v:1},r:3,h:3}
     ]},
    {t:{en:'Realistically, how much time will you spend on this?',th:'พูดตามจริง คุณจะใช้เวลากับเรื่องนี้แค่ไหน?'},
     o:[
      {l:{en:'Almost none — set and forget',th:'แทบไม่มีเลย — ตั้งแล้วลืม'},w:{f:3,d:2},e:0},
      {l:{en:'A check once a month',th:'เช็คเดือนละครั้ง'},w:{d:2,f:1},e:1},
      {l:{en:'A few hours every week',th:'สัปดาห์ละไม่กี่ชั่วโมง'},w:{v:2,g:1},e:2},
      {l:{en:'Daily — I want to learn the tape',th:'ทุกวัน — ผมอยากอ่านตลาดให้เป็น'},w:{g:2,v:1},e:3}
     ]},
    {t:{en:'What have you actually bought before?',th:'ก่อนหน้านี้คุณเคยซื้ออะไรมาแล้วบ้าง?'},
     o:[
      {l:{en:'Nothing yet',th:'ยังไม่เคยเลย'},w:{f:2,d:1},e:0},
      {l:{en:'Funds or ETFs only',th:'เฉพาะกองทุนหรือ ETF'},w:{f:1,d:2},e:1},
      {l:{en:'A handful of individual stocks',th:'หุ้นรายตัวไม่กี่ตัว'},w:{v:2,g:1},e:2},
      {l:{en:'I trade regularly already',th:'ผมเทรดเป็นประจำอยู่แล้ว'},w:{g:2,v:2},e:3}
     ]}
  ],
  arch:{
    v:{n:{en:'Value',th:'หุ้นคุณค่า (Value)'},
       d:{en:'You are drawn to buying a solid business for less than it is worth and waiting. The edge is patience; the danger is the value trap — a price that keeps falling because the business is genuinely deteriorating.',
          th:'คุณถูกใจการซื้อธุรกิจดีในราคาต่ำกว่ามูลค่าแล้วรอ ความได้เปรียบคือความอดทน ส่วนอันตรายคือ value trap — ราคาที่ร่วงต่อเนื่องเพราะธุรกิจแย่ลงจริงๆ'},
       s:{en:['Banking','Industrials','Energy','Materials'],th:['ธนาคาร','อุตสาหกรรม','พลังงาน','วัสดุก่อสร้าง']},
       m:['pe','pb','de','fcf','margin']},
    g:{n:{en:'Growth',th:'หุ้นเติบโต (Growth)'},
       d:{en:'You want businesses expanding fast enough that today\'s price looks silly in ten years. The edge is time; the danger is paying for growth that never arrives, and drawdowns of 50%+ on the way.',
          th:'คุณอยากได้ธุรกิจที่โตเร็วพอจนราคาวันนี้ดูไร้สาระในอีกสิบปี ความได้เปรียบคือเวลา ส่วนอันตรายคือการจ่ายเงินให้การเติบโตที่ไม่เคยมาถึง และการย่อ 50%+ ระหว่างทาง'},
       s:{en:['Technology','Semiconductors','Biotech','E-Commerce'],th:['เทคโนโลยี','เซมิคอนดักเตอร์','ไบโอเทค','อีคอมเมิร์ซ']},
       m:['eps','margin','fcf','pe','beta']},
    d:{n:{en:'Dividend',th:'หุ้นปันผล (Dividend)'},
       d:{en:'You want the cash to show up whether or not the chart cooperates. The edge is a return you can hold through a flat market; the danger is the yield trap — a high yield that only exists because the price collapsed.',
          th:'คุณอยากให้เงินสดเข้าบัญชีไม่ว่ากราฟจะให้ความร่วมมือหรือไม่ ความได้เปรียบคือผลตอบแทนที่ถือผ่านตลาดนิ่งได้ ส่วนอันตรายคือกับดักปันผล — yield สูงที่มีอยู่ได้เพราะราคาพังลงมา'},
       s:{en:['REITs','Utilities','Telecom','Consumer Staples'],th:['กองทรัสต์ REIT','สาธารณูปโภค','โทรคมนาคม','สินค้าอุปโภคบริโภค']},
       m:['divyld','payout','fcf','de','eps']},
    f:{n:{en:'Defensive',th:'หุ้นตั้งรับ (Defensive)'},
       d:{en:'You care more about not losing badly than about winning big. The edge is that you actually stay invested through the ugly years; the danger is quietly underperforming inflation if you never take any risk at all.',
          th:'คุณสนใจการไม่ขาดทุนหนักมากกว่าการชนะใหญ่ ความได้เปรียบคือคุณจะอยู่ในตลาดได้จริงตลอดปีที่แย่ ส่วนอันตรายคือการแพ้เงินเฟ้ออย่างเงียบๆ ถ้าไม่ยอมรับความเสี่ยงเลย'},
       s:{en:['Healthcare','Consumer Staples','Utilities','Insurance'],th:['สุขภาพ','สินค้าจำเป็น','สาธารณูปโภค','ประกันภัย']},
       m:['beta','divyld','de','margin','range52']}
  },
  tiers:[
    {id:0,n:{en:'Step 0 — Foundations before any stock',th:'ขั้นที่ 0 — วางฐานก่อนซื้อหุ้นตัวแรก'},
     l:{en:['Build an emergency fund of 3–6 months of expenses in cash first. Stocks are for money you will not need soon.',
            'Clear any debt costing more than about 10% a year — that is a guaranteed return no stock can promise.',
            'Start with a broad, low-cost index fund or ETF rather than picking single names. It gives you the market\'s return while you learn.',
            'Invest a fixed amount on a fixed date every month (DCA) so the decision is a calendar, not a mood.',
            'Give yourself 6 months of doing only this before buying an individual stock.'],
        th:['สร้างเงินสำรองฉุกเฉิน 3–6 เดือนของค่าใช้จ่ายเป็นเงินสดก่อน หุ้นมีไว้สำหรับเงินที่ยังไม่ต้องใช้เร็วๆ นี้',
            'ปิดหนี้ที่ดอกเบี้ยเกินราวๆ 10% ต่อปีให้หมดก่อน นั่นคือผลตอบแทนที่การันตี ซึ่งไม่มีหุ้นตัวไหนสัญญาให้ได้',
            'เริ่มจากกองทุนดัชนีหรือ ETF ต้นทุนต่ำที่กระจายกว้าง แทนการเลือกหุ้นรายตัว มันให้ผลตอบแทนตลาดในระหว่างที่คุณกำลังเรียนรู้',
            'ลงเงินจำนวนคงที่ในวันคงที่ทุกเดือน (DCA) เพื่อให้การตัดสินใจมาจากปฏิทิน ไม่ใช่อารมณ์',
            'ให้เวลาตัวเองทำแค่นี้ 6 เดือน ก่อนจะซื้อหุ้นรายตัวตัวแรก']}},
    {id:1,n:{en:'Step 1 — First individual positions',th:'ขั้นที่ 1 — หุ้นรายตัวไม้แรก'},
     l:{en:['Keep single stocks under 20–30% of the portfolio. The index core stays the majority.',
            'Cap any one stock at 5% of your total. A total loss then costs 5%, not your year.',
            'Write down before you buy: why you are buying, what would prove you wrong, and what you will do then.',
            'Only buy businesses you can explain to someone else in three sentences.',
            'Use the Position Size tool so a stop-loss never costs more than 1–2% of the account.'],
        th:['ให้หุ้นรายตัวรวมกันไม่เกิน 20–30% ของพอร์ต โดยแกนกลางที่เป็นกองทุนดัชนียังคงเป็นส่วนใหญ่',
            'จำกัดหุ้นตัวเดียวไม่เกิน 5% ของทั้งหมด ถ้าเจ๊งหมดตัวก็เสีย 5% ไม่ใช่เสียทั้งปี',
            'เขียนไว้ก่อนซื้อ: ซื้อเพราะอะไร อะไรจะพิสูจน์ว่าคุณคิดผิด และถ้าเกิดขึ้นแล้วคุณจะทำอะไร',
            'ซื้อเฉพาะธุรกิจที่คุณอธิบายให้คนอื่นฟังได้ใน 3 ประโยค',
            'ใช้เครื่องมือคำนวณขนาดการลงทุน ให้จุดตัดขาดทุนแต่ละครั้งไม่เกิน 1–2% ของบัญชี']}},
    {id:2,n:{en:'Step 2 — Building a real portfolio',th:'ขั้นที่ 2 — สร้างพอร์ตจริงจัง'},
     l:{en:['Hold 8–15 names across at least 4 sectors. Fewer than 8 is a bet; more than 20 is an index with extra work.',
            'Rebalance on a schedule, not on a feeling — once or twice a year is plenty.',
            'Track your portfolio beta and blended yield, not just each stock in isolation.',
            'Keep a written log of every trade and re-read it each quarter. It is the fastest way to find your own repeated mistakes.',
            'Review the thesis, not the price. A stock down 20% with an intact thesis and one with a broken thesis need opposite actions.'],
        th:['ถือ 8–15 ตัว กระจายอย่างน้อย 4 กลุ่มอุตสาหกรรม น้อยกว่า 8 คือการเดิมพัน มากกว่า 20 คือกองทุนดัชนีที่ทำงานเพิ่มเปล่าๆ',
            'ปรับสมดุลพอร์ตตามตาราง ไม่ใช่ตามความรู้สึก ปีละหนึ่งถึงสองครั้งก็เพียงพอ',
            'ติดตามค่าเบต้าและ yield รวมของทั้งพอร์ต ไม่ใช่ดูแค่หุ้นทีละตัวแยกกัน',
            'จดบันทึกทุกการซื้อขายและกลับมาอ่านทุกไตรมาส เป็นวิธีที่เร็วที่สุดในการเจอความผิดพลาดซ้ำๆ ของตัวเอง',
            'ทบทวนเหตุผลการลงทุน ไม่ใช่ทบทวนราคา หุ้นที่ลง 20% โดยเหตุผลยังอยู่ กับหุ้นที่เหตุผลพังแล้ว ต้องทำตรงข้ามกัน']}}
  ],
  avoid:{
    en:['Buying because a price went up fast and you feel late. That feeling is the most expensive emotion in the market.',
        'Averaging down on a position without re-checking whether the business changed.',
        'Confusing a high dividend yield with a good investment — check why the yield is high.',
        'Borrowing money or using margin before you have survived at least one real drawdown.',
        'Taking a stock tip from anyone — including this app — without checking the numbers yourself.'],
    th:['ซื้อเพราะราคาขึ้นเร็วแล้วรู้สึกว่าตัวเองตกรถ ความรู้สึกนั้นคืออารมณ์ที่แพงที่สุดในตลาด',
        'ถัวเฉลี่ยขาลงโดยไม่กลับไปเช็คว่าตัวธุรกิจเปลี่ยนไปหรือยัง',
        'สับสนระหว่าง yield ปันผลสูงกับการลงทุนที่ดี — ต้องเช็คก่อนว่า yield สูงเพราะอะไร',
        'กู้เงินหรือใช้มาร์จิ้นก่อนที่คุณจะเคยผ่านการย่อของจริงมาสักครั้ง',
        'รับคำแนะนำหุ้นจากใครก็ตาม — รวมถึงแอปนี้ — โดยไม่ไปตรวจตัวเลขด้วยตัวเอง']
  }
};

/* ---------------- MARKET CYCLE / OUTLOOK ---------------- */
var OUTLOOK = {
  phases:[
    {id:'early',tone:'',n:{en:'Early cycle',th:'ต้นวัฏจักร'},
     s:{en:'Recovery out of recession',th:'ฟื้นตัวออกจากภาวะถดถอย'},
     d:{en:'Activity bottoms and re-accelerates. Inflation pressure is low, policy is loose, the yield curve is steep. Historically this is where equities post their strongest returns of the whole cycle.',
        th:'กิจกรรมทางเศรษฐกิจแตะจุดต่ำสุดแล้วเร่งขึ้นใหม่ แรงกดดันเงินเฟ้อต่ำ นโยบายผ่อนคลาย เส้นอัตราผลตอบแทนชัน ในอดีตนี่คือช่วงที่หุ้นให้ผลตอบแทนแรงที่สุดของทั้งวัฏจักร'},
     lead:{en:['Cyclicals','Consumer discretionary','Financials','Small caps'],th:['หุ้นวัฏจักร','สินค้าฟุ่มเฟือย','การเงิน','หุ้นเล็ก']},
     lag:{en:['Utilities','Consumer staples'],th:['สาธารณูปโภค','สินค้าจำเป็น']}},
    {id:'mid',tone:'',n:{en:'Mid cycle',th:'กลางวัฏจักร'},
     s:{en:'Broad, self-sustaining expansion',th:'ขยายตัวกว้างและเลี้ยงตัวเองได้'},
     d:{en:'Growth is steadier but slower than the rebound. Inflation starts to build, policy tightens, the curve flattens. Leadership broadens out and the easy beta of the early cycle narrows. This is usually the longest phase.',
        th:'การเติบโตนิ่งขึ้นแต่ช้ากว่าช่วงเด้งกลับ เงินเฟ้อเริ่มก่อตัว นโยบายตึงตัวขึ้น เส้นอัตราผลตอบแทนแบนลง กลุ่มผู้นำตลาดกระจายกว้างขึ้นและความได้เปรียบง่ายๆ ของต้นวัฏจักรแคบลง โดยปกตินี่คือช่วงที่ยาวที่สุด'},
     lead:{en:['Technology','Industrials','Capital goods','Communication'],th:['เทคโนโลยี','อุตสาหกรรม','สินค้าทุน','สื่อสาร']},
     lag:{en:['Deep cyclicals','Highly leveraged names'],th:['หุ้นวัฏจักรจัด','หุ้นที่หนี้สูงมาก']}},
    {id:'late',tone:'warm',n:{en:'Late cycle',th:'ปลายวัฏจักร'},
     s:{en:'Expansion matures, costs bite',th:'การขยายตัวโตเต็มที่ ต้นทุนเริ่มกัด'},
     d:{en:'Growth persists but margins compress as wages, inputs and rates all sit high. The curve may flatten or invert. Defensives and real assets typically start outperforming while the index still makes highs.',
        th:'การเติบโตยังอยู่แต่อัตรากำไรถูกบีบ เพราะค่าแรง ต้นทุน และดอกเบี้ยสูงพร้อมกัน เส้นอัตราผลตอบแทนอาจแบนหรือกลับหัว หุ้นตั้งรับและสินทรัพย์จริงมักเริ่มทำผลงานดีกว่า ทั้งที่ดัชนียังทำจุดสูงสุดใหม่อยู่'},
     lead:{en:['Energy','Materials','Healthcare','Staples'],th:['พลังงาน','วัสดุ','สุขภาพ','สินค้าจำเป็น']},
     lag:{en:['Consumer discretionary','Long-duration growth'],th:['สินค้าฟุ่มเฟือย','หุ้นเติบโตระยะยาวไกล']}},
    {id:'rec',tone:'cold',n:{en:'Recession',th:'ถดถอย'},
     s:{en:'Broad contraction in activity',th:'กิจกรรมหดตัวเป็นวงกว้าง'},
     d:{en:'Output, employment, income and sales fall together — not just two quarters of negative GDP. Policy turns supportive, the curve re-steepens. Cash flow durability and balance-sheet strength decide who survives.',
        th:'ผลผลิต การจ้างงาน รายได้ และยอดขายลดลงพร้อมกัน ไม่ใช่แค่ GDP ติดลบสองไตรมาส นโยบายกลับมาสนับสนุน เส้นอัตราผลตอบแทนชันขึ้นใหม่ ความทนทานของกระแสเงินสดและความแข็งแรงของงบดุลเป็นตัวตัดสินว่าใครรอด'},
     lead:{en:['Utilities','Staples','Healthcare','Quality balance sheets'],th:['สาธารณูปโภค','สินค้าจำเป็น','สุขภาพ','งบดุลแข็งแรง']},
     lag:{en:['Cyclicals','High debt','Unprofitable growth'],th:['หุ้นวัฏจักร','หนี้สูง','หุ้นโตที่ยังขาดทุน']}}
  ],
  here:'mid',
  snapDate:{en:'Data as of early September 2026',th:'ข้อมูล ณ ต้นเดือนกันยายน 2026'},
  snapLede:{
    en:'Where the US economy actually sits right now, using the indicators the cycle framework above is built on. These are observations, not forecasts — and they move every month, so re-check the sources before leaning on them.',
    th:'ตอนนี้เศรษฐกิจสหรัฐฯ อยู่ตรงไหนจริงๆ โดยดูจากตัวชี้วัดชุดเดียวกับที่กรอบวัฏจักรด้านบนใช้ นี่คือข้อสังเกต ไม่ใช่การพยากรณ์ และตัวเลขเปลี่ยนทุกเดือน ให้กลับไปเช็คแหล่งข้อมูลก่อนใช้จริงเสมอ'
  },
  ind:[
    {l:{en:'GDP growth Q2 2026 (2nd estimate)',th:'GDP ไตรมาส 2 ปี 2026 (ประมาณการที่สอง)'},v:'1.5%',k:'warn',
     n:{en:'Held at 1.5% in the second estimate, slower than Q1 at 2.1%, but consumer spending was revised up — the detail underneath was firmer than the headline.',
        th:'ประมาณการที่สองคงไว้ที่ 1.5% ช้าลงจากไตรมาส 1 ที่ 2.1% แต่การใช้จ่ายผู้บริโภคถูกปรับขึ้น รายละเอียดข้างในแข็งกว่าตัวเลขพาดหัว'}},
    {l:{en:'CPI inflation (July, y/y)',th:'เงินเฟ้อ CPI (ก.ค. เทียบปีก่อน)'},v:'3.4%',k:'warn',
     n:{en:'Easing slowly — 3.5% in June, 3.4% in July — but still well above the Fed\'s 2% target. Tariffs and volatile oil keep the path bumpy.',
        th:'ค่อยๆ ลดลง — มิ.ย. 3.5% ก.ค. 3.4% — แต่ยังสูงกว่าเป้าหมาย 2% ของเฟดพอสมควร ภาษีนำเข้าและราคาน้ำมันที่ผันผวนทำให้เส้นทางยังขรุขระ'}},
    {l:{en:'ISM Manufacturing PMI (August)',th:'ดัชนี PMI ภาคผลิต ISM (ส.ค.)'},v:'54.6',k:'good',
     n:{en:'Above 50 means expansion, and this was the eighth month of it in a row. Manufacturing tracking this firmly is a classic mid-cycle reading, not a late-cycle one.',
        th:'เกิน 50 แปลว่าขยายตัว และนี่เป็นเดือนที่แปดติดต่อกัน ภาคผลิตที่แข็งขนาดนี้เป็นค่าที่บ่งชี้กลางวัฏจักรแบบคลาสสิก ไม่ใช่ปลายวัฏจักร'}},
    {l:{en:'ISM Services PMI (August)',th:'ดัชนี PMI ภาคบริการ ISM (ส.ค.)'},v:'55.4',k:'good',
     n:{en:'Services expanding alongside manufacturing, and running slightly ahead of it. When both sit above 50 together, breadth of activity is genuinely wide.',
        th:'ภาคบริการขยายตัวไปพร้อมภาคผลิต และเร็วกว่าเล็กน้อย เมื่อทั้งสองอยู่เหนือ 50 พร้อมกัน ความกว้างของกิจกรรมทางเศรษฐกิจถือว่ากว้างจริง'}},
    {l:{en:'Core capital goods orders (y/y)',th:'คำสั่งซื้อสินค้าทุนหลัก (เทียบปีก่อน)'},v:'+12.5%',k:'good',
     n:{en:'The cleanest read on business investment, and it is running hot — largely the AI and power infrastructure build-out.',
        th:'ตัวชี้วัดการลงทุนภาคธุรกิจที่สะอาดที่สุด และตอนนี้ร้อนแรง ส่วนใหญ่มาจากการสร้างโครงสร้างพื้นฐาน AI และระบบไฟฟ้า'}},
    {l:{en:'Cycle indicator (StreetStats, 14 Aug)',th:'ดัชนีวัฏจักร (StreetStats 14 ส.ค.)'},v:'+0.64',k:'good',
     n:{en:'A composite Z-score reading described as a strengthening mid cycle, with earnings-revision breadth the largest positive contributor.',
        th:'ค่า Z-score รวมที่ถูกอธิบายว่าเป็นกลางวัฏจักรที่กำลังแข็งแรงขึ้น โดยความกว้างของการปรับประมาณการกำไรขึ้นเป็นตัวหนุนบวกมากที่สุด'}}
  ],
  drivers:[
    {t:{en:'AI capital expenditure is the engine',th:'เงินลงทุน AI คือเครื่องยนต์หลัก'},
     d:{en:'Consensus 2026 capex for the major hyperscalers has been revised up sharply toward roughly $772bn and is estimated near $1tn for 2027. Semiconductor earnings growth for 2026 is expected around 86%. This one spending cycle is now touching almost every sector — chips, power, industrials, real estate, materials.',
        th:'ประมาณการเงินลงทุนปี 2026 ของกลุ่มไฮเปอร์สเกลเลอร์ถูกปรับขึ้นแรงไปที่ราวๆ 7.72 แสนล้านดอลลาร์ และคาดว่าใกล้ 1 ล้านล้านในปี 2027 ส่วนการเติบโตของกำไรกลุ่มเซมิคอนดักเตอร์ปี 2026 คาดไว้ราว 86% วัฏจักรการใช้จ่ายรอบเดียวนี้แตะเกือบทุกกลุ่มอุตสาหกรรม ทั้งชิป ไฟฟ้า อุตสาหกรรม อสังหา และวัสดุ'}},
    {t:{en:'Leadership is broadening, not narrowing',th:'ผู้นำตลาดกำลังกระจายกว้าง ไม่ได้แคบลง'},
     d:{en:'Through mid-2026, industrials, energy, healthcare, financials and small caps have been picking up ground that used to belong only to mega-cap tech. The rotation has a reason behind it: those sectors sit downstream of the same power and infrastructure build, at valuations that never got stretched.',
        th:'ตลอดครึ่งแรกของปี 2026 กลุ่มอุตสาหกรรม พลังงาน สุขภาพ การเงิน และหุ้นเล็ก แย่งพื้นที่ที่เคยเป็นของหุ้นเทคขนาดยักษ์กลับมาได้ การหมุนกลุ่มครั้งนี้มีเหตุผลรองรับ เพราะกลุ่มเหล่านั้นอยู่ปลายน้ำของการสร้างระบบไฟฟ้าและโครงสร้างพื้นฐานชุดเดียวกัน บนมูลค่าที่ไม่เคยถูกดันจนตึง'}},
    {t:{en:'Concentration is the risk nobody feels',th:'การกระจุกตัวคือความเสี่ยงที่ไม่มีใครรู้สึก'},
     d:{en:'Semiconductors have grown to roughly 42% of the S&P 500 technology sector and around 20% of the whole index. That means a passive index holder is making a large, undiversified bet on one theme without ever choosing to.',
        th:'กลุ่มเซมิคอนดักเตอร์โตขึ้นจนคิดเป็นราว 42% ของกลุ่มเทคโนโลยีใน S&P 500 และราว 20% ของทั้งดัชนี แปลว่าคนที่ถือกองทุนดัชนีเฉยๆ กำลังเดิมพันก้อนใหญ่แบบไม่กระจายบนธีมเดียว โดยไม่เคยเลือกเองเลย'}},
    {t:{en:'Policy and shocks decide the path',th:'นโยบายและแรงกระแทกเป็นตัวกำหนดเส้นทาง'},
     d:{en:'Inflation above target keeps the rate path uncertain, tariffs continue to move input costs, and Middle East disruption keeps oil volatile. Any of the three can turn a mid-cycle read into a late-cycle one within two quarters.',
        th:'เงินเฟ้อที่สูงกว่าเป้าทำให้เส้นทางดอกเบี้ยยังไม่แน่นอน ภาษีนำเข้ายังขยับต้นทุนวัตถุดิบ และความไม่สงบในตะวันออกกลางทำให้ราคาน้ำมันผันผวน สามอย่างนี้อย่างใดอย่างหนึ่งพลิกภาพจากกลางวัฏจักรเป็นปลายวัฏจักรได้ภายในสองไตรมาส'}}
  ],
  scen:[
    {c:'top',p:{en:'Base case',th:'กรณีฐาน'},t:{en:'Mid cycle extends',th:'กลางวัฏจักรยืดออกไป'},
     d:{en:'Growth holds near 2%, inflation grinds down without reaching target, and the AI capex cycle keeps funding industrials, power and semis. Leadership stays broad. The market gets its returns from earnings, not from multiple expansion.',
        th:'การเติบโตทรงตัวใกล้ 2% เงินเฟ้อค่อยๆ ลดโดยยังไม่ถึงเป้า และวัฏจักรการลงทุน AI ยังหล่อเลี้ยงกลุ่มอุตสาหกรรม ไฟฟ้า และเซมิคอนดักเตอร์ต่อไป ผู้นำตลาดยังกระจายกว้าง ตลาดได้ผลตอบแทนจากกำไร ไม่ใช่จากการขยาย multiple'},
     w:{en:['Earnings revision breadth stays positive','ISM readings hold above 50','Core capex orders keep growing'],
        th:['ความกว้างของการปรับประมาณการกำไรยังเป็นบวก','ค่า ISM ยืนเหนือ 50 ได้','คำสั่งซื้อสินค้าทุนหลักยังโตต่อ']}},
    {c:'mid',p:{en:'Upside case',th:'กรณีบวก'},t:{en:'Inflation breaks lower',th:'เงินเฟ้อทะลุลงล่าง'},
     d:{en:'Tariff effects fade faster than expected, the policy rate falls toward 3% sooner than priced, and growth reaccelerates above 2.5%. Rate-sensitive and small-cap names — the parts that were penalised most by high rates — get the biggest re-rating.',
        th:'ผลของภาษีนำเข้าจางเร็วกว่าคาด อัตราดอกเบี้ยนโยบายลงสู่ราว 3% เร็วกว่าที่ตลาดคิดไว้ และการเติบโตเร่งขึ้นเหนือ 2.5% หุ้นที่อ่อนไหวต่อดอกเบี้ยและหุ้นเล็ก ซึ่งเป็นกลุ่มที่โดนลงโทษหนักสุดจากดอกเบี้ยสูง จะถูกตีมูลค่าใหม่มากที่สุด'},
     w:{en:['Core PCE trending toward 2.7% or below','Yield curve steepening','Small-cap breadth improving'],
        th:['Core PCE มีแนวโน้มลงสู่ 2.7% หรือต่ำกว่า','เส้นอัตราผลตอบแทนชันขึ้น','ความกว้างของหุ้นเล็กดีขึ้น']}},
    {c:'low',p:{en:'Downside case',th:'กรณีลบ'},t:{en:'The AI trade re-prices',th:'ธีม AI ถูกตีราคาใหม่'},
     d:{en:'The question everyone is deferring — whether the eventual profits justify the size of the buildout — gets answered badly, or an oil and tariff shock pushes inflation back up. Given how much of the index sits in semis, an AI de-rating alone would drag the whole benchmark even if the rest of the market is fine.',
        th:'คำถามที่ทุกคนเลื่อนออกไป — ว่ากำไรที่จะเกิดขึ้นจริงคุ้มกับขนาดการลงทุนหรือไม่ — ได้คำตอบที่ไม่ดี หรือแรงกระแทกจากน้ำมันและภาษีดันเงินเฟ้อกลับขึ้น เมื่อดูว่าดัชนีมีน้ำหนักในกลุ่มเซมิคอนดักเตอร์มากแค่ไหน การถูกลดมูลค่าของธีม AI อย่างเดียวก็ลากดัชนีทั้งตัวลงได้ แม้ตลาดส่วนที่เหลือจะปกติดี'},
     w:{en:['Hyperscaler capex guidance revised down','Semiconductor earnings estimates cut','Inflation re-accelerating above 4%'],
        th:['ไฮเปอร์สเกลเลอร์ปรับลดแนวทางการลงทุน','ประมาณการกำไรกลุ่มเซมิคอนดักเตอร์ถูกหั่น','เงินเฟ้อกลับมาเร่งเกิน 4%']}}
  ],
  disc:{
    en:'This section is educational. It describes a well-known cycle framework and summarises publicly reported indicators as of August 2026 — it is not a forecast, not a recommendation, and not personalised advice. Scenario probabilities are not stated because nobody, including this app, knows them. Verify every figure at the source before acting, and remember that sector-rotation timing is notoriously hard to get right.',
    th:'ส่วนนี้เป็นสื่อการเรียนรู้ มันอธิบายกรอบวัฏจักรที่เป็นที่รู้จักกันดี และสรุปตัวชี้วัดที่มีการรายงานสาธารณะ ณ เดือนสิงหาคม 2026 — ไม่ใช่การพยากรณ์ ไม่ใช่คำแนะนำ และไม่ใช่คำปรึกษาเฉพาะบุคคล เราไม่ระบุความน่าจะเป็นของแต่ละกรณี เพราะไม่มีใครรู้ รวมถึงแอปนี้ด้วย ให้ตรวจสอบทุกตัวเลขจากแหล่งต้นทางก่อนตัดสินใจ และจำไว้ว่าการจับจังหวะหมุนกลุ่มอุตสาหกรรมเป็นสิ่งที่ทำให้ถูกได้ยากมาก'
  },
  src:{
    en:'Sources: US Bureau of Economic Analysis (GDP); US Bureau of Labor Statistics via published outlooks (CPI); Institute for Supply Management (PMI); US Bank and Welch & Forbes August 2026 economic outlooks; Richmond Fed business-cycle brief; Fidelity business-cycle framework; State Street Q3 2026 sector perspectives; VanEck mid-2026 sector review; StreetStats market cycle summary.',
    th:'แหล่งข้อมูล: สำนักวิเคราะห์เศรษฐกิจสหรัฐฯ (GDP); สำนักสถิติแรงงานสหรัฐฯ ผ่านรายงานภาพรวมที่เผยแพร่ (CPI); Institute for Supply Management (PMI); รายงานภาพรวมเศรษฐกิจเดือน ส.ค. 2026 ของ US Bank และ Welch & Forbes; บทวิเคราะห์วัฏจักรธุรกิจของเฟดริชมอนด์; กรอบวัฏจักรธุรกิจของ Fidelity; มุมมองรายกลุ่ม Q3 2026 ของ State Street; บทวิเคราะห์กลางปี 2026 ของ VanEck; สรุปวัฏจักรตลาดของ StreetStats'
  },
  /* ---------------- ROUND S: ADVANCED -- valuation checklist × cycle phase ----------------
     Bridges the five beginner/intermediate checks taught on the "basics" page
     (assets/js/part-60.js: P/E, D/E, ROE/Margin, Payout, P/B) to this page's
     own cycle-phase framework. Deliberately reactive to whichever phase is
     currently selected (the same `sel` state the wave/table/cycle buttons
     already drive) rather than one static giant table, so it reads as one
     coherent "what does this phase mean for these five numbers" answer.
     This is the genuinely advanced material the user asked to have moved
     here instead of living on the beginner-facing basics page. */
  valCycle:[
    { key:'pe', t:{en:'P/E — Valuation Multiple', th:'P/E — ตัวคูณมูลค่า'},
      rows:{
        early:{en:'Multiple expansion is normal here — prices re-rate up from depressed, low-multiple lows well before earnings catch up.',
               th:'การขยายตัวของ P/E เป็นเรื่องปกติในช่วงนี้ ราคามักถูกตีมูลค่าใหม่ขึ้นจากจุดต่ำที่ P/E เคยกดต่ำไว้ ก่อนที่กำไรจะตามทัน'},
        mid:{en:'The multiple should track earnings growth roughly one-for-one — watch for prices running ahead of profit as the first warning sign.',
             th:'P/E ควรวิ่งตามการเติบโตของกำไรใกล้เคียงกัน ถ้าราคาวิ่งนำหน้ากำไรไปไกล นั่นคือสัญญาณเตือนแรก'},
        late:{en:'A stretched multiple with slowing earnings growth is the classic late-cycle warning — margins get squeezed exactly when prices are least forgiving.',
              th:'P/E ที่ตึงมือ พร้อมกำไรที่โตช้าลง คือสัญญาณเตือนคลาสสิกของปลายวัฏจักร เพราะมาร์จิ้นถูกบีบพอดีตอนที่ราคาให้อภัยน้อยที่สุด'},
        rec:{en:'Trailing P/E can look artificially low right before earnings collapse — a classic value trap. Forward estimates matter far more here than the headline number.',
             th:'P/E แบบย้อนหลังอาจดูต่ำผิดปกติ ก่อนกำไรจะทรุดจริง — เป็นกับดักมูลค่าคลาสสิก ประมาณการล่วงหน้าสำคัญกว่าตัวเลขพาดหัวมากในช่วงนี้'}
      } },
    { key:'de', t:{en:'D/E — Leverage', th:'D/E — หนี้สินต่อทุน'},
      rows:{
        early:{en:'Leveraged cyclicals get the biggest lift as rates are low and demand re-accelerates — debt is a tailwind here.',
               th:'หุ้นวัฏจักรที่มีหนี้สูงมักได้แรงหนุนมากที่สุด เพราะดอกเบี้ยต่ำและดีมานด์กำลังเร่งกลับมา หนี้กลายเป็นแรงส่งในช่วงนี้'},
        mid:{en:'Moderate leverage is unremarkable; the question shifts to what the debt is funding as rates start climbing.',
             th:'หนี้ระดับปานกลางยังไม่มีนัยพิเศษ คำถามเริ่มเปลี่ยนไปที่ว่าหนี้นั้นเอาไปทำอะไร เพราะดอกเบี้ยเริ่มขยับขึ้น'},
        late:{en:'High D/E turns genuinely dangerous here — rates sit at their highest just as earnings growth slows, squeezing interest coverage from both sides.',
              th:'D/E สูงเริ่มอันตรายจริงในช่วงนี้ เพราะดอกเบี้ยอยู่จุดสูงสุดพอดีกับที่กำไรโตช้าลง บีบความสามารถจ่ายดอกเบี้ยจากสองด้านพร้อมกัน'},
        rec:{en:'Balance-sheet strength decides who survives. Low-D/E names get bought as "quality"; high-D/E names face real solvency risk, not just a rough quarter.',
             th:'ความแข็งแรงของงบดุลคือตัวตัดสินว่าใครรอด หุ้น D/E ต่ำถูกซื้อในฐานะ "คุณภาพดี" ส่วนหุ้น D/E สูงเผชิญความเสี่ยงล้มละลายจริง ไม่ใช่แค่ไตรมาสแย่'}
      } },
    { key:'roe', t:{en:'ROE / Margin — Efficiency', th:'ROE / มาร์จิ้น — ประสิทธิภาพ'},
      rows:{
        early:{en:'Margins are recovering off a cyclical trough — the rate of improvement matters more here than the absolute level.',
               th:'มาร์จิ้นกำลังฟื้นตัวจากจุดต่ำของวัฏจักร อัตราการฟื้นตัวสำคัญกว่าระดับตัวเลขที่แท้จริงในช่วงนี้'},
        mid:{en:'Margins typically peak here as pricing power is strong and costs have not yet caught up — the best read you will get all cycle.',
             th:'มาร์จิ้นมักทำจุดสูงสุดในช่วงนี้ เพราะอำนาจตั้งราคาแข็งแรงและต้นทุนยังตามไม่ทัน เป็นตัวเลขที่ดีที่สุดที่จะเห็นได้ทั้งวัฏจักร'},
        late:{en:'Margins compress as wages, input costs and rates all sit high together — a shrinking margin here is the cycle itself talking, not company-specific news.',
              th:'มาร์จิ้นถูกบีบเพราะค่าแรง ต้นทุนวัตถุดิบ และดอกเบี้ยสูงพร้อมกัน มาร์จิ้นที่หดตัวในช่วงนี้คือสัญญาณจากตัววัฏจักรเอง ไม่ใช่แค่ข่าวเฉพาะบริษัท'},
        rec:{en:'ROE falls broadly across the market. Only genuinely well-run, low-leverage businesses hold theirs up — this is the phase that separates the two.',
             th:'ROE ทรุดตัวทั่วตลาดเป็นวงกว้าง มีแต่ธุรกิจที่บริหารดีจริงและหนี้ต่ำเท่านั้นที่ยังรักษาระดับได้ ช่วงนี้แหละที่แยกสองแบบออกจากกันชัดเจน'}
      } },
    { key:'payout', t:{en:'Payout Ratio — Dividend Safety', th:'Payout Ratio — ความปลอดภัยของปันผล'},
      rows:{
        early:{en:'Low payout is common as companies reinvest into the re-acceleration rather than pay it out — reinvestment usually wins here.',
               th:'Payout ต่ำเป็นเรื่องปกติ เพราะบริษัทเก็บกำไรไปลงทุนต่อกับการฟื้นตัวแทนที่จะจ่ายออก การเก็บไปลงทุนต่อมักคุ้มกว่าในช่วงนี้'},
        mid:{en:'Payout ratios are usually stable here — a rising payout with flat growth is worth a second look even this early.',
             th:'Payout มักทรงตัวในช่วงนี้ ถ้า payout เริ่มขึ้นทั้งที่การเติบโตนิ่ง ควรเช็คเพิ่มเติมแม้จะยังไม่ใช่ปลายวัฏจักรก็ตาม'},
        late:{en:'Payout often creeps up as growth options run out and companies return cash instead — a rising payout ratio can itself be a late-cycle signal.',
              th:'Payout มักค่อยๆ ขึ้น เพราะบริษัทหมดทางเลือกในการโตแล้วหันมาคืนเงินสดแทน payout ที่ขึ้นเรื่อยๆ อาจเป็นสัญญาณปลายวัฏจักรได้ด้วยตัวมันเอง'},
        rec:{en:'This is when payout ratios spike or dividends get cut outright. Coverage — not yield — is the number that matters now.',
             th:'ช่วงนี้แหละที่ payout ratio พุ่งขึ้นหรือปันผลถูกตัดตรงๆ ความสามารถจ่ายได้จริง (coverage) สำคัญกว่าตัวเลขอัตราปันผลมากในตอนนี้'}
      } },
    { key:'pb', t:{en:'P/B — Book-Value Floor', th:'P/B — พื้นมูลค่าทางบัญชี'},
      rows:{
        early:{en:'For asset-heavy cyclicals, P/B often bottoms right here as book value stabilizes and the market starts paying up for the same assets again.',
               th:'สำหรับหุ้นวัฏจักรที่ใช้สินทรัพย์หนัก P/B มักทำจุดต่ำสุดพอดีในช่วงนี้ เมื่อมูลค่าทางบัญชีเริ่มนิ่งและตลาดเริ่มยอมจ่ายแพงขึ้นสำหรับสินทรัพย์ชุดเดิม'},
        mid:{en:'P/B fades into the background — asset-light growth stories dominate leadership, and book value tells you little about them.',
             th:'P/B แทบไม่มีบทบาทในช่วงนี้ เพราะหุ้นเติบโตที่ใช้สินทรัพย์น้อยเป็นผู้นำตลาด และมูลค่าทางบัญชีบอกอะไรเกี่ยวกับหุ้นกลุ่มนี้ได้น้อยมาก'},
        late:{en:'P/B becomes relevant again as money rotates toward tangible-asset defensives — a real floor investors actually start caring about once more.',
              th:'P/B กลับมามีความหมายอีกครั้ง เมื่อเงินหมุนไปหาหุ้นตั้งรับที่มีสินทรัพย์จับต้องได้ เป็น "พื้น" มูลค่าจริงที่นักลงทุนเริ่มสนใจอีกครั้ง'},
        rec:{en:'For quality, asset-heavy names, P/B near or below 1x becomes an actionable floor to watch — this is the one phase where the "everything went wrong tomorrow" test gets used for real.',
             th:'สำหรับหุ้นสินทรัพย์หนักที่มีคุณภาพ P/B ใกล้หรือต่ำกว่า 1 เท่า กลายเป็น "พื้น" ที่ใช้ดูได้จริง เป็นช่วงเดียวที่คำถาม "ถ้าพรุ่งนี้ทุกอย่างพังหมด" ถูกนำมาใช้จริงๆ'}
      } }
  ]
};

/* ---------------- EXTRA GUIDE QUESTIONS (appended to the original five) ------- */
var GUIDE_EXTRA = [
  {t:{en:'Which market do you actually want to own?',th:'คุณอยากถือหุ้นตลาดไหนจริงๆ?'},
   o:[
    {l:{en:'Thai stocks — I understand these businesses',th:'หุ้นไทย — ผมเข้าใจธุรกิจพวกนี้'},w:{d:1,v:1},mkt:'th'},
    {l:{en:'US / global — bigger companies, deeper market',th:'สหรัฐฯ / ต่างประเทศ — บริษัทใหญ่กว่า ตลาดลึกกว่า'},w:{g:2},mkt:'us'},
    {l:{en:'Both — split across the two',th:'ทั้งสองตลาด — แบ่งกันไป'},w:{g:1,v:1},mkt:'both'},
    {l:{en:'No idea yet — tell me',th:'ยังไม่รู้เลย — ช่วยแนะนำหน่อย'},w:{f:1},mkt:'both'}
   ]},
  {t:{en:'What is the worst single year you could live with?',th:'ปีที่แย่ที่สุดที่คุณรับได้คือเท่าไหร่?'},
   o:[
    {l:{en:'−10% — anything more and I panic',th:'−10% — มากกว่านี้ผมแพนิค'},w:{f:4},r:0},
    {l:{en:'−20% — uncomfortable but survivable',th:'−20% — อึดอัดแต่ยังรอด'},w:{d:2,f:2},r:1},
    {l:{en:'−35% — that is the price of admission',th:'−35% — นั่นคือค่าผ่านประตู'},w:{v:2,g:2},r:2},
    {l:{en:'−50% or more — I have seen it before',th:'−50% ขึ้นไป — ผมเคยเจอมาแล้ว'},w:{g:4},r:3}
   ]},
  {t:{en:'What would actually make you sell a position?',th:'อะไรที่จะทำให้คุณขายหุ้นตัวหนึ่งจริงๆ?'},
   o:[
    {l:{en:'It hit the stop-loss I set before buying',th:'มันแตะจุดตัดขาดทุนที่ตั้งไว้ก่อนซื้อ'},w:{g:2,v:1},r:2,e:2},
    {l:{en:'The reason I bought it stopped being true',th:'เหตุผลที่ผมซื้อมันไม่จริงอีกต่อไปแล้ว'},w:{v:3},r:2,e:3},
    {l:{en:'I need the money for something else',th:'ผมต้องใช้เงินไปทำอย่างอื่น'},w:{f:2,d:1},r:1,e:0},
    {l:{en:'Bad news makes me nervous enough',th:'ข่าวร้ายทำให้ผมกังวลมากพอ'},w:{f:3},r:0,e:0}
   ]},
  {t:{en:'A stock you own does nothing for two full years. Then what?',th:'หุ้นที่คุณถือไม่ขยับเลยสองปีเต็ม แล้วยังไงต่อ?'},
   o:[
    {l:{en:'Keep adding on schedule — that is the plan',th:'ซื้อเพิ่มตามตารางต่อไป — นั่นคือแผน'},w:{v:2,d:2},h:3},
    {l:{en:'Hold and collect whatever dividend there is',th:'ถือไว้และเก็บปันผลเท่าที่มี'},w:{d:3},h:3},
    {l:{en:'Re-check the numbers, then decide',th:'กลับไปเช็คตัวเลขใหม่ แล้วค่อยตัดสินใจ'},w:{v:2,g:1},h:2,e:2},
    {l:{en:'Move the money somewhere it is working',th:'ย้ายเงินไปที่ที่มันทำงาน'},w:{g:3},h:1}
   ]},
  /* Round V (#213): two tie-breaker questions. The eight above already split
     value/growth/dividend/defensive fairly well on their own, but scores
     often land close together — these two ask the same choice more directly,
     which sharpens the final percentages rather than widening coverage. */
  {t:{en:'A company you own pays no dividend at all. How do you feel about that?',th:'หุ้นที่คุณถือไม่จ่ายปันผลเลยสักบาท คุณรู้สึกยังไง?'},
   o:[
    {l:{en:'Good — I want every baht of profit reinvested in the business',th:'ดีแล้ว — อยากให้กำไรทุกบาทถูกเอาไปลงทุนต่อในธุรกิจ'},w:{g:3}},
    {l:{en:'Fine, as long as the share price does the work instead',th:'โอเค ตราบใดที่ราคาหุ้นทำหน้าที่แทน'},w:{v:2,g:1}},
    {l:{en:'I would rather see some cash come back to me',th:'อยากให้มีเงินสดกลับมาหาผมบ้าง'},w:{d:2,f:1}},
    {l:{en:'I actively avoid companies that do not pay one',th:'ผมหลีกเลี่ยงหุ้นที่ไม่จ่ายปันผลเลย'},w:{d:3,f:1}}
   ]},
  {t:{en:'Forced to pick just one, which sentence is truest for you?',th:'ถ้าต้องเลือกแค่ประโยคเดียว ประโยคไหนตรงกับคุณที่สุด?'},
   o:[
    {l:{en:'I would rather be early and sometimes wrong than late and safe',th:'ผมยอมมาก่อนแล้วบางทีคิดผิด ดีกว่ามาช้าแต่ปลอดภัย'},w:{g:3}},
    {l:{en:'I would rather buy proven, unglamorous businesses cheaply',th:'ผมอยากซื้อธุรกิจที่พิสูจน์ตัวเองแล้วแต่ไม่หวือหวา ในราคาถูก'},w:{v:3}},
    {l:{en:'I want my portfolio to feel boring',th:'ผมอยากให้พอร์ตของผมรู้สึกน่าเบื่อ'},w:{f:3}},
    {l:{en:'I want it to pay me like a second paycheck',th:'ผมอยากให้มันจ่ายผมเหมือนเงินเดือนที่สอง'},w:{d:3}}
   ]}
];

/* ---------------- STARTER SHORTLISTS ----------------------------------------
   Educational examples of companies that illustrate each archetype.
   Deliberately no valuation figures: those change weekly and must be checked
   at the source. Not recommendations.                                        */
var PICKS = {
  etf:{
    t:{en:'Start here — index funds & ETFs',th:'เริ่มที่นี่ก่อน — กองทุนดัชนีและ ETF'},
    us:[
      {tk:'VOO',n:{en:'Vanguard S&P 500 ETF',th:'กองทุน ETF อิง S&P 500'},s:'INDEX',
       p:{en:'Owns the 500 largest US companies in one line, at a very low fee.',th:'ถือ 500 บริษัทใหญ่ที่สุดของสหรัฐฯ ในบรรทัดเดียว ค่าธรรมเนียมต่ำมาก'},
       w:{en:'Heavily weighted to mega-cap tech — that is a concentration you did not choose.',th:'น้ำหนักเอียงไปทางหุ้นเทคขนาดยักษ์มาก — เป็นการกระจุกตัวที่คุณไม่ได้เลือกเอง'}},
      {tk:'VTI',n:{en:'Vanguard Total US Market',th:'กองทุนหุ้นสหรัฐฯ ทั้งตลาด'},s:'INDEX',
       p:{en:'The whole US market including small and mid caps, not just the big 500.',th:'ทั้งตลาดสหรัฐฯ รวมหุ้นเล็กและกลาง ไม่ใช่แค่ 500 ตัวใหญ่'},
       w:{en:'Still a single-country bet — no exposure outside the US at all.',th:'ยังเป็นการเดิมพันประเทศเดียว ไม่มีสัดส่วนนอกสหรัฐฯ เลย'}},
      {tk:'VT',n:{en:'Vanguard Total World Stock',th:'กองทุนหุ้นทั้งโลก'},s:'INDEX',
       p:{en:'Global diversification in one ticker — developed and emerging markets together.',th:'กระจายทั่วโลกในตัวเดียว รวมทั้งตลาดพัฒนาแล้วและตลาดเกิดใหม่'},
       w:{en:'Returns lag the US index in years when America leads, which has been most of them.',th:'ผลตอบแทนแพ้ดัชนีสหรัฐฯ ในปีที่อเมริกานำ ซึ่งเป็นส่วนใหญ่ของช่วงที่ผ่านมา'}},
      {tk:'SCHD',n:{en:'Schwab US Dividend Equity',th:'กองทุนหุ้นปันผลสหรัฐฯ'},s:'INCOME',
       p:{en:'Screens for companies with a long record of paying and raising dividends.',th:'คัดกรองบริษัทที่มีประวัติจ่ายและขึ้นปันผลยาวนาน'},
       w:{en:'Skips most high-growth names by design, so it lags hard in tech-led rallies.',th:'ตัดหุ้นเติบโตสูงออกโดยการออกแบบ จึงตามหลังมากในรอบที่หุ้นเทคนำตลาด'}},
      {tk:'QQQ',n:{en:'Invesco Nasdaq-100',th:'กองทุนอิงดัชนีแนสแด็ก-100'},s:'GROWTH',
       p:{en:'Concentrated exposure to the largest technology and growth companies.',th:'ถือหุ้นเทคโนโลยีและหุ้นเติบโตรายใหญ่แบบเข้มข้น'},
       w:{en:'Fell over 50% in 2000 and again in 2008 — this is not a beginner core holding.',th:'เคยลงเกิน 50% ทั้งปี 2000 และ 2008 — นี่ไม่ใช่แกนพอร์ตสำหรับมือใหม่'}}
    ],
    th:[
      {tk:'TDEX',n:{en:'ThaiDEX SET50 ETF',th:'กองทุน ETF อิง SET50'},s:'INDEX',
       p:{en:'Tracks the 50 largest Thai listed companies in one purchase.',th:'ตามดัชนี 50 บริษัทใหญ่ที่สุดในตลาดหุ้นไทย ซื้อครั้งเดียวได้ทั้งตะกร้า'},
       w:{en:'The Thai index is concentrated in energy, banks and retail — narrow by global standards.',th:'ดัชนีไทยกระจุกในกลุ่มพลังงาน ธนาคาร และค้าปลีก ถือว่าแคบเมื่อเทียบมาตรฐานโลก'}},
      {tk:'ESGE',n:{en:'Thai index funds via RMF/SSF',th:'กองทุนดัชนีไทยผ่าน RMF / SSF / ThaiESG'},s:'TAX',
       p:{en:'Same index exposure, but the contribution may reduce your taxable income.',th:'ได้สัดส่วนดัชนีเหมือนกัน แต่เงินที่ลงอาจใช้ลดหย่อนภาษีได้'},
       w:{en:'Locked up for years — check the holding rules before you commit money you may need.',th:'ติดเงื่อนไขถือหลายปี ต้องอ่านกติกาให้ครบก่อนลงเงินที่อาจต้องใช้'}},
      {tk:'GLOBAL',n:{en:'Global equity funds sold in Thailand',th:'กองทุนหุ้นต่างประเทศที่ขายในไทย'},s:'GLOBAL',
       p:{en:'The simplest way to hold world equities in baht without a foreign brokerage account.',th:'วิธีที่ง่ายที่สุดในการถือหุ้นทั่วโลกเป็นเงินบาท โดยไม่ต้องเปิดพอร์ตต่างประเทศ'},
       w:{en:'Fees are usually much higher than buying the ETF directly, and FX moves both ways.',th:'ค่าธรรมเนียมมักสูงกว่าซื้อ ETF ตรงมาก และค่าเงินวิ่งได้ทั้งสองทาง'}},
      {tk:'BOND',n:{en:'Thai government bond funds',th:'กองทุนพันธบัตรรัฐบาลไทย'},s:'BOND',
       p:{en:'The ballast that lets you hold equities through a bad year without selling.',th:'ตัวถ่วงที่ทำให้คุณถือหุ้นผ่านปีที่แย่ได้โดยไม่ต้องขาย'},
       w:{en:'Loses to inflation over long horizons — this is a shock absorber, not a growth engine.',th:'แพ้เงินเฟ้อในระยะยาว — นี่คือโช้คอัพ ไม่ใช่เครื่องยนต์การเติบโต'}},
      {tk:'GOLD',n:{en:'Gold funds / gold ETFs',th:'กองทุนทองคำ / ETF ทองคำ'},s:'HEDGE',
       p:{en:'Historically moves independently of stocks, which is what diversification means.',th:'ในอดีตเคลื่อนไหวเป็นอิสระจากหุ้น ซึ่งนั่นคือความหมายของการกระจายความเสี่ยง'},
       w:{en:'Produces no earnings and no dividend — it can go nowhere for a decade.',th:'ไม่สร้างกำไรและไม่จ่ายปันผล — มันนิ่งได้เป็นสิบปี'}}
    ]
  },
  v:{us:[
      {tk:'JPM',n:{en:'JPMorgan Chase',th:'เจพีมอร์แกน เชส'},s:'BANK',
       p:{en:'The scale leader in US banking; earns more on the same balance sheet than peers.',th:'ผู้นำด้านขนาดในธนาคารสหรัฐฯ ทำกำไรจากงบดุลขนาดเท่ากันได้มากกว่าคู่แข่ง'},
       w:{en:'Bank earnings swing with the credit cycle — a recession hits the loan book first.',th:'กำไรธนาคารเหวี่ยงตามวัฏจักรสินเชื่อ ภาวะถดถอยกระทบพอร์ตสินเชื่อเป็นอันดับแรก'}},
      {tk:'BAC',n:{en:'Bank of America',th:'แบงก์ ออฟ อเมริกา'},s:'BANK',
       p:{en:'Huge low-cost deposit base — profits rise mechanically when rates stay high.',th:'ฐานเงินฝากต้นทุนต่ำขนาดใหญ่ กำไรขึ้นเชิงกลไกเมื่อดอกเบี้ยยืนสูง'},
       w:{en:'The same rate sensitivity works in reverse when the Fed starts cutting.',th:'ความอ่อนไหวต่อดอกเบี้ยตัวเดียวกันทำงานย้อนกลับเมื่อเฟดเริ่มลดดอกเบี้ย'}},
      {tk:'XOM',n:{en:'ExxonMobil',th:'เอ็กซอนโมบิล'},s:'ENERGY',
       p:{en:'Low debt for its size and one of the cheapest production cost bases in the industry.',th:'หนี้ต่ำเมื่อเทียบขนาด และมีต้นทุนการผลิตต่ำที่สุดรายหนึ่งในอุตสาหกรรม'},
       w:{en:'You are buying the oil price as much as the company — and it is out of anyone\'s control.',th:'คุณกำลังซื้อราคาน้ำมันพอๆ กับซื้อบริษัท และมันอยู่นอกเหนือการควบคุมของใครทั้งนั้น'}},
      {tk:'CVX',n:{en:'Chevron',th:'เชฟรอน'},s:'ENERGY',
       p:{en:'Long record of protecting the dividend through oil downturns others cut in.',th:'มีประวัติยาวนานในการรักษาปันผลผ่านช่วงน้ำมันตกต่ำที่รายอื่นตัดปันผล'},
       w:{en:'Same commodity exposure, plus long-term questions about energy transition demand.',th:'ผูกกับสินค้าโภคภัณฑ์เหมือนกัน บวกคำถามระยะยาวเรื่องความต้องการในยุคเปลี่ยนผ่านพลังงาน'}},
      {tk:'C',n:{en:'Citigroup',th:'ซิตี้กรุ๊ป'},s:'BANK',
       p:{en:'Trades at a discount to book value — the classic setup value investors hunt for.',th:'ซื้อขายต่ำกว่ามูลค่าทางบัญชี ซึ่งเป็นรูปแบบคลาสสิกที่นักลงทุนเน้นคุณค่าตามหา'},
       w:{en:'Cheap for a reason: a multi-year restructuring that has disappointed before.',th:'ถูกด้วยเหตุผล — การปรับโครงสร้างหลายปีที่เคยทำให้ผิดหวังมาแล้ว'}}
    ],
    th:[
      {tk:'KBANK',n:{en:'Kasikornbank',th:'ธนาคารกสิกรไทย'},s:'BANK',
       p:{en:'One of the strongest digital banking franchises in Thailand, with a large SME base.',th:'หนึ่งในธนาคารที่แข็งแรงที่สุดด้านดิจิทัลในไทย พร้อมฐานลูกค้า SME ขนาดใหญ่'},
       w:{en:'Thai household debt is high — asset quality is the number to watch every quarter.',th:'หนี้ครัวเรือนไทยสูง คุณภาพสินทรัพย์คือตัวเลขที่ต้องดูทุกไตรมาส'}},
      {tk:'BBL',n:{en:'Bangkok Bank',th:'ธนาคารกรุงเทพ'},s:'BANK',
       p:{en:'The most conservative big Thai bank, with heavy corporate and regional exposure.',th:'ธนาคารใหญ่ที่อนุรักษ์นิยมที่สุดของไทย เน้นลูกค้าองค์กรและมีฐานในภูมิภาค'},
       w:{en:'Conservative also means slower growth — this is a patience holding, not a mover.',th:'อนุรักษ์นิยมก็แปลว่าโตช้า — นี่คือหุ้นที่ต้องใช้ความอดทน ไม่ใช่หุ้นวิ่ง'}},
      {tk:'SCB',n:{en:'SCB X',th:'เอสซีบี เอกซ์'},s:'BANK',
       p:{en:'Holding structure that separates the bank from higher-growth fintech ventures.',th:'โครงสร้างโฮลดิ้งที่แยกธุรกิจธนาคารออกจากธุรกิจฟินเทคที่โตเร็วกว่า'},
       w:{en:'The fintech arms burn cash — check whether they are yet contributing profit.',th:'ธุรกิจฟินเทคเผาเงินสด ต้องเช็คว่าเริ่มสร้างกำไรจริงหรือยัง'}},
      {tk:'PTT',n:{en:'PTT PCL',th:'ปตท.'},s:'ENERGY',
       p:{en:'Thailand\'s energy backbone — gas, refining and petrochemicals under one roof.',th:'กระดูกสันหลังพลังงานของไทย ทั้งก๊าซ โรงกลั่น และปิโตรเคมีอยู่ในเครือเดียว'},
       w:{en:'State-linked, so pricing and policy decisions are not purely commercial.',th:'เกี่ยวข้องกับรัฐ การตัดสินใจเรื่องราคาและนโยบายจึงไม่ใช่เชิงพาณิชย์ล้วนๆ'}},
      {tk:'SCC',n:{en:'Siam Cement Group',th:'ปูนซิเมนต์ไทย'},s:'MATERIAL',
       p:{en:'Dominant in Thai construction materials with a large regional petrochemical arm.',th:'ครองตลาดวัสดุก่อสร้างไทย และมีธุรกิจปิโตรเคมีขนาดใหญ่ในภูมิภาค'},
       w:{en:'Deeply cyclical — petrochemical margins can stay compressed for years.',th:'วัฏจักรจัด อัตรากำไรปิโตรเคมีถูกบีบต่อเนื่องได้เป็นปีๆ'}}
    ]},
  g:{us:[
      {tk:'NVDA',n:{en:'Nvidia',th:'เอ็นวิเดีย'},s:'SEMI',
       p:{en:'Sells the picks and shovels of the AI buildout, with software lock-in on top.',th:'ขายพลั่วและจอบของการสร้าง AI พร้อมมีซอฟต์แวร์ที่ล็อกลูกค้าไว้อีกชั้น'},
       w:{en:'Priced for years of flawless execution; any capex slowdown re-rates it fast.',th:'ราคาสะท้อนการทำได้ไร้ที่ติหลายปีข้างหน้า ถ้าการลงทุนชะลอ มันจะถูกตีราคาใหม่เร็วมาก'}},
      {tk:'MSFT',n:{en:'Microsoft',th:'ไมโครซอฟท์'},s:'SOFTWARE',
       p:{en:'Recurring enterprise revenue plus Azure — growth with far less volatility than pure AI plays.',th:'รายได้ประจำจากลูกค้าองค์กรบวก Azure — โตได้โดยผันผวนน้อยกว่าหุ้น AI ล้วนๆ'},
       w:{en:'Enormous AI capex is turning an asset-light business asset-heavy.',th:'เงินลงทุน AI มหาศาลกำลังเปลี่ยนธุรกิจที่เคยใช้สินทรัพย์น้อยให้ใช้สินทรัพย์หนัก'}},
      {tk:'AMZN',n:{en:'Amazon',th:'อเมซอน'},s:'CLOUD',
       p:{en:'Two businesses in one: low-margin retail funding the high-margin AWS engine.',th:'สองธุรกิจในตัวเดียว ค้าปลีกมาร์จิ้นต่ำหล่อเลี้ยงเครื่องยนต์ AWS ที่มาร์จิ้นสูง'},
       w:{en:'Retail margins are thin enough that a consumer slowdown shows up immediately.',th:'มาร์จิ้นค้าปลีกบางพอที่การชะลอตัวของผู้บริโภคจะเห็นผลทันที'}},
      {tk:'META',n:{en:'Meta Platforms',th:'เมตา'},s:'ADS',
       p:{en:'Four platforms with billions of users and industry-leading advertising margins.',th:'สี่แพลตฟอร์มที่มีผู้ใช้ระดับพันล้าน และอัตรากำไรโฆษณาที่นำอุตสาหกรรม'},
       w:{en:'Regulatory pressure plus heavy spending on projects with no revenue yet.',th:'แรงกดดันด้านกฎระเบียบ บวกการใช้จ่ายหนักกับโครงการที่ยังไม่มีรายได้'}},
      {tk:'AMD',n:{en:'Advanced Micro Devices',th:'เอเอ็มดี'},s:'SEMI',
       p:{en:'The credible second source in AI accelerators, which customers actively want to exist.',th:'ทางเลือกที่สองที่น่าเชื่อถือในชิปเร่ง AI ซึ่งลูกค้าอยากให้มีอยู่จริงๆ'},
       w:{en:'Second place in a winner-takes-most market is a very different investment.',th:'ที่สองในตลาดที่ผู้ชนะกินเกือบหมด เป็นการลงทุนคนละแบบโดยสิ้นเชิง'}}
    ],
    th:[
      {tk:'DELTA',n:{en:'Delta Electronics Thailand',th:'เดลต้า อีเลคโทรนิคส์'},s:'ELECTRON',
       p:{en:'Power systems and cooling for data centres — a direct Thai link to the AI buildout.',th:'ระบบไฟฟ้าและระบายความร้อนสำหรับดาต้าเซ็นเตอร์ — จุดเชื่อมตรงของไทยกับการสร้าง AI'},
       w:{en:'Has traded at extreme multiples and carries very large weight in the Thai index.',th:'เคยซื้อขายที่ multiple สูงลิ่ว และมีน้ำหนักมากในดัชนีไทย'}},
      {tk:'GULF',n:{en:'Gulf Development',th:'กัลฟ์ ดีเวลลอปเมนท์'},s:'POWER',
       p:{en:'Long-term power purchase contracts plus infrastructure and digital ventures.',th:'สัญญาซื้อขายไฟฟ้าระยะยาว บวกธุรกิจโครงสร้างพื้นฐานและดิจิทัล'},
       w:{en:'Growth is debt-funded — read the interest coverage before the growth story.',th:'การเติบโตใช้หนี้เป็นตัวขับ ให้อ่าน Interest Coverage ก่อนอ่านเรื่องราวการเติบโต'}},
      {tk:'CPALL',n:{en:'CP All',th:'ซีพี ออลล์'},s:'RETAIL',
       p:{en:'Operates 7-Eleven in Thailand — daily cash flow from a network few can replicate.',th:'ดำเนินการ 7-Eleven ในไทย กระแสเงินสดรายวันจากเครือข่ายที่แทบไม่มีใครทำตามได้'},
       w:{en:'Carries meaningful debt from acquisitions and is tied to Thai consumer spending.',th:'มีหนี้ก้อนใหญ่จากการซื้อกิจการ และผูกกับกำลังซื้อผู้บริโภคไทย'}},
      {tk:'AOT',n:{en:'Airports of Thailand',th:'ท่าอากาศยานไทย'},s:'INFRA',
       p:{en:'A near-monopoly on Thai airport traffic — a direct play on tourism recovery.',th:'เกือบผูกขาดการจราจรทางอากาศของไทย เป็นการลงทุนตรงกับการฟื้นตัวของท่องเที่ยว'},
       w:{en:'Traffic collapses in any travel shock, and concession terms are politically decided.',th:'ปริมาณผู้โดยสารทรุดทันทีเมื่อมีแรงกระแทกด้านการเดินทาง และเงื่อนไขสัมปทานตัดสินโดยการเมือง'}},
      {tk:'MINT',n:{en:'Minor International',th:'ไมเนอร์ อินเตอร์เนชั่นแนล'},s:'HOTEL',
       p:{en:'Hotels and restaurants across Asia and Europe — geographically diversified for a Thai name.',th:'โรงแรมและร้านอาหารทั่วเอเชียและยุโรป กระจายภูมิศาสตร์กว้างสำหรับหุ้นไทย'},
       w:{en:'High operating leverage cuts both ways, and European exposure adds currency risk.',th:'Operating leverage สูงทำงานทั้งสองทาง และสัดส่วนยุโรปเพิ่มความเสี่ยงค่าเงิน'}}
    ]},
  d:{us:[
      {tk:'O',n:{en:'Realty Income',th:'เรียลตี้ อินคัม'},s:'REIT',
       p:{en:'Pays monthly and has raised the dividend for decades across several recessions.',th:'จ่ายรายเดือนและขึ้นปันผลต่อเนื่องหลายสิบปี ผ่านภาวะถดถอยมาหลายรอบ'},
       w:{en:'REIT prices fall when rates rise — the yield can rise while your capital shrinks.',th:'ราคา REIT ลงเมื่อดอกเบี้ยขึ้น — yield ขึ้นได้ในขณะที่เงินต้นคุณหด'}},
      {tk:'VZ',n:{en:'Verizon',th:'เวอไรซอน'},s:'TELECOM',
       p:{en:'Utility-like subscription revenue supporting one of the highest large-cap yields.',th:'รายได้แบบสมัครสมาชิกคล้ายสาธารณูปโภค หนุน yield ที่สูงที่สุดรายหนึ่งในหุ้นใหญ่'},
       w:{en:'Heavy debt and near-zero growth — check that FCF still covers the payout.',th:'หนี้หนักและแทบไม่โต ต้องเช็คว่ากระแสเงินสดอิสระยังจ่ายปันผลไหวอยู่'}},
      {tk:'DUK',n:{en:'Duke Energy',th:'ดุ๊ก เอนเนอร์จี'},s:'UTILITY',
       p:{en:'Regulated utility with earnings set by rate cases, not by the economy.',th:'สาธารณูปโภคที่ถูกกำกับ กำไรกำหนดโดยการอนุมัติค่าไฟ ไม่ใช่โดยเศรษฐกิจ'},
       w:{en:'Regulation caps the upside as reliably as it protects the downside.',th:'การกำกับดูแลจำกัดขาขึ้นได้แน่นอนพอๆ กับที่มันปกป้องขาลง'}},
      {tk:'PEP',n:{en:'PepsiCo',th:'เป๊ปซี่โค'},s:'STAPLES',
       p:{en:'Snacks plus drinks — pricing power that has passed through cost shocks before.',th:'ขนมบวกเครื่องดื่ม มีอำนาจตั้งราคาที่เคยผลักภาระต้นทุนไปได้มาแล้ว'},
       w:{en:'Volume growth is slow; too much of the story rests on raising prices.',th:'ปริมาณขายโตช้า เรื่องราวส่วนใหญ่พึ่งพาการขึ้นราคามากเกินไป'}},
      {tk:'MO',n:{en:'Altria',th:'อัลเทรีย'},s:'TOBACCO',
       p:{en:'Extreme cash generation and one of the highest sustained yields in the index.',th:'สร้างเงินสดสูงมาก และมี yield ที่ยืนสูงที่สุดรายหนึ่งในดัชนี'},
       w:{en:'Shrinking volumes every year and permanent litigation and regulatory risk.',th:'ปริมาณขายลดลงทุกปี และมีความเสี่ยงคดีความและกฎระเบียบถาวร'}}
    ],
    th:[
      {tk:'ADVANC',n:{en:'Advanced Info Service',th:'แอดวานซ์ อินโฟร์ เซอร์วิส'},s:'TELECOM',
       p:{en:'Largest Thai mobile operator — subscription cash flow with a long payout record.',th:'ผู้ให้บริการมือถือรายใหญ่ที่สุดของไทย กระแสเงินสดจากค่าบริการ พร้อมประวัติจ่ายปันผลยาว'},
       w:{en:'Spectrum auctions and network capex arrive in lumps and squeeze free cash flow.',th:'การประมูลคลื่นและการลงทุนเครือข่ายมาเป็นก้อนใหญ่ และบีบกระแสเงินสดอิสระ'}},
      {tk:'PTT',n:{en:'PTT PCL',th:'ปตท.'},s:'ENERGY',
       p:{en:'A long-standing payer and one of the most liquid dividend names on the SET.',th:'จ่ายปันผลมายาวนาน และเป็นหุ้นปันผลที่สภาพคล่องสูงที่สุดตัวหนึ่งใน SET'},
       w:{en:'Dividend capacity ultimately tracks oil and gas prices, which nobody forecasts well.',th:'ความสามารถจ่ายปันผลสุดท้ายผูกกับราคาน้ำมันและก๊าซ ซึ่งไม่มีใครทำนายได้แม่น'}},
      {tk:'TISCO',n:{en:'Tisco Financial Group',th:'ทิสโก้ ไฟแนนเชียลกรุ๊ป'},s:'FINANCE',
       p:{en:'Small, conservatively run financial group with a high and consistent payout ratio.',th:'กลุ่มการเงินขนาดเล็กที่บริหารแบบอนุรักษ์นิยม จ่ายปันผลในสัดส่วนสูงและสม่ำเสมอ'},
       w:{en:'Auto-lending exposure means the dividend depends on Thai credit quality.',th:'สัดส่วนสินเชื่อรถยนต์ทำให้ปันผลขึ้นอยู่กับคุณภาพสินเชื่อในไทย'}},
      {tk:'LH',n:{en:'Land & Houses',th:'แลนด์ แอนด์ เฮ้าส์'},s:'PROPERTY',
       p:{en:'Established residential developer with a long habit of returning cash to holders.',th:'ผู้พัฒนาที่อยู่อาศัยรายเก่าแก่ ที่มีนิสัยคืนเงินสดให้ผู้ถือหุ้นมายาวนาน'},
       w:{en:'Property is rate-sensitive and Thai household debt limits how many can buy.',th:'อสังหาฯ อ่อนไหวต่อดอกเบี้ย และหนี้ครัวเรือนไทยจำกัดจำนวนคนที่ซื้อไหว'}},
      {tk:'RATCH',n:{en:'Ratch Group',th:'ราช กรุ๊ป'},s:'POWER',
       p:{en:'Power generation with long contracted revenue — the classic income profile.',th:'ผลิตไฟฟ้าโดยมีสัญญารายได้ระยะยาว เป็นโปรไฟล์หุ้นรายได้แบบคลาสสิก'},
       w:{en:'Growth requires new projects, and new projects require more debt.',th:'การเติบโตต้องมีโครงการใหม่ และโครงการใหม่ต้องใช้หนี้เพิ่ม'}}
    ]},
  f:{us:[
      {tk:'JNJ',n:{en:'Johnson & Johnson',th:'จอห์นสัน แอนด์ จอห์นสัน'},s:'HEALTH',
       p:{en:'Diversified healthcare with one of the strongest balance sheets in the market.',th:'ธุรกิจสุขภาพที่กระจายหลายขา พร้อมงบดุลที่แข็งแรงที่สุดรายหนึ่งในตลาด'},
       w:{en:'Ongoing litigation is a genuine, hard-to-size liability.',th:'คดีความที่ยังดำเนินอยู่เป็นภาระที่มีอยู่จริงและประเมินขนาดยาก'}},
      {tk:'PG',n:{en:'Procter & Gamble',th:'พร็อคเตอร์ แอนด์ แกมเบิล'},s:'STAPLES',
       p:{en:'Brands people buy in any economy, with decades of uninterrupted dividend increases.',th:'แบรนด์ที่คนซื้อไม่ว่าเศรษฐกิจเป็นอย่างไร พร้อมการขึ้นปันผลต่อเนื่องหลายสิบปี'},
       w:{en:'Rarely cheap — you pay a premium for the low volatility.',th:'แทบไม่เคยถูก คุณจ่ายส่วนเกินเพื่อแลกกับความผันผวนต่ำ'}},
      {tk:'KO',n:{en:'Coca-Cola',th:'โคคา-โคล่า'},s:'STAPLES',
       p:{en:'Global distribution moat that would cost an enormous amount to rebuild.',th:'คูเมืองด้านเครือข่ายกระจายสินค้าทั่วโลก ที่จะใช้เงินมหาศาลถ้าจะสร้างใหม่'},
       w:{en:'Volume growth is structurally low; returns lean on price rises and buybacks.',th:'ปริมาณขายโตต่ำเชิงโครงสร้าง ผลตอบแทนพึ่งการขึ้นราคาและการซื้อหุ้นคืน'}},
      {tk:'COST',n:{en:'Costco',th:'คอสท์โค'},s:'RETAIL',
       p:{en:'Membership fees are near-pure profit and renew at extraordinarily high rates.',th:'ค่าสมาชิกเป็นกำไรเกือบล้วน และมีอัตราต่ออายุสูงผิดปกติ'},
       w:{en:'Persistently one of the most expensive retailers on earnings multiples.',th:'เป็นค้าปลีกที่แพงที่สุดรายหนึ่งเมื่อวัดด้วย multiple ของกำไรมาโดยตลอด'}},
      {tk:'WMT',n:{en:'Walmart',th:'วอลมาร์ท'},s:'RETAIL',
       p:{en:'Gains share in downturns as shoppers trade down — defensive in the truest sense.',th:'ได้ส่วนแบ่งเพิ่มในช่วงเศรษฐกิจแย่ เพราะคนหันมาซื้อของถูกลง — ตั้งรับในความหมายที่แท้จริง'},
       w:{en:'Net margin under 3% leaves almost no cushion for a cost shock.',th:'อัตรากำไรสุทธิต่ำกว่า 3% แทบไม่เหลือกันชนสำหรับแรงกระแทกด้านต้นทุน'}}
    ],
    th:[
      {tk:'BDMS',n:{en:'Bangkok Dusit Medical',th:'กรุงเทพดุสิตเวชการ'},s:'HEALTH',
       p:{en:'Largest private hospital network in Thailand — demand that does not follow the economy.',th:'เครือโรงพยาบาลเอกชนใหญ่ที่สุดในไทย ความต้องการไม่ได้เดินตามเศรษฐกิจ'},
       w:{en:'A meaningful share of revenue is medical tourism, which travel shocks disrupt.',th:'รายได้ส่วนสำคัญมาจากผู้ป่วยต่างชาติ ซึ่งสะดุดเมื่อมีแรงกระแทกด้านการเดินทาง'}},
      {tk:'BH',n:{en:'Bumrungrad Hospital',th:'โรงพยาบาลบำรุงราษฎร์'},s:'HEALTH',
       p:{en:'Premium international hospital brand with pricing power few Thai names have.',th:'แบรนด์โรงพยาบาลระดับพรีเมียมสำหรับผู้ป่วยต่างชาติ มีอำนาจตั้งราคาที่หุ้นไทยน้อยตัวมี'},
       w:{en:'Heavily dependent on foreign patients — narrower demand base than it looks.',th:'พึ่งพาผู้ป่วยต่างชาติมาก ฐานลูกค้าแคบกว่าที่เห็น'}},
      {tk:'CPF',n:{en:'Charoen Pokphand Foods',th:'เจริญโภคภัณฑ์อาหาร'},s:'FOOD',
       p:{en:'Vertically integrated protein producer selling a product demand never disappears for.',th:'ผู้ผลิตโปรตีนแบบครบวงจร ขายสินค้าที่ความต้องการไม่มีวันหายไป'},
       w:{en:'Margins swing with feed and livestock prices, and debt has been heavy.',th:'อัตรากำไรเหวี่ยงตามราคาอาหารสัตว์และราคาสุกร-ไก่ และมีภาระหนี้สูงมาโดยตลอด'}},
      {tk:'OSP',n:{en:'Osotspa',th:'โอสถสภา'},s:'BEVERAGE',
       p:{en:'Energy drinks and consumer goods with entrenched distribution across Thailand.',th:'เครื่องดื่มชูกำลังและสินค้าอุปโภคบริโภค พร้อมเครือข่ายกระจายสินค้าที่ฝังรากทั่วไทย'},
       w:{en:'Competitive category with thin differentiation — market share is fought for constantly.',th:'ตลาดแข่งขันสูงและสินค้าแตกต่างกันน้อย ส่วนแบ่งตลาดต้องแย่งกันตลอดเวลา'}},
      {tk:'TU',n:{en:'Thai Union Group',th:'ไทยยูเนี่ยน กรุ๊ป'},s:'FOOD',
       p:{en:'Global seafood scale with branded products sold across dozens of countries.',th:'ผู้ผลิตอาหารทะเลระดับโลก มีสินค้าแบรนด์ขายในหลายสิบประเทศ'},
       w:{en:'Commodity input costs plus currency exposure make earnings less stable than the sector suggests.',th:'ต้นทุนวัตถุดิบโภคภัณฑ์บวกความเสี่ยงค่าเงิน ทำให้กำไรไม่นิ่งอย่างที่ชื่อกลุ่มบอก'}}
    ]}
};

var PICK_UI = {
  h:{en:'Names that illustrate this style',th:'หุ้นที่เป็นตัวอย่างของแนวนี้'},
  lede:{en:'Examples chosen to show what this archetype looks like in practice — five US and five Thai. No valuation figures are shown here on purpose: they change every week and must be checked at the source before you act on anything.',
        th:'ตัวอย่างที่เลือกมาเพื่อให้เห็นว่าหุ้นแนวนี้หน้าตาเป็นยังไงในความเป็นจริง — สหรัฐฯ 5 ตัว ไทย 5 ตัว ที่นี่ไม่แสดงตัวเลขมูลค่าโดยตั้งใจ เพราะมันเปลี่ยนทุกสัปดาห์ และคุณต้องไปเช็คจากแหล่งจริงก่อนลงมือทุกครั้ง'},
  us:{en:'US / Global',th:'สหรัฐฯ / ต่างประเทศ'},
  th:{en:'Thailand (SET)',th:'ไทย (SET)'},
  chart:{en:'Chart it',th:'ดูกราฟ'},
  disc:{en:'These are teaching examples, not recommendations. Nobody here knows your tax position, your debts or your timeline. Check every number yourself and talk to a licensed advisor before committing money.',
        th:'นี่คือตัวอย่างเพื่อการเรียนรู้ ไม่ใช่คำแนะนำให้ซื้อ ไม่มีใครที่นี่รู้สถานะภาษี หนี้สิน หรือกรอบเวลาของคุณ ให้ตรวจสอบทุกตัวเลขด้วยตัวเอง และปรึกษาผู้แนะนำการลงทุนที่มีใบอนุญาตก่อนลงเงินจริง'}
};

/* ---------------- CYCLE PLAYBOOK TABLE ---------------- */
var CYCTAB = {
  h:{en:['Phase','What it feels like','Historically leads','Historically lags','What to do'],
     th:['ช่วง','บรรยากาศเป็นแบบไหน','กลุ่มที่มักนำ','กลุ่มที่มักตาม','ควรทำอะไร']},
  rows:[
    {id:'early',feel:{en:'Fear is still fresh, headlines are bad, but the data has already turned up.',th:'ความกลัวยังสดใหม่ พาดหัวข่าวยังแย่ แต่ตัวเลขเศรษฐกิจกลับตัวขึ้นแล้ว'},
     up:{en:['Cyclicals','Financials','Small caps','Consumer discretionary'],th:['หุ้นวัฏจักร','การเงิน','หุ้นเล็ก','สินค้าฟุ่มเฟือย']},
     dn:{en:['Utilities','Staples'],th:['สาธารณูปโภค','สินค้าจำเป็น']},
     do:{en:'Add risk gradually while it still feels wrong. This is where the biggest returns of the cycle are made.',th:'ค่อยๆ เพิ่มความเสี่ยงในตอนที่มันยังรู้สึกผิดที่ผิดทาง นี่คือช่วงที่ผลตอบแทนใหญ่ที่สุดของวัฏจักรเกิดขึ้น'}},
    {id:'mid',feel:{en:'Everything works, nothing is dramatic, and it is easy to get complacent.',th:'อะไรก็ดูดีไปหมด ไม่มีอะไรดราม่า และง่ายมากที่จะประมาท'},
     up:{en:['Technology','Industrials','Capital goods','Communication'],th:['เทคโนโลยี','อุตสาหกรรม','สินค้าทุน','สื่อสาร']},
     dn:{en:['Deep cyclicals','High-leverage names'],th:['หุ้นวัฏจักรจัด','หุ้นหนี้สูง']},
     do:{en:'Stay invested and rebalance on schedule. Returns come from earnings now, not from re-rating.',th:'อยู่ในตลาดต่อและปรับสมดุลตามตาราง ผลตอบแทนตอนนี้มาจากกำไร ไม่ใช่จากการตีมูลค่าใหม่'}},
    {id:'late',feel:{en:'Growth is still there but costs, wages and rates are all eating the margin.',th:'การเติบโตยังอยู่ แต่ต้นทุน ค่าแรง และดอกเบี้ย กัดกินอัตรากำไรพร้อมกัน'},
     up:{en:['Energy','Materials','Healthcare','Staples'],th:['พลังงาน','วัสดุ','สุขภาพ','สินค้าจำเป็น']},
     dn:{en:['Discretionary','Long-duration growth'],th:['สินค้าฟุ่มเฟือย','หุ้นโตระยะยาวไกล']},
     do:{en:'Raise quality, trim leverage, keep some cash. Do not chase the last leg of the move.',th:'ยกคุณภาพพอร์ตขึ้น ลดหุ้นหนี้สูง เก็บเงินสดไว้บ้าง อย่าไล่ขาสุดท้ายของรอบ'}},
    {id:'rec',feel:{en:'Output, jobs, income and sales all fall together. Everything correlates to one.',th:'ผลผลิต การจ้างงาน รายได้ และยอดขาย ลดลงพร้อมกัน ทุกอย่างวิ่งไปทางเดียวกันหมด'},
     up:{en:['Utilities','Staples','Healthcare','Strong balance sheets'],th:['สาธารณูปโภค','สินค้าจำเป็น','สุขภาพ','งบดุลแข็งแรง']},
     dn:{en:['Cyclicals','High debt','Unprofitable growth'],th:['หุ้นวัฏจักร','หนี้สูง','หุ้นโตที่ขาดทุน']},
     do:{en:'Keep buying on schedule if you can. The best entries of the next cycle are made here.',th:'ถ้าทำได้ ให้ซื้อตามตารางต่อไป จุดเข้าที่ดีที่สุดของวัฏจักรถัดไปเกิดขึ้นตรงนี้'}}
  ]
};

/* ---------------- CHART LAB UNIVERSE ----------------
   seed/drift/vol drive the deterministic demo generator. These describe the
   character of each name (trend and volatility), not any real price history. */
var CHART_UNI = [
  {tk:'NVDA',n:'Nvidia',        m:'us',p:118, dr:0.34,vo:0.52,sd:11},
  {tk:'MSFT',n:'Microsoft',     m:'us',p:432, dr:0.20,vo:0.26,sd:23},
  {tk:'AAPL',n:'Apple',         m:'us',p:224, dr:0.17,vo:0.27,sd:31},
  {tk:'AMZN',n:'Amazon',        m:'us',p:198, dr:0.19,vo:0.33,sd:47},
  {tk:'META',n:'Meta Platforms',m:'us',p:565, dr:0.22,vo:0.37,sd:53},
  {tk:'AMD', n:'AMD',           m:'us',p:152, dr:0.21,vo:0.50,sd:61},
  {tk:'JPM', n:'JPMorgan Chase',m:'us',p:218, dr:0.13,vo:0.24,sd:71},
  {tk:'XOM', n:'ExxonMobil',    m:'us',p:114, dr:0.08,vo:0.27,sd:83},
  {tk:'JNJ', n:'Johnson & Johnson',m:'us',p:158,dr:0.05,vo:0.15,sd:97},
  {tk:'KO',  n:'Coca-Cola',     m:'us',p:70,  dr:0.06,vo:0.14,sd:101},
  {tk:'PG',  n:'Procter & Gamble',m:'us',p:168,dr:0.07,vo:0.15,sd:107},
  {tk:'O',   n:'Realty Income', m:'us',p:57,  dr:0.03,vo:0.19,sd:113},
  {tk:'VZ',  n:'Verizon',       m:'us',p:42,  dr:0.02,vo:0.17,sd:127},
  {tk:'VOO', n:'S&P 500 ETF',   m:'us',p:520, dr:0.11,vo:0.16,sd:131},
  {tk:'QQQ', n:'Nasdaq-100 ETF',m:'us',p:478, dr:0.15,vo:0.23,sd:137},
  {tk:'DELTA', n:'Delta Electronics TH',m:'th',p:126,dr:0.28,vo:0.55,sd:149},
  {tk:'GULF',  n:'Gulf Development',   m:'th',p:52, dr:0.15,vo:0.31,sd:151},
  {tk:'CPALL', n:'CP All',             m:'th',p:58, dr:0.07,vo:0.25,sd:157},
  {tk:'AOT',   n:'Airports of Thailand',m:'th',p:60,dr:0.06,vo:0.29,sd:163},
  {tk:'ADVANC',n:'Advanced Info Service',m:'th',p:280,dr:0.09,vo:0.20,sd:167},
  {tk:'PTT',   n:'PTT PCL',            m:'th',p:33, dr:0.03,vo:0.23,sd:173},
  {tk:'KBANK', n:'Kasikornbank',       m:'th',p:158,dr:0.06,vo:0.26,sd:179},
  {tk:'BBL',   n:'Bangkok Bank',       m:'th',p:152,dr:0.05,vo:0.22,sd:181},
  {tk:'SCB',   n:'SCB X',              m:'th',p:118,dr:0.06,vo:0.24,sd:191},
  {tk:'BDMS',  n:'Bangkok Dusit Medical',m:'th',p:26,dr:0.05,vo:0.21,sd:193},
  {tk:'SCC',   n:'Siam Cement Group',  m:'th',p:172,dr:0.01,vo:0.28,sd:197},
  {tk:'TDEX',  n:'SET50 ETF',          m:'th',p:11, dr:0.04,vo:0.18,sd:199}
];

var CL_UI = {
  eb:{en:'Chart Laboratory',th:'ห้องทดลองกราฟ'},
  h2:{en:'Read A Chart, Any Way You Like',th:'อ่านกราฟ ในแบบที่คุณถนัด'},
  lede:{en:'Candlestick, OHLC bar, line or area — same data, four ways of seeing it. Add moving averages, volume and RSI, or put two names side by side to see which actually outperformed.',
        th:'แท่งเทียน แท่ง OHLC เส้น หรือพื้นที่ — ข้อมูลชุดเดียวกัน สี่วิธีในการมอง เพิ่มเส้นค่าเฉลี่ย วอลุ่ม และ RSI ได้ หรือวางสองตัวเทียบกันเพื่อดูว่าตัวไหนทำผลงานดีกว่ากันจริง'},
  stock:{en:'Stock',th:'หุ้น'},
  type:{en:'Chart type',th:'ชนิดกราฟ'},
  range:{en:'Range',th:'ช่วงเวลา'},
  overlay:{en:'Overlays',th:'เส้นเสริม'},
  compare:{en:'Compare with',th:'เทียบกับ'},
  none:{en:'— none —',th:'— ไม่เทียบ —'},
  candle:{en:'Candles',th:'แท่งเทียน'},
  bar:{en:'OHLC bar',th:'แท่ง OHLC'},
  line:{en:'Line',th:'เส้น'},
  area:{en:'Area',th:'พื้นที่'},
  vol:{en:'Volume',th:'วอลุ่ม'},
  rsi:{en:'RSI 14',th:'RSI 14'},
  chg:{en:'Change over range',th:'เปลี่ยนแปลงในช่วง'},
  high:{en:'Range high',th:'สูงสุดในช่วง'},
  low:{en:'Range low',th:'ต่ำสุดในช่วง'},
  vola:{en:'Annualised vol',th:'ความผันผวนต่อปี'},
  dd:{en:'Max drawdown',th:'ย่อลึกสุด'},
  ma200:{en:'vs MA200',th:'เทียบ MA200'},
  demoH:{en:'This is simulated data',th:'ข้อมูลชุดนี้เป็นข้อมูลจำลอง'},
  demo:{en:'A single HTML file cannot pull live quotes without a paid data feed, so these series are generated to match each name\'s typical trend and volatility. They are for practising chart reading — never for valuation or for a trade. To chart real history, export a CSV from your broker or any data site and paste it below (Date,Open,High,Low,Close,Volume — one row per day, newest last).',
        th:'ไฟล์ HTML ไฟล์เดียวดึงราคาสดไม่ได้ถ้าไม่มีดาต้าฟีดแบบเสียเงิน ข้อมูลชุดนี้จึงถูกสร้างขึ้นให้ตรงกับลักษณะเทรนด์และความผันผวนของหุ้นแต่ละตัว ใช้สำหรับฝึกอ่านกราฟเท่านั้น ห้ามใช้ประเมินมูลค่าหรือใช้เทรดเด็ดขาด ถ้าอยากดูราคาจริงย้อนหลัง ให้ส่งออกไฟล์ CSV จากโบรกเกอร์หรือเว็บข้อมูลไหนก็ได้ แล้ววางลงช่องด้านล่าง (Date,Open,High,Low,Close,Volume — บรรทัดละหนึ่งวัน วันล่าสุดอยู่ล่างสุด)'},
  paste:{en:'Paste CSV here to chart your own real data…',th:'วาง CSV ตรงนี้เพื่อพล็อตข้อมูลจริงของคุณเอง…'},
  load:{en:'Load CSV',th:'โหลด CSV'},
  clear:{en:'Back to demo',th:'กลับไปข้อมูลจำลอง'},
  loaded:{en:'Your data — ',th:'ข้อมูลของคุณ — '},
  bad:{en:'Could not read that. Need at least Date and Close columns.',th:'อ่านไม่ได้ ต้องมีอย่างน้อยคอลัมน์ Date และ Close'}
};


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function tx(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html != null) e.innerHTML = html;
    return e;
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var UI = {
    hubEyebrow:{en:'Terminal Index',th:'สารบัญเทอร์มินัล'},
    hubTitle:{en:'Where Do You Want To Go?',th:'อยากไปตรงไหน?'},
    hubLede:{en:'Each card opens its own screen. Nothing loads until you ask for it — the calculators live in the tools drawer at the top right.',
             th:'แต่ละการ์ดเปิดเป็นหน้าของตัวเอง ไม่มีอะไรโหลดจนกว่าคุณจะเรียก ส่วนเครื่องมือคำนวณอยู่ในลิ้นชักเครื่องมือมุมขวาบน'},
    featured:{en:'Featured',th:'แนะนำ'},
    back:{en:'← Back to index',th:'← กลับสารบัญ'},
    tools:{en:'Tools',th:'เครื่องมือ'},
    toolsTitle:{en:'Calculators',th:'เครื่องมือคำนวณ'},
    open:{en:'Open',th:'เปิด'},
    reset:{en:'Start over',th:'เริ่มใหม่'},
    see:{en:'See my profile',th:'ดูผลลัพธ์ของผม'},
    need:{en:'Answer all five to continue',th:'ตอบให้ครบทั้งห้าข้อก่อน'},
    ready:{en:'Ready',th:'พร้อมแล้ว'},
    fit:{en:'Style match',th:'ความเข้ากัน'},
    sectors:{en:'Sectors that usually fit',th:'กลุ่มอุตสาหกรรมที่มักเข้ากัน'},
    checkfirst:{en:'Check these numbers first',th:'ดูตัวเลขพวกนี้ก่อน'},
    checkhint:{en:'Tap any tag to jump straight to that metric.',th:'แตะแท็กไหนก็ได้เพื่อกระโดดไปที่เมตริกนั้น'},
    avoid:{en:'What kills beginner portfolios',th:'สิ่งที่ฆ่าพอร์ตมือใหม่'},
    second:{en:'Secondary lean',th:'แนวรอง'},
    hereNow:{en:'HERE',th:'อยู่นี่'},
    leads:{en:'Usually leads',th:'มักนำตลาด'},
    lagsIn:{en:'Usually lags',th:'มักตามหลัง'},
    watch:{en:'What would confirm it',th:'อะไรจะยืนยันกรณีนี้'},
    snapshot:{en:'Where we actually are',th:'ตอนนี้เราอยู่ตรงไหนจริงๆ'},
    driversH:{en:'What is driving 2026',th:'อะไรขับเคลื่อนปี 2026'},
    scenH:{en:'Three ways forward',th:'สามทางที่เป็นไปได้ข้างหน้า'},
    frameH:{en:'The four phases',th:'สี่ช่วงของวัฏจักร'}
  };

  var ROUTES = [
    {id:'start',   feat:true,
     t:{en:'Start Here — Beginner Guide',th:'เริ่มต้นที่นี่ — ไกด์มือใหม่'},
     d:{en:'Five questions that map your goal and risk tolerance onto a stock style, plus the exact order to build a first portfolio.',
        th:'ห้าคำถามที่จับคู่เป้าหมายและความทนความเสี่ยงของคุณเข้ากับแนวหุ้น พร้อมลำดับขั้นในการสร้างพอร์ตแรก'}},
    {id:'outlook', feat:true,
     t:{en:'Market Outlook — Cycle & 2026',th:'ภาพรวมตลาด — วัฏจักรและปี 2026'},
     d:{en:'The four-phase business cycle, where the data says we sit in August 2026, and three scenarios for what comes next.',
        th:'วัฏจักรธุรกิจสี่ช่วง ข้อมูลบอกว่าเดือนสิงหาคม 2026 เราอยู่ตรงไหน และสามฉากทัศน์ว่าอะไรจะตามมา'}},
    {id:'types',
     t:{en:'Stock Archetypes',th:'ประเภทหุ้น'},
     d:{en:'The four ways to own a company — value, growth, dividend, defensive — and where they overlap.',
        th:'สี่วิธีในการเป็นเจ้าของบริษัท — คุณค่า เติบโต ปันผล ตั้งรับ — และจุดที่ทับซ้อนกัน'}},
    {id:'glossary',
     t:{en:'Core Metrics',th:'คำศัพท์และเมตริกหลัก'},
     d:{en:'14 numbers decoded, each with a live visual and a what-if simulator showing how it breaks.',
        th:'ถอดรหัส 14 ตัวเลข แต่ละตัวมีภาพเคลื่อนไหวสดและตัวจำลองเหตุการณ์สมมุติที่แสดงว่ามันพังยังไง'}},
    {id:'signals',
     t:{en:'Chart Signals',th:'สัญญาณกราฟ'},
     d:{en:'13 signals every terminal shows you, plus the failure case for each one.',
        th:'13 สัญญาณที่ทุกเทอร์มินัลแสดง พร้อมกรณีที่มันล้มเหลวของแต่ละอัน'}},
    {id:'scenarios',
     t:{en:'Market Shock Simulator',th:'จำลองแรงกระแทกตลาด'},
     d:{en:'What happens to each stock type when rates, oil, currencies or sentiment move against you.',
        th:'เกิดอะไรขึ้นกับหุ้นแต่ละประเภทเมื่อดอกเบี้ย น้ำมัน ค่าเงิน หรือความเชื่อมั่นสวนทางคุณ'}},
    {id:'directory',
     t:{en:'Stock Directory & Compare',th:'หุ้นตัวอย่างและเปรียบเทียบ'},
     d:{en:'Browse example companies by archetype and rank any set of them side by side on six metrics — click any card to open its full one-page deep dive.',
        th:'ดูบริษัทตัวอย่างแยกตามประเภท แล้วจัดอันดับเทียบกันหกเมตริกพร้อมกัน — กดการ์ดตัวไหนก็เปิดหน้าเจาะลึกของตัวนั้นได้เลย'}},
    {id:'chartlab', feat:true,
     t:{en:'Chart Lab',th:'ห้องทดลองกราฟ'},
     d:{en:'Candlestick, OHLC, line or area — pick a name, add MA/volume/RSI, or compare two side by side.',
        th:'แท่งเทียน OHLC เส้น หรือพื้นที่ — เลือกหุ้น เพิ่ม MA/วอลุ่ม/RSI หรือเทียบสองตัวพร้อมกัน'}},
    {id:'pro',
     t:{en:'Institutional Pro Desk',th:'โปรเดสก์ระดับสถาบัน'},
     d:{en:'14 advanced modules — GEX, dark pool tape, order book heatmap, Monte Carlo, execution algos and more.',
        th:'14 โมดูลขั้นสูง — GEX, ดาร์กพูล, ฮีตแมปหนังสือคำสั่ง, มอนติคาร์โล, อัลกอริทึมส่งคำสั่ง และอื่นๆ'}}
  ];

  var TOOLS = [
    {id:'sizing', t:{en:'Position Size',th:'ขนาดการลงทุน'}},
    {id:'fx',     t:{en:'Currency',th:'อัตราแลกเปลี่ยน'}},
    {id:'wealth', t:{en:'Wealth Builder',th:'สร้างความมั่งคั่ง'}}
  ];

  var repaints = [];
  var current = 'home';

  /* Own history stack, mirrored into the browser's. The buttons call
     history.back()/forward() so there is only ever one source of truth. */
  var HIST = [], HI = -1, fromPop = false;
  function syncBtns(){
    if(window.__spzNavPaint) try { window.__spzNavPaint(); } catch(e){}
  }
  window.__spzNav = {
    back:function(){ if(HI > 0) history.back(); },
    fwd:function(){ if(HI < HIST.length - 1) history.forward(); },
    canBack:function(){ return HI > 0; },
    canFwd:function(){ return HI < HIST.length - 1; },
    at:function(){ return current; },
    prevId:function(){ return HI > 0 ? HIST[HI - 1] : null; },
    nextId:function(){ return HI < HIST.length - 1 ? HIST[HI + 1] : null; }
  };

  /* ================= BEGINNER GUIDE ================= */
  function buildGuide(){
    var sec = el('section');
    sec.id = 'start';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-g="eb"></span></div>' +
        '<h2 data-g="h2"></h2><p class="lede" data-g="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-panel reveal" data-g="panel"></div>' +
      '<div class="v8-result" data-g="res"></div>';

    if(!GUIDE.__ext){ GUIDE.q = GUIDE.q.concat(GUIDE_EXTRA); GUIDE.__ext = 1; }
    var panel = sec.querySelector('[data-g="panel"]');
    var res = sec.querySelector('[data-g="res"]');
    var picks = new Array(GUIDE.q.length).fill(-1);

    function paintQs(){
      panel.innerHTML = '';
      for(var i = 0; i < GUIDE.q.length; i++){
        (function(qi){
          var q = GUIDE.q[qi];
          var box = el('div', 'v8-q');
          box.appendChild(el('div', 'v8-qh', 'Q' + (qi + 1) + ' / ' + GUIDE.q.length));
          box.appendChild(el('div', 'v8-qt', esc(tx(q.t))));
          var og = el('div', 'v8-opts');
          for(var j = 0; j < q.o.length; j++){
            (function(oi){
              var b = el('button', 'v8-opt' + (picks[qi] === oi ? ' sel' : ''), esc(tx(q.o[oi].l)));
              b.type = 'button';
              b.addEventListener('click', function(){ picks[qi] = oi; paintQs(); });
              og.appendChild(b);
            })(j);
          }
          box.appendChild(og);
          panel.appendChild(box);
        })(i);
      }
      var act = el('div', 'v8-actions');
      var done = picks.indexOf(-1) === -1;
      var go = el('button', 'btn btn-primary', esc(UI.see[L()]));
      go.type = 'button';
      go.disabled = !done;
      go.style.opacity = done ? '1' : '.4';
      go.style.cursor = done ? 'pointer' : 'not-allowed';
      go.addEventListener('click', function(){ if(done) paintRes(); });
      act.appendChild(go);
      var rs = el('button', 'btn btn-outline', esc(UI.reset[L()]));
      rs.type = 'button';
      rs.addEventListener('click', function(){
        picks = new Array(GUIDE.q.length).fill(-1);
        res.classList.remove('on');
        paintQs();
      });
      act.appendChild(rs);
      act.appendChild(el('span', 'v8-hint', esc(done ? UI.ready[L()] : UI.need[L()])));
      panel.appendChild(act);
    }

    function paintRes(){
      var sc = {v:0, g:0, d:0, f:0}, exp = 0, risk = 0, hz = 0, key, mkt = 'both';
      for(var i = 0; i < picks.length; i++){
        var o = GUIDE.q[i].o[picks[i]];
        for(key in o.w){ if(o.w.hasOwnProperty(key)) sc[key] += o.w[key]; }
        if(o.e != null) exp += o.e;
        if(o.r != null) risk += o.r;
        if(o.h != null) hz += o.h;
        if(o.mkt) mkt = o.mkt;
      }
      var order = Object.keys(sc).sort(function(a, b){ return sc[b] - sc[a]; });
      var top = order[0], second = order[1];
      var total = sc.v + sc.g + sc.d + sc.f || 1;
      var tier = exp <= 2 ? 0 : (exp <= 4 ? 1 : 2);
      if(hz <= 1) tier = Math.min(tier, 0);
      var T = GUIDE.tiers[tier], A = GUIDE.arch[top], B = GUIDE.arch[second];

      var bars = '';
      for(var k = 0; k < order.length; k++){
        var a = order[k], pct = Math.round(sc[a] / total * 100);
        bars += '<div class="res-bar"><span class="rb-l">' + esc(tx(GUIDE.arch[a].n)) + '</span>' +
                '<span class="rb-t"><span class="rb-f" style="width:' + pct + '%"></span></span>' +
                '<span class="rb-v">' + pct + '%</span></div>';
      }

      var chips = '';
      for(var m = 0; m < A.m.length; m++){
        chips += '<button type="button" class="res-chip" data-metric="' + A.m[m] + '">' + A.m[m].toUpperCase() + '</button>';
      }

      function ul(arr, cls){
        var s = '<ul>';
        for(var i2 = 0; i2 < arr.length; i2++){ s += '<li>' + esc(arr[i2]) + '</li>'; }
        return s + '</ul>';
      }

      res.innerHTML =
        '<div class="res-hero">' +
          '<div class="res-eyebrow">' + esc(UI.fit[L()]) + '</div>' +
          '<div class="res-title">' + esc(tx(A.n)) + '</div>' +
          '<p class="res-sub">' + esc(tx(A.d)) + '</p>' +
          '<div class="res-bars">' + bars + '</div>' +
        '</div>' +
        '<div class="res-grid">' +
          '<div class="res-card"><div class="rc-h">' + esc(tx(T.n)) + '</div>' + ul(T.l[L()] || T.l.en) + '</div>' +
          '<div class="res-card"><div class="rc-h">' + esc(UI.sectors[L()]) + '</div>' +
            ul(A.s[L()] || A.s.en) +
            '<div class="rc-h" style="margin-top:18px">' + esc(UI.second[L()]) + ' — ' + esc(tx(B.n)) + '</div>' +
            '<p style="font-size:12.6px;color:var(--grey);line-height:1.65">' + esc(tx(B.d)) + '</p>' +
          '</div>' +
          '<div class="res-card"><div class="rc-h">' + esc(UI.checkfirst[L()]) + '</div>' +
            '<div class="res-chips">' + chips + '</div>' +
            '<p style="font-size:11.6px;color:var(--grey-dim);margin-top:12px;font-family:var(--mono)">' + esc(UI.checkhint[L()]) + '</p>' +
          '</div>' +
          '<div class="res-card b"><div class="rc-h bad">' + esc(UI.avoid[L()]) + '</div>' + ul(GUIDE.avoid[L()] || GUIDE.avoid.en) + '</div>' +
        '</div>' +
        '<div class="v8-note"><b>⚠</b> ' + esc(tx(GUIDE.intro)) + '</div>' +
        renderPicks(top, mkt);

      var pg = res.querySelectorAll('[data-chart]');
      for(var p2 = 0; p2 < pg.length; p2++){
        (function(btn){
          btn.addEventListener('click', function(){ jumpChart(btn.getAttribute('data-chart')); });
        })(pg[p2]);
      }

      var cs = res.querySelectorAll('[data-metric]');
      for(var c = 0; c < cs.length; c++){
        (function(btn){
          btn.style.cursor = 'pointer';
          btn.addEventListener('click', function(){ jumpMetric(btn.getAttribute('data-metric')); });
        })(cs[c]);
      }
      res.classList.add('on');
      res.scrollIntoView({ behavior:'smooth', block:'start' });
    }

    function head(){
      /* Round V (#213): this used to say "05 Questions" as fixed text, which
         went stale the moment GUIDE_EXTRA was merged in above (the quiz has
         carried more than five questions for a while, growing again just now)
         -- read the live count instead so the label can never drift from the
         quiz again. */
      var qn = String(GUIDE.q.length).length < 2 ? '0' + GUIDE.q.length : String(GUIDE.q.length);
      sec.querySelector('[data-g="eb"]').textContent = L() === 'th' ? qn + ' คำถาม' : qn + ' Questions';
      sec.querySelector('[data-g="h2"]').textContent = L() === 'th' ? 'มือใหม่ควรเริ่มที่หุ้นอะไร' : 'What Should A Beginner Actually Buy';
      sec.querySelector('[data-g="lede"]').textContent = tx(GUIDE.intro);
    }

    repaints.push(function(){ head(); paintQs(); if(res.classList.contains('on')) paintRes(); });
    head(); paintQs();
    return sec;
  }

  function jumpMetric(key){
    route('glossary');
    setTimeout(function(){
      var row = document.querySelector('details.term-row[data-key="' + key + '"]');
      if(!row) return;
      row.classList.remove('ctl-hidden');
      row.open = true;
      row.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 140);
  }

  /* ================= MARKET OUTLOOK ================= */
  function buildOutlook(){
    var sec = el('section');
    sec.id = 'outlook';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-o="eb"></span></div>' +
        '<h2 data-o="h2"></h2><p class="lede" data-o="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-o="s1"></div>' +
      '<div class="wave-box reveal" data-o="wave"></div>' +
      '<div class="cyc-wrap" data-o="cyc"></div>' +
      '<div class="v8-panel reveal" data-o="det"></div>' +
      '<div class="v8-sub" data-o="s6"></div>' +
      '<p class="lede" data-o="s6d" style="margin-bottom:16px"></p>' +
      '<div class="res-grid" data-o="valcyc"></div>' +
      '<div class="v8-sub" data-o="s5"></div><div data-o="tab"></div>' +
      '<div class="v8-sub" data-o="s2"></div><p class="lede" data-o="snapLede" style="margin-bottom:20px"></p>' +
      '<div class="ind-grid" data-o="ind"></div>' +
      '<div class="v8-sub" data-o="s3"></div><div class="res-grid" data-o="drv"></div>' +
      '<div class="v8-sub" data-o="s4"></div><div class="scen-grid" data-o="scen"></div>' +
      '<div class="v8-note" data-o="disc"></div><div class="v8-src" data-o="src"></div>';

    var sel = (window.SPZ_CYCLE && window.SPZ_CYCLE.phase) || OUTLOOK.here;

    function paintDet(){
      var p = null;
      for(var i = 0; i < OUTLOOK.phases.length; i++){ if(OUTLOOK.phases[i].id === sel) p = OUTLOOK.phases[i]; }
      if(!p) return;
      function chips(arr){
        var s = '<div class="res-chips">';
        for(var i2 = 0; i2 < arr.length; i2++){ s += '<span class="res-chip">' + esc(arr[i2]) + '</span>'; }
        return s + '</div>';
      }
      var wv = sec.querySelector('[data-o="wave"]');
      wv.innerHTML = waveSVG(sel);
      var bnds = wv.querySelectorAll('.wv-band');
      for(var w2 = 0; w2 < bnds.length; w2++){
        (function(b3){ b3.addEventListener('click', function(){ sel = b3.getAttribute('data-ph'); paintCyc(); paintDet(); }); })(bnds[w2]);
      }
      var tb = sec.querySelector('[data-o="tab"]');
      tb.innerHTML = cycTable(sel);
      var trs = tb.querySelectorAll('tr[data-ph]');
      for(var t2 = 0; t2 < trs.length; t2++){
        (function(r3){
          r3.style.cursor = 'pointer';
          r3.addEventListener('click', function(){ sel = r3.getAttribute('data-ph'); paintCyc(); paintDet(); });
        })(trs[t2]);
      }
      sec.querySelector('[data-o="det"]').innerHTML =
        '<div class="res-eyebrow">' + esc(tx(p.s)) + '</div>' +
        '<div class="res-title" style="font-size:22px">' + esc(tx(p.n)) + '</div>' +
        '<p class="res-sub" style="margin-bottom:20px">' + esc(tx(p.d)) + '</p>' +
        '<div class="res-grid">' +
          '<div class="res-card"><div class="rc-h">' + esc(UI.leads[L()]) + '</div>' + chips(p.lead[L()] || p.lead.en) + '</div>' +
          '<div class="res-card w"><div class="rc-h warn">' + esc(UI.lagsIn[L()]) + '</div>' + chips(p.lag[L()] || p.lag.en) + '</div>' +
        '</div>';

      /* ROUND S: ADVANCED -- how the "Start Investing" checklist metrics read
         in the currently-selected phase. Reactive to `sel`, same as the rest
         of this panel, so switching phase (wave band / table row / cyc-btn)
         updates this too. */
      var vg = sec.querySelector('[data-o="valcyc"]');
      if(vg){
        vg.innerHTML = '';
        for(var vi = 0; vi < OUTLOOK.valCycle.length; vi++){
          var vm = OUTLOOK.valCycle[vi];
          var vrow = vm.rows[p.id] || vm.rows.mid;
          vg.appendChild(el('div', 'res-card',
            '<div class="rc-h">' + esc(tx(vm.t)) + '</div>' +
            '<p style="font-size:12.9px;color:var(--grey);line-height:1.7">' + esc(tx(vrow)) + '</p>'));
        }
      }
    }

    function paintCyc(){
      var w = sec.querySelector('[data-o="cyc"]');
      w.innerHTML = '';
      for(var i = 0; i < OUTLOOK.phases.length; i++){
        (function(p, n){
          var b = el('button', 'cyc-btn ' + (p.tone || '') + (sel === p.id ? ' on' : ''));
          b.type = 'button';
          b.innerHTML =
            (p.id === OUTLOOK.here ? '<span class="cyc-here">' + esc(UI.hereNow[L()]) + '</span>' : '') +
            '<span class="cb-n">0' + n + '</span><span class="cb-t">' + esc(tx(p.n)) + '</span>' +
            '<span class="cb-d">' + esc(tx(p.s)) + '</span>';
          b.addEventListener('click', function(){ sel = p.id; paintCyc(); paintDet(); });
          w.appendChild(b);
        })(OUTLOOK.phases[i], i + 1);
      }
    }

    function paintAll(){
      sec.querySelector('[data-o="eb"]').textContent = L() === 'th' ? 'วัฏจักรและการคาดการณ์' : 'Cycle & Outlook';
      sec.querySelector('[data-o="h2"]').textContent = L() === 'th' ? 'ตอนนี้ตลาดอยู่ช่วงไหน แล้วต่อไปจะเป็นอะไร' : 'Where Are We, And What Comes Next';
      sec.querySelector('[data-o="lede"]').textContent = L() === 'th'
        ? 'ตลาดหุ้นไม่ได้เคลื่อนไหวแบบสุ่ม มันหมุนตามวัฏจักรเศรษฐกิจ รู้ว่าตอนนี้อยู่ช่วงไหน ก็พอจะรู้ว่ากลุ่มไหนมักนำและกลุ่มไหนมักตามหลัง'
        : 'Markets do not move at random — they rotate with the economy. Knowing which phase you are in tells you which sectors have historically led and which have lagged.';
      sec.querySelector('[data-o="s1"]').textContent = UI.frameH[L()];
      sec.querySelector('[data-o="s2"]').textContent = UI.snapshot[L()] + ' · ' + tx(OUTLOOK.snapDate);
      sec.querySelector('[data-o="s3"]').textContent = UI.driversH[L()];
      sec.querySelector('[data-o="s4"]').textContent = UI.scenH[L()];
      sec.querySelector('[data-o="s5"]').textContent = L() === 'th' ? 'ควรถือหุ้นอะไรในแต่ละช่วง' : 'What to hold in each phase';
      sec.querySelector('[data-o="s6"]').textContent = L() === 'th'
        ? 'ขั้นสูง: อ่านเช็คลิสต์ก่อนลงทุนให้เข้ากับจังหวะนี้'
        : 'Advanced: Reading The Investing Checklist In This Phase';
      sec.querySelector('[data-o="s6d"]').innerHTML = L() === 'th'
        ? 'ห้าเรื่องที่เช็คก่อนซื้อหุ้น (P/E, D/E, ROE/มาร์จิ้น, Payout, P/B) อ่านไม่เหมือนกันในแต่ละช่วงของวัฏจักร ด้านล่างนี้ปรับตามช่วงที่เลือกไว้ด้านบนโดยอัตโนมัติ — ยังไม่เคยดูเช็คลิสต์เต็มๆ? เปิดได้ที่ <a href="#basics" style="color:var(--neon)">เริ่มต้นลงทุน →</a>'
        : 'The five checks before buying any stock (P/E, D/E, ROE/Margin, Payout, P/B) read differently depending on where we are in the cycle. This updates automatically with whichever phase is selected above — new to the full checklist? Open <a href="#basics" style="color:var(--neon)">Start Investing →</a>';
      sec.querySelector('[data-o="snapLede"]').textContent = tx(OUTLOOK.snapLede);
      sec.querySelector('[data-o="disc"]').innerHTML = '<b>⚠</b> ' + esc(tx(OUTLOOK.disc));
      sec.querySelector('[data-o="src"]').textContent = tx(OUTLOOK.src);

      var ig = sec.querySelector('[data-o="ind"]');
      ig.innerHTML = '';
      for(var i = 0; i < OUTLOOK.ind.length; i++){
        var d = OUTLOOK.ind[i];
        ig.appendChild(el('div', 'ind-card',
          '<div class="ic-l">' + esc(tx(d.l)) + '</div>' +
          '<div class="ic-v ' + d.k + '">' + esc(d.v) + '</div>' +
          '<div class="ic-n">' + esc(tx(d.n)) + '</div>'));
      }

      var dg = sec.querySelector('[data-o="drv"]');
      dg.innerHTML = '';
      for(var j = 0; j < OUTLOOK.drivers.length; j++){
        var v = OUTLOOK.drivers[j];
        dg.appendChild(el('div', 'res-card',
          '<div class="rc-h">' + esc(tx(v.t)) + '</div>' +
          '<p style="font-size:12.9px;color:var(--grey);line-height:1.7">' + esc(tx(v.d)) + '</p>'));
      }

      var sg = sec.querySelector('[data-o="scen"]');
      sg.innerHTML = '';
      for(var s = 0; s < OUTLOOK.scen.length; s++){
        var c = OUTLOOK.scen[s];
        var wl = '<ul>';
        var arr = c.w[L()] || c.w.en;
        for(var q = 0; q < arr.length; q++){ wl += '<li>' + esc(arr[q]) + '</li>'; }
        wl += '</ul>';
        sg.appendChild(el('div', 'scen-card ' + c.c,
          '<div class="sc-p">' + esc(tx(c.p)) + '</div>' +
          '<div class="sc-t">' + esc(tx(c.t)) + '</div>' +
          '<div class="sc-d">' + esc(tx(c.d)) + '</div>' +
          '<div class="sc-w">' + esc(UI.watch[L()]) + '</div>' +
          '<div class="res-card" style="border:none;background:none;padding:0">' + wl + '</div>'));
      }
      paintCyc(); paintDet();
    }

    repaints.push(paintAll);
    document.addEventListener('spz:cycle', function(){
      sel = window.SPZ_CYCLE.phase;
      try { paintAll(); } catch(e){}
    });
    paintAll();
    return sec;
  }

  /* ================= HUB ================= */
  /* one accent hue per card, cycling -- the same small palette the hero
     ring above already uses (radar/price/flow/proof/learn), so the
     index below reads as a continuation of it rather than a plain grid */
  var HUB_HUES = [
    { hex:'#ccff00', bg:'rgba(204,255,0,.09)' },
    { hex:'#5ec8ff', bg:'rgba(94,200,255,.09)' },
    { hex:'#ff3b4e', bg:'rgba(255,59,78,.09)' },
    { hex:'#7CFFB2', bg:'rgba(124,255,178,.09)' },
    { hex:'#ffb020', bg:'rgba(255,176,32,.09)' },
    { hex:'#c792ea', bg:'rgba(199,146,234,.09)' }
  ];
  /* the -90deg starting offset used to be a static SVG "transform"
     attribute on .hc-arc, but a CSS transform (the hcSpin animation) on the
     same element overrides that attribute rather than combining with it --
     the ring would spin around a point that visibly drifted from its true
     centre instead of staying put. Baking the same quarter-turn start into
     stroke-dashoffset instead means the animation's own "transform" is the
     only transform ever applied to the element, so it always rotates
     cleanly around its own centre. */
  var HUB_RING =
    '<svg viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle class="hc-track" cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
      '<circle class="hc-arc" cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-dasharray="78 100.5" stroke-dashoffset="25.133"/>' +
    '</svg>';

  /* Routes that exist and are fully routable, but are deliberately left out
     of both the Home hub grid (buildHub) and the top nav menu (buildNav) --
     currently just Connected Users, which is reachable only via the admin
     login gate's own panel button. */
  var NAV_HIDDEN = { connectedusers:1, printreport:1, announcements:1, pro:1 }; /* Round Q: Institutional Pro Desk moved into Cockpit, see part-47.js */

  function buildHub(){
    var sec = el('section');
    sec.id = 'hub';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-h="eb"></span></div>' +
        '<h2 data-h="h2"></h2><p class="lede" data-h="lede"></p><div class="rule"></div>' +
      '</div><div class="hub-grid" data-h="grid"></div>';

    /* cursor-follow spotlight -- delegated once on the section so it
       survives paint() rebuilding the cards underneath it */
    sec.addEventListener('pointermove', function(ev){
      var card = ev.target.closest('.hub-card');
      if(!card) return;
      var box = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - box.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - box.top) + 'px');
    });

    function paint(){
      sec.querySelector('[data-h="eb"]').textContent = UI.hubEyebrow[L()];
      sec.querySelector('[data-h="h2"]').textContent = UI.hubTitle[L()];
      sec.querySelector('[data-h="lede"]').textContent = UI.hubLede[L()];
      var g = sec.querySelector('[data-h="grid"]');
      g.innerHTML = '';
      for(var i = 0; i < ROUTES.length; i++){
        (function(r, n){
          if(!document.getElementById(r.id) || NAV_HIDDEN[r.id]) return;
          var hue = HUB_HUES[(n - 1) % HUB_HUES.length];
          var num = n < 10 ? '0' + n : String(n);
          var c = el('button', 'hub-card' + (r.feat ? ' feat' : ''),
            '<span class="hc-top">' +
              '<span class="hc-dial">' + HUB_RING + '<span class="hc-n">' + num + '</span></span>' +
              (r.feat ? '<span class="hc-feat-tag">' + esc(UI.featured[L()]) + '</span>' : '') +
            '</span>' +
            '<span class="hc-t">' + esc(tx(r.t)) + '</span>' +
            '<span class="hc-d">' + esc(tx(r.d)) + '</span>' +
            '<span class="hc-go">' + esc(UI.open[L()]) + ' <span class="hc-arrow-i">→</span></span>');
          c.type = 'button';
          c.style.setProperty('--hue', hue.hex);
          c.style.setProperty('--hue-bg', hue.bg);
          c.style.animationDelay = (Math.min(n - 1, 9) * 45) + 'ms';
          c.setAttribute('data-hub-go', r.id);
          c.addEventListener('click', function(){ route(r.id); });
          g.appendChild(c);
        })(ROUTES[i], i + 1);
      }
      /* both cards go in a shared full-width flex row (.hub-bio-row) rather
         than as two separate hub-grid cells, so they always stretch to the
         SAME height regardless of which one has more content -- see that
         class's CSS. window.__spzPersonalCard returns null when nobody is
         linked, so an ordinary visitor still gets just the one dev card,
         same as before. */
      var bioRow = el('div', 'hub-bio-row');
      if(window.__spzBioCard) bioRow.appendChild(window.__spzBioCard('in-hub'));
      if(window.__spzPersonalCard){
        var pc = window.__spzPersonalCard('in-hub');
        if(pc) bioRow.appendChild(pc);
      }
      g.appendChild(bioRow);
    }
    repaints.push(paint);
    // rebuild the hub the instant LINE links/unlinks (from ANY entry point --
    // the corner gate, the Watchlist page, or this card's own edit button)
    // so the personal card appears/disappears/updates without a reload.
    document.addEventListener('spz:line', paint);
    paint();
    return sec;
  }

  /* ================= TOOLS MODAL ================= */
  var modal, modalTab = 'sizing';
  function buildModal(){
    modal = el('div', 'modal-back');
    modal.id = 'v8Tools';
    modal.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-top"><span class="modal-title" data-m="t"></span>' +
        '<button type="button" class="modal-x" aria-label="Close">✕</button></div>' +
        '<div class="modal-tabs" data-m="tabs"></div>' +
        '<div class="modal-body" data-m="body"></div>' +
      '</div>';
    document.body.appendChild(modal);

    var body = modal.querySelector('[data-m="body"]');
    for(var i = 0; i < TOOLS.length; i++){
      var s = document.getElementById(TOOLS[i].id);
      if(s){ s.removeAttribute('data-route'); body.appendChild(s); }
    }

    modal.querySelector('.modal-x').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });

    function paint(){
      modal.querySelector('[data-m="t"]').textContent = UI.toolsTitle[L()];
      var tb = modal.querySelector('[data-m="tabs"]');
      tb.innerHTML = '';
      for(var j = 0; j < TOOLS.length; j++){
        (function(t){
          var b = el('button', 'modal-tab' + (modalTab === t.id ? ' active' : ''), esc(tx(t.t)));
          b.type = 'button';
          b.addEventListener('click', function(){ modalTab = t.id; paint(); });
          tb.appendChild(b);
        })(TOOLS[j]);
      }
      for(var k = 0; k < TOOLS.length; k++){
        var sc = document.getElementById(TOOLS[k].id);
        if(sc) sc.classList.toggle('on', TOOLS[k].id === modalTab);
      }
    }
    modal.__paint = paint;
    repaints.push(paint);
    paint();
  }
  function openModal(tab){
    if(!modal) return;
    if(tab) modalTab = tab;
    modal.classList.add('on');
    document.body.style.overflow = 'hidden';
    if(modal.__paint) modal.__paint();
    var rv = modal.querySelectorAll('.reveal');
    for(var r = 0; r < rv.length; r++){ rv[r].classList.add('in-view'); }
    setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 60);
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('on');
    document.body.style.overflow = '';
  }

  /* ================= ROUTER ================= */
  function route(id, silent, viaHash){
    if(id !== 'home' && !document.getElementById(id)) id = 'home';
    current = id;
    var secs = document.querySelectorAll('section[data-route]');
    for(var i = 0; i < secs.length; i++){
      secs[i].classList.toggle('route-on', secs[i].getAttribute('data-route') === id);
    }
    var bar = document.getElementById('v8Bar');
    if(bar) bar.style.display = id === 'home' ? 'none' : 'flex';
    if(bar && id !== 'home'){
      var r = null;
      for(var j = 0; j < ROUTES.length; j++){ if(ROUTES[j].id === id) r = ROUTES[j]; }
      bar.querySelector('.route-crumb').textContent = r ? tx(r.t) : id.toUpperCase();
      bar.querySelector('.route-back').textContent = UI.back[L()];
    }
    if(window.__spzSyncNav) try { window.__spzSyncNav(); } catch(e){}
    var host = id === 'home' ? document.getElementById('hub') : document.getElementById(id);
    if(host){
      var rv = host.parentNode.querySelectorAll('section[data-route="' + id + '"] .reveal');
      for(var v = 0; v < rv.length; v++){ rv[v].classList.add('in-view'); }
    }
    if(!silent) window.scrollTo({ top:0, behavior:'auto' });

    if(fromPop){
      /* the browser moved us through one of OUR OWN tracked entries (its
         state object carried a numeric index -- see the popstate handler
         below); do not touch the stack, it is already correct. */
    } else if(HI < 0){
      HIST = [id]; HI = 0;
      try { history.replaceState({ spz:id, i:0 }, '', '#/' + id); } catch(e){}
    } else if(HIST[HI] !== id){
      HIST = HIST.slice(0, HI + 1);
      HIST.push(id);
      HI = HIST.length - 1;
      try {
        /* viaHash: this navigation's browser-history entry already exists --
           either a hashchange fired by some other script's plain
           `location.hash = ...` (many pages do this instead of going through
           this router), or the popstate recovery branch below for exactly
           that same case. Tag that EXISTING entry with our state object via
           replaceState instead of pushState, which would otherwise create a
           second, untracked entry and permanently desync HI from the
           browser's real history depth -- the cause of "back" silently
           skipping pages or doing nothing after visiting certain pages. */
        if(viaHash){ history.replaceState({ spz:id, i:HI }, '', '#/' + id); }
        else { history.pushState({ spz:id, i:HI }, '', '#/' + id); }
      } catch(e){}
    }
    syncBtns();
    if(id === 'pro'){ setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 60); }
    if(id === 'chartlab'){
      var lb = document.getElementById('chartlab');
      if(lb && lb.__render) setTimeout(lb.__render, 40);
    }
  }

  function buildNav(){
    var wrap = document.querySelector('.nav-links');
    if(!wrap) return;
    var outer = wrap.parentNode;
    if(outer && outer.classList.contains('nav-links-wrap')) outer.classList.add('menu-mode');
    wrap.classList.add('menu-mode');

    var menu = el('div', 'navmenu');
    menu.innerHTML =
      '<button type="button" class="nav-trig">' +
        '<span class="nav-burger"><i></i><i></i><i></i></span>' +
        '<span data-n="lbl"></span><span class="nav-cur" data-n="cur"></span>' +
      '</button><div class="nav-pop" data-n="pop"></div>';
    wrap.innerHTML = '';
    wrap.appendChild(menu);

    var trig = menu.querySelector('.nav-trig');
    var pop = menu.querySelector('[data-n="pop"]');
    trig.addEventListener('click', function(e){
      e.stopPropagation();
      var opening = !menu.classList.contains('open');
      menu.classList.toggle('open');
      /* Round Q: on phones .nav-cluster can wrap/center, so the popup's
         normal position:absolute (anchored to this trigger button) can
         land the trigger anywhere in the row and send the popup off the
         edge of the screen. Below 560px, pin it to the viewport instead
         of the trigger so it always fits, measuring the trigger's real
         position fresh on every open (works whatever row it wrapped to). */
      if(opening && window.innerWidth <= 560){
        var r = trig.getBoundingClientRect();
        pop.style.position = 'fixed';
        pop.style.top = (r.bottom + 10) + 'px';
        pop.style.left = '12px';
        pop.style.right = '12px';
        pop.style.width = 'auto';
      } else if(!opening){
        pop.style.position = '';
        pop.style.top = '';
        pop.style.left = '';
        pop.style.right = '';
        pop.style.width = '';
      }
    });
    document.addEventListener('click', function(e){ if(!menu.contains(e.target)) menu.classList.remove('open'); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') menu.classList.remove('open'); });

    var DEV_AVATAR = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUEBAQEAwUEBAQGBQUGCA0ICAcHCBALDAkNExAUExIQEhIUFx0ZFBYcFhISGiMaHB4fISEhFBkkJyQgJh0gISD/2wBDAQUGBggHCA8ICA8gFRIVICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCADwAPADASIAAhEBAxEB/8QAHQAAAwACAwEBAAAAAAAAAAAAAQIDAAQFBwgGCf/EAEEQAAEDAgQEBAQDBgQGAgMAAAEAAhEDIQQSMUEFEyJRBjJhcQeBkaFCUrEIFBUzYnIjosHRFiRDU5KyY/CC0uH/xAAaAQEBAAMBAQAAAAAAAAAAAAAAAQIEBQMG/8QAHxEBAQADAAIDAQEAAAAAAAAAAAECAxESIQQxQRNR/9oADAMBAAIRAxEAPwDxz+iP6LBf2WR30RB90Y7/ACWAT7bIx3QZ7ox31RDSdVkXvqiM/wDZGP8AyRAOp1RA9OpAPYdXZNH5RdNlMEjzLADPSL+qAAflg3umDY8t9imykeXc3lY0fkEXvKAAAwGgFu6yANuncp8paBHl3lYGk2Ahu/dAsToOiNUCANR091QtIsfLHzQylwiOj7qhCJ1s0aFCALOsNk7gQYIlu0arA0u10FxCgmRPmt2SkX6hB2VXD84ntHZDKT5tjaEESO4uh7+bsqEfmF0MpiTrCCcfVA/dORfTqQIOu6CZF7aoeyfewugQRoiljsh7aJvZAiPZAv6IfomQj6IG0E/ZYO5+iz1RFroDdvzRAjW8rBAvrKOnrKA3bbWUQIIGvqiAG6yZRAy2uURgkdG8apg2+W8xqiAB0X01TAWySe07oMuZZMRuiG5iQJaRujlBllxbVNAd0yRHYooCX2ktg7botbmPSC2D9UwAqWu2DsiIfFyIM2KoUAvAdcAbd1gBjOAQAPL3WVCA0PaCCNBpK06j3nqJJnRBuwXDOZiPKsjKM4mI8q0WueKbocVWlJdJdLe8aINhzdXGTO2wQILL3IcdOy2mMIPKqFs/geNHehUSA0uJDjJ0OyCThlMmXSfogQWQJzZjvsqZeWdzJJudECAwxd0ndERLYIBknuhBByamNVWAzpkmd5S5QOi+mqgiW/hvMaoEXLd+6qfyX7SlcAZbcHugiRJI09UPN6QnN7aIRJ3EFAkTpZDUSm83oge/ZFIdJWbT9k3ql0ugb+pHS5WASZP0Ri9kB0vrKYW9ZQA9UwBBtdEECLaymHTDZJndFrR3lEAiwuO6AtB8l5jVOP8AtyZjVY1gy67apgLZZtHmQGCZpyQQPMj5iWgkERdEsGSM0W8yzKTIJLROqqiAX6S3Kbxunpt5zg0Etg/VYWi18t9rK1Fz2nM1nWTAtpug3MRh8PReGVeoOAawDfT/AFK28D4QxHF8eGYZmam6wjQDSfqtHhGExPH/ABHgOFMMVKj2AnXLeSV6b8AeEH8N4hxXAYnD9QYOUSJBb6fMfdeO3ZMfTb0af6Xt+nTPHfhv+64PCmg0tpct/XF3uBEu/wBl8q/wtUwQbVq1sl8sREH1Xr7xB4fpYvhOErUKeVjfwlt7ka/MLrDxv4LxEPrUaDnUcYzMRH8t4kH6iD8l44bvytvZ8WX3i6D4lhm4PFGnUPUDBiy4WpXLajsrswmQe6+r4rw7EvoUaWJYTiKINGo4i5LfKfovjKrTTeQbEFbOOfk52eFxrkWVA5gcCXZj9EYNMgEl2YmCdlr4OoYe1oncLbDBfqzXOt4WbyRjLDSS4ndKQR/hyZjzKkEdIlwO6XKOXAdNvMgkb9EmY1SkEyzQjdUIsWzaPMlc0ZTeB3QRNzlEiEsZvSFR0kwbDulLR3i6iJm+iGt9ExE62QIiECeqB7pt7oHVFN7eZEemqz9UfbVEGL9Ou6cC/THqgPQCd04/pHvCAgaZNJvCdoFssZd1gm2QDW6douMoGX0QY0DaOXHyTgCPw8qFjRAAAby4TgW25cabRCKEC+aOVFuyfK0zzMvLkRKMEyHBvLhNFyHgZPWI1sqEgTFaPN0ytvCOdSrguAPS6PfZTA/7oaRNp7rZweCx2OFcYfD1avKpGpU5bJ5bRq4xoNLlCO3fgr4MxGKwOI8Z/uzauJqv5GDpPs0ged5+f6Lu+p4W8U4nCPxtXxlW4fitQzCsaKbB+WDr7rV+DvDG0/hlwekxha3kkW2Jcbrc8R/C+vxYmoOMcV5jjm5p4rVpBvpkYMsfJczLZfOu7r1ya8Y2+G4viNBwwuPqjFtaPORd57r57xf4nGHwtXDUqTTWIlrXBfdeF/DVTg+Cp0sdiHYuo3pD3uzEj1MCT6rr7xPwipjfHlfDUHNpuyZqZcJAdsSN47ei8vK97W1yc5HTfFfDfjni5dj6+Ew2HoHqAyhpcF1d4k4PVwVE4h1M03tqZHsI0nQhei+P+C/FVGk5+F4/xfEvy/8AWdRdSnvlDQQuqPHWAxOD8NVP34tfXzNDnNBAmfVbWvPtkcvfq5LfbrXh7H5ajxGoC2iBI5MZZOaAswrHswdNrRBgk6aqpBBHLDYm63nMQhsf4eXJeYSQ0C0cnL8laIPSBk9IjW6WNIDeXHyRESBH4eXCRwF5jlxZWI2gcuPlEJHDUEDlwgg4D8UZdkhH5+9pViL9URKQg/ijWygkR+aNbJI0za7Kv92u0pHTvrsgQjv5kv6pz90Dp6oM9d0w9NVg1vqjvA1QMO7dZuqC3kA1ulZEkRfdOBMhtoPsgZogjJoTeFRuwYBkvKFOCDAi/aEzBN2ghvaIQM0CwEcqPknAkRDeVH2WMymkCGw2NITNHRng8uPLG0aQqDDTma6OUBbsmgXFUNDJESmOQUZLSWx5Y/0QggZqgLmE2ETvayDAM386IDumRHsvuPhfjRh/iLwvA4l5Zh+JVf3J4a/LJeCGz3GYix1kr4x5aA2Wl0kRAm6almoPp1Hudna8Fj23LXC4IOyxyx8pYzwyuGUyn495/D7AfwPwhguGV4FbBs5NQf1NJBXMcV4/hGYijh2tNSrUMNpgyur/AIceNqnizww3HYlxZjab+TioNnvDRLx/dY+8rmMVxXg/hHGYzxL4jxj6eGaBTY8UXVOW0xJhoMSTquXey3H9fQa/HLGZx9fS8T8BfxFvDqvGsG3GAScM2oOYz3C6s8V+JOGUvGBqUOI4ZleiD0PdGfsB6r6biXibwDjsE6vVo1RUxLQ4VTg6jHERZ0xOm66S4vwzwFUx9TGUON1aod1RiWn9SNFJj17Zdk7I7xwHHuH8W8P08bTLXNezTsuifijRw+NpVaTQC19RgI//ADH+i57gfFsFS4BiWYKu3k0rNyOlq638UcXdkDKkvq1SXNn8Pqs9eN8vTT+RsxuHt8TinU3VicO2mIIa7IABZasAEcqIJOaBN1TI6TyekAkGbSe/qsaWODi1hbc2iLrpycnHEyvbahlbYUw3l3mNEhAjKI5OX5KgBIzMBa3sRG97LOg0Q4MIEaQqiBiIhvKj5JHBvUHEcsC3ZUPlLiDkjy/LSEH5RTnLIjSFERcBo8DLskI/P3tKo4EXfJE6apXwIkTJ7IJHXrgdkmsZvNsnIiM1723Su7bnRAh0v5kp19Ux1g6pTrG6Bv6fumAnp0jdKPypxrl7IGAzWuIKoBn2LYKQXsJEKg6/SDFwinAzkGIymL7qjOqHw4RNu6Rpz6EjKVRkPIfcRsRdEO0F0VspFvLuqCw50OnLOVK1wIFYZoicsJxH8+8RmiL6aKg5SzNXykggHLunM05qBr3TAgbIFwa01iXEROWE1qU1LmToBe5RRa00L5S7M6OnZPBYQ3K54e6PZCRSu4udndFhMIhzaIa0ycxDRA+5Qdj/AAl8T0PDvGKvCMbV5eH4gQWVNmVW6SdpBj5BerOCso47BubWpsrMc3K5rhmDgdiF4QpOGHqMc5ziS7MDGkXXsPB4vifhjiFPGUKb8Rwmu0PdRF3U5Ey309Fz/k48ymUdX4ey+Nx/x9BxR54JhXclmL5bWlrBRMsa2IjIQRp2XS3jEYXj+LhmGxxY9gpkOIpNy2GjQJ0C7jxHxH8OY3DOpHEUWOB6g85SPkV1z4q8d8Bw9Go3BcirWcMoLLlsry9z8dC7cbje8dfcR/h/BuF0+FcJw7KFOc1TII+S6z4vif4pj6hAIbSIa0ncei+l4rjKuMp4msQWhzDA+S+NNyabXOaWQJjVbWjHva4vyM7fRINSWua5gY6Ae6QtNV4dlLchIh26o6KoIE9JLeofcJZ5l2lzcriDIhbbUT84FQte0iek7qcF3+PkI6fLuqCKn+L1ADYi9ilzAtFbqiJywgmR082HaTlUnAtzVcpMiY3VnRBrX0mIvopucADUJdBGiIk4FkvhxnbspkFmxMnbZVdDJdcydgpno1JMlQTIyWu6SpwWwNZVD0W1m1kjrWuZ3QIR+HvulP5fumNjl7pT+VAdov7pvTT1Sgx7JtbnTZBQDMIvY690/mtJbB+qRpy62GycCfNa9kFGjPBgjKd91Vpkh12xsVNros+ATpG6dokjPAdsAdUFW9ThWykdPlOqcOvzL+Wcm6DXmA0xzI0RAJuI5sTE2mFQ46S6tlJkAho1TzkJf1PkjpGoQzuylrINUDTZYAQSaeVz5uCbDuinaDSk5S7M78OydsMESamZ0WvHulNQ25cEzebWSsdDnCkIgXcVR2V8DPDWH8TfGXgHC8cxtbC4eo7G4hpEhzaQLg0z/Vl+S9fYnhrW06mDrMzOouLSTrIOq8pfs7Y9nDfjnwIVHZRjRWwhJOpfSdH3AXuLjfCnYyka+EZ/zAFxoKg7e/Y/Ja/yNVzxln42vjbZry5f15s8e+EcFXY6q2iWP/7lMQV0l/C/3WvUnM4AxLtV6s482m+g+nUpFxBIIi7SNQV05j+A4jiHGW4XhuBfWrVXZWU2i5P/AN3XOxyv06meEs8nXnDsDWxnFKGFw9PPUqPBIizWAy5x9AP1C+I4rh24bj3EOFH+Zg8S9n9zJ6T9CF6hw3gzC+GsJU5TxiMZVA/ecQB0kj8DP6R33N+y8peMcXzvH3GcZh3ROKcGkelv9F09eu657cbbsmWXozjns4up5XQJtPskLTUe12UgNJBzbrQbxEVYbiKRH9TP9itunjKT2kZ2h02HpsvV5GLs5D7tiek6lTIkitlI6fKdU8GQamUVOwNj2S53ZAHZRVjTZETcf+pfyzk3UyMpdUykyJjdOZ1tzImNpSuccpDYLwNEVJxykuu6ToNkhGXYmTtsnIIJLILpuCUrnT5IN7oJHpOpdJU/KI77qhseiD3SEyLXG6gSNtbapD2+6eYNtO6U3PoiD+iYesZUn/qmHrogoLm5ETZUBjzxrZTBGjojZOL+e17IKtEkF5Eg2hVYYIz5S/aFFrhbOBM2VGSSC8AO2EoLNzWlw5uX5Jx0jVvNiJ2lTa6AJDebGi3Kbf8Al87gM0B5A/8AvZWKVlMg8wnqIvGioAA4uaACVV0Cw0CmVnwTeZtNyqUmhrYEXU29VWTsnNNmfPBae7TBKDlOD8UxHBeN4Di2CeWYjAV2YljhsWODv9F+m3DcbQ4jwzC4/DuDqGLosr0z/S5ocP1X5ctdBjRe0vA3jPjGN/Zv8P8ACvCo/efFVfD1eH0HTbCtpPLDXedg1pbHdxHYoNr4iePfh5gfGz+C4jj1PBcQpNP79XyOdQpuAsxxaCTU/tBjQq3ww8SfDrj1TiVHgPGm43jDGnnNqUzSfyZguph1ywmJOukgDXyX4m8Lcd8IcdxvhfxN/jVxROJoYnMXc5pmTm3MzPquG+GWB49j/iZwj/h7GVMHjaOJa5tdv4RuCN2kSCNxZef88Zn5c9vb+2dw/n309g+MH1cT++voAUcHhqby5/5WtEuI+QK8I49wxOOr4logVajnx7mV7i+LmMd4c+FfH+YwMrYihyGuGmaqQ23yLvovENSMxgey982vi1OVGV2xsqCmCLhY+l1tzuNTtOg9grhvSF5skwKlMgscbabphiZJNQZXxAdt9ESRupPiCYU4NiQ5ktc1zy3XaVN09RaRzCL9lNriyoKbBcNIg907nWOUDmRooA7fJGabqbhB6CNbymcdcgGab3SEieiDe6gQ/wBEa3UzbQiN07jeG37pDFssRuiFPp5Up/yok/8Ajul/RARe2yb30STF/sm9Tf0QUaCRfTUJ/wC+/ZTBy31nZOLa9UlFUaCYLtjaFQGCMwBd3GikCWkA3kp22IaZcTv2QbFNrnkExniLaLkbBzhq3RaGGJbWa2S7KJlbcyyVlEGk/NTAOrek+4VLZTK0qdTJinsOjhmH+q2g76LJSCz1UmWh0nskIWC8t7hAwN16h/ZQ4jRy+J+Evg1wKVdhOuS4IHpN/cry2DC7j/Zu4uOG/GehhXvys4lgq+HjYua3O3/1Ks+x9Z+0bxTh2L8Q8F4JyGvxXDcJicVVrnzTVcA1ntDC6PULjP2T6PDsd4i46ytTb++YVrK9M/8Axklpj2MfVfI/E3iH8W8beI+J1HTmqOw9L+xoDR+h+qP7NPEKvDPjvw/CgxT4jQr4R479Gdv3YFbfaOxv2meOk0v4RN6mMp2n8NOkSf8ANVC8uNu4ruD9oDjH8Q+JGJwmaf3QvB/uc7/ZrV0/T1Uy+1JiSQxrW2c5wAPZO52VqRxz4s9qQj5n/wDiSq7ZYgMJulDpqhuwuVjDDSp0z01ah/tCgXO4Vw8azuttwcJcIzn6LRf5VuZy8FskGB1LEKTJOTzTulcCD097yibuIEtIOvdITm3iCgWb9IjukNtNN00zp0wfqkJzAHREL+iBt7LCdx9EDcT9kGDumFr90sx1IyRdFUEC9zKYHL6ypgxfWU4MdzJRFBDTuZKdpy9MkzvKmCWQDeUwOWGyTO6K3cJDGvFyYAkrYkhtjZQwzYw97mdUxdEg6LOfQ169TLWp1Bs6Ct4OGq4nFOLcwPut6lUz0mnuEG0XWQJggqeayJcqKPEG29wuc8Fca/4e+IXh7jbnZaeDx1J1Qz+Auyu/yuK+fLs1MDdtvkpVeqm5s6hB9l4gxzcVisZDgc1V5/zFcl8FKjcL8dPBtR7g0P4hy5n8zHgfcr4XDYh1bDseTLiyHe4sVz3gvidLgnxA8O8YruDaeBxzMQZt5QT+oCvUL8RsceIfEbxFis2YPx9VrT6NeWj9F8q2GMLjYC6pia1SvXdWrEuqVHF7idyTJ+5WpiXjI2j+c39t1jaoUnHlZj5nnMfmp1DCdxA0C16jsx2Uocuy0yVjBOGpt9MxWtUc7JBNltMJGHz/AIQIUgi49Yb2Ww0h1ENuDESFqNlzyYWywksNMWvqoGcQ6W3EeqQw47iCi4zLQSI3STm9IOyDCc3pCQmb6QiTmPaEszfSEQCZv9kp7ok7pSd0URqjoUv6oj01RDiEwMaXSf267pgfy97oKNj3RaSLC47pLWy/OEwIjpjLuiuTw4ig0AzZB4iUaJDaYbsAP0U3k3hZjTxLcwBIVcI8coNGgS1r0io4N8NI9VP0coSAAsJkKWaRqsBsR2VDtflcJ8psUX2n0UjoiXZmTuLFBXhZAdWadGOn6p6xFWs0jRpkfJaFGo6njHtFhUb+i22uOV0iwQSeZqLSD+djHvF2t6QrYqryqLnA3NgoYVuWlKgo85QolxN5RqOzvDdpSPcBMabKUQqdTgO62qxy0GUhoPutRt6zfdXqdTwNUDUmw2U7YIeCYTBuWndSBGdwdolDmTY2HdA+8LCRfNGXZIf6u9lEA3N7IFE/1fJJ76oM1KUon7oH7orP1TA9tUk/VH21QOPTXdNPZJ7a7oj0QUBNohMNYbopgxp807PM0NiJQciHXy+iDkQwQHeik92yzE6vkN1pYd0Od6FbDwS1xJWrR/muClHKMMiQnEEGe6hSJAiVYbqgnRJMGDoU2qRwsUEXu5eJpPNodB+a3S6WkjcrjcVJpz2W5Vqihgw865QAPVQcfi6nNxIpjys/VXBy04C1KDSXZzclbTjAUEjAcpPKYmXKbyogUr1gt1lMTmmVpUbvK3mtyCXFWKyq6GwoM1voneQ8+iVwbadEoJPfRAnvHogfWI2S/wB3yUGT3QPrqs90PU6ojP1Sn7rP1QP3RWIyh6LPRA4R10SaptfRA4I2T0b1mRYSpax6KtAF1ZuXXskG7iMQKbcrVpl73GQ0rcZhiHZqhBKNSrQw3mIzdt1mNJ7nFhBBC1qJHNI7quIxrqrSxjcrTuo0P5vyWI5CmdlUE3UKVwrBZB80rEh1WZu6Cb2B7smxUMdV52J5TfJTt81eq/lsNQagW91o022ncqUWpCBATVDa6LQGMlQc4vPooAXXU3FObBTcoKYaM5VXCu8zGVq1GktcC03W6ytUgCpSzDuFQsOGywukXGit0uEsOYeuoSVGBrS6U4iRMGTcLCQhpdDRRWaaoE/VPyaooCuWONIvyZ4tmiY+inp80GfqlP3R9ENLIMR1skB2TemiAz9k2qXVZ9kDi6em4tqNeLEFS1RndBylTGBjS02PcLUZRwr5JqFzj3K2qVKk5oqkBxPfZB7KFyWCfRZo0K2HdmimyfYpaLHNqAOaQfVbwoyc3kaFpiqXYht5AJCxVdhyPg6FbPZQc3MwEaqlN0tHcLIMUpCYoHRBrYgF2SncydAlFIsDZaQCMwPfZUqQajSRISk3IDQB6LEK6SUmWFRLtKCZCi4qrzYqB1UD0mOc8Q0kei5EFtJkOOX3S0WllIAawsLWuMlslZSCTsQ2YY3XV0JHvJgk2VXMabRCi+AYbeFKATF01I0hWZzw80p6hTjNHpNlPeUJjRQdl1KnhUeCG9Ljgc0NaP5vN/8A2+0ei63qcvmu5OcUyenPBMesIcypyhRLyaebNlm0xE/RJogzSyHoj6JSdkARB7oLEU4OxR90numnuiDMao++qHus90G5Qe9jA9txoQtttQOErTwhlr2OPqtnKGMMLOITEvL6WRjolavKbTAcCCRurObm7ysrUwzD21UU7bNvb/VAdLz21S0KmZjZ3Crkabi3t/sqMBQcYCUy0kJSSgSobi6Qm6x5Jc0AEk7AJQczrCyxDi6FQhogappyhRdLnIJvOyVozVGt7lMWp8OJrz+USoN8kNF0jqgiyL9iFNwKyEqjnEWspae6q+wuoalY0H2WeyHss9kVnsslD2QPogwnsgshYg//2Q==';
    var DEV_IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';
    var DEV_FB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 8.5H17V5h-2.5C11.6 5 10 6.6 10 9.2V11H8v3.5h2V21h3.5v-6.5H16l.6-3.5h-3.1V9.4c0-.6.3-.9 1-.9z"/></svg>';
    var DEV_BIO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M9.5 14.5l5-5"/><path d="M8.2 16a3.6 3.6 0 0 1 0-5.1l2-2a3.6 3.6 0 0 1 5.1 0"/><path d="M15.8 8a3.6 3.6 0 0 1 0 5.1l-2 2a3.6 3.6 0 0 1-5.1 0"/></svg>';

    function bioCard(cls){
      var th = L() === 'th';
      var wm = window.__spzMark ? window.__spzMark('dev-wm', { stroke:true, w:1.4 }) : '';
      var wrap = el('div', 'dev-card ' + (cls || ''),
        '<span class="dev-grid"></span>' +
        '<span class="dev-stars"></span>' +
        '<span class="dev-hole"></span>' +
        wm +
        '<div class="dev-top">' +
          '<span class="dev-ava"><img src="' + DEV_AVATAR + '" alt="" loading="lazy">' +
            '<span class="dev-ring"></span><span class="dev-live"></span></span>' +
          '<span class="dev-info">' +
            '<span class="dev-lab">' + esc(th ? 'นักพัฒนาเว็บ' : 'Web Developer') + '</span>' +
            '<span class="dev-name">Noraset Boikaw <span class="dev-nick">"Focus"</span></span>' +
            '<span class="dev-role">' + esc(th
              ? 'นักวิเคราะห์ Elliott Wave — ลงทุนมาตั้งแต่ปี 2023'
              : 'Elliott Wave Analyst — investing since 2023') + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="dev-links">' +
          '<a class="dev-btn ig" href="https://www.instagram.com/spczterminal" target="_blank" rel="noopener noreferrer">' + DEV_IG_ICON + '<span>Instagram</span></a>' +
          '<a class="dev-btn fb" href="https://www.facebook.com/share/1GBykHfZ1V/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">' + DEV_FB_ICON + '<span>Facebook</span></a>' +
          '<a class="dev-btn bio" href="https://linkbio.co/6120202qnLaXl" target="_blank" rel="noopener noreferrer">' + DEV_BIO_ICON + '<span>' + esc(th ? 'ลิงก์ทั้งหมด' : 'All Links') + '</span></a>' +
        '</div>');
      return wrap;
    }
    window.__spzBioCard = bioCard;

    /* A second, separate "who's looking at this" card -- shown to a
       LINE-linked visitor. On the Home hub it sits next to the developer bio
       card (never instead of it); in the nav-menu drawer it takes over the
       developer card's own hero slot instead (see buildNav()'s paint()).
       Their own LINE photo + name (editable -- defaults to their real LINE
       name, but they can override it) and a free-text "about me" note (no
       Facebook/Instagram links here, unlike the developer card -- that slot
       instead shows their admin-assigned rights tier + remaining access time,
       when the admin has set either). Edit reuses the same self-service
       Worker endpoint the Watchlist page's own connect strip already uses,
       just different fields (window.__SPZ_LINE.updateIdentity, not
       updateProfile). cls === 'in-menu' switches to the compact nav-drawer
       layout: a small three-dot button next to the name instead of the
       hub card's full-width "Edit profile" text button. */
    var PERSON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path></svg>';
    var DOTS_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></svg>';
    var LIKED_HEART_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.7-4.35-9.3-8.2C1.02 10.4 1.6 7.2 4.2 5.7c2.2-1.28 4.9-.7 6.3 1.28.5.7.9 1.3 1.5 1.3s1-.6 1.5-1.3c1.4-1.98 4.1-2.56 6.3-1.28 2.6 1.5 3.18 4.7 1.5 7.1C18.7 16.65 12 21 12 21z"></path></svg>';
    /* "N days left" / "expired" text for whatever access period the admin
       set (accessUntil, a YYYY-MM-DD string) -- same date math as the
       Connected Users page's own accessState(), just phrased for the
       visitor's own card instead of an admin row. null when nothing is set,
       so the caller shows nothing at all rather than a blank/zero value. */
    function accessRemainingText(accessUntil, th){
      if(!accessUntil) return null;
      var today = new Date().toISOString().slice(0, 10);
      var msLeft = new Date(accessUntil + 'T00:00:00Z') - new Date(today + 'T00:00:00Z');
      var days = Math.round(msLeft / 86400000);
      if(days < 0) return { expired:true, text: th ? 'หมดอายุแล้ว' : 'Expired' };
      if(days === 0) return { expired:false, text: th ? 'หมดอายุวันนี้' : 'Expires today' };
      return { expired:false, text: th ? ('เหลืออีก ' + days + ' วัน') : (days + (days === 1 ? ' day left' : ' days left')) };
    }
    function personalLineCard(cls){
      if(!window.__SPZ_LINE) return null;
      var lineSt = window.__SPZ_LINE.state();
      if(lineSt.status !== 'linked') return null;
      var th = L() === 'th';
      var isMenu = cls === 'in-menu';
      var name = (lineSt.nameOverride || lineSt.displayName || '').trim() || (th ? 'สมาชิก LINE' : 'LINE Member');
      var avatarHTML = lineSt.pictureUrl
        ? '<img src="' + esc(lineSt.pictureUrl) + '" alt="" loading="lazy">'
        : '<span class="dev-ava-fallback">' + PERSON_ICON + '</span>';

      /* tier color -- reuses the exact Connected Users palette (see
         window.__SPZ_RIGHTS, exposed by that module) so a visitor's own
         nav-bar card frames itself the same way the admin already sees them
         framed on that page. No assigned rights -> no override -> the
         .dev-card base's own plain/neutral scheme (same as the dev card). */
      var rMeta = (window.__SPZ_RIGHTS && window.__SPZ_RIGHTS.meta) ? window.__SPZ_RIGHTS.meta(lineSt.rights) : null;
      var flagship = !!(rMeta && rMeta.flagship);
      var badgeHTML = (rMeta && window.__SPZ_RIGHTS.badgeHTML) ? window.__SPZ_RIGHTS.badgeHTML(lineSt.rights) : '';
      var remain = accessRemainingText(lineSt.accessUntil, th);
      var rightsRowHTML = (badgeHTML || remain)
        ? '<div class="lc-rights-row">' + badgeHTML +
          (remain ? '<span class="lc-access-text' + (remain.expired ? ' expired' : '') + '">' + esc(remain.text) + '</span>' : '') +
          '</div>'
        : '';

      var editLabel = esc(th ? 'แก้ไขข้อมูล' : 'Edit profile');
      var dotsBtnHTML = '<button type="button" class="lc-editbtn lc-dots-btn" data-lc="editBtn" aria-label="' + editLabel + '" title="' + editLabel + '">' + DOTS_ICON + '</button>';
      var textBtnHTML = '<button type="button" class="lc-editbtn" data-lc="editBtn">' + editLabel + '</button>';

      var wrap = el('div', 'dev-card line-personal' + (flagship ? ' flagship' : '') + ' ' + (cls || ''),
        '<span class="dev-grid"></span>' +
        '<span class="dev-stars"></span>' +
        '<span class="dev-hole"></span>' +
        (flagship ? '<span class="dev-flagship-sweep"></span>' : '') +
        (isMenu ? '<div class="lc-head-row">' : '') +
          '<div class="dev-top">' +
            '<span class="dev-ava">' + avatarHTML + '<span class="dev-ring"></span><span class="dev-live"></span></span>' +
            '<span class="dev-info">' +
              '<span class="dev-lab">' + esc(th ? 'เข้าสู่ระบบด้วย LINE' : 'Signed in with LINE') + '</span>' +
              '<span class="dev-name" data-lc="name">' + esc(name) + '</span>' +
            '</span>' +
          '</div>' +
          (isMenu ? dotsBtnHTML + '</div>' : '') +
        rightsRowHTML +
        '<div class="lc-note' + (lineSt.note ? '' : ' empty') + '" data-lc="noteDisplay">' +
          esc(lineSt.note || (th ? 'ยังไม่ได้เขียนแนะนำตัว' : 'No bio written yet.')) +
        '</div>' +
        (lineSt.likedCount > 0
          ? '<div class="lc-liked-stat">' + LIKED_HEART_ICON + '<span>' +
              esc(th ? (lineSt.likedCount + ' บทวิเคราะห์ที่กดถูกใจ') : (lineSt.likedCount + ' post' + (lineSt.likedCount === 1 ? '' : 's') + ' liked')) +
            '</span></div>'
          : '') +
        (isMenu ? '' : textBtnHTML) +
        '<div class="lc-edit-panel hidden" data-lc="editPanel">' +
          '<span class="lc-field-label">' + esc(th ? 'ชื่อที่แสดง' : 'Display name') + '</span>' +
          '<input type="text" class="lc-input" data-lc="nameInput" maxlength="40" value="' + esc(name) + '">' +
          '<span class="lc-field-label">' + esc(th ? 'แนะนำตัว (ไม่บังคับ)' : 'About me (optional)') + '</span>' +
          '<textarea class="lc-textarea" data-lc="noteInput" maxlength="280">' + esc(lineSt.note || '') + '</textarea>' +
          '<div class="lc-row">' +
            '<button type="button" class="lc-save" data-lc="saveBtn">' + esc(th ? 'บันทึก' : 'Save') + '</button>' +
            '<span class="lc-status" data-lc="status"></span>' +
          '</div>' +
        '</div>');

      if(rMeta){
        wrap.style.setProperty('--dc-accent', rMeta.color);
        wrap.style.setProperty('--dc-glow', rMeta.color + '66');
        wrap.style.setProperty('--dc-wash', rMeta.color + '14');
      }

      var panel = wrap.querySelector('[data-lc="editPanel"]');
      wrap.querySelector('[data-lc="editBtn"]').addEventListener('click', function(){
        panel.classList.toggle('hidden');
      });
      wrap.querySelector('[data-lc="saveBtn"]').addEventListener('click', function(){
        var nameInput = wrap.querySelector('[data-lc="nameInput"]');
        var noteInput = wrap.querySelector('[data-lc="noteInput"]');
        var statusEl = wrap.querySelector('[data-lc="status"]');
        var nameVal = nameInput.value.trim();
        var noteVal = noteInput.value.trim();
        statusEl.className = 'lc-status'; statusEl.textContent = '…';
        window.__SPZ_LINE.updateIdentity(nameVal, noteVal, function(err){
          if(err){
            statusEl.className = 'lc-status err';
            statusEl.textContent = th ? 'บันทึกไม่สำเร็จ — ลองใหม่อีกครั้ง' : 'Could not save — try again.';
            return;
          }
          statusEl.className = 'lc-status ok';
          statusEl.textContent = th ? 'บันทึกแล้ว' : 'Saved.';
          var shownName = nameVal || (th ? 'สมาชิก LINE' : 'LINE Member');
          wrap.querySelector('[data-lc="name"]').textContent = shownName;
          var noteDisp = wrap.querySelector('[data-lc="noteDisplay"]');
          noteDisp.textContent = noteVal || (th ? 'ยังไม่ได้เขียนแนะนำตัว' : 'No bio written yet.');
          noteDisp.classList.toggle('empty', !noteVal);
        });
      });
      return wrap;
    }
    window.__spzPersonalCard = personalLineCard;

    /* Round S5: Command Center (the one route that used to get a distinct
       glowing card here instead of a plain row) was merged into the
       Institutional Pro Desk page as a tab -- see part-47.js/part-13.js --
       so it no longer has a route or a menu entry of its own to special-
       case. Left empty (rather than removed outright) since .np-item-special
       in part-31.css is generic, reusable styling a future admin-only
       route can opt back into just by adding its id here. */
    var SPECIAL_ITEMS = {};
    /* Connected Users and Print Report are deliberately absent from this menu
       (and from the Home hub grid below) -- both are reachable only through
       the admin login gate's own panel button, never a listed "page" like
       everything else, since ordinary visitors are never meant to see them. */
    function item(id, n, title, desc){
      var cls = 'np-item' + (SPECIAL_ITEMS[id] ? ' np-item-special' : '');
      var a = el('a', cls,
        '<span class="np-head"><span class="np-n">' + n + '</span>' +
        '<span class="np-t">' + esc(title) + '</span><span class="np-arrow">→</span></span>' +
        (desc ? '<span class="np-d">' + esc(desc) + '</span>' : ''));
      a.href = '#/' + id;
      a.setAttribute('data-route-to', id);
      a.addEventListener('click', function(e){
        e.preventDefault();
        menu.classList.remove('open');
        route(id);
      });
      return a;
    }

    /* the membership entry is a standing storefront link, not part of the
       "table of contents" count -- it gets an icon badge instead of a
       zero-padded number, and its own accent so it stands out without
       reading as the same "admin-only" card the cockpit special item uses */
    var MEMBER_BADGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4-5h10l4 5-11 13L3 8z"/><path d="M3 8h18"/><path d="M9 3l3 5 3-5"/></svg>';
    function memberItem(){
      var th = L() === 'th';
      var a = el('a', 'np-item np-item-member',
        '<span class="np-head"><span class="np-n np-n-icon">' + MEMBER_BADGE_ICON + '</span>' +
        '<span class="np-t">' + esc(th ? 'สมัครสมาชิก' : 'Membership') + '</span><span class="np-arrow">→</span></span>' +
        '<span class="np-d">' + esc(th ? 'แพ็กเกจและสิทธิพิเศษ' : 'Plans and perks') + '</span>');
      a.href = '#/membership';
      a.setAttribute('data-route-to', 'membership');
      a.addEventListener('click', function(e){
        e.preventDefault();
        menu.classList.remove('open');
        route('membership');
      });
      return a;
    }

    function paint(){
      menu.querySelector('[data-n="lbl"]').textContent = L() === 'th' ? 'เมนู' : 'Menu';
      pop.innerHTML = '';
      /* a LINE-linked visitor gets their OWN personal card here instead of
         the developer card -- same hero slot, same treatment (see
         .dev-card.in-menu) -- since window.__spzPersonalCard('in-menu')
         returns null when nobody is linked, this falls back to the
         developer card exactly as before for an ordinary visitor. */
      var hero = (window.__spzPersonalCard && window.__spzPersonalCard('in-menu')) || bioCard('in-menu');
      var heroLinks = hero.querySelectorAll('.dev-btn');
      for(var hl = 0; hl < heroLinks.length; hl++){
        heroLinks[hl].addEventListener('click', function(){ menu.classList.remove('open'); });
      }
      pop.appendChild(hero);
      pop.appendChild(item('home', '00', L() === 'th' ? 'หน้าแรก' : 'Home',
        L() === 'th' ? 'สารบัญรวมทุกหน้า' : 'Index of every screen'));
      pop.appendChild(memberItem());
      /* three groups, each in its own order, so a long menu stays readable */
      var GROUPS = [
        { k:'learn',  t:{en:'Learn',th:'เรียนรู้'},
          /* Round S6b: reordered into a beginner-first learning path -- was
             guided/start/types/glossary/signals/basics (Start Investing
             buried last, after the glossary and chart-signal pages it
             actually needs to precede). "basics" explains what a share
             even is and how to open a brokerage account -- the true
             starting point -- so it now runs right after the orientation
             tour, before the risk-quiz/archetypes/glossary/signals that
             build on it. */
          ids:['guided', 'basics', 'start', 'types', 'glossary', 'signals'] },
        { k:'market', t:{en:'Read the market',th:'อ่านตลาด'},
          /* Round S9: full site-wide reorder, easiest/shortest -> hardest/
             longest. Was now/outlook/regime/anomaly/correl/rulelab/daily/
             flow/globe/infl/desk/scenarios -- the technical gauge/backtest
             cluster (regime/anomaly/correl/rulelab/daily) used to run
             right after the one-screen overview, ahead of the plainer
             narrative pages. Now: the one-screen overview, then cycle ->
             sector rotation -> country flows -> inflation/rates -> the
             ranked shortlist -> stress-testing it (a narrative arc anyone
             can follow), and only then the gauge-driven / quantitative
             cluster (turning-point radar, anomaly scan, correlation
             matrix, rule lab, daily auto-summary), which assumes the
             earlier pages already make sense. */
          ids:['now', 'outlook', 'flow', 'globe', 'infl', 'desk', 'scenarios', 'regime', 'anomaly', 'correl', 'rulelab', 'daily'] },
        { k:'tools',  t:{en:'Workbench',th:'เครื่องมือ'},
          /* 'printreport' and 'pro' deliberately left out -- see NAV_HIDDEN
             above; 'pro' (Institutional Pro Desk) is reachable only via a
             card inside Cockpit / Command Center now, see part-47.js.
             Round S9: reordered easiest/shortest -> hardest/longest --
             browse examples and look at a raw chart first, then a single
             deep-dive, then your own journal and watchlist (need an
             account, more setup), and the quantitative/power-user tools
             (Bubble Radar's blended score, Proof Lab's historical
             backtest) last. */
          ids:['directory', 'chartlab', 'stock', 'journal', 'journalNew', 'watchlist', 'bubble', 'proof'] }
      ];
      var used = { membership:1 }, n = 0, g, i, r;
      for(g = 0; g < GROUPS.length; g++){
        var rows = [];
        for(i = 0; i < GROUPS[g].ids.length; i++){
          for(var j = 0; j < ROUTES.length; j++){
            if(ROUTES[j].id === GROUPS[g].ids[i] && document.getElementById(ROUTES[j].id)){
              rows.push(ROUTES[j]); used[ROUTES[j].id] = 1;
            }
          }
        }
        if(!rows.length) continue;
        pop.appendChild(el('div', 'np-sep', esc(tx(GROUPS[g].t))));
        for(i = 0; i < rows.length; i++){
          n++;
          pop.appendChild(item(rows[i].id, (n < 10 ? '0' : '') + n,
            tx(rows[i].t).split('—')[0].trim(), tx(rows[i].d)));
        }
      }
      /* anything not listed above still shows up, never silently dropped --
         except NAV_HIDDEN routes (Connected Users), which stay reachable
         only through the admin login gate's own panel, never this menu. */
      var rest = [];
      for(i = 0; i < ROUTES.length; i++){
        r = ROUTES[i];
        if(!used[r.id] && !NAV_HIDDEN[r.id] && document.getElementById(r.id)) rest.push(r);
      }
      if(rest.length){
        pop.appendChild(el('div', 'np-sep', L() === 'th' ? 'อื่นๆ' : 'More'));
        for(i = 0; i < rest.length; i++){
          n++;
          pop.appendChild(item(rest[i].id, (n < 10 ? '0' : '') + n,
            tx(rest[i].t).split('—')[0].trim(), tx(rest[i].d)));
        }
      }
      syncNav();
    }
    function syncNav(){
      var cur = menu.querySelector('[data-n="cur"]');
      var name = L() === 'th' ? 'หน้าแรก' : 'Home';
      for(var i = 0; i < ROUTES.length; i++){
        if(ROUTES[i].id === current) name = tx(ROUTES[i].t).split('—')[0].trim();
      }
      if(cur) cur.textContent = current === 'home' ? '' : '/ ' + name;
      var items = pop.querySelectorAll('[data-route-to]');
      for(var k = 0; k < items.length; k++){
        items[k].classList.toggle('on', items[k].getAttribute('data-route-to') === current);
      }
    }
    window.__spzSyncNav = syncNav;
    repaints.push(paint);
    // rebuild the drawer the instant LINE links/unlinks (from ANY entry
    // point), so the hero slot swaps between the developer card and this
    // visitor's own personal card right away, without needing a language
    // toggle or route change to trigger the next repaint.
    document.addEventListener('spz:line', paint);
    paint();
  }

  function buildToolsBtn(){
    var nav = document.querySelector('.nav');
    if(!nav) return;
    var b = el('button', 'tools-btn');
    b.type = 'button';
    b.addEventListener('click', function(){ openModal(); });
    var sw = nav.querySelector('.theme-switch');
    if(sw) nav.insertBefore(b, sw); else nav.appendChild(b);
    repaints.push(function(){ b.textContent = UI.tools[L()] + ' ⚙'; });
    b.textContent = UI.tools[L()] + ' ⚙';
  }

  /* ================= STOCK PICK SHORTLIST ================= */
  function pickCard(p){
    return '<div class="pick-card">' +
      '<div class="pk-top"><span class="pk-tk">' + esc(p.tk) + '</span>' +
      '<span class="pk-nm">' + esc(tx(p.n)) + '</span>' +
      '<span class="pk-sec">' + esc(p.s) + '</span></div>' +
      '<div class="pk-l">' + esc(tx(p.p)) + '</div>' +
      '<div class="pk-l w">' + esc(tx(p.w)) + '</div>' +
      '<button type="button" class="pk-go" data-chart="' + esc(p.tk) + '">' + esc(tx(PICK_UI.chart)) + ' →</button>' +
      '</div>';
  }

  function renderPicks(arch, mkt){
    var sets = [];
    sets.push({ t:tx(PICKS.etf.t), us:PICKS.etf.us, th:PICKS.etf.th });
    sets.push({ t:tx(PICK_UI.h) + ' — ' + tx(GUIDE.arch[arch].n), us:PICKS[arch].us, th:PICKS[arch].th });

    var html = '<div class="v8-sub">' + esc(tx(PICK_UI.h)) + '</div>' +
               '<p class="lede" style="margin-bottom:20px">' + esc(tx(PICK_UI.lede)) + '</p>';

    for(var i = 0; i < sets.length; i++){
      var s = sets[i];
      html += '<div class="rc-h" style="margin:22px 0 12px">' + esc(s.t) + '</div>';
      if(mkt !== 'th'){
        html += '<div class="cl-lab" style="margin-bottom:9px">' + esc(tx(PICK_UI.us)) + '</div><div class="pick-grid">';
        for(var a = 0; a < s.us.length; a++){ html += pickCard(s.us[a]); }
        html += '</div>';
      }
      if(mkt !== 'us'){
        html += '<div class="cl-lab" style="margin:16px 0 9px">' + esc(tx(PICK_UI.th)) + '</div><div class="pick-grid">';
        for(var b = 0; b < s.th.length; b++){ html += pickCard(s.th[b]); }
        html += '</div>';
      }
    }
    html += '<div class="v8-note"><b>⚠</b> ' + esc(tx(PICK_UI.disc)) + '</div>';
    return html;
  }

  /* ================= CYCLE WAVE + PLAYBOOK TABLE ================= */
  function waveSVG(sel){
    var W = 900, H = 190, pad = 26;
    var ids = ['early','mid','late','rec'];
    var seg = (W - pad * 2) / 4;
    /* one full cycle: trough -> rise -> peak -> fall -> trough */
    var pts = [], i;
    for(i = 0; i <= 200; i++){
      var t = i / 200;
      var x = pad + t * (W - pad * 2);
      var y = H / 2 - Math.sin((t - 0.125) * Math.PI * 2) * (H / 2 - pad - 14);
      pts.push([x, y]);
    }
    var d = 'M' + pts.map(function(p){ return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L');

    var bands = '', labels = '', ticks = '';
    for(i = 0; i < 4; i++){
      var x0 = pad + seg * i;
      var on = ids[i] === sel;
      bands += '<rect class="wv-band' + (ids[i] === ((window.SPZ_CYCLE && window.SPZ_CYCLE.phase) || OUTLOOK.here) ? ' live' : '') + '" data-ph="' + ids[i] + '" x="' + x0 + '" y="8" width="' + seg + '" height="' + (H - 34) + '" ' +
               'fill="' + (on ? 'rgba(204,255,0,.075)' : 'rgba(255,255,255,.018)') + '" rx="6"></rect>';
      ticks += '<line class="wv-tick" x1="' + x0 + '" y1="8" x2="' + x0 + '" y2="' + (H - 26) + '"></line>';
      var ph = null;
      for(var k = 0; k < OUTLOOK.phases.length; k++){ if(OUTLOOK.phases[k].id === ids[i]) ph = OUTLOOK.phases[k]; }
      labels += '<text class="wv-lbl' + (on ? ' on' : '') + '" x="' + (x0 + seg / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' +
                esc(tx(ph.n)) + '</text>';
    }

    /* marker on the phase the data currently points to */
    var hi = ids.indexOf((window.SPZ_CYCLE && window.SPZ_CYCLE.phase) || OUTLOOK.here);
    var mt = (hi + 0.55) / 4;
    var mx = pad + mt * (W - pad * 2);
    var my = H / 2 - Math.sin((mt - 0.125) * Math.PI * 2) * (H / 2 - pad - 14);

    var motion =
      '<animateMotion dur="11s" repeatCount="indefinite" rotate="auto">' +
      '<mpath href="#wvTrack" xlink:href="#wvTrack"></mpath></animateMotion>';

    return '<svg class="wave-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'xmlns:xlink="http://www.w3.org/1999/xlink">' +
      bands + ticks +
      '<path id="wvTrack" d="' + d + '" fill="none" stroke="none"></path>' +
      '<path class="wv-ghost" d="' + d + '"></path>' +
      '<path class="wv-path" d="' + d + '" pathLength="1000" style="stroke-dasharray:1000;stroke-dashoffset:0"></path>' +
      '<path class="wv-flow" d="' + d + '"></path>' +
      '<g><circle class="wv-trail" r="9" fill="var(--neon)" opacity=".4"></circle>' + motion + '</g>' +
      '<g><circle class="wv-comet" r="3.6" fill="var(--neon)"></circle>' + motion + '</g>' +
      '<g class="wv-marker">' +
      '<circle class="wv-halo" cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="6"></circle>' +
      '<circle class="wv-dot" cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="4.5"></circle>' +
      '<rect x="' + (mx - 21) + '" y="' + (my - 27) + '" width="42" height="15" rx="4" fill="var(--neon)"></rect>' +
      '<text class="wv-now" x="' + mx.toFixed(1) + '" y="' + (my - 16) + '" text-anchor="middle">' + esc(tx(UI.hereNow)) + '</text>' +
      '</g>' + labels + '</svg>';
  }

  function cycTable(sel){
    var hd = CYCTAB.h[L()] || CYCTAB.h.en;
    var h = '<div class="ptab-wrap"><table class="ptab"><thead><tr>';
    for(var i = 0; i < hd.length; i++){ h += '<th>' + esc(hd[i]) + '</th>'; }
    h += '</tr></thead><tbody>';
    for(var r = 0; r < CYCTAB.rows.length; r++){
      var row = CYCTAB.rows[r], ph = null;
      for(var k = 0; k < OUTLOOK.phases.length; k++){ if(OUTLOOK.phases[k].id === row.id) ph = OUTLOOK.phases[k]; }
      function tags(arr, cls){
        var s = '<div class="pt-tags">';
        for(var j = 0; j < arr.length; j++){ s += '<span class="pt-tag ' + cls + '">' + esc(arr[j]) + '</span>'; }
        return s + '</div>';
      }
      h += '<tr class="' + (row.id === sel ? 'on' : '') + '" data-ph="' + row.id + '">' +
           '<td class="pt-ph">' + esc(tx(ph.n)) + '</td>' +
           '<td>' + esc(tx(row.feel)) + '</td>' +
           '<td>' + tags(row.up[L()] || row.up.en, 'up') + '</td>' +
           '<td>' + tags(row.dn[L()] || row.dn.en, 'dn') + '</td>' +
           '<td>' + esc(tx(row.do)) + '</td></tr>';
    }
    return h + '</tbody></table></div>';
  }

  /* ================= CHART LAB ================= */
  function rng(seed){
    var s = seed >>> 0;
    return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function gauss(r){
    var u = Math.max(r(), 1e-9), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function genSeries(u, days){
    var r = rng(u.sd * 7919 + days);
    var dt = 1 / 252, sq = Math.sqrt(dt), i;
    /* raw shocks first, then re-centre so the realised drift matches the
       name's character instead of whatever the random path happened to do */
    var rets = [], wicks = [], vols = [], sum = 0;
    for(i = 0; i < days; i++){
      var z = gauss(r);
      rets.push(u.vo * sq * z);
      sum += rets[i];
      wicks.push(Math.abs(gauss(r)) * u.vo * sq * 0.85);
      vols.push(1 + Math.abs(gauss(r)) * 0.9 + (Math.abs(z) > 1.6 ? 1.4 : 0));
    }
    var adj = u.dr * dt - sum / days;
    var out = [], px = u.p / Math.exp(u.dr * (days / 252));
    for(i = 0; i < days; i++){
      var o = px;
      px = px * Math.exp(rets[i] + adj);
      out.push({ o:o, h:Math.max(o, px) * (1 + wicks[i]), l:Math.min(o, px) * (1 - wicks[i]), c:px, v:vols[i] });
    }
    var k = u.p / out[out.length - 1].c;
    for(i = 0; i < out.length; i++){
      out[i].o *= k; out[i].h *= k; out[i].l *= k; out[i].c *= k;
    }
    return out;
  }
  function bucket(src, maxN){
    var step = Math.max(1, Math.ceil(src.length / maxN)), out = [];
    for(var i = 0; i < src.length; i += step){
      var sl = src.slice(i, i + step), hi = -Infinity, lo = Infinity, v = 0;
      for(var j = 0; j < sl.length; j++){
        if(sl[j].h > hi) hi = sl[j].h;
        if(sl[j].l < lo) lo = sl[j].l;
        v += sl[j].v;
      }
      out.push({ o:sl[0].o, h:hi, l:lo, c:sl[sl.length - 1].c, v:v / sl.length });
    }
    return out;
  }
  function sma(arr, n){
    var out = [], sum = 0;
    for(var i = 0; i < arr.length; i++){
      sum += arr[i].c;
      if(i >= n) sum -= arr[i - n].c;
      out.push(i >= n - 1 ? sum / n : null);
    }
    return out;
  }
  function rsi14(arr){
    var out = [], g = 0, l = 0, n = 14;
    for(var i = 0; i < arr.length; i++){
      if(i === 0){ out.push(null); continue; }
      var ch = arr[i].c - arr[i - 1].c;
      var up = ch > 0 ? ch : 0, dn = ch < 0 ? -ch : 0;
      if(i <= n){ g += up / n; l += dn / n; out.push(null); }
      else { g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n; out.push(l === 0 ? 100 : 100 - 100 / (1 + g / l)); }
    }
    return out;
  }
  function cssv(n, f){
    var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return v || f;
  }

  function drawChart(cv, bars, opt){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = cv.clientWidth || 760;
    var volH = opt.vol ? 76 : 0, rsiH = opt.rsi ? 86 : 0;
    var mainH = 320, gap = 12;
    var H = mainH + (volH ? volH + gap : 0) + (rsiH ? rsiH + gap : 0);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.height = H + 'px';
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    var neon = cssv('--neon', '#ccff00'), up = cssv('--neon-2', '#00ff66'),
        dn = cssv('--red', '#ff3b4e'), dim = cssv('--grey-dim', '#6b6f66');
    var padL = 6, padR = 54, plotW = W - padL - padR;

    function axis(y0, y1, min, max, fmt){
      g.strokeStyle = 'rgba(255,255,255,.055)'; g.lineWidth = 1;
      g.font = '10px ui-monospace,monospace'; g.fillStyle = dim; g.textAlign = 'left';
      for(var i = 0; i <= 4; i++){
        var y = y0 + (y1 - y0) * i / 4, val = max - (max - min) * i / 4;
        g.beginPath(); g.moveTo(padL, y + .5); g.lineTo(padL + plotW, y + .5); g.stroke();
        g.fillText(fmt(val), padL + plotW + 7, y + 3.5);
      }
    }

    if(opt.cmp){
      /* normalised comparison */
      var a = bars, b = opt.cmp.bars, n = Math.min(a.length, b.length);
      var an = [], bn = [], mn = Infinity, mx = -Infinity, i2;
      for(i2 = 0; i2 < n; i2++){
        var pa = a[i2].c / a[0].c * 100, pb = b[i2].c / b[0].c * 100;
        an.push(pa); bn.push(pb);
        mn = Math.min(mn, pa, pb); mx = Math.max(mx, pa, pb);
      }
      var padv = (mx - mn) * 0.08 || 5; mn -= padv; mx += padv;
      axis(10, mainH, mn, mx, function(v){ return v.toFixed(0) + '%'; });
      function poly(vals, col, wid){
        g.beginPath();
        for(var i3 = 0; i3 < vals.length; i3++){
          var x = padL + plotW * i3 / (vals.length - 1);
          var y = 10 + (mainH - 10) * (1 - (vals[i3] - mn) / (mx - mn));
          i3 ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.strokeStyle = col; g.lineWidth = wid; g.lineJoin = 'round'; g.stroke();
      }
      poly(bn, dim, 1.8); poly(an, neon, 2.4);
      cv.__meta = null;
      return;
    }

    var lo = Infinity, hi = -Infinity, i;
    for(i = 0; i < bars.length; i++){ if(bars[i].l < lo) lo = bars[i].l; if(bars[i].h > hi) hi = bars[i].h; }
    var pd = (hi - lo) * 0.06 || 1; lo -= pd; hi += pd;
    axis(10, mainH, lo, hi, function(v){ return v >= 100 ? v.toFixed(0) : v.toFixed(2); });
    cv.__meta = { bars:bars, padL:padL, plotW:plotW, mainH:mainH, y0:10, lo:lo, hi:hi, cw:plotW / bars.length };
    var Y = function(p){ return 10 + (mainH - 10) * (1 - (p - lo) / (hi - lo)); };
    var cw = plotW / bars.length, bw = Math.max(1.2, Math.min(cw * 0.66, 13));

    if(opt.type === 'area' || opt.type === 'line'){
      g.beginPath();
      for(i = 0; i < bars.length; i++){
        var x = padL + cw * (i + 0.5);
        i ? g.lineTo(x, Y(bars[i].c)) : g.moveTo(x, Y(bars[i].c));
      }
      if(opt.type === 'area'){
        var grd = g.createLinearGradient(0, 10, 0, mainH);
        grd.addColorStop(0, 'rgba(204,255,0,.34)'); grd.addColorStop(1, 'rgba(204,255,0,0)');
        g.save(); g.lineTo(padL + plotW, mainH); g.lineTo(padL, mainH); g.closePath();
        g.fillStyle = grd; g.fill(); g.restore();
        g.beginPath();
        for(i = 0; i < bars.length; i++){
          var x2 = padL + cw * (i + 0.5);
          i ? g.lineTo(x2, Y(bars[i].c)) : g.moveTo(x2, Y(bars[i].c));
        }
      }
      g.strokeStyle = neon; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
    } else {
      for(i = 0; i < bars.length; i++){
        var b2 = bars[i], cx = padL + cw * (i + 0.5), col = b2.c >= b2.o ? up : dn;
        g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1;
        g.beginPath(); g.moveTo(cx, Y(b2.h)); g.lineTo(cx, Y(b2.l)); g.stroke();
        if(opt.type === 'bar'){
          g.lineWidth = Math.max(1.2, bw / 4);
          g.beginPath(); g.moveTo(cx - bw / 2, Y(b2.o)); g.lineTo(cx, Y(b2.o)); g.stroke();
          g.beginPath(); g.moveTo(cx, Y(b2.c)); g.lineTo(cx + bw / 2, Y(b2.c)); g.stroke();
        } else {
          var y0 = Y(Math.max(b2.o, b2.c)), hgt = Math.max(1, Math.abs(Y(b2.o) - Y(b2.c)));
          g.fillRect(cx - bw / 2, y0, bw, hgt);
        }
      }
    }

    var mas = [[20, 'rgba(255,255,255,.55)'], [50, cssv('--amber', '#ffb020')], [200, neon]];
    for(var m = 0; m < mas.length; m++){
      if(opt.ma.indexOf(mas[m][0]) === -1) continue;
      var line = sma(bars, mas[m][0]), started = false;
      g.beginPath();
      for(i = 0; i < line.length; i++){
        if(line[i] == null) continue;
        var mx2 = padL + cw * (i + 0.5), my2 = Y(line[i]);
        started ? g.lineTo(mx2, my2) : (g.moveTo(mx2, my2), started = true);
      }
      g.strokeStyle = mas[m][1]; g.lineWidth = 1.5; g.stroke();
    }

    var top = mainH + gap;
    if(opt.vol){
      var vmax = 0;
      for(i = 0; i < bars.length; i++){ if(bars[i].v > vmax) vmax = bars[i].v; }
      for(i = 0; i < bars.length; i++){
        var vh = (bars[i].v / vmax) * (volH - 8);
        g.fillStyle = bars[i].c >= bars[i].o ? 'rgba(0,255,102,.45)' : 'rgba(255,59,78,.45)';
        g.fillRect(padL + cw * (i + 0.5) - bw / 2, top + volH - vh, bw, vh);
      }
      g.font = '9px ui-monospace,monospace'; g.fillStyle = dim; g.textAlign = 'left';
      g.fillText('VOL', padL + 2, top + 10);
      top += volH + gap;
    }
    if(opt.rsi){
      var rs = rsi14(bars);
      g.strokeStyle = 'rgba(255,255,255,.08)';
      [30, 50, 70].forEach(function(lv){
        var y = top + (rsiH) * (1 - lv / 100);
        g.beginPath(); g.moveTo(padL, y); g.lineTo(padL + plotW, y); g.stroke();
      });
      g.beginPath();
      var st = false;
      for(i = 0; i < rs.length; i++){
        if(rs[i] == null) continue;
        var rx = padL + cw * (i + 0.5), ry = top + rsiH * (1 - rs[i] / 100);
        st ? g.lineTo(rx, ry) : (g.moveTo(rx, ry), st = true);
      }
      g.strokeStyle = cssv('--amber', '#ffb020'); g.lineWidth = 1.6; g.stroke();
      g.font = '9px ui-monospace,monospace'; g.fillStyle = dim; g.textAlign = 'left';
      g.fillText('RSI 14', padL + 2, top + 10);
    }
  }

  function buildChartLab(){
    var sec = el('section');
    sec.id = 'chartlab';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-c="eb"></span></div>' +
        '<h2 data-c="h2"></h2><p class="lede" data-c="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="cl-bar" data-c="bar"></div>' +
      '<div class="cl-panel reveal">' +
        '<div class="cl-head"><span class="cl-tk" data-c="tk"></span><span class="cl-nm" data-c="nm"></span>' +
        '<span class="cl-chg" data-c="chg"></span></div>' +
        '<canvas class="cl-canvas" data-c="cv"></canvas>' +
        '<div class="cl-legend" data-c="lg"></div>' +
      '</div>' +
      '<div class="cl-stats" data-c="stats"></div>' +
      '<div class="cl-demo" data-c="demo"></div>';

    var S = { tk:'NVDA', type:'candle', years:5, ma:[50, 200], vol:true, rsi:false, cmp:'', csv:null };

    function uni(tk){
      for(var i = 0; i < CHART_UNI.length; i++){ if(CHART_UNI[i].tk === tk) return CHART_UNI[i]; }
      return CHART_UNI[0];
    }
    function seriesFor(tk){
      if(S.csv && tk === S.tk) return bucket(S.csv, 260);
      return bucket(genSeries(uni(tk), Math.round(S.years * 252)), 260);
    }

    function seg(label, opts, cur, cb){
      var box = el('span', 'cl-seg');
      var lb = el('span', 'cl-lab', esc(label));
      var wrap = el('span', 'cl-seg');
      for(var i = 0; i < opts.length; i++){
        (function(o){
          var b = el('button', 'cl-b' + (cur(o.v) ? ' on' : ''), esc(o.l));
          b.type = 'button';
          b.addEventListener('click', function(){ cb(o.v); });
          wrap.appendChild(b);
        })(opts[i]);
      }
      box.appendChild(lb); box.appendChild(wrap);
      return box;
    }

    function paintBar(){
      var bar = sec.querySelector('[data-c="bar"]');
      bar.innerHTML = '';

      var lb = el('span', 'cl-lab', esc(tx(CL_UI.stock)));
      var sel = el('select', 'cl-sel');
      for(var i = 0; i < CHART_UNI.length; i++){
        var o = el('option', null, CHART_UNI[i].tk + ' · ' + CHART_UNI[i].n);
        o.value = CHART_UNI[i].tk;
        if(CHART_UNI[i].tk === S.tk) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener('change', function(){ S.tk = sel.value; S.csv = null; render(); });
      bar.appendChild(lb); bar.appendChild(sel);

      bar.appendChild(seg(tx(CL_UI.type), [
        {v:'candle', l:tx(CL_UI.candle)}, {v:'bar', l:tx(CL_UI.bar)},
        {v:'line', l:tx(CL_UI.line)}, {v:'area', l:tx(CL_UI.area)}
      ], function(v){ return S.type === v; }, function(v){ S.type = v; render(); }));

      bar.appendChild(seg(tx(CL_UI.range), [
        {v:1, l:'1Y'}, {v:3, l:'3Y'}, {v:5, l:'5Y'}, {v:10, l:'10Y'}
      ], function(v){ return S.years === v; }, function(v){ S.years = v; S.csv = null; render(); }));

      bar.appendChild(seg(tx(CL_UI.overlay), [
        {v:'ma20', l:'MA20'}, {v:'ma50', l:'MA50'}, {v:'ma200', l:'MA200'},
        {v:'vol', l:tx(CL_UI.vol)}, {v:'rsi', l:tx(CL_UI.rsi)}
      ], function(v){
        if(v === 'vol') return S.vol;
        if(v === 'rsi') return S.rsi;
        return S.ma.indexOf(parseInt(v.slice(2), 10)) !== -1;
      }, function(v){
        if(v === 'vol'){ S.vol = !S.vol; }
        else if(v === 'rsi'){ S.rsi = !S.rsi; }
        else {
          var n = parseInt(v.slice(2), 10), k = S.ma.indexOf(n);
          k === -1 ? S.ma.push(n) : S.ma.splice(k, 1);
        }
        render();
      }));

      var cl = el('span', 'cl-lab', esc(tx(CL_UI.compare)));
      var cs = el('select', 'cl-sel');
      var no = el('option', null, esc(tx(CL_UI.none))); no.value = '';
      cs.appendChild(no);
      for(var j = 0; j < CHART_UNI.length; j++){
        if(CHART_UNI[j].tk === S.tk) continue;
        var o2 = el('option', null, CHART_UNI[j].tk);
        o2.value = CHART_UNI[j].tk;
        if(CHART_UNI[j].tk === S.cmp) o2.selected = true;
        cs.appendChild(o2);
      }
      cs.addEventListener('change', function(){ S.cmp = cs.value; render(); });
      bar.appendChild(cl); bar.appendChild(cs);
    }

    function render(){
      paintBar();
      var u = uni(S.tk);
      var bars = seriesFor(S.tk);
      var cmp = S.cmp ? { tk:S.cmp, bars:seriesFor(S.cmp) } : null;

      sec.querySelector('[data-c="tk"]').textContent = S.tk;
      sec.querySelector('[data-c="nm"]').textContent = (S.csv ? tx(CL_UI.loaded) : '') + u.n;

      var first = bars[0].c, last = bars[bars.length - 1].c;
      var pct = (last - first) / first * 100;
      var ce = sec.querySelector('[data-c="chg"]');
      ce.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct.toFixed(1) + '%';
      ce.className = 'cl-chg ' + (pct >= 0 ? 'up' : 'dn');

      var cv = sec.querySelector('[data-c="cv"]');
      drawChart(cv, bars, { type:S.type, ma:S.ma, vol:S.vol && !cmp, rsi:S.rsi && !cmp, cmp:cmp });

      /* legend */
      var lg = sec.querySelector('[data-c="lg"]');
      lg.innerHTML = '';
      function addLg(col, txt){
        lg.appendChild(el('span', 'cl-lg', '<span class="cl-sw" style="background:' + col + '"></span>' + esc(txt)));
      }
      if(cmp){ addLg('var(--neon)', S.tk); addLg('var(--grey-dim)', S.cmp); }
      else {
        if(S.ma.indexOf(20) !== -1) addLg('rgba(255,255,255,.55)', 'MA20');
        if(S.ma.indexOf(50) !== -1) addLg('var(--amber)', 'MA50');
        if(S.ma.indexOf(200) !== -1) addLg('var(--neon)', 'MA200');
      }

      /* stats */
      var hi = -Infinity, lo = Infinity, rets = [], peak = -Infinity, mdd = 0, i;
      for(i = 0; i < bars.length; i++){
        if(bars[i].h > hi) hi = bars[i].h;
        if(bars[i].l < lo) lo = bars[i].l;
        if(i) rets.push(Math.log(bars[i].c / bars[i - 1].c));
        if(bars[i].c > peak) peak = bars[i].c;
        var dd = (bars[i].c - peak) / peak * 100;
        if(dd < mdd) mdd = dd;
      }
      var mean = rets.reduce(function(a, b){ return a + b; }, 0) / (rets.length || 1);
      var vr = rets.reduce(function(a, b){ return a + (b - mean) * (b - mean); }, 0) / (rets.length || 1);
      var perYear = bars.length / S.years;
      var vol = Math.sqrt(vr) * Math.sqrt(perYear) * 100;
      var m200 = sma(bars, 200);
      var last200 = null;
      for(i = m200.length - 1; i >= 0; i--){ if(m200[i] != null){ last200 = m200[i]; break; } }

      var st = sec.querySelector('[data-c="stats"]');
      st.innerHTML = '';
      function addSt(l, v){
        st.appendChild(el('div', 'cl-st', '<div class="cl-st-l">' + esc(l) + '</div><div class="cl-st-v">' + esc(v) + '</div>'));
      }
      addSt(tx(CL_UI.chg), (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%');
      addSt(tx(CL_UI.high), hi.toFixed(2));
      addSt(tx(CL_UI.low), lo.toFixed(2));
      addSt(tx(CL_UI.vola), vol.toFixed(1) + '%');
      addSt(tx(CL_UI.dd), mdd.toFixed(1) + '%');
      addSt(tx(CL_UI.ma200), last200 ? ((last / last200 - 1) * 100).toFixed(1) + '%' : '—');

      /* demo / csv box */
      var dm = sec.querySelector('[data-c="demo"]');
      if(!dm.querySelector('textarea')){
        dm.innerHTML = '<b>⚠ <span data-c="dh"></span></b><div data-c="dt" style="margin-top:7px"></div>' +
          '<textarea class="cl-csv" data-c="ta"></textarea>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:9px">' +
          '<button type="button" class="cl-b" data-c="load"></button>' +
          '<button type="button" class="cl-b" data-c="clr"></button>' +
          '<span class="cl-lab" data-c="msg" style="align-self:center"></span></div>';
        dm.querySelector('[data-c="load"]').addEventListener('click', function(){ loadCSV(); });
        dm.querySelector('[data-c="clr"]').addEventListener('click', function(){
          S.csv = null; dm.querySelector('[data-c="msg"]').textContent = ''; render();
        });
      }
      dm.querySelector('[data-c="dh"]').textContent = tx(CL_UI.demoH);
      dm.querySelector('[data-c="dt"]').textContent = tx(CL_UI.demo);
      dm.querySelector('[data-c="ta"]').placeholder = tx(CL_UI.paste);
      dm.querySelector('[data-c="load"]').textContent = tx(CL_UI.load);
      dm.querySelector('[data-c="clr"]').textContent = tx(CL_UI.clear);
    }

    function loadCSV(){
      var dm = sec.querySelector('[data-c="demo"]');
      var raw = dm.querySelector('[data-c="ta"]').value.trim();
      var msg = dm.querySelector('[data-c="msg"]');
      if(!raw){ msg.textContent = tx(CL_UI.bad); return; }
      var lines = raw.split(/\r?\n/).filter(function(l){ return l.trim(); });
      var head = lines[0].toLowerCase().split(/[,;\t]/).map(function(s){ return s.trim(); });
      var idx = { c:head.indexOf('close'), o:head.indexOf('open'), h:head.indexOf('high'), l:head.indexOf('low'), v:head.indexOf('volume') };
      var start = 1;
      if(idx.c === -1){ idx = { c:4, o:1, h:2, l:3, v:5 }; start = 0; }
      var out = [];
      for(var i = start; i < lines.length; i++){
        var f = lines[i].split(/[,;\t]/);
        var c = parseFloat(f[idx.c]);
        if(!isFinite(c)) continue;
        var o = idx.o > -1 ? parseFloat(f[idx.o]) : c;
        var h = idx.h > -1 ? parseFloat(f[idx.h]) : Math.max(o, c);
        var l = idx.l > -1 ? parseFloat(f[idx.l]) : Math.min(o, c);
        var v = idx.v > -1 ? parseFloat(f[idx.v]) : 1;
        out.push({ o:isFinite(o) ? o : c, h:isFinite(h) ? h : c, l:isFinite(l) ? l : c, c:c, v:isFinite(v) ? v : 1 });
      }
      if(out.length < 10){ msg.textContent = tx(CL_UI.bad); return; }
      S.csv = out;
      S.years = Math.max(0.25, out.length / 252);
      msg.textContent = out.length + ' rows';
      render();
    }

    function paintHead(){
      sec.querySelector('[data-c="eb"]').textContent = tx(CL_UI.eb);
      sec.querySelector('[data-c="h2"]').textContent = tx(CL_UI.h2);
      sec.querySelector('[data-c="lede"]').textContent = tx(CL_UI.lede);
    }

    sec.__render = function(){ paintHead(); render(); };
    repaints.push(sec.__render);
    paintHead(); setTimeout(render, 0);

    var rt;
    window.addEventListener('resize', function(){
      clearTimeout(rt);
      rt = setTimeout(function(){ if(sec.classList.contains('route-on')) render(); }, 180);
    });
    return sec;
  }

  function jumpChart(tk){
    var found = false;
    for(var i = 0; i < CHART_UNI.length; i++){ if(CHART_UNI[i].tk === tk) found = true; }
    route('chartlab');
    setTimeout(function(){
      var sel = document.querySelector('#chartlab .cl-sel');
      if(sel && found){
        sel.value = tk;
        sel.dispatchEvent(new Event('change', { bubbles:true }));
      }
    }, 120);
  }


  /* ================= BOOT ================= */
  function boot(){
    document.body.classList.add('v8');

    /* park the quiz out of sight but keep it in the DOM (older scripts read it) */
    var trash = el('div');
    trash.id = 'v8Trash';
    trash.style.display = 'none';
    document.body.appendChild(trash);
    var quiz = document.getElementById('quiz');
    if(quiz) trash.appendChild(quiz);

    /* new sections */
    var pro = document.getElementById('pro');
    var anchor = pro || document.getElementById('signals');
    var guide = buildGuide();
    var outlook = buildOutlook();
    var lab = buildChartLab();
    if(anchor && anchor.parentNode){
      anchor.parentNode.insertBefore(guide, anchor.nextSibling);
      anchor.parentNode.insertBefore(outlook, guide.nextSibling);
      anchor.parentNode.insertBefore(lab, outlook.nextSibling);
    } else {
      document.body.appendChild(guide);
      document.body.appendChild(outlook);
      document.body.appendChild(lab);
    }

    /* comparator folds into the directory route */
    var cmp = document.getElementById('comparator');
    var dir = document.getElementById('directory');
    if(cmp && dir && dir.parentNode) dir.parentNode.insertBefore(cmp, dir.nextSibling);

    /* tag routes */
    var hero = document.querySelector('section.hero');
    if(hero) hero.setAttribute('data-route', 'home');
    for(var i = 0; i < ROUTES.length; i++){
      var s = document.getElementById(ROUTES[i].id);
      if(s) s.setAttribute('data-route', ROUTES[i].id);
    }
    if(cmp) cmp.setAttribute('data-route', 'directory');

    /* hub goes right after the hero */
    var hub = buildHub();
    hub.setAttribute('data-route', 'home');
    if(hero && hero.parentNode) hero.parentNode.insertBefore(hub, hero.nextSibling);
    else document.body.appendChild(hub);

    /* route bar */
    var bar = el('div', 'route-bar');
    bar.id = 'v8Bar';
    bar.innerHTML = '<button type="button" class="route-back"></button><span class="route-crumb"></span>';
    bar.querySelector('.route-back').addEventListener('click', function(){ route('home'); });
    var top = document.querySelector('.top-fixed');
    if(top && top.parentNode) top.parentNode.insertBefore(bar, top.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);

    buildModal();
    buildNav();
    buildToolsBtn();

    /* intercept every in-page anchor */
    document.addEventListener('click', function(e){
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if(!a) return;
      var h = a.getAttribute('href').replace('#/', '#').slice(1);
      if(!h) return;
      if(h === 'home' || document.querySelector('section[data-route="' + h + '"]')){
        e.preventDefault(); route(h);
      } else {
        for(var t = 0; t < TOOLS.length; t++){
          if(TOOLS[t].id === h){ e.preventDefault(); openModal(h); return; }
        }
      }
    });

    window.addEventListener('popstate', function(e){
      var st = e.state || {};
      var id = st.spz || (location.hash || '').replace('#/', '') || 'home';
      if(typeof st.i === 'number'){
        /* a genuine traversal through one of OUR OWN pushState/replaceState
           entries -- trust its index, don't touch the stack. */
        HI = st.i;
        fromPop = true;
        try { route(id, true); } finally { fromPop = false; }
      } else {
        /* popstate fired but this entry carries no state object of ours --
           it exists because some OTHER script set location.hash directly
           (many pages do: part-10/30/39/40/44/46/47 and others jump around
           with a bare `location.hash = '#/...'` instead of going through
           this router). Browsers fire popstate for that too, even though
           nothing "went back" -- treating it as a real traversal (the old
           behavior) silently skipped this page from HIST/HI forever, which
           is what made "back" eventually skip pages or do nothing after
           visiting one of them. Fold it into the stack instead, exactly
           like a normal forward navigation, tagging the entry the browser
           already created rather than pushing a second one (viaHash). */
        route(id, true, true);
      }
      syncBtns();
    });

    window.addEventListener('hashchange', function(){
      var h = (location.hash || '').replace('#/', '');
      if(h && h !== current) route(h, false, true);
    });

    /* Alt + arrow keys, the same shortcut the browser uses */
    document.addEventListener('keydown', function(e){
      if(!e.altKey || e.metaKey || e.ctrlKey) return;
      var t = e.target && e.target.tagName;
      if(t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      if(e.key === 'ArrowLeft'){ e.preventDefault(); window.__spzNav.back(); }
      if(e.key === 'ArrowRight'){ e.preventDefault(); window.__spzNav.fwd(); }
    });

    new MutationObserver(function(){
      for(var i2 = 0; i2 < repaints.length; i2++){ try { repaints[i2](); } catch(e){} }
      route(current, true);
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    /* let later layers register their own route without touching this file */
    window.__spzAddRoute = function(r){
      for(var i = 0; i < ROUTES.length; i++){ if(ROUTES[i].id === r.id) return; }
      var at = ROUTES.length;
      if(r.after){
        for(var j = 0; j < ROUTES.length; j++){ if(ROUTES[j].id === r.after){ at = j + 1; break; } }
      }
      ROUTES.splice(at, 0, r);
      for(var k = 0; k < repaints.length; k++){ try { repaints[k](); } catch(e){} }
      route(current, true);
    };

    var start = (location.hash || '').replace('#/', '') || 'home';
    route(start, true);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();
