import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
import {scheduledSleeping,sleepNeedAfter} from '../sleep-clock.js';
import {needsAt} from '../life-needs.js';
import {GROUP_ACTIVITY_KINDS} from '../group-activity.js';
import {advanceHomeLifeSimulation as placePeople} from '../home-simulation.js';
const at=(day,h,m=0)=>+new Date(2026,8,day,h,m);
for(const [wake,sleep] of [['07:00','23:00'],['01:00','03:00']]){
 const c={wake,sleep};
 for(let m=0;m<1440;m++){
  const w=Number(wake.slice(0,2))*60,s=Number(sleep.slice(0,2))*60;
  assert.equal(scheduledSleeping(c,new Date(at(19,0,m))),s<w?m>=s&&m<w:m>=s||m<w);
 }
 assert(sleepNeedAfter(c,10,at(18,22),at(19,2))>75,'offline scheduled sleep restores energy');
}
const day={wake:'07:00',sleep:'23:00'};
assert.equal(sleepNeedAfter(day,0,at(18,22),at(19,9)),90);
assert.equal(needsAt({...day,lifeNeeds:{sleep:0,updatedAt:at(18,22)}},at(19,9)).sleep,90);
assert.equal(scheduledSleeping({...day,autonomousActivityBlocks:['sleep']},new Date(at(19,0))),false);
const now=at(19,12),home={id:'h',townId:'t',rooms:{living:{floor:1,type:'living'},dining:{floor:1,type:'dining'},kitchen:{floor:1,type:'kitchen'}}};
const people=['a','b','c','d'].map(id=>({id,name:id.toUpperCase(),homeId:'h',townId:'t',wake:'07:00',sleep:'23:00',createdAt:1}));
const snapshot={group:{id:'g',towns:[{id:'t',name:'Town',places:[]}]},homes:[{...home,sourceHomeId:'h',ownerUid:'u',layoutJson:JSON.stringify(home)}],residents:people.map(c=>({id:c.id,name:c.name,ownerUid:'u',sourceHomeId:'h',townId:'t',profileJson:JSON.stringify(c),lifeJson:JSON.stringify({scene:{home:true,visitHomeId:'h',room:'living',title:'쉬는 중',townId:'t'}})}))};
for(const kind of GROUP_ACTIVITY_KINDS){
 const before=JSON.stringify(snapshot);
 const start=advanceSharedLife(snapshot,now,{characterId:'a',targetId:'b',companionIds:['c','d'],kind});
 const lives=start.map(r=>JSON.parse(r.lifeJson));
 assert(lives.every(l=>l.directive?.withIds.length===4),kind+' has all participants');
 assert.equal(new Set(lives.map(l=>l.directive.id)).size,1);
 assert.equal(new Set(lives.map(l=>l.directive.journey.arrivesAt)).size,1);
 const reloaded={...snapshot,residents:snapshot.residents.map(r=>({...r,lifeJson:start.find(l=>l.id===r.id).lifeJson}))};
 const arrived=advanceSharedLife(reloaded,now+60000).map(r=>JSON.parse(r.lifeJson));
 assert(arrived.every(l=>l.scene.groupInteraction&&l.scene.withIds.length===3),kind+' survives reconnect');
 assert.equal(new Set(arrived.map(l=>l.scene.interactionId)).size,1);
 assert.equal(JSON.stringify(snapshot),before,'shared source snapshot stays immutable');
}
assert.throws(()=>advanceSharedLife(snapshot,now,{characterId:'a',targetId:'b',companionIds:['missing'],kind:'talk'}),/activity-location-required/);
const contexts=Object.fromEntries(people.map(c=>[c.id,{scene:{title:'함께 대화하는 중',room:'living'},interactionId:'group-test',partnerIds:people.map(p=>p.id),animateMovement:false}]));
home.rooms.living.furniturePlacements=[{id:'plant',item:'화분',x:90,y:30}];
const grouped=placePeople(home,people.map(c=>c.id),contexts,now).simulation;
assert.equal(new Set(Object.values(grouped.agents).map(a=>a.interactionId)).size,1);
assert.equal(new Set(Object.values(grouped.agents).map(a=>a.x+':'+a.y)).size,4,'four different meeting positions');
const pair=placePeople(home,['a','b'],contexts,now).simulation.agents;
assert(pair.a.x<pair.b.x,'first partner stays left');
const game=await import('../state.js?v=20260909dev305');
const id=game.createCharacter(),character=game.state.characters[id],ownHome=game.state.homes[character.homeId];
const bedRoom=Object.keys(ownHome.rooms).find(k=>ownHome.rooms[k].type==='bedroom'||k==='bedroom');
assert(bedRoom);ownHome.rooms[bedRoom].furniturePlacements=[{id:'qa-bed',item:'침대',x:72,y:48,assignedCharacterIds:[id]}];
character.sleepRoomId=bedRoom;
const sleeping=game.advanceHomeLifeSimulation(ownHome.id,[id],{[id]:{scene:{title:'자는 중',sleeping:true,room:bedRoom},animateMovement:false}},now,false).simulation.agents[id];
assert.equal(sleeping.furnitureId,'qa-bed','state wrapper passes actual sleep scene through room restrictions');
console.log('PASS453: 2880 timetable boundaries, overnight energy recovery, 4-person shared activities and reconnect for all 8 activities, invalid member rejection');
