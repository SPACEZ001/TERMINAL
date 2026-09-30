
(function(){
  'use strict';
  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }

  var PR_LOGO = 'data:image/png;base64,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';
  window.__SPZ_PR_LOGO = PR_LOGO;  /* exposed so the Asset Analysis Log's own report generator can reuse the same site logo without duplicating this base64 blob */

  var UI = {
    eb:{en:'Admin Only',th:'เฉพาะแอดมิน'},
    h:{en:'Print Report',th:'พิมพ์รายงาน'},
    lede:{en:'Generate a professional, printable market summary straight from the live data already on this site — no limit on how many times you make one. Use it to print, or screenshot for sharing.',
          th:'สร้างรายงานสรุปตลาดแบบมืออาชีพ พร้อมพิมพ์ ตรงจากข้อมูลสดในเว็บนี้เลย ทำได้ไม่จำกัดจำนวนครั้ง ใช้พิมพ์ออกมา หรือแคปหน้าจอไปแชร์ก็ได้',
          },
    modeLbl:{en:'Report scope',th:'ขอบเขตรายงาน'},
    modeFull:{en:'Full report (everything)',th:'เต็มรูปแบบ (ทั้งหมด)'},
    modeSelect:{en:'Select stocks',th:'เลือกหุ้นเอง'},
    pickLbl:{en:'Choose which tickers to include',th:'เลือกหุ้นที่ต้องการใส่ในรายงาน'},
    searchPh:{en:'Search ticker or company name…',th:'ค้นหาชื่อหุ้นหรือสัญลักษณ์…'},
    noMatch:{en:'No tickers match your search.',th:'ไม่พบหุ้นที่ตรงกับคำค้นหา'},
    selAll:{en:'Select all',th:'เลือกทั้งหมด'},
    clearAll:{en:'Clear',th:'ล้างที่เลือก'},
    printBtn:{en:'🖶 Print Report',th:'🖶 พิมพ์รายงาน'},
    /* Round S: reuses the same html2canvas -> Cloudinary -> LINE broadcast
       pipeline that Institutional Briefing uses (part-57.js), extracted
       there as window.__SPZ_sendReportImageToLine so it works against this
       page's own [data-pr="sheet"] preview instead of that page's overlay. */
    lineBtn:{en:'📱 Send to LINE',th:'📱 ส่งเข้า LINE'},
    hint:{en:'Press print, then choose "Save as PDF" (or your printer) in the dialog that opens.',
          th:'กดพิมพ์ แล้วเลือก "บันทึกเป็น PDF" (หรือเครื่องพิมพ์ของคุณ) ในหน้าต่างที่เปิดขึ้นมา'},
    brand:{en:'SPACEZ TERMINAL',th:'SPACEZ TERMINAL'},
    title:{en:'Market Summary Report',th:'รายงานสรุปภาพรวมตลาด'},
    sub:{en:'Internal / Admin Report — Not Investment Advice',th:'รายงานภายใน / เฉพาะแอดมิน — ไม่ใช่คำแนะนำการลงทุน'},
    generated:{en:'Generated',th:'สร้างเมื่อ'},
    asof:{en:'Data as of',th:'ข้อมูล ณ'},
    serial:{en:'Report ID',th:'รหัสรายงาน'},
    tapeH:{en:'Market Snapshot',th:'ภาพรวมตลาด'},
    chartSpy:{en:'S&P 500 (SPY) — 1-Year Trend',th:'S&P 500 (SPY) — แนวโน้ม 1 ปี'},
    regBreadth:{en:'% Above 200D MA',th:'% เหนือเส้นค่าเฉลี่ย 200 วัน'},
    regCurve:{en:'10Y-3M Curve',th:'ส่วนต่างผลตอบแทน 10ปี-3เดือน'},
    reg10y:{en:'US 10Y Yield',th:'ผลตอบแทนพันธบัตรสหรัฐ 10 ปี'},
    flowH:{en:'Sector Fund Flow (1-Month)',th:'เงินทุนไหลเข้า-ออกรายกลุ่มอุตสาหกรรม (1 เดือน)'},
    flowNote:{en:'Sectors ranked by 1-month price momentum — a rough read of where money has been rotating into, and out of.',
              th:'จัดอันดับกลุ่มอุตสาหกรรมตามโมเมนตัมราคาช่วง 1 เดือน — ใช้ดูคร่าวๆ ว่าเงินไหลเข้ากลุ่มไหน ไหลออกจากกลุ่มไหน'},
    ddHeading:{en:'— Stock Outlook',th:'— ภาพรวมและแนวโน้มหุ้น'},
    dd1m:{en:'1M',th:'1 เดือน'},
    dd3m:{en:'3M',th:'3 เดือน'},
    ddAboveMA:{en:'trading above its 200-day average',th:'ราคาอยู่เหนือเส้นค่าเฉลี่ย 200 วัน'},
    ddBelowMA:{en:'trading below its 200-day average',th:'ราคาอยู่ต่ำกว่าเส้นค่าเฉลี่ย 200 วัน'},
    ddSector:{en:'Sector',th:'กลุ่มอุตสาหกรรม'},
    ddInflow:{en:'seeing inflow, up',th:'มีเงินไหลเข้า ขึ้น'},
    ddOutflow:{en:'seeing outflow, down',th:'มีเงินไหลออก ลง'},
    ddNoData:{en:'Not enough live data yet to build an outlook for this ticker.',th:'ข้อมูลสดยังไม่พอสำหรับสรุปภาพรวมหุ้นตัวนี้'},
    picksH:{en:'Highlighted Opportunities',th:'หุ้นเด่นประจำรายงาน'},
    dirH:{en:'Fundamentals Reference',th:'ข้อมูลอ้างอิงพื้นฐานบริษัท'},
    colTk:{en:'Ticker',th:'สัญลักษณ์'},
    colNm:{en:'Name',th:'ชื่อบริษัท'},
    colPx:{en:'Price',th:'ราคา'},
    colChg:{en:'Chg',th:'เปลี่ยนแปลง'},
    colScore:{en:'Score',th:'คะแนน'},
    colWhy:{en:'Why it stands out',th:'จุดเด่น'},
    colPe:{en:'P/E',th:'P/E'},
    colDiv:{en:'Div Yld',th:'ปันผล'},
    colRoe:{en:'ROE',th:'ROE'},
    colDe:{en:'D/E',th:'D/E'},
    colMg:{en:'Net Mgn',th:'มาร์จิ้น'},
    colPb:{en:'P/B',th:'P/B'},
    catValue:{en:'Value',th:'คุณค่า'},
    catGrowth:{en:'Growth',th:'เติบโต'},
    catDividend:{en:'Dividend',th:'ปันผล'},
    none:{en:'No tickers selected — pick at least one above, or switch to Full report.',
          th:'ยังไม่ได้เลือกหุ้นเลย — เลือกอย่างน้อยหนึ่งตัวด้านบน หรือสลับไปโหมดเต็มรูปแบบ'},
    disclaimer:{en:'Educational content generated automatically from this site’s own live data and scoring model. Not a recommendation, solicitation, or investment advice. Figures may be delayed or incomplete versus the primary source — verify before acting. © SPACEZ TERMINAL.',
      th:'เอกสารนี้สร้างขึ้นอัตโนมัติจากข้อมูลสดและโมเดลให้คะแนนของเว็บนี้ เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำหรือการชักชวนลงทุน ตัวเลขอาจล่าช้าหรือไม่ครบถ้วนเทียบกับแหล่งข้อมูลจริง โปรดตรวจสอบก่อนตัดสินใจ © SPACEZ TERMINAL'},
    qrToggleLbl:{en:'Include final page: QR code & contact links',th:'ใส่หน้าสุดท้าย: QR Code และช่องทางติดต่อ'},
    qrHeading:{en:'Visit Us Online',th:'เยี่ยมชมเว็บไซต์ของเรา'},
    qrSub:{en:'Scan the code below to open the live terminal',th:'สแกนโค้ดด้านล่างเพื่อเปิดเว็บเทอร์มินัลแบบสด'},
    qrCaption:{en:'Scan to visit',th:'สแกนเพื่อเข้าชม'},
    qrConnect:{en:'Connect With Us',th:'ช่องทางติดต่อ'},
    fxH:{en:'Global Currency Rates (vs. USD)',th:'อัตราแลกเปลี่ยนเงินตราโลก (เทียบดอลลาร์สหรัฐ)'},
    fxNote:{en:'1 USD = shown rate, in each currency; colored figure is the 1-day change.',
            th:'1 ดอลลาร์สหรัฐ = อัตราที่แสดง ในแต่ละสกุลเงิน ตัวเลขสีคือการเปลี่ยนแปลงในรอบ 1 วัน'},
    techH:{en:'Technical Chart — Price vs. Moving Averages',th:'กราฟเทคนิค — ราคาเทียบเส้นค่าเฉลี่ยเคลื่อนที่'},
    techPrice:{en:'Price',th:'ราคา'},
    techSma50:{en:'50-Day MA',th:'ค่าเฉลี่ย 50 วัน'},
    techSma200:{en:'200-Day MA',th:'ค่าเฉลี่ย 200 วัน'},

    /* ---- Round 10: report-type selector + Gold Analysis Report ---- */
    typeLbl:{en:'Report',th:'รายงาน'},
    typeMarket:{en:'Market Summary',th:'สรุปภาพรวมตลาด'},
    typeGold:{en:'Gold Analysis',th:'วิเคราะห์ทองคำ'},
    goldTitle:{en:'Gold Market Analysis Report',th:'รายงานวิเคราะห์ตลาดทองคำ'},
    goldSub:{en:'Internal / Admin Report — Not Investment Advice',th:'รายงานภายใน / เฉพาะแอดมิน — ไม่ใช่คำแนะนำการลงทุน'},
    goldPriceH:{en:'Gold — Price & Momentum',th:'ทองคำ — ราคาและโมเมนตัม'},
    goldPriceNote:{en:'Tracked via the SPDR Gold Shares ETF (GLD), the same live feed already used elsewhere on this site — not a separate data source.',
                   th:'ติดตามผ่านกองทุน SPDR Gold Shares (GLD) ใช้ชุดข้อมูลสดชุดเดียวกับที่เว็บนี้ใช้อยู่แล้วในหน้าอื่น ไม่ได้ดึงจากแหล่งใหม่'},
    goldMacroH:{en:'Macro Backdrop — Rates & the Dollar',th:'ภาพเศรษฐกิจมหภาค — ดอกเบี้ยและดอลลาร์'},
    goldMacroNote:{en:'Gold pays no coupon, so it competes directly with yield-bearing assets and the dollar. These four series are the ones that matter most.',
                   th:'ทองคำไม่มีดอกเบี้ยจ่าย จึงแข่งขันโดยตรงกับสินทรัพย์ที่มีผลตอบแทนและกับดอลลาร์ สี่ตัวชี้วัดนี้คือตัวที่สำคัญที่สุด'},
    goldFlowH:{en:'Where the Money Is Flowing — Risk vs. Safe-Haven',th:'เงินทุนกำลังไหลไปทางไหน — สินทรัพย์เสี่ยง vs ปลอดภัย'},
    goldFlowNote:{en:'1-month momentum across the safe-haven group gold sits in, and the risk-asset group money leaves when it moves toward gold. Same asset-flow data used by the Capital Flow page.',
                  th:'โมเมนตัม 1 เดือนของกลุ่มสินทรัพย์ปลอดภัยที่ทองคำอยู่ เทียบกับกลุ่มสินทรัพย์เสี่ยงที่เงินมักไหลออกเมื่อไหลเข้าทองคำ ใช้ข้อมูลชุดเดียวกับหน้ากระแสเงินทุน'},
    goldForecastH:{en:'Outlook & What Could Change It',th:'มุมมองไปข้างหน้า และอะไรจะเปลี่ยนมัน'},
    goldForecastLede:{en:'Built live from the drivers below, not a fixed script — the read updates automatically as these numbers move.',
                       th:'ประเมินสดจากตัวชี้วัดด้านล่าง ไม่ใช่บทที่เขียนตายตัว — มุมมองนี้จะเปลี่ยนไปเองเมื่อตัวเลขเหล่านี้เปลี่ยน'},
    goldVerdictUp:{en:'Constructive for gold',th:'เอื้อต่อทองคำ'},
    goldVerdictDown:{en:'Facing headwinds',th:'เจอแรงกดดัน'},
    goldVerdictMixed:{en:'Two-sided, no clear lean',th:'สองด้าน ยังไม่ชัดเจน'},
    goldCbH:{en:'Central Banks & the Institutional View',th:'ธนาคารกลางและมุมมองนักลงทุนสถาบัน'},
    goldCbStructural:{en:'Central banks — led in recent years by emerging-market reserve managers such as China, India, Poland and Turkey — have been steady net buyers of gold, diversifying reserves away from any single currency. That is a slow-moving, structural source of demand that sits underneath day-to-day investor positioning, not a substitute for it.',
                       th:'ธนาคารกลางหลายแห่ง — โดยเฉพาะประเทศตลาดเกิดใหม่อย่างจีน อินเดีย โปแลนด์ และตุรกี — เป็นผู้ซื้อทองคำสุทธิต่อเนื่องในช่วงหลายปีที่ผ่านมา เพื่อกระจายทุนสำรองออกจากสกุลเงินใดสกุลเงินหนึ่ง นี่คือแรงซื้อเชิงโครงสร้างที่เคลื่อนไหวช้า ซ้อนอยู่ใต้การซื้อขายของนักลงทุนรายวัน ไม่ใช่ตัวแทนของมัน'},
    goldRateHikeLbl:{en:'If the policy path is still tightening:',th:'ถ้าแนวทางนโยบายยังคงตึงตัว:'},
    goldRateHikeNote:{en:'Gold pays no interest, so when real yields rise the opportunity cost of holding it goes up — and a stronger dollar makes it pricier for foreign buyers too. The exception: if hikes are racing to catch up with inflation and real yields stay negative, gold can hold up or even rise anyway.',
                       th:'ทองคำไม่มีดอกเบี้ยจ่าย เมื่อดอกเบี้ยที่แท้จริงสูงขึ้น ต้นทุนค่าเสียโอกาสจากการถือทองก็สูงขึ้นตาม และดอลลาร์ที่แข็งค่ายังทำให้ทองแพงขึ้นสำหรับผู้ซื้อต่างประเทศด้วย ข้อยกเว้นคือถ้าขึ้นดอกเบี้ยเพื่อไล่ตามเงินเฟ้อที่สูงมาก จนดอกเบี้ยที่แท้จริงยังติดลบอยู่ ทองคำก็อาจทรงตัวหรือขึ้นได้เหมือนกัน'},
    goldRateCutLbl:{en:'If the policy path is turning toward easing:',th:'ถ้าแนวทางนโยบายกำลังหันไปผ่อนคลาย:'},
    goldRateCutNote:{en:'Lower real yields shrink the opportunity cost of holding a non-yielding asset, and a weaker dollar makes gold cheaper for foreign buyers. Cuts often arrive alongside growth worries too, which adds safe-haven demand on top.',
                      th:'ดอกเบี้ยที่แท้จริงต่ำลงทำให้ต้นทุนค่าเสียโอกาสของการถือสินทรัพย์ที่ไม่มีดอกเบี้ยลดลง และดอลลาร์ที่อ่อนค่าทำให้ทองคำถูกลงสำหรับผู้ซื้อต่างประเทศ การลดดอกเบี้ยมักมาพร้อมความกังวลเรื่องเศรษฐกิจด้วย ซึ่งยิ่งเพิ่มแรงซื้อสินทรัพย์ปลอดภัย'},
    goldRiskH:{en:'Key Risks to This Read',th:'ความเสี่ยงต่อมุมมองนี้'},
    goldRisk1:{en:'A spiking VIX can also force leveraged holders to sell gold to raise cash for margin calls — a liquidity event that looks identical to safe-haven buying in the data until it reverses.',
               th:'VIX ที่พุ่งขึ้นแรงอาจทำให้ผู้ถือสถานะที่ใช้เลเวอเรจต้องขายทองคำเพื่อหาเงินสดมาวางหลักประกัน ซึ่งหน้าตาในข้อมูลจะดูเหมือนแรงซื้อสินทรัพย์ปลอดภัย จนกว่ามันจะกลับทิศ'},
    goldRisk2:{en:'This report has no live inflation print — real yields are inferred from the direction of nominal yields alone, which can mislead if inflation expectations move sharply.',
               th:'รายงานนี้ไม่มีตัวเลขเงินเฟ้อสดแบบเรียลไทม์ — ดอกเบี้ยที่แท้จริงจึงประเมินจากทิศทางของดอกเบี้ยตัวเงิน (nominal) เพียงอย่างเดียว ซึ่งอาจคลาดเคลื่อนได้ถ้าคาดการณ์เงินเฟ้อเปลี่ยนแรง'},
    goldRisk3:{en:'A single-month reading can reverse quickly. Weigh this against your own time horizon, and re-check every figure at its primary source before acting on it.',
               th:'ตัวเลขรอบเดือนเดียวพลิกกลับได้เร็ว ให้ชั่งน้ำหนักกับกรอบเวลาลงทุนของตัวเอง และตรวจทานทุกตัวเลขจากแหล่งต้นทางก่อนตัดสินใจจริง'},
    cycleH:{en:'Where We Are in the Market Cycle',th:'ตอนนี้ตลาดอยู่ตรงไหนของวัฏจักร'},
    cycleNote:{en:'A live read from breadth, the yield curve and cyclical-vs-defensive leadership — not a forecast, and it can flip within a quarter.',
               th:'ประเมินสดจากความกว้างของตลาด เส้นอัตราผลตอบแทน และการนำของหุ้นวัฏจักรเทียบหุ้นตั้งรับ — ไม่ใช่การพยากรณ์ และพลิกได้ภายในไตรมาสเดียว'},
    cycleLead:{en:'Historically leads in this phase',th:'กลุ่มที่มักนำตลาดในช่วงนี้'},
    cycleLag:{en:'Historically lags in this phase',th:'กลุ่มที่มักตามหลังในช่วงนี้'},
    glossaryH:{en:'Key Terms, Explained',th:'คำศัพท์สำคัญ อธิบายง่ายๆ'},
    glossaryNote:{en:'New to this? Start here — plain-language definitions of the figures used throughout this report.',
                  th:'เพิ่งเริ่มอ่าน? เริ่มตรงนี้ก่อน — คำอธิบายง่ายๆ ของตัวเลขที่ใช้ตลอดทั้งรายงานนี้'},

    /* ---- Round 11: real Gold / DXY technical charts + quant read ---- */
    goldChartGoldH:{en:'Gold (Futures, GC=F) — Price vs. Moving Averages',
                    th:'ทองคำ (ฟิวเจอร์ส GC=F) — ราคาเทียบเส้นค่าเฉลี่ยเคลื่อนที่'},
    goldChartDxyH:{en:'US Dollar Index (DXY) — Price vs. Moving Averages',
                   th:'ดัชนีค่าเงินดอลลาร์ (DXY) — ราคาเทียบเส้นค่าเฉลี่ยเคลื่อนที่'},
    goldChartLoading:{en:'Fetching live daily price history for this chart… if this message is still here in a printed/downloaded report, the data source did not respond in time — try generating the report again.',
                       th:'กำลังดึงข้อมูลราคารายวันสดสำหรับกราฟนี้… ถ้าข้อความนี้ยังค้างอยู่ในรายงานที่พิมพ์หรือดาวน์โหลด แปลว่าแหล่งข้อมูลตอบสนองไม่ทันเวลา ลองสร้างรายงานใหม่อีกครั้ง'},
    goldChartUnavailable:{en:'Live chart data is unavailable right now (the public data relay may be temporarily rate-limited) — try again in a moment.',
                          th:'ยังดึงข้อมูลกราฟสดไม่ได้ในตอนนี้ (relay ข้อมูลสาธารณะอาจถูกจำกัดจำนวนครั้งชั่วคราว) — ลองใหม่อีกครั้งในอีกสักครู่'},
    goldQuantH:{en:'Quantitative Read — Volatility, Correlation & Relative Strength',
                th:'มุมมองเชิงปริมาณ — ความผันผวน สหสัมพันธ์ และความแข็งแกร่งเชิงเปรียบเทียบ'},
    goldQuantNote:{en:'Computed live from the same fetched daily price history as the charts above — not pulled from any third-party analytics service.',
                   th:'คำนวณสดจากข้อมูลราคารายวันชุดเดียวกับกราฟด้านบน ไม่ได้ดึงจากบริการวิเคราะห์ภายนอกใดๆ'},
    goldQuantUnavailable:{en:'Quantitative metrics need the live price history above to load first — refresh the report in a moment.',
                          th:'ตัวชี้วัดเชิงปริมาณต้องรอให้ข้อมูลราคาสดด้านบนโหลดเสร็จก่อน — ลองรีเฟรชรายงานอีกครั้งในอีกสักครู่'},
    goldCorrIntact:{en:'The negative correlation is intact — DXY strength is still acting as a headwind for gold and DXY weakness as a tailwind, the textbook inverse relationship.',
                    th:'สหสัมพันธ์ติดลบยังคงอยู่ — DXY แข็งค่ายังกดดันทองคำ และ DXY อ่อนค่ายังหนุนทองคำ ตรงตามความสัมพันธ์สวนทางแบบตำรา'},
    goldCorrBroken:{en:'Gold and DXY have been moving together recently, breaking from their usual inverse relationship — often a sign both are being bid as safe havens at once, or that another driver (real yields, central-bank buying) currently dominates.',
                    th:'ทองคำกับ DXY เคลื่อนไหวไปทางเดียวกันในช่วงนี้ ต่างจากความสัมพันธ์สวนทางตามปกติ — มักเป็นสัญญาณว่าทั้งคู่ถูกซื้อเป็นสินทรัพย์ปลอดภัยพร้อมกัน หรือมีตัวแปรอื่น (ดอกเบี้ยที่แท้จริง แรงซื้อธนาคารกลาง) ครอบงำอยู่ในตอนนี้'},
    goldCorrMuted:{en:'The Gold–DXY relationship is muted right now — correlation is close to zero, so the dollar is not the dominant driver of gold at the moment.',
                   th:'ความสัมพันธ์ทองคำ–DXY อ่อนลงในตอนนี้ — สหสัมพันธ์ใกล้ศูนย์ แปลว่าดอลลาร์ไม่ใช่ตัวแปรหลักของทองคำในช่วงนี้'},

    /* ---- Round 12: Investment Idea Report -- a third report type, built
       entirely from signals this site already computes live (Stock Picks
       ranking + its "why" reasoning, the Market Cycle phase model, the
       Bubble Radar composite score, and the real per-stock fundamentals
       already sitting in window.__SPZ_DIR -- P/E, dividend yield, ROE,
       D/E, net margin, P/B). No figure on this report is invented for it;
       everything traces back to a page or a dataset already on the site.
       Round 13: renamed per the user's request (just wanted a title that
       says "which stocks to invest in"), reframed around long-term
       buy-and-hold reasoning with real supporting numbers shown under
       every pick, added a "when not to sell" section separating genuine
       invalidation triggers from common unfounded fears, and added an
       honestly-framed "highest market-priced growth" watchlist in place
       of a literal "future unicorn" list -- this site has no data on
       company size or listing age, so it can't identify company stage;
       what it CAN show honestly is which already-public Growth names the
       market is pricing at the richest earnings multiple right now. ---- */
    typeIdea:{en:'Alpha Picks',th:'หุ้นอัลฟ่า'},
    ideaTitle:{en:'Alpha Selection Report',th:'รายงานคัดสรรหุ้นอัลฟ่า'},
    ideaSub:{en:'Long-Term Picks Built From This Site’s Own Live Signals — Not Investment Advice',
             th:'หุ้นสำหรับถือระยะยาว สร้างจากสัญญาณสดของเว็บนี้เอง — ไม่ใช่คำแนะนำการลงทุน'},
    ideaTopH:{en:'Today’s Top-Ranked Long-Term Pick',th:'หุ้นเด่นอันดับ 1 สำหรับถือระยะยาววันนี้'},
    ideaTopLede:{en:'The highest-scoring name right now from this site’s own Stock Picks ranking model — momentum, trend, RSI and sector flow, equally weighted. A rank, not a guarantee: it can change tomorrow as the inputs move, and every name here can still lose money.',
                 th:'หุ้นที่ได้คะแนนสูงสุดตอนนี้จากโมเดลจัดอันดับ Stock Picks ของเว็บนี้เอง ให้น้ำหนักเท่ากันกับโมเมนตัม เทรนด์ RSI และกระแสเงินกลุ่มอุตสาหกรรม เป็นแค่อันดับ ไม่ใช่การการันตี พรุ่งนี้อันดับเปลี่ยนได้ตามข้อมูลที่เปลี่ยนไป และหุ้นทุกตัวในรายงานนี้ยังขาดทุนได้เสมอ'},
    ideaWhyLbl:{en:'Why it ranks here',th:'เหตุผลที่ติดอันดับ'},
    ideaHoldLbl:{en:'The case for holding long-term',th:'เหตุผลที่ควรถือระยะยาว'},
    ideaMetricsLbl:{en:'Supporting numbers — judge it yourself',th:'ตัวเลขพื้นฐานประกอบ — ไว้ตัดสินใจด้วยตัวเอง'},
    ideaNoPick:{en:'Ranking engine not ready yet — open Stock Picks once, then come back and regenerate this report.',
                th:'เครื่องมือจัดอันดับยังไม่พร้อม ลองเปิดหน้า Stock Picks ก่อนหนึ่งครั้ง แล้วค่อยกลับมาสร้างรายงานนี้ใหม่'},
    ideaOthersH:{en:'5–6 More Long-Term Candidates',th:'อีก 5–6 ตัวเลือกสำหรับถือระยะยาว'},
    /* ---- "when not to sell" ---- */
    ideaDontSellH:{en:'When Not To Sell',th:'เมื่อไหร่ไม่ควรขาย'},
    ideaDontSellLede:{en:'The hardest part of holding long-term is not buying — it’s sitting still. These two lists separate the noise that scares people into selling too early from the real signals that mean the original reason for buying no longer holds.',
                       th:'ส่วนที่ยากที่สุดของการถือระยะยาวไม่ใช่การซื้อ แต่คือการนิ่งได้ รายการทั้งสองนี้แยกความกังวลที่มักทำให้คนขายเร็วเกินไป ออกจากสัญญาณจริงที่แปลว่าเหตุผลเดิมที่ซื้อมาใช้ไม่ได้อีกต่อไป'},
    ideaFearsLbl:{en:'Common fears that usually aren’t a reason to sell',th:'ความกังวลทั่วไปที่มักไม่ใช่เหตุผลให้ขาย'},
    ideaFear1:{en:'A single red day, or a stretch of a few red days in a row — normal noise, not a trend.',
               th:'ราคาแดงวันเดียวหรือแดงต่อกันหลายวัน — เป็นความผันผวนปกติ ไม่ใช่แนวโน้ม'},
    ideaFear2:{en:'Scary headlines or political news with no direct link to this company’s own numbers.',
               th:'ข่าวการเมืองหรือข่าวน่ากลัวที่ไม่ได้เกี่ยวข้องโดยตรงกับตัวเลขของบริษัทนี้'},
    ideaFear3:{en:'A broad market pullback that drags this stock down along with almost everything else.',
               th:'ตลาดโดยรวมปรับฐาน แล้วลากหุ้นตัวนี้ลงไปด้วยพร้อมกับหุ้นเกือบทุกตัว'},
    ideaFear4:{en:'One weaker-than-expected quarter, if the multi-year trend and the fundamentals below are still intact.',
               th:'ผลประกอบการรายไตรมาสแย่กว่าคาดเพียงครั้งเดียว หากแนวโน้มระยะยาวและปัจจัยพื้นฐานด้านล่างยังคงแข็งแรงอยู่'},
    ideaTriggersLbl:{en:'Genuine signs the original thesis may be invalidated',th:'สัญญาณจริงที่บ่งบอกว่าเหตุผลเดิมอาจใช้ไม่ได้แล้ว'},
    ideaTrigger1:{en:'Price sustainably breaks below its 200-day moving average while its own sector is also losing money flow — not just one bad week.',
                  th:'ราคาหลุดต่ำกว่าเส้นค่าเฉลี่ย 200 วันอย่างต่อเนื่อง พร้อมกับกลุ่มอุตสาหกรรมของหุ้นตัวนี้มีเงินไหลออกด้วย — ไม่ใช่แค่แย่ไปสัปดาห์เดียว'},
    ideaTrigger2:{en:'The company’s own fundamentals visibly worsen: margins compress, debt-to-equity climbs sharply, or ROE falls a lot from where it sits today.',
                  th:'ปัจจัยพื้นฐานของบริษัทแย่ลงชัดเจน เช่น มาร์จิ้นบีบแคบลง หนี้สินต่อทุนพุ่งขึ้นแรง หรือ ROE ลดลงมากจากระดับปัจจุบัน'},
    ideaTrigger3:{en:'It drops out of this site’s top-ranked names for a sustained stretch, not just a single daily refresh.',
                  th:'หลุดออกจากรายชื่อหุ้นเด่นของเว็บนี้ต่อเนื่องเป็นช่วงเวลาหนึ่ง ไม่ใช่แค่รอบอัปเดตเดียว'},
    ideaTrigger4:{en:'The original reason it was picked (dividend income, or a growth story) changes materially, and the new reality no longer fits your own goal for holding it.',
                  th:'เหตุผลเดิมที่เลือกหุ้นตัวนี้ (รายได้จากปันผล หรือเรื่องราวการเติบโต) เปลี่ยนไปอย่างมีนัยสำคัญ จนไม่ตรงกับเป้าหมายการถือของคุณอีกต่อไป'},
    ideaPlaybookH:{en:'If the Cycle Shifts: A Rotation Playbook',th:'ถ้าวัฏจักรเปลี่ยน: แนวทางการหมุนเงินลงทุน'},
    ideaPlaybookLede:{en:'What has historically led and lagged in each phase of the market cycle — this is not a prediction of which phase comes next, just a reference to check against if conditions change. Today’s phase (from the same read used above) is marked.',
                       th:'กลุ่มที่มักนำและมักตามหลังในแต่ละช่วงของวัฏจักรตลาดตามข้อมูลในอดีต ไม่ใช่การทำนายว่าช่วงถัดไปจะเป็นช่วงไหน แค่เป็นข้อมูลอ้างอิงไว้เช็คหากสถานการณ์เปลี่ยน ช่วงปัจจุบัน (จากมุมมองเดียวกับด้านบน) ทำเครื่องหมายไว้ให้แล้ว'},
    ideaPlaybookNow:{en:'Today’s phase',th:'ช่วงปัจจุบัน'},
    ideaBubbleH:{en:'Risk Backdrop — Bubble Radar Score',th:'บรรยากาศความเสี่ยง — คะแนนเรดาร์ฟองสบู่'},
    ideaBubbleLede:{en:'How stretched valuations look right now by this site’s own blended signal (see the Bubble Radar page for full detail on what feeds it). A high score does not time a top — it only means more historical warning signs are lit at once.',
                    th:'ตลาดตอนนี้ "ตึง" แค่ไหนตามคะแนนรวมของเว็บนี้เอง (ดูรายละเอียดเต็มที่หน้าเรดาร์ฟองสบู่) คะแนนสูงไม่ได้แปลว่าตลาดกำลังจะกลับตัว แค่แปลว่ามีสัญญาณเตือนในอดีตติดสว่างพร้อมกันมากขึ้นเท่านั้น'},
    ideaBubbleNoData:{en:'Bubble Radar score not available yet — open the Bubble Radar page once to warm up the data, then regenerate this report.',
                       th:'ยังไม่มีคะแนนเรดาร์ฟองสบู่ ลองเปิดหน้าเรดาร์ฟองสบู่ก่อนหนึ่งครั้งเพื่อให้ข้อมูลพร้อม แล้วค่อยสร้างรายงานนี้ใหม่'},
    ideaTierRangeCol:{en:'Score range',th:'ช่วงคะแนน'},
    ideaTierLevelCol:{en:'Level',th:'ระดับ'},
    ideaTierMeansCol:{en:'What it means',th:'ความหมาย'},
    /* same four bands and wording as the live Bubble Radar page's own tier
       table (SCALE_TIERS / tierLow / tierMod / tierHigh / tierVHigh) --
       duplicated here on purpose since this print module is a separate
       scope, kept word-for-word so the two never disagree. */
    ideaTierLow:{en:'Most signals sit within normal historical ranges.',th:'สัญญาณส่วนใหญ่อยู่ในช่วงปกติของประวัติศาสตร์'},
    ideaTierMod:{en:'Some signals are stretched — common mid-cycle in a long bull run, and can stay here for years.',
                 th:'สัญญาณบางตัวเริ่มตึง — พบได้ทั่วไปในช่วงกลางวัฏจักรตลาดกระทิงยาว และอยู่ระดับนี้ได้นานเป็นปี'},
    ideaTierHigh:{en:'Most signals are stretched together — similar readings showed up before 2000 and 2007–08, but also years ahead of those peaks.',
                  th:'สัญญาณส่วนใหญ่ตึงพร้อมกัน — เคยเกิดขึ้นก่อนปี 2000 และ 2007–08 แต่ก็เคยเกิดล่วงหน้าหลายปีก่อนจุดพีคเหล่านั้นด้วยเช่นกัน'},
    ideaTierVHigh:{en:'Nearly every signal is at a historical extreme at once — rare, and has coincided with major market tops, though what followed took anywhere from months to a couple of years to unfold.',
                   th:'แทบทุกสัญญาณอยู่ในระดับสุดขั้วทางประวัติศาสตร์พร้อมกัน — เกิดขึ้นไม่บ่อย และมักเกิดพร้อมจุดสูงสุดสำคัญของตลาด แม้สิ่งที่ตามมาจะใช้เวลาตั้งแต่ไม่กี่เดือนถึงสองสามปีกว่าจะเห็นผล'},
    ideaEmergingH:{en:'Emerging Growth Watchlist',th:'หุ้นเติบโตแฝงที่น่าจับตา'},
    ideaEmergingLede:{en:'This site has no data on a company’s size or how new its listing is, so it can’t point directly at "the next unicorn". What it can show honestly: among the Growth names already on this site, these are the ones the market is currently pricing at the richest earnings multiple (P/E) — meaning investors are paying the most upfront for future growth that hasn’t shown up in profit yet. That is exactly the profile of a stock with the most room to run if the growth arrives — and the furthest to fall if it doesn’t.',
                      th:'เว็บนี้ไม่มีข้อมูลขนาดบริษัทหรือว่าหุ้นเพิ่งเข้าตลาดมานานแค่ไหน จึงไม่สามารถชี้ตัว "ยูนิคอร์นตัวต่อไป" ได้ตรงๆ สิ่งที่บอกได้อย่างตรงไปตรงมาคือ ในกลุ่มหุ้นเติบโตที่มีอยู่ในเว็บนี้ นี่คือหุ้นที่ตลาดตีมูลค่า (P/E) แพงที่สุดในตอนนี้ ซึ่งหมายความว่านักลงทุนยอมจ่ายล่วงหน้ามากที่สุดสำหรับการเติบโตในอนาคตที่ยังไม่เกิดเป็นกำไรจริง เป็นโปรไฟล์แบบเดียวกับหุ้นที่มีโอกาสวิ่งแรงถ้าการเติบโตมาถึงจริง — และก็ร่วงแรงที่สุดถ้ามันไม่มาถึง'},
    ideaEmergingNoData:{en:'Not enough live fundamental data to build this list right now.',
                         th:'ข้อมูลพื้นฐานสดยังไม่พอสำหรับสร้างรายการนี้ในตอนนี้'},

    /* ---- Round F: Announcement report ---- */
    typeAnnouncement:{en:'Announcement',th:'ประกาศ'},
    annTitle:{en:'Official Announcement',th:'ประกาศจากทีมงาน'},
    annSub:{en:'SPACEZ TERMINAL — Site Notice',th:'SPACEZ TERMINAL — แจ้งให้ทราบ'},
    annTopicLbl:{en:'Topic',th:'หัวข้อประกาศ'},
    annTopicPh:{en:'— Choose a topic —',th:'— เลือกหัวข้อ —'},
    annTopicOtherPh:{en:'Type the topic…',th:'พิมพ์หัวข้อเอง…'},
    annMsgLbl:{en:'Message',th:'ข้อความ'},
    annMsgPh:{en:'Write the announcement text…',th:'พิมพ์เนื้อหาประกาศ…'},
    annImgLbl:{en:'Attach image(s) / charts (optional)',th:'แนบรูปภาพ / กราฟ (ไม่บังคับ)'},
    annImgHint:{en:'Up to 6 images. Shown full-width in the printed report, in the order added.',
                th:'แนบได้สูงสุด 6 รูป จะแสดงเต็มความกว้างในรายงาน เรียงตามลำดับที่แนบ'},
    annImgRemove:{en:'Remove',th:'ลบ'},
    annEmpty:{en:'Choose a topic and write a message on the left to build the announcement.',
              th:'เลือกหัวข้อและพิมพ์ข้อความทางด้านซ้ายเพื่อสร้างประกาศ'},
    annTplFieldsLbl:{en:'Fill in the details below and let it write the announcement for you.',
                     th:'กรอกรายละเอียดด้านล่าง แล้วให้ระบบช่วยร่างข้อความประกาศให้'},
    annGenerateBtn:{en:'Generate announcement text',th:'สร้างข้อความประกาศอัตโนมัติ'},

    /* ---- Round F: Bubble report ---- */
    typeBubble:{en:'Bubble Report',th:'รายงานฟองสบู่'},
    bubbleRepTitle:{en:'Market Bubble / Valuation Risk Report',th:'รายงานความเสี่ยงฟองสบู่ตลาด'},
    bubbleRepSub:{en:'Composite Read Across 5 Live Signals — Not a Timing Signal',th:'สรุปจาก 5 สัญญาณสดของตลาด — ไม่ใช่สัญญาณจับจังหวะซื้อขาย'},
    bubbleRepScoreH:{en:'Bubble Score',th:'คะแนนฟองสบู่'},
    bubbleRepScoreLede:{en:'The average risk reading across the 5 signals below, each scaled 0–100% against its own historical range. A higher score means more of these signals are stretched at once — not a prediction of when, or whether, prices fall.',
                        th:'ค่าเฉลี่ยความเสี่ยงจาก 5 สัญญาณด้านล่าง แต่ละตัวปรับสเกล 0–100% เทียบกับช่วงในอดีตของตัวมันเอง คะแนนยิ่งสูงแปลว่าสัญญาณเหล่านี้ตึงพร้อมกันมากขึ้น ไม่ใช่การทำนายว่าจะร่วงเมื่อไหร่หรือจะร่วงหรือไม่'},
    bubbleRepNoData:{en:'Not enough live data to compute a score right now.',th:'ข้อมูลสดยังไม่พอสำหรับคำนวณคะแนนตอนนี้'},
    bubbleRepIndH:{en:'What It’s Measured From',th:'วัดจากอะไรบ้าง'},
    bubbleRepIndLede:{en:'Five independent signals, each with its own history of showing up before past market stress — none of them, alone or together, is a guaranteed trigger.',
                      th:'5 สัญญาณอิสระต่อกัน แต่ละตัวเคยปรากฏก่อนช่วงตลาดตึงเครียดในอดีต — ไม่มีตัวไหน ไม่ว่าจะดูเดี่ยวหรือรวมกัน ที่ยืนยันได้ว่าจะเกิดขึ้นแน่นอน'},
    colIndicator:{en:'Signal',th:'สัญญาณ'},
    colIndValue:{en:'Current reading',th:'ค่าปัจจุบัน'},
    colIndRisk:{en:'Risk',th:'ความเสี่ยง'},
    colIndMeans:{en:'What it means',th:'ความหมาย'},
    bubbleRepTierH:{en:'Score Scale',th:'มาตรวัดคะแนน'},
    bubbleRepBurstH:{en:'If a Bubble Like This Bursts',th:'ถ้าฟองสบู่แบบนี้แตก'},
    bubbleRepBurstLede:{en:'This is the historical rotation pattern from past unwinds (2000, 2008, 2022), not a prediction of this specific outcome or its timing. Names below are common real-world examples of each group, not recommendations.',
                        th:'นี่คือรูปแบบการหมุนเงินในอดีตจากการปรับฐานที่ผ่านมา (ปี 2000, 2008, 2022) ไม่ใช่การทำนายว่าจะเกิดผลแบบนี้แน่นอนหรือเมื่อไหร่ ชื่อหุ้นด้านล่างเป็นตัวอย่างที่พบได้จริงของแต่ละกลุ่ม ไม่ใช่คำแนะนำให้ซื้อ'},
    bubbleRepSoldFirstH:{en:'Usually sold first',th:'มักถูกขายก่อน'},
    bubbleRepSoldFirstD:{en:'Richly-valued growth, high-multiple tech, and stocks bought heavily on margin — the same names that led the rally tend to fall the hardest, since their price depended most on optimism continuing.',
                         th:'หุ้นเติบโตที่ตีมูลค่าแพง หุ้นเทคมัลติเปิลสูง และหุ้นที่ซื้อด้วยมาร์จิ้นจำนวนมาก — มักเป็นหุ้นกลุ่มเดียวกับที่นำตลาดขึ้น และมักร่วงแรงที่สุดด้วย เพราะราคาพึ่งพาความหวังที่จะโตต่อเนื่องมากที่สุด'},
    bubbleRepSoldFirstEx:{en:'Example: high-P/E "story" tech, speculative small caps',th:'ตัวอย่าง: หุ้นเทค "เรื่องเล่า" P/E สูง, หุ้นเล็กเก็งกำไร'},
    bubbleRepDefH:{en:'Historically falls less',th:'ในอดีตลงน้อยกว่า'},
    bubbleRepDefD:{en:'Defensive sectors — utilities, healthcare, consumer staples — sell products people need regardless of the economy, so their earnings (and prices) tend to hold up better in a downturn.',
                   th:'กลุ่มป้องกันความเสี่ยง เช่น สาธารณูปโภค สุขภาพ สินค้าอุปโภคบริโภคจำเป็น ขายสินค้าที่คนต้องใช้ไม่ว่าเศรษฐกิจจะเป็นอย่างไร กำไร (และราคาหุ้น) จึงมักทรงตัวได้ดีกว่าช่วงตลาดขาลง'},
    bubbleRepDefEx:{en:'Example sectors: Utilities (XLU), Healthcare (XLV), Consumer Staples (XLP)',th:'ตัวอย่างกลุ่ม: สาธารณูปโภค (XLU), สุขภาพ (XLV), สินค้าจำเป็น (XLP)'},
    bubbleRepSafeH:{en:'Traditional safe havens',th:'สินทรัพย์ปลอดภัยดั้งเดิม'},
    bubbleRepSafeD:{en:'Cash, high-quality government bonds and gold have historically attracted money leaving riskier assets during a sharp unwind — gold in particular has no earnings to disappoint, since it isn’t priced off any company’s results.',
                    th:'เงินสด พันธบัตรรัฐบาลคุณภาพสูง และทองคำ มักเป็นที่พักเงินที่ไหลออกจากสินทรัพย์เสี่ยงในอดีตช่วงตลาดปรับฐานแรง โดยเฉพาะทองคำที่ไม่มีกำไรบริษัทให้ผิดหวัง เพราะไม่ได้ตั้งราคาจากผลประกอบการของบริษัทใดเลย'},
    bubbleRepSafeEx:{en:'Example: gold (GLD), long-term US Treasuries (TLT)',th:'ตัวอย่าง: ทองคำ (GLD), พันธบัตรรัฐบาลสหรัฐฯ ระยะยาว (TLT)'},
    bubbleRepTrendNote:{en:'Where the cycle sits right now, for context alongside the score above:',
                        th:'วัฏจักรตลาดตอนนี้อยู่ช่วงไหน เพื่อประกอบการอ่านคะแนนด้านบน:'}
  };

  var sec = null;
  var mode = 'full';               /* 'full' | 'select' */
  var reportType = 'market';       /* 'market' | 'gold' | 'idea' | 'announcement' | 'bubble' -- which report to generate */
  var picked = {};                 /* ticker -> true, used only in 'select' mode */
  var pickQuery = '';              /* live filter text for the ticker search box */
  var styleId = 'formal';          /* fixed -- Round 8: user asked to drop the classic/technical style choices and keep formal only */
  var includeQrPage = true;        /* Round 8: optional final QR/contact page, on by default, user-toggleable */

  /* ---- Round F: Announcement report -- a predefined topic list (chosen from
     a dropdown, with a free-typed "other" escape hatch, same pattern as the
     Journal editor's asset picker), a free-text message and up to 6 attached
     images. Nothing here is persisted anywhere -- like every other report
     type, it only exists for the current print/preview session. */
  var ANNOUNCEMENT_TOPICS = [
    { id:'maintenance', en:'Scheduled maintenance / downtime', th:'ปิดปรับปรุงระบบตามกำหนด' },
    { id:'newfeature',  en:'New feature launch',               th:'เปิดตัวฟีเจอร์ใหม่' },
    { id:'membership',  en:'Membership / pricing update',      th:'ปรับปรุงแพ็กเกจ / ราคาสมาชิก' },
    { id:'riskwarn',    en:'Market risk warning',               th:'เตือนความเสี่ยงตลาด' },
    { id:'holiday',     en:'Market holiday notice',              th:'แจ้งวันหยุดตลาด' },
    { id:'datasource',  en:'Data source change',                th:'เปลี่ยน / ปรับปรุงแหล่งข้อมูล' },
    { id:'bugfix',      en:'Bug fix notice',                     th:'แจ้งแก้ไขข้อบกพร่อง' },
    { id:'event',       en:'Event / livestream announcement',    th:'ประกาศกิจกรรม / ไลฟ์สด' },
    { id:'partnership', en:'Partnership / collaboration',        th:'ความร่วมมือ / พาร์ทเนอร์' },
    { id:'policy',      en:'Policy / terms update',              th:'ปรับปรุงนโยบาย / ข้อกำหนด' },
    { id:'security',    en:'Security notice',                    th:'แจ้งเตือนด้านความปลอดภัย' },
    { id:'newasset',    en:'New market / asset added',           th:'เพิ่มตลาด / สินทรัพย์ใหม่' },
    { id:'promo',       en:'Promotion / discount',               th:'โปรโมชั่น / ส่วนลด' },
    { id:'apology',     en:'Service disruption apology',         th:'ขออภัยเรื่องระบบขัดข้อง' },
    { id:'milestone',   en:'Milestone / thank-you note',         th:'ครบรอบ / ขอบคุณผู้ติดตาม' },
    { id:'general',     en:'General announcement',               th:'ประกาศทั่วไป' },
    { id:'other',       en:'Other (type your own)',              th:'อื่นๆ (พิมพ์เอง)' }
  ];
  var annTopic = '';               /* '' = none chosen yet, else one of ANNOUNCEMENT_TOPICS' ids */
  var annTopicOther = '';          /* free-typed topic text, only used when annTopic === 'other' */
  var annMessage = '';             /* free-text announcement body */
  var annImages = [];              /* data URLs, in attach order, max ANN_MAX_IMAGES */
  var ANN_MAX_IMAGES = 6;

  /* ---- Round J: topic-specific drill-down fields that auto-generate the
     announcement body. Only the highest-value topics get a template; every
     other topic still works exactly as before (free-typed message only).
     annFieldData is keyed by topic id so switching topics and back keeps
     whatever was typed. Nothing here is persisted -- same lifetime as the
     rest of the report builder's state. */
  var ANNOUNCEMENT_TEMPLATES = {
    membership: {
      fields: [
        { key:'packageName',   type:'text', label:{en:'Package / plan name',th:'ชื่อแพ็กเกจ'}, ph:{en:'e.g. Full Access',th:'เช่น Full Access'} },
        { key:'oldPrice',      type:'text', label:{en:'Old price',th:'ราคาเดิม'}, ph:{en:'e.g. 999',th:'เช่น 999'} },
        { key:'newPrice',      type:'text', label:{en:'New price',th:'ราคาใหม่'}, ph:{en:'e.g. 1,299',th:'เช่น 1,299'} },
        { key:'effectiveDate', type:'text', label:{en:'Effective date',th:'มีผลตั้งแต่วันที่'}, ph:{en:'e.g. 1 Oct 2026',th:'เช่น 1 ต.ค. 2569'} },
        { key:'reason',        type:'text', label:{en:'Reason (optional)',th:'เหตุผล (ไม่บังคับ)'}, ph:{en:'e.g. new features added',th:'เช่น เพิ่มฟีเจอร์ใหม่'} }
      ]
    },
    maintenance: {
      fields: [
        { key:'startTime', type:'text', label:{en:'Start date & time',th:'เริ่มวันที่ / เวลา'}, ph:{en:'e.g. 28 Sep 2026, 02:00',th:'เช่น 28 ก.ย. 2569 02:00 น.'} },
        { key:'endTime',   type:'text', label:{en:'Expected end',th:'คาดว่าจะเสร็จ'}, ph:{en:'e.g. 04:00 (same day)',th:'เช่น 04:00 น. วันเดียวกัน'} },
        { key:'scope',     type:'text', label:{en:'What will be affected',th:'ส่วนที่ได้รับผลกระทบ'}, ph:{en:'e.g. login, live price feed',th:'เช่น การเข้าสู่ระบบ, ราคาสด'} }
      ]
    },
    newfeature: {
      fields: [
        { key:'featureName', type:'text',     label:{en:'Feature name',th:'ชื่อฟีเจอร์'}, ph:{} },
        { key:'summary',     type:'textarea', label:{en:'What it does',th:'ทำอะไรได้บ้าง'}, ph:{} },
        { key:'where',       type:'text',     label:{en:'Where to find it',th:'ใช้งานได้ที่ไหน'}, ph:{} }
      ]
    },
    event: {
      fields: [
        { key:'eventName', type:'text', label:{en:'Event name',th:'ชื่องาน'}, ph:{} },
        { key:'dateTime',  type:'text', label:{en:'Date & time',th:'วันและเวลา'}, ph:{} },
        { key:'where',     type:'text', label:{en:'Where (link / platform)',th:'ช่องทาง / ลิงก์'}, ph:{} }
      ]
    }
  };
  var annFieldData = {};            /* topicId -> { fieldKey: value } */

  function annGenerateText(){
    var tpl = ANNOUNCEMENT_TEMPLATES[annTopic];
    if(!tpl) return annMessage;
    var v = annFieldData[annTopic] || {};
    var g = function(k){ return (v[k] || '').trim(); };
    var lang = L();
    var out = '';
    if(annTopic === 'membership'){
      var pkg = g('packageName');
      var pkgName = pkg || (lang === 'th' ? 'แพ็กเกจสมาชิก' : 'the membership plan');
      var oldP = g('oldPrice'), newP = g('newPrice'), eff = g('effectiveDate'), reason = g('reason');
      if(lang === 'th'){
        out = 'ทีมงานขอแจ้งปรับราคา "' + pkgName + '"' +
          (oldP && newP ? ' จากเดิม ' + oldP + ' บาท เป็น ' + newP + ' บาท' : (newP ? ' เป็นราคาใหม่ ' + newP + ' บาท' : '')) +
          (eff ? ' โดยมีผลตั้งแต่วันที่ ' + eff : '') + '\n\n' +
          (reason ? 'เหตุผลของการปรับครั้งนี้: ' + reason + '\n\n' : '') +
          'สมาชิกที่ชำระเงินไว้ก่อนวันที่มีผลจะไม่ได้รับผลกระทบจากการปรับราคานี้ ขอบคุณทุกท่านที่ติดตามและสนับสนุนกันมาโดยตลอด';
      } else {
        out = 'We would like to inform you of a price update for "' + pkgName + '"' +
          (oldP && newP ? ', from ' + oldP + ' to ' + newP : (newP ? ' to ' + newP : '')) +
          (eff ? ', effective ' + eff : '') + '.\n\n' +
          (reason ? 'Reason for this update: ' + reason + '.\n\n' : '') +
          'Members who have already paid before the effective date will not be affected by this change. Thank you for your continued support.';
      }
    } else if(annTopic === 'maintenance'){
      var start = g('startTime'), end = g('endTime'), scope = g('scope');
      if(lang === 'th'){
        out = 'ระบบจะปิดปรับปรุงชั่วคราว' + (start ? ' เริ่มตั้งแต่ ' + start : '') + (end ? ' และคาดว่าจะแล้วเสร็จภายใน ' + end : '') + '\n\n' +
          (scope ? 'ในช่วงเวลาดังกล่าว ท่านอาจไม่สามารถใช้งาน: ' + scope + '\n\n' : '') +
          'ขออภัยในความไม่สะดวกที่อาจเกิดขึ้น และขอบคุณที่ให้ความเข้าใจ';
      } else {
        out = 'The system will undergo scheduled maintenance' + (start ? ' starting ' + start : '') + (end ? ', expected to finish by ' + end : '') + '.\n\n' +
          (scope ? 'During this time, the following may be unavailable: ' + scope + '.\n\n' : '') +
          'We apologize for any inconvenience and appreciate your understanding.';
      }
    } else if(annTopic === 'newfeature'){
      var fname = g('featureName'), summary = g('summary'), where = g('where');
      if(lang === 'th'){
        out = (fname ? 'ขอแนะนำฟีเจอร์ใหม่: "' + fname + '"\n\n' : 'ขอแนะนำฟีเจอร์ใหม่\n\n') +
          (summary ? summary + '\n\n' : '') +
          (where ? 'สามารถเริ่มใช้งานได้ที่: ' + where : '');
      } else {
        out = (fname ? 'Introducing a new feature: "' + fname + '"\n\n' : 'Introducing a new feature\n\n') +
          (summary ? summary + '\n\n' : '') +
          (where ? 'You can start using it here: ' + where : '');
      }
    } else if(annTopic === 'event'){
      var ename = g('eventName'), dt = g('dateTime'), ewhere = g('where');
      if(lang === 'th'){
        out = (ename ? 'ขอเชิญร่วมกิจกรรม "' + ename + '"' : 'ขอเชิญร่วมกิจกรรมพิเศษ') +
          (dt ? ' ในวันที่ ' + dt : '') + '\n\n' +
          (ewhere ? 'ช่องทางเข้าร่วม: ' + ewhere : '');
      } else {
        out = (ename ? 'You’re invited to "' + ename + '"' : 'You’re invited to a special event') +
          (dt ? ' on ' + dt : '') + '.\n\n' +
          (ewhere ? 'Join here: ' + ewhere : '');
      }
    }
    return out.trim();
  }

  /* ---- Round 10: shared beginner glossary -- exposed on window so the
     separate Compare Stocks report module (its own scope, its own i18n
     system) can render the exact same term list without duplicating the
     copy. Kept short and print-friendly; the full essay-length versions
     of these definitions already live in the on-site Learn glossary. ---- */
  if(!window.__SPZ_GLOSSARY){
    window.__SPZ_GLOSSARY = [
      { en:{t:'P/E — Price to Earnings', d:'Share price divided by profit per share. A rough answer to "how many years of today\'s profit am I paying for". Only meaningful compared with other companies in the same industry.'},
        th:{t:'P/E — ราคาต่อกำไร', d:'ราคาหุ้นหารด้วยกำไรต่อหุ้น บอกคร่าวๆ ว่า "จ่ายเงินซื้อกำไรล่วงหน้ากี่ปี" มีความหมายก็ต่อเมื่อเทียบกับบริษัทในอุตสาหกรรมเดียวกัน'} },
      { en:{t:'ROE — Return on Equity', d:'Net profit divided by shareholders\' equity. Shows how efficiently a company turns the money shareholders put in into profit — higher is generally better, but check debt levels too.'},
        th:{t:'ROE — ผลตอบแทนต่อส่วนของผู้ถือหุ้น', d:'กำไรสุทธิหารด้วยส่วนของผู้ถือหุ้น บอกว่าบริษัทใช้เงินทุนของผู้ถือหุ้นสร้างกำไรได้มีประสิทธิภาพแค่ไหน ยิ่งสูงยิ่งดี แต่ควรดูระดับหนี้ประกอบด้วย'} },
      { en:{t:'D/E — Debt to Equity', d:'Total debt divided by shareholders\' equity. Below 1.0x is generally conservative; above 2.0x means the business leans heavily on borrowed money and is more fragile in downturns.'},
        th:{t:'D/E — หนี้สินต่อทุน', d:'หนี้สินรวมหารด้วยส่วนของผู้ถือหุ้น ต่ำกว่า 1.0 เท่า ถือว่าระมัดระวัง สูงกว่า 2.0 เท่า แปลว่าธุรกิจพึ่งพาเงินกู้มาก และเปราะบางกว่าในช่วงเศรษฐกิจไม่ดี'} },
      { en:{t:'P/B — Price to Book', d:'Share price divided by book (accounting) value per share. Below 1.0x can mean the market thinks the assets are overstated or troubled; well above 1.0x is normal for profitable, asset-light businesses.'},
        th:{t:'P/B — ราคาต่อมูลค่าทางบัญชี', d:'ราคาหุ้นหารด้วยมูลค่าทางบัญชีต่อหุ้น ต่ำกว่า 1.0 เท่า อาจแปลว่าตลาดมองว่าสินทรัพย์ตีมูลค่าสูงเกินจริงหรือมีปัญหา ส่วนธุรกิจที่กำไรดีและใช้สินทรัพย์น้อยมักมีค่านี้สูงกว่า 1.0 เท่าเป็นปกติ'} },
      { en:{t:'RSI — Relative Strength Index', d:'A 0–100 momentum gauge. Above 70 is usually read as overbought, below 30 as oversold — a stretch warning, not a guaranteed reversal.'},
        th:{t:'RSI — ดัชนีความแข็งแกร่งสัมพัทธ์', d:'มาตรวัดโมเมนตัมตั้งแต่ 0–100 เกิน 70 มักตีความว่าซื้อมากเกินไป ต่ำกว่า 30 คือขายมากเกินไป เป็นสัญญาณเตือนว่าตึงเกินไป ไม่ใช่การยืนยันว่าจะกลับตัวแน่นอน'} },
      { en:{t:'Moving Average (MA50 / MA200)', d:'The average price over the last 50 or 200 trading days, smoothing out daily noise. Price above its 200-day average is the textbook definition of an uptrend; a 50-day average crossing above the 200-day is called a "golden cross".'},
        th:{t:'เส้นค่าเฉลี่ยเคลื่อนที่ (MA50 / MA200)', d:'ราคาเฉลี่ยของ 50 หรือ 200 วันทำการล่าสุด ช่วยกรองความผันผวนรายวันออก ราคาที่อยู่เหนือเส้น 200 วันถือเป็นขาขึ้นตามตำรา ส่วนเส้น 50 วันตัดขึ้นเหนือเส้น 200 วันเรียกว่า "โกลเด้นครอส"'} },
      { en:{t:'DXY — US Dollar Index', d:'Measures the dollar against a basket of major currencies. Gold and DXY usually move opposite each other, since gold is priced in dollars worldwide.'},
        th:{t:'DXY — ดัชนีค่าเงินดอลลาร์', d:'วัดค่าเงินดอลลาร์เทียบกับตะกร้าสกุลเงินหลัก ทองคำกับ DXY มักเคลื่อนไหวสวนทางกัน เพราะทองคำตั้งราคาเป็นดอลลาร์ทั่วโลก'} },
      { en:{t:'Real Yield vs. Nominal Yield', d:'The nominal yield is the interest rate printed on a bond. The real yield subtracts expected inflation from it. Gold competes with the real yield, since gold pays no interest at all.'},
        th:{t:'ดอกเบี้ยที่แท้จริง เทียบ ดอกเบี้ยตัวเงิน', d:'ดอกเบี้ยตัวเงินคืออัตราที่ระบุบนพันธบัตร ส่วนดอกเบี้ยที่แท้จริงคือดอกเบี้ยตัวเงินหักด้วยเงินเฟ้อที่คาดการณ์ไว้ ทองคำแข่งขันกับดอกเบี้ยที่แท้จริงโดยตรง เพราะทองคำไม่มีดอกเบี้ยจ่ายเลย'} },
      { en:{t:'Yield Curve (10Y–3M)', d:'The gap between the 10-year and 3-month US Treasury yields. A positive gap is normal; a negative (inverted) gap has historically preceded most US recessions, often by a year or more.'},
        th:{t:'เส้นอัตราผลตอบแทน (10ปี−3เดือน)', d:'ส่วนต่างระหว่างผลตอบแทนพันธบัตรสหรัฐอายุ 10 ปี กับ 3 เดือน ปกติจะเป็นบวก ถ้าติดลบ (กลับหัว) ในอดีตมักเกิดก่อนภาวะถดถอยของสหรัฐฯ ล่วงหน้าเป็นปีหรือมากกว่านั้น'} },
      { en:{t:'VIX & Safe-Haven Demand', d:'The VIX tracks expected S&P 500 volatility and is nicknamed the "fear gauge". When it rises sharply, investors often rotate into safe havens — gold, the dollar, long government bonds — at the expense of riskier assets.'},
        th:{t:'VIX และแรงซื้อสินทรัพย์ปลอดภัย', d:'VIX วัดความผันผวนที่คาดการณ์ไว้ของ S&P 500 มีชื่อเล่นว่า "ดัชนีความกลัว" เมื่อ VIX พุ่งขึ้นแรง นักลงทุนมักย้ายเงินเข้าสินทรัพย์ปลอดภัย เช่น ทองคำ ดอลลาร์ พันธบัตรรัฐบาลระยะยาว โดยแลกกับสินทรัพย์เสี่ยง'} }
    ];
  }

  var PR_SITE_URL = 'https://terminal.spacezblack.workers.dev/';
  var PR_IG_URL = 'https://www.instagram.com/spczterminal';
  var PR_FB_URL = 'https://www.facebook.com/share/1GBykHfZ1V/?mibextid=wwXIfr';
  var PR_IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';
  var PR_FB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 8.5H17V5h-2.5C11.6 5 10 6.6 10 9.2V11H8v3.5h2V21h3.5v-6.5H16l.6-3.5h-3.1V9.4c0-.6.3-.9 1-.9z"/></svg>';

  function allStocks(){
    var dir = window.__SPZ_DIR || {};
    var cats = [['value', UI.catValue], ['growth', UI.catGrowth], ['dividend', UI.catDividend]];
    var out = [];
    for(var i = 0; i < cats.length; i++){
      var list = dir[cats[i][0]] || [];
      for(var j = 0; j < list.length; j++) out.push({ cat:cats[i][0], catLabel:cats[i][1], s:list[j] });
    }
    return out;
  }

  function liveRow(ticker){
    try {
      var snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
      var r = snap && snap.stocks && snap.stocks[ticker];
      if(r && isNum(r.price)) return { price:r.price, chg:isNum(r.chg_pct) ? r.chg_pct : null };
    } catch(e){}
    return null;
  }

  function fmtPx(v){
    if(!isNum(v)) return '—';
    var d = v >= 1000 ? 0 : 2;
    return v.toLocaleString('en-US', { minimumFractionDigits:d, maximumFractionDigits:d });
  }
  function fmtChg(v){
    if(!isNum(v)) return '—';
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  }
  function chgCls(v){ return isNum(v) ? (v >= 0 ? 'pr-up' : 'pr-down') : ''; }

  /* ---- Round 8: real charts + fund-flow + regime, all read live from the
     same window.__SPZ_LIVE snapshot every other screen already uses (which
     carries the full data/market.json, including 2yrs of daily closes per
     ticker under snap.charts.cal[row.cal] + snap.stocks[tk].c, and the
     sector/asset flow + regime blocks). No invented numbers. ---- */
  function stockDailySeries(snap, tk, lookback){
    if(!snap || !snap.stocks || !snap.charts || !snap.charts.cal) return null;
    var row = snap.stocks[tk];
    if(!row || !row.c || !row.cal || !snap.charts.cal[row.cal]) return null;
    var days = snap.charts.cal[row.cal].split(',');
    var raw = row.c.split(',');
    var dates = [], vals = [];
    for(var i = 0; i < raw.length && i < days.length; i++){
      if(raw[i] === '') continue;
      var v = parseFloat(raw[i]);
      if(!(v > 0)) continue;
      dates.push(days[i]); vals.push(v);
    }
    if(lookback && dates.length > lookback){
      dates = dates.slice(dates.length - lookback);
      vals = vals.slice(vals.length - lookback);
    }
    return dates.length >= 2 ? { dates:dates, vals:vals } : null;
  }

  function sparkChartSVG(vals, opts){
    opts = opts || {};
    var w = opts.w || 640, h = opts.h || 108, pad = 3;
    if(!vals || vals.length < 2) return '';
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if(min === max){ min -= 1; max += 1; }
    var n = vals.length;
    var pts = [];
    for(var i = 0; i < n; i++){
      var x = pad + (i / (n - 1)) * (w - pad * 2);
      var y = pad + (1 - (vals[i] - min) / (max - min)) * (h - pad * 2);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    var lineD = 'M' + pts.join(' L');
    var areaD = lineD + ' L' + (w - pad).toFixed(1) + ',' + (h - pad).toFixed(1) +
      ' L' + pad.toFixed(1) + ',' + (h - pad).toFixed(1) + ' Z';
    var up = vals[vals.length - 1] >= vals[0];
    var color = opts.autoColor ? (up ? '#0a7f45' : '#c81e4a') : (opts.color || '#161616');
    var fill = opts.autoColor ? (up ? 'rgba(10,127,69,.08)' : 'rgba(200,30,74,.08)') : (opts.fill || 'rgba(22,22,22,.05)');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="' + h + '" preserveAspectRatio="none" class="pr-chart-svg">' +
      '<path d="' + areaD + '" fill="' + fill + '" stroke="none"></path>' +
      '<path d="' + lineD + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></path>' +
      '</svg>';
  }

  function chartBlockHTML(label, series, opts){
    if(!series) return '';
    var svg = sparkChartSVG(series.vals, opts);
    if(!svg) return '';
    var first = series.vals[0], last = series.vals[series.vals.length - 1];
    var chg = first ? ((last - first) / first * 100) : 0;
    return '<div class="pr-chart-block">' +
      '<div class="pr-chart-label"><span>' + esc(label) + '</span>' +
        '<span class="' + (chg >= 0 ? 'pr-up' : 'pr-down') + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(1) + '%</span>' +
      '</div>' +
      svg +
      '<div class="pr-chart-axis"><span>' + esc(series.dates[0]) + '</span><span>' + esc(series.dates[series.dates.length - 1]) + '</span></div>' +
    '</div>';
  }

  function marketChartHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var series = stockDailySeries(snap, 'SPY', 252);
    if(!series) return '';
    return chartBlockHTML(T(UI.chartSpy), series, { autoColor:true });
  }

  function regimeHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var r = snap && snap.regime, m = snap && snap.macro;
    if(!r && !m) return '';
    var items = [];
    if(r && isNum(r.breadth_200)) items.push([T(UI.regBreadth), r.breadth_200.toFixed(0) + '%']);
    if(m && isNum(m.vix)) items.push(['VIX', m.vix.toFixed(1)]);
    if(r && isNum(r.curve_10y_3m)) items.push([T(UI.regCurve), (r.curve_10y_3m >= 0 ? '+' : '') + r.curve_10y_3m.toFixed(2)]);
    if(m && isNum(m.us10y)) items.push([T(UI.reg10y), m.us10y.toFixed(2) + '%']);
    if(!items.length) return '';
    var cells = items.map(function(it){
      return '<div class="pr-regime-cell"><div class="pr-regime-lbl">' + esc(it[0]) + '</div><div class="pr-regime-val">' + esc(it[1]) + '</div></div>';
    }).join('');
    return '<div class="pr-regime-strip">' + cells + '</div>';
  }

  function flowRowsHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var sectors = (snap && snap.flows && snap.flows.sector) || [];
    if(!sectors.length) return '';
    var sorted = sectors.slice().sort(function(a,b){ return (b.m1 || 0) - (a.m1 || 0); });
    var maxAbs = Math.max.apply(null, sorted.map(function(s){ return Math.abs(s.m1 || 0); })) || 1;
    var rows = sorted.map(function(s){
      var pctv = s.m1 || 0;
      var wpct = Math.min(100, Math.abs(pctv) / maxAbs * 100);
      var cls = pctv >= 0 ? 'pr-flow-up' : 'pr-flow-dn';
      var name = esc(T({ en:s.en, th:s.th }));
      return '<div class="pr-flow-row">' +
        '<div class="pr-flow-name">' + name + '</div>' +
        '<div class="pr-flow-bar-wrap"><div class="pr-flow-bar ' + cls + '" style="width:' + wpct.toFixed(0) + '%"></div></div>' +
        '<div class="pr-flow-val ' + (pctv >= 0 ? 'pr-up' : 'pr-down') + '">' + (pctv >= 0 ? '+' : '') + pctv.toFixed(1) + '%</div>' +
      '</div>';
    }).join('');
    return '<div class="pr-flow-note">' + esc(T(UI.flowNote)) + '</div><div class="pr-flow-wrap">' + rows + '</div>';
  }

  function singleStockDeepDive(tk){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var row = snap && snap.stocks && snap.stocks[tk];
    var series = stockDailySeries(snap, tk, 252);
    var chart = series ? chartBlockHTML(tk, series, { autoColor:true }) : '';

    var sectorFlow = null;
    if(row && row.sector && snap && snap.flows && snap.flows.sector){
      var wanted = String(row.sector).toLowerCase();
      for(var i = 0; i < snap.flows.sector.length; i++){
        if((snap.flows.sector[i].en || '').toLowerCase() === wanted){ sectorFlow = snap.flows.sector[i]; break; }
      }
    }

    var why = [];
    try {
      if(window.__SPZ_RANK && window.__SPZ_WHY){
        var ranked = window.__SPZ_RANK({}) || [];
        for(var j = 0; j < ranked.length; j++){
          if(ranked[j].s && ranked[j].s.tk === tk){ why = window.__SPZ_WHY(ranked[j]) || []; break; }
        }
      }
    } catch(e){}

    var bits = [];
    if(row){
      if(isNum(row.m1)) bits.push(T(UI.dd1m) + ' ' + (row.m1 >= 0 ? '+' : '') + row.m1.toFixed(1) + '%');
      if(isNum(row.m3)) bits.push(T(UI.dd3m) + ' ' + (row.m3 >= 0 ? '+' : '') + row.m3.toFixed(1) + '%');
      if(isNum(row.rsi)) bits.push('RSI ' + row.rsi.toFixed(0));
      if(row.above_ma200 !== undefined) bits.push(row.above_ma200 ? T(UI.ddAboveMA) : T(UI.ddBelowMA));
    }
    if(sectorFlow && isNum(sectorFlow.m1)){
      bits.push(T(UI.ddSector) + ' (' + T({ en:sectorFlow.en, th:sectorFlow.th }) + ') ' +
        (sectorFlow.m1 >= 0 ? T(UI.ddInflow) : T(UI.ddOutflow)) + ' ' + (sectorFlow.m1 >= 0 ? '+' : '') + sectorFlow.m1.toFixed(1) + '%');
    }
    if(why.length) bits.push(why.join(' · '));
    var narrative = bits.length ? bits.join('  —  ') : T(UI.ddNoData);

    return '<div class="pr-sec-h">' + esc(tk) + ' ' + esc(T(UI.ddHeading)) + '</div>' +
      chart +
      '<div class="pr-dd-narrative">' + esc(narrative) + '</div>';
  }

  function topPicks(n){
    if(!window.__SPZ_RANK) return [];
    try {
      var out = window.__SPZ_RANK({}) || [];
      return out.slice(0, n || 6);
    } catch(e){ return []; }
  }

  function tapeHTML(){
    var rows = (window.__SPZ_HOOKS && window.__SPZ_HOOKS.tickers) || [];
    if(!rows.length) return '<div class="pr-empty">' + esc(T({en:'No ticker data yet.',th:'ยังไม่มีข้อมูลราคา'})) + '</div>';
    var out = '<div class="pr-tape">';
    for(var i = 0; i < rows.length; i++){
      var r = rows[i], sym = r[0], px = r[1], pct = r[2], up = r[3];
      out += '<div class="pr-tape-i"><b>' + esc(sym) + '</b>' +
        (isNum(px) ? fmtPx(px) + ' · ' : '') +
        '<span class="' + (up ? 'pr-up' : 'pr-down') + '">' + (up ? '▲' : '▼') + ' ' +
        esc(String(pct).replace(/^[+-]/, '')) + '</span></div>';
    }
    return out + '</div>';
  }

  function picksHTML(){
    var picks = topPicks(6);
    if(!picks.length) return '<div class="pr-empty">' + esc(T({en:'Ranking engine not ready yet — open Stock Picks once, then come back.',th:'เครื่องมือจัดอันดับยังไม่พร้อม ลองเปิดหน้า Stock Picks ก่อนแล้วค่อยกลับมา'})) + '</div>';
    var rows = '';
    for(var i = 0; i < picks.length; i++){
      var r = picks[i], s = r.s, live = liveRow(s.tk);
      var why = [];
      try { why = window.__SPZ_WHY ? window.__SPZ_WHY(r) : []; } catch(e){}
      rows += '<tr>' +
        '<td><span class="pr-tk">' + esc(s.tk) + '</span><br><span class="pr-nm">' + esc(T(s.nm)) + '</span></td>' +
        '<td>' + fmtPx(live ? live.price : null) + '</td>' +
        '<td class="' + chgCls(live ? live.chg : null) + '">' + fmtChg(live ? live.chg : null) + '</td>' +
        '<td class="pr-score">' + Math.round(r.total) + '/100</td>' +
        '<td class="pr-why">' + esc(why.join(' · ')) + '</td>' +
      '</tr>';
    }
    return '<table class="pr-table"><thead><tr>' +
      '<th>' + esc(T(UI.colTk)) + '</th><th>' + esc(T(UI.colPx)) + '</th><th>' + esc(T(UI.colChg)) + '</th>' +
      '<th>' + esc(T(UI.colScore)) + '</th><th>' + esc(T(UI.colWhy)) + '</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function dirRows(list){
    var rows = '';
    for(var i = 0; i < list.length; i++){
      var s = list[i].s, live = liveRow(s.ticker);
      rows += '<tr>' +
        '<td><span class="pr-tk">' + esc(s.ticker) + '</span><br><span class="pr-nm">' + esc(T({en:s.name_en, th:s.name_th})) + '</span></td>' +
        '<td>' + fmtPx(live ? live.price : null) + '</td>' +
        '<td class="' + chgCls(live ? live.chg : null) + '">' + fmtChg(live ? live.chg : null) + '</td>' +
        '<td>' + esc(s.pe || '—') + '</td>' +
        '<td>' + esc(s.div || s.div_en || '—') + '</td>' +
        '<td>' + esc(s.roe || '—') + '</td>' +
        '<td>' + esc(s.de_ratio || '—') + '</td>' +
        '<td>' + esc(s.net_margin ? s.net_margin + '%' : '—') + '</td>' +
        '<td>' + esc(s.pb_ratio || '—') + '</td>' +
      '</tr>';
    }
    return rows;
  }

  function dirTableHead(catLabel){
    /* the category name (Value/Growth/Dividend) is folded into <thead> itself,
       as its own full-width row, rather than a sibling div above the table --
       a <thead> is guaranteed to repeat on every printed page a long table
       spans, so this is what keeps a reader oriented ("still Dividend stocks")
       after a page break, instead of just bare column headers. */
    var catRow = catLabel ? ('<tr><th colspan="9" class="pr-cat-th">' + esc(catLabel) + '</th></tr>') : '';
    return catRow + '<tr><th>' + esc(T(UI.colTk)) + '</th><th>' + esc(T(UI.colPx)) + '</th><th>' + esc(T(UI.colChg)) + '</th>' +
      '<th>' + esc(T(UI.colPe)) + '</th><th>' + esc(T(UI.colDiv)) + '</th><th>' + esc(T(UI.colRoe)) + '</th>' +
      '<th>' + esc(T(UI.colDe)) + '</th><th>' + esc(T(UI.colMg)) + '</th><th>' + esc(T(UI.colPb)) + '</th></tr>';
  }

  function directoryHTML(){
    var all = allStocks();
    if(mode === 'select'){
      var chosen = all.filter(function(row){ return picked[row.s.ticker]; });
      if(!chosen.length) return '<div class="pr-empty">' + esc(T(UI.none)) + '</div>';
      return '<table class="pr-table"><thead>' + dirTableHead() + '</thead><tbody>' + dirRows(chosen) + '</tbody></table>';
    }
    var cats = ['value', 'growth', 'dividend'], out = '';
    for(var i = 0; i < cats.length; i++){
      var group = all.filter(function(row){ return row.cat === cats[i]; });
      if(!group.length) continue;
      out += '<table class="pr-table"><thead>' + dirTableHead(T(group[0].catLabel)) + '</thead><tbody>' + dirRows(group) + '</tbody></table>';
    }
    return out;
  }

  function serial(){
    var d = new Date();
    return 'SPZ-' + d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0') +
      '-' + String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0');
  }

  function reportHTML(){
    var now = new Date();
    var snap = null;
    try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    return '<div class="pr-sheet" data-style="' + esc(styleId) + '">' +
      '<div class="pr-head">' +
        '<img class="pr-logo" src="' + PR_LOGO + '" alt="">' +
        '<div class="pr-brand">' + esc(T(UI.brand)) + '</div>' +
        '<div class="pr-title">' + esc(T(UI.title)) + '</div>' +
        '<div class="pr-sub">' + esc(T(UI.sub)) + '</div>' +
        '<div class="pr-meta">' +
          '<span>' + esc(T(UI.generated)) + ': ' + esc(now.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US')) + '</span>' +
          '<span>' + esc(T(UI.asof)) + ': ' + esc(snap && snap.generated_at ? new Date(snap.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-US') : '—') + '</span>' +
          '<span>' + esc(T(UI.serial)) + ': ' + esc(serial()) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pr-sec-h">' + esc(T(UI.tapeH)) + '</div>' +
      tapeHTML() +
      marketChartHTML() +
      regimeHTML() +
      marketCycleHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.picksH)) + '</div>' +
      picksHTML() +
      (function(){
        var pickedTickers = Object.keys(picked).filter(function(k){ return picked[k]; });
        if(mode === 'select' && pickedTickers.length === 1){
          return singleStockDeepDive(pickedTickers[0]);
        }
        var flowBody = flowRowsHTML();
        return flowBody ? ('<div class="pr-sec-h">' + esc(T(UI.flowH)) + '</div>' + flowBody) : '';
      })() +
      '<div class="pr-sec-h">' + esc(T(UI.dirH)) + '</div>' +
      directoryHTML() +
      glossaryHTML() +
      '<div class="pr-foot">' + esc(T(UI.disclaimer)) + '</div>' +
      (function(){
        var pickedTickers = Object.keys(picked).filter(function(k){ return picked[k]; });
        if(mode === 'select' && pickedTickers.length === 1) return technicalChartHTML(pickedTickers[0]);
        return '';
      })() +
      fxGridHTML() +
      qrContactPageHTML() +
    '</div>';
  }

  function pickListHTML(){
    var all = allStocks();
    var q = pickQuery.trim().toLowerCase();
    if(q){
      all = all.filter(function(row){
        var s = row.s;
        var nm = (T({en:s.name_en, th:s.name_th}) || '').toLowerCase();
        return s.ticker.toLowerCase().indexOf(q) !== -1 || nm.indexOf(q) !== -1;
      });
    }
    if(!all.length) return '<div class="pr-empty" style="width:100%;">' + esc(T(UI.noMatch)) + '</div>';
    var out = '';
    for(var i = 0; i < all.length; i++){
      var s = all[i].s;
      out += '<span class="pr-chip' + (picked[s.ticker] ? ' on' : '') + '" data-tk="' + esc(s.ticker) + '" title="' + esc(T({en:s.name_en, th:s.name_th}) || '') + '">' + esc(s.ticker) + '</span>';
    }
    return out;
  }

  function fmtFxRate(n){
    if(n >= 100) return n.toLocaleString(undefined, { maximumFractionDigits:1, minimumFractionDigits:1 });
    if(n >= 1) return n.toFixed(3);
    return n.toFixed(4);
  }

  function fxGridHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var ccy = snap && snap.ccy;
    if(!ccy) return '';
    var codes = Object.keys(ccy).filter(function(c){ return c !== 'USD' && isNum(ccy[c] && ccy[c].rate); }).sort();
    codes.unshift('USD');
    if(codes.length < 2) return '';
    var cells = codes.map(function(code){
      var c = ccy[code] || {};
      var rate = code === 'USD' ? 1 : c.rate;
      var chg = isNum(c.d1) ? c.d1 : null;
      var chgHTML = chg === null ? '&nbsp;' :
        '<span class="' + (chg >= 0 ? 'pr-up' : 'pr-down') + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%</span>';
      return '<div class="pr-fx-cell"><div class="pr-fx-code">' + esc(code) + '</div>' +
        '<div class="pr-fx-rate">' + esc(fmtFxRate(rate)) + '</div>' +
        '<div class="pr-fx-chg">' + chgHTML + '</div></div>';
    }).join('');
    return '<div class="pr-fx-page">' +
      '<div class="pr-sec-h">' + esc(T(UI.fxH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.fxNote)) + '</div>' +
      '<div class="pr-fx-grid">' + cells + '</div>' +
      '</div>';
  }

  function sma(vals, period){
    var out = new Array(vals.length).fill(null);
    var sum = 0;
    for(var i = 0; i < vals.length; i++){
      sum += vals[i];
      if(i >= period) sum -= vals[i - period];
      if(i >= period - 1) out[i] = sum / period;
    }
    return out;
  }

  function technicalChartSVG(vals, sma50, sma200){
    var w = 640, h = 160, pad = 4;
    var all = vals.concat(sma50.filter(isNum)).concat(sma200.filter(isNum));
    if(!all.length) return '';
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    if(min === max){ min -= 1; max += 1; }
    var n = vals.length;
    function toXY(i, v){
      var x = pad + (i / (n - 1)) * (w - pad * 2);
      var y = pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }
    function pathFor(arr){
      var segs = [], cur = [];
      for(var i = 0; i < arr.length; i++){
        if(!isNum(arr[i])){
          if(cur.length > 1) segs.push('M' + cur.join(' L'));
          cur = [];
        } else {
          cur.push(toXY(i, arr[i]));
        }
      }
      if(cur.length > 1) segs.push('M' + cur.join(' L'));
      return segs.join(' ');
    }
    var priceD = pathFor(vals), sma50D = pathFor(sma50), sma200D = pathFor(sma200);
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="' + h + '" preserveAspectRatio="none" class="pr-chart-svg">';
    if(sma200D) svg += '<path d="' + sma200D + '" fill="none" stroke="#b8860b" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"></path>';
    if(sma50D) svg += '<path d="' + sma50D + '" fill="none" stroke="#1d5fbf" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"></path>';
    if(priceD) svg += '<path d="' + priceD + '" fill="none" stroke="#161616" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"></path>';
    svg += '</svg>';
    return svg;
  }

  function technicalChartHTML(tk){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var series = stockDailySeries(snap, tk, 252);
    if(!series || series.vals.length < 60) return '';
    var vals = series.vals;
    var svg = technicalChartSVG(vals, sma(vals, 50), sma(vals, 200));
    if(!svg) return '';
    return '<div class="pr-sec-h">' + esc(tk) + ' — ' + esc(T(UI.techH)) + '</div>' +
      '<div class="pr-chart-block">' + svg +
        '<div class="pr-tech-legend">' +
          '<span class="pr-tech-i"><i style="background:#161616"></i>' + esc(T(UI.techPrice)) + '</span>' +
          '<span class="pr-tech-i"><i style="background:#1d5fbf"></i>' + esc(T(UI.techSma50)) + '</span>' +
          '<span class="pr-tech-i"><i style="background:#b8860b"></i>' + esc(T(UI.techSma200)) + '</span>' +
        '</div>' +
        '<div class="pr-chart-axis"><span>' + esc(series.dates[0]) + '</span><span>' + esc(series.dates[series.dates.length - 1]) + '</span></div>' +
      '</div>';
  }

  function qrContactPageHTML(){
    if(!includeQrPage) return '';
    var svg = '';
    try {
      if(typeof qrcode === 'function'){
        var qr = qrcode(0, 'M');
        qr.addData(PR_SITE_URL);
        qr.make();
        svg = qr.createSvgTag({ cellSize:6, margin:0, scalable:true });
      }
    } catch(e){}
    return '<div class="pr-qr-page">' +
        '<img class="pr-qr-logo" src="' + PR_LOGO + '" alt="">' +
        '<div class="pr-qr-brand">' + esc(T(UI.brand)) + '</div>' +
        '<div class="pr-qr-rule"></div>' +
        '<div class="pr-qr-heading">' + esc(T(UI.qrHeading)) + '</div>' +
        '<div class="pr-qr-sub">' + esc(T(UI.qrSub)) + '</div>' +
        '<div class="pr-qr-code">' + svg + '</div>' +
        '<div class="pr-qr-caption">' + esc(T(UI.qrCaption)) + '</div>' +
        '<div class="pr-qr-url">' + esc(PR_SITE_URL) + '</div>' +
        '<div class="pr-qr-connect-lbl">' + esc(T(UI.qrConnect)) + '</div>' +
        '<div class="pr-qr-contacts">' +
          '<a class="pr-contact-btn" href="' + PR_IG_URL + '" target="_blank" rel="noopener noreferrer">' + PR_IG_ICON + '<span>Instagram</span></a>' +
          '<a class="pr-contact-btn" href="' + PR_FB_URL + '" target="_blank" rel="noopener noreferrer">' + PR_FB_ICON + '<span>Facebook</span></a>' +
        '</div>' +
      '</div>';
  }

  function fmtSigned(v, d){
    if(!isNum(v)) return '—';
    d = d === undefined ? 2 : d;
    return (v >= 0 ? '+' : '') + v.toFixed(d);
  }

  function findAssetRow(list, en){
    for(var i = 0; i < list.length; i++){ if(list[i].en === en) return list[i]; }
    return null;
  }

  /* ---- Round 10: beginner glossary page, shared by both report types ---- */
  function glossaryHTML(){
    var terms = window.__SPZ_GLOSSARY || [];
    if(!terms.length) return '';
    var cells = terms.map(function(g){
      var e = g[L()] || g.en;
      return '<div class="pr-gloss-cell"><div class="pr-gloss-t">' + esc(e.t) + '</div><div class="pr-gloss-d">' + esc(e.d) + '</div></div>';
    }).join('');
    return '<div class="pr-gloss-page">' +
      '<div class="pr-sec-h">' + esc(T(UI.glossaryH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.glossaryNote)) + '</div>' +
      '<div class="pr-gloss-grid">' + cells + '</div>' +
    '</div>';
  }

  /* ---- Round 10: Market Cycle section -- reuses the same 4-phase /
     lead-lag framework already published on the on-site Market Outlook
     page, paired with a LIVE phase read computed from snap.regime (not
     the on-site page's own hand-curated "here" field, which is an
     editorial call re-set by hand -- this one recomputes on its own
     every time the report is generated). ---- */
  var CYCLE_PHASES = [
    { id:'early', n:{en:'Early Cycle — Recovery',th:'ต้นวัฏจักร — ฟื้นตัว'},
      lead:{en:['Cyclicals','Consumer discretionary','Financials','Small caps'],th:['หุ้นวัฏจักร','สินค้าฟุ่มเฟือย','การเงิน','หุ้นเล็ก']},
      lag:{en:['Utilities','Consumer staples'],th:['สาธารณูปโภค','สินค้าจำเป็น']} },
    { id:'mid', n:{en:'Mid Cycle — Broad Expansion',th:'กลางวัฏจักร — ขยายตัวกว้าง'},
      lead:{en:['Technology','Industrials','Capital goods','Communication'],th:['เทคโนโลยี','อุตสาหกรรม','สินค้าทุน','สื่อสาร']},
      lag:{en:['Deep cyclicals','Highly leveraged names'],th:['หุ้นวัฏจักรจัด','หุ้นที่หนี้สูงมาก']} },
    { id:'late', n:{en:'Late Cycle — Costs Bite',th:'ปลายวัฏจักร — ต้นทุนเริ่มกัด'},
      lead:{en:['Energy','Materials','Healthcare','Staples'],th:['พลังงาน','วัสดุ','สุขภาพ','สินค้าจำเป็น']},
      lag:{en:['Consumer discretionary','Long-duration growth'],th:['สินค้าฟุ่มเฟือย','หุ้นเติบโตระยะยาวไกล']} },
    { id:'rec', n:{en:'Recession / Contraction Risk',th:'ความเสี่ยงถดถอย / หดตัว'},
      lead:{en:['Utilities','Staples','Healthcare','Quality balance sheets'],th:['สาธารณูปโภค','สินค้าจำเป็น','สุขภาพ','งบดุลแข็งแรง']},
      lag:{en:['Cyclicals','High debt','Unprofitable growth'],th:['หุ้นวัฏจักร','หนี้สูง','หุ้นโตที่ยังขาดทุน']} }
  ];

  function cyclePhaseFor(id){
    for(var i = 0; i < CYCLE_PHASES.length; i++){ if(CYCLE_PHASES[i].id === id) return CYCLE_PHASES[i]; }
    return CYCLE_PHASES[1];
  }

  function cycleSignal(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var r = snap && snap.regime;
    if(!r) return null;
    var score = 0, curveInv = isNum(r.curve_10y_3m) && r.curve_10y_3m < 0;
    var drivers = [];
    if(isNum(r.cyclical_vs_defensive_1m)){
      score += r.cyclical_vs_defensive_1m > 0 ? 1 : -1;
      drivers.push([T({en:'Cyclicals vs Defensives (1M)',th:'หุ้นวัฏจักร vs ตั้งรับ (1 เดือน)'}), fmtSigned(r.cyclical_vs_defensive_1m, 2) + '%']);
    }
    if(isNum(r.cyclical_vs_defensive_3m)){
      score += r.cyclical_vs_defensive_3m > 0 ? 1 : -1;
      drivers.push([T({en:'Cyclicals vs Defensives (3M)',th:'หุ้นวัฏจักร vs ตั้งรับ (3 เดือน)'}), fmtSigned(r.cyclical_vs_defensive_3m, 2) + '%']);
    }
    if(isNum(r.curve_10y_3m)){
      score += curveInv ? -2 : 1;
      drivers.push([T(UI.regCurve), fmtSigned(r.curve_10y_3m, 2)]);
    }
    if(isNum(r.breadth_200)){
      score += r.breadth_200 >= 60 ? 1 : (r.breadth_200 <= 40 ? -1 : 0);
      drivers.push([T(UI.regBreadth), r.breadth_200.toFixed(0) + '%']);
    }
    var phaseId = curveInv && score <= -1 ? 'rec' : (score >= 2 ? 'early' : score <= -2 ? 'late' : 'mid');
    return { phaseId:phaseId, drivers:drivers };
  }

  function marketCycleHTML(){
    var sig = cycleSignal();
    if(!sig) return '';
    var phase = cyclePhaseFor(sig.phaseId);
    var driverCells = sig.drivers.map(function(d){
      return '<div class="pr-regime-cell"><div class="pr-regime-lbl">' + esc(d[0]) + '</div><div class="pr-regime-val">' + esc(d[1]) + '</div></div>';
    }).join('');
    var leadList = T(phase.lead).join(' · '), lagList = T(phase.lag).join(' · ');
    return '<div class="pr-sec-h">' + esc(T(UI.cycleH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.cycleNote)) + '</div>' +
      '<div class="pr-cycle-now">' + esc(T(phase.n)) + '</div>' +
      '<div class="pr-regime-strip">' + driverCells + '</div>' +
      '<div class="pr-dd-narrative"><b>' + esc(T(UI.cycleLead)) + ':</b> ' + esc(leadList) + '<br>' +
        '<b>' + esc(T(UI.cycleLag)) + ':</b> ' + esc(lagList) + '</div>';
  }

  /* ---- Round 11: real Gold (GC=F) / DXY (DX-Y.NYB) technical charts --
     market.json carries no daily price history for either (only
     point-in-time summary stats), so this reuses the site's own existing
     Yahoo-Finance-via-CORS-proxy live-fetch module (the same one behind
     the Pro Desk "Real Data" add-on), through window.__SPZ_LIVE.historyOfRaw
     -- the "Raw" variant skips the ticker-mangling yahooSym() transform,
     which would otherwise corrupt "DX-Y.NYB" into an invalid symbol.
     The fetch is async but goldReportHTML() has to return a complete HTML
     string synchronously (for both the on-screen preview and the print
     flow), so results are cached module-side: the first render returns a
     "fetching" placeholder and fires a background fetch; once it
     resolves, renderReport() is called again so the real chart appears
     with no action needed from the user. doPrint() additionally waits
     (bounded) for both fetches before printing the Gold report, so the
     PDF captures the real chart rather than a permanent placeholder. A
     fetch that ultimately fails renders a plain "unavailable" line --
     never a fabricated chart. ---- */
  var histCache = {};   /* sym -> {pending:true} | {series:{dates,vals}} | {failed:true} */

  function rowsToSeries(rows, lookback){
    if(!rows || rows.length < 2) return null;
    var dates = [], vals = [];
    for(var i = 0; i < rows.length; i++){
      if(!isNum(rows[i].c)) continue;
      dates.push(new Date(rows[i].t).toISOString().slice(0, 10));
      vals.push(rows[i].c);
    }
    if(lookback && dates.length > lookback){
      dates = dates.slice(dates.length - lookback);
      vals = vals.slice(vals.length - lookback);
    }
    return dates.length >= 2 ? { dates:dates, vals:vals } : null;
  }

  function getHistoryCached(sym){
    var slot = histCache[sym];
    if(slot) return slot;
    histCache[sym] = slot = { pending:true };
    var live = window.__SPZ_LIVE;
    if(!live || !live.historyOfRaw){ histCache[sym] = { failed:true }; return histCache[sym]; }
    live.historyOfRaw(sym, '1y', '1d').then(function(rows){
      var series = rowsToSeries(rows, 280);
      histCache[sym] = series ? { series:series } : { failed:true };
      renderReport();
    }).catch(function(){
      histCache[sym] = { failed:true };
      renderReport();
    });
    return slot;
  }

  function goldTechChartHTML(sym, titleObj){
    var slot = getHistoryCached(sym);
    var head = '<div class="pr-sec-h">' + esc(T(titleObj)) + '</div>';
    if(slot.failed) return head + '<div class="pr-empty">' + esc(T(UI.goldChartUnavailable)) + '</div>';
    if(!slot.series || slot.series.vals.length < 60) return head + '<div class="pr-empty">' + esc(T(UI.goldChartLoading)) + '</div>';
    var vals = slot.series.vals;
    var svg = technicalChartSVG(vals, sma(vals, 50), sma(vals, 200));
    if(!svg) return head + '<div class="pr-empty">' + esc(T(UI.goldChartUnavailable)) + '</div>';
    return head +
      '<div class="pr-chart-block">' + svg +
        '<div class="pr-tech-legend">' +
          '<span class="pr-tech-i"><i style="background:#161616"></i>' + esc(T(UI.techPrice)) + '</span>' +
          '<span class="pr-tech-i"><i style="background:#1d5fbf"></i>' + esc(T(UI.techSma50)) + '</span>' +
          '<span class="pr-tech-i"><i style="background:#b8860b"></i>' + esc(T(UI.techSma200)) + '</span>' +
        '</div>' +
        '<div class="pr-chart-axis"><span>' + esc(slot.series.dates[0]) + '</span><span>' + esc(slot.series.dates[slot.series.dates.length - 1]) + '</span></div>' +
      '</div>';
  }

  function chartHistoryReady(syms){
    for(var i = 0; i < syms.length; i++){
      var slot = histCache[syms[i]];
      if(!slot || slot.pending) return false;
    }
    return true;
  }

  /* ---- Round 11: quant metrics computed from the same real fetched
     series -- realized volatility, rolling Gold-DXY correlation, and
     Gold-vs-equities relative performance (SPY's series comes from
     market.json's own daily closes, already fetched elsewhere -- no
     extra network call needed for that leg). ---- */
  function logReturns(vals){
    var out = [];
    for(var i = 1; i < vals.length; i++){ if(vals[i - 1] > 0) out.push(Math.log(vals[i] / vals[i - 1])); }
    return out;
  }

  function realizedVolAnn(vals, windowN){
    if(!vals || vals.length < windowN + 1) return null;
    var rets = logReturns(vals.slice(vals.length - (windowN + 1)));
    if(rets.length < windowN * 0.8) return null;
    var mean = rets.reduce(function(a, b){ return a + b; }, 0) / rets.length;
    var variance = rets.reduce(function(a, b){ return a + (b - mean) * (b - mean); }, 0) / Math.max(1, rets.length - 1);
    return Math.sqrt(variance) * Math.sqrt(252) * 100;
  }

  function rollingCorr(a, b, windowN){
    if(!a || !b) return null;
    var n = Math.min(a.length, b.length);
    if(n < windowN + 1) return null;
    var ra = logReturns(a.slice(a.length - (windowN + 1)));
    var rb = logReturns(b.slice(b.length - (windowN + 1)));
    var m = Math.min(ra.length, rb.length);
    if(m < windowN * 0.8) return null;
    ra = ra.slice(ra.length - m); rb = rb.slice(rb.length - m);
    var ma = ra.reduce(function(x, y){ return x + y; }, 0) / m;
    var mb = rb.reduce(function(x, y){ return x + y; }, 0) / m;
    var num = 0, da = 0, db = 0;
    for(var i = 0; i < m; i++){
      num += (ra[i] - ma) * (rb[i] - mb);
      da += (ra[i] - ma) * (ra[i] - ma);
      db += (rb[i] - mb) * (rb[i] - mb);
    }
    if(da === 0 || db === 0) return null;
    return num / Math.sqrt(da * db);
  }

  function totalReturnPct(vals){
    if(!vals || vals.length < 2) return null;
    var start = vals[0], end = vals[vals.length - 1];
    return start > 0 ? (end / start - 1) * 100 : null;
  }

  function goldQuantHTML(){
    var goldSlot = histCache['GC=F'], dxySlot = histCache['DX-Y.NYB'];
    var goldVals = goldSlot && goldSlot.series ? goldSlot.series.vals : null;
    var dxyVals = dxySlot && dxySlot.series ? dxySlot.series.vals : null;
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var spySeries = stockDailySeries(snap, 'SPY', 252);
    var spyVals = spySeries ? spySeries.vals : null;

    var cells = [], corr = null;
    var vol20 = realizedVolAnn(goldVals, 20);
    if(isNum(vol20)) cells.push([T({en:'Gold 20D Realized Vol (ann.)',th:'ความผันผวนจริงทองคำ 20 วัน (ต่อปี)'}), vol20.toFixed(1) + '%']);
    corr = rollingCorr(goldVals, dxyVals, 63);
    if(isNum(corr)) cells.push([T({en:'Gold–DXY 3M Correlation',th:'สหสัมพันธ์ทองคำ–DXY 3 เดือน'}), corr.toFixed(2)]);
    var goldRet = totalReturnPct(goldVals), spyRet = totalReturnPct(spyVals);
    if(isNum(goldRet) && isNum(spyRet)) cells.push([T({en:'Gold vs S&P 500 (~1Y)',th:'ทองคำ เทียบ S&P 500 (~1 ปี)'}), fmtSigned(goldRet - spyRet, 1) + '%']);

    if(!cells.length) return '<div class="pr-empty">' + esc(T(UI.goldQuantUnavailable)) + '</div>';

    var cellsHTML = cells.map(function(c){
      return '<div class="pr-regime-cell"><div class="pr-regime-lbl">' + esc(c[0]) + '</div><div class="pr-regime-val">' + esc(c[1]) + '</div></div>';
    }).join('');
    var note = '';
    if(isNum(corr)){
      note = '<div class="pr-dd-narrative" style="margin-top:8px;">' +
        esc(corr <= -0.3 ? T(UI.goldCorrIntact) : (corr >= 0.3 ? T(UI.goldCorrBroken) : T(UI.goldCorrMuted))) +
        '</div>';
    }
    return '<div class="pr-flow-note">' + esc(T(UI.goldQuantNote)) + '</div>' +
      '<div class="pr-regime-strip">' + cellsHTML + '</div>' + note;
  }

  /* ---- Round 10: Gold Analysis Report -- built entirely from data
     already live on this site (snap.flows.asset's "Gold" / "Long
     Treasuries" / "US dollar" rows -- the exact same rows the Risk-On /
     Risk-Off Compass on the Capital Flow page already reads -- plus
     snap.macro.dxy / us10y / us3m / vix and snap.regime). No new data
     source, nothing invented; the forecast section is a transparent,
     rule-based read of those live numbers, not a fixed script, so it
     moves on its own as the numbers move. ---- */
  function goldPriceHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var list = (snap && snap.flows && snap.flows.asset) || [];
    var g = findAssetRow(list, 'Gold');
    if(!g) return '<div class="pr-empty">' + esc(T({en:'Live gold data not available right now.',th:'ยังไม่มีข้อมูลทองคำสดในตอนนี้'})) + '</div>';
    var ladder = [['1D', g.d1], ['1W', g.w1], ['1M', g.m1], ['3M', g.m3], ['6M', g.m6], ['YTD', g.ytd]];
    var valid = ladder.filter(function(x){ return isNum(x[1]); });
    var maxAbs = Math.max.apply(null, valid.map(function(x){ return Math.abs(x[1]); })) || 1;
    var rows = valid.map(function(x){
      var v = x[1], w = Math.min(100, Math.abs(v) / maxAbs * 100);
      var cls = v >= 0 ? 'pr-flow-up' : 'pr-flow-dn';
      return '<div class="pr-flow-row">' +
        '<div class="pr-flow-name">' + esc(x[0]) + '</div>' +
        '<div class="pr-flow-bar-wrap"><div class="pr-flow-bar ' + cls + '" style="width:' + w.toFixed(0) + '%"></div></div>' +
        '<div class="pr-flow-val ' + (v >= 0 ? 'pr-up' : 'pr-down') + '">' + fmtSigned(v, 1) + '%</div></div>';
    }).join('');
    var cells = [
      [T({en:'Price (GLD)',th:'ราคา (GLD)'}), '$' + fmtPx(g.price)],
      ['RSI', isNum(g.rsi) ? g.rsi.toFixed(0) : '—'],
      [T({en:'vs 50D MA',th:'เทียบ MA 50 วัน'}), isNum(g.vs_ma50) ? fmtSigned(g.vs_ma50, 1) + '%' : '—'],
      [T({en:'vs 200D MA',th:'เทียบ MA 200 วัน'}), isNum(g.vs_ma200) ? fmtSigned(g.vs_ma200, 1) + '%' : '—'],
      [T({en:'52W Range Pos.',th:'ตำแหน่งในกรอบ 52 สัปดาห์'}), isNum(g.range_pos) ? g.range_pos.toFixed(0) + '%' : '—']
    ];
    var cellsHTML = cells.map(function(c){
      return '<div class="pr-regime-cell"><div class="pr-regime-lbl">' + esc(c[0]) + '</div><div class="pr-regime-val">' + esc(c[1]) + '</div></div>';
    }).join('');
    return goldTechChartHTML('GC=F', UI.goldChartGoldH) +
      '<div class="pr-flow-note" style="margin-top:10px;">' + esc(T(UI.goldPriceNote)) + '</div>' +
      '<div class="pr-regime-strip">' + cellsHTML + '</div>' +
      '<div class="pr-flow-wrap" style="margin-top:12px;">' + rows + '</div>';
  }

  function goldMacroHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var m = snap && snap.macro, r = snap && snap.regime;
    if(!m) return '';
    var cells = [];
    if(m.dxy && isNum(m.dxy.price)) cells.push(['DXY', m.dxy.price.toFixed(2), isNum(m.dxy.m1) ? (fmtSigned(m.dxy.m1, 1) + '% (1M)') : '']);
    if(m.us10y && isNum(m.us10y.price)) cells.push([T(UI.reg10y), m.us10y.price.toFixed(2) + '%', isNum(m.us10y.m1) ? (fmtSigned(m.us10y.m1, 1) + '% (1M)') : '']);
    if(m.us3m && isNum(m.us3m.price)) cells.push([T({en:'US 3M Yield',th:'ผลตอบแทน 3 เดือนสหรัฐ'}), m.us3m.price.toFixed(2) + '%', '']);
    if(r && isNum(r.curve_10y_3m)) cells.push([T(UI.regCurve), fmtSigned(r.curve_10y_3m, 2), '']);
    var vixV = null;
    if(m){ if(isNum(m.vix)) vixV = m.vix; else if(m.vix && isNum(m.vix.price)) vixV = m.vix.price; }
    if(isNum(vixV)) cells.push(['VIX', vixV.toFixed(1), '']);
    var cellsHTML = cells.map(function(c){
      return '<div class="pr-regime-cell"><div class="pr-regime-lbl">' + esc(c[0]) + '</div><div class="pr-regime-val">' + esc(c[1]) +
        (c[2] ? ('<br><span style="font-size:8.5px;font-weight:400;color:#888;">' + esc(c[2]) + '</span>') : '') + '</div></div>';
    }).join('');
    return goldTechChartHTML('DX-Y.NYB', UI.goldChartDxyH) +
      (cells.length ? ('<div class="pr-flow-note" style="margin-top:10px;">' + esc(T(UI.goldMacroNote)) + '</div>' +
      '<div class="pr-regime-strip">' + cellsHTML + '</div>') : '');
  }

  function goldFlowHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var list = (snap && snap.flows && snap.flows.asset) || [];
    if(!list.length) return '';
    var wanted = ['Gold', 'Long Treasuries', 'US dollar', 'US tech / Nasdaq', 'Emerging markets', 'US small cap', 'High-yield credit'];
    var rows = wanted.map(function(en){ return findAssetRow(list, en); }).filter(function(row){ return row && isNum(row.m1); });
    if(!rows.length) return '';
    var maxAbs = Math.max.apply(null, rows.map(function(row){ return Math.abs(row.m1); })) || 1;
    var rowsHTML = rows.map(function(row){
      var v = row.m1, w = Math.min(100, Math.abs(v) / maxAbs * 100);
      var cls = v >= 0 ? 'pr-flow-up' : 'pr-flow-dn';
      var name = esc(T({en:row.en, th:row.th}));
      return '<div class="pr-flow-row">' +
        '<div class="pr-flow-name">' + name + '</div>' +
        '<div class="pr-flow-bar-wrap"><div class="pr-flow-bar ' + cls + '" style="width:' + w.toFixed(0) + '%"></div></div>' +
        '<div class="pr-flow-val ' + (v >= 0 ? 'pr-up' : 'pr-down') + '">' + fmtSigned(v, 1) + '%</div></div>';
    }).join('');
    return '<div class="pr-flow-note">' + esc(T(UI.goldFlowNote)) + '</div>' +
      '<div class="pr-flow-wrap">' + rowsHTML + '</div>';
  }

  function goldForecastHTML(){
    var snap; try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var m = snap && snap.macro, r = snap && snap.regime;
    var list = (snap && snap.flows && snap.flows.asset) || [];
    if(!m && !r) return '';
    var score = 0, bullets = [];

    if(m && m.dxy && isNum(m.dxy.m1)){
      var dxyM1 = m.dxy.m1, dxyDown = dxyM1 < 0;
      score += dxyDown ? 1 : -1;
      bullets.push((dxyDown ? '▲ ' : '▼ ') + T({
        en:'DXY has ' + (dxyDown ? 'fallen' : 'risen') + ' ' + Math.abs(dxyM1).toFixed(1) + '% over 1 month — a ' + (dxyDown ? 'weaker' : 'stronger') + ' dollar is typically a ' + (dxyDown ? 'tailwind' : 'headwind') + ' for dollar-priced gold.',
        th:'DXY ' + (dxyDown ? 'อ่อนค่าลง' : 'แข็งค่าขึ้น') + ' ' + Math.abs(dxyM1).toFixed(1) + '% ในรอบ 1 เดือน — ดอลลาร์ที่' + (dxyDown ? 'อ่อนค่า' : 'แข็งค่า') + 'มักเป็น' + (dxyDown ? 'แรงหนุน' : 'แรงกดดัน') + 'ต่อทองคำซึ่งตั้งราคาเป็นดอลลาร์'
      }));
    }
    if(m && m.us10y && isNum(m.us10y.m1) && isNum(m.us10y.price)){
      var y10m1 = m.us10y.m1, y10Down = y10m1 < 0;
      score += y10Down ? 1 : -1;
      bullets.push((y10Down ? '▲ ' : '▼ ') + T({
        en:'The US 10-year yield is at ' + m.us10y.price.toFixed(2) + '% and has ' + (y10Down ? 'fallen' : 'risen') + ' ' + Math.abs(y10m1).toFixed(1) + '% over the past month — ' + (y10Down ? 'falling yields lower' : 'rising yields raise') + ' the opportunity cost of holding non-yielding gold.',
        th:'ผลตอบแทนพันธบัตรสหรัฐ 10 ปี อยู่ที่ ' + m.us10y.price.toFixed(2) + '% และ' + (y10Down ? 'ลดลง' : 'เพิ่มขึ้น') + ' ' + Math.abs(y10m1).toFixed(1) + '% ในรอบ 1 เดือน — ดอกเบี้ยที่' + (y10Down ? 'ลดลงช่วยลด' : 'เพิ่มขึ้นเพิ่ม') + 'ต้นทุนค่าเสียโอกาสของการถือทองคำที่ไม่มีดอกเบี้ย'
      }));
    }
    var curveInv = r && isNum(r.curve_10y_3m) && r.curve_10y_3m < 0;
    if(r && isNum(r.curve_10y_3m)){
      score += curveInv ? 1 : 0;
      bullets.push((curveInv ? '▲ ' : '· ') + T({
        en:'The 10Y-3M yield curve is ' + (curveInv ? ('inverted at ' + r.curve_10y_3m.toFixed(2) + ' — historically a recession-risk signal that supports safe-haven demand') : ('positive at +' + r.curve_10y_3m.toFixed(2) + ', a normal shape that does not by itself argue for safe-haven flows')) + '.',
        th:'เส้นอัตราผลตอบแทน 10ปี-3เดือน ' + (curveInv ? ('กลับหัวที่ ' + r.curve_10y_3m.toFixed(2) + ' — ในอดีตเป็นสัญญาณความเสี่ยงถดถอยที่หนุนแรงซื้อสินทรัพย์ปลอดภัย') : ('เป็นบวกที่ +' + r.curve_10y_3m.toFixed(2) + ' รูปทรงปกติ ไม่ได้บ่งชี้แรงซื้อสินทรัพย์ปลอดภัยด้วยตัวเอง'))
      }));
    }
    var vixV = null;
    if(m){ if(isNum(m.vix)) vixV = m.vix; else if(m.vix && isNum(m.vix.price)) vixV = m.vix.price; }
    var vixRow = findAssetRow(list, 'Volatility (VIX)');
    var vixM1 = vixRow && isNum(vixRow.m1) ? vixRow.m1 : null;
    if(isNum(vixV) && isNum(vixM1)){
      score += vixM1 > 0 ? 1 : -1;
      bullets.push((vixM1 > 0 ? '▲ ' : '▼ ') + T({
        en:'VIX is at ' + vixV.toFixed(1) + ' and ' + (vixM1 > 0 ? 'rising' : 'falling') + ' (' + fmtSigned(vixM1, 1) + '% over 1 month) — ' + (vixM1 > 0 ? 'a firming fear gauge tends to pull money toward gold' : 'a calming fear gauge tends to reduce urgency for safe havens') + '.',
        th:'VIX อยู่ที่ ' + vixV.toFixed(1) + ' และกำลัง' + (vixM1 > 0 ? 'สูงขึ้น' : 'ลดลง') + ' (' + fmtSigned(vixM1, 1) + '% ในรอบ 1 เดือน) — ' + (vixM1 > 0 ? 'ดัชนีความกลัวที่สูงขึ้นมักดึงเงินเข้าหาทองคำ' : 'ดัชนีความกลัวที่สงบลงมักลดความเร่งด่วนของแรงซื้อสินทรัพย์ปลอดภัย')
      }));
    }
    if(r && isNum(r.cyclical_vs_defensive_1m)){
      var cvd = r.cyclical_vs_defensive_1m, defLead = cvd < 0;
      score += defLead ? 1 : -1;
      bullets.push((defLead ? '▲ ' : '▼ ') + T({
        en:'Defensive sectors are ' + (defLead ? 'outperforming' : 'underperforming') + ' cyclicals by ' + Math.abs(cvd).toFixed(1) + '% over 1 month — ' + (defLead ? 'a defensive tilt that usually travels with safe-haven demand' : 'a cyclical tilt that usually travels with risk-on positioning, away from gold') + '.',
        th:'หุ้นกลุ่มตั้งรับ' + (defLead ? 'ทำผลงานดีกว่า' : 'แย่กว่า') + 'หุ้นกลุ่มวัฏจักรอยู่ ' + Math.abs(cvd).toFixed(1) + '% ในรอบ 1 เดือน — ' + (defLead ? 'ภาพตั้งรับแบบนี้มักมาพร้อมแรงซื้อสินทรัพย์ปลอดภัย' : 'ภาพวัฏจักรแบบนี้มักมาพร้อมการเปิดรับความเสี่ยง ซึ่งมักหนีจากทองคำ')
      }));
    }

    var verdict = score >= 2 ? T(UI.goldVerdictUp) : (score <= -2 ? T(UI.goldVerdictDown) : T(UI.goldVerdictMixed));
    var verdictCls = score >= 2 ? 'pr-up' : (score <= -2 ? 'pr-down' : '');

    var rateNote = '';
    if(m && m.us10y && isNum(m.us10y.m1) && m.us10y.m1 > 0.5){
      rateNote = '<div class="pr-dd-narrative"><b>' + esc(T(UI.goldRateHikeLbl)) + '</b> ' + esc(T(UI.goldRateHikeNote)) + '</div>';
    } else if(m && m.us10y && isNum(m.us10y.m1) && m.us10y.m1 < -0.5){
      rateNote = '<div class="pr-dd-narrative"><b>' + esc(T(UI.goldRateCutLbl)) + '</b> ' + esc(T(UI.goldRateCutNote)) + '</div>';
    }

    return '<div class="pr-flow-note">' + esc(T(UI.goldForecastLede)) + '</div>' +
      '<div class="pr-cycle-now ' + verdictCls + '">' + esc(verdict) + '</div>' +
      bullets.map(function(b){ return '<div class="pr-dd-narrative" style="margin-top:8px;">' + esc(b) + '</div>'; }).join('') +
      rateNote;
  }

  function goldReportHTML(){
    var now = new Date();
    var snap = null;
    try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    return '<div class="pr-sheet" data-style="' + esc(styleId) + '">' +
      '<div class="pr-head">' +
        '<img class="pr-logo" src="' + PR_LOGO + '" alt="">' +
        '<div class="pr-brand">' + esc(T(UI.brand)) + '</div>' +
        '<div class="pr-title">' + esc(T(UI.goldTitle)) + '</div>' +
        '<div class="pr-sub">' + esc(T(UI.goldSub)) + '</div>' +
        '<div class="pr-meta">' +
          '<span>' + esc(T(UI.generated)) + ': ' + esc(now.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US')) + '</span>' +
          '<span>' + esc(T(UI.asof)) + ': ' + esc(snap && snap.generated_at ? new Date(snap.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-US') : '—') + '</span>' +
          '<span>' + esc(T(UI.serial)) + ': ' + esc(serial()) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pr-sec-h">' + esc(T(UI.goldPriceH)) + '</div>' +
      goldPriceHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.goldMacroH)) + '</div>' +
      goldMacroHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.goldFlowH)) + '</div>' +
      goldFlowHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.goldForecastH)) + '</div>' +
      goldForecastHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.goldQuantH)) + '</div>' +
      goldQuantHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.goldCbH)) + '</div>' +
      '<div class="pr-dd-narrative">' + esc(T(UI.goldCbStructural)) + '</div>' +
      '<div class="pr-sec-h">' + esc(T(UI.goldRiskH)) + '</div>' +
      '<div class="pr-dd-narrative">' + esc(T(UI.goldRisk1)) + '</div>' +
      '<div class="pr-dd-narrative" style="margin-top:8px;">' + esc(T(UI.goldRisk2)) + '</div>' +
      '<div class="pr-dd-narrative" style="margin-top:8px;">' + esc(T(UI.goldRisk3)) + '</div>' +
      '<div class="pr-foot">' + esc(T(UI.disclaimer)) + '</div>' +
      qrContactPageHTML() +
    '</div>';
  }

  /* ---- Round 13: real per-stock fundamentals for the Idea Report -- looks
     a ticker up in window.__SPZ_DIR (the same directory Stock Directory and
     the Market Summary report's Fundamentals Reference table already read)
     and returns its raw record, or null. No new data source. ---- */
  function dirRecordFor(tk){
    var dir = window.__SPZ_DIR || {};
    var cats = ['value', 'growth', 'dividend', 'defensive'];
    for(var c = 0; c < cats.length; c++){
      var list = dir[cats[c]] || [];
      for(var i = 0; i < list.length; i++) if(list[i].ticker === tk) return { s:list[i], cat:cats[c] };
    }
    return null;
  }

  /* the same six columns already used by the Fundamentals Reference table
     (colPe/colDiv/colRoe/colDe/colMg/colPb), rendered here as a compact
     strip so each pick's real numbers sit right under its narrative. */
  function fundMetricsStripHTML(s){
    if(!s) return '';
    var cells = [
      [T(UI.colPe), s.pe || '—'],
      [T(UI.colDiv), s.div || s.div_en || '—'],
      [T(UI.colRoe), s.roe || '—'],
      [T(UI.colDe), s.de_ratio || '—'],
      [T(UI.colMg), s.net_margin ? s.net_margin + '%' : '—'],
      [T(UI.colPb), s.pb_ratio || '—']
    ];
    return '<div class="pr-regime-strip pr-idea-metrics">' + cells.map(function(c){
      return '<div class="pr-regime-cell"><div class="pr-regime-lbl">' + esc(c[0]) + '</div><div class="pr-regime-val">' + esc(c[1]) + '</div></div>';
    }).join('') + '</div>';
  }

  /* a short, plain-language long-term-hold narrative built only from the
     real numbers in the directory record above -- no invented forecast,
     just what the dividend field and the fundamental scores already say. */
  function holdThesisHTML(s){
    if(!s) return '';
    var bits = [];
    var divTxt = s.div || null;
    if(divTxt){
      bits.push(L() === 'th'
        ? 'จ่ายปันผล ' + divTxt + ' ต่อปี — มีกระแสเงินสดกลับมาระหว่างที่ถือยาว แม้ราคาจะยังไม่ขยับตามที่หวัง'
        : 'Pays a ' + divTxt + ' annual dividend — some cash comes back while the position is held, even in a quiet stretch for the price.');
    } else {
      bits.push(L() === 'th'
        ? 'ไม่จ่ายปันผล เพราะเลือกเก็บกำไรไว้ลงทุนต่อเพื่อการเติบโต — เหมาะกับกรอบเวลาที่ยาวขึ้นและรับความผันผวนของราคาได้มากกว่า'
        : 'Pays no dividend — profit is reinvested for growth instead, which suits a longer time horizon and a higher tolerance for price swings.');
    }
    var roeN = parseFloat(s.roe), mgN = parseFloat(s.net_margin), deN = parseFloat(s.de_ratio);
    if(isNum(roeN) && roeN >= 15){
      bits.push(L() === 'th'
        ? 'ROE ' + s.roe + ' สะท้อนว่าบริษัทใช้เงินทุนของผู้ถือหุ้นสร้างกำไรได้อย่างมีประสิทธิภาพ'
        : 'An ROE of ' + s.roe + ' shows the business turns shareholder capital into profit efficiently.');
    }
    if(isNum(mgN) && mgN >= 20){
      bits.push(L() === 'th'
        ? 'มาร์จิ้นสุทธิ ' + s.net_margin + '% ถือว่าหนา ให้พื้นที่รองรับต้นทุนที่อาจเพิ่มขึ้นได้โดยไม่กระทบกำไรมากนัก'
        : 'A ' + s.net_margin + '% net margin leaves room to absorb rising costs without profit collapsing.');
    }
    if(isNum(deN) && deN <= 0.5){
      bits.push(L() === 'th'
        ? 'หนี้สินต่อทุนต่ำ (' + s.de_ratio + ' เท่า) ทำให้บริษัทมีความยืดหยุ่นทางการเงินสูงในช่วงเศรษฐกิจไม่ดี'
        : 'A low debt-to-equity ratio (' + s.de_ratio + 'x) gives the business more room to keep operating through a rough economic stretch.');
    }
    return bits.length ? '<div class="pr-dd-narrative"><b>' + esc(T(UI.ideaHoldLbl)) + ':</b> ' + esc(bits.join(' ')) + '</div>' : '';
  }

  /* the two "when not to sell" lists -- generic, evergreen guidance, not
     tied to any single ticker, so it renders once for the whole report. */
  function dontSellHTML(){
    var fears = [UI.ideaFear1, UI.ideaFear2, UI.ideaFear3, UI.ideaFear4];
    var triggers = [UI.ideaTrigger1, UI.ideaTrigger2, UI.ideaTrigger3, UI.ideaTrigger4];
    var fearsList = '<ul class="pr-idea-list">' + fears.map(function(f){ return '<li>' + esc(T(f)) + '</li>'; }).join('') + '</ul>';
    var trigList = '<ul class="pr-idea-list pr-idea-list-warn">' + triggers.map(function(t){ return '<li>' + esc(T(t)) + '</li>'; }).join('') + '</ul>';
    return '<div class="pr-sec-h">' + esc(T(UI.ideaDontSellH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.ideaDontSellLede)) + '</div>' +
      '<div class="pr-idea-dontsell-col"><b>' + esc(T(UI.ideaFearsLbl)) + '</b>' + fearsList + '</div>' +
      '<div class="pr-idea-dontsell-col warn"><b>' + esc(T(UI.ideaTriggersLbl)) + '</b>' + trigList + '</div>';
  }

  /* the Bubble Radar tier legend, word-for-word the same four bands shown
     on the live page (SCALE_TIERS), duplicated here since this print
     module is a separate scope from the Bubble Radar module. */
  function bubbleTierLegendHTML(){
    var rows = [
      ['0–35%', {en:'Low',th:'ต่ำ'}, UI.ideaTierLow],
      ['35–60%', {en:'Moderate',th:'ปานกลาง'}, UI.ideaTierMod],
      ['60–80%', {en:'High',th:'สูง'}, UI.ideaTierHigh],
      ['80–100%', {en:'Very high',th:'สูงมาก'}, UI.ideaTierVHigh]
    ];
    var body = rows.map(function(r){
      return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(T(r[1])) + '</td><td>' + esc(T(r[2])) + '</td></tr>';
    }).join('');
    return '<table class="pr-table pr-idea-tier-table"><thead><tr>' +
        '<th>' + esc(T(UI.ideaTierRangeCol)) + '</th><th>' + esc(T(UI.ideaTierLevelCol)) + '</th><th>' + esc(T(UI.ideaTierMeansCol)) + '</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table>';
  }

  /* honestly-framed "emerging growth" list: real Growth-category names,
     ranked by their real P/E (already in window.__SPZ_DIR) since a richer
     multiple is the one real, non-invented proxy this site's data has for
     "the market is pricing in a lot of future growth it hasn't proven
     yet" -- explicitly NOT a claim about company size or stage, which
     this site has no data on at all. */
  function emergingGrowthHTML(excludeTickers){
    var dir = window.__SPZ_DIR || {};
    var exclude = {};
    (excludeTickers || []).forEach(function(tk){ exclude[tk] = true; });
    var list = (dir.growth || []).filter(function(s){
      return !exclude[s.ticker] && isNum(parseFloat(s.pe));
    });
    list.sort(function(a, b){ return parseFloat(b.pe) - parseFloat(a.pe); });
    list = list.slice(0, 3);
    if(!list.length) return '<div class="pr-empty">' + esc(T(UI.ideaEmergingNoData)) + '</div>';
    var rows = list.map(function(s){
      var live = liveRow(s.ticker);
      return '<tr>' +
        '<td><span class="pr-tk">' + esc(s.ticker) + '</span><br><span class="pr-nm">' + esc(T({en:s.name_en, th:s.name_th})) + '</span></td>' +
        '<td>' + fmtPx(live ? live.price : null) + '</td>' +
        '<td class="' + chgCls(live ? live.chg : null) + '">' + fmtChg(live ? live.chg : null) + '</td>' +
        '<td>' + esc(s.pe || '—') + '</td>' +
        '<td>' + esc(s.roe || '—') + '</td>' +
        '<td>' + esc(s.net_margin ? s.net_margin + '%' : '—') + '</td>' +
      '</tr>';
    }).join('');
    return '<table class="pr-table"><thead><tr>' +
        '<th>' + esc(T(UI.colTk)) + '</th><th>' + esc(T(UI.colPx)) + '</th><th>' + esc(T(UI.colChg)) + '</th>' +
        '<th>' + esc(T(UI.colPe)) + '</th><th>' + esc(T(UI.colRoe)) + '</th><th>' + esc(T(UI.colMg)) + '</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ---- Round 12/13: Investment Idea Report -- "which stocks should I
     invest in and why" plus a cycle-based rotation reference and an
     emerging-growth watchlist, assembled purely from data this site
     already computes elsewhere (Stock Picks ranking + its own "why"
     reasoning, the real per-stock fundamentals in window.__SPZ_DIR, the
     Market Cycle phase model, the Bubble Radar composite). No new data
     source, no invented figures -- every number here already has its own
     page on the site backing it. ---- */
  function ideaReportHTML(){
    var now = new Date();
    var snap = null;
    try { snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){}
    var picks = topPicks(6);
    var topPick = picks[0];
    var pickedTickers = picks.map(function(p){ return p.s.tk; });

    var topSectionHTML;
    if(!topPick){
      topSectionHTML = '<div class="pr-empty">' + esc(T(UI.ideaNoPick)) + '</div>';
    } else {
      var tk = topPick.s.tk, live = liveRow(tk), why = [];
      try { why = window.__SPZ_WHY ? window.__SPZ_WHY(topPick) : []; } catch(e){}
      var rec = dirRecordFor(tk);
      topSectionHTML =
        '<div class="pr-idea-pick">' +
          '<div class="pr-idea-pick-head">' +
            '<span class="pr-idea-tk">' + esc(tk) + '</span>' +
            '<span class="pr-idea-nm">' + esc(T(topPick.s.nm)) + '</span>' +
            '<span class="pr-idea-score">' + Math.round(topPick.total) + '/100</span>' +
          '</div>' +
          '<div class="pr-idea-pick-px">' + fmtPx(live ? live.price : null) +
            ' <span class="' + chgCls(live ? live.chg : null) + '">' + fmtChg(live ? live.chg : null) + '</span></div>' +
          (why.length ? '<div class="pr-dd-narrative"><b>' + esc(T(UI.ideaWhyLbl)) + ':</b> ' + esc(why.join(' · ')) + '</div>' : '') +
          (rec ? holdThesisHTML(rec.s) : '') +
          (rec ? '<div class="pr-idea-metrics-lbl">' + esc(T(UI.ideaMetricsLbl)) + '</div>' + fundMetricsStripHTML(rec.s) : '') +
        '</div>' +
        singleStockDeepDive(tk);
    }

    var othersHTML = '';
    if(picks.length > 1){
      var restRows = '';
      for(var i = 1; i < picks.length; i++){
        var r = picks[i], s = r.s, lv = liveRow(s.tk), w2 = [];
        try { w2 = window.__SPZ_WHY ? window.__SPZ_WHY(r) : []; } catch(e){}
        var rrec = dirRecordFor(s.tk);
        restRows += '<tr>' +
          '<td><span class="pr-tk">' + esc(s.tk) + '</span><br><span class="pr-nm">' + esc(T(s.nm)) + '</span></td>' +
          '<td>' + fmtPx(lv ? lv.price : null) + '</td>' +
          '<td class="' + chgCls(lv ? lv.chg : null) + '">' + fmtChg(lv ? lv.chg : null) + '</td>' +
          '<td class="pr-score">' + Math.round(r.total) + '/100</td>' +
          '<td>' + (rrec ? esc(rrec.s.pe || '—') : '—') + '</td>' +
          '<td>' + (rrec ? esc(rrec.s.div || rrec.s.div_en || '—') : '—') + '</td>' +
          '<td class="pr-why">' + esc(w2.join(' · ')) + '</td>' +
        '</tr>';
      }
      othersHTML = '<div class="pr-sec-h">' + esc(T(UI.ideaOthersH)) + '</div>' +
        '<table class="pr-table"><thead><tr>' +
          '<th>' + esc(T(UI.colTk)) + '</th><th>' + esc(T(UI.colPx)) + '</th><th>' + esc(T(UI.colChg)) + '</th>' +
          '<th>' + esc(T(UI.colScore)) + '</th><th>' + esc(T(UI.colPe)) + '</th><th>' + esc(T(UI.colDiv)) + '</th><th>' + esc(T(UI.colWhy)) + '</th>' +
        '</tr></thead><tbody>' + restRows + '</tbody></table>';
    }

    var dontSellHTMLBlock = dontSellHTML();

    var cyclePlaybookHTML = (function(){
      var sig; try { sig = cycleSignal(); } catch(e){ sig = null; }
      var curId = sig ? sig.phaseId : null;
      return CYCLE_PHASES.map(function(ph){
        var isNow = ph.id === curId;
        return '<div class="pr-idea-phase' + (isNow ? ' now' : '') + '">' +
          '<div class="pr-idea-phase-name">' + esc(T(ph.n)) + (isNow ? ' — ' + esc(T(UI.ideaPlaybookNow)) : '') + '</div>' +
          '<div class="pr-dd-narrative"><b>' + esc(T(UI.cycleLead)) + ':</b> ' + esc(T(ph.lead).join(' · ')) + '<br>' +
            '<b>' + esc(T(UI.cycleLag)) + ':</b> ' + esc(T(ph.lag).join(' · ')) + '</div>' +
        '</div>';
      }).join('');
    })();

    var bubbleData = null;
    try { bubbleData = window.__SPZ_BUBBLE && window.__SPZ_BUBBLE.composite && window.__SPZ_BUBBLE.composite(); } catch(e){}
    var bubbleHTML;
    if(!bubbleData || bubbleData.composite == null){
      bubbleHTML = '<div class="pr-empty">' + esc(T(UI.ideaBubbleNoData)) + '</div>';
    } else {
      bubbleHTML =
        '<div class="pr-idea-bubble">' +
          '<span class="pr-idea-bubble-score">' + bubbleData.composite + '%</span>' +
          '<span class="pr-idea-bubble-tier">' + esc(T(bubbleData.tier)) + '</span>' +
        '</div>';
    }

    var emergingHTML = emergingGrowthHTML(pickedTickers);

    return '<div class="pr-sheet" data-style="' + esc(styleId) + '">' +
      '<div class="pr-head">' +
        '<img class="pr-logo" src="' + PR_LOGO + '" alt="">' +
        '<div class="pr-brand">' + esc(T(UI.brand)) + '</div>' +
        '<div class="pr-title">' + esc(T(UI.ideaTitle)) + '</div>' +
        '<div class="pr-sub">' + esc(T(UI.ideaSub)) + '</div>' +
        '<div class="pr-meta">' +
          '<span>' + esc(T(UI.generated)) + ': ' + esc(now.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US')) + '</span>' +
          '<span>' + esc(T(UI.asof)) + ': ' + esc(snap && snap.generated_at ? new Date(snap.generated_at).toLocaleString(L() === 'th' ? 'th-TH' : 'en-US') : '—') + '</span>' +
          '<span>' + esc(T(UI.serial)) + ': ' + esc(serial()) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pr-sec-h">' + esc(T(UI.ideaTopH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.ideaTopLede)) + '</div>' +
      topSectionHTML +
      othersHTML +
      dontSellHTMLBlock +
      '<div class="pr-sec-h">' + esc(T(UI.ideaEmergingH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.ideaEmergingLede)) + '</div>' +
      emergingHTML +
      marketCycleHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.ideaPlaybookH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.ideaPlaybookLede)) + '</div>' +
      cyclePlaybookHTML +
      '<div class="pr-sec-h">' + esc(T(UI.ideaBubbleH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.ideaBubbleLede)) + '</div>' +
      bubbleHTML +
      bubbleTierLegendHTML() +
      glossaryHTML() +
      '<div class="pr-foot">' + esc(T(UI.disclaimer)) + '</div>' +
      qrContactPageHTML() +
    '</div>';
  }

  function annTopicLabel(){
    if(annTopic === 'other') return annTopicOther.trim();
    var found = null;
    for(var i = 0; i < ANNOUNCEMENT_TOPICS.length; i++){ if(ANNOUNCEMENT_TOPICS[i].id === annTopic) found = ANNOUNCEMENT_TOPICS[i]; }
    return found ? T({en:found.en, th:found.th}) : '';
  }

  function announcementReportHTML(){
    var now = new Date();
    var topicLabel = annTopicLabel();
    var msg = annMessage.trim();
    if(!topicLabel && !msg){
      return '<div class="pr-sheet" data-style="' + esc(styleId) + '">' +
        '<div class="pr-head">' +
          '<img class="pr-logo" src="' + PR_LOGO + '" alt="">' +
          '<div class="pr-brand">' + esc(T(UI.brand)) + '</div>' +
          '<div class="pr-title">' + esc(T(UI.annTitle)) + '</div>' +
          '<div class="pr-sub">' + esc(T(UI.annSub)) + '</div>' +
        '</div>' +
        '<div class="pr-empty">' + esc(T(UI.annEmpty)) + '</div>' +
      '</div>';
    }
    var imagesHTML = annImages.length
      ? annImages.map(function(src){
          return '<div class="pr-chart-block" style="padding:6px;"><img src="' + esc(src) + '" style="display:block;width:100%;height:auto;border-radius:4px;" alt=""></div>';
        }).join('')
      : '';
    return '<div class="pr-sheet" data-style="' + esc(styleId) + '">' +
      '<div class="pr-head">' +
        '<img class="pr-logo" src="' + PR_LOGO + '" alt="">' +
        '<div class="pr-brand">' + esc(T(UI.brand)) + '</div>' +
        '<div class="pr-title">' + esc(T(UI.annTitle)) + '</div>' +
        '<div class="pr-sub">' + esc(T(UI.annSub)) + '</div>' +
        '<div class="pr-meta">' +
          '<span>' + esc(T(UI.generated)) + ': ' + esc(now.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US')) + '</span>' +
          '<span>' + esc(T(UI.serial)) + ': ' + esc(serial()) + '</span>' +
        '</div>' +
      '</div>' +
      (topicLabel ? '<div class="pr-sec-h">' + esc(topicLabel) + '</div>' : '') +
      (msg ? '<div class="pr-dd-narrative" style="white-space:pre-wrap;font-size:12px;">' + esc(msg) + '</div>' : '') +
      imagesHTML +
      '<div class="pr-foot">' + esc(T(UI.disclaimer)) + '</div>' +
      qrContactPageHTML() +
    '</div>';
  }

  function bubbleReportHTML(){
    var now = new Date();
    var comp = null;
    try { comp = window.__SPZ_BUBBLE && window.__SPZ_BUBBLE.composite && window.__SPZ_BUBBLE.composite(); } catch(e){}
    var indicators = [];
    try { indicators = (window.__SPZ_BUBBLE && window.__SPZ_BUBBLE.indicators && window.__SPZ_BUBBLE.indicators()) || []; } catch(e){}

    var scoreHTML;
    if(!comp || comp.composite == null){
      scoreHTML = '<div class="pr-empty">' + esc(T(UI.bubbleRepNoData)) + '</div>';
    } else {
      scoreHTML =
        '<div class="pr-idea-bubble">' +
          '<span class="pr-idea-bubble-score">' + comp.composite + '%</span>' +
          '<span class="pr-idea-bubble-tier">' + esc(T(comp.tier)) + '</span>' +
        '</div>';
    }

    var indRows = indicators.map(function(d){
      var riskTxt = (d.risk == null) ? '—' : Math.round(d.risk) + '%';
      return '<tr>' +
        '<td>' + esc(T(d.nm)) + '</td>' +
        '<td>' + esc(d.val == null ? '—' : d.val) + '</td>' +
        '<td>' + esc(riskTxt) + '</td>' +
        '<td class="pr-why">' + esc(T(d.expl)) + '</td>' +
      '</tr>';
    }).join('');
    var indTableHTML = indicators.length
      ? '<table class="pr-table"><thead><tr>' +
          '<th>' + esc(T(UI.colIndicator)) + '</th><th>' + esc(T(UI.colIndValue)) + '</th>' +
          '<th>' + esc(T(UI.colIndRisk)) + '</th><th>' + esc(T(UI.colIndMeans)) + '</th>' +
        '</tr></thead><tbody>' + indRows + '</tbody></table>'
      : '<div class="pr-empty">' + esc(T(UI.bubbleRepNoData)) + '</div>';

    function rotationCol(headKey, bodyKey, exKey){
      return '<div class="pr-idea-phase">' +
        '<div class="pr-idea-phase-name">' + esc(T(UI[headKey])) + '</div>' +
        '<div class="pr-dd-narrative">' + esc(T(UI[bodyKey])) + '<br><i>' + esc(T(UI[exKey])) + '</i></div>' +
      '</div>';
    }

    return '<div class="pr-sheet" data-style="' + esc(styleId) + '">' +
      '<div class="pr-head">' +
        '<img class="pr-logo" src="' + PR_LOGO + '" alt="">' +
        '<div class="pr-brand">' + esc(T(UI.brand)) + '</div>' +
        '<div class="pr-title">' + esc(T(UI.bubbleRepTitle)) + '</div>' +
        '<div class="pr-sub">' + esc(T(UI.bubbleRepSub)) + '</div>' +
        '<div class="pr-meta">' +
          '<span>' + esc(T(UI.generated)) + ': ' + esc(now.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US')) + '</span>' +
          '<span>' + esc(T(UI.serial)) + ': ' + esc(serial()) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pr-sec-h">' + esc(T(UI.bubbleRepScoreH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.bubbleRepScoreLede)) + '</div>' +
      scoreHTML +
      '<div class="pr-sec-h">' + esc(T(UI.bubbleRepIndH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.bubbleRepIndLede)) + '</div>' +
      indTableHTML +
      '<div class="pr-sec-h">' + esc(T(UI.bubbleRepTierH)) + '</div>' +
      bubbleTierLegendHTML() +
      '<div class="pr-sec-h">' + esc(T(UI.bubbleRepBurstH)) + '</div>' +
      '<div class="pr-flow-note">' + esc(T(UI.bubbleRepBurstLede)) + '</div>' +
      rotationCol('bubbleRepSoldFirstH', 'bubbleRepSoldFirstD', 'bubbleRepSoldFirstEx') +
      rotationCol('bubbleRepDefH', 'bubbleRepDefD', 'bubbleRepDefEx') +
      rotationCol('bubbleRepSafeH', 'bubbleRepSafeD', 'bubbleRepSafeEx') +
      '<div class="pr-flow-note" style="margin-top:10px;">' + esc(T(UI.bubbleRepTrendNote)) + '</div>' +
      marketCycleHTML() +
      '<div class="pr-foot">' + esc(T(UI.disclaimer)) + '</div>' +
      qrContactPageHTML() +
    '</div>';
  }

  function doPrint(){
    function reveal(){
      document.body.classList.add('spz-printing-report');
      var done = false;
      function cleanup(){
        if(done) return; done = true;
        document.body.classList.remove('spz-printing-report');
        window.removeEventListener('afterprint', cleanup);
      }
      window.addEventListener('afterprint', cleanup);
      setTimeout(function(){ window.print(); }, 30);
      setTimeout(cleanup, 4000);
    }
    /* Round 11: the Gold report's charts load async (live Gold/DXY price
       history via a CORS-proxied fetch) -- give them a bounded window to
       resolve first, so the printed/PDF output captures the real charts
       instead of a permanent "fetching…" placeholder. Market Summary has
       no such dependency and prints immediately as before. */
    if(reportType !== 'gold'){ reveal(); return; }
    var syms = ['GC=F', 'DX-Y.NYB'];
    syms.forEach(function(s){ getHistoryCached(s); });
    var waited = 0, step = 200, maxWait = 3500;
    (function poll(){
      if(chartHistoryReady(syms) || waited >= maxWait){
        renderReport();
        reveal();
        return;
      }
      waited += step;
      setTimeout(poll, step);
    })();
  }

  function renderReport(){
    var host = sec && sec.querySelector('[data-pr="sheet"]');
    if(!host) return;
    host.innerHTML = reportType === 'gold' ? goldReportHTML()
      : reportType === 'idea' ? ideaReportHTML()
      : reportType === 'announcement' ? announcementReportHTML()
      : reportType === 'bubble' ? bubbleReportHTML()
      : reportHTML();
  }

  function paint(){
    if(!sec) return;
    var q = function(a){ return sec.querySelector('[data-pr="' + a + '"]'); };
    if(q('eb')) q('eb').textContent = T(UI.eb);
    if(q('h')) q('h').textContent = T(UI.h);
    if(q('lede')) q('lede').textContent = T(UI.lede);
    if(q('typeLbl')) q('typeLbl').textContent = T(UI.typeLbl);
    if(q('typeMarket')) q('typeMarket').textContent = T(UI.typeMarket);
    if(q('typeGold')) q('typeGold').textContent = T(UI.typeGold);
    if(q('typeIdea')) q('typeIdea').textContent = T(UI.typeIdea);
    if(q('typeAnnouncement')) q('typeAnnouncement').textContent = T(UI.typeAnnouncement);
    if(q('typeBubble')) q('typeBubble').textContent = T(UI.typeBubble);
    if(q('annTopicLbl')) q('annTopicLbl').textContent = T(UI.annTopicLbl);
    if(q('annMsgLbl')) q('annMsgLbl').textContent = T(UI.annMsgLbl);
    if(q('annImgLbl')) q('annImgLbl').textContent = T(UI.annImgLbl);
    if(q('annImgHint')) q('annImgHint').textContent = T(UI.annImgHint);
    var annTopicSel = q('annTopicSel');
    if(annTopicSel){
      annTopicSel.innerHTML = '<option value="">' + esc(T(UI.annTopicPh)) + '</option>' +
        ANNOUNCEMENT_TOPICS.map(function(t){
          return '<option value="' + esc(t.id) + '"' + (annTopic === t.id ? ' selected' : '') + '>' + esc(T({en:t.en, th:t.th})) + '</option>';
        }).join('');
      annTopicSel.value = annTopic;
    }
    var annOtherInput = q('annTopicOtherInput');
    if(annOtherInput){
      annOtherInput.style.display = annTopic === 'other' ? '' : 'none';
      annOtherInput.placeholder = T(UI.annTopicOtherPh);
      if(document.activeElement !== annOtherInput) annOtherInput.value = annTopicOther;
    }
    var annMsgInput = q('annMsgInput');
    if(annMsgInput){
      annMsgInput.placeholder = T(UI.annMsgPh);
      if(document.activeElement !== annMsgInput) annMsgInput.value = annMessage;
    }
    var annImgList = q('annImgList');
    if(annImgList){
      annImgList.innerHTML = annImages.map(function(src, i){
        return '<div style="position:relative;width:76px;height:76px;">' +
          '<img src="' + esc(src) + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px;border:1px solid var(--border-dim);">' +
          '<button type="button" class="pr-mini" data-pr-annimg-remove="' + i + '" title="' + esc(T(UI.annImgRemove)) + '" ' +
            'style="position:absolute;top:-6px;right:-6px;padding:2px 6px;background:#1a1a1a;">×</button>' +
        '</div>';
      }).join('');
    }
    var annWrap = q('annWrap');
    if(annWrap) annWrap.style.display = reportType === 'announcement' ? '' : 'none';
    var annTplWrap = q('annTplWrap');
    var annTpl = ANNOUNCEMENT_TEMPLATES[annTopic];
    if(annTplWrap){
      annTplWrap.style.display = annTpl ? '' : 'none';
      if(annTpl){
        if(q('annTplHint')) q('annTplHint').textContent = T(UI.annTplFieldsLbl);
        var fieldsHost = q('annTplFields');
        if(fieldsHost){
          var fd = annFieldData[annTopic] || (annFieldData[annTopic] = {});
          fieldsHost.innerHTML = annTpl.fields.map(function(f){
            var lbl = esc(T(f.label));
            var ph = f.ph ? esc(T(f.ph)) : '';
            var v = esc(fd[f.key] || '');
            if(f.type === 'textarea'){
              return '<div><span class="pr-label" style="display:block;margin-bottom:4px;">' + lbl + '</span>' +
                '<textarea class="pr-search" rows="3" style="resize:vertical;" data-ann-field="' + esc(f.key) + '" placeholder="' + ph + '">' + v + '</textarea></div>';
            }
            return '<div><span class="pr-label" style="display:block;margin-bottom:4px;">' + lbl + '</span>' +
              '<input type="text" class="pr-search" data-ann-field="' + esc(f.key) + '" placeholder="' + ph + '" value="' + v + '"></div>';
          }).join('');
        }
        if(q('annGenerate')) q('annGenerate').textContent = T(UI.annGenerateBtn);
      }
    }
    if(q('modeLbl')) q('modeLbl').textContent = T(UI.modeLbl);
    if(q('modeFull')) q('modeFull').textContent = T(UI.modeFull);
    if(q('modeSelect')) q('modeSelect').textContent = T(UI.modeSelect);
    if(q('pickLbl')) q('pickLbl').textContent = T(UI.pickLbl);
    if(q('pickSearch')) q('pickSearch').placeholder = T(UI.searchPh);
    if(q('selAll')) q('selAll').textContent = T(UI.selAll);
    if(q('clearAll')) q('clearAll').textContent = T(UI.clearAll);
    if(q('printBtn')) q('printBtn').textContent = T(UI.printBtn);
    if(q('lineBtn')) q('lineBtn').textContent = T(UI.lineBtn);
    if(q('qrToggleLbl')) q('qrToggleLbl').textContent = T(UI.qrToggleLbl);
    if(q('qrToggle')) q('qrToggle').checked = includeQrPage;
    if(q('hint')) q('hint').textContent = T(UI.hint);
    var typeMarketBtn = q('typeMarket'), typeGoldBtn = q('typeGold'), typeIdeaBtn = q('typeIdea');
    var typeAnnBtn = q('typeAnnouncement'), typeBubbleBtn = q('typeBubble');
    if(typeMarketBtn) typeMarketBtn.classList.toggle('on', reportType === 'market');
    if(typeGoldBtn) typeGoldBtn.classList.toggle('on', reportType === 'gold');
    if(typeIdeaBtn) typeIdeaBtn.classList.toggle('on', reportType === 'idea');
    if(typeAnnBtn) typeAnnBtn.classList.toggle('on', reportType === 'announcement');
    if(typeBubbleBtn) typeBubbleBtn.classList.toggle('on', reportType === 'bubble');
    var modeWrap = q('modeWrap');
    if(modeWrap) modeWrap.style.display =
      (reportType === 'gold' || reportType === 'idea' || reportType === 'announcement' || reportType === 'bubble') ? 'none' : '';
    var modeFullBtn = q('modeFull'), modeSelectBtn = q('modeSelect'), pickHost = q('picklist');
    if(modeFullBtn) modeFullBtn.classList.toggle('on', mode === 'full');
    if(modeSelectBtn) modeSelectBtn.classList.toggle('on', mode === 'select');
    if(pickHost) pickHost.classList.toggle('on', mode === 'select');
    if(pickHost) pickHost.innerHTML = pickListHTML();
    renderReport();
  }

  function bind(){
    if(!sec) return;
    sec.addEventListener('click', function(ev){
      var t = ev.target;
      if(t.closest('[data-pr="typeMarket"]')){ reportType = 'market'; paint(); return; }
      if(t.closest('[data-pr="typeGold"]')){ reportType = 'gold'; paint(); return; }
      if(t.closest('[data-pr="typeIdea"]')){ reportType = 'idea'; paint(); return; }
      if(t.closest('[data-pr="typeAnnouncement"]')){ reportType = 'announcement'; paint(); return; }
      if(t.closest('[data-pr="typeBubble"]')){ reportType = 'bubble'; paint(); return; }
      if(t.closest('[data-pr="modeFull"]')){ mode = 'full'; paint(); return; }
      if(t.closest('[data-pr="modeSelect"]')){ mode = 'select'; paint(); return; }
      if(t.closest('[data-pr="selAll"]')){
        allStocks().forEach(function(row){ picked[row.s.ticker] = true; }); paint(); return;
      }
      if(t.closest('[data-pr="clearAll"]')){ picked = {}; paint(); return; }
      var chip = t.closest('.pr-chip');
      if(chip){ var tk = chip.getAttribute('data-tk'); picked[tk] = !picked[tk]; paint(); return; }
      var rmBtn = t.closest('[data-pr-annimg-remove]');
      if(rmBtn){
        var idx = parseInt(rmBtn.getAttribute('data-pr-annimg-remove'), 10);
        annImages.splice(idx, 1);
        paint();
        return;
      }
      if(t.closest('[data-pr="printBtn"]')){ doPrint(); return; }
      if(t.closest('[data-pr="lineBtn"]')){
        var lineBtnEl = t.closest('[data-pr="lineBtn"]');
        var sheetHost = sec.querySelector('[data-pr="sheet"]');
        var lineStatusEl = sec.querySelector('[data-pr="lineStatus"]');
        if(window.__SPZ_sendReportImageToLine) window.__SPZ_sendReportImageToLine(sheetHost, lineBtnEl, lineStatusEl);
        return;
      }
      if(t.closest('[data-pr="annGenerate"]')){
        annMessage = annGenerateText();
        paint();
        return;
      }
    });
    sec.addEventListener('input', function(ev){
      var t = ev.target;
      if(t && t.getAttribute && t.getAttribute('data-pr') === 'pickSearch'){
        pickQuery = t.value;
        var pickHost = sec.querySelector('[data-pr="picklist"]');
        if(pickHost) pickHost.innerHTML = pickListHTML();
      }
      if(t && t.getAttribute && t.getAttribute('data-pr') === 'annTopicOtherInput'){
        annTopicOther = t.value;
        renderReport();
      }
      if(t && t.getAttribute && t.getAttribute('data-pr') === 'annMsgInput'){
        annMessage = t.value;
        renderReport();
      }
      if(t && t.getAttribute && t.getAttribute('data-ann-field')){
        var fKey = t.getAttribute('data-ann-field');
        if(!annFieldData[annTopic]) annFieldData[annTopic] = {};
        annFieldData[annTopic][fKey] = t.value;
      }
    });
    sec.addEventListener('change', function(ev){
      var t = ev.target;
      if(t && t.getAttribute && t.getAttribute('data-pr') === 'qrToggle'){
        includeQrPage = !!t.checked;
        renderReport();
      }
      if(t && t.getAttribute && t.getAttribute('data-pr') === 'annTopicSel'){
        annTopic = t.value;
        paint();
      }
      if(t && t.getAttribute && t.getAttribute('data-pr') === 'annImgInput'){
        var files = Array.prototype.slice.call(t.files || []);
        var room = ANN_MAX_IMAGES - annImages.length;
        files = files.filter(function(f){ return f.type && f.type.indexOf('image/') === 0; }).slice(0, Math.max(0, room));
        var remaining = files.length;
        if(!remaining){ t.value = ''; return; }
        files.forEach(function(f){
          var reader = new FileReader();
          reader.onload = function(){
            annImages.push(reader.result);
            remaining--;
            if(remaining <= 0) paint();
          };
          reader.readAsDataURL(f);
        });
        t.value = '';
      }
    });
  }

  function build(){
    if(document.getElementById('printreport')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'printreport';
    sec.setAttribute('data-route', 'printreport');
    sec.innerHTML =
      '<div class="cx-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-pr="eb"></span></div>' +
          '<h2 data-pr="h"></h2>' +
          '<p class="lede" data-pr="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div class="pr-layout">' +
        '<div class="pr-controls pr-onlyscreen">' +
          '<div class="pr-row" style="margin-bottom:10px;">' +
            '<span class="pr-label" data-pr="typeLbl"></span>' +
            '<button type="button" class="pr-modebtn" data-pr="typeMarket"></button>' +
            '<button type="button" class="pr-modebtn" data-pr="typeGold"></button>' +
            '<button type="button" class="pr-modebtn" data-pr="typeIdea"></button>' +
            '<button type="button" class="pr-modebtn" data-pr="typeAnnouncement"></button>' +
            '<button type="button" class="pr-modebtn" data-pr="typeBubble"></button>' +
          '</div>' +
          '<div data-pr="annWrap" style="display:none;">' +
            '<div class="pr-row" style="display:block;">' +
              '<span class="pr-label" data-pr="annTopicLbl" style="display:block;margin-bottom:6px;"></span>' +
              '<select class="pr-search" data-pr="annTopicSel" style="margin-bottom:8px;"></select>' +
              '<input type="text" class="pr-search" data-pr="annTopicOtherInput" style="display:none;">' +
            '</div>' +
            '<div data-pr="annTplWrap" style="display:none;margin:4px 0 14px;padding:10px;border:1px dashed var(--border-dim);border-radius:8px;">' +
              '<div class="pr-hint" data-pr="annTplHint" style="margin-bottom:8px;"></div>' +
              '<div data-pr="annTplFields" style="display:flex;flex-direction:column;gap:8px;"></div>' +
              '<button type="button" class="pr-modebtn" data-pr="annGenerate" style="margin-top:10px;"></button>' +
            '</div>' +
            '<div class="pr-row" style="display:block;">' +
              '<span class="pr-label" data-pr="annMsgLbl" style="display:block;margin-bottom:6px;"></span>' +
              '<textarea class="pr-search" data-pr="annMsgInput" rows="6" style="resize:vertical;min-height:120px;"></textarea>' +
            '</div>' +
            '<div class="pr-row" style="display:block;">' +
              '<span class="pr-label" data-pr="annImgLbl" style="display:block;margin-bottom:6px;"></span>' +
              '<input type="file" accept="image/*" multiple data-pr="annImgInput">' +
              '<div class="pr-hint" data-pr="annImgHint" style="margin-top:6px;"></div>' +
              '<div data-pr="annImgList" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;"></div>' +
            '</div>' +
          '</div>' +
          '<div data-pr="modeWrap">' +
            '<div class="pr-row">' +
              '<span class="pr-label" data-pr="modeLbl"></span>' +
              '<button type="button" class="pr-modebtn" data-pr="modeFull"></button>' +
              '<button type="button" class="pr-modebtn" data-pr="modeSelect"></button>' +
            '</div>' +
            '<div class="pr-row" data-pr="pickWrap" style="display:block;">' +
              '<div class="pr-row" style="margin-bottom:8px;">' +
                '<span class="pr-label" data-pr="pickLbl"></span>' +
                '<button type="button" class="pr-mini" data-pr="selAll"></button>' +
                '<button type="button" class="pr-mini" data-pr="clearAll"></button>' +
              '</div>' +
              '<input type="text" class="pr-search" data-pr="pickSearch" autocomplete="off">' +
              '<div class="pr-picklist" data-pr="picklist"></div>' +
            '</div>' +
          '</div>' +
          '<div class="pr-row" style="margin-top:2px;">' +
            '<label class="pr-checklbl">' +
              '<input type="checkbox" data-pr="qrToggle" checked>' +
              '<span data-pr="qrToggleLbl"></span>' +
            '</label>' +
          '</div>' +
          '<div class="pr-row" style="margin-top:6px;">' +
            '<button type="button" class="pr-printbtn" data-pr="printBtn"></button>' +
            '<button type="button" class="pr-linebtn" data-pr="lineBtn"></button>' +
            '<span class="pr-line-status" data-pr="lineStatus"></span>' +
          '</div>' +
          '<div class="pr-hint" data-pr="hint"></div>' +
        '</div>' +
        '<div class="pr-preview-wrap" data-pr="sheet"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'printreport', feat:true, after:'pro', /* Round S5: cockpit route merged away, see part-47.js */
      t:{en:'Print Report',th:'พิมพ์รายงาน'},
      d:{en:'Generate a professional, printable A4 market summary from live data — as many times as you like. Admin-only.',
         th:'สร้างรายงานสรุปตลาดขนาด A4 พร้อมพิมพ์ จากข้อมูลสด ทำได้ไม่จำกัดครั้ง เฉพาะแอดมิน'}
    });

    bind();
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    // NOTE: intentionally NOT re-painting on every 'spz:snapshot' event.
    // Live snapshots refresh every ~10 minutes and mutate stock fundamentals
    // (P/E, ROE, etc.) in place, which can re-order near-tied stock picks
    // (e.g. NVDA/META/GOOGL/TSM clustered scores). Re-rendering the report
    // automatically in the background made a generated/printed report look
    // unstable -- the #1 pick could change between one glance and the next.
    // The 'seed' interval below still renders once as soon as the FIRST
    // snapshot is available (so the report isn't stuck empty on a cold
    // load); after that, the report only changes when the user explicitly
    // switches report type/mode or picks stocks, so a printed report stays
    // exactly what was on screen when it was generated.
    var seed = setInterval(function(){ if(window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot()){ paint(); clearInterval(seed); } }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
