
/* ---------- gentle "new version available" check ----------
   Polls this same page's own response headers (ETag / Last-Modified)
   every few minutes. If the deployed file has changed since this tab
   loaded, shows a small dismissible toast the visitor can tap to
   reload — nobody is forced off the page they are using. */
(function(){
  'use strict';
  var baselineTag = null;
  var checking = false;
  var CHECK_MS = 6 * 60 * 1000; /* ~6 minutes; GitHub Pages' own CDN cache is the real floor */

  function tagFrom(res){
    return res.headers.get('etag') || res.headers.get('last-modified') || null;
  }

  function check(){
    if (checking) return;
    checking = true;
    fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(function(res){
      var tag = tagFrom(res);
      if (!tag) return;
      if (baselineTag === null) { baselineTag = tag; return; }
      if (tag !== baselineTag) showToast();
    }).catch(function(){ /* offline / blocked - stay silent */ })
      .finally(function(){ checking = false; });
  }

  function showToast(){
    if (document.getElementById('spzUpdateToast')) return;
    var isTH = document.documentElement.lang === 'th';
    var bar = document.createElement('div');
    bar.id = 'spzUpdateToast';
    bar.innerHTML =
      '<span class="sut-dot" aria-hidden="true"></span>' +
      '<span>' + (isTH ? 'มีอัปเดตใหม่พร้อมใช้งาน' : 'A new version is available') + '</span>' +
      '<button type="button" id="spzUpdateRefresh">' + (isTH ? 'รีเฟรชตอนนี้' : 'Refresh now') + '</button>' +
      '<button type="button" id="spzUpdateDismiss" aria-label="' + (isTH ? 'ปิด' : 'Dismiss') + '">\u00d7</button>';
    document.body.appendChild(bar);
    requestAnimationFrame(function(){ bar.classList.add('show'); });
    document.getElementById('spzUpdateRefresh').addEventListener('click', function(){ location.reload(); });
    document.getElementById('spzUpdateDismiss').addEventListener('click', function(){
      bar.classList.remove('show');
      setTimeout(function(){ bar.remove(); }, 400);
    });
  }

  check();
  setInterval(check, CHECK_MS);
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'visible') check();
  });
})();
