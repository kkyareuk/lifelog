import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {characterMood} from "../character-mood.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const gradle=read("android/app/build.gradle"),sw=read("sw.js"),moodSource=read("character-mood.js");

assert.match(gradle,/versionCode\s+189/);
assert.match(gradle,/versionName\s+["']1\.0\.176["']/);
assert.match(sw,/drawer-village-v20260901-mood-189/);
assert.match(moodSource,/supportTotal>=5/);
assert.match(moodSource,/rawVariation=.*%22\)-14/);

const world={
  uiLanguage:"ko",
  homes:{home:{id:"home",townId:"town",cleanliness:92,beautyLevel:"매우 아름다움"}},
  towns:[],relationships:{},routines:{},monthlyRoutines:{},catalog:{fashion:[]},characters:{},
  world:{id:"town",name:"테스트 마을",reputation:"좋은 평판",places:[]}
};
const character=index=>({id:`character-${index}`,townId:"town",homeId:"home",wake:"07:30",sleep:"00:30",wakeHabit:"알람을 듣고 천천히 일어남",inventory:{fashion:[]},personalityTypes:[],characterTraits:[],interests:[],hobbies:[]});
const ordinary={title:"각자 할 일을 하는 중",minute:900,home:true,visitHomeId:"home"};
const samples=[];
for(let date=1;date<=30;date++)for(let index=0;index<6;index++)samples.push(characterMood(character(index),{...ordinary,date:`2026-09-${String(date).padStart(2,"0")}`},world));
const good=samples.filter(mood=>mood.tone==="good"||mood.tone==="excited").length;
const negative=samples.filter(mood=>["tense","sad","angry","tired","bored"].includes(mood.tone)).length;
assert.ok(good<=samples.length*.2,`평범한 날의 좋은 기분 비율이 너무 높습니다: ${good}/${samples.length}`);
assert.ok(negative>=samples.length*.08,`평범한 날에도 컨디션 저하가 나타나야 합니다: ${negative}/${samples.length}`);
assert.ok(samples.every(mood=>mood.reasons.filter(reason=>reason.value>0).reduce((sum,reason)=>sum+reason.value,0)<=12),"생활 기반의 긍정 보너스가 다시 과도하게 쌓였습니다.");

const uplifting=characterMood(character("gift"),{...ordinary,date:"2026-09-01",title:"칭찬과 선물을 받고 즐겁게 웃는 중"},world);
assert.ok(["good","excited"].includes(uplifting.tone),"분명한 좋은 사건은 좋은 기분으로 반영되어야 합니다.");
const argument=characterMood(character("fight"),{...ordinary,date:"2026-09-01",title:"말다툼 끝에 화가 난 상태"},world);
assert.equal(argument.tone,"angry");
const considerate=characterMood(character("considerate"),{...ordinary,date:"2026-09-01",title:"헤어지기 전 불편했던 점이 없는지 확인하는 중"},world);
assert.notEqual(considerate.tone,"angry","배려하는 확인 문장을 화난 사건으로 오인하면 안 됩니다.");
const groggy=characterMood(character("morning"),{...ordinary,date:"2026-09-01",minute:460},world);
assert.ok(groggy.reasons.some(reason=>reason.text.includes("잠이 덜 깨")),"기상 직후의 컨디션 저하 이유가 필요합니다.");

const hardDay={...ordinary,date:"2026-09-09"};
const ordinaryHardMood=characterMood(character("temper-check"),hardDay,world);
const gentleHardMood=characterMood({...character("temper-check"),personalityTypes:["온화함"],characterTraits:["다정함"]},hardDay,world);
assert.ok(gentleHardMood.score>=ordinaryHardMood.score,"온화하고 다정한 성격은 평범한 컨디션 저하를 더 완만하게 받아야 합니다.");

const restrained={...character("restrained"),personalityTypes:["과묵함"],characterTraits:["냉정함"],emotionalExpression:"감정을 잘 드러내지 않음"};
assert.notEqual(characterMood(restrained,{...ordinary,date:"2026-09-01",title:"칭찬과 선물을 받고 성공을 축하하는 중"},world).label,"들뜸","절제된 캐릭터를 들뜸으로 고정하면 안 됩니다.");

console.log(`v1.0.176 / 189 기분 균형 검증 완료 · 평범한 장면 좋은 기분 ${good}/${samples.length}, 불편한 기분 ${negative}/${samples.length}`);
