/* ===== SPACEZ MARKETS 101 (2026-11-13) =====
   "รู้จัก 4 ตลาด" — beginner lessons on stocks, forex, options and crypto, each with a drawn
   infographic, how you make money, the main risks, a worked example with real numbers, key terms,
   a safe-start checklist, plus a side-by-side comparison. Added as a section inside the Guided Mode
   page (#/guided, part-23 — the "แนะนำ" pill top-right), below the ten steps. part-23 is untouched:
   this module waits for <section id="guided"> and inserts itself before its note.
   Facts checked 2026-11-13: Bank of Thailand — no one is licensed to offer retail forex trading in
   Thailand; TFEX SET50 Index Options = THB 200 per index point, European style, 09:45–12:30 /
   13:45–16:55; crypto in Thailand only through SEC-licensed digital-asset operators. Education only. */
(function(){
  'use strict';
  if(window.__SPZ_MK4) return; window.__SPZ_MK4 = true;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function B(en, th){ return { en:en, th:th }; }
  var KEY = 'spz.mk4.tab';

  var TX = {
    eb: B('Four markets, explained', 'รู้จัก 4 ตลาด'),
    h2: B('Stocks · Forex · Options · Crypto — how each one really works', 'หุ้น · Forex · ออปชัน · คริปโต — แต่ละอย่างทำงานยังไง'),
    lede: B('Before you put money anywhere, know what you are actually buying, how the money is made, and how it is lost. Pick a market below — each has a picture, a worked example with real numbers and a safe way to start.',
            'ก่อนเอาเงินไปลงที่ไหน ให้รู้ก่อนว่าเรากำลังซื้ออะไร ได้เงินจากอะไร และเสียเงินได้ยังไง เลือกตลาดด้านล่าง แต่ละอันมีภาพอธิบาย ตัวอย่างตัวเลขจริง และวิธีเริ่มแบบปลอดภัย'),
    what: B('What it is', 'คืออะไร'), earn: B('How you make money', 'ได้เงินจากอะไร'), risk: B('How you lose money', 'เสียเงินได้ยังไง'),
    ex: B('Worked example', 'ตัวอย่างคิดเลข'), terms: B('Words to know', 'คำที่ต้องรู้'), start: B('Start safely', 'เริ่มแบบปลอดภัย'),
    riskLv: B('Risk', 'ความเสี่ยง'), open: B('Open on this site', 'เปิดดูในเว็บ'),
    cmpH: B('Side by side', 'เทียบกันชัดๆ'),
    note: B('Education only — not advice to buy or sell anything. Rules checked on 13 Nov 2026 (Bank of Thailand, TFEX, Thai SEC); check the regulator\'s own website before you open any account.',
            'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำให้ซื้อหรือขาย ข้อมูลกฎตรวจเมื่อ 13 พ.ย. 2569 (ธปท., TFEX, ก.ล.ต.) ก่อนเปิดบัญชีที่ไหน ให้เช็กกับเว็บไซต์ของหน่วยงานกำกับเองอีกครั้ง')
  };

  /* ---------------- infographics (inline SVG, drawn here) ---------------- */
  function svgStock(){
    return '<svg class="mk4-svg" viewBox="0 0 520 300" role="img" aria-label="' + esc(T(B('A company split into shares; you earn from price and dividends', 'บริษัทถูกแบ่งเป็นหุ้น เราได้เงินจากราคาขึ้นและเงินปันผล'))) + '">' +
      '<defs><linearGradient id="mk4g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#059669"/></linearGradient></defs>' +
      /* company building */
      '<g class="mk4-pop"><rect x="34" y="70" width="120" height="150" rx="8" class="mk4-box"/>' +
      [0,1,2,3].map(function(r){ return [0,1,2].map(function(c){ return '<rect x="' + (50 + c * 34) + '" y="' + (88 + r * 30) + '" width="22" height="16" rx="3" class="mk4-win"/>'; }).join(''); }).join('') +
      '<text x="94" y="244" class="mk4-t" text-anchor="middle">' + esc(T(B('Company', 'บริษัท'))) + '</text></g>' +
      /* arrow to pie */
      '<path d="M166 145 H214" class="mk4-arr"/><path d="M206 137 l10 8 -10 8" class="mk4-arr"/>' +
      '<text x="190" y="128" class="mk4-s" text-anchor="middle">' + esc(T(B('split into', 'แบ่งเป็น'))) + '</text>' +
      /* pie of shares */
      '<g transform="translate(276 145)"><g class="mk4-pop d2">' +
      (function(){ var s = '', n = 8; for(var i = 0; i < n; i++){ var a0 = i / n * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / n * Math.PI * 2 - Math.PI / 2, r = 56;
        s += '<path d="M0 0 L' + (r * Math.cos(a0)).toFixed(1) + ' ' + (r * Math.sin(a0)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + (r * Math.cos(a1)).toFixed(1) + ' ' + (r * Math.sin(a1)).toFixed(1) + ' Z" class="' + (i === 0 ? 'mk4-me' : 'mk4-sl') + '"/>'; } return s; })() +
      '</g></g><text x="276" y="226" class="mk4-t" text-anchor="middle">' + esc(T(B('Shares', 'หุ้น'))) + '</text>' +
      '<text x="318" y="96" class="mk4-s mk4-g">' + esc(T(B('← your share', '← ส่วนของเรา'))) + '</text>' +
      /* two ways to earn */
      '<g transform="translate(380 66)"><rect width="122" height="70" rx="12" class="mk4-card"/>' +
      '<path d="M16 50 L36 34 L50 42 L72 18" class="mk4-up"/><path d="M64 18 h8 v8" class="mk4-up"/>' +
      '<text x="84" y="34" class="mk4-t">1</text><text x="12" y="64" class="mk4-s">' + esc(T(B('price goes up', 'ราคาขึ้น'))) + '</text></g>' +
      '<g transform="translate(380 154)"><rect width="122" height="70" rx="12" class="mk4-card"/>' +
      '<circle cx="30" cy="30" r="14" class="mk4-coin"/><text x="30" y="35" text-anchor="middle" class="mk4-cs">฿</text>' +
      '<circle cx="54" cy="36" r="10" class="mk4-coin"/>' +
      '<text x="84" y="34" class="mk4-t">2</text><text x="12" y="64" class="mk4-s">' + esc(T(B('dividends', 'เงินปันผล'))) + '</text></g>' +
      '<text x="260" y="282" class="mk4-s" text-anchor="middle">' + esc(T(B('Own a piece of a real business — it grows, you grow with it', 'เป็นเจ้าของส่วนหนึ่งของธุรกิจจริง ธุรกิจโต เราก็โตไปด้วย'))) + '</text></svg>';
  }
  function svgFx(){
    return '<svg class="mk4-svg" viewBox="0 0 520 300" role="img" aria-label="' + esc(T(B('A currency pair and how leverage multiplies a small move', 'คู่สกุลเงิน และการใช้เลเวอเรจขยายการขยับเล็กๆ'))) + '">' +
      /* pair seesaw */
      '<g transform="translate(130 92)"><path d="M-96 18 L96 -6" class="mk4-beam ' + (RM ? '' : 'mk4-tilt') + '"/><path d="M0 6 L-14 40 H14 Z" class="mk4-box"/>' +
      '<circle cx="-86" cy="-6" r="24" class="mk4-coin b"/><text x="-86" y="0" text-anchor="middle" class="mk4-cs">€</text>' +
      '<circle cx="86" cy="-28" r="24" class="mk4-coin q"/><text x="86" y="-22" text-anchor="middle" class="mk4-cs">$</text>' +
      '<text x="0" y="70" text-anchor="middle" class="mk4-big">EUR/USD = 1.0850</text>' +
      '<text x="0" y="92" text-anchor="middle" class="mk4-s">' + esc(T(B('1 euro costs 1.0850 dollars', '1 ยูโร แลกได้ 1.0850 ดอลลาร์'))) + '</text></g>' +
      /* pip ruler */
      '<g transform="translate(26 214)"><rect width="210" height="40" rx="8" class="mk4-card"/>' +
      [0,1,2,3,4,5,6,7,8,9,10].map(function(i){ return '<path d="M' + (12 + i * 18.6) + ' 8 v' + (i % 5 ? 8 : 14) + '" class="mk4-tick"/>'; }).join('') +
      '<text x="105" y="34" text-anchor="middle" class="mk4-s">' + esc(T(B('1 pip = 0.0001  (1.0850 → 1.0851)', '1 pip = 0.0001  (1.0850 → 1.0851)'))) + '</text></g>' +
      /* leverage */
      '<g transform="translate(286 30)"><text x="0" y="12" class="mk4-t">' + esc(T(B('Leverage 1:100', 'เลเวอเรจ 1:100'))) + '</text>' +
      '<rect x="0" y="26" width="22" height="22" rx="4" class="mk4-me"/><text x="30" y="42" class="mk4-s">' + esc(T(B('your 1,000', 'เงินเรา 1,000'))) + '</text>' +
      '<rect x="0" y="60" width="220" height="22" rx="4" class="mk4-sl"/><text x="8" y="76" class="mk4-s mk4-w">' + esc(T(B('controls 100,000', 'คุมเงินก้อน 100,000'))) + '</text>' +
      '<rect x="0" y="104" width="220" height="64" rx="10" class="mk4-card"/>' +
      '<text x="12" y="126" class="mk4-s">' + esc(T(B('price moves 1% your way', 'ราคาขยับ 1% ทางเรา'))) + '</text><text x="208" y="126" text-anchor="end" class="mk4-s mk4-g">+1,000 (+100%)</text>' +
      '<text x="12" y="152" class="mk4-s">' + esc(T(B('price moves 1% against', 'ราคาขยับ 1% สวนทาง'))) + '</text><text x="208" y="152" text-anchor="end" class="mk4-s mk4-r">−1,000 (−100%)</text>' +
      '<text x="0" y="196" class="mk4-s mk4-r">' + esc(T(B('A 1% move can wipe out the whole deposit.', 'ขยับแค่ 1% ก็หมดเงินที่วางไว้ได้'))) + '</text></g></svg>';
  }
  function svgOpt(){
    /* payoff of a long call: strike 900, premium 10 points (x 200 = 2,000 baht) */
    var X0 = 50, X1 = 300, Y0 = 40, Y1 = 230, lo = 860, hi = 960, plo = -15, phi = 50;
    function x(v){ return X0 + (v - lo) / (hi - lo) * (X1 - X0); }
    function y(v){ return Y1 - (v - plo) / (phi - plo) * (Y1 - Y0); }
    var pts = [lo, 900, hi].map(function(s){ return [x(s), y(Math.max(0, s - 900) - 10)]; });
    var zero = y(0);
    return '<svg class="mk4-svg" viewBox="0 0 520 300" role="img" aria-label="' + esc(T(B('Profit of buying a call option at expiry', 'กำไรขาดทุนของการซื้อ Call Option ตอนหมดอายุ'))) + '">' +
      '<rect x="' + X0 + '" y="' + Y0 + '" width="' + (X1 - X0) + '" height="' + (zero - Y0) + '" class="mk4-zg"/>' +
      '<rect x="' + X0 + '" y="' + zero + '" width="' + (X1 - X0) + '" height="' + (Y1 - zero) + '" class="mk4-zr"/>' +
      '<path d="M' + X0 + ' ' + zero + ' H' + X1 + '" class="mk4-axis"/>' +
      '<path d="M' + x(900) + ' ' + Y0 + ' V' + Y1 + '" class="mk4-dash"/>' +
      '<path d="M' + x(910) + ' ' + Y0 + ' V' + Y1 + '" class="mk4-dash g"/>' +
      '<path d="M' + pts.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + '" class="mk4-pay ' + (RM ? '' : 'mk4-draw') + '"/>' +
      '<text x="' + (x(900) - 4) + '" y="' + (Y1 + 16) + '" text-anchor="end" class="mk4-s">' + esc(T(B('strike 900', 'ราคาใช้สิทธิ 900'))) + '</text>' +
      '<text x="' + (x(910) + 4) + '" y="' + (Y1 + 16) + '" class="mk4-s mk4-g">' + esc(T(B('break-even 910', 'คุ้มทุน 910'))) + '</text>' +
      '<text x="' + (X0 + 6) + '" y="' + (y(-10) - 9).toFixed(1) + '" class="mk4-s mk4-r">' + esc(T(B('max loss −2,000 ฿', 'ขาดทุนสูงสุด −2,000 ฿'))) + '</text>' +
      '<text x="' + (X0 + 6) + '" y="' + (Y0 + 18) + '" class="mk4-s mk4-g">' + esc(T(B('profit grows as SET50 rises', 'ดัชนียิ่งขึ้น กำไรยิ่งเพิ่ม'))) + '</text>' +
      '<text x="' + ((X0 + X1) / 2) + '" y="' + (Y1 + 38) + '" text-anchor="middle" class="mk4-s">' + esc(T(B('SET50 at expiry →', 'ดัชนี SET50 ตอนหมดอายุ →'))) + '</text>' +
      /* call vs put cards */
      '<g transform="translate(330 46)"><rect width="172" height="86" rx="12" class="mk4-card"/><text x="14" y="26" class="mk4-t mk4-g">CALL</text>' +
      '<text x="14" y="48" class="mk4-s">' + esc(T(B('the right to BUY at the strike', 'สิทธิ์ "ซื้อ" ที่ราคาใช้สิทธิ'))) + '</text><text x="14" y="70" class="mk4-s">' + esc(T(B('you think it goes UP', 'คิดว่าจะ "ขึ้น"'))) + '</text></g>' +
      '<g transform="translate(330 146)"><rect width="172" height="86" rx="12" class="mk4-card"/><text x="14" y="26" class="mk4-t mk4-r">PUT</text>' +
      '<text x="14" y="48" class="mk4-s">' + esc(T(B('the right to SELL at the strike', 'สิทธิ์ "ขาย" ที่ราคาใช้สิทธิ'))) + '</text><text x="14" y="70" class="mk4-s">' + esc(T(B('you think it goes DOWN', 'คิดว่าจะ "ลง"'))) + '</text></g>' +
      '<text x="416" y="262" text-anchor="middle" class="mk4-s">' + esc(T(B('Buyer pays a premium = ticket', 'คนซื้อจ่ายพรีเมียม = ค่าตั๋ว'))) + '</text></svg>';
  }
  function svgCrypto(){
    var blocks = [0,1,2,3].map(function(i){ var X = 24 + i * 120;
      return '<g class="mk4-pop d' + i + '"><rect x="' + X + '" y="40" width="92" height="74" rx="10" class="mk4-card"/>' +
        '<text x="' + (X + 12) + '" y="62" class="mk4-s">' + esc(T(B('Block', 'บล็อก'))) + ' ' + (1041 + i) + '</text>' +
        '<rect x="' + (X + 12) + '" y="72" width="68" height="6" rx="3" class="mk4-sl"/><rect x="' + (X + 12) + '" y="84" width="48" height="6" rx="3" class="mk4-sl"/>' +
        '<text x="' + (X + 12) + '" y="106" class="mk4-cs2">#' + ['a3f9', '7c21', 'e05b', '19d4'][i] + '</text></g>' +
        (i < 3 ? '<path d="M' + (X + 92) + ' 77 H' + (X + 120) + '" class="mk4-chain"/>' : ''); }).join('');
    var spark = [60, 52, 70, 64, 90, 80, 118, 100, 78, 50, 42, 58, 66, 88, 104];
    var sp = spark.map(function(v, i){ return (290 + i * 15) + ' ' + (276 - v * 0.8).toFixed(1); }).join(' L');
    return '<svg class="mk4-svg" viewBox="0 0 520 300" role="img" aria-label="' + esc(T(B('Blocks chained together, wallet keys, and big price swings', 'บล็อกที่ต่อกันเป็นสาย กุญแจกระเป๋า และราคาที่เหวี่ยงแรง'))) + '">' +
      '<text x="24" y="26" class="mk4-t">' + esc(T(B('Blockchain = a shared ledger nobody can quietly edit', 'บล็อกเชน = สมุดบัญชีกลางที่ไม่มีใครแอบแก้ได้'))) + '</text>' + blocks +
      /* wallet + keys */
      '<g transform="translate(24 150)"><rect width="230" height="112" rx="12" class="mk4-card"/>' +
      '<rect x="16" y="20" width="58" height="42" rx="8" class="mk4-box"/><circle cx="64" cy="41" r="5" class="mk4-coin"/>' +
      '<text x="88" y="36" class="mk4-t">' + esc(T(B('Wallet', 'กระเป๋า'))) + '</text>' +
      '<text x="88" y="56" class="mk4-s">' + esc(T(B('private key = the password', 'Private key = รหัสผ่าน'))) + '</text>' +
      '<text x="16" y="86" class="mk4-s mk4-r">' + esc(T(B('Lose the key or send to a wrong', 'ทำกุญแจหาย หรือโอนผิดที่อยู่'))) + '</text>' +
      '<text x="16" y="102" class="mk4-s mk4-r">' + esc(T(B('address → the coins are gone.', '→ เหรียญหายถาวร เรียกคืนไม่ได้'))) + '</text></g>' +
      /* volatility */
      '<g><text x="290" y="168" class="mk4-t">' + esc(T(B('Price swings are huge', 'ราคาเหวี่ยงแรงมาก'))) + '</text>' +
      '<path d="M' + sp + '" class="mk4-pay ' + (RM ? '' : 'mk4-draw') + '"/>' +
      '<text x="24" y="290" class="mk4-s">' + esc(T(B('Bitcoin has fallen over 70% from a peak more than once', 'บิตคอยน์เคยร่วงเกิน 70% จากจุดสูงสุดมาแล้วหลายรอบ'))) + '</text></g></svg>';
  }

  /* ---------------- lessons ---------------- */
  var M = [
    { k:'stock', ic:'📈', c:'#34d399', name:B('Stocks', 'หุ้น'), one:B('Own a slice of a company', 'เป็นเจ้าของบริษัทส่วนหนึ่ง'), lv:3, svg:svgStock, go:'stockclass',
      what:B('A share is a small piece of ownership in a company listed on an exchange (SET in Thailand, NYSE/Nasdaq in the US). If the company earns more over the years, each share is usually worth more.',
             'หุ้น 1 หุ้น คือความเป็นเจ้าของบริษัทชิ้นเล็กๆ ที่จดทะเบียนในตลาดหลักทรัพย์ (ไทยคือ SET, อเมริกาคือ NYSE/Nasdaq) ถ้าบริษัทกำไรเพิ่มขึ้นเรื่อยๆ ในระยะยาว หุ้นแต่ละหุ้นก็มักมีค่ามากขึ้น'),
      earn:[B('Price gain — sell higher than you bought', 'ส่วนต่างราคา — ขายได้แพงกว่าที่ซื้อ'), B('Dividends — the company shares part of its profit', 'เงินปันผล — บริษัทแบ่งกำไรให้ผู้ถือหุ้น'), B('Time — reinvested dividends compound for years', 'เวลา — เอาปันผลไปลงต่อ เงินทบต้นไปหลายปี')],
      risk:[B('The price can fall, sometimes 30–50% in a bad year', 'ราคาลงได้ บางปีลง 30–50%'), B('One company can fail — do not put everything in one stock', 'บริษัทเดียวอาจเจ๊งได้ อย่าทุ่มทั้งหมดไว้ตัวเดียว'), B('Buying on hype instead of the numbers', 'ซื้อตามกระแส ไม่ดูตัวเลขจริง')],
      ex:B('Buy 100 shares at 10 baht = 1,000 baht. A year later the price is 12 baht (+200) and the company paid 0.50 baht per share (+50). Total +250 baht = +25%. If the price had fallen to 8, you would be −200 before dividends.',
           'ซื้อ 100 หุ้น หุ้นละ 10 บาท = 1,000 บาท ผ่านไป 1 ปี ราคาเป็น 12 บาท (+200) และได้ปันผลหุ้นละ 0.50 บาท (+50) รวม +250 บาท = +25% แต่ถ้าราคาลงเหลือ 8 บาท จะขาดทุน −200 ก่อนรวมปันผล'),
      terms:[[B('P/E', 'P/E'), B('price ÷ profit per share — how many years of profit you pay for', 'ราคา ÷ กำไรต่อหุ้น — จ่ายแพงกี่เท่าของกำไร')], [B('Dividend yield', 'อัตราปันผล'), B('yearly dividend ÷ price', 'ปันผลต่อปี ÷ ราคา')], [B('Market cap', 'มาร์เก็ตแคป'), B('price × all shares = size of the company', 'ราคา × จำนวนหุ้นทั้งหมด = ขนาดบริษัท')], [B('Board lot', 'Board lot'), B('Thai stocks trade in lots of 100 shares', 'หุ้นไทยซื้อขายขั้นต่ำทีละ 100 หุ้น')]],
      start:[B('Open an account with a broker licensed by the Thai SEC', 'เปิดบัญชีกับโบรกเกอร์ที่ได้รับอนุญาตจาก ก.ล.ต.'), B('Start with money you will not need for 5+ years', 'เริ่มด้วยเงินที่ไม่ต้องใช้อย่างน้อย 5 ปี'), B('Spread it out: several companies or an index fund', 'กระจายหลายบริษัท หรือกองทุนดัชนี'), B('Learn the 5-check list in the Stock Classroom first', 'เรียนเช็กลิสต์ 5 ข้อในห้องเรียนหุ้นก่อน')],
      cmp:[B('a piece of a company', 'ส่วนหนึ่งของบริษัท'), B('Thai SEC + SET', 'ก.ล.ต. + ตลาดหลักทรัพย์ฯ'), B('SET 10:00–12:30, 14:30–16:30 · US ≈ 21:30–04:00 Thai time (20:30–03:00 in US summer)', 'SET 10:00–12:30, 14:30–16:30 · หุ้นอเมริกา ≈ 21:30–04:00 เวลาไทย (ช่วงซัมเมอร์ 20:30–03:00)'), B('none (cash account)', 'ไม่มี (บัญชีเงินสด)'), B('no — at worst you lose what you paid', 'ไม่ — แย่สุดคือเสียเงินที่ลงไป'), B('a few hundred baht (100 shares)', 'หลักร้อยบาท (100 หุ้น)')] },
    { k:'fx', ic:'💱', c:'#22d3ee', name:B('Forex', 'Forex (ค่าเงิน)'), one:B('Bet on one currency against another', 'เก็งกำไรค่าเงินหนึ่งเทียบอีกค่าเงิน'), lv:5, svg:svgFx, go:'fx',
      what:B('Forex trading means buying one currency and selling another at the same time, as a pair (EUR/USD, USD/JPY…), hoping the rate moves your way. Retail forex is almost always done with leverage, so tiny moves become big gains or losses.',
             'การเทรด Forex คือการซื้อค่าเงินหนึ่งและขายอีกค่าเงินพร้อมกันเป็น "คู่" (เช่น EUR/USD, USD/JPY) หวังให้อัตราแลกเปลี่ยนวิ่งไปทางที่เราคิด ส่วนใหญ่เทรดด้วยเลเวอเรจ การขยับนิดเดียวจึงกลายเป็นกำไรหรือขาดทุนก้อนใหญ่'),
      earn:[B('The rate moves in the direction you picked', 'ค่าเงินวิ่งไปทางที่เราเลือก'), B('Interest difference between two currencies (swap)', 'ส่วนต่างดอกเบี้ยของสองค่าเงิน (swap)')],
      risk:[B('Leverage: a 1% move can erase the whole deposit', 'เลเวอเรจ: ขยับ 1% อาจหมดเงินทั้งก้อน'), B('Most retail traders lose money; brokers profit from the spread', 'คนเทรดรายย่อยส่วนใหญ่ขาดทุน โบรกได้กำไรจากสเปรด'), B('In Thailand: the Bank of Thailand has licensed NO one to offer retail forex trading — offshore apps can freeze withdrawals or be scams', 'ในไทย: ธนาคารแห่งประเทศไทยไม่เคยให้ใบอนุญาตใครเปิดให้รายย่อยเทรด Forex — แอปต่างประเทศอาจถอนเงินไม่ได้ หรือเป็นมิจฉาชีพ')],
      ex:B('You deposit 1,000 USD with 1:100 leverage and buy 1 standard lot (100,000 euros\' worth) of EUR/USD at 1.0850. The rate goes to 1.0959 (+1%): +1,000 USD, doubling your money. It goes to 1.0741 (−1%): −1,000 USD — the account is wiped out (usually closed automatically before that).',
           'วางเงิน 1,000 ดอลลาร์ เลเวอเรจ 1:100 ซื้อ EUR/USD 1 standard lot (มูลค่า 100,000 ยูโร) ที่ 1.0850 ถ้าค่าเงินขึ้นเป็น 1.0959 (+1%) ได้ +1,000 ดอลลาร์ เงินเท่าตัว แต่ถ้าลงเป็น 1.0741 (−1%) เสีย −1,000 ดอลลาร์ หมดบัญชี (ปกติระบบจะตัดขาดทุนให้ก่อนถึงตรงนั้น)'),
      terms:[[B('Pair', 'คู่เงิน'), B('base/quote, e.g. EUR/USD', 'สกุลหลัก/สกุลอ้างอิง เช่น EUR/USD')], [B('Pip', 'Pip'), B('the smallest normal move, 0.0001', 'หน่วยขยับมาตรฐาน 0.0001')], [B('Lot', 'Lot'), B('standard lot = 100,000 units', '1 standard lot = 100,000 หน่วย')], [B('Margin call', 'Margin call'), B('the broker asks for more money or closes you out', 'โบรกเรียกเงินเพิ่ม หรือปิดสถานะให้')]],
      start:[B('Learn how currencies move first — try the currency and inflation pages', 'เรียนรู้ก่อนว่าค่าเงินขยับเพราะอะไร ลองหน้าค่าเงินและเงินเฟ้อในเว็บ'), B('Never send money to an unlicensed forex app or "signal group"', 'อย่าโอนเงินให้แอป Forex หรือ "กลุ่มให้สัญญาณ" ที่ไม่มีใบอนุญาต'), B('Regulated ways to hold currency: a bank foreign-currency deposit, or USD futures on TFEX', 'วิธีที่ถูกกฎหมาย: บัญชีเงินฝากเงินตราต่างประเทศของธนาคาร หรือ USD Futures ใน TFEX'), B('If someone promises steady monthly returns — it is a scam sign', 'ใครสัญญาว่าได้ผลตอบแทนทุกเดือนแน่นอน = สัญญาณมิจฉาชีพ')],
      cmp:[B('a bet on a currency pair', 'การเก็งค่าเงินเป็นคู่'), B('no licensed retail forex in Thailand (BOT)', 'ไม่มีผู้ได้รับอนุญาตในไทย (ธปท.)'), B('24 h, Monday–Friday', '24 ชม. จันทร์–ศุกร์'), B('very high (1:30 to 1:500 abroad)', 'สูงมาก (1:30 ถึง 1:500 ที่ต่างประเทศ)'), B('can lose the whole deposit very fast', 'เสียเงินทั้งก้อนได้เร็วมาก'), B('often "just 10 USD" — that is the bait', 'มักโฆษณา "แค่ 10 ดอลลาร์" — คือเหยื่อล่อ')] },
    { k:'opt', ic:'🎟', c:'#a78bfa', name:B('Options', 'ออปชัน'), one:B('Pay a premium for a right, not an obligation', 'จ่ายค่าตั๋วเพื่อซื้อ "สิทธิ์"'), lv:4, svg:svgOpt, go:'glossary',
      what:B('An option is a contract that gives the buyer the RIGHT (not the obligation) to buy (call) or sell (put) something at a fixed price (the strike) until or at expiry. The buyer pays a premium, like a ticket. In Thailand the main one is SET50 Index Options on TFEX: 200 baht per index point, exercised only at expiry (European style).',
             'ออปชันคือสัญญาที่ให้ "สิทธิ์" (ไม่ใช่ข้อผูกมัด) แก่คนซื้อ ในการซื้อ (Call) หรือขาย (Put) สินทรัพย์ที่ราคาตายตัว (ราคาใช้สิทธิ / Strike) ภายในหรือ ณ วันหมดอายุ คนซื้อจ่ายค่าพรีเมียมเหมือนซื้อตั๋ว ในไทยตัวหลักคือ SET50 Index Options ใน TFEX จุดละ 200 บาท ใช้สิทธิได้ตอนหมดอายุเท่านั้น (แบบยุโรป)'),
      earn:[B('Buyer: the price moves past the strike by more than the premium', 'คนซื้อ: ราคาวิ่งเลย Strike มากกว่าค่าพรีเมียมที่จ่าย'), B('Seller: keeps the premium if the option expires worthless', 'คนขาย: ได้ค่าพรีเมียมถ้าออปชันหมดอายุไม่มีค่า'), B('Hedging: a put is like insurance for a portfolio', 'ป้องกันความเสี่ยง: Put เหมือนประกันให้พอร์ต')],
      risk:[B('Time decay: the option loses value every day the price stands still', 'ค่าเวลาลดลงทุกวัน ถ้าราคาไม่ขยับ ออปชันก็ค่อยๆ หมดค่า'), B('Buyers lose 100% of the premium surprisingly often', 'คนซื้อเสียพรีเมียม 100% บ่อยกว่าที่คิด'), B('Sellers can lose many times the premium they collected', 'คนขายอาจขาดทุนหลายเท่าของพรีเมียมที่ได้มา')],
      ex:B('SET50 is at 895. You buy a call, strike 900, premium 10 points = 10 × 200 = 2,000 baht. At expiry SET50 = 930: the call is worth 30 points = 6,000 baht, profit 4,000. At 905: worth 5 points = 1,000, loss −1,000. At 890: worth 0, loss −2,000 (the most a buyer can lose). Break-even = 900 + 10 = 910.',
           'SET50 อยู่ที่ 895 เราซื้อ Call ราคาใช้สิทธิ 900 พรีเมียม 10 จุด = 10 × 200 = 2,000 บาท ตอนหมดอายุ ถ้า SET50 = 930 → มีค่า 30 จุด = 6,000 บาท กำไร 4,000 ถ้า = 905 → มีค่า 5 จุด = 1,000 ขาดทุน −1,000 ถ้า = 890 → ไม่มีค่า ขาดทุน −2,000 (มากสุดที่คนซื้อเสียได้) จุดคุ้มทุน = 900 + 10 = 910'),
      terms:[[B('Call / Put', 'Call / Put'), B('right to buy / right to sell', 'สิทธิ์ซื้อ / สิทธิ์ขาย')], [B('Strike', 'ราคาใช้สิทธิ'), B('the fixed price in the contract', 'ราคาตายตัวในสัญญา')], [B('Premium', 'พรีเมียม'), B('the price of the option', 'ราคาของออปชัน (ค่าตั๋ว)')], [B('Expiry', 'วันหมดอายุ'), B('last day the right exists', 'วันสุดท้ายที่สิทธิ์ยังอยู่')], [B('In / out of the money', 'ITM / OTM'), B('worth something now / worth nothing yet', 'ตอนนี้มีค่า / ตอนนี้ยังไม่มีค่า')]],
      start:[B('Understand stocks and indexes first', 'เข้าใจหุ้นและดัชนีให้ดีก่อน'), B('Only BUY options at first — never sell options as a beginner', 'มือใหม่ให้ "ซื้อ" ออปชันเท่านั้น อย่าเริ่มด้วยการ "ขาย"'), B('Treat every premium as money you can lose completely', 'คิดเสมอว่าเงินพรีเมียมอาจหายหมด'), B('Trade through a TFEX member broker with a derivatives account', 'เทรดผ่านโบรกเกอร์สมาชิก TFEX ที่มีบัญชีอนุพันธ์')],
      cmp:[B('a right to buy/sell at a fixed price', 'สิทธิ์ซื้อ/ขายที่ราคาตายตัว'), B('Thai SEC + TFEX', 'ก.ล.ต. + TFEX'), B('TFEX 09:45–12:30, 13:45–16:55', 'TFEX 09:45–12:30, 13:45–16:55'), B('built in (small premium, big exposure)', 'มีอยู่ในตัว (จ่ายน้อย คุมมูลค่าเยอะ)'), B('buyer: no · seller: yes', 'คนซื้อ: ไม่ · คนขาย: ได้'), B('one premium, e.g. 2,000 baht', 'ค่าพรีเมียม เช่น 2,000 บาท')] },
    { k:'cry', ic:'🪙', c:'#fbbf24', name:B('Crypto', 'คริปโต'), one:B('Digital coins on a blockchain', 'เหรียญดิจิทัลบนบล็อกเชน'), lv:5, svg:svgCrypto, go:null,
      what:B('Cryptocurrencies such as Bitcoin and Ethereum are digital tokens recorded on a blockchain — a shared ledger copied on thousands of computers. There is no company profit or dividend behind most coins: the price is what the next buyer will pay.',
             'คริปโตเคอร์เรนซี เช่น บิตคอยน์ อีเธอเรียม คือเหรียญดิจิทัลที่บันทึกบนบล็อกเชน — สมุดบัญชีกลางที่ถูกก๊อปไว้ในคอมพิวเตอร์หลายพันเครื่อง เหรียญส่วนใหญ่ไม่มีกำไรหรือปันผลของบริษัทรองรับ ราคาคือเท่าที่คนต่อไปยอมจ่าย'),
      earn:[B('Price rises from more demand or adoption', 'ราคาขึ้นเพราะคนอยากได้หรือใช้มากขึ้น'), B('Staking / lending rewards on some coins (with their own risks)', 'ผลตอบแทนจากการ Stake / ให้ยืม ในบางเหรียญ (มีความเสี่ยงเฉพาะ)')],
      risk:[B('Very large swings — falls of 70%+ have happened several times', 'เหวี่ยงแรงมาก เคยร่วง 70% ขึ้นไปหลายรอบ'), B('Exchange failure, hacks, lost keys — often no way back', 'ศูนย์ซื้อขายล้ม โดนแฮก ทำกุญแจหาย มักเอาคืนไม่ได้'), B('Scams: fake coins, fake exchanges, "guaranteed" returns', 'มิจฉาชีพ: เหรียญปลอม ศูนย์ปลอม การันตีผลตอบแทน')],
      ex:B('You buy 0.01 BTC at 68,000 USD = 680 USD. A rise to 100,000 makes it 1,000 (+47%). A fall to 20,000 — which happened in 2022 from a peak near 69,000 — makes it 200 (−71%).',
           'ซื้อ 0.01 BTC ที่ราคา 68,000 ดอลลาร์ = 680 ดอลลาร์ ถ้าขึ้นไป 100,000 จะเป็น 1,000 (+47%) ถ้าลงไป 20,000 — ซึ่งเคยเกิดในปี 2022 จากจุดสูงสุดราว 69,000 — จะเหลือ 200 (−71%)'),
      terms:[[B('Blockchain', 'บล็อกเชน'), B('the shared ledger of all transactions', 'สมุดบัญชีกลางของทุกธุรกรรม')], [B('Wallet / private key', 'กระเป๋า / Private key'), B('where coins live / the password to move them', 'ที่เก็บเหรียญ / รหัสสำหรับโอน')], [B('Exchange', 'ศูนย์ซื้อขาย'), B('the app that matches buyers and sellers', 'แอปที่จับคู่คนซื้อคนขาย')], [B('Stablecoin', 'Stablecoin'), B('a coin meant to track 1 USD', 'เหรียญที่ตั้งใจให้เท่ากับ 1 ดอลลาร์')], [B('Halving', 'Halving'), B('Bitcoin\'s new-coin reward halves about every 4 years', 'รางวัลขุดบิตคอยน์ลดครึ่งราว 4 ปีครั้ง')]],
      start:[B('Use only exchanges licensed by the Thai SEC — check the list on sec.or.th', 'ใช้เฉพาะศูนย์ซื้อขายที่ได้รับอนุญาตจาก ก.ล.ต. — เช็กรายชื่อที่ sec.or.th'), B('Put in only what you can afford to lose entirely', 'ลงเฉพาะเงินที่เสียหมดได้โดยไม่เดือดร้อน'), B('Turn on 2-step login; never share your key or OTP', 'เปิดล็อกอิน 2 ชั้น ห้ามบอกกุญแจหรือ OTP กับใคร'), B('Ignore anyone selling "a coin about to list"', 'อย่าเชื่อใครขาย "เหรียญที่กำลังจะเข้าตลาด"')],
      cmp:[B('a digital token on a blockchain', 'เหรียญดิจิทัลบนบล็อกเชน'), B('Thai SEC-licensed digital-asset operators', 'ผู้ให้บริการสินทรัพย์ดิจิทัลที่ ก.ล.ต. อนุญาต'), B('24 h, every day', '24 ชม. ทุกวัน'), B('none on spot; very high on offshore futures', 'ซื้อจริงไม่มี · ฟิวเจอร์สต่างประเทศสูงมาก'), B('spot: no · leveraged: yes', 'ซื้อจริง: ไม่ · ใช้เลเวอเรจ: ได้'), B('as little as 20–100 baht', 'เริ่มได้ราว 20–100 บาท')] }
  ];
  var CMP_ROWS = [B('What you buy', 'ซื้ออะไร'), B('Who supervises it in Thailand', 'ใครกำกับในไทย'), B('Trading hours', 'เวลาซื้อขาย'), B('Leverage', 'เลเวอเรจ'), B('Can you lose more than you put in?', 'เสียเกินเงินที่ลงได้ไหม'), B('Smallest start', 'เริ่มขั้นต่ำ')];

  var cur = 'stock';
  try { var sv = localStorage.getItem(KEY); if(sv && M.some(function(m){ return m.k === sv; })) cur = sv; } catch(e){}

  function meter(n){ var s = ''; for(var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return '<span class="mk4-mt" aria-label="' + n + '/5">' + s + '</span>'; }
  function cardsHTML(){
    return '<div class="mk4-cards" role="tablist">' + M.map(function(m){
      return '<button type="button" role="tab" class="mk4-cd' + (m.k === cur ? ' on' : '') + '" data-mk4="' + m.k + '" style="--c:' + m.c + '" aria-selected="' + (m.k === cur) + '">' +
        '<span class="mk4-ic">' + m.ic + '</span><b>' + esc(T(m.name)) + '</b><span class="mk4-one">' + esc(T(m.one)) + '</span>' +
        '<span class="mk4-rk">' + esc(T(TX.riskLv)) + ' ' + meter(m.lv) + '</span></button>';
    }).join('') + '</div>';
  }
  function list(a, cls){ return '<ul class="' + cls + '">' + a.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul>'; }
  function panelHTML(){
    var m = M.filter(function(x){ return x.k === cur; })[0];
    return '<div class="mk4-pn" role="tabpanel" style="--c:' + m.c + '">' +
      '<div class="mk4-top"><div class="mk4-txt">' +
        '<h3><span>' + m.ic + '</span>' + esc(T(m.name)) + '</h3>' +
        '<h4>' + esc(T(TX.what)) + '</h4><p>' + esc(T(m.what)) + '</p>' +
        '<div class="mk4-two"><div><h4 class="g">' + esc(T(TX.earn)) + '</h4>' + list(m.earn, 'mk4-ul g') + '</div>' +
        '<div><h4 class="r">' + esc(T(TX.risk)) + '</h4>' + list(m.risk, 'mk4-ul r') + '</div></div>' +
      '</div><div class="mk4-art">' + m.svg() + '</div></div>' +
      '<div class="mk4-ex"><span class="mk4-tag">' + esc(T(TX.ex)) + '</span><p>' + esc(T(m.ex)) + '</p></div>' +
      '<div class="mk4-bot"><div><h4>' + esc(T(TX.terms)) + '</h4><dl class="mk4-dl">' + m.terms.map(function(t){ return '<div><dt>' + esc(T(t[0])) + '</dt><dd>' + esc(T(t[1])) + '</dd></div>'; }).join('') + '</dl></div>' +
        '<div><h4>' + esc(T(TX.start)) + '</h4><ol class="mk4-ol">' + m.start.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ol>' +
        (m.go ? '<button type="button" class="mk4-go" data-route-to="' + m.go + '">' + esc(T(TX.open)) + ' →</button>' : '') + '</div></div>' +
    '</div>';
  }
  function cmpHTML(){
    return '<div class="mk4-cmpw"><h4 class="mk4-cmph">' + esc(T(TX.cmpH)) + '</h4><div class="mk4-scroll"><table class="mk4-cmp"><thead><tr><th></th>' +
      M.map(function(m){ return '<th style="--c:' + m.c + '"><span>' + m.ic + '</span> ' + esc(T(m.name)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      CMP_ROWS.map(function(r, i){ return '<tr><th>' + esc(T(r)) + '</th>' + M.map(function(m){ return '<td>' + esc(T(m.cmp[i])) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '<tr><th>' + esc(T(TX.riskLv)) + '</th>' + M.map(function(m){ return '<td>' + meter(m.lv) + '</td>'; }).join('') + '</tr>' +
      '</tbody></table></div></div>';
  }
  var root = null;
  function paint(){
    if(!root) return;
    root.innerHTML =
      '<div class="mk4-hd"><div class="eyebrow"><span class="cursor"></span>' + esc(T(TX.eb)) + '</div><h2>' + esc(T(TX.h2)) + '</h2><p>' + esc(T(TX.lede)) + '</p></div>' +
      cardsHTML() + '<div data-mk4p>' + panelHTML() + '</div>' + cmpHTML() + '<p class="mk4-note">' + esc(T(TX.note)) + '</p>';
  }
  function mount(){
    var g = document.getElementById('guided'); if(!g) return false;
    if(g.querySelector('.mk4')) return true;
    root = document.createElement('div'); root.className = 'mk4'; root.id = 'markets101';
    var note = g.querySelector('[data-g="note"]');
    if(note) g.insertBefore(root, note); else g.appendChild(root);
    paint();
    root.addEventListener('click', function(e){
      var b = e.target.closest('[data-mk4]'); if(!b) return;
      cur = b.getAttribute('data-mk4'); try { localStorage.setItem(KEY, cur); } catch(x){}
      root.querySelectorAll('[data-mk4]').forEach(function(x){ var on = x.getAttribute('data-mk4') === cur; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      var p = root.querySelector('[data-mk4p]'); p.innerHTML = panelHTML();
    });
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  var tries = 0;
  (function wait(){ if(mount() || ++tries > 120) return; setTimeout(wait, 500); })();
})();
