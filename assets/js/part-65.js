/* ===========================================================================
   Round W (#231): "Elliott Wave Classroom" -- a new teaching page explaining
   Elliott Wave theory at a beginner level, with its own small labeled
   diagram, the three hard rules, the common (non-binding) guidelines, wave
   degrees, and an honest "where this goes wrong" section, matching the
   site's existing habit of pairing every analytical framework with its
   limits (see Outlook's disclaimer, the Credit Risk widget's "proxy, not a
   market price" framing, etc.).

   IMPORTANT / legal: Elliott Wave International is a real, separate
   commercial education company. This page cites it once, in its own boxed
   "further reading" section, worded as a citation -- never as a partner,
   sponsor, source of this page's content, or endorser of this site -- and
   the box says so explicitly. The theory itself (developed by Ralph Nelson
   Elliott in the 1930s) is a public analytical framework, not EWI's
   intellectual property, so describing and illustrating it here is not a
   trademark or affiliation issue on its own; the citation box exists so a
   reader who wants to go deeper has a named, real starting point, phrased
   so nobody could read it as "built with" or "in partnership with" EWI. */
(function(){
  'use strict';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var UI = {
    eb: { en:'Classroom', th:'ห้องเรียน' },
    h:  { en:'Elliott Wave Classroom', th:'ห้องเรียน Elliott Wave' },
    lede: { en:'A beginner-level map of how Elliott Wave analysts read a price chart — the pattern, the three hard rules, the common guidelines, and just as importantly, where the whole framework goes wrong. Educational only: this describes a way of reading a chart, not a prediction of what any chart will do next.',
            th:'แผนที่ระดับเริ่มต้นของวิธีที่นักวิเคราะห์ Elliott Wave อ่านกราฟราคา — รูปแบบคลื่น กฎหลักสามข้อ แนวทางที่ใช้กันทั่วไป และที่สำคัญไม่แพ้กันคือจุดที่ทั้งแนวคิดนี้มักผิดพลาด เป็นสื่อการเรียนรู้เท่านั้น นี่คือวิธีอ่านกราฟแบบหนึ่ง ไม่ใช่การพยากรณ์ว่ากราฟตัวไหนจะไปทางไหนต่อ' },

    s1h: { en:'The basic pattern — five up, three back', th:'รูปแบบพื้นฐาน — ห้าคลื่นไป สามคลื่นกลับ' },
    s1p: { en:'Ralph Nelson Elliott proposed in the 1930s that crowd psychology in a market tends to unfold in a repeating pattern: five waves in the direction of the larger trend (numbered 1–5), followed by three waves correcting against it (lettered A–B–C). Waves 1, 3 and 5 push with the trend; waves 2 and 4 pause against it. Wave 3 is usually the one that does the most work.',
          th:'ราล์ฟ เนลสัน เอลเลียต เสนอไว้ในยุค 1930 ว่าจิตวิทยาฝูงชนในตลาดมีแนวโน้มคลี่คลายเป็นรูปแบบที่เกิดซ้ำ คือห้าคลื่นไปตามเทรนด์ใหญ่ (เลข 1–5) ตามด้วยสามคลื่นปรับฐานสวนทาง (ตัวอักษร A–B–C) คลื่น 1, 3 และ 5 ไปตามเทรนด์ ส่วนคลื่น 2 และ 4 คือจังหวะพักสวนทาง และคลื่น 3 มักเป็นคลื่นที่ไปไกลที่สุด' },
    s1cap: { en:'A textbook impulse (1–5) followed by a textbook correction (A–B–C). Real charts are almost never this clean.',
             th:'คลื่นแรงส่ง (1–5) แบบตำราตามด้วยคลื่นปรับฐาน (A–B–C) แบบตำรา กราฟจริงแทบไม่เคยสะอาดขนาดนี้' },

    s2h: { en:'The three rules — break one of these and the count is wrong', th:'กฎสามข้อ — ผิดข้อใดข้อหนึ่งแปลว่านับคลื่นผิด' },
    r1h: { en:'Wave 2 never retraces past the start of wave 1', th:'คลื่น 2 ห้ามย่อเกินจุดเริ่มต้นของคลื่น 1' },
    r1p: { en:'If price revisits or breaks the very start of the move, it was never wave 2 of an impulse.',
           th:'ถ้าราคากลับไปแตะหรือทะลุจุดเริ่มต้นของการขยับทั้งหมด แสดงว่ามันไม่ใช่คลื่น 2 ของคลื่นแรงส่ง' },
    r2h: { en:'Wave 3 is never the shortest of waves 1, 3 and 5', th:'คลื่น 3 ห้ามสั้นที่สุดเมื่อเทียบกับคลื่น 1 และ 5' },
    r2p: { en:'It can tie, but it cannot be the smallest of the three motive waves.',
           th:'เท่ากันได้ แต่ห้ามเล็กที่สุดในสามคลื่นที่ไปตามเทรนด์' },
    r3h: { en:'Wave 4 never enters wave 1\'s price territory', th:'คลื่น 4 ห้ามเข้าไปในช่วงราคาของคลื่น 1' },
    r3p: { en:'In most markets, wave 4\'s low must stay above wave 1\'s high (for an uptrend). This is the rule almost every bad count breaks first.',
           th:'ในตลาดส่วนใหญ่ จุดต่ำของคลื่น 4 ต้องอยู่สูงกว่าจุดสูงของคลื่น 1 (กรณีเทรนด์ขึ้น) นี่คือกฎที่การนับคลื่นผิดๆ มักละเมิดเป็นข้อแรก' },

    s3h: { en:'Guidelines — common, but not required', th:'แนวทาง — พบบ่อย แต่ไม่ใช่กฎบังคับ' },
    g1h: { en:'Alternation', th:'ความสลับรูปแบบ' },
    g1p: { en:'If wave 2 was a sharp, simple pullback, wave 4 tends to be a shallow, sideways one — and the reverse. Not a rule, just a tendency worth watching for.',
           th:'ถ้าคลื่น 2 เป็นการย่อแบบแรงและรูปแบบง่าย คลื่น 4 มักจะย่อแบบตื้นและออกข้าง — และในทางกลับกัน ไม่ใช่กฎ แค่เป็นแนวโน้มที่ควรสังเกต' },
    g2h: { en:'Fibonacci ratios', th:'อัตราส่วนฟีโบนัชชี' },
    g2p: { en:'Corrective waves often retrace a Fibonacci share of the wave before them, and motive waves often extend by one. These are the ratios analysts watch most — treat them as zones to watch, not exact turning points.',
           th:'คลื่นปรับฐานมักย่อกลับเป็นสัดส่วนฟีโบนัชชีของคลื่นก่อนหน้า และคลื่นแรงส่งมักขยายออกเป็นสัดส่วนเดียวกัน นี่คืออัตราส่วนที่นักวิเคราะห์ดูกันมากที่สุด — ให้มองเป็นโซนที่ต้องจับตา ไม่ใช่จุดเปลี่ยนที่แน่นอน' },
    g3h: { en:'Channeling', th:'การลากกรอบแนวโน้ม' },
    g3p: { en:'A trend line through the ends of waves 2 and 4, with a parallel line through the end of wave 3, often contains wave 5 — a rough target zone, not a guarantee.',
           th:'เส้นแนวโน้มที่ลากผ่านจุดสิ้นสุดคลื่น 2 และ 4 พร้อมเส้นคู่ขนานผ่านจุดสิ้นสุดคลื่น 3 มักครอบคลุมคลื่น 5 ไว้ได้ — เป็นโซนเป้าหมายคร่าวๆ ไม่ใช่สิ่งที่การันตี' },

    fibHead1: { en:'Ratio', th:'อัตราส่วน' },
    fibHead2: { en:'Commonly seen in', th:'มักเจอใน' },

    s4h: { en:'Wave degree — the same pattern, nested at every scale', th:'ระดับขนาดคลื่น — รูปแบบเดิม ซ้อนกันทุกสเกล' },
    s4p: { en:'Every wave shown above is itself built from smaller waves of the same 5-3 shape, one degree down — and is itself one wave of a larger pattern, one degree up. Analysts name the scales (from largest to smallest: Grand Supercycle, Supercycle, Cycle, Primary, Intermediate, Minor, Minute, Minuette, Sub-Minuette) mainly to keep track of which chart timeframe a count belongs to — a Minor-degree wave 3 on a daily chart and a Primary-degree wave 3 on a monthly chart are the same shape, just zoomed differently.',
          th:'คลื่นทุกคลื่นที่เห็นด้านบนเองก็ประกอบขึ้นจากคลื่นย่อยรูปแบบ 5-3 แบบเดียวกัน ในระดับที่เล็กลงไปอีกขั้น — และตัวมันเองก็เป็นคลื่นหนึ่งของรูปแบบที่ใหญ่ขึ้นไปอีกขั้นด้วย นักวิเคราะห์ตั้งชื่อระดับขนาด (จากใหญ่สุดไปเล็กสุด) ไว้หลักๆ เพื่อติดตามว่าการนับคลื่นนั้นอยู่กับกราฟช่วงเวลาไหน — คลื่น 3 ระดับเล็กบนกราฟรายวัน กับคลื่น 3 ระดับใหญ่บนกราฟรายเดือน คือรูปร่างเดียวกัน แค่มองในสเกลต่างกัน' },

    s5h: { en:'Where this goes wrong', th:'จุดที่มักผิดพลาด' },
    w1: { en:'The count is subjective. Give the same chart to five Elliotticians and it is common to get more than one valid-looking count back — the rules narrow the possibilities, they do not pick a single answer.',
          th:'การนับคลื่นเป็นเรื่องตีความ เอากราฟเดียวกันให้คนนับคลื่นห้าคน มักได้คำตอบที่ดูสมเหตุสมผลมากกว่าหนึ่งแบบ — กฎช่วยตัดตัวเลือกที่เป็นไปไม่ได้ออก แต่ไม่ได้ฟันธงคำตอบเดียว' },
    w2: { en:'It is easy to re-label a wrong count after the fact ("that was actually a wave 4, not a wave 2") and feel like the framework predicted the move. That is hindsight, not a forecast.',
          th:'ง่ายมากที่จะย้อนไปเปลี่ยนป้ายคลื่นที่นับผิดในตอนหลัง ("อ้อ นั่นคือคลื่น 4 ไม่ใช่คลื่น 2") แล้วรู้สึกว่าทฤษฎีนี้ทำนายถูก นั่นคือการมองย้อนหลัง ไม่ใช่การพยากรณ์' },
    w3: { en:'The guidelines in the section above are not rules — treating a Fibonacci zone or a channel line as a guaranteed turning point, rather than one input among many, is the single most common misuse of this framework.',
          th:'แนวทางในหัวข้อก่อนหน้าไม่ใช่กฎ — การเชื่อว่าโซนฟีโบนัชชีหรือเส้นกรอบแนวโน้มคือจุดเปลี่ยนที่แน่นอน ทั้งที่มันเป็นแค่ปัจจัยหนึ่งในหลายปัจจัย คือความเข้าใจผิดที่พบบ่อยที่สุดของทฤษฎีนี้' },
    w4: { en:'Nothing on this page is a signal to buy or sell anything. Wave counts are one lens for reading a chart\'s structure, not a system with a verified track record of its own.',
          th:'ไม่มีอะไรในหน้านี้เป็นสัญญาณให้ซื้อหรือขาย การนับคลื่นเป็นมุมมองหนึ่งสำหรับอ่านโครงสร้างกราฟ ไม่ใช่ระบบที่มีสถิติผลงานที่พิสูจน์แล้วด้วยตัวเอง' },

    furtherH: { en:'Further reading', th:'อ่านเพิ่มเติม' },
    furtherP: { en:'This page summarises the public analytical framework Ralph Nelson Elliott first published in the 1930s. For readers who want to go deeper, Elliott Wave International is one well-known commercial education provider that publishes extensively on this subject — mentioned here purely as a citation for further study.',
                th:'หน้านี้สรุปแนวคิดเชิงวิเคราะห์สาธารณะที่ราล์ฟ เนลสัน เอลเลียต เผยแพร่ครั้งแรกในยุค 1930 สำหรับผู้อ่านที่อยากศึกษาต่อ Elliott Wave International คือผู้ให้บริการการศึกษาเชิงพาณิชย์รายหนึ่งที่เป็นที่รู้จักและเผยแพร่เนื้อหาด้านนี้อย่างกว้างขวาง — กล่าวถึงที่นี่เพียงเพื่อการอ้างอิงให้ไปศึกษาต่อเท่านั้น' },
    furtherDisc: { en:'SPACEZ TERMINAL is not affiliated with, sponsored by, or endorsed by Elliott Wave International or any similar provider, and this page is not their material — it is this site\'s own summary of a public framework.',
                   th:'SPACEZ TERMINAL ไม่มีความเกี่ยวข้อง ไม่ได้รับการสนับสนุน และไม่ได้รับการรับรองจาก Elliott Wave International หรือผู้ให้บริการรายใดที่คล้ายกัน และหน้านี้ไม่ใช่เนื้อหาของบริษัทดังกล่าว — เป็นบทสรุปแนวคิดสาธารณะที่เว็บนี้เขียนขึ้นเอง' },
    furtherLink: { en:'elliottwave.com (opens in a new tab)', th:'elliottwave.com (เปิดแท็บใหม่)' },

    note: { en:'Educational only — not investment advice, a signal, or a recommendation. Nothing here is affiliated with any broker, exchange or issuer.',
            th:'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน สัญญาณซื้อขาย หรือการชี้ชวน ไม่มีความเกี่ยวข้องกับโบรกเกอร์ ตลาดหลักทรัพย์ หรือผู้ออกหลักทรัพย์ใดๆ' }
  };

  var FIB = [
    { r:'23.6%', u:{ en:'A shallow pullback inside a strong trend', th:'การย่อตื้นๆ ภายในเทรนด์ที่แรง' } },
    { r:'38.2%', u:{ en:'A typical wave 2 or wave 4 retracement', th:'การย่อของคลื่น 2 หรือคลื่น 4 แบบทั่วไป' } },
    { r:'50.0%', u:{ en:'Not a Fibonacci ratio, but watched just as closely', th:'ไม่ใช่อัตราฟีโบนัชชีจริงๆ แต่ถูกจับตาไม่แพ้กัน' } },
    { r:'61.8%', u:{ en:'A deep wave 2 retracement, or a wave C equal to wave A', th:'การย่อลึกของคลื่น 2 หรือคลื่น C ที่เท่ากับคลื่น A' } },
    { r:'161.8%', u:{ en:'A common wave 3 or wave 5 extension target', th:'เป้าหมายขยายตัวที่พบบ่อยของคลื่น 3 หรือคลื่น 5' } },
    { r:'261.8%', u:{ en:'A stretched wave 3 in a fast-moving market', th:'คลื่น 3 ที่ยืดยาวในตลาดที่ขยับเร็ว' } }
  ];

  /* --------------------------------------------------------------------
     a small, static, hand-labeled 1-2-3-4-5 / A-B-C diagram -- illustrative
     only, drawn once, no live data involved (unlike every chart elsewhere
     on this site, this page is pure theory, so there is nothing to feed it) */
  var PTS = [
    { x:20,  y:182, lab:'0' },
    { x:100, y:92,  lab:'1' },
    { x:142, y:132, lab:'2' },
    { x:262, y:28,  lab:'3' },
    { x:322, y:76,  lab:'4' },
    { x:400, y:8,   lab:'5' },
    { x:462, y:92,  lab:'A' },
    { x:512, y:54,  lab:'B' },
    { x:566, y:142, lab:'C' }
  ];
  function diagramHTML(){
    var path = PTS.map(function(p, i){ return (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y; }).join(' ');
    var dots = PTS.map(function(p){
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4.5" class="ewv-dot' + (/[0-9]/.test(p.lab) ? '' : ' ewv-dot-ab') + '"/>' +
        '<text x="' + p.x + '" y="' + (p.y - 12) + '" class="ewv-lab">' + p.lab + '</text>';
    }).join('');
    return (
      '<svg class="ewv-svg" viewBox="0 0 586 200" preserveAspectRatio="xMidYMid meet">' +
        '<path d="' + path + '" fill="none" class="ewv-path"/>' +
        dots +
      '</svg>'
    );
  }

  var sec = null;

  function bodyHTML(){
    var rules = [
      [UI.r1h, UI.r1p], [UI.r2h, UI.r2p], [UI.r3h, UI.r3p]
    ];
    var guides = [
      [UI.g1h, UI.g1p], [UI.g2h, UI.g2p], [UI.g3h, UI.g3p]
    ];
    var warns = [UI.w1, UI.w2, UI.w3, UI.w4];

    return (
      '<section class="ewv-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s1h)) + '</h3>' +
        '<p class="ewv-p">' + esc(T(UI.s1p)) + '</p>' +
        '<div class="ewv-diagram">' + diagramHTML() + '</div>' +
        '<p class="ewv-cap">' + esc(T(UI.s1cap)) + '</p>' +
      '</section>' +

      '<section class="ewv-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s2h)) + '</h3>' +
        '<div class="ewv-rules">' + rules.map(function(r, i){
          return '<div class="ewv-rule"><span class="ewv-rule-n">' + (i + 1) + '</span>' +
            '<div><b>' + esc(T(r[0])) + '</b><p>' + esc(T(r[1])) + '</p></div></div>';
        }).join('') + '</div>' +
      '</section>' +

      '<section class="ewv-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s3h)) + '</h3>' +
        '<div class="ewv-guides">' + guides.map(function(g){
          return '<div class="ewv-guide"><b>' + esc(T(g[0])) + '</b><p>' + esc(T(g[1])) + '</p></div>';
        }).join('') + '</div>' +
        '<table class="ewv-fib"><thead><tr><th>' + esc(T(UI.fibHead1)) + '</th><th>' + esc(T(UI.fibHead2)) + '</th></tr></thead><tbody>' +
          FIB.map(function(f){ return '<tr><td class="ewv-fib-r">' + esc(f.r) + '</td><td>' + esc(T(f.u)) + '</td></tr>'; }).join('') +
        '</tbody></table>' +
      '</section>' +

      '<section class="ewv-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s4h)) + '</h3>' +
        '<p class="ewv-p">' + esc(T(UI.s4p)) + '</p>' +
      '</section>' +

      '<section class="ewv-sec ewv-warn-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s5h)) + '</h3>' +
        '<ul class="ewv-warns">' + warns.map(function(w){ return '<li>' + esc(T(w)) + '</li>'; }).join('') + '</ul>' +
      '</section>' +

      '<div class="ewv-cite">' +
        '<div class="ewv-cite-h">' + esc(T(UI.furtherH)) + '</div>' +
        '<p>' + esc(T(UI.furtherP)) + '</p>' +
        '<a href="https://www.elliottwave.com" target="_blank" rel="noopener noreferrer nofollow" class="ewv-cite-link">' + esc(T(UI.furtherLink)) + ' ↗</a>' +
        '<p class="ewv-cite-disc">' + esc(T(UI.furtherDisc)) + '</p>' +
      '</div>' +

      '<p class="ewv-note">' + esc(T(UI.note)) + '</p>'
    );
  }

  function paint(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-ewv="' + k + '"]'); };
    if(q('eb')) q('eb').textContent = T(UI.eb);
    if(q('h')) q('h').textContent = T(UI.h);
    if(q('lede')) q('lede').textContent = T(UI.lede);
    var body = q('body');
    if(body) body.innerHTML = bodyHTML();
  }

  function build(){
    if(document.getElementById('elliott')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'elliott';
    sec.setAttribute('data-route', 'elliott');
    sec.innerHTML =
      '<div class="ewv-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-ewv="eb"></span></div>' +
          '<h2 data-ewv="h"></h2>' +
          '<p class="lede" data-ewv="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-ewv="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'elliott', after:'signals',
      t:{en:'Elliott Wave Classroom',th:'ห้องเรียน Elliott Wave'},
      d:{en:'The 5-3 wave pattern, the three hard rules, the common guidelines, and an honest look at where the whole framework goes wrong.',
         th:'รูปแบบคลื่น 5-3 กฎหลักสามข้อ แนวทางที่ใช้กันทั่วไป และมุมมองตรงไปตรงมาว่าทฤษฎีนี้มักผิดพลาดตรงไหน'}
    });

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
