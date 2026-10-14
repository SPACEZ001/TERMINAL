/* ============================================================================
   SPACEZ TERMINAL -- Ebook registry (#/ebookreg, admin only)
   Every copy of the ebook that is handed out is personal:
     1. a visible line on every page  (recipient name + copy code)
     2. a near-invisible dot pattern in the page background that encodes the
        copy's serial number (decoded here by clicking four marker dots)
     3. a QR code inside the decorative frame of the copyright page that
        reads like an ordinary "visit our site" link but carries the code
     4. invisible text + zero-width characters + the PDF title (metadata)
     5. small, meaning-neutral wording differences chosen per copy, so a
        re-typed copy can still be traced
   The registry (who, when, acceptance of the terms with time/IP/device)
   lives in the Worker (EBK:*). The recipient accepts the terms on
   ebook.html with a private link before the PDF can be downloaded.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_EBOOKREG) return;
  window.__SPZ_EBOOKREG = true;

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var SITE = 'https://spacez001.github.io/TERMINAL/';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function key(){ try { return sessionStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; } }
  function setKey(k){ try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){} }
  function fmtDate(t){ if(!t) return '—'; var d = new Date(t); return d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
  function safeName(s){ return String(s || '').replace(/[\\\/:*?"<>|#%&{}$!'@+`=]/g, '').replace(/\s+/g, '_').slice(0, 40) || 'reader'; }

  var U = {
    eb:{ en:'Admin · ebook', th:'แอดมิน · อีบุ๊ก' },
    h:{ en:'Ebook registry', th:'ทะเบียนแจกอีบุ๊ก' },
    lede:{ en:'Every copy is personal and traceable. Register the reader, send the private link, and once they have accepted the terms and typed their name, make their PDF and upload it.', th:'อีบุ๊กทุกเล่มเป็นฉบับเฉพาะคนและสืบย้อนได้ ลงทะเบียนผู้รับ ส่งลิงก์ส่วนตัวให้ พอผู้รับกดยอมรับเงื่อนไขและพิมพ์ชื่อแล้ว ค่อยสร้าง PDF และอัปโหลด' },
    tReg:{ en:'Registry', th:'ทะเบียน' }, tNew:{ en:'Give a new copy', th:'แจกเล่มใหม่' }, tFind:{ en:'Find the owner', th:'ตรวจหาเจ้าของ' },
    keyLede:{ en:'Enter the admin key to open the registry.', th:'ใส่รหัสแอดมินเพื่อเปิดทะเบียน' }, keyPh:{ en:'Admin key', th:'รหัสแอดมิน' }, open:{ en:'Open', th:'เปิด' },
    bad:{ en:'Wrong admin key.', th:'รหัสแอดมินไม่ถูกต้อง' }, net:{ en:'Could not reach the server. Has the new Worker been deployed?', th:'ติดต่อเซิร์ฟเวอร์ไม่ได้ ได้ deploy Worker ตัวใหม่แล้วหรือยัง' },
    name:{ en:'Reader name (a nickname or LINE ID is fine)', th:'ชื่อผู้รับ (ชื่อเล่นหรือไอดีไลน์ก็ได้)' }, contact:{ en:'Contact (LINE / phone / email)', th:'ช่องทางติดต่อ (LINE / โทร / อีเมล)' },
    note:{ en:'Note (course, payment, …)', th:'หมายเหตุ (คอร์ส การชำระเงิน ฯลฯ)' }, lang:{ en:'Ebook language', th:'ภาษาของอีบุ๊ก' },
    issue:{ en:'1 · Register this reader', th:'1 · ลงทะเบียนผู้รับ' }, needName:{ en:'Type the reader name first.', th:'กรุณาพิมพ์ชื่อผู้รับก่อน' },
    flow:{ en:'Do not know the real name? Register a nickname or LINE ID, send the link first: the reader types their full name when accepting, and the PDF you make afterwards prints that name.', th:'ไม่รู้ชื่อจริง? ลงชื่อเล่นหรือไอดีไลน์ไว้ก่อน แล้วส่งลิงก์ให้ผู้รับก่อน ผู้รับจะกรอกชื่อจริงเองตอนกดยอมรับ จากนั้นค่อยกดสร้าง PDF เล่มจะพิมพ์ชื่อที่ผู้รับกรอก' },
    willUse:{ en:'Name printed in the book', th:'ชื่อที่จะพิมพ์ในเล่ม' }, vLine:{ en:'dotted code line', th:'แถบจุดไข่ปลา' },
    drop:{ en:'Drop a PDF or a picture here, or click to choose', th:'ลากไฟล์ PDF หรือรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์' }, dropH:{ en:'PDF: hidden code, PDF title, identical-file check. Picture/screenshot: QR, dotted code line, background dots.', th:'PDF: ตรวจรหัสซ่อน ชื่อในไฟล์ และเทียบว่าเป็นไฟล์เดียวกันทุกไบต์ · รูป/ภาพหน้าจอ: อ่าน QR แถบจุดไข่ปลา และลายจุดพื้นหลัง' },
    hashT:{ en:'SHA-256 of this file', th:'SHA-256 (ลายนิ้วมือ) ของไฟล์นี้' }, adv:{ en:'Advanced: read the dots by clicking', th:'ขั้นสูง: อ่านลายจุดด้วยการคลิกเอง' },
    s2:{ en:'3 · Make the PDF', th:'3 · สร้าง PDF' }, s2h:{ en:'Use Google Chrome. In the print window choose "Save as PDF". The file name is already set.', th:'ใช้ Google Chrome ในหน้าต่างพิมพ์ เลือก "บันทึกเป็น PDF" ชื่อไฟล์ตั้งไว้ให้แล้ว' },
    s3:{ en:'4 · Upload that PDF', th:'4 · อัปโหลด PDF นั้น' }, s3h:{ en:'The reader downloads it from the same link. Nothing else to send.', th:'ผู้รับดาวน์โหลดได้จากลิงก์เดิม ไม่ต้องส่งอะไรเพิ่ม' },
    s4:{ en:'2 · Send the private link', th:'2 · ส่งลิงก์ส่วนตัวให้ผู้รับ' }, s4h:{ en:'The reader opens it, reads the terms and types their full name. Press Refresh to see when they have done it.', th:'ผู้รับเปิดลิงก์ อ่านเงื่อนไข แล้วพิมพ์ชื่อ-นามสกุลจริงเอง กด "รีเฟรช" เพื่อดูว่ากดยอมรับแล้วหรือยัง' },
    notYet:{ en:'Not accepted yet: the book will print the registered name. Better to wait until the reader has accepted.', th:'ผู้รับยังไม่ได้กดยอมรับ ถ้าสร้างตอนนี้เล่มจะพิมพ์ชื่อที่ลงทะเบียนไว้ แนะนำให้รอผู้รับกดยอมรับก่อน' },
    make:{ en:'Make PDF', th:'สร้าง PDF' }, upload:{ en:'Upload PDF', th:'อัปโหลด PDF' }, copyLink:{ en:'Copy link', th:'คัดลอกลิงก์' }, line:{ en:'Send via LINE', th:'ส่งทาง LINE' },
    copied:{ en:'Copied', th:'คัดลอกแล้ว' }, uploading:{ en:'Uploading…', th:'กำลังอัปโหลด…' }, uploaded:{ en:'Uploaded', th:'อัปโหลดแล้ว' },
    building:{ en:'Building the book…', th:'กำลังประกอบเล่ม…' }, noContent:{ en:'Lesson content not found. Run CLASSROOM_CONTENT_UPLOADER first.', th:'ไม่พบเนื้อหาบทเรียน กรุณารัน CLASSROOM_CONTENT_UPLOADER ก่อน' },
    pending:{ en:'Waiting for acceptance', th:'รอผู้รับกดยอมรับ' }, accepted:{ en:'Accepted', th:'ยอมรับแล้ว' }, revoked:{ en:'Revoked', th:'ยกเลิกสิทธิ์แล้ว' },
    noFile:{ en:'No PDF uploaded yet', th:'ยังไม่ได้อัปโหลด PDF' }, file:{ en:'PDF uploaded', th:'อัปโหลด PDF แล้ว' }, dl:{ en:'downloads', th:'ครั้งที่ดาวน์โหลด' },
    revoke:{ en:'Revoke', th:'ยกเลิกสิทธิ์' }, unrevoke:{ en:'Restore', th:'คืนสิทธิ์' }, del:{ en:'Delete', th:'ลบ' }, delQ:{ en:'Delete this record and its PDF? This cannot be undone.', th:'ลบรายการนี้และไฟล์ PDF? ย้อนกลับไม่ได้' },
    evidence:{ en:'Evidence sheet', th:'เอกสารหลักฐาน' }, export:{ en:'Download registry (JSON + CSV)', th:'ดาวน์โหลดทะเบียน (JSON + CSV)' }, reload:{ en:'Refresh', th:'รีเฟรช' },
    empty:{ en:'No copies given out yet.', th:'ยังไม่มีการแจก' }, serial:{ en:'Serial', th:'ลำดับ' }, given:{ en:'Given', th:'แจกเมื่อ' },
    fCode:{ en:'Code or serial', th:'รหัสเล่มหรือเลขลำดับ' }, fFile:{ en:'B · File or picture you found', th:'B · ไฟล์หรือรูปที่เจอ' }, fCodeH:{ en:'Type EB-XXXXXX, or the serial number.', th:'พิมพ์ EB-XXXXXX หรือเลขลำดับ' },
    fText:{ en:'Text you found', th:'ข้อความที่เจอ' }, fTextH:{ en:'Paste a paragraph copied from the leak, or text an AI/OCR read off a screenshot (the dotted line ●•●• at the top of each page counts). Re-typed text: paste as much as you can for the wording fingerprint.', th:'วางย่อหน้าที่คัดลอกจากไฟล์ที่หลุด หรือข้อความที่ให้ AI/OCR อ่านจากภาพหน้าจอ (แถบจุด ●•●• หัวกระดาษก็อ่านได้) ถ้าคนพิมพ์ใหม่เอง วางมาให้ยาวที่สุด ระบบจะเทียบถ้อยคำเฉพาะของแต่ละเล่ม' },
    fPdf:{ en:'C · PDF file you found', th:'C · ไฟล์ PDF ที่เจอ' }, fImg:{ en:'D · Picture / screenshot you found', th:'D · รูปหรือภาพหน้าจอที่เจอ' },
    fImgH:{ en:'Upload any picture or screenshot of a page. The system first looks for the QR (copyright page), then reads the faint dot pattern that is printed in the background of every page. A sharp screenshot of any page works; a heavily compressed photo may not.', th:'อัปโหลดรูปหรือภาพหน้าจอของหน้าไหนก็ได้ ระบบจะหา QR ก่อน (อยู่ในหน้าลิขสิทธิ์) ถ้าไม่มีจะอ่านลายจุดจาง ๆ ที่พิมพ์อยู่ในพื้นหลังทุกหน้าให้เอง ภาพหน้าจอที่ชัดใช้ได้ทุกหน้า แต่รูปที่ถูกบีบอัดหนักหรือถ่ายจากจออาจอ่านไม่ได้' },
    fPdfH:{ en:'Upload the leaked PDF. Checks the code in the text, the PDF title and whether it is the exact same file you uploaded (SHA-256).', th:'อัปโหลดไฟล์ PDF ที่หลุด ระบบตรวจรหัสในตัวอักษร ชื่อในไฟล์ และเทียบว่าเป็นไฟล์เดียวกับที่คุณอัปโหลดไปหรือไม่ (SHA-256)' },
    check:{ en:'Check', th:'ตรวจ' }, found:{ en:'Belongs to', th:'เป็นของ' }, nothing:{ en:'No trace found.', th:'ไม่พบร่องรอย' },
    via:{ en:'found by', th:'พบจาก' }, vCode:{ en:'visible / hidden code', th:'รหัสที่มองเห็นหรือซ่อน' }, vZw:{ en:'zero-width code', th:'รหัสล่องหน' }, vQr:{ en:'QR', th:'QR' }, vDots:{ en:'dot pattern', th:'ลายจุด' }, vMeta:{ en:'PDF title', th:'ชื่อในไฟล์ PDF' },
    vWord:{ en:'wording fingerprint', th:'ลายนิ้วมือถ้อยคำ' }, match:{ en:'match', th:'ตรงกัน' },
    dotsReset:{ en:'Clear clicks', th:'ล้างจุดที่คลิก' }, dotsFail:{ en:'Could not read the pattern. Zoom in and click the centres of the four corner dots again.', th:'อ่านลายจุดไม่ได้ ซูมเข้าแล้วคลิกกลางจุดมุมทั้ง 4 ใหม่' },
    loading:{ en:'Loading…', th:'กำลังโหลด…' }, tool:{ en:'Loading reader tool…', th:'กำลังโหลดเครื่องมืออ่านไฟล์…' },
    prBtn:{ en:'Ebook (personal copy)', th:'อีบุ๊ก (ฉบับเฉพาะคน)' },
    vHash:{ en:'identical file (SHA-256)', th:'ไฟล์ตรงกันทุกไบต์ (SHA-256)' },
    safari:{ en:'Safari does not print the cover colours, the full-bleed cover or the hidden dot pattern correctly. Please make the PDF in Google Chrome. Press the button again to continue in Safari anyway.', th:'Safari พิมพ์สีหน้าปก ปกเต็มหน้า และลายจุดซ่อนได้ไม่ครบ แนะนำให้สร้าง PDF ใน Google Chrome ถ้ายังต้องการใช้ Safari กดปุ่มอีกครั้ง' },
    autoDots:{ en:'Reading the hidden dot pattern…', th:'กำลังอ่านลายจุดซ่อน…' }, manual:{ en:'Could not read it automatically. Manual mode:', th:'อ่านอัตโนมัติไม่ได้ ใช้โหมดคลิกเอง:' },
    help:{ en:'How each check works', th:'แต่ละช่องใช้ยังไง' },
    ip:{ en:'IP', th:'IP' }, typed:{ en:'typed name', th:'ชื่อที่พิมพ์ยืนยัน' }, device:{ en:'device', th:'อุปกรณ์' }
  };

  /* ------------------------------------------------------------------
     Terms -- the exact text is hashed on both sides (ebook.html sends the
     hash it showed; the evidence sheet recomputes it from this same text).
     Keep this in sync with TERMS in ebook.html.
     ------------------------------------------------------------------ */
  var TERMS_VERSION = '2026-10-14';
  function termsText(lang, name, title, id){
    if(lang === 'en') return [
      'This copy of "' + title + '" (copy ' + id + ') is the copyright work of Noraset Boikaw (SPACEZ TERMINAL) and is licensed to ' + name + ' for personal study only.',
      'You may not copy, share, forward, upload, sell, rent or publish this book, in whole or in part, in any form, without written permission.',
      'You may not remove, alter or hide the identifying marks in this copy.',
      'This copy carries marks that identify you as its recipient. If it is found shared, you accept that these marks may be used as evidence.',
      'If these terms are broken, the copyright owner may end this licence and take legal action, including a claim for damages.',
      'When you accept, the system records the time, your IP address and your device as evidence of acceptance.',
      'The content is for education only and is not investment advice.'
    ];
    return [
      'หนังสือ "' + title + '" ฉบับนี้ (เลขที่ ' + id + ') เป็นงานอันมีลิขสิทธิ์ของ นรเศรษฐ์ บ่อแก้ว (SPACEZ TERMINAL) และอนุญาตให้ ' + name + ' ใช้เพื่อการศึกษาส่วนตัวเท่านั้น',
      'ห้ามทำซ้ำ แบ่งปัน ส่งต่อ อัปโหลด ขาย ให้เช่า หรือเผยแพร่ ไม่ว่าทั้งเล่มหรือบางส่วน ในรูปแบบใด ๆ โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร',
      'ห้ามลบ แก้ไข หรือปิดบังเครื่องหมายระบุตัวตนในเอกสารฉบับนี้',
      'ฉบับนี้มีเครื่องหมายที่ระบุตัวผู้รับ หากพบการเผยแพร่ ผู้รับยอมรับว่าเครื่องหมายดังกล่าวใช้เป็นหลักฐานได้',
      'หากฝ่าฝืนเงื่อนไข เจ้าของลิขสิทธิ์อาจยกเลิกสิทธิ์การใช้ และดำเนินการตามกฎหมาย รวมถึงเรียกร้องค่าเสียหาย',
      'เมื่อกดยอมรับ ระบบจะบันทึกเวลา หมายเลข IP และอุปกรณ์ที่ใช้ เพื่อเป็นหลักฐานการยอมรับ',
      'เนื้อหาจัดทำเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'
    ];
  }
  function sha256Hex(str){
    var b = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', b).then(function(h){ return Array.prototype.map.call(new Uint8Array(h), function(x){ return ('0' + x.toString(16)).slice(-2); }).join(''); });
  }

  /* ------------------------------------------------------------------
     Per-copy marks
     ------------------------------------------------------------------ */
  /* meaning-neutral wording pairs; bit k of the copy's seed picks A or B */
  var PAIRS = {
    th:[['มักจะ', 'มัก'], ['ส่วนใหญ่', 'ส่วนมาก'], ['ชัดเจน', 'ชัดแจ้ง'], ['ถ้า', 'หาก'], ['ทั้งหมด', 'ทั้งสิ้น'], ['มากกว่า', 'เกินกว่า'], ['นั่นคือ', 'กล่าวคือ'], ['ต่อจากนั้น', 'จากนั้น'], ['ควรจะ', 'ควร'], ['บ่อยครั้ง', 'หลายครั้ง'], ['โดยทั่วไป', 'ตามปกติ']],
    en:[['usually', 'typically'], ['often', 'frequently'], ['large', 'big'], ['because', 'since'], ['quickly', 'rapidly'], ['Then', 'Next']]
  };
  /* in each pair the LONGER form is listed first when one contains the other,
     so normalising replaces the long form before the short one */
  function bit(seed, k){ return (seed >>> k) & 1; }
  function applyWording(html, lang, seed){
    var pairs = PAIRS[lang] || [];
    var tpl = document.createElement('template'); tpl.innerHTML = html;
    var walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT, { acceptNode:function(n){ return n.parentNode && n.parentNode.closest && n.parentNode.closest('svg,style,script') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var nodes = [], n; while((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function(tn){
      var t = tn.nodeValue;
      pairs.forEach(function(p, k){
        var want = bit(seed, k) ? p[1] : p[0];
        if(lang === 'en'){
          [p[0], p[1]].forEach(function(w){
            t = t.replace(new RegExp('\\b' + w + '\\b', 'g'), '\u0001' + k + '\u0002');
            var cap = w.charAt(0).toUpperCase() + w.slice(1);
            if(cap !== w) t = t.replace(new RegExp('\\b' + cap + '\\b', 'g'), '\u0001' + k + 'C\u0002');
          });
        } else {
          t = t.split(p[0]).join('\u0001' + k + '\u0002');
          t = t.split(p[1]).join('\u0001' + k + '\u0002');
        }
      });
      t = t.replace(/\u0001(\d+)(C?)\u0002/g, function(_, k, c){ var p = pairs[+k], w = bit(seed, +k) ? p[1] : p[0]; return c ? w.charAt(0).toUpperCase() + w.slice(1) : w; });
      tn.nodeValue = t;
    });
    return tpl.innerHTML;
  }
  function wordingBits(text, lang){
    var pairs = PAIRS[lang] || [], out = [];
    pairs.forEach(function(p){
      var a, b;
      if(lang === 'en'){ a = (text.match(new RegExp('\\b' + p[0] + '\\b', 'gi')) || []).length; b = (text.match(new RegExp('\\b' + p[1] + '\\b', 'gi')) || []).length; }
      else {
        /* count the longer form first and remove it so the shorter one is not double counted */
        var long = p[0].length >= p[1].length ? p[0] : p[1], short = long === p[0] ? p[1] : p[0];
        var nl = text.split(long).length - 1, rest = text.split(long).join(''), ns = rest.split(short).length - 1;
        a = long === p[0] ? nl : ns; b = long === p[0] ? ns : nl;
      }
      out.push(a === b ? null : (b > a ? 1 : 0));
    });
    return out;
  }
  /* zero-width code: U+2060 frame, U+200B = 0, U+200C = 1 */
  function zwEncode(str){ var bits = ''; for(var i = 0; i < str.length; i++) bits += ('00000000' + str.charCodeAt(i).toString(2)).slice(-8); return '⁠' + bits.replace(/0/g, '​').replace(/1/g, '‌') + '⁠'; }
  function zwDecodeAll(text){
    var out = [], re = /⁠([​‌]{16,})⁠/g, m;
    while((m = re.exec(text))){ var b = m[1].replace(/​/g, '0').replace(/‌/g, '1'), s = ''; for(var i = 0; i + 8 <= b.length; i += 8) s += String.fromCharCode(parseInt(b.slice(i, i + 8), 2)); out.push(s); }
    return out;
  }
  /* dot pattern: 16-bit serial + CRC-8, twice = 48 data cells in an 8x6 grid
     inside a 10x8 tile; corner cells hold the markers (top-left is double) */
  function crc8(v){ var c = 0, bytes = [(v >> 8) & 255, v & 255]; bytes.forEach(function(b){ c ^= b; for(var i = 0; i < 8; i++) c = (c & 128) ? ((c << 1) ^ 7) & 255 : (c << 1) & 255; }); return c; }
  /* dotted code line printed in the page header: start ●●• + 24 bits (● = 1, • = 0) + end •●● */
  function dotLine(serial){ return '●●•' + dotBits(serial).slice(0, 24).map(function(b){ return b ? '●' : '•'; }).join('') + '•●●'; }
  function decodeLineText(text){
    var out = [], re = /[●⬤⚫•·∙⦁◦○]{28,34}/g, m;
    while((m = re.exec(text))){
      var b = m[0].split('').map(function(ch){ return /[●⬤⚫]/.test(ch) ? 1 : 0; }).join('');
      for(var o = 0; o + 30 <= b.length; o++){
        var w = b.slice(o, o + 30); if(w.slice(0, 3) !== '110' || w.slice(27) !== '011') continue;
        var se = parseInt(w.slice(3, 19), 2), cr = parseInt(w.slice(19, 27), 2); if(se > 0 && crc8(se) === cr) out.push(se);
      }
    }
    return out;
  }
  function dotBits(serial){ var s = ('0000000000000000' + serial.toString(2)).slice(-16) + ('00000000' + crc8(serial).toString(2)).slice(-8); return (s + s).split('').map(Number); }
  var DOT = { cols:10, rows:8, step:7 };
  function dotTileSVG(serial){
    var b = dotBits(serial), w = DOT.cols * DOT.step, h = DOT.rows * DOT.step, c = '#d6dbe4', o = '';
    function dot(i, j, r){ o += '<circle cx="' + (i * DOT.step + 3.5) + '" cy="' + (j * DOT.step + 3.5) + '" r="' + r + '" fill="' + c + '"/>'; }
    dot(0, 0, 1.15); o += '<circle cx="' + (3.5 + 2.6) + '" cy="3.5" r="0.75" fill="' + c + '"/>';
    dot(DOT.cols - 1, 0, 1.15); dot(DOT.cols - 1, DOT.rows - 1, 1.15); dot(0, DOT.rows - 1, 1.15);
    var k = 0; for(var j = 1; j <= 6; j++) for(var i = 1; i <= 8; i++){ if(b[k]) dot(i, j, 0.8); k++; }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + o + '</svg>';
  }
  function decodeDotBits(vals){
    /* most cells are empty, so compare against the median (background) and the darkest few */
    var sorted = vals.slice().sort(function(a, b){ return a - b; }), lo = sorted[Math.floor(vals.length / 2)], hi = (sorted[vals.length - 1] + sorted[vals.length - 2] + sorted[vals.length - 3]) / 3;
    if(hi - lo < 6) return null;
    var th = lo + (hi - lo) * 0.45, bits = vals.map(function(v){ return v > th ? 1 : 0; });
    for(var c = 0; c < 2; c++){
      var part = bits.slice(c * 24, c * 24 + 24).join(''), serial = parseInt(part.slice(0, 16), 2), cr = parseInt(part.slice(16), 2);
      if(serial > 0 && crc8(serial) === cr) return serial;
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Worker calls
     ------------------------------------------------------------------ */
  function api(path, opt){
    opt = opt || {};
    var h = { 'X-Admin-Key':key() }; if(opt.json) h['Content-Type'] = 'application/json'; if(opt.ctype) h['Content-Type'] = opt.ctype;
    return fetch(WORKER_BASE + path, { method:opt.method || 'GET', headers:h, body:opt.json ? JSON.stringify(opt.json) : opt.body })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(d){ d.__status = r.status; return d; }); });
  }
  var S = { tab:'reg', list:null, err:null, busy:false, last:null, find:null, dots:null };
  function load(){
    if(!key()){ S.list = null; paint(); return; }
    S.err = null; S.busy = true; paint();
    api('/api/admin/ebook/list').then(function(d){
      S.busy = false;
      if(d.__status === 401){ setKey(''); S.err = 'bad'; S.list = null; paint(); return; }
      if(d.__status !== 200 || !d.ebooks){ S.err = 'net'; paint(); return; }
      S.list = d.ebooks; paint();
    }).catch(function(){ S.busy = false; S.err = 'net'; paint(); });
  }
  function accLink(r){ return SITE + 'ebook.html#id=' + encodeURIComponent(r.id) + '&t=' + encodeURIComponent(r.token); }

  /* ------------------------------------------------------------------
     Book builder (print to PDF)
     ------------------------------------------------------------------ */
  var BOOK = {
    th:{ title:'ห้องเรียนคลื่นเอลเลียต', kick:'คู่มือฉบับสมบูรณ์', big:'คลื่น<br>เอลเลียต', sub:'Elliott Wave Classroom · จากพื้นฐานถึงการนำไปใช้จริง', by:'โดย นรเศรษฐ์ บ่อแก้ว (Focus)',
      fw:'คำนำ', toc:'สารบัญ', ch:'บทที่', edition:'ฉบับปี 2569', copyH:'ลิขสิทธิ์และสิทธิ์การใช้', forWho:'ฉบับเฉพาะของ', copyNo:'เลขที่ฉบับ', scan:'สแกนเพื่อเยี่ยมชมเว็บไซต์',
      fwbody:['หนังสือเล่มนี้รวบรวมบทเรียนทั้งหมดจากห้องเรียนคลื่นเอลเลียตบน SPACEZ TERMINAL ไว้ในที่เดียว เพื่อให้ผู้เรียนอ่านทบทวนได้ทุกที่ แม้ไม่ได้เปิดเว็บไซต์', 'เนื้อหาเรียงจากพื้นฐานไปสู่ขั้นสูง: เริ่มจากรูปแบบคลื่นขับเคลื่อนและคลื่นปรับฐาน กฎและแนวทาง ฟีโบนัชชี ไปจนถึงการนับสำรอง การนับใหม่เมื่อราคาผิดกฎ และการนำไปใช้จริง ทุกบทมีภาพประกอบเพื่อให้เห็นรูปแบบได้ชัดเจน', 'ขอให้จำไว้เสมอว่า หลักคลื่นเป็นเครื่องมือจัดระเบียบความเป็นไปได้ ไม่ใช่ลูกแก้ววิเศษ ให้ใช้ร่วมกับการบริหารความเสี่ยงทุกครั้ง', 'เนื้อหาทั้งหมดจัดทำเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'],
      sign:'นรเศรษฐ์ บ่อแก้ว (Focus)', foot:'ฉบับเฉพาะของ {n} · {id} · ห้ามเผยแพร่ต่อ' },
    en:{ title:'Elliott Wave Classroom', kick:'The complete handbook', big:'Elliott<br>Wave', sub:'From the basics to real-world practice', by:'by Noraset Boikaw (Focus)',
      fw:'Foreword', toc:'Contents', ch:'Chapter', edition:'2026 edition', copyH:'Copyright and licence', forWho:'Personal copy of', copyNo:'Copy no.', scan:'Scan to visit the website',
      fwbody:['This book collects every lesson from the Elliott Wave Classroom on SPACEZ TERMINAL in one place, so students can review anywhere, even offline.', 'The material runs from the basics to advanced topics: motive and corrective patterns, rules and guidelines, Fibonacci, alternate counts, recounting when price breaks a rule, and practical application. Every chapter is illustrated so the patterns are easy to see.', 'Always remember: the wave principle is a way to organise possibilities, not a crystal ball. Use it together with sound risk management.', 'Educational material only — not investment advice.'],
      sign:'Noraset Boikaw (Focus)', foot:'Personal copy of {n} · {id} · do not share' }
  };
  function qrSVG(text){
    try { if(typeof qrcode === 'function'){ var q = qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize:4, margin:4, scalable:true }); } } catch(e){}
    return '';
  }
  function isSafari(){ var u = navigator.userAgent; return /safari/i.test(u) && !/chrome|chromium|crios|edg|opr|android/i.test(u); }
  /* the cover is drawn on a canvas and printed as a picture, so every browser
     prints the same colours (CSS gradients and "print backgrounds" no longer matter) */
  function coverPNG(rec, TX){
    var W = 1654, H = 2339, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, W * 0.55, H); g.addColorStop(0, '#071120'); g.addColorStop(0.55, '#0a1c33'); g.addColorStop(1, '#06101d');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var rg = x.createRadialGradient(W * 0.85, H * 0.08, 0, W * 0.85, H * 0.08, W * 0.75); rg.addColorStop(0, 'rgba(26,90,140,.75)'); rg.addColorStop(1, 'rgba(15,58,92,0)');
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
    var mm = W / 210, L = 18 * mm, FT = '"Noto Sans Thai", "Inter", sans-serif', MONO = '"IBM Plex Mono", monospace';
    x.textBaseline = 'alphabetic';
    x.fillStyle = '#22c3f2'; x.font = '700 ' + Math.round(4.6 * mm) + 'px ' + MONO; try { x.letterSpacing = Math.round(1.6 * mm) + 'px'; } catch(e){}
    x.fillText('SPACEZ TERMINAL', L, 30 * mm);
    try { x.letterSpacing = '0px'; } catch(e){}
    x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '500 ' + Math.round(4.2 * mm) + 'px ' + MONO; x.textAlign = 'right'; x.fillText(TX.edition, W - L, 30 * mm); x.textAlign = 'left';
    /* kicker pill */
    x.font = '700 ' + Math.round(5.2 * mm) + 'px ' + FT; var kw = x.measureText(TX.kick).width + 8 * mm, ky = 72 * mm;
    x.fillStyle = '#22c3f2'; if(x.roundRect){ x.beginPath(); x.roundRect(L, ky, kw, 10 * mm, 2 * mm); x.fill(); } else x.fillRect(L, ky, kw, 10 * mm);
    x.fillStyle = '#071120'; x.fillText(TX.kick, L + 4 * mm, ky + 7.1 * mm);
    /* title */
    x.fillStyle = '#fff'; x.font = '900 ' + Math.round(30 * mm) + 'px ' + FT;
    TX.big.split('<br>').forEach(function(line, i){ x.fillText(line, L - 1 * mm, ky + 42 * mm + i * 32 * mm); });
    x.font = '500 ' + Math.round(6.4 * mm) + 'px ' + FT; x.fillStyle = 'rgba(255,255,255,.88)'; x.fillText(TX.sub, L, ky + 88 * mm);
    /* the wave */
    var P = [[0, 270], [120, 170], [170, 205], [330, 70], [380, 120], [470, 30], [560, 150], [600, 110], [760, 250], [800, 230]], bx = 0, by = 176 * mm, bw = W, bh = 80 * mm;
    function px(p){ return [bx + p[0] / 800 * bw, by + p[1] / 300 * bh]; }
    var wg = x.createLinearGradient(0, by, 0, by + bh); wg.addColorStop(0, 'rgba(34,195,242,.42)'); wg.addColorStop(1, 'rgba(34,195,242,0)');
    x.beginPath(); P.forEach(function(p, i){ var q = px(p); if(i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }); x.lineTo(W, by + bh + 4 * mm); x.lineTo(0, by + bh + 4 * mm); x.closePath(); x.fillStyle = wg; x.fill();
    x.beginPath(); P.forEach(function(p, i){ var q = px(p); if(i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }); x.strokeStyle = '#22c3f2'; x.lineWidth = 1.4 * mm; x.lineJoin = 'round'; x.stroke();
    x.fillStyle = '#fff'; x.font = '700 ' + Math.round(6.5 * mm) + 'px ' + MONO; x.textAlign = 'center';
    [['1', 120, 150], ['2', 170, 236], ['3', 330, 52], ['4', 380, 150], ['5', 470, 14], ['A', 560, 180], ['B', 600, 92], ['C', 760, 282]].forEach(function(t){ var q = px([t[1], t[2]]); x.fillText(t[0], q[0], q[1]); });
    x.textAlign = 'left';
    /* author and recipient */
    x.fillStyle = '#fff'; x.font = '800 ' + Math.round(7 * mm) + 'px ' + FT; x.fillText(TX.by, L, H - 26 * mm);
    var bg2 = x.createLinearGradient(L, 0, L + 50 * mm, 0); bg2.addColorStop(0, '#22c3f2'); bg2.addColorStop(1, '#21c07a'); x.fillStyle = bg2; x.fillRect(L, H - 21 * mm, 50 * mm, 1.3 * mm);
    x.fillStyle = 'rgba(255,255,255,.78)'; x.font = '500 ' + Math.round(4.4 * mm) + 'px ' + FT; x.fillText(TX.forWho + ' ' + printName(rec) + '  ·  ' + rec.id, L, H - 12 * mm);
    return c.toDataURL('image/jpeg', 0.92);
  }
  function dotPatternSVG(serial){
    var t = dotTileSVG(serial), inner = t.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''), w = DOT.cols * DOT.step, h = DOT.rows * DOT.step;
    return '<svg class="eb-dots" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none"><defs><pattern id="ebdp" width="' + w + '" height="' + h + '" patternUnits="userSpaceOnUse">' + inner + '</pattern></defs><rect width="100%" height="100%" fill="url(#ebdp)"/></svg>';
  }
  function fetchContent(){
    return fetch(WORKER_BASE + '/api/classroom/content', { headers:{ 'X-Admin-Key':key() } }).then(function(r){ if(!r.ok) throw new Error('st' + r.status); return r.json(); }).then(function(d){ return d.content || {}; });
  }
  function printName(r){ return (r.accepted && r.accepted.typedName) || r.name; }
  function buildBook(rec, content){
    var lang = rec.lang === 'en' ? 'en' : 'th', TX = BOOK[lang], B = window.__SPZ_EWV_BOOK;
    var tree = (B && B.tree) || [], title = function(id){ var t = B && B.title(id); return t ? (t[lang] || t.en) : id; };
    var chapters = [], n = 0;
    tree.forEach(function(item){
      if(item.id === 'practice') return;
      if(!(content[item.id] && content[item.id][lang])) return;
      n++; chapters.push([String(n), item.id, 0]);
      var j = 0; (item.children || []).forEach(function(ch){ if(ch === 'practice' || !(content[ch] && content[ch][lang])) return; j++; chapters.push([n + '.' + j, ch, 1]); });
    });
    if(!chapters.length) return null;
    var nm = esc(printName(rec)), id = esc(rec.id), zw = zwEncode(rec.id), qrUrl = SITE + 'ebook.html#v=' + rec.id;
    var toc = chapters.map(function(c){ return '<div class="eb-toc-r l' + c[2] + '"><span class="tn">' + c[0] + '</span><span class="tt">' + esc(title(c[1])) + '</span></div>'; }).join('');
    var body = chapters.map(function(c, i){
      var html = String(content[c[1]][lang]).replace(/data-ewv-practice/g, 'data-x');
      html = applyWording(html, lang, rec.seed >>> 0);
      /* zero-width code after the first sentence-ish chunk of each chapter */
      html = html.replace(/(<p[^>]*>)([^<]{12,}?)([\s.,;:)])/, function(_, a, b, c2){ return a + b + zw + c2; });
      /* the copy code, in invisible text, at the end of every paragraph and table cell:
         any paragraph copied out of the PDF carries it along */
      html = html.replace(/<\/(p|li|td)>/g, '<span class="eb-g2"> ' + id + '</span></$1>');
      return '<div class="eb-chap' + (c[2] ? ' sub' : '') + '"><span class="eb-ghost">SPZ ' + id + ' #' + rec.serial + ' ' + nm + '</span><div class="eb-ch-head"><span class="eb-ch-n">' + esc(TX.ch) + ' ' + c[0] + '</span><h1>' + esc(title(c[1])) + '</h1></div>' +
        '<div class="ewv-gl-shell"><div class="gl-detail-body">' + html + '</div></div></div>';
    }).join('');
    var terms = termsText(lang, rec.name, rec.title || 'Elliott Wave Classroom', rec.id).map(function(t, i){ return '<li>' + esc(t) + '</li>'; }).join('');
    /* background image (one tiny tile, repeated) keeps the PDF small; print-color-adjust:exact makes Chrome print it even with "background graphics" off */
    var dots = "url('data:image/svg+xml;utf8," + encodeURIComponent(dotTileSVG(rec.serial)) + "')";
    return '<div class="eb-dots" style="background-image:' + dots + '"></div>' +
      '<div class="eb-cover"><img class="eb-cover-img" alt="" src="' + rec.__cover + '"></div>' +
      '<div class="eb-fw"><h2>' + esc(TX.fw) + '</h2>' + TX.fwbody.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('') + '<div class="sg">' + esc(TX.sign) + '</div></div>' +
      '<div class="eb-copy"><h2>' + esc(TX.copyH) + '</h2><p class="cpy">© 2569 / 2026 Noraset Boikaw · SPACEZ TERMINAL. All rights reserved. สงวนลิขสิทธิ์</p>' +
        '<div class="eb-lic"><div class="who"><span>' + esc(TX.forWho) + '</span><b>' + nm + '</b><span>' + esc(TX.copyNo) + '</span><b class="mono">' + id + '</b></div><ol>' + terms + '</ol></div>' +
        '<div class="eb-orn"><svg viewBox="0 0 300 120" class="orn"><g fill="none" stroke="#0a78c2" stroke-width="1.2" opacity=".55"><path d="M10 60 C60 10, 100 110, 150 60 S240 10, 290 60"/><path d="M10 60 C60 110, 100 10, 150 60 S240 110, 290 60"/><circle cx="150" cy="60" r="44"/><circle cx="150" cy="60" r="52" stroke-dasharray="2 4"/></g></svg>' +
          '<div class="eb-qr">' + qrSVG(qrUrl) + '</div><span class="eb-qrcap">' + esc(TX.scan) + '</span></div>' +
        '<p class="eb-verify">' + (lang === 'th' ? 'ตรวจสอบว่าเป็นฉบับที่ออกโดย SPACEZ TERMINAL จริง ได้ที่ ' : 'Check that this is a genuine SPACEZ TERMINAL copy at ') + 'spacez001.github.io/TERMINAL/ebook.html</p></div>' +
      '<div class="eb-tocp"><h2>' + esc(TX.toc) + '</h2>' + toc + '</div>' + body;
  }
  function cssStr(t){ return '"' + String(t).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  /* running header/footer live in the page margins (Chrome page-margin boxes), so they never cover the text */
  function ebPageCSS(rec, TX){
    var f = 'font-family:"IBM Plex Mono","Noto Sans Thai",monospace;font-size:7.5pt;color:#8a92a0;', ft = 'font-family:"Noto Sans Thai","Inter",sans-serif;font-size:7.5pt;color:#8a92a0;';
    return '@page{size:A4;margin:18mm 16mm 19mm !important;' +
      '@top-left{content:' + cssStr('SPACEZ TERMINAL · ' + TX.title) + ';' + ft + 'vertical-align:bottom;padding-bottom:3mm;}' +
      '@top-right{content:' + cssStr(dotLine(rec.serial)) + ';' + f + 'color:#b4bbc7;letter-spacing:.6pt;vertical-align:bottom;padding-bottom:3mm;}' +
      '@bottom-left{content:' + cssStr(TX.foot.replace('{n}', printName(rec)).replace('{id}', rec.id)) + ';' + ft + 'vertical-align:top;padding-top:3mm;}' +
      '@bottom-right{content:counter(page);' + f + 'vertical-align:top;padding-top:3mm;}}' +
      '@page ebcover{size:A4;margin:0 !important;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}' +
      'body.spz-printing-ebook>*:not(#spzEbook){display:none!important;}html,body.spz-printing-ebook{background:#fff!important;}';
  }
  function printBook(rec){
    if(!window.__SPZ_EWV_BOOK) return Promise.reject(new Error('nobook'));
    var lang = rec.lang === 'en' ? 'en' : 'th';
    var fonts = (document.fonts && document.fonts.load) ? Promise.all(['900 120px "Noto Sans Thai"', '700 20px "Noto Sans Thai"', '700 20px "IBM Plex Mono"'].map(function(f){ return document.fonts.load(f).catch(function(){}); })) : Promise.resolve();
    return fonts.then(fetchContent).then(function(content){
      rec.__cover = coverPNG(rec, BOOK[lang]);
      var html = buildBook(rec, content);
      if(!html) throw new Error('nocontent');
      var old = document.getElementById('spzEbook'); if(old) old.remove();
      var box = document.createElement('div'); box.id = 'spzEbook'; box.className = 'spz-ebook lang-' + rec.lang + (isSafari() ? ' safari' : ''); box.innerHTML = html;
      document.body.appendChild(box);
      var stl = document.createElement('style'); stl.id = 'spzEbookPage'; stl.textContent = ebPageCSS(rec, BOOK[lang]); document.body.appendChild(stl);
      var prevTitle = document.title;
      document.title = 'SPZ-EB-' + rec.id.replace(/^EB-/, '') + '-' + safeName(rec.name);
      document.body.classList.add('spz-printing-ebook');
      function done(){ document.body.classList.remove('spz-printing-ebook'); document.title = prevTitle; var s = document.getElementById('spzEbookPage'); if(s) s.remove(); var b = document.getElementById('spzEbook'); if(b) b.remove(); window.removeEventListener('afterprint', done); }
      window.addEventListener('afterprint', done);
      /* give fonts and SVGs a moment to lay out */
      return new Promise(function(res){ setTimeout(function(){ window.print(); setTimeout(res, 300); }, 900); });
    });
  }
  /* evidence report: everything about one copy, laid out for a lawyer or a court.
     If it is opened from "Find the owner", what was found is attached as an exhibit. */
  function printEvidence(r, exhibit){
    var th = (r.lang || 'th') !== 'en', W2 = function(a, b){ return th ? a : b; };
    var terms = termsText(th ? 'th' : 'en', r.name, r.title || 'Elliott Wave Classroom', r.id);
    sha256Hex(terms.join('\n')).then(function(hash){
      var a = r.accepted || null, now = Date.now(), docNo = 'EVD-' + r.id.replace(/^EB-/, '') + '-' + new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
      var bits = (PAIRS[th ? 'th' : 'en'] || []).map(function(p, k){ return esc(bit(r.seed >>> 0, k) ? p[1] : p[0]); }).join(' · ');
      function row(k, v, cls){ return '<tr><th>' + k + '</th><td' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</td></tr>'; }
      var tl = [[r.createdAt, W2('ลงทะเบียนผู้รับและออกเลขที่ฉบับ ', 'Recipient registered, copy code issued ') + esc(r.id)]];
      if(r.fileAt) tl.push([r.fileAt, W2('อัปโหลดไฟล์ฉบับเฉพาะคน ', 'Personal file uploaded ') + Math.round((r.fileSize || 0) / 1024) + ' KB' + (r.fileSha256 ? ' · SHA-256 ' + esc(r.fileSha256.slice(0, 16)) + '…' : '')]);
      if(a) tl.push([a.at, W2('ผู้รับเปิดลิงก์ส่วนตัว พิมพ์ชื่อ "', 'Recipient opened the private link, typed "') + esc(a.typedName) + W2('" และกดยอมรับเงื่อนไข', '" and accepted the terms')]);
      (r.downloads || []).forEach(function(d){ tl.push([d.at, W2('ดาวน์โหลดไฟล์ จาก IP ', 'File downloaded from IP ') + esc(d.ip) + (d.country ? ' (' + esc(d.country) + ')' : '')]); });
      if(exhibit) tl.push([exhibit.at, W2('พบสำเนาที่ถูกเผยแพร่ และระบบระบุว่าเป็นฉบับนี้ ด้วยวิธี: ', 'A shared copy was found and identified as this copy by: ') + esc(exhibit.via || '')]);
      tl.sort(function(x, y){ return x[0] - y[0]; });
      var ex = '';
      if(exhibit){
        ex = '<div class="ev-ex">' + (exhibit.kind === 'image' ? '<img src="' + exhibit.img + '" alt="">' : exhibit.kind === 'text' ? '<pre>' + esc(exhibit.text) + '</pre>' : '') +
          '<table class="ev-t">' + row(W2('ประเภท', 'Type'), esc(exhibit.kind === 'image' ? W2('รูปภาพ / ภาพหน้าจอ', 'Picture / screenshot') : exhibit.kind === 'pdf' ? 'PDF' : W2('ข้อความ', 'Text'))) +
          (exhibit.name ? row(W2('ชื่อไฟล์ที่พบ', 'File found'), esc(exhibit.name)) : '') + (exhibit.sha ? row('SHA-256', esc(exhibit.sha) + (r.fileSha256 ? (exhibit.sha === r.fileSha256 ? ' <b class="ok">' + W2('ตรงกับไฟล์ที่แจกทุกไบต์', 'identical to the file given out') + '</b>' : ' <span class="dim">' + W2('ไม่ตรงทุกไบต์ (ไฟล์ถูกแก้หรือบันทึกใหม่)', 'not byte-identical (edited or re-saved)') + '</span>') : ''), 's m') : '') +
          row(W2('ระบุตัวตนด้วย', 'Identified by'), esc(exhibit.via || '—')) + row(W2('ตรวจเมื่อ', 'Checked at'), esc(fmtDate(exhibit.at))) + '</table></div>';
      }
      var html = '<div class="ev2">' +
        '<div class="ev2-h"><div><div class="ev2-brand">SPACEZ TERMINAL</div><h1>' + W2('รายงานหลักฐานการแจกจ่ายเอกสารลิขสิทธิ์', 'Copyright document distribution evidence report') + '</h1></div>' +
          '<div class="ev2-no"><span>' + W2('เลขที่รายงาน', 'Report no.') + '</span><b>' + docNo + '</b><span>' + W2('จัดทำเมื่อ', 'Prepared') + '</span><b>' + esc(fmtDate(now)) + '</b></div></div>' +
        '<table class="ev2-memo"><tr><th>' + W2('เรื่อง', 'Subject') + '</th><td>' + W2('หลักฐานการแจกจ่ายและการยอมรับเงื่อนไขการใช้งานอันมีลิขสิทธิ์ ฉบับเลขที่ ', 'Evidence of distribution and licence acceptance for copy ') + esc(r.id) + '</td></tr>' +
          '<tr><th>' + W2('เจ้าของลิขสิทธิ์', 'Copyright owner') + '</th><td>' + W2('นรเศรษฐ์ บ่อแก้ว (SPACEZ TERMINAL)', 'Noraset Boikaw (SPACEZ TERMINAL)') + '</td></tr>' +
          '<tr><th>' + W2('แหล่งข้อมูล', 'Source') + '</th><td>' + W2('ทะเบียนแจกอีบุ๊กของระบบ (บันทึกอัตโนมัติบนเซิร์ฟเวอร์ ณ เวลาที่เกิดเหตุการณ์)', 'The system ebook registry (recorded automatically on the server when each event happened)') + '</td></tr></table>' +
        '<div class="ev2-sum"><div><span>' + W2('งาน', 'Work') + '</span><b>' + esc(r.title || 'Elliott Wave Classroom') + '</b></div><div><span>' + W2('ผู้รับ', 'Recipient') + '</span><b>' + esc(r.name) + '</b></div>' +
          '<div><span>' + W2('เลขที่ฉบับ', 'Copy code') + '</span><b class="m">' + esc(r.id) + ' · #' + r.serial + '</b></div>' +
          '<div><span>' + W2('สถานะการยอมรับเงื่อนไข', 'Terms') + '</span><b class="' + (a ? 'ok' : 'bad') + '">' + (a ? W2('ยอมรับแล้ว ', 'Accepted ') + esc(fmtDate(a.at)) : W2('ยังไม่ได้ยอมรับ', 'Not accepted yet')) + '</b></div>' +
          '<div><span>' + W2('ดาวน์โหลด', 'Downloads') + '</span><b>' + (r.downloads || []).length + '</b></div>' + (r.revoked ? '<div><span>' + W2('สิทธิ์', 'Licence') + '</span><b class="bad">' + W2('ถูกยกเลิก', 'Revoked') + '</b></div>' : '') + '</div>' +
        (a ? '' : '<p class="ev2-warn">' + W2('ผู้รับยังไม่ได้เปิดลิงก์และกดยอมรับเงื่อนไข ช่องเวลา IP อุปกรณ์ และชื่อที่พิมพ์ยืนยัน จะมีข้อมูลหลังผู้รับกดยอมรับเท่านั้น หลักฐานส่วนนี้จึงยังไม่สมบูรณ์', 'The recipient has not opened the link and accepted the terms yet, so time, IP, device and typed name are empty. This part of the evidence is incomplete.') + '</p>') +
        '<h2>1 · ' + W2('ลำดับเหตุการณ์', 'Timeline') + '</h2><ol class="ev2-tl">' + tl.map(function(t){ return '<li><time>' + esc(fmtDate(t[0])) + '</time><span>' + t[1] + '</span></li>'; }).join('') + '</ol>' +
        '<h2>2 · ' + W2('ข้อมูลผู้รับและการยอมรับเงื่อนไข', 'Recipient and acceptance') + '</h2><table class="ev-t">' +
          row(W2('ชื่อผู้รับ (ที่แอดมินบันทึก)', 'Recipient (as registered)'), esc(r.name)) + row(W2('ช่องทางติดต่อ', 'Contact'), esc(r.contact || '—')) + row(W2('หมายเหตุ', 'Note'), esc(r.note || '—')) +
          row(W2('ชื่อที่ผู้รับพิมพ์ยืนยันเอง', 'Name typed by the recipient'), esc(a ? a.typedName : '—')) + (a && a.typedContact ? row(W2('ช่องทางติดต่อที่ผู้รับกรอก', 'Contact typed by the recipient'), esc(a.typedContact)) : '') + row(W2('วันเวลาที่ยอมรับ', 'Accepted at'), esc(a ? fmtDate(a.at) : '—')) +
          row(W2('หมายเลข IP · ประเทศ', 'IP address · country'), esc(a ? (a.ip || '—') + ' · ' + (a.country || '—') : '—'), 'm') + row(W2('อุปกรณ์ / เบราว์เซอร์', 'Device / browser'), esc(a ? a.ua : '—'), 's') +
          row(W2('ฉบับของเงื่อนไข', 'Terms version'), esc(a ? a.termsVersion : TERMS_VERSION), 'm') +
          row(W2('รหัส SHA-256 ของข้อความเงื่อนไข', 'SHA-256 of the terms text'), esc(hash) + (a && a.termsHash ? (a.termsHash === hash ? ' <b class="ok">✓ ' + W2('ตรงกับที่ผู้รับเห็นตอนกดยอมรับ', 'matches what the recipient saw') + '</b>' : ' <b class="bad">≠ ' + esc(a.termsHash) + '</b>') : ''), 's m') + '</table>' +
        '<p class="ev2-note">' + W2('SHA-256 คือ "ลายนิ้วมือ" ของข้อความ ถ้าแก้แม้แต่ตัวอักษรเดียว รหัสจะเปลี่ยนทั้งหมด ระบบบันทึกรหัสของข้อความที่ผู้รับเห็นจริงตอนกดยอมรับ การที่รหัสตรงกันแสดงว่าเงื่อนไขในรายงานนี้คือข้อความเดียวกับที่ผู้รับยอมรับ ไม่ได้ถูกแก้ภายหลัง ใครก็ตรวจซ้ำได้ด้วยเครื่องมือ SHA-256 ทั่วไป', 'SHA-256 is a fingerprint of the text: changing a single character changes the whole code. The system stored the code of the exact text the recipient saw when accepting; a match shows the terms in this report are the ones accepted, unchanged. Anyone can re-check it with any SHA-256 tool.') + '</p>' +
        '<div class="ev2-keep"><h3>' + W2('ข้อความเงื่อนไขที่ผู้รับยอมรับ', 'Terms the recipient accepted') + '</h3><ol class="ev-terms">' + terms.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ol></div>' +
        '<h2>3 · ' + W2('ไฟล์ที่แจกและเครื่องหมายระบุตัวตนในเอกสาร', 'The file given out and its identifying marks') + '</h2><table class="ev-t">' +
          row(W2('ไฟล์ที่อัปโหลด', 'File uploaded'), esc(r.fileAt ? fmtDate(r.fileAt) + ' · ' + Math.round((r.fileSize || 0) / 1024) + ' KB' : '—')) + row(W2('SHA-256 ของไฟล์', 'SHA-256 of the file'), esc(r.fileSha256 || W2('— (ไฟล์อัปโหลดก่อนระบบบันทึกค่านี้)', '— (uploaded before this was recorded)')), 's m') +
          row('1. ' + W2('ชื่อและเลขที่ฉบับ ท้ายกระดาษทุกหน้า หน้าปก หน้าลิขสิทธิ์ (มองเห็นได้)', 'Name and copy code in the footer of every page, on the cover and the copyright page (visible)'), esc(printName(r) + ' · ' + r.id)) +
          row('1A. ' + W2('แถบจุดไข่ปลา หัวกระดาษมุมขวาทุกหน้า (● = 1, • = 0 เข้ารหัสเลขลำดับ อ่านได้จากภาพหน้าจอ)', 'Dotted line in the top-right header of every page (● = 1, • = 0, encodes the serial; readable from a screenshot)'), esc(dotLine(r.serial)), 'm') +
          row('2. ' + W2('ลายจุดพื้นหลังทุกหน้า (เข้ารหัสเลขลำดับ)', 'Background dot pattern on every page (encodes the serial)'), '#' + r.serial, 'm') +
          row('3. ' + W2('QR ในลายตกแต่งหน้าลิขสิทธิ์', 'QR in the copyright-page ornament'), esc(SITE + 'ebook.html#v=' + r.id), 's m') +
          row('4. ' + W2('ตัวอักษรล่องหนท้ายทุกย่อหน้า + ชื่อในข้อมูลไฟล์', 'Invisible text after every paragraph + PDF title'), esc(r.id + ' · SPZ-EB-' + r.id.replace(/^EB-/, ''))) +
          row('5. ' + W2('ถ้อยคำเฉพาะของฉบับนี้', 'Wording fingerprint'), bits, 's') + '</table>' +
        '<h2>4 · ' + W2('หลักฐานที่พบ', 'Evidence found') + '</h2>' + (ex || '<p class="ev2-note">' + W2('ยังไม่ได้แนบ ถ้าพบไฟล์หรือภาพที่หลุด ให้ตรวจในแท็บ "ตรวจหาเจ้าของ" แล้วกด "เอกสารหลักฐาน" จากผลที่พบ ระบบจะแนบสิ่งที่พบมาในหน้านี้ให้เอง', 'Nothing attached. Check the leaked file in "Find the owner" and press "Evidence sheet" on the result to attach it here.') + '</p>') +
        '<h2>5 · ' + W2('ข้อสังเกตทางกฎหมายเบื้องต้น', 'Preliminary legal notes') + '</h2><ul class="ev2-law">' +
          '<li>' + W2('พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537 มาตรา 27: การทำซ้ำ ดัดแปลง หรือเผยแพร่ต่อสาธารณชน ซึ่งงานอันมีลิขสิทธิ์โดยไม่ได้รับอนุญาต ถือเป็นการละเมิดลิขสิทธิ์', 'Thai Copyright Act B.E. 2537, section 27: reproducing, adapting or communicating a copyright work to the public without permission is infringement.') + '</li>' +
          '<li>' + W2('พ.ร.บ.ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 มาตรา 11: ห้ามปฏิเสธการรับฟังข้อมูลอิเล็กทรอนิกส์เป็นพยานหลักฐาน เพียงเพราะเป็นข้อมูลอิเล็กทรอนิกส์', 'Electronic Transactions Act B.E. 2544, section 11: electronic data may not be refused as evidence merely because it is electronic.') + '</li>' +
          '<li>' + W2('เงื่อนไขที่ผู้รับกดยอมรับเป็นข้อตกลงอนุญาตให้ใช้สิทธิ์ (ใช้ส่วนตัว ห้ามเผยแพร่) การเผยแพร่ต่อจึงอาจเป็นทั้งการละเมิดลิขสิทธิ์และการผิดข้อตกลง', 'The accepted terms are a licence (personal use, no sharing), so sharing may be both infringement and a breach of that agreement.') + '</li>' +
          '<li>' + W2('ควรเก็บต้นฉบับไฟล์ ร่างงาน และหลักฐานที่พบ (ลิงก์ ภาพหน้าจอพร้อมวันเวลา) ไว้ครบ รายงานนี้ไม่ใช่คำแนะนำทางกฎหมาย ควรให้ทนายตรวจก่อนดำเนินคดี หรือปรึกษาศูนย์ IPAC กรมทรัพย์สินทางปัญญา โทร 1368', 'Keep the original files, drafts and what you found (links, dated screenshots). This report is not legal advice; have a lawyer review it, or contact the DIP IPAC centre (1368).') + '</li></ul>' +
        '<h2>6 · ' + W2('วิธีตรวจสอบซ้ำโดยบุคคลที่สาม', 'How a third party can re-check this') + '</h2><ol class="ev-terms">' +
          '<li>' + W2('สแกน QR ในหน้าลิขสิทธิ์ของสำเนาที่พบ จะได้ลิงก์ที่มีเลขที่ฉบับ ', 'Scan the QR on the copyright page of the copy found; the link carries copy code ') + esc(r.id) + '</li>' +
          '<li>' + W2('คัดลอกย่อหน้าใดก็ได้จากสำเนาที่พบ ข้อความที่วางได้จะมีเลขที่ฉบับติดมา', 'Copy any paragraph from the copy found; the pasted text contains the copy code') + '</li>' +
          '<li>' + W2('คำนวณ SHA-256 ของไฟล์ที่พบ แล้วเทียบกับค่าในข้อ 3 หรือเปิดหน้าตรวจสอบสาธารณะ ', 'Compute the SHA-256 of the file found and compare it with section 3, or use the public check page ') + '<span class="m">' + esc(SITE + 'ebook.html') + '</span>' + W2(' ลากไฟล์ไปวาง ระบบจะบอกว่าตรงกับไฟล์ที่ออกให้หรือไม่ (ไม่แสดงชื่อผู้รับ)', ': drop the file there and it says whether it is the file that was issued (the recipient name is not shown)') + '</li></ol>' +
        '<div class="ev2-sign"><div><span></span><b>' + W2('ผู้จัดทำรายงาน', 'Prepared by') + '</b><em>' + W2('นรเศรษฐ์ บ่อแก้ว (เจ้าของลิขสิทธิ์)', 'Noraset Boikaw (copyright owner)') + '</em></div><div><span></span><b>' + W2('พยาน', 'Witness') + '</b><em>&nbsp;</em></div><div><span></span><b>' + W2('วันที่', 'Date') + '</b><em>&nbsp;</em></div></div>' +
        '<p class="ev2-foot">' + docNo + ' · SPACEZ TERMINAL · ' + W2('รายงานสร้างอัตโนมัติจากทะเบียนแจกอีบุ๊ก', 'generated from the ebook registry') + '</p></div>';
      var old = document.getElementById('spzEbook'); if(old) old.remove();
      var box = document.createElement('div'); box.id = 'spzEbook'; box.className = 'spz-ebook ev'; box.innerHTML = html; document.body.appendChild(box);
      var stl = document.createElement('style'); stl.id = 'spzEbookPage'; stl.textContent = '@page{size:A4;margin:16mm 16mm 18mm !important;@bottom-left{content:' + cssStr(docNo + ' · SPACEZ TERMINAL') + ';font:8pt "IBM Plex Mono",monospace;color:#8a92a0;vertical-align:top;padding-top:3mm;}@bottom-right{content:' + cssStr(W2('หน้า ', 'Page ')) + ' counter(page) " / " counter(pages);font:8pt "Noto Sans Thai","IBM Plex Mono",sans-serif;color:#8a92a0;vertical-align:top;padding-top:3mm;}}body.spz-printing-ebook>*:not(#spzEbook){display:none!important;}html,body.spz-printing-ebook{background:#fff!important;}'; document.body.appendChild(stl);
      var prevTitle = document.title; document.title = 'SPZ-EBEV-' + r.id.replace(/^EB-/, '') + '-' + safeName(r.name);
      document.body.classList.add('spz-printing-ebook');
      function done(){ document.body.classList.remove('spz-printing-ebook'); document.title = prevTitle; var s2 = document.getElementById('spzEbookPage'); if(s2) s2.remove(); var b = document.getElementById('spzEbook'); if(b) b.remove(); window.removeEventListener('afterprint', done); }
      window.addEventListener('afterprint', done);
      setTimeout(function(){ window.print(); }, 400);
    });
  }

  /* ------------------------------------------------------------------
     Owner finder
     ------------------------------------------------------------------ */
  function byId(id){ return (S.list || []).filter(function(r){ return r.id === id; })[0]; }
  function bySerial(n){ return (S.list || []).filter(function(r){ return r.serial === n; })[0]; }
  function analyseText(text){
    var hits = [], seen = {};
    function add(r, via, extra){ if(!r) return; var k = r.id + via; if(seen[k]) return; seen[k] = 1; hits.push({ r:r, via:via, extra:extra || '' }); }
    (text.match(/EB-[A-Z0-9]{6}/g) || []).forEach(function(c){ add(byId(c), 'vCode'); });
    zwDecodeAll(text).forEach(function(c){ var m = /EB-[A-Z0-9]{6}/.exec(c); if(m) add(byId(m[0]), 'vZw'); });
    var m2 = /SPZ-EB-([A-Z0-9]{6})/.exec(text); if(m2) add(byId('EB-' + m2[1]), 'vMeta');
    decodeLineText(text).forEach(function(se){ add(bySerial(se), 'vLine'); });
    var lang = /[฀-๿]/.test(text) ? 'th' : 'en', wb = wordingBits(text, lang), known = wb.filter(function(x){ return x != null; }).length;
    if(known >= 3){
      var scored = (S.list || []).filter(function(r){ return (r.lang || 'th') === lang; }).map(function(r){
        var ok = 0, n = 0; wb.forEach(function(b, k){ if(b == null) return; n++; if(b === bit(r.seed >>> 0, k)) ok++; }); return { r:r, ok:ok, n:n };
      }).sort(function(a, b){ return b.ok - a.ok; });
      if(scored.length && scored[0].ok === scored[0].n && (!scored[1] || scored[1].ok < scored[0].ok)) add(scored[0].r, 'vWord', scored[0].ok + '/' + scored[0].n);
      else if(scored.length && scored[0].ok >= scored[0].n - 1 && scored[0].n >= 5 && (!scored[1] || scored[1].ok < scored[0].ok)) add(scored[0].r, 'vWord', scored[0].ok + '/' + scored[0].n);
    }
    return hits;
  }
  function loadScript(src){ return new Promise(function(res, rej){ var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function pdfText(file){
    var P = window.pdfjsLib ? Promise.resolve() : loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    return P.then(function(){
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      return file.arrayBuffer();
    }).then(function(buf){ return window.pdfjsLib.getDocument({ data:buf }).promise; }).then(function(doc){
      var out = [], meta = '';
      var chain = doc.getMetadata().then(function(m){ meta = (m && m.info && (m.info.Title || '')) || ''; }).catch(function(){});
      for(var i = 1; i <= doc.numPages; i++) (function(i){ chain = chain.then(function(){ return doc.getPage(i); }).then(function(pg){ return pg.getTextContent(); }).then(function(tc){ out.push(tc.items.map(function(it){ return it.str; }).join('')); }); })(i);
      return chain.then(function(){ return meta + '\n' + out.join('\n'); });
    });
  }
  function qrFromImage(img){
    function canvasAt(scale, pad){
      var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale), p = Math.round(Math.max(w, h) * pad);
      var c = document.createElement('canvas'); c.width = w + p * 2; c.height = h + p * 2; var x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, p, p, w, h); return c;
    }
    var big = Math.max(img.naturalWidth, img.naturalHeight), scales = [Math.min(1, 1800 / big), Math.min(1, 900 / big), Math.min(2, 600 / big)];
    var native = ('BarcodeDetector' in window) ? new window.BarcodeDetector({ formats:['qr_code'] }) : null;
    var tryNative = native ? native.detect(canvasAt(scales[0], 0.12)).then(function(r){ return r && r[0] ? r[0].rawValue : null; }).catch(function(){ return null; }) : Promise.resolve(null);
    return tryNative.then(function(v){
      if(v) return v;
      var P = window.jsQR ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js');
      return P.then(function(){
        for(var k = 0; k < scales.length; k++){
          var c = canvasAt(scales[k], 0.12), d = c.getContext('2d').getImageData(0, 0, c.width, c.height), r = window.jsQR(d.data, c.width, c.height, { inversionAttempts:'attemptBoth' });
          if(r && r.data) return r.data;
        }
        return null;
      });
    });
  }
  /* automatic dot reader: find the faint dots, find a top-left marker (a dot
     with a small companion to its right), size the grid from it, check the
     other three corners, read the 48 cells and keep only results whose two
     copies both pass the checksum and agree */
  /* the dotted code line in the page header: a row of evenly spaced dots, big = 1, small = 0 */
  function lineFromBlobs(all){
    var srt = all.filter(function(b){ return b.w <= b.h * 1.6 && b.h <= b.w * 1.6; }).sort(function(a, b){ return a.y - b.y; }), rows = [], cur = [];
    srt.forEach(function(b){ if(cur.length && b.y - cur[cur.length - 1].y > Math.max(1.5, b.h * 0.35)){ rows.push(cur); cur = []; } cur.push(b); }); if(cur.length) rows.push(cur);
    var found = {}, best = null;
    rows.forEach(function(row){
      if(row.length < 28) return;
      row.sort(function(a, b){ return a.x - b.x; });
      for(var i = 0; i + 28 <= row.length; i++){
        var step = row[i + 1].x - row[i].x; if(step < 2) continue;
        var run = [row[i]], j = i + 1;
        while(j < row.length && Math.abs(row[j].x - run[run.length - 1].x - step) < step * 0.22){ run.push(row[j]); j++; }
        if(run.length < 28) continue;
        var ns = run.map(function(b){ return b.n; }), lo = Math.min.apply(null, ns), hi = Math.max.apply(null, ns);
        if(hi < lo * 1.5) continue;
        var th = (lo + hi) / 2, str = run.map(function(b){ return b.n > th ? '●' : '•'; }).join('');
        decodeLineText(str).forEach(function(se){ found[se] = (found[se] || 0) + 1; if(!best || found[se] > found[best]) best = se; });
        i = j - 1;
      }
    });
    return best;
  }
  function autoDots(img){
    var big = Math.max(img.naturalWidth, img.naturalHeight), sc = Math.min(1, 3000 / big), W = Math.round(img.naturalWidth * sc), H = Math.round(img.naturalHeight * sc);
    var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
    var d = x.getImageData(0, 0, W, H).data, g = new Uint8Array(W * H), i;
    for(i = 0; i < W * H; i++) g[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) | 0;
    var seen = new Uint8Array(W * H), blobs = [], all = [], stack = [];
    for(i = 0; i < W * H; i++){
      if(seen[i] || g[i] > 250) continue;
      var n = 0, sx = 0, sy = 0, mn = 255, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, big2 = false; stack.length = 0; stack.push(i); seen[i] = 1;
      while(stack.length){
        var q = stack.pop(), qx = q % W, qy = (q / W) | 0; n++; sx += qx; sy += qy; if(g[q] < mn) mn = g[q];
        if(qx < x0) x0 = qx; if(qx > x1) x1 = qx; if(qy < y0) y0 = qy; if(qy > y1) y1 = qy;
        if(n > 900){ big2 = true; }
        var nb = [q - 1, q + 1, q - W, q + W];
        for(var k = 0; k < 4; k++){ var r = nb[k]; if(r < 0 || r >= W * H || seen[r] || g[r] > 250) continue; if((k === 0 && qx === 0) || (k === 1 && qx === W - 1)) continue; seen[r] = 1; stack.push(r); }
      }
      if(big2 || x1 - x0 > 40 || y1 - y0 > 40) continue;
      if(n >= 2) all.push({ x:sx / n, y:sy / n, w:x1 - x0 + 1, h:y1 - y0 + 1, n:n });
      if(mn < 140) continue;
      blobs.push({ x:sx / n, y:sy / n, w:x1 - x0 + 1, h:y1 - y0 + 1, n:n, x0:x0 });
    }
    var ln = lineFromBlobs(all); if(ln) return { serial:ln, votes:1, via:'vLine' };
    if(blobs.length < 8) return null;
    var cellG = 8, grid = {};
    blobs.forEach(function(b, k){ var key = Math.floor(b.x / cellG) + ',' + Math.floor(b.y / cellG); (grid[key] = grid[key] || []).push(k); });
    function near(px2, py, tol){ var best = null, bd = tol; var gx = Math.floor(px2 / cellG), gy = Math.floor(py / cellG), R = Math.ceil(tol / cellG); for(var a = -R; a <= R; a++) for(var b2 = -R; b2 <= R; b2++){ (grid[(gx + a) + ',' + (gy + b2)] || []).forEach(function(k){ var bb = blobs[k], dd = Math.hypot(bb.x - px2, bb.y - py); if(dd < bd){ bd = dd; best = bb; } }); } return best; }
    function lum(px2, py, r){ var s2 = 0, m = 0; for(var yy = Math.round(py) - r; yy <= Math.round(py) + r; yy++) for(var xx = Math.round(px2) - r; xx <= Math.round(px2) + r; xx++){ if(xx < 0 || yy < 0 || xx >= W || yy >= H) continue; s2 += g[yy * W + xx]; m++; } return m ? s2 / m : 255; }
    function readTile(tx, ty, cell){
      if(!near(tx + 9 * cell, ty, Math.max(2, cell * 0.3)) || !near(tx, ty + 7 * cell, Math.max(2, cell * 0.3)) || !near(tx + 9 * cell, ty + 7 * cell, Math.max(2, cell * 0.3))) return null;
      var r = Math.max(1, Math.round(cell * 0.1)), vals = [];
      for(var j = 1; j <= 6; j++) for(var i2 = 1; i2 <= 8; i2++){
        var cx = tx + i2 * cell, cy = ty + j * cell, bgv = (lum(cx + cell / 2, cy + cell / 2, r) + lum(cx - cell / 2, cy - cell / 2, r)) / 2;
        vals.push(bgv - lum(cx, cy, r));
      }
      var srt = vals.slice().sort(function(a, b){ return a - b; }), lo = srt[24], hi = (srt[47] + srt[46] + srt[45]) / 3;
      if(hi - lo < 6) return null;
      var th = lo + (hi - lo) * 0.45, bits = vals.map(function(v){ return v > th ? 1 : 0; }), out = [];
      for(var cpy = 0; cpy < 2; cpy++){ var part = bits.slice(cpy * 24, cpy * 24 + 24).join(''), se = parseInt(part.slice(0, 16), 2), cr = parseInt(part.slice(16), 2); out.push(se > 0 && crc8(se) === cr ? se : -1); }
      return out[0] > 0 && out[0] === out[1] ? out[0] : null;
    }
    var votes = {}, tries = 0;
    for(i = 0; i < blobs.length && tries < 6000; i++){
      var b = blobs[i], cands = [];
      /* separate companion dot to the right */
      for(var dx = 2; dx <= 40; dx++){ var cmp = near(b.x + dx, b.y, 1.6); if(cmp && cmp !== b && cmp.n <= b.n && Math.abs(cmp.x - b.x - dx) < 1.2){ cands.push([b.x, b.y, (cmp.x - b.x) / 0.3714]); break; } }
      /* or merged into one wide blob: take the left part as the marker, size the grid from blobs on the same row */
      if(b.w > b.h * 1.3){
        var mx2 = b.x0 + b.h / 2;
        blobs.forEach(function(o){ if(o === b || Math.abs(o.y - b.y) > 1.6) return; var dd = o.x - mx2; if(dd > 20 && dd < 900) cands.push([mx2, b.y, dd / 9]); });
      }
      for(var k2 = 0; k2 < cands.length && k2 < 60; k2++){ tries++; var sr = readTile(cands[k2][0], cands[k2][1], cands[k2][2]); if(sr) votes[sr] = (votes[sr] || 0) + 1; }
    }
    var best = null, bv = 0; Object.keys(votes).forEach(function(k){ if(votes[k] > bv){ bv = votes[k]; best = +k; } });
    return best ? { serial:best, votes:bv } : null;
  }
  function showFind(hits, extraNote, exhibit){
    var box = sec.querySelector('[data-eb="findOut"]'); if(!box) return;
    S.exhibit = exhibit || null; if(S.exhibit && hits[0]) S.exhibit.via = T(U[hits[0].via]) + (hits[0].extra ? ' (' + hits[0].extra + ')' : '');
    if(!hits.length){ box.innerHTML = '<div class="eb-none">' + esc(T(U.nothing)) + (extraNote ? ' ' + esc(extraNote) : '') + '</div>'; return; }
    box.innerHTML = hits.map(function(h){
      return '<div class="eb-hit"><b>' + esc(T(U.found)) + ': ' + esc(h.r.name) + '</b><span class="mono">' + esc(h.r.id) + ' · #' + h.r.serial + '</span><em>' + esc(T(U.via)) + ' ' + esc(T(U[h.via])) + (h.extra ? ' (' + esc(T(U.match)) + ' ' + esc(h.extra) + ')' : '') + '</em>' +
        '<button type="button" class="eb-b pri" data-eb-act="evidenceX" data-id="' + esc(h.r.id) + '">' + esc(T(U.evidence)) + '</button></div>';
    }).join('');
  }
  /* dot reader: the admin clicks the four corner markers of one tile */
  function dotsDecode(){
    var D = S.dots; if(!D || D.pts.length < 4) return null;
    var cv = D.cv, x = cv.getContext('2d'), P = D.pts;
    function at(u, v){ var tx = P[0][0] + (P[1][0] - P[0][0]) * u, ty = P[0][1] + (P[1][1] - P[0][1]) * u, bx = P[3][0] + (P[2][0] - P[3][0]) * u, by = P[3][1] + (P[2][1] - P[3][1]) * u; return [tx + (bx - tx) * v, ty + (by - ty) * v]; }
    var cell = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]) / (DOT.cols - 1), rad = Math.max(1, Math.round(cell * 0.1));
    function lum(px, py){ var d = x.getImageData(Math.round(px) - rad, Math.round(py) - rad, rad * 2 + 1, rad * 2 + 1).data, s = 0, n = 0; for(var i = 0; i < d.length; i += 4){ var l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; s += l; n++; } return s / n; }
    var vals = [];
    for(var j = 1; j <= 6; j++) for(var i = 1; i <= 8; i++){
      var c = at(i / (DOT.cols - 1), j / (DOT.rows - 1)), b1 = at((i + 0.5) / (DOT.cols - 1), (j + 0.5) / (DOT.rows - 1)), b2 = at((i - 0.5) / (DOT.cols - 1), (j - 0.5) / (DOT.rows - 1));
      var bg = (lum(b1[0], b1[1]) + lum(b2[0], b2[1])) / 2; vals.push(bg - lum(c[0], c[1]));
    }
    return decodeDotBits(vals);
  }
  function openDots(img){
    var wrap = sec.querySelector('[data-eb="dots"]'); wrap.innerHTML = '';
    var cv = document.createElement('canvas'), w = img.naturalWidth, h = img.naturalHeight; cv.width = w; cv.height = h; cv.className = 'eb-dotcv';
    var x = cv.getContext('2d'); x.drawImage(img, 0, 0);
    var base = x.getImageData(0, 0, w, h);
    S.dots = { cv:cv, pts:[], base:base };
    var bar = document.createElement('div'); bar.className = 'eb-dotbar';
    bar.innerHTML = '<span data-eb="dotsN">0 / 4</span><button type="button" class="eb-b" data-eb-act="dotsReset">' + esc(T(U.dotsReset)) + '</button>';
    var zoomBox = document.createElement('div'); zoomBox.className = 'eb-dotzoom'; zoomBox.appendChild(cv);
    wrap.appendChild(bar); wrap.appendChild(zoomBox);
    cv.addEventListener('click', function(ev){
      var r = cv.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * w, py = (ev.clientY - r.top) / r.height * h;
      if(S.dots.pts.length >= 4) S.dots.pts = [];
      S.dots.pts.push([px, py]);
      x.putImageData(S.dots.base, 0, 0);
      x.strokeStyle = '#ff2d6f'; x.lineWidth = Math.max(1, w / 900);
      S.dots.pts.forEach(function(p, i){ x.beginPath(); x.arc(p[0], p[1], Math.max(4, w / 300), 0, Math.PI * 2); x.stroke(); x.fillStyle = '#ff2d6f'; x.font = Math.max(10, w / 120) + 'px sans-serif'; x.fillText(String(i + 1), p[0] + 6, p[1] - 6); });
      sec.querySelector('[data-eb="dotsN"]').textContent = S.dots.pts.length + ' / 4';
      if(S.dots.pts.length === 4){
        x.putImageData(S.dots.base, 0, 0);
        var serial = dotsDecode();
        S.dots.pts.forEach(function(p){ x.beginPath(); x.arc(p[0], p[1], Math.max(4, w / 300), 0, Math.PI * 2); x.stroke(); });
        var r2 = serial && bySerial(serial);
        showFind(r2 ? [{ r:r2, via:'vDots' }] : [], serial ? '#' + serial : T(U.dotsFail));
      }
    });
  }

  /* ------------------------------------------------------------------
     UI
     ------------------------------------------------------------------ */
  var sec = null;
  function rowHTML(r){
    var a = r.accepted, st = r.revoked ? '<i class="eb-st rv">' + esc(T(U.revoked)) + '</i>' : a ? '<i class="eb-st ok">' + esc(T(U.accepted)) + ' · ' + esc(fmtDate(a.at)) + '</i>' : '<i class="eb-st pd">' + esc(T(U.pending)) + '</i>';
    return '<div class="eb-row" data-id="' + esc(r.id) + '">' +
      '<div class="eb-r1"><b>' + esc(r.name) + '</b><span class="mono">' + esc(r.id) + ' · #' + r.serial + ' · ' + esc((r.lang || 'th').toUpperCase()) + '</span>' + st + '</div>' +
      '<div class="eb-r2"><span>' + esc(T(U.given)) + ' ' + esc(fmtDate(r.createdAt)) + '</span>' + (r.contact ? '<span>' + esc(r.contact) + '</span>' : '') + '<span>' + esc(r.hasFile ? T(U.file) : T(U.noFile)) + '</span><span>' + (r.downloads || []).length + ' ' + esc(T(U.dl)) + '</span>' +
        (a ? '<span class="mono">' + esc(T(U.ip)) + ' ' + esc(a.ip) + ' ' + esc(a.country || '') + '</span><span>' + esc(T(U.typed)) + ': ' + esc(a.typedName) + '</span>' : '') + (r.note ? '<span>' + esc(r.note) + '</span>' : '') + '</div>' +
      '<div class="eb-r3"><button type="button" class="eb-b" data-eb-act="make" data-id="' + esc(r.id) + '">' + esc(T(U.make)) + '</button>' +
        '<label class="eb-b">' + esc(T(U.upload)) + '<input type="file" accept="application/pdf" data-eb-up="' + esc(r.id) + '" hidden></label>' +
        '<button type="button" class="eb-b" data-eb-act="copy" data-id="' + esc(r.id) + '">' + esc(T(U.copyLink)) + '</button>' +
        '<button type="button" class="eb-b" data-eb-act="evidence" data-id="' + esc(r.id) + '">' + esc(T(U.evidence)) + '</button>' +
        '<button type="button" class="eb-b" data-eb-act="' + (r.revoked ? 'unrevoke' : 'revoke') + '" data-id="' + esc(r.id) + '">' + esc(T(r.revoked ? U.unrevoke : U.revoke)) + '</button>' +
        '<button type="button" class="eb-b danger" data-eb-act="del" data-id="' + esc(r.id) + '">' + esc(T(U.del)) + '</button></div>' +
      '<div class="eb-msg" data-eb-msg="' + esc(r.id) + '"></div></div>';
  }
  function paint(){
    if(!sec) return;
    sec.querySelector('[data-eb="eb"]').textContent = T(U.eb); sec.querySelector('[data-eb="h"]').textContent = T(U.h); sec.querySelector('[data-eb="lede"]').textContent = T(U.lede);
    var main = sec.querySelector('[data-eb="main"]');
    if(!key() || S.err === 'bad'){
      main.innerHTML = '<div class="eb-key"><p>' + esc(T(U.keyLede)) + '</p><input type="password" data-eb="key" placeholder="' + esc(T(U.keyPh)) + '" autocomplete="off"><button type="button" class="eb-b pri" data-eb-act="key">' + esc(T(U.open)) + '</button>' + (S.err === 'bad' ? '<div class="eb-err">' + esc(T(U.bad)) + '</div>' : '') + '</div>';
      return;
    }
    var tabs = '<div class="eb-tabs">' + [['reg', U.tReg], ['new', U.tNew], ['find', U.tFind]].map(function(t){ return '<button type="button" data-eb-tab="' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '">' + esc(T(t[1])) + '</button>'; }).join('') + '</div>';
    var body = '';
    if(S.err === 'net') body = '<div class="eb-err">' + esc(T(U.net)) + '</div>';
    else if(S.busy && !S.list) body = '<div class="eb-none">' + esc(T(U.loading)) + '</div>';
    else if(S.tab === 'reg'){
      body = '<div class="eb-tools"><button type="button" class="eb-b" data-eb-act="reload">' + esc(T(U.reload)) + '</button><button type="button" class="eb-b" data-eb-act="export">' + esc(T(U.export)) + '</button></div>' +
        ((S.list || []).length ? (S.list || []).map(rowHTML).join('') : '<div class="eb-none">' + esc(T(U.empty)) + '</div>');
    } else if(S.tab === 'new'){
      var r = S.last && (byId(S.last.id) || S.last);
      body = '<p class="eb-flow">' + esc(T(U.flow)) + '</p><div class="eb-form"><label>' + esc(T(U.name)) + '<input type="text" data-eb="fName" maxlength="80"></label><label>' + esc(T(U.contact)) + '<input type="text" data-eb="fContact" maxlength="120"></label>' +
        '<label>' + esc(T(U.note)) + '<input type="text" data-eb="fNote" maxlength="300"></label><label>' + esc(T(U.lang)) + '<select data-eb="fLang"><option value="th">ไทย</option><option value="en">English</option></select></label>' +
        '<button type="button" class="eb-b pri" data-eb-act="issue">' + esc(T(U.issue)) + '</button><div class="eb-msg" data-eb-msg="new"></div></div>' +
        (r ? '<div class="eb-steps"><div class="eb-card"><b>' + esc(r.name) + '</b><span class="mono">' + esc(r.id) + ' · #' + r.serial + '</span>' + (r.accepted ? '<i class="eb-st ok">' + esc(T(U.accepted)) + '</i>' : '<i class="eb-st pd">' + esc(T(U.pending)) + '</i>') + '</div>' +
          '<div class="eb-step"><h4>' + esc(T(U.s4)) + '</h4><p>' + esc(T(U.s4h)) + '</p><input type="text" readonly value="' + esc(accLink(r)) + '" class="eb-link"><div class="eb-tools"><button type="button" class="eb-b" data-eb-act="copy" data-id="' + esc(r.id) + '">' + esc(T(U.copyLink)) + '</button><a class="eb-b" target="_blank" rel="noopener" href="https://line.me/R/msg/text/?' + encodeURIComponent(accLink(r)) + '">' + esc(T(U.line)) + '</a><button type="button" class="eb-b" data-eb-act="reload">' + esc(T(U.reload)) + '</button></div></div>' +
          '<div class="eb-step' + (r.accepted ? '' : ' dim') + '"><h4>' + esc(T(U.s2)) + '</h4><p>' + esc(T(U.s2h)) + '</p><p class="eb-will">' + esc(T(U.willUse)) + ': <b>' + esc(printName(r)) + '</b></p>' + (r.accepted ? '' : '<p class="eb-warn">' + esc(T(U.notYet)) + '</p>') + '<button type="button" class="eb-b pri" data-eb-act="make" data-id="' + esc(r.id) + '">' + esc(T(U.make)) + '</button></div>' +
          '<div class="eb-step"><h4>' + esc(T(U.s3)) + '</h4><p>' + esc(T(U.s3h)) + '</p><label class="eb-b pri">' + esc(T(U.upload)) + '<input type="file" accept="application/pdf" data-eb-up="' + esc(r.id) + '" hidden></label></div>' +
          '<div class="eb-msg" data-eb-msg="' + esc(r.id) + '"></div></div>' : '');
    } else {
      body = '<div class="eb-find">' +
        '<label class="eb-drop" data-eb="drop"><span class="eb-drop-ic"><svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 30H11a8 8 0 0 1-1-15.9A12 12 0 0 1 33 12a9 9 0 0 1 4 17.4"/><path d="M24 22v18M17 29l7-7 7 7"/></svg></span>' +
          '<b>' + esc(T(U.drop)) + '</b><span class="eb-drop-k"><i>PDF</i><i>PNG</i><i>JPG</i><i>' + esc(L() === 'th' ? 'ภาพหน้าจอ' : 'screenshot') + '</i></span><small>' + esc(T(U.dropH)) + '</small><input type="file" accept="application/pdf,.pdf,image/*" data-eb="qFile" hidden></label>' +
        '<div class="eb-out" data-eb="findOut"></div><div class="eb-hash" data-eb="hash"></div>' +
        '<div class="eb-find2"><div class="eb-step"><h4>' + esc(T(U.fCode)) + '</h4><p>' + esc(T(U.fCodeH)) + '</p><div class="eb-tools"><input type="text" data-eb="qCode" placeholder="EB-XXXXXX"><button type="button" class="eb-b pri" data-eb-act="fCode">' + esc(T(U.check)) + '</button></div></div>' +
        '<div class="eb-step"><h4>' + esc(T(U.fText)) + '</h4><p>' + esc(T(U.fTextH)) + '</p><textarea data-eb="qText" rows="4"></textarea><button type="button" class="eb-b pri" data-eb-act="fText">' + esc(T(U.check)) + '</button></div></div>' +
        '<details class="eb-adv" data-eb="adv"><summary>' + esc(T(U.adv)) + '</summary><div data-eb="dots"></div></details></div>';
    }
    main.innerHTML = tabs + body;
  }
  function msg(id, t, ok){ var el = sec.querySelector('[data-eb-msg="' + id + '"]'); if(el){ el.textContent = t; el.className = 'eb-msg ' + (ok ? 'ok' : 'bad'); } }
  function exportReg(){
    var L2 = S.list || [], stamp = new Date().toISOString().slice(0, 10);
    function dl(name, text, type){ var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type:type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
    dl('SPZ-EBREG-' + stamp + '.json', JSON.stringify(L2, null, 2), 'application/json');
    var cols = ['id', 'serial', 'name', 'contact', 'note', 'lang', 'createdAt', 'hasFile', 'revoked', 'acceptedAt', 'typedName', 'ip', 'country', 'downloads'];
    var csv = '﻿' + cols.join(',') + '\n' + L2.map(function(r){ var a = r.accepted || {}; return [r.id, r.serial, r.name, r.contact, r.note, r.lang, new Date(r.createdAt).toISOString(), r.hasFile, r.revoked, a.at ? new Date(a.at).toISOString() : '', a.typedName || '', a.ip || '', a.country || '', (r.downloads || []).length].map(function(v){ return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    setTimeout(function(){ dl('SPZ-EBREG-' + stamp + '.csv', csv, 'text/csv'); }, 400);
  }
  function hexOf(buf){ return crypto.subtle.digest('SHA-256', buf).then(function(h){ return Array.prototype.map.call(new Uint8Array(h), function(v){ return ('0' + v.toString(16)).slice(-2); }).join(''); }); }
  /* one drop zone for everything: PDF or picture, decided by the file itself */
  function handleFile(f){
    var out = sec.querySelector('[data-eb="findOut"]'), hb = sec.querySelector('[data-eb="hash"]');
    out.innerHTML = '<div class="eb-none">' + esc(T(U.tool)) + '</div>'; hb.innerHTML = '';
    f.arrayBuffer().then(function(buf){
      var isPdf = /pdf/i.test(f.type) || /\.pdf$/i.test(f.name) || String.fromCharCode.apply(null, new Uint8Array(buf.slice(0, 5))) === '%PDF-';
      return hexOf(buf).then(function(hex){
        hb.innerHTML = '<span>' + esc(T(U.hashT)) + ' · ' + esc(f.name) + ' · ' + Math.round(f.size / 1024) + ' KB</span><code>' + hex + '</code>';
        var same = (S.list || []).filter(function(r){ return r.fileSha256 && r.fileSha256 === hex; }).map(function(r){ return { r:r, via:'vHash' }; });
        if(isPdf){
          var ex = { kind:'pdf', name:f.name, size:f.size, sha:hex, at:Date.now() };
          return pdfText(f).then(function(t){ showFind(same.concat(analyseText(t + ' ' + f.name)), '', ex); }).catch(function(){ showFind(same, 'PDF?', ex); });
        }
        var img = new Image(); img.onload = function(){
          var th = document.createElement('canvas'), k = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight)); th.width = Math.round(img.naturalWidth * k); th.height = Math.round(img.naturalHeight * k); th.getContext('2d').drawImage(img, 0, 0, th.width, th.height);
          var ex = { kind:'image', name:f.name, sha:hex, img:th.toDataURL('image/jpeg', 0.85), at:Date.now() };
          qrFromImage(img).catch(function(){ return null; }).then(function(data){
            var m = data && /EB-[A-Z0-9]{6}/.exec(data), r = m && byId(m[0]);
            if(r){ showFind(same.concat([{ r:r, via:'vQr' }]), '', ex); return; }
            out.innerHTML = '<div class="eb-none">' + esc(T(U.autoDots)) + '</div>';
            setTimeout(function(){
              var res = null; try { res = autoDots(img); } catch(e){}
              var r2 = res && bySerial(res.serial);
              if(r2){ showFind(same.concat([{ r:r2, via:res.via || 'vDots', extra:res.via ? '' : res.votes + 'x' }]), '', ex); return; }
              showFind(same, T(U.manual), ex); var ad = sec.querySelector('[data-eb="adv"]'); if(ad) ad.open = true; openDots(img);
            }, 30);
          });
        };
        img.src = URL.createObjectURL(f);
      });
    });
  }
  function wire(){
    sec.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-eb-tab]'); if(b){ S.tab = b.getAttribute('data-eb-tab'); paint(); return; }
      b = ev.target.closest('[data-eb-act]'); if(!b) return;
      var act = b.getAttribute('data-eb-act'), id = b.getAttribute('data-id'), r = id && (byId(id) || (S.last && S.last.id === id ? S.last : null));
      if(act === 'key'){ var v = sec.querySelector('[data-eb="key"]').value.trim(); if(v){ setKey(v); S.err = null; load(); } return; }
      if(act === 'reload'){ load(); return; }
      if(act === 'export'){ exportReg(); return; }
      if(act === 'issue'){
        var name = sec.querySelector('[data-eb="fName"]').value.trim();
        if(!name){ msg('new', T(U.needName)); return; }
        b.disabled = true;
        api('/api/admin/ebook/issue', { method:'POST', json:{ name:name, contact:sec.querySelector('[data-eb="fContact"]').value, note:sec.querySelector('[data-eb="fNote"]').value, lang:sec.querySelector('[data-eb="fLang"]').value, title:'Elliott Wave Classroom' } })
          .then(function(d){ b.disabled = false; if(!d.ok){ msg('new', d.__status === 401 ? T(U.bad) : T(U.net)); return; } S.last = d.ebook; S.list = [d.ebook].concat(S.list || []); paint(); })
          .catch(function(){ b.disabled = false; msg('new', T(U.net)); });
        return;
      }
      if(!r && act !== 'fCode' && act !== 'fText' && act !== 'dotsReset') return;
      if(act === 'make'){ if(isSafari() && !S.safariOk){ S.safariOk = true; msg(r.id, T(U.safari)); return; } msg(r.id, T(U.building), true); printBook(r).then(function(){ msg(r.id, '', true); }).catch(function(e){ msg(r.id, /nocontent|st4/.test(String(e && e.message)) ? T(U.noContent) : T(U.net)); }); return; }
      if(act === 'copy'){ var t = accLink(r); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ msg(r.id, T(U.copied), true); }, function(){ window.prompt('', t); }); return; }
      if(act === 'evidence'){ printEvidence(r); return; }
      if(act === 'evidenceX'){ printEvidence(r, S.exhibit); return; }
      if(act === 'revoke' || act === 'unrevoke'){ api('/api/admin/ebook/update', { method:'POST', json:{ id:r.id, revoke:act === 'revoke' } }).then(function(){ load(); }); return; }
      if(act === 'del'){ if(!window.confirm(T(U.delQ))) return; api('/api/admin/ebook/update', { method:'POST', json:{ id:r.id, delete:true } }).then(function(){ if(S.last && S.last.id === r.id) S.last = null; load(); }); return; }
    });
    sec.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-eb-act]'); if(!b) return;
      var act = b.getAttribute('data-eb-act');
      if(act === 'fCode'){ var q = sec.querySelector('[data-eb="qCode"]').value.trim().toUpperCase(), r = /^\d+$/.test(q) ? bySerial(+q) : byId(q.indexOf('EB-') === 0 ? q : 'EB-' + q); showFind(r ? [{ r:r, via:'vCode' }] : []); }
      if(act === 'fText'){ var tv = sec.querySelector('[data-eb="qText"]').value; showFind(analyseText(tv), '', { kind:'text', text:tv.slice(0, 1200), at:Date.now() }); }
      if(act === 'dotsReset' && S.dots){ S.dots.pts = []; S.dots.cv.getContext('2d').putImageData(S.dots.base, 0, 0); sec.querySelector('[data-eb="dotsN"]').textContent = '0 / 4'; }
    });
    sec.addEventListener('dragover', function(ev){ var z = ev.target.closest && ev.target.closest('[data-eb="drop"]'); if(z){ ev.preventDefault(); z.classList.add('on'); } });
    sec.addEventListener('dragleave', function(ev){ var z = ev.target.closest && ev.target.closest('[data-eb="drop"]'); if(z) z.classList.remove('on'); });
    sec.addEventListener('drop', function(ev){ var z = ev.target.closest && ev.target.closest('[data-eb="drop"]'); if(!z) return; ev.preventDefault(); z.classList.remove('on'); var f = ev.dataTransfer.files && ev.dataTransfer.files[0]; if(f) handleFile(f); });
    sec.addEventListener('change', function(ev){
      var up = ev.target.getAttribute && ev.target.getAttribute('data-eb-up');
      if(up){
        var f = ev.target.files && ev.target.files[0]; if(!f) return;
        msg(up, T(U.uploading), true);
        api('/api/admin/ebook/upload?id=' + encodeURIComponent(up), { method:'POST', body:f, ctype:'application/pdf' }).then(function(d){
          if(!d.ok){ msg(up, (d.error || 'error') + ''); return; }
          msg(up, T(U.uploaded) + ' · ' + Math.round(f.size / 1024) + ' KB', true);
          if(S.last && S.last.id === up) S.last = d.ebook;
          S.list = (S.list || []).map(function(x){ return x.id === up ? d.ebook : x; });
        }).catch(function(){ msg(up, T(U.net)); });
        return;
      }
      if(ev.target.matches('[data-eb="qFile"]') && ev.target.files[0]) handleFile(ev.target.files[0]);
    });
  }
  /* a shortcut inside Print Report, next to the other report types */
  function addPrintReportButton(){
    var anchor = document.querySelector('#printreport [data-pr="typeCert"]');
    if(!anchor || document.querySelector('#printreport [data-eb-pr]')) return !!anchor;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pr-modebtn'; b.setAttribute('data-eb-pr', '1'); b.textContent = T(U.prBtn);
    b.addEventListener('click', function(){ location.hash = '#/ebookreg'; });
    anchor.parentNode.insertBefore(b, anchor.nextSibling);
    new MutationObserver(function(){ b.textContent = T(U.prBtn); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  function build(){
    if(document.getElementById('ebookreg')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    sec = document.createElement('section'); sec.id = 'ebookreg'; sec.setAttribute('data-route', 'ebookreg');
    sec.innerHTML = '<div class="eb-wrap"><div class="section-head reveal in-view"><div class="eyebrow"><span class="cursor"></span><span data-eb="eb"></span></div><h2 data-eb="h"></h2><p class="lede" data-eb="lede"></p><div class="rule"></div></div><div data-eb="main"></div></div>';
    document.body.appendChild(sec);
    window.__spzAddRoute({ id:'ebookreg', after:'gradebook', t:U.h, d:{ en:'Personal, traceable ebook copies and who received them.', th:'อีบุ๊กฉบับเฉพาะคนที่สืบย้อนได้ และทะเบียนผู้รับ' } });
    wire(); paint();
    window.addEventListener('hashchange', function(){ if(location.hash === '#/ebookreg' && !S.list && key()) load(); });
    if(location.hash === '#/ebookreg' && key()) load();
    new MutationObserver(function(){ paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  /* test hooks (read-only helpers, no secrets) */
  window.__SPZ_EBOOK_TEST = { applyWording:applyWording, wordingBits:wordingBits, zwEncode:zwEncode, zwDecodeAll:zwDecodeAll, dotTileSVG:dotTileSVG, decodeDotBits:decodeDotBits, dotBits:dotBits, crc8:crc8, buildBook:buildBook, termsText:termsText };
  function boot(){ var n = 0, iv = setInterval(function(){ var a = build(), b = addPrintReportButton(); if((a && b) || ++n > 90) clearInterval(iv); }, 500); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  else setTimeout(boot, 1500);
})();
