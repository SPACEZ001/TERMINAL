
/* ===========================================================================
   Round AB: "Who Controls the World's Money?" admin briefing. This page had
   NO content protection at all before this round -- not even the
   client-side window.__SPZ_TIER() show/hide check every other admin-only
   page uses -- so its full bilingual essay, the ten-spoke diagram data, the
   confirmed/speculation lists and the stats table were always present in
   the shipped JS bundle regardless of visitor tier, readable via plain
   view-source with no DevTools digging required.

   Fixed the same way the Elliott Wave Classroom was (see part-65.js): the
   real content is no longer in this file. It is fetched on demand from the
   Worker's /api/controlgrid/content, gated by the same X-Admin-Key already
   used for Connected Users / Announcements / the Classroom -- a credential
   the Worker verifies server-side, never held by the browser. Unlike the
   Classroom, this page has no node tree to preserve: it's one scrolling
   essay, so the whole body below the header is a single fetched blob per
   language rather than a per-node cache. Only the header teaser (eyebrow/
   title/lede) stays client-side, since it reveals no real content on its
   own. */
(function(){
  'use strict';
  if (window.__SPZ_CONTROLGRID) return;
  window.__SPZ_CONTROLGRID = true;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // Round AB: same Worker, same sessionStorage key as Connected Users /
  // Announcements / the Classroom -- one admin key unlocks all of them.
  var WORKER_BASE = 'https://spacez-line-link.spacezblack.workers.dev';
  var ADMIN_KEY_STORAGE = 'spz_admin_users_key';

  function getAdminKey(){
    try {
      var k = sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
      if(!k && window.__SPZ_TIER && window.__SPZ_TIER() === 'editor') k = sessionStorage.getItem('spz_editor_code') || '';
      return k;
    } catch(e){ return ''; }
  }
  function setAdminKey(k){
    try { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); } catch(e){}
  }
  function clearAdminKey(){
    try { sessionStorage.removeItem(ADMIN_KEY_STORAGE); } catch(e){}
  }

  var COPY = {
    eyebrow:{en:'Admin Briefing',th:'บรีฟฉบับแอดมิน'},
    h:{en:'Who really controls the world’s money?',th:'ใครคือคนที่คุมเงินโลกจริงๆ?'},
    lede:{en:'A theory from financial YouTube, checked against what the BIS, central banks and researchers have actually published. Facts and speculation are labelled separately the whole way down — education and one analyst’s opinion, never investment advice.',
          th:'ทฤษฎีจากคลิปการเงินใน YouTube เทียบกับสิ่งที่ BIS ธนาคารกลาง และนักวิจัยเผยแพร่จริง ข้อเท็จจริงกับการคาดเดาจะแยกป้ายกำกับชัดเจนตลอดทั้งหน้า เพื่อการศึกษาและความเห็นส่วนตัวของนักวิเคราะห์เว็บนี้เท่านั้น ไม่ใช่คำแนะนำการลงทุน'},

    adminOnly: { en:'Admins only.', th:'เฉพาะแอดมินเท่านั้น' },
    keyLede: { en:'This page\'s content now lives on the server, not in the page you downloaded — enter the same admin key used on Connected Users / Announcements / the Classroom to view it.',
               th:'เนื้อหาของหน้านี้ย้ายไปอยู่บนเซิร์ฟเวอร์แล้ว ไม่ได้อยู่ในหน้าเว็บที่ดาวน์โหลดมาอีกต่อไป — ใส่รหัสแอดมินเดียวกับที่ใช้ในหน้า Connected Users / ประกาศ / ห้องเรียน เพื่อดูเนื้อหา' },
    keyPh: { en:'Admin key', th:'รหัสแอดมิน' },
    keySubmit: { en:'Unlock', th:'ปลดล็อก' },
    keyErrBad: { en:'Incorrect key — try again.', th:'รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง' },
    keyErrNet: { en:'Could not reach the server — try again.', th:'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง' },
    loading: { en:'Loading…', th:'กำลังโหลด…' },
    retry: { en:'Try again', th:'ลองใหม่' },
    contentMissing: { en:'This hasn\'t been uploaded yet.', th:'ยังไม่มีการอัปโหลดเนื้อหา' }
  };

  var sec = null;
  var bodyEl = null;

  var contentCache = null; // null until fetched; then { en:'html', th:'html' }
  var contentLoading = false;
  var contentErr = null; // null | 'bad' | 'net'

  function fetchControlGridContent(){
    var key = getAdminKey();
    if(!key) return;
    contentLoading = true; contentErr = null;
    renderBody();
    fetch(WORKER_BASE + '/api/controlgrid/content', { headers:{ 'X-Admin-Key': key } })
      .then(function(r){
        if(r.status === 401){ clearAdminKey(); contentErr = 'bad'; contentCache = null; contentLoading = false; renderBody(); return null; }
        if(!r.ok) throw new Error('bad_status');
        return r.json();
      })
      .then(function(data){
        if(!data) return;
        contentCache = data.content || {};
        contentLoading = false;
        renderBody();
      })
      .catch(function(){ contentErr = 'net'; contentLoading = false; renderBody(); });
  }

  function keyGateHTML(){
    return '<div class="ewv-keygate">' +
      '<div class="ewv-keygate-icon">🔑</div>' +
      '<p class="ewv-keygate-lede">' + esc(tx(COPY.keyLede)) + '</p>' +
      '<input type="password" class="ewv-key-input" data-cg-key="input" autocomplete="off" spellcheck="false" placeholder="' + esc(tx(COPY.keyPh)) + '">' +
      '<button type="button" class="ewv-key-btn" data-cg-key="submit">' + esc(tx(COPY.keySubmit)) + '</button>' +
      (contentErr === 'bad' ? '<div class="ewv-key-err">' + esc(tx(COPY.keyErrBad)) + '</div>' : '') +
    '</div>';
  }

  function netErrorHTML(){
    return '<div class="ewv-content-err">' +
      '<p>' + esc(tx(COPY.keyErrNet)) + '</p>' +
      '<button type="button" class="ewv-key-btn" data-cg-key="retry">' + esc(tx(COPY.retry)) + '</button>' +
    '</div>';
  }

  function bodyContentHTML(){
    if(!getAdminKey()) return keyGateHTML();
    if(contentLoading) return '<div class="ewv-content-loading">' + esc(tx(COPY.loading)) + '</div>';
    if(contentErr === 'net') return netErrorHTML();
    if(!contentCache) return keyGateHTML(); // defensive fallback
    var out = tx(contentCache);
    return out || ('<div class="ewv-content-err"><p>' + esc(tx(COPY.contentMissing)) + '</p></div>');
  }

  function submitContentKey(){
    var input = bodyEl && bodyEl.querySelector('[data-cg-key="input"]');
    var key = input ? input.value.trim() : '';
    if(!key) return;
    setAdminKey(key);
    fetchControlGridContent();
  }

  function wireContentGate(){
    if(!bodyEl) return;
    var input = bodyEl.querySelector('[data-cg-key="input"]');
    if(input) input.addEventListener('keydown', function(ev){ if(ev.key === 'Enter') submitContentKey(); });
    var submit = bodyEl.querySelector('[data-cg-key="submit"]');
    if(submit) submit.addEventListener('click', submitContentKey);
    var retry = bodyEl.querySelector('[data-cg-key="retry"]');
    if(retry) retry.addEventListener('click', fetchControlGridContent);
  }

  function renderBody(){
    if(!bodyEl) return;
    if(window.__SPZ_TIER && window.__SPZ_TIER() !== 'full' && window.__SPZ_TIER() !== 'editor'){
      bodyEl.innerHTML = '<div class="qrp-locked">' + esc(tx(COPY.adminOnly)) + '</div>';
      return;
    }
    if(getAdminKey() && !contentCache && !contentLoading && !contentErr){
      fetchControlGridContent();
      return; // fetchControlGridContent() paints the loading state itself
    }
    bodyEl.innerHTML = bodyContentHTML();
    wireContentGate();
    var rv = bodyEl.querySelectorAll('.reveal');
    for (var k = 0; k < rv.length; k++) rv[k].classList.add('in-view');
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-cg="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(COPY.eyebrow);
    if (q('h')) q('h').textContent = tx(COPY.h);
    if (q('lede')) q('lede').textContent = tx(COPY.lede);
    bodyEl = q('body');
    renderBody();
  }

  function build(){
    if (document.getElementById('controlgrid')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'controlgrid';
    sec.setAttribute('data-route', 'controlgrid');
    sec.innerHTML =
      '<div class="cg-wrap">' +
        '<div class="section-head reveal in-view">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-cg="eb"></span></div>' +
          '<h2 data-cg="h"></h2>' +
          '<p class="lede" data-cg="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-cg="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'controlgrid', after:'pro', /* Round S5: cockpit route merged away, see part-47.js */
      t:{en:'Who Controls the World’s Money?',th:'ใครคุมเงินโลก?'},
      d:{en:'BIS, CBDCs, digital ID and the control-grid theory — fact-checked, admin only.',
         th:'BIS, CBDC, ดิจิทัลไอดี และทฤษฎีวงล้อควบคุม — เช็คข้อเท็จจริงแล้ว เฉพาะแอดมิน'}
    });

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
