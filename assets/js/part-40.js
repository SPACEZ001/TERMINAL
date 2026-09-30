
(function(){
  'use strict';
  if (window.__SPZ_BUBBLE) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
  function scaleRisk(v, lo, hi){ return isNum(v) ? clamp((v - lo) / (hi - lo) * 100, 0, 100) : null; }
  function fmt(v, nd){ return isNum(v) ? v.toFixed(nd == null ? 1 : nd) : '—'; }
  function pctStr(v, nd){ return isNum(v) ? ((v >= 0 ? '+' : '') + v.toFixed(nd == null ? 1 : nd) + '%') : '—'; }
  function joinList(items){
    items = items.filter(Boolean);
    if (!items.length) return '';
    if (items.length === 1) return items[0];
    var and = L() === 'th' ? ' และ ' : ' and ';
    if (items.length === 2) return items[0] + and + items[1];
    return items.slice(0, -1).join(L() === 'th' ? ' ' : ', ') + and + items[items.length - 1];
  }

  var C = {
    eyebrow:{en:'An educational risk framework, not a prediction',th:'กรอบวิเคราะห์เพื่อการศึกษา ไม่ใช่การทำนาย'},
    h:{en:'Bubble Radar',th:'เรดาร์ฟองสบู่'},
    lede:{en:'Five well-known valuation and leverage signals, blended into one score, plus the market-breadth and credit signals that go with them. None of this predicts a crash - it only shows how stretched things look by measures that have shown up before past ones.',
          th:'สัญญาณด้านมูลค่าและหนี้ที่รู้จักกันดี 5 ตัว รวมเป็นคะแนนเดียว บวกสัญญาณความกว้างของตลาดและสินเชื่อที่เกี่ยวข้อง ทั้งหมดนี้ไม่ได้ทำนายว่าจะเกิดวิกฤต แค่แสดงว่าตลาด "ตึง" แค่ไหนตามตัวชี้วัดที่เคยปรากฏก่อนวิกฤตในอดีต'},
    disclaimer:{en:'<b>Educational only, not investment advice.</b> This score is a simple, transparent average of historical warning signs - it has no forecasting power on its own, can stay elevated for years before anything happens, and can also fall without any crash occurring at all. Nothing on this page is a recommendation to buy or sell anything.',
                th:'<b>เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน</b> คะแนนนี้เป็นค่าเฉลี่ยอย่างง่ายจากสัญญาณเตือนในอดีต ไม่มีความสามารถในการทำนายด้วยตัวเอง อาจอยู่ในระดับสูงต่อเนื่องได้หลายปีโดยไม่มีอะไรเกิดขึ้น หรือลดลงได้โดยไม่มีวิกฤตเลยก็ได้ ทุกอย่างในหน้านี้ไม่ใช่คำแนะนำให้ซื้อหรือขายสิ่งใด'},
    covFull:{en:'All 5 primary signals available',th:'มีข้อมูลครบทั้ง 5 ตัวชี้วัดหลัก'},
    covPart:{en:'{n} of 5 primary signals available - score is an average of only those',th:'มีข้อมูล {n} จาก 5 ตัวชี้วัดหลัก - คะแนนเฉลี่ยจากเท่าที่มี'},
    radarH:{en:'Shape of the risk',th:'รูปทรงความเสี่ยง'},
    radarNote:{en:'These are converted risk scores (0-100%), not the raw readings - see actual figures in the cards below. <b>For market breadth and the yield curve, 0% is the safe reading, not missing data</b> - a higher raw value there is safer, so their spoke can sit at the center of the chart while everything is fine.',
               th:'ตัวเลขตรงนี้คือ "คะแนนความเสี่ยง" ที่แปลงค่าแล้ว (0-100%) ไม่ใช่ค่าจริงของตัวชี้วัด ดูค่าจริงได้ที่การ์ดด้านล่าง <b>สำหรับความกว้างของตลาดกับเส้นผลตอบแทนพันธบัตร 0% คือค่าที่ปลอดภัย ไม่ใช่ข้อมูลหาย</b> เพราะค่าจริงยิ่งสูงยิ่งปลอดภัย แกนของสองตัวนี้จึงอาจอยู่ตรงกลางกราฟได้ทั้งที่ทุกอย่างปกติดี'},
    riskHistLabel:{en:'Risk score over time (0-100% scale)',th:'คะแนนความเสี่ยงย้อนหลัง (สเกล 0-100%)'},
    primaryH:{en:'The 5 signals behind the score',th:'5 สัญญาณที่ใช้คำนวณคะแนน'},
    primaryP:{en:'Equally weighted, on purpose - a simple average is easier to trust than a black-box formula.',
              th:'ให้น้ำหนักเท่ากันทุกตัวโดยตั้งใจ - ค่าเฉลี่ยง่ายๆ เชื่อถือได้มากกว่าสูตรลับที่มองไม่เห็น'},
    supportH:{en:'Other signals worth watching',th:'สัญญาณอื่นที่ควรจับตา'},
    supportP:{en:'Not blended into the score above - shown separately since each reads two ways depending on context.',
              th:'ไม่ได้รวมอยู่ในคะแนนด้านบน - แยกไว้ต่างหากเพราะแต่ละตัวตีความได้สองทาง ขึ้นอยู่กับบริบท'},
    flowH:{en:'This month’s sector momentum',th:'แรงส่งราคาแต่ละกลุ่มอุตสาหกรรมเดือนนี้'},
    flowP:{en:'How each sector’s ETF has moved over the past month, ranked. This is price momentum, not real fund-flow data - no free source for actual capital flows exists, so nothing here should be read as "where the money is literally going".',
           th:'ETF ตัวแทนแต่ละกลุ่มอุตสาหกรรมเคลื่อนไหวแค่ไหนในเดือนที่ผ่านมา เรียงจากมากไปน้อย นี่คือแรงส่งของราคา ไม่ใช่ข้อมูลกระแสเงินทุนจริง เพราะไม่มีแหล่งข้อมูลกระแสเงินทุนจริงที่ฟรีให้ดึง จึงไม่ควรตีความว่าเป็น "เงินไหลไปที่ไหนจริงๆ"'},
    eduH:{en:'If this were to unwind - educational reference',th:'ถ้าฟองสบู่แตกจริง - ข้อมูลอ้างอิงเพื่อการศึกษา'},
    eduP:{en:'Three broad groupings finance textbooks commonly describe, with real tickers this site already tracks where they exist. This is a description of how these groups have historically behaved, not a forecast or a recommendation - any of them can still fall, including the “defensive” one.',
          th:'สามกลุ่มกว้างๆ ที่ตำราการเงินมักอธิบายไว้ พร้อมหุ้นจริงที่เว็บนี้ติดตามอยู่ในแต่ละกลุ่ม (เท่าที่มี) นี่คือคำอธิบายพฤติกรรมในอดีตของแต่ละกลุ่ม ไม่ใช่การทำนายหรือคำแนะนำ - หุ้นกลุ่มไหนก็ยังลงได้เสมอ รวมถึงกลุ่ม "ป้องกันความเสี่ยง" ด้วย'},
    defH:{en:'Historically more defensive',th:'กลุ่มที่มักทนทานกว่าในอดีต'},
    defP:{en:'People keep buying electricity, medicine and toilet paper in a downturn. <b>This does not mean these stocks rise when a bubble bursts - it means they have historically fallen less than the broad market during past corrections.</b> "Less" still means down: every group on this page, including this one, can still lose money.',
          th:'คนยังต้องใช้ไฟฟ้า ยา และของใช้จำเป็นแม้เศรษฐกิจแย่ <b>นี่ไม่ได้แปลว่าหุ้นกลุ่มนี้จะขึ้นตอนฟองสบู่แตก แต่แปลว่าในอดีตมันมักลงน้อยกว่าตลาดโดยรวมช่วงตลาดปรับฐาน</b> "น้อยกว่า" ก็ยังคือลง ทุกกลุ่มในหน้านี้ รวมถึงกลุ่มนี้ด้วย ยังขาดทุนได้เสมอ'},
    cycH:{en:'Historically more sensitive',th:'กลุ่มที่มักอ่อนไหวกว่าในอดีต'},
    cycP:{en:'High-growth, high-valuation and highly-leveraged names tend to fall furthest when sentiment turns, because their prices depend more on optimism about the future than on today’s cash flow. Some do recover sharply once sentiment returns - but that recovery is never guaranteed, and plenty of names from past bubbles never got back to their old highs.',
          th:'หุ้นเติบโตสูง มูลค่าตลาดสูง หรือใช้หนี้เยอะ มักลงแรงที่สุดเมื่อบรรยากาศตลาดเปลี่ยน เพราะราคาขึ้นอยู่กับความหวังในอนาคตมากกว่ากระแสเงินสดวันนี้ บางตัวก็ฟื้นตัวแรงเมื่อบรรยากาศกลับมาดี แต่การฟื้นตัวไม่ใช่เรื่องรับประกัน และหุ้นจำนวนไม่น้อยจากฟองสบู่รอบก่อนๆ ก็ไม่เคยกลับไปแตะจุดสูงสุดเดิมได้อีกเลย'},
    stale:{en:'last known value, source unreachable this run',th:'ค่าล่าสุดที่มี ดึงข้อมูลรอบนี้ไม่สำเร็จ'},
    nodata:{en:'No data yet - the daily fetch hasn’t run for this one.',th:'ยังไม่มีข้อมูล รอบดึงข้อมูลประจำวันยังไม่รันสำหรับตัวนี้'},
    asOf:{en:'as of',th:'ข้อมูล ณ'},

    pendingLead:{en:'Not broken - just waiting on today’s data.',th:'ไม่ได้พัง - แค่รอข้อมูลของวันนี้'},
    pendingBody:{en:'{names} only refresh once a day and haven’t completed their first run since this page launched. Until they do, the score below is provisional - built from only the {n} of 5 signals that already update live (the same market data refreshed every 30 minutes elsewhere on this site). Check back within a day.',
                 th:'{names} อัปเดตวันละครั้งเท่านั้น และยังไม่เคยรันรอบแรกเสร็จตั้งแต่เปิดหน้านี้ ระหว่างนี้คะแนนด้านล่างจึงเป็นค่าชั่วคราว คำนวณจากแค่ {n} ใน 5 สัญญาณที่อัปเดตสดอยู่แล้ว (ข้อมูลตลาดชุดเดียวกับที่อัปเดตทุก 30 นาทีในหน้าอื่นของเว็บนี้) กลับมาเช็คอีกครั้งภายในวันนี้พรุ่งนี้ได้เลย'},

    scaleH:{en:'What the score means (and what it doesn’t)',th:'คะแนนนี้แปลว่าอะไร (และไม่ได้แปลว่าอะไร)'},
    scaleP:{en:'There is no exact percentage where a bubble “bursts” - that’s only ever confirmed after the fact, and history shows no single trigger number. The ranges below describe how many historical warning signs are lit up together, not a countdown to a crash.',
            th:'ไม่มีเปอร์เซ็นต์ตายตัวที่บอกว่าฟองสบู่ “แตก” ตรงจุดนี้ - เรื่องนี้ยืนยันได้ก็ต่อเมื่อมันเกิดขึ้นแล้วเท่านั้น และประวัติศาสตร์ก็ไม่มีตัวเลขจุดชนวนเดียวที่ตายตัว ช่วงคะแนนด้านล่างอธิบายว่ามีสัญญาณเตือนในอดีตติดสว่างพร้อมกันกี่ตัว ไม่ใช่การนับถอยหลังสู่วิกฤต'},
    scaleFoot:{en:'In every past cycle, the score could have sat in the “High” or “Very high” band for months to years before anything happened - and in a few cases it never led to a sharp crash at all, just a slow cooldown. Treat rising ranges as “more signals worth watching”, never as a timer.',
               th:'ในทุกรอบที่ผ่านมา คะแนนเคยอยู่ในช่วง "สูง" หรือ "สูงมาก" ได้นานหลายเดือนถึงหลายปีก่อนจะเกิดอะไรขึ้นจริง และบางครั้งก็ไม่ได้นำไปสู่การร่วงแรงเลย แค่ค่อยๆ เย็นลงเฉยๆ ให้มองว่าคะแนนที่สูงขึ้นคือ "สัญญาณที่ควรจับตามากขึ้น" ไม่ใช่ตัวนับเวลาถอยหลัง'},

    tierLow:{en:'Most signals sit within normal historical ranges.',th:'สัญญาณส่วนใหญ่อยู่ในช่วงปกติของประวัติศาสตร์'},
    tierMod:{en:'Some signals are stretched - common mid-cycle in a long bull run, and can stay here for years.',
             th:'บางสัญญาณเริ่มตึง - พบได้บ่อยช่วงกลางของตลาดขาขึ้นยาวๆ และอยู่แบบนี้ได้เป็นปี'},
    tierHigh:{en:'Most signals are stretched together - similar readings showed up before 2000 and 2007-08, but also years ahead of those peaks.',
              th:'สัญญาณส่วนใหญ่ตึงพร้อมกัน - ระดับใกล้เคียงนี้เคยเกิดก่อนวิกฤตปี 2000 และ 2007-08 แต่ก็เคยเกิดล่วงหน้าหลายปีก่อนจุดพีคจริงเช่นกัน'},
    tierVHigh:{en:'Nearly every signal is at a historical extreme at once - rare, and has coincided with major market tops, though what followed took anywhere from months to a couple of years to unfold.',
               th:'แทบทุกสัญญาณตึงสุดขั้วพร้อมกัน - เกิดไม่บ่อย และเคยเกิดพร้อมจุดสูงสุดของตลาดครั้งใหญ่ แต่หลังจากนั้นกว่าจะเห็นผลจริงก็เคยกินเวลาตั้งแต่หลายเดือนถึงสองสามปี'},

    flowmapH:{en:'If sentiment turns: where money has tended to go',th:'ถ้าบรรยากาศตลาดเปลี่ยน: เงินมักไหลไปทางไหน'},
    loseIcon:{en:'↓ TYPICALLY SOLD FIRST',th:'↓ มักถูกขายก่อน'},
    holdIcon:{en:'↓ TYPICALLY FALLS LESS (NOT UP)',th:'↓ มักลงน้อยกว่า (ไม่ใช่ขึ้น)'},
    havenIcon:{en:'→ TRADITIONAL REFUGE',th:'→ ที่หลบภัยดั้งเดิม'},
    safeH:{en:'Traditional safe havens',th:'สินทรัพย์ปลอดภัยดั้งเดิม'},
    safeP:{en:'Cash and short-term T-bills, high-quality government bonds, and gold are historically where money has tended to move to - not just away from stocks - once fear takes over. This site does not track live prices for these, but here are the ticker symbols people commonly reference for each:',
           th:'เงินสดและตั๋วเงินคลังระยะสั้น พันธบัตรรัฐบาลคุณภาพสูง และทองคำ ในอดีตมักเป็นที่ที่เงินไหลเข้าไปหา ไม่ใช่แค่ไหลออกจากหุ้นเฉยๆ เมื่อความกลัวเข้าครอบงำตลาด เว็บนี้ไม่ได้ติดตามราคาสดของสิ่งเหล่านี้ แต่นี่คือสัญลักษณ์ (ticker) ที่คนทั่วไปมักอ้างอิงถึงในแต่ละกลุ่ม:'},
    havenCash:{en:'Cash / T-bills',th:'เงินสด/ตั๋วเงินคลัง'},
    havenBond:{en:'Government / long bonds',th:'พันธบัตรรัฐบาล/ระยะยาว'},
    havenGold:{en:'Gold',th:'ทองคำ'},

    burstH:{en:'What it typically looks like when a bubble actually deflates',th:'ถ้าฟองสบู่แตกจริงๆ มักจะมีหน้าตาแบบไหน'},
    burstP:{en:'A rough, plain-language checklist drawn from past cycles - not a formula. None of these mean much alone; it is several of them showing up together that history treats as notable. Each row below is checked live against today\'s data where this site has a matching signal - where it doesn\'t, that is said plainly instead of guessing.',
            th:'เช็คลิสต์แบบภาษาง่ายๆ จากรอบวิกฤตในอดีต ไม่ใช่สูตรคำนวณ แต่ละข้อเดี่ยวๆ ไม่ได้มีความหมายมากนัก แต่ถ้าหลายข้อเกิดพร้อมกัน ในอดีตมักถือว่าน่าจับตาเป็นพิเศษ แต่ละแถวด้านล่างเช็คสถานะจากข้อมูลตลาดล่าสุดแบบสดให้อัตโนมัติเท่าที่เว็บนี้มีตัวชี้วัดตรงกัน ส่วนข้อไหนไม่มีข้อมูลจะบอกตรงๆ ไม่เดาให้'},
    burstFoot:{en:'Rough historical pattern, nothing more: once several of these line up together, past cycles took anywhere from a few months to a couple of years before the actual downturn arrived - and a few times it never came at all. There is no reliable countdown here - treat it as "worth watching more closely", never a timer.',
               th:'แนวโน้มคร่าวๆ จากอดีตเท่านั้น เมื่อหลายข้อด้านบนเกิดพร้อมกัน ในรอบก่อนๆ กว่าจะเห็นการปรับฐานจริงเคยใช้เวลาตั้งแต่ไม่กี่เดือนไปจนถึงสองสามปี และบางครั้งก็ไม่เกิดขึ้นเลยก็มี ไม่มีตัวนับเวลาที่เชื่อถือได้ตรงนี้ ให้มองเป็นสัญญาณ "ควรจับตาใกล้ขึ้น" ไม่ใช่นาฬิกานับถอยหลัง'},

    radarInvTip:{en:'Higher raw value = safer here, so 0% risk is the good outcome, not missing data.',
                 th:'ค่าจริงยิ่งสูงยิ่งปลอดภัยสำหรับตัวนี้ คะแนนเสี่ยง 0% จึงคือผลลัพธ์ที่ดี ไม่ใช่ข้อมูลหาย'},

    fmExLbl:{en:'Defensive examples right now:',th:'ตัวอย่างกลุ่มป้องกันความเสี่ยงตอนนี้:'},
    flowProfitP:{en:'This site does not forecast which group "wins" - nobody can know that in advance, and a confident percentage here would be a guess dressed up as data. What it can show is which sectors have the strongest price momentum right now (not a forecast of what comes next) - see "This month’s sector momentum" further down this page.',
                 th:'เว็บนี้ไม่ทำนายว่ากลุ่มไหนจะ "ชนะ" เพราะไม่มีใครรู้ล่วงหน้าได้จริงๆ และถ้าใส่เปอร์เซ็นต์แบบมั่นใจตรงนี้ก็จะเป็นแค่การเดาที่แต่งให้ดูเหมือนข้อมูล สิ่งที่โชว์ได้คือกลุ่มไหนมีแรงส่งราคาแรงที่สุดตอนนี้ (ไม่ใช่การทำนายว่าจะเป็นยังไงต่อ) ดูได้ที่หัวข้อ "แรงส่งราคาแต่ละกลุ่มอุตสาหกรรมเดือนนี้" ด้านล่างของหน้านี้'},
    flowProfitBtn:{en:'Jump to this month’s sector momentum ↓',th:'ไปที่แรงส่งราคาแต่ละกลุ่มเดือนนี้ ↓'},

    archH:{en:'What tends to get bought instead',th:'สิ่งที่มักถูกซื้อแทน'},
    archP:{en:'In this site’s own Stock Archetypes framework, "value" and "dividend" names are the ones that have historically attracted renewed interest once expensive growth stories fall out of favor - not a guarantee, just where that rotation has tended to land.',
           th:'ในกรอบ "หมวดหุ้น" ของเว็บนี้เอง หุ้นกลุ่ม value (คุณค่า) และ dividend (ปันผล) เป็นกลุ่มที่ในอดีตมักได้รับความสนใจกลับมา เมื่อหุ้นเติบโตราคาแพงเริ่มหมดความนิยม ไม่ใช่การรับประกัน แค่เป็นจุดที่การหมุนเงินแบบนี้เคยไปลงเอย'},
    valueLbl:{en:'Value stock examples',th:'ตัวอย่างหุ้นกลุ่ม Value'},
    divLbl:{en:'Dividend stock examples',th:'ตัวอย่างหุ้นกลุ่ม Dividend'},

    scenLead:{en:'Want to see one such unwind play out step by step?',th:'อยากเห็นสถานการณ์แบบนี้คลี่คลายไปทีละขั้นไหม'},
    scenLinkLabel:{en:'Open "Tech Bubble Bursts" in the Market Shock Simulator →',th:'เปิดสถานการณ์ "ฟองสบู่หุ้นเทคแตก" ในตัวจำลองแรงกระแทกตลาด →'}
  };

  var RISK_LABEL = [
    {max:35, en:'Low',th:'ต่ำ', cls:'risk-low'},
    {max:60, en:'Moderate',th:'ปานกลาง', cls:'risk-mod'},
    {max:80, en:'High',th:'สูง', cls:'risk-high'},
    {max:1e9, en:'Very high',th:'สูงมาก', cls:'risk-high'}
  ];
  function riskLabel(score){
    for (var i=0;i<RISK_LABEL.length;i++){ if (score <= RISK_LABEL[i].max) return RISK_LABEL[i]; }
    return RISK_LABEL[RISK_LABEL.length-1];
  }
  function riskColorVar(score){
    if (score >= 60) return 'var(--red)';
    if (score >= 35) return 'var(--amber)';
    return 'var(--neon-2,var(--neon))';
  }

  var SCALE_TIERS = [
    {lo:0,  hi:35,  cls:'risk-low',  nm:{en:'Low',th:'ต่ำ'},           d:'tierLow'},
    {lo:35, hi:60,  cls:'risk-mod',  nm:{en:'Moderate',th:'ปานกลาง'},  d:'tierMod'},
    {lo:60, hi:80,  cls:'risk-high', nm:{en:'High',th:'สูง'},          d:'tierHigh'},
    {lo:80, hi:100, cls:'risk-high', nm:{en:'Very high',th:'สูงมาก'},  d:'tierVHigh'}
  ];

  function pendingBannerHTML(primary, n){
    if (n >= 5) return '';
    var missing = primary.filter(function(d){ return d.tag === 'primary' && d.val == null; })
      .map(function(d){ return tx(d.nm); });
    if (!missing.length) return '';
    var body = tx(C.pendingBody).replace('{names}', joinList(missing)).replace('{n}', n);
    return '<div class="bb-pending"><span class="ic">⏳</span>' +
      '<span class="tx"><b>' + esc(tx(C.pendingLead)) + '</b> ' + esc(body) + '</span></div>';
  }

  var SCALE_TICKS = [0,10,20,30,40,50,60,70,80,90,100];
  function scaleBlockHTML(composite){
    var pos = composite == null ? null : clamp(composite, 0, 100);
    var bar = '<div class="bb-scalewrap">' +
      '<div class="bb-scalebar">' +
        (pos == null ? '' : '<div class="bb-scalefill" data-final-width="' + pos + '%"></div>') +
      '</div>' +
      (pos == null ? '' : '<div class="bb-scalepointer" data-final-left="' + pos + '%"></div>') +
      '</div>' +
      '<div class="bb-scaleticks">' + SCALE_TICKS.map(function(v){
        var major = (v === 0 || v === 50 || v === 100);
        return '<span style="left:' + v + '%"' + (major ? ' data-major="1"' : '') + '>' + v + '%</span>';
      }).join('') + '</div>';
    var rows = SCALE_TIERS.map(function(t){
      var active = pos != null && pos >= t.lo && pos <= t.hi;
      return '<div class="bb-scalerow' + (active ? ' active' : '') + '">' +
        '<span class="t">' + esc(tx(t.nm)) + '<span class="r">' + t.lo + '–' + t.hi + '%</span></span>' +
        '<span class="d">' + esc(tx(C[t.d])) + '</span></div>';
    }).join('');
    return '<div class="bb-scale">' +
      '<div class="bb-sec-h" style="margin-top:0;">' + esc(tx(C.scaleH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.scaleP)) + '</div>' +
      bar + '<div class="bb-scalerows">' + rows + '</div>' +
      '<div class="bb-scalefoot">' + esc(tx(C.scaleFoot)) + '</div>' +
    '</div>';
  }

  function flowMapSVG(){
    return '<svg viewBox="0 0 360 190" class="bb-fm-svg" role="img" aria-hidden="true">' +
      '<defs><marker id="bbArrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">' +
        '<path d="M0,0 L6,3 L0,6 Z" fill="var(--amber)"/></marker></defs>' +
      '<path class="bb-fm-path" marker-end="url(#bbArrow)" d="M120,96 C172,96 172,40 232,38"/>' +
      '<path class="bb-fm-path" marker-end="url(#bbArrow)" d="M120,96 C172,96 172,152 232,154"/>' +
      '<g class="bb-fm-node"><rect x="6" y="72" width="114" height="48" rx="8"/>' +
        '<text class="bb-fm-label" x="63" y="93" text-anchor="middle">' + esc(tx({en:'Growth & cyclical',th:'หุ้นเติบโต/วัฏจักร'})) + '</text>' +
        '<text class="bb-fm-sub" x="63" y="108" text-anchor="middle">' + esc(tx({en:'often sold first',th:'มักถูกขายก่อน'})) + '</text></g>' +
      '<g class="bb-fm-node"><rect x="234" y="12" width="122" height="48" rx="8"/>' +
        '<text class="bb-fm-label" x="295" y="33" text-anchor="middle">' + esc(tx({en:'Defensive sectors',th:'กลุ่มป้องกันความเสี่ยง'})) + '</text>' +
        '<text class="bb-fm-sub" x="295" y="48" text-anchor="middle">' + esc(tx({en:'historically falls less',th:'ในอดีตลงน้อยกว่า'})) + '</text></g>' +
      '<g class="bb-fm-node"><rect x="234" y="130" width="122" height="48" rx="8"/>' +
        '<text class="bb-fm-label" x="295" y="151" text-anchor="middle">' + esc(tx({en:'Cash, bonds & gold',th:'เงินสด พันธบัตร ทองคำ'})) + '</text>' +
        '<text class="bb-fm-sub" x="295" y="166" text-anchor="middle">' + esc(tx({en:'traditional safe havens',th:'สินทรัพย์ปลอดภัยดั้งเดิม'})) + '</text></g>' +
    '</svg>';
  }

  // ---- primary composite indicators ----
  function primaryDefs(bubble, regime){
    var cape = bubble && bubble.cape, mdebt = bubble && bubble.margin_debt,
        buff = bubble && bubble.buffett;
    return [
      { key:'cape', tag:'primary',
        nm:{en:'Shiller CAPE',th:'Shiller CAPE'},
        val: cape && isNum(cape.value) ? fmt(cape.value, 1) : null,
        risk: cape ? scaleRisk(cape.value, 15, 45) : null,
        date: cape && cape.date, stale: cape && cape.stale,
        hist: cape && cape.history,
        riskHist: riskHistOf(cape && cape.history, 15, 45),
        expl:{en:'How expensive US stocks are vs. 10 years of average earnings, inflation-adjusted. This high has only shown up around 1929, 2000 and 2021.',
              th:'หุ้นสหรัฐฯ แพงแค่ไหนเทียบกับกำไรเฉลี่ยย้อนหลัง 10 ปี (ปรับเงินเฟ้อ) ระดับสูงขนาดนี้เคยเกิดแค่ช่วงปี 1929, 2000 และ 2021'} },
      { key:'buffett', tag:'primary',
        nm:{en:'Buffett Indicator',th:'Buffett Indicator'},
        val: buff && isNum(buff.value_pct) ? fmt(buff.value_pct,0) + '%' : null,
        risk: buff ? scaleRisk(buff.value_pct, 80, 220) : null,
        date: buff && buff.date, stale: buff && buff.stale,
        hist: buff && buff.history,
        riskHist: riskHistOf(buff && buff.history, 80, 220),
        expl:{en:'Total US stock-market value against the whole economy (GDP). Buffett called it "probably the best single measure" of valuation. The free government data feed behind the classic version was discontinued in 2024, so this uses the closest free stand-in (nonfinancial-sector equities), which can run a touch below the original.',
              th:'มูลค่าตลาดหุ้นสหรัฐฯ ทั้งหมดเทียบกับขนาดเศรษฐกิจ (GDP) บัฟเฟตต์เคยเรียกว่าเป็นตัวชี้วัดมูลค่าที่ดีที่สุดตัวหนึ่ง แหล่งข้อมูลฟรีของภาครัฐที่ใช้คำนวณแบบดั้งเดิมถูกยกเลิกไปในปี 2024 จึงใช้ตัวทดแทนที่ใกล้เคียงที่สุด (มูลค่าหุ้นกลุ่มนอกภาคการเงิน) ซึ่งอาจต่ำกว่าตัวเลขดั้งเดิมเล็กน้อย'} },
      { key:'margin', tag:'primary',
        nm:{en:'Margin debt (YoY)',th:'หนี้มาร์จิ้น (YoY)'},
        val: mdebt && isNum(mdebt.yoy_pct) ? pctStr(mdebt.yoy_pct,1) : null,
        risk: mdebt ? scaleRisk(mdebt.yoy_pct, -10, 40) : null,
        date: mdebt && mdebt.date, stale: mdebt && mdebt.stale,
        hist: mdebt && mdebt.history,
        riskHist: riskHistOf(yoySeries(mdebt && mdebt.history), -10, 40),
        expl:{en:'How fast borrowing to buy stocks is growing. Debt itself is normal - debt growing far faster than the market has shown up right before 2000, 2008 and 2021.',
              th:'หนี้ที่กู้มาเล่นหุ้นโตเร็วแค่ไหน หนี้เองไม่ใช่เรื่องแปลก แต่หนี้ที่โตเร็วกว่าตลาดมากๆ เคยปรากฏก่อนตลาดร่วงปี 2000, 2008 และ 2021'} },
      { key:'breadth', tag:'primary',
        nm:{en:'Market breadth',th:'ความกว้างของตลาด'},
        val: regime && isNum(regime.breadth_200) ? fmt(regime.breadth_200,0)+'%' : null,
        risk: regime && isNum(regime.breadth_200) ? clamp((70-regime.breadth_200)/(70-30)*100,0,100) : null,
        date: null, stale:false, hist:null,
        expl:{en:'Share of tracked stocks actually in an uptrend, not just a handful of giants making headlines - a market carried by very few names is historically fragile. Higher is safer here, so once breadth is wide enough the risk score above floors at 0% - that means this signal is currently safe, not that data is missing.',
              th:'สัดส่วนหุ้นที่อยู่ในขาขึ้นจริงๆ ไม่ใช่แค่หุ้นใหญ่ไม่กี่ตัวที่ขึ้นข่าว ตลาดที่แบกด้วยหุ้นน้อยตัวมักเปราะบางในอดีต ค่านี้ยิ่งสูงยิ่งปลอดภัย พอความกว้างมากพอ คะแนนเสี่ยงด้านบนจะตกไปที่ 0% ซึ่งแปลว่าสัญญาณนี้ปลอดภัยอยู่ตอนนี้ ไม่ใช่ไม่มีข้อมูล'} },
      { key:'curve', tag:'primary',
        nm:{en:'Yield curve (10y-3m)',th:'เส้นผลตอบแทนพันธบัตร (10ปี-3ด.)'},
        val: regime && isNum(regime.curve_10y_3m) ? (regime.curve_10y_3m>=0?'+':'')+fmt(regime.curve_10y_3m,2)+'pt' : null,
        risk: regime && isNum(regime.curve_10y_3m) ? clamp((0.5-regime.curve_10y_3m)/(0.5-(-1.5))*100,0,100) : null,
        date: null, stale:false, hist:null,
        expl:{en:'Gap between long- and short-term US yields. Short paying more than long ("inverted") has preceded most US recessions historically, sometimes over a year later. A positive, normal-shaped curve is the safe reading, so the risk score floors at 0% here too - a healthy sign, not a missing one.',
              th:'ส่วนต่างผลตอบแทนพันธบัตรสหรัฐฯ ระยะยาวกับระยะสั้น ถ้าระยะสั้นให้ผลตอบแทนสูงกว่า (เรียกว่า "กลับด้าน") มักเกิดก่อนเศรษฐกิจถดถอยสหรัฐฯ แทบทุกครั้งในอดีต บางทีล่วงหน้าเป็นปี เส้นที่เป็นบวกแบบปกติ (ไม่กลับด้าน) คือค่าที่ปลอดภัย คะแนนเสี่ยงจึงตกไปที่ 0% เหมือนกัน เป็นสัญญาณที่ดี ไม่ใช่ข้อมูลหาย'} }
    ];
  }

  function supportDefs(regime, bubble){
    var vix = regime && regime.vix, curve_ok = regime;
    var pc = bubble && bubble.putcall;
    return [
      { nm:{en:'VIX (complacency read)',th:'VIX (วัดความประมาท)'},
        val: isNum(regime && regime.vix) ? fmt(regime.vix,1) : null,
        note: isNum(regime && regime.vix) ? (regime.vix < 14 ?
              {en:'Unusually calm',th:'สงบผิดปกติ'} : {en:'Normal-to-elevated',th:'ปกติถึงสูง'}) : null,
        expl:{en:'How much volatility options traders expect. A very LOW number for a long stretch can mean complacency - not pricing in much risk - which has sometimes preceded a shock.',
              th:'ตลาดคาดว่าความผันผวนจะมากแค่ไหน ถ้าตัวเลข ต่ำ ต่อเนื่องนานๆ อาจสะท้อนความประมาท ไม่ระวังความเสี่ยง ซึ่งบางครั้งเกิดก่อนเหตุการณ์ช็อกตลาด'} },
      { nm:{en:'Put/Call ratio (options positioning)',th:'อัตราส่วน Put/Call (สถานะออปชั่น)'},
        val: pc && isNum(pc.value) ? fmt(pc.value, 2) : null,
        note: pc && isNum(pc.value) ? (pc.value < 0.65 ?
              {en:'Notably low - heavy call-buying',th:'ต่ำผิดปกติ - แห่ซื้อคอลเยอะ'} :
              pc.value > 1.0 ? {en:'Elevated - hedging/fear',th:'สูง - ป้องกันความเสี่ยง/หวาดกลัว'} :
              {en:'Normal range',th:'อยู่ในช่วงปกติ'}) : null,
        date: pc && pc.date, stale: pc && pc.stale, hist: pc && pc.history,
        expl:{en:'Total US options volume: puts traded divided by calls, across the whole Cboe market that day. Reads the opposite way from most signals here - a very LOW ratio (far more calls than puts) means options traders are piling into upside bets, a classic complacency/greed read; a high ratio means more hedging or fear. Only recently added, so its history above builds up day by day rather than showing decades back like the signals above.',
              th:'ปริมาณซื้อขายออปชั่นทั้งตลาดของ Cboe วันนั้น เอาจำนวน put หารด้วย call อ่านกลับด้านจากสัญญาณส่วนใหญ่ในหน้านี้ - ถ้าค่า ต่ำ มาก (call เยอะกว่า put มาก) แปลว่านักลงทุนออปชั่นแห่เก็งกำไรขาขึ้น ซึ่งเป็นสัญญาณความโลภ/ประมาทแบบคลาสสิก ถ้าค่าสูงแปลว่ามีการป้องกันความเสี่ยงหรือความกลัวมากขึ้น เพิ่งเริ่มเก็บข้อมูลตัวนี้ไม่นาน ประวัติด้านบนจึงค่อยๆ สะสมทีละวัน ไม่ได้ย้อนหลังหลายสิบปีเหมือนสัญญาณด้านบน'} },
      { nm:{en:'Credit risk appetite',th:'ความกล้าเสี่ยงในตลาดหุ้นกู้'},
        val: isNum(regime && regime.credit_1m) ? pctStr(regime.credit_1m,1) : null,
        note: null,
        expl:{en:'Junk bonds (HYG) vs. investment-grade (LQD) this month. Junk outperforming by a lot means investors are chasing yield in the riskiest credit - a classic late-cycle behavior.',
              th:'หุ้นกู้ความเสี่ยงสูง (HYG) เทียบกับหุ้นกู้เกรดลงทุน (LQD) เดือนนี้ ถ้าหุ้นกู้เสี่ยงวิ่งแรงกว่ามาก แปลว่านักลงทุนไล่ผลตอบแทนในของเสี่ยงสุด ซึ่งเป็นพฤติกรรมช่วงปลายวัฏจักร'} },
      { nm:{en:'Risk-on rotation',th:'การหมุนเงินแบบกล้าเสี่ยง'},
        val: isNum(regime && regime.cyclical_vs_defensive_1m) ? pctStr(regime.cyclical_vs_defensive_1m,1) : null,
        note: null,
        expl:{en:'Cyclical/consumer-discretionary stocks vs. defensive/staples this month. Positive means money is favoring risk; negative means it’s favoring safety.',
              th:'หุ้นกลุ่มอ่อนไหวต่อเศรษฐกิจ เทียบกับกลุ่มปลอดภัย/จำเป็น เดือนนี้ ถ้าเป็นบวกแปลว่าเงินเลือกความเสี่ยง ถ้าติดลบแปลว่าเลือกความปลอดภัย'} },
      { nm:{en:'Small vs. large caps',th:'หุ้นเล็กเทียบหุ้นใหญ่'},
        val: isNum(regime && regime.smallcap_vs_market_1m) ? pctStr(regime.smallcap_vs_market_1m,1) : null,
        note: null,
        expl:{en:'Small caps (IWM) vs. the broad market this month. Small caps persistently lagging while a few giants carry the index is a common late-cycle pattern.',
              th:'หุ้นเล็ก (IWM) เทียบกับตลาดโดยรวมเดือนนี้ ถ้าหุ้นเล็กตามหลังต่อเนื่องขณะที่หุ้นใหญ่ไม่กี่ตัวแบกดัชนีไว้ เป็นรูปแบบที่พบบ่อยช่วงปลายวัฏจักร'} },
      { nm:{en:'Bearish momentum divergences',th:'ไดเวอร์เจนซ์ขาลง (โมเมนตัมอ่อนแรง)'},
        val: regime && regime.divergences ? String(regime.divergences.filter(function(d){ return d.kind === 'bearish'; }).length) : null,
        note: null,
        expl:{en:'How many tracked stocks/ETFs are currently making a higher price high while their RSI makes a lower high - momentum weakening even as price still climbs, which has often shown up before a rally loses steam. One or two is unremarkable; several appearing together across leading names is the more notable read.',
              th:'มีหุ้น/ETF ที่ติดตามอยู่กี่ตัว ที่ราคาทำจุดสูงใหม่แต่ RSI กลับทำจุดสูงต่ำกว่าเดิม (โมเมนตัมอ่อนแรงลงทั้งที่ราคายังขึ้น) ซึ่งเคยปรากฏก่อนแรงส่งขาขึ้นจะเริ่มหมด เจอแค่ 1-2 ตัวถือว่าปกติ แต่ถ้าเจอพร้อมกันหลายตัวในหุ้นกลุ่มนำตลาดคือสัญญาณที่น่าสนใจกว่า'} }
    ];
  }

  var DEFENSIVE_SECTORS = {'Utilities':1,'Healthcare':1,'Consumer Defensive':1};
  var CYCLICAL_SECTORS = {'Technology':1,'Communication Services':1,'Consumer Cyclical':1,
                           'Financial Services':1,'Industrials':1,'Basic Materials':1,
                           'Energy':1,'Real Estate':1};

  var BURST_SIGNS = [
    {en:'Stock prices look expensive by historical yardsticks (CAPE, P/E, Buffett Indicator near record highs) - see the 5 signals above.',
     th:'ราคาหุ้นแพงเมื่อเทียบกับมาตรฐานในอดีต (CAPE, P/E, Buffett Indicator ขึ้นไปใกล้จุดสูงสุดในประวัติศาสตร์) - ดู 5 สัญญาณด้านบน',
     check:{type:'cape_buffett'}},
    {en:'Inflation runs hot enough that central banks are actively raising interest rates to cool it down.',
     th:'เงินเฟ้อสูงจนธนาคารกลางต้องขึ้นดอกเบี้ยเพื่อสกัดมันอย่างจริงจัง',
     check:{type:'nodata'}},
    {en:'A handful of giant "story" stocks carry the whole index while most other stocks quietly lag behind (narrow breadth).',
     th:'หุ้นเรื่องเล่าตัวใหญ่ไม่กี่ตัวแบกดัชนีทั้งตลาดไว้ ขณะที่หุ้นส่วนใหญ่แอบตามหลังเงียบๆ (ความกว้างของตลาดแคบ)',
     check:{type:'risk', key:'breadth'}},
    {en:'Borrowing to buy stocks (margin debt) is growing much faster than the market itself.',
     th:'หนี้ที่กู้มาเล่นหุ้น (มาร์จิ้น) โตเร็วกว่าตัวตลาดเองอย่างเห็นได้ชัด',
     check:{type:'risk', key:'margin'}},
    {en:'Volatility looks unusually calm and "this time is different" talk is everywhere - a sign of complacency, not of safety.',
     th:'ความผันผวนดูสงบผิดปกติ และคำพูดแบบ "รอบนี้ไม่เหมือนเดิม" ได้ยินอยู่ทั่วไป - เป็นสัญญาณของความประมาท ไม่ใช่ความปลอดภัย',
     check:{type:'vix'}},
    {en:'Speculative corners of the market heat up fast - meme-stock rallies, crowded IPOs, "everyone I know is trading" chatter.',
     th:'มุมเก็งกำไรของตลาดร้อนแรงขึ้นเร็ว หุ้นกระแส/มีมหุ้นพุ่งแรง IPO คึกคักผิดปกติ กระแส "ใครๆ ก็เทรดกันหมด"',
     check:{type:'nodata'}},
    {en:'Riskier borrowers (junk-bond issuers) can suddenly borrow almost as cheaply as safe ones - credit standards have gone loose.',
     th:'ผู้กู้ความเสี่ยงสูง (ผู้ออกหุ้นกู้ junk) กู้เงินได้ถูกเกือบเท่าผู้กู้ปลอดภัย - มาตรฐานการปล่อยสินเชื่อหย่อนลง',
     check:{type:'credit'}},
    {en:'Short-term bonds paid more than long-term ones (an inverted yield curve) at some point earlier in the cycle.',
     th:'พันธบัตรระยะสั้นเคยให้ผลตอบแทนสูงกว่าระยะยาว (เส้นผลตอบแทนกลับด้าน) ในบางช่วงก่อนหน้านี้ของวัฏจักร',
     check:{type:'risk', key:'curve'}}
  ];

  /* live "is this actually true right now, and by how much" read for each
     BURST_SIGNS row - reuses the exact same 0-100% risk scores the cards
     above already show, so the checklist and the score stay consistent.
     Items with no matching free data source (inflation/rate policy,
     meme-stock/IPO frenzy) say so plainly instead of guessing. */
  function burstRiskChip(risk){
    var cls = risk >= 60 ? 'hot' : (risk >= 35 ? 'warm' : 'cool');
    var lbl = risk >= 60 ? {en:'matches right now',th:'เข้าเกณฑ์นี้อยู่ตอนนี้'}
            : risk >= 35 ? {en:'partly stretched',th:'เริ่มตึงบางส่วน'}
            : {en:'not there yet',th:'ยังไม่เข้าเกณฑ์นี้'};
    return { cls:cls, val: Math.round(risk) + '%', label: tx(lbl) };
  }
  function burstNoData(){
    return { cls:'nodata', val:null, label: tx({en:'no data yet',th:'ยังไม่มีข้อมูล'}) };
  }
  function burstStatus(sign, primByKey, regime){
    var c = sign.check || {};
    if (c.type === 'nodata') {
      return { cls:'nodata', val:null, label: tx({en:'no live data to check automatically',th:'ไม่มีข้อมูลสดให้เช็คอัตโนมัติ'}) };
    }
    if (c.type === 'cape_buffett') {
      var cd = primByKey.cape, bd = primByKey.buffett;
      var risks = [cd && cd.risk, bd && bd.risk].filter(isNum);
      if (!risks.length) return burstNoData();
      return burstRiskChip(risks.reduce(function(a,b){ return a + b; }, 0) / risks.length);
    }
    if (c.type === 'risk') {
      var d = primByKey[c.key];
      if (!d || !isNum(d.risk)) return burstNoData();
      return burstRiskChip(d.risk);
    }
    if (c.type === 'vix') {
      var v = regime && regime.vix;
      if (!isNum(v)) return burstNoData();
      var calm = v < 14;
      return { cls: calm ? 'hot' : 'cool', val: 'VIX ' + fmt(v, 1),
        label: tx(calm ? {en:'unusually calm right now',th:'ต่ำผิดปกติตอนนี้'}
                        : {en:'normal-to-elevated right now',th:'ปกติถึงสูงตอนนี้'}) };
    }
    if (c.type === 'credit') {
      var cr = regime && regime.credit_1m;
      if (!isNum(cr)) return burstNoData();
      var cls2 = cr >= 2 ? 'hot' : (cr <= -2 ? 'cool' : 'warm');
      var lbl2 = cr >= 2 ? {en:'junk debt running hot right now',th:'หุ้นกู้เสี่ยงร้อนแรงตอนนี้'}
               : cr <= -2 ? {en:'credit looks cautious right now',th:'ตลาดสินเชื่อระมัดระวังตอนนี้'}
               : {en:'roughly neutral right now',th:'ค่อนข้างเป็นกลางตอนนี้'};
      return { cls:cls2, val: pctStr(cr, 1), label: tx(lbl2) };
    }
    return burstNoData();
  }

  function sparkline(hist, w, h){
    if (!hist || hist.length < 2) return '';
    var vals = hist.map(function(p){ return p.v; }).filter(isNum);
    if (vals.length < 2) return '';
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var rng = (hi - lo) || 1, n = vals.length;
    var pts = vals.map(function(v,i){
      var x = (i/(n-1))*w, y = h - ((v-lo)/rng)*h;
      return x.toFixed(1)+','+y.toFixed(1);
    }).join(' ');
    var last = vals[n-1], lastY = (h - ((last-lo)/rng)*h).toFixed(1);
    return '<svg class="bb-spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">' +
      '<polyline points="'+pts+'" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="'+w+'" cy="'+lastY+'" r="2.4" fill="currentColor"/>' +
    '</svg>';
  }

  function yoySeries(hist){
    // hist: [{t:'YYYY-MM', v: raw level}], ascending monthly. Turns a raw
    // level series (like margin debt's history) into a trailing 12-month
    // % change series, since that - not the level - is what's risk-scored.
    if (!hist || hist.length <= 12) return null;
    var out = [];
    for (var i = 12; i < hist.length; i++){
      var cur = hist[i], prev = hist[i - 12];
      if (isNum(cur && cur.v) && isNum(prev && prev.v) && prev.v){
        out.push({ t: cur.t, v: (cur.v - prev.v) / prev.v * 100 });
      }
    }
    return out.length > 1 ? out : null;
  }

  function riskHistOf(hist, lo, hi){
    // Runs each historical raw value through the exact same 0-100% risk
    // scale used for the current/latest value, so "is the risk trending
    // up" can be read straight off one consistent axis regardless of the
    // indicator's own native units.
    if (!hist) return null;
    var out = hist.map(function(p){
      return isNum(p.v) ? { t: p.t, v: scaleRisk(p.v, lo, hi) } : null;
    }).filter(Boolean);
    return out.length > 1 ? out : null;
  }

  function riskChart(hist, w, h){
    if (!hist || hist.length < 2) return '';
    var vals = hist.map(function(p){ return p.v; });
    var n = vals.length;
    var pts = vals.map(function(v,i){
      var x = (i/(n-1))*w, y = h - (clamp(v,0,100)/100)*h;
      return x.toFixed(1)+','+y.toFixed(1);
    }).join(' ');
    var last = vals[n-1], lastY = (h - (clamp(last,0,100)/100)*h).toFixed(1);
    var color = riskColorVar(last);
    var areaD = 'M0,'+h+' L'+pts.replace(/ /g,' L')+' L'+w+','+h+' Z';
    var grid = [0,50,100].map(function(pct){
      var y = (h - (pct/100)*h).toFixed(1);
      return '<line x1="0" y1="'+y+'" x2="'+w+'" y2="'+y+'" stroke="var(--border-dim)" stroke-width="1" stroke-dasharray="2,3"/>';
    }).join('');
    return '<svg class="bb-riskspark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="color:'+color+'">' +
      grid +
      '<path d="'+areaD+'" fill="currentColor" fill-opacity="0.12" stroke="none"/>' +
      '<polyline points="'+pts+'" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="'+w+'" cy="'+lastY+'" r="2.6" fill="currentColor"/>' +
    '</svg>';
  }

  function bubbleHistKey(){
    var d = new Date();
    return 'spz.bubbleHist.' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function pushBubbleHistory(v){
    if (!isNum(v)) return [];
    try {
      var key = bubbleHistKey();
      var raw = localStorage.getItem(key);
      var hist = raw ? JSON.parse(raw) : [];
      var now = Date.now();
      var last = hist.length ? hist[hist.length - 1] : null;
      var should = !last || (now - last.ts >= 10 * 60 * 1000) || Math.abs(last.v - v) >= 1;
      if (should) {
        var d = new Date();
        hist.push({ t: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), v: v, ts: now });
        if (hist.length > 96) hist = hist.slice(hist.length - 96);
        localStorage.setItem(key, JSON.stringify(hist));
      }
      return hist;
    } catch (e) { return []; }
  }

  function riskChartBlockHTML(riskHist){
    if (!riskHist || riskHist.length < 2) return '';
    var span = riskHist[0].t + ' → ' + riskHist[riskHist.length - 1].t;
    return '<div class="bb-riskchart">' +
      '<div class="bb-riskchart-row">' +
        '<div class="bb-riskchart-axis"><span>100%</span><span>50%</span><span>0%</span></div>' +
        riskChart(riskHist, 260, 56) +
      '</div>' +
      '<div class="bb-riskchart-cap">' + esc(tx(C.riskHistLabel)) + ' · ' + esc(span) + '</div>' +
    '</div>';
  }

  function gaugeSVG(){
    var cx = 85, cy = 85, r = 52, START = -135, SWEEP = 270;
    function gDeg(s){ return START + (s / 100) * SWEEP; }
    function gPt(rad_, deg){
      var a = deg * Math.PI / 180;
      return { x: (cx + rad_ * Math.sin(a)).toFixed(2), y: (cy - rad_ * Math.cos(a)).toFixed(2) };
    }
    function gArc(rad_, d0, d1){
      var p0 = gPt(rad_, d0), p1 = gPt(rad_, d1);
      var large = Math.abs(d1 - d0) > 180 ? 1 : 0;
      return 'M ' + p0.x + ' ' + p0.y + ' A ' + rad_ + ' ' + rad_ + ' 0 ' + large + ' 1 ' + p1.x + ' ' + p1.y;
    }
    var bg = '<defs><linearGradient id="bbNebula" gradientUnits="userSpaceOnUse" x1="20" y1="150" x2="150" y2="20">' +
      '<stop offset="0%" stop-color="#0a84ff"/>' +
      '<stop offset="25%" stop-color="#5e5ce6"/>' +
      '<stop offset="55%" stop-color="#bf5af2"/>' +
      '<stop offset="80%" stop-color="#ff375f"/>' +
      '<stop offset="100%" stop-color="#ff453a"/>' +
    '</linearGradient></defs>' +
    '<path d="' + gArc(r, START, START + SWEEP) + '" fill="none" stroke="url(#bbNebula)" stroke-width="11" opacity=".38"/>';

    var ticks = '';
    for (var t = 0; t <= 100; t += 10){
      var major = (t === 0 || t === 50 || t === 100);
      var p1 = gPt(r + 7, gDeg(t)), p2 = gPt(major ? r + 15 : r + 11, gDeg(t));
      ticks += '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y +
        '" stroke="var(--grey-dim)" stroke-width="' + (major ? 1.6 : 1) + '"/>';
      if (major){
        var lp = gPt(r + 25, gDeg(t));
        ticks += '<text x="' + lp.x + '" y="' + (parseFloat(lp.y) + 3).toFixed(2) +
          '" text-anchor="middle" font-size="9" font-family="var(--mono)" fill="var(--grey-dim)">' + t + '</text>';
      }
    }

    var full = r * (SWEEP * Math.PI / 180);
    var arcD = gArc(r, START, START + SWEEP);
    var needleTip = gPt(r - 8, START);

    return '<svg class="bb-gauge" viewBox="0 0 170 170">' +
      bg + ticks +
      '<path d="' + arcD + '" fill="none" stroke="url(#bbNebula)" stroke-width="11" stroke-linecap="round" ' +
        'stroke-dasharray="0 ' + full.toFixed(2) + '" class="bb-gauge-arc" data-full="' + full.toFixed(2) + '"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + needleTip.x + '" y2="' + needleTip.y + '" stroke="var(--white)" ' +
        /* Round S: percentage-based, not a fixed px value tied to the old
           168px render size - so the gauge can be sized bigger by CSS alone
           (see .bb-gauge in part-22.css) without the needle's rotation
           pivoting around the wrong point. cx/cy (85,85) is exactly the
           center of the 170x170 viewBox either way. */
        'stroke-width="2.6" stroke-linecap="round" class="bb-gauge-needle" style="transform-origin:50% 50%;"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--white)" class="bb-gauge-hub"/>' +
      '<circle r="3" fill="#fff" class="bb-gauge-scan"><animateMotion dur="4.5s" repeatCount="indefinite" path="' + arcD + '"/></circle>' +
    '</svg>';
  }

  function radarSVG(scores){
    var cx=90, cy=90, R=68, N=scores.length;
    function ang(i){ return -Math.PI/2 + i*(2*Math.PI/N); }
    var rings = [0.25,0.5,0.75,1].map(function(f){
      var pts=[];
      for (var i=0;i<N;i++){ var a=ang(i); pts.push((cx+R*f*Math.cos(a)).toFixed(1)+','+(cy+R*f*Math.sin(a)).toFixed(1)); }
      return '<polygon points="'+pts.join(' ')+'" fill="none" stroke="var(--border-dim)" stroke-width="1"/>';
    }).join('');
    var axes = '';
    for (var i=0;i<N;i++){ var a=ang(i);
      axes += '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R*Math.cos(a)).toFixed(1)+'" y2="'+(cy+R*Math.sin(a)).toFixed(1)+'" stroke="var(--border-dim)" stroke-width="1"/>';
    }
    var poly0 = [], polyF = [];
    for (i=0;i<N;i++){
      var a2=ang(i), s = scores[i]==null?0:scores[i];
      poly0.push(cx.toFixed(1)+','+cy.toFixed(1));
      var rr = R*(clamp(s,0,100)/100);
      polyF.push((cx+rr*Math.cos(a2)).toFixed(1)+','+(cy+rr*Math.sin(a2)).toFixed(1));
    }
    var dots = scores.map(function(s,i){
      var a3=ang(i), rr = R*(clamp(s==null?0:s,0,100)/100);
      return '<circle cx="'+(cx+rr*Math.cos(a3)).toFixed(1)+'" cy="'+(cy+rr*Math.sin(a3)).toFixed(1)+'" r="3" fill="var(--white)"/>';
    }).join('');
    return '<svg class="bb-radar" viewBox="0 0 180 180">' + rings + axes +
      '<polygon points="'+poly0.join(' ')+'" fill="var(--neon)" fill-opacity="0.18" stroke="var(--neon)" stroke-width="2" ' +
        'class="bb-radar-shape" data-final="'+esc(polyF.join(' '))+'"/>' + dots + '</svg>';
  }

  var sec, state = { bubble:null };

  function loadBubble(cb){
    fetch('data/bubble.json?v=' + Math.floor(Date.now()/60000))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ state.bubble = d || {}; announceBubble(); if (cb) cb(); })
      .catch(function(){ state.bubble = state.bubble || {}; announceBubble(); if (cb) cb(); });
  }

  /* lets the status bar (a separate, earlier-loaded module) show when
     this data last updated without polling data/bubble.json itself */
  function announceBubble(){
    try { document.dispatchEvent(new CustomEvent('spz:bubbleData')); } catch (e) {}
  }

  function liveSnap(){
    var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
    return s || {};
  }

  function cardHTML(d){
    var risk = d.risk;
    var cls = risk == null ? '' : riskLabel(risk).cls;
    var body = '<div class="bb-card ' + (d.tag==='primary'?'primary ':'') + cls + '">' +
      '<span class="tag">' + (d.tag==='primary' ? esc(tx({en:'core score',th:'ใช้คำนวณคะแนน'})) : esc(tx({en:'context',th:'ข้อมูลประกอบ'}))) + '</span>' +
      '<div class="top"><span class="nm">' + esc(tx(d.nm)) + '</span></div>';
    if (d.val == null) {
      body += '<div class="bb-nodata">' + esc(tx(C.nodata)) + '</div>';
    } else {
      body += '<span class="val">' + esc(d.val) + '</span>';
      if (d.date) body += '<span class="sub">' + esc(tx(C.asOf)) + ' ' + esc(d.date) + '</span>';
      if (d.stale) body += '<span class="stale">' + esc(tx(C.stale)) + '</span>';
      if (d.hist && d.hist.length > 1) body += sparkline(d.hist, 220, 34);
      body += riskChartBlockHTML(d.riskHist);
    }
    body += '<div class="expl">' + esc(tx(d.expl)) + '</div></div>';
    return body;
  }

  function supportCardHTML(d){
    var body = '<div class="bb-card">' +
      '<span class="tag">' + esc(tx({en:'context',th:'ข้อมูลประกอบ'})) + '</span>' +
      '<div class="top"><span class="nm">' + esc(tx(d.nm)) + '</span></div>';
    if (d.val == null) {
      body += '<div class="bb-nodata">' + esc(tx(C.nodata)) + '</div>';
    } else {
      body += '<span class="val">' + esc(d.val) + (d.note ? ' <span class="sub">(' + esc(tx(d.note)) + ')</span>' : '') + '</span>';
      if (d.date) body += '<span class="sub">' + esc(tx(C.asOf)) + ' ' + esc(d.date) + '</span>';
      if (d.stale) body += '<span class="stale">' + esc(tx(C.stale)) + '</span>';
      if (d.hist && d.hist.length > 1) body += sparkline(d.hist, 220, 34);
    }
    body += '<div class="expl">' + esc(tx(d.expl)) + '</div></div>';
    return body;
  }

  function flowRowHTML(row, maxAbs, rank){
    var m1 = row.m1;
    var up = isNum(m1) && m1 >= 0;
    var w = isNum(m1) && maxAbs > 0 ? clamp(Math.abs(m1) / maxAbs * 50, 0, 50) : 0;
    return '<div class="bb-flowrow' + (rank < 3 && up ? ' hot' : '') + '">' +
      '<span class="nm">' + esc(tx(row)) + '</span>' +
      '<div class="bb-flowtrack"><div class="bb-flowfill ' + (up?'up':'dn') + '" data-w="' + w.toFixed(2) + '" data-up="' + (up?1:0) + '"></div></div>' +
      '<span class="bb-flowval ' + (up?'up':'dn') + '">' + pctStr(m1,1) + '</span>' +
    '</div>';
  }

  function cleanName(t, name){
    // upstream .BK names sometimes come through as "TICKER_Real Name" (a
    // yfinance quirk for Thai tickers) - strip the duplicated ticker prefix
    // so the chip doesn't read as "GULF GULF_GULF DEVELOPMENT".
    if (!name) return '';
    var n = String(name), p = t + '_';
    if (n.slice(0, p.length).toUpperCase() === p.toUpperCase()) n = n.slice(p.length);
    return n;
  }

  function tickerChip(t, s){
    var nm = s && s.name ? cleanName(t, s.name) : '';
    return '<button type="button" class="bb-tk" data-bb-open="' + esc(t) + '">' + esc(t) +
      (nm ? '<span class="n">' + esc(nm.slice(0,24)) + '</span>' : '') + '</button>';
  }

  function eduBucket(stocks, table){
    var out = [];
    for (var t in stocks){
      var s = stocks[t];
      if (s && s.sector && table[s.sector]) out.push([t, s]);
    }
    out.sort(function(a,b){ return (b[1].mcap||0) - (a[1].mcap||0); });
    return out.slice(0, 16);   // Round S: was 8 - this site tracks far more
                                // than 8 stocks per bucket now, so the old
                                // cap was hiding real coverage, not avoiding
                                // clutter (the chip grid wraps fine either way)
  }

  function paint(){
    if (!sec) return;
    var body = sec.querySelector('[data-bb="body"]');
    if (!body) return;
    sec.querySelector('[data-bb="eb"]').textContent = tx(C.eyebrow);
    sec.querySelector('[data-bb="h"]').textContent = tx(C.h);
    sec.querySelector('[data-bb="lede"]').textContent = tx(C.lede);
    sec.querySelector('[data-bb="disc"]').innerHTML = tx(C.disclaimer);

    var snap = liveSnap();
    var regime = snap.regime || {};
    var stocks = snap.stocks || {};
    var flowsSector = (snap.flows && snap.flows.sector) || [];
    var bubble = state.bubble || {};

    var primary = primaryDefs(bubble, regime);
    var support = supportDefs(regime, bubble);

    var risks = primary.map(function(d){ return d.risk; }).filter(isNum);
    var n = risks.length;
    var composite = n ? Math.round(risks.reduce(function(a,b){return a+b;},0) / n) : null;
    var rl = composite == null ? {en:'—',th:'—',cls:''} : riskLabel(composite);
    var color = composite == null ? 'var(--grey)' : riskColorVar(composite);
    var bubbleHist = pushBubbleHistory(composite);
    var histBlock = bubbleHist.length >= 2 ?
      '<div class="bb-todayhist">' + riskChart(bubbleHist, 150, 40) +
        '<div class="bb-todayhist-cap">' + esc(tx({en:'today’s high/low',th:'สูงสุด/ต่ำสุดวันนี้'})) + '</div>' +
      '</div>' : '';

    var top =
      '<div class="bb-top">' +
        '<div class="bb-gaugebox">' + gaugeSVG() +
          '<div class="bb-gaugenum"><span class="n" style="color:' + color + '">' + (composite==null?'—':composite) + '%</span>' +
          '<span class="u">' + esc(tx({en:'bubble score',th:'คะแนนฟองสบู่'})) + '</span></div>' +
          histBlock +
        '</div>' +
        '<div class="bb-toptext">' +
          '<span class="lbl" style="color:' + color + '">' + esc(tx(rl)) + '</span>' +
          '<p>' + esc(tx(C.lede)) + '</p>' +
          '<div class="bb-cov">' + esc(n===5 ? tx(C.covFull) : tx(C.covPart).replace('{n}', n)) + '</div>' +
        '</div>' +
      '</div>';

    var pendingBanner = pendingBannerHTML(primary, n);
    var scaleBlock = scaleBlockHTML(composite);

    var radarBox =
      '<div class="bb-radarbox">' + radarSVG(primary.map(function(d){return d.risk;})) +
        '<div class="bb-radarlegend">' +
          primary.map(function(d){
            var inv = (d.key === 'breadth' || d.key === 'curve');
            return '<div class="row"><span>' + esc(tx(d.nm)) +
              (inv ? '<i class="bb-radar-inv" title="' + esc(tx(C.radarInvTip)) + '">ⓘ</i>' : '') + '</span>' +
              '<span style="color:' + (d.risk==null?'var(--grey)':riskColorVar(d.risk)) + '">' +
              (d.risk==null ? '—' : Math.round(d.risk) + '%') + '</span></div>';
          }).join('') +
          '<div class="bb-radarnote">' + tx(C.radarNote) + '</div>' +
        '</div>' +
      '</div>';

    var primaryBlock =
      '<div class="bb-sec-h">' + esc(tx(C.primaryH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.primaryP)) + '</div>' +
      '<div class="bb-grid">' + primary.map(cardHTML).join('') + '</div>';

    var supportBlock =
      '<div class="bb-sec-h">' + esc(tx(C.supportH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.supportP)) + '</div>' +
      '<div class="bb-grid">' + support.map(supportCardHTML).join('') + '</div>';

    var sortedFlow = flowsSector.slice().sort(function(a,b){ return (b.m1||-999) - (a.m1||-999); });
    var maxAbs = sortedFlow.reduce(function(m,r){ return Math.max(m, Math.abs(r.m1||0)); }, 1);
    var flowBlock =
      '<div class="bb-sec-h">' + esc(tx(C.flowH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.flowP)) + '</div>' +
      (sortedFlow.length
        ? '<div class="bb-flow">' + sortedFlow.map(function(r,i){ return flowRowHTML(r, maxAbs, i); }).join('') + '</div>'
        : '<div class="bb-nodata">' + esc(tx(C.nodata)) + '</div>');

    var defList = eduBucket(stocks, DEFENSIVE_SECTORS);
    var cycList = eduBucket(stocks, CYCLICAL_SECTORS);
    var dir = window.__SPZ_DIR || {};
    var valueEx = (dir.value || []).slice(0, 6);
    var divEx = (dir.dividend || []).slice(0, 6);

    var primByKey = {};
    primary.forEach(function(d){ primByKey[d.key] = d; });

    var burstBlock =
      '<div class="bb-burst"><div class="bb-sec-h" style="margin-top:18px;font-size:12.5px;">' + esc(tx(C.burstH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.burstP)) + '</div>' +
      '<ul class="bb-burstlist">' + BURST_SIGNS.map(function(x){
        var st = burstStatus(x, primByKey, regime);
        return '<li><span class="txt">' + esc(tx(x)) + '</span>' +
          '<span class="stat ' + st.cls + '">' + (st.val ? esc(st.val) + ' &middot; ' : '') + esc(st.label) + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="bb-burstfoot">' + esc(tx(C.burstFoot)) + '</div></div>';

    var archBlock = (valueEx.length || divEx.length) ?
      '<div class="bb-arch"><div class="bb-sec-h" style="margin-top:22px;font-size:12.5px;">' + esc(tx(C.archH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.archP)) + '</div>' +
      '<div class="bb-archgrid">' +
        '<div class="bb-archbox"><h4>' + esc(tx(C.valueLbl)) + '</h4><div class="bb-tickers">' +
          valueEx.map(function(s){ return '<button type="button" class="bb-tk" data-bb-open="' + esc(s.ticker) + '">' + esc(s.ticker) + '</button>'; }).join('') +
        '</div></div>' +
        '<div class="bb-archbox"><h4>' + esc(tx(C.divLbl)) + '</h4><div class="bb-tickers">' +
          divEx.map(function(s){ return '<button type="button" class="bb-tk" data-bb-open="' + esc(s.ticker) + '">' + esc(s.ticker) + '</button>'; }).join('') +
        '</div></div>' +
      '</div></div>' : '';

    var eduBlock =
      '<div class="bb-sec-h">' + esc(tx(C.eduH)) + '</div>' +
      '<div class="bb-sec-p">' + esc(tx(C.eduP)) + '</div>' +
      burstBlock +
      '<div class="bb-flowmap"><div class="bb-sec-h" style="margin-top:0;font-size:12.5px;">' + esc(tx(C.flowmapH)) + '</div>' +
        flowMapSVG() +
        (defList.length ? '<div class="bb-fm-examples"><span class="lbl">' + esc(tx(C.fmExLbl)) + '</span>' +
          defList.slice(0,6).map(function(x){ return tickerChip(x[0], x[1]); }).join('') + '</div>' : '') +
        '<div class="bb-fm-profit"><p>' + esc(tx(C.flowProfitP)) + '</p>' +
          '<button type="button" id="bbJumpMomentum" class="bb-fm-jumpbtn">' + esc(tx(C.flowProfitBtn)) + '</button></div>' +
      '</div>' +
      '<div class="bb-edu">' +
        '<div class="bb-edubox lose"><span class="icon">' + esc(tx(C.loseIcon)) + '</span>' +
          '<h4>' + esc(tx(C.cycH)) + '</h4><p>' + tx(C.cycP) + '</p>' +
          '<div class="bb-tickers">' + (cycList.length ? cycList.map(function(x){ return tickerChip(x[0], x[1]); }).join('')
            : '<span class="bb-nodata">' + esc(tx(C.nodata)) + '</span>') + '</div></div>' +
        '<div class="bb-edubox hold"><span class="icon">' + esc(tx(C.holdIcon)) + '</span>' +
          '<h4>' + esc(tx(C.defH)) + '</h4><p>' + tx(C.defP) + '</p>' +
          '<div class="bb-tickers">' + (defList.length ? defList.map(function(x){ return tickerChip(x[0], x[1]); }).join('')
            : '<span class="bb-nodata">' + esc(tx(C.nodata)) + '</span>') + '</div></div>' +
        '<div class="bb-edubox haven"><span class="icon">' + esc(tx(C.havenIcon)) + '</span>' +
          '<h4>' + esc(tx(C.safeH)) + '</h4><p>' + esc(tx(C.safeP)) + '</p>' +
          '<div class="bb-havenlist">' +
            '<div class="bb-havenrow"><span class="cat">' + esc(tx(C.havenCash)) + '</span><span class="tks">BIL · SHV</span></div>' +
            '<div class="bb-havenrow"><span class="cat">' + esc(tx(C.havenBond)) + '</span><span class="tks">TLT · IEF</span></div>' +
            '<div class="bb-havenrow"><span class="cat">' + esc(tx(C.havenGold)) + '</span><span class="tks">GLD · IAU</span></div>' +
          '</div></div>' +
      '</div>' +
      archBlock +
      '<div class="bb-scenlink"><p>' + esc(tx(C.scenLead)) + '</p>' +
        '<button type="button" id="bbToScenario" class="bb-scenbtn">' + esc(tx(C.scenLinkLabel)) + '</button></div>';

    body.innerHTML = top + pendingBanner + scaleBlock + '<div class="bb-sec-h">' + esc(tx(C.radarH)) + '</div>' + radarBox +
      primaryBlock + supportBlock + '<div id="bbFlowBlock">' + flowBlock + '</div>' + eduBlock;

    // animate the gauge arc and radar shape in on next frame
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        var arc = body.querySelector('.bb-gauge-arc');
        if (arc && composite != null) {
          var full = parseFloat(arc.getAttribute('data-full'));
          arc.setAttribute('stroke-dasharray', (full * composite / 100).toFixed(1) + ' ' + full.toFixed(1));
        }
        var needle = body.querySelector('.bb-gauge-needle');
        if (needle && composite != null) {
          needle.style.transform = 'rotate(' + (composite / 100 * 270).toFixed(2) + 'deg)';
        }
        var shape = body.querySelector('.bb-radar-shape');
        if (shape) {
          var fin = shape.getAttribute('data-final');
          if (fin) shape.setAttribute('points', fin);
        }
        var ptr = body.querySelector('.bb-scalepointer');
        if (ptr) {
          var pfin = ptr.getAttribute('data-final-left');
          if (pfin) ptr.style.left = pfin;
        }
        var sfill = body.querySelector('.bb-scalefill');
        if (sfill) {
          var sfin = sfill.getAttribute('data-final-width');
          if (sfin) {
            var sfPos = parseFloat(sfin);
            sfill.style.width = sfin;
            sfill.style.backgroundSize = (sfPos > 0 ? (10000 / sfPos).toFixed(1) : 100) + '% 100%';
          }
        }
        var fills = body.querySelectorAll('.bb-flowfill');
        for (var i=0;i<fills.length;i++){
          var f = fills[i], w = parseFloat(f.getAttribute('data-w')) || 0, up = f.getAttribute('data-up') === '1';
          f.style.width = w + '%';
          f.style.left = up ? '50%' : (50 - w) + '%';
        }
      });
    });

    var openBtns = body.querySelectorAll('[data-bb-open]');
    for (var i=0;i<openBtns.length;i++){
      openBtns[i].addEventListener('click', function(){
        var t = this.getAttribute('data-bb-open');
        if (window.__SPZ_STOCK && window.__SPZ_STOCK.open) window.__SPZ_STOCK.open(t);
      });
    }

    var jumpBtn = body.querySelector('#bbJumpMomentum');
    if (jumpBtn) jumpBtn.addEventListener('click', function(){
      var target = document.getElementById('bbFlowBlock');
      if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
    var scenBtn = body.querySelector('#bbToScenario');
    if (scenBtn) scenBtn.addEventListener('click', function(){
      if (window.__SPZ_SCENARIOS && window.__SPZ_SCENARIOS.open) window.__SPZ_SCENARIOS.open(15);
      else location.hash = '/scenarios';
    });
  }

  function build(){
    if (document.getElementById('bubble')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'bubble';
    sec.setAttribute('data-route', 'bubble');
    sec.innerHTML =
      '<div class="bb-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-bb="eb"></span></div>' +
          '<h2 data-bb="h"></h2>' +
          '<p class="lede" data-bb="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div class="bb-disclaimer" data-bb="disc"></div>' +
        '<div data-bb="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'bubble', after:'watchlist',
      t:{en:'Bubble Radar',th:'เรดาร์ฟองสบู่'},
      d:{en:'Five valuation and leverage signals blended into one score, plus breadth, credit and sector-momentum context - an educational framework, not a prediction.',
         th:'สัญญาณด้านมูลค่าและหนี้ 5 ตัวรวมเป็นคะแนนเดียว พร้อมข้อมูลความกว้างตลาด สินเชื่อ และแรงส่งราคารายกลุ่ม - กรอบวิเคราะห์เพื่อการศึกษา ไม่ใช่การทำนาย'}
    });

    sec.__render = paint;
    loadBubble(paint);
    setInterval(function(){ loadBubble(paint); }, 15 * 60000);
    document.addEventListener('spz:snapshot', function(){ paint(); });
    new MutationObserver(function(){ try { sec.__render(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 350);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* the same composite-score math paint() runs inline, factored out so other
     modules (the new Investment Idea print-report) can read today's bubble
     score + risk tier without re-deriving it or waiting for this page to
     have rendered at all -- single source of truth stays here. */
  function computeBubbleComposite(){
    var snap = liveSnap();
    var regime = snap.regime || {};
    var bubble = state.bubble || {};
    var primary = primaryDefs(bubble, regime);
    var risks = primary.map(function(d){ return d.risk; }).filter(isNum);
    var n = risks.length;
    var composite = n ? Math.round(risks.reduce(function(a,b){return a+b;},0) / n) : null;
    return { composite:composite, n:n, tier: composite == null ? null : riskLabel(composite) };
  }

  window.__SPZ_BUBBLE = { paint: function(){ paint(); }, reload: function(){ loadBubble(paint); },
    data: function(){ return state.bubble || null; },
    composite: computeBubbleComposite,
    /* Read-only exposure for the Bubble print-report type: the same 5
       primary signals (name/current value/risk%/plain-language meaning)
       this page's own cards already compute, trimmed to just what a print
       report needs -- never re-derived a second time elsewhere. */
    indicators: function(){
      try {
        var snap = liveSnap();
        var regime = snap.regime || {};
        var bubble = state.bubble || {};
        return primaryDefs(bubble, regime).map(function(d){
          return { key:d.key, nm:d.nm, val:d.val, risk:d.risk, expl:d.expl };
        });
      } catch(e){ return []; }
    } };
})();
