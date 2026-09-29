
/* ============================================================================
   SPACEZ TERMINAL — ROUND R: TELEGRAM QR LOGIN
   A second, independent QR login next to LINE (window.__SPZ_LINE, see
   part-39.js) -- same corner login gate (#spzAuthGate, part-46.js), same
   Cloudflare Worker (line-qr-worker.js), same session-code + polling
   pattern, deliberately kept in its own small file rather than folding into
   part-39.js: that file already owns the live, working LINE session plus
   the whole Watchlist page, and this feature has no watchlist of its own
   (Telegram already has its own richer add/remove/list bot for that --
   this is purely "scan to get Member access", mirroring what a LINE login
   grants). Keeping it separate means this can be added, tested, and (if
   ever needed) reverted without touching that file at all.

   Uses the SAME Worker as LINE, via a `provider=telegram` query param on
   the shared /api/session/new endpoint -- see line-qr-worker.js's
   "TELEGRAM LOGIN" section for the full backend side of this. Everything
   from there on (poll /api/session/status, then /api/session/data, then
   persist the code in sessionStorage) is the same shape LINE already uses,
   just against a session whose userId happens to start with "tg:" instead
   of a LINE userId -- the Worker's other endpoints never needed to care
   which provider a session came from.
   ========================================================================= */
(function(){
  'use strict';
  if (window.__SPZ_TG) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var TG_STORAGE_KEY = 'spz_tg_link';
  function tgWorkerReady(){ return WORKER_BASE.indexOf('REPLACE-ME') === -1; }
  function tgApi(path){ return WORKER_BASE.replace(/\/$/, '') + path; }

  function tgSaveSession(){
    try {
      sessionStorage.setItem(TG_STORAGE_KEY, JSON.stringify({
        code: state.code, displayName: state.displayName, pictureUrl: state.pictureUrl
      }));
    } catch(e){}
  }
  function tgLoadSession(){
    try { var raw = sessionStorage.getItem(TG_STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
    catch(e){ return null; }
  }
  function tgClearSession(){ try { sessionStorage.removeItem(TG_STORAGE_KEY); } catch(e){} }

  var C = {
    title:{en:'Sign in with Telegram',th:'เข้าสู่ระบบด้วย Telegram'},
    sub:{en:'Open Telegram on your phone and scan this — tapping Start logs you in within a few seconds.',
         th:'เปิด Telegram บนมือถือแล้วสแกนโค้ดนี้ กดปุ่ม Start แล้วจะเข้าสู่ระบบให้ภายในไม่กี่วินาที'},
    waiting:{en:'Waiting for you to tap Start…',th:'รอคุณกดปุ่ม Start อยู่ค่ะ…'},
    processing:{en:'Confirming…',th:'กำลังยืนยัน…'},
    connectedNote:{en:'Connected',th:'เชื่อมต่อสำเร็จ'},
    notReady:{en:'Telegram login isn’t set up yet.',th:'ยังไม่ได้ตั้งค่าระบบล็อกอิน Telegram ค่ะ'},
    err:{en:'Something went wrong. Try again?',th:'มีบางอย่างผิดพลาดค่ะ ลองใหม่อีกครั้งไหม?'},
    expired:{en:'This code expired. Try again?',th:'โค้ดนี้หมดอายุแล้วค่ะ ลองใหม่อีกครั้งไหม?'},
    quotaErr:{en:'Too many logins today — try again tomorrow.',th:'มีคนล็อกอินเยอะเกินไปวันนี้ ลองใหม่พรุ่งนี้นะคะ'},
    retryBtn:{en:'Show QR again',th:'แสดง QR อีกครั้ง'}
  };

  var state = { status:'idle', code:null, loginUrl:null, displayName:null, pictureUrl:null, uid:null, poll:null, modalOpen:false };
  var modal, modalBody;

  function tgStopPolling(){ if(state.poll){ clearInterval(state.poll); state.poll = null; } }

  function buildModal(){
    if(modal) return;
    modal = document.createElement('div');
    modal.id = 'wlTgModal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="tglm-card">' +
        '<button type="button" class="tglm-close" data-tglm="close">&times;</button>' +
        '<div data-tglm="body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modalBody = modal.querySelector('[data-tglm="body"]');
    modal.querySelector('[data-tglm="close"]').addEventListener('click', closeModal);
    modal.addEventListener('click', function(ev){ if(ev.target === modal) closeModal(); });
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function openModal(){
    buildModal();
    state.modalOpen = true;
    modal.hidden = false;
    if(state.status === 'linked') paintModal();
    else startPending();
  }
  function closeModal(){ state.modalOpen = false; if(modal) modal.hidden = true; }

  function paintModal(){
    if(!modal || modal.hidden || !modalBody) return;
    if(state.status === 'linked'){
      var linkedAvatar = state.pictureUrl ? '<img src="' + esc(state.pictureUrl) + '" alt="" class="tglm-avatar">' : '';
      modalBody.innerHTML =
        linkedAvatar +
        '<div class="tglm-title">Telegram</div>' +
        '<div class="tglm-status ok">' + esc(tx(C.connectedNote)) +
          (state.displayName ? ' · ' + esc(state.displayName) : '') + '</div>';
      setTimeout(function(){ if(state.modalOpen) closeModal(); }, 1200);
    } else if(state.status === 'processing'){
      modalBody.innerHTML =
        '<div class="tglm-title">Telegram</div>' +
        '<div class="tglm-proc"><div class="tglm-proc-ring"></div>' +
          '<div class="tglm-proc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg></div>' +
        '</div>' +
        '<div class="tglm-status">' + esc(tx(C.processing)) + '</div>';
    } else if(!tgWorkerReady()){
      modalBody.innerHTML = '<div class="tglm-title">Telegram</div><div class="tglm-status err">' + esc(tx(C.notReady)) + '</div>';
    } else if(state.status === 'error' || state.status === 'expired' || state.status === 'quota' || state.status === 'not_configured'){
      var errMsg = state.status === 'expired' ? C.expired : (state.status === 'quota' ? C.quotaErr : C.err);
      modalBody.innerHTML =
        '<div class="tglm-title">Telegram</div>' +
        '<div class="tglm-status err">' + esc(tx(errMsg)) + '</div>' +
        (state.status === 'quota' || state.status === 'not_configured' ? '' :
          '<button type="button" class="tglm-retry" data-tglm="retry">' + esc(tx(C.retryBtn)) + '</button>');
      var retryBtn = modalBody.querySelector('[data-tglm="retry"]');
      if(retryBtn) retryBtn.addEventListener('click', startPending);
    } else if(state.loginUrl){
      modalBody.innerHTML =
        '<div class="tglm-title">' + esc(tx(C.title)) + '</div>' +
        '<div class="tglm-sub">' + esc(tx(C.sub)) + '</div>' +
        '<div class="tglm-qr-wrap"><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
          encodeURIComponent(state.loginUrl) + '" alt="QR"></div>' +
        '<div class="tglm-status"><span class="tglm-spin"></span>' + esc(tx(C.waiting)) + '</div>';
    } else {
      modalBody.innerHTML =
        '<div class="tglm-title">' + esc(tx(C.title)) + '</div>' +
        '<div class="tglm-status"><span class="tglm-spin"></span>' + esc(tx(C.waiting)) + '</div>';
    }
  }

  function startPending(){
    state.status = 'pending';
    state.code = null;
    state.loginUrl = null;
    if(!tgWorkerReady()){ notify(); paintModal(); return; }
    notify();
    paintModal();
    fetch(tgApi('/api/session/new?provider=telegram'))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.error){
          state.status = data.error === 'quota_exceeded' ? 'quota' : (data.error === 'not_configured' ? 'not_configured' : 'error');
          notify();
          paintModal();
          return;
        }
        state.code = data.code;
        state.loginUrl = data.loginUrl;
        notify();
        paintModal();
        tgStopPolling();
        state.poll = setInterval(pollStatus, 2500);
      })
      .catch(function(){ state.status = 'error'; notify(); paintModal(); });
  }

  function pollStatus(){
    if(!state.code) return;
    fetch(tgApi('/api/session/status?code=' + encodeURIComponent(state.code)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.error === 'quota_exceeded'){
          tgStopPolling();
          state.status = 'quota';
          notify();
          paintModal();
        } else if(data.status === 'linked'){
          tgStopPolling();
          state.displayName = data.displayName || '';
          state.status = 'processing';
          notify();
          paintModal();
          setTimeout(fetchData, 650);
        } else if(data.status === 'not_found'){
          tgStopPolling();
          state.status = 'expired';
          notify();
          paintModal();
        }
      })
      .catch(function(){ /* transient network hiccup -- just try again next tick */ });
  }

  function notify(){ try { document.dispatchEvent(new CustomEvent('spz:tg')); } catch(e){} }

  function fetchData(){
    fetch(tgApi('/api/session/data?code=' + encodeURIComponent(state.code)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && data.error === 'quota_exceeded'){
          state.status = 'quota';
          notify();
          paintModal();
          return;
        }
        state.status = 'linked';
        state.displayName = data.displayName || state.displayName;
        state.pictureUrl = data.pictureUrl || state.pictureUrl;
        state.uid = data.uid || state.uid || null;
        tgSaveSession();
        notify();
        paintModal();
      })
      .catch(function(){ state.status = 'error'; notify(); paintModal(); });
  }

  function restoreFromWorker(saved){
    state.code = saved.code;
    state.displayName = saved.displayName;
    state.pictureUrl = saved.pictureUrl || null;
    fetch(tgApi('/api/session/status?code=' + encodeURIComponent(saved.code)))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data.status === 'linked'){
          fetch(tgApi('/api/session/data?code=' + encodeURIComponent(saved.code)))
            .then(function(r){ return r.json(); })
            .then(function(dd){
              state.status = 'linked';
              state.displayName = dd.displayName || state.displayName;
              state.pictureUrl = dd.pictureUrl || state.pictureUrl;
              state.uid = dd.uid || state.uid || null;
              notify();
            })
            .catch(function(){});
        } else {
          tgClearSession();
          state = { status:'idle', code:null, loginUrl:null, displayName:null, pictureUrl:null, uid:null, poll:null, modalOpen:false };
          notify();
        }
      })
      .catch(function(){ /* worker unreachable -- keep whatever we had locally, retry next reload */ });
  }

  function logout(){
    var code = state.code;
    tgStopPolling();
    tgClearSession();
    state = { status:'idle', code:null, loginUrl:null, displayName:null, pictureUrl:null, uid:null, poll:null, modalOpen:false };
    closeModal();
    notify();
    if(code && tgWorkerReady()){
      fetch(tgApi('/api/session/logout'), {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code: code })
      }).catch(function(){});
    }
  }

  if(tgWorkerReady()){
    var saved = tgLoadSession();
    if(saved && saved.code) restoreFromWorker(saved);
  }

  window.__SPZ_TG = {
    open: function(){ openModal(); },
    state: function(){
      return { status: state.status, displayName: state.displayName || null,
        pictureUrl: state.pictureUrl || null, uid: state.uid || null };
    },
    /* Round S: the Watchlist page (part-39.js) reads this to drive the SAME
       generic per-session Worker endpoints (/api/session/watchlist/*, /api/
       session/data, ...) LINE already uses, under a Telegram-linked visitor's
       own session code -- see resolveActiveIdentity() there. Never used to
       mutate this module's own state from outside. */
    code: function(){ return state.status === 'linked' ? state.code : null; },
    logout: function(){ logout(); }
  };
})();
