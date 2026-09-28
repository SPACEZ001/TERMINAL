
(function(){
  'use strict';

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';
  var CLOUDINARY_CONFIG = { cloudName: "lyldfvir", uploadPreset: "uheaqpmw" };

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var UI = {
    eb:{en:'Admin Only',th:'เฉพาะแอดมิน'},
    h:{en:'Announcements',th:'ประกาศ'},
    lede:{en:'Post a short notice that shows up in the header bar and inside the "what would your portfolio look like" popup, with an optional copy sent to your LINE Official Account.',
          th:'โพสต์ประกาศสั้นๆ ที่จะขึ้นทั้งบนแถบด้านบนของเว็บ และในป๊อปอัป "พอร์ตของคุณจะเป็นยังไง" พร้อมเลือกส่งสำเนาไปที่ LINE Official Account ได้ด้วย'},
    keyLede:{en:'This page uses the same admin key as Connected Users — already entered it there this tab? It works here too.',
             th:'หน้านี้ใช้รหัสแอดมินตัวเดียวกับหน้าผู้ใช้ที่เชื่อมต่อ LINE — ถ้าใส่ไว้แล้วในแท็บนี้ ใช้ต่อได้เลย'},
    keyPh:{en:'Admin users key',th:'รหัสแอดมินสำหรับหน้านี้'},
    keySubmit:{en:'Unlock',th:'ปลดล็อก'},
    keyErrBad:{en:'Incorrect key — try again.',th:'รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง'},
    keyErrNet:{en:'Could not reach the server — try again.',th:'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง'},
    adminOnly:{en:'This page is only available to the site admin.',th:'หน้านี้ใช้ได้เฉพาะแอดมินของเว็บไซต์เท่านั้น'},

    formTitleNew:{en:'New announcement',th:'ประกาศใหม่'},
    formTitleEdit:{en:'Edit announcement',th:'แก้ไขประกาศ'},
    textLabel:{en:'Message',th:'ข้อความ'},
    textPh:{en:'What do you want visitors to see?',th:'อยากให้ผู้เข้าชมเห็นข้อความว่าอะไร?'},
    imageLabel:{en:'Image (optional)',th:'รูปภาพ (ไม่บังคับ)'},
    durationLabel:{en:'Show for',th:'แสดงเป็นเวลา'},
    modeLabel:{en:'Show as',th:'แสดงแบบ'},
    modeBar:{en:'Bar under the header',th:'แถบใต้เมนูด้านบน'},
    modeModal:{en:'Popup in the center of the screen',th:'ป๊อบอัพกลางจอ'},
    modeBadgeBar:{en:'Bar',th:'แถบบน'},
    modeBadgeModal:{en:'Popup',th:'ป๊อบอัพ'},
    uploading:{en:'Uploading…',th:'กำลังอัปโหลด…'},
    sendLineLabel:{en:'Also send as a LINE broadcast to your Official Account friends',th:'ส่งเป็นข้อความ LINE Official Account ไปหาเพื่อนด้วย'},
    postBtn:{en:'Post announcement',th:'โพสต์ประกาศ'},
    saveBtn:{en:'Save changes',th:'บันทึกการแก้ไข'},
    cancelBtn:{en:'Cancel',th:'ยกเลิก'},
    saving:{en:'Saving…',th:'กำลังบันทึก…'},
    savedOk:{en:'Posted.',th:'โพสต์แล้ว'},
    savedOkLine:{en:'Posted, and sent to LINE.',th:'โพสต์แล้ว และส่งเข้า LINE เรียบร้อย'},
    savedOkLineErr:{en:'Posted, but the LINE broadcast failed — try resending it from here later.',th:'โพสต์แล้ว แต่ส่งเข้า LINE ไม่สำเร็จ — ลองกดส่งใหม่ทีหลังได้'},
    saveErr:{en:'Could not save — try again.',th:'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'},
    needText:{en:'Write a message first.',th:'กรอกข้อความก่อน'},

    durForever:{en:'Until I delete it',th:'จนกว่าจะลบเอง'},
    dur30:{en:'30 minutes',th:'30 นาที'},
    dur60:{en:'1 hour',th:'1 ชั่วโมง'},
    dur360:{en:'6 hours',th:'6 ชั่วโมง'},
    dur1440:{en:'24 hours',th:'24 ชั่วโมง'},
    dur4320:{en:'3 days',th:'3 วัน'},
    dur10080:{en:'7 days',th:'7 วัน'},

    listH:{en:'Posted announcements',th:'ประกาศที่โพสต์ไว้'},
    loading:{en:'Loading…',th:'กำลังโหลด…'},
    empty:{en:'No announcements yet — post your first one above.',th:'ยังไม่มีประกาศ — โพสต์อันแรกได้ด้านบนเลย'},
    statusActive:{en:'Active',th:'กำลังแสดง'},
    statusExpired:{en:'Expired',th:'หมดอายุแล้ว'},
    postedAt:{en:'Posted {d}',th:'โพสต์เมื่อ {d}'},
    untilD:{en:'until {d}',th:'ถึง {d}'},
    editBtn:{en:'Edit',th:'แก้ไข'},
    deleteBtn:{en:'Delete',th:'ลบ'},
    resendLineBtn:{en:'Send to LINE',th:'ส่งเข้า LINE'},
    deleteConfirm:{en:'Delete this announcement?',th:'ลบประกาศนี้ใช่ไหม?'}
  };

  var DURATIONS = [
    { min:30, key:'dur30' }, { min:60, key:'dur60' }, { min:360, key:'dur360' },
    { min:1440, key:'dur1440' }, { min:4320, key:'dur4320' }, { min:10080, key:'dur10080' },
    { min:0, key:'durForever' }
  ];
  var TEXT_MAX = 2000; // raised from 500 per her request -- some notices run long

  var sec = null;
  var items = null;          // loaded list, or null if not loaded yet
  var loadError = null;      // null | 'bad' | 'net'
  var loading = false;

  // ---- create/edit form state ----
  var editingId = null;      // null = creating a new one
  var draftText = '';
  var draftImageUrl = '';
  var draftDurationMin = 1440; // default: 24 hours
  var draftDisplayMode = 'bar'; // 'bar' (header strip) | 'modal' (center popup)
  var draftSendLine = false;
  var uploading = false;
  var saving = false;
  var saveStatus = null;     // null | 'ok' | 'err'
  var saveStatusText = '';

  function getAdminKey(){
    try { return sessionStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; }
  }
  function setAdminKey(k){
    try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){}
  }
  function clearAdminKey(){
    try { sessionStorage.removeItem(ADMIN_KEY_STORAGE); } catch(e){}
  }

  function fmtDate(ms){
    if(!ms) return '';
    try { return new Date(ms).toLocaleString(L() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch(e){ return ''; }
  }

  function fetchItems(){
    var key = getAdminKey();
    if(!key) return;
    loading = true; loadError = null; paint();
    fetch(WORKER_BASE + '/api/admin/announcements', { headers:{ 'X-Admin-Key': key } })
      .then(function(r){
        if(r.status === 401){ clearAdminKey(); loadError = 'bad'; items = null; loading = false; paint(); return null; }
        if(!r.ok) throw new Error('bad_status');
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        items = data.items || [];
        loading = false;
        paint();
      })
      .catch(function(){ loadError = 'net'; loading = false; paint(); });
  }

  function cloudinaryUpload(file){
    var fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    return fetch('https://api.cloudinary.com/v1_1/' + CLOUDINARY_CONFIG.cloudName + '/image/upload', { method:'POST', body: fd })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!data || !data.secure_url) throw new Error((data && data.error && data.error.message) || 'upload failed');
        return data.secure_url;
      });
  }

  function resetDraft(){
    editingId = null;
    draftText = '';
    draftImageUrl = '';
    draftDurationMin = 1440;
    draftDisplayMode = 'bar';
    draftSendLine = false;
    saveStatus = null; saveStatusText = '';
  }

  function startEdit(item){
    editingId = item.id;
    draftText = item.text || '';
    draftImageUrl = item.imageUrl || '';
    // nearest preset at or above however long is left, defaulting to forever
    var remainingMin = item.expiresAt ? Math.max(1, Math.round((item.expiresAt - Date.now()) / 60000)) : 0;
    var match = DURATIONS.find(function(d){ return d.min === 0 ? remainingMin === 0 : remainingMin <= d.min; });
    draftDurationMin = match ? match.min : 0;
    draftDisplayMode = item.displayMode === 'modal' ? 'modal' : 'bar';
    draftSendLine = false;
    saveStatus = null; saveStatusText = '';
    var body = sec && sec.querySelector('[data-an="body"]');
    if(body) body.scrollIntoView({ behavior:'smooth', block:'start' });
    renderAll();
  }

  function sendLineBroadcast(text, imageUrl){
    var key = getAdminKey();
    return fetch(WORKER_BASE + '/api/admin/broadcast', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-Admin-Key': key },
      body: JSON.stringify({ text: text, imageUrl: imageUrl || '' })
    }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, data: d }; }); })
      .then(function(res){ return !!(res.ok && res.data && res.data.ok); })
      .catch(function(){ return false; });
  }

  function submitForm(){
    var text = draftText.trim();
    if(!text){ saveStatus = 'err'; saveStatusText = T(UI.needText); renderAll(); return; }
    saving = true; saveStatus = null; renderAll();
    var payload = { text: text, imageUrl: draftImageUrl, durationMin: draftDurationMin || null, displayMode: draftDisplayMode };
    var url = editingId ? '/api/admin/announcements/update' : '/api/admin/announcements/create';
    if(editingId) payload.id = editingId;
    var key = getAdminKey();
    fetch(WORKER_BASE + url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-Admin-Key': key },
      body: JSON.stringify(payload)
    }).then(function(r){
      if(r.status === 401){ clearAdminKey(); throw new Error('unauthorized'); }
      if(!r.ok) throw new Error('bad_status');
      return r.json();
    }).then(function(data){
      saving = false;
      if(!data || !data.ok){ saveStatus = 'err'; saveStatusText = T(UI.saveErr); renderAll(); return; }
      var wantLine = draftSendLine;
      var wasEditing = !!editingId;
      resetDraft();
      fetchItems();
      if(!wantLine){
        saveStatus = 'ok'; saveStatusText = T(UI.savedOk); renderAll();
        return;
      }
      sendLineBroadcast(data.item.text, data.item.imageUrl).then(function(ok){
        saveStatus = 'ok';
        saveStatusText = T(ok ? UI.savedOkLine : UI.savedOkLineErr);
        renderAll();
      });
    }).catch(function(){
      saving = false; saveStatus = 'err'; saveStatusText = T(UI.saveErr); renderAll();
    });
  }

  function deleteItem(id){
    if(!window.confirm(T(UI.deleteConfirm))) return;
    var key = getAdminKey();
    fetch(WORKER_BASE + '/api/admin/announcements/delete', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-Admin-Key': key },
      body: JSON.stringify({ id: id })
    }).then(function(){ fetchItems(); }).catch(function(){});
  }

  function resendLine(item){
    sendLineBroadcast(item.text, item.imageUrl);
  }

  function keyGateHTML(){
    return '<div class="an-keygate">' +
      '<div class="an-keygate-icon">🔑</div>' +
      '<p class="an-keygate-lede">' + esc(T(UI.keyLede)) + '</p>' +
      '<input type="password" class="an-key-input" data-an="keyInput" autocomplete="off" spellcheck="false" placeholder="' + esc(T(UI.keyPh)) + '">' +
      '<button type="button" class="an-key-btn" data-an="keySubmit">' + esc(T(UI.keySubmit)) + '</button>' +
      (loadError ? '<div class="an-key-err">' + esc(T(loadError === 'bad' ? UI.keyErrBad : UI.keyErrNet)) + '</div>' : '') +
    '</div>';
  }

  function durationOptionsHTML(){
    return DURATIONS.map(function(d){
      return '<option value="' + d.min + '"' + (draftDurationMin === d.min ? ' selected' : '') + '>' + esc(T(UI[d.key])) + '</option>';
    }).join('');
  }

  function imgPickHTML(){
    if(uploading) return '<span class="an-uploading">' + esc(T(UI.uploading)) + '</span>';
    if(draftImageUrl){
      return '<div class="an-img-preview"><img src="' + esc(draftImageUrl) + '" alt="">' +
        '<button type="button" class="an-img-remove" data-an="imgRemove" aria-label="remove">&times;</button></div>';
    }
    return '<input type="file" accept="image/*" data-an="imgFile">';
  }

  function modeOptionsHTML(){
    return ['bar', 'modal'].map(function(m){
      var lbl = m === 'modal' ? UI.modeModal : UI.modeBar;
      return '<label class="an-mode-opt"><input type="radio" name="anMode" value="' + m + '"' + (draftDisplayMode === m ? ' checked' : '') + '> ' + esc(T(lbl)) + '</label>';
    }).join('');
  }

  function formHTML(){
    return '<div class="an-form" data-an="form">' +
      '<div class="an-form-title">' + esc(T(editingId ? UI.formTitleEdit : UI.formTitleNew)) + '</div>' +
      '<div class="an-field">' +
        '<label>' + esc(T(UI.textLabel)) + '</label>' +
        '<textarea class="an-textarea" data-an="textInput" maxlength="' + TEXT_MAX + '" placeholder="' + esc(T(UI.textPh)) + '">' + esc(draftText) + '</textarea>' +
        '<div class="an-charcount">' + draftText.length + ' / ' + TEXT_MAX + '</div>' +
      '</div>' +
      '<div class="an-field">' +
        '<label>' + esc(T(UI.modeLabel)) + '</label>' +
        '<div class="an-mode-pick" data-an="modePick">' + modeOptionsHTML() + '</div>' +
      '</div>' +
      '<div class="an-row">' +
        '<div class="an-field">' +
          '<label>' + esc(T(UI.imageLabel)) + '</label>' +
          '<div class="an-imgpick" data-an="imgPick">' + imgPickHTML() + '</div>' +
        '</div>' +
        '<div class="an-field">' +
          '<label>' + esc(T(UI.durationLabel)) + '</label>' +
          '<select class="an-select" data-an="durationSelect">' + durationOptionsHTML() + '</select>' +
        '</div>' +
      '</div>' +
      '<label class="an-line-check"><input type="checkbox" data-an="sendLineCheck"' + (draftSendLine ? ' checked' : '') + '> ' + esc(T(UI.sendLineLabel)) + '</label>' +
      '<div class="an-form-actions">' +
        '<button type="button" class="an-submit-btn" data-an="submitBtn"' + (saving || uploading ? ' disabled' : '') + '>' +
          esc(saving ? T(UI.saving) : T(editingId ? UI.saveBtn : UI.postBtn)) +
        '</button>' +
        (editingId ? '<button type="button" class="an-cancel-btn" data-an="cancelBtn">' + esc(T(UI.cancelBtn)) + '</button>' : '') +
        (saveStatus ? '<span class="an-form-status ' + saveStatus + '">' + esc(saveStatusText) + '</span>' : '') +
      '</div>' +
    '</div>';
  }

  function cardHTML(item){
    var now = Date.now();
    var isActive = !item.expiresAt || item.expiresAt > now;
    var isModal = item.displayMode === 'modal';
    var statusHTML = '<span class="an-badge ' + (isActive ? 'active' : 'expired') + '">' + esc(T(isActive ? UI.statusActive : UI.statusExpired)) + '</span>';
    var modeHTML = '<span class="an-badge mode-' + (isModal ? 'modal' : 'bar') + '">' + esc(T(isModal ? UI.modeBadgeModal : UI.modeBadgeBar)) + '</span>';
    var postedHTML = '<span class="an-meta-posted">' + esc(T(UI.postedAt).replace('{d}', fmtDate(item.createdAt))) + '</span>';
    var expiryHTML = item.expiresAt ? '<span class="an-meta-until">' + esc(T(UI.untilD).replace('{d}', fmtDate(item.expiresAt))) + '</span>' : '';
    return '<div class="an-card' + (isActive ? '' : ' expired') + '" data-an-item="' + esc(item.id) + '">' +
      (item.imageUrl ? '<img class="an-card-thumb" src="' + esc(item.imageUrl) + '" alt="">' : '') +
      '<div class="an-card-body">' +
        '<div class="an-card-txt">' + esc(item.text) + '</div>' +
        '<div class="an-card-meta">' + statusHTML + modeHTML + postedHTML + expiryHTML + '</div>' +
        '<div class="an-card-actions">' +
          '<button type="button" class="an-card-btn" data-an-act="edit">' + esc(T(UI.editBtn)) + '</button>' +
          '<button type="button" class="an-card-btn" data-an-act="line">' + esc(T(UI.resendLineBtn)) + '</button>' +
          '<button type="button" class="an-card-btn danger" data-an-act="delete">' + esc(T(UI.deleteBtn)) + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function listHTML(){
    if(loading) return '<div class="an-loading">' + esc(T(UI.loading)) + '</div>';
    if(!items || !items.length) return '<div class="an-empty">' + esc(T(UI.empty)) + '</div>';
    return items.map(cardHTML).join('');
  }

  function bodyHTML(){
    if(window.__SPZ_TIER && window.__SPZ_TIER() !== 'full') return '<div class="an-empty">' + esc(T(UI.adminOnly)) + '</div>';
    if(!getAdminKey() || items === null){
      return loading ? '<div class="an-loading">' + esc(T(UI.loading)) + '</div>' : keyGateHTML();
    }
    return formHTML() + '<div class="an-list-h">' + esc(T(UI.listH)) + '</div>' + listHTML();
  }

  function submitKey(){
    var input = sec.querySelector('[data-an="keyInput"]');
    var key = input ? input.value.trim() : '';
    if(!key) return;
    setAdminKey(key);
    fetchItems();
  }

  function wireBody(){
    var keyInput = sec.querySelector('[data-an="keyInput"]');
    if(keyInput) keyInput.addEventListener('keydown', function(ev){ if(ev.key === 'Enter') submitKey(); });
    var keySubmit = sec.querySelector('[data-an="keySubmit"]');
    if(keySubmit) keySubmit.addEventListener('click', submitKey);

    var textInput = sec.querySelector('[data-an="textInput"]');
    if(textInput) textInput.addEventListener('input', function(ev){
      draftText = ev.target.value;
      var count = sec.querySelector('.an-charcount');
      if(count) count.textContent = draftText.length + ' / ' + TEXT_MAX;
    });

    var modeRadios = sec.querySelectorAll('input[name="anMode"]');
    Array.prototype.forEach.call(modeRadios, function(r){
      r.addEventListener('change', function(ev){ if(ev.target.checked) draftDisplayMode = ev.target.value; });
    });

    var fileInput = sec.querySelector('[data-an="imgFile"]');
    if(fileInput) fileInput.addEventListener('change', function(ev){
      var file = ev.target.files && ev.target.files[0];
      if(!file) return;
      uploading = true; renderAll();
      cloudinaryUpload(file).then(function(url){
        draftImageUrl = url; uploading = false; renderAll();
      }).catch(function(){ uploading = false; renderAll(); });
    });
    var imgRemove = sec.querySelector('[data-an="imgRemove"]');
    if(imgRemove) imgRemove.addEventListener('click', function(){ draftImageUrl = ''; renderAll(); });

    var durationSelect = sec.querySelector('[data-an="durationSelect"]');
    if(durationSelect) durationSelect.addEventListener('change', function(ev){ draftDurationMin = Number(ev.target.value) || 0; });

    var lineCheck = sec.querySelector('[data-an="sendLineCheck"]');
    if(lineCheck) lineCheck.addEventListener('change', function(ev){ draftSendLine = ev.target.checked; });

    var submitBtn = sec.querySelector('[data-an="submitBtn"]');
    if(submitBtn) submitBtn.addEventListener('click', submitForm);
    var cancelBtn = sec.querySelector('[data-an="cancelBtn"]');
    if(cancelBtn) cancelBtn.addEventListener('click', function(){ resetDraft(); renderAll(); });

    Array.prototype.forEach.call(sec.querySelectorAll('[data-an-item]'), function(card){
      var id = card.getAttribute('data-an-item');
      var item = (items || []).find(function(it){ return it.id === id; });
      if(!item) return;
      var editBtn = card.querySelector('[data-an-act="edit"]');
      if(editBtn) editBtn.addEventListener('click', function(){ startEdit(item); });
      var lineBtn = card.querySelector('[data-an-act="line"]');
      if(lineBtn) lineBtn.addEventListener('click', function(){ resendLine(item); });
      var delBtn = card.querySelector('[data-an-act="delete"]');
      if(delBtn) delBtn.addEventListener('click', function(){ deleteItem(id); });
    });
  }

  function renderAll(){
    var body = sec && sec.querySelector('[data-an="body"]');
    if(!body) return;
    body.innerHTML = bodyHTML();
    wireBody();
  }

  function paint(){
    if(!sec) return;
    var eb = sec.querySelector('[data-an="eb"]'), h = sec.querySelector('[data-an="h"]'), lede = sec.querySelector('[data-an="lede"]');
    if(eb) eb.textContent = T(UI.eb);
    if(h) h.textContent = T(UI.h);
    if(lede) lede.textContent = T(UI.lede);
    renderAll();
  }

  function build(){
    if(document.getElementById('announcements')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'announcements';
    sec.setAttribute('data-route', 'announcements');
    sec.innerHTML =
      '<div class="an-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-an="eb"></span></div>' +
          '<h2 data-an="h"></h2>' +
          '<p class="lede" data-an="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-an="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'announcements', feat:true, after:'connectedusers',
      t: UI.h,
      d:{en:'Post a notice to the header bar and the portfolio popup, with an optional LINE broadcast. Admin-only.',
         th:'โพสต์ประกาศขึ้นแถบด้านบนและป๊อปอัปพอร์ต พร้อมส่งเข้า LINE ได้ เฉพาะแอดมิน'}
    });

    paint();
    if(getAdminKey()) fetchItems();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){ if(build() || ++tries > 60) clearInterval(iv); }, 400);
    new MutationObserver(function(){ if(sec) paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
