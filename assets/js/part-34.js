
(function(){
  'use strict';
  if (window.__SPZ_NOW) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  var clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };

  var C = {
    eyebrow:{en:'What now',th:'ตอนนี้ควรทำอะไร'},
    h:{en:'So what am I supposed to be looking at?',th:'สรุปแล้วต้องดูอะไร'},
    lede:{en:'Everything on this site answers a piece of that question and none of it answers the whole thing, so this screen puts the pieces in the order the question is actually asked. Where the economy is. Where money is moving. Which groups have historically led from a position like this, and which real companies sit in them. What would break that read. And when it is worth coming back to look again.',
          th:'ทุกหน้าในเว็บนี้ตอบคำถามนั้นไปคนละชิ้น แต่ไม่มีหน้าไหนตอบทั้งคำถาม หน้านี้จึงเรียงชิ้นส่วนตามลำดับที่คนถามจริงๆ — เศรษฐกิจอยู่ตรงไหน เงินกำลังไหลไปทางไหน จากตำแหน่งแบบนี้กลุ่มไหนเคยนำ และมีบริษัทจริงตัวไหนอยู่ในกลุ่มนั้น อะไรจะทำให้การอ่านนี้พัง และควรกลับมาดูอีกทีเมื่อไหร่'},
    checkH:{en:'Before you analyze anything, check these in this order:',
            th:'ก่อนจะวิเคราะห์อะไรก็ตาม ให้ดูตามลำดับนี้ก่อน:'},

    menuH:{en:'Every page in the menu, one line each',th:'ทุกเมนูในเว็บ สรุปสั้นๆ บรรทัดเดียว'},
    menuL:{en:'What to actually look at on each screen — not the marketing description, the job it does. Tap any of these to open it.',
           th:'แต่ละหน้าไว้ดูอะไรบ้าง สั้นๆ ไม่ใช่คำโฆษณา กดชื่อหน้าไหนก็เปิดไปได้เลย'},

    s1:{en:'Where we are',th:'ตอนนี้อยู่ตรงไหน'}, n1:{en:'01',th:'01'},
    s1l:{en:'Three readings the rest of this page depends on. Change the cycle phase anywhere on the site and everything below follows it.',
         th:'สามค่าที่ทั้งหน้านี้อ้างอิงอยู่ ถ้าเปลี่ยนช่วงวัฏจักรที่หน้าไหนก็ตามในเว็บ ข้างล่างนี้จะเปลี่ยนตาม'},
    cyc:{en:'ECONOMIC CYCLE',th:'วัฏจักรเศรษฐกิจ'},
    rad:{en:'RADAR — HARD WARNINGS',th:'เรดาร์ — สัญญาณเตือนหนัก'},
    brd:{en:'MARKET BREADTH',th:'ความกว้างของตลาด'},
    ofN:{en:'of 11 lit',th:'จาก 11 ตัว'},
    brdN:{en:'of the market above its own 200-day line',th:'ของตลาดยืนเหนือเส้น 200 วันของตัวเอง'},
    simTag:{en:'you are simulating this — the data says {L}',th:'คุณกำลังจำลองอยู่ — ข้อมูลจริงบอกว่า{L}'},

    s2:{en:'Where the money went',th:'เงินไหลไปไหนมา'}, n2:{en:'02',th:'02'},
    s2l:{en:'The last month, measured on the price and volume of the funds that track each group — an approximation of flow, not the fund-flow tape itself. Left side is being left, right side is being bought.',
         th:'เดือนล่าสุด วัดจากราคาและวอลุ่มของกองทุนที่ตามแต่ละกลุ่ม — เป็นค่าประมาณของการไหลของเงิน ไม่ใช่ข้อมูลกระแสเงินจริงจากตลาด ฝั่งซ้ายคือกำลังถูกทิ้ง ฝั่งขวาคือกำลังถูกซื้อ'},
    fOut:{en:'money leaving',th:'เงินกำลังออก'}, fIn:{en:'money arriving',th:'เงินกำลังเข้า'},

    s3:{en:'Which groups usually lead from here',th:'จากจุดนี้ กลุ่มไหนมักนำ'}, n3:{en:'03',th:'03'},
    s3l:{en:'This is textbook sector rotation for the current phase, with the one-month move of each group beside it so you can see whether the market is actually doing it this time. The companies are examples of what each group contains — tap one to open its page. They are not picks.',
         th:'นี่คือการหมุนกลุ่มตามตำราสำหรับช่วงวัฏจักรปัจจุบัน พร้อมผลตอบแทน 1 เดือนของกลุ่มนั้นวางไว้ข้างๆ เพื่อให้เห็นว่ารอบนี้ตลาดทำตามจริงไหม ส่วนบริษัทคือตัวอย่างว่ากลุ่มนั้นมีอะไรอยู่ กดเพื่อเปิดหน้าของตัวนั้นได้ ไม่ใช่การเลือกหุ้นให้'},
    agree:{en:'the market is doing it',th:'ตลาดกำลังทำตาม'},
    disagree:{en:'the market is NOT doing it',th:'ตลาดไม่ได้ทำตาม'},
    noGrp:{en:'no matching group in the flow data',th:'ไม่มีกลุ่มที่ตรงกันในข้อมูลกระแสเงิน'},

    s4:{en:'If this happens, this is what changes',th:'ถ้าเกิดเรื่องนี้ อะไรจะเปลี่ยน'}, n4:{en:'04',th:'04'},
    s4l:{en:'Each row re-runs the site\'s whole ranking under that event and shows only the difference: which names drop out of the top five and which come in. It is the same engine the shortlist screen uses — this just skips to the answer. One caveat worth knowing: that engine scores companies on fundamentals typed in by hand in August 2026, not on the live feed, so read the names as a direction of travel rather than as today\'s numbers.',
         th:'แต่ละแถวคือการรันระบบจัดอันดับของเว็บใหม่ทั้งชุดภายใต้เหตุการณ์นั้น แล้วแสดงเฉพาะส่วนที่ต่าง — ชื่อไหนหลุดจากห้าอันดับแรก และชื่อไหนเข้ามาแทน ใช้เครื่องมือตัวเดียวกับหน้าจัดอันดับ แค่ข้ามไปที่คำตอบเลย มีข้อควรรู้หนึ่งอย่าง: เครื่องมือนั้นให้คะแนนบริษัทจากตัวเลขพื้นฐานที่พิมพ์ด้วยมือเมื่อสิงหาคม 2026 ไม่ใช่ข้อมูลสด ให้อ่านรายชื่อเป็น "ทิศทาง" ไม่ใช่ตัวเลขของวันนี้'},
    tOut:{en:'drops out',th:'หลุดออก'}, tIn:{en:'comes in',th:'เข้ามาแทน'},
    tSame:{en:'nothing changes',th:'ไม่มีอะไรเปลี่ยน'},
    tWait:{en:'Loading the ranking engine…',th:'กำลังโหลดระบบจัดอันดับ…'},

    s5:{en:'When to look again',th:'กลับมาดูอีกทีเมื่อไหร่'}, n5:{en:'05',th:'05'},
    s5l:{en:'Not every day. Rotation happens over months, and checking a slow thing quickly is how people talk themselves into trading.',
         th:'ไม่ใช่ทุกวัน การหมุนกลุ่มใช้เวลาเป็นเดือน และการเช็คของที่เคลื่อนช้าบ่อยเกินไป คือวิธีที่คนหลอกตัวเองให้เข้าไปเทรด'},

    note:{en:'<b>Read this before you use any of it.</b> The sector rotation above is textbook, not a measurement — and the backtest on this site graded most of its own signals D or F against the US market, so treat the cycle read as a way to organise what you are seeing, never as a forecast. If the phase call is wrong, every row below it is wrong with it. The companies are illustrations from a list of 81, not a screen of the market, and nothing here knows anything about your money, your tax position or your goals. Educational only. The detail behind each part is in {a}.',
          th:'<b>อ่านตรงนี้ก่อนเอาไปใช้</b> การหมุนกลุ่มด้านบนเป็นทฤษฎีตามตำรา ไม่ใช่ค่าที่วัดได้ — และการทดสอบย้อนหลังในเว็บนี้ให้เกรด D กับ F กับสัญญาณส่วนใหญ่ของตัวเองเมื่อวัดกับตลาดอเมริกา ให้ใช้การอ่านวัฏจักรเป็นวิธี "จัดระเบียบสิ่งที่เห็น" ไม่ใช่การพยากรณ์ ถ้าอ่านช่วงวัฏจักรผิด ทุกแถวที่อยู่ใต้มันก็ผิดตาม บริษัทที่ยกมาเป็นตัวอย่างจากรายชื่อ 81 ตัว ไม่ใช่การสแกนทั้งตลาด และไม่มีอะไรในนี้รู้เรื่องเงิน ภาษี หรือเป้าหมายของคุณเลย เพื่อการศึกษาเท่านั้น รายละเอียดของแต่ละส่วนอยู่ที่{a}',},
    noteA:{en:'the radar, the flow map and the Proof Lab',th:'หน้าเรดาร์ หน้ากระแสเงิน และห้องพิสูจน์'},
    waiting:{en:'Waiting for the market snapshot…',th:'รอข้อมูลตลาด…'}
  };

  /* Textbook sector leadership by phase. This is the classic rotation model,
     stated as such — the page prints the market's actual move beside each row
     so a reader can see for themselves when reality disagrees with it. */
  var PHASE_LEAD = {
    early:{
      lbl:{en:'Early cycle',th:'ต้นวัฏจักร'},
      one:{en:'Recovery is starting. Rates are low, credit is loosening, and the groups that were hurt worst tend to bounce hardest.',
           th:'เศรษฐกิจเริ่มฟื้น ดอกเบี้ยต่ำ สินเชื่อผ่อนคลาย และกลุ่มที่เจ็บหนักที่สุดมักเด้งแรงที่สุด'},
      groups:[
        {k:'Financials', en:'Financials', th:'การเงิน', t:['JPM','BAC','KBANK','SCB'],
         w:{en:'Banks earn more as lending picks up and bad debt stops growing.',
            th:'ธนาคารได้กำไรมากขึ้นเมื่อสินเชื่อกลับมาโต และหนี้เสียหยุดเพิ่ม'}},
        {k:'Consumer cyclical', en:'Consumer cyclical', th:'สินค้าฟุ่มเฟือย', t:['AMZN','MINT','AOT'],
         w:{en:'People start buying the things they postponed.',th:'คนเริ่มกลับมาซื้อของที่เคยเลื่อนไว้'}},
        {k:'Industrials', en:'Industrials', th:'อุตสาหกรรม', t:['MMM','SCC','DELTA'],
         w:{en:'Order books refill before the headlines say so.',th:'คำสั่งซื้อกลับมาเต็มก่อนที่ข่าวจะบอก'}},
        {k:'Technology', en:'Technology', th:'เทคโนโลยี', t:['AMD','NVDA','TSM'],
         w:{en:'Long-duration growth reprices upward when rates fall.',th:'หุ้นเติบโตระยะยาวถูกตีมูลค่าใหม่ให้สูงขึ้นเมื่อดอกเบี้ยลง'}}
      ]},
    mid:{
      lbl:{en:'Mid cycle',th:'กลางวัฏจักร'},
      one:{en:'The expansion is running. Earnings are broad, capital spending is committed years ahead, and leadership narrows to whoever is compounding fastest.',
           th:'การขยายตัวกำลังเดินเครื่อง กำไรกว้าง งบลงทุนถูกผูกไว้ล่วงหน้าเป็นปี และผู้นำตลาดแคบลงเหลือคนที่โตทบต้นเร็วที่สุด'},
      groups:[
        {k:'Technology', en:'Technology', th:'เทคโนโลยี', t:['NVDA','MSFT','AVGO','DELTA'],
         w:{en:'Capex committed in this phase lands here first.',th:'งบลงทุนที่ตัดสินใจในช่วงนี้ ลงมาที่กลุ่มนี้ก่อน'}},
        {k:'Industrials', en:'Industrials / capital goods', th:'อุตสาหกรรม / สินค้าทุน', t:['DELTA','SCC','MMM'],
         w:{en:'Somebody has to build what the spending buys.',th:'ต้องมีคนสร้างของที่เงินลงทุนนั้นซื้อ'}},
        {k:'Communication', en:'Communication', th:'สื่อสาร', t:['META','GOOGL','ADVANC'],
         w:{en:'Advertising and connectivity ride the same expansion.',th:'โฆษณาและการเชื่อมต่อขี่คลื่นการขยายตัวลูกเดียวกัน'}},
        {k:'Utilities', en:'Power', th:'ไฟฟ้าและพลังงาน', t:['GULF','RATCH','DUK'],
         w:{en:'Everything built in this phase has to be plugged into something.',
            th:'ทุกอย่างที่สร้างในช่วงนี้ ต้องเสียบปลั๊กกับอะไรสักอย่าง'}}
      ]},
    late:{
      lbl:{en:'Late cycle',th:'ปลายวัฏจักร'},
      one:{en:'Growth is still positive but costs are biting. What has pricing power keeps its margin; what does not, loses it.',
           th:'ยังโตอยู่แต่ต้นทุนเริ่มกัด ใครมีอำนาจตั้งราคาก็รักษามาร์จิ้นไว้ได้ ใครไม่มีก็เสียไป'},
      groups:[
        {k:'Energy', en:'Energy', th:'พลังงาน', t:['XOM','CVX','PTT','TOP'],
         w:{en:'Input costs rising is the same sentence as energy revenue rising.',
            th:'ต้นทุนวัตถุดิบขึ้น กับรายได้กลุ่มพลังงานขึ้น คือประโยคเดียวกัน'}},
        {k:'Health care', en:'Health care', th:'สุขภาพ', t:['JNJ','ABT','BDMS','BH'],
         w:{en:'Demand does not care what the economy is doing.',th:'ความต้องการไม่สนใจว่าเศรษฐกิจกำลังทำอะไร'}},
        {k:'Consumer staples', en:'Staples', th:'สินค้าจำเป็น', t:['PG','KO','CPALL','CPF'],
         w:{en:'People keep buying soap and rice in every phase.',th:'คนซื้อสบู่กับข้าวทุกช่วงวัฏจักร'}},
        {k:'Materials', en:'Materials', th:'วัสดุ', t:['SCC'],
         w:{en:'Priced in the same inflation that is squeezing everyone else.',
            th:'ราคาอิงกับเงินเฟ้อตัวเดียวกับที่กำลังบีบคนอื่น'}}
      ]},
    rec:{
      lbl:{en:'Recession',th:'ถดถอย'},
      one:{en:'Earnings are falling. What survives is what people cannot stop paying for, and balance sheets that do not need anyone\'s permission to refinance.',
           th:'กำไรกำลังหด สิ่งที่รอดคือของที่คนหยุดจ่ายไม่ได้ และงบดุลที่ไม่ต้องขออนุญาตใครเพื่อรีไฟแนนซ์'},
      groups:[
        {k:'Consumer staples', en:'Staples', th:'สินค้าจำเป็น', t:['KO','PG','CPALL','CPF'],
         w:{en:'The last spending anybody cuts.',th:'รายจ่ายกลุ่มสุดท้ายที่คนจะตัด'}},
        {k:'Utilities', en:'Utilities', th:'สาธารณูปโภค', t:['DUK','SO','RATCH','EGCO'],
         w:{en:'Regulated revenue, paid monthly, recession or not.',th:'รายได้ถูกกำกับ จ่ายทุกเดือน ไม่ว่าจะถดถอยหรือไม่'}},
        {k:'Health care', en:'Health care', th:'สุขภาพ', t:['JNJ','ABT','BDMS'],
         w:{en:'Treatment is not a discretionary purchase.',th:'การรักษาไม่ใช่ของฟุ่มเฟือย'}},
        {k:'Technology', en:'Strong balance sheets', th:'งบดุลแข็งแรง', t:['MSFT','AAPL'],
         w:{en:'Net cash means nobody can force their hand.',th:'เงินสดสุทธิแปลว่าไม่มีใครบังคับให้ต้องทำอะไรได้'}}
      ]}
  };

  /* the same six events the shortlist screen models, asked here as questions */
  var TRIGGERS = [
    {id:'infl', ic:'🔥', to:'late',
     n:{en:'Inflation goes above 4%',th:'เงินเฟ้อขึ้นเกิน 4%'},
     d:{en:'the one indicator already leaning late',th:'ตัวชี้วัดตัวเดียวที่เอียงไปทางปลายวัฏจักรอยู่แล้ว'}},
    {id:'ism', ic:'📉', to:'late',
     n:{en:'Factory orders contract twice in a row',th:'คำสั่งซื้อภาคผลิตหดสองครั้งติด'},
     d:{en:'ISM below 50 two months running',th:'ISM ต่ำกว่า 50 สองเดือนติดกัน'}},
    {id:'crd', ic:'💥', to:'rec',
     n:{en:'Credit markets seize up',th:'ตลาดหุ้นกู้ตึงตัวรุนแรง'},
     d:{en:'the gauge that leads almost every real turn',th:'มาตรวัดที่นำจุดกลับตัวจริงเกือบทุกครั้ง'}},
    {id:'cut', ic:'✂️', to:'early',
     n:{en:'Rates get cut and cash starts moving',th:'ดอกเบี้ยถูกลด เงินสดเริ่มเคลื่อน'},
     d:{en:'the reset back to the start of the loop',th:'การรีเซ็ตกลับไปต้นวงจร'}}
  ];

  var state = { snap:null };
  var sec = null;

  function snapshot(){
    if (state.snap) return state.snap;
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
    catch(e){ return null; }
  }
  function cycle(){ return window.SPZ_CYCLE || null; }
  function phase(){ var c = cycle(); return (c && c.phase) || 'mid'; }
  function regimeScore(){
    try { return window.__SPZ_REGIME && window.__SPZ_REGIME.score && window.__SPZ_REGIME.score(); }
    catch(e){ return null; }
  }
  function dirEntry(tk){
    var d = window.__SPZ_DIR;
    if (!d) return null;
    for (var k in d) {
      for (var i = 0; i < d[k].length; i++) if (d[k][i].ticker === tk) return d[k][i];
    }
    return null;
  }
  function liveStock(tk){
    var s = snapshot();
    return (s && s.stocks && s.stocks[tk]) || null;
  }
  function sectorRows(){
    var s = snapshot();
    return (s && s.flows && s.flows.sector) || [];
  }

  /* ---------------------------------------------------------------
     ① where we are
     --------------------------------------------------------------- */
  function stateHTML(){
    var c = cycle(), sc = regimeScore(), s = snapshot();
    var ph = phase();
    var lead = PHASE_LEAD[ph] || PHASE_LEAD.mid;
    var alerts = sc ? sc.alerts : null;
    var known = sc ? sc.known : 11;
    var breadth = s && s.regime && isNum(s.regime.breadth_200) ? s.regime.breadth_200 : null;

    var aCls = alerts === null ? '' : alerts >= 4 ? 'alert' : alerts >= 2 ? 'warn' : 'ok';
    var bCls = breadth === null ? '' : breadth >= 60 ? 'ok' : breadth >= 45 ? 'warn' : 'alert';

    var sim = (c && !c.isLive()) ?
      '<div class="nw-cn" style="color:var(--amber,#ffb020)">' +
        esc(tx(C.simTag).replace('{L}', tx(c.label(c.live)))) + '</div>' : '';

    return '<div class="nw-state">' +
      '<div class="nw-card lead"><div class="nw-cl">' + esc(tx(C.cyc)) + '</div>' +
        '<div class="nw-cv">' + esc(tx(lead.lbl)) + '</div>' + sim +
        '<div class="nw-cn">' + esc(tx(lead.one)) + '</div></div>' +
      '<div class="nw-card"><div class="nw-cl">' + esc(tx(C.rad)) + '</div>' +
        '<div class="nw-cv ' + aCls + '">' + (alerts === null ? '—' : alerts) +
          ' <small>' + esc(tx(C.ofN)) + '</small></div>' +
        '<div class="nw-cn">' + esc(alerts === null ? '' :
          (alerts === 0 ? (L() === 'th' ? 'ไม่มีตัวไหนอยู่ในโซนแดง' : 'nothing in the red zone')
                        : (L() === 'th' ? 'ดูรายละเอียดที่หน้าเรดาร์' : 'the radar screen has the detail'))) +
        '</div></div>' +
      '<div class="nw-card"><div class="nw-cl">' + esc(tx(C.brd)) + '</div>' +
        '<div class="nw-cv ' + bCls + '">' + (breadth === null ? '—' : Math.round(breadth) + '%') + '</div>' +
        '<div class="nw-cn">' + esc(tx(C.brdN)) + '</div></div>' +
    '</div>' +
    '<div class="nw-verdict"><div class="nw-vt">' + verdict() + '</div></div>';
  }

  function verdict(){
    var sc = regimeScore(), s = snapshot();
    var ph = phase(), th = L() === 'th';
    var lead = PHASE_LEAD[ph] || PHASE_LEAD.mid;
    var alerts = sc ? sc.alerts : 0;
    var soft = sc ? sc.soft : 0;
    var rows = sectorRows().filter(function(r){ return isNum(r.m1); });
    rows.sort(function(a, b){ return b.m1 - a.m1; });
    var best = rows[0], worst = rows[rows.length - 1];

    var p1 = th
      ? 'ข้อมูลอ่านว่าเป็น<b>' + esc(tx(lead.lbl)) + '</b>'
      : 'The data reads <b>' + esc(tx(lead.lbl).toLowerCase()) + '</b>';
    var p2 = alerts === 0
      ? (th ? 'เรดาร์ยังไม่มีตัวไหนแดง' + (soft ? ' (เหลืองอยู่ ' + soft + ' ตัว ซึ่งปกติ)' : '')
            : 'with nothing on the radar in the red' + (soft ? ' (' + soft + ' amber, which is normal)' : ''))
      : (th ? 'มีสัญญาณเตือนหนัก <b>' + alerts + '</b> ตัวติดอยู่'
            : 'with <b>' + alerts + '</b> hard warnings lit');
    var p3 = best && worst
      ? (th ? 'เดือนที่ผ่านมาเงินเข้า<b>' + esc(tx(best)) + '</b>มากที่สุด และออกจาก<b>' + esc(tx(worst)) + '</b>มากที่สุด'
            : 'Over the last month money went into <b>' + esc(tx(best)) + '</b> and left <b>' + esc(tx(worst)) + '</b>')
      : '';
    var p4 = alerts >= 3
      ? (th ? 'นี่คือจังหวะที่ควรรู้ว่าตัวเองถืออะไรอยู่และทำไม ไม่ใช่จังหวะที่ต้องรีบทำอะไร'
            : 'This is a moment to know exactly what you own and why — not a moment that demands action.')
      : (th ? 'ยังไม่มีอะไรบังคับให้ต้องทำอะไรวันนี้'
            : 'Nothing here demands anything of you today.');

    return [p1, p2].join(th ? ' ' : ', ') + (p3 ? (th ? ' · ' : '. ') + p3 : '') +
           (th ? ' — ' : '. ') + p4;
  }

  /* ---------------------------------------------------------------
     ② the flow diagram, drawn from the real sector moves
     --------------------------------------------------------------- */
  function flowHTML(){
    var rows = sectorRows().filter(function(r){ return isNum(r.m1); });
    if (rows.length < 4) return '<div class="nw-empty">' + esc(tx(C.waiting)) + '</div>';
    rows = rows.slice().sort(function(a, b){ return b.m1 - a.m1; });
    var into = rows.slice(0, 4);
    var outof = rows.slice(-4).reverse();

    var W = 1000, H = 300, mid = W / 2, gap = 58, top = 42;
    var maxAbs = 1;
    rows.forEach(function(r){ maxAbs = Math.max(maxAbs, Math.abs(r.m1)); });

    function label(r, x, y, anchor, colour){
      return '<text x="' + x + '" y="' + (y + 4) + '" fill="' + colour + '" font-size="15" ' +
        'font-family="monospace" text-anchor="' + anchor + '">' + esc(tx(r)) + '</text>' +
        '<text x="' + x + '" y="' + (y + 22) + '" fill="rgba(255,255,255,.4)" font-size="13" ' +
        'font-family="monospace" text-anchor="' + anchor + '">' + sgn(r.m1) + '%</text>';
    }

    var g = '';
    /* left column: what is being left */
    outof.forEach(function(r, i){
      var y = top + i * gap;
      g += label(r, 250, y, 'end', '#ff8a94');
      var w = 2 + Math.abs(r.m1) / maxAbs * 9;
      g += '<path d="M266 ' + y + ' C' + (mid - 90) + ' ' + y + ' ' + (mid - 60) + ' ' + (H / 2) +
        ' ' + (mid - 26) + ' ' + (H / 2) + '" fill="none" stroke="#ff3b4e" stroke-opacity=".45" ' +
        'stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"/>';
      g += '<circle r="4" fill="#ff3b4e" opacity=".9">' +
        '<animateMotion dur="' + (3.2 + i * 0.4).toFixed(1) + 's" repeatCount="indefinite" ' +
        'path="M266 ' + y + ' C' + (mid - 90) + ' ' + y + ' ' + (mid - 60) + ' ' + (H / 2) +
        ' ' + (mid - 26) + ' ' + (H / 2) + '"/></circle>';
    });
    /* right column: what is being bought */
    into.forEach(function(r, i){
      var y = top + i * gap;
      g += label(r, W - 250, y, 'start', '#7CFFB2');
      var w = 2 + Math.abs(r.m1) / maxAbs * 9;
      var d = 'M' + (mid + 26) + ' ' + (H / 2) + ' C' + (mid + 60) + ' ' + (H / 2) + ' ' +
        (mid + 90) + ' ' + y + ' ' + (W - 266) + ' ' + y;
      g += '<path d="' + d + '" fill="none" stroke="#7CFFB2" stroke-opacity=".45" ' +
        'stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"/>';
      g += '<circle r="4" fill="#7CFFB2" opacity=".9">' +
        '<animateMotion dur="' + (3.0 + i * 0.4).toFixed(1) + 's" repeatCount="indefinite" ' +
        'path="' + d + '"/></circle>';
    });

    /* the hub */
    g += '<circle cx="' + mid + '" cy="' + (H / 2) + '" r="26" fill="rgba(204,255,0,.10)" ' +
      'stroke="var(--neon,#cf0)" stroke-opacity=".5" stroke-width="1.5"/>' +
      '<text x="' + mid + '" y="' + (H / 2 + 5) + '" fill="var(--neon,#cf0)" font-size="15" ' +
      'font-family="monospace" text-anchor="middle">' + (L() === 'th' ? 'เงิน' : '$') + '</text>';

    return '<div class="nw-flow">' +
      '<div class="nw-fkey"><span><i style="background:#ff3b4e"></i>' + esc(tx(C.fOut)) + '</span>' +
      '<span><i style="background:#7CFFB2"></i>' + esc(tx(C.fIn)) + '</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img">' + g + '</svg></div>';
  }

  /* ---------------------------------------------------------------
     ③ the groups that usually lead, and what is in them
     --------------------------------------------------------------- */
  function leadHTML(){
    var lead = PHASE_LEAD[phase()] || PHASE_LEAD.mid;
    var rows = sectorRows();
    var byName = {};
    rows.forEach(function(r){ if (r.en) byName[r.en] = r; });

    return '<div class="nw-lead">' + lead.groups.map(function(g, i){
      var row = byName[g.k];
      var m1 = row && isNum(row.m1) ? row.m1 : null;
      var medal = ['①','②','③','④'][i] || '•';
      var names = g.t.map(function(tk){
        var d = dirEntry(tk), live = liveStock(tk);
        if (!d && !live) return '';
        var nm = d ? tx({ en:d.name_en, th:d.name_th }) : (live.name || tk);
        var ds = d ? tx({ en:d.desc_en, th:d.desc_th })
                   : (live.industry || '');
        return '<button type="button" class="nw-n" data-nw-tk="' + esc(tk) + '">' +
          '<span class="nw-nt">$' + esc(tk) + '</span>' +
          '<span class="nw-nd"><b>' + esc(nm) + '</b>' + esc(String(ds).slice(0, 96)) + '</span>' +
        '</button>';
      }).filter(Boolean).join('');

      return '<div class="nw-grp">' +
        '<div class="nw-gh"><span class="nw-gr">' + medal + '</span>' +
          '<span class="nw-gn">' + esc(tx(g)) + '</span>' +
          (m1 !== null ? '<span class="nw-gm ' + (m1 >= 0 ? 'up' : 'down') + '">' + sgn(m1) + '%</span>' : '') +
        '</div>' +
        '<div class="nw-gw">' + esc(tx(g.w)) +
          (m1 !== null ? ' <b style="color:' + (m1 >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') +
            '">— ' + esc(tx(m1 >= 0 ? C.agree : C.disagree)) + '</b>' : '') +
        '</div>' +
        '<div class="nw-nm">' + names + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------
     ④ what would change it — the ranking re-run under each event
     --------------------------------------------------------------- */
  function trigHTML(){
    var rank = window.__SPZ_RANK;
    if (typeof rank !== 'function') return '<div class="nw-empty">' + esc(tx(C.tWait)) + '</div>';
    var nowTop;
    try {
      nowTop = rank({ phase:phase() }).slice(0, 5).map(function(r){ return r.s.tk; });
    } catch(e){ return '<div class="nw-empty">' + esc(tx(C.tWait)) + '</div>'; }

    return '<div class="nw-trig">' + TRIGGERS.map(function(t){
      var alt;
      try { alt = rank({ phase:t.to }).slice(0, 5).map(function(r){ return r.s.tk; }); }
      catch(e){ alt = null; }
      var chips = '';
      if (alt) {
        var out = nowTop.filter(function(x){ return alt.indexOf(x) === -1; });
        var into = alt.filter(function(x){ return nowTop.indexOf(x) === -1; });
        if (!out.length && !into.length) {
          chips = '<span class="nw-td">' + esc(tx(C.tSame)) + '</span>';
        } else {
          chips = out.map(function(x){
            return '<button type="button" class="nw-chip out" data-nw-tk="' + esc(x) + '">$' + esc(x) + '</button>';
          }).join('') + into.map(function(x){
            return '<button type="button" class="nw-chip in" data-nw-tk="' + esc(x) + '">$' + esc(x) + '</button>';
          }).join('');
        }
      }
      var lbl = (PHASE_LEAD[t.to] || {}).lbl;
      return '<div class="nw-tr">' +
        '<span class="nw-ti">' + t.ic + '</span>' +
        '<span><span class="nw-tn">' + esc(tx(t.n)) + '</span>' +
          '<span class="nw-td">' + esc(tx(t.d)) +
          (lbl ? ' · ' + esc(L() === 'th' ? 'อ่านใหม่เป็น ' + tx(lbl) : 'read becomes ' + tx(lbl).toLowerCase()) : '') +
          '</span></span>' +
        '<span class="nw-tm">' + chips + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------
     ⑤ when to come back
     --------------------------------------------------------------- */
  function whenHTML(){
    var items = [
      {i:'◷', b:{en:'Once a month is enough',th:'เดือนละครั้งก็พอ'},
       t:{en:'Sector rotation plays out over quarters. Nothing on this page changes meaningfully in a day.',
          th:'การหมุนกลุ่มใช้เวลาเป็นไตรมาส ไม่มีอะไรในหน้านี้เปลี่ยนอย่างมีนัยยะภายในวันเดียว'}},
      {i:'⚠', b:{en:'Whenever the banner appears',th:'ทุกครั้งที่แบนเนอร์เตือนขึ้น'},
       t:{en:'The site puts a warning strip at the top when several gauges go red together. That is the one automatic reason to come back.',
          th:'เว็บจะขึ้นแถบเตือนด้านบนเมื่อมาตรวัดหลายตัวแดงพร้อมกัน นั่นคือเหตุผลอัตโนมัติเดียวที่ควรกลับมาดู'}},
      {i:'↻', b:{en:'When the cycle read changes',th:'เมื่อการอ่านวัฏจักรเปลี่ยน'},
       t:{en:'The phase at the top of this page is the hinge. If it moves, every group and every name below it moves with it.',
          th:'ช่วงวัฏจักรบนสุดของหน้านี้คือบานพับ ถ้ามันขยับ ทุกกลุ่มและทุกชื่อข้างล่างขยับตาม'}},
      {i:'＋', b:{en:'When you have new money to put in',th:'เมื่อมีเงินก้อนใหม่จะลง'},
       t:{en:'Which is the only time any of this has to turn into a decision.',
          th:'ซึ่งเป็นเวลาเดียวที่ทั้งหมดนี้ต้องกลายเป็นการตัดสินใจ'}}
    ];
    return '<div class="nw-when">' + items.map(function(x){
      return '<div class="nw-wc"><span class="nw-wi">' + x.i + '</span>' +
        '<span class="nw-wt"><b>' + esc(tx(x.b)) + '</b>' + esc(tx(x.t)) + '</span></div>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------
     menu digest — one line per nav item, grouped the same way the
     dropdown menu itself is grouped (Learn / Read the market /
     Workbench), so it never drifts from what a reader actually sees
     in the menu. Kept as a local copy rather than reading the
     router's own ROUTES array, matching how every other late-appended
     module in this file stays decoupled from the router's internals.
     --------------------------------------------------------------- */
  var MENU_DIGEST = [
    { g:{en:'Learn',th:'เรียนรู้'}, items:[
      {id:'guided', t:{en:'Guided Mode',th:'โหมดแนะนำ'},
       w:{en:'Not sure where to start — let this walk you through the other pages in order.',
          th:'ยังไม่รู้จะเริ่มตรงไหน ให้หน้านี้พาไล่ดูหน้าที่เหลือตามลำดับ'}},
      {id:'start', t:{en:'Start Here',th:'เริ่มต้นที่นี่'},
       w:{en:'Answer 5 questions once to find your style (value / growth / dividend / defensive) — do this before anything else.',
          th:'ตอบ 5 คำถามครั้งเดียวเพื่อหาแนวหุ้นของตัวเอง — ทำก่อนหน้าอื่นทั้งหมด'}},
      {id:'types', t:{en:'Stock Archetypes',th:'ประเภทหุ้น'},
       w:{en:'Check which of the 4 stock types a company you are eyeing actually is.',
          th:'เช็คว่าหุ้นที่กำลังมองอยู่ ตรงกับ 1 ใน 4 ประเภทหุ้นแบบไหน'}},
      {id:'glossary', t:{en:'Core Metrics',th:'คำศัพท์และเมตริกหลัก'},
       w:{en:'Look up any number you do not understand (P/E, ROE, D/E…) before you trust it.',
          th:'เปิดดูความหมายของตัวเลขที่ยังไม่เข้าใจ (P/E, ROE, D/E ฯลฯ) ก่อนจะเชื่อมัน'}},
      {id:'signals', t:{en:'Chart Signals',th:'สัญญาณกราฟ'},
       w:{en:'Check what a chart pattern actually means before acting on it — and where it fails.',
          th:'เช็คว่าสัญญาณบนกราฟที่เห็นแปลว่าอะไรจริงๆ พร้อมกรณีที่มันหลอก'}}
    ]},
    { g:{en:'Read the market',th:'อ่านตลาด'}, items:[
      {id:'now', t:{en:'What Now',th:'ตอนนี้ควรทำอะไร'},
       w:{en:'The one-screen summary — check this first, every time you sit down to look at the market. (You are here.)',
          th:'สรุปทั้งเว็บในหน้าเดียว เปิดดูหน้านี้ก่อนทุกครั้งที่จะมานั่งดูตลาด (ตอนนี้คุณอยู่หน้านี้)'}},
      {id:'outlook', t:{en:'Market Outlook',th:'ภาพรวมตลาด'},
       w:{en:'Check which of the 4 cycle phases we are in right now — most other pages read off this.',
          th:'เช็คว่าตอนนี้อยู่ช่วงไหนใน 4 ช่วงวัฏจักร — หน้าอื่นเกือบทั้งหมดอิงจากตรงนี้'}},
      {id:'regime', t:{en:'Turning Point Radar',th:'สัญญาณเปลี่ยนทิศ'},
       w:{en:'Check the 11 early-warning gauges for whether the phase above is about to turn.',
          th:'เช็ค 11 ตัวชี้วัดเตือนล่วงหน้าว่าวัฏจักรข้างบนใกล้จะพลิกหรือยัง'}},
      {id:'flow', t:{en:'Capital Flow',th:'เงินทุนไหลไปไหน'},
       w:{en:'Check which sectors money is rotating into right now, given the phase.',
          th:'เช็คว่าตอนนี้เงินกำลังหมุนเข้ากลุ่มอุตสาหกรรมไหน ตามช่วงวัฏจักรตอนนี้'}},
      {id:'globe', t:{en:'Global Money Map',th:'แผนที่เงินทุนโลก'},
       w:{en:'Check which country’s money is buying which market — useful if you trade across borders.',
          th:'เช็คว่าเงินของประเทศไหนกำลังซื้อตลาดไหน มีประโยชน์ถ้าเทรดข้ามประเทศ'}},
      {id:'infl', t:{en:'Inflation & Currency',th:'เงินเฟ้อและค่าเงิน'},
       w:{en:'Check inflation and rates for whatever currency your money is actually in.',
          th:'เช็คเงินเฟ้อและดอกเบี้ยของสกุลเงินที่เงินคุณอยู่จริงๆ'}},
      {id:'desk', t:{en:'What To Buy Now',th:'ควรลงหุ้นอะไรดี'},
       w:{en:'The ranked list — check this after the pages above, not instead of them.',
          th:'อันดับหุ้นที่จัดไว้ให้ — เช็คหน้านี้หลังจากดูหน้าข้างบนแล้ว ไม่ใช่แทนกัน'}},
      {id:'scenarios', t:{en:'Market Shock Simulator',th:'จำลองแรงกระแทกตลาด'},
       w:{en:'Check how a pick would hold up if rates, oil or sentiment suddenly moved against it.',
          th:'เช็คว่าหุ้นที่เล็งไว้จะเป็นยังไงถ้าดอกเบี้ย น้ำมัน หรือความเชื่อมั่นพลิกกลับกะทันหัน'}}
    ]},
    { g:{en:'Workbench',th:'เครื่องมือ'}, items:[
      {id:'stock', t:{en:'One Stock, One Page',th:'ดูหุ้นรายตัว'},
       w:{en:'Check one company’s full picture — price, every metric next to its peers — before buying it.',
          th:'เช็คภาพรวมของบริษัทเดียวแบบเต็มๆ ราคาและตัวเลขเทียบกับคู่แข่ง ก่อนจะซื้อจริง'}},
      {id:'chartlab', t:{en:'Chart Lab',th:'ห้องทดลองกราฟ'},
       w:{en:'Check the actual price chart yourself — candlestick, MA, RSI — before trusting anyone’s summary of it.',
          th:'เปิดดูกราฟราคาจริงด้วยตัวเอง — แท่งเทียน MA RSI — ก่อนจะเชื่อสรุปของใคร'}},
      {id:'directory', t:{en:'Stock Directory & Compare',th:'หุ้นตัวอย่างและเปรียบเทียบ'},
       w:{en:'Check a company’s raw numbers side by side against others in the same style.',
          th:'เช็คตัวเลขดิบของบริษัทเทียบข้างกับหุ้นแนวเดียวกันตัวอื่นๆ'}},
      {id:'pro', t:{en:'Institutional Pro Desk',th:'โปรเดสก์ระดับสถาบัน'},
       w:{en:'Advanced institutional tools — skip this until the pages above feel comfortable.',
          th:'เครื่องมือขั้นสูงระดับสถาบัน — ยังไม่ต้องแตะจนกว่าจะคุ้นกับหน้าข้างบนแล้ว'}},
      {id:'proof', t:{en:'Proof Lab',th:'ทดสอบเรดาร์'},
       w:{en:'Check whether the Radar’s gauges actually worked historically, before trusting them.',
          th:'เช็คว่ามาตรวัดในหน้าสัญญาณเปลี่ยนทิศเคยแม่นจริงในอดีตไหม ก่อนจะเชื่อมัน'}}
    ]}
  ];

  function menuHTML(){
    return '<div class="nw-menu">' + MENU_DIGEST.map(function(grp){
      return '<div class="nw-mg-h">' + esc(tx(grp.g)) + '</div>' +
        '<div class="nw-mg-grid">' + grp.items.map(function(it){
          if(!document.getElementById(it.id)) return '';
          return '<a class="nw-mi" href="#/' + it.id + '">' +
            '<span class="nw-mi-t">' + esc(tx(it.t)) + '</span>' +
            '<span class="nw-mi-w">' + esc(tx(it.w)) + '</span></a>';
        }).join('') + '</div>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------
     render
     --------------------------------------------------------------- */
  function sect(n, title, lede, body){
    return '<div class="nw-sec"><h3 class="nw-h"><em>' + esc(tx(n)) + '</em>' + esc(tx(title)) + '</h3>' +
      '<p class="nw-l">' + esc(tx(lede)) + '</p>' + body + '</div>';
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-nw="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(C.eyebrow);
    if (q('h')) q('h').textContent = tx(C.h);
    if (q('lede')) q('lede').textContent = tx(C.lede);
    var body = q('body');
    if (!body) return;

    if (!snapshot()) {
      body.innerHTML = '<div class="nw-empty">' + esc(tx(C.waiting)) + '</div>';
      return;
    }

    var changed = '';
    try {
      if (window.__SPZ_WATCH && window.__SPZ_WATCH.panelHTML) changed = window.__SPZ_WATCH.panelHTML();
    } catch(e){ changed = ''; }

    var checklist = '<div class="nw-check"><div class="nw-check-h">' + esc(tx(C.checkH)) + '</div>' +
      [[C.n1, C.s1], [C.n2, C.s2], [C.n3, C.s3], [C.n4, C.s4], [C.n5, C.s5]].map(function(p){
        return '<div class="nw-check-r"><span class="nw-check-n">' + esc(tx(p[0])) + '</span>' +
               '<span class="nw-check-t">' + esc(tx(p[1])) + '</span></div>';
      }).join('') + '</div>';

    var menuDigest = '<div class="nw-sec nw-menu-sec"><h3 class="nw-h">' + esc(tx(C.menuH)) + '</h3>' +
      '<p class="nw-l">' + esc(tx(C.menuL)) + '</p>' + menuHTML() + '</div>';

    body.innerHTML = checklist + menuDigest + changed +
      sect(C.n1, C.s1, C.s1l, stateHTML()) +
      sect(C.n2, C.s2, C.s2l, flowHTML()) +
      sect(C.n3, C.s3, C.s3l, leadHTML()) +
      sect(C.n4, C.s4, C.s4l, trigHTML()) +
      sect(C.n5, C.s5, C.s5l, whenHTML()) +
      '<div class="nw-note">' + tx(C.note).replace('{a}',
        '<a data-nw="goradar">' + esc(tx(C.noteA)) + '</a>') + '</div>';

    body.querySelectorAll('[data-nw-tk]').forEach(function(b){
      b.addEventListener('click', function(){
        var tk = b.getAttribute('data-nw-tk');
        if (window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(tk);
      });
    });
    var go = body.querySelector('[data-nw="goradar"]');
    if (go) go.addEventListener('click', function(){
      var link = document.querySelector('[data-route-to="regime"]');
      if (link) link.click();
    });
  }

  function build(){
    if (document.getElementById('now')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'now';
    sec.setAttribute('data-route', 'now');
    sec.innerHTML =
      '<div class="nw-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-nw="eb"></span></div>' +
          '<h2 data-nw="h"></h2>' +
          '<p class="lede" data-nw="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-nw="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'now', after:null, feat:true,
      t:{en:'What Now — Start Here',th:'ตอนนี้ควรทำอะไร'},
      d:{en:'The whole site in one screen, in the order the question is actually asked: where the cycle is, where money moved, which groups lead from here and which companies sit in them, what would change it, and when to look again.',
         th:'ทั้งเว็บรวมในหน้าเดียว เรียงตามลำดับที่คนถามจริงๆ — วัฏจักรอยู่ตรงไหน เงินไหลไปทางไหน จากจุดนี้กลุ่มไหนนำและมีบริษัทอะไรอยู่ในนั้น อะไรจะทำให้เปลี่ยน และควรกลับมาดูอีกทีเมื่อไหร่'}
    });

    sec.__render = paint;
    paint();

    if (/^#\/now\b/.test(location.hash || '')) {
      var link = document.querySelector('[data-route-to="now"]');
      if (link) link.click();
    }
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 350);

    document.addEventListener('spz:snapshot', function(e){ state.snap = e.detail; paint(); });
    var seed = setInterval(function(){
      var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
      if (s) { state.snap = s; paint(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    /* the cycle phase is a site-wide control; this page is downstream of it */
    document.addEventListener('spz:cycle', function(){ setTimeout(paint, 40); });
    document.addEventListener('spz:seen', function(){ setTimeout(paint, 40); });
    new MutationObserver(paint).observe(document.documentElement,
      { attributes:true, attributeFilter:['lang'] });
    /* the ranking engine and the radar arrive on their own schedule */
    setTimeout(paint, 4000);
    setTimeout(paint, 9000);
  }

  window.__SPZ_NOW = { paint:paint, phases:PHASE_LEAD, triggers:TRIGGERS,
                       verdict:verdict, state:state };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1300); });
  } else {
    setTimeout(boot, 1300);
  }
})();
