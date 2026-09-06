import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),appCss=read("app.css"),bookCss=read("character-book.css"),homeEditor=read("home-editor-ui.js");
const prepareApp=read("scripts/prepare-app.mjs"),manifest=read("android/app/src/main/AndroidManifest.xml"),gradle=read("android/app/build.gradle"),index=read("index.html");

assert.match(gradle,/versionCode\s+227/);
assert.match(gradle,/versionName\s+"1\.0\.210"/);
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

assert.match(views,/activeCoupleBedGroups\.set\(bedId,activeUsers\.slice\(0,2\)\)/);
assert.match(views,/const pair=bedPair\.slice\(0,2\),sharedBed=coupleBedPlacements\.get\(pair\[0\]\.id\)/);
assert.match(views,/bedConversation:true,hideStatus:true/);
assert.match(views,/conversing&&!bedConversation\?`<i class="home-person-chat-bubble"/);
assert.match(views,/homeBedForegroundStatusMarkup\(pair,pair\.map\(sceneFor\),room,key,sharedBed,index,\{shared:true\}\)/);
assert.match(views,/class="room-foreground-layer"/);
assert.ok(views.indexOf('roomFurnitureOverlayMarkup(room,bedStates)')<views.lastIndexOf('class="room-foreground-layer"'),"bed status foreground renders after the quilt and footboard overlay");
assert.match(appCss,/\.room-foreground-layer\{[^}]*z-index:6/);
assert.match(appCss,/--bed-face-size,52px/);
assert.match(homeEditor,/underCover\?46:36/);
assert.match(homeEditor,/paintedWidth\*\(underCover\?\.32:\.28\)/);
assert.match(homeEditor,/Math\.min\(underCover\?64:56/);
assert.match(appCss,/@keyframes home-bed-conversation-left/);
assert.match(appCss,/@keyframes home-bed-conversation-right/);

assert.match(views,/class="resident-profile-picture"/);
assert.match(appCss,/\.resident-profile-picture\{[^}]*aspect-ratio:1[^}]*overflow:hidden[^}]*border-radius:50%/);
assert.match(appCss,/\.resident-profile-picture>\.avatar\{object-fit:cover!important\}/);
assert.match(appCss,/\.resident-profile-picture>\.sprite\{[^}]*object-fit:contain!important\}/);

assert.match(appCss,/game-hud-profile-copy\{\s*position:absolute!important;left:22\.57vw!important;top:1\.197dvh!important/);
assert.match(appCss,/home-native-meta\{position:absolute;left:max\(86px,calc\(24\.27vw - 40px\)\);right:12px;top:calc\(4\.577dvh - 3px\)/);
assert.match(appCss,/town-native-title\{position:absolute;left:max\(86px,calc\(24\.27vw - 40px\)\);right:156px;top:calc\(4\.577dvh - 3px\)/);
assert.match(index,/app\.css\?v=20260906dev227/);
assert.doesNotMatch(`${views}\n${app}\n${prepareApp}\n${index}`,/20260906dev226/);

console.log("PASS 227: shared bed users render once at a bounded size without duplicate bubbles/cards; summary portraits use a filled square circle; tablet and header fixes remain intact");
