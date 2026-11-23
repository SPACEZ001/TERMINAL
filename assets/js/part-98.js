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
   Styles: assets/css/part-98.css.
   2026-11-23 (v2): 60 kinds in 9 groups and six layouts (fmt): external letter, internal memo (บันทึกข้อความ),
   certificate letter (หนังสือรับรอง), announcement (ประกาศ), order (คำสั่ง) and MOU / NDA (two parties + two
   witnesses). Blanks are slots ({key} in a text): the panel shows example chips + "type my own" for each, and
   changing one rewrites the text (hand-edited parts keep the edit). A long document flows onto page 2, 3 …
   (flowFrom). The analyst credential (part-70 window.__SPZ_CRED) shows under the signature when ticked. */
(function(){
  'use strict';
  var LS = 'spz.letter.v1';
  var SITE = 'https://terminal.spacezblack.workers.dev', SITE_SHOW = 'terminal.spacezblack.workers.dev';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : (typeof o === 'string' ? o : (o[L()] || o.en || '')); }
  function I(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var TX = {
    type:I('Official documents', 'เอกสารทางการ'),
    hint:I('Official documents from SPACEZ TERMINAL — external letters, internal memos, certificates, announcements, orders and MOUs (64 ready-made kinds). Pick one, tap the examples to fill the blanks, then edit any line. The document follows the page language (EN / TH). Print → save as PDF, or save it as a picture.',
           'เอกสารทางการของ SPACEZ TERMINAL — หนังสือภายนอก บันทึกข้อความ หนังสือรับรอง ประกาศ คำสั่ง และบันทึกข้อตกลง (MOU) มีให้เลือก 64 แบบ เลือกแบบที่ต้องการ กดเลือกตัวอย่างเพื่อเติมช่องว่าง แล้วแก้ได้ทุกบรรทัด ภาษาของเอกสารตามภาษาของหน้าเว็บ (EN / TH) กดพิมพ์เพื่อบันทึกเป็น PDF หรือบันทึกเป็นรูปก็ได้'),
    tplL:I('Kind of document', 'ประเภทเอกสาร / จุดประสงค์'),
    toL:I('To (เรียน)', 'เรียน (ผู้รับ)'),
    toTitle:I('Title', 'คำนำหน้า / ตำแหน่ง'), toName:I('Name', 'ชื่อ–นามสกุล'), toPos:I('Position (optional)', 'ตำแหน่ง (ถ้ามี)'), toOrg:I('Organisation (optional)', 'หน่วยงาน (ถ้ามี)'),
    subjL:I('Subject and text', 'เรื่องและเนื้อความ'),
    subj:I('Subject (เรื่อง)', 'เรื่อง'), refTo:I('Reference (อ้างถึง) — optional', 'อ้างถึง (ถ้ามี)'), att:I('Enclosures — one per line (optional)', 'สิ่งที่ส่งมาด้วย — บรรทัดละรายการ (ถ้ามี)'),
    p1:I('Paragraph 1 — background', 'ย่อหน้า 1 — ความเป็นมา'), p2:I('Paragraph 2 — purpose / request (เพื่อ…)', 'ย่อหน้า 2 — วัตถุประสงค์ / สิ่งที่ขอ (เพื่อ…)'), p3:I('Paragraph 3 — details (optional)', 'ย่อหน้า 3 — รายละเอียดเพิ่ม (ถ้ามี)'),
    close:I('Closing line (จึงเรียนมาเพื่อ…)', 'ย่อหน้าปิด (จึงเรียนมาเพื่อ…)'),
    cc:I('Copy to (สำเนาเรียน) — optional', 'สำเนาเรียน (ถ้ามี)'),
    fromL:I('Signed by', 'ผู้ลงนาม'),
    from:I('Name', 'ชื่อผู้ลงนาม'), fromPos:I('Position', 'ตำแหน่ง'), contact:I('Contact line (optional) — phone / e-mail', 'ช่องทางติดต่อเพิ่มเติม (ถ้ามี) — โทร / อีเมล'),
    lookL:I('Look and options', 'รูปแบบและตัวเลือก'),
    lkClassic:I('Classic · white paper, navy + gold lines', 'คลาสสิก · กระดาษขาว เส้นน้ำเงิน–ทอง'), lkModern:I('Modern · navy header band', 'โมเดิร์น · แถบหัวกระดาษสีน้ำเงิน'),
    oQr:I('QR code to the website', 'คิวอาร์โค้ดไปที่เว็บไซต์'), oUrgent:I('Speed class (red, top left)', 'ชั้นความเร็ว (ตัวแดง มุมซ้ายบน)'), oSeal:I('Round SPACEZ seal next to the signature', 'ตราวงกลม SPACEZ ข้างลายเซ็น'),
    saveL:I('Save', 'บันทึก'),
    pngA4:I('Save as picture · A4 (PNG)', 'บันทึกเป็นรูป · A4 (PNG)'), pngStory:I('Save as story picture · 9:16 (PNG)', 'บันทึกเป็นรูปสตอรี่ · 9:16 (PNG)'),
    pdfHint:I('For a PDF use the Print button below → "Save as PDF".', 'ถ้าต้องการ PDF กดปุ่มพิมพ์ด้านล่าง → เลือก "บันทึกเป็น PDF"'),
    making:I('Making the picture…', 'กำลังสร้างรูป…'), made:I('Saved to your downloads.', 'บันทึกลงโฟลเดอร์ดาวน์โหลดแล้ว'), fail:I('Could not make the picture — try again.', 'สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง'),
    reset:I('Reset to the purpose\'s text', 'คืนข้อความตั้งต้นของจุดประสงค์นี้'),
    tooLong:I('The text is long — the letter has been set in a smaller font to stay on one A4 page.', 'เนื้อความยาว ระบบย่อตัวอักษรลงเล็กน้อยให้อยู่ในกระดาษ A4 หน้าเดียว'),
    overflow:I('One paragraph is longer than a whole A4 page — split it with Enter (each line becomes its own paragraph) or shorten it.', 'มีย่อหน้าที่ยาวเกิน 1 หน้า A4 — กด Enter แบ่งเป็นหลายย่อหน้า (แต่ละบรรทัดจะเป็นย่อหน้าใหม่) หรือตัดให้สั้นลงนะคะ'),
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
    encL:I('Enclosure page (page 2)', 'หน้าสิ่งที่ส่งมาด้วย (หน้า 2)'),
    oGuide:I('Add page 2: how to open the website and the Market Brain', 'เพิ่มหน้า 2: คู่มือการเข้าใช้งานเว็บไซต์และสมองตลาด'),
    oAcc:I('Include a sign-in box on page 2', 'ใส่กล่องข้อมูลเข้าระบบในหน้า 2'),
    accUser:I('User name (optional)', 'ชื่อผู้ใช้ (ถ้ามี)'), accCode:I('Sign-in code — not saved, type it each time (empty = a line to write by hand)', 'รหัสเข้าระบบ — ไม่บันทึก ต้องพิมพ์ใหม่ทุกครั้ง (เว้นว่าง = เว้นเส้นให้เขียนด้วยมือ)'),
    accWarn:I('Page 2 is never part of the story picture, so the code never goes on a story.', 'หน้า 2 ไม่อยู่ในรูปสตอรี่ รหัสจึงไม่หลุดไปในสตอรี่'),
    /* 2026-11-23: blanks with choices, more layouts */
    slotL:I('Fill in the blanks', 'เติมช่องว่าง'), slotHint:I('Tap an example to put it in the text, or type your own — the text below changes by itself.', 'กดเลือกตัวอย่างเพื่อใส่ลงในเนื้อความ หรือพิมพ์เอง ข้อความด้านล่างจะเปลี่ยนให้อัตโนมัติ'),
    slMulti:I('pick one or more', 'เลือกได้หลายข้อ'), slOwn:I('…or type your own', '…หรือพิมพ์เอง'), slAdd:I('add your own item (optional)', 'เพิ่มรายการเอง (ถ้ามี)'),
    slMiss:I('Part of the text was edited by hand, so it was not changed automatically. Press “Reset” to let the choices fill it again.', 'ข้อความบางส่วนถูกแก้ด้วยมือแล้ว ระบบจึงไม่เปลี่ยนให้อัตโนมัติ กด “คืนข้อความตั้งต้น” หากต้องการให้ช่องเลือกเติมให้อีกครั้ง'),
    legal:I('A general example to start a draft — not legal advice. Have anything binding checked by someone who knows the law before signing.', 'เป็นตัวอย่างทั่วไปสำหรับเริ่มร่างเท่านั้น ไม่ใช่คำปรึกษาทางกฎหมาย เอกสารที่มีผลผูกพันควรให้ผู้รู้กฎหมายตรวจก่อนลงนาม'),
    deptL:I('Department (ส่วนงาน)', 'ส่วนงาน'),
    subjCert:I('Title of the document', 'ชื่อหนังสือ (หัวเรื่อง)'), subjMou:I('Title of the agreement', 'ชื่อบันทึกข้อตกลง'),
    p1g:I('Paragraph 1', 'ย่อหน้า 1'), p2g:I('Paragraph 2', 'ย่อหน้า 2'), p2List:I('List — one item per line', 'รายการ / รายชื่อ — บรรทัดละรายการ'),
    p1Mou:I('Opening — date, place and the two parties', 'ย่อหน้าเปิด — วันที่ สถานที่ และคู่ตกลง'), p2Mou:I('Clauses — one per line', 'ข้อตกลง — บรรทัดละข้อ'), p3Mou:I('Closing statement', 'ย่อหน้าปิดท้าย'),
    closeAnn:I('Closing line (This is announced…)', 'ย่อหน้าปิด (จึงประกาศ…)'), closeOrd:I('Effective line (This takes effect…)', 'บรรทัดมีผล (ทั้งนี้ ตั้งแต่…)'), closeCert:I('Closing line (Issued for…)', 'ย่อหน้าปิด (ให้ไว้เพื่อ…)'),
    memoT:I('MEMORANDUM', 'บันทึกข้อความ'), deptW:I('Department', 'ส่วนงาน'), dateW:I('Date', 'วันที่'),
    givenCert:I('Given on', 'ให้ไว้ ณ วันที่'), givenAnn:I('Announced on', 'ประกาศ ณ วันที่'), givenOrd:I('Ordered on', 'สั่ง ณ วันที่'),
    annT:I('Announcement of SPACEZ TERMINAL', 'ประกาศ SPACEZ TERMINAL'), ordT:I('Order of SPACEZ TERMINAL', 'คำสั่ง SPACEZ TERMINAL'), betw:I('between SPACEZ TERMINAL and', 'ระหว่าง SPACEZ TERMINAL กับ'),
    sgn:I('Signed', 'ลงชื่อ'), p1W:I('Party One', 'ฝ่ายที่หนึ่ง'), p2W:I('Party Two', 'ฝ่ายที่สอง'), rcvW:I('Recipient', 'ผู้รับข้อมูล'), witW:I('Witness', 'พยาน'),
    flowed:I('The document is longer than one A4 page, so it continues on the next page.', 'เอกสารยาวเกิน 1 หน้า ระบบต่อเนื้อความไปหน้าถัดไปให้แล้ว'),
    defFrom:I('Mr. Noraset Boikaw', 'นายนรเศรษฐ์ บ่อแก้ว'), defPos:I('Founder and Developer, SPACEZ TERMINAL', 'ผู้ก่อตั้งและผู้พัฒนา SPACEZ TERMINAL')
  };
  var TITLES = [I('Lecturer', 'อาจารย์'), I('Asst. Prof.', 'ผู้ช่วยศาสตราจารย์'), I('Assoc. Prof.', 'รองศาสตราจารย์'), I('Prof.', 'ศาสตราจารย์'), I('Dr.', 'ดร.'),
    I('Dean', 'คณบดี'), I('Director', 'ผู้อำนวยการ'), I('Teacher', 'คุณครู'), I('Mr./Ms.', 'คุณ'), I('', 'ท่าน')];
  var MTH = { th:['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
    en:['January','February','March','April','May','June','July','August','September','October','November','December'] };

  /* ---------- ready-made purposes ----------
     2026-11-23: blanks are now slots — {key} in a text is filled from the slot's chosen option(s) or the
     owner's own words; the panel shows each slot as clickable example chips + "type my own".
     Slot: { k, l:label, o:[options], m:multi, num:numbered list, def:default index (-1 = dots), ph, dots }.
     fmt: letter (external letter, default) | memo | cert | ann (announcement) | order | mou. */
  var SITEW = 'SPACEZ TERMINAL (' + SITE_SHOW + ')';
  function S(k, l, o, x){ var s = { k:k, l:l, o:o || [] }; if(x) for(var p in x) s[p] = x[p]; if(!s.o.length && s.def == null) s.def = -1; return s; }
  function P(a){ return a.map(function(x){ return I(x[0], x[1]); }); }
  var O = {
    mins:P([['15', '15'], ['20', '20'], ['30', '30'], ['45', '45'], ['60', '60'], ['90', '90']]),
    time:P([['9.00 a.m. – 12.00 noon', '09.00–12.00 น.'], ['1.00 – 4.00 p.m.', '13.00–16.00 น.'], ['9.00 a.m. – 4.00 p.m.', '09.00–16.00 น.'], ['6.30 – 8.30 p.m.', '18.30–20.30 น.']]),
    place:P([['online via Zoom', 'ทางออนไลน์ผ่านโปรแกรม Zoom'], ['online via Google Meet', 'ทางออนไลน์ผ่าน Google Meet'], ['online via Microsoft Teams', 'ทางออนไลน์ผ่าน Microsoft Teams'], ['the meeting room of your organisation', 'ห้องประชุมของหน่วยงานท่าน']]),
    ev:P([['the workshop “Reading charts for beginners”', 'อบรมเชิงปฏิบัติการ “การอ่านกราฟสำหรับผู้เริ่มต้น”'], ['the talk “Investing with discipline”', 'บรรยายพิเศษ “ลงทุนอย่างมีวินัยสำหรับมือใหม่”'], ['the workshop “Elliott Wave from zero”', 'เวิร์กช็อป “คลื่นเอลเลียตตั้งแต่ศูนย์”'], ['the online seminar “The economy and the markets”', 'สัมมนาออนไลน์ “ภาพรวมเศรษฐกิจและตลาดการเงิน”'], ['the IC licence exam tutoring class', 'ติวเข้มเตรียมสอบใบอนุญาตผู้แนะนำการลงทุน (IC)']]),
    aim:P([['build basic financial literacy', 'ส่งเสริมความรู้ทางการเงินขั้นพื้นฐาน'], ['practise analysing markets systematically', 'ฝึกการวิเคราะห์ตลาดอย่างเป็นระบบ'], ['prepare for the IC licence exam', 'เตรียมความพร้อมสอบใบอนุญาตด้านการลงทุน'], ['share experience of investing with discipline', 'แลกเปลี่ยนประสบการณ์การลงทุนอย่างมีวินัย']]),
    topic:P([['investing for beginners', 'การลงทุนสำหรับผู้เริ่มต้น'], ['reading the economic cycle', 'การอ่านวัฏจักรเศรษฐกิจ'], ['Elliott Wave analysis', 'การวิเคราะห์คลื่นเอลเลียต'], ['risk management and position sizing', 'การบริหารความเสี่ยงและการแบ่งเงินลงทุน'], ['saving and personal finance', 'การออมและการวางแผนการเงินส่วนบุคคล']]),
    cls:P([['the Elliott Wave classroom', 'ห้องเรียนคลื่นเอลเลียต'], ['the 7-chapter beginner stock course', 'คอร์สหุ้นสำหรับผู้เริ่มต้น 7 บท'], ['the IC licence exam room', 'ห้องติวสอบใบอนุญาต IC'], ['the 6-level stock classroom', 'ห้องเรียนหุ้น 6 ระดับ']]),
    who:P([['students', 'นักเรียน'], ['university students', 'นักศึกษา'], ['members', 'สมาชิก'], ['staff', 'บุคลากร'], ['parents', 'ผู้ปกครอง'], ['the general public', 'ประชาชนทั่วไป']]),
    term:P([['one year', '1 ปี'], ['two years', '2 ปี'], ['three years', '3 ปี']]),
    comp:P([['the stock-trading simulation contest', 'การแข่งขันจำลองการลงทุนในตลาดหุ้น'], ['the stock analysis writing contest', 'การประกวดบทวิเคราะห์หุ้น'], ['the financial knowledge quiz', 'การแข่งขันตอบปัญหาความรู้ทางการเงิน']]),
    sys:P([['the lessons and exercises', 'บทเรียนและแบบฝึกหัด'], ['sign-in and membership', 'ระบบสมาชิกและการเข้าสู่ระบบ'], ['the Market Brain and reports', 'ระบบสมองตลาดและรายงาน'], ['every part of the website', 'ทุกส่วนของเว็บไซต์']]),
    proj:P([['the “Money-smart youth” camp', 'ค่ายเยาวชนรู้ทันการเงิน'], ['the stock-trading simulation contest', 'การแข่งขันจำลองการลงทุน'], ['financial-literacy training for teachers', 'อบรมครูด้านความรู้ทางการเงิน'], ['the free online class series', 'คลาสเรียนออนไลน์ฟรีต่อเนื่อง']]),
    learn:P([['the 7-chapter beginner stock course', 'คอร์สหุ้นสำหรับผู้เริ่มต้น 7 บท'], ['the Elliott Wave classroom', 'ห้องเรียนคลื่นเอลเลียต'], ['the IC licence exam preparation course', 'หลักสูตรเตรียมสอบใบอนุญาต IC'], ['the 6-level stock classroom', 'ห้องเรียนหุ้น 6 ระดับ']])
  };
  var DATE = function(k, l){ return S(k || 'date', l || I('Date', 'วันที่'), [], { ph:I('e.g. 15 December 2026', 'เช่น 15 ธันวาคม 2569') }); };
  var MINS = function(){ return S('mins', I('Minutes', 'ใช้เวลา (นาที)'), O.mins, { def:-1, dots:'......' }); };
  var TIME = function(){ return S('time', I('Time', 'เวลา'), O.time, { def:-1 }); };
  var PLACE = function(){ return S('place', I('Place', 'สถานที่'), O.place, { def:-1 }); };
  var NAME = function(k, l){ return S(k || 'name', l || I('Person’s name', 'ชื่อ–นามสกุลผู้ได้รับการรับรอง'), [], { ph:I('e.g. Mr. Somchai Jaidee', 'เช่น นายสมชาย ใจดี') }); };
  var ORGB = S('orgB', I('Party two — organisation or person', 'ฝ่ายที่สอง — ชื่อหน่วยงานหรือบุคคล'), [], { ph:I('e.g. Example School', 'เช่น โรงเรียนตัวอย่างวิทยา') });
  var SIGNB = S('signB', I('Party two — person who signs', 'ฝ่ายที่สอง — ผู้ลงนาม'), [], { ph:I('e.g. Mrs. Suda Rakrian', 'เช่น นางสุดา รักเรียน') });
  var POSB = S('posB', I('Party two — position', 'ฝ่ายที่สอง — ตำแหน่ง'), P([['Director', 'ผู้อำนวยการ'], ['Dean', 'คณบดี'], ['Managing Director', 'กรรมการผู้จัดการ'], ['President of the club', 'ประธานชมรม']]), { def:-1 });
  var TPL = [
    /* ===== letters: requests ===== */
    { id:'eval', g:'ask', t:I('Ask to evaluate the website', 'ขอความอนุเคราะห์ประเมินเว็บไซต์'), d:I('to a lecturer, teacher or expert, with the evaluation form', 'ส่งถึงอาจารย์ ครู หรือผู้เชี่ยวชาญ พร้อมแบบประเมิน'),
      subj:I('Request for an evaluation of the SPACEZ TERMINAL website', 'ขอความอนุเคราะห์ประเมินคุณภาพเว็บไซต์ SPACEZ TERMINAL'),
      sl:[S('focus', I('Evaluate which sides', 'ประเมินด้านใด'), P([['its content', 'ด้านเนื้อหา'], ['its design', 'ด้านการออกแบบ'], ['its ease of use', 'ด้านการใช้งาน'], ['its academic accuracy', 'ด้านความถูกต้องทางวิชาการ'], ['its usefulness for learners', 'ด้านประโยชน์ต่อผู้เรียน']]), { m:1, def:[0, 1, 2] })],
      p1:I('SPACEZ TERMINAL has developed a website for learning about finance and investing — beginner lessons, market analysis tools, an Elliott Wave classroom and exam practice — available at ' + SITEW + '.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาเว็บไซต์เพื่อการเรียนรู้ด้านการเงินและการลงทุน ประกอบด้วยบทเรียนสำหรับผู้เริ่มต้น เครื่องมือวิเคราะห์ตลาด ห้องเรียนคลื่นเอลเลียต และแบบฝึกหัดเตรียมสอบ เปิดให้ใช้งานผ่านเว็บไซต์ ' + SITEW),
      p2:I('So that the work is accurate, sound and suited to its users, we would be most grateful if you, as a person of knowledge and experience in this field, could evaluate the website using the enclosed form — {focus}.',
           'เพื่อให้การพัฒนาเป็นไปอย่างมีคุณภาพ ถูกต้องตามหลักวิชาการ และเหมาะสมกับผู้ใช้งาน จึงใคร่ขอความอนุเคราะห์จากท่านในฐานะผู้มีความรู้และประสบการณ์ ช่วยประเมินคุณภาพเว็บไซต์ตามแบบประเมินที่ส่งมาพร้อมนี้ ทั้ง{focus}'),
      p3:I('The sign-in steps and the access code are printed on the evaluation form. Your answers will be used only to improve the website.', 'ทั้งนี้ วิธีเข้าใช้งานและรหัสสำหรับผู้ประเมินได้ระบุไว้ในแบบประเมินแล้ว ผลการประเมินจะนำไปใช้เพื่อการปรับปรุงเว็บไซต์เท่านั้น'),
      close:I('We would therefore be grateful for your kind consideration, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'),
      att:I('Website evaluation form, 1 copy', 'แบบประเมินคุณภาพเว็บไซต์ จำนวน 1 ชุด') },
    { id:'trial', g:'ask', t:I('Ask for a trial / data collection', 'ขอทดลองใช้และเก็บข้อมูล'), d:I('to a school or organisation, with a PDPA note', 'ส่งถึงโรงเรียนหรือหน่วยงาน พร้อมข้อความคุ้มครองข้อมูลส่วนบุคคล'),
      sl:[S('who', I('Who will try it', 'ผู้ที่จะทดลองใช้'), O.who, { def:0 }), S('period', I('Period', 'ช่วงวันที่'), [], { ph:I('e.g. 1–15 December 2026', 'เช่น 1–15 ธันวาคม 2569') }), MINS()],
      subj:I('Request to trial the website and collect feedback', 'ขอความอนุเคราะห์ทดลองใช้งานเว็บไซต์และเก็บรวบรวมข้อมูล'),
      p1:I('SPACEZ TERMINAL has developed a website for learning about finance and investing (' + SITE_SHOW + ') and would like to try it with real learners so it can be improved.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาเว็บไซต์เพื่อการเรียนรู้ด้านการเงินและการลงทุน (' + SITE_SHOW + ') และประสงค์จะนำไปทดลองใช้กับผู้เรียนจริง เพื่อนำผลมาปรับปรุงให้มีประสิทธิภาพยิ่งขึ้น'),
      p2:I('We would be grateful if you would allow the {who} of your organisation to try the website and answer a short opinion survey between {period}. The time needed is about {mins} minutes.',
           'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านอนุญาตให้{who}ในหน่วยงานของท่านทดลองใช้งานเว็บไซต์ และตอบแบบสอบถามความคิดเห็น ในช่วงวันที่ {period} ใช้เวลาประมาณ {mins} นาที'),
      p3:I('The information collected will be used only to develop the website and will be kept confidential under the Personal Data Protection Act B.E. 2562 (2019).', 'ทั้งนี้ ข้อมูลที่ได้จะนำไปใช้เพื่อการพัฒนาเว็บไซต์เท่านั้น และจะเก็บรักษาเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562'),
      close:I('We would therefore be grateful for your kind permission, and thank you sincerely.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('Opinion survey, 1 copy', 'แบบสอบถามความคิดเห็น จำนวน 1 ชุด') },
    { id:'school', g:'ask', t:I('Use the site in class', 'ขอใช้เว็บไซต์เป็นสื่อการสอน'), d:I('to a school director or head of department', 'ส่งถึงผู้อำนวยการโรงเรียนหรือหัวหน้ากลุ่มสาระ'),
      sl:[S('subject', I('Subject', 'รายวิชา'), P([['Social Studies (Economics)', 'สังคมศึกษา (เศรษฐศาสตร์)'], ['Mathematics (interest and percentages)', 'คณิตศาสตร์ (ดอกเบี้ยและร้อยละ)'], ['Personal finance', 'การเงินส่วนบุคคล'], ['Careers and technology', 'การงานอาชีพ'], ['Guidance activities', 'กิจกรรมแนะแนว'], ['the investment club', 'ชุมนุมการลงทุน']])),
           S('grade', I('Level', 'ระดับชั้น'), P([['lower secondary', 'มัธยมศึกษาตอนต้น'], ['upper secondary', 'มัธยมศึกษาตอนปลาย'], ['vocational certificate', 'ประกาศนียบัตรวิชาชีพ (ปวช.)'], ['bachelor’s degree', 'ปริญญาตรี']]), { def:1 }),
           S('term', I('When', 'ช่วงเวลา'), P([['semester 2 of academic year 2026', 'ภาคเรียนที่ 2 ปีการศึกษา 2569'], ['semester 1 of academic year 2027', 'ภาคเรียนที่ 1 ปีการศึกษา 2570']]), { def:-1 })],
      subj:I('Request to use SPACEZ TERMINAL as a learning resource', 'ขอความอนุเคราะห์ใช้เว็บไซต์ SPACEZ TERMINAL เป็นสื่อประกอบการเรียนการสอน'),
      p1:I('SPACEZ TERMINAL is a free bilingual website for learning about money, saving and investing, with step-by-step lessons, drawings, calculators and quick checks suitable for students (' + SITE_SHOW + ').', 'ด้วย SPACEZ TERMINAL เป็นเว็บไซต์การเรียนรู้ด้านการเงิน การออม และการลงทุน สองภาษา ไม่มีค่าใช้จ่าย มีบทเรียนแบบทีละขั้น ภาพประกอบ เครื่องคำนวณ และแบบทดสอบสั้น ที่เหมาะกับผู้เรียน (' + SITE_SHOW + ')'),
      p2:I('We would be grateful for your permission to use the website as a learning resource in {subject} at {grade} level during {term}.', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านอนุญาตให้ใช้เว็บไซต์ดังกล่าวเป็นสื่อประกอบการเรียนการสอนในรายวิชา{subject} ระดับชั้น{grade} ในช่วง{term}'),
      p3:I('No personal data of students is collected, and the content can be adjusted to the school’s curriculum.', 'ทั้งนี้ การใช้งานไม่มีการเก็บข้อมูลส่วนบุคคลของนักเรียน และสามารถปรับเนื้อหาให้สอดคล้องกับหลักสูตรของสถานศึกษาได้'),
      close:I('We would be grateful for your kind permission.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Overview of the lessons, 1 copy', 'รายละเอียดเนื้อหาบทเรียน จำนวน 1 ชุด') },
    { id:'research', g:'ask', t:I('Ask people to answer a survey', 'ขอความร่วมมือตอบแบบสอบถาม'), d:I('research or development survey, with a PDPA note', 'แบบสอบถามเพื่อการวิจัยหรือพัฒนา พร้อมข้อความ PDPA'),
      sl:[S('topic', I('Topic of the study', 'เรื่องที่ศึกษา'), P([['the saving and investing habits of young people', 'พฤติกรรมการออมและการลงทุนของคนรุ่นใหม่'], ['what beginners need from finance lessons', 'ความต้องการบทเรียนการเงินของผู้เริ่มต้น'], ['satisfaction with the website', 'ความพึงพอใจต่อการใช้งานเว็บไซต์'], ['understanding of investment risk', 'ความรู้ความเข้าใจเรื่องความเสี่ยงในการลงทุน']])), MINS(), DATE('due', I('Answer by', 'ตอบภายในวันที่'))],
      subj:I('Request for cooperation in answering a questionnaire', 'ขอความร่วมมือตอบแบบสอบถาม'),
      p1:I('SPACEZ TERMINAL is studying {topic} to improve its learning website for finance and investing.', 'ด้วย SPACEZ TERMINAL กำลังศึกษาเรื่อง{topic} เพื่อนำผลไปพัฒนาเว็บไซต์การเรียนรู้ด้านการเงินและการลงทุนให้ตรงกับความต้องการของผู้เรียน'),
      p2:I('We would be grateful if you could answer the enclosed questionnaire (about {mins} minutes) by {due}.', 'ในการนี้ จึงใคร่ขอความร่วมมือจากท่านตอบแบบสอบถามที่แนบมาพร้อมนี้ ใช้เวลาประมาณ {mins} นาที ภายในวันที่ {due}'),
      p3:I('Answers are anonymous, used only for this study and kept confidential under the Personal Data Protection Act B.E. 2562 (2019).', 'ทั้งนี้ คำตอบของท่านไม่ระบุตัวตน จะนำไปใช้เพื่อการศึกษาครั้งนี้เท่านั้น และเก็บรักษาเป็นความลับตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562'),
      close:I('Thank you for your kind cooperation.', 'จึงเรียนมาเพื่อโปรดให้ความร่วมมือ และขอขอบคุณมา ณ โอกาสนี้'), att:I('Questionnaire, 1 copy', 'แบบสอบถาม จำนวน 1 ชุด') },
    { id:'data', g:'ask', t:I('Ask permission to use data / material', 'ขออนุญาตใช้ข้อมูลหรือผลงาน'), d:I('charts, figures, articles or pictures of another owner', 'กราฟ ตัวเลข บทความ หรือรูปภาพของเจ้าของอื่น'),
      sl:[S('what', I('What you want to use', 'สิ่งที่ขอใช้'), P([['charts and statistics', 'กราฟและข้อมูลสถิติ'], ['the article', 'บทความ'], ['pictures', 'รูปภาพประกอบ'], ['historical price data', 'ข้อมูลราคาย้อนหลัง'], ['the research report', 'รายงานผลการวิจัย']])),
           S('owner', I('Whose', 'ของใคร / หน่วยงานใด'), [], { ph:I('e.g. the Bank of Thailand', 'เช่น ธนาคารแห่งประเทศไทย') }),
           S('use', I('Used with which lesson', 'ใช้ประกอบเนื้อหาเรื่อง'), O.topic)],
      subj:I('Request for permission to use data', 'ขออนุญาตใช้ข้อมูลและเผยแพร่โดยอ้างอิงแหล่งที่มา'),
      p1:I('SPACEZ TERMINAL publishes free learning material about finance and investing for the public.', 'ด้วย SPACEZ TERMINAL จัดทำสื่อการเรียนรู้ด้านการเงินและการลงทุนเผยแพร่แก่ผู้สนใจโดยไม่มีค่าใช้จ่าย'),
      p2:I('We would like permission to use {what} of {owner} in our lesson on {use}, with the source credited in full.', 'ในการนี้ จึงใคร่ขออนุญาตใช้{what}ของ {owner} ประกอบเนื้อหาเรื่อง{use} โดยจะระบุแหล่งที่มาอย่างครบถ้วน'),
      p3:I('The material will be used for education only, not for sale, and will be removed at once if you so request.', 'ทั้งนี้ จะใช้เพื่อการศึกษาเท่านั้น ไม่นำไปใช้ในเชิงพาณิชย์ และพร้อมนำออกทันทีหากท่านประสงค์'),
      close:I('We would be grateful for your kind permission.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบคุณมา ณ โอกาสนี้'), att:I('', '') },
    { id:'sponsor', g:'ask', t:I('Ask for support / sponsorship', 'ขอรับการสนับสนุน'), d:I('for an event, prizes, server costs or a project', 'สำหรับกิจกรรม ของรางวัล ค่าเซิร์ฟเวอร์ หรือโครงการ'),
      sl:[S('proj', I('Project', 'โครงการ'), O.proj), DATE(), S('aim', I('Aim', 'วัตถุประสงค์'), O.aim), S('n', I('Participants', 'จำนวนผู้เข้าร่วม (คน)'), P([['30', '30'], ['50', '50'], ['100', '100'], ['200', '200']]), { def:-1, dots:'......' }),
           S('support', I('Support asked for', 'สิ่งที่ขอรับการสนับสนุน'), P([['prizes for the winners', 'ของรางวัลสำหรับผู้ชนะ'], ['a venue', 'สถานที่จัดกิจกรรม'], ['server and data costs', 'ค่าใช้จ่ายระบบเซิร์ฟเวอร์และข้อมูล'], ['food and drinks for participants', 'อาหารและเครื่องดื่มสำหรับผู้เข้าร่วม'], ['part of the project budget', 'งบประมาณบางส่วนของโครงการ']]), { m:1, def:[0] })],
      subj:I('Request for support for {proj}', 'ขอความอนุเคราะห์สนับสนุนโครงการ{proj}'),
      p1:I('SPACEZ TERMINAL plans {proj} on {date} to {aim}, for about {n} participants.', 'ด้วย SPACEZ TERMINAL มีกำหนดจัดโครงการ{proj} ในวันที่ {date} โดยมีวัตถุประสงค์เพื่อ{aim} มีผู้เข้าร่วมประมาณ {n} คน'),
      p2:I('We would be grateful for your support in the form of {support}.', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านสนับสนุน{support} เพื่อให้โครงการดำเนินไปได้อย่างมีประสิทธิภาพ'),
      p3:I('Your support will be acknowledged on the website, in the event materials and in the closing report.', 'ทั้งนี้ จะประชาสัมพันธ์และขอบคุณการสนับสนุนของท่านบนเว็บไซต์ ในเอกสารประกอบกิจกรรม และในรายงานสรุปผลโครงการ'),
      close:I('We would be grateful for your kind support.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้การสนับสนุน และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Project details and budget, 1 copy', 'รายละเอียดโครงการและงบประมาณ จำนวน 1 ชุด') },
    { id:'interview', g:'ask', t:I('Ask for an interview', 'ขอสัมภาษณ์ / ขอคำแนะนำ'), d:I('learn from an investor, teacher or professional', 'ขอความรู้จากนักลงทุน ครู หรือผู้เชี่ยวชาญ'),
      sl:[S('topic', I('Topic', 'เรื่อง'), O.topic), MINS(), DATE()],
      subj:I('Request for an interview', 'ขอความอนุเคราะห์สัมภาษณ์เพื่อเป็นข้อมูลในการพัฒนาเนื้อหา'),
      p1:I('SPACEZ TERMINAL is preparing learning content on {topic} and would value the experience of practitioners.', 'ด้วย SPACEZ TERMINAL กำลังจัดทำเนื้อหาการเรียนรู้เรื่อง{topic} และต้องการข้อมูลจากประสบการณ์จริงของผู้มีความรู้ในด้านนี้'),
      p2:I('We would be grateful if you could spare about {mins} minutes for an interview on {date} (in person or online).', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์สัมภาษณ์ท่าน ใช้เวลาประมาณ {mins} นาที ในวันที่ {date} (พบตัวหรือทางออนไลน์ตามที่ท่านสะดวก)'),
      p3:I('Questions will be sent in advance; nothing will be published under your name without your approval.', 'ทั้งนี้ จะส่งประเด็นคำถามให้ท่านล่วงหน้า และจะไม่เผยแพร่ข้อมูลในนามของท่านโดยไม่ได้รับอนุญาต'),
      close:I('We would be grateful for your kind help.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Interview questions, 1 copy', 'ประเด็นคำถามการสัมภาษณ์ จำนวน 1 ชุด') },
    { id:'promo', g:'ask', t:I('Ask a page / media to share', 'ขอความอนุเคราะห์ประชาสัมพันธ์'), d:I('to a page, club, media or school office', 'ส่งถึงเพจ ชมรม สื่อ หรือฝ่ายประชาสัมพันธ์'),
      sl:[S('what', I('What to publicise', 'เรื่องที่ประชาสัมพันธ์'), P([['the launch of new beginner lessons', 'การเปิดบทเรียนใหม่สำหรับผู้เริ่มต้น'], ['a free online training', 'การจัดอบรมออนไลน์ฟรี'], ['the opening of the Elliott Wave classroom', 'การเปิดห้องเรียนคลื่นเอลเลียต'], ['the IC exam practice room', 'การเปิดห้องฝึกทำข้อสอบ IC'], ['the stock-trading simulation contest', 'การแข่งขันจำลองการลงทุน']])), DATE(), S('period', I('Share between', 'ช่วงวันที่ขอให้ประชาสัมพันธ์'), [], { ph:I('e.g. 1–10 December 2026', 'เช่น 1–10 ธันวาคม 2569') })],
      subj:I('Request for help in publicising {what}', 'ขอความอนุเคราะห์ประชาสัมพันธ์{what}'),
      p1:I('SPACEZ TERMINAL will hold {what} on {date}, free of charge for everyone interested.', 'ด้วย SPACEZ TERMINAL จะดำเนินการ{what} ในวันที่ {date} โดยเปิดให้ผู้สนใจเข้าร่วมได้โดยไม่มีค่าใช้จ่าย'),
      p2:I('We would be grateful if you could share the news through your channels between {period}.', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านช่วยประชาสัมพันธ์ผ่านช่องทางของท่าน ในช่วงวันที่ {period}'),
      p3:I('A ready-to-post picture and text are enclosed.', 'ทั้งนี้ ได้แนบภาพและข้อความสำหรับประชาสัมพันธ์มาพร้อมนี้แล้ว'),
      close:I('Thank you for your kind help.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบคุณมา ณ โอกาสนี้'), att:I('Picture and text for posting, 1 set', 'ภาพและข้อความประชาสัมพันธ์ จำนวน 1 ชุด') },
    { id:'venue', g:'ask', t:I('Ask to use a venue', 'ขอใช้สถานที่'), d:I('room or hall for a class, training or event', 'ห้องประชุม ห้องเรียน หรือหอประชุมสำหรับจัดกิจกรรม'),
      sl:[S('room', I('Which room', 'สถานที่ที่ขอใช้'), P([['the meeting room', 'ห้องประชุม'], ['the computer room', 'ห้องปฏิบัติการคอมพิวเตอร์'], ['the main hall', 'หอประชุม'], ['a classroom', 'ห้องเรียน']])), S('ev', I('Event', 'กิจกรรม'), O.ev), DATE(), TIME(), S('n', I('Participants', 'จำนวนผู้เข้าร่วม (คน)'), P([['30', '30'], ['50', '50'], ['100', '100']]), { def:-1, dots:'......' })],
      subj:I('Request to use {room}', 'ขอความอนุเคราะห์ใช้{room}'),
      p1:I('SPACEZ TERMINAL plans to hold {ev} on {date}, {time}, for about {n} participants.', 'ด้วย SPACEZ TERMINAL มีกำหนดจัด{ev} ในวันที่ {date} เวลา {time} มีผู้เข้าร่วมประมาณ {n} คน'),
      p2:I('We would be grateful for permission to use {room} of your organisation for this event.', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์ใช้{room}ของหน่วยงานท่านเป็นสถานที่จัดกิจกรรมดังกล่าว'),
      p3:I('We will take good care of the place and the equipment, and leave the room clean and tidy after the event.', 'ทั้งนี้ จะดูแลรักษาสถานที่และอุปกรณ์เป็นอย่างดี และจัดเก็บให้เรียบร้อยภายหลังเสร็จสิ้นกิจกรรม'),
      close:I('We would be grateful for your kind permission.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'recommend', g:'ask', t:I('Ask for a letter of recommendation', 'ขอหนังสือแนะนำ / รับรองผลงาน'), d:I('from a lecturer or expert who knows the work', 'จากอาจารย์หรือผู้ทรงคุณวุฒิที่รู้จักผลงาน'),
      sl:[S('use', I('To be used for', 'เพื่อใช้ประกอบ'), P([['a scholarship application', 'การสมัครขอรับทุนการศึกษา'], ['a university application', 'การสมัครเข้าศึกษาต่อ'], ['an application for project funding', 'การขอรับการสนับสนุนโครงการ'], ['an award entry', 'การส่งผลงานเข้าประกวด']])), DATE('due', I('Needed by', 'ต้องใช้ภายในวันที่'))],
      subj:I('Request for a letter of recommendation', 'ขอความอนุเคราะห์ออกหนังสือแนะนำและรับรองผลงาน'),
      p1:I('As the founder and developer of SPACEZ TERMINAL, a bilingual learning platform for finance and investing, I have had the honour of your advice on the work.', 'ด้วยข้าพเจ้าในฐานะผู้ก่อตั้งและผู้พัฒนา SPACEZ TERMINAL แพลตฟอร์มการเรียนรู้ด้านการเงินและการลงทุนสองภาษา ได้รับความกรุณาจากท่านในการให้คำแนะนำผลงานมาโดยตลอด'),
      p2:I('I would be most grateful if you could write a letter of recommendation on the work, to be used for {use}, by {due}.', 'ในการนี้ ข้าพเจ้าจึงใคร่ขอความอนุเคราะห์จากท่านโปรดออกหนังสือแนะนำและรับรองผลงานดังกล่าว เพื่อใช้ประกอบ{use} ภายในวันที่ {due}'),
      p3:I('A short summary of the work is enclosed for your convenience.', 'ทั้งนี้ ได้แนบสรุปผลงานโดยย่อมาเพื่อประกอบการพิจารณาของท่านแล้ว'),
      close:I('I hope very much for your kind help, and thank you sincerely.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Summary of the work, 1 copy', 'สรุปผลงานโดยย่อ จำนวน 1 ชุด') },
    { id:'proofread', g:'ask', t:I('Ask to check an article', 'ขอให้ตรวจทานบทความ / บทวิเคราะห์'), d:I('accuracy check before publishing', 'ตรวจความถูกต้องก่อนเผยแพร่'),
      sl:[S('doc', I('What to check', 'เอกสารที่ขอให้ตรวจ'), P([['the monthly market analysis', 'บทวิเคราะห์ตลาดประจำเดือน'], ['an article on financial knowledge', 'บทความความรู้ทางการเงิน'], ['the beginner lessons', 'บทเรียนสำหรับผู้เริ่มต้น'], ['the website user guide', 'คู่มือการใช้งานเว็บไซต์'], ['the Elliott Wave lessons', 'บทเรียนคลื่นเอลเลียต']])), DATE('due', I('Back by', 'ส่งคืนภายในวันที่'))],
      subj:I('Request to check {doc}', 'ขอความอนุเคราะห์ตรวจทาน{doc}'),
      p1:I('SPACEZ TERMINAL has prepared {doc} for publication on the website, and wishes it to be correct in every detail.', 'ด้วย SPACEZ TERMINAL ได้จัดทำ{doc} เพื่อเผยแพร่บนเว็บไซต์ และประสงค์ให้เนื้อหามีความถูกต้องครบถ้วนตามหลักวิชาการ'),
      p2:I('We would be grateful if you could check the enclosed draft and return your comments by {due}.', 'ในการนี้ จึงใคร่ขอความอนุเคราะห์จากท่านตรวจทานต้นฉบับที่แนบมาพร้อมนี้ และส่งข้อเสนอแนะคืนภายในวันที่ {due}'),
      p3:I('With your permission, your name will be acknowledged as a reviewer of the work.', 'ทั้งนี้ หากท่านอนุญาต จะระบุนามของท่านในฐานะผู้ตรวจทานไว้ในผลงานดังกล่าว'),
      close:I('We would be grateful for your kind help.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('The draft, 1 copy', 'ต้นฉบับ จำนวน 1 ชุด') },
    { id:'testimonial', g:'ask', t:I('Ask to publish someone’s comment', 'ขออนุญาตเผยแพร่ความคิดเห็น'), d:I('quote a reviewer’s feedback on the site', 'นำคำแนะนำ / คำชมของผู้ประเมินไปเผยแพร่'),
      sl:[S('where', I('Where', 'เผยแพร่ที่ใด'), P([['on the website', 'บนเว็บไซต์'], ['on SPACEZ social media', 'ในสื่อสังคมออนไลน์ของ SPACEZ'], ['in printed publicity', 'ในเอกสารประชาสัมพันธ์']]), { m:1, def:[0] }),
           S('show', I('How to credit', 'การระบุชื่อ'), P([['with your name and position', 'โดยระบุชื่อและตำแหน่งของท่าน'], ['without your name', 'โดยไม่ระบุชื่อ'], ['with your initials only', 'โดยระบุเพียงชื่อย่อ']]))],
      subj:I('Request for permission to publish your comments', 'ขออนุญาตเผยแพร่ความคิดเห็นของท่าน'),
      p1:I('Thank you for the comments you kindly gave on SPACEZ TERMINAL, which are of great value to learners.', 'ตามที่ท่านได้กรุณาให้ความคิดเห็นต่อ SPACEZ TERMINAL ซึ่งเป็นประโยชน์อย่างยิ่งต่อผู้เรียน นั้น'),
      p2:I('We would like to ask your permission to publish your comments {where}, {show}.', 'ในการนี้ จึงใคร่ขออนุญาตนำความคิดเห็นของท่านไปเผยแพร่{where} {show}'),
      p3:I('The text to be published is enclosed; nothing will be published until you approve it, and it will be removed at any time on request.', 'ทั้งนี้ ได้แนบข้อความที่จะเผยแพร่มาให้ท่านตรวจสอบ จะไม่เผยแพร่จนกว่าจะได้รับความเห็นชอบจากท่าน และพร้อมนำออกได้ทุกเมื่อตามที่ท่านประสงค์'),
      close:I('We would be grateful for your kind permission.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Text to be published, 1 copy', 'ข้อความที่จะเผยแพร่ จำนวน 1 ฉบับ') },
    /* ===== letters: invitations ===== */
    { id:'expert', g:'invite', t:I('Invite as an expert reviewer', 'เชิญเป็นผู้ทรงคุณวุฒิตรวจเครื่องมือ'), d:I('for checking a learning tool or research instrument (IOC)', 'ตรวจความเที่ยงตรงของสื่อหรือเครื่องมือวิจัย (IOC)'),
      sl:[S('tool', I('What to check', 'สิ่งที่ขอให้ตรวจ'), P([['the research instruments', 'เครื่องมือที่ใช้ในการวิจัย'], ['the end-of-lesson tests', 'แบบทดสอบท้ายบทเรียน'], ['the satisfaction survey', 'แบบสอบถามความพึงพอใจ'], ['the online lessons', 'เนื้อหาบทเรียนออนไลน์']]))],
      subj:I('Invitation to serve as an expert reviewer', 'ขอเรียนเชิญเป็นผู้ทรงคุณวุฒิตรวจสอบคุณภาพเครื่องมือ'),
      p1:I('I am developing SPACEZ TERMINAL, an online learning platform for finance and investing, and {tool} must be checked for content validity before use.',
           'ด้วยข้าพเจ้ากำลังดำเนินการพัฒนาสื่อการเรียนรู้ออนไลน์ SPACEZ TERMINAL ด้านการเงินและการลงทุน ซึ่งจำเป็นต้องตรวจสอบความเที่ยงตรงเชิงเนื้อหาของ{tool}ก่อนนำไปใช้จริง'),
      p2:I('Having considered your knowledge, expertise and experience in this field, I would like to invite you to serve as an expert reviewer, checking them and giving suggestions so they can be improved.',
           'ในการนี้ ข้าพเจ้าพิจารณาแล้วเห็นว่าท่านเป็นผู้มีความรู้ ความเชี่ยวชาญ และประสบการณ์ในด้านดังกล่าว จึงใคร่ขอเรียนเชิญท่านเป็นผู้ทรงคุณวุฒิในการตรวจสอบ และให้ข้อเสนอแนะเพื่อปรับปรุงให้มีคุณภาพยิ่งขึ้น'),
      p3:I('', ''),
      close:I('I hope very much for your kind help, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณา หวังเป็นอย่างยิ่งว่าจะได้รับความอนุเคราะห์จากท่าน และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('1. {tool}, 1 set\n2. Item–objective congruence (IOC) form, 1 set', '1. {tool} จำนวน 1 ชุด\n2. แบบประเมินความสอดคล้อง (IOC) จำนวน 1 ชุด') },
    { id:'brain', g:'invite', t:I('Expert review of advanced content (Market Brain)', 'เชิญผู้เชี่ยวชาญตรวจเนื้อหาขั้นสูง (สมองตลาด)'), d:I('graduate-level models; with a site guide and sign-in details', 'เนื้อหาระดับบัณฑิตศึกษา แนบคู่มือเข้าเว็บและข้อมูลเข้าระบบ'),
      sl:[S('field', I('Their field', 'ความเชี่ยวชาญของผู้รับ'), P([['economics, finance and statistics', 'เศรษฐศาสตร์ การเงิน และสถิติ'], ['economics', 'เศรษฐศาสตร์'], ['finance and investment', 'การเงินและการลงทุน'], ['statistics and data science', 'สถิติและวิทยาการข้อมูล'], ['econometrics', 'เศรษฐมิติ']]))],
      subj:I('Request for an expert review of the advanced academic content of the “Market Brain” system', 'ขอความอนุเคราะห์ผู้ทรงคุณวุฒิตรวจสอบเนื้อหาเชิงวิชาการขั้นสูงของระบบ “สมองตลาด” (Market Brain)'),
      p1:I('SPACEZ TERMINAL has developed the “Market Brain”, the advanced analysis part of the website: an economic-cycle model with a market-condition score, forecasting models for macro variables (inflation, jobs, interest rates) with their own track records, price-forecast models for eight assets, and walk-forward back-tests with calibrated confidence ranges — content at graduate level.',
           'ด้วย SPACEZ TERMINAL ได้พัฒนาระบบ “สมองตลาด” (Market Brain) ซึ่งเป็นส่วนวิเคราะห์ขั้นสูงของเว็บไซต์ ประกอบด้วยแบบจำลองวัฏจักรเศรษฐกิจและคะแนนภาวะตลาด แบบจำลองพยากรณ์ตัวแปรเศรษฐกิจมหภาค (เงินเฟ้อ การจ้างงาน อัตราดอกเบี้ย) พร้อมประวัติความแม่นยำ แบบจำลองคาดการณ์ราคาสินทรัพย์ 8 ประเภท และการทดสอบย้อนหลังแบบเดินหน้า (walk-forward) พร้อมการปรับเทียบช่วงความเชื่อมั่น ซึ่งเป็นเนื้อหาในระดับบัณฑิตศึกษา'),
      p2:I('So that the content and methods are academically sound, we would be most grateful if you, as an expert in {field}, could review the concepts, assumptions, statistical methods, back-tests and interpretation of results, and suggest improvements.',
           'เพื่อให้เนื้อหาและวิธีการมีความถูกต้องตามหลักวิชาการ จึงใคร่ขอความอนุเคราะห์จากท่านในฐานะผู้ทรงคุณวุฒิด้าน{field} ช่วยตรวจสอบความถูกต้องของแนวคิด สมมติฐาน วิธีการทางสถิติ การทดสอบย้อนหลัง และการตีความผล พร้อมให้ข้อเสนอแนะเพื่อการปรับปรุง'),
      p3:I('A guide to the website and the sign-in details are enclosed. Please keep the sign-in details confidential. Your review will be used only to improve the system.', 'ทั้งนี้ ได้แนบคู่มือการเข้าใช้งานเว็บไซต์และข้อมูลสำหรับเข้าระบบมาพร้อมนี้ ขอความกรุณาเก็บข้อมูลเข้าระบบไว้เป็นความลับ ผลการตรวจสอบจะนำไปใช้เพื่อการพัฒนาระบบเท่านั้น'),
      close:I('We would therefore be grateful for your kind consideration, and thank you sincerely in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'),
      att:I('1. Guide to the website, 1 copy\n2. Sign-in details (user name and code), 1 sheet\n3. Expert evaluation form, 1 copy', '1. คู่มือการเข้าใช้งานเว็บไซต์ จำนวน 1 ชุด\n2. ข้อมูลสำหรับเข้าระบบ (ชื่อผู้ใช้และรหัสผ่าน) จำนวน 1 ฉบับ\n3. แบบประเมินสำหรับผู้ทรงคุณวุฒิ จำนวน 1 ชุด') },
    { id:'invite', g:'invite', t:I('Invite to an event', 'เชิญเข้าร่วมกิจกรรม'), d:I('workshop, talk or class — pick the date, time, place', 'อบรม บรรยาย หรือคลาสเรียน — เลือกวัน เวลา สถานที่'),
      sl:[S('ev', I('Event', 'กิจกรรม'), O.ev), DATE(), TIME(), PLACE(), S('aim', I('Aim', 'วัตถุประสงค์'), O.aim)],
      subj:I('Invitation to attend {ev}', 'ขอเรียนเชิญเข้าร่วมกิจกรรม{ev}'),
      p1:I('SPACEZ TERMINAL will hold {ev} on {date}, {time}, {place}, to {aim}.',
           'ด้วย SPACEZ TERMINAL กำหนดจัดกิจกรรม{ev} ในวันที่ {date} เวลา {time} ณ {place} โดยมีวัตถุประสงค์เพื่อ{aim}'),
      p2:I('We would be honoured if you could attend.', 'ในการนี้ จึงใคร่ขอเรียนเชิญท่านเข้าร่วมกิจกรรมดังกล่าว'),
      p3:I('', ''),
      close:I('We look forward to welcoming you, and thank you in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาเข้าร่วมกิจกรรมตามวัน เวลา และสถานที่ดังกล่าว และขอขอบคุณมา ณ โอกาสนี้'),
      att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'speaker', g:'invite', t:I('Invite a guest speaker', 'เชิญเป็นวิทยากร'), d:I('talk, workshop or class', 'บรรยาย อบรม หรือคลาสเรียน'),
      sl:[S('ev', I('Event', 'กิจกรรม'), O.ev), DATE(), TIME(), PLACE(), S('n', I('Participants', 'จำนวนผู้เข้าร่วม (คน)'), P([['30', '30'], ['50', '50'], ['100', '100'], ['200', '200']]), { def:-1, dots:'......' }), S('topic', I('Talk topic', 'หัวข้อบรรยาย'), O.topic), MINS()],
      subj:I('Invitation to be a guest speaker on “{topic}”', 'ขอเรียนเชิญเป็นวิทยากรบรรยายหัวข้อ “{topic}”'),
      p1:I('SPACEZ TERMINAL will hold {ev} on {date}, {time}, {place}, for about {n} participants.', 'ด้วย SPACEZ TERMINAL กำหนดจัดกิจกรรม{ev} ในวันที่ {date} เวลา {time} ณ {place} มีผู้เข้าร่วมประมาณ {n} คน'),
      p2:I('Given your knowledge and experience, we would be honoured if you could speak on “{topic}” for about {mins} minutes.', 'ในการนี้ พิจารณาแล้วเห็นว่าท่านเป็นผู้มีความรู้และประสบการณ์เป็นอย่างดี จึงใคร่ขอเรียนเชิญท่านเป็นวิทยากรบรรยายหัวข้อ “{topic}” ใช้เวลาประมาณ {mins} นาที'),
      p3:I('Details of the programme and the audience are enclosed.', 'ทั้งนี้ ได้แนบกำหนดการและรายละเอียดผู้เข้าร่วมมาพร้อมนี้'),
      close:I('We would be grateful for your kind acceptance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'meeting', g:'invite', t:I('Invite to a meeting', 'เชิญประชุม'), d:I('team, advisors or partners — with an agenda', 'ทีมงาน ที่ปรึกษา หรือพันธมิตร พร้อมระเบียบวาระ'),
      sl:[S('topic', I('Meeting on', 'ประชุมเรื่อง'), P([['progress of the website development', 'ติดตามความคืบหน้าการพัฒนาเว็บไซต์'], ['the content plan for next quarter', 'วางแผนเนื้อหาประจำไตรมาส'], ['the results of the expert reviews', 'สรุปผลการประเมินจากผู้ทรงคุณวุฒิ'], ['a proposed partnership', 'หารือแนวทางความร่วมมือ'], ['preparing the next event', 'เตรียมการจัดกิจกรรมครั้งต่อไป']])), DATE(), TIME(), PLACE(), DATE('due', I('Reply by', 'แจ้งตอบภายในวันที่'))],
      subj:I('Invitation to a meeting on {topic}', 'ขอเรียนเชิญประชุมเรื่อง{topic}'),
      p1:I('SPACEZ TERMINAL will hold a meeting on {topic} on {date}, {time}, {place}.', 'ด้วย SPACEZ TERMINAL กำหนดประชุมเรื่อง{topic} ในวันที่ {date} เวลา {time} ณ {place}'),
      p2:I('We would be pleased if you could attend. The agenda is enclosed.', 'ในการนี้ จึงขอเรียนเชิญท่านเข้าร่วมประชุมตามวัน เวลา และสถานที่ดังกล่าว รายละเอียดระเบียบวาระการประชุมตามสิ่งที่ส่งมาด้วย'),
      p3:I('Please confirm your attendance by {due}.', 'ทั้งนี้ ขอความกรุณาแจ้งการเข้าร่วมประชุมภายในวันที่ {due}'),
      close:I('Thank you.', 'จึงเรียนมาเพื่อโปรดทราบและเข้าร่วมประชุมตามวัน เวลา และสถานที่ดังกล่าว'), att:I('Agenda, 1 copy', 'ระเบียบวาระการประชุม จำนวน 1 ฉบับ') },
    { id:'class', g:'invite', t:I('Invite to try a class', 'เชิญทดลองเรียน'), d:I('Elliott Wave classroom or beginner course', 'ห้องเรียนคลื่นเอลเลียต หรือคอร์สผู้เริ่มต้น'),
      sl:[S('cls', I('Which class', 'ห้องเรียน'), O.cls), S('period', I('Period', 'ช่วงวันที่'), [], { ph:I('e.g. 1–31 December 2026', 'เช่น 1–31 ธันวาคม 2569') })],
      subj:I('Invitation to try {cls}', 'ขอเรียนเชิญทดลองเรียน{cls}'),
      p1:I('SPACEZ TERMINAL has opened {cls}, a step-by-step online class with practice exams.', 'ด้วย SPACEZ TERMINAL ได้เปิด{cls} เป็นห้องเรียนออนไลน์แบบทีละขั้น พร้อมแบบทดสอบท้ายบท'),
      p2:I('We would like to invite you to try the class free of charge between {period} and share your opinion.', 'ในการนี้ จึงขอเรียนเชิญท่านทดลองเรียนโดยไม่มีค่าใช้จ่าย ในช่วงวันที่ {period} และร่วมแสดงความคิดเห็นเพื่อการพัฒนา'),
      p3:I('', ''),
      close:I('We hope to welcome you.', 'จึงเรียนมาเพื่อโปรดพิจารณา และหวังเป็นอย่างยิ่งว่าจะได้รับเกียรติจากท่าน'), att:I('', '') },
    { id:'judge', g:'invite', t:I('Invite to judge a contest', 'เชิญเป็นกรรมการตัดสิน'), d:I('trading simulation, analysis contest or quiz', 'การแข่งขันจำลองการลงทุน ประกวดบทวิเคราะห์ หรือตอบปัญหา'),
      sl:[S('comp', I('Contest', 'การแข่งขัน'), O.comp), DATE(), PLACE()],
      subj:I('Invitation to serve as a judge of {comp}', 'ขอเรียนเชิญเป็นกรรมการตัดสิน{comp}'),
      p1:I('SPACEZ TERMINAL will hold {comp} on {date}, {place}, to encourage learners to practise analysing markets with discipline.', 'ด้วย SPACEZ TERMINAL กำหนดจัด{comp} ในวันที่ {date} ณ {place} เพื่อส่งเสริมให้ผู้เรียนฝึกการวิเคราะห์ตลาดอย่างมีวินัย'),
      p2:I('Given your expertise, we would be honoured if you would serve as a judge of the contest.', 'ในการนี้ พิจารณาแล้วเห็นว่าท่านเป็นผู้มีความรู้และความเชี่ยวชาญเป็นอย่างดี จึงใคร่ขอเรียนเชิญท่านเป็นกรรมการตัดสินการแข่งขันดังกล่าว'),
      p3:I('The rules and the scoring criteria are enclosed.', 'ทั้งนี้ ได้แนบกติกาและเกณฑ์การให้คะแนนมาพร้อมนี้'),
      close:I('We would be grateful for your kind acceptance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Rules and scoring criteria, 1 copy', 'กติกาและเกณฑ์การให้คะแนน จำนวน 1 ชุด') },
    { id:'compete', g:'invite', t:I('Invite a school to compete', 'เชิญส่งผู้แทนเข้าแข่งขัน'), d:I('to a school or university', 'ส่งถึงสถานศึกษา'),
      sl:[S('comp', I('Contest', 'การแข่งขัน'), O.comp), S('lvl', I('For', 'สำหรับผู้เรียนระดับ'), P([['upper secondary students', 'มัธยมศึกษาตอนปลาย'], ['university students', 'อุดมศึกษา'], ['vocational students', 'อาชีวศึกษา'], ['all levels', 'ทุกระดับ']])), DATE(), DATE('due', I('Apply by', 'สมัครภายในวันที่'))],
      subj:I('Invitation to send a team to {comp}', 'ขอเชิญส่งผู้แทนเข้าร่วม{comp}'),
      p1:I('SPACEZ TERMINAL will hold {comp} for {lvl} on {date}, free of charge.', 'ด้วย SPACEZ TERMINAL กำหนดจัด{comp} สำหรับผู้เรียนระดับ{lvl} ในวันที่ {date} โดยไม่มีค่าใช้จ่าย'),
      p2:I('We would be pleased if your institution could send learners to take part. Applications close on {due}.', 'ในการนี้ จึงขอเชิญสถานศึกษาของท่านส่งผู้แทนเข้าร่วมการแข่งขันดังกล่าว โดยสมัครได้ภายในวันที่ {due}'),
      p3:I('Winners will receive certificates and prizes. The rules and the application form are enclosed.', 'ทั้งนี้ ผู้ชนะจะได้รับเกียรติบัตรและของรางวัล รายละเอียดกติกาและใบสมัครตามสิ่งที่ส่งมาด้วย'),
      close:I('We look forward to your participation.', 'จึงเรียนมาเพื่อโปรดพิจารณา และหวังเป็นอย่างยิ่งว่าจะได้รับความร่วมมือจากท่าน'), att:I('1. Rules, 1 copy\n2. Application form, 1 copy', '1. กติกาการแข่งขัน จำนวน 1 ชุด\n2. ใบสมัคร จำนวน 1 ฉบับ') },
    { id:'preside', g:'invite', t:I('Invite to open an event', 'เชิญเป็นประธานเปิดงาน'), d:I('to a director, dean or honoured guest', 'ส่งถึงผู้บริหารหรือแขกผู้มีเกียรติ'),
      sl:[S('ev', I('Event', 'กิจกรรม'), O.ev), DATE(), TIME(), PLACE()],
      subj:I('Invitation to preside over the opening of {ev}', 'ขอเรียนเชิญเป็นประธานในพิธีเปิด{ev}'),
      p1:I('SPACEZ TERMINAL will hold {ev} on {date}, {time}, {place}.', 'ด้วย SPACEZ TERMINAL กำหนดจัด{ev} ในวันที่ {date} เวลา {time} ณ {place}'),
      p2:I('It would be a great honour if you would preside over the opening and give a short address to the participants.', 'ในการนี้ จึงใคร่ขอเรียนเชิญท่านเป็นประธานในพิธีเปิด และกล่าวให้โอวาทแก่ผู้เข้าร่วมกิจกรรม เพื่อเป็นเกียรติและเป็นขวัญกำลังใจ'),
      p3:I('The programme is enclosed.', 'ทั้งนี้ ได้แนบกำหนดการมาพร้อมนี้'),
      close:I('We would be most grateful for your kind acceptance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้เกียรติ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('Programme, 1 copy', 'กำหนดการ จำนวน 1 ฉบับ') },
    { id:'webinar', g:'invite', t:I('Invite to an online seminar', 'เชิญร่วมสัมมนาออนไลน์'), d:I('pick the topic and the platform', 'เลือกหัวข้อและช่องทางออนไลน์'),
      sl:[S('topic', I('Topic', 'หัวข้อ'), O.topic), DATE(), TIME(), S('place', I('Platform', 'ช่องทาง'), O.place.slice(0, 3))],
      subj:I('Invitation to the online seminar “{topic}”', 'ขอเรียนเชิญร่วมสัมมนาออนไลน์ หัวข้อ “{topic}”'),
      p1:I('SPACEZ TERMINAL will hold an online seminar on “{topic}” on {date}, {time}, {place}.', 'ด้วย SPACEZ TERMINAL กำหนดจัดสัมมนาออนไลน์ หัวข้อ “{topic}” ในวันที่ {date} เวลา {time} {place}'),
      p2:I('We would be pleased if you could join us. The link will be sent to you after you confirm.', 'ในการนี้ จึงขอเรียนเชิญท่านเข้าร่วมสัมมนาดังกล่าว โดยจะจัดส่งลิงก์เข้าร่วมให้ภายหลังการตอบรับ'),
      p3:I('The seminar is free of charge.', 'ทั้งนี้ การเข้าร่วมไม่มีค่าใช้จ่ายใด ๆ'),
      close:I('We look forward to welcoming you.', 'จึงเรียนมาเพื่อโปรดพิจารณาเข้าร่วม และขอขอบคุณมา ณ โอกาสนี้'), att:I('', '') },
    /* ===== letters: working together ===== */
    { id:'intro', g:'work', t:I('Introduce the platform', 'แนะนำแพลตฟอร์ม / ขอความร่วมมือ'), d:I('to a school, club or partner — ask to share it', 'ส่งถึงโรงเรียน ชมรม หรือพันธมิตร ขอช่วยประชาสัมพันธ์'),
      sl:[S('who', I('Share with', 'ประชาสัมพันธ์แก่'), O.who, { m:1, def:[0, 1] })],
      subj:I('Introducing the SPACEZ TERMINAL learning platform', 'ขอแนะนำแพลตฟอร์มการเรียนรู้ SPACEZ TERMINAL และขอความร่วมมือประชาสัมพันธ์'),
      p1:I('SPACEZ TERMINAL is a free bilingual (Thai / English) platform for learning about finance and investing: step-by-step beginner lessons, live market dashboards, an Elliott Wave classroom and practice exams for the IC licence.',
           'ด้วย SPACEZ TERMINAL เป็นแพลตฟอร์มการเรียนรู้ด้านการเงินและการลงทุนสองภาษา (ไทย / อังกฤษ) ประกอบด้วยบทเรียนพื้นฐานแบบทีละขั้น แผงข้อมูลตลาดแบบเรียลไทม์ ห้องเรียนคลื่นเอลเลียต และแบบฝึกหัดเตรียมสอบใบอนุญาต IC'),
      p2:I('To help more learners build sound financial knowledge, we would like to ask for your cooperation in sharing the platform with the {who} of your organisation.',
           'เพื่อส่งเสริมให้ผู้เรียนมีความรู้ทางการเงินที่ถูกต้องและนำไปใช้ได้จริง จึงใคร่ขอความร่วมมือจากท่านช่วยประชาสัมพันธ์แพลตฟอร์มนี้แก่{who}ในหน่วยงานของท่าน'),
      p3:I('The platform can be opened at ' + SITE_SHOW + ' or by scanning the QR code on this letter.', 'ทั้งนี้ สามารถเข้าใช้งานได้ที่ ' + SITE_SHOW + ' หรือสแกนคิวอาร์โค้ดท้ายหนังสือนี้'),
      close:I('We would be grateful for your kind cooperation, and thank you in advance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความร่วมมือ และขอขอบคุณมา ณ โอกาสนี้'),
      att:I('', '') },
    { id:'partner', g:'work', t:I('Propose a partnership / MOU', 'เสนอความร่วมมือ / MOU'), d:I('pick the area and examples of the cooperation', 'เลือกด้านความร่วมมือและตัวอย่างกิจกรรมได้เลย'),
      sl:[S('area', I('Cooperation in', 'ในด้าน'), P([['promoting financial and investment literacy', 'การส่งเสริมความรู้ทางการเงินและการลงทุน'], ['developing online learning materials', 'การพัฒนาสื่อการเรียนรู้ออนไลน์'], ['training and academic activities', 'การจัดอบรมและกิจกรรมทางวิชาการ'], ['research and development of market analysis tools', 'การวิจัยและพัฒนาเครื่องมือวิเคราะห์ตลาด'], ['preparing learners for investment licence exams', 'การเตรียมความพร้อมสอบใบอนุญาตด้านการลงทุน'], ['spreading financial knowledge to the public', 'การเผยแพร่ความรู้ทางการเงินสู่สาธารณะ']])),
           S('ex', I('For example', 'เช่น'), P([['training for students and staff', 'การจัดอบรมให้ความรู้แก่นักเรียนและบุคลากร'], ['using the website as a teaching resource', 'การใช้เว็บไซต์เป็นสื่อประกอบการเรียนการสอน'], ['developing lessons together', 'การพัฒนาเนื้อหาและบทเรียนร่วมกัน'], ['sharing data and experts', 'การแลกเปลี่ยนข้อมูลและผู้เชี่ยวชาญ'], ['a trading-simulation contest', 'การจัดการแข่งขันจำลองการลงทุน'], ['joint publicity', 'การประชาสัมพันธ์กิจกรรมร่วมกัน'], ['joint research', 'การวิจัยร่วมด้านการเงินและการลงทุน']]), { m:1, def:[0, 1] })],
      subj:I('Proposal for cooperation', 'ขอเสนอความร่วมมือด้าน{area}'),
      p1:I('SPACEZ TERMINAL is a bilingual learning platform for finance and investing (' + SITE_SHOW + ') that aims to help people build sound financial knowledge.', 'ด้วย SPACEZ TERMINAL เป็นแพลตฟอร์มการเรียนรู้ด้านการเงินและการลงทุนสองภาษา (' + SITE_SHOW + ') มีเป้าหมายส่งเสริมให้ผู้เรียนมีความรู้ทางการเงินที่ถูกต้องและนำไปใช้ได้จริง'),
      p2:I('We would like to propose cooperation with your organisation in {area}, for example {ex}.', 'ในการนี้ จึงใคร่ขอเสนอความร่วมมือกับหน่วยงานของท่านในด้าน{area} เช่น {ex}'),
      p3:I('If you agree in principle, we would be glad to meet and agree the details together, and to sign a memorandum of understanding (MOU).', 'ทั้งนี้ หากท่านเห็นชอบในหลักการ ยินดีนัดหมายเพื่อหารือรายละเอียดร่วมกัน และจัดทำบันทึกข้อตกลงความร่วมมือ (MOU) ต่อไป'),
      close:I('We look forward to your consideration.', 'จึงเรียนมาเพื่อโปรดพิจารณา และหวังเป็นอย่างยิ่งว่าจะได้รับความร่วมมือจากท่าน'), att:I('Cooperation proposal, 1 copy', 'ข้อเสนอความร่วมมือ จำนวน 1 ชุด') },
    { id:'appoint', g:'work', t:I('Invite to be an advisor', 'เชิญเป็นที่ปรึกษา'), d:I('ask someone to be an advisor of SPACEZ', 'ขอเรียนเชิญเป็นที่ปรึกษาของ SPACEZ'),
      sl:[S('area', I('Advisor on', 'ที่ปรึกษาด้าน'), P([['economics and finance', 'วิชาการด้านเศรษฐศาสตร์และการเงิน'], ['learning design', 'การออกแบบสื่อการเรียนรู้'], ['technology and system security', 'เทคโนโลยีและความปลอดภัยของระบบ'], ['law and personal data protection', 'กฎหมายและการคุ้มครองข้อมูลส่วนบุคคล'], ['marketing and communication', 'การตลาดและการสื่อสาร']])), S('term', I('Term', 'ระยะเวลา'), O.term), S('times', I('Times a year', 'ครั้งต่อปี (ประมาณ)'), P([['2', '2'], ['4', '4'], ['6', '6'], ['12', '12']]), { def:1, dots:'......' })],
      subj:I('Invitation to serve as an advisor', 'ขอเรียนเชิญเป็นที่ปรึกษา SPACEZ TERMINAL'),
      p1:I('SPACEZ TERMINAL is developing its learning content and systems and wishes to be guided by people of knowledge and experience.', 'ด้วย SPACEZ TERMINAL อยู่ระหว่างพัฒนาเนื้อหาและระบบการเรียนรู้ และต้องการคำแนะนำจากผู้มีความรู้และประสบการณ์ เพื่อให้การดำเนินงานเป็นไปอย่างถูกต้องและมีคุณภาพ'),
      p2:I('We would be honoured if you would serve as an advisor on {area} for a term of {term}.', 'ในการนี้ จึงใคร่ขอเรียนเชิญท่านเป็นที่ปรึกษาด้าน{area} ระยะเวลา {term}'),
      p3:I('The role is to give advice when asked, about {times} times a year; it carries no legal or financial obligation.', 'ทั้งนี้ บทบาทของท่านคือให้คำแนะนำตามที่ได้รับการปรึกษา ประมาณปีละ {times} ครั้ง โดยไม่มีภาระผูกพันทางกฎหมายหรือการเงิน'),
      close:I('We would be grateful for your kind acceptance.', 'จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้'), att:I('', '') },
    { id:'followup', g:'work', t:I('Follow up politely', 'ติดตามเรื่องที่ส่งไป'), d:I('a gentle reminder about an earlier letter', 'เตือนความจำอย่างสุภาพ เรื่องหนังสือฉบับก่อน'),
      sl:[S('refno', I('Earlier letter no.', 'เลขที่หนังสือฉบับก่อน'), [], { ph:I('e.g. SPZ-LT-261120-…', 'เช่น SPZ-LT-261120-…') }), DATE('refdate', I('Dated', 'ลงวันที่')), S('topic', I('About', 'เรื่อง'), [], { ph:I('the subject of that letter', 'เรื่องของหนังสือฉบับนั้น') }), DATE('due', I('Due date', 'กำหนดวันที่'))],
      subj:I('Follow-up on {topic}', 'ขอติดตามเรื่อง {topic}'),
      p1:I('Further to our letter no. {refno} of {refdate} about {topic}.', 'ตามหนังสือที่ {refno} ลงวันที่ {refdate} เรื่อง {topic} ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('As the matter is due on {due}, we would be grateful to know your consideration, or whether we can help in any way.', 'เนื่องจากใกล้ถึงกำหนดวันที่ {due} จึงใคร่ขอทราบผลการพิจารณาของท่าน หรือหากมีสิ่งใดที่ต้องการเพิ่มเติม ยินดีดำเนินการให้'),
      p3:I('If you have already replied, please disregard this letter.', 'ทั้งนี้ หากท่านได้ดำเนินการแล้ว ขออภัยมา ณ ที่นี้'),
      close:I('Thank you for your kind attention.', 'จึงเรียนมาเพื่อโปรดพิจารณา และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('', '') },
    { id:'report', g:'work', t:I('Report changes made from feedback', 'รายงานผลการปรับปรุงตามข้อเสนอแนะ'), d:I('tell reviewers what was improved', 'แจ้งผู้ประเมินว่าปรับปรุงอะไรไปแล้ว'),
      sl:[DATE('rdate', I('Feedback given on', 'วันที่ได้รับข้อเสนอแนะ')), S('items', I('What was improved', 'สิ่งที่ปรับปรุงแล้ว'), P([['corrected the content', 'ปรับปรุงความถูกต้องของเนื้อหา'], ['made the text larger and easier to read', 'ปรับขนาดตัวอักษรให้อ่านง่ายขึ้น'], ['explained technical words', 'เพิ่มคำอธิบายศัพท์เทคนิค'], ['improved the phone layout', 'ปรับการแสดงผลบนโทรศัพท์มือถือ'], ['added quick checks after each lesson', 'เพิ่มแบบทดสอบท้ายบทเรียน'], ['made pages load faster', 'ปรับให้หน้าเว็บโหลดเร็วขึ้น']]), { m:1, num:1, def:[0, 1, 2] })],
      subj:I('Report on improvements made from your suggestions', 'รายงานผลการปรับปรุงเว็บไซต์ตามข้อเสนอแนะ'),
      p1:I('Thank you for your suggestions on SPACEZ TERMINAL of {rdate}.', 'ตามที่ท่านได้กรุณาให้ข้อเสนอแนะเกี่ยวกับเว็บไซต์ SPACEZ TERMINAL เมื่อวันที่ {rdate} นั้น'),
      p2:I('We have improved the website as follows: {items}.', 'SPACEZ TERMINAL ได้ดำเนินการปรับปรุงตามข้อเสนอแนะของท่านแล้ว ดังนี้ {items}'),
      p3:I('You are welcome to look again at ' + SITE_SHOW + ' and give further advice at any time.', 'ทั้งนี้ ท่านสามารถตรวจสอบผลการปรับปรุงได้ที่ ' + SITE_SHOW + ' และยินดีรับข้อเสนอแนะเพิ่มเติมทุกเมื่อ'),
      close:I('With sincere thanks.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบพระคุณมา ณ โอกาสนี้'), att:I('Summary of changes, 1 copy', 'สรุปรายการปรับปรุง จำนวน 1 ฉบับ') },
    { id:'accept', g:'work', t:I('Accept an invitation', 'ตอบรับคำเชิญ'), d:I('reply yes to a talk, meeting or event', 'ตอบรับการเป็นวิทยากร ประชุม หรือร่วมกิจกรรม'),
      sl:[DATE('refdate', I('Their letter dated', 'หนังสือของท่านลงวันที่')), S('role', I('Invited to', 'ได้รับเชิญให้'), P([['be a guest speaker', 'เป็นวิทยากร'], ['attend the event', 'เข้าร่วมกิจกรรม'], ['attend the meeting', 'เข้าร่วมประชุม'], ['give an interview', 'ให้สัมภาษณ์'], ['judge the contest', 'เป็นกรรมการตัดสินการแข่งขัน']])), DATE()],
      subj:I('Acceptance of your invitation', 'ตอบรับคำเชิญ'),
      p1:I('Thank you for your letter of {refdate} inviting me to {role} on {date}.', 'ตามหนังสือของท่านลงวันที่ {refdate} ได้ขอเชิญข้าพเจ้า{role} ในวันที่ {date} ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('I am pleased to accept, and will be there on the date and time given.', 'ข้าพเจ้ายินดีตอบรับคำเชิญดังกล่าว และจะเข้าร่วมตามวัน เวลา และสถานที่ที่กำหนด'),
      p3:I('Should you need anything further, please contact me at the details below.', 'ทั้งนี้ หากต้องการข้อมูลเพิ่มเติม สามารถติดต่อได้ตามช่องทางท้ายหนังสือนี้'),
      close:I('Thank you for the honour.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบคุณที่ให้เกียรติมา ณ โอกาสนี้'), att:I('', '') },
    { id:'decline', g:'work', t:I('Decline politely', 'ปฏิเสธอย่างสุภาพ'), d:I('cannot attend or take part this time', 'ไม่สามารถเข้าร่วมได้ในครั้งนี้'),
      sl:[DATE('refdate', I('Their letter dated', 'หนังสือของท่านลงวันที่')), S('role', I('Invited to', 'ได้รับเชิญให้'), P([['be a guest speaker', 'เป็นวิทยากร'], ['attend the event', 'เข้าร่วมกิจกรรม'], ['attend the meeting', 'เข้าร่วมประชุม'], ['give an interview', 'ให้สัมภาษณ์']])),
           S('why', I('Reason', 'เหตุผล'), P([['a commitment made earlier on the same day', 'ติดภารกิจที่กำหนดไว้ล่วงหน้าแล้วในวันดังกล่าว'], ['work on the system that cannot be moved', 'อยู่ระหว่างการพัฒนาระบบซึ่งไม่สามารถเลื่อนได้'], ['the time does not suit', 'ช่วงเวลาดังกล่าวไม่สะดวก']]))],
      subj:I('Unable to accept your invitation', 'ขอแจ้งไม่สามารถตอบรับคำเชิญ'),
      p1:I('Thank you for your letter of {refdate} inviting me to {role}.', 'ตามหนังสือของท่านลงวันที่ {refdate} ได้ขอเชิญข้าพเจ้า{role} ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('I am honoured by the invitation, but regret that because of {why} I am unable to accept this time.', 'ข้าพเจ้ารู้สึกเป็นเกียรติอย่างยิ่ง แต่เนื่องจาก{why} จึงไม่สามารถตอบรับคำเชิญในครั้งนี้ได้'),
      p3:I('I would be glad to help on another occasion.', 'ทั้งนี้ หากมีโอกาสในครั้งต่อไป ข้าพเจ้ายินดีให้ความร่วมมืออย่างเต็มที่'),
      close:I('With my apologies and thanks.', 'จึงเรียนมาเพื่อโปรดทราบ และขออภัยมา ณ โอกาสนี้'), att:I('', '') },
    { id:'send', g:'work', t:I('Cover letter for documents', 'นำส่งเอกสาร'), d:I('send forms, reports or certificates', 'ส่งแบบประเมิน รายงาน หรือเกียรติบัตร'),
      sl:[S('docs', I('Documents sent', 'เอกสารที่ส่ง'), P([['the website evaluation form', 'แบบประเมินคุณภาพเว็บไซต์'], ['the project summary report', 'รายงานสรุปผลโครงการ'], ['certificates', 'เกียรติบัตร'], ['a certificate letter', 'หนังสือรับรอง'], ['the talk materials', 'เอกสารประกอบการบรรยาย']]), { m:1, num:1, def:[0] }),
           S('for', I('For you to', 'เพื่อ'), P([['consider', 'โปรดพิจารณา'], ['keep for your records', 'โปรดทราบและเก็บไว้เป็นหลักฐาน'], ['sign and return', 'โปรดลงนามและส่งคืน'], ['pass on to those concerned', 'โปรดมอบให้ผู้เกี่ยวข้อง']]))],
      subj:I('Sending documents', 'ขอส่งเอกสาร'),
      p1:I('SPACEZ TERMINAL is sending you the following documents: {docs}.', 'ด้วย SPACEZ TERMINAL ขอส่งเอกสาร ดังนี้ {docs}'),
      p2:I('They are sent for you to {for}.', 'รายละเอียดตามสิ่งที่ส่งมาด้วย เพื่อ{for}'),
      p3:I('', ''),
      close:I('Thank you.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบคุณมา ณ โอกาสนี้'), att:I('As listed above', 'ตามรายการข้างต้น') },
    { id:'postpone', g:'work', t:I('Postpone / cancel an event', 'แจ้งเลื่อน / ยกเลิกกิจกรรม'), d:I('with the reason and an apology', 'พร้อมเหตุผลและคำขออภัย'),
      sl:[S('ev', I('Event', 'กิจกรรม'), O.ev), DATE('old', I('Planned date', 'วันที่กำหนดเดิม')), S('why', I('Reason', 'เหตุผล'), P([['circumstances beyond our control', 'มีเหตุจำเป็นที่ไม่อาจหลีกเลี่ยงได้'], ['the venue is not available', 'สถานที่จัดไม่พร้อมใช้งาน'], ['too few registrations', 'จำนวนผู้ลงทะเบียนยังไม่เพียงพอ'], ['the speaker is unwell', 'วิทยากรมีเหตุขัดข้องด้านสุขภาพ']])),
           S('act', I('So we will', 'จึงขอ'), P([['postpone it to ........................', 'เลื่อนการจัดออกไปเป็นวันที่ ........................'], ['cancel it this time', 'ยกเลิกการจัดในครั้งนี้']]))],
      subj:I('Change to {ev}', 'แจ้งการเปลี่ยนแปลงกำหนดการ{ev}'),
      p1:I('SPACEZ TERMINAL had planned to hold {ev} on {old}.', 'ตามที่ SPACEZ TERMINAL ได้กำหนดจัด{ev} ในวันที่ {old} นั้น'),
      p2:I('Because of {why}, we must {act}.', 'เนื่องจาก{why} จึงขอ{act}'),
      p3:I('We apologise for any inconvenience. Registered participants keep their places.', 'จึงขออภัยในความไม่สะดวกมา ณ ที่นี้ ทั้งนี้ ผู้ที่ลงทะเบียนไว้แล้วยังคงได้รับสิทธิ์ตามเดิม'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    /* ===== letters: notices & thanks ===== */
    { id:'thanks', g:'notice', t:I('Thank-you letter', 'หนังสือขอบคุณ'), d:I('after someone reviewed, advised or helped', 'หลังได้รับการประเมิน คำแนะนำ หรือความช่วยเหลือ'),
      sl:[S('for', I('Thanks for', 'ขอบคุณที่'), P([['evaluating and advising on the SPACEZ TERMINAL website', 'ประเมินและให้คำแนะนำเว็บไซต์ SPACEZ TERMINAL'], ['checking the lessons of SPACEZ TERMINAL', 'ตรวจสอบเนื้อหาบทเรียนของ SPACEZ TERMINAL'], ['being a guest speaker at our event', 'เป็นวิทยากรในกิจกรรมของ SPACEZ TERMINAL'], ['trying the website and answering the survey', 'ทดลองใช้งานเว็บไซต์และตอบแบบสอบถาม'], ['supporting our event', 'สนับสนุนการจัดกิจกรรมของ SPACEZ TERMINAL']]))],
      subj:I('Letter of thanks', 'ขอขอบคุณ'),
      p1:I('Thank you for kindly {for}.', 'ตามที่ท่านได้กรุณาให้ความอนุเคราะห์{for} ความละเอียดแจ้งแล้ว นั้น'),
      p2:I('SPACEZ TERMINAL is deeply grateful for the valuable time you gave. Your help is of great use in improving the website for its learners, and we hope for your kind support again in the future.',
           'SPACEZ TERMINAL ขอขอบพระคุณท่านเป็นอย่างสูงที่ได้สละเวลาอันมีค่า ความอนุเคราะห์ของท่านเป็นประโยชน์อย่างยิ่งต่อการพัฒนาเว็บไซต์ให้เหมาะกับผู้เรียน และหวังเป็นอย่างยิ่งว่าจะได้รับความกรุณาจากท่านอีกในโอกาสต่อไป'),
      p3:I('', ''),
      close:I('With sincere thanks.', 'จึงเรียนมาเพื่อโปรดทราบ และขอขอบพระคุณมา ณ โอกาสนี้'),
      att:I('', '') },
    { id:'congrats', g:'notice', t:I('Congratulations', 'แสดงความยินดี'), d:I('a new position, an award or an anniversary', 'รับตำแหน่งใหม่ ได้รับรางวัล หรือครบรอบ'),
      sl:[S('on', I('On', 'ในโอกาส'), P([['your appointment as ........................', 'ได้รับการแต่งตั้งให้ดำรงตำแหน่ง ........................'], ['receiving the ........................ award', 'ได้รับรางวัล ........................'], ['your graduation', 'สำเร็จการศึกษา'], ['the ...... th anniversary of your organisation', 'ครบรอบ ...... ปีแห่งการก่อตั้งหน่วยงาน']]))],
      subj:I('Congratulations', 'แสดงความยินดี'),
      p1:I('SPACEZ TERMINAL has learned with great pleasure of {on}.', 'SPACEZ TERMINAL ได้ทราบด้วยความยินดีเป็นอย่างยิ่งว่าท่าน{on}'),
      p2:I('We offer our warmest congratulations, and wish you every success and happiness in the years ahead.', 'จึงขอแสดงความยินดีมา ณ โอกาสนี้ และขออวยพรให้ท่านประสบความสำเร็จ มีความสุข และเจริญก้าวหน้ายิ่งขึ้นไป'),
      p3:I('', ''),
      close:I('With warm regards.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'result', g:'notice', t:I('Announce a result', 'แจ้งผลการคัดเลือก / ผลการแข่งขัน'), d:I('to a winner, applicant or school', 'ส่งถึงผู้ชนะ ผู้สมัคร หรือสถานศึกษา'),
      sl:[S('what', I('Result of', 'ผลของ'), P([['the selection of participants', 'การคัดเลือกผู้เข้าร่วมกิจกรรม'], ['the stock-trading simulation contest', 'การแข่งขันจำลองการลงทุน'], ['the analysis writing contest', 'การประกวดบทวิเคราะห์หุ้น'], ['the evaluation of the work', 'การประเมินผลงาน']])),
           S('res', I('Result', 'ผลที่ได้'), P([['has been selected', 'ผ่านการคัดเลือก'], ['won first prize', 'ได้รับรางวัลชนะเลิศ'], ['won second prize', 'ได้รับรางวัลรองชนะเลิศอันดับ 1'], ['received an honourable mention', 'ได้รับรางวัลชมเชย']])), NAME('name', I('Name of winner / team', 'ชื่อผู้ได้รับ / ทีม'))],
      subj:I('Result of {what}', 'แจ้งผล{what}'),
      p1:I('SPACEZ TERMINAL has completed {what}.', 'ตามที่ SPACEZ TERMINAL ได้ดำเนินการ{what} นั้น'),
      p2:I('We are pleased to inform you that {name} {res}.', 'บัดนี้ ได้ดำเนินการเสร็จสิ้นแล้ว ผลปรากฏว่า {name} {res}'),
      p3:I('Certificates will be sent to you, and the result will be announced on ' + SITE_SHOW + '.', 'ทั้งนี้ จะจัดส่งเกียรติบัตรให้ภายหลัง และประกาศผลบนเว็บไซต์ ' + SITE_SHOW),
      close:I('With congratulations.', 'จึงเรียนมาเพื่อโปรดทราบ และขอแสดงความยินดีมา ณ โอกาสนี้'), att:I('', '') },
    { id:'apology', g:'notice', t:I('Apology and explanation', 'ขออภัยและชี้แจง'), d:I('a mistake, an outage or a late document', 'ข้อผิดพลาด ระบบขัดข้อง หรือส่งงานล่าช้า'),
      sl:[S('issue', I('What happened', 'เรื่องที่เกิดขึ้น'), P([['wrong prices were shown on some pages', 'ข้อมูลราคาในบางหน้าแสดงผลคลาดเคลื่อน'], ['sign-in did not work for a time', 'ระบบเข้าสู่ระบบขัดข้องชั่วคราว'], ['a document was sent later than planned', 'การส่งเอกสารล่าช้ากว่ากำหนด'], ['a lesson contained an error', 'ข้อความในบทเรียนมีข้อผิดพลาด']])), DATE(),
           S('fix', I('What we did', 'การแก้ไข'), P([['corrected it and added a check so it does not happen again', 'แก้ไขเรียบร้อยแล้ว และเพิ่มขั้นตอนตรวจสอบเพื่อป้องกันไม่ให้เกิดซ้ำ'], ['fixed the system; it now works normally', 'แก้ไขระบบเรียบร้อยแล้ว ขณะนี้ใช้งานได้ตามปกติ'], ['sent the complete documents with this letter', 'ได้จัดส่งเอกสารฉบับสมบูรณ์มาพร้อมหนังสือนี้แล้ว']]))],
      subj:I('Apology and explanation', 'ขออภัยและชี้แจงข้อเท็จจริง'),
      p1:I('On {date}, {issue}.', 'ด้วยเมื่อวันที่ {date} {issue}'),
      p2:I('SPACEZ TERMINAL sincerely apologises. We have {fix}.', 'SPACEZ TERMINAL ขออภัยเป็นอย่างสูงในความไม่สะดวกที่เกิดขึ้น และขอเรียนว่าได้{fix}'),
      p3:I('If you have any further questions, please contact us at the details below.', 'ทั้งนี้ หากท่านมีข้อสงสัยเพิ่มเติม สามารถติดต่อได้ตามช่องทางท้ายหนังสือนี้'),
      close:I('With our apologies.', 'จึงเรียนมาเพื่อโปรดทราบ และขออภัยมา ณ โอกาสนี้'), att:I('', '') },
    { id:'policy', g:'notice', t:I('Notice of new terms', 'แจ้งปรับปรุงเงื่อนไขการใช้งาน'), d:I('terms of use, privacy or member rights', 'ข้อตกลงการใช้งาน ความเป็นส่วนตัว หรือสิทธิ์สมาชิก'),
      sl:[S('what', I('What changed', 'สิ่งที่ปรับปรุง'), P([['the terms of use of the website', 'ข้อตกลงการใช้งานเว็บไซต์'], ['the personal data protection policy', 'นโยบายคุ้มครองข้อมูลส่วนบุคคล'], ['member access rights', 'สิทธิ์การเข้าถึงของสมาชิก']])), DATE('eff', I('In force from', 'มีผลตั้งแต่วันที่'))],
      subj:I('Notice of changes to {what}', 'แจ้งการปรับปรุง{what}'),
      p1:I('SPACEZ TERMINAL has updated {what} to keep it clear, fair and in line with the law.', 'ด้วย SPACEZ TERMINAL ได้ปรับปรุง{what} เพื่อให้มีความชัดเจน เป็นธรรม และสอดคล้องกับกฎหมายที่เกี่ยวข้อง'),
      p2:I('The new version takes effect on {eff} and can be read in full at ' + SITE_SHOW + '.', 'ฉบับปรับปรุงมีผลบังคับใช้ตั้งแต่วันที่ {eff} เป็นต้นไป สามารถอ่านรายละเอียดฉบับเต็มได้ที่ ' + SITE_SHOW),
      p3:I('Continuing to use the website after that date means you accept the new version.', 'ทั้งนี้ การใช้งานเว็บไซต์ต่อไปภายหลังวันดังกล่าว ถือว่าท่านรับทราบและยอมรับฉบับปรับปรุงแล้ว'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'launch', g:'notice', t:I('Announce something new', 'แจ้งเปิดตัว / ฟีเจอร์ใหม่'), d:I('new lessons, tools or a new section', 'บทเรียน เครื่องมือ หรือส่วนใหม่ของเว็บ'),
      sl:[S('what', I('What is new', 'สิ่งที่เปิดใหม่'), P([['the 7-chapter beginner course', 'คอร์สหุ้นสำหรับผู้เริ่มต้น 7 บท'], ['the IC licence exam room', 'ห้องฝึกทำข้อสอบใบอนุญาต IC'], ['the Market Brain analysis system', 'ระบบวิเคราะห์สมองตลาด (Market Brain)'], ['the Elliott Wave classroom', 'ห้องเรียนคลื่นเอลเลียต'], ['the economic calendar', 'ปฏิทินเศรษฐกิจ']])),
           S('ben', I('Which helps learners', 'ซึ่งช่วยให้ผู้เรียน'), P([['learn step by step from zero', 'เรียนรู้ได้ทีละขั้นตั้งแต่ศูนย์'], ['practise with real exam-style questions', 'ฝึกทำข้อสอบเสมือนจริง'], ['read the market with data, not guesses', 'อ่านภาวะตลาดจากข้อมูลจริงแทนการคาดเดา'], ['plan ahead for important economic news', 'วางแผนรับมือข่าวเศรษฐกิจสำคัญล่วงหน้า']]))],
      subj:I('Announcing {what} on SPACEZ TERMINAL', 'แจ้งเปิดให้บริการ{what} บนเว็บไซต์ SPACEZ TERMINAL'),
      p1:I('SPACEZ TERMINAL has launched {what}, which helps learners {ben}.', 'ด้วย SPACEZ TERMINAL ได้เปิดให้บริการ{what} ซึ่งช่วยให้ผู้เรียน{ben}'),
      p2:I('It is available now at ' + SITE_SHOW + ' at no cost.', 'ท่านสามารถเข้าใช้งานได้แล้วที่ ' + SITE_SHOW + ' โดยไม่มีค่าใช้จ่าย'),
      p3:I('We would welcome your feedback.', 'ทั้งนี้ ยินดีรับฟังความคิดเห็นและข้อเสนอแนะจากท่าน เพื่อนำไปพัฒนาต่อไป'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'maint', g:'notice', t:I('Notice of maintenance', 'แจ้งปิดปรับปรุงระบบ'), d:I('downtime with an apology', 'แจ้งช่วงปิดระบบ พร้อมขออภัย'),
      sl:[DATE(), S('t1', I('From', 'ตั้งแต่เวลา'), P([['10.00 p.m.', '22.00 น.'], ['midnight', '24.00 น.'], ['1.00 a.m.', '01.00 น.']]), { def:-1 }), S('t2', I('Until', 'ถึงเวลา'), P([['2.00 a.m.', '02.00 น.'], ['4.00 a.m.', '04.00 น.'], ['6.00 a.m.', '06.00 น.']]), { def:-1 }), S('sys', I('What is affected', 'ส่วนที่ใช้งานไม่ได้'), O.sys)],
      subj:I('Notice of system maintenance', 'แจ้งปิดปรับปรุงระบบชั่วคราว'),
      p1:I('SPACEZ TERMINAL will carry out maintenance on {date} from {t1} to {t2}.', 'ด้วย SPACEZ TERMINAL มีกำหนดปิดปรับปรุงระบบในวันที่ {date} ตั้งแต่เวลา {t1} ถึง {t2}'),
      p2:I('During this time {sys} will be unavailable.', 'ในช่วงเวลาดังกล่าว {sys}จะไม่สามารถใช้งานได้ชั่วคราว'),
      p3:I('We apologise for any inconvenience.', 'จึงขออภัยในความไม่สะดวกมา ณ ที่นี้'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    /* ===== บันทึกข้อความ (internal memo) ===== */
    { id:'m_report', g:'memo', fmt:'memo', t:I('Monthly work report', 'รายงานผลการดำเนินงานประจำเดือน'), d:I('what was done this month and the plan next', 'สิ่งที่ทำไปแล้ว และแผนเดือนถัดไป'),
      sl:[S('month', I('Month', 'เดือน'), [], { ph:I('e.g. November 2026', 'เช่น พฤศจิกายน 2569') }),
           S('items', I('Done this month', 'ผลงานเดือนนี้'), P([['added new lessons', 'เพิ่มบทเรียนใหม่'], ['improved the Market Brain', 'ปรับปรุงระบบสมองตลาด'], ['improved the phone layout', 'ปรับการแสดงผลบนโทรศัพท์มือถือ'], ['fixed problems reported by users', 'แก้ไขปัญหาที่ผู้ใช้งานแจ้ง'], ['added IC exam practice', 'เพิ่มแบบฝึกหัดเตรียมสอบ IC'], ['made new printable reports', 'จัดทำรายงานสำหรับพิมพ์รูปแบบใหม่']]), { m:1, num:1, def:[0, 1, 3] }),
           S('next', I('Plan for next month', 'แผนเดือนถัดไป'), P([['invite experts to review the content', 'เชิญผู้ทรงคุณวุฒิประเมินเนื้อหา'], ['trial the website with students', 'ทดลองใช้เว็บไซต์กับนักเรียน'], ['hold a free online class', 'จัดคลาสเรียนออนไลน์ฟรี'], ['improve page speed', 'ปรับปรุงความเร็วของหน้าเว็บ']]), { m:1, def:[0] })],
      subj:I('Work report for {month}', 'รายงานผลการดำเนินงานประจำเดือน{month}'),
      p1:I('I report the work on SPACEZ TERMINAL for {month} as follows.', 'ตามที่ข้าพเจ้าได้รับผิดชอบการพัฒนาเว็บไซต์ SPACEZ TERMINAL นั้น ขอรายงานผลการดำเนินงานประจำเดือน{month} ดังนี้'),
      p2:I('{items}', '{items}'),
      p3:I('Next month the plan is to {next}.', 'สำหรับเดือนถัดไป มีแผนดำเนินการ{next}'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'m_approve', g:'memo', fmt:'memo', t:I('Ask approval for a project', 'ขออนุมัติดำเนินโครงการ'), d:I('aim, date and budget', 'วัตถุประสงค์ วันที่ และงบประมาณ'),
      sl:[S('proj', I('Project', 'โครงการ'), O.proj), DATE(), S('aim', I('Aim', 'วัตถุประสงค์'), O.aim), S('amt', I('Budget (baht)', 'งบประมาณ (บาท)'), [], { ph:I('e.g. 5,000', 'เช่น 5,000'), dots:'............' })],
      subj:I('Approval to run {proj}', 'ขออนุมัติดำเนินโครงการ{proj}'),
      p1:I('SPACEZ TERMINAL plans to run {proj} on {date} to {aim}.', 'ด้วย SPACEZ TERMINAL มีแผนจัดโครงการ{proj} ในวันที่ {date} โดยมีวัตถุประสงค์เพื่อ{aim}'),
      p2:I('I ask for approval to run the project as set out in the enclosed plan, with a total budget of {amt} baht.', 'ในการนี้ จึงขออนุมัติดำเนินโครงการดังกล่าว ตามรายละเอียดโครงการที่แนบมาพร้อมนี้ โดยใช้งบประมาณทั้งสิ้น {amt} บาท'),
      p3:I('', ''),
      close:I('For your consideration and approval.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ'), att:I('', '') },
    { id:'m_budget', g:'memo', fmt:'memo', t:I('Ask approval for a cost', 'ขออนุมัติค่าใช้จ่าย'), d:I('server, data, prizes or publicity', 'เซิร์ฟเวอร์ ข้อมูล ของรางวัล หรือโฆษณา'),
      sl:[S('item', I('Cost of', 'ค่าใช้จ่าย'), P([['server and domain fees', 'ค่าบริการเซิร์ฟเวอร์และโดเมน'], ['market data fees', 'ค่าบริการข้อมูลตลาด'], ['equipment for an event', 'ค่าอุปกรณ์สำหรับจัดกิจกรรม'], ['prizes for a contest', 'ค่าของรางวัลการแข่งขัน'], ['online advertising', 'ค่าโฆษณาประชาสัมพันธ์ออนไลน์']])),
           S('why', I('So that', 'เพื่อ'), P([['the website keeps running without a break', 'ให้เว็บไซต์ให้บริการได้อย่างต่อเนื่อง'], ['the event can go ahead', 'ใช้ในการจัดกิจกรรม'], ['more learners can find the website', 'ประชาสัมพันธ์ให้เข้าถึงผู้เรียนมากขึ้น']])), S('amt', I('Amount (baht)', 'จำนวนเงิน (บาท)'), [], { ph:I('e.g. 1,200', 'เช่น 1,200'), dots:'............' })],
      subj:I('Approval for {item}', 'ขออนุมัติ{item}'),
      p1:I('{item} are needed so that {why}.', 'ด้วยมีความจำเป็นต้องใช้จ่ายเป็น{item} เพื่อ{why}'),
      p2:I('I ask for approval of this cost, a total of {amt} baht.', 'จึงขออนุมัติค่าใช้จ่ายดังกล่าว เป็นจำนวนเงินทั้งสิ้น {amt} บาท'),
      p3:I('The quotation or cost details are enclosed.', 'ทั้งนี้ ได้แนบใบเสนอราคาหรือรายละเอียดค่าใช้จ่ายมาพร้อมนี้'),
      close:I('For your consideration and approval.', 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ'), att:I('', '') },
    { id:'m_assign', g:'memo', fmt:'memo', t:I('Assign a task', 'มอบหมายงาน'), d:I('who does what, by when', 'ใครทำอะไร เสร็จเมื่อไร'),
      sl:[S('task', I('Task', 'งาน'), P([['checking the lessons', 'ตรวจทานเนื้อหาบทเรียน'], ['testing the website', 'ทดสอบการใช้งานเว็บไซต์'], ['making publicity materials', 'จัดทำสื่อประชาสัมพันธ์'], ['collecting the evaluation results', 'รวบรวมผลการประเมิน'], ['preparing the event', 'เตรียมการจัดกิจกรรม']])), S('who', I('Assigned to', 'มอบหมายให้'), [], { ph:I('name of the person', 'ชื่อผู้รับผิดชอบ') }), DATE('due', I('Finish by', 'ให้แล้วเสร็จภายในวันที่'))],
      subj:I('Assignment: {task}', 'มอบหมายงาน{task}'),
      p1:I('So that the work of SPACEZ TERMINAL runs smoothly,', 'เพื่อให้การดำเนินงานของ SPACEZ TERMINAL เป็นไปด้วยความเรียบร้อยและบรรลุเป้าหมาย'),
      p2:I('{who} is asked to take charge of {task}, to be finished by {due}.', 'จึงขอมอบหมายให้ {who} รับผิดชอบงาน{task} โดยให้แล้วเสร็จภายในวันที่ {due}'),
      p3:I('Please report any problem or obstacle without delay.', 'หากมีปัญหาหรืออุปสรรคในการดำเนินงาน ให้รายงานให้ทราบโดยเร็ว'),
      close:I('For your information and action.', 'จึงเรียนมาเพื่อโปรดทราบและดำเนินการ'), att:I('', '') },
    { id:'m_meet', g:'memo', fmt:'memo', t:I('Team meeting notice', 'แจ้งนัดประชุมทีมงาน'), d:I('internal meeting — topic, date, time, place', 'ประชุมภายใน — เรื่อง วัน เวลา สถานที่'),
      sl:[S('topic', I('Meeting on', 'ประชุมเรื่อง'), P([['progress of the website development', 'ติดตามความคืบหน้าการพัฒนาเว็บไซต์'], ['the content plan for next quarter', 'วางแผนเนื้อหาประจำไตรมาส'], ['the results of the expert reviews', 'สรุปผลการประเมินจากผู้ทรงคุณวุฒิ'], ['preparing the next event', 'เตรียมการจัดกิจกรรมครั้งต่อไป']])), DATE(), TIME(), PLACE()],
      subj:I('Team meeting', 'แจ้งนัดประชุมทีมงาน'),
      p1:I('A team meeting on {topic} will be held on {date}, {time}, {place}.', 'ด้วยจะมีการประชุมทีมงานเรื่อง{topic} ในวันที่ {date} เวลา {time} ณ {place}'),
      p2:I('Everyone concerned is asked to attend and to bring an update on the work they are responsible for.', 'จึงขอเชิญผู้เกี่ยวข้องเข้าร่วมประชุมตามวัน เวลา และสถานที่ดังกล่าว พร้อมเตรียมข้อมูลความคืบหน้าของงานที่รับผิดชอบ'),
      p3:I('', ''),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    { id:'m_incident', g:'memo', fmt:'memo', t:I('Incident report', 'รายงานเหตุขัดข้องของระบบ'), d:I('what broke, why, and how it was fixed', 'อะไรขัดข้อง สาเหตุ และการแก้ไข'),
      sl:[DATE(), S('sys', I('What was affected', 'ส่วนที่ใช้งานไม่ได้'), O.sys), S('dur', I('For how long', 'นานประมาณ'), P([['30 minutes', '30 นาที'], ['one hour', '1 ชั่วโมง'], ['three hours', '3 ชั่วโมง']]), { def:-1 }),
           S('cause', I('Cause', 'สาเหตุ'), P([['an outside data provider failed', 'ผู้ให้บริการข้อมูลภายนอกขัดข้อง'], ['a system update', 'การปรับปรุงระบบ'], ['unusually high traffic', 'ปริมาณผู้ใช้งานสูงผิดปกติ'], ['an error in the code', 'ข้อผิดพลาดในโปรแกรม']])),
           S('prev', I('To prevent it', 'แนวทางป้องกัน'), P([['add automatic checks before each update', 'เพิ่มการตรวจสอบอัตโนมัติก่อนปรับปรุงระบบทุกครั้ง'], ['add a backup data source', 'เพิ่มแหล่งข้อมูลสำรอง'], ['send an alert as soon as a problem starts', 'ตั้งระบบแจ้งเตือนทันทีเมื่อเกิดปัญหา']]))],
      subj:I('Incident report', 'รายงานเหตุขัดข้องของระบบและการแก้ไข'),
      p1:I('On {date}, {sys} could not be used for about {dur}.', 'เมื่อวันที่ {date} เกิดเหตุขัดข้อง ทำให้{sys}ไม่สามารถใช้งานได้ เป็นเวลาประมาณ {dur}'),
      p2:I('The cause was that {cause}. It has been fixed and the system now works normally.', 'จากการตรวจสอบพบว่าสาเหตุเกิดจาก{cause} ได้ดำเนินการแก้ไขเรียบร้อยแล้ว ขณะนี้ระบบใช้งานได้ตามปกติ'),
      p3:I('To prevent it happening again, we will {prev}.', 'เพื่อป้องกันไม่ให้เกิดเหตุซ้ำ จะดำเนินการ{prev}'),
      close:I('For your information.', 'จึงเรียนมาเพื่อโปรดทราบ'), att:I('', '') },
    /* ===== หนังสือรับรอง (certificate letter) ===== */
    { id:'certify', g:'cert', fmt:'cert', t:I('Certificate of work', 'หนังสือรับรองการปฏิบัติงาน'), d:I('certify that someone reviewed, taught or helped', 'รับรองว่าบุคคลนี้ได้ประเมิน สอน หรือช่วยงาน'),
      sl:[NAME(), S('role', I('Served as', 'ปฏิบัติหน้าที่เป็น'), P([['an expert reviewer of the content', 'ผู้ทรงคุณวุฒิตรวจสอบเนื้อหา'], ['an evaluator of the website', 'ผู้ประเมินคุณภาพเว็บไซต์'], ['a volunteer', 'อาสาสมัครช่วยงาน'], ['a content assistant', 'ผู้ช่วยพัฒนาเนื้อหา']])), DATE('from', I('From', 'ตั้งแต่วันที่')), DATE('to', I('To', 'ถึงวันที่')),
           S('duty', I('Duties', 'หน้าที่'), P([['checking lessons', 'ตรวจทานบทเรียน'], ['testing the website', 'ทดสอบการใช้งานเว็บไซต์'], ['giving academic advice', 'ให้คำแนะนำทางวิชาการ'], ['helping at events', 'ช่วยงานการจัดกิจกรรม']]), { m:1, def:[0, 2] })],
      subj:I('Certificate', 'หนังสือรับรองการปฏิบัติงาน'),
      p1:I('This is to certify that {name} served as {role} for SPACEZ TERMINAL from {from} to {to}.', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า {name} ได้ปฏิบัติหน้าที่เป็น{role}ให้แก่ SPACEZ TERMINAL ตั้งแต่วันที่ {from} ถึงวันที่ {to}'),
      p2:I('The work included {duty}, and was carried out with care and responsibility.', 'โดยมีหน้าที่{duty} และได้ปฏิบัติงานด้วยความตั้งใจ มีความรับผิดชอบ และเป็นประโยชน์ต่อการพัฒนาอย่างยิ่ง'),
      p3:I('', ''),
      close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    { id:'c_review', g:'cert', fmt:'cert', t:I('Certificate for an expert reviewer', 'รับรองการเป็นผู้ทรงคุณวุฒิ'), d:I('for a lecturer who reviewed the work', 'สำหรับอาจารย์ / ผู้เชี่ยวชาญที่ช่วยตรวจผลงาน'),
      sl:[NAME('name', I('Expert’s name', 'ชื่อผู้ทรงคุณวุฒิ')), S('field', I('Field', 'ด้าน'), P([['in economics and finance', 'ด้านเศรษฐศาสตร์และการเงิน'], ['in learning design', 'ด้านการออกแบบสื่อการเรียนรู้'], ['in information technology', 'ด้านเทคโนโลยีสารสนเทศ'], ['in statistics and research', 'ด้านสถิติและการวิจัย']])),
           S('work', I('Work reviewed', 'ผลงานที่ตรวจ'), P([['the SPACEZ TERMINAL website', 'เว็บไซต์ SPACEZ TERMINAL'], ['the Market Brain system', 'ระบบสมองตลาด (Market Brain)'], ['the beginner lessons', 'บทเรียนสำหรับผู้เริ่มต้น'], ['the IC exam practice', 'แบบฝึกหัดเตรียมสอบ IC']])), DATE()],
      subj:I('Certificate', 'หนังสือรับรองการเป็นผู้ทรงคุณวุฒิ'),
      p1:I('This is to certify that {name} kindly served as an expert reviewer {field}, checking and evaluating {work} on {date}.', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า {name} ได้ให้ความอนุเคราะห์เป็นผู้ทรงคุณวุฒิ{field} ในการตรวจสอบและประเมินคุณภาพ{work} เมื่อวันที่ {date}'),
      p2:I('The suggestions given were used to make the work more accurate and of higher quality.', 'ข้อเสนอแนะของท่านได้นำไปใช้ในการปรับปรุงผลงานให้มีความถูกต้องและมีคุณภาพยิ่งขึ้น'),
      p3:I('', ''),
      close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    { id:'c_learn', g:'cert', fmt:'cert', t:I('Certificate of course completion', 'รับรองการผ่านการเรียน'), d:I('for a learner who finished a course', 'สำหรับผู้เรียนที่เรียนจบหลักสูตร'),
      sl:[NAME('name', I('Learner’s name', 'ชื่อผู้เรียน')), S('course', I('Course', 'หลักสูตร'), O.learn), S('hours', I('Hours', 'ชั่วโมงเรียน'), P([['6', '6'], ['12', '12'], ['20', '20'], ['30', '30']]), { def:-1, dots:'......' }), DATE('from', I('From', 'ตั้งแต่วันที่')), DATE('to', I('To', 'ถึงวันที่')),
           S('grade', I('Result', 'ผลการเรียน'), P([['excellent', 'ดีมาก'], ['good', 'ดี'], ['pass', 'ผ่านเกณฑ์']]))],
      subj:I('Certificate of completion', 'หนังสือรับรองการผ่านการเรียน'),
      p1:I('This is to certify that {name} completed and passed the tests of {course} of SPACEZ TERMINAL, a total of {hours} hours of study,', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า {name} ได้เข้าเรียนและผ่านการทดสอบ{course}ของ SPACEZ TERMINAL รวมเวลาเรียน {hours} ชั่วโมง'),
      p2:I('from {from} to {to}, with a result of “{grade}”.', 'ระหว่างวันที่ {from} ถึงวันที่ {to} โดยมีผลการเรียนอยู่ในระดับ{grade}'),
      p3:I('', ''),
      close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    { id:'c_speaker', g:'cert', fmt:'cert', t:I('Certificate for a speaker', 'รับรองการเป็นวิทยากร'), d:I('after a talk or workshop', 'หลังการบรรยายหรืออบรม'),
      sl:[NAME('name', I('Speaker’s name', 'ชื่อวิทยากร')), S('topic', I('Topic', 'หัวข้อ'), O.topic), S('ev', I('Event', 'กิจกรรม'), O.ev), DATE()],
      subj:I('Certificate', 'หนังสือรับรองการเป็นวิทยากร'),
      p1:I('This is to certify that {name} was invited to speak on “{topic}” at {ev} on {date}.', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า {name} ได้รับเชิญเป็นวิทยากรบรรยายหัวข้อ “{topic}” ในกิจกรรม{ev} เมื่อวันที่ {date}'),
      p2:I('The talk was of great benefit to the participants and was very well received.', 'การบรรยายของท่านเป็นประโยชน์อย่างยิ่งต่อผู้เข้าร่วม และได้รับความสนใจเป็นอย่างดี'),
      p3:I('', ''),
      close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    { id:'c_intern', g:'cert', fmt:'cert', t:I('Internship / volunteer certificate', 'รับรองการฝึกงาน / อาสาสมัคร'), d:I('for a student or volunteer', 'สำหรับนักศึกษาฝึกงานหรืออาสาสมัคร'),
      sl:[NAME(), S('kind', I('As', 'ในฐานะ'), P([['an intern', 'นักศึกษาฝึกงาน'], ['a volunteer', 'อาสาสมัคร']])), DATE('from', I('From', 'ตั้งแต่วันที่')), DATE('to', I('To', 'ถึงวันที่')),
           S('duty', I('Duties', 'หน้าที่'), P([['preparing lesson content', 'จัดทำเนื้อหาบทเรียน'], ['testing the website', 'ทดสอบการใช้งานเว็บไซต์'], ['making graphics', 'ออกแบบภาพประกอบ'], ['collecting market data', 'รวบรวมข้อมูลตลาด'], ['helping at events', 'ช่วยงานการจัดกิจกรรม']]), { m:1, def:[0, 1] })],
      subj:I('Certificate', 'หนังสือรับรองการฝึกงาน'),
      p1:I('This is to certify that {name} worked with SPACEZ TERMINAL as {kind} from {from} to {to}.', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า {name} ได้ปฏิบัติงานกับ SPACEZ TERMINAL ในฐานะ{kind} ตั้งแต่วันที่ {from} ถึงวันที่ {to}'),
      p2:I('The duties were {duty}. The work was done diligently, punctually and with a good attitude.', 'โดยมีหน้าที่{duty} ได้ปฏิบัติงานด้วยความขยันหมั่นเพียร ตรงต่อเวลา และมีความประพฤติเรียบร้อย'),
      p3:I('', ''),
      close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    /* ===== ประกาศ (announcement) + คำสั่ง (order) ===== */
    { id:'a_launch', g:'ann', fmt:'ann', t:I('Announcement: new service', 'ประกาศ · เปิดให้บริการใหม่'), d:I('a new course, tool or section', 'คอร์ส เครื่องมือ หรือส่วนใหม่ของเว็บ'),
      sl:[S('what', I('What opens', 'สิ่งที่เปิดใหม่'), P([['the 7-chapter beginner course', 'คอร์สหุ้นสำหรับผู้เริ่มต้น 7 บท'], ['the IC licence exam room', 'ห้องฝึกทำข้อสอบใบอนุญาต IC'], ['the Market Brain analysis system', 'ระบบวิเคราะห์สมองตลาด'], ['the Elliott Wave classroom', 'ห้องเรียนคลื่นเอลเลียต']])),
           S('ben', I('Helps learners', 'ช่วยให้ผู้เรียน'), P([['learn step by step from zero', 'เรียนรู้ได้ทีละขั้นตั้งแต่ศูนย์'], ['practise with real exam-style questions', 'ฝึกทำข้อสอบเสมือนจริง'], ['read the market with data, not guesses', 'อ่านภาวะตลาดจากข้อมูลจริงแทนการคาดเดา']])), DATE('date', I('Open from', 'เปิดให้บริการตั้งแต่วันที่'))],
      subj:I('Opening of {what}', 'เปิดให้บริการ{what}'),
      p1:I('SPACEZ TERMINAL has developed {what} to help learners {ben}.', 'ด้วย SPACEZ TERMINAL ได้พัฒนา{what} เพื่อช่วยให้ผู้เรียน{ben}'),
      p2:I('It is open from {date} at ' + SITE_SHOW + ', free of charge.', 'จึงประกาศเปิดให้บริการตั้งแต่วันที่ {date} เป็นต้นไป ผู้สนใจสามารถเข้าใช้งานได้ที่ ' + SITE_SHOW + ' โดยไม่มีค่าใช้จ่าย'),
      p3:I('', ''),
      close:I('This is announced for general information.', 'จึงประกาศมาเพื่อทราบโดยทั่วกัน'), att:I('', '') },
    { id:'a_rules', g:'ann', fmt:'ann', legal:1, t:I('Announcement: rules of use', 'ประกาศ · หลักเกณฑ์การใช้งาน'), d:I('five clear rules for every user', 'กติกา 5 ข้อสำหรับผู้ใช้งานทุกคน'),
      sl:[DATE('eff', I('In force from', 'มีผลตั้งแต่วันที่'))],
      subj:I('Rules for using the SPACEZ TERMINAL website', 'หลักเกณฑ์การใช้งานเว็บไซต์ SPACEZ TERMINAL'),
      p1:I('So that the website is used safely, fairly and to everyone’s benefit, the following rules apply:', 'เพื่อให้การใช้งานเว็บไซต์ SPACEZ TERMINAL เป็นไปด้วยความเรียบร้อย ปลอดภัย และเป็นประโยชน์ต่อผู้ใช้งานทุกคน จึงกำหนดหลักเกณฑ์การใช้งาน ดังนี้'),
      p2:I('1. All content is for education and is not investment advice; every investment decision is the user’s own.\n2. Sign-in codes must not be shared with or used by anyone else.\n3. Content may not be copied, changed or published for commercial use without permission.\n4. Market data can be delayed or inaccurate; check official sources before relying on it.\n5. SPACEZ TERMINAL may suspend anyone who breaks these rules.',
           '1. เนื้อหาทั้งหมดจัดทำเพื่อการศึกษา มิใช่คำแนะนำการลงทุน การตัดสินใจลงทุนเป็นความรับผิดชอบของผู้ใช้งานเอง\n2. ห้ามเปิดเผยรหัสเข้าระบบ หรือให้ผู้อื่นใช้รหัสของตน\n3. ห้ามคัดลอก ดัดแปลง หรือเผยแพร่เนื้อหาเพื่อการค้าโดยไม่ได้รับอนุญาต\n4. ข้อมูลตลาดอาจล่าช้าหรือคลาดเคลื่อน โปรดตรวจสอบกับแหล่งข้อมูลทางการก่อนนำไปใช้\n5. SPACEZ TERMINAL ขอสงวนสิทธิ์ระงับการใช้งานของผู้ที่ฝ่าฝืนหลักเกณฑ์นี้'),
      p3:I('These rules take effect from {eff}.', 'ทั้งนี้ ตั้งแต่วันที่ {eff} เป็นต้นไป'),
      close:I('This is announced for everyone to know and follow.', 'จึงประกาศมาเพื่อทราบและถือปฏิบัติโดยทั่วกัน'), att:I('', '') },
    { id:'a_result', g:'ann', fmt:'ann', t:I('Announcement: contest results', 'ประกาศผลการแข่งขัน'), d:I('list of winners', 'รายชื่อผู้ได้รับรางวัล'),
      sl:[S('comp', I('Contest', 'การแข่งขัน'), O.comp), DATE()],
      subj:I('Results of {comp}', 'ผล{comp}'),
      p1:I('SPACEZ TERMINAL held {comp} on {date}. The judges have reached their decision, as follows:', 'ตามที่ SPACEZ TERMINAL ได้จัด{comp} เมื่อวันที่ {date} นั้น คณะกรรมการได้พิจารณาตัดสินเรียบร้อยแล้ว ผลปรากฏดังนี้'),
      p2:I('1. First prize: ........................\n2. Second prize: ........................\n3. Third prize: ........................\n4. Honourable mention: ........................', '1. รางวัลชนะเลิศ ได้แก่ ........................\n2. รางวัลรองชนะเลิศอันดับ 1 ได้แก่ ........................\n3. รางวัลรองชนะเลิศอันดับ 2 ได้แก่ ........................\n4. รางวัลชมเชย ได้แก่ ........................'),
      p3:I('The judges’ decision is final.', 'ทั้งนี้ ผลการตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด'),
      close:I('This is announced for general information.', 'จึงประกาศมาเพื่อทราบโดยทั่วกัน'), att:I('', '') },
    { id:'a_privacy', g:'ann', fmt:'ann', legal:1, t:I('Announcement: privacy policy', 'ประกาศ · นโยบายคุ้มครองข้อมูลส่วนบุคคล'), d:I('PDPA B.E. 2562 — what is kept and why', 'ตาม PDPA — เก็บอะไร เพื่ออะไร สิทธิ์ของผู้ใช้'),
      sl:[S('data', I('Data kept', 'ข้อมูลที่เก็บ'), P([['user name and display name', 'ชื่อผู้ใช้และชื่อที่แสดง'], ['the linked LINE or Telegram account', 'บัญชี LINE หรือ Telegram ที่เชื่อมต่อ'], ['e-mail address', 'อีเมล'], ['anonymous usage statistics', 'สถิติการใช้งานแบบไม่ระบุตัวตน']]), { m:1, def:[0, 1] }), DATE('eff', I('In force from', 'มีผลตั้งแต่วันที่'))],
      subj:I('Personal data protection policy', 'นโยบายคุ้มครองข้อมูลส่วนบุคคล'),
      p1:I('SPACEZ TERMINAL respects the protection of personal data under the Personal Data Protection Act B.E. 2562 (2019) and announces the following policy:', 'SPACEZ TERMINAL ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 จึงประกาศนโยบาย ดังนี้'),
      p2:I('1. Data kept: {data}.\n2. It is used only to provide the service, confirm who you are and improve the website.\n3. It is never sold, rented or given to others, unless the law requires.\n4. Most settings and learning progress are kept in your own browser.\n5. You may ask to see, correct or delete your data, and withdraw consent, at any time.',
           '1. ข้อมูลที่เก็บ ได้แก่ {data}\n2. ใช้เพื่อให้บริการ ยืนยันตัวตน และปรับปรุงเว็บไซต์เท่านั้น\n3. ไม่ขาย ไม่ให้เช่า และไม่เปิดเผยข้อมูลแก่บุคคลภายนอก เว้นแต่กฎหมายกำหนด\n4. การตั้งค่าและความคืบหน้าการเรียนส่วนใหญ่เก็บไว้ในเบราว์เซอร์ของผู้ใช้เอง\n5. ผู้ใช้มีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลของตน และถอนความยินยอมได้ทุกเมื่อ'),
      p3:I('Questions or requests can be sent through the contact details below. This policy takes effect from {eff}.', 'ทั้งนี้ สามารถสอบถามหรือใช้สิทธิ์ได้ทางช่องทางติดต่อท้ายประกาศนี้ โดยมีผลตั้งแต่วันที่ {eff} เป็นต้นไป'),
      close:I('This is announced for general information.', 'จึงประกาศมาเพื่อทราบโดยทั่วกัน'), att:I('', '') },
    { id:'o_team', g:'ann', fmt:'order', t:I('Order: appoint a working team', 'คำสั่ง · แต่งตั้งคณะทำงาน'), d:I('members and their duties', 'รายชื่อและหน้าที่'),
      sl:[S('team', I('Team for', 'คณะทำงาน'), P([['developing the learning content', 'พัฒนาเนื้อหาการเรียนรู้'], ['checking the quality of the website', 'ตรวจสอบคุณภาพเว็บไซต์'], ['events and publicity', 'จัดกิจกรรมและประชาสัมพันธ์']])),
           S('duty', I('Duties', 'หน้าที่'), P([['plan the work', 'วางแผนการดำเนินงาน'], ['carry out and follow up the work', 'ดำเนินงานและติดตามผล'], ['report the results to the founder', 'รายงานผลต่อผู้ก่อตั้ง'], ['other tasks as assigned', 'ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย']]), { m:1, num:2, def:[0, 1, 2] })],
      subj:I('Appointment of the team for {team}', 'แต่งตั้งคณะทำงาน{team}'),
      p1:I('So that the work of {team} at SPACEZ TERMINAL is effective, a working team is appointed as follows:', 'เพื่อให้การ{team}ของ SPACEZ TERMINAL เป็นไปอย่างมีประสิทธิภาพ จึงแต่งตั้งคณะทำงาน ประกอบด้วย'),
      p2:I('1. ........................ Chair\n2. ........................ Member\n3. ........................ Member\n4. ........................ Member and secretary', '1. ........................ ประธานคณะทำงาน\n2. ........................ คณะทำงาน\n3. ........................ คณะทำงาน\n4. ........................ คณะทำงานและเลขานุการ'),
      p3:I('The team’s duties are to {duty}.', 'ให้คณะทำงานมีหน้าที่ {duty}'),
      close:I('This takes effect from today.', 'ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป'), att:I('', '') },
    { id:'o_review', g:'ann', fmt:'order', t:I('Order: appoint an evaluation committee', 'คำสั่ง · แต่งตั้งคณะกรรมการประเมิน'), d:I('to evaluate the website or the Market Brain', 'ประเมินเว็บไซต์ หรือสมองตลาด'),
      sl:[S('what', I('To evaluate', 'ประเมิน'), P([['the SPACEZ TERMINAL website', 'เว็บไซต์ SPACEZ TERMINAL'], ['the Market Brain system', 'ระบบสมองตลาด (Market Brain)'], ['the lessons and tests', 'บทเรียนและแบบทดสอบ']])), DATE('due', I('Report by', 'รายงานผลภายในวันที่'))],
      subj:I('Appointment of the committee to evaluate {what}', 'แต่งตั้งคณะกรรมการประเมินคุณภาพ{what}'),
      p1:I('So that {what} is evaluated correctly, transparently and to academic standards, a committee is appointed as follows:', 'เพื่อให้การประเมินคุณภาพ{what} เป็นไปอย่างถูกต้อง โปร่งใส และเป็นไปตามหลักวิชาการ จึงแต่งตั้งคณะกรรมการ ประกอบด้วย'),
      p2:I('1. ........................ Chair\n2. ........................ Member\n3. ........................ Member\n4. ........................ Member and secretary', '1. ........................ ประธานกรรมการ\n2. ........................ กรรมการ\n3. ........................ กรรมการ\n4. ........................ กรรมการและเลขานุการ'),
      p3:I('The committee will check, evaluate and advise, and report to the founder by {due}.', 'ให้คณะกรรมการมีหน้าที่ตรวจสอบ ประเมิน และให้ข้อเสนอแนะ แล้วรายงานผลต่อผู้ก่อตั้งภายในวันที่ {due}'),
      close:I('This takes effect from today.', 'ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป'), att:I('', '') },
    { id:'o_assign', g:'ann', fmt:'order', t:I('Order: name a person in charge', 'คำสั่ง · มอบหมายผู้รับผิดชอบ'), d:I('one person for one area of work', 'ผู้รับผิดชอบงานแต่ละด้าน'),
      sl:[S('area', I('Area', 'งาน'), P([['the lesson content', 'ดูแลเนื้อหาบทเรียน'], ['the system and its security', 'ดูแลระบบและความปลอดภัย'], ['publicity and social media', 'ประชาสัมพันธ์และสื่อสังคมออนไลน์'], ['contact with expert reviewers', 'ประสานงานผู้ทรงคุณวุฒิ']])), S('who', I('Person', 'ผู้รับผิดชอบ'), [], { ph:I('name', 'ชื่อ–นามสกุล') }), S('wpos', I('Position', 'ตำแหน่ง'), [], { ph:I('e.g. content coordinator', 'เช่น ผู้ประสานงานเนื้อหา') })],
      subj:I('Person in charge of {area}', 'มอบหมายผู้รับผิดชอบงาน{area}'),
      p1:I('So that the work on {area} continues smoothly with a clear owner,', 'เพื่อให้งาน{area}ของ SPACEZ TERMINAL ดำเนินไปอย่างต่อเนื่องและมีผู้รับผิดชอบชัดเจน'),
      p2:I('{who}, {wpos}, is put in charge of {area}.', 'จึงมอบหมายให้ {who} ตำแหน่ง {wpos} เป็นผู้รับผิดชอบงาน{area}'),
      p3:I('The person in charge will report the results to the founder every month.', 'ให้ผู้ได้รับมอบหมายรายงานผลการดำเนินงานต่อผู้ก่อตั้งเป็นประจำทุกเดือน'),
      close:I('This takes effect from today.', 'ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป'), att:I('', '') },
    /* ===== บันทึกข้อตกลง (MOU / NDA) — two parties + two witnesses ===== */
    { id:'mou_edu', g:'mou', fmt:'mou', legal:1, t:I('Academic cooperation MOU', 'บันทึกข้อตกลงความร่วมมือทางวิชาการ'), d:I('with a school or university — 7 clauses, 4 signatures', 'กับโรงเรียน / มหาวิทยาลัย — 7 ข้อ ลงนาม 4 ช่อง'),
      sl:[ORGB, SIGNB, POSB, DATE('date', I('Signed on', 'ทำขึ้นเมื่อวันที่')), S('where', I('Signed at', 'ทำขึ้น ณ'), [], { ph:I('e.g. Example School', 'เช่น โรงเรียนตัวอย่างวิทยา') }),
           S('aim', I('Aim', 'วัตถุประสงค์'), O.aim),
           S('areas', I('Scope', 'ขอบเขตความร่วมมือ'), P([['training for students and staff', 'การจัดอบรมให้ความรู้แก่นักเรียนและบุคลากร'], ['using the website as a teaching resource', 'การใช้เว็บไซต์เป็นสื่อประกอบการเรียนการสอน'], ['developing lessons together', 'การพัฒนาเนื้อหาและบทเรียนร่วมกัน'], ['sharing data and experts', 'การแลกเปลี่ยนข้อมูลและผู้เชี่ยวชาญ'], ['a trading-simulation contest', 'การจัดการแข่งขันจำลองการลงทุน'], ['joint research', 'การวิจัยร่วม']]), { m:1, num:2, def:[0, 1, 2] }),
           S('term', I('Lasts', 'ระยะเวลา'), O.term)],
      subj:I('Memorandum of understanding on academic cooperation', 'บันทึกข้อตกลงความร่วมมือทางวิชาการ'),
      p1:I('This memorandum is made on {date} at {where}, between SPACEZ TERMINAL, represented by {A}, {Apos}, hereinafter “Party One”, and {orgB}, represented by {signB}, {posB}, hereinafter “Party Two”. The parties agree as follows:',
           'บันทึกข้อตกลงฉบับนี้ทำขึ้นเมื่อวันที่ {date} ณ {where} ระหว่าง SPACEZ TERMINAL โดย {A} ตำแหน่ง {Apos} ซึ่งต่อไปในบันทึกนี้เรียกว่า “ฝ่ายที่หนึ่ง” ฝ่ายหนึ่ง กับ {orgB} โดย {signB} ตำแหน่ง {posB} ซึ่งต่อไปในบันทึกนี้เรียกว่า “ฝ่ายที่สอง” อีกฝ่ายหนึ่ง ทั้งสองฝ่ายตกลงร่วมมือกัน ดังนี้'),
      p2:I('Clause 1 Purpose. The parties will work together to {aim}.\nClause 2 Scope. The cooperation covers {areas}.\nClause 3 Party One will provide the content, learning materials and speakers as agreed.\nClause 4 Party Two will provide the venue, the participants and publicity within its organisation.\nClause 5 This memorandum creates no financial obligation between the parties unless agreed in writing case by case.\nClause 6 Both parties will protect any personal data received under the Personal Data Protection Act B.E. 2562 (2019).\nClause 7 This memorandum lasts {term} from the date of signing. It may be changed or ended by written agreement of both parties, or by either party with 30 days’ written notice.',
           'ข้อ 1 วัตถุประสงค์ ทั้งสองฝ่ายตกลงร่วมมือกันเพื่อ{aim}\nข้อ 2 ขอบเขตความร่วมมือ ได้แก่ {areas}\nข้อ 3 ฝ่ายที่หนึ่งจะจัดเตรียมเนื้อหา สื่อการเรียนรู้ และวิทยากร ตามที่ตกลงร่วมกัน\nข้อ 4 ฝ่ายที่สองจะอำนวยความสะดวกด้านสถานที่ ผู้เข้าร่วม และการประชาสัมพันธ์ภายในหน่วยงาน\nข้อ 5 บันทึกข้อตกลงนี้ไม่ก่อให้เกิดภาระผูกพันทางการเงินระหว่างกัน เว้นแต่จะได้ตกลงกันเป็นลายลักษณ์อักษรเป็นคราว ๆ ไป\nข้อ 6 ทั้งสองฝ่ายจะเก็บรักษาข้อมูลส่วนบุคคลที่ได้รับจากการดำเนินงานตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562\nข้อ 7 บันทึกข้อตกลงนี้มีผลใช้บังคับเป็นระยะเวลา {term} นับแต่วันที่ลงนาม และอาจแก้ไขหรือยกเลิกได้โดยความยินยอมเป็นลายลักษณ์อักษรของทั้งสองฝ่าย หรือฝ่ายใดฝ่ายหนึ่งแจ้งเป็นหนังสือล่วงหน้าไม่น้อยกว่า 30 วัน'),
      p3:I('This memorandum is made in two identical copies. Both parties have read and understood it in full and sign below in the presence of witnesses, each keeping one copy.',
           'บันทึกข้อตกลงนี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน ทั้งสองฝ่ายได้อ่านและเข้าใจข้อความโดยละเอียดตลอดแล้ว จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน และต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ'),
      close:I('', ''), att:I('', '') },
    { id:'mou_partner', g:'mou', fmt:'mou', legal:1, t:I('Partnership MOU', 'บันทึกข้อตกลงความร่วมมือ (องค์กร / บริษัท)'), d:I('with a company, club or organisation', 'กับบริษัท ชมรม หรือองค์กร'),
      sl:[ORGB, SIGNB, POSB, DATE('date', I('Signed on', 'ทำขึ้นเมื่อวันที่')), S('where', I('Signed at', 'ทำขึ้น ณ'), [], { ph:I('e.g. online', 'เช่น ทางออนไลน์') }),
           S('area', I('Cooperation in', 'ร่วมมือในด้าน'), P([['promoting financial and investment literacy', 'การส่งเสริมความรู้ทางการเงินและการลงทุน'], ['developing online learning materials', 'การพัฒนาสื่อการเรียนรู้ออนไลน์'], ['joint events and publicity', 'การจัดกิจกรรมและประชาสัมพันธ์ร่วมกัน'], ['research and development of analysis tools', 'การวิจัยและพัฒนาเครื่องมือวิเคราะห์']])),
           S('term', I('Lasts', 'ระยะเวลา'), O.term)],
      subj:I('Memorandum of understanding on cooperation', 'บันทึกข้อตกลงความร่วมมือ'),
      p1:I('This memorandum is made on {date} at {where}, between SPACEZ TERMINAL, represented by {A}, {Apos}, hereinafter “Party One”, and {orgB}, represented by {signB}, {posB}, hereinafter “Party Two”. The parties agree as follows:',
           'บันทึกข้อตกลงฉบับนี้ทำขึ้นเมื่อวันที่ {date} ณ {where} ระหว่าง SPACEZ TERMINAL โดย {A} ตำแหน่ง {Apos} ซึ่งต่อไปในบันทึกนี้เรียกว่า “ฝ่ายที่หนึ่ง” ฝ่ายหนึ่ง กับ {orgB} โดย {signB} ตำแหน่ง {posB} ซึ่งต่อไปในบันทึกนี้เรียกว่า “ฝ่ายที่สอง” อีกฝ่ายหนึ่ง ทั้งสองฝ่ายตกลงร่วมมือกัน ดังนี้'),
      p2:I('Clause 1 The parties will cooperate in {area}, with details agreed project by project.\nClause 2 Each party keeps the rights to its own name, logo and work; using them needs the other party’s consent.\nClause 3 Neither party may act or make commitments in the other’s name.\nClause 4 Costs are borne by each party itself unless agreed otherwise in writing.\nClause 5 Information received from the other party will be kept confidential and used only for this cooperation.\nClause 6 This memorandum lasts {term} from the date of signing and may be ended by either party with 30 days’ written notice.',
           'ข้อ 1 ทั้งสองฝ่ายตกลงร่วมมือกันในด้าน{area} โดยรายละเอียดของแต่ละโครงการจะตกลงร่วมกันเป็นคราว ๆ ไป\nข้อ 2 แต่ละฝ่ายยังคงเป็นเจ้าของสิทธิ์ในชื่อ ตราสัญลักษณ์ และผลงานของตน การนำไปใช้ต้องได้รับความยินยอมจากอีกฝ่าย\nข้อ 3 ฝ่ายใดฝ่ายหนึ่งจะไม่กระทำการหรือก่อภาระผูกพันใด ๆ ในนามของอีกฝ่าย\nข้อ 4 ค่าใช้จ่ายของแต่ละฝ่ายเป็นความรับผิดชอบของฝ่ายนั้นเอง เว้นแต่จะตกลงกันเป็นลายลักษณ์อักษร\nข้อ 5 ข้อมูลที่ได้รับจากอีกฝ่ายจะเก็บรักษาเป็นความลับ และใช้เพื่อความร่วมมือนี้เท่านั้น\nข้อ 6 บันทึกข้อตกลงนี้มีผลใช้บังคับเป็นระยะเวลา {term} นับแต่วันที่ลงนาม และฝ่ายใดฝ่ายหนึ่งอาจบอกเลิกได้โดยแจ้งเป็นหนังสือล่วงหน้าไม่น้อยกว่า 30 วัน'),
      p3:I('This memorandum is made in two identical copies. Both parties have read and understood it in full and sign below in the presence of witnesses, each keeping one copy.',
           'บันทึกข้อตกลงนี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน ทั้งสองฝ่ายได้อ่านและเข้าใจข้อความโดยละเอียดตลอดแล้ว จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน และต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ'),
      close:I('', ''), att:I('', '') },
    { id:'nda', g:'mou', fmt:'mou', legal:1, t:I('Confidentiality agreement (NDA)', 'บันทึกข้อตกลงการรักษาความลับ (NDA)'), d:I('for a reviewer who gets the sign-in code or the Brain', 'สำหรับผู้ประเมินที่ได้รับรหัสหรือเข้าดูสมองตลาด'),
      sl:[S('orgB', I('Person receiving the information', 'ผู้รับข้อมูล (บุคคลหรือหน่วยงาน)'), [], { ph:I('e.g. Asst. Prof. Dr. …', 'เช่น ผศ.ดร. …') }), S('signB', I('Signs as', 'ผู้ลงนามฝ่ายผู้รับข้อมูล'), [], { ph:I('usually the same person', 'ปกติเป็นบุคคลเดียวกัน') }), POSB, DATE('date', I('Signed on', 'ทำขึ้นเมื่อวันที่')), S('where', I('Signed at', 'ทำขึ้น ณ'), [], { ph:I('e.g. online', 'เช่น ทางออนไลน์') }),
           S('info', I('Confidential information', 'ข้อมูลที่เป็นความลับ'), P([['the sign-in codes', 'รหัสเข้าระบบ'], ['the formulas and methods of the Market Brain', 'สูตรและวิธีคำนวณของระบบสมองตลาด'], ['user data', 'ข้อมูลผู้ใช้งาน'], ['unpublished content', 'เนื้อหาที่ยังไม่เผยแพร่']]), { m:1, def:[0, 1] }),
           S('purp', I('May be used only for', 'ใช้เพื่อ'), P([['evaluating the work', 'การประเมินผลงาน'], ['academic review', 'การตรวจสอบทางวิชาการ'], ['the agreed joint work', 'การดำเนินงานร่วมกันตามที่ตกลง']])),
           S('term', I('Lasts', 'ระยะเวลา'), P([['for one year', 'เป็นระยะเวลา 1 ปี'], ['for two years', 'เป็นระยะเวลา 2 ปี'], ['until the information becomes public', 'จนกว่าข้อมูลดังกล่าวจะเปิดเผยต่อสาธารณะ']]))],
      subj:I('Confidentiality agreement', 'บันทึกข้อตกลงการรักษาความลับ'),
      p1:I('This agreement is made on {date} at {where}, between SPACEZ TERMINAL, represented by {A}, {Apos}, hereinafter “Party One”, and {orgB}, represented by {signB}, {posB}, hereinafter “the Recipient”. The parties agree as follows:',
           'บันทึกข้อตกลงฉบับนี้ทำขึ้นเมื่อวันที่ {date} ณ {where} ระหว่าง SPACEZ TERMINAL โดย {A} ตำแหน่ง {Apos} ซึ่งต่อไปในบันทึกนี้เรียกว่า “ฝ่ายที่หนึ่ง” กับ {orgB} โดย {signB} ตำแหน่ง {posB} ซึ่งต่อไปในบันทึกนี้เรียกว่า “ผู้รับข้อมูล” ทั้งสองฝ่ายตกลงกัน ดังนี้'),
      p2:I('Clause 1 “Confidential information” means {info}, and any other information Party One discloses to the Recipient for the work.\nClause 2 The Recipient will use it only for {purp}.\nClause 3 The Recipient will not disclose, copy or pass it on to anyone without Party One’s written consent.\nClause 4 This agreement does not cover information that is already public or must be disclosed by law.\nClause 5 When the work ends, the Recipient will return or destroy the information, and the sign-in codes will be changed.\nClause 6 This agreement lasts {term} from the date of signing.',
           'ข้อ 1 “ข้อมูลที่เป็นความลับ” หมายถึง {info} และข้อมูลอื่นใดที่ฝ่ายที่หนึ่งเปิดเผยแก่ผู้รับข้อมูลเพื่อการดำเนินงาน\nข้อ 2 ผู้รับข้อมูลจะใช้ข้อมูลที่เป็นความลับเพื่อ{purp}เท่านั้น\nข้อ 3 ผู้รับข้อมูลจะไม่เปิดเผย ทำสำเนา หรือส่งต่อข้อมูลที่เป็นความลับแก่บุคคลอื่น โดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากฝ่ายที่หนึ่ง\nข้อ 4 ข้อตกลงนี้ไม่ใช้บังคับกับข้อมูลที่เปิดเผยต่อสาธารณะอยู่แล้ว หรือที่ต้องเปิดเผยตามกฎหมาย\nข้อ 5 เมื่อสิ้นสุดการดำเนินงาน ผู้รับข้อมูลจะส่งคืนหรือทำลายข้อมูลที่เป็นความลับ และฝ่ายที่หนึ่งจะเปลี่ยนรหัสเข้าระบบใหม่\nข้อ 6 ข้อตกลงนี้มีผลใช้บังคับ{term} นับแต่วันที่ลงนาม'),
      p3:I('This agreement is made in two identical copies. Both parties have read and understood it in full and sign below in the presence of witnesses, each keeping one copy.',
           'บันทึกข้อตกลงนี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน ทั้งสองฝ่ายได้อ่านและเข้าใจข้อความโดยละเอียดตลอดแล้ว จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน และต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ'),
      close:I('', ''), att:I('', '') },
    /* ===== write my own (one blank per layout) ===== */
    { id:'blank', g:'own', t:I('Blank letter', 'หนังสือภายนอก (เปล่า)'), d:I('empty letter with the formal layout', 'หนังสือเปล่าตามรูปแบบทางการ'),
      subj:I('', ''), p1:I('', 'ด้วย '), p2:I('', 'ในการนี้ '), p3:I('', ''), close:I('', 'จึงเรียนมาเพื่อโปรดพิจารณา'), att:I('', '') },
    { id:'blank_memo', g:'own', fmt:'memo', t:I('Blank memo', 'บันทึกข้อความ (เปล่า)'), d:I('internal memo layout', 'รูปแบบหนังสือภายใน'),
      subj:I('', ''), p1:I('', 'ด้วย '), p2:I('', 'ในการนี้ '), p3:I('', ''), close:I('', 'จึงเรียนมาเพื่อโปรดพิจารณา'), att:I('', '') },
    { id:'blank_cert', g:'own', fmt:'cert', t:I('Blank certificate letter', 'หนังสือรับรอง (เปล่า)'), d:I('“This is to certify that …”', '“หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า …”'),
      subj:I('Certificate', 'หนังสือรับรอง'), p1:I('This is to certify that ', 'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า '), p2:I('', ''), p3:I('', ''), close:I('Issued for use as evidence as appropriate.', 'ให้ไว้เพื่อใช้เป็นหลักฐานตามความเหมาะสม'), att:I('', '') },
    { id:'blank_ann', g:'own', fmt:'ann', t:I('Blank announcement', 'ประกาศ (เปล่า)'), d:I('“Announcement of SPACEZ TERMINAL”', '“ประกาศ SPACEZ TERMINAL เรื่อง …”'),
      subj:I('', ''), p1:I('', ''), p2:I('', ''), p3:I('', ''), close:I('This is announced for general information.', 'จึงประกาศมาเพื่อทราบโดยทั่วกัน'), att:I('', '') },
    { id:'blank_order', g:'own', fmt:'order', t:I('Blank order', 'คำสั่ง (เปล่า)'), d:I('“Order of SPACEZ TERMINAL”', '“คำสั่ง SPACEZ TERMINAL เรื่อง …”'),
      subj:I('', ''), p1:I('', ''), p2:I('', ''), p3:I('', ''), close:I('This takes effect from today.', 'ทั้งนี้ ตั้งแต่บัดนี้เป็นต้นไป'), att:I('', '') }
  ];
  var TPL_G = [['ask', I('Requests', 'ขอความอนุเคราะห์')], ['invite', I('Invitations', 'เชิญ')], ['work', I('Working together', 'ความร่วมมือ / ตอบกลับ')], ['notice', I('Notices & thanks', 'แจ้ง / ขอบคุณ')],
    ['memo', I('Internal memo', 'บันทึกข้อความ')], ['cert', I('Certificates', 'หนังสือรับรอง')], ['ann', I('Announcements & orders', 'ประกาศ · คำสั่ง')], ['mou', I('MOU & agreements', 'MOU · ข้อตกลง')], ['own', I('Write my own', 'เขียนเอง')]];
  function tplOf(id){ for(var i = 0; i < TPL.length; i++) if(TPL[i].id === id) return TPL[i]; return TPL[0]; }
  function fmtOf(t){ return (t || tplOf(D.tpl)).fmt || 'letter'; }

  /* ---------- state: texts are kept per language so EN / TH can differ ---------- */
  var DOTS = '........................';
  var FIELDS = ['subj', 'att', 'p1', 'p2', 'p3', 'close'];
  function blank(){ return { tpl:'eval', look:'classic', toTitle:1, toName:'', toPos:'', toOrg:'', dept:'', from:'', fromPos:'', contact:'', qr:1, urgent:0, seal:0, grp:'', date:'', guide:0, acc:0, accUser:'', sigStory:0, sv:{}, ed:{ en:{}, th:{} }, tx:{ en:null, th:null } }; }
  var D = blank();
  try { var sv = JSON.parse(localStorage.getItem(LS) || 'null'); if(sv && typeof sv === 'object') Object.keys(sv).forEach(function(k){ if(k in D) D[k] = sv[k]; }); } catch(e){}
  if(!D.tx || typeof D.tx !== 'object') D.tx = { en:null, th:null };
  if(!D.sv || typeof D.sv !== 'object' || Array.isArray(D.sv)) D.sv = {};
  if(!D.ed || typeof D.ed !== 'object') D.ed = {};
  ['en', 'th'].forEach(function(l){ if(!D.ed[l] || typeof D.ed[l] !== 'object') D.ed[l] = {}; });
  function save(){ try { localStorage.setItem(LS, JSON.stringify(D)); } catch(e){} }
  function fromName(l){ return String(D.from || '').trim() || TX.defFrom[l || L()]; }
  function fromPos(l){ return String(D.fromPos || '').trim() || TX.defPos[l || L()]; }

  /* ---------- slots (2026-11-23): {key} in a template text = a blank with example choices ---------- */
  function slotOf(t, k){ var a = t.sl || []; for(var i = 0; i < a.length; i++) if(a[i].k === k) return a[i]; return null; }
  function svKey(t, k){ return t.id + ':' + k; }
  function svGet(t, k){ var key = svKey(t, k), v = D.sv[key]; if(!v || typeof v !== 'object') v = D.sv[key] = {}; return v; }
  function selOf(t, s){
    var v = D.sv[svKey(t, s.k)] || {};
    if(s.m) return (Array.isArray(v.m) ? v.m : (Array.isArray(s.def) ? s.def : [])).filter(function(i){ return s.o[i]; }).sort(function(a, b){ return a - b; });
    var i = v.i != null ? v.i : (s.def != null ? s.def : 0);
    return s.o[i] ? [i] : [];
  }
  function joinL(arr, l, num){
    if(num) return arr.map(function(x, i){ return (num === 2 ? '(' + (i + 1) + ') ' : (i + 1) + ') ') + x; }).join(l === 'th' ? ' ' : (num === 2 ? ', ' : '; '));
    if(arr.length < 2) return arr[0] || '';
    return l === 'th' ? arr.slice(0, -1).join(' ') + ' และ' + arr[arr.length - 1] : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  }
  function slotVal(t, k, l){
    if(k === 'A') return fromName(l);
    if(k === 'Apos') return fromPos(l);
    var s = slotOf(t, k); if(!s) return null;
    var v = D.sv[svKey(t, k)] || {}, own = v.o && v.o[l] ? String(v.o[l]).trim() : '', dots = s.dots || DOTS;
    var arr = selOf(t, s).map(function(i){ return s.o[i][l]; });
    if(s.m){ if(own) arr.push(own); return arr.length ? joinL(arr, l, s.num) : dots; }
    return own || arr[0] || dots;
  }
  function resolve(src, t, l){ return String(src || '').replace(/\{(\w+)\}/g, function(m, k){ var v = slotVal(t, k, l); return v == null ? m : v; }); }
  /* change one slot: texts not edited by hand are rebuilt from the template; hand-edited ones swap the old words for the new */
  var slMiss = false;
  function slotSet(t, k, mut){
    var old = { en:slotVal(t, k, 'en'), th:slotVal(t, k, 'th') }, miss = false;
    mut();
    ['en', 'th'].forEach(function(l){
      var x = D.tx[l]; if(!x) return;
      var nw = slotVal(t, k, l); if(nw === old[l]) return;
      FIELDS.forEach(function(f){
        var src = t[f] && t[f][l]; if(!src || src.indexOf('{' + k + '}') < 0) return;
        if(!D.ed[l][f]) x[f] = resolve(src, t, l);
        else if(old[l] && !/^[.\s]+$/.test(old[l]) && String(x[f]).indexOf(old[l]) >= 0) x[f] = String(x[f]).split(old[l]).join(nw);
        else if(l === L()) miss = true;
      });
    });
    slMiss = miss; save(); return miss;
  }
  function fill(l){
    var t = tplOf(D.tpl), R = function(o){ return resolve(o ? o[l] : '', t, l); };
    D.tx[l] = { subj:R(t.subj), refTo:'', att:R(t.att), p1:R(t.p1), p2:R(t.p2), p3:R(t.p3), close:R(t.close), cc:'' };
    D.ed[l] = {}; slMiss = false;
  }
  function X(){ var l = L(); if(!D.tx[l]) fill(l); return D.tx[l]; }
  function lines(s){ return String(s || '').split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean); }
  function toLine(){
    var t = TITLES[+D.toTitle] ? T(TITLES[+D.toTitle]) : '', n = String(D.toName || '').trim();
    var a = (t && n ? t + (L() === 'th' ? '' : ' ') + n : (t || n));
    if(L() === 'th' && t === 'คุณ' && n) a = 'คุณ' + n;
    return a || '........................................';
  }
  function toSub(){ return [String(D.toPos || '').trim(), String(D.toOrg || '').trim()].filter(Boolean).join(L() === 'th' ? ' ' : ', '); }
  var ACC_CODE = ''; /* sign-in code to print — memory only, never saved */
  function dateStr(){ var own = String(D.date || '').trim(); if(own) return own; var d = new Date(), l = L(); return l === 'th' ? d.getDate() + ' ' + MTH.th[d.getMonth()] + ' ' + (d.getFullYear() + 543) : d.getDate() + ' ' + MTH.en[d.getMonth()] + ' ' + d.getFullYear(); }
  /* the analyst credential (part-70 window.__SPZ_CRED) — shown under the signature only when it is ticked */
  function credHTML(){ var C = window.__SPZ_CRED; return C && C.on() ? '<div class="lt-cred">' + C.docHTML(L()) + '</div>' : ''; }

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
  function slotsHTML(t, H){
    if(!t.sl || !t.sl.length) return '';
    var l = L();
    var h = H(TX.slotL) + '<div class="pr-hint" style="margin:-2px 0 8px;">' + esc(T(TX.slotHint)) + '</div><div class="pr-lt-slots">';
    t.sl.forEach(function(s){
      var v = D.sv[svKey(t, s.k)] || {}, own = v.o && v.o[l] || '', sel = selOf(t, s);
      h += '<div class="pr-lt-slot' + (s.o.length ? '' : ' free') + '" data-slot="' + s.k + '"><div class="pr-lt-slh"><b>' + esc(T(s.l)) + '</b>' + (s.m ? '<small>' + esc(T(TX.slMulti)) + '</small>' : '') + '</div>';
      if(s.o.length) h += '<div class="pr-lt-chips">' + s.o.map(function(o, i){
        var on = sel.indexOf(i) >= 0 && (s.m || !String(own).trim());
        return '<button type="button" class="pr-lt-chip' + (s.m ? ' m' : '') + (on ? ' on' : '') + '" data-lt-sl="' + s.k + '" data-i="' + i + '">' + (s.m ? '<i></i>' : '') + '<span>' + esc(o[l]) + '</span></button>'; }).join('') + '</div>';
      h += '<input type="text" class="pr-lt-own" data-lt-sown="' + s.k + '" value="' + esc(own) + '" placeholder="' + esc(s.ph ? T(s.ph) : T(s.m ? TX.slAdd : TX.slOwn)) + '" autocomplete="off"></div>';
    });
    return h + '</div><div class="pr-lt-miss" data-lt-slmiss' + (slMiss ? '' : ' hidden') + '>' + esc(T(TX.slMiss)) + '</div>';
  }
  function formHTML(){
    var x = X(), t = tplOf(D.tpl), f = fmtOf(t), n = 0;
    function H(lbl, st){ return '<div class="pr-ev-h2"' + (st ? ' style="' + st + '"' : '') + '>' + (++n) + ' · ' + esc(T(lbl)) + '</div>'; }
    function inp(k, lbl, val, ph){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span><input type="text" data-lt="' + k + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' autocomplete="off"></label>'; }
    function tin(k, lbl, rows){ return '<label class="pr-ev-in"><span>' + esc(T(lbl)) + '</span>' + (rows ? '<textarea rows="' + rows + '" data-ltx="' + k + '">' + esc(x[k] || '') + '</textarea>' : '<input type="text" data-ltx="' + k + '" value="' + esc(x[k] || '') + '" autocomplete="off">') + '</label>'; }
    function chk(k, lbl){ return '<label class="pr-rv-ck"><input type="checkbox" data-lt-ck="' + k + '"' + (D[k] ? ' checked' : '') + '><span>' + esc(T(lbl)) + '</span></label>'; }
    var h = '<div class="pr-hint" style="margin-bottom:10px;">' + esc(T(TX.hint)) + '</div>';
    /* 1 · kind of document — groups (pills) + cards; the open group is remembered (D.grp) */
    var cur = t.g || 'ask', og = D.grp || cur;
    h += H(TX.tplL, 'margin-top:0') + '<div class="pr-lt-grps">' + TPL_G.map(function(g){
      var c = TPL.filter(function(q){ return q.g === g[0]; }).length;
      return '<button type="button" class="pr-lt-grp' + (og === g[0] ? ' on' : '') + (cur === g[0] ? ' has' : '') + '" data-lt-grp="' + g[0] + '">' + esc(T(g[1])) + (c > 1 ? ' <i>' + c + '</i>' : '') + '</button>'; }).join('') + '</div>' +
      '<div class="pr-lt-tpls">' + TPL.filter(function(q){ return q.g === og; }).map(function(q){
      return '<button type="button" class="pr-rv-set' + (D.tpl === q.id ? ' on' : '') + '" data-lt-tpl="' + q.id + '"><b>' + esc(T(q.t)) + '</b><span>' + esc(T(q.d)) + '</span></button>'; }).join('') + '</div>';
    if(t.legal) h += '<div class="pr-lt-legal">' + esc(T(TX.legal)) + '</div>';
    /* 2 · fill in the blanks */
    h += slotsHTML(t, H);
    /* recipient — only external letters and memos have one */
    if(f === 'letter' || f === 'memo'){
      h += H(TX.toL) + '<div class="pr-ev-grid2"><label class="pr-ev-in"><span>' + esc(T(TX.toTitle)) + '</span><select data-lt="toTitle">' +
        TITLES.map(function(o, i){ return '<option value="' + i + '"' + (+D.toTitle === i ? ' selected' : '') + '>' + esc(T(o) || '—') + '</option>'; }).join('') + '</select></label>' + inp('toName', TX.toName, D.toName) + '</div>' +
        '<div class="pr-ev-grid2">' + inp('toPos', TX.toPos, D.toPos) + inp('toOrg', TX.toOrg, D.toOrg) + '</div>' + (f === 'memo' ? inp('dept', TX.deptL, D.dept, 'SPACEZ TERMINAL') : '');
    }
    var p2L = f === 'mou' ? TX.p2Mou : f === 'order' ? TX.p2List : f === 'letter' ? TX.p2 : TX.p2g;
    var clL = f === 'ann' ? TX.closeAnn : f === 'order' ? TX.closeOrd : f === 'cert' ? TX.closeCert : TX.close;
    h += H(TX.subjL) + tin('subj', f === 'cert' ? TX.subjCert : f === 'mou' ? TX.subjMou : TX.subj) + (f === 'letter' ? tin('refTo', TX.refTo) + tin('att', TX.att, 2) : '') +
      tin('p1', f === 'mou' ? TX.p1Mou : f === 'letter' ? TX.p1 : TX.p1g, 4) + tin('p2', p2L, f === 'mou' ? 9 : 4) + tin('p3', f === 'mou' ? TX.p3Mou : TX.p3, 3) +
      (f !== 'mou' ? tin('close', clL, 2) : '') + (f === 'letter' ? tin('cc', TX.cc) : '') +
      '<button type="button" class="pr-ev-bigbtn ghost" data-lt-reset="1" style="margin:2px 0 6px;">' + esc(T(TX.reset)) + '</button>';
    h += H(TX.fromL) + '<div class="pr-ev-grid2">' + inp('from', TX.from, D.from, T(TX.defFrom)) + inp('fromPos', TX.fromPos, D.fromPos, T(TX.defPos)) + '</div>' + inp('contact', TX.contact, D.contact) + inp('date', TX.dateL, D.date, T(TX.datePh)) +
      (window.__SPZ_CRED ? window.__SPZ_CRED.formHTML() : '') +
      '<div class="pr-lt-sig"><div class="pr-lt-sigh">' + esc(T(TX.sigL)) + '</div><div class="pr-lt-sigprev" data-lt-sigprev></div>' +
        '<div class="pr-lt-sigb"><label class="pr-lt-sbtn">' + esc(T(TX.sigUp)) + '<input type="file" accept="image/png,image/jpeg,image/webp" data-lt-sigfile hidden></label>' +
        '<button type="button" class="pr-lt-sbtn" data-lt-sigdraw="1">' + esc(T(TX.sigDraw)) + '</button><button type="button" class="pr-lt-sbtn ghost" data-lt-sigclear="1">' + esc(T(TX.sigClear)) + '</button></div>' +
        '<div class="pr-hint">' + esc(T(TX.sigNote)) + '</div>' + chk('sigStory', TX.sigStory) + '<input type="hidden" data-lt="sigv" value=""></div>';
    h += H(TX.lookL) + '<div class="pr-lt-looks">' +
      '<button type="button" class="pr-rv-set' + (D.look !== 'modern' ? ' on' : '') + '" data-lt-look="classic"><b>' + esc(T(TX.lkClassic)) + '</b></button>' +
      '<button type="button" class="pr-rv-set' + (D.look === 'modern' ? ' on' : '') + '" data-lt-look="modern"><b>' + esc(T(TX.lkModern)) + '</b></button></div>' +
      chk('qr', TX.oQr) +
      (f === 'letter' || f === 'memo' ? '<label class="pr-ev-in"><span>' + esc(T(TX.oUrgent)) + '</span><select data-lt="urgent">' + TX.urg.map(function(o, i){ return '<option value="' + i + '"' + (+D.urgent === i ? ' selected' : '') + '>' + esc(T(o)) + '</option>'; }).join('') + '</select></label>' : '');
    if(f === 'letter') h += H(TX.encL) + chk('guide', TX.oGuide) + (D.guide ? chk('acc', TX.oAcc) +
      (D.acc ? '<div class="pr-ev-grid2">' + inp('accUser', TX.accUser, D.accUser) + '<label class="pr-ev-in"><span>' + esc(T(TX.accCode)) + '</span><input type="text" data-lt-code="1" value="' + esc(ACC_CODE) + '" autocomplete="off" spellcheck="false"></label></div><div class="pr-hint">' + esc(T(TX.accWarn)) + '</div>' : '') : '');
    h += H(TX.saveL) + '<div class="pr-lt-save">' +
      '<button type="button" class="pr-lt-png" data-lt-png="a4"><i></i>' + esc(T(TX.pngA4)) + '</button>' +
      '<button type="button" class="pr-lt-png story" data-lt-png="story"><i></i>' + esc(T(TX.pngStory)) + '</button></div>' +
      '<div class="pr-hint" data-lt-status style="margin-top:6px;">' + esc(status || T(TX.pdfHint)) + '</div>';
    return h;
  }
  /* keep the open form in step without redrawing it (keeps the cursor where it is) */
  function syncForm(k){
    var x = X(), a = document.activeElement;
    document.querySelectorAll('[data-ltx]').forEach(function(e){ if(e !== a){ var v = x[e.getAttribute('data-ltx')] || ''; if(e.value !== v) e.value = v; } });
    var t = tplOf(D.tpl), s = k ? slotOf(t, k) : null;
    if(s && !s.m){ var v = D.sv[svKey(t, k)] || {}, own = v.o && String(v.o[L()] || '').trim(), sel = selOf(t, s);
      document.querySelectorAll('[data-lt-sl="' + k + '"]').forEach(function(b){ b.classList.toggle('on', !own && sel.indexOf(+b.getAttribute('data-i')) >= 0); }); }
    document.querySelectorAll('[data-lt-slmiss]').forEach(function(e){ e.hidden = !slMiss; });
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
    if(window.__SPZ_CRED && window.__SPZ_CRED.handleInput(t)) return true;
    var so = t.getAttribute('data-lt-sown');
    if(so){ var tp = tplOf(D.tpl), val = t.value; slotSet(tp, so, function(){ var v = svGet(tp, so); if(!v.o || typeof v.o !== 'object') v.o = {}; v.o[L()] = val; }); syncForm(so); return true; }
    var k = t.getAttribute('data-lt');
    if(k === 'from' || k === 'fromPos'){ var tq = tplOf(D.tpl), nv = t.value; slotSet(tq, k === 'from' ? 'A' : 'Apos', function(){ D[k] = nv; }); syncForm(); return true; }
    if(k){ D[k] = t.value; save(); return true; }
    var k2 = t.getAttribute('data-ltx');
    if(k2){ X()[k2] = t.value; D.ed[L()][k2] = 1; save(); return true; }
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
    if(a){ pick(a.getAttribute('data-lt-tpl')); return 'form'; }
    var sc = t.closest('[data-lt-sl]');
    if(sc){
      var tp = tplOf(D.tpl), k = sc.getAttribute('data-lt-sl'), i = +sc.getAttribute('data-i'), s = slotOf(tp, k); if(!s) return false;
      slotSet(tp, k, function(){ var v = svGet(tp, k), l = L();
        if(s.m){ var cur = selOf(tp, s).slice(), j = cur.indexOf(i); if(j >= 0) cur.splice(j, 1); else cur.push(i); v.m = cur; }
        else { var had = v.o && String(v.o[l] || '').trim(), was = selOf(tp, s)[0]; v.i = (was === i && !had) ? -1 : i; if(v.o) v.o[l] = ''; }
      });
      return 'form';
    }
    if(window.__SPZ_CRED){ var cr = window.__SPZ_CRED.handleClick(t); if(cr) return cr; }
    var b = t.closest('[data-lt-look]');
    if(b){ D.look = b.getAttribute('data-lt-look'); save(); return 'form'; }
    if(t.closest('[data-lt-reset]')){ fill(L()); save(); return 'form'; }
    if(t.closest('[data-lt-sigdraw]')){ sigPad(); return 'none'; }
    if(t.closest('[data-lt-sigclear]')){ SIGN.set(''); sigPreview(); return true; }
    var p = t.closest('[data-lt-png]');
    if(p){ png(p.getAttribute('data-lt-png')); return 'none'; }
    return false;
  }
  function pick(id){
    D.tpl = tplOf(id).id; D.grp = tplOf(id).g; D.tx = { en:null, th:null }; D.ed = { en:{}, th:{} }; slMiss = false;
    D.guide = D.acc = D.tpl === 'brain' ? 1 : 0; /* page 2 is about the Market Brain — on for that purpose only (it can still be ticked by hand) */
    save();
  }
  /* part-99 (Print Report chooser) opens a group of documents directly */
  function openGroup(g){ var first = TPL.filter(function(q){ return q.g === g; })[0]; if(!first) return; D.grp = g; if(tplOf(D.tpl).g !== g) pick(first.id); else save(); }

  /* ---------- the A4 document (six layouts) ---------- */
  var lastCtx = {};
  function para(s, cls){ return lines(s).length ? '<p class="' + (cls || 'lt-p') + '">' + esc(String(s).trim()).replace(/\n/g, '<br>') + '</p>' : ''; }
  /* a text with several lines (a list, the clauses of an MOU) becomes one paragraph per line, so a long one can flow onto page 2 */
  function paraL(s, cls){ var a = lines(s); if(a.length < 2) return para(s, cls); return a.map(function(x){ return '<p class="' + (cls || 'lt-p') + ' lt-li">' + esc(x) + '</p>'; }).join(''); }
  function urgW(){ return +D.urgent > 0 && TX.urg[+D.urgent] ? T(TX.urg[+D.urgent]) : ''; }
  function sigImg(ctx){ return SIGN.get() && !ctx.noSig ? '<img class="lt-sigimg" src="' + SIGN.get() + '" alt="">' : ''; }
  function headHTML(ctx, urg){
    return '<div class="lt-head">' +
      '<div class="lt-no">' + (urg ? '<em class="lt-urgent">' + esc(urg) + '</em>' : '') + '<span>' + esc(T(TX.no)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>' +
      '<div class="lt-crest">' + (ctx.logo ? '<img class="lt-logo" src="' + ctx.logo + '" alt="">' : '') + '</div>' +
      '<div class="lt-addr"><b>SPACEZ TERMINAL</b><em>' + esc(T(TX.orgSub)) + '</em><span>' + esc(SITE_SHOW) + '</span><span>IG @spczterminal</span></div>' +
    '</div><div class="lt-rule"><i></i></div>';
  }
  function signHTML(ctx, yours){
    return '<div class="lt-signwrap"><div class="lt-sign">' + (yours ? '<div class="lt-yours">' + esc(T(TX.yours)) + '</div>' : '') +
      '<div class="lt-sigsp">' + sigImg(ctx) + '</div><div class="lt-sname">( ' + esc(fromName()) + ' )</div><div class="lt-spos">' + esc(fromPos()) + '</div>' + credHTML() + '</div></div>';
  }
  function footHTML(ctx, x){
    return '<div class="lt-foot"><div class="lt-contact"><b>SPACEZ TERMINAL</b><span>' + esc(SITE_SHOW) + ' · IG @spczterminal</span>' + (String(D.contact || '').trim() ? '<span>' + esc(D.contact) + '</span>' : '') +
      (x && lines(x.cc).length ? '<span class="lt-cc">' + esc(T(TX.ccW)) + ' ' + esc(x.cc) + '</span>' : '') + '</div>' +
      (D.qr && ctx.qr ? '<div class="lt-qr"><div class="qb">' + ctx.qr(SITE) + '</div><span>' + esc(T(TX.qrCap)) + '</span></div>' : '') + '</div>';
  }
  function stripHTML(ctx){ return '<div class="lt-strip"><span>' + esc(T(TX.footL)) + '</span><b>' + esc(ctx.serial || '') + '</b></div>'; }
  function mouSign(ctx, t){
    var l = L(), dn = '..........................................';
    function cell(img, role, name, pos){ return '<div class="lt-ms"><div class="lt-sigsp">' + img + '</div><div class="lt-msl">' + esc(T(TX.sgn)) + ' <i class="lt-wline s"></i> ' + esc(role) + '</div><div class="lt-sname">( ' + esc(name) + ' )</div>' + (pos ? '<div class="lt-spos">' + esc(pos) + '</div>' : '') + '</div>'; }
    var p2n = slotVal(t, 'signB', l), p2p = slotVal(t, 'posB', l);
    return '<div class="lt-mousign">' +
      cell(sigImg(ctx), T(TX.p1W), fromName(), fromPos()).replace(/<\/div>$/, credHTML() + '</div>') +
      cell('', T(t.id === 'nda' ? TX.rcvW : TX.p2W), p2n == null ? dn : p2n, p2p == null || /^[.\s]+$/.test(p2p) ? '' : p2p) +
      cell('', T(TX.witW), dn, '') + cell('', T(TX.witW), dn, '') + '</div>';
  }
  function sheetHTML(ctx){
    ctx = ctx || {}; if(!ctx.noSig) lastCtx = ctx;
    var x = X(), t = tplOf(D.tpl), f = fmtOf(t), att = lines(x.att), sub = toSub(), urg = urgW();
    var logo = ctx.logo ? '<img class="lt-logo" src="' + ctx.logo + '" alt="">' : '';
    var h = '<div class="pr-sheet pr-lt f-' + f + (D.look === 'modern' ? ' modern' : '') + '" lang="' + L() + '"><div class="lt-page">';
    function row(k, v){ return '<tr><th>' + esc(T(k)) + '</th><td>' + v + '</td></tr>'; }
    if(f === 'letter'){
      h += headHTML(ctx, urg) + '<div class="lt-date">' + esc(dateStr()) + '</div>';
      h += '<table class="lt-meta">' + row(TX.subjW, '<b>' + (esc(x.subj) || '&nbsp;') + '</b>') +
        row(TX.toW, esc(toLine()) + (sub ? '<span class="lt-sub">' + esc(sub) + '</span>' : '')) +
        (lines(x.refTo).length ? row(TX.refW, esc(x.refTo)) : '') +
        (att.length ? row(TX.attW, att.length > 1 ? '<ol class="lt-att">' + att.map(function(a){ return '<li>' + esc(a.replace(/^\d+[.)]\s*/, '')) + '</li>'; }).join('') + '</ol>' : esc(att[0])) : '') + '</table>';
      h += '<div class="lt-body">' + paraL(x.p1) + paraL(x.p2) + paraL(x.p3) + para(x.close, 'lt-p lt-close') + '</div>' + signHTML(ctx, true) + footHTML(ctx, x);
    } else if(f === 'memo'){
      h += '<div class="lt-mhead">' + (ctx.logo ? '<img class="lt-logo s" src="' + ctx.logo + '" alt="">' : '') + '<b class="lt-mtitle">' + esc(T(TX.memoT)) + '</b>' + (urg ? '<em class="lt-urgent">' + esc(urg) + '</em>' : '') + '</div>' +
        '<div class="lt-mmeta"><div class="r"><b>' + esc(T(TX.deptW)) + '</b><span class="dl">' + esc(String(D.dept || '').trim() || 'SPACEZ TERMINAL') + '</span></div>' +
        '<div class="r two"><b>' + esc(T(TX.no)) + '</b><span class="dl mono">' + esc(ctx.serial || '') + '</span><b>' + esc(T(TX.dateW)) + '</b><span class="dl">' + esc(dateStr()) + '</span></div>' +
        '<div class="r"><b>' + esc(T(TX.subjW)) + '</b><span class="dl">' + (esc(x.subj) || '&nbsp;') + '</span></div></div>' +
        '<div class="lt-mto"><b>' + esc(T(TX.toW)) + '</b>' + esc(toLine()) + (sub ? ' <span class="lt-sub i">' + esc(sub) + '</span>' : '') + '</div>';
      h += '<div class="lt-body">' + paraL(x.p1) + paraL(x.p2) + paraL(x.p3) + para(x.close, 'lt-p lt-close') + '</div>' + signHTML(ctx, false) + footHTML(ctx, null);
    } else if(f === 'cert'){
      h += headHTML(ctx, '') + '<div class="lt-ctitle">' + (esc(x.subj) || '&nbsp;') + '</div>';
      h += '<div class="lt-body">' + paraL(x.p1) + paraL(x.p2) + paraL(x.p3) + para(x.close, 'lt-p lt-close') + '<p class="lt-given">' + esc(T(TX.givenCert)) + ' ' + esc(dateStr()) + '</p></div>' + signHTML(ctx, false) + footHTML(ctx, null);
    } else if(f === 'ann' || f === 'order'){
      h += '<div class="lt-annh">' + logo + '<b>' + esc(T(f === 'ann' ? TX.annT : TX.ordT)) + '</b>' + (f === 'order' ? '<span class="no">' + esc(T(TX.no)) + ' ' + esc(ctx.serial || '') + '</span>' : '') +
        '<span>' + esc(T(TX.subjW)) + ' ' + (esc(x.subj) || '........................') + '</span><i class="lt-dash"></i></div>';
      h += '<div class="lt-body">' + paraL(x.p1) + paraL(x.p2) + paraL(x.p3) + para(x.close, 'lt-p lt-close') + '<p class="lt-given">' + esc(T(f === 'ann' ? TX.givenAnn : TX.givenOrd)) + ' ' + esc(dateStr()) + '</p></div>' + signHTML(ctx, false) + footHTML(ctx, null);
    } else { /* mou */
      var ob = slotVal(t, 'orgB', L());
      h += '<div class="lt-annh">' + logo + '<b>' + (esc(x.subj) || '&nbsp;') + '</b><span>' + esc(T(TX.betw)) + ' ' + esc(ob == null ? '........................' : ob) + '</span><i class="lt-dash"></i></div>';
      h += '<div class="lt-body">' + paraL(x.p1) + paraL(x.p2, 'lt-p lt-cl') + paraL(x.p3) + '</div>' + mouSign(ctx, t) + footHTML(ctx, null);
    }
    h += stripHTML(ctx) + '</div>' + (f === 'letter' && D.guide ? page2(ctx) : '') + '</div>';
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
  /* shrink the type a little when the text is long; if it still does not fit, carry the end on to page 2, 3 …
     (Thai style: "- 2 -" at the top of each next page, the signature never alone on a page) */
  function over(pg){ return pg.scrollHeight > pg.clientHeight + 1; }
  function flowFrom(pg, n){
    if(n > 5 || !over(pg)) return false;
    var body = null, strip = null;
    Array.prototype.forEach.call(pg.children, function(c){ if(c.classList.contains('lt-body')) body = c; if(c.classList.contains('lt-strip')) strip = c; });
    if(!body) return false;
    var tail = [], sib = body.nextElementSibling;
    while(sib){ if(sib !== strip) tail.push(sib); sib = sib.nextElementSibling; }
    var mvB = [], mvT = [];
    while(over(pg) && tail.length){ var a = tail.pop(); mvT.unshift(a); a.parentNode.removeChild(a); }
    if(mvT.length && body.children.length > 1){ var b0 = body.lastElementChild; mvB.unshift(b0); body.removeChild(b0); }
    while(over(pg) && body.children.length > 1){ var b = body.lastElementChild; mvB.unshift(b); body.removeChild(b); }
    if(!mvB.length && !mvT.length) return false;
    var cont = document.createElement('div');
    cont.className = 'lt-page lt-cont'; cont.style.cssText = pg.style.cssText;
    cont.innerHTML = '<div class="lt-pno">- ' + (n + 1) + ' -</div><div class="lt-body"></div>';
    var b2 = cont.lastElementChild;
    mvB.forEach(function(e){ b2.appendChild(e); });
    mvT.forEach(function(e){ cont.appendChild(e); });
    if(strip) cont.appendChild(strip.cloneNode(true));
    pg.parentNode.insertBefore(cont, pg.nextSibling);
    flowFrom(cont, n + 1);
    return true;
  }
  function fit(host){
    var s = host && host.querySelector('.pr-lt'); if(!s) return;
    var pages = s.querySelectorAll('.lt-page'); if(!pages.length) return;
    /* the preview column can be narrower than A4: scale the whole page down to fit, never reflow it */
    var hw = host.clientWidth || 794, z = hw < 790 ? Math.max(.4, (hw - 4) / 794).toFixed(3) : '';
    var shrunk = false, still = false, flowed = false;
    Array.prototype.forEach.call(pages, function(pg){
      pg.style.zoom = z;
      var steps = [1, .96, .92, .88], i = 0;
      pg.style.setProperty('--ltk', 1);
      while(i < steps.length - 1 && over(pg)){ i++; pg.style.setProperty('--ltk', steps[i]); }
      if(i > 0) shrunk = true;
    });
    if(over(pages[0])) flowed = flowFrom(pages[0], 1);
    Array.prototype.forEach.call(s.querySelectorAll('.lt-page'), function(pg){ var o = over(pg); if(o) still = true; pg.classList.toggle('lt-over', o); });
    var st = still ? T(TX.overflow) : flowed ? T(TX.flowed) : (shrunk ? T(TX.tooLong) : '');
    setTimeout(sigPreview, 0);
    if(st) setStatus(st); else if(status === T(TX.tooLong) || status === T(TX.overflow) || status === T(TX.flowed)) setStatus(T(TX.pdfHint));
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

  window.__SPZ_LETTER = { v:2, label:function(){ return T(TX.type); }, formHTML:formHTML, sheetHTML:sheetHTML, handleInput:handleInput, handleClick:handleClick, fit:fit, png:png,
    openGroup:openGroup, groups:function(){ return TPL_G.map(function(g){ return { id:g[0], label:T(g[1]), n:TPL.filter(function(q){ return q.g === g[0]; }).length }; }); }, count:function(){ return TPL.length; } };
})();
