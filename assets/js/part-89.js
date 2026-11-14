/* =====================================================================
   SPACEZ BEGINNER COURSE (2026-11-15)
   User request: menus 01–07 of the Learn group (except 05, the glossary)
   should read as one course for someone who knows nothing yet: what money
   and investing are, which markets exist (stocks, bonds, funds, gold, forex,
   crypto, options…), how the stock market works, how you earn (price gain +
   dividend), planning, choosing and valuing a stock, reading a chart, and
   where to go next — basic to advanced, with calculators.
   * One lesson block (.spzc) is mounted at the top of each page, right under
     its heading: 01 #stockclass, 02 #basics, 03 #start, 04 #types,
     06 #signals, 07 #guided. Page 05 (#glossary) is untouched; the course bar
     only links to it.
   * Each block: course bar (7 steps, ticks for finished chapters), the
     lesson, a quick check question, a calculator where it helps, and
     "next chapter". Progress = localStorage 'spz.course.v1' (this browser
     only). Collapsed / open state = 'spz.course.fold'.
   * Facts checked 2026-11-15: SET hours (set.or.th trading-hours page),
     board lot 100 (50 for shares ≥ 500 THB for 6 months), daily limit ±30%,
     T+2 settlement (since 2018), dividend withholding 10% (final, or file and
     use the dividend tax credit), capital gains on SET shares tax-exempt for
     individuals; the proposed sale tax (FTT) is still not collected.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_COURSE) return;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] != null ? o[L()] : o.en); }
  function B(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function lsGet(k, d){ try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } }
  function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  function fmt(n, d){ if(!isFinite(n)) return '–'; return Number(n).toLocaleString(L() === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits:d || 0, maximumFractionDigits:d == null ? 0 : d }); }

  var IC = {
    coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2a3 3 0 00-2.8-1.4c-1.6 0-2.8.8-2.8 2.1 0 3 5.8 1.4 5.8 4.3 0 1.3-1.3 2.1-3 2.1a3.3 3.3 0 01-3-1.5M12 6.3v1.5M12 16.4v1.4"/>',
    bank:'<path d="M3 9.5L12 4l9 5.5"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/>',
    doc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
    basket:'<path d="M4 9h16l-1.6 9.5a2 2 0 01-2 1.5H7.6a2 2 0 01-2-1.5z"/><path d="M9 9l3-5 3 5"/>',
    trend:'<path d="M3 17l5-5 4 3 8-8"/><path d="M14 7h6v6"/>',
    gold:'<path d="M4 18l2.5-6h11L20 18z"/><path d="M8 12l2-5h4l2 5"/>',
    fx:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    btc:'<circle cx="12" cy="12" r="8.5"/><path d="M9.5 7.5v9M9.5 8h3.5a2 2 0 010 4H9.5h4a2 2 0 010 4H9.5M11 6.5v1.5M11 16v1.5"/>',
    opt:'<path d="M4 19V5"/><path d="M4 19h16"/><path d="M6 15l4-4 3 2 6-6"/><path d="M15 7h4v4"/>',
    shield:'<path d="M12 3l8 3v6c0 4.6-3.4 8-8 9-4.6-1-8-4.4-8-9V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    gift:'<rect x="3.5" y="8.5" width="17" height="12" rx="1.5"/><path d="M12 8.5v12M3.5 12.5h17"/><path d="M12 8.5c-2.5 0-4.5-1-4.5-2.7S9.7 3.5 12 8.5c2.3-5 4.5-4.4 4.5-2.7S14.5 8.5 12 8.5z"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h0M16 11h0M8 15h2M12 15h0M16 15h0M8 18.5h0M12 18.5h0M16 18.5h0"/>',
    eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    alert:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.1"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    chev:'<path d="M6 9l6 6 6-6"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    split:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6 6"/><path d="M12 12L5 16.5"/>',
    candle:'<path d="M7 3v4M7 15v6M17 5v3M17 17v3"/><rect x="5" y="7" width="4" height="8" rx="1"/><rect x="15" y="8" width="4" height="9" rx="1"/>'
  };
  function ico(k){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }

  /* ------------------------------------------------------------------
     course map
     ------------------------------------------------------------------ */
  var STEPS = [
    { n:1, r:'stockclass', t:B('Money & markets', 'เงินและตลาดการเงิน') },
    { n:2, r:'basics', t:B('How stocks pay you', 'หุ้นให้เงินเรายังไง') },
    { n:3, r:'start', t:B('Plan before you buy', 'วางแผนก่อนซื้อ') },
    { n:4, r:'types', t:B('Choose & value', 'เลือกหุ้นและตีราคา') },
    { n:5, r:'glossary', t:B('Key numbers', 'ตัวเลขสำคัญ') },
    { n:6, r:'signals', t:B('Read a chart', 'อ่านกราฟเบื้องต้น') },
    { n:7, r:'guided', t:B('Next level', 'ขั้นต่อไป') }
  ];
  function stepOf(r){ for(var i = 0; i < STEPS.length; i++) if(STEPS[i].r === r) return STEPS[i]; return null; }
  function nextOf(r){ for(var i = 0; i < STEPS.length - 1; i++) if(STEPS[i].r === r) return STEPS[i + 1]; return null; }

  /* ------------------------------------------------------------------
     drawings (inline SVG, colours from CSS vars so both themes work)
     ------------------------------------------------------------------ */
  function svgLadder(){
    var rows = [
      [B('Bank deposit', 'เงินฝาก'), 1, B('very low', 'ต่ำมาก')],
      [B('Government bond', 'พันธบัตรรัฐบาล'), 2, B('low', 'ต่ำ')],
      [B('Mutual fund / ETF', 'กองทุนรวม / ETF'), 3, B('mixed', 'แล้วแต่กอง')],
      [B('Gold', 'ทองคำ'), 3.4, B('medium', 'กลาง')],
      [B('Stocks', 'หุ้น'), 4, B('medium–high', 'กลาง–สูง')],
      [B('Forex', 'ฟอเร็กซ์'), 4.6, B('high', 'สูง')],
      [B('Crypto', 'คริปโต'), 5, B('very high', 'สูงมาก')],
      [B('Options / futures', 'ออปชั่น / ฟิวเจอร์ส'), 5.4, B('very high (leverage)', 'สูงมาก (มีเลเวอเรจ)')]
    ];
    var h = 30 * rows.length + 34, out = '<svg class="spzc-svg" viewBox="0 0 700 ' + h + '" role="img" aria-label="' + esc(T(B('Risk ladder of common investments', 'บันไดความเสี่ยงของการลงทุนแบบต่างๆ'))) + '">';
    out += '<text x="0" y="16" class="t-mut">' + esc(T(B('Lower risk · steadier', 'เสี่ยงต่ำ · นิ่งกว่า'))) + '</text><text x="700" y="16" text-anchor="end" class="t-mut">' + esc(T(B('Higher risk · can swing hard', 'เสี่ยงสูง · ขึ้นลงแรง'))) + '</text>';
    rows.forEach(function(r, i){
      var y = 30 + i * 30, w = 40 + r[1] * 62;
      out += '<rect x="170" y="' + y + '" width="' + w + '" height="20" rx="6" class="bar" style="--k:' + (r[1] / 5.4).toFixed(2) + '"/>';
      out += '<text x="160" y="' + (y + 14.5) + '" text-anchor="end" class="t-lab">' + esc(T(r[0])) + '</text>';
      out += '<text x="' + (178 + w) + '" y="' + (y + 14.5) + '" class="t-mut">' + esc(T(r[2])) + '</text>';
    });
    return out + '</svg>';
  }
  function svgPie(){
    var segs = [[0, 0.35, 'a'], [0.35, 0.6, 'b'], [0.6, 0.8, 'c'], [0.8, 1, 'd']], out = '<svg class="spzc-svg spzc-pie" viewBox="0 0 640 230" role="img" aria-label="' + esc(T(B('A company split into shares', 'บริษัทถูกแบ่งเป็นหุ้น'))) + '"><g transform="translate(120 115)">';
    segs.forEach(function(s){
      var a0 = s[0] * Math.PI * 2 - Math.PI / 2, a1 = s[1] * Math.PI * 2 - Math.PI / 2, r = 92;
      out += '<path class="sl sl-' + s[2] + '" d="M0 0L' + (r * Math.cos(a0)).toFixed(1) + ' ' + (r * Math.sin(a0)).toFixed(1) + 'A' + r + ' ' + r + ' 0 ' + (s[1] - s[0] > 0.5 ? 1 : 0) + ' 1 ' + (r * Math.cos(a1)).toFixed(1) + ' ' + (r * Math.sin(a1)).toFixed(1) + 'Z"/>';
    });
    out += '<circle r="34" class="hole"/><text y="5" text-anchor="middle" class="t-lab">' + esc(T(B('Company', 'บริษัท'))) + '</text></g>';
    var lines = [
      B('1 company = many equal pieces (shares)', '1 บริษัท = แบ่งเป็นชิ้นเท่าๆ กัน (หุ้น)'),
      B('Own 100 of 1,000,000 shares → you own 0.01%', 'มี 100 หุ้น จาก 1,000,000 หุ้น → เป็นเจ้าของ 0.01%'),
      B('Company earns more → each piece is worth more', 'บริษัทกำไรมากขึ้น → แต่ละชิ้นมีค่ามากขึ้น'),
      B('Part of the profit can be paid out → dividend', 'กำไรบางส่วนแบ่งจ่ายให้เจ้าของ → เงินปันผล')
    ];
    lines.forEach(function(l, i){ out += '<g transform="translate(262 ' + (46 + i * 46) + ')"><circle r="11" class="dot dot-' + 'abcd'.charAt(i) + '"/><text x="0" y="4.5" text-anchor="middle" class="t-num">' + (i + 1) + '</text><text x="22" y="5" class="t-lab">' + esc(T(l)) + '</text></g>'; });
    return out + '</svg>';
  }
  function svgDay(){
    var out = '<svg class="spzc-svg" viewBox="0 0 640 120" role="img" aria-label="' + esc(T(B('SET trading day', 'เวลาซื้อขายตลาดหุ้นไทย'))) + '">';
    var x0 = 20, x1 = 620, t0 = 9.5 * 60, t1 = 17 * 60;
    function X(h, m){ return x0 + ((h * 60 + m) - t0) / (t1 - t0) * (x1 - x0); }
    var blocks = [[9, 30, 10, 0, 'pre', B('Pre-open', 'ก่อนเปิด')], [10, 0, 12, 30, 'on', B('Morning', 'ช่วงเช้า')], [12, 30, 14, 0, 'off', B('Lunch break', 'พักเที่ยง')], [14, 0, 14, 30, 'pre', B('Pre-open', 'ก่อนเปิด')], [14, 30, 16, 30, 'on', B('Afternoon', 'ช่วงบ่าย')], [16, 30, 17, 0, 'pre', B('Close', 'ปิด')]];
    blocks.forEach(function(b){
      var a = X(b[0], b[1]), c = X(b[2], b[3]);
      out += '<rect x="' + a.toFixed(1) + '" y="34" width="' + (c - a - 2).toFixed(1) + '" height="30" rx="6" class="blk blk-' + b[4] + '"/>';
      if(c - a > 50) out += '<text x="' + ((a + c) / 2).toFixed(1) + '" y="54" text-anchor="middle" class="t-in">' + esc(T(b[5])) + '</text>';
    });
    [[9, 30], [10, 0], [12, 30], [14, 0], [14, 30], [16, 30], [17, 0]].forEach(function(t){ out += '<text x="' + X(t[0], t[1]).toFixed(1) + '" y="86" text-anchor="middle" class="t-mut">' + t[0] + ':' + (t[1] ? '30' : '00') + '</text>'; });
    out += '<text x="20" y="20" class="t-mut">' + esc(T(B('Mon–Fri except holidays · exact open is a random moment in the last minutes of pre-open', 'จันทร์–ศุกร์ ยกเว้นวันหยุด · เวลาเปิดจริงสุ่มในช่วงนาทีท้ายของช่วงก่อนเปิด'))) + '</text>';
    out += '<text x="20" y="110" class="t-mut">' + esc(T(B('Pre-open = orders are collected and matched at one opening price', 'ช่วงก่อนเปิด = รับคำสั่งไว้ก่อน แล้วจับคู่ที่ราคาเปิดราคาเดียว'))) + '</text>';
    return out + '</svg>';
  }
  function svgDividend(){
    var out = '<svg class="spzc-svg" viewBox="0 0 640 128" role="img" aria-label="' + esc(T(B('Dividend timeline', 'ลำดับเวลาการจ่ายปันผล'))) + '"><line x1="30" y1="56" x2="610" y2="56" class="axis"/>';
    var pts = [[40, B('Board announces', 'บอร์ดประกาศจ่าย'), B('how much per share', 'จ่ายหุ้นละเท่าไร')], [210, B('Last day to buy', 'วันสุดท้ายที่ซื้อแล้วได้'), B('the day before XD', 'วันก่อนวัน XD')], [360, B('XD day', 'วัน XD'), B('buy today = no dividend', 'ซื้อวันนี้ไม่ได้ปันผล')], [600, B('Payment day', 'วันจ่ายเงิน'), B('cash in, 10% tax taken', 'เงินเข้า หักภาษี 10% แล้ว')]];
    pts.forEach(function(p, i){
      out += '<circle cx="' + p[0] + '" cy="56" r="9" class="dot dot-' + 'abcd'.charAt(i) + '"/><text x="' + p[0] + '" y="30" text-anchor="' + (i === 0 ? 'start' : i === 3 ? 'end' : 'middle') + '" class="t-lab">' + esc(T(p[1])) + '</text><text x="' + p[0] + '" y="88" text-anchor="' + (i === 0 ? 'start' : i === 3 ? 'end' : 'middle') + '" class="t-mut">' + esc(T(p[2])) + '</text>';
    });
    out += '<text x="320" y="118" text-anchor="middle" class="t-mut">' + esc(T(B('On XD day the price usually drops by about the dividend — the money moved from the price into your pocket.', 'วัน XD ราคามักลดลงพอๆ กับปันผล — เงินย้ายจากราคาหุ้นมาอยู่ในกระเป๋าเรา'))) + '</text>';
    return out + '</svg>';
  }
  function svgCandle(){
    var out = '<svg class="spzc-svg" viewBox="0 0 640 220" role="img" aria-label="' + esc(T(B('How to read a candlestick', 'วิธีอ่านแท่งเทียน'))) + '">';
    out += '<line x1="110" y1="20" x2="110" y2="200" class="wick"/><rect x="88" y="60" width="44" height="100" rx="4" class="up"/>';
    out += '<line x1="260" y1="30" x2="260" y2="190" class="wick"/><rect x="238" y="70" width="44" height="80" rx="4" class="dn"/>';
    function lab(x, y, x2, t){ return '<line x1="' + x + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" class="lead"/><text x="' + (x2 + 6) + '" y="' + (y + 4) + '" class="t-mut">' + esc(T(t)) + '</text>'; }
    out += lab(112, 20, 160, B('High', 'สูงสุด')) + lab(134, 60, 160, B('Close', 'ปิด')) + lab(134, 160, 160, B('Open', 'เปิด')) + lab(112, 200, 160, B('Low', 'ต่ำสุด'));
    out += '<text x="110" y="216" text-anchor="middle" class="t-lab">' + esc(T(B('Green: closed higher', 'เขียว: ปิดสูงกว่าเปิด'))) + '</text>';
    out += '<text x="260" y="216" text-anchor="middle" class="t-lab">' + esc(T(B('Red: closed lower', 'แดง: ปิดต่ำกว่าเปิด'))) + '</text>';
    /* mini trend with support / resistance */
    var px = [150, 138, 146, 128, 136, 120, 130, 112, 118, 104, 96, 108, 92, 100, 86];
    var pts = px.map(function(v, i){ return (360 + i * 18.5).toFixed(1) + ',' + v; }).join(' ');
    out += '<line x1="356" y1="150" x2="630" y2="150" class="sup"/><text x="630" y="166" text-anchor="end" class="t-mut">' + esc(T(B('support: buyers stepped in here before', 'แนวรับ: เคยมีคนรอซื้อแถวนี้'))) + '</text>';
    out += '<line x1="356" y1="86" x2="630" y2="86" class="res"/><text x="630" y="78" text-anchor="end" class="t-mut">' + esc(T(B('resistance: sellers waited here', 'แนวต้าน: เคยมีคนรอขายแถวนี้'))) + '</text>';
    out += '<polyline points="' + pts + '" class="line"/>';
    out += '<text x="360" y="200" class="t-lab">' + esc(T(B('Uptrend = higher highs and higher lows', 'ขาขึ้น = จุดสูงใหม่สูงขึ้น จุดต่ำใหม่ก็สูงขึ้น'))) + '</text>';
    return out + '</svg>';
  }
  function svgPath(){
    var items = [B('Understand money', 'เข้าใจเงิน'), B('Know the markets', 'รู้จักตลาด'), B('Plan & protect', 'วางแผน กันความเสี่ยง'), B('Choose & value', 'เลือกและตีราคา'), B('Time & read', 'จังหวะและกราฟ'), B('Review & grow', 'ทบทวนและต่อยอด')];
    var out = '<svg class="spzc-svg" viewBox="0 0 640 120" role="img" aria-label="' + esc(T(B('Learning path', 'เส้นทางการเรียน'))) + '"><path d="M30 80 C 130 20, 210 20, 320 70 S 520 120, 610 40" class="path"/>';
    items.forEach(function(it, i){ var x = 62 + i * 103, y = [76, 40, 52, 76, 86, 46][i]; out += '<circle cx="' + x + '" cy="' + y + '" r="12" class="dot dot-' + 'abcdab'.charAt(i) + '"/><text x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle" class="t-num">' + (i + 1) + '</text><text x="' + x + '" y="' + (y > 60 ? y - 20 : y + 32) + '" text-anchor="middle" class="t-lab">' + esc(T(it)) + '</text>'; });
    return out + '</svg>';
  }

  /* ------------------------------------------------------------------
     calculators
     ------------------------------------------------------------------ */
  var CALC = {
    grow:{ t:B('Saving vs investing — what time does', 'ออมเฉยๆ กับลงทุน — เวลาช่วยได้แค่ไหน'),
      f:[['m', B('Put in every month (THB)', 'ใส่ทุกเดือน (บาท)'), 3000], ['y', B('Years', 'กี่ปี'), 20], ['r', B('Average return per year (%)', 'ผลตอบแทนเฉลี่ยต่อปี (%)'), 6], ['i', B('Inflation per year (%)', 'เงินเฟ้อต่อปี (%)'), 2]],
      run:function(v){
        var n = Math.round(v.y * 12), rm = v.r / 100 / 12, put = v.m * n;
        var fv = rm ? v.m * (Math.pow(1 + rm, n) - 1) / rm : put;
        var dep = 0.012 / 12, fd = v.m * (Math.pow(1 + dep, n) - 1) / dep;
        var real = fv / Math.pow(1 + v.i / 100, v.y);
        return [[B('You put in', 'เงินต้นที่ใส่'), fmt(put) + ' ฿'], [B('At ' + v.r + '% a year', 'ถ้าได้ ' + v.r + '% ต่อปี'), fmt(fv) + ' ฿', 'hi'],
          [B('In a 1.2% deposit instead', 'ถ้าฝากธนาคาร 1.2% แทน'), fmt(fd) + ' ฿'], [B('What it buys in today\'s money', 'ซื้อของได้เท่าเงินวันนี้'), fmt(real) + ' ฿']];
      },
      note:B('A teaching estimate, not a promise: real returns move up and down every year, and some years are negative.', 'เป็นตัวเลขประมาณเพื่อเรียนรู้ ไม่ใช่สัญญา ผลตอบแทนจริงขึ้นลงทุกปี บางปีติดลบ') },
    trade:{ t:B('One trade, start to finish: profit after fees, dividend after tax', 'ซื้อ 1 ครั้งจนขาย: กำไรหลังค่าธรรมเนียม ปันผลหลังภาษี'),
      f:[['q', B('Shares (multiples of 100)', 'จำนวนหุ้น (ทีละ 100)'), 500], ['b', B('Buy price (THB)', 'ราคาซื้อ (บาท)'), 32], ['s', B('Sell price (THB)', 'ราคาขาย (บาท)'), 35], ['d', B('Dividend per share received (THB)', 'ปันผลที่ได้ต่อหุ้น (บาท)'), 1.2], ['c', B('Broker fee, all-in (%)', 'ค่าคอมฯ รวม VAT (%)'), 0.17]],
      run:function(v){
        var q = Math.max(0, Math.round(v.q)), buy = q * v.b, sell = q * v.s, fee = (buy + sell) * v.c / 100;
        var gain = sell - buy - fee, divG = q * v.d, divN = divG * 0.9, tot = gain + divN;
        return [[B('You pay', 'จ่ายซื้อ'), fmt(buy, 2) + ' ฿'], [B('Fees both ways', 'ค่าธรรมเนียมไป-กลับ'), fmt(fee, 2) + ' ฿'],
          [B('Price gain after fees', 'กำไรจากราคา หลังค่าธรรมเนียม'), fmt(gain, 2) + ' ฿', gain >= 0 ? 'hi' : 'lo'],
          [B('Dividend after 10% tax', 'ปันผลหลังหักภาษี 10%'), fmt(divN, 2) + ' ฿'],
          [B('Total, and % of what you paid', 'รวมทั้งหมด และ % ของเงินที่ลง'), fmt(tot, 2) + ' ฿ · ' + (buy ? fmt(tot / buy * 100, 2) : '0') + '%', tot >= 0 ? 'hi' : 'lo']];
      },
      note:B('Fees differ by broker (online accounts are usually cheaper). Capital gains on SET shares are tax-free for individuals; the dividend tax shown is the 10% withheld.', 'ค่าธรรมเนียมแต่ละโบรกฯ ไม่เท่ากัน (บัญชีออนไลน์มักถูกกว่า) กำไรจากการขายหุ้นในตลาดฯ ของบุคคลธรรมดาไม่ต้องเสียภาษี ภาษีปันผลที่แสดงคือ 10% ที่ถูกหักไว้') },
    dca:{ t:B('Monthly plan (DCA) vs one lump sum', 'ทยอยซื้อทุกเดือน (DCA) กับซื้อทีเดียว'),
      f:[['e', B('Monthly expenses (THB)', 'ค่าใช้จ่ายต่อเดือน (บาท)'), 15000], ['k', B('Emergency fund target (months)', 'เงินสำรองฉุกเฉิน (กี่เดือน)'), 6], ['m', B('Can invest each month (THB)', 'ลงทุนได้ต่อเดือน (บาท)'), 2000], ['p', B('Fund price drops by (%) then recovers', 'ราคากองทุนลงไป (%) แล้วค่อยฟื้น'), 20]],
      run:function(v){
        var ef = v.e * v.k, mo = 12, units = 0, i, pr;
        for(i = 0; i < mo; i++){ pr = i < 6 ? 10 * (1 - v.p / 100 * i / 5) : 10 * (1 - v.p / 100 * (11 - i) / 6); if(i === 5) pr = 10 * (1 - v.p / 100); units += v.m / pr; }
        var spent = v.m * mo, avg = spent / units, val = units * 10;
        return [[B('Emergency money to keep first', 'เงินสำรองที่ควรมีก่อน'), fmt(ef) + ' ฿', 'hi'], [B('12 months of DCA', 'ทยอยซื้อ 12 เดือน'), fmt(spent) + ' ฿'],
          [B('Your average cost per unit (start = 10)', 'ต้นทุนเฉลี่ยต่อหน่วย (เริ่ม = 10)'), fmt(avg, 2) + ' ฿'], [B('Value when price is back to 10', 'มูลค่าเมื่อราคากลับมา 10'), fmt(val) + ' ฿ (' + (val >= spent ? '+' : '') + fmt((val / spent - 1) * 100, 1) + '%)', 'hi']];
      },
      note:B('DCA buys more units when prices are low, so a dip followed by a recovery leaves you ahead even though the price only came back to where it started. It does not stop losses if the price never recovers.', 'DCA ได้หน่วยมากขึ้นตอนราคาต่ำ ราคาลงแล้วฟื้นกลับมาที่เดิม เราก็ยังได้กำไร แต่ถ้าราคาไม่ฟื้นเลย DCA ก็ไม่ได้กันขาดทุน') },
    value:{ t:B('Is it cheap? Fair price from P/E, and dividend yield', 'ถูกหรือแพง? ราคาเหมาะสมจาก P/E และอัตราปันผล'),
      f:[['p', B('Price now (THB)', 'ราคาตอนนี้ (บาท)'), 40], ['e', B('EPS — profit per share, last 12 months (THB)', 'EPS — กำไรต่อหุ้น 12 เดือนล่าสุด (บาท)'), 3.2], ['g', B('P/E you think is fair for it', 'P/E ที่คิดว่าเหมาะกับหุ้นนี้'), 14], ['d', B('Dividend per share per year (THB)', 'ปันผลต่อหุ้นต่อปี (บาท)'), 1.6]],
      run:function(v){
        var pe = v.e > 0 ? v.p / v.e : NaN, fair = v.e * v.g, mos = fair > 0 ? (fair - v.p) / fair * 100 : NaN, dy = v.p ? v.d / v.p * 100 : NaN, pay = v.e > 0 ? v.d / v.e * 100 : NaN;
        return [[B('P/E now = price ÷ EPS', 'P/E ตอนนี้ = ราคา ÷ EPS'), isFinite(pe) ? fmt(pe, 1) + '×' : '–'], [B('Fair price = EPS × fair P/E', 'ราคาเหมาะสม = EPS × P/E ที่เหมาะ'), fmt(fair, 2) + ' ฿', 'hi'],
          [B('Margin of safety', 'ส่วนเผื่อความปลอดภัย'), isFinite(mos) ? fmt(mos, 1) + '%' : '–', mos >= 20 ? 'hi' : mos < 0 ? 'lo' : ''],
          [B('Dividend yield = dividend ÷ price', 'อัตราปันผล = ปันผล ÷ ราคา'), isFinite(dy) ? fmt(dy, 2) + '%' : '–'], [B('Payout = dividend ÷ EPS', 'สัดส่วนจ่ายปันผล = ปันผล ÷ EPS'), isFinite(pay) ? fmt(pay, 0) + '%' : '–', pay > 100 ? 'lo' : '']];
      },
      note:B('A margin of safety of 20–30% leaves room for being wrong. A payout above 100% means the dividend is bigger than the profit — it cannot last.', 'เผื่อไว้ 20–30% เผื่อเราประเมินพลาด ถ้าสัดส่วนจ่ายปันผลเกิน 100% แปลว่าจ่ายเกินกำไร อยู่ได้ไม่นาน') },
    size:{ t:B('How much to buy so one mistake stays small (position size)', 'ควรซื้อเท่าไร ให้พลาดครั้งเดียวไม่เจ็บหนัก'),
      f:[['a', B('Total money in your portfolio (THB)', 'เงินทั้งพอร์ต (บาท)'), 200000], ['r', B('Most you accept losing on one idea (%)', 'ยอมเสียได้มากสุดต่อ 1 ไอเดีย (%)'), 1], ['b', B('Buy price (THB)', 'ราคาซื้อ (บาท)'), 50], ['s', B('Stop — the price where you admit you were wrong (THB)', 'จุดตัดขาดทุน — ราคาที่ยอมรับว่าผิด (บาท)'), 45]],
      run:function(v){
        var risk = v.a * v.r / 100, per = v.b - v.s, q = per > 0 ? Math.floor(risk / per / 100) * 100 : 0, cost = q * v.b;
        return [[B('Money at risk', 'เงินที่ยอมเสียได้'), fmt(risk) + ' ฿'], [B('Risk per share', 'เสี่ยงต่อหุ้น'), per > 0 ? fmt(per, 2) + ' ฿' : '–'],
          [B('Shares to buy (board lots of 100)', 'ซื้อได้กี่หุ้น (ทีละ 100)'), fmt(q) + ' ' + T(B('shares', 'หุ้น')), 'hi'], [B('Money used / share of portfolio', 'ใช้เงิน / คิดเป็นของพอร์ต'), fmt(cost) + ' ฿ · ' + (v.a ? fmt(cost / v.a * 100, 1) : 0) + '%']];
      },
      note:B('Professional traders often risk 1–2% of the portfolio per idea. If the stop is hit you lose about that much (plus fees and gaps), and you still have 98% left to try again.', 'นักลงทุนมืออาชีพมักยอมเสีย 1–2% ของพอร์ตต่อไอเดีย ถ้าราคาลงถึงจุดตัดขาดทุน จะเสียราวนั้น (บวกค่าธรรมเนียม/ราคากระโดด) และยังเหลือ 98% ไว้ลองใหม่') }
  };
  function calcHTML(id){
    var c = CALC[id]; if(!c) return '';
    return '<div class="spzc-calc" data-calc="' + id + '"><div class="spzc-calc-h">' + ico('calc') + '<b>' + esc(T(c.t)) + '</b></div><div class="spzc-calc-g">' +
      c.f.map(function(f){ return '<label><span>' + esc(T(f[1])) + '</span><input type="number" inputmode="decimal" step="any" data-k="' + f[0] + '" value="' + f[2] + '"></label>'; }).join('') +
      '</div><div class="spzc-calc-out" aria-live="polite"></div><p class="spzc-calc-n">' + esc(T(c.note)) + '</p></div>';
  }
  function runCalc(box){
    var c = CALC[box.getAttribute('data-calc')], v = {};
    if(!c) return;
    box.querySelectorAll('input[data-k]').forEach(function(i){ var x = parseFloat(i.value); v[i.getAttribute('data-k')] = isFinite(x) ? x : 0; });
    var rows = c.run(v);
    box.querySelector('.spzc-calc-out').innerHTML = rows.map(function(r){ return '<div class="' + (r[2] || '') + '"><span>' + esc(T(r[0])) + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('');
  }

  /* ------------------------------------------------------------------
     lesson content (EN + TH)
     ------------------------------------------------------------------ */
  function cards(list){
    return '<div class="spzc-cards">' + list.map(function(c){ return '<div class="spzc-card' + (c[3] ? ' ' + c[3] : '') + '"><i>' + ico(c[0]) + '</i><b>' + esc(T(c[1])) + '</b><p>' + T(c[2]) + '</p></div>'; }).join('') + '</div>';
  }
  function steps(list){ return '<ol class="spzc-steps">' + list.map(function(s){ return '<li><b>' + esc(T(s[0])) + '</b><span>' + T(s[1]) + '</span></li>'; }).join('') + '</ol>'; }
  function tip(kind, t, x){ return '<div class="spzc-tip spzc-tip-' + kind + '">' + ico(kind === 'warn' ? 'alert' : kind === 'ok' ? 'check' : 'eye') + '<div><b>' + esc(T(t)) + '</b><span>' + T(x) + '</span></div></div>'; }
  function h3(t){ return '<h3 class="spzc-h3">' + esc(T(t)) + '</h3>'; }
  function p(t){ return '<p class="spzc-p">' + T(t) + '</p>'; }
  function table(head, rows){ return '<div class="spzc-tw"><table class="spzc-tb"><thead><tr>' + head.map(function(h){ return '<th>' + esc(T(h)) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function(r){ return '<tr>' + r.map(function(c, i){ return i ? '<td>' + esc(T(c)) + '</td>' : '<th scope="row">' + esc(T(c)) + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; }

  var CH = {
    stockclass:{
      lv:B('Start here · level 0', 'เริ่มที่นี่ · ระดับ 0'),
      h:B('Chapter 1 — Money, investing, and the markets you can choose from', 'บทที่ 1 — เงิน การลงทุน และตลาดที่เราเลือกได้'),
      lede:B('Before any stock: why put money to work at all, and what the main kinds of investment are — from a bank deposit to crypto and options — so you can see where stocks sit.', 'ก่อนจะไปถึงหุ้น: ทำไมต้องให้เงินทำงาน และการลงทุนหลักๆ มีอะไรบ้าง ตั้งแต่เงินฝากไปจนถึงคริปโตและออปชั่น จะได้เห็นว่าหุ้นอยู่ตรงไหน'),
      body:function(){
        return h3(B('1.1 Why not just save?', '1.1 ทำไมไม่เก็บเงินไว้เฉยๆ')) +
          p(B('Prices of things rise a little every year — that is <b>inflation</b>. If coffee costs 50 baht today and prices rise 3% a year, the same coffee costs about 67 baht in 10 years. Money that sits still slowly buys less. <b>Investing</b> means putting money into something that can grow faster than prices do — and accepting some risk to get that.', 'ราคาของทุกอย่างค่อยๆ แพงขึ้นทุกปี เรียกว่า <b>เงินเฟ้อ</b> ถ้ากาแฟแก้วละ 50 บาทวันนี้ และของแพงขึ้นปีละ 3% อีก 10 ปีกาแฟแก้วเดิมจะราว 67 บาท เงินที่อยู่เฉยๆ จึงซื้อของได้น้อยลงเรื่อยๆ <b>การลงทุน</b> คือเอาเงินไปไว้ในสิ่งที่มีโอกาสโตเร็วกว่าเงินเฟ้อ โดยยอมรับความเสี่ยงบางส่วน')) +
          cards([
            ['coin', B('Saving', 'การออม'), B('Keeping money safe and easy to reach. For emergencies and short-term goals.', 'เก็บเงินให้ปลอดภัย ถอนง่าย ไว้ใช้ฉุกเฉินและเป้าหมายระยะสั้น')],
            ['trend', B('Investing', 'การลงทุน'), B('Owning or lending to something that earns money — a business, a government, a building. For goals 3–5+ years away.', 'เป็นเจ้าของ หรือให้กู้กับสิ่งที่สร้างรายได้ เช่น ธุรกิจ รัฐบาล อาคาร เหมาะกับเป้าหมาย 3–5 ปีขึ้นไป')],
            ['alert', B('Speculating', 'การเก็งกำไร'), B('Betting on a short price move. Can be learned, but it is closer to a skill game with real losers.', 'เดิมพันกับราคาที่ขยับระยะสั้น ฝึกได้ แต่ใกล้เคียงเกมทักษะที่มีคนแพ้จริง')]
          ]) +
          calcHTML('grow') +
          h3(B('1.2 The main markets, from calm to wild', '1.2 ตลาดหลักๆ เรียงจากนิ่งไปถึงผันผวน')) +
          svgLadder() +
          table([B('What it is', 'คืออะไร'), B('How you make money', 'ได้เงินจากอะไร'), B('Main risk', 'ความเสี่ยงหลัก')], [
            [B('Deposit', 'เงินฝาก'), B('interest from the bank', 'ดอกเบี้ยจากธนาคาร'), B('loses to inflation', 'แพ้เงินเฟ้อ')],
            [B('Bond', 'พันธบัตร / หุ้นกู้'), B('interest from the borrower (government or company)', 'ดอกเบี้ยจากผู้กู้ (รัฐหรือบริษัท)'), B('borrower cannot pay; price falls when rates rise', 'ผู้กู้ผิดนัด; ราคาลงเมื่อดอกเบี้ยขึ้น')],
            [B('Mutual fund / ETF', 'กองทุนรวม / ETF'), B('whatever the fund holds, spread over many assets', 'ตามสินทรัพย์ที่กองถือ กระจายหลายตัว'), B('the market it follows falls; fees', 'ตลาดที่กองลงทุนตก; ค่าธรรมเนียม')],
            [B('Stock', 'หุ้น'), B('price rises as the business grows + dividends', 'ราคาขึ้นเมื่อธุรกิจโต + เงินปันผล'), B('the business disappoints; market falls', 'ธุรกิจแย่กว่าคาด; ตลาดทั้งตลาดตก')],
            [B('Gold', 'ทองคำ'), B('price change only (no interest)', 'ส่วนต่างราคาอย่างเดียว (ไม่มีดอกเบี้ย)'), B('long flat periods; THB/USD moves', 'นิ่งได้นานหลายปี; ค่าเงินบาท')],
            [B('Forex', 'ฟอเร็กซ์'), B('one currency rising against another', 'ค่าเงินหนึ่งแข็งขึ้นเทียบอีกสกุล'), B('leverage; many unlicensed brokers', 'เลเวอเรจ; โบรกเกอร์เถื่อนเยอะ')],
            [B('Crypto', 'คริปโต'), B('price change; some coins pay staking', 'ส่วนต่างราคา; บางเหรียญได้ staking'), B('very large swings; hacks and scams', 'ขึ้นลงแรงมาก; โดนแฮ็ก/หลอก')],
            [B('Options / futures', 'ออปชั่น / ฟิวเจอร์ส'), B('contracts on another price, with leverage', 'สัญญาที่อิงราคาอื่น มีเลเวอเรจ'), B('can lose fast; options can expire worthless', 'ขาดทุนเร็ว; ออปชั่นหมดอายุเป็นศูนย์ได้')]
          ]) +
          tip('info', B('Where most beginners should start', 'มือใหม่ส่วนใหญ่ควรเริ่มตรงไหน'), B('An emergency fund first, then a broad fund or ETF, then a few large, profitable companies you understand. Forex, crypto and options come later, with small money — chapter 7 explains them in detail.', 'มีเงินสำรองฉุกเฉินก่อน แล้วเริ่มจากกองทุนหรือ ETF ที่กระจายกว้าง จากนั้นค่อยเลือกบริษัทใหญ่ที่มีกำไรและเราเข้าใจ ฟอเร็กซ์ คริปโต ออปชั่น ไว้ทีหลัง ด้วยเงินก้อนเล็ก บทที่ 7 อธิบายละเอียด')) +
          tip('warn', B('Check who you deal with', 'เช็กก่อนว่าคุยกับใคร'), B('In Thailand stock brokers and digital-asset exchanges are licensed by the SEC (sec.or.th has a search). Anyone promising a fixed high return "with no risk" is a red flag.', 'ในไทย โบรกเกอร์หุ้นและศูนย์ซื้อขายสินทรัพย์ดิจิทัลต้องได้รับอนุญาตจาก ก.ล.ต. (ค้นได้ที่ sec.or.th) ใครสัญญาผลตอบแทนสูงแน่นอน "ไม่มีความเสี่ยง" ให้ระวังไว้ก่อน')) +
          h3(B('1.3 The whole course at a glance', '1.3 ภาพรวมทั้งคอร์ส')) + svgPath() +
          p(B('Below this chapter is the Stock Classroom itself — the step-by-step "first stock" guide and the 6-level lessons. Read this chapter, then follow the course bar to chapter 2.', 'ถัดจากบทนี้คือห้องเรียนหุ้นเดิม ทั้งคู่มือ "ซื้อหุ้นตัวแรก" ทีละขั้น และบทเรียน 6 ระดับ อ่านบทนี้จบแล้วไปบทที่ 2 ตามแถบคอร์สด้านบน'));
      },
      q:{ q:B('Prices rise 3% a year and your money earns 1% in a deposit. In real terms your money…', 'ของแพงขึ้นปีละ 3% แต่เงินฝากได้ 1% เงินของเรามีค่าจริง…'), c:[B('grows 1% a year', 'โตปีละ 1%'), B('shrinks about 2% a year', 'ลดลงราวปีละ 2%'), B('stays the same', 'เท่าเดิม')], a:1, e:B('Real return ≈ interest − inflation = 1% − 3% = −2%. The number in the account grows, what it can buy shrinks.', 'ผลตอบแทนจริง ≈ ดอกเบี้ย − เงินเฟ้อ = 1% − 3% = −2% ตัวเลขในบัญชีเพิ่ม แต่ซื้อของได้น้อยลง') }
    },
    basics:{
      lv:B('Basic', 'พื้นฐาน'),
      h:B('Chapter 2 — How the stock market works, and the two ways a stock pays you', 'บทที่ 2 — ตลาดหุ้นทำงานยังไง และหุ้นให้เงินเรา 2 ทาง'),
      lede:B('What a share is, who does what in the Thai market, trading hours and rules, and exactly how price gains and dividends reach you — with a calculator for one full trade.', 'หุ้นคืออะไร ใครทำหน้าที่อะไรในตลาดหุ้นไทย เวลาและกติกาการซื้อขาย และกำไรส่วนต่างกับเงินปันผลมาถึงมือเรายังไง พร้อมเครื่องคิดเลขซื้อขาย 1 รอบ'),
      body:function(){
        return h3(B('2.1 A share is a slice of a real business', '2.1 หุ้น = ชิ้นส่วนหนึ่งของธุรกิจจริง')) + svgPie() +
          h3(B('2.2 Who is who in the Thai market', '2.2 ใครเป็นใครในตลาดหุ้นไทย')) +
          cards([
            ['bank', B('SET and mai', 'SET และ mai'), B('The Stock Exchange of Thailand runs the market where buyers and sellers meet. SET is the main board (larger companies); mai is for smaller, growing ones.', 'ตลาดหลักทรัพย์แห่งประเทศไทย คือที่ที่คนซื้อกับคนขายมาเจอกัน SET เป็นกระดานหลัก (บริษัทใหญ่) mai สำหรับบริษัทขนาดกลาง-เล็กที่กำลังโต')],
            ['doc', B('Broker', 'โบรกเกอร์ (บริษัทหลักทรัพย์)'), B('You cannot buy directly from the exchange — you open an account with a licensed broker and send orders through its app.', 'เราซื้อตรงกับตลาดไม่ได้ ต้องเปิดบัญชีกับบริษัทหลักทรัพย์ที่ได้รับอนุญาต แล้วส่งคำสั่งผ่านแอปของเขา')],
            ['shield', B('SEC', 'ก.ล.ต.'), B('The regulator: licenses brokers, makes companies disclose information, and punishes cheating.', 'ผู้กำกับดูแล ออกใบอนุญาตโบรกเกอร์ บังคับให้บริษัทเปิดเผยข้อมูล และลงโทษผู้ทำผิด')],
            ['layers', B('TSD', 'ศูนย์รับฝากหลักทรัพย์ (TSD)'), B('Keeps the record of who owns which shares, and passes dividends on to the owners.', 'บันทึกว่าใครถือหุ้นอะไร และส่งต่อเงินปันผลให้ผู้ถือหุ้น')]
          ]) +
          h3(B('2.3 When and how you can trade', '2.3 ซื้อขายได้เมื่อไร และกติกาสำคัญ')) + svgDay() +
          table([B('Rule', 'กติกา'), B('What it means for you', 'แปลว่าอะไรสำหรับเรา')], [
            [B('Board lot = 100 shares', 'ซื้อขายทีละ 100 หุ้น (board lot)'), B('Orders go in hundreds (50 for shares that have been ≥ 500 baht for six months). Fewer than 100 = the odd-lot board.', 'ส่งคำสั่งทีละร้อยหุ้น (หุ้นที่ราคา ≥ 500 บาทติดต่อกัน 6 เดือน ทีละ 50) ต่ำกว่า 100 หุ้นต้องไปกระดานเศษหุ้น')],
            [B('Daily limit ±30%', 'ขึ้นลงได้วันละไม่เกิน ±30%'), B('A price cannot move more than 30% from yesterday\'s close in one day (ceiling / floor).', 'ราคาขยับได้ไม่เกิน 30% จากราคาปิดเมื่อวาน (ราคาเพดาน / ราคาพื้น)')],
            [B('Settlement T+2', 'ชำระเงิน T+2'), B('You pay for (or receive money from) a trade two business days after it.', 'เงินซื้อถูกตัด / เงินขายเข้าบัญชี 2 วันทำการหลังวันที่ซื้อขาย')],
            [B('Costs', 'ค่าใช้จ่าย'), B('Broker commission (often around 0.1–0.25% online) plus small exchange fees and 7% VAT on them. Charged on both buy and sell.', 'ค่าคอมมิชชั่น (ออนไลน์มักราว 0.1–0.25%) + ค่าธรรมเนียมตลาดเล็กน้อย + VAT 7% คิดทั้งตอนซื้อและขาย')]
          ]) +
          h3(B('2.4 Way one: the price goes up (capital gain)', '2.4 ทางที่ 1: ราคาหุ้นขึ้น (กำไรส่วนต่าง)')) +
          p(B('If a company grows its profit year after year, investors are willing to pay more for each share. Buy at 32, sell at 35, and the 3 baht per share is your gain. For individuals, gains on shares sold on the SET are not taxed. The catch: prices can also fall, and in the short run they move for reasons that have nothing to do with the business.', 'ถ้าบริษัทกำไรโตขึ้นทุกปี นักลงทุนก็ยอมจ่ายแพงขึ้นเพื่อซื้อหุ้น ซื้อที่ 32 ขายที่ 35 ส่วนต่าง 3 บาทต่อหุ้นคือกำไร บุคคลธรรมดาที่ขายหุ้นในตลาดฯ ไม่ต้องเสียภาษีกำไรนี้ แต่ราคาก็ลงได้ และระยะสั้นมันขยับด้วยเหตุผลที่ไม่เกี่ยวกับธุรกิจเลยก็มี')) +
          h3(B('2.5 Way two: dividends', '2.5 ทางที่ 2: เงินปันผล')) +
          p(B('Many profitable companies pay part of their profit to shareholders as cash — a <b>dividend</b>, usually once or twice a year. 10% tax is taken before it reaches you; you can leave it at that (final), or include it in your yearly tax return and claim the dividend tax credit — worth checking if your tax rate is low.', 'บริษัทที่มีกำไรหลายแห่งแบ่งกำไรบางส่วนจ่ายเป็นเงินสดให้ผู้ถือหุ้น เรียกว่า <b>เงินปันผล</b> ปกติปีละ 1–2 ครั้ง ถูกหักภาษี 10% ก่อนถึงมือเรา จะจบแค่นั้นก็ได้ หรือนำไปรวมยื่นภาษีปลายปีแล้วใช้เครดิตภาษีเงินปันผล ถ้าฐานภาษีเราต่ำควรลองคำนวณดู')) +
          svgDividend() +
          calcHTML('trade') +
          tip('ok', B('Dividend yield in one line', 'อัตราปันผลในบรรทัดเดียว'), B('Dividend per year ÷ price × 100. A stock at 40 baht paying 1.60 a year yields 4%. A very high yield can be a warning: the price may have fallen because the profit is in trouble.', 'ปันผลต่อปี ÷ ราคา × 100 หุ้นราคา 40 บาท ปันผลปีละ 1.60 บาท = 4% ถ้าสูงผิดปกติให้ระวัง อาจเพราะราคาลงแรงจากกำไรมีปัญหา'));
      },
      q:{ q:B('You buy a stock on its XD day. You will…', 'เราซื้อหุ้นในวัน XD เราจะ…'), c:[B('get this dividend', 'ได้ปันผลรอบนี้'), B('not get this dividend', 'ไม่ได้ปันผลรอบนี้'), B('get half', 'ได้ครึ่งเดียว')], a:1, e:B('XD = "excluding dividend". To receive it you must have bought before the XD day.', 'XD = ไม่ได้รับสิทธิปันผล ต้องซื้อก่อนวัน XD ถึงจะได้') }
    },
    start:{
      lv:B('Basic', 'พื้นฐาน'),
      h:B('Chapter 3 — Plan before you buy: safety net, goal, time and risk', 'บทที่ 3 — วางแผนก่อนซื้อ: เงินสำรอง เป้าหมาย เวลา และความเสี่ยง'),
      lede:B('Most beginner losses come from the plan, not the stock: money needed next month, one big bet, panic in the first drop. Set these four things first, then answer the five questions below.', 'ขาดทุนของมือใหม่ส่วนใหญ่มาจากแผน ไม่ใช่ตัวหุ้น ใช้เงินที่ต้องใช้เดือนหน้า ทุ่มตัวเดียว หรือตกใจขายตอนลงครั้งแรก ตั้ง 4 เรื่องนี้ก่อน แล้วค่อยตอบ 5 คำถามด้านล่าง'),
      body:function(){
        return steps([
          [B('Safety net first', 'มีเงินสำรองก่อน'), B('Keep 3–6 months of expenses in a deposit you can reach any day. Pay off expensive debt (credit cards) before investing — a 16–25% interest bill beats almost any return.', 'เก็บค่าใช้จ่าย 3–6 เดือนไว้ในเงินฝากที่ถอนได้ทุกวัน ปิดหนี้ดอกแพง (บัตรเครดิต) ก่อน ดอกเบี้ย 16–25% ชนะผลตอบแทนการลงทุนแทบทุกแบบ')],
          [B('Name the goal and the date', 'ตั้งเป้าหมายและวันที่ต้องใช้'), B('Money needed within 1–2 years should not be in stocks. 5 years or more is where stocks make sense.', 'เงินที่ต้องใช้ภายใน 1–2 ปีไม่ควรอยู่ในหุ้น ถ้าเกิน 5 ปีขึ้นไป หุ้นจึงเหมาะ')],
          [B('Know how much drop you can sit through', 'รู้ว่าทนเห็นพอร์ตลดได้แค่ไหน'), B('Stock markets have fallen 30–50% in bad years. If a 30% drop would make you sell, hold less in stocks and more in bonds or deposits.', 'ตลาดหุ้นเคยลง 30–50% ในปีที่แย่ ถ้าพอร์ตลด 30% แล้วเราจะทนไม่ไหวจนขาย ให้ถือหุ้นน้อยลง แล้วถือพันธบัตรหรือเงินฝากมากขึ้น')],
          [B('Spread it out', 'กระจายความเสี่ยง'), B('Many companies, several industries, and buying over time. A broad fund does the spreading for you.', 'หลายบริษัท หลายอุตสาหกรรม และทยอยซื้อหลายช่วงเวลา กองทุนที่กระจายกว้างช่วยทำให้อัตโนมัติ')]
        ]) +
          h3(B('3.1 Lump sum or a little every month?', '3.1 ลงทีเดียว หรือทยอยทุกเดือน?')) +
          p(B('<b>DCA</b> (dollar-cost averaging) means investing the same amount on the same day every month, whatever the price. You buy more units when prices are low and fewer when high, and you never have to guess the "right moment". Most people invest from salary anyway, so DCA fits real life.', '<b>DCA</b> คือลงเงินเท่าๆ กันทุกเดือนในวันเดิม ไม่ว่าราคาจะเป็นเท่าไร ราคาต่ำได้หน่วยเยอะ ราคาสูงได้น้อย ไม่ต้องเดาจังหวะ คนส่วนใหญ่มีรายได้เป็นเงินเดือนอยู่แล้ว DCA จึงเข้ากับชีวิตจริง')) +
          calcHTML('dca') +
          tip('warn', B('Three beginner traps', 'กับดัก 3 ข้อของมือใหม่'), B('1) Buying because a friend or a group chat said so. 2) Putting everything in one stock. 3) Borrowing to invest. Each one turns a normal drop into a disaster.', '1) ซื้อเพราะเพื่อนหรือกลุ่มแชตบอก 2) ทุ่มทั้งหมดในหุ้นตัวเดียว 3) กู้เงินมาลงทุน แต่ละข้อทำให้การลงตามปกติกลายเป็นหายนะได้')) +
          p(B('Now answer the five questions below — they match your goal and risk to a style of stock and give an order to build a first portfolio.', 'ตอนนี้ลองตอบ 5 คำถามด้านล่าง ระบบจะจับคู่เป้าหมายและความเสี่ยงกับแนวหุ้น พร้อมลำดับการสร้างพอร์ตแรก'));
      },
      q:{ q:B('You will need this money for a house down-payment in 12 months. The best home for it is…', 'อีก 12 เดือนต้องใช้เงินก้อนนี้ดาวน์บ้าน ควรเก็บไว้ที่…'), c:[B('a growth stock', 'หุ้นเติบโต'), B('crypto', 'คริปโต'), B('a deposit or short-term bond fund', 'เงินฝาก หรือกองทุนตราสารหนี้ระยะสั้น')], a:2, e:B('Stocks can be 20–30% lower exactly when you need the money. Short goals need stable places.', 'หุ้นอาจลง 20–30% ตรงช่วงที่ต้องใช้เงินพอดี เป้าหมายระยะสั้นต้องอยู่ที่ที่นิ่ง') }
    },
    types:{
      lv:B('Basic → intermediate', 'พื้นฐาน → กลาง'),
      h:B('Chapter 4 — What to buy, and how to tell cheap from expensive', 'บทที่ 4 — ควรซื้ออะไร และดูยังไงว่าถูกหรือแพง'),
      lede:B('The four kinds of stock below are four reasons to own a company. First a simple filter for a good business, then a price check you can do with three numbers.', 'หุ้น 4 ประเภทด้านล่างคือ 4 เหตุผลที่จะเป็นเจ้าของบริษัท เริ่มจากตัวกรองง่ายๆ ว่าธุรกิจดีไหม แล้วเช็กราคาด้วยตัวเลขแค่ 3 ตัว'),
      body:function(){
        return h3(B('4.1 A good business first', '4.1 ธุรกิจต้องดีก่อน')) +
          cards([
            ['eye', B('I can explain it', 'อธิบายได้ว่าทำอะไร'), B('What does it sell, who pays, why do they come back? If you cannot say it in two sentences, skip it.', 'ขายอะไร ใครจ่าย ทำไมลูกค้ากลับมาซื้อซ้ำ ถ้าอธิบายไม่ได้ใน 2 ประโยค ข้ามไปก่อน')],
            ['trend', B('Profit grows', 'กำไรโตต่อเนื่อง'), B('Revenue and net profit higher than 3–5 years ago, without big holes.', 'รายได้และกำไรสุทธิสูงกว่า 3–5 ปีก่อน ไม่มีปีที่ร่วงแรง')],
            ['target', B('Good return on money', 'ใช้เงินเก่ง'), B('ROE above about 12–15% for years means it turns shareholders\' money into profit well.', 'ROE สูงกว่าราว 12–15% ต่อเนื่องหลายปี แปลว่าเปลี่ยนเงินผู้ถือหุ้นเป็นกำไรได้ดี')],
            ['shield', B('Debt it can carry', 'หนี้ไม่เกินตัว'), B('Debt-to-equity not far above 1–1.5 (banks are different), and cash coming in from operations.', 'หนี้ต่อทุน (D/E) ไม่สูงเกิน 1–1.5 มาก (ยกเว้นธนาคาร) และมีเงินสดจากการดำเนินงานไหลเข้า')]
          ]) +
          h3(B('4.2 Start with funds and ETFs, then single stocks', '4.2 เริ่มจากกองทุน / ETF แล้วค่อยหุ้นรายตัว')) +
          p(B('A fund or ETF that follows the SET50 or a world index holds dozens or hundreds of companies in one purchase. Many beginners keep most money there and pick a few single stocks with a small part to learn. Thai ESG and RMF funds also bring tax deductions (rules change — check the Revenue Department each year).', 'กองทุนหรือ ETF ที่อิง SET50 หรือดัชนีโลก ซื้อครั้งเดียวได้หลายสิบหรือหลายร้อยบริษัท มือใหม่หลายคนเก็บเงินส่วนใหญ่ไว้ตรงนั้น แล้วใช้เงินส่วนน้อยหัดเลือกหุ้นรายตัว กองทุน Thai ESG และ RMF ยังช่วยลดหย่อนภาษีได้ด้วย (เงื่อนไขเปลี่ยนได้ เช็กกรมสรรพากรทุกปี)')) +
          h3(B('4.3 Price check with three numbers', '4.3 เช็กราคาด้วยตัวเลข 3 ตัว')) +
          p(B('<b>EPS</b> = profit per share. <b>P/E</b> = price ÷ EPS = how many years of today\'s profit you pay for. Compare a stock\'s P/E with its own past and with similar companies, not with a random number. Then decide a fair P/E, multiply by EPS, and you have a rough fair price. Buy only with a margin of safety.', '<b>EPS</b> = กำไรต่อหุ้น <b>P/E</b> = ราคา ÷ EPS = เราจ่ายเท่ากับกำไรปัจจุบันกี่ปี ให้เทียบ P/E กับอดีตของหุ้นตัวเองและบริษัทแบบเดียวกัน ไม่ใช่เทียบกับตัวเลขลอยๆ แล้วตั้ง P/E ที่เหมาะ คูณ EPS ได้ราคาเหมาะสมคร่าวๆ ซื้อเมื่อมีส่วนเผื่อความปลอดภัย')) +
          calcHTML('value') +
          tip('info', B('Where the numbers are', 'หาตัวเลขได้ที่ไหน'), B('SET website and the broker app show EPS, P/E, dividend and financial statements. On this site, the Stock Explorer and Directory show them for 550+ stocks; chapter 5 (Key numbers) explains each one.', 'เว็บตลาดหลักทรัพย์และแอปโบรกเกอร์มี EPS, P/E, ปันผล และงบการเงิน ในเว็บนี้หน้า "หุ้นรายตัว" และ "สารบัญหุ้น" มีให้ 550+ ตัว ส่วนบทที่ 5 (ตัวเลขสำคัญ) อธิบายทีละตัว'));
      },
      q:{ q:B('Price 40 baht, EPS 4 baht. The P/E is…', 'ราคา 40 บาท EPS 4 บาท P/E เท่ากับ…'), c:[B('4', '4'), B('10', '10'), B('160', '160')], a:1, e:B('P/E = 40 ÷ 4 = 10: you pay ten years of today\'s profit.', 'P/E = 40 ÷ 4 = 10 คือจ่ายเท่ากับกำไรปัจจุบัน 10 ปี') }
    },
    signals:{
      lv:B('Intermediate', 'กลาง'),
      h:B('Chapter 6 — Reading a chart: candles, trend, support and moving averages', 'บทที่ 6 — อ่านกราฟเบื้องต้น: แท่งเทียน แนวโน้ม แนวรับแนวต้าน เส้นค่าเฉลี่ย'),
      lede:B('Fundamentals tell you what to buy; a chart helps with when, and with spotting when the crowd disagrees with you. Learn the four basics here, then the 13 signals below.', 'ปัจจัยพื้นฐานบอกว่าซื้ออะไร กราฟช่วยดูจังหวะ และบอกว่าตลาดกำลังเห็นต่างจากเราไหม เรียน 4 เรื่องพื้นฐานตรงนี้ แล้วค่อยไปดู 13 สัญญาณด้านล่าง'),
      body:function(){
        return svgCandle() +
          cards([
            ['candle', B('Candlestick', 'แท่งเทียน'), B('One candle = one day (or week). Body = open to close, thin lines = the day\'s high and low.', '1 แท่ง = 1 วัน (หรือ 1 สัปดาห์) ตัวแท่ง = ราคาเปิดถึงปิด เส้นบางๆ = ราคาสูงสุด-ต่ำสุดของวัน')],
            ['trend', B('Trend', 'แนวโน้ม'), B('Up = higher highs and higher lows; down = the opposite. Trading with the trend is easier than against it.', 'ขาขึ้น = จุดสูงและจุดต่ำใหม่ยกตัวขึ้น ขาลงตรงข้าม เล่นตามแนวโน้มง่ายกว่าสวน')],
            ['layers', B('Moving averages', 'เส้นค่าเฉลี่ย (MA)'), B('MA50 / MA200 = average close of the last 50 / 200 days. Price above a rising MA200 = long-term uptrend.', 'MA50 / MA200 = ราคาปิดเฉลี่ย 50 / 200 วันล่าสุด ราคาอยู่เหนือ MA200 ที่ชี้ขึ้น = ขาขึ้นระยะยาว')],
            ['eye', B('Volume', 'ปริมาณซื้อขาย'), B('A breakout on high volume is more believable than one on a quiet day.', 'ราคาทะลุแนวพร้อมวอลุ่มสูงน่าเชื่อกว่าทะลุในวันที่เงียบ')]
          ]) +
          tip('warn', B('A chart is a probability, not a promise', 'กราฟคือความน่าจะเป็น ไม่ใช่คำสัญญา'), B('Every signal fails often. Use it to decide timing and where you would admit you were wrong (your stop), never as the only reason to buy.', 'ทุกสัญญาณพลาดบ่อย ใช้ช่วยเลือกจังหวะ และกำหนดจุดที่ยอมรับว่าผิด (จุดตัดขาดทุน) อย่าใช้เป็นเหตุผลเดียวในการซื้อ')) +
          calcHTML('size');
      },
      q:{ q:B('A stock keeps making higher highs and higher lows above a rising MA200. That is…', 'หุ้นทำจุดสูงใหม่และจุดต่ำใหม่สูงขึ้นเรื่อยๆ อยู่เหนือ MA200 ที่ชี้ขึ้น แปลว่า…'), c:[B('a downtrend', 'ขาลง'), B('an uptrend', 'ขาขึ้น'), B('a guaranteed buy', 'ซื้อแล้วกำไรแน่นอน')], a:1, e:B('That is the textbook uptrend — but nothing on a chart is guaranteed.', 'เป็นขาขึ้นตามตำรา แต่ไม่มีอะไรบนกราฟที่รับประกันได้') }
    },
    guided:{
      lv:B('Intermediate → advanced', 'กลาง → สูง'),
      h:B('Chapter 7 — Next level: other markets, managing a portfolio, using this site', 'บทที่ 7 — ขั้นต่อไป: ตลาดอื่น การดูแลพอร์ต และการใช้เว็บนี้'),
      lede:B('You now know what a stock is, how it pays, how to plan, choose, value and time it. This chapter adds what experienced investors do, and the four-market lessons below go deep on stocks, forex, options and crypto.', 'ตอนนี้เรารู้แล้วว่าหุ้นคืออะไร ให้เงินยังไง วางแผน เลือก ตีราคา และดูจังหวะยังไง บทนี้เพิ่มสิ่งที่นักลงทุนมีประสบการณ์ทำ และบทเรียน 4 ตลาดด้านล่างลงลึกเรื่องหุ้น ฟอเร็กซ์ ออปชั่น คริปโต'),
      body:function(){
        return steps([
          [B('Set your mix and rebalance', 'กำหนดสัดส่วนแล้วปรับสมดุล'), B('Decide a mix (for example 60% stocks / 30% bonds / 10% gold). Once a year, sell a little of what grew and buy what fell to get back to it. It forces "buy low, sell high".', 'ตั้งสัดส่วน (เช่น หุ้น 60% / ตราสารหนี้ 30% / ทอง 10%) ปีละครั้งขายส่วนที่โตเกินมาซื้อส่วนที่ลดลงให้กลับมาตามสัดส่วน บังคับให้ "ซื้อถูกขายแพง" โดยอัตโนมัติ')],
          [B('Watch the economy, not the news noise', 'ดูวัฏจักรเศรษฐกิจ ไม่ใช่เสียงรบกวนจากข่าว'), B('Interest rates, inflation and the business cycle move whole markets. The Market Outlook, Economic Calendar and Market Now pages track them for you.', 'ดอกเบี้ย เงินเฟ้อ และวัฏจักรธุรกิจขยับทั้งตลาด หน้าภาพรวมตลาด ปฏิทินเศรษฐกิจ และตอนนี้ควรทำอะไร ติดตามให้แล้ว')],
          [B('Keep a journal', 'จดบันทึกการลงทุน'), B('Write why you bought, what would make you sell, and review it. Most improvement comes from your own mistakes.', 'จดว่าซื้อเพราะอะไร อะไรจะทำให้ขาย แล้วกลับมาทบทวน พัฒนาการส่วนใหญ่มาจากความผิดพลาดของตัวเอง')],
          [B('Size every idea', 'กำหนดขนาดทุกไอเดีย'), B('Use the position-size calculator in chapter 6. Leverage (forex, futures, margin) multiplies mistakes as fast as gains.', 'ใช้เครื่องคิดขนาดการซื้อในบทที่ 6 เลเวอเรจ (ฟอเร็กซ์ ฟิวเจอร์ส มาร์จิ้น) ขยายความผิดพลาดเร็วพอๆ กับขยายกำไร')]
        ]) +
          table([B('Topic', 'หัวข้อ'), B('Where on this site', 'อยู่หน้าไหนในเว็บนี้')], [
            [B('All markets for beginners', 'รู้จัก 4 ตลาด'), B('Below on this page', 'ด้านล่างของหน้านี้')],
            [B('Where the cycle is now', 'ตอนนี้วัฏจักรอยู่ตรงไหน'), B('Market Outlook · Market Now', 'ภาพรวมตลาด · ตอนนี้ควรทำอะไร')],
            [B('What could go wrong', 'ถ้าเกิดวิกฤตจะเป็นยังไง'), B('Market Shock Simulator', 'จำลองวิกฤตตลาด')],
            [B('One stock in depth', 'หุ้นรายตัวแบบละเอียด'), B('Stock Explorer · Directory', 'หุ้นรายตัว · สารบัญหุ้น')],
            [B('Test yourself', 'ทดสอบตัวเอง'), B('IC licence guide · SPACEZ ISLAND game', 'คู่มือสอบ IC · เกม SPACEZ ISLAND')]
          ]) +
          tip('ok', B('You finished the course path', 'จบเส้นทางคอร์สแล้ว'), B('Come back to any chapter from the course bar. The guided tour below walks you through the whole site one page at a time.', 'กลับมาอ่านบทไหนก็ได้จากแถบคอร์ส โหมดพาเที่ยวด้านล่างพาดูทั้งเว็บทีละหน้า'));
      },
      q:{ q:B('Your mix was 60% stocks; after a great year it is 70%. Rebalancing means…', 'ตั้งสัดส่วนหุ้นไว้ 60% ปีนี้หุ้นขึ้นจนเป็น 70% การปรับสมดุลคือ…'), c:[B('buy more stocks', 'ซื้อหุ้นเพิ่ม'), B('sell some stocks, buy bonds/others', 'ขายหุ้นบางส่วน ไปซื้อตราสารหนี้/อื่นๆ'), B('do nothing ever', 'ไม่ทำอะไรเลย')], a:1, e:B('Selling a little of what grew brings risk back to the level you chose.', 'ขายส่วนที่โตเกินเพื่อดึงความเสี่ยงกลับมาระดับที่เราตั้งใจ') }
    }
  };

  /* ------------------------------------------------------------------
     render + mount
     ------------------------------------------------------------------ */
  function done(){ return lsGet('spz.course.v1', {}) || {}; }
  function fold(){ return lsGet('spz.course.fold', {}) || {}; }
  function barHTML(cur){
    var d = done();
    return '<nav class="spzc-bar" aria-label="' + esc(T(B('Beginner course', 'คอร์สมือใหม่'))) + '"><span class="spzc-bar-t">' + esc(T(B('Beginner course', 'คอร์สมือใหม่'))) + '</span><div class="spzc-bar-s">' +
      STEPS.map(function(s){ var on = s.r === cur, ok = d[s.r]; return '<a href="#/' + s.r + '" data-route-to="' + s.r + '" class="spzc-st' + (on ? ' on' : '') + (ok ? ' ok' : '') + '"' + (on ? ' aria-current="step"' : '') + '><i>' + (ok && !on ? ico('check') : s.n) + '</i><span>' + esc(T(s.t)) + '</span></a>'; }).join('') +
      '</div></nav>';
  }
  function quizHTML(q){
    return '<div class="spzc-quiz"><div class="spzc-quiz-h">' + ico('flag') + '<b>' + esc(T(B('Quick check', 'เช็กความเข้าใจ'))) + '</b></div><p>' + esc(T(q.q)) + '</p><div class="spzc-quiz-c">' +
      q.c.map(function(c, i){ return '<button type="button" data-qi="' + i + '">' + esc(T(c)) + '</button>'; }).join('') + '</div><div class="spzc-quiz-e" hidden></div></div>';
  }
  function html(id){
    var c = CH[id], s = stepOf(id), nx = nextOf(id), f = fold()[id], d = done()[id];
    return barHTML(id) +
      '<div class="spzc-card0' + (f ? ' folded' : '') + '">' +
        '<header class="spzc-head"><div class="spzc-num">' + s.n + '</div><div class="spzc-ht"><span class="spzc-lv">' + esc(T(c.lv)) + '</span><h2>' + esc(T(c.h)) + '</h2><p>' + esc(T(c.lede)) + '</p></div>' +
          '<button type="button" class="spzc-fold" data-fold aria-expanded="' + (f ? 'false' : 'true') + '">' + ico('chev') + '<span>' + esc(T(f ? B('Open lesson', 'เปิดบทเรียน') : B('Hide', 'ย่อ'))) + '</span></button></header>' +
        '<div class="spzc-body">' + c.body() + quizHTML(c.q) +
          '<div class="spzc-end"><button type="button" class="spzc-done' + (d ? ' is' : '') + '" data-done>' + ico('check') + '<span>' + esc(T(d ? B('Chapter finished', 'อ่านบทนี้จบแล้ว') : B('Mark this chapter finished', 'ทำเครื่องหมายว่าอ่านจบแล้ว'))) + '</span></button>' +
          (nx ? '<a class="spzc-next" href="#/' + nx.r + '" data-route-to="' + nx.r + '"><span>' + esc(T(B('Next: chapter ', 'ถัดไป: บทที่ '))) + nx.n + ' · ' + esc(T(nx.t)) + '</span>' + ico('arrow') + '</a>' : '') + '</div>' +
        '</div>' +
      '</div>';
  }
  function paint(box){
    var id = box.getAttribute('data-ch');
    box.innerHTML = html(id);
    box.querySelectorAll('.spzc-svg').forEach(function(sv){ var w = document.createElement('div'); w.className = 'spzc-sw'; sv.parentNode.insertBefore(w, sv); w.appendChild(sv); });
    box.querySelectorAll('.spzc-calc').forEach(runCalc);
    var bs = box.querySelector('.spzc-bar-s'), on = box.querySelector('.spzc-st.on');
    if(bs && on) bs.scrollLeft = Math.max(0, on.offsetLeft - bs.offsetLeft - 24);
  }
  function wire(box){
    box.addEventListener('input', function(e){ var c = e.target.closest('.spzc-calc'); if(c) runCalc(c); });
    box.addEventListener('click', function(e){
      var id = box.getAttribute('data-ch'), t;
      if((t = e.target.closest('[data-fold]'))){ var f = fold(); f[id] = !f[id]; lsSet('spz.course.fold', f); paint(box); return; }
      if((t = e.target.closest('[data-done]'))){ var d = done(); d[id] = !d[id]; lsSet('spz.course.v1', d); paintAll(); return; }
      if((t = e.target.closest('[data-qi]'))){
        var qz = t.closest('.spzc-quiz'), q = CH[id].q, i = +t.getAttribute('data-qi'), ok = i === q.a;
        qz.querySelectorAll('[data-qi]').forEach(function(b){ var k = +b.getAttribute('data-qi'); b.classList.toggle('right', k === q.a && (ok || k === q.a)); b.classList.toggle('wrong', k === i && !ok); b.disabled = true; });
        var ex = qz.querySelector('.spzc-quiz-e'); ex.hidden = false;
        ex.className = 'spzc-quiz-e ' + (ok ? 'ok' : 'no');
        ex.innerHTML = '<b>' + esc(T(ok ? B('Right.', 'ถูกต้อง') : B('Not quite.', 'ยังไม่ใช่'))) + '</b> ' + esc(T(q.e));
      }
    });
  }
  var boxes = [];
  function paintAll(){ boxes.forEach(paint); }
  function mount(){
    var all = true;
    Object.keys(CH).forEach(function(id){
      var sec = document.getElementById(id);
      if(!sec){ all = false; return; }
      if(sec.querySelector('.spzc[data-ch="' + id + '"]')) return;
      var head = sec.querySelector('.section-head');
      if(!head){ all = false; return; }
      var box = document.createElement('div');
      box.className = 'spzc'; box.setAttribute('data-ch', id);
      head.parentNode.insertBefore(box, head.nextSibling);
      wire(box); boxes.push(box); paint(box);
      if('IntersectionObserver' in window) new IntersectionObserver(function(en){ en.forEach(function(x){ if(!x.isIntersecting) return; var bs = box.querySelector('.spzc-bar-s'), on = box.querySelector('.spzc-st.on'); if(bs && on) bs.scrollLeft = Math.max(0, on.offsetLeft - bs.offsetLeft - 24); }); }).observe(box);
    });
    return all;
  }
  window.__SPZ_COURSE = { repaint:paintAll };
  var tries = 0, iv = setInterval(function(){ if(mount() || ++tries > 120) clearInterval(iv); }, 300);
  new MutationObserver(function(){ paintAll(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
})();
