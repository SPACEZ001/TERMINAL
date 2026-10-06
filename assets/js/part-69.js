/* ===========================================================================
   MACRO LAB (#/macrolab) -- "Understand the macro dials": an animated,
   interactive infographic that teaches how GDP, inflation, interest rates,
   bond yields, the dollar index, spending, liquidity and government debt
   fit together, who gains or loses (borrowers, lenders, savers), what
   central banks and treasuries can do, and what that tends to mean for the
   dollar, stocks, bonds, gold, Bitcoin, oil and cash.

   EN + TH. No network calls, no storage. Everything runs from one small
   transparent model: 8 "levers" (the dials) x 7 assets (a coefficient
   table, LEVERS below). Scenarios are just lever settings, the heat map is
   those settings run through the table, and the simulator sliders are the
   same table driven by hand -- so the page can never contradict itself.

   The coefficients are rule-of-thumb TENDENCIES taught in introductory macro
   and markets courses, not forecasts or measurements; the page says so.
   =========================================================================== */
(function(){
  'use strict';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function $(sel, root){ return (root || document).querySelector(sel); }

  /* ----------------------------- the model ----------------------------- */
  var ASSETS = ['usd', 'stocks', 'bonds', 'gold', 'btc', 'oil', 'cash'];
  var ANAME = {
    usd:    { en:'US dollar', th:'ดอลลาร์สหรัฐ' },
    stocks: { en:'Stocks', th:'หุ้น' },
    bonds:  { en:'Long bonds (price)', th:'พันธบัตรยาว (ราคา)' },
    gold:   { en:'Gold', th:'ทองคำ' },
    btc:    { en:'Bitcoin', th:'บิตคอยน์' },
    oil:    { en:'Oil', th:'น้ำมัน' },
    cash:   { en:'Cash savings (real value)', th:'เงินออมเงินสด (มูลค่าจริง)' }
  };
  var ASHORT = {
    usd:{ en:'USD', th:'ดอลลาร์' }, stocks:{ en:'Stocks', th:'หุ้น' }, bonds:{ en:'Bonds', th:'พันธบัตร' },
    gold:{ en:'Gold', th:'ทองคำ' }, btc:{ en:'BTC', th:'BTC' }, oil:{ en:'Oil', th:'น้ำมัน' }, cash:{ en:'Cash', th:'เงินสด' }
  };
  //            USD   stocks bonds  gold   btc    oil    cash
  var LEVERS = {
    rates:     [ .8, -.8, -1.2, -.7, -.8, -.2,  .5 ],
    inflation: [  0, -.5,  -.8,  .7,  .2,  .4, -1.2 ],
    dollar:    [ 1.5, -.4,  .2, -.8, -.6, -.6,  .5 ],
    growth:    [ .4,  .9, -.5, -.2,  .4,  .7, -.2 ],
    liquidity: [ -.6, .8,  .5,  .9, 1.1,  .4, -.8 ],
    energy:    [ .2, -.3, -.3,  .4, -.3, 1.5, -.5 ],
    debt:      [ -1, -.6, -1.2, 1.3,  .6,   0, -.5 ],
    fear:      [ .8, -1.2,  .7,  .6, -1.2, -.5,  .7 ]
  };
  var LKEYS = ['rates', 'inflation', 'dollar', 'growth', 'liquidity', 'energy', 'debt', 'fear'];
  var LN = {
    rates:     { n:{ en:'Interest rates', th:'อัตราดอกเบี้ย' }, lo:{ en:'cut', th:'ลด' }, hi:{ en:'hike', th:'ขึ้น' } },
    inflation: { n:{ en:'Inflation', th:'เงินเฟ้อ' }, lo:{ en:'cooling', th:'ลดลง' }, hi:{ en:'rising', th:'สูงขึ้น' } },
    dollar:    { n:{ en:'Dollar index', th:'ดัชนีดอลลาร์' }, lo:{ en:'weaker', th:'อ่อนลง' }, hi:{ en:'stronger', th:'แข็งขึ้น' } },
    growth:    { n:{ en:'Growth & spending', th:'การเติบโตและการใช้จ่าย' }, lo:{ en:'weaker', th:'แผ่วลง' }, hi:{ en:'stronger', th:'แรงขึ้น' } },
    liquidity: { n:{ en:'Liquidity (money printing)', th:'สภาพคล่อง (การพิมพ์เงิน)' }, lo:{ en:'tighter', th:'ตึงขึ้น' }, hi:{ en:'easier', th:'ล้นขึ้น' } },
    energy:    { n:{ en:'Oil & energy prices', th:'ราคาน้ำมันและพลังงาน' }, lo:{ en:'lower', th:'ต่ำลง' }, hi:{ en:'higher', th:'สูงขึ้น' } },
    debt:      { n:{ en:'Worry about government debt', th:'ความกังวลเรื่องหนี้รัฐบาล' }, lo:{ en:'calm', th:'สงบ' }, hi:{ en:'alarmed', th:'ตื่นกลัว' } },
    fear:      { n:{ en:'Market fear', th:'ความหวาดกลัวในตลาด' }, lo:{ en:'calm', th:'สงบ' }, hi:{ en:'panic', th:'ตื่นตระหนก' } }
  };

  function calc(v){
    return ASSETS.map(function(_, i){
      return LKEYS.reduce(function(s, l){ return s + (v[l] || 0) * LEVERS[l][i]; }, 0);
    });
  }

  // scenario = lever settings + short explanations (what it is / why it moves things / who can act)
  var SC = [
    { id:'hike', g:'cb', v:{ rates:2 },
      n:{ en:'Central bank hikes rates', th:'ธนาคารกลางขึ้นดอกเบี้ย' },
      d:{ en:'Higher yields make dollar deposits and new bonds more attractive, while loans and risk-taking get costlier.', th:'ผลตอบแทนที่สูงขึ้นทำให้เงินฝากดอลลาร์และพันธบัตรใหม่น่าสนใจขึ้น ขณะที่การกู้และการเสี่ยงแพงขึ้น' },
      cb:{ en:'Raise the policy rate, signal more to come.', th:'ขึ้นดอกเบี้ยนโยบาย และส่งสัญญาณว่าจะขึ้นอีก' },
      gov:{ en:'Little direct role; the interest bill on its debt rises.', th:'แทบไม่มีบทบาทโดยตรง แต่ภาระดอกเบี้ยของหนี้รัฐบาลสูงขึ้น' } },
    { id:'cut', g:'cb', v:{ rates:-2 },
      n:{ en:'Central bank cuts rates', th:'ธนาคารกลางลดดอกเบี้ย' },
      d:{ en:'Cheaper money pushes savers toward riskier assets and lifts bond prices; the currency usually softens.', th:'เงินที่ถูกลงผลักให้ผู้ออมไปหาสินทรัพย์เสี่ยง ราคาพันธบัตรขึ้น และค่าเงินมักอ่อนลง' },
      cb:{ en:'Lower the policy rate; can add guidance or bond purchases.', th:'ลดดอกเบี้ยนโยบาย อาจเสริมด้วยการส่งสัญญาณหรือซื้อพันธบัตร' },
      gov:{ en:'Debt becomes cheaper to refinance.', th:'หนี้รัฐบาลรีไฟแนนซ์ได้ถูกลง' } },
    { id:'qe', g:'cb', v:{ liquidity:2 },
      n:{ en:'Money printing (QE)', th:'พิมพ์เงิน (QE)' },
      d:{ en:'The central bank buys bonds with newly created money. More cash chases a fixed supply of assets.', th:'ธนาคารกลางซื้อพันธบัตรด้วยเงินที่สร้างขึ้นใหม่ เงินที่มากขึ้นไล่ตามสินทรัพย์ที่มีจำกัด' },
      cb:{ en:'Buy government and other bonds; hold them on its balance sheet.', th:'ซื้อพันธบัตรรัฐบาลและอื่นๆ แล้วถือไว้ในงบดุล' },
      gov:{ en:'Finds it easier to sell new bonds.', th:'ขายพันธบัตรใหม่ได้ง่ายขึ้น' } },
    { id:'qt', g:'cb', v:{ liquidity:-2 },
      n:{ en:'Liquidity drains (QT)', th:'ดูดสภาพคล่อง (QT)' },
      d:{ en:'The central bank lets bonds mature or sells them, pulling money out of the system.', th:'ธนาคารกลางปล่อยให้พันธบัตรครบกำหนดหรือขายออก ดึงเงินออกจากระบบ' },
      cb:{ en:'Shrink the balance sheet.', th:'ลดขนาดงบดุล' },
      gov:{ en:'Must find private buyers for more of its bonds.', th:'ต้องหาผู้ซื้อเอกชนมากขึ้นสำหรับพันธบัตร' } },
    { id:'hotinf', g:'prices', v:{ inflation:2, rates:1 },
      n:{ en:'Inflation surprises higher', th:'เงินเฟ้อสูงกว่าคาด' },
      d:{ en:'Prices rise faster than expected, so cash and fixed-rate bonds lose real value and rates are expected to go up.', th:'ราคาสินค้าขึ้นเร็วกว่าคาด เงินสดและพันธบัตรดอกเบี้ยคงที่เสียมูลค่าจริง และตลาดคาดว่าดอกเบี้ยจะขึ้น' },
      cb:{ en:'Hike rates or shrink liquidity.', th:'ขึ้นดอกเบี้ยหรือลดสภาพคล่อง' },
      gov:{ en:'Cut spending, raise taxes, or ease supply bottlenecks.', th:'ลดรายจ่าย เพิ่มภาษี หรือแก้คอขวดด้านอุปทาน' } },
    { id:'coolinf', g:'prices', v:{ inflation:-2, rates:-1 },
      n:{ en:'Inflation cools', th:'เงินเฟ้อชะลอลง' },
      d:{ en:'Price rises slow, easing pressure on rates; cash keeps its value and bonds recover.', th:'ราคาสินค้าขึ้นช้าลง ลดแรงกดดันต่อดอกเบี้ย เงินสดรักษามูลค่าได้และพันธบัตรฟื้น' },
      cb:{ en:'Room to cut rates.', th:'มีช่องลดดอกเบี้ย' },
      gov:{ en:'Real interest cost of debt rises slightly.', th:'ต้นทุนดอกเบี้ยแท้จริงของหนี้สูงขึ้นเล็กน้อย' } },
    { id:'repress', g:'prices', v:{ inflation:2, rates:-1, liquidity:1 },
      n:{ en:'Rates held down while prices rise', th:'กดดอกเบี้ยไว้ ขณะราคาสินค้าขึ้น' },
      d:{ en:'Sometimes called financial repression: interest stays below inflation, so debts shrink in real terms and savers pay the bill.', th:'บางครั้งเรียกว่า financial repression คือดอกเบี้ยต่ำกว่าเงินเฟ้อ หนี้จึงลดลงในมูลค่าจริงและผู้ออมเป็นคนจ่าย' },
      cb:{ en:'Cap yields, keep buying bonds, keep policy rates low.', th:'กดผลตอบแทน ซื้อพันธบัตรต่อเนื่อง และคุมดอกเบี้ยนโยบายให้ต่ำ' },
      gov:{ en:'Benefits: the real value of its debt falls.', th:'ได้ประโยชน์: มูลค่าจริงของหนี้ลดลง' } },
    { id:'strongusd', g:'money', v:{ dollar:2 },
      n:{ en:'Dollar surges', th:'ดอลลาร์พุ่งแข็ง' },
      d:{ en:'Dollar-priced things get dearer for the rest of the world, which usually weighs on gold, oil and US exporters.', th:'ของที่ตีราคาเป็นดอลลาร์แพงขึ้นสำหรับคนทั้งโลก มักกดทองคำ น้ำมัน และผู้ส่งออกสหรัฐ' },
      cb:{ en:'Others may sell reserves to defend their currencies.', th:'ประเทศอื่นอาจขายทุนสำรองเพื่อปกป้องค่าเงินตัวเอง' },
      gov:{ en:'Imports get cheaper, which helps hold down inflation.', th:'สินค้านำเข้าถูกลง ช่วยกดเงินเฟ้อ' } },
    { id:'weakusd', g:'money', v:{ dollar:-2 },
      n:{ en:'Dollar slides', th:'ดอลลาร์อ่อนค่า' },
      d:{ en:'Dollar-priced assets look cheaper abroad, which often lifts gold, commodities and emerging markets.', th:'สินทรัพย์ตีราคาดอลลาร์ดูถูกลงในสายตาต่างชาติ มักหนุนทองคำ สินค้าโภคภัณฑ์ และตลาดเกิดใหม่' },
      cb:{ en:'Could hike rates to defend the currency.', th:'อาจขึ้นดอกเบี้ยเพื่อพยุงค่าเงิน' },
      gov:{ en:'Exports get cheaper to foreigners; imports cost more.', th:'ส่งออกถูกลงในสายตาต่างชาติ นำเข้าแพงขึ้น' } },
    { id:'boom', g:'growth', v:{ growth:2, rates:1 },
      n:{ en:'Strong growth', th:'เศรษฐกิจโตแรง' },
      d:{ en:'Profits and jobs grow; but a hot economy usually brings higher rates, which weighs on bonds and gold.', th:'กำไรและการจ้างงานเติบโต แต่เศรษฐกิจร้อนมักพาดอกเบี้ยขึ้น กดพันธบัตรและทองคำ' },
      cb:{ en:'Lean toward higher rates to avoid overheating.', th:'โน้มไปทางขึ้นดอกเบี้ยเพื่อกันเศรษฐกิจร้อนเกิน' },
      gov:{ en:'Tax receipts rise, so deficits shrink.', th:'รายได้ภาษีเพิ่ม ขาดดุลลดลง' } },
    { id:'recession', g:'growth', v:{ growth:-2, fear:1, rates:-1 },
      n:{ en:'Recession', th:'เศรษฐกิจถดถอย' },
      d:{ en:'Output and profits shrink. Investors flee to safe government bonds, so yields fall; stocks and oil usually drop.', th:'ผลผลิตและกำไรหดตัว นักลงทุนหนีไปพันธบัตรรัฐบาลที่ปลอดภัย ผลตอบแทนลด หุ้นและน้ำมันมักตก' },
      cb:{ en:'Cut rates; restart QE if needed.', th:'ลดดอกเบี้ย และเริ่ม QE ใหม่หากจำเป็น' },
      gov:{ en:'Stimulus spending or tax cuts, widening the deficit.', th:'อัดงบกระตุ้นหรือลดภาษี ทำให้ขาดดุลกว้างขึ้น' } },
    { id:'spend', g:'growth', v:{ growth:1, inflation:1 },
      n:{ en:'Consumer spending surges', th:'ผู้บริโภคใช้จ่ายพุ่ง' },
      d:{ en:'Households account for about two-thirds of US GDP, so strong spending lifts growth and prices together.', th:'ครัวเรือนคิดเป็นราวสองในสามของ GDP สหรัฐ การใช้จ่ายแรงจึงดันทั้งการเติบโตและราคา' },
      cb:{ en:'Watch inflation; hold or raise rates.', th:'จับตาเงินเฟ้อ คงหรือขึ้นดอกเบี้ย' },
      gov:{ en:'Collects more sales and income tax.', th:'จัดเก็บภาษีรายได้และภาษีการขายได้มากขึ้น' } },
    { id:'slump', g:'growth', v:{ growth:-1, inflation:-1 },
      n:{ en:'Spending slump', th:'การใช้จ่ายซบเซา' },
      d:{ en:'Weak demand slows both growth and prices, which tends to help bonds and cash.', th:'ความต้องการซื้อที่อ่อนทำให้ทั้งการเติบโตและราคาชะลอ มักเป็นผลดีต่อพันธบัตรและเงินสด' },
      cb:{ en:'Consider cutting rates.', th:'พิจารณาลดดอกเบี้ย' },
      gov:{ en:'Support demand with spending or tax relief.', th:'พยุงอุปสงค์ด้วยรายจ่ายหรือลดหย่อนภาษี' } },
    { id:'oil', g:'shock', v:{ energy:2, inflation:1 },
      n:{ en:'Energy shock', th:'วิกฤตพลังงาน' },
      d:{ en:'Oil jumps, raising costs across the economy. It is a supply problem, so rate hikes treat it poorly.', th:'น้ำมันพุ่ง ต้นทุนทั้งระบบเศรษฐกิจสูงขึ้น เป็นปัญหาด้านอุปทาน การขึ้นดอกเบี้ยจึงแก้ได้ไม่ตรงจุด' },
      cb:{ en:'Dilemma: hiking hurts growth; waiting lets inflation spread.', th:'ลำบากใจ: ขึ้นดอกเบี้ยก็ทำร้ายการเติบโต รอก็ปล่อยให้เงินเฟ้อลาม' },
      gov:{ en:'Release oil reserves, subsidise fuel, secure supply routes.', th:'ปล่อยน้ำมันสำรอง อุดหนุนเชื้อเพลิง รักษาเส้นทางขนส่ง' } },
    { id:'debt', g:'shock', v:{ debt:2, rates:1 },
      n:{ en:'Debt scare (yields up, dollar down)', th:'ตื่นกลัวหนี้ (ผลตอบแทนขึ้น ดอลลาร์ลง)' },
      d:{ en:'Lenders ask more to hold government debt. Yields and the dollar move in opposite directions, a sign the worry is about the debt itself.', th:'ผู้ให้กู้เรียกผลตอบแทนเพิ่มเพื่อถือหนี้รัฐบาล ผลตอบแทนกับดอลลาร์วิ่งสวนทางกัน เป็นสัญญาณว่าปัญหาอยู่ที่ตัวหนี้เอง' },
      cb:{ en:'Buy bonds to calm yields (risking inflation) or stay out of it.', th:'ซื้อพันธบัตรเพื่อสยบผลตอบแทน (เสี่ยงเงินเฟ้อ) หรือไม่ยุ่ง' },
      gov:{ en:'Credible plan to cut deficits; shift borrowing to shorter bonds; buy back old bonds.', th:'แผนลดขาดดุลที่น่าเชื่อถือ ย้ายการกู้ไปพันธบัตรสั้น และซื้อคืนพันธบัตรเก่า' } },
    { id:'panic', g:'shock', v:{ fear:2, liquidity:1 },
      n:{ en:'Market panic', th:'ตลาดตื่นตระหนก' },
      d:{ en:'Everyone sells what they can and runs to safety (cash dollars, government bonds, gold) until the central bank steps in.', th:'ทุกคนขายของที่ขายได้แล้ววิ่งหาที่ปลอดภัย (เงินสดดอลลาร์ พันธบัตรรัฐบาล ทองคำ) จนกว่าธนาคารกลางจะเข้าช่วย' },
      cb:{ en:'Emergency lending to banks, rate cuts, bond purchases.', th:'ปล่อยกู้ฉุกเฉินให้ธนาคาร ลดดอกเบี้ย ซื้อพันธบัตร' },
      gov:{ en:'Deposit guarantees and rescue packages.', th:'ค้ำประกันเงินฝากและมาตรการช่วยเหลือ' } },
    { id:'war', g:'shock', v:{ fear:1, energy:1 },
      n:{ en:'War escalates', th:'สงครามบานปลาย' },
      d:{ en:'Safety assets and energy gain while stocks and risky assets wobble.', th:'สินทรัพย์ปลอดภัยและพลังงานได้แรงหนุน ขณะที่หุ้นและสินทรัพย์เสี่ยงโยก' },
      cb:{ en:'Stand ready to provide liquidity.', th:'เตรียมพร้อมให้สภาพคล่อง' },
      gov:{ en:'Defence spending rises; energy security measures.', th:'รายจ่ายกลาโหมเพิ่ม มาตรการความมั่นคงด้านพลังงาน' } }
  ];
  var GROUPS = {
    cb:     { en:'Central bank moves', th:'การเคลื่อนไหวของธนาคารกลาง' },
    prices: { en:'Prices', th:'ราคาสินค้า' },
    money:  { en:'The dollar', th:'ค่าเงินดอลลาร์' },
    growth: { en:'Growth & spending', th:'การเติบโตและการใช้จ่าย' },
    shock:  { en:'Shocks & stress', th:'แรงช็อกและภาวะตึงเครียด' }
  };

  /* ------------------------------ page text ------------------------------ */
  var U = {
    eb:   { en:'Macro Lab', th:'แล็บเศรษฐกิจมหภาค' },
    h:    { en:'Understand the Macro Dials', th:'เข้าใจหน้าปัดเศรษฐกิจมหภาค' },
    lede: { en:'GDP, inflation, rates, yields, the dollar, spending, liquidity and debt: what each one is, who wins or loses when it moves, and what it tends to do to the dollar, stocks, bonds, gold, Bitcoin, oil and cash. Then play with it.',
            th:'GDP เงินเฟ้อ ดอกเบี้ย ผลตอบแทนพันธบัตร ดอลลาร์ การใช้จ่าย สภาพคล่อง และหนี้ แต่ละตัวคืออะไร ใครได้ใครเสียเมื่อมันขยับ และมักส่งผลอย่างไรต่อดอลลาร์ หุ้น พันธบัตร ทองคำ บิตคอยน์ น้ำมัน และเงินสด แล้วลองเล่นจำลองได้เลย' },
    hs: [ { n:8, en:'dials', th:'หน้าปัด' }, { n:6, en:'players', th:'ผู้เล่น' }, { n:8, en:'tools', th:'เครื่องมือ' }, { n:17, en:'scenarios', th:'สถานการณ์' } ],
    scroll:{ en:'Scroll', th:'เลื่อนลง' },
    up:   { en:'Goes up', th:'เมื่อสูงขึ้น' },
    down: { en:'Goes down', th:'เมื่อลดลง' },
    s1h:  { en:'The 8 dials of the economy', th:'8 หน้าปัดของเศรษฐกิจ' },
    s1p:  { en:'Every headline you read is about one of these. Tap a card to see what it means when it rises or falls.', th:'ข่าวเศรษฐกิจทุกข่าวพูดถึงหนึ่งในนี้ แตะการ์ดเพื่อดูความหมายเมื่อมันขึ้นหรือลง' },
    s2h:  { en:'Who is who: borrowers, lenders, savers', th:'ใครเป็นใคร: ผู้กู้ เจ้าหนี้ ผู้ออม' },
    s2p:  { en:'Every move in rates or prices helps one side and hurts the other.', th:'ทุกการขยับของดอกเบี้ยหรือราคาสินค้า มีคนได้และมีคนเสียเสมอ' },
    does: { en:'What they do', th:'ทำอะไร' }, gain: { en:'Gains when', th:'ได้เมื่อ' }, hurt: { en:'Hurt when', th:'เสียเมื่อ' },
    s3h:  { en:'Yield and price: the see-saw', th:'ผลตอบแทนกับราคา: กระดานหก' },
    s3p:  { en:'When a bond’s yield rises, its price falls, and the other way round. Drag the sliders to see a 10-year bond with a 4% coupon, and what is left after inflation (the real yield).', th:'เมื่อผลตอบแทนพันธบัตรขึ้น ราคาจะลง และกลับกัน ลากแถบเพื่อดูพันธบัตรอายุ 10 ปีที่จ่ายคูปอง 4% และดูว่าเหลืออะไรหลังหักเงินเฟ้อ (ผลตอบแทนแท้จริง)' },
    yld:  { en:'Bond yield', th:'ผลตอบแทนพันธบัตร' }, infl:{ en:'Inflation', th:'เงินเฟ้อ' }, price:{ en:'Bond price', th:'ราคาพันธบัตร' }, real:{ en:'Real yield', th:'ผลตอบแทนแท้จริง' },
    par:  { en:'Face value 100', th:'มูลค่าหน้าตั๋ว 100' },
    realPos: { en:'Positive real yield: lenders and savers beat inflation. Gold, which pays nothing, is less attractive.', th:'ผลตอบแทนแท้จริงเป็นบวก: เจ้าหนี้และผู้ออมชนะเงินเฟ้อ ทองคำที่ไม่จ่ายอะไรจึงน่าสนใจน้อยลง' },
    realNeg: { en:'Negative real yield: lenders and savers lose buying power. This is when gold and scarce assets tend to shine.', th:'ผลตอบแทนแท้จริงติดลบ: เจ้าหนี้และผู้ออมสูญเสียอำนาจซื้อ ช่วงนี้ทองคำและสินทรัพย์หายากมักโดดเด่น' },
    realZero:{ en:'Real yield near zero: savers just keep pace with prices.', th:'ผลตอบแทนแท้จริงใกล้ศูนย์: ผู้ออมแค่ตามราคาสินค้าทัน' },
    s4h:  { en:'The yield curve: 2, 5, 10, 20, 30 years', th:'เส้นผลตอบแทน: 2, 5, 10, 20, 30 ปี' },
    s4p:  { en:'Lending to the government for different lengths pays different yields. The shape of the line is a read on growth and trust. Tap a shape.', th:'การให้รัฐบาลกู้ยืมระยะเวลาต่างกันได้ผลตอบแทนต่างกัน รูปร่างของเส้นบอกทั้งการเติบโตและความเชื่อมั่น แตะเลือกรูปร่าง' },
    cNormal:{ en:'Normal', th:'ปกติ' }, cFlat:{ en:'Flat', th:'แบน' }, cInv:{ en:'Inverted', th:'กลับหัว' },
    cNormalD:{ en:'Longer loans pay more. Markets expect steady growth and some inflation.', th:'ยิ่งกู้นานยิ่งได้มาก ตลาดคาดการเติบโตคงที่และเงินเฟ้อเล็กน้อย' },
    cFlatD:{ en:'Little extra for lending longer. Markets are unsure where the economy is heading.', th:'กู้นานขึ้นได้เพิ่มน้อยมาก ตลาดไม่แน่ใจทิศทางเศรษฐกิจ' },
    cInvD:{ en:'Short rates above long rates. Historically this often came before slowdowns, though not every time.', th:'ดอกเบี้ยสั้นสูงกว่ายาว ในอดีตมักมาก่อนเศรษฐกิจชะลอ แต่ไม่ใช่ทุกครั้ง' },
    cNote:{ en:'Schematic shapes. In August 2026 the 30-year yield reached about 5.3%, its highest since 2007, and the 10-year was about 4.65% (as reported).', th:'เป็นรูปร่างเชิงแผนภาพ ในเดือนสิงหาคม 2026 ผลตอบแทน 30 ปีแตะราว 5.3% สูงสุดตั้งแต่ปี 2007 และ 10 ปีอยู่ราว 4.65% (ตามที่รายงาน)' },
    s5h:  { en:'The dollar index and why gold often moves the other way', th:'ดัชนีดอลลาร์ และทำไมทองคำมักวิ่งสวนทาง' },
    s5p:  { en:'DXY measures the dollar against six currencies. Slide to make the dollar stronger or weaker and see who feels it.', th:'DXY วัดค่าดอลลาร์เทียบสกุลเงินหลัก 6 สกุล เลื่อนเพื่อให้ดอลลาร์แข็งหรืออ่อน แล้วดูว่าใครได้รับผลกระทบ' },
    basket:{ en:'DXY basket weights', th:'สัดส่วนตะกร้า DXY' },
    dWeak:{ en:'Weaker dollar', th:'ดอลลาร์อ่อน' }, dStrong:{ en:'Stronger dollar', th:'ดอลลาร์แข็ง' },
    dRows: [
      { k:{ en:'Gold and commodities', th:'ทองคำและสินค้าโภคภัณฑ์' }, c:-0.8, why:{ en:'priced in dollars: dearer for everyone else', th:'ตีราคาเป็นดอลลาร์ จึงแพงขึ้นสำหรับคนอื่น' } },
      { k:{ en:'US exporters’ sales abroad', th:'ยอดขายต่างประเทศของผู้ส่งออกสหรัฐ' }, c:-0.7, why:{ en:'their goods cost more to foreigners', th:'สินค้าแพงขึ้นสำหรับต่างชาติ' } },
      { k:{ en:'Emerging markets with dollar debt', th:'ตลาดเกิดใหม่ที่มีหนี้ดอลลาร์' }, c:-0.9, why:{ en:'repaying dollars costs more local currency', th:'ต้องใช้เงินท้องถิ่นมากขึ้นเพื่อใช้หนี้ดอลลาร์' } },
      { k:{ en:'US import prices', th:'ราคานำเข้าของสหรัฐ' }, c:0.8, why:{ en:'foreign goods get cheaper for Americans', th:'ของต่างประเทศถูกลงสำหรับคนอเมริกัน' } }
    ],
    dNote:{ en:'In a real panic, gold and the dollar can both rise together. The see-saw is a tendency, not a law.', th:'ในภาวะตื่นตระหนกจริง ทองคำและดอลลาร์อาจขึ้นพร้อมกันได้ กระดานหกนี้เป็นแนวโน้ม ไม่ใช่กฎตายตัว' },
    s6h:  { en:'What central banks and treasuries can do', th:'ธนาคารกลางและกระทรวงการคลังทำอะไรได้บ้าง' },
    s6p:  { en:'Eight tools, and which dial each one moves.', th:'เครื่องมือ 8 อย่าง และแต่ละอย่างขยับหน้าปัดไหน' },
    moves:{ en:'Moves', th:'ขยับ' },
    s7h:  { en:'Simulator: turn the dials yourself', th:'เครื่องจำลอง: หมุนหน้าปัดเอง' },
    s7p:  { en:'Pick a scenario or drag the sliders. The bars show the typical direction and strength for each asset. This is a teaching model, not a forecast.', th:'เลือกสถานการณ์หรือลากแถบ แท่งแสดงทิศทางและความแรงโดยทั่วไปของแต่ละสินทรัพย์ เป็นโมเดลเพื่อการเรียนรู้ ไม่ใช่คำพยากรณ์' },
    presets:{ en:'Scenarios', th:'สถานการณ์' }, reset:{ en:'Reset', th:'รีเซ็ต' }, today:{ en:'Load a reading of today', th:'โหลดภาพรวมวันนี้' },
    todayN:{ en:'One reading of Aug–Sep 2026: rates up, inflation and energy up, debt worry up, dollar softer. Not a forecast.', th:'การอ่านภาพรวมช่วงส.ค.–ก.ย. 2026: ดอกเบี้ยขึ้น เงินเฟ้อและพลังงานสูง กังวลหนี้เพิ่ม ดอลลาร์อ่อนลง ไม่ใช่คำพยากรณ์' },
    out:  { en:'What it tends to do', th:'แนวโน้มที่มักเกิดขึ้น' },
    winners:{ en:'Who gains, who loses', th:'ใครได้ ใครเสีย' },
    wBorrow:{ en:'Borrowers (fixed-rate debt)', th:'ผู้กู้ (หนี้ดอกเบี้ยคงที่)' }, wSaver:{ en:'Savers (cash)', th:'ผู้ออม (เงินสด)' }, wLender:{ en:'Bond lenders', th:'เจ้าหนี้พันธบัตร' },
    best:{ en:'Biggest tailwind', th:'แรงหนุนมากสุด' }, worst:{ en:'Biggest headwind', th:'แรงต้านมากสุด' }, flat:{ en:'Nothing is moving: set a dial.', th:'ยังไม่มีอะไรขยับ ลองปรับแถบ' },
    s8h:  { en:'The heat map: scenario by asset', th:'ฮีตแมป: สถานการณ์ × สินทรัพย์' },
    s8p:  { en:'Green is a typical tailwind, red a typical headwind, grey little effect. Tap a row to load it into the simulator and read why.', th:'เขียวคือแรงหนุนโดยทั่วไป แดงคือแรงต้าน เทาคือแทบไม่กระทบ แตะแถวเพื่อโหลดเข้าเครื่องจำลองและอ่านเหตุผล' },
    legend:{ en:'Headwind', th:'แรงต้าน' }, legend2:{ en:'Tailwind', th:'แรงหนุน' },
    scen:{ en:'Scenario', th:'สถานการณ์' },
    why:{ en:'Why', th:'เหตุผล' }, cbCan:{ en:'Central bank can', th:'ธนาคารกลางทำได้' }, govCan:{ en:'Government can', th:'รัฐบาลทำได้' },
    s9h:  { en:'Put it to work on the news', th:'เอาไปอ่านข่าวจริง' },
    s9p:  { en:'The Macro Story page walks through a real 2026 example: yields rising while the dollar falls, a rate hike during an energy shock, a bond buyback and creditors stepping back. It is exactly the “Debt scare” row above.', th:'หน้า กับดักหนี้สหรัฐ เล่าตัวอย่างจริงปี 2026: ผลตอบแทนขึ้นแต่ดอลลาร์ลง เฟดขึ้นดอกเบี้ยท่ามกลางวิกฤตพลังงาน การซื้อคืนพันธบัตร และเจ้าหนี้ที่ถอยออก ซึ่งตรงกับแถว “ตื่นกลัวหนี้” ด้านบนพอดี' },
    openStory:{ en:'Open the Macro Story', th:'เปิดหน้า กับดักหนี้สหรัฐ' },
    disc: { en:'Educational model only. Effects are rule-of-thumb tendencies, and real markets often do the opposite, at different speeds, or both at once. Not investment advice and not a forecast.', th:'โมเดลเพื่อการศึกษาเท่านั้น ผลกระทบเป็นแนวโน้มตามหลักคร่าวๆ ตลาดจริงมักทำตรงข้าม ช้าเร็วต่างกัน หรือเกิดพร้อมกันหลายแบบ ไม่ใช่คำแนะนำการลงทุนและไม่ใช่คำพยากรณ์' },
    strong2:{ en:'strong', th:'แรง' }, mild:{ en:'mild', th:'เบา' }, mixed:{ en:'little effect', th:'แทบไม่กระทบ' }, tail:{ en:'tailwind', th:'แรงหนุน' }, head:{ en:'headwind', th:'แรงต้าน' }
  };

  var DIALS = [
    { k:'gdp', n:{ en:'GDP', th:'GDP' },
      w:{ en:'The total value of everything a country produces in a period.', th:'มูลค่ารวมของสิ่งที่ประเทศผลิตได้ในช่วงเวลาหนึ่ง' },
      u:{ en:'The economy is growing: more jobs and profits.', th:'เศรษฐกิจโต: งานและกำไรเพิ่ม' },
      d:{ en:'It shrinks. Two quarters in a row is the common rule of thumb for a recession.', th:'เศรษฐกิจหด สองไตรมาสติดกันคือหลักคร่าวๆ ของภาวะถดถอย' } },
    { k:'inf', n:{ en:'Inflation (CPI)', th:'เงินเฟ้อ (CPI)' },
      w:{ en:'How fast average prices rise. The Fed aims for about 2% a year.', th:'ราคาสินค้าโดยเฉลี่ยขึ้นเร็วแค่ไหน เฟดตั้งเป้าราว 2% ต่อปี' },
      u:{ en:'Money buys less. Central banks usually answer with higher rates.', th:'เงินซื้อของได้น้อยลง ธนาคารกลางมักตอบด้วยการขึ้นดอกเบี้ย' },
      d:{ en:'Prices cool. Prices that keep falling (deflation) are a warning sign.', th:'ราคาชะลอ ราคาที่ลดลงต่อเนื่อง (เงินฝืด) เป็นสัญญาณเตือน' } },
    { k:'rate', n:{ en:'Interest rate', th:'อัตราดอกเบี้ย' },
      w:{ en:'The central bank’s price of money. It sets borrowing costs across the economy.', th:'ราคาของเงินที่ธนาคารกลางกำหนด เป็นฐานต้นทุนการกู้ทั้งระบบ' },
      u:{ en:'Loans cost more, spending slows, saving pays more.', th:'กู้แพงขึ้น การใช้จ่ายชะลอ การออมได้มากขึ้น' },
      d:{ en:'Loans get cheaper, spending and risk-taking rise.', th:'กู้ถูกลง การใช้จ่ายและการเสี่ยงเพิ่ม' } },
    { k:'yield', n:{ en:'Bond yield', th:'ผลตอบแทนพันธบัตร' },
      w:{ en:'What you earn for lending to the government. 2, 5, 10, 20 and 30 years are different loan lengths.', th:'สิ่งที่ได้เมื่อให้รัฐบาลกู้ ระยะ 2, 5, 10, 20 และ 30 ปีคือระยะเวลากู้ที่ต่างกัน' },
      u:{ en:'Government borrowing gets dearer and existing bonds lose price.', th:'รัฐบาลกู้แพงขึ้น และพันธบัตรเดิมราคาตก' },
      d:{ en:'Borrowing gets cheaper and existing bonds gain price.', th:'กู้ถูกลง และพันธบัตรเดิมราคาขึ้น' } },
    { k:'usd', n:{ en:'Dollar index (DXY)', th:'ดัชนีดอลลาร์ (DXY)' },
      w:{ en:'The dollar measured against a basket of six major currencies.', th:'ค่าดอลลาร์เทียบกับตะกร้าสกุลเงินหลัก 6 สกุล' },
      u:{ en:'Dollar stronger: imports are cheap, but exporters and dollar-debt countries feel the squeeze.', th:'ดอลลาร์แข็ง: นำเข้าถูก แต่ผู้ส่งออกและประเทศที่มีหนี้ดอลลาร์ถูกบีบ' },
      d:{ en:'Dollar weaker: gold, commodities and foreign earnings of US firms often benefit.', th:'ดอลลาร์อ่อน: ทองคำ สินค้าโภคภัณฑ์ และรายได้ต่างประเทศของบริษัทสหรัฐมักได้ประโยชน์' } },
    { k:'spend', n:{ en:'Spending', th:'การใช้จ่าย' },
      w:{ en:'What households and firms buy. In the US, consumers are roughly two-thirds of GDP.', th:'สิ่งที่ครัวเรือนและบริษัทซื้อ ในสหรัฐผู้บริโภคคิดเป็นราวสองในสามของ GDP' },
      u:{ en:'Demand is strong and can push prices up.', th:'ความต้องการแรง และอาจดันราคาขึ้น' },
      d:{ en:'Demand is weak and growth and jobs are at risk.', th:'ความต้องการอ่อน การเติบโตและงานเสี่ยง' } },
    { k:'liq', n:{ en:'Liquidity', th:'สภาพคล่อง' },
      w:{ en:'How much easy money is around: the central bank’s balance sheet, bank lending, money supply.', th:'ปริมาณเงินที่หมุนเวียนง่าย: งบดุลธนาคารกลาง สินเชื่อธนาคาร ปริมาณเงิน' },
      u:{ en:'Easy money lifts most asset prices and can feed inflation.', th:'เงินง่ายดันราคาสินทรัพย์ส่วนใหญ่ และอาจเติมเชื้อเงินเฟ้อ' },
      d:{ en:'Tight money: risky assets and borrowers feel it first.', th:'เงินตึง: สินทรัพย์เสี่ยงและผู้กู้รู้สึกก่อน' } },
    { k:'debt', n:{ en:'Government debt', th:'หนี้รัฐบาล' },
      w:{ en:'What the state owes. The deficit is the yearly shortfall that adds to it.', th:'สิ่งที่รัฐเป็นหนี้ ส่วนขาดดุลคือยอดขาดในแต่ละปีที่ทำให้หนี้เพิ่ม' },
      u:{ en:'More bonds to sell, a bigger interest bill, and trust starts to matter.', th:'ต้องขายพันธบัตรมากขึ้น ภาระดอกเบี้ยโต และความเชื่อมั่นเริ่มสำคัญ' },
      d:{ en:'A surplus or growth outpacing debt eases the pressure.', th:'งบเกินดุลหรือเศรษฐกิจโตเร็วกว่าหนี้ ช่วยลดแรงกดดัน' } }
  ];

  var ROLES = [
    { k:'borrower', c:'#4f9bff', n:{ en:'Borrower', th:'ผู้กู้' },
      does:{ en:'Takes a loan: a home buyer, a company, or the government itself.', th:'ขอกู้เงิน: คนซื้อบ้าน บริษัท หรือรัฐบาลเอง' },
      gain:{ en:'Inflation rises while the loan rate is fixed, or rates fall.', th:'เงินเฟ้อสูงขึ้นขณะดอกเบี้ยคงที่ หรือดอกเบี้ยลดลง' },
      hurt:{ en:'Rates rise on floating loans, or income falls.', th:'ดอกเบี้ยขึ้นในหนี้ลอยตัว หรือรายได้ลดลง' } },
    { k:'lender', c:'#ffb347', n:{ en:'Lender / bondholder', th:'เจ้าหนี้ / ผู้ถือพันธบัตร' },
      does:{ en:'Lends money and collects interest. Includes anyone holding government bonds, and countries such as Japan.', th:'ให้กู้และรับดอกเบี้ย รวมถึงผู้ถือพันธบัตรรัฐบาลและประเทศอย่างญี่ปุ่น' },
      gain:{ en:'New bonds pay more, inflation stays low, borrowers pay on time.', th:'พันธบัตรใหม่จ่ายสูงขึ้น เงินเฟ้อต่ำ ผู้กู้จ่ายตรงเวลา' },
      hurt:{ en:'Inflation outruns the interest, rates jump after they lend, or the borrower cannot pay.', th:'เงินเฟ้อวิ่งแซงดอกเบี้ย ดอกเบี้ยพุ่งหลังปล่อยกู้ หรือผู้กู้จ่ายไม่ไหว' } },
    { k:'saver', c:'#7fd39c', n:{ en:'Saver', th:'ผู้ออม' },
      does:{ en:'Keeps money in deposits, cash or money-market funds.', th:'เก็บเงินในเงินฝาก เงินสด หรือกองทุนตลาดเงิน' },
      gain:{ en:'Interest above inflation.', th:'ดอกเบี้ยสูงกว่าเงินเฟ้อ' },
      hurt:{ en:'Inflation above interest: the money buys less each year.', th:'เงินเฟ้อสูงกว่าดอกเบี้ย: เงินซื้อของได้น้อยลงทุกปี' } },
    { k:'cb', c:'#b58cff', n:{ en:'Central bank', th:'ธนาคารกลาง' },
      does:{ en:'Sets the policy rate, runs QE or QT, and lends to banks in a crisis. Goal: stable prices and jobs.', th:'กำหนดดอกเบี้ยนโยบาย ทำ QE หรือ QT และให้ธนาคารกู้ยามวิกฤต เป้าหมาย: ราคาคงที่และการจ้างงาน' },
      gain:{ en:'Inflation near target and a steady economy.', th:'เงินเฟ้อใกล้เป้าและเศรษฐกิจนิ่ง' },
      hurt:{ en:'Supply shocks. It cannot reopen an oil route or fix a budget.', th:'แรงช็อกด้านอุปทาน เปิดเส้นทางน้ำมันหรือแก้งบประมาณเองไม่ได้' } },
    { k:'treasury', c:'#00e5ff', n:{ en:'Treasury / government', th:'กระทรวงการคลัง / รัฐบาล' },
      does:{ en:'Spends, taxes and sells bonds to cover the gap. It cannot set interest rates directly.', th:'ใช้จ่าย เก็บภาษี และขายพันธบัตรชดเชยส่วนขาด ตั้งดอกเบี้ยเองโดยตรงไม่ได้' },
      gain:{ en:'Cheap funding and trusting lenders.', th:'ระดมทุนได้ถูกและผู้ให้กู้เชื่อมั่น' },
      hurt:{ en:'Rising rates make the interest bill bigger; lenders step back.', th:'ดอกเบี้ยขึ้นทำให้ภาระดอกเบี้ยโต เจ้าหนี้ถอย' } },
    { k:'bank', c:'#ff7a8a', n:{ en:'Commercial bank', th:'ธนาคารพาณิชย์' },
      does:{ en:'Takes deposits and lends them out, earning the difference.', th:'รับเงินฝากแล้วปล่อยกู้ ได้กำไรจากส่วนต่าง' },
      gain:{ en:'Healthy loan demand and steady rates.', th:'ความต้องการสินเชื่อดีและดอกเบี้ยนิ่ง' },
      hurt:{ en:'Rates jump fast: losses on bonds they hold, and loans go bad.', th:'ดอกเบี้ยกระโดดเร็ว: ขาดทุนจากพันธบัตรที่ถือ และหนี้เสียเพิ่ม' } }
  ];

  var TOOLS = [
    { k:'policy', i:'rate', n:{ en:'Policy interest rate', th:'ดอกเบี้ยนโยบาย' }, w:{ en:'Raise it to cool prices, cut it to support growth.', th:'ขึ้นเพื่อชะลอราคา ลดเพื่อหนุนการเติบโต' }, m:['rates'] },
    { k:'qe', i:'liq', n:{ en:'QE and QT', th:'QE และ QT' }, w:{ en:'Buy bonds to add money, or let them run off to drain it.', th:'ซื้อพันธบัตรเพื่อเพิ่มเงิน หรือปล่อยให้ครบกำหนดเพื่อดูดเงิน' }, m:['liquidity', 'rates'] },
    { k:'buyback', i:'swap', n:{ en:'Bond buyback / maturity swap', th:'ซื้อคืนพันธบัตร / สลับอายุ' }, w:{ en:'The Treasury buys old bonds and issues new ones. It changes the mix of maturities, not the total debt.', th:'คลังซื้อพันธบัตรเก่าและออกใหม่ เปลี่ยนสัดส่วนอายุหนี้ ไม่ได้ลดหนี้รวม' }, m:['debt', 'rates'] },
    { k:'ycc', i:'yield', n:{ en:'Yield curve control', th:'คุมเส้นผลตอบแทน' }, w:{ en:'Promise to buy as many bonds as needed to hold yields at a target. Japan has used it.', th:'สัญญาว่าจะซื้อพันธบัตรเท่าที่จำเป็นเพื่อตรึงผลตอบแทนที่เป้า ญี่ปุ่นเคยใช้' }, m:['rates', 'liquidity', 'inflation'] },
    { k:'fx', i:'usd', n:{ en:'Currency intervention', th:'แทรกแซงค่าเงิน' }, w:{ en:'Sell foreign reserves (often dollars) to prop up your own currency, as Japan did for the yen in 2026.', th:'ขายทุนสำรองต่างประเทศ (มักเป็นดอลลาร์) เพื่อพยุงเงินตัวเอง เหมือนที่ญี่ปุ่นทำกับเยนในปี 2026' }, m:['dollar'] },
    { k:'fiscal', i:'treasury', n:{ en:'Taxes and spending', th:'ภาษีและรายจ่าย' }, w:{ en:'Cut spending or raise taxes to shrink the deficit, or spend more to support growth.', th:'ลดรายจ่ายหรือเพิ่มภาษีเพื่อลดขาดดุล หรืออัดงบเพื่อพยุงการเติบโต' }, m:['debt', 'growth', 'inflation'] },
    { k:'guide', i:'arrow', n:{ en:'Forward guidance', th:'การส่งสัญญาณล่วงหน้า' }, w:{ en:'Tell markets the likely path so prices adjust early.', th:'บอกตลาดล่วงหน้าถึงทิศทางที่น่าจะเป็น เพื่อให้ราคาปรับตัวก่อน' }, m:['rates', 'fear'] },
    { k:'lend', i:'plus', n:{ en:'Emergency lending', th:'ปล่อยกู้ฉุกเฉิน' }, w:{ en:'Lend to banks in a crisis so a run on deposits does not spread.', th:'ปล่อยกู้ให้ธนาคารยามวิกฤต เพื่อไม่ให้การแห่ถอนเงินลุกลาม' }, m:['fear', 'liquidity'] }
  ];

  var BASKET = [
    { k:'EUR', w:57.6, c:'#4f9bff' }, { k:'JPY', w:13.6, c:'#ff7a8a' }, { k:'GBP', w:11.9, c:'#b58cff' },
    { k:'CAD', w:9.1, c:'#ffb347' }, { k:'SEK', w:4.2, c:'#00e5ff' }, { k:'CHF', w:3.6, c:'#7fd39c' }
  ];

  var TODAY = { rates:1, inflation:1, energy:1, debt:1, dollar:-1 };

  /* -------------------------------- icons -------------------------------- */
  var ICO = {
    gdp:'<path d="M4 20V12M10 20V8M16 20V4M2 20h20"/>',
    inf:'<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="16" cy="8" r="1.4"/>',
    rate:'<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M19 5L5 19"/>',
    yield:'<path d="M3 19C8 19 9 8 14 8s5 4 7 4M3 21h18"/>',
    usd:'<circle cx="12" cy="12" r="9"/><path d="M14.6 9.2c-.5-1-1.5-1.6-2.7-1.6-1.6 0-2.8.9-2.8 2.2 0 3 5.8 1.6 5.8 4.6 0 1.3-1.2 2.2-2.9 2.2-1.3 0-2.4-.6-3-1.7M12 5.5v13"/>',
    spend:'<path d="M3 4h3l2.2 10h9.6L20 7H7"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    liq:'<path d="M12 3C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-11z"/>',
    debt:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    borrower:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>',
    lender:'<path d="M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>',
    saver:'<path d="M7 4h10M8 4v3c-2 1-3 3-3 6v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5c0-3-1-5-3-6V4"/><path d="M9 14h6"/>',
    cb:'<circle cx="12" cy="12" r="9"/><path d="M12 12l4.5-4.5M12 5v1.5M5 12h1.5M19 12h-1.5"/>',
    treasury:'<path d="M4 20h16M6 20V10l6-6 6 6v10M10 20v-5h4v5"/>',
    bank:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18M7 15h4"/>',
    swap:'<path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M18 3v4h-4M6 21v-4h4"/>',
    arrow:'<path d="M3 12h14M13 6l6 6-6 6"/>',
    plus:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>'
  };
  function ic(k, cls){ return '<svg class="' + (cls || 'ml-ic') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[k] || '') + '</svg>'; }

  /* ------------------------------- styles -------------------------------- */
  var CSS = '' +
  '#macrolab{position:relative;}' +
  '#macrolab>.ewv-wrap{position:relative;z-index:1;}' +
  '.ml-sky{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;}' +
  '.ml-sky i{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 90px 120px,#bfeaff,transparent),radial-gradient(1.6px 1.6px at 160px 60px,#fff,transparent),radial-gradient(1px 1px at 230px 180px,#ffe9a8,transparent),radial-gradient(1px 1px at 40px 190px,#fff,transparent);background-size:260px 220px;opacity:.5;animation:mlTw 5s ease-in-out infinite alternate;}' +
  '.ml-sky i:nth-child(2){background-size:350px 310px;background-position:70px 90px;animation-duration:8s;opacity:.35;}' +
  '.ml-wrap{max-width:1080px;margin:0 auto;padding-bottom:60px;}' +
  '.ml-hero{position:relative;overflow:hidden;border-radius:calc(var(--radius) + 6px);border:1px solid color-mix(in srgb,var(--neon) 28%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--neon) 8%,transparent),rgba(10,11,18,.78) 70%);padding:26px 22px 0;margin:6px 0 10px;}' +
  '.ml-hstats{display:flex;flex-wrap:wrap;gap:12px 34px;position:relative;z-index:1;}' +
  '.ml-hstats div{font-family:var(--mono);font-size:11.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--grey);}' +
  '.ml-hstats b{display:block;font-size:34px;line-height:1.1;color:var(--neon);text-shadow:0 0 18px color-mix(in srgb,var(--neon) 50%,transparent);}' +
  '.ml-waves{position:relative;height:84px;margin:6px -22px 0;overflow:hidden;}' +
  '.ml-waves svg{position:absolute;left:0;bottom:0;width:200%;height:100%;animation:mlFlow 14s linear infinite;}' +
  '.ml-waves svg:nth-child(2){animation-duration:20s;animation-direction:reverse;opacity:.6;height:80%;}' +
  '.ml-waves svg:nth-child(3){animation-duration:30s;opacity:.35;height:60%;}' +
  '.ml-cue{display:flex;flex-direction:column;align-items:center;gap:6px;margin:22px 0 4px;color:var(--grey);font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;}' +
  '.ml-cue svg{width:22px;height:30px;stroke:var(--neon);fill:none;stroke-width:1.8;stroke-linecap:round;animation:mlBounce 1.8s ease-in-out infinite;}' +
  '.ml-sec{position:relative;margin:54px 0;padding:26px 22px 24px;border-radius:calc(var(--radius) + 4px);border:1px solid var(--border-dim);background:rgba(10,11,18,.7);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);box-shadow:0 14px 50px rgba(0,0,0,.4);}' +
  '.ml-num{position:absolute;top:-18px;left:20px;display:inline-flex;align-items:center;padding:5px;border-radius:999px;background:#0b0c12;border:1px solid color-mix(in srgb,var(--neon) 55%,transparent);box-shadow:0 0 16px color-mix(in srgb,var(--neon) 25%,transparent);}' +
  '.ml-num em{font-style:normal;font-family:var(--mono);font-size:12px;font-weight:700;color:var(--neon);display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:color-mix(in srgb,var(--neon) 20%,transparent);}' +
  '.ml-sec h3{margin:6px 0 8px;font-size:23px;line-height:1.35;color:var(--white);}' +
  '.ml-sec>p{margin:0 0 18px;color:#b6bbb0;font-size:15.5px;line-height:1.85;}' +
  '.ml-note{color:var(--grey);font-size:12.5px;line-height:1.7;margin:12px 0 0;}' +
  '.ml-rv{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s);}' +
  '.ml-rv.in{opacity:1;transform:none;}' +
  '.ml-ic{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}' +
  '.ml-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(235px,1fr));gap:14px;}' +
  '.ml-card{position:relative;padding:16px 16px 14px;border-radius:16px;border:1px solid var(--border-dim);background:rgba(255,255,255,.028);transition:transform .25s,border-color .25s,box-shadow .25s;--c:var(--neon);}' +
  '.ml-card:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--c) 60%,transparent);box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 24px color-mix(in srgb,var(--c) 14%,transparent);}' +
  '.ml-card h4{margin:0 0 6px;display:flex;align-items:center;gap:10px;font-size:16px;color:var(--white);}' +
  '.ml-card h4 .ml-ic{color:var(--c);padding:5px;width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--c) 14%,transparent);}' +
  '.ml-card p{margin:0 0 8px;color:#b6bbb0;font-size:13.5px;line-height:1.65;}' +
  '.ml-ud{display:flex;gap:9px;margin-top:8px;font-size:12.8px;line-height:1.55;color:#a5aaa0;}' +
  '.ml-ud b{flex:0 0 74px;font-family:var(--mono);font-size:10.5px;letter-spacing:.8px;text-transform:uppercase;font-weight:600;}' +
  '.ml-ud.u b{color:#7fd39c;} .ml-ud.d b{color:#ff8a98;}' +
  '.ml-ud svg{width:12px;height:12px;vertical-align:-1px;margin-right:4px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;}' +
  '.ml-role .ml-ud b{flex-basis:78px;}' +
  '.ml-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;align-items:center;}' +
  '.ml-tags span{font-family:var(--mono);font-size:10.5px;letter-spacing:.6px;padding:3px 9px;border-radius:999px;border:1px solid var(--border);color:var(--neon);}' +
  '.ml-tags em{font-style:normal;font-family:var(--mono);font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:var(--grey);}' +
  '.ml-ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px 26px;margin:6px 0 14px;}' +
  '.ml-sl label{display:flex;justify-content:space-between;font-family:var(--mono);font-size:12px;letter-spacing:.8px;text-transform:uppercase;color:var(--grey);margin-bottom:6px;}' +
  '.ml-sl label b{color:var(--neon);font-size:14px;}' +
  '.ml-sl input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:99px;background:linear-gradient(90deg,#ff3b4e,rgba(255,255,255,.14) 50%,#7fd39c);outline:none;cursor:pointer;}' +
  '.ml-sl.one input[type=range]{background:linear-gradient(90deg,var(--neon),#00e5ff);}' +
  '.ml-sl input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid var(--neon);box-shadow:0 0 14px color-mix(in srgb,var(--neon) 70%,transparent);cursor:grab;}' +
  '.ml-sl input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid var(--neon);box-shadow:0 0 14px color-mix(in srgb,var(--neon) 70%,transparent);cursor:grab;}' +
  '.ml-ends{display:flex;justify-content:space-between;font-size:11px;color:var(--grey-dim);margin-top:4px;}' +
  '.ml-seesaw{width:100%;max-width:560px;margin:4px auto 0;display:block;overflow:visible;}' +
  '.ml-seesaw .beam{transition:transform .5s cubic-bezier(.3,.7,.2,1);transform-origin:280px 118px;}' +
  '.ml-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:8px 0 6px;}' +
  '.ml-kpi{padding:12px 14px;border-radius:12px;border:1px solid var(--border-dim);background:rgba(255,255,255,.03);}' +
  '.ml-kpi b{display:block;font-family:var(--mono);font-size:24px;color:var(--white);transition:color .3s;}' +
  '.ml-kpi span{font-size:11.5px;color:var(--grey);text-transform:uppercase;letter-spacing:1px;font-family:var(--mono);}' +
  '.ml-kpi.pos b{color:#7fd39c;} .ml-kpi.neg b{color:#ff8a98;}' +
  '.ml-callout{margin:12px 0 0;padding:12px 14px;border-radius:12px;border:1px solid color-mix(in srgb,var(--neon) 35%,transparent);background:color-mix(in srgb,var(--neon) 6%,transparent);font-size:14px;line-height:1.7;color:#cfd5c6;}' +
  '.ml-seg{display:inline-flex;gap:4px;padding:4px;border-radius:999px;border:1px solid var(--border-dim);background:rgba(10,11,18,.7);margin-bottom:12px;flex-wrap:wrap;}' +
  '.ml-seg button{font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:9px 18px;border-radius:999px;border:1px solid transparent;background:transparent;color:var(--grey);cursor:pointer;transition:all .2s;}' +
  '.ml-seg button:hover{color:var(--white);background:rgba(255,255,255,.05);}' +
  '.ml-seg button.on{color:var(--neon);border-color:color-mix(in srgb,var(--neon) 65%,transparent);background:color-mix(in srgb,var(--neon) 14%,transparent);box-shadow:0 0 16px color-mix(in srgb,var(--neon) 28%,transparent);}' +
  '.ml-curve{width:100%;max-width:640px;display:block;overflow:visible;}' +
  '.ml-curve .ln{fill:none;stroke:url(#mlcg);stroke-width:3.4;stroke-linecap:round;filter:drop-shadow(0 0 6px rgba(0,229,255,.55));}' +
  '.ml-curve .ar{fill:url(#mlca);stroke:none;}' +
  '.ml-curve text{fill:var(--grey);font-size:12px;font-family:var(--mono);text-anchor:middle;}' +
  '.ml-curve .vv{fill:var(--white);font-size:12px;}' +
  '.ml-curve .dot{fill:#0b0c12;stroke:var(--neon);stroke-width:2.4;}' +
  '.ml-curve .gl{stroke:rgba(255,255,255,.08);stroke-width:1;}' +
  '.ml-split{display:grid;grid-template-columns:minmax(230px,300px) 1fr;gap:26px;align-items:center;}' +
  '.ml-donut{width:100%;max-width:280px;margin:0 auto;display:block;overflow:visible;}' +
  '.ml-donut circle.seg{fill:none;stroke-width:26;transform:rotate(-90deg);transform-origin:center;stroke-dasharray:0 1000;transition:stroke-dasharray 1.4s cubic-bezier(.2,.7,.2,1) var(--dl);}' +
  '.in .ml-donut circle.seg{stroke-dasharray:var(--da) 1000;}' +
  '.ml-leg{display:flex;flex-wrap:wrap;gap:6px 14px;margin:12px 0 0;font-family:var(--mono);font-size:12px;color:var(--grey);}' +
  '.ml-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;}' +
  '.ml-eff{display:flex;flex-direction:column;gap:9px;margin-top:12px;}' +
  '.ml-eff div{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid var(--border-dim);}' +
  '.ml-eff .ar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--mono);font-weight:800;font-size:15px;transition:all .3s;}' +
  '.ml-eff .ar.p{background:rgba(127,211,156,.16);color:#7fd39c;} .ml-eff .ar.n{background:rgba(255,59,78,.16);color:#ff8a98;} .ml-eff .ar.z{background:rgba(255,255,255,.07);color:var(--grey);}' +
  '.ml-eff b{display:block;font-size:14px;color:var(--white);font-weight:600;} .ml-eff small{color:var(--grey);font-size:12.3px;}' +
  '.ml-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px;}' +
  '.ml-chips button{font-family:var(--sans);font-size:12.8px;padding:8px 13px;border-radius:999px;border:1px solid var(--border-dim);background:rgba(255,255,255,.03);color:var(--grey);cursor:pointer;transition:all .2s;}' +
  '.ml-chips button:hover{color:var(--white);border-color:var(--border);}' +
  '.ml-chips button.on{color:var(--neon);border-color:color-mix(in srgb,var(--neon) 65%,transparent);background:color-mix(in srgb,var(--neon) 12%,transparent);box-shadow:0 0 14px color-mix(in srgb,var(--neon) 22%,transparent);}' +
  '.ml-chips button.act{font-family:var(--mono);font-size:11.5px;letter-spacing:.8px;text-transform:uppercase;}' +
  '.ml-bars{display:flex;flex-direction:column;gap:11px;margin:6px 0 12px;}' +
  '.ml-bar{display:grid;grid-template-columns:150px 1fr 54px;gap:10px;align-items:center;font-size:13.5px;color:var(--white);}' +
  '.ml-bar .tr{position:relative;height:20px;border-radius:99px;background:rgba(255,255,255,.05);overflow:hidden;}' +
  '.ml-bar .tr:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.25);z-index:1;}' +
  '.ml-bar .fl{position:absolute;top:2px;bottom:2px;border-radius:99px;transition:left .5s cubic-bezier(.3,.7,.2,1),width .5s cubic-bezier(.3,.7,.2,1),background .3s;}' +
  '.ml-bar .vv{font-family:var(--mono);font-size:13px;text-align:right;color:var(--grey);}' +
  '.ml-who{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:6px;}' +
  '.ml-who div{padding:12px 14px;border-radius:12px;border:1px solid var(--border-dim);background:rgba(255,255,255,.03);}' +
  '.ml-who small{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:var(--grey);margin-bottom:4px;}' +
  '.ml-who b{font-size:15px;transition:color .3s;} .ml-who .p b{color:#7fd39c;} .ml-who .n b{color:#ff8a98;}' +
  '.ml-scroll{overflow-x:auto;margin:0 -6px;padding:0 6px 6px;}' +
  '.ml-heat{width:100%;border-collapse:separate;border-spacing:4px;min-width:640px;}' +
  '.ml-heat th{font-family:var(--mono);font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:var(--grey);font-weight:600;padding:4px 2px;text-align:center;}' +
  '.ml-heat th:first-child{text-align:left;}' +
  '.ml-heat td{height:44px;border-radius:10px;text-align:center;font-family:var(--mono);font-size:12.5px;color:#fff;cursor:pointer;transition:transform .2s,box-shadow .2s;}' +
  '.ml-heat td.nm{background:rgba(255,255,255,.03);color:var(--white);text-align:left;padding:0 12px;font-family:var(--sans);font-size:13.5px;min-width:190px;border:1px solid var(--border-dim);}' +
  '.ml-heat tr:hover td:not(.nm){transform:scale(1.06);}' +
  '.ml-heat tr.on td.nm{border-color:var(--neon);color:var(--neon);box-shadow:0 0 14px color-mix(in srgb,var(--neon) 25%,transparent);}' +
  '.ml-heat tr.gr th{padding-top:12px;text-align:left;color:var(--neon);font-size:10.5px;}' +
  '.ml-heat svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:2px;}' +
  '.ml-heat tbody td{opacity:0;transform:scale(.6);transition:opacity .45s,transform .45s;transition-delay:calc(var(--k) * 14ms);}' +
  '.in .ml-heat tbody td{opacity:1;transform:none;}' +
  '.ml-lg{display:flex;align-items:center;gap:10px;margin:12px 0 0;font-family:var(--mono);font-size:11px;color:var(--grey);}' +
  '.ml-lg i{flex:0 0 160px;height:8px;border-radius:99px;background:linear-gradient(90deg,#ff3b4e,rgba(255,255,255,.14),#35d68a);}' +
  '.ml-detail{margin-top:16px;padding:16px 18px;border-radius:14px;border:1px solid color-mix(in srgb,var(--neon) 35%,transparent);background:color-mix(in srgb,var(--neon) 5%,transparent);}' +
  '.ml-detail h4{margin:0 0 8px;font-size:17px;color:var(--white);}' +
  '.ml-detail .ml-ud b{flex-basis:118px;color:var(--neon);}' +
  '.ml-btn{display:inline-block;margin-top:6px;font-family:var(--mono);font-size:13px;font-weight:700;letter-spacing:.5px;padding:12px 20px;border-radius:12px;border:none;cursor:pointer;background:var(--neon);color:#080808;transition:transform .15s,box-shadow .2s;}' +
  '.ml-btn:hover{transform:translateY(-1px);box-shadow:0 0 18px color-mix(in srgb,var(--neon) 45%,transparent);}' +
  '.ml-disc{margin-top:22px;padding:14px 16px;border-radius:12px;border:1px dashed rgba(255,179,71,.5);color:#ffcf8a;font-size:13.5px;line-height:1.7;}' +
  '@keyframes mlTw{from{opacity:.2}to{opacity:.75}}' +
  '@keyframes mlFlow{to{transform:translateX(-50%)}}' +
  '@keyframes mlBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}' +
  '@media (prefers-reduced-motion:reduce){.ml-sky i,.ml-waves svg,.ml-cue svg{animation:none !important;} .ml-rv{transition:none;opacity:1;transform:none;} .ml-heat tbody td{transition:none;opacity:1;transform:none;} .ml-donut circle.seg{transition:none;stroke-dasharray:var(--da) 1000;} .ml-seesaw .beam{transition:none;}}' +
  '@media (max-width:700px){.ml-sec{padding:24px 16px 20px;margin:46px 0;} .ml-sec h3{font-size:20px;} .ml-split{grid-template-columns:1fr;} .ml-bar{grid-template-columns:104px 1fr 44px;font-size:12.5px;} .ml-hstats b{font-size:26px;} .ml-ud b{flex-basis:62px;} .ml-lg i{flex-basis:90px;}}';

  /* ------------------------------ rendering ------------------------------ */
  var sec = null, bodyEl = null, io = null, rvN = 0;
  var st = { lv:{}, sel:'hike', curve:'normal', y:4.0, inf:3.0, dol:0, tw:null };
  LKEYS.forEach(function(k){ st.lv[k] = 0; });
  st.lv = JSON.parse(JSON.stringify(SC[0].v)); LKEYS.forEach(function(k){ if(st.lv[k] == null) st.lv[k] = 0; });

  function rv(){ rvN++; return 'ml-rv" style="--d:' + ((rvN % 4) * 0.08).toFixed(2) + 's'; }
  function head(n){ return '<div class="ml-num"><em>' + n + '</em></div>'; }
  var CH = {
    up:'<svg viewBox="0 0 16 16"><path d="M3 10l5-5 5 5"/></svg>', dn:'<svg viewBox="0 0 16 16"><path d="M3 6l5 5 5-5"/></svg>',
    up2:'<svg viewBox="0 0 16 16"><path d="M3 8l5-5 5 5M3 14l5-5 5 5"/></svg>', dn2:'<svg viewBox="0 0 16 16"><path d="M3 2l5 5 5-5M3 8l5 5 5-5"/></svg>',
    fl:'<svg viewBox="0 0 16 16"><path d="M3 8h10"/></svg>'
  };
  function glyph(v){
    var a = Math.abs(v);
    if(a < 0.5) return CH.fl;
    if(v > 0) return a >= 2 ? CH.up2 : CH.up;
    return a >= 2 ? CH.dn2 : CH.dn;
  }
  function heat(v){
    var a = Math.min(1, Math.abs(v) / 3.4);
    if(Math.abs(v) < 0.5) return 'rgba(255,255,255,.07)';
    var al = (0.22 + a * 0.68).toFixed(2);
    return v > 0 ? 'rgba(40,205,125,' + al + ')' : 'rgba(255,59,78,' + al + ')';
  }
  function fx(v){ return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1); }

  function wavesHTML(){
    var p = function(amp, ph){ return '<svg viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="mlwg' + ph + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f7bff"/><stop offset=".5" stop-color="#00e5ff"/><stop offset="1" stop-color="#4f7bff"/></linearGradient></defs><path d="M0 40C100 ' + (40 - amp) + ' 200 ' + (40 - amp) + ' 300 40S500 ' + (40 + amp) + ' 600 40S800 ' + (40 - amp) + ' 900 40S1100 ' + (40 + amp) + ' 1200 40" fill="none" stroke="url(#mlwg' + ph + ')" stroke-width="2.4"/><path d="M0 40C100 ' + (40 - amp) + ' 200 ' + (40 - amp) + ' 300 40S500 ' + (40 + amp) + ' 600 40S800 ' + (40 - amp) + ' 900 40S1100 ' + (40 + amp) + ' 1200 40V80H0z" fill="url(#mlwg' + ph + ')" opacity=".10"/></svg>'; };
    return '<div class="ml-waves">' + p(30, 1) + p(22, 2) + p(14, 3) + '</div>';
  }

  function sec1(){
    return '<div class="ml-sec ' + rv() + '">' + head('01') + '<h3>' + esc(T(U.s1h)) + '</h3><p>' + esc(T(U.s1p)) + '</p><div class="ml-grid">' +
      DIALS.map(function(d){
        return '<div class="ml-card"><h4>' + ic(d.k) + esc(T(d.n)) + '</h4><p>' + esc(T(d.w)) + '</p>' +
          '<div class="ml-ud u"><b>' + CH.up + esc(T(U.up)) + '</b><span>' + esc(T(d.u)) + '</span></div>' +
          '<div class="ml-ud d"><b>' + CH.dn + esc(T(U.down)) + '</b><span>' + esc(T(d.d)) + '</span></div></div>';
      }).join('') + '</div></div>';
  }
  function sec2(){
    return '<div class="ml-sec ' + rv() + '">' + head('02') + '<h3>' + esc(T(U.s2h)) + '</h3><p>' + esc(T(U.s2p)) + '</p><div class="ml-grid">' +
      ROLES.map(function(r){
        return '<div class="ml-card ml-role" style="--c:' + r.c + '"><h4>' + ic(r.k) + esc(T(r.n)) + '</h4><p>' + esc(T(r.does)) + '</p>' +
          '<div class="ml-ud u"><b>' + esc(T(U.gain)) + '</b><span>' + esc(T(r.gain)) + '</span></div>' +
          '<div class="ml-ud d"><b>' + esc(T(U.hurt)) + '</b><span>' + esc(T(r.hurt)) + '</span></div></div>';
      }).join('') + '</div></div>';
  }
  function seesawSVG(){
    return '<svg class="ml-seesaw" viewBox="0 0 560 190" role="img" aria-label="see-saw">' +
      '<defs><linearGradient id="mlsg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f7bff"/><stop offset="1" stop-color="#00e5ff"/></linearGradient></defs>' +
      '<path d="M280 122L256 176h48z" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.25)"/>' +
      '<g class="beam" data-ml="beam"><rect x="40" y="112" width="480" height="12" rx="6" fill="url(#mlsg)"/>' +
      '<g transform="translate(86 76)"><circle r="26" fill="#0b0c12" stroke="#4f9bff" stroke-width="2.4"/><text y="5" text-anchor="middle" fill="#fff" font-size="13" font-family="monospace" data-ml="priceTxt">100</text></g>' +
      '<text x="86" y="38" text-anchor="middle" fill="#8b9186" font-size="11" font-family="monospace" data-ml="priceLbl"></text>' +
      '<g transform="translate(474 76)"><circle r="26" fill="#0b0c12" stroke="#ffb347" stroke-width="2.4"/><text y="5" text-anchor="middle" fill="#fff" font-size="13" font-family="monospace" data-ml="yldTxt">4.0%</text></g>' +
      '<text x="474" y="38" text-anchor="middle" fill="#8b9186" font-size="11" font-family="monospace" data-ml="yldLbl"></text></g></svg>';
  }
  function sec3(){
    return '<div class="ml-sec ' + rv() + '">' + head('03') + '<h3>' + esc(T(U.s3h)) + '</h3><p>' + esc(T(U.s3p)) + '</p>' + seesawSVG() +
      '<div class="ml-ctl">' +
      '<div class="ml-sl one"><label>' + esc(T(U.yld)) + '<b data-ml="yv">4.0%</b></label><input type="range" min="1" max="8" step="0.1" value="' + st.y + '" data-ml-in="y" aria-label="' + esc(T(U.yld)) + '"></div>' +
      '<div class="ml-sl one"><label>' + esc(T(U.infl)) + '<b data-ml="iv">3.0%</b></label><input type="range" min="0" max="8" step="0.1" value="' + st.inf + '" data-ml-in="inf" aria-label="' + esc(T(U.infl)) + '"></div></div>' +
      '<div class="ml-kpis"><div class="ml-kpi" data-ml="kP"><span>' + esc(T(U.price)) + '</span><b>100.0</b></div><div class="ml-kpi" data-ml="kR"><span>' + esc(T(U.real)) + '</span><b>1.0%</b></div></div>' +
      '<div class="ml-callout" data-ml="realTxt"></div><p class="ml-note">' + esc(T(U.par)) + '</p></div>';
  }
  var YPT = ['2Y', '5Y', '10Y', '20Y', '30Y'];
  var CV = { normal:[3.0, 3.5, 4.0, 4.5, 4.7], flat:[4.2, 4.2, 4.2, 4.3, 4.3], inv:[5.0, 4.6, 4.2, 4.0, 3.9] };
  function sec4(){
    var tabs = [['normal', U.cNormal], ['flat', U.cFlat], ['inv', U.cInv]];
    return '<div class="ml-sec ' + rv() + '">' + head('04') + '<h3>' + esc(T(U.s4h)) + '</h3><p>' + esc(T(U.s4p)) + '</p>' +
      '<div class="ml-seg" data-ml="curveTabs">' + tabs.map(function(t){ return '<button type="button" data-ml-curve="' + t[0] + '" class="' + (st.curve === t[0] ? 'on' : '') + '">' + esc(T(t[1])) + '</button>'; }).join('') + '</div>' +
      '<svg class="ml-curve" viewBox="0 0 640 260" role="img" aria-label="yield curve"><defs><linearGradient id="mlcg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f7bff"/><stop offset="1" stop-color="#00e5ff"/></linearGradient><linearGradient id="mlca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00e5ff" stop-opacity=".25"/><stop offset="1" stop-color="#00e5ff" stop-opacity="0"/></linearGradient></defs>' +
      [0, 1, 2, 3].map(function(i){ return '<line class="gl" x1="40" x2="620" y1="' + (40 + i * 50) + '" y2="' + (40 + i * 50) + '"/>'; }).join('') +
      '<path class="ar" data-ml="curveA" d=""/><path class="ln" data-ml="curveL" d=""/>' +
      YPT.map(function(t, i){ return '<circle class="dot" data-ml="cd' + i + '" r="6"/><text class="vv" data-ml="cv' + i + '"></text><text x="' + (80 + i * 120) + '" y="244">' + t + '</text>'; }).join('') + '</svg>' +
      '<div class="ml-callout" data-ml="curveTxt"></div><p class="ml-note">' + esc(T(U.cNote)) + '</p></div>';
  }
  function donutSVG(){
    var r = 80, C = 2 * Math.PI * r, off = 0, out = '';
    BASKET.forEach(function(b, i){
      var len = C * b.w / 100;
      out += '<circle class="seg" cx="110" cy="110" r="' + r + '" stroke="' + b.c + '" style="--da:' + (len - 2).toFixed(1) + 'px;--dl:' + (i * 0.12).toFixed(2) + 's;stroke-dashoffset:' + (-off).toFixed(1) + 'px"/>';
      off += len;
    });
    return '<svg class="ml-donut" viewBox="0 0 220 220" role="img" aria-label="DXY basket">' + out +
      '<text x="110" y="106" text-anchor="middle" fill="#fff" font-size="28" font-weight="700" font-family="monospace">DXY</text><text x="110" y="128" text-anchor="middle" fill="#8b9186" font-size="11" font-family="monospace">6 CURRENCIES</text></svg>';
  }
  function sec5(){
    return '<div class="ml-sec ' + rv() + '">' + head('05') + '<h3>' + esc(T(U.s5h)) + '</h3><p>' + esc(T(U.s5p)) + '</p>' +
      '<div class="ml-split"><div>' + donutSVG() + '<div class="ml-leg">' + BASKET.map(function(b){ return '<span><i style="background:' + b.c + '"></i>' + b.k + ' ' + b.w + '%</span>'; }).join('') + '</div></div>' +
      '<div><div class="ml-sl"><label>' + esc(T(U.dWeak)) + ' ← → ' + esc(T(U.dStrong)) + '<b data-ml="dv">0</b></label><input type="range" min="-2" max="2" step="1" value="' + st.dol + '" data-ml-in="dol" aria-label="dollar"></div>' +
      '<div class="ml-eff" data-ml="dEff"></div></div></div><p class="ml-note">' + esc(T(U.dNote)) + '</p></div>';
  }
  function sec6(){
    return '<div class="ml-sec ' + rv() + '">' + head('06') + '<h3>' + esc(T(U.s6h)) + '</h3><p>' + esc(T(U.s6p)) + '</p><div class="ml-grid">' +
      TOOLS.map(function(t){
        return '<div class="ml-card"><h4>' + ic(t.i) + esc(T(t.n)) + '</h4><p>' + esc(T(t.w)) + '</p><div class="ml-tags"><em>' + esc(T(U.moves)) + '</em>' +
          t.m.map(function(m){ return '<span>' + esc(T(LN[m].n)) + '</span>'; }).join('') + '</div></div>';
      }).join('') + '</div></div>';
  }
  function sec7(){
    var sl = LKEYS.map(function(k){
      return '<div class="ml-sl"><label>' + esc(T(LN[k].n)) + '<b data-ml="lv_' + k + '">0</b></label><input type="range" min="-2" max="2" step="1" value="' + (st.lv[k] || 0) + '" data-ml-lv="' + k + '" aria-label="' + esc(T(LN[k].n)) + '">' +
        '<div class="ml-ends"><span>' + esc(T(LN[k].lo)) + '</span><span>' + esc(T(LN[k].hi)) + '</span></div></div>';
    }).join('');
    var chips = SC.map(function(s){ return '<button type="button" data-ml-sc="' + s.id + '" class="' + (st.sel === s.id ? 'on' : '') + '">' + esc(T(s.n)) + '</button>'; }).join('');
    return '<div class="ml-sec ' + rv() + '" id="ml-sim">' + head('07') + '<h3>' + esc(T(U.s7h)) + '</h3><p>' + esc(T(U.s7p)) + '</p>' +
      '<div class="ml-chips" data-ml="chips">' + chips + '<button type="button" class="act" data-ml-act="today">' + esc(T(U.today)) + '</button><button type="button" class="act" data-ml-act="reset">' + esc(T(U.reset)) + '</button></div>' +
      '<div class="ml-ctl">' + sl + '</div>' +
      '<h4 style="margin:18px 0 8px;color:var(--white)">' + esc(T(U.out)) + '</h4><div class="ml-bars" data-ml="bars">' +
      ASSETS.map(function(a){ return '<div class="ml-bar" data-ml-a="' + a + '"><span>' + esc(T(ANAME[a])) + '</span><div class="tr"><div class="fl"></div></div><span class="vv">0</span></div>'; }).join('') + '</div>' +
      '<div class="ml-callout" data-ml="sum"></div>' +
      '<h4 style="margin:18px 0 6px;color:var(--white)">' + esc(T(U.winners)) + '</h4><div class="ml-who" data-ml="who"></div>' +
      '<p class="ml-note" data-ml="todayN" style="display:none">' + esc(T(U.todayN)) + '</p></div>';
  }
  function sec8(){
    var cols = '<tr><th>' + esc(T(U.scen)) + '</th>' + ASSETS.map(function(a){ return '<th scope="col">' + esc(T(ASHORT[a])) + '</th>'; }).join('') + '</tr>';
    var rows = '', lastG = '', kk = 0;
    SC.forEach(function(s){
      if(s.g !== lastG){ lastG = s.g; rows += '<tr class="gr"><th colspan="8">' + esc(T(GROUPS[s.g])) + '</th></tr>'; }
      var r = calc(s.v);
      rows += '<tr data-ml-row="' + s.id + '" class="' + (st.sel === s.id ? 'on' : '') + '"><td class="nm" style="--k:' + (kk++) + '">' + esc(T(s.n)) + '</td>' +
        r.map(function(v, i){ return '<td style="background:' + heat(v) + ';--k:' + (kk++) + '" title="' + esc(T(ANAME[ASSETS[i]])) + ' ' + fx(v) + '">' + glyph(v) + '</td>'; }).join('') + '</tr>';
    });
    return '<div class="ml-sec ' + rv() + '">' + head('08') + '<h3>' + esc(T(U.s8h)) + '</h3><p>' + esc(T(U.s8p)) + '</p>' +
      '<div class="ml-scroll"><table class="ml-heat"><thead>' + cols + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="ml-lg"><span>' + esc(T(U.legend)) + '</span><i></i><span>' + esc(T(U.legend2)) + '</span></div>' +
      '<div class="ml-detail" data-ml="detail"></div></div>';
  }
  function sec9(){
    return '<div class="ml-sec ' + rv() + '">' + head('09') + '<h3>' + esc(T(U.s9h)) + '</h3><p>' + esc(T(U.s9p)) + '</p>' +
      '<button type="button" class="ml-btn" data-ml-act="story">' + esc(T(U.openStory)) + '</button>' +
      '<div class="ml-disc">' + esc(T(U.disc)) + '</div></div>';
  }

  function render(){
    rvN = 0;
    var h = '<div class="ml-wrap"><div class="ml-hero ' + rv() + '"><div class="ml-hstats">' +
      U.hs.map(function(s){ return '<div><b data-ml-count="' + s.n + '">0</b>' + esc(T(s)) + '</div>'; }).join('') + '</div>' + wavesHTML() + '</div>' +
      '<div class="ml-cue ' + rv() + '"><span>' + esc(T(U.scroll)) + '</span><svg viewBox="0 0 22 30"><rect x="3" y="2" width="16" height="26" rx="8"/><path d="M11 8v5"/></svg></div>';
    h += sec1() + sec2() + sec3() + sec4() + sec5() + sec6() + sec7() + sec8() + sec9() + '</div>';
    return h;
  }

  /* ------------------------------ live parts ------------------------------ */
  function q(key){ return bodyEl.querySelector('[data-ml="' + key + '"]'); }

  function bondPrice(y){
    var c = 4, n = 10, r = y / 100, p = 0, t;
    for(t = 1; t <= n; t++) p += c / Math.pow(1 + r, t);
    return p + 100 / Math.pow(1 + r, n);
  }
  function updBond(){
    var p = bondPrice(st.y), real = st.y - st.inf;
    q('yv').textContent = st.y.toFixed(1) + '%'; q('iv').textContent = st.inf.toFixed(1) + '%';
    var kp = q('kP'), kr = q('kR');
    kp.querySelector('b').textContent = p.toFixed(1);
    kr.querySelector('b').textContent = (real >= 0 ? '+' : '−') + Math.abs(real).toFixed(1) + '%';
    kp.className = 'ml-kpi ' + (p >= 100.5 ? 'pos' : p <= 99.5 ? 'neg' : '');
    kr.className = 'ml-kpi ' + (real > 0.3 ? 'pos' : real < -0.3 ? 'neg' : '');
    q('realTxt').textContent = T(real > 0.3 ? U.realPos : real < -0.3 ? U.realNeg : U.realZero);
    var ang = Math.max(-26, Math.min(26, -(st.y - 4) * 6));
    q('beam').style.transform = 'rotate(' + ang + 'deg)';
    q('priceTxt').textContent = p.toFixed(0); q('yldTxt').textContent = st.y.toFixed(1) + '%';
    q('priceLbl').textContent = T(U.price).toUpperCase(); q('yldLbl').textContent = T(U.yld).toUpperCase();
  }

  function curvePath(ys){
    var pts = ys.map(function(v, i){ return [80 + i * 120, 40 + (5.5 - v) / 3 * 150]; });
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for(var i = 1; i < pts.length; i++){
      var a = pts[i - 1], b = pts[i], mx = (a[0] + b[0]) / 2;
      d += ' C' + mx + ' ' + a[1] + ' ' + mx + ' ' + b[1] + ' ' + b[0] + ' ' + b[1];
    }
    return { d:d, pts:pts, area:d + ' L' + pts[pts.length - 1][0] + ' 190 L' + pts[0][0] + ' 190 Z' };
  }
  function drawCurve(ys){
    var c = curvePath(ys);
    q('curveL').setAttribute('d', c.d); q('curveA').setAttribute('d', c.area);
    c.pts.forEach(function(p, i){
      var dot = q('cd' + i), tx = q('cv' + i);
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]);
      tx.setAttribute('x', p[0]); tx.setAttribute('y', p[1] - 14); tx.textContent = ys[i].toFixed(1) + '%';
    });
  }
  var curCur = CV.normal.slice();
  function setCurve(mode, instant){
    st.curve = mode;
    Array.prototype.forEach.call(bodyEl.querySelectorAll('[data-ml-curve]'), function(b){ b.classList.toggle('on', b.getAttribute('data-ml-curve') === mode); });
    q('curveTxt').textContent = T(mode === 'normal' ? U.cNormalD : mode === 'flat' ? U.cFlatD : U.cInvD);
    var to = CV[mode], from = curCur.slice();
    if(st.tw) cancelAnimationFrame(st.tw);
    if(instant){ curCur = to.slice(); drawCurve(curCur); return; }
    var t0 = Date.now(), dur = 700;
    (function step(){
      var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      curCur = from.map(function(v, i){ return v + (to[i] - v) * e; });
      drawCurve(curCur);
      if(k < 1) st.tw = requestAnimationFrame(step);
    })();
  }

  function updDollar(){
    q('dv').textContent = (st.dol > 0 ? '+' : '') + st.dol;
    q('dEff').innerHTML = U.dRows.map(function(r){
      var v = r.c * st.dol, cls = Math.abs(v) < 0.5 ? 'z' : v > 0 ? 'p' : 'n';
      var g = Math.abs(v) < 0.5 ? '–' : v > 0 ? '▲' : '▼';
      return '<div><span class="ar ' + cls + '">' + g + '</span><span><b>' + esc(T(r.k)) + '</b><small>' + esc(T(r.why)) + '</small></span></div>';
    }).join('');
  }

  function curVals(){ return calc(st.lv); }
  function updSim(){
    var vals = curVals(), any = LKEYS.some(function(k){ return st.lv[k] !== 0; });
    LKEYS.forEach(function(k){
      var el = q('lv_' + k), v = st.lv[k];
      el.textContent = (v > 0 ? '+' : '') + v;
      var inp = bodyEl.querySelector('[data-ml-lv="' + k + '"]'); if(inp && +inp.value !== v) inp.value = v;
    });
    ASSETS.forEach(function(a, i){
      var row = bodyEl.querySelector('[data-ml-a="' + a + '"]'), v = vals[i];
      var w = Math.min(50, Math.abs(v) / 4 * 50), fl = row.querySelector('.fl');
      fl.style.width = w + '%'; fl.style.left = (v >= 0 ? 50 : 50 - w) + '%';
      fl.style.background = Math.abs(v) < 0.3 ? 'rgba(255,255,255,.25)' : v > 0 ? 'linear-gradient(90deg,#1fb877,#5df0a8)' : 'linear-gradient(270deg,#ff3b4e,#ff8a98)';
      row.querySelector('.vv').textContent = fx(v);
    });
    var ord = vals.map(function(v, i){ return [v, i]; }).sort(function(a, b){ return b[0] - a[0]; });
    if(!any) q('sum').textContent = T(U.flat);
    else q('sum').innerHTML = esc(T(U.best)) + ': <b>' + esc(T(ANAME[ASSETS[ord[0][1]]])) + '</b> (' + fx(ord[0][0]) + ') · ' + esc(T(U.worst)) + ': <b>' + esc(T(ANAME[ASSETS[ord[6][1]]])) + '</b> (' + fx(ord[6][0]) + ')';
    var cash = vals[6], bonds = vals[2];
    var who = [
      [U.wBorrow, -cash], [U.wSaver, cash], [U.wLender, bonds * 0.6 + cash * 0.4]
    ];
    q('who').innerHTML = who.map(function(w){
      var v = w[1], cls = Math.abs(v) < 0.5 ? '' : v > 0 ? 'p' : 'n';
      var lab = Math.abs(v) < 0.5 ? T(U.mixed) : (Math.abs(v) >= 1.5 ? T(U.strong2) + ' ' : T(U.mild) + ' ') + T(v > 0 ? U.tail : U.head);
      return '<div class="' + cls + '"><small>' + esc(T(w[0])) + '</small><b>' + esc(lab) + '</b></div>';
    }).join('');
    Array.prototype.forEach.call(bodyEl.querySelectorAll('[data-ml-sc]'), function(b){ b.classList.toggle('on', b.getAttribute('data-ml-sc') === st.sel); });
  }
  function loadScenario(id, scroll){
    var s = SC.filter(function(x){ return x.id === id; })[0]; if(!s) return;
    st.sel = id;
    LKEYS.forEach(function(k){ st.lv[k] = s.v[k] || 0; });
    var td = q('todayN'); if(td) td.style.display = 'none';
    updSim(); updDetail();
    if(scroll){ var el = document.getElementById('ml-sim'); if(el && el.scrollIntoView) el.scrollIntoView({ behavior:'smooth', block:'start' }); }
  }
  function updDetail(){
    Array.prototype.forEach.call(bodyEl.querySelectorAll('[data-ml-row]'), function(r){ r.classList.toggle('on', r.getAttribute('data-ml-row') === st.sel); });
    var d = q('detail'), s = SC.filter(function(x){ return x.id === st.sel; })[0];
    if(!s){ d.style.display = 'none'; return; }
    d.style.display = '';
    d.innerHTML = '<h4>' + esc(T(s.n)) + '</h4>' +
      '<div class="ml-ud"><b>' + esc(T(U.why)) + '</b><span>' + esc(T(s.d)) + '</span></div>' +
      '<div class="ml-ud"><b>' + esc(T(U.cbCan)) + '</b><span>' + esc(T(s.cb)) + '</span></div>' +
      '<div class="ml-ud"><b>' + esc(T(U.govCan)) + '</b><span>' + esc(T(s.gov)) + '</span></div>';
  }

  /* ------------------------------ events ------------------------------ */
  function onInput(ev){
    var t = ev.target;
    if(t.hasAttribute('data-ml-lv')){ st.lv[t.getAttribute('data-ml-lv')] = parseInt(t.value, 10); st.sel = ''; updSim(); updDetail(); }
    else if(t.getAttribute('data-ml-in') === 'y'){ st.y = parseFloat(t.value); updBond(); }
    else if(t.getAttribute('data-ml-in') === 'inf'){ st.inf = parseFloat(t.value); updBond(); }
    else if(t.getAttribute('data-ml-in') === 'dol'){ st.dol = parseInt(t.value, 10); updDollar(); }
  }
  function onClick(ev){
    var el = ev.target.closest('[data-ml-sc],[data-ml-curve],[data-ml-act],[data-ml-row]');
    if(!el || !bodyEl.contains(el)) return;
    if(el.hasAttribute('data-ml-sc')) loadScenario(el.getAttribute('data-ml-sc'), false);
    else if(el.hasAttribute('data-ml-row')) loadScenario(el.getAttribute('data-ml-row'), true);
    else if(el.hasAttribute('data-ml-curve')) setCurve(el.getAttribute('data-ml-curve'), false);
    else {
      var a = el.getAttribute('data-ml-act');
      if(a === 'reset'){ st.sel = ''; LKEYS.forEach(function(k){ st.lv[k] = 0; }); q('todayN').style.display = 'none'; updSim(); updDetail(); }
      else if(a === 'today'){ st.sel = ''; LKEYS.forEach(function(k){ st.lv[k] = TODAY[k] || 0; }); q('todayN').style.display = ''; updSim(); updDetail(); }
      else if(a === 'story'){ location.hash = '#/macro'; }
    }
  }

  function countUp(el){
    var to = parseFloat(el.getAttribute('data-ml-count')) || 0, t0 = Date.now(), dur = 1200;
    (function step(){
      var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if(k < 1 && document.body.contains(el)) requestAnimationFrame(step);
    })();
  }
  function reveal(el){
    if(el.classList.contains('in')) return;
    el.classList.add('in');
    Array.prototype.forEach.call(el.querySelectorAll('[data-ml-count]'), countUp);
  }
  function observe(){
    if(io){ io.disconnect(); io = null; }
    var els = bodyEl.querySelectorAll('.ml-rv');
    if(!('IntersectionObserver' in window)){ Array.prototype.forEach.call(els, reveal); return; }
    io = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ reveal(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    Array.prototype.forEach.call(els, function(el){ io.observe(el); });
  }

  function repaint(){
    if(!sec) return;
    var g = function(k){ return sec.querySelector('[data-ml-h="' + k + '"]'); };
    g('eb').textContent = T(U.eb); g('h').textContent = T(U.h); g('lede').textContent = T(U.lede);
    bodyEl.innerHTML = render();
    updBond(); curCur = CV[st.curve].slice(); setCurve(st.curve, true); updDollar(); updSim(); updDetail();
    observe();
  }

  function build(){
    if(document.getElementById('macrolab')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    var s = document.createElement('style'); s.id = 'macrolabCss'; s.textContent = CSS; document.head.appendChild(s);
    sec = document.createElement('section');
    sec.id = 'macrolab'; sec.setAttribute('data-route', 'macrolab');
    sec.innerHTML =
      '<div class="ml-sky"><i></i><i></i></div>' +
      '<div class="ewv-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-ml-h="eb"></span></div>' +
          '<h2 data-ml-h="h"></h2><p class="lede" data-ml-h="lede"></p><div class="rule"></div>' +
        '</div><div data-ml-h="body"></div></div>';
    document.body.appendChild(sec);
    bodyEl = sec.querySelector('[data-ml-h="body"]');
    bodyEl.addEventListener('click', onClick);
    bodyEl.addEventListener('input', onInput);
    window.__spzAddRoute({
      id: 'macrolab', after: 'infl',
      t: { en: 'Macro Lab', th: 'แล็บเศรษฐกิจมหภาค' },
      d: { en: 'Learn the macro dials with animated infographics, a heat map and a simulator: dollar, yields, inflation, gold, Bitcoin and who wins or loses.',
           th: 'เรียนรู้หน้าปัดเศรษฐกิจมหภาคด้วยอินโฟกราฟิกเคลื่อนไหว ฮีตแมป และเครื่องจำลอง: ดอลลาร์ ผลตอบแทน เงินเฟ้อ ทองคำ บิตคอยน์ และใครได้ใครเสีย' }
    });
    sec.__render = repaint;
    repaint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) repaint(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
