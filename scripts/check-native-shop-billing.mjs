import {readFile,stat} from "node:fs/promises";
import assert from "node:assert/strict";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [views,app,nativeApp,config,backend,shopCss,index,prepareApp,gradle,plugin,mainActivity]=await Promise.all([
  read("views.js"),read("app.js"),read("native-app.js"),read("config.js"),read("functions/index.js"),read("shop.css"),read("index.html"),read("scripts/prepare-app.mjs"),read("android/app/build.gradle"),read("android/app/src/main/java/com/drawervillage/app/PlayBillingPlugin.java"),read("android/app/src/main/java/com/drawervillage/app/MainActivity.java")
]);

for(const asset of ["assets/shop/drawer-shop-wood.jpg","assets/shop/drawer-shop-seller.png"]){
  const info=await stat(new URL(`../${asset}`,import.meta.url));
  assert.ok(info.size>100_000&&info.size<1_500_000,`${asset}는 고해상도 상점 헤더 에셋 크기를 유지해야 합니다.`);
}
assert.match(index,/shop\.css\?v=20260831village185b/);
assert.match(prepareApp,/"shop\.css"/);
assert.match(views,/drawer-shop-wood\.jpg/);
assert.match(views,/drawer-shop-seller\.png/);
for(const section of ["bundle","base","skin","expansion"])assert.match(views,new RegExp(`data-drawer-shop-tab=\\"\\$\\{key\\}\\"|\\[\\"bundle\\",\\"base\\",\\"skin\\",\\"expansion\\"\\]`));
assert.equal((views.match(/data-play-purchase=\"\$\{id\}\"/g)||[]).length>=1,true);
assert.doesNotMatch(views,/open_celebration_bundle/);
for(const product of ["character_slots_5","town_slot_1","storage_50mb","green_tea"])assert.match(views,new RegExp(product));
assert.match(views,/신규 번들은 아직 판매하지 않아요/);
assert.match(app,/querySelectorAll\(`\[data-play-price/);
assert.match(app,/data-drawer-shop-tab/);
assert.match(views,/accountEntitlements\.storage50/);
assert.match(nativeApp,/purchaseInFlight/);
assert.match(nativeApp,/verifyPurchase/);
assert.ok(nativeApp.indexOf("verifyPurchase")<nativeApp.indexOf("finishVerifiedPurchase"),"서버 영수증 검증 코드가 구매 완료 처리보다 먼저 정의되어야 합니다.");
assert.doesNotMatch(config,/open_celebration_bundle/);
assert.doesNotMatch(backend,/open_celebration_bundle/);
assert.match(backend,/PRODUCTS=new Set\(\["character_slots_5"/);
assert.match(backend,/next\.storage50=true/);
assert.match(gradle,/versionCode 185/);
assert.match(gradle,/versionName "1\.0\.172"/);
assert.match(gradle,/com\.android\.billingclient:billing:9\.1\.0/);
assert.match(plugin,/PURCHASE_IN_PROGRESS/);
assert.match(plugin,/pendingPurchaseCall = call/);
assert.match(mainActivity,/registerPlugin\(PlayBillingPlugin\.class\)/);
assert.match(shopCss,/prefers-reduced-motion/);
console.log("상점 시안·Google Play 결제·서버 지급·중복 방지 회귀 검사를 통과했습니다.");
