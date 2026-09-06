import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),css=read("app.css"),homeEditor=read("home-editor-ui.js"),nativeExport=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java");
const prepareApp=read("scripts/prepare-app.mjs"),manifest=read("android/app/src/main/AndroidManifest.xml"),gradle=read("android/app/build.gradle"),index=read("index.html"),auth=read("auth.js");

assert.match(gradle,/versionCode\s+228/);assert.match(gradle,/versionName\s+"1\.0\.211"/);
assert.doesNotMatch(manifest,/android:screenOrientation=|PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY/);
assert.match(index,/app\.css\?v=20260906dev228/);assert.match(prepareApp,/DRAWER_VILLAGE_NATIVE_BUILD="20260906dev228"/);
assert.doesNotMatch(`${views}\n${app}\n${auth}\n${prepareApp}\n${index}`,/20260906dev22[67]/);

assert.match(views,/activeCoupleBedGroups\.set\(bedId,activeUsers\.slice\(0,2\)\)/);
assert.match(views,/bedConversation:true,hideStatus:true/);
assert.match(views,/conversing&&!bedConversation\?`<i class="home-person-chat-bubble"/);
assert.match(homeEditor,/Math\.min\(underCover\?64:56/);
assert.match(css,/--bed-face-size,52px/);
assert.match(views,/class="resident-profile-picture"/);
assert.match(css,/\.resident-profile-picture\{[^}]*aspect-ratio:1[^}]*overflow:hidden[^}]*border-radius:50%/);
assert.match(css,/\.resident-profile-picture>\.avatar\{object-fit:cover!important\}/);

assert.match(nativeExport,/@PluginMethod\s+public void saveJson\(PluginCall call\)/);
assert.match(nativeExport,/MediaStore\.Downloads\.EXTERNAL_CONTENT_URI/);
assert.match(nativeExport,/data\.getBytes\(StandardCharsets\.UTF_8\)/);
assert.match(app,/window\.Capacitor\?\.isNativePlatform\?\.\(\)&&nativeExport\?\.saveJson/);
assert.match(app,/await nativeExport\.saveJson\(\{filename,data:json\}\)/);
assert.match(app,/application\/json;charset=utf-8/);

assert.match(auth,/FIRST_LOGIN_GUEST_HANDOFF/);
assert.match(auth,/rememberGuestHandoffIntent/);
assert.match(auth,/takeGuestHandoff/);

assert.match(css,/game-hud-profile-copy\{\s*position:absolute!important;left:22\.57vw!important;top:1\.197dvh!important/);
assert.match(css,/home-native-meta\{position:absolute;left:max\(86px,calc\(24\.27vw - 40px\)\)/);
assert.match(css,/town-native-title\{position:absolute;left:max\(86px,calc\(24\.27vw - 40px\)\)/);

console.log("PASS 228: Android backup export writes JSON through MediaStore; first-login adoption remains protected; bed, portrait, tablet, and header fixes remain intact");
