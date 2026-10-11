/* SPACEZ -- certificate verification page, opened from the QR code on a printed certificate.
   URL: <site>/#/cert/<certificate id>. Shows what the Worker has on record for that id, so an
   edited screenshot or a forged copy cannot pass: the real name and course come from the server. */
(function(){
  function run(){
    var m = /^#\/cert\/([A-Za-z0-9-]{6,24})/.exec(location.hash || '');
    if(!m || document.getElementById('spzCertView')) return;
    var id = m[1].toUpperCase();
    var API = 'https://spacez-line-link.spacezblack.workers.dev/api/cert/verify?id=';
    var H = document.documentElement;
    function th(){ return /^th/i.test(H.lang || ''); }
    var TXT = {
      load:{ en:'Checking certificate…', th:'กำลังตรวจสอบเกียรติบัตร…' },
      ok:{ en:'Verified — this certificate was issued by SPACEZ TERMINAL', th:'ตรวจสอบแล้ว — เกียรติบัตรนี้ออกโดย SPACEZ TERMINAL จริง' },
      okNote:{ en:'Compare the name below with the printed certificate. If they differ, the copy you have was altered.', th:'เทียบชื่อด้านล่างกับเกียรติบัตรที่ได้รับ ถ้าไม่ตรงกัน แปลว่าฉบับนั้นถูกแก้ไข' },
      rev:{ en:'This certificate has been revoked', th:'เกียรติบัตรฉบับนี้ถูกยกเลิกแล้ว' },
      bad:{ en:'No certificate with this number exists', th:'ไม่พบเกียรติบัตรเลขนี้ในระบบ' },
      badNote:{ en:'The number may be mistyped, or the certificate may not be genuine.', th:'เลขอาจพิมพ์ผิด หรือเกียรติบัตรอาจไม่ใช่ของจริง' },
      fail:{ en:'Could not reach the server. Check your internet and try again.', th:'เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' },
      name:{ en:'Name', th:'ชื่อ' }, course:{ en:'Course', th:'หลักสูตร' }, level:{ en:'Level', th:'ระดับ' }, date:{ en:'Date of issue', th:'วันที่ออก' },
      score:{ en:'Score', th:'คะแนน' }, by:{ en:'Certified by', th:'ผู้รับรอง' }, no:{ en:'Certificate No.', th:'เลขที่' }, close:{ en:'Close', th:'ปิด' }
    };
    function t(k){ return TXT[k][th() ? 'th' : 'en']; }
    function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
    var box = document.createElement('div');
    box.id = 'spzCertView';
    box.innerHTML = '<div class="cv-card"><div class="cv-brand">SPACEZ TERMINAL</div><div class="cv-body"><p class="cv-msg">' + esc(t('load')) + '</p></div><button type="button" class="cv-close">' + esc(t('close')) + '</button></div>';
    document.body.appendChild(box);
    H.classList.add('spz-certview-on');
    box.querySelector('.cv-close').addEventListener('click', function(){
      H.classList.remove('spz-certview-on'); if(box.parentNode) box.parentNode.removeChild(box); location.hash = '#/home';
    });
    var body = box.querySelector('.cv-body');
    function row(k, v){ return v ? '<div class="cv-row"><span>' + esc(t(k)) + '</span><b>' + esc(v) + '</b></div>' : ''; }
    fetch(API + encodeURIComponent(id)).then(function(r){ return r.json().then(function(j){ return { s:r.status, j:j }; }); }).then(function(x){
      var j = x.j || {};
      if(x.s === 404 || !j.id){ body.innerHTML = '<div class="cv-badge bad">✕</div><h2>' + esc(t('bad')) + '</h2><p class="cv-msg">' + esc(t('badNote')) + '</p><div class="cv-id">' + esc(id) + '</div>'; return; }
      var ok = j.valid && !j.revoked;
      body.innerHTML = '<div class="cv-badge ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓' : '!') + '</div><h2>' + esc(t(ok ? 'ok' : 'rev')) + '</h2>' +
        (ok ? '<p class="cv-msg">' + esc(t('okNote')) + '</p>' : '') +
        '<div class="cv-rows">' + row('name', j.name + (j.nameEn ? ' (' + j.nameEn + ')' : '')) + row('course', j.course) + row('level', j.level) + row('score', j.score) + row('date', j.date) + row('by', j.issuedBy) + row('no', j.id) + '</div>';
    }).catch(function(){ body.innerHTML = '<p class="cv-msg">' + esc(t('fail')) + '</p>'; });
  }
  run();
  window.addEventListener('hashchange', run);
})();
