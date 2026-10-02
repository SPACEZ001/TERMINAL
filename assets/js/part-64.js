
/* ============================================================================
   SPACEZ TERMINAL -- ROUND U (#205): FACEBOOK + GOOGLE LOGIN (prepared now,
   placeholder credentials, ready to plug in real ones later)

   Unlike LINE (part-39.js) and Telegram (part-61.js), which both relay
   through her Cloudflare Worker because the login happens on a *different*
   device (scan a QR on your phone), Facebook Login and Google Identity
   Services are both entirely client-side flows: each provider's own JS SDK
   opens its own popup right in this browser tab and hands back a profile
   directly, no Worker involved at all. So this file needs ZERO backend
   changes -- once real credentials are dropped into the two constants
   below, both buttons work immediately.

   PLACEHOLDER CREDENTIALS -- replace these two before going live:
     FB_APP_ID        -- create a Facebook App at developers.facebook.com,
                         add the "Facebook Login" product, and under
                         Settings > Basic add this site's real domain(s)
                         (spacez001.github.io and the Workers domain).
     GOOGLE_CLIENT_ID -- create an OAuth 2.0 Client ID (Web application) at
                         console.cloud.google.com > APIs & Services >
                         Credentials, and add this site's real origin(s)
                         under "Authorized JavaScript origins".
   Both readiness checks below use the exact same "REPLACE-ME" sentinel
   convention part-61.js already uses for its Worker URL (tgWorkerReady()) --
   until real values are in, each button shows a quiet "not set up yet"
   toast instead of calling out with a fake ID (which would just fail with
   a cryptic provider error).

   State is intentionally the same lightweight shape LINE/Telegram use
   (sessionStorage, "linked"/"idle", a spz:<provider> DOM event on change)
   so part-46.js's gate can treat all four providers identically -- see
   fbIsLinkedNow()/googleIsLinkedNow() there, alongside the existing
   lineIsLinkedNow()/tgIsLinkedNow().
   ========================================================================= */
(function(){
  'use strict';
  if(window.__SPZ_FB && window.__SPZ_GOOGLE) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }

  var FB_APP_ID = 'REPLACE-ME-FACEBOOK-APP-ID';
  var GOOGLE_CLIENT_ID = 'REPLACE-ME-GOOGLE-CLIENT-ID.apps.googleusercontent.com';
  function fbReady(){ return FB_APP_ID.indexOf('REPLACE-ME') === -1; }
  function googleReady(){ return GOOGLE_CLIENT_ID.indexOf('REPLACE-ME') === -1; }

  var FB_STORAGE_KEY = 'spz_fb_link';
  var GOOGLE_STORAGE_KEY = 'spz_google_link';

  var NOT_READY_MSG = {
    en:'This sign-in option isn’t set up yet.',
    th:'ยังไม่ได้ตั้งค่าระบบล็อกอินนี้ค่ะ'
  };

  function saveState(key, st){
    try { sessionStorage.setItem(key, JSON.stringify({ displayName: st.displayName, pictureUrl: st.pictureUrl })); }
    catch(e){}
  }
  function loadState(key){
    try { var raw = sessionStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch(e){ return null; }
  }
  function clearState(key){ try { sessionStorage.removeItem(key); } catch(e){} }

  /* ---------------- shared "not set up yet" toast ---------------- */
  var noticeEl = null;
  function showNotice(){
    if(!noticeEl){
      noticeEl = document.createElement('div');
      noticeEl.className = 'spz-social-notice';
      noticeEl.innerHTML = '<span data-n></span>';
      document.body.appendChild(noticeEl);
    }
    noticeEl.querySelector('[data-n]').textContent = NOT_READY_MSG[L()] || NOT_READY_MSG.en;
    noticeEl.classList.add('show');
    clearTimeout(noticeEl.__t);
    noticeEl.__t = setTimeout(function(){ noticeEl.classList.remove('show'); }, 3500);
  }

  /* ---------------- Facebook ---------------- */
  var fbState = { status:'idle', displayName:null, pictureUrl:null };
  var fbSdkReady = false, fbSdkLoading = false, fbSdkWaiters = [];
  function loadFbSdk(cb){
    if(fbSdkReady){ cb(); return; }
    fbSdkWaiters.push(cb);
    if(fbSdkLoading) return;
    fbSdkLoading = true;
    window.fbAsyncInit = function(){
      FB.init({ appId: FB_APP_ID, cookie:true, xfbml:false, version:'v19.0' });
      fbSdkReady = true;
      fbSdkWaiters.forEach(function(fn){ fn(); });
      fbSdkWaiters = [];
    };
    var s = document.createElement('script');
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true; s.defer = true;
    document.body.appendChild(s);
  }
  function notifyFb(){ try { document.dispatchEvent(new CustomEvent('spz:fb')); } catch(e){} }
  function fbLogin(){
    if(!fbReady()){ showNotice(); return; }
    loadFbSdk(function(){
      FB.login(function(res){
        if(res && res.authResponse){
          FB.api('/me', { fields:'name,picture' }, function(profile){
            fbState.status = 'linked';
            fbState.displayName = (profile && profile.name) || null;
            fbState.pictureUrl = (profile && profile.picture && profile.picture.data && profile.picture.data.url) || null;
            saveState(FB_STORAGE_KEY, fbState);
            notifyFb();
          });
        }
      }, { scope:'public_profile' });
    });
  }
  function fbLogout(){
    fbState = { status:'idle', displayName:null, pictureUrl:null };
    clearState(FB_STORAGE_KEY);
    notifyFb();
    if(window.FB && FB.logout) FB.logout();
  }

  /* ---------------- Google ---------------- */
  var googleState = { status:'idle', displayName:null, pictureUrl:null };
  var googleSdkReady = false, googleSdkLoading = false, googleSdkWaiters = [], googleTokenClient = null;
  function loadGoogleSdk(cb){
    if(googleSdkReady){ cb(); return; }
    googleSdkWaiters.push(cb);
    if(googleSdkLoading) return;
    googleSdkLoading = true;
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = function(){
      googleSdkReady = true;
      googleSdkWaiters.forEach(function(fn){ fn(); });
      googleSdkWaiters = [];
    };
    document.body.appendChild(s);
  }
  function notifyGoogle(){ try { document.dispatchEvent(new CustomEvent('spz:google')); } catch(e){} }
  function googleLogin(){
    if(!googleReady()){ showNotice(); return; }
    loadGoogleSdk(function(){
      if(!googleTokenClient){
        googleTokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile',
          callback: function(resp){
            if(!resp || !resp.access_token) return;
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: 'Bearer ' + resp.access_token }
            }).then(function(r){ return r.json(); }).then(function(profile){
              googleState.status = 'linked';
              googleState.displayName = profile.name || null;
              googleState.pictureUrl = profile.picture || null;
              saveState(GOOGLE_STORAGE_KEY, googleState);
              notifyGoogle();
            }).catch(function(){});
          }
        });
      }
      googleTokenClient.requestAccessToken();
    });
  }
  function googleLogout(){
    googleState = { status:'idle', displayName:null, pictureUrl:null };
    clearState(GOOGLE_STORAGE_KEY);
    notifyGoogle();
  }

  /* restore whatever was linked earlier this tab session */
  (function restore(){
    var savedFb = loadState(FB_STORAGE_KEY);
    if(savedFb){ fbState.status = 'linked'; fbState.displayName = savedFb.displayName; fbState.pictureUrl = savedFb.pictureUrl; }
    var savedGoogle = loadState(GOOGLE_STORAGE_KEY);
    if(savedGoogle){ googleState.status = 'linked'; googleState.displayName = savedGoogle.displayName; googleState.pictureUrl = savedGoogle.pictureUrl; }
  })();

  window.__SPZ_FB = {
    open: fbLogin,
    logout: fbLogout,
    ready: fbReady,
    state: function(){ return { status: fbState.status, displayName: fbState.displayName, pictureUrl: fbState.pictureUrl }; }
  };
  window.__SPZ_GOOGLE = {
    open: googleLogin,
    logout: googleLogout,
    ready: googleReady,
    state: function(){ return { status: googleState.status, displayName: googleState.displayName, pictureUrl: googleState.pictureUrl }; }
  };
})();
