import assert from "node:assert/strict";
import {readFile,stat} from "node:fs/promises";
import {TOWN_ILLUSTRATIONS,normalizeTownProfile} from "../town-profile.js";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [app,views,state,css,bookCss,shopCss,config,backend,gradle]=await Promise.all([
  read("app.js"),read("views.js"),read("state.js"),read("app.css"),read("character-book.css"),read("shop.css"),read("config.js"),read("functions/index.js"),read("android/app/build.gradle")
]);

assert.match(app,/data-character-placement-open/);
const placement=await read("character-placement.js");
for(const value of ["always-left","prefer-left","random","prefer-right","always-right"])assert.match(placement,new RegExp(value));
assert.match(state,/animationPlacement/);
assert.match(views,/relationshipAnimationOrder/);
assert.match(views,/members\.includes\(sourceId\)&&members\.includes\(targetId\)/);
assert.match(css,/relationship-placement-dialog/);
assert.doesNotMatch(css,/relationship-stage\{[^}]+relationship-mosaic/s);

for(const label of ["관심사 선택","취미 선택","기술 숙련 선택","좋아하는 것 선택","좋아하는 것 · 사전 선택","소지품 선택"])assert.match(views,new RegExp(label));
assert.match(views,/taste-menu-grid/);
assert.doesNotMatch(views,/bookPageControls\(11/);
assert.doesNotMatch(views,/bookPageControls\(12/);
assert.match(bookCss,/Merged character settings page 10/);

assert.equal(TOWN_ILLUSTRATIONS.length,1);
assert.equal(normalizeTownProfile({bg:"world-assets/generated.png"}).bg,"world-assets/owner-forest-town.webp");
assert.doesNotMatch(views,/data-town-illustration-open/);
assert.match(views,/townBackgroundMarkup/);

assert.doesNotMatch(config,/open_celebration_bundle/);
assert.doesNotMatch(backend,/open_celebration_bundle/);
assert.doesNotMatch(views,/open_celebration_bundle/);
for(const id of ["character_slots_5","town_slot_1","storage_50mb","green_tea"])assert.match(views,new RegExp(id));
assert.doesNotMatch(shopCss,/:has\(/);
for(const asset of ["assets/shop/drawer-shop-wood.jpg","assets/shop/drawer-shop-seller.png"]){
  const info=await stat(new URL(`../${asset}`,import.meta.url));assert.ok(info.size>100_000&&info.size<1_000_000);
}
assert.match(gradle,/versionCode 185/);
assert.match(gradle,/versionName "1\.0\.172"/);
console.log("PASS layout 180 relationship, shop, town-art removal, and merged character settings checks");
