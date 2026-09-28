
(function(){
  'use strict';
  if (window.__SPZ_MEMBERSHIP) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function el(t, c, h){ var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }

  var ICON_FREE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.2-2.4"/></svg>';
  var ICON_MEMBER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>';
  var ICON_ULTRA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>';
  var ICON_OBSIDIAN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4-5h10l4 5-11 13L3 8z"/><path d="M3 8h18"/><path d="M9 3l3 5 3-5"/></svg>';
  var ICON_ACADEMY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/><path d="M22 8v6"/></svg>';
  var ICON_CRYPTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.3c0-1.1.9-1.8 2.5-1.8s2.5.7 2.5 1.7c0 2.3-5 1-5 3.3 0 1 .9 1.7 2.5 1.7s2.5-.6 2.5-1.7"/><path d="M12 6.3v1.2M12 16.5v1.2"/></svg>';
  var ICON_STOCKS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V11"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M20 20v-4"/></svg>';

  var DEV_IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';
  var DEV_FB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 8.5H17V5h-2.5C11.6 5 10 6.6 10 9.2V11H8v3.5h2V21h3.5v-6.5H16l.6-3.5h-3.1V9.4c0-.6.3-.9 1-.9z"/></svg>';
  var DEV_BIO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M9.5 14.5l5-5"/><path d="M8.2 16a3.6 3.6 0 0 1 0-5.1l2-2a3.6 3.6 0 0 1 5.1 0"/><path d="M15.8 8a3.6 3.6 0 0 1 0 5.1l-2 2a3.6 3.6 0 0 1-5.1 0"/></svg>';

  var COPY = {
    eyebrow:{en:'Membership',th:'สมัครสมาชิก'},
    demo:{en:'Demo — this page is still being tested',th:'เดโม — หน้านี้ยังอยู่ในช่วงทดสอบ'},
    h:{en:'Choose the plan that fits how you use this terminal',th:'เลือกแพ็กเกจที่ใช่กับวิธีที่คุณใช้เว็บนี้'},
    lede:{en:'Everything below already exists on the site — this page previews what each tier will unlock. Paid tiers are not open for sign-ups yet, so explore the Free tier while the rest is being finished.',
          th:'ทุกอย่างด้านล่างมีอยู่จริงในเว็บนี้แล้ว หน้านี้แค่พรีวิวว่าแต่ละแพ็กจะปลดล็อกอะไรบ้าง แพ็กเสียเงินยังไม่เปิดรับสมัครจริง ลองใช้แพ็กฟรีไปก่อนระหว่างที่กำลังพัฒนาส่วนที่เหลือ'},
    cmpH:{en:'Every tier, side by side',th:'เทียบทุกแพ็กในตารางเดียว'},
    cmpL:{en:'The exact same lock the rest of the site uses — nothing here is a separate system.',
          th:'ใช้ระบบล็อกเดียวกับที่เว็บใช้อยู่จริง ไม่ใช่ระบบแยกต่างหาก'},
    foot:{en:'This page is a preview and prices may change before paid tiers open. The Ultra check-in is a personal read of the market from the site’s own analyst — education and opinion, never investment advice.',
          th:'หน้านี้เป็นเวอร์ชันพรีวิว และราคาอาจเปลี่ยนแปลงก่อนเปิดรับสมัครแพ็กเสียเงินจริง ส่วนการเช็คอินของแพ็ก Ultra คือมุมมองส่วนตัวของนักวิเคราะห์เว็บนี้ เพื่อการศึกษาและความเห็นส่วนตัวเท่านั้น ไม่ใช่คำแนะนำการลงทุน'},
    testing:{en:'Coming soon — in testing',th:'เร็วๆ นี้ — อยู่ในช่วงทดสอบ'},
    testingNote:{en:'Not open for sign-ups yet. Try the Free tier in the meantime.',th:'ยังไม่เปิดรับสมัครจริง ลองใช้แพ็กฟรีไปพลางๆ ก่อนได้เลย'},
    exploreFree:{en:'Explore for free',th:'สำรวจแบบฟรี'},
    perMo:{en:'/ month',th:'/เดือน'},
    oneTime:{en:'one-time',th:'จ่ายครั้งเดียว'},
    free:{en:'Free',th:'ฟรี'},
    courseDivider:{en:'Courses — one-time',th:'คอร์สเรียน — จ่ายครั้งเดียว'}
  };

  var STATS = [
    { n:19, s:{en:'live markets tracked on the Flow Map',th:'ตลาด/สกุลเงินที่ติดตามสดในแผนที่กระแสเงินทุน'} },
    { n:11, s:{en:'early-warning gauges on the Turning-Point Radar',th:'ตัวชี้วัดเตือนล่วงหน้าในเรดาร์เปลี่ยนทิศ'} },
    { n:16, s:{en:'advanced tool pages across Member + Pass',th:'หน้าเครื่องมือขั้นสูงรวมเมมเบอร์และพาส'} }
  ];

  var TIERS = [
    { id:'free', theme:'plain', icon:ICON_FREE,
      name:{en:'Free',th:'ฟรี'}, price:0,
      tag:{en:'Start reading the market today — no card, no code.',
           th:'เริ่มอ่านตลาดได้เลยวันนี้ ไม่ต้องใช้บัตร ไม่ต้องมีรหัส'},
      perks:[
        {en:'Full learning library — guided tour, glossary, signal types',th:'คลังบทเรียนครบ — ทัวร์แนะนำ คำศัพท์ ประเภทสัญญาณ'},
        {en:'Today + Outlook, updated live',th:'วันนี้ตลาดเป็นไง + แนวโน้ม อัปเดตสด'},
        {en:'Capital Flow map — where the money is moving',th:'แผนที่กระแสเงินทุน — เงินกำลังไหลไปทางไหน'},
        {en:'Inflation & Currency Desk',th:'โต๊ะเงินเฟ้อและค่าเงิน'}
      ],
      ctaRoute:'guided'
    },
    { id:'member', theme:'silver', icon:ICON_MEMBER, days:30,
      name:{en:'Member',th:'เมมเบอร์'}, price:300,
      tag:{en:'For traders who want single-stock tools and the early-warning radar.',
           th:'สำหรับคนที่อยากได้เครื่องมือดูหุ้นรายตัวและเรดาร์เตือนล่วงหน้า'},
      perks:[
        {en:'Everything in Free',th:'ทุกอย่างในแพ็กฟรี'},
        {en:'Stock pages, Watchlist, Bubble map, Chart Lab',th:'หน้าหุ้นรายตัว, Watchlist, Bubble map, Chart Lab'},
        {en:'Stock directory across every market',th:'สารบัญหุ้นครบทุกตลาด'},
        {en:'Turning-Point Radar — 11 early-warning gauges',th:'เรดาร์เปลี่ยนทิศ — 11 ตัวชี้วัดเตือนล่วงหน้า'}
      ]
    },
    { id:'pass', theme:'bronze', icon:ICON_ULTRA, days:30,
      name:{en:'Pass',th:'พาส'}, price:699,
      tag:{en:'The full workbench — every scanner, map and lab on the terminal.',
           th:'ครบทุกเครื่องมือขั้นสูง — สแกนเนอร์ แผนที่ และห้องทดลองทุกตัว'},
      perks:[
        {en:'Everything in Member',th:'ทุกอย่างในแพ็กเมมเบอร์'},
        {en:'Global Money Map — live cross-border flow arcs',th:'แผนที่เงินทุนโลกแบบสด — เส้นกระแสเงินข้ามประเทศ'},
        {en:'Pro Scanner, Proof Lab, Anomaly, Correlation, Rule Lab',th:'Pro Scanner, Proof Lab, จุดผิดปกติ, สหสัมพันธ์, Rule Lab'},
        {en:'Daily Brief, Scenario planner, advanced Inflation Desk',th:'สรุปรายวัน, ฉากทัศน์, โต๊ะเงินเฟ้อขั้นสูง'}
      ]
    },
    { id:'ultra', theme:'red', icon:ICON_OBSIDIAN, days:30,
      name:{en:'Ultra',th:'อัลตร้า'}, price:899,
      tag:{en:'Everything in Pass, plus my own daily read of the market.',
           th:'ทุกอย่างในพาส บวกมุมมองวิเคราะห์ส่วนตัวของผมทุกวัน'},
      perks:[
        {en:'Everything in Pass — the entire terminal',th:'ทุกอย่างในพาส — ทั้งเว็บครบ'},
        {en:'My personal daily market check-in (gold, crypto, index)',th:'เช็คอินวิเคราะห์ส่วนตัวจากผมทุกวัน (ทอง คริปโต ดัชนี)'},
        {en:'First look at new tools before anyone else',th:'ได้ลองเครื่องมือใหม่ก่อนใคร'},
        {en:'Priority DM about your own positions',th:'ทักถามเรื่องพอร์ตของคุณโดยตรง ได้คิวก่อน'}
      ]
    },
    { id:'cryptolab', theme:'gold', icon:ICON_CRYPTO, oneTime:true, days:90,
      name:{en:'Crypto Lab',th:'Crypto Lab'}, price:10990,
      tag:{en:'A focused course on crypto — fundamentals plus how to actually use it safely, with full terminal access while you learn.',
           th:'คอร์สคริปโตแบบเจาะลึก ทั้งพื้นฐานและวิธีใช้งานจริงอย่างปลอดภัย พร้อมใช้เว็บได้เต็มรูปแบบตลอดคอร์ส'},
      perks:[
        {en:'Everything in Ultra — included through the course',th:'ทุกอย่างในอัลตร้า — ใช้ได้ตลอดคอร์ส'},
        {en:'Crypto fundamentals: blockchain, wallets, exchanges, security',th:'พื้นฐานคริปโต: บล็อกเชน กระเป๋าเงิน เอ็กซ์เชนจ์ ความปลอดภัย'},
        {en:'Hands-on: buying, sending & receiving coins step by step',th:'ลงมือจริง: ซื้อ โอน และรับเหรียญทีละขั้นตอน'},
        {en:'One-time payment — not a monthly subscription',th:'จ่ายครั้งเดียว ไม่ใช่ค่าสมาชิกรายเดือน'}
      ]
    },
    { id:'stocklab', theme:'purple', icon:ICON_STOCKS, oneTime:true, days:90,
      name:{en:'Stock Lab',th:'Stock Lab'}, price:20000,
      tag:{en:'Learn to read financial statements and analyze stocks using the exact tools on this terminal, with full site access while you learn.',
           th:'เรียนอ่านงบการเงินและวิเคราะห์หุ้น โดยใช้เครื่องมือชุดเดียวกับที่มีอยู่ในเว็บนี้จริง พร้อมใช้เว็บได้เต็มรูปแบบตลอดคอร์ส'},
      perks:[
        {en:'Everything in Ultra — included through the course',th:'ทุกอย่างในอัลตร้า — ใช้ได้ตลอดคอร์ส'},
        {en:'How to read financial statements & key ratios',th:'วิธีอ่านงบการเงินและอัตราส่วนสำคัญ'},
        {en:'Applying it directly inside this terminal\'s own tools',th:'ลงมือใช้เครื่องมือในเว็บนี้จริงประกอบการวิเคราะห์'},
        {en:'One-time payment — not a monthly subscription',th:'จ่ายครั้งเดียว ไม่ใช่ค่าสมาชิกรายเดือน'}
      ]
    },
    { id:'academy', theme:'black', top:true, icon:ICON_ACADEMY, oneTime:true, days:120,
      name:{en:'Wave Academy',th:'เวฟ อคาเดมี'}, price:34999,
      tag:{en:'A 12-week live Elliott Wave course, zero to advanced — plus everything else on the terminal.',
           th:'คอร์สเรียน Elliott Wave สด 12 สัปดาห์ ตั้งแต่ศูนย์ถึงขั้นสูง พร้อมทุกอย่างในเว็บ'},
      perks:[
        {en:'Everything in Ultra — the entire terminal',th:'ทุกอย่างในอัลตร้า — ทั้งเว็บครบ'},
        {en:'Live course every Saturday for 12 weeks, beginner to advanced',th:'เรียนสดทุกวันเสาร์ 12 สัปดาห์ ตั้งแต่มือใหม่ถึงขั้นสูง'},
        {en:'Full terminal access included through the course, plus a bonus month after',th:'ใช้เว็บได้ฟรีเต็มรูปแบบตลอดคอร์ส แถมอีก 1 เดือนหลังจบ'},
        {en:'One-time payment — not a monthly subscription',th:'จ่ายครั้งเดียว ไม่ใช่ค่าสมาชิกรายเดือน'}
      ]
    }
  ];

  /* Exposed read-only so the Connected Users admin page can offer "pick a
     package" (name + price + days + short description) instead of the
     admin having to remember what each tier means and how many days it
     should grant -- single source of truth, same list the public pricing
     page above renders from. The `days` field only exists for this reuse;
     it isn't shown on the public cards. */
  window.__SPZ_MEMBERSHIP_TIERS = TIERS;

  var ROWS = [
    { f:{en:'Learning library, guided tour, glossary',th:'คลังบทเรียน, ทัวร์แนะนำ, คำศัพท์'}, v:[1,1,1,1,1,1,1] },
    { f:{en:'Today + Outlook',th:'วันนี้ตลาดเป็นไง + แนวโน้ม'}, v:[1,1,1,1,1,1,1] },
    { f:{en:'Capital Flow map',th:'แผนที่กระแสเงินทุน'}, v:[1,1,1,1,1,1,1] },
    { f:{en:'Inflation & Currency Desk',th:'โต๊ะเงินเฟ้อและค่าเงิน'}, v:[1,1,1,1,1,1,1] },
    { f:{en:'Stock pages, Watchlist, Bubble map, Chart Lab, Directory',th:'หน้าหุ้น, Watchlist, Bubble map, Chart Lab, สารบัญหุ้น'}, v:[0,1,1,1,1,1,1] },
    { f:{en:'Turning-Point Radar (11 gauges)',th:'เรดาร์เปลี่ยนทิศ (11 ตัวชี้วัด)'}, v:[0,1,1,1,1,1,1] },
    { f:{en:'Global Money Map — live flow arcs',th:'แผนที่เงินทุนโลกแบบสด'}, v:[0,0,1,1,1,1,1] },
    { f:{en:'Pro Scanner, Proof Lab, Anomaly, Correlation, Rule Lab, Daily Brief, Scenarios, Advanced Inflation Desk',
         th:'Pro Scanner, Proof Lab, จุดผิดปกติ, สหสัมพันธ์, Rule Lab, สรุปรายวัน, ฉากทัศน์, โต๊ะเงินเฟ้อขั้นสูง'}, v:[0,0,1,1,1,1,1] },
    { f:{en:'My personal daily market check-in',th:'เช็คอินวิเคราะห์ส่วนตัวจากผมทุกวัน'}, v:[0,0,0,1,1,1,1] },
    { f:{en:'Crypto Lab course — wallets, blockchain, hands-on trading',th:'คอร์ส Crypto Lab — กระเป๋าเงิน บล็อกเชน ลงมือเทรดจริง'}, v:[0,0,0,0,1,0,0] },
    { f:{en:'Stock Lab course — reading financial statements & ratios',th:'คอร์ส Stock Lab — อ่านงบการเงินและอัตราส่วนสำคัญ'}, v:[0,0,0,0,0,1,0] },
    { f:{en:'Live 12-week Elliott Wave course',th:'คอร์สเรียน Elliott Wave สด 12 สัปดาห์'}, v:[0,0,0,0,0,0,1] }
  ];

  var CONTACT = [
    { cls:'ig', href:'https://www.instagram.com/spczterminal', icon:DEV_IG_ICON, label:'Instagram' },
    { cls:'fb', href:'https://www.facebook.com/share/1GBykHfZ1V/?mibextid=wwXIfr', icon:DEV_FB_ICON, label:'Facebook' },
    { cls:'bio', href:'https://linkbio.co/6120202qnLaXl', icon:DEV_BIO_ICON, labelKey:'bio' }
  ];

  function fmtPrice(n){
    return n.toLocaleString('en-US');
  }

  function priceHTML(tier){
    if (tier.price === 0){
      return '<span class="mem-p-num">' + esc(tx(COPY.free)) + '</span>';
    }
    var per = tier.oneTime ? tx(COPY.oneTime) : tx(COPY.perMo);
    return '<span class="mem-p-num">฿' + fmtPrice(tier.price) + '</span><span class="mem-p-per">' + esc(per) + '</span>';
  }

  function contactHTML(){
    var th = L() === 'th';
    var out = '';
    for (var i = 0; i < CONTACT.length; i++){
      var c = CONTACT[i];
      var label = c.labelKey === 'bio' ? (th ? 'ลิงก์ทั้งหมด' : 'All Links') : c.label;
      out += '<a class="mem-c-btn ' + c.cls + '" href="' + c.href + '" target="_blank" rel="noopener noreferrer">' +
        c.icon + '<span>' + esc(label) + '</span></a>';
    }
    return out;
  }

  function cardHTML(tier, idx){
    var th = L() === 'th';
    var perksHTML = '';
    for (var i = 0; i < tier.perks.length; i++) perksHTML += '<li>' + esc(tx(tier.perks[i])) + '</li>';

    var ctaHTML;
    if (tier.ctaRoute){
      ctaHTML = '<a class="mem-cta-btn" href="#/' + tier.ctaRoute + '">' + esc(tx(COPY.exploreFree)) + '</a>';
    } else {
      /* paid tiers aren't open for sign-ups yet -- a testing badge and a
         nudge back to the Free tier instead of a "message us" CTA */
      ctaHTML = '<div class="mem-testing">' +
        '<span class="mem-testing-badge">🧪 ' + esc(tx(COPY.testing)) + '</span>' +
        '<p class="mem-testing-note">' + esc(tx(COPY.testingNote)) + '</p>' +
        '<a class="mem-cta-btn mem-cta-ghost" href="#/guided">' + esc(tx(COPY.exploreFree)) + '</a>' +
      '</div>';
    }

    return '<div class="mem-card mem-' + tier.theme + (tier.top ? ' mem-top' : '') + ' reveal" style="transition-delay:' + (idx * 70) + 'ms">' +
      (tier.theme === 'black' ? '<span class="mem-flagship">' + esc(th ? 'เด่นสุด' : 'Flagship') + '</span><span class="mem-grid"></span><span class="mem-stars"></span><span class="mem-wave"></span><span class="mem-sweep"></span><span class="mem-sweep2"></span>' :
       (tier.theme === 'gold' || tier.theme === 'red' || tier.theme === 'purple' || tier.theme === 'cyan' || tier.theme === 'emerald' || tier.theme === 'silver' || tier.theme === 'bronze') ? '<span class="mem-sweep"></span><span class="mem-sweep2"></span>' : '') +
      '<div class="mem-icon">' + tier.icon + '</div>' +
      '<div class="mem-name">' + esc(tx(tier.name)) + '</div>' +
      '<div class="mem-price">' + priceHTML(tier) + '</div>' +
      '<p class="mem-tag">' + esc(tx(tier.tag)) + '</p>' +
      '<ul class="mem-perks">' + perksHTML + '</ul>' +
      '<div class="mem-cta">' + ctaHTML + '</div>' +
    '</div>';
  }

  function tableHTML(){
    var head = '<tr><th></th>';
    for (var i = 0; i < TIERS.length; i++){
      var t = TIERS[i];
      var thCls = t.theme === 'plain' ? '' : ' class="mem-col-' + t.theme + '"';
      head += '<th' + thCls + '><span class="mem-th-name">' + esc(tx(t.name)) + '</span>' +
        '<span class="mem-th-price">' + (t.price === 0 ? esc(tx(COPY.free)) : ('฿' + fmtPrice(t.price))) + '</span></th>';
    }
    head += '</tr>';

    var body = '';
    for (var r = 0; r < ROWS.length; r++){
      var row = ROWS[r];
      body += '<tr><td>' + esc(tx(row.f)) + '</td>';
      for (var c = 0; c < row.v.length; c++){
        var colTheme = TIERS[c].theme;
        var cls = colTheme === 'plain' ? '' : ' class="mem-col-' + colTheme + '"';
        body += '<td' + cls + '>' + (row.v[c] ? '<span class="mem-yes">✓</span>' : '<span class="mem-no">—</span>') + '</td>';
      }
      body += '</tr>';
    }
    return '<thead>' + head + '</thead><tbody>' + body + '</tbody>';
  }

  var sec, statsAnimated = false;

  function animateStats(host){
    if (statsAnimated) return;
    statsAnimated = true;
    var nodes = host.querySelectorAll('.mem-stat-n');
    for (var i = 0; i < nodes.length; i++){
      (function(node, target){
        var t0 = null;
        function step(ts){
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 900);
          var eased = 1 - Math.pow(1 - p, 3);
          node.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
          else node.textContent = target;
        }
        requestAnimationFrame(step);
      })(nodes[i], parseInt(nodes[i].getAttribute('data-target'), 10));
    }
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-mem="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(COPY.eyebrow);
    if (q('demoText')) q('demoText').textContent = tx(COPY.demo);
    if (q('h')) q('h').textContent = tx(COPY.h);
    if (q('lede')) q('lede').textContent = tx(COPY.lede);
    if (q('cmpH')) q('cmpH').textContent = tx(COPY.cmpH);
    if (q('cmpL')) q('cmpL').textContent = tx(COPY.cmpL);
    if (q('foot')) q('foot').textContent = tx(COPY.foot);

    var statsHost = q('stats');
    if (statsHost){
      var sHtml = '';
      for (var i = 0; i < STATS.length; i++){
        sHtml += '<div class="mem-stat reveal in-view" style="transition-delay:' + (i * 90) + 'ms">' +
          '<div class="mem-stat-n" data-target="' + STATS[i].n + '">0</div>' +
          '<div class="mem-stat-l">' + esc(tx(STATS[i].s)) + '</div></div>';
      }
      statsHost.innerHTML = sHtml;
      setTimeout(function(){ animateStats(statsHost); }, 200);
    }

    var cardsHostA = q('cardsA');
    var cardsHostB = q('cardsB');
    if (cardsHostA && cardsHostB){
      var cHtmlA = '', cHtmlB = '';
      for (var j = 0; j < TIERS.length; j++){
        if (j < 4) cHtmlA += cardHTML(TIERS[j], j);
        else cHtmlB += cardHTML(TIERS[j], j);
      }
      cardsHostA.innerHTML = cHtmlA;
      cardsHostB.innerHTML = cHtmlB;
    }
    var courseLabelHost = q('courseLabel');
    if (courseLabelHost) courseLabelHost.textContent = tx(COPY.courseDivider);

    var tableHost = q('table');
    if (tableHost) tableHost.innerHTML = tableHTML();

    var rv = sec.querySelectorAll('.reveal');
    for (var k = 0; k < rv.length; k++) rv[k].classList.add('in-view');
  }

  function build(){
    if (document.getElementById('membership')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'membership';
    sec.setAttribute('data-route', 'membership');
    sec.innerHTML =
      '<div class="mem-wrap">' +
        '<div class="mem-demo-banner reveal in-view"><span class="mem-demo-dot"></span><span data-mem="demoText"></span></div>' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-mem="eb"></span></div>' +
          '<h2 data-mem="h"></h2>' +
          '<p class="lede" data-mem="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div class="mem-stats" data-mem="stats"></div>' +
        '<div class="mem-cards mem-cards-a" data-mem="cardsA"></div>' +
        '<div class="mem-course-divider reveal in-view"><span class="mem-course-line"></span><span class="mem-course-label" data-mem="courseLabel"></span><span class="mem-course-line"></span></div>' +
        '<div class="mem-cards mem-cards-b" data-mem="cardsB"></div>' +
        '<div class="mem-table-head">' +
          '<h3 data-mem="cmpH"></h3>' +
          '<p data-mem="cmpL"></p>' +
        '</div>' +
        '<div class="mem-table-scroll"><table class="mem-table" data-mem="table"></table></div>' +
        '<p class="mem-foot" data-mem="foot"></p>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'membership', after:'home',
      t:{en:'Membership — Plans & Perks',th:'สมัครสมาชิก — แพ็กเกจและสิทธิพิเศษ'},
      d:{en:'Compare what Free, Member, Pass, Ultra, Crypto Lab, Stock Lab and Wave Academy unlock, and how to join.',
         th:'เปรียบเทียบสิทธิ์ของฟรี เมมเบอร์ พาส อัลตร้า Crypto Lab, Stock Lab และ Wave Academy พร้อมวิธีสมัคร'}
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

  window.__SPZ_MEMBERSHIP = { repaint: paint };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 900); });
  } else {
    setTimeout(boot, 900);
  }
})();
