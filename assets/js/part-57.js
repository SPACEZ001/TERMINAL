
(function(){
  'use strict';

  /* ======================= Firebase config ======================= */
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDKj83JR-7flzyNfpLA6W6B73G7Xm0qPrk",
    authDomain: "spacez-terminal.firebaseapp.com",
    projectId: "spacez-terminal",
    storageBucket: "spacez-terminal.firebasestorage.app",
    messagingSenderId: "532665084478",
    appId: "1:532665084478:web:73aeb1d4c79ab306ee3f6f"
  };

  /* ======================= Cloudinary config -- placeholder =======================
     Images are hosted on Cloudinary's free tier instead of Firebase Storage (Firebase
     Storage now requires the paid Blaze plan). Get these two values from a free
     Cloudinary account -> Settings -> Upload -> add an "unsigned" upload preset.
     Neither value is a secret; both are meant to be public in client-side code. ==== */
  var CLOUDINARY_CONFIG = {
    cloudName: "lyldfvir",
    uploadPreset: "uheaqpmw"
  };
  function cloudinaryConfigured(){ return !!(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.cloudName !== 'REPLACE_ME'); }

  /* ======================= likes (via the shared LINE session) =======================
     Liking a post needs a linked LINE account (window.__SPZ_LINE, exposed by the
     Watchlist module -- there is only ever ONE LINE session/modal on the whole
     site, and this module reuses it rather than building a second login flow).
     Seeing who already liked a post needs no login at all. The Watchlist module
     may not have booted yet when a journal card first renders, so every call
     goes through withLineApi(), which retries briefly instead of failing silently. */
  function withLineApi(cb, tries){
    tries = tries || 0;
    if(window.__SPZ_LINE){ cb(window.__SPZ_LINE); return; }
    if(tries > 20) return; /* give up quietly after ~10s -- the like button just stays inert */
    setTimeout(function(){ withLineApi(cb, tries + 1); }, 500);
  }

  /* ======================= admin-controlled journal settings =======================
     Round K fix: this used to be a client-written `settings/journal` Firestore
     doc, but Firestore's security rules only ever had an explicit allow-write
     rule for journal_entries -- there was never a matching rule for the
     `settings` collection, so every save silently fell through to the
     project's default deny and came back as "could not save", no matter how
     many times it was retried. The admin page's own Firebase-Auth sign-in
     proves nothing to Firestore's rules engine; it's a separate system.
     Moved to the same Cloudflare Worker + KV store every other piece of this
     site's admin-controlled state already goes through (profiles, rights,
     broadcast) -- reads are public (every visitor's feed needs to know
     whether to show likers/stats), writes need the shared X-Admin-Key. */
  var JOURNAL_SETTINGS_DEFAULT = { showLikers: true, statsVisible: { total: true, month: true, top: true, accuracy: true } };
  var journalSettingsCache = null;
  function loadJournalSettings(cb){
    fetch('https://spacez-line-link.spacezblack.workers.dev/api/journal-settings').then(function(r){
      return r.ok ? r.json() : Promise.reject();
    }).then(function(v){
      var sv = (v && v.statsVisible) || {};
      journalSettingsCache = {
        showLikers: v && v.showLikers !== false,
        statsVisible: {
          total: sv.total !== false, month: sv.month !== false,
          top: sv.top !== false, accuracy: sv.accuracy !== false
        }
      };
      cb(journalSettingsCache);
    }).catch(function(){ journalSettingsCache = JOURNAL_SETTINGS_DEFAULT; cb(journalSettingsCache); });
  }

  function paintLikeUI(root, data){
    var btn = root.querySelector('.jrnl-like-btn');
    if(!btn) return;
    var countEl = root.querySelector('.jrnl-like-count');
    var avEl = root.querySelector('.jrnl-like-avatars');
    var showLikers = !journalSettingsCache || journalSettingsCache.showLikers !== false;
    btn.classList.toggle('liked', !!data.youLiked);
    if(countEl) countEl.textContent = (showLikers && data.count > 0) ? data.count : '';
    if(avEl){
      if(!showLikers){
        avEl.innerHTML = '';
      } else {
        var likers = (data.likes || []).filter(function(l){ return l.pictureUrl; }).slice(0, 5);
        avEl.innerHTML = likers.map(function(l){
          return '<img src="' + esc(l.pictureUrl) + '" alt="" title="' + esc(l.displayName || '') + '">';
        }).join('') + (data.count > likers.length ? '<span class="jrnl-like-more">+' + (data.count - likers.length) + '</span>' : '');
      }
    }
  }

  function likeWrapHTML(){
    return '<div class="jrnl-like-wrap">' +
      '<button type="button" class="jrnl-like-btn">' +
        '<svg class="jrnl-like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/>' +
        '</svg>' +
        '<span class="jrnl-like-count"></span>' +
      '</button>' +
      '<span class="jrnl-like-avatars"></span>' +
    '</div>';
  }

  function wireLike(root, postId){
    var btn = root.querySelector('.jrnl-like-btn');
    if(!btn) return;
    btn.addEventListener('click', function(ev){
      ev.stopPropagation();
      withLineApi(function(LINE){
        var st = LINE.state();
        if(st.status !== 'linked'){ LINE.open(); return; }
        if(btn.disabled) return;
        btn.disabled = true;
        LINE.like(postId, function(err, data){
          btn.disabled = false;
          if(!err && data) paintLikeUI(root, data);
        });
      });
    });
    withLineApi(function(LINE){
      LINE.likesGet(postId, function(err, data){ if(!err && data) paintLikeUI(root, data); });
    });
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

  var fbApp = null, fbDb = null, fbAuth = null;
  function fbConfigured(){ return !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'REPLACE_ME'); }
  /* Round T: a shared health flag the System Status popup (part-37.js) reads
     through window.__SPZ_FB_STATUS(), so "is the analysis-log backend okay
     right now" shows up next to the price-feed/sync rows already there.
     Three states only: 'unconfigured' (no Firebase project wired up yet --
     see fbConfigured() above), 'error' (configured, but the feed or a
     single post most recently failed to load), 'ok' (everything else,
     including "hasn't loaded anything yet" -- optimistic until proven
     otherwise, same as the rest of that popup treats a fresh page load). */
  var fbLastError = false;
  window.__SPZ_FB_STATUS = function(){
    if(!fbConfigured()) return 'unconfigured';
    return fbLastError ? 'error' : 'ok';
  };
  function fbInit(){
    if(fbApp) return fbApp;
    if(!fbConfigured() || !window.firebase) return null;
    try {
      fbApp = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      fbDb = firebase.firestore();
      fbAuth = firebase.auth();
    } catch(e){ fbApp = null; }
    return fbApp;
  }

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function fmtDate(d){
    try { return d.toLocaleString(L() === 'th' ? 'th-TH' : 'en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch(e){ return ''; }
  }

  /* renders the timeframe + optional Elliott-Wave trade-levels (WC Invalid / SL / TP /
     Wave View) as a row of small chips under a public-facing card; shared between the
     feed cards and the single shareable-entry view so both stay in sync */
  function cardLevelsHtml(e){
    var parts = [];
    /* Round P: show which way this call is looking whenever there's an
       actual trade setup attached (entry/SL/TP) -- without it, a chip like
       "-27.36 pts" reads as a loss even on a downtrend call that played out
       exactly right, since a bare number says nothing about which direction
       was being called. */
    if(e.entryPrice || e.sl || e.tp){
      var isDown = e.bias === 'down';
      parts.push('<span class="jrnl-lvl-chip bias ' + (isDown ? 'down' : 'up') + '">' + (isDown ? '&#9660; ' : '&#9650; ') + esc(T(isDown ? UI.biasDown : UI.biasUp)) + '</span>');
    }
    if(e.timeframe) parts.push('<span class="jrnl-lvl-chip tf"><b>' + esc(T(UI.reportTimeframe)) + ':</b> ' + esc(e.timeframe) + '</span>');
    if(e.invalidPoint) parts.push('<span class="jrnl-lvl-chip invalid"><b>' + esc(T(UI.reportInvalid)) + ':</b> ' + esc(e.invalidPoint) + '</span>');
    if(e.sl) parts.push('<span class="jrnl-lvl-chip sl"><b>' + esc(T(UI.reportSL)) + ':</b> ' + esc(e.sl) + '</span>');
    if(e.tp) parts.push('<span class="jrnl-lvl-chip tp"><b>' + esc(T(UI.reportTP)) + ':</b> ' + esc(e.tp) + '</span>');
    if(e.waveView) parts.push('<span class="jrnl-lvl-chip wave"><b>' + esc(T(UI.reportWaveView)) + ':</b> ' + esc(e.waveView) + '</span>');
    var chipsHtml = parts.length ? '<div class="jrnl-card-levels">' + parts.join('') + '</div>' : '';
    return chipsHtml + riskBarHtml(e);
  }

  /* Round K1: order-status infographic (SL — Entry — TP) so the plan reads
     like a live TradingView position card -- a green zone from Entry to TP
     (upside), a red zone from SL to Entry (downside), and a pulsing Entry
     crosshair -- instead of a plain single-color bar. Only drawn when the
     entry price and at least one of SL/TP are actual numbers; silently
     skipped otherwise (never guesses a position for a non-numeric level). */
  function riskBarHtml(e){
    var entry = parseFloat(e.entryPrice);
    var sl = parseFloat(e.sl);
    var tp = parseFloat(e.tp);
    var hasEntry = isFinite(entry), hasSl = isFinite(sl), hasTp = isFinite(tp);
    if(!hasEntry || (!hasSl && !hasTp)) return '';
    var vals = [entry];
    if(hasSl) vals.push(sl);
    if(hasTp) vals.push(tp);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if(hi === lo) return '';
    var pad = (hi - lo) * 0.14;
    lo -= pad; hi += pad;
    function pct(v){ return Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100)); }
    var entryPct = pct(entry);
    var slPct = hasSl ? pct(sl) : null;
    var tpPct = hasTp ? pct(tp) : null;

    var zonesHtml = '';
    if(hasTp){
      var zL1 = Math.min(entryPct, tpPct), zW1 = Math.abs(tpPct - entryPct);
      zonesHtml += '<div class="jrnl-orderbar-zone profit" style="left:' + zL1.toFixed(1) + '%;width:' + zW1.toFixed(1) + '%;"></div>';
    }
    if(hasSl){
      var zL2 = Math.min(entryPct, slPct), zW2 = Math.abs(entryPct - slPct);
      zonesHtml += '<div class="jrnl-orderbar-zone loss" style="left:' + zL2.toFixed(1) + '%;width:' + zW2.toFixed(1) + '%;"></div>';
    }

    var marksHtml = '';
    if(hasSl){
      marksHtml += '<div class="jrnl-orderbar-mark sl" style="left:' + slPct.toFixed(1) + '%;" title="' + esc(T(UI.reportSL) + ': ' + e.sl) + '">' +
        '<span class="jrnl-orderbar-dot"></span><span class="jrnl-orderbar-lbl">' + esc(e.sl) + '</span>' +
      '</div>';
    }
    if(hasTp){
      marksHtml += '<div class="jrnl-orderbar-mark tp" style="left:' + tpPct.toFixed(1) + '%;" title="' + esc(T(UI.reportTP) + ': ' + e.tp) + '">' +
        '<span class="jrnl-orderbar-dot"></span><span class="jrnl-orderbar-lbl">' + esc(e.tp) + '</span>' +
      '</div>';
    }
    marksHtml += '<div class="jrnl-orderbar-mark entry" style="left:' + entryPct.toFixed(1) + '%;" title="' + esc(T(UI.riskBarEntry) + ': ' + e.entryPrice) + '">' +
      '<span class="jrnl-orderbar-dot"></span><span class="jrnl-orderbar-lbl">' + esc(e.entryPrice) + '</span>' +
    '</div>';

    var rrHtml = '';
    if(hasSl && hasTp){
      var risk = Math.abs(entry - sl), reward = Math.abs(tp - entry);
      if(risk > 0){
        rrHtml = '<div class="jrnl-orderbar-rr">' + esc(T(UI.riskBarRR)) + ' 1:' + (reward / risk).toFixed(1) + '</div>';
      }
    }

    return '<div class="jrnl-orderbar">' +
      '<div class="jrnl-orderbar-track">' + zonesHtml + '</div>' +
      '<div class="jrnl-orderbar-entryline" style="left:' + entryPct.toFixed(1) + '%;"></div>' +
      marksHtml + rrHtml +
    '</div>';
  }

  /* Round K: reader-facing "add LINE for alerts" CTA, shown under every
     public post's actions row. Renders nothing until LINE_OA_ADD_FRIEND_URL
     (declared further down, near the broadcast helpers) is actually filled
     in with the OA's real add-friend link. */
  function addLineFriendBtnHTML(){
    if(!LINE_OA_ADD_FRIEND_URL) return '';
    return '<a class="jrnl-addline-btn" href="' + esc(LINE_OA_ADD_FRIEND_URL) + '" target="_blank" rel="noopener noreferrer">' +
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C6.48 2 2 5.94 2 10.8c0 3.4 2.24 6.36 5.6 7.9-.18.7-.85 3.1-.88 3.3 0 0-.02.15.08.2.1.06.22 0 .22 0 .3-.04 3.4-2.24 4.02-2.7.3.04.6.06.96.06 5.52 0 10-3.94 10-8.76S17.52 2 12 2z"/></svg>' +
      '<span>' + esc(T(UI.addLineFriend)) + '</span>' +
    '</a>';
  }

  var UI = {
    eb:{en:'Personal Log',th:'บันทึกส่วนตัว'},
    h2:{en:'Asset Analysis Log',th:'บทวิเคราะห์สินทรัพย์'},
    lede:{en:'A running log of the analysis behind every call — screenshot, reasoning and the date it was made, filed by asset.',
          th:'บันทึกบทวิเคราะห์และเหตุผลเบื้องหลังแต่ละครั้ง พร้อมภาพและวันที่ แยกตามสินทรัพย์'},
    allTag:{en:'All',th:'ทั้งหมด'},
    addNew:{en:'+ New entry',th:'+ เพิ่มบทวิเคราะห์'},
    empty:{en:'No entries in this category yet.',th:'ยังไม่มีบทวิเคราะห์ในหมวดนี้'},
    loading:{en:'Loading…',th:'กำลังโหลด…'},
    notConfigured:{en:'The database for this page has not been connected yet.',th:'หน้านี้ยังไม่ได้เชื่อมต่อฐานข้อมูล'},
    loadError:{en:'Could not load entries right now — try again shortly.',th:'โหลดข้อมูลไม่สำเร็จตอนนี้ — ลองใหม่อีกครั้ง'},
    filterAsset:{en:'Asset',th:'สินทรัพย์'},
    filterTag:{en:'Tag',th:'แฮชแท็ก'},
    filterDate:{en:'Date',th:'วันที่'},

    editEb:{en:'Admin Only',th:'เฉพาะแอดมิน'},
    editH2:{en:'Add / Manage Analysis',th:'เพิ่ม / จัดการบทวิเคราะห์'},
    editLede:{en:'Sign in once per device with the account created in Firebase — new entries appear on the public log immediately.',
              th:'ล็อกอินครั้งเดียวต่อเครื่องด้วยบัญชีที่สร้างไว้ใน Firebase — เพิ่มแล้วขึ้นหน้าสาธารณะทันที'},
    signInEmail:{en:'Email',th:'อีเมล'},
    signInPass:{en:'Password',th:'รหัสผ่าน'},
    signIn:{en:'Sign in',th:'เข้าสู่ระบบ'},
    signingIn:{en:'Signing in…',th:'กำลังเข้าสู่ระบบ…'},
    signOut:{en:'Sign out',th:'ออกจากระบบ'},
    signInErr:{en:'Sign-in failed — check the email and password.',th:'เข้าสู่ระบบไม่สำเร็จ — ตรวจสอบอีเมลและรหัสผ่าน'},
    fieldAsset:{en:'Asset',th:'สินทรัพย์'},
    assetPick:{en:'— Choose an asset —',th:'— เลือกสินทรัพย์ —'},
    assetOther:{en:'Other (type your own)',th:'อื่นๆ (พิมพ์เอง)'},
    assetOtherPh:{en:'e.g. AAPL, PTT, custom name…',th:'เช่น AAPL, PTT, หรือชื่ออื่น…'},
    assetRecent:{en:'Recently used',th:'ที่เคยใช้'},
    fieldTags:{en:'Tags (optional)',th:'แฮชแท็ก (ไม่บังคับ)'},
    fieldRefPost:{en:'Reference an earlier post (optional)',th:'อ้างอิงโพสต์เก่า (ไม่บังคับ)'},
    refPostNone:{en:'— none —',th:'— ไม่มี —'},
    refPostJump:{en:'\u21b3 See the referenced post',th:'\u21b3 ดูโพสต์ที่อ้างอิง'},
    fieldTagsPh:{en:'breakout bullish shortterm',th:'breakout bullish ระยะสั้น'},
    fieldImage:{en:'Screenshot / chart image',th:'รูปภาพ / กราฟที่แคป'},
    dropHint:{en:'Click or drag an image here',th:'คลิกหรือลากรูปมาวางตรงนี้'},
    fieldText:{en:'Analysis',th:'บทวิเคราะห์'},
    save:{en:'Save entry',th:'บันทึก'},
    saving:{en:'Saving…',th:'กำลังบันทึก…'},
    saveErr:{en:'Could not save — try again.',th:'บันทึกไม่สำเร็จ — ลองใหม่อีกครั้ง'},
    saveOk:{en:'Saved.',th:'บันทึกแล้ว'},
    needBoth:{en:'Add an image and write something first.',th:'ใส่รูปและเขียนบทวิเคราะห์ก่อน'},
    imgNotConfigured:{en:'Image hosting is not connected yet — save without an image, or ask to finish setup.',th:'ยังไม่ได้เชื่อมต่อระบบฝากรูป — บันทึกแบบไม่มีรูปไปก่อน หรือแจ้งให้ตั้งค่าให้เสร็จ'},
    yourEntries:{en:'Your entries',th:'บทวิเคราะห์ของคุณ'},
    del:{en:'Delete',th:'ลบ'},
    delConfirm:{en:'Delete this entry? This cannot be undone.',th:'ลบบทวิเคราะห์นี้เลยไหม ย้อนกลับไม่ได้'},
    forgotPass:{en:'Forgot password?',th:'ลืมรหัสผ่าน?'},
    forgotNeedEmail:{en:'Type your email above first, then tap this again.',th:'พิมพ์อีเมลด้านบนก่อน แล้วกดอีกครั้ง'},
    forgotSent:{en:'Password reset link sent to your email.',th:'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว'},
    forgotErr:{en:'Could not send reset link — check the email.',th:'ส่งลิงก์ไม่สำเร็จ — ตรวจสอบอีเมล'},

    searchPh:{en:'Search analysis text…',th:'ค้นหาในบทวิเคราะห์…'},
    sortNewest:{en:'Newest first',th:'ใหม่สุดก่อน'},
    sortOldest:{en:'Oldest first',th:'เก่าสุดก่อน'},
    statTotal:{en:'Total entries',th:'บทวิเคราะห์ทั้งหมด'},
    statMonth:{en:'This month',th:'เดือนนี้'},
    statTop:{en:'Most analyzed',th:'วิเคราะห์บ่อยสุด'},
    statAccuracy:{en:'Accuracy',th:'ความแม่นยำ'},
    statNoData:{en:'—',th:'—'},
    pinned:{en:'Pinned',th:'ปักหมุด'},
    pin:{en:'Pin',th:'ปักหมุด'},
    unpin:{en:'Unpin',th:'เลิกปักหมุด'},
    outcomeCorrect:{en:'Correct',th:'ถูก'},
    outcomeIncorrect:{en:'Incorrect',th:'ผิด'},
    outcomePending:{en:'Pending',th:'รอผล'},
    share:{en:'Share',th:'แชร์'},
    shareCopied:{en:'Link copied.',th:'คัดลอกลิงก์แล้ว'},
    backToLog:{en:'← Back to Analysis Log',th:'← กลับไปหน้าบทวิเคราะห์'},
    notFound:{en:'This entry could not be found — it may have been removed.',th:'ไม่พบบทวิเคราะห์นี้ — อาจถูกลบไปแล้ว'},
    lineLockMsg:{en:'Please log in to view this analysis.',th:'โปรดล็อกอินก่อนเพื่อดูบทวิเคราะห์นี้'},
    lineLockBtn:{en:'Log in',th:'ล็อกอิน'},
    edit:{en:'Edit',th:'แก้ไข'},
    cancelEdit:{en:'Cancel edit',th:'ยกเลิกการแก้ไข'},
    editingFlag:{en:'Editing this entry',th:'กำลังแก้ไขรายการนี้'},
    update:{en:'Update entry',th:'บันทึกการแก้ไข'},
    updating:{en:'Updating…',th:'กำลังบันทึก…'},
    updateOk:{en:'Updated.',th:'บันทึกการแก้ไขแล้ว'},
    publish:{en:'Publish report',th:'ออกรายงาน'},
    reportTitle:{en:'Analysis Report',th:'รายงานบทวิเคราะห์'},
    reportSub:{en:'Personal Asset Analysis Log',th:'บันทึกบทวิเคราะห์สินทรัพย์ส่วนตัว'},
    reportGenerated:{en:'Generated',th:'ออกรายงานเมื่อ'},
    reportPosted:{en:'Posted',th:'บันทึกไว้เมื่อ'},
    reportAsset:{en:'Asset',th:'สินทรัพย์'},
    reportTags:{en:'Tags',th:'แฮชแท็ก'},
    reportChartH:{en:'Price Context',th:'บริบทราคา'},
    reportDisclaimer:{en:'This is the author’s own personal analysis and opinion, generated from the Asset Analysis Log on SPACEZ TERMINAL. It is not investment advice, a recommendation, or a solicitation to buy or sell any asset. Verify all figures independently before acting. © SPACEZ TERMINAL.',
      th:'นี่คือบทวิเคราะห์และความเห็นส่วนตัวของผู้เขียน สร้างจากบทวิเคราะห์สินทรัพย์บน SPACEZ TERMINAL ไม่ใช่คำแนะนำการลงทุน การชี้ชวน หรือการเสนอให้ซื้อขายสินทรัพย์ใดๆ กรุณาตรวจสอบตัวเลขทุกตัวด้วยตนเองก่อนนำไปใช้ © SPACEZ TERMINAL'},
    reportQrHeading:{en:'Read More Online',th:'อ่านเพิ่มเติมออนไลน์'},
    reportQrSub:{en:'Scan to open this analysis on the live terminal',th:'สแกนเพื่อเปิดบทวิเคราะห์นี้บนเว็บเทอร์มินัลแบบสด'},
    reportQrCaption:{en:'Scan to view',th:'สแกนเพื่อดู'},
    printBtn:{en:'Print / Save as PDF',th:'พิมพ์ / บันทึกเป็น PDF'},
    closeBtn:{en:'Close',th:'ปิด'},

    fieldTimeframe:{en:'Timeframe',th:'ไทม์เฟรม'},
    timeframePick:{en:'— Choose a timeframe —',th:'— เลือกไทม์เฟรม —'},
    timeframeOther:{en:'Other',th:'อื่นๆ'},
    timeframeOtherPh:{en:'e.g. 2H, 3D…',th:'เช่น 2H, 3D…'},
    needTimeframe:{en:'Choose a timeframe first.',th:'กรุณาเลือกไทม์เฟรมก่อน'},
    tradeLevelsH:{en:'Trade Setup (optional)',th:'จุดสำคัญของแผนเทรด (ไม่บังคับ)'},
    fieldBias:{en:'Bias',th:'แนวโน้ม'},
    biasUp:{en:'Uptrend',th:'ขาขึ้น'},
    biasDown:{en:'Downtrend',th:'ขาลง'},
    fieldInvalid:{en:'Invalidation (WC Invalid)',th:'จุดยกเลิกนับคลื่น (WC Invalid)'},
    fieldInvalidPh:{en:'Price level that invalidates the count',th:'ราคาที่ทำให้การนับคลื่นนี้ผิด'},
    fieldWaveView:{en:'Wave View (Anticipate)',th:'มุมมองคลื่น (Anticipate)'},
    fieldWaveViewPh:{en:'e.g. ABC correction, Wave 3 extension…',th:'เช่น ปรับฐาน ABC, คลื่น 3 ยืด…'},
    fieldSL:{en:'SL (Stop Loss)',th:'SL (จุดตัดขาดทุน)'},
    fieldSLPh:{en:'Stop-loss level',th:'ราคาตัดขาดทุน'},
    fieldTP:{en:'TP (Take Profit)',th:'TP (จุดทำกำไร)'},
    fieldTPPh:{en:'Target level',th:'ราคาเป้าหมาย'},
    fieldEntryPrice:{en:'Entry price (e.g. price on posting day)',th:'ราคาเข้า (เช่น ราคาวันที่โพสต์)'},
    fieldEntryPricePh:{en:'e.g. 4545.00',th:'เช่น 4545.00'},
    fieldPriceUnit:{en:'Show difference as',th:'แสดงผลต่างเป็น'},
    unitPoints:{en:'Points',th:'จุด'},
    unitPips:{en:'Pips (Forex)',th:'ปิ๊ป (Forex)'},
    unitPointsShort:{en:'pts',th:'จุด'},
    unitPipsShort:{en:'pips',th:'ปิ๊ป'},
    settingsH:{en:'Feed Display Settings',th:'ตั้งค่าการแสดงผลหน้าฟีด'},
    settingsShowLikers:{en:'Show who liked (names / photos / count) publicly',th:'แสดงชื่อ/รูป/จำนวนคนกดไลก์ ให้สาธารณะเห็น'},
    settingsShowLikersHint:{en:'The like button always stays clickable either way — this only hides who liked and how many.',th:'ปุ่มกดไลก์ยังกดได้เสมอ — ตัวเลือกนี้แค่ซ่อนว่าใครกดและกี่คน'},
    settingsStatsH:{en:'Header stats shown on the public feed',th:'สถิติด้านบนที่แสดงในหน้าฟีดสาธารณะ'},
    settingsSave:{en:'Save settings',th:'บันทึกการตั้งค่า'},
    settingsSaveOk:{en:'Settings saved.',th:'บันทึกการตั้งค่าแล้ว'},
    settingsSaveErr:{en:'Could not save settings — try again.',th:'บันทึกการตั้งค่าไม่สำเร็จ — ลองใหม่อีกครั้ง'},
    settingsSaveBadKey:{en:'Wrong admin key — try again.',th:'รหัสแอดมินไม่ถูกต้อง — ลองใหม่อีกครั้ง'},
    settingsKeyPrompt:{en:'Enter the admin key (same one used on Connected Users):',
                       th:'กรอกรหัสแอดมิน (รหัสเดียวกับที่ใช้ในหน้าผู้ใช้ที่เชื่อมต่อ LINE)'},
    tradeStatusOpen:{en:'Open',th:'กำลังเทรด'},
    tradeStatusTP:{en:'Took Profit',th:'ทำกำไรแล้ว'},
    tradeStatusSL:{en:'Hit SL',th:'โดน SL แล้ว'},
    exitPricePrompt:{en:'Exit price for this trade:',th:'ราคาปิดของรายการนี้:'},
    livePtsLabel:{en:'Since post',th:'นับตั้งแต่โพสต์'},
    beforeAfterBtn:{en:'Before/After',th:'Before/After'},
    notifyBtn:{en:'Publish via LINE',th:'เผยแพร่ผ่าน LINE'},
    notifyConfirm:{en:'Publish this analysis as a LINE broadcast to everyone who added your Official Account?',th:'เผยแพร่บทวิเคราะห์นี้เป็นข้อความไปหาทุกคนที่เพิ่มเพื่อน LINE OA ของคุณใช่ไหม?'},
    addLineFriend:{en:'Add LINE for analysis alerts',th:'แอด LINE รับแจ้งเตือนบทวิเคราะห์'},
    notifyOk:{en:'Published to LINE.',th:'เผยแพร่ผ่าน LINE เรียบร้อยแล้ว'},
    notifyErrKey:{en:'Enter your admin users key on the Connected Users page first, then come back to publish.',th:'กรุณาใส่รหัสแอดมินในหน้าผู้ใช้ที่เชื่อมต่อก่อน แล้วค่อยกลับมาเผยแพร่'},
    notifyErrConfig:{en:'LINE Messaging API is not configured on the server yet.',th:'ยังไม่ได้ตั้งค่า LINE Messaging API บนเซิร์ฟเวอร์'},
    notifyErr:{en:'Could not publish to LINE — try again.',th:'เผยแพร่ผ่าน LINE ไม่สำเร็จ — ลองใหม่อีกครั้ง'},

    sendLineBtn:{en:'Send to LINE',th:'ส่งเข้า LINE'},
    reportLineConfirm:{en:'Send this report as an image to everyone who added your LINE Official Account?',th:'ส่งรายงานนี้เป็นรูปภาพไปหาทุกคนที่เพิ่มเพื่อน LINE OA ของคุณใช่ไหม?'},
    reportLineRendering:{en:'Rendering image…',th:'กำลังแปลงเป็นรูปภาพ…'},
    reportLineUploading:{en:'Uploading…',th:'กำลังอัปโหลด…'},
    reportLineSending:{en:'Sending to LINE…',th:'กำลังส่งเข้า LINE…'},
    reportLineOk:{en:'Sent to LINE.',th:'ส่งเข้า LINE เรียบร้อยแล้ว'},
    reportLineErr:{en:'Could not send to LINE — try again.',th:'ส่งเข้า LINE ไม่สำเร็จ — ลองใหม่อีกครั้ง'},
    reportLineCaption:{en:'\ud83d\udcca New report from SPACEZ TERMINAL — see the image below.',th:'\ud83d\udcca รายงานใหม่จาก SPACEZ TERMINAL — ดูรูปภาพด้านล่าง'},
    notifyMsgTemplate:{en:'New analysis published: {asset}\n{url}',th:'เผยแพร่บทวิเคราะห์ใหม่: {asset}\n{url}'},
    /* Round M5: richer, text-only LINE broadcast teaser -- deliberately no
       image attached (user's explicit call: she wants the LINE message to
       stay a teaser so people log in and open the full post on the site,
       not see everything inside the LINE app itself). */
    notifyMsgHeadline:{en:'📢 New analysis just published!',th:'📢 เผยแพร่บทวิเคราะห์ใหม่แล้ว!'},
    notifyMsgAsset:{en:'Asset',th:'สินทรัพย์'},
    notifyMsgPublished:{en:'Published',th:'เผยแพร่เมื่อ'},
    notifyMsgCta:{en:'Full breakdown (entry, SL/TP, wave view) is live on the site now — tap in and see the whole picture:',th:'รายละเอียดเต็ม (จุดเข้า, SL/TP, มุมมองคลื่น) พร้อมดูบนเว็บแล้ว แตะเข้าไปดูกันได้เลย:'},
    baTitle:{en:'Before / After Report',th:'รายงานเปรียบเทียบ Before / After'},
    baPickBefore:{en:'"Before" post (older)',th:'โพสต์ "Before" (เก่ากว่า)'},
    baPickAfter:{en:'"After" post (newer)',th:'โพสต์ "After" (ใหม่กว่า)'},
    baPickPh:{en:'— Choose a post —',th:'— เลือกโพสต์ —'},
    baBeforePrice:{en:'Before price',th:'ราคา Before'},
    baAfterPrice:{en:'After price',th:'ราคา After'},
    baUnit:{en:'Unit',th:'หน่วย'},
    baGenerate:{en:'Generate report',th:'ออกรายงาน'},
    baDiff:{en:'Price change',th:'ราคาเปลี่ยนไป'},
    baBias:{en:'Bias',th:'มุมมอง'},
    baProfit:{en:'Profit / loss',th:'กำไร/ขาดทุน'},
    baNeedBoth:{en:'Choose both posts and enter both prices first.',th:'เลือกโพสต์ทั้งสองและใส่ราคาทั้งสองก่อน'},
    baBefore:{en:'Before',th:'Before'},
    baAfter:{en:'After',th:'After'},
    baPickEmpty:{en:'No posts yet.',th:'ยังไม่มีโพสต์'},
    baDaysElapsed:{en:'Days elapsed',th:'จำนวนวันที่ผ่านไป'},
    baPctChange:{en:'% change',th:'% การเปลี่ยนแปลง'},
    baModeManual:{en:'Enter manually',th:'กรอกเอง'},
    baModeReference:{en:'Reference post price',th:'อ้างอิงราคาโพสต์'},
    baModeReferenceHint:{en:'Auto-filled from each post’s saved Entry Price.',th:'ดึงมาจากช่อง "ราคาเข้า" ที่บันทึกไว้ตอนโพสต์ให้อัตโนมัติ'},
    baModeReferenceMissing:{en:'has no saved entry price — switch to manual for that side.',th:'ไม่มีราคาเข้าที่บันทึกไว้ — สลับไปกรอกเองสำหรับฝั่งนี้'},
    baPriceLabel:{en:'Price at the time',th:'ราคา ณ ตอนนั้น'},
    baIncludeNotes:{en:'Include each post’s analysis text in the report',th:'รวมข้อความบทวิเคราะห์ของแต่ละโพสต์ในรายงานด้วย'},

    adminNotice:{en:'Analysis posts are added by the site admin and its members only.',th:'บทวิเคราะห์ทั้งหมดเพิ่มโดยแอดมินและสมาชิกของเว็บไซต์เท่านั้น'},

    listFilterAllAsset:{en:'All assets',th:'ทุกสินทรัพย์'},
    listFilterEmpty:{en:'No entries match this filter.',th:'ไม่พบบทวิเคราะห์ตามตัวกรองนี้'},

    adminLikesNone:{en:'No likes yet',th:'ยังไม่มีคนกดไลก์'},
    adminLikesLoading:{en:'Loading likers…',th:'กำลังโหลดรายชื่อ…'},
    adminLikesUnknown:{en:'LINE user',th:'ผู้ใช้ LINE'},

    reportTimeframe:{en:'Timeframe',th:'ไทม์เฟรม'},
    reportInvalid:{en:'WC Invalid',th:'จุดยกเลิกนับคลื่น'},
    reportSL:{en:'SL',th:'SL'},
    reportTP:{en:'TP',th:'TP'},
    riskBarEntry:{en:'Entry',th:'จุดเข้า'},
    riskBarRR:{en:'R:R',th:'ผลตอบแทน:ความเสี่ยง'},
    reportWaveView:{en:'Wave View',th:'มุมมองคลื่น'},
    reportRelatedH:{en:'Related Market Data',th:'ข้อมูลตลาดที่เกี่ยวข้อง'},
    reportDxyLabel:{en:'US Dollar Index (DXY)',th:'ดัชนีดอลลาร์สหรัฐ (DXY)'},
    reportLiveSrc:{en:'Live quote, Yahoo Finance',th:'ราคาสด จาก Yahoo Finance'},
    livePtsTooltip:{en:'Entry {entry} · Live {now} (refreshes ~45s)',th:'ราคาเข้า {entry} · ราคาล่าสุด {now} (รีเฟรชทุก ~45 วิ)'},
    livePtsTooltipInitial:{en:'Entry {entry} · fetching live price…',th:'ราคาเข้า {entry} · กำลังดึงราคาล่าสุด…'},

    /* ---- Round Q phase 4: Institutional Briefing -- an auto-generated
       report (same .jrp-overlay/.jrp-sheet system as the other reports)
       that reads the same 11-gauge regime model + sector flow data the
       Turning Point Radar / Cockpit already compute, and turns it into a
       single plain-language briefing instead of a dashboard. Nothing here
       is new data -- see gatherBriefingData(). ---- */
    briefTitle:{en:'Institutional Briefing',th:'บรีฟฉบับสถาบัน'},
    briefSub:{en:'How institutional and fund desks read cross-asset signals — auto-generated from live data',
              th:'มุมมองแบบที่สถาบัน/กองทุนใหญ่ใช้อ่านสัญญาณข้ามสินทรัพย์ — สร้างอัตโนมัติจากข้อมูลสด'},
    briefCycleLbl:{en:'Cycle read',th:'ช่วงวัฏจักรตอนนี้'},
    briefReadH:{en:'The read',th:'สรุปภาพรวม'},
    briefSignalsH:{en:'Cross-asset signals · 11 gauges',th:'สัญญาณข้ามสินทรัพย์ · 11 ตัวชี้วัด'},
    briefRotH:{en:'Where the money is rotating · 1 month',th:'เงินกำลังหมุนไปทางไหน · 1 เดือน'},
    briefLeading:{en:'LEADING',th:'นำตลาด'},
    briefLagging:{en:'LAGGING',th:'ตามหลัง'},
    briefNoData:{en:'Live data has not finished loading yet — close this and try again in a few seconds.',
                 th:'ข้อมูลสดยังโหลดไม่เสร็จ — ปิดหน้าต่างนี้แล้วลองใหม่อีกครั้งในไม่กี่วินาที'},
    briefDisclaimer:{en:'Auto-generated from the same public price data and 11-gauge model used across this site — see Turning Point Radar for the full live dashboard and Proof Lab for how each gauge actually graded in a 30-year backtest (most graded C–F individually; read this as a cross-asset snapshot, not a forecast). Educational material, not investment advice.',
                      th:'สร้างอัตโนมัติจากข้อมูลราคาสาธารณะและโมเดล 11 ตัวชี้วัดชุดเดียวกับที่เว็บนี้ใช้ทั้งหมด — ดูแดชบอร์ดเต็มที่หน้า "สัญญาณเปลี่ยนทิศ" และผลเกรดจริงจากการทดสอบย้อนหลัง 30 ปีที่ "ห้องทดสอบ" (ส่วนใหญ่ได้เกรด C–F เมื่อดูทีละตัว — ให้อ่านหน้านี้เป็นภาพรวมข้ามสินทรัพย์ ณ ขณะนี้ ไม่ใช่การพยากรณ์) เนื้อหาเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'},
    briefVerdictCalm:{en:'{known} of the gauges institutional desks watch for early cracks are giving a clean read right now, with {soft} leaning cautious and none flashing red. Read together, the cross-asset picture looks orderly — the kind of backdrop where trends usually get more benefit of the doubt.',
                       th:'{known} ตัวชี้วัดที่สถาบัน/กองทุนใหญ่ใช้เฝ้าดูรอยร้าวล่วงหน้า ให้ผลที่ราบรื่นตอนนี้ มี {soft} ตัวเอียงระวัง และไม่มีตัวไหนขึ้นแดงเลย ภาพรวมข้ามสินทรัพย์ดูเป็นระเบียบ — บรรยากาศแบบนี้เทรนด์มักได้รับความเชื่อมั่นมากกว่าปกติ'},
    briefVerdictWatch:{en:'{alerts} signal(s) are flashing red and {soft} more are leaning the wrong way, out of {known} tracked. Nothing here is a timing call by itself, but it is the kind of mixed cross-asset picture where position size usually matters more than conviction.',
                        th:'{alerts} สัญญาณกำลังขึ้นแดง และอีก {soft} ตัวเอียงไปทางไม่ดี จากทั้งหมด {known} ตัวที่ติดตาม สิ่งนี้ไม่ใช่สัญญาณจับจังหวะในตัวมันเอง แต่เป็นภาพข้ามสินทรัพย์แบบผสมที่ขนาดการลงทุนมักสำคัญกว่าความมั่นใจ'},
    briefVerdictAlert:{en:'{alerts} of the {known} gauges institutions watch for stress are flashing red at once — a cluster this size is rare and worth taking seriously, even though no single one of these gauges can time a top. This is the kind of backdrop where knowing exactly what you own, and why, matters more than any one number here.',
                        th:'{alerts} จาก {known} ตัวชี้วัดที่สถาบันใช้เฝ้าดูความเครียดของตลาด ขึ้นแดงพร้อมกัน — กลุ่มสัญญาณขนาดนี้เกิดไม่บ่อยและควรให้ความสำคัญ แม้ตัวชี้วัดตัวเดียวจะบอกจุดสูงสุดไม่ได้ก็ตาม ช่วงแบบนี้การรู้ให้ชัดว่าตัวเองถืออะไรอยู่และเพราะอะไร สำคัญกว่าตัวเลขตัวไหนตัวหนึ่งในนี้'}
  };

  /* preset asset choices for the admin dropdown -- value is what gets stored
     (kept in English so filtering/matching stays consistent regardless of
     which language the admin was viewing in when they saved the entry) */
  var ASSET_PRESETS = [
    {v:'Gold', en:'Gold', th:'ทองคำ (Gold)'},
    {v:'Silver', en:'Silver', th:'เงิน (Silver)'},
    {v:'Bitcoin', en:'Bitcoin', th:'บิตคอยน์ (Bitcoin)'},
    {v:'Ethereum', en:'Ethereum', th:'อีเธอเรียม (Ethereum)'},
    {v:'DXY', en:'DXY (US Dollar Index)', th:'ดัชนีดอลลาร์ (DXY)'},
    {v:'S&P 500', en:'S&P 500', th:'เอสแอนด์พี 500 (S&P 500)'},
    {v:'Nasdaq 100', en:'Nasdaq 100', th:'แนสแด็ก 100 (Nasdaq 100)'},
    {v:'Dow Jones', en:'Dow Jones', th:'ดาวโจนส์ (Dow Jones)'},
    {v:'Oil (WTI)', en:'Oil (WTI)', th:'น้ำมัน WTI'},
    {v:'EUR/USD', en:'EUR/USD', th:'ยูโร/ดอลลาร์ (EUR/USD)'},
    {v:'SET Index', en:'SET Index (Thailand)', th:'ดัชนี SET'}
  ];
  var ASSET_OTHER_VAL = '__other__';

  /* Yahoo-ish symbols for the preset assets, used only to best-effort fetch a
     price-context sparkline for the published report -- never invented, and
     silently skipped if the fetch fails or the asset isn't one of these. */
  var ASSET_YAHOO_SYM = {
    'Gold':'GC=F', 'Silver':'SI=F', 'Bitcoin':'BTC-USD', 'Ethereum':'ETH-USD',
    'DXY':'DX-Y.NYB', 'S&P 500':'^GSPC', 'Nasdaq 100':'^NDX', 'Dow Jones':'^DJI',
    'Oil (WTI)':'CL=F', 'EUR/USD':'EURUSD=X'
  };

  /* ---- live "points since post" tracking --------------------------------
     Reuses window.__SPZ_LIVE.historyOfRaw() (same CORS-proxy/rate-limiter
     infra already relied on for the Print Report's price-context chart and
     DXY cross-reference) to fetch the latest close for the entry's mapped
     Yahoo symbol, never inventing a number for an unmapped/"Other" asset.
     A small shared cache + one interval keeps every visible card's live
     number fresh without one fetch per card per tick. */
  var LIVE_PTS_CACHE = {};
  var LIVE_PTS_TTL = 40000;
  /* Round P2: "Points" and "Pips" are broker tick units, not just a decimal-
     formatting choice -- on the gold/forex-style convention this site's admin
     dropdown uses, 1 point = 0.01 price units and 1 pip = 0.10 (10 points per
     pip), so a raw price difference has to be scaled up before display, not
     just re-rounded at a different number of decimals. Every place that shows
     a price delta under one of these two labels goes through this so a raw
     move of, say, -38.34 shows as -3834 pts / -383.4 pips, not -38.34 either
     way. */
  var UNIT_SCALE = { points: 100, pips: 10 };
  function scaleToUnit(raw, unit){ return raw * (UNIT_SCALE[unit === 'pips' ? 'pips' : 'points']); }
  function fmtUnitVal(raw, unit){
    var shown = scaleToUnit(raw, unit);
    return (shown >= 0 ? '+' : '') + shown.toFixed(unit === 'pips' ? 1 : 0);
  }
  function fetchLivePrice(sym){
    var c = LIVE_PTS_CACHE[sym];
    if(c && (Date.now() - c.ts) < LIVE_PTS_TTL) return Promise.resolve(c.price);
    if(!window.__SPZ_LIVE || typeof window.__SPZ_LIVE.historyOfRaw !== 'function') return Promise.resolve(null);
    function fromRows(rows){
      if(!Array.isArray(rows) || !rows.length) return null;
      var price = rows[rows.length - 1].c;
      LIVE_PTS_CACHE[sym] = { price: price, ts: Date.now() };
      return price;
    }
    return window.__SPZ_LIVE.historyOfRaw(sym, '1d', '5m').then(fromRows).catch(function(){
      return window.__SPZ_LIVE.historyOfRaw(sym, '5d', '1d').then(fromRows).catch(function(){ return null; });
    });
  }
  function paintLivePtsNode(node, diff, unit, entryPrice, livePrice){
    var unitLabel = unit === 'pips' ? T(UI.unitPipsShort) : T(UI.unitPointsShort);
    var val = node.querySelector('.jrnl-live-pts-val');
    if(!val) return;
    val.textContent = fmtUnitVal(diff, unit) + ' ' + unitLabel;
    node.classList.toggle('pos', diff >= 0);
    node.classList.toggle('neg', diff < 0);
    /* transparency for when the feed looks stale: hovering shows exactly
       which two numbers produced this delta, since the live quote only
       refreshes every ~45s and can lag a fast-moving market. */
    if(isFinite(entryPrice) && isFinite(livePrice)){
      node.title = T(UI.livePtsTooltip).replace('{entry}', entryPrice).replace('{now}', livePrice);
    }
  }
  function refreshLivePtsNodes(){
    var nodes = document.querySelectorAll('[data-live-pts-asset]');
    if(!nodes.length) return;
    var bySym = {};
    for(var i = 0; i < nodes.length; i++){
      var sym = nodes[i].getAttribute('data-live-pts-sym');
      (bySym[sym] = bySym[sym] || []).push(nodes[i]);
    }
    Object.keys(bySym).forEach(function(sym){
      fetchLivePrice(sym).then(function(price){
        if(price === null || price === undefined) return;
        bySym[sym].forEach(function(n){
          var entryPrice = parseFloat(n.getAttribute('data-live-pts-entry'));
          var unit = n.getAttribute('data-live-pts-unit') || 'points';
          var bias = n.getAttribute('data-live-pts-bias') || 'up';
          if(!isFinite(entryPrice)) return;
          var rawMove = price - entryPrice;
          var profit = bias === 'down' ? -rawMove : rawMove;
          paintLivePtsNode(n, profit, unit, entryPrice, price);
        });
      });
    });
  }
  setInterval(refreshLivePtsNodes, 45000);

  /* builds either a live-updating "N pts since post" chip (while the trade
     is still open and the asset is one of the mapped live symbols) or a
     static final profit/loss chip once the admin has marked the entry
     Took-Profit / Hit-SL -- returns '' whenever there's no entry price to
     compare against, so entries that never set one are unaffected. */
  function livePtsHtml(e){
    if(!e.entryPrice) return '';
    var entryPrice = parseFloat(e.entryPrice);
    if(!isFinite(entryPrice)) return '';
    var unit = e.priceUnit === 'pips' ? 'pips' : 'points';
    if(e.tradeStatus === 'tp' || e.tradeStatus === 'sl'){
      var exitPrice = parseFloat(e.exitPrice);
      if(!isFinite(exitPrice)) return '';
      /* Round P fix: tradeStatus already tells us the outcome (tp = win,
         sl = loss) regardless of which way the call was made or which
         direction the raw exitPrice-entryPrice subtraction happens to
         point -- a downtrend call that hits its (lower) TP would otherwise
         show as a negative/red number even though it's a win. Show the
         magnitude with the sign the outcome actually earned. */
      var magnitude = Math.abs(exitPrice - entryPrice);
      var diff = e.tradeStatus === 'tp' ? magnitude : -magnitude;
      var unitLabel = unit === 'pips' ? T(UI.unitPipsShort) : T(UI.unitPointsShort);
      var cls = e.tradeStatus === 'tp' ? 'tp' : 'sl';
      var label = e.tradeStatus === 'tp' ? T(UI.tradeStatusTP) : T(UI.tradeStatusSL);
      return '<div class="jrnl-live-pts final ' + cls + ' ' + (diff >= 0 ? 'pos' : 'neg') + '">' +
        '<span class="jrnl-live-pts-label">' + esc(label) + '</span>' +
        '<span class="jrnl-live-pts-val">' + esc(fmtUnitVal(diff, unit) + ' ' + unitLabel) + '</span>' +
      '</div>';
    }
    var sym = ASSET_YAHOO_SYM[e.asset];
    if(!sym) return '';
    /* Round P: bias travels with the node as a data attribute so the ~45s
       live-refresh loop below (which never re-reads the Firestore entry
       itself) can keep signing the delta correctly for a downtrend call. */
    var bias = e.bias === 'down' ? 'down' : 'up';
    return '<div class="jrnl-live-pts live" data-live-pts-asset data-live-pts-sym="' + esc(sym) + '" data-live-pts-entry="' + entryPrice + '" data-live-pts-unit="' + unit + '" data-live-pts-bias="' + bias + '" title="' + esc(T(UI.livePtsTooltipInitial).replace('{entry}', entryPrice)) + '">' +
      '<span class="jrnl-live-pts-label">' + esc(T(UI.livePtsLabel)) + '</span>' +
      '<span class="jrnl-live-pts-val">…</span>' +
    '</div>';
  }

  /* chart/analysis timeframe choices for the admin form -- same select+other
     pattern as the asset dropdown */
  var TIMEFRAME_PRESETS = ['5M','15M','1H','4H','1D','1W','1M'];
  var TIMEFRAME_OTHER_VAL = '__other__';

  /* assets where the US Dollar Index is the standard institutional cross-reference
     (see the site's own rate-cycle explainer) -- the published report fetches a
     live DXY quote only for these, and only ever shows a number it actually
     fetched; anything it can't verify (inflation %, policy rates) is left out
     rather than guessed, since there is no live feed for those on this site. */
  var DXY_RELATED_ASSETS = ['Gold', 'Silver'];

  function refPostLinkHtml(e){
    if(!e || !e.refPostId) return '';
    return '<a class="jrnl-refpost-link" href="' + esc(shareUrlFor(e.refPostId)) + '">' + esc(T(UI.refPostJump)) + '</a>';
  }
  function shareUrlFor(id){
    return location.origin + location.pathname + '?entry=' + encodeURIComponent(id) + '#/journalView';
  }

  /* ---- LINE Official Account broadcast, sent from the admin row action ----
     Deliberately NOT wired to the public-facing share button on the feed/
     single-post pages (that one is just "copy link" for any visitor) --
     only this Firebase-Auth-gated admin list can trigger it, and the Worker
     itself re-checks the X-Admin-Key header regardless. Reuses the exact
     admin-key sessionStorage slot the Connected Users page already reads/
     writes (spz_admin_users_key), so entering the key once on either admin
     page unlocks both. */
  var JOURNAL_WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var JOURNAL_ADMIN_KEY_STORAGE = 'spz_admin_users_key';

  /* Round K: "Add LINE for alerts" CTA shown under every public analysis
     post, so a reader who just found one post can immediately add the same
     Official Account the admin broadcasts new analyses to (handleAdminBroadcast
     above), instead of having to go hunting for it elsewhere on the site.
     Round M: filled in with the real Add-Friend link the user provided. */
  var LINE_OA_ADD_FRIEND_URL = 'https://lin.ee/vIGbf5v';
  function getSharedAdminKey(){
    try { return sessionStorage.getItem(JOURNAL_ADMIN_KEY_STORAGE) || ''; } catch(e){ return ''; }
  }
  /* Round M5: builds the LINE broadcast text -- a short, enticing teaser
     (headline + asset + timeframe + publish date/time + a come-to-the-site
     call-to-action) rather than a bare "New analysis published: X" line, so
     readers get just enough to want to tap through. Deliberately text-only:
     no image is attached (see notifyMsgHeadline/-Cta comment above), by the
     user's explicit choice, so the full chart/levels stay a reason to visit
     the site rather than something you can see without leaving LINE. */
  function buildBroadcastText(entry){
    var lines = [T(UI.notifyMsgHeadline), ''];
    lines.push(T(UI.notifyMsgAsset) + ': ' + (entry.asset || '—'));
    if(entry.timeframe) lines.push(T(UI.reportTimeframe) + ': ' + entry.timeframe);
    lines.push(T(UI.notifyMsgPublished) + ': ' + fmtDate(new Date()));
    lines.push('');
    lines.push(T(UI.notifyMsgCta));
    lines.push(shareUrlFor(entry.id));
    return lines.join('\n');
  }
  function sendJournalBroadcast(entry, btn){
    var key = getSharedAdminKey();
    if(!key){ window.alert(T(UI.notifyErrKey)); return; }
    if(!window.confirm(T(UI.notifyConfirm))) return;
    var text = buildBroadcastText(entry);
    if(btn) btn.disabled = true;
    fetch(JOURNAL_WORKER_BASE + '/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
      body: JSON.stringify({ text: text, imageUrl: '' })
    }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, data: d }; }); })
      .then(function(res){
        if(btn) btn.disabled = false;
        if(res.ok && res.data && res.data.ok){ window.alert(T(UI.notifyOk)); return; }
        if(res.data && res.data.error === 'messaging_not_configured'){ window.alert(T(UI.notifyErrConfig)); return; }
        window.alert(T(UI.notifyErr));
      }).catch(function(){
        if(btn) btn.disabled = false;
        window.alert(T(UI.notifyErr));
      });
  }

  /* Round Q: capture a .jrp-sheet report (the single-post report and the
     Before/After comparison report both use this exact markup, see
     buildJournalReport/renderBeforeAfterReport) as a PNG and send it through
     the same LINE broadcast worker endpoint sendJournalBroadcast already
     uses -- LINE's Messaging API has no generic "file" message type, so an
     image is the practical way to get a report into everyone's chat rather
     than only a text link. html2canvas is the same library part-39.js
     already lazy-loads for the watchlist share-card PNG download; loaded
     here too since each split module keeps its own small copy of this
     loader rather than reaching into another module's private scope --
     whichever module loads it first, window.html2canvas is then shared. */
  var reportHtml2CanvasLoading = null;
  function ensureReportHtml2Canvas(cb){
    if(window.html2canvas){ cb(); return; }
    if(reportHtml2CanvasLoading){ reportHtml2CanvasLoading.push(cb); return; }
    reportHtml2CanvasLoading = [cb];
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = function(){ var cbs = reportHtml2CanvasLoading; reportHtml2CanvasLoading = null; cbs.forEach(function(f){ f(); }); };
    s.onerror = function(){ var cbs = reportHtml2CanvasLoading; reportHtml2CanvasLoading = null; cbs.forEach(function(f){ f('error'); }); };
    document.head.appendChild(s);
  }

  function wireReportLineSend(ov){
    var actions = ov.querySelector('.jrp-actions');
    var sheet = ov.querySelector('.jrp-sheet');
    if(!actions || !sheet) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jrp-btn line';
    btn.setAttribute('data-jrp', 'line');
    btn.textContent = T(UI.sendLineBtn);
    var closeBtnEl = actions.querySelector('[data-jrp="close"]');
    actions.insertBefore(btn, closeBtnEl || null);
    var statusEl = document.createElement('span');
    statusEl.className = 'jrp-line-status';
    actions.appendChild(statusEl);

    btn.addEventListener('click', function(){
      var key = getSharedAdminKey();
      if(!key){ window.alert(T(UI.notifyErrKey)); return; }
      if(!cloudinaryConfigured()){ window.alert(T(UI.imgNotConfigured)); return; }
      if(!window.confirm(T(UI.reportLineConfirm))) return;
      btn.disabled = true;
      statusEl.textContent = T(UI.reportLineRendering);
      ensureReportHtml2Canvas(function(err){
        if(err || !window.html2canvas){ btn.disabled = false; statusEl.textContent = ''; window.alert(T(UI.reportLineErr)); return; }
        window.html2canvas(sheet, { backgroundColor:'#ffffff', scale:2, useCORS:true }).then(function(canvas){
          statusEl.textContent = T(UI.reportLineUploading);
          return new Promise(function(resolve, reject){
            /* LINE's Messaging API image message documents JPEG (max 10MB,
               4096x4096) -- html2canvas defaults to PNG, which some LINE
               clients render inconsistently, so convert explicitly here.
               The .jrp-sheet capture has no transparency (backgroundColor
               above is opaque white) so JPEG loses nothing meaningful. */
            canvas.toBlob(function(blob){ blob ? resolve(blob) : reject(new Error('toBlob failed')); }, 'image/jpeg', 0.92);
          });
        }).then(function(blob){
          return cloudinaryUpload(blob);
        }).then(function(url){
          statusEl.textContent = T(UI.reportLineSending);
          return fetch(JOURNAL_WORKER_BASE + '/api/admin/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
            body: JSON.stringify({ text: T(UI.reportLineCaption), imageUrl: url })
          }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, data: d }; }); });
        }).then(function(res){
          btn.disabled = false; statusEl.textContent = '';
          if(res.ok && res.data && res.data.ok){ window.alert(T(UI.reportLineOk)); return; }
          if(res.data && res.data.error === 'messaging_not_configured'){ window.alert(T(UI.notifyErrConfig)); return; }
          window.alert(T(UI.reportLineErr));
        }).catch(function(){
          btn.disabled = false; statusEl.textContent = '';
          window.alert(T(UI.reportLineErr));
        });
      });
    });
  }

  /* Same LINE/Telegram sessions the auth gate and Watchlist page already
     share via window.__SPZ_LINE / window.__SPZ_TG -- reused here, not
     re-implemented, so there is still only ever one login state per
     provider across the whole site. Both the feed (buildJournal) and the
     single-post view (buildJournalView) use isUnlocked() to decide whether
     to blur a card's image/text behind a "please log in" overlay;
     everything else about an entry (asset tag, date, tags, stats, filters)
     stays visible either way. Originally this only checked LINE, so a
     visitor signed in via Telegram (or as admin) saw the lock anyway --
     isUnlocked() now accepts any of the site's sign-in methods. */
  function lineLinked(){
    try { return !!(window.__SPZ_LINE && window.__SPZ_LINE.state && window.__SPZ_LINE.state().status === 'linked'); }
    catch(e){ return false; }
  }
  function tgLinked(){
    try { return !!(window.__SPZ_TG && window.__SPZ_TG.state && window.__SPZ_TG.state().status === 'linked'); }
    catch(e){ return false; }
  }
  function isUnlocked(){
    try { if(window.__SPZ_TIER && window.__SPZ_TIER() === 'full') return true; } catch(e){}
    return lineLinked() || tgLinked();
  }
  // The shared login gate (part-46.js) has every sign-in method in one
  // modal; open that instead of jumping straight to the LINE-only popup,
  // falling back to the LINE popup if the gate isn't available for some
  // reason (e.g. this module loaded standalone).
  function openLoginGate(){
    if(window.__SPZ_OPEN_GATE){ window.__SPZ_OPEN_GATE(); return; }
    if(window.__SPZ_LINE) window.__SPZ_LINE.open();
  }

  /* ======================= PUBLIC LOG ======================= */
  function buildJournal(){
    var sec = el('section');
    sec.id = 'journal';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-j="eb"></span></div>' +
        '<h2 data-j="h2"></h2><p class="lede" data-j="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div class="jrnl-stats" data-j="stats"></div>' +
      '<div class="jrnl-shell">' +
        '<aside class="jrnl-side">' +
          '<a class="jrnl-add" href="#/journalNew" data-route-to="journalNew" data-j="add"></a>' +
          '<div class="jrnl-filter-group">' +
            '<div class="jrnl-filter-label" data-j="filterAssetLbl"></div>' +
            '<div class="jrnl-tags" data-j="tags"></div>' +
          '</div>' +
          '<div class="jrnl-filter-group" data-j="tagFilterWrap" style="display:none;">' +
            '<div class="jrnl-filter-label" data-j="filterTagLbl"></div>' +
            '<div class="jrnl-tags" data-j="tagTags"></div>' +
          '</div>' +
          '<div class="jrnl-filter-group">' +
            '<div class="jrnl-filter-label" data-j="filterDateLbl"></div>' +
            '<div class="jrnl-date-row">' +
              '<input type="date" data-j="dateFilter">' +
              '<button type="button" class="jrnl-date-clear" data-j="dateClear">&times;</button>' +
            '</div>' +
          '</div>' +
        '</aside>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="jrnl-toolbar">' +
            '<input type="text" class="jrnl-search" data-j="search">' +
            '<button type="button" class="jrnl-sort-btn" data-j="sortBtn"></button>' +
          '</div>' +
          '<div class="jrnl-feed" data-j="feed"></div>' +
          '<div class="jrnl-admin-notice" data-j="adminNotice"></div>' +
        '</div>' +
      '</div>';

    var filter = { asset: 'all', tag: 'all', date: '' };
    var searchQ = '';
    var sortDir = 'desc';
    var entries = null; /* null = loading, 'error' = failed, array = loaded */

    function paintChrome(){
      sec.querySelector('[data-j="eb"]').textContent = T(UI.eb);
      sec.querySelector('[data-j="h2"]').textContent = T(UI.h2);
      sec.querySelector('[data-j="lede"]').textContent = T(UI.lede);
      sec.querySelector('[data-j="add"]').textContent = T(UI.addNew);
      sec.querySelector('[data-j="filterAssetLbl"]').textContent = T(UI.filterAsset);
      sec.querySelector('[data-j="filterTagLbl"]').textContent = T(UI.filterTag);
      sec.querySelector('[data-j="filterDateLbl"]').textContent = T(UI.filterDate);
      sec.querySelector('[data-j="search"]').placeholder = T(UI.searchPh);
      sec.querySelector('[data-j="sortBtn"]').textContent = sortDir === 'desc' ? T(UI.sortNewest) : T(UI.sortOldest);
      sec.querySelector('[data-j="adminNotice"]').textContent = T(UI.adminNotice);
    }

    function paintStats(){
      var host = sec.querySelector('[data-j="stats"]');
      if(!Array.isArray(entries) || !entries.length){ host.innerHTML = ''; return; }
      var sv = (journalSettingsCache && journalSettingsCache.statsVisible) || JOURNAL_SETTINGS_DEFAULT.statsVisible;
      var now = new Date();
      var thisMonth = entries.filter(function(e){
        return e.createdAt.getFullYear() === now.getFullYear() && e.createdAt.getMonth() === now.getMonth();
      }).length;
      var counts = {};
      entries.forEach(function(e){ if(e.asset) counts[e.asset] = (counts[e.asset] || 0) + 1; });
      var topAsset = Object.keys(counts).sort(function(a, b){ return counts[b] - counts[a]; })[0] || T(UI.statNoData);
      var graded = entries.filter(function(e){ return e.outcome === 'correct' || e.outcome === 'incorrect'; });
      var accuracy = graded.length ? Math.round(100 * graded.filter(function(e){ return e.outcome === 'correct'; }).length / graded.length) + '%' : T(UI.statNoData);
      function tile(n, l){ return '<div class="jrnl-stat"><div class="jrnl-stat-n">' + esc(n) + '</div><div class="jrnl-stat-l">' + esc(l) + '</div></div>'; }
      host.innerHTML =
        (sv.total !== false ? tile(entries.length, T(UI.statTotal)) : '') +
        (sv.month !== false ? tile(thisMonth, T(UI.statMonth)) : '') +
        (sv.top !== false ? tile(topAsset, T(UI.statTop)) : '') +
        (sv.accuracy !== false ? tile(accuracy, T(UI.statAccuracy)) : '');
    }

    function paintTags(){
      var host = sec.querySelector('[data-j="tags"]');
      if(!Array.isArray(entries)){ host.innerHTML = ''; return; }
      var uniq = [];
      entries.forEach(function(e){ if(e.asset && uniq.indexOf(e.asset) === -1) uniq.push(e.asset); });
      uniq.sort(function(a, b){ return a.localeCompare(b); });
      var html = '<button type="button" class="jrnl-tag' + (filter.asset === 'all' ? ' on' : '') + '" data-tag="all">' +
        '<span>' + esc(T(UI.allTag)) + '</span><span>' + entries.length + '</span></button>';
      uniq.forEach(function(a){
        var n = entries.filter(function(e){ return e.asset === a; }).length;
        html += '<button type="button" class="jrnl-tag' + (filter.asset === a ? ' on' : '') + '" data-tag="' + esc(a) + '">' +
          '<span>' + esc(a) + '</span><span>' + n + '</span></button>';
      });
      host.innerHTML = html;
      host.querySelectorAll('[data-tag]').forEach(function(btn){
        btn.addEventListener('click', function(){ filter.asset = btn.getAttribute('data-tag'); paintTags(); paintFeed(); });
      });
    }

    function paintTagFilters(){
      var wrap = sec.querySelector('[data-j="tagFilterWrap"]');
      var host = sec.querySelector('[data-j="tagTags"]');
      if(!Array.isArray(entries)){ wrap.style.display = 'none'; host.innerHTML = ''; return; }
      var uniq = [];
      entries.forEach(function(e){ (e.tags || []).forEach(function(t){ if(uniq.indexOf(t) === -1) uniq.push(t); }); });
      if(!uniq.length){ wrap.style.display = 'none'; host.innerHTML = ''; return; }
      wrap.style.display = '';
      uniq.sort(function(a, b){ return a.localeCompare(b); });
      var html = '<button type="button" class="jrnl-tag' + (filter.tag === 'all' ? ' on' : '') + '" data-tagf="all">' +
        '<span>' + esc(T(UI.allTag)) + '</span><span>' + entries.length + '</span></button>';
      uniq.forEach(function(t){
        var n = entries.filter(function(e){ return (e.tags || []).indexOf(t) !== -1; }).length;
        html += '<button type="button" class="jrnl-tag' + (filter.tag === t ? ' on' : '') + '" data-tagf="' + esc(t) + '">' +
          '<span>#' + esc(t) + '</span><span>' + n + '</span></button>';
      });
      host.innerHTML = html;
      host.querySelectorAll('[data-tagf]').forEach(function(btn){
        btn.addEventListener('click', function(){ filter.tag = btn.getAttribute('data-tagf'); paintTagFilters(); paintFeed(); });
      });
    }

    function wireDateFilter(){
      var input = sec.querySelector('[data-j="dateFilter"]');
      var clearBtn = sec.querySelector('[data-j="dateClear"]');
      input.value = filter.date;
      input.addEventListener('change', function(){ filter.date = input.value; paintFeed(); });
      clearBtn.addEventListener('click', function(){ filter.date = ''; input.value = ''; paintFeed(); });
    }

    function openLightbox(src){
      var ov = el('div', 'jrnl-lightbox', '');
      var img = document.createElement('img');
      img.src = src;
      ov.appendChild(img);
      ov.addEventListener('click', function(){ ov.remove(); });
      document.body.appendChild(ov);
    }

    function dateKey(d){
      /* local YYYY-MM-DD, to match an <input type="date"> value */
      var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), day = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + day;
    }

    function paintFeed(){
      var feed = sec.querySelector('[data-j="feed"]');
      if(!fbConfigured()){ feed.innerHTML = '<div class="jrnl-empty">' + esc(T(UI.notConfigured)) + '</div>'; return; }
      if(entries === null){ feed.innerHTML = '<div class="jrnl-empty">' + esc(T(UI.loading)) + '</div>'; return; }
      if(entries === 'error'){ feed.innerHTML = '<div class="jrnl-empty">' + esc(T(UI.loadError)) + '</div>'; return; }
      var q = (searchQ || '').trim().toLowerCase();
      var list = entries.filter(function(e){
        if(filter.asset !== 'all' && e.asset !== filter.asset) return false;
        if(filter.tag !== 'all' && (e.tags || []).indexOf(filter.tag) === -1) return false;
        if(filter.date && dateKey(e.createdAt) !== filter.date) return false;
        if(q){
          var hay = ((e.text || '') + ' ' + (e.asset || '') + ' ' + (e.tags || []).join(' ')).toLowerCase();
          if(hay.indexOf(q) === -1) return false;
        }
        return true;
      });
      list = list.slice().sort(function(a, b){
        if(!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        var diff = b.createdAt.getTime() - a.createdAt.getTime();
        return sortDir === 'desc' ? diff : -diff;
      });
      if(!list.length){ feed.innerHTML = '<div class="jrnl-empty">' + esc(T(UI.empty)) + '</div>'; return; }
      feed.innerHTML = '';
      list.forEach(function(e){
        var tagsHtml = (e.tags && e.tags.length)
          ? '<div class="jrnl-card-tags">' + e.tags.map(function(t){ return '<span class="jrnl-tag-chip">#' + esc(t) + '</span>'; }).join('') + '</div>'
          : '';
        var outcomeHtml = (e.outcome === 'correct' || e.outcome === 'incorrect')
          ? '<span class="jrnl-outcome-badge ' + e.outcome + '">' + esc(e.outcome === 'correct' ? T(UI.outcomeCorrect) : T(UI.outcomeIncorrect)) + '</span>'
          : '';
        /* the pin badge rides over the image as a corner ribbon when there is one;
           with no image to rest on, it sits inline next to the date instead so it
           never overlaps the card's own text */
        var pinBadgeHtml = e.pinned ? '<span class="jrnl-pin-badge' + (e.imageUrl ? '' : ' inline') + '">' + esc(T(UI.pinned)) + '</span>' : '';
        var locked = !isUnlocked();
        var card = el('div', 'jrnl-card' + (locked ? ' jrnl-locked' : ''),
          '<div class="' + (locked ? 'jrnl-locked-blur' : '') + '">' +
          (e.imageUrl ? (pinBadgeHtml + '<img class="jrnl-card-img" src="' + esc(e.imageUrl) + '" loading="lazy" alt="">') : '') +
          '<div class="jrnl-card-body">' +
            '<div class="jrnl-card-top"><span class="jrnl-card-asset">' + esc(e.asset || '—') + '</span>' +
            '<span style="display:flex;align-items:center;gap:8px;">' + (!e.imageUrl ? pinBadgeHtml : '') +
            '<span class="jrnl-card-date">' + esc(fmtDate(e.createdAt)) + '</span></span></div>' +
            (outcomeHtml ? '<div style="margin-top:6px;">' + outcomeHtml + '</div>' : '') +
            tagsHtml +
            cardLevelsHtml(e) +
            livePtsHtml(e) +
            '<div class="jrnl-card-text"></div>' +
            refPostLinkHtml(e) +
            '<div class="jrnl-card-actions">' + likeWrapHTML() + '<button type="button" class="jrnl-share-btn" data-share></button></div>' +
            addLineFriendBtnHTML() +
          '</div>' +
          '</div>' +
          (locked ?
            '<div class="jrnl-locked-overlay">' +
              '<div class="jrnl-locked-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></div>' +
              '<div class="jrnl-locked-msg"></div>' +
              '<button type="button" class="jrnl-locked-btn" data-line-login></button>' +
            '</div>' : ''));
        card.querySelector('.jrnl-card-text').textContent = locked ? '' : (e.text || '');
        if(locked){
          card.querySelector('.jrnl-locked-msg').textContent = T(UI.lineLockMsg);
          var lbtn = card.querySelector('.jrnl-locked-btn');
          lbtn.textContent = T(UI.lineLockBtn);
          lbtn.addEventListener('click', function(ev){ ev.stopPropagation(); openLoginGate(); });
          feed.appendChild(card);
          return; /* no share/like/lightbox wiring while content is locked */
        }
        card.querySelector('[data-share]').textContent = T(UI.share);
        card.querySelector('[data-share]').addEventListener('click', function(ev){
          ev.stopPropagation();
          location.href = shareUrlFor(e.id);
        });
        wireLike(card, e.id);
        if(e.imageUrl){
          var img = card.querySelector('.jrnl-card-img');
          img.addEventListener('click', function(){ openLightbox(e.imageUrl); });
        }
        feed.appendChild(card);
      });
      refreshLivePtsNodes();
    }

    function load(){
      if(!fbInit()){ entries = null; paintFeed(); return; }
      entries = null; paintFeed();
      loadJournalSettings(function(){ paintFeed(); paintStats(); });
      fbDb.collection('journal_entries').orderBy('createdAt', 'desc').limit(200).get().then(function(snap){
        entries = snap.docs.map(function(d){
          var v = d.data() || {};
          return {
            id: d.id, asset: v.asset || '', text: v.text || '', imageUrl: v.imageUrl || '',
            tags: Array.isArray(v.tags) ? v.tags : [],
            pinned: !!v.pinned,
            outcome: v.outcome || 'pending',
            bias: v.bias === 'down' ? 'down' : 'up',
            timeframe: v.timeframe || '', invalidPoint: v.invalidPoint || '',
            sl: v.sl || '', tp: v.tp || '', waveView: v.waveView || '',
            entryPrice: v.entryPrice || '', priceUnit: v.priceUnit || 'points',
            tradeStatus: v.tradeStatus || 'open', exitPrice: v.exitPrice || '',
            refPostId: v.refPostId || '',
            createdAt: v.createdAt && v.createdAt.toDate ? v.createdAt.toDate() : new Date()
          };
        });
        fbLastError = false;
        paintTags(); paintTagFilters(); paintFeed(); paintStats();
      }).catch(function(){ entries = 'error'; fbLastError = true; paintFeed(); });
    }

    function wireSearchSort(){
      var input = sec.querySelector('[data-j="search"]');
      var btn = sec.querySelector('[data-j="sortBtn"]');
      input.value = searchQ;
      input.addEventListener('input', function(){ searchQ = input.value; paintFeed(); });
      btn.addEventListener('click', function(){ sortDir = sortDir === 'desc' ? 'asc' : 'desc'; paintChrome(); paintFeed(); });
    }

    paintChrome();
    paintFeed();
    wireDateFilter();
    wireSearchSort();
    load();
    sec.__render = function(){ paintChrome(); paintTags(); paintTagFilters(); paintFeed(); paintStats(); };
    // unblur every card immediately on a successful LINE login (or re-blur
    // on logout) without a reload -- same event the auth gate/Watchlist
    // already dispatch on every state change.
    document.addEventListener('spz:line', function(){ paintFeed(); });
    document.addEventListener('spz:tg', function(){ paintFeed(); });
    // live-refresh the like visibility + stat tiles the moment the admin
    // saves a settings change, for anyone with this page open right now.
    document.addEventListener('spz:journalsettings', function(){ loadJournalSettings(function(){ paintFeed(); paintStats(); }); });
    return sec;
  }

  /* ======================= ENTRY REPORT (publish / print) =======================
     Independent of the site-wide Print Report module -- mirrors its header/footer/QR
     look via the .jrp-* CSS namespace and the shared window.__SPZ_PR_LOGO logo, but
     never touches that module's internals so it stays untouched. ============= */
  function svgLineChart(points, w, h){
    if(!Array.isArray(points) || points.length < 2) return '';
    var vals = points.map(function(p){ return p.c; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var range = (max - min) || 1;
    var stepX = w / (points.length - 1);
    var path = points.map(function(p, i){
      var x = i * stepX;
      var y = h - ((p.c - min) / range) * h;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var stroke = (vals[vals.length - 1] >= vals[0]) ? '#1a8f4c' : '#c0392b';
    return '<svg class="jrp-chart-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<path d="' + path + '" fill="none" stroke="' + stroke + '" stroke-width="2"/></svg>';
  }

  /* =================================================================
     Round Q phase 4: Institutional Briefing
     An auto-generated report -- same .jrp-overlay/.jrp-sheet shell and
     Send-to-LINE wiring as the other reports above, but built entirely
     from window.__SPZ_REGIME (the Turning Point Radar's own 11-gauge
     model, part-30.js) and window.__SPZ_LIVE's sector flow snapshot.
     No new data source, no manually-written copy each time -- every
     sentence is either a live number or the site's own already-authored
     gauge message (GAUGES[i].m[state]), reused rather than duplicated.
     ================================================================= */
  function fmtGaugeVal(g, val){
    if(val == null || typeof val !== 'number' || !isFinite(val)) return '—';
    var s = g.level ? val.toFixed(1) : ((val >= 0 ? '+' : '') + val.toFixed(1));
    return s + (g.unit || '');
  }

  function gatherBriefingData(){
    var REG = window.__SPZ_REGIME;
    if(!REG || typeof REG.snap !== 'function' || typeof REG.score !== 'function') return null;
    var snap = REG.snap();
    if(!snap || !snap.regime || !Object.keys(snap.regime).length) return null;
    var r = snap.regime;
    var gauges = REG.gauges || [];
    var sc = REG.score();
    if(!sc || !sc.states) return null;

    var rows = [];
    gauges.forEach(function(g, i){
      var state = sc.states[i];
      if(state === 'na') return;
      var val = g.v(r);
      rows.push({
        name: T(g.n), state: state, valStr: fmtGaugeVal(g, val),
        msg: (g.m && g.m[state]) ? T(g.m[state]) : ''
      });
    });

    var sectors = (snap.flows && Array.isArray(snap.flows.sector)) ? snap.flows.sector.slice() : [];
    sectors = sectors.filter(function(s){ return s && typeof s.m1 === 'number' && isFinite(s.m1); });
    sectors.sort(function(a, b){ return b.m1 - a.m1; });
    var leaders = sectors.slice(0, 3);
    var laggards = sectors.slice(-3).reverse();

    var cycleLabel = '';
    try { if(window.SPZ_CYCLE) cycleLabel = T(window.SPZ_CYCLE.label()); } catch(e){}

    var verdictKey = 'briefVerdictCalm';
    if(sc.alerts >= 3) verdictKey = 'briefVerdictAlert';
    else if(sc.alerts >= 1 || sc.soft >= 4) verdictKey = 'briefVerdictWatch';
    var verdict = T(UI[verdictKey])
      .replace('{known}', sc.known).replace('{soft}', sc.soft).replace('{alerts}', sc.alerts);

    return {
      rows: rows, leaders: leaders, laggards: laggards, cycleLabel: cycleLabel,
      verdict: verdict, generatedAt: snap.generated_at || null
    };
  }

  function briefingSignalRowHtml(row){
    return '<div class="jrp-sig-row">' +
      '<span class="jrp-sig-dot ' + esc(row.state) + '"></span>' +
      '<span class="jrp-sig-name">' + esc(row.name) + '</span>' +
      '<span class="jrp-sig-val">' + esc(row.valStr) + '</span>' +
      '<span class="jrp-sig-msg">' + esc(row.msg) + '</span>' +
    '</div>';
  }

  function briefingRotRowHtml(item, positive){
    var pct = (typeof item.m1 === 'number') ? ((item.m1 >= 0 ? '+' : '') + item.m1.toFixed(1) + '%') : '—';
    var nm = (item.en || item.th) ? T({ en:item.en, th:item.th }) : (item.sym || '—');
    return '<div class="jrp-rot-row ' + (positive ? 'up' : 'dn') + '">' +
      '<span class="jrp-rot-name">' + esc(nm) + (item.sym ? ' <span class="jrp-rot-sym">' + esc(item.sym) + '</span>' : '') + '</span>' +
      '<span class="jrp-rot-val">' + esc(pct) + '</span>' +
    '</div>';
  }

  function buildInstitutionalBriefingReport(){
    var existing = document.querySelector('.jrp-overlay');
    if(existing) existing.remove();

    var data = gatherBriefingData();

    var ov = el('div', 'jrp-overlay');
    ov.innerHTML =
      '<div class="jrp-actions">' +
        '<button type="button" class="jrp-btn primary" data-jrp="print"></button>' +
        '<button type="button" class="jrp-btn ghost" data-jrp="close"></button>' +
      '</div>' +
      '<div class="jrp-sheet">' +
        '<div class="jrp-head">' +
          (window.__SPZ_PR_LOGO ? '<img class="jrp-logo" src="' + window.__SPZ_PR_LOGO + '" alt="">' : '') +
          '<div class="jrp-brand">SPACEZ TERMINAL</div>' +
          '<div class="jrp-title">' + esc(T(UI.briefTitle)) + '</div>' +
          '<div class="jrp-sub">' + esc(T(UI.briefSub)) + '</div>' +
          '<div class="jrp-meta">' +
            (data && data.cycleLabel ? '<span>' + esc(T(UI.briefCycleLbl)) + ': ' + esc(data.cycleLabel) + '</span>' : '') +
            '<span>' + esc(T(UI.reportGenerated)) + ': ' + esc(fmtDate(new Date())) + '</span>' +
          '</div>' +
        '</div>' +
        '<div data-jrp="briefBody"></div>' +
        '<div class="jrp-foot"></div>' +
      '</div>';

    var body = ov.querySelector('[data-jrp="briefBody"]');
    if(!data){
      body.innerHTML = '<div class="jrp-text">' + esc(T(UI.briefNoData)) + '</div>';
    } else {
      var leadersHtml = data.leaders.map(function(s){ return briefingRotRowHtml(s, true); }).join('');
      var laggardsHtml = data.laggards.map(function(s){ return briefingRotRowHtml(s, false); }).join('');
      body.innerHTML =
        '<div class="jrp-sec-h">' + esc(T(UI.briefReadH)) + '</div>' +
        '<div class="jrp-text">' + esc(data.verdict) + '</div>' +
        '<div class="jrp-sec-h">' + esc(T(UI.briefSignalsH)) + '</div>' +
        '<div class="jrp-sig-list">' + data.rows.map(briefingSignalRowHtml).join('') + '</div>' +
        (data.leaders.length ? (
          '<div class="jrp-sec-h">' + esc(T(UI.briefRotH)) + '</div>' +
          '<div class="jrp-rot-grid">' +
            '<div class="jrp-rot-col"><div class="jrp-rot-lab up">' + esc(T(UI.briefLeading)) + '</div>' + leadersHtml + '</div>' +
            '<div class="jrp-rot-col"><div class="jrp-rot-lab dn">' + esc(T(UI.briefLagging)) + '</div>' + laggardsHtml + '</div>' +
          '</div>'
        ) : '');
    }

    ov.querySelector('.jrp-foot').textContent = T(UI.briefDisclaimer);
    ov.querySelector('[data-jrp="print"]').textContent = T(UI.printBtn);
    ov.querySelector('[data-jrp="close"]').textContent = T(UI.closeBtn);

    function onAfterPrint(){ document.body.classList.remove('spz-printing-journal'); }
    function closeReport(){
      document.body.classList.remove('spz-printing-journal');
      window.removeEventListener('afterprint', onAfterPrint);
      ov.remove();
    }
    window.addEventListener('afterprint', onAfterPrint);
    ov.querySelector('[data-jrp="print"]').addEventListener('click', function(){
      document.body.classList.add('spz-printing-journal');
      window.print();
    });
    ov.querySelector('[data-jrp="close"]').addEventListener('click', closeReport);
    wireReportLineSend(ov);

    document.body.appendChild(ov);
  }

  window.__SPZ_BRIEFING = { open: buildInstitutionalBriefingReport };

  function buildJournalReport(entry){
    var existing = document.querySelector('.jrp-overlay');
    if(existing) existing.remove();

    var qrSvg = '';
    try {
      var qr = qrcode(0, 'M');
      qr.addData(shareUrlFor(entry.id));
      qr.make();
      qrSvg = qr.createSvgTag({ cellSize:6, margin:0, scalable:true });
    } catch(e){}

    var tagsHtml = (entry.tags && entry.tags.length)
      ? entry.tags.map(function(t){ return '<span class="jrp-chip">#' + esc(t) + '</span>'; }).join('')
      : '';

    var levelParts = [];
    if(entry.timeframe) levelParts.push('<span><b>' + esc(T(UI.reportTimeframe)) + ':</b> ' + esc(entry.timeframe) + '</span>');
    if(entry.invalidPoint) levelParts.push('<span class="invalid"><b>' + esc(T(UI.reportInvalid)) + ':</b> ' + esc(entry.invalidPoint) + '</span>');
    if(entry.sl) levelParts.push('<span class="sl"><b>' + esc(T(UI.reportSL)) + ':</b> ' + esc(entry.sl) + '</span>');
    if(entry.tp) levelParts.push('<span class="tp"><b>' + esc(T(UI.reportTP)) + ':</b> ' + esc(entry.tp) + '</span>');
    if(entry.waveView) levelParts.push('<span><b>' + esc(T(UI.reportWaveView)) + ':</b> ' + esc(entry.waveView) + '</span>');
    var levelsHtml = levelParts.length ? '<div class="jrp-levels">' + levelParts.join('') + '</div>' : '';

    var ov = el('div', 'jrp-overlay');
    ov.innerHTML =
      '<div class="jrp-actions">' +
        '<button type="button" class="jrp-btn primary" data-jrp="print"></button>' +
        '<button type="button" class="jrp-btn ghost" data-jrp="close"></button>' +
      '</div>' +
      '<div class="jrp-sheet">' +
        '<div class="jrp-head">' +
          (window.__SPZ_PR_LOGO ? '<img class="jrp-logo" src="' + window.__SPZ_PR_LOGO + '" alt="">' : '') +
          '<div class="jrp-brand">SPACEZ TERMINAL</div>' +
          '<div class="jrp-title">' + esc(T(UI.reportTitle)) + '</div>' +
          '<div class="jrp-sub">' + esc(T(UI.reportSub)) + '</div>' +
          '<div class="jrp-meta">' +
            '<span>' + esc(T(UI.reportPosted)) + ': ' + esc(fmtDate(entry.createdAt)) + '</span>' +
            '<span>' + esc(T(UI.reportGenerated)) + ': ' + esc(fmtDate(new Date())) + '</span>' +
          '</div>' +
        '</div>' +
        (entry.imageUrl ? '<img class="jrp-img" src="' + esc(entry.imageUrl) + '" alt="">' : '') +
        '<div class="jrp-caption">' +
          '<span><b>' + esc(T(UI.reportAsset)) + ':</b> ' + esc(entry.asset || '—') + '</span>' +
          (tagsHtml ? '<span><b>' + esc(T(UI.reportTags)) + ':</b> ' + tagsHtml + '</span>' : '') +
        '</div>' +
        levelsHtml +
        '<div class="jrp-sec-h">' + esc(T(UI.fieldText)) + '</div>' +
        '<div class="jrp-text"></div>' +
        '<div data-jrp="chartSlot"></div>' +
        '<div data-jrp="relatedSlot"></div>' +
        '<div class="jrp-foot"></div>' +
        '<div class="jrp-qr-page">' +
          (window.__SPZ_PR_LOGO ? '<img class="jrp-qr-logo" src="' + window.__SPZ_PR_LOGO + '" alt="">' : '') +
          '<div class="jrp-qr-brand">SPACEZ TERMINAL</div>' +
          '<div class="jrp-qr-rule"></div>' +
          '<div class="jrp-qr-heading">' + esc(T(UI.reportQrHeading)) + '</div>' +
          '<div class="jrp-qr-sub">' + esc(T(UI.reportQrSub)) + '</div>' +
          '<div class="jrp-qr-code">' + qrSvg + '</div>' +
          '<div class="jrp-qr-caption">' + esc(T(UI.reportQrCaption)) + '</div>' +
          '<div class="jrp-qr-url">' + esc(shareUrlFor(entry.id)) + '</div>' +
        '</div>' +
      '</div>';

    ov.querySelector('.jrp-text').textContent = entry.text || '';
    ov.querySelector('.jrp-foot').textContent = T(UI.reportDisclaimer);
    ov.querySelector('[data-jrp="print"]').textContent = T(UI.printBtn);
    ov.querySelector('[data-jrp="close"]').textContent = T(UI.closeBtn);

    function onAfterPrint(){ document.body.classList.remove('spz-printing-journal'); }
    function closeReport(){
      document.body.classList.remove('spz-printing-journal');
      window.removeEventListener('afterprint', onAfterPrint);
      ov.remove();
    }
    window.addEventListener('afterprint', onAfterPrint);
    ov.querySelector('[data-jrp="print"]').addEventListener('click', function(){
      document.body.classList.add('spz-printing-journal');
      window.print();
    });
    ov.querySelector('[data-jrp="close"]').addEventListener('click', closeReport);
    wireReportLineSend(ov);

    document.body.appendChild(ov);

    /* best-effort price-context chart: only for the mapped asset list, silently
       skipped for "Other"/unmapped assets or if the fetch fails -- no invented data */
    var sym = ASSET_YAHOO_SYM[entry.asset];
    if(sym && window.__SPZ_LIVE && typeof window.__SPZ_LIVE.historyOfRaw === 'function'){
      window.__SPZ_LIVE.historyOfRaw(sym, '3mo', '1d').then(function(rows){
        if(!Array.isArray(rows) || rows.length < 2) return;
        var slot = ov.querySelector('[data-jrp="chartSlot"]');
        if(!slot) return;
        var first = rows[0].c, last = rows[rows.length - 1].c;
        var pct = first ? (((last - first) / first) * 100) : null;
        var pctStr = pct === null ? '' : ((pct >= 0 ? '+' : '') + pct.toFixed(2) + '%');
        slot.innerHTML =
          '<div class="jrp-sec-h">' + esc(T(UI.reportChartH)) + '</div>' +
          '<div class="jrp-chart-block">' +
            svgLineChart(rows, 640, 140) +
            '<div class="jrp-chart-axis"><span>' + esc(fmtDate(new Date(rows[0].t))) + '</span>' +
            '<span>' + esc(pctStr) + '</span>' +
            '<span>' + esc(fmtDate(new Date(rows[rows.length - 1].t))) + '</span></div>' +
          '</div>';
      }).catch(function(){});
    }

    /* best-effort related-market-data line: only a live DXY quote, only for the
       assets where the site's own material treats DXY as the standard cross-
       reference, and only ever a number actually fetched just now -- inflation
       or policy-rate figures aren't tracked live anywhere on this site, so they
       are left out entirely rather than guessed. */
    if(DXY_RELATED_ASSETS.indexOf(entry.asset) !== -1 && window.__SPZ_LIVE && typeof window.__SPZ_LIVE.historyOfRaw === 'function'){
      window.__SPZ_LIVE.historyOfRaw('DX-Y.NYB', '5d', '1d').then(function(rows){
        if(!Array.isArray(rows) || !rows.length) return;
        var slot = ov.querySelector('[data-jrp="relatedSlot"]');
        if(!slot) return;
        var last = rows[rows.length - 1].c;
        var prev = rows.length > 1 ? rows[rows.length - 2].c : null;
        var chgStr = (prev && last) ? ((((last - prev) / prev) * 100 >= 0) ? '+' : '') + (((last - prev) / prev) * 100).toFixed(2) + '%' : '';
        slot.innerHTML =
          '<div class="jrp-related">' +
            '<span><b>' + esc(T(UI.reportDxyLabel)) + ':</b> ' + last.toFixed(2) + (chgStr ? ' (' + esc(chgStr) + ')' : '') + '</span>' +
            '<span class="jrp-related-src">' + esc(T(UI.reportLiveSrc)) + '</span>' +
          '</div>';
      }).catch(function(){});
    }
  }

  /* ======================= ADMIN ADD / MANAGE ======================= */
  function buildJournalEdit(){
    var sec = el('section');
    sec.id = 'journalNew';
    sec.innerHTML =
      '<div class="section-head reveal">' +
        '<div class="eyebrow"><span class="cursor"></span><span data-je="eb"></span></div>' +
        '<h2 data-je="h2"></h2><p class="lede" data-je="lede"></p><div class="rule"></div>' +
      '</div>' +
      '<div data-je="body"></div>';

    function signInPanel(){
      var body = sec.querySelector('[data-je="body"]');
      body.innerHTML =
        '<div class="jed-panel">' +
          (fbConfigured() ? '' : '<div class="jed-msg err">' + esc(T(UI.notConfigured)) + '</div>') +
          '<div class="jed-field"><label>' + esc(T(UI.signInEmail)) + '</label><input type="email" data-je="email"></div>' +
          '<div class="jed-field"><label>' + esc(T(UI.signInPass)) + '</label><input type="password" data-je="pass"></div>' +
          '<button type="button" class="jed-btn" data-je="signin">' + esc(T(UI.signIn)) + '</button>' +
          '<div><button type="button" class="jed-forgot" data-je="forgot">' + esc(T(UI.forgotPass)) + '</button></div>' +
          '<div class="jed-msg" data-je="msg"></div>' +
        '</div>';
      var btn = body.querySelector('[data-je="signin"]');
      var msg = body.querySelector('[data-je="msg"]');
      btn.disabled = !fbConfigured();
      btn.addEventListener('click', function(){
        if(!fbInit()){ msg.className = 'jed-msg err'; msg.textContent = T(UI.notConfigured); return; }
        var email = body.querySelector('[data-je="email"]').value.trim();
        var pass = body.querySelector('[data-je="pass"]').value;
        if(!email || !pass) return;
        btn.disabled = true;
        msg.className = 'jed-msg'; msg.textContent = T(UI.signingIn);
        fbAuth.signInWithEmailAndPassword(email, pass).catch(function(){
          msg.className = 'jed-msg err'; msg.textContent = T(UI.signInErr);
        }).then(function(){ btn.disabled = false; });
      });
      body.querySelector('[data-je="forgot"]').addEventListener('click', function(){
        if(!fbInit()){ msg.className = 'jed-msg err'; msg.textContent = T(UI.notConfigured); return; }
        var email = body.querySelector('[data-je="email"]').value.trim();
        if(!email){ msg.className = 'jed-msg err'; msg.textContent = T(UI.forgotNeedEmail); return; }
        fbAuth.sendPasswordResetEmail(email).then(function(){
          msg.className = 'jed-msg ok'; msg.textContent = T(UI.forgotSent);
        }).catch(function(){
          msg.className = 'jed-msg err'; msg.textContent = T(UI.forgotErr);
        });
      });
    }

    function fileToDataURL(file, cb){
      var reader = new FileReader();
      reader.onload = function(){ cb(reader.result); };
      reader.readAsDataURL(file);
    }

    function jedDateKey(d){
      var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), day = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + day;
    }

    function loadOwnEntries(host, opts){
      opts = opts || {};
      var filter = opts.filter || { asset: 'all', date: '' };
      fbDb.collection('journal_entries').orderBy('createdAt', 'desc').limit(50).get().then(function(snap){
        var all = snap.docs.map(function(d){
          var v = d.data() || {};
          return {
            doc: d, v: v,
            entryObj: {
              id: d.id, asset: v.asset || '', text: v.text || '', imageUrl: v.imageUrl || '',
              tags: Array.isArray(v.tags) ? v.tags : [],
              pinned: !!v.pinned, outcome: v.outcome || 'pending',
              bias: v.bias === 'down' ? 'down' : 'up',
              timeframe: v.timeframe || '', invalidPoint: v.invalidPoint || '',
              sl: v.sl || '', tp: v.tp || '', waveView: v.waveView || '',
              entryPrice: v.entryPrice || '', priceUnit: v.priceUnit || 'points',
              tradeStatus: v.tradeStatus || 'open', exitPrice: v.exitPrice || '',
              refPostId: v.refPostId || '',
              createdAt: v.createdAt && v.createdAt.toDate ? v.createdAt.toDate() : new Date()
            }
          };
        });

        if(opts.onEntries) opts.onEntries(all);

        /* keep the asset filter dropdown in sync with whatever assets actually
           exist right now, without losing the admin's current selection */
        if(opts.filterEls){
          var assetSel = opts.filterEls.asset;
          var uniqAssets = [];
          all.forEach(function(r){ if(r.entryObj.asset && uniqAssets.indexOf(r.entryObj.asset) === -1) uniqAssets.push(r.entryObj.asset); });
          uniqAssets.sort(function(a, b){ return a.localeCompare(b); });
          var prevVal = assetSel.value || filter.asset;
          assetSel.innerHTML = '<option value="all">' + esc(T(UI.listFilterAllAsset)) + '</option>' +
            uniqAssets.map(function(a){ return '<option value="' + esc(a) + '">' + esc(a) + '</option>'; }).join('');
          assetSel.value = uniqAssets.indexOf(prevVal) !== -1 || prevVal === 'all' ? prevVal : 'all';
          filter.asset = assetSel.value;
        }

        var rows = all.filter(function(r){
          if(filter.asset !== 'all' && r.entryObj.asset !== filter.asset) return false;
          if(filter.date && jedDateKey(r.entryObj.createdAt) !== filter.date) return false;
          return true;
        });

        if(!all.length){ host.innerHTML = ''; return; }
        if(!rows.length){ host.innerHTML = '<div style="font-size:12px;color:var(--grey-dim);padding:10px 2px;">' + esc(T(UI.listFilterEmpty)) + '</div>'; return; }

        host.innerHTML = '';
        rows.forEach(function(r){
          var d = r.doc, v = r.v, entryObj = r.entryObj;
          var pinned = entryObj.pinned, outcome = entryObj.outcome, tradeStatus = entryObj.tradeStatus || 'open';
          var when = fmtDate(entryObj.createdAt);
          var tagsStr = entryObj.tags.length ? ' · ' + entryObj.tags.map(function(t){ return '#' + t; }).join(' ') : '';
          var row = el('div', 'jed-row',
            (v.imageUrl ? '<img src="' + esc(v.imageUrl) + '" alt="">' : '') +
            '<div class="jed-row-body"><div class="jed-row-asset">' + esc(v.asset || '—') +
              (entryObj.timeframe ? ' · ' + esc(entryObj.timeframe) : '') + '</div>' +
            '<div class="jed-row-text"></div>' +
            '<div class="jed-row-date">' + esc(when + tagsStr) + '</div></div>' +
            '<div class="jed-row-actions">' +
              '<button type="button" class="jed-row-btn" data-act="edit">' + esc(T(UI.edit)) + '</button>' +
              '<button type="button" class="jed-row-btn' + (pinned ? ' on' : '') + '" data-act="pin">' + esc(pinned ? T(UI.unpin) : T(UI.pin)) + '</button>' +
              '<div class="jed-outcome-group">' +
                '<button type="button" class="jed-row-btn' + (outcome === 'correct' ? ' on' : '') + '" data-act="correct">' + esc(T(UI.outcomeCorrect)) + '</button>' +
                '<button type="button" class="jed-row-btn' + (outcome === 'incorrect' ? ' on' : '') + '" data-act="incorrect">' + esc(T(UI.outcomeIncorrect)) + '</button>' +
              '</div>' +
              (entryObj.entryPrice ? (
              '<div class="jed-outcome-group">' +
                '<button type="button" class="jed-row-btn tp' + (tradeStatus === 'tp' ? ' on' : '') + '" data-act="tp">' + esc(T(UI.tradeStatusTP)) + '</button>' +
                '<button type="button" class="jed-row-btn sl' + (tradeStatus === 'sl' ? ' on' : '') + '" data-act="sl">' + esc(T(UI.tradeStatusSL)) + '</button>' +
              '</div>') : '') +
              '<button type="button" class="jed-row-btn" data-act="beforeAfter">' + esc(T(UI.beforeAfterBtn)) + '</button>' +
              '<button type="button" class="jed-row-btn notify" data-act="notify">' + esc(T(UI.notifyBtn)) + '</button>' +
              '<button type="button" class="jed-row-btn publish" data-act="publish">' + esc(T(UI.publish)) + '</button>' +
              '<button type="button" class="jed-row-btn" data-act="del">' + esc(T(UI.del)) + '</button>' +
              '<button type="button" class="jed-row-likes-btn" data-act="likes">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>' +
                '<span data-role="likesCount">0</span>' +
              '</button>' +
            '</div>' +
            '<div class="jed-row-likes-panel" data-role="likesPanel"></div>');
          row.querySelector('.jed-row-text').textContent = v.text || '';
          row.querySelector('[data-act="edit"]').addEventListener('click', function(){
            /* highlight this exact row to match the form's own editing
               border (see .jed-row.editing / .jed-panel.editing) so it's
               obvious which post the open form refers to. */
            var prev = host.querySelector('.jed-row.editing');
            if(prev) prev.classList.remove('editing');
            row.classList.add('editing');
            if(opts.onEdit) opts.onEdit(entryObj);
          });
          /* who-liked-this: fetch the public like count as soon as the row
             renders (so the badge shows a real number, not just "0"), then
             expand the avatar+name list on click, fetching once and caching. */
          (function(){
            var countEl = row.querySelector('[data-role="likesCount"]');
            var panelEl = row.querySelector('[data-role="likesPanel"]');
            var loaded = false, likeData = null;
            withLineApi(function(api){
              api.likesGet(d.id, function(err, data){
                if(err || !data) return;
                likeData = data;
                loaded = true;
                countEl.textContent = data.count || 0;
              });
            });
            function renderPanel(){
              if(!likeData || !likeData.likes || !likeData.likes.length){
                panelEl.className = 'jed-row-likes-panel open empty';
                panelEl.textContent = T(UI.adminLikesNone);
                return;
              }
              panelEl.className = 'jed-row-likes-panel open';
              panelEl.innerHTML = likeData.likes.map(function(l){
                return '<span class="jed-row-liker">' +
                  (l.pictureUrl ? '<img src="' + esc(l.pictureUrl) + '" alt="">' : '') +
                  '<span>' + esc(l.displayName || T(UI.adminLikesUnknown)) + '</span>' +
                '</span>';
              }).join('');
            }
            row.querySelector('[data-act="likes"]').addEventListener('click', function(){
              var isOpen = panelEl.classList.contains('open');
              if(isOpen){ panelEl.classList.remove('open'); return; }
              if(loaded){ panelEl.classList.add('open'); return; }
              panelEl.className = 'jed-row-likes-panel open empty';
              panelEl.textContent = T(UI.adminLikesLoading);
              withLineApi(function(api){
                api.likesGet(d.id, function(err, data){
                  loaded = true;
                  if(err || !data){ panelEl.textContent = T(UI.adminLikesNone); return; }
                  likeData = data;
                  countEl.textContent = data.count || 0;
                  renderPanel();
                });
              });
            });
          })();
          row.querySelector('[data-act="pin"]').addEventListener('click', function(){
            fbDb.collection('journal_entries').doc(d.id).update({ pinned: !pinned }).then(function(){ loadOwnEntries(host, opts); });
          });
          row.querySelector('[data-act="correct"]').addEventListener('click', function(){
            var next = outcome === 'correct' ? 'pending' : 'correct';
            fbDb.collection('journal_entries').doc(d.id).update({ outcome: next }).then(function(){ loadOwnEntries(host, opts); });
          });
          row.querySelector('[data-act="incorrect"]').addEventListener('click', function(){
            var next = outcome === 'incorrect' ? 'pending' : 'incorrect';
            fbDb.collection('journal_entries').doc(d.id).update({ outcome: next }).then(function(){ loadOwnEntries(host, opts); });
          });
          /* Took-Profit / Hit-SL trade status -- only rendered when this entry
             has an entry price set (nothing to compute a diff against
             otherwise). Clicking the already-active state clears it back to
             "open"; clicking the other one prompts for the exit price
             (pre-filled with the live quote when the asset is one of the
             mapped live symbols) and stores both fields together. */
          var tpBtn = row.querySelector('[data-act="tp"]');
          var slBtn = row.querySelector('[data-act="sl"]');
          function setTradeStatus(next){
            if(next === 'open'){
              fbDb.collection('journal_entries').doc(d.id).update({ tradeStatus: 'open', exitPrice: '' }).then(function(){ loadOwnEntries(host, opts); });
              return;
            }
            var sym = ASSET_YAHOO_SYM[entryObj.asset];
            function withDefault(defPrice){
              var ans = window.prompt(T(UI.exitPricePrompt), defPrice != null ? String(defPrice) : '');
              if(ans === null) return;
              var num = parseFloat(ans);
              if(!isFinite(num)) return;
              fbDb.collection('journal_entries').doc(d.id).update({ tradeStatus: next, exitPrice: String(num) }).then(function(){ loadOwnEntries(host, opts); });
            }
            if(sym) fetchLivePrice(sym).then(withDefault).catch(function(){ withDefault(null); });
            else withDefault(null);
          }
          if(tpBtn) tpBtn.addEventListener('click', function(){ setTradeStatus(tradeStatus === 'tp' ? 'open' : 'tp'); });
          if(slBtn) slBtn.addEventListener('click', function(){ setTradeStatus(tradeStatus === 'sl' ? 'open' : 'sl'); });
          row.querySelector('[data-act="beforeAfter"]').addEventListener('click', function(){
            if(opts.onBeforeAfter) opts.onBeforeAfter(entryObj);
          });
          row.querySelector('[data-act="notify"]').addEventListener('click', function(){
            sendJournalBroadcast(entryObj, row.querySelector('[data-act="notify"]'));
          });
          row.querySelector('[data-act="publish"]').addEventListener('click', function(){
            if(opts.onPublish) opts.onPublish(entryObj);
          });
          row.querySelector('[data-act="del"]').addEventListener('click', function(){
            if(!window.confirm(T(UI.delConfirm))) return;
            fbDb.collection('journal_entries').doc(d.id).delete().then(function(){ loadOwnEntries(host, opts); });
          });
          host.appendChild(row);
        });
      }).catch(function(e){ console.error('loadOwnEntries failed:', e && e.message); });
    }

    function entryPanel(){
      var body = sec.querySelector('[data-je="body"]');
      var assetOptionsHtml = '<option value="" disabled selected>' + esc(T(UI.assetPick)) + '</option>' +
        ASSET_PRESETS.map(function(a){ return '<option value="' + esc(a.v) + '">' + esc(L() === 'th' ? a.th : a.en) + '</option>'; }).join('') +
        '<option value="' + ASSET_OTHER_VAL + '">' + esc(T(UI.assetOther)) + '</option>';
      var tfOptionsHtml = '<option value="" disabled selected>' + esc(T(UI.timeframePick)) + '</option>' +
        TIMEFRAME_PRESETS.map(function(tf){ return '<option value="' + esc(tf) + '">' + esc(tf) + '</option>'; }).join('') +
        '<option value="' + TIMEFRAME_OTHER_VAL + '">' + esc(T(UI.timeframeOther)) + '</option>';
      body.innerHTML =
        '<button type="button" class="jed-signout" data-je="signout">' + esc(T(UI.signOut)) + '</button>' +
        '<div class="jed-settings-box" style="clear:both;">' +
          '<div class="jed-settings-h">' + esc(T(UI.settingsH)) + '</div>' +
          '<table class="jed-settings-table">' +
            '<tr><td>' + esc(T(UI.settingsShowLikers)) + '<div class="jed-settings-hint">' + esc(T(UI.settingsShowLikersHint)) + '</div></td>' +
              '<td><input type="checkbox" data-je="setShowLikers"></td></tr>' +
          '</table>' +
          '<div class="jed-settings-sub">' + esc(T(UI.settingsStatsH)) + '</div>' +
          '<table class="jed-settings-table">' +
            '<tr><td>' + esc(T(UI.statTotal)) + '</td><td><input type="checkbox" data-je="setStatTotal"></td></tr>' +
            '<tr><td>' + esc(T(UI.statMonth)) + '</td><td><input type="checkbox" data-je="setStatMonth"></td></tr>' +
            '<tr><td>' + esc(T(UI.statTop)) + '</td><td><input type="checkbox" data-je="setStatTop"></td></tr>' +
            '<tr><td>' + esc(T(UI.statAccuracy)) + '</td><td><input type="checkbox" data-je="setStatAccuracy"></td></tr>' +
          '</table>' +
          '<button type="button" class="jed-btn" data-je="settingsSave">' + esc(T(UI.settingsSave)) + '</button>' +
          '<span class="jed-msg" data-je="settingsMsg"></span>' +
        '</div>' +
        '<div class="jed-layout">' +
        '<div class="jed-panel">' +
          '<div class="jed-editing-flag" data-je="editingFlag" style="display:none;"></div>' +
          '<div class="jed-field"><label>' + esc(T(UI.fieldAsset)) + '</label>' +
            '<select data-je="assetSelect">' + assetOptionsHtml + '</select>' +
            '<input type="text" data-je="assetOther" placeholder="' + esc(T(UI.assetOtherPh)) + '" style="display:none;margin-top:8px;">' +
          '</div>' +
          '<div class="jed-field"><label>' + esc(T(UI.fieldTimeframe)) + '</label>' +
            '<select data-je="tfSelect">' + tfOptionsHtml + '</select>' +
            '<input type="text" data-je="tfOther" placeholder="' + esc(T(UI.timeframeOtherPh)) + '" style="display:none;margin-top:8px;">' +
          '</div>' +
          '<div class="jed-field"><label>' + esc(T(UI.fieldTags)) + '</label>' +
            '<input type="text" data-je="tags" placeholder="' + esc(T(UI.fieldTagsPh)) + '"></div>' +
          '<div class="jed-field"><label>' + esc(T(UI.fieldRefPost)) + '</label>' +
            '<select data-je="refPost"><option value="">' + esc(T(UI.refPostNone)) + '</option></select></div>' +
          '<div class="jed-tradelevels-h">' + esc(T(UI.tradeLevelsH)) + '</div>' +
          '<div class="jed-setup-grid">' +
            '<div class="jed-setup-col jed-setup-left">' +
              '<div class="jed-field"><label>' + esc(T(UI.fieldBias)) + '</label>' +
                '<div class="jed-bias-toggle" data-je="biasToggle">' +
                  '<button type="button" class="jed-bias-btn up active" data-bias="up">&#9650; ' + esc(T(UI.biasUp)) + '</button>' +
                  '<button type="button" class="jed-bias-btn down" data-bias="down">&#9660; ' + esc(T(UI.biasDown)) + '</button>' +
                '</div>' +
              '</div>' +
              '<div class="jed-field jed-lvl-invalid"><label>' + esc(T(UI.fieldInvalid)) + '</label>' +
                '<input type="text" data-je="invalid" placeholder="' + esc(T(UI.fieldInvalidPh)) + '"></div>' +
              '<div class="jed-field"><label>' + esc(T(UI.fieldWaveView)) + '</label>' +
                '<input type="text" data-je="waveView" placeholder="' + esc(T(UI.fieldWaveViewPh)) + '"></div>' +
            '</div>' +
            '<div class="jed-setup-col jed-setup-right">' +
              '<div class="jed-field jed-lvl-tp"><label>' + esc(T(UI.fieldTP)) + '</label>' +
                '<input type="text" data-je="tp" placeholder="' + esc(T(UI.fieldTPPh)) + '"></div>' +
              '<div class="jed-field"><label>' + esc(T(UI.fieldEntryPrice)) + '</label>' +
                '<input type="text" inputmode="decimal" data-je="entryPrice" placeholder="' + esc(T(UI.fieldEntryPricePh)) + '">' +
                '<select class="jed-priceunit-inline" data-je="priceUnit"><option value="points">' + esc(T(UI.unitPoints)) + '</option><option value="pips">' + esc(T(UI.unitPips)) + '</option></select>' +
              '</div>' +
              '<div class="jed-field jed-lvl-sl"><label>' + esc(T(UI.fieldSL)) + '</label>' +
                '<input type="text" data-je="sl" placeholder="' + esc(T(UI.fieldSLPh)) + '"></div>' +
            '</div>' +
          '</div>' +
          '<div class="jed-field"><label>' + esc(T(UI.fieldImage)) + '</label>' +
            '<div class="jed-drop" data-je="drop">' +
              '<input type="file" accept="image/*" class="jed-drop-input" data-je="file">' +
              '<div class="jed-drop-empty" data-je="dropEmpty">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 16V4M12 4l-4 4M12 4l4 4"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg>' +
                '<span data-je="dropText"></span>' +
              '</div>' +
              '<div class="jed-drop-filled" data-je="dropFilled" style="display:none;">' +
                '<img class="jed-preview" data-je="preview" alt="">' +
                '<button type="button" class="jed-drop-remove" data-je="remove">&times;</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="jed-field"><label>' + esc(T(UI.fieldText)) + '</label>' +
            '<textarea data-je="text"></textarea></div>' +
          '<button type="button" class="jed-btn" data-je="save">' + esc(T(UI.save)) + '</button>' +
          '<button type="button" class="jed-cancel-edit" data-je="cancelEdit" style="display:none;">' + esc(T(UI.cancelEdit)) + '</button>' +
          '<div class="jed-msg" data-je="msg"></div>' +
        '</div>' +
        '<div class="jed-listcol">' +
          '<div style="font-family:var(--mono);font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:var(--grey-dim);margin-bottom:10px;">' +
            esc(T(UI.yourEntries)) + '</div>' +
          '<div class="jed-list-filter">' +
            '<select data-je="filterAsset"><option value="all">' + esc(T(UI.listFilterAllAsset)) + '</option></select>' +
            '<input type="date" data-je="filterDate">' +
            '<button type="button" class="jed-list-filter-clear" data-je="filterClear">&times;</button>' +
          '</div>' +
          '<div class="jed-list" data-je="list"></div>' +
        '</div>' +
        '</div>';

      body.querySelector('[data-je="dropText"]').textContent = T(UI.dropHint);
      body.querySelector('[data-je="editingFlag"]').textContent = T(UI.editingFlag);
      body.querySelector('[data-je="cancelEdit"]').textContent = T(UI.cancelEdit);
      body.querySelector('[data-je="signout"]').addEventListener('click', function(){ fbAuth.signOut(); });

      /* feed display settings -- independent of the entry form below; a single
         settings/journal doc read fresh on every visit to this page so the
         checkboxes always reflect what's actually saved, never a stale guess */
      (function(){
        var cbLikers = body.querySelector('[data-je="setShowLikers"]');
        var cbTotal = body.querySelector('[data-je="setStatTotal"]');
        var cbMonth = body.querySelector('[data-je="setStatMonth"]');
        var cbTop = body.querySelector('[data-je="setStatTop"]');
        var cbAccuracy = body.querySelector('[data-je="setStatAccuracy"]');
        var saveBtn2 = body.querySelector('[data-je="settingsSave"]');
        var msg2 = body.querySelector('[data-je="settingsMsg"]');
        loadJournalSettings(function(s){
          cbLikers.checked = s.showLikers !== false;
          cbTotal.checked = s.statsVisible.total !== false;
          cbMonth.checked = s.statsVisible.month !== false;
          cbTop.checked = s.statsVisible.top !== false;
          cbAccuracy.checked = s.statsVisible.accuracy !== false;
        });
        saveBtn2.addEventListener('click', function(){
          var data = {
            showLikers: !!cbLikers.checked,
            statsVisible: {
              total: !!cbTotal.checked, month: !!cbMonth.checked,
              top: !!cbTop.checked, accuracy: !!cbAccuracy.checked
            }
          };
          var key = getSharedAdminKey();
          if(!key){
            key = (window.prompt(T(UI.settingsKeyPrompt)) || '').trim();
            if(!key) return;
            try { sessionStorage.setItem(JOURNAL_ADMIN_KEY_STORAGE, key); } catch(e){}
          }
          saveBtn2.disabled = true;
          fetch(JOURNAL_WORKER_BASE + '/api/admin/journal-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
            body: JSON.stringify(data)
          }).then(function(r){
            if(r.status === 401){
              try { sessionStorage.removeItem(JOURNAL_ADMIN_KEY_STORAGE); } catch(e){}
              msg2.className = 'jed-msg err'; msg2.textContent = T(UI.settingsSaveBadKey);
              saveBtn2.disabled = false;
              return null;
            }
            return r.ok ? r.json() : Promise.reject();
          }).then(function(res){
            if(!res) return; /* handled above (bad key) */
            journalSettingsCache = data;
            msg2.className = 'jed-msg ok'; msg2.textContent = T(UI.settingsSaveOk);
            saveBtn2.disabled = false;
            try { document.dispatchEvent(new CustomEvent('spz:journalsettings')); } catch(e){}
          }).catch(function(){
            msg2.className = 'jed-msg err'; msg2.textContent = T(UI.settingsSaveErr);
            saveBtn2.disabled = false;
          });
        });
      })();

      var assetSelect = body.querySelector('[data-je="assetSelect"]');
      var assetOther = body.querySelector('[data-je="assetOther"]');
      assetSelect.addEventListener('change', function(){
        assetOther.style.display = assetSelect.value === ASSET_OTHER_VAL ? 'block' : 'none';
      });

      var tfSelect = body.querySelector('[data-je="tfSelect"]');
      var tfOther = body.querySelector('[data-je="tfOther"]');
      tfSelect.addEventListener('change', function(){
        tfOther.style.display = tfSelect.value === TIMEFRAME_OTHER_VAL ? 'block' : 'none';
      });

      var refPostSelect = body.querySelector('[data-je="refPost"]');
      function populateRefPostOptions(all){
        if(!refPostSelect) return;
        var prevVal = refPostSelect.value;
        var opts2 = '<option value="">' + esc(T(UI.refPostNone)) + '</option>' + all
          .filter(function(r){ return r.entryObj.id !== editingId; })
          .map(function(r){
            var label = (r.entryObj.asset || '\u2014') + ' \u00b7 ' + fmtDate(r.entryObj.createdAt) +
              (r.entryObj.text ? ' \u00b7 ' + r.entryObj.text.slice(0, 40) : '');
            return '<option value="' + esc(r.entryObj.id) + '">' + esc(label) + '</option>';
          }).join('');
        refPostSelect.innerHTML = opts2;
        if(prevVal) refPostSelect.value = prevVal;
      }

      var listFilter = { asset: 'all', date: '' };
      var filterAssetSel = body.querySelector('[data-je="filterAsset"]');
      var filterDateInput = body.querySelector('[data-je="filterDate"]');
      var filterClearBtn = body.querySelector('[data-je="filterClear"]');
      var listOpts = { onEdit: function(e){ startEdit(e); }, onPublish: function(e){ buildJournalReport(e); }, onBeforeAfter: function(e){ buildBeforeAfterModal(e); }, onEntries: function(all){ populateRefPostOptions(all); }, filter: listFilter, filterEls: { asset: filterAssetSel } };
      filterAssetSel.addEventListener('change', function(){ listFilter.asset = filterAssetSel.value; loadOwnEntries(body.querySelector('[data-je="list"]'), listOpts); });
      filterDateInput.addEventListener('change', function(){ listFilter.date = filterDateInput.value; loadOwnEntries(body.querySelector('[data-je="list"]'), listOpts); });
      filterClearBtn.addEventListener('click', function(){ listFilter.date = ''; filterDateInput.value = ''; loadOwnEntries(body.querySelector('[data-je="list"]'), listOpts); });

      var drop = body.querySelector('[data-je="drop"]');
      var fileInput = body.querySelector('[data-je="file"]');
      var dropEmpty = body.querySelector('[data-je="dropEmpty"]');
      var dropFilled = body.querySelector('[data-je="dropFilled"]');
      var preview = body.querySelector('[data-je="preview"]');
      var pickedFile = null;
      var editingId = null;
      var editingImageUrl = '';
      var currentBias = 'up'; // 'up' | 'down' -- drives the profit sign on the live/before-after reports

      var biasToggleEl = body.querySelector('[data-je="biasToggle"]');
      function setBiasUI(val){
        currentBias = val === 'down' ? 'down' : 'up';
        if(!biasToggleEl) return;
        Array.prototype.forEach.call(biasToggleEl.querySelectorAll('[data-bias]'), function(b){
          b.classList.toggle('active', b.getAttribute('data-bias') === currentBias);
        });
      }
      if(biasToggleEl) biasToggleEl.addEventListener('click', function(ev){
        var btn = ev.target.closest('[data-bias]');
        if(btn) setBiasUI(btn.getAttribute('data-bias'));
      });

      function showPreview(file){
        pickedFile = file;
        editingImageUrl = '';
        fileToDataURL(file, function(url){
          preview.src = url;
          dropEmpty.style.display = 'none';
          dropFilled.style.display = 'block';
        });
      }
      function showExistingImage(url){
        pickedFile = null;
        editingImageUrl = url;
        preview.src = url;
        dropEmpty.style.display = 'none';
        dropFilled.style.display = 'block';
      }
      function clearPreview(){
        pickedFile = null;
        editingImageUrl = '';
        fileInput.value = '';
        preview.src = '';
        dropEmpty.style.display = 'flex';
        dropFilled.style.display = 'none';
      }

      fileInput.addEventListener('change', function(){
        var f = fileInput.files && fileInput.files[0] || null;
        if(f) showPreview(f); else clearPreview();
      });
      body.querySelector('[data-je="remove"]').addEventListener('click', function(ev){
        ev.stopPropagation();
        clearPreview();
      });
      drop.addEventListener('dragover', function(ev){ ev.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', function(){ drop.classList.remove('over'); });
      drop.addEventListener('drop', function(ev){
        ev.preventDefault();
        drop.classList.remove('over');
        var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
        if(f && /^image\//.test(f.type)) showPreview(f);
      });

      /* recently-used assets not already in the preset list, so old entries stay pickable */
      fbDb.collection('journal_entries').orderBy('createdAt', 'desc').limit(200).get().then(function(snap){
        var presetVals = ASSET_PRESETS.map(function(a){ return a.v; });
        var uniq = [];
        snap.docs.forEach(function(d){
          var a = (d.data() || {}).asset;
          if(a && presetVals.indexOf(a) === -1 && uniq.indexOf(a) === -1) uniq.push(a);
        });
        if(uniq.length){
          var og = document.createElement('optgroup');
          og.label = T(UI.assetRecent);
          uniq.forEach(function(a){
            var opt = document.createElement('option');
            opt.value = a; opt.textContent = a;
            og.appendChild(opt);
          });
          assetSelect.insertBefore(og, assetSelect.lastElementChild);
        }
      }).catch(function(){});

      var saveBtn = body.querySelector('[data-je="save"]');
      var cancelBtn = body.querySelector('[data-je="cancelEdit"]');
      var editingFlag = body.querySelector('[data-je="editingFlag"]');
      var msg = body.querySelector('[data-je="msg"]');
      var panelEl = body.querySelector('.jed-panel');

      function resetForm(){
        editingId = null;
        if(panelEl) panelEl.classList.remove('editing');
        var prevRow = sec.querySelector('.jed-row.editing');
        if(prevRow) prevRow.classList.remove('editing');
        assetSelect.value = ''; assetOther.value = ''; assetOther.style.display = 'none';
        tfSelect.value = ''; tfOther.value = ''; tfOther.style.display = 'none';
        body.querySelector('[data-je="tags"]').value = '';
        setBiasUI('up');
        body.querySelector('[data-je="invalid"]').value = '';
        body.querySelector('[data-je="waveView"]').value = '';
        body.querySelector('[data-je="sl"]').value = '';
        body.querySelector('[data-je="tp"]').value = '';
        body.querySelector('[data-je="entryPrice"]').value = '';
        body.querySelector('[data-je="priceUnit"]').value = 'points';
        body.querySelector('[data-je="text"]').value = '';
        if(refPostSelect) refPostSelect.value = '';
        clearPreview();
        saveBtn.textContent = T(UI.save);
        cancelBtn.style.display = 'none';
        editingFlag.style.display = 'none';
      }

      function startEdit(entry){
        editingId = entry.id;
        if(panelEl) panelEl.classList.add('editing');
        var presetVals = ASSET_PRESETS.map(function(a){ return a.v; });
        if(entry.asset && presetVals.indexOf(entry.asset) !== -1){
          assetSelect.value = entry.asset;
          assetOther.style.display = 'none'; assetOther.value = '';
        } else {
          assetSelect.value = ASSET_OTHER_VAL;
          assetOther.style.display = 'block';
          assetOther.value = entry.asset || '';
        }
        if(entry.timeframe && TIMEFRAME_PRESETS.indexOf(entry.timeframe) !== -1){
          tfSelect.value = entry.timeframe;
          tfOther.style.display = 'none'; tfOther.value = '';
        } else if(entry.timeframe){
          tfSelect.value = TIMEFRAME_OTHER_VAL;
          tfOther.style.display = 'block';
          tfOther.value = entry.timeframe;
        } else {
          tfSelect.value = ''; tfOther.style.display = 'none'; tfOther.value = '';
        }
        body.querySelector('[data-je="tags"]').value = (entry.tags || []).map(function(t){ return '#' + t; }).join(' ');
        setBiasUI(entry.bias === 'down' ? 'down' : 'up');
        body.querySelector('[data-je="invalid"]').value = entry.invalidPoint || '';
        body.querySelector('[data-je="waveView"]').value = entry.waveView || '';
        body.querySelector('[data-je="sl"]').value = entry.sl || '';
        body.querySelector('[data-je="tp"]').value = entry.tp || '';
        body.querySelector('[data-je="entryPrice"]').value = entry.entryPrice || '';
        body.querySelector('[data-je="priceUnit"]').value = entry.priceUnit || 'points';
        body.querySelector('[data-je="text"]').value = entry.text || '';
        if(refPostSelect) refPostSelect.value = entry.refPostId || '';
        if(entry.imageUrl) showExistingImage(entry.imageUrl); else clearPreview();
        saveBtn.textContent = T(UI.update);
        cancelBtn.style.display = 'inline-block';
        editingFlag.style.display = 'block';
        msg.className = 'jed-msg'; msg.textContent = '';
        body.scrollIntoView({ behavior:'smooth', block:'start' });
      }

      cancelBtn.addEventListener('click', function(){ resetForm(); });

      saveBtn.addEventListener('click', function(){
        var asset = assetSelect.value === ASSET_OTHER_VAL ? assetOther.value.trim() : (assetSelect.value || '');
        var timeframe = tfSelect.value === TIMEFRAME_OTHER_VAL ? tfOther.value.trim() : (tfSelect.value || '');
        var text = body.querySelector('[data-je="text"]').value.trim();
        var invalidPoint = body.querySelector('[data-je="invalid"]').value.trim();
        var waveView = body.querySelector('[data-je="waveView"]').value.trim();
        var sl = body.querySelector('[data-je="sl"]').value.trim();
        var tp = body.querySelector('[data-je="tp"]').value.trim();
        var entryPrice = body.querySelector('[data-je="entryPrice"]').value.trim();
        var priceUnit = body.querySelector('[data-je="priceUnit"]').value || 'points';
        var tagsRaw = body.querySelector('[data-je="tags"]').value.trim();
        var tags = tagsRaw ? tagsRaw.split(/[\s,]+/).map(function(t){ return t.replace(/^#/, '').toLowerCase(); }).filter(Boolean) : [];
        var refPostId = refPostSelect ? (refPostSelect.value || '') : '';
        /* dedupe */
        tags = tags.filter(function(t, i){ return tags.indexOf(t) === i; });
        var willHaveImage = !!(pickedFile || editingImageUrl);
        if(!timeframe){ msg.className = 'jed-msg err'; msg.textContent = T(UI.needTimeframe); return; }
        if(!willHaveImage && !text){ msg.className = 'jed-msg err'; msg.textContent = T(UI.needBoth); return; }
        if(pickedFile && !cloudinaryConfigured()){ msg.className = 'jed-msg err'; msg.textContent = T(UI.imgNotConfigured); return; }
        var wasEditing = !!editingId;
        var targetId = editingId;
        if(wasEditing && refPostId === targetId) refPostId = ''; /* a post can't reference itself */
        saveBtn.disabled = true;
        msg.className = 'jed-msg'; msg.textContent = wasEditing ? T(UI.updating) : T(UI.saving);

        function writeDoc(imageUrl){
          var data = {
            asset: asset, timeframe: timeframe, text: text, tags: tags, imageUrl: imageUrl || '',
            bias: currentBias, invalidPoint: invalidPoint, waveView: waveView, sl: sl, tp: tp,
            entryPrice: entryPrice, priceUnit: priceUnit, refPostId: refPostId
          };
          if(wasEditing){
            return fbDb.collection('journal_entries').doc(targetId).update(data);
          }
          data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          data.pinned = false;
          data.outcome = 'pending';
          data.tradeStatus = 'open';
          data.exitPrice = '';
          return fbDb.collection('journal_entries').add(data);
        }

        var work = pickedFile
          ? cloudinaryUpload(pickedFile).then(writeDoc)
          : writeDoc(wasEditing ? editingImageUrl : null);

        work.then(function(){
          msg.className = 'jed-msg ok'; msg.textContent = wasEditing ? T(UI.updateOk) : T(UI.saveOk);
          resetForm();
          saveBtn.disabled = false;
          loadOwnEntries(body.querySelector('[data-je="list"]'), listOpts);
        }).catch(function(){
          msg.className = 'jed-msg err'; msg.textContent = T(UI.saveErr);
          saveBtn.disabled = false;
        });
      });

      loadOwnEntries(body.querySelector('[data-je="list"]'), listOpts);
    }

    function paintChrome(){
      sec.querySelector('[data-je="eb"]').textContent = T(UI.editEb);
      sec.querySelector('[data-je="h2"]').textContent = T(UI.editH2);
      sec.querySelector('[data-je="lede"]').textContent = T(UI.editLede);
    }

    function render(){
      paintChrome();
      if(!fbInit()){ signInPanel(); return; }
      if(fbAuth.currentUser){ entryPanel(); } else { signInPanel(); }
    }

    render();
    if(fbInit()){ fbAuth.onAuthStateChanged(function(){ render(); }); }
    sec.__render = paintChrome;
    return sec;
  }

  /* ======================= BEFORE / AFTER COMPARISON REPORT =======================
     Admin-only, reached from the "Before/After" button on the Add/Manage Analysis
     row actions. Picks any two saved entries (not necessarily the clicked row --
     the clicked entry is only used to pre-fill "After"), pulls each one's image,
     and lets the admin type both prices by hand -- no price is ever assumed or
     invented. Renders through the same .jrp-* print-sheet look as buildJournalReport()
     above (shared header/footer/print button), but is otherwise fully independent
     of it and of the site-wide Print Report module. ============================= */
  function baFetchList(cb){
    if(!fbInit()){ cb([]); return; }
    fbDb.collection('journal_entries').orderBy('createdAt', 'desc').limit(100).get().then(function(snap){
      cb(snap.docs.map(function(d){
        var v = d.data() || {};
        return { id: d.id, asset: v.asset || '', imageUrl: v.imageUrl || '',
                 text: v.text || '', timeframe: v.timeframe || '', tags: v.tags || [],
                 bias: v.bias === 'down' ? 'down' : 'up',
                 entryPrice: v.entryPrice || '', priceUnit: v.priceUnit || 'points',
                 createdAt: v.createdAt && v.createdAt.toDate ? v.createdAt.toDate() : new Date() };
      }));
    }).catch(function(){ cb([]); });
  }

  function buildBeforeAfterModal(anchorEntry){
    var existing = document.querySelector('.jed-ba-overlay');
    if(existing) existing.remove();
    var ov = el('div', 'jed-ba-overlay', '');
    ov.innerHTML =
      '<div class="jed-ba-modal">' +
        '<div class="jed-ba-modal-h">' + esc(T(UI.baTitle)) + '</div>' +
        '<div class="jed-ba-pickgroup">' +
          '<label>' + esc(T(UI.baPickBefore)) + '</label>' +
          '<div class="jed-ba-pickgrid" data-ba="beforeGrid"></div>' +
        '</div>' +
        '<div class="jed-ba-pickgroup">' +
          '<label>' + esc(T(UI.baPickAfter)) + '</label>' +
          '<div class="jed-ba-pickgrid" data-ba="afterGrid"></div>' +
        '</div>' +
        '<div class="jed-ba-pricemode" data-ba="priceMode">' +
          '<button type="button" class="jed-ba-pricemode-btn active" data-mode="manual">' + esc(T(UI.baModeManual)) + '</button>' +
          '<button type="button" class="jed-ba-pricemode-btn" data-mode="reference">' + esc(T(UI.baModeReference)) + '</button>' +
        '</div>' +
        '<div class="jed-ba-pricemode-hint" data-ba="modeHint" style="display:none;"></div>' +
        '<div class="jed-ba-row">' +
          '<div class="jed-ba-field"><label>' + esc(T(UI.baBeforePrice)) + '</label><input type="text" inputmode="decimal" data-ba="beforePrice"></div>' +
          '<div class="jed-ba-field"><label>' + esc(T(UI.baAfterPrice)) + '</label><input type="text" inputmode="decimal" data-ba="afterPrice"></div>' +
          '<div class="jed-ba-field"><label>' + esc(T(UI.baUnit)) + '</label><select data-ba="unit"><option value="points">' + esc(T(UI.unitPoints)) + '</option><option value="pips">' + esc(T(UI.unitPips)) + '</option></select></div>' +
        '</div>' +
        '<label class="jed-ba-checkline"><input type="checkbox" data-ba="includeNotes" checked> <span>' + esc(T(UI.baIncludeNotes)) + '</span></label>' +
        '<div class="jed-ba-msg" data-ba="msg"></div>' +
        '<div class="jed-ba-actions">' +
          '<button type="button" class="jed-btn" data-ba="go">' + esc(T(UI.baGenerate)) + '</button>' +
          '<button type="button" class="jed-cancel-edit" data-ba="close" style="display:inline-block;">' + esc(T(UI.closeBtn)) + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.querySelector('[data-ba="close"]').addEventListener('click', function(){ ov.remove(); });
    ov.addEventListener('click', function(ev){ if(ev.target === ov) ov.remove(); });

    var beforeGrid = ov.querySelector('[data-ba="beforeGrid"]');
    var afterGrid = ov.querySelector('[data-ba="afterGrid"]');
    var listCache = [];
    var pickedBeforeId = '', pickedAfterId = '';
    var priceMode = 'manual';
    var beforePriceInput = ov.querySelector('[data-ba="beforePrice"]');
    var afterPriceInput = ov.querySelector('[data-ba="afterPrice"]');
    var unitSelect = ov.querySelector('[data-ba="unit"]');
    var modeHint = ov.querySelector('[data-ba="modeHint"]');

    /* "reference" mode pulls each price straight from that post's own saved
       Entry Price field instead of making the admin retype it -- falls back
       to a warning (not a silent zero) when a picked post never had one. */
    function applyReferencePrices(){
      if(priceMode !== 'reference') return;
      var beforeItem = null, afterItem = null;
      for(var i = 0; i < listCache.length; i++){
        if(listCache[i].id === pickedBeforeId) beforeItem = listCache[i];
        if(listCache[i].id === pickedAfterId) afterItem = listCache[i];
      }
      var missing = [];
      if(beforeItem){ if(beforeItem.entryPrice) beforePriceInput.value = beforeItem.entryPrice; else missing.push(T(UI.baBefore)); }
      if(afterItem){
        if(afterItem.entryPrice){ afterPriceInput.value = afterItem.entryPrice; unitSelect.value = afterItem.priceUnit === 'pips' ? 'pips' : 'points'; }
        else missing.push(T(UI.baAfter));
      }
      modeHint.className = 'jed-ba-pricemode-hint' + (missing.length ? ' warn' : '');
      modeHint.textContent = missing.length ? (missing.join(' / ') + ' ' + T(UI.baModeReferenceMissing)) : T(UI.baModeReferenceHint);
    }
    var modeBtns = ov.querySelectorAll('.jed-ba-pricemode-btn');
    for(var mi = 0; mi < modeBtns.length; mi++){
      modeBtns[mi].addEventListener('click', function(ev){
        priceMode = ev.currentTarget.getAttribute('data-mode');
        for(var j = 0; j < modeBtns.length; j++) modeBtns[j].classList.toggle('active', modeBtns[j] === ev.currentTarget);
        var manual = priceMode === 'manual';
        beforePriceInput.readOnly = !manual;
        afterPriceInput.readOnly = !manual;
        modeHint.style.display = manual ? 'none' : 'block';
        if(manual){ modeHint.textContent = ''; modeHint.className = 'jed-ba-pricemode-hint'; }
        else applyReferencePrices();
      });
    }

    function cardHtml(it){
      return '<div class="jed-ba-pickcard" data-id="' + esc(it.id) + '">' +
        (it.imageUrl ? '<img class="jed-ba-pickcard-thumb" src="' + esc(it.imageUrl) + '" alt="">' : '<div class="jed-ba-pickcard-thumb jed-ba-pickcard-noimg"></div>') +
        '<div class="jed-ba-pickcard-meta">' + esc(it.asset || '—') + '</div>' +
        '<div class="jed-ba-pickcard-date">' + esc(fmtDate(it.createdAt)) + '</div>' +
      '</div>';
    }
    function markSelected(grid, id){
      var cards = grid.querySelectorAll('.jed-ba-pickcard');
      for(var i = 0; i < cards.length; i++){
        if(cards[i].getAttribute('data-id') === id) cards[i].classList.add('selected');
        else cards[i].classList.remove('selected');
      }
    }
    function findCard(target, grid){
      var n = target;
      while(n && n !== grid){
        if(n.classList && n.classList.contains('jed-ba-pickcard')) return n;
        n = n.parentNode;
      }
      return null;
    }
    function wireGrid(grid, onPick){
      grid.addEventListener('click', function(ev){
        var card = findCard(ev.target, grid);
        if(!card) return;
        var id = card.getAttribute('data-id');
        markSelected(grid, id);
        onPick(id);
      });
    }
    wireGrid(beforeGrid, function(id){ pickedBeforeId = id; applyReferencePrices(); });
    wireGrid(afterGrid, function(id){ pickedAfterId = id; applyReferencePrices(); });

    baFetchList(function(list){
      listCache = list;
      var gridHtml = list.length ? list.map(cardHtml).join('') : '<div class="jed-ba-pickempty">' + esc(T(UI.baPickEmpty)) + '</div>';
      beforeGrid.innerHTML = gridHtml;
      afterGrid.innerHTML = gridHtml;
      if(anchorEntry && anchorEntry.id){
        pickedAfterId = anchorEntry.id;
        markSelected(afterGrid, pickedAfterId);
        for(var i = 0; i < list.length; i++){
          if(list[i].id === anchorEntry.id && i + 1 < list.length){ pickedBeforeId = list[i + 1].id; break; }
        }
        if(pickedBeforeId) markSelected(beforeGrid, pickedBeforeId);
      }
    });

    ov.querySelector('[data-ba="go"]').addEventListener('click', function(){
      var beforePrice = parseFloat(ov.querySelector('[data-ba="beforePrice"]').value);
      var afterPrice = parseFloat(ov.querySelector('[data-ba="afterPrice"]').value);
      var unit = ov.querySelector('[data-ba="unit"]').value || 'points';
      var msg = ov.querySelector('[data-ba="msg"]');
      if(!pickedBeforeId || !pickedAfterId || !isFinite(beforePrice) || !isFinite(afterPrice)){
        msg.className = 'jed-ba-msg err'; msg.textContent = T(UI.baNeedBoth); return;
      }
      var beforeItem = null, afterItem = null;
      for(var i = 0; i < listCache.length; i++){
        if(listCache[i].id === pickedBeforeId) beforeItem = listCache[i];
        if(listCache[i].id === pickedAfterId) afterItem = listCache[i];
      }
      if(!beforeItem || !afterItem) return;
      var includeNotes = !!ov.querySelector('[data-ba="includeNotes"]').checked;
      ov.remove();
      renderBeforeAfterReport(beforeItem, afterItem, beforePrice, afterPrice, unit, includeNotes);
    });
  }

  function renderBeforeAfterReport(beforeItem, afterItem, beforePrice, afterPrice, unit, includeNotes){
    var existing = document.querySelector('.jrp-overlay');
    if(existing) existing.remove();
    var diff = afterPrice - beforePrice; // the raw, factual price move -- never flipped
    var unitLabel = unit === 'pips' ? T(UI.unitPipsShort) : T(UI.unitPointsShort);
    /* Round P2: "points"/"pips" are broker tick units (1 point = 0.01 price
       units, 1 pip = 0.10 -- 10 points per pip), not just a decimal-format
       switch, so the raw price move has to be scaled up via fmtUnitVal()
       before display -- e.g. a raw move of -38.34 reads as -3834 pts, not
       -38.34 pts. */
    var diffStr = fmtUnitVal(diff, unit) + ' ' + unitLabel;
    var diffCls = diff >= 0 ? 'pos' : 'neg';
    var daysElapsed = Math.round((afterItem.createdAt - beforeItem.createdAt) / 86400000);
    if(!isFinite(daysElapsed) || daysElapsed < 0) daysElapsed = 0;
    var pctChange = beforePrice ? (diff / Math.abs(beforePrice)) * 100 : 0;
    var pctStr = (pctChange >= 0 ? '+' : '') + pctChange.toFixed(2) + '%';
    /* Round P: the "Before" post's own bias decides whether a falling price
       is a profit or a loss -- previously this report always treated a
       price drop as negative/red, which is backwards for a downtrend call
       that played out exactly as expected. Shown as its own clearly-labeled
       line, separate from the factual price-change figure above, so both
       "the price actually did X" and "that means Y profit for this call"
       are visible instead of conflating the two. */
    var isDown = beforeItem.bias === 'down';
    var profit = isDown ? -diff : diff;
    var profitStr = fmtUnitVal(profit, unit) + ' ' + unitLabel;
    var profitCls = profit >= 0 ? 'pos' : 'neg';
    var biasStr = (isDown ? '▼ ' : '▲ ') + T(isDown ? UI.biasDown : UI.biasUp);
    function sideCol(item, price, label, showBias){
      var tagsHtml = (item.tags && item.tags.length) ?
        '<div class="jrp-ba-tags">' + item.tags.map(function(t){ return '<span class="jrp-chip">' + esc(t) + '</span>'; }).join('') + '</div>' : '';
      /* Round P2: the admin picks per-report whether each side's analysis
         text/opinion is included at all -- omitted entirely (not just
         hidden) when unchecked, so a report meant to stay just the chart +
         numbers doesn't carry the write-up along with it. */
      var noteHtml = (includeNotes && item.text) ? '<div class="jrp-ba-note">' + esc(item.text) + '</div>' : '';
      var biasHtml = showBias ? '<div class="jrp-ba-bias ' + (isDown ? 'down' : 'up') + '">' + esc(T(UI.baBias)) + ': ' + esc(biasStr) + '</div>' : '';
      return '<div class="jrp-ba-col">' +
        '<div class="jrp-ba-label">' + esc(label) + '</div>' +
        (item.imageUrl ? '<img class="jrp-ba-img" src="' + esc(item.imageUrl) + '" alt="">' : '<div class="jrp-ba-noimg"></div>') +
        '<div class="jrp-ba-meta">' + esc((item.asset || '—') + ' · ' + fmtDate(item.createdAt) + (item.timeframe ? ' · ' + item.timeframe : '')) + '</div>' +
        tagsHtml + biasHtml +
        '<div class="jrp-ba-pricecap">' + esc(T(UI.baPriceLabel)) + '</div>' +
        '<div class="jrp-ba-price">' + esc(String(price)) + ' <span class="jrp-ba-priceunit">' + esc(unitLabel) + '</span></div>' +
        noteHtml +
      '</div>';
    }
    var ov = el('div', 'jrp-overlay', '');
    ov.innerHTML =
      '<div class="jrp-actions">' +
        '<button type="button" class="jrp-btn primary" data-jrp="print"></button>' +
        '<button type="button" class="jrp-btn ghost" data-jrp="close"></button>' +
      '</div>' +
      '<div class="jrp-sheet jrp-ba-sheet">' +
        '<div class="jrp-head">' +
          (window.__SPZ_PR_LOGO ? '<img class="jrp-logo" src="' + window.__SPZ_PR_LOGO + '" alt="">' : '') +
          '<div class="jrp-brand">SPACEZ TERMINAL</div>' +
          '<div class="jrp-title">' + esc(T(UI.baTitle)) + '</div>' +
          '<div class="jrp-meta"><span>' + esc(T(UI.reportGenerated)) + ': ' + esc(fmtDate(new Date())) + '</span></div>' +
        '</div>' +
        /* Round P3: the headline numbers (days elapsed / % change / price
           change / profit-loss) now sit right under the title, above the
           before-after image grid, so the answer to "what happened" doesn't
           require scrolling past both screenshots first -- as one unified
           row of formal stat tiles (see the .jrp-ba-stat* CSS) rather than
           the old full-width green/red bars. */
        '<div class="jrp-ba-stats">' +
          '<div class="jrp-ba-stat"><div class="jrp-ba-stat-label">' + esc(T(UI.baDaysElapsed)) + '</div><div class="jrp-ba-stat-val">' + daysElapsed + '</div></div>' +
          '<div class="jrp-ba-stat"><div class="jrp-ba-stat-label">' + esc(T(UI.baPctChange)) + '</div><div class="jrp-ba-stat-val ' + diffCls + '">' + esc(pctStr) + '</div></div>' +
          '<div class="jrp-ba-stat"><div class="jrp-ba-stat-label">' + esc(T(UI.baDiff)) + '</div><div class="jrp-ba-stat-val ' + diffCls + '">' + esc(diffStr) + '</div></div>' +
          '<div class="jrp-ba-stat headline ' + profitCls + '"><div class="jrp-ba-stat-label">' + esc(T(UI.baProfit)) + '</div><div class="jrp-ba-stat-val ' + profitCls + '">' + esc(profitStr) + '</div></div>' +
        '</div>' +
        '<div class="jrp-ba-grid">' +
          sideCol(beforeItem, beforePrice, T(UI.baBefore), true) +
          sideCol(afterItem, afterPrice, T(UI.baAfter), false) +
        '</div>' +
        '<div class="jrp-foot"></div>' +
      '</div>';
    ov.querySelector('.jrp-foot').textContent = T(UI.reportDisclaimer);
    ov.querySelector('[data-jrp="print"]').textContent = T(UI.printBtn);
    ov.querySelector('[data-jrp="close"]').textContent = T(UI.closeBtn);
    function onAfterPrint(){ document.body.classList.remove('spz-printing-journal'); }
    function closeReport(){
      document.body.classList.remove('spz-printing-journal');
      window.removeEventListener('afterprint', onAfterPrint);
      ov.remove();
    }
    window.addEventListener('afterprint', onAfterPrint);
    ov.querySelector('[data-jrp="print"]').addEventListener('click', function(){
      document.body.classList.add('spz-printing-journal');
      window.print();
    });
    ov.querySelector('[data-jrp="close"]').addEventListener('click', closeReport);
    wireReportLineSend(ov);
    document.body.appendChild(ov);
  }

  /* ======================= SHAREABLE SINGLE-ENTRY VIEW =======================
     Reached only via a direct link (?entry=<id>#/journalView) built by shareUrlFor() --
     never added to the hub/nav via window.__spzAddRoute, so it stays a "hidden" route
     the router can still reach directly (route() matches by literal element id). ===== */
  function buildJournalView(){
    var sec = el('section');
    sec.id = 'journalView';
    sec.innerHTML =
      '<div class="jrnl-view-shell">' +
        '<a class="jrnl-view-back" href="#/journal" data-route-to="journal" data-j="back"></a>' +
        '<div data-j="body"></div>' +
      '</div>';

    var loadedEntry = null; /* null = loading, 'error'/'notfound' = failed, object = loaded */

    function entryIdFromUrl(){
      try { return new URLSearchParams(location.search).get('entry'); } catch(e){ return null; }
    }

    function renderCard(e){
      var tagsHtml = (e.tags && e.tags.length)
        ? '<div class="jrnl-card-tags">' + e.tags.map(function(t){ return '<span class="jrnl-tag-chip">#' + esc(t) + '</span>'; }).join('') + '</div>'
        : '';
      var outcomeHtml = (e.outcome === 'correct' || e.outcome === 'incorrect')
        ? '<span class="jrnl-outcome-badge ' + e.outcome + '">' + esc(e.outcome === 'correct' ? T(UI.outcomeCorrect) : T(UI.outcomeIncorrect)) + '</span>'
        : '';
      var pinBadgeHtml = e.pinned ? '<span class="jrnl-pin-badge' + (e.imageUrl ? '' : ' inline') + '">' + esc(T(UI.pinned)) + '</span>' : '';
      var locked = !isUnlocked();
      var card = el('div', 'jrnl-card' + (locked ? ' jrnl-locked' : ''),
        '<div class="' + (locked ? 'jrnl-locked-blur' : '') + '">' +
        (e.imageUrl ? (pinBadgeHtml + '<img class="jrnl-card-img" src="' + esc(e.imageUrl) + '" loading="lazy" alt="">') : '') +
        '<div class="jrnl-card-body">' +
          '<div class="jrnl-card-top"><span class="jrnl-card-asset">' + esc(e.asset || '—') + '</span>' +
          '<span style="display:flex;align-items:center;gap:8px;">' + (!e.imageUrl ? pinBadgeHtml : '') +
          '<span class="jrnl-card-date">' + esc(fmtDate(e.createdAt)) + '</span></span></div>' +
          (outcomeHtml ? '<div style="margin-top:6px;">' + outcomeHtml + '</div>' : '') +
          tagsHtml +
          cardLevelsHtml(e) +
          livePtsHtml(e) +
          '<div class="jrnl-card-text"></div>' +
          refPostLinkHtml(e) +
          '<div class="jrnl-card-actions">' + likeWrapHTML() + '<button type="button" class="jrnl-share-btn" data-share></button></div>' +
        '</div>' +
        '</div>' +
        (locked ?
          '<div class="jrnl-locked-overlay">' +
            '<div class="jrnl-locked-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></div>' +
            '<div class="jrnl-locked-msg"></div>' +
            '<button type="button" class="jrnl-locked-btn" data-line-login></button>' +
          '</div>' : ''));
      card.querySelector('.jrnl-card-text').textContent = locked ? '' : (e.text || '');
      if(locked){
        card.querySelector('.jrnl-locked-msg').textContent = T(UI.lineLockMsg);
        var lb = card.querySelector('.jrnl-locked-btn');
        lb.textContent = T(UI.lineLockBtn);
        lb.addEventListener('click', function(){ openLoginGate(); });
        return card; /* no like/share/lightbox wiring while content is locked */
      }
      wireLike(card, e.id);
      var shareBtn = card.querySelector('[data-share]');
      shareBtn.textContent = T(UI.share);
      shareBtn.addEventListener('click', function(ev){
        ev.stopPropagation();
        var url = shareUrlFor(e.id);
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(function(){
            shareBtn.textContent = T(UI.shareCopied);
            setTimeout(function(){ shareBtn.textContent = T(UI.share); }, 1800);
          }).catch(function(){});
        }
      });
      if(e.imageUrl){
        var img = card.querySelector('.jrnl-card-img');
        img.addEventListener('click', function(){
          var ov = el('div', 'jrnl-lightbox', '');
          var im = document.createElement('img');
          im.src = e.imageUrl;
          ov.appendChild(im);
          ov.addEventListener('click', function(){ ov.remove(); });
          document.body.appendChild(ov);
        });
      }
      return card;
    }

    function paint(){
      var backLink = sec.querySelector('[data-j="back"]');
      if(backLink) backLink.textContent = T(UI.backToLog);
      var body = sec.querySelector('[data-j="body"]');
      if(!body) return;
      if(!fbConfigured()){ body.innerHTML = '<div class="jrnl-empty">' + esc(T(UI.notConfigured)) + '</div>'; return; }
      var id = entryIdFromUrl();
      if(!id){ body.innerHTML = '<div class="jrnl-view-notfound">' + esc(T(UI.notFound)) + '</div>'; return; }
      if(loadedEntry === null){ body.innerHTML = '<div class="jrnl-empty">' + esc(T(UI.loading)) + '</div>'; return; }
      if(loadedEntry === 'error' || loadedEntry === 'notfound'){ body.innerHTML = '<div class="jrnl-view-notfound">' + esc(T(UI.notFound)) + '</div>'; return; }
      body.innerHTML = '';
      body.appendChild(renderCard(loadedEntry));
      refreshLivePtsNodes();
    }

    function load(){
      var id = entryIdFromUrl();
      if(!id || !fbInit()){ paint(); return; }
      loadedEntry = null; paint();
      loadJournalSettings(function(){ paint(); });
      fbDb.collection('journal_entries').doc(id).get().then(function(doc){
        if(!doc.exists){ loadedEntry = 'notfound'; paint(); return; }
        var v = doc.data() || {};
        loadedEntry = {
          id: doc.id, asset: v.asset || '', text: v.text || '', imageUrl: v.imageUrl || '',
          tags: Array.isArray(v.tags) ? v.tags : [],
          pinned: !!v.pinned, outcome: v.outcome || 'pending',
          bias: v.bias === 'down' ? 'down' : 'up',
          timeframe: v.timeframe || '', invalidPoint: v.invalidPoint || '',
          sl: v.sl || '', tp: v.tp || '', waveView: v.waveView || '',
          entryPrice: v.entryPrice || '', priceUnit: v.priceUnit || 'points',
          tradeStatus: v.tradeStatus || 'open', exitPrice: v.exitPrice || '',
          refPostId: v.refPostId || '',
          createdAt: v.createdAt && v.createdAt.toDate ? v.createdAt.toDate() : new Date()
        };
        fbLastError = false;
        paint();
      }).catch(function(){ loadedEntry = 'error'; fbLastError = true; paint(); });
    }

    paint();
    load();
    sec.__render = function(){ paint(); };
    // unblur immediately on a successful LINE login (or re-blur on logout)
    // without needing a reload -- same event the auth gate/Watchlist already
    // dispatch on every state change.
    document.addEventListener('spz:line', function(){ paint(); });
    document.addEventListener('spz:tg', function(){ paint(); });
    document.addEventListener('spz:journalsettings', function(){ loadJournalSettings(function(){ paint(); }); });
    return sec;
  }

  /* ======================= BOOT ======================= */
  function boot(){
    if(document.getElementById('journal')) return;

    var jr = buildJournal();
    jr.setAttribute('data-route', 'journal');
    document.body.appendChild(jr);
    if(window.__spzAddRoute){
      window.__spzAddRoute({
        id:'journal', after:'directory',
        t:{en:'Asset Analysis Log',th:'บทวิเคราะห์สินทรัพย์'},
        d:{en:'Your own running log of calls on stocks, gold, crypto and more — screenshot, reasoning and the date, filed by asset.',
           th:'บันทึกบทวิเคราะห์ของคุณเอง ทั้งหุ้น ทองคำ คริปโต และอื่นๆ พร้อมภาพ เหตุผล และวันที่ แยกตามสินทรัพย์'}
      });
    }

    var je = buildJournalEdit();
    je.setAttribute('data-route', 'journalNew');
    document.body.appendChild(je);
    /* deliberately NOT registered via window.__spzAddRoute -- this used to be its
       own top-level main-menu item, but an admin-only add-entry form doesn't need
       to sit in the public menu for everyone to see. It's still the exact same
       route (still admin-gated by LOCKED_ROUTES, still not in MEMBER_ROUTES), just
       reached instead via the "+ New entry" link already on the journal page and
       the "+ Add Analysis" shortcut in the admin sign-in panel (see the auth-gate
       module's #cagAdminLinks). */

    var jv = buildJournalView();
    jv.setAttribute('data-route', 'journalView');
    document.body.appendChild(jv);
    /* deliberately NOT registered via window.__spzAddRoute -- reachable only via a
       shared link, never shown in the hub/nav */

    /* The core router always boots to 'home' first and only fixes up the
       incoming hash for a session that's already "fresh" within the last
       few hours (see restoreRoute() near the top of the page) -- by design,
       a cold/stale visit otherwise lands on home. A journalView link is
       different: it's meant to be opened cold, e.g. from a social post, by
       someone who has never been to the site before. So it gets its own
       always-on fix-up here, scoped to just this one route, once this
       section actually exists in the DOM -- nothing else on the site changes. */
    if(window.__spzEntryHash === '#/journalView' && location.hash !== '#/journalView'){
      location.hash = '#/journalView';
    }

    new MutationObserver(function(){
      if(jr.__render) try { jr.__render(); } catch(e){}
      if(je.__render) try { je.__render(); } catch(e){}
      if(jv.__render) try { jv.__render(); } catch(e){}
    }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 50); });
  else setTimeout(boot, 50);
})();
