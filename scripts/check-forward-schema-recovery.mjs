import assert from "node:assert/strict";

const storage=new Map();
globalThis.localStorage={
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key)
};
globalThis.window={DRAWER_VILLAGE_NATIVE:true,addEventListener:()=>{},dispatchEvent:()=>{}};
globalThis.document={querySelector:()=>null,activeElement:null,addEventListener:()=>{},visibilityState:"visible"};

const futureState={
  schema:29,lastSaved:280,activeTab:"observe",activeId:"c1",activeTownId:"town1",
  characters:{c1:{id:"c1",name:"복구할 캐릭터",createdAt:1,townId:"town1",homeId:"home1",favorites:{food:"legacy-scalar"},inventory:{fashion:null}}},order:["c1"],
  homes:{home1:{id:"home1",name:"복구할 집",townId:"town1",rooms:{bedroom:{name:"침실",type:"bedroom"}}}},
  relationships:{},characterViews:{},routines:{c1:[]},monthlyRoutines:{c1:[]},towns:[{id:"town1",name:"복구 마을",places:[]}],
  world:{name:"복구 마을",places:[]},deletedCharacterIds:[],deletedRelationshipIds:[],deletedRelationshipKeys:[],deletedHomeIds:[]
};

storage.set("drawer-village-game-v1",JSON.stringify(futureState));
const first=await import(`../state.js?forward-schema=${Date.now()}`);
assert.equal(first.state.order.length,1);
assert.equal(first.state.characters.c1.name,"복구할 캐릭터");
assert.equal(first.state.activeId,"c1");
assert.deepEqual(first.state.characters.c1.favorites.food,[]);
assert.deepEqual(first.state.characters.c1.inventory.fashion,[]);
console.log("PASS 이후 schema 29 데이터를 빈 게임으로 바꾸지 않습니다");
console.log("PASS 오래된 단일값 즐겨찾기·소지품을 안전한 배열로 복구합니다");

storage.clear();
storage.set("drawer-village-game-v1",JSON.stringify({schema:28,characters:{},order:[],deletedCharacterIds:[]}));
storage.set("drawer-village-recovery-before-cloud",JSON.stringify(futureState));
const second=await import(`../state.js?cloud-recovery=${Date.now()+1}`);
assert.equal(second.state.order.length,1);
assert.equal(second.state.characters.c1.name,"복구할 캐릭터");
assert.equal(JSON.parse(storage.get("drawer-village-game-v1")).characters.c1.name,"복구할 캐릭터");
assert.ok(storage.get("drawer-village-last-nonempty-state-v1"));
console.log("PASS 빈 현재 상태보다 클라우드 불러오기 직전 복구본을 우선해 자동 복원합니다");
