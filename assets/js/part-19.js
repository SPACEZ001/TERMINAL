
/* ============================================================================
   SPACEZ TERMINAL v15 — LIVE PHASE READOUT + PHASE TRANSITION SIMULATOR
   Appends to the Capital Flow page.
   ========================================================================= */
(function(){
  'use strict';

/* ============================================================================
   PHASE TRANSITION ENGINE — where we are, and how money moves when it changes
   ========================================================================= */
var TRANS = {
  sH:{en:'Where we are right now',th:'ตอนนี้เราอยู่ตรงไหน'},
  sT:{en:'How the money moves when the phase turns',th:'เมื่อวัฏจักรพลิก เงินเคลื่อนยังไง'},

  modeLive:{en:'Live reading',th:'ตอนนี้จริง'},
  modeSim:{en:'Transition simulator',th:'โหมดจำลอง'},

  live:{
    phase:{en:'Mid cycle',th:'กลางวัฏจักร'},
    sub:{en:'Broad expansion, leadership widening',th:'ขยายตัวกว้าง กลุ่มผู้นำกระจายออก'},
    conf:{en:'5 of 6 indicators agree',th:'ตัวชี้วัด 5 จาก 6 ตัวตรงกัน'},
    body:{en:'Manufacturing and services are both expanding, business investment is running hot, and earnings revisions are broadly positive. Only inflation leans late. The money is behaving accordingly: it is still buying equities, just spreading them across more of the world.',
          th:'ทั้งภาคผลิตและภาคบริการขยายตัว การลงทุนภาคธุรกิจร้อนแรง และการปรับประมาณการกำไรเป็นบวกกว้าง มีแค่เงินเฟ้อที่เอียงไปทางปลายวัฏจักร กระแสเงินก็ทำตัวสอดคล้อง — ยังซื้อหุ้นอยู่ แค่กระจายไปทั่วโลกมากขึ้น'},
    nowFlow:{en:'Right now the money is moving: US domestic equity funds → world equity, long duration → short duration, and everything → the ETF wrapper. That last one is not a cycle signal.',
             th:'ตอนนี้เงินกำลังเคลื่อนแบบนี้: กองทุนหุ้นสหรัฐฯ → หุ้นทั่วโลก, ตราสารหนี้ยาว → ตราสารหนี้สั้น, และทุกอย่าง → โครงสร้าง ETF อันสุดท้ายไม่ใช่สัญญาณวัฏจักร'},
    nextH:{en:'Most likely next',th:'ที่น่าจะเป็นถัดไป'},
    next:{en:'Late cycle',th:'ปลายวัฏจักร'},
    nextWhy:{en:'Inflation above target with tariff pressure is the one late-cycle marker already showing. But mid cycle is the longest phase there is — it can run for years, stall and restart, or be skipped entirely by a shock. Treat this as the next most likely state, not the next scheduled step.',
             th:'เงินเฟ้อสูงกว่าเป้าพร้อมแรงกดดันจากภาษีนำเข้า คือเครื่องหมายของปลายวัฏจักรตัวเดียวที่โผล่มาแล้ว แต่กลางวัฏจักรเป็นช่วงที่ยาวที่สุด มันวิ่งได้หลายปี ชะลอแล้วกลับมาโตต่อได้ หรือถูกข้ามไปเลยถ้าเจอแรงกระแทก ให้ถือว่านี่คือสถานะที่น่าจะเป็นถัดไป ไม่ใช่ขั้นตอนที่ถูกกำหนดไว้'},
    altH:{en:'The other two paths',th:'อีกสองทางที่เป็นไปได้'},
    alts:{en:['Mid cycle extends — ISM holds above 50, capex keeps growing, inflation grinds lower without a policy shock. Historically the most common outcome from a strengthening mid-cycle reading.',
              'Straight to recession — a large enough shock (oil, credit, an AI capex reversal) skips the late phase entirely, the way 2020 did in a matter of weeks.'],
          th:['กลางวัฏจักรยืดออกไป — ISM ยืนเหนือ 50 การลงทุนยังโต เงินเฟ้อค่อยๆ ลดโดยไม่มีแรงกระแทกเชิงนโยบาย ในอดีตนี่คือผลลัพธ์ที่พบบ่อยที่สุดจากค่ากลางวัฏจักรที่กำลังแข็งแรงขึ้น',
              'กระโดดไปถดถอยเลย — แรงกระแทกที่ใหญ่พอ (น้ำมัน สินเชื่อ หรือการลงทุน AI พลิกกลับ) ข้ามช่วงปลายไปเลย แบบที่ปี 2020 ทำได้ในไม่กี่สัปดาห์']}
  },

  simLede:{en:'Pick a transition. The diagram shows which sectors drain and which fill, then lists the signals that come first, the signals that confirm, and the traps that look identical but are not.',
           th:'เลือกการเปลี่ยนช่วง แผนภาพจะแสดงว่ากลุ่มไหนเงินไหลออกและกลุ่มไหนเงินไหลเข้า แล้วไล่ให้ดูว่าสัญญาณอะไรมาก่อน สัญญาณอะไรยืนยัน และกับดักอะไรที่หน้าตาเหมือนกันแต่ไม่ใช่'},

  lbl:{
    early:{en:'Early warnings — these move first',th:'สัญญาณเตือนล่วงหน้า — พวกนี้ขยับก่อน'},
    conf:{en:'Confirmations — these mean it is real',th:'สัญญาณยืนยัน — พวกนี้แปลว่าของจริง'},
    trap:{en:'Looks the same but is not',th:'หน้าตาเหมือนกันแต่ไม่ใช่'},
    out:{en:'Money leaves',th:'เงินไหลออกจาก'},
    in:{en:'Money arrives',th:'เงินไหลเข้าสู่'},
    ex:{en:'Example names in the receiving sectors',th:'หุ้นตัวอย่างในกลุ่มที่รับเงิน'},
    act:{en:'What it means for a portfolio',th:'แปลว่าอะไรสำหรับพอร์ต'},
    lead:{en:'Typical lead time',th:'ระยะเวลานำโดยทั่วไป'}
  },

  t:[
    {id:'e2m', a:{en:'Early',th:'ต้น'}, b:{en:'Mid',th:'กลาง'},
     head:{en:'Early → Mid',th:'ต้น → กลาง'},
     lead:{en:'3–6 months of overlap',th:'คาบเกี่ยวกัน 3–6 เดือน'},
     n:{en:'The rebound trade matures. The easy money from buying anything beaten-up is over, and leadership narrows toward companies that can actually compound earnings rather than just recover them.',
        th:'การเทรดขาเด้งโตเต็มที่ เงินง่ายจากการซื้ออะไรก็ได้ที่ถูกทุบหมดไปแล้ว กลุ่มผู้นำแคบลงมาที่บริษัทที่ทำกำไรทบต้นได้จริง ไม่ใช่แค่ฟื้นกลับมาเท่าเดิม'},
     out:[{l:{en:'Deep-value rebound plays',th:'หุ้นเด้งจากคุณค่าลึก'},w:6},
          {l:{en:'Micro & small caps',th:'หุ้นเล็กมากและหุ้นเล็ก'},w:5},
          {l:{en:'High-beta cyclicals',th:'หุ้นวัฏจักรเบต้าสูง'},w:4}],
     into:[{l:{en:'Technology',th:'เทคโนโลยี'},w:7},
           {l:{en:'Industrials & capital goods',th:'อุตสาหกรรมและสินค้าทุน'},w:6},
           {l:{en:'Communication',th:'สื่อสาร'},w:4},
           {l:{en:'Quality large caps',th:'หุ้นใหญ่คุณภาพ'},w:5}],
     ex:['MSFT','NVDA','AVGO','META','DELTA','GULF','AOT','SCC'],
     w1:{en:['Small-cap outperformance stalling after 2–3 strong quarters',
             'Credit spreads stop narrowing and go flat',
             'Earnings revision breadth shifting from "recovery" beats to "growth" beats',
             'ISM readings settling into the mid-50s instead of spiking'],
         th:['หุ้นเล็กหยุดทำผลงานชนะตลาดหลังจากแข็งมา 2–3 ไตรมาส',
             'ส่วนต่างเครดิตหยุดแคบลงและเริ่มทรงตัว',
             'ความกว้างการปรับกำไรเปลี่ยนจาก "ชนะเพราะฟื้นตัว" เป็น "ชนะเพราะโต"',
             'ค่า ISM นิ่งอยู่แถวกลางๆ 50 แทนที่จะพุ่ง']},
     w2:{en:['Two consecutive quarters of positive but slower GDP growth',
             'Capital goods orders growing on a sustained year-on-year basis',
             'Policy rate stops falling',
             'Large-cap growth ETFs taking share of flows from small-cap ETFs'],
         th:['GDP โตเป็นบวกแต่ช้าลงสองไตรมาสติด',
             'คำสั่งซื้อสินค้าทุนโตต่อเนื่องเมื่อเทียบปีก่อน',
             'อัตราดอกเบี้ยนโยบายหยุดลด',
             'ETF หุ้นใหญ่เติบโตแย่งส่วนแบ่งกระแสเงินจาก ETF หุ้นเล็ก']},
     trap:{en:'A single quarter of small-cap weakness inside an early cycle is normal noise. The transition needs the flow shift and the earnings-quality shift together, not one of them.',
           th:'หุ้นเล็กอ่อนแอไตรมาสเดียวในช่วงต้นวัฏจักรคือเสียงรบกวนปกติ การเปลี่ยนช่วงต้องมีทั้งการเปลี่ยนกระแสเงินและการเปลี่ยนคุณภาพกำไรพร้อมกัน ไม่ใช่อย่างใดอย่างหนึ่ง'},
     act:{en:['Stop adding to the deepest-value names and let winners run instead',
              'Shift new money toward businesses with durable earnings growth, not just cheap ones',
              'This is the phase to be fully invested — historically the longest and steadiest'],
          th:['หยุดถัวเพิ่มในหุ้นคุณค่าที่ลึกที่สุด แล้วปล่อยให้ตัวที่วิ่งอยู่วิ่งต่อ',
              'ย้ายเงินใหม่ไปหาธุรกิจที่กำไรโตได้ยั่งยืน ไม่ใช่แค่ตัวที่ถูก',
              'นี่คือช่วงที่ควรลงทุนเต็มที่ เพราะในอดีตเป็นช่วงที่ยาวและนิ่งที่สุด']}},

    {id:'m2l', a:{en:'Mid',th:'กลาง'}, b:{en:'Late',th:'ปลาย'},
     head:{en:'Mid → Late',th:'กลาง → ปลาย'},
     lead:{en:'6–12 months, and the index often keeps making highs throughout',th:'6–12 เดือน และดัชนีมักทำจุดสูงสุดใหม่ตลอดช่วงนี้'},
     n:{en:'This is the transition that matters to you right now. Growth is still there but margins start compressing because wages, input costs and rates all sit high at once. Money quietly moves toward businesses that own real assets or can raise prices — while the headline index still looks fine.',
        th:'นี่คือการเปลี่ยนช่วงที่เกี่ยวกับคุณตอนนี้ การเติบโตยังอยู่แต่อัตรากำไรเริ่มถูกบีบ เพราะค่าแรง ต้นทุน และดอกเบี้ยสูงพร้อมกัน เงินค่อยๆ ย้ายไปหาธุรกิจที่ถือสินทรัพย์จริงหรือขึ้นราคาได้ ในขณะที่ดัชนีพาดหัวยังดูดีอยู่'},
     out:[{l:{en:'Long-duration growth',th:'หุ้นเติบโตระยะยาวไกล'},w:7},
          {l:{en:'Consumer discretionary',th:'สินค้าฟุ่มเฟือย'},w:6},
          {l:{en:'High-leverage names',th:'หุ้นหนี้สูง'},w:5},
          {l:{en:'Unprofitable growth',th:'หุ้นโตที่ยังขาดทุน'},w:4}],
     into:[{l:{en:'Energy',th:'พลังงาน'},w:6},
           {l:{en:'Materials',th:'วัสดุ'},w:5},
           {l:{en:'Healthcare',th:'สุขภาพ'},w:6},
           {l:{en:'Consumer staples',th:'สินค้าจำเป็น'},w:5},
           {l:{en:'Short-duration bonds',th:'ตราสารหนี้อายุสั้น'},w:6}],
     ex:['XOM','CVX','JNJ','ABT','PG','KO','PTT','PTTEP','SCC','BDMS','BH','CPALL'],
     w1:{en:['Defensive sectors outperforming while the index still rises — the clearest single tell',
             'Commodity and gold ETF inflows accelerating for more than a month',
             'Net margin compressing across several sectors at once, not just one',
             'Inflation prints stopping their decline or re-accelerating',
             'Yield curve flattening after a period of steepening',
             'Short-duration bond ETFs taking a rising share of total fixed income flows'],
         th:['กลุ่มตั้งรับทำผลงานชนะตลาดทั้งที่ดัชนียังขึ้น — เป็นสัญญาณเดี่ยวที่ชัดที่สุด',
             'เงินเข้า ETF สินค้าโภคภัณฑ์และทองคำเร่งขึ้นต่อเนื่องเกินหนึ่งเดือน',
             'อัตรากำไรสุทธิถูกบีบพร้อมกันหลายกลุ่ม ไม่ใช่แค่กลุ่มเดียว',
             'ตัวเลขเงินเฟ้อหยุดลดหรือกลับมาเร่ง',
             'เส้นอัตราผลตอบแทนแบนลงหลังจากชันมาก่อน',
             'ETF ตราสารหนี้อายุสั้นกินส่วนแบ่งกระแสเงินตราสารหนี้มากขึ้นเรื่อยๆ']},
     w2:{en:['Two consecutive ISM manufacturing readings below 50',
             'Core capital goods orders turning negative year on year',
             'Earnings revision breadth flipping negative',
             'Energy and staples both taking inflows in the same month — one alone can be a commodity shock',
             'Wage growth outpacing productivity for two quarters'],
         th:['ค่า ISM ภาคผลิตต่ำกว่า 50 สองครั้งติด',
             'คำสั่งซื้อสินค้าทุนหลักติดลบเมื่อเทียบปีก่อน',
             'ความกว้างการปรับประมาณการกำไรพลิกเป็นลบ',
             'พลังงานและสินค้าจำเป็นได้เงินเข้าพร้อมกันในเดือนเดียวกัน — ถ้ามีแค่อย่างเดียวอาจเป็นแค่แรงกระแทกราคาสินค้าโภคภัณฑ์',
             'ค่าแรงโตแซงผลิตภาพสองไตรมาสติด']},
     trap:{en:'An oil price spike produces energy inflows that look exactly like late-cycle rotation but carry no cycle information at all. The test is whether staples and healthcare are also receiving money. Energy alone is a commodity story; energy plus defensives is a cycle story.',
           th:'ราคาน้ำมันพุ่งทำให้เงินเข้ากลุ่มพลังงานเหมือนการหมุนกลุ่มปลายวัฏจักรเป๊ะ แต่ไม่ได้บอกอะไรเกี่ยวกับวัฏจักรเลย ตัวทดสอบคือสินค้าจำเป็นและสุขภาพได้เงินด้วยไหม พลังงานอย่างเดียวคือเรื่องสินค้าโภคภัณฑ์ พลังงานบวกหุ้นตั้งรับถึงจะเป็นเรื่องวัฏจักร'},
     act:{en:['Raise quality: prefer low debt, positive free cash flow and real pricing power',
              'Trim the most leveraged and the longest-duration growth positions first',
              'Do not sell everything — late cycle has historically produced strong index returns right up to the end',
              'Let rebalancing do the rotation for you instead of trying to time the switch'],
          th:['ยกคุณภาพพอร์ต: เลือกหนี้ต่ำ กระแสเงินสดอิสระเป็นบวก และมีอำนาจตั้งราคาจริง',
              'ลดหุ้นที่หนี้สูงที่สุดและหุ้นเติบโตที่ระยะยาวไกลที่สุดก่อน',
              'อย่าขายทิ้งทั้งหมด — ในอดีตปลายวัฏจักรให้ผลตอบแทนดัชนีที่ดีจนถึงวันสุดท้าย',
              'ให้การปรับสมดุลพอร์ตทำหน้าที่หมุนกลุ่มแทนคุณ ดีกว่าพยายามจับจังหวะสลับเอง']}},

    {id:'l2r', a:{en:'Late',th:'ปลาย'}, b:{en:'Recession',th:'ถดถอย'},
     head:{en:'Late → Recession',th:'ปลาย → ถดถอย'},
     lead:{en:'Markets turn 6–9 months before the data confirms it',th:'ตลาดกลับตัวก่อนข้อมูลยืนยัน 6–9 เดือน'},
     n:{en:'Correlations converge toward one. Everything risky gets sold at the same time regardless of quality, and only three things reliably hold up. This is also where the best entries of the next cycle are made, which is why it feels so wrong to buy here.',
        th:'ค่าสหสัมพันธ์วิ่งเข้าหากันจนเกือบเป็นหนึ่ง ของเสี่ยงทุกอย่างถูกขายพร้อมกันไม่ว่าคุณภาพจะดีแค่ไหน และมีแค่สามอย่างที่ทนได้จริง นี่ก็เป็นจุดที่จังหวะเข้าซื้อที่ดีที่สุดของวัฏจักรถัดไปเกิดขึ้น ซึ่งเป็นเหตุผลว่าทำไมการซื้อตรงนี้ถึงรู้สึกผิดที่ผิดทางมาก'},
     out:[{l:{en:'Cyclicals',th:'หุ้นวัฏจักร'},w:7},
          {l:{en:'Energy & materials',th:'พลังงานและวัสดุ'},w:5},
          {l:{en:'High debt',th:'หุ้นหนี้สูง'},w:6},
          {l:{en:'Small caps',th:'หุ้นเล็ก'},w:5}],
     into:[{l:{en:'Utilities',th:'สาธารณูปโภค'},w:6},
           {l:{en:'Consumer staples',th:'สินค้าจำเป็น'},w:6},
           {l:{en:'Healthcare',th:'สุขภาพ'},w:5},
           {l:{en:'Long-duration bonds',th:'พันธบัตรอายุยาว'},w:7},
           {l:{en:'Gold',th:'ทองคำ'},w:5}],
     ex:['DUK','SO','KO','PG','JNJ','ABT','RATCH','EGCO','ADVANC','BDMS','CPF'],
     w1:{en:['Credit spreads widening sharply — this leads equities',
             'Long-duration bond ETFs flipping from outflows to inflows',
             'Gold rising while bond yields fall (not while they rise)',
             'Unemployment claims trending up for several weeks',
             'Consumer discretionary underperforming staples by a widening margin'],
         th:['ส่วนต่างเครดิตกว้างขึ้นอย่างรวดเร็ว — ตัวนี้นำหน้าหุ้น',
             'ETF พันธบัตรอายุยาวพลิกจากเงินไหลออกเป็นไหลเข้า',
             'ทองขึ้นพร้อมผลตอบแทนพันธบัตรที่ลดลง (ไม่ใช่ตอนที่ผลตอบแทนขึ้น)',
             'ยอดขอรับสวัสดิการว่างงานเพิ่มขึ้นต่อเนื่องหลายสัปดาห์',
             'สินค้าฟุ่มเฟือยแพ้สินค้าจำเป็นด้วยระยะห่างที่กว้างขึ้นเรื่อยๆ']},
     w2:{en:['Output, employment, income and sales all falling together — not just two negative GDP quarters',
             'Money market assets climbing every single week',
             'Equity outflows broadening across every region at once',
             'Yield curve re-steepening after an inversion — this often marks the start, not the end'],
         th:['ผลผลิต การจ้างงาน รายได้ และยอดขาย ลดลงพร้อมกัน — ไม่ใช่แค่ GDP ติดลบสองไตรมาส',
             'สินทรัพย์กองทุนตลาดเงินเพิ่มขึ้นทุกสัปดาห์ไม่มีเว้น',
             'เงินไหลออกจากหุ้นกระจายไปทุกภูมิภาคพร้อมกัน',
             'เส้นอัตราผลตอบแทนกลับมาชันหลังจากเคยกลับหัว — อันนี้มักเป็นจุดเริ่ม ไม่ใช่จุดจบ']},
     trap:{en:'Gold rising alongside rising yields is an inflation trade, not a recession trade. The bond leg is what separates the two, and getting it backwards means buying defensives right before a melt-up.',
           th:'ทองขึ้นพร้อมผลตอบแทนพันธบัตรที่ขึ้นด้วย คือการเทรดเงินเฟ้อ ไม่ใช่การเทรดภาวะถดถอย ขาพันธบัตรคือสิ่งที่แยกสองอย่างนี้ และถ้าอ่านกลับด้าน คุณจะไปซื้อหุ้นตั้งรับพอดีก่อนตลาดพุ่ง'},
     act:{en:['Balance-sheet strength beats everything else — check interest coverage before yield',
              'Keep buying on your schedule if you can afford to; this is where future returns are bought cheaply',
              'A dividend is only defensive if free cash flow covers it — check payout on FCF, not on EPS',
              'Do not use leverage here under any circumstances'],
          th:['ความแข็งแรงของงบดุลสำคัญกว่าทุกอย่าง — เช็ค Interest Coverage ก่อนดู yield',
              'ถ้ายังไหวให้ซื้อตามตารางต่อไป เพราะนี่คือจุดที่ผลตอบแทนในอนาคตถูกซื้อมาในราคาถูก',
              'ปันผลจะตั้งรับได้ก็ต่อเมื่อกระแสเงินสดอิสระจ่ายไหว — ให้ดู payout บน FCF ไม่ใช่บน EPS',
              'ห้ามใช้เลเวอเรจตรงนี้ไม่ว่ากรณีใดทั้งสิ้น']}},

    {id:'r2e', a:{en:'Recession',th:'ถดถอย'}, b:{en:'Early',th:'ต้น'},
     head:{en:'Recession → Early',th:'ถดถอย → ต้น'},
     lead:{en:'The turn happens while the news is still bad',th:'การกลับตัวเกิดขึ้นตอนที่ข่าวยังแย่อยู่'},
     n:{en:'The hardest transition to act on, because every headline still says sell. Policy turns supportive, the curve re-steepens, and the record cash pile starts moving back into the most beaten-up, most economically sensitive names first.',
        th:'การเปลี่ยนช่วงที่ลงมือยากที่สุด เพราะพาดหัวข่าวทุกอันยังบอกให้ขาย นโยบายกลับมาสนับสนุน เส้นอัตราผลตอบแทนชันขึ้นใหม่ และกองเงินสดมหาศาลเริ่มไหลกลับเข้าหุ้นที่โดนทุบหนักที่สุดและอ่อนไหวต่อเศรษฐกิจที่สุดก่อน'},
     out:[{l:{en:'Money market cash',th:'เงินสดในตลาดเงิน'},w:8},
          {l:{en:'Gold',th:'ทองคำ'},w:4},
          {l:{en:'Long-duration bonds',th:'พันธบัตรอายุยาว'},w:5}],
     into:[{l:{en:'Cyclicals',th:'หุ้นวัฏจักร'},w:7},
           {l:{en:'Financials',th:'การเงิน'},w:6},
           {l:{en:'Small caps',th:'หุ้นเล็ก'},w:6},
           {l:{en:'Consumer discretionary',th:'สินค้าฟุ่มเฟือย'},w:5}],
     ex:['JPM','BAC','C','GM','F','AMZN','KBANK','SCB','KTB','MINT','AOT','TDEX'],
     w1:{en:['Money market assets falling for four or more consecutive weeks',
             'Credit spreads narrowing while equity headlines are still negative',
             'Small-cap ETFs starting to outpace large-cap ETFs',
             'Yield curve steepening from an inverted position',
             'Housing and auto data bottoming before employment does'],
         th:['สินทรัพย์กองทุนตลาดเงินลดลงต่อเนื่องสี่สัปดาห์ขึ้นไป',
             'ส่วนต่างเครดิตแคบลงในขณะที่พาดหัวข่าวหุ้นยังเป็นลบ',
             'ETF หุ้นเล็กเริ่มได้เงินเข้ามากกว่า ETF หุ้นใหญ่',
             'เส้นอัตราผลตอบแทนชันขึ้นจากสภาพกลับหัว',
             'ข้อมูลอสังหาและยอดขายรถแตะจุดต่ำสุดก่อนตัวเลขการจ้างงาน']},
     w2:{en:['ISM manufacturing crossing back above 50',
             'Earnings revision breadth turning positive after a long negative stretch',
             'Cyclicals outperforming defensives for two consecutive months',
             'Policy rate cuts already delivered, not merely expected'],
         th:['ISM ภาคผลิตกลับขึ้นเหนือ 50',
             'ความกว้างการปรับประมาณการกำไรพลิกเป็นบวกหลังติดลบมานาน',
             'หุ้นวัฏจักรชนะหุ้นตั้งรับสองเดือนติด',
             'มีการลดดอกเบี้ยจริงแล้ว ไม่ใช่แค่ตลาดคาดว่าจะลด']},
     trap:{en:'A bear-market rally produces the same first three signals and then fails. What separates a real turn is the credit market: if spreads keep narrowing while equities rally, it is real. If spreads widen again while equities rally, it is a bounce.',
           th:'การเด้งในตลาดหมีสร้างสัญญาณสามข้อแรกได้เหมือนกันเป๊ะแล้วก็ล้มเหลว สิ่งที่แยกการกลับตัวจริงคือตลาดตราสารหนี้: ถ้าส่วนต่างเครดิตแคบลงต่อเนื่องขณะหุ้นวิ่ง คือของจริง แต่ถ้าส่วนต่างกลับมากว้างขึ้นขณะหุ้นวิ่ง คือแค่การเด้ง'},
     act:{en:['Add risk gradually while it still feels wrong — waiting for confirmation means paying up',
              'Small caps and cyclicals lead this phase, but size the position for the volatility',
              'This phase historically produces the strongest returns of the entire cycle',
              'If you were forced to sell during the drawdown, get back in on a schedule rather than all at once'],
          th:['ค่อยๆ เพิ่มความเสี่ยงในตอนที่ยังรู้สึกผิดที่ผิดทาง — การรอสัญญาณยืนยันแปลว่าต้องจ่ายแพงขึ้น',
              'หุ้นเล็กและหุ้นวัฏจักรนำในช่วงนี้ แต่ต้องกำหนดขนาดไม้ให้เหมาะกับความผันผวน',
              'ในอดีตช่วงนี้ให้ผลตอบแทนแรงที่สุดของทั้งวัฏจักร',
              'ถ้าคุณถูกบังคับให้ขายตอนขาลง ให้กลับเข้าตามตารางเวลา ไม่ใช่เข้าทีเดียวหมด']}}
  ],

  note:{en:'Sector-rotation patterns are statistical tendencies observed across past cycles, not rules. They fail regularly, and the market has historically turned 6–9 months before the economic data confirms anything — so by the time a rotation is obvious, much of it is already priced. Educational content, not investment advice.',
        th:'รูปแบบการหมุนกลุ่มเป็นแนวโน้มเชิงสถิติที่สังเกตได้จากวัฏจักรในอดีต ไม่ใช่กฎ มันล้มเหลวเป็นประจำ และในอดีตตลาดกลับตัวก่อนข้อมูลเศรษฐกิจยืนยัน 6–9 เดือน — กว่าการหมุนกลุ่มจะเห็นชัด ส่วนใหญ่ก็ถูกคิดเข้าไปในราคาแล้ว เป็นเนื้อหาเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'}
};


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var PHASES = { en:['Early','Mid','Late','Recession'], th:['ต้น','กลาง','ปลาย','ถดถอย'] };
  function CYI(){ return (window.SPZ_CYCLE ? window.SPZ_CYCLE.idx() : 1); }
  var state = { mode:'live', t:1 };
  Object.defineProperty(window, '__spzHere', { get:CYI });

  /* ---------------- animated drain / fill diagram ---------------- */
  function dfSVG(tr){
    var W = 900, H = 300, colW = 190, padY = 40;
    var lx = 10, rx = W - colW - 10;
    var pos = {}, i;

    function lay(list, x, key){
      var tot = 0;
      for(i = 0; i < list.length; i++) tot += list[i].w;
      var gap = 12, avail = H - padY - 22 - gap * (list.length - 1);
      var y = padY;
      for(i = 0; i < list.length; i++){
        var h = Math.max(28, avail * list[i].w / tot);
        pos[key + i] = { x:x, y:y, h:h, cy:y + h / 2 };
        y += h + gap;
      }
    }
    lay(tr.out, lx, 'o');
    lay(tr.into, rx, 'i');

    var COL = ['#ccff00','#4dd8ff','#ff9f45','#b98cff','#00ff88','#ff5f7a'];
    var s = '';

    s += '<text class="df-side" x="' + lx + '" y="18" fill="var(--red)">' + esc(T(TRANS.lbl.out)) + '</text>';
    s += '<text class="df-side" x="' + (rx + colW) + '" y="18" text-anchor="end" fill="var(--neon-2)">' +
         esc(T(TRANS.lbl.in)) + '</text>';
    s += '<text class="df-head" x="' + (W / 2) + '" y="18" text-anchor="middle">' +
         esc(T(tr.a)) + '  →  ' + esc(T(tr.b)) + '</text>';

    /* one link per source, fanned to every destination */
    var k = 0;
    for(var a = 0; a < tr.out.length; a++){
      for(var b = 0; b < tr.into.length; b++){
        var p = pos['o' + a], q = pos['i' + b];
        var x1 = p.x + colW, y1 = p.cy, x2 = q.x, y2 = q.cy;
        var mid = (x1 + x2) / 2;
        var d = 'M' + x1 + ',' + y1 + ' C' + mid + ',' + y1 + ' ' + mid + ',' + y2 + ' ' + x2 + ',' + y2;
        var col = COL[b % COL.length];
        var wgt = Math.max(1, (tr.out[a].w + tr.into[b].w) / 7);
        s += '<path id="dfp' + tr.id + k + '" d="' + d + '" fill="none" stroke="' + col +
             '" stroke-width="' + wgt.toFixed(1) + '" opacity=".16" stroke-linecap="round"/>';
        if(!RM && (a + b) % 2 === 0){
          var dur = (3.2 + (a + b) * 0.3).toFixed(2), del = ((a * 0.5 + b * 0.37) % 3).toFixed(2);
          s += '<circle r="2.8" fill="' + col + '" opacity=".9">' +
               '<animateMotion dur="' + dur + 's" begin="' + del + 's" repeatCount="indefinite">' +
               '<mpath href="#dfp' + tr.id + k + '" xlink:href="#dfp' + tr.id + k + '"/></animateMotion>' +
               '<animate attributeName="opacity" values="0;.95;.95;0" keyTimes="0;.14;.84;1" dur="' +
               dur + 's" begin="' + del + 's" repeatCount="indefinite"/></circle>';
        }
        k++;
      }
    }

    function blocks(list, key, kind){
      var out = '';
      for(var j = 0; j < list.length; j++){
        var p2 = pos[key + j];
        var fill = kind === 'out' ? 'rgba(255,59,78,.1)' : 'rgba(0,255,102,.1)';
        var line = kind === 'out' ? 'rgba(255,59,78,.42)' : 'rgba(0,255,102,.4)';
        out += '<g><rect x="' + p2.x + '" y="' + p2.y + '" width="' + colW + '" height="' + p2.h +
          '" rx="8" fill="' + fill + '" stroke="' + line + '" stroke-width="1"/>';
        if(!RM){
          /* the source blocks visibly drain, the destinations visibly fill */
          out += '<rect x="' + (p2.x + 1) + '" width="' + (colW - 2) + '" rx="7" fill="' +
            (kind === 'out' ? 'rgba(255,59,78,.16)' : 'rgba(0,255,102,.17)') + '">' +
            '<animate attributeName="height" values="' +
              (kind === 'out' ? p2.h + ';0;' + p2.h : '0;' + p2.h + ';0') +
              '" dur="5.5s" begin="' + (j * 0.3).toFixed(2) + 's" repeatCount="indefinite"/>' +
            '<animate attributeName="y" values="' +
              (kind === 'out' ? p2.y + ';' + (p2.y + p2.h) + ';' + p2.y
                              : (p2.y + p2.h) + ';' + p2.y + ';' + (p2.y + p2.h)) +
              '" dur="5.5s" begin="' + (j * 0.3).toFixed(2) + 's" repeatCount="indefinite"/></rect>';
        }
        out += '<text class="df-lbl" x="' + (p2.x + 11) + '" y="' + (p2.cy + 3) + '">' +
               esc(T(list[j].l)) + '</text></g>';
      }
      return out;
    }
    s += blocks(tr.out, 'o', 'out') + blocks(tr.into, 'i', 'in');

    return '<svg class="df-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" ' +
           'xmlns:xlink="http://www.w3.org/1999/xlink">' + s + '</svg>';
  }

  /* ---------------- jump a ticker into the Chart Lab ---------------- */
  function jumpTicker(tk){
    var nav = document.querySelector('.nav-links a[data-route-to="chartlab"], .np-item[data-route-to="chartlab"]');
    if(nav) nav.click();
    setTimeout(function(){
      var sel = document.querySelector('#chartlab .cl-sel');
      if(!sel) return;
      for(var i = 0; i < sel.options.length; i++){
        if(sel.options[i].value === tk){
          sel.value = tk;
          sel.dispatchEvent(new Event('change', { bubbles:true }));
          return;
        }
      }
    }, 170);
  }

  /* ---------------- build ---------------- */
  function build(){
    var host = document.getElementById('flow');
    if(!host || document.getElementById('trBlock')) return;

    var box = el('div');
    box.id = 'trBlock';
    box.innerHTML =
      '<div class="v8-sub" data-t="sh"></div>' +
      '<div class="tr-mode" data-t="mode"></div>' +
      '<div data-t="panel"></div>' +
      '<div class="v8-note" data-t="note"></div>';

    /* sit above the "track it yourself" block */
    var anchor = host.querySelector('[data-f="s6"]');
    anchor ? host.insertBefore(box, anchor) : host.appendChild(box);

    function q(k){ return box.querySelector('[data-t="' + k + '"]'); }

    function paintMode(){
      var m = q('mode');
      m.innerHTML = '';
      var live = el('button', 'tr-mb' + (state.mode === 'live' ? ' on' : ''),
        '<span class="tr-live-dot"></span>' + esc(T(TRANS.modeLive)));
      live.type = 'button';
      live.addEventListener('click', function(){ state.mode = 'live'; paint(); });
      var sim = el('button', 'tr-mb' + (state.mode === 'sim' ? ' on' : ''), esc(T(TRANS.modeSim)));
      sim.type = 'button';
      sim.addEventListener('click', function(){ state.mode = 'sim'; paint(); });
      m.appendChild(live); m.appendChild(sim);
    }

    function track(hereIdx, nextIdx){
      var names = PHASES[L()], s = '<div class="lv-track">';
      for(var i = 0; i < 4; i++){
        s += '<div class="lv-seg' + (i === hereIdx ? ' here' : (i === nextIdx ? ' next' : '')) + '">' +
             esc(names[i]) + '</div>';
      }
      return s + '</div>';
    }

    function ul(arr){
      var s = '<ul>';
      for(var i = 0; i < arr.length; i++){ s += '<li>' + esc(arr[i]) + '</li>'; }
      return s + '</ul>';
    }

    function paintLive(){
      var lv = TRANS.live;
      var cy = window.SPZ_CYCLE;
      var simulating = cy && !cy.isLive();
      q('panel').innerHTML =
        '<div class="lv-hero">' +
          '<div class="lv-eyebrow"><span class="tr-live-dot"></span>' + esc(T(TRANS.sH)) + '</div>' +
          '<div class="lv-phase">' + esc(cy ? T(cy.label()) : T(lv.phase)) + '</div>' +
          '<div class="lv-sub">' + esc(simulating
            ? (L() === 'th' ? 'มุมมองจำลอง — ค่าจริงคือ' + T(cy.label(cy.live)) : 'Simulated view — the live reading is ' + T(cy.label(cy.live)))
            : T(lv.sub)) + '</div>' +
          (simulating ? '' : '<div class="lv-conf">◆ ' + esc(T(lv.conf)) + '</div>') +
          '<p class="lv-body">' + esc(T(lv.body)) + '</p>' +
          track(CYI(), CYI() + 1) +
          '<div class="lv-arrow"><i></i><b>▶</b>' + esc(T(TRANS.live.nextH)) + ': ' +
            esc(T(lv.next)) + '<b>▶</b><i></i></div>' +
        '</div>' +
        '<div class="sg-grid">' +
          '<div class="sg-card conf"><div class="sg-h">◆ ' + esc(T(TRANS.live.nextH)) + ' — ' +
            esc(T(lv.next)) + '</div><p style="font-size:12.8px;line-height:1.7;color:var(--grey)">' +
            esc(T(lv.nextWhy)) + '</p></div>' +
          '<div class="sg-card early"><div class="sg-h">◆ ' + esc(T(lv.altH)) + '</div>' +
            ul(lv.alts[L()] || lv.alts.en) + '</div>' +
          '<div class="sg-card act"><div class="sg-h">◆ ' + esc(T(TRANS.lbl.out)) + ' / ' +
            esc(T(TRANS.lbl.in)) + '</div><p style="font-size:12.8px;line-height:1.7;color:var(--grey)">' +
            esc(T(lv.nowFlow)) + '</p></div>' +
        '</div>' +
        '<div class="cl-hint" style="margin-top:16px" data-t="hint"></div>';
      var h = q('hint');
      if(h) h.textContent = L() === 'th'
        ? 'อยากดูว่าถ้าเปลี่ยนช่วงจริงเงินจะเคลื่อนยังไง ให้กด "โหมดจำลอง" ด้านบน'
        : 'Switch to the transition simulator above to see how the money moves when a phase actually turns.';
    }

    function paintSim(){
      var picks = '<div class="sim-picks">';
      for(var i = 0; i < TRANS.t.length; i++){
        var tr = TRANS.t[i];
        picks += '<button type="button" class="sim-b' + (i === state.t ? ' on' : '') + '" data-tr="' + i + '">' +
          '<span class="sim-f">' + esc(T(tr.a)) + ' <span class="sim-arr">→</span> ' + esc(T(tr.b)) + '</span>' +
          '<span class="sim-tag">' + (i === CYI() ? (L() === 'th' ? 'เกี่ยวกับตอนนี้' : 'relevant now') : esc(T(tr.head))) +
          '</span></button>';
      }
      picks += '</div>';

      var t2 = TRANS.t[state.t];
      var tks = '';
      for(var j = 0; j < t2.ex.length; j++){
        tks += '<button type="button" class="tk-b" data-tk="' + esc(t2.ex[j]) + '">$' + esc(t2.ex[j]) + '</button>';
      }

      q('panel').innerHTML = '<p class="lede" style="margin-bottom:18px">' + esc(T(TRANS.simLede)) + '</p>' +
        picks +
        '<div class="tr-head"><span class="tr-title">' + esc(T(t2.head)) + '</span>' +
          '<span class="tr-pill">' + esc(T(TRANS.lbl.lead)) + '</span></div>' +
        '<p class="tr-n">' + esc(T(t2.n)) + '</p>' +
        '<div class="tr-lead">' + esc(T(t2.lead)) + '</div>' +
        '<div class="df-box">' + dfSVG(t2) + '</div>' +
        '<div class="sg-grid">' +
          '<div class="sg-card early"><div class="sg-h">▲ ' + esc(T(TRANS.lbl.early)) + '</div>' +
            ul(t2.w1[L()] || t2.w1.en) + '</div>' +
          '<div class="sg-card conf"><div class="sg-h">✓ ' + esc(T(TRANS.lbl.conf)) + '</div>' +
            ul(t2.w2[L()] || t2.w2.en) + '</div>' +
          '<div class="sg-card trap"><div class="sg-h">✕ ' + esc(T(TRANS.lbl.trap)) + '</div>' +
            '<p>' + esc(T(t2.trap)) + '</p></div>' +
          '<div class="sg-card act"><div class="sg-h">◆ ' + esc(T(TRANS.lbl.act)) + '</div>' +
            ul(t2.act[L()] || t2.act.en) + '</div>' +
        '</div>' +
        '<div class="sg-card conf" style="margin-top:13px"><div class="sg-h">$ ' +
          esc(T(TRANS.lbl.ex)) + '</div><div class="tk-row">' + tks + '</div></div>';

      var bs = q('panel').querySelectorAll('[data-tr]');
      for(var a = 0; a < bs.length; a++){
        (function(n){
          n.addEventListener('click', function(){ state.t = +n.getAttribute('data-tr'); paint(); });
        })(bs[a]);
      }
      var ts = q('panel').querySelectorAll('[data-tk]');
      for(var b = 0; b < ts.length; b++){
        (function(n){
          n.addEventListener('click', function(){ jumpTicker(n.getAttribute('data-tk')); });
        })(ts[b]);
      }
    }

    function paint(){
      q('sh').textContent = state.mode === 'live' ? T(TRANS.sH) : T(TRANS.sT);
      q('note').innerHTML = '<b>⚠</b> ' + esc(T(TRANS.note));
      paintMode();
      state.mode === 'live' ? paintLive() : paintSim();
    }

    box.__paint = paint;
    paint();
    document.addEventListener('spz:cycle', function(){ try { paint(); } catch(e){} });

    new MutationObserver(function(){ try { paint(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  function boot(){
    build();
    if(!document.getElementById('trBlock')){
      var tries = 0;
      var iv = setInterval(function(){
        build();
        if(document.getElementById('trBlock') || ++tries > 20) clearInterval(iv);
      }, 200);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 250); });
  else setTimeout(boot, 250);
})();
