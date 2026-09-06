import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const app=read("app.js"),views=read("views.js"),state=read("state.js"),css=read("home-scene-layout.css"),index=read("index.html"),sw=read("sw.js"),gradle=read("android/app/build.gradle");

assert(/versionCode\s+238\b/.test(gradle),"Android versionCode must be 238");
assert(/versionName\s+"1\.0\.215\.2"/.test(gradle),"Android versionName must be 1.0.215.2");
assert(index.includes('app.js?v=20260906hotfix238')&&index.includes('home-scene-layout.css?v=20260906hotfix238'),"updated app and placement CSS must bypass old caches");
assert(sw.includes('drawer-village-v20260906-hotfix-238'),"service worker cache must advance");
assert(state.includes('customized:layout.customized===true||changed'),"legacy non-default placements must migrate to explicit character placements");
assert(views.includes('!characterLayout.customized&&outfitLayout'),"explicit character placement must win over wardrobe defaults");
assert(views.includes('data-home-layout-save'),"placement dialog must expose an explicit save button");
assert(app.includes("editor.querySelector('[data-home-layout-save]')")&&app.includes('dialog.close("save")'),"save button must persist and close the placement dialog");
assert(app.includes('customized:true'),"saved placement must be marked as the character-level source of truth");
assert(css.includes('.home-layout-save-bar{position:sticky'),"save action must remain visible above the viewport bottom");
assert(views.includes('"배치 저장":"Save placement"')&&views.includes('"배치 저장":"配置を保存"'),"save action must be translated in English and Japanese");

console.log("hotfix 238 checks passed");
