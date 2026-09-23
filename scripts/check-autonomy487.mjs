import assert from 'node:assert/strict';
await import('../server-life.mjs');
const {state:s,createCharacter}=await import('../state.js?v=20260909dev305');
const sim=await import('../simulation.js?v=20260909dev305');
const {needsAt}=await import('../life-needs.js');
const {roomActivityKey}=await import('../room-activities.js?v=20260909dev305');
let now=+new Date(2026,8,23,14,0);Date.now=()=>now;
const id=createCharacter(),c=s.characters[id];c.job='무직';c.wake='07:00';c.sleep='23:00';c.createdAt=now-86400000;c.timelineResetAt=now-86400000;
sim.timeline(c,new Date(now));
c.days['2026-9-23'].entries=[{minute:840,title:'책을 읽는 중',desc:'책을 읽고 있어요.',home:true,room:'study',holdMinutes:50}];
c.lifeNeeds={hunger:0,sleep:90,hygiene:90,toilet:90,social:90,updatedAt:now};
for(const dt of [0,15000,15000,1000,1000]){now+=dt;const e=sim.eventFor(c,new Date(now));console.log(dt,e.title,e.needKey,needsAt(c,now).hunger,c.lifeNeeds.recoveryEndsAt,c.lifeNeeds.needStartedAt);}
assert.equal(needsAt(c,now).hunger>99,true);
now+=86400000;for(const dt of [0,30000,1000]){now+=dt;const e=sim.eventFor(c,new Date(now));console.log('next',e.title,e.needKey,needsAt(c,now).hunger)}
assert(needsAt(c,now).hunger>99);
// Four independent characters with the same saved activity must separate without render churn.
const ids=[id,createCharacter(),createCharacter(),createCharacter()];
for(const cid of ids){const ch=s.characters[cid];ch.job='무직';ch.wake='07:00';ch.sleep='23:00';ch.createdAt=now-86400000;ch.timelineResetAt=now-86400000;sim.timeline(ch,new Date(now));ch.days['2026-9-24'].entries=[{minute:840,title:'책을 읽는 중',desc:'책을 읽고 있어요.',home:true,room:'study',holdMinutes:50}];ch.lifeNeeds={hunger:100,sleep:90,hygiene:90,toilet:90,social:90,updatedAt:now};}
s.relationships={};
for(const cid of ids){const e=sim.eventFor(s.characters[cid],new Date(now));console.log('diverse',cid,e.title,roomActivityKey(e));}
const first=ids.map(cid=>sim.eventFor(s.characters[cid],new Date(now)));
assert.equal(new Set(first.map(e=>e.baseTitle||e.title)).size,4);
const second=ids.map(cid=>sim.eventFor(s.characters[cid],new Date(now)));
assert.deepEqual(second.map(e=>e.baseTitle||e.title),first.map(e=>e.baseTitle||e.title),'re-render must not change chosen activities');
console.log('PASS live engine: meals reach full without cooking interruption; four independent activities stay stable');
