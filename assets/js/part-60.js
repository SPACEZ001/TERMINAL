
/* ============================================================================
   SPACEZ TERMINAL — ROUND R: BEGINNER CHECKLIST
   "What To Check Before You Invest" -- the 6th item in the Learn nav group.
   A self-contained teaching page: no per-item "jump to glossary" buttons
   (removed per user feedback -- those broke the back-navigation flow and she
   wanted this page to fully teach on its own, with graphics, so it can be
   handed to a total beginner start-to-finish). Each of the five checks gets
   a full explanation (what it is / why it matters / how to read it / common
   mistake) plus a small illustrative diagram. Only two exits at the bottom:
   one link into the full glossary, one into Guided Mode.
   ========================================================================= */
(function(){
  'use strict';

  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ---------------- small illustrative diagrams (generic teaching graphics,
     not bound to any live stock -- the glossary's own live gauges already
     cover that job) ---------------- */
  function txt(x, y, s, cls){ return '<text x="' + x + '" y="' + y + '" text-anchor="middle" class="' + cls + '">' + esc(s) + '</text>'; }

  function speSVG(){
    var w = 94, gap = 3, x0 = 6, y = 30, h = 14;
    var seg = [
      { c:'var(--neon-2)', l:{en:'CHEAP', th:'ถูก'} },
      { c:'var(--grey-dim)', l:{en:'FAIR', th:'พอดี'} },
      { c:'var(--red)', l:{en:'EXPENSIVE', th:'แพง'} }
    ];
    var s = '<svg viewBox="0 0 300 64" class="bsc-g">';
    for(var i = 0; i < 3; i++){
      var sx = x0 + i * (w + gap);
      s += '<rect x="' + sx + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" style="fill:' + seg[i].c + ';opacity:.55"/>';
      s += txt(sx + w / 2, y - 8, T(seg[i].l), 'bsc-gl');
    }
    s += txt(150, 58, T({en:'depends on the company & sector — always compare, never judge alone', th:'ขึ้นอยู่กับบริษัทและกลุ่มธุรกิจ เทียบเสมอ อย่าตัดสินจากตัวเดียว'}), 'bsc-gc');
    s += '</svg>';
    return s;
  }

  /* leftLabelObj/rightLabelObj/captionObj are {en,th} pairs, resolved with
     T() at call time -- NOT pre-resolved strings -- so this stays correct
     when called fresh from paint() on every language toggle. */
  function splitBarSVG(leftPct, leftLabelObj, rightLabelObj, captionObj){
    var w = 286, x0 = 6, h = 18, y = 24;
    var lw = Math.max(0, Math.round(w * leftPct / 100) - 1);
    var rw = w - lw - 2;
    var s = '<svg viewBox="0 0 300 62" class="bsc-g">';
    s += '<rect x="' + x0 + '" y="' + y + '" width="' + lw + '" height="' + h + '" rx="9" style="fill:var(--neon-2);opacity:.55"/>';
    s += '<rect x="' + (x0 + lw + 2) + '" y="' + y + '" width="' + rw + '" height="' + h + '" rx="9" style="fill:var(--red);opacity:.55"/>';
    s += txt(x0 + lw / 2, y - 8, T(leftLabelObj), 'bsc-gl');
    s += txt(x0 + lw + 2 + rw / 2, y - 8, T(rightLabelObj), 'bsc-gl');
    s += txt(150, 58, T(captionObj), 'bsc-gc');
    s += '</svg>';
    return s;
  }

  function flowSVG(){
    var s = '<svg viewBox="0 0 300 70" class="bsc-g">' +
      '<defs><marker id="bscArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" style="fill:var(--neon)"/></marker></defs>' +
      '<rect x="4" y="24" width="82" height="26" rx="6" style="fill:none;stroke:var(--border);stroke-width:1.4"/>' +
      txt(45, 41, T({en:'CAPITAL IN', th:'ทุนที่ใส่เข้าไป'}), 'bsc-gl') +
      '<path d="M90 37 H132" style="stroke:var(--neon);stroke-width:1.6;marker-end:url(#bscArrow)"/>' +
      '<circle cx="150" cy="37" r="19" style="fill:none;stroke:var(--neon);stroke-width:1.8"/>' +
      txt(150, 41, 'ROE', 'bsc-gl on') +
      '<path d="M172 37 H214" style="stroke:var(--neon);stroke-width:1.6;marker-end:url(#bscArrow)"/>' +
      '<rect x="216" y="24" width="80" height="26" rx="6" style="fill:none;stroke:var(--border);stroke-width:1.4"/>' +
      txt(256, 41, T({en:'PROFIT OUT', th:'กำไรที่ได้'}), 'bsc-gl') +
      txt(150, 66, T({en:'the same capital, doing more (or less) work for you', th:'ทุนก้อนเท่ากัน แต่ทำงานให้คุณได้มากหรือน้อยกว่ากัน'}), 'bsc-gc') +
      '</svg>';
    return s;
  }

  function meltSVG(){
    var s = '<svg viewBox="0 0 300 74" class="bsc-g">' +
      '<rect x="36" y="10" width="50" height="52" rx="5" style="fill:var(--neon);opacity:.5"/>' +
      txt(61, 72, T({en:'MARKET PRICE', th:'ราคาตลาด'}), 'bsc-gl') +
      '<line x1="150" y1="40" x2="292" y2="40" style="stroke:var(--grey-dim);stroke-width:1.4;stroke-dasharray:4 3"/>' +
      txt(221, 34, T({en:'BOOK VALUE (FLOOR)', th:'มูลค่าทางบัญชี (พื้น)'}), 'bsc-gc') +
      '<rect x="198" y="40" width="46" height="22" rx="5" style="fill:none;stroke:var(--grey-dim);stroke-width:1.4;stroke-dasharray:3 2"/>' +
      '</svg>';
    return s;
  }

  var BK = {
    eb:{en:'06 · Before You Buy', th:'06 · ก่อนซื้อหุ้น'},
    h2:{en:'What To Check Before You Invest', th:'ก่อนลงทุน ต้องเช็คอะไรบ้าง'},
    lede:{en:'A complete beginner’s guide to five things every stock has to pass before you buy it — written so this one page can be read start to finish, no jumping around required.',
          th:'คู่มือสำหรับมือใหม่ล้วนๆ ห้าเรื่องที่หุ้นทุกตัวต้องผ่านก่อนซื้อ เขียนให้อ่านจบในหน้าเดียวได้เลย ไม่ต้องกระโดดไปที่อื่น'},

    genH:{en:'Five things to understand about any stock', th:'ห้าเรื่องที่ต้องเข้าใจก่อนซื้อหุ้นตัวไหน'},

    labWhat:{en:'▸ WHAT IT IS', th:'▸ คืออะไร'},
    labWhy:{en:'◎ WHY IT MATTERS', th:'◎ ทำไมสำคัญ'},
    labHow:{en:'✓ HOW TO READ IT', th:'✓ อ่านค่ายังไง'},
    labMis:{en:'★ COMMON MISTAKE', th:'★ ข้อผิดพลาดที่พบบ่อย'},

    items:[
      { ic:'💰',
        t:{en:'Is the price already expensive for what it earns?', th:'ราคาแพงเกินกำไรที่มันทำได้หรือยัง (P/E)'},
        what:{en:'The P/E ratio takes the share price and divides it by the company’s profit per share over the past year. A P/E of 20 means you are paying 20 times this year’s profit to own one share.',
              th:'P/E คือราคาหุ้นหารด้วยกำไรต่อหุ้นในรอบปีที่ผ่านมา P/E เท่ากับ 20 แปลว่าคุณจ่ายแพงกว่ากำไรปีนี้ถึง 20 เท่า เพื่อเป็นเจ้าของหุ้นหนึ่งหุ้น'},
        why:{en:'It is the single fastest gut-check for how the market is pricing a company’s future — cheap, fair, or hyped.',
             th:'เป็นวิธีเช็คเร็วที่สุดว่าตลาดกำลังตีราคาอนาคตของบริษัทนี้ไว้แบบไหน — ถูก พอดี หรือคาดหวังเกินจริง'},
        how:{en:'There is no universal "good" number. A fast-growing tech company can fairly deserve a P/E of 40+, while a slow, stable utility deserves 10-12. Always compare a company’s P/E against its own 5-year average and against close competitors in the same sector.',
             th:'ไม่มีตัวเลข "ดี" ที่ใช้ได้กับทุกบริษัท หุ้นเทคที่โตเร็วอาจสมควรมี P/E สูงถึง 40 กว่า ในขณะที่หุ้นสาธารณูปโภคที่โตช้าแต่มั่นคงอาจสมควรมีแค่ 10-12 ให้เทียบ P/E ของบริษัทกับค่าเฉลี่ยย้อนหลัง 5 ปีของตัวเอง และกับคู่แข่งในกลุ่มอุตสาหกรรมเดียวกันเสมอ'},
        mistake:{en:'Buying purely because P/E "looks low." A low P/E can also mean the market correctly expects trouble ahead — falling profit, a dying product line, an accounting problem.',
                 th:'ซื้อเพราะเห็นว่า P/E "ดูต่ำ" อย่างเดียว P/E ต่ำก็อาจแปลว่าตลาดกำลังคาดการณ์ปัญหาที่ถูกต้องอยู่ก็ได้ — กำไรกำลังจะลด สินค้าหลักกำลังจะตาย หรือมีปัญหาเรื่องบัญชี'},
        viz: speSVG },

      { ic:'🏦',
        t:{en:'How much debt is it carrying?', th:'มันมีหนี้มากแค่ไหน (D/E)'},
        what:{en:'Debt-to-Equity divides everything the company owes by everything shareholders actually own (equity). A D/E of 1.0 means debt equals equity; 2.0 means the company owes twice what it owns outright.',
              th:'D/E คือหนี้สินทั้งหมดหารด้วยทุนของผู้ถือหุ้น (สิ่งที่เป็นของบริษัทเองจริงๆ) D/E เท่ากับ 1.0 แปลว่าหนี้เท่ากับทุน ส่วน 2.0 แปลว่าบริษัทเป็นหนี้มากกว่าทุนตัวเองถึงสองเท่า'},
        why:{en:'Debt is not automatically bad — used well, it lets a company grow faster than its own cash flow alone would allow. But debt has to be repaid regardless of how business is going, so it turns a bad year into a dangerous one.',
             th:'หนี้ไม่ได้แปลว่าแย่เสมอไป — ใช้ให้ถูกวิธี มันช่วยให้ธุรกิจโตเร็วกว่าใช้เงินสดตัวเองอย่างเดียว แต่หนี้ต้องจ่ายคืนไม่ว่าธุรกิจจะเป็นยังไง ปีที่แย่อยู่แล้วเลยกลายเป็นปีที่อันตรายได้'},
        how:{en:'Always compare within the same sector. Banks and utilities normally run high D/E as part of how their business works; a small industrial or consumer company running D/E above 2 is a very different, riskier story.',
             th:'ให้เทียบภายในกลุ่มธุรกิจเดียวกันเสมอ ธนาคารและสาธารณูปโภคมักมี D/E สูงเป็นปกติตามลักษณะธุรกิจ แต่บริษัทอุตสาหกรรมหรือสินค้าอุปโภคขนาดเล็กที่มี D/E เกิน 2 คือเรื่องที่เสี่ยงกว่ามาก'},
        mistake:{en:'Treating all debt the same. The real question is what the debt paid for — new factories and growth (often fine) or just covering losses and paying old bills (a warning sign).',
                 th:'มองว่าหนี้ทุกแบบเหมือนกันหมด คำถามจริงคือหนี้นั้นเอาไปทำอะไร — สร้างโรงงานใหม่เพื่อโต (ส่วนใหญ่ไม่เป็นไร) หรือแค่เอาไปโปะขาดทุนกับหนี้เก่า (สัญญาณเตือน)'},
        viz: function(){ return splitBarSVG(62, {en:'EQUITY (own money)', th:'ทุนตัวเอง'}, {en:'DEBT (borrowed)', th:'หนี้สิน'},
             {en:'illustrative split — always check the real ratio for the company you’re looking at', th:'ตัวอย่างสัดส่วนเฉยๆ — เช็คตัวเลขจริงของบริษัทที่คุณดูอยู่เสมอ'}); } },

      { ic:'📈',
        t:{en:'How efficiently does it turn capital into profit?', th:'มันเปลี่ยนทุนเป็นกำไรได้มีประสิทธิภาพแค่ไหน (ROE / มาร์จิ้น)'},
        what:{en:'Return on Equity (ROE) shows how much profit a company produces for every unit of shareholders’ money already invested in it. Margin shows how much of every single sale survives as actual profit after all costs.',
              th:'ROE (ผลตอบแทนต่อทุน) บอกว่าบริษัททำกำไรได้เท่าไหร่ต่อเงินทุนของผู้ถือหุ้นที่ใส่ไปแล้ว ส่วนมาร์จิ้นบอกว่าในทุกยอดขาย เหลือเป็นกำไรจริงเท่าไหร่หลังหักต้นทุนทั้งหมด'},
        why:{en:'A company can grow sales fast and still be a bad investment if none of that growth turns into real profit. High, stable ROE and margin are signs of a genuinely well-run business — not just a busy one.',
             th:'บริษัทอาจโตยอดขายเร็วมาก แต่ยังเป็นการลงทุนที่แย่ได้ ถ้าการเติบโตนั้นไม่กลายเป็นกำไรจริง ROE และมาร์จิ้นที่สูงและมั่นคง คือสัญญาณของธุรกิจที่บริหารดีจริง ไม่ใช่แค่ดูยุ่งๆ'},
        how:{en:'ROE comfortably above roughly 15%, held steady or improving year over year, is generally a healthy sign. A margin that keeps shrinking while revenue keeps growing is a red flag — it usually means competitors are eating into pricing power.',
             th:'ROE ที่สูงกว่าประมาณ 15% อย่างสบายๆ และทรงตัวหรือดีขึ้นทุกปี ถือเป็นสัญญาณที่ดี ส่วนมาร์จิ้นที่ลดลงเรื่อยๆ ทั้งที่ยอดขายโตขึ้น เป็นสัญญาณเตือน — มักแปลว่าคู่แข่งกำลังแย่งอำนาจตั้งราคาไป'},
        mistake:{en:'Getting excited about a revenue-growth headline without ever checking whether profit grew along with it.',
                 th:'ตื่นเต้นกับพาดหัวข่าวยอดขายโต โดยไม่เช็คเลยว่ากำไรโตตามไปด้วยหรือเปล่า'},
        viz: flowSVG },

      { ic:'💵',
        t:{en:'If it pays a dividend — is that dividend actually safe?', th:'ถ้ามันจ่ายปันผล ปันผลนั้นปลอดภัยจริงไหม'},
        what:{en:'Dividend yield is the annual cash paid divided by the share price — the cash return you get just for holding the stock. Payout ratio is the share of profit actually paid out as that dividend. Payout frequency is simply how often it arrives — quarterly is common in many markets, others pay once a year.',
              th:'อัตราปันผล (dividend yield) คือเงินสดที่จ่ายต่อปี หารด้วยราคาหุ้น — ผลตอบแทนเงินสดที่ได้แค่จากการถือหุ้นไว้ อัตราการจ่ายปันผล (payout ratio) คือสัดส่วนกำไรที่จ่ายออกมาเป็นปันผลจริง ส่วนรอบการจ่ายปันผล (payout frequency) คือความถี่ในการจ่าย — หลายตลาดจ่ายรายไตรมาส บางที่จ่ายปีละครั้ง'},
        why:{en:'A high yield feels great right up until the dividend gets cut, and the yield alone can never tell you that a cut is coming. The payout ratio is the real safety check.',
             th:'อัตราปันผลสูงดูดีจนกว่าปันผลจะถูกลด และตัวเลขอัตราปันผลอย่างเดียวไม่มีทางบอกล่วงหน้าได้ว่าจะถูกลดเมื่อไหร่ อัตราการจ่ายปันผลต่างหากที่เป็นตัวเช็คความปลอดภัยจริง'},
        how:{en:'A payout ratio comfortably under roughly 70-80% usually leaves room to keep paying even through a rough year. A payout ratio at or above 100% for several years running is a serious warning sign — the company is paying out more than it earns.',
             th:'อัตราการจ่ายปันผลที่ต่ำกว่าประมาณ 70-80% อย่างสบายๆ มักเหลือช่องให้จ่ายต่อได้แม้ปีนั้นจะแย่ ถ้าอัตราการจ่ายอยู่ที่ 100% ขึ้นไปติดต่อกันหลายปี เป็นสัญญาณเตือนร้ายแรง — บริษัทกำลังจ่ายออกมากกว่าที่หาได้'},
        mistake:{en:'Chasing the single highest yield on a screener list without ever checking whether the payout ratio can actually support it.',
                 th:'ไล่ซื้อหุ้นที่อัตราปันผลสูงที่สุดในลิสต์ โดยไม่เช็คเลยว่าอัตราการจ่ายปันผลจะรองรับไหวจริงหรือเปล่า'},
        viz: function(){ return splitBarSVG(45, {en:'PAID OUT', th:'จ่ายออกไป'}, {en:'KEPT BY COMPANY', th:'เก็บไว้ในบริษัท'},
             {en:'danger zone starts around 80-100% payout, held for several years', th:'โซนอันตรายเริ่มที่จ่ายราว 80-100% ติดต่อกันหลายปี'}); } },

      { ic:'⚖️',
        t:{en:'What is it worth if everything went wrong tomorrow?', th:'ถ้าพรุ่งนี้ทุกอย่างพังหมด มันยังเหลือมูลค่าเท่าไหร่ (P/B)'},
        what:{en:'Price-to-Book compares the share price to the accounting value of everything the company owns, minus everything it owes — its "book value" per share.',
              th:'P/B เทียบราคาหุ้นกับมูลค่าทางบัญชีของทุกอย่างที่บริษัทเป็นเจ้าของ หักด้วยทุกอย่างที่เป็นหนี้ — เรียกว่า "มูลค่าทางบัญชี" ต่อหุ้น'},
        why:{en:'It is a rough floor: a sense of what shareholders could theoretically be left holding if the company simply stopped growing tomorrow and its assets were valued at what the books say.',
             th:'มันคือพื้นคร่าวๆ ของมูลค่า — ประมาณว่าถ้าบริษัทหยุดโตพรุ่งนี้เลย แล้วตีมูลค่าทรัพย์สินตามบัญชี ผู้ถือหุ้นจะเหลืออะไรบ้าง'},
        how:{en:'It matters most for asset-heavy businesses — banks, property, industrials — where the assets on the books are close to real cash value. It matters far less for asset-light businesses like software or services, whose real value lives in people, brand and ideas a balance sheet never captures.',
             th:'มีความหมายมากกับธุรกิจที่ใช้สินทรัพย์เยอะ เช่น ธนาคาร อสังหาริมทรัพย์ อุตสาหกรรม เพราะสินทรัพย์ในบัญชีใกล้เคียงมูลค่าจริง แต่มีความหมายน้อยมากกับธุรกิจที่ใช้สินทรัพย์น้อย เช่น ซอฟต์แวร์หรือบริการ ที่มูลค่าจริงอยู่ที่คน แบรนด์ และไอเดีย ซึ่งงบดุลไม่เคยจับต้องได้'},
        mistake:{en:'Using P/B to judge a tech or services company, where a "low" number is often meaningless rather than a bargain.',
                 th:'เอา P/B ไปตัดสินหุ้นเทคหรือหุ้นบริการ ซึ่งตัวเลข "ต่ำ" มักไม่มีความหมายอะไรเลย ไม่ใช่ว่าราคาถูก'},
        viz: meltSVG }
    ],

    sizeH:{en:'Before any of the above — decide your position size', th:'ก่อนดูเรื่องข้างบนทั้งหมด — ตัดสินใจขนาดไม้ก่อน'},
    sizeD:{en:'A great company at the wrong size is still a bad decision. Cap any single name near 5% of the portfolio and use the Position Size tool before you place a single order.',
           th:'บริษัทดีแค่ไหน ถ้าลงขนาดไม้ผิด ก็ยังเป็นการตัดสินใจที่แย่อยู่ดี จำกัดหุ้นตัวเดียวไว้ราว 5% ของพอร์ต และใช้เครื่องมือคำนวณขนาดการลงทุนก่อนส่งคำสั่งซื้อทุกครั้ง'},
    sizeBtn:{en:'Open the Position Size tool →', th:'เปิดเครื่องคำนวณขนาดการลงทุน →'},

    glossH:{en:'Want to look up any other term?', th:'อยากดูคำศัพท์ตัวอื่นเพิ่มไหม'},
    glossD:{en:'Every metric on this page — and dozens more — has its own live entry in the glossary, each with a working example you can play with.',
            th:'ทุกตัวเลขในหน้านี้ — และอีกหลายสิบตัว — มีคำอธิบายของตัวเองอยู่ในหน้าคำศัพท์ พร้อมตัวอย่างที่ลองเล่นได้จริง'},
    glossBtn:{en:'Open the glossary →', th:'เปิดหน้าคำศัพท์ →'},

    ctaH:{en:'New to this whole site?', th:'มือใหม่ใช้เว็บนี้เป็นครั้งแรก?'},
    ctaD:{en:'Guided Mode walks you through this whole site in ten steps, in the order that actually works — from knowing your own risk tolerance to sizing your first position.',
          th:'โหมดแนะนำจะพาคุณไปทีละขั้นทั่วทั้งเว็บ สิบขั้นตอน เรียงลำดับที่ใช้ได้จริง — ตั้งแต่รู้จักความเสี่ยงของตัวเองไปจนถึงคำนวณขนาดไม้แรก'},
    ctaBtn:{en:'Turn on Guided Mode →', th:'เปิดโหมดแนะนำ →'}
  };

  function build(){
    var sec = el('section');
    sec.id = 'basics';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-b="eb"></span></div>' +
        '<h2 data-b="h2"></h2><p class="lede" data-b="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-b="genH"></div>' +
      '<div class="bsc-list" data-b="list"></div>' +
      '<div class="v8-sub" data-b="sizeH"></div>' +
      '<div class="bsc-cta" data-b="size"></div>' +
      '<div class="bsc-cta" data-b="gloss"></div>' +
      '<div class="bsc-cta" data-b="cta"></div>';
    return sec;
  }

  var sec;
  function paint(){
    if(!sec) return;
    function q(k){ return sec.querySelector('[data-b="' + k + '"]'); }
    q('eb').textContent = T(BK.eb);
    q('h2').textContent = T(BK.h2);
    q('lede').textContent = T(BK.lede);
    q('genH').textContent = T(BK.genH);
    q('sizeH').textContent = T(BK.sizeH);

    var list = q('list');
    list.innerHTML = '';
    for(var i = 0; i < BK.items.length; i++){
      var it = BK.items[i];
      var c = el('div', 'gm-c',
        '<div class="gm-hd">' +
          '<span class="gm-num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="gm-ic">' + it.ic + '</span>' +
          '<span class="gm-t">' + esc(T(it.t)) + '</span>' +
        '</div>' +
        '<div class="bsc-viz">' + it.viz() + '</div>' +
        '<div class="gm-bd">' +
          '<div class="gm-f"><div class="gm-fh">' + esc(T(BK.labWhat)) + '</div><div class="gm-fd">' + esc(T(it.what)) + '</div></div>' +
          '<div class="gm-f"><div class="gm-fh">' + esc(T(BK.labWhy)) + '</div><div class="gm-fd">' + esc(T(it.why)) + '</div></div>' +
          '<div class="gm-f"><div class="gm-fh">' + esc(T(BK.labHow)) + '</div><div class="gm-fd">' + esc(T(it.how)) + '</div></div>' +
          '<div class="gm-f tip"><div class="gm-fh">' + esc(T(BK.labMis)) + '</div><div class="gm-fd">' + esc(T(it.mistake)) + '</div></div>' +
        '</div>');
      list.appendChild(c);
    }

    q('size').innerHTML =
      '<div class="bsc-cta-h">' + esc(T(BK.sizeH)) + '</div>' +
      '<p class="bsc-cta-d">' + esc(T(BK.sizeD)) + '</p>' +
      '<div class="bsc-cta-b"><a href="#sizing" class="btn btn-primary">' + esc(T(BK.sizeBtn)) + '</a></div>';

    q('gloss').innerHTML =
      '<div class="bsc-cta-h">' + esc(T(BK.glossH)) + '</div>' +
      '<p class="bsc-cta-d">' + esc(T(BK.glossD)) + '</p>' +
      '<div class="bsc-cta-b"><a href="#glossary" class="btn btn-outline">' + esc(T(BK.glossBtn)) + '</a></div>';

    q('cta').innerHTML =
      '<div class="bsc-cta-h">' + esc(T(BK.ctaH)) + '</div>' +
      '<p class="bsc-cta-d">' + esc(T(BK.ctaD)) + '</p>' +
      '<div class="bsc-cta-b"><a href="#guided" class="btn btn-primary">' + esc(T(BK.ctaBtn)) + '</a></div>';
  }

  function boot(){
    if(document.getElementById('basics')) return;
    sec = build();
    sec.setAttribute('data-route', 'basics');
    var anchor = document.getElementById('signals') || document.getElementById('glossary');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    else document.body.appendChild(sec);

    if(window.__spzAddRoute){
      window.__spzAddRoute({
        id:'basics', after:'signals', group:'learn',
        t:{en:'Before You Invest — Checklist', th:'ก่อนลงทุน — เช็คลิสต์'},
        d:{en:'Five things every beginner should understand before buying any stock, explained start to finish on one page.',
           th:'ห้าเรื่องที่มือใหม่ควรเข้าใจก่อนซื้อหุ้นตัวไหนก็ตาม อธิบายครบจบในหน้าเดียว'}
      });
    }
    paint();
    new MutationObserver(function(){ try { paint(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 700); });
  else setTimeout(boot, 700);
})();
