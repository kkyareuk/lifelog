import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
const g=await import('../state.js?v=20260909dev297');
g.resetAll();const a=g.createCharacter(20),b=g.createCharacter(20),now=Date.now();
for(const kind of ['handhold','lean','kiss','kiss_cautious','kiss_reconcile']){
 assert.equal(g.directCharacterActivity(a,kind,{targetId:b,now}),true);
 const d=g.state.characterDirectives[a];assert.equal(d.kind,kind);assert.ok(d.copy.en.title&&d.copy.ja.title);assert.ok(d.journey.arrivesAt>=now);
}
g.state.characters[b].ageGroup='청소년';assert.equal(g.directCharacterActivity(a,'kiss',{targetId:b,now}),false);
g.state.characters[b].ageGroup='성인';g.state.characters[b].touchReaction='신체 접촉 없음';assert.equal(g.directCharacterActivity(a,'handhold',{targetId:b,now}),false);
g.state.characters[b].touchReaction='상황에 따라 자연스럽게 받아들임';
const snapshot={group:{id:'g',towns:[{id:'t',places:[]}]},residents:[a,b].map((id,i)=>({id,ownerUid:'u'+i,name:'Person '+i,townId:'t',profileJson:JSON.stringify(g.state.characters[id]),lifeJson:'{}',scheduleJson:'{}'})),homes:[]};
for(const kind of ['handhold','lean','kiss_cautious','kiss_reconcile']){
 const result=advanceSharedLife(snapshot,now,{characterId:a,targetId:b,kind});
 assert.equal(JSON.parse(result[0].lifeJson).directive.kind,kind);
 assert.equal(JSON.parse(result[1].lifeJson).directive.kind,kind);
}
console.log('PASS adult contact actions, translated logs, age/contact boundaries and shared two-character directives');
