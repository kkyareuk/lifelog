import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const app=read("app.js"),views=read("views.js"),state=read("state.js"),dictionary=read("dictionary.js"),index=read("index.html"),sw=read("sw.js"),gradle=read("android/app/build.gradle"),prepareApp=read("scripts/prepare-app.mjs"),prepareWeb=read("scripts/prepare-web.mjs");

assert(/versionCode\s+243\b/.test(gradle),"Android versionCode must be 243");
assert(/versionName\s+"1\.0\.215\.4"/.test(gradle),"Android versionName must be 1.0.215.4");
assert(index.includes("app.js?v=20260906hotfix243"),"the hotfix app must bypass old Android caches");
assert(sw.includes("drawer-village-v20260906-hotfix-243"),"the service worker cache must advance");
assert(prepareApp.includes('DRAWER_VILLAGE_NATIVE_BUILD="20260906hotfix243"'),"native diagnostic build tag must advance");
assert(prepareWeb.includes('expectedModuleCache="20260906hotfix243"'),"web module closure must use one cache key");

assert(state.includes('"weapon","animal"'),"new and existing saves must receive an animal catalog collection");
assert(views.includes('weapon:"무기",animal:"동물"'),"Dictionary must expose the animal tab");
assert(views.includes('animal:["개","고양이","새","토끼","말"'),"Dictionary must expose animal categories");
assert(views.includes('weapon:"⚔️",animal:"🐾"'),"Dictionary must render an animal icon");
assert(app.includes('animal:["🐕","🐈","🐇","🦜"]'),"animal entries must offer built-in illustrations");
assert(views.includes("['좋아하는 동물 · 사전','animal']"),"favorite and dislike settings must remain wired to the animal catalog");
assert(views.includes('"동물":"Animals"')&&views.includes('"동물":"動物"'),"animal dictionary labels must be translated in English and Japanese");
assert(dictionary.includes('data-dict-add'),"the generic Dictionary add action must remain available for every catalog kind");

console.log("hotfix 243 animal dictionary checks passed");
