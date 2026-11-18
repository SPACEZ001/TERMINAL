/* ============================================================================
   SPACEZ TERMINAL -- Reviewer evaluation form (2026-11-18)
   A printable A4 form the owner hands to reviewers (lecturers, deans, teachers,
   directors, finance people) so they can score and comment on the site.
   Lives inside Print Report (#/printreport, part-49) as report type 'review':
   part-49 shows the button, the form panel (revWrap) and renders sheetHTML()
   into the preview. Six ready-made sets (finance expert, teaching, UX/UI,
   technology, general overview, custom) + the owner's own extra items, the
   pages to review, a note to the reviewer, a 5-level rating scale with N/A,
   an issue log, overall comments, a result box with the usual Thai mean-score
   bands and signature lines. Settings: localStorage spz.review.form.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_REVIEWFORM) return;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function I(en, th){ return { en:en, th:th }; }

  var TX = {
    type:I('Reviewer form', 'แบบประเมินผลงาน'),
    docT:I('Work Evaluation Form', 'แบบประเมินผลงาน'),
    dept:I('Financial education platform', 'แพลตฟอร์มการเรียนรู้การเงินและการลงทุน'),
    hint:I('Pick a form set for the reviewer, tick the pages they should look at, then press Print. The reviewer fills it in by hand.',
           'เลือกชุดแบบประเมินให้เหมาะกับผู้ประเมิน ติ๊กหน้าที่อยากให้ดู แล้วกดพิมพ์ ผู้ประเมินกรอกด้วยปากกาได้เลยค่ะ'),
    setL:I('Form set (who is reviewing)', 'ชุดแบบประเมิน (เหมาะกับใคร)'),
    scopeL:I('Pages to review', 'ส่วนที่ขอให้ประเมิน'),
    scopeOther:I('Other pages (one per line)', 'ส่วนอื่น ๆ (บรรทัดละ 1 ส่วน)'),
    extraL:I('Your own extra items (one per line)', 'หัวข้อประเมินเพิ่มเติม (บรรทัดละ 1 ข้อ)'),
    extraPh:I('e.g. The Elliott Wave lessons follow the official rules', 'เช่น บทเรียน Elliott Wave ถูกต้องตามกฎของ EWI'),
    noteL:I('Note to the reviewer (optional)', 'ข้อความถึงผู้ประเมิน (ไม่บังคับ)'),
    focusL:I('Please look closely at (optional)', 'จุดที่อยากให้ดูเป็นพิเศษ (ไม่บังคับ)'),
    titleL:I('Work title', 'ชื่อผลงาน'),
    devL:I('Developer', 'ผู้พัฒนา'),
    devShow:I('Print the developer name', 'พิมพ์ชื่อผู้พัฒนา'),
    revL:I('Reviewer name (leave blank to write by hand)', 'ชื่อผู้ประเมิน (เว้นว่างไว้ให้เขียนเองได้)'),
    revPosL:I('Position', 'ตำแหน่ง'), revOrgL:I('Organisation', 'หน่วยงาน'),
    optsL:I('Include in the form', 'ส่วนประกอบในเอกสาร'),
    oLog:I('Issue log table (page · what was found · suggestion)', 'ตารางบันทึกสิ่งที่พบ (หน้า · สิ่งที่พบ · ข้อเสนอแนะ)'),
    oQr:I('QR code to open the site', 'QR สำหรับเปิดเว็บไซต์'),
    oCode:I('Blank box for the reviewer sign-in code', 'ช่องว่างสำหรับเขียนรหัสเข้าใช้งานของผู้ประเมิน'),
    oDevSign:I('Developer signature line', 'ช่องลงชื่อผู้พัฒนา'),
    reset:I('Reset to the set\'s default', 'คืนค่าเริ่มต้นของชุดนี้'),
    items:I('items', 'ข้อ'),
    /* sheet */
    p1:I('Part 1 · About the work', 'ตอนที่ 1 · ข้อมูลผลงาน'),
    p2:I('Part 2 · About the reviewer', 'ตอนที่ 2 · ข้อมูลผู้ประเมิน'),
    p3:I('Part 3 · Rating', 'ตอนที่ 3 · การประเมิน'),
    p4:I('Part 4 · What you found', 'ตอนที่ 4 · บันทึกสิ่งที่พบ'),
    p5:I('Part 5 · Overall comments', 'ตอนที่ 5 · ความคิดเห็นโดยรวม'),
    p6:I('Part 6 · Result', 'ตอนที่ 6 · สรุปผลการประเมิน'),
    fTitle:I('Work', 'ชื่อผลงาน'), fType:I('Type', 'ประเภท'),
    fTypeV:I('Web application for learning finance and investing (Thai / English)', 'เว็บแอปพลิเคชันเพื่อการเรียนรู้การเงินและการลงทุน (ไทย / อังกฤษ)'),
    fUrl:I('Website', 'ที่อยู่เว็บไซต์'), fDev:I('Developer', 'ผู้พัฒนา'), fSet:I('Form set', 'ชุดแบบประเมิน'),
    fCode:I('Reviewer sign-in code', 'รหัสเข้าใช้งาน (แท็บ “ผู้ประเมิน”)'),
    qrCap:I('Scan to open the site', 'สแกนเพื่อเปิดเว็บไซต์'),
    purpose:I('Purpose: to collect an independent opinion on the quality of this work, so it can be improved and used for teaching and learning.',
              'วัตถุประสงค์: เพื่อขอความคิดเห็นจากผู้ทรงคุณวุฒิต่อคุณภาพของผลงาน นำไปปรับปรุงและพัฒนาให้ใช้ประกอบการเรียนการสอนได้อย่างมีประสิทธิภาพ'),
    scopeH:I('Please review these parts of the site', 'ส่วนของผลงานที่ขอความอนุเคราะห์ให้ประเมิน'),
    focusH:I('Please look closely at', 'จุดที่ขอให้พิจารณาเป็นพิเศษ'),
    noteH:I('Note from the developer', 'ข้อความจากผู้พัฒนา'),
    rName:I('Name – surname', 'ชื่อ – นามสกุล'), rPos:I('Position', 'ตำแหน่ง'), rOrg:I('Organisation', 'หน่วยงาน / สถาบัน'),
    rDate:I('Date reviewed', 'วันที่ประเมิน'),
    rField:I('Field of expertise', 'ความเชี่ยวชาญ'),
    fields:[I('Finance / investing', 'การเงิน / การลงทุน'), I('Education / teaching', 'การศึกษา / การสอน'), I('Computers / technology', 'คอมพิวเตอร์ / เทคโนโลยี'), I('Design / media', 'การออกแบบ / สื่อ'), I('Other ………………', 'อื่น ๆ ………………')],
    rKnow:I('Familiarity with investing', 'ความคุ้นเคยกับการลงทุน'),
    knows:[I('None', 'ไม่มี'), I('Basic', 'พื้นฐาน'), I('Moderate', 'ปานกลาง'), I('High', 'สูง')],
    rDev:I('Device used', 'อุปกรณ์ที่ใช้'),
    devs:[I('Computer', 'คอมพิวเตอร์'), I('Tablet', 'แท็บเล็ต'), I('Mobile phone', 'โทรศัพท์มือถือ')],
    howH:I('How to rate', 'คำชี้แจง'),
    how:I('Tick ✓ one box per item. 5 = excellent, 4 = good, 3 = fair, 2 = needs work, 1 = needs a lot of work. Tick N/A if you could not judge that item.',
          'โปรดทำเครื่องหมาย ✓ ในช่องที่ตรงกับความคิดเห็นของท่าน ข้อละ 1 ช่อง  5 = ดีมาก  4 = ดี  3 = ปานกลาง  2 = พอใช้  1 = ควรปรับปรุง  หากไม่สามารถประเมินข้อใดได้ โปรดเลือก “ไม่ประเมิน”'),
    colNo:I('No.', 'ที่'), colItem:I('Item', 'รายการประเมิน'), colNA:I('N/A', 'ไม่ประเมิน'),
    sugg:I('Suggestions', 'ข้อเสนอแนะ'),
    lPage:I('Page / topic', 'หน้า / หัวข้อ'), lFound:I('What you found', 'สิ่งที่พบ'), lFix:I('Suggested change', 'ข้อเสนอแนะการแก้ไข'),
    good:I('Strengths', 'จุดเด่นของผลงาน'), weak:I('What should be improved', 'จุดที่ควรปรับปรุง'), more:I('Other suggestions', 'ข้อเสนอแนะเพิ่มเติม'),
    sumH:I('Score summary (filled in by the reviewer)', 'สรุปคะแนน (ผู้ประเมินกรอก)'),
    total:I('Total score', 'คะแนนรวม'), mean:I('Mean', 'ค่าเฉลี่ย'), rated:I('Items rated', 'จำนวนข้อที่ประเมิน'),
    bandH:I('Reading the mean', 'เกณฑ์การแปลความหมายค่าเฉลี่ย'),
    bands:[['4.51 – 5.00', I('Excellent', 'ดีมาก')], ['3.51 – 4.50', I('Good', 'ดี')], ['2.51 – 3.50', I('Fair', 'ปานกลาง')], ['1.51 – 2.50', I('Needs work', 'พอใช้')], ['1.00 – 1.50', I('Needs a lot of work', 'ควรปรับปรุง')]],
    ovH:I('Overall quality', 'คุณภาพโดยรวม'),
    ovs:[I('Excellent', 'ดีมาก'), I('Good', 'ดี'), I('Fair', 'ปานกลาง'), I('Needs work', 'พอใช้'), I('Needs a lot of work', 'ควรปรับปรุง')],
    recH:I('Recommendation', 'ความเห็นต่อการนำไปใช้'),
    recs:[I('Ready to use as it is', 'เหมาะสม นำไปใช้ได้ทันที'), I('Usable after small changes', 'นำไปใช้ได้ เมื่อปรับปรุงตามข้อเสนอแนะเล็กน้อย'), I('Should be improved before use', 'ควรปรับปรุงก่อนนำไปใช้')],
    signRev:I('Reviewer', 'ผู้ประเมิน'), signDev:I('Developer', 'ผู้พัฒนา'),
    signPos:I('Position', 'ตำแหน่ง'), signDate:I('Date', 'วันที่'),
    foot:I('Thank you for your time. Your answers are used only to improve this work.', 'ขอขอบพระคุณที่สละเวลาประเมินผลงาน ข้อมูลทั้งหมดใช้เพื่อการปรับปรุงและพัฒนาผลงานเท่านั้น'),
    ref:I('Ref.', 'เลขที่เอกสาร'), issued:I('Issued', 'วันที่ออกเอกสาร'),
    page:I('page', 'หน้า')
  };

  /* the six form sets: groups of items. Every string EN + TH. */
  var SETS = [
    { id:'expert', t:I('Finance & investing expert', 'ผู้เชี่ยวชาญด้านการเงินและการลงทุน'),
      d:I('Checks that the content, formulas and analysis are correct', 'ตรวจความถูกต้องของเนื้อหา สูตร และวิธีคิดวิเคราะห์'),
      log:true, groups:[
      { t:I('Accuracy of the content', 'ความถูกต้องของเนื้อหา'), it:[
        I('Financial terms and definitions are correct', 'นิยามและคำศัพท์ทางการเงินถูกต้องตามหลักวิชา'),
        I('Formulas and worked examples are correct (returns, compounding, valuation)', 'สูตรและตัวอย่างการคำนวณถูกต้อง (ผลตอบแทน ดอกเบี้ยทบต้น การประเมินมูลค่า)'),
        I('Market facts and Thai rules are up to date', 'ข้อเท็จจริงของตลาดและกฎเกณฑ์ในประเทศไทยเป็นปัจจุบัน'),
        I('Sources are named and trustworthy', 'ระบุแหล่งที่มาของข้อมูลชัดเจนและน่าเชื่อถือ') ]},
      { t:I('Soundness of the analysis', 'ความสมเหตุสมผลของการวิเคราะห์'), it:[
        I('Elliott Wave rules, guidelines and wave counts are correct', 'หลักการ Elliott Wave (กฎ แนวทาง การนับคลื่น) ถูกต้อง'),
        I('Economic indicators and the market cycle are read correctly', 'การอ่านความหมายของตัวชี้วัดเศรษฐกิจและวัฏจักรตลาดถูกต้อง'),
        I('Stock scores and rankings have a clear, reasonable basis', 'วิธีให้คะแนนและจัดอันดับหุ้นมีเหตุผลรองรับชัดเจน'),
        I('Forecasts show their uncertainty and limits', 'การพยากรณ์แสดงช่วงความไม่แน่นอนและข้อจำกัดอย่างเหมาะสม') ]},
      { t:I('Risk and ethics', 'ความเสี่ยงและจริยธรรม'), it:[
        I('Risks are explained and nothing pushes the reader to trade', 'มีการอธิบายความเสี่ยง และไม่ชี้นำให้ซื้อขาย'),
        I('Live data, simulated data and teaching examples are clearly labelled', 'แยกข้อมูลจริง ข้อมูลจำลอง และตัวอย่างเพื่อการสอนอย่างชัดเจน'),
        I('The level of the content suits the intended learners', 'ระดับเนื้อหาเหมาะสมกับกลุ่มผู้เรียนเป้าหมาย') ]} ]},
    { id:'teach', t:I('Teaching & curriculum', 'ผู้เชี่ยวชาญด้านการสอนและหลักสูตร'),
      d:I('Lesson design, teaching media and assessment', 'การออกแบบบทเรียน สื่อการสอน และการวัดผล'),
      log:false, groups:[
      { t:I('Lesson design', 'การออกแบบการเรียนรู้'), it:[
        I('Learning objectives are clear', 'กำหนดจุดประสงค์การเรียนรู้ชัดเจน'),
        I('Lessons go step by step from easy to hard', 'ลำดับเนื้อหาจากง่ายไปยากอย่างเป็นขั้นตอน'),
        I('The content suits the learners\' age and level', 'เนื้อหาเหมาะสมกับวัยและระดับของผู้เรียน'),
        I('Each lesson has a sensible amount of content', 'ปริมาณเนื้อหาในแต่ละบทเหมาะสม') ]},
      { t:I('Teaching media and methods', 'สื่อและวิธีการสอน'), it:[
        I('Pictures, diagrams and examples help understanding', 'ภาพ แผนภาพ และตัวอย่างช่วยให้เข้าใจได้ง่าย'),
        I('Learners can try things themselves (calculators, practice)', 'มีกิจกรรมให้ผู้เรียนลงมือทำ (เครื่องคำนวณ แบบฝึก)'),
        I('The language is easy to follow', 'ใช้ภาษาที่เข้าใจง่าย'),
        I('It builds analytical thinking', 'ส่งเสริมการคิดวิเคราะห์') ]},
      { t:I('Assessment', 'การวัดและประเมินผล'), it:[
        I('Quizzes match the learning objectives', 'แบบทดสอบสอดคล้องกับจุดประสงค์การเรียนรู้'),
        I('Answers come with explanations', 'มีเฉลยพร้อมคำอธิบายย้อนกลับ'),
        I('Learners can follow their own progress', 'ผู้เรียนติดตามความก้าวหน้าของตนเองได้') ]},
      { t:I('Use in practice', 'การนำไปใช้'), it:[
        I('It can be used in a real classroom', 'นำไปใช้ประกอบการสอนในชั้นเรียนได้จริง'),
        I('Learners can study on their own with it', 'ผู้เรียนใช้เรียนรู้ด้วยตนเองได้') ]} ]},
    { id:'uxui', t:I('Design & ease of use (UX/UI)', 'ด้านการออกแบบและการใช้งาน (UX/UI)'),
      d:I('For any reviewer — no finance knowledge needed', 'เหมาะกับผู้ประเมินทุกท่าน ไม่ต้องมีความรู้เรื่องหุ้น'),
      log:false, groups:[
      { t:I('Look and professionalism', 'ความสวยงามและความเป็นมืออาชีพ'), it:[
        I('Overall look and feel', 'ความสวยงามโดยรวม'),
        I('Colours, fonts and icons work well together', 'สี ตัวอักษร และไอคอนสอดคล้องกันทั้งเว็บไซต์'),
        I('It looks trustworthy and professional', 'ภาพลักษณ์น่าเชื่อถือและเป็นมืออาชีพ') ]},
      { t:I('Ease of use', 'ความง่ายในการใช้งาน'), it:[
        I('Menus and pages are easy to find', 'ค้นหาเมนูและหน้าที่ต้องการได้ง่าย'),
        I('Buttons and links do what you expect', 'ปุ่มและลิงก์ทำงานตามที่คาดหวัง'),
        I('You always know where you are', 'รู้ตลอดว่ากำลังอยู่หน้าใด'),
        I('It can be used without someone explaining it', 'ใช้งานได้เองโดยไม่ต้องมีผู้อธิบาย') ]},
      { t:I('Reading and access', 'การอ่านและการเข้าถึง'), it:[
        I('Text is easy to read and well sized', 'ตัวอักษรอ่านง่าย ขนาดเหมาะสม'),
        I('Switching Thai / English is easy', 'สลับภาษาไทย / อังกฤษได้สะดวก'),
        I('Both light and dark mode are easy to read', 'โหมดสว่างและโหมดมืดอ่านง่าย') ]},
      { t:I('Devices and speed', 'อุปกรณ์และความเร็ว'), it:[
        I('Pages open quickly', 'เปิดหน้าเว็บได้รวดเร็ว'),
        I('It works well on a phone or tablet', 'ใช้งานบนโทรศัพท์มือถือหรือแท็บเล็ตได้ดี') ]} ]},
    { id:'tech', t:I('Technology & system', 'ด้านเทคโนโลยีและระบบ'),
      d:I('Stability, security and how it is built', 'ความเสถียร ความปลอดภัย และคุณภาพการพัฒนา'),
      log:true, groups:[
      { t:I('Stability', 'ความเสถียรของระบบ'), it:[
        I('No errors or frozen pages were found', 'ไม่พบข้อผิดพลาดหรือหน้าค้าง'),
        I('Data updates by itself on schedule', 'ข้อมูลอัปเดตอัตโนมัติตามเวลาที่กำหนด'),
        I('It works in several browsers', 'ทำงานได้ในหลายเบราว์เซอร์') ]},
      { t:I('Security and access', 'ความปลอดภัยและสิทธิ์การใช้งาน'), it:[
        I('Sign-in and user levels are clearly separated', 'ระบบเข้าสู่ระบบและการแบ่งระดับสิทธิ์ผู้ใช้ชัดเจน'),
        I('Personal and sensitive data is protected', 'ข้อมูลส่วนบุคคลและข้อมูลสำคัญได้รับการปกป้อง') ]},
      { t:I('Quality of the build', 'คุณภาพการพัฒนา'), it:[
        I('The system is well organised and can be maintained', 'โครงสร้างระบบเป็นระเบียบ ดูแลและพัฒนาต่อได้'),
        I('Loading and resource use are efficient', 'ประสิทธิภาพการโหลดและการใช้ทรัพยากรเหมาะสม'),
        I('Technology is used appropriately (automation, installable app)', 'ใช้เทคโนโลยีอย่างเหมาะสม (ระบบอัตโนมัติ ติดตั้งเป็นแอป)') ]} ]},
    { id:'general', t:I('Overall impression (short)', 'ภาพรวมของผลงาน (ฉบับสั้น)'),
      d:I('The shortest set, for any reviewer', 'ชุดสั้นที่สุด เหมาะกับผู้ประเมินทุกท่าน'),
      log:false, groups:[
      { t:I('Overall', 'ภาพรวม'), it:[
        I('The work is useful for learners and users', 'ผลงานมีประโยชน์ต่อผู้เรียนและผู้ใช้งาน'),
        I('The content is easy to understand', 'เนื้อหาเข้าใจง่าย'),
        I('It looks attractive and inviting', 'หน้าตาสวยงาม น่าใช้งาน'),
        I('It is easy to use', 'ใช้งานง่าย'),
        I('It is creative and original', 'มีความคิดสร้างสรรค์และแปลกใหม่'),
        I('It is professional in quality', 'มีคุณภาพระดับมืออาชีพ'),
        I('I would recommend it to others', 'ท่านจะแนะนำผลงานนี้ให้ผู้อื่น') ]} ]},
    { id:'custom', t:I('Custom — only your own items', 'กำหนดเอง — ใช้เฉพาะหัวข้อที่พิมพ์เอง'),
      d:I('Type your items in the box below', 'พิมพ์หัวข้อในช่องด้านล่าง'),
      log:false, groups:[] }
  ];
  var SCOPE = [
    ['home', I('Home page', 'หน้าแรก')],
    ['learn', I('Stock Classroom (3-step course)', 'ห้องเรียนหุ้น (เรียนหุ้น 3 ขั้น)')],
    ['ew', I('Elliott Wave Classroom', 'ห้องเรียน Elliott Wave')],
    ['market', I('Market pages (live data, Bubble Radar, economic calendar)', 'หน้าข้อมูลตลาด (ข้อมูลสด Bubble Radar ปฏิทินเศรษฐกิจ)')],
    ['brain', I('Market Brain', 'สมองตลาด (Market Brain)')],
    ['tools', I('Calculators and tools', 'เครื่องมือคำนวณ')],
    ['exams', I('Exam room (CEWA · IC)', 'ห้องสอบ (CEWA · IC)')],
    ['ic', I('IC licence study site', 'เว็บติวสอบใบอนุญาต IC')],
    ['island', I('SPACEZ ISLAND economy game', 'เกมเศรษฐกิจ SPACEZ ISLAND')],
    ['admin', I('Admin system (executive board, print reports)', 'ระบบผู้ดูแล (บอร์ดบริหาร พิมพ์รายงาน)')]
  ];
  var SITE = 'https://spacez001.github.io/TERMINAL/SPACEZ_TERMINAL.html';
  var LS = 'spz.review.form';

  function blank(){
    return { set:'uxui', scope:{ home:1, learn:1, ew:1, tools:1 }, scopeOther:'', extra:'', note:'', focus:'',
      title:'SPACEZ TERMINAL', dev:'', devShow:1,
      rev:'', revPos:'', revOrg:'', log:0, logSet:'', qr:1, code:1, devSign:1 };
  }
  var D = blank();
  try { var sv = JSON.parse(localStorage.getItem(LS) || 'null'); if(sv && typeof sv === 'object') Object.keys(sv).forEach(function(k){ D[k] = sv[k]; }); } catch(e){}
  function save(){ try { localStorage.setItem(LS, JSON.stringify(D)); } catch(e){} }
  function setOf(id){ for(var i = 0; i < SETS.length; i++) if(SETS[i].id === id) return SETS[i]; return SETS[0]; }
  /* the issue-log default follows the chosen set until the owner changes it */
  function logOn(){ return D.logSet === D.set ? !!D.log : !!setOf(D.set).log; }
  function lines(s){ return String(s || '').split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean); }
  function groups(){
    var g = setOf(D.set).groups.map(function(x){ return { t:T(x.t), it:x.it.map(T) }; });
    var ex = lines(D.extra);
    if(ex.length) g.push({ t:T(I('Additional items from the developer', 'หัวข้อเพิ่มเติมจากผู้พัฒนา')), it:ex });
    return g;
  }
  /* empty developer box = the owner's name in the page language */
  function devName(){ return String(D.dev || '').trim() || (L() === 'th' ? 'นายนรเศรษฐ์ บ่อแก้ว' : 'Noraset Boikaw'); }
  function count(){ return groups().reduce(function(a, g){ return a + g.it.length; }, 0); }

  /* ---------- form (left panel) ---------- */
  function formHTML(){
    function inp(k, lbl, ph){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><input type="text" data-rv="' + k + '" value="' + esc(D[k] || '') + '"' + (ph ? ' placeholder="' + esc(T(ph)) + '"' : '') + '></label>'; }
    function area(k, lbl, ph, rows){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><textarea rows="' + (rows || 3) + '" data-rv="' + k + '"' + (ph ? ' placeholder="' + esc(T(ph)) + '"' : '') + '>' + esc(D[k] || '') + '</textarea></label>'; }
    function chk(k, lbl, on){ return '<label class="pr-rv-ck"><input type="checkbox" data-rv-ck="' + k + '"' + (on ? ' checked' : '') + '><span>' + esc(T(lbl)) + '</span></label>'; }
    var h = '<div class="pr-hint" style="margin-bottom:10px;">' + esc(T(TX.hint)) + '</div>';
    h += '<div class="pr-ev-h2" style="margin-top:0">' + esc(T(TX.setL)) + '</div><div class="pr-rv-sets">' + SETS.map(function(s){
      var n = s.groups.reduce(function(a, g){ return a + g.it.length; }, 0);
      return '<button type="button" class="pr-rv-set' + (D.set === s.id ? ' on' : '') + '" data-rv-set="' + s.id + '"><b>' + esc(T(s.t)) + '</b><span>' + esc(T(s.d)) + (n ? ' · ' + n + ' ' + esc(T(TX.items)) : '') + '</span></button>';
    }).join('') + '</div>';
    h += area('extra', TX.extraL, TX.extraPh, 3);
    h += '<div class="pr-ev-h2">' + esc(T(TX.scopeL)) + '</div><div class="pr-rv-scope">' + SCOPE.map(function(s){ return chk('sc_' + s[0], s[1], D.scope && D.scope[s[0]]); }).join('') + '</div>';
    h += area('scopeOther', TX.scopeOther, null, 2);
    h += area('focus', TX.focusL, null, 2) + area('note', TX.noteL, null, 2);
    h += '<div class="pr-ev-h2">' + esc(T(TX.titleL)) + ' · ' + esc(T(TX.devL)) + '</div>' + inp('title', TX.titleL) + '<label class="pr-ev-in"><span>' + esc(T(TX.devL)) + '</span><input type="text" data-rv="dev" value="' + esc(D.dev || '') + '" placeholder="' + esc(devName()) + '"></label>' + chk('devShow', TX.devShow, D.devShow);
    h += '<div class="pr-ev-h2">' + esc(T(TX.signRev)) + '</div>' + inp('rev', TX.revL) + '<div class="pr-ev-grid2">' + inp('revPos', TX.revPosL) + inp('revOrg', TX.revOrgL) + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.optsL)) + '</div>' + chk('log', TX.oLog, logOn()) + chk('qr', TX.oQr, D.qr) + chk('code', TX.oCode, D.code) + chk('devSign', TX.oDevSign, D.devSign);
    h += '<button type="button" class="pr-ev-bigbtn ghost" data-rv-reset="1">' + esc(T(TX.reset)) + '</button>';
    return h;
  }
  function handleInput(t){
    if(!t || !t.getAttribute) return false;
    var k = t.getAttribute('data-rv');
    if(k){ D[k] = t.value; save(); return true; }
    var c = t.getAttribute('data-rv-ck');
    if(c){
      if(c.indexOf('sc_') === 0){ D.scope = D.scope || {}; D.scope[c.slice(3)] = t.checked ? 1 : 0; }
      else if(c === 'log'){ D.log = t.checked ? 1 : 0; D.logSet = D.set; }
      else D[c] = t.checked ? 1 : 0;
      save(); return true;
    }
    return false;
  }
  /* returns 'form' when the panel must be redrawn too, true when only the sheet changed */
  function handleClick(t){
    var s = t.closest && t.closest('[data-rv-set]');
    if(s){ D.set = s.getAttribute('data-rv-set'); save(); return 'form'; }
    if(t.closest && t.closest('[data-rv-reset]')){ var keep = { title:D.title, dev:D.dev, rev:D.rev, revPos:D.revPos, revOrg:D.revOrg, set:D.set }; D = blank(); Object.keys(keep).forEach(function(k){ D[k] = keep[k]; }); save(); return 'form'; }
    return false;
  }

  /* ---------- the A4 sheet ---------- */
  function sheetHTML(ctx){
    ctx = ctx || {};
    var set = setOf(D.set), G = groups(), n = count();
    var d = new Date(), dt = L() === 'th'
      ? d.getDate() + ' ' + ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][d.getMonth()] + ' ' + (d.getFullYear() + 543)
      : d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear();
    function box(on){ return '<span class="pr-ev-chk"><i' + (on ? ' class="on"' : '') + '></i>'; }
    function opts(arr){ return '<div class="pr-ev-lv">' + arr.map(function(o){ return box(false) + esc(T(o)) + '</span>'; }).join('') + '</div>'; }
    function fld(lbl, val, w){ return '<div class="pr-ev-f' + (w ? ' w' : '') + '"><span>' + esc(T(lbl)) + '</span><b>' + (val ? esc(val) : '&nbsp;') + '</b></div>'; }
    function sec(t){ return '<div class="pr-rv-sec">' + esc(T(t)) + '</div>'; }
    function linesH(k){ var o = ''; for(var i = 0; i < k; i++) o += '<i></i>'; return '<div class="pr-ev-lines">' + o + '</div>'; }

    var scope = SCOPE.filter(function(s){ return D.scope && D.scope[s[0]]; }).map(function(s){ return T(s[1]); }).concat(lines(D.scopeOther));
    var h = '<div class="pr-sheet pr-ev pr-rv">';
    h += '<div class="pr-ev-top"><div class="pr-ev-brand">' + (ctx.logo ? '<img class="pr-ev-logo" src="' + ctx.logo + '" alt="">' : '') + '<div><b>SPACEZ TERMINAL</b><span>' + esc(T(TX.dept)) + '</span></div></div>' +
      '<div class="pr-ev-doc"><div class="pr-ev-doc-t">' + esc(T(TX.docT)) + '</div><div class="pr-rv-setname">' + esc(T(set.t)) + '</div>' +
      '<div class="pr-meta"><span>' + esc(T(TX.ref)) + ': ' + esc(ctx.serial || '') + '</span> · <span>' + esc(T(TX.issued)) + ' ' + esc(dt) + '</span></div></div></div>';

    /* part 1 */
    h += sec(TX.p1) + '<div class="pr-rv-p1"><div class="pr-ev-info">' +
      fld(TX.fTitle, D.title || 'SPACEZ TERMINAL', true) + fld(TX.fType, T(TX.fTypeV), true) + fld(TX.fUrl, SITE, true) +
      (D.devShow ? fld(TX.fDev, devName()) : '') + fld(TX.fSet, T(set.t) + ' · ' + n + ' ' + T(TX.items)) +
      (D.code ? '<div class="pr-ev-f"><span>' + esc(T(TX.fCode)) + '</span><b class="pr-rv-codebox">&nbsp;</b></div>' : '') +
      '</div>' + (D.qr && ctx.qr ? '<div class="pr-rv-qr"><div class="qb">' + ctx.qr(SITE) + '</div><span>' + esc(T(TX.qrCap)) + '</span></div>' : '') + '</div>';
    h += '<p class="pr-rv-purpose">' + esc(T(TX.purpose)) + '</p>';
    if(scope.length) h += '<div class="pr-ev-h">' + esc(T(TX.scopeH)) + '</div><ol class="pr-rv-scopel">' + scope.map(function(s){ return '<li>' + box(false) + esc(s) + '</span></li>'; }).join('') + '</ol>';
    if(lines(D.focus).length) h += '<div class="pr-ev-h">' + esc(T(TX.focusH)) + '</div><div class="pr-ev-text">' + esc(D.focus) + '</div>';
    if(lines(D.note).length) h += '<div class="pr-ev-h">' + esc(T(TX.noteH)) + '</div><div class="pr-ev-text">' + esc(D.note) + '</div>';

    /* part 2 */
    h += sec(TX.p2) + '<div class="pr-ev-info">' + fld(TX.rName, D.rev) + fld(TX.rDate, '') + fld(TX.rPos, D.revPos) + fld(TX.rOrg, D.revOrg) +
      '<div class="pr-ev-f w"><span>' + esc(T(TX.rField)) + '</span>' + opts(TX.fields) + '</div>' +
      '<div class="pr-ev-f"><span>' + esc(T(TX.rKnow)) + '</span>' + opts(TX.knows) + '</div>' +
      '<div class="pr-ev-f"><span>' + esc(T(TX.rDev)) + '</span>' + opts(TX.devs) + '</div></div>';

    /* part 3 */
    h += sec(TX.p3) + '<div class="pr-rv-how"><b>' + esc(T(TX.howH)) + '</b> ' + esc(T(TX.how)) + '</div>';
    if(n){
      var no = 0;
      h += '<table class="pr-rv-tbl"><thead><tr><th class="no">' + esc(T(TX.colNo)) + '</th><th>' + esc(T(TX.colItem)) + '</th><th class="s">5</th><th class="s">4</th><th class="s">3</th><th class="s">2</th><th class="s">1</th><th class="s na">' + esc(T(TX.colNA)) + '</th></tr></thead>';
      G.forEach(function(g, gi){
        h += '<tbody><tr class="gh"><td colspan="8">' + (gi + 1) + '. ' + esc(g.t) + '</td></tr>';
        g.it.forEach(function(it){ no++; h += '<tr><td class="no">' + no + '</td><td>' + esc(it) + '</td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s na"><i></i></td></tr>'; });
        h += '<tr class="sg"><td colspan="8"><span>' + esc(T(TX.sugg)) + ':</span></td></tr></tbody>';
      });
      h += '</table>';
    } else h += '<div class="pr-hint-s">—</div>';

    /* part 4: issue log */
    var part = 4;
    if(logOn()){
      h += sec(I('Part ' + part + ' · What you found', 'ตอนที่ ' + part + ' · บันทึกสิ่งที่พบ'));
      h += '<table class="pr-rv-log"><thead><tr><th class="no">' + esc(T(TX.colNo)) + '</th><th style="width:24%">' + esc(T(TX.lPage)) + '</th><th>' + esc(T(TX.lFound)) + '</th><th>' + esc(T(TX.lFix)) + '</th></tr></thead><tbody>';
      for(var r = 1; r <= 6; r++) h += '<tr><td class="no">' + r + '</td><td></td><td></td><td></td></tr>';
      h += '</tbody></table>';
      part++;
    }
    /* overall comments */
    h += sec(I('Part ' + part + ' · Overall comments', 'ตอนที่ ' + part + ' · ความคิดเห็นโดยรวม')); part++;
    h += '<div class="pr-rv-cm"><div class="pr-ev-h">' + esc(T(TX.good)) + '</div>' + linesH(3) + '</div>' +
      '<div class="pr-rv-cm"><div class="pr-ev-h">' + esc(T(TX.weak)) + '</div>' + linesH(3) + '</div>' +
      '<div class="pr-rv-cm"><div class="pr-ev-h">' + esc(T(TX.more)) + '</div>' + linesH(3) + '</div>';
    /* result */
    h += sec(I('Part ' + part + ' · Result', 'ตอนที่ ' + part + ' · สรุปผลการประเมิน'));
    h += '<div class="pr-rv-res"><div class="pr-rv-sum"><div class="pr-ev-h" style="margin-top:0">' + esc(T(TX.sumH)) + '</div>' +
      '<div class="row"><span>' + esc(T(TX.rated)) + '</span><b></b><em>/ ' + n + '</em></div>' +
      '<div class="row"><span>' + esc(T(TX.total)) + '</span><b></b><em>/ ' + (n * 5) + '</em></div>' +
      '<div class="row"><span>' + esc(T(TX.mean)) + '</span><b></b><em>/ 5.00</em></div></div>' +
      '<div class="pr-rv-band"><div class="pr-ev-h" style="margin-top:0">' + esc(T(TX.bandH)) + '</div><table>' + TX.bands.map(function(b){ return '<tr><td>' + b[0] + '</td><td>' + esc(T(b[1])) + '</td></tr>'; }).join('') + '</table></div></div>';
    h += '<div class="pr-rv-res2"><div><div class="pr-ev-h">' + esc(T(TX.ovH)) + '</div>' + opts(TX.ovs) + '</div>' +
      '<div><div class="pr-ev-h">' + esc(T(TX.recH)) + '</div><div class="pr-rv-recs">' + TX.recs.map(function(o){ return box(false) + esc(T(o)) + '</span>'; }).join('') + '</div></div></div>';
    /* signatures */
    function sign(role, name, pos){
      return '<div class="pr-rv-sign"><div class="ln"></div><div class="nm">( ' + (name ? esc(name) : '<i class="dots"></i>') + ' )</div><span>' + esc(T(role)) + '</span>' +
        '<div class="sub">' + esc(T(TX.signPos)) + ' ' + (pos ? esc(pos) : '<i class="dots s"></i>') + '</div><div class="sub">' + esc(T(TX.signDate)) + ' <i class="dots s"></i></div></div>';
    }
    h += '<div class="pr-rv-signs">' + (D.devSign ? sign(TX.signDev, D.devShow ? devName() : '', '') : '') + sign(TX.signRev, D.rev, D.revPos) + '</div>';
    h += '<div class="pr-rv-foot">' + esc(T(TX.foot)) + '<span>' + esc(ctx.serial || '') + '</span></div>';
    h += '</div>';
    return h;
  }

  window.__SPZ_REVIEWFORM = { label:function(){ return T(TX.type); }, formHTML:formHTML, sheetHTML:sheetHTML, handleInput:handleInput, handleClick:handleClick };
})();
