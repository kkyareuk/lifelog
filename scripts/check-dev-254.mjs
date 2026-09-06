import assert from "node:assert/strict";
import fs from "node:fs";

const read=name=>fs.readFileSync(new URL(`../${name}`,import.meta.url),"utf8");
const memory=new Map();
globalThis.localStorage={get length(){return memory.size},key:index=>[...memory.keys()][index]??null,getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener(){},dispatchEvent(){}};
globalThis.document={addEventListener(){},querySelector(){return null},activeElement:null,visibilityState:"visible"};

const {state,setCharacterBodyChoices,directCharacterActivity}=await import("../state.js?v=20260907dev254");
const {accountStorage}=await import("../account-storage.js?v=20260907dev254");
const {eventFor}=await import(`../simulation.js?dev254=${Date.now()}`);
const character=(id,name)=>({id,name,createdAt:1,ageGroup:"성인",gender:"설정하지 않음",speechStyle:"자동 · 성격에 맞춤",townId:"town",homeId:"home",residences:[{homeId:"home",isPrimary:true,stayPattern:"상시 거주",sleepRoomId:"bedroom"}],sleepRoomId:"bedroom",wake:"07:00",sleep:"23:30",job:"무직",jobTitle:"",workplaceId:"",personalityTypes:[],characterTraits:[],traitExpressions:[],hobbies:[],interests:[],inventory:{},foodTypes:[],foodPreferences:[],musicGenres:[],appearanceTags:[],attractionTraits:[],bodyProfile:{appearanceSummaries:[],overallImpressions:[]},theme:{primary:"#176b60"},days:{},timelineResetAt:0});
state.characters=Object.fromEntries([["a","가람"],["b","나래"],["c","다온"]].map(([id,name])=>[id,character(id,name)]));
state.order=["a","b","c"];
state.homes={home:{id:"home",name:"공동 집",townId:"town",rooms:{bedroom:{name:"침실",type:"bedroom",furniture:["침대"]},living:{name:"거실",type:"living"},study:{name:"서재",type:"study"}}}};
state.towns=[{id:"town",name:"테스트 마을",places:[{id:"office",name:"직장",type:"사무실"},{id:"park",name:"공원",type:"공원"}],decorations:[]}];
state.activeTownId="town";state.world=structuredClone(state.towns[0]);state.relationships={};state.routines={a:[],b:[],c:[]};state.monthlyRoutines={a:[],b:[],c:[]};state.dailyPlans={};state.characterDirectives={};

assert.equal(setCharacterBodyChoices("a","appearanceSummaries",["단정한 인상","차가운 인상"],true),true);
assert.equal(setCharacterBodyChoices("a","overallImpressions",["고요한 분위기"],true),true);
const persisted=JSON.parse(accountStorage.getItem("drawer-village-game-v1"));
assert.deepEqual(persisted.characters.a.bodyProfile.appearanceSummaries,["단정한 인상","차가운 인상"]);
assert.deepEqual(persisted.characters.a.bodyProfile.overallImpressions,["고요한 분위기"]);

assert.equal(directCharacterActivity("a","talk",{targetId:"b",topic:"오늘 있었던 일"}),true);
const now=new Date();
const aScene=eventFor(state.characters.a,now),bScene=eventFor(state.characters.b,now),cScene=eventFor(state.characters.c,now);
assert.equal(aScene.interactionId,bScene.interactionId,"직접 지정한 대화는 양쪽에 같은 사건 ID로 보여야 한다");
assert.deepEqual(aScene.participantOrder,["a","b"]);
assert.deepEqual(bScene.participantOrder,["a","b"]);
assert.equal(aScene.visitHomeId,bScene.visitHomeId,"대화 참여자는 같은 집과 방에 있어야 한다");
assert.equal(aScene.room,bScene.room);
assert.equal(Boolean(cScene.groupInteraction),false,"참여하지 않은 캐릭터는 대화에 끌려오면 안 된다");

const date=new Date(2026,8,6,10,30,0,0),minute=10*60+20,interactionId="stale-three-person-chat";
state.characterDirectives={};state.characters.c.job="회사원";state.characters.c.workplaceId="office";
state.routines.c=[{id:"c-work",day:0,start:"10:00",end:"11:30",type:"업무",title:"직장에서 일하기",placeId:"office",withIds:[]}];
for(const id of ["a","b"]){
  state.characters[id].days={"2026-9-6":{entries:[{minute,time:"오전 10:20",title:"세 명이 대화하는 중",desc:"가람, 나래, 다온이 함께 이야기하고 있어요.",home:true,visitHomeId:"home",room:"living",withIds:[...new Set(["a","b","c"].filter(other=>other!==id))],participantOrder:["a","b","c"],groupInteraction:true,interactionId,interactionStartedMinute:minute,holdMinutes:30}]}};
}
state.characters.c.days={};state.dailyPlans={};
const staleA=eventFor(state.characters.a,date),workingC=eventFor(state.characters.c,date);
assert.equal(workingC.routineId,"c-work");
assert.equal(workingC.placeId,"office");
assert.ok(!(staleA.participantOrder||[]).includes("c"),"직장에 있는 캐릭터를 이전 3인 대화에 남겨 두면 안 된다");
assert.notEqual(staleA.interactionId,interactionId,"불일치한 3인 대화 캐시는 폐기해야 한다");

const app=read("app.js"),views=read("views.js"),css=read("app.css"),homeCss=read("home-editor-ui.css"),gradle=read("android/app/build.gradle"),prepare=read("scripts/prepare-app.mjs");
assert.match(app,/setCharacterBodyChoices\(character\.id,bodyPath,cursor\[last\],true\)/);
assert.match(app,/DIRECT_ACTIVITY_GROUPS/);assert.match(app,/data-direct-category/);assert.match(app,/data-direct-social-action/);
assert.match(views,/drawer-shop-nerine\.png\?v=20260907dev254/);
assert.doesNotMatch(views,/data-residence-field="visitDates"/);
assert.match(homeCss,/grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
assert.match(css,/\.direct-category-tabs/);
assert.match(gradle,/versionCode\s+254\b/);assert.match(gradle,/versionName\s+"1\.0\.228"/);
assert.match(prepare,/DRAWER_VILLAGE_NATIVE_BUILD="20260907dev254"/);
console.log("PASS dev 254: character impression persistence, synchronized social scenes, stale 3-person scene rejection, residence and direct-action UI");
