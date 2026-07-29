const CACHE='lifelog-v44-dual-map-20260730';
const ASSETS=['./','./index.html','./house-v44.js','./home-v44.js','./google-bridge-v44.js','./world-v44.js','./stability-v44.js','./login.html','./terms.html','./privacy.html','./social-preview.png','./manifest.webmanifest','./place-assets/default-venues-v43.png','./icons/icon-32.png','./icons/icon-192.png','./icons/icon-512.png','./icons/room-living-v43.svg','./icons/room-kitchen-v43.svg','./icons/room-bedroom-v43.svg','./icons/room-bath-v43.svg','./icons/room-study-v43.svg','./world-assets/developer-town.svg','./world-assets/developer-city.svg','./world-assets/developer-park.svg'];
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
