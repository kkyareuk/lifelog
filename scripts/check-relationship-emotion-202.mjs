import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {characterMood,relationshipAppraisal} from "../character-mood.js";

const root=new URL("../",import.meta.url);
const basic=(id,name,extra={})=>({
  id,name,townId:"town",personalityTypes:[],characterTraits:[],interests:[],hobbies:[],inventory:{},favorites:{},dislikes:{},
  emotionalBaseline:"현실적인 편",moodVolatility:"거의 흔들리지 않음",emotionalSensitivity:"보통",emotionalContagion:"거의 물들지 않음",...extra
});
const jen=basic("jen","젠할린",{emotionalBaseline:"까칠한 편"}),gyp=basic("gyp","집소필라");
const world={
  uiLanguage:"ko",world:{id:"town",name:"서랍마을",reputation:"지정 안 함",places:[]},towns:[],homes:{},catalog:{},routines:{},monthlyRoutines:{},
  characters:{jen,gyp},relationships:{bond:{id:"bond",a:"jen",b:"gyp",type:"동거인",temporalStatus:"current"}},
  characterViews:{jen:{gyp:{overall:"연애 감정으로 좋아함",importance:"1순위",awareness:"감정을 불편함으로 착각함",closeness:"가장 가까운 사람",comfort:"함께 있는 건 편하지만 대화 호흡은 평범함",annoyance:"많이 귀찮아함",attention:"늘 최우선으로 챙김",conflictIntensity:"가끔 부딪힘",aggression:"거친 말을 하고 싶은 충동",aggressionAction:"행동으로 옮기지 않음"}},gyp:{jen:{overall:"친구로 좋아함",closeness:"편한 사이",comfort:"말없이 함께 있어도 편안함",annoyance:"전혀 귀찮거나 성가시지 않음"}}}
};
const shared={date:"2026-09-02",minute:900,title:"같은 방에서 이야기를 이어 가는 중",desc:"젠할린이 집소필라의 대답을 들으며 같은 주제의 대화를 계속했어요.",withId:"gyp",withIds:["gyp"],participantOrder:["jen","gyp"]};
const appraisal=relationshipAppraisal(jen,shared,world)[0];
assert.equal(appraisal.kind,"misread-affection","애정·성가심·거친 말 충동·불편함 오해를 하나의 복합 감정으로 평가한다");
assert.equal(characterMood(jen,shared,world).label,"복잡한 끌림");
assert.ok(characterMood(jen,shared,world).reasons.some(reason=>/끌리고 소중히|불편함/.test(reason.text)),"관계 감정을 행동 로그와 연결된 구체적인 이유로 표시한다");

const friendlyPresence=characterMood(gyp,{date:"2026-09-02",minute:910,title:"책을 읽는 중",desc:"같은 방에서 책을 읽고 있어요.",coLocatedIds:["jen"]},world);
assert.equal(friendlyPresence.label,"편안함","우호적인 사람과 같은 공간에 있는 것만으로 긍정 감정을 만든다");
const hostileWorld={...world,characterViews:{...world.characterViews,gyp:{jen:{overall:"매우 싫어함",comfort:"함께 있으면 매우 불편하고 대화도 전혀 통하지 않음",annoyance:"보기만 해도 피곤함"}}}};
const hostilePresence=characterMood(gyp,{date:"2026-09-02",minute:910,title:"책을 읽는 중",desc:"같은 방에서 책을 읽고 있어요.",coLocatedIds:["jen"]},hostileWorld);
assert.ok(["강한 반감","경계함"].includes(hostilePresence.label));
assert.ok(hostilePresence.score<0&&hostilePresence.reasons.some(reason=>reason.text.includes("같은 공간")),"싫어하는 사람과의 동석은 반대 방향으로 작동한다");
const loveHateWorld={...world,characterViews:{...world.characterViews,gyp:{jen:{overall:"애증을 느낌",comfort:"함께 있으면 매우 불편하고 대화도 전혀 통하지 않음",annoyance:"많이 귀찮고 성가심"}}}};
assert.equal(characterMood(gyp,{date:"2026-09-02",minute:910,title:"창가에 서 있는 중",desc:"젠할린과 같은 방에 있어요.",coLocatedIds:["jen"]},loveHateWorld).label,"애증","애증 설정은 단순 호감이나 단순 분노로 납작하게 만들지 않는다");

const sleeping=characterMood(jen,{date:"2026-09-02",minute:120,title:"자는 중",desc:"침대에서 깊이 잠들어 있어요.",withId:"gyp"},world);
assert.deepEqual({label:sleeping.label,tone:sleeping.tone,score:sleeping.score,reasons:sleeping.reasons},{label:"수면 중",tone:"sleeping",score:0,reasons:[]},"수면 중에는 감정 계산을 건너뛴다");

const nerine=basic("nerine","네리네",{personalityTypes:["과묵함"],positiveMoodResponse:"조용히 만족함",emotionalBaseline:"차분한 편"});
const satisfied=characterMood(nerine,{date:"2026-09-02",minute:720,title:"정리한 일을 완성하는 중",desc:"맡은 일을 성공적으로 마치고 칭찬을 들었어요."},{...world,characters:{nerine}});
assert.equal(satisfied.label,"만족함","절제된 긍정 반응은 만족함으로 표시한다");
let unruffled;
for(let day=1;day<=28&&!unruffled;day++){
  const result=characterMood(basic("ante","안테",{emotionalBaseline:"무덤덤한 편",moodVolatility:"거의 흔들리지 않음"}),{date:`2026-09-${String(day).padStart(2,"0")}`,minute:780,title:"창가에서 기록을 정리하는 중",desc:"메모를 날짜순으로 정리했어요."},{...world,characters:{ante:{id:"ante",name:"안테"}}});
  if(result.label==="무덤덤함")unruffled=result;
}
assert.ok(unruffled,"무덤덤한 정서 기준도 별도 감정으로 실제 적용한다");

for(const language of ["en","ja"]){
  const localized=characterMood(jen,shared,{...world,uiLanguage:language},language);
  assert.notEqual(localized.label,"복잡한 끌림");
  assert.ok(localized.reasons.every(reason=>!/[가-힣]/.test(reason.text.replaceAll("젠할린","").replaceAll("집소필라",""))),`${language} 관계 감정 이유를 번역한다`);
  const localizedSleep=characterMood(jen,{title:language==="en"?"Sleeping":"睡眠中",desc:""},{...world,uiLanguage:language},language);
  assert.notEqual(localizedSleep.label,"수면 중");
}

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener:()=>{},dispatchEvent:()=>{}};
globalThis.document={addEventListener:()=>{},querySelector:()=>null,activeElement:null,visibilityState:"visible"};
const [{state:runtimeState},{timeline,eventFor}]=await Promise.all([
  import(`../state.js?v=20260903foodimage208`),
  import(`../simulation.js?relationship-sync=${Date.now()}`)
]);
const runtimeCharacter=(id,name)=>({...basic(id,name),createdAt:1,ageGroup:"성인",gender:"설정하지 않음",speechStyle:"자동 · 성격에 맞춤",homeId:"shared-home",residences:[{homeId:"shared-home",isPrimary:true,stayPattern:"상시 거주"}],wake:"00:01",sleep:"23:59",job:"무직",jobTitle:"",traitExpressions:[],bodyProfile:{},theme:{primary:"#76513e"}});
const runtimeJen=runtimeCharacter("runtime-jen","젠할린"),runtimeGyp=runtimeCharacter("runtime-gyp","집소필라");
runtimeState.uiLanguage="ko";
runtimeState.characters={"runtime-jen":runtimeJen,"runtime-gyp":runtimeGyp};
runtimeState.order=["runtime-jen","runtime-gyp"];
runtimeState.homes={"shared-home":{id:"shared-home",townId:"",rooms:{living:{name:"거실",type:"living"}}}};
runtimeState.relationships={bond:{id:"bond",a:"runtime-jen",b:"runtime-gyp",type:"동거인",temporalStatus:"current",stayTogether:true}};
runtimeState.characterViews={"runtime-jen":{"runtime-gyp":world.characterViews.jen.gyp},"runtime-gyp":{"runtime-jen":world.characterViews.gyp.jen}};
runtimeState.routines={"runtime-jen":[],"runtime-gyp":[]};runtimeState.monthlyRoutines={"runtime-jen":[],"runtime-gyp":[]};runtimeState.dailyPlans={};runtimeState.interactions=[];runtimeState.scheduledChoices=[];
const now=new Date(),dayKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`,minute=now.getHours()*60+now.getMinutes();
timeline(runtimeState.characters["runtime-jen"],now);timeline(runtimeState.characters["runtime-gyp"],now);
for(const id of runtimeState.order){
  const character=runtimeState.characters[id],key=Object.keys(character.days||{}).find(value=>value===dayKey)||Object.keys(character.days||{})[0];
  assert.ok(key,"실행 검증용 하루 기록이 생성된다");
  character.days[key].entries=[{date:key,minute:Math.max(0,minute-2),time:"",title:"거실에서 각자 메모를 정리하는 중",desc:"같은 거실 탁자에서 메모를 날짜순으로 정리하고 있어요.",home:true,visitHomeId:"shared-home",room:"living",townId:"",mood:"차분"}];
}
const jenEvent=eventFor(runtimeState.characters["runtime-jen"],now),gypEvent=eventFor(runtimeState.characters["runtime-gyp"],now);
assert.ok(jenEvent.groupInteraction&&gypEvent.groupInteraction,"한쪽이 대화 중이면 상대도 같은 공동 장면으로 확정한다");
assert.equal(jenEvent.interactionId,gypEvent.interactionId,"두 사람의 현재 장면이 같은 사건 ID를 사용한다");
assert.equal(jenEvent.withId,"runtime-gyp");assert.equal(gypEvent.withId,"runtime-jen");
assert.ok(/집소필라/.test(jenEvent.title)&&/젠할린/.test(gypEvent.title),"각자 관점의 제목에도 실제 상대를 표시한다");
assert.match(jenEvent.title,/퉁명스럽게/,"복합 감정을 가진 쪽의 실제 행동을 제목에 드러낸다");
assert.doesNotMatch(gypEvent.title,/퉁명스럽게/,"상대에게 같은 감정과 행동을 잘못 복사하지 않는다");
assert.ok(!/각자 메모를 정리/.test(gypEvent.title),"대화 상대가 동시에 별개의 행동을 표시하지 않는다");
assert.equal(characterMood(runtimeJen,jenEvent,runtimeState).label,"복잡한 끌림");
assert.equal(characterMood(runtimeGyp,gypEvent,runtimeState).label,"편안함","같은 사건이어도 방향별 관계 설정에 따라 서로 다른 감정을 계산한다");

const soloMinute=Math.max(0,minute-1);
const runtimeDayKey=Object.keys(runtimeState.characters["runtime-jen"].days)[0];
runtimeState.characters["runtime-jen"].days[runtimeDayKey].entries=[{date:runtimeDayKey,minute:soloMinute,time:"",title:"거실에서 차를 마시는 중",desc:"거실 탁자에서 차를 천천히 마시고 있어요.",home:true,visitHomeId:"shared-home",room:"living",townId:"",mood:"차분"}];
runtimeState.characters["runtime-gyp"].days[runtimeDayKey].entries=[{date:runtimeDayKey,minute:soloMinute,time:"",title:"연구 결과를 정리하는 중",desc:"혼자 연구 기록을 대조하며 다음 실험 순서를 적고 있어요.",home:true,visitHomeId:"shared-home",room:"living",townId:"",mood:"집중"}];
const protectedGypEvent=eventFor(runtimeState.characters["runtime-gyp"],now);
const nearbyJenEvent=eventFor(runtimeState.characters["runtime-jen"],now);
assert.ok(!protectedGypEvent.groupInteraction&&!protectedGypEvent.withId,"연구·집중 중인 캐릭터는 실제 단독 행동을 유지한다");
assert.ok(!nearbyJenEvent.groupInteraction&&nearbyJenEvent.withId!=="runtime-gyp","같은 방의 다른 캐릭터도 연구자를 대화 상대로 잘못 표시하지 않는다");

const [simulation,gradle,worker,index]=await Promise.all([
  readFile(new URL("simulation.js",root),"utf8"),readFile(new URL("android/app/build.gradle",root),"utf8"),readFile(new URL("sw.js",root),"utf8"),readFile(new URL("index.html",root),"utf8")
]);
assert.doesNotMatch(simulation,/청춘을\(를\) 골라 기분을 바꾸는 중|\$\{likedThing\}을\(를\) 골라 기분을 바꾸는 중/);
assert.match(simulation,/\$\{likedThing\} 장르의 책을 골라 읽는 중/);
assert.match(simulation,/synchronizedCounterpart/);
assert.match(simulation,/coLocatedIds:coLocatedCharacterIds/);
assert.match(gradle,/versionCode\s+(?:202|203|204|205|206|208)/);
assert.match(gradle,/versionName\s+"1\.0\.(?:18[89]|19[0-3])"/);
assert.ok(/drawer-village-v(?:20260902-(?:relationship-emotion-202|language-scene-203|font-204|cognitive-205)|20260903-(?:sync-home-character-206|food-image-dev-208))/.test(worker));
assert.ok(index.includes("20260903foodimage208"));

console.log("v1.0.188 / 202 관계 동기화·복합 감정·구체 행동 로그 검증 완료");
