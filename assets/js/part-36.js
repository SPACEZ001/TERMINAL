
(function(){
  'use strict';
  var HINT_KEY = 'spacez.gm_hint_seen';
  var GUIDE_KEY = 'spacez.guide';

  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function guideOn(){
    try {
      var raw = localStorage.getItem(GUIDE_KEY);
      return raw ? !!JSON.parse(raw).on : false;
    } catch(e){ return false; }
  }
  function hintSeen(){
    try { return localStorage.getItem(HINT_KEY) === '1'; } catch(e){ return false; }
  }
  function markSeen(){
    try { localStorage.setItem(HINT_KEY, '1'); } catch(e){}
  }
  function goGuided(){
    markSeen();
    dismissBanner();
    var link = document.querySelector('[data-route-to="guided"]');
    if(link) link.click();
  }

  var STR = {
    en:{ pillOn:'Guide: ON', pillOff:'Guide',
         bannerT:'<b>New here?</b> Guided Mode walks you through this whole site in ten steps, in the order that actually works.',
         go:'Try it →' },
    th:{ pillOn:'แนะนำ: เปิด', pillOff:'แนะนำ',
         bannerT:'<b>เพิ่งเข้ามาครั้งแรกใช่ไหม</b> โหมดแนะนำจะพาไล่ดูทั้งเว็บทีละสิบขั้นตอน เรียงตามลำดับที่ใช้ได้จริง',
         go:'ลองเลย →' }
  };

  /* ---------- nav pill ---------- */
  var pill;
  function paintPill(){
    if(!pill) return;
    var on = guideOn(), t = STR[L()];
    pill.classList.toggle('on', on);
    pill.innerHTML = '<span class="gmh-dot"></span><span class="gmh-lbl">' +
      (on ? t.pillOn : t.pillOff) + '</span>';
  }
  function buildPill(){
    if(pill) return true;
    var host = document.getElementById('langToggle');
    if(!host || !host.parentNode) return false;
    pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'gmh-pill';
    pill.addEventListener('click', goGuided);
    host.parentNode.insertBefore(pill, host);
    paintPill();
    return true;
  }

  /* ---------- first-visit banner ---------- */
  var banner;
  function paintBanner(){
    if(!banner) return;
    var t = STR[L()];
    banner.querySelector('[data-gmh="t"]').innerHTML = t.bannerT;
    banner.querySelector('[data-gmh="go"]').textContent = t.go;
  }
  function dismissBanner(){
    markSeen();
    if(banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }
  function buildBanner(){
    if(banner) return true;
    if(hintSeen() || guideOn()) return true;   /* already discovered it */
    var anchor = document.getElementById('spzLiveBar');
    if(!anchor || !anchor.parentNode) return false;
    banner = document.createElement('div');
    banner.className = 'gmh-banner';
    banner.innerHTML =
      '<span class="gmh-banner-t" data-gmh="t"></span>' +
      '<span class="gmh-banner-actions">' +
        '<button type="button" class="gmh-go" data-gmh="go"></button>' +
        '<button type="button" class="gmh-x" aria-label="dismiss">✕</button>' +
      '</span>';
    anchor.parentNode.insertBefore(banner, anchor.nextSibling);
    banner.querySelector('.gmh-go').addEventListener('click', goGuided);
    banner.querySelector('.gmh-x').addEventListener('click', dismissBanner);
    paintBanner();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      var okPill = buildPill();
      var okBanner = buildBanner();
      if((okPill && okBanner) || ++tries > 60) clearInterval(iv);
    }, 300);

    new MutationObserver(function(){ paintPill(); paintBanner(); })
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

    document.addEventListener('click', function(){
      setTimeout(function(){
        paintPill();
        if(banner && guideOn()) dismissBanner();
      }, 200);
    });
    window.addEventListener('hashchange', function(){
      if(/^#\/guided\b/.test(location.hash || '')){ markSeen(); dismissBanner(); }
      setTimeout(paintPill, 200);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 700); });
  else setTimeout(boot, 700);
})();
