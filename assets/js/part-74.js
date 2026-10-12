/* ============================================================================
   SPACEZ TERMINAL -- Round AM: site accounts (username + password)
   ----------------------------------------------------------------------------
   1) window.__SPZ_ACC -- the visitor side. Sign-in form lives in the login
      gate's Member pane (part-46.js). The Worker returns a token kept in
      localStorage; on every page load it is re-checked with /api/acc/me.
      A new account must set its display name before going on (modal below).
      Role "member" / "student" = member pages (same as a LINE login);
      role "editor" also unlocks the Editor tools (read-only content), by
      sending "acc.<token>" as its key -- the Worker checks it.
   2) Admin panel injected at the top of Connected Users (#/connectedusers):
      left = create accounts + list, right = the selected account (role,
      reset password, turn off/on, delete). Passwords are shown ONCE.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_ACC) return;

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var TOK_KEY = 'spz.acc.token';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { if(v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){} }
  function post(path, body, key){
    var h = { 'Content-Type':'application/json' }; if(key) h['X-Admin-Key'] = key;
    return fetch(WORKER_BASE + path, { method:'POST', headers:h, body:JSON.stringify(body || {}) })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j = j || {}; j.__status = r.status; return j; }); })
      .catch(function(){ return { error:'net' }; });
  }

  var U = {
    nameT:{ en:'Welcome! Set your display name', th:'ยินดีต้อนรับค่ะ ตั้งชื่อที่จะใช้แสดงก่อนนะคะ' },
    nameS:{ en:'This name is shown on your profile, certificates and reports. You can ask the admin to change it later.', th:'ชื่อนี้จะแสดงในโปรไฟล์ เกียรติบัตร และรายงาน ภายหลังขอให้แอดมินเปลี่ยนให้ได้' },
    namePh:{ en:'Your name', th:'ชื่อของคุณ' }, nameGo:{ en:'Save and continue', th:'บันทึกและเริ่มใช้งาน' },
    nameBad:{ en:'Please type at least 2 characters.', th:'พิมพ์อย่างน้อย 2 ตัวอักษร' },
    out:{ en:'Sign out', th:'ออกจากระบบ' }
  };

  /* ------------------------------------------------------------ visitor side */
  var st = { status:'idle', username:'', displayName:'', role:'', needName:false };
  function emit(){ try { document.dispatchEvent(new CustomEvent('spz:acc', { detail:st })); } catch(e){} }
  function apply(acc, token){
    st = { status:'linked', username:acc.username, displayName:acc.displayName || '', role:acc.role, needName:!!acc.needName };
    if(acc.role === 'editor' && token){
      try { sessionStorage.setItem('spz_editor_code', 'acc.' + token); } catch(e){}
      if(window.__spzAccEditor) window.__spzAccEditor();
    }
    emit();
    if(st.needName) askName();
  }
  function clear(){
    st = { status:'idle', username:'', displayName:'', role:'', needName:false };
    emit();
  }
  function login(u, p){
    return post('/api/acc/login', { username:u, password:p }).then(function(j){
      if(j && j.ok && j.token){ lsSet(TOK_KEY, j.token); apply(j.account, j.token); return { ok:true }; }
      return { ok:false, error:(j && j.error) || 'bad_login' };
    });
  }
  function logout(){
    var t = lsGet(TOK_KEY);
    lsSet(TOK_KEY, null);
    if(t) post('/api/acc/logout', { token:t });
    if(st.status === 'linked') clear();
  }
  function check(){
    var t = lsGet(TOK_KEY);
    if(!t) return;
    post('/api/acc/me', { token:t }).then(function(j){
      if(j && j.ok && j.account) apply(j.account, t);
      else if(j && j.__status === 401){ lsSet(TOK_KEY, null); clear(); }
    });
  }

  /* forced display name */
  var modal = null;
  function askName(){
    if(modal) return;
    modal = document.createElement('div');
    modal.className = 'acc-modal';
    modal.innerHTML = '<div class="acc-card"><div class="acc-badge">SPACEZ</div><h3></h3><p></p>' +
      '<input type="text" maxlength="60" class="acc-in"><div class="acc-err"></div><button type="button" class="acc-go"></button></div>';
    modal.querySelector('h3').textContent = T(U.nameT);
    modal.querySelector('p').textContent = T(U.nameS);
    var inp = modal.querySelector('input'), err = modal.querySelector('.acc-err'), go = modal.querySelector('.acc-go');
    inp.placeholder = T(U.namePh); go.textContent = T(U.nameGo);
    function save(){
      var n = inp.value.trim();
      if(n.length < 2){ err.textContent = T(U.nameBad); return; }
      go.disabled = true;
      post('/api/acc/setname', { token:lsGet(TOK_KEY), name:n }).then(function(j){
        go.disabled = false;
        if(j && j.ok){ st.displayName = j.account.displayName; st.needName = false; modal.remove(); modal = null; emit(); }
        else err.textContent = T(U.nameBad);
      });
    }
    go.addEventListener('click', save);
    inp.addEventListener('keydown', function(ev){ if(ev.key === 'Enter') save(); });
    document.body.appendChild(modal);
    setTimeout(function(){ inp.focus(); }, 50);
  }

  window.__SPZ_ACC = { state:function(){ return st; }, login:login, logout:logout, check:check };

  /* ------------------------------------------------------------- admin side */
  var A = {
    h:{ en:'Site accounts (username + password)', th:'บัญชีผู้ใช้ (ชื่อผู้ใช้ + รหัสผ่าน)' },
    lede:{ en:'Create accounts here and hand out the username and password. On first sign-in the person must set a display name. Passwords are stored only as a hash — you see each one once.', th:'สร้างบัญชีที่นี่แล้วส่งชื่อผู้ใช้กับรหัสผ่านให้ผู้ใช้ เข้าครั้งแรกระบบจะบังคับให้ตั้งชื่อ รหัสผ่านเก็บแบบเข้ารหัสทางเดียว จะเห็นได้ครั้งเดียวตอนสร้างหรือรีเซ็ตเท่านั้น' },
    create:{ en:'Create accounts', th:'สร้างบัญชี' }, count:{ en:'How many', th:'จำนวน' }, note:{ en:'Note (e.g. class / who)', th:'บันทึก (เช่น รุ่น / ชื่อคน)' },
    role:{ en:'Role', th:'สิทธิ์' }, go:{ en:'+ Create', th:'+ สร้าง' },
    roles:{ member:{en:'Member',th:'สมาชิก'}, student:{en:'Student',th:'นักเรียน'}, editor:{en:'Editor',th:'Editor'} },
    roleD:{ member:{en:'Member pages, like a LINE sign-in',th:'เข้าหน้าสมาชิกได้ เหมือนล็อกอิน LINE'}, student:{en:'Member pages; marked as a classroom student',th:'เข้าหน้าสมาชิกได้ และติดป้ายนักเรียน'}, editor:{en:'Member pages + Editor tools (read-only content)',th:'หน้าสมาชิก + เครื่องมือ Editor (อ่านเนื้อหาได้ แก้ไม่ได้)'} },
    newT:{ en:'New accounts — copy now, the password is shown only once', th:'บัญชีใหม่ — คัดลอกเก็บไว้ตอนนี้ รหัสผ่านจะแสดงครั้งเดียว' },
    copy:{ en:'Copy all', th:'คัดลอกทั้งหมด' }, copied:{ en:'Copied', th:'คัดลอกแล้ว' },
    list:{ en:'Accounts', th:'รายชื่อบัญชี' }, search:{ en:'Search…', th:'ค้นหา…' }, none:{ en:'No accounts yet.', th:'ยังไม่มีบัญชี' },
    pick:{ en:'Pick an account on the left.', th:'เลือกบัญชีทางซ้ายเพื่อดูรายละเอียด' },
    noName:{ en:'(name not set yet)', th:'(ยังไม่ได้ตั้งชื่อ)' }, off:{ en:'off', th:'ปิดอยู่' },
    created:{ en:'Created', th:'สร้างเมื่อ' }, last:{ en:'Last sign-in', th:'เข้าใช้ล่าสุด' }, never:{ en:'never', th:'ยังไม่เคย' },
    dname:{ en:'Display name', th:'ชื่อที่แสดง' }, save:{ en:'Save', th:'บันทึก' }, clearName:{ en:'Make them set a new name', th:'ให้ตั้งชื่อใหม่ตอนเข้าครั้งหน้า' },
    reset:{ en:'Reset password', th:'รีเซ็ตรหัสผ่าน' }, newPw:{ en:'New password (shown once):', th:'รหัสผ่านใหม่ (แสดงครั้งเดียว):' },
    disable:{ en:'Turn off account', th:'ปิดบัญชีชั่วคราว' }, enable:{ en:'Turn account back on', th:'เปิดบัญชีกลับมา' },
    del:{ en:'Delete account', th:'ลบบัญชี' }, delSure:{ en:'Tap again to delete for good', th:'แตะอีกครั้งเพื่อยืนยันการลบ' },
    needKey:{ en:'Unlock this page with the admin key below first.', th:'ปลดล็อกหน้านี้ด้วยรหัสแอดมินด้านล่างก่อนค่ะ' },
    oldWorker:{ en:'The Worker has no account system yet — paste the new line-qr-worker.js into Cloudflare and Deploy.', th:'Worker ยังไม่มีระบบบัญชี — นำไฟล์ line-qr-worker.js ใหม่ไปวางใน Cloudflare แล้วกด Deploy' },
    links:{ en:'Sign-in apps linked', th:'แอปที่ผูกไว้' }, linksSoon:{ en:'Linking LINE / Telegram to an account comes in the next round.', th:'การผูก LINE / Telegram เข้ากับบัญชีจะเพิ่มในรอบถัดไป' }
  };
  var adm = { list:null, busy:false, err:'', sel:'', q:'', made:null, role:'member', count:1, note:'', pw:null, delArm:'', copied:false };
  function akey(){ try { return sessionStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; } }
  function fmt(ms){ if(!ms) return T(A.never); try { return new Date(ms).toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); } catch(e){ return ''; } }

  function admLoad(){
    var k = akey(); if(!k){ admPaint(1); return; }
    adm.busy = true; admPaint(1);
    fetch(WORKER_BASE + '/api/admin/accounts/list', { headers:{ 'X-Admin-Key':k } })
      .then(function(r){ if(r.status === 404) return { __old:true }; return r.json(); })
      .then(function(j){ adm.busy = false; if(j && j.__old){ adm.err = T(A.oldWorker); adm.list = []; } else { adm.err = ''; adm.list = (j && j.accounts) || []; } admPaint(1); })
      .catch(function(){ adm.busy = false; adm.err = T(A.oldWorker); admPaint(1); });
  }
  function admSel(){ var r = null; (adm.list || []).forEach(function(a){ if(a.username === adm.sel) r = a; }); return r; }
  function upd(body){
    adm.busy = true; admPaint(1);
    return post('/api/admin/accounts/update', body, akey()).then(function(j){
      adm.busy = false;
      if(j && j.ok){
        if(j.deleted){ adm.list = adm.list.filter(function(a){ return a.username !== j.deleted; }); adm.sel = ''; }
        else if(j.account){ adm.list = adm.list.map(function(a){ return a.username === j.account.username ? j.account : a; }); }
        if(j.password) adm.pw = { u:body.username, p:j.password };
      } else adm.err = (j && j.__status === 404) ? T(A.oldWorker) : 'Error';
      admPaint(1);
    });
  }
  function leftHTML(){
    var h = '<div class="acc-box"><div class="acc-bh">' + esc(T(A.create)) + '</div>' +
      '<div class="acc-roles">' + ['member', 'student', 'editor'].map(function(r){ return '<button type="button" class="acc-chip' + (adm.role === r ? ' on' : '') + '" data-acc-role="' + r + '"><b>' + esc(T(A.roles[r])) + '</b><span>' + esc(T(A.roleD[r])) + '</span></button>'; }).join('') + '</div>' +
      '<div class="acc-row"><label><span>' + esc(T(A.count)) + '</span><input type="number" min="1" max="30" value="' + adm.count + '" data-acc-in="count"></label>' +
      '<label class="grow"><span>' + esc(T(A.note)) + '</span><input type="text" maxlength="60" value="' + esc(adm.note) + '" data-acc-in="note"></label></div>' +
      '<button type="button" class="acc-btn" data-acc-act="create"' + (adm.busy ? ' disabled' : '') + '>' + esc(T(A.go)) + '</button>';
    if(adm.made && adm.made.length){
      h += '<div class="acc-made"><div class="acc-bh">' + esc(T(A.newT)) + '</div>' + adm.made.map(function(m){ return '<div class="acc-cred"><code>' + esc(m.username) + '</code><code>' + esc(m.password) + '</code><em>' + esc(T(A.roles[m.role])) + '</em></div>'; }).join('') +
        '<button type="button" class="acc-mini" data-acc-act="copy">' + esc(T(adm.copied ? A.copied : A.copy)) + '</button></div>';
    }
    h += '</div><div class="acc-box"><div class="acc-bh">' + esc(T(A.list)) + ' <small>' + (adm.list ? adm.list.length : '…') + '</small></div>' +
      '<input type="text" class="acc-search" placeholder="' + esc(T(A.search)) + '" value="' + esc(adm.q) + '" data-acc-in="q"><div class="acc-list">';
    var q = adm.q.trim().toLowerCase();
    var list = (adm.list || []).filter(function(a){ return !q || (a.username + ' ' + a.displayName + ' ' + a.note + ' ' + a.role).toLowerCase().indexOf(q) !== -1; });
    h += list.length ? list.map(function(a){
      return '<button type="button" class="acc-li' + (a.username === adm.sel ? ' on' : '') + (a.disabled ? ' off' : '') + '" data-acc-sel="' + esc(a.username) + '"><b>' + esc(a.displayName || T(A.noName)) + '</b>' +
        '<span><code>' + esc(a.username) + '</code> · ' + esc(T(A.roles[a.role] || A.roles.member)) + (a.disabled ? ' · ' + esc(T(A.off)) : '') + (a.note ? ' · ' + esc(a.note) : '') + '</span></button>';
    }).join('') : '<div class="acc-empty">' + esc(T(A.none)) + '</div>';
    return h + '</div></div>';
  }
  function rightHTML(){
    var a = admSel();
    if(!a) return '<div class="acc-box acc-pick">' + esc(T(A.pick)) + '</div>';
    var h = '<div class="acc-box"><div class="acc-dh"><div class="acc-ava">' + esc((a.displayName || a.username).slice(0, 1).toUpperCase()) + '</div><div><b>' + esc(a.displayName || T(A.noName)) + '</b><code>' + esc(a.username) + '</code></div></div>' +
      '<div class="acc-meta"><span>' + esc(T(A.created)) + ': ' + esc(fmt(a.createdAt)) + '</span><span>' + esc(T(A.last)) + ': ' + esc(fmt(a.lastLoginAt)) + '</span></div>' +
      '<div class="acc-bh">' + esc(T(A.role)) + '</div><div class="acc-roles">' + ['member', 'student', 'editor'].map(function(r){ return '<button type="button" class="acc-chip' + (a.role === r ? ' on' : '') + '" data-acc-setrole="' + r + '"><b>' + esc(T(A.roles[r])) + '</b><span>' + esc(T(A.roleD[r])) + '</span></button>'; }).join('') + '</div>' +
      '<div class="acc-bh">' + esc(T(A.dname)) + '</div><div class="acc-row"><input type="text" class="grow" maxlength="60" value="' + esc(a.displayName) + '" data-acc-dname="1"><button type="button" class="acc-mini" data-acc-act="savename">' + esc(T(A.save)) + '</button></div>' +
      '<button type="button" class="acc-link" data-acc-act="clearname">' + esc(T(A.clearName)) + '</button>' +
      '<div class="acc-bh">' + esc(T(A.note)) + '</div><div class="acc-row"><input type="text" class="grow" maxlength="60" value="' + esc(a.note) + '" data-acc-note="1"><button type="button" class="acc-mini" data-acc-act="savenote">' + esc(T(A.save)) + '</button></div>' +
      '<div class="acc-bh">' + esc(T(A.links)) + '</div><div class="acc-hint">' + esc(T(A.linksSoon)) + '</div>' +
      '<div class="acc-actions"><button type="button" class="acc-btn ghost" data-acc-act="reset">' + esc(T(A.reset)) + '</button>' +
      '<button type="button" class="acc-btn ghost" data-acc-act="toggle">' + esc(T(a.disabled ? A.enable : A.disable)) + '</button>' +
      '<button type="button" class="acc-btn danger" data-acc-act="delete">' + esc(T(adm.delArm === a.username ? A.delSure : A.del)) + '</button></div>';
    if(adm.pw && adm.pw.u === a.username) h += '<div class="acc-made"><div class="acc-bh">' + esc(T(A.newPw)) + '</div><div class="acc-cred"><code>' + esc(a.username) + '</code><code>' + esc(adm.pw.p) + '</code></div></div>';
    return h + '</div>';
  }
  var host = null;
  function admPaint(force){
    var cu = document.getElementById('connectedusers');
    if(!cu) return;
    var tier = ''; try { tier = window.__SPZ_TIER ? window.__SPZ_TIER() : ''; } catch(e){}
    if(!host || !cu.contains(host)){
      var body = cu.querySelector('[data-cu="body"]');
      if(!body) return;
      host = document.createElement('div'); host.className = 'acc-wrap';
      body.parentNode.insertBefore(host, body);
      host.addEventListener('click', onClick); host.addEventListener('input', onInput);
    }
    if(tier !== 'full'){ host.innerHTML = ''; return; }
    var a = document.activeElement;
    if(!force && a && host.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
    var keep = a && a.getAttribute && a.getAttribute('data-acc-in') === 'q' ? a.selectionStart : null;
    var inner;
    if(!akey()) inner = '<div class="acc-hint">' + esc(T(A.needKey)) + '</div>';
    else {
      if(adm.list === null && !adm.busy){ setTimeout(admLoad, 0); }
      inner = (adm.err ? '<div class="acc-err2">' + esc(adm.err) + '</div>' : '') + '<div class="acc-grid"><div class="acc-left">' + leftHTML() + '</div><div class="acc-right">' + rightHTML() + '</div></div>';
    }
    host.innerHTML = '<div class="acc-head"><h3>' + esc(T(A.h)) + '</h3><p>' + esc(T(A.lede)) + '</p></div>' + inner;
    if(keep !== null){ var qi = host.querySelector('[data-acc-in="q"]'); if(qi){ qi.focus(); try { qi.setSelectionRange(keep, keep); } catch(e){} } }
  }
  function onInput(ev){
    var t = ev.target, k = t.getAttribute('data-acc-in');
    if(k === 'count') adm.count = Math.max(1, Math.min(30, parseInt(t.value, 10) || 1));
    else if(k === 'note') adm.note = t.value;
    else if(k === 'q'){ adm.q = t.value; admPaint(1); }
  }
  function onClick(ev){
    var t = ev.target;
    var r = t.closest('[data-acc-role]'); if(r){ adm.role = r.getAttribute('data-acc-role'); admPaint(1); return; }
    var s = t.closest('[data-acc-sel]'); if(s){ adm.sel = s.getAttribute('data-acc-sel'); adm.delArm = ''; adm.pw = null; admPaint(1); return; }
    var sr = t.closest('[data-acc-setrole]'); if(sr){ upd({ username:adm.sel, role:sr.getAttribute('data-acc-setrole') }); return; }
    var b = t.closest('[data-acc-act]'); if(!b) return;
    var act = b.getAttribute('data-acc-act'), a = admSel();
    if(act === 'create'){
      adm.busy = true; adm.made = null; adm.copied = false; admPaint(1);
      post('/api/admin/accounts/create', { count:adm.count, role:adm.role, note:adm.note }, akey()).then(function(j){
        adm.busy = false;
        if(j && j.ok){ adm.made = j.created; adm.list = null; admLoad(); }
        else { adm.err = (j && j.__status === 404) ? T(A.oldWorker) : 'Error'; admPaint(1); }
      });
    }
    else if(act === 'copy' && adm.made){
      var txt = adm.made.map(function(m){ return m.username + '  /  ' + m.password; }).join('\n');
      try { navigator.clipboard.writeText(txt); } catch(e){}
      adm.copied = true; admPaint(1);
    }
    else if(!a) return;
    else if(act === 'savename'){ var dn = host.querySelector('[data-acc-dname]'); upd({ username:a.username, displayName:dn ? dn.value : '' }); }
    else if(act === 'savenote'){ var nt = host.querySelector('[data-acc-note]'); upd({ username:a.username, note:nt ? nt.value : '' }); }
    else if(act === 'clearname') upd({ username:a.username, clearName:true });
    else if(act === 'reset') upd({ username:a.username, resetPassword:true });
    else if(act === 'toggle') upd({ username:a.username, disabled:!a.disabled });
    else if(act === 'delete'){
      if(adm.delArm === a.username){ adm.delArm = ''; upd({ username:a.username, delete:true }); }
      else { adm.delArm = a.username; admPaint(1); setTimeout(function(){ if(adm.delArm === a.username){ adm.delArm = ''; admPaint(1); } }, 4000); }
    }
  }

  /* ---------------------------------------------------------------- styles */
  var css = document.createElement('style');
  css.textContent =
    '.cag-acc{display:flex;flex-direction:column;gap:8px;margin:4px 0 12px;}' +
    '.cag-acc-h{font-size:12px;letter-spacing:.06em;color:var(--grey,#9aa3ad);text-transform:uppercase;}' +
    '.cag-acc-in{width:100%;box-sizing:border-box;}' +
    '.cag-acc-or{text-align:center;font-size:11.5px;color:var(--grey-dim,#6b6f66);margin-top:4px;}' +
    '.acc-modal{position:fixed;inset:0;z-index:100000;background:rgba(3,6,14,.78);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;}' +
    '.acc-card{width:min(420px,100%);background:linear-gradient(180deg,#0d1730,#070c19);border:1px solid rgba(25,211,255,.35);border-radius:18px;padding:24px;color:#e9f2ff;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 40px rgba(25,211,255,.12);}' +
    '.acc-badge{display:inline-block;font:700 11px/1 "IBM Plex Mono",monospace;letter-spacing:.3em;padding:6px 10px;border-radius:6px;color:#071022;background:linear-gradient(90deg,#19d3ff,#a6f000);}' +
    '.acc-card h3{margin:14px 0 6px;font-size:19px;} .acc-card p{margin:0 0 14px;font-size:13px;line-height:1.6;color:#b9c8e2;}' +
    '.acc-in{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:15px;}' +
    '.acc-err{min-height:18px;margin:6px 0;font-size:12px;color:#ff6b75;}' +
    '.acc-go{width:100%;padding:12px;border:0;border-radius:12px;font:inherit;font-weight:700;cursor:pointer;color:#071022;background:linear-gradient(90deg,#19d3ff,#a6f000);}' +
    '.acc-wrap{margin:0 0 26px;}' +
    '.acc-head h3{margin:0 0 4px;font-size:18px;color:var(--white,#fff);} .acc-head p{margin:0 0 14px;font-size:13px;color:var(--grey,#9aa3ad);line-height:1.6;}' +
    '.acc-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:16px;align-items:start;}' +
    '@media(max-width:860px){.acc-grid{grid-template-columns:1fr;}}' +
    '.acc-box{border:1px solid var(--border-dim,rgba(255,255,255,.14));border-radius:14px;padding:14px;margin-bottom:14px;background:rgba(255,255,255,.02);}' +
    '.acc-bh{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--grey,#9aa3ad);margin:10px 0 8px;} .acc-box > .acc-bh:first-child{margin-top:0;}' +
    '.acc-bh small{color:var(--neon,#ccff00);}' +
    '.acc-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;}' +
    '@media(max-width:520px){.acc-roles{grid-template-columns:1fr;}}' +
    '.acc-chip{all:unset;box-sizing:border-box;cursor:pointer;padding:9px 10px;border-radius:10px;border:1px solid var(--border-dim,rgba(255,255,255,.16));}' +
    '.acc-chip b{display:block;font-size:13px;color:var(--white,#fff);} .acc-chip span{display:block;font-size:11px;color:var(--grey,#9aa3ad);margin-top:3px;line-height:1.4;}' +
    '.acc-chip.on{border-color:var(--neon,#ccff00);background:rgba(204,255,0,.07);} .acc-chip.on b{color:var(--neon,#ccff00);}' +
    '.acc-row{display:flex;gap:8px;align-items:flex-end;margin-top:10px;} .acc-row .grow{flex:1;} .acc-row label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--grey,#9aa3ad);}' +
    '.acc-row input,.acc-search{box-sizing:border-box;width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border-dim,rgba(255,255,255,.16));background:rgba(255,255,255,.05);color:var(--white,#fff);font:inherit;font-size:14px;}' +
    '.acc-row label:first-child input{width:80px;}' +
    '.acc-btn{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;text-align:center;margin-top:12px;padding:11px;border-radius:11px;font-weight:700;font-size:14px;color:#071022;background:var(--neon,#ccff00);}' +
    '.acc-btn[disabled]{opacity:.5;cursor:default;} .acc-btn.ghost{background:transparent;color:var(--white,#fff);border:1px solid var(--border-dim,rgba(255,255,255,.2));} .acc-btn.danger{background:transparent;color:#ff6b75;border:1px solid rgba(255,107,117,.5);}' +
    '.acc-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:6px;} .acc-actions .acc-btn{font-size:12.5px;padding:10px 6px;}' +
    '@media(max-width:520px){.acc-actions{grid-template-columns:1fr;}}' +
    '.acc-mini{all:unset;cursor:pointer;padding:9px 12px;border-radius:10px;border:1px solid var(--border-dim,rgba(255,255,255,.2));font-size:12.5px;color:var(--white,#fff);white-space:nowrap;}' +
    '.acc-link{all:unset;cursor:pointer;margin-top:6px;font-size:12px;color:var(--grey,#9aa3ad);text-decoration:underline;}' +
    '.acc-made{margin-top:12px;padding:12px;border-radius:12px;border:1px dashed var(--neon,#ccff00);background:rgba(204,255,0,.05);}' +
    '.acc-cred{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);}' +
    '.acc-cred code{font:600 14px "IBM Plex Mono",monospace;color:var(--white,#fff);background:rgba(255,255,255,.06);padding:4px 8px;border-radius:6px;letter-spacing:.06em;} .acc-cred em{font-style:normal;font-size:11.5px;color:var(--grey,#9aa3ad);}' +
    '.acc-list{display:flex;flex-direction:column;gap:6px;max-height:420px;overflow-y:auto;margin-top:8px;}' +
    '.acc-li{all:unset;box-sizing:border-box;cursor:pointer;padding:10px 12px;border-radius:10px;border:1px solid var(--border-dim,rgba(255,255,255,.12));}' +
    '.acc-li b{display:block;font-size:13.5px;color:var(--white,#fff);} .acc-li span{display:block;font-size:11.5px;color:var(--grey,#9aa3ad);margin-top:3px;} .acc-li code{font-family:"IBM Plex Mono",monospace;}' +
    '.acc-li.on{border-color:var(--neon,#ccff00);background:rgba(204,255,0,.06);} .acc-li.off{opacity:.55;}' +
    '.acc-empty,.acc-pick,.acc-hint{font-size:13px;color:var(--grey,#9aa3ad);} .acc-err2{margin-bottom:10px;padding:10px 12px;border-radius:10px;background:rgba(255,107,117,.1);color:#ff8a92;font-size:13px;}' +
    '.acc-dh{display:flex;gap:12px;align-items:center;} .acc-dh b{display:block;font-size:16px;color:var(--white,#fff);} .acc-dh code{font:600 12.5px "IBM Plex Mono",monospace;color:var(--grey,#9aa3ad);}' +
    '.acc-ava{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;color:#071022;background:linear-gradient(135deg,#19d3ff,#a6f000);}' +
    '.acc-meta{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:10px;font-size:11.5px;color:var(--grey,#9aa3ad);}' +
    'html[data-theme="light"] .acc-box{background:rgba(0,0,0,.02);}';
  (document.head || document.documentElement).appendChild(css);

  /* ------------------------------------------------------------------ boot */
  function boot(){
    check();
    var tries = 0;
    var iv = setInterval(function(){ if(document.getElementById('connectedusers')){ admPaint(0); clearInterval(iv); } else if(++tries > 60) clearInterval(iv); }, 500);
    new MutationObserver(function(){ admPaint(0); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('spz:tier', function(){ admPaint(0); });
    setInterval(function(){ if(location.hash === '#/connectedusers' && adm.list === null && !adm.busy && akey()) admPaint(0); }, 2000);
    window.addEventListener('hashchange', function(){ if(location.hash === '#/connectedusers'){ if(adm.list === null || !host) admPaint(1); else admLoad(); } });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 900); });
  else setTimeout(boot, 900);
})();
