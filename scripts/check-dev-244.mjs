import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const gradle=read("android/app/build.gradle"),app=read("app.js"),views=read("views.js"),state=read("state.js"),dictionary=read("dictionary.js"),simulation=read("simulation.js"),groups=read("groups.js"),groupCss=read("groups.css"),rules=read("firestore.rules"),worker=read("sw.js"),prepare=read("scripts/prepare-web.mjs"),index=read("index.html");

assert.match(gradle,/versionCode\s+244\b/);
assert.match(gradle,/versionName\s+"1\.0\.222"/);
assert.ok(worker.includes("drawer-village-v20260906-dev-244"));
assert.ok(prepare.includes('expectedModuleCache="20260906dev244"'));
assert.ok(index.includes("groups.css?v=20260906dev244")&&index.includes("app.js?v=20260906dev244"));

assert.ok(state.includes('"weapon","animal"'),"저장 상태 정규화가 동물 사전을 만든다");
assert.ok(views.includes('weapon:"무기",animal:"동물"'),"사전에 동물 탭이 표시된다");
assert.ok(views.includes('animal:["개","고양이","새","토끼","말"'),"동물 분류를 선택할 수 있다");
assert.ok(views.includes('weapon:"⚔️",animal:"🐾"'),"동물 사전 아이콘이 있다");
assert.ok(app.includes('animal:["🐕","🐈","🐇","🦜"]'),"동물 기본 그림을 선택할 수 있다");
assert.ok(views.includes("['좋아하는 동물 · 사전','animal']"),"호불호의 동물 선택이 동물 사전과 연결된다");
assert.ok(views.includes('"동물":"Animals"')&&views.includes('"동물":"動物"'),"동물 사전은 영어와 일본어로 번역된다");
assert.ok(dictionary.includes("data-dict-add"),"동물 항목 추가에 쓰는 공통 사전 동작이 유지된다");

assert.ok(simulation.includes("contextCharacters.map(character=>character.id)"),"공동 장면 참여자 순서를 유지한다");
assert.ok(groups.includes("group-ledger")&&groupCss.includes("assets/dictionary/wood.webp"),"개발 브랜치 그룹 UI를 유지한다");
assert.ok(rules.includes("match /groups/{groupId}")&&rules.includes("match /groupInvites/{inviteCode}"),"그룹 권한 규칙을 유지한다");

console.log("PASS dev 244: animal Dictionary plus existing group and shared-scene safeguards");
