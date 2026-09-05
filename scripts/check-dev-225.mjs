import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),appCss=read("app.css"),bookCss=read("character-book.css");
const prepareApp=read("scripts/prepare-app.mjs"),manifest=read("android/app/src/main/AndroidManifest.xml"),gradle=read("android/app/build.gradle");

assert.match(gradle,/versionCode\s+225/);
assert.match(gradle,/versionName\s+"1\.0\.208"/);
assert.doesNotMatch(manifest,/android:screenOrientation=/);
assert.doesNotMatch(manifest,/PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY/);
assert.doesNotMatch(prepareApp,/nativeTabletPhoneLayout|width=480|DRAWER_VILLAGE_TABLET_PHONE_LAYOUT/);
assert.match(app,/Math\.min\(screen\.width,screen\.height\)>=600\)\{screen\.orientation\?\.unlock/);
assert.match(app,/state\.activeTab==="character"&&state\.characterSettingsView==="full"\)setTimeout\(render,120\)/);

assert.match(views,/class="tablet-character-summary"/);
assert.match(bookCss,/\.tablet-character-summary\{display:none!important\}/);
assert.match(bookCss,/\.character-hub-shell\{display:grid!important;place-items:center!important/);
assert.match(views,/const fullPageEntries=\[/);
assert.match(views,/fullPageEntries\.slice\(fullSpreadStart,fullSpreadStart\+2\)/);
assert.match(views,/data-book-layout="spread"/);
assert.match(views,/data-character-spread-step="-1"/);
assert.match(app,/function moveCharacterBookSpread\(direction\)/);
assert.match(bookCss,/@media\(min-width:721px\) and \(orientation:landscape\)/);
assert.match(bookCss,/character-book-spread-layout \.character-book-v8-book\{[^}]*assets\/character-ui\/book\.png/);
for(const text of ["Character information","Previous two pages","Next two pages","人物情報","前の2ページ","次の2ページ"])assert.ok(views.includes(text),`missing tablet translation: ${text}`);

assert.match(appCss,/button\.town-decoration\{[^}]*border:0!important[^}]*outline:0!important[^}]*background:transparent!important/);
assert.match(appCss,/button\.town-decoration>\.building-preset-image\{[^}]*border:0!important[^}]*outline:0!important/);
assert.match(appCss,/@media\(min-width:721px\) and \(orientation:portrait\)\{[^}]*game-hud-stage\{place-items:end center!important/);
assert.match(appCss,/native-character-stage\{width:min\(52vw,390px\)!important;height:min\(44dvh,530px\)!important/);
assert.doesNotMatch(`${views}\n${app}\n${prepareApp}`,/20260905dev224/);

console.log("PASS 225: tablet rotation and iPad layout restored, character details render, landscape full settings use two-page spreads, and town decoration hitboxes are invisible");
