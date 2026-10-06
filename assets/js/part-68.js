/* ===========================================================================
   MACRO STORY (#/macro) -- "The US Debt Trap": a scroll-driven, animated
   infographic. EN + TH, space theme to match the Exam Arena.

   * The text is a summary of ONE commentator's argument, not site research.
     Every number was re-checked against reported sources (listed at the
     bottom of the page); where the commentator's figure differs from the
     reporting, the page says so in the fact-check table.
   * No network calls, no storage. Static content + IntersectionObserver.
   =========================================================================== */
(function(){
  'use strict';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var C = {
    eb:   { en:'Macro Story', th:'เรื่องเล่าเศรษฐกิจมหภาค' },
    h:    { en:'The US Debt Trap', th:'กับดักหนี้สหรัฐ' },
    lede: { en:'Why a rate hike, a bond buyback and a dollar that will not rally do not add up to good news. A visual walk-through of one commentator’s argument, checked against reported data.',
            th:'ทำไมการขึ้นดอกเบี้ย การซื้อคืนพันธบัตร และดอลลาร์ที่ไม่แข็งค่าขึ้น จึงไม่ใช่ข่าวดีอย่างที่เห็น สรุปเป็นภาพจากมุมมองของผู้วิเคราะห์ท่านหนึ่ง พร้อมตรวจกับข้อมูลที่มีการรายงาน' },
    scroll: { en:'Scroll', th:'เลื่อนลง' },
    opinion: { en:'Commentator’s view', th:'มุมมองของผู้วิเคราะห์' },
    fact: { en:'Reported', th:'ข้อมูลที่รายงาน' },

    s1k: { en:'US federal debt', th:'หนี้รัฐบาลกลางสหรัฐ' },
    s2k: { en:'Debt to GDP', th:'หนี้ต่อ GDP' },
    s3k: { en:'30-year yield', th:'ผลตอบแทนพันธบัตร 30 ปี' },
    s4k: { en:'Fed funds range', th:'ดอกเบี้ยนโยบายเฟด' },
    heroNote: { en:'Debt and 30-year yield: mid-August 2026. Fed decision: 16 September 2026.', th:'หนี้และผลตอบแทน 30 ปี: กลางเดือนสิงหาคม 2026 การตัดสินใจของเฟด: 16 กันยายน 2026' },

    c1h: { en:'Yields up, the dollar down', th:'ผลตอบแทนขึ้น แต่ดอลลาร์ลง' },
    c1p: { en:'Normally higher US yields pull money in and lift the dollar. Now the 30-year yield sits near 5.3%, its highest since 2007, while the dollar index is near 98.6 and slipping. The commentator reads two lines pulling apart as the market pricing risk in US debt itself, not just growth.',
           th:'ปกติเมื่อผลตอบแทนพันธบัตรสหรัฐสูงขึ้น เงินจะไหลเข้าและดอลลาร์แข็งค่า แต่ตอนนี้ผลตอบแทนพันธบัตร 30 ปีอยู่ราว 5.3% สูงสุดตั้งแต่ปี 2007 ขณะที่ดัชนีดอลลาร์อยู่ราว 98.6 และอ่อนลง ผู้วิเคราะห์อ่านว่าสองเส้นที่แยกทางกันคือตลาดกำลังตีราคาความเสี่ยงของหนี้สหรัฐเอง ไม่ใช่แค่การเติบโต' },
    c1yield: { en:'30Y yield 5.3%', th:'ผลตอบแทน 30 ปี 5.3%' },
    c1usd: { en:'Dollar index 98.6', th:'ดัชนีดอลลาร์ 98.6' },
    c1note: { en:'Schematic of direction only, not plotted data.', th:'แผนภาพแสดงทิศทางเท่านั้น ไม่ใช่ข้อมูลที่พล็อตจริง' },

    c2h: { en:'Same medicine, a different patient', th:'ยาตัวเดิม แต่คนไข้คนละคน' },
    c2p: { en:'In the early 1980s Paul Volcker pushed rates to about 20% and broke inflation, with federal debt near 31% of GDP. Today debt is about 124% of GDP and interest already eats roughly 21% of tax receipts, so every extra point of rates flows straight into the deficit.',
           th:'ช่วงต้นทศวรรษ 1980 พอล วอลเคอร์ ดันดอกเบี้ยขึ้นราว 20% และปราบเงินเฟ้อได้ ตอนนั้นหนี้รัฐบาลกลางอยู่ราว 31% ของ GDP แต่วันนี้หนี้อยู่ราว 124% ของ GDP และดอกเบี้ยกินไปแล้วราว 21% ของรายได้ภาษี ดอกเบี้ยที่เพิ่มขึ้นทุกจุดจึงไหลตรงเข้าไปเพิ่มขาดดุล' },
    m1: { en:'Debt as % of GDP', th:'หนี้ต่อ GDP (%)' },
    m2: { en:'Interest as % of tax receipts', th:'ดอกเบี้ยต่อรายได้ภาษี (%)' },
    m3: { en:'Deficit as % of GDP', th:'ขาดดุลต่อ GDP (%)' },
    y1980: { en:'1980', th:'ปี 1980' },
    y2026: { en:'Today', th:'ปัจจุบัน' },
    c2note: { en:'Interest cost is now around $1.2 trillion a year, more than defense. The commentator quoted 35% for 1980; reported figures put it near 31%.',
              th:'ตอนนี้ค่าดอกเบี้ยอยู่ราว 1.2 ล้านล้านดอลลาร์ต่อปี มากกว่างบกลาโหม ผู้วิเคราะห์พูดถึงตัวเลข 35% ในปี 1980 แต่ข้อมูลที่รายงานอยู่ใกล้ 31%' },

    c3h: { en:'A supply shock, not an overheating economy', th:'วิกฤตด้านอุปทาน ไม่ใช่เศรษฐกิจร้อนแรง' },
    c3p: { en:'Rate hikes work best when demand runs hot. This time the price pressure starts with energy. A hike makes people borrow less, but it cannot reopen a shipping lane, and with $40 trillion outstanding it raises the government’s own interest bill. Budget deficits of roughly $1.8 to $2 trillion keep the borrowing going.',
           th:'การขึ้นดอกเบี้ยได้ผลที่สุดเมื่อความต้องการซื้อร้อนแรง แต่รอบนี้แรงกดดันด้านราคาเริ่มจากพลังงาน การขึ้นดอกเบี้ยทำให้คนกู้น้อยลง แต่เปิดช่องทางขนส่งไม่ได้ และเมื่อหนี้คงค้าง 40 ล้านล้านดอลลาร์ ก็ยิ่งเพิ่มภาระดอกเบี้ยของรัฐบาลเอง งบขาดดุลราว 1.8 ถึง 2 ล้านล้านดอลลาร์ทำให้การกู้ต้องดำเนินต่อไป' },
    n1: { en:'Iran war', th:'สงครามอิหร่าน' },  n1s: { en:'in its seventh month', th:'เข้าเดือนที่ 7' },
    n2: { en:'Hormuz disrupted', th:'ช่องแคบฮอร์มุซติดขัด' }, n2s: { en:'tankers and pipelines hit', th:'เรือบรรทุกน้ำมันและท่อส่งถูกโจมตี' },
    n3: { en:'Oil near $109', th:'น้ำมันราว 109 ดอลลาร์' }, n3s: { en:'Brent crude', th:'น้ำมันเบรนต์' },
    n4: { en:'Inflation 3.4%', th:'เงินเฟ้อ 3.4%' }, n4s: { en:'year on year', th:'เทียบปีก่อน' },
    n5: { en:'Fed hikes 0.25%', th:'เฟดขึ้น 0.25%' }, n5s: { en:'to 3.75–4.00%, 16 Sep', th:'เป็น 3.75–4.00% วันที่ 16 ก.ย.' },

    c4h: { en:'The side effect on savers', th:'ผลข้างเคียงต่อผู้ออม' },
    c4p: { en:'Many Americans hold their savings in bond funds. Higher rates mean those funds pay more, households have more income to spend, and prices stay sticky. In 1980 far fewer people held savings this way.',
           th:'คนอเมริกันจำนวนมากเก็บออมไว้ในกองทุนพันธบัตร เมื่อดอกเบี้ยสูงขึ้น กองทุนเหล่านี้จ่ายผลตอบแทนมากขึ้น ครัวเรือนมีรายได้ไว้ใช้จ่ายมากขึ้น และราคาสินค้าก็ลดลงยาก ในปี 1980 มีคนเก็บออมแบบนี้น้อยกว่ามาก' },
    l1: { en:'Rates rise', th:'ดอกเบี้ยขึ้น' },
    l2: { en:'Bond savers earn more', th:'ผู้ออมพันธบัตรได้เพิ่ม' },
    l3: { en:'Households spend more', th:'ครัวเรือนใช้จ่ายมากขึ้น' },
    l4: { en:'Prices stay sticky', th:'ราคาลดลงยาก' },

    c5h: { en:'The buyback: a new payment schedule, not less debt', th:'ซื้อคืนพันธบัตร: เปลี่ยนตารางจ่าย ไม่ได้ลดหนี้' },
    c5p: { en:'The Treasury raised its buybacks of 10 to 30 year bonds from $2 billion to at least $4 billion per operation, running from 9 September to 4 November. The 30-year yield dipped to about 5.19%. The commentator’s point: if the cash comes from issuing short-term bills, the debt is only swapped from long to short. It changes when and how often the government pays, and short rates can be pushed down by policy far more easily than long rates.',
           th:'กระทรวงการคลังเพิ่มการซื้อคืนพันธบัตรอายุ 10 ถึง 30 ปี จาก 2 พันล้านดอลลาร์ เป็นอย่างน้อย 4 พันล้านดอลลาร์ต่อครั้ง ตั้งแต่ 9 กันยายนถึง 4 พฤศจิกายน ผลตอบแทน 30 ปีลดลงมาราว 5.19% ประเด็นของผู้วิเคราะห์คือ ถ้าเงินมาจากการออกตั๋วระยะสั้น หนี้ก็แค่ถูกสลับจากระยะยาวเป็นระยะสั้น เปลี่ยนแค่เวลาและความถี่ที่รัฐบาลต้องจ่าย และดอกเบี้ยระยะสั้นกดลงด้วยนโยบายได้ง่ายกว่าดอกเบี้ยระยะยาวมาก' },
    bBefore: { en:'Before: one long bond', th:'ก่อน: พันธบัตรยาวก้อนเดียว' },
    bAfter: { en:'After: short bills, rolled over again and again', th:'หลัง: ตั๋วระยะสั้น ต่ออายุซ้ำไปเรื่อยๆ' },
    b15: { en:'15 years of fixed interest', th:'ดอกเบี้ยคงที่ 15 ปี' },
    bRoll: { en:'every 3 months', th:'ทุก 3 เดือน' },
    c5note: { en:'The commentator mentioned $6 billion; reported figures say $2 billion raised to at least $4 billion. Some analysts also argue a buyback is not money printing, so treat that part as a debate.',
              th:'ผู้วิเคราะห์พูดถึง 6 พันล้านดอลลาร์ แต่ข้อมูลที่รายงานคือเพิ่มจาก 2 พันล้านเป็นอย่างน้อย 4 พันล้านดอลลาร์ และมีนักวิเคราะห์บางส่วนมองว่าการซื้อคืนไม่ใช่การพิมพ์เงิน ส่วนนี้จึงเป็นประเด็นที่ยังโต้เถียงกัน' },

    c6h: { en:'The biggest creditors are stepping back', th:'เจ้าหนี้รายใหญ่เริ่มถอย' },
    c6p: { en:'Japan, the largest foreign holder, needs dollars to defend the yen and to pay for imports of fuel and food. Its Treasury holdings are down from the 2021 peak. Foreign official holders as a group have also shed bonds this year.',
           th:'ญี่ปุ่น ผู้ถือพันธบัตรสหรัฐต่างชาติรายใหญ่สุด ต้องใช้ดอลลาร์ปกป้องค่าเงินเยนและจ่ายค่านำเข้าพลังงานกับอาหาร ปริมาณพันธบัตรที่ถือลดลงจากจุดสูงสุดปี 2021 และผู้ถือที่เป็นทางการจากต่างประเทศโดยรวมก็ขายพันธบัตรออกมาตลอดปีนี้' },
    jPeak: { en:'Peak, Nov 2021', th:'จุดสูงสุด พ.ย. 2021' },
    jNow: { en:'July 2026', th:'กรกฎาคม 2026' },
    j1: { en:'sold since February', th:'ขายตั้งแต่เดือนกุมภาพันธ์' },
    j2: { en:'sold in June alone', th:'ขายเฉพาะเดือนมิถุนายน' },
    j3: { en:'record yen intervention in the month to 28 May', th:'การแทรกแซงค่าเงินเยนสูงสุดเป็นประวัติการณ์ ในเดือนจนถึง 28 พ.ค.' },
    j4: { en:'shed by all foreign official holders since February', th:'ที่ผู้ถือทางการต่างประเทศทั้งหมดขายออก ตั้งแต่เดือนกุมภาพันธ์' },
    c6note: { en:'The commentator said Japan sold about $90 billion last month. The reports found show about $26 billion in June and $123 billion since February; part of any fall in value is price decline, not selling.',
              th:'ผู้วิเคราะห์บอกว่าญี่ปุ่นขายราว 9 หมื่นล้านดอลลาร์ในเดือนที่แล้ว แต่รายงานที่พบแสดงว่าเดือนมิถุนายนขายราว 2.6 หมื่นล้านดอลลาร์ และ 1.23 แสนล้านดอลลาร์ตั้งแต่เดือนกุมภาพันธ์ ส่วนหนึ่งของมูลค่าที่ลดลงมาจากราคาตกด้วย ไม่ใช่การขายทั้งหมด' },

    c7h: { en:'Two ways it could break', th:'สองทางที่ระบบอาจพัง' },
    c7p: { en:'The commentator’s scenario map. These are opinions about possible paths, not forecasts.',
           th:'แผนที่สถานการณ์ตามมุมมองของผู้วิเคราะห์ เป็นความเห็นเกี่ยวกับเส้นทางที่เป็นไปได้ ไม่ใช่คำพยากรณ์' },
    pA: { en:'Break on paper', th:'พังบนกระดาน' },
    pAd: { en:'Policy pushes short-term rates toward zero, perhaps using a crisis as the reason. Debt shrinks in real terms as inflation outruns it. This is the slow squeeze on savings.',
           th:'นโยบายกดดอกเบี้ยระยะสั้นลงใกล้ศูนย์ อาจใช้วิกฤตเป็นข้ออ้าง หนี้ลดลงในแง่มูลค่าจริงเพราะเงินเฟ้อวิ่งนำ นี่คือการบีบเงินออมแบบช้าๆ' },
    pAw: { en:'Argued to lose', th:'ที่ถูกมองว่าเสียเปรียบ' },
    pAwl: { en:'Cash savings, government bond holders, lenders', th:'เงินออมเงินสด ผู้ถือพันธบัตรรัฐบาล เจ้าหนี้' },
    pAg: { en:'Argued to gain', th:'ที่ถูกมองว่าได้เปรียบ' },
    pAgl: { en:'Borrowers; scarce assets the state cannot print, such as gold and Bitcoin', th:'ผู้กู้ สินทรัพย์หายากที่รัฐพิมพ์เพิ่มไม่ได้ เช่น ทองคำและบิตคอยน์' },
    pB: { en:'Break for real', th:'พังจริง' },
    pBd: { en:'A genuine shock such as war, an energy or grid failure, or an AI-driven upheaval. Paper claims are sold in a chain as people run for safety.',
           th:'เหตุการณ์ช็อกจริง เช่น สงคราม ระบบพลังงานหรือไฟฟ้าล่ม หรือความปั่นป่วนจาก AI สินทรัพย์ที่เป็นกระดาษถูกเทขายต่อเนื่องเป็นลูกโซ่เมื่อผู้คนหนีตาย' },
    pBw: { en:'Argued to lose', th:'ที่ถูกมองว่าเสียเปรียบ' },
    pBwl: { en:'Stocks, coins and brokerage claims; Bitcoin tends to fall hardest, he said 50% to 80%', th:'หุ้น เหรียญ และสิทธิเรียกร้องในบัญชีโบรกเกอร์ บิตคอยน์มักตกแรงที่สุด เขาว่า 50% ถึง 80%' },
    pBg: { en:'Argued to hold up', th:'ที่ถูกมองว่าทนได้' },
    pBgl: { en:'Physical necessities and some physical cash for food', th:'ของจำเป็นที่จับต้องได้ และเงินสดจริงบางส่วนไว้ซื้ออาหาร' },
    notAdvice: { en:'Educational summary only. This is not investment advice and not a forecast.', th:'เป็นข้อมูลเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุนและไม่ใช่คำพยากรณ์' },

    c8h: { en:'Fact-check: what was said vs what was reported', th:'ตรวจข้อเท็จจริง: สิ่งที่พูด เทียบกับสิ่งที่มีการรายงาน' },
    thClaim: { en:'Claim', th:'ข้ออ้าง' }, thStatus: { en:'Status', th:'สถานะ' }, thNote: { en:'Reported', th:'ที่รายงาน' },
    stOk: { en:'Confirmed', th:'ยืนยันแล้ว' }, stDiff: { en:'Differs', th:'ต่างจากที่พูด' }, stClose: { en:'Close', th:'ใกล้เคียง' }, stOp: { en:'Opinion', th:'ความเห็น' },
    srcH: { en:'Sources', th:'แหล่งข้อมูล' },
    srcP: { en:'Links open the original reports. Figures are as reported at the time; markets move.', th:'ลิงก์เปิดไปยังรายงานต้นฉบับ ตัวเลขเป็นไปตามที่รายงาน ณ เวลานั้น ตลาดเปลี่ยนแปลงได้ตลอด' }
  };

  var ROWS = [
    { st:'ok',    c:{ en:'US debt is about $40 trillion, about 125% of GDP', th:'หนี้สหรัฐราว 40 ล้านล้านดอลลาร์ ราว 125% ของ GDP' },
                  n:{ en:'$40.05 trillion, 124% of GDP (mid-August 2026)', th:'40.05 ล้านล้านดอลลาร์ 124% ของ GDP (กลางเดือนสิงหาคม 2026)' } },
    { st:'ok',    c:{ en:'The Fed raised rates by 0.25%', th:'เฟดขึ้นดอกเบี้ย 0.25%' },
                  n:{ en:'To 3.75–4.00%, unanimous, first hike since 2023', th:'เป็น 3.75–4.00% มติเอกฉันท์ ขึ้นครั้งแรกตั้งแต่ปี 2023' } },
    { st:'ok',    c:{ en:'Inflation comes from an energy shock linked to Iran and Hormuz', th:'เงินเฟ้อมาจากวิกฤตพลังงานที่เกี่ยวกับอิหร่านและฮอร์มุซ' },
                  n:{ en:'Reported: Hormuz disrupted, Brent about $109, inflation 3.4%', th:'รายงานว่า ฮอร์มุซติดขัด น้ำมันเบรนต์ราว 109 ดอลลาร์ เงินเฟ้อ 3.4%' } },
    { st:'close', c:{ en:'Debt was 35% of GDP in 1980', th:'ปี 1980 หนี้ 35% ของ GDP' },
                  n:{ en:'About 31%', th:'ราว 31%' } },
    { st:'ok',    c:{ en:'Volcker took rates to about 20%', th:'วอลเคอร์ดันดอกเบี้ยราว 20%' },
                  n:{ en:'Reported as about 20% in the early 1980s', th:'รายงานว่าราว 20% ในต้นทศวรรษ 1980' } },
    { st:'diff',  c:{ en:'The Treasury is buying back $6 billion', th:'คลังซื้อคืน 6 พันล้านดอลลาร์' },
                  n:{ en:'$2 billion raised to at least $4 billion per operation', th:'จาก 2 พันล้านเป็นอย่างน้อย 4 พันล้านดอลลาร์ต่อครั้ง' } },
    { st:'diff',  c:{ en:'Japan sold $90 billion of Treasuries last month', th:'ญี่ปุ่นขายพันธบัตร 9 หมื่นล้านดอลลาร์เมื่อเดือนที่แล้ว' },
                  n:{ en:'About $26 billion in June, $123 billion since February', th:'ราว 2.6 หมื่นล้านดอลลาร์ในเดือนมิถุนายน และ 1.23 แสนล้านตั้งแต่เดือนกุมภาพันธ์' } },
    { st:'op',    c:{ en:'The buyback is money printing in disguise', th:'การซื้อคืนคือการพิมพ์เงินแบบแอบแฝง' },
                  n:{ en:'Disputed: some analysts say a buyback is not QE', th:'ยังเป็นข้อถกเถียง: นักวิเคราะห์บางส่วนบอกว่าไม่ใช่ QE' } },
    { st:'op',    c:{ en:'A crisis can be used to push short rates to zero and squeeze savers', th:'ใช้วิกฤตเป็นข้ออ้างกดดอกเบี้ยระยะสั้นเป็นศูนย์และบีบผู้ออมได้' },
                  n:{ en:'A forecast, not a reported fact', th:'เป็นการคาดการณ์ ไม่ใช่ข้อเท็จจริงที่รายงาน' } }
  ];

  var SRC = [
    ['FOMC statement, 16 Sep 2026 (federalreserve.gov)', 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm'],
    ['Why the Fed raised rates, The National', 'https://www.thenationalnews.com/business/economy/2026/09/16/fed-rate-rise-25-basis-points-hike/'],
    ['US debt passes $40 trillion, 124% of GDP', 'https://www.kucoin.com/news/flash/us-national-debt-surpasses-40-trillion-reaching-124-of-gdp'],
    ['Treasury boosts long-term bond buybacks, Trading Economics', 'https://tradingeconomics.com/united-states/30-year-bond-yield/news/576503'],
    ['Fundstrat: long-term yields come down briefly', 'https://fundstrat.com/wp-content/uploads/2026/08/20260820-First-to-Market-Long-Term-Yields-Come-Down-Briefly-but-at-What-Cost.pdf'],
    ['Japan Treasury holdings (TIC data)', 'https://www.marketcrash.net/japan-treasury-holdings'],
    ['Foreign official holders dumped Treasuries, Wolf Street', 'https://wolfstreet.com/2026/08/17/foreign-central-banks-governments-dumped-treasuries-led-by-china-hong-kong-japan-which-raised-usd-for-yen-invention/'],
    ['Japan likely sold Treasuries to fund record yen intervention', 'https://www.treasuryandrisk.com/amp/2026/06/08/japan-likely-sold-treasuries-to-fund-record-yen-intervention/'],
    ['Warsh sounds like Volcker, but 2026 debt math breaks the playbook', 'https://www.webull.com/news/15311110211511296'],
    ['Bessent’s debt buyback is not QE', 'https://www.dlacalle.com/en/bessents-debt-buyback-is-not-qe-and-the-market-is-panicking-about-the-wrong-country/']
  ];

  var CSS = '' +
  '#macro{position:relative;}' +
  '#macro>.ewv-wrap{position:relative;z-index:1;}' +
  '.mc-sky{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;}' +
  '.mc-sky i{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 90px 120px,#bfeaff,transparent),radial-gradient(1.6px 1.6px at 160px 60px,#fff,transparent),radial-gradient(1px 1px at 230px 180px,#ffe9a8,transparent),radial-gradient(1px 1px at 40px 190px,#fff,transparent);background-size:260px 220px;opacity:.6;animation:mcTw 5s ease-in-out infinite alternate;}' +
  '.mc-sky i:nth-child(2){background-size:350px 310px;background-position:70px 90px;animation-duration:8s;opacity:.4;}' +
  '.mc-sky i:nth-child(3){background-size:190px 170px;background-position:20px 40px;animation-duration:3.6s;opacity:.3;}' +
  '.mc-wrap{max-width:1040px;margin:0;padding-bottom:60px;}' +
  '.mc-hero{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin:6px 0 10px;}' +
  '.mc-stat{position:relative;padding:20px 18px;border-radius:var(--radius);border:1px solid color-mix(in srgb,var(--neon) 30%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--neon) 9%,transparent),rgba(10,11,18,.78) 70%);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);overflow:hidden;}' +
  '.mc-stat::after{content:"";position:absolute;top:0;left:-70%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.12),transparent);transform:skewX(-20deg);animation:mcSweep 6s ease-in-out infinite;}' +
  '.mc-stat b{display:block;font-family:var(--mono);font-size:34px;line-height:1.1;color:var(--neon);text-shadow:0 0 18px color-mix(in srgb,var(--neon) 50%,transparent);}' +
  '.mc-stat span{display:block;margin-top:6px;font-family:var(--mono);font-size:11.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--grey);}' +
  '.mc-note{color:var(--grey);font-size:12.5px;line-height:1.7;}' +
  '.mc-scrollcue{display:flex;flex-direction:column;align-items:center;gap:6px;margin:26px 0 8px;color:var(--grey);font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;}' +
  '.mc-scrollcue svg{width:22px;height:30px;stroke:var(--neon);fill:none;stroke-width:1.8;stroke-linecap:round;animation:mcBounce 1.8s ease-in-out infinite;}' +
  '.mc-sec{position:relative;margin:54px 0;padding:26px 22px 24px;border-radius:calc(var(--radius) + 4px);border:1px solid var(--border-dim);background:rgba(10,11,18,.66);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);box-shadow:0 14px 50px rgba(0,0,0,.4);}' +
  '.mc-num{position:absolute;top:-18px;left:20px;display:inline-flex;align-items:center;gap:8px;padding:5px 14px 5px 6px;border-radius:999px;background:#0b0c12;border:1px solid color-mix(in srgb,var(--neon) 55%,transparent);font-family:var(--mono);font-size:11.5px;letter-spacing:1.5px;color:var(--neon);box-shadow:0 0 16px color-mix(in srgb,var(--neon) 25%,transparent);}' +
  '.mc-num em{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:color-mix(in srgb,var(--neon) 20%,transparent);font-weight:700;}' +
  '.mc-sec h3{margin:6px 0 10px;font-size:23px;line-height:1.35;color:var(--white);}' +
  '.mc-sec p{margin:0 0 16px;color:#b6bbb0;font-size:15.5px;line-height:1.85;}' +
  '.mc-tag{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:1.4px;text-transform:uppercase;padding:3px 10px;border-radius:999px;border:1px solid var(--border);color:var(--neon);margin-bottom:8px;}' +
  '.mc-tag.op{border-color:rgba(255,170,60,.55);color:#ffb347;}' +
  '.mc-rv{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s);}' +
  '.mc-rv.in{opacity:1;transform:none;}' +
  '.mc-fig{margin:6px 0 4px;}' +
  '.mc-fig svg{width:100%;height:auto;display:block;overflow:visible;}' +
  '.mc-line{fill:none;stroke-width:3.2;stroke-linecap:round;stroke-dasharray:var(--len);stroke-dashoffset:var(--len);}' +
  '.in .mc-line{animation:mcDraw 2.2s .2s cubic-bezier(.3,.6,.2,1) forwards;}' +
  '.mc-bars{display:flex;flex-direction:column;gap:20px;}' +
  '.mc-m h4{margin:0 0 8px;font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--grey);}' +
  '.mc-bar{display:flex;align-items:center;gap:12px;margin:6px 0;}' +
  '.mc-bar .yr{width:64px;flex-shrink:0;font-family:var(--mono);font-size:12px;color:var(--grey);}' +
  '.mc-bar .tr{flex:1;height:22px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden;}' +
  '.mc-bar .tr i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#4f7bff,#00e5ff);transition:width 1.4s cubic-bezier(.2,.7,.2,1) .25s;box-shadow:0 0 14px rgba(0,229,255,.4);}' +
  '.mc-bar.hot .tr i{background:linear-gradient(90deg,#ff9f43,#ff3b4e);box-shadow:0 0 14px rgba(255,59,78,.45);}' +
  '.in .mc-bar .tr i{width:var(--w);}' +
  '.mc-bar .v{width:74px;flex-shrink:0;text-align:right;font-family:var(--mono);font-size:15px;color:var(--white);}' +
  '.mc-chain{display:flex;flex-wrap:wrap;align-items:stretch;gap:0;margin:8px 0 18px;}' +
  '.mc-node{flex:1 1 150px;min-width:140px;padding:14px 12px;border-radius:14px;border:1px solid var(--border-dim);background:rgba(255,255,255,.03);text-align:center;}' +
  '.mc-node b{display:block;font-size:15px;color:var(--white);line-height:1.4;}' +
  '.mc-node span{display:block;margin-top:4px;font-size:12px;color:var(--grey);line-height:1.5;}' +
  '.mc-node.end{border-color:color-mix(in srgb,var(--neon) 55%,transparent);background:color-mix(in srgb,var(--neon) 8%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--neon) 18%,transparent);}' +
  '.mc-node.hotn{border-color:rgba(255,59,78,.5);background:rgba(255,59,78,.07);}' +
  '.mc-arrow{flex:0 0 28px;display:flex;align-items:center;justify-content:center;}' +
  '.mc-arrow svg{width:22px;height:22px;stroke:var(--neon);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:.8;}' +
  '.mc-loop{max-width:460px;margin:0 auto;}' +
  '.mc-loop .ring{fill:none;stroke:color-mix(in srgb,var(--neon) 45%,transparent);stroke-width:2;stroke-dasharray:6 8;animation:mcDash 6s linear infinite;}' +
  '.mc-loop .nd rect{fill:#0d0f17;stroke:color-mix(in srgb,var(--neon) 60%,transparent);stroke-width:1.4;}' +
  '.mc-loop .nd text{fill:var(--white);font-size:12.5px;text-anchor:middle;font-family:var(--sans);}' +
  '.mc-loop .dot{fill:var(--neon);filter:drop-shadow(0 0 6px var(--neon));}' +
  '.mc-swap{display:flex;flex-direction:column;gap:14px;margin:8px 0 18px;}' +
  '.mc-swap h5{margin:0 0 6px;font-family:var(--mono);font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--grey);font-weight:600;}' +
  '.mc-long{height:34px;border-radius:10px;background:linear-gradient(90deg,#4f7bff,#7a5cff);display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--mono);font-size:12.5px;transform-origin:left;transform:scaleX(0);transition:transform 1.2s cubic-bezier(.2,.7,.2,1) .2s;}' +
  '.in .mc-long{transform:none;}' +
  '.mc-shorts{display:grid;grid-template-columns:repeat(12,1fr);gap:5px;}' +
  '.mc-shorts i{height:34px;border-radius:7px;background:linear-gradient(180deg,#ff9f43,#ff5a3b);opacity:0;transform:scaleY(.2);transition:opacity .4s,transform .4s;transition-delay:calc(var(--k) * .09s + .4s);}' +
  '.in .mc-shorts i{opacity:1;transform:none;}' +
  '.mc-swapcap{font-size:12px;color:var(--grey);margin-top:6px;font-family:var(--mono);}' +
  '.mc-flow{display:flex;justify-content:center;margin:2px 0;}' +
  '.mc-flow svg{width:30px;height:30px;stroke:var(--neon);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
  '.mc-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:14px 0 6px;}' +
  '.mc-kpi{padding:14px 14px 12px;border-radius:12px;border:1px solid var(--border-dim);background:rgba(255,255,255,.03);}' +
  '.mc-kpi b{display:block;font-family:var(--mono);font-size:22px;color:#ff8a98;}' +
  '.mc-kpi span{display:block;font-size:12.5px;color:var(--grey);line-height:1.55;margin-top:4px;}' +
  '.mc-paths{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;}' +
  '.mc-path{padding:20px;border-radius:16px;border:1px solid var(--border-dim);background:rgba(255,255,255,.025);position:relative;overflow:hidden;}' +
  '.mc-path.a{border-color:rgba(0,229,255,.35);} .mc-path.b{border-color:rgba(255,59,78,.4);}' +
  '.mc-path h4{margin:0 0 8px;font-size:19px;color:var(--white);display:flex;align-items:center;gap:10px;}' +
  '.mc-path h4 svg{width:28px;height:28px;flex-shrink:0;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}' +
  '.mc-path.a h4 svg{stroke:#00e5ff;} .mc-path.b h4 svg{stroke:#ff3b4e;}' +
  '.mc-path p{font-size:14.5px;}' +
  '.mc-wl{display:flex;gap:10px;margin-top:10px;font-size:13.5px;line-height:1.6;color:#b6bbb0;}' +
  '.mc-wl strong{flex:0 0 108px;font-family:var(--mono);font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;}' +
  '.mc-wl.lose strong{color:#ff8a98;} .mc-wl.gain strong{color:#7fd39c;}' +
  '.mc-table{width:100%;border-collapse:separate;border-spacing:0 8px;}' +
  '.mc-table th{text-align:left;font-family:var(--mono);font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--grey);font-weight:600;padding:0 12px;}' +
  '.mc-table td{padding:12px;background:rgba(255,255,255,.03);font-size:14px;line-height:1.55;color:#b6bbb0;vertical-align:top;}' +
  '.mc-table td:first-child{border-radius:12px 0 0 12px;color:var(--white);} .mc-table td:last-child{border-radius:0 12px 12px 0;}' +
  '.mc-st{display:inline-block;white-space:nowrap;font-family:var(--mono);font-size:10.5px;letter-spacing:1px;text-transform:uppercase;padding:3px 9px;border-radius:999px;border:1px solid;}' +
  '.mc-st.ok{color:#7fd39c;border-color:rgba(127,211,156,.5);background:rgba(127,211,156,.08);}' +
  '.mc-st.diff{color:#ff8a98;border-color:rgba(255,138,152,.5);background:rgba(255,59,78,.08);}' +
  '.mc-st.close{color:#ffd24a;border-color:rgba(255,210,74,.5);background:rgba(255,210,74,.07);}' +
  '.mc-st.op{color:#ffb347;border-color:rgba(255,179,71,.5);background:rgba(255,170,60,.07);}' +
  '.mc-src{list-style:none;margin:10px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px;}' +
  '.mc-src a{display:block;padding:10px 14px;border-radius:10px;border:1px solid var(--border-dim);background:rgba(255,255,255,.025);color:var(--neon);font-size:13px;line-height:1.5;text-decoration:none;word-break:break-word;transition:border-color .2s,background .2s;}' +
  '.mc-src a:hover{border-color:var(--neon);background:color-mix(in srgb,var(--neon) 7%,transparent);}' +
  '.mc-disc{margin-top:22px;padding:14px 16px;border-radius:12px;border:1px dashed rgba(255,179,71,.5);color:#ffcf8a;font-size:13.5px;line-height:1.7;}' +
  '@keyframes mcTw{from{opacity:.25}to{opacity:.8}}' +
  '@keyframes mcSweep{0%,55%{left:-70%}100%{left:130%}}' +
  '@keyframes mcBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}' +
  '@keyframes mcDraw{to{stroke-dashoffset:0}}' +
  '@keyframes mcDash{to{stroke-dashoffset:-56}}' +
  '@media (prefers-reduced-motion:reduce){.mc-sky i,.mc-stat::after,.mc-scrollcue svg,.mc-loop .ring{animation:none !important;} .mc-rv{transition:none;opacity:1;transform:none;} .mc-line{stroke-dashoffset:0;animation:none !important;} .mc-bar .tr i{transition:none;width:var(--w);} .mc-long{transition:none;transform:none;} .mc-shorts i{transition:none;opacity:1;transform:none;}}' +
  '@media (max-width:640px){.mc-hero{grid-template-columns:1fr 1fr;} .mc-stat{padding:16px 14px;} .mc-stat b{font-size:22px !important;} .mc-num span{display:none;} .mc-num{padding:5px;} .mc-wl strong{flex:0 0 auto;} .mc-table{border-spacing:0;} .mc-table td{box-sizing:border-box;} .mc-sec{padding:24px 16px 20px;margin:46px 0;} .mc-sec h3{font-size:20px;} .mc-arrow{flex:0 0 100%;height:22px;} .mc-arrow svg{transform:rotate(90deg);} .mc-node{flex:1 1 100%;} .mc-wl{flex-direction:column;gap:2px;} .mc-bar .v{width:60px;font-size:13px;} .mc-bar .yr{width:48px;} .mc-table thead{display:none;} .mc-table,.mc-table tbody,.mc-table tr,.mc-table td{display:block;width:100%;} .mc-table tr{margin-bottom:10px;} .mc-table td:first-child{border-radius:12px 12px 0 0;} .mc-table td:last-child{border-radius:0 0 12px 12px;} .mc-stat b{font-size:28px;}}';

  var sec = null, bodyEl = null, io = null, rvN = 0;

  function ico(k){
    var d = {
      arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
      down:'<path d="M12 4v14M6 12l6 6 6-6"/>',
      doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4M10 13h5M10 17h5"/>',
      bolt:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d[k] + '</svg>';
  }
  function rv(extra){ rvN++; return 'mc-rv" style="--d:' + ((rvN % 4) * 0.08).toFixed(2) + 's'; }
  function head(n, key){
    return '<div class="mc-num"><em>' + n + '</em><span>' + esc(T(C[key])) + '</span></div>';
  }
  function metric(label, a, b, max){
    var wa = Math.round(a / max * 100), wb = Math.round(b / max * 100);
    return '<div class="mc-m"><h4>' + esc(T(C[label])) + '</h4>' +
      '<div class="mc-bar"><span class="yr">' + esc(T(C.y1980)) + '</span><div class="tr"><i style="--w:' + wa + '%"></i></div><span class="v" data-mc-count="' + a + '" data-dec="' + (a % 1 ? 1 : 0) + '">0</span></div>' +
      '<div class="mc-bar hot"><span class="yr">' + esc(T(C.y2026)) + '</span><div class="tr"><i style="--w:' + wb + '%"></i></div><span class="v" data-mc-count="' + b + '" data-dec="' + (b % 1 ? 1 : 0) + '">0</span></div></div>';
  }
  function loopSVG(){
    // four nodes on a circle of radius 100 centred (200,130)
    var pts = [[200, 30, 'l1'], [300, 130, 'l2'], [200, 230, 'l3'], [100, 130, 'l4']];
    var g = pts.map(function(p){
      var w = 150, h = 34;
      return '<g class="nd"><rect x="' + (p[0] - w / 2) + '" y="' + (p[1] - h / 2) + '" width="' + w + '" height="' + h + '" rx="17"/><text x="' + p[0] + '" y="' + (p[1] + 4.5) + '">' + esc(T(C[p[2]])) + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 400 260" role="img" aria-label="' + esc(T(C.c4h)) + '"><circle class="ring" cx="200" cy="130" r="100"/>' + g +
      '<circle class="dot" r="5"><animateMotion dur="7s" repeatCount="indefinite" path="M200 30A100 100 0 1 1 199.9 30"/></circle></svg>';
  }
  function divergeSVG(){
    var len = 560;
    return '<svg viewBox="0 0 540 230" role="img" aria-label="' + esc(T(C.c1h)) + '">' +
      '<defs><linearGradient id="mcgy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5cff"/><stop offset="1" stop-color="#ccff00"/></linearGradient><linearGradient id="mcgd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#00e5ff"/><stop offset="1" stop-color="#ff3b4e"/></linearGradient></defs>' +
      '<line x1="24" y1="115" x2="516" y2="115" stroke="rgba(255,255,255,.12)" stroke-dasharray="4 6"/>' +
      '<path class="mc-line" style="--len:' + len + '" stroke="url(#mcgy)" d="M30 150C150 146 270 112 500 38"/>' +
      '<path class="mc-line" style="--len:' + len + '" stroke="url(#mcgd)" d="M30 78C150 82 300 130 500 196"/>' +
      '<circle cx="500" cy="38" r="6" fill="#ccff00"/><circle cx="500" cy="196" r="6" fill="#ff3b4e"/>' +
      '<text x="496" y="22" text-anchor="end" fill="#ccff00" font-size="17" font-family="monospace">' + esc(T(C.c1yield)) + '</text>' +
      '<text x="496" y="220" text-anchor="end" fill="#ff8a98" font-size="17" font-family="monospace">' + esc(T(C.c1usd)) + '</text></svg>';
  }

  function render(){
    rvN = 0;
    var h = '<div class="mc-wrap">';

    h += '<div class="mc-hero ' + rv() + '">' +
      '<div class="mc-stat"><b data-mc-count="40.05" data-dec="2" data-pre="$" data-suf="T">$0T</b><span>' + esc(T(C.s1k)) + '</span></div>' +
      '<div class="mc-stat"><b data-mc-count="124" data-dec="0" data-suf="%">0%</b><span>' + esc(T(C.s2k)) + '</span></div>' +
      '<div class="mc-stat"><b data-mc-count="5.3" data-dec="1" data-suf="%">0%</b><span>' + esc(T(C.s3k)) + '</span></div>' +
      '<div class="mc-stat"><b>3.75–4.00%</b><span>' + esc(T(C.s4k)) + '</span></div></div>' +
      '<p class="mc-note ' + rv() + '">' + esc(T(C.heroNote)) + '</p>' +
      '<div class="mc-scrollcue ' + rv() + '"><span>' + esc(T(C.scroll)) + '</span><svg viewBox="0 0 22 30"><rect x="3" y="2" width="16" height="26" rx="8"/><path d="M11 8v5"/></svg></div>';

    h += '<div class="mc-sec ' + rv() + '">' + head('01', 'c1h') +
      '<span class="mc-tag">' + esc(T(C.fact)) + '</span><h3>' + esc(T(C.c1h)) + '</h3><p>' + esc(T(C.c1p)) + '</p>' +
      '<div class="mc-fig">' + divergeSVG() + '</div><p class="mc-note">' + esc(T(C.c1note)) + '</p></div>';

    h += '<div class="mc-sec ' + rv() + '">' + head('02', 'c2h') +
      '<span class="mc-tag">' + esc(T(C.fact)) + '</span><h3>' + esc(T(C.c2h)) + '</h3><p>' + esc(T(C.c2p)) + '</p>' +
      '<div class="mc-bars">' + metric('m1', 31, 124, 130) + metric('m2', 10, 21, 24) + metric('m3', 2.6, 6.3, 8) + '</div>' +
      '<p class="mc-note" style="margin-top:14px">' + esc(T(C.c2note)) + '</p></div>';

    var chain = [['n1', 'n1s', ''], ['n2', 'n2s', ''], ['n3', 'n3s', 'hotn'], ['n4', 'n4s', 'hotn'], ['n5', 'n5s', 'end']];
    h += '<div class="mc-sec ' + rv() + '">' + head('03', 'c3h') +
      '<span class="mc-tag">' + esc(T(C.fact)) + '</span><h3>' + esc(T(C.c3h)) + '</h3><div class="mc-chain">' +
      chain.map(function(n, i){
        return (i ? '<div class="mc-arrow">' + ico('arrow') + '</div>' : '') +
          '<div class="mc-node ' + n[2] + '"><b>' + esc(T(C[n[0]])) + '</b><span>' + esc(T(C[n[1]])) + '</span></div>';
      }).join('') + '</div><span class="mc-tag op">' + esc(T(C.opinion)) + '</span><p>' + esc(T(C.c3p)) + '</p></div>';

    h += '<div class="mc-sec ' + rv() + '">' + head('04', 'c4h') +
      '<span class="mc-tag op">' + esc(T(C.opinion)) + '</span><h3>' + esc(T(C.c4h)) + '</h3><p>' + esc(T(C.c4p)) + '</p>' +
      '<div class="mc-fig mc-loop">' + loopSVG() + '</div></div>';

    var shorts = ''; for(var k = 0; k < 12; k++) shorts += '<i style="--k:' + k + '"></i>';
    h += '<div class="mc-sec ' + rv() + '">' + head('05', 'c5h') +
      '<span class="mc-tag">' + esc(T(C.fact)) + '</span> <span class="mc-tag op">' + esc(T(C.opinion)) + '</span><h3>' + esc(T(C.c5h)) + '</h3><p>' + esc(T(C.c5p)) + '</p>' +
      '<div class="mc-swap"><div><h5>' + esc(T(C.bBefore)) + '</h5><div class="mc-long">' + esc(T(C.b15)) + '</div></div>' +
      '<div class="mc-flow">' + ico('down') + '</div>' +
      '<div><h5>' + esc(T(C.bAfter)) + '</h5><div class="mc-shorts">' + shorts + '</div><div class="mc-swapcap">' + esc(T(C.bRoll)) + '</div></div></div>' +
      '<p class="mc-note">' + esc(T(C.c5note)) + '</p></div>';

    h += '<div class="mc-sec ' + rv() + '">' + head('06', 'c6h') +
      '<span class="mc-tag">' + esc(T(C.fact)) + '</span><h3>' + esc(T(C.c6h)) + '</h3><p>' + esc(T(C.c6p)) + '</p>' +
      '<div class="mc-bars"><div class="mc-m"><div class="mc-bar"><span class="yr" style="width:130px">' + esc(T(C.jPeak)) + '</span><div class="tr"><i style="--w:100%"></i></div><span class="v" data-mc-count="1.33" data-dec="2" data-pre="$" data-suf="T" style="width:84px">0</span></div>' +
      '<div class="mc-bar hot"><span class="yr" style="width:130px">' + esc(T(C.jNow)) + '</span><div class="tr"><i style="--w:' + Math.round(1.10 / 1.33 * 100) + '%"></i></div><span class="v" data-mc-count="1.10" data-dec="2" data-pre="$" data-suf="T" style="width:84px">0</span></div></div></div>' +
      '<div class="mc-kpis"><div class="mc-kpi"><b data-mc-count="123" data-pre="−$" data-suf="B">0</b><span>' + esc(T(C.j1)) + '</span></div>' +
      '<div class="mc-kpi"><b data-mc-count="26" data-pre="−$" data-suf="B">0</b><span>' + esc(T(C.j2)) + '</span></div>' +
      '<div class="mc-kpi"><b data-mc-count="11.73" data-dec="2" data-pre="¥" data-suf="T">0</b><span>' + esc(T(C.j3)) + '</span></div>' +
      '<div class="mc-kpi"><b data-mc-count="233" data-pre="−$" data-suf="B">0</b><span>' + esc(T(C.j4)) + '</span></div></div>' +
      '<p class="mc-note" style="margin-top:12px">' + esc(T(C.c6note)) + '</p></div>';

    h += '<div class="mc-sec ' + rv() + '">' + head('07', 'c7h') +
      '<span class="mc-tag op">' + esc(T(C.opinion)) + '</span><h3>' + esc(T(C.c7h)) + '</h3><p>' + esc(T(C.c7p)) + '</p><div class="mc-paths">' +
      '<div class="mc-path a"><h4><svg viewBox="0 0 24 24">' + ico('doc').replace(/<\/?svg[^>]*>/g, '') + '</svg>' + esc(T(C.pA)) + '</h4><p>' + esc(T(C.pAd)) + '</p>' +
        '<div class="mc-wl lose"><strong>' + esc(T(C.pAw)) + '</strong><span>' + esc(T(C.pAwl)) + '</span></div>' +
        '<div class="mc-wl gain"><strong>' + esc(T(C.pAg)) + '</strong><span>' + esc(T(C.pAgl)) + '</span></div></div>' +
      '<div class="mc-path b"><h4><svg viewBox="0 0 24 24">' + ico('bolt').replace(/<\/?svg[^>]*>/g, '') + '</svg>' + esc(T(C.pB)) + '</h4><p>' + esc(T(C.pBd)) + '</p>' +
        '<div class="mc-wl lose"><strong>' + esc(T(C.pBw)) + '</strong><span>' + esc(T(C.pBwl)) + '</span></div>' +
        '<div class="mc-wl gain"><strong>' + esc(T(C.pBg)) + '</strong><span>' + esc(T(C.pBgl)) + '</span></div></div></div>' +
      '<div class="mc-disc">' + esc(T(C.notAdvice)) + '</div></div>';

    h += '<div class="mc-sec ' + rv() + '">' + head('08', 'c8h') +
      '<h3>' + esc(T(C.c8h)) + '</h3><table class="mc-table"><thead><tr><th>' + esc(T(C.thClaim)) + '</th><th>' + esc(T(C.thStatus)) + '</th><th>' + esc(T(C.thNote)) + '</th></tr></thead><tbody>' +
      ROWS.map(function(r){
        var lab = { ok:C.stOk, diff:C.stDiff, close:C.stClose, op:C.stOp }[r.st];
        return '<tr><td>' + esc(T(r.c)) + '</td><td><span class="mc-st ' + r.st + '">' + esc(T(lab)) + '</span></td><td>' + esc(T(r.n)) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<h3 style="margin-top:26px">' + esc(T(C.srcH)) + '</h3><p class="mc-note">' + esc(T(C.srcP)) + '</p><ul class="mc-src">' +
      SRC.map(function(s){ return '<li><a href="' + esc(s[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(s[0]) + '</a></li>'; }).join('') +
      '</ul></div>';

    return h + '</div>';
  }

  function fmt(v, dec){
    var s = v.toFixed(dec);
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return p.join('.');
  }
  function countUp(el){
    var to = parseFloat(el.getAttribute('data-mc-count')) || 0;
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
    var t0 = Date.now(), dur = 1500;
    (function step(){
      var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(to * e, dec) + suf;
      if(k < 1 && document.body.contains(el)) requestAnimationFrame(step);
    })();
  }
  function reveal(el){
    if(el.classList.contains('in')) return;
    el.classList.add('in');
    Array.prototype.forEach.call(el.querySelectorAll('[data-mc-count]'), countUp);
    if(el.hasAttribute('data-mc-count')) countUp(el);
  }
  function observe(){
    if(io){ io.disconnect(); io = null; }
    var els = bodyEl.querySelectorAll('.mc-rv');
    if(!('IntersectionObserver' in window)){ Array.prototype.forEach.call(els, reveal); return; }
    io = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ reveal(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(els, function(el){ io.observe(el); });
  }

  function repaint(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-mc-h="' + k + '"]'); };
    q('eb').textContent = T(C.eb); q('h').textContent = T(C.h); q('lede').textContent = T(C.lede);
    bodyEl.innerHTML = render();
    observe();
  }

  function build(){
    if(document.getElementById('macro')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    var st = document.createElement('style');
    st.id = 'macroCss'; st.textContent = CSS;
    document.head.appendChild(st);

    sec = document.createElement('section');
    sec.id = 'macro';
    sec.setAttribute('data-route', 'macro');
    sec.innerHTML =
      '<div class="mc-sky"><i></i><i></i><i></i></div>' +
      '<div class="ewv-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-mc-h="eb"></span></div>' +
          '<h2 data-mc-h="h"></h2>' +
          '<p class="lede" data-mc-h="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-mc-h="body"></div>' +
      '</div>';
    document.body.appendChild(sec);
    bodyEl = sec.querySelector('[data-mc-h="body"]');

    window.__spzAddRoute({
      id: 'macro', after: 'infl',
      t: { en: 'US Debt Story', th: 'กับดักหนี้สหรัฐ' },
      d: { en: 'An animated infographic: why the rate hike, the bond buyback and a weak dollar are not good news, with every number fact-checked.',
           th: 'อินโฟกราฟิกเคลื่อนไหว: ทำไมการขึ้นดอกเบี้ย การซื้อคืนพันธบัตร และดอลลาร์อ่อน จึงไม่ใช่ข่าวดี พร้อมตรวจสอบตัวเลขทุกตัว' }
    });
    sec.__render = repaint;
    repaint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) repaint(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
