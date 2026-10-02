/* ===========================================================================
   Round U (#217): "QR Code เว็บ" -- admin-only page showing one big, centered
   QR code that points at the site's own homepage, for her to screenshot/
   project/print when she wants people to scan their way in instead of typing
   a URL. Full creative freedom on this one (her own words: "ถ้าฉันไม่ชอบฉันจะ
   เปลี่ยนเองเดี๋ยวจะสั่งเอง") -- kept intentionally simple: no settings, no
   second QR target, just the one code, a copy-link button, and a download
   button, all dropped onto the same always-on starfield backdrop as Cockpit
   / Connected Users / Control Grid (see part-01.css's shared ::before rule,
   extended below for #qrcode).

   Gated exactly like every other admin screen: LOCKED_ROUTES in part-46.js
   keeps a non-admin visitor from ever landing on #/qrcode, and this module
   additionally refuses to render the real QR until window.__SPZ_TIER()
   reports 'full' (same admin-key gate pattern as Connected Users / Quiet
   Value Scanner) -- two independent layers, same convention used
   everywhere else on this site.

   QR image reuses the exact same public QR service already relied on
   elsewhere on this site (LINE login modal in part-39.js, Telegram login
   modal in part-61.js) rather than introducing a second QR dependency:
     https://api.qrserver.com/v1/create-qr-code/?size=...&data=...

   The target URL is never hardcoded -- this site is dual-hosted (GitHub
   Pages + Cloudflare Workers, two different domains) with no canonical-URL
   meta tag to read instead, so `location.origin + location.pathname` is
   read fresh every time the page builds, and always points at whichever
   copy of the site is actually running right now. */
(function(){
  'use strict';

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var UI = {
    eb:   { en:'ADMIN ONLY', th:'เฉพาะแอดมิน' },
    h:    { en:'Website QR Code', th:'QR Code เว็บ' },
    lede: { en:'A scannable link straight to the homepage -- for slides, printouts, or anywhere typing a URL is awkward.',
            th:'QR Code ที่พาตรงไปหน้าแรกของเว็บ -- ใช้ในสไลด์ สิ่งพิมพ์ หรือที่ไหนก็ตามที่พิมพ์ URL ไม่สะดวก' },
    adminOnly: { en:'Admins only.', th:'เฉพาะแอดมินเท่านั้น' },
    urlLabel:  { en:'This QR code points to:', th:'QR Code นี้พาไปที่:' },
    copyBtn:   { en:'Copy link', th:'คัดลอกลิงก์' },
    copiedBtn: { en:'Copied!', th:'คัดลอกแล้ว!' },
    downloadBtn: { en:'Download PNG', th:'ดาวน์โหลด PNG' },
    refreshNote: { en:'Regenerates automatically if the site ever moves to a new address.',
                   th:'สร้างใหม่ให้อัตโนมัติ ถ้าเว็บเปลี่ยนที่อยู่ในอนาคต' }
  };

  var QR_SIZE = 480;
  var sec = null;
  var copiedTimer = null;

  function siteUrl(){
    try { return location.origin + location.pathname; } catch(e){ return location.href; }
  }
  /* Round Z (#251): she wanted the QR's own background to be something
     other than plain white, matching the site's theme, while staying
     scannable -- the qrserver API's color/bgcolor params let it generate
     the code with real colors baked in (not a CSS filter over a white
     image, which could wreck contrast). Dark purple on pale lavender
     keeps the same strong near-black-on-near-white contrast a scanner
     relies on, just tinted into the page's purple accent instead of true
     black/white. These two hex values match --qrp-accent-adjacent
     .qrp-frame's background (--qrp-qr-bg) in part-44.css so the on-screen
     frame and the actual QR pixels read as one piece. */
  var QR_FG = '2a1240';
  var QR_BG = 'f3ecff';
  function qrImgUrl(url, size){
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
      '&margin=12&color=' + QR_FG + '&bgcolor=' + QR_BG + '&data=' + encodeURIComponent(url);
  }

  function bodyHTML(){
    if(window.__SPZ_TIER && window.__SPZ_TIER() !== 'full'){
      return '<div class="qrp-locked">' + esc(T(UI.adminOnly)) + '</div>';
    }
    var url = siteUrl();
    return (
      '<div class="qrp-card">' +
        '<div class="qrp-frame">' +
          '<img class="qrp-img" src="' + esc(qrImgUrl(url, QR_SIZE)) + '" width="' + QR_SIZE + '" height="' + QR_SIZE + '" alt="' + esc(T(UI.h)) + '">' +
          '<span class="qrp-frame-corner tl"></span><span class="qrp-frame-corner tr"></span>' +
          '<span class="qrp-frame-corner bl"></span><span class="qrp-frame-corner br"></span>' +
        '</div>' +
        '<div class="qrp-url-row">' +
          '<span class="qrp-url-label">' + esc(T(UI.urlLabel)) + '</span>' +
          '<code class="qrp-url" data-qrp="url">' + esc(url) + '</code>' +
        '</div>' +
        '<div class="qrp-actions">' +
          '<button type="button" class="qrp-btn" data-qrp="copy">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/></svg>' +
            '<span data-qrp="copyLabel">' + esc(T(UI.copyBtn)) + '</span>' +
          '</button>' +
          '<a class="qrp-btn" data-qrp="download" download="spacez-terminal-qr.png" href="' + esc(qrImgUrl(url, 1000)) + '">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>' +
            '<span>' + esc(T(UI.downloadBtn)) + '</span>' +
          '</a>' +
        '</div>' +
        '<p class="qrp-note">' + esc(T(UI.refreshNote)) + '</p>' +
      '</div>'
    );
  }

  function wireBody(){
    var copyBtn = sec.querySelector('[data-qrp="copy"]');
    if(copyBtn){
      copyBtn.addEventListener('click', function(){
        var url = siteUrl();
        var done = function(){
          var label = sec.querySelector('[data-qrp="copyLabel"]');
          if(!label) return;
          label.textContent = T(UI.copiedBtn);
          if(copiedTimer) clearTimeout(copiedTimer);
          copiedTimer = setTimeout(function(){ if(label) label.textContent = T(UI.copyBtn); }, 1800);
        };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
          done();
        }
      });
    }
  }

  function paint(){
    if(!sec) return;
    var eb = sec.querySelector('[data-qrp="eb"]'), h = sec.querySelector('[data-qrp="h"]'), lede = sec.querySelector('[data-qrp="lede"]');
    if(eb) eb.textContent = T(UI.eb);
    if(h) h.textContent = T(UI.h);
    if(lede) lede.textContent = T(UI.lede);
    var body = sec.querySelector('[data-qrp="body"]');
    if(!body) return;
    body.innerHTML = bodyHTML();
    wireBody();
  }

  function build(){
    if(document.getElementById('qrcode')) return true;
    if(!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'qrcode';
    sec.setAttribute('data-route', 'qrcode');
    sec.innerHTML =
      '<div class="cx-wrap qrp-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-qrp="eb"></span></div>' +
          '<h2 data-qrp="h"></h2>' +
          '<p class="lede" data-qrp="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-qrp="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'qrcode', feat:true, after:'quietValue',
      t: UI.h,
      d:{ en:'One big QR code pointing straight at the homepage -- for slides, printouts, or anywhere a scan beats typing a URL. Admin-only.',
          th:'QR Code ขนาดใหญ่หนึ่งอันที่พาตรงไปหน้าแรกของเว็บ -- ใช้ในสไลด์ สิ่งพิมพ์ หรือที่ไหนก็ตามที่สแกนง่ายกว่าพิมพ์ URL เฉพาะแอดมิน' }
    });

    paint();
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
