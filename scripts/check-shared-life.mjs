import {advanceSharedLife} from '../server-life.mjs';
import assert from 'node:assert/strict';
const game=await import('../state.js?v=20260909dev300');
const id=game.createCharacter(5),profile=structuredClone(game.state.characters[id]),before=JSON.stringify(game.state);
const snapshot={group:{id:'test',towns:[{id:'town',name:'Shared',places:[{id:'park',name:'Park',type:'공원',x:30,y:40,stock:[]}]}]},residents:Array.from({length:2},(_,i)=>({id:'r'+i,name:'Person '+i,ownerUid:'u'+i,townId:'town',sourceCharacterId:'c'+i,profileJson:JSON.stringify({...profile,wake:'07:00',sleep:'23:00'}),scheduleJson:'{}'})),homes:[]};
snapshot.residents.forEach(r=>{const p=JSON.parse(r.profileJson);p.createdAt=1;r.profileJson=JSON.stringify(p)});
const result=advanceSharedLife(snapshot,new Date('2026-09-07T13:00:00+09:00').getTime());
assert.equal(result.length,2);for(const r of result){const life=JSON.parse(r.lifeJson);assert.ok(life.scene.title);assert.ok(Object.keys(life.days).length);console.log(r.id,life.scene.title)}
assert.equal(JSON.stringify(game.state),before,'Personal world must remain untouched');
console.log('PASS shared life');

const crowded={...snapshot,residents:Array.from({length:200},(_,i)=>({...snapshot.residents[i%2],id:'resident-'+i,ownerUid:'user-'+i}))};
const started=performance.now(),lives=advanceSharedLife(crowded,Date.now());
assert.equal(lives.length,200);console.log('200 shared residents:',Math.round(performance.now()-started),'ms',Math.round(JSON.stringify(lives).length/1024),'KB');
assert.equal(JSON.stringify(game.state),before);

const commandNow=Date.now(),departing=advanceSharedLife(snapshot,commandNow,{characterId:'r0',targetId:'r1',kind:'dine'});
assert.match(JSON.parse(departing[0].lifeJson).scene.title,/만나러/);assert.match(JSON.parse(departing[1].lifeJson).scene.title,/기다리는/);
const arrivedSnapshot={...snapshot,residents:snapshot.residents.map(r=>({...r,lifeJson:departing.find(d=>d.id===r.id).lifeJson}))};
const sharedMeal=advanceSharedLife(arrivedSnapshot,commandNow+55000).map(r=>JSON.parse(r.lifeJson).scene);
assert.ok(sharedMeal.every(e=>/식사/.test(e.title)),JSON.stringify(sharedMeal.map(e=>e.title)));
assert.equal(sharedMeal[0].interactionId,sharedMeal[1].interactionId);
const care=structuredClone(snapshot);const profileCare=JSON.parse(care.residents[0].profileJson);profileCare.bodyProfile.carePlan={mode:'낮 병동',weekdays:['월'],start:'09:00',end:'16:00',placeId:'hospital'};care.residents[0].profileJson=JSON.stringify(profileCare);care.group.towns[0].places.push({id:'hospital',name:'마을 병원',type:'병원',x:50,y:50,stock:[]});
const careScene=JSON.parse(advanceSharedLife(care,new Date('2026-09-07T11:00:00+09:00').getTime())[0].lifeJson).scene;
assert.ok(careScene.routineId==='care-r0',JSON.stringify(careScene));
const afterCare=JSON.parse(advanceSharedLife(care,new Date('2026-09-07T17:00:00+09:00').getTime())[0].lifeJson).scene;
assert.notEqual(afterCare.routineId,'care-r0');
console.log('PASS shared meal counterpart identity and explicit day-hospital schedule boundaries');

// A solo command must cancel both sides of the previous encounter, including
// its saved timeline row, even when an old UI sends a leftover target id.
const readingWorld=structuredClone(arrivedSnapshot);readingWorld.homes=[{id:'reading-home',ownerUid:'u1',townId:'town',layoutJson:JSON.stringify({rooms:{living:{type:'living',furniture:[]}}})}];readingWorld.residents[1].sharedHomeId='reading-home';
const reading=advanceSharedLife(readingWorld,commandNow+15000,{characterId:'r1',kind:'read',targetId:'r0'});
const reader=JSON.parse(reading.find(r=>r.id==='r1').lifeJson),former=JSON.parse(reading.find(r=>r.id==='r0').lifeJson);
assert.equal(reader.directive.targetId,'');assert.deepEqual(reader.directive.withIds,[]);
assert.equal(former.directive,null);assert.ok(!former.scene.meetingWaiting);assert.ok(!former.scene.manualDirective);
const reverse=advanceSharedLife(snapshot,commandNow,{characterId:'r1',kind:'talk',targetId:'r0'});
const actor=JSON.parse(reverse.find(r=>r.id==='r1').lifeJson),partner=JSON.parse(reverse.find(r=>r.id==='r0').lifeJson);
assert.equal(actor.directive.journey.actorId,'r1');assert.ok(actor.scene.meetingJourney);assert.ok(partner.scene.meetingWaiting);
console.log('PASS reverse command movement and solo cancellation of stale partner');
