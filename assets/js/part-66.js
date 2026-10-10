/* ===========================================================================
   Round AC: "โน้ตลับ / Secret Notes" -- an admin-only notebook inside Terminal
   Admin (Tools group, same place as Elliott Wave Classroom / QR Code). Her
   request: a private place for her own Elliott Wave study notes that can be
   read, copied, added, edited and deleted, and that is encrypted the same way
   as the 50-field login vault.

   How it is protected (three independent layers, same convention as every
   other admin page):
     1. Route gate  -- 'adminnotes' is in LOCKED_ROUTES + ADMIN_ONLY_ROUTES
                       (part-46.js) and NAV_HIDDEN (part-15.js): not in any
                       nav, reachable only from the Terminal Admin panel.
     2. Tier gate   -- this module renders nothing but "Admins only." unless
                       window.__SPZ_TIER() === 'full'.
     3. Encryption  -- the notes themselves are never stored or shipped in
                       plain text. They live in a CASCADE vault: PBKDF2-SHA512
                       (400,000 rounds) -> 5 x [HKDF-SHA384 gate key ->
                       AES-CTR gate seed -> PBKDF2-SHA256 (120,000) ->
                       HMAC-SHA512 mix] -> HKDF-SHA512 -> AES-CTR inner +
                       AES-GCM outer (tamper detection). Same construction as
                       index.html / ADMIN_GENERATOR.html, one notch heavier on
                       the first stretch. The key is derived from a notes
                       passphrase she types (or pastes her 800-character
                       master code); it lives in memory only while unlocked and
                       is wiped on Lock / idle 5 min / leaving this page.

   Storage: the repo ships one encrypted starter vault (assets/data/
   notes.vault.json -- safe to be public, it is ciphertext). Every edit is
   re-encrypted in the browser and saved to localStorage; an encrypted backup
   can be downloaded / imported at any time. Nothing is ever sent to a server.
   =========================================================================== */
(function(){
  'use strict';

  var ROUTE = 'adminnotes';
  var LS_VAULT = 'spz_notes_vault_v1';
  var LS_DIRTY = 'spz_notes_dirty_v1';
  var LS_BACKUP = 'spz_notes_backup_ts_v1';
  var SEED_URL = 'assets/data/notes.vault.json';
  var L1_ITER_DEFAULT = 300000, L1_ITER_NEW = 400000, CYCLES = 5, CYC_ITER = 120000;
  var IDLE_MS = 5 * 60 * 1000;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); return true; } catch(e){ return false; } }

  var UI = {
    eb:   { en:'ADMIN · EDITOR', th:'แอดมิน · EDITOR' },
    h:    { en:'Notes', th:'โน้ต' },
    roNote: { en:'Editor view — read only.', th:'มุมมอง Editor — อ่านได้อย่างเดียว' },
    autoOpen: { en:'Opening your notes…', th:'กำลังเปิดโน้ต…' },
    lede: { en:'Your private study notes. Encrypted in this browser with the same CASCADE construction as the 50-field login — nothing is stored or sent in plain text.',
            th:'โน้ตส่วนตัวสำหรับจดความเข้าใจของเธอ เข้ารหัสในเบราว์เซอร์ด้วยระบบ CASCADE แบบเดียวกับรหัส 50 ช่อง ไม่มีอะไรถูกเก็บหรือส่งออกเป็นข้อความธรรมดา' },
    adminOnly: { en:'This page is only available to the site admin.', th:'หน้านี้ใช้ได้เฉพาะแอดมินของเว็บไซต์เท่านั้น' },
    lockTitle: { en:'Notes are locked', th:'โน้ตถูกล็อกอยู่' },
    lockLede:  { en:'Enter your notes passphrase (or paste the 800-character master code) to open them.',
                 th:'ใส่รหัสโน้ต (หรือวางรหัสหลัก 800 ตัวอักษร) เพื่อเปิดอ่าน' },
    passPh:    { en:'Notes passphrase', th:'รหัสโน้ต' },
    unlock:    { en:'Unlock', th:'ปลดล็อก' },
    unlocking: { en:'Unlocking… the cascade is slow on purpose', th:'กำลังปลดล็อก… ระบบตั้งใจให้ช้าเพื่อความปลอดภัย' },
    saving:    { en:'Encrypting…', th:'กำลังเข้ารหัส…' },
    badPass:   { en:'Wrong passphrase, or the vault was tampered with.', th:'รหัสไม่ถูกต้อง หรือข้อมูลถูกแก้ไข' },
    loadFail:  { en:'Could not load the notes vault. You can import a backup file instead.', th:'โหลดตู้โน้ตไม่สำเร็จ นำเข้าไฟล์สำรองแทนได้' },
    srcLocal:  { en:'Opened from this browser’s saved copy', th:'เปิดจากสำเนาที่บันทึกในเบราว์เซอร์นี้' },
    srcSeed:   { en:'Opened from the starter vault', th:'เปิดจากตู้โน้ตเริ่มต้น' },
    bulkBtn:   { en:'📋 Paste all 50 lines at once', th:'📋 วางรหัสทีเดียว 50 ชุด' },
    bulkPh:    { en:'Paste the whole code here (e.g. "01. xxxx", "02. xxxx" …) — numbers are stripped automatically', th:'วางรหัสทั้งหมดตรงนี้ (เช่น "01. xxxx" "02. xxxx" …) ระบบตัดเลขนำหน้าให้เอง' },
    spreadBtn: { en:'↳ Spread into the passphrase', th:'↳ กระจายลงช่องรหัส' },
    spreadOk:  { en:'Filled {n}/50 slots · {c} characters — now press Unlock', th:'ใส่แล้ว {n}/50 ช่อง · {c} ตัวอักษร — กดปลดล็อกได้เลย' },
    spreadNone:{ en:'Nothing to spread — paste your code first.', th:'ยังไม่มีรหัส — วางรหัสก่อนนะ' },
    importLink:{ en:'Import a backup file', th:'นำเข้าไฟล์สำรอง' },
    add:       { en:'+ New note', th:'+ โน้ตใหม่' },
    search:    { en:'Search notes…', th:'ค้นหาโน้ต…' },
    allTags:   { en:'All', th:'ทั้งหมด' },
    lockNow:   { en:'Lock now', th:'ล็อกเลย' },
    exportBtn: { en:'Backup', th:'สำรอง' },
    importBtn: { en:'Import', th:'นำเข้า' },
    passBtn:   { en:'Change passphrase', th:'เปลี่ยนรหัสโน้ต' },
    empty:     { en:'No notes yet. Add your first one.', th:'ยังไม่มีโน้ต เพิ่มโน้ตแรกได้เลย' },
    noMatch:   { en:'No notes match.', th:'ไม่พบโน้ตที่ตรงกัน' },
    back:      { en:'← All notes', th:'← โน้ตทั้งหมด' },
    copy:      { en:'Copy', th:'คัดลอก' },
    copied:    { en:'Copied!', th:'คัดลอกแล้ว!' },
    edit:      { en:'Edit', th:'แก้ไข' },
    del:       { en:'Delete', th:'ลบ' },
    updated:   { en:'Updated', th:'แก้ไขล่าสุด' },
    newTitle:  { en:'New note', th:'โน้ตใหม่' },
    editTitle: { en:'Edit note', th:'แก้ไขโน้ต' },
    fTitle:    { en:'Title', th:'หัวข้อ' },
    fTags:     { en:'Tags (comma separated)', th:'แท็ก (คั่นด้วยจุลภาค)' },
    fBody:     { en:'Note', th:'เนื้อหา' },
    fBodyHint: { en:'Tip: start a line with "- " for a bullet, wrap words in **double stars** for bold.', th:'เคล็ดลับ: ขึ้นบรรทัดด้วย "- " เป็นหัวข้อย่อย, ใส่ **ดาวสองดอก** คร่อมคำเพื่อทำตัวหนา' },
    fGraphic:  { en:'Animated diagram', th:'กราฟิกเคลื่อนไหว' },
    gNone:     { en:'None', th:'ไม่มี' },
    save:      { en:'Save', th:'บันทึก' },
    cancel:    { en:'Cancel', th:'ยกเลิก' },
    needTitle: { en:'Please give the note a title.', th:'ใส่หัวข้อโน้ตก่อน' },
    delTitle:  { en:'Delete this note?', th:'ลบโน้ตนี้?' },
    delBody:   { en:'This cannot be undone (unless you have a backup).', th:'ลบแล้วกู้คืนไม่ได้ (นอกจากมีไฟล์สำรอง)' },
    passTitle: { en:'Change notes passphrase', th:'เปลี่ยนรหัสโน้ต' },
    passNew:   { en:'New passphrase (8+ characters, or paste the 800-character master code)', th:'รหัสโน้ตใหม่ (8 ตัวขึ้นไป หรือวางรหัสหลัก 800 ตัว)' },
    passAgain: { en:'Repeat the new passphrase', th:'พิมพ์รหัสใหม่อีกครั้ง' },
    passShort: { en:'Too short — use at least 8 characters.', th:'สั้นเกินไป ใช้อย่างน้อย 8 ตัวอักษร' },
    passMismatch: { en:'The two entries do not match.', th:'พิมพ์สองครั้งไม่ตรงกัน' },
    passDone:  { en:'Passphrase changed. Download a fresh backup now.', th:'เปลี่ยนรหัสแล้ว แนะนำให้ดาวน์โหลดไฟล์สำรองใหม่ตอนนี้' },
    impTitle:  { en:'Import a backup', th:'นำเข้าไฟล์สำรอง' },
    impPass:   { en:'Passphrase of that backup', th:'รหัสโน้ตของไฟล์สำรองนั้น' },
    impPick:   { en:'Choose backup file', th:'เลือกไฟล์สำรอง' },
    impBad:    { en:'That file is not a notes backup.', th:'ไฟล์นี้ไม่ใช่ไฟล์สำรองโน้ต' },
    impWarn:   { en:'This replaces ALL notes currently saved in this browser.', th:'การนำเข้าจะแทนที่โน้ตทั้งหมดที่บันทึกในเบราว์เซอร์นี้' },
    impGo:     { en:'Import', th:'นำเข้า' },
    backedUp:  { en:'Backup downloaded.', th:'ดาวน์โหลดไฟล์สำรองแล้ว' },
    lastBackup:{ en:'Last backup', th:'สำรองล่าสุด' },
    never:     { en:'never', th:'ยังไม่เคย' },
    sinceBackup:{ en:'edits since', th:'แก้ไขหลังสำรอง' },
    idleNote:  { en:'Auto-locks after 5 minutes of inactivity.', th:'ล็อกอัตโนมัติเมื่อไม่ได้ใช้งาน 5 นาที' },
    verify:    { en:'Not yet checked against the source book', th:'ยังไม่ได้ตรวจกับต้นฉบับ' },
    diagram:   { en:'Animated diagram', th:'กราฟิกประกอบ' },
    toastSaved:{ en:'Saved & encrypted.', th:'บันทึกและเข้ารหัสแล้ว' }
  };

  /* ===================================================================
     CASCADE core -- same functions as ADMIN_GENERATOR.html / index.html.
     v:4 vaults use 300k first-stretch rounds; v:5 (this module) stores its
     own round count in `it` so the number can be raised later.
     =================================================================== */
  var subtle = window.crypto && window.crypto.subtle;
  var te = new TextEncoder(), td = new TextDecoder();

  function u8cat(){
    var a = Array.prototype.slice.call(arguments), n = 0, i;
    for(i = 0; i < a.length; i++) n += a[i].length;
    var o = new Uint8Array(n), off = 0;
    for(i = 0; i < a.length; i++){ o.set(a[i], off); off += a[i].length; }
    return o;
  }
  function b64(u){ var s = '', i; for(i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  function unb64(s){ var b = atob(s), o = new Uint8Array(b.length), i; for(i = 0; i < b.length; i++) o[i] = b.charCodeAt(i); return o; }
  function rand(n){ return window.crypto.getRandomValues(new Uint8Array(n)); }
  function pbkdf2Bits(keyBytes, salt, iter, hash, bits){
    return subtle.importKey('raw', keyBytes, 'PBKDF2', false, ['deriveBits']).then(function(base){
      return subtle.deriveBits({ name:'PBKDF2', hash:hash, salt:salt, iterations:iter }, base, bits);
    }).then(function(b){ return new Uint8Array(b); });
  }
  function hkdfAesKey(ikm, salt, info, hash, algo, usages){
    return subtle.importKey('raw', ikm, 'HKDF', false, ['deriveKey']).then(function(base){
      return subtle.deriveKey({ name:'HKDF', hash:hash, salt:salt, info:info }, base, algo, false, usages);
    });
  }
  function aesCtr(mode, key, counter, data){
    var op = mode === 'encrypt' ? subtle.encrypt.bind(subtle) : subtle.decrypt.bind(subtle);
    return op({ name:'AES-CTR', counter:counter, length:64 }, key, data).then(function(o){ return new Uint8Array(o); });
  }
  function hmacSha512(keyBytes, msg){
    return subtle.importKey('raw', keyBytes, { name:'HMAC', hash:'SHA-512' }, false, ['sign']).then(function(k){
      return subtle.sign('HMAC', k, msg);
    }).then(function(s){ return new Uint8Array(s); });
  }
  function loopGenerate(state0, s2, s3, s4){
    var state = state0, c = 0, gates = [];
    function step(){
      if(c >= CYCLES) return Promise.resolve({ state:state, gates:gates });
      var cc = c, seed = rand(32);
      return hkdfAesKey(state, s2, te.encode('SPACEZ/GATE/' + cc), 'SHA-384', { name:'AES-CTR', length:256 }, ['encrypt']).then(function(gk){
        var iv = rand(16);
        return aesCtr('encrypt', gk, iv, seed).then(function(ct){ gates.push({ iv:b64(iv), ct:b64(ct) }); });
      }).then(function(){
        return pbkdf2Bits(seed, u8cat(s3, new Uint8Array([cc])), CYC_ITER, 'SHA-256', 512);
      }).then(function(st){
        return hmacSha512(st, u8cat(state, s4, te.encode('SPACEZ/MIX/' + cc)));
      }).then(function(ns){ state = ns; c++; return step(); });
    }
    return step();
  }
  function loopVerify(state0, s2, s3, s4, gates){
    var state = state0, c = 0;
    function step(){
      if(c >= CYCLES) return Promise.resolve(state);
      var cc = c;
      return hkdfAesKey(state, s2, te.encode('SPACEZ/GATE/' + cc), 'SHA-384', { name:'AES-CTR', length:256 }, ['decrypt']).then(function(gk){
        return aesCtr('decrypt', gk, unb64(gates[cc].iv), unb64(gates[cc].ct));
      }).then(function(seed){
        return pbkdf2Bits(seed, u8cat(s3, new Uint8Array([cc])), CYC_ITER, 'SHA-256', 512);
      }).then(function(st){
        return hmacSha512(st, u8cat(state, s4, te.encode('SPACEZ/MIX/' + cc)));
      }).then(function(ns){ state = ns; c++; return step(); });
    }
    return step();
  }
  function finalKeys(state, s4, usages){
    return Promise.all([
      hkdfAesKey(state, s4, te.encode('SPACEZ/FINAL/CTR'), 'SHA-512', { name:'AES-CTR', length:256 }, usages),
      hkdfAesKey(state, s4, te.encode('SPACEZ/FINAL/GCM'), 'SHA-512', { name:'AES-GCM', length:256 }, usages)
    ]).then(function(r){ return { kCtr:r[0], kGcm:r[1] }; });
  }
  function generateVault(password, payload){
    var s1 = rand(16), s2 = rand(16), s3 = rand(16), s4 = rand(16);
    return pbkdf2Bits(te.encode(password), s1, L1_ITER_NEW, 'SHA-512', 512).then(function(st0){
      return loopGenerate(st0, s2, s3, s4);
    }).then(function(r){
      return finalKeys(r.state, s4, ['encrypt']).then(function(k){
        var ctrIv = rand(16);
        return aesCtr('encrypt', k.kCtr, ctrIv, te.encode(JSON.stringify(payload))).then(function(mid){
          var iv = rand(12);
          return subtle.encrypt({ name:'AES-GCM', iv:iv, tagLength:128 }, k.kGcm, mid).then(function(ct){
            return { v:5, it:L1_ITER_NEW, s1:b64(s1), s2:b64(s2), s3:b64(s3), s4:b64(s4),
                     gates:r.gates, ctrIv:b64(ctrIv), iv:b64(iv), ct:b64(new Uint8Array(ct)) };
          });
        });
      });
    });
  }
  function openVault(vault, password){
    return Promise.resolve().then(function(){
      if(!vault || !vault.gates || vault.gates.length !== CYCLES || (vault.v !== 4 && vault.v !== 5)) throw new Error('shape');
      var it = vault.v === 5 ? (vault.it | 0) : L1_ITER_DEFAULT;
      if(it < 100000 || it > 5000000) throw new Error('shape');
      var s1 = unb64(vault.s1), s2 = unb64(vault.s2), s3 = unb64(vault.s3), s4 = unb64(vault.s4);
      return pbkdf2Bits(te.encode(password), s1, it, 'SHA-512', 512).then(function(st0){
        return loopVerify(st0, s2, s3, s4, vault.gates);
      }).then(function(state){ return finalKeys(state, s4, ['decrypt']); }).then(function(k){
        return subtle.decrypt({ name:'AES-GCM', iv:unb64(vault.iv), tagLength:128 }, k.kGcm, unb64(vault.ct)).then(function(mid){
          return aesCtr('decrypt', k.kCtr, unb64(vault.ctrIv), new Uint8Array(mid));
        });
      }).then(function(plain){
        var d = JSON.parse(td.decode(plain));
        if(!d || !Array.isArray(d.notes)) throw new Error('bad');
        return d;
      });
    }).catch(function(){ throw new Error('Tampering Detected'); });
  }

  /* ===================================================================
     Animated diagrams (inline SVG, CSS-only loops). Each is attached to a
     note by key via the note's `graphic` field.
     =================================================================== */
  var GRAPHICS = {
    tritypes: {
      label: { en:'Triangle types + "Running"', th:'ชนิดของ Triangle + "Running"' },
      cap:   { en:'Contracting, Barrier and Expanding are the three forms. "Running" is not a fourth form — it only says wave B went past the start of wave A, and can be added to any of the three.',
               th:'Triangle มี 3 รูปแบบ: Contracting, Barrier, Expanding ส่วน "Running" ไม่ใช่รูปแบบที่ 4 — เป็นแค่คำบอกว่าคลื่น B วิ่งเลยจุดเริ่มต้นของคลื่น A ใช้ต่อท้ายได้ทั้ง 3 แบบ' },
      svg: function(){
        function tri(ox, title, lines, pts, delay){
          var labels = ['A','B','C','D','E'], i, path = 'M' + pts[0][0] + ' ' + pts[0][1];
          for(i = 1; i < pts.length; i++) path += ' L' + pts[i][0] + ' ' + pts[i][1];
          var lab = '';
          for(i = 1; i < pts.length; i++){
            var up = i % 2 === 0, p = pts[i];
            lab += '<text class="anx-pl" x="' + p[0] + '" y="' + (up ? p[1] - 8 : p[1] + 17) + '" text-anchor="middle" style="animation-delay:' + (delay + i * 0.45) + 's">' + labels[i - 1] + '</text>';
          }
          return '<g transform="translate(' + ox + ',34)">' +
            '<text class="anx-ph" x="115" y="-12" text-anchor="middle">' + title + '</text>' + lines +
            '<path class="anx-draw" pathLength="1" d="' + path + '" style="animation-delay:' + delay + 's"/>' + lab + '</g>';
        }
        function ln(x1, y1, x2, y2){ return '<line class="anx-boundary" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'; }
        var c = tri(10, 'Contracting',
          ln(20, 60, 225, 138) + ln(20, 227, 225, 153),
          [[20,70],[60,215],[95,95],[140,185],[170,120],[205,160]], 0);
        var b = tri(260, 'Barrier',
          ln(20, 100, 225, 100) + ln(20, 227, 225, 153),
          [[20,70],[60,215],[95,100],[140,185],[170,100],[205,150]], 0.4);
        var e = tri(510, 'Expanding',
          ln(20, 134, 225, 18) + ln(20, 134, 225, 262),
          [[20,95],[45,150],[80,100],[125,200],[160,55],[205,235]], 0.8);
        var run =
          '<g transform="translate(10,326)">' +
            '<text class="anx-ph" x="115" y="-12" text-anchor="middle">Running</text>' +
            '<line class="anx-dash" x1="0" y1="52" x2="190" y2="52"/>' +
            '<path class="anx-draw run" pathLength="1" d="M20 52 L60 175 L95 14 L140 150 L170 55 L205 130" style="animation-delay:1.2s"/>' +
            '<text class="anx-ptxt" x="-6" y="44" style="animation-delay:2.4s">จุดเริ่ม A</text>' +
            '<g class="anx-fade" style="animation-delay:2.6s"><circle cx="95" cy="14" r="6" class="anx-ring"/><text class="anx-ptxt hl" x="110" y="20">B เลยจุดเริ่ม A</text></g>' +
          '</g>' +
          '<g class="anx-fade" style="animation-delay:1.6s" transform="translate(280,306)">' +
            '<rect class="anx-box" x="0" y="0" width="470" height="150" rx="12"/>' +
            '<text class="anx-ptxt hl" x="18" y="30">Running = คำขยาย ไม่ใช่รูปแบบที่ 4</text>' +
            '<text class="anx-ptxt" x="18" y="58">• ใช้บอกว่าคลื่น B วิ่ง "เลยจุดเริ่มต้น" ของคลื่น A เท่านั้น</text>' +
            '<text class="anx-ptxt" x="18" y="82">• เอาไปต่อหน้าได้ทั้ง Contracting / Barrier / Expanding</text>' +
            '<text class="anx-ptxt" x="18" y="106">• ขา A-B-C-D-E ทุกขาเป็นคลื่น 3 (3-3-3-3-3)</text>' +
            '<text class="anx-ptxt dim" x="18" y="132">ลองดูภาพซ้ายมือ: เส้นประ = จุดเริ่มของ A</text>' +
          '</g>';
        return '<svg viewBox="0 0 770 500" class="anx-svg" role="img" aria-label="Triangle types">' + c + b + e + run + '</svg>';
      }
    },

    diaglen: {
      label: { en:'Diagram: Contracting vs Expanding by length', th:'Diagonal: วัดความยาวคลื่น Contracting / Expanding' },
      cap:   { en:'Contracting vs Expanding is decided by measuring waves 1, 3 and 5 — not by how the shape looks. Leading / Ending only says where it occurs.',
               th:'Contracting / Expanding ตัดสินจากการวัดความยาวคลื่น 1, 3, 5 ไม่ใช่จากหน้าตา ส่วน Leading / Ending บอกแค่ตำแหน่งที่เกิด' },
      svg: function(){
        function diag(ox, title, pts, upper, lower, bars, verdict, cls, delay){
          var i, path = 'M' + pts[0][0] + ' ' + pts[0][1];
          for(i = 1; i < pts.length; i++) path += ' L' + pts[i][0] + ' ' + pts[i][1];
          var wl = '';
          for(i = 1; i < pts.length; i++){
            var up = i % 2 === 1;
            wl += '<text class="anx-pl" x="' + pts[i][0] + '" y="' + (up ? pts[i][1] - 8 : pts[i][1] + 17) + '" text-anchor="middle" style="animation-delay:' + (delay + i * 0.4) + 's">' + i + '</text>';
          }
          var barsSvg = '';
          for(i = 0; i < 3; i++){
            var bx = 60 + i * 70, h = bars[i];
            barsSvg += '<rect class="anx-bar ' + cls + '" x="' + bx + '" y="' + (334 - h) + '" width="38" height="' + h + '" rx="5" style="animation-delay:' + (delay + 2.4 + i * 0.35) + 's"/>' +
                       '<text class="anx-ptxt" x="' + (bx + 19) + '" y="354" text-anchor="middle">' + (i * 2 + 1) + '</text>';
          }
          return '<g transform="translate(' + ox + ',24)">' +
            '<text class="anx-ph" x="140" y="-4" text-anchor="middle">' + title + '</text>' +
            '<line class="anx-boundary" x1="' + upper[0] + '" y1="' + upper[1] + '" x2="' + upper[2] + '" y2="' + upper[3] + '"/>' +
            '<line class="anx-boundary" x1="' + lower[0] + '" y1="' + lower[1] + '" x2="' + lower[2] + '" y2="' + lower[3] + '"/>' +
            '<path class="anx-draw ' + cls + '" pathLength="1" d="' + path + '" style="animation-delay:' + delay + 's"/>' + wl + barsSvg +
            '<text class="anx-ptxt dim" x="140" y="374" text-anchor="middle">ความยาวคลื่น 1 · 3 · 5</text>' +
            '<g class="anx-fade" style="animation-delay:' + (delay + 3.6) + 's"><rect class="anx-chip ' + cls + '" x="10" y="384" width="260" height="34" rx="17"/>' +
            '<text class="anx-ptxt hl ' + cls + '" x="140" y="406" text-anchor="middle">' + verdict + '</text></g>' +
          '</g>';
        }
        var left = diag(10, 'Contracting',
          [[20,250],[95,150],[125,185],[190,105],[215,135],[255,80]],
          [95,150,255,80], [20,250,215,135],
          [74, 56, 38], '1 > 3 > 5  →  Contracting', 'c', 0);
        var right = diag(400, 'Expanding',
          [[20,230],[70,200],[95,215],[150,150],[175,185],[255,70]],
          [70,200,255,70], [20,230,175,185],
          [22, 46, 82], '1 < 3 < 5  →  Expanding', 'e', 0.6);
        var note =
          '<g class="anx-fade" style="animation-delay:4.8s" transform="translate(10,454)">' +
            '<rect class="anx-box" x="0" y="0" width="750" height="62" rx="12"/>' +
            '<text class="anx-ptxt hl" x="16" y="26">ระวัง: รูปทรงอาจ "ดูเหมือน" Contracting แต่วัดแล้วคลื่น 5 ยาวกว่าคลื่น 3 → เป็น Expanding</text>' +
            '<text class="anx-ptxt dim" x="16" y="48">Leading / Ending = ตำแหน่งที่เกิด (ต้นคลื่น / ปลายคลื่น) · Contracting / Expanding = รูปแบบ ตัดสินด้วยความยาว</text>' +
          '</g>';
        return '<svg viewBox="0 0 770 530" class="anx-svg" role="img" aria-label="Diagonal measured by wave length">' + left + right + note + '</svg>';
      }
    },

    triposition: {
      label: { en:'Triangle position inside combinations', th:'ตำแหน่ง Triangle ใน Combination' },
      cap:   { en:'A triangle is the pattern just before the final move, so inside a combination it sits near the end — and only one triangle per combination.',
               th:'Triangle คือคลื่นชุดก่อนคลื่นสุดท้าย จึงอยู่ท้าย ๆ ของ Combination และมีได้แค่ตัวเดียวต่อหนึ่ง Combination' },
      svg: function(){
        function row(y, title, names, okIdx, delay){
          var w = 92, gap = 36, x0 = 36, i, out = '<text class="anx-ph" x="36" y="' + (y - 14) + '">' + title + '</text>';
          for(i = 0; i < names.length; i++){
            var x = x0 + i * (w + gap), ok = okIdx.indexOf(i) > -1;
            out += '<g class="anx-fade" style="animation-delay:' + (delay + i * 0.3) + 's">' +
              '<rect class="anx-block' + (ok ? ' ok' : '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="56" rx="12"/>' +
              '<text class="anx-bt" x="' + (x + w / 2) + '" y="' + (y + 35) + '" text-anchor="middle">' + names[i] + '</text></g>';
            if(i < names.length - 1) out += '<g class="anx-fade" style="animation-delay:' + (delay + i * 0.3 + 0.15) + 's"><path class="anx-link" d="M' + (x + w + 6) + ' ' + (y + 28) + ' L' + (x + w + gap - 6) + ' ' + (y + 28) + '"/></g>';
            if(ok){
              var alt = okIdx[0] === i ? 'a' : 'b';
              out += '<g class="anx-pick ' + alt + '" style="animation-delay:' + (delay + 1.8) + 's"><rect class="anx-pickring" x="' + (x - 5) + '" y="' + (y - 5) + '" width="' + (w + 10) + '" height="66" rx="15"/>' +
                '<text class="anx-tri" x="' + (x + w / 2) + '" y="' + (y + 84) + '" text-anchor="middle">▲ Triangle ได้</text></g>';
            }
          }
          return out;
        }
        var s = row(60, 'Double Three  (W-X-Y)', ['W', 'X', 'Y'], [1, 2], 0) +
                row(220, 'Triple Three  (W-X-Y-X-Z)', ['W', 'X', 'Y', 'X', 'Z'], [3, 4], 1.4);
        s += '<g class="anx-fade" style="animation-delay:3.2s" transform="translate(36,360)">' +
               '<rect class="anx-box" x="0" y="0" width="700" height="96" rx="12"/>' +
               '<text class="anx-ptxt hl" x="16" y="28">เลือกได้ "ตัวเดียว" ต่อหนึ่ง Combination — วงสีเขียวจะสลับตำแหน่งให้ดู</text>' +
               '<text class="anx-ptxt" x="16" y="54">• Double (W-X-Y): เกิดที่ X หรือ Y อย่างใดอย่างหนึ่ง</text>' +
               '<text class="anx-ptxt" x="16" y="76">• Triple (W-X-Y-X-Z): เกิดที่ X ตัวที่ 2 หรือ Z อย่างใดอย่างหนึ่ง</text>' +
             '</g>';
        return '<svg viewBox="0 0 770 480" class="anx-svg" role="img" aria-label="Triangle positions in combinations">' + s + '</svg>';
      }
    }
  };

  /* ===================================================================
     Starter note texts live ONLY inside the encrypted vault -- nothing here.
     =================================================================== */

  var S = { vault:null, vaultSrc:'', data:null, pass:null, openId:null, q:'', tag:'', busy:false, busyMsg:'', msg:'', err:'', modal:null, lastActive:0 };
  var sec = null, idleTimer = null, copiedTimer = null, toastTimer = null;

  /* Round AD: Admin and Editor can both open Notes without typing a
     passphrase. Editor opens a separate copy of the vault encrypted with
     the Editor code (assets/data/notes.editor.vault.json) and is read-only.
     Admin opens the main vault with the passphrase remembered on this
     device after the first successful unlock (localStorage, this browser
     only) -- the lock form only appears the first time on a new device. */
  var LS_PASS = 'spz_notes_pass_v1';
  var EDITOR_SEED_URL = 'assets/data/notes.editor.vault.json';
  function tier(){ try { return window.__SPZ_TIER ? window.__SPZ_TIER() : 'basic'; } catch(e){ return 'basic'; } }
  function isAdmin(){ var t = tier(); return t === 'full' || t === 'editor'; }
  function isEditor(){ return tier() === 'editor'; }
  function onPage(){ return (location.hash || '') === '#/' + ROUTE; }
  function autoUnlock(){
    if(S.data || S.busy || S.autoTried || !onPage()) return;
    S.autoTried = true;
    if(isEditor()){
      var code = ''; try { code = sessionStorage.getItem('spz_editor_code') || ''; } catch(e){}
      if(!code) return;
      S.busy = true; S.err = ''; S.ro = true;
      fetch(EDITOR_SEED_URL, { cache:'no-store' }).then(function(r){ if(!r.ok) throw new Error('http'); return r.json(); }).then(function(v){
        S.vault = v; S.vaultSrc = T(UI.srcSeed);
        return openVault(v, code);
      }).then(function(d){ S.data = d; S.pass = null; S.busy = false; touch(); startIdle(); paint(); })
        .catch(function(){ S.busy = false; S.err = T(UI.loadFail); paint(); });
      paint();
      return;
    }
    var pass = lsGet(LS_PASS);
    if(pass) unlock(pass);
  }
  function touch(){ S.lastActive = Date.now(); }
  function fmtDate(ts){
    try { return new Date(ts).toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); } catch(e){ return ''; }
  }
  function dirtyCount(){ return parseInt(lsGet(LS_DIRTY) || '0', 10) || 0; }
  function bumpDirty(){ lsSet(LS_DIRTY, String(dirtyCount() + 1)); }

  /* very small formatter: **bold**, "- " bullets, "※ " side-notes, blank-line paragraphs */
  function fmt(body){
    var lines = String(body || '').split(/\r?\n/), out = '', inList = false;
    function inline(t){ return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }
    lines.forEach(function(raw){
      var ln = raw.replace(/\s+$/, '');
      if(/^-\s+/.test(ln)){
        if(!inList){ out += '<ul>'; inList = true; }
        out += '<li>' + inline(ln.replace(/^-\s+/, '')) + '</li>';
        return;
      }
      if(inList){ out += '</ul>'; inList = false; }
      if(!ln){ return; }
      if(/^※\s*/.test(ln)) out += '<p class="anx-aside">' + inline(ln.replace(/^※\s*/, '')) + '</p>';
      else out += '<p>' + inline(ln) + '</p>';
    });
    if(inList) out += '</ul>';
    return out;
  }

  function allTags(){
    var seen = {}, list = [];
    (S.data ? S.data.notes : []).forEach(function(n){ (n.tags || []).forEach(function(t){ if(t && !seen[t]){ seen[t] = 1; list.push(t); } }); });
    return list.sort();
  }


  /* ---------- paste-friendly master code ----------
     The 50-field admin code is stored as "01. frag / 02. frag / ..." lines.
     A one-line password box swallows the line breaks and keeps the "01."
     labels, so the code never matched. normPass() mirrors the admin login's
     Spread button: it finds each "NN. frag" pair, places it in slot NN and
     joins the slots in order (800 chars). Anything that does not look like a
     numbered/multi-line code is returned untouched, so a normal passphrase
     (even one with spaces) behaves exactly as before. */
  function parseSlots(text){
    var by = {}, n = 0, m, k;
    var re = /(?:^|\s)(\d{1,2})\s*[.):]\s*(\S+)/g;
    while((m = re.exec(text))){
      k = parseInt(m[1], 10);
      if(k >= 1 && k <= 50 && !by[k]){ by[k] = m[2]; n++; }
    }
    if(n < 3){
      by = {}; n = 0;
      String(text).split(/\r?\n/).forEach(function(line){
        var l = /^\s*(\d{1,2})\s+(\S+)\s*$/.exec(line);
        if(l){ k = parseInt(l[1], 10); if(k >= 1 && k <= 50 && !by[k]){ by[k] = l[2]; n++; } }
      });
    }
    if(n < 3){
      var toks = String(text).split(/\s+/).filter(Boolean);
      by = {}; n = 0;
      if(toks.length >= 20){ toks.forEach(function(t, i){ if(i < 50){ by[i + 1] = t; n++; } }); }
    }
    return n >= 3 ? { by:by, n:n } : null;
  }
  function normPass(raw){
    var text = String(raw == null ? '' : raw);
    var r = parseSlots(text);
    if(!r) return text;
    return Object.keys(r.by).map(Number).sort(function(a, b){ return a - b; }).map(function(k){ return r.by[k]; }).join('');
  }

  /* ---------- rendering ---------- */
  function lockView(){
    return '<div class="anx-lock">' +
      '<div class="anx-lock-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/></svg></div>' +
      '<h3>' + esc(T(UI.lockTitle)) + '</h3>' +
      '<p>' + esc(T(UI.lockLede)) + '</p>' +
      '<form data-anx-form="unlock" autocomplete="off">' +
        '<input class="anx-input" type="password" name="pass" autocomplete="new-password" spellcheck="false" placeholder="' + esc(T(UI.passPh)) + '"' + (S.busy ? ' disabled' : '') + '>' +
        '<button class="anx-btn pri" type="submit"' + (S.busy ? ' disabled' : '') + '>' + esc(S.busy ? T(UI.unlocking) : T(UI.unlock)) + '</button>' +
      '</form>' +
      '<div class="anx-bulk"><button class="anx-link" type="button" data-anx="bulktoggle">' + esc(T(UI.bulkBtn)) + '</button>' +
        '<div class="anx-bulkbox" hidden>' +
          '<textarea class="anx-input anx-ta" data-anx-in="bulk" rows="6" spellcheck="false" placeholder="' + esc(T(UI.bulkPh)) + '"></textarea>' +
          '<button class="anx-btn" type="button" data-anx="spread">' + esc(T(UI.spreadBtn)) + '</button>' +
          '<div class="anx-spreadmsg" aria-live="polite"></div>' +
        '</div></div>' +
      (S.err ? '<div class="anx-err">' + esc(S.err) + '</div>' : '') +
      '<div class="anx-lock-foot"><button class="anx-link" type="button" data-anx="import">' + esc(T(UI.importLink)) + '</button></div>' +
    '</div>';
  }

  function listView(){
    var q = S.q.trim().toLowerCase(), tag = S.tag;
    var notes = S.data.notes.slice().sort(function(a, b){ return (b.updated || 0) - (a.updated || 0); }).filter(function(n){
      if(tag && (n.tags || []).indexOf(tag) === -1) return false;
      if(!q) return true;
      return (n.title + ' ' + (n.tags || []).join(' ') + ' ' + n.body).toLowerCase().indexOf(q) > -1;
    });
    var tags = allTags();
    var tagBar = '<div class="anx-tags"><button type="button" class="anx-tag' + (!tag ? ' on' : '') + '" data-anx="tag" data-v="">' + esc(T(UI.allTags)) + '</button>' +
      tags.map(function(t){ return '<button type="button" class="anx-tag' + (tag === t ? ' on' : '') + '" data-anx="tag" data-v="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>';
    var cards = notes.map(function(n){
      var prev = String(n.body || '').replace(/\*\*/g, '').replace(/^- /gm, '• ').replace(/\s+/g, ' ').slice(0, 130);
      return '<article class="anx-card" tabindex="0" data-anx="open" data-id="' + esc(n.id) + '">' +
        '<h4>' + esc(n.title) + '</h4>' +
        '<p>' + esc(prev) + (String(n.body || '').length > 130 ? '…' : '') + '</p>' +
        '<div class="anx-card-foot">' + (n.tags || []).map(function(t){ return '<span class="anx-chip">' + esc(t) + '</span>'; }).join('') +
        (n.graphic && GRAPHICS[n.graphic] ? '<span class="anx-chip g">▶ ' + esc(T(UI.diagram)) + '</span>' : '') +
        '<span class="anx-date">' + esc(fmtDate(n.updated || n.created)) + '</span></div></article>';
    }).join('');
    var bk = parseInt(lsGet(LS_BACKUP) || '0', 10);
    return '<div class="anx-bar">' +
        '<button class="anx-btn pri" type="button" data-anx="new">' + esc(T(UI.add)) + '</button>' +
        '<input class="anx-input anx-search" type="search" data-anx-in="q" value="' + esc(S.q) + '" placeholder="' + esc(T(UI.search)) + '">' +
        '<span class="anx-sp"></span>' +
        '<button class="anx-btn" type="button" data-anx="export">' + esc(T(UI.exportBtn)) + '</button>' +
        '<button class="anx-btn" type="button" data-anx="import">' + esc(T(UI.importBtn)) + '</button>' +
        '<button class="anx-btn" type="button" data-anx="changepass">' + esc(T(UI.passBtn)) + '</button>' +
        '<button class="anx-btn warn" type="button" data-anx="lock">' + esc(T(UI.lockNow)) + '</button>' +
      '</div>' + tagBar +
      '<div class="anx-meta">' + esc(S.vaultSrc) + ' · ' + esc(T(UI.lastBackup)) + ': ' + esc(bk ? fmtDate(bk) : T(UI.never)) + ' · ' + esc(String(dirtyCount())) + ' ' + esc(T(UI.sinceBackup)) + ' · ' + esc(T(UI.idleNote)) + '</div>' +
      (cards ? '<div class="anx-grid">' + cards + '</div>' : '<div class="anx-empty">' + esc(S.data.notes.length ? T(UI.noMatch) : T(UI.empty)) + '</div>');
  }

  function noteView(n){
    var g = n.graphic && GRAPHICS[n.graphic];
    return '<div class="anx-bar"><button class="anx-btn" type="button" data-anx="back">' + esc(T(UI.back)) + '</button><span class="anx-sp"></span>' +
        '<button class="anx-btn pri" type="button" data-anx="copy" data-id="' + esc(n.id) + '">' + esc(T(UI.copy)) + '</button>' +
        '<button class="anx-btn" type="button" data-anx="edit" data-id="' + esc(n.id) + '">' + esc(T(UI.edit)) + '</button>' +
        '<button class="anx-btn danger" type="button" data-anx="del" data-id="' + esc(n.id) + '">' + esc(T(UI.del)) + '</button>' +
      '</div>' +
      '<article class="anx-note">' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<div class="anx-note-tags">' + (n.tags || []).map(function(t){ return '<span class="anx-chip">' + esc(t) + '</span>'; }).join('') +
          '<span class="anx-date">' + esc(T(UI.updated)) + ' ' + esc(fmtDate(n.updated || n.created)) + '</span></div>' +
        '<div class="anx-body">' + fmt(n.body) + '</div>' +
        (g ? '<div class="anx-fig"><div class="anx-fig-h">▶ ' + esc(T(g.label)) + '<button type="button" class="anx-link" data-anx="replay">↻</button></div><div data-anx-svg="' + esc(n.graphic) + '">' + g.svg() + '</div><div class="anx-fig-cap">' + esc(T(g.cap)) + '</div></div>' : '') +
      '</article>';
  }

  function modalView(){
    var m = S.modal; if(!m) return '';
    var inner = '';
    if(m.type === 'edit'){
      var n = m.note || {};
      var opts = '<option value="">' + esc(T(UI.gNone)) + '</option>' + Object.keys(GRAPHICS).map(function(k){
        return '<option value="' + k + '"' + (n.graphic === k ? ' selected' : '') + '>' + esc(T(GRAPHICS[k].label)) + '</option>'; }).join('');
      inner = '<h3>' + esc(T(n.id ? UI.editTitle : UI.newTitle)) + '</h3>' +
        '<label>' + esc(T(UI.fTitle)) + '</label><input class="anx-input" data-f="title" value="' + esc(n.title || '') + '">' +
        '<label>' + esc(T(UI.fTags)) + '</label><input class="anx-input" data-f="tags" value="' + esc((n.tags || []).join(', ')) + '">' +
        '<label>' + esc(T(UI.fBody)) + '</label><textarea class="anx-input anx-ta" data-f="body" rows="12">' + esc(n.body || '') + '</textarea>' +
        '<div class="anx-hint">' + esc(T(UI.fBodyHint)) + '</div>' +
        '<label>' + esc(T(UI.fGraphic)) + '</label><select class="anx-input" data-f="graphic">' + opts + '</select>' +
        (m.err ? '<div class="anx-err">' + esc(m.err) + '</div>' : '') +
        '<div class="anx-mact"><button class="anx-btn" type="button" data-anx="mcancel">' + esc(T(UI.cancel)) + '</button><button class="anx-btn pri" type="button" data-anx="msave">' + esc(T(UI.save)) + '</button></div>';
    } else if(m.type === 'del'){
      inner = '<h3>' + esc(T(UI.delTitle)) + '</h3><p class="anx-mp">' + esc(m.title || '') + '</p><p class="anx-mp dim">' + esc(T(UI.delBody)) + '</p>' +
        '<div class="anx-mact"><button class="anx-btn" type="button" data-anx="mcancel">' + esc(T(UI.cancel)) + '</button><button class="anx-btn danger" type="button" data-anx="mdel">' + esc(T(UI.del)) + '</button></div>';
    } else if(m.type === 'pass'){
      inner = '<h3>' + esc(T(UI.passTitle)) + '</h3>' +
        '<label>' + esc(T(UI.passNew)) + '</label><input class="anx-input" type="password" data-f="p1" autocomplete="new-password" spellcheck="false">' +
        '<label>' + esc(T(UI.passAgain)) + '</label><input class="anx-input" type="password" data-f="p2" autocomplete="new-password" spellcheck="false">' +
        (m.err ? '<div class="anx-err">' + esc(m.err) + '</div>' : '') +
        '<div class="anx-mact"><button class="anx-btn" type="button" data-anx="mcancel">' + esc(T(UI.cancel)) + '</button><button class="anx-btn pri" type="button" data-anx="mpass">' + esc(T(UI.save)) + '</button></div>';
    } else if(m.type === 'import'){
      inner = '<h3>' + esc(T(UI.impTitle)) + '</h3><p class="anx-mp dim">' + esc(T(UI.impWarn)) + '</p>' +
        '<label>' + esc(T(UI.impPick)) + '</label><input class="anx-input" type="file" accept=".json,application/json" data-f="file">' +
        '<label>' + esc(T(UI.impPass)) + '</label><input class="anx-input" type="password" data-f="ipass" autocomplete="new-password" spellcheck="false">' +
        (m.err ? '<div class="anx-err">' + esc(m.err) + '</div>' : '') +
        '<div class="anx-mact"><button class="anx-btn" type="button" data-anx="mcancel">' + esc(T(UI.cancel)) + '</button><button class="anx-btn pri" type="button" data-anx="mimport">' + esc(T(UI.impGo)) + '</button></div>';
    }
    return '<div class="anx-modal" data-anx="mbg"><div class="anx-mbox" role="dialog" aria-modal="true">' + inner + '</div></div>';
  }

  function paint(){
    if(!sec) return;
    var body = sec.querySelector('[data-anx-body]');
    var keep = null;
    if(S.modal){ var act = document.activeElement; keep = act && act.getAttribute && act.getAttribute('data-f'); }
    var html;
    if(!isAdmin()) html = '<div class="anx-empty">' + esc(T(UI.adminOnly)) + '</div>';
    else if(!S.data){ autoUnlock(); html = (S.busy || (isEditor() && !S.err)) ? '<div class="anx-empty">' + esc(T(UI.autoOpen)) + '</div>' : lockView(); }
    else if(S.openId){
      var n = S.data.notes.filter(function(x){ return x.id === S.openId; })[0];
      html = n ? noteView(n) : listView();
    } else html = listView();
    if(S.busy && S.data) html += '<div class="anx-busy"><div class="anx-spin"></div><div>' + esc(S.busyMsg) + '</div></div>';
    if(S.msg) html += '<div class="anx-toast">' + esc(S.msg) + '</div>';
    html += modalView();
    if(S.data && S.ro) html = '<div class="anx-ro-note">' + esc(T(UI.roNote)) + '</div>' + html;
    sec.classList.toggle('anx-ro', !!S.ro);
    body.innerHTML = html;
    sec.querySelector('[data-anx-eb]').textContent = T(UI.eb);
    sec.querySelector('[data-anx-h]').textContent = T(UI.h);
    sec.querySelector('[data-anx-lede]').textContent = T(UI.lede);
    if(keep){ var el = sec.querySelector('[data-f="' + keep + '"]'); if(el) el.focus(); }
  }
  function toast(msg){
    S.msg = msg; paint(); clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ S.msg = ''; var t = sec && sec.querySelector('.anx-toast'); if(t) t.remove(); }, 2400);
  }

  /* ---------- vault I/O ---------- */
  function loadVault(){
    var local = lsGet(LS_VAULT);
    if(local){
      try { var v = JSON.parse(local); if(v && v.gates){ S.vault = v; S.vaultSrc = T(UI.srcLocal); return Promise.resolve(); } } catch(e){}
    }
    return fetch(SEED_URL, { cache:'no-store' }).then(function(r){
      if(!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function(v){ S.vault = v; S.vaultSrc = T(UI.srcSeed); });
  }
  function unlock(pass){
    if(!pass){ return; }
    S.busy = true; S.err = ''; paint();
    var go = S.vault ? Promise.resolve() : loadVault();
    go.then(function(){ return openVault(S.vault, pass); }).then(function(d){
      S.data = d; S.pass = pass; S.busy = false; S.openId = null; S.ro = false; if(!isEditor()) lsSet(LS_PASS, pass); touch(); startIdle(); paint();
    }).catch(function(e){
      S.busy = false; S.data = null; S.pass = null;
      if(lsGet(LS_PASS) === pass){ try { localStorage.removeItem(LS_PASS); } catch(x){} }
      S.err = (e && e.message === 'Tampering Detected') ? T(UI.badPass) : T(UI.loadFail);
      paint();
    });
  }
  function lock(){
    S.data = null; S.pass = null; S.openId = null; S.modal = null; S.q = ''; S.tag = ''; S.busy = false; S.err = ''; S.autoTried = false; S.ro = false; S.vault = null;
    clearInterval(idleTimer); idleTimer = null; paint();
  }
  function startIdle(){
    clearInterval(idleTimer);
    idleTimer = setInterval(function(){ if(S.data && Date.now() - S.lastActive > IDLE_MS) lock(); }, 15000);
  }
  function persist(okMsg){
    if(S.ro) return Promise.resolve();
    S.busy = true; S.busyMsg = T(UI.saving); paint();
    S.data.rev = (S.data.rev || 0) + 1;
    return generateVault(S.pass, S.data).then(function(v){
      lsSet(LS_VAULT, JSON.stringify(v)); S.vault = v; S.vaultSrc = T(UI.srcLocal); bumpDirty();
      S.busy = false; paint(); toast(okMsg || T(UI.toastSaved));
    }).catch(function(){ S.busy = false; paint(); });
  }

  /* ---------- actions ---------- */
  function newId(){ return 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function noteText(n){
    return n.title + '\n' + (n.tags && n.tags.length ? '#' + n.tags.join(' #') + '\n' : '') + '\n' + String(n.body || '').replace(/\*\*/g, '');
  }
  function copyText(txt, done){
    function fb(){
      var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch(e){} ta.remove(); done();
    }
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done, fb); } else fb();
  }
  function readModalFields(){
    var o = {}; [].forEach.call(sec.querySelectorAll('.anx-mbox [data-f]'), function(el){ o[el.getAttribute('data-f')] = el.type === 'file' ? el.files : el.value; });
    return o;
  }
  function downloadVault(){
    var v = lsGet(LS_VAULT) || JSON.stringify(S.vault);
    var blob = new Blob([v], { type:'application/json' }), a = document.createElement('a'), d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = 'spacez-notes-backup-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '.json';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
    lsSet(LS_BACKUP, String(Date.now())); lsSet(LS_DIRTY, '0'); toast(T(UI.backedUp));
  }

  function onClick(e){
    var t = e.target.closest('[data-anx]'); if(!t || !sec.contains(t)) return;
    touch();
    var a = t.getAttribute('data-anx'), id = t.getAttribute('data-id');
    if(a === 'mbg'){ if(e.target !== t) return; S.modal = null; return paint(); }
    switch(a){
      case 'open': S.openId = id; paint(); window.scrollTo(0, 0); break;
      case 'back': S.openId = null; paint(); break;
      case 'tag': S.tag = t.getAttribute('data-v'); paint(); break;
      case 'new': S.modal = { type:'edit', note:{ id:'', title:'', tags:[], body:'', graphic:'' } }; paint(); break;
      case 'edit': S.modal = { type:'edit', note:S.data.notes.filter(function(n){ return n.id === id; })[0] }; paint(); break;
      case 'del': var dn = S.data.notes.filter(function(n){ return n.id === id; })[0]; S.modal = { type:'del', id:id, title:dn ? dn.title : '' }; paint(); break;
      case 'copy':
        var cn = S.data.notes.filter(function(n){ return n.id === id; })[0];
        if(cn) copyText(noteText(cn), function(){ t.textContent = T(UI.copied); clearTimeout(copiedTimer); copiedTimer = setTimeout(function(){ t.textContent = T(UI.copy); }, 1600); });
        break;
      case 'mcancel': S.modal = null; paint(); break;
      case 'msave':
        var f = readModalFields(), title = String(f.title || '').trim();
        if(!title){ S.modal.err = T(UI.needTitle); S.modal.note.title = f.title; S.modal.note.body = f.body; return paint(); }
        var tags = String(f.tags || '').split(',').map(function(x){ return x.trim(); }).filter(Boolean);
        var cur = S.modal.note, now = Date.now();
        if(cur.id){
          var n0 = S.data.notes.filter(function(n){ return n.id === cur.id; })[0];
          if(n0){ n0.title = title; n0.tags = tags; n0.body = String(f.body || ''); n0.graphic = f.graphic || ''; n0.updated = now; }
        } else {
          var nn = { id:newId(), title:title, tags:tags, body:String(f.body || ''), graphic:f.graphic || '', created:now, updated:now };
          S.data.notes.push(nn); S.openId = nn.id;
        }
        S.modal = null; persist(); break;
      case 'mdel':
        S.data.notes = S.data.notes.filter(function(n){ return n.id !== S.modal.id; });
        S.modal = null; S.openId = null; persist(); break;
      case 'changepass': S.modal = { type:'pass' }; paint(); break;
      case 'mpass':
        var p = readModalFields();
        p.p1 = normPass(p.p1); p.p2 = normPass(p.p2);
        if(String(p.p1 || '').length < 8){ S.modal.err = T(UI.passShort); return paint(); }
        if(p.p1 !== p.p2){ S.modal.err = T(UI.passMismatch); return paint(); }
        S.pass = p.p1; lsSet(LS_PASS, p.p1); S.modal = null; persist(T(UI.passDone)); break;
      case 'export': downloadVault(); break;
      case 'import': S.modal = { type:'import' }; paint(); break;
      case 'mimport':
        var im = readModalFields();
        if(!im.file || !im.file[0]){ S.modal.err = T(UI.impBad); return paint(); }
        var rd = new FileReader();
        rd.onload = function(){
          var v; try { v = JSON.parse(String(rd.result)); } catch(x){ v = null; }
          if(!v || !v.gates){ S.modal.err = T(UI.impBad); return paint(); }
          var pw = normPass(String(im.ipass || ''));
          openVault(v, pw).then(function(d){
            lsSet(LS_VAULT, JSON.stringify(v)); S.vault = v; S.vaultSrc = T(UI.srcLocal);
            S.data = d; S.pass = pw; S.modal = null; S.openId = null; lsSet(LS_DIRTY, '0'); touch(); startIdle(); paint(); toast(T(UI.toastSaved));
          }).catch(function(){ S.modal.err = T(UI.badPass); paint(); });
        };
        rd.readAsText(im.file[0]); break;
      case 'bulktoggle':
        var bb = sec.querySelector('.anx-bulkbox'); if(bb){ bb.hidden = !bb.hidden; var tx = bb.querySelector('textarea'); if(!bb.hidden && tx) tx.focus(); }
        break;
      case 'spread':
        var box = sec.querySelector('.anx-bulkbox'); if(!box) break;
        var ta = box.querySelector('textarea'), msg = box.querySelector('.anx-spreadmsg'), pin = sec.querySelector('[name=pass]');
        var rr = parseSlots(ta.value);
        if(!rr || !pin){ if(msg) msg.textContent = T(UI.spreadNone); break; }
        var joined = normPass(ta.value);
        pin.value = joined; ta.value = '';
        if(msg) msg.textContent = T(UI.spreadOk).replace('{n}', rr.n).replace('{c}', joined.length);
        pin.focus();
        break;
      case 'lock': lock(); break;
      case 'replay':
        var holder = sec.querySelector('[data-anx-svg]');
        if(holder){ var k = holder.getAttribute('data-anx-svg'); holder.innerHTML = ''; void holder.offsetWidth; holder.innerHTML = GRAPHICS[k].svg(); }
        break;
    }
  }
  function onSubmit(e){
    var f = e.target.closest('[data-anx-form]'); if(!f) return;
    e.preventDefault(); touch();
    if(f.getAttribute('data-anx-form') === 'unlock') unlock(normPass(f.querySelector('[name=pass]').value));
  }
  function onInput(e){
    var t = e.target; touch();
    if(t.getAttribute && t.getAttribute('data-anx-in') === 'q'){
      S.q = t.value; var pos = t.selectionStart; paint();
      var el = sec.querySelector('[data-anx-in="q"]'); if(el){ el.focus(); try { el.setSelectionRange(pos, pos); } catch(x){} }
    }
  }
  function onKey(e){
    if(!sec || !sec.contains(document.activeElement) && !S.modal) return;
    if(e.key === 'Escape' && S.modal){ S.modal = null; paint(); }
    if((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.anx-card')){ e.preventDefault(); S.openId = e.target.getAttribute('data-id'); paint(); }
  }

  function css(){
    if(document.getElementById('anxCss')) return;
    var s = document.createElement('style'); s.id = 'anxCss';
    s.textContent = [
      '#adminnotes::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(1.6px 1.6px at 8% 18%,#fff,transparent 70%),radial-gradient(1.3px 1.3px at 22% 64%,#fff,transparent 70%),radial-gradient(1.8px 1.8px at 38% 30%,#fff,transparent 70%),radial-gradient(1.3px 1.3px at 52% 80%,#fff,transparent 70%),radial-gradient(1.7px 1.7px at 66% 12%,#fff,transparent 70%),radial-gradient(1.3px 1.3px at 80% 54%,#fff,transparent 70%),radial-gradient(1.5px 1.5px at 92% 26%,#fff,transparent 70%);background-size:260px 220px;opacity:.34}',
      '#adminnotes .anx-wrap{position:relative;max-width:1000px;margin:0 auto;padding:0 24px 110px}',
      '@media(max-width:700px){#adminnotes .anx-wrap{padding:0 14px 80px}}',
      '#adminnotes .anx-lock{max-width:440px;margin:30px auto 0;text-align:center;border:1px solid var(--border-dim);border-radius:var(--radius,14px);background:var(--glass,rgba(255,255,255,.035));padding:34px 26px}',
      '#adminnotes .anx-lock-ico{width:54px;height:54px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;color:var(--neon);border:1px solid var(--border);background:rgba(204,255,0,.06)}',
      '#adminnotes .anx-lock-ico svg{width:26px;height:26px}',
      '#adminnotes .anx-lock h3{font-size:18px;margin-bottom:8px}',
      '#adminnotes .anx-lock p{font-size:12.5px;color:var(--grey);line-height:1.7;margin-bottom:16px}',
      '#adminnotes .anx-lock form{display:grid;gap:10px}',
      '#adminnotes .anx-lock-foot{margin-top:16px}',
      '#adminnotes .anx-bulk{margin-top:12px}',
      '#adminnotes .anx-bulkbox{margin-top:8px;display:flex;flex-direction:column;gap:8px}',
      '#adminnotes .anx-bulkbox[hidden]{display:none}',
      '#adminnotes .anx-spreadmsg{font-size:12px;color:var(--neon);min-height:16px}',
      '#adminnotes .anx-input{width:100%;box-sizing:border-box;font-family:var(--mono);font-size:13px;border:1px solid var(--border-dim);border-radius:10px;padding:11px 12px;background:rgba(255,255,255,.03);color:var(--white);outline:none}',
      '#adminnotes .anx-input:focus{border-color:var(--neon)}',
      '#adminnotes .anx-ta{font-family:var(--sans);font-size:13.5px;line-height:1.65;resize:vertical;min-height:200px}',
      '#adminnotes select.anx-input{font-family:var(--sans)}',
      '#adminnotes .anx-btn{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.3px;border:1px solid var(--border-dim);border-radius:10px;padding:9px 14px;cursor:pointer;color:var(--white);background:rgba(255,255,255,.04);transition:.2s}',
      '#adminnotes .anx-btn:hover{border-color:var(--neon);color:var(--neon)}',
      '#adminnotes .anx-btn.pri{background:var(--neon);border-color:var(--neon);color:#080808}',
      '#adminnotes .anx-btn.pri:hover{filter:brightness(1.08);color:#080808}',
      '#adminnotes .anx-btn.warn:hover{border-color:var(--amber);color:var(--amber)}',
      '#adminnotes .anx-btn.danger{border-color:rgba(255,59,78,.5);color:#ff6b7a}',
      '#adminnotes .anx-btn.danger:hover{background:rgba(255,59,78,.15);border-color:var(--red);color:#ff8d99}',
      '#adminnotes .anx-btn[disabled]{opacity:.5;cursor:wait}',
      '#adminnotes .anx-link{background:none;border:none;color:var(--grey);font-size:12px;text-decoration:underline;cursor:pointer;padding:2px 6px}',
      '#adminnotes .anx-link:hover{color:var(--neon)}',
      '#adminnotes .anx-err{margin-top:12px;font-size:12px;color:#ff5a72}',
      '#adminnotes .anx-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}',
      '#adminnotes .anx-sp{flex:1}',
      '#adminnotes .anx-search{width:240px;max-width:100%}',
      '#adminnotes .anx-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}',
      '#adminnotes .anx-tag{font-family:var(--mono);font-size:11px;border:1px solid var(--border-dim);border-radius:999px;padding:5px 11px;cursor:pointer;color:var(--grey);background:none}',
      '#adminnotes .anx-tag.on{border-color:var(--neon);color:var(--neon);background:rgba(204,255,0,.08)}',
      '#adminnotes .anx-meta{font-size:11px;color:var(--grey-dim);margin-bottom:16px;line-height:1.7}',
      '#adminnotes .anx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}',
      '#adminnotes .anx-card{cursor:pointer;border:1px solid var(--border-dim);border-radius:var(--radius,14px);background:var(--glass,rgba(255,255,255,.035));padding:16px 16px 12px;transition:.2s;outline:none}',
      '#adminnotes .anx-card:hover,#adminnotes .anx-card:focus-visible{border-color:var(--neon);transform:translateY(-2px)}',
      '#adminnotes .anx-card h4{font-size:14.5px;line-height:1.45;margin-bottom:7px}',
      '#adminnotes .anx-card p{font-size:12px;color:var(--grey);line-height:1.65;margin-bottom:10px;min-height:3.3em}',
      '#adminnotes .anx-card-foot,#adminnotes .anx-note-tags{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
      '#adminnotes .anx-chip{font-family:var(--mono);font-size:10px;border:1px solid var(--border);color:var(--neon);border-radius:999px;padding:2px 8px}',
      '#adminnotes .anx-chip.g{border-color:rgba(0,255,102,.4);color:var(--neon-2)}',
      '#adminnotes .anx-date{font-size:10.5px;color:var(--grey-dim);margin-left:auto}',
      '#adminnotes .anx-empty{padding:40px 10px;text-align:center;color:var(--grey);font-size:13px}',
      '#adminnotes .anx-note{border:1px solid var(--border-dim);border-radius:var(--radius,14px);background:var(--glass,rgba(255,255,255,.035));padding:24px 24px 22px}',
      '#adminnotes .anx-note h3{font-size:20px;line-height:1.4;margin-bottom:10px}',
      '#adminnotes .anx-body{margin-top:16px;font-size:14.5px;line-height:1.85}',
      '#adminnotes .anx-body p{margin-bottom:12px}',
      '#adminnotes .anx-body ul{margin:0 0 14px 22px}',
      '#adminnotes .anx-body li{margin-bottom:5px}',
      '#adminnotes .anx-body b{color:var(--neon)}',
      '#adminnotes .anx-aside{font-size:12px;color:var(--amber);border-left:2px solid var(--amber);padding-left:10px;margin-top:14px}',
      '#adminnotes .anx-fig{margin-top:22px;border:1px solid var(--border);border-radius:12px;background:rgba(0,0,0,.35);padding:12px 12px 14px}',
      '#adminnotes .anx-fig-h{font-family:var(--mono);font-size:11px;color:var(--neon-2);margin-bottom:6px;display:flex;align-items:center;gap:8px}',
      '#adminnotes .anx-fig-cap{font-size:12px;color:var(--grey);line-height:1.7;margin-top:8px}',
      '#adminnotes .anx-svg{display:block;width:100%;height:auto}',
      '#adminnotes .anx-svg text{font-family:var(--sans);fill:var(--white)}',
      '#adminnotes .anx-ph{font-size:15px;font-weight:700;fill:var(--neon)!important}',
      '#adminnotes .anx-pl{font-size:13px;font-weight:700;opacity:0;animation:anxFade .5s forwards;fill:var(--neon-2)!important}',
      '#adminnotes .anx-ptxt{font-size:13px;opacity:0;animation:anxFade .6s forwards;animation-delay:inherit}',
      '#adminnotes .anx-ptxt.hl{fill:var(--neon)!important;font-weight:700}',
      '#adminnotes .anx-ptxt.dim{fill:var(--grey)!important;font-size:12px}',
      '#adminnotes .anx-draw{fill:none;stroke:var(--neon);stroke-width:3;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:anxDraw 3.2s ease forwards}',
      '#adminnotes .anx-draw.e{stroke:var(--neon-2)}',
      '#adminnotes .anx-draw.run{stroke:var(--amber)}',
      '#adminnotes .anx-boundary{stroke:rgba(255,255,255,.4);stroke-width:1.6;stroke-dasharray:6 5;opacity:0;animation:anxFade .8s 1.2s forwards}',
      '#adminnotes .anx-dash{stroke:var(--amber);stroke-width:1.5;stroke-dasharray:5 5;opacity:0;animation:anxFade .6s .6s forwards}',
      '#adminnotes .anx-ring{fill:none;stroke:var(--amber);stroke-width:2;animation:anxPulse 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}',
      '#adminnotes .anx-box{fill:rgba(255,255,255,.03);stroke:var(--border-dim)}',
      '#adminnotes .anx-fade{opacity:0;animation:anxFade .7s forwards}',
      '#adminnotes .anx-bar.c,#adminnotes rect.anx-bar{transform-box:fill-box;transform-origin:bottom;animation:anxGrow .7s ease-out backwards}',
      '#adminnotes rect.anx-bar.c{fill:var(--neon)}',
      '#adminnotes rect.anx-bar.e{fill:var(--neon-2)}',
      '#adminnotes .anx-chip.c{fill:rgba(204,255,0,.12);stroke:var(--neon)}',
      '#adminnotes .anx-chip.e{fill:rgba(0,255,102,.12);stroke:var(--neon-2)}',
      '#adminnotes .anx-ptxt.hl.e{fill:var(--neon-2)!important}',
      '#adminnotes .anx-block{fill:#101015;stroke:rgba(255,255,255,.2);stroke-width:1.3}',
      '#adminnotes .anx-block.ok{stroke:rgba(0,255,102,.55)}',
      '#adminnotes .anx-bt{font-size:20px;font-weight:700;font-family:var(--mono)}',
      '#adminnotes .anx-link{stroke:rgba(255,255,255,.35);stroke-width:2;fill:none}',
      '#adminnotes .anx-pickring{fill:none;stroke:var(--neon-2);stroke-width:2.4}',
      '#adminnotes .anx-tri{font-size:13px;font-weight:700;fill:var(--neon-2)!important}',
      '#adminnotes .anx-pick{opacity:0;animation:anxPickA 4s ease-in-out infinite}',
      '#adminnotes .anx-pick.b{animation-name:anxPickB}',
      '#adminnotes .anx-busy{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;background:rgba(0,0,0,.6);color:var(--white);font-size:13px}',
      '#adminnotes .anx-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.15);border-top-color:var(--neon);animation:anxSpin .8s linear infinite}',
      '#adminnotes .anx-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:60;background:var(--neon);color:#080808;font-family:var(--mono);font-size:12px;font-weight:700;padding:10px 18px;border-radius:999px}',
      '#adminnotes .anx-modal{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.72)}',
      '#adminnotes .anx-mbox{width:min(560px,100%);max-height:92vh;overflow:auto;border:1px solid var(--border);border-radius:16px;background:#0b0b0e;padding:22px}',
      '#adminnotes .anx-mbox h3{font-size:17px;margin-bottom:12px}',
      '#adminnotes .anx-mbox label{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.4px;text-transform:uppercase;color:var(--grey);margin:12px 0 5px}',
      '#adminnotes .anx-hint{font-size:11px;color:var(--grey-dim);margin-top:6px}',
      '#adminnotes .anx-mp{font-size:13.5px;line-height:1.7;margin-bottom:6px}',
      '#adminnotes .anx-mp.dim{color:var(--grey);font-size:12.5px}',
      '#adminnotes .anx-mact{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}',
      '@keyframes anxDraw{to{stroke-dashoffset:0}}',
      '@keyframes anxFade{to{opacity:1}}',
      '@keyframes anxGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}',
      '@keyframes anxPulse{50%{transform:scale(1.4);opacity:.5}}',
      '@keyframes anxSpin{to{transform:rotate(360deg)}}',
      '@keyframes anxPickA{0%,5%{opacity:0}12%,42%{opacity:1}52%,100%{opacity:0}}',
      '@keyframes anxPickB{0%,50%{opacity:0}57%,92%{opacity:1}100%{opacity:0}}',
      '@media (prefers-reduced-motion:reduce){#adminnotes .anx-draw,#adminnotes .anx-pl,#adminnotes .anx-ptxt,#adminnotes .anx-boundary,#adminnotes .anx-dash,#adminnotes .anx-fade{animation:none;opacity:1;stroke-dashoffset:0}#adminnotes .anx-pick{animation:none;opacity:1}#adminnotes .anx-ring{animation:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function build(){
    if(document.getElementById(ROUTE)) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;
    css();
    sec = document.createElement('section');
    sec.id = ROUTE; sec.setAttribute('data-route', ROUTE);
    sec.innerHTML =
      '<div class="anx-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-anx-eb></span></div>' +
          '<h2 data-anx-h></h2><p class="lede" data-anx-lede></p><div class="rule"></div>' +
        '</div>' +
        '<div data-anx-body></div>' +
      '</div>';
    document.body.appendChild(sec);
    sec.addEventListener('click', onClick);
    sec.addEventListener('submit', onSubmit);
    sec.addEventListener('input', onInput);
    sec.addEventListener('paste', function(e){
      var t = e.target;
      if(!t || t.tagName !== 'INPUT' || t.type !== 'password') return;
      var txt = ''; try { txt = (e.clipboardData || window.clipboardData).getData('text') || ''; } catch(x){}
      if(!txt) return;
      var out = normPass(txt);
      if(out !== txt && parseSlots(txt)){ e.preventDefault(); t.value = out; touch(); }
    });
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', function(){ if(S.data && location.hash.indexOf(ROUTE) === -1) lock(); else if(onPage()) paint(); });
    document.addEventListener('spz:tier', function(){ lock(); });
    window.addEventListener('pagehide', function(){ if(S.data) lock(); });
    window.__spzAddRoute({
      id:ROUTE, feat:true, after:'qrcode', t:UI.h,
      d:{ en:'Encrypted study notes. Admin and Editor (read-only).', th:'โน้ตที่เข้ารหัส แอดมินและ Editor (อ่านอย่างเดียว)' }
    });
    paint();
    /* Reloading while on #/adminnotes: the router fell back to home before this
       late route existed, so replay the hash once now that it is registered. */
    if((location.hash || '') === '#/' + ROUTE){ try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e){} }
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  else setTimeout(boot, 1200);
})();
