
(function(){
  'use strict';
  var subtle = window.crypto.subtle;
  var te = new TextEncoder(), td = new TextDecoder();

  /* ---------------- CASCADE v4 primitives ---------------- */
  var L1_ITER = 300000, CYCLES = 5, CYC_ITER = 120000;

  function u8cat(){
    var arrs = Array.prototype.slice.call(arguments);
    var total = 0, i;
    for(i = 0; i < arrs.length; i++) total += arrs[i].length;
    var out = new Uint8Array(total), off = 0;
    for(i = 0; i < arrs.length; i++){ out.set(arrs[i], off); off += arrs[i].length; }
    return out;
  }
  function b64(bytes){
    var bin = '', i;
    for(i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function unb64(str){
    var bin = atob(str), out = new Uint8Array(bin.length), i;
    for(i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function pbkdf2Bits(keyBytes, salt, iterations, hash, bitLen){
    return subtle.importKey('raw', keyBytes, 'PBKDF2', false, ['deriveBits']).then(function(base){
      return subtle.deriveBits({ name:'PBKDF2', hash:hash, salt:salt, iterations:iterations }, base, bitLen);
    }).then(function(bits){ return new Uint8Array(bits); });
  }
  function hkdfAesKey(ikmBytes, salt, infoBytes, hash, algo, usages){
    return subtle.importKey('raw', ikmBytes, 'HKDF', false, ['deriveKey']).then(function(base){
      return subtle.deriveKey({ name:'HKDF', hash:hash, salt:salt, info:infoBytes }, base, algo, false, usages);
    });
  }
  function aesCtr(mode, key, counter, data){
    var op = mode === 'encrypt' ? subtle.encrypt.bind(subtle) : subtle.decrypt.bind(subtle);
    return op({ name:'AES-CTR', counter:counter, length:64 }, key, data).then(function(out){ return new Uint8Array(out); });
  }
  function hmacSha512(keyBytes, msgBytes){
    return subtle.importKey('raw', keyBytes, { name:'HMAC', hash:'SHA-512' }, false, ['sign']).then(function(key){
      return subtle.sign('HMAC', key, msgBytes);
    }).then(function(sig){ return new Uint8Array(sig); });
  }

  /* Layer 3 (the gate, inside the loop) is deliberately unauthenticated
     AES-CTR: it always "succeeds" and hands back a seed — garbage for a
     wrong password — that keeps flowing through the rest of the pipeline.
     There is no early exit anywhere in this loop, by design. */
  function cascadeLoop(state0, s2, s3, s4, gates){
    var state = state0, c = 0;
    function step(){
      if(c >= CYCLES) return Promise.resolve(state);
      var cc = c;
      var info2 = te.encode('SPACEZ/GATE/' + cc);
      return hkdfAesKey(state, s2, info2, 'SHA-384', { name:'AES-CTR', length:256 }, ['decrypt']).then(function(gateKey){
        var iv = unb64(gates[cc].iv);
        var ct = unb64(gates[cc].ct);
        return aesCtr('decrypt', gateKey, iv, ct);
      }).then(function(seed){
        var s3c = u8cat(s3, new Uint8Array([cc]));
        return pbkdf2Bits(seed, s3c, CYC_ITER, 'SHA-256', 512);
      }).then(function(stretched){
        var msg = u8cat(state, s4, te.encode('SPACEZ/MIX/' + cc));
        return hmacSha512(stretched, msg);
      }).then(function(newState){
        state = newState; c++;
        return step();
      });
    }
    return step();
  }

  function deriveFinalKeys(state, s4){
    return Promise.all([
      hkdfAesKey(state, s4, te.encode('SPACEZ/FINAL/CTR'), 'SHA-512', { name:'AES-CTR', length:256 }, ['decrypt']),
      hkdfAesKey(state, s4, te.encode('SPACEZ/FINAL/GCM'), 'SHA-512', { name:'AES-GCM', length:256 }, ['decrypt'])
    ]).then(function(r){ return { kCtr:r[0], kGcm:r[1] }; });
  }

  /* The ONE checkpoint in the whole pipeline is the outer AES-GCM decrypt
     below — a bad password, a flipped byte anywhere (ciphertext, any salt,
     any gate blob, either iv), or a missing gate all surface identically as
     "Tampering Detected". Everything before it always runs to completion,
     so a right and a wrong password cost the same amount of real work. */
  function openVault(vault, password){
    return Promise.resolve().then(function(){
      if(!vault || !vault.gates || vault.gates.length !== CYCLES) throw new Error('shape');
      var s1 = unb64(vault.s1), s2 = unb64(vault.s2), s3 = unb64(vault.s3), s4 = unb64(vault.s4);
      return pbkdf2Bits(te.encode(password), s1, L1_ITER, 'SHA-512', 512).then(function(state0){
        return cascadeLoop(state0, s2, s3, s4, vault.gates);
      }).then(function(state){
        return deriveFinalKeys(state, s4);
      }).then(function(keys){
        var outerIv = unb64(vault.iv), ctBytes = unb64(vault.ct);
        return subtle.decrypt({ name:'AES-GCM', iv:outerIv, tagLength:128 }, keys.kGcm, ctBytes).then(function(mid){
          var ctrIv = unb64(vault.ctrIv);
          return aesCtr('decrypt', keys.kCtr, ctrIv, new Uint8Array(mid));
        });
      }).then(function(plain){
        var data = JSON.parse(td.decode(plain));
        if(!data || typeof data !== 'object') throw new Error('bad shape');
        return data;
      });
    }).catch(function(){
      throw new Error('Tampering Detected');
    });
  }

  /* ---------------- embedded vault ---------------- */
  /* Only one vault now: entering the site needs no password at all (see
     init(), below), so the only thing a password can still do is unlock
     Workbench. เอาค่า Ciphertext, Salt, IV ของ Full Access (รหัส 50 ช่อง)
     มาใส่ตรงนี้ (สร้างด้วย ADMIN_GENERATOR.html) */
  var VAULT_FULL = {"v":4,"s1":"mkdQcgClsnvkGyoBGGivQg==","s2":"9YocjP94X+KXzaDgEjSuGg==","s3":"hy15gzrBLmYFR2+cvfPPCA==","s4":"ky5slYhVrHQoXnN7itBYcg==","gates":[{"iv":"8ua/11yPR3cWSJKJEBQVhQ==","ct":"/RpQQax3SbFjk3XfRXL5DP9gJ6rQqkNt/72nKLY8b6Q="},{"iv":"JBpkOqWqQUGoNpvaBlMZhg==","ct":"nVsIciHOqQOZeoRiBpVa2MEpCDeP3npI3gG5YjD/z0M="},{"iv":"3pbyESaKph58+1raRCifUg==","ct":"N3RWhWpuNS9II+Knxy22n4sZfy75Zvpz1KFe3QMFSlk="},{"iv":"UBs3G4dOB8mAFjSRlyDRUQ==","ct":"5q+pIWVpnm52L5GAMp/4Q1L51D7ZlV4Gvypoei8dShA="},{"iv":"jqk5KZTuminXpYENqvBGPA==","ct":"s84YTT4n78TgNAZDV8fEb4sJNGEfYXZXICBRoQzik78="}],"ctrIv":"YtBFuzHAlM73O0uKkyqL2w==","iv":"ZqvmBtUJW2peCcUC","ct":"Yw9ZQfcOwU9A9jmBxghZgtyj2k5flNijg9Cnjungi45aNULy9mmGCiDf8V7jF5MhqyhdEK490/I="};

  var LOCKED_ROUTES = ['stock','watchlist','bubble','chartlab','directory','pro','proof','regime','globe','desk','scenarios','anomaly','correl','rulelab','daily','cockpit','controlgrid','printreport','journalNew','connectedusers','announcements'];
  /* 'journal' (the list) and 'journalView' (a single post) are deliberately
     NOT in this list -- anyone can open them. The paywall for those two
     lives inside the module itself instead: the list/titles always render,
     but journalView blurs the actual post content (image + text) for a
     visitor who isn't LINE-linked, with an overlay prompting LINE login --
     a softer "look, but log in to read" gate rather than a route bounce.
     journalNew (posting a new entry) stays a full route-level admin lock. */

  /* ---------------- i18n ---------------- */
  function Lg(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function Tt(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[Lg()] || o.en || ''); }

  var TXT = {
    brand:'ACCESS GATE',
    enter:{en:'Enter',th:'เข้าสู่ระบบ'},
    adminTriggerTitle:{en:'Sign in',th:'เข้าสู่ระบบ'},
    lockMember:{en:'Member access',th:'เฉพาะสมาชิก'},
    lockAdmin:{en:'Admin access',th:'เฉพาะแอดมิน'},
    errBad:{en:'Incorrect password',th:'รหัสผ่านไม่ถูกต้อง'},
    errEmpty:{en:'Enter a password first',th:'กรุณากรอกรหัสผ่าน'},
    errLock:{en:'Too many attempts — try again in ',th:'พยายามผิดหลายครั้งเกินไป ลองใหม่ในอีก '},
    tabMember:{en:'MEMBER',th:'MEMBER'},
    tabFull:{en:'ADMIN',th:'ADMIN'},
    tabLine:{en:'LINE',th:'LINE'},
    lineRowConnect:{en:'Connect LINE',th:'เชื่อมต่อ LINE'},
    lineRowConnected:{en:'LINE connected',th:'เชื่อมต่อ LINE แล้ว'},
    lineRowLogout:{en:'Log out of LINE',th:'ออกจากระบบ LINE'},
    lineRowNote:{en:'Your own personal watchlist via LINE — separate from this site login.',
                 th:'วอทช์ลิสต์ส่วนตัวของคุณผ่าน LINE — แยกต่างหากจากการล็อกอินเว็บนี้'},
    lineWlBtn:{en:'Go to My Watchlist',th:'ไปหน้าวอทช์ลิสต์ของฉัน'},
    /* Round R: a second, independent QR login next to LINE -- same Member-tier
       access, no watchlist of its own (see part-61.js's own header comment
       for why). Mirrors every lineRow / tabLine string above one-for-one. */
    tabTg:{en:'TELEGRAM',th:'TELEGRAM'},
    tgRowConnect:{en:'Connect Telegram',th:'เชื่อมต่อ Telegram'},
    tgRowConnected:{en:'Telegram connected',th:'เชื่อมต่อ Telegram แล้ว'},
    tgRowLogout:{en:'Log out of Telegram',th:'ออกจากระบบ Telegram'},
    tgRowNote:{en:'Sign in by scanning a QR code with Telegram — separate from this site login.',
               th:'เข้าสู่ระบบด้วยการสแกน QR ผ่าน Telegram — แยกต่างหากจากการล็อกอินเว็บนี้'},
    tgLoggedT:{en:'TELEGRAM',th:'TELEGRAM'},
    tgLoggedS:{en:'Signed in via Telegram — you have the same access as a member.',th:'เข้าสู่ระบบผ่าน Telegram — คุณมีสิทธิ์เข้าถึงเทียบเท่าเมมเบอร์'},
    memberT:{en:'MEMBER ACCESS',th:'สิทธิ์สมาชิก'},
    memberS:{en:'Unlocked through your LINE or Telegram account',th:'ปลดล็อกผ่านบัญชี LINE หรือ Telegram ของคุณ'},
    memberLineNote:{en:'Member access goes through LINE or Telegram sign-in — connect either one to unlock the analysis tools and get your own personal watchlist.',
                    th:'สิทธิ์สมาชิกเข้าผ่านการเชื่อมต่อ LINE หรือ Telegram — เชื่อมต่อช่องทางใดช่องทางหนึ่งเพื่อปลดล็อกเครื่องมือวิเคราะห์ พร้อมวอทช์ลิสต์ส่วนตัวของคุณเอง'},
    memberLineCta:{en:'Sign in with LINE',th:'เข้าสู่ระบบด้วย LINE'},
    memberTgCta:{en:'Sign in with Telegram',th:'เข้าสู่ระบบด้วย Telegram'},
    memberLoggedT:{en:'MEMBER',th:'MEMBER'},
    memberLoggedS:{en:'You have member access.',th:'คุณเข้าสู่ระบบระดับ MEMBER แล้ว'},
    lineLoggedT:{en:'LINE',th:'LINE'},
    lineLoggedS:{en:'Signed in via LINE — you have the same access as a member.',th:'เข้าสู่ระบบผ่าน LINE — คุณมีสิทธิ์เข้าถึงเทียบเท่าเมมเบอร์'},
    upgradeBtn:{en:'Log in as Admin instead',th:'เข้าสู่ระบบแอดมินแทน'},
    toFullLink:{en:'Have the 50-field admin code instead?',th:'มีรหัสแอดมิน 50 ช่องใช่ไหม?'},
    toMemberLink:{en:'Have a short MEMBER code instead?',th:'มีรหัส MEMBER สั้น ๆ ใช่ไหม?'},
    fullT:{en:'ADMIN LOGIN',th:'ADMIN LOGIN'},
    fullS:{en:'50 fields · 800 characters',th:'รหัสผ่าน 50 ช่อง · 800 ตัวอักษร'},
    loggedT:{en:'ADMIN',th:'ADMIN'},
    loggedS:{en:'You are signed in.',th:'คุณเข้าสู่ระบบแล้ว'},
    logoutBtn:{en:'Log out',th:'ออกจากระบบ'},
    adminAddAnalysis:{en:'Add Analysis',th:'เพิ่มบทวิเคราะห์'},
    adminPrintReport:{en:'Print Report',th:'พิมพ์รายงาน'},
    adminCompareDownload:{en:'Compare Stocks PDF',th:'ดาวน์โหลด PDF เปรียบเทียบหุ้น'},
    adminConnectedUsers:{en:'Connected Users',th:'ผู้ใช้ที่เชื่อมต่อ LINE'},
    adminAnnouncements:{en:'Announcements',th:'ประกาศ'},
    /* Round Q fix: the user's own mental model of "admin terminal" is this
       gate's admin-shortcut grid -- not Cockpit/Command Center, which is
       where these two ended up living (Institutional Pro Desk as a card in
       part-47.js since Round Q phase 1; Institutional Briefing as a report
       trigger in part-47.js since phase 4). Adding shortcuts here too so
       both are reachable from where she actually expects them. */
    adminPro:{en:'Institutional Pro Desk',th:'โปรเดสก์ระดับสถาบัน'},
    adminBriefing:{en:'Institutional Briefing',th:'บรีฟฉบับสถาบัน'},
    bulk:{en:'📋 Paste all 50 at once',th:'📋 วางทีเดียว 50 ชุด'},
    mask:{en:'👁 Show / hide',th:'👁 แสดง/ซ่อน'},
    clear:{en:'🗑 Clear all',th:'🗑 ล้างทั้งหมด'},
    spread:{en:'↳ Spread into all 50 fields',th:'↳ กระจายลงช่องทั้ง 50'},
    bulkHint:{en:'1 line = 1 field. Leading numbering like "01. " is stripped automatically.',
               th:'1 บรรทัด = 1 ช่อง ระบบตัดเลขนำหน้าเช่น "01. " ให้อัตโนมัติ'},
    bulkPh:{en:'Paste all 50 lines here',th:'วางรหัสทั้ง 50 บรรทัดตรงนี้'},
    step:[
      {en:'VAULT INTEGRITY',th:'ตรวจสอบตู้เซฟ'},
      {en:'PBKDF2-SHA512',th:'ยืดรหัสผ่าน 300,000 รอบ'},
      {en:'CASCADE LOOP x5',th:'เดินสายพาน 5 รอบ'},
      {en:'HKDF-SHA512',th:'แตกคีย์ปลายทาง'},
      {en:'AES-256-GCM',th:'ตรวจลายเซ็น'},
      {en:'AES-256-CTR',th:'แกะชั้นใน'},
      {en:'MOUNT MANIFEST',th:'เตรียมรายการเมนู'}
    ],
    failTitle:{en:'TAMPERING DETECTED',th:'ตรวจพบการปลอมแปลง'},
    failBody:{en:'Auth tag mismatch · aborting · no data released',th:'ลายเซ็นไม่ตรง · ยกเลิกการทำงาน · ไม่มีข้อมูลถูกปล่อยออกมา'},
    toastMember:{en:'Member access — open it with the short member code, or by connecting LINE.',
                 th:'เฉพาะสมาชิก — เปิดได้ด้วยรหัสสมาชิกแบบสั้น หรือเชื่อมต่อผ่าน LINE'},
    toastAdmin:{en:'Admin access only.',th:'เฉพาะแอดมินเท่านั้น'},
    toastBtn:{en:'Unlock',th:'ปลดล็อก'}
  };

  /* ---------------- boot sequence ---------------- */
  var SEQ_SPEED = 1.0; /* 1.0 ~= 5s normal path */
  function runBoot(realPromise){
    var boot = document.getElementById('cagBoot');
    boot.classList.add('show');
    var stepsEl = boot.querySelector('.cag-boot-steps');
    stepsEl.innerHTML = '';
    var rows = [];
    for(var i = 0; i < TXT.step.length; i++){
      var row = document.createElement('div');
      row.className = 'cag-boot-step';
      row.innerHTML = '<i></i><span></span>';
      row.querySelector('span').textContent = (i + 1 < 10 ? '0' : '') + (i + 1) + '  ' + Tt(TXT.step[i]);
      stepsEl.appendChild(row);
      rows.push(row);
    }
    var consoleEl = boot.querySelector('.cag-boot-console');
    consoleEl.textContent = '';
    function log(s){ consoleEl.textContent += s + '\n'; consoleEl.scrollTop = consoleEl.scrollHeight; }

    var perStep = 480 * SEQ_SPEED;
    var i2 = 0;
    var result = null, err = null;
    realPromise.then(function(r){ result = r; }).catch(function(e){ err = e; });

    return new Promise(function(resolve){
      function tick(){
        if(i2 < 4){
          rows[i2].classList.add('on');
          log('> ' + Tt(TXT.step[i2]) + ' ... ok');
          i2++;
          setTimeout(tick, perStep);
          return;
        }
        if(i2 === 4){
          /* stage 05 — this is where the real result actually gets read */
          function settle(){
            if(err){
              rows[4].classList.add('fail');
              log('> ' + Tt(TXT.step[4]) + ' ... FAIL');
              boot.classList.add('failed');
              boot.querySelector('.cag-boot-fail').textContent = Tt(TXT.failTitle) + '\n' + Tt(TXT.failBody);
              setTimeout(function(){ boot.classList.remove('show','failed'); resolve(null); }, 1400 * SEQ_SPEED);
            } else {
              rows[4].classList.add('on');
              log('> ' + Tt(TXT.step[4]) + ' ... ok');
              i2 = 5;
              setTimeout(tick, perStep);
            }
          }
          if(result !== null || err !== null) settle();
          else setTimeout(function poll(){ (result !== null || err !== null) ? settle() : setTimeout(poll, 30); }, 30);
          return;
        }
        if(i2 < TXT.step.length){
          rows[i2].classList.add('on');
          log('> ' + Tt(TXT.step[i2]) + ' ... ok');
          i2++;
          setTimeout(tick, perStep);
          return;
        }
        boot.classList.remove('show');
        resolve(result);
      }
      tick();
    });
  }

  /* ---------------- gate UI ---------------- */
  var gate, paneAdv, errAdv, btnAdv, advFilled, advBar;
  var paneOut, paneMember, tabsEl, memberLineBtn, memberTgBtn, upgradeBtn;
  var activeTab = 'member';
  var advInputs = [];
  var attempts = 0, lockUntil = 0;
  var adminTrigger = null;

  function buildGate(){
    if(document.getElementById('spzAuthGate')) return;
    gate = document.createElement('div');
    gate.id = 'spzAuthGate';
    gate.hidden = true;
    gate.innerHTML =
      '<div class="cag-wrap">' +
        '<div class="cag-card">' +
          '<button class="cag-close" type="button" id="cagClose" aria-label="close">✕</button>' +
          '<div class="cag-logo"><div class="cag-badge">' + (window.__spzMark ? window.__spzMark('cag-mark', { stroke:true, w:3 }) : 'S') + '</div>' +
            '<div class="cag-logo-t"><b>SPACEZ TERMINAL</b><span data-x="brand"></span></div></div>' +
          '<div class="cag-div"></div>' +
          '<div class="cag-status"><i></i><span data-x="status"></span></div>' +

          '<div class="cag-tiers" id="cagTabs">' +
            '<button class="cag-tier line" type="button" id="cagLineTab"><b data-x="tabLine"></b></button>' +
            '<button class="cag-tier tg" type="button" id="cagTgTab"><b data-x="tabTg"></b></button>' +
            '<button class="cag-tier m" type="button" data-tab="member"><b data-x="tabMember"></b></button>' +
            '<button class="cag-tier f" type="button" data-tab="full"><b data-x="tabFull"></b></button>' +
          '</div>' +

          '<div class="cag-pane" id="cagPaneOut">' +
            '<div class="cag-head"><div><b data-x="loggedT"></b><span data-x="loggedS"></span></div></div>' +
            '<div class="cag-line-row" id="cagLineRow">' +
              '<img class="cag-line-avatar hidden" id="cagLineAvatar" alt="">' +
              '<div class="cag-line-info">' +
                '<span class="cag-line-name" id="cagLineName" data-x="lineName"></span>' +
                '<span class="cag-line-status" data-x="lineStatus"></span>' +
              '</div>' +
              '<button type="button" class="cag-line-wl-btn hidden" id="cagLineWlBtn" aria-label="" data-x-title="lineWlBtn">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5A2.5 2.5 0 015.5 3h13A2.5 2.5 0 0121 5.5v15L12 16l-9 4.5v-15z"/></svg>' +
              '</button>' +
              '<button type="button" class="cag-line-btn" id="cagLineRowBtn" data-x="lineBtn"></button>' +
            '</div>' +
            '<div class="cag-tg-row" id="cagTgRow">' +
              '<div class="cag-tg-info">' +
                '<span class="cag-tg-name" id="cagTgName" data-x="tgName"></span>' +
                '<span class="cag-tg-status" data-x="tgStatus"></span>' +
              '</div>' +
              '<button type="button" class="cag-tg-btn" id="cagTgRowBtn" data-x="tgBtn"></button>' +
            '</div>' +
            '<div class="cag-admin-links hidden" id="cagAdminLinks">' +
              '<button class="cag-admin-link" type="button" id="cagBtnAddAnalysis">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h5l5 5v12a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M13 3v5h5"/><path d="M12 12.5v5M9.4 15h5.2"/></svg>' +
                '<span data-x="adminAddAnalysis"></span>' +
              '</button>' +
              '<button class="cag-admin-link" type="button" id="cagBtnPrintReport">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9V3.5h11V9"/><path d="M5.5 17.5h-2a1 1 0 01-1-1v-6a1 1 0 011-1h17a1 1 0 011 1v6a1 1 0 01-1 1h-2"/><path d="M6.5 14h11v6.5h-11z"/></svg>' +
                '<span data-x="adminPrintReport"></span>' +
              '</button>' +
              '<button class="cag-admin-link" type="button" id="cagBtnCompareDownload">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M20 19H2"/><path d="M17.5 5l2.5 2.5L22.5 5"/></svg>' +
                '<span data-x="adminCompareDownload"></span>' +
              '</button>' +
              '<button class="cag-admin-link" type="button" id="cagBtnConnectedUsers">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' +
                '<span data-x="adminConnectedUsers"></span>' +
              '</button>' +
              '<button class="cag-admin-link" type="button" id="cagBtnAnnouncements">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 001 1h3l4 4V6L7 10H4a1 1 0 00-1 1z"/><path d="M16 8a4 4 0 010 8"/><path d="M19 5a8 8 0 010 14"/></svg>' +
                '<span data-x="adminAnnouncements"></span>' +
              '</button>' +
              '<button class="cag-admin-link" type="button" id="cagBtnPro">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>' +
                '<span data-x="adminPro"></span>' +
              '</button>' +
              '<button class="cag-admin-link" type="button" id="cagBtnBriefing">' +
                '<svg class="cag-admin-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>' +
                '<span data-x="adminBriefing"></span>' +
              '</button>' +
            '</div>' +
            '<button class="cag-btn" type="button" id="cagBtnLogout" data-x="logoutBtn"></button>' +
            '<button class="cag-ghost hidden" type="button" id="cagUpgradeBtn" data-x="upgradeBtn"></button>' +
          '</div>' +

          '<div class="cag-pane" id="cagPaneMember">' +
            '<div class="cag-head"><div><b data-x="memberT"></b><span data-x="memberS"></span></div></div>' +
            '<div class="cag-member-linenote" data-x="memberLineNote"></div>' +
            '<button class="cag-btn" type="button" id="cagMemberLineBtn" data-x="memberLineCta"></button>' +
            '<button class="cag-btn" type="button" id="cagMemberTgBtn" data-x="memberTgCta"></button>' +
            '<button class="cag-ghost" type="button" id="cagToFull" data-x="toFullLink"></button>' +
          '</div>' +

          '<div class="cag-pane" id="cagPaneAdv">' +
            '<div class="cag-head"><div><b data-x="fullT"></b><span data-x="fullS"></span></div>' +
              '<div class="cag-count"><b id="cagAdvFilled">0</b> / 50</div></div>' +
            '<div class="cag-prog"><i id="cagAdvBar"></i></div>' +
            '<div class="cag-grid" id="cagAdvGrid"></div>' +
            '<div class="cag-tools">' +
              '<button class="cag-tool" type="button" id="cagBulkBtn" data-x="bulk"></button>' +
              '<button class="cag-tool" type="button" id="cagMaskBtn" data-x="mask"></button>' +
              '<button class="cag-tool" type="button" id="cagClearBtn" data-x="clear"></button>' +
            '</div>' +
            '<div class="cag-bulk" id="cagBulkBox">' +
              '<textarea id="cagBulkText" spellcheck="false"></textarea>' +
              '<button class="cag-tool" type="button" id="cagSpreadBtn" data-x="spread"></button>' +
              '<div class="cag-bulk-hint" data-x="bulkHint"></div>' +
            '</div>' +
            '<div class="cag-err hidden" id="cagErrAdv"></div>' +
            '<button class="cag-btn" type="button" id="cagBtnAdv"><span data-x="enterAdv"></span></button>' +
            '<button class="cag-ghost" type="button" id="cagToMember" data-x="toMemberLink"></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="cag-boot" id="cagBoot">' +
        '<div class="cag-boot-ring"><i></i><i></i></div>' +
        '<div class="cag-boot-steps"></div>' +
        '<div class="cag-boot-console"></div>' +
        '<div class="cag-boot-fail"></div>' +
      '</div>';
    document.body.appendChild(gate);
    gate.classList.add('adv');

    paneAdv = gate.querySelector('#cagPaneAdv');
    errAdv = gate.querySelector('#cagErrAdv');
    btnAdv = gate.querySelector('#cagBtnAdv');
    advFilled = gate.querySelector('#cagAdvFilled');
    advBar = gate.querySelector('#cagAdvBar');
    paneOut = gate.querySelector('#cagPaneOut');
    paneMember = gate.querySelector('#cagPaneMember');
    tabsEl = gate.querySelector('#cagTabs');
    memberLineBtn = gate.querySelector('#cagMemberLineBtn');
    memberTgBtn = gate.querySelector('#cagMemberTgBtn');
    upgradeBtn = gate.querySelector('#cagUpgradeBtn');

    var advGrid = gate.querySelector('#cagAdvGrid');
    for(var i = 1; i <= 50; i++){
      var row = document.createElement('div');
      row.className = 'cag-row';
      var nn = (i < 10 ? '0' : '') + i;
      row.innerHTML = '<span class="cag-no">' + nn + '</span><input class="cag-in" type="password" data-i="' + (i - 1) + '" placeholder="' + nn + '"/>';
      advGrid.appendChild(row);
      advInputs.push(row.querySelector('input'));
    }
    advInputs.forEach(function(inp, idx){
      inp.addEventListener('input', function(){
        inp.classList.toggle('filled', inp.value.trim().length > 0);
        updateAdvCount();
      });
      inp.addEventListener('keydown', function(ev){
        if(ev.key === 'Enter'){
          if(idx < 49) advInputs[idx + 1].focus();
          else tryFull();
        }
      });
    });

    function updateAdvCount(){
      var n = advInputs.filter(function(x){ return x.value.trim().length > 0; }).length;
      advFilled.textContent = n;
      advBar.style.width = (n / 50 * 100) + '%';
    }

    gate.querySelector('#cagClose').addEventListener('click', function(){ gate.hidden = true; });
    gate.querySelector('#cagBtnLogout').addEventListener('click', logout);
    gate.querySelector('#cagBtnAddAnalysis').addEventListener('click', function(){ gate.hidden = true; location.hash = '#/journalNew'; });
    gate.querySelector('#cagBtnPrintReport').addEventListener('click', function(){ gate.hidden = true; location.hash = '#/printreport'; });
    // Compare Stocks PDF is admin-only (see cmpIsAdmin()/cmpPaintDownloadGate()
    // in the comparator module) -- this shortcut just gets an already-logged-in
    // admin to the picker; the actual download still needs stocks selected there.
    gate.querySelector('#cagBtnCompareDownload').addEventListener('click', function(){ gate.hidden = true; location.hash = '#/directory'; });
    gate.querySelector('#cagBtnConnectedUsers').addEventListener('click', function(){ gate.hidden = true; location.hash = '#/connectedusers'; });
    gate.querySelector('#cagBtnAnnouncements').addEventListener('click', function(){ gate.hidden = true; location.hash = '#/announcements'; });
    gate.querySelector('#cagBtnPro').addEventListener('click', function(){ gate.hidden = true; location.hash = '#/pro'; });
    /* Institutional Briefing isn't a route -- it's a generated report
       overlay (see window.__SPZ_BRIEFING in part-57.js) -- so this opens it
       directly instead of navigating. Falls back to Cockpit, where the
       trigger card also lives, on the very unlikely chance part-57.js
       hasn't finished loading yet. */
    gate.querySelector('#cagBtnBriefing').addEventListener('click', function(){
      gate.hidden = true;
      if(window.__SPZ_BRIEFING && typeof window.__SPZ_BRIEFING.open === 'function') window.__SPZ_BRIEFING.open();
      else location.hash = '#/cockpit';
    });

    gate.querySelector('#cagMaskBtn').addEventListener('click', function(){
      var show = advInputs[0] && advInputs[0].type === 'password';
      advInputs.forEach(function(inp){ inp.type = show ? 'text' : 'password'; });
    });
    gate.querySelector('#cagClearBtn').addEventListener('click', function(){
      advInputs.forEach(function(inp){ inp.value = ''; inp.classList.remove('filled'); });
      updateAdvCount();
    });
    var bulkBox = gate.querySelector('#cagBulkBox');
    gate.querySelector('#cagBulkBtn').addEventListener('click', function(){ bulkBox.classList.toggle('show'); });
    gate.querySelector('#cagSpreadBtn').addEventListener('click', function(){
      var text = gate.querySelector('#cagBulkText').value;
      /* Numbered fragments can arrive as one per line OR run together on a
         single line/paragraph (common when pasted from voice-to-text notes),
         and can be out of order. So we scan the whole blob for "NN. frag" /
         "NN) frag" pairs and place each fragment straight into slot NN,
         instead of assuming line position == slot position. */
      var byIndex = {};
      var re = /(?:^|\s)(\d{1,2})\s*[.)]\s*(\S+)/g, m;
      while((m = re.exec(text))){
        var n = parseInt(m[1], 10);
        if(n >= 1 && n <= 50) byIndex[n] = m[2];
      }
      if(Object.keys(byIndex).length === 0){
        /* no numbering at all — fall back to treating each whitespace-
           separated token as sequential, in the order it appears */
        var toks = text.split(/\s+/).map(function(s){ return s.trim(); }).filter(Boolean);
        toks.forEach(function(t, i){ byIndex[i + 1] = t; });
      }
      Object.keys(byIndex).forEach(function(k){
        var idx = parseInt(k, 10) - 1;
        if(idx >= 0 && idx < 50){
          advInputs[idx].value = byIndex[k];
          advInputs[idx].classList.add('filled');
        }
      });
      updateAdvCount();
    });

    btnAdv.addEventListener('click', tryFull);

    tabsEl.querySelectorAll('[data-tab]').forEach(function(btn){
      btn.addEventListener('click', function(){
        activeTab = btn.getAttribute('data-tab');
        clearErr(errAdv);
        paint();
      });
    });
    memberLineBtn.addEventListener('click', function(){
      if(window.__SPZ_LINE) window.__SPZ_LINE.open();
    });
    memberTgBtn.addEventListener('click', function(){
      if(window.__SPZ_TG) window.__SPZ_TG.open();
    });
    gate.querySelector('#cagToFull').addEventListener('click', function(){ activeTab = 'full'; paint(); });
    gate.querySelector('#cagToMember').addEventListener('click', function(){ activeTab = 'member'; clearErr(errAdv); paint(); });
    upgradeBtn.addEventListener('click', function(){ activeTab = 'full'; logout(); paint(); });

    // LINE identity is a separate, personal login layered on top of this
    // gate -- it never grants member/full site-edit tiers. Both the tab
    // (shown pre-login, alongside Member/Full) and the row inside the
    // logged-in pane (shown to an already-logged-in member/admin so they
    // can *also* link their own LINE watchlist) reuse the exact same
    // shared session/modal that the Watchlist page owns via
    // window.__SPZ_LINE, so there is only ever one LINE popup/session
    // no matter which entry point opened it.
    gate.querySelector('#cagLineTab').addEventListener('click', function(){
      if(window.__SPZ_LINE) window.__SPZ_LINE.open();
    });
    gate.querySelector('#cagLineRowBtn').addEventListener('click', function(){
      if(!window.__SPZ_LINE) return;
      var st = window.__SPZ_LINE.state();
      if(st.status === 'linked') window.__SPZ_LINE.logout();
      else window.__SPZ_LINE.open();
    });
    gate.querySelector('#cagLineWlBtn').addEventListener('click', function(){
      gate.hidden = true;
      location.hash = '#/watchlist';
    });
    // Repaint whenever LINE state changes from ANY entry point (this gate's
    // own tab/button, or the Watchlist page's connect card/modal) so the
    // two stay in sync without polling each other.
    document.addEventListener('spz:line', function(){ paint(); });
    // A display-name-only edit (topbar "Signed in with LINE" card) uses the
    // narrower 'spz:identity' event instead of 'spz:line' -- see
    // lineUpdateIdentity's own comment -- so this row also needs to listen
    // for it, or a name changed up there wouldn't show here until the next
    // real link/unlink.
    document.addEventListener('spz:identity', function(){ paint(); });

    // Telegram tab/row -- same wiring as the LINE block just above, one
    // provider swapped for the other (see part-61.js's window.__SPZ_TG).
    gate.querySelector('#cagTgTab').addEventListener('click', function(){
      if(window.__SPZ_TG) window.__SPZ_TG.open();
    });
    gate.querySelector('#cagTgRowBtn').addEventListener('click', function(){
      if(!window.__SPZ_TG) return;
      var st = window.__SPZ_TG.state();
      if(st.status === 'linked') window.__SPZ_TG.logout();
      else window.__SPZ_TG.open();
    });
    document.addEventListener('spz:tg', function(){ paint(); });

    paint();
  }

  function paint(){
    if(!gate) return;

    // LINE identity status -- independent of currentTier. This reads the
    // one shared session the Watchlist module owns; if that module hasn't
    // booted yet (window.__SPZ_LINE not yet defined), treat it as idle.
    // Computed up front (moved ahead of the loggedIn/pane checks below) so
    // a visitor who only linked LINE -- never entered the member code --
    // also lands on the persistent "signed in" screen with their name and
    // a logout button, instead of the tab picker reappearing once the QR
    // popup's own brief "connected" beat closes itself.
    var lineSt = window.__SPZ_LINE ? window.__SPZ_LINE.state() : { status:'idle', displayName:null, pictureUrl:null };
    var lineLinked = lineSt.status === 'linked';
    // Same idea, second provider (see part-61.js) -- computed the same way,
    // up front, for the same reason lineSt is.
    var tgSt = window.__SPZ_TG ? window.__SPZ_TG.state() : { status:'idle', displayName:null };
    var tgLinked = tgSt.status === 'linked';

    var loggedIn = currentTier === 'full' || currentTier === 'member' || lineLinked || tgLinked;
    if(paneOut) paneOut.classList.toggle('active', loggedIn);
    if(tabsEl) tabsEl.style.display = loggedIn ? 'none' : 'flex';
    var adminLinks = gate.querySelector('#cagAdminLinks');
    if(adminLinks) adminLinks.classList.toggle('hidden', currentTier !== 'full');
    if(paneMember) paneMember.classList.toggle('active', !loggedIn && activeTab === 'member');
    if(paneAdv) paneAdv.classList.toggle('active', !loggedIn && activeTab === 'full');
    if(tabsEl){
      tabsEl.querySelectorAll('[data-tab]').forEach(function(btn){
        btn.classList.toggle('on', btn.getAttribute('data-tab') === activeTab);
      });
    }
    if(upgradeBtn) upgradeBtn.classList.toggle('hidden', currentTier !== 'member');
    // The generic site "Log out" only makes sense once a member/admin code
    // was actually entered -- for a visitor who is only here via LINE
    // (currentTier stays 'basic'), showing it next to "Log out of LINE"
    // would be a confusing second button that does nothing.
    var siteLogoutBtn = gate.querySelector('#cagBtnLogout');
    if(siteLogoutBtn) siteLogoutBtn.classList.toggle('hidden', currentTier !== 'full' && currentTier !== 'member');

    // Per the LINE tab's own styling comment above (.cag-tier.line), it is
    // intentionally not a real tier tab and never takes the .on state that
    // Member/Full use -- linked status is communicated by #cagLineRow below
    // instead, which is visible on this pane regardless of which tab is active.
    var lineNameTxt = lineLinked ? ((lineSt.nameOverride || lineSt.displayName || '').trim()) : '';
    var lineStatusTxt = lineLinked ? Tt(TXT.lineRowConnected) : Tt(TXT.lineRowNote);
    var lineBtnTxt = lineLinked ? Tt(TXT.lineRowLogout) : Tt(TXT.lineRowConnect);
    var lineAvatarEl = gate.querySelector('#cagLineAvatar');
    var lineRowEl = gate.querySelector('#cagLineRow');
    if(lineRowEl) lineRowEl.classList.toggle('linked', lineLinked);
    if(lineAvatarEl){
      if(lineLinked && lineSt.pictureUrl){ lineAvatarEl.src = lineSt.pictureUrl; lineAvatarEl.classList.remove('hidden'); }
      else { lineAvatarEl.removeAttribute('src'); lineAvatarEl.classList.add('hidden'); }
    }
    var lineWlBtnEl = gate.querySelector('#cagLineWlBtn');
    if(lineWlBtnEl){
      lineWlBtnEl.classList.toggle('hidden', !lineLinked);
      var wlTitle = Tt(TXT.lineWlBtn);
      lineWlBtnEl.setAttribute('aria-label', wlTitle);
      lineWlBtnEl.setAttribute('title', wlTitle);
    }

    // Telegram row -- same treatment as the LINE row just above (no avatar,
    // no watchlist button: see part-61.js's header comment for why).
    var tgNameTxt = tgLinked ? (tgSt.displayName || '').trim() : '';
    var tgStatusTxt = tgLinked ? Tt(TXT.tgRowConnected) : Tt(TXT.tgRowNote);
    var tgBtnTxt = tgLinked ? Tt(TXT.tgRowLogout) : Tt(TXT.tgRowConnect);
    var tgRowEl = gate.querySelector('#cagTgRow');
    if(tgRowEl) tgRowEl.classList.toggle('linked', tgLinked);

    gate.querySelectorAll('[data-x]').forEach(function(el){
      var k = el.getAttribute('data-x');
      var map = {
        brand: TXT.brand,
        status: loggedIn
          ? (Lg() === 'th' ? 'เข้าสู่ระบบแล้ว' : 'Signed in')
          : (Lg() === 'th' ? 'ตรวจสอบสิทธิ์การเข้าถึง' : 'Verifying access'),
        // Priority when more than one is true at once (rare -- e.g. someone
        // linked both LINE and Telegram): real tier first, then LINE (it
        // alone also carries a personal watchlist), then Telegram.
        loggedT: currentTier === 'full' ? TXT.loggedT : currentTier === 'member' ? TXT.memberLoggedT : lineLinked ? TXT.lineLoggedT : TXT.tgLoggedT,
        loggedS: currentTier === 'full' ? TXT.loggedS : currentTier === 'member' ? TXT.memberLoggedS : lineLinked ? TXT.lineLoggedS : TXT.tgLoggedS,
        logoutBtn: TXT.logoutBtn, upgradeBtn: TXT.upgradeBtn,
        adminAddAnalysis: TXT.adminAddAnalysis, adminPrintReport: TXT.adminPrintReport,
        adminCompareDownload: TXT.adminCompareDownload, adminConnectedUsers: TXT.adminConnectedUsers,
        adminAnnouncements: TXT.adminAnnouncements,
        adminPro: TXT.adminPro, adminBriefing: TXT.adminBriefing,
        tabMember: TXT.tabMember, tabFull: TXT.tabFull, tabLine: TXT.tabLine, tabTg: TXT.tabTg,
        lineName: lineNameTxt, lineStatus: lineStatusTxt, lineBtn: lineBtnTxt,
        tgName: tgNameTxt, tgStatus: tgStatusTxt, tgBtn: tgBtnTxt,
        memberT: TXT.memberT, memberS: TXT.memberS,
        memberLineNote: TXT.memberLineNote, memberLineCta: TXT.memberLineCta, memberTgCta: TXT.memberTgCta,
        toFullLink: TXT.toFullLink, toMemberLink: TXT.toMemberLink,
        fullT: TXT.fullT, fullS: TXT.fullS,
        bulk: TXT.bulk, mask: TXT.mask, clear: TXT.clear, spread: TXT.spread, bulkHint: TXT.bulkHint,
        enterAdv: TXT.enter
      };
      if(typeof map[k] === 'string') el.textContent = map[k];
      else if(map[k]) el.textContent = Tt(map[k]);
    });
    gate.querySelector('#cagBulkText').placeholder = Tt(TXT.bulkPh);
  }

  function lockedNow(){ return Date.now() < lockUntil; }
  function registerFail(){
    attempts++;
    if(attempts >= 5) lockUntil = Date.now() + 30000;
  }
  function showErr(el, msg){ el.textContent = msg; el.classList.remove('hidden'); }
  function clearErr(el){ el.classList.add('hidden'); }

  function finishUnlock(tier){
    try { sessionStorage.setItem('spacez.auth', JSON.stringify({ tier:tier, t:Date.now() })); } catch(e){}
    advInputs.forEach(function(inp){ inp.value = ''; inp.classList.remove('filled'); });
    gate.hidden = true;
    applyTier(tier);
  }

  function logout(){
    try { sessionStorage.removeItem('spacez.auth'); } catch(e){}
    applyTier('basic');
  }

  function tryFull(){
    if(lockedNow()){ showErr(errAdv, Tt(TXT.errLock) + Math.ceil((lockUntil - Date.now()) / 1000) + 's'); return; }
    var pw = advInputs.map(function(inp){ return inp.value.trim(); }).join('');
    if(!pw){ showErr(errAdv, Tt(TXT.errEmpty)); return; }
    clearErr(errAdv);
    btnAdv.disabled = true;
    var p = openVault(VAULT_FULL, pw);
    runBoot(p).then(function(data){
      btnAdv.disabled = false;
      if(!data){ registerFail(); showErr(errAdv, Tt(TXT.errBad)); return; }
      finishUnlock('full');
    });
  }

  /* ---------------- tier gating on the live site ---------------- */
  /* No password is required to read the site at all — every visitor lands
     as 'basic' the instant the page loads (see init(), below: it is a
     synchronous default, not something the visitor waits on). Entering the
     50-field key only ever adds the Workbench tools on top of that. */
  var currentTier = 'basic';

  function extractRouteId(elm){
    var rt = elm.getAttribute && elm.getAttribute('data-route-to');
    if(rt) return rt;
    var hv = elm.getAttribute && elm.getAttribute('data-hvgo');
    if(hv) return hv;
    var hg = elm.getAttribute && elm.getAttribute('data-hub-go');
    if(hg) return hg;
    var href = elm.getAttribute && elm.getAttribute('href');
    var m = href && /^#\/([a-z0-9_-]+)$/i.exec(href);
    return m ? m[1] : null;
  }
  var MEMBER_ROUTES = ['stock','watchlist','bubble','chartlab','directory','regime'];
  /* A LINE-linked visitor gets the same MEMBER_ROUTES access as a Member-code
     login, without also having to paste that code in -- a stand-in for a
     real membership system, not a change to what "Member" means: this only
     reads window.__SPZ_LINE (the Watchlist module's own status accessor,
     already used elsewhere), never touches sessionStorage.spacez.auth or
     currentTier itself, and Admin ('full' tier) is untouched either way --
     only the real admin password ever clears that check. */
  function lineIsLinkedNow(){
    try { return !!(window.__SPZ_LINE && window.__SPZ_LINE.state && window.__SPZ_LINE.state().status === 'linked'); }
    catch(e){ return false; }
  }
  // Same stand-in, second provider -- see part-61.js and the comment above.
  function tgIsLinkedNow(){
    try { return !!(window.__SPZ_TG && window.__SPZ_TG.state && window.__SPZ_TG.state().status === 'linked'); }
    catch(e){ return false; }
  }
  function isLockedRoute(id){
    if(LOCKED_ROUTES.indexOf(id) === -1) return false;
    if(currentTier === 'full') return false;
    if(currentTier === 'member') return MEMBER_ROUTES.indexOf(id) === -1;
    if(MEMBER_ROUTES.indexOf(id) !== -1 && (lineIsLinkedNow() || tgIsLinkedNow())) return false;
    return true;
  }
  var LOCK_SEL = '[data-route-to], [data-hvgo], [data-hub-go], a[href^="#/"]';

  /* which tier opens this route: the member code covers MEMBER_ROUTES, and
     everything else in LOCKED_ROUTES needs the full admin key */
  function neededTier(id){
    return MEMBER_ROUTES.indexOf(id) === -1 ? 'admin' : 'member';
  }

  function paintLockVeils(){
    document.querySelectorAll(LOCK_SEL).forEach(function(elm){
      var id = extractRouteId(elm);
      if(!id) return;
      var locked = isLockedRoute(id);
      if(elm.classList.contains('spz-locked-item') !== locked){
        elm.classList.toggle('spz-locked-item', locked);
      }
      var tier = locked ? neededTier(id) : '';
      elm.classList.toggle('spz-need-admin', tier === 'admin');
      elm.classList.toggle('spz-need-member', tier === 'member');
      var label = locked ? Tt(tier === 'admin' ? TXT.lockAdmin : TXT.lockMember) : '';
      var badge = elm.querySelector('.spz-lock-badge');
      if(locked && !badge){
        badge = document.createElement('span');
        badge.className = 'spz-lock-badge';
        badge.innerHTML = '<i class="spz-lock-ico" aria-hidden="true"></i><span class="spz-lock-txt"></span>';
        badge.querySelector('.spz-lock-txt').textContent = label;
        badge.dataset.label = label;
        elm.insertBefore(badge, elm.firstChild);
      } else if(!locked && badge){
        badge.remove();
      } else if(locked && badge && badge.dataset.label !== label){
        badge.querySelector('.spz-lock-txt').textContent = label;
        badge.dataset.label = label;
      }
    });
  }

  var toastEl = null;
  function toast(id){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'cag-toast';
      toastEl.innerHTML = '<span data-t></span><button type="button" data-b></button>';
      document.body.appendChild(toastEl);
      toastEl.querySelector('button').addEventListener('click', function(){
        toastEl.classList.remove('show');
        openGate();
      });
    }
    toastEl.querySelector('[data-t]').textContent =
      Tt(id && neededTier(id) === 'admin' ? TXT.toastAdmin : TXT.toastMember);
    toastEl.querySelector('[data-b]').textContent = Tt(TXT.toastBtn);
    toastEl.classList.add('show');
    clearTimeout(toastEl.__t);
    toastEl.__t = setTimeout(function(){ toastEl.classList.remove('show'); }, 4000);
  }

  function openGate(){
    if(!gate) return;
    gate.hidden = false;
    if(advInputs[0]) advInputs[0].focus();
  }

  /* Auto-open this login gate once per browser tab session, the first time
     a visitor lands on the site -- but only after the earlier disclaimer
     gate (#spzGate) has closed, since that gate's z-index (9000) sits BELOW
     this one (9500) and an unconditional auto-open would render this gate
     on top of a disclaimer the visitor hasn't even read/accepted yet. If
     the visitor dismisses this with the X (or never interacts with it),
     they carry on as a normal 'basic' visitor exactly as today -- this only
     decides whether the gate offers itself once, not whether it's required. */
  function maybeAutoOpenGate(){
    try { if(sessionStorage.getItem('spz_auth_gate_auto_shown')) return; } catch(e){}
    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      var dg = document.getElementById('spzGate');
      var disclaimerOpen = !!(dg && !dg.hidden);
      if(disclaimerOpen && tries < 300) return; // keep waiting (up to ~30s)
      clearInterval(iv);
      try { sessionStorage.setItem('spz_auth_gate_auto_shown', '1'); } catch(e){}
      if(disclaimerOpen) return; // gave up waiting -- don't stack on top of it
      if(currentTier === 'basic' && !lineIsLinkedNow() && !tgIsLinkedNow() && gate && gate.hidden) openGate();
    }, 100);
  }

  function applyTier(tier){
    currentTier = tier;
    paintLockVeils();
    paint();
    try { document.dispatchEvent(new CustomEvent('spz:tier', { detail:{ tier: currentTier } })); } catch(e){}
  }

  // Cross-module accessor, following the site's established convention
  // (window.__SPZ_LIVE, window.__SPZ_BUBBLE, window.__SPZ_RANK, window.__SPZ_DIR, ...)
  // so other closures (e.g. the Compare Stocks module) can check whether the
  // current visitor is logged in as admin ('full' tier) without needing
  // access to this module's private currentTier variable.
  window.__SPZ_TIER = function(){ return currentTier; };
  // '__cmpAdminOnly__' is not a real route id / never appears in MEMBER_ROUTES,
  // so neededTier() on it always resolves to 'admin' -- reusing the existing
  // toast() copy/UI ("please log in as admin") for the Compare Stocks PDF
  // download button, which is gated outside this closure.
  window.__SPZ_REQUIRE_ADMIN = function(){ toast('__cmpAdminOnly__'); };

  document.addEventListener('click', function(ev){
    var t = ev.target, elm = t && t.closest && t.closest(LOCK_SEL);
    if(!elm) return;
    var id = extractRouteId(elm);
    if(id && isLockedRoute(id)){
      ev.preventDefault(); ev.stopPropagation();
      if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      toast(id);
    }
  }, true);

  window.addEventListener('hashchange', function(){
    var m = /^#\/([a-z0-9_-]+)$/i.exec(location.hash || '');
    if(m && isLockedRoute(m[1])){
      toast(m[1]);
      location.hash = '#/now';
    }
  });

  /* registered unconditionally (not inside buildGate(), which only runs
     once the corner login popup has been opened at least once) so nav lock
     badges refresh the instant LINE links or unlinks, even for a visitor
     who never opened that popup -- covers both a fresh link/logout action
     and the async "already linked from a previous visit" resolution on
     page load (lineRestoreFromWorker fires this same event when it's done). */
  document.addEventListener('spz:line', function(){ paintLockVeils(); });
  document.addEventListener('spz:tg', function(){ paintLockVeils(); });

  document.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape' && gate && !gate.hidden) gate.hidden = true;
  });

  var mo = new MutationObserver(function(){
    // guard: paintLockVeils() itself mutates the DOM (badge insert/remove),
    // so without this, observing document.body/subtree would re-trigger the
    // observer on its own writes -> infinite loop. Matches the debounce
    // idiom already used elsewhere in this file (see the `decorate` grid
    // observer) plus the idempotent writes above, belt-and-suspenders.
    if(mo.__busy) return;
    mo.__busy = true;
    setTimeout(function(){ mo.__busy = false; }, 0);
    if(currentTier) paintLockVeils();
  });
  mo.observe(document.body, { childList:true, subtree:true });

  /* ---------------- boot ---------------- */
  function init(){
    buildGate();

    adminTrigger = document.createElement('button');
    adminTrigger.id = 'spzAdminTrigger';
    adminTrigger.type = 'button';
    /* a small trend-chart glyph instead of a padlock — reads as just another
       market/info icon, not as "this is a login button" */
    adminTrigger.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 5"></polyline><polyline points="15 5 21 5 21 11"></polyline></svg>';
    adminTrigger.title = Tt(TXT.adminTriggerTitle);
    adminTrigger.setAttribute('aria-label', Tt(TXT.adminTriggerTitle));
    adminTrigger.addEventListener('click', openGate);
    document.body.appendChild(adminTrigger);

    /* Tier is decided synchronously, right here — nobody waits on this.
       Default is always 'basic' (the whole site, minus Workbench); a
       still-fresh Full-Access session (<12h, sessionStorage only) upgrades
       it immediately. There is no password prompt standing between a
       visitor and the site. */
    var tier = 'basic';
    try {
      var raw = sessionStorage.getItem('spacez.auth');
      if(raw){
        var o = JSON.parse(raw);
        if(o && (o.tier === 'full' || o.tier === 'member') && o.t && (Date.now() - o.t) < 12 * 60 * 60 * 1000) tier = o.tier;
      }
    } catch(e){}
    applyTier(tier);
    maybeAutoOpenGate();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.__spzRepaintAuthGate = paint;
  if(window.repaint && window.repaint.push) window.repaint.push(paint);
})();
