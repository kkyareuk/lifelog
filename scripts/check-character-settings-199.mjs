import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const text=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [views,app,simulation,state,bookCss,appCss,gradle,sw,index]=await Promise.all([
  text("views.js"),text("app.js"),text("simulation.js"),text("state.js"),text("character-book.css"),text("app.css"),text("android/app/build.gradle"),text("sw.js"),text("index.html")
]);

const stage=await readFile(new URL("../assets/character-ui/character-book-stage-v15.png",import.meta.url));
assert.equal(stage.subarray(1,4).toString(),"PNG","new book stage is a PNG");
assert.equal(stage.readUInt32BE(16),824,"book stage keeps the 412:917 coordinate width");
assert.equal(stage.readUInt32BE(20),1834,"book stage keeps the 412:917 coordinate height");
assert.ok(views.includes("character-book-stage-v15.png")&&!views.includes("character-book-stage-v14.png"),"full settings uses the cleaned book stage");

for(const removed of ["workwearType","swimwearType","sleepwearType","partywearType"]){
  assert.ok(!views.includes(removed),`${removed} was removed from page 7`);
}
assert.ok(views.includes('bookField("평소 외모 관리","appearanceCareLevel"'),"page 7 has everyday appearance care");
assert.ok(views.includes('bookField("액세서리 착용","accessoryUse"'),"page 7 has a simple accessory choice");
assert.ok(bookCss.includes("row-gap:4.8cqw")&&bookCss.includes("height:7.2cqw"),"page 7 rows and controls have breathing room");

assert.ok(state.includes("schema:35")&&state.includes("x.schema=35"),"saved data migrates to schema 35");
assert.ok(state.includes("appearanceCareLevel")&&state.includes("accessoryUse"),"new settings are normalized and invalidate simulation caches");
assert.ok(app.includes('character.accessoryUse==="착용함"')&&app.includes("respectAccessoryUse"),"automatic outfits obey the accessory on/off choice");
assert.ok(simulation.includes("appearanceCareMinutes")&&simulation.includes("아침 외모 관리를 꼼꼼히 하는 중"),"appearance care affects morning timing and activity logs");
assert.ok(simulation.includes('c.accessoryUse==="착용함"'),"accessory-related activities obey the new setting");

for(const key of ["평소 외모 관리","거의 신경 쓰지 않음","필요한 만큼만","기본적으로 단정하게","꾸준히 관리함","세심하게 공들임","액세서리 착용","착용함"]){
  const matches=views.match(new RegExp(`"${key.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}"`,"g"))||[];
  assert.ok(matches.length>=3,`${key} has Korean UI plus English and Japanese translations`);
}

assert.ok(appCss.includes('./assets/character-ui/back.png')&&appCss.includes(".statistics-scope-tabs{position:relative"),"statistics uses the wooden back button and protected scope row");
assert.ok(appCss.includes(".statistics-report>.character-stat-actions{position:relative"),"report download action no longer floats over report content");
assert.match(gradle,/versionCode\s+(?:199|200|201)/);
assert.match(gradle,/versionName\s+"1\.0\.(?:186|187(?:\.1)?)"/);
assert.ok(/drawer-village-v20260902-(?:character-settings-199|bed-buildings-statistics-200|buttons-love-hotfix-201)/.test(sw),"service worker cache is unique to build 199+");
assert.ok(index.includes("20260902relationship202"),"browser cache marker is updated");

console.log("v1.0.186 / 199 character settings and statistics checks passed");
