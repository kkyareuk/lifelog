import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {initializeLocalMediaState} from "../local-media.js";

const root=new URL("../",import.meta.url);
const read=name=>readFile(new URL(name,root),"utf8");
const [app,dictionary,views,gradle,index,serviceWorker]=await Promise.all([
  read("app.js"),read("dictionary.js"),read("views.js"),read("android/app/build.gradle"),read("index.html"),read("sw.js")
]);

assert.match(app,/const input=document\.createElement\("input"\)/,"각 업로드마다 새 파일 입력을 만든다");
assert.match(app,/input\.addEventListener\("change",event=>handleImageSelection\(event,task\),\{once:true\}\)/,"선택 작업과 파일 변경 이벤트를 직접 묶는다");
assert.match(app,/finally\{\s*finishImageSelection\(input,task\)/,"성공·취소·실패 뒤 파일 선택 상태를 정리한다");
assert.doesNotMatch(app,/\$\("#image-picker"\)\.onchange/,"앱 복귀 렌더에 취약한 공용 입력 핸들러를 사용하지 않는다");
assert.match(dictionary,/updateCatalogItem\(kind,id,ui\.draft\);\s*e\.dataset\.source==='app'/,"사전 초안을 보존한 뒤 이미지 선택기를 연다");
assert.doesNotMatch(dictionary,/else\{if\(!commit\(\)\)return;\s*e\.dataset\.source==='app'/,"파일 선택을 전체 저장 성공 여부로 막지 않는다");

const alreadyVisible={image:"data:image/png;base64,iVBORw0KGgo="};
const visibleResult=await initializeLocalMediaState(alreadyVisible);
assert.deepEqual(visibleResult,{found:0,resolved:0,pending:0},"이미 보이는 Data URL은 복원으로 오인하지 않는다");
const missing={image:"local-media://food-image-missing"};
const missingResult=await initializeLocalMediaState(missing);
assert.deepEqual(missingResult,{found:1,resolved:0,pending:1},"실제 기기 참조만 복원 집계에 포함한다");

assert.ok(views.includes('"The picture could not be saved. Please try another one."'),"영문 저장 실패 안내가 있다");
assert.ok(views.includes('"画像を保存できませんでした。別の画像でもう一度お試しください。"'),"일문 저장 실패 안내가 있다");
assert.match(gradle,/versionCode\s+207/);
assert.match(gradle,/versionName\s+"1\.0\.187\.2"/);
assert.ok(index.includes("20260903foodimage207"));
assert.ok(serviceWorker.includes("drawer-village-v20260903-food-image-hotfix-207"));

console.log("v1.0.187.2 / 207 음식 이미지 업로드 핫픽스 검증 완료");
