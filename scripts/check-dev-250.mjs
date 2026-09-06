import assert from "node:assert/strict";
import {readFile,stat} from "node:fs/promises";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [state,views,groups,appCss,shopCss,index,prepare,gradle,sw]=await Promise.all([
  read("state.js"),read("views.js"),read("groups.js"),read("app.css"),read("shop.css"),read("index.html"),read("scripts/prepare-app.mjs"),read("android/app/build.gradle"),read("sw.js")
]);

assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=250);
assert.match(gradle,/versionName "1\.0\.\d+"/);
assert.match(prepare,/DRAWER_VILLAGE_NATIVE_BUILD="20260907dev254"/);
assert.match(index,/app\.js\?v=20260907dev254/);
assert.match(index,/shop\.css\?v=20260907dev254/);
assert.match(sw,/drawer-village-v20260907-dev-254/);

assert.match(state,/personalTownLabel:"내 마을"/);
assert.match(state,/x\.personalTownLabel=String\(x\.personalTownLabel\|\|"내 마을"\)/);
assert.match(views,/data-setting="personalTownLabel"/);
assert.match(views,/t\("그룹·멀티","그룹·멀티"\)/);
assert.match(views,/state\.personalTownLabel\|\|t\("내 마을","내 마을"\)/);
assert.match(views,/drawer-shop-nerine\.png/);
assert.match(views,/drawer-shop-greeting/);
assert.match(shopCss,/\.drawer-shop-greeting/);
await stat(new URL("../assets/shop/drawer-shop-nerine.png",import.meta.url));

assert.doesNotMatch(groups,/state\.world\?\.bg/);
assert.match(groups,/multiplayer-town-placeholder/);
assert.match(groups,/multiplayer-linked-town-art/);
assert.match(appCss,/\.game-hud-location :is\(img,i\)[^{]*\{[^}]*object-fit:contain!important/);
assert.match(appCss,/\.town-native-context\{[^}]*left:24\.27vw/);

console.log("dev 250 shop, multiplayer, header and location icon checks passed");
