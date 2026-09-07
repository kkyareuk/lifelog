import assert from "node:assert/strict";
import fs from "node:fs";

const stored=new Map();
globalThis.localStorage={
  get length(){return stored.size},
  key:index=>[...stored.keys()][index]??null,
  getItem:key=>stored.has(key)?stored.get(key):null,
  setItem:(key,value)=>stored.set(key,String(value)),
  removeItem:key=>stored.delete(key)
};
globalThis.window={addEventListener(){}};
globalThis.document={addEventListener(){},visibilityState:"visible"};
const {resolveHomeRoomForActivity,roomAllowsCharacter}=await import("../simulation.js");

const owner=id=>({id,homeId:"home",residences:[{homeId:"home",sleepRoomId:id==="b"?"bedroom-upstairs":"bedroom"}]});
const home={id:"home",rooms:{
  bedroom:{name:"1층 침실",type:"bedroom",floor:1,order:0,ownerMode:"selected",ownerCharacterIds:["a"],accessMode:"owners"},
  bath:{name:"1층 욕실",type:"bath",floor:1,order:1,ownerMode:"selected",ownerCharacterIds:["a"],accessMode:"owners"},
  "bedroom-upstairs":{name:"2층 침실",type:"bedroom",floor:2,order:2,ownerMode:"selected",ownerCharacterIds:["b"],accessMode:"owners"},
  "bath-upstairs":{name:"2층 욕실",type:"bath",floor:2,order:3,ownerMode:"selected",ownerCharacterIds:["b"],accessMode:"owners"},
  living:{name:"거실",type:"living",floor:1,order:4,accessMode:"everyone"}
}};
const date=new Date("2026-09-06T07:00:00+09:00");

assert.equal(roomAllowsCharacter(owner("b"),home,home.rooms.bath),false,"방주인만 방은 다른 거주자에게 닫혀야 한다");
assert.equal(resolveHomeRoomForActivity(owner("b"),home,"bath",{title:"욕실에서 씻는 중",minute:420},date),"bath-upstairs","같은 종류의 첫 방이 아니라 출입 가능한 자기 욕실을 골라야 한다");
assert.equal(resolveHomeRoomForActivity(owner("b"),home,"bedroom",{title:"자는 중",minute:30},date),"bedroom-upstairs","캐릭터별 자는 방과 그 방의 층을 보존해야 한다");
assert.equal(resolveHomeRoomForActivity(owner("c"),home,"bath",{title:"욕실에서 씻는 중",minute:420},date),"living","허용된 같은 종류 방이 없으면 방주인만 방에 침입하지 않아야 한다");

const gradle=fs.readFileSync(new URL("../android/app/build.gradle",import.meta.url),"utf8");
const prepare=fs.readFileSync(new URL("../scripts/prepare-app.mjs",import.meta.url),"utf8");
assert.match(gradle,/versionCode\s+259\b/);
assert.match(gradle,/versionName\s+"1\.0\.215\.9"/);
assert.ok(prepare.includes('DRAWER_VILLAGE_NATIVE_BUILD="20260907hotfix259"'));
console.log("PASS hotfix 247: room access, room owners, multi-room selection and sleeping floors");
