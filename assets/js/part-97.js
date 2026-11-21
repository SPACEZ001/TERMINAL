/* ===================== SPACEZ ANNOUNCE v2 (2026-11-21) =====================
   A new look for the three places an admin announcement shows up:
     1. the centre popup (.spz-ann-modal, built by part-03)
     2. the strip under the top bar (#spzAnnounceBar, in the HTML, driven by part-03)
     3. the card laid over the portfolio popup bottom right (#spzShockPopup, part-39)
   This file only decorates those elements (icon, "from SPACEZ TERMINAL" line, posted
   date, an "OK, got it" button) — opening, closing and dismissing are still done by
   part-03 / part-39 exactly as before. Styles: assets/css/part-97.css. */
(function(){
  'use strict';
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o ? (o[L()] || o.en) : ''; }
  var TX = {
    from:{ en:'SPACEZ TERMINAL · Official notice', th:'SPACEZ TERMINAL · ประกาศอย่างเป็นทางการ' },
    fromS:{ en:'SPACEZ TERMINAL', th:'SPACEZ TERMINAL' },
    lbl:{ en:'Announcement', th:'ประกาศ' },
    ok:{ en:'Got it', th:'รับทราบ' },
    more:{ en:'Read', th:'อ่านต่อ' },
    posted:{ en:'Posted ', th:'ประกาศเมื่อ ' },
    auto:{ en:'closes by itself', th:'ปิดเองอัตโนมัติ' }
  };
  var ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5v3a1.5 1.5 0 001.5 1.5H6l5 4V5L6 9H4.5A1.5 1.5 0 003 10.5z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 5.5a9 9 0 010 13"/></svg>';
  var CLK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
  var MTH = { en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], th:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'] };
  function fmt(ts){
    if(!ts) return '';
    var d = new Date(+ts); if(isNaN(d)) return '';
    var l = L(), hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    return d.getDate() + ' ' + MTH[l][d.getMonth()] + ' ' + (l === 'th' ? d.getFullYear() + 543 : d.getFullYear()) + ' · ' + hh + (l === 'th' ? ' น.' : '');
  }
  function findItem(text){
    var A = window.__SPZ_ANNOUNCE; if(!A || !text) return null;
    var all = (A.list && A.list()) || [];
    for(var i = 0; i < all.length; i++){ if(all[i].text === text) return all[i]; }
    return null;
  }
  function mk(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }

  /* ---------- 1. centre popup ---------- */
  function modal(){
    var m = document.querySelector('.spz-ann-modal'); if(!m) return;
    var card = m.querySelector('.spz-ann-modal-card'); if(!card) return;
    if(!m.__a2){
      m.__a2 = 1; m.classList.add('ann2');
      var ico = card.querySelector('.spz-ann-modal-ico'); if(ico) ico.innerHTML = ICO;
      var head = card.querySelector('.spz-ann-modal-head'), cnt = card.querySelector('.spz-ann-modal-count');
      if(head && cnt){
        var tb = mk('span', 'ann2-tb');
        tb.appendChild(mk('span', 'ann2-from'));
        head.insertBefore(tb, cnt); tb.appendChild(cnt);
      }
      var foot = mk('div', 'ann2-foot');
      foot.appendChild(mk('span', 'ann2-date'));
      var nav = card.querySelector('.spz-ann-modal-nav'); if(nav) foot.appendChild(nav);
      var ok = mk('button', 'ann2-ok'); ok.type = 'button';
      ok.addEventListener('click', function(){ var c = card.querySelector('[data-annm="close"]'); if(c) c.click(); });
      foot.appendChild(ok);
      card.appendChild(foot);
      card.insertBefore(mk('i', 'ann2-glow'), card.firstChild);
    }
    var txt = card.querySelector('.spz-ann-modal-txt'), t = txt ? txt.textContent : '';
    var key = L() + '|' + t;
    if(m.__a2k === key) return; m.__a2k = key;
    var it = findItem(t);
    card.querySelector('.ann2-from').textContent = T(TX.from);
    card.querySelector('.ann2-date').innerHTML = it && it.createdAt ? CLK + '<span>' + T(TX.posted) + fmt(it.createdAt) + '</span>' : '';
    card.querySelector('.ann2-ok').textContent = T(TX.ok);
  }

  /* ---------- 2. strip under the top bar ---------- */
  function bar(){
    var b = document.getElementById('spzAnnounceBar'); if(!b) return;
    if(!b.__a2){
      b.__a2 = 1; b.classList.add('ann2');
      var ico = b.querySelector('.spz-announce-ico'); if(ico) ico.innerHTML = ICO;
      var txt = b.querySelector('.spz-announce-txt');
      if(txt){ b.insertBefore(mk('span', 'ann2-chip'), txt); txt.parentNode.insertBefore(mk('span', 'ann2-more'), txt.nextSibling); }
    }
    if(b.__a2l === L()) return; b.__a2l = L();
    var c = b.querySelector('.ann2-chip'); if(c) c.textContent = T(TX.lbl);
    var mo = b.querySelector('.ann2-more'); if(mo) mo.innerHTML = T(TX.more) + ' <b>›</b>';
  }

  /* ---------- 3. card over the portfolio popup ---------- */
  function shock(){
    var p = document.getElementById('spzShockPopup'); if(!p) return;
    var card = p.querySelector('.spz-shock-announce-card'); if(!card) return;
    if(!card.__a2){
      card.__a2 = 1; p.classList.add('ann2');
      var ico = card.querySelector('.spz-shock-announce-ico'); if(ico) ico.innerHTML = ICO;
      var lbl = card.querySelector('.spz-shock-announce-lbl');
      if(lbl){ var tb = mk('span', 'ann2-tb'); lbl.parentNode.insertBefore(tb, lbl); tb.appendChild(mk('span', 'ann2-from')); tb.appendChild(lbl); }
      var foot = mk('div', 'ann2-foot');
      foot.appendChild(mk('span', 'ann2-date'));
      var ok = mk('button', 'ann2-ok'); ok.type = 'button';
      ok.addEventListener('click', function(){ var c = card.querySelector('[data-spzshock="announceClose"]'); if(c) c.click(); });
      foot.appendChild(ok);
      var barEl = card.querySelector('.spz-shock-announce-bar');
      if(barEl) card.insertBefore(foot, barEl); else card.appendChild(foot);
      card.insertBefore(mk('i', 'ann2-glow'), card.firstChild);
    }
    var txt = card.querySelector('.spz-shock-announce-txt'), t = txt ? txt.textContent : '';
    var key = L() + '|' + t;
    if(card.__a2k === key) return; card.__a2k = key;
    var it = findItem(t);
    card.querySelector('.ann2-from').textContent = T(TX.fromS);
    card.querySelector('.ann2-date').innerHTML = it && it.createdAt ? CLK + '<span>' + fmt(it.createdAt) + '</span>' : '<span>' + T(TX.auto) + '</span>';
    card.querySelector('.ann2-ok').textContent = T(TX.ok);
  }

  function run(){ try { modal(); } catch(e){} try { bar(); } catch(e){} try { shock(); } catch(e){} }
  document.addEventListener('spz:announce', function(){ setTimeout(run, 30); });
  new MutationObserver(function(){ run(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  /* the popups are built lazily and their text changes on prev / next; a light poll keeps the date in step */
  setInterval(run, 700);
  run();
  window.__SPZ_ANNOUNCE_V2 = { run:run, fmt:fmt };
})();
