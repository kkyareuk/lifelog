import fs from "node:fs";
import assert from "node:assert/strict";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const app=read("app.js"),simulation=read("simulation.js"),views=read("views.js"),css=read("character-book.css"),mood=read("character-mood.js"),gradle=read("android/app/build.gradle"),sw=read("sw.js");

assert.match(css,/personality-emotion-grid\{top:78cqw/,"정서 입력 필드는 머리말 아래로 내려가야 합니다.");
assert.match(app,/data-clothing-placement-stage/);
assert.match(app,/pointerdown/);
assert.match(app,/placementDraft=\{sd:/);
assert.doesNotMatch(app,/name="sdX"|name="ldX"|name="sdScale"|name="ldScale"/,"옷 배치를 수치 슬라이더로 저장하면 안 됩니다.");
assert.match(app,/유니폼으로 등록/);
assert.match(views,/유니폼 착용 필수/);
assert.match(views,/옷장에서 ‘유니폼으로 등록’한 옷만 자동 선택/);
assert.match(app,/야식을 자주 먹음/);
assert.match(app,/가끔 야식을 먹음/);
assert.match(app,/야식을 먹지 않음/);
assert.match(simulation,/function committedSharedSceneFor[\s\S]*interactionStartedMinute/);
assert.match(simulation,/shortConflict\?12:25/);
assert.match(simulation,/interactionCooldownUntil:minute\+60/);
assert.match(simulation,/mealActivityAllowed/);
assert.match(simulation,/nightSnackAllowed/);
assert.match(simulation,/normalizedMinute\(breakfastMinute\)>=4\*60/);
assert.doesNotMatch(simulation,/return withResidenceLocation\(c,entry\(n,"집에서 아침 준비 중"/);
assert.match(mood,/optimistic&&score>=0/,"음수 점수를 낙천성만으로 기분 좋음으로 표시하면 안 됩니다.");
assert.match(simulation,/const currentMood=characterMood\(c,last/);
assert.match(simulation,/moodActions=\{/);
assert.match(simulation,/moodResponse:true/);
assert.match(gradle,/versionCode\s+192/);
assert.match(gradle,/versionName\s+["']1\.0\.179["']/);
assert.match(sw,/direct-layout-meals-192/);

const {characterMood}=await import("../character-mood.js");
const moodWorld={uiLanguage:"ko",homes:{},towns:[],characters:{},relationships:{},catalog:{fashion:[]},routines:{},monthlyRoutines:{}};
let negativeOptimist=null;
for(let index=0;index<200&&!negativeOptimist;index++){
  const character={id:`optimist-${index}`,emotionalBaseline:"낙천적인 편",personalityTypes:["낙천적"]};
  const result=characterMood(character,{date:"2026-09-01",minute:index},moodWorld);
  if(result.score<0)negativeOptimist=result;
}
assert.ok(negativeOptimist,"음수 점수의 낙천적 캐릭터 검증 사례를 찾지 못했습니다.");
assert.notEqual(negativeOptimist.label,"기분 좋음","음수 점수는 ‘기분 좋음’으로 표시되면 안 됩니다.");
const moodCharacter={id:"mood-variety",emotionalBaseline:"현실적인 편",stressMoodResponse:"걱정이 많아짐"};
const moodTones=new Set([
  characterMood(moodCharacter,{date:"2026-09-01",minute:1,title:"칭찬과 선물을 받고 성공함"},moodWorld).tone,
  characterMood(moodCharacter,{date:"2026-09-01",minute:2,title:"갈등 때문에 화가 남"},moodWorld).tone,
  characterMood(moodCharacter,{date:"2026-09-01",minute:3,title:"야근으로 피곤하고 졸림"},moodWorld).tone
]);
assert.ok(moodTones.size>=3,"사건에 따라 감정 종류가 달라져야 합니다.");

console.log("v1.0.179 / 192 정서 여백·옷 직접 배치·상호작용 종료·심야 식사 검증 완료");
