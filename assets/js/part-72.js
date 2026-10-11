/* SPACEZ -- read-only student evaluation page, opened from the QR code on a report.
   URL: <site>/#/eval/<long random token>. No login: whoever holds the token can read that ONE evaluation.
   The report itself is drawn by part-49.js (window.__SPZ_EVAL_RENDER) so it looks exactly like the printed report. */
(function(){
  var m = /^#\/eval\/([a-z0-9]{20,40})/i.exec(location.hash || '');
  if(!m) return;
  var tok = m[1].toLowerCase();
  var API = 'https://spacez-line-link.spacezblack.workers.dev/api/eval/view?t=';
  var H = document.documentElement;
  function th(){ return /^th/i.test(H.lang || ''); }
  var TXT = {
    load:{ en:'Loading…', th:'กำลังโหลด…' },
    gone:{ en:'This link is not available. It may have been turned off or replaced. Please ask your teacher for a new one.', th:'ลิงก์นี้ใช้ไม่ได้แล้ว อาจถูกปิดหรือเปลี่ยนใหม่ กรุณาขอลิงก์ใหม่จากครู' },
    fail:{ en:'Could not load. Check your internet and try again.', th:'โหลดไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง' },
    warn:{ en:'Anyone who scans the QR code or opens this link can see this whole evaluation, without logging in. Please do not post it publicly.', th:'ใครก็ตามที่สแกน QR หรือเปิดลิงก์นี้จะเห็นใบประเมินทั้งหมดโดยไม่ต้องล็อกอิน กรุณาอย่าเผยแพร่ต่อสาธารณะ' },
    close:{ en:'Close', th:'ปิด' }
  };
  function t(k){ return TXT[k][th() ? 'th' : 'en']; }
  var box = document.createElement('div');
  box.id = 'spzEvalView';
  box.innerHTML = '<div class="evv-bar"><b>SPACEZ TERMINAL</b><button type="button">' + t('close') + '</button></div><div class="evv-body"><div class="evv-msg">' + t('load') + '</div></div>';
  document.body.insertBefore(box, document.body.firstChild);
  H.classList.add('spz-evview-on');
  var body = box.querySelector('.evv-body');
  box.querySelector('button').addEventListener('click', function(){
    H.classList.remove('spz-evview-on');
    if(box.parentNode) box.parentNode.removeChild(box);
    location.hash = '#/home';
  });
  function msg(k){ body.innerHTML = '<div class="evv-msg"></div>'; body.firstChild.textContent = t(k); }
  function show(data){
    var tries = 0;
    (function go(){
      if(typeof window.__SPZ_EVAL_RENDER !== 'function'){ if(++tries < 150) return setTimeout(go, 100); return msg('fail'); }
      var w = document.createElement('div'); w.className = 'evv-warn'; w.textContent = t('warn');
      var p = document.createElement('div'); p.className = 'evv-paper';
      p.innerHTML = window.__SPZ_EVAL_RENDER(data);
      body.innerHTML = ''; body.appendChild(w); body.appendChild(p);
    })();
  }
  fetch(API + encodeURIComponent(tok), { cache:'no-store' }).then(function(r){
    if(r.status === 404){ msg('gone'); return null; }
    if(!r.ok){ msg('fail'); return null; }
    return r.json();
  }).then(function(j){ if(j && j.data) show(j.data); }).catch(function(){ msg('fail'); });
})();
