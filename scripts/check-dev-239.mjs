import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const gradle=read("android/app/build.gradle"),state=read("state.js"),views=read("views.js"),app=read("app.js"),css=read("home-scene-layout.css"),groups=read("groups.js"),sw=read("sw.js");

assert(/versionCode\s+239\b/.test(gradle),"Android versionCode must be 239");
assert(/versionName\s+"1\.0\.219"/.test(gradle),"Android versionName must be 1.0.219");
assert(sw.includes("drawer-village-v20260906-dev-239"),"service worker cache must use dev 239");
assert(state.includes("customized:layout.customized===true||changed"),"legacy non-default layouts must migrate to customized layouts");
assert(views.includes("!characterLayout.customized&&outfitLayout"),"outfit placement must only be a fallback before character customization");
assert(views.includes("data-home-layout-save"),"placement editor must render an explicit save action");
assert(app.includes("customized:true")&&app.includes("dialog.close(\"save\")"),"save action must persist customized placement and close the editor");
assert(css.includes(".home-layout-save-bar{position:sticky"),"placement save action must remain visible in the phone viewport");
assert(views.includes('"배치 저장":"Save placement"')&&views.includes('"배치 저장":"配置を保存"'),"placement save action must be translated to English and Japanese");
assert(groups.includes("export function renderGroups"),"group development work must remain present after the hotfix carry-forward");

console.log("PASS dev 239: character placement persistence coexists with relationship and group development");
