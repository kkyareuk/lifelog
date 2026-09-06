import assert from "node:assert/strict";
import fs from "node:fs";

const files=name=>fs.readFileSync(new URL(`../${name}`,import.meta.url),"utf8");
const app=files("app.js"),views=files("views.js"),css=files("app.css"),stateSource=files("state.js"),simulationSource=files("simulation.js");
assert.match(app,/document\.elementsFromPoint\(event\.clientX,event\.clientY\)/);
assert.match(app,/if\(latest\)\{[\s\S]{0,300}moveFurniturePlacement/);
assert.match(app,/const roomRect=layer\.getBoundingClientRect\(\)/);
assert.match(app,/command==="rotate"\?\{rotation:\(Number\(current\.rotation\)\|\|0\)\+90\}/);
assert.match(views,/data-furniture-toolbar-toggle/);
assert.match(css,/\.furniture-edit-toolbar\.is-collapsed/);
assert.match(stateSource,/const globallyStoredScheduleIds=new Set/);
assert.match(simulationSource,/routineOwnerId:ownerId,routineKind:kind,participantOrder/);
assert.match(simulationSource,/const immutableInteraction=item\.interactionId&&entries\.find/);

const mailData=new Map();
const storage={scope:"tester",getItem:key=>mailData.get(key)||null,setItem:(key,value)=>mailData.set(key,String(value))};
const {createContactMailbox,mailEnvelope}=await import("../notification-mail.js");
const mailbox=createContactMailbox(storage),scheduledAt=new Date("2026-09-07T09:00:00+09:00");
const envelope=mailEnvelope({id:7,title:"질문",body:"오늘은 뭘 할까요?",at:scheduledAt,extra:{characterId:"a",mode:"question"}},storage.scope);
mailbox.record([envelope],{now:scheduledAt.getTime()});
const mailId=envelope.extra.mailId;
mailbox.mark(mailId,{answered:true,read:true});
mailbox.record([envelope],{replaceFuture:true,now:scheduledAt.getTime()+60_000});
assert.equal(mailbox.get(mailId).answered,true,"답변 완료 표식은 알림 재생성 뒤에도 유지돼야 한다");

const local=new Map();
globalThis.localStorage={
  get length(){return local.size},key:index=>[...local.keys()][index]??null,
  getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,String(value)),removeItem:key=>local.delete(key)
};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener(){},dispatchEvent(){}};
globalThis.document={addEventListener(){},querySelector(){return null},activeElement:null,visibilityState:"visible"};
const {state,updateFurniturePlacement}=await import("../state.js?v=20260907dev253");
const {accountStorage}=await import("../account-storage.js?v=20260907dev253");
const {eventFor}=await import(`../simulation.js?hotfix252=${Date.now()}`);
const character=(id,name)=>({id,name,createdAt:1,ageGroup:"성인",gender:"설정하지 않음",speechStyle:"자동 · 성격에 맞춤",townId:"town",homeId:"home",residences:[{homeId:"home",isPrimary:true,stayPattern:"상시 거주",sleepRoomId:"bedroom"}],sleepRoomId:"bedroom",wake:"07:00",sleep:"23:30",job:"무직",jobTitle:"",personalityTypes:[],characterTraits:[],traitExpressions:[],hobbies:[],interests:[],inventory:{},foodTypes:[],foodPreferences:[],musicGenres:[],appearanceTags:[],attractionTraits:[],bodyProfile:{},theme:{primary:"#176b60"},days:{},timelineResetAt:0});
state.characters=Object.fromEntries([["a","가람"],["b","나래"],["c","다온"],["d","라온"]].map(([id,name])=>[id,character(id,name)]));
state.order=["a","b","c","d"];
state.homes={home:{id:"home",name:"공동 집",townId:"town",rooms:{bedroom:{name:"침실",type:"bedroom",furniture:["침대"],furniturePlacements:[{id:"bed",item:"침대",x:25,y:40,scale:1,rotation:0,layer:0}]},living:{name:"거실",type:"living"},study:{name:"서재",type:"study"}}}};
state.towns=[{id:"town",name:"테스트 마을",places:[{id:"park",name:"공원",type:"공원"}],decorations:[]}];
state.activeTownId="town";state.world=structuredClone(state.towns[0]);state.relationships={};
updateFurniturePlacement("home","bedroom","bed",{x:62.5,y:70.8333,scale:1.5,rotation:180},true);
const savedState=JSON.parse(accountStorage.getItem("drawer-village-game-v1"));
const savedBed=savedState.homes.home.rooms.bedroom.furniturePlacements.find(item=>item.id==="bed");
assert.deepEqual({x:savedBed.x,y:savedBed.y,scale:savedBed.scale,rotation:savedBed.rotation},{x:62.5,y:70.8333,scale:1.5,rotation:-180},"가구 위치·크기·회전은 즉시 기기 저장본에 기록돼야 한다");
state.routines={a:[{id:"all-four",day:0,start:"10:00",end:"11:30",type:"모임",title:"넷이 함께 만나기",placeId:"park",withIds:["b","c","d"],notes:"함께 만나기로 했어요."}],b:[],c:[],d:[]};
state.monthlyRoutines={a:[],b:[],c:[],d:[]};state.deletedRoutineIds=[];state.deletedMonthlyRoutineIds=[];state.dailyPlans={};
const date=new Date(2026,8,6,10,30,0,0),expected=["a","b","c","d"];
for(const id of expected){
  const scene=eventFor(state.characters[id],date);
  assert.equal(scene.routineId,"all-four",`${id}에게 같은 공동 일정이 보여야 한다`);
  assert.equal(scene.interactionId,"schedule:2026-9-6:all-four:a~b~c~d");
  assert.deepEqual([...new Set([id,...scene.withIds])].sort(),expected);
  assert.equal(scene.placeId,"park");
}

const gradle=files("android/app/build.gradle"),prepare=files("scripts/prepare-app.mjs");
assert.match(gradle,/versionCode\s+253\b/);
assert.match(gradle,/versionName\s+"1\.0\.227"/);
assert.match(prepare,/DRAWER_VILLAGE_NATIVE_BUILD="20260907dev253"/);
console.log("PASS dev 253: furniture persistence, mailbox answers, immutable logs, and shared schedules");
