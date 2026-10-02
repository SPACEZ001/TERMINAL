
(function(){
  'use strict';
  if (window.__SPZ_REGIME) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }

  var COPY = {
    eyebrow:{en:'Turning Point Radar',th:'เรดาร์สัญญาณเปลี่ยนทิศ'},
    h:{en:'How would you know the market is turning?',th:'จะรู้ได้ยังไงว่าตลาดกำลังจะเปลี่ยนทิศ'},
    lede:{en:'Nobody calls a top or a bottom. What you can do is watch the handful of things that historically move BEFORE price does — how many stocks are still in an uptrend, whether credit and small caps are keeping up, what the bond curve is saying, and whether the leaders are still being bought with conviction. This page checks all of them at once, every 30 minutes, and translates each reading into plain language.',
          th:'ไม่มีใครทายจุดสูงสุดหรือต่ำสุดได้ สิ่งที่ทำได้คือเฝ้าดูตัวชี้วัดไม่กี่ตัวที่ในอดีตมักขยับ "ก่อน" ราคา — หุ้นส่วนใหญ่ยังอยู่ในขาขึ้นไหม ตลาดหุ้นกู้และหุ้นเล็กยังตามทันหรือเปล่า เส้นอัตราผลตอบแทนบอกอะไร และหุ้นผู้นำยังถูกซื้ออย่างมั่นใจอยู่ไหม หน้านี้เช็คทั้งหมดพร้อมกันทุก 30 นาที แล้วแปลแต่ละค่าออกมาเป็นภาษาคน'},
    howH:{en:'How to read the score',th:'อ่านคะแนนยังไง'},
    how:{en:'The big number counts only HARD warnings — a gauge that has crossed all the way into its red zone. The amber ones are gauges leaning the wrong way but not yet extreme, and they are normal: in any healthy market a couple of them are always amber. Zero red with a few amber is exactly what a functioning uptrend looks like.',
         th:'ตัวเลขใหญ่นับเฉพาะสัญญาณ "เตือนแรง" คือมาตรวัดที่ข้ามเข้าโซนแดงเต็มตัวแล้ว ส่วนตัวสีเหลืองคือมาตรวัดที่เอียงไปทางไม่ดีแต่ยังไม่สุด และเป็นเรื่องปกติ — ในตลาดที่แข็งแรงยังไงก็มีสีเหลืองสองสามตัวเสมอ เลขศูนย์พร้อมสีเหลืองไม่กี่ตัว คือหน้าตาของขาขึ้นที่ยังทำงานปกติ'},
    verdictOf:{en:'signals flashing a hard warning',th:'สัญญาณเตือนแรง'},
    soft:{en:'more leaning that way',th:'ตัวเริ่มเอียงไปทางนั้น'},
    vOk:{en:'Still risk-on',th:'ตลาดยังอยู่โหมดรับความเสี่ยง'},
    vMix:{en:'Cracks appearing',th:'เริ่มมีรอยร้าว'},
    vAlert:{en:'Several warnings at once',th:'เตือนพร้อมกันหลายจุด'},
    vOkD:{en:'Most of the plumbing still points the same way as price. Trends that break usually give you more warning than this.',
          th:'กลไกส่วนใหญ่ยังชี้ไปทางเดียวกับราคา แนวโน้มที่จะพลิกมักส่งสัญญาณเตือนมากกว่านี้'},
    vMixD:{en:'Some of the early movers have turned while price has not. This is the stage where position size matters more than opinion.',
           th:'ตัวชี้วัดที่มักขยับก่อนบางตัวพลิกไปแล้วทั้งที่ราคายังไม่พลิก ช่วงแบบนี้ขนาดการลงทุนสำคัญกว่าความเห็น'},
    vAlertD:{en:'Multiple independent readings are warning together. That is not a sell signal by itself — it is a reason to know exactly what you own and why.',
             th:'ตัวชี้วัดที่ไม่เกี่ยวกันหลายตัวเตือนพร้อมกัน นั่นไม่ใช่สัญญาณให้ขายในตัวมันเอง แต่เป็นเหตุผลให้รู้ให้ชัดว่าคุณถืออะไรอยู่และถือเพราะอะไร'},
    unknown:{en:'no data',th:'ไม่มีข้อมูล'},
    okChip:{en:'NORMAL',th:'ปกติ'}, warnChip:{en:'WATCH',th:'จับตา'}, alertChip:{en:'WARNING',th:'เตือน'},

    divH:{en:'Price says one thing, momentum says another',th:'ราคาพูดอย่าง แรงส่งพูดอีกอย่าง'},
    divL:{en:'A divergence is when price pushes to a new high but the momentum behind it (RSI) is weaker than it was a month ago — the move is being carried by fewer buyers each time. It is a warning, not a timer: divergences can run for months before anything happens, and some simply resolve by momentum catching back up. Treat it as a reason to check your risk, not a reason to sell.',
          th:'ไดเวอร์เจนซ์คือตอนที่ราคาทำจุดสูงใหม่ แต่แรงส่งที่อยู่เบื้องหลัง (RSI) อ่อนกว่าเมื่อเดือนก่อน — แปลว่าการขึ้นรอบนี้ถูกดันด้วยคนซื้อที่น้อยลงเรื่อย ๆ มันคือสัญญาณเตือน ไม่ใช่นาฬิกาจับเวลา ไดเวอร์เจนซ์วิ่งต่อได้เป็นเดือนก่อนจะเกิดอะไรขึ้น และบางครั้งก็จบลงด้วยแรงส่งกลับมาไล่ทันเอง ให้ถือเป็นเหตุผลให้ทบทวนความเสี่ยง ไม่ใช่เหตุผลให้ขาย'},
    divNone:{en:'No divergences right now — price and momentum are agreeing across the list.',
             th:'ตอนนี้ยังไม่พบไดเวอร์เจนซ์ — ราคากับแรงส่งไปในทางเดียวกันทั้งรายการ'},
    bear:{en:'MOMENTUM FADING',th:'แรงส่งอ่อนลง'},
    bull:{en:'MOMENTUM BUILDING',th:'แรงส่งกำลังกลับ'},
    bearT:{en:'Price is up <b>{m}%</b> over the month and sitting <b>{h}%</b> from its 52-week high, but RSI has fallen from <b>{a}</b> to <b>{b}</b>. Higher price, weaker push.',
           th:'ราคาขึ้น <b>{m}%</b> ในหนึ่งเดือน และอยู่ห่างจุดสูงสุด 52 สัปดาห์แค่ <b>{h}%</b> แต่ RSI ลดจาก <b>{a}</b> เหลือ <b>{b}</b> ราคาสูงขึ้นแต่แรงดันอ่อนลง'},
    bullT:{en:'Price is down <b>{m}%</b> over the month but RSI has risen from <b>{a}</b> to <b>{b}</b> — selling pressure is draining out even as the price slips.',
           th:'ราคาลง <b>{m}%</b> ในหนึ่งเดือน แต่ RSI ขยับขึ้นจาก <b>{a}</b> เป็น <b>{b}</b> — แรงขายกำลังเบาลงทั้งที่ราคายังไหลลง'},

    moneyH:{en:'Where the money is sitting right now',th:'ตอนนี้เงินทุนอยู่ตรงไหน'},
    moneyL:{en:'The strongest and weakest corners of the market over the past month, straight from the live snapshot. This is what has already worked — not a recommendation of what to buy next, and the top of a one-month list is often the most crowded trade in it.',
            th:'มุมที่แข็งที่สุดและอ่อนที่สุดของตลาดในหนึ่งเดือนที่ผ่านมา ดึงตรงจากข้อมูลสด นี่คือสิ่งที่ "ได้ผลไปแล้ว" ไม่ใช่คำแนะนำว่าควรซื้ออะไรต่อ และอันดับต้น ๆ ของลิสต์หนึ่งเดือนมักเป็นการเทรดที่คนแออัดที่สุดในนั้น'},
    mSector:{en:'BEST SECTORS · 1 MONTH',th:'กลุ่มที่ดีที่สุด · 1 เดือน'},
    mCountry:{en:'BEST MARKETS · 1 MONTH',th:'ตลาดที่ดีที่สุด · 1 เดือน'},
    mAsset:{en:'BEST ASSET CLASSES · 1 MONTH',th:'สินทรัพย์ที่ดีที่สุด · 1 เดือน'},
    mWorst:{en:'WEAKEST RIGHT NOW',th:'อ่อนที่สุดตอนนี้'},

    hedgeH:{en:'If the warnings do arrive, what usually holds up?',th:'ถ้าสัญญาณเตือนมาจริง อะไรมักอยู่รอด'},
    hedgeL:{en:'These are the places money has historically moved into when the readings above turn red — shown with what each one has actually done over the past month, so you can see whether the rotation has already started or not. Nothing here is safe; defensives fall too, just usually less.',
            th:'นี่คือที่ที่เงินมักย้ายเข้าไปในอดีตเมื่อตัวชี้วัดข้างบนกลายเป็นสีแดง แสดงพร้อมผลตอบแทนจริงของแต่ละตัวในหนึ่งเดือนที่ผ่านมา คุณจะได้เห็นว่าการหมุนเงินเริ่มไปแล้วหรือยัง ไม่มีอะไรในนี้ปลอดภัย หุ้นตั้งรับก็ลง แค่มักลงน้อยกว่า'},

    playH:{en:'When this happens, where does the money usually go?',th:'ถ้าเจอแบบนี้ เงินมักไหลไปไหน'},
    playL:{en:'These are historical tendencies, not rules and not forecasts. The blocks lit up are the ones your live data matches right now. Every one of them has failed before, which is exactly why the reasoning matters more than the label.',
           th:'นี่คือแนวโน้มที่เคยเกิดในอดีต ไม่ใช่กฎและไม่ใช่การพยากรณ์ บล็อกที่สว่างคือเงื่อนไขที่ข้อมูลสดตอนนี้เข้าเกณฑ์ ทุกข้อเคยผิดมาแล้ว ซึ่งเป็นเหตุผลว่าทำไมเหตุผลเบื้องหลังถึงสำคัญกว่าป้ายชื่อ'},
    active:{en:'ACTIVE NOW',th:'ตรงเงื่อนไขตอนนี้'},
    inactive:{en:'not now',th:'ยังไม่เข้าเกณฑ์'},
    out:{en:'OUT OF',th:'ออกจาก'}, into:{en:'INTO',th:'เข้าสู่'},
    note:{en:'Every number here is computed from free public price data and refreshed about every 30 minutes. It is educational material, not investment advice, and no combination of these readings can tell you what happens next.',
          th:'ทุกตัวเลขในหน้านี้คำนวณจากข้อมูลราคาสาธารณะที่ใช้ได้ฟรี และอัปเดตราวทุก 30 นาที เป็นเนื้อหาเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน และไม่มีชุดตัวเลขไหนบอกอนาคตได้'},
    waiting:{en:'Waiting for the first data sync…',th:'กำลังรอข้อมูลรอบแรก…'},

    abTitle:{en:'TURN SIGNAL',th:'สัญญาณเปลี่ยนทิศ'},
    abDiv:{en:'{n} stocks showing fading momentum at their highs',th:'หุ้น {n} ตัวแรงส่งอ่อนลงขณะอยู่ใกล้จุดสูงสุด'},
    abGo:{en:'See the detail →',th:'ดูรายละเอียด →'},
    abAck:{en:'Got it ✕',th:'รับทราบ ✕'}
  };

  /* ---------------------------------------------------------------
     gauges — thresholds as data, so the dial can draw its own zones
     dir 'up'   : higher is healthier
     dir 'down' : lower is healthier
     --------------------------------------------------------------- */
  var GAUGES = [
    { k:'breadth_200', unit:'%', level:true, dir:'up', ok:60, warn:45, range:[0,100],
      n:{en:'Market breadth',th:'ความกว้างของตลาด'},
      v:function(r){ return r.breadth_200; },
      why:{en:'Share of the tracked stocks trading above their own 200-day average.',
           th:'สัดส่วนหุ้นในรายการที่ราคายืนเหนือเส้นค่าเฉลี่ย 200 วันของตัวเอง'},
      m:{ ok:{en:'Most stocks are still in an uptrend — the rally is being carried broadly.',
              th:'หุ้นส่วนใหญ่ยังอยู่ในขาขึ้น การขึ้นรอบนี้กระจายตัวดี'},
          warn:{en:'The market is thinning out. Fewer names are doing the work than the index suggests.',
                th:'ตลาดเริ่มบางลง หุ้นที่แบกดัชนีมีน้อยกว่าที่ดัชนีทำให้เห็น'},
          alert:{en:'The index is being held up by a handful of names. This is the classic late-stage shape.',
                 th:'ดัชนีถูกพยุงด้วยหุ้นไม่กี่ตัว นี่คือรูปทรงคลาสสิกของช่วงปลายรอบ'} } },

    { k:'credit_1m', unit:' pts', dir:'up', ok:0, warn:-1.5, range:[-6,6],
      n:{en:'Credit market',th:'ตลาดหุ้นกู้'},
      v:function(r){ return r.credit_1m; },
      why:{en:'High-yield bonds (HYG) versus safer investment-grade (LQD) over a month. Credit usually cracks before equities do.',
           th:'หุ้นกู้ผลตอบแทนสูง (HYG) เทียบหุ้นกู้ระดับลงทุน (LQD) ในหนึ่งเดือน ตลาดเครดิตมักร้าวก่อนตลาดหุ้น'},
      m:{ ok:{en:'Lenders are still comfortable taking risk. No stress showing here.',
              th:'ผู้ให้กู้ยังกล้ารับความเสี่ยง ยังไม่เห็นความตึงเครียด'},
          warn:{en:'Risky borrowers are starting to lag. Worth watching, not panicking about.',
                th:'ลูกหนี้ความเสี่ยงสูงเริ่มตามหลัง ควรจับตา แต่ยังไม่ต้องตกใจ'},
          alert:{en:'Credit is pulling away from equities — historically one of the earliest real warnings.',
                 th:'ตลาดเครดิตแยกตัวออกจากตลาดหุ้น ในอดีตนี่คือสัญญาณเตือนจริงที่มาเร็วที่สุดตัวหนึ่ง'} } },

    { k:'cyclical_vs_defensive_1m', unit:' pts', dir:'up', ok:0, warn:-3, range:[-10,10],
      n:{en:'Risk appetite',th:'ความอยากเสี่ยง'},
      v:function(r){ return r.cyclical_vs_defensive_1m; },
      why:{en:'Consumer cyclicals (XLY) versus staples (XLP) over a month — what people buy when they feel rich versus when they feel careful.',
           th:'หุ้นสินค้าฟุ่มเฟือย (XLY) เทียบสินค้าจำเป็น (XLP) ในหนึ่งเดือน — ของที่คนซื้อตอนรู้สึกรวย เทียบกับตอนรู้สึกต้องระวัง'},
      m:{ ok:{en:'Money is still paying up for growth and discretionary spending.',
              th:'เงินยังยอมจ่ายแพงให้การเติบโตและการใช้จ่ายฟุ่มเฟือย'},
          warn:{en:'The defensive side is catching up. Early rotation behaviour.',
                th:'ฝั่งตั้งรับเริ่มไล่ทัน เป็นพฤติกรรมหมุนกลุ่มระยะแรก'},
          alert:{en:'Money is moving into what people need rather than what they want.',
                 th:'เงินกำลังย้ายไปหาของที่คนจำเป็นต้องใช้ แทนของที่คนแค่อยากได้'} } },

    { k:'semis_vs_market_1m', unit:' pts', dir:'up', ok:0, warn:-4, range:[-12,12],
      n:{en:'Leadership (semis)',th:'ผู้นำตลาด (เซมิคอนดักเตอร์)'},
      v:function(r){ return r.semis_vs_market_1m; },
      why:{en:'Semiconductors (SMH) versus the S&P (SPY). Semis lead the AI trade both up and down.',
           th:'กลุ่มเซมิคอนดักเตอร์ (SMH) เทียบดัชนี S&P (SPY) กลุ่มนี้นำธีม AI ทั้งขาขึ้นและขาลง'},
      m:{ ok:{en:'The leaders are still leading. The theme has not lost its bid.',
              th:'หุ้นผู้นำยังนำอยู่ ธีมนี้ยังมีแรงซื้อ'},
          warn:{en:'Leadership is flattening out against the market.',
                th:'ความเป็นผู้นำเริ่มแผ่วลงเมื่อเทียบตลาด'},
          alert:{en:'The group that led on the way up is now lagging — leadership is changing hands.',
                 th:'กลุ่มที่นำขาขึ้นกลับมาตามหลัง ความเป็นผู้นำกำลังเปลี่ยนมือ'} } },

    { k:'smallcap_vs_market_1m', unit:' pts', dir:'up', ok:-1, warn:-5, range:[-12,12],
      n:{en:'Small caps',th:'หุ้นเล็ก'},
      v:function(r){ return r.smallcap_vs_market_1m; },
      why:{en:'Russell 2000 (IWM) versus the S&P. Small companies feel a slowdown and tight credit first.',
           th:'ดัชนีหุ้นเล็ก (IWM) เทียบ S&P บริษัทเล็กรับรู้เศรษฐกิจชะลอและสินเชื่อตึงก่อนใคร'},
      m:{ ok:{en:'Small caps are keeping pace — the recovery is not just a mega-cap story.',
              th:'หุ้นเล็กยังตามทัน การฟื้นตัวไม่ได้เป็นเรื่องของหุ้นยักษ์อย่างเดียว'},
          warn:{en:'Small caps are slipping behind the index.',
                th:'หุ้นเล็กเริ่มตามหลังดัชนี'},
          alert:{en:'Small caps are being abandoned — money is hiding in size and balance sheets.',
                 th:'เงินทิ้งหุ้นเล็ก ไปหลบในบริษัทใหญ่ที่งบแข็งแรง'} } },

    { k:'stocks_vs_bonds_1m', unit:' pts', dir:'up', ok:0, warn:-4, range:[-12,12],
      n:{en:'Stocks vs bonds',th:'หุ้น เทียบ พันธบัตร'},
      v:function(r){ return r.stocks_vs_bonds_1m; },
      why:{en:'SPY versus long Treasuries (TLT) over a month — whether money prefers growth or safety.',
           th:'SPY เทียบพันธบัตรระยะยาว (TLT) ในหนึ่งเดือน — เงินเลือกการเติบโตหรือความปลอดภัย'},
      m:{ ok:{en:'Equities are winning the competition for money.',
              th:'หุ้นชนะการแย่งเงินอยู่'},
          warn:{en:'Bonds are catching a bid alongside stocks. Someone is hedging.',
                th:'พันธบัตรเริ่มมีคนซื้อพร้อม ๆ กับหุ้น มีคนกำลังป้องกันความเสี่ยง'},
          alert:{en:'Money is choosing safety over growth.',
                 th:'เงินเลือกความปลอดภัยมากกว่าการเติบโต'} } },

    { k:'curve_10y_3m', unit:'%', dir:'up', ok:0.5, warn:0, range:[-2,3],
      n:{en:'Yield curve (10y − 3m)',th:'เส้นอัตราผลตอบแทน (10 ปี − 3 เดือน)'},
      v:function(r){ return r.curve_10y_3m; },
      why:{en:'Long rates minus short rates. When it goes negative, lending long is punished — the single most watched recession marker.',
           th:'ดอกเบี้ยยาวลบดอกเบี้ยสั้น เมื่อติดลบ การปล่อยกู้ระยะยาวจะไม่คุ้ม เป็นเครื่องหมายเตือนภาวะถดถอยที่คนจับตามากที่สุด'},
      m:{ ok:{en:'Normal shape. Banks get paid to lend, credit keeps flowing.',
              th:'รูปทรงปกติ ธนาคารได้กำไรจากการปล่อยกู้ สินเชื่อยังไหลได้'},
          warn:{en:'Nearly flat. The cushion between short and long rates is almost gone.',
                th:'เกือบแบน ส่วนต่างระหว่างดอกเบี้ยสั้นกับยาวแทบหมด'},
          alert:{en:'Inverted. Historically this has led recessions by roughly 6–18 months — with false alarms along the way.',
                 th:'กลับหัวแล้ว ในอดีตมักนำหน้าภาวะถดถอยราว 6–18 เดือน แต่ก็เคยเตือนผิดมาแล้วเหมือนกัน'} } },

    { k:'vix', unit:'', level:true, dir:'down', ok:18, warn:25, range:[8,45],
      n:{en:'Volatility (VIX)',th:'ความผันผวน (VIX)'},
      v:function(r){ return r.vix; },
      why:{en:'What options traders are paying for protection over the next month.',
           th:'ราคาที่นักเทรดออปชั่นยอมจ่ายเพื่อป้องกันความเสี่ยงในเดือนข้างหน้า'},
      m:{ ok:{en:'Calm. Note that calm markets are where complacency builds.',
              th:'สงบ แต่พึงระลึกว่าตลาดที่สงบคือที่ที่ความประมาทก่อตัว'},
          warn:{en:'Nervous but functioning. Hedging is getting more expensive.',
                th:'ประหม่าแต่ยังทำงานได้ ต้นทุนการป้องกันความเสี่ยงแพงขึ้น'},
          alert:{en:'Fear is being paid for. Moves get violent in both directions here.',
                 th:'มีคนยอมจ่ายเพื่อความกลัว ช่วงนี้ราคาเหวี่ยงแรงทั้งสองทาง'} } },

    { k:'dbc_3m', unit:'%', dir:'down', ok:4, warn:10, range:[-15,25],
      n:{en:'Commodity pressure',th:'แรงกดดันสินค้าโภคภัณฑ์'},
      v:function(r){ return r.dbc_3m; },
      why:{en:'Broad commodities (DBC) over three months — the raw input into next year’s inflation.',
           th:'ดัชนีสินค้าโภคภัณฑ์รวม (DBC) ในสามเดือน เป็นต้นทุนดิบที่จะกลายเป็นเงินเฟ้อของปีหน้า'},
      m:{ ok:{en:'No fresh cost-push pressure building.',
              th:'ยังไม่มีแรงกดดันต้นทุนรอบใหม่ก่อตัว'},
          warn:{en:'Input costs are climbing. Watch margins in the next earnings season.',
                th:'ต้นทุนวัตถุดิบไต่ขึ้น จับตาอัตรากำไรในงบไตรมาสหน้า'},
          alert:{en:'A commodity surge is the fastest route to a policy surprise.',
                 th:'สินค้าโภคภัณฑ์พุ่งแรง เป็นทางลัดที่สุดสู่การเซอร์ไพรส์เชิงนโยบาย'} } },

    { k:'uup_3m', unit:'%', dir:'down', ok:2, warn:5, range:[-8,10],
      n:{en:'US dollar',th:'ดอลลาร์สหรัฐฯ'},
      v:function(r){ return r.uup_3m; },
      why:{en:'The dollar over three months. A strong dollar drains money out of emerging markets, Thailand included.',
           th:'ดอลลาร์ในสามเดือน ดอลลาร์แข็งดูดเงินออกจากตลาดเกิดใหม่ รวมถึงไทย'},
      m:{ ok:{en:'Soft or stable dollar — friendly for emerging markets and commodities.',
              th:'ดอลลาร์อ่อนหรือทรงตัว เป็นมิตรกับตลาดเกิดใหม่และสินค้าโภคภัณฑ์'},
          warn:{en:'The dollar is firming. That tightens conditions everywhere else.',
                th:'ดอลลาร์เริ่มแข็ง ทำให้สภาพคล่องที่อื่นตึงตัวขึ้น'},
          alert:{en:'A hard dollar rally pulls money home and pressures every EM currency.',
                 th:'ดอลลาร์แข็งแรง ดึงเงินกลับบ้านและกดดันค่าเงินตลาดเกิดใหม่ทุกสกุล'} } },

    { k:'thb_1m', unit:'%', dir:'up', ok:-1, warn:-3, range:[-8,8],
      n:{en:'Thai baht (1 month)',th:'ค่าเงินบาท (1 เดือน)'},
      v:function(r){ return r.thb_1m; },
      why:{en:'How the baht moved against the dollar. A weaker baht flatters exporters and hurts anyone paying in dollars.',
           th:'บาทขยับเทียบดอลลาร์แค่ไหน บาทอ่อนช่วยผู้ส่งออก แต่กระทบทุกคนที่ต้องจ่ายเป็นดอลลาร์'},
      m:{ ok:{en:'Stable or firmer baht — no currency pressure on Thai assets.',
              th:'บาททรงตัวหรือแข็งขึ้น ไม่มีแรงกดดันด้านค่าเงินต่อสินทรัพย์ไทย'},
          warn:{en:'The baht is slipping. Exporters gain, importers and travel-linked names pay.',
                th:'บาทอ่อนลง ผู้ส่งออกได้ ผู้นำเข้าและหุ้นที่โยงกับการเดินทางเสีย'},
          alert:{en:'A fast baht slide usually goes with foreign money leaving Thai assets.',
                 th:'บาทอ่อนเร็วมักมาพร้อมเงินต่างชาติไหลออกจากสินทรัพย์ไทย'} } }
  ];

  function stateOf(g, v){
    if (!isNum(v)) return 'na';
    if (g.dir === 'down') return v <= g.ok ? 'ok' : v <= g.warn ? 'warn' : 'alert';
    return v >= g.ok ? 'ok' : v >= g.warn ? 'warn' : 'alert';
  }

  /* the dial: three zones drawn from the gauge's own thresholds */
  function dialHTML(g, v){
    var lo = g.range[0], hi = g.range[1], span = hi - lo || 1;
    var pos = function(x){ return Math.max(0, Math.min(100, (x - lo) / span * 100)); };
    var okP = pos(g.ok), warnP = pos(g.warn);
    var zones;
    if (g.dir === 'down') {
      zones = '<span class="rg-zok" style="width:' + okP + '%"></span>' +
              '<span class="rg-zwarn" style="width:' + Math.max(0, warnP - okP) + '%"></span>' +
              '<span class="rg-zalert" style="width:' + Math.max(0, 100 - warnP) + '%"></span>';
    } else {
      zones = '<span class="rg-zalert" style="width:' + warnP + '%"></span>' +
              '<span class="rg-zwarn" style="width:' + Math.max(0, okP - warnP) + '%"></span>' +
              '<span class="rg-zok" style="width:' + Math.max(0, 100 - okP) + '%"></span>';
    }
    var markP = isNum(v) ? pos(v) : null;
    return '<div class="rg-dial">' +
      '<div class="rg-track">' + zones + '</div>' +
      (markP === null ? '' : '<i class="rg-mark" style="left:' + markP + '%"></i>') +
      '<div class="rg-ticks">' +
        '<b style="left:0%;transform:none">' + lo + '</b>' +
        '<b style="left:' + pos(g.dir === 'down' ? g.ok : g.warn) + '%">' +
          (g.dir === 'down' ? g.ok : g.warn) + '</b>' +
        '<b style="left:100%;transform:translateX(-100%)">' + hi + '</b>' +
      '</div></div>';
  }

  /* ---------------------------------------------------------------
     rotation playbook
     --------------------------------------------------------------- */
  var PLAYS = [
    { on:function(r){ return isNum(r.dbc_3m) && r.dbc_3m > 5; },
      n:{en:'Commodities running, inflation risk rising',th:'สินค้าโภคภัณฑ์วิ่ง ความเสี่ยงเงินเฟ้อสูงขึ้น'},
      d:{en:'When raw material costs climb, companies that own the resource earn more and companies that consume it earn less. Long-dated growth stocks suffer twice: their costs rise and the discount rate applied to their far-future profits rises too.',
         th:'เมื่อต้นทุนวัตถุดิบไต่ขึ้น บริษัทที่เป็นเจ้าของทรัพยากรได้กำไรมากขึ้น ส่วนบริษัทที่ใช้ทรัพยากรได้น้อยลง หุ้นเติบโตที่กำไรอยู่ไกลโดนสองเด้ง ทั้งต้นทุนขึ้นและอัตราคิดลดกำไรอนาคตก็สูงขึ้น'},
      out:{en:'expensive growth, long bonds, airlines',th:'หุ้นเติบโตราคาแพง พันธบัตรยาว สายการบิน'},
      into:{en:'energy, materials, value',th:'พลังงาน วัสดุ หุ้นคุณค่า'},
      tk:['XOM','CVX','PTT','PTTEP','TOP','SCC'] },

    { on:function(r){ return isNum(r.curve_10y_3m) && r.curve_10y_3m < 0; },
      n:{en:'Yield curve inverted',th:'เส้นอัตราผลตอบแทนกลับหัว'},
      d:{en:'Short money costs more than long money, so banks lend less and marginal borrowers get squeezed. Money historically drifts toward companies whose demand does not depend on the economic cycle.',
         th:'เงินสั้นแพงกว่าเงินยาว ธนาคารจึงปล่อยกู้น้อยลง และลูกหนี้ชายขอบโดนบีบ ในอดีตเงินมักไหลไปหาบริษัทที่ความต้องการสินค้าไม่ขึ้นกับวัฏจักรเศรษฐกิจ'},
      out:{en:'small caps, cyclicals, high-debt names',th:'หุ้นเล็ก หุ้นวัฏจักร หุ้นหนี้สูง'},
      into:{en:'staples, healthcare, utilities, long bonds',th:'สินค้าจำเป็น สุขภาพ สาธารณูปโภค พันธบัตรยาว'},
      tk:['KO','PEP','JNJ','PG','DUK','SO','BDMS','ADVANC'] },

    { on:function(r){ return isNum(r.breadth_200) && r.breadth_200 < 45; },
      n:{en:'Leadership narrowing',th:'ผู้นำตลาดแคบลง'},
      d:{en:'When the index rises while most of its members do not, the market has become a bet on a few names. That works until one of them misses. Money usually shifts toward quality that can survive being wrong.',
         th:'เมื่อดัชนีขึ้นแต่หุ้นส่วนใหญ่ไม่ขึ้น ตลาดกลายเป็นการเดิมพันกับหุ้นไม่กี่ตัว ซึ่งใช้ได้จนกว่าจะมีตัวใดตัวหนึ่งพลาด เงินมักย้ายไปหาคุณภาพที่ทนทานพอจะรอดแม้คิดผิด'},
      out:{en:'crowded momentum, thin small caps',th:'หุ้นโมเมนตัมที่คนแออัด หุ้นเล็กสภาพคล่องบาง'},
      into:{en:'large-cap quality, dividend payers',th:'หุ้นใหญ่คุณภาพ หุ้นปันผล'},
      tk:['BRK.B','JNJ','KO','MSFT','ABBV','O'] },

    { on:function(r){ return isNum(r.credit_1m) && r.credit_1m < -1.5; },
      n:{en:'Credit under stress',th:'ตลาดเครดิตตึงตัว'},
      d:{en:'Bond investors get repaid before shareholders, so when they start demanding more to hold risky debt, they are telling you something the equity market has not priced yet.',
         th:'ผู้ถือหุ้นกู้ได้เงินคืนก่อนผู้ถือหุ้น ดังนั้นเมื่อพวกเขาเริ่มเรียกผลตอบแทนสูงขึ้นเพื่อถือหนี้เสี่ยง นั่นคือเขากำลังบอกอะไรบางอย่างที่ตลาดหุ้นยังไม่ได้คิดราคา'},
      out:{en:'leveraged balance sheets, junk credit',th:'บริษัทที่กู้เยอะ หุ้นกู้เกรดต่ำ'},
      into:{en:'cash, short bonds, low-debt companies',th:'เงินสด พันธบัตรสั้น บริษัทที่หนี้น้อย'},
      tk:['SHY','LQD','JNJ','XOM','ADVANC'] },

    { on:function(r){ return isNum(r.uup_3m) && r.uup_3m < -2; },
      n:{en:'Dollar weakening',th:'ดอลลาร์อ่อนค่า'},
      d:{en:'A falling dollar makes everything priced in dollars cheaper for the rest of the world, and it releases the pressure on emerging market borrowers. Historically the friendliest backdrop Thai and Asian equities get.',
         th:'ดอลลาร์อ่อนทำให้ของที่ตั้งราคาเป็นดอลลาร์ถูกลงสำหรับคนทั้งโลก และคลายแรงกดดันให้ลูกหนี้ในตลาดเกิดใหม่ ในอดีตนี่คือฉากหลังที่เป็นมิตรที่สุดกับหุ้นไทยและหุ้นเอเชีย'},
      out:{en:'US cash, dollar hoarding',th:'เงินสดดอลลาร์ การกอดดอลลาร์'},
      into:{en:'emerging markets, gold, commodities, Thai equities',th:'ตลาดเกิดใหม่ ทองคำ สินค้าโภคภัณฑ์ หุ้นไทย'},
      tk:['GLD','EEM','KBANK','PTT','AOT','CPALL'] },

    { on:function(r){ return isNum(r.uup_3m) && r.uup_3m > 5; },
      n:{en:'Dollar squeezing everyone else',th:'ดอลลาร์แข็งบีบทุกคน'},
      d:{en:'Dollar strength drains liquidity out of every market that borrows in dollars. Thai and other Asian assets tend to underperform in local terms and worse again once converted back.',
         th:'ดอลลาร์แข็งดูดสภาพคล่องออกจากทุกตลาดที่กู้เป็นดอลลาร์ สินทรัพย์ไทยและเอเชียมักทำผลตอบแทนแย่กว่าในสกุลท้องถิ่น และแย่กว่าเดิมอีกเมื่อแปลงกลับ'},
      out:{en:'emerging markets, commodities',th:'ตลาดเกิดใหม่ สินค้าโภคภัณฑ์'},
      into:{en:'US large caps, dollar cash',th:'หุ้นใหญ่สหรัฐฯ เงินสดดอลลาร์'},
      tk:['MSFT','AAPL','BRK.B','SHY'] },

    { on:function(r){ return isNum(r.thb_1m) && r.thb_1m < -1.5; },
      n:{en:'Baht weakening',th:'บาทอ่อนค่า'},
      d:{en:'A weaker baht raises the value of every dollar an exporter earns, and raises the cost of everything imported. The split inside the Thai market is unusually clean.',
         th:'บาทอ่อนทำให้ทุกดอลลาร์ที่ผู้ส่งออกหาได้มีค่ามากขึ้น และทำให้ของนำเข้าทุกอย่างแพงขึ้น การแบ่งข้างในตลาดหุ้นไทยจากเรื่องนี้ชัดเจนผิดปกติ'},
      out:{en:'importers, travel and fuel-cost names',th:'ผู้นำเข้า หุ้นท่องเที่ยวและหุ้นที่ต้นทุนน้ำมันสูง'},
      into:{en:'Thai exporters and dollar earners',th:'ผู้ส่งออกไทยและบริษัทที่มีรายได้เป็นดอลลาร์'},
      tk:['DELTA','TU','CPF','PTTEP','KCE'] },

    { on:function(r){ return isNum(r.vix) && r.vix > 25; },
      n:{en:'Fear is being paid for',th:'มีคนยอมจ่ายเพื่อความกลัว'},
      d:{en:'When protection gets expensive, forced selling and margin calls do the trading, not opinions. Correlations go to one and diversification stops working for a while.',
         th:'เมื่อการป้องกันความเสี่ยงแพง คนที่ซื้อขายคือแรงบังคับขายและมาร์จิ้นคอล ไม่ใช่ความเห็น ความสัมพันธ์ของสินทรัพย์วิ่งเข้าหากันหมดและการกระจายความเสี่ยงหยุดทำงานชั่วคราว'},
      out:{en:'everything leveraged or crowded',th:'ทุกอย่างที่ใช้เลเวอเรจหรือคนแออัด'},
      into:{en:'cash, gold, Treasuries',th:'เงินสด ทองคำ พันธบัตรรัฐบาล'},
      tk:['GLD','TLT','SHY'] },

    { on:function(r){ return isNum(r.semis_vs_market_1m) && r.semis_vs_market_1m < -4; },
      n:{en:'The leaders stopped leading',th:'หุ้นผู้นำหยุดนำ'},
      d:{en:'A theme ends when its best names stop outperforming, not when the story stops being told. Money that leaves a crowded leadership group usually reappears in whatever was ignored while everyone was busy.',
         th:'ธีมจบเมื่อหุ้นที่ดีที่สุดของธีมหยุดชนะตลาด ไม่ใช่ตอนที่เรื่องเล่าหยุดถูกเล่า เงินที่ออกจากกลุ่มผู้นำที่แออัด มักไปโผล่ในของที่ถูกมองข้ามตอนที่ทุกคนยุ่งอยู่'},
      out:{en:'the crowded winner group',th:'กลุ่มผู้ชนะที่คนแออัด'},
      into:{en:'laggards, value, dividends, cash',th:'หุ้นที่ตามหลัง หุ้นคุณค่า หุ้นปันผล เงินสด'},
      tk:['XLE','XLV','XLP','KO','O','BBL'] }
  ];

  /* the shelter list, shown with what each one actually did */
  var HEDGES = [
    { s:'XLP',  n:{en:'Consumer staples',th:'สินค้าจำเป็น'} },
    { s:'XLV',  n:{en:'Health care',th:'สุขภาพ'} },
    { s:'XLU',  n:{en:'Utilities',th:'สาธารณูปโภค'} },
    { s:'TLT',  n:{en:'Long Treasuries',th:'พันธบัตรยาวสหรัฐฯ'} },
    { s:'SHY',  n:{en:'Short Treasuries (cash-like)',th:'พันธบัตรสั้น (คล้ายเงินสด)'} },
    { s:'GLD',  n:{en:'Gold',th:'ทองคำ'} },
    { s:'LQD',  n:{en:'Investment-grade credit',th:'หุ้นกู้ระดับลงทุน'} }
  ];

  /* ---------------------------------------------------------------
     render
     --------------------------------------------------------------- */
  var snap = null, sec = null, bar = null, grades = null;
  function reg(){ return (snap && snap.regime) || {}; }

  /* The Proof Lab measured every one of these gauges against 12–25 years of
     history. Showing that grade next to the live reading is the whole point
     of having run the test — a gauge with no historical edge should not look
     as authoritative as one that has it. */
  function loadGrades(){
    if (grades !== null) return;
    grades = {};
    fetch('data/backtest.json?v=' + Math.floor(Date.now() / 3.6e6))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){
        if (!d || !d.gauges) return;
        btRaw = d;
        d.gauges.forEach(function(g){
          var core = (g.h || {})['63'] || {};
          grades[g.k] = { g:g.grade, edge:core.edge, n:g.episodes };
        });
        try { ANA.res = buildAnalogues(); } catch(e){ ANA.res = null; }
        repaintAll();
      }, function(){});
  }

  var GRADE_COPY = {
    A:{en:'measured edge',th:'พิสูจน์แล้วว่ามีผล'},
    B:{en:'measured edge',th:'พิสูจน์แล้วว่ามีผล'},
    C:{en:'weak edge in the test',th:'ผลทดสอบอ่อน'},
    D:{en:'no edge in the test',th:'ทดสอบแล้วไม่มีผล'},
    F:{en:'test says the opposite',th:'ทดสอบแล้วได้ผลตรงข้าม'},
    'n/a':{en:'untested',th:'ยังไม่ได้ทดสอบ'}
  };

  function gradeChip(k){
    if (!grades || !grades[k]) return '';
    var g = grades[k];
    var cls = (g.g === 'A' || g.g === 'B') ? 'ok' : g.g === 'C' ? 'warn' : 'alert';
    var t = tx(GRADE_COPY[g.g] || GRADE_COPY['n/a']);
    return '<span class="rg-bt ' + cls + '" title="' + esc(t) +
      (isNum(g.edge) ? ' · ' + (L() === 'th' ? 'ส่วนต่าง 3 เดือน ' : '3-month edge ') + sgn(g.edge) + ' pts · ' +
        g.n + (L() === 'th' ? ' ครั้ง' : ' episodes') : '') + '">' +
      (L() === 'th' ? 'ผลทดสอบ ' : 'TEST ') + esc(g.g === 'n/a' ? '—' : g.g) + '</span>';
  }
  function flows(){ return (snap && snap.flows) || {}; }

  function gaugeHTML(g, r){
    var v = g.v(r), s = stateOf(g, v);
    var val = isNum(v) ? (g.level ? Number(v).toFixed(1) : sgn(v, 1)) : '—';
    var chip = s === 'na' ? tx(COPY.unknown)
             : s === 'ok' ? tx(COPY.okChip) : s === 'warn' ? tx(COPY.warnChip) : tx(COPY.alertChip);
    return '<div class="rg-card st-' + s + '">' +
      '<div class="rg-ct"><span>' + esc(tx(g.n)) + '</span>' +
        '<span class="rg-chip ' + s + '">' + esc(chip) + '</span></div>' +
      (gradeChip(g.k) || '') +
      '<div class="rg-cval">' + esc(val) + '<small>' + esc(g.unit.trim() || '') + '</small></div>' +
      dialHTML(g, v) +
      '<div class="rg-cmean">' + esc(s === 'na' ? tx(COPY.unknown) : tx(g.m[s])) + '</div>' +
      '<div class="rg-cwhy">' + esc(tx(g.why)) + '</div>' +
    '</div>';
  }

  function divHTML(r){
    var list = r.divergences || [];
    if (!list.length) return '<div class="rg-empty">' + esc(tx(COPY.divNone)) + '</div>';
    return '<div class="rg-div">' + list.slice(0, 12).map(function(d){
      var bear = d.kind === 'bearish';
      var tpl = tx(bear ? COPY.bearT : COPY.bullT)
        .replace('{m}', isNum(d.m1) ? sgn(d.m1, 1) : '—')
        .replace('{h}', isNum(d.off_high) ? Number(d.off_high).toFixed(1) : '—')
        .replace('{a}', isNum(d.rsi_then) ? d.rsi_then : '—')
        .replace('{b}', isNum(d.rsi) ? d.rsi : '—');
      return '<div class="rg-drow">' +
        '<span class="rg-dtk">' + esc(d.t) + (d.name ? '<small>' + esc(String(d.name).slice(0, 26)) + '</small>' : '') + '</span>' +
        '<span class="rg-dtxt">' + tpl + '</span>' +
        '<span class="rg-dkind ' + (bear ? 'bear' : 'bull') + '">' + esc(tx(bear ? COPY.bear : COPY.bull)) + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  function rankRows(list, key, n, flag){
    var have = (list || []).filter(function(x){ return isNum(x[key]); });
    have.sort(function(a, b){ return b[key] - a[key]; });
    var top = have.slice(0, n);
    var max = 0;
    top.forEach(function(x){ max = Math.max(max, Math.abs(x[key])); });
    return top.map(function(x, i){
      var up = x[key] >= 0;
      var w = max > 0 ? Math.max(3, Math.abs(x[key]) / max * 100) : 3;
      return '<div class="rg-mrow">' +
        '<span class="rg-mname"><span class="rg-rank">' + (i + 1) + '</span>' +
          esc((flag && x.flag ? x.flag + ' ' : '') + tx(x)) + '<em>' + esc(x.sym || '') + '</em></span>' +
        '<span class="rg-mval ' + (up ? 'up' : 'down') + '">' + sgn(x[key]) + '%</span>' +
        '<span class="rg-mbar"><i class="' + (up ? 'up' : 'down') + '" style="width:' + w + '%"></i></span>' +
      '</div>';
    }).join('') || '<div class="rg-empty">—</div>';
  }

  function moneyHTML(){
    var f = flows();
    var worst = []
      .concat(f.sector || [], f.country || [])
      .filter(function(x){ return isNum(x.m1); })
      .sort(function(a, b){ return a.m1 - b.m1; })
      .slice(0, 4);
    return '<div class="rg-money">' +
      '<div class="rg-mcol"><div class="rg-mh">' + esc(tx(COPY.mSector)) + '</div>' +
        rankRows(f.sector, 'm1', 4) + '</div>' +
      '<div class="rg-mcol"><div class="rg-mh">' + esc(tx(COPY.mCountry)) + '</div>' +
        rankRows(f.country, 'm1', 4, true) + '</div>' +
      '<div class="rg-mcol"><div class="rg-mh">' + esc(tx(COPY.mAsset)) + '</div>' +
        rankRows(f.asset, 'm1', 4) + '</div>' +
      '<div class="rg-mcol"><div class="rg-mh">' + esc(tx(COPY.mWorst)) + '</div>' +
        rankRows(worst.slice().reverse(), 'm1', 4, true) + '</div>' +
    '</div>';
  }

  function hedgeHTML(){
    var f = flows();
    var idx = {};
    ['sector','asset','country'].forEach(function(b){
      (f[b] || []).forEach(function(x){ idx[x.sym] = x; });
    });
    var rows = HEDGES.map(function(h){
      var r = idx[h.s] || {};
      var m1 = r.m1, m3 = r.m3;
      var up = isNum(m1) && m1 >= 0;
      return '<div class="rg-mrow">' +
        '<span class="rg-mname">' + esc(tx(h.n)) + '<em>' + esc(h.s) + '</em></span>' +
        '<span class="rg-mval ' + (up ? 'up' : 'down') + '">' +
          (isNum(m1) ? sgn(m1) + '%' : '—') +
          '<span style="color:var(--grey-dim);font-weight:500;">&nbsp;/&nbsp;' +
          (isNum(m3) ? sgn(m3) + '%' : '—') + '</span></span>' +
      '</div>';
    }).join('');
    return '<div class="rg-mcol" style="max-width:640px;">' +
      '<div class="rg-mh">' + esc(L() === 'th' ? '1 เดือน / 3 เดือน' : '1 MONTH / 3 MONTHS') + '</div>' +
      rows + '</div>';
  }

  function playHTML(r){
    return '<div class="rg-play">' + PLAYS.map(function(p){
      var on = false;
      try { on = !!p.on(r); } catch(e){}
      return '<div class="rg-pcard' + (on ? ' on' : '') + '">' +
        '<div class="rg-ph"><span class="rg-pname">' + esc(tx(p.n)) + '</span>' +
          '<span class="rg-pon">' + esc(on ? tx(COPY.active) : tx(COPY.inactive)) + '</span></div>' +
        '<div class="rg-pd">' + esc(tx(p.d)) + '</div>' +
        '<div class="rg-flowline"><span class="rg-arrow out">' + esc(tx(COPY.out)) + '</span>' +
          '<span class="rg-names">' + esc(tx(p.out)) + '</span></div>' +
        '<div class="rg-flowline"><span class="rg-arrow in">' + esc(tx(COPY.into)) + '</span>' +
          '<span class="rg-names">' + esc(tx(p.into)) + '</span></div>' +
        '<div class="rg-flowline"><span class="rg-arrow">&nbsp;</span><span class="rg-tk">' +
          p.tk.map(function(t){ return '$' + esc(t); }).join('  ') + '</span></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function scoreOf(){
    var r = reg();
    var states = GAUGES.map(function(g){ return stateOf(g, g.v(r)); });
    return {
      states: states,
      known: states.filter(function(s){ return s !== 'na'; }).length,
      soft: states.filter(function(s){ return s === 'warn'; }).length,
      alerts: states.filter(function(s){ return s === 'alert'; }).length,
      bear: (r.divergences || []).filter(function(d){ return d.kind === 'bearish'; }).length
    };
  }

  /* ---------------------------------------------------------------
     the analogue engine — "when the gauges last looked like this,
     what did the market do next?" Nearest neighbours in the space of
     the eleven gauges, over the whole weekly history, then the actual
     forward returns of those windows. No opinion in the numbers.
     --------------------------------------------------------------- */
  var btRaw = null;
  var ANA = { res:null, weeks:13 };

  var A = {
    h:{en:'Where we are, and what came next last time',th:'ตอนนี้เราอยู่ตรงไหน แล้วเงินจะไหลไปทางไหนต่อ'},
    lede:{en:'Nobody forecasts a market. What can be asked is narrower and answerable: on the days when these eleven gauges looked most like they look right now, what did the next three months actually bring? This searches thirty years for the closest matches and shows every one of them — the times it kept going and the times it broke.',
          th:'ไม่มีใครทำนายตลาดได้ สิ่งที่ถามได้และตอบได้คือคำถามที่แคบกว่านั้น: ในวันที่ตัวชี้วัดทั้ง 11 ตัวหน้าตาใกล้เคียงวันนี้ที่สุด สามเดือนถัดมาเกิดอะไรขึ้นจริง ๆ หน้านี้ค้นย้อนหลัง 30 ปีหาช่วงที่คล้ายที่สุด แล้วแสดงให้ครบทุกครั้ง ทั้งครั้งที่ไปต่อและครั้งที่พัง'},
    p1:{en:'① WHERE WE ARE IN THE CYCLE',th:'① ตำแหน่งในวัฏจักร'},
    p1r:{en:'the terminal\'s own cycle call',th:'ค่าที่เทอร์มินัลนี้ประเมินไว้'},
    p2:{en:'② THE PATHS THAT FOLLOWED · NEXT 3 MONTHS',th:'② เส้นทางที่เคยเกิดต่อ · 3 เดือนข้างหน้า'},
    p2r:{en:'shares counted from {n} matching windows',th:'สัดส่วนนับจาก {n} ช่วงที่คล้ายกัน'},
    p3:{en:'③ WHAT THE MARKET DID IN THOSE {n} WINDOWS',th:'③ ตลาดทำอะไรใน {n} ช่วงนั้น'},
    p3r:{en:'S&P 500, 3 months on',th:'เทียบ S&P 500 · 3 เดือนถัดมา'},
    extend:{en:'It kept going',th:'ตลาดไปต่อ'},
    rotate:{en:'It went sideways and rotated',th:'ออกข้างและหมุนกลุ่ม'},
    brk:{en:'It broke',th:'ตลาดสะดุด'},
    /* ROUND U: plain-language explainer + simple glance-bar for this panel --
       she said the fan diagram's own "50% / 30% / 20%" reads fine once you
       already get it, but asked for it explained more plainly for people who
       don't. This sits right above the fan chart, in beginner terms, with a
       single-line worked example instead of methodology language. */
    p2plain:{en:'In plain terms: out of every {n} times the market looked like it does today, this many kept rising (green), this many went flat/rotated between sectors (amber), and this many fell (red) over the following 3 months. Higher green = history leans toward "keep going"; higher red = history leans toward "watch out."',
              th:'พูดง่ายๆ คือ: จากทั้งหมด {n} ครั้งที่ตลาดเคยหน้าตาคล้ายวันนี้ มีกี่ครั้งที่ไปต่อ (เขียว) กี่ครั้งที่ออกข้าง/สลับกลุ่มอุตสาหกรรม (เหลือง) และกี่ครั้งที่ร่วงลง (แดง) ใน 3 เดือนถัดมา ถ้าเขียวเยอะ = ประวัติศาสตร์เอียงไปทาง "ไปต่อ" ถ้าแดงเยอะ = ประวัติศาสตร์เอียงไปทาง "ระวังไว้ก่อน"'},
    glanceH:{en:'AT A GLANCE',th:'สรุปภาพรวม'},
    extendS:{en:'gained more than 3%',th:'บวกเกิน 3%'},
    rotateS:{en:'ended within 3% either way',th:'จบในกรอบ ±3%'},
    brkS:{en:'lost more than 3%',th:'ลบเกิน 3%'},
    led:{en:'led by',th:'กลุ่มที่นำ'},
    med:{en:'median',th:'ค่ากลาง'},
    sMed:{en:'MEDIAN, 3 MONTHS',th:'ค่ากลาง 3 เดือน'},
    sWorst:{en:'WORST THAT HAPPENED',th:'แย่ที่สุดที่เคยเกิด'},
    sBest:{en:'BEST THAT HAPPENED',th:'ดีที่สุดที่เคยเกิด'},
    sDown:{en:'WINDOWS THAT FELL',th:'ครั้งที่ตลาดลง'},
    sBase:{en:'MEDIAN OF ANY 3 MONTHS',th:'ค่ากลางของ 3 เดือนทั่วไป'},
    datesH:{en:'The closest matches — go and look them up',th:'ช่วงที่คล้ายวันนี้ที่สุด — ไปเปิดกราฟดูเองได้'},
    legendW:{en:'line thickness = how often it happened · hover one path to isolate it',
             th:'ความหนาของเส้น = ความถี่ที่เคยเกิด · เอาเมาส์ชี้เพื่อดูทีละเส้น'},
    thin:{en:'Only {n} windows in thirty years resembled today closely enough to count, which is too few to read as a probability. The paths below are shown for shape, not for their percentages.',
          th:'ใน 30 ปีมีเพียง {n} ช่วงที่คล้ายวันนี้มากพอจะนับได้ ซึ่งน้อยเกินกว่าจะอ่านเป็นความน่าจะเป็น เส้นทางด้านล่างแสดงไว้ให้เห็นรูปทรงเท่านั้น ไม่ใช่เพื่ออ่านเปอร์เซ็นต์'},
    caveat:{en:'Resemblance is not cause. 1998 and 2026 differ in structure, participants and policy, and these gauges mostly graded D–F in the backtest — so read this as "here is what followed situations like this", never as "here is what happens next".',
            th:'ความคล้ายไม่ใช่เหตุเป็นผล ปี 1998 กับ 2026 ต่างกันทั้งโครงสร้าง ผู้เล่น และนโยบาย และตัวชี้วัดพวกนี้ส่วนใหญ่ได้เกรด D–F ในการทดสอบย้อนหลัง ให้อ่านหน้านี้ว่า "หลังสภาพแบบนี้เคยเกิดอะไร" ไม่ใช่ "ต่อไปจะเกิดอะไร"'},
    waiting:{en:'Searching the history…',th:'กำลังค้นประวัติ…'}
  };

  function med(xs){
    if (!xs.length) return null;
    var s = xs.slice().sort(function(a,b){ return a-b; });
    return s.length % 2 ? s[(s.length-1)/2] : (s[s.length/2-1] + s[s.length/2]) / 2;
  }

  function buildAnalogues(){
    var d = btRaw, r = reg();
    if (!d || !d.series || !d.bench_series || !Object.keys(r).length) return null;

    var bench = d.bench_series;
    var bIdx = {};
    bench.forEach(function(row, i){ bIdx[row[0]] = i; });

    /* z-score every gauge over its own history, then place today in the
       same space so the distance means something */
    var dims = [];
    Object.keys(d.series).forEach(function(k){
      if (!isNum(r[k])) return;
      var ser = d.series[k];
      if (!ser || ser.length < 200) return;
      var vals = ser.map(function(p){ return p[1]; });
      var m = vals.reduce(function(a,b){ return a+b; }, 0) / vals.length;
      var v = Math.sqrt(vals.reduce(function(a,b){ return a + (b-m)*(b-m); }, 0) / vals.length);
      if (!v) return;
      var by = {};
      ser.forEach(function(p){ by[p[0]] = (p[1] - m) / v; });
      dims.push({ k:k, by:by, now:(r[k] - m) / v });
    });
    if (dims.length < 4) return null;

    var horizon = ANA.weeks;
    var cand = [];
    for (var i = 0; i + horizon < bench.length - 1; i++) {
      var dt = bench[i][0];
      var sum = 0, used = 0;
      for (var j = 0; j < dims.length; j++) {
        var v = dims[j].by[dt];
        if (v === undefined) continue;
        var diff = v - dims[j].now;
        sum += diff * diff; used++;
      }
      if (used < Math.max(4, dims.length - 2)) continue;
      cand.push({ i:i, d:dt, dist:Math.sqrt(sum / used) });
    }
    if (cand.length < 50) return null;

    /* nearest first, but never two matches from the same episode */
    cand.sort(function(a,b){ return a.dist - b.dist; });
    var picked = [];
    for (var c = 0; c < cand.length && picked.length < 40; c++) {
      var ok = true;
      for (var q = 0; q < picked.length; q++) {
        if (Math.abs(picked[q].i - cand[c].i) < 10) { ok = false; break; }
      }
      if (ok) picked.push(cand[c]);
    }
    if (picked.length < 6) return null;

    /* what the benchmark did over the window that followed each match */
    picked.forEach(function(p){
      var a = bench[p.i][1], b = bench[p.i + horizon][1];
      p.r = a ? (b - a) / a * 100 : null;
    });
    picked = picked.filter(function(p){ return isNum(p.r); });

    /* and which groups led inside those same windows */
    function leaders(rows){
      var sec = d.sectors || {};
      var out = [];
      Object.keys(sec).forEach(function(sym){
        var ser = sec[sym].s || [];
        var by = {};
        ser.forEach(function(p, ix){ by[p[0]] = ix; });
        var rets = [];
        rows.forEach(function(p){
          var ix = by[p.d];
          if (ix === undefined || ix + horizon >= ser.length) return;
          var a = ser[ix][1], b = ser[ix + horizon][1];
          if (a) rets.push((b - a) / a * 100);
        });
        if (rets.length >= Math.max(3, Math.floor(rows.length / 2))) {
          out.push({ sym:sym, en:sec[sym].en, th:sec[sym].th, m:med(rets) });
        }
      });
      out.sort(function(a,b){ return b.m - a.m; });
      return out.slice(0, 3);
    }

    var buckets = {
      extend: picked.filter(function(p){ return p.r > 3; }),
      rotate: picked.filter(function(p){ return p.r >= -3 && p.r <= 3; }),
      brk:    picked.filter(function(p){ return p.r < -3; })
    };

    /* the unconditional base rate over the same sample */
    var all = [];
    for (var z = 0; z + horizon < bench.length; z++) {
      var x = bench[z][1], y = bench[z + horizon][1];
      if (x) all.push((y - x) / x * 100);
    }

    var rets = picked.map(function(p){ return p.r; }).sort(function(a,b){ return a-b; });
    return {
      n: picked.length,
      dates: picked.slice(0, 10).map(function(p){ return p.d; }),
      rets: rets,
      median: med(rets), worst: rets[0], best: rets[rets.length-1],
      downPct: rets.filter(function(v){ return v < 0; }).length / rets.length * 100,
      base: med(all),
      dims: dims.length,
      b: {
        extend:{ n:buckets.extend.length, med:med(buckets.extend.map(function(p){ return p.r; })), led:leaders(buckets.extend) },
        rotate:{ n:buckets.rotate.length, med:med(buckets.rotate.map(function(p){ return p.r; })), led:leaders(buckets.rotate) },
        brk:{    n:buckets.brk.length,    med:med(buckets.brk.map(function(p){ return p.r; })),    led:leaders(buckets.brk) }
      }
    };
  }

  /* ---------- drawing the map ---------- */
  function svgEl(tag, at, txtv){
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (txtv !== undefined) e.textContent = txtv;
    return e;
  }

  function drawTrack(svg){
    var phases = window.SPZ_PHASES || ['early','mid','late','rec'];
    var lbl = { early:{en:'Early',th:'ต้นรอบ'}, mid:{en:'Mid',th:'กลางรอบ'},
                late:{en:'Late',th:'ปลายรอบ'}, rec:{en:'Recession',th:'ถดถอย'},
                recession:{en:'Recession',th:'ถดถอย'} };
    var cur = (window.SPZ_CYCLE && (window.SPZ_CYCLE.live || window.SPZ_CYCLE.phase)) || 'mid';
    var idx = Math.max(0, phases.indexOf(cur));
    var y = 44, x0 = 60, x1 = 940;
    var step = (x1 - x0) / Math.max(1, phases.length - 1);
    var nx = x0 + step * (idx + 0.35);

    svg.appendChild(svgEl('line', {x1:x0, y1:y, x2:x1, y2:y,
      stroke:'rgba(255,255,255,.10)', 'stroke-width':3, 'stroke-linecap':'round'}));
    svg.appendChild(svgEl('line', {x1:x0, y1:y, x2:nx, y2:y, stroke:'var(--neon,#cf0)',
      'stroke-width':3, 'stroke-linecap':'round', opacity:.5}));
    var sweep = svgEl('line', {x1:x0, y1:y, x2:nx, y2:y, stroke:'var(--neon,#cf0)',
      'stroke-width':3, 'stroke-linecap':'round', 'stroke-dasharray':'3 22'});
    sweep.style.animation = 'anFlow 3.2s linear infinite';
    svg.appendChild(sweep);

    phases.forEach(function(p, i){
      var on = i <= idx, px = x0 + step * i;
      svg.appendChild(svgEl('circle', {cx:px, cy:y, r:on ? 7 : 5,
        fill: on ? 'var(--neon,#cf0)' : '#181a16',
        stroke: on ? 'var(--neon,#cf0)' : 'rgba(255,255,255,.2)', 'stroke-width':2}));
      svg.appendChild(svgEl('text', {x:px, y:y + 26, 'text-anchor':'middle',
        class:'an-lab' + (i === idx ? ' on' : '')}, tx(lbl[p] || {en:p, th:p})));
    });

    var pulse = svgEl('circle', {cx:nx, cy:y, r:9, fill:'none', stroke:'var(--white)',
      'stroke-width':1.5, opacity:.9});
    pulse.innerHTML = '<animate attributeName="r" values="9;20;9" dur="2.6s" repeatCount="indefinite"/>' +
                      '<animate attributeName="opacity" values=".85;0;.85" dur="2.6s" repeatCount="indefinite"/>';
    svg.appendChild(pulse);
    svg.appendChild(svgEl('circle', {cx:nx, cy:y, r:6, fill:'var(--white)', class:'an-dot'}));
    svg.appendChild(svgEl('text', {x:nx, y:y - 19, 'text-anchor':'middle', class:'an-you'},
      L() === 'th' ? 'เราอยู่ตรงนี้' : 'WE ARE HERE'));
  }

  function drawFan(svg, host, a){
    var defs = [
      { k:'extend', c:'var(--neon-2,#7CFFB2)', y:70,  name:tx(A.extend), sub:tx(A.extendS) },
      { k:'rotate', c:'var(--amber,#ffb020)',  y:150, name:tx(A.rotate), sub:tx(A.rotateS) },
      { k:'brk',    c:'var(--red,#ff3b4e)',    y:230, name:tx(A.brk),    sub:tx(A.brkS) }
    ];
    var ox = 86, oy = 150;
    svg.appendChild(svgEl('circle', {cx:ox, cy:oy, r:8, fill:'var(--white)', class:'an-dot'}));
    svg.appendChild(svgEl('text', {x:ox, y:oy - 22, 'text-anchor':'middle', class:'an-you'},
      L() === 'th' ? 'วันนี้' : 'TODAY'));

    defs.forEach(function(b){
      var st = a.b[b.k];
      var pct = Math.round(st.n / a.n * 100);
      var g = svgEl('g', { class:'an-br' });
      var w = 2 + pct / 8;
      var d = 'M' + ox + ' ' + oy + ' C ' + (ox+180) + ' ' + oy + ', ' +
              (ox+230) + ' ' + b.y + ', 470 ' + b.y;
      g.appendChild(svgEl('path', {d:d, class:'an-flow', stroke:b.c, 'stroke-width':w, opacity:.32}));
      g.appendChild(svgEl('path', {d:d, class:'an-flow an-dash', stroke:b.c,
        'stroke-width':Math.max(2, w * .55), opacity:.95}));
      g.appendChild(svgEl('path', {d:d, fill:'none', stroke:'transparent',
        'stroke-width':40, 'pointer-events':'stroke'}));
      g.appendChild(svgEl('rect', {x:470, y:b.y - 28, width:500, height:70,
        fill:'transparent', 'pointer-events':'all'}));

      g.appendChild(svgEl('circle', {cx:470, cy:b.y, r:5.5, fill:b.c, class:'an-dot'}));
      g.appendChild(svgEl('text', {x:492, y:b.y - 6, class:'an-brname', fill:'var(--white)'}, b.name));
      g.appendChild(svgEl('text', {x:492, y:b.y + 12, class:'an-brsub'},
        b.sub + ' · ' + st.n + (L() === 'th' ? ' ครั้ง' : ' times')));
      var led = (st.led || []).map(function(s){ return tx(s); }).join(' · ');
      g.appendChild(svgEl('text', {x:492, y:b.y + 32, class:'an-brflow'},
        led ? tx(A.led) + ': ' + led : ''));
      g.appendChild(svgEl('text', {x:960, y:b.y + 2, 'text-anchor':'end',
        class:'an-brpct', fill:b.c}, pct + '%'));
      g.appendChild(svgEl('text', {x:960, y:b.y + 20, 'text-anchor':'end', class:'an-brsub'},
        isNum(st.med) ? tx(A.med) + ' ' + sgn(st.med, 1) + '%' : ''));

      g.addEventListener('mouseenter', function(){ host.classList.add('hov'); g.classList.add('on'); });
      g.addEventListener('mouseleave', function(){ host.classList.remove('hov'); g.classList.remove('on'); });
      svg.appendChild(g);
    });
  }

  /* ROUND U: a simple proportional stacked bar -- one glance, no reading the
     flowing fan chart required -- that sits right above it as the "quick
     version" of the same three numbers the fan chart shows properly. */
  function glanceBarHTML(a){
    var defs = [
      { k:'extend', c:'var(--neon-2,#7CFFB2)', name:tx(A.extend) },
      { k:'rotate', c:'var(--amber,#ffb020)',  name:tx(A.rotate) },
      { k:'brk',    c:'var(--red,#ff3b4e)',    name:tx(A.brk) }
    ];
    var segs = defs.map(function(d){
      var st = a.b[d.k];
      var pct = Math.round(st.n / a.n * 100);
      return { pct:pct, c:d.c, name:d.name };
    });
    return '<div class="an-glance">' +
      '<div class="an-glance-h">' + esc(tx(A.glanceH)) + '</div>' +
      '<div class="an-glance-bar">' + segs.map(function(s){
        return s.pct > 0 ? '<span style="width:' + s.pct + '%;background:' + s.c + '" title="' +
          esc(s.name) + ' ' + s.pct + '%"></span>' : '';
      }).join('') + '</div>' +
      '<div class="an-glance-keys">' + segs.map(function(s){
        return '<span><i style="background:' + s.c + '"></i>' + esc(s.name) + ' <b>' + s.pct + '%</b></span>';
      }).join('') + '</div>' +
    '</div>';
  }

  function histHTML(a){
    var LO = -25, HI = 30, STEP = 5, bins = [];
    for (var v = LO; v < HI; v += STEP) bins.push({ lo:v, hi:v + STEP, n:0 });
    a.rets.forEach(function(r){
      var i = Math.min(bins.length - 1, Math.max(0, Math.floor((r - LO) / STEP)));
      bins[i].n++;
    });
    var max = Math.max.apply(null, bins.map(function(b){ return b.n; })) || 1;
    var zi = 0;
    bins.forEach(function(b, i){ if (b.lo <= 0 && b.hi > 0) zi = i; });
    var zleft = ((zi + (0 - bins[zi].lo) / STEP) / bins.length * 100);

    return '<div class="an-hist" data-an="hist">' + bins.map(function(b, i){
      var neg = b.hi <= 0, zero = b.lo < 0 && b.hi > 0;
      var col = neg ? 'var(--red,#ff3b4e)' : zero ? 'var(--grey-dim)' : 'var(--neon-2,#7CFFB2)';
      return '<div class="an-hb" data-h="' + Math.max(2, b.n / max * 116) + '" style="background:' + col +
        ';opacity:' + (b.n ? (0.45 + 0.55 * b.n / max) : 0.12) + '">' +
        '<span class="an-tip">' + b.lo + '% ' + (L() === 'th' ? 'ถึง' : 'to') + ' ' + b.hi + '% · ' +
          b.n + (L() === 'th' ? ' ครั้ง' : '') + '</span>' +
        (i % 2 === 0 ? '<span class="an-xl">' + b.lo + '</span>' : '') + '</div>';
    }).join('') + '<div class="an-zero" style="left:' + zleft + '%"><span>0%</span></div></div>';
  }

  function anaHTML(){
    /* the snapshot and the history file arrive independently, and either can
       be last — so build on whichever paint first sees both */
    if (!ANA.res && btRaw && snap) {
      try { ANA.res = buildAnalogues(); } catch(e){ ANA.res = null; }
    }
    var a = ANA.res;
    if (!a) return '<div class="an-panel"><div class="rg-empty">' + esc(tx(A.waiting)) + '</div></div>';
    var stats = [
      [tx(A.sMed), sgn(a.median, 1) + '%', a.median < 0 ? 'down' : 'up'],
      [tx(A.sWorst), sgn(a.worst, 1) + '%', 'down'],
      [tx(A.sBest), sgn(a.best, 1) + '%', 'up'],
      [tx(A.sDown), Math.round(a.downPct) + '%', ''],
      [tx(A.sBase), sgn(a.base, 1) + '%', '']
    ];
    return '<div class="an-panel">' +
        '<div class="an-ph"><span>' + esc(tx(A.p1)) + '</span><span>' + esc(tx(A.p1r)) + '</span></div>' +
        '<div class="an-track"><svg viewBox="0 0 1000 92" preserveAspectRatio="none" data-an="track"></svg></div>' +
      '</div>' +
      (a.n < 15 ? '<div class="an-thin">' + esc(tx(A.thin).replace('{n}', a.n)) + '</div>' : '') +
      '<div class="an-panel">' +
        '<div class="an-ph"><span>' + esc(tx(A.p2)) + '</span><span>' +
          esc(tx(A.p2r).replace('{n}', a.n)) + '</span></div>' +
        '<p class="an-plain">' + esc(tx(A.p2plain).replace('{n}', a.n)) + '</p>' +
        glanceBarHTML(a) +
        '<div class="an-fan" data-an="fanbox"><svg viewBox="0 0 1000 300" data-an="fan"></svg></div>' +
        '<div class="an-legend">' +
          '<span><i style="background:var(--neon-2,#7CFFB2)"></i>' + esc(tx(A.extend)) + '</span>' +
          '<span><i style="background:var(--amber,#ffb020)"></i>' + esc(tx(A.rotate)) + '</span>' +
          '<span><i style="background:var(--red,#ff3b4e)"></i>' + esc(tx(A.brk)) + '</span>' +
          '<span>' + esc(tx(A.legendW)) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="an-panel">' +
        '<div class="an-ph"><span>' + esc(tx(A.p3).replace('{n}', a.n)) + '</span><span>' +
          esc(tx(A.p3r)) + '</span></div>' +
        histHTML(a) +
        '<div class="an-stats">' + stats.map(function(s){
          return '<div><div class="an-sl">' + esc(s[0]) + '</div><div class="an-sv ' + s[2] + '">' +
                 esc(s[1]) + '</div></div>';
        }).join('') + '</div>' +
        '<div style="margin-top:18px;"><div class="an-sl">' + esc(tx(A.datesH)) + '</div>' +
          '<div class="an-dates">' + a.dates.map(function(d){ return '<b>' + esc(d) + '</b>'; }).join(' · ') +
        '</div></div>' +
      '</div>' +
      '<div class="rg-note" style="margin-top:18px;">' + esc(tx(A.caveat)) + '</div>';
  }

  function anaMount(host){
    var a = ANA.res;
    if (!a) return;
    var t = host.querySelector('[data-an="track"]');
    if (t) drawTrack(t);
    var f = host.querySelector('[data-an="fan"]');
    var fb = host.querySelector('[data-an="fanbox"]');
    if (f && fb) drawFan(f, fb, a);
    host.querySelectorAll('.an-hb').forEach(function(b, i){
      setTimeout(function(){ b.style.height = b.getAttribute('data-h') + 'px'; }, 120 + i * 50);
    });
  }

  /* ---------------------------------------------------------------
     combined signals — the backtest's answer to "but nobody reads one
     gauge on its own". Every combination was measured over the same
     history; this shows which of them are switched on right now and what
     followed the last time each one was.
     --------------------------------------------------------------- */
  var CB = {
    h:{en:'Several at once — the only reading that was ever worth testing',
       th:'ดูหลายตัวพร้อมกัน — แบบที่ควรทดสอบจริงๆ'},
    lede:{en:'Read alone, most of the eleven gauges failed their backtest. That is the wrong question to ask of them: nobody acts on one dial. So each combination below was measured the same way — every week in the last twenty-odd years when it was switched on, and what the market did over the three months that followed. The ones lit right now are at the top. Two markets are shown on every row, and they do not agree: the first number is the S&P 500, the SET line under it is the Thai market. Read both before you conclude anything.',
          th:'ถ้าอ่านทีละตัว มาตรวัดส่วนใหญ่จาก 11 ตัวสอบตก แต่นั่นเป็นคำถามที่ผิดสำหรับมัน เพราะไม่มีใครตัดสินใจจากเข็มเดียว ข้างล่างนี้จึงวัดแบบเดียวกันแต่เป็น "ชุด" — ทุกสัปดาห์ในยี่สิบกว่าปีที่ชุดนั้นติด แล้วสามเดือนถัดมาตลาดทำอะไร ชุดที่กำลังติดอยู่ตอนนี้จะอยู่บนสุด แต่ละแถวแสดงสองตลาด และสองตลาดนี้ให้คำตอบไม่ตรงกัน: ตัวเลขแรกคือ S&P 500 ส่วนบรรทัด SET ใต้มันคือตลาดไทย — ดูให้ครบทั้งสองก่อนสรุป'},
    now:{en:'red on the board right now',th:'แดงอยู่บนกระดานตอนนี้'},
    nowNone:{en:'Nothing is in the red zone at the moment, so none of the count-based combinations are switched on.',
             th:'ตอนนี้ไม่มีตัวไหนอยู่ในโซนแดง ชุดที่นับจำนวนจึงยังไม่ติดสักชุด'},
    nowSome:{en:'That puts today inside the <b>{c}</b> bucket. Historically that condition was switched on <b>{o}% of weeks</b>, and the three months after it first lit produced a median of <b>{m}</b> against <b>{b}</b> for any three months in the same stretch.',
             th:'วันนี้จึงตกอยู่ในกลุ่ม <b>{c}</b> ในอดีตเงื่อนไขนี้ติดอยู่ <b>{o}% ของสัปดาห์ทั้งหมด</b> และสามเดือนหลังจากมันเพิ่งติด ให้ผลค่ากลาง <b>{m}</b> เทียบกับ <b>{b}</b> ของสามเดือนทั่วไปในช่วงเดียวกัน'},
    on:{en:'ON NOW',th:'กำลังติด'},
    off:{en:'off',th:'ไม่ติด'},
    eps:{en:'{n}× since {y}',th:'{n} ครั้ง ตั้งแต่ {y}'},
    onrate:{en:'on {p}% of weeks',th:'ติด {p}% ของสัปดาห์'},
    after:{en:'3m after: <b class="{c}">{m}</b> <i>vs {b} normal</i>',
           th:'3 เดือนถัดมา <b class="{c}">{m}</b> <i>ปกติ {b}</i>'},
    setl:{en:'SET: <b class="{c}">{m}</b>',th:'ตลาดไทย <b class="{c}">{m}</b>'},
    luck:{en:'chance could explain it',th:'ความบังเอิญอธิบายได้'},
    notLuck:{en:'unlikely to be chance',th:'ไม่น่าเป็นความบังเอิญ'},
    none:{en:'The history file has not loaded yet.',th:'ยังโหลดไฟล์ประวัติไม่เสร็จ'},
    foot:{en:'Every one of these was tested at the same time, and testing many things guarantees that a few look convincing by accident — so a combination only earns a grade after its luck check has been multiplied by the number of tests run. The per-combination detail, and the same test re-run against the Thai market instead, is in the {a}.',
          th:'ทุกชุดนี้ถูกทดสอบพร้อมกัน และการทดสอบหลายอย่างรับประกันว่าจะมีบางอันดูน่าเชื่อเพราะบังเอิญ ชุดหนึ่งจึงจะได้เกรดก็ต่อเมื่อเอาค่าตรวจฟลุ๊คคูณจำนวนการทดสอบทั้งหมดแล้ว รายละเอียดรายชุด และการรันทดสอบเดียวกันกับตลาดไทยแทน อยู่ในหน้า{a}'},
    lab:{en:'Proof Lab',th:'ทดสอบเรดาร์'}
  };

  function comboState(c, stMap){
    if (c.kind === 'count') {
      /* with seven dials red, "2 or more" is also true — but lighting up
         five buckets at once says nothing. Only the bucket today actually
         falls into is marked live. */
      var avail = 0, red = 0;
      for (var k in stMap) {
        if (stMap[k] === 'na') continue;
        avail++;
        if (stMap[k] === 'alert') red++;
      }
      return { live: avail >= 8 && red >= 2 && c.need === Math.min(6, red), members: [] };
    }
    var mem = (c.members || []).map(function(m){ return { k:m, s:stMap[m] || 'na' }; });
    var live = mem.length > 0 &&
      mem.every(function(m){ return m.s === 'warn' || m.s === 'alert'; }) &&
      mem.some(function(m){ return m.s === 'alert'; });
    return { live: live, members: mem };
  }

  function gaugeName(k){
    for (var i = 0; i < GAUGES.length; i++) if (GAUGES[i].k === k) return tx(GAUGES[i].n);
    return k;
  }

  function comboRow(c, live, members){
    var core = (c.h || {})['63'] || {};
    var alt = (c.alt || [])[0] || {};
    var altCore = (alt.h || {})['63'] || {};
    var g = c.grade || 'n/a';
    var gCls = (g === 'A' || g === 'B') ? 'ok' : g === 'C' ? 'warn' : 'alert';
    var pAdj = core.p_adj;
    var lucky = isNum(pAdj) ? (pAdj > 0.5) : null;

    var mem = members.length ? '<div class="rg-cbm">' + members.map(function(m){
      return '<span class="' + (m.s === 'alert' ? 'hot' : m.s === 'warn' ? 'mid' : '') + '">' +
        esc(gaugeName(m.k)) + '</span>';
    }).join('') + '</div>' : '';

    var stat = '';
    if (isNum(core.median)) {
      stat += tx(CB.after)
        .replace('{c}', core.median < 0 ? 'dn' : 'up')
        .replace('{m}', sgn(core.median) + '%')
        .replace('{b}', (isNum(core.base) ? sgn(core.base) : '—') + '%');
    }
    if (isNum(altCore.median)) {
      stat += '<br><span class="setline">' + tx(CB.setl)
        .replace('{c}', altCore.median < 0 ? 'dn' : 'up')
        .replace('{m}', sgn(altCore.median) + '%') +
        (isNum(altCore.base) ? ' <i>' + (L() === 'th' ? 'ปกติ ' : 'vs ') +
          sgn(altCore.base) + '%' + (L() === 'th' ? '' : ' normal') + '</i>' : '') +
        '</span>';
    }
    stat += '<br><i>' + esc(tx(CB.eps).replace('{n}', c.episodes || 0)
              .replace('{y}', String(c.first || '').slice(0, 4))) + '</i>';
    if (isNum(c.on_rate)) {
      stat += ' <i>· ' + esc(tx(CB.onrate).replace('{p}', c.on_rate)) + '</i>';
    }
    if (lucky !== null) {
      stat += '<br><i>' + esc(tx(lucky ? CB.luck : CB.notLuck)) + '</i>';
    }

    return '<div class="rg-cbrow' + (live ? ' live' : '') + '">' +
      '<span class="rg-cbs' + (live ? ' live' : '') + '">' + esc(tx(live ? CB.on : CB.off)) + '</span>' +
      '<span><span class="rg-cbn">' + esc(tx(c)) + '</span>' +
        '<span class="rg-cbg ' + (gCls === 'ok' ? 'ok' : '') + '" style="color:' +
          (gCls === 'ok' ? 'var(--neon-2,#7CFFB2)' : gCls === 'warn' ? 'var(--amber,#ffb020)' : 'var(--grey-dim)') +
          '">' + esc(L() === 'th' ? 'ผลทดสอบ ' : 'TEST ') + esc(g === 'n/a' ? '—' : g) + '</span>' +
        '<div class="rg-cbd">' + esc(tx({ en:c.en_d || '', th:c.th_d || c.en_d || '' })) + '</div>' + mem +
      '</span>' +
      '<span class="rg-cbstat">' + stat + '</span>' +
    '</div>';
  }

  function comboHTML(){
    if (!btRaw || !(btRaw.combos || []).length) {
      return '<div class="rg-empty">' + esc(tx(CB.none)) + '</div>';
    }
    var sc = scoreOf();
    var stMap = {};
    GAUGES.forEach(function(g, i){ stMap[g.k] = sc.states[i]; });

    var rows = (btRaw.combos || []).map(function(c){
      var s = comboState(c, stMap);
      return { c:c, live:s.live, members:s.members };
    });
    /* live first; then the named ideas ahead of the raw counts, and the
       counts in their own order rather than shuffled by score */
    rows.sort(function(a, b){
      if (a.live !== b.live) return a.live ? -1 : 1;
      var ca = a.c.kind === 'count', cb = b.c.kind === 'count';
      if (ca !== cb) return ca ? 1 : -1;
      if (ca) return (a.c.need || 0) - (b.c.need || 0);
      var ea = ((a.c.h || {})['63'] || {}).edge, eb = ((b.c.h || {})['63'] || {}).edge;
      return (isNum(ea) ? ea : 99) - (isNum(eb) ? eb : 99);
    });

    /* the headline: how many are red, and what that count has meant */
    var n = sc.alerts;
    var bucket = null;
    if (n >= 2) {
      var want = 'any' + Math.min(6, n);
      bucket = (btRaw.combos || []).filter(function(c){ return c.k === want; })[0] || null;
    }
    var core = bucket ? ((bucket.h || {})['63'] || {}) : {};
    var head = '<div class="rg-cbhead">' +
      '<span class="rg-cbbig" style="color:' +
        (n >= 4 ? 'var(--red,#ff3b4e)' : n >= 2 ? 'var(--amber,#ffb020)' : 'var(--neon-2,#7CFFB2)') +
        '">' + n + '</span>' +
      '<span class="rg-cbtx"><b>' + esc(tx(CB.now)) + '</b><br>' +
        (bucket && isNum(core.median)
          ? tx(CB.nowSome).replace('{c}', esc(tx(bucket)))
              .replace('{o}', isNum(bucket.on_rate) ? bucket.on_rate : '—')
              .replace('{m}', sgn(core.median) + '%')
              .replace('{b}', (isNum(core.base) ? sgn(core.base) : '—') + '%')
          : esc(tx(CB.nowNone))) +
      '</span></div>';

    return head + '<div class="rg-cb">' +
      rows.map(function(r){ return comboRow(r.c, r.live, r.members); }).join('') + '</div>' +
      '<div class="rg-btnote" style="margin-top:16px;">' +
        tx(CB.foot).replace('{a}', '<a data-rg="goproof">' + esc(tx(CB.lab)) + '</a>') +
      '</div>';
  }

  /* the clusters that are lit right now, for the banner at the top */
  function liveClusters(){
    if (!btRaw || !(btRaw.combos || []).length) return [];
    var sc = scoreOf();
    var stMap = {};
    GAUGES.forEach(function(g, i){ stMap[g.k] = sc.states[i]; });
    return (btRaw.combos || []).filter(function(c){
      return c.kind === 'cluster' && comboState(c, stMap).live;
    });
  }

  function btNote(){
    if (!grades || !Object.keys(grades).length) return '';
    var ks = Object.keys(grades);
    var good = ks.filter(function(k){ return 'AB'.indexOf(grades[k].g) !== -1; }).length;
    var weak = ks.filter(function(k){ return grades[k].g === 'C'; }).length;
    var none = ks.filter(function(k){ return 'DF'.indexOf(grades[k].g) !== -1; }).length;
    var th = L() === 'th';
    return '<div class="rg-btnote" style="margin-top:22px;">' +
      (th ? '<b>ผลทดสอบย้อนหลังของมาตรวัดพวกนี้:</b> จาก ' + ks.length + ' ตัว มี <b>' + good +
            '</b> ตัวที่พิสูจน์แล้วว่ามีผล, <b>' + weak + '</b> ตัวผลอ่อน และ <b>' + none +
            '</b> ตัวที่ทดสอบแล้วไม่มีผลหรือได้ผลตรงข้าม — แปลว่าให้อ่านมาตรวัดพวกนี้เป็น "ตอนนี้ตลาดหน้าตาแบบไหน" ไม่ใช่ "ตลาดจะลง" ' +
            'กดดูรายละเอียดทีละตัวได้ที่หน้า <a data-rg="goproof">ทดสอบเรดาร์</a>'
         : '<b>What the backtest says about these gauges:</b> of ' + ks.length + ', <b>' + good +
           '</b> showed a measurable edge, <b>' + weak + '</b> were weak, and <b>' + none +
           '</b> showed none or the opposite — so read these as "what kind of market is this", not as "the market will fall". ' +
           'The per-gauge detail is in the <a data-rg="goproof">Proof Lab</a>.') +
    '</div>';
  }

  function paint(){
    if (!sec) return;
    var host = sec.querySelector('[data-rg="body"]');
    if (!host) return;
    var r = reg();

    if (!snap || !Object.keys(r).length) {
      host.innerHTML = '<div class="rg-empty">' + esc(tx(COPY.waiting)) + '</div>';
      return;
    }

    var sc = scoreOf();
    var mood = sc.alerts <= 1 ? 'ok' : sc.alerts <= 3 ? 'warn' : 'alert';
    var pct = sc.known ? Math.round((sc.alerts + sc.soft * 0.5) / sc.known * 100) : 0;
    var barColor = mood === 'ok' ? 'var(--neon-2,#7CFFB2)' : mood === 'warn' ? 'var(--amber,#ffb020)' : 'var(--red,#ff3b4e)';
    var tags = window.__SPZ_TAGS;

    host.innerHTML =
      '<div class="rg-verdict">' +
        '<div class="rg-vhead">' +
          '<span class="rg-score">' + sc.alerts + '</span>' +
          '<span class="rg-of">/ ' + sc.known + ' &nbsp;' + esc(tx(COPY.verdictOf)) +
            (sc.soft ? ' &nbsp;·&nbsp; ' + sc.soft + ' ' + esc(tx(COPY.soft)) : '') + '</span>' +
          '<span class="rg-label ' + mood + '">' +
            esc(tx(mood === 'ok' ? COPY.vOk : mood === 'warn' ? COPY.vMix : COPY.vAlert)) + '</span>' +
          (tags ? tags.html('auto', 'spz-tag-head') : '') +
        '</div>' +
        '<div class="rg-meter"><i style="width:' + Math.max(4, pct) + '%;background:' + barColor + '"></i></div>' +
        '<div class="rg-vsub">' + esc(tx(mood === 'ok' ? COPY.vOkD : mood === 'warn' ? COPY.vMixD : COPY.vAlertD)) + '</div>' +
        '<div class="rg-cwhy" style="margin-top:14px;max-width:820px;"><b style="color:var(--white)">' +
          esc(tx(COPY.howH)) + '</b> — ' + esc(tx(COPY.how)) + '</div>' +
      '</div>' +
      '<div class="rg-grid">' + GAUGES.map(function(g){ return gaugeHTML(g, r); }).join('') + '</div>' +
      btNote() +
      '<div class="rg-sec"><h3 class="rg-sech">' + esc(tx(CB.h)) + '</h3>' +
        '<p class="rg-secl">' + esc(tx(CB.lede)) + '</p>' + comboHTML() + '</div>' +
      '<div class="rg-sec"><h3 class="rg-sech">' + esc(tx(A.h)) + '</h3>' +
        '<p class="rg-secl">' + esc(tx(A.lede)) + '</p>' + anaHTML() + '</div>' +
      '<div class="rg-sec"><h3 class="rg-sech">' + esc(tx(COPY.divH)) + '</h3>' +
        '<p class="rg-secl">' + esc(tx(COPY.divL)) + '</p>' + divHTML(r) + '</div>' +
      '<div class="rg-sec"><h3 class="rg-sech">' + esc(tx(COPY.moneyH)) + '</h3>' +
        '<p class="rg-secl">' + esc(tx(COPY.moneyL)) + '</p>' + moneyHTML() + '</div>' +
      '<div class="rg-sec"><h3 class="rg-sech">' + esc(tx(COPY.hedgeH)) + '</h3>' +
        '<p class="rg-secl">' + esc(tx(COPY.hedgeL)) + '</p>' + hedgeHTML() + '</div>' +
      '<div class="rg-sec"><h3 class="rg-sech">' + esc(tx(COPY.playH)) + '</h3>' +
        '<p class="rg-secl">' + esc(tx(COPY.playL)) + '</p>' + playHTML(r) + '</div>' +
      '<div class="rg-note">' + esc(tx(COPY.note)) + '</div>';

    anaMount(host);

    host.querySelectorAll('[data-rg="goproof"]').forEach(function(go){
      go.addEventListener('click', function(){
        var link = document.querySelector('[data-route-to="proof"]');
        if (link) link.click();
      });
    });
  }

  /* ---------------------------------------------------------------
     the turn-signal popup — a small card, bottom-right, that clears
     itself: acknowledge it, open the detail (both dismiss it too),
     or leave it alone and the ring runs out in 10s and it goes away
     on its own. Hover or focus pauses the countdown so it never
     vanishes mid-read.
     --------------------------------------------------------------- */
  var ACK_KEY = 'spz_turn_ack_v1';
  var AUTO_MS = 10000; /* keep in sync with the abDrain keyframe duration in CSS */
  var autoTimer = null, autoStart = 0, autoRemain = AUTO_MS, autoPaused = false;

  function alertState(){
    var r = reg();
    if (!snap || !Object.keys(r).length) return null;
    var sc = scoreOf();
    var hits = [];
    GAUGES.forEach(function(g, i){
      if (sc.states[i] === 'alert') hits.push({ k:g.k, n:tx(g.n) });
    });
    var divTrigger = sc.bear >= 3;
    /* the memory module can also raise the strip — a cycle change or money
       moving to a different group matters as much as a gauge going red */
    var chg = null;
    try { chg = window.__SPZ_WATCH && window.__SPZ_WATCH.headline && window.__SPZ_WATCH.headline(); }
    catch(e){ chg = null; }
    /* a whole cluster lighting up is a bigger deal than three unrelated
       dials, and the backtest is the only reason to say so — so name it */
    var cls = [];
    try { cls = liveClusters(); } catch(e){ cls = []; }
    if (!hits.length && !divTrigger && !cls.length && !chg) return null;
    /* a named cluster says more than a list of dials, so when one is lit the
       banner leads with it and only counts the rest */
    var parts;
    if (cls.length) {
      parts = cls.slice(0, 2).map(function(c){ return tx(c); });
      if (cls.length > 2) parts.push('+' + (cls.length - 2));
      if (hits.length) parts.push(hits.length + (L() === 'th' ? ' ตัวแดง' : ' red'));
    } else {
      parts = hits.slice(0, 3).map(function(h){ return h.n; });
      if (hits.length > 3) parts.push('+' + (hits.length - 3));
    }
    if (divTrigger) parts.push(tx(COPY.abDiv).replace('{n}', sc.bear));
    if (chg) parts.unshift(chg.text);
    return {
      level: (hits.length >= 3 || cls.length || chg) ? 'alert' : 'warn',
      text: parts.join(' · '),
      sig: hits.map(function(h){ return h.k; }).sort().join(',') + '|' +
           cls.map(function(c){ return c.k; }).sort().join(',') + '|' +
           (divTrigger ? 'div' : '') + '|' + (chg ? chg.sig : '')
    };
  }

  function clearAutoTimer(){
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }
  function scheduleAuto(ms){
    clearAutoTimer();
    autoStart = Date.now();
    autoTimer = setTimeout(function(){ dismissBar(); }, ms);
  }
  function startAuto(){
    autoPaused = false;
    autoRemain = AUTO_MS;
    if (bar) {
      bar.classList.remove('paused');
      var ring = bar.querySelector('[data-ab="ringfg"]');
      if (ring) ring.classList.remove('run');
      void bar.offsetWidth; /* force reflow so the drain animation restarts from zero */
      if (ring) ring.classList.add('run');
    }
    scheduleAuto(AUTO_MS);
  }
  function pauseAuto(){
    if (autoPaused || !autoTimer) return;
    autoPaused = true;
    autoRemain = Math.max(0, autoRemain - (Date.now() - autoStart));
    clearAutoTimer();
    if (bar) bar.classList.add('paused');
  }
  function resumeAuto(){
    if (!autoPaused) return;
    autoPaused = false;
    if (bar) bar.classList.remove('paused');
    scheduleAuto(autoRemain || AUTO_MS);
  }

  /* used for both "got it" and the auto-timeout — either way the reader has
     seen it, so the same signature does not nag again */
  function dismissBar(){
    clearAutoTimer();
    var st = alertState();
    if (st) lsSet(ACK_KEY, st.sig);
    if (bar) bar.classList.remove('show');
    try { window.dispatchEvent(new Event('resize')); } catch(e){}
  }

  function buildBar(){
    if (bar) return true;
    if (!document.body) return false;
    bar = document.createElement('div');
    bar.id = 'spzAlertBar';
    bar.innerHTML =
      '<div class="ab-ring"><svg viewBox="0 0 26 26" aria-hidden="true">' +
        '<circle class="ab-ring-bg" cx="13" cy="13" r="10.5"></circle>' +
        '<circle class="ab-ring-fg" data-ab="ringfg" cx="13" cy="13" r="10.5"></circle>' +
      '</svg><span class="ab-dot"></span></div>' +
      '<div class="ab-body">' +
        '<div class="ab-head" data-ab="t"></div>' +
        '<p class="ab-txt" data-ab="d"></p>' +
        '<div class="ab-actions">' +
          '<button type="button" class="ab-go" data-ab="go"></button>' +
          '<button type="button" data-ab="ack"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);

    bar.querySelector('[data-ab="go"]').addEventListener('click', function(){
      dismissBar();
      var link = document.querySelector('[data-route-to="regime"]');
      if (link) link.click(); else location.hash = '#/regime';
    });
    bar.querySelector('[data-ab="ack"]').addEventListener('click', dismissBar);
    bar.addEventListener('mouseenter', pauseAuto);
    bar.addEventListener('mouseleave', resumeAuto);
    bar.addEventListener('focusin', pauseAuto);
    bar.addEventListener('focusout', resumeAuto);
    return true;
  }

  function paintBar(){
    if (!buildBar()) return;
    var st = alertState();
    if (!st || lsGet(ACK_KEY) === st.sig) {
      clearAutoTimer();
      bar.classList.remove('show');
      bar.removeAttribute('data-sig');
      return;
    }
    var isNew = bar.dataset.sig !== st.sig || !bar.classList.contains('show');
    bar.dataset.sig = st.sig;
    bar.classList.toggle('lvl-alert', st.level === 'alert');
    bar.querySelector('[data-ab="t"]').textContent = '⚠ ' + tx(COPY.abTitle);
    bar.querySelector('[data-ab="d"]').textContent = st.text;
    bar.querySelector('[data-ab="go"]').textContent = tx(COPY.abGo);
    bar.querySelector('[data-ab="ack"]').textContent = tx(COPY.abAck);
    bar.classList.add('show');
    if (isNew) startAuto();
    try { window.dispatchEvent(new Event('resize')); } catch(e){}
  }

  /* ---------------------------------------------------------------
     mount
     --------------------------------------------------------------- */
  function build(){
    if (document.getElementById('regime')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'regime';
    sec.setAttribute('data-route', 'regime');
    sec.innerHTML =
      '<div class="rg-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-rg="eb"></span></div>' +
          '<h2 data-rg="h"></h2>' +
          '<p class="lede" data-rg="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-rg="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'regime', feat:true, after:'flow',
      t:{en:'Turning Point Radar',th:'สัญญาณเปลี่ยนทิศ'},
      d:{en:'11 early-warning gauges — breadth, credit, the curve, leadership, currencies — that move first, before the market actually turns. Use this to catch a turn coming; use Capital Flow to see where the money already is.',
         th:'11 ตัวชี้วัดเตือนล่วงหน้า — ความกว้างของตลาด เครดิต เส้นผลตอบแทน ผู้นำตลาด ค่าเงิน — ที่มักขยับก่อนตลาดจะพลิกจริง ใช้หน้านี้ดักสัญญาณเปลี่ยนทิศล่วงหน้า ส่วนตอนนี้เงินอยู่ตรงไหนแล้วจริงๆ ให้ไปดูหน้า “เงินทุนไหลไปไหน”'}
    });

    sec.__render = repaintAll;
    repaintAll();
    return true;
  }

  function repaintAll(){
    loadGrades();
    if (sec) {
      var q = function(k){ return sec.querySelector('[data-rg="' + k + '"]'); };
      if (q('eb')) q('eb').textContent = tx(COPY.eyebrow);
      if (q('h')) q('h').textContent = tx(COPY.h);
      if (q('lede')) q('lede').textContent = tx(COPY.lede);
      paint();
    }
    paintBar();
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(e){
      snap = e.detail;
      if (btRaw) { try { ANA.res = buildAnalogues(); } catch(err){ ANA.res = null; } }
      repaintAll();
    });
    var seed = setInterval(function(){
      var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
      if (s) { snap = s; repaintAll(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(repaintAll)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_REGIME = { repaint: repaintAll, gauges: GAUGES, plays: PLAYS,
                          score: scoreOf, alert: alertState, analogues: buildAnalogues,
                          raw: function(){ return btRaw; }, ana: ANA,
                          snap: function(){ return snap; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1100); });
  } else {
    setTimeout(boot, 1100);
  }
})();
