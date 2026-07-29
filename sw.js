const CACHE='lifelog-v42-gameboard-20260730';
const ASSETS=['./','./index.html','./house-v42.js','./home-v42.js','./world-v42.js','./login.html','./terms.html','./privacy.html','./social-preview.png','./manifest.webmanifest','./icons/icon-32.png','./icons/icon-192.png','./icons/icon-512.png','./icons/room-living.svg','./icons/room-kitchen.svg','./icons/room-bedroom.svg','./icons/room-bath.svg','./icons/room-study.svg','./world-assets/developer-town.svg','./world-assets/developer-city.svg','./world-assets/developer-park.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('/config.js')){
  e.respondWith(fetch(e.request,{cache:'no-store'}));
  return;
 }
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
