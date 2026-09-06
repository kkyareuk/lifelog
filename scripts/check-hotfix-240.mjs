import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const app=read("app.js"),views=read("views.js"),audio=read("audio.js"),responsive=read("observe-responsive.js"),index=read("index.html"),sw=read("sw.js"),gradle=read("android/app/build.gradle");

assert(/versionCode\s+240\b/.test(gradle),"Android versionCode must be 240");
assert(/versionName\s+"1\.0\.215\.3"/.test(gradle),"Android versionName must be 1.0.215.3");
assert(index.includes('app.js?v=20260906hotfix240'),"updated app must bypass old caches");
assert(sw.includes('drawer-village-v20260906-hotfix-240'),"service worker cache must advance");
assert(views.includes('shouldRenderTabletObserveMap} from "./observe-responsive.js?v=20260906hotfix240"'),"Observe must use the responsive tablet-map gate");
assert(views.includes('if(!shouldRenderTabletObserveMap())return ""'),"phone Observe must not render the tablet town map");
assert(responsive.includes('Math.min(Number(currentScreen.width)||0,Number(currentScreen.height)||0)>=600'),"phone landscape must not be mistaken for a tablet");
assert(audio.includes("element.getClientRects().length>0"),"movement audio must reject CSS-hidden actors");
assert(app.includes('audio.js?v=20260906hotfix240'),"the fixed audio module must bypass the previous Android asset cache");
assert(app.includes('state.activeTab==="observe")setTimeout(render,120)'),"Observe must rebuild its tablet-only DOM after rotation");
assert(views.includes('data-home-layout-save')&&views.includes('!characterLayout.customized&&outfitLayout'),"placement persistence and its explicit save action must remain included");

console.log("hotfix 240 checks passed");
