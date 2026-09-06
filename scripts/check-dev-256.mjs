import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [auth,views,app,groups,css,plugin,nativeApp,gradle,prepare,index,worker]=await Promise.all([
  read("auth.js"),read("views.js"),read("app.js"),read("groups.js"),read("app.css"),
  read("android/app/src/main/java/com/drawervillage/app/PlayBillingPlugin.java"),read("native-app.js"),
  read("android/app/build.gradle"),read("scripts/prepare-app.mjs"),read("index.html"),read("sw.js")
]);

assert.match(auth,/selectedResidentId/);
assert.match(auth,/drawer-village-multiplayer-context-v1/);
assert.match(auth,/listen\(refs\.residents,"residents",true\)/);
assert.doesNotMatch(auth,/groups\[0\]\?\.id/);
assert.match(views,/multiplayerObserve\(multiplayerSnapshot,nativeHome\)/);
assert.match(views,/data-multiplayer-resident/);
assert.match(views,/data-group-section-open="\$\{section\}"/);
assert.match(app,/\["groups","town","observe"\]/);
assert.match(app,/selectResident/);
for(const section of ["info","residents","homes","rules"])assert.match(groups,new RegExp(`data-group-section=\\"${section}\\"`));
assert.match(css,/x=768/);
assert.match(css,/\.tablet-observe-map\{[^}]*left:0!important;right:40%!important/);
assert.match(css,/\.game-hud-stage\{left:64\.453125%!important/);
assert.match(plugin,/regularPaidOffer/);
assert.match(plugin,/Purchase\.PurchaseState\.PURCHASED/);
assert.match(nativeApp,/NO_REGULAR_PAID_OFFER/);
assert.match(app,/products\.filter\(product=>product\.regularPaidOffer===true\)/);
assert.match(gradle,/versionCode\s+256\b/);
assert.match(gradle,/versionName\s+"1\.0\.229"/);
assert.match(prepare,/DRAWER_VILLAGE_NATIVE_BUILD="20260907dev256"/);
assert.match(index,/app\.js\?v=20260907dev256/);
assert.match(worker,/drawer-village-v20260907-dev-256/);

console.log("PASS dev 256: SVG tablet home layout, multiplayer context routing, and paid-offer integrity");
