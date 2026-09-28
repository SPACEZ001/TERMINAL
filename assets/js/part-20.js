
/* ============================================================================
   SPACEZ TERMINAL v16 — GLOBAL MONEY MAP
   ========================================================================= */
(function(){
  'use strict';

/* ============================================================================
   GLOBAL MONEY MAP — figures as published, each carrying its own date.
   ========================================================================= */
var GLOBE = {
  eb:{en:'Global Money Map',th:'แผนที่เงินทุนโลก'},
  h2:{en:'Whose Money, Going Where',th:'เงินของใคร ไหลไปไหน'},
  asOf:{en:'Sept 2026 snapshot',th:'ภาพนิ่ง ก.ย. 2026'},

  s1:{en:'Money printed',th:'เงินที่ถูกพิมพ์'},
  s2:{en:'Flow map',th:'แผนที่การไหล'},
  s3:{en:'By region',th:'แยกตามภูมิภาค'},
  s4:{en:'Who benefits most right now',th:'ใครได้ประโยชน์สุดตอนนี้'},
  s5:{en:'If this happens next →',th:'ถ้าต่อไปเกิดเรื่องนี้ →'},

  /* ---------- liquidity dashboard ---------- */
  m2:[
    {c:'US', f:'🇺🇸', l:{en:'Federal Reserve',th:'เฟด สหรัฐฯ'},
     v:'$23.2T', g:'+5.4%', gv:5.4, n:1.00, cpi:'3.4%', rate:'3.75%',
     d:{en:'Record high, Aug 26',th:'สูงสุดเป็นประวัติการณ์ ส.ค. 26'}},
    {c:'CN', f:'🇨🇳', l:{en:"People's Bank of China",th:'ธนาคารกลางจีน'},
     v:'¥347T', g:'+9.0%', gv:9.0, n:2.10, cpi:'0.5%', rate:'3.00%',
     d:{en:'Record high, Jan 26',th:'สูงสุดเป็นประวัติการณ์ ม.ค. 26'}},
    {c:'EU', f:'🇪🇺', l:{en:'European Central Bank',th:'ธนาคารกลางยุโรป'},
     v:'€16.2T', g:'+3.0%', gv:3.0, n:0.78, cpi:'3.3%', rate:'2.40%',
     d:{en:'Record high, Feb 26',th:'สูงสุดเป็นประวัติการณ์ ก.พ. 26'}},
    {c:'JP', f:'🇯🇵', l:{en:'Bank of Japan',th:'ธนาคารกลางญี่ปุ่น'},
     v:'¥1,270T', g:'+1.3%', gv:1.3, n:0.38, cpi:'1.9%', rate:'1.00%',
     d:{en:'Carry-trade source',th:'ต้นทางของ carry trade'}}
  ],
  m2Note:{en:'M2 = cash + deposits + retail money funds. All four central banks are at or near record levels at the same time. Growth rate matters more than the level.',
          th:'M2 = เงินสด + เงินฝาก + กองทุนตลาดเงินรายย่อย ธนาคารกลางทั้งสี่แห่งอยู่ที่ระดับสูงสุดหรือใกล้สูงสุดพร้อมกัน อัตราการโตสำคัญกว่าระดับ'},

  /* ---------- world flow map ---------- */
  src:[
    {id:'us',  f:'🇺🇸', l:{en:'US equity mutual funds',th:'กองทุนรวมหุ้นสหรัฐฯ'}, v:'−$25.9B/wk', w:10},
    {id:'kr',  f:'🇰🇷', l:{en:'Korea equities',th:'หุ้นเกาหลี'},        v:'−$6.2B/mo', w:6},
    {id:'jp',  f:'🇯🇵', l:{en:'Japan carry trade',th:'carry trade ญี่ปุ่น'}, v:'1.00% rate', w:5},
    {id:'tec', f:'💻', l:{en:'Tech sector ETFs',th:'ETF กลุ่มเทคโนโลยี'}, v:'−$6.1B/mo', w:5},
    {id:'cash',f:'💵', l:{en:'Money market cash',th:'เงินสดตลาดเงิน'},  v:'$7.98T', w:8}
  ],
  dst:[
    {id:'bnd',f:'🏦', l:{en:'Bond ETFs',th:'ETF ตราสารหนี้'},            v:'+$407B YTD', w:10, k:'hot'},
    {id:'tw', f:'🇹🇼', l:{en:'Taiwan equities',th:'หุ้นไต้หวัน'},        v:'+$1.7B/mo', w:6, k:'hot'},
    {id:'th', f:'🇹🇭', l:{en:'Thailand equities',th:'หุ้นไทย'},          v:'+$1.5B/mo', w:5, k:'hot'},
    {id:'us2',f:'🇺🇸', l:{en:'US mega-cap tech',th:'หุ้นเทคยักษ์สหรัฐฯ'}, v:'AI capex', w:8, k:'warm'},
    {id:'gld',f:'🥇', l:{en:'Gold + commodities',th:'ทองคำ + โภคภัณฑ์'},  v:'+$10.8B/mo', w:4, k:'warm'},
    {id:'stb',f:'🏦', l:{en:'Short govt bonds',th:'พันธบัตรรัฐบาลสั้น'},  v:'+$81.7B YTD', w:7, k:'warm'}
  ],
  links:[
    ['us','bnd',7],['us','tw',4],['us','stb',6],['us','gld',3],
    ['kr','tw',5],['kr','th',4],
    ['jp','tw',4],['jp','th',3],
    ['tec','bnd',4],['tec','gld',3],
    ['cash','us2',5],['cash','stb',5]
  ],
  drain:{en:'OUT',th:'ออก'},
  fill:{en:'IN',th:'เข้า'},

  /* ---------- regional cards ---------- */
  reg:[
    {f:'🇹🇼', l:{en:'Taiwan',th:'ไต้หวัน'}, v:'+$1.7B', k:'in',
     n:{en:'August, after $22.9B left in July — foreign money rotating in from Korea',
        th:'เดือน ส.ค. หลังเงินไหลออก 22.9 พันล้านในเดือน ก.ค. — เงินต่างชาติหมุนเข้ามาจากเกาหลี'},
     tk:['TSM']},
    {f:'🏦', l:{en:'Bond ETFs',th:'ETF ตราสารหนี้'}, v:'+$407.4B', k:'in',
     n:{en:'YTD 2026. August alone took $55.3B — fixed income is where this year\'s money actually went',
        th:'สะสมปี 2026 เฉพาะเดือน ส.ค. เข้ามา 55.3 พันล้าน — ตราสารหนี้คือที่ที่เงินปีนี้ไหลไปจริงๆ'},
     tk:[]},
    {f:'🇹🇭', l:{en:'Thailand',th:'ไทย'}, v:'+$1.46B', k:'in',
     n:{en:'July. One of the less AI-dependent markets foreign money rotated into as it left Korea',
        th:'เดือน ก.ค. หนึ่งในตลาดที่พึ่ง AI น้อยกว่า ซึ่งเงินต่างชาติหมุนเข้าหลังออกจากเกาหลี'},
     tk:[]},
    {f:'💵', l:{en:'US money market funds',th:'กองทุนตลาดเงินสหรัฐฯ'}, v:'$7.98T', k:'in',
     n:{en:'A record, still climbing — up $44.8B in the week to 2 September alone',
        th:'สูงสุดเป็นประวัติการณ์และยังโตต่อ — เพิ่มขึ้น 44.8 พันล้านในสัปดาห์ถึง 2 ก.ย. เพียงสัปดาห์เดียว'},
     tk:[]},
    {f:'🇺🇸', l:{en:'US domestic equity funds',th:'กองทุนหุ้นในประเทศสหรัฐฯ'}, v:'−$25.9B', k:'out',
     n:{en:'One week to 26 August, mutual funds only. Domestic equity ETFs took +$7.6B the same week',
        th:'หนึ่งสัปดาห์ถึง 26 ส.ค. เฉพาะกองทุนรวม ส่วน ETF หุ้นในประเทศได้เข้า +7.6 พันล้านในสัปดาห์เดียวกัน'},
     tk:[]},
    {f:'🌏', l:{en:'Asia ex-Japan',th:'เอเชียไม่รวมญี่ปุ่น'}, v:'−$25.5B', k:'out',
     n:{en:'July — a ninth consecutive month of net foreign selling across the region',
        th:'เดือน ก.ค. — เป็นเดือนที่เก้าติดต่อกันที่ต่างชาติขายสุทธิทั้งภูมิภาค'},
     tk:[]},
    {f:'🇰🇷', l:{en:'South Korea',th:'เกาหลีใต้'}, v:'−$6.2B', k:'out',
     n:{en:'August, after −$6.3B in July. Two straight months of selling in the most chip-heavy market in Asia',
        th:'เดือน ส.ค. ต่อจาก −6.3 พันล้านในเดือน ก.ค. ขายสองเดือนติดในตลาดที่พึ่งพาชิปมากที่สุดในเอเชีย'},
     tk:[]},
    {f:'💻', l:{en:'Tech sector ETFs',th:'ETF กลุ่มเทคโนโลยี'}, v:'−$6.1B', k:'out',
     n:{en:'August, even though $60.0B is still in for the year. The first month the AI trade paid money back',
        th:'เดือน ส.ค. แม้ทั้งปียังเป็นบวก 60.0 พันล้าน เป็นเดือนแรกที่ธีม AI คืนเงินออกมา'},
     tk:[]}
  ],

  /* ---------- beneficiaries ranked ---------- */
  benH:{en:'“Benefits” means the company’s business sits directly in the path of the money flowing above — it is not a price prediction or a buy signal. The score (0–100) is how directly today’s flow reaches that business: a chipmaker selling straight into the AI capex boom scores high; a bank waiting for foreign money to return to a market it isn’t flowing into yet scores low.',
        th:'“ได้ประโยชน์” หมายถึงธุรกิจของบริษัทนั้นอยู่ตรงเส้นทางที่เงินด้านบนกำลังไหลเข้าจริงๆ ตอนนี้ — ไม่ใช่การพยากรณ์ราคาหรือสัญญาณให้ซื้อ ตัวเลขคะแนน (0–100) คือความใกล้ชิดของธุรกิจนั้นกับกระแสเงินตอนนี้ เช่น บริษัทผลิตชิปที่ขายตรงเข้าสู่การลงทุน AI จะได้คะแนนสูง ส่วนธนาคารที่ยังรอเงินต่างชาติไหลกลับเข้าตลาดที่เงินยังไม่ไหลเข้าจะได้คะแนนต่ำ'},
  ben:[
    {tk:'TSM',   s:{en:'Semis · Taiwan',th:'เซมิ · ไต้หวัน'},      v:96, w:{en:'Taiwan +$6.4B/mo · makes the AI chips',th:'ไต้หวัน +6.4 พันล้าน/เดือน · เป็นคนผลิตชิป AI'}},
    {tk:'NVDA',  s:{en:'Semis · US',th:'เซมิ · สหรัฐฯ'},          v:93, w:{en:'Hyperscaler capex ~$772B into 2026',th:'เงินลงทุนไฮเปอร์สเกลเลอร์ ~7.72 แสนล้านในปี 2026'}},
    {tk:'AVGO',  s:{en:'Custom AI silicon',th:'ชิป AI สั่งทำ'},     v:89, w:{en:'Korea + Taiwan supply chain',th:'ซัพพลายเชนเกาหลี + ไต้หวัน'}},
    {tk:'MSFT',  s:{en:'Cloud · US',th:'คลาวด์ · สหรัฐฯ'},         v:84, w:{en:'Largest single AI capex budget',th:'งบลงทุน AI ก้อนใหญ่ที่สุดรายเดียว'}},
    {tk:'DELTA', s:{en:'Power/cooling · TH',th:'ไฟฟ้า/ระบายความร้อน · ไทย'}, v:80, w:{en:"Thailand's direct link to the AI build",th:'จุดเชื่อมตรงของไทยกับการสร้าง AI'}},
    {tk:'GULF',  s:{en:'Power · TH',th:'ไฟฟ้า · ไทย'},             v:71, w:{en:'Data centres need contracted power',th:'ดาต้าเซ็นเตอร์ต้องการไฟฟ้าตามสัญญา'}},
    {tk:'AMZN',  s:{en:'Cloud · US',th:'คลาวด์ · สหรัฐฯ'},          v:68, w:{en:'AWS absorbs the same spending',th:'AWS ดูดเงินลงทุนก้อนเดียวกัน'}},
    {tk:'XOM',   s:{en:'Energy · US',th:'พลังงาน · สหรัฐฯ'},        v:54, w:{en:'Late-cycle hedge if inflation sticks',th:'ป้องกันปลายวัฏจักรถ้าเงินเฟ้อค้าง'}},
    {tk:'PTT',   s:{en:'Energy · TH',th:'พลังงาน · ไทย'},           v:48, w:{en:'Same hedge, Thai baht version',th:'ป้องกันแบบเดียวกัน เวอร์ชันเงินบาท'}},
    {tk:'JNJ',   s:{en:'Healthcare · US',th:'สุขภาพ · สหรัฐฯ'},     v:41, w:{en:'What receives money when the phase turns',th:'ตัวที่รับเงินเมื่อวัฏจักรพลิก'}},
    {tk:'KBANK', s:{en:'Bank · TH',th:'ธนาคาร · ไทย'},             v:33, w:{en:'Needs foreign flow to return to SET',th:'ต้องรอเงินต่างชาติกลับเข้า SET'}},
    {tk:'TDEX',  s:{en:'SET50 ETF · TH',th:'ETF SET50 · ไทย'},      v:28, w:{en:'Thailand is not on the current flow map',th:'ไทยยังไม่อยู่บนแผนที่กระแสเงินตอนนี้'}}
  ],

  /* ---------- forward scenarios ---------- */
  scH:{en:'Pick what you think happens next',th:'เลือกว่าคุณคิดว่าอะไรจะเกิดขึ้นต่อไป'},
  sc:[
    {id:'ai', ic:'🤖', t:{en:'AI capex keeps growing',th:'การลงทุน AI โตต่อ'},
     p:{en:'Base case',th:'กรณีฐาน'},
     to:[{l:{en:'Semis & AI chips',th:'ชิป AI และเซมิ'},w:10},{l:{en:'Power & grid',th:'ไฟฟ้าและระบบส่ง'},w:8},
         {l:{en:'Industrials',th:'อุตสาหกรรม'},w:6},{l:{en:'Korea/Taiwan',th:'เกาหลี/ไต้หวัน'},w:7}],
     from:[{l:{en:'Cash',th:'เงินสด'},w:7},{l:{en:'Defensives',th:'หุ้นตั้งรับ'},w:5}],
     tk:['NVDA','TSM','AVGO','DELTA','GULF','MSFT'],
     n:{en:'Consensus 2026 hyperscaler capex ~$772B, near $1T for 2027. Semis are already ~20% of the S&P 500 — this scenario makes the index a concentrated AI bet.',
        th:'ประมาณการเงินลงทุนไฮเปอร์สเกลเลอร์ปี 2026 ราว 7.72 แสนล้าน ใกล้ 1 ล้านล้านในปี 2027 กลุ่มเซมิเป็น ~20% ของ S&P 500 แล้ว — ฉากนี้ทำให้ดัชนีกลายเป็นการเดิมพัน AI แบบกระจุก'}},
    {id:'aidown', ic:'💥', t:{en:'AI trade re-prices',th:'ธีม AI ถูกตีราคาใหม่'},
     p:{en:'Tail risk',th:'ความเสี่ยงหางยาว'},
     to:[{l:{en:'Cash',th:'เงินสด'},w:10},{l:{en:'Staples',th:'สินค้าจำเป็น'},w:7},
         {l:{en:'Healthcare',th:'สุขภาพ'},w:6},{l:{en:'Long bonds',th:'พันธบัตรยาว'},w:8}],
     from:[{l:{en:'Semis',th:'เซมิ'},w:10},{l:{en:'Korea/Taiwan',th:'เกาหลี/ไต้หวัน'},w:8},{l:{en:'Power',th:'ไฟฟ้า'},w:6}],
     tk:['KO','PG','JNJ','DUK','BDMS','ADVANC'],
     n:{en:'Because semis carry ~20% of index weight, a de-rating drags the whole benchmark even if the rest of the market is healthy. Passive index holders are exposed without ever choosing to be.',
        th:'เพราะกลุ่มเซมิมีน้ำหนัก ~20% ของดัชนี การถูกลดมูลค่าจะลากดัชนีทั้งตัวลงแม้ตลาดส่วนที่เหลือจะปกติดี คนถือกองทุนดัชนีรับความเสี่ยงนี้โดยไม่เคยเลือกเอง'}},
    {id:'yen', ic:'🇯🇵', t:{en:'Japan raises rates / yen intervention',th:'ญี่ปุ่นขึ้นดอกเบี้ย / แทรกแซงค่าเงิน'},
     p:{en:'Watch closely',th:'ต้องจับตา'},
     to:[{l:{en:'Yen & JGBs',th:'เงินเยนและพันธบัตรญี่ปุ่น'},w:9},{l:{en:'Japan banks',th:'ธนาคารญี่ปุ่น'},w:6},
         {l:{en:'Cash',th:'เงินสด'},w:7}],
     from:[{l:{en:'EM bonds',th:'ตราสารหนี้ EM'},w:10},{l:{en:'Global risk assets',th:'สินทรัพย์เสี่ยงทั่วโลก'},w:8}],
     tk:['KO','PG','JNJ','TISCO'],
     n:{en:'The IIF has flagged this directly: EM bond inflows of $214B this year rest on carry trade demand funded at Japanese rates. If that funding cost jumps, the largest single flow on this page unwinds.',
        th:'IIF เตือนเรื่องนี้ตรงๆ: เงินเข้าตราสารหนี้ EM 2.14 แสนล้านปีนี้ตั้งอยู่บน carry trade ที่กู้ด้วยดอกเบี้ยญี่ปุ่น ถ้าต้นทุนนั้นกระโดด กระแสเงินก้อนใหญ่ที่สุดในหน้านี้จะคลายตัว'}},
    {id:'usd', ic:'💵', t:{en:'Dollar keeps weakening',th:'ดอลลาร์อ่อนต่อ'},
     p:{en:'Already running',th:'กำลังเกิดอยู่'},
     to:[{l:{en:'World / intl equity',th:'หุ้นต่างประเทศ'},w:9},{l:{en:'EM equities',th:'หุ้น EM'},w:7},
         {l:{en:'Gold',th:'ทองคำ'},w:7},{l:{en:'SET / ASEAN',th:'SET / อาเซียน'},w:5}],
     from:[{l:{en:'US domestic equity',th:'หุ้นในประเทศสหรัฐฯ'},w:9},{l:{en:'USD cash',th:'เงินสดดอลลาร์'},w:5}],
     tk:['TDEX','KBANK','AOT','CPALL','BDMS'],
     n:{en:'This is the only scenario on the page where Thai equities get a real bid. Foreign money returns to SET when the baht strengthens and EM equity outflows stop — check the SET investor-type page for the actual number.',
        th:'นี่คือฉากเดียวในหน้านี้ที่หุ้นไทยได้แรงซื้อจริง เงินต่างชาติกลับเข้า SET เมื่อบาทแข็งและเงินไหลออกจากหุ้น EM หยุด — ให้เช็คหน้า investor type ของ SET เพื่อดูตัวเลขจริง'}},
    {id:'infl', ic:'🔥', t:{en:'Inflation re-accelerates above 4%',th:'เงินเฟ้อกลับมาเร่งเกิน 4%'},
     p:{en:'Late-cycle trigger',th:'ตัวจุดชนวนปลายวัฏจักร'},
     to:[{l:{en:'Energy',th:'พลังงาน'},w:9},{l:{en:'Materials',th:'วัสดุ'},w:7},
         {l:{en:'Gold',th:'ทองคำ'},w:8},{l:{en:'Short bonds',th:'ตราสารหนี้สั้น'},w:7}],
     from:[{l:{en:'Long-duration growth',th:'หุ้นเติบโตระยะยาวไกล'},w:10},{l:{en:'Discretionary',th:'สินค้าฟุ่มเฟือย'},w:6}],
     tk:['XOM','CVX','PTT','PTTEP','SCC','TOP'],
     n:{en:'CPI at 3.5% with tariff pressure is the one late-cycle marker already showing. Above 4% forces a policy response and the rotation stops being optional.',
        th:'CPI ที่ 3.5% พร้อมแรงกดดันจากภาษีนำเข้า คือเครื่องหมายปลายวัฏจักรตัวเดียวที่โผล่มาแล้ว ถ้าเกิน 4% จะบังคับให้เกิดการตอบสนองเชิงนโยบาย และการหมุนกลุ่มจะไม่ใช่ทางเลือกอีกต่อไป'}},
    {id:'cut', ic:'✂️', t:{en:'Fed cuts faster than priced',th:'เฟดลดดอกเบี้ยเร็วกว่าที่ตลาดคิด'},
     p:{en:'Upside case',th:'กรณีบวก'},
     to:[{l:{en:'Small caps',th:'หุ้นเล็ก'},w:9},{l:{en:'REITs & property',th:'REIT และอสังหา'},w:7},
         {l:{en:'EM equities',th:'หุ้น EM'},w:8},{l:{en:'Long bonds',th:'พันธบัตรยาว'},w:6}],
     from:[{l:{en:'Money market cash',th:'เงินสดตลาดเงิน'},w:10},{l:{en:'Short bonds',th:'ตราสารหนี้สั้น'},w:6}],
     tk:['O','LH','TDEX','KBANK','AMZN','MINT'],
     n:{en:'The $7.93T cash pile is the fuel. When short rates fall, the yield on sitting in cash disappears and that money has to go somewhere — historically small caps and rate-sensitive assets move first.',
        th:'กองเงินสด 7.93 ล้านล้านคือเชื้อเพลิง เมื่อดอกเบี้ยระยะสั้นลดลง ผลตอบแทนจากการนั่งถือเงินสดหายไป เงินก้อนนั้นต้องไปที่ไหนสักแห่ง — ในอดีตหุ้นเล็กและสินทรัพย์ที่ไวต่อดอกเบี้ยขยับก่อน'}}
  ],
  scTo:{en:'Money goes to',th:'เงินไปที่'},
  scFrom:{en:'Money leaves',th:'เงินออกจาก'},
  scTk:{en:'Names in the receiving side',th:'หุ้นฝั่งที่รับเงิน'},

  note:{en:'Every figure is dated and sourced from ICI, IIF, iShares, LSEG Lipper, State Street, the Federal Reserve, PBoC, ECB and BoJ releases between February and August 2026. Flow data lags, gets revised, and covers only tracked funds. Educational content, not investment advice.',
        th:'ตัวเลขทุกตัวลงวันที่และอ้างอิงจาก ICI, IIF, iShares, LSEG Lipper, State Street, เฟด, ธนาคารกลางจีน, ECB และ BoJ ระหว่างเดือน ก.พ. ถึง ส.ค. 2026 ข้อมูลกระแสเงินตามหลังจริง ถูกแก้ไขย้อนหลังได้ และครอบคลุมเฉพาะกองทุนที่ถูกติดตาม เป็นเนื้อหาเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'}
};


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var sel = null, scIdx = 0;

  /* ---------------- world flow svg ---------------- */
  function mapSVG(){
    var W = 920, H = 430, colW = 176, padY = 34;
    var lx = 6, rx = W - colW - 6, pos = {}, i;

    function lay(list, x){
      var tot = 0;
      for(i = 0; i < list.length; i++) tot += list[i].w;
      var gap = 12, avail = H - padY - 16 - gap * (list.length - 1), y = padY;
      for(i = 0; i < list.length; i++){
        var h = Math.max(38, avail * list[i].w / tot);
        pos[list[i].id] = { x:x, y:y, h:h, cy:y + h / 2 };
        y += h + gap;
      }
    }
    lay(GLOBE.src, lx);
    lay(GLOBE.dst, rx);

    var COL = ['#ccff00','#4dd8ff','#ff9f45','#b98cff','#00ff88','#ff5f7a'];
    var s = '';
    s += '<text class="gm-side" x="' + lx + '" y="14" fill="var(--red)">' + esc(T(GLOBE.drain)) + '</text>';
    s += '<text class="gm-side" x="' + (rx + colW) + '" y="14" text-anchor="end" fill="var(--neon-2)">' +
         esc(T(GLOBE.fill)) + '</text>';

    for(i = 0; i < GLOBE.links.length; i++){
      var a = pos[GLOBE.links[i][0]], b = pos[GLOBE.links[i][1]], wgt = GLOBE.links[i][2];
      if(!a || !b) continue;
      var x1 = a.x + colW, y1 = a.cy, x2 = b.x, y2 = b.cy, mid = (x1 + x2) / 2;
      var d = 'M' + x1 + ',' + y1 + ' C' + mid + ',' + y1 + ' ' + mid + ',' + y2 + ' ' + x2 + ',' + y2;
      var col = COL[i % COL.length];
      var on = !sel || sel === GLOBE.links[i][0] || sel === GLOBE.links[i][1];
      s += '<path id="gmp' + i + '" d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' +
           (wgt * 1.5).toFixed(1) + '" opacity="' + (on ? '.26' : '.05') + '" stroke-linecap="round"/>';
      if(!RM && on){
        for(var k = 0; k < 2; k++){
          var dur = (3.6 + i * 0.18).toFixed(2), del = (k * 1.8 + i * 0.21).toFixed(2);
          s += '<circle r="3" fill="' + col + '">' +
               '<animateMotion dur="' + dur + 's" begin="' + del + 's" repeatCount="indefinite">' +
               '<mpath href="#gmp' + i + '" xlink:href="#gmp' + i + '"/></animateMotion>' +
               '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.88;1" dur="' +
               dur + 's" begin="' + del + 's" repeatCount="indefinite"/></circle>';
        }
      }
    }

    function nodes(list, kind){
      var out = '';
      for(var j = 0; j < list.length; j++){
        var n = list[j], p = pos[n.id];
        var act = !sel || sel === n.id;
        var fill = kind === 'src' ? 'rgba(255,59,78,.1)'
                 : (n.k === 'hot' ? 'rgba(0,255,102,.14)' : 'rgba(255,176,32,.11)');
        var line = kind === 'src' ? 'rgba(255,59,78,.42)'
                 : (n.k === 'hot' ? 'rgba(0,255,102,.5)' : 'rgba(255,176,32,.42)');
        out += '<g class="gm-node" data-n="' + n.id + '" opacity="' + (act ? 1 : .3) + '">' +
          '<rect x="' + p.x + '" y="' + p.y + '" width="' + colW + '" height="' + p.h +
          '" rx="9" fill="' + fill + '" stroke="' + line + '" stroke-width="1"/>' +
          '<text class="gm-flag" x="' + (p.x + 12) + '" y="' + (p.cy + 2) + '">' + n.f + '</text>' +
          '<text class="gm-l" x="' + (p.x + 40) + '" y="' + (p.cy - 3) + '">' + esc(T(n.l)) + '</text>' +
          '<text class="gm-v" x="' + (p.x + 40) + '" y="' + (p.cy + 11) + '">' + esc(n.v) + '</text>' +
          '</g>';
      }
      return out;
    }
    s += nodes(GLOBE.src, 'src') + nodes(GLOBE.dst, 'dst');

    return '<svg class="gm-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" ' +
           'xmlns:xlink="http://www.w3.org/1999/xlink">' + s + '</svg>';
  }

  function jumpTicker(tk){
    var nav = document.querySelector('.np-item[data-route-to="chartlab"], .nav-links a[data-route-to="chartlab"]');
    if(nav) nav.click();
    setTimeout(function(){
      var s = document.querySelector('#chartlab .cl-sel');
      if(!s) return;
      for(var i = 0; i < s.options.length; i++){
        if(s.options[i].value === tk){ s.value = tk; s.dispatchEvent(new Event('change', { bubbles:true })); return; }
      }
    }, 170);
  }

  /* ---------------- page ---------------- */
  function build(){
    var sec = el('section');
    sec.id = 'globe';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-g="eb"></span></div>' +
        '<h2 data-g="h2"></h2><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-g="s1"></div><div class="lq-grid" data-g="lq"></div>' +
      '<div class="cl-hint" style="margin-top:12px" data-g="m2n"></div>' +
      '<div class="v8-sub" data-g="s2"></div><div class="gm-box reveal" data-g="map"></div>' +
      '<div class="v8-sub" data-g="s3"></div><div class="rg-grid" data-g="reg"></div>' +
      '<div class="v8-sub" data-g="s4"></div><div class="cl-hint" style="margin-bottom:13px" data-g="benh"></div>' +
      '<div class="v8-panel reveal"><div class="bn" data-g="ben"></div></div>' +
      '<div class="v8-sub" data-g="s5"></div><div class="gs-picks" data-g="picks"></div>' +
      '<div class="gs-out" data-g="scout"></div>' +
      '<div class="v8-note" data-g="note"></div>';

    function q(k){ return sec.querySelector('[data-g="' + k + '"]'); }

    function paintLq(){
      var g = q('lq');
      g.innerHTML = '';
      var max = 0, i;
      for(i = 0; i < GLOBE.m2.length; i++) max = Math.max(max, GLOBE.m2[i].gv);
      for(i = 0; i < GLOBE.m2.length; i++){
        var m = GLOBE.m2[i];
        g.appendChild(el('div', 'lq',
          '<div class="lq-f">' + m.f + '</div>' +
          '<div class="lq-v">' + esc(m.v) + '</div>' +
          '<div class="lq-g">▲ ' + esc(m.g) + ' y/y</div>' +
          '<div class="lq-bar"><span class="lq-bf" data-w="' + (m.gv / max * 100).toFixed(0) + '"></span></div>' +
          '<div class="lq-l">' + esc(T(m.l)) + '<br>' + esc(T(m.d)) + '</div>' +
          '<div class="lq-mini"><span class="lq-mi">CPI<b>' + esc(m.cpi) + '</b></span>' +
          '<span class="lq-mi">RATE<b>' + esc(m.rate) + '</b></span></div>'));
      }
      requestAnimationFrame(function(){
        var f = g.querySelectorAll('.lq-bf'), c = g.querySelectorAll('.lq');
        for(var j = 0; j < f.length; j++){
          (function(n, card, d){
            setTimeout(function(){ n.style.width = n.getAttribute('data-w') + '%'; card.classList.add('go'); }, d);
          })(f[j], c[j], j * 110);
        }
      });
    }

    function paintMap(){
      q('map').innerHTML = mapSVG();
      var ns = q('map').querySelectorAll('[data-n]');
      for(var i = 0; i < ns.length; i++){
        (function(n){
          n.addEventListener('click', function(){
            var id = n.getAttribute('data-n');
            sel = (sel === id) ? null : id;
            paintMap();
          });
        })(ns[i]);
      }
    }

    function paintReg(){
      var g = q('reg');
      g.innerHTML = '';
      for(var i = 0; i < GLOBE.reg.length; i++){
        var r = GLOBE.reg[i];
        g.appendChild(el('div', 'rg ' + r.k,
          '<div class="rg-f">' + r.f + '</div>' +
          '<div class="rg-v">' + esc(r.v) + '</div>' +
          '<div class="rg-l">' + esc(T(r.l)) + '</div>' +
          '<div class="rg-n">' + esc(T(r.n)) + '</div>'));
      }
    }

    function paintBen(){
      var g = q('ben');
      g.innerHTML = '';
      for(var i = 0; i < GLOBE.ben.length; i++){
        (function(b, idx){
          var row = el('div', 'bn-r',
            '<span class="bn-t">$' + esc(b.tk) + '</span>' +
            '<span class="bn-track"><span class="bn-fill" data-w="' + b.v + '" style="transition-delay:' +
              (idx * 0.06).toFixed(2) + 's"></span>' +
              '<span class="bn-lbl">' + esc(T(b.s)) + ' <span>' + esc(T(b.w)) + '</span></span></span>' +
            '<span class="bn-v">' + b.v + '</span>');
          row.addEventListener('click', function(){ jumpTicker(b.tk); });
          g.appendChild(row);
        })(GLOBE.ben[i], i);
      }
      requestAnimationFrame(function(){
        var f = g.querySelectorAll('.bn-fill');
        for(var j = 0; j < f.length; j++){ f[j].style.width = f[j].getAttribute('data-w') + '%'; }
      });
    }

    function paintSc(){
      var p = q('picks');
      p.innerHTML = '';
      for(var i = 0; i < GLOBE.sc.length; i++){
        (function(c, idx){
          var b = el('button', 'gs-b' + (idx === scIdx ? ' on' : ''),
            '<span class="gs-ic">' + c.ic + '</span>' +
            '<span class="gs-t">' + esc(T(c.t)) + '</span>' +
            '<span class="gs-p">' + esc(T(c.p)) + '</span>');
          b.type = 'button';
          b.addEventListener('click', function(){ scIdx = idx; paintSc(); });
          p.appendChild(b);
        })(GLOBE.sc[i], i);
      }

      var c2 = GLOBE.sc[scIdx];
      function col(list, cls){
        var max = 0, i2;
        for(i2 = 0; i2 < list.length; i2++) max = Math.max(max, list[i2].w);
        var s = '<div class="gs-col ' + cls + '"><div class="gs-h">' +
                esc(cls === 'to' ? T(GLOBE.scTo) : T(GLOBE.scFrom)) + '</div>';
        for(i2 = 0; i2 < list.length; i2++){
          s += '<div class="gs-item"><span>' + esc(T(list[i2].l)) + '</span>' +
               '<span class="gs-bar"><span class="gs-bf" data-w="' +
               (list[i2].w / max * 100).toFixed(0) + '"></span></span></div>';
        }
        return s + '</div>';
      }
      var tks = '';
      for(var j = 0; j < c2.tk.length; j++){
        tks += '<button type="button" class="tk-b" data-tk="' + esc(c2.tk[j]) + '">$' + esc(c2.tk[j]) + '</button>';
      }

      q('scout').innerHTML =
        '<div class="gs-flow">' + col(c2.from, 'from') +
        '<div class="gs-mid"><span>▶</span></div>' + col(c2.to, 'to') + '</div>' +
        '<div class="gs-n">' + esc(T(c2.n)) + '</div>' +
        '<div class="gs-h" style="margin-bottom:8px">' + esc(T(GLOBE.scTk)) + '</div>' +
        '<div class="tk-row">' + tks + '</div>';

      requestAnimationFrame(function(){
        var f = q('scout').querySelectorAll('.gs-bf');
        for(var k = 0; k < f.length; k++){
          (function(n, d){ setTimeout(function(){ n.style.width = n.getAttribute('data-w') + '%'; }, d); })(f[k], k * 55);
        }
      });

      var ts = q('scout').querySelectorAll('[data-tk]');
      for(var a = 0; a < ts.length; a++){
        (function(n){ n.addEventListener('click', function(){ jumpTicker(n.getAttribute('data-tk')); }); })(ts[a]);
      }
    }

    function paint(){
      q('eb').textContent = T(GLOBE.eb) + ' · ' + T(GLOBE.asOf);
      q('h2').textContent = T(GLOBE.h2);
      q('s1').textContent = T(GLOBE.s1);
      q('s2').textContent = T(GLOBE.s2);
      q('s3').textContent = T(GLOBE.s3);
      q('s4').textContent = T(GLOBE.s4);
      q('s5').textContent = T(GLOBE.scH);
      q('m2n').textContent = T(GLOBE.m2Note);
      q('benh').textContent = T(GLOBE.benH);
      q('note').innerHTML = '<b>⚠</b> ' + esc(T(GLOBE.note));
      paintLq(); paintMap(); paintReg(); paintBen(); paintSc();
    }

    sec.__render = paint;
    paint();
    return sec;
  }

  function boot(){
    if(document.getElementById('globe')) return;
    var sec = build();
    sec.setAttribute('data-route', 'globe');
    var anchor = document.getElementById('flow') || document.getElementById('outlook');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    if(window.__spzAddRoute){
      window.__spzAddRoute({
        id:'globe', feat:true, after:'flow',
        t:{en:'Global Money Map',th:'แผนที่เงินทุนโลก'},
        d:{en:'Which country\'s money is buying which market — liquidity, flows and forward scenarios, almost entirely as graphics.',
           th:'เงินของประเทศไหนซื้อตลาดไหน — สภาพคล่อง กระแสเงิน และฉากทัศน์ข้างหน้า เป็นกราฟิกเกือบทั้งหมด'}
      });
    }

    new MutationObserver(function(){ try { sec.__render(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 320); });
  else setTimeout(boot, 320);
})();
