
(function(){
  'use strict';
  if (window.__SPZ_COCKPIT) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }

  var T = {
    eyebrow:{en:'COMMAND CENTER',th:'ศูนย์บัญชาการ'},
    h:{en:'Everything, On One Screen',th:'ทุกอย่างในหน้าเดียว'},
    lede:{en:'Every gauge, scan and ranking this site already computes, gathered onto one wide screen instead of ten separate pages. Nothing here is new data or new analysis — each card just reads the same numbers the screen it names already shows, so this is a place to scan fast, not a replacement for opening the real page when something needs a closer look.',
      th:'ตัวชี้วัด การสแกน และการจัดอันดับทุกอย่างที่เว็บนี้คำนวณไว้อยู่แล้ว รวบมาไว้ในหน้ากว้างหน้าเดียวแทนที่จะต้องเปิดสิบหน้าแยกกัน ทุกอย่างในนี้ไม่ใช่ข้อมูลใหม่หรือการวิเคราะห์ใหม่ — แต่ละการ์ดแค่อ่านตัวเลขชุดเดียวกับหน้าที่มันอ้างถึงอยู่แล้ว ให้ใช้เพื่อกวาดตาดูเร็วๆ ไม่ใช่ตัวแทนการเปิดหน้าจริงตอนอยากดูละเอียด'},
    asof:{en:'Data as of',th:'ข้อมูล ณ'},
    cycleFmt:{en:'{p} · {n}/{of} gauges agree · {d}d old',th:'{p} · {n}/{of} ตัวชี้วัดเห็นตรงกัน · ข้อมูลอายุ {d} วัน'},
    waiting:{en:'Waiting for the first data sync…',th:'กำลังรอข้อมูลรอบแรก…'},
    pulseCalm:{en:'CALM',th:'ปกติ'}, pulseWatch:{en:'WATCHFUL',th:'เฝ้าระวัง'}, pulseAlert:{en:'ALERT',th:'แจ้งเตือน'},

    signalQuiet:{en:'Nothing unusual is standing out across the gauges, the anomaly scan or your last visit — a quiet reading right now.',
      th:'ไม่มีอะไรผิดปกติเด่นชัดทั้งในตัวชี้วัด สแกนสัญญาณผิดปกติ หรือตั้งแต่ครั้งก่อนที่เปิดดู — ตอนนี้ค่อนข้างเงียบ'},

    marketL:{en:'MARKET STATUS',th:'สถานะตลาด'},
    setOpen:{en:'SET open',th:'ตลาดไทยเปิด'}, setClosed:{en:'SET closed',th:'ตลาดไทยปิด'},
    usOpen:{en:'US open',th:'ตลาดสหรัฐฯ เปิด'}, usClosed:{en:'US closed',th:'ตลาดสหรัฐฯ ปิด'},
    gainH:{en:'Up most',th:'ขึ้นมากที่สุด'}, loseH:{en:'Down most',th:'ลงมากที่สุด'},
    noMovers:{en:'No change data available yet.',th:'ยังไม่มีข้อมูลการเปลี่ยนแปลง'},
    goNow:{en:'Open What Now →',th:'เปิดหน้าตอนนี้เกิดอะไรขึ้น →'},

    gaugesL:{en:'EARLY-WARNING GAUGES',th:'ตัวชี้วัดเตือนล่วงหน้า'},
    gaugesNA:{en:'Turning Point Radar hasn’t loaded yet.',th:'สัญญาณเปลี่ยนทิศยังไม่โหลด'},
    naReason:{en:'No data for this reading yet.',th:'ยังไม่มีข้อมูลสำหรับตัวนี้'},
    goRegime:{en:'Open Turning Point Radar →',th:'เปิดหน้าสัญญาณเปลี่ยนทิศ →'},

    anomL:{en:'ANOMALY SCAN',th:'สแกนสัญญาณผิดปกติ'},
    anomTxt:{en:'<b class="warn" style="color:var(--amber,#ffb020);">{n}</b> tickers currently flagged with a pattern break.',
      th:'ตอนนี้มี <b class="warn" style="color:var(--amber,#ffb020);">{n}</b> ตัวที่ถูกชี้ว่ามีรูปแบบผิดไปจากเดิม'},
    anomZero:{en:'Nothing flagged right now.',th:'ตอนนี้ยังไม่พบอะไร'},
    anomNA:{en:'Anomaly Scan hasn’t loaded yet.',th:'สแกนสัญญาณผิดปกติยังไม่โหลด'},
    goAnom:{en:'Open Anomaly Scan →',th:'เปิดหน้าสแกนสัญญาณผิดปกติ →'},

    correlL:{en:'CORRELATION SNAPSHOT',th:'สรุปความสัมพันธ์สินทรัพย์'},
    correlTxt:{en:'Average pairwise correlation is <b>{v}</b> across {n} tracked assets. Most tied together: <b>{a}</b> × <b>{b}</b> ({abv}). Most opposite: <b>{c}</b> × <b>{d}</b> ({cdv}).',
      th:'สหสัมพันธ์เฉลี่ยระหว่างคู่สินทรัพย์อยู่ที่ <b>{v}</b> จากสินทรัพย์ที่ติดตาม {n} ตัว ผูกกันแน่นที่สุด: <b>{a}</b> × <b>{b}</b> ({abv}) สวนทางกันที่สุด: <b>{c}</b> × <b>{d}</b> ({cdv})'},
    correlNA:{en:'Correlation Map hasn’t loaded yet.',th:'แผนที่ความสัมพันธ์สินทรัพย์ยังไม่โหลด'},
    goCorrel:{en:'Open Correlation Map →',th:'เปิดหน้าแผนที่ความสัมพันธ์สินทรัพย์ →'},

    watchL:{en:'SINCE YOU LAST LOOKED',th:'ตั้งแต่ครั้งก่อนที่เปิดดู'},
    watchTxt:{en:'{n} notable change(s): <b>{t}</b>',th:'มีการเปลี่ยนแปลงที่น่าสนใจ {n} รายการ: <b>{t}</b>'},
    watchNone:{en:'Nothing has changed enough to flag since your last visit.',th:'ยังไม่มีอะไรเปลี่ยนมากพอจะแจ้งตั้งแต่ครั้งก่อน'},
    goWatch:{en:'Open What Now →',th:'เปิดหน้าตอนนี้เกิดอะไรขึ้น →'},

    macroL:{en:'MACRO & RATES',th:'มหภาคและอัตราดอกเบี้ย'},
    macroNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},
    macroCurve:{en:'Yield curve (10y − 3m)',th:'เส้นผลตอบแทน (10 ปี − 3 เดือน)'},
    goRegime2:{en:'Open Turning Point Radar →',th:'เปิดหน้าสัญญาณเปลี่ยนทิศ →'},

    fxL:{en:'CURRENCY BOARD',th:'กระดานค่าเงิน'},
    fxVsUsd:{en:'vs USD',th:'เทียบดอลลาร์'}, fxRate:{en:'RATE',th:'อัตรา'},
    fx1d:{en:'1D',th:'1 วัน'}, fx1m:{en:'1M',th:'1 เดือน'},
    fxNA:{en:'Live currency data hasn’t loaded yet.',th:'ข้อมูลค่าเงินสดยังไม่โหลด'},
    goInfl:{en:'Open Currency Board →',th:'เปิดหน้ากระดานค่าเงิน →'},

    flowL:{en:'CAPITAL FLOW — SECTORS',th:'เงินทุนไหล — กลุ่มอุตสาหกรรม'},
    flowNA:{en:'The flow scanner hasn’t loaded yet.',th:'สแกนกระแสเงินยังไม่โหลด'},
    goFlow:{en:'Open Capital Flow →',th:'เปิดหน้าเงินทุนไหล →'},

    globeL:{en:'WORLD MONEY MAP',th:'แผนที่เงินโลก'},
    globeNA:{en:'The world money scan hasn’t loaded yet.',th:'สแกนเงินโลกยังไม่โหลด'},
    goGlobe:{en:'Open World Money Map →',th:'เปิดหน้าแผนที่เงินโลก →'},

    inflL:{en:'INFLATION & POLICY RATES',th:'เงินเฟ้อและดอกเบี้ยนโยบาย'},
    inflPolicy:{en:'Policy',th:'นโยบาย'}, inflReal:{en:'Real',th:'แท้จริง'},
    inflNA:{en:'The inflation & currency desk hasn’t loaded yet.',th:'โต๊ะเงินเฟ้อและค่าเงินยังไม่โหลด'},
    inflNote:{en:'Hand-compiled dated snapshot (central bank releases, national statistics offices) — not live, updates monthly at most. See the full table for exact dates.',
      th:'รวบรวมด้วยมือเป็นภาพนิ่งตามวันที่ระบุ (จากประกาศธนาคารกลางและสำนักงานสถิติแห่งชาติ) ไม่ใช่ข้อมูลสด อัปเดตอย่างเร็วที่สุดเดือนละครั้ง ดูวันที่แน่นอนได้ที่ตารางเต็ม'},

    corrHeatL:{en:'CORRELATION HEAT MAP',th:'ฮีตแมพความสัมพันธ์สินทรัพย์'},
    corrHeatNote:{en:'Same pairwise correlations as the summary above — green means moves together, red means moves opposite. Hover a cell for the exact number.',
      th:'สหสัมพันธ์คู่เดียวกับสรุปด้านบน — เขียวคือเคลื่อนไหวไปด้วยกัน แดงคือสวนทางกัน วางเมาส์ที่ช่องเพื่อดูตัวเลขแน่นอน'},
    corrHeatNA:{en:'The correlation map hasn’t loaded yet.',th:'แผนที่ความสัมพันธ์สินทรัพย์ยังไม่โหลด'},

    stockHeatL:{en:'STOCK HEAT MAP',th:'ฮีตแมพหุ้นทั้งหมด'},
    stockHeatNote:{en:'Every tracked stock, grouped by sector, coloured by today’s % move — green up, red down.',
      th:'หุ้นที่ติดตามทั้งหมด จัดกลุ่มตามอุตสาหกรรม สีตามเปอร์เซ็นต์เปลี่ยนแปลงวันนี้ — เขียวขึ้น แดงลง'},
    stockHeatNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},
    goDirectory:{en:'Open Stock Directory →',th:'เปิดหน้าไดเรกทอรีหุ้น →'},

    creditL:{en:'CREDIT MARKET',th:'ตลาดหุ้นกู้'},
    creditSpread:{en:'HYG vs LQD (1 month)',th:'HYG เทียบ LQD (1 เดือน)'},
    creditRiskH:{en:'Highest estimated credit risk',th:'ความเสี่ยงเครดิตประเมินสูงสุด'},
    creditNone:{en:'No tracked stock currently scores in the higher risk bands.',
      th:'ตอนนี้ยังไม่มีหุ้นที่ติดตามอยู่ในระดับความเสี่ยงสูง'},
    creditNote:{en:'The HYG–LQD spread is real market pricing. Per-stock risk is a reference estimate from leverage and profitability, not a traded price — see the full page for the method.',
      th:'ส่วนต่าง HYG–LQD เป็นราคาตลาดจริง ส่วนความเสี่ยงรายตัวเป็นค่าประมาณอ้างอิงจากหนี้สินและความสามารถทำกำไร ไม่ใช่ราคาซื้อขายจริง — ดูวิธีคิดเต็มได้ที่หน้าเต็ม'},
    creditNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},
    goStockCredit:{en:'Open Stocks →',th:'เปิดหน้าหุ้นตัวอย่าง →'},

    bubbleL:{en:'VALUATION EXTREMES',th:'ระดับราคาตลาดสุดโต่ง'},
    bubbleNote:{en:'Shiller CAPE, the Buffett Indicator and margin-debt growth — the same three the Bubble Radar tracks daily. High readings have preceded past bubbles, not a timing signal on their own.',
      th:'Shiller CAPE, Buffett Indicator และการเติบโตของหนี้มาร์จิ้น — สามตัวเดียวกับที่ Bubble Radar ติดตามทุกวัน ค่าที่สูงเคยเกิดขึ้นก่อนฟองสบู่ในอดีต แต่ไม่ใช่สัญญาณจับจังหวะซื้อขาย'},
    bubbleNA:{en:'Bubble Radar hasn’t loaded yet.',th:'Bubble Radar ยังไม่โหลด'},
    goBubble:{en:'Open Bubble Radar →',th:'เปิดหน้า Bubble Radar →'},

    wtL:{en:'MY WATCHLIST',th:'วอทช์ลิสต์ของฉัน'},
    wtNone:{en:'Not connected to a personal watchlist on this browser yet — connect Telegram on the Watchlist page and live prices for your pinned stocks will show here too.',
      th:'เบราว์เซอร์นี้ยังไม่ได้เชื่อมวอทช์ลิสต์ส่วนตัว — ไปเชื่อมต่อ Telegram ที่หน้าวอทช์ลิสต์ก่อน แล้วราคาสดของหุ้นที่ปักหมุดจะขึ้นที่นี่ด้วย'},
    goWl:{en:'Open My Watchlist →',th:'เปิดหน้าวอทช์ลิสต์ของฉัน →'},

    chartsL:{en:'PRICE CHARTS',th:'กราฟราคา'},
    chartsNA:{en:'Price history hasn’t loaded yet.',th:'ประวัติราคายังไม่โหลด'},
    chartsNote:{en:'Actual daily closing prices for each symbol, most recent ~90 trading days — the same history each stock card and chart tool on this site draws from.',
      th:'ราคาปิดรายวันจริงของแต่ละสัญลักษณ์ ย้อนหลังประมาณ 90 วันทำการล่าสุด — ประวัติชุดเดียวกับที่การ์ดหุ้นและเครื่องมือกราฟในเว็บนี้ใช้'},
    goStock:{en:'Open Chart Lab →',th:'เปิดหน้าห้องทดลองกราฟ →'},

    rankL:{en:'WORTH A LOOK RIGHT NOW',th:'น่าดูตอนนี้'},
    rankNote:{en:'The same ranking engine as What To Buy Now, run with its default settings — a starting point for your own research, not a recommendation to buy anything.',
      th:'ใช้เครื่องมือจัดอันดับตัวเดียวกับหน้า "ตอนนี้ควรซื้ออะไร" ด้วยค่าเริ่มต้นของมัน — เป็นจุดเริ่มไปค้นคว้าต่อเอง ไม่ใช่คำแนะนำให้ซื้อ'},
    rankNA:{en:'The ranking engine hasn’t loaded yet.',th:'เครื่องมือจัดอันดับยังไม่โหลด'},
    goDesk:{en:'Open What To Buy Now →',th:'เปิดหน้าตอนนี้ควรซื้ออะไร →'},

    proL:{en:'INSTITUTIONAL PRO DESK',th:'โปรเดสก์ระดับสถาบัน'},
    proTxt:{en:'GEX, dark pool prints, order-book heatmap, Monte Carlo, execution algos, and the rest of the pro-tier toolkit — moved here from the top menu so it stays out of the way for everyone else.',
      th:'GEX, ธุรกรรม Dark Pool, ฮีทแมพออเดอร์บุ๊ก, Monte Carlo, อัลกอริทึมการส่งคำสั่ง และเครื่องมือระดับโปรที่เหลือ — ย้ายมาไว้ตรงนี้จากเมนูบนสุด เพื่อไม่ให้รกหน้าเว็บสำหรับคนอื่น'},
    goPro:{en:'Open Institutional Pro Desk →',th:'เปิดโปรเดสก์ระดับสถาบัน →'},

    priceChartL:{en:'REAL PRICE CHART',th:'กราฟราคาจริง'},
    priceChartNote:{en:'Real daily closes from the same snapshot the rest of the terminal uses — not the practice data in Chart Lab. While price holds above the slower moving average, the long-term trend is still up.',
      th:'ราคาปิดรายวันจริงจากชุดข้อมูลเดียวกับที่ทั้งเว็บใช้ ไม่ใช่ข้อมูลฝึกหัดในห้องทดลองกราฟ ตราบใดที่ราคายังอยู่เหนือเส้นค่าเฉลี่ยเส้นช้า เทรนด์ระยะยาวยังถือว่าขึ้นอยู่'},
    priceChartNA:{en:'No real price history available yet — live market data hasn’t loaded, or this symbol has none.',
      th:'ยังไม่มีราคาย้อนหลังจริงให้แสดง — ข้อมูลตลาดสดยังไม่โหลด หรือสัญลักษณ์นี้ยังไม่มีประวัติ'},
    pcR63:{en:'3 months',th:'3 เดือน'}, pcR252:{en:'1 year',th:'1 ปี'}, pcR504:{en:'2 years',th:'2 ปี'},
    pcLegP:{en:'price',th:'ราคา'}, pcLeg50:{en:'50-day average',th:'เฉลี่ย 50 วัน'},
    pcLeg200:{en:'200-day average',th:'เฉลี่ย 200 วัน'}, pcLegHi:{en:'52-week high / low',th:'สูง/ต่ำสุดรอบปี'},
    pcRsiLab:{en:'RSI — buying pressure',th:'RSI — แรงซื้อ'},
    goStockDetail:{en:'Open This Stock →',th:'เปิดหน้าดูหุ้นรายตัว →'},

    breadthL:{en:'MARKET BREADTH',th:'ความกว้างตลาด'},
    breadthAbove50:{en:'Above 50-day average',th:'ยืนเหนือเฉลี่ย 50 วัน'},
    breadthAbove200:{en:'Above 200-day average',th:'ยืนเหนือเฉลี่ย 200 วัน'},
    breadthNote:{en:'Share of tracked stocks trading above their own moving average — a rally most stocks are part of reads differently from one carried by a handful of giants.',
      th:'สัดส่วนหุ้นที่ติดตามซึ่งราคายืนเหนือเส้นค่าเฉลี่ยของตัวเอง — ตลาดขึ้นแบบหุ้นส่วนใหญ่มีส่วนร่วม กับขึ้นเพราะหุ้นไม่กี่ตัวลากอยู่ ความหมายไม่เหมือนกัน'},
    breadthNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},

    crossL:{en:'GOLDEN CROSS / DEATH CROSS',th:'โกลเด้นครอส / เดธครอส'},
    crossGolden:{en:'Golden cross',th:'โกลเด้นครอส'}, crossDeath:{en:'Death cross',th:'เดธครอส'},
    crossVs:{en:'{v}% vs 200-day',th:'{v}% เทียบเฉลี่ย 200 วัน'},
    crossNote:{en:'The 50-day average has just crossed the 200-day one — a classic, widely-watched long-term trend-change signal, often a lagging one.',
      th:'เส้นค่าเฉลี่ย 50 วันเพิ่งตัดผ่านเส้น 200 วัน — สัญญาณคลาสสิกที่คนดูกันมากว่าเทรนด์ระยะยาวกำลังเปลี่ยน แต่มักมาช้ากว่าราคาจริง'},
    crossNone:{en:'No tracked stock has crossed its 200-day average recently.',th:'ยังไม่มีหุ้นที่ติดตามตัดเส้นเฉลี่ย 200 วันเมื่อเร็วๆ นี้'},
    crossNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},

    rotL:{en:'ROTATION & LEADERSHIP',th:'เงินไหลไปทางไหน'},
    rotCycDef:{en:'Cyclicals vs defensives',th:'หุ้นวัฏจักร vs หุ้นตั้งรับ'},
    rotSmall:{en:'Small caps vs market',th:'หุ้นเล็ก vs ตลาดรวม'},
    rotSemis:{en:'Semiconductors vs market',th:'เซมิคอนดักเตอร์ vs ตลาดรวม'},
    rotGold:{en:'Gold',th:'ทองคำ'},
    rotDollar:{en:'US dollar',th:'ดอลลาร์สหรัฐฯ'},
    rotEm:{en:'Emerging vs US (3M)',th:'ตลาดเกิดใหม่ vs สหรัฐฯ (3 เดือน)'},
    rotComm:{en:'Commodities',th:'สินค้าโภคภัณฑ์'},
    rotBonds:{en:'Stocks vs bonds',th:'หุ้น vs พันธบัตร'},
    rotNote:{en:'Each pair is one side\'s return minus the other\'s over the past month, unless noted — which side money has favored, not a forecast of which side wins next.',
      th:'แต่ละคู่คือผลตอบแทนฝั่งหนึ่งลบอีกฝั่งในเดือนที่ผ่านมา (ยกเว้นระบุไว้เป็นอย่างอื่น) — บอกว่าเงินเอียงไปทางไหนแล้ว ไม่ใช่การทำนายว่าฝั่งไหนจะชนะต่อ'},
    rotNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},

    cffL:{en:'Capital Flow Forecast',th:'คาดการณ์การไหลของเงินทุน'},
    cffNA:{en:'Live market data hasn’t loaded yet.',th:'ข้อมูลตลาดสดยังไม่โหลด'},
    cffTf1:{en:'1 Month',th:'1 เดือน'},cffTf3:{en:'3 Months',th:'3 เดือน'},
    cffIn:{en:'Money is currently favoring',th:'ตอนนี้เงินกำลังเลือกเข้ากลุ่ม'},
    cffOut:{en:'and leaving',th:'และกำลังไหลออกจากกลุ่ม'},
    cffPlaysH:{en:'Active rotation signals',th:'สัญญาณการหมุนกลุ่มที่กำลังทำงานอยู่'},
    cffNoPlays:{en:'No rotation signal is currently triggered — conditions look broadly neutral right now.',
      th:'ตอนนี้ไม่มีสัญญาณการหมุนกลุ่มใดถูกกระตุ้น สภาวะตลาดดูเป็นกลางโดยรวม'},
    cffOutOf:{en:'OUT OF',th:'เงินออกจาก'},cffInto:{en:'INTO',th:'เงินเข้า'},
    cffMacroH:{en:'Macro backdrop',th:'ภาพรวมเศรษฐกิจมหภาค'},
    cffVix:{en:'VIX',th:'VIX'},
    cffCurve:{en:'10Y–3M curve',th:'เส้นผลตอบแทน 10ปี–3ด.'},
    cffCurveInv:{en:'inverted',th:'กลับหัว'},cffCurveNorm:{en:'normal',th:'ปกติ'},
    cffDollar:{en:'Dollar (3M)',th:'ดอลลาร์ (3 เดือน)'},
    cffCredit:{en:'Credit spread (1M)',th:'สเปรดเครดิต (1 เดือน)'},
    cffFundH:{en:'Names to watch — leading vs. lagging sector',th:'หุ้นที่น่าจับตา — กลุ่มนำ vs กลุ่มตาม'},
    cffFundLead:{en:'Leading',th:'กลุ่มนำ'},cffFundLag:{en:'Lagging',th:'กลุ่มตาม'},
    cffFundNone:{en:'No tracked names in this sector yet.',th:'ยังไม่มีหุ้นที่ติดตามอยู่ในกลุ่มนี้'},
    cffNote:{en:'A rules-based read of numbers this dashboard already computes — the same 12 sector ETFs as Capital Flow, the same regime gauges and rotation triggers as the Early-Warning system, and each stock\'s own already-tracked P/E, ROE, margin and dividend yield (EPS shown is price ÷ P/E). Refreshes on the same live cadence as the rest of this page, not tick-by-tick. Not a prediction, not investment advice.',
      th:'เป็นการอ่านตัวเลขที่แดชบอร์ดนี้คำนวณไว้อยู่แล้วตามกฎ — ETF ทั้ง 12 กลุ่มชุดเดียวกับหน้าเงินทุนไหล ตัวชี้วัดและสัญญาณหมุนกลุ่มชุดเดียวกับระบบเตือนล่วงหน้า และค่า P/E, ROE, มาร์จิ้น และอัตราปันผลของแต่ละหุ้นที่ติดตามอยู่แล้ว (EPS ที่แสดงคือราคา ÷ P/E) รีเฟรชตามจังหวะเดียวกับหน้านี้ทั้งหมด ไม่ใช่ข้อมูลเรียลไทม์ระดับวินาที ไม่ใช่การพยากรณ์ ไม่ใช่คำแนะนำการลงทุน'},

    foot:{en:'This screen fetches nothing new and computes nothing new — every figure is read from the exact module named on its card, live, each time that module refreshes. Treat it as a fast overview, and open the named screen for the full picture, the caveats, and the methodology behind any single number. Educational use only, not investment advice.',
      th:'หน้านี้ไม่ได้ดึงข้อมูลใหม่หรือคำนวณอะไรใหม่ — ทุกตัวเลขอ่านมาจากโมดูลที่ระบุไว้ในการ์ดนั้นๆ แบบสด ทุกครั้งที่โมดูลนั้นรีเฟรช ให้ใช้หน้านี้เพื่อกวาดภาพรวมเร็วๆ แล้วไปเปิดหน้าจริงเพื่อดูรายละเอียด ข้อควรระวัง และวิธีคิดเบื้องหลังตัวเลขแต่ละตัว ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน'}
  };

  var sec = null;
  var pulse = { raf:null, canvas:null, ctx:null, level:'calm', t:0 };
  var CFF = { tf:'m1' };
  /* flows.sector .en labels -> stocks[].sector strings (same GICS sectors,
     different label spelling between the two already-existing screens).
     "Semiconductors" has no stocks[].sector of its own -- those names sit
     under Technology with industry:"Semiconductors", so it matches on
     industry instead. */
  var FLOW_SECTOR_STOCK_SECTOR = {
    'Technology':'Technology', 'Financials':'Financial Services', 'Energy':'Energy',
    'Health care':'Healthcare', 'Consumer cyclical':'Consumer Cyclical',
    'Consumer staples':'Consumer Defensive', 'Industrials':'Industrials',
    'Utilities':'Utilities', 'Real estate':'Real Estate',
    'Communication':'Communication Services'
  };
  var FLOW_SECTOR_INDUSTRY = { 'Semiconductors':'Semiconductors' };

  function snapshot(){
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
    catch(e){ return null; }
  }
  function marketStatus(){
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.marketStatus && window.__SPZ_LIVE.marketStatus()) || null; }
    catch(e){ return null; }
  }
  function regimeScore(){
    try { return window.__SPZ_REGIME && window.__SPZ_REGIME.score && window.__SPZ_REGIME.score(); }
    catch(e){ return null; }
  }
  function regimeAlert(){
    try { return window.__SPZ_REGIME && window.__SPZ_REGIME.alert && window.__SPZ_REGIME.alert(); }
    catch(e){ return null; }
  }
  function regimeGauges(){
    try { return (window.__SPZ_REGIME && window.__SPZ_REGIME.gauges) || null; }
    catch(e){ return null; }
  }
  function anomalyRows(){
    try { return (window.__SPZ_ANOMALY && window.__SPZ_ANOMALY.rows && window.__SPZ_ANOMALY.rows()) || null; }
    catch(e){ return null; }
  }
  function correlSummary(){
    try { return (window.__SPZ_CORREL && window.__SPZ_CORREL.summary && window.__SPZ_CORREL.summary()) || null; }
    catch(e){ return null; }
  }
  function watchHeadline(){
    try { return (window.__SPZ_WATCH && window.__SPZ_WATCH.headline && window.__SPZ_WATCH.headline()) || null; }
    catch(e){ return null; }
  }
  function rankTop(n){
    try {
      var r = window.__SPZ_RANK && window.__SPZ_RANK({});
      return r ? r.slice(0, n) : null;
    } catch(e){ return null; }
  }
  function rankWhy(r){
    try { return (window.__SPZ_WHY && window.__SPZ_WHY(r)) || []; }
    catch(e){ return []; }
  }
  function inflCountries(){
    try { return (window.__SPZ_INFL && window.__SPZ_INFL.countries) || null; }
    catch(e){ return null; }
  }

  function chgSpan(v, d){
    if (!isNum(v)) return '<span style="color:var(--grey-dim)">—</span>';
    return '<span style="color:' + (v >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
      sgn(v, d === undefined ? 2 : d) + '%</span>';
  }
  function fmtRate(v){
    if (!isNum(v)) return '—';
    var d = v >= 500 ? 0 : v >= 20 ? 2 : 4;
    return v.toLocaleString('en-US', { minimumFractionDigits:d, maximumFractionDigits:d });
  }
  /* a real line built from the same daily-close history every stock card
     and chart tool on this site already carries (snapshot().stocks[tk].c) --
     no new fetch, no synthetic data, just the last ~90 closes traced out. */
  function stockSpark(tk){
    var s = snapshot();
    var row = s && s.stocks && s.stocks[tk];
    if (!row || !row.c) return null;
    var raw = row.c.split(',');
    var vals = [];
    for (var i = Math.max(0, raw.length - 90); i < raw.length; i++) {
      if (raw[i] === '') continue;
      var n = parseFloat(raw[i]);
      if (isNum(n) && n > 0) vals.push(n);
    }
    if (vals.length < 10) return null;
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var rng = (hi - lo) || 1, n2 = vals.length;
    var pts = vals.map(function(v, i){
      var x = (i / (n2 - 1)) * 100, y = 30 - ((v - lo) / rng) * 28;
      return x.toFixed(2) + ',' + y.toFixed(2);
    }).join(' ');
    var chg = (vals[n2 - 1] - vals[0]) / vals[0] * 100;
    var col = chg >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)';
    return {
      tk:tk, price:vals[n2 - 1], chg:chg, ccy:row.ccy || '',
      svg:'<svg viewBox="0 0 100 32" preserveAspectRatio="none">' +
        '<polyline points="' + pts + '" fill="none" stroke="' + col +
        '" stroke-width="1.7" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>'
    };
  }

  function fmtTime(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB',
      { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:false });
  }

  function goBtn(id, label){
    return '<button type="button" class="cx-go" data-cx-go="' + id + '">' + esc(label) + '</button>';
  }

  /* ---------------- header: cycle + freshness + the pulse ring ---------------- */
  function overallLevel(){
    var al = regimeAlert();
    if (al && al.level === 'alert') return 'alert';
    if (al && al.level === 'warn') return 'warn';
    return 'calm';
  }

  function headHTML(){
    var cyc = window.SPZ_CYCLE;
    var cycTxt = '';
    if (cyc) {
      cycTxt = tx(T.cycleFmt)
        .replace('{p}', esc(tx(cyc.label())))
        .replace('{n}', cyc.confidence ? cyc.confidence.n : '—')
        .replace('{of}', cyc.confidence ? cyc.confidence.of : '—')
        .replace('{d}', cyc.days());
    }
    return '<div class="cx-head">' +
      '<div class="cx-head-l">' +
        '<div class="cx-asof"><span>' + esc(tx(T.asof)) + ' <b data-cx="asof">—</b></span>' +
        (cycTxt ? '<span><b>' + esc(cycTxt) + '</b></span>' : '') + '</div>' +
      '</div>' +
      '<div class="cx-pulse"><canvas data-cx="pulse" width="96" height="96"></canvas>' +
        '<div class="cx-pulse-lbl" data-cx="pulselbl"></div></div>' +
    '</div>';
  }

  function signalHTML(){
    var al = regimeAlert();
    var level = al ? al.level : 'calm';
    var txt = al && al.text ? esc(al.text) : esc(tx(T.signalQuiet));
    var ico = level === 'alert' ? '▲' : level === 'warn' ? '●' : '◆';
    return '<div class="cx-signal ' + (level === 'alert' ? 'alert' : level === 'warn' ? 'warn' : '') + '">' +
      '<span class="cx-signal-ico">' + ico + '</span><span>' + txt + '</span></div>';
  }

  /* ---------------- cards ---------------- */
  function marketHTML(){
    var s = snapshot();
    var ms = marketStatus();
    var mktRow = ms ? '<div class="cx-mkt">' +
      '<span><i class="cx-dot" style="background:' + (ms.us ? 'var(--neon-2,#30d158)' : 'var(--grey-dim)') + '"></i>' +
        esc(tx(ms.us ? T.usOpen : T.usClosed)) + '</span>' +
      '<span><i class="cx-dot" style="background:' + (ms.set ? 'var(--neon-2,#30d158)' : 'var(--grey-dim)') + '"></i>' +
        esc(tx(ms.set ? T.setOpen : T.setClosed)) + '</span></div>' : '';
    var body;
    if (!s || !s.stocks) {
      body = '<div class="cx-txt">' + esc(tx(T.noMovers)) + '</div>';
    } else {
      var rows = [];
      Object.keys(s.stocks).forEach(function(tk){
        var r = s.stocks[tk];
        if (!r || r.stale || !isNum(r.chg_pct)) return;
        rows.push({ tk:tk, chg:r.chg_pct });
      });
      if (!rows.length) {
        body = '<div class="cx-txt">' + esc(tx(T.noMovers)) + '</div>';
      } else {
        rows.sort(function(a,b){ return b.chg - a.chg; });
        var gainers = rows.slice(0, 3), losers = rows.slice(-3).reverse();
        function rowHTML(r){
          return '<div class="cx-mrow"><span>' + esc(r.tk) + '</span><span class="' +
            (r.chg >= 0 ? 'up' : 'dn') + '" style="color:' +
            (r.chg >= 0 ? 'var(--neon-2,#30d158)' : 'var(--red,#ff3b4e)') + '">' + sgn(r.chg, 1) + '%</span></div>';
        }
        body = '<div class="cx-movers">' +
          '<div class="cx-mcol"><div class="cx-mh">' + esc(tx(T.gainH)) + '</div>' + gainers.map(rowHTML).join('') + '</div>' +
          '<div class="cx-mcol"><div class="cx-mh">' + esc(tx(T.loseH)) + '</div>' + losers.map(rowHTML).join('') + '</div>' +
        '</div>';
      }
    }
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.marketL)) + '</div>' +
      mktRow + body + goBtn('now', tx(T.goNow)) + '</div>';
  }

  function gaugesHTML(){
    var gauges = regimeGauges(), sc = regimeScore();
    if (!gauges || !sc) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.gaugesL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.gaugesNA)) + '</div>' + goBtn('regime', tx(T.goRegime)) + '</div>';
    }
    var rows = gauges.map(function(g, i){
      var st = sc.states[i] || 'na';
      var read = st !== 'na' && g.m && g.m[st] ? tx(g.m[st]) : tx(T.naReason);
      return '<div class="cx-gauge-row"><span class="cx-gdot ' + st + '"></span>' +
        '<span><b>' + esc(tx(g.n)) + ':</b> ' + esc(read) + '</span></div>';
    }).join('');
    return '<div class="cx-card cx-wide"><div class="cx-lab"><span>' + esc(tx(T.gaugesL)) + '</span>' +
      '<span>' + sc.alerts + ' alert · ' + sc.soft + ' watch</span></div>' +
      '<div class="cx-gauges">' + rows + '</div>' + goBtn('regime', tx(T.goRegime)) + '</div>';
  }

  function anomHTML(){
    var rows = anomalyRows();
    var body;
    if (rows) {
      body = rows.length
        ? tx(T.anomTxt).replace('{n}', String(rows.length))
        : esc(tx(T.anomZero));
    } else {
      body = esc(tx(T.anomNA));
    }
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.anomL)) + '</div>' +
      '<div class="cx-txt">' + body + '</div>' + goBtn('anomaly', tx(T.goAnom)) + '</div>';
  }

  function correlHTML(){
    var sm = correlSummary();
    var body;
    if (sm && sm.best && sm.worst) {
      body = tx(T.correlTxt)
        .replace('{v}', sm.avgAbs.toFixed(2))
        .replace('{n}', String(sm.n))
        .replace('{a}', esc(sm.best.a)).replace('{b}', esc(sm.best.b)).replace('{abv}', sm.best.v.toFixed(2))
        .replace('{c}', esc(sm.worst.a)).replace('{d}', esc(sm.worst.b)).replace('{cdv}', sm.worst.v.toFixed(2));
    } else {
      body = esc(tx(T.correlNA));
    }
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.correlL)) + '</div>' +
      '<div class="cx-txt">' + body + '</div>' + goBtn('correl', tx(T.goCorrel)) + '</div>';
  }

  /* ---------------- macro & rates: DXY, yields, VIX, SET, S&P ---------------- */
  function macroHTML(){
    var s = snapshot();
    var m = s && s.macro, rg = s && s.regime;
    if (!m) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.macroL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.macroNA)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
    }
    function stat(lab, val, d1){
      return '<div class="cx-stat"><span class="cx-stat-l">' + esc(lab) + '</span>' +
        '<span class="cx-stat-v">' + val + '</span>' +
        (isNum(d1) ? '<span class="cx-stat-d" style="color:' +
          (d1 >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' + sgn(d1, 2) + '%</span>' : '') +
      '</div>';
    }
    var curve = rg && isNum(rg.curve_10y_3m) ? rg.curve_10y_3m : null;
    var stats =
      stat('DXY', m.dxy && isNum(m.dxy.price) ? m.dxy.price.toFixed(2) : '—', m.dxy && m.dxy.d1) +
      stat(tx({en:'US 10Y',th:'สหรัฐฯ 10 ปี'}), m.us10y && isNum(m.us10y.price) ? m.us10y.price.toFixed(2) + '%' : '—', m.us10y && m.us10y.d1) +
      stat(tx({en:'US 3M',th:'สหรัฐฯ 3 เดือน'}), m.us3m && isNum(m.us3m.price) ? m.us3m.price.toFixed(2) + '%' : '—', m.us3m && m.us3m.d1) +
      stat(tx(T.macroCurve), curve !== null ? sgn(curve, 2) : '—', null) +
      stat('VIX', m.vix && isNum(m.vix.price) ? m.vix.price.toFixed(1) : '—', m.vix && m.vix.d1) +
      stat('SET', m.set && isNum(m.set.price) ? m.set.price.toFixed(1) : '—', m.set && m.set.d1) +
      stat('S&P 500', m.spx && isNum(m.spx.price) ? m.spx.price.toFixed(0) : '—', m.spx && m.spx.d1);
    return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.macroL)) + '</div>' +
      '<div class="cx-stat-grid">' + stats + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
  }

  /* ---------------- currency board ---------------- */
  var FX_PICK = ['THB','EUR','JPY','CNY','GBP','KRW','SGD','AUD'];
  function fxHTML(){
    var s = snapshot();
    var ccy = s && s.ccy;
    if (!ccy || !ccy.THB) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.fxL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.fxNA)) + '</div>' + goBtn('infl', tx(T.goInfl)) + '</div>';
    }
    var rows = FX_PICK.filter(function(k){ return ccy[k]; }).map(function(k){
      var r = ccy[k];
      return '<div class="cx-fx-row"><span>' + esc(k) + '</span>' +
        '<span class="cx-fx-rate">' + fmtRate(r.rate) + '</span>' +
        chgSpan(r.d1) + chgSpan(r.m1) + '</div>';
    }).join('');
    return '<div class="cx-card"><div class="cx-lab"><span>' + esc(tx(T.fxL)) + '</span>' +
      '<span>' + esc(tx(T.fxVsUsd)) + '</span></div>' +
      '<div class="cx-fx-head"><span></span><span>' + esc(tx(T.fxRate)) + '</span>' +
        '<span>' + esc(tx(T.fx1d)) + '</span><span>' + esc(tx(T.fx1m)) + '</span></div>' +
      '<div class="cx-fx-list">' + rows + '</div>' + goBtn('infl', tx(T.goInfl)) + '</div>';
  }

  /* ---------------- capital flow: sector leaders / laggards ---------------- */
  function flowGroupHTML(group, lab, na, route, btn){
    var s = snapshot();
    var list = s && s.flows && s.flows[group];
    if (!list || !list.length) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(lab)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(na)) + '</div>' + goBtn(route, tx(btn)) + '</div>';
    }
    var have = list.filter(function(r){ return isNum(r.m1); }).slice();
    have.sort(function(a, b){ return b.m1 - a.m1; });
    var inRows = have.slice(0, 3), outRows = have.slice(-3).reverse();
    function row(r){
      return '<div class="cx-mrow"><span>' + esc((r.flag ? r.flag + ' ' : '') + tx(r)) + '</span>' +
        '<span style="color:' + (r.m1 >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
        sgn(r.m1, 1) + '%</span></div>';
    }
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(lab)) + '</div>' +
      '<div class="cx-movers"><div class="cx-mcol"><div class="cx-mh">' + esc(tx(T.gainH)) + '</div>' +
        inRows.map(row).join('') + '</div>' +
      '<div class="cx-mcol"><div class="cx-mh">' + esc(tx(T.loseH)) + '</div>' +
        outRows.map(row).join('') + '</div></div>' + goBtn(route, tx(btn)) + '</div>';
  }
  function flowHTML(){ return flowGroupHTML('sector', T.flowL, T.flowNA, 'flow', T.goFlow); }
  function globeHTML(){ return flowGroupHTML('country', T.globeL, T.globeNA, 'globe', T.goGlobe); }

  /* ---------------- inflation & policy rates (dated, hand-compiled) ---------------- */
  var INFL_PICK = ['thailand','united-states','euro-area','japan','china','india'];
  function inflHTML(){
    var all = inflCountries();
    if (!all) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.inflL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.inflNA)) + '</div>' + goBtn('infl', tx(T.goInfl)) + '</div>';
    }
    var byU = {}; all.forEach(function(c){ byU[c.u] = c; });
    var rows = INFL_PICK.map(function(u){
      var c = byU[u];
      if (!c || !isNum(c.cpi) || !isNum(c.rate)) return '';
      var real = c.rate - c.cpi;
      return '<div class="cx-fx-row"><span>' + esc((c.f ? c.f + ' ' : '') + tx(c.n)) + '</span>' +
        '<span class="cx-fx-rate">' + c.cpi.toFixed(1) + '%</span>' +
        '<span class="cx-fx-rate">' + c.rate.toFixed(2) + '%</span>' +
        '<span style="color:' + (real >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
        sgn(real, 1) + '%</span></div>';
    }).join('');
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.inflL)) + '</div>' +
      '<div class="cx-fx-head"><span></span><span>CPI</span><span>' + esc(tx(T.inflPolicy)) +
        '</span><span>' + esc(tx(T.inflReal)) + '</span></div>' +
      '<div class="cx-fx-list">' + rows + '</div>' +
      '<div class="cx-note">' + esc(tx(T.inflNote)) + '</div>' + goBtn('infl', tx(T.goInfl)) + '</div>';
  }

  /* ---------------- real price charts for a handful of symbols ---------------- */
  function chartsHTML(){
    var top = rankTop(4);
    var syms = ['SPY', 'QQQ'];
    if (top) top.forEach(function(r){ if (r && r.s && syms.indexOf(r.s.tk) === -1) syms.push(r.s.tk); });
    syms = syms.slice(0, 6);
    var cards = syms.map(function(tk){
      var d = stockSpark(tk);
      if (!d) return '';
      return '<div class="cx-chart"><div class="cx-chart-top"><b>' + esc(tk) + '</b>' +
        '<span style="color:' + (d.chg >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
        sgn(d.chg, 1) + '%</span></div>' + d.svg +
        '<div class="cx-chart-price">' + fmtRate(d.price) + (d.ccy ? ' ' + esc(d.ccy) : '') + '</div></div>';
    }).filter(Boolean).join('');
    if (!cards) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.chartsL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.chartsNA)) + '</div>' + goBtn('chartlab', tx(T.goStock)) + '</div>';
    }
    return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.chartsL)) + '</div>' +
      '<div class="cx-chart-grid">' + cards + '</div>' +
      '<div class="cx-note">' + esc(tx(T.chartsNote)) + '</div>' + goBtn('chartlab', tx(T.goStock)) + '</div>';
  }

  /* ---------------- real analytical price chart: the exact chart the
     individual-stock page (#stock) draws for one ticker -- real daily
     closes (snapshot().stocks[tk].c against the shared calendar), 50/200
     day moving averages, a dashed 52-week high/low band and an RSI
     subplot, with the same 3-month/1-year/2-year toggle. The maths and
     the SVG layout are copied from #stock's own chartHTML()/wireChart()
     (nothing there is exported, so this is a small self-contained
     duplicate of pure, already-shipped logic, not new analysis) --
     the one addition is a ticker picker, since this is a dashboard
     rather than one stock's own page. ---------------- */
  var PC = { tk:null, range:252 };
  var PC_W = 1000, PC_H = 300, PC_PAD_L = 6, PC_PAD_R = 62, PC_TOP = 12, PC_BOT = 22, PC_RH = 78;

  function pcSeries(tk){
    var s = snapshot(), row = s && s.stocks && s.stocks[tk];
    if (!row || !row.c || !row.cal || !s.charts || !s.charts.cal || !s.charts.cal[row.cal]) return null;
    var days = s.charts.cal[row.cal].split(','), raw = row.c.split(',');
    var d = [], v = [];
    for (var i = 0; i < raw.length && i < days.length; i++) {
      if (raw[i] === '') continue;
      var n = parseFloat(raw[i]);
      if (n > 0) { d.push(days[i]); v.push(n); }
    }
    return v.length >= 40 ? { d:d, v:v } : null;
  }
  function pcSma(v, n){
    var out = new Array(v.length), run = 0;
    for (var i = 0; i < v.length; i++) {
      run += v[i];
      if (i >= n) run -= v[i - n];
      out[i] = i >= n - 1 ? run / n : null;
    }
    return out;
  }
  function pcRsi(v, n){
    var out = new Array(v.length), g = 0, l = 0, i;
    for (i = 0; i < v.length; i++) out[i] = null;
    if (v.length < n + 1) return out;
    for (i = 1; i <= n; i++) { var ch = v[i] - v[i - 1]; if (ch >= 0) g += ch; else l -= ch; }
    g /= n; l /= n;
    out[n] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    for (i = n + 1; i < v.length; i++) {
      var c = v[i] - v[i - 1];
      g = (g * (n - 1) + (c > 0 ? c : 0)) / n;
      l = (l * (n - 1) + (c < 0 ? -c : 0)) / n;
      out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
    return out;
  }
  function pcDefaultTk(){
    if (PC.tk && pcSeries(PC.tk)) return PC.tk;
    var cands = [];
    var top = rankTop(1);
    if (top && top[0] && top[0].s) cands.push(top[0].s.tk);
    cands.push('SPY', 'QQQ', 'NVDA');
    var s = snapshot();
    if (s && s.stocks) cands = cands.concat(Object.keys(s.stocks));
    for (var i = 0; i < cands.length; i++) if (pcSeries(cands[i])) { PC.tk = cands[i]; return PC.tk; }
    return null;
  }
  function pcTickerOptions(tk){
    var s = snapshot(), stocks = s && s.stocks;
    if (!stocks) return '';
    return Object.keys(stocks).sort().map(function(k){
      return '<option value="' + esc(k) + '"' + (k === tk ? ' selected' : '') + '>' + esc(k) + '</option>';
    }).join('');
  }
  function goStockBtn(tk, label){
    return '<button type="button" class="cx-go" data-cx-open-stock="' + esc(tk || '') + '">' + esc(label) + '</button>';
  }
  function priceChartHTML(){
    var s = snapshot();
    if (!s || !s.stocks) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.priceChartL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.priceChartNA)) + '</div>' + goBtn('stock', tx(T.goStockDetail)) + '</div>';
    }
    var tk = pcDefaultTk();
    var head = '<div class="cx-lab"><span>' + esc(tx(T.priceChartL)) + '</span>' +
      (tk ? '<select class="cx-pc-tksel" data-cx-pc-tk>' + pcTickerOptions(tk) + '</select>' : '') + '</div>';
    var ser = tk && pcSeries(tk);
    if (!ser) {
      return '<div class="cx-card cx-wide">' + head +
        '<div class="cx-txt">' + esc(tx(T.priceChartNA)) + '</div>' + goBtn('stock', tx(T.goStockDetail)) + '</div>';
    }
    var row = s.stocks[tk] || {};
    var ma50 = pcSma(ser.v, 50), ma200 = pcSma(ser.v, 200);
    var n = ser.v.length, take = Math.min(PC.range, n), from = n - take;
    var v = ser.v.slice(from), d = ser.d.slice(from);
    var m50 = ma50.slice(from), m200 = ma200.slice(from);
    var pool = v.slice();
    m50.concat(m200).forEach(function(x){ if (isNum(x)) pool.push(x); });
    var lo = Math.min.apply(null, pool), hi = Math.max.apply(null, pool);
    var span = (hi - lo) || 1;
    lo -= span * 0.06; hi += span * 0.06; span = hi - lo;
    var iw = PC_W - PC_PAD_L - PC_PAD_R, ih = PC_H - PC_TOP - PC_BOT;
    var X = function(i){ return PC_PAD_L + (take === 1 ? 0 : i / (take - 1) * iw); };
    var Y = function(p){ return PC_TOP + (hi - p) / span * ih; };
    function path(arr){
      var str = '', open = false;
      for (var i = 0; i < arr.length; i++) {
        if (!isNum(arr[i])) { open = false; continue; }
        str += (open ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1) + ' ';
        open = true;
      }
      return str.trim();
    }
    var LX = (PC_W - PC_PAD_R + 8) / PC_W * 100;
    var gy = '', glab = '';
    for (var g = 0; g <= 4; g++) {
      var p = lo + span * (g / 4), y = Y(p);
      gy += '<line x1="' + PC_PAD_L + '" y1="' + y.toFixed(1) + '" x2="' + (PC_W - PC_PAD_R) +
        '" y2="' + y.toFixed(1) + '" stroke="rgba(255,255,255,.055)" stroke-width="1"/>';
      glab += '<span class="cx-pc-ax" style="left:' + LX.toFixed(2) + '%;top:' +
        (y / PC_H * 100).toFixed(2) + '%">' + esc(p >= 100 ? p.toFixed(0) : p.toFixed(2)) + '</span>';
    }
    var band = '';
    if (PC.range >= 252 && isNum(row.hi52) && isNum(row.lo52) && row.hi52 > lo && row.lo52 < hi) {
      [row.hi52, row.lo52].forEach(function(price){
        var y = Y(price);
        if (y < PC_TOP - 4 || y > PC_H - PC_BOT + 4) return;
        band += '<line x1="' + PC_PAD_L + '" y1="' + y.toFixed(1) + '" x2="' + (PC_W - PC_PAD_R) +
          '" y2="' + y.toFixed(1) + '" stroke="rgba(255,176,32,.32)" stroke-width="1" stroke-dasharray="4 4"/>';
      });
    }
    var area = 'M' + X(0).toFixed(1) + ' ' + (PC_H - PC_BOT) + ' ' +
      v.map(function(p, i){ return 'L' + X(i).toFixed(1) + ' ' + Y(p).toFixed(1); }).join('') +
      ' L' + X(take - 1).toFixed(1) + ' ' + (PC_H - PC_BOT) + ' Z';
    var tick = '';
    [0, Math.floor(take / 3), Math.floor(take * 2 / 3), take - 1].forEach(function(i, k){
      if (i < 0 || i >= take) return;
      var pos = k === 3 ? 'right:' + (PC_PAD_R / PC_W * 100).toFixed(2) + '%'
                        : 'left:' + (X(i) / PC_W * 100).toFixed(2) + '%';
      tick += '<span class="cx-pc-axd" style="' + pos + ';top:' +
        ((PC_H - PC_BOT + 6) / PC_H * 100).toFixed(2) + '%' +
        (k === 0 || k === 3 ? '' : ';transform:translateX(-50%)') + '">' + esc(d[i].slice(0, 7)) + '</span>';
    });
    var rsi = pcRsi(ser.v, 14).slice(from);
    var rih = PC_RH - 16;
    var RY = function(x){ return 8 + (100 - x) / 100 * rih; };
    var rpath = '', ropen = false;
    for (var i2 = 0; i2 < rsi.length; i2++) {
      if (!isNum(rsi[i2])) { ropen = false; continue; }
      rpath += (ropen ? 'L' : 'M') + X(i2).toFixed(1) + ' ' + RY(rsi[i2]).toFixed(1) + ' ';
      ropen = true;
    }
    var chg = v.length > 1 && v[0] ? (v[v.length - 1] - v[0]) / v[0] * 100 : 0;
    var crow = '<div class="cx-pc-crow">' +
      [63, 252, 504].map(function(rr){
        if (rr > n + 20) return '';
        return '<button type="button" class="cx-pc-r' + (PC.range === rr ? ' on' : '') +
          '" data-cx-pc-range="' + rr + '">' + esc(tx(T['pcR' + rr])) + '</button>';
      }).join('') +
      '<span class="cx-pc-leg">' +
        '<span><i style="background:var(--neon,#cf0)"></i>' + esc(tx(T.pcLegP)) + '</span>' +
        '<span><i style="background:#5ec8ff"></i>' + esc(tx(T.pcLeg50)) + '</span>' +
        '<span><i style="background:#b98cff"></i>' + esc(tx(T.pcLeg200)) + '</span>' +
        (band ? '<span><i style="background:var(--amber,#ffb020)"></i>' + esc(tx(T.pcLegHi)) + '</span>' : '') +
      '</span></div>';
    var priceNow = fmtRate(row.price) + (row.ccy ? ' ' + esc(row.ccy) : '');
    var body =
      '<div class="cx-pc-hdrow"><b>' + esc(tk) + '</b>' +
        '<span class="cx-pc-px">' + priceNow + '</span>' +
        '<span style="color:' + (chg >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' + sgn(chg, 1) + '%</span>' +
      '</div>' +
      crow +
      '<div data-cx-pc="plot"><div class="cx-pc-pw">' +
      '<svg class="cx-pc-svg price" viewBox="0 0 ' + PC_W + ' ' + PC_H + '" preserveAspectRatio="none" data-cx-pc="price">' +
        '<defs><linearGradient id="cxPcFill" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="var(--neon,#cf0)" stop-opacity=".20"/>' +
          '<stop offset="100%" stop-color="var(--neon,#cf0)" stop-opacity="0"/>' +
        '</linearGradient></defs>' +
        gy + band +
        '<path d="' + area + '" fill="url(#cxPcFill)"/>' +
        '<path d="' + path(m200) + '" fill="none" stroke="#b98cff" stroke-width="1.4" vector-effect="non-scaling-stroke" opacity=".85"/>' +
        '<path d="' + path(m50) + '" fill="none" stroke="#5ec8ff" stroke-width="1.4" vector-effect="non-scaling-stroke" opacity=".85"/>' +
        '<path d="' + path(v) + '" fill="none" stroke="var(--neon,#cf0)" stroke-width="1.9" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
        '<line data-cx-pc="cross" x1="0" y1="' + PC_TOP + '" x2="0" y2="' + (PC_H - PC_BOT) +
          '" stroke="rgba(255,255,255,.45)" stroke-width="1" opacity="0"/>' +
        '<circle data-cx-pc="dot" r="3.5" fill="var(--neon,#cf0)" opacity="0"/>' +
      '</svg>' + glab + tick +
      '</div>' +
      '<div class="cx-pc-rlab">' + esc(tx(T.pcRsiLab)) + '</div>' +
      '<div class="cx-pc-rw">' +
      '<svg class="cx-pc-svg rsi" viewBox="0 0 ' + PC_W + ' ' + PC_RH + '" preserveAspectRatio="none">' +
        '<line x1="' + PC_PAD_L + '" y1="' + RY(70) + '" x2="' + (PC_W - PC_PAD_R) + '" y2="' + RY(70) +
          '" stroke="rgba(255,59,78,.3)" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<line x1="' + PC_PAD_L + '" y1="' + RY(30) + '" x2="' + (PC_W - PC_PAD_R) + '" y2="' + RY(30) +
          '" stroke="rgba(124,255,178,.3)" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<path d="' + rpath.trim() + '" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.3" vector-effect="non-scaling-stroke"/>' +
      '</svg>' +
      '<span class="cx-pc-ax" style="left:' + LX.toFixed(2) + '%;top:' + (RY(70) / PC_RH * 100).toFixed(2) + '%">70</span>' +
      '<span class="cx-pc-ax" style="left:' + LX.toFixed(2) + '%;top:' + (RY(30) / PC_RH * 100).toFixed(2) + '%">30</span>' +
      '</div>' +
      '<div class="cx-pc-tip" data-cx-pc="tip"></div>' +
      '</div>';
    return '<div class="cx-card cx-wide">' + head +
      '<div class="cx-pc-box">' + body + '</div>' +
      '<div class="cx-note">' + esc(tx(T.priceChartNote)) + '</div>' + goStockBtn(tk, tx(T.goStockDetail)) + '</div>';
  }

  /* the crosshair has to survive every repaint, so it is wired straight
     after bodyHTML() is dropped into the DOM -- same pattern #stock uses
     for its own chart. */
  function wirePriceChart(body){
    var plot = body.querySelector('[data-cx-pc="plot"]');
    var svg = body.querySelector('[data-cx-pc="price"]');
    if (!plot || !svg) return;
    var tk = pcDefaultTk(), ser = tk && pcSeries(tk);
    if (!ser) return;
    var n = ser.v.length, take = Math.min(PC.range, n), from = n - take;
    var v = ser.v.slice(from), d = ser.d.slice(from);
    var m50 = pcSma(ser.v, 50).slice(from);
    var pool = v.slice();
    pcSma(ser.v, 50).slice(from).concat(pcSma(ser.v, 200).slice(from))
      .forEach(function(x){ if (isNum(x)) pool.push(x); });
    var lo = Math.min.apply(null, pool), hi = Math.max.apply(null, pool);
    var span = (hi - lo) || 1;
    lo -= span * 0.06; hi += span * 0.06; span = hi - lo;
    var iw = PC_W - PC_PAD_L - PC_PAD_R, ih = PC_H - PC_TOP - PC_BOT;
    var cross = svg.querySelector('[data-cx-pc="cross"]');
    var dot = svg.querySelector('[data-cx-pc="dot"]');
    var tip = body.querySelector('[data-cx-pc="tip"]');
    var row = (snapshot() || {}).stocks && (snapshot() || {}).stocks[tk];
    var ccy = row && row.ccy;

    function move(ev){
      var box = svg.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left;
      var frac = Math.max(0, Math.min(1, (cx / box.width * PC_W - PC_PAD_L) / iw));
      var i = Math.round(frac * (take - 1));
      if (i < 0 || i >= take) return;
      var x = PC_PAD_L + (take === 1 ? 0 : i / (take - 1) * iw);
      var y = PC_TOP + (hi - v[i]) / span * ih;
      cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.setAttribute('opacity', '1');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('opacity', '1');
      tip.classList.add('on');
      tip.innerHTML = '<b>' + esc(d[i]) + '</b><br>' + esc(fmtRate(v[i]) + (ccy ? ' ' + ccy : '')) +
        (isNum(m50[i]) ? '<br>' + esc(tx(T.pcLeg50)) + ' ' + esc(fmtRate(m50[i]) + (ccy ? ' ' + ccy : '')) : '');
      var px = x / PC_W * box.width;
      tip.style.left = Math.max(4, Math.min(box.width - tip.offsetWidth - 4, px + 12)) + 'px';
      tip.style.top = Math.max(4, y / PC_H * box.height - 14) + 'px';
    }
    function leave(){
      cross.setAttribute('opacity', '0');
      dot.setAttribute('opacity', '0');
      tip.classList.remove('on');
    }
    svg.addEventListener('mousemove', move);
    svg.addEventListener('mouseleave', leave);
    svg.addEventListener('touchmove', move, { passive:true });
    svg.addEventListener('touchend', leave);
  }

  /* ---------------- market breadth: % of tracked stocks above their own
     50/200-day average -- snapshot().regime.breadth_50/breadth_200,
     already computed for the early-warning gauges' own breadth reading,
     just not shown here as its own headline number before now ---------------- */
  function breadthColor(v){
    if (!isNum(v)) return 'var(--grey-dim)';
    return v >= 60 ? 'var(--neon-2,#7CFFB2)' : v >= 40 ? 'var(--amber,#ffb020)' : 'var(--red,#ff3b4e)';
  }
  function breadthHTML(){
    var s = snapshot(), rg = s && s.regime;
    if (!rg || !isNum(rg.breadth_50) || !isNum(rg.breadth_200)) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.breadthL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.breadthNA)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
    }
    function stat3(lab, v){
      return '<div class="cx-stat"><span class="cx-stat-l">' + esc(lab) + '</span>' +
        '<span class="cx-stat-v" style="color:' + breadthColor(v) + '">' + v.toFixed(1) + '%</span></div>';
    }
    var stats = stat3(tx(T.breadthAbove50), rg.breadth_50) + stat3(tx(T.breadthAbove200), rg.breadth_200);
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.breadthL)) + '</div>' +
      '<div class="cx-stat-grid">' + stats + '</div>' +
      '<div class="cx-note">' + esc(tx(T.breadthNote)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
  }

  /* ---------------- golden cross / death cross: snapshot().regime.crosses,
     already computed for the Turning Point Radar's own divergence/cross
     scan, just not surfaced by name anywhere on this page before now ---------------- */
  function crossHTML(){
    var s = snapshot(), rg = s && s.regime;
    if (!rg) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.crossL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.crossNA)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
    }
    var list = rg.crosses || [];
    var body;
    if (!list.length) {
      body = '<div class="cx-txt">' + esc(tx(T.crossNone)) + '</div>';
    } else {
      body = list.slice(0, 6).map(function(c){
        var golden = c.kind === 'golden';
        var lab = golden ? tx(T.crossGolden) : tx(T.crossDeath);
        var col = golden ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)';
        var vsTxt = isNum(c.vs200) ? tx(T.crossVs).replace('{v}', sgn(c.vs200, 1)) : '';
        return '<div class="cx-mrow"><span>' + esc(c.t || c.name || '') + ' <span style="color:var(--grey-dim)">' +
          esc(lab) + '</span></span><span style="color:' + col + '">' + esc(vsTxt) + '</span></div>';
      }).join('');
    }
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.crossL)) + '</div>' + body +
      '<div class="cx-note">' + esc(tx(T.crossNote)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
  }

  /* ---------------- rotation & leadership: a handful of cross-asset
     spreads snapshot().regime already carries (cyclical vs defensive,
     small caps, semis, gold, dollar, EM, commodities, stocks vs bonds) --
     each already used inside the early-warning gauges' own sentences,
     just not shown together as raw numbers before now ---------------- */
  function rotationHTML(){
    var s = snapshot(), rg = s && s.regime;
    if (!rg) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.rotL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.rotNA)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
    }
    function stat4(lab, v){
      return '<div class="cx-stat"><span class="cx-stat-l">' + esc(lab) + '</span>' +
        '<span class="cx-stat-v" style="font-size:13px;color:' +
        (isNum(v) ? (v >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') : 'var(--grey-dim)') + '">' +
        (isNum(v) ? sgn(v, 2) + '%' : '—') + '</span></div>';
    }
    var stats =
      stat4(tx(T.rotCycDef), rg.cyclical_vs_defensive_1m) +
      stat4(tx(T.rotSmall), rg.smallcap_vs_market_1m) +
      stat4(tx(T.rotSemis), rg.semis_vs_market_1m) +
      stat4(tx(T.rotGold), rg.gld_1m) +
      stat4(tx(T.rotDollar), rg.uup_1m) +
      stat4(tx(T.rotEm), rg.em_vs_us_3m) +
      stat4(tx(T.rotComm), rg.dbc_1m) +
      stat4(tx(T.rotBonds), rg.stocks_vs_bonds_1m);
    return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.rotL)) + '</div>' +
      '<div class="cx-stat-grid">' + stats + '</div>' +
      '<div class="cx-note">' + esc(tx(T.rotNote)) + '</div>' + goBtn('regime', tx(T.goRegime2)) + '</div>';
  }

  /* ---------------- capital flow forecast: sector bars + active rotation
     theses + macro backdrop + leading/lagging-sector fundamentals, all
     read from data the site already computes (see doc comment above) ---------------- */
  function fundRow(tk, row){
    var pe = isNum(row.pe) ? row.pe : null;
    var eps = (pe && pe !== 0 && isNum(row.price)) ? (row.price / pe) : null;
    var bits = [];
    bits.push('P/E ' + (pe !== null ? pe.toFixed(1) : '—'));
    bits.push('ROE ' + (isNum(row.roe) ? row.roe.toFixed(1) + '%' : '—'));
    bits.push((L() === 'th' ? 'มาร์จิ้น ' : 'Margin ') + (isNum(row.margin) ? row.margin.toFixed(1) + '%' : '—'));
    bits.push((L() === 'th' ? 'ปันผล ' : 'Div ') + (isNum(row.div) ? row.div.toFixed(2) + '%' : '—'));
    bits.push('EPS ' + (eps !== null ? eps.toFixed(2) : '—'));
    return '<div class="cx-fund-row"><span class="cx-fund-tk">' + esc(tk) + '</span>' +
      '<span class="cx-fund-stats">' + esc(bits.join(' · ')) + '</span></div>';
  }
  function sectorMovers(flowEn, stocks, dir){
    var stockSector = FLOW_SECTOR_STOCK_SECTOR[flowEn];
    var industry = FLOW_SECTOR_INDUSTRY[flowEn];
    if (!stocks || (!stockSector && !industry)) return null;
    var rows = [];
    Object.keys(stocks).forEach(function(tk){
      var r = stocks[tk];
      if (!r) return;
      var match = stockSector ? (r.sector === stockSector) : (r.industry === industry);
      if (!match || !isNum(r[CFF.tf])) return;
      rows.push({ tk:tk, row:r });
    });
    if (!rows.length) return [];
    rows.sort(function(a, b){ return dir * (b.row[CFF.tf] - a.row[CFF.tf]); });
    return rows.slice(0, 3);
  }
  function flowForecastHTML(){
    var s = snapshot();
    var sectors = s && s.flows && s.flows.sector;
    if (!sectors || !sectors.length) {
      return '<div class="cx-card cx-wide"><div class="cx-lab"><span>' + esc(tx(T.cffL)) + '</span></div>' +
        '<div class="cx-txt">' + esc(tx(T.cffNA)) + '</div>' + goBtn('flow', tx(T.goFlow)) + '</div>';
    }
    var tf = CFF.tf;
    var have = sectors.filter(function(r){ return isNum(r[tf]); }).slice();
    have.sort(function(a, b){ return b[tf] - a[tf]; });
    var scaleMax = Math.max(5, have.reduce(function(m, r){ return Math.max(m, Math.abs(r[tf])); }, 0));

    var toggle = '<div class="cx-tf-toggle">' +
      '<button type="button" class="cx-tf-btn' + (tf === 'm1' ? ' on' : '') + '" data-cff-tf="m1">' + esc(tx(T.cffTf1)) + '</button>' +
      '<button type="button" class="cx-tf-btn' + (tf === 'm3' ? ' on' : '') + '" data-cff-tf="m3">' + esc(tx(T.cffTf3)) + '</button>' +
      '</div>';

    var bars = have.map(function(r){
      var v = r[tf];
      var pct = Math.min(50, Math.abs(v) / scaleMax * 50);
      var fill = v >= 0 ?
        '<div class="cx-flow-fill pos" style="width:' + pct.toFixed(1) + '%"></div>' :
        '<div class="cx-flow-fill neg" style="width:' + pct.toFixed(1) + '%"></div>';
      return '<div class="cx-flow-row"><span class="cx-flow-name">' + esc(tx(r)) + '</span>' +
        '<div class="cx-flow-track"><div class="cx-flow-mid"></div>' + fill + '</div>' +
        '<span class="cx-flow-val" style="color:' + (v >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
        sgn(v, 1) + '%</span></div>';
    }).join('');

    var topIn = have[0], topOut = have[have.length - 1];
    var summary = '';
    if (topIn && topOut && topIn !== topOut) {
      summary = '<div class="cx-txt cx-cff-summary">' + esc(tx(T.cffIn)) + ' <b class="up">' + esc(tx(topIn)) +
        '</b> (' + sgn(topIn[tf], 1) + '%) ' + esc(tx(T.cffOut)) + ' <b class="dn">' + esc(tx(topOut)) +
        '</b> (' + sgn(topOut[tf], 1) + '%).</div>';
    }

    var rg = s.regime;
    var playsHtml = '';
    if (window.__SPZ_REGIME && window.__SPZ_REGIME.plays && rg) {
      var active = [];
      window.__SPZ_REGIME.plays.forEach(function(p){
        try { if (p.on(rg)) active.push(p); } catch(e){}
      });
      if (active.length) {
        playsHtml = '<div class="cx-play-list">' + active.map(function(p){
          return '<div class="cx-play"><div class="cx-play-h">' +
            '<span class="cx-play-out">' + esc(tx(T.cffOutOf)) + ' ' + esc(tx(p.out)) + '</span>' +
            '<span class="cx-play-arrow">&#8594;</span>' +
            '<span class="cx-play-into">' + esc(tx(T.cffInto)) + ' ' + esc(tx(p.into)) + '</span></div>' +
            '<div class="cx-play-txt">' + esc(tx(p.d)) + '</div>' +
            '<div class="cx-play-tk">' + p.tk.map(function(t){ return '$' + esc(t); }).join('  ') + '</div></div>';
        }).join('') + '</div>';
      } else {
        playsHtml = '<div class="cx-txt" style="margin-top:8px;">' + esc(tx(T.cffNoPlays)) + '</div>';
      }
    }

    var macroHtml = '';
    if (rg) {
      function mstat(lab, val, colorFn){
        return '<div class="cx-stat"><span class="cx-stat-l">' + esc(lab) + '</span>' +
          '<span class="cx-stat-v" style="font-size:13px;color:' + colorFn(val) + '">' + val + '</span></div>';
      }
      var curveInv = isNum(rg.curve_10y_3m) && rg.curve_10y_3m < 0;
      macroHtml = '<div class="cx-fund-block"><div class="cx-fund-h">' + esc(tx(T.cffMacroH)) + '</div>' +
        '<div class="cx-stat-grid">' +
        mstat(tx(T.cffVix), isNum(rg.vix) ? rg.vix.toFixed(1) : '—',
          function(){ return isNum(rg.vix) ? (rg.vix > 25 ? 'var(--red,#ff3b4e)' : rg.vix > 18 ? 'var(--amber,#ffb020)' : 'var(--neon-2,#7CFFB2)') : 'var(--grey-dim)'; }) +
        mstat(tx(T.cffCurve), isNum(rg.curve_10y_3m) ? (sgn(rg.curve_10y_3m, 2) + ' (' + esc(tx(curveInv ? T.cffCurveInv : T.cffCurveNorm)) + ')') : '—',
          function(){ return curveInv ? 'var(--red,#ff3b4e)' : 'var(--neon-2,#7CFFB2)'; }) +
        mstat(tx(T.cffDollar), isNum(rg.uup_3m) ? sgn(rg.uup_3m, 1) + '%' : '—',
          function(){ return isNum(rg.uup_3m) ? (rg.uup_3m >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') : 'var(--grey-dim)'; }) +
        mstat(tx(T.cffCredit), isNum(rg.credit_1m) ? sgn(rg.credit_1m, 2) + ' pts' : '—',
          function(){ return isNum(rg.credit_1m) ? (rg.credit_1m >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') : 'var(--grey-dim)'; }) +
        '</div></div>';
    }

    var fundHtml = '';
    if (topIn && topOut && s.stocks) {
      var leadRows = sectorMovers(topIn.en, s.stocks, 1);
      var lagRows = sectorMovers(topOut.en, s.stocks, -1);
      if (leadRows || lagRows) {
        var leadBlock = '<div class="cx-fund-h">' + esc(tx(T.cffFundLead)) + ' — ' + esc(tx(topIn)) + '</div>' +
          (leadRows && leadRows.length ? leadRows.map(function(x){ return fundRow(x.tk, x.row); }).join('') :
            '<div class="cx-txt">' + esc(tx(T.cffFundNone)) + '</div>');
        var lagBlock = '<div class="cx-fund-h" style="margin-top:12px;">' + esc(tx(T.cffFundLag)) + ' — ' + esc(tx(topOut)) + '</div>' +
          (lagRows && lagRows.length ? lagRows.map(function(x){ return fundRow(x.tk, x.row); }).join('') :
            '<div class="cx-txt">' + esc(tx(T.cffFundNone)) + '</div>');
        fundHtml = '<div class="cx-fund-block"><div class="cx-fund-h" style="font-size:11px;color:var(--white);text-transform:none;letter-spacing:0;margin-bottom:10px;">' +
          esc(tx(T.cffFundH)) + '</div>' + leadBlock + lagBlock + '</div>';
      }
    }

    return '<div class="cx-card cx-wide"><div class="cx-lab"><span>' + esc(tx(T.cffL)) + '</span>' + toggle + '</div>' +
      '<div class="cx-flow-list">' + bars + '</div>' +
      summary + playsHtml + macroHtml + fundHtml +
      '<div class="cx-note">' + esc(tx(T.cffNote)) + '</div>' + goBtn('flow', tx(T.goFlow)) + '</div>';
  }

  /* ---------------- credit market: HYG-LQD spread + per-stock risk scan ---------------- */
  function creditHTML(){
    var s = snapshot();
    var rg = s && s.regime, stocks = s && s.stocks;
    if (!rg) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.creditL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.creditNA)) + '</div>' + goBtn('stock', tx(T.goStockCredit)) + '</div>';
    }
    var spread = isNum(rg.credit_1m) ? rg.credit_1m : null;
    var spreadCol = spread === null ? 'var(--grey-dim)' :
      spread >= 0 ? 'var(--neon-2,#7CFFB2)' : spread <= -1.5 ? 'var(--red,#ff3b4e)' : 'var(--amber,#ffb020)';
    var CR = window.__SPZ_CREDIT, risky = [];
    if (CR && CR.get && stocks) {
      Object.keys(stocks).forEach(function(tk){
        var d = null; try { d = CR.get(tk); } catch(e){}
        if (d && (d.band === 'high' || d.band === 'vhigh')) risky.push({ tk:tk, score:d.score, band:d.band });
      });
      risky.sort(function(a, b){ return b.score - a.score; });
    }
    var riskyBlock;
    if (risky.length) {
      var rows = risky.slice(0, 5).map(function(r){
        var col = r.band === 'vhigh' ? 'var(--red,#ff3b4e)' : 'var(--amber,#ffb020)';
        var lbl = r.band === 'vhigh' ? {en:'Very high',th:'สูงมาก'} : {en:'High',th:'สูง'};
        return '<div class="cx-mrow"><span>' + esc(r.tk) + '</span><span style="color:' + col + '">' +
          esc(tx(lbl)) + '</span></div>';
      }).join('');
      riskyBlock = '<div class="cx-mh" style="margin-top:8px;">' + esc(tx(T.creditRiskH)) + '</div>' + rows;
    } else {
      riskyBlock = '<div class="cx-txt" style="margin-top:6px;">' + esc(tx(T.creditNone)) + '</div>';
    }
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.creditL)) + '</div>' +
      '<div class="cx-txt"><b>' + esc(tx(T.creditSpread)) + ':</b> <span style="color:' + spreadCol + '">' +
      (spread === null ? '—' : sgn(spread, 2) + ' pts') + '</span></div>' + riskyBlock +
      '<div class="cx-note">' + esc(tx(T.creditNote)) + '</div>' + goBtn('stock', tx(T.goStockCredit)) + '</div>';
  }

  /* ---------------- valuation extremes: Bubble Radar's own three signals ---------------- */
  function bubbleData(){
    try { return (window.__SPZ_BUBBLE && window.__SPZ_BUBBLE.data && window.__SPZ_BUBBLE.data()) || null; }
    catch(e){ return null; }
  }
  function riskColor(v, lo, hi){
    if (!isNum(v)) return 'var(--grey-dim)';
    var r = Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100));
    return r >= 66 ? 'var(--red,#ff3b4e)' : r >= 33 ? 'var(--amber,#ffb020)' : 'var(--neon-2,#7CFFB2)';
  }
  function bubbleHTML(){
    var b = bubbleData();
    if (!b) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.bubbleL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.bubbleNA)) + '</div>' + goBtn('bubble', tx(T.goBubble)) + '</div>';
    }
    var cape = b.cape, buff = b.buffett, md = b.margin_debt;
    function stat2(lab, val, color){
      return '<div class="cx-stat"><span class="cx-stat-l">' + esc(lab) + '</span>' +
        '<span class="cx-stat-v" style="color:' + color + '">' + val + '</span></div>';
    }
    var stats =
      stat2('Shiller CAPE', cape && isNum(cape.value) ? cape.value.toFixed(1) : '—', riskColor(cape && cape.value, 15, 45)) +
      stat2(tx({en:'Buffett Indicator',th:'Buffett Indicator'}), buff && isNum(buff.value_pct) ? buff.value_pct.toFixed(0) + '%' : '—',
        riskColor(buff && buff.value_pct, 80, 220)) +
      stat2(tx({en:'Margin debt (YoY)',th:'หนี้มาร์จิ้น (YoY)'}), md && isNum(md.yoy_pct) ? sgn(md.yoy_pct, 1) + '%' : '—',
        riskColor(md && md.yoy_pct, -10, 40));
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.bubbleL)) + '</div>' +
      '<div class="cx-stat-grid">' + stats + '</div>' +
      '<div class="cx-note">' + esc(tx(T.bubbleNote)) + '</div>' + goBtn('bubble', tx(T.goBubble)) + '</div>';
  }

  /* ---------------- my watchlist: this browser's own pinned tickers, live ---------------- */
  function watchTableHTML(){
    var W = window.__SPZ_WATCHLIST, st = null;
    try { st = W && W.state && W.state(); } catch(e){}
    var tickers = (st && st.wl) ? Object.keys(st.wl) : [];
    /* Telegram (full list, own thresholds) takes priority; if that's not
       connected but LINE is, fall back to LINE's ticker list so the card
       isn't empty just because the visitor chose the other channel. */
    if ((!st || !st.chatId || !tickers.length) && st && st.line && st.line.status === 'linked' && st.line.tickers.length) {
      tickers = st.line.tickers.slice();
    }
    if (!st || !tickers.length) {
      return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.wtL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.wtNone)) + '</div>' + goBtn('watchlist', tx(T.goWl)) + '</div>';
    }
    var s = snapshot();
    var stocks = (s && s.stocks) || {};
    var rows = tickers.map(function(tk){
      var r = stocks[tk];
      var chg = r && isNum(r.chg_pct) ? r.chg_pct : null;
      var px = r && isNum(r.price) ? fmtRate(r.price) : '—';
      return '<div class="cx-mrow"><span>' + esc(tk) + ' <span style="color:var(--grey-dim)">' + px + '</span></span>' +
        '<span style="color:' + (chg === null ? 'var(--grey-dim)' : chg >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
        (chg === null ? '—' : sgn(chg, 1) + '%') + '</span></div>';
    }).join('');
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.wtL)) + '</div>' + rows +
      goBtn('watchlist', tx(T.goWl)) + '</div>';
  }

  /* ---------------- correlation heat map: same matrix (CR.matrix()), a
     proper diverging colour scale instead of flat green/red opacity --
     crimson at -1, a dark neutral slate at 0, emerald at +1, luminance
     picked per-cell so the number stays readable either way. The real
     Correlation Map page and its own corrColor()/CR.color getter are
     untouched -- this is only a nicer rendering, here, of the exact same
     v values. ---------------- */
  function heatShade(v){
    if (!isNum(v)) return { bg:'rgba(255,255,255,.035)', fg:'var(--grey-dim)' };
    var t = Math.max(-1, Math.min(1, v)), a = Math.abs(t);
    var neutral = [26, 28, 34], pos = [40, 201, 122], neg = [255, 71, 87];
    var base = t >= 0 ? pos : neg;
    var mix = function(i){ return Math.round(neutral[i] + (base[i] - neutral[i]) * a); };
    var r = mix(0), g = mix(1), b = mix(2);
    var lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return { bg:'rgb(' + r + ',' + g + ',' + b + ')', fg: lum > 140 ? '#0a0c10' : 'rgba(255,255,255,.94)' };
  }
  function correlHeatHTML(){
    var CR = window.__SPZ_CORREL, mx = null;
    try { mx = CR && CR.matrix && CR.matrix(); } catch(e){ mx = null; }
    if (!mx || !mx.syms || mx.syms.length < 3) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.corrHeatL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.corrHeatNA)) + '</div>' + goBtn('correl', tx(T.goCorrel)) + '</div>';
    }
    var syms = mx.syms, M = mx.M;
    var cells = '<div class="cx-heat-hd"></div>' + syms.map(function(s){
      return '<div class="cx-heat-hd" title="' + esc(tx(s)) + '">' + esc(s.sym) + '</div>';
    }).join('');
    syms.forEach(function(rowS, i){
      cells += '<div class="cx-heat-hd cx-heat-rowlab" title="' + esc(tx(rowS)) + '">' + esc(rowS.sym) + '</div>';
      syms.forEach(function(colS, j){
        if (i === j) {
          cells += '<div class="cx-heat-cell cx-heat-diag" title="' + esc(rowS.sym) + '">—</div>';
          return;
        }
        var c = M[i][j], v = c ? c.v : null;
        var sh = heatShade(v);
        cells += '<div class="cx-heat-cell" style="background:' + sh.bg + ';color:' + sh.fg + '" title="' +
          esc(rowS.sym) + ' × ' + esc(colS.sym) + ': ' + (v === null ? '—' : v.toFixed(2)) + '">' +
          (v === null ? '—' : v.toFixed(2).replace(/^(-?)0\./, '$1.')) + '</div>';
      });
    });
    return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.corrHeatL)) + '</div>' +
      '<div class="cx-heat-scroll"><div class="cx-heat" style="grid-template-columns:repeat(' + (syms.length + 1) + ',1fr);">' +
      cells + '</div></div>' +
      '<div class="cx-heat-legend"><span>-1</span><span class="cx-heat-legend-bar"></span><span>+1</span></div>' +
      '<div class="cx-note">' + esc(tx(T.corrHeatNote)) + '</div>' + goBtn('correl', tx(T.goCorrel)) + '</div>';
  }

  /* ---------------- stock heat map: every tracked stock, grouped by sector ---------------- */
  function stockHeatColor(v){
    if (!isNum(v)) return 'rgba(255,255,255,.04)';
    var t = Math.max(-5, Math.min(5, v)) / 5;
    return t >= 0 ? 'rgba(48,209,88,' + (0.18 + 0.55 * t) + ')' : 'rgba(255,69,58,' + (0.18 + 0.55 * -t) + ')';
  }
  function stockHeatHTML(){
    var s = snapshot();
    var stocks = s && s.stocks;
    if (!stocks) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.stockHeatL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.stockHeatNA)) + '</div>' + goBtn('directory', tx(T.goDirectory)) + '</div>';
    }
    var bySec = {};
    Object.keys(stocks).forEach(function(tk){
      var r = stocks[tk];
      if (!r || !isNum(r.chg_pct)) return;
      var sec = r.sector || 'Other';
      (bySec[sec] = bySec[sec] || []).push({ tk:tk, chg:r.chg_pct });
    });
    var groups = Object.keys(bySec).sort().map(function(sec){
      var tiles = bySec[sec].sort(function(a, b){ return b.chg - a.chg; }).map(function(x){
        return '<div class="cx-heat-tile" style="background:' + stockHeatColor(x.chg) + '" title="' +
          esc(x.tk) + ' ' + sgn(x.chg, 1) + '%">' + esc(x.tk) + '<b>' + sgn(x.chg, 1) + '%</b></div>';
      }).join('');
      return '<div class="cx-heat-group"><div class="cx-heat-glab">' + esc(sec) + '</div>' +
        '<div class="cx-heat-tiles">' + tiles + '</div></div>';
    }).join('');
    return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.stockHeatL)) + '</div>' + groups +
      '<div class="cx-note">' + esc(tx(T.stockHeatNote)) + '</div>' + goBtn('directory', tx(T.goDirectory)) + '</div>';
  }

  function watchHTML(){
    var h = watchHeadline();
    var body = h ? tx(T.watchTxt).replace('{n}', String(h.n)).replace('{t}', esc(h.text)) : esc(tx(T.watchNone));
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.watchL)) + '</div>' +
      '<div class="cx-txt">' + body + '</div>' + goBtn('now', tx(T.goWatch)) + '</div>';
  }

  function rankHTML(){
    var top = rankTop(5);
    if (!top) {
      return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.rankL)) + '</div>' +
        '<div class="cx-txt">' + esc(tx(T.rankNA)) + '</div>' + goBtn('desk', tx(T.goDesk)) + '</div>';
    }
    var rows = top.map(function(r){
      var why = rankWhy(r).slice(0, 2).join(' · ');
      return '<div class="cx-rank-row"><div class="cx-rank-l">' + esc(r.s.tk) +
        (why ? '<span>' + esc(why) + '</span>' : '') + '</div>' +
        '<div class="cx-rank-r">' + r.total.toFixed(0) + '</div></div>';
    }).join('');
    return '<div class="cx-card cx-wide"><div class="cx-lab">' + esc(tx(T.rankL)) + '</div>' +
      rows + '<div class="cx-note">' + esc(tx(T.rankNote)) + '</div>' + goBtn('desk', tx(T.goDesk)) + '</div>';
  }

  function proDeskHTML(){
    return '<div class="cx-card"><div class="cx-lab">' + esc(tx(T.proL)) + '</div>' +
      '<div class="cx-txt">' + esc(tx(T.proTxt)) + '</div>' + goBtn('pro', tx(T.goPro)) + '</div>';
  }

  function bodyHTML(){
    return signalHTML() +
      '<div class="cx-grid">' +
        marketHTML() + macroHTML() + fxHTML() + flowHTML() + globeHTML() + inflHTML() +
        creditHTML() + bubbleHTML() + anomHTML() + correlHTML() + watchHTML() + watchTableHTML() +
        breadthHTML() + crossHTML() +
        gaugesHTML() + rotationHTML() + flowForecastHTML() + correlHeatHTML() + stockHeatHTML() + chartsHTML() + priceChartHTML() + rankHTML() + proDeskHTML() +
      '</div>' +
      '<div class="ss-foot">' + esc(tx(T.foot)) + '</div>';
  }

  function bind(body){
    body.querySelectorAll('[data-cx-go]').forEach(function(b){
      b.addEventListener('click', function(){ location.hash = '#/' + b.getAttribute('data-cx-go'); });
    });
    body.querySelectorAll('[data-cx-open-stock]').forEach(function(b){
      b.addEventListener('click', function(){
        var tk = b.getAttribute('data-cx-open-stock');
        if (tk && window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(tk);
        else location.hash = '#/stock';
      });
    });
    var pcSel = body.querySelector('[data-cx-pc-tk]');
    if (pcSel) pcSel.addEventListener('change', function(){ PC.tk = pcSel.value; paint(); });
    body.querySelectorAll('[data-cx-pc-range]').forEach(function(b){
      b.addEventListener('click', function(){ PC.range = parseInt(b.getAttribute('data-cx-pc-range'), 10); paint(); });
    });
    body.querySelectorAll('[data-cff-tf]').forEach(function(b){
      b.addEventListener('click', function(){ CFF.tf = b.getAttribute('data-cff-tf'); paint(); });
    });
    wirePriceChart(body);
  }

  /* ---------------- the pulse ring: a small breathing indicator whose
     speed and colour follow the same alert level the Turn Signal banner
     already computes -- calm and slow when clear, faster and redder as
     something actually needs attention. Continuous by construction (a
     sine breathing curve, not random jitter) so it is never mistaken for
     a frozen static icon. ---------------- */
  function stopPulse(){
    if (pulse.raf) { cancelAnimationFrame(pulse.raf); pulse.raf = null; }
  }

  function mountPulse(){
    stopPulse();
    var canvas = sec && sec.querySelector('[data-cx="pulse"]');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    pulse.canvas = canvas; pulse.ctx = ctx; pulse.t = 0;

    function colorFor(level){
      if (level === 'alert') return { core:'#ff2d4d', ring:'rgba(255,45,77,.55)', speed:2.6 };
      if (level === 'warn') return { core:'#ffb020', ring:'rgba(255,176,32,.5)', speed:1.6 };
      return { core:'#f4f6f1', ring:'rgba(244,246,241,.4)', speed:0.9 };
    }

    function tick(){
      if (!canvas.isConnected) { stopPulse(); return; }
      if (sec.offsetParent === null) { pulse.raf = requestAnimationFrame(tick); return; }
      pulse.level = overallLevel();
      var c = colorFor(pulse.level);
      pulse.t += 0.028 * c.speed;
      var W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);
      var breathe = (Math.sin(pulse.t) + 1) / 2;
      var coreR = 13 + breathe * 4;
      for (var i = 2; i >= 0; i--) {
        var ringR = coreR + 10 + i * 11 + breathe * 5;
        var alpha = (1 - i / 3) * (0.28 - breathe * 0.08);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, ringR), 0, Math.PI * 2);
        ctx.strokeStyle = c.ring.replace(/[\d.]+\)$/, Math.max(0.03, alpha).toFixed(3) + ')');
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = c.core;
      ctx.shadowBlur = 14; ctx.shadowColor = c.ring;
      ctx.fill();
      ctx.shadowBlur = 0;
      pulse.raf = requestAnimationFrame(tick);
    }
    tick();
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-cx="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(T.eyebrow);
    if (q('h')) q('h').textContent = tx(T.h);
    if (q('lede')) q('lede').textContent = tx(T.lede);
    var body = q('body');
    if (!body) return;
    var s = snapshot();
    if (q('asof')) q('asof').textContent = s ? fmtTime(s.generated_at) : tx(T.waiting);
    body.innerHTML = bodyHTML();
    bind(body);
    var lvl = overallLevel();
    var lblEl = q('pulselbl');
    if (lblEl) lblEl.textContent = tx(lvl === 'alert' ? T.pulseAlert : lvl === 'warn' ? T.pulseWatch : T.pulseCalm);
    mountPulse();
  }

  function build(){
    if (document.getElementById('cockpit')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'cockpit';
    sec.setAttribute('data-route', 'cockpit');
    sec.innerHTML =
      '<div class="cx-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-cx="eb"></span></div>' +
          '<h2 data-cx="h"></h2>' +
          '<p class="lede" data-cx="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        headHTML() +
        '<div data-cx="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'cockpit', feat:true, after:'daily',
      t:{en:'Command Center',th:'ศูนย์บัญชาการ'},
      d:{en:'Every gauge, scan and ranking on this site, gathered onto one wide screen — a fast overview, not a replacement for the pages it reads from. Admin-only.',
         th:'ตัวชี้วัด การสแกน และการจัดอันดับทุกอย่างในเว็บนี้ รวบมาไว้ในหน้ากว้างหน้าเดียว — ไว้กวาดภาพรวมเร็วๆ ไม่ใช่ตัวแทนหน้าจริงที่มันอ้างอิงมา เฉพาะแอดมิน'}
    });

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(){ paint(); });
    var seed = setInterval(function(){
      if (snapshot()) { paint(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_COCKPIT = { repaint: paint };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
