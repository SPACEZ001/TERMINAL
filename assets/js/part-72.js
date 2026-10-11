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
    close:{ en:'Close', th:'ปิด' },
    del:{ en:'Turn off this link for my privacy', th:'ขอปิดลิงก์/ลบ QR นี้เพื่อความเป็นส่วนตัว' },
    delNote:{ en:'After this, the QR code and link stop working. Your teacher keeps the evaluation.', th:'หลังจากนี้ QR และลิงก์จะใช้ไม่ได้อีก ครูยังเก็บใบประเมินไว้เหมือนเดิม' },
    delAsk:{ en:'Turn off this link? Nobody (including you) can open it again with this QR.', th:'ปิดลิงก์นี้ใช่ไหม? หลังจากนี้ไม่มีใครเปิดด้วย QR นี้ได้อีก (รวมถึงตัวคุณเอง)' },
    delDone:{ en:'Done. This link has been turned off.', th:'เรียบร้อย ลิงก์นี้ถูกปิดแล้ว' }
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
      var dz = document.createElement('div'); dz.className = 'evv-del';
      var db = document.createElement('button'); db.type = 'button'; db.textContent = t('del');
      var dn = document.createElement('p'); dn.textContent = t('delNote');
      dz.appendChild(db); dz.appendChild(dn);
      db.addEventListener('click', function(){
        if(!window.confirm(t('delAsk'))) return;
        fetch(API.replace('/view?t=', '/revoke'), { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ t:tok }) })
          .then(function(r){ if(r.ok) msg('delDone'); else msg('fail'); }).catch(function(){ msg('fail'); });
      });
      body.innerHTML = ''; body.appendChild(w); body.appendChild(p); body.appendChild(dz);
    })();
  }
  fetch(API + encodeURIComponent(tok), { cache:'no-store' }).then(function(r){
    if(r.status === 404){ msg('gone'); return null; }
    if(!r.ok){ msg('fail'); return null; }
    return r.json();
  }).then(function(j){ if(j && j.data) show(j.data); }).catch(function(){ msg('fail'); });
})();
