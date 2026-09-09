import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const activity=read("android/app/src/main/java/com/drawervillage/app/MainActivity.java");
const gradle=read("android/app/build.gradle");
const prepareApp=read("scripts/prepare-app.mjs");

assert(/versionCode\s+246\b/.test(gradle),"Android versionCode must be 246");
assert(/versionName\s+"1\.0\.223"/.test(gradle),"Android versionName must be 1.0.223");
assert(prepareApp.includes('DRAWER_VILLAGE_NATIVE_BUILD="20260906dev246"'),"diagnostic build tag must advance");
assert(activity.includes("Type.systemBars()"),"immersive mode must hide both status and navigation bars");
assert(activity.includes("BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE"),"system gestures must remain available through transient bars");
assert(activity.includes("public void onResume()")&&activity.includes("if (hasFocus) hideSystemBars()"),"immersive mode must be restored after app and window focus return");
assert(activity.includes("setNavigationBarContrastEnforced(false)"),"Samsung navigation-bar contrast scrim must be disabled");
assert(activity.includes("params.bottomMargin = navigation.bottom"),"visible navigation bars must retain the existing bottom safety fallback");

console.log("dev 246 Android immersive navigation checks passed");
