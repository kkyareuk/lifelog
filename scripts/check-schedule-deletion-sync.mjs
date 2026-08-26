import assert from "node:assert/strict";
import fs from "node:fs";
import {mergeCloudRestoreState,mergeDeviceAndCloudState} from "../sync-merge.js";

const character={id:"c1",name:"테스트",days:{}};
const device={
  lastSaved:200,characters:{c1:character},order:["c1"],homes:{},relationships:[],towns:[],world:{places:[]},
  routines:{c1:[]},monthlyRoutines:{c1:[]},deletedRoutineIds:["weekly-1"],deletedMonthlyRoutineIds:["monthly-1"]
};
const cloud={
  lastSaved:300,characters:{c1:character},order:["c1"],homes:{},relationships:[],towns:[],world:{places:[]},
  routines:{c1:[{id:"weekly-1",title:"삭제된 주간 일정"}]},
  monthlyRoutines:{c1:[{id:"monthly-1",title:"삭제된 월간 일정"}]}
};

for(const merged of [mergeDeviceAndCloudState(device,cloud),mergeCloudRestoreState(device,cloud)]){
  assert.deepEqual(merged.routines.c1,[]);
  assert.deepEqual(merged.monthlyRoutines.c1,[]);
  assert(merged.deletedRoutineIds.includes("weekly-1"));
  assert(merged.deletedMonthlyRoutineIds.includes("monthly-1"));
}
console.log("PASS 자동·수동 동기화 모두 삭제 일정 표식이 클라우드의 옛 일정보다 우선합니다");

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const state=fs.readFileSync(new URL("../state.js",import.meta.url),"utf8");
assert.match(app,/deleteStateRoutine\(characterId,id\)/);
assert.match(app,/deleteStateMonthlyRoutine\(characterId,id\)/);
assert.match(state,/day\.entries=day\.entries\.filter\(entry=>!deleted\.has\(String\(entry\?\.routineId/);
console.log("PASS 일정 삭제 버튼은 공용 삭제 처리와 해당 일정 로그 캐시 정리를 사용합니다");
