
/* ============================================================================
   SPACEZ TERMINAL v20 — GUIDED MODE
   Entirely opt-in: while it is off, no extra UI is rendered anywhere.
   ========================================================================= */
(function(){
  'use strict';

/* ============================================================================
   v20 — GUIDED MODE
   An opt-in walkthrough. When it is off, nothing about the site changes.
   ========================================================================= */
var GM = {
  eb:{en:'Guided Mode',th:'โหมดแนะนำ'},
  h2:{en:'Do It In Order, One Step At A Time',th:'ทำไปทีละขั้น ตามลำดับ'},
  lede:{en:'%N steps in the order that actually works. Turn it on and a bar appears at the bottom of every page with the next step. Turn it off and it disappears completely — nothing else about the site changes.',
        th:'%N ขั้นตอนเรียงตามลำดับที่ใช้ได้จริง เปิดโหมดนี้แล้วจะมีแถบขึ้นด้านล่างทุกหน้าพร้อมปุ่มไปขั้นถัดไป ปิดแล้วมันหายไปเลย ส่วนอื่นของเว็บไม่เปลี่ยนอะไรทั้งสิ้น'},

  on:{en:'Turn guided mode on',th:'เปิดโหมดแนะนำ'},
  off:{en:'Turn it off',th:'ปิดโหมด'},
  offShort:{en:'Quit',th:'ออกจากโหมด'},
  resume:{en:'Carry on from step %A — %T',th:'ทำต่อจากขั้นที่ %A — %T'},
  cueWhat:{en:'Do this',th:'ทำอะไร'},
  cueLook:{en:'Look at',th:'ดูตรงไหน'},
  cueEg:{en:'For example',th:'ตัวอย่าง'},
  cueHide:{en:'Hide',th:'ซ่อน'},
  cueShow:{en:'What am I looking at?',th:'ต้องดูอะไรตรงนี้'},
  restart:{en:'Start over',th:'เริ่มใหม่'},
  isOn:{en:'Guided mode is on',th:'โหมดแนะนำเปิดอยู่'},
  isOff:{en:'Guided mode is off',th:'โหมดแนะนำปิดอยู่'},
  prog:{en:'%A of %B done',th:'ทำแล้ว %A จาก %B ขั้น'},

  sMap:{en:'The path',th:'เส้นทาง'},
  sSteps:{en:'Every step',th:'ทุกขั้นตอน'},

  goalH:{en:'Do this',th:'ทำอะไร'},
  lookH:{en:'Look at',th:'ดูตรงไหน'},
  tipH:{en:'Worked example',th:'ตัวอย่างจริง'},
  goBtn:{en:'Open this step',th:'เปิดขั้นนี้'},
  doneBtn:{en:'Mark done',th:'ทำเสร็จแล้ว'},
  undoBtn:{en:'Not yet',th:'ยังไม่เสร็จ'},
  nextBtn:{en:'Next step',th:'ขั้นถัดไป'},
  prevBtn:{en:'Back',th:'ย้อนกลับ'},
  finBtn:{en:'Finish',th:'จบแล้ว'},
  stepOf:{en:'Step %A of %B',th:'ขั้นที่ %A จาก %B'},
  sumH:{en:'So — what does that leave you with',th:'สรุป — แล้วเหลืออะไรบ้าง'},
  sumLead:{en:'Computed live from the two answers below, the cycle reading the site is using right now, the capital flow map and the P/E, yield, ROE, D/E, margin and P/B of all %N names.',
           th:'คำนวณสดจากคำตอบสองข้อด้านล่าง ค่าวัฏจักรที่เว็บใช้อยู่ตอนนี้ แผนที่กระแสเงิน และค่า P/E ปันผล ROE D/E มาร์จิ้น P/B ของหุ้นทั้ง %N ตัว'},
  sumLock:{en:'Finish all %N steps to unlock this. You can open it now, but the numbers mean far less if you have not seen where they came from.',
           th:'ทำครบทั้ง %N ขั้นเพื่อปลดล็อก จะเปิดดูเลยก็ได้ แต่ตัวเลขจะมีความหมายน้อยมากถ้ายังไม่เห็นว่ามันมาจากไหน'},
  sumOpen:{en:'Open it anyway',th:'ขอดูเลย'},
  mktQ:{en:'Which market do you actually trade?',th:'คุณเทรดตลาดไหนจริงๆ'},
  mkts:[{id:'all',l:{en:'Both',th:'ทั้งสอง'}},{id:'US',l:{en:'US only',th:'สหรัฐฯ'}},{id:'TH',l:{en:'Thai only',th:'ไทย'}}],
  styQ:{en:'What matters most to you?',th:'ให้น้ำหนักอะไรมากที่สุด'},

  hlPick:{en:'Weighting fundamentals, cycle fit, capital flow and macro equally (the “Balanced” read, the reasonable default), the clearest pick right now is',
          th:'เมื่อให้น้ำหนักพื้นฐาน ความเข้ากับวัฏจักร กระแสเงิน และมหภาคเท่าๆ กัน (มุมมอง “สมดุล” ซึ่งเป็นค่าเริ่มต้นที่สมเหตุสมผลที่สุด) ตัวที่เด่นที่สุดตอนนี้คือ'},
  hlNext:{en:'Next after it:',th:'ตามมาด้วย:'},
  altToggle:{en:'Want to weight it differently?',th:'อยากให้น้ำหนักต่างจากนี้ไหม'},
  altClose:{en:'Hide this',th:'ซ่อน'},
  altL:{en:'The pick above weighs fundamentals, cycle fit, capital flow and macro equally. Change what matters most to you below and the order can shift — that is a different question being asked, not a mistake in either answer. Not sure which to use? Balanced above is the one to trust by default.',
        th:'ตัวเลือกด้านบนให้น้ำหนักพื้นฐาน ความเข้ากับวัฏจักร กระแสเงิน และมหภาคเท่าๆ กัน ถ้าเปลี่ยนว่าคุณให้ความสำคัญกับอะไรมากที่สุดด้านล่างนี้ อันดับก็เปลี่ยนได้ — ไม่ใช่ว่าอันไหนผิด แค่เป็นคนละคำถามกัน ถ้าไม่แน่ใจว่าจะใช้อันไหน ให้เชื่อ “สมดุล” ด้านบนเป็นค่าเริ่มต้น'},
  stys:[{id:'bal',l:{en:'Balanced',th:'สมดุล'}},{id:'fund',l:{en:'Fundamentals',th:'พื้นฐาน'}},
        {id:'flow',l:{en:'Follow the money',th:'กระแสเงิน'}},{id:'def',l:{en:'Sleep well',th:'นอนหลับสบาย'}}],
  rulesH:{en:'Five things to hold on to before you act',th:'ห้าข้อที่ต้องยึดไว้ก่อนลงมือ'},
  rules:{
    en:['Every figure in this terminal is a simplified teaching estimate. Open SETSMART or the company filings and check the real number before buying anything.',
        'Four of the six events in the swap plan flip the entire top five. If the cycle call is wrong, the whole list is wrong.',
        'Markets have historically turned 6-9 months before the data confirms it, so by the time a rotation is readable much of it is already priced.',
        'A high score is a reason to start researching a company, never a reason to buy it.',
        'Decide the position size before you fall in love with the idea, and cap any single name near 5% of the portfolio.'],
    th:['ตัวเลขทุกตัวในเทอร์มินัลนี้เป็นค่าประมาณเพื่อการสอน ให้เปิด SETSMART หรืองบการเงินจริงเช็คก่อนซื้อทุกครั้ง',
        'สี่ในหกเหตุการณ์ในแผนสำรองพลิกห้าอันดับแรกทั้งชุด ถ้าอ่านวัฏจักรผิด รายชื่อก็ผิดทั้งแถว',
        'ในอดีตตลาดกลับตัวก่อนข้อมูลยืนยัน 6-9 เดือน กว่าจะอ่านการหมุนกลุ่มออก ส่วนใหญ่ก็ถูกคิดเข้าไปในราคาแล้ว',
        'คะแนนสูงคือเหตุผลให้เริ่มไปค้นคว้าเรื่องบริษัทนั้น ไม่ใช่เหตุผลให้ซื้อ',
        'ตัดสินใจขนาดไม้ก่อนที่จะหลงรักไอเดีย และจำกัดหุ้นตัวเดียวไว้ราว 5% ของพอร์ต']
  },
  usingH:{en:'Built from',th:'สร้างจาก'},
  flowInto:{en:'Money is rotating into',th:'เงินกำลังหมุนเข้าไปที่'},
  flowOutof:{en:'and out of',th:'และไหลออกจาก'},
  descLbl:{en:'What it does',th:'ทำธุรกิจอะไร'},
  finH:{en:'That is the whole loop',th:'ครบวงจรแล้ว'},
  finN:{en:'Run it again whenever the cycle call changes, a company reports, or you have new money to put in. The order matters more than the speed.',
        th:'ทำวนใหม่ทุกครั้งที่การอ่านวัฏจักรเปลี่ยน มีบริษัทประกาศงบ หรือมีเงินก้อนใหม่จะลง ลำดับสำคัญกว่าความเร็ว'},

  steps:[
    {id:'start', ic:'🧭', route:'start',
     t:{en:'Know your own shape first',th:'รู้จักตัวเองก่อน'},
     goal:{en:'Answer the nine questions honestly. Not what you wish you were — what you would actually do when the screen is red.',
           th:'ตอบเก้าคำถามตามจริง ไม่ใช่ตามที่อยากเป็น แต่ตามที่คุณจะทำจริงตอนหน้าจอแดงเถือก'},
     look:{en:'The four percentage bars, and which of the three steps it puts you on.',
           th:'แถบเปอร์เซ็นต์ทั้งสี่ และมันจัดคุณอยู่ขั้นไหนใน 0 / 1 / 2'},
     tip:{en:'If it puts you on Step 0, stop here for now. Emergency fund, clear expensive debt, then a broad index fund. Buying individual stocks before that is where most first portfolios die.',
          th:'ถ้ามันจัดคุณอยู่ขั้น 0 ให้หยุดแค่นี้ก่อน ทำเงินสำรองฉุกเฉิน ปิดหนี้แพง แล้วเริ่มที่กองทุนดัชนีกระจายกว้าง การซื้อหุ้นรายตัวก่อนทำสามอย่างนี้คือจุดที่พอร์ตแรกของคนส่วนใหญ่ตาย'}},

    {id:'outlook', ic:'🕰️', route:'outlook',
     t:{en:'Read where the cycle is',th:'อ่านว่าวัฏจักรอยู่ตรงไหน'},
     goal:{en:'Check the six evidence cards and see how many agree before you accept the call.',
           th:'ดูการ์ดหลักฐานหกใบ นับว่ากี่ใบตรงกัน ก่อนจะเชื่อการอ่านนั้น'},
     look:{en:'The gauge on each card, and the "what would change the read" panel.',
           th:'เกจบนการ์ดแต่ละใบ และแผง "อะไรจะทำให้การอ่านเปลี่ยน"'},
     tip:{en:'Right now five of six point to mid cycle and only inflation leans late. That single dissenting indicator is the one to watch — if CPI goes above 4%, the read flips and so does everything downstream of it.',
          th:'ตอนนี้ห้าในหกชี้ไปที่กลางวัฏจักร มีแค่เงินเฟ้อที่เอียงไปทางปลาย ตัวที่เห็นต่างตัวเดียวนั่นแหละที่ต้องจับตา ถ้า CPI เกิน 4% การอ่านจะพลิก และทุกอย่างที่ต่อจากนั้นพลิกตาม'}},

    {id:'radar', ic:'📡', route:'regime',
     t:{en:'Check whether that read is holding up',th:'เช็คว่าการอ่านนั้นยังยืนอยู่ไหม'},
     goal:{en:'Open the Turning Point Radar and see how many of the eleven gauges are flashing a hard warning versus just leaning that way.',
           th:'เปิดหน้าเรดาร์สัญญาณเปลี่ยนทิศ แล้วดูว่าในสิบเอ็ดมาตรวัดมีกี่ตัวที่เตือนแรงจริง กี่ตัวแค่เอียงไปทางนั้น'},
     look:{en:'The big number at the top — it only counts gauges that crossed fully into their red zone. A couple of amber ones next to it is normal.',
           th:'ตัวเลขใหญ่ด้านบน — นับเฉพาะมาตรวัดที่เข้าโซนแดงเต็มตัว มีสีเหลืองข้างๆ อีกสองสามตัวถือว่าปกติ'},
     tip:{en:'Zero red gauges backs up a mid-cycle read from the last step. If two or more turn red, or a whole cluster of related gauges lights up together, trust that over the cycle label alone — then scroll down this same page to see what money is already doing about it.',
          th:'ถ้าไม่มีสัญญาณแดงเลย ก็สนับสนุนการอ่านว่าอยู่กลางวัฏจักรจากขั้นก่อนหน้า แต่ถ้าแดงตั้งแต่สองตัวขึ้นไป หรือกลุ่มมาตรวัดที่เกี่ยวข้องกันสว่างพร้อมกัน ให้เชื่อสัญญาณนี้มากกว่าป้ายชื่อวัฏจักรเฉยๆ แล้วเลื่อนลงไปดูในหน้าเดียวกันว่าตอนนี้เงินกำลังทำอะไรกับมันอยู่'}},

    {id:'flow', ic:'💸', route:'flow',
     t:{en:'See where money is already moving',th:'ดูว่าตอนนี้เงินไหลไปทางไหนแล้ว'},
     goal:{en:'Open Capital Flow and flip between sector, asset class and country. Note the two or three pulling money in right now.',
           th:'เปิดหน้าเงินทุนไหลไปไหน สลับดูทั้งกลุ่มอุตสาหกรรม สินทรัพย์ และประเทศ จดไว้ว่าตอนนี้เงินไหลเข้าอะไรมากที่สุดสองสามอันดับแรก'},
     look:{en:'The in-flow and out-flow columns side by side — a sector at the top of "in" while its usual opposite sits in "out" is the clearest signal on this page.',
           th:'คอลัมน์เงินไหลเข้ากับไหลออกวางคู่กัน กลุ่มที่ติดอันดับต้นฝั่ง "เข้า" ขณะกลุ่มที่มักสวนทางกันอยู่ฝั่ง "ออก" คือสัญญาณที่ชัดที่สุดในหน้านี้'},
     tip:{en:'This is a price-and-volume proxy for real fund flow, not the real tape — free data cannot get that. Use it to confirm a story, not invent one: cyclicals showing up in "in" confirms a mid-cycle read; staples and utilities showing up there instead is the earliest sign that read is wrong.',
          th:'นี่คือค่าประมาณจากราคาและปริมาณซื้อขาย ไม่ใช่ข้อมูลกระแสเงินจริง เพราะข้อมูลฟรีไม่มีตัวนั้น ให้ใช้มันยืนยันเรื่องราว ไม่ใช่สร้างเรื่องราวขึ้นมาเอง ถ้าหุ้นวัฏจักรติดอันดับฝั่ง "เข้า" ก็ยืนยันว่ากลางวัฏจักรจริง แต่ถ้ากลุ่มสินค้าจำเป็นกับสาธารณูปโภคติดฝั่ง "เข้า" แทน นั่นคือสัญญาณแรกที่บอกว่าการอ่านนั้นผิด'}},

    {id:'globe', ic:'🕸️', route:'globe',
     t:{en:'Follow the money to a sector',th:'ตามเงินไปให้ถึงกลุ่มอุตสาหกรรม'},
     goal:{en:'Set the view to "fit everything", then tap the stock style you are drawn to and trace its whole path.',
           th:'ตั้งขนาดเป็น "ทั้งหมดในจอเดียว" แล้วแตะประเภทหุ้นที่คุณสนใจ เพื่อไล่ดูเส้นทางทั้งสาย'},
     look:{en:'The percentage on each block — that is the share of its column receiving the flow.',
           th:'ตัวเลข % บนแต่ละกล่อง คือสัดส่วนของเงินในคอลัมน์นั้นที่ไหลเข้ามันc'},
     tip:{en:'Tap Growth and follow it: it feeds semiconductors, cloud and power. Then tap semiconductors and look at what those companies pay for — capex, suppliers, energy. That last column is why power and grid names ride the same wave as chips.',
          th:'ลองแตะ "หุ้นเติบโต" แล้วไล่ดู มันไหลเข้าเซมิคอนดักเตอร์ คลาวด์ และไฟฟ้า จากนั้นแตะเซมิคอนดักเตอร์แล้วดูว่าบริษัทพวกนั้นจ่ายเงินไปไหน — ลงทุน ซัพพลายเออร์ ค่าไฟ คอลัมน์สุดท้ายนี่แหละคือเหตุผลที่หุ้นไฟฟ้าขี่คลื่นลูกเดียวกับหุ้นชิป'}},

    {id:'desk', ic:'🎯', route:'desk',
     t:{en:'Get a shortlist',th:'ได้รายชื่อสั้นๆ'},
     goal:{en:'Read the top five, then change the weighting preset twice and see whether the names hold.',
           th:'อ่านห้าอันดับแรก แล้วเปลี่ยนชุดน้ำหนักสองครั้ง ดูว่ารายชื่อยังอยู่ไหม'},
     look:{en:'The four-colour bar under each name — it shows whether the score came from fundamentals, cycle, flow or macro.',
           th:'แถบสี่สีใต้ชื่อหุ้น มันบอกว่าคะแนนมาจากพื้นฐาน วัฏจักร กระแสเงิน หรือมหภาค'},
     tip:{en:'A name that stays top five under "Fundamentals" and under "Follow the money" is a real candidate. One that only appears under a single preset is an artefact of the weighting, not a finding. And if you want Thai names, you must switch the market filter — otherwise none of them rank.',
          th:'หุ้นที่ติดห้าอันดับแรกทั้งตอนกด "เน้นพื้นฐาน" และ "ตามกระแสเงิน" คือตัวที่น่าสนใจจริง ส่วนตัวที่โผล่มาแค่ชุดน้ำหนักเดียว เป็นผลของการตั้งน้ำหนัก ไม่ใช่การค้นพบ และถ้าอยากดูหุ้นไทย ต้องกดตัวกรองตลาดเป็น "ไทยเท่านั้น" ไม่งั้นไม่มีตัวไหนติดอันดับเลย'}},

    {id:'compare', ic:'📊', route:'directory',
     t:{en:'Compare the shortlist side by side',th:'เอารายชื่อมาเทียบกัน'},
     goal:{en:'Tick three to six names from the previous step and scan them.',
           th:'ติ๊กหุ้นสามถึงหกตัวจากขั้นที่แล้ว แล้วกดสแกน'},
     look:{en:'The radar. Every axis is flipped so further out is always better — no need to remember which way P/E goes.',
           th:'เรดาร์ ทุกแกนถูกกลับด้านให้ยิ่งออกนอกยิ่งดีเสมอ ไม่ต้องจำว่า P/E ยิ่งน้อยยิ่งดี'},
     tip:{en:'Look for a shape that is wide rather than spiky. A spike on one axis with collapses elsewhere usually means one flattering number is carrying the whole score — often a low P/E on falling earnings.',
          th:'มองหารูปทรงที่กว้างสม่ำเสมอ ไม่ใช่แหลมจุดเดียว แหลมแกนเดียวแล้วยุบแกนอื่นมักแปลว่ามีตัวเลขสวยตัวเดียวแบกคะแนนทั้งหมด ซึ่งบ่อยครั้งคือ P/E ต่ำเพราะกำไรกำลังหด'}},

    {id:'gloss', ic:'📖', route:'glossary',
     t:{en:'Learn the trap behind each number',th:'เรียนรู้กับดักของแต่ละตัวเลข'},
     goal:{en:'Open any metric from your comparison and run its what-if scenarios.',
           th:'เปิดเมตริกที่คุณเจอในการเปรียบเทียบ แล้วกดดูเหตุการณ์สมมุติของมัน'},
     look:{en:'The before → after calculation and the "how to handle it" list underneath.',
           th:'การคำนวณค่าตั้งต้น → หลังเกิดเหตุ และรายการ "วิธีรับมือ" ด้านล่าง'},
     tip:{en:'Start with Dividend Yield. Price falls 100 to 50 and the yield doubles to 8% while the company paid you nothing extra — you just lost half your capital. If a screener ever shows you an unusually high yield, this is the first thing to rule out.',
          th:'เริ่มที่ Dividend Yield ราคาร่วงจาก 100 เหลือ 50 แล้ว yield เด้งเป็น 8% ทั้งที่บริษัทไม่ได้จ่ายเพิ่มสักบาท — คุณแค่เสียเงินต้นไปครึ่งหนึ่ง ถ้าสกรีนเนอร์โชว์ yield สูงผิดปกติเมื่อไหร่ นี่คือสิ่งแรกที่ต้องตัดออกให้ได้ก่อน'}},

    {id:'shock', ic:'⚡', route:'scenarios',
     t:{en:'Test whether you can hold it',th:'ทดสอบว่าคุณจะถือไหวไหม'},
     goal:{en:'Run the shocks against the stock type you are about to buy.',
           th:'กดจำลองแรงกระแทกใส่ประเภทหุ้นที่คุณกำลังจะซื้อ'},
     look:{en:'How far your chosen archetype falls, not how far the index falls.',
           th:'ดูว่าประเภทที่คุณเลือกร่วงแค่ไหน ไม่ใช่ดูว่าดัชนีร่วงแค่ไหน'},
     tip:{en:'If a number here makes you uncomfortable reading it on a calm afternoon, you will not hold through it on a bad morning. That is useful information — go back to step 4 and pick a different archetype rather than pretending you will be brave.',
          th:'ถ้าตัวเลขตรงนี้ทำให้คุณอึดอัดตั้งแต่ตอนอ่านในบ่ายที่สงบ คุณจะไม่ถือผ่านมันได้ในเช้าที่แย่ นี่คือข้อมูลที่มีประโยชน์ — ให้กลับไปขั้นที่ 4 เลือกประเภทใหม่ ดีกว่าหลอกตัวเองว่าจะกล้า'}},

    {id:'size', ic:'📐', route:null, tool:'sizing',
     t:{en:'Size the position before you buy',th:'คำนวณขนาดไม้ก่อนกดซื้อ'},
     goal:{en:'Enter your account size, 1–2% risk, entry price and stop. Take the share count it gives you.',
           th:'ใส่เงินทุน ความเสี่ยงต่อไม้ 1–2% ราคาเข้า และจุดตัดขาดทุน แล้วเอาจำนวนหุ้นที่มันคำนวณให้'},
     look:{en:'The share count, and how small it is compared to what you were about to buy.',
           th:'จำนวนหุ้นที่ได้ และมันน้อยกว่าที่คุณกำลังจะซื้อแค่ไหน'},
     tip:{en:'This tool does not yet subtract commission or account for a price gapping through your stop overnight. Add a buffer yourself — assume the worst case is the whole position, not the stop distance.',
          th:'เครื่องมือนี้ยังไม่ได้หักค่าคอมมิชชั่น และยังไม่คิดกรณีราคากระโดดข้ามจุดตัดขาดทุนข้ามคืน ให้เผื่อเอง โดยสมมติว่ากรณีแย่ที่สุดคือเสียทั้งไม้ ไม่ใช่แค่ระยะจุดตัดขาดทุน'}}
  ],

  barHint:{en:'Guided mode',th:'โหมดแนะนำ'},
  note:{en:'This walkthrough teaches a process, not a recommendation. Every figure in the terminal is a simplified teaching estimate — verify at the source before committing money.',
        th:'ลำดับขั้นนี้สอนกระบวนการ ไม่ใช่คำแนะนำให้ซื้อ ตัวเลขทุกตัวในเทอร์มินัลเป็นค่าประมาณเพื่อการสอน ต้องตรวจสอบจากแหล่งต้นทางก่อนลงเงินจริง'}
};


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var N = GM.steps.length;
  var S = { on:false, cur:0, done:[], mkt:'all', sty:'bal', peek:false };
  /* whether the secondary "weight it differently" section is expanded —
     deliberately not persisted: it should start closed on every fresh
     visit so the headline answer is what a reader sees first. */
  var altOpen = false;

  function load(){
    try {
      var raw = localStorage.getItem('spacez.guide');
      if(raw){
        var o = JSON.parse(raw);
        S.on = !!o.on;
        S.cur = Math.min(N - 1, Math.max(0, o.cur | 0));
        S.done = Array.isArray(o.done) ? o.done : [];
        if(o.mkt) S.mkt = o.mkt;
        if(o.sty) S.sty = o.sty;
      }
    } catch(e){}
  }
  function save(){
    try { localStorage.setItem('spacez.guide', JSON.stringify(S)); } catch(e){}
  }
  function isDone(i){ return S.done.indexOf(GM.steps[i].id) !== -1; }
  function setDone(i, v){
    var id = GM.steps[i].id, k = S.done.indexOf(id);
    if(v && k === -1) S.done.push(id);
    if(!v && k !== -1) S.done.splice(k, 1);
    save();
  }
  function doneCount(){
    var n = 0;
    for(var i = 0; i < N; i++) if(isDone(i)) n++;
    return n;
  }

  /* ---------------- navigation ---------------- */
  function openStep(i){
    S.cur = Math.min(N - 1, Math.max(0, i));
    save();
    var st = GM.steps[S.cur];
    if(st.tool){
      var tb = document.querySelector('.tools-btn');
      if(tb) tb.click();
    } else if(st.route){
      var a = document.querySelector('[data-route-to="' + st.route + '"]');
      if(a) a.click();
    }
    paintAll();
  }

  /* ---------------- animated path ---------------- */
  function mapSVG(){
    var W = 1080, H = 150, padX = 46, y = 74;
    var gap = (W - padX * 2) / (N - 1);
    var pts = [];
    for(var i = 0; i < N; i++){
      pts.push([padX + gap * i, y + (i % 2 ? -13 : 13)]);
    }
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for(i = 1; i < N; i++){
      var px = pts[i - 1][0], py = pts[i - 1][1], cx = pts[i][0], cy = pts[i][1];
      var mx = (px + cx) / 2;
      d += ' C' + mx + ',' + py + ' ' + mx + ',' + cy + ' ' + cx + ',' + cy;
    }

    var reached = 0;
    for(i = 0; i < N; i++) if(isDone(i)) reached = i + 1;
    var frac = N > 1 ? Math.min(1, reached / (N - 1)) : 0;

    var s = '<path class="gm-track" d="' + d + '"/>' +
      '<path class="gm-fill" d="' + d + '" pathLength="1000" ' +
      'style="stroke-dasharray:1000;stroke-dashoffset:' + Math.round(1000 - 1000 * frac) + '"/>';

    for(i = 0; i < N; i++){
      var p = pts[i], st = GM.steps[i];
      var done = isDone(i), cur = i === S.cur;
      var col = done ? 'var(--neon-2)' : (cur ? 'var(--neon)' : 'rgba(255,255,255,.16)');
      s += '<g class="gm-nd ' + (done ? 'done' : (cur ? 'cur' : '')) + '" data-gm="' + i + '">';
      if(cur && !RM) s += '<circle class="gm-halo" cx="' + p[0] + '" cy="' + p[1] + '" r="21"/>';
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="17" fill="' +
        (done ? 'rgba(0,255,102,.16)' : (cur ? 'rgba(204,255,0,.18)' : 'rgba(255,255,255,.05)')) +
        '" stroke="' + col + '" stroke-width="' + (cur ? 2 : 1.2) + '"/>' +
        '<text class="gm-ic" x="' + p[0] + '" y="' + (p[1] + 6) + '" text-anchor="middle">' + st.ic + '</text>' +
        (done ? '<text x="' + (p[0] + 13) + '" y="' + (p[1] - 11) + '" font-size="11" fill="var(--neon-2)">✓</text>' : '') +
        '<text class="gm-lbl" x="' + p[0] + '" y="' + (p[1] + (i % 2 ? -26 : 34)) + '" text-anchor="middle">' +
        esc(String(i + 1).padStart(2, '0')) + '</text></g>';
    }
    return '<svg class="gmp-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' + s + '</svg>';
  }

  /* ---------------- the page ---------------- */
  var sec;
  function build(){
    sec = el('section');
    sec.id = 'guided';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-g="eb"></span></div>' +
        '<h2 data-g="h2"></h2><p class="lede" data-g="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="gm-toggle" data-g="tog"></div>' +
      '<div class="v8-sub" data-g="sm"></div><div class="gm-map" data-g="map"></div>' +
      '<div class="v8-sub" data-g="ss"></div><div class="gm-list" data-g="list"></div>' +
      '<div data-gm="sum"></div>' +
      '<div class="v8-note" data-g="note"></div>';
    return sec;
  }

  function paintPage(){
    if(!sec) return;
    function q(k){ return sec.querySelector('[data-g="' + k + '"]'); }
    q('eb').textContent = T(GM.eb);
    q('h2').textContent = T(GM.h2);
    q('lede').textContent = T(GM.lede).replace('%N', N);
    q('sm').textContent = T(GM.sMap);
    q('ss').textContent = T(GM.sSteps);
    q('note').innerHTML = '<b>⚠</b> ' + esc(T(GM.note));

    /* toggle */
    var tog = q('tog');
    tog.className = 'gm-toggle' + (S.on ? ' on' : '');
    tog.innerHTML =
      '<span class="gm-state"><span class="gm-led"></span>' + esc(S.on ? T(GM.isOn) : T(GM.isOff)) + '</span>' +
      '<button type="button" class="gm-go" data-a="tog">' +
        esc(S.on ? T(GM.off) : (doneCount() > 0 && S.cur > 0
              ? T(GM.resume).replace('%A', S.cur + 1).replace('%T', T(GM.steps[S.cur].t))
              : T(GM.on))) + '</button>' +
      '<button type="button" class="gm-b" data-a="rst">↺ ' + esc(T(GM.restart)) + '</button>' +
      '<span class="gm-prog">' + esc(T(GM.prog).replace('%A', doneCount()).replace('%B', N)) + '</span>';
    tog.querySelector('[data-a="tog"]').addEventListener('click', function(){
      S.on = !S.on; save();
      /* turning it on used to draw the bar and leave the reader sitting on
         this page with no idea where step one was — take them there */
      if(S.on) openStep(S.cur); else { hideCue(); paintAll(); }
    });
    tog.querySelector('[data-a="rst"]').addEventListener('click', function(){
      S.done = []; S.cur = 0; save(); paintAll();
    });

    /* path */
    q('map').innerHTML = mapSVG();
    var nds = q('map').querySelectorAll('[data-gm]');
    for(var i = 0; i < nds.length; i++){
      (function(n){
        n.addEventListener('click', function(){ openStep(+n.getAttribute('data-gm')); });
      })(nds[i]);
    }

    /* cards */
    var list = q('list');
    list.innerHTML = '';
    for(i = 0; i < N; i++){
      (function(st, idx){
        var done = isDone(idx);
        var c = el('div', 'gm-c' + (idx === S.cur ? ' cur' : '') + (done ? ' done' : ''),
          '<div class="gm-hd"><span class="gm-num">' + String(idx + 1).padStart(2, '0') + '</span>' +
            '<span class="gm-ic">' + st.ic + '</span>' +
            '<span class="gm-t">' + esc(T(st.t)) + '</span>' +
            '<button type="button" class="gm-chk" data-a="chk">' +
              (done ? '✓ ' + esc(T(GM.undoBtn)) : esc(T(GM.doneBtn))) + '</button></div>' +
          '<div class="gm-bd">' +
            '<div class="gm-f"><div class="gm-fh">▸ ' + esc(T(GM.goalH)) + '</div>' +
              '<div class="gm-fd">' + esc(T(st.goal)) + '</div></div>' +
            '<div class="gm-f"><div class="gm-fh">◎ ' + esc(T(GM.lookH)) + '</div>' +
              '<div class="gm-fd">' + esc(T(st.look)) + '</div></div>' +
            '<div class="gm-f tip"><div class="gm-fh">★ ' + esc(T(GM.tipH)) + '</div>' +
              '<div class="gm-fd">' + esc(T(st.tip)) + '</div></div>' +
          '</div>' +
          '<div class="gm-act"><button type="button" class="gm-go" data-a="go">' +
            esc(T(GM.goBtn)) + ' →</button></div>');
        c.querySelector('[data-a="go"]').addEventListener('click', function(){ openStep(idx); });
        c.querySelector('[data-a="chk"]').addEventListener('click', function(){
          setDone(idx, !isDone(idx));
          paintAll();
        });
        list.appendChild(c);
      })(GM.steps[i], i);
    }
  }

  /* ---------------- floating bar ---------------- */
  var bar;
  function buildBar(){
    bar = el('div', 'gm-bar');
    bar.id = 'gmBar';
    bar.hidden = true;
    document.body.appendChild(bar);
  }

  /* ---------------- the travelling cue ---------------- */
  var cue = null, peek = null, cueHidden = {};

  function buildCue(){
    if(cue) return;
    cue = el('div', 'gm-cue');
    document.body.appendChild(cue);
    peek = el('button', 'gm-peek');
    peek.type = 'button';
    peek.addEventListener('click', function(){
      cueHidden[S.cur] = false; paintCue();
    });
    document.body.appendChild(peek);
  }

  function hideCue(){
    if(cue) cue.classList.remove('show');
    if(peek) peek.classList.remove('show');
  }

  function paintCue(){
    buildCue();
    var st = GM.steps[S.cur];
    /* only while the reader is actually standing on this step's screen */
    var here = st && st.route && document.getElementById(st.route) &&
               document.getElementById(st.route).classList.contains('route-on');
    if(!S.on || !here){ hideCue(); return; }

    if(cueHidden[S.cur]){
      cue.classList.remove('show');
      peek.textContent = '？ ' + T(GM.cueShow);
      peek.classList.add('show');
      return;
    }
    peek.classList.remove('show');

    var last = S.cur >= N - 1;
    cue.innerHTML =
      '<div class="gm-cue-h">' + st.ic +
        '<b>' + esc(T(st.t)) + '</b>' +
        '<button type="button" class="gm-cue-x" data-c="x" title="' + esc(T(GM.cueHide)) + '">✕</button>' +
      '</div>' +
      '<div class="gm-cue-b">' +
        '<div class="gm-cue-r"><i>' + esc(T(GM.cueWhat)) + '</i>' + esc(T(st.goal)) + '</div>' +
        '<div class="gm-cue-r"><i>' + esc(T(GM.cueLook)) + '</i>' + esc(T(st.look)) + '</div>' +
        (st.tip ? '<div class="gm-cue-r eg"><i>' + esc(T(GM.cueEg)) + '</i>' + esc(T(st.tip)) + '</div>' : '') +
      '</div>' +
      '<div class="gm-cue-n">' +
        (S.cur > 0 ? '<button type="button" data-c="prev">← ' + esc(T(GM.prevBtn)) + '</button>' : '') +
        '<button type="button" class="pri" data-c="next">' +
          esc(last ? T(GM.finBtn) : T(GM.nextBtn)) + ' →</button>' +
      '</div>';
    cue.classList.add('show');

    cue.querySelector('[data-c="x"]').addEventListener('click', function(){
      cueHidden[S.cur] = true; paintCue();
    });
    var pv = cue.querySelector('[data-c="prev"]');
    if(pv) pv.addEventListener('click', function(){ openStep(S.cur - 1); });
    cue.querySelector('[data-c="next"]').addEventListener('click', function(){
      setDone(S.cur, true);
      if(last){
        var a = document.querySelector('[data-route-to="guided"]');
        if(a) a.click();
        paintAll();
      } else openStep(S.cur + 1);
    });
  }

  function paintBar(){
    if(!bar) return;
    document.body.classList.toggle('gm-live', S.on);
    bar.hidden = !S.on;
    if(!S.on){ bar.innerHTML = ''; return; }

    var st = GM.steps[S.cur];
    var last = S.cur >= N - 1;
    var dots = '';
    for(var i = 0; i < N; i++){
      dots += '<span class="gm-dot' + (isDone(i) ? ' done' : '') + (i === S.cur ? ' cur' : '') + '"></span>';
    }
    bar.innerHTML =
      '<span class="gm-bar-l"><span class="gm-bar-s">' + st.ic + ' ' +
        esc(T(GM.stepOf).replace('%A', S.cur + 1).replace('%B', N)) + '</span>' +
        '<span class="gm-bar-t">' + esc(T(st.t)) + '</span></span>' +
      '<span class="gm-bar-b">' +
        (S.cur > 0 ? '<button type="button" class="gm-b" data-a="prev">← ' + esc(T(GM.prevBtn)) + '</button>' : '') +
        '<button type="button" class="gm-b" data-a="open">' + esc(T(GM.goBtn)) + '</button>' +
        '<button type="button" class="gm-b pri" data-a="next">' +
          esc(last ? T(GM.finBtn) : T(GM.nextBtn)) + ' →</button>' +
        '<button type="button" class="gm-b x" data-a="off">✕ ' + esc(T(GM.offShort)) + '</button>' +
      '</span>' +
      '<span class="gm-dots">' + dots + '</span>';

    var p = bar.querySelector('[data-a="prev"]');
    if(p) p.addEventListener('click', function(){ openStep(S.cur - 1); });
    bar.querySelector('[data-a="open"]').addEventListener('click', function(){ openStep(S.cur); });
    bar.querySelector('[data-a="next"]').addEventListener('click', function(){
      setDone(S.cur, true);
      if(last){
        var a = document.querySelector('[data-route-to="guided"]');
        if(a) a.click();
        paintAll();
      } else openStep(S.cur + 1);
    });
    bar.querySelector('[data-a="off"]').addEventListener('click', function(){
      S.on = false; save(); hideCue(); paintAll();
    });
  }

  /* ---------------- final summary, computed from the same engine ---------------- */
  function paintSum(){
    var host = document.querySelector('#guided [data-gm="sum"]');
    if(!host) return;
    var rank = window.__SPZ_RANK, why = window.__SPZ_WHY;
    if(!rank){ host.innerHTML = ''; return; }

    var all = doneCount() >= N;
    host.innerHTML = '<div class="v8-sub">' + esc(T(GM.sumH)) + '</div>';

    if(!all && !S.peek){
      var lock = el('div', 'gm-lock',
        '<div class="gm-lock-t">🔒 ' + esc(T(GM.sumLock).replace('%N', N)) + '</div>' +
        '<button type="button" class="gm-b pri">' + esc(T(GM.sumOpen)) + '</button>');
      lock.querySelector('button').addEventListener('click', function(){ S.peek = true; paintSum(); });
      host.appendChild(lock);
      return;
    }

    /* only the market question stays up front — which market you actually
       trade is a personal fact, not an analysis choice. The weighting
       question moves into the secondary section below: switching it does
       not correct the headline answer, it asks a different question, and
       showing five rankings side by side with no explanation was what
       confused a first-time reader here. */
    var ctl = el('div', 'gm-ctl');
    function seg(q, list, cur, cb){
      var row = el('div', 'gm-crow');
      row.appendChild(el('span', 'gm-cq', esc(T(q))));
      for(var i = 0; i < list.length; i++){
        (function(o){
          var b = el('button', 'gm-cb' + (cur === o.id ? ' on' : ''), esc(T(o.l)));
          b.type = 'button';
          b.addEventListener('click', function(){ cb(o.id); save(); paintSum(); });
          row.appendChild(b);
        })(list[i]);
      }
      return row;
    }
    ctl.appendChild(seg(GM.mktQ, GM.mkts, S.mkt, function(v){ S.mkt = v; }));
    host.appendChild(ctl);

    var balRows = rank({ mkt:S.mkt, preset:'bal' });
    var uni = balRows.length;
    var cy = window.SPZ_CYCLE;
    var lead = el('p', 'lede');
    lead.style.margin = '14px 0 16px';
    lead.textContent = T(GM.sumLead).replace('%N', (window.__SPZ_DIR
      ? Object.keys(window.__SPZ_DIR).reduce(function(a, k){ return a + window.__SPZ_DIR[k].length; }, 0) : uni));
    host.appendChild(lead);

    if(cy){
      host.appendChild(el('div', 'gm-using',
        esc(T(GM.usingH)) + ': ' + esc(T(cy.label())) +
        ' · ' + esc(cy.asOf) + ' · ' + esc(T({en:'flow map',th:'แผนที่กระแสเงิน'})) +
        ' · P/E · ROE · D/E · P/B'));

      /* the regime → sector → rotation line: computed from the same flow
         table the ranking already uses, not a separate hand-written claim */
      var fm = window.__SPZ_FLOWMAP ? window.__SPZ_FLOWMAP(cy.phase) : null;
      if(fm){
        var lg = L(), sep = (lg === 'th') ? ' · ' : ', ';
        var topL = fm.top.map(function(r){ return fm.label(r.sec, lg); }).join(sep);
        var botL = fm.bottom.map(function(r){ return fm.label(r.sec, lg); }).join(sep);
        host.appendChild(el('p', 'gm-flow-line',
          esc(T(GM.flowInto)) + ' <b>' + esc(topL) + '</b> ' +
          esc(T(GM.flowOutof)) + ' <b>' + esc(botL) + '</b>.'));
      }

      /* the headline: one decisive sentence built from the Balanced
         ranking, not just a bare list of cards — this is meant to read
         as an actual answer to "so what should I put money into now",
         synthesising the cycle read, the flow map above and the
         fundamentals/macro that feed the ranking engine. */
      if(balRows.length){
        var top0 = balRows[0], topWhy = why ? why(top0) : [];
        var descObj0 = window.__SPZ_STOCK_DESC ? window.__SPZ_STOCK_DESC(top0.s.tk) : null;
        var nextTk = balRows.slice(1, 3).map(function(r){ return '$' + r.s.tk; });
        var hl = esc(T(GM.hlPick)) + ' <b>$' + esc(top0.s.tk) + '</b> (' + esc(T(top0.s.nm)) + ')' +
          (topWhy.length ? ' — ' + esc(topWhy.join(' · ')) + '.' : '.') +
          (descObj0 ? ' ' + esc(T(descObj0)) : '') +
          (nextTk.length ? ' ' + esc(T(GM.hlNext)) + ' ' + esc(nextTk.join(', ')) + '.' : '');
        host.appendChild(el('p', 'gm-headline', hl));
      }
    }

    /* shared card renderer — used for both the Balanced headline list and
       the alternate-weighting section below, so the two never drift apart */
    function pickEl(r, idx){
      var st = r.s;
      var w = why ? why(r) : [];
      var met = [['P/E', st.pe, '', 'pe'], [T({en:'Yield',th:'ปันผล'}), st.div, '%', 'div'], ['ROE', st.roe, '%', 'roe'],
                 ['D/E', st.de, '', 'de'], [T({en:'Margin',th:'มาร์จิ้น'}), st.mg, '%', 'mg'], ['P/B', st.pb, '', 'pb']];
      var mh = '';
      for(var k = 0; k < met.length; k++){
        var tip = window.__SPZ_MTIP ? window.__SPZ_MTIP(met[k][3]) : '';
        mh += '<span class="gm-m"><b' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + esc(met[k][0]) + '</b>' +
              (isFinite(met[k][1]) ? met[k][1] + met[k][2] : '—') + '</span>';
      }
      var descObj = window.__SPZ_STOCK_DESC ? window.__SPZ_STOCK_DESC(st.tk) : null;
      var descTxt = descObj ? T(descObj) : '';
      var c = el('div', 'gm-pick' + (idx === 0 ? ' first' : ''),
        '<span class="gm-pn">' + (idx + 1) + '</span>' +
        '<span class="gm-pb"><span class="gm-pt"><span class="gm-ptk">$' + esc(st.tk) + '</span>' +
          '<span class="gm-pnm">' + esc(T(st.nm)) + '</span>' +
          '<span class="gm-ptag">' + esc(st.mkt) + ' · ' + esc(st.sec) + ' · ' + esc(st.arch) + '</span>' +
          '<span class="gm-psc">' + r.total.toFixed(1) + '</span></span>' +
          '<span class="gm-pw">' + esc(w.join(' · ')) + '</span>' +
          (descTxt ? '<span class="gm-pd"><b>' + esc(T(GM.descLbl)) + ':</b> ' + esc(descTxt) + '</span>' : '') +
          '<span class="gm-pm">' + mh + '</span></span>');
      c.addEventListener('click', function(){
        var a = document.querySelector('[data-route-to="desk"]');
        if(a) a.click();
      });
      return c;
    }

    var list = el('div', 'gm-picks');
    for(var i = 0; i < Math.min(5, balRows.length); i++) list.appendChild(pickEl(balRows[i], i));
    host.appendChild(list);

    /* secondary, collapsed by default: the same ranking under a different
       weighting, for anyone who wants to change what "best" means instead
       of trusting the Balanced default above */
    var alt = el('div', 'gm-alt');
    var altBtn = el('button', 'gm-b gm-alt-btn',
      (altOpen ? '▾ ' : '▸ ') + esc(altOpen ? T(GM.altClose) : T(GM.altToggle)));
    altBtn.type = 'button';
    altBtn.addEventListener('click', function(){ altOpen = !altOpen; paintSum(); });
    alt.appendChild(altBtn);
    if(altOpen){
      alt.appendChild(el('p', 'gm-alt-l', esc(T(GM.altL))));
      var actl = el('div', 'gm-ctl');
      actl.appendChild(seg(GM.styQ, GM.stys, S.sty, function(v){ S.sty = v; }));
      alt.appendChild(actl);
      var altRows = rank({ mkt:S.mkt, preset:S.sty });
      var altList = el('div', 'gm-picks alt');
      for(var m = 0; m < Math.min(3, altRows.length); m++) altList.appendChild(pickEl(altRows[m], m));
      alt.appendChild(altList);
    }
    host.appendChild(alt);

    var rl = el('div', 'gm-rules', '<div class="gm-rh">' + esc(T(GM.rulesH)) + '</div>');
    var arr = GM.rules[L()] || GM.rules.en;
    var ul = el('ul');
    for(var j = 0; j < arr.length; j++) ul.appendChild(el('li', null, esc(arr[j])));
    rl.appendChild(ul);
    host.appendChild(rl);
  }


  function paintAll(){ paintPage(); paintSum(); paintBar(); paintCue(); }

  /* the cue only makes sense on the screen its step points at, so it has to
     re-evaluate on every route change, not only when the walkthrough moves */
  window.addEventListener('hashchange', function(){ setTimeout(paintCue, 260); });
  document.addEventListener('click', function(e){
    if(e.target.closest && e.target.closest('[data-route-to]')) setTimeout(paintCue, 260);
  });

  /* the summary is built from the live cycle call, so it has to follow it */
  document.addEventListener('spz:cycle', function(){ setTimeout(paintSum, 60); });
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-route-to="guided"]');
    if(a) setTimeout(paintSum, 220);
  });

  /* ---------------- boot ---------------- */
  function boot(){
    load();
    if(document.getElementById('guided')) return;
    var s = build();
    s.setAttribute('data-route', 'guided');
    var anchor = document.getElementById('start') || document.getElementById('outlook');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(s, anchor);
    else document.body.appendChild(s);

    buildBar();

    if(window.__spzAddRoute){
      window.__spzAddRoute({
        id:'guided', feat:true, after:null, group:'learn',
        t:{en:'Guided Mode',th:'โหมดแนะนำ'},
        d:{en:'Ten steps in the order that works, with a next-step bar that follows you across the site. Off by default.',
           th:'สิบขั้นตอนเรียงตามลำดับที่ใช้ได้จริง พร้อมแถบไปขั้นถัดไปที่ตามคุณไปทุกหน้า ปิดอยู่เป็นค่าเริ่มต้น'}
      });
    }

    paintAll();

    new MutationObserver(function(){ try { paintAll(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    /* tick a step off automatically once you actually visit its page */
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('[data-route-to]');
      if(!a || !S.on) return;
      var r = a.getAttribute('data-route-to');
      setTimeout(function(){
        for(var i = 0; i < N; i++){
          if(GM.steps[i].route === r && i === S.cur && !isDone(i)){ setDone(i, true); paintAll(); return; }
        }
      }, 400);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 700); });
  else setTimeout(boot, 700);
})();
