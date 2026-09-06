import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),appCss=read("app.css"),prepareApp=read("scripts/prepare-app.mjs");
const manifest=read("android/app/src/main/AndroidManifest.xml");
const gradle=read("android/app/build.gradle");

assert.match(gradle,/versionCode\s+224/);
assert.match(gradle,/versionName\s+"1\.0\.207"/);

assert.match(manifest,/android:appCategory="game"/);
assert.match(manifest,/android:screenOrientation="portrait"/);
assert.match(manifest,/android\.window\.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY/);
assert.match(prepareApp,/nativeTabletPhoneLayout="\$\{platform\}"==="android"&&Math\.min\(screen\.width,screen\.height\)>=600/);
assert.match(prepareApp,/setAttribute\("content","width=480,viewport-fit=cover"\)/);
assert.match(prepareApp,/window\.DRAWER_VILLAGE_TABLET_PHONE_LAYOUT=nativeTabletPhoneLayout/);
assert.match(views,/if\(nativeApp&&state\.characterSettingsView!=="full"\)return nativeCharacterHub\(c\)/);

assert.match(appCss,/\.town-native-title\{position:absolute;left:32\.5%;right:156px;top:31px/);
assert.match(appCss,/\.town-native-title>\.town-native-name\{[^}]*font-size:20px!important[^}]*line-height:35px!important/);
assert.match(appCss,/\.game-hud-profile-copy\{\s*position:absolute!important;left:calc\(32\.5vw - 1\.7vw\)!important;top:calc\(31px - 3\.38dvh\)!important/);
assert.match(appCss,/\.game-hud-profile-copy b\{[^}]*font-size:20px!important[^}]*line-height:35px!important/);
assert.match(appCss,/\.game-hud-profile-copy\{left:86px!important;top:-3px!important\}/);
assert.match(appCss,/\.town-native-title>\.town-native-name\{[^}]*font-size:25px!important[^}]*line-height:38px!important/);

console.log("PASS 224: Android tablets are portrait phone-layout apps, including character UI, with unified HUD titles");
