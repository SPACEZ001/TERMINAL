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
            th:'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน สัญญาณซื้อขาย หรือการชี้ชวน ไม่มีความเกี่ยวข้องกับโบรกเกอร์ ตลาดหลักทรัพย์ หรือผู้ออกหลักทรัพย์ใดๆ' },

    /* Round X (#234): page moved to admin-only -- same content-level gate
       and shared "Admins only." placeholder class (.qrp-locked, part-44.css)
       already used by part-50/51/57/63. */
    adminOnly: { en:'Admins only.', th:'เฉพาะแอดมินเท่านั้น' },

    /* Round X (#235): wave subdivision + corrective pattern types */
    s6h: { en:'Subdivision — every wave is built from smaller waves', th:'การย่อยคลื่น — ทุกคลื่นประกอบขึ้นจากคลื่นย่อย' },
    s6p: { en:'Zoom into any single wave above and it turns out to be a complete pattern of its own, one degree smaller. A motive wave (1, 3, 5, or an A/C of a correction) always subdivides into 5 sub-waves; a corrective wave (2, 4, or B) always subdivides into 3. So inside a larger impulse: wave 1 is itself a 5-wave motive structure, wave 2 is itself a 3-wave corrective structure, wave 3 is a 5-wave motive structure, and so on — the same 5-and-3 shape, nested at every scale (see "Wave degree" below).',
          th:'ลองซูมเข้าไปในคลื่นใดคลื่นหนึ่งข้างบน จะพบว่ามันคือรูปแบบคลื่นสมบูรณ์ในตัวเอง แค่ขนาดเล็กลงไปอีกขั้น คลื่นแรงส่ง (1, 3, 5 หรือ A/C ของคลื่นปรับฐาน) จะย่อยออกเป็น 5 คลื่นเสมอ ส่วนคลื่นปรับฐาน (2, 4 หรือ B) จะย่อยออกเป็น 3 คลื่นเสมอ ดังนั้นภายในคลื่นแรงส่งใหญ่หนึ่งชุด: คลื่น 1 จะเป็นโครงสร้างโมทีฟ 5 คลื่นในตัวเอง คลื่น 2 จะเป็นโครงสร้างคอเรคทีฟ 3 คลื่นในตัวเอง คลื่น 3 ก็เป็นโครงสร้างโมทีฟ 5 คลื่นอีกเช่นกัน ไล่แบบนี้ไปเรื่อยๆ — รูปแบบ 5-กับ-3 แบบเดียวกัน ซ้อนกันอยู่ทุกสเกล (ดูหัวข้อ "ระดับขนาดคลื่น" ด้านล่าง)' },

    s7h: { en:'The four corrective pattern types', th:'รูปแบบคลื่นปรับฐานสี่แบบ' },
    s7p: { en:'Not every correction looks the same. Elliott Wave groups them into four recurring shapes:',
           th:'คลื่นปรับฐานไม่ได้หน้าตาเหมือนกันทุกครั้ง Elliott Wave จัดกลุ่มรูปแบบที่เกิดซ้ำไว้สี่แบบ' },
    c1h: { en:'Zigzag (5-3-5)', th:'ซิกแซก (5-3-5)' },
    c1p: { en:'A sharp A-B-C where wave B is a weak, partial bounce — the most common shape for wave 2.',
           th:'A-B-C ที่ย่อแรง โดยคลื่น B เด้งกลับแค่บางส่วนและอ่อนแรง — รูปแบบที่พบบ่อยที่สุดของคลื่น 2' },
    c2h: { en:'Flat (3-3-5)', th:'แฟลต (3-3-5)' },
    c2p: { en:'A sideways A-B-C where wave B retraces most or all of wave A before wave C finishes the move — common for wave 4.',
           th:'A-B-C ที่ออกข้าง โดยคลื่น B ย่อกลับเกือบเท่าหรือเท่าคลื่น A ก่อนที่คลื่น C จะปิดจบการขยับ — พบบ่อยในคลื่น 4' },
    c3h: { en:'Triangle (3-3-3-3-3)', th:'แทรงเกิล (3-3-3-3-3)' },
    c3p: { en:'Five overlapping three-wave legs (A-B-C-D-E) that contract or expand sideways — this shape belongs to wave 4 (or wave B/X of a larger correction), never to wave 2.',
           th:'ห้าขาแบบสามคลื่นที่ซ้อนทับกัน (A-B-C-D-E) หดหรือขยายตัวออกข้าง — รูปแบบนี้เป็นของคลื่น 4 (หรือคลื่น B/X ของคลื่นปรับฐานที่ใหญ่กว่า) เท่านั้น ไม่ใช่ของคลื่น 2' },
    c4h: { en:'Combination', th:'คอมบิเนชัน' },
    c4p: { en:'Two or three of the simple patterns above joined end-to-end by a connecting "X" wave — labeled W-X-Y or W-X-Y-X-Z. A way for the market to correct sideways for longer than one simple pattern would.',
           th:'นำรูปแบบง่ายๆ ข้างต้นสองหรือสามแบบมาต่อกันด้วยคลื่นเชื่อม "X" — ใช้สัญลักษณ์ W-X-Y หรือ W-X-Y-X-Z เป็นวิธีที่ตลาดใช้ปรับฐานออกข้างนานกว่าที่รูปแบบง่ายแบบเดียวจะทำได้' },

    ruleTriH: { en:'The rule: wave 2 is never a triangle', th:'กฎ: คลื่น 2 ห้ามเป็นแทรงเกิล' },
    ruleTriP: { en:'Of the four shapes above, only a triangle is off-limits for wave 2 — a zigzag, flat, or combination are all fine there, but a triangle is reserved for wave 4 (or wave B/X within a larger correction). If a count\'s "wave 2" looks like a triangle, the count is wrong — relabel it.',
                th:'จากรูปแบบสี่แบบข้างต้น มีแค่แทรงเกิลเท่านั้นที่คลื่น 2 ห้ามเป็น — ซิกแซก แฟลต หรือคอมบิเนชันเป็นคลื่น 2 ได้ทั้งหมด แต่แทรงเกิลสงวนไว้สำหรับคลื่น 4 (หรือคลื่น B/X ภายในคลื่นปรับฐานที่ใหญ่กว่า) เท่านั้น ถ้าการนับคลื่นของใครมี "คลื่น 2" หน้าตาเป็นแทรงเกิล แสดงว่านับผิด — ต้องกลับไปแก้ป้ายใหม่' },

    /* Round X (#236): Fibonacci wave-5 price projection (distinct from the
       retracement-ratio table in the Guidelines section above) */
    s8h: { en:'Projecting a wave 5 price target', th:'การคำนวณเป้าหมายราคาคลื่น 5' },
    s8p: { en:'Beyond retracement ratios, analysts also use Fibonacci extension to project where wave 5 might end. Measure the price distance travelled from the start of wave 1 to the end of wave 3, then project that same distance — scaled by a Fibonacci ratio — forward from the end of wave 4. The result is a price target for the end of wave 5.',
           th:'นอกจากอัตราส่วนการย่อกลับ นักวิเคราะห์ยังใช้การขยายฟีโบนัชชีเพื่อคาดคะเนจุดสิ้นสุดของคลื่น 5 ด้วย วิธีคือวัดระยะราคาที่เคลื่อนที่จากจุดเริ่มต้นของคลื่น 1 ไปจนถึงจุดสิ้นสุดของคลื่น 3 แล้วนำระยะนั้นมาคูณด้วยอัตราส่วนฟีโบนัชชี แล้วลากต่อไปข้างหน้าจากจุดสิ้นสุดของคลื่น 4 ผลลัพธ์ที่ได้คือราคาเป้าหมายของจุดสิ้นสุดคลื่น 5' },
    s8f1: { en:'Measure the distance from the start of wave 1 to the end of wave 3 — call it the "1–3 move."', th:'วัดระยะจากจุดเริ่มต้นคลื่น 1 ไปจนถึงจุดสิ้นสุดคลื่น 3 — เรียกว่าระยะ "1–3"' },
    s8f2: { en:'Multiply that distance by a Fibonacci ratio — 61.8% is the most common, with 100% and 161.8% also watched.', th:'นำระยะนั้นมาคูณด้วยอัตราส่วนฟีโบนัชชี — ที่พบบ่อยที่สุดคือ 61.8% และยังมี 100% กับ 161.8% ที่ถูกจับตาด้วย' },
    s8f3: { en:'Project that scaled distance forward starting from the end of wave 4 — the resulting price is the wave 5 target.', th:'ลากระยะที่คูณแล้วไปข้างหน้า โดยเริ่มจากจุดสิ้นสุดคลื่น 4 — ราคาที่ได้คือเป้าหมายของคลื่น 5' },
    s8note: { en:'Like every ratio on this page, this is a zone to watch, not a guaranteed price — wave 5 often falls short of or overshoots the projection.',
              th:'เหมือนอัตราส่วนอื่นๆ ในหน้านี้ นี่คือโซนที่ต้องจับตา ไม่ใช่ราคาที่การันตี — คลื่น 5 มักจบสั้นกว่าหรือเกินเป้าหมายที่คำนวณไว้' },
    projHead1: { en:'Ratio', th:'อัตราส่วน' },
    projHead2: { en:'Meaning', th:'ความหมาย' }
  };

  var FIB = [
    { r:'23.6%', u:{ en:'A shallow pullback inside a strong trend', th:'การย่อตื้นๆ ภายในเทรนด์ที่แรง' } },
    { r:'38.2%', u:{ en:'A typical wave 2 or wave 4 retracement', th:'การย่อของคลื่น 2 หรือคลื่น 4 แบบทั่วไป' } },
    { r:'50.0%', u:{ en:'Not a Fibonacci ratio, but watched just as closely', th:'ไม่ใช่อัตราฟีโบนัชชีจริงๆ แต่ถูกจับตาไม่แพ้กัน' } },
    { r:'61.8%', u:{ en:'A deep wave 2 retracement, or a wave C equal to wave A', th:'การย่อลึกของคลื่น 2 หรือคลื่น C ที่เท่ากับคลื่น A' } },
    { r:'161.8%', u:{ en:'A common wave 3 or wave 5 extension target', th:'เป้าหมายขยายตัวที่พบบ่อยของคลื่น 3 หรือคลื่น 5' } },
    { r:'261.8%', u:{ en:'A stretched wave 3 in a fast-moving market', th:'คลื่น 3 ที่ยืดยาวในตลาดที่ขยับเร็ว' } }
  ];

  /* Round X (#236): projection ratios applied to the 1-3 distance, measured
     forward from the end of wave 4 -- a separate table from FIB above,
     which covers retracement (not extension/projection). */
  var PROJ = [
    { r:'61.8%', u:{ en:'The most common wave 5 projection target', th:'เป้าหมายคาดคะเนคลื่น 5 ที่พบบ่อยที่สุด' } },
    { r:'100%', u:{ en:'Wave 5 equal in size to the 1–3 move', th:'คลื่น 5 มีขนาดเท่ากับระยะ 1–3' } },
    { r:'161.8%', u:{ en:'A stretched wave 5 in a strongly trending market', th:'คลื่น 5 ที่ยืดยาวในตลาดที่มีเทรนด์แรง' } }
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

  /* Round X (#236): small schematic for the Fibonacci wave-5 projection --
     the "1-3 move" bracket on the left, the same measured distance scaled
     to 61.8% and projected forward (dashed) from the end of wave 4 on the
     right, landing on the wave 5 target. Illustrative only, like PTS/diagramHTML
     above -- not drawn to real price scale. */
  var PROJ_PTS = { p1:{x:40,y:138}, p3:{x:170,y:26}, p4:{x:230,y:66}, t5:{x:360,y:3} };
  function projDiagramHTML(){
    var P = PROJ_PTS;
    return (
      '<svg class="ewv-svg ewv-proj-svg" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">' +
        /* the realized 1 -> 3 -> 4 move */
        '<path d="M' + P.p1.x + ' ' + P.p1.y + ' L' + P.p3.x + ' ' + P.p3.y + ' L' + P.p4.x + ' ' + P.p4.y + '" fill="none" class="ewv-path"/>' +
        /* dashed projection from the end of wave 4 to the wave 5 target */
        '<path d="M' + P.p4.x + ' ' + P.p4.y + ' L' + P.t5.x + ' ' + P.t5.y + '" fill="none" class="ewv-proj-dash"/>' +
        /* left bracket: the measured 1-3 distance */
        '<path d="M14 ' + P.p1.y + ' h8 M14 ' + P.p3.y + ' h8 M18 ' + P.p1.y + ' V' + P.p3.y + '" class="ewv-proj-bracket"/>' +
        /* right bracket: that same distance, scaled, projected from wave 4 */
        '<path d="M378 ' + P.p4.y + ' h8 M378 ' + P.t5.y + ' h8 M382 ' + P.p4.y + ' V' + P.t5.y + '" class="ewv-proj-bracket"/>' +
        '<circle cx="' + P.p1.x + '" cy="' + P.p1.y + '" r="4.5" class="ewv-dot"/>' +
        '<circle cx="' + P.p3.x + '" cy="' + P.p3.y + '" r="4.5" class="ewv-dot"/>' +
        '<circle cx="' + P.p4.x + '" cy="' + P.p4.y + '" r="4.5" class="ewv-dot"/>' +
        '<circle cx="' + P.t5.x + '" cy="' + P.t5.y + '" r="4.5" class="ewv-dot ewv-proj-target"/>' +
        '<text x="' + P.p1.x + '" y="' + (P.p1.y + 16) + '" class="ewv-lab">1</text>' +
        '<text x="' + P.p3.x + '" y="' + (P.p3.y - 12) + '" class="ewv-lab">3</text>' +
        '<text x="' + P.p4.x + '" y="' + (P.p4.y + 16) + '" class="ewv-lab">4</text>' +
        '<text x="' + P.t5.x + '" y="' + (P.t5.y - 12) + '" class="ewv-lab ewv-proj-target-lab">5?</text>' +
      '</svg>'
    );
  }

  var sec = null;

  function bodyHTML(){
    /* Round X (#234): content-level admin gate, same pattern as part-63.js's
       QR Code page -- a second, independent layer on top of the route-level
       LOCKED_ROUTES/ADMIN_ONLY_ROUTES check in part-46.js, so even a direct
       hash navigation to #/elliott shows nothing useful to a non-admin. */
    if(window.__SPZ_TIER && window.__SPZ_TIER() !== 'full'){
      return '<div class="qrp-locked">' + esc(T(UI.adminOnly)) + '</div>';
    }

    var rules = [
      [UI.r1h, UI.r1p], [UI.r2h, UI.r2p], [UI.r3h, UI.r3p]
    ];
    var guides = [
      [UI.g1h, UI.g1p], [UI.g2h, UI.g2p], [UI.g3h, UI.g3p]
    ];
    var corrs = [
      [UI.c1h, UI.c1p], [UI.c2h, UI.c2p], [UI.c3h, UI.c3p], [UI.c4h, UI.c4p]
    ];
    var projSteps = [UI.s8f1, UI.s8f2, UI.s8f3];
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

      /* Round X (#235): subdivision + the four corrective pattern types,
         including the wave-2-never-a-triangle rule. Sits right after the
         three hard rules, before the (non-binding) guidelines section. */
      '<section class="ewv-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s6h)) + '</h3>' +
        '<p class="ewv-p">' + esc(T(UI.s6p)) + '</p>' +
        '<h3 class="ewv-h3 ewv-h3-sub">' + esc(T(UI.s7h)) + '</h3>' +
        '<p class="ewv-p">' + esc(T(UI.s7p)) + '</p>' +
        '<div class="ewv-corr">' + corrs.map(function(c, i){
          return '<div class="ewv-corr-c' + (i === 2 ? ' ewv-corr-tri' : '') + '"><b>' + esc(T(c[0])) + '</b><p>' + esc(T(c[1])) + '</p></div>';
        }).join('') + '</div>' +
        '<div class="ewv-rule ewv-rule-warn">' +
          '<span class="ewv-rule-n ewv-rule-n-x">✕</span>' +
          '<div><b>' + esc(T(UI.ruleTriH)) + '</b><p>' + esc(T(UI.ruleTriP)) + '</p></div>' +
        '</div>' +
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

      /* Round X (#236): Fibonacci wave-5 projection -- distinct technique
         from the retracement table just above (extension vs. retracement). */
      '<section class="ewv-sec">' +
        '<h3 class="ewv-h3">' + esc(T(UI.s8h)) + '</h3>' +
        '<p class="ewv-p">' + esc(T(UI.s8p)) + '</p>' +
        '<div class="ewv-proj">' +
          '<div class="ewv-proj-diagram">' + projDiagramHTML() + '</div>' +
          '<ol class="ewv-proj-steps">' + projSteps.map(function(s, i){
            return '<li><span class="ewv-proj-n">' + (i + 1) + '</span><span>' + esc(T(s)) + '</span></li>';
          }).join('') + '</ol>' +
        '</div>' +
        '<table class="ewv-fib"><thead><tr><th>' + esc(T(UI.projHead1)) + '</th><th>' + esc(T(UI.projHead2)) + '</th></tr></thead><tbody>' +
          PROJ.map(function(p){ return '<tr><td class="ewv-fib-r">' + esc(p.r) + '</td><td>' + esc(T(p.u)) + '</td></tr>'; }).join('') +
        '</tbody></table>' +
        '<p class="ewv-cap">' + esc(T(UI.s8note)) + '</p>' +
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
