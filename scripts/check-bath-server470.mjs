import {advanceSharedLife} from '../server-life.mjs';
import assert from 'node:assert/strict';
const g=await import('../state.js?v=20260909dev305');
const id=g.createCharacter(),profile=structuredClone(g.state.characters[id]),home=structuredClone(g.state.homes[id]);
home.rooms.bath.furniturePlacements=[{id:'tub',item:'욕조',x:50,y:60}];
home.rooms.bath.hideFurniture=true;
const snapshot={group:{id:'g',towns:[{id:'t',name:'Town',places:[]}]},relationships:[{id:'r',a:'a',b:'b',type:'부부'}],homes:[{id:'h',ownerUid:'u',sourceHomeId:id,townId:'t',layoutJson:JSON.stringify(home)}],residents:['a','b','c'].map(r=>({id:r,ownerUid:'u',name:r,townId:'t',sourceCharacterId:r,sourceHomeId:id,sharedHomeId:'h',profileJson:JSON.stringify({...profile,id:r}),scheduleJson:'{}'}))};
const personal=JSON.stringify(g.state),now=Date.now(),target={type:'furniture',homeId:'h',room:'bath',id:'tub'};
const apply=rows=>rows.forEach(row=>snapshot.residents.find(r=>r.id===row.id).lifeJson=row.lifeJson);
apply(advanceSharedLife(snapshot,now,{characterId:'a',kind:'wash',lifeTask:'bath',contextTarget:target}));
apply(advanceSharedLife(snapshot,now+1000,{characterId:'b',kind:'wash',lifeTask:'bath',contextTarget:target}));
assert.throws(()=>advanceSharedLife(snapshot,now+2000,{characterId:'c',kind:'wash',lifeTask:'bath',contextTarget:target}),/activity-location-required/);
apply(advanceSharedLife(snapshot,now+60000));
for(const id of ['a','b']){const life=JSON.parse(snapshot.residents.find(r=>r.id===id).lifeJson);assert(life.scene.pairedBath,JSON.stringify(life.scene));assert(life.scene.title.includes('함께 목욕'));assert(Object.values(life.days).some(day=>day.entries.some(e=>e.pairedBath)))}
apply(advanceSharedLife(snapshot,now+61000));
assert(JSON.parse(snapshot.residents[0].lifeJson).scene.pairedBath);
assert.equal(JSON.stringify(g.state),personal);
console.log('PASS multiplayer snapshot reload, shared bath and both logs, third-person rejection, personal-world isolation');
