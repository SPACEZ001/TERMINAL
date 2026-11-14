/* SPACEZ TERMINAL service worker (2026-11-15) -- lets the site install as an app and open offline.
   Network first for every same-origin GET (the site deploys often and its files are not versioned,
   so a cache-first worker would serve old code); the cache is only a fallback when offline.
   Cross-origin requests, Range requests and no-store requests are left alone. */
var CACHE = 'spz-v1';
var CORE = ['./SPACEZ_TERMINAL.html', './manifest.webmanifest', './assets/icons/icon-192.png', './assets/icons/icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){}).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k.indexOf('spz-') === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
function keyOf(req){
  var u = new URL(req.url);
  if (/\/data\/[^/]+\.json$/.test(u.pathname)) u.search = '';   /* data files carry ?v= cache-busters */
  u.hash = '';
  return u.toString();
}
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin !== self.location.origin) return;
  if (req.headers.get('range') || req.cache === 'no-store') return;
  if (/\.(bin)$/.test(u.pathname)) return;   /* encrypted Brain bundle: always from the network */
  e.respondWith(fetch(req).then(function(res){
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ return c.put(keyOf(req), copy); }).catch(function(){});
    }
    return res;
  }).catch(function(){
    return caches.match(keyOf(req)).then(function(hit){
      if (hit) return hit;
      if (req.mode === 'navigate') return caches.match(new URL('./SPACEZ_TERMINAL.html', self.location).toString());
      return Response.error();
    });
  }));
});
