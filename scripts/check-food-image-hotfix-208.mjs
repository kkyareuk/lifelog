import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {initializeLocalMediaState} from "../local-media.js";

const root=new URL("../",import.meta.url);
const read=name=>readFile(new URL(name,root),"utf8");
const [app,dictionary,views,gradle,index,serviceWorker]=await Promise.all([
  read("app.js"),read("dictionary.js"),read("views.js"),read("android/app/build.gradle"),read("index.html"),read("sw.js")
]);

assert.match(app,/const input=document\.createElement\("input"\)/);
assert.match(app,/input\.addEventListener\("change",event=>handleImageSelection\(event,task\),\{once:true\}\)/);
assert.match(app,/finally\{\s*finishImageSelection\(input,task\)/);
assert.doesNotMatch(app,/\$\("#image-picker"\)\.onchange/);
assert.match(dictionary,/updateCatalogItem\(kind,id,ui\.draft\);\s*e\.dataset\.source==='app'/);
assert.doesNotMatch(dictionary,/else\{if\(!commit\(\)\)return;\s*e\.dataset\.source==='app'/);

const visibleResult=await initializeLocalMediaState({image:"data:image/png;base64,iVBORw0KGgo="});
assert.deepEqual(visibleResult,{found:0,resolved:0,pending:0});
const missingResult=await initializeLocalMediaState({image:"local-media://food-image-missing"});
assert.deepEqual(missingResult,{found:1,resolved:0,pending:1});

assert.ok(views.includes('"The picture could not be saved. Please try another one."'));
assert.ok(views.includes('"画像を保存できませんでした。別の画像でもう一度お試しください。"'));
assert.match(gradle,/versionCode\s+208/);
assert.match(gradle,/versionName\s+"1\.0\.193"/);
assert.ok(index.includes("20260903foodimage208"));
assert.ok(serviceWorker.includes("drawer-village-v20260903-food-image-dev-208"));

console.log("v1.0.193 / 208 dev 음식 이미지 업로드 핫픽스 검증 완료");
