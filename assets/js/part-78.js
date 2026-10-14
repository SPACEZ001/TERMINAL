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
    lede:{ en:'Every copy is personal and traceable. Register the reader, make their PDF, upload it, and send them the private link: they must accept the terms before they can download.', th:'อีบุ๊กทุกเล่มเป็นฉบับเฉพาะคนและสืบย้อนได้ ลงทะเบียนผู้รับ สร้าง PDF ของเขา อัปโหลด แล้วส่งลิงก์ส่วนตัวให้ ผู้รับต้องกดยอมรับเงื่อนไขก่อนจึงจะดาวน์โหลดได้' },
    tReg:{ en:'Registry', th:'ทะเบียน' }, tNew:{ en:'Give a new copy', th:'แจกเล่มใหม่' }, tFind:{ en:'Find the owner', th:'ตรวจหาเจ้าของ' },
    keyLede:{ en:'Enter the admin key to open the registry.', th:'ใส่รหัสแอดมินเพื่อเปิดทะเบียน' }, keyPh:{ en:'Admin key', th:'รหัสแอดมิน' }, open:{ en:'Open', th:'เปิด' },
    bad:{ en:'Wrong admin key.', th:'รหัสแอดมินไม่ถูกต้อง' }, net:{ en:'Could not reach the server. Has the new Worker been deployed?', th:'ติดต่อเซิร์ฟเวอร์ไม่ได้ ได้ deploy Worker ตัวใหม่แล้วหรือยัง' },
    name:{ en:'Reader name (as on their ID)', th:'ชื่อผู้รับ (ตามบัตรประชาชน)' }, contact:{ en:'Contact (LINE / phone / email)', th:'ช่องทางติดต่อ (LINE / โทร / อีเมล)' },
    note:{ en:'Note (course, payment, …)', th:'หมายเหตุ (คอร์ส การชำระเงิน ฯลฯ)' }, lang:{ en:'Ebook language', th:'ภาษาของอีบุ๊ก' },
    issue:{ en:'1 · Register this reader', th:'1 · ลงทะเบียนผู้รับ' }, needName:{ en:'Type the reader name first.', th:'กรุณาพิมพ์ชื่อผู้รับก่อน' },
    s2:{ en:'2 · Make the PDF', th:'2 · สร้าง PDF' }, s2h:{ en:'In the print window choose "Save as PDF". The file name is already set.', th:'ในหน้าต่างพิมพ์ เลือก "บันทึกเป็น PDF" ชื่อไฟล์ตั้งไว้ให้แล้ว' },
    s3:{ en:'3 · Upload that PDF', th:'3 · อัปโหลด PDF นั้น' }, s4:{ en:'4 · Send the private link', th:'4 · ส่งลิงก์ส่วนตัวให้ผู้รับ' },
    make:{ en:'Make PDF', th:'สร้าง PDF' }, upload:{ en:'Upload PDF', th:'อัปโหลด PDF' }, copyLink:{ en:'Copy link', th:'คัดลอกลิงก์' }, line:{ en:'Send via LINE', th:'ส่งทาง LINE' },
    copied:{ en:'Copied', th:'คัดลอกแล้ว' }, uploading:{ en:'Uploading…', th:'กำลังอัปโหลด…' }, uploaded:{ en:'Uploaded', th:'อัปโหลดแล้ว' },
    building:{ en:'Building the book…', th:'กำลังประกอบเล่ม…' }, noContent:{ en:'Lesson content not found. Run CLASSROOM_CONTENT_UPLOADER first.', th:'ไม่พบเนื้อหาบทเรียน กรุณารัน CLASSROOM_CONTENT_UPLOADER ก่อน' },
    pending:{ en:'Waiting for acceptance', th:'รอผู้รับกดยอมรับ' }, accepted:{ en:'Accepted', th:'ยอมรับแล้ว' }, revoked:{ en:'Revoked', th:'ยกเลิกสิทธิ์แล้ว' },
    noFile:{ en:'No PDF uploaded yet', th:'ยังไม่ได้อัปโหลด PDF' }, file:{ en:'PDF uploaded', th:'อัปโหลด PDF แล้ว' }, dl:{ en:'downloads', th:'ครั้งที่ดาวน์โหลด' },
    revoke:{ en:'Revoke', th:'ยกเลิกสิทธิ์' }, unrevoke:{ en:'Restore', th:'คืนสิทธิ์' }, del:{ en:'Delete', th:'ลบ' }, delQ:{ en:'Delete this record and its PDF? This cannot be undone.', th:'ลบรายการนี้และไฟล์ PDF? ย้อนกลับไม่ได้' },
    evidence:{ en:'Evidence sheet', th:'เอกสารหลักฐาน' }, export:{ en:'Download registry (JSON + CSV)', th:'ดาวน์โหลดทะเบียน (JSON + CSV)' }, reload:{ en:'Refresh', th:'รีเฟรช' },
    empty:{ en:'No copies given out yet.', th:'ยังไม่มีการแจก' }, serial:{ en:'Serial', th:'ลำดับ' }, given:{ en:'Given', th:'แจกเมื่อ' },
    fCode:{ en:'A · Code or serial', th:'A · รหัสเล่มหรือเลขลำดับ' }, fCodeH:{ en:'Type EB-XXXXXX, or the serial number.', th:'พิมพ์ EB-XXXXXX หรือเลขลำดับ' },
    fText:{ en:'B · Text you found (copied from the leak)', th:'B · ข้อความที่เจอ (คัดลอกจากที่หลุด)' }, fTextH:{ en:'Paste a few paragraphs. Finds the hidden code, the zero-width code, and the wording fingerprint.', th:'วางข้อความหลายย่อหน้า ระบบจะหารหัสซ่อน รหัสล่องหน และลายนิ้วมือถ้อยคำ' },
    fPdf:{ en:'C · PDF file you found', th:'C · ไฟล์ PDF ที่เจอ' }, fImg:{ en:'D · Picture / screenshot you found', th:'D · รูปหรือภาพหน้าจอที่เจอ' },
    fImgH:{ en:'Reads the QR. If there is no QR, click the four corner dots of one dot tile (top-left double dot first, then clockwise) to read the hidden pattern.', th:'อ่าน QR ให้อัตโนมัติ ถ้าไม่มี QR ให้ซูมแล้วคลิกจุดมุม 4 จุดของลายจุด 1 ชุด (เริ่มที่จุดคู่มุมซ้ายบน แล้ววนตามเข็มนาฬิกา)' },
    check:{ en:'Check', th:'ตรวจ' }, found:{ en:'Belongs to', th:'เป็นของ' }, nothing:{ en:'No trace found.', th:'ไม่พบร่องรอย' },
    via:{ en:'found by', th:'พบจาก' }, vCode:{ en:'visible / hidden code', th:'รหัสที่มองเห็นหรือซ่อน' }, vZw:{ en:'zero-width code', th:'รหัสล่องหน' }, vQr:{ en:'QR', th:'QR' }, vDots:{ en:'dot pattern', th:'ลายจุด' }, vMeta:{ en:'PDF title', th:'ชื่อในไฟล์ PDF' },
    vWord:{ en:'wording fingerprint', th:'ลายนิ้วมือถ้อยคำ' }, match:{ en:'match', th:'ตรงกัน' },
    dotsReset:{ en:'Clear clicks', th:'ล้างจุดที่คลิก' }, dotsFail:{ en:'Could not read the pattern. Zoom in and click the centres of the four corner dots again.', th:'อ่านลายจุดไม่ได้ ซูมเข้าแล้วคลิกกลางจุดมุมทั้ง 4 ใหม่' },
    loading:{ en:'Loading…', th:'กำลังโหลด…' }, tool:{ en:'Loading reader tool…', th:'กำลังโหลดเครื่องมืออ่านไฟล์…' },
    prBtn:{ en:'Ebook (personal copy)', th:'อีบุ๊ก (ฉบับเฉพาะคน)' },
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
    try { if(typeof qrcode === 'function'){ var q = qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize:4, margin:0, scalable:true }); } } catch(e){}
    return '';
  }
  function fetchContent(){
    return fetch(WORKER_BASE + '/api/classroom/content', { headers:{ 'X-Admin-Key':key() } }).then(function(r){ if(!r.ok) throw new Error('st' + r.status); return r.json(); }).then(function(d){ return d.content || {}; });
  }
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
    var nm = esc(rec.name), id = esc(rec.id), zw = zwEncode(rec.id), qrUrl = SITE + 'ebook.html#v=' + rec.id;
    var toc = chapters.map(function(c){ return '<div class="eb-toc-r l' + c[2] + '"><span class="tn">' + c[0] + '</span><span class="tt">' + esc(title(c[1])) + '</span></div>'; }).join('');
    var body = chapters.map(function(c, i){
      var html = String(content[c[1]][lang]).replace(/data-ewv-practice/g, 'data-x');
      html = applyWording(html, lang, rec.seed >>> 0);
      /* zero-width code after the first sentence-ish chunk of each chapter */
      html = html.replace(/(<p[^>]*>)([^<]{12,}?)([\s.,;:)])/, function(_, a, b, c2){ return a + b + zw + c2; });
      return '<section class="eb-chap' + (c[2] ? ' sub' : '') + '"><span class="eb-ghost">SPZ ' + id + ' #' + rec.serial + ' ' + nm + '</span><div class="eb-ch-head"><span class="eb-ch-n">' + esc(TX.ch) + ' ' + c[0] + '</span><h1>' + esc(title(c[1])) + '</h1></div>' +
        '<div class="ewv-gl-shell"><div class="gl-detail-body">' + html + '</div></div></section>';
    }).join('');
    var terms = termsText(lang, rec.name, rec.title || 'Elliott Wave Classroom', rec.id).map(function(t, i){ return '<li>' + esc(t) + '</li>'; }).join('');
    var dots = "url('data:image/svg+xml;utf8," + encodeURIComponent(dotTileSVG(rec.serial)) + "')";
    return '<div class="eb-dots" style="background-image:' + dots + '"></div>' +
      '<div class="eb-foot">' + esc(TX.foot.replace('{n}', rec.name).replace('{id}', rec.id)) + '</div>' +
      '<div class="eb-cover"><div class="cv-top"><div class="org">SPACEZ TERMINAL</div><div class="ed">' + esc(TX.edition) + '</div></div>' +
        '<div class="cv-mid"><div class="kick">' + esc(TX.kick) + '</div><h1>' + TX.big + '</h1><div class="sub">' + esc(TX.sub) + '</div></div>' +
        '<svg class="bg" viewBox="0 0 800 300" preserveAspectRatio="none"><defs><linearGradient id="ebg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22c3f2" stop-opacity=".35"/><stop offset="1" stop-color="#22c3f2" stop-opacity="0"/></linearGradient></defs><path d="M0 270 L120 170 L170 205 L330 70 L380 120 L470 30 L560 150 L600 110 L760 250 L800 230 L800 300 L0 300Z" fill="url(#ebg)"/><path d="M0 270 L120 170 L170 205 L330 70 L380 120 L470 30 L560 150 L600 110 L760 250 L800 230" fill="none" stroke="#22c3f2" stroke-width="4" stroke-linejoin="round"/><g font-family="IBM Plex Mono" font-size="20" font-weight="700" fill="#fff" text-anchor="middle"><text x="120" y="156">1</text><text x="170" y="234">2</text><text x="330" y="56">3</text><text x="380" y="148">4</text><text x="470" y="18">5</text><text x="560" y="178">A</text><text x="600" y="96">B</text><text x="760" y="280">C</text></g></svg>' +
        '<div class="cv-bot"><div class="by">' + esc(TX.by) + '</div><div class="bar"></div><div class="for">' + esc(TX.forWho) + ' ' + nm + '</div></div></div>' +
      '<div class="eb-fw"><h2>' + esc(TX.fw) + '</h2>' + TX.fwbody.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('') + '<div class="sg">' + esc(TX.sign) + '</div></div>' +
      '<div class="eb-copy"><h2>' + esc(TX.copyH) + '</h2><p class="cpy">© 2569 / 2026 Noraset Boikaw · SPACEZ TERMINAL. All rights reserved. สงวนลิขสิทธิ์</p>' +
        '<div class="eb-lic"><div class="who"><span>' + esc(TX.forWho) + '</span><b>' + nm + '</b><span>' + esc(TX.copyNo) + '</span><b class="mono">' + id + '</b></div><ol>' + terms + '</ol></div>' +
        '<div class="eb-orn"><svg viewBox="0 0 300 120" class="orn"><g fill="none" stroke="#0a78c2" stroke-width="1.2" opacity=".55"><path d="M10 60 C60 10, 100 110, 150 60 S240 10, 290 60"/><path d="M10 60 C60 110, 100 10, 150 60 S240 110, 290 60"/><circle cx="150" cy="60" r="44"/><circle cx="150" cy="60" r="52" stroke-dasharray="2 4"/></g></svg>' +
          '<div class="eb-qr">' + qrSVG(qrUrl) + '</div><span class="eb-qrcap">' + esc(TX.scan) + '</span></div></div>' +
      '<div class="eb-tocp"><h2>' + esc(TX.toc) + '</h2>' + toc + '</div>' + body;
  }
  var EB_CSS = '@page{size:A4;margin:16mm 15mm 18mm !important;}@page ebcover{size:A4;margin:0 !important;}' +
    'body.spz-printing-ebook>*:not(#spzEbook){display:none!important;}' +
    'html,body.spz-printing-ebook{background:#fff!important;}';
  function printBook(rec){
    if(!window.__SPZ_EWV_BOOK) return Promise.reject(new Error('nobook'));
    return fetchContent().then(function(content){
      var html = buildBook(rec, content);
      if(!html) throw new Error('nocontent');
      var old = document.getElementById('spzEbook'); if(old) old.remove();
      var box = document.createElement('div'); box.id = 'spzEbook'; box.className = 'spz-ebook lang-' + rec.lang; box.innerHTML = html;
      document.body.appendChild(box);
      var stl = document.createElement('style'); stl.id = 'spzEbookPage'; stl.textContent = EB_CSS; document.body.appendChild(stl);
      var prevTitle = document.title;
      document.title = 'SPZ-EB-' + rec.id.replace(/^EB-/, '') + '-' + safeName(rec.name);
      document.body.classList.add('spz-printing-ebook');
      function done(){ document.body.classList.remove('spz-printing-ebook'); document.title = prevTitle; var s = document.getElementById('spzEbookPage'); if(s) s.remove(); var b = document.getElementById('spzEbook'); if(b) b.remove(); window.removeEventListener('afterprint', done); }
      window.addEventListener('afterprint', done);
      /* give fonts and SVGs a moment to lay out */
      return new Promise(function(res){ setTimeout(function(){ window.print(); setTimeout(res, 300); }, 900); });
    });
  }
  /* evidence sheet: one printable page per record, for a lawyer or a court */
  function printEvidence(r){
    var lang = r.lang === 'en' ? 'en' : 'th', TX = BOOK[lang], terms = termsText(lang, r.name, r.title || 'Elliott Wave Classroom', r.id);
    sha256Hex(terms.join('\n')).then(function(hash){
      var a = r.accepted || {}, dls = (r.downloads || []).map(function(d){ return '<tr><td>' + esc(fmtDate(d.at)) + '</td><td>' + esc(d.ip) + '</td><td>' + esc(d.country) + '</td></tr>'; }).join('');
      var bits = (PAIRS[lang] || []).map(function(p, k){ return esc(bit(r.seed >>> 0, k) ? p[1] : p[0]); }).join(' · ');
      var html = '<div class="ev-sheet"><h1>' + (lang === 'th' ? 'เอกสารหลักฐานการแจกจ่ายอีบุ๊ก' : 'Ebook distribution evidence') + '</h1>' +
        '<p class="ev-sub">SPACEZ TERMINAL · ' + esc(fmtDate(Date.now())) + '</p>' +
        '<table class="ev-t">' +
        '<tr><th>' + (lang === 'th' ? 'เลขที่ฉบับ' : 'Copy code') + '</th><td class="m">' + esc(r.id) + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'เลขลำดับ (ฝังในลายจุด)' : 'Serial (in the dot pattern)') + '</th><td class="m">' + r.serial + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ผู้รับ' : 'Recipient') + '</th><td>' + esc(r.name) + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ช่องทางติดต่อ' : 'Contact') + '</th><td>' + esc(r.contact || '—') + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'หมายเหตุ' : 'Note') + '</th><td>' + esc(r.note || '—') + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ลงทะเบียนเมื่อ' : 'Registered') + '</th><td>' + esc(fmtDate(r.createdAt)) + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'อัปโหลดไฟล์เมื่อ' : 'File uploaded') + '</th><td>' + esc(r.fileAt ? fmtDate(r.fileAt) + ' · ' + Math.round((r.fileSize || 0) / 1024) + ' KB' : '—') + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ยอมรับเงื่อนไขเมื่อ' : 'Terms accepted') + '</th><td>' + esc(a.at ? fmtDate(a.at) : '—') + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ชื่อที่พิมพ์ยืนยัน' : 'Name typed to accept') + '</th><td>' + esc(a.typedName || '—') + '</td></tr>' +
        '<tr><th>IP · ' + (lang === 'th' ? 'ประเทศ' : 'country') + '</th><td class="m">' + esc((a.ip || '—') + ' · ' + (a.country || '—')) + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'อุปกรณ์ (User-Agent)' : 'Device (User-Agent)') + '</th><td class="s">' + esc(a.ua || '—') + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ฉบับของเงื่อนไข' : 'Terms version') + '</th><td class="m">' + esc(a.termsVersion || TERMS_VERSION) + '</td></tr>' +
        '<tr><th>SHA-256 ' + (lang === 'th' ? 'ของข้อความเงื่อนไข' : 'of the terms text') + '</th><td class="s m">' + esc(hash) + (a.termsHash ? (a.termsHash === hash ? ' ✓' : ' ≠ ' + esc(a.termsHash)) : '') + '</td></tr>' +
        '<tr><th>' + (lang === 'th' ? 'ถ้อยคำเฉพาะของฉบับนี้' : 'Wording fingerprint') + '</th><td class="s">' + bits + '</td></tr>' +
        '</table>' +
        '<h2>' + (lang === 'th' ? 'ประวัติการดาวน์โหลด' : 'Download log') + '</h2><table class="ev-t"><tr><th>' + (lang === 'th' ? 'เวลา' : 'Time') + '</th><th>IP</th><th>' + (lang === 'th' ? 'ประเทศ' : 'Country') + '</th></tr>' + (dls || '<tr><td colspan="3">—</td></tr>') + '</table>' +
        '<h2>' + (lang === 'th' ? 'ข้อความเงื่อนไขที่ผู้รับยอมรับ' : 'Terms the recipient accepted') + '</h2><ol class="ev-terms">' + terms.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
        '<h2>' + (lang === 'th' ? 'เครื่องหมายที่ฝังในฉบับนี้' : 'Marks embedded in this copy') + '</h2><ol class="ev-terms">' +
        '<li>' + (lang === 'th' ? 'ชื่อผู้รับและเลขที่ฉบับ ที่ท้ายทุกหน้า หน้าปก และหน้าลิขสิทธิ์' : 'Recipient name and copy code at the foot of every page, on the cover and on the copyright page') + '</li>' +
        '<li>' + (lang === 'th' ? 'ลายจุดในพื้นหลังทุกหน้า เข้ารหัสเลขลำดับ ' : 'Background dot pattern on every page encoding serial ') + r.serial + '</li>' +
        '<li>' + (lang === 'th' ? 'QR Code ในลายตกแต่งหน้าลิขสิทธิ์ ชี้ไปที่ ' : 'QR code in the ornament of the copyright page pointing to ') + esc(SITE + 'ebook.html#v=' + r.id) + '</li>' +
        '<li>' + (lang === 'th' ? 'ข้อความล่องหน รหัสอักขระความกว้างศูนย์ และชื่อไฟล์ในข้อมูล PDF' : 'Invisible text, zero-width character code and the PDF title metadata') + '</li>' +
        '<li>' + (lang === 'th' ? 'ถ้อยคำเฉพาะของฉบับนี้ (ด้านบน)' : 'The wording fingerprint above') + '</li></ol>' +
        '<p class="ev-sign">' + (lang === 'th' ? 'ลงชื่อ ____________________ ผู้ออกเอกสาร (นรเศรษฐ์ บ่อแก้ว)' : 'Signed ____________________ issuer (Noraset Boikaw)') + '</p></div>';
      var old = document.getElementById('spzEbook'); if(old) old.remove();
      var box = document.createElement('div'); box.id = 'spzEbook'; box.className = 'spz-ebook ev'; box.innerHTML = html; document.body.appendChild(box);
      var stl = document.createElement('style'); stl.id = 'spzEbookPage'; stl.textContent = '@page{size:A4;margin:16mm !important;}body.spz-printing-ebook>*:not(#spzEbook){display:none!important;}html,body.spz-printing-ebook{background:#fff!important;}'; document.body.appendChild(stl);
      var prevTitle = document.title; document.title = 'SPZ-EBEV-' + r.id.replace(/^EB-/, '') + '-' + safeName(r.name);
      document.body.classList.add('spz-printing-ebook');
      function done(){ document.body.classList.remove('spz-printing-ebook'); document.title = prevTitle; var s = document.getElementById('spzEbookPage'); if(s) s.remove(); var b = document.getElementById('spzEbook'); if(b) b.remove(); window.removeEventListener('afterprint', done); }
      window.addEventListener('afterprint', done);
      setTimeout(function(){ window.print(); }, 300);
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
    var P = window.jsQR ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js');
    return P.then(function(){
      var c = document.createElement('canvas'), w = img.naturalWidth, h = img.naturalHeight, sc = Math.min(1, 2400 / Math.max(w, h));
      c.width = Math.round(w * sc); c.height = Math.round(h * sc); var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
      var d = x.getImageData(0, 0, c.width, c.height), r = window.jsQR(d.data, c.width, c.height);
      return r ? r.data : null;
    });
  }
  function showFind(hits, extraNote){
    var box = sec.querySelector('[data-eb="findOut"]'); if(!box) return;
    if(!hits.length){ box.innerHTML = '<div class="eb-none">' + esc(T(U.nothing)) + (extraNote ? ' ' + esc(extraNote) : '') + '</div>'; return; }
    box.innerHTML = hits.map(function(h){
      return '<div class="eb-hit"><b>' + esc(T(U.found)) + ': ' + esc(h.r.name) + '</b><span class="mono">' + esc(h.r.id) + ' · #' + h.r.serial + '</span><em>' + esc(T(U.via)) + ' ' + esc(T(U[h.via])) + (h.extra ? ' (' + esc(T(U.match)) + ' ' + esc(h.extra) + ')' : '') + '</em>' +
        '<button type="button" class="eb-b" data-eb-act="evidence" data-id="' + esc(h.r.id) + '">' + esc(T(U.evidence)) + '</button></div>';
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
      var r = S.last;
      body = '<div class="eb-form"><label>' + esc(T(U.name)) + '<input type="text" data-eb="fName" maxlength="80"></label><label>' + esc(T(U.contact)) + '<input type="text" data-eb="fContact" maxlength="120"></label>' +
        '<label>' + esc(T(U.note)) + '<input type="text" data-eb="fNote" maxlength="300"></label><label>' + esc(T(U.lang)) + '<select data-eb="fLang"><option value="th">ไทย</option><option value="en">English</option></select></label>' +
        '<button type="button" class="eb-b pri" data-eb-act="issue">' + esc(T(U.issue)) + '</button><div class="eb-msg" data-eb-msg="new"></div></div>' +
        (r ? '<div class="eb-steps"><div class="eb-card"><b>' + esc(r.name) + '</b><span class="mono">' + esc(r.id) + ' · #' + r.serial + '</span></div>' +
          '<div class="eb-step"><h4>' + esc(T(U.s2)) + '</h4><p>' + esc(T(U.s2h)) + '</p><button type="button" class="eb-b pri" data-eb-act="make" data-id="' + esc(r.id) + '">' + esc(T(U.make)) + '</button></div>' +
          '<div class="eb-step"><h4>' + esc(T(U.s3)) + '</h4><label class="eb-b pri">' + esc(T(U.upload)) + '<input type="file" accept="application/pdf" data-eb-up="' + esc(r.id) + '" hidden></label></div>' +
          '<div class="eb-step"><h4>' + esc(T(U.s4)) + '</h4><input type="text" readonly value="' + esc(accLink(r)) + '" class="eb-link"><div class="eb-tools"><button type="button" class="eb-b" data-eb-act="copy" data-id="' + esc(r.id) + '">' + esc(T(U.copyLink)) + '</button><a class="eb-b" target="_blank" rel="noopener" href="https://line.me/R/msg/text/?' + encodeURIComponent(accLink(r)) + '">' + esc(T(U.line)) + '</a></div></div>' +
          '<div class="eb-msg" data-eb-msg="' + esc(r.id) + '"></div></div>' : '');
    } else {
      body = '<div class="eb-find">' +
        '<div class="eb-step"><h4>' + esc(T(U.fCode)) + '</h4><p>' + esc(T(U.fCodeH)) + '</p><div class="eb-tools"><input type="text" data-eb="qCode" placeholder="EB-XXXXXX"><button type="button" class="eb-b pri" data-eb-act="fCode">' + esc(T(U.check)) + '</button></div></div>' +
        '<div class="eb-step"><h4>' + esc(T(U.fText)) + '</h4><p>' + esc(T(U.fTextH)) + '</p><textarea data-eb="qText" rows="5"></textarea><button type="button" class="eb-b pri" data-eb-act="fText">' + esc(T(U.check)) + '</button></div>' +
        '<div class="eb-step"><h4>' + esc(T(U.fPdf)) + '</h4><input type="file" accept="application/pdf" data-eb="qPdf"></div>' +
        '<div class="eb-step"><h4>' + esc(T(U.fImg)) + '</h4><p>' + esc(T(U.fImgH)) + '</p><input type="file" accept="image/*" data-eb="qImg"><div data-eb="dots"></div></div>' +
        '<div class="eb-out" data-eb="findOut"></div></div>';
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
      if(act === 'make'){ msg(r.id, T(U.building), true); printBook(r).then(function(){ msg(r.id, '', true); }).catch(function(e){ msg(r.id, /nocontent|st4/.test(String(e && e.message)) ? T(U.noContent) : T(U.net)); }); return; }
      if(act === 'copy'){ var t = accLink(r); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ msg(r.id, T(U.copied), true); }, function(){ window.prompt('', t); }); return; }
      if(act === 'evidence'){ printEvidence(r); return; }
      if(act === 'revoke' || act === 'unrevoke'){ api('/api/admin/ebook/update', { method:'POST', json:{ id:r.id, revoke:act === 'revoke' } }).then(function(){ load(); }); return; }
      if(act === 'del'){ if(!window.confirm(T(U.delQ))) return; api('/api/admin/ebook/update', { method:'POST', json:{ id:r.id, delete:true } }).then(function(){ if(S.last && S.last.id === r.id) S.last = null; load(); }); return; }
    });
    sec.addEventListener('click', function(ev){
      var b = ev.target.closest('[data-eb-act]'); if(!b) return;
      var act = b.getAttribute('data-eb-act');
      if(act === 'fCode'){ var q = sec.querySelector('[data-eb="qCode"]').value.trim().toUpperCase(), r = /^\d+$/.test(q) ? bySerial(+q) : byId(q.indexOf('EB-') === 0 ? q : 'EB-' + q); showFind(r ? [{ r:r, via:'vCode' }] : []); }
      if(act === 'fText'){ showFind(analyseText(sec.querySelector('[data-eb="qText"]').value)); }
      if(act === 'dotsReset' && S.dots){ S.dots.pts = []; S.dots.cv.getContext('2d').putImageData(S.dots.base, 0, 0); sec.querySelector('[data-eb="dotsN"]').textContent = '0 / 4'; }
    });
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
      if(ev.target.matches('[data-eb="qPdf"]')){
        var pf = ev.target.files[0]; if(!pf) return;
        sec.querySelector('[data-eb="findOut"]').innerHTML = '<div class="eb-none">' + esc(T(U.tool)) + '</div>';
        pdfText(pf).then(function(t){ showFind(analyseText(t + ' ' + pf.name)); }).catch(function(){ showFind([], 'PDF?'); });
      }
      if(ev.target.matches('[data-eb="qImg"]')){
        var im = ev.target.files[0]; if(!im) return;
        var img = new Image(); img.onload = function(){
          qrFromImage(img).then(function(data){
            var m = data && /EB-[A-Z0-9]{6}/.exec(data), r = m && byId(m[0]);
            if(r) showFind([{ r:r, via:'vQr' }]); else { showFind([], ''); openDots(img); }
          }).catch(function(){ openDots(img); });
        };
        img.src = URL.createObjectURL(im);
      }
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
