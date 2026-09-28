
(function(){
  'use strict';
  if (window.__SPZ_CONTROLGRID) return;
  window.__SPZ_CONTROLGRID = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function el(t, c, h){ var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }

  var COPY = {
    eyebrow:{en:'Admin Briefing',th:'บรีฟฉบับแอดมิน'},
    h:{en:'Who really controls the world’s money?',th:'ใครคือคนที่คุมเงินโลกจริงๆ?'},
    lede:{en:'A theory from financial YouTube, checked against what the BIS, central banks and researchers have actually published. Facts and speculation are labelled separately the whole way down — education and one analyst’s opinion, never investment advice.',
          th:'ทฤษฎีจากคลิปการเงินใน YouTube เทียบกับสิ่งที่ BIS ธนาคารกลาง และนักวิจัยเผยแพร่จริง ข้อเท็จจริงกับการคาดเดาจะแยกป้ายกำกับชัดเจนตลอดทั้งหน้า เพื่อการศึกษาและความเห็นส่วนตัวของนักวิเคราะห์เว็บนี้เท่านั้น ไม่ใช่คำแนะนำการลงทุน'},

    wheelH:{en:'The ten pieces',th:'สิบชิ้นส่วน'},
    wheelP:{en:'The clip that prompted this page draws these ten as spokes of one wheel, hubbed on BIS-coordinated central banking. Each spoke is a real, separately-verifiable trend — the wheel is the interpretation.',
            th:'คลิปที่เป็นที่มาของหน้านี้วาดสิบสิ่งนี้เป็นซี่เกาะของวงล้อเดียว โดยมีธนาคารกลางที่ประสานงานโดย BIS เป็นแกนกลาง แต่ละซี่เป็นเทรนด์จริงที่ตรวจสอบได้แยกจากกัน ส่วน "วงล้อ" คือการตีความ'},
    hub:{en:'CENTRAL\nBANKS',th:'ธนาคาร\nกลาง'},
    hub2:{en:'+ BIS',th:'+ BIS'},

    whatBisH:{en:'What the BIS actually is',th:'BIS คืออะไรกันแน่'},
    whatBis1:{en:'The Bank for International Settlements (BIS), based in Basel, Switzerland, is often called “the central bank for central banks.” It doesn’t lend to people or companies — its members are the world’s national central banks, including the Federal Reserve, the ECB, the Bank of Japan and the Bank of Thailand. Its job is to help them coordinate policy, hold reserves, and research the next generation of money.',
            th:'ธนาคารเพื่อการชำระหนี้ระหว่างประเทศ (BIS) ตั้งอยู่ที่เมืองบาเซิล สวิตเซอร์แลนด์ มักถูกเรียกว่า "ธนาคารกลางของธนาคารกลาง" มันไม่ปล่อยกู้ให้คนหรือบริษัท สมาชิกของมันคือธนาคารกลางของแต่ละประเทศทั่วโลก รวมถึง Fed, ECB, ธนาคารชาติญี่ปุ่น และธนาคารแห่งประเทศไทย หน้าที่ของมันคือช่วยประสานนโยบาย ถือทุนสำรอง และวิจัยเงินยุคถัดไป'},
    whatBis2:{en:'Since 2019, its BIS Innovation Hub has run joint CBDC and tokenization pilots out of centres in London, Singapore, Switzerland, Frankfurt/Paris and elsewhere — real, published projects, not a rumour. That is the factual core the theory below builds on.',
            th:'ตั้งแต่ปี 2019 ศูนย์ BIS Innovation Hub ของมันรันโครงการนำร่อง CBDC และโทเกนไนซ์ร่วมกัน จากศูนย์ในลอนดอน สิงคโปร์ สวิตเซอร์แลนด์ แฟรงก์เฟิร์ต/ปารีส และอีกหลายแห่ง เป็นโครงการจริงที่เผยแพร่จริง ไม่ใช่ข่าวลือ นี่คือแกนข้อเท็จจริงที่ทฤษฎีด้านล่างนี้ต่อยอดขึ้นมา'},

    theoryH:{en:'The theory, as it’s told',th:'ทฤษฎีที่เล่ากัน'},
    theory1:{en:'A narrative that circulates on financial YouTube — including the clip that prompted this page — goes further: that BIS-coordinated digital money, layered with digital ID, AI scoring and universal QR/smartphone payment rails, adds up to one global control system. In this telling, keeping most people short of real wealth is deliberate — a population with financial breathing room has less reason to keep working, so the system is said to quietly lean against too much of it. Once every payment runs through a traceable digital rail tied to an ID, the same infrastructure that pays out benefits could, in theory, also gate what you’re allowed to buy — the way a traffic-camera point system gates a driving licence.',
             th:'เรื่องเล่าที่วนเวียนอยู่ในวงการเงินบน YouTube — รวมถึงคลิปที่เป็นที่มาของหน้านี้ — ไปไกลกว่านั้น คือมองว่าเงินดิจิทัลที่ประสานงานโดย BIS บวกกับดิจิทัลไอดี การให้คะแนนด้วย AI และระบบจ่ายเงินผ่าน QR/สมาร์ทโฟนที่ใช้กันทั่วโลก รวมกันแล้วกลายเป็นระบบควบคุมโลกเพียงหนึ่งเดียว ตามเรื่องนี้ การทำให้คนส่วนใหญ่ไม่มีความมั่งคั่งมากเกินไปเป็นเรื่องจงใจ — เพราะคนที่มีเงินเหลือจะมีเหตุผลให้หยุดทำงานน้อยกว่า ระบบจึงถูกมองว่าคอยกดไม่ให้มีมากเกินไป พอทุกการจ่ายเงินวิ่งผ่านรางดิจิทัลที่ตรวจสอบได้และผูกกับไอดี โครงสร้างเดียวกันที่จ่ายสวัสดิการก็อาจควบคุมได้ด้วยว่าคุณซื้ออะไรได้บ้าง — เหมือนระบบตัดแต้มคะแนนจากกล้องจับจราจรที่คอยตัดสิทธิ์ใบขับขี่'},
    theory2:{en:'That is a theory about intent, not a documented plan. No central bank, government or BIS publication states this as a goal. But the technical pieces it describes — programmable restrictions, ID-linked wallets, behaviour-based scoring — are real and buildable, which is exactly why the pushback below is real too.',
             th:'นี่คือทฤษฎีเกี่ยวกับเจตนา ไม่ใช่แผนที่มีเอกสารยืนยัน ไม่มีธนาคารกลาง รัฐบาล หรือเอกสาร BIS ฎบับใดของ BIS ระบุเรื่องนี้เป็นเป้าหมาย แต่ชิ้นส่วนทางเทคนิคที่เรื่องนี้พูดถึง — ข้อจำกัดที่ตั้งโปรแกรมได้ กระเป๋าเงินผูกกับ ID การให้คะแนนตามพฤติกรรม — เป็นของจริงที่สร้างได้จริง ซึ่งเป็นเหตุผลเดียวกันที่ทำให้แรงต้านด้านล่างนี้เป็นของจริงเช่นกัน'},

    compareH:{en:'What’s confirmed vs. what’s still speculation',th:'อะไรยืนยันแล้ว vs อะไรยังเป็นการคาดเดา'},
    confirmedH:{en:'Confirmed',th:'ยืนยันแล้ว'},
    specH:{en:'Still speculation',th:'ยังเป็นการคาดเดา'},
    confirmed:[
      {en:'134 countries are researching a CBDC and 49 already have live pilots (Atlantic Council CBDC Tracker, 2025).',
       th:'134 ประเทศกำลังศึกษา CBDC และ 49 ประเทศมีโครงการนำร่องจริงแล้ว (Atlantic Council CBDC Tracker, 2025)'},
      {en:'China’s e-CNY scaled from a 2020 pilot to 260M+ individual wallets, and its bank-operator network tripled to 30 institutions by August 2026, with pilots extending into wage and fiscal payments.',
       th:'e-CNY ของจีนขยายจากโครงการนำร่องปี 2020 มาเป็นกระเป๋าเงินกว่า 260 ล้านใบ และเครือข่ายธนาคารผู้ให้บริการเพิ่มเป็น 3 เท่าเป็น 30 แห่งภายในสิงหาคม 2026 พร้อมขยายโครงการนำร่องไปถึงการจ่ายเงินเดือนและงบการคลัง'},
      {en:'The EU’s Digital Identity Wallet became a legal requirement for member states to offer, effective 2026.',
       th:'กระเป๋าอัตลักษณ์ดิจิทัลของสหภาพยุโรปกลายเป็นข้อบังคับให้ประเทศสมาชิกต้องมีให้ มีผลปี 2026'},
      {en:'Programmable, expiring or restricted digital money has been technically demonstrated in several pilots — a capability, not the same as adopted policy.',
       th:'เงินดิจิทัลแบบตั้งโปรแกรมได้ หมดอายุได้ หรือจำกัดการใช้ได้ ถูกสาธิตทางเทคนิคในหลายโครงการนำร่องแล้ว — เป็นคนละเรื่องกับการเป็นนโยบายจริง'},
      {en:'Real political pushback exists: the U.S. House has passed legislation explicitly barring the Federal Reserve from issuing a retail CBDC, citing surveillance concerns — the fear itself is already shaping law.',
       th:'มีแรงต้านทางการเมืองจริง: สภาผู้แทนสหรัฐฯ ผ่านกฎหมายห้าม Fed ออก CBDC สำหรับรายย่อยโดยตรง โดยอ้างความกังวลเรื่องการสอดส่อง — ความกลัวนี้เองกำลังกำหนดกฎหมายจริงแล้ว'}
    ],
    speculation:[
      {en:'No stated policy anywhere ties CBDC use to behaviour scoring, travel bans or spending bans.',
       th:'ไม่มีนโยบายที่ไหนผูก CBDC เข้ากับการให้คะแนนพฤติกรรม การห้ามเดินทาง หรือการห้ามใช้จ่าย'},
      {en:'Most live retail CBDC designs explicitly cap or anonymise small transactions specifically to blunt privacy criticism.',
       th:'การออกแบบ CBDC รายย่อยส่วนใหญ่ที่ใช้งานจริง จำกัดเพดานหรือทำให้นิรนามธุรกรรมเล็กๆ โดยเจาะจงเพื่อลดเสียงวิจารณ์เรื่องความเป็นส่วนตัว'},
      {en:'Whether digital money fully replaces physical cash is still contested — the ECB has publicly committed to keep cash available alongside a digital euro.',
       th:'เงินดิจิทัลจะแทนที่เงินสดทั้งหมดหรือไม่ยังเป็นข้อถกเถียง — ECB ยืนยันต่อสาธารณะว่าจะคงเงินสดคู่กับยูโรดิจิทัล'},
      {en:'“One person above all central banks” is not a documented governance structure — BIS itself is run by its member central bank governors collectively, not a single individual.',
       th:'"มีคนคนเดียวอยู่เหนือธนาคารกลางทุกแห่ง" ไม่ใช่โครงสร้างการกำกับดูแลที่มีเอกสารยืนยัน — BIS เองบริหารโดยผู้ว่าการธนาคารกลางสมาชิกร่วมกัน ไม่ใช่คนเดียว'}
    ],

    forecastH:{en:'Forecast — this site’s own read, not certainty',th:'คาดการณ์ — มุมมองส่วนตัวของเว็บนี้ ไม่ใช่เรื่องแน่นอน'},
    fc1w:{en:'2026–2028',th:'2569–2571'},
    fc1t:{en:'More pilots. Most G20 economies likely run at least a wholesale CBDC trial; EU digital-ID coverage climbs as the wallet mandate rolls out; QR/mobile payment keeps displacing cash across Southeast Asia.',
          th:'โครงการนำร่องจะเพิ่มขึ้น ประเทศ G20 ส่วนใหญ่น่าจะทดลอง CBDC ระดับสถาบันอย่างน้อยหนึ่งแบบ ดิจิทัลไอดีของ EU จะครอบคลุมกว้างขึ้นตามข้อบังคับกระเป๋า ส่วน QR/มือถือจะแทนที่เงินสดในเอเชียตะวันออกเฉียงใต้ต่อไป'},
    fc2w:{en:'2028–2032',th:'2571–2575'},
    fc2t:{en:'A majority of BIS member central banks likely have some live CBDC (wholesale or retail), following their own surveyed intentions; interoperability trials between digital ID and payment rails likely become common.',
          th:'ธนาคารกลางสมาชิก BIS ส่วนใหญ่น่าจะมี CBDC ใช้งานจริงบางรูปแบบ ตามทิศทางที่สำรวจจากตัวเอง การทดลองเชื่อมต่อระหว่างดิจิทัลไอดีกับระบบจ่ายเงินน่าจะเป็นเรื่องปกติมากขึ้น'},
    fc3w:{en:'The open question',th:'คำถามที่ยังเปิดอยู่'},
    fc3t:{en:'Whether the safeguards being written into law now — anonymity thresholds, the U.S. retail-CBDC ban, the ECB’s cash guarantee — hold as adoption scales. That is a live policy fight, not a foregone conclusion, and it is the one thing actually worth watching.',
          th:'กลไกที่กำลังถูกเขียนเป็นกฎหมายอยู่ตอนนี้ — เกณฑ์นิรนาม การห้าม CBDC รายย่อยของสหรัฐฯ การรับประกันเงินสดของ ECB — จะยืนหยัดได้จริงหรือไม่เมื่อการใช้งานขยายตัว นี่คือศึกนโยบายที่ยังสู้กันอยู่จริง ไม่ใช่ข้อสรุปที่ตายตัวแล้ว และเป็นสิ่งเดียวที่ควรจับตาดูจริงๆ'},

    tableH:{en:'Digital money & digital ID: then, now, projected',th:'เงินดิจิทัลและดิจิทัลไอดี: อดีต ปัจจุบัน คาดการณ์'},
    tableL:{en:'Every figure below is dated and cited — see the sources note underneath.',
            th:'ทุกตัวเลขด้านล่างมีการระบุวันที่และแหล่งที่มาชัดเจน — ดูหมายเหตุแหล่งที่มาด้านล่าง'},
    colThen:{en:'Then (≈2012–2015)',th:'อดีต (≈ 2555–2558)'},
    colNow:{en:'Now (2026)',th:'ปัจจุบัน (2569)'},
    colProj:{en:'Projected (early 2030s)',th:'คาดการณ์ (ต้นทศวรรษ 2570+)'},

    foot:{en:'This page blends verified facts (cited above and below) with a widely-shared theory and this site’s own forecast — each one labelled the whole way through. It is education and one analyst’s opinion, never investment advice, and it is not a claim that any named institution has stated an intent to control anyone. Sources: Bank for International Settlements (bis.org), Atlantic Council CBDC Tracker, World Bank ID4D, Capgemini World Payments Report, Cato Institute, World Economic Forum.',
          th:'หน้านี้ผนข้อเท็จจริงที่ตรวจสอบได้ (อ้างอิงด้านบนและล่าง) เข้ากับทฤษฎีที่เผยแพร่อย่างกว้างขวาง และคาดการณ์ส่วนตัวของเว็บนี้ — แต่ละส่วนมีป้ายกำกับชัดเจนตลอดทั้งหน้า เพื่อการศึกษาและความเห็นส่วนตัวของนักวิเคราะห์เว็บนี้เท่านั้น ไม่ใช่คำแนะนำการลงทุน และไม่ได้หมายความว่าองค์กรที่ถูกระบุชื่อใดๆได้ประกาศเจตนาจะควบคุมใคร แหล่งข้อมูล: Bank for International Settlements (bis.org), Atlantic Council CBDC Tracker, World Bank ID4D, Capgemini World Payments Report, Cato Institute, World Economic Forum'}
  };

  var NODES = [
    { k:'ai', l:{en:'AI',th:'AI'}, n:{en:'Already screens loan approvals, fraud alerts and credit scoring at most major banks.',th:'ใช้คัดกรองสินเชื่อ ตรวจจับการโกง และให้คะแนนเครดิตในธนาคารใหญ่แทบทุกแห่งแล้ว'} },
    { k:'asset', l:{en:'Digital Asset',th:'สินทรัพย์ดิจิทัล'}, n:{en:'Tokenised bonds and wholesale CBDC settlement are already live pilots at several central banks.',th:'พันธบัตรโทเกนและการชำระเงินแบบ CBDC ระดับสถาบัน กำลังทดลองจริงในหลายธนาคารกลาง'} },
    { k:'home', l:{en:'Smart Home',th:'บ้านอัจฉริยะ'}, n:{en:'Utility meters and connected appliances increasingly report usage data tied back to a billing account.',th:'มิเตอร์ไฟและเครื่องใช้ไฟฟ้าส่งข้อมูลการใช้งานที่ผูกกับบัญชีค่าใช้จ่ายมากขึ้นเรื่อยๆ'} },
    { k:'farm', l:{en:'Digital Food Farming',th:'เกษตร-อาหารดิจิทัล'}, n:{en:'National food-traceability and precision-agriculture programs already log a crop’s path from farm to shelf.',th:'โครงการตรวจสอบย้อนกลับอาหารและเกษตรแม่นยำระดับประเทศ บันทึกเส้นทางพืชผลตั้งแต่ฟาร์มถึงชั้นวางอยู่แล้ว'} },
    { k:'data', l:{en:'Big Data',th:'บิ๊กดาต้า'}, n:{en:'Spending, location and browsing data are already pooled commercially for credit-scoring and ad-targeting.',th:'ข้อมูลการใช้จ่าย ตำแหน่ง และพฤติกรรมออนไลน์ ถูกรวบรวมเชิงพาณิชย์เพื่อให้คะแนนเครดิตและยิงโฆษณาอยู่แล้ว'} },
    { k:'phone', l:{en:'Smartphone',th:'สมาร์ทโฟน'}, n:{en:'The device most CBDC pilots assume every user already carries as the wallet.',th:'อุปกรณ์ที่โครงการ CBDC ส่วนใหญ่ตั้งสมมติฐานว่าทุกคนพกติดตัวอยู่แล้วในฐานะกระเป๋าเงิน'} },
    { k:'qr', l:{en:'QR Code',th:'คิวอาร์โค้ด'}, n:{en:'Already the default checkout method across Southeast Asia, China and India.',th:'กลายเป็นวิธีจ่ายเงินหลักในเอเชียตะวันออกเฉียงใต้ จีน และอินเดียไปแล้ว'} },
    { k:'social', l:{en:'Social Media',th:'โซเชียลมีเดีย'}, n:{en:'Some digital-ID and CBDC pilots use social platforms for identity verification and onboarding.',th:'โครงการดิจิทัลไอดีและ CBDC บางโครงการใช้แพลตฟอร์มโซเชียลช่วยยืนยันตัวตนและเปิดบัญชี'} },
    { k:'id', l:{en:'Digital ID',th:'ดิจิทัลไอดี'}, n:{en:'The EU’s Digital Identity Wallet became mandatory in 2026; India’s Aadhaar already covers 1.3B+ people.',th:'กระเป๋าอัตลักษณ์ดิจิทัลของ EU เป็นข้อบังคับปี 2026 ส่วน Aadhaar ของอินเดียครอบคลุมกว่า 1,300 ล้านคนแล้ว'} },
    { k:'ccy', l:{en:'All Digital Currency',th:'เงินดิจิทัลทั้งหมด'}, n:{en:'134 countries now explore a CBDC and 49 already pilot one, per the Atlantic Council’s tracker.',th:'134 ประเทศกำลังศึกษา CBDC และ 49 ประเทศมีโครงการนำร่องแล้ว ตามข้อมูลของ Atlantic Council'} }
  ];

  var ROWS = [
    { f:{en:'Countries exploring/piloting a CBDC',th:'ประเทศที่ศึกษา/นำร่อง CBDC'},
      then:{en:'0 formal pilots before 2020',th:'ยังไม่มีโครงการนำร่องจริงก่อนปี 2020'},
      now:{en:'134 exploring, 49 piloting (2025)',th:'134 ประเทศศึกษา 49 ประเทศนำร่อง (2025)'},
      proj:{en:'Most BIS members expected to run some live CBDC',th:'สมาชิก BIS ส่วนใหญ่คาดว่าจะมี CBDC ใช้งานจริง'} },
    { f:{en:'Live retail CBDC in a major economy',th:'CBDC รายย่อยใช้จริงในประเทศใหญ่'},
      then:{en:'None',th:'ยังไม่มี'},
      now:{en:'China e-CNY: 260M+ wallets, 30 bank operators (2026)',th:'e-CNY จีน: 260 ล้านใบ, ธนาคารผู้ให้บริการ 30 แห่ง (2026)'},
      proj:{en:'Rollout pace uncertain — depends on political pushback',th:'ความเร็วยังไม่แน่นอน ขึ้นกับแรงต้านทางการเมือง'} },
    { f:{en:'Global non-cash transaction volume / yr',th:'ปริมาณธุรกรรมไร้เงินสดทั่วโลก/ปี'},
      then:{en:'≈333 billion (early 2010s)',th:'≈ 3.33 แสนครั้ง (ต้นทศวรรษ 2010)'},
      now:{en:'≈1.3 trillion (2023)',th:'≈ 1.3 ล้านล้านครั้ง (2023)'},
      proj:{en:'≈2.3 trillion projected (2027, Capgemini)',th:'คาด≈ 2.3 ล้านล้านครั้ง (2027, Capgemini)'} },
    { f:{en:'People with no official digital ID',th:'คนที่ไม่มีดิจิทัลไอดี'},
      then:{en:'≈1.1B lacked any official ID (2014 World Bank ID4D baseline)',th:'≈ 1,100 ล้านคนไม่มีบัตรประจำตัวใดๆ (ฐาน World Bank ID4D ปี 2014)'},
      now:{en:'≈2.8B still lack a digital ID specifically (World Bank)',th:'≈ 2,800 ล้านคนยังไม่มีดิจิทัลไอดี (World Bank)'},
      proj:{en:'EU + national programs push toward near-universal digital ID',th:'โครงการ EU และระดับชาติดันเข้าสู่ดิจิทัลไอดีทั่วถึง'} },
    { f:{en:'Legal safeguards vs. programmable/surveillance money',th:'กฎหมายคุ้มครองเรื่องเงินโปรแกรม/เฝ้าระวัง'},
      then:{en:'None written specifically',th:'ยังไม่มีกฎหมายเฉพาะ'},
      now:{en:'US House-passed ban on Fed retail CBDC; ECB cash-guarantee pledge',th:'สภาผู้แทนฯ สหรัฐฯ ผ่านกฎห้าม Fed ออก CBDC รายย่อย; ECB ยืนยันจะคงเงินสด'},
      proj:{en:'Depends on ongoing legislative fights — not guaranteed',th:'ขึ้นกับการต่อสู้ทางกฎหมายที่ยังดำเนินอยู่ ไม่เหมือนกัน'} }
  ];

  function wheelSVG(){
    var cx = 300, cy = 300, R = 210, hubR = 78, nodeRx = 96, nodeRy = 27;
    var n = NODES.length;
    var parts = [];
    parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+hubR+'" fill="rgba(204,255,0,.08)" stroke="var(--neon)" stroke-width="1.6"/>');
    for (var i = 0; i < n; i++){
      var ang = (-90 + i * (360 / n)) * Math.PI / 180;
      var x = cx + R * Math.cos(ang);
      var y = cy + R * Math.sin(ang);
      var hx = cx + hubR * Math.cos(ang);
      var hy = cy + hubR * Math.sin(ang);
      parts.push('<line x1="'+hx.toFixed(1)+'" y1="'+hy.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="rgba(204,255,0,.28)" stroke-width="1.2"/>');
      var label = esc(tx(NODES[i].l));
      var words = label.split(' ');
      var line1 = words.length > 1 ? words.slice(0, Math.ceil(words.length/2)).join(' ') : label;
      var line2 = words.length > 1 ? words.slice(Math.ceil(words.length/2)).join(' ') : '';
      parts.push('<g>' +
        '<rect x="'+(x-nodeRx).toFixed(1)+'" y="'+(y-nodeRy).toFixed(1)+'" width="'+(nodeRx*2)+'" height="'+(nodeRy*2)+
          '" rx="13" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.22)" stroke-width="1" data-node="'+esc(NODES[i].k)+'" class="cg-node-hit" style="cursor:pointer;"/>' +
        '<text x="'+x.toFixed(1)+'" y="'+(line2 ? y-3 : y+4).toFixed(1)+'" text-anchor="middle" class="cg-node-t">'+line1+'</text>' +
        (line2 ? '<text x="'+x.toFixed(1)+'" y="'+(y+13).toFixed(1)+'" text-anchor="middle" class="cg-node-t">'+line2+'</text>' : '') +
      '</g>');
    }
    var hubLines = tx(COPY.hub).split('\n');
    parts.push('<text x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle" class="cg-hub-t">'+esc(hubLines[0]||'')+'</text>');
    if (hubLines[1]) parts.push('<text x="'+cx+'" y="'+(cy+12)+'" text-anchor="middle" class="cg-hub-t">'+esc(hubLines[1])+'</text>');
    parts.push('<text x="'+cx+'" y="'+(cy+30)+'" text-anchor="middle" class="cg-hub-t2">'+esc(tx(COPY.hub2))+'</text>');
    return '<svg class="cg-wheel-svg" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">' + parts.join('') + '</svg>';
  }

  function legendHTML(){
    var h = '';
    for (var i = 0; i < NODES.length; i++){
      h += '<div class="cg-leg-item"><b>' + esc(tx(NODES[i].l)) + '</b><span>' + esc(tx(NODES[i].n)) + '</span></div>';
    }
    return h;
  }

  function compareHTML(){
    var okLi = '', spLi = '';
    for (var i = 0; i < COPY.confirmed.length; i++) okLi += '<li>' + esc(tx(COPY.confirmed[i])) + '</li>';
    for (var j = 0; j < COPY.speculation.length; j++) spLi += '<li>' + esc(tx(COPY.speculation[j])) + '</li>';
    return '<div class="cg-cc ok"><h4>' + esc(tx(COPY.confirmedH)) + '</h4><ul>' + okLi + '</ul></div>' +
           '<div class="cg-cc spec"><h4>' + esc(tx(COPY.specH)) + '</h4><ul>' + spLi + '</ul></div>';
  }

  function tableHTML(){
    var head = '<tr><th></th><th>' + esc(tx(COPY.colThen)) + '</th><th>' + esc(tx(COPY.colNow)) + '</th><th>' + esc(tx(COPY.colProj)) + '</th></tr>';
    var body = '';
    for (var i = 0; i < ROWS.length; i++){
      var r = ROWS[i];
      body += '<tr><td>' + esc(tx(r.f)) + '</td><td>' + esc(tx(r.then)) + '</td><td class="now">' + esc(tx(r.now)) + '</td><td>' + esc(tx(r.proj)) + '</td></tr>';
    }
    return '<thead>' + head + '</thead><tbody>' + body + '</tbody>';
  }

  var sec;

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-cg="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(COPY.eyebrow);
    if (q('h')) q('h').textContent = tx(COPY.h);
    if (q('lede')) q('lede').textContent = tx(COPY.lede);
    if (q('wheelH')) q('wheelH').textContent = tx(COPY.wheelH);
    if (q('wheelP')) q('wheelP').textContent = tx(COPY.wheelP);
    if (q('wheel')) q('wheel').innerHTML = wheelSVG();
    if (q('legend')) q('legend').innerHTML = legendHTML();
    if (q('whatBisH')) q('whatBisH').textContent = tx(COPY.whatBisH);
    if (q('whatBis1')) q('whatBis1').textContent = tx(COPY.whatBis1);
    if (q('whatBis2')) q('whatBis2').textContent = tx(COPY.whatBis2);
    if (q('theoryH')) q('theoryH').textContent = tx(COPY.theoryH);
    if (q('theory1')) q('theory1').textContent = tx(COPY.theory1);
    if (q('theory2')) q('theory2').textContent = tx(COPY.theory2);
    if (q('compareH')) q('compareH').textContent = tx(COPY.compareH);
    if (q('compare')) q('compare').innerHTML = compareHTML();
    if (q('forecastH')) q('forecastH').textContent = tx(COPY.forecastH);
    if (q('fc1w')) q('fc1w').textContent = tx(COPY.fc1w);
    if (q('fc1t')) q('fc1t').textContent = tx(COPY.fc1t);
    if (q('fc2w')) q('fc2w').textContent = tx(COPY.fc2w);
    if (q('fc2t')) q('fc2t').textContent = tx(COPY.fc2t);
    if (q('fc3w')) q('fc3w').textContent = tx(COPY.fc3w);
    if (q('fc3t')) q('fc3t').textContent = tx(COPY.fc3t);
    if (q('tableH')) q('tableH').textContent = tx(COPY.tableH);
    if (q('tableL')) q('tableL').textContent = tx(COPY.tableL);
    if (q('table')) q('table').innerHTML = tableHTML();
    if (q('foot')) q('foot').textContent = tx(COPY.foot);

    var rv = sec.querySelectorAll('.reveal');
    for (var k = 0; k < rv.length; k++) rv[k].classList.add('in-view');
  }

  function build(){
    if (document.getElementById('controlgrid')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'controlgrid';
    sec.setAttribute('data-route', 'controlgrid');
    sec.innerHTML =
      '<div class="cg-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-cg="eb"></span></div>' +
          '<h2 data-cg="h"></h2>' +
          '<p class="lede" data-cg="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +

        '<div class="cg-block reveal in-view">' +
          '<span class="cg-tag theory">' + esc(tx({en:'Wheel = interpretation',th:'วงล้อ = การตีความ'})) + '</span>' +
          '<h3 data-cg="wheelH"></h3><p data-cg="wheelP"></p>' +
        '</div>' +
        '<div class="cg-wheel-row reveal in-view">' +
          '<div data-cg="wheel"></div>' +
          '<div class="cg-legend" data-cg="legend"></div>' +
        '</div>' +

        '<div class="cg-block reveal in-view">' +
          '<span class="cg-tag fact">' + esc(tx({en:'Verified fact',th:'ข้อเท็จจริงที่ยืนยันแล้ว'})) + '</span>' +
          '<h3 data-cg="whatBisH"></h3><p data-cg="whatBis1"></p><p data-cg="whatBis2"></p>' +
        '</div>' +

        '<div class="cg-block reveal in-view">' +
          '<span class="cg-tag theory">' + esc(tx({en:'Theory / opinion',th:'ทฤษฎี / ความเห็น'})) + '</span>' +
          '<h3 data-cg="theoryH"></h3><p data-cg="theory1"></p><p data-cg="theory2"></p>' +
        '</div>' +

        '<div class="cg-block reveal in-view" style="max-width:1040px;"><h3 data-cg="compareH"></h3></div>' +
        '<div class="cg-compare reveal in-view" data-cg="compare"></div>' +

        '<div class="cg-block reveal in-view">' +
          '<span class="cg-tag forecast">' + esc(tx({en:'Forecast',th:'คาดการณ์'})) + '</span>' +
          '<h3 data-cg="forecastH"></h3>' +
        '</div>' +
        '<div class="reveal in-view">' +
          '<div class="cg-fc-row"><div class="cg-fc-when" data-cg="fc1w"></div><div class="cg-fc-txt" data-cg="fc1t"></div></div>' +
          '<div class="cg-fc-row"><div class="cg-fc-when" data-cg="fc2w"></div><div class="cg-fc-txt" data-cg="fc2t"></div></div>' +
          '<div class="cg-fc-row"><div class="cg-fc-when" data-cg="fc3w"></div><div class="cg-fc-txt" data-cg="fc3t"></div></div>' +
        '</div>' +

        '<div class="cg-block reveal in-view" style="margin-top:30px;"><h3 data-cg="tableH"></h3><p data-cg="tableL"></p></div>' +
        '<div class="cg-table-scroll reveal in-view"><table class="cg-table" data-cg="table"></table></div>' +

        '<p class="cg-foot" data-cg="foot"></p>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'controlgrid', after:'cockpit',
      t:{en:'Who Controls the World’s Money?',th:'ใครคุมเงินโลก?'},
      d:{en:'BIS, CBDCs, digital ID and the control-grid theory — fact-checked, admin only.',
         th:'BIS, CBDC, ดิจิทัลไอดี และทฤษฎีวงล้อควบคุม — เช็คข้อเท็จจริงแล้ว เฉพาะแอดมิน'}
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

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
