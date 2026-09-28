
/* ============================================================================
   SPACEZ TERMINAL v12 — UNIFIED CONTROL CLUSTER + MENU SCRIM
   ========================================================================= */
(function(){
  'use strict';

  function boot(){
    var nav = document.querySelector('.nav');
    if(!nav || document.querySelector('.nav-cluster')) return;

    var cluster = document.createElement('div');
    cluster.className = 'nav-cluster';

    var wrap = nav.querySelector('.nav-links-wrap') || document.querySelector('.navmenu');
    var tools = nav.querySelector('.tools-btn');
    var themes = nav.querySelector('.theme-switch');
    var lang = document.getElementById('langToggle');

    function divider(){
      var d = document.createElement('span');
      d.className = 'nav-div';
      return d;
    }

    if(wrap) cluster.appendChild(wrap);
    if(tools) cluster.appendChild(tools);
    if(themes){ cluster.appendChild(divider()); cluster.appendChild(themes); }
    if(lang){ cluster.appendChild(divider()); cluster.appendChild(lang); }
    nav.appendChild(cluster);

    /* scrim behind the open menu */
    var scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);

    var menu = document.querySelector('.navmenu');
    if(!menu) return;

    var hoverOn = window.matchMedia ? window.matchMedia('(hover:hover)').matches : true;
    var leaveTimer;

    /* Guarded: only touch the DOM when the state actually changes. Without this
       guard, classList.remove() on an already-absent token still records an
       attribute mutation, the observer re-fires, and the two loop forever. */
    function setOpen(on){
      var isOpen = menu.classList.contains('open');
      if(!on && isOpen) menu.classList.remove('open');
      if(on && !isOpen) menu.classList.add('open');
      if(document.body.classList.contains('nav-open') !== !!on){
        document.body.classList.toggle('nav-open', !!on);
      }
    }
    function syncScrim(){
      var isOpen = menu.classList.contains('open');
      var lit = document.body.classList.contains('nav-open');
      if(isOpen && !lit) document.body.classList.add('nav-open');
      else if(!isOpen && lit && (!hoverOn || !menu.matches(':hover'))) document.body.classList.remove('nav-open');
    }

    /* class changes on the trigger mirror into the scrim — read only, never write back */
    new MutationObserver(syncScrim).observe(menu, { attributes:true, attributeFilter:['class'] });

    if(hoverOn){
      menu.addEventListener('mouseenter', function(){
        clearTimeout(leaveTimer);
        document.body.classList.add('nav-open');
      });
      menu.addEventListener('mouseleave', function(){
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(function(){
          if(!menu.classList.contains('open')) document.body.classList.remove('nav-open');
        }, 140);
      });
    }

    /* any navigation choice closes the menu and clears the blur immediately */
    menu.addEventListener('click', function(e){
      if(e.target.closest && e.target.closest('.np-item')){ clearTimeout(leaveTimer); setOpen(false); }
    });
    document.addEventListener('click', function(e){
      if(!menu.contains(e.target)) { clearTimeout(leaveTimer); setOpen(false); }
    });
    scrim.addEventListener('click', function(){ clearTimeout(leaveTimer); setOpen(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 60); });
  else setTimeout(boot, 60);
})();
