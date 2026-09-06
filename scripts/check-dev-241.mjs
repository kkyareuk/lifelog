import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const gradle=read("android/app/build.gradle"),state=read("state.js"),views=read("views.js"),app=read("app.js"),audio=read("audio.js"),responsive=read("observe-responsive.js"),groups=read("groups.js"),sw=read("sw.js");

assert(/versionCode\s+241\b/.test(gradle),"Android versionCode must be 241");
assert(/versionName\s+"1\.0\.220"/.test(gradle),"Android versionName must be 1.0.220");
assert(sw.includes("drawer-village-v20260906-dev-241"),"service worker cache must use dev 241");
assert(state.includes("customized:layout.customized===true||changed"),"legacy non-default layouts must migrate to customized layouts");
assert(views.includes("!characterLayout.customized&&outfitLayout")&&views.includes("data-home-layout-save"),"character placement hotfix must remain present");
assert(views.includes('if(!shouldRenderTabletObserveMap())return ""'),"phone Observe must not render the tablet town map");
assert(responsive.includes('Math.min(Number(currentScreen.width)||0,Number(currentScreen.height)||0)>=600'),"phone landscape must not be mistaken for a tablet");
assert(audio.includes("element.getClientRects().length>0"),"movement audio must reject CSS-hidden actors");
assert(app.includes('views.js?v=20260906dev241')&&app.includes('audio.js?v=20260906dev241'),"fixed Observe and audio modules must bypass old caches");
assert(groups.includes("export function renderGroups"),"group development work must remain present after the hotfix carry-forward");

console.log("PASS dev 241: placement, phone audio isolation, tablet Observe and group development coexist");
