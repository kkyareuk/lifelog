const CACHE_VERSION="drawer-village-v20260803ay";
const CORE=[
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./state.js",
  "./simulation.js",
  "./views.js",
  "./auth.js",
  "./manifest.webmanifest",
  "./social-preview.png",
  "./world-assets/cozy-town.png",
  "./world-assets/downtown.png",
  "./world-assets/department-store-premium.png",
  "./world-assets/drawer-building.png",
  "./world-assets/drawer-home.png",
  "./world-assets/medieval-castle.svg",
  "./world-assets/medieval-tavern.svg",
  "./world-assets/medieval-market.svg",
  "./payment.html",
  "./payment-success.html",
  "./payment-fail.html",
  "./icons/drawer-village-logo.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_VERSION).then(cache=>Promise.allSettled(CORE.map(asset=>cache.add(asset)))).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.endsWith("/config.js")){
    event.respondWith(fetch(event.request,{cache:"no-store"}));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html"))));
});
