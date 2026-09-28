
/* ---------- nav space-fx: one-shot "shooting star" spark on click ----------
   Event delegation on document, so it works for the hamburger menu, the
   back/forward chevrons and the Tools pill no matter which of the several
   scripts built that particular button or when. Purely cosmetic -- never
   calls preventDefault/stopPropagation, so every button's real click
   handler still runs normally. */
(function(){
  'use strict';
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.nav-trig, .nv-b');
    if (!btn || btn.disabled) return;
    btn.classList.remove('spz-spark');
    void btn.offsetWidth;
    btn.classList.add('spz-spark');
    setTimeout(function(){ btn.classList.remove('spz-spark'); }, 650);
  }, true);
})();
