import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const gradle=read("android/app/build.gradle"),app=read("app.js"),simulation=read("simulation.js"),groups=read("groups.js"),groupCss=read("groups.css"),rules=read("firestore.rules"),worker=read("sw.js"),prepare=read("scripts/prepare-web.mjs"),index=read("index.html");

assert.match(gradle,/versionCode\s+242\b/);
assert.match(gradle,/versionName\s+"1\.0\.221"/);
assert.ok(worker.includes("drawer-village-v20260906-dev-242"));
assert.ok(app.includes('save(true,false)')&&app.includes('root.querySelectorAll("[data-open-body-choice]")'),"신체 다중 선택은 즉시 저장하고 요약을 갱신한다");
assert.ok(app.includes('dialog.onclose=()=>refreshCharacterSelectionSummaries()'),"신체 선택창을 닫을 때 현재 선택값을 다시 표시한다");
assert.ok(simulation.includes("contextCharacters.map(character=>character.id)"),"공동 장면을 복제할 때 최초 참여자 순서를 유지한다");
assert.ok(groups.includes("group-ledger")&&groupCss.includes('assets/dictionary/wood.webp'),"그룹 화면은 사전 계열 나무 책상·종이 장부 UI를 쓴다");
assert.ok(groups.includes('code==="permission-denied"')&&groups.includes("グループサーバー")&&groups.includes("group server"),"권한 오류를 한·영·일 사용자 문구로 바꾼다");
assert.ok(rules.includes("match /groups/{groupId}")&&rules.includes("match /groupInvites/{inviteCode}"),"그룹 생성과 초대 규칙을 배포 파일에 포함한다");
assert.ok(prepare.includes('"groups.js","groups.css"')&&prepare.includes('expectedModuleCache="20260906dev242"'),"Android/Web 패키지에 그룹 모듈과 스타일을 실제 포함한다");
assert.ok(index.includes("groups.css?v=20260906dev242")&&index.includes("app.js?v=20260906dev242"));

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener:()=>{},dispatchEvent:()=>{}};
globalThis.document={addEventListener:()=>{},querySelector:()=>null,activeElement:null,visibilityState:"visible"};
const {sharedContextCharacters}=await import(`../simulation.js?dev242=${Date.now()}`);
const characters={jen:{id:"jen"},etnal:{id:"etnal"},gypsophila:{id:"gypsophila"}};
for(const id of Object.keys(characters)){
  const synchronized=sharedContextCharacters({participantOrder:["jen","etnal","gypsophila"]},characters[id],characters);
  assert.deepEqual(synchronized.map(character=>character.id),["jen","etnal","gypsophila"],`${id} 화면에서도 같은 3인 명단을 유지한다`);
}
assert.deepEqual(sharedContextCharacters({participantOrder:["jen","etnal","missing"]},characters.jen,characters).map(character=>character.id),["jen","etnal"],"존재하지 않는 참여자는 안전하게 제외한다");

console.log("PASS dev 242: character body summaries, group packaging/UI/permissions, and consistent three-person scenes");
