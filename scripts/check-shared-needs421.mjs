import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
const g=await import('../state.js?v=20260909dev305');const id=g.createCharacter(),profile=structuredClone(g.state.characters[id]),home=structuredClone(g.state.homes[profile.homeId]);
const realNow=Date.now;let clock=realNow();Date.now=()=>clock;
const initial={group:{id:'qa',towns:[{id:'town',name:'QA',places:[]}]},residents:[{id:'r',sourceCharacterId:id,ownerUid:'u',name:'QA',townId:'town',sharedHomeId:'h',profileJson:JSON.stringify({...profile,createdAt:1,lifeNeeds:{sleep:20,hunger:20,toilet:20,hygiene:20,social:80,updatedAt:clock}}),scheduleJson:'{}'}],homes:[{id:'h',ownerUid:'u',townId:'town',layoutJson:JSON.stringify(home)}]};
try{
 for(const [kind,task,key] of [['nap','sleep','sleep'],['meal','', 'hunger'],['wash','shower','hygiene']]){
  let snapshot=structuredClone(initial);const run=command=>{const out=advanceSharedLife(snapshot,clock,command);snapshot.residents[0].lifeJson=out[0].lifeJson;return JSON.parse(out[0].lifeJson)};
  let life=run({characterId:'r',kind,lifeTask:task});clock=Math.max(clock,life.directive.journey.arrivesAt)+1000;life=run();const before=life.lifeNeeds[key];clock+=60000;life=run();assert.ok(life.lifeNeeds[key]>before,JSON.stringify({kind,before,after:life.lifeNeeds}));
 }
 const denied=structuredClone(initial),layout=JSON.parse(denied.homes[0].layoutJson);for(const r of Object.values(layout.rooms))r.allowedActivities=[];denied.homes[0].layoutJson=JSON.stringify(layout);
 assert.throws(()=>advanceSharedLife(denied,clock,{characterId:'r',kind:'nap',lifeTask:'sleep'}),/activity-location-required/);
 console.log('PASS shared server: actual sleep/eat/wash commands recover across persisted snapshots; room limits reject prohibited command.');
}finally{Date.now=realNow}
