import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),appCss=read("app.css"),bookCss=read("character-book.css"),homeEditor=read("home-editor-ui.js");
const prepareApp=read("scripts/prepare-app.mjs"),manifest=read("android/app/src/main/AndroidManifest.xml"),gradle=read("android/app/build.gradle"),index=read("index.html");

assert.match(gradle,/versionCode\s+226/);
assert.match(gradle,/versionName\s+"1\.0\.209"/);
assert.doesNotMatch(manifest,/android:screenOrientation=/);
assert.doesNotMatch(manifest,/PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY/);
assert.doesNotMatch(prepareApp,/nativeTabletPhoneLayout|width=480|DRAWER_VILLAGE_TABLET_PHONE_LAYOUT/);
assert.match(app,/Math\.min\(screen\.width,screen\.height\)>=600\)\{screen\.orientation\?\.unlock/);

assert.match(views,/class="tablet-character-summary"/);
assert.match(bookCss,/\.tablet-character-summary\{display:none!important\}/);
assert.match(views,/fullPageEntries\.slice\(fullSpreadStart,fullSpreadStart\+2\)/);
assert.match(views,/data-book-layout="spread"/);
assert.match(bookCss,/@media\(min-width:721px\) and \(orientation:landscape\)/);
assert.match(appCss,/button\.town-decoration\{[^}]*border:0!important[^}]*outline:0!important[^}]*background:transparent!important/);

assert.match(views,/if\(activeUsers\.length\)bedStates\.set\(bedId,"under-cover"\)/);
assert.match(views,/localBedX=bedSlot===0\?-4\.6\*bedVisualScale:bedSlot===1\?4\.6\*bedVisualScale:0,localBedY=bedSlot>=0\?-4\.9\*bedVisualScale:0/);
assert.match(views,/bedFaceSize=Math\.round\(Math\.max\(44,Math\.min\(54,48\*bedPlacementScale\)\)\)/);
assert.match(views,/bedConversation:Boolean\(sharedBed\),hideStatus:Boolean\(sharedBed\)/);
assert.match(views,/homeBedForegroundStatusMarkup\(pair,pair\.map\(sceneFor\),room,key,sharedBed,index,\{shared:true\}\)/);
assert.match(views,/class="room-foreground-layer"/);
assert.ok(views.indexOf('roomFurnitureOverlayMarkup(room,bedStates)')<views.lastIndexOf('class="room-foreground-layer"'),"bed status foreground renders after the quilt and footboard overlay");
assert.match(appCss,/\.room-foreground-layer\{[^}]*z-index:6/);
assert.match(appCss,/\.home-bed-foreground-status\.is-shared \.home-interaction-status/);
assert.match(appCss,/--bed-face-size,48px/);
assert.match(appCss,/@keyframes home-bed-conversation-left/);
assert.match(appCss,/@keyframes home-bed-conversation-right/);
assert.match(homeEditor,/Number\(person\.dataset\.bedSlot\)===0\?-\.18:\.18/);
assert.match(homeEditor,/underCover\?42:34/);
assert.match(homeEditor,/paintedWidth\*\(underCover\?\.46:\.38\)/);
assert.match(homeEditor,/home-bed-foreground-status\[data-bed-status-for\]/);
assert.match(appCss,/game-hud-profile-copy\{\s*position:absolute!important;left:22\.57vw!important;top:1\.197dvh!important/);
assert.match(appCss,/game-hud-profile-copy b\{[^}]*font-size:clamp\(18px,5\.05vw,23px\)!important[^}]*line-height:25px!important/);
assert.match(appCss,/home-native-meta\{position:absolute;left:max\(86px,calc\(24\.27vw - 40px\)\);right:12px;top:calc\(4\.577dvh - 3px\)/);
assert.match(appCss,/town-native-title\{position:absolute;left:max\(86px,calc\(24\.27vw - 40px\)\);right:156px;top:calc\(4\.577dvh - 3px\)/);
assert.match(index,/app\.css\?v=20260906dev226/);
assert.doesNotMatch(`${views}\n${app}\n${prepareApp}\n${index}`,/20260905dev225/);

console.log("PASS 226: tablet layout remains restored; bed activities align larger faces to pillows under the quilt, animate conversations in bed, and render one shared foreground status");
