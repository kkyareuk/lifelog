import assert from 'node:assert/strict';
await import('../server-life.mjs');
const g=await import('../state.js?v=20260909dev305');
const {eventFor}=await import('../simulation.js');
const {isHomeSleepScene}=await import('../home-simulation.js');
const {scheduledSleeping}=await import('../sleep-clock.js');
const ids=Array.from({length:10},()=>g.createCharacter(10));
for(const id of ids){Object.assign(g.state.characters[id],{createdAt:1,wake:'07:00',sleep:'23:00',job:'무직'});}
for(const [wake,sleep] of [['07:00','23:00'],['01:00','03:00']]){
const c=g.state.characters[ids[wake==='07:00'?0:1]];Object.assign(c,{wake,sleep});
for(const hour of [0,2,6,7,9,12,18,23]){
 const date=new Date(2026,8,20,hour,20);
 c.lifeNeeds={sleep:5,hunger:90,toilet:90,hygiene:90,social:90,updatedAt:+date};
 const scene=eventFor(c,date);
 console.log(hour,scene.title,scene.room,scene.sleeping,scene.needKey,scene.coffeeRecovery);
 assert.equal(isHomeSleepScene(scene),scheduledSleeping(c,date),'timetable matches live scene at '+hour);
}
}
console.log('PASS10-character live scenes, normal and overnight wake windows, low sleep need');
