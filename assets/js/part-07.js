
/* ---------- rate-fx toggle: Fed hike/cut panels inside Market Shock Simulator ---------- */
(function(){
  'use strict';
  function wire(){
    var toggles = document.querySelectorAll('.rfx-toggle');
    toggles.forEach(function(tg){
      var wrap = tg.closest('.rate-fx');
      if(!wrap || wrap.__rfxWired) return;
      wrap.__rfxWired = true;
      var btns = tg.querySelectorAll('.rfx-btn');
      btns.forEach(function(btn){
        btn.addEventListener('click', function(){
          var state = btn.getAttribute('data-rfx-btn');
          btns.forEach(function(b){ b.classList.toggle('active', b === btn); });
          wrap.querySelectorAll('.rfx-panel').forEach(function(p){
            p.hidden = (p.getAttribute('data-rfx-panel') !== state);
          });
        });
      });
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
