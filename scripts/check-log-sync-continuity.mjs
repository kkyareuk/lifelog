import assert from "node:assert/strict";
import fs from "node:fs";

const simulation=fs.readFileSync(new URL("../simulation.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const views=fs.readFileSync(new URL("../views.js",import.meta.url),"utf8");
const state=fs.readFileSync(new URL("../state.js",import.meta.url),"utf8");

assert.doesNotMatch(simulation,/const revision=`\$\{Number\(c\.timelineResetAt\|\|0\)\}:\$\{Number\(state\.lastSaved/);
assert.match(simulation,/cached\?\.character===c&&cached\.revision===revision/);
console.log("PASS 일반 저장·동기화 시각은 생활 로그 생성 서명을 바꾸지 않습니다");

assert.doesNotMatch(simulation,/const settingsChanged=old&&today/);
assert.match(simulation,/if\(old&&today\)\{[\s\S]*Number\(item\.minute\)<=cutoff[\s\S]*entries\.filter\(item=>item\.minute>cutoff\)/);
console.log("PASS 설정·집 배치·동기화 뒤에도 현재 시각까지의 로그 원문과 시각을 보존합니다");

const updateRoomBlock=state.slice(state.indexOf("export function updateRoom"),state.indexOf("export function createHome"));
assert.match(updateRoomBlock,/simulationKeys=new Set\(\["type","furniture","furniturePlacements"\]\)/);
assert.match(updateRoomBlock,/Object\.keys\(patch\|\|\{\}\)\.some/);
console.log("PASS 방 크기·위치·바닥·벽 편집은 생활 로그 초기화와 분리됩니다");

assert.match(simulation,/const plannedMinute=Math\.max\(Number\(last\.minute\)\+nextGap,Number\(last\.routineEndMinute\)\|\|0\)/);
assert.match(simulation,/const sceneMinute=n-plannedMinute<=15\?plannedMinute:n/);
console.log("PASS 잠깐 앱을 비웠다가 돌아와도 동일 행동의 예정 시각을 현재 시각으로 바꾸지 않습니다");

assert.match(simulation,/export function nextSceneRefreshDelay/);
assert.match(app,/nextSceneRefreshDelay\(character,now\)/);
assert.match(app,/refreshedAt-lastForegroundSceneRefreshAt>1000/);
console.log("PASS 열린 관찰·집 화면은 다음 장면 시각에 맞춰 갱신하고 중복 복귀 이벤트는 합칩니다");

assert.match(views,/\(Array\.isArray\(ids\)\?ids:\[\]\)\.map/);
console.log("PASS 오래된 즐겨찾기 형식 하나가 캐릭터 화면 전체를 중단시키지 않습니다");
