import {readFile} from "node:fs/promises";

const simulation=await readFile(new URL("../simulation.js",import.meta.url),"utf8");
const state=await readFile(new URL("../state.js",import.meta.url),"utf8");

const assert=(condition,message)=>{
  if(!condition)throw new Error(message);
};

assert(!simulation.includes('Date.now()-Number(c.createdAt)<24*60*60*1000'),"새 캐릭터를 24시간 대기시키는 조건이 남아 있습니다.");
assert(!simulation.includes('"아직 생활을 시작하지 않음"'),"새 캐릭터의 생활을 막는 대기 장면이 남아 있습니다.");
assert(simulation.includes("commitLiveEntry(c,date,withResidenceLocation(c,liveGapEvent(c,null,n,date),date))"),"생성 직후 현재 행동을 저장하는 경로가 없습니다.");
assert(simulation.includes("first-town-scene")&&simulation.includes("새로운 생활 동선을 둘러보는 중"),"집이 없는 새 캐릭터의 마을 생활 대체 장면이 없습니다.");
assert(state.includes("c.residences=(c.residences||[]).filter(item=>item.homeId!==homeId)"),"집 삭제 시 캐릭터의 삭제된 집 연결을 정리하지 않습니다.");
assert(state.includes("c.timelineResetAt=Date.now()"),"집 삭제 뒤 생활 타임라인을 다시 계산하지 않습니다.");

console.log("새 캐릭터 즉시 생활 시작 및 삭제된 집 복구 경로 검사 통과");
