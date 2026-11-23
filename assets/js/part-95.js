/* ============================================================================
   SPACEZ TERMINAL -- Reviewer evaluation form (v2, 2026-11-18)
   A printable A4 form the owner hands to reviewers (lecturers, deans, teachers,
   directors, finance people) so they can score and comment on the site.
   Lives inside Print Report (#/printreport, part-49) as report type 'review':
   part-49 shows the button, the form panel (revWrap) and renders sheetHTML()
   into the preview.
   v2: default set = "complete" (every aspect in one form, N/A for anything
   outside the reviewer's field); site address = the Cloudflare address;
   a step-by-step "how to open the site / sign in / reach each part" guide for
   reviewers who know nothing about the site; terms + personal-data notice
   (PDPA B.E. 2562) + consent to quote; a short tick-box issue log; signature
   block in the Thai formal style, kept on one page.
   Settings: localStorage spz.review.form.v2 (the sign-in code is never saved).
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_REVIEWFORM && window.__SPZ_REVIEWFORM.v >= 2) return;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function I(en, th){ return { en:en, th:th }; }

  var SITE = 'https://terminal.spacezblack.workers.dev';
  var SITE_SHOW = 'terminal.spacezblack.workers.dev';

  var TX = {
    type:I('Reviewer form', 'แบบประเมินผลงาน'),
    docT:I('Work Evaluation Form', 'แบบประเมินผลงาน'),
    docS:I('for experts and qualified reviewers', 'สำหรับผู้ทรงคุณวุฒิและผู้เชี่ยวชาญ'),
    dept:I('Financial education platform', 'แพลตฟอร์มการเรียนรู้การเงินและการลงทุน'),
    hint:I('The complete set covers every aspect in one form — reviewers tick “N/A” for anything outside their field. Tick the parts they should look at, then press Print.',
           'ชุด “ฉบับสมบูรณ์” รวมทุกด้านไว้ในฉบับเดียว ผู้ประเมินเลือก “ไม่ประเมิน” ได้ในข้อที่ไม่ใช่ความเชี่ยวชาญของท่าน ติ๊กส่วนที่อยากให้ดู แล้วกดพิมพ์ได้เลยค่ะ'),
    setL:I('Form set', 'ชุดแบบประเมิน'),
    scopeL:I('Parts of the site to review', 'ส่วนที่ขอให้ประเมิน'),
    scopeOther:I('Other parts (one per line)', 'ส่วนอื่น ๆ (บรรทัดละ 1 ส่วน)'),
    extraL:I('Your own extra items (one per line)', 'หัวข้อประเมินเพิ่มเติม (บรรทัดละ 1 ข้อ)'),
    extraPh:I('e.g. The Elliott Wave lessons follow the official rules', 'เช่น บทเรียน Elliott Wave ถูกต้องตามหลักของ EWI'),
    noteL:I('Note to the reviewer (optional)', 'ข้อความถึงผู้ประเมิน (ไม่บังคับ)'),
    focusL:I('Please look closely at (optional)', 'จุดที่อยากให้ดูเป็นพิเศษ (ไม่บังคับ)'),
    titleL:I('Work title', 'ชื่อผลงาน'),
    devL:I('Developer', 'ผู้พัฒนา'),
    devShow:I('Print the developer name', 'พิมพ์ชื่อผู้พัฒนา'),
    revL:I('Reviewer name (leave blank to write by hand)', 'ชื่อผู้ประเมิน (เว้นว่างไว้ให้เขียนเองได้)'),
    revPosL:I('Position', 'ตำแหน่ง'), revOrgL:I('Organisation', 'หน่วยงาน'),
    codeL:I('Sign-in code to print (optional, never saved)', 'รหัสเข้าใช้งานที่จะพิมพ์ลงเอกสาร (ไม่บังคับ · ไม่บันทึกไว้)'),
    codeHint:I('Reviewers sign in with the same code as Editor. Leave it blank to write it on the paper yourself.', 'ผู้ประเมินใช้รหัสเดียวกับ Editor ถ้าเว้นว่าง เอกสารจะมีกรอบว่างให้เขียนรหัสด้วยมือ'),
    optsL:I('Include in the form', 'ส่วนประกอบในเอกสาร'),
    oGuide:I('How to open the site and reach each part', 'วิธีเข้าใช้งานเว็บไซต์และวิธีเข้าแต่ละส่วน'),
    oLog:I('Short issue log (tick boxes, little writing)', 'ตารางจุดที่ควรแก้ไขแบบสั้น (ติ๊กเป็นหลัก เขียนน้อย)'),
    oQr:I('QR code to open the site', 'QR สำหรับเปิดเว็บไซต์'),
    oTerms:I('Terms, personal-data notice and consent', 'ข้อตกลง การคุ้มครองข้อมูลส่วนบุคคล และความยินยอม'),
    oDevSign:I('Developer signature', 'ช่องลงนามผู้พัฒนา'),
    reset:I('Reset to default', 'คืนค่าเริ่มต้น'),
    items:I('items', 'ข้อ'),
    /* sheet */
    fTitle:I('Work', 'ชื่อผลงาน'), fType:I('Type of work', 'ประเภทผลงาน'),
    fTypeV:I('Web application for learning finance and investing (Thai / English)', 'เว็บแอปพลิเคชันเพื่อการเรียนรู้ด้านการเงินและการลงทุน (ภาษาไทย / อังกฤษ)'),
    fUrl:I('Website', 'ที่อยู่เว็บไซต์'), fDev:I('Developer', 'ผู้พัฒนา'), fSet:I('Form set', 'ชุดแบบประเมิน'),
    fCode:I('Reviewer sign-in code', 'รหัสเข้าใช้งาน (แท็บ “ผู้ประเมิน”)'),
    qrCap:I('Scan to open the site', 'สแกนเพื่อเปิดเว็บไซต์'),
    purposeH:I('Purpose', 'วัตถุประสงค์'),
    purpose:I('To ask qualified reviewers for an independent opinion on the quality of this work — its academic accuracy, teaching design, design and usability, and technology — so that it can be improved and used effectively for teaching and learning.',
              'เพื่อขอความอนุเคราะห์จากผู้ทรงคุณวุฒิในการพิจารณาและให้ความคิดเห็นต่อคุณภาพของผลงาน ทั้งด้านความถูกต้องทางวิชาการ การออกแบบการเรียนรู้ การออกแบบและการใช้งาน และด้านเทคโนโลยี เพื่อนำผลไปปรับปรุงและพัฒนาผลงานให้ใช้ประกอบการเรียนการสอนได้อย่างมีประสิทธิภาพ'),
    termsH:I('Terms and personal data', 'ข้อตกลงและการคุ้มครองข้อมูลส่วนบุคคล'),
    terms:[
      I('Your name, position and opinions are used only to improve this work and as supporting evidence of its quality in the developer\'s studies, in line with the Personal Data Protection Act B.E. 2562 (2019). They are not shared with anyone else, and are kept only as long as needed.',
        'ชื่อ ตำแหน่ง และความคิดเห็นของท่าน จะใช้เพื่อการปรับปรุงผลงาน และเป็นหลักฐานประกอบคุณภาพผลงานในการศึกษาของผู้พัฒนาเท่านั้น โดยปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 จะไม่เปิดเผยแก่บุคคลอื่น และเก็บรักษาไว้เท่าที่จำเป็น'),
      I('Your name or words are quoted only as you choose in the consent box at the end of this form. You may withdraw that consent at any time by telling the developer.',
        'การอ้างอิงชื่อหรือความคิดเห็นของท่าน จะเป็นไปตามที่ท่านเลือกในช่องความยินยอมท้ายเอกสารเท่านั้น และท่านสามารถเพิกถอนความยินยอมได้ทุกเมื่อโดยแจ้งผู้พัฒนา'),
      I('The website is for education only. It is not investment advice or an invitation to buy or sell any security. The reviewer access is read-only.',
        'เนื้อหาในเว็บไซต์จัดทำเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุนหรือการชักชวนให้ซื้อขายหลักทรัพย์ใด ๆ และสิทธิ์ผู้ประเมินเป็นแบบอ่านอย่างเดียว'),
      I('Please do not share the sign-in code or copy the content for other purposes. The content and design are the developer\'s copyright work.',
        'โปรดไม่เผยแพร่รหัสเข้าใช้งาน และไม่นำเนื้อหาไปใช้เพื่อวัตถุประสงค์อื่น เนื้อหาและการออกแบบเป็นลิขสิทธิ์ของผู้พัฒนา')
    ],
    guideH:I('How to open the site', 'วิธีเข้าใช้งานเว็บไซต์'),
    steps:[
      I('Open the address above in any web browser, or scan the QR code with your phone camera.', 'เปิดที่อยู่เว็บไซต์ด้านบนด้วยเบราว์เซอร์ใดก็ได้ หรือสแกน QR ด้วยกล้องโทรศัพท์'),
      I('Read the terms of use that appear first, then press accept.', 'อ่านข้อตกลงการใช้งานที่แสดงขึ้นก่อน แล้วกดยอมรับ'),
      I('The sign-in window opens by itself (if not, press the round person button at the bottom right). Choose the “Reviewer” tab and type the code from the box below.', 'หน้าต่างเข้าสู่ระบบจะเปิดขึ้นเอง (ถ้าไม่ขึ้น กดปุ่มวงกลมรูปคนที่มุมขวาล่าง) เลือกแท็บ “ผู้ประเมิน” แล้วกรอกรหัสในกรอบด้านล่าง'),
      I('When it works, a gold “Reviewer mode” badge appears at the bottom left — every page is now open to you, read-only.', 'เมื่อเข้าสำเร็จ จะมีป้าย “โหมดผู้ประเมิน” สีทองที่มุมซ้ายล่าง ท่านเปิดดูได้ทุกหน้า (อ่านอย่างเดียว)')
    ],
    tips:I('Tips: “EN / TH” at the top right switches language · “Search” (or the / key) finds any page · the sun / moon button switches light and dark.',
           'เคล็ดลับ: ปุ่ม “EN / TH” มุมขวาบนใช้สลับภาษา · ปุ่ม “ค้นหา” (หรือกดปุ่ม /) ใช้หาหน้าได้ทันที · ปุ่มพระอาทิตย์ / พระจันทร์ใช้สลับโหมดสว่าง–มืด'),
    codeBoxL:I('Sign-in code', 'รหัสเข้าใช้งาน'),
    codeBoxN:I('Reviewer tab', 'แท็บ “ผู้ประเมิน”'),
    scopeH:I('Parts we kindly ask you to review — and how to reach them', 'ส่วนที่ขอความอนุเคราะห์ให้ประเมิน และวิธีเข้าแต่ละส่วน'),
    colPart:I('Part of the site', 'ส่วนของเว็บไซต์'), colHow:I('How to get there', 'วิธีเข้า'),
    focusH:I('Please look closely at', 'จุดที่ขอให้พิจารณาเป็นพิเศษ'),
    noteH:I('Note from the developer', 'ข้อความจากผู้พัฒนา'),
    rName:I('Name – surname', 'ชื่อ – นามสกุล'), rPos:I('Position / academic title', 'ตำแหน่ง / ตำแหน่งทางวิชาการ'), rOrg:I('Organisation', 'หน่วยงาน / สถาบัน'),
    rDate:I('Date reviewed', 'วันที่ประเมิน'),
    rField:I('Field of expertise', 'ความเชี่ยวชาญ'),
    fields:[I('Finance / investing', 'การเงิน / การลงทุน'), I('Education / teaching', 'การศึกษา / การสอน'), I('Computers / technology', 'คอมพิวเตอร์ / เทคโนโลยี'), I('Design / media', 'การออกแบบ / สื่อ'), I('Other ……………', 'อื่น ๆ ……………')],
    rKnow:I('Familiarity with investing', 'ความคุ้นเคยกับการลงทุน'),
    knows:[I('None', 'ไม่มี'), I('Basic', 'พื้นฐาน'), I('Moderate', 'ปานกลาง'), I('High', 'สูง')],
    rDev:I('Device used', 'อุปกรณ์ที่ใช้'),
    devs:[I('Computer', 'คอมพิวเตอร์'), I('Tablet', 'แท็บเล็ต'), I('Mobile phone', 'โทรศัพท์มือถือ')],
    howH:I('How to rate', 'คำชี้แจง'),
    how:I('Tick ✓ one box per item: 5 = excellent · 4 = good · 3 = fair · 2 = needs work · 1 = needs a lot of work. Tick “N/A” for any item outside your field. A short note in “Suggestions” under each group helps a lot.',
          'โปรดทำเครื่องหมาย ✓ ข้อละ 1 ช่อง  5 = ดีมาก · 4 = ดี · 3 = ปานกลาง · 2 = พอใช้ · 1 = ควรปรับปรุง  ข้อใดไม่อยู่ในความเชี่ยวชาญของท่าน โปรดเลือก “ไม่ประเมิน” และหากท่านเขียนข้อเสนอแนะสั้น ๆ ใต้แต่ละด้าน จะเป็นประโยชน์อย่างยิ่งต่อการปรับปรุง'),
    colNo:I('No.', 'ที่'), colItem:I('Item', 'รายการประเมิน'), colNA:I('N/A', 'ไม่ประเมิน'),
    sugg:I('Suggestions', 'ข้อเสนอแนะ'),
    logH:I('Points to fix (optional · a few words is enough)', 'จุดที่ควรแก้ไข (ถ้ามี · เขียนสั้น ๆ พอ)'),
    logHint:I('Write the menu number or page name, tick what kind of issue it is, and add a few words.', 'เขียนเลขเมนูหรือชื่อหน้า ติ๊กประเภทของปัญหา แล้วเขียนสั้น ๆ เช่น “เมนู 08 · ตัวอักษรเล็กไป”'),
    lPage:I('Menu / page', 'เมนู / หน้า'), lKind:I('Kind', 'ประเภท'), lNote:I('In a few words', 'รายละเอียดสั้น ๆ'),
    kinds:[I('Content', 'เนื้อหา'), I('Look', 'หน้าตา'), I('Use', 'การใช้งาน'), I('System', 'ระบบ')],
    good:I('Strengths', 'จุดเด่นของผลงาน'), weak:I('What should be improved', 'สิ่งที่ควรปรับปรุง'), more:I('Other suggestions', 'ข้อเสนอแนะเพิ่มเติม'),
    sumH:I('Score summary', 'สรุปคะแนน'),
    total:I('Total score', 'คะแนนรวม'), mean:I('Mean', 'ค่าเฉลี่ย'), rated:I('Items rated', 'จำนวนข้อที่ประเมิน'),
    bandH:I('Reading the mean', 'เกณฑ์การแปลความหมาย'),
    bands:[['4.51 – 5.00', I('Excellent', 'ดีมาก')], ['3.51 – 4.50', I('Good', 'ดี')], ['2.51 – 3.50', I('Fair', 'ปานกลาง')], ['1.51 – 2.50', I('Needs work', 'พอใช้')], ['1.00 – 1.50', I('Needs a lot of work', 'ควรปรับปรุง')]],
    ovH:I('Overall quality', 'คุณภาพโดยรวม'),
    ovs:[I('Excellent', 'ดีมาก'), I('Good', 'ดี'), I('Fair', 'ปานกลาง'), I('Needs work', 'พอใช้'), I('Needs a lot of work', 'ควรปรับปรุง')],
    recH:I('Recommendation', 'ความเห็นต่อการนำไปใช้'),
    recs:[I('Suitable — ready to use', 'เหมาะสม นำไปใช้ได้ทันที'), I('Suitable after small changes', 'นำไปใช้ได้ เมื่อปรับปรุงตามข้อเสนอแนะ'), I('Should be improved before use', 'ควรปรับปรุงก่อนนำไปใช้')],
    conH:I('Consent to quote your opinion', 'ความยินยอมในการอ้างอิงความคิดเห็น'),
    cons:[I('You may quote my name and opinion', 'ยินยอมให้อ้างอิงชื่อและความคิดเห็น'), I('You may quote my opinion without my name', 'ยินยอมให้อ้างอิงความคิดเห็น โดยไม่ระบุชื่อ'), I('Please do not quote me', 'ไม่ยินยอมให้อ้างอิง')],
    signWord:I('Signed', 'ลงชื่อ'),
    signRev:I('Reviewer', 'ผู้ประเมิน'), signDev:I('Developer', 'ผู้พัฒนาผลงาน'),
    signPos:I('Position', 'ตำแหน่ง'), signDate:I('Date', 'วันที่'),
    foot:I('Thank you very much for your time and your valuable opinion.', 'ขอขอบพระคุณท่านเป็นอย่างสูง ที่กรุณาสละเวลาให้ความคิดเห็นอันเป็นประโยชน์ต่อการพัฒนาผลงาน'),
    ref:I('Ref.', 'เลขที่เอกสาร'), issued:I('Issued', 'วันที่ออก'),
    part:I('Part', 'ตอนที่')
  };
  var PARTS = {
    work:I('About the work', 'ข้อมูลผลงาน'), guide:I('How to use the site', 'วิธีเข้าใช้งานเว็บไซต์'),
    rev:I('About the reviewer', 'ข้อมูลผู้ประเมิน'), rate:I('Rating', 'ผลการประเมิน'),
    log:I('Points to fix', 'จุดที่ควรแก้ไข'), cm:I('Overall comments', 'ความคิดเห็นโดยรวม'), res:I('Summary and signatures', 'สรุปผลและลงนาม')
  };

  /* ---- form sets (every string EN + TH) ---- */
  var G_ACC = { t:I('Academic accuracy (finance & investing)', 'ด้านเนื้อหาและความถูกต้องทางวิชาการ (การเงินและการลงทุน)'), it:[
    I('Financial terms and definitions are correct', 'นิยามและคำศัพท์ทางการเงินถูกต้องตามหลักวิชา'),
    I('Formulas and worked examples are correct (returns, compounding, valuation)', 'สูตรและตัวอย่างการคำนวณถูกต้อง (ผลตอบแทน ดอกเบี้ยทบต้น การประเมินมูลค่า)'),
    I('Market facts and Thai rules are up to date', 'ข้อเท็จจริงของตลาดและกฎเกณฑ์ในประเทศไทยเป็นปัจจุบัน'),
    I('Sources are named and trustworthy', 'ระบุแหล่งที่มาของข้อมูลชัดเจนและน่าเชื่อถือ') ]};
  var G_ANA = { t:I('Analysis and reasoning', 'ด้านการวิเคราะห์และวิธีคิด'), it:[
    I('Elliott Wave rules, guidelines and wave counts are correct', 'หลักการ Elliott Wave (กฎ แนวทาง การนับคลื่น) ถูกต้อง'),
    I('Economic indicators and the market cycle are read correctly', 'การตีความตัวชี้วัดเศรษฐกิจและวัฏจักรตลาดถูกต้อง'),
    I('Stock scores and rankings have a clear, reasonable basis', 'วิธีให้คะแนนและจัดอันดับหุ้นมีเหตุผลรองรับชัดเจน'),
    I('Forecasts show their uncertainty and limits', 'การพยากรณ์แสดงช่วงความไม่แน่นอนและข้อจำกัดอย่างเหมาะสม') ]};
  var G_EDU = { t:I('Learning design and teaching', 'ด้านการออกแบบการเรียนรู้และวิธีการสอน'), it:[
    I('Learning objectives are clear', 'กำหนดจุดประสงค์การเรียนรู้ชัดเจน'),
    I('Lessons go step by step from easy to hard', 'ลำดับเนื้อหาจากง่ายไปยากอย่างเป็นขั้นตอน'),
    I('Pictures, diagrams and examples help understanding', 'ภาพ แผนภาพ และตัวอย่างช่วยให้เข้าใจง่าย'),
    I('Learners can try things themselves (calculators, practice)', 'มีกิจกรรมให้ผู้เรียนลงมือทำ (เครื่องคำนวณ แบบฝึก)'),
    I('Quizzes match the objectives and explain the answers', 'แบบทดสอบสอดคล้องกับจุดประสงค์ และมีคำอธิบายเฉลย') ]};
  var G_UX = { t:I('Design and user experience (UX/UI)', 'ด้านการออกแบบและประสบการณ์ผู้ใช้ (UX/UI)'), it:[
    I('It looks attractive, consistent and professional', 'หน้าตาสวยงาม สอดคล้องกันทั้งเว็บ และเป็นมืออาชีพ'),
    I('Menus and pages are easy to find', 'ค้นหาเมนูและหน้าที่ต้องการได้ง่าย'),
    I('Text is easy to read and well sized', 'ตัวอักษรอ่านง่าย ขนาดเหมาะสม'),
    I('Thai / English switching and light / dark modes work well', 'การสลับภาษาไทย / อังกฤษ และโหมดสว่าง / มืด ใช้งานได้ดี'),
    I('It works well on a phone or tablet', 'ใช้งานบนโทรศัพท์มือถือหรือแท็บเล็ตได้ดี') ]};
  var G_TECH = { t:I('Technology and system', 'ด้านเทคโนโลยีและระบบ'), it:[
    I('No errors or frozen pages were found', 'ไม่พบข้อผิดพลาดหรือหน้าค้าง'),
    I('Data updates by itself on schedule', 'ข้อมูลอัปเดตอัตโนมัติตามเวลาที่กำหนด'),
    I('Sign-in, user levels and data protection are appropriate', 'ระบบเข้าสู่ระบบ การแบ่งสิทธิ์ผู้ใช้ และการปกป้องข้อมูลเหมาะสม'),
    I('Pages load quickly', 'เปิดหน้าเว็บได้รวดเร็ว') ]};
  var G_ETH = { t:I('Ethics, risk and user protection', 'ด้านจริยธรรม ความเสี่ยง และการคุ้มครองผู้ใช้'), it:[
    I('Risks are explained and nothing pushes the reader to trade', 'มีการอธิบายความเสี่ยง และไม่ชี้นำให้ซื้อขาย'),
    I('Live data, simulations and teaching examples are clearly labelled', 'แยกข้อมูลจริง ข้อมูลจำลอง และตัวอย่างเพื่อการสอนอย่างชัดเจน') ]};
  var G_USE = { t:I('Value and use', 'ด้านประโยชน์และการนำไปใช้'), it:[
    I('It can be used in a real classroom', 'นำไปใช้ประกอบการสอนในชั้นเรียนได้จริง'),
    I('Learners can study on their own with it', 'ผู้เรียนใช้เรียนรู้ด้วยตนเองได้'),
    I('It is creative and original', 'มีความคิดสร้างสรรค์และแปลกใหม่'),
    I('I would recommend it to others', 'ท่านจะแนะนำผลงานนี้ให้ผู้อื่น') ]};
  var SETS = [
    { id:'full', t:I('Complete — every aspect (recommended)', 'ฉบับสมบูรณ์ · ประเมินครบทุกด้าน (แนะนำ)'),
      d:I('For every reviewer: finance experts, educators, designers and IT. Items outside the reviewer\'s field are ticked N/A.', 'ใช้ได้กับผู้ประเมินทุกท่าน ทั้งผู้เชี่ยวชาญการเงิน การศึกษา การออกแบบ และไอที ข้อที่ไม่ใช่ความเชี่ยวชาญเลือก “ไม่ประเมิน”'),
      groups:[G_ACC, G_ANA, G_EDU, G_UX, G_TECH, G_ETH, G_USE] },
    { id:'expert', t:I('Finance & investing expert', 'ผู้เชี่ยวชาญด้านการเงินและการลงทุน'),
      d:I('Content, formulas and analysis', 'ตรวจเนื้อหา สูตร และวิธีคิดวิเคราะห์'), groups:[G_ACC, G_ANA, G_ETH] },
    { id:'teach', t:I('Education & teaching', 'ผู้เชี่ยวชาญด้านการศึกษาและการสอน'),
      d:I('Learning design, media and assessment', 'การออกแบบบทเรียน สื่อ และการวัดผล'), groups:[G_EDU, G_USE] },
    { id:'uxui', t:I('Design & ease of use (UX/UI)', 'ด้านการออกแบบและการใช้งาน (UX/UI)'),
      d:I('No finance knowledge needed', 'ไม่ต้องมีความรู้เรื่องหุ้น'), groups:[G_UX, G_USE] },
    { id:'tech', t:I('Technology & system', 'ด้านเทคโนโลยีและระบบ'),
      d:I('Stability, security and speed', 'ความเสถียร ความปลอดภัย และความเร็ว'), groups:[G_TECH, G_UX] },
    { id:'custom', t:I('Custom — only your own items', 'กำหนดเอง · ใช้เฉพาะหัวข้อที่พิมพ์เอง'),
      d:I('Type your items in the box below', 'พิมพ์หัวข้อในช่องด้านล่าง'), groups:[] }
  ];
  /* parts of the site + how a first-time reviewer reaches each one (menu numbers as on the site, 2026-11-18) */
  var SCOPE = [
    ['home', I('Home page', 'หน้าแรก'), I('Opens first. Or press “Menu” at the top → 00 Home.', 'เปิดเว็บแล้วพบทันที หรือกด “เมนู” ด้านบน → 00 หน้าแรก')],
    ['learn', I('Stock Classroom (3-step course)', 'ห้องเรียนหุ้น (เรียน 3 ขั้น)'), I('“Menu” → 01 Stock Classroom', '“เมนู” → 01 ห้องเรียนหุ้น')],
    ['ew', I('Elliott Wave Classroom', 'ห้องเรียน Elliott Wave'), I('“Menu” → 08 Elliott Wave Classroom', '“เมนู” → 08 ห้องเรียน Elliott Wave')],
    ['market', I('Market pages (live data)', 'หน้าข้อมูลตลาด (ข้อมูลสด)'), I('“Menu” → 10 What now · 31 Bubble Radar · 35 Economic calendar', '“เมนู” → 10 ตอนนี้ควรทำอะไร · 31 เรดาร์ฟองสบู่ · 35 ปฏิทินเศรษฐกิจ')],
    ['brain', I('Market Brain', 'สมองตลาด (Market Brain)'), I('Sign in first, then “Menu” → the “Market Brain” card at the top', 'เข้าสู่ระบบก่อน แล้วกด “เมนู” → การ์ด “สมองตลาด” ด้านบน')],
    ['tools', I('Calculators and tools', 'เครื่องมือคำนวณ'), I('The “Tools ⚙” button on the top bar', 'ปุ่ม “เครื่องมือ ⚙” บนแถบด้านบน')],
    ['exams', I('Exam room (CEWA · IC)', 'ห้องสอบ (CEWA · IC)'), I('Sign in first, then “Menu” → the “Exam room” card', 'เข้าสู่ระบบก่อน แล้วกด “เมนู” → การ์ด “ห้องสอบ”')],
    ['ic', I('IC licence study site', 'เว็บติวสอบใบอนุญาต IC'), I('The 9-dot “SPACEZ apps” button on the top bar → IC licence', 'ปุ่ม “รวมเว็บ SPACEZ” (จุด 9 จุด) บนแถบด้านบน → สอบใบอนุญาต IC')],
    ['island', I('SPACEZ ISLAND economy game', 'เกมเศรษฐกิจ SPACEZ ISLAND'), I('“SPACEZ apps” button → SPACEZ ISLAND', 'ปุ่ม “รวมเว็บ SPACEZ” → เกม SPACEZ ISLAND')],
    ['admin', I('Admin system (board, reports)', 'ระบบผู้ดูแล (บอร์ดบริหาร พิมพ์รายงาน)'), I('Shown by the developer (needs admin rights)', 'ผู้พัฒนาเป็นผู้สาธิตให้ชม (ต้องใช้สิทธิ์ผู้ดูแลระบบ)')]
  ];
  var LS = 'spz.review.form.v2';
  var CODE = '';   /* sign-in code to print -- memory only, never saved */

  function blank(){
    return { set:'full', scope:{ home:1, learn:1, ew:1, market:1, tools:1 }, scopeOther:'', extra:'', note:'', focus:'',
      title:'SPACEZ TERMINAL', dev:'', devShow:1, rev:'', revPos:'', revOrg:'',
      guide:1, log:1, qr:1, terms:1, devSign:1 };
  }
  var D = blank();
  try { var sv = JSON.parse(localStorage.getItem(LS) || 'null'); if(sv && typeof sv === 'object') Object.keys(sv).forEach(function(k){ if(k in D) D[k] = sv[k]; }); } catch(e){}
  function save(){ try { localStorage.setItem(LS, JSON.stringify(D)); } catch(e){} }
  function setOf(id){ for(var i = 0; i < SETS.length; i++) if(SETS[i].id === id) return SETS[i]; return SETS[0]; }
  function lines(s){ return String(s || '').split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean); }
  function groups(){
    var g = setOf(D.set).groups.map(function(x){ return { t:T(x.t), it:x.it.map(T) }; });
    var ex = lines(D.extra);
    if(ex.length) g.push({ t:T(I('Additional items from the developer', 'หัวข้อเพิ่มเติมจากผู้พัฒนา')), it:ex });
    return g;
  }
  function devName(){ return String(D.dev || '').trim() || (L() === 'th' ? 'นายนรเศรษฐ์ บ่อแก้ว' : 'Noraset Boikaw'); }
  function count(){ return groups().reduce(function(a, g){ return a + g.it.length; }, 0); }

  /* ---------- form (left panel) ---------- */
  function formHTML(){
    function inp(k, lbl, ph, val){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><input type="text" data-rv="' + k + '" value="' + esc(val != null ? val : (D[k] || '')) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' autocomplete="off"></label>'; }
    function area(k, lbl, ph, rows){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><textarea rows="' + (rows || 3) + '" data-rv="' + k + '"' + (ph ? ' placeholder="' + esc(T(ph)) + '"' : '') + '>' + esc(D[k] || '') + '</textarea></label>'; }
    function chk(k, lbl, on){ return '<label class="pr-rv-ck"><input type="checkbox" data-rv-ck="' + k + '"' + (on ? ' checked' : '') + '><span>' + esc(T(lbl)) + '</span></label>'; }
    var h = '<div class="pr-hint" style="margin-bottom:10px;">' + esc(T(TX.hint)) + '</div>';
    h += '<div class="pr-ev-h2" style="margin-top:0">' + esc(T(TX.setL)) + '</div><div class="pr-rv-sets">' + SETS.map(function(s){
      var n = s.groups.reduce(function(a, g){ return a + g.it.length; }, 0);
      return '<button type="button" class="pr-rv-set' + (D.set === s.id ? ' on' : '') + (s.id === 'full' ? ' main' : '') + '" data-rv-set="' + s.id + '"><b>' + esc(T(s.t)) + '</b><span>' + esc(T(s.d)) + (n ? ' · ' + n + ' ' + esc(T(TX.items)) : '') + '</span></button>';
    }).join('') + '</div>';
    h += area('extra', TX.extraL, TX.extraPh, 3);
    h += '<div class="pr-ev-h2">' + esc(T(TX.scopeL)) + '</div><div class="pr-rv-scope">' + SCOPE.map(function(s){ return chk('sc_' + s[0], s[1], D.scope && D.scope[s[0]]); }).join('') + '</div>';
    h += area('scopeOther', TX.scopeOther, null, 2);
    h += area('focus', TX.focusL, null, 2) + area('note', TX.noteL, null, 2);
    h += '<div class="pr-ev-h2">' + esc(T(TX.codeL)) + '</div>' + inp('__code', TX.codeL, '', CODE) + '<div class="pr-hint" style="margin:-4px 0 8px;">' + esc(T(TX.codeHint)) + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.titleL)) + ' · ' + esc(T(TX.devL)) + '</div>' + inp('title', TX.titleL) + inp('dev', TX.devL, devName()) + chk('devShow', TX.devShow, D.devShow);
    h += '<div class="pr-ev-h2">' + esc(T(TX.signRev)) + '</div>' + inp('rev', TX.revL) + '<div class="pr-ev-grid2">' + inp('revPos', TX.revPosL) + inp('revOrg', TX.revOrgL) + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.optsL)) + '</div>' + chk('guide', TX.oGuide, D.guide) + chk('terms', TX.oTerms, D.terms) + chk('log', TX.oLog, D.log) + chk('qr', TX.oQr, D.qr) + chk('devSign', TX.oDevSign, D.devSign);
    h += '<button type="button" class="pr-ev-bigbtn ghost" data-rv-reset="1">' + esc(T(TX.reset)) + '</button>';
    return h;
  }
  function handleInput(t){
    if(!t || !t.getAttribute) return false;
    var k = t.getAttribute('data-rv');
    if(k === '__code'){ CODE = t.value; return true; }
    if(k){ D[k] = t.value; save(); return true; }
    var c = t.getAttribute('data-rv-ck');
    if(c){
      if(c.indexOf('sc_') === 0){ D.scope = D.scope || {}; D.scope[c.slice(3)] = t.checked ? 1 : 0; }
      else D[c] = t.checked ? 1 : 0;
      save(); return true;
    }
    return false;
  }
  /* 'form' = redraw the panel too; true = only the sheet changed */
  function handleClick(t){
    var s = t.closest && t.closest('[data-rv-set]');
    if(s){ D.set = s.getAttribute('data-rv-set'); save(); return 'form'; }
    if(t.closest && t.closest('[data-rv-reset]')){ var keep = { title:D.title, dev:D.dev, rev:D.rev, revPos:D.revPos, revOrg:D.revOrg }; D = blank(); Object.keys(keep).forEach(function(k){ D[k] = keep[k]; }); save(); return 'form'; }
    return false;
  }

  /* ---------- the A4 sheet ---------- */
  function sheetHTML(ctx){
    ctx = ctx || {};
    var set = setOf(D.set), G = groups(), n = count(), th = L() === 'th';
    var d = new Date(), dt = th
      ? d.getDate() + ' ' + ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'][d.getMonth()] + ' ' + (d.getFullYear() + 543)
      : d.getDate() + ' ' + ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()] + ' ' + d.getFullYear();
    var pn = 0;
    function box(){ return '<span class="rv-ck"><i></i>'; }
    function opts(arr){ return '<div class="rv-opts">' + arr.map(function(o){ return box() + esc(T(o)) + '</span>'; }).join('') + '</div>'; }
    function sec(key){ pn++; return '<div class="rv-sec"><span class="n">' + pn + '</span><span class="t"><em>' + esc(T(TX.part)) + ' ' + pn + '</em>' + esc(T(PARTS[key])) + '</span></div>'; }
    function lns(k){ var o = ''; for(var i = 0; i < k; i++) o += '<i></i>'; return '<div class="rv-lines">' + o + '</div>'; }
    function kv(k, v, cls){ return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th>' + esc(T(k)) + '</th><td>' + v + '</td></tr>'; }

    var scope = SCOPE.filter(function(s){ return D.scope && D.scope[s[0]]; }).map(function(s){ return [T(s[1]), T(s[2])]; })
      .concat(lines(D.scopeOther).map(function(x){ return [x, '']; }));
    var h = '<div class="pr-sheet pr-rv2">';

    /* header */
    h += '<div class="rv-head">' +
      '<div class="rv-brand">' + (ctx.logo ? '<img src="' + ctx.logo + '" alt="">' : '') + '<div><b>SPACEZ TERMINAL</b><span>' + esc(T(TX.dept)) + '</span></div></div>' +
      '<div class="rv-ref"><div><span>' + esc(T(TX.ref)) + '</span><b>' + esc(ctx.serial || '') + '</b></div><div><span>' + esc(T(TX.issued)) + '</span><b>' + esc(dt) + '</b></div></div>' +
    '</div>' +
    '<div class="rv-title"><div class="rv-t1">' + esc(T(TX.docT)) + '</div><div class="rv-t2">' + esc(T(TX.docS)) + '</div>' +
      '<div class="rv-t3"><i></i><span>' + esc(D.title || 'SPACEZ TERMINAL') + ' · ' + esc(T(set.t)) + '</span><i></i></div></div>';

    /* part: work */
    h += sec('work') + '<div class="rv-work"><table class="rv-kv">' +
      kv(TX.fTitle, '<b>' + esc(D.title || 'SPACEZ TERMINAL') + '</b>') + kv(TX.fType, esc(T(TX.fTypeV))) +
      kv(TX.fUrl, '<b class="url">' + esc(SITE_SHOW) + '</b>') +
      (D.devShow ? kv(TX.fDev, esc(devName())) : '') + kv(TX.fSet, esc(T(set.t)) + ' · ' + n + ' ' + esc(T(TX.items))) +
      '</table>' + (D.qr && ctx.qr ? '<div class="rv-qr"><div class="qb">' + ctx.qr(SITE) + '</div><span>' + esc(T(TX.qrCap)) + '</span></div>' : '') + '</div>';
    h += '<div class="rv-note"><b>' + esc(T(TX.purposeH)) + '</b>' + esc(T(TX.purpose)) + '</div>';
    if(D.terms) h += '<div class="rv-terms"><div class="h">' + esc(T(TX.termsH)) + '</div><ol>' + TX.terms.map(function(x){ return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ol></div>';

    /* part: guide (how to open + where things are) */
    if(D.guide){
      h += sec('guide') + '<div class="rv-guide"><ol class="rv-steps">' + TX.steps.map(function(x, i){ return '<li><span class="n">' + (i + 1) + '</span><span>' + esc(T(x)) + '</span></li>'; }).join('') + '</ol>' +
        '<div class="rv-code"><span>' + esc(T(TX.codeBoxL)) + '</span><div class="b">' + (CODE ? esc(CODE) : '') + '</div><em>' + esc(T(TX.codeBoxN)) + '</em></div></div>';
      h += '<div class="rv-tips">' + esc(T(TX.tips)) + '</div>';
      if(scope.length) h += '<div class="rv-sub">' + esc(T(TX.scopeH)) + '</div><table class="rv-scope"><thead><tr><th class="no">' + esc(T(TX.colNo)) + '</th><th style="width:38%">' + esc(T(TX.colPart)) + '</th><th>' + esc(T(TX.colHow)) + '</th></tr></thead><tbody>' +
        scope.map(function(s, i){ return '<tr><td class="no">' + (i + 1) + '</td><td><b>' + esc(s[0]) + '</b></td><td>' + esc(s[1]) + '</td></tr>'; }).join('') + '</tbody></table>';
    } else if(scope.length){
      h += '<div class="rv-sub">' + esc(T(TX.scopeH)) + '</div><ol class="rv-scopel">' + scope.map(function(s){ return '<li>' + esc(s[0]) + '</li>'; }).join('') + '</ol>';
    }
    if(lines(D.focus).length) h += '<div class="rv-note alt"><b>' + esc(T(TX.focusH)) + '</b>' + esc(D.focus) + '</div>';
    if(lines(D.note).length) h += '<div class="rv-note alt"><b>' + esc(T(TX.noteH)) + '</b>' + esc(D.note) + '</div>';

    /* part: reviewer */
    function f(lbl, val){ return '<div class="rv-f"><span>' + esc(T(lbl)) + '</span><b>' + (val ? esc(val) : '&nbsp;') + '</b></div>'; }
    h += '<div class="rv-keep">' + sec('rev') + '<div class="rv-info">' + f(TX.rName, D.rev) + f(TX.rDate, '') + f(TX.rPos, D.revPos) + f(TX.rOrg, D.revOrg) +
      '<div class="rv-f w"><span>' + esc(T(TX.rField)) + '</span>' + opts(TX.fields) + '</div>' +
      '<div class="rv-f"><span>' + esc(T(TX.rKnow)) + '</span>' + opts(TX.knows) + '</div>' +
      '<div class="rv-f"><span>' + esc(T(TX.rDev)) + '</span>' + opts(TX.devs) + '</div></div></div>';

    /* part: rating */
    h += '<div class="rv-keep">' + sec('rate') + '<div class="rv-how"><b>' + esc(T(TX.howH)) + '</b>' + esc(T(TX.how)) + '</div></div>';
    if(n){
      var no = 0;
      h += '<table class="rv-tbl"><thead><tr><th class="no">' + esc(T(TX.colNo)) + '</th><th class="it">' + esc(T(TX.colItem)) + '</th><th class="s">5</th><th class="s">4</th><th class="s">3</th><th class="s">2</th><th class="s">1</th><th class="s na">' + esc(T(TX.colNA)) + '</th></tr></thead>';
      G.forEach(function(g, gi){
        h += '<tbody><tr class="gh"><td colspan="8"><span class="gn">' + (gi + 1) + '</span>' + esc(g.t) + '</td></tr>';
        g.it.forEach(function(it){ no++; h += '<tr><td class="no">' + no + '</td><td>' + esc(it) + '</td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s"><i></i></td><td class="s na"><i></i></td></tr>'; });
        h += '<tr class="sg"><td colspan="8"><span>' + esc(T(TX.sugg)) + '</span></td></tr></tbody>';
      });
      h += '</table>';
    }

    /* part: short issue log */
    if(D.log){
      h += '<div class="rv-keep">' + sec('log') + '<div class="rv-hint">' + esc(T(TX.logHint)) + '</div>' +
        '<table class="rv-log"><thead><tr><th class="no">' + esc(T(TX.colNo)) + '</th><th style="width:17%">' + esc(T(TX.lPage)) + '</th><th style="width:41%">' + esc(T(TX.lKind)) + '</th><th>' + esc(T(TX.lNote)) + '</th></tr></thead><tbody>';
      for(var r = 1; r <= 3; r++) h += '<tr><td class="no">' + r + '</td><td></td><td><div class="rv-kinds">' + TX.kinds.map(function(k){ return box() + esc(T(k)) + '</span>'; }).join('') + '</div></td><td></td></tr>';
      h += '</tbody></table></div>';
    }

    /* part: comments */
    h += '<div class="rv-keep">' + sec('cm') + '<div class="rv-cm2"><div class="rv-cm"><div class="h">' + esc(T(TX.good)) + '</div>' + lns(3) + '</div>' +
      '<div class="rv-cm"><div class="h">' + esc(T(TX.weak)) + '</div>' + lns(3) + '</div></div>' +
      '<div class="rv-cm"><div class="h">' + esc(T(TX.more)) + '</div>' + lns(2) + '</div></div>';

    /* part: result + consent + signatures (kept together on one page) */
    function sign(role, name, pos, img, cred){
      /* 2026-11-21: the developer's own signature picture (kept on this device by part-98, window.__SPZ_SIGN) sits on the line */
      return '<div class="rv-sign"><div class="l1"><span>' + esc(T(TX.signWord)) + '</span><i>' + (img ? '<img class="rv-sigimg" src="' + img + '" alt="">' : '') + '</i></div>' +
        '<div class="l2">( ' + (name ? '<b>' + esc(name) + '</b>' : '<i></i>') + ' )</div>' +
        '<div class="l3">' + esc(T(role)) + '</div>' + (cred ? '<div class="l3 rv-cred">' + esc(cred) + '</div>' : '') +
        '<div class="l4"><span>' + esc(T(TX.signPos)) + '</span>' + (pos ? '<b>' + esc(pos) + '</b>' : '<i></i>') + '</div>' +
        '<div class="l4"><span>' + esc(T(TX.signDate)) + '</span><i></i></div></div>';
    }
    h += '<div class="rv-end">' + sec('res') +
      '<div class="rv-res"><div class="rv-sum"><div class="h">' + esc(T(TX.sumH)) + '</div>' +
        '<div class="row"><span>' + esc(T(TX.rated)) + '</span><b></b><em>/ ' + n + '</em></div>' +
        '<div class="row"><span>' + esc(T(TX.total)) + '</span><b></b><em>/ ' + (n * 5) + '</em></div>' +
        '<div class="row"><span>' + esc(T(TX.mean)) + '</span><b></b><em>/ 5.00</em></div></div>' +
        '<div class="rv-band"><div class="h">' + esc(T(TX.bandH)) + '</div><table>' + TX.bands.map(function(b){ return '<tr><td>' + b[0] + '</td><td>' + esc(T(b[1])) + '</td></tr>'; }).join('') + '</table></div></div>' +
      '<div class="rv-res3"><div><div class="h">' + esc(T(TX.ovH)) + '</div>' + opts(TX.ovs) + '</div>' +
        '<div><div class="h">' + esc(T(TX.recH)) + '</div><div class="rv-col">' + TX.recs.map(function(o){ return box() + esc(T(o)) + '</span>'; }).join('') + '</div></div>' +
        (D.terms ? '<div><div class="h">' + esc(T(TX.conH)) + '</div><div class="rv-col">' + TX.cons.map(function(o){ return box() + esc(T(o)) + '</span>'; }).join('') + '</div></div>' : '') +
      '</div>' +
      '<div class="rv-signs' + (D.devSign ? '' : ' one') + '">' + sign(TX.signRev, D.rev, D.revPos) + (D.devSign ? sign(TX.signDev, D.devShow ? devName() : '', '', window.__SPZ_SIGN && window.__SPZ_SIGN.get(), /* 2026-11-23: CEWA line when ticked (part-70) */ window.__SPZ_CRED && window.__SPZ_CRED.on() ? window.__SPZ_CRED.title() : '') : '') + '</div>' +
      '<div class="rv-foot"><span>' + esc(T(TX.foot)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>' +
    '</div>';
    h += '</div>';
    return h;
  }

  window.__SPZ_REVIEWFORM = { v:2, label:function(){ return T(TX.type); }, formHTML:formHTML, sheetHTML:sheetHTML, handleInput:handleInput, handleClick:handleClick };
})();
