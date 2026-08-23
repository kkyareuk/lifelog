const CACHE_VERSION="drawer-village-v20260823-character-svg-fidelity1";
const CORE=[
  "./",
  "./index.html",
  "./login.html",
  "./terms.html",
  "./privacy.html",
  "./app.css",
  "./town-fit.css",
  "./interface-system.css",
  "./home-scene-layout.css",
  "./theme.css",
  "./app.js",
  "./state.js",
  "./simulation.js",
  "./views.js",
  "./auth.js",
  "./local-media.js",
  "./speech-styles.js",
  "./character-notifications.js",
  "./fonts/Ownglyph_Corncorn.ttf",
  "./fonts/ChangwonDangamRound-Regular.woff2",
  "./fonts/DoHyeon-Regular.ttf",
  "./fonts/GriunSimsimche-Regular.ttf",
  "./fonts/KCC-Hanbit.ttf",
  "./fonts/KoPubWorldBatangPro-Bold.otf",
  "./fonts/KoPubWorldBatangPro-Light.otf",
  "./fonts/PuradakGentleGothic.ttf",
  "./fonts/SB_Aggro/SB%20%EC%96%B4%EA%B7%B8%EB%A1%9C%20M.ttf",
  "./manifest.webmanifest",
  "./icons/drawer-village-logo.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
  ,"./icons/mailbox.png"
  ,"./icons/town-map.png"
  ,"./assets/home-ui/profile-ring.png"
  ,"./assets/home-ui/profile-placeholder.png"
  ,"./assets/home-ui/catalog.png"
  ,"./assets/home-ui/relationship.png"
  ,"./assets/home-ui/routine.png"
  ,"./assets/home-ui/statistics.png"
  ,"./assets/home-ui/settings.png"
  ,"./assets/home-ui/home.png"
  ,"./assets/home-ui/mailbox.png"
  ,"./assets/home-ui/ink.png"
  ,"./assets/home-ui/shop.png"
  ,"./assets/home-ui/town.png"
  ,"./assets/home-ui/back.png"
  ,"./assets/home-ui/wood-top.png"
  ,"./assets/character-ui/paper.webp"
  ,"./assets/character-ui/wallet.png"
  ,"./assets/character-ui/registration-card.png"
  ,"./assets/character-ui/ribbon-profile.png"
  ,"./assets/character-ui/ribbon-body.png"
  ,"./assets/character-ui/ribbon-personality.png"
  ,"./assets/character-ui/ribbon-taste.png"
  ,"./assets/character-ui/ribbon-world.png"
  ,"./assets/character-ui/ribbon-manage.png"
  ,"./assets/character-ui/add.png"
  ,"./assets/character-ui/back.png"
  ,"./world-assets/building-types/restaurant-handdrawn.png"
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
  if(/\.(?:png|jpe?g|webp|gif|svg|woff2?|ttf)$/i.test(url.pathname)){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(event.request,copy));}
      return response;
    })));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_VERSION).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./index.html"))));
});
