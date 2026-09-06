import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const css=read("app.css"),auth=read("auth.js"),gradle=read("android/app/build.gradle"),groups=read("groups.js");

assert(/versionCode\s+237\b/.test(gradle),"Android versionCode must be 237");
assert(/versionName\s+"1\.0\.218"/.test(gradle),"Android versionName must be 1.0.218");
assert(css.includes(".relationship-viewpoint-dialog>form{position:relative!important;display:block!important;width:min(100%,412px)!important;height:100dvh!important;min-height:0!important"),"viewpoint form must own the vertical scroll area");
assert(css.includes(".relationship-viewpoint-dialog .relationship-all-fields{position:relative!important"),"viewpoint fields must contribute to scroll height");
assert(css.includes(".relationship-fullscreen-dialog>form,.relationship-fullscreen-dialog .relationship-all-fields){touch-action:pan-y}"),"native relationship forms must allow vertical panning");
assert(!css.includes(":is(.relationship-stage,.relationship-fullscreen-dialog,.relationship-fullscreen-dialog *){touch-action:manipulation}"),"fullscreen descendants must not globally capture the scroll gesture");
assert(auth.includes("rememberGuestHandoffIntent();")&&auth.includes("window.ParallelCity.replaceState(guestHandoff);"),"first Google login must retain pre-login device characters");
assert(groups.includes("export function renderGroups"),"group development work must remain present after the hotfix carry-forward");

console.log("PASS dev 237: relationship scrolling and first-login data handoff coexist with group MVP");
