/* SPACEZ intro video — plays before the consent gate on a fresh visit */
(function(){
  var H=document.documentElement;
  try{
    if(window.__spzAckFresh && window.__spzAckFresh()) return;
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(sessionStorage.getItem('spz.intro')==='1') return;
  }catch(e){}
  var th=/^th/i.test(H.lang||'');
  var box=document.createElement('div');
  box.id='spzIntro';
  box.innerHTML='<video muted playsinline preload="auto" poster="assets/video/intro-c2-poster.jpg">'+
    '<source src="assets/video/intro-c2.mp4" type="video/mp4">'+
    '<source src="assets/video/intro-c2.webm" type="video/webm"></video>'+
    '<button type="button" class="spz-intro-skip" hidden>'+(th?'ข้าม ›':'Skip ›')+'</button>';
  document.body.insertBefore(box,document.body.firstChild);
  H.classList.add('spz-intro-on');
  var v=box.querySelector('video'),skip=box.querySelector('button'),done=false,started=false;
  function release(){
    if(done) return; done=true;
    try{sessionStorage.setItem('spz.intro','1');}catch(e){}
    H.classList.remove('spz-intro-on');
    var g=document.getElementById('spzGate');
    if(!g||g.hidden){ drop(); return; }
    var mo=new MutationObserver(function(){
      if(g.hidden){ mo.disconnect(); drop(); }
    });
    mo.observe(g,{attributes:true,attributeFilter:['hidden']});
  }
  function drop(){
    box.classList.add('out');
    setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); },700);
  }
  function finish(){ if(done) return; try{v.pause();}catch(e){} setTimeout(release,1300); }
  function bail(){ if(started) return; release(); }
  v.addEventListener('ended',finish);
  v.addEventListener('error',bail);box.querySelector('source:last-of-type').addEventListener('error',bail);
  v.addEventListener('playing',function(){ started=true; setTimeout(function(){skip.hidden=false;},1000); });
  skip.addEventListener('click',function(){
    try{v.pause(); v.currentTime=Math.max(0,(v.duration||12)-0.05);}catch(e){}
    finish();
  });
  var p; try{ p=v.play(); }catch(e){}
  if(p&&p.catch) p.catch(bail);
  setTimeout(bail,4000);
  setTimeout(function(){ if(!done) release(); },20000);
})();
