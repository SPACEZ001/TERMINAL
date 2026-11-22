/* ===================== SPACEZ OFFICIAL LETTER (2026-11-21) =====================
   Print Report (#/printreport, part-49) type "letter": a formal letter from SPACEZ TERMINAL
   ("เรียน … เรื่อง … เพื่อ …") laid out like a Thai official external letter — reference no.,
   date, subject, salutation, references, enclosures, body, closing, signature, contact + QR.
   - 7 ready-made purposes (ask to evaluate the site, invite as an expert reviewer, ask for a
     trial / data collection, thank-you, introduce the platform, invite to an event, blank);
     picking one fills the subject and body, and every line stays editable.
   - two looks: "classic" (white, navy + gold hairlines) and "modern" (navy band header).
   - prints / saves as an A4 PDF through the normal Print button, and saves two pictures:
     an A4 PNG and a 1080×1920 story picture (the letter on a SPACEZ background).
   Same interface as part-95's reviewer form: window.__SPZ_LETTER = { label, formHTML,
   sheetHTML(ctx), handleInput, handleClick, fit }. Settings: localStorage spz.letter.v1.
   Styles: assets/css/part-98.css. */
(function(){
  'use strict';
  var LS = 'spz.letter.v1';
  var SITE = 'https://terminal.spacezblack.workers.dev', SITE_SHOW = 'terminal.spacezblack.workers.dev';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : (typeof o === 'string' ? o : (o[L()] || o.en || '')); }
  function I(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var TX = {
    type:I('Official letter', 'จดหมายทางการ'),
    hint:I('A formal letter from SPACEZ TERMINAL. Pick a purpose — the subject and text fill in — then edit any line. The letter follows the page language (EN / TH). Print → save as PDF, or save it as a picture for a story.',
           'หนังสือทางการจาก SPACEZ TERMINAL เลือกจุดประสงค์ ระบบจะเติมเรื่องและเนื้อความให้ แล้วแก้ได้ทุกบรรทัด ภาษาของจดหมายตามภาษาของหน้าเว็บ (EN / TH) กดพิมพ์เพื่อบันทึกเป็น PDF หรือบันทึกเป็นรูปไว้ลงสตอรี่ได้'),
    tplL:I('1 · Purpose of the letter', '1 · จุดประสงค์ของหนังสือ'),
    toL:I('2 · To (เรียน)', '2 · เรียน (ผู้รับ)'),
    toTitle:I('Title', 'คำนำหน้า / ตำแหน่ง'), toName:I('Name', 'ชื่อ–นามสกุล'), toPos:I('Position (optional)', 'ตำแหน่ง (ถ้ามี)'), toOrg:I('Organisation (optional)', 'หน่วยงาน (ถ้ามี)'),
    subjL:I('3 · Subject and text', '3 · เรื่องและเนื้อความ'),
    subj:I('Subject (เรื่อง)', 'เรื่อง'), refTo:I('Reference (อ้างถึง) — optional', 'อ้างถึง (ถ้ามี)'), att:I('Enclosures — one per line (optional)', 'สิ่งที่ส่งมาด้วย — บรรทัดละรายการ (ถ้ามี)'),
    p1:I('Paragraph 1 — background', 'ย่อหน้า 1 — ความเป็นมา'), p2:I('Paragraph 2 — purpose / request (เพื่อ…)', 'ย่อหน้า 2 — วัตถุประสงค์ / สิ่งที่ขอ (เพื่อ…)'), p3:I('Paragraph 3 — details (optional)', 'ย่อหน้า 3 — รายละเอียดเพิ่ม (ถ้ามี)'),
    close:I('Closing line (จึงเรียนมาเพื่อ…)', 'ย่อหน้าปิด (จึงเรียนมาเพื่อ…)'),
    cc:I('Copy to (สำเนาเรียน) — optional', 'สำเนาเรียน (ถ้ามี)'),
    fromL:I('4 · Sender', '4 · ผู้ลงนาม'),
    from:I('Name', 'ชื่อผู้ลงนาม'), fromPos:I('Position', 'ตำแหน่ง'), contact:I('Contact line (optional) — phone / e-mail', 'ช่องทางติดต่อเพิ่มเติม (ถ้ามี) — โทร / อีเมล'),
    lookL:I('5 · Look and options', '5 · รูปแบบและตัวเลือก'),
    lkClassic:I('Classic · white paper, navy + gold lines', 'คลาสสิก · กระดาษขาว เส้นน้ำเงิน–ทอง'), lkModern:I('Modern · navy header band', 'โมเดิร์น · แถบหัวกระดาษสีน้ำเงิน'),
    oQr:I('QR code to the website', 'คิวอาร์โค้ดไปที่เว็บไซต์'), oUrgent:I('Speed class (red, top left)', 'ชั้นความเร็ว (ตัวแดง มุมซ้ายบน)'), oSeal:I('Round SPACEZ seal next to the signature', 'ตราวงกลม SPACEZ ข้างลายเซ็น'),
    saveL:I('6 · Save', '6 · บันทึก'),
    pngA4:I('Save as picture · A4 (PNG)', 'บันทึกเป็นรูป · A4 (PNG)'), pngStory:I('Save as story picture · 9:16 (PNG)', 'บันทึกเป็นรูปสตอรี่ · 9:16 (PNG)'),
    pdfHint:I('For a PDF use the Print button below → "Save as PDF".', 'ถ้าต้องการ PDF กดปุ่มพิมพ์ด้านล่าง → เลือก "บันทึกเป็น PDF"'),
    making:I('Making the picture…', 'กำลังสร้างรูป…'), made:I('Saved to your downloads.', 'บันทึกลงโฟลเดอร์ดาวน์โหลดแล้ว'), fail:I('Could not make the picture — try again.', 'สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง'),
    reset:I('Reset to the purpose\'s text', 'คืนข้อความตั้งต้นของจุดประสงค์นี้'),
    tooLong:I('The text is long — the letter has been set in a smaller font to stay on one A4 page.', 'เนื้อความยาว ระบบย่อตัวอักษรลงเล็กน้อยให้อยู่ในกระดาษ A4 หน้าเดียว'),
    overflow:I('Still longer than one A4 page — please shorten the text.', 'ยังยาวเกิน 1 หน้า A4 ลองตัดข้อความให้สั้นลงนะคะ'),
    /* sheet words */
    no:I('Ref.', 'ที่'), subjW:I('Subject', 'เรื่อง'), toW:I('To', 'เรียน'), refW:I('Reference', 'อ้างถึง'), attW:I('Enclosures', 'สิ่งที่ส่งมาด้วย'),
    yours:I('Yours sincerely,', 'ขอแสดงความนับถือ'), ccW:I('Copy to', 'สำเนาเรียน'),
    org:I('SPACEZ TERMINAL', 'SPACEZ TERMINAL'), orgSub:I('Financial education platform', 'แพลตฟอร์มการเรียนรู้การเงินและการลงทุน'),
    dept:I('Office of the Founder', 'สำนักงานผู้ก่อตั้ง'),
    urgent:I('URGENT', 'ด่วน'), seal:I('OFFICIAL', 'ทางการ'),
    /* 2026-11-21 (b): the three speed classes of a Thai official letter */
    urg:[I('None', 'ไม่ระบุ'), I('URGENT', 'ด่วน'), I('VERY URGENT', 'ด่วนมาก'), I('MOST URGENT', 'ด่วนที่สุด')],
    qrCap:I('Scan to open the website', 'สแกนเพื่อเปิดเว็บไซต์'),
    footL:I('Document issued by SPACEZ TERMINAL', 'เอกสารออกโดย SPACEZ TERMINAL'),
    storyKind:I('Official letter', 'หนังสือทางการ'),
    /* 2026-11-21 (c): signature, letter date, enclosure page (site guide + sign-in details) */
    sigL:I('Signature', 'ลายเซ็น'), sigUp:I('Upload a picture (PNG / JPG)', 'อัปโหลดรูปลายเซ็น (PNG / JPG)'), sigDraw:I('Sign with finger / mouse', 'เซ็นเองด้วยนิ้ว / เมาส์'), sigClear:I('Remove', 'ลบลายเซ็น'),
    sigNone:I('No signature yet — the letter keeps an empty space to sign by hand.', 'ยังไม่มีลายเซ็น — หนังสือจะเว้นที่ว่างไว้ให้เซ็นด้วยมือ'),
    sigNote:I('Kept only in this browser on this device — never uploaded to the website. A white paper background in a photo is removed automatically.', 'เก็บไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไม่อัปขึ้นเว็บไซต์ ถ้าถ่ายรูปลายเซ็นบนกระดาษขาว ระบบจะลบพื้นขาวออกให้เอง'),
    sigStory:I('Show the signature on the story picture too', 'แสดงลายเซ็นในรูปสตอรี่ด้วย (ปกติซ่อนไว้ เพื่อกันคนนำลายเซ็นไปใช้)'),
    padH:I('Sign in the box', 'เซ็นชื่อในกรอบ'), padUse:I('Use this signature', 'ใช้ลายเซ็นนี้'), padAgain:I('Clear', 'ล้าง'), padCancel:I('Cancel', 'ยกเลิก'),
    dateL:I('Date on the letter — leave empty for today (changes by itself)', 'วันที่ในหนังสือ — เว้นว่าง = วันนี้ (เปลี่ยนเองอัตโนมัติ)'), datePh:I('e.g. 1 December 2026', 'เช่น 1 ธันวาคม 2569'),
    encL:I('7 · Enclosure page (page 2)', '7 · หน้าสิ่งที่ส่งมาด้วย (หน้า 2)'),
    oGuide:I('Add page 2: how to open the website and the Market Brain', 'เพิ่มหน้า 2: คู่มือการเข้าใช้งานเว็บไซต์และสมองตลาด'),
    oAcc:I('Include a sign-in box on page 2', 'ใส่กล่องข้อมูลเข้าระบบในหน้า 2'),
    accUser:I('User name (optional)', 'ชื่อผู้ใช้ (ถ้ามี)'), accCode:I('Sign-in code — not saved, type it each time (empty = a line to write by hand)', 'รหัสเข้าระบบ — ไม่บันทึก ต้องพิมพ์ใหม่ทุกครั้ง (เว้นว่าง = เว้นเส้นให้เขียนด้วยมือ)'),
    accWarn:I('Page 2 is never part of the story picture, so the code never goes on a story.', 'หน้า 2 ไม่อยู่ในรูปสตอรี่ รหัสจึงไม่หลุดไปในสตอรี่'),
    defFrom:I('Mr. Noraset Boikaw', 'นายนรเศรษฐ์ บ่อแก้ว'), defPos:I('Founder and Developer, SPACEZ TERMINAL', 'ผู้ก่อตั้งและผู้พัฒนา SPACEZ TERMINAL')
  };
  var TITLES = [I('Lecturer', 'อาจารย์'), I('Asst. Prof.', 'ผู้ช่วยศาสตราจารย์'), I('Assoc. Prof.', 'รองศาสตราจารย์'), I('Prof.', 'ศาสตราจารย์'), I('Dr.', 'ดร.'),
    I('Dean', 'คณบดี'), I('Director', 'ผู้อำนวยการ'), I('Teacher', 'คุณครู'), I('Mr./Ms.', 'คุณ'), I('', 'ท่าน')];
  var MTH = { th:['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
    en:['January','February','March','April','May','June','July','August','September','October','November','December'] };

  /* ---------- ready-made purposes ---------- */
  var SITEW = 'SPACEZ TERMINAL (' + SITE_SHOW + ')';
  var TPL = [
    { id:'eval', g:'ask', t:I('Ask to evaluate the website', 'ขอความอนุเคราะห์ประเมินเว็บไซต์'), d:I('to a lecturer, teacher or expert, with the evaluation form', 'ส่งถึงอาจารย์ ครู หรือผู้เชี่ยวชาญ พร้อมแบบประเมิน'),
      subj:I('Request for an evaluation of the SPACEZ TERMINAL website', 'ขอความอนุเคราะห์ประเมินคุณภาพเว็บไซต์ SPACEZ TERMINAL'),
      p1:I('SPACEZ TERMINAL has developed a website for learning about finance and investing — beginner lessons, market analysis tools, an Elliott Wave classroom and exam practice — available at ' + SITEW + '.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาเว็บไซต์เพื่อการเรียนรู้ด้านการเงินและการลงทุน ประกอบด้วยบทเรียนสำหรับผู้เริ่มต้น เครื่องมือวิเคราะห์ตลาด ห้องเรียนคลื่นเอลเลียต และแบบฝึกหัดเตรียมสอบ เปิดให้ใช้งานผ่านเว็บไซต์ ' + SITEW),
      p2:I('So that the work is accurate, sound and suited to its users, we would be most grateful if you, as a person of knowledge and experience in this field, could evaluate the website using the enclosed form — its content, design and ease of use.',
           'เพื่อให้การพัฒนาเป็นไปอย่างมีคุณภาพ ถูกต้องตามหลักวิชาการ และเหมาะสมกับผู้ใช้งาน จึงใคร่ขอความอนุเคราะห์จากท่านในฐานะผู้มีความรู้และประสบการณ์ ช่วยประเมินคุณภาพเว็บไซต์ตามแบบประเมินที่ส่งมาพร้อมนี้ ทั้งด้านเนื้อหา ด้านการออกแบบ และด้านการใช้งาน'),
      p3:I('The sign-in steps and the access code are printed on the evaluation form. Your answers will be used only to improve the website.', 'ทั้งนี้ วิธีเข้าใช้งานและรหัสสำหรับผู้ประเมินได้ระบุไว้ในแบบประเมินแล้ว ผลการประเมินจะนำไปใช้เพื่อการปรับปรุงเว็บไซต์เท่านั้น'),
      close:I('We would therefore be grateful for your kind consideration, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'),
      att:I('Website evaluation form, 1 copy', 'แบบประเมินคุณภาพเว็บไซต์ จำนวน 1 ชุด') },
    { id:'expert', g:'invite', t:I('Invite as an expert reviewer', 'เชิญเป็นผู้ทรงคุณวุฒิตรวจเครื่องมือ'), d:I('for checking a learning tool or research instrument (IOC)', 'ตรวจความเที่ยงตรงของสื่อหรือเครื่องมือวิจัย (IOC)'),
      subj:I('Invitation to serve as an expert reviewer', 'ขอเรียนเชิญเป็นผู้ทรงคุณวุฒิตรวจสอบคุณภาพเครื่องมือ'),
      p1:I('I am developing SPACEZ TERMINAL, an online learning platform for finance and investing, and the tools used with it must be checked for content validity before they are used.',
           'ด้วยข้าพเจ้ากำลังดำเนินการพัฒนาสื่อการเรียนรู้ออนไลน์ SPACEZ TERMINAL ด้านการเงินและการลงทุน ซึ่งจำเป็นต้องตรวจสอบความเที่ยงตรงเชิงเนื้อหาของเครื่องมือที่ใช้ก่อนนำไปใช้จริง'),
      p2:I('Having considered your knowledge, expertise and experience in this field, I would like to invite you to serve as an expert reviewer, checking the tools and giving suggestions so they can be improved.',
           'ในการนี้ ข้าพเจ้าพิจารณาแล้วเห็นว่าท่านเป็นผู้มีความรู้ ความเชี่ยวชาญ และประสบการณ์ในด้านดังกล่าว จึงใคร่ขอเรียนเชิญท่านเป็นผู้ทรงคุณวุฒิในการตรวจสอบเครื่องมือ และให้ข้อเสนอแนะเพื่อปรับปรุงให้มีคุณภาพยิ่งขึ้น'),
      p3:I('', ''),
      close:I('I hope very much for your kind help, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณา หวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่าน และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('1. The tools to be reviewed, 1 set\n2. Item–objective congruence (IOC) form, 1 set', '1. เครื่องมือที่ใช้ในการตรวจสอบ จำนวน 1 ชุด\n2. แบบประเมินความสอดคล้อง (IOC) จำนวน 1 ชุด') },
    { id:'trial', g:'ask', t:I('Ask for a trial / data collection', 'ขอทดลองใช้และเก็บข้อมูล'), d:I('to a school or organisation, with a PDPA note', 'ส่งถึงโรงเรียนหรือหน่วยงาน พร้อมข้อความคุ้มครองข้อมูลส่วนบุคคล'),
      subj:I('Request to trial the website and collect feedback', 'ขอความอนุเคราะห์ทดลองใช้งานเว็บไซต์และเก็บรวบรวมข้อมูล'),
      p1:I('SPACEZ TERMINAL has developed a website for learning about finance and investing (' + SITE_SHOW + ') and would like to try it with real learners so it can be improved.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาเว็บไซต์เพื่อการเรียนรู้ด้านการเงินและการลงทุน (' + SITE_SHOW + ') และประสงค์จะนำไปทดลองใช้กับผู้เรียนจริง เพื่อนำผลมาปรับปรุงให้มีประสิทธิภาพยิ่งขึ้น'),
      p2:I('We would be grateful if you would allow learners in your organisation to try the website and answer a short opinion survey between ........................ The time needed is about ...... minutes.',
           'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านอนุญาตให้ผู้เรียนในหน่วยงานของท่านทดลองใช้งานเว็บไซต์ และตอบแบบสอบถามความคิดเห็น ในช่วงวันที่ ........................ ใช้เวลาประมาณ ...... นาที'),
      p3:I('The information collected will be used only to develop the website and will be kept confidential under the Personal Data Protection Act B.E. 2562 (2019).', 'ทั้งนี้ ข้อมูลที่ได้จะนำไปใช้เพื่อการพัฒนาเว็บไซต์เท่านั้น และจะเก็บรักษาเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562'),
      close:I('We would therefore be grateful for your kind permission, and thank you sincerely.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('Opinion survey, 1 copy', 'แบบสอบถามความคิดเห็น จำนวน 1 ชุด') },
    { id:'thanks', g:'notice', t:I('Thank-you letter', 'หนังสือขอบคุณ'), d:I('after someone reviewed, advised or helped', 'หลังได้รับการประเมิน คำแนะนำ หรือความช่วยเหลือ'),
      subj:I('Letter of thanks', 'ขอขอบคุณ'),
      p1:I('Thank you for kindly evaluating and advising on the SPACEZ TERMINAL website.', 'ตามที่ท่านได้กรุณาให้ความอนุเคราะห์ประเมินและให้คำแนะนำเว็บไซต์ SPACEZ TERMINAL ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('SPACEZ TERMINAL is deeply grateful for the valuable time you gave. Your suggestions are of great use in improving the website for its learners, and we hope for your kind support again in the future.',
           'SPACEZ TERMINAL ขอขอบพระคุณท่านเป็นอย่างสูงที่ได้สละเวลาอันมีค่า ข้อเสนอแนะของท่านเป็นประโยชน์อย่างยิ่งต่อการพัฒนาเว็บไซต์ให้เหมาะกับผู้เรียน และหวังเป็นอย่างยิ่งว่าจะได้รับความกรุณาจากท่านอีกในโอกาสต่อไป'),
      p3:I('', ''),
      close:I('With sincere thanks.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('', '') },
    { id:'intro', g:'work', t:I('Introduce the platform', 'แนะนำแพลตฟอร์ม / ขอความร่วมมือ'), d:I('to a school, club or partner — ask to share it', 'ส่งถึงโรงเรียน ชมรม หรือพันธมิตร ขอช่วยประชาสัมพันธ์'),
      subj:I('Introducing the SPACEZ TERMINAL learning platform', 'ขอแนะนำแพลตฟอร์มการเรียนรู้ SPACEZ TERMINAL และขอความร่วมมือประชาสัมพันธ์'),
      p1:I('SPACEZ TERMINAL is a free bilingual (Thai / English) platform for learning about finance and investing: step-by-step beginner lessons, live market dashboards, an Elliott Wave classroom and practice exams for the IC licence.',
           'ด้วย SPACEZ TERMINAL เป็นแพลตฟอร์มการเรียนรู้ด้านการเงินและการลงทุนสองภาษา (ไทย / อังกฤษ) ประกอบด้วยบทเรียนพื้นฐานแบบทีละขั้น แผงข้อมูลตลาดแบบเรียลไทม์ ห้องเรียนคลื่นเอลเลียต และแบบฝึกหัดเตรียมสอบใบอนุญาต IC'),
      p2:I('To help more learners build sound financial knowledge, we would like to ask for your cooperation in sharing the platform with the students, members or people in your organisation.',
           'เพื่อส่งเสริมให้ผู้เรียนมีความรู้ทางการเงินที่ถูกต้องและนำไปใช้ได้จริง จึงใคร่ขอความร่วมมือจากท่านช่วยประชาสัมพันธ์แพลตฟอร์มนี้แก่นักเรียน สมาชิก หรือบุคลากรในหน่วยงานของท่าน'),
      p3:I('The platform can be opened at ' + SITE_SHOW + ' or by scanning the QR code on this letter.', 'ทั้งนี้ สามารถเข้าใช้งานได้ที่ ' + SITE_SHOW + ' หรือสแกนคิวอาร์โค้ดท้ายหนังสือนี้'),
      close:I('We would be grateful for your kind cooperation, and thank you in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความร่วมมือ และขอขอบคุณมา ณ โอกาสนี้'),
      att:I('', '') },
    { id:'invite', g:'invite', t:I('Invite to an event', 'เชิญเข้าร่วมกิจกรรม'), d:I('workshop, talk or class — fill in date, time, place', 'อบรม บรรยาย หรือคลาสเรียน — เติมวัน เวลา สถานที่'),
      subj:I('Invitation to attend "........................"', 'ขอเรียนเชิญเข้าร่วมกิจกรรม "........................"'),
      p1:I('SPACEZ TERMINAL will hold "........................" on ........................ at ........................ (place / online), to ........................',
           'ด้วย SPACEZ TERMINAL กำหนดจัดกิจกรรม "........................" ในวันที่ ........................ เวลา ........................ ณ ........................ (หรือทางออนไลน์) โดยมีวัตถุประสงค์เพื่อ ........................'),
      p2:I('We would be honoured if you could attend.', 'ในการนี้ จึงใคร่ขอเรียนเชิญท่านเข้าร่วมกิจกรรมดังกล่าว'),
      p3:I('', ''),
      close:I('We look forward to welcoming you, and thank you in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาเข้าร่วมกิจกรรมตามวัน เวลา และสถานที่ดังกล่าว และขอขอบคุณมา ณ โอกาสนี้'),
      att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'brain', g:'invite', t:I('Expert review of advanced content (Market Brain)', 'เชิญผู้เชี่ยวชาญตรวจเนื้อหาขั้นสูง (สมองตลาด)'), d:I('graduate-level models; with a site guide and sign-in details', 'เนื้อหาระดับบัณฑิตศึกษา แนบคู่มือเข้าเว็บและข้อมูลเข้าระบบ'),
      subj:I('Request for an expert review of the advanced academic content of the “Market Brain” system', 'ขอความอนุเคราะห์ผู้ทรงคุณวุฒิตรวจสอบเนื้อหาเชิงวิชาการขั้นสูงของระบบ “สมองตลาด” (Market Brain)'),
      p1:I('SPACEZ TERMINAL has developed the “Market Brain”, the advanced analysis part of the website: an economic-cycle model with a market-condition score, forecasting models for macro variables (inflation, jobs, interest rates) with their own track records, price-forecast models for eight assets, and walk-forward back-tests with calibrated confidence ranges — content at graduate level.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาระบบ “สมองตลาด” (Market Brain) ซึ่งเป็นส่วนวิเคราะห์ขั้นสูงของเว็บไซต์ ประกอบด้วยแบบจำลองวัฏจักรเศรษฐกิจและคะแนนภาวะตลาด แบบจำลองพยากรณ์ตัวแปรเศรษฐกิจมหภาค (เงินเฟ้อ การจ้างงาน อัตราดอกเบี้ย) พร้อมประวัติความแม่นยำ แบบจำลองคาดการณ์ราคาสินทรัพย์ 8 ประเภท และการทดสอบย้อนหลังแบบเดินหน้า (walk-forward) พร้อมการปรับเทียบช่วงความเชื่อมั่น ซึ่งเป็นเนื้อหาในระดับบัณฑิตศึกษา'),
      p2:I('So that the content and methods are academically sound, we would be most grateful if you, as an expert in economics, finance and statistics, could review the concepts, assumptions, statistical methods, back-tests and interpretation of results, and suggest improvements.',
           'เพื่อให้เนื้อหาและวิธีการมีความถูกต้องตามหลักวิชาการ จึงใคร่ขอความอนุเคราะห์จากท่านในฐานะผู้ทรงคุณวุฒิด้านเศรษฐศาสตร์ การเงิน และสถิติ ช่วยตรวจสอบความถูกต้องของแนวคิด สมมติฐาน วิธีการทางสถิติ การทดสอบย้อนหลัง และการตีความผล พร้อมให้ข้อเสนอแนะเพื่อการปรับปรุง'),
      p3:I('A guide to the website and the sign-in details are enclosed. Please keep the sign-in details confidential. Your review will be used only to improve the system.', 'ทั้งนี้ ได้แนบคู่มือการเข้าใช้งานเว็บไซต์และข้อมูลสำหรับเข้าระบบมาพร้อมนี้ ขอความกรุณาเก็บข้อมูลเข้าระบบไว้เป็นความลับ ผลการตรวจสอบจะนำไปใช้เพื่อการพัฒนาระบบเท่านั้น'),
      close:I('We would therefore be grateful for your kind consideration, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'),
      att:I('1. Guide to the website, 1 copy\n2. Sign-in details (user name and code), 1 sheet\n3. Expert evaluation form, 1 copy', '1. คู่มือการเข้าใช้งานเว็บไซต์ จำนวน 1 ชุด\n2. ข้อมูลสำหรับเข้าระบบ (ชื่อผู้ใช้และรหัสผ่าน) จำนวน 1 ฉบับ\n3. แบบประเมินสำหรับผู้ทรงคุณวุฒิ จำนวน 1 ชุด') },
    /* ---------- 2026-11-22: more purposes (grouped in the panel by `g`) ---------- */
    { id:'school', g:'ask', t:I('Use the site in class', 'ขอใช้เว็บไซต์เป็นสื่อการสอน'), d:I('to a school director or head of department', 'ส่งถึงผู้อำนวยการโรงเรียนหรือหัวหน้ากลุ่มสาระ'),
      subj:I('Request to use SPACEZ TERMINAL as a learning resource', 'ขอความอนุเคราะห์ใช้เว็บไซต์ SPACEZ TERMINAL เป็นสื่อประกอบการเรียนการสอน'),
      p1:I('SPACEZ TERMINAL is a free bilingual website for learning about money, saving and investing, with step-by-step lessons, drawings, calculators and quick checks suitable for students (' + SITE_SHOW + ').', 'ด้วย SPACEZ TERMINAL เป็นเว็บไซต์การเรียนรู้ด้านการเงิน การออม และการลงทุน สองภาษา ไม่มีค่าใช้จ่าย มีบทเรียนแบบทีละขั้น ภาพประกอบ เครื่องคำนวณ และแบบทดสอบสั้น ที่เหมาะกับผู้เรียน (' + SITE_SHOW + ')'),
      p2:I('We would be grateful for your permission to use the website as a learning resource in ........................ for ........................ during ........................', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านอนุญาตให้ใช้เว็บไซต์ดังกล่าวเป็นสื่อประกอบการเรียนการสอนในรายวิชา ........................ ระดับชั้น ........................ ในช่วง ........................'),
      p3:I('No personal data of students is collected, and the content can be adjusted to the school\'s curriculum.', 'ทั้งนี้ การใช้งานไม่มีการเก็บข้อมูลส่วนบุคคลของนักเรียน และสามารถปรับเนื้อหาให้สอดคล้องกับหลักสูตรของสถานศึกษาได้'),
      close:I('We would be grateful for your kind permission.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Overview of the lessons, 1 copy', 'รายละเอียดเนื้อหาบทเรียน จำนวน 1 ชุด') },
    { id:'research', g:'ask', t:I('Ask people to answer a survey', 'ขอความร่วมมือตอบแบบสอบถาม'), d:I('research or development survey, with a PDPA note', 'แบบสอบถามเพื่อการวิจัยหรือพัฒนา พร้อมข้อความ PDPA'),
      subj:I('Request for cooperation in answering a questionnaire', 'ขอความร่วมมือตอบแบบสอบถาม'),
      p1:I('SPACEZ TERMINAL is studying ........................ to improve its learning website for finance and investing.', 'ด้วย SPACEZ TERMINAL กำลังศึกษาเรื่อง ........................ เพื่อนำผลไปพัฒนาเว็บไซต์การเรียนรู้ด้านการเงินและการลงทุนให้ตรงกับความต้องการของผู้เรียน'),
      p2:I('We would be grateful if you could answer the enclosed questionnaire (about ...... minutes) by ........................', 'ในการนี้ จึงใคร่ขอความร่วมมือจากท่านตอบแบบสอบถามที่แนบมาพร้อมนี้ ใช้เวลาประมาณ ...... นาที ภายในวันที่ ........................'),
      p3:I('Answers are anonymous, used only for this study and kept confidential under the Personal Data Protection Act B.E. 2562 (2019).', 'ทั้งนี้ คำตอบของท่านไม่ระบุตัวตน จะนำไปใช้เพื่อการศึกษาครั้งนี้เท่านั้น และเก็บรักษาเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562'),
      close:I('Thank you for your kind cooperation.', 'จึงเรียนมาเพื่อโปรดให้ความร่วมมือ และขอขอบคุณมา ณ โอกาสนี้'), att:I('Questionnaire, 1 copy', 'แบบสอบถาม จำนวน 1 ชุด') },
    { id:'data', g:'ask', t:I('Ask permission to use data / material', 'ขออนุญาตใช้ข้อมูลหรือผลงาน'), d:I('charts, figures, articles or pictures of another owner', 'กราฟ ตัวเลข บทความ หรือรูปภาพของเจ้าของอื่น'),
      subj:I('Request for permission to use data', 'ขออนุญาตใช้ข้อมูลและเผยแพร่โดยอ้างอิงแหล่งที่มา'),
      p1:I('SPACEZ TERMINAL publishes free learning material about finance and investing for the public.', 'ด้วย SPACEZ TERMINAL จัดทำสื่อการเรียนรู้ด้านการเงินและการลงทุนเผยแพร่แก่ผู้สนใจโดยไม่มีค่าใช้จ่าย'),
      p2:I('We would like permission to use ........................ from ........................ in ........................, with the source credited in full.', 'ในการนี้ จึงใคร่ขออนุญาตใช้ ........................ ของ ........................ ประกอบเนื้อหาเรื่อง ........................ โดยจะระบุแหล่งที่มาอย่างครบถ้วน'),
      p3:I('The material will be used for education only, not for sale, and will be removed at once if you so request.', 'ทั้งนี้ จะใช้เพื่อการศึกษาเท่านั้น ไม่นำไปใช้ในเชิงพาณิชย์ และพร้อมนำออกทันทีหากท่านประสงค์'),
      close:I('We would be grateful for your kind permission.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบคุณมา ณ โอกาสนี้'), att:I('', '') },
    { id:'sponsor', g:'ask', t:I('Ask for support / sponsorship', 'ขอรับการสนับสนุน'), d:I('for an event, prizes, server costs or a project', 'สำหรับกิจกรรม ของรางวัล ค่าเซิร์ฟเวอร์ หรือโครงการ'),
      subj:I('Request for support for "........................"', 'ขอความอนุเคราะห์สนับสนุนโครงการ “........................”'),
      p1:I('SPACEZ TERMINAL plans "........................" on ........................ to ........................ for about ...... participants.', 'ด้วย SPACEZ TERMINAL มีกำหนดจัดโครงการ “........................” ในวันที่ ........................ โดยมีวัตถุประสงค์เพื่อ ........................ มีผู้เข้าร่วมประมาณ ...... คน'),
      p2:I('We would be grateful for your support in the form of ........................', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านสนับสนุน ........................ เพื่อให้โครงการดำเนินไปได้อย่างมีประสิทธิภาพ'),
      p3:I('Your support will be acknowledged on the website, in the event materials and in the closing report.', 'ทั้งนี้ จะประชาสัมพันธ์และขอบคุณการสนับสนุนของท่านบนเว็บไซต์ ในเอกสารประกอบกิจกรรม และในรายงานสรุปผลโครงการ'),
      close:I('We would be grateful for your kind support.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้การสนับสนุน และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Project details and budget, 1 copy', 'รายละเอียดโครงการและงบประมาณ จำนวน 1 ชุด') },
    { id:'interview', g:'ask', t:I('Ask for an interview', 'ขอสัมภาษณ์ / ขอคำแนะนำ'), d:I('learn from an investor, teacher or professional', 'ขอความรู้จากนักลงทุน ครู หรือผู้เชี่ยวชาญ'),
      subj:I('Request for an interview', 'ขอความอนุเคราะห์สัมภาษณ์เพื่อเป็นข้อมูลในการพัฒนาเนื้อหา'),
      p1:I('SPACEZ TERMINAL is preparing learning content on ........................ and would value the experience of practitioners.', 'ด้วย SPACEZ TERMINAL กำลังจัดทำเนื้อหาการเรียนรู้เรื่อง ........................ และต้องการข้อมูลจากประสบการณ์จริงของผู้มีความรู้ในด้านนี้'),
      p2:I('We would be grateful if you could spare about ...... minutes for an interview on ........................ (in person or online).', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์สัมภาษณ์ท่าน ใช้เวลาประมาณ ...... นาที ในวันที่ ........................ (พบตัวหรือทางออนไลน์ตามที่ท่านสะดวก)'),
      p3:I('Questions will be sent in advance; nothing will be published under your name without your approval.', 'ทั้งนี้ จะส่งประเด็นคำถามให้ท่านล่วงหน้า และจะไม่เผยแพร่ข้อมูลในนามของท่านโดยไม่ได้รับอนุญาต'),
      close:I('We would be grateful for your kind help.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Interview questions, 1 copy', 'ประเด็นคำถามการสัมภาษณ์ จำนวน 1 ชุด') },
    { id:'promo', g:'ask', t:I('Ask a page / media to share', 'ขอความอนุเคราะห์ประชาสัมพันธ์'), d:I('to a page, club, media or school office', 'ส่งถึงเพจ ชมรม สื่อ หรือฝ่ายประชาสัมพันธ์'),
      subj:I('Request for help in publicising ........................', 'ขอความอนุเคราะห์ประชาสัมพันธ์ ........................'),
      p1:I('SPACEZ TERMINAL will ........................ on ........................, free of charge for everyone interested.', 'ด้วย SPACEZ TERMINAL จะ ........................ ในวันที่ ........................ โดยเปิดให้ผู้สนใจเข้าร่วมได้โดยไม่มีค่าใช้จ่าย'),
      p2:I('We would be grateful if you could share the news through your channels between ........................', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านช่วยประชาสัมพันธ์ผ่านช่องทางของท่าน ในช่วงวันที่ ........................'),
      p3:I('A ready-to-post picture and text are enclosed.', 'ทั้งนี้ ได้แนบภาพและข้อความสำหรับประชาสัมพันธ์มาพร้อมนี้แล้ว'),
      close:I('Thank you for your kind help.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบคุณมา ณ โอกาสนี้'), att:I('Picture and text for posting, 1 set', 'ภาพและข้อความประชาสัมพันธ์ จำนวน 1 ชุด') },
    { id:'speaker', g:'invite', t:I('Invite a guest speaker', 'เชิญเป็นวิทยากร'), d:I('talk, workshop or class', 'บรรยาย อบรม หรือคลาสเรียน'),
      subj:I('Invitation to be a guest speaker', 'ขอเรียนเชิญเป็นวิทยากรบรรยายหัวข้อ “........................”'),
      p1:I('SPACEZ TERMINAL will hold "........................" on ........................ at ........................ for about ...... participants.', 'ด้วย SPACEZ TERMINAL กำหนดจัดกิจกรรม “........................” ในวันที่ ........................ เวลา ........................ ณ ........................ มีผู้เข้าร่วมประมาณ ...... คน'),
      p2:I('Given your knowledge and experience, we would be honoured if you could speak on "........................" for about ...... minutes.', 'ในการนี้ พิจารณาแล้วเห็นว่าท่านเป็นผู้มีความรู้และประสบการณ์เป็นอย่างดี จึงใคร่ขอเรียนเชิญท่านเป็นวิทยากรบรรยายหัวข้อ “........................” ใช้เวลาประมาณ ...... นาที'),
      p3:I('Details of the programme and the audience are enclosed.', 'ทั้งนี้ ได้แนบกำหนดการและรายละเอียดผู้เข้าร่วมมาพร้อมนี้'),
      close:I('We would be grateful for your kind acceptance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'meeting', g:'invite', t:I('Invite to a meeting', 'เชิญประชุม'), d:I('team, advisors or partners — with an agenda', 'ทีมงาน ที่ปรึกษา หรือพันธมิตร พร้อมระเบียบวาระ'),
      subj:I('Invitation to a meeting', 'ขอเรียนเชิญประชุม ........................'),
      p1:I('SPACEZ TERMINAL will hold a meeting on ........................ on ........................ at ........................ (place / online link).', 'ด้วย SPACEZ TERMINAL กำหนดประชุมเรื่อง ........................ ในวันที่ ........................ เวลา ........................ ณ ........................ (หรือทางออนไลน์)'),
      p2:I('We would be pleased if you could attend. The agenda is enclosed.', 'ในการนี้ จึงขอเรียนเชิญท่านเข้าร่วมประชุมตามวัน เวลา และสถานที่ดังกล่าว รายละเอียดระเบียบวาระการประชุมตามสิ่งที่ส่งมาด้วย'),
      p3:I('Please confirm your attendance by ........................', 'ทั้งนี้ ขอความกรุณาแจ้งการเข้าร่วมประชุมภายในวันที่ ........................'),
      close:I('Thank you.', 'จึงเรียนมาเพื่อโปรดทราบและเข้าร่วมประชุมตามวัน เวลา และสถานที่ดังกล่าว'), att:I('Agenda, 1 copy', 'ระเบียบวาระการประชุม จำนวน 1 ฉบับ') },
    { id:'class', g:'invite', t:I('Invite to try a class', 'เชิญทดลองเรียน'), d:I('Elliott Wave classroom or beginner course', 'ห้องเรียนคลื่นเอลเลียต หรือคอร์สผู้เริ่มต้น'),
      subj:I('Invitation to try the ........................ class', 'ขอเรียนเชิญทดลองเรียน ........................'),
      p1:I('SPACEZ TERMINAL has opened ........................, a step-by-step online class with practice exams.', 'ด้วย SPACEZ TERMINAL ได้เปิด ........................ เป็นห้องเรียนออนไลน์แบบทีละขั้น พร้อมแบบทดสอบท้ายบท'),
      p2:I('We would like to invite you to try the class free of charge between ........................ and share your opinion.', 'ในการนี้ จึงขอเรียนเชิญท่านทดลองเรียนโดยไม่มีค่าใช้จ่าย ในช่วงวันที่ ........................ และร่วมแสดงความคิดเห็นเพื่อการพัฒนา'),
      p3:I('', ''),
      close:I('We hope to welcome you.', 'จึงเรียนมาเพื่อโปรดพิจารณา และหวังเป็นอย่างยิ่งว่าจะได้รับเกียรติจากท่าน'), att:I('', '') },
    { id:'partner', g:'work', t:I('Propose a partnership', 'เสนอความร่วมมือ / MOU'), d:I('to a school, club, company or organisation', 'ส่งถึงสถานศึกษา ชมรม บริษัท หรือองค์กร'),
      subj:I('Proposal for cooperation', 'ขอเสนอความร่วมมือด้านการส่งเสริมความรู้ทางการเงินและการลงทุน'),
      p1:I('SPACEZ TERMINAL is a bilingual learning platform for finance and investing (' + SITE_SHOW + ') that aims to help people build sound financial knowledge.', 'ด้วย SPACEZ TERMINAL เป็นแพลตฟอร์มการเรียนรู้ด้านการเงินและการลงทุนสองภาษา (' + SITE_SHOW + ') มีเป้าหมายส่งเสริมให้ผู้เรียนมีความรู้ทางการเงินที่ถูกต้องและนำไปใช้ได้จริง'),
      p2:I('We would like to propose cooperation with your organisation on ........................, for example ........................', 'ในการนี้ จึงใคร่ขอเสนอความร่วมมือกับหน่วยงานของท่านในด้าน ........................ เช่น ........................'),
      p3:I('If you agree in principle, we would be glad to meet and agree the details together.', 'ทั้งนี้ หากท่านเห็นชอบในหลักการ ยินดีนัดหมายเพื่อหารือรายละเอียดร่วมกันต่อไป'),
      close:I('We look forward to your consideration.', 'จึงเรียนมาเพื่อโปรดพิจารณา และหวังเป็นอย่างยิ่งว่าจะได้รับความร่วมมือจากท่าน'), att:I('Cooperation proposal, 1 copy', 'ข้อเสนอความร่วมมือ จำนวน 1 ชุด') },
    { id:'appoint', g:'work', t:I('Appoint an advisor', 'แต่งตั้งที่ปรึกษา'), d:I('ask someone to be an advisor of SPACEZ', 'ขอเรียนเชิญเป็นที่ปรึกษาของ SPACEZ'),
      subj:I('Invitation to serve as an advisor', 'ขอเรียนเชิญเป็นที่ปรึกษา SPACEZ TERMINAL'),
      p1:I('SPACEZ TERMINAL is developing its learning content and systems and wishes to be guided by people of knowledge and experience.', 'ด้วย SPACEZ TERMINAL อยู่ระหว่างพัฒนาเนื้อหาและระบบการเรียนรู้ และต้องการคำแนะนำจากผู้มีความรู้และประสบการณ์ เพื่อให้การดำเนินงานเป็นไปอย่างถูกต้องและมีคุณภาพ'),
      p2:I('We would be honoured if you would serve as an advisor on ........................ for a term of ........................', 'ในการนี้ จึงใคร่ขอเรียนเชิญท่านเป็นที่ปรึกษาด้าน ........................ ระยะเวลา ........................'),
      p3:I('The role is to give advice when asked, about ...... times a year; it carries no legal or financial obligation.', 'ทั้งนี้ บทบาทของท่านคือให้คำแนะนำตามที่ได้รับการปรึกษา ประมาณปีละ ...... ครั้ง โดยไม่มีภาระผูกพันทางกฎหมายหรือการเงิน'),
      close:I('We would be grateful for your kind acceptance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('', '') },
    { id:'followup', g:'work', t:I('Follow up politely', 'ติดตามเรื่องที่ส่งไป'), d:I('a gentle reminder about an earlier letter', 'เตือนความจำอย่างสุภาพ เรื่องหนังสือฉบับก่อน'),
      subj:I('Follow-up on our letter of ........................', 'ขอติดตามเรื่อง ........................'),
      p1:I('Further to our letter no. ........................ of ........................ about ........................', 'ตามหนังสือที่ ........................ ลงวันที่ ........................ เรื่อง ........................ ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('As the matter is due on ........................, we would be grateful to know your consideration, or whether we can help in any way.', 'เนื่องจากใกล้ถึงกำหนดวันที่ ........................ จึงใคร่ขอทราบผลการพิจารณาของท่าน หรือหากมีสิ่งใดที่ต้องการเพิ่มเติม ยินดีดำเนินการให้'),
      p3:I('If you have already replied, please disregard this letter.', 'ทั้งนี้ หากท่านได้ดำเนินการแล้ว ขออภัยมา ณ ที่นี้'),
      close:I('Thank you for your kind attention.', 'จึงเรียนมาเพื่อโปรดพิจารณา และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('', '') },
    { id:'report', g:'work', t:I('Report changes made from feedback', 'รายงานผลการปรับปรุงตามข้อเสนอแนะ'), d:I('tell reviewers what was improved', 'แจ้งผู้ประเมินว่าปรับปรุงอะไรไปแล้ว'),
      subj:I('Report on improvements made from your suggestions', 'รายงานผลการปรับปรุงเว็บไซต์ตามข้อเสนอแนะ'),
      p1:I('Thank you for your suggestions on SPACEZ TERMINAL of ........................', 'ตามที่ท่านได้กรุณาให้ข้อเสนอแนะเกี่ยวกับเว็บไซต์ SPACEZ TERMINAL เมื่อวันที่ ........................ นั้น'),
      p2:I('We have improved the website as follows: 1) ........................ 2) ........................ 3) ........................', 'SPACEZ TERMINAL ได้ดำเนินการปรับปรุงตามข้อเสนอแนะของท่านแล้ว ดังนี้ 1) ........................ 2) ........................ 3) ........................'),
      p3:I('You are welcome to look again at ' + SITE_SHOW + ' and give further advice at any time.', 'ทั้งนี้ ท่านสามารถตรวจสอบผลการปรับปรุงได้ที่ ' + SITE_SHOW + ' และยินดีรับข้อเสนอแนะเพิ่มเติมทุกเมื่อ'),
      close:I('With sincere thanks.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Summary of changes, 1 copy', 'สรุปรายการปรับปรุง จำนวน 1 ฉบับ') },
    { id:'certify', g:'notice', t:I('Certificate of participation', 'หนังสือรับรองการมีส่วนร่วม'), d:I('certify that someone reviewed, taught or helped', 'รับรองว่าบุคคลนี้ได้ประเมิน สอน หรือช่วยงาน'),
      subj:I('Certificate of participation', 'หนังสือรับรองการปฏิบัติงาน'),
      p1:I('This is to certify that ........................ served as ........................ for SPACEZ TERMINAL from ........................ to ........................', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า ........................ ได้ปฏิบัติหน้าที่เป็น ........................ ให้แก่ SPACEZ TERMINAL ตั้งแต่วันที่ ........................ ถึงวันที่ ........................'),
      p2:I('Their work included ........................ and was carried out with care and responsibility.', 'โดยมีหน้าที่ ........................ และได้ปฏิบัติงานด้วยความตั้งใจ มีความรับผิดชอบ และเป็นประโยชน์ต่อการพัฒนาอย่างยิ่ง'),
      p3:I('', ''),
      close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    { id:'launch', g:'notice', t:I('Announce something new', 'แจ้งเปิดตัว / ฟีเจอร์ใหม่'), d:I('new lessons, tools or a new section', 'บทเรียน เครื่องมือ หรือส่วนใหม่ของเว็บ'),
      subj:I('Announcing ........................ on SPACEZ TERMINAL', 'แจ้งเปิดให้บริการ ........................ บนเว็บไซต์ SPACEZ TERMINAL'),
      p1:I('SPACEZ TERMINAL has launched ........................, which helps learners ........................', 'ด้วย SPACEZ TERMINAL ได้เปิดให้บริการ ........................ ซึ่งช่วยให้ผู้เรียน ........................'),
      p2:I('It is available now at ' + SITE_SHOW + ' at no cost.', 'ท่านสามารถเข้าใช้งานได้แล้วที่ ' + SITE_SHOW + ' โดยไม่มีค่าใช้จ่าย'),
      p3:I('We would welcome your feedback.', 'ทั้งนี้ ยินดีรับฟังความคิดเห็นและข้อเสนอแนะจากท่าน เพื่อนำไปพัฒนาต่อไป'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'maint', g:'notice', t:I('Notice of maintenance', 'แจ้งปิดปรับปรุงระบบ'), d:I('downtime with an apology', 'แจ้งช่วงปิดระบบ พร้อมขออภัย'),
      subj:I('Notice of system maintenance', 'แจ้งปิดปรับปรุงระบบชั่วคราว'),
      p1:I('SPACEZ TERMINAL will carry out maintenance on ........................ from ........................ to ........................', 'ด้วย SPACEZ TERMINAL มีกำหนดปิดปรับปรุงระบบในวันที่ ........................ ตั้งแต่เวลา ........................ ถึง ........................'),
      p2:I('During this time ........................ will be unavailable.', 'ในช่วงเวลาดังกล่าว ........................ จะไม่สามารถใช้งานได้ชั่วคราว'),
      p3:I('We apologise for any inconvenience.', 'จึงขออภัยในความไม่สะดวกมา ณ ที่นี้'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'blank', g:'own', t:I('Write my own', 'เขียนเอง'), d:I('empty letter with the formal layout', 'หนังสือเปล่าตามรูปแบบทางการ'),
      subj:I('', ''), p1:I('', 'ด้วย '), p2:I('', 'ในการนี้ '), p3:I('', ''), close:I('', 'จึงเรียนมาเพื่อโปรดพิจารณา'), att:I('', '') }
  ];
  var TPL_G = [['ask', I('Requests', 'ขอความอนุเคราะห์')], ['invite', I('Invitations', 'เชิญ')], ['work', I('Working together', 'ความร่วมมือ / ติดตาม')], ['notice', I('Notices & thanks', 'แจ้ง / ขอบคุณ / รับรอง')], ['own', I('Write my own', 'เขียนเอง')]];
  function tplOf(id){ for(var i = 0; i < TPL.length; i++) if(TPL[i].id === id) return TPL[i]; return TPL[0]; }

  /* ---------- state: texts are kept per language so EN / TH can differ ---------- */
  function blank(){ return { tpl:'eval', look:'classic', toTitle:1, toName:'', toPos:'', toOrg:'', from:'', fromPos:'', contact:'', qr:1, urgent:0, seal:0, grp:'', date:'', guide:0, acc:0, accUser:'', sigStory:0, tx:{ en:null, th:null } }; }
  var D = blank();
  try { var sv = JSON.parse(localStorage.getItem(LS) || 'null'); if(sv && typeof sv === 'object') Object.keys(sv).forEach(function(k){ if(k in D) D[k] = sv[k]; }); } catch(e){}
  if(!D.tx || typeof D.tx !== 'object') D.tx = { en:null, th:null };
  function save(){ try { localStorage.setItem(LS, JSON.stringify(D)); } catch(e){} }
  function fill(l){ var t = tplOf(D.tpl); D.tx[l] = { subj:t.subj[l], refTo:'', att:t.att[l], p1:t.p1[l], p2:t.p2[l], p3:t.p3[l], close:t.close[l], cc:'' }; }
  function X(){ var l = L(); if(!D.tx[l]) fill(l); return D.tx[l]; }
  function lines(s){ return String(s || '').split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean); }
  function toLine(){
    var t = TITLES[+D.toTitle] ? T(TITLES[+D.toTitle]) : '', n = String(D.toName || '').trim();
    var a = (t && n ? t + (L() === 'th' ? '' : ' ') + n : (t || n));
    if(L() === 'th' && t === 'คุณ' && n) a = 'คุณ' + n;
    return a || (L() === 'th' ? '........................................' : '........................................');
  }
  function toSub(){ return [String(D.toPos || '').trim(), String(D.toOrg || '').trim()].filter(Boolean).join(L() === 'th' ? ' ' : ', '); }
  function fromName(){ return String(D.from || '').trim() || T(TX.defFrom); }
  function fromPos(){ return String(D.fromPos || '').trim() || T(TX.defPos); }
  var ACC_CODE = ''; /* sign-in code to print — memory only, never saved */
  function dateStr(){ var own = String(D.date || '').trim(); if(own) return own; var d = new Date(), l = L(); return l === 'th' ? d.getDate() + ' ' + MTH.th[d.getMonth()] + ' ' + (d.getFullYear() + 543) : d.getDate() + ' ' + MTH.en[d.getMonth()] + ' ' + d.getFullYear(); }

  /* ---------- signature: kept in this browser only (localStorage spz.sign.v1), shared with part-95 ---------- */
  var SG_LS = 'spz.sign.v1';
  var SIGN = {
    get:function(){ try { var v = localStorage.getItem(SG_LS); return v && /^data:image\//.test(v) ? v : ''; } catch(e){ return ''; } },
    set:function(v){ try { if(v) localStorage.setItem(SG_LS, v); else localStorage.removeItem(SG_LS); } catch(e){} }
  };
  window.__SPZ_SIGN = SIGN;
  /* crop to the ink and make paper-white pixels transparent (for a photo of a signature on paper) */
  function sigClean(img, cb){
    var W = img.naturalWidth || img.width, H = img.naturalHeight || img.height, k = Math.min(1, 1400 / W);
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(W * k)); c.height = Math.max(1, Math.round(H * k));
    var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
    var d = x.getImageData(0, 0, c.width, c.height), p = d.data, x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for(var i = 0; i < p.length; i += 4){
      var lum = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
      if(lum > 200) p[i + 3] = 0; else if(lum > 150) p[i + 3] = Math.min(p[i + 3], Math.round((200 - lum) / 50 * 255));
      if(p[i + 3] > 40){ var n = i / 4, px = n % c.width, py = (n - px) / c.width; if(px < x0) x0 = px; if(px > x1) x1 = px; if(py < y0) y0 = py; if(py > y1) y1 = py; }
    }
    if(x1 < 0){ cb(''); return; }
    x.putImageData(d, 0, 0);
    var m = 8, o = document.createElement('canvas'); o.width = x1 - x0 + 1 + m * 2; o.height = y1 - y0 + 1 + m * 2;
    o.getContext('2d').drawImage(c, x0 - m, y0 - m, o.width, o.height, 0, 0, o.width, o.height);
    cb(o.toDataURL('image/png'));
  }
  /* tell part-49 to redraw the sheet: fire an input event on the hidden field in the form */
  function poke(){ var e = document.querySelector('[data-lt="sigv"]'); if(e){ e.value = String(Date.now()); e.dispatchEvent(new Event('input', { bubbles:true })); } }
  function sigPreview(){ var v = SIGN.get(); document.querySelectorAll('[data-lt-sigprev]').forEach(function(b){ b.innerHTML = v ? '<img src="' + v + '" alt="">' : '<span>' + esc(T(TX.sigNone)) + '</span>'; }); }
  function sigPad(){
    var ov = document.createElement('div'); ov.className = 'lt-pad';
    ov.innerHTML = '<div class="lt-padc"><b>' + esc(T(TX.padH)) + '</b><canvas width="1200" height="440"></canvas><div class="lt-padb"><button type="button" data-p="again">' + esc(T(TX.padAgain)) + '</button><button type="button" data-p="cancel">' + esc(T(TX.padCancel)) + '</button><button type="button" class="on" data-p="use">' + esc(T(TX.padUse)) + '</button></div></div>';
    document.body.appendChild(ov);
    var cv = ov.querySelector('canvas'), cx = cv.getContext('2d'), down = false, last = null, inked = false;
    cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#14213d';
    var pos = function(e){ var r = cv.getBoundingClientRect(); return { x:(e.clientX - r.left) * cv.width / r.width, y:(e.clientY - r.top) * cv.height / r.height, t:Date.now() }; };
    cv.addEventListener('pointerdown', function(e){ down = true; last = pos(e); cv.setPointerCapture(e.pointerId); e.preventDefault(); });
    cv.addEventListener('pointermove', function(e){ if(!down) return; var q = pos(e), dt = Math.max(1, q.t - last.t), v = Math.hypot(q.x - last.x, q.y - last.y) / dt;
      cx.lineWidth = Math.max(3, Math.min(9, 9 - v * 2.2)); cx.beginPath(); cx.moveTo(last.x, last.y); cx.lineTo(q.x, q.y); cx.stroke(); last = q; inked = true; e.preventDefault(); });
    var up = function(){ down = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    ov.addEventListener('click', function(e){ var b = e.target.closest('[data-p]'); if(!b) return; var k = b.getAttribute('data-p');
      if(k === 'again'){ cx.clearRect(0, 0, cv.width, cv.height); inked = false; return; }
      if(k === 'use' && inked){ var im = new Image(); im.onload = function(){ sigClean(im, function(v){ SIGN.set(v); sigPreview(); poke(); }); }; im.src = cv.toDataURL('image/png'); }
      ov.parentNode.removeChild(ov); });
  }

  /* ---------- form (left panel) ---------- */
  var status = '';
  function formHTML(){
    var x = X();
    function inp(k, lbl, val, ph){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><input type="text" data-lt="' + k + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' autocomplete="off"></label>'; }
    function tin(k, lbl, rows){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span>' + (rows ? '<textarea rows="' + rows + '" data-ltx="' + k + '">' + esc(x[k] || '') + '</textarea>' : '<input type="text" data-ltx="' + k + '" value="' + esc(x[k] || '') + '" autocomplete="off">') + '</label>'; }
    function chk(k, lbl){ return '<label class="pr-rv-ck"><input type="checkbox" data-lt-ck="' + k + '"' + (D[k] ? ' checked' : '') + '><span>' + esc(T(lbl)) + '</span></label>'; }
    var h = '<div class="pr-hint" style="margin-bottom:10px;">' + esc(T(TX.hint)) + '</div>';
    /* 2026-11-22: 23 purposes, shown in groups; the open group is remembered (D.grp) */
    var cur = tplOf(D.tpl).g || 'ask', og = D.grp || cur;
    h += '<div class="pr-ev-h2" style="margin-top:0">' + esc(T(TX.tplL)) + '</div><div class="pr-lt-grps">' + TPL_G.map(function(g){
      var n = TPL.filter(function(t){ return t.g === g[0]; }).length;
      return '<button type="button" class="pr-lt-grp' + (og === g[0] ? ' on' : '') + (cur === g[0] ? ' has' : '') + '" data-lt-grp="' + g[0] + '">' + esc(T(g[1])) + (n > 1 ? ' <i>' + n + '</i>' : '') + '</button>'; }).join('') + '</div>' +
      '<div class="pr-lt-tpls">' + TPL.filter(function(t){ return t.g === og; }).map(function(t){
      return '<button type="button" class="pr-rv-set' + (D.tpl === t.id ? ' on' : '') + '" data-lt-tpl="' + t.id + '"><b>' + esc(T(t.t)) + '</b><span>' + esc(T(t.d)) + '</span></button>'; }).join('') + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.toL)) + '</div><div class="pr-ev-grid2"><label class="pr-ev-in"><span>' + esc(T(TX.toTitle)) + '</span><select data-lt="toTitle">' +
      TITLES.map(function(o, i){ return '<option value="' + i + '"' + (+D.toTitle === i ? ' selected' : '') + '>' + esc(T(o) || '—') + '</option>'; }).join('') + '</select></label>' + inp('toName', TX.toName, D.toName) + '</div>' +
      '<div class="pr-ev-grid2">' + inp('toPos', TX.toPos, D.toPos) + inp('toOrg', TX.toOrg, D.toOrg) + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.subjL)) + '</div>' + tin('subj', TX.subj) + tin('refTo', TX.refTo) + tin('att', TX.att, 2) +
      tin('p1', TX.p1, 4) + tin('p2', TX.p2, 4) + tin('p3', TX.p3, 3) + tin('close', TX.close, 2) + tin('cc', TX.cc) +
      '<button type="button" class="pr-ev-bigbtn ghost" data-lt-reset="1" style="margin:2px 0 6px;">' + esc(T(TX.reset)) + '</button>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.fromL)) + '</div><div class="pr-ev-grid2">' + inp('from', TX.from, D.from, T(TX.defFrom)) + inp('fromPos', TX.fromPos, D.fromPos, T(TX.defPos)) + '</div>' + inp('contact', TX.contact, D.contact) + inp('date', TX.dateL, D.date, T(TX.datePh)) +
      '<div class="pr-lt-sig"><div class="pr-lt-sigh">' + esc(T(TX.sigL)) + '</div><div class="pr-lt-sigprev" data-lt-sigprev></div>' +
        '<div class="pr-lt-sigb"><label class="pr-lt-sbtn">' + esc(T(TX.sigUp)) + '<input type="file" accept="image/png,image/jpeg,image/webp" data-lt-sigfile hidden></label>' +
        '<button type="button" class="pr-lt-sbtn" data-lt-sigdraw="1">' + esc(T(TX.sigDraw)) + '</button><button type="button" class="pr-lt-sbtn ghost" data-lt-sigclear="1">' + esc(T(TX.sigClear)) + '</button></div>' +
        '<div class="pr-hint">' + esc(T(TX.sigNote)) + '</div>' + chk('sigStory', TX.sigStory) + '<input type="hidden" data-lt="sigv" value=""></div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.lookL)) + '</div><div class="pr-lt-looks">' +
      '<button type="button" class="pr-rv-set' + (D.look !== 'modern' ? ' on' : '') + '" data-lt-look="classic"><b>' + esc(T(TX.lkClassic)) + '</b></button>' +
      '<button type="button" class="pr-rv-set' + (D.look === 'modern' ? ' on' : '') + '" data-lt-look="modern"><b>' + esc(T(TX.lkModern)) + '</b></button></div>' +
      chk('qr', TX.oQr) +
      '<label class="pr-ev-in"><span>' + esc(T(TX.oUrgent)) + '</span><select data-lt="urgent">' + TX.urg.map(function(o, i){ return '<option value="' + i + '"' + (+D.urgent === i ? ' selected' : '') + '>' + esc(T(o)) + '</option>'; }).join('') + '</select></label>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.encL)) + '</div>' + chk('guide', TX.oGuide) + (D.guide ? chk('acc', TX.oAcc) +
      (D.acc ? '<div class="pr-ev-grid2">' + inp('accUser', TX.accUser, D.accUser) + '<label class="pr-ev-in"><span>' + esc(T(TX.accCode)) + '</span><input type="text" data-lt-code="1" value="' + esc(ACC_CODE) + '" autocomplete="off" spellcheck="false"></label></div><div class="pr-hint">' + esc(T(TX.accWarn)) + '</div>' : '') : '');
    h += '<div class="pr-ev-h2">' + esc(T(TX.saveL)) + '</div><div class="pr-lt-save">' +
      '<button type="button" class="pr-lt-png" data-lt-png="a4"><i></i>' + esc(T(TX.pngA4)) + '</button>' +
      '<button type="button" class="pr-lt-png story" data-lt-png="story"><i></i>' + esc(T(TX.pngStory)) + '</button></div>' +
      '<div class="pr-hint" data-lt-status style="margin-top:6px;">' + esc(status || T(TX.pdfHint)) + '</div>';
    return h;
  }
  function handleInput(t){
    if(!t || !t.getAttribute) return false;
    if(t.hasAttribute('data-lt-code')){ ACC_CODE = t.value; return true; }
    if(t.hasAttribute('data-lt-sigfile')){
      var f = t.files && t.files[0]; if(!f) return false;
      var rd = new FileReader();
      rd.onload = function(){ var im = new Image(); im.onload = function(){ sigClean(im, function(v){ SIGN.set(v); sigPreview(); poke(); }); }; im.src = rd.result; };
      rd.readAsDataURL(f); t.value = ''; return false;
    }
    var k = t.getAttribute('data-lt');
    if(k){ D[k] = t.value; save(); return true; }
    var k2 = t.getAttribute('data-ltx');
    if(k2){ X()[k2] = t.value; save(); return true; }
    var c = t.getAttribute('data-lt-ck');
    if(c){ D[c] = t.checked ? 1 : 0; save(); if(c === 'guide' || c === 'acc') setTimeout(function(){ var w = document.querySelector('[data-pr="ltWrap"]'); if(w){ var st = w.scrollTop; w.innerHTML = formHTML(); w.scrollTop = st; sigPreview(); } }, 0); return true; }
    return false;
  }
  function setStatus(s){ status = s; document.querySelectorAll('[data-lt-status]').forEach(function(e){ e.textContent = s; }); }
  /* 'form' = redraw the panel too; true = only the sheet changed */
  function handleClick(t){
    if(!t || !t.closest) return false;
    var gq = t.closest('[data-lt-grp]');
    if(gq){ D.grp = gq.getAttribute('data-lt-grp'); save(); return 'form'; }
    var a = t.closest('[data-lt-tpl]');
    if(a){ D.tpl = a.getAttribute('data-lt-tpl'); D.tx = { en:null, th:null }; D.guide = D.acc = D.tpl === 'brain' ? 1 : 0; /* page 2 is about the Market Brain — on for that purpose only (it can still be ticked by hand) */ save(); return 'form'; }
    var b = t.closest('[data-lt-look]');
    if(b){ D.look = b.getAttribute('data-lt-look'); save(); return 'form'; }
    if(t.closest('[data-lt-reset]')){ fill(L()); save(); return 'form'; }
    if(t.closest('[data-lt-sigdraw]')){ sigPad(); return 'none'; }
    if(t.closest('[data-lt-sigclear]')){ SIGN.set(''); sigPreview(); return true; }
    var p = t.closest('[data-lt-png]');
    if(p){ png(p.getAttribute('data-lt-png')); return 'none'; }
    return false;
  }

  /* ---------- the A4 letter ---------- */
  var lastCtx = {};
  function para(s, cls){ return lines(s).length ? '<p class="' + (cls || 'lt-p') + '">' + esc(String(s).trim()).replace(/\n/g, '<br>') + '</p>' : ''; }
  function sheetHTML(ctx){
    ctx = ctx || {}; if(!ctx.noSig) lastCtx = ctx;
    var x = X(), th = L() === 'th', att = lines(x.att), sub = toSub();
    var h = '<div class="pr-sheet pr-lt' + (D.look === 'modern' ? ' modern' : '') + '" lang="' + L() + '"><div class="lt-page">';
    /* header */
    var urg = +D.urgent > 0 && TX.urg[+D.urgent] ? T(TX.urg[+D.urgent]) : '';
    h += '<div class="lt-head">' +
      '<div class="lt-no">' + (urg ? '<em class="lt-urgent">' + esc(urg) + '</em>' : '') + '<span>' + esc(T(TX.no)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>' +
      '<div class="lt-crest">' + (ctx.logo ? '<img class="lt-logo" src="' + ctx.logo + '" alt="">' : '') + '</div>' +
      '<div class="lt-addr"><b>SPACEZ TERMINAL</b><em>' + esc(T(TX.orgSub)) + '</em><span>' + esc(SITE_SHOW) + '</span><span>IG @spczterminal</span></div>' +
    '</div>';
    h += '<div class="lt-rule"><i></i></div>';
    h += '<div class="lt-date">' + esc(dateStr()) + '</div>';
    /* subject block */
    function row(k, v){ return '<tr><th>' + esc(T(k)) + '</th><td>' + v + '</td></tr>'; }
    h += '<table class="lt-meta">' + row(TX.subjW, '<b>' + (esc(x.subj) || '&nbsp;') + '</b>') +
      row(TX.toW, esc(toLine()) + (sub ? '<span class="lt-sub">' + esc(sub) + '</span>' : '')) +
      (lines(x.refTo).length ? row(TX.refW, esc(x.refTo)) : '') +
      (att.length ? row(TX.attW, att.length > 1 ? '<ol class="lt-att">' + att.map(function(a){ return '<li>' + esc(a.replace(/^\d+[.)]\s*/, '')) + '</li>'; }).join('') + '</ol>' : esc(att[0])) : '') +
    '</table>';
    /* body */
    h += '<div class="lt-body">' + para(x.p1) + para(x.p2) + para(x.p3) + para(x.close, 'lt-p lt-close') + '</div>';
    /* signature */
    h += '<div class="lt-signwrap">' + '' + /* 2026-11-21 (b): the round 'seal' was removed — SPACEZ has no registered company seal */
      '<div class="lt-sign"><div class="lt-yours">' + esc(T(TX.yours)) + '</div><div class="lt-sigsp">' + (SIGN.get() && !ctx.noSig ? '<img class="lt-sigimg" src="' + SIGN.get() + '" alt="">' : '') + '</div>' +
      '<div class="lt-sname">( ' + esc(fromName()) + ' )</div><div class="lt-spos">' + esc(fromPos()) + '</div></div></div>';
    /* foot */
    h += '<div class="lt-foot">' +
      '<div class="lt-contact"><b>SPACEZ TERMINAL</b><span>' + esc(SITE_SHOW) + ' · IG @spczterminal</span>' + (String(D.contact || '').trim() ? '<span>' + esc(D.contact) + '</span>' : '') +
        (lines(x.cc).length ? '<span class="lt-cc">' + esc(T(TX.ccW)) + ' ' + esc(x.cc) + '</span>' : '') + '</div>' +
      (D.qr && ctx.qr ? '<div class="lt-qr"><div class="qb">' + ctx.qr(SITE) + '</div><span>' + esc(T(TX.qrCap)) + '</span></div>' : '') +
    '</div><div class="lt-strip"><span>' + esc(T(TX.footL)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>';
    h += '</div>' + (D.guide ? page2(ctx) : '') + '</div>';
    return h;
  }
  /* page 2 — enclosure: how to open the website and the Market Brain, an optional sign-in box, what to review */
  function page2(ctx){
    var th = L() === 'th', code = String(ACC_CODE || '').trim(), user = String(D.accUser || '').trim();
    var steps = [
      I('Open <b>' + SITE_SHOW + '</b> (or scan the QR code). A computer screen shows everything best.', 'เปิดเว็บไซต์ <b>' + SITE_SHOW + '</b> (หรือสแกนคิวอาร์โค้ด) แนะนำให้ใช้คอมพิวเตอร์ จะเห็นข้อมูลครบที่สุด'),
      I('Press <b>Sign in</b> at the bottom right of the screen.', 'กดปุ่ม <b>เข้าสู่ระบบ</b> ที่มุมขวาล่างของหน้าจอ'),
      I('Choose the <b>Reviewer</b> tab and type the code from the box below.', 'เลือกแท็บ <b>ผู้ประเมิน</b> แล้วใส่รหัสจากกล่องข้อมูลเข้าระบบด้านล่าง'),
      I('Press the menu button (☰) in the top bar → <b>Executive suite</b> → the <b>Market Brain</b> card.', 'กดปุ่มเมนู (☰) บนแถบด้านบน → ส่วน <b>พื้นที่ผู้บริหาร</b> → การ์ด <b>สมองตลาด</b>'),
      I('The tabs across the top of the Market Brain hold each part. The <b>Print / PDF</b> tab saves any part as a document.', 'แท็บด้านบนของสมองตลาดคือแต่ละส่วนของเนื้อหา แท็บ <b>พิมพ์ / PDF</b> บันทึกส่วนใดก็ได้เป็นเอกสาร')
    ];
    var parts = [
      [I('Summary', 'สรุปทุกอย่าง'), I('Market-condition score 0–100 from weighted indicators; market "weather" bands', 'คะแนนภาวะตลาด 0–100 จากตัวชี้วัดถ่วงน้ำหนัก และช่วง “สภาพอากาศตลาด”'), I('Choice of indicators, weights and thresholds', 'การเลือกตัวชี้วัด น้ำหนัก และเกณฑ์ตัดสิน')],
      [I('Forecast', 'พยากรณ์ล่วงหน้า'), I('Macro forecasts 1–12 months with track record (error vs “no change”) and calibrated ranges', 'พยากรณ์ตัวแปรมหภาค 1–12 เดือน พร้อมประวัติความแม่น (เทียบกับ “ไม่เปลี่ยนแปลง”) และช่วงที่ปรับเทียบแล้ว'), I('Back-test design, look-ahead bias, calibration', 'การออกแบบการทดสอบย้อนหลัง การใช้ข้อมูลล่วงหน้า และการปรับเทียบ')],
      [I('Asset price forecast', 'คาดการณ์ราคาสินทรัพย์'), I('8 assets: drift, momentum, mean reversion, seasonality; walk-forward test since 2008', '8 สินทรัพย์: แนวโน้มระยะยาว โมเมนตัม การกลับสู่ค่าเฉลี่ย ฤดูกาล ทดสอบแบบเดินหน้าตั้งแต่ปี 2008'), I('Model assumptions, over-fitting, uncertainty ranges', 'สมมติฐานของแบบจำลอง การ over-fit และช่วงความไม่แน่นอน')],
      [I('Inflation & rates · Economy & jobs', 'เงินเฟ้อ & ดอกเบี้ย · เศรษฐกิจ & การจ้างงาน'), I('US macro series (FRED) and how they are read', 'ข้อมูลเศรษฐกิจมหภาคสหรัฐฯ (FRED) และวิธีตีความ'), I('Variable choice and interpretation', 'การเลือกตัวแปรและการตีความ')],
      [I('My portfolio', 'พอร์ตของฉัน'), I('Stock-selection rules tested over 12 years against an equal-weight benchmark; stop-loss study', 'กฎการเลือกหุ้นที่ทดสอบย้อนหลัง 12 ปี เทียบดัชนีถ่วงน้ำหนักเท่ากัน และการศึกษาจุดตัดขาดทุน'), I('Survivorship bias, costs, robustness', 'อคติจากหุ้นที่อยู่รอด ต้นทุน และความทนทานของผล')],
      [I('How to read', 'วิธีดูหน้านี้'), I('The full method behind every number', 'คำอธิบายวิธีคิดของตัวเลขทุกตัว'), I('Clarity and correctness of explanations', 'ความชัดเจนและความถูกต้องของคำอธิบาย')]
    ];
    var h = '<div class="lt-page lt-p2"><div class="lt-p2h">' + (ctx.logo ? '<img class="lt-logo s" src="' + ctx.logo + '" alt="">' : '') +
      '<div><small>' + esc(T({ en:'Enclosure', th:'สิ่งที่ส่งมาด้วย' })) + ' · ' + esc(T(TX.no)) + ' ' + esc(ctx.serial || '') + '</small><b>' + esc(T({ en:'Guide to the website SPACEZ TERMINAL', th:'คู่มือการเข้าใช้งานเว็บไซต์ SPACEZ TERMINAL' })) + '</b></div></div><div class="lt-rule"><i></i></div>';
    h += '<h4 class="lt-h4">' + esc(T({ en:'1. How to sign in', th:'1. ขั้นตอนการเข้าใช้งาน' })) + '</h4><ol class="lt-steps">' + steps.map(function(x){ return '<li>' + T(x) + '</li>'; }).join('') + '</ol>';
    if(D.acc){
      var line = '<i class="lt-wline"></i>';
      h += '<h4 class="lt-h4">' + esc(T({ en:'2. Sign-in details (confidential — for the addressee only)', th:'2. ข้อมูลเข้าระบบ (เป็นความลับ เฉพาะผู้รับหนังสือ)' })) + '</h4><table class="lt-acc">' +
        '<tr><th>' + esc(T({ en:'Website', th:'เว็บไซต์' })) + '</th><td>' + esc(SITE_SHOW) + '</td></tr>' +
        '<tr><th>' + esc(T({ en:'Sign-in tab', th:'แท็บที่เลือก' })) + '</th><td>' + esc(T({ en:'Reviewer', th:'ผู้ประเมิน' })) + '</td></tr>' +
        '<tr><th>' + esc(T({ en:'User name', th:'ชื่อผู้ใช้' })) + '</th><td>' + (user ? esc(user) : esc(T({ en:'— not needed —', th:'— ไม่ต้องใช้ —' }))) + '</td></tr>' +
        '<tr><th>' + esc(T({ en:'Code', th:'รหัสเข้าระบบ' })) + '</th><td class="cd">' + (code ? esc(code) : line) + '</td></tr></table>' +
        '<p class="lt-note">' + esc(T({ en:'Please do not pass the code on. It can be changed after the review.', th:'โปรดอย่าส่งต่อรหัสนี้ให้ผู้อื่น และสามารถเปลี่ยนรหัสได้หลังการตรวจเสร็จสิ้น' })) + '</p>';
    }
    h += '<h4 class="lt-h4">' + esc(T(D.acc ? { en:'3. Parts to review in the Market Brain', th:'3. ส่วนที่ขอให้ตรวจในสมองตลาด' } : { en:'2. Parts to review in the Market Brain', th:'2. ส่วนที่ขอให้ตรวจในสมองตลาด' })) + '</h4>' +
      '<table class="lt-parts"><thead><tr><th>' + esc(T({ en:'Tab', th:'แท็บ' })) + '</th><th>' + esc(T({ en:'What is inside', th:'เนื้อหา' })) + '</th><th>' + esc(T({ en:'Please check', th:'ประเด็นที่ขอให้ตรวจ' })) + '</th></tr></thead><tbody>' +
      parts.map(function(r){ return '<tr><td><b>' + esc(T(r[0])) + '</b></td><td>' + esc(T(r[1])) + '</td><td>' + esc(T(r[2])) + '</td></tr>'; }).join('') + '</tbody></table>';
    h += '<div class="lt-foot"><div class="lt-contact"><b>SPACEZ TERMINAL</b><span>' + esc(SITE_SHOW) + ' · IG @spczterminal</span>' + (String(D.contact || '').trim() ? '<span>' + esc(D.contact) + '</span>' : '') + '</div>' +
      (D.qr && ctx.qr ? '<div class="lt-qr"><div class="qb">' + ctx.qr(SITE) + '</div><span>' + esc(T(TX.qrCap)) + '</span></div>' : '') +
      '</div><div class="lt-strip"><span>' + esc(T(TX.footL)) + ' · ' + esc(T({ en:'page 2', th:'หน้า 2' })) + '</span><b>' + esc(ctx.serial || '') + '</b></div></div>';
    return h;
  }
  /* shrink the type a little when the text is long, so the letter stays on one A4 page */
  function fit(host){
    var s = host && host.querySelector('.pr-lt'); if(!s) return;
    var pages = s.querySelectorAll('.lt-page'); if(!pages.length) return;
    /* the preview column can be narrower than A4: scale the whole page down to fit, never reflow it */
    var hw = host.clientWidth || 794, z = hw < 790 ? Math.max(.4, (hw - 4) / 794).toFixed(3) : '';
    var shrunk = false, still = false;
    Array.prototype.forEach.call(pages, function(pg){
      pg.style.zoom = z;
      var steps = [1, .96, .92, .88, .85, .82], i = 0;
      pg.style.setProperty('--ltk', 1);
      var over = function(){ return pg.scrollHeight > pg.clientHeight + 1; };
      while(i < steps.length - 1 && over()){ i++; pg.style.setProperty('--ltk', steps[i]); }
      if(i > 0) shrunk = true; if(over()) still = true;
      pg.classList.toggle('lt-over', over());
    });
    var st = still ? T(TX.overflow) : (shrunk ? T(TX.tooLong) : '');
    setTimeout(sigPreview, 0);
    if(st) setStatus(st); else if(status === T(TX.tooLong) || status === T(TX.overflow)) setStatus(T(TX.pdfHint));
  }

  /* ---------- pictures ---------- */
  var h2cWait = null;
  function needH2C(cb){
    if(window.html2canvas){ cb(); return; }
    if(h2cWait){ h2cWait.push(cb); return; }
    h2cWait = [cb];
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = function(){ var c = h2cWait; h2cWait = null; c.forEach(function(f){ f(); }); };
    s.onerror = function(){ var c = h2cWait; h2cWait = null; c.forEach(function(f){ f('err'); }); };
    document.head.appendChild(s);
  }
  function a4Canvas(cb, story){
    var box = document.createElement('div');
    box.className = 'pr-lt-render';
    box.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;z-index:-1;pointer-events:none;';
    box.innerHTML = sheetHTML(story && !D.sigStory ? Object.assign({}, lastCtx, { noSig:1 }) : lastCtx);
    document.body.appendChild(box);
    fit(box);
    var el = box.querySelector('.lt-page');
    var done = function(c){ if(box.parentNode) box.parentNode.removeChild(box); cb(c); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){
      window.html2canvas(el, { scale:2, backgroundColor:'#ffffff', useCORS:true, logging:false, width:794, height:1123, windowWidth:1200 })
        .then(done).catch(function(){ done(null); });
    });
  }
  function fname(kind){ var d = new Date(); return 'SPACEZ-letter-' + kind + '-' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '.png'; }
  function download(canvas, name){
    canvas.toBlob(function(b){
      if(!b){ setStatus(T(TX.fail)); return; }
      var u = URL.createObjectURL(b), a = document.createElement('a');
      a.href = u; a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(u); if(a.parentNode) a.parentNode.removeChild(a); }, 1500);
      setStatus(T(TX.made));
    }, 'image/png');
  }
  function segs(s){
    try { if(window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter(L(), { granularity:'word' }).segment(s)).map(function(x){ return x.segment; }); } catch(e){}
    return s.split(/(\s+)/);
  }
  function wrap(ctx, s, w, max){
    var out = [], cur = '';
    segs(s).forEach(function(p){ var t = cur + p; if(ctx.measureText(t).width > w && cur){ out.push(cur.trim()); cur = p.replace(/^\s+/, ''); } else cur = t; });
    if(cur.trim()) out.push(cur.trim());
    if(out.length > max){ out = out.slice(0, max); out[max - 1] = out[max - 1].replace(/.{0,2}$/, '') + '…'; }
    return out;
  }
  function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function story(a4, cb){
    var W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var c = cv.getContext('2d'), F = "'Noto Sans Thai','Sarabun','Inter',sans-serif";
    var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#060a19'); g.addColorStop(.5, '#0d1430'); g.addColorStop(1, '#170d33');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    [[160, 220, 620, 'rgba(34,211,238,.20)'], [940, 1500, 700, 'rgba(139,92,246,.24)'], [900, 260, 420, 'rgba(244,114,182,.10)']].forEach(function(b){
      var r = c.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); r.addColorStop(0, b[3]); r.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H); });
    var seed = 7; function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for(var i = 0; i < 150; i++){ c.fillStyle = 'rgba(255,255,255,' + (0.15 + rnd() * 0.55).toFixed(2) + ')'; c.beginPath(); c.arc(rnd() * W, rnd() * H, rnd() * 1.6 + 0.3, 0, 7); c.fill(); }
    var x = lastCtx || {};
    function rest(){
      c.textBaseline = 'alphabetic';
      c.fillStyle = '#ffffff'; c.font = '800 46px Inter,' + F; c.fillText('SPACEZ TERMINAL', 244, 140);
      c.fillStyle = '#93c5fd'; c.font = '600 30px ' + F; c.fillText(T(TX.storyKind) + ' · ' + T(TX.orgSub), 244, 186);
      /* paper */
      var pw = 820, ph = Math.round(pw * 1123 / 794), px = (W - pw) / 2, py = 250;
      c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 70; c.shadowOffsetY = 26; rr(c, px, py, pw, ph, 20); c.fillStyle = '#fff'; c.fill(); c.restore();
      c.save(); rr(c, px, py, pw, ph, 20); c.clip(); if(a4) c.drawImage(a4, px, py, pw, ph); c.restore();
      var e = c.createLinearGradient(px, py, px + pw, py + ph); e.addColorStop(0, '#22d3ee'); e.addColorStop(.35, '#a78bfa'); e.addColorStop(.7, '#f472b6'); e.addColorStop(1, '#fbbf24');
      c.lineWidth = 4; c.strokeStyle = e; rr(c, px - 2, py - 2, pw + 4, ph + 4, 22); c.stroke();
      /* caption */
      var X0 = X(), y = py + ph + 80;
      c.fillStyle = '#7dd3fc'; c.font = '700 26px ' + F; c.fillText(T(TX.subjW), 130, y);
      c.fillStyle = '#ffffff'; c.font = '800 40px ' + F;
      var sl = wrap(c, String(X0.subj || '').trim() || '—', 820, 2);
      sl.forEach(function(l, k){ c.fillText(l, 130, y + 52 + k * 52); });
      y += 52 * sl.length + 50;
      c.fillStyle = '#cbd5e1'; c.font = '500 30px ' + F; wrap(c, T(TX.toW) + ' ' + toLine(), 820, 1).forEach(function(l){ c.fillText(l, 130, y); });
      c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(130, H - 132, 820, 1.5);
      c.fillStyle = '#e0f2fe'; c.font = '600 28px ' + F; c.fillText(SITE_SHOW, 130, H - 80);
      c.fillStyle = '#94a3b8'; c.font = '500 24px IBM Plex Mono,monospace'; c.textAlign = 'right'; c.fillText(x.serial || '', 950, H - 80); c.textAlign = 'left';
      cb(cv);
    }
    /* logo in a white tile, top left */
    c.save(); c.shadowColor = 'rgba(34,211,238,.45)'; c.shadowBlur = 30; rr(c, 130, 86, 92, 92, 24); c.fillStyle = '#ffffff'; c.fill(); c.restore();
    if(x.logo){ var im = new Image(); im.onload = function(){ var k = Math.min(64 / im.width, 64 / im.height); c.drawImage(im, 176 - im.width * k / 2, 132 - im.height * k / 2, im.width * k, im.height * k); rest(); }; im.onerror = rest; im.src = x.logo; }
    else rest();
  }
  function png(kind){
    setStatus(T(TX.making));
    needH2C(function(err){
      if(err || !window.html2canvas){ setStatus(T(TX.fail)); return; }
      a4Canvas(function(a4){
        if(!a4){ setStatus(T(TX.fail)); return; }
        if(kind === 'story') story(a4, function(cv){ download(cv, fname('story')); });
        else download(a4, fname('A4'));
      }, kind === 'story');
    });
  }

  window.__SPZ_LETTER = { v:1, label:function(){ return T(TX.type); }, formHTML:formHTML, sheetHTML:sheetHTML, handleInput:handleInput, handleClick:handleClick, fit:fit, png:png };
})();
