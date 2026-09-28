
/* ============================================================================
   SPACEZ TERMINAL v14 — CAPITAL FLOW PAGE · ANIMATED SANKEY · GATE FX + LOADER
   ========================================================================= */
(function(){
  'use strict';

/* ============================================================================
   CAPITAL FLOW DATA — figures as published, with the date and source on each.
   Everything here is a dated snapshot, not a live feed.
   ========================================================================= */
var FLOW = {
  eb:{en:'Follow The Money',th:'ตามรอยเงินทุน'},
  h2:{en:'Where The Money Actually Is, And Where It Is Going',th:'ตอนนี้เงินอยู่ที่ไหน แล้วกำลังไหลไปไหน'},
  lede:{en:'Price tells you what people paid. Flow tells you what they did with their money. This page is a dated snapshot of published flow data, compiled 8 September 2026 — every figure below carries the week or month it covers. Read it as a map of positioning, not as a signal to trade.',
        th:'ราคาบอกว่าคนจ่ายเท่าไหร่ แต่กระแสเงินบอกว่าคนเอาเงินไปทำอะไร หน้านี้คือภาพนิ่งของข้อมูลกระแสเงินที่เผยแพร่แล้ว รวบรวมเมื่อ 8 ก.ย. 2026 — ทุกตัวเลขด้านล่างกำกับสัปดาห์หรือเดือนที่ครอบคลุมไว้ อ่านเป็นแผนที่การวางเงิน ไม่ใช่สัญญาณให้เทรด'},
  asOf:{en:'Snapshot — 8 September 2026',th:'ภาพนิ่ง — 8 กันยายน 2026'},

  s1:{en:'The big picture: one week of money',th:'ภาพใหญ่: เงินหนึ่งสัปดาห์'},
  s2:{en:'Where the money is parked',th:'ตอนนี้เงินจอดอยู่ที่ไหน'},
  s3:{en:'The numbers behind it',th:'ตัวเลขที่อยู่เบื้องหลัง'},
  s4:{en:'What is being sold, what is being bought',th:'อะไรถูกขาย อะไรถูกซื้อ'},
  s5:{en:'Read the flow, guess the phase',th:'อ่านกระแสเงิน เดาช่วงวัฏจักร'},
  s6:{en:'Track it yourself — every source is free',th:'ตามเองได้ — ทุกแหล่งข้อมูลฟรี'},

  heroNote:{en:'Line thickness is proportional to reported flow. Tap any block to isolate its flows. Figures are weekly or year-to-date as labelled below.',
            th:'ความหนาของเส้นแปรผันตามขนาดกระแสเงินที่รายงาน แตะกล่องไหนก็ได้เพื่อดูเฉพาะเส้นของกล่องนั้น ตัวเลขเป็นรายสัปดาห์หรือสะสมทั้งปีตามที่กำกับไว้ด้านล่าง'},

  /* left = money leaving, right = money arriving */
  from:[
    {id:'usmf', l:{en:'US equity mutual funds',th:'กองทุนรวมหุ้นสหรัฐฯ'}, v:{en:'−$25.9B / wk',th:'−25.9 พันล้าน/สัปดาห์'}, w:10},
    {id:'hyb',  l:{en:'Hybrid funds',th:'กองทุนผสม'},                     v:{en:'−$2.4B / wk',th:'−2.4 พันล้าน/สัปดาห์'}, w:3},
    {id:'tec',  l:{en:'Tech sector ETFs',th:'ETF กลุ่มเทคโนโลยี'},        v:{en:'−$6.1B in Aug',th:'−6.1 พันล้าน ใน ส.ค.'}, w:4},
    {id:'fin',  l:{en:'Financials sector ETFs',th:'ETF กลุ่มการเงิน'},    v:{en:'−$4.9B in Aug',th:'−4.9 พันล้าน ใน ส.ค.'}, w:3}
  ],
  to:[
    {id:'etf',  l:{en:'ETFs (all, net issuance)',th:'ETF (ทั้งหมด ออกสุทธิ)'},     v:{en:'+$32.0B / wk',th:'+32.0 พันล้าน/สัปดาห์'}, w:10},
    {id:'bnd',  l:{en:'Bond ETFs',th:'ETF ตราสารหนี้'},                            v:{en:'+$13.8B / wk',th:'+13.8 พันล้าน/สัปดาห์'}, w:8},
    {id:'stb',  l:{en:'Short-term govt bonds',th:'พันธบัตรรัฐบาลอายุสั้น'},        v:{en:'+$81.7B YTD',th:'+81.7 พันล้าน ทั้งปี'},   w:7},
    {id:'wld',  l:{en:'World / intl equity ETFs',th:'ETF หุ้นต่างประเทศ'},         v:{en:'+$6.9B / wk',th:'+6.9 พันล้าน/สัปดาห์'},   w:5},
    {id:'cmd',  l:{en:'Commodities & gold',th:'สินค้าโภคภัณฑ์และทองคำ'},            v:{en:'+$10.8B in Aug',th:'+10.8 พันล้าน ใน ส.ค.'}, w:4},
    {id:'btc',  l:{en:'Bitcoin ETPs',th:'กองทุนบิตคอยน์'},                          v:{en:'+$3.52B in Aug',th:'+3.52 พันล้าน ใน ส.ค.'}, w:3},
    {id:'cash', l:{en:'Money market cash',th:'เงินสดในกองทุนตลาดเงิน'},             v:{en:'$7.98T parked',th:'7.98 ล้านล้าน จอดอยู่'}, w:8}
  ],
  links:[
    ['usmf','etf',9],['usmf','bnd',5],['usmf','wld',4],['usmf','cash',3],
    ['hyb','bnd',3],['tec','cmd',3],['tec','btc',2],['fin','stb',3],['fin','cash',2]
  ],
  sideOut:{en:'Money leaving',th:'เงินไหลออกจาก'},
  sideIn:{en:'Money arriving',th:'เงินไหลเข้าสู่'},

  pools:[
    {l:{en:'Money market funds (total)',th:'กองทุนตลาดเงิน (รวม)'}, v:'$7.98T', n:7979},
    {l:{en:'— of which retail',th:'— ในนั้นเป็นรายย่อย'},           v:'$3.11T', n:3114},
    {l:{en:'2026 ETF inflows YTD',th:'เงินเข้า ETF สะสมปี 2026'},   v:'~$1.4T', n:1400},
    {l:{en:'Equity ETFs YTD',th:'ETF หุ้น สะสมปีนี้'},               v:'+$932B', n:932},
    {l:{en:'Bond ETFs YTD',th:'ETF ตราสารหนี้ สะสมปีนี้'},           v:'+$407B', n:407},
    {l:{en:'Short-term govt bond ETFs YTD',th:'ETF พันธบัตรสั้น สะสมปีนี้'}, v:'+$82B', n:82},
    {l:{en:'August 2026 ETF inflows',th:'เงินเข้า ETF เดือน ส.ค. 2026'}, v:'$180B', n:180}
  ],

  cards:[
    {k:'in', l:{en:'ETF net issuance, week to 26 Aug',th:'ETF สุทธิ สัปดาห์ถึง 26 ส.ค.'}, v:'+$32.04B',
     n:{en:'Money keeps arriving through the ETF wrapper in a week when mutual funds lost four times as much.',
        th:'เงินยังไหลเข้าผ่านโครงสร้าง ETF ต่อเนื่อง ในสัปดาห์ที่กองทุนรวมเสียเงินไปมากกว่าสี่เท่า'}, s:'ICI'},
    {k:'out', l:{en:'Mutual fund outflows, same week',th:'กองทุนรวมไหลออก สัปดาห์เดียวกัน'}, v:'−$33.78B',
     n:{en:'The mirror image, and a much bigger one than a month ago. Most of this is not people leaving the market — it is the same money changing vehicle.',
        th:'ภาพสะท้อนกลับด้าน และใหญ่กว่าเมื่อเดือนก่อนมาก ส่วนใหญ่ไม่ใช่คนถอนออกจากตลาด แต่คือเงินก้อนเดิมย้ายภาชนะ'}, s:'ICI'},
    {k:'out', l:{en:'Domestic equity mutual funds, week to 26 Aug',th:'กองทุนรวมหุ้นในประเทศ สัปดาห์ถึง 26 ส.ค.'}, v:'−$25.92B',
     n:{en:'The single biggest line in the week. Domestic equity ETFs took in $7.58B over the same days, so combined the figure is −$18.34B.',
        th:'รายการเดียวที่ใหญ่ที่สุดของสัปดาห์ ขณะที่ ETF หุ้นในประเทศได้เข้ามา 7.58 พันล้านในวันเดียวกัน รวมกันแล้วเป็น −18.34 พันล้าน'}, s:'ICI'},
    {k:'in', l:{en:'Bond flows, combined, same week',th:'ตราสารหนี้ รวมทุกช่องทาง สัปดาห์เดียวกัน'}, v:'+$13.46B',
     n:{en:'While equities bled, bonds took money — almost entirely through ETFs (+$13.78B) against a small mutual fund outflow.',
        th:'ขณะที่หุ้นเงินไหลออก ตราสารหนี้กลับได้เงินเข้า เกือบทั้งหมดมาทาง ETF (+13.78 พันล้าน) เทียบกับกองทุนรวมที่ไหลออกเล็กน้อย'}, s:'ICI'},
    {k:'neu', l:{en:'Money market assets, 2 Sept',th:'สินทรัพย์กองทุนตลาดเงิน 2 ก.ย.'}, v:'$7.98T',
     n:{en:'A record cash pile, and it grew $44.75B in that week alone. It is dry powder and a comfort blanket at the same time.',
        th:'กองเงินสดระดับสูงสุดเป็นประวัติการณ์ และโตขึ้น 44.75 พันล้านในสัปดาห์นั้นสัปดาห์เดียว เป็นทั้งกระสุนสำรองและผ้าห่มปลอบใจในเวลาเดียวกัน'}, s:'ICI'},
    {k:'in', l:{en:'Short-term govt bond ETFs YTD',th:'ETF พันธบัตรรัฐบาลอายุสั้น สะสมปีนี้'}, v:'+$81.7B',
     n:{en:'Money wants yield without duration risk: August\'s $14.3B was 94% of everything that went into government bond ETFs that month.',
        th:'เงินอยากได้ผลตอบแทนโดยไม่รับความเสี่ยงอายุตราสาร เฉพาะเดือน ส.ค. 14.3 พันล้าน คิดเป็น 94% ของเงินที่เข้า ETF พันธบัตรรัฐบาลทั้งเดือน'}, s:'State Street'},
    {k:'in', l:{en:'Bitcoin ETPs, August 2026',th:'กองทุนบิตคอยน์ ส.ค. 2026'}, v:'+$3.52B',
     n:{en:'The best month of the year — inflows on 16 of 21 trading days. Then 1 September gave back $236M in a single session.',
        th:'เดือนที่ดีที่สุดของปี เงินไหลเข้า 16 จาก 21 วันทำการ แล้ววันที่ 1 ก.ย. ก็คืนออกไป 236 ล้านในวันเดียว'}, s:'Farside'},
    {k:'out', l:{en:'Tech sector ETFs, August 2026',th:'ETF กลุ่มเทคโนโลยี ส.ค. 2026'}, v:'−$6.1B',
     n:{en:'The first month the AI trade paid money back, even though $60.0B is still in for the year. Financials lost $4.9B in the same month.',
        th:'เดือนแรกที่ธีม AI คืนเงินออกมา แม้ทั้งปียังเป็นบวก 60.0 พันล้าน ส่วนกลุ่มการเงินเสียไป 4.9 พันล้านในเดือนเดียวกัน'}, s:'State Street'}
  ],

  rot:[
    {l:{en:'ETFs (all)',th:'ETF (ทั้งหมด)'}, v:32.04, d:'+$32.0B'},
    {l:{en:'Bond ETFs',th:'ETF ตราสารหนี้'}, v:13.78, d:'+$13.8B'},
    {l:{en:'World equity ETFs',th:'ETF หุ้นทั่วโลก'}, v:6.86, d:'+$6.9B'},
    {l:{en:'Commodity ETFs',th:'ETF โภคภัณฑ์'}, v:3.39, d:'+$3.4B'},
    {l:{en:'Bond mutual funds',th:'กองทุนรวมตราสารหนี้'}, v:-0.32, d:'−$0.3B'},
    {l:{en:'Hybrid funds (all)',th:'กองทุนผสม (รวม)'}, v:-2.44, d:'−$2.4B'},
    {l:{en:'Domestic equity (all)',th:'หุ้นในประเทศ (รวม)'}, v:-18.34, d:'−$18.3B'},
    {l:{en:'Mutual funds (all)',th:'กองทุนรวม (ทั้งหมด)'}, v:-33.78, d:'−$33.8B'}
  ],
  rotNote:{en:'Net flow in US$ billions for the week ended 26 August 2026. Rows marked (all) combine mutual funds and ETFs; the others are one vehicle only. Source: ICI weekly estimated flows, compiled 8 September 2026.',
           th:'กระแสเงินสุทธิ หน่วยพันล้านดอลลาร์ สำหรับสัปดาห์สิ้นสุด 26 ส.ค. 2026 แถวที่กำกับ (รวม) คือรวมกองทุนรวมกับ ETF ส่วนแถวอื่นเป็นช่องทางเดียว ที่มา: ICI ตัวเลขประมาณการรายสัปดาห์ รวบรวมเมื่อ 8 ก.ย. 2026'},

  sim:{
    lede:{en:'Flow patterns are one of the few things that lead the economic data rather than lag it. Pick a pattern and see which phase it usually belongs to — and what would prove the read wrong.',
          th:'รูปแบบกระแสเงินเป็นหนึ่งในไม่กี่อย่างที่นำหน้าข้อมูลเศรษฐกิจแทนที่จะตามหลัง เลือกรูปแบบดูว่ามันมักอยู่ในช่วงไหน — และอะไรจะพิสูจน์ว่าอ่านผิด'},
    scale:{en:['Early','Mid','Late','Recession'],th:['ต้น','กลาง','ปลาย','ถดถอย']},
    watchH:{en:'What would confirm it',th:'อะไรจะยืนยัน'},
    breakH:{en:'What would break it',th:'อะไรจะหักล้าง'},
    cases:[
      {a:{en:'Cash / money markets',th:'เงินสด / ตลาดเงิน'}, b:{en:'Small caps & cyclicals',th:'หุ้นเล็กและหุ้นวัฏจักร'}, ph:0,
       n:{en:'The classic early-cycle footprint. Cash that sat out a downturn starts buying the most beaten-up, most economically sensitive names first, usually while the headlines are still bad. Financials and consumer discretionary follow within weeks.',
          th:'รอยเท้าคลาสสิกของต้นวัฏจักร เงินสดที่หลบอยู่ระหว่างขาลงเริ่มกลับมาซื้อหุ้นที่โดนทุบหนักที่สุดและอ่อนไหวต่อเศรษฐกิจที่สุดก่อน โดยมักเกิดตอนที่พาดหัวข่าวยังแย่อยู่ กลุ่มการเงินและสินค้าฟุ่มเฟือยจะตามมาภายในไม่กี่สัปดาห์'},
       w:{en:['Money market assets falling for 4+ consecutive weeks','Small-cap ETFs outpacing large-cap ETFs','Credit spreads narrowing'],
          th:['สินทรัพย์กองทุนตลาดเงินลดลงต่อเนื่อง 4 สัปดาห์ขึ้นไป','ETF หุ้นเล็กได้เงินเข้ามากกว่า ETF หุ้นใหญ่','ส่วนต่างเครดิตแคบลง']},
       x:{en:'If cash keeps growing while small caps rally, the rally is being funded by leverage rather than by reallocation — a much weaker signal.',
          th:'ถ้าเงินสดยังโตขึ้นในขณะที่หุ้นเล็กวิ่ง แปลว่าการวิ่งนั้นใช้เงินกู้ ไม่ใช่การโยกเงินจริง — เป็นสัญญาณที่อ่อนกว่ามาก'}},
      {a:{en:'Domestic equity funds',th:'กองทุนหุ้นในประเทศ'}, b:{en:'World / international equity',th:'หุ้นต่างประเทศ'}, ph:1,
       n:{en:'Still the pattern printing in the latest week, though in a narrower form: world equity ETFs took +$6.86B while world equity mutual funds lost $4.67B, leaving +$2.20B combined. It is a mid-cycle diversification move, not a risk-off move — the money is still buying equities, just somewhere else, and increasingly through a different vehicle.',
          th:'ยังเป็นรูปแบบที่เกิดในสัปดาห์ล่าสุด แต่แคบลง — ETF หุ้นทั่วโลกได้เข้า +6.86 พันล้าน ขณะที่กองทุนรวมหุ้นทั่วโลกเสียไป 4.67 พันล้าน รวมกันเหลือ +2.20 พันล้าน เป็นการกระจายความเสี่ยงแบบกลางวัฏจักร ไม่ใช่การหนีความเสี่ยง — เงินยังซื้อหุ้นอยู่ แค่ย้ายไปที่อื่น และย้ายช่องทางมากขึ้นด้วย'},
       w:{en:['Weak dollar persisting','Emerging-market and single-country ETF inflows broadening','Total equity flows staying positive overall'],
          th:['ดอลลาร์อ่อนต่อเนื่อง','เงินเข้า ETF ตลาดเกิดใหม่และรายประเทศกระจายกว้างขึ้น','กระแสเงินเข้าหุ้นรวมยังเป็นบวกโดยรวม']},
       x:{en:'If world equity inflows fade while domestic outflows continue, this stops being rotation and becomes plain de-risking.',
          th:'ถ้าเงินเข้าหุ้นต่างประเทศจางลงในขณะที่เงินยังไหลออกจากหุ้นในประเทศ นี่จะไม่ใช่การหมุนกลุ่มอีกต่อไป แต่กลายเป็นการลดความเสี่ยงล้วนๆ'}},
      {a:{en:'Cyclicals & discretionary',th:'หุ้นวัฏจักรและสินค้าฟุ่มเฟือย'}, b:{en:'Energy, materials, staples',th:'พลังงาน วัสดุ สินค้าจำเป็น'}, ph:2,
       n:{en:'Late-cycle rotation. Money moves toward businesses that own real assets or can raise prices, because input costs and wages are eating everyone else\'s margin. The index can still be making highs while this happens underneath.',
          th:'การหมุนกลุ่มแบบปลายวัฏจักร เงินย้ายไปหาธุรกิจที่ถือสินทรัพย์จริงหรือขึ้นราคาได้ เพราะต้นทุนวัตถุดิบและค่าแรงกำลังกินอัตรากำไรของคนอื่น ดัชนีอาจยังทำจุดสูงสุดใหม่ได้ในขณะที่สิ่งนี้เกิดอยู่ข้างใต้'},
       w:{en:['Commodity ETF inflows accelerating','Defensive sectors outperforming while the index still rises','Inflation prints re-accelerating'],
          th:['เงินเข้า ETF สินค้าโภคภัณฑ์เร่งขึ้น','กลุ่มตั้งรับทำผลงานดีกว่าตลาดทั้งที่ดัชนียังขึ้น','ตัวเลขเงินเฟ้อกลับมาเร่ง']},
       x:{en:'A one-off oil shock produces the same flows without a real cycle turn. Check whether staples are also getting inflows, not just energy.',
          th:'แรงกระแทกราคาน้ำมันครั้งเดียวก็สร้างกระแสเงินแบบเดียวกันได้โดยที่วัฏจักรยังไม่พลิก ให้เช็คว่าสินค้าจำเป็นได้เงินเข้าด้วยไหม ไม่ใช่แค่พลังงาน'}},
      {a:{en:'Equities broadly',th:'หุ้นโดยรวม'}, b:{en:'Short-duration bonds & cash',th:'ตราสารหนี้อายุสั้นและเงินสด'}, ph:2,
       n:{en:'Defensive positioning without panic. Investors keep the yield but drop the risk. In March 2026 fixed income made up over 75% of all ETF flows for two weeks — that is what this looks like when it accelerates.',
          th:'การตั้งรับโดยยังไม่แพนิค นักลงทุนเก็บผลตอบแทนไว้แต่ทิ้งความเสี่ยง ในเดือน มี.ค. 2026 ตราสารหนี้กินสัดส่วนเกิน 75% ของกระแสเงิน ETF ทั้งหมดสองสัปดาห์ติด — นั่นคือหน้าตาของมันตอนเร่งตัว'},
       w:{en:['Ultra-short bond ETFs leading all inflows','Money market assets climbing weekly','Equity outflows broadening beyond one region'],
          th:['ETF ตราสารหนี้อายุสั้นมากนำเงินเข้าทั้งหมด','สินทรัพย์กองทุนตลาดเงินเพิ่มขึ้นทุกสัปดาห์','เงินไหลออกจากหุ้นกระจายเกินหนึ่งภูมิภาค']},
       x:{en:'If it reverses within two or three weeks it was a scare, not a regime change. Duration positioning that lasts a quarter is the real signal.',
          th:'ถ้ากลับตัวภายในสองสามสัปดาห์ แปลว่าเป็นแค่ตกใจ ไม่ใช่การเปลี่ยนภาวะ การวางน้ำหนักอายุตราสารที่อยู่ได้ทั้งไตรมาสต่างหากคือสัญญาณจริง'}},
      {a:{en:'Risk assets everywhere',th:'สินทรัพย์เสี่ยงทุกประเภท'}, b:{en:'Gold, long bonds, staples',th:'ทองคำ พันธบัตรยาว สินค้าจำเป็น'}, ph:3,
       n:{en:'The recession footprint. Correlations converge, everything risky is sold at once, and the money goes to the three things that historically hold up. This is also where the best entries of the next cycle get made.',
          th:'รอยเท้าของภาวะถดถอย ค่าสหสัมพันธ์วิ่งเข้าหากัน ของเสี่ยงทุกอย่างถูกขายพร้อมกัน และเงินไปที่สามสิ่งที่ในอดีตทนได้ นี่ก็เป็นจุดที่จังหวะเข้าซื้อที่ดีที่สุดของวัฏจักรถัดไปเกิดขึ้นด้วย'},
       w:{en:['Long-duration bond ETFs flipping to inflows','Gold inflows alongside falling yields','Credit spreads widening sharply'],
          th:['ETF พันธบัตรอายุยาวพลิกเป็นเงินไหลเข้า','เงินเข้าทองคำพร้อมกับผลตอบแทนพันธบัตรที่ลดลง','ส่วนต่างเครดิตกว้างขึ้นอย่างรวดเร็ว']},
       x:{en:'Gold rising while yields also rise is an inflation trade, not a recession trade. The bond leg is what separates the two.',
          th:'ทองขึ้นพร้อมผลตอบแทนพันธบัตรที่ขึ้นด้วย คือการเทรดเงินเฟ้อ ไม่ใช่การเทรดภาวะถดถอย ขาพันธบัตรคือสิ่งที่แยกสองอย่างนี้ออกจากกัน'}},
      {a:{en:'Mutual funds',th:'กองทุนรวม'}, b:{en:'ETFs (same assets)',th:'ETF (สินทรัพย์เดิม)'}, ph:-1,
       n:{en:'This one tells you nothing about the cycle at all, and it is the biggest number on the page. Roughly $17B left mutual funds and $34B arrived in ETFs in the same week. That is a structural migration driven by fees and tax treatment — mistaking it for a market signal is the single most common error in reading flow data.',
          th:'อันนี้ไม่ได้บอกอะไรเกี่ยวกับวัฏจักรเลย และมันคือตัวเลขที่ใหญ่ที่สุดในหน้านี้ เงินราว 1.7 หมื่นล้านออกจากกองทุนรวม และ 3.4 หมื่นล้านเข้า ETF ในสัปดาห์เดียวกัน นั่นคือการย้ายเชิงโครงสร้างที่ขับด้วยค่าธรรมเนียมและภาษี — การเข้าใจผิดว่ามันเป็นสัญญาณตลาด คือความผิดพลาดที่พบบ่อยที่สุดในการอ่านข้อมูลกระแสเงิน'},
       w:{en:['The two numbers roughly offsetting each other every week','Both showing up in the same asset class','No matching move in money market assets'],
          th:['ตัวเลขสองฝั่งหักล้างกันเกือบพอดีทุกสัปดาห์','ทั้งสองฝั่งอยู่ในสินทรัพย์ประเภทเดียวกัน','ไม่มีการเคลื่อนไหวที่สอดคล้องกันในกองทุนตลาดเงิน']},
       x:{en:'If mutual fund outflows are much larger than ETF inflows, money really is leaving the asset class — then it does matter.',
          th:'ถ้าเงินไหลออกจากกองทุนรวมมากกว่าเงินเข้า ETF อย่างชัดเจน แปลว่าเงินออกจากสินทรัพย์ประเภทนั้นจริง — ตอนนั้นถึงจะมีความหมาย'}}
    ]
  },

  srcs:[
    {t:'ICI — Weekly fund & ETF flows', u:'https://www.ici.org/research/stats/combined_flows',
     d:{en:'The official US weekly numbers: mutual fund flows, ETF net issuance, equity vs bond vs hybrid. Published every Wednesday. This page uses it as the primary source.',
        th:'ตัวเลขรายสัปดาห์อย่างเป็นทางการของสหรัฐฯ ทั้งกระแสเงินกองทุนรวม ETF สุทธิ แยกหุ้น-ตราสารหนี้-ผสม เผยแพร่ทุกวันพุธ หน้านี้ใช้เป็นแหล่งข้อมูลหลัก'}},
    {t:'ICI — Money market fund assets', u:'https://www.ici.org/research/stats/mmf',
     d:{en:'The cash pile, weekly, split retail vs institutional and government vs prime. The single best gauge of how much dry powder is sitting out.',
        th:'กองเงินสด รายสัปดาห์ แยกรายย่อย-สถาบัน และรัฐบาล-ไพรม์ เป็นมาตรวัดที่ดีที่สุดว่ามีกระสุนสำรองรออยู่เท่าไหร่'}},
    {t:'State Street — Monthly ETF flash flows', u:'https://www.ssga.com/library-content/pdfs/etf/us/monthly-flash-flows.pdf',
     d:{en:'A monthly PDF breaking flows down by sector, duration, factor and theme. This is where sector rotation actually becomes visible.',
        th:'ไฟล์ PDF รายเดือนที่แยกกระแสเงินตามกลุ่มอุตสาหกรรม อายุตราสาร แฟกเตอร์ และธีม เป็นที่ที่การหมุนกลุ่มมองเห็นได้จริง'}},
    {t:'etf.com — Fund flows tool', u:'https://www.etf.com/etfanalytics/etf-fund-flows-tool',
     d:{en:'Search flows by individual ETF, issuer or asset class over any date range. Use it to check a single sector rather than the whole market.',
        th:'ค้นกระแสเงินราย ETF ราย บลจ. หรือรายประเภทสินทรัพย์ ในช่วงวันที่ไหนก็ได้ ใช้เช็คกลุ่มเดียวแทนที่จะดูทั้งตลาด'}},
    {t:'Farside Investors — Bitcoin ETF flows', u:'https://farside.co.uk/btc/',
     d:{en:'Daily spot Bitcoin ETP creations and redemptions by issuer. Figures are provisional and get revised, so always check the date stamp.',
        th:'การสร้างและไถ่ถอนหน่วยกองทุนบิตคอยน์รายวันแยกตามผู้ออก ตัวเลขเป็นชั่วคราวและถูกแก้ไขได้ ให้ดูวันที่กำกับเสมอ'}},
    {t:'SET — Investor type statistics', u:'https://www.set.or.th/en/market/statistics/investor-type',
     d:{en:'The Thai equivalent: daily net buy/sell split into foreign, institutional, proprietary and retail. The single most useful Thai flow page.',
        th:'ของไทย: ซื้อขายสุทธิรายวันแยกเป็นต่างชาติ สถาบัน บัญชีบริษัทหลักทรัพย์ และรายย่อย เป็นหน้ากระแสเงินไทยที่มีประโยชน์ที่สุด'}},
    {t:'Thai NVDR — Overview & by stock', u:'https://member.set.or.th/set/nvdroverview.do?language=en&country=US',
     d:{en:'Foreign buying routed through NVDR, down to individual stocks. Use it to see which Thai names foreign money is actually accumulating.',
        th:'การซื้อของต่างชาติที่ผ่าน NVDR ลงลึกได้ถึงรายหุ้น ใช้ดูว่าเงินต่างชาติกำลังสะสมหุ้นไทยตัวไหนจริงๆ'}},
    {t:'FRED — Money market fund assets series', u:'https://fred.stlouisfed.org/series/MMMFFAQ027S',
     d:{en:'The same cash-pile data as a downloadable long history, so you can see whether today\'s level is genuinely extreme or just large.',
        th:'ข้อมูลกองเงินสดชุดเดียวกันแต่เป็นประวัติยาวที่ดาวน์โหลดได้ ทำให้เห็นว่าระดับวันนี้สูงผิดปกติจริงหรือแค่ใหญ่'}}
  ],

  caveat:{en:'Flow data lags by days to weeks, gets revised, and covers only the funds each provider tracks — direct share ownership, pensions and sovereign funds are largely invisible in it. Every figure here is a dated snapshot from the sources listed, not a live feed. Educational content, not investment advice.',
          th:'ข้อมูลกระแสเงินตามหลังจริงเป็นวันถึงสัปดาห์ ถูกแก้ไขย้อนหลังได้ และครอบคลุมเฉพาะกองทุนที่ผู้ให้ข้อมูลแต่ละรายติดตาม — การถือหุ้นโดยตรง กองทุนบำนาญ และกองทุนความมั่งคั่งแห่งชาติ แทบมองไม่เห็นในข้อมูลนี้ ตัวเลขทุกตัวในหน้านี้เป็นภาพนิ่งที่ลงวันที่จากแหล่งที่ระบุ ไม่ใช่ข้อมูลสด เป็นเนื้อหาเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'},

  lead:{en:'Remember the lag that matters most: equity markets have historically turned 6–9 months before the economic data does. Flow data is faster than GDP but still slower than price. By the time a rotation is obvious in the weekly numbers, a good part of the move has already been paid for.',
        th:'จำความล่าช้าที่สำคัญที่สุดไว้: ในอดีตตลาดหุ้นกลับตัวก่อนข้อมูลเศรษฐกิจราว 6–9 เดือน ข้อมูลกระแสเงินเร็วกว่า GDP แต่ยังช้ากว่าราคา กว่าการหมุนกลุ่มจะเห็นชัดในตัวเลขรายสัปดาห์ ส่วนใหญ่ของการเคลื่อนไหวก็ถูกจ่ายไปแล้ว'}
};


  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var repaint = [];

  /* ======================= 1. GATE TICK + BOOT LOADER ======================= */
  var BOOT_LOG = {
    en:['Initialising terminal','Loading market metrics','Building signal library',
        'Wiring capital flow map','Compiling cycle model','Ready'],
    th:['กำลังเริ่มระบบเทอร์มินัล','กำลังโหลดเมตริกตลาด','กำลังสร้างคลังสัญญาณ',
        'กำลังต่อแผนที่กระแสเงินทุน','กำลังประมวลโมเดลวัฏจักร','พร้อมแล้ว']
  };

  function runBoot(done){
    var b = el('div', 'boot');
    b.innerHTML =
      '<div class="boot-mark"><span class="boot-blip"></span><span class="boot-brand">SPACEZ</span></div>' +
      '<div class="boot-bar"><div class="boot-fill" data-b="fill"></div></div>' +
      '<div class="boot-log" data-b="log"></div><div class="boot-pct" data-b="pct">0%</div>';
    document.body.appendChild(b);
    var fill = b.querySelector('[data-b="fill"]'),
        log = b.querySelector('[data-b="log"]'),
        pct = b.querySelector('[data-b="pct"]');
    var msgs = BOOT_LOG[L()] || BOOT_LOG.en;
    var step = 0, total = msgs.length;
    var tick = RM ? 90 : 265;

    function next(){
      log.textContent = msgs[step];
      var p = Math.round((step + 1) / total * 100);
      fill.style.width = p + '%';
      pct.textContent = p + '%';
      step++;
      if(step < total) setTimeout(next, tick);
      else setTimeout(function(){
        b.classList.add('off');
        setTimeout(function(){ b.remove(); if(done) done(); }, 420);
      }, tick);
    }
    setTimeout(next, 60);
  }

  function upgradeGate(){
    var go = document.querySelector('#spzGate [data-x="go"]');
    if(!go || go.__fx) return;
    go.__fx = 1;
    var label = el('span');
    while(go.firstChild) label.appendChild(go.firstChild);
    go.appendChild(label);
    var tick = el('span', 'gate-tick',
      '<svg class="tick-svg" viewBox="0 0 24 24">' +
      '<circle class="tick-c" cx="12" cy="12" r="10.2"/>' +
      '<path class="tick-p" d="M7.2 12.4 L10.6 15.8 L17 9.4"/></svg><span data-x="tk"></span>');
    go.appendChild(tick);

    function paintTick(){
      tick.querySelector('[data-x="tk"]').textContent = L() === 'th' ? 'ยืนยันแล้ว' : 'CONFIRMED';
    }
    repaint.push(paintTick); paintTick();

    /* run before the original handler hides the gate */
    go.addEventListener('click', function(e){
      if(go.disabled || go.__running) return;
      if(go.__armed){ go.__armed = false; return; }
      e.stopImmediatePropagation();
      e.preventDefault();
      go.__running = true;
      go.classList.add('done');
      setTimeout(function(){
        var gate = document.getElementById('spzGate');
        go.__armed = true;
        go.click();                       /* lets the original handler store consent */
        if(gate) gate.hidden = true;
        document.body.style.overflow = 'hidden';
        runBoot(function(){ document.body.style.overflow = ''; });
      }, 820);
    }, true);
  }

  /* ======================= 2. ANIMATED SANKEY ======================= */
  var sankeySel = null;

  function sankeySVG(){
    var W = 900, H = 400, padY = 26, colW = 168;
    var lx = 8, rx = W - colW - 8;
    var pos = {}, i;

    function layout(list, x){
      var totalW = 0;
      for(i = 0; i < list.length; i++){ totalW += list[i].w; }
      var gap = 14, avail = H - padY * 2 - gap * (list.length - 1);
      var y = padY;
      for(i = 0; i < list.length; i++){
        var h = Math.max(30, avail * list[i].w / totalW);
        pos[list[i].id] = { x:x, y:y, h:h, w:colW, cy:y + h / 2 };
        y += h + gap;
      }
    }
    layout(FLOW.from, lx);
    layout(FLOW.to, rx);

    var COL = ['#ccff00', '#4dd8ff', '#ff9f45', '#b98cff', '#00ff88', '#ff5f7a'];
    var s = '';

    /* headers */
    s += '<text class="fl-side" x="' + lx + '" y="14" fill="var(--red)">' + esc(T(FLOW.sideOut)) + '</text>';
    s += '<text class="fl-side" x="' + (rx + colW) + '" y="14" text-anchor="end" fill="var(--neon-2)">' +
         esc(T(FLOW.sideIn)) + '</text>';

    /* links */
    for(i = 0; i < FLOW.links.length; i++){
      var a = pos[FLOW.links[i][0]], b = pos[FLOW.links[i][1]], wgt = FLOW.links[i][2];
      if(!a || !b) continue;
      var x1 = a.x + colW, y1 = a.cy, x2 = b.x, y2 = b.cy;
      var mid = (x1 + x2) / 2;
      var d = 'M' + x1 + ',' + y1 + ' C' + mid + ',' + y1 + ' ' + mid + ',' + y2 + ' ' + x2 + ',' + y2;
      var col = COL[i % COL.length];
      var on = !sankeySel || sankeySel === FLOW.links[i][0] || sankeySel === FLOW.links[i][1];
      s += '<path id="flp' + i + '" class="fl-link' + (on ? '' : ' dim') + '" d="' + d + '" stroke="' + col +
           '" stroke-width="' + (wgt * 1.9) + '" opacity="' + (on ? '.3' : '.06') + '"/>';
      if(!RM && on){
        for(var k = 0; k < 3; k++){
          s += '<circle class="fl-dot" r="3.1" fill="' + col + '">' +
               '<animateMotion dur="' + (3.4 + i * 0.22).toFixed(2) + 's" begin="' + (k * 1.15).toFixed(2) +
               's" repeatCount="indefinite"><mpath href="#flp' + i + '" xlink:href="#flp' + i + '"/></animateMotion>' +
               '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.86;1" dur="' +
               (3.4 + i * 0.22).toFixed(2) + 's" begin="' + (k * 1.15).toFixed(2) + 's" repeatCount="indefinite"/>' +
               '</circle>';
        }
      }
    }

    /* nodes */
    function drawNodes(list, anchor){
      var out = '';
      for(var j = 0; j < list.length; j++){
        var n = list[j], p = pos[n.id];
        var active = !sankeySel || sankeySel === n.id;
        out += '<g class="fl-node" data-node="' + n.id + '" opacity="' + (active ? 1 : .32) + '">' +
          '<rect x="' + p.x + '" y="' + p.y + '" width="' + colW + '" height="' + p.h + '" rx="8" ' +
          'fill="' + (anchor === 'out' ? 'rgba(255,59,78,.11)' : 'rgba(0,255,102,.1)') + '" ' +
          'stroke="' + (anchor === 'out' ? 'rgba(255,59,78,.45)' : 'rgba(0,255,102,.42)') + '" stroke-width="1"/>' +
          '<text class="fl-nlabel" x="' + (p.x + 11) + '" y="' + (p.cy - 3) + '">' + esc(T(n.l)) + '</text>' +
          '<text class="fl-nval" x="' + (p.x + 11) + '" y="' + (p.cy + 11) + '">' + esc(T(n.v)) + '</text>' +
          '</g>';
      }
      return out;
    }
    s += drawNodes(FLOW.from, 'out') + drawNodes(FLOW.to, 'in');

    return '<svg class="fl-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" ' +
           'xmlns:xlink="http://www.w3.org/1999/xlink">' + s + '</svg>';
  }

  /* ======================= 3. THE PAGE ======================= */
  function buildFlow(){
    var sec = el('section');
    sec.id = 'flow';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-f="eb"></span></div>' +
        '<h2 data-f="h2"></h2><p class="lede" data-f="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-f="s1"></div>' +
      '<div class="fl-hero reveal"><div data-f="hero"></div>' +
        '<div class="fl-legend"><span data-f="heronote"></span></div></div>' +
      '<div class="v8-sub" data-f="s2"></div><div class="v8-panel reveal"><div class="pool-grid" data-f="pools"></div></div>' +
      '<div class="v8-sub" data-f="s3"></div><div class="fw-grid" data-f="cards"></div>' +
      '<div class="v8-sub" data-f="s4"></div><div class="v8-panel reveal"><div class="rot" data-f="rot"></div>' +
        '<div class="cl-hint" style="margin-top:14px" data-f="rotnote"></div></div>' +
      '<div class="v8-sub" data-f="s5"></div><p class="lede" style="margin-bottom:18px" data-f="simlede"></p>' +
      '<div class="sim-picks" data-f="simpicks"></div><div class="sim-out" data-f="simout"></div>' +
      '<div class="v8-sub" data-f="s6"></div><div class="srcs" data-f="srcs"></div>' +
      '<div class="v8-note" data-f="lead"></div>' +
      '<div class="v8-note" data-f="caveat"></div>';

    var simIdx = 1;

    function q(k){ return sec.querySelector('[data-f="' + k + '"]'); }

    function paintHero(){
      q('hero').innerHTML = sankeySVG();
      var nodes = q('hero').querySelectorAll('[data-node]');
      for(var i = 0; i < nodes.length; i++){
        (function(n){
          n.addEventListener('click', function(){
            var id = n.getAttribute('data-node');
            sankeySel = (sankeySel === id) ? null : id;
            paintHero();
          });
        })(nodes[i]);
      }
      q('heronote').textContent = T(FLOW.heroNote);
    }

    function paintPools(){
      var g = q('pools');
      g.innerHTML = '';
      var max = 0, i;
      for(i = 0; i < FLOW.pools.length; i++){ if(FLOW.pools[i].n > max) max = FLOW.pools[i].n; }
      for(i = 0; i < FLOW.pools.length; i++){
        var p = FLOW.pools[i];
        g.appendChild(el('div', 'pool',
          '<span class="pool-l">' + esc(T(p.l)) + '</span>' +
          '<span class="pool-t"><span class="pool-f" data-w="' +
            Math.max(2, Math.sqrt(p.n / max) * 100).toFixed(1) + '" style="transition-delay:' +
            (i * 0.08).toFixed(2) + 's"></span></span>' +
          '<span class="pool-v">' + esc(p.v) + '</span>'));
      }
      requestAnimationFrame(function(){
        var f = g.querySelectorAll('.pool-f');
        for(var j = 0; j < f.length; j++){ f[j].style.width = f[j].getAttribute('data-w') + '%'; }
      });
    }

    function paintCards(){
      var g = q('cards');
      g.innerHTML = '';
      for(var i = 0; i < FLOW.cards.length; i++){
        var c = FLOW.cards[i];
        g.appendChild(el('div', 'fw-card ' + c.k,
          '<div class="fw-l">' + esc(T(c.l)) + '</div>' +
          '<div class="fw-v">' + esc(c.v) + '</div>' +
          '<div class="fw-n">' + esc(T(c.n)) + '</div>' +
          '<div class="fw-src">— ' + esc(c.s) + '</div>'));
      }
    }

    function paintRot(){
      var g = q('rot');
      g.innerHTML = '';
      var max = 0, i;
      for(i = 0; i < FLOW.rot.length; i++){ max = Math.max(max, Math.abs(FLOW.rot[i].v)); }
      for(i = 0; i < FLOW.rot.length; i++){
        var r = FLOW.rot[i], pos = r.v >= 0;
        g.appendChild(el('div', 'rot-row',
          '<span class="rot-l">' + esc(T(r.l)) + '</span>' +
          '<span class="rot-t"><span class="rot-b ' + (pos ? 'pos' : 'neg') + '" data-w="' +
            (Math.abs(r.v) / max * 50).toFixed(1) + '" style="transition-delay:' + (i * 0.07).toFixed(2) + 's"></span></span>' +
          '<span class="rot-v ' + (pos ? 'pos' : 'neg') + '">' + esc(r.d) + '</span>'));
      }
      requestAnimationFrame(function(){
        var b = g.querySelectorAll('.rot-b');
        for(var j = 0; j < b.length; j++){ b[j].style.width = b[j].getAttribute('data-w') + '%'; }
      });
      q('rotnote').textContent = T(FLOW.rotNote);
    }

    function paintSim(){
      var g = q('simpicks');
      g.innerHTML = '';
      var scale = FLOW.sim.scale[L()] || FLOW.sim.scale.en;
      for(var i = 0; i < FLOW.sim.cases.length; i++){
        (function(c, idx){
          var b = el('button', 'sim-b' + (idx === simIdx ? ' on' : ''),
            '<span class="sim-f">' + esc(T(c.a)) + ' <span class="sim-arr">→</span> ' + esc(T(c.b)) + '</span>' +
            '<span class="sim-tag">' + (c.ph < 0 ? (L() === 'th' ? 'ไม่ใช่สัญญาณวัฏจักร' : 'not a cycle signal') : scale[c.ph]) + '</span>');
          b.type = 'button';
          b.addEventListener('click', function(){ simIdx = idx; paintSim(); });
          g.appendChild(b);
        })(FLOW.sim.cases[i], i);
      }

      var c2 = FLOW.sim.cases[simIdx];
      var segs = '';
      for(var k = 0; k < 4; k++){ segs += '<span class="sim-seg' + (k === c2.ph ? ' on' : '') + '"></span>'; }
      function ul(arr){
        var s = '<ul>';
        for(var j = 0; j < arr.length; j++){ s += '<li>' + esc(arr[j]) + '</li>'; }
        return s + '</ul>';
      }
      q('simout').innerHTML =
        '<div class="sim-scale"><span>' + esc(scale[0]) + '</span><span>' + esc(scale[1]) + '</span>' +
        '<span>' + esc(scale[2]) + '</span><span>' + esc(scale[3]) + '</span></div>' +
        '<div class="sim-meter">' + segs + '</div>' +
        '<div class="sim-phase">' + esc(c2.ph < 0 ? (L() === 'th' ? 'ไม่ใช่สัญญาณวัฏจักร' : 'Not a cycle signal') : scale[c2.ph]) + '</div>' +
        '<div class="sim-body">' + esc(T(c2.n)) + '</div>' +
        '<div class="res-grid">' +
          '<div class="res-card"><div class="rc-h">' + esc(T(FLOW.sim.watchH)) + '</div>' + ul(c2.w[L()] || c2.w.en) + '</div>' +
          '<div class="res-card w"><div class="rc-h warn">' + esc(T(FLOW.sim.breakH)) + '</div>' +
            '<p style="font-size:12.6px;line-height:1.68;color:var(--grey)">' + esc(T(c2.x)) + '</p></div>' +
        '</div>';
      q('simlede').textContent = T(FLOW.sim.lede);
    }

    function paintSrcs(){
      var g = q('srcs');
      g.innerHTML = '';
      for(var i = 0; i < FLOW.srcs.length; i++){
        var s = FLOW.srcs[i];
        var a = el('a', 'src-card',
          '<div class="src-t">' + esc(s.t) + '</div>' +
          '<div class="src-u">' + esc(s.u.replace(/^https?:\/\//, '')) + '</div>' +
          '<div class="src-d">' + esc(T(s.d)) + '</div>');
        a.href = s.u;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        g.appendChild(a);
      }
    }

    function paintAll(){
      q('eb').textContent = T(FLOW.eb) + ' · ' + T(FLOW.asOf);
      q('h2').textContent = T(FLOW.h2);
      q('lede').textContent = T(FLOW.lede);
      q('s1').textContent = T(FLOW.s1);
      q('s2').textContent = T(FLOW.s2);
      q('s3').textContent = T(FLOW.s3);
      q('s4').textContent = T(FLOW.s4);
      q('s5').textContent = T(FLOW.s5);
      q('s6').textContent = T(FLOW.s6);
      q('lead').innerHTML = '<b>◆</b> ' + esc(T(FLOW.lead));
      q('caveat').innerHTML = '<b>⚠</b> ' + esc(T(FLOW.caveat));
      paintHero(); paintPools(); paintCards(); paintRot(); paintSim(); paintSrcs();
    }

    sec.__render = paintAll;
    repaint.push(paintAll);
    paintAll();
    return sec;
  }

  /* ======================= BOOT ======================= */
  function boot(){
    upgradeGate();
    var gate = document.getElementById('spzGate');
    if(gate && gate.hidden && !window.__spzBooted){
      window.__spzBooted = 1;
      document.body.style.overflow = 'hidden';
      runBoot(function(){ document.body.style.overflow = ''; });
    }

    if(document.getElementById('flow')) return;
    var sec = buildFlow();
    sec.setAttribute('data-route', 'flow');
    var anchor = document.getElementById('outlook') || document.getElementById('chartlab');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    /* register the route with the existing router */
    if(window.__spzAddRoute){
      window.__spzAddRoute({
        id:'flow', feat:true, after:'outlook',
        t:{en:'Capital Flow',th:'เงินทุนไหลไปไหน'},
        d:{en:'The sector-by-sector map of where the money actually is right now and which way it is rotating — the follow-up to Turning Point Radar’s early warnings, with a dated flow map and an animated rotation model.',
           th:'แผนที่กระแสเงินระดับกลุ่มอุตสาหกรรม บอกว่าตอนนี้เงินอยู่กลุ่มไหนจริงๆ และกำลังหมุนไปทางไหน ต่อจากสัญญาณเตือนล่วงหน้าในหน้า “สัญญาณเปลี่ยนทิศ” พร้อมแผนที่กระแสเงินลงวันที่และโมเดลหมุนกลุ่มแบบเคลื่อนไหว'}
      });
    }

    new MutationObserver(function(){
      for(var i = 0; i < repaint.length; i++){ try { repaint[i](); } catch(e){} }
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 50); });
  else setTimeout(boot, 50);
})();
