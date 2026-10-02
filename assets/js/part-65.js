/* ===========================================================================
   Round W (#231): "Elliott Wave Classroom" -- a new teaching page explaining
   Elliott Wave theory at a beginner level.

   Round X (#235/#236): added wave subdivision + the four corrective pattern
   types, and the Fibonacci wave-5 projection technique.

   Round Y (#243): full redesign -- rebuilt around a hierarchical,
   infographic-led master-detail layout instead of one long scroll. A small
   clickable "map" diagram at the top of Overview cascades Motive vs.
   Corrective down to every named shape (Impulse / Diagonal -- Leading /
   Diagonal -- Ending under Motive; Zigzag / Flat / Triangle / Combination
   under Corrective), and the same choices live permanently in a left-hand
   index -- same visual shell (.gl-shell/.gl-nav/.gl-detail, part-01.css)
   the Glossary page already uses, so this reads as the same kind of page as
   its "learn" nav neighbors, not a new UI pattern. Every leaf gets its own
   small hand-labeled SVG, including the two diagonal variants (contracting
   vs. expanding) and all four corrective shapes -- nothing is still
   text-only. All of the original content survives, just reorganized under
   16 nodes instead of one scroll: Overview, Motive (+3 children), Corrective
   (+4 children), Wave Degree, Fibonacci Tools (+2 children), Common
   Mistakes, Further Reading.

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
    lede: { en:'A beginner-level map of how Elliott Wave analysts read a price chart. Pick a branch below, or use the index on the left. Educational only: this describes a way of reading a chart, not a prediction of what any chart will do next.',
            th:'แผนที่ระดับเริ่มต้นของวิธีที่นักวิเคราะห์ Elliott Wave อ่านกราฟราคา เลือกกิ่งด้านล่าง หรือใช้เมนูด้านซ้ายก็ได้ เป็นสื่อการเรียนรู้เท่านั้น นี่คือวิธีอ่านกราฟแบบหนึ่ง ไม่ใช่การพยากรณ์ว่ากราฟตัวไหนจะไปทางไหนต่อ' },

    adminOnly: { en:'Admins only.', th:'เฉพาะแอดมินเท่านั้น' },
    note: { en:'Educational only — not investment advice, a signal, or a recommendation. Nothing here is affiliated with any broker, exchange or issuer.',
            th:'เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน สัญญาณซื้อขาย หรือการชี้ชวน ไม่มีความเกี่ยวข้องกับโบรกเกอร์ ตลาดหลักทรัพย์ หรือผู้ออกหลักทรัพย์ใดๆ' },

    /* ---- nav labels / detail titles (also doubles as thumbnail captions) ---- */
    navOverview: { en:'Overview', th:'ภาพรวม' },
    navGroupMotive: { en:'Motive waves', th:'คลื่นโมทีฟ' },
    navGroupCorrective: { en:'Corrective waves', th:'คลื่นคอเรคทีฟ' },
    navGroupFib: { en:'Fibonacci tools', th:'เครื่องมือฟีโบนัชชี' },
    navImpulse: { en:'Impulse', th:'อิมพัลส์' },
    navDiagLead: { en:'Diagonal — Leading', th:'ไดแอกอนัล — ลีดดิ้ง' },
    navDiagEnd: { en:'Diagonal — Ending', th:'ไดแอกอนัล — เอนดิ้ง' },
    navZigzag: { en:'Zigzag (5-3-5)', th:'ซิกแซก (5-3-5)' },
    navFlat: { en:'Flat (3-3-5)', th:'แฟลต (3-3-5)' },
    navTriangle: { en:'Triangle (3-3-3-3-3)', th:'แทรงเกิล (3-3-3-3-3)' },
    navCombination: { en:'Combination', th:'คอมบิเนชัน' },
    navDegree: { en:'Wave degree', th:'ระดับขนาดคลื่น' },
    navFibRetrace: { en:'Retracement & guidelines', th:'การย่อกลับและแนวทาง' },
    navFibProj: { en:'Wave 5 projection', th:'คาดคะเนคลื่น 5' },
    navMistakes: { en:'Common mistakes', th:'ข้อผิดพลาดที่พบบ่อย' },
    navFurther: { en:'Further reading', th:'อ่านเพิ่มเติม' },

    /* ---- the clickable cascade "map" on Overview ---- */
    mapLede: { en:'Tap a branch to jump straight to it — the same choices are always in the list on the left.',
               th:'แตะกิ่งไหนก็ได้เพื่อข้ามไปดูเลย — ตัวเลือกเดียวกันนี้อยู่ในเมนูด้านซ้ายตลอดเวลา' },
    mapRoot: { en:'ELLIOTT WAVE', th:'ELLIOTT WAVE' },
    mapMotiveSub: { en:'With the trend · 5 waves', th:'ไปตามเทรนด์ · 5 คลื่น' },
    mapCorrectiveSub: { en:'Against the trend · 3+ waves', th:'สวนเทรนด์ · 3 คลื่นขึ้นไป' },

    /* ---- the basic pattern (Overview) ---- */
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
    r3p: { en:'In most markets, wave 4\'s low must stay above wave 1\'s high (for an uptrend) — this is the rule almost every bad count breaks first. The one named exception is a Diagonal (see Motive waves), where wave 4 is allowed to overlap wave 1.',
           th:'ในตลาดส่วนใหญ่ จุดต่ำของคลื่น 4 ต้องอยู่สูงกว่าจุดสูงของคลื่น 1 (กรณีเทรนด์ขึ้น) นี่คือกฎที่การนับคลื่นผิดๆ มักละเมิดเป็นข้อแรก ข้อยกเว้นที่มีชื่อเรียกเดียวคือไดแอกอนัล (ดูหัวข้อคลื่นโมทีฟ) ซึ่งคลื่น 4 ได้รับอนุญาตให้เข้าไปในช่วงคลื่น 1 ได้' },

    /* ---- Motive group ---- */
    motiveIntroP: { en:'Any wave numbered 1, 3 or 5 inside an impulse — or lettered A or C inside most corrections — pushes in the direction of the larger trend, and always takes one of exactly two shapes: a clean Impulse, or the rarer, more unusual Diagonal.',
                    th:'คลื่นที่มีเลข 1, 3 หรือ 5 ในคลื่นแรงส่ง — หรือตัวอักษร A หรือ C ในคลื่นปรับฐานส่วนใหญ่ — คือคลื่นที่ไปตามเทรนด์ใหญ่ และจะมีรูปแบบใดรูปแบบหนึ่งจากสองแบบนี้เท่านั้น คืออิมพัลส์แบบตรงไปตรงมา หรือไดแอกอนัลที่พบน้อยกว่าและแปลกตากว่า' },
    impulseP: { en:'The standard, textbook motive shape, and the one assumed everywhere else on this page unless a diagonal is named specifically: five sub-waves (1-2-3-4-5) where waves 1, 3 and 5 push with the trend and waves 2 and 4 pause against it, obeying all three hard rules under Overview.',
                th:'รูปแบบโมทีฟมาตรฐานตามตำรา และเป็นรูปแบบที่หน้านี้อ้างอิงโดยปริยายทุกที่ ยกเว้นตอนพูดถึงไดแอกอนัลโดยเฉพาะ: ห้าคลื่นย่อย (1-2-3-4-5) ที่คลื่น 1, 3 และ 5 ไปตามเทรนด์ ส่วนคลื่น 2 และ 4 คือจังหวะพักสวนทาง และต้องเป็นไปตามกฎหลักสามข้อในหัวข้อภาพรวมทุกข้อ' },
    diagIntro: { en:'A diagonal still counts 1-2-3-4-5, but its two guiding trendlines — one through the ends of waves 2 and 4, one through the ends of waves 1 and 3 — converge (far more common) or occasionally diverge, rather than running parallel like an impulse\'s. It is also the one named exception to Overview\'s Rule 3: inside a diagonal, wave 4 is allowed to overlap wave 1\'s price territory.',
                 th:'ไดแอกอนัลยังนับ 1-2-3-4-5 เหมือนเดิม แต่เส้นแนวโน้มสองเส้นที่กำกับรูปแบบ — เส้นหนึ่งลากผ่านจุดสิ้นสุดคลื่น 2 กับ 4 อีกเส้นลากผ่านจุดสิ้นสุดคลื่น 1 กับ 3 — จะลู่เข้าหากัน (พบบ่อยกว่ามาก) หรือบางครั้งลู่ออกจากกัน แทนที่จะวิ่งขนานกันแบบอิมพัลส์ และนี่คือข้อยกเว้นที่มีชื่อเรียกเดียวต่อกฎข้อ 3 ในหัวข้อภาพรวม: ภายในไดแอกอนัล คลื่น 4 ได้รับอนุญาตให้เข้าไปในช่วงราคาของคลื่น 1 ได้' },
    diagLeadP: { en:'A Leading Diagonal sits in the wave 1 (or wave A) position — the very first leg of a brand-new move, often while the market is still shaking off the previous trend and travels in short, overlapping steps before the real trend takes hold.',
                 th:'ลีดดิ้งไดแอกอนัลอยู่ในตำแหน่งคลื่น 1 (หรือคลื่น A) — ขาแรกสุดของการขยับรอบใหม่ มักเกิดขณะตลาดยังสะบัดเทรนด์เก่าทิ้งไม่หมด และขยับเป็นช่วงสั้นๆ ซ้อนทับกัน ก่อนที่เทรนด์จริงจะเริ่มเกาะ' },
    diagEndP: { en:'An Ending Diagonal sits in the wave 5 (or wave C) position — the last leg of a move, and usually a sign the trend is running low on momentum, "wedging" to a point right before it reverses.',
                th:'เอนดิ้งไดแอกอนัลอยู่ในตำแหน่งคลื่น 5 (หรือคลื่น C) — ขาสุดท้ายของการขยับ และมักเป็นสัญญาณว่าเทรนด์กำลังหมดแรง บีบตัวแคบลงเหมือนรูปลิ่มก่อนที่จะกลับตัว' },
    contractingLbl: { en:'Contracting — the common shape', th:'คอนแทร็กติ้ง — รูปแบบที่พบบ่อย' },
    expandingLbl: { en:'Expanding — rare', th:'เอ็กซ์แพนดิ้ง — พบน้อย' },

    /* ---- Corrective group (Round X content, reused) ---- */
    s7p: { en:'Not every correction looks the same. Elliott Wave groups them into four recurring shapes — tap one below:',
           th:'คลื่นปรับฐานไม่ได้หน้าตาเหมือนกันทุกครั้ง Elliott Wave จัดกลุ่มรูปแบบที่เกิดซ้ำไว้สี่แบบ — แตะเลือกดูด้านล่าง' },
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

    /* ---- Wave Degree (subdivision + the named scale) ---- */
    s6h: { en:'Subdivision — every wave is built from smaller waves', th:'การย่อยคลื่น — ทุกคลื่นประกอบขึ้นจากคลื่นย่อย' },
    s6p: { en:'Zoom into any single wave and it turns out to be a complete pattern of its own, one degree smaller. A motive wave (1, 3, 5, or an A/C of a correction) always subdivides into 5 sub-waves; a corrective wave (2, 4, or B) always subdivides into 3. So inside a larger impulse: wave 1 is itself a 5-wave motive structure, wave 2 is itself a 3-wave corrective structure, wave 3 is a 5-wave motive structure, and so on — the same 5-and-3 shape, nested at every scale.',
          th:'ลองซูมเข้าไปในคลื่นใดคลื่นหนึ่ง จะพบว่ามันคือรูปแบบคลื่นสมบูรณ์ในตัวเอง แค่ขนาดเล็กลงไปอีกขั้น คลื่นแรงส่ง (1, 3, 5 หรือ A/C ของคลื่นปรับฐาน) จะย่อยออกเป็น 5 คลื่นเสมอ ส่วนคลื่นปรับฐาน (2, 4 หรือ B) จะย่อยออกเป็น 3 คลื่นเสมอ ดังนั้นภายในคลื่นแรงส่งใหญ่หนึ่งชุด: คลื่น 1 จะเป็นโครงสร้างโมทีฟ 5 คลื่นในตัวเอง คลื่น 2 จะเป็นโครงสร้างคอเรคทีฟ 3 คลื่นในตัวเอง คลื่น 3 ก็เป็นโครงสร้างโมทีฟ 5 คลื่นอีกเช่นกัน ไล่แบบนี้ไปเรื่อยๆ — รูปแบบ 5-กับ-3 แบบเดียวกัน ซ้อนกันอยู่ทุกสเกล' },
    s4h: { en:'The named scale — keeping track of which chart a count belongs to', th:'ชื่อระดับขนาด — ไว้ติดตามว่าการนับคลื่นอยู่กับกราฟไหน' },
    s4p: { en:'Analysts name the scales (from largest to smallest: Grand Supercycle, Supercycle, Cycle, Primary, Intermediate, Minor, Minute, Minuette, Sub-Minuette) mainly to keep track of which chart timeframe a count belongs to — a Minor-degree wave 3 on a daily chart and a Primary-degree wave 3 on a monthly chart are the same shape, just zoomed differently.',
          th:'นักวิเคราะห์ตั้งชื่อระดับขนาด (จากใหญ่สุดไปเล็กสุด) ไว้หลักๆ เพื่อติดตามว่าการนับคลื่นนั้นอยู่กับกราฟช่วงเวลาไหน — คลื่น 3 ระดับเล็กบนกราฟรายวัน กับคลื่น 3 ระดับใหญ่บนกราฟรายเดือน คือรูปร่างเดียวกัน แค่มองในสเกลต่างกัน' },

    /* ---- Fibonacci Tools group ---- */
    fibGroupP: { en:'Two different uses of the same ratios: retracement measures how deep a pullback goes against the move it is correcting; projection measures how far the next motive wave is likely to extend. Pick one below.',
                 th:'การใช้อัตราส่วนเดียวกันในสองรูปแบบที่ต่างกัน: การย่อกลับ (retracement) วัดว่าคลื่นปรับฐานย่อลงไปลึกแค่ไหนเมื่อเทียบกับคลื่นที่มันปรับฐานอยู่ ส่วนการคาดคะเน (projection) วัดว่าคลื่นโมทีฟถัดไปน่าจะยืดไปได้ไกลแค่ไหน เลือกดูอย่างใดอย่างหนึ่งด้านล่างนี้' },
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

    s8p: { en:'Beyond retracement ratios, analysts also use Fibonacci extension to project where wave 5 might end. Measure the price distance travelled from the start of wave 1 to the end of wave 3, then project that same distance — scaled by a Fibonacci ratio — forward from the end of wave 4. The result is a price target for the end of wave 5.',
           th:'นอกจากอัตราส่วนการย่อกลับ นักวิเคราะห์ยังใช้การขยายฟีโบนัชชีเพื่อคาดคะเนจุดสิ้นสุดของคลื่น 5 ด้วย วิธีคือวัดระยะราคาที่เคลื่อนที่จากจุดเริ่มต้นของคลื่น 1 ไปจนถึงจุดสิ้นสุดของคลื่น 3 แล้วนำระยะนั้นมาคูณด้วยอัตราส่วนฟีโบนัชชี แล้วลากต่อไปข้างหน้าจากจุดสิ้นสุดของคลื่น 4 ผลลัพธ์ที่ได้คือราคาเป้าหมายของจุดสิ้นสุดคลื่น 5' },
    s8f1: { en:'Measure the distance from the start of wave 1 to the end of wave 3 — call it the "1–3 move."', th:'วัดระยะจากจุดเริ่มต้นคลื่น 1 ไปจนถึงจุดสิ้นสุดคลื่น 3 — เรียกว่าระยะ "1–3"' },
    s8f2: { en:'Multiply that distance by a Fibonacci ratio — 61.8% is the most common, with 100% and 161.8% also watched.', th:'นำระยะนั้นมาคูณด้วยอัตราส่วนฟีโบนัชชี — ที่พบบ่อยที่สุดคือ 61.8% และยังมี 100% กับ 161.8% ที่ถูกจับตาด้วย' },
    s8f3: { en:'Project that scaled distance forward starting from the end of wave 4 — the resulting price is the wave 5 target.', th:'ลากระยะที่คูณแล้วไปข้างหน้า โดยเริ่มจากจุดสิ้นสุดคลื่น 4 — ราคาที่ได้คือเป้าหมายของคลื่น 5' },
    s8note: { en:'Like every ratio on this page, this is a zone to watch, not a guaranteed price — wave 5 often falls short of or overshoots the projection.',
              th:'เหมือนอัตราส่วนอื่นๆ ในหน้านี้ นี่คือโซนที่ต้องจับตา ไม่ใช่ราคาที่การันตี — คลื่น 5 มักจบสั้นกว่าหรือเกินเป้าหมายที่คำนวณไว้' },
    projHead1: { en:'Ratio', th:'อัตราส่วน' },
    projHead2: { en:'Meaning', th:'ความหมาย' },

    /* ---- Common Mistakes ---- */
    w1: { en:'The count is subjective. Give the same chart to five Elliotticians and it is common to get more than one valid-looking count back — the rules narrow the possibilities, they do not pick a single answer.',
          th:'การนับคลื่นเป็นเรื่องตีความ เอากราฟเดียวกันให้คนนับคลื่นห้าคน มักได้คำตอบที่ดูสมเหตุสมผลมากกว่าหนึ่งแบบ — กฎช่วยตัดตัวเลือกที่เป็นไปไม่ได้ออก แต่ไม่ได้ฟันธงคำตอบเดียว' },
    w2: { en:'It is easy to re-label a wrong count after the fact ("that was actually a wave 4, not a wave 2") and feel like the framework predicted the move. That is hindsight, not a forecast.',
          th:'ง่ายมากที่จะย้อนไปเปลี่ยนป้ายคลื่นที่นับผิดในตอนหลัง ("อ้อ นั่นคือคลื่น 4 ไม่ใช่คลื่น 2") แล้วรู้สึกว่าทฤษฎีนี้ทำนายถูก นั่นคือการมองย้อนหลัง ไม่ใช่การพยากรณ์' },
    w3: { en:'The guidelines under Fibonacci Tools are not rules — treating a Fibonacci zone or a channel line as a guaranteed turning point, rather than one input among many, is the single most common misuse of this framework.',
          th:'แนวทางในหัวข้อเครื่องมือฟีโบนัชชีไม่ใช่กฎ — การเชื่อว่าโซนฟีโบนัชชีหรือเส้นกรอบแนวโน้มคือจุดเปลี่ยนที่แน่นอน ทั้งที่มันเป็นแค่ปัจจัยหนึ่งในหลายปัจจัย คือความเข้าใจผิดที่พบบ่อยที่สุดของทฤษฎีนี้' },
    w4: { en:'Nothing on this page is a signal to buy or sell anything. Wave counts are one lens for reading a chart\'s structure, not a system with a verified track record of its own.',
          th:'ไม่มีอะไรในหน้านี้เป็นสัญญาณให้ซื้อหรือขาย การนับคลื่นเป็นมุมมองหนึ่งสำหรับอ่านโครงสร้างกราฟ ไม่ใช่ระบบที่มีสถิติผลงานที่พิสูจน์แล้วด้วยตัวเอง' },

    /* ---- Further Reading ---- */
    furtherP: { en:'This page summarises the public analytical framework Ralph Nelson Elliott first published in the 1930s. For readers who want to go deeper, Elliott Wave International is one well-known commercial education provider that publishes extensively on this subject — mentioned here purely as a citation for further study.',
                th:'หน้านี้สรุปแนวคิดเชิงวิเคราะห์สาธารณะที่ราล์ฟ เนลสัน เอลเลียต เผยแพร่ครั้งแรกในยุค 1930 สำหรับผู้อ่านที่อยากศึกษาต่อ Elliott Wave International คือผู้ให้บริการการศึกษาเชิงพาณิชย์รายหนึ่งที่เป็นที่รู้จักและเผยแพร่เนื้อหาด้านนี้อย่างกว้างขวาง — กล่าวถึงที่นี่เพียงเพื่อการอ้างอิงให้ไปศึกษาต่อเท่านั้น' },
    furtherDisc: { en:'SPACEZ TERMINAL is not affiliated with, sponsored by, or endorsed by Elliott Wave International or any similar provider, and this page is not their material — it is this site\'s own summary of a public framework.',
                   th:'SPACEZ TERMINAL ไม่มีความเกี่ยวข้อง ไม่ได้รับการสนับสนุน และไม่ได้รับการรับรองจาก Elliott Wave International หรือผู้ให้บริการรายใดที่คล้ายกัน และหน้านี้ไม่ใช่เนื้อหาของบริษัทดังกล่าว — เป็นบทสรุปแนวคิดสาธารณะที่เว็บนี้เขียนขึ้นเอง' },
    furtherLink: { en:'elliottwave.com (opens in a new tab)', th:'elliottwave.com (เปิดแท็บใหม่)' },

    /* ---- Round Z (#249): a second Further Reading box linking to a real
       analysis on this site ---- */
    furtherExampleP: { en:'Want to see wave analysis applied to a real chart?', th:'อยากดูตัวอย่างการวิเคราะห์คลื่นกับกราฟจริงไหม' },
    furtherExampleLink: { en:'See a real analysis example →', th:'ดูตัวอย่างการวิเคราะห์จริง →' },
    furtherExampleNote: { en:'Opens the Asset Analysis Log on this site — signing in (LINE or Telegram) is required to view it.',
                           th:'เปิดไปหน้าบทวิเคราะห์สินทรัพย์ของเว็บนี้ — ต้องเข้าสู่ระบบ (LINE หรือ Telegram) ก่อนถึงจะดูได้' },

    /* ---- Round Z (#246): right/wrong example captions for the three hard
       rules ---- */
    r1okCap: { en:'Correct — wave 2 stays above the start of wave 1.', th:'ถูกต้อง — คลื่น 2 ยังอยู่สูงกว่าจุดเริ่มต้นของคลื่น 1' },
    r1badCap: { en:'Wrong — wave 2 breaks below the start of wave 1.', th:'ผิด — คลื่น 2 ทะลุลงไปใต้จุดเริ่มต้นของคลื่น 1' },
    r2okCap: { en:'Correct — wave 3 is the longest of waves 1, 3 and 5.', th:'ถูกต้อง — คลื่น 3 ยาวที่สุดเมื่อเทียบกับคลื่น 1 และ 5' },
    r2badCap: { en:'Wrong — wave 1 and wave 5 are both longer than wave 3.', th:'ผิด — คลื่น 1 และคลื่น 5 ยาวกว่าคลื่น 3 ทั้งคู่' },
    r3okCap: { en:'Correct — wave 4\'s low stays above wave 1\'s high (dashed line).', th:'ถูกต้อง — จุดต่ำของคลื่น 4 ยังอยู่สูงกว่าจุดสูงของคลื่น 1 (เส้นประ)' },
    r3badCap: { en:'Wrong — wave 4 dips below wave 1\'s high, overlapping its territory.', th:'ผิด — คลื่น 4 ลงไปต่ำกว่าจุดสูงของคลื่น 1 เข้าไปในช่วงราคาของมัน' },

    /* ---- Round Z (#248): sub-wave-count captions for the corrective shapes ---- */
    c1cap: { en:'Each leg\'s sub-wave count is shown in parentheses — a 5-3-5 structure.', th:'ตัวเลขในวงเล็บคือจำนวนคลื่นย่อยของแต่ละขา — โครงสร้าง 5-3-5' },
    c2cap: { en:'Each leg\'s sub-wave count is shown in parentheses — a 3-3-5 structure.', th:'ตัวเลขในวงเล็บคือจำนวนคลื่นย่อยของแต่ละขา — โครงสร้าง 3-3-5' },
    c3cap: { en:'Each of the five legs is itself a 3-wave move — a 3-3-3-3-3 structure, shown in parentheses.', th:'ทั้งห้าขาแต่ละขาคือคลื่นย่อยแบบ 3 คลื่นในตัวเอง — โครงสร้าง 3-3-3-3-3 ตามที่แสดงในวงเล็บ' },
    c4cap: { en:'Each leg (W, Y, and Z if present) is itself a complete zigzag, flat, or triangle — so its sub-wave count depends on which shape it takes.', th:'แต่ละขา (W, Y และ Z ถ้ามี) คือซิกแซก แฟลต หรือแทรงเกิลที่สมบูรณ์ในตัวเอง ดังนั้นจำนวนคลื่นย่อยของมันจึงขึ้นอยู่กับรูปแบบที่มันเป็น' }
  };

  var RULES = [ [UI.r1h, UI.r1p], [UI.r2h, UI.r2p], [UI.r3h, UI.r3p] ];
  var GUIDES = [ [UI.g1h, UI.g1p], [UI.g2h, UI.g2p], [UI.g3h, UI.g3p] ];
  var WARNS = [UI.w1, UI.w2, UI.w3, UI.w4];

  var FIB = [
    { r:'23.6%', u:{ en:'A shallow pullback inside a strong trend', th:'การย่อตื้นๆ ภายในเทรนด์ที่แรง' } },
    { r:'38.2%', u:{ en:'A typical wave 2 or wave 4 retracement', th:'การย่อของคลื่น 2 หรือคลื่น 4 แบบทั่วไป' } },
    { r:'50.0%', u:{ en:'Not a Fibonacci ratio, but watched just as closely', th:'ไม่ใช่อัตราฟีโบนัชชีจริงๆ แต่ถูกจับตาไม่แพ้กัน' } },
    { r:'61.8%', u:{ en:'A deep wave 2 retracement, or a wave C equal to wave A', th:'การย่อลึกของคลื่น 2 หรือคลื่น C ที่เท่ากับคลื่น A' } },
    { r:'161.8%', u:{ en:'A common wave 3 or wave 5 extension target', th:'เป้าหมายขยายตัวที่พบบ่อยของคลื่น 3 หรือคลื่น 5' } },
    { r:'261.8%', u:{ en:'A stretched wave 3 in a fast-moving market', th:'คลื่น 3 ที่ยืดยาวในตลาดที่ขยับเร็ว' } }
  ];
  var PROJ = [
    { r:'61.8%', u:{ en:'The most common wave 5 projection target', th:'เป้าหมายคาดคะเนคลื่น 5 ที่พบบ่อยที่สุด' } },
    { r:'100%', u:{ en:'Wave 5 equal in size to the 1–3 move', th:'คลื่น 5 มีขนาดเท่ากับระยะ 1–3' } },
    { r:'161.8%', u:{ en:'A stretched wave 5 in a strongly trending market', th:'คลื่น 5 ที่ยืดยาวในตลาดที่มีเทรนด์แรง' } }
  ];

  /* --------------------------------------------------------------------
     SVG helpers -- every diagram on this page is illustrative/hand-labeled
     only, not drawn to real price scale (matching the original page's own
     diagram, kept below as diagramHTML()/PTS). waveSvg() is the shared
     path+dot+label renderer every per-shape function below calls with its
     own point list, so adding a new shape never means re-deriving the SVG
     plumbing. A point with lab:'' still shapes the path but gets no dot or
     label -- used for the unlabeled interior bends of the Combination
     diagram. */
  function waveSvg(pts, viewBox, extra){
    var path = pts.map(function(p, i){ return (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y; }).join(' ');
    var dots = pts.filter(function(p){ return p.lab !== ''; }).map(function(p){
      /* Round Z (#248): anchored to the FIRST character only -- a plain
         numbered point ('0','1'...'5') is still neon, but a lettered point
         that now carries a sub-wave count in parentheses (e.g. 'A(5)',
         'E(3)') must stay amber; testing for a digit ANYWHERE in the label
         used to misclassify those as numeric because of the digit inside
         the parens. */
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4.5" class="ewv-dot' + (/^[0-9]/.test(p.lab) ? '' : ' ewv-dot-ab') + '"/>' +
        '<text x="' + p.x + '" y="' + (p.y - 12) + '" class="ewv-lab">' + esc(p.lab) + '</text>';
    }).join('');
    return '<svg class="ewv-svg" viewBox="' + viewBox + '" preserveAspectRatio="xMidYMid meet">' + (extra || '') +
      '<path d="' + path + '" fill="none" class="ewv-path"/>' + dots + '</svg>';
  }

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
  /* Overview: the full 0-5-A-B-C textbook chart, unchanged from the
     original single-page version. */
  function diagramHTML(){ return waveSvg(PTS, '0 0 586 200'); }
  /* Motive > Impulse: just the motive leg of the same picture, re-framed
     to its own tighter viewBox instead of leaving dead space on the right. */
  function impulseDiagramHTML(){ return waveSvg(PTS.slice(0, 6), '0 0 440 200'); }

  /* Motive > Diagonal: a 5-point wedge between two guide trendlines that
     converge (the common "contracting" shape) or, rarely, diverge
     ("expanding") -- the overlap between points 1 and 4 is the point: a
     diagonal is the one motive shape where that is allowed. */
  function wedgeDiagramHTML(expanding){
    var pts = expanding
      ? [{x:10,y:90,lab:'0'},{x:70,y:60,lab:'1'},{x:110,y:115,lab:'2'},{x:170,y:35,lab:'3'},{x:205,y:150,lab:'4'},{x:260,y:20,lab:'5'}]
      : [{x:10,y:140,lab:'0'},{x:70,y:34,lab:'1'},{x:110,y:100,lab:'2'},{x:170,y:55,lab:'3'},{x:205,y:120,lab:'4'},{x:260,y:85,lab:'5'}];
    var guideA = expanding ? 'M10 90 L300 10' : 'M10 20 L300 90';
    var guideB = expanding ? 'M10 90 L300 170' : 'M10 160 L300 90';
    var guides = '<path d="' + guideA + '" class="ewv-guide-line"/><path d="' + guideB + '" class="ewv-guide-line"/>';
    return waveSvg(pts, '0 0 310 180', guides);
  }

  /* Corrective > Zigzag (5-3-5): sharp A-B-C, B a weak partial bounce.
     Round Z (#248): labels now carry each leg's sub-wave count. */
  function zigzagDiagramHTML(){
    return waveSvg([{x:10,y:40,lab:'0'},{x:95,y:150,lab:'A(5)'},{x:150,y:95,lab:'B(3)'},{x:230,y:180,lab:'C(5)'}], '0 0 260 200');
  }
  /* Corrective > Flat (3-3-5): sideways A-B-C, B retraces almost all of A.
     Round Z (#248): labels now carry each leg's sub-wave count. */
  function flatDiagramHTML(){
    return waveSvg([{x:10,y:50,lab:'0'},{x:95,y:145,lab:'A(3)'},{x:170,y:60,lab:'B(3)'},{x:255,y:170,lab:'C(5)'}], '0 0 280 200');
  }
  /* Corrective > Triangle (3-3-3-3-3): 5 contracting legs A-B-C-D-E.
     Round Z (#247): she explicitly flagged the old coordinates as wrong --
     they drifted sideways/diagonally like a wedge instead of reading as a
     triangle. Redesigned so every leg oscillates up/down around a stable
     mid-level (~y=115) with the swing amplitude shrinking leg over leg
     (A-B the widest swing, D-E the narrowest), and the two guide lines
     (through B-D and through A-C, each extended rightward) visibly
     converge toward each other on the right instead of running apart.
     Round Z (#248): labels now also carry each leg's sub-wave count. */
  function triangleDiagramHTML(){
    var pts = [
      {x:15,  y:112, lab:''},
      {x:70,  y:168, lab:'A(3)'},
      {x:120, y:62,  lab:'B(3)'},
      {x:165, y:140, lab:'C(3)'},
      {x:205, y:78,  lab:'D(3)'},
      {x:245, y:118, lab:'E(3)'}
    ];
    var guides = '<path d="M55 170 L270 115" class="ewv-guide-line"/><path d="M100 62 L270 92" class="ewv-guide-line"/>';
    return waveSvg(pts, '0 0 300 185', guides);
  }
  /* Corrective > Combination (W-X-Y): two simple corrections joined by a
     connecting X wave -- only the three named joints (0, W, X, Y) are
     labeled; the unlabeled points just shape each leg's own zigzag. */
  function combinationDiagramHTML(){
    var pts = [
      {x:10,y:60,lab:'0'}, {x:55,y:115,lab:''}, {x:85,y:90,lab:''}, {x:115,y:130,lab:'W'},
      {x:160,y:55,lab:'X'}, {x:205,y:100,lab:''}, {x:235,y:75,lab:''}, {x:270,y:115,lab:'Y'}
    ];
    return waveSvg(pts, '0 0 300 180');
  }

  /* Fibonacci Tools > Wave 5 Projection -- unchanged from the original
     Round X (#236) schematic. */
  var PROJ_PTS = { p1:{x:40,y:138}, p3:{x:170,y:26}, p4:{x:230,y:66}, t5:{x:360,y:3} };
  function projDiagramHTML(){
    var P = PROJ_PTS;
    return (
      '<svg class="ewv-svg ewv-proj-svg" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">' +
        '<path d="M' + P.p1.x + ' ' + P.p1.y + ' L' + P.p3.x + ' ' + P.p3.y + ' L' + P.p4.x + ' ' + P.p4.y + '" fill="none" class="ewv-path"/>' +
        '<path d="M' + P.p4.x + ' ' + P.p4.y + ' L' + P.t5.x + ' ' + P.t5.y + '" fill="none" class="ewv-proj-dash"/>' +
        '<path d="M14 ' + P.p1.y + ' h8 M14 ' + P.p3.y + ' h8 M18 ' + P.p1.y + ' V' + P.p3.y + '" class="ewv-proj-bracket"/>' +
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

  /* Round Z (#246): small correct-vs-wrong mini diagrams for each of the
     three hard rules under Overview. Each pair shares the same illustrative
     scale as the rest of the page (not drawn to real price); a dashed
     horizontal guide line marks the exact boundary level the rule is
     about, so the "correct" diagram visibly respects it and the "wrong"
     one visibly crosses it. */
  function rule1OkSvg(){
    var pts = [{x:10,y:140,lab:'0'},{x:70,y:60,lab:'1'},{x:120,y:100,lab:'2'},{x:175,y:30,lab:'3'}];
    var guide = '<path d="M5 140 L190 140" class="ewv-guide-line"/>';
    return waveSvg(pts, '0 0 195 160', guide);
  }
  function rule1BadSvg(){
    var pts = [{x:10,y:140,lab:'0'},{x:70,y:60,lab:'1'},{x:120,y:158,lab:'2'}];
    var guide = '<path d="M5 140 L190 140" class="ewv-guide-line"/>';
    return waveSvg(pts, '0 0 195 170', guide);
  }
  function rule2OkSvg(){
    var pts = [{x:10,y:150,lab:'0'},{x:55,y:112,lab:'1'},{x:80,y:132,lab:'2'},{x:150,y:42,lab:'3'},{x:175,y:70,lab:'4'},{x:225,y:15,lab:'5'}];
    return waveSvg(pts, '0 0 230 170');
  }
  function rule2BadSvg(){
    var pts = [{x:10,y:150,lab:'0'},{x:55,y:72,lab:'1'},{x:80,y:102,lab:'2'},{x:125,y:62,lab:'3'},{x:150,y:92,lab:'4'},{x:225,y:12,lab:'5'}];
    return waveSvg(pts, '0 0 230 170');
  }
  function rule3OkSvg(){
    var pts = [{x:10,y:150,lab:'0'},{x:60,y:70,lab:'1'},{x:85,y:110,lab:'2'},{x:150,y:20,lab:'3'},{x:175,y:55,lab:'4'},{x:230,y:5,lab:'5'}];
    var guide = '<path d="M5 70 L240 70" class="ewv-guide-line"/>';
    return waveSvg(pts, '0 0 240 170', guide);
  }
  function rule3BadSvg(){
    var pts = [{x:10,y:150,lab:'0'},{x:60,y:70,lab:'1'},{x:85,y:110,lab:'2'},{x:150,y:20,lab:'3'},{x:175,y:95,lab:'4'},{x:230,y:40,lab:'5'}];
    var guide = '<path d="M5 70 L240 70" class="ewv-guide-line"/>';
    return waveSvg(pts, '0 0 240 170', guide);
  }
  function ruleExampleHTML(okSvg, badSvg, okCapUI, badCapUI){
    return (
      '<div class="ewv-shape-cmp ewv-rule-ex">' +
        '<div class="ewv-shape-box ewv-shape-ok"><span class="ewv-shape-badge ewv-shape-badge-ok">✓</span>' +
          '<div class="ewv-diagram ewv-diagram-sm">' + okSvg + '</div>' +
          '<p class="ewv-cap">' + esc(T(okCapUI)) + '</p></div>' +
        '<div class="ewv-shape-box ewv-shape-bad"><span class="ewv-shape-badge ewv-shape-badge-bad">✕</span>' +
          '<div class="ewv-diagram ewv-diagram-sm">' + badSvg + '</div>' +
          '<p class="ewv-cap">' + esc(T(badCapUI)) + '</p></div>' +
      '</div>'
    );
  }
  var RULE_EXAMPLES = [
    function(){ return ruleExampleHTML(rule1OkSvg(), rule1BadSvg(), UI.r1okCap, UI.r1badCap); },
    function(){ return ruleExampleHTML(rule2OkSvg(), rule2BadSvg(), UI.r2okCap, UI.r2badCap); },
    function(){ return ruleExampleHTML(rule3OkSvg(), rule3BadSvg(), UI.r3okCap, UI.r3badCap); }
  ];

  /* -------------------------------------------------------------------- */

  function thumb(nodeId, svg, labelUI){
    return '<button type="button" class="ewv-thumb" data-node="' + nodeId + '">' +
      '<span class="ewv-thumb-svg">' + svg + '</span>' +
      '<span class="ewv-thumb-lbl">' + esc(T(labelUI)) + '</span>' +
    '</button>';
  }
  function mapNode(cls, nodeId, titleUI, subUI){
    return '<button type="button" class="ewv-map-node ' + cls + '" data-node="' + nodeId + '">' +
      '<b>' + esc(T(titleUI)) + '</b>' + (subUI ? '<small>' + esc(T(subUI)) + '</small>' : '') +
    '</button>';
  }
  function mapLeaf(nodeId, labelUI){
    return '<button type="button" class="ewv-map-leaf" data-node="' + nodeId + '">' + esc(T(labelUI)) + '</button>';
  }
  function mapHTML(){
    return (
      '<div class="ewv-map">' +
        '<p class="ewv-map-lede">' + esc(T(UI.mapLede)) + '</p>' +
        '<div class="ewv-map-root">' + esc(T(UI.mapRoot)) + '</div>' +
        '<div class="ewv-map-stem"></div>' +
        '<div class="ewv-map-branch-row">' +
          '<div class="ewv-map-branch">' +
            mapNode('ewv-map-motive', 'motive', UI.navGroupMotive, UI.mapMotiveSub) +
            '<div class="ewv-map-leaf-row">' +
              mapLeaf('impulse', UI.navImpulse) + mapLeaf('diag-lead', UI.navDiagLead) + mapLeaf('diag-end', UI.navDiagEnd) +
            '</div>' +
          '</div>' +
          '<div class="ewv-map-branch">' +
            mapNode('ewv-map-corrective', 'corrective', UI.navGroupCorrective, UI.mapCorrectiveSub) +
            '<div class="ewv-map-leaf-row">' +
              mapLeaf('zigzag', UI.navZigzag) + mapLeaf('flat', UI.navFlat) + mapLeaf('triangle', UI.navTriangle) + mapLeaf('combination', UI.navCombination) +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ---- per-node detail content ---- */
  function ovBody(){
    return (
      mapHTML() +
      '<h3 class="ewv-h3 ewv-h3-sub">' + esc(T(UI.s1h)) + '</h3>' +
      '<p class="ewv-p">' + esc(T(UI.s1p)) + '</p>' +
      '<div class="ewv-diagram">' + diagramHTML() + '</div>' +
      '<p class="ewv-cap">' + esc(T(UI.s1cap)) + '</p>' +
      '<h3 class="ewv-h3 ewv-h3-sub">' + esc(T(UI.s2h)) + '</h3>' +
      '<div class="ewv-rules">' + RULES.map(function(r, i){
        return '<div class="ewv-rule"><span class="ewv-rule-n">' + (i + 1) + '</span>' +
          '<div><b>' + esc(T(r[0])) + '</b><p>' + esc(T(r[1])) + '</p>' + RULE_EXAMPLES[i]() + '</div></div>';
      }).join('') + '</div>'
    );
  }
  function motiveBody(){
    return (
      '<p class="ewv-p">' + esc(T(UI.motiveIntroP)) + '</p>' +
      '<div class="ewv-thumbs">' +
        thumb('impulse', impulseDiagramHTML(), UI.navImpulse) +
        thumb('diag-lead', wedgeDiagramHTML(false), UI.navDiagLead) +
        thumb('diag-end', wedgeDiagramHTML(false), UI.navDiagEnd) +
      '</div>'
    );
  }
  function impulseBody(){
    return '<p class="ewv-p">' + esc(T(UI.impulseP)) + '</p><div class="ewv-diagram">' + impulseDiagramHTML() + '</div>';
  }
  function diagShapeCmp(){
    return (
      '<div class="ewv-shape-cmp">' +
        '<div class="ewv-shape-box"><div class="ewv-diagram ewv-diagram-sm">' + wedgeDiagramHTML(false) + '</div><p class="ewv-cap">' + esc(T(UI.contractingLbl)) + '</p></div>' +
        '<div class="ewv-shape-box"><div class="ewv-diagram ewv-diagram-sm">' + wedgeDiagramHTML(true) + '</div><p class="ewv-cap">' + esc(T(UI.expandingLbl)) + '</p></div>' +
      '</div>'
    );
  }
  function diagLeadBody(){
    return '<p class="ewv-p">' + esc(T(UI.diagIntro)) + '</p><p class="ewv-p">' + esc(T(UI.diagLeadP)) + '</p>' + diagShapeCmp();
  }
  function diagEndBody(){
    return '<p class="ewv-p">' + esc(T(UI.diagIntro)) + '</p><p class="ewv-p">' + esc(T(UI.diagEndP)) + '</p>' + diagShapeCmp();
  }
  function correctiveBody(){
    return (
      '<p class="ewv-p">' + esc(T(UI.s7p)) + '</p>' +
      '<div class="ewv-thumbs">' +
        thumb('zigzag', zigzagDiagramHTML(), UI.navZigzag) +
        thumb('flat', flatDiagramHTML(), UI.navFlat) +
        thumb('triangle', triangleDiagramHTML(), UI.navTriangle) +
        thumb('combination', combinationDiagramHTML(), UI.navCombination) +
      '</div>'
    );
  }
  function zigzagBody(){
    return '<p class="ewv-p">' + esc(T(UI.c1p)) + '</p><div class="ewv-diagram">' + zigzagDiagramHTML() + '</div>' +
      '<p class="ewv-cap">' + esc(T(UI.c1cap)) + '</p>';
  }
  function flatBody(){
    return '<p class="ewv-p">' + esc(T(UI.c2p)) + '</p><div class="ewv-diagram">' + flatDiagramHTML() + '</div>' +
      '<p class="ewv-cap">' + esc(T(UI.c2cap)) + '</p>';
  }
  function triangleBody(){
    return (
      '<p class="ewv-p">' + esc(T(UI.c3p)) + '</p>' +
      '<div class="ewv-diagram">' + triangleDiagramHTML() + '</div>' +
      '<p class="ewv-cap">' + esc(T(UI.c3cap)) + '</p>' +
      '<div class="ewv-rule ewv-rule-warn">' +
        '<span class="ewv-rule-n ewv-rule-n-x">✕</span>' +
        '<div><b>' + esc(T(UI.ruleTriH)) + '</b><p>' + esc(T(UI.ruleTriP)) + '</p></div>' +
      '</div>'
    );
  }
  function combinationBody(){
    return '<p class="ewv-p">' + esc(T(UI.c4p)) + '</p><div class="ewv-diagram">' + combinationDiagramHTML() + '</div>' +
      '<p class="ewv-cap">' + esc(T(UI.c4cap)) + '</p>';
  }
  function degreeBody(){
    return (
      '<h3 class="ewv-h3 ewv-h3-sub">' + esc(T(UI.s6h)) + '</h3><p class="ewv-p">' + esc(T(UI.s6p)) + '</p>' +
      '<h3 class="ewv-h3 ewv-h3-sub">' + esc(T(UI.s4h)) + '</h3><p class="ewv-p">' + esc(T(UI.s4p)) + '</p>'
    );
  }
  function fibGroupBody(){
    return (
      '<p class="ewv-p">' + esc(T(UI.fibGroupP)) + '</p>' +
      '<div class="ewv-sublist">' +
        '<button type="button" class="ewv-sublist-item" data-node="fib-retrace"><b>' + esc(T(UI.navFibRetrace)) + '</b><p>' + esc(T(UI.g2p)) + '</p></button>' +
        '<button type="button" class="ewv-sublist-item" data-node="fib-proj"><b>' + esc(T(UI.navFibProj)) + '</b><p>' + esc(T(UI.s8p)) + '</p></button>' +
      '</div>'
    );
  }
  function fibRetraceBody(){
    return (
      '<div class="ewv-guides">' + GUIDES.map(function(g){
        return '<div class="ewv-guide"><b>' + esc(T(g[0])) + '</b><p>' + esc(T(g[1])) + '</p></div>';
      }).join('') + '</div>' +
      '<table class="ewv-fib"><thead><tr><th>' + esc(T(UI.fibHead1)) + '</th><th>' + esc(T(UI.fibHead2)) + '</th></tr></thead><tbody>' +
        FIB.map(function(f){ return '<tr><td class="ewv-fib-r">' + esc(f.r) + '</td><td>' + esc(T(f.u)) + '</td></tr>'; }).join('') +
      '</tbody></table>'
    );
  }
  function fibProjBody(){
    var projSteps = [UI.s8f1, UI.s8f2, UI.s8f3];
    return (
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
      '<p class="ewv-cap">' + esc(T(UI.s8note)) + '</p>'
    );
  }
  function mistakesBody(){
    return '<ul class="ewv-warns">' + WARNS.map(function(w){ return '<li>' + esc(T(w)) + '</li>'; }).join('') + '</ul>';
  }
  function furtherBody(){
    return (
      '<div class="ewv-cite ewv-cite-flat">' +
        '<p>' + esc(T(UI.furtherP)) + '</p>' +
        '<a href="https://www.elliottwave.com" target="_blank" rel="noopener noreferrer nofollow" class="ewv-cite-link">' + esc(T(UI.furtherLink)) + ' ↗</a>' +
        '<p class="ewv-cite-disc">' + esc(T(UI.furtherDisc)) + '</p>' +
      '</div>' +
      /* Round Z (#249): a second box pointing to a real analysis on this
         site itself -- the Asset Analysis Log, which already requires
         sign-in (LINE/Telegram) to view, so no new gating logic is needed
         here. */
      '<div class="ewv-cite ewv-further-ex">' +
        '<p>' + esc(T(UI.furtherExampleP)) + '</p>' +
        '<a href="#/journal" class="ewv-cite-link">' + esc(T(UI.furtherExampleLink)) + '</a>' +
        '<p class="ewv-cite-disc">' + esc(T(UI.furtherExampleNote)) + '</p>' +
      '</div>'
    );
  }

  var NODE_TITLE = {
    overview:UI.navOverview, motive:UI.navGroupMotive, impulse:UI.navImpulse,
    'diag-lead':UI.navDiagLead, 'diag-end':UI.navDiagEnd, corrective:UI.navGroupCorrective,
    zigzag:UI.navZigzag, flat:UI.navFlat, triangle:UI.navTriangle, combination:UI.navCombination,
    degree:UI.navDegree, fib:UI.navGroupFib, 'fib-retrace':UI.navFibRetrace, 'fib-proj':UI.navFibProj,
    mistakes:UI.navMistakes, further:UI.navFurther
  };
  var NODE_BODY = {
    overview:ovBody, motive:motiveBody, impulse:impulseBody,
    'diag-lead':diagLeadBody, 'diag-end':diagEndBody, corrective:correctiveBody,
    zigzag:zigzagBody, flat:flatBody, triangle:triangleBody, combination:combinationBody,
    degree:degreeBody, fib:fibGroupBody, 'fib-retrace':fibRetraceBody, 'fib-proj':fibProjBody,
    mistakes:mistakesBody, further:furtherBody
  };
  var TREE = [
    { id:'overview' },
    { id:'motive', children:['impulse', 'diag-lead', 'diag-end'] },
    { id:'corrective', children:['zigzag', 'flat', 'triangle', 'combination'] },
    { id:'degree' },
    { id:'fib', children:['fib-retrace', 'fib-proj'] },
    { id:'mistakes' },
    { id:'further' }
  ];

  var sec = null;
  var currentId = 'overview';

  function navItemHTML(id, isSub){
    var active = id === currentId ? ' active' : '';
    var subCls = isSub ? ' ewv-gl-sub' : '';
    return '<button type="button" class="gl-nav-item' + active + subCls + '" data-node="' + id + '">' +
      '<span class="gl-nav-name">' + esc(T(NODE_TITLE[id])) + '</span></button>';
  }

  function renderShell(bodyEl){
    if(window.__SPZ_TIER && window.__SPZ_TIER() !== 'full'){
      bodyEl.innerHTML = '<div class="qrp-locked">' + esc(T(UI.adminOnly)) + '</div>';
      return;
    }
    if(!NODE_BODY[currentId]) currentId = 'overview';
    var navHTML = TREE.map(function(entry){
      var html = navItemHTML(entry.id, false);
      if(entry.children) html += entry.children.map(function(cid){ return navItemHTML(cid, true); }).join('');
      return html;
    }).join('');
    var bodyFn = NODE_BODY[currentId];
    bodyEl.innerHTML =
      '<div class="gl-shell ewv-gl-shell">' +
        '<div class="gl-nav">' + navHTML + '</div>' +
        '<div class="gl-detail gl-anim">' +
          '<div class="gl-detail-head"><span class="gl-detail-name">' + esc(T(NODE_TITLE[currentId])) + '</span></div>' +
          '<div class="gl-detail-body">' + bodyFn() + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="ewv-note">' + esc(T(UI.note)) + '</p>';
  }

  function paint(){
    if(!sec) return;
    var q = function(k){ return sec.querySelector('[data-ewv="' + k + '"]'); };
    if(q('eb')) q('eb').textContent = T(UI.eb);
    if(q('h')) q('h').textContent = T(UI.h);
    if(q('lede')) q('lede').textContent = T(UI.lede);
    var body = q('body');
    if(body) renderShell(body);
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

    var bodyEl = sec.querySelector('[data-ewv="body"]');
    // One delegated click listener on the (never-replaced) body container
    // handles every nav item, every map box/leaf, every thumbnail card, and
    // every "Fibonacci Tools" sub-list row -- they all just carry a
    // data-node attribute. renderShell() replaces this container's
    // innerHTML on every click, but the listener itself survives because
    // it's bound to bodyEl, not to any node that gets re-created.
    bodyEl.addEventListener('click', function(ev){
      var el = ev.target.closest('[data-node]');
      if(!el || !NODE_BODY[el.getAttribute('data-node')]) return;
      currentId = el.getAttribute('data-node');
      renderShell(bodyEl);
    });

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
