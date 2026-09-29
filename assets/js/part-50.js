
(function(){
  'use strict';

  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* Round T: the Worker's users:index has always held both LINE userIds and
     "tg:<chatId>" Telegram ones (upsertProfileOnLogin never cared which),
     this page just never said so -- everything below assumed LINE. A
     userId's own shape is enough to tell them apart, no Worker change
     needed. */
  function providerOf(userId){ return (userId || '').indexOf('tg:') === 0 ? 'telegram' : 'line'; }
  function providerLabel(userId){ return T(providerOf(userId) === 'telegram' ? UI.providerTelegram : UI.providerLine); }
  function providerBadgeHTML(u){
    var p = providerOf(u.userId);
    return '<span class="cu-provider ' + p + '">' + esc(providerLabel(u.userId)) + '</span>';
  }
  function cuLinkedSinceHTML(u){
    if(!u.linkedAt) return '';
    return '<div class="cu-linked-since">' +
      esc(T(UI.cuLinkedSince).replace('{p}', providerLabel(u.userId)).replace('{d}', fmtDateFromEpoch(u.linkedAt))) +
    '</div>';
  }

  var UI = {
    eb:{en:'Admin Only',th:'เฉพาะแอดมิน'},
    h:{en:'Connected Users',th:'ผู้ใช้ที่เชื่อมต่อ'},
    lede:{en:'Everyone who has linked LINE or Telegram — their photo, holdings, and account status, each tagged with the login they used. Members and linked visitors never see this page.',
          th:'รายชื่อทุกคนที่เชื่อมต่อ LINE หรือ Telegram ไว้กับเว็บ — รูป หุ้นที่ถือ และสถานะบัญชี พร้อมป้ายบอกว่าล็อกอินผ่านช่องทางไหน เมมเบอร์และผู้ที่ล็อกอินไว้แล้วจะมองไม่เห็นหน้านี้'},
    keyLede:{en:'This page needs its own admin key, separate from your site password, so nobody can pull this list by calling the backend directly.',
             th:'หน้านี้ต้องใช้รหัสแอดมินเฉพาะของมันเอง แยกจากรหัสผ่านเว็บไซต์ เพื่อไม่ให้ใครดึงรายชื่อนี้ได้โดยตรงจาก backend'},
    keyPh:{en:'Admin users key',th:'รหัสแอดมินสำหรับหน้านี้'},
    keySubmit:{en:'Unlock',th:'ปลดล็อก'},
    keyErrBad:{en:'Incorrect key — try again.',th:'รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง'},
    keyErrNet:{en:'Could not reach the server — try again.',th:'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง'},
    searchPh:{en:'Search by name, UID or ticker…',th:'ค้นหาชื่อ, UID หรือหุ้น…'},
    filterAll:{en:'All',th:'ทั้งหมด'},
    filterActive:{en:'Access active',th:'มีสิทธิ์ใช้งาน'},
    filterExpired:{en:'No active access',th:'ไม่มีสิทธิ์ใช้งานตอนนี้'},
    filterRightsAll:{en:'All tiers',th:'ทุกระดับ'},
    filterRightsNone:{en:'No tier (free)',th:'ยังไม่มีระดับ (ฟรี)'},
    count:{en:'{n} connected',th:'เชื่อมต่อแล้ว {n} คน'},
    viewGrid:{en:'Grid',th:'ตาราง'},
    viewList:{en:'List',th:'รายชื่อ'},
    noHoldings:{en:'No holdings yet',th:'ยังไม่มีหุ้นในลิสต์'},
    holdingsHeader:{en:'Holdings & risk read',th:'หุ้นที่ถือ & มุมมองความเสี่ยง'},
    statusActive:{en:'Access until {d}',th:'มีสิทธิ์ถึง {d}'},
    statusNone:{en:'No access set',th:'ยังไม่ได้ให้สิทธิ์'},
    statusExpired:{en:'Expired {d}',th:'หมดอายุ {d}'},
    cuLinkedSince:{en:'Linked via {p} since {d}',th:'เชื่อมต่อผ่าน {p} ตั้งแต่ {d}'},
    providerLine:{en:'LINE',th:'LINE'},
    providerTelegram:{en:'Telegram',th:'Telegram'},
    uidLabel:{en:'UID',th:'UID'},
    accessLabel:{en:'Access status',th:'สถานะสิทธิ์การใช้งาน'},
    rightsLabel:{en:'Membership tier (badge only, for now)',th:'ระดับสมาชิก (เป็นป้ายชื่อเฉยๆ ตอนนี้)'},
    rightsNone:{en:'None (free)',th:'ไม่มี (ฟรี)'},
    pkgLabel:{en:'Package (matches the site’s pricing page)',th:'แพ็กเกจ (ตรงกับหน้าราคาสมาชิกบนเว็บ)'},
    pkgNone:{en:'— Pick a package (or set tier/days manually below) —',th:'— เลือกแพ็กเกจ (หรือกำหนดระดับ/จำนวนวันเองด้านล่าง) —'},
    pkgAppliedHint:{en:'Applied {days} days for {name} — adjust the days below to add bonus days.',
                    th:'ใส่ให้ {days} วันตามแพ็ก {name} แล้ว — แก้ไขจำนวนวันด้านล่างได้ถ้าจะเพิ่มวันพิเศษ'},
    accessDaysLabel:{en:'Grant access starting today',th:'ให้สิทธิ์เริ่มจากวันนี้'},
    daysSuffix:{en:'days',th:'วัน'},
    clearAccessBtn:{en:'Clear access',th:'ล้างสิทธิ์'},
    daysSummaryKeep:{en:'No change — currently: {d}',th:'ไม่เปลี่ยนแปลง — ตอนนี้: {d}'},
    daysSummaryClear:{en:'Access will be cleared entirely.',th:'จะล้างสิทธิ์การใช้งานทั้งหมด'},
    daysSummarySet:{en:'{n} days from today → access until {d}',th:'{n} วันนับจากวันนี้ → มีสิทธิ์ถึง {d}'},
    editBtn:{en:'Edit',th:'แก้ไข'},
    reviewBtn:{en:'Review changes',th:'ตรวจสอบก่อนบันทึก'},
    cancelBtn:{en:'Cancel',th:'ยกเลิก'},
    backBtn:{en:'Back',th:'ย้อนกลับ'},
    confirmTitle:{en:'Confirm these changes?',th:'ยืนยันการเปลี่ยนแปลงนี้ใช่ไหม?'},
    confirmUidRow:{en:'UID → {v}',th:'UID → {v}'},
    confirmRightsRow:{en:'Tier badge → {v}',th:'ป้ายระดับ → {v}'},
    confirmAccessClearRow:{en:'Access will be cleared',th:'จะล้างสิทธิ์การใช้งาน'},
    confirmAccessSetRow:{en:'Access → {n} days from today (until {d})',th:'สิทธิ์ → {n} วันนับจากวันนี้ (ถึง {d})'},
    confirmNoChange:{en:'No fields were changed.',th:'ยังไม่มีการเปลี่ยนแปลงใดๆ'},
    confirmSaveBtn:{en:'Confirm & Save',th:'ยืนยัน & บันทึก'},
    saving:{en:'Saving…',th:'กำลังบันทึก…'},
    saveBtn:{en:'Save',th:'บันทึก'},
    saveOk:{en:'Saved',th:'บันทึกแล้ว'},
    saveErrTaken:{en:'That UID is already used',th:'UID นี้มีคนใช้แล้ว'},
    saveErrBad:{en:'Could not save — try again.',th:'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'},
    loading:{en:'Loading…',th:'กำลังโหลด…'},
    empty:{en:'Nobody has linked LINE or Telegram yet.',th:'ยังไม่มีใครเชื่อมต่อ LINE หรือ Telegram'},
    noMatch:{en:'No one matches that search.',th:'ไม่พบผลลัพธ์ที่ตรงกับการค้นหา'},
    adminOnly:{en:'This page is only available to the site admin.',th:'หน้านี้ใช้ได้เฉพาะแอดมินของเว็บไซต์เท่านั้น'},

    /* Round K8: "how much traffic am I getting right now" gauge -- counts
       every visitor whose presence beacon (any page, not just this one --
       see the site-wide script near the end of the document) is still
       live in the last ~90 seconds. Deliberately just a number, not a
       list, so it stays a quick traffic gauge instead of turning into a
       second, less complete Connected Users list. */
    presenceLabel:{en:'{n} on the site right now',th:'ตอนนี้มีคนอยู่ในเว็บ {n} คน'},
    presenceOne:{en:'1 on the site right now',th:'ตอนนี้มีคนอยู่ในเว็บ 1 คน'},
    presenceErr:{en:'Could not load',th:'โหลดไม่สำเร็จ'}
  };

  /* Decorative-only membership badge, matching this site's own #membership
     pricing page (see TIERS/theme colors there): --msv silver (member),
     --mbz bronze (pass), red (ultra), --mgd gold (cryptolab), --mv purple
     (stocklab), the Academy flagship white/gold, and one extra tier that
     page doesn't have -- "admin", modeled on the Academy flagship look but
     in a distinct cyan/white so it never reads as a real Academy badge.
     Per her explicit instruction this grants no actual access yet -- it is
     purely a label/frame on the card, assigned by hand below. */
  var RIGHTS_ORDER = ['member','pass','ultra','cryptolab','stocklab','academy','admin'];
  var RIGHTS_META = {
    member:    { label:{en:'Member',th:'เมมเบอร์'},          color:'#aab6c2' },
    pass:      { label:{en:'Pass',th:'พาส'},                  color:'#c17f45' },
    ultra:     { label:{en:'Ultra',th:'อัลตรา'},              color:'#ff5a72' },
    cryptolab: { label:{en:'Crypto Lab',th:'คริปโต แล็บ'},    color:'#f0b64e' },
    stocklab:  { label:{en:'Stock Lab',th:'สต็อก แล็บ'},      color:'#c96be0' },
    academy:   { label:{en:'Wave Academy',th:'เวฟ อคาเดมี'},  color:'#ffd98a', flagship:true },
    admin:     { label:{en:'Admin',th:'แอดมิน'},              color:'#38c6ff', flagship:true }
  };
  function rightsMeta(r){ return (r && RIGHTS_META[r]) || null; }
  function rightsBadgeHTML(r){
    var m = rightsMeta(r);
    if(!m) return '';
    return '<span class="cu-rights-badge' + (m.flagship ? ' flagship' : '') + '" style="color:' + m.color + ';border:1px solid ' + m.color + '55;background:' + m.color + '1f;">' + esc(T(m.label)) + '</span>';
  }
  /* Read-only exposure for other modules -- right now, the Home page/nav-menu
     personal LINE card wants the exact same tier color + badge + expiry-text
     treatment this page already established, rather than re-deriving it.
     accessState/fmtDate are declared further down in this module but are
     function declarations, so they're hoisted and safe to reference here. */
  window.__SPZ_RIGHTS = {
    meta: rightsMeta,
    badgeHTML: rightsBadgeHTML,
    accessState: function(u){ return accessState(u); },
    fmtDate: function(d){ return fmtDate(d); }
  };

  var sec = null;
  var users = null;        // loaded list, or null if not loaded yet
  var loadError = null;    // null | 'bad' | 'net'
  var searchQuery = '';
  var filterMode = 'all';
  var rightsFilterMode = 'all'; // 'all' | 'none' | one of RIGHTS_ORDER
  var loading = false;
  var VIEW_MODE_STORAGE = 'spz_cu_view_mode';
  function getViewMode(){
    try { var v = localStorage.getItem(VIEW_MODE_STORAGE); return v === 'list' ? 'list' : 'grid'; } catch(e){ return 'grid'; }
  }
  function setViewMode(v){
    try { localStorage.setItem(VIEW_MODE_STORAGE, v); } catch(e){}
  }
  var viewMode = getViewMode(); // 'grid' | 'list'

  // ---- Round K8: "people on the site right now" gauge (see the site-wide
  // presence beacon script near the end of the document, and the Worker's
  // /api/admin/presence-count) -- loaded and refreshed independently of
  // the user list itself, so a slow/failed user-list fetch never blocks it. ----
  var presenceCount = null;   // null until first loaded, else a number
  var presenceErr = false;
  var presencePoll = null;

  // ---- the click-in detail modal (view profile, holdings/risk, edit+confirm) ----
  var detailModal = null, detailModalBody = null;
  var detailUserId = null, detailEditing = false, detailConfirming = false, detailDraft = null;

  function fmtDate(d){
    if(!d) return '';
    try {
      var dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'numeric' });
    } catch(e){ return d; }
  }
  /* Round T (bugfix, found while testing the provider-badge change below):
     fmtDate() above is built for a "YYYY-MM-DD" access-date string --
     linkedAt is an epoch-ms timestamp (Date.now() at login), and feeding
     that through fmtDate(new Date(ms)) coerced the Date object to a string
     and back, always producing "Invalid Date". A real bug, not new. */
  function fmtDateFromEpoch(ms){
    if(!ms) return '';
    try {
      return new Date(ms).toLocaleDateString(L() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'numeric' });
    } catch(e){ return ''; }
  }

  /* "starting today, for N days" -- always measured from the moment Save is
     reviewed/confirmed, never from some earlier point, so the summary and
     the actual saved date always agree. */
  function computeDaysEndDate(days){
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function accessState(u){
    if(!u.accessUntil) return 'none';
    var today = new Date().toISOString().slice(0, 10);
    return u.accessUntil >= today ? 'active' : 'expired';
  }

  function getAdminKey(){
    try { return sessionStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; }
  }
  function setAdminKey(k){
    try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){}
  }
  function clearAdminKey(){
    try { sessionStorage.removeItem(ADMIN_KEY_STORAGE); } catch(e){}
  }

  function fetchUsers(){
    var key = getAdminKey();
    if(!key) return;
    loading = true; loadError = null; paint();
    fetch(WORKER_BASE + '/api/admin/users', { headers:{ 'X-Admin-Key': key } })
      .then(function(r){
        if(r.status === 401){ clearAdminKey(); loadError = 'bad'; users = null; loading = false; paint(); return null; }
        if(!r.ok) throw new Error('bad_status');
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        users = data.users || [];
        loading = false;
        paint();
      })
      .catch(function(){ loadError = 'net'; loading = false; paint(); });
  }

  function fetchPresenceCount(){
    var key = getAdminKey();
    if(!key) return;
    fetch(WORKER_BASE + '/api/admin/presence-count', { headers:{ 'X-Admin-Key': key } })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(data){
        presenceCount = (data && typeof data.count === 'number') ? data.count : 0;
        presenceErr = false;
        paintPresence();
      })
      .catch(function(){ presenceErr = true; paintPresence(); });
  }
  function presenceHTML(){
    if(!getAdminKey()) return '';
    if(presenceCount === null && !presenceErr) return '<span class="cu-presence-dot"></span>' + esc(T({en:'…',th:'…'}));
    if(presenceErr) return esc(T(UI.presenceErr));
    return '<span class="cu-presence-dot"></span>' + esc(presenceCount === 1 ? T(UI.presenceOne) : T(UI.presenceLabel).replace('{n}', presenceCount));
  }
  function paintPresence(){
    var el = sec && sec.querySelector('[data-cu="presence"]');
    if(el) el.innerHTML = presenceHTML();
  }

  function keyGateHTML(){
    return '<div class="cu-keygate">' +
      '<div class="cu-keygate-icon">🔑</div>' +
      '<p class="cu-keygate-lede">' + esc(T(UI.keyLede)) + '</p>' +
      '<input type="password" class="cu-key-input" data-cu="keyInput" autocomplete="off" spellcheck="false" placeholder="' + esc(T(UI.keyPh)) + '">' +
      '<button type="button" class="cu-key-btn" data-cu="keySubmit">' + esc(T(UI.keySubmit)) + '</button>' +
      (loadError ? '<div class="cu-key-err">' + esc(T(loadError === 'bad' ? UI.keyErrBad : UI.keyErrNet)) + '</div>' : '') +
    '</div>';
  }

  function userCardHTML(u){
    var avatar = u.pictureUrl
      ? '<img class="cu-avatar" src="' + esc(u.pictureUrl) + '" alt="">'
      : '<div class="cu-avatar-fallback">' + esc((u.displayName || '?').charAt(0).toUpperCase()) + '</div>';
    var state = accessState(u);
    var statusHTML = state === 'active'
      ? '<span class="cu-status active">' + esc(T(UI.statusActive).replace('{d}', fmtDate(u.accessUntil))) + '</span>'
      : state === 'expired'
        ? '<span class="cu-status expired">' + esc(T(UI.statusExpired).replace('{d}', fmtDate(u.accessUntil))) + '</span>'
        : '<span class="cu-status none">' + esc(T(UI.statusNone)) + '</span>';
    var holdingsHTML = u.tickers && u.tickers.length
      ? u.tickers.slice(0, 8).map(function(t){ return '<span class="cu-chip">$' + esc(t) + '</span>'; }).join('') +
        (u.tickers.length > 8 ? '<span class="cu-chip">+' + (u.tickers.length - 8) + '</span>' : '')
      : '<span class="cu-empty-holdings">' + esc(T(UI.noHoldings)) + '</span>';
    var socialHTML = '';
    if(u.facebook) socialHTML += '<span><b>FB</b>' + esc(u.facebook) + '</span>';
    if(u.instagram) socialHTML += '<span><b>IG</b>' + esc(u.instagram) + '</span>';

    var meta = rightsMeta(u.rights);
    var cardCls = 'cu-card' + (meta && meta.flagship ? ' flagship' : '');
    /* bolder than the old subtle 33%-alpha border -- a full-strength border
       plus a soft outer glow and a faint tinted wash of the tier color, so a
       tiered user's card reads as visually distinct at a glance, not just on
       close inspection. */
    var cardStyle = meta
      ? ' style="border-width:2px;border-color:' + meta.color + ';box-shadow:0 0 0 1px ' + meta.color + '55 inset,0 0 22px ' + meta.color + '33;background:linear-gradient(170deg, ' + meta.color + '14, transparent 60%);"'
      : '';

    /* whole card is the click target that opens the detail/edit modal --
       no inline inputs left in the grid to accidentally intercept the click. */
    return '<div class="' + cardCls + '" data-cu-user="' + esc(u.userId) + '"' + cardStyle + '>' +
      '<div class="cu-card-top">' +
        avatar +
        '<div>' +
          '<div class="cu-name">' + esc(u.displayName || '—') + '</div>' +
          '<div class="cu-uid">UID: ' + esc(u.uid || '—') + '</div>' +
          cuLinkedSinceHTML(u) +
          '<div class="cu-card-top-row">' + providerBadgeHTML(u) + statusHTML + rightsBadgeHTML(u.rights) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="cu-holdings">' + holdingsHTML + '</div>' +
      (socialHTML ? '<div class="cu-social">' + socialHTML + '</div>' : '') +
    '</div>';
  }

  /* compact list-row alternative to the tile grid above -- same click-to-open
     behaviour and the same tier border/flagship treatment, just name+photo
     up front and everything else condensed onto one line so a long roster
     scans faster than scrolling a wall of tiles. */
  function userListRowHTML(u){
    var avatar = u.pictureUrl
      ? '<img class="cu-avatar cu-row-avatar" src="' + esc(u.pictureUrl) + '" alt="">'
      : '<div class="cu-avatar-fallback cu-row-avatar">' + esc((u.displayName || '?').charAt(0).toUpperCase()) + '</div>';
    var state = accessState(u);
    var statusHTML = state === 'active'
      ? '<span class="cu-status active">' + esc(T(UI.statusActive).replace('{d}', fmtDate(u.accessUntil))) + '</span>'
      : state === 'expired'
        ? '<span class="cu-status expired">' + esc(T(UI.statusExpired).replace('{d}', fmtDate(u.accessUntil))) + '</span>'
        : '<span class="cu-status none">' + esc(T(UI.statusNone)) + '</span>';
    var holdingsCount = u.tickers && u.tickers.length ? u.tickers.length : 0;
    var meta = rightsMeta(u.rights);
    var rowCls = 'cu-row' + (meta && meta.flagship ? ' flagship' : '');
    var rowStyle = meta ? ' style="border-color:' + meta.color + ';box-shadow:0 0 0 1px ' + meta.color + '33 inset;"' : '';
    return '<div class="' + rowCls + '" data-cu-user="' + esc(u.userId) + '"' + rowStyle + '>' +
      avatar +
      '<div class="cu-row-mid">' +
        '<div class="cu-name">' + esc(u.displayName || '—') + '</div>' +
        cuLinkedSinceHTML(u) +
        '<div class="cu-card-top-row">' + providerBadgeHTML(u) + statusHTML + rightsBadgeHTML(u.rights) + '</div>' +
      '</div>' +
      '<div class="cu-row-end">' +
        '<span class="cu-uid">UID: ' + esc(u.uid || '—') + '</span>' +
        (holdingsCount ? '<span class="cu-chip">' + holdingsCount + ' $</span>' : '') +
      '</div>' +
    '</div>';
  }

  function filteredUsers(){
    if(!users) return [];
    var q = searchQuery.trim().toLowerCase();
    return users.filter(function(u){
      if(filterMode === 'active' && accessState(u) !== 'active') return false;
      if(filterMode === 'expired' && accessState(u) === 'active') return false;
      if(rightsFilterMode === 'none' && u.rights) return false;
      if(rightsFilterMode !== 'all' && rightsFilterMode !== 'none' && u.rights !== rightsFilterMode) return false;
      if(!q) return true;
      var hay = [u.displayName, u.uid, u.facebook, u.instagram].concat(u.tickers || []).join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function rightsFilterOptionsHTML(){
    return '<option value="all"' + (rightsFilterMode === 'all' ? ' selected' : '') + '>' + esc(T(UI.filterRightsAll)) + '</option>' +
      '<option value="none"' + (rightsFilterMode === 'none' ? ' selected' : '') + '>' + esc(T(UI.filterRightsNone)) + '</option>' +
      RIGHTS_ORDER.map(function(k){
        return '<option value="' + k + '"' + (rightsFilterMode === k ? ' selected' : '') + '>' + esc(T(RIGHTS_META[k].label)) + '</option>';
      }).join('');
  }

  function listHTML(){
    var list = filteredUsers();
    var countText = T(UI.count).replace('{n}', users.length);
    var gridHTML = !list.length
      ? '<div class="cu-empty">' + esc(T(users.length ? UI.noMatch : UI.empty)) + '</div>'
      : (viewMode === 'list'
          ? '<div class="cu-list" data-cu="grid">' + list.map(userListRowHTML).join('') + '</div>'
          : '<div class="cu-grid" data-cu="grid">' + list.map(userCardHTML).join('') + '</div>');
    return '<div class="cu-toolbar">' +
        '<input type="text" class="cu-search" data-cu="search" placeholder="' + esc(T(UI.searchPh)) + '" value="' + esc(searchQuery) + '">' +
        '<select class="cu-filter" data-cu="filter">' +
          '<option value="all"' + (filterMode === 'all' ? ' selected' : '') + '>' + esc(T(UI.filterAll)) + '</option>' +
          '<option value="active"' + (filterMode === 'active' ? ' selected' : '') + '>' + esc(T(UI.filterActive)) + '</option>' +
          '<option value="expired"' + (filterMode === 'expired' ? ' selected' : '') + '>' + esc(T(UI.filterExpired)) + '</option>' +
        '</select>' +
        '<select class="cu-filter" data-cu="rightsFilter">' + rightsFilterOptionsHTML() + '</select>' +
        '<div class="cu-viewtoggle">' +
          '<button type="button" class="cu-viewbtn' + (viewMode === 'grid' ? ' on' : '') + '" data-cu="viewGrid">' + esc(T(UI.viewGrid)) + '</button>' +
          '<button type="button" class="cu-viewbtn' + (viewMode === 'list' ? ' on' : '') + '" data-cu="viewList">' + esc(T(UI.viewList)) + '</button>' +
        '</div>' +
        '<span class="cu-count">' + esc(countText) + '</span>' +
      '</div>' + gridHTML;
  }

  function bodyHTML(){
    if(window.__SPZ_TIER && window.__SPZ_TIER() !== 'full') return '<div class="cu-empty">' + esc(T(UI.adminOnly)) + '</div>';
    if(loading) return '<div class="cu-loading">' + esc(T(UI.loading)) + '</div>';
    if(!getAdminKey() || !users) return keyGateHTML();
    return listHTML();
  }

  function wireGridCards(){
    var grid = sec.querySelector('[data-cu="grid"]');
    if(!grid) return;
    Array.prototype.forEach.call(grid.querySelectorAll('.cu-card, .cu-row'), function(card){
      card.addEventListener('click', function(){ openDetailModal(card.getAttribute('data-cu-user')); });
    });
  }

  function renderListOnly(){
    var body = sec.querySelector('[data-cu="body"]');
    if(!body) return;
    var caretEl = document.activeElement;
    var wasSearch = caretEl && caretEl.getAttribute && caretEl.getAttribute('data-cu') === 'search';
    var caret = wasSearch ? caretEl.selectionStart : null;
    body.innerHTML = listHTML();
    wireBody();
    if(wasSearch){
      var reInput = sec.querySelector('[data-cu="search"]');
      if(reInput){ reInput.focus(); try { reInput.setSelectionRange(caret, caret); } catch(e){} }
    }
  }

  function wireBody(){
    var keyInput = sec.querySelector('[data-cu="keyInput"]');
    if(keyInput){
      keyInput.addEventListener('keydown', function(ev){ if(ev.key === 'Enter') submitKey(); });
    }
    var keySubmit = sec.querySelector('[data-cu="keySubmit"]');
    if(keySubmit) keySubmit.addEventListener('click', submitKey);

    var searchInput = sec.querySelector('[data-cu="search"]');
    if(searchInput){
      searchInput.addEventListener('input', function(ev){ searchQuery = ev.target.value; renderListOnly(); });
    }
    var filterSelect = sec.querySelector('[data-cu="filter"]');
    if(filterSelect){
      filterSelect.addEventListener('change', function(ev){ filterMode = ev.target.value; renderListOnly(); });
    }
    var rightsFilterSelect = sec.querySelector('[data-cu="rightsFilter"]');
    if(rightsFilterSelect){
      rightsFilterSelect.addEventListener('change', function(ev){ rightsFilterMode = ev.target.value; renderListOnly(); });
    }
    var viewGridBtn = sec.querySelector('[data-cu="viewGrid"]');
    var viewListBtn = sec.querySelector('[data-cu="viewList"]');
    if(viewGridBtn) viewGridBtn.addEventListener('click', function(){ viewMode = 'grid'; setViewMode('grid'); renderListOnly(); });
    if(viewListBtn) viewListBtn.addEventListener('click', function(){ viewMode = 'list'; setViewMode('list'); renderListOnly(); });
    wireGridCards();
  }

  function submitKey(){
    var input = sec.querySelector('[data-cu="keyInput"]');
    var key = input ? input.value.trim() : '';
    if(!key) return;
    setAdminKey(key);
    fetchUsers();
    fetchPresenceCount();
  }

  /* ==== click-in user detail modal =====================================
     Opened by clicking any card. Read-only by default (name/photo/UID,
     tier badge, access status, holdings + the same portfolio/risk analysis
     as the Watchlist page's own board) -- an explicit Edit button unlocks
     the UID/tier/access fields, and Save always goes through a one-screen
     confirmation summary before it actually calls the Worker, per her
     request that nothing here saves by accident. ======================== */

  function currentDetailUser(){
    return (users || []).filter(function(x){ return x.userId === detailUserId; })[0] || null;
  }

  function buildDetailModal(){
    if(detailModal) return;
    detailModal = document.createElement('div');
    detailModal.id = 'cuDetailModal';
    detailModal.hidden = true;
    detailModal.innerHTML =
      '<div class="cudm-card">' +
        '<button type="button" class="cudm-close" data-cudm="close">&times;</button>' +
        '<div data-cudm="body"></div>' +
      '</div>';
    document.body.appendChild(detailModal);
    detailModalBody = detailModal.querySelector('[data-cudm="body"]');
    detailModal.querySelector('[data-cudm="close"]').addEventListener('click', closeDetailModal);
    detailModal.addEventListener('click', function(ev){ if(ev.target === detailModal) closeDetailModal(); });
    document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape' && detailModal && !detailModal.hidden) closeDetailModal(); });
  }

  function openDetailModal(userId){
    buildDetailModal();
    detailUserId = userId;
    detailEditing = false;
    detailConfirming = false;
    detailDraft = null;
    detailModal.hidden = false;
    paintDetailModal();
  }

  function closeDetailModal(){
    if(detailModal) detailModal.hidden = true;
    detailUserId = null; detailEditing = false; detailConfirming = false; detailDraft = null;
  }

  function detailReadOnlyHTML(){
    return '<button type="button" class="cudm-edit-btn" data-cudm="editBtn">' + esc(T(UI.editBtn)) + '</button>';
  }

  function detailConfirmSummaryRows(u){
    var rows = [];
    if(detailDraft.uid !== (u.uid || '')) rows.push(fmtRow(UI.confirmUidRow, { v: detailDraft.uid }));
    if((detailDraft.rights || null) !== (u.rights || null)){
      var rl = detailDraft.rights ? T(RIGHTS_META[detailDraft.rights].label) : T(UI.rightsNone);
      rows.push(fmtRow(UI.confirmRightsRow, { v: rl }));
    }
    if(detailDraft.accessMode === 'clear' && u.accessUntil) rows.push(T(UI.confirmAccessClearRow));
    else if(detailDraft.accessMode === 'days' && detailDraft.days > 0) rows.push(fmtRow(UI.confirmAccessSetRow, { n: detailDraft.days, d: fmtDate(computeDaysEndDate(detailDraft.days)) }));
    if(!rows.length) rows.push(T(UI.confirmNoChange));
    return rows;
  }
  function fmtRow(o, map){
    var s = T(o);
    for(var k in map) s = s.split('{' + k + '}').join(map[k]);
    return s;
  }

  function detailConfirmHTML(u){
    var rows = detailConfirmSummaryRows(u);
    return '<div class="cudm-confirm-box">' +
      '<div class="cudm-confirm-title">' + esc(T(UI.confirmTitle)) + '</div>' +
      '<ul>' + rows.map(function(r){ return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<div class="cudm-btn-row">' +
        '<button type="button" class="cudm-confirm-btn" data-cudm="confirmSaveBtn">' + esc(T(UI.confirmSaveBtn)) + '</button>' +
        '<button type="button" class="cudm-cancel-btn" data-cudm="backToEditBtn">' + esc(T(UI.backBtn)) + '</button>' +
      '</div>' +
      '<div class="cudm-save-status" data-cudm="saveStatus"></div>' +
    '</div>';
  }

  function detailDaysSummaryText(u){
    if(detailDraft.accessMode === 'clear') return T(UI.daysSummaryClear);
    if(detailDraft.accessMode === 'days' && detailDraft.days > 0){
      return fmtRow(UI.daysSummarySet, { n: detailDraft.days, d: fmtDate(computeDaysEndDate(detailDraft.days)) });
    }
    return fmtRow(UI.daysSummaryKeep, { d: u.accessUntil ? fmtDate(u.accessUntil) : T(UI.statusNone) });
  }

  /* Packages reuse the exact same TIERS list the public #membership pricing
     page renders from (window.__SPZ_MEMBERSHIP_TIERS), filtered down to the
     ids that are actually grantable rights here. Picking one is a
     convenience preset -- it fills the tier + days fields below, which stay
     freely editable afterward (e.g. to add bonus days), it doesn't lock
     anything. 'free' isn't a grantable right so it's excluded. */
  function grantablePackages(){
    var tiers = window.__SPZ_MEMBERSHIP_TIERS || [];
    var out = [];
    for(var i = 0; i < tiers.length; i++){
      var t = tiers[i];
      if(RIGHTS_ORDER.indexOf(t.id) === -1) continue;
      out.push(t);
    }
    return out;
  }
  function packagePickerHTML(){
    var pkgs = grantablePackages();
    if(!pkgs.length) return '';
    var options = '<option value="">' + esc(T(UI.pkgNone)) + '</option>' +
      pkgs.map(function(p){
        var priceLbl = p.price ? ('฿' + p.price.toLocaleString('en-US')) : '';
        return '<option value="' + esc(p.id) + '">' + esc(T(p.name)) + (priceLbl ? ' — ' + priceLbl : '') +
          (p.days ? ' (' + p.days + (L() === 'th' ? ' วัน' : ' days') + ')' : '') + '</option>';
      }).join('');
    return '<div class="cudm-field"><label>' + esc(T(UI.pkgLabel)) + '</label>' +
      '<select data-cudm="pkgInput">' + options + '</select>' +
      '<div class="cudm-pkg-tag" data-cudm="pkgTag"></div>' +
    '</div>';
  }

  function detailEditFormHTML(u){
    if(detailConfirming) return detailConfirmHTML(u);
    var rightsOptions = '<option value=""' + (!detailDraft.rights ? ' selected' : '') + '>' + esc(T(UI.rightsNone)) + '</option>' +
      RIGHTS_ORDER.map(function(k){
        return '<option value="' + k + '"' + (detailDraft.rights === k ? ' selected' : '') + '>' + esc(T(RIGHTS_META[k].label)) + '</option>';
      }).join('');
    return '' +
      '<div class="cudm-field"><label>' + esc(T(UI.uidLabel)) + '</label><input type="text" data-cudm="uidInput" value="' + esc(detailDraft.uid || '') + '" maxlength="20"></div>' +
      packagePickerHTML() +
      '<div class="cudm-field"><label>' + esc(T(UI.rightsLabel)) + '</label><select data-cudm="rightsInput">' + rightsOptions + '</select></div>' +
      '<div class="cudm-field"><label>' + esc(T(UI.accessDaysLabel)) + '</label>' +
        '<div class="cudm-days-row">' +
          '<input type="number" min="1" max="3650" data-cudm="daysInput" placeholder="0">' +
          '<span>' + esc(T(UI.daysSuffix)) + '</span>' +
          '<button type="button" class="cudm-cancel-btn" data-cudm="clearAccessBtn">' + esc(T(UI.clearAccessBtn)) + '</button>' +
        '</div>' +
        '<div class="cudm-days-summary" data-cudm="daysSummary">' + esc(detailDaysSummaryText(u)) + '</div>' +
      '</div>' +
      '<div class="cudm-btn-row">' +
        '<button type="button" class="cudm-confirm-btn" data-cudm="reviewBtn">' + esc(T(UI.reviewBtn)) + '</button>' +
        '<button type="button" class="cudm-cancel-btn" data-cudm="cancelEditBtn">' + esc(T(UI.cancelBtn)) + '</button>' +
      '</div>';
  }

  function paintDetailModal(){
    if(!detailModal || detailModal.hidden || !detailModalBody) return;
    var u = currentDetailUser();
    if(!u){ closeDetailModal(); return; }

    var avatar = u.pictureUrl
      ? '<img class="cudm-avatar" src="' + esc(u.pictureUrl) + '" alt="">'
      : '<div class="cudm-avatar-fallback">' + esc((u.displayName || '?').charAt(0).toUpperCase()) + '</div>';
    var state = accessState(u);
    var statusText = state === 'active' ? T(UI.statusActive).replace('{d}', fmtDate(u.accessUntil))
      : state === 'expired' ? T(UI.statusExpired).replace('{d}', fmtDate(u.accessUntil))
      : T(UI.statusNone);

    var stocks = (window.__SPZ_LINE && window.__SPZ_LINE.stocksSnapshot && window.__SPZ_LINE.stocksSnapshot()) || {};
    var paHTML = (window.__SPZ_LINE && window.__SPZ_LINE.portfolioAnalysisHTML) ? window.__SPZ_LINE.portfolioAnalysisHTML(u.tickers || [], stocks) : '';
    var holdingsHTML = (u.tickers && u.tickers.length)
      ? (paHTML || ('<div class="cu-holdings">' + u.tickers.map(function(t){ return '<span class="cu-chip">$' + esc(t) + '</span>'; }).join('') + '</div>'))
      : '<div class="cu-empty-holdings">' + esc(T(UI.noHoldings)) + '</div>';

    var socialHTML = '';
    if(u.facebook) socialHTML += '<div class="cudm-row"><span>Facebook</span><b>' + esc(u.facebook) + '</b></div>';
    if(u.instagram) socialHTML += '<div class="cudm-row"><span>Instagram</span><b>' + esc(u.instagram) + '</b></div>';

    var editZoneHTML = detailEditing ? detailEditFormHTML(u) : detailReadOnlyHTML();

    detailModalBody.innerHTML =
      '<div class="cudm-head">' + avatar +
        '<div><div class="cudm-name">' + esc(u.displayName || '—') + '</div>' +
          '<div class="cudm-uid">UID: ' + esc(u.uid || '—') + providerBadgeHTML(u) + rightsBadgeHTML(u.rights) + '</div>' +
          cuLinkedSinceHTML(u) +
        '</div>' +
      '</div>' +
      '<div class="cudm-section"><div class="cudm-row"><span>' + esc(T(UI.accessLabel)) + '</span><b>' + esc(statusText) + '</b></div></div>' +
      (socialHTML ? '<div class="cudm-section">' + socialHTML + '</div>' : '') +
      '<div class="cudm-section"><div class="cudm-holdings-h">' + esc(T(UI.holdingsHeader)) + '</div>' + holdingsHTML + '</div>' +
      '<div class="cudm-section" data-cudm="editZone">' + editZoneHTML + '</div>';

    wireDetailModal(u);
  }

  function wireDetailModal(u){
    var body = detailModalBody;

    var editBtn = body.querySelector('[data-cudm="editBtn"]');
    if(editBtn) editBtn.addEventListener('click', function(){
      detailEditing = true; detailConfirming = false;
      detailDraft = { uid: u.uid || '', rights: u.rights || null, accessMode: 'keep', days: null };
      paintDetailModal();
    });

    var cancelEditBtn = body.querySelector('[data-cudm="cancelEditBtn"]');
    if(cancelEditBtn) cancelEditBtn.addEventListener('click', function(){
      detailEditing = false; detailConfirming = false; detailDraft = null;
      paintDetailModal();
    });

    var daysInput = body.querySelector('[data-cudm="daysInput"]');
    var summaryEl = body.querySelector('[data-cudm="daysSummary"]');
    function refreshSummary(){ if(summaryEl && detailDraft) summaryEl.textContent = detailDaysSummaryText(u); }
    if(daysInput){
      daysInput.addEventListener('input', function(){
        var n = parseInt(daysInput.value, 10);
        if(daysInput.value === '' || isNaN(n) || n <= 0){ detailDraft.accessMode = 'keep'; detailDraft.days = null; }
        else { detailDraft.accessMode = 'days'; detailDraft.days = n; }
        refreshSummary();
      });
    }
    var clearBtn = body.querySelector('[data-cudm="clearAccessBtn"]');
    if(clearBtn) clearBtn.addEventListener('click', function(){
      detailDraft.accessMode = 'clear'; detailDraft.days = null;
      if(daysInput) daysInput.value = '';
      refreshSummary();
    });

    var uidInput = body.querySelector('[data-cudm="uidInput"]');
    if(uidInput) uidInput.addEventListener('input', function(){ detailDraft.uid = uidInput.value; });
    var rightsInput = body.querySelector('[data-cudm="rightsInput"]');
    if(rightsInput) rightsInput.addEventListener('change', function(){ detailDraft.rights = rightsInput.value || null; });

    /* Package picker: a preset, not a lock -- selecting one just fills in
       the tier dropdown and the days input below (as if the admin had typed
       them in by hand), so bonus days can still be added on top afterward.
       Re-selecting the same rights/days manually after this is completely
       independent; the package field itself is never sent to the server. */
    var pkgInput = body.querySelector('[data-cudm="pkgInput"]');
    var pkgTag = body.querySelector('[data-cudm="pkgTag"]');
    if(pkgInput) pkgInput.addEventListener('change', function(){
      var pkgs = grantablePackages();
      var picked = null;
      for(var i = 0; i < pkgs.length; i++){ if(pkgs[i].id === pkgInput.value) picked = pkgs[i]; }
      if(!picked){ if(pkgTag) pkgTag.textContent = ''; return; }
      detailDraft.rights = picked.id;
      if(rightsInput) rightsInput.value = picked.id;
      if(picked.days){
        detailDraft.accessMode = 'days';
        detailDraft.days = picked.days;
        if(daysInput) daysInput.value = picked.days;
      }
      if(pkgTag){
        pkgTag.textContent = T(picked.tag) + (picked.days ? ' ' + fmtRow(UI.pkgAppliedHint, { days: picked.days, name: T(picked.name) }) : '');
      }
      refreshSummary();
    });

    var reviewBtn = body.querySelector('[data-cudm="reviewBtn"]');
    if(reviewBtn) reviewBtn.addEventListener('click', function(){
      if(uidInput) detailDraft.uid = uidInput.value.trim() || u.uid || '';
      detailConfirming = true;
      paintDetailModal();
    });

    var confirmBtn = body.querySelector('[data-cudm="confirmSaveBtn"]');
    if(confirmBtn) confirmBtn.addEventListener('click', function(){ submitDetailSave(u); });
    var backBtn = body.querySelector('[data-cudm="backToEditBtn"]');
    if(backBtn) backBtn.addEventListener('click', function(){ detailConfirming = false; paintDetailModal(); });
  }

  function submitDetailSave(u){
    var payload = { userId: u.userId, uid: detailDraft.uid || u.uid, rights: detailDraft.rights };
    if(detailDraft.accessMode === 'clear') payload.accessUntil = null;
    else if(detailDraft.accessMode === 'days' && detailDraft.days > 0) payload.accessUntil = computeDaysEndDate(detailDraft.days);
    /* accessMode 'keep' -- leave "accessUntil" out of the body entirely so
       the Worker (which only touches it when the key is present at all)
       never changes what's already saved. */

    var statusEl = detailModalBody.querySelector('[data-cudm="saveStatus"]');
    var confirmBtn = detailModalBody.querySelector('[data-cudm="confirmSaveBtn"]');
    if(statusEl){ statusEl.className = 'cudm-save-status'; statusEl.textContent = T(UI.saving); }
    if(confirmBtn) confirmBtn.disabled = true;

    fetch(WORKER_BASE + '/api/admin/users/update', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-Admin-Key': getAdminKey() },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json().then(function(data){ return { ok:r.ok, data:data }; }); })
      .then(function(res){
        if(confirmBtn) confirmBtn.disabled = false;
        if(!res.ok){
          if(statusEl){ statusEl.classList.add('err'); statusEl.textContent = res.data && res.data.error === 'uid_taken' ? T(UI.saveErrTaken) : T(UI.saveErrBad); }
          return;
        }
        var match = users.filter(function(x){ return x.userId === u.userId; })[0];
        if(match){
          match.uid = payload.uid;
          match.rights = payload.rights;
          if('accessUntil' in payload) match.accessUntil = payload.accessUntil;
        }
        detailEditing = false; detailConfirming = false; detailDraft = null;
        paintDetailModal();
        renderListOnly();
      })
      .catch(function(){
        if(confirmBtn) confirmBtn.disabled = false;
        if(statusEl){ statusEl.classList.add('err'); statusEl.textContent = T(UI.saveErrBad); }
      });
  }

  function paint(){
    if(!sec) return;
    var eb = sec.querySelector('[data-cu="eb"]'), h = sec.querySelector('[data-cu="h"]'), lede = sec.querySelector('[data-cu="lede"]');
    if(eb) eb.textContent = T(UI.eb);
    if(h) h.textContent = T(UI.h);
    if(lede) lede.textContent = T(UI.lede);
    paintPresence();
    var body = sec.querySelector('[data-cu="body"]');
    if(!body) return;
    body.innerHTML = bodyHTML();
    var keyInput = sec.querySelector('[data-cu="keyInput"]');
    if(keyInput) keyInput.focus();
    wireBody();
  }

  function build(){
    if(document.getElementById('connectedusers')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'connectedusers';
    sec.setAttribute('data-route', 'connectedusers');
    sec.innerHTML =
      '<div class="cx-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-cu="eb"></span></div>' +
          '<h2 data-cu="h"></h2>' +
          '<p class="lede" data-cu="lede"></p>' +
          '<div class="cu-presence" data-cu="presence"></div>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-cu="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'connectedusers', feat:true, after:'printreport',
      t: UI.h,
      d:{en:'Every visitor who has linked LINE or Telegram — photo, holdings, UID and access status. Admin-only, invisible to members and linked visitors.',
         th:'ทุกคนที่เชื่อมต่อ LINE หรือ Telegram ไว้ — รูป หุ้นที่ถือ UID และสถานะสิทธิ์การใช้งาน เฉพาะแอดมิน เมมเบอร์และผู้ที่ล็อกอินไว้แล้วมองไม่เห็น'}
    });

    paint();
    if(getAdminKey()){ fetchUsers(); fetchPresenceCount(); }
    if(!presencePoll) presencePoll = setInterval(function(){ if(getAdminKey()) fetchPresenceCount(); }, 20000);
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
