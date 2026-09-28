
(function(){
  'use strict';
  if (window.__SPZ_SCAN) return;

  var TF = [
    { k:'d1',  en:'1 day',   th:'1 วัน' },
    { k:'w1',  en:'1 week',  th:'1 สัปดาห์' },
    { k:'m1',  en:'1 month', th:'1 เดือน' },
    { k:'m3',  en:'3 months',th:'3 เดือน' },
    { k:'ytd', en:'YTD',     th:'ตั้งแต่ต้นปี' }
  ];
  var GROUPS = [
    { k:'sector',  en:'Sectors',        th:'กลุ่มอุตสาหกรรม' },
    { k:'asset',   en:'Asset classes',  th:'ประเภทสินทรัพย์' },
    { k:'country', en:'Countries',      th:'ประเทศ' }
  ];

  var T = {
    en:{
      eyebrow:'LIVE FLOW SCAN',
      title:'Where the money actually went',
      lede:'A read on money flow built from what is publicly measurable: how each ETF moved over the window you pick, and how heavily it traded against its own 20-day average. Green is money arriving, red is money leaving. This is a proxy, not the fund-flow tape.',
      inH:'MONEY ARRIVING', outH:'MONEY LEAVING',
      strongest:'Strongest', weakest:'Weakest', crowd:'volume',
      hot:'heavy', quiet:'light',
      foot:'Proxy built from ETF price and volume (Yahoo Finance), refreshed automatically about every 30 minutes. Real fund-flow data (ICI, EPFR) is subscription-only and is not what these numbers are. Educational use only.',
      updated:'updated', waiting:'Waiting for the first data sync…',
      gTitle:'World money scan',
      gLede:'Every major market ranked by how its country ETF moved over the window — the fastest read available on which way capital leaned.',
      cTitle:'Live currency board',
      cLede:'Spot rate against the US dollar, and how far each currency has moved. A positive number means the currency strengthened against the dollar.',
      cCur:'Currency', cRate:'per USD', cD1:'1 day', cM1:'1 month', cYtd:'YTD',
      cFoot:'Spot rates from Yahoo Finance FX pairs, refreshed automatically about every 30 minutes. Indicative mid-market levels — your bank or broker will quote differently.'
    },
    th:{
      eyebrow:'สแกนกระแสเงินสด',
      title:'เงินไหลไปไหนมาบ้างจริง ๆ',
      lede:'อ่านกระแสเงินจากสิ่งที่วัดได้จริง: ETF แต่ละตัวเคลื่อนไหวเท่าไหร่ในช่วงที่เลือก และซื้อขายหนาแน่นแค่ไหนเทียบค่าเฉลี่ย 20 วันของตัวเอง สีเขียวคือเงินไหลเข้า สีแดงคือเงินไหลออก นี่คือค่าประมาณ ไม่ใช่ข้อมูลกระแสเงินกองทุนจริง',
      inH:'เงินไหลเข้า', outH:'เงินไหลออก',
      strongest:'เข้ามากสุด', weakest:'ออกมากสุด', crowd:'วอลุ่ม',
      hot:'หนาแน่น', quiet:'เบาบาง',
      foot:'ค่าประมาณจากราคาและวอลุ่มของ ETF (Yahoo Finance) อัปเดตอัตโนมัติราวทุก 30 นาที ข้อมูลกระแสเงินกองทุนจริง (ICI, EPFR) ต้องเสียเงินสมัคร และไม่ใช่ตัวเลขชุดนี้ ใช้เพื่อการศึกษาเท่านั้น',
      updated:'อัปเดต', waiting:'กำลังรอข้อมูลรอบแรก…',
      gTitle:'สแกนเงินโลก',
      gLede:'จัดอันดับตลาดหลักทั้งหมดจากการเคลื่อนไหวของ ETF ประเทศนั้นในช่วงที่เลือก — เป็นภาพที่เร็วที่สุดว่าทุนเอนไปทางไหน',
      cTitle:'กระดานค่าเงินสด',
      cLede:'อัตราแลกเปลี่ยนเทียบดอลลาร์สหรัฐฯ และค่าเงินแต่ละสกุลขยับไปเท่าไหร่ ตัวเลขบวกแปลว่าสกุลนั้นแข็งค่าขึ้นเมื่อเทียบกับดอลลาร์',
      cCur:'สกุลเงิน', cRate:'ต่อ 1 USD', cD1:'1 วัน', cM1:'1 เดือน', cYtd:'ตั้งแต่ต้นปี',
      cFoot:'อัตราแลกเปลี่ยนจากคู่เงิน Yahoo Finance อัปเดตอัตโนมัติราวทุก 30 นาที เป็นราคากลางเพื่ออ้างอิง ธนาคารหรือโบรกเกอร์ของคุณจะเสนอราคาต่างจากนี้',
      cFootNote:''
    }
  };

  function L(){
    return (document.documentElement.getAttribute('lang') === 'th') ? 'th' : 'en';
  }
  function t(k){ return (T[L()] || T.en)[k]; }
  function tx(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function sgn(v, d){ return (v >= 0 ? '+' : '') + v.toFixed(d === undefined ? 2 : d) + '%'; }

  /* the freshness tag, borrowed from the live-data module so the whole page
     speaks one language about how current a number is */
  function tag(){
    var T2 = window.__SPZ_TAGS;
    return T2 ? T2.html(snap ? 'auto' : 'stat') : '';
  }

  /* ---------------------------------------------------------------
     state — one selection shared by the flow panel
     --------------------------------------------------------------- */
  var state = { tf:'m1', group:'sector', gTf:'m1' };
  var snap = null;

  function rows(group){
    var f = snap && snap.flows && snap.flows[group];
    return (f && f.length) ? f.slice() : [];
  }

  function fmtTime(iso){
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB',
      { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:false });
  }

  function pills(list, current, attr){
    return list.map(function(o){
      return '<button type="button" class="ss-pill' + (o.k === current ? ' on' : '') +
             '" data-' + attr + '="' + o.k + '">' + esc(tx(o)) + '</button>';
    }).join('');
  }

  function rowHTML(r, key, max, withFlag){
    var v = r[key];
    if (typeof v !== 'number') return '';
    var up = v >= 0;
    var w = max > 0 ? Math.max(2, Math.min(100, Math.abs(v) / max * 100)) : 2;
    var name = (withFlag && r.flag ? r.flag + ' ' : '') + tx(r);
    var meta = '';
    if (typeof r.vol_ratio === 'number') {
      var hot = r.vol_ratio >= 1.3, quiet = r.vol_ratio <= 0.7;
      meta = t('crowd') + ' ×' + r.vol_ratio.toFixed(2) +
             (hot ? ' · <b>' + t('hot') + '</b>' : quiet ? ' · ' + t('quiet') : '');
    }
    return '<div class="ss-row">' +
        '<span class="ss-name">' + esc(name) + '<em>' + esc(r.sym || '') + '</em></span>' +
        '<span class="ss-val ' + (up ? 'up' : 'down') + '">' + sgn(v) + '</span>' +
        '<span class="ss-bar"><i class="' + (up ? 'up' : 'down') + '" style="width:' + w + '%"></i></span>' +
        (meta ? '<span class="ss-meta">' + meta + '</span>' : '') +
      '</div>';
  }

  function twoColumns(list, key, withFlag){
    var have = list.filter(function(r){ return typeof r[key] === 'number'; });
    if (!have.length) return '<div class="ss-empty">' + esc(t('waiting')) + '</div>';
    have.sort(function(a, b){ return b[key] - a[key]; });
    var max = 0;
    have.forEach(function(r){ max = Math.max(max, Math.abs(r[key])); });

    /* a negative number is not "money arriving", so split by sign first and
       only fall back to rank when one side is empty */
    var pos = have.filter(function(r){ return r[key] > 0; });
    var neg = have.filter(function(r){ return r[key] < 0; }).reverse();
    var n = Math.min(7, Math.max(3, Math.ceil(have.length / 2)));
    var top = (pos.length ? pos : have.slice(0, 1)).slice(0, n);
    var bottom = (neg.length ? neg : have.slice(-1)).slice(0, n);

    return '<div class="ss-cols">' +
      '<div><div class="ss-colh"><span class="ss-in">▲ ' + esc(t('inH')) + '</span></div>' +
        top.map(function(r){ return rowHTML(r, key, max, withFlag); }).join('') + '</div>' +
      '<div><div class="ss-colh"><span class="ss-out">▼ ' + esc(t('outH')) + '</span></div>' +
        bottom.map(function(r){ return rowHTML(r, key, max, withFlag); }).join('') + '</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------------
     panel 1 — capital flow page (menu 07)
     --------------------------------------------------------------- */
  function paintFlow(box){
    var list = rows(state.group);
    box.innerHTML =
      '<div class="ss-top"><span class="ss-eyebrow"><span class="ss-live-dot"></span>' +
        esc(t('eyebrow')) + '</span>' + tag() + '</div>' +
      '<h3>' + esc(t('title')) + '</h3>' +
      '<p class="ss-lede">' + esc(t('lede')) + '</p>' +
      '<div class="ss-pill-row" style="margin-bottom:14px;">' +
        '<div class="ss-pills" style="margin:0;">' + pills(GROUPS, state.group, 'grp') + '</div>' +
        '<span class="ss-sep"></span>' +
        '<div class="ss-pills" style="margin:0;">' + pills(TF, state.tf, 'tf') + '</div>' +
      '</div>' +
      twoColumns(list, state.tf, state.group === 'country') +
      '<div class="ss-foot">' + esc(t('foot')) + '<br>' +
        esc(t('updated')) + ' ' + esc(fmtTime(snap && snap.generated_at)) + '</div>';

    box.querySelectorAll('[data-grp]').forEach(function(b){
      b.addEventListener('click', function(){ state.group = b.getAttribute('data-grp'); paintFlow(box); });
    });
    box.querySelectorAll('[data-tf]').forEach(function(b){
      b.addEventListener('click', function(){ state.tf = b.getAttribute('data-tf'); paintFlow(box); });
    });
  }

  /* ---------------------------------------------------------------
     panel 2 — global money map (menu 08)
     --------------------------------------------------------------- */
  function paintGlobe(box){
    var list = rows('country').filter(function(r){ return typeof r[state.gTf] === 'number'; });
    list.sort(function(a, b){ return b[state.gTf] - a[state.gTf]; });
    var best = list[0], worst = list[list.length - 1];

    box.innerHTML =
      '<div class="ss-top"><span class="ss-eyebrow"><span class="ss-live-dot"></span>' +
        esc(t('eyebrow')) + '</span>' + tag() + '</div>' +
      '<h3>' + esc(t('gTitle')) + '</h3>' +
      '<p class="ss-lede">' + esc(t('gLede')) + '</p>' +
      '<div class="ss-pills">' + pills(TF, state.gTf, 'gtf') + '</div>' +
      (best && worst ?
        '<div class="ss-best">' +
          '<div><div class="ss-bl">' + esc(t('strongest')) + '</div><div class="ss-bv">' +
            esc((best.flag || '') + ' ' + tx(best)) + ' <span style="color:var(--neon-2,#7CFFB2)">' +
            sgn(best[state.gTf]) + '</span></div></div>' +
          '<div><div class="ss-bl">' + esc(t('weakest')) + '</div><div class="ss-bv">' +
            esc((worst.flag || '') + ' ' + tx(worst)) + ' <span style="color:var(--red,#ff3b4e)">' +
            sgn(worst[state.gTf]) + '</span></div></div>' +
        '</div>' : '') +
      twoColumns(list, state.gTf, true) +
      '<div class="ss-foot">' + esc(t('foot')) + '<br>' +
        esc(t('updated')) + ' ' + esc(fmtTime(snap && snap.generated_at)) + '</div>';

    box.querySelectorAll('[data-gtf]').forEach(function(b){
      b.addEventListener('click', function(){ state.gTf = b.getAttribute('data-gtf'); paintGlobe(box); });
    });
  }

  /* ---------------------------------------------------------------
     panel 3 — currency board (menu 09)
     --------------------------------------------------------------- */
  var CUR_NAME = {
    USD:{en:'US dollar',th:'ดอลลาร์สหรัฐฯ',f:'🇺🇸'}, EUR:{en:'Euro',th:'ยูโร',f:'🇪🇺'},
    JPY:{en:'Japanese yen',th:'เยนญี่ปุ่น',f:'🇯🇵'}, GBP:{en:'British pound',th:'ปอนด์อังกฤษ',f:'🇬🇧'},
    CHF:{en:'Swiss franc',th:'ฟรังก์สวิส',f:'🇨🇭'}, CAD:{en:'Canadian dollar',th:'ดอลลาร์แคนาดา',f:'🇨🇦'},
    AUD:{en:'Australian dollar',th:'ดอลลาร์ออสเตรเลีย',f:'🇦🇺'}, CNY:{en:'Chinese yuan',th:'หยวนจีน',f:'🇨🇳'},
    KRW:{en:'Korean won',th:'วอนเกาหลี',f:'🇰🇷'}, TWD:{en:'Taiwan dollar',th:'ดอลลาร์ไต้หวัน',f:'🇹🇼'},
    THB:{en:'Thai baht',th:'บาทไทย',f:'🇹🇭'}, SGD:{en:'Singapore dollar',th:'ดอลลาร์สิงคโปร์',f:'🇸🇬'},
    MYR:{en:'Malaysian ringgit',th:'ริงกิตมาเลเซีย',f:'🇲🇾'}, IDR:{en:'Indonesian rupiah',th:'รูเปียห์อินโดนีเซีย',f:'🇮🇩'},
    PHP:{en:'Philippine peso',th:'เปโซฟิลิปปินส์',f:'🇵🇭'}, VND:{en:'Vietnamese dong',th:'ดองเวียดนาม',f:'🇻🇳'},
    INR:{en:'Indian rupee',th:'รูปีอินเดีย',f:'🇮🇳'}, BRL:{en:'Brazilian real',th:'เรียลบราซิล',f:'🇧🇷'},
    MXN:{en:'Mexican peso',th:'เปโซเม็กซิโก',f:'🇲🇽'}, SAR:{en:'Saudi riyal',th:'ริยัลซาอุฯ',f:'🇸🇦'},
    AED:{en:'UAE dirham',th:'ดีแรห์ม UAE',f:'🇦🇪'}, TRY:{en:'Turkish lira',th:'ลีราตุรกี',f:'🇹🇷'},
    ARS:{en:'Argentine peso',th:'เปโซอาร์เจนตินา',f:'🇦🇷'}, HKD:{en:'Hong Kong dollar',th:'ดอลลาร์ฮ่องกง',f:'🇭🇰'}
  };

  function cell(v){
    if (typeof v !== 'number') return '<td style="color:var(--grey-dim)">—</td>';
    return '<td style="color:' + (v >= 0 ? 'var(--neon-2,#7CFFB2)' : 'var(--red,#ff3b4e)') + '">' +
           sgn(v) + '</td>';
  }

  function paintCcy(box){
    var ccy = (snap && snap.ccy) || {};
    var keys = Object.keys(ccy).filter(function(k){ return k !== 'USD'; });
    if (!keys.length) {
      box.innerHTML = '<div class="ss-top"><span class="ss-eyebrow"><span class="ss-live-dot"></span>' +
        esc(t('eyebrow')) + '</span>' + tag() + '</div><h3>' + esc(t('cTitle')) + '</h3>' +
        '<div class="ss-empty">' + esc(t('waiting')) + '</div>';
      return;
    }
    keys.sort(function(a, b){
      var x = ccy[a].m1, y = ccy[b].m1;
      return (typeof y === 'number' ? y : -999) - (typeof x === 'number' ? x : -999);
    });

    var body = keys.map(function(k){
      var r = ccy[k], nm = CUR_NAME[k] || { en:k, th:k, f:'' };
      var rate = (typeof r.rate === 'number')
        ? r.rate.toLocaleString('en-US', { minimumFractionDigits: r.rate >= 500 ? 0 : r.rate >= 20 ? 2 : 4,
                                           maximumFractionDigits: r.rate >= 500 ? 0 : r.rate >= 20 ? 2 : 4 })
        : '—';
      return '<tr><td class="ss-cur">' + esc((nm.f ? nm.f + ' ' : '') + k) +
             '<span>' + esc(tx(nm)) + '</span></td>' +
             '<td>' + rate + '</td>' + cell(r.d1) + cell(r.m1) + cell(r.ytd) + '</tr>';
    }).join('');

    var strongest = keys[0], weakest = keys[keys.length - 1];
    box.innerHTML =
      '<div class="ss-top"><span class="ss-eyebrow"><span class="ss-live-dot"></span>' +
        esc(t('eyebrow')) + '</span>' + tag() + '</div>' +
      '<h3>' + esc(t('cTitle')) + '</h3>' +
      '<p class="ss-lede">' + esc(t('cLede')) + '</p>' +
      '<div class="ss-best">' +
        '<div><div class="ss-bl">' + esc(t('strongest')) + ' · ' + esc(tx({en:'1 month',th:'1 เดือน'})) +
          '</div><div class="ss-bv">' + esc(((CUR_NAME[strongest] || {}).f || '') + ' ' + strongest) +
          ' <span style="color:var(--neon-2,#7CFFB2)">' +
          (typeof ccy[strongest].m1 === 'number' ? sgn(ccy[strongest].m1) : '—') + '</span></div></div>' +
        '<div><div class="ss-bl">' + esc(t('weakest')) + ' · ' + esc(tx({en:'1 month',th:'1 เดือน'})) +
          '</div><div class="ss-bv">' + esc(((CUR_NAME[weakest] || {}).f || '') + ' ' + weakest) +
          ' <span style="color:var(--red,#ff3b4e)">' +
          (typeof ccy[weakest].m1 === 'number' ? sgn(ccy[weakest].m1) : '—') + '</span></div></div>' +
      '</div>' +
      '<div class="ss-tab-wrap"><table class="ss-tab"><thead><tr>' +
        '<th>' + esc(t('cCur')) + '</th><th>' + esc(t('cRate')) + '</th>' +
        '<th>' + esc(t('cD1')) + '</th><th>' + esc(t('cM1')) + '</th><th>' + esc(t('cYtd')) + '</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="ss-foot">' + esc(t('cFoot')) + '<br>' +
        esc(t('updated')) + ' ' + esc(fmtTime(snap && snap.generated_at)) + '</div>';
  }

  /* ---------------------------------------------------------------
     mounting — the three sections are built by their own scripts on a
     delay, so wait for each, then keep the panel pinned to the section
     itself (their painters wipe every [data-*] child).
     --------------------------------------------------------------- */
  var MOUNTS = [
    { sec:'flow',  id:'spzScanFlow',  before:'[data-f="lead"]', paint:paintFlow },
    { sec:'globe', id:'spzScanGlobe', before:'[data-g="note"]', paint:paintGlobe },
    { sec:'infl',  id:'spzScanCcy',   before:'[data-i="note"]', paint:paintCcy }
  ];

  /* Screens that mix a written-once narrative with a live panel need to say
     which half is which — otherwise a figure typed in August still reads as
     today's number six months from now. */
  var NOTICES = [
    { sec:'flow',  id:'spzNoteFlow',
      en:'The fund-flow dollar figures and the rotation story on this screen were written by hand in August 2026 and do not change. The LIVE FLOW SCAN panel further down is the part that updates itself.',
      th:'ตัวเลขเม็ดเงินกองทุนและเรื่องเล่าการหมุนกลุ่มในหน้านี้ เขียนด้วยมือเมื่อสิงหาคม 2026 และไม่เปลี่ยนตามเวลา ส่วนที่อัปเดตเองคือพาเนล "สแกนกระแสเงินสด" ด้านล่าง' },
    { sec:'globe', id:'spzNoteGlobe',
      en:'The central-bank balance sheets, CPI and policy rates on this screen are a dated snapshot written in August 2026. The world scan panel below is live.',
      th:'ขนาดงบดุลธนาคารกลาง เงินเฟ้อ และดอกเบี้ยนโยบายในหน้านี้ เป็นภาพนิ่งที่เขียนไว้เมื่อสิงหาคม 2026 ส่วนพาเนลสแกนโลกด้านล่างเป็นข้อมูลสด' },
    { sec:'infl',  id:'spzNoteInfl',
      en:'The CPI and policy-rate table on this screen was written in August 2026 — those come out monthly and the numbers here do not refresh. The currency board below is live.',
      th:'ตารางเงินเฟ้อและดอกเบี้ยนโยบายในหน้านี้เขียนไว้เมื่อสิงหาคม 2026 — ตัวเลขพวกนี้ประกาศรายเดือนและในหน้านี้ไม่อัปเดตเอง ส่วนกระดานค่าเงินด้านล่างเป็นข้อมูลสด' },
    { sec:'glossary', id:'spzNoteGloss',
      en:'The numbers in these explanations are teaching examples, not quotes. Wherever a real figure exists it is on the stock cards in the Stocks screen, which refresh themselves — if the two disagree, the stock card is the live one.',
      th:'ตัวเลขในคำอธิบายเหล่านี้เป็นตัวอย่างเพื่อสอน ไม่ใช่ราคาจริง ตัวเลขจริงอยู่บนการ์ดหุ้นในหน้า "หุ้นตัวอย่าง" ซึ่งอัปเดตเอง ถ้าสองที่ไม่ตรงกัน ให้ยึดการ์ดหุ้น' }
  ];

  function mountNotices(){
    NOTICES.forEach(function(nt){
      var sec = document.getElementById(nt.sec);
      if (!sec) return;
      var box = document.getElementById(nt.id);
      if (!box) {
        box = document.createElement('div');
        box.id = nt.id;
        box.className = 'spz-dated';
        var head = sec.querySelector('.section-head') || sec.firstElementChild;
        if (head && head.nextSibling) sec.insertBefore(box, head.nextSibling);
        else sec.appendChild(box);
      }
      var tags = window.__SPZ_TAGS;
      box.innerHTML = (tags ? tags.html('stat') : '') + '<span>' + esc(tx(nt)) + '</span>';
    });
  }

  function mountOne(m){
    var sec = document.getElementById(m.sec);
    if (!sec) return false;
    var box = document.getElementById(m.id);
    if (!box) {
      box = document.createElement('div');
      box.id = m.id;
      box.className = 'spz-scan reveal in-view';
      var anchor = sec.querySelector(m.before);
      if (anchor) sec.insertBefore(box, anchor);
      else sec.appendChild(box);
    }
    m.paint(box);
    return true;
  }

  function paintAll(){
    MOUNTS.forEach(function(m){
      var box = document.getElementById(m.id);
      if (box) m.paint(box);
    });
    mountNotices();
  }

  function mountAll(){
    var missing = 0;
    MOUNTS.forEach(function(m){ if (!mountOne(m)) missing++; });
    mountNotices();
    return missing === 0;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (mountAll() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(e){
      snap = e.detail;
      mountAll();
    });

    /* the live module may already have the snapshot before we booted */
    var seed = setInterval(function(){
      if (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) {
        snap = window.__SPZ_LIVE.snapshot();
        mountAll();
        clearInterval(seed);
      }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(paintAll)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_SCAN = { repaint: paintAll, mount: mountAll,
                        state: state, snap: function(){ return snap; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 900); });
  } else {
    setTimeout(boot, 900);
  }
})();
