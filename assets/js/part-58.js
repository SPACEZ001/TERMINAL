
(function(){
  'use strict';
  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] || o.en || '') : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }
  function pad2(n){ n = Math.floor(n); return n < 10 ? '0' + n : '' + n; }
  function ymd(d){ return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()); }

  var C = {
    eb:{en:'Macro Calendar',th:'ปฏิทินมหภาค'},
    h:{en:'Economic Calendar',th:'ปฏิทินเศรษฐกิจ'},
    lede:{en:'The releases that tend to move markets — by day, by week, with forecast vs. actual once each one lands.',
          th:'ตัวเลขเศรษฐกิจที่มักขยับตลาด — แยกตามวันและตามสัปดาห์ พร้อมเทียบตัวเลขคาดการณ์กับค่าจริงทันทีที่ประกาศ'},
    disc:{en:'Educational reference only, not investment advice. Times and figures come from a free third-party feed (Finnhub) and can be delayed, revised, or occasionally wrong — always confirm at the primary source. "Above/below forecast" market notes describe historical tendencies, not guarantees.',
          th:'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน เวลาและตัวเลขมาจากผู้ให้บริการข้อมูลภายนอกแบบฟรี (Finnhub) อาจหน่วง แก้ไขภายหลัง หรือคลาดเคลื่อนได้บ้าง ควรตรวจสอบกับแหล่งข้อมูลหลักเสมอ ส่วนบันทึก "ดีกว่า/แย่กว่าคาด" เป็นแนวโน้มในอดีต ไม่ใช่การรับประกัน'},
    keygateLede:{en:'This calendar isn’t wired up on the server yet — the site owner needs to add one free Finnhub key. Check back shortly.',
                 th:'ปฏิทินนี้ยังไม่ได้ตั้งค่าฝั่งเซิร์ฟเวอร์ — ผู้ดูแลเว็บต้องเพิ่มคีย์ Finnhub ฟรีก่อน กลับมาดูใหม่อีกครั้งนะ'},
    loading:{en:'Loading calendar…',th:'กำลังโหลดปฏิทิน…'},
    error:{en:'Could not load the calendar right now — the free feed may be rate-limited. Try again in a moment.',
           th:'โหลดปฏิทินไม่สำเร็จตอนนี้ — อาจเพราะผู้ให้บริการจำกัดจำนวนครั้ง ลองใหม่อีกครั้งในอีกสักครู่'},
    dow:{en:['Su','Mo','Tu','We','Th','Fr','Sa'],th:['อา','จ','อ','พ','พฤ','ศ','ส']},
    dayDetailPick:{en:'Tap a day above to see its releases.',th:'แตะวันที่ด้านบนเพื่อดูรายการประกาศของวันนั้น'},
    dayDetailEmpty:{en:'No tracked releases that day.',th:'วันนี้ไม่มีการประกาศตัวเลขที่ติดตาม'},
    weekH:{en:'This Week',th:'สัปดาห์นี้'},
    weekEmpty:{en:'Nothing on the tracked calendar for the next 7 days.',th:'7 วันข้างหน้ายังไม่มีรายการในปฏิทินที่ติดตาม'},
    estLbl:{en:'Forecast',th:'คาดการณ์'},
    actLbl:{en:'Actual',th:'ค่าจริง'},
    prevLbl:{en:'Previous',th:'ครั้งก่อน'},
    pendingLbl:{en:'Not yet released',th:'ยังไม่ประกาศ'},
    aboveTag:{en:'above forecast',th:'สูงกว่าคาด'},
    belowTag:{en:'below forecast',th:'ต่ำกว่าคาด'},
    inlineTag:{en:'in line with forecast',th:'ตรงกับคาดการณ์'}
  };

  var NOTES = {
    inflation:{
      above:{en:'Hotter inflation has historically pushed bond yields and the dollar up — often pressuring growth/tech stocks and gold short-term, while energy and value names have sometimes held up better.',
              th:'เงินเฟ้อที่ร้อนกว่าคาดมักดันผลตอบแทนพันธบัตรและดอลลาร์ให้แข็งขึ้น ในอดีตมักกดดันหุ้นเติบโต/เทคโนโลยีและทองคำในระยะสั้น ส่วนหุ้นพลังงานและคุณค่ามักไปได้ดีกว่า'},
      below:{en:'Cooler inflation has historically fed rate-cut hopes — often lifting growth/tech stocks and gold, while easing pressure on the dollar.',
             th:'เงินเฟ้อที่เย็นกว่าคาดมักหนุนความหวังลดดอกเบี้ย ในอดีตมักหนุนหุ้นเติบโต/เทคโนโลยีและทองคำ พร้อมคลายแรงกดดันดอลลาร์'}
    },
    jobs:{
      above:{en:'A stronger labor market has often reduced the urgency for rate cuts — historically pressuring gold and rate-sensitive growth stocks, while supporting the dollar and financials.',
             th:'ตลาดแรงงานที่แข็งแกร่งกว่าคาดมักลดความจำเป็นในการลดดอกเบี้ย ในอดีตมักกดดันทองคำและหุ้นเติบโตที่อ่อนไหวต่อดอกเบี้ย ขณะที่หนุนดอลลาร์และกลุ่มการเงิน'},
      below:{en:'A weaker labor market has often raised rate-cut expectations — historically lifting gold and growth stocks, while weighing on the dollar.',
             th:'ตลาดแรงงานที่อ่อนกว่าคาดมักเพิ่มความคาดหวังลดดอกเบี้ย ในอดีตมักหนุนทองคำและหุ้นเติบโต ขณะที่กดดันดอลลาร์'}
    },
    rates:{
      above:{en:'A more hawkish outcome than expected has historically hit growth stocks and gold hardest, while boosting the dollar and bank stocks.',
             th:'ผลการประชุมที่ "เข้มงวดกว่าคาด" ในอดีตมักกระทบหุ้นเติบโตและทองคำหนักที่สุด ขณะที่หนุนดอลลาร์และหุ้นกลุ่มธนาคาร'},
      below:{en:'A more dovish outcome than expected has often lifted growth stocks and gold, while weakening the dollar.',
             th:'ผลการประชุมที่ "ผ่อนคลายกว่าคาด" ในอดีตมักหนุนหุ้นเติบโตและทองคำ ขณะที่ทำให้ดอลลาร์อ่อนค่า'}
    },
    growth:{
      above:{en:'Stronger-than-expected growth has often supported cyclical and value stocks, sometimes weighing on gold if it cools rate-cut bets.',
             th:'การเติบโตที่แข็งแกร่งกว่าคาดมักหนุนหุ้นวัฏจักรและหุ้นคุณค่า และบางครั้งกดดันทองคำหากลดโอกาสลดดอกเบี้ย'},
      below:{en:'Weaker-than-expected growth has often pressured cyclical stocks while supporting safe havens like gold and government bonds.',
             th:'การเติบโตที่อ่อนแอกว่าคาดมักกดดันหุ้นวัฏจักร ขณะที่หนุนสินทรัพย์ปลอดภัยอย่างทองคำและพันธบัตรรัฐบาล'}
    },
    business:{
      above:{en:'A stronger business-activity reading has historically favored industrials and cyclical sectors, with a more mixed effect on gold.',
             th:'ดัชนีกิจกรรมทางธุรกิจที่แข็งแกร่งกว่าคาดมักเอื้อต่อหุ้นกลุ่มอุตสาหกรรมและวัฏจักร ส่วนทองคำมักได้รับผลไม่แน่นอน'},
      below:{en:'A weaker business-activity reading has often raised growth concerns — pressuring cyclical stocks while supporting bonds and sometimes gold.',
             th:'ดัชนีกิจกรรมทางธุรกิจที่อ่อนแอกว่าคาดมักเพิ่มความกังวลด้านการเติบโต กดดันหุ้นวัฏจักร ขณะที่หนุนพันธบัตรและบางครั้งทองคำ'}
    },
    consumer:{
      above:{en:'Stronger consumer data has often supported retail and consumer-discretionary stocks, though it can add to inflation concerns that weigh on gold.',
             th:'ข้อมูลผู้บริโภคที่แข็งแกร่งกว่าคาดมักหนุนหุ้นกลุ่มค้าปลีกและสินค้าฟุ่มเฟือย แต่บางครั้งเพิ่มความกังวลเงินเฟ้อซึ่งกดดันทองคำ'},
      below:{en:'Weaker consumer data has often pressured retail and consumer-discretionary stocks while supporting expectations for easier policy.',
             th:'ข้อมูลผู้บริโภคที่อ่อนแอกว่าคาดมักกดดันหุ้นกลุ่มค้าปลีกและสินค้าฟุ่มเฟือย ขณะที่หนุนความคาดหวังนโยบายที่ผ่อนคลายขึ้น'}
    },
    general:{
      above:{en:'A stronger-than-expected reading can shift short-term sentiment — check what this specific indicator usually moves.',
             th:'ตัวเลขที่ออกมาดีกว่าคาดอาจส่งผลต่อความเชื่อมั่นระยะสั้น — ควรตรวจสอบว่าตัวชี้วัดนี้มักส่งผลต่อกลุ่มใด'},
      below:{en:'A weaker-than-expected reading can shift short-term sentiment — check what this specific indicator usually moves.',
             th:'ตัวเลขที่ออกมาแย่กว่าคาดอาจส่งผลต่อความเชื่อมั่นระยะสั้น — ควรตรวจสอบว่าตัวชี้วัดนี้มักส่งผลต่อกลุ่มใด'}
    }
  };

  var CATS = [
    { key:'inflation', re:/CPI|PCE|Inflation/i },
    { key:'jobs',       re:/Non[\s-]?Farm|Payrolls|Unemployment|Jobless Claims|ADP Employment|Employment Change/i },
    { key:'rates',      re:/Interest Rate|FOMC|Fed Funds|Rate Decision|BOJ|ECB\b/i },
    { key:'growth',     re:/\bGDP\b/i },
    { key:'business',   re:/PMI|ISM|Industrial Production|Manufacturing/i },
    { key:'consumer',   re:/Retail Sales|Consumer Confidence|Consumer Sentiment|Michigan/i }
  ];
  var INVERSE_RE = /Unemployment Rate|Jobless Claims/i;
  var COUNTRY_ALLOW = { US:1, EU:1, GB:1, JP:1, CN:1, DE:1, TH:1 };

  function categoryFor(name){
    for(var i=0;i<CATS.length;i++){ if(CATS[i].re.test(name || '')) return CATS[i].key; }
    return 'general';
  }
  function rawDirection(actual, estimate){
    if(!isNum(actual) || !isNum(estimate)) return null;
    if(actual > estimate) return 'above';
    if(actual < estimate) return 'below';
    return 'inline';
  }
  function noteDirection(ev, rawDir){
    if(!rawDir || rawDir === 'inline') return rawDir;
    return INVERSE_RE.test(ev.event || '') ? (rawDir === 'above' ? 'below' : 'above') : rawDir;
  }
  function fmtVal(v, unit){
    if(!isNum(v)) return null;
    var s = (Math.abs(v) >= 1000) ? v.toLocaleString() : String(v);
    return s + (unit || '');
  }

  function impactStarsHTML(impact){
    var n = impact === 'high' ? 3 : impact === 'medium' ? 2 : impact === 'low' ? 1 : 0;
    var cls = impact === 'high' ? 'high' : impact === 'medium' ? 'medium' : 'low';
    var out = '';
    for(var i=0;i<3;i++){ out += '<span class="ec-star' + (i < n ? ' on ' + cls : '') + '">★</span>'; }
    return '<span class="ec-stars">' + out + '</span>';
  }

  /* ---- data: proxied through the site's own Cloudflare Worker (Round M,
     switched from Finnhub to Financial Modeling Prep in Round M6 after
     Finnhub's free plan turned out to block this exact endpoint) instead
     of calling the provider directly from the browser, so a visitor needs
     zero setup of their own -- the Worker holds one FMP key server-side
     (FMP_KEY secret), normalizes the response into this same shape, and
     caches it for everyone. Also cached here per date-range in memory +
     sessionStorage (20-min TTL) so switching tabs/language, or reopening
     the same month, never re-hits even the Worker more than necessary. ---- */
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var CACHE_TTL_MS = 20 * 60 * 1000;
  var mem = {};
  function fetchRange(fromStr, toStr, cacheKey){
    var hit = mem[cacheKey];
    if(hit && (Date.now() - hit.ts) < CACHE_TTL_MS) return Promise.resolve(hit.events);
    try {
      var raw = sessionStorage.getItem('spz_ecocal_' + cacheKey);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && (Date.now() - parsed.ts) < CACHE_TTL_MS){ mem[cacheKey] = parsed; return Promise.resolve(parsed.events); }
      }
    } catch(e){}
    var url = WORKER_BASE + '/api/econ-calendar?from=' + fromStr + '&to=' + toStr;
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var t = setTimeout(function(){ if(ctrl) ctrl.abort(); }, 12000);
    return fetch(url, ctrl ? { signal:ctrl.signal } : undefined).then(function(r){
      clearTimeout(t);
      if(r.status === 501) throw new Error('not_configured');
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function(e){ clearTimeout(t); throw e; }).then(function(d){
      var events = ((d && d.economicCalendar) || []).filter(function(ev){
        return ev && ev.impact && COUNTRY_ALLOW[ev.country];
      });
      var entry = { ts:Date.now(), events:events };
      mem[cacheKey] = entry;
      try { sessionStorage.setItem('spz_ecocal_' + cacheKey, JSON.stringify(entry)); } catch(e){}
      return events;
    });
  }

  function eventDay(ev){ return String(ev.time || '').slice(0, 10); }

  /* one event row, shared by the day-detail panel and This Week */
  function eventRowHTML(ev){
    var cat = categoryFor(ev.event);
    var rawDir = rawDirection(ev.actual, ev.estimate);
    var dir = noteDirection(ev, rawDir);
    var estTxt = fmtVal(ev.estimate, ev.unit);
    var actTxt = fmtVal(ev.actual, ev.unit);
    var prevTxt = fmtVal(ev.prev, ev.unit);
    var actualHTML = actTxt != null
      ? '<span class="ec-row-actual ' + (rawDir || '') + '">' + esc(actTxt) +
          (rawDir === 'above' ? ' (' + esc(tx(C.aboveTag)) + ')' : rawDir === 'below' ? ' (' + esc(tx(C.belowTag)) + ')' : rawDir === 'inline' ? ' (' + esc(tx(C.inlineTag)) + ')' : '') +
        '</span>'
      : '<span class="ec-row-actual">' + esc(tx(C.pendingLbl)) + '</span>';
    var noteHTML = (dir && dir !== 'inline' && NOTES[cat] && NOTES[cat][dir])
      ? '<div class="ec-row-note">' + esc(tx(NOTES[cat][dir])) + '</div>' : '';
    return '<div class="ec-row">' +
      '<div class="ec-row-top">' +
        '<span class="ec-row-time">' + esc(String(ev.time||'').slice(0,16)) + '</span>' +
        '<span class="ec-row-country">' + esc(ev.country||'') + '</span>' +
        '<span class="ec-row-event">' + esc(ev.event||'') + '</span>' +
        impactStarsHTML(ev.impact) +
      '</div>' +
      '<div class="ec-row-vals">' +
        (estTxt != null ? '<span><b>' + esc(tx(C.estLbl)) + '</b>' + esc(estTxt) + '</span>' : '') +
        '<span><b>' + esc(tx(C.actLbl)) + '</b>' + actualHTML + '</span>' +
        (prevTxt != null ? '<span><b>' + esc(tx(C.prevLbl)) + '</b>' + esc(prevTxt) + '</span>' : '') +
      '</div>' +
      noteHTML +
    '</div>';
  }

  var sec, curY, curM, selDay = null;
  var today = new Date();

  function monthLabel(y, m){
    var names = { en:['January','February','March','April','May','June','July','August','September','October','November','December'],
                  th:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'] };
    return names[L()][m] + ' ' + y;
  }

  function renderGridSkeleton(){
    sec.querySelector('[data-ec="weekdays"]').innerHTML = tx(C.dow).map(function(d){ return '<span>' + esc(d) + '</span>'; }).join('');
    sec.querySelector('[data-ec="monthlbl"]').textContent = monthLabel(curY, curM);
  }

  function paintDayDetail(byDay){
    var box = sec.querySelector('[data-ec="daydetail"]');
    if(!selDay){ box.innerHTML = '<div class="ec-daydetail-empty">' + esc(tx(C.dayDetailPick)) + '</div>'; return; }
    var evs = (byDay[selDay] || []).slice().sort(function(a,b){ return String(a.time||'').localeCompare(String(b.time||'')); });
    var d = new Date(selDay + 'T00:00:00');
    var hdr = '<div class="ec-daydetail-h">' + esc(d.toLocaleDateString(L()==='th'?'th-TH':'en-US', {weekday:'long', month:'long', day:'numeric'})) + '</div>';
    box.innerHTML = hdr + (evs.length ? evs.map(eventRowHTML).join('') : '<div class="ec-daydetail-empty">' + esc(tx(C.dayDetailEmpty)) + '</div>');
  }

  function paintGrid(events){
    var byDay = {};
    (events||[]).forEach(function(ev){
      var d = eventDay(ev);
      if(!byDay[d]) byDay[d] = [];
      byDay[d].push(ev);
    });
    var firstDow = new Date(curY, curM, 1).getDay();
    var lastDate = new Date(curY, curM + 1, 0).getDate();
    var todayStr = ymd(today);
    var html = '';
    for(var p=0;p<firstDow;p++) html += '<div class="ec-daybox pad"></div>';
    for(var day=1; day<=lastDate; day++){
      var dStr = curY + '-' + pad2(curM+1) + '-' + pad2(day);
      var evs = byDay[dStr] || [];
      var hasHigh = evs.some(function(e){ return e.impact === 'high'; });
      var hasMed = evs.some(function(e){ return e.impact === 'medium'; });
      var hasLow = evs.some(function(e){ return e.impact === 'low'; });
      var dotsHTML = evs.length ? ('<span class="ec-dots">' +
        (hasHigh ? '<span class="ec-dot high"></span>' : '') +
        (hasMed ? '<span class="ec-dot medium"></span>' : '') +
        (hasLow ? '<span class="ec-dot low"></span>' : '') +
      '</span>') : '';
      html += '<div class="ec-daybox' + (dStr === todayStr ? ' today' : '') + (dStr === selDay ? ' sel' : '') +
        '" data-ec-day="' + dStr + '"><span>' + day + '</span>' + dotsHTML + '</div>';
    }
    sec.querySelector('[data-ec="grid"]').innerHTML = html;
    paintDayDetail(byDay);
    var boxes = sec.querySelectorAll('[data-ec-day]');
    for(var i=0;i<boxes.length;i++){
      boxes[i].addEventListener('click', function(){
        var d = this.getAttribute('data-ec-day');
        selDay = (selDay === d) ? null : d;
        paintGrid(events);
      });
    }
  }

  function paintWeek(){
    var from = ymd(today);
    var end = new Date(today.getTime() + 6*86400000);
    var to = ymd(end);
    fetchRange(from, to, 'week-' + from).then(function(events){
      events = events.slice().sort(function(a,b){ return String(a.time||'').localeCompare(String(b.time||'')); });
      var box = sec.querySelector('[data-ec="weeklist"]');
      box.innerHTML = events.length ? events.map(eventRowHTML).join('') : '<div class="ec-week-empty">' + esc(tx(C.weekEmpty)) + '</div>';
    }, function(){
      /* the month fetch already surfaces the shared error/keygate state;
         This Week just stays quietly empty rather than duplicating it. */
      var box = sec.querySelector('[data-ec="weeklist"]');
      if(box) box.innerHTML = '';
    });
  }

  function loadMonth(){
    sec.querySelector('[data-ec="loading"]').style.display = '';
    sec.querySelector('[data-ec="error"]').style.display = 'none';
    sec.querySelector('[data-ec="content"]').style.display = 'none';
    var from = curY + '-' + pad2(curM+1) + '-01';
    var lastDate = new Date(curY, curM+1, 0).getDate();
    var to = curY + '-' + pad2(curM+1) + '-' + pad2(lastDate);
    fetchRange(from, to, curY + '-' + pad2(curM+1)).then(function(events){
      sec.querySelector('[data-ec="loading"]').style.display = 'none';
      sec.querySelector('[data-ec="content"]').style.display = '';
      renderGridSkeleton();
      paintGrid(events);
      paintWeek();
    }, function(err){
      sec.querySelector('[data-ec="loading"]').style.display = 'none';
      if(err && err.message === 'not_configured'){
        sec.querySelector('[data-ec="keygate"]').style.display = '';
      } else {
        sec.querySelector('[data-ec="error"]').style.display = '';
      }
    });
  }

  function paint(){
    sec.querySelector('[data-ec="eb"]').textContent = tx(C.eb);
    sec.querySelector('[data-ec="h"]').textContent = tx(C.h);
    sec.querySelector('[data-ec="lede"]').textContent = tx(C.lede);
    sec.querySelector('[data-ec="disc"]').textContent = tx(C.disc);
    sec.querySelector('[data-ec="keygateLede"]').textContent = tx(C.keygateLede);
    sec.querySelector('[data-ec="loading"]').textContent = tx(C.loading);
    sec.querySelector('[data-ec="error"]').textContent = tx(C.error);
    sec.querySelector('[data-ec="weekh"]').textContent = tx(C.weekH);
    sec.querySelector('[data-ec="keygate"]').style.display = 'none';
    loadMonth();
  }

  function bind(){
    sec.querySelector('[data-ec="prevMonth"]').addEventListener('click', function(){
      curM--; if(curM < 0){ curM = 11; curY--; }
      selDay = null;
      loadMonth();
    });
    sec.querySelector('[data-ec="nextMonth"]').addEventListener('click', function(){
      curM++; if(curM > 11){ curM = 0; curY++; }
      selDay = null;
      loadMonth();
    });
  }

  function build(){
    if(document.getElementById('ecocal')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'ecocal';
    sec.setAttribute('data-route', 'ecocal');
    sec.innerHTML =
      '<div class="cx-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-ec="eb"></span></div>' +
          '<h2 data-ec="h"></h2>' +
          '<p class="lede" data-ec="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div class="ec-disc" data-ec="disc"></div>' +
        '<div class="ec-keygate" data-ec="keygate" style="display:none;">' +
          '<div class="ec-keygate-icon">\u{1F511}</div>' +
          '<div class="ec-keygate-lede" data-ec="keygateLede"></div>' +
        '</div>' +
        '<div class="ec-loading" data-ec="loading" style="display:none;"></div>' +
        '<div class="ec-error" data-ec="error" style="display:none;"></div>' +
        '<div data-ec="content" style="display:none;">' +
          '<div class="ec-monthbar">' +
            '<button type="button" class="ec-monthbtn" data-ec="prevMonth">‹</button>' +
            '<span class="ec-monthlbl" data-ec="monthlbl"></span>' +
            '<button type="button" class="ec-monthbtn" data-ec="nextMonth">›</button>' +
          '</div>' +
          '<div class="ec-weekdays" data-ec="weekdays"></div>' +
          '<div class="ec-grid" data-ec="grid"></div>' +
          '<div class="ec-daydetail" data-ec="daydetail"></div>' +
          '<div class="ec-week-head"><span class="ec-week-h" data-ec="weekh"></span></div>' +
          '<div data-ec="weeklist"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(sec);

    var now = new Date();
    curY = now.getFullYear(); curM = now.getMonth();

    window.__spzAddRoute({
      id:'ecocal', feat:true, after:'scenarios',
      t:{en:'Economic Calendar',th:'ปฏิทินเศรษฐกิจ'},
      d:{en:'Which economic releases land this week and this month, with forecast vs. actual and a plain-language read on which sectors/gold tend to move.',
         th:'ตัวเลขเศรษฐกิจที่จะประกาศสัปดาห์นี้และเดือนนี้ พร้อมเทียบคาดการณ์กับค่าจริง และคำอธิบายง่ายๆ ว่ากลุ่มหุ้น/ทองคำมักขยับทางไหน'}
    });

    bind();
    paint();
    /* periodic refresh so a newly-released actual value (or the calendar
       coming online after she adds the Worker's Finnhub secret) shows up
       without a manual reload -- mostly a cache hit given the 20-min TTL
       above, so this costs nothing on the quiet cycles. */
    document.addEventListener('spz:snapshot', paint);
    new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  else setTimeout(boot, 1200);
})();
