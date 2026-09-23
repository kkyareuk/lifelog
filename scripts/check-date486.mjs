import assert from 'node:assert/strict';
await import('../server-life.mjs');
const g=await import('../state.js?v=20260909dev305'),sim=await import('../simulation.js?v=20260909dev305');
const a=g.createCharacter(),b=g.createCharacter();const s=g.state,now=new Date(2026,8,23,14,0),key='2026-9-23';
for(const id of [a,b]){const c=s.characters[id];c.job='무직';c.wake='07:00';c.sleep='23:00';c.createdAt=+now-86400000;c.timelineResetAt=+now-86400000;sim.timeline(c,now)}
s.relationships={ab:{id:'ab',a,b,type:'연인',temporalStatus:'current'}};
for(const id of [a,b])sim.timeline(s.characters[id],now);
const source={minute:840,time:'14:00',title:'데이트 · 디저트를 나눠 먹으며 다음 약속 정하기',desc:'함께 디저트를 먹고 있어요.',dateGroup:`date:${a}:${b}`,datePurpose:'디저트를 나눠 먹으며 다음 약속 정하기',mood:'데이트',home:false,placeId:'cafe',townId:s.characters[a].townId,interactionId:'date486',groupInteraction:true,participantOrder:[a,b],holdMinutes:25,interactionStartedMinute:840};
for(const id of [a,b]){const day=s.characters[id].days[key];assert(day);day.entries=[{...source,withId:id===a?b:a,withIds:[id===a?b:a]}]}
// Simulate an already-saved counterpart from the old broken code.
delete s.characters[b].days[key].entries[0].dateGroup;delete s.characters[b].days[key].entries[0].datePurpose;s.characters[b].days[key].entries[0].mood='일상';
for(const id of [b,a,b,a]){const e=sim.eventFor(s.characters[id],now);console.log(id===a?'a':'b',e.title,e.dateGroup,e.groupInteraction);assert.equal(e.dateGroup,source.dateGroup);assert.equal(e.datePurpose,source.datePurpose);assert.equal(e.withId,id===a?b:a);assert(!/혼자 잠시/.test(e.title));}
console.log('PASS reciprocal date identity across both observation orders and legacy counterpart');
for(const first of [a,b]){
 for(const id of [a,b])s.characters[id].days[key].entries=[{...source,withId:id===a?b:a,withIds:[id===a?b:a],groupInteraction:false,interactionId:undefined}];
 const e=sim.eventFor(s.characters[first],now),other=first===a?b:a,peer=s.characters[other].days[key].entries.find(x=>x.interactionId===e.interactionId);
 assert(e.groupInteraction);assert.equal(peer?.dateGroup,source.dateGroup);assert.equal(peer?.datePurpose,source.datePurpose);assert.equal(peer?.mood,'데이트');
 assert.equal(sim.eventFor(s.characters[other],now).dateGroup,source.dateGroup);
}
console.log('PASS newly created shared dates persist date metadata to both characters');
