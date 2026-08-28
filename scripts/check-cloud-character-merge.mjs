import assert from "node:assert/strict";
import {mergeCloudRestoreState,mergeDeviceAndCloudState} from "../sync-merge.js";
import fs from "node:fs";

const character=(id,name)=>({id,name,photo:"",icon:""});
const device={
  lastSaved:200,uiLanguage:"ko",activeId:"local",deletedCharacterIds:["gone"],deletedHomeIds:[],deletedRelationshipIds:[],deletedRelationshipKeys:[],
  characters:{shared:character("shared","기기 최신"),local:character("local","기기 전용")},order:["local","shared"],
  homes:{"home-local":{id:"home-local",name:"기기 집"}},routines:{local:[{id:"routine-local",day:1}]},relationships:[],towns:[],world:{places:[]}
};
const cloud={
  lastSaved:100,uiLanguage:"ja",activeId:"cloud",deletedCharacterIds:[],deletedHomeIds:[],deletedRelationshipIds:[],deletedRelationshipKeys:[],
  characters:{shared:character("shared","클라우드 구버전"),cloud:character("cloud","클라우드 전용"),gone:character("gone","삭제됨")},order:["shared","cloud","gone"],
  homes:{"home-cloud":{id:"home-cloud",name:"클라우드 집"}},routines:{cloud:[{id:"routine-cloud",day:2}]},relationships:[],towns:[],world:{places:[]}
};

const merged=mergeDeviceAndCloudState(device,cloud);
assert.deepEqual(merged.order,["local","shared","cloud"]);
assert.equal(merged.characters.shared.name,"기기 최신");
assert.equal(merged.characters.cloud.name,"클라우드 전용");
assert.equal(merged.characters.gone,undefined);
assert.equal(merged.homes["home-local"].name,"기기 집");
assert.equal(merged.homes["home-cloud"].name,"클라우드 집");
assert.equal(merged.routines.local[0].id,"routine-local");
assert.equal(merged.routines.cloud[0].id,"routine-cloud");
assert.equal(merged.uiLanguage,"ko");
assert.equal(merged.activeId,"local");
console.log("PASS 기기·클라우드의 서로 다른 인물과 연결 데이터를 합칩니다");
console.log("PASS 양쪽 삭제 기록이 캐릭터보다 우선합니다");
console.log("PASS 같은 ID는 더 최신인 전체 상태를 우선합니다");
console.log("PASS 현재 기기의 언어·화면 설정을 보존합니다");
const restoreDevice={
  ...device,lastSaved:300,activeId:null,characters:{},order:[],homes:{},
  deletedCharacterIds:["cloud"],deletedHomeIds:["home-cloud"],
  interactions:[{id:"device-copy",type:"request",actorId:"cloud",requestTitle:"책 정리",createdAt:1234}]
};
const restoreCloud={
  ...cloud,lastSaved:200,characters:{cloud:{...character("cloud","복구된 캐릭터"),days:{"2026-08-23":{entries:[{minute:60,title:"기존 로그"}]}}}},order:["cloud"],
  homes:{"home-cloud":{id:"home-cloud",name:"복구된 집"}},deletedCharacterIds:[],deletedHomeIds:[],
  interactions:[{id:"cloud-copy",type:"request",actorId:"cloud",requestTitle:"책 정리",createdAt:1234}]
};
const restored=mergeCloudRestoreState(restoreDevice,restoreCloud);
assert.equal(restored.characters.cloud,undefined);
assert.equal(restored.homes["home-cloud"],undefined);
assert.equal(restored.deletedCharacterIds.includes("cloud"),true);
assert.equal(restored.deletedHomeIds.includes("home-cloud"),true);
assert.equal(restored.interactions.length,0);
console.log("PASS 수동 불러오기도 현재 기기의 삭제표를 보존해 삭제한 캐릭터와 집을 되살리지 않습니다");
console.log("PASS 삭제한 캐릭터에 연결된 원격 상호작용도 함께 제거합니다");
const authSource=fs.readFileSync(new URL("../auth.js",import.meta.url),"utf8");
assert.match(authSource,/const tombstoneSafeState=previousGameState\s*\?mergeDeviceAndCloudState\(localState,previousGameState\)/);
assert.match(authSource,/const imported=automatic\s*\?differentCharacters\?mergeDeviceAndCloudState\(localState,remote\):applyLocalTombstones\(remote,localState\)\s*:mergeCloudRestoreState\(localState,remote\)/);
console.log("PASS 업로드·자동 불러오기와 명시적 복구의 병합 정책을 분리합니다");
