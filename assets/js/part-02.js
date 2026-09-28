
/* ============================================================================
   SPACEZ TERMINAL v19 — SINGLE SOURCE OF TRUTH
   One cycle reading, one data date. Everything else on the site reads from
   here, so changing the call in one place changes every page at once.
   Loaded before every other module.
   ========================================================================= */
(function(){
  'use strict';

  var PHASES = ['early', 'mid', 'late', 'rec'];
  var LBL = {
    early:{en:'Early cycle',th:'ต้นวัฏจักร'},
    mid:{en:'Mid cycle',th:'กลางวัฏจักร'},
    late:{en:'Late cycle',th:'ปลายวัฏจักร'},
    rec:{en:'Recession',th:'ถดถอย'}
  };

  var CFG = {
    /* -------- the one place the cycle call lives -------- */
    live:'mid',                 /* what the published data says */
    phase:'mid',                /* what the user is currently viewing */
    confidence:{n:5, of:6},

    /* -------- the one place the data date lives -------- */
    asOf:'2026-09-08',
    fresh:45,                   /* days before the banner turns amber */
    stale:120,                  /* days before it turns red */

    idx:function(p){ return PHASES.indexOf(p || CFG.phase); },
    label:function(p){ return LBL[p || CFG.phase]; },
    isLive:function(){ return CFG.phase === CFG.live; },

    /* asOf used to be a plain hardcoded string that nobody remembered to
       bump, so this banner would silently drift out of date (seen: showing
       "16 days old" while the live market snapshot underneath was actually
       fresh from the last half hour). Now it reads the same generated_at
       timestamp the rest of the site already trusts (window.__SPZ_LIVE,
       fed by data/market.json, refreshed every 30 min by the market-data
       GitHub Action) and only falls back to the static date if that live
       snapshot isn't loaded yet. No invented number -- same real timestamp
       already shown elsewhere on the site. */
    asOfDisplay:function(){
      try {
        var snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
        if(snap && snap.generated_at) return new Date(snap.generated_at).toISOString().slice(0, 10);
      } catch(e){}
      return CFG.asOf;
    },
    days:function(){
      var d = new Date(CFG.asOfDisplay() + 'T00:00:00Z');
      return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
    },
    level:function(){
      var d = CFG.days();
      return d <= CFG.fresh ? 'ok' : (d <= CFG.stale ? 'warn' : 'old');
    },

    set:function(p, src){
      if(PHASES.indexOf(p) === -1 || p === CFG.phase) return;
      CFG.phase = p;
      document.dispatchEvent(new CustomEvent('spz:cycle', { detail:{ phase:p, src:src || 'user' } }));
    },
    reset:function(){ CFG.set(CFG.live, 'reset'); }
  };
  window.SPZ_CYCLE = CFG;
  window.SPZ_PHASES = PHASES;

  /* ---------------- shared copy ---------------- */
  var TXT = {
    freshOk:{en:'Data as of %D — %N days old',th:'ข้อมูล ณ %D — %N วันที่แล้ว'},
    freshWarn:{en:'Data as of %D — %N days old. Check the source before relying on it.',
               th:'ข้อมูล ณ %D — ผ่านมาแล้ว %N วัน ควรเช็คแหล่งต้นทางก่อนใช้'},
    freshOld:{en:'Data as of %D is %N days old. Treat every figure here as out of date and verify at the source.',
              th:'ข้อมูล ณ %D เก่าไปแล้ว %N วัน ให้ถือว่าทุกตัวเลขในหน้านี้ล้าสมัย และต้องตรวจสอบจากแหล่งต้นทาง'},
    simH:{en:'Simulated view',th:'กำลังดูแบบจำลอง'},
    simN:{en:'Every page is showing %P instead of the live reading (%L). Tap reset to go back.',
          th:'ทุกหน้ากำลังแสดงช่วง%P แทนค่าจริงที่ข้อมูลบอก (%L) กดรีเซ็ตเพื่อกลับ'},
    reset:{en:'Reset to live',th:'กลับค่าจริง'},
    cyc:{en:'Cycle',th:'วัฏจักร'},
    liveTag:{en:'live',th:'ค่าจริง'},
    switchH:{en:'Change it here and every page follows',th:'เปลี่ยนตรงนี้แล้วทุกหน้าเปลี่ยนตาม'}
  };
  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  function el(t, c, h){ var e = document.createElement(t); if(c) e.className = c; if(h != null) e.innerHTML = h; return e; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ---------------- the nav pill ---------------- */
  function buildPill(){
    var cluster = document.querySelector('.nav-cluster');
    if(!cluster || document.getElementById('spzCyc')) return;
    var box = el('div', 'cyc-pill');
    box.id = 'spzCyc';
    box.innerHTML = '<button type="button" class="cyc-trig"><span class="cyc-dot"></span>' +
      '<span data-c="lbl"></span></button><div class="cyc-pop" data-c="pop"></div>';
    cluster.insertBefore(box, cluster.firstChild);

    var trig = box.querySelector('.cyc-trig');
    trig.addEventListener('click', function(e){ e.stopPropagation(); box.classList.toggle('open'); });
    document.addEventListener('click', function(e){ if(!box.contains(e.target)) box.classList.remove('open'); });

    function paint(){
      box.querySelector('[data-c="lbl"]').textContent = T(CFG.label());
      box.classList.toggle('sim', !CFG.isLive());
      var pop = box.querySelector('[data-c="pop"]');
      pop.innerHTML = '<div class="cyc-h">' + esc(T(TXT.switchH)) + '</div>';
      for(var i = 0; i < PHASES.length; i++){
        (function(p){
          var b = el('button', 'cyc-b' + (CFG.phase === p ? ' on' : ''),
            esc(T(LBL[p])) + (p === CFG.live ? '<span class="cyc-live">' + esc(T(TXT.liveTag)) + '</span>' : ''));
          b.type = 'button';
          b.addEventListener('click', function(){ CFG.set(p, 'pill'); box.classList.remove('open'); });
          pop.appendChild(b);
        })(PHASES[i]);
      }
      if(!CFG.isLive()){
        var r = el('button', 'cyc-b cyc-reset', '↺ ' + esc(T(TXT.reset)));
        r.type = 'button';
        r.addEventListener('click', function(){ CFG.reset(); box.classList.remove('open'); });
        pop.appendChild(r);
      }
    }
    box.__paint = paint;
    paint();
  }

  /* ---------------- banners injected into every data page ---------------- */
  var PAGES = ['outlook', 'flow', 'globe', 'infl', 'desk'];

  function banners(){
    for(var i = 0; i < PAGES.length; i++){
      var sec = document.getElementById(PAGES[i]);
      if(!sec) continue;
      var head = sec.querySelector('.section-head');
      if(!head) continue;

      var bar = sec.querySelector('.spz-bar');
      if(!bar){
        bar = el('div', 'spz-bar');
        head.parentNode.insertBefore(bar, head.nextSibling);
      }

      var lv = CFG.level(), d = CFG.days();
      var key = lv === 'ok' ? 'freshOk' : (lv === 'warn' ? 'freshWarn' : 'freshOld');
      var msg = T(TXT[key]).replace('%D', CFG.asOfDisplay()).replace(/%N/g, d);
      var html = '<div class="spz-fresh ' + lv + '"><span class="spz-ic">' +
        (lv === 'ok' ? '◆' : (lv === 'warn' ? '⚠' : '⚠')) + '</span>' + esc(msg) + '</div>';

      if(!CFG.isLive()){
        html += '<div class="spz-sim"><span class="spz-ic">◈</span><b>' + esc(T(TXT.simH)) + '</b> ' +
          esc(T(TXT.simN).replace('%P', T(CFG.label())).replace('%L', T(LBL[CFG.live]))) +
          ' <button type="button" class="spz-reset">↺ ' + esc(T(TXT.reset)) + '</button></div>';
      }
      bar.innerHTML = html;
      var r = bar.querySelector('.spz-reset');
      if(r) r.addEventListener('click', function(){ CFG.reset(); });
    }
  }

  function repaint(){
    var p = document.getElementById('spzCyc');
    if(p && p.__paint) p.__paint();
    banners();
  }

  function boot(){
    buildPill();
    banners();
    if(!document.getElementById('spzCyc') || !document.querySelector('.spz-bar')){
      var n = 0;
      var iv = setInterval(function(){
        buildPill(); banners();
        if(++n > 30) clearInterval(iv);
      }, 300);
    }
    document.addEventListener('spz:cycle', repaint);
    /* the freshness banner above (asOfDisplay/days) reads the live market
       snapshot's own generated_at once it's loaded -- but the banner is
       first painted at boot, before that snapshot has necessarily arrived
       over the network, and nothing was re-painting it afterward. That's
       the actual reason it could sit showing a stale date indefinitely
       ("16 days old") even though the underlying data was fine: the
       banner just never got a second look. data/market.json's own loader
       already fires 'spz:snapshot' every time it loads or refreshes
       (first load, plus its 10-minute auto-reload) -- listening for that
       here is what makes this banner genuinely self-updating. */
    document.addEventListener('spz:snapshot', banners);
    new MutationObserver(repaint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('[data-route-to]');
      if(a) setTimeout(banners, 260);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 600); });
  else setTimeout(boot, 600);
})();
