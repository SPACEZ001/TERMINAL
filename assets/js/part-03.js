
(function(){
  'use strict';
  if (window.__SPZ_ANNOUNCE) return;
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var POLL_MS = 5 * 60 * 1000; // announcements are not second-by-second data
  var DISMISS_KEY = 'spz_announce_dismissed'; // sessionStorage: ids this visitor already closed
  var AUTOSHOWN_KEY = 'spz_announce_autoshown'; // sessionStorage: "center popup" ids already auto-opened once
  var items = [];

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var TXT = {
    lbl:{en:'Announcement',th:'ประกาศ'},
    count:{en:'{i} / {n}',th:'ที่ {i} / {n}'}
  };

  function getDismissed(){
    try { return (sessionStorage.getItem(DISMISS_KEY) || '').split(',').filter(Boolean); } catch(e){ return []; }
  }
  function isDismissedId(id){ return getDismissed().indexOf(id) !== -1; }
  function markDismissed(id){
    try {
      var d = getDismissed();
      if(d.indexOf(id) === -1){ d.push(id); sessionStorage.setItem(DISMISS_KEY, d.join(',')); }
    } catch(e){}
  }
  function getAutoshown(){
    try { return (sessionStorage.getItem(AUTOSHOWN_KEY) || '').split(',').filter(Boolean); } catch(e){ return []; }
  }
  function isAutoshownId(id){ return getAutoshown().indexOf(id) !== -1; }
  function markAutoshown(id){
    try {
      var d = getAutoshown();
      if(d.indexOf(id) === -1){ d.push(id); sessionStorage.setItem(AUTOSHOWN_KEY, d.join(',')); }
    } catch(e){}
  }
  function activeList(){ return items.filter(function(a){ return !isDismissedId(a.id); }); }
  // Round O: per-announcement "show as" choice -- 'bar' (default, the strip
  // under the ticker) or 'modal' (an immediate center-screen popup, no click
  // needed). Mutually exclusive on the main site; the K11 portfolio-popup
  // overlay is a separate surface and ignores this entirely, per her ask to
  // leave it exactly as it already behaves.
  function isModalMode(a){ return a.displayMode === 'modal'; }
  function barModeActive(){ return activeList().filter(function(a){ return !isModalMode(a); }); }
  function modalModeActive(){ return activeList().filter(isModalMode); }

  function fetchList(){
    fetch(WORKER_BASE + '/api/announcements').then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if(!data) return;
        items = data.items || [];
        document.dispatchEvent(new CustomEvent('spz:announce'));
      })
      .catch(function(){});
  }

  window.__SPZ_ANNOUNCE = {
    list: function(){ return items.slice(); },
    active: activeList,
    latest: function(){ var a = activeList(); return a.length ? a[0] : null; },
    dismiss: function(id){ markDismissed(id); document.dispatchEvent(new CustomEvent('spz:announce')); }
  };

  /* ---- Round O: shared full-text popup -- opened by clicking the header
     strip (browsing every currently active "bar" announcement), or fired on
     its own for any "center popup" announcement the instant it becomes
     active/undismissed (once per id per session, tracked separately from
     dismissal so re-opening the popup later via a click doesn't re-trigger
     it). Supports more than one item at once with prev/next + an "i / n"
     counter, so multiple simultaneous announcements are never silently
     hidden behind just the first one. ---- */
  var modalEl = null, modalCountEl = null, modalTxtEl = null, modalImgWrap = null, modalNavEl = null, modalDotsEl = null;
  var modalList = [], modalIdx = 0;

  function ensureModal(){
    if(modalEl) return;
    modalEl = document.createElement('div');
    modalEl.className = 'spz-ann-modal';
    modalEl.hidden = true;
    modalEl.innerHTML =
      '<div class="spz-ann-modal-backdrop" data-annm="backdrop"></div>' +
      '<div class="spz-ann-modal-card">' +
        '<div class="spz-ann-modal-head">' +
          '<span class="spz-ann-modal-ico">📣</span>' +
          '<span class="spz-ann-modal-count" data-annm="count"></span>' +
          '<button type="button" class="spz-ann-modal-close" data-annm="close" aria-label="close">&times;</button>' +
        '</div>' +
        '<div data-annm="imgwrap"></div>' +
        '<div class="spz-ann-modal-txt" data-annm="txt"></div>' +
        '<div class="spz-ann-modal-nav" data-annm="nav" hidden>' +
          '<button type="button" class="spz-ann-modal-navbtn" data-annm="prev" aria-label="previous">&lsaquo;</button>' +
          '<span class="spz-ann-modal-dots" data-annm="dots"></span>' +
          '<button type="button" class="spz-ann-modal-navbtn" data-annm="next" aria-label="next">&rsaquo;</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    modalCountEl = modalEl.querySelector('[data-annm="count"]');
    modalTxtEl = modalEl.querySelector('[data-annm="txt"]');
    modalImgWrap = modalEl.querySelector('[data-annm="imgwrap"]');
    modalNavEl = modalEl.querySelector('[data-annm="nav"]');
    modalDotsEl = modalEl.querySelector('[data-annm="dots"]');
    modalEl.querySelector('[data-annm="backdrop"]').addEventListener('click', closeModal);
    modalEl.querySelector('[data-annm="close"]').addEventListener('click', function(){
      var cur = modalList[modalIdx];
      if(cur) window.__SPZ_ANNOUNCE.dismiss(cur.id);
      modalList.splice(modalIdx, 1);
      if(!modalList.length){ closeModal(); return; }
      if(modalIdx >= modalList.length) modalIdx = modalList.length - 1;
      renderModalCurrent();
    });
    modalEl.querySelector('[data-annm="prev"]').addEventListener('click', function(){ navModal(-1); });
    modalEl.querySelector('[data-annm="next"]').addEventListener('click', function(){ navModal(1); });
    document.addEventListener('keydown', function(ev){
      if(modalEl.hidden) return;
      if(ev.key === 'Escape') closeModal();
      else if(ev.key === 'ArrowLeft') navModal(-1);
      else if(ev.key === 'ArrowRight') navModal(1);
    });
  }
  function navModal(delta){
    if(modalList.length < 2) return;
    modalIdx = (modalIdx + delta + modalList.length) % modalList.length;
    renderModalCurrent();
  }
  function renderModalCurrent(){
    var a = modalList[modalIdx];
    if(!a){ closeModal(); return; }
    modalTxtEl.textContent = a.text;
    modalImgWrap.innerHTML = a.imageUrl ? '<img class="spz-ann-modal-img" src="' + esc(a.imageUrl) + '" alt="">' : '';
    var n = modalList.length;
    modalCountEl.textContent = T(TXT.lbl) + (n > 1 ? ' ' + T(TXT.count).replace('{i}', modalIdx + 1).replace('{n}', n) : '');
    modalNavEl.hidden = n < 2;
    if(n > 1){
      modalDotsEl.innerHTML = modalList.map(function(_, i){ return '<span class="spz-ann-modal-dot' + (i === modalIdx ? ' active' : '') + '"></span>'; }).join('');
    }
  }
  function openModalWith(list, startIdx){
    if(!list || !list.length) return;
    ensureModal();
    modalList = list.slice();
    modalIdx = startIdx || 0;
    renderModalCurrent();
    modalEl.hidden = false;
    // eslint-disable-next-line no-unused-expressions
    modalEl.offsetHeight; // force reflow so the .open transition actually animates in
    modalEl.classList.add('open');
  }
  function closeModal(){
    if(!modalEl) return;
    modalEl.classList.remove('open');
    setTimeout(function(){ if(modalEl) modalEl.hidden = true; }, 220);
  }

  function maybeAutoShowModal(){
    var due = modalModeActive().filter(function(a){ return !isAutoshownId(a.id); });
    if(!due.length) return;
    due.forEach(function(a){ markAutoshown(a.id); });
    openModalWith(due, 0);
  }

  /* ---- header strip wiring ---- */
  var barEl = null, txtEl = null, countEl = null, closeEl = null;
  function paintBar(){
    if(!barEl){
      barEl = document.getElementById('spzAnnounceBar');
      if(!barEl) return;
      txtEl = document.getElementById('spzAnnounceTxt');
      countEl = document.getElementById('spzAnnounceCount');
      closeEl = document.getElementById('spzAnnounceClose');
      closeEl.addEventListener('click', function(ev){
        ev.stopPropagation();
        var list = barModeActive();
        if(list.length) window.__SPZ_ANNOUNCE.dismiss(list[0].id);
      });
      barEl.addEventListener('click', function(){
        openModalWith(barModeActive(), 0);
      });
    }
    var list = barModeActive();
    if(!list.length){ barEl.hidden = true; return; }
    var a = list[0];
    txtEl.textContent = a.text;
    barEl.title = a.text;
    if(list.length > 1){
      countEl.textContent = list.length + ' 📣';
      countEl.hidden = false;
    } else {
      countEl.hidden = true;
    }
    barEl.hidden = false;
  }
  document.addEventListener('spz:announce', function(){ paintBar(); maybeAutoShowModal(); });
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ paintBar(); maybeAutoShowModal(); });
  } else {
    paintBar();
    maybeAutoShowModal();
  }

  fetchList();
  setInterval(fetchList, POLL_MS);
})();
