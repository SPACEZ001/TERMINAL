
/* ============================================================================
   SPACEZ TERMINAL v18 — DECISION DESK
   Ranks the whole directory by blending fundamentals, cycle fit, capital flow
   and macro. Every input is visible and every weight is adjustable.
   ========================================================================= */
(function(){
  'use strict';

/* ============================================================================
   v18 — WHAT TO BUY NOW: a scoring desk that combines fundamentals, cycle
   position, capital flow and macro into one ranking.
   ========================================================================= */

/* ticker → [market, sector bucket] */
var META = {
  /* --- US --- */
  JPM:['US','bank'], BAC:['US','bank'], WFC:['US','bank'], C:['US','bank'], GS:['US','bank'],
  'BRK.B':['US','insurance'], MET:['US','insurance'],
  XOM:['US','energy'], CVX:['US','energy'], KMI:['US','energy'], ENB:['US','energy'],
  MMM:['US','industrial'], GM:['US','auto'], F:['US','auto'],
  CVS:['US','health'], PFE:['US','pharma'], JNJ:['US','health'], ABT:['US','health'],
  UNH:['US','health'], ABBV:['US','pharma'],
  NVDA:['US','semis'], AMD:['US','semis'], AVGO:['US','semis'], TSM:['US','semis'],
  MSFT:['US','cloud'], GOOGL:['US','cloud'], AMZN:['US','cloud'], ORCL:['US','cloud'],
  CRM:['US','cloud'], NOW:['US','cloud'], SHOP:['US','cloud'], PLTR:['US','cloud'],
  META:['US','cloud'], NFLX:['US','cloud'], IBM:['US','cloud'], TSLA:['US','auto'],
  DUK:['US','power'], SO:['US','power'],
  T:['US','telecom'], VZ:['US','telecom'],
  O:['US','reit'],
  MO:['US','staples'], PM:['US','staples'], PG:['US','staples'], KO:['US','staples'],
  PEP:['US','staples'], CL:['US','staples'], KMB:['US','staples'], MDLZ:['US','staples'],
  WMT:['US','retail'], COST:['US','retail'], MCD:['US','retail'], SYY:['US','retail'],
  /* --- Thailand --- */
  KBANK:['TH','bank'], BBL:['TH','bank'], SCB:['TH','bank'], KTB:['TH','bank'], TTB:['TH','bank'],
  TISCO:['TH','bank'],
  PTT:['TH','energy'], PTTEP:['TH','energy'], TOP:['TH','energy'],
  SCC:['TH','materials'],
  DELTA:['TH','power'], GULF:['TH','power'], RATCH:['TH','power'], EGCO:['TH','power'],
  AOT:['TH','industrial'], MINT:['TH','retail'], CPALL:['TH','retail'], CPAXT:['TH','retail'],
  ADVANC:['TH','telecom'],
  LH:['TH','reit'],
  BDMS:['TH','health'], BH:['TH','health'],
  CPF:['TH','staples'], OSP:['TH','staples'], TU:['TH','staples']
};

/* how strongly today's money is reaching each sector, per cycle phase (0-100) */
var FLOWMX = {
  early:{semis:70,cloud:68,power:60,bank:88,industrial:82,materials:76,auto:80,retail:78,
         energy:58,health:44,staples:40,telecom:42,reit:70,insurance:66,pharma:44},
  mid:  {semis:100,cloud:92,power:88,bank:58,industrial:74,materials:52,auto:44,retail:46,
         energy:52,health:50,staples:44,telecom:42,reit:36,insurance:50,pharma:48},
  late: {semis:46,cloud:52,power:66,bank:54,industrial:50,materials:86,auto:32,retail:44,
         energy:94,health:84,staples:82,telecom:62,reit:44,insurance:58,pharma:80},
  rec:  {semis:26,cloud:38,power:90,bank:34,industrial:30,materials:34,auto:20,retail:52,
         energy:44,health:88,staples:94,telecom:78,reit:46,insurance:48,pharma:86}
};

/* which archetype the phase historically rewards */
var PHASEMX = {
  early:{value:1.00,growth:0.85,dividend:0.55,defensive:0.45},
  mid:  {value:0.72,growth:1.00,dividend:0.60,defensive:0.55},
  late: {value:0.90,growth:0.45,dividend:0.80,defensive:0.95},
  rec:  {value:0.55,growth:0.30,dividend:0.85,defensive:1.00}
};

/* market-level macro: real rate, currency risk, and how much of today's global
   flow actually reaches that market */
var MACROMX = {
  US:{cpi:3.5, rate:3.75, flow:100, cur:'USD',
      n:{en:'Where the AI capex cycle and most global flow lands',th:'ที่ที่วัฏจักรลงทุน AI และกระแสเงินโลกส่วนใหญ่ไปตก'}},
  TH:{cpi:2.4, rate:1.50, flow:38,  cur:'THB',
      n:{en:'Low inflation protects purchasing power, but thin real rates and weak foreign flow',th:'เงินเฟ้อต่ำช่วยรักษาอำนาจซื้อ แต่ดอกเบี้ยแท้จริงบางและเงินต่างชาติเข้าน้อย'}}
};

var PICKUI = {
  eb:{en:'Decision Desk',th:'โต๊ะตัดสินใจ'},
  h2:{en:'So What Should You Actually Buy',th:'แล้วตกลงควรซื้ออะไร'},
  lede:{en:'One score built from four inputs: the fundamentals in the directory, where the cycle sits, where the money is flowing, and the macro backdrop of the market the stock trades in. Change any assumption and the whole ranking recomputes.',
        th:'คะแนนเดียวที่สร้างจากสี่ปัจจัย: ตัวเลขพื้นฐานจากหน้าหุ้นตัวอย่าง ตำแหน่งในวัฏจักร ทิศทางที่เงินกำลังไหล และภาพมหภาคของตลาดที่หุ้นนั้นซื้อขายอยู่ เปลี่ยนสมมติฐานไหนก็ตาม อันดับทั้งหมดคำนวณใหม่ทันที'},

  s1:{en:'Assumptions',th:'สมมติฐาน'},
  s2:{en:'The ranking',th:'อันดับ'},
  s3:{en:'Why this list looks like this',th:'ทำไมรายการถึงออกมาแบบนี้'},
  s4:{en:'If this happens next',th:'ถ้าต่อไปเกิดเรื่องนี้'},

  phaseH:{en:'Cycle phase',th:'ช่วงวัฏจักร'},
  phases:[{id:'early',l:{en:'Early',th:'ต้นวัฏจักร'}},{id:'mid',l:{en:'Mid',th:'กลางวัฏจักร'}},
          {id:'late',l:{en:'Late',th:'ปลายวัฏจักร'}},{id:'rec',l:{en:'Recession',th:'ถดถอย'}}],
  nowTag:{en:'data says here',th:'ข้อมูลบอกว่าอยู่นี่'},

  mktH:{en:'Market',th:'ตลาด'},
  mkts:[{id:'all',l:{en:'Both',th:'ทั้งสอง'}},{id:'US',l:{en:'US only',th:'สหรัฐฯ เท่านั้น'}},
        {id:'TH',l:{en:'Thai only',th:'ไทยเท่านั้น'}}],

  weightH:{en:'What matters most to you',th:'คุณให้น้ำหนักอะไรมากที่สุด'},
  presets:[
    {id:'bal',  l:{en:'Balanced',th:'สมดุล'},        w:{f:35,c:25,fl:30,m:10}},
    {id:'fund', l:{en:'Fundamentals',th:'เน้นพื้นฐาน'}, w:{f:60,c:15,fl:15,m:10}},
    {id:'flow', l:{en:'Follow the money',th:'ตามกระแสเงิน'}, w:{f:20,c:20,fl:50,m:10}},
    {id:'cyc',  l:{en:'Cycle first',th:'เน้นวัฏจักร'},  w:{f:25,c:50,fl:20,m:5}},
    {id:'def',  l:{en:'Sleep well',th:'นอนหลับสบาย'},  w:{f:45,c:20,fl:10,m:25}}
  ],

  legs:{f:{en:'Fundamentals',th:'พื้นฐาน'}, c:{en:'Cycle fit',th:'เข้ากับวัฏจักร'},
        fl:{en:'Flow',th:'กระแสเงิน'}, m:{en:'Macro',th:'มหภาค'}},

  showH:{en:'Showing top',th:'แสดงอันดับต้น'},
  metricH:{en:'P/E · Yield · ROE · D/E · Margin · P/B',th:'P/E · ปันผล · ROE · D/E · มาร์จิ้น · P/B'},

  reasonsH:{en:'Five things driving this ranking',th:'ห้าเรื่องที่ทำให้อันดับออกมาแบบนี้'},

  ev:[
    {id:'aiUp', ic:'🤖', to:'mid',
     t:{en:'AI capex guidance revised up again',th:'ไฮเปอร์สเกลเลอร์ปรับเพิ่มงบลงทุน AI อีก'},
     n:{en:'Mid cycle extends. Semis, cloud and power keep taking the flow, and the ranking barely moves.',
        th:'กลางวัฏจักรยืดออกไป เซมิ คลาวด์ และไฟฟ้ายังรับกระแสเงินต่อ อันดับแทบไม่ขยับ'}},
    {id:'infl', ic:'🔥', to:'late',
     t:{en:'Inflation re-accelerates above 4%',th:'เงินเฟ้อกลับมาเร่งเกิน 4%'},
     n:{en:'Forces a policy response. Energy, materials, healthcare and staples take over; long-duration growth is sold first.',
        th:'บังคับให้เกิดการตอบสนองเชิงนโยบาย พลังงาน วัสดุ สุขภาพ และสินค้าจำเป็นขึ้นนำ ส่วนหุ้นเติบโตระยะยาวไกลถูกขายก่อน'}},
    {id:'ism', ic:'📉', to:'late',
     t:{en:'Two ISM prints below 50',th:'ค่า ISM ต่ำกว่า 50 สองครั้งติด'},
     n:{en:'The clearest confirmation that mid has become late. Quality and pricing power start to matter more than growth rate.',
        th:'การยืนยันที่ชัดที่สุดว่ากลางกลายเป็นปลายแล้ว คุณภาพและอำนาจตั้งราคาเริ่มสำคัญกว่าอัตราการเติบโต'}},
    {id:'crd', ic:'💥', to:'rec',
     t:{en:'Credit spreads blow out',th:'ส่วนต่างเครดิตกว้างขึ้นรุนแรง'},
     n:{en:'This leads equities. Balance-sheet strength beats everything — utilities, staples and healthcare only.',
        th:'ตัวนี้นำหน้าหุ้น ความแข็งแรงของงบดุลชนะทุกอย่าง เหลือแค่สาธารณูปโภค สินค้าจำเป็น และสุขภาพ'}},
    {id:'cut', ic:'✂️', to:'early',
     t:{en:'Fed cuts and cash starts moving',th:'เฟดลดดอกเบี้ยและเงินสดเริ่มเคลื่อน'},
     n:{en:'The $7.93T cash pile loses its yield. Banks, cyclicals and small caps lead — the ranking flips almost completely.',
        th:'กองเงินสด 7.93 ล้านล้านหมดผลตอบแทน ธนาคาร หุ้นวัฏจักร และหุ้นเล็กขึ้นนำ อันดับพลิกเกือบทั้งหมด'}},
    {id:'baht', ic:'🇹🇭', to:'mid',
     t:{en:'Dollar weakens, foreign money returns to SET',th:'ดอลลาร์อ่อน เงินต่างชาติกลับเข้า SET'},
     n:{en:'The only scenario where Thai names climb the list. Raises the Thai market flow score sharply.',
        th:'ฉากเดียวที่หุ้นไทยไต่อันดับขึ้นมา ทำให้คะแนนกระแสเงินของตลาดไทยพุ่งขึ้นแรง'}}
  ],
  evH:{en:'Tap an event to re-run the whole ranking under it',th:'แตะเหตุการณ์เพื่อคำนวณอันดับใหม่ทั้งหมดภายใต้เงื่อนไขนั้น'},
  back:{en:'Back to today',th:'กลับไปสถานะปัจจุบัน'},

  why:{
    pe:{en:'cheap on earnings',th:'ถูกเมื่อวัดด้วยกำไร'},
    div:{en:'pays well',th:'จ่ายปันผลดี'},
    roe:{en:'high return on equity',th:'ผลตอบแทนต่อส่วนทุนสูง'},
    de:{en:'low debt',th:'หนี้ต่ำ'},
    mg:{en:'wide margin',th:'อัตรากำไรกว้าง'},
    pb:{en:'cheap on book',th:'ถูกเมื่อวัดด้วยมูลค่าทางบัญชี'},
    flow:{en:'sector receiving flow',th:'อยู่ในกลุ่มที่เงินกำลังเข้า'},
    cyc:{en:'archetype suits this phase',th:'ประเภทหุ้นเข้ากับช่วงนี้'},
    mac:{en:'friendly macro backdrop',th:'ภาพมหภาคเป็นใจ'}
  },

  note:{en:'This is a transparent scoring model, not a recommendation. It ranks a fixed teaching universe using simplified figures — it cannot see management quality, competition, litigation, accounting choices or anything that happened this week. Every number behind it should be verified at the source before you act. Educational content only.',
        th:'นี่คือโมเดลให้คะแนนที่เปิดเผยวิธีคิดทั้งหมด ไม่ใช่คำแนะนำให้ซื้อ มันจัดอันดับชุดหุ้นสำหรับสอนโดยใช้ตัวเลขที่ทำให้ง่ายลง — มันมองไม่เห็นคุณภาพผู้บริหาร คู่แข่ง คดีความ วิธีทางบัญชี หรืออะไรก็ตามที่เพิ่งเกิดสัปดาห์นี้ ทุกตัวเลขเบื้องหลังต้องไปตรวจสอบจากแหล่งต้นทางก่อนลงมือ เป็นเนื้อหาเพื่อการศึกษาเท่านั้น'}
};


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function num(v){
    if(v == null) return NaN;
    var m = String(v).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  }

  function LIVE(){ return window.SPZ_CYCLE ? window.SPZ_CYCLE.live : 'mid'; }
  function NOWP(){ return window.SPZ_CYCLE ? window.SPZ_CYCLE.phase : 'mid'; }
  var S = { phase:NOWP(), mkt:'all', preset:'bal', top:12, ev:null, flowBoost:null };

  /* ---------------- build the universe from the app's own directory ---------------- */
  var UNI = null;
  function universe(){
    if(UNI) return UNI;
    var dir = window.__SPZ_DIR;
    if(!dir) return null;
    UNI = [];
    var cats = ['value', 'growth', 'dividend', 'defensive'];
    for(var c = 0; c < cats.length; c++){
      var list = dir[cats[c]] || [];
      for(var i = 0; i < list.length; i++){
        var s = list[i], m = META[s.ticker] || ['US', 'industrial'];
        UNI.push({
          tk:s.ticker, arch:cats[c], mkt:m[0], sec:m[1],
          nm:{ en:s.name_en, th:s.name_th },
          pe:num(s.pe), div:num(s.div != null ? s.div : (s.div_en || 0)),
          roe:num(s.roe), de:num(s.de_ratio), mg:num(s.net_margin), pb:num(s.pb_ratio)
        });
      }
    }
    return UNI;
  }

  /* ---------------- fundamentals: percentile rank, direction aware ---------------- */
  var FUND = null;
  function fundScores(){
    if(FUND) return FUND;
    var u = universe();
    if(!u) return null;
    var keys = [['pe', -1], ['div', 1], ['roe', 1], ['de', -1], ['mg', 1], ['pb', -1]];
    FUND = {};
    var pct = {};
    for(var k = 0; k < keys.length; k++){
      var key = keys[k][0], dir = keys[k][1];
      var vals = [];
      for(var i = 0; i < u.length; i++) if(isFinite(u[i][key])) vals.push(u[i][key]);
      vals.sort(function(a, b){ return a - b; });
      pct[key] = {};
      for(i = 0; i < u.length; i++){
        var v = u[i][key];
        if(!isFinite(v)){ pct[key][u[i].tk] = 45; continue; }
        /* rank position, then flip when lower is better */
        var lo = 0;
        for(var j = 0; j < vals.length; j++) if(vals[j] < v) lo++;
        var p = vals.length > 1 ? lo / (vals.length - 1) * 100 : 50;
        pct[key][u[i].tk] = dir > 0 ? p : 100 - p;
      }
    }
    for(i = 0; i < u.length; i++){
      var t = u[i].tk;
      FUND[t] = {
        pe:pct.pe[t], div:pct.div[t], roe:pct.roe[t],
        de:pct.de[t], mg:pct.mg[t], pb:pct.pb[t],
        total:(pct.pe[t] * 1.1 + pct.div[t] * 0.8 + pct.roe[t] * 1.2 +
               pct.de[t] * 1.0 + pct.mg[t] * 1.1 + pct.pb[t] * 0.8) / 6.0
      };
    }
    return FUND;
  }

  /* ---------------- the score ---------------- */
  function weights(){
    for(var i = 0; i < PICKUI.presets.length; i++)
      if(PICKUI.presets[i].id === S.preset) return PICKUI.presets[i].w;
    return PICKUI.presets[0].w;
  }

  function rank(o){
    o = o || {};
    var ph0 = o.phase || S.phase;
    var boost = o.flowBoost !== undefined ? o.flowBoost : S.flowBoost;
    var u = universe(), F = fundScores();
    if(!u || !F) return [];
    var w = weights(), flow = FLOWMX[ph0], ph = PHASEMX[ph0];
    var out = [];
    for(var i = 0; i < u.length; i++){
      var s = u[i];
      if(S.mkt !== 'all' && s.mkt !== S.mkt) continue;
      var mac = MACROMX[s.mkt] || MACROMX.US;

      var fFund = F[s.tk].total;
      var fCyc  = (ph[s.arch] || 0.5) * 100;
      var mktFlow = mac.flow;
      if(boost && boost[s.mkt]) mktFlow = Math.min(100, mktFlow * boost[s.mkt]);
      var fFlow = (flow[s.sec] != null ? flow[s.sec] : 50) * 0.7 + mktFlow * 0.3;
      /* macro: a real rate near 1-2% is ideal; far above or below is penalised */
      var real = mac.rate - mac.cpi;
      var fMac = Math.max(10, 100 - Math.abs(real - 1.2) * 22);

      var total = (fFund * w.f + fCyc * w.c + fFlow * w.fl + fMac * w.m) / 100;
      out.push({
        s:s, total:total,
        legs:{ f:fFund * w.f / 100, c:fCyc * w.c / 100, fl:fFlow * w.fl / 100, m:fMac * w.m / 100 },
        raw:{ f:fFund, c:fCyc, fl:fFlow, m:fMac }
      });
    }
    out.sort(function(a, b){ return b.total - a.total; });
    return out;
  }

  function whyText(r){
    var F = fundScores()[r.s.tk], bits = [];
    var fm = [['roe', F.roe], ['mg', F.mg], ['pe', F.pe], ['div', F.div], ['de', F.de], ['pb', F.pb]];
    fm.sort(function(a, b){ return b[1] - a[1]; });
    for(var i = 0; i < 2; i++) if(fm[i][1] >= 62) bits.push(T(PICKUI.why[fm[i][0]]));
    if(r.raw.fl >= 72) bits.push(T(PICKUI.why.flow));
    if(r.raw.c >= 80) bits.push(T(PICKUI.why.cyc));
    if(r.raw.m >= 80) bits.push(T(PICKUI.why.mac));
    if(!bits.length) bits.push(T(PICKUI.why[fm[0][0]]));
    return bits.slice(0, 3);
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

  /* the guided walkthrough reuses exactly this engine for its final summary */
  window.__SPZ_RANK = function(o){
    o = o || {};
    var keepP = S.phase, keepM = S.mkt, keepW = S.preset, keepB = S.flowBoost;
    if(o.phase) S.phase = o.phase;
    if(o.mkt) S.mkt = o.mkt;
    if(o.preset) S.preset = o.preset;
    S.flowBoost = o.flowBoost || null;
    var r;
    try { r = rank(); } finally {
      S.phase = keepP; S.mkt = keepM; S.preset = keepW; S.flowBoost = keepB;
    }
    return r;
  };
  window.__SPZ_WHY = function(r){ return whyText(r); };

  /* which sectors today's flow map favours vs starves, for a given phase —
     the same table rank() already uses, just surfaced so other modules
     (the guided-mode summary) can describe the rotation in words instead
     of only baking it into a score nobody sees the inside of */
  var SECLBL = {
    en:{bank:'banks',insurance:'insurers',energy:'energy',industrial:'industrials',auto:'autos',
        health:'health',pharma:'pharma',semis:'semiconductors',cloud:'cloud & software',
        power:'power & utilities',telecom:'telecom',reit:'REITs',staples:'staples',
        retail:'retail',materials:'materials'},
    th:{bank:'ธนาคาร',insurance:'ประกัน',energy:'พลังงาน',industrial:'อุตสาหกรรม',auto:'ยานยนต์',
        health:'สุขภาพ',pharma:'ยา',semis:'เซมิคอนดักเตอร์',cloud:'คลาวด์และซอฟต์แวร์',
        power:'ไฟฟ้าและสาธารณูปโภค',telecom:'โทรคมนาคม',reit:'กองทรัสต์อสังหาฯ',staples:'สินค้าจำเป็น',
        retail:'ค้าปลีก',materials:'วัสดุ'}
  };
  window.__SPZ_FLOWMAP = function(phase){
    var flow = FLOWMX[phase] || FLOWMX.mid;
    var rows = Object.keys(flow).map(function(k){ return { sec:k, score:flow[k] }; });
    rows.sort(function(a, b){ return b.score - a.score; });
    return {
      top: rows.slice(0, 3),
      bottom: rows.slice(-3).reverse(),
      label: function(sec, lang){ return (SECLBL[lang] || SECLBL.en)[sec] || sec; }
    };
  };
  /* ticker -> plain-English business description, looked up from the same
     directory the Stock Directory page renders from */
  window.__SPZ_STOCK_DESC = function(tk){
    var dir = window.__SPZ_DIR;
    if(!dir) return null;
    var cats = ['value', 'growth', 'dividend', 'defensive'];
    for(var c = 0; c < cats.length; c++){
      var list = dir[cats[c]] || [];
      for(var i = 0; i < list.length; i++){
        if(list[i].ticker === tk) return { en:list[i].desc_en, th:list[i].desc_th };
      }
    }
    return null;
  };

  /* one-line, plain-English explanations for the metric abbreviations
     (P/E, ROE, ...) that show up as bare labels in several places —
     the Glossary has the full explanation, this is the tooltip version */
  var MTIP = {
    en:{ pe:"Price divided by earnings per share — how many years of today's profit you're paying up front for.",
         div:'Annual dividend as a percent of the share price.',
         roe:"Annual profit as a percent of shareholder equity — how efficiently the company turns its own capital into profit.",
         de:'Total debt divided by shareholder equity — how much the company relies on borrowed money.',
         mg:"Net profit as a percent of revenue — how much of every unit of sales actually becomes profit.",
         pb:"Share price divided by book value per share — what you're paying versus the company's accounting net worth." },
    th:{ pe:'ราคาหุ้นหารด้วยกำไรต่อหุ้น — จ่ายเงินซื้อกำไรของบริษัทล่วงหน้ากี่ปี',
         div:'เงินปันผลต่อปี คิดเป็นเปอร์เซ็นต์ของราคาหุ้น',
         roe:'กำไรต่อปี คิดเป็นเปอร์เซ็นต์ของส่วนของผู้ถือหุ้น — บริษัทใช้เงินทุนของตัวเองสร้างกำไรได้มีประสิทธิภาพแค่ไหน',
         de:'หนี้สินรวมหารด้วยส่วนของผู้ถือหุ้น — บริษัทพึ่งพาเงินกู้มากแค่ไหน',
         mg:'กำไรสุทธิ คิดเป็นเปอร์เซ็นต์ของรายได้ — ทุกหน่วยที่ขายได้ กลายเป็นกำไรเท่าไหร่',
         pb:'ราคาหุ้นหารด้วยมูลค่าทางบัญชีต่อหุ้น — จ่ายแพงกว่ามูลค่าทางบัญชีของบริษัทแค่ไหน' }
  };
  window.__SPZ_MTIP = function(key){
    var lg = (document.documentElement.getAttribute('lang') === 'th') ? 'th' : 'en';
    return (MTIP[lg] || MTIP.en)[key] || '';
  };

  /* ---------------- page ---------------- */
  function build(){
    var sec = el('section');
    sec.id = 'desk';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-d="eb"></span></div>' +
        '<h2 data-d="h2"></h2><p class="lede" data-d="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-d="s0"></div><div data-d="sum"></div>' +
      '<div class="v8-sub" data-d="s5"></div><div data-d="swap"></div>' +
      '<div class="v8-sub" data-d="s1"></div><div class="dk-bar" data-d="bar"></div>' +
      '<div class="v8-sub" data-d="s2"></div><div class="rk" data-d="rk"></div>' +
      '<div class="v8-sub" data-d="s3"></div><div class="wy-grid" data-d="why"></div>' +
      '<div class="v8-sub" data-d="s4"></div><div class="cl-hint" style="margin-bottom:12px" data-d="evh"></div>' +
      '<div class="ev-strip" data-d="ev"></div><div data-d="evmsg"></div>' +
      '<div class="v8-note" data-d="note"></div>';

    function q(k){ return sec.querySelector('[data-d="' + k + '"]'); }
    var prev = {};

    function seg(labelKey, list, cur, cb, nowId){
      var row = el('div', 'dk-row');
      row.appendChild(el('span', 'dk-lab', esc(T(PICKUI[labelKey]))));
      for(var i = 0; i < list.length; i++){
        (function(o){
          var b = el('button', 'dk-b' + (cur === o.id ? ' on' : ''),
            esc(T(o.l)) + (o.id === nowId ? '<span class="dk-now">' + esc(T(PICKUI.nowTag)) + '</span>' : ''));
          b.type = 'button';
          b.addEventListener('click', function(){ cb(o.id); });
          row.appendChild(b);
        })(list[i]);
      }
      return row;
    }

    function paintBar(){
      var bar = q('bar');
      bar.innerHTML = '';
      bar.appendChild(seg('phaseH', PICKUI.phases, S.phase, function(v){
        S.phase = v; S.ev = null; S.flowBoost = null;
        if(window.SPZ_CYCLE) window.SPZ_CYCLE.set(v, 'desk');
        paint();
      }, LIVE()));
      bar.appendChild(seg('mktH', PICKUI.mkts, S.mkt, function(v){ S.mkt = v; paint(); }));
      bar.appendChild(seg('weightH', PICKUI.presets, S.preset, function(v){ S.preset = v; paint(); }));

      var w = weights();
      var mix = el('div', 'dk-row');
      mix.appendChild(el('span', 'dk-lab', ''));
      mix.appendChild(el('span', 'dk-mix',
        '<span class="dk-mx f"  style="width:' + w.f  + '%"></span>' +
        '<span class="dk-mx c"  style="width:' + w.c  + '%"></span>' +
        '<span class="dk-mx fl" style="width:' + w.fl + '%"></span>' +
        '<span class="dk-mx m"  style="width:' + w.m  + '%"></span>'));
      bar.appendChild(mix);

      var key = el('div', 'dk-key',
        '<span class="dk-k"><span class="dk-sw" style="background:var(--neon)"></span>' + esc(T(PICKUI.legs.f)) + ' ' + w.f + '%</span>' +
        '<span class="dk-k"><span class="dk-sw" style="background:#4dd8ff"></span>' + esc(T(PICKUI.legs.c)) + ' ' + w.c + '%</span>' +
        '<span class="dk-k"><span class="dk-sw" style="background:#ff9f45"></span>' + esc(T(PICKUI.legs.fl)) + ' ' + w.fl + '%</span>' +
        '<span class="dk-k"><span class="dk-sw" style="background:#b98cff"></span>' + esc(T(PICKUI.legs.m)) + ' ' + w.m + '%</span>');
      bar.appendChild(key);
    }

    function paintRank(rows){
      var g = q('rk');
      g.innerHTML = '';
      var show = Math.min(S.top, rows.length);
      for(var i = 0; i < show; i++){
        (function(r, idx){
          var s = r.s, F = fundScores()[s.tk];
          var mv = Math.max(1, r.total);
          var seg2 = function(v, cls){
            return '<span class="rk-sg ' + cls + '" style="width:' + (v / mv * 100).toFixed(1) +
                   '%;background:' + ({f:'var(--neon)', c:'#4dd8ff', fl:'#ff9f45', m:'#b98cff'}[cls]) + '"></span>';
          };
          var d = prev[s.tk] != null ? (prev[s.tk] - idx) : 0;
          var diff = S.ev && d !== 0
            ? '<span class="ev-diff ' + (d > 0 ? 'up' : 'dn') + '">' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</span>' : '';
          var why = whyText(r).map(function(x){ return '<b>' + esc(x) + '</b>'; }).join(' · ');
          var card = el('div', 'rk-c' + (idx < 3 ? ' top' : ''),
            '<span class="rk-n">' + (idx + 1) + '</span>' +
            '<span class="rk-mid"><span class="rk-t"><span class="rk-tk">$' + esc(s.tk) + '</span>' + diff +
              '<span class="rk-nm">' + esc(T(s.nm)) + '</span>' +
              '<span class="rk-tag">' + esc(s.mkt) + ' · ' + esc(s.sec) + '</span></span>' +
              '<span class="rk-why">' + why + '</span></span>' +
            '<span class="rk-stackwrap"><span class="rk-stack">' +
              seg2(r.legs.f, 'f') + seg2(r.legs.c, 'c') + seg2(r.legs.fl, 'fl') + seg2(r.legs.m, 'm') +
            '</span><span class="rk-met">P/E ' + (isFinite(s.pe) ? s.pe : '—') +
              ' · ' + (isFinite(s.div) ? s.div + '%' : '—') +
              ' · ROE ' + (isFinite(s.roe) ? s.roe + '%' : '—') +
              ' · D/E ' + (isFinite(s.de) ? s.de : '—') +
              ' · MG ' + (isFinite(s.mg) ? s.mg + '%' : '—') +
              ' · P/B ' + (isFinite(s.pb) ? s.pb : '—') + '</span></span>' +
            '<span class="rk-sc">' + r.total.toFixed(1) + '</span>');
          card.addEventListener('click', function(){ jumpTicker(s.tk); });
          g.appendChild(card);
        })(rows[i], i);
      }
      var np = {};
      for(var j = 0; j < rows.length; j++) np[rows[j].s.tk] = j;
      prev = np;
    }

    function metricRow(s){
      var m = [['P/E', s.pe, '', 'pe'], [T({en:'Yield',th:'ปันผล'}), s.div, '%', 'div'],
               ['ROE', s.roe, '%', 'roe'], ['D/E', s.de, '', 'de'],
               [T({en:'Margin',th:'มาร์จิ้น'}), s.mg, '%', 'mg'], ['P/B', s.pb, '', 'pb']];
      var h = '<div class="sm-met">';
      for(var i = 0; i < m.length; i++){
        var tip = window.__SPZ_MTIP ? window.__SPZ_MTIP(m[i][3]) : '';
        h += '<span class="sm-m"><b' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + esc(m[i][0]) + '</b>' +
             (isFinite(m[i][1]) ? m[i][1] + m[i][2] : '—') + '</span>';
      }
      return h + '</div>';
    }

    function paintSum(rows){
      var g = q('sum');
      g.innerHTML = '';
      var phName = phLabel(S.phase);
      var top = rows.slice(0, 5);
      if(!top.length){ g.innerHTML = '<div class="dr-empty">—</div>'; return; }

      var lead = el('p', 'lede');
      lead.style.marginBottom = '16px';
      lead.textContent = L() === 'th'
        ? 'อ่านจากช่วง' + phName + ' + ตัวเลขพื้นฐานของหุ้น ' + universe().length +
          ' ตัว + ทิศทางกระแสเงินตอนนี้ ห้าอันดับแรกที่คะแนนรวมออกมาสูงสุดคือ'
        : 'Reading ' + phName + ' against the fundamentals of ' + universe().length +
          ' names and where the money is currently flowing, the five highest total scores are';
      g.appendChild(lead);

      var list = el('div', 'sm-list');
      for(var i = 0; i < top.length; i++){
        (function(r, idx){
          var s = r.s;
          var why = whyText(r);
          var card = el('div', 'sm-c' + (idx === 0 ? ' first' : ''),
            '<span class="sm-n">' + (idx + 1) + '</span>' +
            '<span class="sm-b">' +
              '<span class="sm-t"><span class="sm-tk">$' + esc(s.tk) + '</span>' +
              '<span class="sm-nm">' + esc(T(s.nm)) + '</span>' +
              '<span class="sm-tag">' + esc(s.mkt) + ' · ' + esc(s.sec) + ' · ' + esc(s.arch) + '</span>' +
              '<span class="sm-sc">' + r.total.toFixed(1) + '</span></span>' +
              '<span class="sm-why">' + esc(why.join(' · ')) + '</span>' +
              metricRow(s) +
            '</span>');
          card.addEventListener('click', function(){ jumpTicker(s.tk); });
          list.appendChild(card);
        })(top[i], i);
      }
      g.appendChild(list);
    }

    function paintSwap(rows){
      var g = q('swap');
      g.innerHTML = '';
      var nowTop = rows.slice(0, 5).map(function(r){ return r.s.tk; });

      var lead = el('div', 'cl-hint');
      lead.style.marginBottom = '13px';
      lead.textContent = L() === 'th'
        ? 'แต่ละแถวคือการคำนวณอันดับใหม่ทั้งชุดภายใต้เหตุการณ์นั้น แล้วเทียบกับห้าอันดับปัจจุบัน'
        : 'Each row re-runs the entire ranking under that event and diffs it against the current top five.';
      g.appendChild(lead);

      var wrap = el('div', 'sw-wrap');
      for(var i = 0; i < PICKUI.ev.length; i++){
        (function(e){
          var alt = rank({ phase:e.to, flowBoost:e.id === 'baht' ? { TH:2.3 } : null })
                    .slice(0, 5).map(function(r){ return r.s.tk; });
          var out = [], into = [], j;
          for(j = 0; j < nowTop.length; j++) if(alt.indexOf(nowTop[j]) === -1) out.push(nowTop[j]);
          for(j = 0; j < alt.length; j++) if(nowTop.indexOf(alt[j]) === -1) into.push(alt[j]);

          function chips(arr, cls){
            if(!arr.length) return '<span class="sw-none">—</span>';
            var h = '';
            for(var k = 0; k < arr.length; k++){
              h += '<button type="button" class="sw-chip ' + cls + '" data-tk="' + esc(arr[k]) + '">$' +
                   esc(arr[k]) + '</button>';
            }
            return h;
          }

          var row = el('div', 'sw-row',
            '<span class="sw-ev"><span class="sw-ic">' + e.ic + '</span>' +
              '<span class="sw-et">' + esc(T(e.t)) + '</span>' +
              '<span class="sw-ep">→ ' + esc(phLabel(e.to)) + '</span></span>' +
            '<span class="sw-mv"><span class="sw-lab out">' +
              esc(L() === 'th' ? 'หลุดจากห้าอันดับ' : 'drops out') + '</span>' + chips(out, 'out') + '</span>' +
            '<span class="sw-arrow">→</span>' +
            '<span class="sw-mv"><span class="sw-lab in">' +
              esc(L() === 'th' ? 'เข้ามาแทน' : 'moves in') + '</span>' + chips(into, 'in') + '</span>');
          wrap.appendChild(row);
        })(PICKUI.ev[i]);
      }
      g.appendChild(wrap);

      var cs = g.querySelectorAll('[data-tk]');
      for(var c = 0; c < cs.length; c++){
        (function(n){ n.addEventListener('click', function(){ jumpTicker(n.getAttribute('data-tk')); }); })(cs[c]);
      }
    }

    function paintWhy(rows){
      var g = q('why');
      g.innerHTML = '';
      var phName = '';
      for(var p = 0; p < PICKUI.phases.length; p++)
        if(PICKUI.phases[p].id === S.phase) phName = T(PICKUI.phases[p].l);

      /* which sector and archetype dominate the top ten */
      var secN = {}, archN = {}, mkN = {}, i;
      for(i = 0; i < Math.min(10, rows.length); i++){
        secN[rows[i].s.sec] = (secN[rows[i].s.sec] || 0) + 1;
        archN[rows[i].s.arch] = (archN[rows[i].s.arch] || 0) + 1;
        mkN[rows[i].s.mkt] = (mkN[rows[i].s.mkt] || 0) + 1;
      }
      function best(o){ var k, b = null; for(k in o) if(!b || o[k] > o[b]) b = k; return b; }
      var topSec = best(secN), topArch = best(archN);
      var thN = mkN.TH || 0;
      var top1 = rows[0] ? rows[0].s : null;
      var w = weights();

      var cards = [
        {h:{en:'Cycle assumption',th:'สมมติฐานวัฏจักร'},
         d:{en:'Ranked as ' + phName + '. That alone sets ' + Math.round(PHASEMX[S.phase][topArch] * 100) +
              '% weight on ' + topArch + ' names before a single fundamental is read.',
            th:'จัดอันดับภายใต้ช่วง' + phName + ' แค่ข้อนี้ข้อเดียวก็ให้น้ำหนัก ' +
              Math.round(PHASEMX[S.phase][topArch] * 100) + '% กับหุ้นแนว ' + topArch + ' ก่อนจะอ่านตัวเลขพื้นฐานสักตัว'}},
        {h:{en:'Where the flow points',th:'กระแสเงินชี้ไปทางไหน'},
         d:{en:topSec + ' scores ' + FLOWMX[S.phase][topSec] + '/100 on flow in this phase and fills ' +
              secN[topSec] + ' of the top ten. Flow carries ' + w.fl + '% of the score right now.',
            th:'กลุ่ม ' + topSec + ' ได้คะแนนกระแสเงิน ' + FLOWMX[S.phase][topSec] + '/100 ในช่วงนี้ และกินไป ' +
              secN[topSec] + ' จากสิบอันดับแรก กระแสเงินคิดเป็น ' + w.fl + '% ของคะแนนตอนนี้'}},
        {h:{en:'What the numbers add',th:'ตัวเลขพื้นฐานเพิ่มอะไร'},
         d:top1 ? {en:'$' + top1.tk + ' leads on ' + whyText(rows[0]).join(', ') +
              '. Fundamentals are ' + w.f + '% of the blend, so a strong balance sheet can outrank a hot sector.',
            th:'$' + top1.tk + ' นำด้วย ' + whyText(rows[0]).join(', ') +
              ' ตัวเลขพื้นฐานคิดเป็น ' + w.f + '% ของส่วนผสม งบดุลที่แข็งจึงแซงกลุ่มที่กำลังร้อนได้'}
            : {en:'No names match this filter.',th:'ไม่มีหุ้นตรงกับตัวกรองนี้'}},
        {h:{en:'The Thai problem',th:'ปัญหาของหุ้นไทย'}, k:'warn',
         d:{en:'Only ' + thN + ' Thai names reach the top ten. Not because the businesses are worse — the Thai market scores ' +
              MACROMX.TH.flow + '/100 on global flow versus ' + MACROMX.US.flow +
              ' for the US. Change the market filter to rank Thai names against each other instead.',
            th:'มีหุ้นไทยแค่ ' + thN + ' ตัวที่ติดสิบอันดับแรก ไม่ใช่เพราะธุรกิจแย่กว่า — ตลาดไทยได้คะแนนกระแสเงินโลก ' +
              MACROMX.TH.flow + '/100 เทียบกับสหรัฐฯ ที่ ' + MACROMX.US.flow +
              ' ให้เปลี่ยนตัวกรองตลาดเพื่อจัดอันดับหุ้นไทยแข่งกันเองแทน'}},
        {h:{en:'What this cannot see',th:'สิ่งที่โมเดลนี้มองไม่เห็น'}, k:'bad',
         d:{en:'Management quality, competition, litigation, accounting choices, and anything that happened this week. The figures are simplified teaching estimates. A high score is a reason to start researching, never a reason to buy.',
            th:'คุณภาพผู้บริหาร คู่แข่ง คดีความ วิธีทางบัญชี และอะไรก็ตามที่เพิ่งเกิดสัปดาห์นี้ ตัวเลขที่ใช้เป็นค่าประมาณเพื่อการสอน คะแนนสูงคือเหตุผลให้เริ่มไปค้นคว้าต่อ ไม่ใช่เหตุผลให้ซื้อ'}}
      ];

      for(i = 0; i < cards.length; i++){
        var c = cards[i];
        var box = el('div', 'wy' + (c.k ? ' ' + c.k : ''),
          '<div class="wy-h">' + esc(T(c.h)) + '</div><div class="wy-d">' + esc(T(c.d)) + '</div>');
        box.setAttribute('data-n', '0' + (i + 1));
        g.appendChild(box);
      }
    }

    function paintEv(){
      var g = q('ev');
      g.innerHTML = '';
      for(var i = 0; i < PICKUI.ev.length; i++){
        (function(e){
          var b = el('button', 'ev-b' + (S.ev === e.id ? ' on' : ''),
            '<span class="ev-ic">' + e.ic + '</span>' +
            '<span class="ev-t">' + esc(T(e.t)) + '</span>' +
            '<span class="ev-to">→ ' + esc(phLabel(e.to)) + '</span>');
          b.type = 'button';
          b.addEventListener('click', function(){
            if(S.ev === e.id){ S.ev = null; S.phase = LIVE(); S.flowBoost = null;
              if(window.SPZ_CYCLE) window.SPZ_CYCLE.reset(); }
            else {
              S.ev = e.id; S.phase = e.to;
              S.flowBoost = e.id === 'baht' ? { TH:2.3 } : null;
              if(window.SPZ_CYCLE) window.SPZ_CYCLE.set(e.to, 'desk');
            }
            paint();
          });
          g.appendChild(b);
        })(PICKUI.ev[i]);
      }
      var msg = q('evmsg');
      if(S.ev){
        var cur = null;
        for(var j = 0; j < PICKUI.ev.length; j++) if(PICKUI.ev[j].id === S.ev) cur = PICKUI.ev[j];
        msg.innerHTML = '<div class="ev-msg">' + cur.ic + ' ' + esc(T(cur.n)) + '</div>';
      } else msg.innerHTML = '';
    }

    function phLabel(id){
      for(var i = 0; i < PICKUI.phases.length; i++) if(PICKUI.phases[i].id === id) return T(PICKUI.phases[i].l);
      return id;
    }

    function paint(){
      q('eb').textContent = T(PICKUI.eb);
      q('h2').textContent = T(PICKUI.h2);
      q('lede').textContent = T(PICKUI.lede);
      q('s1').textContent = T(PICKUI.s1);
      q('s2').textContent = T(PICKUI.s2);
      q('s3').textContent = T(PICKUI.reasonsH);
      q('s4').textContent = T(PICKUI.s4);
      q('evh').textContent = T(PICKUI.evH);
      q('note').innerHTML = '<b>⚠</b> ' + esc(T(PICKUI.note));
      q('s0').textContent = L() === 'th' ? 'สรุป — ควรดูหุ้นอะไรตอนนี้' : 'The short answer';
      q('s5').textContent = L() === 'th' ? 'ถ้าเกิดเหตุการณ์นี้ ย้ายไปตัวไหนแทน' : 'If this happens, what replaces what';
      paintBar();
      var rows = rank();
      paintSum(rows);
      paintSwap(rows);
      paintRank(rows);
      paintWhy(rows);
      paintEv();
      requestAnimationFrame(function(){});
    }

    sec.__render = paint;
    document.addEventListener('spz:cycle', function(e){
      if(e.detail && e.detail.src === 'desk') return;
      S.phase = NOWP(); S.ev = null; S.flowBoost = null;
      try { paint(); } catch(err){}
    });
    paint();
    return sec;
  }

  /* ---------------- boot ---------------- */
  function boot(){
    if(document.getElementById('desk')) return;
    if(!window.__SPZ_DIR){ setTimeout(boot, 250); return; }

    var sec = build();
    sec.setAttribute('data-route', 'desk');
    var anchor = document.getElementById('infl') || document.getElementById('globe');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    if(window.__spzAddRoute){
      window.__spzAddRoute({
        id:'desk', feat:true, after:'infl',
        t:{en:'What To Buy Now',th:'ควรลงหุ้นอะไรดี'},
        d:{en:'One ranking built from the directory fundamentals, the cycle phase, the capital flow map and the macro backdrop — with every weight adjustable.',
           th:'อันดับเดียวที่สร้างจากตัวเลขพื้นฐาน ช่วงวัฏจักร แผนที่กระแสเงิน และภาพมหภาค พร้อมปรับน้ำหนักได้ทุกตัว'}
      });
    }

    new MutationObserver(function(){
      var d = document.getElementById('desk');
      if(d && d.__render) try { d.__render(); } catch(e){}
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 520); });
  else setTimeout(boot, 520);
})();
