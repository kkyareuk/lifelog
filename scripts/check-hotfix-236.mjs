import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const css=read("app.css");
const auth=read("auth.js");
const gradle=read("android/app/build.gradle");

assert(/versionCode\s+236\b/.test(gradle),"Android versionCode must be 236");
assert(/versionName\s+"1\.0\.204\.4"/.test(gradle),"Android versionName must be 1.0.204.4");
assert(css.includes(".relationship-viewpoint-dialog>form{position:relative!important;display:block!important;width:min(100%,412px)!important;height:100dvh!important;min-height:0!important"),"viewpoint form must own the viewport-height scroll area");
assert(css.includes("overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important"),"viewpoint editor must allow native vertical panning");
assert(css.includes(".relationship-viewpoint-dialog .relationship-all-fields{position:relative!important"),"viewpoint fields must participate in scroll height");
assert(!css.includes(":is(.relationship-stage,.relationship-fullscreen-dialog,.relationship-fullscreen-dialog *){touch-action:manipulation}"),"fullscreen descendants must not globally suppress the scroll gesture");
assert(css.includes(".relationship-fullscreen-dialog>form,.relationship-fullscreen-dialog .relationship-all-fields){touch-action:pan-y}"),"native relationship forms must explicitly keep vertical panning");
assert(auth.includes("rememberGuestHandoffIntent();"),"first-login flow must capture guest data before authentication");
assert(auth.includes("window.ParallelCity.replaceState(guestHandoff);"),"first-login flow must adopt guest data into the account scope");
assert(auth.includes("await upload({silent:true,accountTransition:true});"),"adopted device data must be uploaded to the signed-in account");

console.log("hotfix 236 checks passed");
