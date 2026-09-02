import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {characterMood,environmentConversation} from "../character-mood.js";
import {localizeLifeLog} from "../life-log-localization.js";

const world={
  uiLanguage:"ko",catalog:{},homes:{},relationships:{},characterViews:{},
  world:{id:"town",name:"서랍마을",places:[{id:"library",name:"서랍 도서관",atmosphere:"조용하고 차분함"}]},
  towns:[{id:"town",name:"서랍마을",places:[{id:"library",name:"서랍 도서관",atmosphere:"조용하고 차분함"}]}],
  characters:{nerine:{id:"nerine",name:"네리네"},kro:{id:"kro",name:"크로"}}
};
const oldJapanese={title:"読書・作業に集中しているところ",desc:"静かに本を読んだり、情報を整理したりしています。",townId:"town",placeId:"library"};
const korean=localizeLifeLog(oldJapanese,"ko",world,"nerine");
assert.match(korean.title,/읽고 집중/);
assert.doesNotMatch(`${korean.title} ${korean.desc}`,[/[぀-ヿ]/][0],"일본어로 저장된 로그도 한국어 표시로 다시 해석한다");
const japanese=localizeLifeLog({title:"크로와 이야기를 나누는 중",desc:"같은 주제를 차분히 이어 가고 있어요.",withId:"kro"},"ja",world,"nerine");
const restored=localizeLifeLog(japanese,"ko",world,"nerine");
assert.equal(restored.title,"크로와 이야기를 나누는 중","새 로그는 한국어 원문을 보존해 언어 왕복 시 정확히 복원한다");

const nerine={id:"nerine",name:"네리네",townId:"town",personalityTypes:["외향적임"],characterTraits:["활발함"],hobbies:["독서"],interests:["글쓰기"],energyRhythm:"활동적인 편",emotionalBaseline:"차분한 편",moodVolatility:"거의 흔들리지 않음",emotionalSensitivity:"보통"};
const focused={date:"2026-09-02",minute:800,title:"혼자 원고 작업에 집중하는 중",desc:"조용한 자리에서 글을 고쳐 쓰고 있어요.",townId:"town",placeId:"library"};
const focusedMood=characterMood(nerine,focused,world);
assert.notEqual(focusedMood.tone,"bored","외향적이라는 이유만으로 집중 중인 조용한 장소를 지루해하지 않는다");
assert.ok(focusedMood.reasons.some(reason=>/집중하는 데 도움/.test(reason.text)),"조용함과 현재 행동의 실제 궁합을 감정 이유로 남긴다");
assert.match(environmentConversation(nerine,focused,world),/집중하기 좋/);
const idleMood=characterMood({...nerine,hobbies:[],interests:[],characterTraits:["가만히 못 있음"]},{...focused,title:"할 일 없이 멍하니 기다리는 중",desc:"약속 시각 전까지 할 일 없이 시간을 때우고 있어요."},world);
assert.equal(idleMood.tone,"bored","무료함은 자극을 찾는 성향이 목적 없이 기다릴 때만 적용한다");

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener:()=>{},dispatchEvent:()=>{}};
globalThis.document={addEventListener:()=>{},querySelector:()=>null,activeElement:null,visibilityState:"visible"};
const [{state},{timeline,visibleTimeline,eventFor}]=await Promise.all([
  import("../state.js?v=20260902relationship202"),
  import(`../simulation.js?language-scene=${Date.now()}`)
]);
const basic=(id,name)=>({id,name,townId:"town",createdAt:1,ageGroup:"성인",gender:"설정하지 않음",personalityTypes:[],characterTraits:[],traitExpressions:[],interests:[],hobbies:[],inventory:{},favorites:{},dislikes:{},emotionalBaseline:"현실적인 편",moodVolatility:"거의 흔들리지 않음",emotionalSensitivity:"보통",homeId:"home",residences:[{homeId:"home",isPrimary:true,stayPattern:"상시 거주"}],wake:"00:01",sleep:"23:59",job:"무직",jobTitle:"",bodyProfile:{},theme:{primary:"#76513e"}});
const runtimeNerine=basic("nerine","네리네"),runtimeKro=basic("kro","크로");
state.uiLanguage="ja";state.characters={nerine:runtimeNerine,kro:runtimeKro};state.order=["nerine","kro"];
state.towns=[{id:"town",name:"서랍마을",places:[]}];state.activeTownId="town";state.homes={home:{id:"home",townId:"town",rooms:{living:{name:"거실",type:"living"}}}};
state.relationships={bond:{id:"bond",a:"nerine",b:"kro",type:"연인",temporalStatus:"current",stayTogether:true}};state.characterViews={};state.routines={nerine:[],kro:[]};state.monthlyRoutines={nerine:[],kro:[]};state.dailyPlans={};state.interactions=[];state.scheduledChoices=[];
const now=new Date(),key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`,minute=now.getHours()*60+now.getMinutes();
timeline(runtimeNerine,now);timeline(runtimeKro,now);
const runtimeKey=Object.keys(runtimeNerine.days||{}).find(value=>value===key)||Object.keys(runtimeNerine.days||{})[0];
assert.ok(runtimeKey&&runtimeKro.days?.[runtimeKey],"실행 검증용 하루 기록이 생성된다");
runtimeNerine.days[runtimeKey].entries=[{...oldJapanese,date:runtimeKey,minute:Math.max(0,minute-3),time:"",home:true,visitHomeId:"home",room:"living",townId:"town"}];
assert.match(visibleTimeline(runtimeNerine,now)[0].title,/読書/);
state.uiLanguage="ko";
assert.doesNotMatch(`${visibleTimeline(runtimeNerine,now)[0].title} ${visibleTimeline(runtimeNerine,now)[0].desc}`,/[\u3040-\u30ff]/,"화면 언어를 한국어로 바꾸면 보존된 당일 일본어 기록도 즉시 한국어로 표시한다");

const soloMinute=Math.max(0,minute-1),legacyMinute=Math.max(0,minute-2),legacyId=`legacy:${key}:nerine:kro`;
runtimeNerine.days[runtimeKey].entries=[{date:runtimeKey,minute:soloMinute,time:"",title:"혼자 원고 작업에 집중하는 중",desc:"방해받지 않도록 원고를 고쳐 쓰고 있어요.",home:true,visitHomeId:"home",room:"living",townId:"town"}];
runtimeKro.days[runtimeKey].entries=[{date:runtimeKey,minute:legacyMinute,time:"",title:"네리네와 같이 있는 중",desc:"네리네 옆에 머물고 있어요.",baseTitle:"거실에서 차를 마시는 중",baseDesc:"차를 천천히 마시고 있어요.",home:true,visitHomeId:"home",room:"living",townId:"town",withId:"nerine",withIds:["nerine"],participantOrder:["kro","nerine"],interactionId:legacyId,interactionStartedMinute:legacyMinute,holdMinutes:25,groupInteraction:true}];
const nerineEvent=eventFor(runtimeNerine,now),kroEvent=eventFor(runtimeKro,now);
assert.match(nerineEvent.title,/혼자.*집중/);
assert.ok(!nerineEvent.groupInteraction,"혼자 집중하는 현재 행동을 자동 동행이 덮지 않는다");
assert.ok(!kroEvent.groupInteraction,"상대 쪽에만 남은 오래된 공동 장면을 재사용하지 않는다");
assert.equal(kroEvent.withId,undefined,"크로 화면에서도 네리네가 함께 있다고 표시하지 않는다");

const [gradle,worker,simulation,townCss]=await Promise.all([
  readFile(new URL("../android/app/build.gradle",import.meta.url),"utf8"),
  readFile(new URL("../sw.js",import.meta.url),"utf8"),
  readFile(new URL("../simulation.js",import.meta.url),"utf8"),
  readFile(new URL("../town-fit.css",import.meta.url),"utf8")
]);
assert.match(gradle,/versionCode\s+203/);assert.match(gradle,/versionName\s+"1\.0\.189"/);
assert.ok(worker.includes("drawer-village-v20260902-language-scene-203"));
assert.ok(simulation.includes('ENGINE_VERSION="20260902-language-scene-203"'));
assert.ok(!townCss.includes("mix-blend-mode:plus-lighter")&&townCss.includes(".building-light-core{filter:brightness(1.3)"),"과한 발광 닷지를 제거하고 기존의 은은한 건물 조명을 복원한다");
console.log("v1.0.189 / 203 언어 왕복·혼자 집중 장면·조용한 장소 감정 검증 완료");
