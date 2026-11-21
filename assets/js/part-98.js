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
    oQr:I('QR code to the website', 'คิวอาร์โค้ดไปที่เว็บไซต์'), oUrgent:I('"Urgent" stamp', 'ตราประทับ "ด่วน"'), oSeal:I('Round SPACEZ seal next to the signature', 'ตราวงกลม SPACEZ ข้างลายเซ็น'),
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
    qrCap:I('Scan to open the website', 'สแกนเพื่อเปิดเว็บไซต์'),
    footL:I('Document issued by SPACEZ TERMINAL', 'เอกสารออกโดย SPACEZ TERMINAL'),
    storyKind:I('Official letter', 'หนังสือทางการ'),
    defFrom:I('Mr. Noraset Boikaw', 'นายนรเศรษฐ์ บ่อแก้ว'), defPos:I('Founder and Developer, SPACEZ TERMINAL', 'ผู้ก่อตั้งและผู้พัฒนา SPACEZ TERMINAL')
  };
  var TITLES = [I('Lecturer', 'อาจารย์'), I('Asst. Prof.', 'ผู้ช่วยศาสตราจารย์'), I('Assoc. Prof.', 'รองศาสตราจารย์'), I('Prof.', 'ศาสตราจารย์'), I('Dr.', 'ดร.'),
    I('Dean', 'คณบดี'), I('Director', 'ผู้อำนวยการ'), I('Teacher', 'คุณครู'), I('Mr./Ms.', 'คุณ'), I('', 'ท่าน')];
  var MTH = { th:['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
    en:['January','February','March','April','May','June','July','August','September','October','November','December'] };

  /* ---------- ready-made purposes ---------- */
  var SITEW = 'SPACEZ TERMINAL (' + SITE_SHOW + ')';
  var TPL = [
    { id:'eval', t:I('Ask to evaluate the website', 'ขอความอนุเคราะห์ประเมินเว็บไซต์'), d:I('to a lecturer, teacher or expert, with the evaluation form', 'ส่งถึงอาจารย์ ครู หรือผู้เชี่ยวชาญ พร้อมแบบประเมิน'),
      subj:I('Request for an evaluation of the SPACEZ TERMINAL website', 'ขอความอนุเคราะห์ประเมินคุณภาพเว็บไซต์ SPACEZ TERMINAL'),
      p1:I('SPACEZ TERMINAL has developed a website for learning about finance and investing — beginner lessons, market analysis tools, an Elliott Wave classroom and exam practice — available at ' + SITEW + '.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาเว็บไซต์เพื่อการเรียนรู้ด้านการเงินและการลงทุน ประกอบด้วยบทเรียนสำหรับผู้เริ่มต้น เครื่องมือวิเคราะห์ตลาด ห้องเรียนคลื่นเอลเลียต และแบบฝึกหัดเตรียมสอบ เปิดให้ใช้งานผ่านเว็บไซต์ ' + SITEW),
      p2:I('So that the work is accurate, sound and suited to its users, we would be most grateful if you, as a person of knowledge and experience in this field, could evaluate the website using the enclosed form — its content, design and ease of use.',
           'เพื่อให้การพัฒนาเป็นไปอย่างมีคุณภาพ ถูกต้องตามหลักวิชาการ และเหมาะสมกับผู้ใช้งาน จึงใคร่ขอความอนุเคราะห์จากท่านในฐานะผู้มีความรู้และประสบการณ์ ช่วยประเมินคุณภาพเว็บไซต์ตามแบบประเมินที่ส่งมาพร้อมนี้ ทั้งด้านเนื้อหา ด้านการออกแบบ และด้านการใช้งาน'),
      p3:I('The sign-in steps and the access code are printed on the evaluation form. Your answers will be used only to improve the website.', 'ทั้งนี้ วิธีเข้าใช้งานและรหัสสำหรับผู้ประเมินได้ระบุไว้ในแบบประเมินแล้ว ผลการประเมินจะนำไปใช้เพื่อการปรับปรุงเว็บไซต์เท่านั้น'),
      close:I('We would therefore be grateful for your kind consideration, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'),
      att:I('Website evaluation form, 1 copy', 'แบบประเมินคุณภาพเว็บไซต์ จำนวน 1 ชุด') },
    { id:'expert', t:I('Invite as an expert reviewer', 'เชิญเป็นผู้ทรงคุณวุฒิตรวจเครื่องมือ'), d:I('for checking a learning tool or research instrument (IOC)', 'ตรวจความเที่ยงตรงของสื่อหรือเครื่องมือวิจัย (IOC)'),
      subj:I('Invitation to serve as an expert reviewer', 'ขอเรียนเชิญเป็นผู้ทรงคุณวุฒิตรวจสอบคุณภาพเครื่องมือ'),
      p1:I('I am developing SPACEZ TERMINAL, an online learning platform for finance and investing, and the tools used with it must be checked for content validity before they are used.',
           'ด้วยข้าพเจ้ากำลังดำเนินการพัฒนาสื่อการเรียนรู้ออนไลน์ SPACEZ TERMINAL ด้านการเงินและการลงทุน ซึ่งจำเป็นต้องตรวจสอบความเที่ยงตรงเชิงเนื้อหาของเครื่องมือที่ใช้ก่อนนำไปใช้จริง'),
      p2:I('Having considered your knowledge, expertise and experience in this field, I would like to invite you to serve as an expert reviewer, checking the tools and giving suggestions so they can be improved.',
           'ในการนี้ ข้าพเจ้าพิจารณาแล้วเห็นว่าท่านเป็นผู้มีความรู้ ความเชี่ยวชาญ และประสบการณ์ในด้านดังกล่าว จึงใคร่ขอเรียนเชิญท่านเป็นผู้ทรงคุณวุฒิในการตรวจสอบเครื่องมือ และให้ข้อเสนอแนะเพื่อปรับปรุงให้มีคุณภาพยิ่งขึ้น'),
      p3:I('', ''),
      close:I('I hope very much for your kind help, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณา หวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่าน และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('1. The tools to be reviewed, 1 set\n2. Item–objective congruence (IOC) form, 1 set', '1. เครื่องมือที่ใช้ในการตรวจสอบ จำนวน 1 ชุด\n2. แบบประเมินความสอดคล้อง (IOC) จำนวน 1 ชุด') },
    { id:'trial', t:I('Ask for a trial / data collection', 'ขอทดลองใช้และเก็บข้อมูล'), d:I('to a school or organisation, with a PDPA note', 'ส่งถึงโรงเรียนหรือหน่วยงาน พร้อมข้อความคุ้มครองข้อมูลส่วนบุคคล'),
      subj:I('Request to trial the website and collect feedback', 'ขอความอนุเคราะห์ทดลองใช้งานเว็บไซต์และเก็บรวบรวมข้อมูล'),
      p1:I('SPACEZ TERMINAL has developed a website for learning about finance and investing (' + SITE_SHOW + ') and would like to try it with real learners so it can be improved.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาเว็บไซต์เพื่อการเรียนรู้ด้านการเงินและการลงทุน (' + SITE_SHOW + ') และประสงค์จะนำไปทดลองใช้กับผู้เรียนจริง เพื่อนำผลมาปรับปรุงให้มีประสิทธิภาพยิ่งขึ้น'),
      p2:I('We would be grateful if you would allow learners in your organisation to try the website and answer a short opinion survey between ........................ The time needed is about ...... minutes.',
           'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านอนุญาตให้ผู้เรียนในหน่วยงานของท่านทดลองใช้งานเว็บไซต์ และตอบแบบสอบถามความคิดเห็น ในช่วงวันที่ ........................ ใช้เวลาประมาณ ...... นาที'),
      p3:I('The information collected will be used only to develop the website and will be kept confidential under the Personal Data Protection Act B.E. 2562 (2019).', 'ทั้งนี้ ข้อมูลที่ได้จะนำไปใช้เพื่อการพัฒนาเว็บไซต์เท่านั้น และจะเก็บรักษาเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562'),
      close:I('We would therefore be grateful for your kind permission, and thank you sincerely.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('Opinion survey, 1 copy', 'แบบสอบถามความคิดเห็น จำนวน 1 ชุด') },
    { id:'thanks', t:I('Thank-you letter', 'หนังสือขอบคุณ'), d:I('after someone reviewed, advised or helped', 'หลังได้รับการประเมิน คำแนะนำ หรือความช่วยเหลือ'),
      subj:I('Letter of thanks', 'ขอขอบคุณ'),
      p1:I('Thank you for kindly evaluating and advising on the SPACEZ TERMINAL website.', 'ตามที่ท่านได้กรุณาให้ความอนุเคราะห์ประเมินและให้คำแนะนำเว็บไซต์ SPACEZ TERMINAL ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('SPACEZ TERMINAL is deeply grateful for the valuable time you gave. Your suggestions are of great use in improving the website for its learners, and we hope for your kind support again in the future.',
           'SPACEZ TERMINAL ขอขอบพระคุณท่านเป็นอย่างสูงที่ได้สละเวลาอันมีค่า ข้อเสนอแนะของท่านเป็นประโยชน์อย่างยิ่งต่อการพัฒนาเว็บไซต์ให้เหมาะกับผู้เรียน และหวังเป็นอย่างยิ่งว่าจะได้รับความกรุณาจากท่านอีกในโอกาสต่อไป'),
      p3:I('', ''),
      close:I('With sincere thanks.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('', '') },
    { id:'intro', t:I('Introduce the platform', 'แนะนำแพลตฟอร์ม / ขอความร่วมมือ'), d:I('to a school, club or partner — ask to share it', 'ส่งถึงโรงเรียน ชมรม หรือพันธมิตร ขอช่วยประชาสัมพันธ์'),
      subj:I('Introducing the SPACEZ TERMINAL learning platform', 'ขอแนะนำแพลตฟอร์มการเรียนรู้ SPACEZ TERMINAL และขอความร่วมมือประชาสัมพันธ์'),
      p1:I('SPACEZ TERMINAL is a free bilingual (Thai / English) platform for learning about finance and investing: step-by-step beginner lessons, live market dashboards, an Elliott Wave classroom and practice exams for the IC licence.',
           'ด้วย SPACEZ TERMINAL เป็นแพลตฟอร์มการเรียนรู้ด้านการเงินและการลงทุนสองภาษา (ไทย / อังกฤษ) ประกอบด้วยบทเรียนพื้นฐานแบบทีละขั้น แผงข้อมูลตลาดแบบเรียลไทม์ ห้องเรียนคลื่นเอลเลียต และแบบฝึกหัดเตรียมสอบใบอนุญาต IC'),
      p2:I('To help more learners build sound financial knowledge, we would like to ask for your cooperation in sharing the platform with the students, members or people in your organisation.',
           'เพื่อส่งเสริมให้ผู้เรียนมีความรู้ทางการเงินที่ถูกต้องและนำไปใช้ได้จริง จึงใคร่ขอความร่วมมือจากท่านช่วยประชาสัมพันธ์แพลตฟอร์มนี้แก่นักเรียน สมาชิก หรือบุคลากรในหน่วยงานของท่าน'),
      p3:I('The platform can be opened at ' + SITE_SHOW + ' or by scanning the QR code on this letter.', 'ทั้งนี้ สามารถเข้าใช้งานได้ที่ ' + SITE_SHOW + ' หรือสแกนคิวอาร์โค้ดท้ายหนังสือนี้'),
      close:I('We would be grateful for your kind cooperation, and thank you in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความร่วมมือ และขอขอบคุณมา ณ โอกาสนี้'),
      att:I('', '') },
    { id:'invite', t:I('Invite to an event', 'เชิญเข้าร่วมกิจกรรม'), d:I('workshop, talk or class — fill in date, time, place', 'อบรม บรรยาย หรือคลาสเรียน — เติมวัน เวลา สถานที่'),
      subj:I('Invitation to attend "........................"', 'ขอเรียนเชิญเข้าร่วมกิจกรรม "........................"'),
      p1:I('SPACEZ TERMINAL will hold "........................" on ........................ at ........................ (place / online), to ........................',
           'ด้วย SPACEZ TERMINAL กำหนดจัดกิจกรรม "........................" ในวันที่ ........................ เวลา ........................ ณ ........................ (หรือทางออนไลน์) โดยมีวัตถุประสงค์เพื่อ ........................'),
      p2:I('We would be honoured if you could attend.', 'ในการนี้ จึงใคร่ขอเรียนเชิญท่านเข้าร่วมกิจกรรมดังกล่าว'),
      p3:I('', ''),
      close:I('We look forward to welcoming you, and thank you in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาเข้าร่วมกิจกรรมตามวัน เวลา และสถานที่ดังกล่าว และขอขอบคุณมา ณ โอกาสนี้'),
      att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'blank', t:I('Write my own', 'เขียนเอง'), d:I('empty letter with the formal layout', 'หนังสือเปล่าตามรูปแบบทางการ'),
      subj:I('', ''), p1:I('', 'ด้วย '), p2:I('', 'ในการนี้ '), p3:I('', ''), close:I('', 'จึงเรียนมาเพื่อโปรดพิจารณา'), att:I('', '') }
  ];
  function tplOf(id){ for(var i = 0; i < TPL.length; i++) if(TPL[i].id === id) return TPL[i]; return TPL[0]; }

  /* ---------- state: texts are kept per language so EN / TH can differ ---------- */
  function blank(){ return { tpl:'eval', look:'classic', toTitle:1, toName:'', toPos:'', toOrg:'', from:'', fromPos:'', contact:'', qr:1, urgent:0, seal:1, tx:{ en:null, th:null } }; }
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
  function dateStr(){ var d = new Date(), l = L(); return l === 'th' ? d.getDate() + ' ' + MTH.th[d.getMonth()] + ' ' + (d.getFullYear() + 543) : d.getDate() + ' ' + MTH.en[d.getMonth()] + ' ' + d.getFullYear(); }

  /* ---------- form (left panel) ---------- */
  var status = '';
  function formHTML(){
    var x = X();
    function inp(k, lbl, val, ph){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><input type="text" data-lt="' + k + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' autocomplete="off"></label>'; }
    function tin(k, lbl, rows){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span>' + (rows ? '<textarea rows="' + rows + '" data-ltx="' + k + '">' + esc(x[k] || '') + '</textarea>' : '<input type="text" data-ltx="' + k + '" value="' + esc(x[k] || '') + '" autocomplete="off">') + '</label>'; }
    function chk(k, lbl){ return '<label class="pr-rv-ck"><input type="checkbox" data-lt-ck="' + k + '"' + (D[k] ? ' checked' : '') + '><span>' + esc(T(lbl)) + '</span></label>'; }
    var h = '<div class="pr-hint" style="margin-bottom:10px;">' + esc(T(TX.hint)) + '</div>';
    h += '<div class="pr-ev-h2" style="margin-top:0">' + esc(T(TX.tplL)) + '</div><div class="pr-lt-tpls">' + TPL.map(function(t){
      return '<button type="button" class="pr-rv-set' + (D.tpl === t.id ? ' on' : '') + '" data-lt-tpl="' + t.id + '"><b>' + esc(T(t.t)) + '</b><span>' + esc(T(t.d)) + '</span></button>'; }).join('') + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.toL)) + '</div><div class="pr-ev-grid2"><label class="pr-ev-in"><span>' + esc(T(TX.toTitle)) + '</span><select data-lt="toTitle">' +
      TITLES.map(function(o, i){ return '<option value="' + i + '"' + (+D.toTitle === i ? ' selected' : '') + '>' + esc(T(o) || '—') + '</option>'; }).join('') + '</select></label>' + inp('toName', TX.toName, D.toName) + '</div>' +
      '<div class="pr-ev-grid2">' + inp('toPos', TX.toPos, D.toPos) + inp('toOrg', TX.toOrg, D.toOrg) + '</div>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.subjL)) + '</div>' + tin('subj', TX.subj) + tin('refTo', TX.refTo) + tin('att', TX.att, 2) +
      tin('p1', TX.p1, 4) + tin('p2', TX.p2, 4) + tin('p3', TX.p3, 3) + tin('close', TX.close, 2) + tin('cc', TX.cc) +
      '<button type="button" class="pr-ev-bigbtn ghost" data-lt-reset="1" style="margin:2px 0 6px;">' + esc(T(TX.reset)) + '</button>';
    h += '<div class="pr-ev-h2">' + esc(T(TX.fromL)) + '</div><div class="pr-ev-grid2">' + inp('from', TX.from, D.from, T(TX.defFrom)) + inp('fromPos', TX.fromPos, D.fromPos, T(TX.defPos)) + '</div>' + inp('contact', TX.contact, D.contact);
    h += '<div class="pr-ev-h2">' + esc(T(TX.lookL)) + '</div><div class="pr-lt-looks">' +
      '<button type="button" class="pr-rv-set' + (D.look !== 'modern' ? ' on' : '') + '" data-lt-look="classic"><b>' + esc(T(TX.lkClassic)) + '</b></button>' +
      '<button type="button" class="pr-rv-set' + (D.look === 'modern' ? ' on' : '') + '" data-lt-look="modern"><b>' + esc(T(TX.lkModern)) + '</b></button></div>' +
      chk('qr', TX.oQr) + chk('seal', TX.oSeal) + chk('urgent', TX.oUrgent);
    h += '<div class="pr-ev-h2">' + esc(T(TX.saveL)) + '</div><div class="pr-lt-save">' +
      '<button type="button" class="pr-lt-png" data-lt-png="a4"><i></i>' + esc(T(TX.pngA4)) + '</button>' +
      '<button type="button" class="pr-lt-png story" data-lt-png="story"><i></i>' + esc(T(TX.pngStory)) + '</button></div>' +
      '<div class="pr-hint" data-lt-status style="margin-top:6px;">' + esc(status || T(TX.pdfHint)) + '</div>';
    return h;
  }
  function handleInput(t){
    if(!t || !t.getAttribute) return false;
    var k = t.getAttribute('data-lt');
    if(k){ D[k] = t.value; save(); return true; }
    var k2 = t.getAttribute('data-ltx');
    if(k2){ X()[k2] = t.value; save(); return true; }
    var c = t.getAttribute('data-lt-ck');
    if(c){ D[c] = t.checked ? 1 : 0; save(); return true; }
    return false;
  }
  function setStatus(s){ status = s; document.querySelectorAll('[data-lt-status]').forEach(function(e){ e.textContent = s; }); }
  /* 'form' = redraw the panel too; true = only the sheet changed */
  function handleClick(t){
    if(!t || !t.closest) return false;
    var a = t.closest('[data-lt-tpl]');
    if(a){ D.tpl = a.getAttribute('data-lt-tpl'); D.tx = { en:null, th:null }; save(); return 'form'; }
    var b = t.closest('[data-lt-look]');
    if(b){ D.look = b.getAttribute('data-lt-look'); save(); return 'form'; }
    if(t.closest('[data-lt-reset]')){ fill(L()); save(); return 'form'; }
    var p = t.closest('[data-lt-png]');
    if(p){ png(p.getAttribute('data-lt-png')); return 'none'; }
    return false;
  }

  /* ---------- the A4 letter ---------- */
  var lastCtx = {};
  function para(s, cls){ return lines(s).length ? '<p class="' + (cls || 'lt-p') + '">' + esc(String(s).trim()).replace(/\n/g, '<br>') + '</p>' : ''; }
  function sheetHTML(ctx){
    ctx = ctx || {}; lastCtx = ctx;
    var x = X(), th = L() === 'th', att = lines(x.att), sub = toSub();
    var h = '<div class="pr-sheet pr-lt' + (D.look === 'modern' ? ' modern' : '') + '" lang="' + L() + '"><div class="lt-page">';
    /* header */
    h += '<div class="lt-head">' +
      '<div class="lt-no"><span>' + esc(T(TX.no)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>' +
      '<div class="lt-crest">' + (ctx.logo ? '<span class="lt-logo"><img src="' + ctx.logo + '" alt=""></span>' : '') + '<b>SPACEZ TERMINAL</b><em>' + esc(T(TX.orgSub)) + '</em></div>' +
      '<div class="lt-addr"><b>' + esc(T(TX.dept)) + '</b><span>' + esc(SITE_SHOW) + '</span><span>IG @spczterminal</span></div>' +
    '</div>' + (D.urgent ? '<div class="lt-urgent">' + esc(T(TX.urgent)) + '</div>' : '');
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
    h += '<div class="lt-signwrap">' + (D.seal ? '<div class="lt-seal"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="ltsc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>' +
        '<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width=".9"/><circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" stroke-width=".9"/>' +
        '<text font-size="10.5" font-weight="700" letter-spacing="3.2" fill="currentColor"><textPath href="#ltsc" startOffset="0">SPACEZ TERMINAL · ' + esc(T(TX.seal)) + ' · </textPath></text>' +
        '<text x="60" y="57" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">SPZ</text><text x="60" y="73" text-anchor="middle" font-size="8" font-weight="600" fill="currentColor">' + new Date().getFullYear() + '</text></svg></div>' : '') +
      '<div class="lt-sign"><div class="lt-yours">' + esc(T(TX.yours)) + '</div><div class="lt-sigsp"></div>' +
      '<div class="lt-sname">( ' + esc(fromName()) + ' )</div><div class="lt-spos">' + esc(fromPos()) + '</div></div></div>';
    /* foot */
    h += '<div class="lt-foot">' +
      '<div class="lt-contact"><b>SPACEZ TERMINAL · ' + esc(T(TX.dept)) + '</b><span>' + esc(SITE_SHOW) + ' · IG @spczterminal</span>' + (String(D.contact || '').trim() ? '<span>' + esc(D.contact) + '</span>' : '') +
        (lines(x.cc).length ? '<span class="lt-cc">' + esc(T(TX.ccW)) + ' ' + esc(x.cc) + '</span>' : '') + '</div>' +
      (D.qr && ctx.qr ? '<div class="lt-qr"><div class="qb">' + ctx.qr(SITE) + '</div><span>' + esc(T(TX.qrCap)) + '</span></div>' : '') +
    '</div><div class="lt-strip"><span>' + esc(T(TX.footL)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>';
    h += '</div></div>';
    return h;
  }
  /* shrink the type a little when the text is long, so the letter stays on one A4 page */
  function fit(host){
    var s = host && host.querySelector('.pr-lt'); if(!s) return;
    var pg = s.querySelector('.lt-page'); if(!pg) return;
    /* the preview column can be narrower than A4: scale the whole page down to fit, never reflow it */
    var hw = host.clientWidth || 794; pg.style.zoom = hw < 800 ? Math.max(.4, (hw - 4) / 794).toFixed(3) : '';
    var steps = [1, .96, .92, .88, .85, .82], i = 0;
    s.style.setProperty('--ltk', 1);
    function over(){ return pg.scrollHeight > pg.clientHeight + 1; }
    while(i < steps.length - 1 && over()){ i++; s.style.setProperty('--ltk', steps[i]); }
    var st = over() ? T(TX.overflow) : (i > 0 ? T(TX.tooLong) : '');
    s.classList.toggle('lt-over', over());
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
  function a4Canvas(cb){
    var box = document.createElement('div');
    box.className = 'pr-lt-render';
    box.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;z-index:-1;pointer-events:none;';
    box.innerHTML = sheetHTML(lastCtx);
    document.body.appendChild(box);
    fit(box);
    var el = box.querySelector('.pr-lt');
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
      });
    });
  }

  window.__SPZ_LETTER = { v:1, label:function(){ return T(TX.type); }, formHTML:formHTML, sheetHTML:sheetHTML, handleInput:handleInput, handleClick:handleClick, fit:fit, png:png };
})();
