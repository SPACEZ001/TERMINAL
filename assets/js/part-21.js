
/* ============================================================================
   SPACEZ TERMINAL v17 — MULTI-LEVEL FLOW WEB + INFLATION / CURRENCY DESK
   ========================================================================= */
(function(){
  'use strict';

/* ============================================================================
   v17 — MULTI-LEVEL FLOW WEB + INFLATION / CURRENCY DESK
   ========================================================================= */

/* ---------------- 5-level capital flow web ---------------- */
var WEB = {
  cols:[
    {en:'Money printed',th:'เงินที่ถูกพิมพ์'},
    {en:'Who holds it',th:'ใครถือเงินนั้น'},
    {en:'Market it enters',th:'ตลาดที่มันเข้า'},
    {en:'Stock style',th:'ประเภทหุ้น'},
    {en:'Sector',th:'กลุ่มอุตสาหกรรม'},
    {en:'Names',th:'หุ้นรายตัว'},
    {en:'Who they pay',th:'แล้วจ่ายต่อให้ใคร'}
  ],
  n:[
    /* ---- L0 central banks: where the money comes from in the first place ---- */
    {id:'cbFED', L:0, f:'🇺🇸', l:{en:'Federal Reserve',th:'เฟด'},          v:'$23.2T · +5.4%', w:11, c:'#ccff00'},
    {id:'cbPBOC',L:0, f:'🇨🇳', l:{en:'PBoC',th:'ธนาคารกลางจีน'},           v:'¥347T · +9.0%',  w:10, c:'#b98cff'},
    {id:'cbECB', L:0, f:'🇪🇺', l:{en:'ECB',th:'ธนาคารกลางยุโรป'},          v:'€16.2T · +3.0%', w:8,  c:'#4dd8ff'},
    {id:'cbBOJ', L:0, f:'🇯🇵', l:{en:'Bank of Japan',th:'ธนาคารกลางญี่ปุ่น'}, v:'¥1,270T · +1.3%', w:7, c:'#ff9f45'},
    {id:'cbBOE', L:0, f:'🇬🇧', l:{en:'Bank of England',th:'ธนาคารกลางอังกฤษ'}, v:'£3.1T · 3.50%', w:5, c:'#7fd1ff'},
    {id:'cbSNB', L:0, f:'🇨🇭', l:{en:'Swiss National Bank',th:'ธนาคารกลางสวิส'}, v:'CHF 1.1T · 0.25%', w:4, c:'#ff8fb0'},
    {id:'cbRBI', L:0, f:'🇮🇳', l:{en:'Reserve Bank of India',th:'ธนาคารกลางอินเดีย'}, v:'₹260T · 5.25%', w:5, c:'#ffd166'},
    {id:'cbBOK', L:0, f:'🇰🇷', l:{en:'Bank of Korea',th:'ธนาคารกลางเกาหลีใต้'}, v:'2.75%', w:4, c:'#ff6b35'},
    {id:'cbMAS', L:0, f:'🇸🇬', l:{en:'Monetary Authority of Singapore',th:'ธนาคารกลางสิงคโปร์ (MAS)'}, v:'SGD NEER band', w:4, c:'#3ddc97'},

    /* ---- L1 holders ---- */
    {id:'us',   L:1, f:'🇺🇸', l:{en:'US investors',th:'นักลงทุนสหรัฐฯ'},  v:'−$8.1B/wk', w:10, c:'#ccff00'},
    {id:'eu',   L:1, f:'🇪🇺', l:{en:'European funds',th:'กองทุนยุโรป'},    v:'€58.9B/mo', w:8,  c:'#4dd8ff'},
    {id:'jp',   L:1, f:'🇯🇵', l:{en:'Japan carry trade',th:'carry trade ญี่ปุ่น'}, v:'0.75%', w:7, c:'#ff9f45'},
    {id:'cn',   L:1, f:'🇨🇳', l:{en:'China outflow',th:'เงินไหลออกจีน'},    v:'net out',   w:5,  c:'#b98cff'},
    {id:'gulf', L:1, f:'🛢️', l:{en:'Gulf sovereign funds',th:'กองทุนความมั่งคั่งอ่าวอาหรับ'}, v:'oil surplus', w:5, c:'#00ff88'},
    {id:'cash', L:1, f:'💵', l:{en:'Money market cash',th:'เงินสดตลาดเงิน'}, v:'$7.93T',   w:9,  c:'#ff5f7a'},
    {id:'pens', L:1, f:'🏛️', l:{en:'Pension funds',th:'กองทุนบำนาญ'},         v:'long horizon', w:8, c:'#8fe3a0'},
    {id:'pass', L:1, f:'📦', l:{en:'Passive index buyers',th:'คนซื้อกองทุนดัชนี'}, v:'+$1.3T/yr', w:9, c:'#7fd1ff'},
    {id:'hedg', L:1, f:'🎯', l:{en:'Hedge funds',th:'เฮดจ์ฟันด์'},             v:'levered',   w:6, c:'#ff8fb0'},
    {id:'emlo', L:1, f:'🌏', l:{en:'EM local savers',th:'ผู้ออมในตลาดเกิดใหม่'}, v:'domestic',  w:5, c:'#ffd166'},
    {id:'retl', L:1, f:'📱', l:{en:'Retail traders',th:'นักลงทุนรายย่อย'},     v:'app-driven',w:6, c:'#c9a0ff'},

    /* ---- L1 markets ---- */
    {id:'mUS',  L:2, pm:[.9,1.0,.85,.7], f:'🇺🇸', l:{en:'US equities',th:'หุ้นสหรัฐฯ'},        v:'AI-led',    w:11},
    {id:'mAS',  L:2, pm:[.8,1.0,.6,.35], f:'🇰🇷', l:{en:'Korea / Taiwan',th:'เกาหลี / ไต้หวัน'}, v:'+$15.3B/mo', w:9},
    {id:'mJP',  L:2, pm:[.7,.85,.7,.5], f:'🇯🇵', l:{en:'Japan equities',th:'หุ้นญี่ปุ่น'},      v:'+$2.3B/mo',  w:5},
    {id:'mEM',  L:2, pm:[.7,1.0,.8,.6], f:'📜', l:{en:'EM bonds',th:'ตราสารหนี้ EM'},         v:'+$214B YTD', w:10},
    {id:'mCM',  L:2, pm:[.5,.55,1.0,.75], f:'🥇', l:{en:'Gold & commodities',th:'ทองคำและโภคภัณฑ์'}, v:'+$5B YTD', w:5},
    {id:'mST',  L:2, pm:[.4,.62,.95,1.0], f:'🏦', l:{en:'Short govt bonds',th:'พันธบัตรรัฐบาลสั้น'}, v:'+$58B YTD', w:7},
    {id:'mTH',  L:2, pm:[.7,.5,.6,.45], f:'🇹🇭', l:{en:'Thailand (SET)',th:'ไทย (SET)'},        v:'thin flow',  w:3},
    {id:'mIN',  L:2, pm:[.9,.95,.7,.5], f:'🇮🇳', l:{en:'India',th:'อินเดีย'},               v:'domestic bid', w:6},
    {id:'mEU',  L:2, pm:[.85,.7,.75,.5], f:'🇪🇺', l:{en:'Europe equities',th:'หุ้นยุโรป'},   v:'−$1.5B/mo',  w:5},
    {id:'mSC',  L:2, pm:[1.0,.55,.4,.3], f:'🪙', l:{en:'US small caps',th:'หุ้นเล็กสหรัฐฯ'}, v:'rate-sensitive', w:5},
    {id:'mCR',  L:2, pm:[.9,.85,.5,.25], f:'₿', l:{en:'Crypto ETPs',th:'กองทุนคริปโต'},     v:'+$1.13B/mo', w:4},
    {id:'mPC',  L:2, pm:[.8,.9,.7,.35], f:'🧾', l:{en:'Private credit',th:'สินเชื่อเอกชน'},  v:'yield hunt', w:5},
    {id:'mASE', L:2, pm:[.85,.7,.6,.45], f:'🌴', l:{en:'ASEAN ex-Thailand',th:'อาเซียนนอกไทย'}, v:'', w:4},

    /* ---- L2 styles ---- */
    {id:'sGRW', L:3, pm:[.85,1.00,.45,.30], f:'📈', l:{en:'Growth',th:'หุ้นเติบโต'},     v:'', w:12, c:'#ccff00'},
    {id:'sVAL', L:3, pm:[1.00,.72,.90,.55], f:'💎', l:{en:'Value',th:'หุ้นคุณค่า'},       v:'', w:6,  c:'#4dd8ff'},
    {id:'sDIV', L:3, pm:[.55,.60,.80,.85], f:'💰', l:{en:'Dividend',th:'หุ้นปันผล'},     v:'', w:6,  c:'#ff9f45'},
    {id:'sDEF', L:3, pm:[.45,.55,.95,1.00], f:'🛡️', l:{en:'Defensive',th:'หุ้นตั้งรับ'},  v:'', w:5,  c:'#00ff88'},
    {id:'sFIX', L:3, pm:[.50,.70,.95,1.00], f:'📊', l:{en:'Fixed income',th:'ตราสารหนี้'}, v:'', w:9,  c:'#b98cff'},
    {id:'sMOM', L:3, pm:[.80,1.00,.50,.25], f:'🚀', l:{en:'Momentum',th:'โมเมนตัม'},  v:'', w:7, c:'#ff5f7a'},
    {id:'sQUA', L:3, pm:[.70,.80,.95,1.00], f:'🏅', l:{en:'Quality',th:'คุณภาพ'},     v:'', w:7, c:'#8fe3a0'},
    {id:'sSML', L:3, pm:[1.00,.55,.40,.30], f:'🌱', l:{en:'Small cap',th:'หุ้นเล็ก'},  v:'', w:5, c:'#ffd166'},
    {id:'sALT', L:3, pm:[.90,.85,.55,.30], f:'🧬', l:{en:'Alternatives',th:'สินทรัพย์ทางเลือก'}, v:'', w:5, c:'#c9a0ff'},
    {id:'sLOW', L:3, pm:[.50,.60,.90,1.00], f:'🐢', l:{en:'Low volatility',th:'ผันผวนต่ำ'},        v:'', w:6, c:'#8fe3a0'},
    {id:'sCYC', L:3, pm:[1.00,.78,.42,.20], f:'🔄', l:{en:'Cyclical',th:'หุ้นวัฏจักร'},           v:'', w:7, c:'#ff9f45'},
    {id:'sTRN', L:3, pm:[.95,.60,.45,.35], f:'♻️', l:{en:'Turnaround',th:'หุ้นฟื้นตัว'},          v:'', w:5, c:'#4dd8ff'},
    {id:'sINF', L:3, pm:[.72,.85,.80,.78], f:'🏗️', l:{en:'Infrastructure',th:'โครงสร้างพื้นฐาน'},  v:'', w:7, c:'#ffd166'},
    {id:'sEMG', L:3, pm:[.88,.80,.55,.35], f:'🌍', l:{en:'EM equity',th:'หุ้นตลาดเกิดใหม่'},       v:'', w:6, c:'#c9a0ff'},
    {id:'sBLU', L:3, pm:[.70,.90,.75,.70], f:'🏛️', l:{en:'Mega-cap blue chip',th:'บลูชิพขนาดยักษ์'}, v:'', w:8, c:'#7fd1ff'},
    {id:'sSPC', L:3, pm:[.95,.75,.30,.12], f:'🧪', l:{en:'Speculative',th:'เก็งกำไรสูง'},          v:'', w:4, c:'#ff5f7a'},
    {id:'sBRD', L:3, pm:[.62,.68,.85,.92], f:'🛒', l:{en:'Consumer franchise',th:'แบรนด์ผู้บริโภค'}, v:'', w:6, c:'#ff8fb0'},
    {id:'sFRO', L:3, pm:[.85,.95,.40,.18], f:'🔭', l:{en:'Frontier tech',th:'เทคโนโลยีล้ำหน้า'},   v:'', w:6, c:'#ccff00'},
    {id:'sHYD', L:3, pm:[.85,.80,.60,.30], f:'🏦', l:{en:'High-yield credit',th:'ตราสารหนี้ผลตอบแทนสูง'}, v:'', w:5, c:'#b98cff'},
    {id:'sESG', L:3, pm:[.70,.72,.62,.55], f:'🌿', l:{en:'Sustainable',th:'ยั่งยืน / ESG'},        v:'', w:5, c:'#00ff88'},

    /* ---- L3 sectors ---- */
    {id:'kSEM', L:4, pm:[.70,1.00,.46,.26], l:{en:'Semiconductors',th:'เซมิคอนดักเตอร์'}, v:'~20% of index', w:11},
    {id:'kCLD', L:4, pm:[.68,.92,.52,.38], l:{en:'Cloud & software',th:'คลาวด์และซอฟต์แวร์'}, v:'', w:8},
    {id:'kPWR', L:4, pm:[.60,.88,.66,.90], l:{en:'Power & grid',th:'ไฟฟ้าและระบบส่ง'},   v:'', w:7},
    {id:'kBNK', L:4, pm:[.88,.58,.54,.34], l:{en:'Banks',th:'ธนาคาร'},                   v:'', w:6},
    {id:'kENR', L:4, pm:[.58,.52,.94,.44], l:{en:'Energy',th:'พลังงาน'},                 v:'', w:5},
    {id:'kHLT', L:4, pm:[.44,.50,.84,.88], l:{en:'Healthcare',th:'สุขภาพ'},              v:'', w:5},
    {id:'kSTA', L:4, pm:[.40,.44,.82,.94], l:{en:'Staples',th:'สินค้าจำเป็น'},           v:'', w:5},
    {id:'kREI', L:4, pm:[.70,.36,.44,.46], l:{en:'REITs & property',th:'REIT และอสังหา'}, v:'', w:4},
    {id:'kTEL', L:4, pm:[.42,.42,.62,.78], l:{en:'Telecom',th:'โทรคมนาคม'},              v:'', w:4},
    {id:'kBND', L:4, pm:[.50,.62,.92,1.00], l:{en:'Bonds & T-bills',th:'พันธบัตรและตั๋วเงินคลัง'}, v:'', w:9},
    {id:'kIND', L:4, pm:[.82,.74,.50,.30], l:{en:'Industrials',th:'อุตสาหกรรม'},         v:'', w:6},
    {id:'kMAT', L:4, pm:[.76,.52,.86,.34], l:{en:'Materials',th:'วัสดุ'},                v:'', w:5},
    {id:'kDIS', L:4, pm:[.88,.60,.34,.22], l:{en:'Discretionary',th:'สินค้าฟุ่มเฟือย'},   v:'', w:6},
    {id:'kINS', L:4, pm:[.66,.50,.58,.48], l:{en:'Insurance',th:'ประกันภัย'},            v:'', w:4},
    {id:'kDEF', L:4, pm:[.55,.62,.70,.72], l:{en:'Defence & aero',th:'กลาโหมและการบิน'},  v:'', w:5},
    {id:'kLOG', L:4, pm:[.84,.66,.48,.30], l:{en:'Shipping & logistics',th:'ขนส่งและโลจิสติกส์'}, v:'', w:4},
    {id:'kAGR', L:4, pm:[.50,.48,.78,.70], l:{en:'Agriculture & food',th:'เกษตรและอาหาร'}, v:'', w:4},
    {id:'kCRY', L:4, pm:[.90,.85,.50,.25], l:{en:'Digital assets',th:'สินทรัพย์ดิจิทัล'},  v:'', w:4},
    {id:'kMED', L:4, pm:[.80,.72,.44,.34], l:{en:'Media & streaming',th:'สื่อและสตรีมมิ่ง'},      v:'', w:5},
    {id:'kTRV', L:4, pm:[.92,.70,.38,.18], l:{en:'Travel & leisure',th:'ท่องเที่ยวและสันทนาการ'}, v:'', w:5},
    {id:'kBIO', L:4, pm:[.60,.66,.78,.72], l:{en:'Biotech',th:'ไบโอเทค'},                         v:'', w:5},
    {id:'kROB', L:4, pm:[.78,.94,.50,.28], l:{en:'Robotics & automation',th:'หุ่นยนต์และระบบอัตโนมัติ'}, v:'', w:6},
    {id:'kCYB', L:4, pm:[.72,.88,.62,.48], l:{en:'Cybersecurity',th:'ความมั่นคงไซเบอร์'},          v:'', w:5},
    {id:'kBAT', L:4, pm:[.84,.76,.46,.24], l:{en:'Battery & EV',th:'แบตเตอรี่และรถไฟฟ้า'},         v:'', w:5},
    {id:'kREN', L:4, pm:[.76,.82,.60,.52], l:{en:'Renewables',th:'พลังงานหมุนเวียน'},              v:'', w:6},
    {id:'kLUX', L:4, pm:[.86,.64,.36,.16], l:{en:'Luxury goods',th:'สินค้าหรู'},                   v:'', w:4},
    {id:'kGAM', L:4, pm:[.82,.70,.42,.30], l:{en:'Gaming',th:'เกม'},                              v:'', w:4},
    {id:'kSPA', L:4, pm:[.66,.80,.55,.30], l:{en:'Space & satellite',th:'อวกาศและดาวเทียม'},       v:'', w:4},
    {id:'kWTR', L:4, pm:[.58,.62,.74,.80], l:{en:'Water & waste',th:'น้ำและการจัดการของเสีย'},     v:'', w:4},

    /* ---- L4 names ---- */
    {id:'NVDA', L:5, l:'NVDA', v:{en:'US semis',th:'เซมิ สหรัฐฯ'}, w:10},
    {id:'TSM',  L:5, l:'TSM',  v:{en:'Taiwan foundry',th:'โรงหล่อไต้หวัน'}, w:9},
    {id:'AVGO', L:5, l:'AVGO', v:{en:'Custom AI silicon',th:'ชิป AI สั่งทำ'}, w:8},
    {id:'AMD',  L:5, l:'AMD',  v:{en:'Second source',th:'ทางเลือกที่สอง'}, w:5},
    {id:'MSFT', L:5, l:'MSFT', v:{en:'Azure',th:'Azure'}, w:9},
    {id:'AMZN', L:5, l:'AMZN', v:{en:'AWS',th:'AWS'}, w:7},
    {id:'GOOGL',L:5, l:'GOOGL',v:{en:'Search + cloud',th:'Search + คลาวด์'}, w:6},
    {id:'DELTA',L:5, l:'DELTA',v:{en:'TH · DC power',th:'ไทย · ไฟฟ้า DC'}, w:7},
    {id:'GULF', L:5, l:'GULF', v:{en:'TH · power',th:'ไทย · ไฟฟ้า'}, w:5},
    {id:'DUK',  L:5, l:'DUK',  v:{en:'US utility',th:'สาธารณูปโภคสหรัฐฯ'}, w:4},
    {id:'JPM',  L:5, l:'JPM',  v:{en:'US bank',th:'ธนาคารสหรัฐฯ'}, w:6},
    {id:'KBANK',L:5, l:'KBANK',v:{en:'TH bank',th:'ธนาคารไทย'}, w:4},
    {id:'XOM',  L:5, l:'XOM',  v:{en:'US energy',th:'พลังงานสหรัฐฯ'}, w:5},
    {id:'PTT',  L:5, l:'PTT',  v:{en:'TH energy',th:'พลังงานไทย'}, w:4},
    {id:'JNJ',  L:5, l:'JNJ',  v:{en:'US healthcare',th:'สุขภาพสหรัฐฯ'}, w:5},
    {id:'BDMS', L:5, l:'BDMS', v:{en:'TH hospitals',th:'โรงพยาบาลไทย'}, w:4},
    /* BH (Bumrungrad Hospital) was already an edge target further down
       (kHLT -> BH) with no matching node defined -- the renderer's
       undefined-node guard was silently dropping that link. Adding the
       node here completes it instead of leaving a dead-end. */
    {id:'BH',   L:5, l:'BH',   v:{en:'TH private hospital',th:'โรงพยาบาลเอกชนไทย'}, w:3},
    {id:'KO',   L:5, l:'KO',   v:{en:'Staples',th:'สินค้าจำเป็น'}, w:4},
    {id:'CPALL',L:5, l:'CPALL',v:{en:'TH retail',th:'ค้าปลีกไทย'}, w:4},
    {id:'O',    L:5, l:'O',    v:{en:'US REIT',th:'REIT สหรัฐฯ'}, w:4},
    {id:'LH',   L:5, l:'LH',   v:{en:'TH property',th:'อสังหาไทย'}, w:3},
    {id:'ADVANC',L:5,l:'ADVANC',v:{en:'TH telecom',th:'โทรคมนาคมไทย'}, w:4},
    {id:'VZ',   L:5, l:'VZ',   v:{en:'US telecom',th:'โทรคมนาคมสหรัฐฯ'}, w:3},
    {id:'TDEX', L:5, l:'TDEX', v:{en:'SET50 ETF',th:'ETF SET50'}, w:3},
    {id:'SGOV', L:5, l:'SGOV', v:{en:'0-3m T-bills',th:'ตั๋วเงินคลัง 0-3 เดือน'}, w:8},
    {id:'ORCL', L:5, l:'ORCL', v:{en:'AI cloud',th:'คลาวด์ AI'}, w:6},
    {id:'CRM',  L:5, l:'CRM',  v:{en:'Enterprise SaaS',th:'ซอฟต์แวร์องค์กร'}, w:5},
    {id:'CAT',  L:5, l:'CAT',  v:{en:'Heavy equipment',th:'เครื่องจักรหนัก'}, w:5},
    {id:'SCC',  L:5, l:'SCC',  v:{en:'TH materials',th:'วัสดุไทย'}, w:4},
    {id:'AOT',  L:5, l:'AOT',  v:{en:'TH airports',th:'สนามบินไทย'}, w:4},
    {id:'MINT', L:5, l:'MINT', v:{en:'TH hotels',th:'โรงแรมไทย'}, w:3},
    {id:'MET',  L:5, l:'MET',  v:{en:'US insurer',th:'ประกันสหรัฐฯ'}, w:4},
    {id:'TISCO',L:5, l:'TISCO',v:{en:'TH finance',th:'การเงินไทย'}, w:3},
    {id:'CPF',  L:5, l:'CPF',  v:{en:'TH protein',th:'โปรตีนไทย'}, w:4},
    {id:'IBIT', L:5, l:'IBIT', v:{en:'Spot BTC ETF',th:'ETF บิตคอยน์'}, w:4},
    {id:'GLD',  L:5, l:'GLD',  v:{en:'Gold ETF',th:'ETF ทองคำ'}, w:5},
    {id:'IWM',  L:5, l:'IWM',  v:{en:'Small-cap ETF',th:'ETF หุ้นเล็ก'}, w:4},
    {id:'INDA', L:5, l:'INDA', v:{en:'India ETF',th:'ETF อินเดีย'}, w:4},
    {id:'TLT',  L:5, l:'TLT',  v:{en:'20y+ Treasuries',th:'พันธบัตร 20 ปีขึ้นไป'}, w:5},
    {id:'NFLX', L:5, l:'NFLX', v:{en:'Streaming',th:'สตรีมมิ่ง'}, w:5},
    {id:'TSLA', L:5, l:'TSLA', v:{en:'EV & energy',th:'รถไฟฟ้าและพลังงาน'}, w:6},
    {id:'PLTR', L:5, l:'PLTR', v:{en:'Data software',th:'ซอฟต์แวร์ข้อมูล'}, w:4},
    {id:'SHOP', L:5, l:'SHOP', v:{en:'E-commerce',th:'อีคอมเมิร์ซ'}, w:4},
    {id:'NOW',  L:5, l:'NOW',  v:{en:'Workflow SaaS',th:'ซอฟต์แวร์กระบวนการ'}, w:4},
    {id:'ABBV', L:5, l:'ABBV', v:{en:'Pharma',th:'ยา'}, w:5},
    {id:'PFE',  L:5, l:'PFE',  v:{en:'Vaccines & drugs',th:'วัคซีนและยา'}, w:4},
    {id:'UNH',  L:5, l:'UNH',  v:{en:'Health insurance',th:'ประกันสุขภาพ'}, w:5},
    {id:'WMT',  L:5, l:'WMT',  v:{en:'US retail',th:'ค้าปลีกสหรัฐฯ'}, w:5},
    {id:'COST', L:5, l:'COST', v:{en:'Membership retail',th:'ค้าปลีกสมาชิก'}, w:5},
    {id:'MCD',  L:5, l:'MCD',  v:{en:'Franchised food',th:'อาหารแฟรนไชส์'}, w:4},
    {id:'PG',   L:5, l:'PG',   v:{en:'Household brands',th:'แบรนด์ของใช้ในบ้าน'}, w:5},
    {id:'SO',   L:5, l:'SO',   v:{en:'US utility',th:'สาธารณูปโภคสหรัฐฯ'}, w:4},
    {id:'ENB',  L:5, l:'ENB',  v:{en:'Pipelines',th:'ท่อส่ง'}, w:4},
    {id:'BBL',  L:5, l:'BBL',  v:{en:'TH bank',th:'ธนาคารไทย'}, w:4},
    {id:'SCB',  L:5, l:'SCB',  v:{en:'TH bank holding',th:'โฮลดิ้งธนาคารไทย'}, w:4},
    {id:'TOP',  L:5, l:'TOP',  v:{en:'TH refinery',th:'โรงกลั่นไทย'}, w:3},
    {id:'EGCO', L:5, l:'EGCO', v:{en:'TH power IPP',th:'ผู้ผลิตไฟฟ้าไทย'}, w:3},
    {id:'RATCH',L:5, l:'RATCH',v:{en:'TH power',th:'ไฟฟ้าไทย'}, w:3},
    {id:'OSP',  L:5, l:'OSP',  v:{en:'TH beverage',th:'เครื่องดื่มไทย'}, w:3},
    {id:'TU',   L:5, l:'TU',   v:{en:'TH seafood',th:'อาหารทะเลไทย'}, w:3},
    {id:'PTTEP',L:5, l:'PTTEP',v:{en:'TH upstream',th:'สำรวจผลิตปิโตรเลียมไทย'}, w:4},

    /* ---- L6: what the company does with the money once it has it ---- */
    {id:'uCAP', L:6, f:'🏗️', l:{en:'Capex',th:'ลงทุนขยายกิจการ'},      v:'', w:10, c:'#ccff00'},
    {id:'uRND', L:6, f:'🔬', l:{en:'R&D',th:'วิจัยและพัฒนา'},           v:'', w:7,  c:'#4dd8ff'},
    {id:'uSUP', L:6, f:'🔩', l:{en:'Suppliers',th:'จ่ายซัพพลายเออร์'},  v:'', w:8,  c:'#ff9f45'},
    {id:'uWAG', L:6, f:'👷', l:{en:'Wages',th:'ค่าจ้างพนักงาน'},        v:'', w:7,  c:'#b98cff'},
    {id:'uDIV', L:6, f:'💸', l:{en:'Dividends',th:'ปันผลผู้ถือหุ้น'},   v:'', w:9,  c:'#00ff88'},
    {id:'uBBK', L:6, f:'🔁', l:{en:'Buybacks',th:'ซื้อหุ้นคืน'},        v:'', w:6,  c:'#ff5f7a'},
    {id:'uDBT', L:6, f:'🏦', l:{en:'Debt & interest',th:'คืนหนี้และดอกเบี้ย'}, v:'', w:6, c:'#9aa094'},
    {id:'uTAX', L:6, f:'🏛️', l:{en:'Tax',th:'ภาษีรัฐ'},                v:'', w:5,  c:'#ffc247'},
    {id:'uMNA', L:6, f:'🤝', l:{en:'Acquisitions',th:'ซื้อกิจการ'},      v:'', w:5,  c:'#7fd1ff'},
    {id:'uHOLD',L:6, f:'🧊', l:{en:'Cash on balance sheet',th:'เงินสดกองในบริษัท'}, v:'', w:5, c:'#8fe3a0'},
    {id:'uENR', L:6, f:'⚡', l:{en:'Energy bills',th:'ค่าไฟค่าพลังงาน'},  v:'', w:4,  c:'#ffd166'},
    {id:'uLIT', L:6, f:'⚖️', l:{en:'Legal & fines',th:'คดีความและค่าปรับ'}, v:'', w:3, c:'#ff5f7a'},
    {id:'uGRN', L:6, f:'🌱', l:{en:'Transition capex',th:'ลงทุนเปลี่ยนผ่านพลังงาน'}, v:'', w:4, c:'#00ff88'}
  ],
  e:[
    /* central banks → who ends up holding the money */
    ['cbFED','us',9],['cbFED','cash',8],['cbFED','gulf',4],
    ['cbECB','eu',8],['cbECB','cash',2],
    ['cbBOJ','jp',7],['cbBOJ','eu',2],
    ['cbPBOC','cn',6],['cbPBOC','gulf',2],
    ['cbBOE','eu',5],['cbBOE','pens',3],['cbBOE','hedg',2],
    ['cbSNB','hedg',3],['cbSNB','pens',2],['cbSNB','cash',2],
    ['cbRBI','emlo',5],['cbRBI','retl',2],
    ['cbFED','pens',6],['cbFED','pass',8],['cbFED','hedg',5],['cbFED','retl',5],
    ['cbECB','pass',4],['cbECB','pens',3],
    ['cbBOJ','hedg',4],['cbPBOC','emlo',4],
    ['cbBOK','emlo',4],['cbBOK','hedg',2],['cbBOK','pass',2],
    ['cbMAS','pens',3],['cbMAS','hedg',3],['cbMAS','pass',2],
    /* holders → markets */
    ['us','mUS',8],['us','mAS',6],['us','mEM',5],['us','mCM',3],['us','mJP',3],
    ['eu','mUS',5],['eu','mEM',4],['eu','mST',4],['eu','mAS',3],
    ['jp','mEM',6],['jp','mAS',5],['jp','mUS',3],
    ['cn','mCM',3],['cn','mAS',3],['cn','mEM',2],
    ['gulf','mUS',4],['gulf','mCM',3],['gulf','mEM',2],
    ['cash','mUS',5],['cash','mST',6],['cash','mTH',1],
    /* the newer holder types and the markets they actually buy */
    ['pens','mUS',6],['pens','mST',6],['pens','mEU',4],['pens','mPC',5],['pens','mJP',3],
    ['pass','mUS',10],['pass','mAS',4],['pass','mEU',4],['pass','mSC',4],['pass','mIN',3],
    ['hedg','mCR',4],['hedg','mPC',4],['hedg','mAS',4],['hedg','mSC',3],['hedg','mCM',3],
    ['emlo','mIN',6],['emlo','mASE',4],['emlo','mEM',4],['emlo','mTH',2],
    ['retl','mCR',5],['retl','mUS',5],['retl','mSC',3],['retl','mTH',2],
    ['us','mCR',3],['us','mSC',4],['us','mIN',3],['us','mEU',3],
    ['eu','mEU',5],['eu','mIN',2],
    ['jp','mPC',3],['jp','mASE',3],
    ['cn','mASE',3],['gulf','mIN',3],['gulf','mPC',3],['cash','mPC',3],
    /* markets → styles */
    ['mUS','sGRW',9],['mUS','sVAL',4],['mUS','sDIV',4],['mUS','sDEF',4],
    ['mAS','sGRW',9],['mAS','sVAL',2],
    ['mJP','sVAL',3],['mJP','sGRW',2],
    ['mEM','sFIX',10],
    ['mCM','sVAL',4],['mCM','sDEF',2],
    ['mST','sFIX',7],
    ['mTH','sDIV',2],['mTH','sDEF',2],['mTH','sGRW',1],
    ['mUS','sMOM',7],['mUS','sQUA',6],['mUS','sSML',3],
    ['mAS','sMOM',6],['mAS','sQUA',3],
    ['mIN','sGRW',5],['mIN','sQUA',3],['mIN','sSML',2],
    ['mEU','sVAL',4],['mEU','sQUA',3],['mEU','sDIV',3],
    ['mSC','sSML',6],['mSC','sVAL',2],
    ['mCR','sALT',6],
    ['mPC','sFIX',5],['mPC','sALT',3],
    ['mASE','sDIV',3],['mASE','sGRW',2],
    ['mJP','sQUA',3],['mCM','sALT',3],['mEM','sQUA',2],
    ['mUS','sBLU',9],['mUS','sLOW',5],['mUS','sCYC',5],['mUS','sFRO',6],['mUS','sESG',4],
    ['mAS','sFRO',6],['mAS','sCYC',4],['mAS','sEMG',4],
    ['mIN','sEMG',6],['mIN','sBRD',3],['mIN','sINF',4],
    ['mEU','sBLU',4],['mEU','sLOW',3],['mEU','sESG',5],['mEU','sBRD',4],
    ['mSC','sSPC',4],['mSC','sTRN',4],['mSC','sCYC',3],
    ['mCR','sSPC',5],['mCR','sFRO',3],
    ['mPC','sHYD',6],
    ['mASE','sEMG',4],['mASE','sINF',3],
    ['mTH','sINF',3],['mTH','sEMG',3],['mTH','sBRD',2],['mTH','sLOW',2],
    ['mJP','sBLU',3],['mJP','sCYC',3],
    ['mEM','sHYD',5],['mEM','sEMG',4],
    ['mCM','sCYC',3],['mCM','sINF',2],
    ['mST','sLOW',4],
    /* styles → sectors */
    ['sGRW','kSEM',11],['sGRW','kCLD',8],['sGRW','kPWR',5],
    ['sVAL','kBNK',6],['sVAL','kENR',5],
    ['sDIV','kTEL',4],['sDIV','kREI',4],['sDIV','kENR',3],['sDIV','kPWR',3],
    ['sDEF','kHLT',5],['sDEF','kSTA',5],['sDEF','kPWR',2],
    ['sFIX','kBND',10],
    ['sMOM','kSEM',8],['sMOM','kCLD',6],['sMOM','kCRY',4],['sMOM','kDEF',3],
    ['sQUA','kHLT',5],['sQUA','kSTA',4],['sQUA','kCLD',5],['sQUA','kINS',3],
    ['sSML','kIND',4],['sSML','kDIS',4],['sSML','kLOG',3],['sSML','kMAT',2],
    ['sALT','kCRY',6],['sALT','kMAT',3],
    ['sVAL','kIND',5],['sVAL','kMAT',4],['sVAL','kINS',4],['sVAL','kLOG',3],
    ['sGRW','kDIS',4],['sGRW','kDEF',3],
    ['sDEF','kAGR',4],['sDIV','kAGR',2],['sDIV','kIND',2],
    ['sLOW','kSTA',5],['sLOW','kPWR',5],['sLOW','kTEL',4],['sLOW','kWTR',4],['sLOW','kHLT',3],
    ['sCYC','kIND',6],['sCYC','kMAT',5],['sCYC','kDIS',5],['sCYC','kLOG',4],['sCYC','kTRV',5],
    ['sTRN','kMED',4],['sTRN','kTRV',4],['sTRN','kBAT',3],['sTRN','kDIS',3],
    ['sINF','kPWR',7],['sINF','kREN',6],['sINF','kWTR',4],['sINF','kLOG',4],['sINF','kIND',4],
    ['sEMG','kBNK',5],['sEMG','kENR',4],['sEMG','kDIS',4],['sEMG','kTEL',3],['sEMG','kAGR',3],
    ['sBLU','kCLD',7],['sBLU','kSEM',6],['sBLU','kSTA',5],['sBLU','kHLT',5],['sBLU','kBNK',4],
    ['sSPC','kCRY',5],['sSPC','kBIO',4],['sSPC','kSPA',4],['sSPC','kGAM',3],
    ['sBRD','kSTA',6],['sBRD','kDIS',5],['sBRD','kLUX',4],['sBRD','kMED',3],['sBRD','kAGR',3],
    ['sFRO','kROB',6],['sFRO','kCYB',5],['sFRO','kSPA',4],['sFRO','kSEM',5],['sFRO','kBAT',4],
    ['sHYD','kBND',6],['sHYD','kENR',3],['sHYD','kREI',3],
    ['sESG','kREN',6],['sESG','kWTR',4],['sESG','kHLT',3],['sESG','kBAT',3],
    ['sGRW','kMED',3],['sGRW','kBIO',4],['sGRW','kGAM',3],
    ['sMOM','kROB',4],['sMOM','kGAM',3],['sVAL','kTRV',3],['sDEF','kWTR',3],
    /* sectors → names */
    ['kSEM','NVDA',10],['kSEM','TSM',9],['kSEM','AVGO',8],['kSEM','AMD',5],
    ['kCLD','MSFT',9],['kCLD','AMZN',7],['kCLD','GOOGL',6],
    ['kPWR','DELTA',7],['kPWR','GULF',5],['kPWR','DUK',4],
    ['kBNK','JPM',6],['kBNK','KBANK',4],
    ['kENR','XOM',5],['kENR','PTT',4],
    ['kHLT','JNJ',5],['kHLT','BDMS',4],
    ['kSTA','KO',4],['kSTA','CPALL',4],
    ['kREI','O',4],['kREI','LH',3],['kREI','TDEX',2],
    ['kTEL','ADVANC',4],['kTEL','VZ',3],
    ['kBND','SGOV',9],
    ['kBND','TLT',5],
    ['kCLD','ORCL',6],['kCLD','CRM',5],
    ['kIND','CAT',5],['kIND','AOT',4],['kIND','DELTA',3],
    ['kMAT','SCC',4],['kMAT','GLD',3],
    ['kDIS','MINT',3],['kDIS','AMZN',4],['kDIS','CPALL',3],
    ['kINS','MET',4],['kINS','TISCO',3],['kINS','JPM',2],
    ['kDEF','CAT',3],['kDEF','AVGO',2],
    ['kLOG','AOT',3],['kLOG','CAT',2],
    ['kAGR','CPF',4],['kAGR','KO',2],['kAGR','CPALL',2],
    ['kCRY','IBIT',6],
    ['kSEM','TSM',2],['kPWR','GULF',2],
    ['kSTA','CPF',2],['kREI','IWM',2],['kBNK','TISCO',2],
    ['kENR','SCC',2],['kHLT','BH',3],
    ['kSEM','IWM',2],['kCLD','INDA',3],['kIND','INDA',2],['kBND','GLD',2],
    ['kMED','NFLX',5],['kMED','GOOGL',3],
    ['kTRV','MINT',4],['kTRV','AOT',4],['kTRV','MCD',3],
    ['kBIO','ABBV',5],['kBIO','PFE',4],['kBIO','JNJ',3],
    ['kROB','NVDA',5],['kROB','AVGO',4],['kROB','DELTA',4],['kROB','CAT',3],
    ['kCYB','MSFT',5],['kCYB','ORCL',3],['kCYB','CRM',3],
    ['kBAT','TSLA',6],['kBAT','DELTA',3],
    ['kREN','GULF',5],['kREN','EGCO',4],['kREN','RATCH',4],['kREN','SO',3],
    ['kLUX','COST',2],['kLUX','MCD',2],
    ['kGAM','NFLX',3],['kGAM','SHOP',2],
    ['kSPA','AVGO',3],['kSPA','CAT',2],
    ['kWTR','SO',3],['kWTR','DUK',3],['kWTR','TU',2],
    ['kHLT','UNH',5],['kHLT','ABBV',3],['kHLT','PFE',3],
    ['kSTA','WMT',5],['kSTA','COST',4],['kSTA','PG',5],['kSTA','OSP',3],['kSTA','TU',3],
    ['kDIS','MCD',4],['kDIS','WMT',3],['kDIS','SHOP',3],['kDIS','TSLA',3],
    ['kCLD','NOW',4],['kCLD','PLTR',4],['kCLD','NFLX',3],
    ['kENR','TOP',3],['kENR','PTTEP',4],['kENR','ENB',4],
    ['kPWR','SO',4],['kPWR','EGCO',3],['kPWR','RATCH',3],
    ['kBNK','BBL',4],['kBNK','SCB',4],
    ['kBND','ENB',2],['kINS','UNH',3],['kAGR','TU',3],['kAGR','OSP',2],
    ['kMAT','TOP',2],['kIND','TSLA',2],['kLOG','ENB',2],['kSEM','PLTR',2],
    /* names → where their cash actually goes */
    ['NVDA','uRND',6],['NVDA','uSUP',7],['NVDA','uBBK',5],['NVDA','uCAP',4],
    ['TSM','uCAP',9],['TSM','uSUP',5],['TSM','uWAG',4],['TSM','uDIV',4],
    ['AVGO','uRND',5],['AVGO','uDIV',5],['AVGO','uDBT',4],
    ['AMD','uRND',5],['AMD','uSUP',3],
    ['MSFT','uCAP',9],['MSFT','uRND',6],['MSFT','uBBK',5],['MSFT','uDIV',3],['MSFT','uTAX',3],
    ['AMZN','uCAP',9],['AMZN','uWAG',7],['AMZN','uSUP',5],
    ['GOOGL','uCAP',7],['GOOGL','uRND',6],['GOOGL','uBBK',4],
    ['DELTA','uCAP',6],['DELTA','uSUP',5],['DELTA','uWAG',4],['DELTA','uDIV',3],
    ['GULF','uCAP',6],['GULF','uDBT',5],['GULF','uDIV',3],
    ['DUK','uCAP',5],['DUK','uDIV',5],['DUK','uDBT',4],
    ['JPM','uDIV',5],['JPM','uBBK',5],['JPM','uWAG',4],['JPM','uTAX',3],
    ['KBANK','uDIV',4],['KBANK','uWAG',3],['KBANK','uTAX',2],
    ['XOM','uCAP',6],['XOM','uDIV',6],['XOM','uBBK',4],['XOM','uTAX',3],
    ['PTT','uCAP',5],['PTT','uDIV',5],['PTT','uTAX',3],
    ['JNJ','uRND',5],['JNJ','uDIV',5],['JNJ','uWAG',3],
    ['BDMS','uCAP',4],['BDMS','uWAG',4],['BDMS','uDIV',3],
    ['BH','uCAP',4],['BH','uDIV',4],['BH','uWAG',3],
    ['KO','uSUP',4],['KO','uDIV',5],['KO','uWAG',3],
    ['CPALL','uSUP',5],['CPALL','uWAG',4],['CPALL','uDBT',3],['CPALL','uDIV',2],
    ['O','uDIV',7],['O','uDBT',4],
    ['LH','uDIV',4],['LH','uCAP',3],
    ['ADVANC','uCAP',4],['ADVANC','uDIV',5],['ADVANC','uTAX',2],
    ['VZ','uDIV',5],['VZ','uDBT',4],['VZ','uCAP',3],
    ['TDEX','uDIV',3],
    ['SGOV','uTAX',5],['SGOV','uDBT',5],
    ['ORCL','uCAP',7],['ORCL','uDBT',5],['ORCL','uRND',4],
    ['CRM','uMNA',4],['CRM','uRND',4],['CRM','uBBK',3],
    ['CAT','uSUP',5],['CAT','uDIV',4],['CAT','uWAG',4],
    ['SCC','uCAP',4],['SCC','uENR',4],['SCC','uDIV',3],
    ['AOT','uCAP',4],['AOT','uTAX',3],['AOT','uWAG',3],
    ['MINT','uWAG',3],['MINT','uDBT',3],['MINT','uCAP',2],
    ['MET','uDIV',4],['MET','uHOLD',4],['MET','uBBK',2],
    ['TISCO','uDIV',4],['TISCO','uTAX',2],
    ['CPF','uSUP',4],['CPF','uENR',3],['CPF','uWAG',3],
    ['IBIT','uHOLD',5],['GLD','uHOLD',5],
    ['IWM','uHOLD',3],['INDA','uHOLD',3],['TLT','uHOLD',4],
    ['NVDA','uMNA',3],['MSFT','uMNA',4],['AMZN','uENR',4],['MSFT','uENR',4],
    ['DELTA','uENR',3],['DUK','uENR',3],['XOM','uHOLD',3],['JNJ','uMNA',3],
    ['KO','uENR',2],['CPALL','uENR',3],['TSM','uENR',5],['GULF','uENR',3],
    ['NFLX','uCAP',6],['NFLX','uRND',3],['NFLX','uDBT',3],
    ['TSLA','uCAP',7],['TSLA','uRND',5],['TSLA','uENR',3],['TSLA','uWAG',4],
    ['PLTR','uRND',4],['PLTR','uWAG',3],['PLTR','uHOLD',2],
    ['SHOP','uRND',3],['SHOP','uWAG',3],
    ['NOW','uRND',4],['NOW','uWAG',3],['NOW','uMNA',2],
    ['ABBV','uRND',5],['ABBV','uDIV',5],['ABBV','uLIT',3],['ABBV','uMNA',3],
    ['PFE','uRND',5],['PFE','uDIV',4],['PFE','uLIT',3],
    ['UNH','uWAG',4],['UNH','uBBK',4],['UNH','uLIT',3],['UNH','uDIV',3],
    ['WMT','uSUP',7],['WMT','uWAG',6],['WMT','uCAP',4],['WMT','uDIV',3],
    ['COST','uSUP',6],['COST','uWAG',5],['COST','uDIV',3],
    ['MCD','uSUP',4],['MCD','uDIV',4],['MCD','uDBT',3],
    ['PG','uSUP',5],['PG','uDIV',5],['PG','uBBK',3],['PG','uENR',2],
    ['SO','uCAP',6],['SO','uDIV',5],['SO','uGRN',4],['SO','uDBT',4],
    ['ENB','uCAP',5],['ENB','uDIV',5],['ENB','uDBT',4],['ENB','uGRN',3],
    ['BBL','uDIV',4],['BBL','uWAG',3],['BBL','uTAX',3],
    ['SCB','uDIV',4],['SCB','uCAP',3],['SCB','uTAX',2],
    ['TOP','uENR',4],['TOP','uCAP',3],['TOP','uDIV',2],
    ['EGCO','uCAP',4],['EGCO','uDIV',3],['EGCO','uGRN',3],
    ['RATCH','uCAP',3],['RATCH','uDIV',3],['RATCH','uGRN',3],
    ['OSP','uSUP',3],['OSP','uWAG',2],['OSP','uDIV',2],
    ['TU','uSUP',4],['TU','uENR',2],['TU','uDIV',2],
    ['PTTEP','uCAP',5],['PTTEP','uDIV',5],['PTTEP','uTAX',3],['PTTEP','uGRN',2],
    ['XOM','uGRN',3],['DELTA','uGRN',2],['MSFT','uGRN',3],['AMZN','uGRN',3],
    ['JNJ','uLIT',3],['JPM','uLIT',2],['CPALL','uHOLD',2],['AOT','uHOLD',2],
    ['CAT','uENR',2],['ORCL','uENR',3]
  ],
  loop:{en:'Dividends and buybacks flow back to the people who put the money in — that dashed curve is the loop closing.',
        th:'ปันผลและการซื้อหุ้นคืนไหลกลับไปหาคนที่ลงเงินตั้งแต่แรก — เส้นประโค้งนั้นคือวงจรที่ปิดครบ'},
  phaseH:{en:'Re-flow the web for a different phase',th:'คำนวณใยใหม่ตามช่วงวัฏจักร'},
  phases:[{id:0,l:{en:'Early',th:'ต้นวัฏจักร'}},{id:1,l:{en:'Mid',th:'กลางวัฏจักร'}},
          {id:2,l:{en:'Late',th:'ปลายวัฏจักร'}},{id:3,l:{en:'Recession',th:'ถดถอย'}}],
  nowTag:{en:'now',th:'ตอนนี้'},
  evH:{en:'Or simulate an event and watch the money re-route',th:'หรือจำลองเหตุการณ์แล้วดูเงินเปลี่ยนเส้นทาง'},
  ev:[
    {id:'ai',   ic:'🤖', p:1, t:{en:'AI capex revised up',th:'ปรับเพิ่มงบลงทุน AI'}},
    {id:'infl', ic:'🔥', p:2, t:{en:'Inflation above 4%',th:'เงินเฟ้อเกิน 4%'}},
    {id:'ism',  ic:'📉', p:2, t:{en:'ISM below 50 twice',th:'ISM ต่ำกว่า 50 สองครั้ง'}},
    {id:'crd',  ic:'💥', p:3, t:{en:'Credit spreads blow out',th:'ส่วนต่างเครดิตพัง'}},
    {id:'cut',  ic:'✂️', p:0, t:{en:'Fed cuts, cash moves',th:'เฟดลด เงินสดเคลื่อน'}},
    {id:'yen',  ic:'🇯🇵', p:2, t:{en:'Japan raises rates',th:'ญี่ปุ่นขึ้นดอกเบี้ย'}}
  ],
  diffH:{en:'What changed',th:'อะไรเปลี่ยนไป'},
  gain:{en:'gaining flow',th:'ได้เงินเพิ่ม'},
  lose:{en:'losing flow',th:'เสียเงินไป'},
  reset:{en:'Back to now',th:'กลับสถานะปัจจุบัน'},
  hint:{en:'Tap any block to isolate its whole path — everything upstream and everything downstream. Tap again to release.',
        th:'แตะกล่องไหนก็ได้เพื่อแยกดูเส้นทางทั้งสาย — ทั้งต้นทางและปลายทางของมัน แตะซ้ำเพื่อยกเลิก'},
  drillH:{en:'Path detail',th:'รายละเอียดเส้นทาง'},
  fromH:{en:'Money reaches it from',th:'เงินมาถึงมันจาก'},
  toH:{en:'And flows on into',th:'แล้วไหลต่อไปที่'},
  endsH:{en:'Names at the end of this path',th:'หุ้นที่ปลายทางของเส้นนี้'},
  pickHint:{en:'Nothing selected — tap a block in the web above to trace a path.',
            th:'ยังไม่ได้เลือก — แตะกล่องในใยด้านบนเพื่อไล่เส้นทาง'}
};

/* ---------------- inflation & currency desk ---------------- */
var INFL = {
  eb:{en:'Inflation & Currency Desk',th:'โต๊ะเงินเฟ้อและค่าเงิน'},
  h2:{en:'What Money Is Worth, Country By Country',th:'เงินมีค่าแค่ไหน แยกรายประเทศ'},
  lede:{en:'Inflation decides what your return is actually worth. A 6% yield in a country running 8% inflation loses you money. Readings compiled 8 September 2026 — tap any row to check the live number.',
        th:'เงินเฟ้อเป็นตัวตัดสินว่าผลตอบแทนของคุณมีค่าจริงเท่าไหร่ ผลตอบแทน 6% ในประเทศที่เงินเฟ้อ 8% คือขาดทุน ตัวเลขรวบรวมเมื่อ 8 ก.ย. 2026 — แตะแถวไหนก็ได้เพื่อเช็คตัวเลขล่าสุด'},
  s1:{en:'Real rate ranking',th:'อันดับดอกเบี้ยแท้จริง'},
  s2:{en:'Country map',th:'แผนที่รายประเทศ'},
  s3:{en:'Instruments that respond to inflation',th:'เครื่องมือที่ตอบสนองต่อเงินเฟ้อ'},
  s4:{en:'Read',th:'สรุป'},
  cols:{en:['Country','CPI','Policy rate','Real rate','Currency'],
        th:['ประเทศ','เงินเฟ้อ','ดอกเบี้ยนโยบาย','ดอกเบี้ยแท้จริง','สกุลเงิน']},
  realH:{en:'Policy rate minus inflation. Positive means savers are paid; negative means cash quietly loses.',
         th:'ดอกเบี้ยนโยบายลบเงินเฟ้อ เป็นบวกแปลว่าคนออมได้เงิน เป็นลบแปลว่าเงินสดค่อยๆ หายไปเงียบๆ'},
  c:[
    {f:'🇺🇸', n:{en:'United States',th:'สหรัฐอเมริกา'}, cur:'USD', cpi:3.4, rate:3.75, u:'united-states'},
    {f:'🇪🇺', n:{en:'Euro area',th:'ยูโรโซน'},          cur:'EUR', cpi:3.3, rate:2.4, u:'euro-area'},
    {f:'🇯🇵', n:{en:'Japan',th:'ญี่ปุ่น'},               cur:'JPY', cpi:1.9, rate:1.0, u:'japan'},
    {f:'🇬🇧', n:{en:'United Kingdom',th:'สหราชอาณาจักร'}, cur:'GBP', cpi:2.9, rate:3.75, u:'united-kingdom'},
    {f:'🇨🇭', n:{en:'Switzerland',th:'สวิตเซอร์แลนด์'},   cur:'CHF', cpi:0.8, rate:0.0, u:'switzerland'},
    {f:'🇨🇦', n:{en:'Canada',th:'แคนาดา'},               cur:'CAD', cpi:3.0, rate:2.25, u:'canada'},
    {f:'🇦🇺', n:{en:'Australia',th:'ออสเตรเลีย'},         cur:'AUD', cpi:3.5, rate:4.35, u:'australia'},
    {f:'🇨🇳', n:{en:'China',th:'จีน'},                    cur:'CNY', cpi:0.5, rate:3.0, u:'china'},
    {f:'🇰🇷', n:{en:'South Korea',th:'เกาหลีใต้'},        cur:'KRW', cpi:3.1, rate:3.0, u:'south-korea'},
    {f:'🇹🇼', n:{en:'Taiwan',th:'ไต้หวัน'},               cur:'TWD', cpi:2.5, rate:2.0, u:'taiwan'},
    {f:'🇹🇭', n:{en:'Thailand',th:'ไทย'},                 cur:'THB', cpi:2.5, rate:1.0, u:'thailand'},
    {f:'🇸🇬', n:{en:'Singapore',th:'สิงคโปร์'},           cur:'SGD', cpi:2.2, rate:1.1, u:'singapore'},
    {f:'🇲🇾', n:{en:'Malaysia',th:'มาเลเซีย'},            cur:'MYR', cpi:1.8, rate:2.75, u:'malaysia'},
    {f:'🇮🇩', n:{en:'Indonesia',th:'อินโดนีเซีย'},        cur:'IDR', cpi:3.2, rate:5.75, u:'indonesia'},
    {f:'🇵🇭', n:{en:'Philippines',th:'ฟิลิปปินส์'},       cur:'PHP', cpi:6.1, rate:5.0, u:'philippines'},
    {f:'🇻🇳', n:{en:'Vietnam',th:'เวียดนาม'},             cur:'VND', cpi:4.9, rate:4.5, u:'vietnam'},
    {f:'🇮🇳', n:{en:'India',th:'อินเดีย'},                cur:'INR', cpi:4.5, rate:5.25, u:'india'},
    {f:'🇧🇷', n:{en:'Brazil',th:'บราซิล'},                cur:'BRL', cpi:4.4, rate:14.0, u:'brazil'},
    {f:'🇲🇽', n:{en:'Mexico',th:'เม็กซิโก'},              cur:'MXN', cpi:3.1, rate:6.5, u:'mexico'},
    {f:'🇸🇦', n:{en:'Saudi Arabia',th:'ซาอุดีอาระเบีย'},  cur:'SAR', cpi:1.8, rate:4.25, u:'saudi-arabia'},
    {f:'🇦🇪', n:{en:'UAE',th:'ยูเออี'},                   cur:'AED', cpi:2.0, rate:3.65, u:'united-arab-emirates'},
    {f:'🇹🇷', n:{en:'Turkey',th:'ตุรกี'},                 cur:'TRY', cpi:31.5, rate:37.0, u:'turkey'},
    {f:'🇦🇷', n:{en:'Argentina',th:'อาร์เจนตินา'},        cur:'ARS', cpi:33.8, rate:29.0, u:'argentina'},
    {f:'🇻🇪', n:{en:'Venezuela',th:'เวเนซุเอลา'},         cur:'VES', cpi:387,  rate:59.0, u:'venezuela'}
  ],
  world:{en:'IMF global mean 7.6% · median 3.3% across 192 countries',
         th:'ค่าเฉลี่ยโลกของ IMF 7.6% · ค่ามัธยฐาน 3.3% จาก 192 ประเทศ'},
  inst:[
    {t:{en:'TIPS / inflation-linked bonds',th:'พันธบัตรชดเชยเงินเฟ้อ (TIPS)'}, k:'good',
     d:{en:'Principal adjusts with CPI, so the real return is contracted rather than hoped for. The most direct hedge that exists.',
        th:'เงินต้นปรับตาม CPI ผลตอบแทนที่แท้จริงจึงเป็นไปตามสัญญา ไม่ใช่แค่ความหวัง เป็นเครื่องมือป้องกันที่ตรงที่สุดเท่าที่มี'},
     w:{en:'You still lose if real yields rise. Duration risk does not disappear.',
        th:'ถ้าผลตอบแทนแท้จริงขึ้น คุณก็ยังขาดทุน ความเสี่ยงจากอายุตราสารไม่ได้หายไป'}},
    {t:{en:'Short-term T-bills',th:'ตั๋วเงินคลังอายุสั้น'}, k:'good',
     d:{en:'Reprice every few weeks, so they follow policy rates upward almost immediately. $58B went into these ETFs this year.',
        th:'ตีราคาใหม่ทุกไม่กี่สัปดาห์ จึงตามดอกเบี้ยนโยบายขึ้นได้แทบจะทันที ปีนี้เงินเข้า ETF กลุ่มนี้ 5.8 หมื่นล้าน'},
     w:{en:'Almost no upside beyond the yield. Pure parking.',
        th:'แทบไม่มีขาขึ้นนอกจากดอกเบี้ย เป็นที่จอดเงินล้วนๆ'}},
    {t:{en:'Gold',th:'ทองคำ'}, k:'warn',
     d:{en:'Works when inflation comes with falling real yields or currency debasement. Commodity ETFs took ~$5B this year.',
        th:'ได้ผลเมื่อเงินเฟ้อมาพร้อมผลตอบแทนแท้จริงที่ลดลงหรือค่าเงินเสื่อม ปีนี้ ETF โภคภัณฑ์ได้เงินเข้าราว 5 พันล้าน'},
     w:{en:'A poor hedge when real yields rise — 1980 to 2000 it lost badly in real terms.',
        th:'เป็นเครื่องมือป้องกันที่แย่เมื่อผลตอบแทนแท้จริงขึ้น — ปี 1980 ถึง 2000 มันขาดทุนหนักเมื่อคิดเป็นค่าเงินจริง'}},
    {t:{en:'Pricing-power equities',th:'หุ้นที่มีอำนาจตั้งราคา'}, k:'good',
     d:{en:'Businesses that pass cost increases to customers keep their margin. This is the only hedge that also compounds.',
        th:'ธุรกิจที่ผลักภาระต้นทุนไปให้ลูกค้าได้จะรักษาอัตรากำไรไว้ นี่คือเครื่องมือป้องกันเดียวที่ทบต้นได้ด้วย'},
     w:{en:'Takes quarters to show up, and the market sells first and checks later.',
        th:'ใช้เวลาหลายไตรมาสกว่าจะเห็นผล และตลาดมักขายก่อนแล้วค่อยมาตรวจทีหลัง'}},
    {t:{en:'Long-duration bonds',th:'พันธบัตรอายุยาว'}, k:'bad',
     d:{en:'The worst place to be in rising inflation — a fixed coupon loses purchasing power every year it runs.',
        th:'ที่ที่แย่ที่สุดในภาวะเงินเฟ้อขาขึ้น — ดอกเบี้ยคงที่สูญเสียอำนาจซื้อทุกปีที่มันเดินไป'},
     w:{en:'Only turns attractive when inflation is clearly falling or a recession is arriving.',
        th:'จะน่าสนใจก็ต่อเมื่อเงินเฟ้อลดลงชัดเจนหรือภาวะถดถอยกำลังมาถึงแล้วเท่านั้น'}},
    {t:{en:'Cash in a high-inflation currency',th:'เงินสดในสกุลเงินที่เงินเฟ้อสูง'}, k:'bad',
     d:{en:'Venezuela at 387% and Turkey around 30% destroy savings faster than any market drawdown does.',
        th:'เวเนซุเอลาที่ 387% และตุรกีราว 30% ทำลายเงินออมเร็วกว่าตลาดหุ้นตกรอบไหนๆ'},
     w:{en:'The nominal number never falls, which is exactly why the loss is invisible.',
        th:'ตัวเลขในบัญชีไม่เคยลดลง ซึ่งเป็นเหตุผลเดียวกับที่ทำให้การขาดทุนนี้มองไม่เห็น'}}
  ],
  reads:[
    {k:'good', t:{en:'Positive real rates',th:'ดอกเบี้ยแท้จริงเป็นบวก'},
     d:{en:'Brazil, Mexico, India, Indonesia and the Philippines pay savers well above their inflation. This is what has pulled $214B into EM bonds this year — and it is exactly the trade that unwinds if Japan raises rates.',
        th:'บราซิล เม็กซิโก อินเดีย อินโดนีเซีย และฟิลิปปินส์ จ่ายผู้ออมสูงกว่าเงินเฟ้อของตัวเองมาก นี่คือสิ่งที่ดึงเงิน 2.14 แสนล้านเข้าตราสารหนี้ EM ปีนี้ — และเป็นการเทรดเดียวกันที่จะคลายตัวถ้าญี่ปุ่นขึ้นดอกเบี้ย'}},
    {k:'warn', t:{en:'Thailand: low inflation, low rate',th:'ไทย: เงินเฟ้อต่ำ ดอกเบี้ยต่ำ'},
     d:{en:'Thai CPI ran negative for eleven straight months into early 2026 before recovering, and reached 2.53% in August — the fastest in four months, up from 1.95% in July. The Bank of Thailand held its rate at 1.00% on 26 August, so the real rate is now roughly minus one and a half points: cash is quietly losing value, and foreign bond money has little reason to come.',
        th:'เงินเฟ้อไทยติดลบสิบเอ็ดเดือนติดต่อกันจนถึงต้นปี 2026 ก่อนฟื้นตัว และขึ้นมาที่ 2.53% ในเดือน ส.ค. เร็วที่สุดในรอบสี่เดือน จาก 1.95% ในเดือน ก.ค. ธนาคารแห่งประเทศไทยคงดอกเบี้ยที่ 1.00% เมื่อ 26 ส.ค. ทำให้ดอกเบี้ยแท้จริงติดลบราวหนึ่งจุดครึ่ง เงินสดค่อยๆ เสียมูลค่าเงียบๆ และเงินตราสารหนี้ต่างชาติแทบไม่มีเหตุผลจะเข้ามา'}},
    {k:'warn', t:{en:'China near zero',th:'จีนใกล้ศูนย์'},
     d:{en:'Flat to slightly negative consumer prices with weak domestic demand. Deflation expectations, once set, are very hard to break — Japan needed 25 years.',
        th:'ราคาผู้บริโภคทรงตัวถึงติดลบเล็กน้อย พร้อมอุปสงค์ในประเทศที่อ่อนแอ ความคาดหวังว่าราคาจะลดเมื่อฝังรากแล้วแก้ยากมาก — ญี่ปุ่นใช้เวลา 25 ปี'}},
    {k:'good', t:{en:'Japan finally has inflation',th:'ญี่ปุ่นมีเงินเฟ้อแล้วจริงๆ'},
     d:{en:'Sustained 2–2.5% after a 25-year fight. With the policy rate still at 0.75%, the real rate is deeply negative — which is precisely what funds the global carry trade.',
        th:'อยู่ที่ 2–2.5% ต่อเนื่องหลังต่อสู้มา 25 ปี แต่ดอกเบี้ยนโยบายยังอยู่ที่ 0.75% ทำให้ดอกเบี้ยแท้จริงติดลบลึก — ซึ่งเป็นสิ่งที่หล่อเลี้ยง carry trade ทั่วโลกพอดี'}},
    {k:'bad', t:{en:'The extremes still exist',th:'ยังมีกรณีสุดขั้วอยู่'},
     d:{en:'Venezuela at 387%, Sudan 75%, Iran 69%. Argentina has come down from a 211% peak to about 30%. In these places the currency itself is the risk, not the stock market.',
        th:'เวเนซุเอลา 387% ซูดาน 75% อิหร่าน 69% ส่วนอาร์เจนตินาลดจากจุดสูงสุด 211% เหลือราว 30% ในประเทศเหล่านี้ ตัวสกุลเงินเองคือความเสี่ยง ไม่ใช่ตลาดหุ้น'}}
  ],
  note:{en:'Policy rates are the latest decision as of 8 September 2026; CPI is each country\'s most recent published year-on-year print, which is July or August 2026 depending on the release calendar. Compiled from central bank releases and national statistics offices. They change monthly — tap any country row to open the live figure before using any of it. Educational content, not investment advice.',
        th:'ดอกเบี้ยนโยบายคือมติล่าสุด ณ วันที่ 8 ก.ย. 2026 ส่วนเงินเฟ้อคือตัวเลขเทียบปีก่อนที่แต่ละประเทศประกาศล่าสุด ซึ่งเป็นเดือน ก.ค. หรือ ส.ค. 2026 แล้วแต่ปฏิทินการประกาศ รวบรวมจากประกาศของธนาคารกลางและสำนักงานสถิติแห่งชาติ ตัวเลขเปลี่ยนทุกเดือน — ให้แตะแถวประเทศเพื่อเปิดดูตัวเลขจริงก่อนนำไปใช้ทุกครั้ง เป็นเนื้อหาเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'},
  mapHint:{en:'Hover — or tap on a phone — any country to see its currency and inflation. The 24 highlighted countries carry data; the rest of the map is background.',
           th:'ชี้เมาส์ — หรือแตะถ้าใช้มือถือ — ที่ประเทศไหนก็ได้เพื่อดูค่าเงินและเงินเฟ้อของประเทศนั้น ประเทศที่มีสีทั้ง 24 ประเทศคือมีข้อมูล ส่วนที่เหลือเป็นพื้นหลัง'},
  fxL:{en:'Exchange rate',th:'ค่าเงิน'},
  perUsd:{en:'per 1 USD',th:'ต่อ 1 ดอลลาร์'},
  noFx:{en:'No live rate for this currency',th:'ไม่มีอัตราสดของสกุลเงินนี้'},
  lgCool:{en:'Below 3% — low',th:'ต่ำกว่า 3% — ต่ำ'},
  lgMid:{en:'3–10% — moderate',th:'3–10% — ปานกลาง'},
  lgHot:{en:'10%+ — high',th:'10% ขึ้นไป — สูง'},
  lgNone:{en:'No data on this page',th:'ไม่มีข้อมูลในหน้านี้'}
};

/* ---------------- inflation map: real country shapes, generated offline from
   Natural Earth 1:110m boundaries (world-atlas / topojson-client, ISC-licensed
   public data) and reprojected to a flat 1400x700 box (equirectangular,
   cropped to roughly -58..84 latitude so Antarctica doesn't eat half the
   canvas). Each entry keeps only the SVG path + which INFL.c country (by its
   `u` id) it belongs to; countries with no match are undated background.
   "euro-area" is deliberately many real countries sharing one data point,
   same as the desk's own table always treated it. Singapore is too small to
   register at this resolution, so its real (tiny) shape ships from the finer
   1:50m set, plus a handful of pin markers below for territories too small
   to reliably hover/tap otherwise. ---------------- */
var INFL_MAP_D = [{"d":"M1392.7,500.4L1393.7,499.6L1395,501L1394.4,503.6L1392,504.2L1389.8,503.6L1389.4,501.5L1390.9,499.8ZM1400,495.7L1397.5,496.9L1395,497.9L1394.5,496.1L1396.5,495.1L1397.7,494.8L1400,493.3L1400,493.3L1400,495.7ZM0,493.3L0,493.3L0,493.3L0.8,493.1L0.3,495.4L0,495.7L0,495.7L0,493.3Z"},{"d":"M831.8,418.8L832.5,419.3L846.6,429.4L846.9,432.2L852.5,437.1L850.7,443.2L850.9,446L853.4,447.8L853.5,449.1L852.4,452.1L852.7,453.6L852.4,455.9L853.8,459L855.4,463.9L856.8,464.9L853.7,467.8L849.4,469.7L847.1,469.6L845.7,471.1L843,471.2L842,471.9L837.3,470.5L834.4,470.9L833.3,464.2L832,461.9L831.2,460.5L827.4,459.6L825.2,458.1L822.7,457.3L821.2,456.5L819.5,455.2L817.4,449L815.2,446.2L814.4,443.4L814.8,440.8L814.1,436.3L815.7,436L817.1,434.2L818.6,431.7L819.6,430.6L819.6,429L818.7,427.9L818.5,426L819.6,425.4L819.8,422.5L818.3,419.7L819.7,419.1L823.9,419.1Z"},{"d":"M666.3,277.7L666.3,278.1L666.2,279L666.2,286.5L653.5,286.2L653.6,298.9L649.9,299.3L649,301.8L649.7,309L634.5,308.9L633.6,310.6L633.8,308.5L633.9,308.5L642.6,308.1L643.1,306.3L644.7,304.1L646,297.3L651.4,292L653.2,285.8L654.4,285.4L655.7,281.6L659,281L660.4,281.7L662.1,281.7L663.4,280.6L665.8,280.4L665.7,277.7Z"},{"d":"M222.3,172.5L221.8,172.5L214.2,167.7L211.5,165.6L204.4,163.5L202.2,159.2L202.8,156.1L197.8,154L197.2,150L192.4,146.5L192.4,143.9L194.5,141.6L194.4,138.4L187.8,135.3L183.8,129.7L181.4,126.1L177.8,123.9L175.2,121.9L173.2,119.4L169.2,121L165.5,123.7L162,120.5L159.3,118.3L155.5,116.9L151.7,116.8L151.7,88.7L151.7,70.4L159,71.6L165.1,74L169.2,74.4L172.6,72.4L177.3,70.9L183.1,71.5L188.9,69.3L195.2,68.1L197.9,70.1L200.8,68.9L201.7,66.6L204.4,67.2L211,71.6L216.1,68.2L216.7,72L221.4,71.2L222.9,69.7L227.6,70L233.6,72.1L242.7,73.9L248,74.7L251.8,74.4L257.1,76.9L251.6,79.4L258.6,80.4L269.1,79.8L272.4,79L276.6,81.9L280.8,79.4L276.8,77.3L279.3,75.6L284.1,75.4L287.2,74.9L290.3,76.1L294.2,78.8L298.6,78.4L305.5,80.6L311.5,79.8L317.2,79.9L316.7,76.9L320.2,76L326.2,77.7L326.2,82.4L328.7,78.4L331.8,78.6L333.5,73.6L329.4,70.6L324.8,68.6L325.1,63.1L329.7,59.5L334.9,60.3L338.8,62.5L344.1,68.1L340.6,70.5L347.9,71.5L347.9,76.5L353.1,72.7L357.7,75.8L356.5,79.5L360.3,82.8L364.4,79.3L367.2,75L367.4,69.6L372.9,70L378.7,70.7L383.9,73.1L384.2,75.6L381.3,78.2L384,80.9L383.5,83.3L375.9,86.7L370.5,87.5L366.5,86L365.3,88.5L361.5,92.6L360.4,94.8L355.9,98.1L350.3,98.4L347.3,100.5L347,103.7L342.5,104.3L337.7,108.3L333.5,113.9L332,117.8L331.8,123.5L337.5,124.3L339.3,128.9L341.1,132.7L346.5,131.7L353.7,133.8L357.6,135.7L360.4,138L365.3,139.4L369.4,141.5L375.8,141.7L380,142.2L379.4,146.5L380.6,151.5L383.4,157L389.2,161.6L392.2,160L394.3,155L392.3,147.2L389.6,144.6L395.8,142.3L400.2,138.8L402.3,135.4L402,132.1L399.4,127.9L394.7,124.2L399.2,119L397.5,114.6L396.2,106.9L399,105.7L405.6,107.1L409.6,107.6L412.9,106.3L416.5,107.9L421.3,110.8L422.4,112.7L429.4,113.1L429.3,117.2L430.5,123.4L434.1,124.2L436.9,127.1L442.5,124.4L446.3,118.9L448.8,116.7L451.9,121.1L456.9,127.3L461.2,133.3L459.7,136.4L464.8,139.1L468.3,142L474.5,143.2L477,144.8L478.6,149L481.6,149.6L483.2,151.5L483.5,157L480.6,158.9L477.8,160.6L471.4,162.4L466.5,166.4L460,167.2L451.6,166.2L445.8,166.1L441.8,166.5L438.5,170L433.6,172.2L428,178.7L423.5,183.3L426.8,182.5L433,176L441.2,171.9L447,171.4L450.4,173.8L446.8,177.1L448,182.4L449.3,186.2L454.3,188.6L460.8,187.9L464.7,182.4L464.9,185.9L467.4,187.7L462.6,190.9L454,193.9L450.1,195.9L445.8,199.4L442.9,199.1L442.7,194.9L449.5,190.8L443.2,191L438.9,191.6L436.4,188.8L436.4,182.1L434.6,180.6L432,181.5L430.7,180.2L427.8,183.9L426.6,187.7L425.2,190L423.6,190.7L422.3,191L421.9,192.2L414.8,192.2L408.8,192.3L407.1,193.2L403,196.7L402.5,197.1L401.3,199L397.7,199L393.9,199L392.1,199.8L392.7,200.8L393.1,202.3L393,202.8L387.9,205.2L383.9,206L379.4,208.6L378.4,208.6L377.1,207.9L376.7,207.2L376.8,206.7L377.6,204.9L379.4,202.2L380.6,199.3L379.8,195L379,190.5L374.9,188.2L375.4,187.4L374.8,186.7L373.8,186.7L373,186L372.8,184.8L372,185.3L371,185.2L371.2,184.7L370.3,184.2L369.9,182.9L366.9,181.3L363.8,179.7L360,177.8L356.3,176L352.8,177.4L351.6,177.4L346.8,176.1L343.6,176.8L339.9,175.2L335.9,174.5L333.2,174.2L332,173.3L331.3,170.6L330,170.6L329.9,172.5L321.9,172.5L308.6,172.5L295.4,172.5L283.7,172.5L272,172.5L260.6,172.5L248.7,172.5L244.9,172.5L233.3,172.5ZM373.4,106.2L376.3,103.9L381.6,104L381.5,104.9L377,107.7L374.2,107.6ZM389.8,55.2L385.5,52.6L385.6,50.8L387.5,50.5L396.4,51L403.1,53.7L403.5,55.1L399.3,54.9L395.1,54.8L390.9,55.5ZM387.7,108L389.2,106.6L390.8,106.7L391.7,107.7L390.2,110.3L388.5,109.8L387.5,108.4ZM335.9,44.5L333.8,46.4L328.2,46L323.5,44.7L325.5,42.5L331.1,41.2L334.5,42.9ZM335.1,31.9L333.3,32.1L326,31.8L325,30.4L332.8,30.5L335.5,31.4ZM323.7,25.8L328.4,27.5L327.3,29.3L321.6,30.3L318.4,29.2L316.7,27.3L316.4,25.3L321.5,25.5ZM357.2,47.4L350.9,46.8L340.6,45.2L339.2,42.5L338.8,40L334.9,37.9L326.8,37.3L322.3,35.7L323.8,33.7L331.8,34L336.1,35.6L343.8,35.6L347.1,37.2L346.2,39.1L350.7,40.2L353.2,41.4L358.4,41.6L364.1,42L370.3,40.9L378.2,40.5L384.5,40.8L388.7,42.7L389.5,44.7L387.1,46.1L381.3,47.1L376.3,46.5L365.2,47.3ZM267.3,28.8L272.8,29.6L271.5,31.1L264.2,32.5L258.5,30.9L261.6,29.3ZM268.5,25.6L273.5,26.6L268.8,27.6L262.3,27.6L262.4,26.9L266.4,25.4ZM483.8,161.1L481.7,164.2L479.1,168.5L481.7,166.9L484.3,167.9L482.9,169.6L486.4,171L488.2,169.8L492,171.3L490.8,174.9L493.5,174.1L494.1,176.7L495.3,179.8L493.6,184.1L491.9,184.3L489.3,183.3L490.1,179.3L489.1,178.7L484.6,183L482.2,182.8L485,180.5L481.2,179.3L477.1,179.6L469.5,179.4L468.9,178L471.3,176.2L469.6,174.9L472.9,171.9L476.9,164.1L479.4,161.3L482.7,159.6L484.5,159.8ZM373.8,93.1L378,94.8L382.5,96.3L382.8,98.7L385.7,98.3L388.5,99.9L385,101.5L379,100.3L376.8,98.1L373,100.7L367.4,103.3L366.1,100.4L360.8,100.9L364.2,98.4L364.7,94.5L366,90L368.8,90.4L369.5,92.6L371.5,91.8ZM393.7,57.4L397.4,55.5L406,58L411.3,60.3L411.8,62.5L419.1,61.3L423.1,64.5L432.5,66.4L435.9,68.4L439.6,73L432.4,75.3L441.6,78.5L447.8,79.6L453.4,84.2L459.5,84.5L458.3,87.9L451.4,93.7L446.6,91.6L440.5,86.8L435.5,87.4L435,90.3L439.1,93.1L444.4,95.4L446,96.7L448.5,101.6L447.2,105.1L442.3,103.8L432.5,99.8L438,104.1L442.1,107.1L442.7,108.8L432.1,106.8L423.8,104L419.1,101.6L420.4,100.2L414.6,97.6L409,95.2L409,96.7L397.8,97.5L394.5,95.8L397.1,92.1L404.4,92.1L412.4,91.4L411.1,89.7L412.4,87.2L417.5,82.4L416.4,80.2L414.9,78.5L408.9,76.1L401.1,74.5L403.6,73.2L399.4,70.2L396,69.9L392.9,68.2L390.9,69.7L383.8,70.3L369.7,69.2L361.4,67.7L355.1,67L351.9,65.3L356,63L350.4,63L349.2,58L352.2,53.6L356.2,51.6L366.2,50.3L363.4,53.4L366.4,56.5L370,52.5L379.9,50.5L386.6,55.6L386,58.9ZM332.5,48.6L340.6,48.8L348,50L342.2,54.4L337.6,55.3L333.4,59L329,58.9L326.5,54.5L326.6,52.1L328.6,50ZM222.2,38.9L228.8,35.2L236.8,32L242.8,32.1L248.1,31.3L247.6,35.1L244.6,36.8L241,37.1L233.7,39.2L227.5,39.9ZM183.9,147.7L187.6,147.3L186.5,152.9L189.9,156.9L188.3,156.8L186,154.6L184.5,152.3L182.6,150.8L181.8,148.6L182.1,147.1ZM289.7,23.2L297.4,23.8L307.9,25.6L310.9,28L312.4,30L306,29.5L299.6,27.9L291,27.7L294.7,26.2L290,25.1ZM219.7,175L217.7,175.6L211.3,173.4L210.2,171.7L206.7,169.9L206,168.5L202,167.6L200.5,165L200.8,163.8L204.9,164.9L207.3,165.6L211,166.2L212.3,167.9L214.2,170.2L218.1,172.2ZM227.3,47.1L232.9,48.1L242.8,48.4L246.6,49.8L250.8,51.9L245.9,53.1L236.4,56.6L231.5,60L231.5,62.2L221.3,64.6L219.3,62.4L210.3,59.8L211.9,57.7L214.6,54.1L218,50.9L214.2,47.9ZM280.7,40.2L284.2,39.4L288.2,39.6L288.9,42L286.6,44.3L273.4,45.1L263.6,47.2L257.7,47.4L257.2,45.7L265.2,43.6L247.7,44.2L242.2,43.3L247.5,38.5L251.2,37.1L262.2,38.7L269.1,41.7L275.8,42L270.3,37.3L273.9,35.5L277.9,36.1L279.2,38.4ZM285.7,53.8L290.1,55.8L292.5,60.6L293.8,64.1L300.3,66.6L307.3,68.9L306.9,71.1L300.5,71.5L303,73.4L301.7,75.2L294.6,74.4L287.9,73.1L283.4,73.4L276.1,75L266.3,75.8L259.3,76.2L257.2,73.9L251.9,72.6L248.5,73.1L243.7,69.2L246.3,68.7L252.3,67.8L257.8,68.1L262.8,67.2L255.3,66.1L247,66.4L241.5,66.3L239.4,64.5L248.4,62.6L242.5,62.6L235.7,61.3L238.9,57.6L241.6,55.7L252,52.7L256,53.6L254.1,55.9L262.7,54.4L268.1,56.9L272.5,54.4L276.1,56L279.3,60.9L281.2,58.8L278.5,53.8L281.9,53.1ZM309.4,55.7L305.1,52.5L309.7,50.1L314.4,51.1L321.3,50.5L322.3,51.9L318.7,54.3L324.6,56.4L323.9,60.8L317.5,62.7L313.7,62.3L311.1,60.4L301.4,56.6L301.5,55.1ZM285.4,51.3L290.7,51.1L293.6,52.2L290.2,55.4L284.1,52ZM316.9,35.9L319.9,38.2L320,40.7L318.3,44.4L311.9,44.9L307.7,44.1L307.8,41.2L301.4,41.6L301.1,37.8L305.3,37.9L311.2,36.3L316.6,36.5ZM326.6,16.8L329.3,15.2L333.3,14.9L331.6,13.8L340.6,13.5L345.6,16.2L352.1,17.2L358.5,18.1L361.6,21.4L366.3,23L360.9,24.5L353.8,28.2L346.9,28.5L338.8,27.9L334.6,25.9L334.7,24.1L337.8,22.8L330.7,22.8L326.4,21.2L323.9,18.9ZM343.8,10.4L349.6,9.4L354.1,9.3L361.8,8.5L367.5,6.6L372.3,6.9L376.5,8.3L379.5,5.6L384.6,4.8L391.6,4.3L403.5,4.1L405.5,4.6L416.8,3.8L425.2,4.1L433.6,4.4L444,4.8L452.4,5.4L459.5,6.8L459.3,8.1L449.8,10.2L440.4,11.2L436.9,12.3L445.4,12.3L436.2,15.3L429.8,16.7L423.2,20.7L415.2,21.5L412.7,22.5L400.9,23.1L406.3,23.7L403.6,24.6L406.8,27L403.1,28.7L397.1,30.1L395.3,32L389.8,33.5L390.4,34.6L397,34.4L397.1,35.6L386.7,38.6L376.5,37.2L365.1,38L359.3,37.4L352,37.1L351.5,34.7L358.7,33.6L356.8,30.1L359.1,29.7L369.5,31.9L364.2,28.7L357.9,27.7L361.1,25.8L368,24.7L369.1,22.9L363.6,21L361.9,18.5L372.6,18.7L375.6,19.2L381.7,17.4L373,16.9L359.3,17.2L352.5,15.5L349.2,13.5L344.7,12.1ZM407.5,81.6L405,83.1L400.6,83.3L399.6,80.9L401.3,78.1L404.9,77.5L407.9,78.8L407.9,80.9ZM325.7,71.5L328,73.4L325.6,75.1L320.4,73.6L317.2,74.2L311.9,72L315.3,70.4L318,68.3L322.2,69.7L324.5,70.6ZM449.1,168.2L450.4,167.8L455.6,169.1L459.5,171.1L459.6,172L457.7,172.1L452.7,170.6ZM451.1,182.2L452.4,184.6L455.2,185.3L458.8,185.1L456.9,187.2L455.5,187.5L450.6,185.4L449.6,183.7Z","u":"canada"},{"d":"M222.3,172.5L233.3,172.5L244.9,172.5L248.7,172.5L260.6,172.5L272,172.5L283.7,172.5L295.4,172.5L308.6,172.5L321.9,172.5L329.9,172.5L330,170.6L331.3,170.6L332,173.3L333.2,174.2L335.9,174.5L339.9,175.2L343.6,176.8L346.8,176.1L351.6,177.4L352.8,177.4L356.3,176L360,177.8L363.8,179.7L366.9,181.3L369.9,182.9L370.3,184.2L371.2,184.7L371,185.2L372,185.3L372.8,184.8L373,186L373.8,186.7L374.8,186.7L375.4,187.4L374.9,188.2L379,190.5L379.8,195L380.6,199.3L379.4,202.2L377.6,204.9L376.8,206.7L376.7,207.2L377.1,207.9L378.4,208.6L379.4,208.6L383.9,206L387.9,205.2L393,202.8L393.1,202.3L392.7,200.8L392.1,199.8L393.9,199L397.7,199L401.3,199L402.5,197.1L403,196.7L407.1,193.2L408.8,192.3L414.8,192.2L421.9,192.2L422.3,191L423.6,190.7L425.2,190L426.6,187.7L427.8,183.9L430.7,180.2L432,181.5L434.6,180.6L436.4,182.1L436.4,188.8L438.9,191.6L439.6,193.2L435.4,195.6L431.4,197.3L427.3,198.7L425.3,201.7L424.6,202.8L424.6,205.4L425.9,208L427.5,208.1L427.1,206.3L428.2,207.4L427.9,208.8L425.3,209.6L423.4,209.5L420.6,210.4L418.9,210.6L416.6,210.9L413.4,212.3L419.1,211.4L420.2,212.3L414.8,213.8L412.3,213.8L412.4,213.2L411.2,214.6L412.4,214.8L411.5,218.3L408.7,222.1L408.4,220.9L407.6,220.6L406.3,219.4L407.1,222L408,222.9L408.1,224.8L406.9,226.7L404.7,230.6L404.3,230.4L405.5,227.1L403.5,225.2L403.1,221.1L402.3,223.2L403.2,226.4L400.6,225.6L403.3,227.2L403.4,231.9L404.5,232.2L405,233.9L405.5,238.8L403,242.5L399,244L396.5,246.8L394.5,247.2L392.5,249L392,250.6L387.7,253.8L385.5,256.2L383.7,259.1L383.1,262.6L383.8,266L385.1,270.2L386.8,273.7L386.8,275.9L388.7,281.6L388.5,284.9L388.4,286.8L387.4,289.8L386.3,290.5L384.3,289.9L383.7,287.7L382.2,286.6L380.2,282.3L378.4,278.5L377.8,276.6L378.6,273.3L377.5,270.6L374.5,266.5L373,265.8L369,268L368.3,267.7L366.4,265.4L364,264.2L359.6,264.8L356.2,264.3L353.2,264.6L351.6,265.4L352.3,266.7L352.2,268.7L353,269.7L352.3,270.3L350.9,269.6L349.4,270.5L346.6,270.4L343.7,267.8L340.3,268.4L337.5,267.3L335,267.6L331.8,268.8L328.2,272.4L324.4,274.5L322.2,276.9L321.3,279.1L321.3,282.5L321.5,284.9L322.2,286.6L320.7,286.7L318,285.6L314.9,284.1L313.8,281.8L313,278.3L310.7,275.5L309.3,272.6L307.4,269.3L304.6,267.3L301.5,267.4L299,271.3L295.8,269.8L293.8,268.3L292.8,265.6L291.5,263L289.2,260.9L287.2,259.3L285.8,257.5L279.1,257.5L279.1,259.6L276,259.6L268.2,259.6L259.4,256.1L253.5,253.8L253.9,252.8L248.9,253.3L244.5,253.7L243.9,251.2L241.3,248.3L239.5,247.8L239.1,246.3L236.9,246.1L235.5,244.8L231.9,244.3L230.9,243.5L230.4,240.8L226.7,235.8L223.4,229L223.6,227.8L221.8,226.2L218.8,222.1L218.3,218L216.2,215.4L217.1,211.3L216.9,207L215.7,203.3L217.2,198.6L217.7,194.1L218.2,189.7L217.5,183.1L216.2,178.8L215.1,176.6L215.6,175.6L221.2,177.3L223.3,181.9L224.2,180.6L223.6,176.6ZM95.7,315.1L96.3,315.5L97,316.2L98,317.9L97.9,318.2L96.4,319.2L95.1,320L94.5,320.8L93.6,320.1L93.7,318.8L93,317L93.2,316.4L93.9,315.6L93.6,314.6L93.9,314.2L94.2,314.3ZM93.4,311.7L93,312.3L91.7,312.7L91.1,311.6L90.6,311.2L90.6,310.9L90.9,310.5L92.3,311ZM90.4,309.7L90.3,310.2L88.2,310.1L88.5,309.5ZM85.5,307L85.8,307.3L86.9,309L86.7,309.3L86.4,309.2L85.1,309L84.6,307.9L84.4,307.7ZM80.2,304.6L80.3,305.7L79.9,306.2L78.6,305.3L78.8,305L79.4,304.5ZM52.6,116.4L55.7,116.9L56.1,118.8L53.7,119.5L51.1,118.6L48.8,117.3ZM104.1,128.3L106.7,128.7L108.3,130.2L105,132.5L101.1,134.4L99.1,133.1L98.5,130.8L102,129.1ZM151.7,70.4L151.7,88.7L151.7,116.8L155.5,116.9L159.3,118.3L162,120.5L165.5,123.7L169.2,121L173.2,119.4L175.2,121.9L177.8,123.9L181.4,126.1L183.8,129.7L187.8,135.3L194.4,138.4L194.5,141.6L192.4,143.9L190.2,142.1L186.8,140.5L185.7,136.2L180.7,132.2L178.6,127.6L174.8,127.2L168.7,127.1L164.1,125.7L156.1,120.6L152.4,119.7L145.5,117.9L140.2,118.3L132.5,116L127.9,113.9L123.6,115L124.4,118.4L122.2,118.7L117.7,119.8L114.3,121.4L110,122.5L109.4,119.6L111.2,114.7L115.3,113.2L114.3,112L109.3,114.7L106.6,118L101,121.5L103.9,123.9L100.2,127.4L96,129.5L92.1,131L91.2,133.2L85.1,135.7L83.9,138.1L79.3,140.2L76.7,139.8L73,141.2L69.1,142.8L65.8,144.5L59.2,145.9L58.6,145.1L62.8,142.8L66.6,141.2L70.8,138.5L75.6,138L77.5,136L82.9,133L83.8,132L86.6,130.3L87.3,126.6L89.3,123.6L84.8,125.1L83.5,124.3L81.4,126.1L78.9,123.6L77.9,125.3L76.4,122.9L72.5,124.9L70.1,124.9L69.8,121.9L70.5,120.1L68,118.4L62.9,119.3L59.6,117L57,115.8L57,113L54,110.9L55.5,108.1L58.6,105.3L60,102.8L63.2,102.4L65.9,103.2L69,100.8L71.8,101.3L74.8,99.7L74,97.5L71.9,96.6L74.7,94.7L72.4,94.8L68.2,95.8L67,96.9L64,95.8L58.5,96.4L52.8,95.2L51.2,93.2L46.2,90.4L51.7,88.3L60.4,85.9L63.6,85.9L63,88.4L71.2,88.2L68.1,85.1L63.3,83.2L60.6,80.8L56.8,78.7L51.5,77.1L53.6,74.5L60.6,74.4L65.5,72.1L66.4,69.7L70.4,67.4L74.1,66.8L81.5,64.6L85.1,65L91.1,62.3L97,63.4L99.8,65.6L101.5,64.6L108.1,64.9L107.8,66.1L113.8,66.9L117.8,66.4L125.9,68L133.4,68.4L136.4,69.1L141.6,68.3L147.5,69.7ZM32.2,99.7L34.6,100.6L37,100.1L40.1,101.4L44,102.1L43.7,102.6L40.7,103.6L37.8,102.6L36.3,101.7L32.8,102L31.9,101.5Z","u":"united-states"},{"d":"M1039.7,171.5L1036.8,174.8L1033.5,175.2L1033.4,180.2L1031.2,182.4L1023.5,180.8L1020.7,189.6L1018.7,190.7L1011,192.7L1014.5,201.2L1011.8,202.5L1012.1,205.3L1009.7,204.6L1007.8,202.8L1002,202.3L995.6,202.2L994.2,202.7L988.6,200.6L986.4,201.7L985.8,204.6L979.4,202.9L976.8,203.6L976,205.7L973.7,206.6L968.6,210.1L966.9,213.6L965.5,213.6L964.4,211.3L959.4,211.1L958.6,207.1L956.8,207.1L957.1,202.1L952.4,198.5L945.7,198.9L941.2,199.6L937.4,195.2L934.3,193.3L928.2,189.8L927.5,189.4L917.5,192.3L917.7,210.4L915.7,210.7L912.9,206.8L910.3,205.4L905.9,206.5L904.2,208.1L904,206.9L904.9,204.9L904.2,203.1L899.7,201.5L897.9,197L895.8,195.8L895.6,194.2L899.4,194.6L899.6,191L902.9,190.2L906.3,191L907,186.2L906.3,183.1L902.4,183.4L899.1,182.2L894.6,184.3L891,185.4L889,184.6L889.4,182L886.9,178.7L884,178.9L880.7,175.5L882.9,171.8L881.8,170.8L884.9,165.4L888.9,168.2L889.4,164.6L897.4,159.3L903.5,159.1L912.1,162.5L916.7,164.5L920.8,162.5L927,162.4L931.9,164.9L933.1,163.5L938.5,163.7L939.5,161.3L933.2,157.9L936.9,155.5L936.2,154.2L939.9,152.9L937.1,149.5L938.9,147.9L953.5,146.1L955.4,144.9L965.1,143.1L968.6,141.1L975.6,142.1L976.8,147.2L980.9,146L985.9,147.7L985.5,150.4L989.3,150.1L999,145.5L997.6,147L1002.6,150.8L1007,157.1L1011.2,163.3L1013.3,160.8L1018.7,163.6L1024.3,162.3L1026.4,163.2L1028.3,166.1L1031,167L1032.7,169.1L1037.7,168.5Z"},{"d":"M917.7,210.4L917.5,192.3L927.5,189.4L928.2,189.8L934.3,193.3L937.4,195.2L941.2,199.6L945.7,198.9L952.4,198.5L957.1,202.1L956.8,207.1L958.6,207.1L959.4,211.1L964.4,211.3L965.5,213.6L966.9,213.6L968.6,210.1L973.7,206.6L976,205.7L977.1,206.2L973.9,209.4L976.7,211.3L979.5,210L984.1,212.6L979.1,216.2L976.2,215.7L974.6,215.8L974,214.5L974.8,212.2L969.6,213.3L968.4,216.5L966.5,219.2L963.3,219L962.3,221.1L965.1,222.3L966,226L963.8,231L960.8,229.9L958.7,229.9L958.8,226.9L953.6,224.8L949.5,222.4L947,220L942.6,216.6L940.7,211.6L939.4,210.7L935.1,210.9L933.7,209.9L933.2,205.9L928,203.3L924.7,206.2L921.4,207.9L922,210.4Z"},{"d":"M1248.3,426.9L1255.1,430.3L1262.3,433.1L1265,435.6L1267.1,438.1L1267.7,441L1274.2,444.1L1275.1,446.7L1271.5,447.2L1272.4,450.5L1275.9,453.7L1278.4,459L1280.6,458.8L1280.5,461L1283.5,461.8L1282.3,462.8L1286.4,464.8L1286,466.3L1283.4,466.6L1282.5,465.3L1279.2,464.8L1275.2,464L1272.2,460.9L1270,458.2L1268,453.9L1262.9,451.7L1259.6,453.1L1257.2,454.7L1257.7,458.4L1254.7,460.1L1252.5,459.2L1248.5,459L1248.4,443ZM1293.6,432.1L1295.1,433.7L1295.5,436.3L1294.3,437.6L1293.6,434.7L1292.7,432.8L1290.9,431.2L1288.7,429.1L1285.9,427.6L1287,426.4L1289.1,427.8L1290.4,428.9L1292,430.1ZM1288.4,442.9L1286.3,444.1L1284.3,445.2L1282.2,445.2L1279,443.8L1276.8,442.4L1277.1,440.9L1280.6,441.6L1282.7,441.2L1283.3,438.9L1283.9,438.7L1284.3,441.4L1286.5,441L1287.6,439.3L1289.7,437.5L1289.3,434.6L1291.6,434.5L1292.4,435.3L1292.4,438.1L1291.1,441.1L1289,441.5ZM1301.8,440.4L1303,441.5L1304.9,444.7L1306.7,446.3L1306.2,447.7L1305.1,448.2L1303.4,446.3L1301.7,443.2L1300.9,439.4L1301.4,438.9Z"},{"d":"M1248.3,426.9L1248.4,443L1248.5,459L1245,455L1241.1,454L1240.1,455.4L1235.2,455.5L1236.8,451.5L1239.3,450.2L1238.3,444.8L1236.4,440.7L1228.8,436.5L1225.6,436.1L1219.8,431.5L1218.7,433.9L1217.2,434.4L1216.3,432.6L1216.3,430.4L1213.3,428L1217.5,426.2L1220.3,426.3L1219.9,425L1214.2,425L1212.7,422.1L1209.2,421.1L1207.6,418.7L1212.8,417.5L1214.8,415.9L1221.1,417.9L1221.7,419.8L1222.8,427.7L1226.8,430.7L1230,425.5L1234.5,422.5L1237.9,422.5L1241.3,424.2L1244.2,426ZM1186,457.9L1186.4,458.9L1186.5,460.4L1183.9,464.1L1180.6,465.2L1180.1,464.6L1180.5,462.9L1182.1,459.9ZM1221.9,448.1L1221.6,444.4L1222.2,442.6L1223.1,440.9L1223.9,442.4L1223.9,444.7ZM1158.4,393.7L1156.2,398.1L1159.1,402.8L1158.4,405.1L1162.8,409.6L1158.2,410.2L1156.9,413.6L1157,418L1153.3,421.4L1153.2,426.3L1151.7,433.9L1151.1,432.1L1146.7,434.3L1145.2,431.3L1142.4,431L1140.4,429.5L1135.8,431.2L1134.4,428.9L1131.9,429.1L1128.6,428.5L1128,421.9L1126.1,420.6L1124.2,416.4L1123.7,412L1124.2,407.5L1126.5,404.2L1127.1,407.5L1129.8,410.3L1132.3,409.3L1134.8,409.6L1137,407.1L1138.9,406.7L1142.6,408.1L1145.7,407L1147.7,400.2L1149.2,398.5L1150.6,392.9L1155.1,392.9ZM1203.1,427.9L1207.4,429.3L1208.8,433.1L1205.5,431.1L1202.3,430.7L1200.1,431L1197.4,430.8L1198.3,428.1ZM1193.4,432.8L1190.7,431.9L1190,429.8L1193.9,429.5L1194.9,431.1ZM1197.5,403.4L1197.8,406.1L1200.1,406.5L1200.5,408.5L1200.2,412.8L1198.2,412.3L1197.7,415.3L1199.3,417.9L1198.2,418.5L1196.6,415.4L1195.4,409.1L1196.2,405.2ZM1178.1,409.8L1182.5,409.6L1186.4,406L1187,407.1L1183.9,412L1181,412.9L1177.3,412L1170.8,412.2L1167.4,412.9L1166.8,416.6L1170.3,421L1172.4,418.8L1179.7,417.1L1179.3,419.4L1177.7,418.7L1176,421.6L1172.5,423.5L1176.2,429.8L1175.5,431.5L1179,437.2L1179,440.4L1176.9,441.9L1175.4,440.1L1177.2,436.1L1173.4,438L1172.5,436.6L1173,434.7L1170.2,431.8L1170.5,427L1167.9,428.5L1168.2,434.3L1168.3,441.3L1165.9,442L1164.2,440.6L1165.3,436.1L1164.7,431.3L1163.1,431.3L1161.9,427.9L1163.5,424.7L1164,420.8L1166,413.3L1166.8,411.3L1170.1,407.6L1173.2,409.1ZM1167.8,464.7L1162.7,461.2L1166.3,460.2L1168.3,461.7L1169.7,463.2L1169.4,464.6ZM1171.9,456.2L1174.5,455.8L1178,454L1177.4,456.7L1171.5,458.1L1166.4,457.5L1166.4,455.7L1169.4,454.7ZM1159.9,455.3L1162.3,454.9L1163.3,457L1158.8,458L1156.1,458.7L1154,458.6L1155.3,455.8L1157.5,455.7L1158.5,454ZM1121.9,445.7L1122.4,447.5L1129.9,448L1130.7,446L1137.9,448.3L1139.4,451.5L1145.2,452.4L1150,455.3L1145.5,457.2L1141.2,455.2L1137.7,455.4L1133.7,455L1130.1,454.1L1125.6,452.2L1122.7,451.8L1121.1,452.4L1114,450.3L1113.3,448.2L1109.7,447.9L1112.4,443.2L1117.1,443.4L1120.3,445.4ZM1105.9,419.4L1106.5,422.9L1107.9,425.6L1110.8,426.1L1112.6,429.2L1111.7,435.3L1111.5,442.9L1107.2,443L1103.9,438.9L1098.9,434.9L1097.3,431.9L1094.3,427.9L1092.4,424.2L1089.4,417.3L1086,413.2L1084.9,408.9L1083.4,405.1L1079.9,402L1077.9,397.8L1075,395L1070.9,389.6L1070.6,387.1L1073.1,387.3L1079.1,388.2L1082.5,393L1085.6,396.4L1087.7,398.4L1091.4,403.7L1095.3,403.8L1098.6,407.2L1100.9,411.3L1103.8,413.6L1102.3,417.6L1104.5,419.3Z","u":"indonesia"},{"d":"M433.1,673.6L434.6,675.8L436.5,679.5L441.6,682.5L447,683.7L445.3,686.2L441.6,686.4L439.6,684.7L437.3,684.6L433.1,684.6ZM475.9,563L474.9,567L473.9,572.1L473.9,577L473.1,578.1L472.8,581.2L472.5,583.8L477.5,588L476.9,591.4L479.4,593.6L479.2,596L475.4,602.3L469.6,605L461.9,606L457.6,605.5L458.4,608.4L457.6,612.1L458.3,614.6L456,616.3L452,617L448.3,615.2L446.8,616.5L447.3,621.4L449.9,622.9L452.1,621.3L453.2,623.9L449.6,625.4L446.5,628.5L445.9,633.5L445,636.1L441.4,636.1L438.3,638.6L437.2,642.3L441,645.9L444.7,646.9L443.4,651.4L438.8,654.1L436.3,659.9L432.7,661.9L431.1,664.2L432.4,669.3L435,672.1L433.3,671.9L429.7,671.1L420.3,670.5L418.7,667.6L418.8,663.9L416.2,664.2L414.8,662.4L414.5,657.2L417.5,655L418.7,651.9L418.3,649.4L420.3,645.2L421.7,638.7L421.3,635.8L423,634.9L422.6,633L420.8,632L422.1,629.9L420.3,628.1L419.4,622.4L421,621.4L420.3,615.4L421.2,610.3L422.3,605.9L424.6,604.1L423.4,599.3L423.4,594.8L426.4,591.6L426.3,587.5L428.5,582.6L428.5,578.1L427.5,577.2L425.7,568.7L428.1,563.6L427.7,558.9L429.1,554.4L431.7,549.7L434.4,546.7L433.2,544.8L434.1,543.2L433.9,534.9L438.2,532.5L439.5,527.4L439,526.2L442.3,521.7L447.4,522.9L449.6,526.5L451.2,522.5L455.6,522.7L456.2,523.8L463.4,531.8L466.6,532.6L471.3,536.2L475.3,538.1L475.9,540.3L472,547.8L476,549.1L480.3,549.9L483.4,549.1L486.9,545.3L487.6,541L489.5,540L491.4,542.9L491.4,546.8L488.1,549.5L485.5,551.5L481.1,556.3Z","u":"argentina"},{"d":"M433.1,673.6L433.1,684.6L437.3,684.6L439.6,684.7L438.3,686.7L435,688.2L433.1,688.1L430.8,687.7L427.9,686.2L423.9,685.5L419,682.7L415,680.1L409.6,674.6L412.9,675.6L418.3,678.9L423.5,680.7L425.5,678.4L426.7,675L430.3,673ZM429.4,500.7L431.3,504.1L431.8,507.7L433.8,509.7L432.6,514.5L434.7,520L436.2,526.8L439,526.2L439.5,527.4L438.2,532.5L433.9,534.9L434.1,543.2L433.2,544.8L434.4,546.7L431.7,549.7L429.1,554.4L427.7,558.9L428.1,563.6L425.7,568.7L427.5,577.2L428.5,578.1L428.5,582.6L426.3,587.5L426.4,591.6L423.4,594.8L423.4,599.3L424.6,604.1L422.3,605.9L421.2,610.3L420.3,615.4L421,621.4L419.4,622.4L420.3,628.1L422.1,629.9L420.8,632L422.6,633L423,634.9L421.3,635.8L421.7,638.7L420.3,645.2L418.3,649.4L418.7,651.9L417.5,655L414.5,657.2L414.8,662.4L416.2,664.2L418.8,663.9L418.7,667.6L420.3,670.5L429.7,671.1L433.3,671.9L429.9,671.9L428,673.1L424.5,674.9L423.9,679.5L422.2,679.6L417.8,678L413.4,674.5L408.5,671.7L407.3,668.6L408.4,665.7L406.5,662.4L406,654L407.6,649.3L411.7,645.5L405.8,644L409.5,639.7L410.8,631.5L415.2,633.2L417.2,623L414.6,621.7L413.4,627.9L410.9,627.2L412.2,620.1L413.5,611L415.3,607.6L414.1,602.8L413.8,597.2L415.5,597.1L417.8,589.1L420.5,581.2L422.2,573.9L421.3,566.5L422.5,562.4L422,556.4L424.3,550.3L425,540.8L426.2,530.6L427.4,519.5L427.1,511.5L426.3,504.5L428.3,503.3Z"},{"d":"M814.1,436.3L814.8,440.8L814.4,443.4L815.2,446.2L817.4,449L819.5,455.2L818,454.7L812.8,455.5L811.7,456.1L810.6,459.3L811.5,461.4L810.8,467.3L810.3,472.2L811.4,473.1L814.1,475L815.2,474.1L815.5,479.4L812.5,479.4L810.9,476.7L809.5,474.6L806.5,473.9L805.6,471.3L803.3,472.9L800.2,472.2L798.8,469.9L796.4,469.5L794.6,469.6L794.3,468.1L793,467.9L791.2,467.7L788.8,468.4L787.1,468.3L786.2,468.7L786.4,462.9L785.1,461L784.8,458L785.4,455L784.6,453.1L784.5,450L779.8,450.1L780.1,448.3L778.1,448.3L777.9,449.2L775.5,449.4L774.5,452.2L774,453.5L771.8,452.8L770.5,453.5L768,453.9L766.5,451.3L765.6,449.7L764.5,446.7L763.5,443.1L752,443L750.6,443.6L749.5,443.5L747.9,444.2L747.4,442.6L748.4,442.1L748.5,440L749.1,438.7L750.5,437.7L751.6,438.2L752.9,436.3L755,436.3L755.3,437.7L756.7,438.6L759,435.5L761.3,433.1L762.3,431.5L762.1,427.5L763.8,422.7L765.6,420.1L768.1,417.8L768.6,416.2L768.7,414.4L769.3,412.7L769.1,409.9L769.6,405.5L770.4,402.4L771.5,399.8L771.8,396.8L772.1,393.4L773.6,390.9L775.7,389.3L778.9,391L781.4,392.8L784.2,393.3L787.1,394.2L788.3,391.2L788.8,390.9L790.6,391.4L794.9,388.9L796.5,389.9L797.7,389.8L798.3,388.6L799.8,388.2L802.7,388.7L805.2,388.8L806.5,388.3L808.8,392.4L810.6,392.9L811.6,392.1L813.4,392.4L815.6,391.4L816.5,393.5L819.9,396.8L819.7,402.6L821.2,403.2L820,405L818.5,406.3L817,408.9L816.2,411.1L816,415.1L815.1,417L815,420.7L813.9,422.1L813.8,425L813.2,425.4L812.9,428.1L813.9,430.3Z"},{"d":"M861.7,422.4L859.4,418.3L859.4,400.4L862.8,394.8L863.8,393.2L866.3,393.1L869.8,389.6L874.9,389.4L885.8,374.6L888.6,370.5L890.3,367.5L890.3,364.9L890.3,359.9L890.3,357.9L890.4,357.8L891.6,357.7L893.4,357L895.4,356.5L897.3,354.8L898.8,354.8L898.9,356.2L898.5,359L898.5,361.6L897.7,363.4L896.6,368.7L894.7,374.2L892.3,380.5L889,387.8L885.7,393.3L881.1,400L877.2,404L871.4,408.9L867.8,412.6L863.5,418.6L862.6,421.2Z"},{"d":"M852.5,437.1L846.9,432.2L846.6,429.4L832.5,419.3L831.8,418.8L831.8,413.5L832.9,411.5L834.8,408.3L836.3,404.7L834.5,399L834.1,396.6L832.2,393.1L834.6,390.2L837.3,386.9L839.3,387.8L839.3,390.5L840.6,392.2L843.3,392.2L848.3,396.3L849.5,396.4L850.4,396.3L851.3,396.8L853.8,397.2L855,395.2L858.5,393.1L860.1,394.8L862.8,394.8L859.4,400.4L859.4,418.3L861.7,422.4L859,424.4L858,426.4L856.6,426.8L856,430.2L854.8,432.2L854,435.5Z"},{"d":"M795.5,373.5L792.6,371.4L791.2,369.9L791,368.4L791.6,366.4L791.6,364.3L789.4,361.3L788.9,359.2L789,358L787.5,356.5L787.5,353.6L786.7,351.7L785.3,352L785.7,350.2L786.7,348.2L786.3,346.1L787.6,344.6L786.7,343.5L787.8,340.4L789.5,336.8L792.9,337.1L792.7,317.6L792.7,315.5L797.2,315.5L797.2,305.6L812.9,305.6L827.9,305.6L843.4,305.6L844.6,310.5L843.8,311.4L844.3,316.4L845.8,322.3L847.2,323.5L849.4,325.4L847.4,328.2L844.5,329L843.3,330.5L842.9,333.8L841.3,341L841.7,343L841,347.2L839.5,352.1L837.1,354.5L835.5,358.3L835.1,360.3L833.2,361.7L832.1,366.8L832.1,371.3L832.1,367.4L831.5,367.3L831.6,364.9L831.1,363.2L829.1,361.2L828.7,357.7L829.1,354L827.3,353.7L827.1,354.8L824.7,355.1L825.7,356.5L826,359.5L823.9,362.2L821.9,365.7L819.9,366.2L816.7,363.4L815.2,364.4L814.8,365.8L812.8,366.7L812.7,367.8L808.8,367.8L808.2,366.7L805.4,366.6L804,367.4L803,367L801,364.1L800.3,362.8L797.5,363.4L796.4,365.7L795.4,370.1L794.1,371.1L792.9,371.6Z"},{"d":"M792.7,317.6L792.9,337.1L789.5,336.8L787.8,340.4L786.7,343.5L787.6,344.6L786.3,346.1L786.7,348.2L785.7,350.2L785.3,352L786.7,351.7L787.5,353.6L787.5,356.5L789,358L788.9,359.2L786.5,360L784.5,362L781.7,367.4L778,369.7L774.3,369.4L773.2,369.8L773.6,371.5L771.5,373.3L769.9,375.2L765,377.1L764,376L763.4,375.9L762.6,377.1L759.4,377.5L760,376.2L758.8,372.8L758.3,370.7L756.6,369.9L754.3,367L755.1,364.7L756.9,365.2L758,364.8L760.2,364.9L758,360.4L758.2,357.1L757.9,353.8L756.4,350.7L756.8,348.4L754.3,348.3L754.3,345.1L752.7,343.3L754.3,336.8L759.3,332.1L759.5,325.7L761,315.7L761.8,313.6L760.2,311.9L760.2,310.3L758.7,309L757.8,301.4L761.7,298.7L777.2,308.1Z"},{"d":"M421.1,316.9L421.5,319.6L421.2,321.5L420.2,322.3L421.2,323.8L421.1,325.1L418.5,324.3L416.7,324.6L414.3,324.3L412.5,325.2L410.4,323.7L410.8,322.1L414.4,322.8L417.3,323.2L418.7,322.1L416.9,319.9L417,318L414.5,317.3L415.4,315.9L417.8,316.1Z"},{"d":"M421.1,325.1L421.2,323.8L420.2,322.3L421.2,321.5L421.5,319.6L421.1,316.9L421.6,316.1L424.6,316.1L426.9,317.4L428,317.2L428.7,319L430.8,318.9L430.7,320.4L432.4,320.5L434.3,322.3L432.9,324.3L431,323.3L429.2,323.5L428,323.2L427.3,324.1L425.8,324.4L425.2,323.2L423.9,324L422.3,327.3L421.3,326.5Z"},{"d":"M1064.7,14.7L1073.1,13.6L1080.7,16L1085.4,18.4L1089.6,20.8L1088.7,25.2L1080.2,25.8L1069.3,24.4L1062.9,22.5L1059.9,19L1054.6,18ZM1099.9,23.3L1109.8,26.1L1108.6,28.1L1086.7,30L1090.1,26.7L1093.8,23.5L1097,22.9ZM1239.9,38.8L1250.2,39L1264.2,41.6L1261.2,45.3L1246.8,45.1L1240.4,46.3L1232.7,43.1L1234.8,39.7ZM1276.4,42.7L1286.2,44L1281.7,45.9L1275.5,45.5L1268.2,43.5L1269.2,41.9ZM1243.9,52.4L1247.6,50.5L1252.5,50L1258,51.9L1258.5,53.2L1252.6,53.2L1244.6,52.7ZM874.4,16.8L882,15.9L887.9,15.9L888.7,17.2L890.9,16L894.6,15.2L900.4,16.3L898.9,17L893.6,17.7L890.1,18L889.6,18.9L885.1,19.7L880.8,18.5L883.1,17ZM788.4,146.3L781.3,146.3L776.5,145.8L777.3,143.6L782.7,142L786.8,142.9L788.5,143.7L788.1,145ZM908.1,50.5L917.4,46.2L916.4,44L925,41.4L937.9,38.2L950.8,37.3L957.5,35.4L965.1,34.8L967.8,36.8L965.1,38.3L951.4,40.7L939.5,43.1L927.4,47.8L921.6,52.6L915.5,57.3L916.3,61.4L923.7,65.5L921.4,65.9L908.7,65.3L907.7,63.1L900.7,61.7L900.1,59.1L904.1,58L903.9,55.3L911.7,51.1ZM1255.8,149.3L1257.1,154.1L1257,158.9L1258.6,163.9L1262.5,172.7L1256.8,171L1254.4,178.2L1258.2,183.2L1258.1,186.6L1255.1,183.7L1252.6,187.5L1251.9,183.3L1252.3,178.6L1251.9,173.2L1252.7,169.5L1252.9,162.9L1250.6,158.1L1251,151.3L1254.6,149.1L1253,146.8L1254.8,146.1ZM0,74.1L0,74.1L9.5,77.9L19.7,82.8L19.4,85.9L22,87.1L21.1,83.5L31.7,84.2L39.3,88.8L35.4,91L29.1,91.5L29,96.3L27.4,97.3L23.8,97.2L20.8,95.5L15.6,94L14.8,91.9L10.8,91.1L6.4,91.7L4.3,90L5.1,88.2L0.4,89.3L2.2,91.7L0,93.8L0,93.8L0,74.1ZM1400,93.8L1400,93.8L1395,96L1389.9,95.6L1393.4,98.2L1395.8,102.3L1397.6,103.6L1398,105.6L1397,107L1389.8,105.9L1378.9,109.6L1375.4,110.2L1369.5,113.6L1363.8,116.6L1362.4,118.9L1356.8,115.5L1346.7,119.4L1344.9,117.5L1341.2,119.6L1336,119L1334.7,122.2L1330.1,127L1330.2,129L1334.6,130.1L1334.1,137.2L1330.5,137.4L1328.8,141.5L1330.5,143.7L1323.7,146.2L1322.3,151.8L1316.5,153L1315.3,158L1309.7,162.6L1308.3,159.2L1306.6,152L1304.5,141.1L1306.3,134.2L1309.6,131.3L1309.8,129L1315.9,127.9L1322.8,121.7L1329.5,116.6L1336.5,112.7L1339.6,105.7L1334.9,106.2L1332.6,110.2L1322.7,115.6L1319.5,109.6L1309.5,111.2L1304.5,115.3L1299.7,119.5L1303,122.5L1294.3,123.8L1288.3,124.3L1288.5,120.8L1282.5,120L1277.7,122.4L1265.8,121.6L1253,123L1246.5,127.8L1240.4,132.7L1232.7,138.4L1225.5,144.3L1231.6,144.9L1233.5,148L1237.3,149.1L1239.8,146.6L1244.1,147L1249.7,152.4L1249.8,156.6L1246.8,161.5L1246.4,167.4L1244.7,175.3L1238.8,182.4L1237.5,185.8L1232.2,191.6L1227,197.2L1224.5,200.2L1219.3,203L1216.9,203.1L1214.4,200.7L1209.2,204.3L1208.6,206L1208.6,206L1208,205.1L1208,202.6L1210,202.5L1210.6,196.6L1209.5,192.4L1212.9,190.7L1217.6,191.5L1220.2,186.7L1221.6,181.3L1223.1,179.5L1225.1,175.1L1218.7,176.6L1215.3,178.5L1209.4,178.5L1207.8,173.9L1203.2,170.4L1196.5,168.8L1195,164L1193.7,160.9L1192.2,158.8L1189.8,153.8L1186.4,152L1180.6,150.6L1175.4,150.7L1170.6,151.6L1167.4,154L1169.5,155.2L1169.5,157.9L1167.4,159.5L1163.9,164.7L1163.9,166.9L1158.4,170L1153.8,168.2L1149.1,168.6L1147.1,166.9L1144.7,166.4L1139.1,169.9L1133.9,170.7L1130.4,171.9L1125.5,171.1L1121.8,171.1L1119.5,168.6L1115.7,166.3L1111.8,165.6L1106.9,166.3L1103.2,167.2L1097.7,165.1L1096.9,161.4L1092.3,160.1L1088.8,159.6L1084.5,157.5L1080.4,162.6L1082,165.5L1078.2,169L1072.6,167.7L1068.7,167.5L1066.1,165.2L1062.1,165.2L1058.7,163.6L1052.8,166L1045.3,170.2L1041.3,171.1L1039.7,171.5L1037.7,168.5L1032.7,169.1L1031,167L1028.3,166.1L1026.4,163.2L1024.3,162.3L1018.7,163.6L1013.3,160.8L1011.2,163.3L1007,157.1L1002.6,150.8L997.6,147L999,145.5L989.3,150.1L985.5,150.4L985.9,147.7L980.9,146L976.8,147.2L975.6,142.1L968.6,141.1L965.1,143.1L955.4,144.9L953.5,146.1L938.9,147.9L937.1,149.5L939.9,152.9L936.2,154.2L936.9,155.5L933.2,157.9L939.5,161.3L938.5,163.7L933.1,163.5L931.9,164.9L927,162.4L920.8,162.5L916.7,164.5L912.1,162.5L903.5,159.1L897.4,159.3L889.4,164.6L888.9,168.2L884.9,165.4L881.8,170.8L882.9,171.8L880.7,175.5L884,178.9L886.9,178.7L889.4,182L889,184.6L891,185.4L889.2,188.3L885.4,189.1L881.5,194.2L885.1,198.9L884.7,202.2L888.9,208L886.6,210L885.9,211.2L884.2,210.9L881.6,207.9L880.5,207.7L878,206.6L876.8,204.6L873.2,203.5L870.8,204.3L870.2,203.4L864.9,201L859.1,200.2L855.9,199.4L855.4,200L850.4,195.8L846,193.9L842.6,191L845.5,190.3L848.7,186.1L846.5,184.2L852.2,182.2L852.1,181.1L848.6,181.9L848.8,179.7L850.8,178.3L854.5,178L855.2,176.3L854.3,173.6L855.9,171L855.8,169.6L850.1,168L847.8,168L845.4,165.7L842.4,166.5L837.5,164.8L837.6,163.8L836.2,161.7L833.1,161.4L832.8,159.9L833.8,158.9L831.3,156.1L827.2,156.6L826.1,156.3L825.1,157.4L823.6,157.2L822.7,154.1L821.7,152.5L822.5,152L825.6,152.2L827.1,151.1L826,149.8L823.4,148.9L823.6,148L822,147.1L819.6,143.9L820.5,142.6L820.1,140.2L816.3,139.1L814.2,139.7L813.7,138.4L809.6,137.2L808.3,134.3L808,131.9L806.1,130.8L807.8,129.2L806.6,124.6L809.4,121.8L808.8,120.9L813.2,118.2L809.2,115.8L817.5,109.5L821.1,106.7L822.6,104.2L816.8,100.8L818.4,97.6L814.9,93.9L817.5,89.7L813,84.1L816.6,80.4L810.6,77.1L811.2,73.6L814.3,73.2L821,71.2L825,69.5L831.3,72.5L842,73.6L849.5,76.4L856.7,79.2L859.7,81.5L859.9,84.8L855.6,87.4L849.3,88.7L840.7,86.8L831.9,85L829,85.6L835.4,89.2L835.6,91.5L835.9,96.5L840.9,98.1L843.9,99.3L844.4,96.9L842.1,94.8L844.6,93L854,96L857.2,94.8L854.6,91.2L863.7,86.4L867.3,86.7L870.9,88.4L873.2,85L869.9,82.1L871.8,79.1L869,76.1L879.9,77.6L882.1,80.4L877.2,81L877.2,83.8L880.2,85.4L886.3,84.4L887.2,81.2L895.3,78.9L908.9,74.6L911.8,74.9L908,77.9L912.8,78.4L915.6,76.7L922.9,76.6L928.7,74.5L933.1,77.5L937.5,74.2L933.4,71.4L935.5,69.8L947,71.2L952.3,72.8L959.6,75.6L966.4,78.4L969,75.8L965.1,73.2L965,72.2L960.3,71.7L961.6,69.4L959.5,65.5L959.4,63.9L966.5,59.5L969.1,55L972,54L982.3,55.3L983.1,58.1L979.4,62.1L981.8,63.6L983.1,67.1L982.2,73.8L986.5,76.9L984.8,80.2L977.2,87.2L981.6,87.9L983.2,86.1L987.5,84.8L988.5,82.4L991.9,80.1L989.6,77.3L991.4,74L987.2,73.6L986.2,70.9L989.3,65.9L984.3,61.9L991.2,58.6L990.3,55L992.3,54.9L994.3,57.7L992.8,62.4L997,63.3L995.2,59.8L1001.7,57.8L1009.8,57.6L1016.9,60.4L1013.5,56.3L1013.1,51L1019.9,50L1029.2,50.3L1037.6,49.6L1034.5,47L1039,43.8L1043.4,43.7L1051,41.2L1061.3,40.6L1062.6,39.2L1072.8,38.7L1076,39.9L1084.7,37.2L1091.8,37.3L1092.9,35.2L1096.6,33.1L1105.8,31.1L1112.5,32.7L1107.2,33.9L1116,34.6L1117,37.1L1120.6,35.9L1132,35.9L1140.7,38.3L1143.9,40.2L1142.9,42.8L1138.6,44.2L1128.4,46.9L1125.4,48.4L1130.3,49.1L1136,50.3L1139.5,49.4L1141.5,52.6L1143.2,51.3L1149.4,50.5L1161.9,51.3L1162.9,53.6L1179.1,54.4L1179.3,50.6L1187.6,51.5L1193.8,51.4L1200.1,54L1201.9,57.2L1199.6,59.3L1204.4,63.1L1210.6,65.1L1214.3,60L1220.6,62.2L1227.2,60.9L1234.7,62.4L1237.6,61L1243.9,61.7L1241.1,57.1L1246.3,55L1264.1,56.3L1281.4,58.2L1284.7,61.1L1294.9,64.9L1310.6,63.9L1318.3,64.7L1321.6,66.8L1321.1,70.4L1325.9,71.8L1331.1,70.8L1338,70.7L1345.3,71.6L1352.7,71.1L1359.5,75.5L1364.3,73.9L1361.2,70.7L1362.9,68.5L1375.3,69.9L1383.4,69.6L1394.6,72L1400,74.1L1400,93.8ZM1400,64.9L1395.7,65.2L1395,63.6L1400,61.5L1400,64.9ZM0,61.5L0,61.5L0,61.5L0.5,61.3L3.8,61.3L9.4,62.8L9.1,63.4L5.1,64.6L0,64.9L0,64.9L0,61.5ZM830,187.5L831,186.2L833.8,187.3L835.1,187.5L835.6,188.5L836.2,188.6L836.2,189L838.1,190.2L842.1,189.9L841.3,191.7L837,192.6L831.8,195.4L829.6,194.4L830.5,192.1L826.2,190.6L826.9,189.7L830.6,188.1Z"},{"d":"M392.9,282L394.7,281.6L397.3,281.8L397.4,283.1L393.1,283.8ZM397.5,280.8L400.6,283L399.9,286.5L399.2,285.9L399.2,283.3L397.5,281.4ZM395.9,289.8L397.1,290L398.5,294.1L398.5,297L397.5,297.2L396.5,294.4L395.1,292.9Z"},{"d":"M462,669.7L466.7,666.7L470,668L472.3,666L475.4,668.2L474.3,669.9L469,671.4L467.3,669.7L464,671.9Z"},{"d":"M758.9,21.3L760.4,19.6L766.1,19.5L771,21.2L783.8,24.9L774,26.8L771.8,30.4L768.4,31.4L766.6,35.4L761.9,35.6L753.5,32.6L757,30.9L751.2,29.5L743.6,25.3L740.6,21.4L751.2,19.7L753.3,21.4ZM821,71.2L814.3,73.2L811.2,73.6L812.8,70.2L807.9,68.2L801.8,69.9L799.9,73.5L796.2,75.7L792,74.5L786.9,74.7L782.6,72.1L780.3,73.4L777.9,73.6L777.3,76.9L770,76.1L768.9,78.8L765.2,78.8L762.6,82.3L758.8,87.8L752.7,94.7L754.1,96.4L752.8,98.4L748.9,98.3L746.4,102.9L746.6,109.4L749.1,111.9L747.8,117.7L744.6,121.1L742.9,124L740.3,120.9L732.6,126.6L727.4,127.8L722,125.3L720.6,120L719.4,108.6L723,105.4L733.3,101.3L740.9,96.2L748.1,89.3L752.5,84.5L757.4,79.8L763.9,76.1L769.1,73L774.6,69.9L783.1,67.8L789.5,68L795.5,63.9L802.5,64.2L809.5,63.2L821.7,66.8L816.7,68.1ZM806.6,19.4L800.8,22.1L789.5,22.7L778.1,21.9L777.4,20.5L771.8,20.4L767.5,18.1L779.6,16.8L785.2,18L789.1,16.5L799,17.7ZM796.1,30.3L787.5,32.3L780.6,31.2L783.3,29.9L780.9,28.3L789,27.3L790.5,29.2Z"},{"d":"M518.1,6.8L531.2,3.8L544.8,4L549.8,2.2L563.5,1.7L594.6,2.4L607.5,4.3L618.9,6.3L611.8,8.2L596.9,8.4L575.9,8.9L577.9,9.8L591.7,9.2L603.4,10.9L610.9,9.4L614.2,11.2L609.9,14L619.8,12.2L638.7,10.3L650.3,11.2L652.5,13.4L636.7,16.9L634.5,18L622,18.8L631,19.1L626.5,22.7L623.4,25.9L623.5,31.4L628.2,34.6L622.1,34.8L615.7,36.3L622.9,39L623.8,43.1L619.6,43.6L624.7,47.8L616,48.2L620.5,50.2L619.3,51.9L613.8,52.7L608.3,52.7L613.2,56L613.3,58.2L605.6,56.2L603.6,57.5L608.8,58.8L613.9,61.8L615.4,65.7L608.5,66.7L605.5,64.8L600.7,62L602,65.3L597.5,67.9L607.7,68.1L613.1,68.4L602.7,72.7L592.1,76.6L580.7,78.3L576.4,78.3L572.4,80.2L567,85.4L558.6,88.8L555.9,89L550.8,90.3L545.2,91.4L541.8,94.4L541.8,97.9L539.8,101.1L533.5,105.1L535,108.9L533.3,113L531.3,117.8L525.8,118.1L520.1,114.1L512.3,114.1L508.5,111.4L505.9,106.6L499.2,100.4L497.2,97.2L496.7,92.8L491.3,88.2L492.7,84.6L490.1,82.9L494,77.1L499.8,75.3L501.4,73.2L502.2,69.4L497.7,71.1L495.6,71.8L492.1,72.5L487.3,70.9L487.1,67.6L488.6,65L492.2,64.9L500.2,66.2L493.5,63.1L490,61.4L486.1,62.1L482.9,60.9L487.2,56.3L484.8,54.4L481.8,51L477.1,45.8L472.1,43.9L472.2,41.8L461.7,38.9L453.5,38.6L443.1,38.8L433.6,39.1L429.1,37.6L422.3,34.5L432.5,32.9L440.4,32.7L423.7,31.4L415,29.4L415.5,27.4L430.2,25.1L444.5,22.7L446,20.9L435.5,19.1L438.9,17.2L452.3,13.7L458,13.2L456.4,11L465.6,9.7L477.5,8.9L489.5,8.9L493.7,10.4L504,7.7L513.3,9.5L518.8,9.9L526.9,11.5L517.6,8.9Z"},{"d":"M968.1,653.8L970.6,655.3L974.3,656L974.4,656.9L973.3,659.1L967.3,659.5L967.2,656.8L967.8,654.8Z"},{"d":"M1186,457.9L1186.4,456.8L1189.8,455.6L1192.5,455.5L1193.7,454.9L1195.2,455.5L1193.8,456.8L1189.7,459L1186.5,460.4L1186.4,458.9Z"},{"d":"M763.6,555L765.4,552.5L767,553.9L767.6,556L769.4,556.3L771.8,557.3L773.9,556.9L777.4,554.4L777.4,536.2L778.4,536.9L780.7,541.6L780.4,544.6L781.2,546.3L784,545.8L786,543.6L787.8,542.2L788.8,539.8L790.7,538.7L792.3,539.2L794.2,540.6L797.3,540.9L799.8,539.7L800.2,538.2L800.9,535.8L803,535.4L804.2,533.6L805.5,530.3L809,526.6L814.5,523L816,523L817.9,523.9L819.2,523.3L821.3,523.8L823.2,530.7L824.2,534.2L823.5,539.7L823.8,541.5L821.9,540.6L820.7,540.9L820.4,542.4L819.3,544.2L819.3,545.9L821.7,548.6L823.9,548.1L824.7,545.9L827.7,545.9L826.7,549.5L826.2,553.6L825.2,555.8L822.6,558.3L821.8,559L820.2,561.5L819.1,564.1L816.9,567.6L812.5,572.7L809.7,575.6L806.8,577.9L802.7,579.8L800.8,580.1L800.3,581.4L797.9,580.7L796,581.6L791.8,580.7L789.4,581.3L787.8,581L783.8,583L780.5,583.7L778.1,585.6L776.3,585.7L774.6,584L773.3,583.9L771.6,581.7L771.5,582.4L770.9,581L771,578.2L769.7,574.8L771,573.9L770.9,570.2L768.3,565.6L766.4,561.4L766.4,561.4ZM812.7,556.8L811,555.3L809.2,556.3L807.1,558.2L805,561.4L807.9,565.2L809.3,564.7L810,563.1L812.2,562.3L812.8,560.7L814,558.3Z"},{"d":"M812.7,556.8L814,558.3L812.8,560.7L812.2,562.3L810,563.1L809.3,564.7L807.9,565.2L805,561.4L807.1,558.2L809.2,556.3L811,555.3Z"},{"d":"M244.5,253.7L248.9,253.3L253.9,252.8L253.5,253.8L259.4,256.1L268.2,259.6L276,259.6L279.1,259.6L279.1,257.5L285.8,257.5L287.2,259.3L289.2,260.9L291.5,263L292.8,265.6L293.8,268.3L295.8,269.8L299,271.3L301.5,267.4L304.6,267.3L307.4,269.3L309.3,272.6L310.7,275.5L313,278.3L313.8,281.8L314.9,284.1L318,285.6L320.7,286.7L322.2,286.6L320.7,290.9L320,294.4L319.8,301L319.4,303.4L320.1,306.1L321.3,308.5L322,312.4L324.6,316L325.5,318.8L327.1,321.3L331.2,322.6L332.8,324.6L336.2,323.3L339.2,322.8L342.1,321.9L344.5,321L347,319L347.9,316.1L348.2,312L348.9,310.6L351.5,309.3L355.7,308.1L359.1,308.3L361.5,307.9L362.4,308.9L362.3,311.3L360.2,314.2L359.3,317.2L360,318.1L359.4,320.2L358.4,324.1L357.4,322.8L356.6,322.9L355.9,323L354.5,325.9L353.8,325.3L353.3,325.6L353.3,326.3L349.7,326.2L346.1,326.2L346.1,329L344.3,329L345.8,330.7L347.2,331.8L347.7,332.9L348.3,333.2L348.2,334.9L343.2,334.9L341.3,338.9L341.9,339.8L341.4,341L341.3,342.4L336.9,337.1L334.9,335.5L331.8,334.2L329.6,334.6L326.5,336.4L324.5,336.9L321.8,335.6L318.8,334.7L315.2,332.4L312.3,331.7L307.9,329.4L304.6,327.1L303.6,325.8L301.5,325.5L297.5,323.9L295.9,321.7L291.7,318.9L289.7,315.8L288.8,313.3L290.1,312.9L289.7,311.5L290.6,310.2L290.6,308.5L289.3,306.3L289,304.3L287.7,301.8L284.2,296.9L280.3,293.1L278.4,290L275.1,288L274.4,286.8L275,283.7L273,282.6L270.7,280.2L269.7,276.7L267.6,276.3L265.4,273.8L263.6,271.3L263.4,269.8L261.3,266.1L259.9,262.3L260,260.4L257.2,258.5L255.9,258.7L253.6,257.3L253,259.3L253.7,261.7L254,265.4L255.4,267.4L258.3,270.8L258.9,272L259.5,272.3L260,274L260.7,274L261.5,277.1L262.7,278.4L263.5,280.1L265.9,282.6L267.2,287.2L268.4,289.4L269.5,291.7L269.7,294.3L271.5,294.5L273.1,296.7L274.5,298.9L274.4,299.8L272.8,301.6L272.1,301.6L271.1,298.6L268.5,295.8L265.7,293.4L263.7,292.1L263.9,288.5L263.3,285.9L261.4,284.3L258.8,282.1L258.2,282.8L257.3,281.5L254.9,280.3L252.6,277.4L252.8,277.1L254.5,277.3L255.9,275.5L256,273.3L253,269.7L250.8,268.4L249.3,265.3L247.9,262.1L246.1,258.1Z","u":"mexico"},{"d":"M475.9,563L478.4,562.5L482.3,566.3L483.8,566.2L487.8,569.3L490.8,572.1L493.1,575.4L491.4,577.8L492.4,580.5L490.7,583.6L486.4,586.4L483.5,585.4L481.4,585.9L477.8,583.8L475.2,584L472.8,581.2L473.1,578.1L473.9,577L473.9,572.1L474.9,567Z"},{"d":"M492.4,580.5L491.4,577.8L493.1,575.4L490.8,572.1L487.8,569.3L483.8,566.2L482.3,566.3L478.4,562.5L475.9,563L481.1,556.3L485.5,551.5L488.1,549.5L491.4,546.8L491.4,542.9L489.5,540L487.6,541L488.3,538.1L488.9,535.2L488.9,532.5L487.5,531.6L486,532.4L484.6,532.2L484.1,530.3L483.7,525.8L483,524.3L480.4,523L478.8,523.9L474.7,523L474.9,516.3L473.8,513.5L475,512.5L474.6,509.7L475.7,507.6L476.4,503.7L475.5,500.6L473.4,499.2L472.9,497.3L473.5,494.4L466.1,494.2L464.6,488.5L465.7,488.4L465.6,486.3L464.9,484.8L464.7,482L462.5,480.5L460,480.6L458.4,479.1L455.8,478.2L454.2,476.3L449.9,475.5L445.7,471.1L446,467.8L445.5,465.9L445.9,462.2L440.8,463L438.8,464.9L435.4,466.9L434.5,468.4L432.5,468.5L429.6,468.1L427.4,468.9L425.6,468.4L425.9,460.9L422.7,463.8L419.3,463.6L417.8,461L415.2,460.7L416.1,458.6L413.9,455.6L412.3,451.2L413.3,450.3L413.3,448.2L415.7,446.8L415.3,444.1L416.3,442.4L416.5,440.1L421,436.7L424.2,435.8L424.7,435L428.2,435.3L429.9,421.8L430,419.6L429.4,416.8L427.7,415L427.7,411.4L429.9,410.6L430.7,411.1L430.8,409.2L428.5,408.7L428.5,405.6L436.1,405.7L437.4,404L438.4,405.6L439.2,408.5L439.9,407.9L442.1,410.5L445.1,410.2L445.8,408.7L448.7,407.5L450.3,406.7L450.8,404.6L453.6,403.2L453.4,402.2L450.1,401.8L449.5,398.7L449.7,395.4L447.9,394.1L448.7,393.6L451.5,394.3L454.6,395.5L455.8,394.3L458.6,393.6L462.9,391.7L464.3,389.8L463.8,388.5L465.8,388.2L466.7,389.4L466.2,391.5L467.6,392.3L468.5,394.6L467.4,396.3L466.8,400.5L467.8,403L468,405.3L470.4,407.6L472.4,407.8L472.8,406.9L474,406.7L475.8,405.8L477,404.5L479.2,404.9L480.1,404.7L482.2,405.1L482.6,404.1L481.9,403.1L482.3,401.7L483.9,402.2L485.7,401.6L488,402.7L489.7,403.7L490.9,402.4L491.7,402.6L492.3,404L494.1,403.6L495.6,401.7L496.8,398.1L499.1,393.6L500.4,393.4L501.4,396.1L503.6,404.7L505.7,405.5L505.8,408.9L502.8,413L504,414.5L510.9,415.2L511.1,420.2L514,417L518.9,418.7L525.4,421.7L527.3,424.6L526.6,427.3L531.2,425.8L538.7,428.4L544.5,428.2L550.3,432.3L555.2,437.9L558.2,439.3L561.6,439.5L563,441L564.3,447.3L564.9,450.3L563.4,458.4L561.4,461.6L555.9,468.5L553.5,474.1L550.6,478.4L549.6,478.5L548.5,482.1L548.8,491.3L547.7,498.9L547.3,502.2L546.1,504.1L545.4,510.7L541.4,517.1L540.8,522.2L537.6,524.4L536.7,527.3L532.5,527.3L526.4,529.2L523.6,531.4L519.3,532.8L514.7,536.8L511.4,541.6L510.8,545.3L511.5,548L510.8,553L509.9,555.4L507.2,558.2L502.8,566.8L499.4,570.7L496.8,573L495,577.7Z","u":"brazil"},{"d":"M429.6,468.1L432.5,468.5L434.5,468.4L435.4,466.9L438.8,464.9L440.8,463L445.9,462.2L445.5,465.9L446,467.8L445.7,471.1L449.9,475.5L454.2,476.3L455.8,478.2L458.4,479.1L460,480.6L462.5,480.5L464.7,482L464.9,484.8L465.6,486.3L465.7,488.4L464.6,488.5L466.1,494.2L473.5,494.4L472.9,497.3L473.4,499.2L475.5,500.6L476.4,503.7L475.7,507.6L474.6,509.7L475,512.5L473.8,513.5L473.7,512L470.1,509.5L466.5,509.4L459.7,510.9L457.9,515.2L457.8,517.9L456.2,523.8L455.6,522.7L451.2,522.5L449.6,526.5L447.4,522.9L442.3,521.7L439,526.2L436.2,526.8L434.7,520L432.6,514.5L433.8,509.7L431.8,507.7L431.3,504.1L429.4,500.7L431.8,495.4L430.2,491.3L431,489.6L430.4,487.8L431.9,485.3L431.9,481.1L432.1,477.7L433,476Z"},{"d":"M428.2,435.3L424.7,435L424.2,435.8L421,436.7L416.5,440.1L416.3,442.4L415.3,444.1L415.7,446.8L413.3,448.2L413.3,450.3L412.3,451.2L413.9,455.6L416.1,458.6L415.2,460.7L417.8,461L419.3,463.6L422.7,463.8L425.9,460.9L425.6,468.4L427.4,468.9L429.6,468.1L433,476L432.1,477.7L431.9,481.1L431.9,485.3L430.4,487.8L431,489.6L430.2,491.3L431.8,495.4L429.4,500.7L428.3,503.3L426.3,504.5L422.4,501.7L422.1,499.7L414.4,494.7L407.4,489.3L404.4,486.3L402.8,482.2L403.4,480.8L400.1,474.3L396.3,465.2L392.6,455.4L391,453.2L389.8,449.6L386.8,446.3L384,444.3L385.3,442.1L383.4,437.4L384.6,434L387.7,430.9L388.2,432.9L387.1,434.1L387.2,435.9L388.8,435.5L390.4,436L392,438.5L394.2,436.5L394.9,433.2L397.3,428.9L402,426.9L406.2,421.8L407.4,418.6L406.9,414.8L407.9,414.4L410.5,416.7L411.7,419L413.6,420.3L415.8,425.5L418.7,426.1L420.9,424.8L422.3,425.6L424.6,425.2L427.6,427.5L425.1,432.5L426.2,432.7Z"},{"d":"M439.9,407.9L439.2,408.5L438.4,405.6L437.4,404L436.1,405.7L428.5,405.6L428.5,408.7L430.8,409.2L430.7,411.1L429.9,410.6L427.7,411.4L427.7,415L429.4,416.8L430,419.6L429.9,421.8L428.2,435.3L426.2,432.7L425.1,432.5L427.6,427.5L424.6,425.2L422.3,425.6L420.9,424.8L418.7,426.1L415.8,425.5L413.6,420.3L411.7,419L410.5,416.7L407.9,414.4L406.9,414.8L405.2,413.7L403.3,412L402.2,412.8L398.9,412.1L398,410L397.2,410.1L393.3,407.3L392.8,405.7L394.3,405.4L394.1,402.9L395,401.1L396.9,400.8L398.6,397.7L400.1,395.1L398.6,393.9L399.4,391.1L398.5,386.6L399.3,385.3L398.7,381.1L397.1,378.5L397.6,376.1L398.9,376.4L399.6,375L398.7,372.1L399.2,371.3L401.2,371.5L404.1,368.1L405.7,367.5L405.8,365.9L406.5,361.7L408.7,359.4L411.1,359.4L411.5,358.3L414.5,358.7L417.6,356.3L419.1,355.2L421,352.8L422.3,353.1L423.4,354.4L422.6,356L420.1,356.9L419.1,359.3L417.6,360.7L416.5,362.6L416,366.1L414.9,369L416.9,369.3L417.4,371.6L418.3,372.6L418.6,374.6L418.1,376.5L418.3,377.5L419.2,377.9L420.2,379.6L425.2,379.1L427.4,379.8L430.2,384L431.7,383.5L434.5,383.8L436.7,383.2L438.1,384L437.4,386.7L436.6,388.4L436.2,391.9L437,395.2L438.1,396.6L438.3,397.7L436.3,400.2L437.7,401.3L438.7,403Z"},{"d":"M399.2,371.3L398.7,372.1L399.6,375L398.9,376.4L397.6,376.1L397.1,378.5L395.8,377.1L395,374.4L396,373.1L395,372.7L394.2,371.1L392.3,369.7L390.6,370.1L389.8,371.8L388.3,373L387.4,373.2L387,374.2L388.9,376.9L387.8,377.5L387.3,378.2L385.4,378.5L384.8,375.5L384.3,376.4L383,376.1L382.2,374.1L380.6,373.8L379.6,373.2L377.9,373.2L377.8,374.3L377.4,373.5L377.6,372.6L377.9,371.6L377.7,370.7L378.3,370.1L377.5,369.4L377.5,367.4L379,366.9L380.4,368.7L380.3,369.7L381.9,370L382.2,369.6L383.3,370.8L385.2,370.4L386.9,369.2L389.2,368.2L390.5,366.7L392.7,367L392.6,367.5L394.7,367.7L396.5,368.5L397.7,370Z"},{"d":"M379,366.9L377.5,367.4L377.5,369.4L378.3,370.1L377.7,370.7L377.9,371.6L377.6,372.6L377.4,373.5L375.2,372.4L374.5,371.4L374.9,370.6L374.8,369.5L373.7,368.3L372.2,367.3L370.8,366.7L370.6,365.2L369.5,364.4L369.8,365.8L369,367L368.1,365.6L366.9,365.1L366.3,364.1L366.4,362.6L366.9,361.1L365.8,360.4L366.7,359.4L367.3,358.8L369.8,360.1L370.7,359.4L372,359.9L372.6,360.9L373.7,361.2L374.7,360.2L375.7,362.8L377.2,364.8Z"},{"d":"M374.7,360.2L373.7,361.2L372.6,360.9L372,359.9L370.7,359.4L369.8,360.1L367.3,358.8L366.7,359.4L365.3,357.9L363.5,355.9L362.7,354.2L361,352.7L359.1,350.4L359.5,349.7L360.1,350.4L360.4,350.1L361.6,349.9L362.1,348.7L362.7,348.7L362.6,346.3L363.5,346.2L364.3,346.2L365.2,344.9L366.3,345.9L366.7,345.3L367.4,344.7L368.8,343.3L368.9,342.3L369.2,342.4L369.7,341.2L370.2,341L370.8,341.8L371.6,342L372.4,341.4L373.4,341.4L374.8,340.7L375.3,340.1L376.6,340.2L376.3,340.6L376.1,341.7L376.5,343.5L375.6,345.2L375.2,347.2L375.1,349.4L375.3,350.6L375.4,352.9L374.8,353.3L374.4,355.5L374.7,356.8L373.9,358L374.1,359.3Z"},{"d":"M376.6,340.2L375.3,340.1L374.8,340.7L373.4,341.4L372.4,341.4L371.6,342L370.8,341.8L370.2,341L369.7,341.2L369.2,342.4L368.9,342.3L368.8,343.3L367.4,344.7L366.7,345.3L366.3,345.9L365.2,344.9L364.3,346.2L363.5,346.2L362.6,346.3L362.7,348.7L362.1,348.7L361.6,349.9L360.4,350.1L359.8,348.5L358.6,348.1L358.9,346.1L358.3,345.6L357.5,345.2L355.8,345.8L355.7,345.2L354.5,344.4L353.7,343.4L352.5,343L353.3,341.7L353,340.8L353.3,339.8L355.1,338.4L356.9,336.6L357.3,336.7L358.2,335.9L359.3,335.8L359.6,336.2L360.2,336L362,336.4L363.8,336.3L365.1,335.7L365.5,335.2L366.8,335.4L367.7,335.8L368.7,335.7L369.5,335.2L371.3,335.9L371.9,336L373.1,336.9L374.2,338L375.6,338.8Z"},{"d":"M352.5,343L353.7,343.4L354.5,344.4L355.7,345.2L355.8,345.8L357.5,345.2L358.3,345.6L358.9,346.1L358.6,348.1L358.2,349.3L355.9,349.2L354.5,348.7L352.9,347.7L350.7,347.4L349.6,346.4L349.8,345.7L351.1,344.4L351.8,343.9L351.6,343.3Z"},{"d":"M341.3,342.4L341.4,341L341.9,339.8L341.3,338.9L343.2,334.9L348.2,334.9L348.3,333.2L347.7,332.9L347.2,331.8L345.8,330.7L344.3,329L346.1,329L346.1,326.2L349.7,326.2L353.3,326.3L353.3,330.2L353,335.8L354.2,335.8L355.4,336.7L355.8,335.9L356.9,336.6L355.1,338.4L353.3,339.8L353,340.8L353.3,341.7L352.5,343L351.6,343.3L351.8,343.9L351.1,344.4L349.8,345.7L349.6,346.4L347.6,345.5L345.2,345.4L343.4,344.4Z"},{"d":"M353.3,326.3L353.3,325.6L353.8,325.3L354.5,325.9L355.9,323L356.6,322.9L356.6,323.6L357.4,323.6L357.3,325L356.7,327.1L357,327.9L356.6,329.6L356.9,330.1L356.4,332.6L355.6,333.9L354.9,334.1L354.2,335.8L353,335.8L353.3,330.2Z"},{"d":"M463.8,388.5L464.3,389.8L462.9,391.7L458.6,393.6L455.8,394.3L454.6,395.5L451.5,394.3L448.7,393.6L447.9,394.1L449.7,395.4L449.5,398.7L450.1,401.8L453.4,402.2L453.6,403.2L450.8,404.6L450.3,406.7L448.7,407.5L445.8,408.7L445.1,410.2L442.1,410.5L439.9,407.9L438.7,403L437.7,401.3L436.3,400.2L438.3,397.7L438.1,396.6L437,395.2L436.2,391.9L436.6,388.4L437.4,386.7L438.1,384L436.7,383.2L434.5,383.8L431.7,383.5L430.2,384L427.4,379.8L425.2,379.1L420.2,379.6L419.2,377.9L418.3,377.5L418.1,376.5L418.6,374.6L418.3,372.6L417.4,371.6L416.9,369.3L414.9,369L416,366.1L416.5,362.6L417.6,360.7L419.1,359.3L420.1,356.9L422.6,356L422.5,357.2L420.2,357.8L421.5,360L421.4,362.6L419.7,365.5L421.2,369.4L422.9,369L423.7,365.5L422.5,363.7L422.3,360L427.2,358L426.6,355.7L428,354.1L429.4,357.6L432.1,357.7L434.6,360.4L434.8,362.1L438.3,362.1L442.4,361.6L444.7,363.8L447.7,364.4L449.8,362.9L449.9,361.6L454.7,361.3L459.4,361.3L456.1,362.7L457.4,365L460.5,365.4L463.4,367.8L464.1,371.8L466.1,371.7L467.6,372.8L464.5,375.7L464.2,377.5L465.5,379.4L464.6,380.3L462.2,381.1L462.2,383.4L461.2,384.7Z","u":"venezuela"},{"d":"M480.1,404.7L479.2,404.9L477,404.5L475.8,405.8L474,406.7L472.8,406.9L472.4,407.8L470.4,407.6L468,405.3L467.8,403L466.8,400.5L467.4,396.3L468.5,394.6L467.6,392.3L466.2,391.5L466.7,389.4L465.8,388.2L463.8,388.5L461.2,384.7L462.2,383.4L462.2,381.1L464.6,380.3L465.5,379.4L464.2,377.5L464.5,375.7L467.6,372.8L470.2,374.7L472.6,377.9L472.7,380.4L474.1,380.5L476.2,382.9L477.8,384.6L477.1,389.1L474.8,390.4L475,391.5L474.3,394.1L476,397.6L477.2,397.7L477.8,400.4Z"},{"d":"M488,402.7L485.7,401.6L483.9,402.2L482.3,401.7L481.9,403.1L482.6,404.1L482.2,405.1L480.1,404.7L477.8,400.4L477.2,397.7L476,397.6L474.3,394.1L475,391.5L474.8,390.4L477.1,389.1L477.8,384.6L482.4,385.6L482.8,384.7L486,384.4L490.2,385.7L488.1,389.9L488.5,393.3L490,396.2L489.3,398.4L489,400.6Z"},{"d":"M499.1,393.6L496.8,398.1L495.6,401.7L494.1,403.6L492.3,404L491.7,402.6L490.9,402.4L489.7,403.7L488,402.7L489,400.6L489.3,398.4L490,396.2L488.5,393.3L488.1,389.9L490.2,385.7L491.5,386.2L494.3,387.4L498.5,391.6ZM724.1,170.2L725.9,171.5L731.5,172.5L729.5,175.8L729,179.3L728,180.2L726.2,179.7L726.3,181L723.5,183.7L723.4,186L725.3,185.2L726.6,187.4L726.5,188.8L727.6,190.6L726.2,192.1L727.3,195.9L729.4,196.6L728.9,198.7L725.4,201.5L717.7,200.1L712.1,201.7L711.6,204.7L707.1,205.4L702.7,203.1L701.3,204.2L694.2,201.9L692.6,200L694.6,197.1L695.4,187.3L691.3,182.1L688.5,179.6L682.5,177.7L682.1,174.1L687.2,173L693.7,174.3L692.5,168.7L696.2,170.8L705.2,167L706.4,162.9L709.8,161.9L710.3,163.7L712.1,163.8L714,165.7L716.7,168.1L718.7,167.7L722.1,169.9L722.9,170.4ZM734,203.9L736.5,202.1L737.2,206.3L735.9,210.1L734.1,209.1L733.2,205.8Z","u":"euro-area"},{"d":"M406.9,414.8L407.4,418.6L406.2,421.8L402,426.9L397.3,428.9L394.9,433.2L394.2,436.5L392,438.5L390.4,436L388.8,435.5L387.2,435.9L387.1,434.1L388.2,432.9L387.7,430.9L389.8,427.2L388.9,425L387.5,427.3L385.1,425.2L385.9,423.8L385.3,419.3L386.6,418.6L387.3,415.5L388.8,412.3L388.5,410.3L390.7,409.2L393.3,407.3L397.2,410.1L398,410L398.9,412.1L402.2,412.8L403.3,412L405.2,413.7Z"},{"d":"M442.2,322.8L444.2,323.2L444.9,324.2L443.9,325.5L441,325.4L438.7,325.6L438.5,323.5L439.1,322.8Z"},{"d":"M398.3,322.9L401,323.4L403,324.6L403.7,325.9L400.9,326L399.8,326.8L397.6,326L395.4,324.2L395.8,323.1L397.5,322.8Z"},{"d":"M380.1,299.8L383.4,300.1L386.5,300.2L390.1,301.9L391.7,303.7L395.3,303.1L396.7,304.3L400,307.3L402.4,309.5L403.7,309.5L406,310.5L405.7,311.9L408.6,312.1L411.5,314.1L411.1,315.2L408.5,315.9L405.9,316.1L403.2,315.7L397.6,316.2L400.2,313.5L398.6,312.2L396.1,311.8L394.8,310.4L393.9,307.6L391.7,307.8L388,306.5L386.9,305.4L381.8,304.7L380.5,303.7L381.9,302.5L378.1,302.2L375.3,304.8L373.7,304.9L373.1,306.1L371.2,306.6L369.5,306.1L371.6,304.6L372.4,302.8L374.2,301.8L376.2,300.8L379.1,300.3Z"},{"d":"M821.3,523.8L819.2,523.3L817.9,523.9L816,523L814.5,523L812,520.8L809,520L807.8,516.9L807.8,515.1L806.2,514.6L801.7,509.2L800.5,506.3L799.7,505.5L798.2,501.5L802.6,502.1L803.9,502.6L805.2,502.5L807.3,499.3L810.7,495.3L812.1,494.9L812.6,493.2L814.8,491.2L817.7,490.5L818,492.4L821.2,492.3L823,493.3L823.9,494.5L825.7,494.9L827.7,496.5L827.7,502.7L827,506.1L826.8,509.8L827.5,511.3L827,514.2L826.4,514.6L825.4,518.2Z"},{"d":"M814.5,523L809,526.6L805.5,530.3L804.2,533.6L803,535.4L800.9,535.8L800.2,538.2L799.8,539.7L797.3,540.9L794.2,540.6L792.3,539.2L790.7,538.7L788.8,539.8L787.8,542.2L786,543.6L784,545.8L781.2,546.3L780.4,544.6L780.7,541.6L778.4,536.9L777.4,536.2L777.4,521.8L781.2,521.6L781.3,504.1L784.2,503.9L790.2,502.2L791.7,504.2L794.2,502.3L795.4,502.3L797.5,501.1L798.2,501.5L799.7,505.5L800.5,506.3L801.7,509.2L806.2,514.6L807.8,515.1L807.8,516.9L809,520L812,520.8Z"},{"d":"M777.4,536.2L777.4,554.4L773.9,556.9L771.8,557.3L769.4,556.3L767.6,556L767,553.9L765.4,552.5L763.6,555L760.7,551.2L759.2,547.6L758.3,542.8L757.3,539.3L756,531.7L755.9,525.8L755.4,523.1L753.9,521.1L751.9,517L749.9,511.1L749,508L745.9,503.2L745.6,499.4L747.5,498.4L749.8,497.6L752.4,497.7L754.7,500L755.3,499.6L771,499.4L773.7,501.8L783.1,502.5L790.3,500.5L793.5,499.3L796,499.6L797.5,500.7L797.5,501.1L795.4,502.3L794.2,502.3L791.7,504.2L790.2,502.2L784.2,503.9L781.3,504.1L781.2,521.6L777.4,521.8Z"},{"d":"M635,347.1L633.4,343.2L631.5,341.5L633.2,340.5L635,337.1L636,334.5L637.3,333L639.2,333.4L641.1,332.3L643.3,332.3L645.2,333.7L647.7,335L650.1,338.6L652.7,342L652.9,345.1L653.6,347.9L655.1,349.3L655.4,351.2L655.2,352.7L654.7,353L652.5,352.6L652.3,353.2L651.4,353.3L648.6,352.1L646.7,352L639.5,351.8L638.5,352.4L637.2,352.2L635.1,353L634.5,349.3L638,349.4L639,348.7L639.7,348.6L641.1,347.5L642.8,348.5L644.5,348.6L646.2,347.5L645.4,346.1L644.1,346.9L642.9,346.9L641.3,345.7L640.1,345.8L639.2,346.9Z"},{"d":"M655.2,352.7L655.4,351.2L655.1,349.3L653.6,347.9L652.9,345.1L652.7,342L654,341.1L654.6,338.2L655.9,338.1L658.6,339.5L660.8,338.5L662.3,338.8L662.9,337.7L678.5,337.7L679.3,334.2L678.7,333.6L676.8,312.3L674.9,291.1L680.9,291L694,301.7L707.1,312.5L708,314.8L710.4,316.2L712.2,317L712.3,320.1L716.6,319.7L716.6,331L714.5,334.3L714.1,337.3L710.7,338.1L705.4,338.5L704,340.3L701.5,340.5L699,340.5L698,339.6L695.8,340.3L692.2,342.3L691.5,343.9L688.5,346.1L687.9,347.3L686.3,348.3L684.4,347.7L683.4,348.9L682.8,352.3L679.7,356.3L679.8,358L678.7,360.1L679,363L677.4,363.7L676.5,364.3L675.9,362.2L674.8,362.8L674.1,362.7L673.4,364.1L670.4,364.1L669.3,363.3L668.8,363.8L667.6,362.4L667.8,360.9L667.3,360.3L666.5,360.8L666.6,359.2L667.4,357.9L665.8,355.9L665.4,354.5L664.5,353.4L663.7,353.3L662.8,354L661.5,354.6L660.5,355.7L658.8,355.3L657.7,354L657.1,353.9L656.1,354.5L655.4,354.6Z"},{"d":"M633.6,310.6L634.5,308.9L649.7,309L649,301.8L649.9,299.3L653.6,298.9L653.5,286.2L666.2,286.5L666.2,279L680.9,291L674.9,291.1L676.8,312.3L678.7,333.6L679.3,334.2L678.5,337.7L662.9,337.7L662.3,338.8L660.8,338.5L658.6,339.5L655.9,338.1L654.6,338.2L654,341.1L652.7,342L650.1,338.6L647.7,335L645.2,333.7L643.3,332.3L641.1,332.3L639.2,333.4L637.3,333L636,334.5L635.6,331.9L636.7,329.5L637.2,324.8L636.8,319.9L636.3,317.5L636.7,315L635.7,312.7Z"},{"d":"M710.5,383.2L707.3,383.8L706.3,380.4L706.5,369.1L705.7,368.1L705.5,365.6L704.2,363.9L703,362.5L703.5,359.9L704.8,359.3L705.6,357.2L707.5,356.7L708.4,355.2L709.7,353.8L711.1,353.8L714,356.6L713.9,358.2L714.8,361.2L714,363.2L714.4,364.5L712.5,367.5L711.3,369L710.6,372.1L710.7,375.3Z"},{"d":"M757.8,301.4L758.7,309L760.2,310.3L760.2,311.9L761.8,313.6L761,315.7L759.5,325.7L759.3,332.1L754.3,336.8L752.7,343.3L754.3,345.1L754.3,348.3L756.8,348.4L756.4,350.7L755.3,351L755.2,352.5L754.4,352.7L751.8,347.3L750.9,347.1L747.8,349.8L744.8,348.4L742.7,348.1L741.6,348.8L739.3,348.6L737,350.7L735.1,350.9L730.3,348.3L728.5,349.5L726.5,349.4L725.1,347.6L721.2,345.7L717,346.3L716,347.4L715.4,350.2L714.3,352.2L714,356.6L711.1,353.8L709.7,353.8L708.4,355.2L708.5,351.8L704,350.7L703.9,348.3L701.7,345.1L701.2,342.9L701.5,340.5L704,340.3L705.4,338.5L710.7,338.1L714.1,337.3L714.5,334.3L716.6,331L716.6,319.7L722.1,317.5L733.3,307.8L746.7,298.4L752.8,300.5L755,303.2Z"},{"d":"M710.5,383.2L710.7,375.3L710.6,372.1L711.3,369L712.5,367.5L714.4,364.5L714,363.2L714.8,361.2L713.9,358.2L714,356.6L714.3,352.2L715.4,350.2L716,347.4L717,346.3L721.2,345.7L725.1,347.6L726.5,349.4L728.5,349.5L730.3,348.3L735.1,350.9L737,350.7L739.3,348.6L741.6,348.8L742.7,348.1L744.8,348.4L747.8,349.8L750.9,347.1L751.8,347.3L754.4,352.7L755.2,352.5L756.7,354.5L756.3,355.4L756.1,357L752.8,360.9L751.8,364L751.2,366.6L750.4,367.7L749.6,371.1L747.5,373.1L746.9,375.6L746,377.6L745.7,379.7L743,381.3L740.8,379.3L739.3,379.4L737,382.3L735.9,382.3L734.1,387.1L733.1,390.6L729,392.3L727.5,392.1L726,393.2L722.9,393.1L720.9,390L719.6,386.4L716.8,383.2L713.9,383.2Z"},{"d":"M756.4,350.7L757.9,353.8L758.2,357.1L758,360.4L760.2,364.9L758,364.8L756.9,365.2L755.1,364.7L754.3,367L756.6,369.9L758.3,370.7L758.8,372.8L760,376.2L759.4,377.5L757.5,382.5L756.5,383.4L756.2,387.2L756.6,389.3L756.3,390.8L758.2,393.3L758.5,395.1L759.9,397.6L761.7,399.2L761.9,401.5L762.3,402.9L762,405.6L758.9,404.4L755.8,403.1L750.9,402.9L750.4,402.6L748.1,403.3L745.7,402.6L743.9,402.9L737.5,402.8L738.1,398.9L736.6,395.7L734.8,394.8L734,392.6L733,391.9L733.1,390.6L734.1,387.1L735.9,382.3L737,382.3L739.3,379.4L740.8,379.3L743,381.3L745.7,379.7L746,377.6L746.9,375.6L747.5,373.1L749.6,371.1L750.4,367.7L751.2,366.6L751.8,364L752.8,360.9L756.1,357L756.3,355.4L756.7,354.5L755.2,352.5L755.3,351Z"},{"d":"M703.5,359.9L703,362.5L704.2,363.9L705.5,365.6L705.7,368.1L706.5,369.1L706.3,380.4L707.3,383.8L704.1,384.9L703.3,383.1L702.2,380L701.9,377.5L702.8,373.1L701.8,371.3L701.4,367.4L701.4,363.8L699.8,361.3L700.1,359.8Z"},{"d":"M700.1,359.8L699.8,361.3L701.4,363.8L701.4,367.4L701.8,371.3L702.8,373.1L701.9,377.5L702.2,380L703.3,383.1L704.1,384.9L698,387.7L695.9,389.4L692.4,390.9L688.9,389.5L689.1,387.5L687.4,383.3L688.4,377.7L690,373.6L689,366.5L688.5,362.8L688.6,360L695.3,359.8L697,360.2L698.3,359.4Z"},{"d":"M668.8,363.8L669.3,363.3L670.4,364.1L673.4,364.1L674.1,362.7L674.8,362.8L675.9,362.2L676.5,364.3L677.4,363.7L679,363L680.7,364L681.4,365.7L683.2,366.7L684.5,365.5L686.3,365.3L689,366.5L690,373.6L688.4,377.7L687.4,383.3L689.1,387.5L688.9,389.5L687.1,389.5L684.4,388.6L681.9,388.6L677.3,389.5L674.6,390.9L670.8,392.7L670,392.6L670.3,388.5L670.7,387.9L670.6,385.9L668.9,383.9L667.7,383.6L666.5,382.2L667.4,380L667,377.6L667.2,376.2L667.8,376.2L668,374L667.7,373.1L668.1,372.4L669.5,371.8L668.6,367.9L667.7,365.8L668,364.2Z"},{"d":"M646.7,352L648.6,352.1L651.4,353.3L652.3,353.2L652.5,352.6L654.7,353L655.2,352.7L655.4,354.6L656.1,354.5L657.1,353.9L657.7,354L658.8,355.3L660.5,355.7L661.5,354.6L662.8,354L663.7,353.3L664.5,353.4L665.4,354.5L665.8,355.9L667.4,357.9L666.6,359.2L666.5,360.8L667.3,360.3L667.8,360.9L667.6,362.4L668.8,363.8L668,364.2L667.7,365.8L668.6,367.9L669.5,371.8L668.1,372.4L667.7,373.1L668,374L667.8,376.2L667.2,376.2L666.1,376.1L665.3,378.1L664.2,378L663.4,377L663.7,375L662.1,372L661,372.5L660.2,372.6L659.1,372.9L659.2,371.1L658.6,369.8L658.7,368.4L657.9,366.3L656.8,364.6L653.7,364.6L652.7,365.5L651.7,365.6L651,366.7L650.6,368L648.5,370.2L646.8,367.3L645.3,365.3L644.3,364.7L643.3,363.7L642.9,361.6L642.3,360.5L641.2,359.7L642.9,357.3L644.1,357.3L645.1,356.5L645.9,356.5L646.6,355.9L646.2,354.2L646.7,353.7Z"},{"d":"M635.1,353L637.2,352.2L638.5,352.4L639.5,351.8L646.7,352L646.7,353.7L646.2,354.2L646.6,355.9L645.9,356.5L645.1,356.5L644.1,357.3L642.9,357.3L641.2,359.7L639.1,357.6L637.4,357.3L636.6,355.9L636.6,355.1L635.4,354.1Z"},{"d":"M667.2,376.2L667,377.6L667.4,380L666.5,382.2L667.7,383.6L668.9,383.9L670.6,385.9L670.7,387.9L670.3,388.5L670,392.6L669,392.6L665,390.3L661.5,386.5L658.1,383.8L655.5,380.6L656.4,379.1L656.6,377.6L658.4,375L660.2,372.6L661,372.5L662.1,372L663.7,375L663.4,377L664.2,378L665.3,378.1L666.1,376.1Z"},{"d":"M648.5,370.2L650.6,368L651,366.7L651.7,365.6L652.7,365.5L653.7,364.6L656.8,364.6L657.9,366.3L658.7,368.4L658.6,369.8L659.2,371.1L659.1,372.9L660.2,372.6L658.4,375L656.6,377.6L656.4,379.1L655.5,380.6L654.5,380.3L651.7,378.3L649.6,375.6L649,373.8Z"},{"d":"M679,363L678.7,360.1L679.8,358L679.7,356.3L682.8,352.3L683.4,348.9L684.4,347.7L686.3,348.3L687.9,347.3L688.5,346.1L691.5,343.9L692.2,342.3L695.8,340.3L698,339.6L699,340.5L701.5,340.5L701.2,342.9L701.7,345.1L703.9,348.3L704,350.7L708.5,351.8L708.4,355.2L707.5,356.7L705.6,357.2L704.8,359.3L703.5,359.9L700.1,359.8L698.3,359.4L697,360.2L695.3,359.8L688.6,360L688.5,362.8L689,366.5L686.3,365.3L684.5,365.5L683.2,366.7L681.4,365.7L680.7,364Z"},{"d":"M806.5,388.3L805.2,388.8L802.7,388.7L799.8,388.2L798.3,388.6L797.7,389.8L796.5,389.9L794.9,388.9L790.6,391.4L788.8,390.9L788.3,391.2L787.1,394.2L784.2,393.3L781.4,392.8L778.9,391L775.7,389.3L773.6,390.9L772.1,393.4L771.8,396.8L769.3,396.5L766.6,395.7L764.3,398.3L762.3,402.9L761.9,401.5L761.7,399.2L759.9,397.6L758.5,395.1L758.2,393.3L756.3,390.8L756.6,389.3L756.2,387.2L756.5,383.4L757.5,382.5L759.4,377.5L762.6,377.1L763.4,375.9L764,376L765,377.1L769.9,375.2L771.5,373.3L773.6,371.5L773.2,369.8L774.3,369.4L778,369.7L781.7,367.4L784.5,362L786.5,360L788.9,359.2L789.4,361.3L791.6,364.3L791.6,366.4L791,368.4L791.2,369.9L792.6,371.4L795.5,373.5L797.7,375.5L797.7,377.1L800.3,379.7L801.9,381.8L802.9,384.8L805.8,386.7Z"},{"d":"M771.8,396.8L771.5,399.8L770.4,402.4L769.6,405.5L769.1,409.9L769.3,412.7L768.7,414.4L768.6,416.2L768.1,417.8L765.6,420.1L763.8,422.7L762.1,427.5L762.3,431.5L761.3,433.1L759,435.5L756.7,438.6L755.3,437.7L755,436.3L752.9,436.3L751.6,438.2L750.5,437.7L749.1,436L747.9,436.8L746.3,438.9L743.1,433.7L746.1,431L744.6,427.7L746,426.5L748.6,425.9L748.9,423.7L751,426.1L754.4,426.3L755.6,423.9L756.1,420.7L755.7,416.8L753.8,413.9L755.5,408.2L754.6,407.2L751.7,407.6L750.6,405.1L750.9,402.9L755.8,403.1L758.9,404.4L762,405.6L762.3,402.9L764.3,398.3L766.6,395.7L769.3,396.5Z"},{"d":"M743.9,402.9L745.7,402.6L748.1,403.3L750.4,402.6L750.9,402.9L750.6,405.1L751.7,407.6L754.6,407.2L755.5,408.2L753.8,413.9L755.7,416.8L756.1,420.7L755.6,423.9L754.4,426.3L751,426.1L748.9,423.7L748.6,425.9L746,426.5L744.6,427.7L746.1,431L743.1,433.7L739.2,428.7L736.6,424.7L734.2,419.6L734.3,417.9L735.2,416.4L736.1,412.8L736.9,409.1L738.2,408.8L743.9,408.9Z"},{"d":"M737.5,402.8L743.9,402.9L743.9,408.9L738.2,408.8L736.9,409.1L736.2,408.4Z"},{"d":"M819.5,455.2L821.2,456.5L822.7,457.3L825.2,458.1L827.4,459.6L829.2,461.8L830.2,466L829.6,467.3L828.8,471.3L829.5,475.4L828.3,477.1L827.1,481.7L829.2,483L817.4,487L817.7,490.5L814.8,491.2L812.6,493.2L812.1,494.9L810.7,495.3L807.3,499.3L805.2,502.5L803.9,502.6L802.6,502.1L798.2,501.5L797.5,501.1L797.5,500.7L796,499.6L793.5,499.3L790.3,500.5L787.7,497.4L785.1,493.4L785.3,477.7L793.4,477.7L793.1,476L793.6,474.2L793,471.9L793.4,469.5L793,467.9L794.3,468.1L794.6,469.6L796.4,469.5L798.8,469.9L800.2,472.2L803.3,472.9L805.6,471.3L806.5,473.9L809.5,474.6L810.9,476.7L812.5,479.4L815.5,479.4L815.2,474.1L814.1,475L811.4,473.1L810.3,472.2L810.8,467.3L811.5,461.4L810.6,459.3L811.7,456.1L812.8,455.5L818,454.7Z"},{"d":"M827.4,459.6L831.2,460.5L832,461.9L833.3,464.2L834.4,470.9L833.3,474.6L834.4,481L835.8,481L837.2,482.5L838.8,486.1L839.1,492.5L837.4,493.5L836.2,496.9L833.7,493.9L833.4,490.4L834.2,488.1L834,486.1L832.5,484.9L831.4,485.3L829.2,483L827.1,481.7L828.3,477.1L829.5,475.4L828.8,471.3L829.6,467.3L830.2,466L829.2,461.8Z"},{"d":"M834.4,470.9L837.3,470.5L842,471.9L843,471.2L845.7,471.1L847.1,469.6L849.4,469.7L853.7,467.8L856.8,464.9L857.4,467.2L857.3,472.1L857.7,476.4L857.9,484.1L858.6,486.5L857.4,490L855.9,493.5L853.4,496.5L849.9,498.4L845.5,500.8L841.1,506.1L839.6,507L836.9,510.5L835.3,511.6L835,515.1L836.8,518.9L837.6,521.7L837.6,523.2L838.3,523L838.2,527.8L837.6,530.1L838.5,531L837.9,533L836.3,534.8L833.1,536.4L828.4,539.1L826.7,540.9L827,543L828,543.3L827.7,545.9L824.7,545.9L824.4,543.7L823.8,541.5L823.5,539.7L824.2,534.2L823.2,530.7L821.3,523.8L825.4,518.2L826.4,514.6L827,514.2L827.5,511.3L826.8,509.8L827,506.1L827.7,502.7L827.7,496.5L825.7,494.9L823.9,494.5L823,493.3L821.2,492.3L818,492.4L817.7,490.5L817.4,487L829.2,483L831.4,485.3L832.5,484.9L834,486.1L834.2,488.1L833.4,490.4L833.7,493.9L836.2,496.9L837.4,493.5L839.1,492.5L838.8,486.1L837.2,482.5L835.8,481L834.4,481L833.3,474.6Z"},{"d":"M824.7,545.9L823.9,548.1L821.7,548.6L819.3,545.9L819.3,544.2L820.4,542.4L820.7,540.9L821.9,540.6L823.8,541.5L824.4,543.7Z"},{"d":"M750.5,437.7L749.1,438.7L748.5,440L748.4,442.1L747.4,442.6L746.3,438.9L747.9,436.8L749.1,436ZM747.9,444.2L749.5,443.5L750.6,443.6L752,443L763.5,443.1L764.5,446.7L765.6,449.7L766.5,451.3L768,453.9L770.5,453.5L771.8,452.8L774,453.5L774.5,452.2L775.5,449.4L777.9,449.2L778.1,448.3L780.1,448.3L779.8,450.1L784.5,450L784.6,453.1L785.4,455L784.8,458L785.1,461L786.4,462.9L786.2,468.7L787.1,468.3L788.8,468.4L791.2,467.7L793,467.9L793.4,469.5L793,471.9L793.6,474.2L793.1,476L793.4,477.7L785.3,477.7L785.1,493.4L787.7,497.4L790.3,500.5L783.1,502.5L773.7,501.8L771,499.4L755.3,499.6L754.7,500L752.4,497.7L749.8,497.6L747.5,498.4L745.6,499.4L745.3,496.3L745.8,491.9L747.1,487.4L747.4,485.3L748.6,480.9L749.5,478.8L751.8,475.6L753,473.4L753.4,469.8L753.2,467L752.1,465.2L751,462.2L750.1,459.3L750.3,458.3L751.5,456.3L750.3,451.5L749.5,448.2L747.6,445.1Z"},{"d":"M818.5,426L818.7,427.9L819.6,429L819.6,430.6L818.6,431.7L817.1,434.2L815.7,436L814.1,436.3L813.9,430.3L812.9,428.1L815.2,428.5L816.4,425.7Z"},{"d":"M838.9,252.8L838.2,254.4L836.8,253.7L836,257L837,257.5L836,258.2L835.8,259.5L837.7,258.9L837.8,260.8L835.8,268.7L835.4,267.4L833.3,260.2L834.4,258.6L834.1,258.3L835.2,256L835.9,252.3L836.5,251L836.6,251L837.9,251L838.3,250.1L839.3,250L839.4,252.1L838.8,252.8Z"},{"d":"M839.3,250L838.3,250.1L837.9,251L836.6,251L838,246.9L839.9,243.5L840,243.3L841.7,243.6L842.4,245.5L840.3,247.3Z"},{"d":"M892.7,475.6L893.7,477.7L894.7,480.9L895.3,486.8L896.3,489.1L895.9,491.5L895.2,493L893.9,490.1L893.2,491.5L893.9,495.2L893.6,497.3L892.5,498.4L892.2,502.6L890.7,508.3L888.8,515.1L886.4,524.5L884.9,531.3L883.2,537L880,538.2L876.6,540.3L874.4,539L871.3,537.3L870.2,534.7L869.9,530.3L868.6,526.4L868.2,522.8L868.9,519.3L870.7,518.4L870.7,516.8L872.6,513L872.9,509.9L872,507.6L871.3,504.5L871,499.9L872.3,497.2L872.9,494L874.8,493.8L877,492.8L878.4,491.9L880.1,491.9L882.3,489.1L885.5,486L886.7,483.6L886.2,481.4L887.8,482L889.9,478.6L890,475.6L891.3,473.4Z"},{"d":"M837.7,258.9L835.8,259.5L836,258.2L837,257.5L836,257L836.8,253.7L838.2,254.4L838.2,257.4Z"},{"d":"M635,347.1L639.2,346.9L640.1,345.8L641.3,345.7L642.9,346.9L644.1,346.9L645.4,346.1L646.2,347.5L644.5,348.6L642.8,348.5L641.1,347.5L639.7,348.6L639,348.7L638,349.4L634.5,349.3Z"},{"d":"M736.9,264.7L735.2,255.8L732.8,253.8L732.8,252.7L729.6,249.7L729.3,246L731.7,243.2L732.6,239.2L732,234.5L732.8,232L737,230L739.7,230.6L739.6,233.1L742.9,231.2L743.2,232.2L741.2,234.6L741.2,236.9L742.5,238.1L742,242.4L739.5,244.8L740.2,247.5L742.2,247.6L743.2,250L744.7,250.7L744.5,254.5L742.6,255.9L741.4,257.5L738.7,259.4L739.1,261.5L738.8,263.5Z"},{"d":"M666.2,279L666.3,278.1L666.3,277.7L666.3,271.9L672.6,268.3L676.4,267.5L679.6,266.2L681.1,263.7L685.6,261.8L685.8,258.1L688.1,257.7L689.8,255.9L694.9,255L695.6,253.1L694.6,252.1L693.3,246.9L693,243.9L691.6,240.7L695.3,238L699.5,237.2L702,235.1L705.7,233.6L712.3,232.8L718.7,232.4L720.7,233.1L724.4,231.1L728.5,231.1L730.1,232.3L732.8,232L732,234.5L732.6,239.2L731.7,243.2L729.3,246L729.6,249.7L732.8,252.7L732.8,253.8L735.2,255.8L736.9,264.7L738.1,269L738.3,271.3L737.7,275.3L737.9,277.6L737.4,280.3L737.8,283.4L736.2,285.4L738.5,289L738.7,291.2L740.1,293.9L741.9,293L745,295.3L746.7,298.4L733.3,307.8L722.1,317.5L716.6,319.7L712.3,320.1L712.2,317L710.4,316.2L708,314.8L707.1,312.5L694,301.7L680.9,291Z"},{"d":"M838.2,254.4L838.9,252.8L843.2,254.8L850.9,249.5L852.4,255.5L851.7,256.3L843.9,258.8L847.8,263.7L846.5,264.5L845.8,266.2L842.9,266.9L842,268.6L840.3,270.2L835.9,269.4L835.8,268.7L837.8,260.8L837.7,258.9L838.2,257.4Z"},{"d":"M900.6,294.6L901.3,294.3L901.4,295.7L904.5,294.9L907.7,295L910,295.2L912.7,291.8L915.6,288.7L918.1,285.6L918.8,287.3L919.3,291.2L917.3,291.2L917,294.4L917.7,295.1L915.9,296.1L915.9,298.1L914.8,300.2L914.7,302.1L913.9,303.2L902.2,300.7L900.7,295.7Z","u":"united-arab-emirates"},{"d":"M897.6,292.1L897.3,288.5L898.4,285.9L899.5,285.3L900.6,286.9L900.7,289.8L899.8,292.7L898.8,293Z"},{"d":"M886.6,266.3L887.4,268.5L887,269.6L888.3,273.3L885.5,273.5L884.6,271.1L881.1,270.6L884,265.9Z"},{"d":"M852.4,255.5L850.9,249.5L859.5,244.4L860.9,238.4L860.6,234.9L862.7,233.6L864.7,230.6L866.4,229.8L870.9,230.4L872.3,231.7L874.1,230.8L876.6,236.7L879.2,238.2L879.5,241.1L877.5,242.8L876.6,246.6L879.3,251.3L884.1,254L886.1,257.8L885.4,261.3L886.7,261.3L886.7,264L888.9,266.6L886.6,266.3L884,265.9L881.1,270.6L873.9,270.2L862.9,260.3L857.1,256.9Z"},{"d":"M914.7,302.1L914.8,300.2L915.9,298.1L915.9,296.1L917.7,295.1L917,294.4L917.3,291.2L919.3,291.2L921.1,294.6L923.2,296.4L926.1,297L928.4,297.9L930.1,300.7L931.2,302.4L932.6,303L932.6,304.1L931.2,307L930.5,308.4L928.9,310L927.5,313.4L925.7,313.1L924.9,314.3L924.3,316.8L924.7,320.1L924.4,320.7L922.6,320.7L920.1,322.5L919.8,324.9L918.9,326L916.5,325.9L914.9,327.2L915,329.2L913.1,330.5L910.9,330.1L908.3,331.7L906.5,332L905.3,328.6L902.2,320.4L913.9,315.5L916.5,305.6ZM918.8,287.3L918.1,285.6L919.2,284L919.7,284.4L919.3,286.4Z"},{"d":"M1350.3,492.4L1352.7,495.3L1351.4,495.9L1350.1,493.7ZM1348.6,491.3L1348.1,490L1348,486.2L1349.9,487.7L1350.5,491.7L1349.4,491.1Z"},{"d":"M1098.9,354L1098,348.1L1100.5,344L1105.5,343L1109.2,343.7L1112.4,345.7L1114.2,342.3L1117.6,344.1L1118.5,347.4L1118,353.3L1111.5,357.1L1113.2,360L1109.1,360.4L1105.7,362.4L1102.5,361.7L1100.9,359.1Z"},{"d":"M1109.2,343.7L1105.5,343L1100.5,344L1098,348.1L1098.9,354L1095.5,351.7L1092.1,351.8L1092.7,348L1089.3,348L1089,353.4L1086.9,360.6L1085.6,365L1085.9,368.5L1088.4,368.7L1090,373.2L1090.7,377.5L1092.9,380.3L1095.2,380.9L1097.2,383.4L1095.9,385.4L1093.4,386L1093.1,383.5L1089.9,381.3L1089.2,382.2L1087.7,380.3L1087,377.9L1085,375.1L1083.1,372.8L1082.4,375.7L1081.7,372.9L1082.1,369.8L1083.3,365.1L1085.2,360.1L1087.3,355.5L1085.8,351L1085.8,348.7L1085.4,345.9L1082.8,342L1081.9,339.5L1083.2,338.6L1084.6,334.3L1083,331.1L1080.6,327.5L1078.7,323.2L1080.3,322.3L1082.1,316.9L1084.8,316.7L1087.1,314.6L1089.3,313.4L1091,315L1091.2,317.9L1093.9,318.1L1092.9,323.3L1093,327.8L1097.1,324.8L1098.3,325.7L1100.6,325.5L1101.3,323.8L1104.3,324.2L1107.2,328.2L1107.5,333L1110.6,337.3L1110.4,341.5Z","u":"thailand"},{"d":"M1117.6,344.1L1114.2,342.3L1112.4,345.7L1109.2,343.7L1110.4,341.5L1110.6,337.3L1107.5,333L1107.2,328.2L1104.3,324.2L1101.3,323.8L1100.6,325.5L1098.3,325.7L1097.1,324.8L1093,327.8L1092.9,323.3L1093.9,318.1L1091.2,317.9L1091,315L1089.3,313.4L1090.2,311.6L1093.5,308.4L1093.8,309.6L1095.9,309.7L1095.3,304.1L1097.3,303.3L1099.6,307.2L1101.3,311.7L1106.1,311.8L1107.6,316.1L1105.2,317.3L1104,319.1L1108.7,322.1L1111.9,327.9L1114.4,332.2L1117.3,335.7L1118.3,339.1Z"},{"d":"M1089.3,313.4L1087.1,314.6L1084.8,316.7L1082.1,316.9L1080.3,322.3L1078.7,323.2L1080.6,327.5L1083,331.1L1084.6,334.3L1083.2,338.6L1081.9,339.5L1082.8,342L1085.4,345.9L1085.8,348.7L1085.8,351L1087.3,355.5L1085.2,360.1L1083.3,365.1L1082.9,361.5L1084.1,357.7L1082.8,354.8L1083.1,349.4L1081.5,346.8L1080.3,340.9L1079.6,334.7L1077.9,330.6L1075.3,333.1L1070.9,336.6L1068.7,336.2L1066.3,335L1067.6,328.9L1066.8,324.3L1063.8,318.6L1064.2,316.8L1062,316.2L1059.2,312.2L1059,308.2L1060.3,309L1060.4,305.4L1062.3,304.3L1061.9,302.2L1062.8,300.5L1062.9,295.4L1066,296.5L1067.7,292.4L1067.9,290L1070,285.9L1069.9,283.1L1075,279.7L1077.7,280.6L1077.4,277.5L1078.8,276.6L1078.5,274.8L1080.8,274.4L1082.1,277.3L1083.8,278.5L1083.9,282.3L1083.7,286.3L1080,290.4L1079.6,296.3L1083.7,295.5L1084.6,300L1087.1,301L1085.9,305L1088.8,306.9L1090.5,307.8L1093.4,306.4L1093.5,308.4L1090.2,311.6Z"},{"d":"M1105.7,362.4L1109.1,360.4L1113.2,360L1111.5,357.1L1118,353.3L1118.5,347.4L1117.6,344.1L1118.3,339.1L1117.3,335.7L1114.4,332.2L1111.9,327.9L1108.7,322.1L1104,319.1L1105.2,317.3L1107.6,316.1L1106.1,311.8L1101.3,311.7L1099.6,307.2L1097.3,303.3L1099.4,302.1L1102.5,302.2L1106.3,301.6L1109.6,299L1111.5,300.8L1115,301.7L1114.4,304.6L1116.3,306.6L1120.2,307.8L1115,312.1L1111.8,316.7L1110.9,320.1L1113.9,325.3L1117.5,331.8L1121,334.8L1123.4,338.8L1125.2,347.9L1124.7,356.6L1121.4,359.8L1117,363L1113.8,367.1L1109,371.7L1107.5,368.5L1108.6,365.2Z","u":"vietnam"},{"d":"M1208.6,206L1208.6,206L1208.6,206ZM1208,205.1L1208.6,206L1207.1,205.7L1205.4,207.3L1204.3,209L1204.4,212.6L1202.4,213.6L1201.7,214.5L1200.2,216L1197.7,216.8L1196,218.1L1195.8,220.2L1195.4,220.8L1196.9,221.6L1199.1,223.7L1198.6,224.9L1196.9,225.3L1194.2,225.5L1192.7,227.7L1190.9,227.5L1190.7,228L1188.8,227.1L1188.3,228L1187.2,228.4L1187,227.5L1186,227L1185,226.2L1186.1,224.1L1187,223.5L1186.6,222.6L1187.6,219.9L1187.4,219.1L1185.1,218.6L1183.3,217.3L1186.4,214.1L1190.7,211.4L1193.4,207.9L1195.2,209.5L1198.6,209.7L1198,207.1L1204,204.9L1205.5,202.2Z"},{"d":"M1190.7,228L1190.9,227.5L1192.7,227.7L1194.2,225.5L1196.9,225.3L1198.6,224.9L1199.1,223.7L1202.5,229.6L1203.5,232.8L1203.5,238.4L1202,241.1L1198.5,242.1L1195.4,244.1L1191.9,244.6L1191.5,241.9L1192.2,238.2L1190.5,233L1193.3,232.2Z","u":"south-korea"},{"d":"M1041.3,171.1L1045.3,170.2L1052.8,166L1058.7,163.6L1062.1,165.2L1066.1,165.2L1068.7,167.5L1072.6,167.7L1078.2,169L1082,165.5L1080.4,162.6L1084.5,157.5L1088.8,159.6L1092.3,160.1L1096.9,161.4L1097.7,165.1L1103.2,167.2L1106.9,166.3L1111.8,165.6L1115.7,166.3L1119.5,168.6L1121.8,171.1L1125.5,171.1L1130.4,171.9L1133.9,170.7L1139.1,169.9L1144.7,166.4L1147.1,166.9L1149.1,168.6L1153.8,168.2L1151.9,171.9L1149.1,176.8L1150.1,178.8L1152.3,178.2L1156.1,179L1159.1,177.1L1162.3,178.7L1165.8,182.2L1165.4,183.9L1162.3,183.4L1156.6,184L1153.9,185.4L1151.1,188.7L1145.1,190.6L1141.2,193.2L1137.2,192.2L1135.1,191.8L1133,194.9L1134.3,196.8L1134.9,198.5L1132.2,200.1L1129.4,202.7L1124.8,204.5L1119,204.7L1112.7,206.4L1108.2,209L1106.5,207.5L1101.8,207.5L1096,204.5L1092.2,203.8L1087,204.5L1079,203.3L1074.7,203.5L1072.4,200.5L1070.6,196L1068.2,195.4L1063.5,192.4L1058.3,191.7L1053.7,190.8L1052.3,188.7L1053.8,182.9L1051.1,179L1045.5,177.1L1042.3,174.5Z"},{"d":"M1078.5,274.8L1078.8,276.6L1077.4,277.5L1077.7,280.6L1075,279.7L1069.9,283.1L1070,285.9L1067.9,290L1067.7,292.4L1066,296.5L1062.9,295.4L1062.8,300.5L1061.9,302.2L1062.3,304.3L1060.4,305.4L1058.3,297.6L1057.3,297.6L1056.6,300.8L1054.5,298.2L1055.7,295.4L1057.4,295.1L1059.2,291L1057,290.1L1053.4,290.2L1049.7,289.5L1049.4,286.1L1047.5,285.8L1044.4,283.7L1043,287.1L1045.8,289.7L1043.4,291.5L1042.5,293.3L1044.9,294.6L1044.3,297.6L1045.6,301.3L1046.2,305.4L1045.7,307.2L1043,307.1L1038.2,308.1L1038.5,311.8L1036.4,314.7L1030.8,318.1L1026.4,323.9L1023.5,327L1019.6,330.2L1019.6,332.5L1017.7,333.7L1014.2,335.5L1012.4,335.7L1011.2,339.5L1012,345.9L1012.2,350L1010.6,354.7L1010.6,363L1008.5,363.3L1006.8,367L1008,368.7L1004.4,370.1L1003.1,373.4L1001.5,374.8L997.9,370.2L996.1,363.3L994.6,358.3L993.2,356L991.1,351.3L990.2,345.1L989.5,342L986,335.3L984.4,325.7L983.2,319.4L983.2,313.4L982.4,308.8L976.8,311.8L974,311.2L969,305.2L970.8,303.4L969.7,301.5L965.1,297.3L967.7,294L976.3,294L975.5,289.8L973.3,287.3L972.9,283.5L970.3,281.3L974.6,276.1L979.1,276.5L983.2,271.3L985.6,266.3L989.4,261.4L989.4,257.9L992.7,255L989.5,252.6L988.2,249.2L986.8,244.9L988.7,242.8L994.6,244L999,243.3L1002.7,239.1L1006.9,244.9L1006.5,248.9L1008,251.4L1007.9,254L1005.1,253.3L1006.2,258.7L1010,261.8L1015.4,265.3L1013,267.5L1011.5,272.1L1015.2,274L1018.9,276.4L1024,279.2L1029.3,279.8L1031.5,282.3L1034.5,282.8L1039.2,284L1042.5,283.9L1042.9,281.9L1042.4,278.8L1042.7,276.7L1045.1,275.6L1045.4,279.5L1045.5,280.5L1049,282.4L1051.5,281.6L1054.7,281.9L1057.9,281.8L1058.2,278.8L1056.6,277.2L1059.7,276.6L1063.3,272.9L1067.8,269.8L1071,271L1073.8,268.9L1075.6,272L1074.3,274Z","u":"india"},{"d":"M1060.4,305.4L1060.3,309L1059,308.2L1059.2,312.2L1058.1,309.6L1057.9,307.1L1057.1,304.7L1055.5,301.9L1051.9,301.7L1052.3,303.7L1051.1,306.4L1049.4,305.4L1048.8,306.3L1047.7,305.8L1046.2,305.4L1045.6,301.3L1044.3,297.6L1044.9,294.6L1042.5,293.3L1043.4,291.5L1045.8,289.7L1043,287.1L1044.4,283.7L1047.5,285.8L1049.4,286.1L1049.7,289.5L1053.4,290.2L1057,290.1L1059.2,291L1057.4,295.1L1055.7,295.4L1054.5,298.2L1056.6,300.8L1057.3,297.6L1058.3,297.6Z"},{"d":"M1056.6,277.2L1058.2,278.8L1057.9,281.8L1054.7,281.9L1051.5,281.6L1049,282.4L1045.5,280.5L1045.4,279.5L1048,275.8L1050.1,274.6L1052.8,275.7L1054.9,275.9Z"},{"d":"M1042.7,276.7L1042.4,278.8L1042.9,281.9L1042.5,283.9L1039.2,284L1034.5,282.8L1031.5,282.3L1029.3,279.8L1024,279.2L1018.9,276.4L1015.2,274L1011.5,272.1L1013,267.5L1015.4,265.3L1017,264.1L1020.2,265.6L1024.1,268.8L1026.3,269.5L1027.6,271.9L1030.6,272.9L1033.8,275.1L1038.2,276.2Z"},{"d":"M1002.7,239.1L999,243.3L994.6,244L988.7,242.8L986.8,244.9L988.2,249.2L989.5,252.6L992.7,255L989.4,257.9L989.4,261.4L985.6,266.3L983.2,271.3L979.1,276.5L974.6,276.1L970.3,281.3L972.9,283.5L973.3,287.3L975.5,289.8L976.3,294L967.7,294L965.1,297.3L962.3,296L961.1,292.5L958.1,288.8L950.9,289.7L944.6,289.8L939.2,290.5L940.6,284.7L946.2,282.2L945.9,279.9L944,279.1L943.9,274.8L940.2,272.6L938.7,269.6L936.7,267L943.2,269.6L947.1,268.8L949.5,269.4L950.2,268.4L953,268.8L958,266.8L958.2,262.6L960.3,259.8L963.2,259.8L963.6,258.4L966.6,257.7L968.1,258.2L969.6,256.8L969.4,253.9L971,250.9L973.5,249.6L971.9,246.4L975.7,246.5L976.7,244.8L976.6,242.9L978.5,240.8L978.1,238.3L977.1,236.3L979.4,234.1L983.6,233.1L988,232.5L990,231.6L992.3,231L995.2,233.3L996.3,237.1Z"},{"d":"M958.7,229.9L960.8,229.9L963.8,231L965,231.6L967.8,230L969.1,230.9L970.4,228.7L972.7,228.8L973.3,228.1L973.7,226.1L975.4,224.4L977.5,225.5L977,227L978.2,227.2L977.9,231.4L979.4,233L980.8,231.9L982.5,231.5L984.9,229.2L987.6,229.6L991.6,229.6L992.3,231L990,231.6L988,232.5L983.6,233.1L979.4,234.1L977.1,236.3L978.1,238.3L978.5,240.8L976.6,242.9L976.7,244.8L975.7,246.5L971.9,246.4L973.5,249.6L971,250.9L969.4,253.9L969.6,256.8L968.1,258.2L966.6,257.7L963.6,258.4L963.2,259.8L960.3,259.8L958.2,262.6L958,266.8L953,268.8L950.2,268.4L949.5,269.4L947.1,268.8L943.2,269.6L936.7,267L940.3,262.6L939.9,259.4L937,258.6L936.7,255.4L935.4,251.5L937.1,248.8L935.4,248.1L936.5,244.5L938,238.3L942,240.2L944.9,239.6L945.8,237.3L948.8,236.6L951,235.1L951.8,231.1L955.1,230.2L955.7,228.4L957.5,229.7Z"},{"d":"M963.8,231L966,226L965.1,222.3L962.3,221.1L963.3,219L966.5,219.2L968.4,216.5L969.6,213.3L974.8,212.2L974,214.5L974.6,215.8L976.2,215.7L974.7,217.2L970.5,216.4L970.1,219.2L974.4,218.9L979.2,220.5L986.5,219.7L987.5,224.3L988.8,223.8L991.1,224.9L991,226.8L991.6,229.6L987.6,229.6L984.9,229.2L982.5,231.5L980.8,231.9L979.4,233L977.9,231.4L978.2,227.2L977,227L977.5,225.5L975.4,224.4L973.7,226.1L973.3,228.1L972.7,228.8L970.4,228.7L969.1,230.9L967.8,230L965,231.6Z"},{"d":"M976,205.7L976.8,203.6L979.4,202.9L985.8,204.6L986.4,201.7L988.6,200.6L994.2,202.7L995.6,202.2L1002,202.3L1007.8,202.8L1009.7,204.6L1012.1,205.3L1011.6,206.4L1005.4,209.1L1004.1,211.1L999.1,211.6L997.6,214.8L993.5,214.1L990.8,215.1L987.1,217.4L987.6,218.6L986.5,219.7L979.2,220.5L974.4,218.9L970.1,219.2L970.5,216.4L974.7,217.2L976.2,215.7L979.1,216.2L984.1,212.6L979.5,210L976.7,211.3L973.9,209.4L977.1,206.2Z"},{"d":"M904.2,208.1L905.9,206.5L910.3,205.4L912.9,206.8L915.7,210.7L917.7,210.4L922,210.4L921.4,207.9L924.7,206.2L928,203.3L933.2,205.9L933.7,209.9L935.1,210.9L939.4,210.7L940.7,211.6L942.6,216.6L947,220L949.5,222.4L953.6,224.8L958.8,226.9L958.7,229.9L957.5,229.7L955.7,228.4L955.1,230.2L951.8,231.1L951,235.1L948.8,236.6L945.8,237.3L944.9,239.6L942,240.2L938,238.3L937.7,234.2L934.8,234L930.4,229.7L927.3,229.1L922.9,226.6L920.2,226.2L918.5,227.1L915.9,226.9L913.1,229.8L909.7,230.7L909,227.2L909.5,222.1L906.5,220.4L907.5,217L904.9,216.7L905.8,212.6L909.4,213.8L912.9,212.2L910,209.3L908.9,206.4L905.8,207.7L905.4,211.3Z"},{"d":"M888.9,266.6L886.7,264L886.7,261.3L885.4,261.3L886.1,257.8L884.1,254L879.3,251.3L876.6,246.6L877.5,242.8L879.5,241.1L879.2,238.2L876.6,236.7L874.1,230.8L872,226.9L872.8,225.4L871.5,219.7L874.2,218.3L874.8,220.2L876.8,222.5L879.4,223.1L880.9,223L885.4,219.3L886.9,219L888,220.4L886.7,222.8L889.1,225.4L890.1,225.2L891.3,228.8L895,229.8L897.7,232.3L903.2,233.2L909.3,231.9L909.7,230.7L913.1,229.8L915.9,226.9L918.5,227.1L920.2,226.2L922.9,226.6L927.3,229.1L930.4,229.7L934.8,234L937.7,234.2L938,238.3L936.5,244.5L935.4,248.1L937.1,248.8L935.4,251.5L936.7,255.4L937,258.6L939.9,259.4L940.3,262.6L936.7,267L938.7,269.6L940.2,272.6L943.9,274.8L944,279.1L945.9,279.9L946.2,282.2L940.6,284.7L939.2,290.5L931.8,289L927.6,287.8L923.2,287.2L921.6,281.2L919.7,280.3L916.7,281.2L912.8,283.5L908,281.9L904.1,278.1L900.4,276.7L897.8,272L894.9,265.5L892.8,266.3L890.3,264.6Z"},{"d":"M838.9,252.8L838.8,252.8L839.4,252.1L839.3,250L840.3,247.3L842.4,245.5L841.7,243.6L840,243.3L839.6,239.5L840.6,237.5L841.6,236.4L842.7,235.3L842.9,232.6L844.2,233.6L848.4,232.2L850.5,233.1L853.7,233.1L858.2,231.2L860.3,231.3L864.7,230.6L862.7,233.6L860.6,234.9L860.9,238.4L859.5,244.4L850.9,249.5L843.2,254.8Z"},{"d":"M880.9,223L879.4,223.1L877.9,220.3L877.9,219.5L876.2,219.5L875,218.2L874.2,218.3L872.7,216.9L869.8,215.7L870.2,213.3L869.5,211.5L874.9,210.7L875.7,212L877.2,212.9L876.4,214.1L878.5,215.8L877.4,217.4L879,218.7L880.8,219.5Z"},{"d":"M742.9,124L744.6,121.1L747.8,117.7L749.1,111.9L746.6,109.4L746.4,102.9L748.9,98.3L752.8,98.4L754.1,96.4L752.7,94.7L758.8,87.8L762.6,82.3L765.2,78.8L768.9,78.8L770,76.1L777.3,76.9L777.9,73.6L780.3,73.4L785.5,75.8L791.5,79.2L791.7,86.8L793,88.7L786.3,90.1L782.5,93.5L783.1,96.5L776.9,100.5L769.4,104.8L766.6,111.7L769.4,115.2L773.1,117.9L769.5,123.5L765.4,124.6L764,132.9L761.8,137.5L757,137L754.8,140.9L750.3,141.2L749.1,136.5L745.8,130.9Z"},{"d":"M809.6,137.2L813.7,138.4L814.2,139.7L816.3,139.1L820.1,140.2L820.5,142.6L819.6,143.9L822,147.1L823.6,148L823.4,148.9L826,149.8L827.1,151.1L825.6,152.2L822.5,152L821.7,152.5L822.7,154.1L823.6,157.2L820.3,157.5L819.1,158.6L818.8,161.1L817.3,160.6L813.8,160.9L812.8,159.7L811.3,160.6L809.8,159.9L806.8,159.8L802.4,158.6L798.5,158.2L795.5,158.3L793.4,159.6L791.5,159.8L791.4,157.6L790.2,155.3L792.5,154.3L792.6,152.4L791.5,150.5L791.3,148.3L795.1,148.4L799.3,146.5L800.2,143.7L803.4,142.1L803,139.9L805.4,139.1Z"},{"d":"M823.6,157.2L825.1,157.4L826.1,156.3L827.2,156.6L831.3,156.1L833.8,158.9L832.8,159.9L833.1,161.4L836.2,161.7L837.6,163.8L837.5,164.8L842.4,166.5L845.4,165.7L847.8,168L850.1,168L855.8,169.6L855.9,171L854.3,173.6L855.2,176.3L854.5,178L850.8,178.3L848.8,179.7L848.6,181.9L845.5,182.3L842.9,183.9L839.3,184.1L836,186L836.2,188.6L835.6,188.5L835.1,187.5L833.8,187.3L831,186.2L830,187.5L829.5,186.9L823.4,185.7L823.2,183.8L819.6,184.4L818.1,187.2L815.1,190.8L813.4,190L811.5,190.8L809.8,189.8L810.8,189.3L811.5,187.6L812.5,186.1L812.2,185.2L813.1,184.8L813.4,185.5L815.7,185.6L816.8,185.2L816,184.7L816.3,184L814.9,182.7L814.4,180.7L813,179.9L813.3,178.2L811.5,176.9L809.9,176.7L807,175.2L804.4,175.6L803.5,176.4L801.9,176.4L800.9,177.5L798,178L796.7,178.8L794.9,177.6L792.4,177.5L790,177L788.3,178.1L788.1,176.7L785.9,175.4L786.7,173.4L787.7,172.1L788.6,172.4L787.6,170.2L791.1,166.1L793,165.5L793.4,164.1L791.5,159.8L793.4,159.6L795.5,158.3L798.5,158.2L802.4,158.6L806.8,159.8L809.8,159.9L811.3,160.6L812.8,159.7L813.8,160.9L817.3,160.6L818.8,161.1L819.1,158.6L820.3,157.5Z"},{"d":"M791.3,148.3L791.5,150.5L792.6,152.4L792.5,154.3L790.2,155.3L791.4,157.6L791.5,159.8L793.4,164.1L793,165.5L791.1,166.1L787.6,170.2L788.6,172.4L787.7,172.1L784,170.2L781.2,170.9L779.4,170.4L777.1,171.5L775.1,169.7L773.5,170.4L773.3,170.1L771.5,167.7L768.6,167.4L768.3,165.8L765.6,165.3L765,166.5L762.9,165.5L763.1,164.2L760.3,163.7L758.4,162.1L756.8,159L757.1,157.3L756.1,154.7L754.7,152.9L755.8,151.6L754.9,149.1L757.6,147.6L763.6,145.4L768.5,143.7L772.4,144.5L772.7,145.7L776.5,145.8L781.3,146.3L788.4,146.3L790.4,146.8Z"},{"d":"M766,176.9L765.7,178.9L763.6,178.9L764.3,180L763,183.1L762.3,184L758.9,184.1L756.9,185.2L753.7,184.8L748.1,183.5L747.3,181.8L743.4,182.7L743,183.6L740.6,182.9L738.6,182.8L736.9,181.9L737.5,180.7L737.3,179.8L738.5,179.5L740.5,180.9L741,179.6L744.4,179.8L747.2,178.9L749.1,179.1L750.3,180.1L750.7,179.3L750.1,176L751.5,175.4L752.9,173.1L755.8,174.7L758,172.7L759.3,172.3L762.3,173.8L764.2,173.6L766,174.5L765.6,175.1Z","u":"euro-area"},{"d":"M785.9,175.4L788.1,176.7L788.3,178.1L785.9,179.1L784.1,182.4L781.8,185.8L778.6,186.7L776.2,186.5L773.2,187.8L771.8,188.5L768.6,187.6L765.7,185.5L764.4,184.8L763.7,183.2L763,183.1L764.3,180L763.6,178.9L765.7,178.9L766,176.9L768,178.1L769.4,178.7L772.7,178.1L773,177.1L774.6,176.9L776.5,176.1L776.9,176.5L778.7,175.8L779.6,174.7L780.9,174.4L785.1,175.9Z"},{"d":"M803.5,176.4L804.4,175.6L807,175.2L809.9,176.7L811.5,176.9L813.3,178.2L813,179.9L814.4,180.7L814.9,182.7L816.3,184L816,184.7L816.8,185.2L815.7,185.6L813.4,185.5L813.1,184.8L812.2,185.2L812.5,186.1L811.5,187.6L810.8,189.3L809.8,189.8L809.1,187.6L809.5,185.5L809.4,183.3L807.2,180.4L805.9,178.3L804.7,176.9Z"},{"d":"M809.8,189.8L811.5,190.8L813.4,190L815.1,190.8L815.2,192.1L813.3,193.1L812.1,192.7L811.1,198.6L808.8,198.1L805.9,196.3L801.4,197.5L799.4,198.7L793.7,198.5L790.7,197.7L789.2,198L788.1,196L787.4,195.2L788.3,194.3L787.3,193.7L786.1,194.8L783.9,193.4L783.5,191.4L781.2,190.2L780.7,188.6L778.6,186.7L781.8,185.8L784.1,182.4L785.9,179.1L788.3,178.1L790,177L792.4,177.5L794.9,177.6L796.7,178.8L798,178L800.9,177.5L801.9,176.4L803.5,176.4L804.7,176.9L805.9,178.3L807.2,180.4L809.4,183.3L809.5,185.5L809.1,187.6Z"},{"d":"M803,139.9L803.4,142.1L800.2,143.7L799.3,146.5L795.1,148.4L791.3,148.3L790.4,146.8L788.4,146.3L788.1,145L788.5,143.7L786.8,142.9L782.7,142L781.9,137.9L786.3,136.4L792.9,136.7L796.7,136.2L797.2,137.2L799.3,137.5Z","u":"euro-area"},{"d":"M806.1,130.8L808,131.9L808.3,134.3L809.6,137.2L805.4,139.1L803,139.9L799.3,137.5L797.2,137.2L796.7,136.2L792.9,136.7L786.3,136.4L781.9,137.9L782,134.2L783.9,131.1L787.6,129.4L790.7,133.1L793.8,133L794.6,129.2L797.9,128.3L799.6,128.9L802.9,130.8Z","u":"euro-area"},{"d":"M808.8,120.9L809.4,121.8L806.6,124.6L807.8,129.2L806.1,130.8L802.9,130.8L799.6,128.9L797.9,128.3L794.6,129.2L795,126.3L793.6,126.9L791.1,125.2L790.8,122.3L795.7,120.9L800.6,120.2L804.8,121Z","u":"euro-area"},{"d":"M754.9,149.1L755.8,151.6L754.7,152.9L756.1,154.7L757.1,157.3L756.8,159L758.4,162.1L756.7,162.7L755.6,162.1L754.7,163L751.9,164L750.4,165.2L747.6,166.3L748.3,167.8L748.7,169.8L750.7,171L752.9,173.1L751.5,175.4L750.1,176L750.7,179.3L750.3,180.1L749.1,179.1L747.2,178.9L744.4,179.8L741,179.6L740.5,180.9L738.5,179.5L737.3,179.8L733.1,178.3L732.3,179.4L729,179.3L729.5,175.8L731.5,172.5L725.9,171.5L724.1,170.2L724.3,168.1L723.5,167L723.9,163.6L723.3,158.5L725.6,158.5L726.6,156.6L727.6,152.1L726.9,150.4L727.6,149.4L730.9,149.1L731.6,150.2L734.2,147.8L733.3,145.9L733.2,143.1L736.1,143.8L738.6,143L738.6,144.9L742.6,146.1L742.5,147.8L746.5,146.9L748.7,145.6L753.1,147.5Z","u":"euro-area"},{"d":"M788.1,196L789.2,198L790.7,197.7L793.7,198.5L799.4,198.7L801.4,197.5L805.9,196.3L808.8,198.1L811.1,198.6L809,200.7L807.6,204.2L808.9,207L805.5,206.3L801.6,207.9L801.5,210.3L798,210.8L795.3,209.1L792.1,210.4L789.3,210.3L789,207L787,205.5L787.7,204.8L787.3,204.2L787.9,202.6L789.4,201.1L787.5,198.9L787.2,197.1Z"},{"d":"M802.2,240.1L801.7,241.5L796.1,241.9L796.2,241.1L791.4,240.2L792.2,238.1L794.3,239.7L797.3,239.5L800.2,239.8L800.1,240.7ZM789.3,210.3L792.1,210.4L795.3,209.1L798,210.8L801.5,210.3L801.6,207.9L803.5,209.2L802.3,212.3L801.3,212.8L799,212.7L796.9,212.2L792.2,213.5L794.9,216.3L792.9,217.1L790.8,217.1L788.7,214.6L788,215.6L788.9,218.6L790.8,220.9L789.3,222L791.5,224.2L793.4,225.7L793.5,228.5L789.9,227.2L791,229.7L788.6,230.2L790,234.5L787.5,234.6L784.3,232.5L782.8,228.5L782.1,225.2L780.6,223L778.6,220.2L778.4,218.8L780.2,216.4L780.4,214.8L781.7,214L781.7,212.8L784.3,212.3L785.8,211.2L787.9,211.3L788.5,210.5Z","u":"euro-area"},{"d":"M874.1,230.8L872.3,231.7L870.9,230.4L866.4,229.8L864.7,230.6L860.3,231.3L858.2,231.2L853.7,233.1L850.5,233.1L848.4,232.2L844.2,233.6L842.9,232.6L842.7,235.3L841.6,236.4L840.6,237.5L839.2,235.3L840.6,233.4L838.3,233.8L835,232.7L832.3,235.5L826.4,236.1L823.3,233.4L819.1,233.3L818.2,235.3L815.5,235.9L811.7,233.3L807.5,233.4L805.2,228.5L802.3,225.7L804.2,221.9L801.8,219.5L806.1,214.8L812.1,214.6L813.7,210.9L821.1,211.5L825.8,208.3L830.3,207L836.8,206.8L843.6,210.3L849.1,212.2L853.7,211.5L857,211.9L861.6,209.3L865.7,209.1L869.5,211.5L870.2,213.3L869.8,215.7L872.7,216.9L874.2,218.3L871.5,219.7L872.8,225.4L872,226.9ZM801.6,207.9L805.5,206.3L808.9,207L809.3,208.9L812.7,210.5L812,211.7L807.4,212L805.8,213.5L802.5,216.2L801.3,213.9L801.3,212.8L802.3,212.3L803.5,209.2Z","u":"turkey"},{"d":"M781.7,212.8L781.7,214L780.4,214.8L780.2,216.4L778.4,218.8L777.7,218.4L777.6,217.3L775.5,215.7L775.1,213.3L775.5,210L776,208.4L775.3,207.6L775.1,206.1L776.8,203.6L777,204.6L778.1,204.1L778.9,205.5L779.8,206L780.1,207.8L779.6,209.4L780.1,211.5Z"},{"d":"M764.4,184.8L765.7,185.5L768.6,187.6L771.8,188.5L773.2,187.8L774.2,189.7L775.4,191.1L773.9,192.9L772.2,191.9L769.5,191.9L766.1,191.1L764.3,191.2L763.5,192.2L762.1,191.1L761.2,193.1L763.1,195.5L764,197L765.8,198.8L767.3,199.9L768.7,202L772.2,203.8L771.7,204.7L768.1,202.9L765.8,201.1L762.3,199.6L759,196L759.8,195.6L758,193.5L758,191.9L755.4,191.1L754.3,193.2L753.1,191.6L753.2,189.9L753.3,189.8L756.1,190L756.8,189.1L758.1,189.9L759.6,190L759.6,188.6L761,188.1L761.3,186.2Z","u":"euro-area"},{"d":"M737.3,179.8L737.5,180.7L736.9,181.9L738.6,182.8L740.6,182.9L740.3,184.9L738.6,185.8L735.7,185.2L734.9,187.1L733,187.3L732.3,186.5L730.2,188.2L728.3,188.4L726.6,187.4L725.3,185.2L723.4,186L723.5,183.7L726.3,181L726.2,179.7L728,180.2L729,179.3L732.3,179.4L733.1,178.3Z","u":"switzerland"},{"d":"M723.5,167L724.3,168.1L724.1,170.2L722.9,170.4L722.1,169.9L722.5,167.2Z","u":"euro-area"},{"d":"M723.9,163.6L723.5,167L722.5,167.2L722.1,169.9L718.7,167.7L716.7,168.1L714,165.7L712.1,163.8L710.3,163.7L709.8,161.9L712.9,161L715.7,161.4L719.3,160.3L721.8,162.5Z","u":"euro-area"},{"d":"M726.9,150.4L727.6,152.1L726.6,156.6L725.6,158.5L723.3,158.5L723.9,163.6L721.8,162.5L719.3,160.3L715.7,161.4L712.9,161L714.9,159.6L718.3,152.4L723.6,150.3Z","u":"euro-area"},{"d":"M664.9,207.6L666.3,206.4L667.9,205.7L668.8,208.1L671.1,208.1L671.8,207.4L674.1,207.6L675.2,210.1L673.4,211.4L673.3,215.3L672.7,216L672.5,218.3L670.8,218.7L672.4,221.7L671.3,224.9L672.7,226.4L672.1,227.7L670.7,229.6L671,231.2L669.4,232.5L667.4,231.8L665.4,232.3L666,228.5L665.6,225.5L663.9,225L662.9,223.1L663.3,219.9L664.8,218.1L665.1,216.1L665.9,213.2L665.8,211.1L665,209.3Z","u":"euro-area"},{"d":"M671,231.2L670.7,229.6L672.1,227.7L672.7,226.4L671.3,224.9L672.4,221.7L670.8,218.7L672.5,218.3L672.7,216L673.3,215.3L673.4,211.4L675.2,210.1L674.1,207.6L671.8,207.4L671.1,208.1L668.8,208.1L667.9,205.7L666.3,206.4L664.9,207.6L665.1,204.1L663.5,202L669,198.4L673.7,199.3L679,199.3L683.1,200.1L686.3,199.9L692.6,200L694.2,201.9L701.3,204.2L702.7,203.1L707.1,205.4L711.6,204.7L711.8,207.6L708.1,210.9L703.2,211.9L702.8,213.6L700.4,216.3L698.9,220.3L700.4,223.1L698.2,225.3L697.3,228.5L694.4,229.5L691.6,233.3L686.7,233.4L683,233.3L680.6,235L679.1,236.9L677.2,236.5L675.7,234.8L674.6,232Z","u":"euro-area"},{"d":"M675.9,148.5L676.5,152.1L673.6,156.5L666.7,159.4L661.2,158.6L664.3,153.5L662.3,148.5L667.6,144.6L670.6,142.3L671.3,145L670.6,147.6L673,147.5Z","u":"euro-area"},{"d":"M1344.7,518L1347.9,521.1L1349.9,523.3L1348.4,524.5L1346.3,523.2L1343.5,521L1341,518.3L1338.4,514.9L1337.9,513.2L1339.6,513.3L1341.7,514.9L1343.5,516.6Z"},{"d":"M1330.5,465.8L1331.6,467.5L1328.8,467.4L1327.4,464.4L1329.7,465.6ZM1328.8,461.4L1328.2,462.3L1325.3,458L1324.5,455.1L1325.8,455.1L1327.2,459ZM1325.5,462.8L1324,462.9L1321.6,462.4L1320.8,461.6L1321.1,459.6L1323.6,460.4L1324.9,461.5ZM1320.8,453.6L1321.7,455.2L1321.9,456.2L1318.9,454.1L1316.7,452.3L1315.3,450.7L1315.8,450.2L1317.6,451.4ZM1311.1,448.7L1312.7,450.3L1311.9,450.6L1310.2,449.5L1308.6,447.4L1308.8,446.6Z"},{"d":"M1387.9,611.6L1386.4,614.3L1384.5,617.6L1381.5,619.6L1380.8,618.3L1379.2,617.6L1381.4,613.5L1380.2,610.8L1376,608.8L1376.1,607.1L1378.9,605.3L1379.6,601.5L1379.4,598.4L1377.8,595.1L1377.9,594.2L1376,592.2L1373,587.8L1371.4,584.3L1372.8,583.9L1374.9,586.7L1378,587.9L1379,592.3L1381.9,597.5L1381.9,594.1L1383.7,595.5L1384.3,599.2L1387.4,600.8L1390,601.2L1392.3,599.3L1394.2,599.9L1393.3,604.3L1392.1,607.2L1389.1,607.1L1388.1,608.6L1388.5,610.7ZM1359.8,628.8L1363.2,626.2L1365.5,623.7L1367.2,620L1368.7,618.7L1369.3,616L1372,613.7L1372.9,615.8L1373.7,617.8L1376.5,615.8L1377.6,617.9L1377.6,620L1376.2,622.3L1373.6,625.9L1371.7,627.9L1373.1,630.3L1370.1,630.3L1366.8,632.2L1365.7,635.4L1363.5,640.4L1360.5,642.6L1358.5,644L1354.9,643.9L1352.4,642.3L1348.2,641.9L1347.5,640.1L1349.6,636.5L1354.5,631.6L1357,630.7Z"},{"d":"M1274.3,615.3L1276.7,615.6L1277,621.4L1275.6,623.1L1275.2,627.1L1273.9,625.8L1271.2,629.2L1270.4,628.9L1268,628.8L1265.6,624.5L1265,621.3L1262.8,617L1262.9,614.7L1265.4,615.2L1269.2,616.9L1271.3,616.2ZM1190.6,572.9L1186.5,575.4L1183.1,576.6L1182.3,579.1L1180.9,581.1L1177.6,581.3L1175.2,581.7L1171.7,580.8L1168.9,581.3L1166.3,581.6L1163.9,584.2L1162.8,584L1160.9,585.4L1159,586.9L1156.1,586.7L1153.5,586.7L1149.4,583.6L1147.3,582.7L1147.4,579.8L1149.3,579.2L1150,578L1149.9,576.3L1150.3,572.8L1149.9,569.9L1147.8,564.9L1147.2,562.1L1147.4,559.3L1145.8,556.1L1145.7,554.7L1144,552.7L1143.5,548.8L1141.3,544.9L1140.8,542.8L1142.5,545L1141.2,540.4L1143.1,541.8L1144.2,543.7L1144.2,541.2L1142.2,537.3L1141.9,535.8L1141,534.3L1141.4,531.4L1142.2,530.2L1142.7,527.8L1142.3,524.9L1143.9,521.3L1144.2,525.1L1145.9,521.7L1149,520L1150.9,517.9L1153.9,516.1L1155.6,515.7L1156.7,516.4L1159.8,514.5L1162.1,514L1162.7,512.9L1163.8,512.4L1165.9,512.6L1170,511.1L1172.1,508.9L1173.1,506.3L1175.4,503.8L1175.6,501.8L1175.7,499.1L1178.4,495L1180,499.2L1181.7,498.2L1180.3,495.9L1181.5,493.5L1183.2,494.6L1183.7,490.8L1185.8,488.4L1186.8,486.5L1188.7,485.6L1188.8,484.2L1190.5,484.8L1190.6,483.6L1192.3,482.9L1194.1,482.2L1197,484.5L1199.2,487.4L1201.6,487.4L1204.1,487.9L1203.3,485.2L1205.1,481.2L1206.9,479.9L1206.3,478.7L1208,475.9L1210.3,474.1L1212.3,474.7L1215.6,473.8L1215.5,471.3L1212.7,469.7L1214.7,468.9L1217.3,470.2L1219.4,472.2L1222.6,473.4L1223.8,472.9L1226.2,474.5L1228.4,473.1L1229.9,473.5L1230.8,472.5L1232.6,475L1231.6,477.6L1230.1,479.6L1228.7,479.8L1229.2,481.7L1228.1,484.2L1226.7,486.6L1226.9,488L1230,490.7L1233,492.3L1235,494L1237.9,496.9L1238.9,496.9L1241,498.2L1241.6,499.7L1245.3,501.4L1247.8,499.7L1248.6,497.1L1249.4,494.9L1249.9,492.2L1251.1,488.2L1250.5,485.9L1250.8,484.4L1250.4,481.6L1250.9,477.9L1251.6,476.9L1251,475.2L1251.9,472.6L1252.7,469.9L1252.8,468.5L1254.2,466.7L1255.3,469.1L1255.6,472.2L1256.6,472.8L1256.7,474.8L1258.1,477.4L1258.4,480.1L1258.3,481.9L1259.7,485.8L1262.2,483.9L1263.5,486L1265.3,488L1264.9,490.1L1265.8,494.4L1266.4,496.8L1267.3,497.4L1268.4,501.6L1268,504.2L1269.3,507.5L1273.5,510.1L1276.3,512.5L1278.9,514.6L1278.3,515.8L1280.6,518.9L1282.1,524.2L1283.6,523.1L1285.2,525.3L1286.2,524.5L1286.8,529.7L1289.6,532.8L1291.4,534.7L1294.4,538.6L1295.5,542.6L1295.6,545.4L1295.4,548.5L1297.2,552.7L1297,557L1296.3,559.3L1295.3,563.7L1295.3,566.5L1294.6,570.1L1292.9,574.5L1290,577L1288.6,580.8L1287.3,583.2L1286.1,587.5L1284.6,589.9L1283.6,593.6L1283.1,597L1283.3,598.6L1281.1,600.3L1276.7,600.5L1273.1,602.5L1271.4,604.4L1269,606.5L1265.8,604.3L1263.4,603.5L1264,600.9L1261.9,601.8L1258.5,605.4L1255.1,604.1L1252.9,603.3L1250.7,602.9L1246.9,601.5L1244.4,598.5L1243.7,594.7L1242.8,592.2L1240.9,590.2L1237.1,589.6L1238.4,587.2L1237.5,583.6L1235.6,587L1232.1,587.9L1234.2,585.2L1234.7,582.3L1236.2,579.9L1235.9,576.3L1232.8,580.5L1230.3,582.2L1228.8,586.1L1225.8,584L1225.9,581.4L1223.5,577.9L1221.4,576L1222.2,574.9L1217.2,571.9L1214.5,571.7L1210.7,569.3L1203.7,569.8L1198.7,571.6L1194.3,573.2Z","u":"australia"},{"d":"M1018.1,377L1017.5,382.1L1015.9,383.5L1012.5,384.7L1010.6,380.7L1009.9,373.7L1011.7,365.7L1014.4,368.4L1016.2,371.9Z"},{"d":"M1125.7,324.4L1122.5,322.9L1122.4,318.6L1124.4,316.4L1128.6,315L1130.8,315.1L1131.7,317L1130,319.2L1129.1,322ZM1012.1,205.3L1011.8,202.5L1014.5,201.2L1011,192.7L1018.7,190.7L1020.7,189.6L1023.5,180.8L1031.2,182.4L1033.4,180.2L1033.5,175.2L1036.8,174.8L1039.7,171.5L1041.3,171.1L1042.3,174.5L1045.5,177.1L1051.1,179L1053.8,182.9L1052.3,188.7L1053.7,190.8L1058.3,191.7L1063.5,192.4L1068.2,195.4L1070.6,196L1072.4,200.5L1074.7,203.5L1079,203.3L1087,204.5L1092.2,203.8L1096,204.5L1101.8,207.5L1106.5,207.5L1108.2,209L1112.7,206.4L1119,204.7L1124.8,204.5L1129.4,202.7L1132.2,200.1L1134.9,198.5L1134.3,196.8L1133,194.9L1135.1,191.8L1137.2,192.2L1141.2,193.2L1145.1,190.6L1151.1,188.7L1153.9,185.4L1156.6,184L1162.3,183.4L1165.4,183.9L1165.8,182.2L1162.3,178.7L1159.1,177.1L1156.1,179L1152.3,178.2L1150.1,178.8L1149.1,176.8L1151.9,171.9L1153.8,168.2L1158.4,170L1163.9,166.9L1163.9,164.7L1167.4,159.5L1169.5,157.9L1169.5,155.2L1167.4,154L1170.6,151.6L1175.4,150.7L1180.6,150.6L1186.4,152L1189.8,153.8L1192.2,158.8L1193.7,160.9L1195,164L1196.5,168.8L1203.2,170.4L1207.8,173.9L1209.4,178.5L1215.3,178.5L1218.7,176.6L1225.1,175.1L1223.1,179.5L1221.6,181.3L1220.2,186.7L1217.6,191.5L1212.9,190.7L1209.5,192.4L1210.6,196.6L1210,202.5L1208,202.6L1208,205.1L1205.5,202.2L1204,204.9L1198,207.1L1198.6,209.7L1195.2,209.5L1193.4,207.9L1190.7,211.4L1186.4,214.1L1183.3,217.3L1177.8,218.7L1175,221L1170.8,222.3L1172.8,220.1L1172,218.1L1175.1,214.8L1173,212.2L1169.7,214L1165.3,217.4L1162.9,220.6L1159.1,220.8L1157.1,223.1L1159.1,226.5L1162.3,227.3L1162.4,229.5L1165.5,230.9L1169.9,227.4L1173.3,229.3L1175.8,229.4L1176.5,232L1171,233.4L1169.1,236.1L1165.4,238.5L1163.4,242L1167.6,244.7L1169.1,249.6L1171.4,254.1L1174.1,257.9L1174,261.5L1171.6,262.9L1172.5,265.5L1174.8,267L1174.2,271L1173.2,274.9L1171,275.4L1168.2,280.7L1165.1,287.2L1161.4,293.1L1156.1,297.6L1150.7,301.8L1146.3,302.3L1143.9,304.5L1142.6,302.9L1140.4,305.4L1134.9,307.9L1130.8,308.6L1129.5,313.8L1127.3,314.1L1126.3,310.5L1127.2,308.6L1122,307L1120.2,307.8L1116.3,306.6L1114.4,304.6L1115,301.7L1111.5,300.8L1109.6,299L1106.3,301.6L1102.5,302.2L1099.4,302.1L1097.3,303.3L1095.3,304.1L1095.9,309.7L1093.8,309.6L1093.5,308.4L1093.4,306.4L1090.5,307.8L1088.8,306.9L1085.9,305L1087.1,301L1084.6,300L1083.7,295.5L1079.6,296.3L1080,290.4L1083.7,286.3L1083.9,282.3L1083.8,278.5L1082.1,277.3L1080.8,274.4L1078.5,274.8L1074.3,274L1075.6,272L1073.8,268.9L1071,271L1067.8,269.8L1063.3,272.9L1059.7,276.6L1056.6,277.2L1054.9,275.9L1052.8,275.7L1050.1,274.6L1048,275.8L1045.4,279.5L1045.1,275.6L1042.7,276.7L1038.2,276.2L1033.8,275.1L1030.6,272.9L1027.6,271.9L1026.3,269.5L1024.1,268.8L1020.2,265.6L1017,264.1L1015.4,265.3L1010,261.8L1006.2,258.7L1005.1,253.3L1007.9,254L1008,251.4L1006.5,248.9L1006.9,244.9L1002.7,239.1L996.3,237.1L995.2,233.3L992.3,231L991.6,229.6L991,226.8L991.1,224.9L988.8,223.8L987.5,224.3L986.5,219.7L987.6,218.6L987.1,217.4L990.8,215.1L993.5,214.1L997.6,214.8L999.1,211.6L1004.1,211.1L1005.4,209.1L1011.6,206.4Z","u":"china"},{"d":"M1173.6,293.8L1171.2,301.7L1169.6,305.8L1167.5,301.6L1167.1,298L1169.4,293.1L1172.5,289.4L1174.3,290.9Z","u":"taiwan"},{"d":"M740.6,182.9L743,183.6L743.4,182.7L747.3,181.8L748.1,183.5L753.7,184.8L753.3,187.2L754.2,189.3L751.1,188.6L747.9,190.4L748.2,192.8L747.7,194.2L749,196.7L752.6,199.2L754.6,203.3L758.9,207.3L761.9,207.2L762.9,208.3L761.8,209.3L765.3,211.1L768.1,212.6L771.5,215.1L771.9,216.1L771.1,217.8L769,215.5L765.6,214.7L764,217.9L766.8,219.7L766.3,222.3L764.7,222.6L762.6,226.8L761,227.2L761,225.7L761.8,223.1L762.6,222L761.1,219.2L759.9,216.7L758.3,216L757.2,213.9L754.7,213L753,211L750.1,210.7L747.1,208.5L743.5,205.3L740.9,202.5L739.7,197.6L737.7,197L734.6,195.4L732.8,196L730.5,198.3L728.9,198.7L729.4,196.6L727.3,195.9L726.2,192.1L727.6,190.6L726.5,188.8L726.6,187.4L728.3,188.4L730.2,188.2L732.3,186.5L733,187.3L734.9,187.1L735.7,185.2L738.6,185.8L740.3,184.9ZM757.4,226.1L760.4,225.6L759,229.5L759.5,231L758.7,233.6L755.7,231.7L753.8,231.2L748.3,228.7L748.9,226.1L753.4,226.6ZM733.9,212.5L735.8,210.9L738.1,214.4L737.6,221L735.8,220.6L734.3,222.3L732.8,221L732.6,215L731.7,212.2Z","u":"euro-area"},{"d":"M738.6,143L736.1,143.8L733.2,143.1L731.6,140.4L731.5,135.4L732.1,134L733.2,132.6L736.6,132.3L738,130.9L741.1,129.5L741,132L739.9,133.6L740.3,135L742.4,135.8L741.5,137.6L740.3,137.1L737.5,140.6ZM748.1,137.5L749.3,140L747,143.9L742.9,141.2L742.4,139.1Z"},{"d":"M675.9,148.5L673,147.5L670.6,147.6L671.3,145L670.6,142.3L673.8,142.1L678,145.2ZM688,150.8L688,150.8L688.5,148L685.9,144.9L685.9,144.9L681.2,144L680.2,142.7L681.7,140.5L680.4,139.1L678.3,141.4L678,136.7L676.1,134.2L677.5,129.1L680.5,125.1L683.6,125.5L688.3,125L684.2,130.4L688.1,129.7L692.4,129.7L691.4,133.7L687.9,138.2L691.9,138.5L692.2,139L695.7,144.8L698.3,145.6L700.7,151.2L701.8,153.2L706.5,154.1L706.1,157.3L704.1,158.7L705.6,161.2L702.1,163.8L696.9,163.8L690.3,165.1L688.5,164.2L685.9,166.5L682.3,165.9L679.6,167.8L677.5,166.8L683.2,161.6L686.7,160.6L686.7,160.6L680.6,159.8L679.5,157.8L683.6,156.3L681.5,153.6L682.2,150.4Z","u":"united-kingdom"},{"d":"M643.6,86.5L642.7,89.7L647.1,93L642,96.8L630.8,100.2L627.4,101.1L622.3,100.3L611.5,98.8L615.3,96.6L606.8,94.2L613.7,93.2L613.6,91.8L605.4,90.7L608,87.4L613.9,86.7L620,90.1L625.9,87.4L630.8,88.8L637.1,86.1Z"},{"d":"M880.5,207.7L881.6,207.9L884.2,210.9L885.9,211.2L886.6,210L888.9,208L891,210.6L893,214.1L894.8,214.3L896,215.6L892.8,216L892.1,219.9L891.4,221.6L890,222.7L890.1,225.2L889.1,225.4L886.7,222.8L888,220.4L886.9,219L885.4,219.3L880.9,223L880.8,219.5L879,218.7L877.4,217.4L878.5,215.8L876.4,214.1L877.2,212.9L875.7,212L874.9,210.7L875.8,209.9L878.7,211.4L880.8,211.7L881.4,211.1L879.5,208.4ZM879.4,223.1L876.8,222.5L874.8,220.2L874.2,218.3L875,218.2L876.2,219.5L877.9,219.5L877.9,220.3Z"},{"d":"M855.4,200L855.9,199.4L859.1,200.2L864.9,201L870.2,203.4L870.8,204.3L873.2,203.5L876.8,204.6L878,206.6L880.5,207.7L879.5,208.4L881.4,211.1L880.8,211.7L878.7,211.4L875.8,209.9L874.9,210.7L869.5,211.5L865.7,209.1L861.6,209.3L862.2,207.2L861.2,203.9L859,202L856.8,201.5Z"},{"d":"M1169.9,351.5L1167.9,347.7L1171.3,347.9L1172.6,349.7L1171.6,353.9ZM1176.7,364.9L1177.7,363.5L1178.1,360.4L1180.3,360.1L1179.7,363.5L1182.5,358.7L1182.2,363.4L1180.8,365L1179.5,368.2L1178.3,369.6L1175.9,366.2ZM1191.5,372.6L1191.9,375.9L1192.1,378.6L1190.8,383.2L1189.3,378.1L1187.5,380.6L1188.8,384.3L1187.7,386.6L1183.1,383.7L1182,380.1L1183.2,377.8L1180.7,375.5L1179.5,377.5L1177.7,377.3L1174.8,380.1L1174.1,378.6L1175.7,374.5L1178.1,373.1L1180.2,371.2L1181.6,373.5L1184.6,372.1L1185.2,369.9L1187.9,369.8L1187.7,366L1190.9,368.3L1191.2,370.8ZM1160.9,368.2L1155.7,372.8L1157.6,369.4L1160.4,366.3L1162.7,362.9L1164.8,358L1165.5,362.1L1162.9,364.8ZM1175.8,324.2L1175.1,326.3L1176.4,329.8L1175.4,333.9L1173.1,335.6L1172.5,339.5L1173.4,343.5L1175.5,344L1177.2,343.4L1182,346.1L1181.7,348.8L1182.9,350L1182.5,352.3L1179.5,349.9L1178.1,347.3L1177.1,349.1L1174.6,346.1L1171,346.9L1169.1,345.8L1169.3,343.7L1170.5,342.5L1169.4,341.3L1168.9,343.1L1166.9,340.3L1166.4,338.1L1166.2,333.4L1167.8,335L1168.2,327.3L1169.4,322.9L1171.8,322.9L1174.2,324.3L1175.4,323ZM1174.6,357.8L1174,355.5L1176.3,357L1178.8,357L1178.7,359L1176.9,361.1L1174.5,362.6L1174.3,360.3ZM1188.1,354.1L1189.2,359.6L1186.2,358.3L1186.2,360L1187.2,363L1185.3,364.1L1185.2,360.7L1184,360.4L1183.4,357.4L1185.7,357.8L1185.6,355.9L1183.3,352.2L1187,352.3Z","u":"philippines"},{"d":"M1089.2,382.2L1089.9,381.3L1093.1,383.5L1093.4,386L1095.9,385.4L1097.2,383.4L1098.1,383.9L1100.4,386.8L1102,390.2L1102.3,393.5L1101.9,395.7L1102.2,397.4L1102.5,400.3L1103.9,401.7L1105.4,406L1105.3,407.7L1102.6,408L1098.9,404.4L1094.3,400.5L1093.8,398L1091.6,394.7L1091.1,390.6L1089.7,387.9L1090.1,384.3ZM1158.4,393.7L1155.1,392.9L1150.6,392.9L1149.2,398.5L1147.7,400.2L1145.7,407L1142.6,408.1L1138.9,406.7L1137,407.1L1134.8,409.6L1132.3,409.3L1129.8,410.3L1127.1,407.5L1126.5,404.2L1129.3,405.9L1132.3,405L1133.1,400.8L1134.8,399.9L1139.4,398.8L1142.2,394.9L1144.1,391.8L1145.9,394.3L1146.7,392.6L1148.6,392.8L1148.8,389.7L1149,387.2L1152,383.8L1153.9,379.9L1155.5,379.9L1157.5,382.4L1157.7,384.6L1160.2,385.9L1163.5,387.4L1163.2,389.4L1160.6,389.6L1161.3,392Z","u":"malaysia"},{"d":"M1149,387.2L1148.8,389.7L1148.6,392.8L1146.7,392.6L1145.9,394.3L1144.1,391.8L1145.7,389.9Z"},{"d":"M753.7,184.8L756.9,185.2L758.9,184.1L762.3,184L763,183.1L763.7,183.2L764.4,184.8L761.3,186.2L761,188.1L759.6,188.6L759.6,190L758.1,189.9L756.8,189.1L756.1,190L753.3,189.8L754.2,189.3L753.3,187.2Z","u":"euro-area"},{"d":"M811.2,73.6L810.6,77.1L816.6,80.4L813,84.1L817.5,89.7L814.9,93.9L818.4,97.6L816.8,100.8L822.6,104.2L821.1,106.7L817.5,109.5L809.2,115.8L802.1,116.2L795.3,118L788.9,119.1L786.7,116.4L782.9,114.8L783.8,109.9L781.9,105.5L783.8,102.6L787.3,99.5L796.2,94.1L798.8,93.1L798.4,91L793,88.7L791.7,86.8L791.5,79.2L785.5,75.8L780.3,73.4L782.6,72.1L786.9,74.7L792,74.5L796.2,75.7L799.9,73.5L801.8,69.9L807.9,68.2L812.8,70.2Z","u":"euro-area"},{"d":"M787.7,172.1L786.7,173.4L785.9,175.4L785.1,175.9L780.9,174.4L779.6,174.7L778.7,175.8L776.9,176.5L776.5,176.1L774.6,176.9L773,177.1L772.7,178.1L769.4,178.7L768,178.1L766,176.9L765.6,175.1L766,174.5L766.5,173.4L768.2,173.5L769.6,173L769.7,172.6L770.4,172.3L770.7,171.2L771.6,171L772.2,170.1L773.3,170.1L773.5,170.4L775.1,169.7L777.1,171.5L779.4,170.4L781.2,170.9L784,170.2Z","u":"euro-area"},{"d":"M758.4,162.1L760.3,163.7L763.1,164.2L762.9,165.5L765,166.5L765.6,165.3L768.3,165.8L768.6,167.4L771.5,167.7L773.3,170.1L772.2,170.1L771.6,171L770.7,171.2L770.4,172.3L769.7,172.6L769.6,173L768.2,173.5L766.5,173.4L766,174.5L764.2,173.6L762.3,173.8L759.3,172.3L758,172.7L755.8,174.7L752.9,173.1L750.7,171L748.7,169.8L748.3,167.8L747.6,166.3L750.4,165.2L751.9,164L754.7,163L755.6,162.1L756.7,162.7Z"},{"d":"M841.7,343L841.3,341L842.9,333.8L843.3,330.5L844.5,329L847.4,328.2L849.4,325.4L851.6,331.1L852.7,335.6L854.8,338L860.1,342.7L862.3,345.5L864.4,348.3L865.6,350L867.5,351.5L866.4,352.7L864.7,352.3L863.4,350.7L861.8,347.8L860,346.2L859,344.5L855.7,342.5L853,342.5L852,341.4L849.8,342.6L847.4,340.3L846.2,344Z"},{"d":"M1251.8,220.9L1248.2,225.9L1248.2,231L1246.8,234.9L1247.5,237.4L1245.4,240.9L1240.5,243.2L1233.6,243.5L1228.1,249.1L1225.5,247.2L1225.3,243.5L1218.5,244.6L1213.9,247L1209.4,247L1213.3,250.7L1210.7,259L1208.2,261.1L1206.3,259.2L1207.3,254.8L1204.8,253.3L1203.3,249.9L1206.9,248.4L1209,245.3L1212.9,242.8L1215.7,239.4L1223.5,237.9L1227.6,239L1231.7,230.2L1234.3,232.5L1240,227.6L1242.2,225.7L1244.7,219.7L1244,214.1L1245.6,211L1249.8,210.1L1251.9,216.9ZM1262.4,197.4L1265.1,195.3L1266,200.8L1260.2,202.2L1256.8,207.1L1250.7,203.7L1248.6,209.1L1244.3,209.2L1243.7,204.3L1245.7,200.5L1249.8,200.2L1250.9,193.4L1252.1,189.5L1256.7,194.7L1259.6,196.3ZM1214.8,249.1L1216.9,246.2L1219.1,246.8L1220.7,244.7L1223.6,245.7L1224.1,247.4L1221.9,250.4L1220.3,248.8L1218.3,250L1217.3,252.9L1214.8,251.5Z","u":"japan"},{"d":"M473.8,513.5L474.9,516.3L474.7,523L478.8,523.9L480.4,523L483,524.3L483.7,525.8L484.1,530.3L484.6,532.2L486,532.4L487.5,531.6L488.9,532.5L488.9,535.2L488.3,538.1L487.6,541L486.9,545.3L483.4,549.1L480.3,549.9L476,549.1L472,547.8L475.9,540.3L475.3,538.1L471.3,536.2L466.6,532.6L463.4,531.8L456.2,523.8L457.8,517.9L457.9,515.2L459.7,510.9L466.5,509.4L470.1,509.5L473.7,512Z"},{"d":"M902.2,320.4L905.3,328.6L906.5,332L903.7,333.3L903,335.5L902.9,337.2L899,339.3L892.8,341.6L889.3,345.1L887.6,345.3L886.4,345L884.2,347.1L881.7,348L878.4,348.3L877.4,348.6L876.6,349.9L875.6,350.2L875,351.5L873,351.4L871.8,352L869.1,351.8L868.1,348.9L868.2,346.2L867.6,344.8L866.8,341.1L865.7,339.1L866.5,338.8L866.1,336.6L866.5,335.6L866.4,333.5L868.1,331.9L867.7,329.8L868.7,327.4L870.3,328.7L871.4,328.3L875.8,328.1L876.5,328.6L880.3,329.1L881.8,328.9L882.8,330.5L884.6,329.7L887.4,324.5L891,322.3Z"},{"d":"M835.9,269.4L840.3,270.2L842,268.6L842.9,266.9L845.8,266.2L846.5,264.5L847.8,263.7L843.9,258.8L851.7,256.3L852.4,255.5L857.1,256.9L862.9,260.3L873.9,270.2L881.1,270.6L884.6,271.1L885.5,273.5L888.3,273.3L889.8,277.6L891.7,278.7L892.4,280.4L895,282.5L895.3,284.5L894.9,286.2L895.4,287.9L896.5,289.2L897,290.8L897.6,292.1L898.8,293L899.8,292.7L900.6,294.6L900.7,295.7L902.2,300.7L913.9,303.2L914.7,302.1L916.5,305.6L913.9,315.5L902.2,320.4L891,322.3L887.4,324.5L884.6,329.7L882.8,330.5L881.8,328.9L880.3,329.1L876.5,328.6L875.8,328.1L871.4,328.3L870.3,328.7L868.7,327.4L867.7,329.8L868.1,331.9L866.4,333.5L865.9,331.4L864.7,329.9L864.4,327.9L862.4,326.2L860.3,322L859.2,318L856.5,314.6L854.8,313.8L852.2,309.1L851.8,305.7L851.9,302.8L849.7,297.3L847.9,295.4L845.8,294.4L844.5,291.5L844.7,290.4L843.6,287.9L842.5,286.8L841,283.1L838.6,279.1L836.6,275.7L834.7,275.8L835.3,273.1L835.5,271.3Z","u":"saudi-arabia"},{"d":"M510.8,798.8L512.7,798.8L518.5,797.8L524.4,798.8L529.2,800.9L530.9,803.9L531.3,806.1L531.5,808.6L525.5,810.1L519.1,811.4L511.8,812.5L503.7,813.5L494.5,813.2L489.4,811.6L490,809.5L498.3,808.2L501.7,806.5L504.1,804.4L505.9,802.6L508.2,800.8ZM442.2,809.7L451,809.9L459.3,810.4L462.2,808.4L464.3,806.6L468.3,808.7L467.2,811.2L466.1,813.4L457.9,812.7L449.2,813L444.3,811.4L444.3,811.2ZM412.6,765.4L415.2,764.8L419.7,765L420.9,762.5L421.1,760.7L421,756.7L423.2,754.4L426.8,753.6L428.9,755.5L429.8,757.3L431.4,759.5L432.7,761.6L433.8,763.9L434.3,766.1L433.6,768L432.5,769.9L427.9,770.5L423.6,771.5L418.5,771.4L420.4,769.5L415.8,770.1L411.5,770.8L408.5,769.4L408.3,767.3ZM302.1,768.5L304.5,767.6L309.4,768.3L315.1,768.7L319.3,769.4L323.6,768.8L325.9,771.6L322.8,771.2L318.1,771.4L313.3,771.2L308.1,771.5L304.1,770.5ZM223.1,777.2L224,775.5L228.6,776.4L233.6,777.2L238.3,776.3L236.1,778.1L232.4,779.3L227,778.9ZM205,776.2L207.8,775.2L211.7,776.3L217.7,778.2L215.4,778.1L210.3,777.6ZM63.3,801.5L65.7,799.7L72.9,800.5L76.8,802L79.8,803.8L80.9,806L73.4,806.6L68.3,804.9L66,803.2L65.9,802.9ZM0,831.7L0,831.7L0,831.7L0.2,831.7L3.7,828.9L10.7,830.4L11.1,830.2L15.2,828.7L15.8,828.7L16.2,828.8L21.8,830.8L26.8,828.8L27.7,828.5L39.1,827.6L42.8,828.8L44.6,829.3L50.5,831L61.5,832.2L70.3,833.8L85.3,834.9L96.5,833.6L113,834.6L122.4,836.1L132.7,834.6L143.5,833.3L144.3,831L129,830.8L116.4,829.6L113.1,827.7L102.7,826.6L103.4,824.4L104.8,822.4L106.3,820.5L105.5,818.5L99.1,817.2L96.1,815.4L90.1,813.9L99.5,814.2L108.5,813.4L114.1,815L121.1,813.6L127.5,811.8L130.6,810.1L129.2,808.1L124.2,806.7L118.5,805.3L110.5,805L103.5,804.3L95.9,803.8L93.4,802L88.4,800.5L85.4,798.7L84.1,793.1L86,793.6L89.5,795.1L95.9,794.7L102.1,794L105.3,796.1L111.5,795.6L116.7,794.6L121.5,793.2L125.9,791.6L131.8,791.1L131.7,789.3L130.3,787.4L131.4,785.7L136.5,784.8L138.7,786.4L144.7,785.5L149.2,784.2L154.7,784.1L160,783.7L165.3,782.5L169.4,781.4L174.2,780.4L177.2,780.7L179.9,781L185.7,780.4L190.9,781.2L196.2,781.1L201.3,780.5L206.5,780.9L212.3,781.4L217.7,781.2L223.4,781.3L229.2,781.4L234.5,781.2L238.5,779.8L243.2,779L248.1,780.1L252.7,779.2L256.9,777.5L259.4,779L260.8,780.7L263.3,782.4L267.3,780.9L272,782.8L277.2,783.4L281.7,784.7L287.2,784.4L292.2,783.6L298,783.7L303.3,784.4L308.6,785.3L310.7,783.2L308.1,781.5L306.2,779.8L301.2,779.4L299,777.6L298.2,775.7L296.8,772.1L299.8,772.7L304.9,773L309.9,772.7L314.5,773.5L318.4,775L320.1,776.7L325.4,777L330.4,776.3L335.7,775.3L340.5,774.8L344.5,775.9L349.7,775.5L353,771.8L356.1,774L360.6,774.9L365.5,774.4L368.7,776.3L373.8,776.5L378.5,777.1L383.2,778.1L386.2,776.3L387.7,774.6L391.6,776.5L397,776L400.9,777.1L403.6,778.7L408.8,778.2L412.8,777.2L416.8,775.9L421.5,775.2L427,774.7L431.9,774L435.7,772.9L438,771.4L438.9,769.3L438.5,767.2L437.3,765.3L435.9,763.4L434.7,761.4L433.7,759.7L433.4,757.8L433.8,755.8L435.6,754L437.2,752L437.8,750L437,747.9L436.6,746L438.5,743.8L440.6,742.3L443.1,740.5L445.8,738.9L448.9,737.5L450.4,735.4L452.6,734L455,732.7L458.7,732.5L461.2,730.9L463.9,729.9L467.1,729.4L469.9,728.1L472.1,726.6L475.2,726L477.5,727.2L476,728.9L472.1,730.3L470.4,731.4L467.5,730.6L464.3,731.1L461.6,732.3L458.8,733.5L456.9,735L456.4,736.9L456.6,738.7L458.4,740.4L455.8,741.5L452.1,741.9L450,743.6L447.7,745.1L445.2,747.2L444.6,749.1L446,751.1L448.1,752.6L451.3,753.8L454.2,755.3L455.8,757.3L456.7,759.1L457.8,761.1L459.6,762.7L460.8,764.5L461.3,769.1L462.5,770.9L462.8,772.8L464,774.8L463.4,777.4L461.3,779.4L459,781L453.9,781.7L452.1,783.5L449.7,785.1L443.9,786.9L438.7,787.7L433.8,788.8L428.6,789.8L425.4,791.9L419.2,792.1L412.3,791.9L406.2,792.2L399.6,792.2L400.8,794.2L406.8,795.1L411.1,796.4L413.6,798.1L409.2,799.7L402.5,799.2L397,800.5L396.7,802.5L396.6,804.4L401.1,806.1L402,807.9L406.9,809.7L415.2,810.5L422.2,811.9L427.7,813.4L434.8,815L444.5,815.7L454,817.1L460.6,818.5L467.9,820.2L471.7,822.5L473.6,824.3L478.3,822.6L484.7,821.1L491.5,819.6L499.6,818.3L506.5,817L516.2,816.9L525.7,817.6L533.5,818.7L536,816.6L541.4,815.1L551.3,815L559,814L566.3,812.9L574.4,812.2L583,811.4L589,810.1L586.2,808.4L584.6,806.6L584.6,804.8L577,805L569,805.8L561.4,805.8L560.3,803.9L560.9,800.3L562.6,799.2L568.2,798L574.7,796.9L579.5,795.4L584.2,794L587.7,792.1L593,791.2L598.3,790.5L600.9,790.1L606.9,789.9L612.7,789.3L617.5,788.3L622.2,787.1L626.5,786L631.9,784.4L635.3,782.8L638.9,781.3L640.1,779.4L636,778.2L637.3,776.2L639.9,774.7L644,773.7L648.2,772.5L652.2,771L655.2,769.1L657.1,766.7L660,765.4L664.6,765.7L666.5,767.3L671.2,767.5L671.3,765.7L673.3,763.8L677.5,764.2L678.5,766.1L683.1,766.4L688.1,765.5L693,764.9L697.4,765.2L699.1,767.2L703.4,765.6L707.3,764.7L711.8,764L716.1,763.4L720.1,762.2L724.4,761.4L727.8,760.4L730.1,758.6L733,759.9L737,759.2L739.9,761.5L742.1,763.3L746.5,762.3L748.2,760.4L752.2,759L757.3,759.3L758.8,761.1L762,759.3L766.2,758.7L770.8,758.5L774.9,758.6L779.2,759.2L783.4,759.5L785.3,761.1L787.8,762.6L792,761.7L796.6,761.5L801,761.5L805.4,761.4L809.3,760.8L813.4,760.2L816.8,758.8L820.5,758L824.4,757.5L827.4,756.1L829.5,753.4L831.7,751.8L835.8,752.5L837.3,754.3L840.6,755.4L844.7,755.1L847.4,756.8L850.3,758.1L854.3,756.9L855.6,754.8L859.1,753.9L863.2,752.3L867,751.6L871.6,750.6L874.6,749.6L877.8,748.4L880.8,747.3L884.5,747.9L888,746.2L890.5,744.8L894.2,744.9L897.4,743.8L898.1,742L901.4,740.7L904.6,739.7L908.5,738.9L912.1,738.5L915.5,738.8L919.2,739.3L922.3,740.7L922.7,742.8L926.1,744.4L928.4,745.8L933.1,746.4L935.7,747.7L938.9,749.1L942.6,749.4L945.7,748.4L949.1,746.4L952.8,747.4L956.6,748L960.2,748.6L964,749L967.9,749L971.1,754.1L971,755.3L970.5,757.6L966.8,758.8L963.7,760.7L964.2,762.6L968.6,762.5L968.1,764.4L966.1,766.3L964.2,768.3L967.2,769.8L971.7,770.3L976.2,769.5L978.3,767.5L979.6,765.7L981.8,764.1L984.2,762.7L985.2,761L987.2,758.5L989.7,758.1L994.1,757.9L998,757.3L1001.9,756.5L1003.9,754.6L1005,752.7L1007.7,750.9L1011.5,749.6L1014.7,748.7L1016.9,747L1019.1,746.2L1021.9,745.4L1025.8,745.9L1029.3,745.4L1033.1,744.8L1037.4,745.1L1040.2,743.8L1042.2,740.5L1043.6,741.8L1045.4,744.1L1048.7,745.1L1052.4,745.5L1056.2,744.9L1060.1,745.3L1063.8,745.4L1066.2,744.9L1069.5,745.2L1072.5,746.3L1076,745.6L1080.2,745.6L1083.8,744.9L1087.8,745.6L1090.4,743.9L1092.4,742.3L1095,741L1099.9,737.3L1102.4,738L1105.4,739.3L1108,741.1L1112.9,744L1116.7,744.1L1120.3,744.1L1124.5,743.6L1128.7,742.9L1131.9,741.5L1134.6,740.1L1138.9,739.9L1141.8,738.8L1144.8,739.8L1146.8,741.3L1149.6,742.9L1153.8,742.7L1156.5,743.9L1161.1,745.2L1166,745.7L1170,745.3L1173.1,743.8L1175.7,742.2L1179.2,741.8L1182.7,742.5L1186.7,743L1190.4,742.2L1193.9,742.2L1197.3,742.7L1200.9,743.2L1204.4,742.3L1208.6,741.5L1212.6,741.3L1217,741.3L1220.5,740.9L1224.1,740.5L1225.1,738.1L1225.3,736L1227.7,737.4L1228.4,739.6L1229.7,741.6L1231.3,743.3L1234.6,744.1L1239,743.9L1244.1,743.8L1247.6,743.5L1252.7,743.5L1256.4,743.4L1261.5,743.6L1265.8,743.9L1268.5,745.5L1267.8,747.3L1270.3,748.8L1274.5,749.9L1278.8,751.2L1283.9,752.1L1289.1,752.8L1293.1,753.6L1297.5,753.7L1300,752.1L1303.4,753.4L1306.4,755L1309.8,756.1L1314.5,756.6L1319,757.2L1320.9,759.1L1325.4,760.3L1328.3,762L1332.7,762.8L1337.2,762.7L1341.4,763L1346,762.9L1350.7,763.3L1355,763.9L1359,765.1L1363.1,766.1L1365.8,767.5L1365.4,769.5L1363.3,771.2L1361.5,773.4L1360.2,775.2L1358.3,777.2L1353.2,778L1351,779.7L1345.9,780.7L1344.2,782.7L1341.5,784.5L1338.7,786.1L1337.1,788.1L1336.1,789.9L1335.7,792.1L1335.8,794L1338,795.9L1338.8,797.8L1340.7,799.5L1347.9,800.2L1349.4,802.3L1342.4,803.1L1336.5,804.1L1329.1,804.3L1325.8,807.1L1325.1,809.4L1323.5,811.3L1321.4,813.1L1326.6,814.8L1328.6,816.8L1331.9,818.6L1336.6,820.3L1342,821.8L1347.9,823.4L1356.8,824.9L1358.8,827.3L1370,828.4L1370.7,828.8L1373.7,830.2L1384.4,829L1393.3,830.5L1400,831.7L1400,831.7L1400,857.7L700,857.7L0,857.7Z"},{"d":"M827.3,240.9L827.6,240.8L828.1,239.6L830.9,239.7L834.5,238.2L831.8,240.3L832.1,241.3L831.7,241.1L831,241.5L830.4,241.4L830.2,241.5L830.1,241.1L829.8,240.7L829.1,240.7L828,241.1Z"},{"d":"M827.3,240.9L828,241.1L829.1,240.7L829.8,240.7L830.1,241.1L830.2,241.5L830.4,241.4L831,241.5L831.7,241.1L832.1,241.3L832.2,241.7L828.2,243.7L826.3,243L825.4,241Z","u":"euro-area"},{"d":"M691.6,240.7L693,243.9L693.3,246.9L694.6,252.1L695.6,253.1L694.9,255L689.8,255.9L688.1,257.7L685.8,258.1L685.6,261.8L681.1,263.7L679.6,266.2L676.4,267.5L672.6,268.3L666.3,271.9L666.3,277.7L665.7,277.7L665.8,280.4L663.4,280.6L662.1,281.7L660.4,281.7L659,281L655.7,281.6L654.4,285.4L653.2,285.8L651.4,292L646,297.3L644.7,304.1L643.1,306.3L642.6,308.1L633.9,308.5L633.8,308.5L634,306.2L635.5,304.9L636.8,302.3L636.5,300.6L637.8,297.1L640,294L641.3,293.2L642.4,290.3L642.4,287.7L643.8,284.7L646.4,282.9L648.9,277.8L649,277.8L650.9,275.9L654.5,275.3L657.6,272L659.6,270.6L662.8,266.5L661.8,260.4L663.3,256.2L663.8,253.6L666.3,250.2L670.2,248L673.1,245.9L675.7,240.8L676.9,237.8L679.8,237.8L682.1,239.9L685.8,239.6L689.9,240.7Z"},{"d":"M843.4,305.6L827.9,305.6L812.9,305.6L797.2,305.6L797.2,287.5L797.2,270L796.1,266L797.1,262.9L796.5,260.8L797.9,258.5L803,258.4L806.8,259.7L810.6,261.1L812.4,261.9L815.4,260.3L817,258.9L820.5,258.5L823.2,259.1L824.3,261.6L825.2,260L828.3,261.2L831.3,261.4L833.3,260.2L835.4,267.4L835.8,268.7L834.7,270.6L833.9,274.4L832.8,276.9L831.9,277.8L830.6,276.2L828.9,274L826.1,266.9L825.7,267.4L827.3,272.6L829.7,277.5L832.6,285.2L834.1,287.9L835.3,290.7L838.8,296.1L838,297L838.2,300.2L842.7,304.6Z"},{"d":"M797.2,305.6L797.2,315.5L792.7,315.5L792.7,317.6L777.2,308.1L761.7,298.7L757.8,301.4L755,303.2L752.8,300.5L746.7,298.4L745,295.3L741.9,293L740.1,293.9L738.7,291.2L738.5,289L736.2,285.4L737.8,283.4L737.4,280.3L737.9,277.6L737.7,275.3L738.3,271.3L738.1,269L736.9,264.7L738.8,263.5L739.1,261.5L738.7,259.4L741.4,257.5L742.6,255.9L744.5,254.5L744.7,250.7L749.2,252.4L750.9,252L754.1,252.8L759.3,255L761.1,259.4L764.6,260.4L770.1,262.4L774.2,264.9L776.1,263.6L778,261.3L777.1,257.6L778.3,255.2L781.1,252.9L783.8,252.2L789,253.2L790.4,255.4L791.8,255.4L793.1,256.3L796.9,256.8L797.9,258.5L796.5,260.8L797.1,262.9L796.1,266L797.2,270L797.2,287.5Z"},{"d":"M885.8,374.6L874.9,389.4L869.8,389.6L866.3,393.1L863.8,393.2L862.8,394.8L860.1,394.8L858.5,393.1L855,395.2L853.8,397.2L851.3,396.8L850.4,396.3L849.5,396.4L848.3,396.3L843.3,392.2L840.6,392.2L839.3,390.5L839.3,387.8L837.3,386.9L835,381.6L833.2,380.4L832.5,378.5L830.5,376.1L828.2,375.7L829.5,372.9L831.5,372.8L832.1,371.3L832.1,366.8L833.2,361.7L835.1,360.3L835.5,358.3L837.1,354.5L839.5,352.1L841,347.2L841.7,343L846.2,344L847.4,340.3L849.8,342.6L852,341.4L853,342.5L855.7,342.5L859,344.5L860,346.2L861.8,347.8L863.4,350.7L864.7,352.3L863.3,354.4L862,356.7L862.3,358.1L862.4,359.6L864.6,359.7L865.5,359.3L866.4,360.2L865.5,362L866.9,364.7L868.4,367.1L869.9,368.8L882.6,374.7Z"},{"d":"M864.7,352.3L866.4,352.7L867.5,351.5L868.5,353L868.3,355.1L866.1,356.2L867.8,357.6L866.4,360.2L865.5,359.3L864.6,359.7L862.4,359.6L862.3,358.1L862,356.7L863.3,354.4Z"},{"d":"M890.4,357.8L890.3,357.9L890.3,359.9L890.3,364.9L890.3,367.5L888.6,370.5L885.8,374.6L882.6,374.7L869.9,368.8L868.4,367.1L866.9,364.7L865.5,362L866.4,360.2L867.8,357.6L869.1,358.5L869.8,360.5L871.6,362.6L873.5,362.6L877.2,361.4L881.4,360.8L884.8,359.2L886.8,358.9L888.1,358Z"},{"d":"M831.8,418.8L823.9,419.1L819.7,419.1L818.3,419.7L816,421.2L815,420.7L815.1,417L816,415.1L816.2,411.1L817,408.9L818.5,406.3L820,405L821.2,403.2L819.7,402.6L819.9,396.8L821.5,395.4L824,396.5L827.1,395.4L829.8,395.4L832.2,393.1L834.1,396.6L834.5,399L836.3,404.7L834.8,408.3L832.9,411.5L831.8,413.5Z"},{"d":"M818.3,419.7L819.8,422.5L819.6,425.4L818.5,426L816.4,425.7L815.2,428.5L812.9,428.1L813.2,425.4L813.8,425L813.9,422.1L815,420.7L816,421.2Z"},{"d":"M772.2,203.8L768.7,202L767.3,199.9L765.8,198.8L764,197L763.1,195.5L761.2,193.1L762.1,191.1L763.5,192.2L764.3,191.2L766.1,191.1L769.5,191.9L772.2,191.9L773.9,192.9L775.3,192.9L774.3,195.1L776.2,197L775.7,199.3L774.7,199.5L774,200L772.8,201.1Z"},{"d":"M787,205.5L789,207L789.3,210.3L788.5,210.5L787.9,211.3L785.8,211.2L784.3,212.3L781.7,212.8L780.1,211.5L779.6,209.4L780.1,207.8L780.6,207.8L780.7,206.8L783,206L783.9,205.8L785.2,205.5Z"},{"d":"M773.2,187.8L776.2,186.5L778.6,186.7L780.7,188.6L781.2,190.2L783.5,191.4L783.9,193.4L786.1,194.8L787.3,193.7L788.3,194.3L787.4,195.2L788.1,196L787.2,197.1L787.5,198.9L789.4,201.1L787.9,202.6L787.3,204.2L787.7,204.8L787,205.5L785.2,205.5L783.9,205.8L783.8,205.5L784.2,204.9L784.7,203.7L784.1,203.7L783.4,202.8L782.7,202.6L782.2,201.8L781.5,201.5L780.9,200.8L780.2,201L779.7,202.7L778.8,203L779.1,202.6L777.6,201.6L776.3,201.1L775.8,200.4L774.7,199.5L775.7,199.3L776.2,197L774.3,195.1L775.3,192.9L773.9,192.9L775.4,191.1L774.2,189.7Z"},{"d":"M778.1,204.1L777,204.6L776.8,203.6L775.1,206.1L775.3,207.6L774.5,207.3L773.4,205.7L771.7,204.7L772.2,203.8L772.8,201.1L774,200L774.7,199.5L775.8,200.4L776.3,201.1L777.6,201.6L779.1,202.6L778.8,203Z"},{"d":"M780.1,207.8L779.8,206L778.9,205.5L778.1,204.1L778.8,203L779.7,202.7L780.2,201L780.9,200.8L781.5,201.5L782.2,201.8L782.7,202.6L783.4,202.8L784.1,203.7L784.7,203.7L784.2,204.9L783.8,205.5L783.9,205.8L783,206L780.7,206.8L780.6,207.8Z"},{"d":"M460.1,361L462.4,360.4L463.2,360.6L463,364.2L459.8,364.8L459.1,364.3L460.2,363Z"},{"d":"M819.9,396.8L816.5,393.5L815.6,391.4L813.4,392.4L811.6,392.1L810.6,392.9L808.8,392.4L806.5,388.3L805.8,386.7L802.9,384.8L801.9,381.8L800.3,379.7L797.7,377.1L797.7,375.5L795.5,373.5L792.9,371.6L794.1,371.1L795.4,370.1L796.4,365.7L797.5,363.4L800.3,362.8L801,364.1L803,367L804,367.4L805.4,366.6L808.2,366.7L808.8,367.8L812.7,367.8L812.8,366.7L814.8,365.8L815.2,364.4L816.7,363.4L819.9,366.2L821.9,365.7L823.9,362.2L826,359.5L825.7,356.5L824.7,355.1L827.1,354.8L827.3,353.7L829.1,354L828.7,357.7L829.1,361.2L831.1,363.2L831.6,364.9L831.5,367.3L832.1,367.4L832.1,371.3L831.5,372.8L829.5,372.9L828.2,375.7L830.5,376.1L832.5,378.5L833.2,380.4L835,381.6L837.3,386.9L834.6,390.2L832.2,393.1L829.8,395.4L827.1,395.4L824,396.5L821.5,395.4Z"},{"d":"M1104.3,407.5L1103.7,407.8L1103.1,407.6L1103.3,407.1L1103.7,407L1104.1,407.1L1104.3,407.2L1104.4,407.4Z","u":"singapore"}];
var INFL_MAP_PINS = [{"u":"singapore","x":1103.7,"y":407.4},{"u":"taiwan","x":1170.4,"y":297.1},{"u":"switzerland","x":731.6,"y":183.4},{"u":"united-arab-emirates","x":910.8,"y":296.4}];


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  /* ---------------- index the graph ---------------- */
  var N = {}, KIDS = {}, PAR = {}, i;
  for(i = 0; i < WEB.n.length; i++){ N[WEB.n[i].id] = WEB.n[i]; KIDS[WEB.n[i].id] = []; PAR[WEB.n[i].id] = []; }
  for(i = 0; i < WEB.e.length; i++){
    var a = WEB.e[i][0], b = WEB.e[i][1];
    if(KIDS[a]) KIDS[a].push(b);
    if(PAR[b]) PAR[b].push(a);
  }
  /* colour inherits down from the level-0 / level-2 palette */
  function colOf(id){
    var n = N[id];
    if(!n) return '#ccff00';
    if(n.c) return n.c;
    var seen = {}, q = [id];
    while(q.length){
      var cur = q.shift();
      if(seen[cur]) continue;
      seen[cur] = 1;
      if(N[cur] && N[cur].c) return N[cur].c;
      var ps = PAR[cur] || [];
      for(var j = 0; j < ps.length; j++) q.push(ps[j]);
    }
    return '#ccff00';
  }

  function reach(id, map){
    var out = {}, q = [id];
    while(q.length){
      var cur = q.shift();
      var list = map[cur] || [];
      for(var j = 0; j < list.length; j++){
        if(!out[list[j]]){ out[list[j]] = 1; q.push(list[j]); }
      }
    }
    return out;
  }

  var picked = null, evId = null, baseTot = null;
  var phase = (window.SPZ_CYCLE ? window.SPZ_CYCLE.idx() : 1);

  /* phase multiplier: an edge is scaled by what its target is worth in that phase */
  function pmOf(id){
    var n = N[id];
    if(!n || !n.pm) return 1;
    return n.pm[phase] != null ? n.pm[phase] : 1;
  }
  function wOf(i){
    var e = WEB.e[i];
    return e[2] * pmOf(e[1]);
  }
  /* how much weighted flow each node receives, for the diff panel */
  function totals(){
    var t = {};
    for(var j = 0; j < WEB.e.length; j++){
      t[WEB.e[j][1]] = (t[WEB.e[j][1]] || 0) + wOf(j);
    }
    return t;
  }
  function visibleSet(){
    if(!picked) return null;
    var s = {};
    s[picked] = 1;
    var up = reach(picked, PAR), dn = reach(picked, KIDS), k;
    for(k in up) s[k] = 1;
    for(k in dn) s[k] = 1;
    return s;
  }

  /* ---------------- draw the web ---------------- */
  /* Barycentre ordering: run each column's nodes to the average height of what
     they connect to, a few passes each way. Same links, far fewer crossings. */
  function orderColumns(COLS){
    var cols = [], lv, k;
    for(lv = 0; lv < COLS; lv++){
      cols[lv] = [];
      for(k = 0; k < WEB.n.length; k++) if(WEB.n[k].L === lv) cols[lv].push(WEB.n[k].id);
    }
    function idx(lv){
      var m = {};
      for(var j = 0; j < cols[lv].length; j++) m[cols[lv][j]] = j;
      return m;
    }
    function bary(lv, refLv, map){
      var ref = idx(refLv);
      var score = {};
      for(var j = 0; j < cols[lv].length; j++){
        var id = cols[lv][j], list = map[id] || [], sum = 0, n = 0;
        for(var q = 0; q < list.length; q++){
          if(ref[list[q]] !== undefined){ sum += ref[list[q]]; n++; }
        }
        score[id] = n ? (sum / n) * (cols[refLv].length ? 1 : 1) : j;
        /* normalise to the reference column's scale so columns stay comparable */
        if(n) score[id] = score[id] / Math.max(1, cols[refLv].length - 1) * Math.max(1, cols[lv].length - 1);
      }
      cols[lv].sort(function(a, b){ return score[a] - score[b]; });
    }
    for(var pass = 0; pass < 7; pass++){
      for(lv = 1; lv < COLS; lv++) bary(lv, lv - 1, PAR);
      for(lv = COLS - 2; lv >= 0; lv--) bary(lv, lv + 1, KIDS);
    }
    return cols;
  }

  function webSVG(){
    var COLS = 7, W = 2160, H = 1520, top = 38, bot = 16;
    var nodeW = [158, 160, 148, 136, 146, 106, 158];
    var sumW = 0, lv, k;
    for(lv = 0; lv < COLS; lv++) sumW += nodeW[lv];
    var gapX = (W - sumW) / (COLS - 1);
    var colX = [];
    var accX = 0;
    for(lv = 0; lv < COLS; lv++){ colX[lv] = accX; accX += nodeW[lv] + gapX; }

    var cols = orderColumns(COLS);
    var pos = {};
    for(lv = 0; lv < COLS; lv++){
      var list = cols[lv];
      var inW = totals();
      var wt = function(id){
        var base = N[id].w;
        return N[id].L === 0 ? base : base * 0.45 + (inW[id] || base) * 0.55;
      };
      var tot = 0;
      for(k = 0; k < list.length; k++) tot += wt(list[k]);
      var gap = list.length > 40 ? 3 : (list.length > 22 ? 4 : (list.length > 14 ? 6 : (list.length > 8 ? 9 : 13)));
      var avail = H - top - bot - gap * (list.length - 1);
      var y = top;
      for(k = 0; k < list.length; k++){
        var h = Math.max(list.length > 40 ? 15 : (list.length > 22 ? 18 : (list.length > 14 ? 22 : 28)), avail * wt(list[k]) / tot);
        pos[list[k]] = { x:colX[lv], y:y, h:h, w:nodeW[lv], cy:y + h / 2 };
        y += h + gap;
      }
    }

    var vis = visibleSet();
    var s = '<defs>';
    /* one gradient per link so the colour travels along the path */
    for(i = 0; i < WEB.e.length; i++){
      var ca = colOf(WEB.e[i][0]), cb = colOf(WEB.e[i][1]);
      s += '<linearGradient id="wg' + i + '" x1="0" x2="1">' +
           '<stop offset="0" stop-color="' + ca + '"/><stop offset="1" stop-color="' + cb + '"/></linearGradient>';
    }
    s += '</defs>';

    /* column headers */
    var heads = WEB.cols;
    for(lv = 0; lv < COLS; lv++){
      s += '<text class="wb-col" x="' + (colX[lv] + 2) + '" y="14">' + esc(T(heads[lv])) + '</text>';
      s += '<line class="wb-colbar" x1="' + colX[lv] + '" y1="20" x2="' + (colX[lv] + nodeW[lv]) + '" y2="20"/>';
    }

    /* links */
    for(i = 0; i < WEB.e.length; i++){
      var A = pos[WEB.e[i][0]], B = pos[WEB.e[i][1]];
      if(!A || !B) continue;
      var on = !vis || (vis[WEB.e[i][0]] && vis[WEB.e[i][1]]);
      var x1 = A.x + A.w, y1 = A.cy, x2 = B.x, y2 = B.cy;
      var c1 = x1 + (x2 - x1) * 0.5, c2 = x2 - (x2 - x1) * 0.5;
      var d = 'M' + x1 + ',' + y1 + ' C' + c1 + ',' + y1 + ' ' + c2 + ',' + y2 + ' ' + x2 + ',' + y2;
      var lw = Math.max(0.5, wOf(i) * 0.62);
      s += '<path id="wbp' + i + '" class="wb-link" d="' + d + '" stroke="url(#wg' + i + ')" stroke-width="' +
           lw.toFixed(1) + '" opacity="' + (on ? (picked ? .55 : .19) : .03) + '" stroke-linecap="round"/>';
      if(!RM && on && (picked || i % 9 === 0)){
        var dur = (3.2 + (i % 7) * 0.3).toFixed(2), del = ((i * 0.29) % 3.2).toFixed(2);
        s += '<circle class="wb-dot" r="2.6" fill="' + colOf(WEB.e[i][1]) + '" color="' + colOf(WEB.e[i][1]) + '">' +
             '<animateMotion dur="' + dur + 's" begin="' + del + 's" repeatCount="indefinite">' +
             '<mpath href="#wbp' + i + '" xlink:href="#wbp' + i + '"/></animateMotion>' +
             '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.88;1" dur="' +
             dur + 's" begin="' + del + 's" repeatCount="indefinite"/></circle>';
      }
    }

    /* dividends and buybacks curve back to the people who funded them */
    var loops = [['uDIV','us'],['uDIV','eu'],['uBBK','us'],['uDIV','cash']];
    for(i = 0; i < loops.length; i++){
      var LA = pos[loops[i][0]], LB = pos[loops[i][1]];
      if(!LA || !LB) continue;
      var lvis = !vis || (vis[loops[i][0]] && vis[loops[i][1]]);
      var sx = LA.x + LA.w / 2, sy = LA.y + LA.h, ex = LB.x + LB.w / 2, ey = LB.y + LB.h;
      var dip = H - 4;
      var dl = 'M' + sx + ',' + sy + ' C' + sx + ',' + dip + ' ' + ex + ',' + dip + ' ' + ex + ',' + ey;
      s += '<path id="wbl' + i + '" class="wb-loop" d="' + dl + '" fill="none" stroke="#00ff88" ' +
           'stroke-width="1.6" stroke-dasharray="6 7" opacity="' + (lvis ? .42 : .05) + '"/>';
      if(!RM && lvis){
        s += '<circle class="wb-dot" r="2.4" fill="#00ff88" color="#00ff88">' +
             '<animateMotion dur="6s" begin="' + (i * 1.5) + 's" repeatCount="indefinite">' +
             '<mpath href="#wbl' + i + '" xlink:href="#wbl' + i + '"/></animateMotion>' +
             '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.9;1" dur="6s" begin="' +
             (i * 1.5) + 's" repeatCount="indefinite"/></circle>';
      }
    }

    /* how much of each column's incoming money each block receives */
    var share = {}, colIn = {};
    for(i = 0; i < WEB.e.length; i++){
      var tgt = WEB.e[i][1], tl = N[tgt] ? N[tgt].L : -1;
      if(tl < 0) continue;
      share[tgt] = (share[tgt] || 0) + wOf(i);
      colIn[tl] = (colIn[tl] || 0) + wOf(i);
    }
    for(var sk in share){
      var slv = N[sk].L;
      var pc = Math.round(share[sk] / colIn[slv] * 100);
      share[sk] = pc >= 3 ? pc : 0;
    }

    /* nodes */
    for(i = 0; i < WEB.n.length; i++){
      var n = WEB.n[i], p = pos[n.id];
      if(!p) continue;
      var act = !vis || vis[n.id];
      var col = colOf(n.id);
      var lab = typeof n.l === 'string' ? n.l : T(n.l);
      var sub = typeof n.v === 'string' ? n.v : T(n.v);
      var tx = p.x + (n.f ? 28 : 9);
      var shr = share[n.id];
      s += '<g class="wb-node' + (picked === n.id ? ' on' : '') + '" data-w="' + n.id + '" opacity="' +
        (act ? 1 : .12) + '">' +
        '<rect class="wb-rect" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h +
        '" rx="7" fill="' + col + '" fill-opacity="' + (picked === n.id ? .3 : .13) +
        '" stroke="' + col + '" stroke-opacity=".65" stroke-width="1"/>' +
        (n.f ? '<text x="' + (p.x + 9) + '" y="' + (p.cy + 3) + '" font-size="13">' + n.f + '</text>' : '') +
        '<text class="wb-l" x="' + tx + '" y="' + (p.cy + (sub ? -2 : 3)) + '">' + esc(lab) + '</text>' +
        (sub ? '<text class="wb-v" x="' + tx + '" y="' + (p.cy + 9) + '">' + esc(sub) + '</text>' : '') +
        (shr ? '<text class="wb-s" x="' + (p.x + p.w - 7) + '" y="' + (p.cy + 3) +
          '" text-anchor="end" fill="' + col + '">' + shr + '%</text>' : '') +
        '</g>';
    }

    return '<svg class="web-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" ' +
           'xmlns:xlink="http://www.w3.org/1999/xlink">' + s + '</svg>';
  }

  function jumpTicker(tk){
    var nav = document.querySelector('.np-item[data-route-to="chartlab"], .nav-links a[data-route-to="chartlab"]');
    if(nav) nav.click();
    setTimeout(function(){
      var s = document.querySelector('#chartlab .cl-sel');
      if(!s) return;
      for(var j = 0; j < s.options.length; j++){
        if(s.options[j].value === tk){ s.value = tk; s.dispatchEvent(new Event('change', { bubbles:true })); return; }
      }
    }, 170);
  }

  /* ---------------- swap the two sections on the globe page ---------------- */
  function upgradeGlobe(){
    var sec = document.getElementById('globe');
    if(!sec) return false;
    var map = sec.querySelector('[data-g="map"]');
    var ben = sec.querySelector('[data-g="ben"]');
    if(!map || !ben) return false;

    /* section 2 → the web. Rebuilt every time because the page's own language
       repaint restores the original two-column map underneath us. */
    map.className = 'web-box reveal in-view full';
    map.innerHTML =
      '<div class="wb-inner">' +
        '<div class="wb-ctl" data-w="ctl"></div>' +
        '<div class="wb-ctl" data-w="evs"></div>' +
        '<div class="wb-ctl wb-zoom" data-w="zoom"></div>' +
        '<div data-w="diff"></div>' +
      '</div>' +
      '<div class="web-stage" data-w="stage"><div data-w="svg"></div></div>' +
      '<div class="wb-inner">' +
        '<div class="web-legend" data-w="hint"></div>' +
        '<div class="web-scroll" data-w="scroll"></div>' +
      '</div>';

    /* section 4 → drill-down, inserted once, ladder kept underneath */
    var drill = document.getElementById('drillBox');
    if(!drill){
      drill = el('div');
      drill.id = 'drillBox';
      drill.innerHTML = '<div data-w="sel"></div><div data-w="grid"></div>';
      ben.parentNode.insertBefore(drill, ben.parentNode.firstChild);
    }

    function names(id){
      var dn = reach(id, KIDS), out = [], k;
      for(k in dn){ if(N[k] && N[k].L === 5) out.push(k); }
      if(N[id] && N[id].L === 5) out.push(id);
      return out;
    }

    function chips(ids, cls){
      var s = '';
      for(var j = 0; j < ids.length; j++){
        var n = N[ids[j]];
        if(!n) continue;
        var lab = typeof n.l === 'string' ? n.l : T(n.l);
        s += '<span class="dr-chip" data-jump="' + esc(ids[j]) + '" data-lv="' + n.L + '">' +
             (n.f ? n.f + ' ' : '') + esc(lab) + '</span>';
      }
      return s || '<span class="wb-v" style="color:var(--grey-dim);font-size:11px">—</span>';
    }

    function paintDrill(){
      var selBox = drill.querySelector('[data-w="sel"]');
      var grid = drill.querySelector('[data-w="grid"]');
      if(!picked){
        selBox.innerHTML = '';
        grid.innerHTML = '<div class="dr-empty">' + esc(T(WEB.pickHint)) + '</div>';
        return;
      }
      var n = N[picked];
      var lab = typeof n.l === 'string' ? n.l : T(n.l);
      selBox.innerHTML =
        '<div class="dr-sel">' + (n.f ? '<span class="dr-f">' + n.f + '</span>' : '') +
        '<span class="dr-n">' + esc(lab) + '</span>' +
        '<span class="dr-lv">' + esc(T(WEB.cols[n.L])) + '</span>' +
        '<button type="button" class="dr-x" data-clear="1">✕</button></div>';

      grid.innerHTML = '<div class="dr-grid">' +
        '<div class="dr-card from"><div class="dr-h">↑ ' + esc(T(WEB.fromH)) + '</div>' +
          chips(PAR[picked] || []) + '</div>' +
        '<div class="dr-card to"><div class="dr-h">↓ ' + esc(T(WEB.toH)) + '</div>' +
          chips(KIDS[picked] || []) + '</div>' +
        '<div class="dr-card end"><div class="dr-h">$ ' + esc(T(WEB.endsH)) + '</div>' +
          chips(names(picked)) + '</div>' +
      '</div>';

      var cs = grid.querySelectorAll('[data-jump]');
      for(var j = 0; j < cs.length; j++){
        (function(node){
          node.addEventListener('click', function(){
            var id = node.getAttribute('data-jump');
            if(node.getAttribute('data-lv') === '5') jumpTicker(id);
            else { picked = id; paintWeb(); paintDrill(); }
          });
        })(cs[j]);
      }
      var x = selBox.querySelector('[data-clear]');
      if(x) x.addEventListener('click', function(){ picked = null; paintWeb(); paintDrill(); });
    }

    /* ---------- continuous zoom + drag to pan ----------
       ROUND S FIX: default used to be fit:true ("Fit" -- scales the map to
       stay within ~80% of the viewport HEIGHT, per fitScale() below). For a
       wide map on a normal laptop window this routinely computes a scale
       well under 100%, so the map visibly only fills part of the row on
       first load -- exactly the "only fills the left half of the screen"
       bug reported, and clicking the "Fit width" button (which simply sets
       fit:false, s:1) was the only way to reach the width-filling view most
       people actually expect by default. Starting in fit-width mode instead
       makes that the default with no click required; "Fit" (height-
       constrained) is still one click away for anyone who wants it. */
    var Z = { s:1, fit:false };
    var MINZ = 0.35, MAXZ = 4;

    function stageEl(){ return map.querySelector('[data-w="stage"]'); }

    function fitScale(){
      var stage = stageEl(), svg = stage && stage.querySelector('svg');
      if(!svg) return 1;
      var vb = (svg.getAttribute('viewBox') || '0 0 2160 1520').split(/\s+/);
      var vw = +vb[2] || 2160, vh = +vb[3] || 1520;
      var cw = Math.max(280, stage.clientWidth - 10);
      var ch = Math.max(240, Math.round(window.innerHeight * 0.80));
      /* base is "fill the stage width", so scale 1 already means fit-width */
      return Math.min(1, (ch / vh) * (vw / cw));
    }

    function applyZoom(){
      var stage = stageEl(), svg = stage && stage.querySelector('svg');
      if(!svg) return;
      if(Z.fit) Z.s = fitScale();
      Z.s = Math.max(MINZ, Math.min(MAXZ, Z.s));
      svg.style.width = (Z.s * 100) + '%';
      svg.style.minWidth = '0';
      svg.style.margin = '0';
      stage.style.maxHeight = Math.round(window.innerHeight * 0.82) + 'px';
      stage.style.overflow = 'auto';
      var pc = map.querySelector('[data-w="zpc"]');
      if(pc) pc.textContent = Math.round(Z.s * 100) + '%';
      var fb = map.querySelector('[data-w="zfit"]');
      if(fb) fb.classList.toggle('on', Z.fit);
    }

    function zoomBy(mult, anchor){
      var stage = stageEl();
      if(!stage) return;
      var before = Z.s;
      Z.fit = false;
      Z.s = Math.max(MINZ, Math.min(MAXZ, Z.s * mult));
      if(Z.s === before) return;
      /* keep whatever the pointer is over roughly in place */
      var ax = anchor ? anchor.x : stage.clientWidth / 2;
      var ay = anchor ? anchor.y : stage.clientHeight / 2;
      var rx = (stage.scrollLeft + ax) / (stage.scrollWidth || 1);
      var ry = (stage.scrollTop + ay) / (stage.scrollHeight || 1);
      applyZoom();
      requestAnimationFrame(function(){
        stage.scrollLeft = rx * stage.scrollWidth - ax;
        stage.scrollTop = ry * stage.scrollHeight - ay;
      });
    }

    function hookPan(){
      var stage = stageEl();
      if(!stage || stage.__pan) return;
      stage.__pan = 1;
      var down = false, sx = 0, sy = 0, l = 0, t = 0, moved = 0;

      stage.addEventListener('pointerdown', function(e){
        if(e.button !== 0) return;
        if(e.target.closest && e.target.closest('.wb-node')) return;   /* let taps select */
        down = true; moved = 0;
        sx = e.clientX; sy = e.clientY;
        l = stage.scrollLeft; t = stage.scrollTop;
        stage.classList.add('grabbing');
        try { stage.setPointerCapture(e.pointerId); } catch(err){}
      });
      stage.addEventListener('pointermove', function(e){
        if(!down) return;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        moved += Math.abs(dx) + Math.abs(dy);
        stage.scrollLeft = l - dx;
        stage.scrollTop = t - dy;
      });
      function up(e){
        if(!down) return;
        down = false;
        stage.classList.remove('grabbing');
        try { stage.releasePointerCapture(e.pointerId); } catch(err){}
      }
      stage.addEventListener('pointerup', up);
      stage.addEventListener('pointercancel', up);
      stage.addEventListener('pointerleave', up);

      /* ctrl/⌘ + wheel zooms, plain wheel scrolls as usual */
      stage.addEventListener('wheel', function(e){
        if(!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        var r = stage.getBoundingClientRect();
        zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, { x:e.clientX - r.left, y:e.clientY - r.top });
      }, { passive:false });
    }

    function paintZoom(){
      var z = map.querySelector('[data-w="zoom"]');
      z.innerHTML = '';
      z.appendChild(el('span', 'wb-lab', esc(L() === 'th' ? 'ซูมและเลื่อน' : 'Zoom & pan')));

      function mk(cls, label, fn, attr){
        var b = el('button', 'wb-zb ' + (cls || ''), label);
        b.type = 'button';
        if(attr) b.setAttribute('data-w', attr);
        b.addEventListener('click', fn);
        z.appendChild(b);
        return b;
      }
      mk('zi', '−', function(){ zoomBy(1 / 1.25); });
      var pc = el('span', 'wb-zpc');
      pc.setAttribute('data-w', 'zpc');
      pc.textContent = Math.round(Z.s * 100) + '%';
      z.appendChild(pc);
      mk('zi', '+', function(){ zoomBy(1.25); });
      mk('', esc(L() === 'th' ? 'พอดีจอ' : 'Fit'), function(){ Z.fit = true; applyZoom(); }, 'zfit');
      mk('', esc(L() === 'th' ? 'พอดีความกว้าง' : 'Fit width'), function(){ Z.fit = false; Z.s = 1; applyZoom(); });
      mk('', '200%', function(){ Z.fit = false; Z.s = 2; applyZoom(); });
      z.appendChild(el('span', 'wb-zhint',
        esc(L() === 'th' ? 'ลากเพื่อเลื่อน · Ctrl + ล้อเมาส์ เพื่อซูม' : 'drag to pan · Ctrl + wheel to zoom')));
    }

    function paintCtl(){
      var c = map.querySelector('[data-w="ctl"]');
      c.innerHTML = '';
      c.appendChild(el('span', 'wb-lab', esc(T(WEB.phaseH))));
      for(var j = 0; j < WEB.phases.length; j++){
        (function(p){
          var b = el('button', 'wb-pb' + (phase === p.id ? ' on' : ''),
            esc(T(p.l)) + (window.SPZ_PHASES && window.SPZ_PHASES[p.id] === window.SPZ_CYCLE.live ? '<span class="wb-now">' + esc(T(WEB.nowTag)) + '</span>' : ''));
          b.type = 'button';
          b.addEventListener('click', function(){
            evId = null;
            if(window.SPZ_CYCLE) window.SPZ_CYCLE.set(window.SPZ_PHASES[p.id], 'web');
            phase = p.id;
            paintWeb(); paintDrill();
          });
          c.appendChild(b);
        })(WEB.phases[j]);
      }

      var e2 = map.querySelector('[data-w="evs"]');
      e2.innerHTML = '';
      e2.appendChild(el('span', 'wb-lab', esc(T(WEB.evH))));
      for(var k = 0; k < WEB.ev.length; k++){
        (function(ev){
          var b = el('button', 'wb-eb' + (evId === ev.id ? ' on' : ''),
            ev.ic + ' ' + esc(T(ev.t)));
          b.type = 'button';
          b.addEventListener('click', function(){
            if(evId === ev.id){ evId = null; if(window.SPZ_CYCLE) window.SPZ_CYCLE.reset(); }
            else { evId = ev.id; if(window.SPZ_CYCLE) window.SPZ_CYCLE.set(window.SPZ_PHASES[ev.p], 'web'); }
            phase = window.SPZ_CYCLE ? window.SPZ_CYCLE.idx() : ev.p;
            paintWeb(); paintDrill();
          });
          e2.appendChild(b);
        })(WEB.ev[k]);
      }
      if(evId || phase !== 1){
        var r = el('button', 'wb-eb', '↺ ' + esc(T(WEB.reset)));
        r.type = 'button';
        r.addEventListener('click', function(){
          evId = null;
          if(window.SPZ_CYCLE) window.SPZ_CYCLE.reset();
          phase = window.SPZ_CYCLE ? window.SPZ_CYCLE.idx() : 1;
          paintWeb(); paintDrill();
        });
        e2.appendChild(r);
      }
    }

    function paintDiff(){
      var box = map.querySelector('[data-w="diff"]');
      var liveIdx = window.SPZ_CYCLE ? window.SPZ_CYCLE.idx(window.SPZ_CYCLE.live) : 1;
      if(phase === liveIdx && !evId){ box.innerHTML = ''; return; }
      var save = phase;
      phase = liveIdx; var b0 = totals();
      phase = save; var b1 = totals();
      var rows = [], id;
      for(id in b1){
        if(!N[id] || N[id].L < 2 || N[id].L > 4) continue;
        var d = b1[id] - (b0[id] || 0);
        if(Math.abs(d) < 0.4) continue;
        rows.push({ id:id, d:d });
      }
      /* always show both sides: a recession view was returning ten losers and
         no gainers, which hides where the money actually went */
      var ups = [], dns = [];
      for(var r2 = 0; r2 < rows.length; r2++){
        (rows[r2].d > 0 ? ups : dns).push(rows[r2]);
      }
      var byMag = function(a, b){ return Math.abs(b.d) - Math.abs(a.d); };
      ups.sort(byMag); dns.sort(byMag);
      rows = ups.slice(0, 6).concat(dns.slice(0, 6));
      var max = 1;
      for(var j = 0; j < rows.length; j++) max = Math.max(max, Math.abs(rows[j].d));
      var h = '<div class="wb-diff"><div class="wb-dh">' + esc(T(WEB.diffH)) + '</div><div class="wb-dl">';
      for(j = 0; j < rows.length; j++){
        var n = N[rows[j].id];
        var lab = typeof n.l === 'string' ? n.l : T(n.l);
        var up = rows[j].d > 0;
        h += '<div class="wb-dr"><span class="wb-dn">' + esc(lab) + '</span>' +
             '<span class="wb-dt"><span class="wb-db ' + (up ? 'up' : 'dn') + '" data-w="' +
             (Math.abs(rows[j].d) / max * 50).toFixed(1) + '"></span></span>' +
             '<span class="wb-dv ' + (up ? 'up' : 'dn') + '">' + (up ? '▲' : '▼') + ' ' +
             esc(up ? T(WEB.gain) : T(WEB.lose)) + '</span></div>';
      }
      box.innerHTML = h + '</div></div>';
      requestAnimationFrame(function(){
        var bs = box.querySelectorAll('.wb-db');
        for(var q = 0; q < bs.length; q++){ bs[q].style.width = bs[q].getAttribute('data-w') + '%'; }
      });
    }

    function paintWeb(){
      paintCtl();
      paintZoom();
      paintDiff();
      map.querySelector('[data-w="svg"]').innerHTML = webSVG();
      applyZoom();
      hookPan();
      map.querySelector('[data-w="hint"]').textContent = T(WEB.hint) + ' ' + T(WEB.loop);
      map.querySelector('[data-w="scroll"]').textContent = L() === 'th' ? '← เลื่อนซ้ายขวาเพื่อดูทั้งใย →' : '← scroll to see the full web →';
      var ns = map.querySelectorAll('[data-w]');
      var all = map.querySelectorAll('.wb-node');
      for(var j = 0; j < all.length; j++){
        (function(node){
          node.addEventListener('click', function(){
            var id = node.getAttribute('data-w');
            picked = (picked === id) ? null : id;
            paintWeb(); paintDrill();
          });
        })(all[j]);
      }
    }

    if(!sec.__resizeHooked){
      sec.__resizeHooked = 1;
      var rt;
      window.addEventListener('resize', function(){
        clearTimeout(rt);
        rt = setTimeout(function(){ try { applyZoom(); } catch(e){} }, 160);
      });
    }

    sec.__webPaint = function(){
      phase = window.SPZ_CYCLE ? window.SPZ_CYCLE.idx() : phase;
      paintWeb(); paintDrill();
    };
    if(!sec.__cycHooked){
      sec.__cycHooked = 1;
      document.addEventListener('spz:cycle', function(e){
        if(e.detail && e.detail.src === 'web') return;
        evId = null;
        try { sec.__webPaint(); } catch(err){}
      });
    }
    paintWeb(); paintDrill();
    return true;
  }

  /* ---------------- inflation page ---------------- */
  function buildInfl(){
    var sec = el('section');
    sec.id = 'infl';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-i="eb"></span></div>' +
        '<h2 data-i="h2"></h2><p class="lede" data-i="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-i="s1"></div><div class="cl-hint" style="margin-bottom:13px" data-i="rh"></div>' +
      '<div class="v8-panel reveal"><div class="rr" data-i="rr"></div></div>' +
      '<div class="v8-sub" data-i="s2"></div><div class="cl-hint" style="margin-bottom:11px" data-i="mapHint"></div>' +
      '<div class="ctab-wrap reveal infl-map-wrap" data-i="tab"></div>' +
      '<div class="cl-hint" style="margin-top:11px" data-i="world"></div>' +
      '<div class="v8-sub" data-i="s3"></div><div class="inst-grid" data-i="inst"></div>' +
      '<div class="v8-sub" data-i="s4"></div><div class="res-grid" data-i="reads"></div>' +
      '<div class="v8-note" data-i="note"></div>';

    function q(k){ return sec.querySelector('[data-i="' + k + '"]'); }
    function te(u){ return 'https://tradingeconomics.com/' + u + '/inflation-cpi'; }

    function paintRR(){
      var g = q('rr');
      g.innerHTML = '';
      var rows = INFL.c.slice().map(function(c){
        return { c:c, r:+(c.rate - c.cpi).toFixed(1) };
      }).sort(function(a, b){ return b.r - a.r; });
      var max = 0, j;
      for(j = 0; j < rows.length; j++) max = Math.max(max, Math.abs(rows[j].r));
      for(j = 0; j < rows.length; j++){
        (function(row, idx){
          var pos = row.r >= 0;
          var el2 = el('div', 'rr-row',
            '<span class="rr-n">' + row.c.f + ' ' + esc(T(row.c.n)) + '</span>' +
            '<span class="rr-t"><span class="rr-b ' + (pos ? 'pos' : 'neg') + '" data-w="' +
              (Math.abs(row.r) / max * 50).toFixed(1) + '" style="transition-delay:' + (idx * 0.04).toFixed(2) + 's"></span></span>' +
            '<span class="rr-v ' + (pos ? 'pos' : 'neg') + '">' + (pos ? '+' : '') + row.r + '%</span>');
          el2.addEventListener('click', function(){ window.open(te(row.c.u), '_blank', 'noopener'); });
          g.appendChild(el2);
        })(rows[j], j);
      }
      requestAnimationFrame(function(){
        var b = g.querySelectorAll('.rr-b');
        for(var k = 0; k < b.length; k++){ b[k].style.width = b[k].getAttribute('data-w') + '%'; }
      });
    }

    /* live snapshot, same guarded pattern every other screen uses to reach
       window.__SPZ_LIVE without throwing before the data has loaded */
    function snapshot(){
      try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
      catch(e){ return null; }
    }
    function isNum(v){ return typeof v === 'number' && isFinite(v); }
    function CBYU(u){
      for(var j = 0; j < INFL.c.length; j++) if(INFL.c[j].u === u) return INFL.c[j];
      return null;
    }
    /* snapshot().ccy is keyed by currency code and already carries a live
       rate vs USD -- the same field the Currency Board card (fxHTML) reads.
       Venezuela's bolivar isn't in that feed (no reliable market rate), so
       this comes back null there and the tooltip just shows the code. */
    function fxRateFor(cur){
      var s = snapshot(), row = s && s.ccy && s.ccy[cur];
      return (row && isNum(row.rate)) ? row.rate : null;
    }
    function fmtFx(v){
      if(!isNum(v)) return null;
      return v >= 100 ? v.toFixed(1) : (v >= 10 ? v.toFixed(2) : v.toFixed(3));
    }
    function cpiClass(cpi){ return cpi >= 10 ? 'ct-hot' : (cpi >= 3 ? 'ct-mid' : 'ct-cool'); }

    function tipHTML(u){
      var c = CBYU(u);
      var cols = INFL.cols[L()] || INFL.cols.en;
      if(!c){
        return '<div class="infl-tip-h">' + esc(T(INFL.lgNone)) + '</div>';
      }
      var real = +(c.rate - c.cpi).toFixed(1);
      var fx = fmtFx(fxRateFor(c.cur));
      return '<div class="infl-tip-h">' + c.f + ' <b>' + esc(T(c.n)) + '</b></div>' +
        '<div class="infl-tip-row"><span>' + esc(cols[1]) + '</span><span class="' + cpiClass(c.cpi) + '">' + c.cpi + '%</span></div>' +
        '<div class="infl-tip-row"><span>' + esc(cols[2]) + '</span><span class="infl-tip-plain">' + c.rate + '%</span></div>' +
        '<div class="infl-tip-row"><span>' + esc(cols[3]) + '</span><span class="' + (real >= 0 ? 'ct-cool' : 'ct-hot') + '">' +
          (real >= 0 ? '+' : '') + real + '%</span></div>' +
        '<div class="infl-tip-row"><span>' + esc(T(INFL.fxL)) + '</span><span class="infl-tip-cur">' +
          (fx ? ('1 USD = ' + fx + ' ' + esc(c.cur)) : esc(c.cur) + ' — ' + esc(T(INFL.noFx))) + '</span></div>';
    }

    function mapSVG(){
      var s = '<g>', j, f, cls, c, p;
      for(j = 0; j < INFL_MAP_D.length; j++){
        f = INFL_MAP_D[j];
        if(f.u){
          c = CBYU(f.u);
          cls = c ? ' ' + cpiClass(c.cpi).replace('ct-', '') : '';
          s += '<path class="infl-cty' + cls + '" data-mu="' + f.u + '" d="' + f.d + '"/>';
        } else {
          s += '<path class="infl-cty bg" d="' + f.d + '"/>';
        }
      }
      s += '</g><g>';
      for(j = 0; j < INFL_MAP_PINS.length; j++){
        p = INFL_MAP_PINS[j];
        s += '<circle class="infl-pin-hit" data-mu="' + p.u + '" cx="' + p.x + '" cy="' + p.y + '" r="13"/>' +
             '<circle class="infl-pin" cx="' + p.x + '" cy="' + p.y + '" r="4.5"/>';
      }
      return s + '</g>';
    }

    function wireMap(root){
      var tip = root.querySelector('[data-mtip]');
      var stage = root.querySelector('.infl-map-stage');
      if(!tip || !stage) return;
      var targets = root.querySelectorAll('[data-mu]');
      function place(clientX, clientY){
        var box = stage.getBoundingClientRect();
        var x = clientX - box.left, y = clientY - box.top;
        var tw = tip.offsetWidth, th = tip.offsetHeight;
        tip.style.left = Math.max(4, Math.min(box.width - tw - 4, x + 14)) + 'px';
        tip.style.top = Math.max(4, Math.min(box.height - th - 4, y - th - 12)) + 'px';
      }
      function show(ev, u){
        var cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
        var cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
        tip.innerHTML = tipHTML(u);
        tip.classList.add('on');
        place(cx, cy);
        requestAnimationFrame(function(){ place(cx, cy); });
      }
      function hide(){ tip.classList.remove('on'); }
      for(var j = 0; j < targets.length; j++){
        (function(elx){
          var u = elx.getAttribute('data-mu');
          elx.addEventListener('pointerenter', function(ev){ show(ev, u); });
          elx.addEventListener('pointermove', function(ev){ show(ev, u); });
          elx.addEventListener('pointerleave', hide);
          if(CBYU(u)){
            elx.addEventListener('click', function(){ window.open(te(u), '_blank', 'noopener'); });
          }
        })(targets[j]);
      }
      stage.addEventListener('pointerleave', hide);
    }

    function paintTab(){
      var legend = '<div class="infl-legend">' +
        '<span class="infl-lg-item"><i class="infl-lg-dot cool"></i>' + esc(T(INFL.lgCool)) + '</span>' +
        '<span class="infl-lg-item"><i class="infl-lg-dot mid"></i>' + esc(T(INFL.lgMid)) + '</span>' +
        '<span class="infl-lg-item"><i class="infl-lg-dot hot"></i>' + esc(T(INFL.lgHot)) + '</span>' +
        '<span class="infl-lg-item"><i class="infl-lg-dot none"></i>' + esc(T(INFL.lgNone)) + '</span>' +
      '</div>';
      q('tab').innerHTML =
        '<div class="infl-map-stage">' +
          '<svg class="infl-map-svg" viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid meet">' + mapSVG() + '</svg>' +
          '<div class="infl-map-tip" data-mtip></div>' +
        '</div>' + legend;
      wireMap(q('tab'));
    }

    function paintInst(){
      var g = q('inst');
      g.innerHTML = '';
      for(var j = 0; j < INFL.inst.length; j++){
        var x = INFL.inst[j];
        g.appendChild(el('div', 'inst ' + x.k,
          '<div class="inst-t">' + esc(T(x.t)) + '</div>' +
          '<div class="inst-d">' + esc(T(x.d)) + '</div>' +
          '<div class="inst-w">' + esc(T(x.w)) + '</div>'));
      }
    }

    function paintReads(){
      var g = q('reads');
      g.innerHTML = '';
      for(var j = 0; j < INFL.reads.length; j++){
        var r = INFL.reads[j];
        var cls = r.k === 'good' ? '' : (r.k === 'warn' ? ' w' : ' b');
        var hc = r.k === 'good' ? '' : (r.k === 'warn' ? ' warn' : ' bad');
        g.appendChild(el('div', 'res-card' + cls,
          '<div class="rc-h' + hc + '">' + esc(T(r.t)) + '</div>' +
          '<p style="font-size:12.7px;line-height:1.7;color:var(--grey)">' + esc(T(r.d)) + '</p>'));
      }
    }

    function paint(){
      q('eb').textContent = T(INFL.eb);
      q('h2').textContent = T(INFL.h2);
      q('lede').textContent = T(INFL.lede);
      q('s1').textContent = T(INFL.s1);
      q('s2').textContent = T(INFL.s2);
      q('s3').textContent = T(INFL.s3);
      q('s4').textContent = T(INFL.s4);
      q('rh').textContent = T(INFL.realH);
      q('mapHint').textContent = T(INFL.mapHint);
      q('world').textContent = T(INFL.world);
      q('note').innerHTML = '<b>⚠</b> ' + esc(T(INFL.note));
      paintRR(); paintTab(); paintInst(); paintReads();
    }

    sec.__render = paint;
    paint();
    return sec;
  }

  /* ---------------- boot ---------------- */
  function boot(){
    var ok = upgradeGlobe();
    if(!ok){
      var tries = 0;
      var iv = setInterval(function(){
        if(upgradeGlobe() || ++tries > 25) clearInterval(iv);
      }, 220);
    }

    if(!document.getElementById('infl')){
      var sec = buildInfl();
      sec.setAttribute('data-route', 'infl');
      var anchor = document.getElementById('globe') || document.getElementById('flow');
      if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
      else document.body.appendChild(sec);

      if(window.__spzAddRoute){
        window.__spzAddRoute({
          id:'infl', feat:true, after:'globe',
          t:{en:'Inflation & Currency',th:'เงินเฟ้อและค่าเงิน'},
          d:{en:'CPI, policy rates, real rates and currencies for 24 countries, plus which instruments actually survive inflation.',
             th:'เงินเฟ้อ ดอกเบี้ยนโยบาย ดอกเบี้ยแท้จริง และสกุลเงินของ 24 ประเทศ พร้อมเครื่องมือที่รอดจากเงินเฟ้อได้จริง'}
        });
      }
    }

    new MutationObserver(function(){
      var f = document.getElementById('infl');
      if(f && f.__render) try { f.__render(); } catch(e){}
      /* run after the globe page has finished its own repaint */
      setTimeout(function(){ try { upgradeGlobe(); } catch(e){} }, 60);
      setTimeout(function(){ try { upgradeGlobe(); } catch(e){} }, 320);
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    /* the router also re-renders the page when you navigate back to it */
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('[data-route-to="globe"]');
      if(a) setTimeout(function(){ try { upgradeGlobe(); } catch(err){} }, 220);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 420); });
  else setTimeout(boot, 420);

  /* read-only hook for the Command Center: the dated CPI / policy-rate /
     currency table above, compiled by hand, unchanged by this addition. */
  window.__SPZ_INFL = { countries: INFL.c, note: INFL.note };
})();
