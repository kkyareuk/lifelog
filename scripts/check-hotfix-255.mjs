import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [plugin,app,nativeApp,gradle,prepare,serviceWorker]=await Promise.all([
  read("android/app/src/main/java/com/drawervillage/app/PlayBillingPlugin.java"),
  read("app.js"),
  read("native-app.js"),
  read("android/app/build.gradle"),
  read("scripts/prepare-app.mjs"),
  read("sw.js")
]);

assert.match(plugin,/regularPaidOffer/);
assert.match(plugin,/getPriceAmountMicros\(\) <= 0/);
assert.match(plugin,/getOfferId\(\) != null/);
assert.match(plugin,/getDiscountDisplayInfo\(\) != null/);
assert.match(plugin,/getRentalDetails\(\) != null \|\| offer\.getPreorderDetails\(\) != null/);
assert.doesNotMatch(plugin,/offers\.get\(0\)\.getOfferToken/);
assert.match(plugin,/Purchase\.PurchaseState\.PURCHASED/);
assert.match(plugin,/candidate\.getProducts\(\)\.contains\(requestedProductId\)/);
assert.match(plugin,/getContext\(\)\.getPackageName\(\)\.equals\(purchase\.getPackageName\(\)\)/);
assert.match(app,/products\.filter\(product=>product\.regularPaidOffer===true\)/);
for(const code of ["NO_REGULAR_PAID_OFFER","PURCHASE_PENDING","PURCHASE_NOT_COMPLETED","PACKAGE_MISMATCH","PRODUCT_MISMATCH"]){
  assert.match(nativeApp,new RegExp(`${code}:\\{ko:`));
}
assert.match(gradle,/versionCode\s+255\b/);
assert.match(gradle,/versionName\s+"1\.0\.215\.8"/);
assert.match(prepare,/DRAWER_VILLAGE_NATIVE_BUILD="20260907hotfix255"/);
assert.match(serviceWorker,/drawer-village-v20260907-hotfix-255/);

console.log("PASS hotfix 255: regular paid offer selection and native purchase integrity checks");
