
/* ============================================================================
   SPACEZ TERMINAL — ROUND R: BEGINNER CHECKLIST
   "What To Check Before You Invest" -- the 6th item in the Learn nav group.
   Static bilingual content, but every check links straight into the live
   glossary entry for that metric (via window.__spzGlossJump, exposed by
   part-14.js's master-detail glossary), plus a CTA into Guided Mode and the
   full glossary. Entirely self-contained, same pattern as part-23.js.
   ========================================================================= */
(function(){
  'use strict';

  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var BK = {
    eb:{en:'06 · Before You Buy', th:'06 · ก่อนซื้อหุ้น'},
    h2:{en:'What To Check Before You Invest', th:'ก่อนลงทุน ต้องเช็คอะไรบ้าง'},
    lede:{en:'A short, practical checklist for a first-time buyer — five things to understand about any stock before you buy it, and exactly where to check each one on this site.',
          th:'เช็คลิสต์สั้นๆ ที่ใช้ได้จริงสำหรับมือใหม่ — ห้าเรื่องที่ต้องเข้าใจก่อนซื้อหุ้นตัวไหนก็ตาม พร้อมบอกว่าเช็คแต่ละอย่างได้ที่ไหนในเว็บนี้'},

    genH:{en:'General — what every beginner should understand', th:'ทั่วไป — มือใหม่ควรเข้าใจอะไรบ้าง'},

    items:[
      {ic:'💰', m:'pe',
       t:{en:'Is the price already expensive for what it earns?', th:'ราคาแพงเกินกำไรที่มันทำได้หรือยัง'},
       d:{en:'P/E compares price to annual profit. A high P/E can mean the market expects fast growth — or that it is simply overpriced. Never judge P/E alone; compare it against the company’s own history and its sector.',
          th:'P/E คือราคาต่อกำไรต่อปี P/E สูงอาจแปลว่าตลาดคาดหวังการเติบโตเร็ว หรืออาจแปลว่าแพงเกินจริงก็ได้ อย่าตัดสินจาก P/E ตัวเดียว ให้เทียบกับสถิติของบริษัทเองและกับกลุ่มอุตสาหกรรมเดียวกันด้วย'}},
      {ic:'🏦', m:'de',
       t:{en:'How much debt is it carrying?', th:'มันมีหนี้มากแค่ไหน'},
       d:{en:'D/E (debt-to-equity) shows how much of the business is funded by borrowing rather than its own capital. Higher debt means higher risk when rates rise or earnings dip.',
          th:'D/E (หนี้สินต่อทุน) บอกว่าธุรกิจใช้เงินกู้มากแค่ไหนเทียบกับทุนตัวเอง หนี้ยิ่งสูง ความเสี่ยงยิ่งมากเวลาดอกเบี้ยขึ้นหรือกำไรลด'}},
      {ic:'📈', m:'roe',
       t:{en:'How efficiently does it turn capital into profit?', th:'มันเปลี่ยนทุนเป็นกำไรได้มีประสิทธิภาพแค่ไหน'},
       d:{en:'ROE (return on equity) and margin show whether management is actually good at the business, not just growing revenue for its own sake.',
          th:'ROE (ผลตอบแทนต่อทุน) และมาร์จิ้น บอกว่าผู้บริหารเก่งเรื่องธุรกิจจริงไหม ไม่ใช่แค่โตยอดขายไปเรื่อยๆ'}},
      {ic:'💵', m:'divyld',
       t:{en:'If it pays a dividend — is that dividend actually safe?', th:'ถ้ามันจ่ายปันผล ปันผลนั้นปลอดภัยจริงไหม'},
       d:{en:'Dividend yield is the cash return on your price today. But check the payout ratio next — the share of profit being paid out. Above roughly 80-100% for several years running is a warning sign the dividend may get cut. Also check payout frequency (quarterly vs. once a year), since it changes how you plan your own cash flow.',
          th:'อัตราปันผล (dividend yield) คือผลตอบแทนเงินสดเทียบกับราคาที่ซื้อวันนี้ แต่ต้องเช็คอัตราการจ่ายปันผล (payout ratio) ต่อด้วย — สัดส่วนกำไรที่จ่ายออกมา ถ้าสูงเกิน 80-100% ติดต่อกันหลายปี เป็นสัญญาณเตือนว่าปันผลอาจถูกลดในอนาคต และควรเช็ครอบการจ่ายปันผล (payout frequency) ด้วยว่าจ่ายรายไตรมาสหรือปีละครั้ง เพราะมีผลต่อการวางแผนกระแสเงินสดของคุณเอง'}},
      {ic:'⚖️', m:'pb',
       t:{en:'What is it worth if everything went wrong tomorrow?', th:'ถ้าพรุ่งนี้ทุกอย่างพังหมด มันยังเหลือมูลค่าเท่าไหร่'},
       d:{en:'P/B compares price to the accounting value of the company’s assets. It matters most for banks, holding companies and asset-heavy businesses — less for asset-light tech or services names.',
          th:'P/B เทียบราคาหุ้นกับมูลค่าทางบัญชีของสินทรัพย์บริษัท มีความหมายมากกับกลุ่มธนาคาร โฮลดิ้ง หรือธุรกิจที่ใช้สินทรัพย์เยอะ แต่มีความหมายน้อยกับหุ้นเทคหรือบริการที่ใช้สินทรัพย์น้อย'}}
    ],

    sizeH:{en:'Before any of the above — decide your position size', th:'ก่อนดูเรื่องข้างบนทั้งหมด — ตัดสินใจขนาดไม้ก่อน'},
    sizeD:{en:'A great company at the wrong size is still a bad decision. Cap any single name near 5% of the portfolio and use the Position Size tool below before you place a single order.',
           th:'บริษัทดีแค่ไหน ถ้าลงขนาดไม้ผิด ก็ยังเป็นการตัดสินใจที่แย่อยู่ดี จำกัดหุ้นตัวเดียวไว้ราว 5% ของพอร์ต และใช้เครื่องมือคำนวณขนาดการลงทุนด้านล่างก่อนส่งคำสั่งซื้อทุกครั้ง'},
    sizeBtn:{en:'Open Position Size tool', th:'เปิดเครื่องคำนวณขนาดการลงทุน'},

    ctaH:{en:'Don’t want to do this alone?', th:'ไม่อยากทำคนเดียว?'},
    ctaD:{en:'Guided Mode walks you through this whole site in ten steps, in the order that actually works — from knowing your own risk tolerance to sizing your first position.',
          th:'โหมดแนะนำจะพาคุณไปทีละขั้นทั่วทั้งเว็บ สิบขั้นตอน เรียงลำดับที่ใช้ได้จริง — ตั้งแต่รู้จักความเสี่ยงของตัวเองไปจนถึงคำนวณขนาดไม้แรก'},
    ctaBtn:{en:'Turn on Guided Mode →', th:'เปิดโหมดแนะนำ →'},
    glossBtn:{en:'Or browse the full glossary →', th:'หรือดูคำศัพท์ทั้งหมด →'},

    checkBtn:{en:'Check it →', th:'เช็คตรงนี้ →'}
  };

  /* Jump into the glossary's live master-detail view and select the matching
     term. part-14.js exposes window.__spzGlossJump for exactly this. Falls
     back to a no-op scroll if the glossary hasn't booted yet for some reason. */
  function jumpMetric(key){
    location.hash = '#/glossary';
    setTimeout(function(){
      if(window.__spzGlossJump) window.__spzGlossJump(key);
      var d = document.querySelector('.gl-detail');
      if(d) d.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 200);
  }

  function build(){
    var sec = el('section');
    sec.id = 'basics';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-b="eb"></span></div>' +
        '<h2 data-b="h2"></h2><p class="lede" data-b="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="v8-sub" data-b="genH"></div>' +
      '<div class="res-grid" data-b="grid"></div>' +
      '<div class="v8-sub" data-b="sizeH"></div>' +
      '<div class="v8-note" data-b="size"></div>' +
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

    var grid = q('grid');
    grid.innerHTML = '';
    for(var i = 0; i < BK.items.length; i++){
      (function(it){
        var c = el('div', 'res-card bsc-card',
          '<div class="bsc-ic">' + it.ic + '</div>' +
          '<div class="bsc-t">' + esc(T(it.t)) + '</div>' +
          '<p class="bsc-d">' + esc(T(it.d)) + '</p>' +
          '<button type="button" class="bsc-chk">' + esc(T(BK.checkBtn)) + '</button>');
        c.querySelector('.bsc-chk').addEventListener('click', function(){ jumpMetric(it.m); });
        grid.appendChild(c);
      })(BK.items[i]);
    }

    q('size').innerHTML =
      '<p style="margin-bottom:14px"><b>⚠</b> ' + esc(T(BK.sizeD)) + '</p>' +
      '<a href="#sizing" class="btn btn-outline">' + esc(T(BK.sizeBtn)) + '</a>';

    q('cta').innerHTML =
      '<div class="bsc-cta-h">' + esc(T(BK.ctaH)) + '</div>' +
      '<p class="bsc-cta-d">' + esc(T(BK.ctaD)) + '</p>' +
      '<div class="bsc-cta-b">' +
        '<a href="#guided" class="btn btn-primary">' + esc(T(BK.ctaBtn)) + '</a>' +
        '<a href="#glossary" class="btn btn-outline">' + esc(T(BK.glossBtn)) + '</a>' +
      '</div>';
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
        d:{en:'Five things to check on any stock before buying, mapped straight to the metrics this site already tracks.',
           th:'ห้าเรื่องที่ต้องเช็คก่อนซื้อหุ้นตัวไหนก็ตาม เชื่อมตรงกับตัวเลขที่เว็บนี้ติดตามอยู่แล้ว'}
      });
    }
    paint();
    new MutationObserver(function(){ try { paint(); } catch(e){} })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 700); });
  else setTimeout(boot, 700);
})();
