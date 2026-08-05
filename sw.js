const CACHE_VERSION="drawer-village-v20260805aj";
const CORE=[
  "./",
  "./index.html",
  "./login.html",
  "./config.js",
  "./terms.html",
  "./privacy.html",
  "./app.css",
  "./app.js",
  "./state.js",
  "./simulation.js",
  "./views.js",
  "./auth.js",
  "./fonts/Ownglyph_Corncorn.ttf",
  "./fonts/DoHyeon-Regular.ttf",
  "./fonts/SB_Aggro/SB%20%EC%96%B4%EA%B7%B8%EB%A1%9C%20M.ttf",
  "./manifest.webmanifest",
  "./world-assets/cozy-town.png",
  "./world-assets/drawer-building.png",
  "./world-assets/drawer-home.png",
  "./world-assets/building-shapes.csv",
  "./world-assets/building-types/generic.png",
  "./world-assets/building-types/cafe.png",
  "./world-assets/building-types/restaurant.png",
  "./world-assets/building-types/hospital.png",
  "./world-assets/building-types/office.png",
  "./world-assets/building-types/shop.png",
  "./world-assets/building-types/school.png",
  "./world-assets/building-types/lodging.png",
  "./world-assets/building-types/library.png",
  "./world-assets/building-types/theater.png",
  "./world-assets/building-types/park.png",
  "./world-assets/building-types/home.png",
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
