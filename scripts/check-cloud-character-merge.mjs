import assert from "node:assert/strict";
import {mergeDeviceAndCloudState} from "../sync-merge.js";
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
const authSource=fs.readFileSync(new URL("../auth.js",import.meta.url),"utf8");
assert.match(authSource,/const tombstoneSafeState=previousGameState\s*\?mergeDeviceAndCloudState\(localState,previousGameState\)/);
assert.match(authSource,/const imported=differentCharacters\s*\?mergeDeviceAndCloudState\(localState,remote\)/);
console.log("PASS 올리기와 자동 불러오기 모두 서로 다른 인물 구성을 병합합니다");
