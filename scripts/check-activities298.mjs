import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
import {LIFE_TASKS} from '../life-tasks.js';
const game=await import('../state.js?v=20260909dev299'),id=game.createCharacter(10),profile=structuredClone(game.state.characters[id]),home=game.state.homes[profile.homeId],before=JSON.stringify(game.state),now=Date.now();
const snapshot={group:{id:'g',towns:[{id:'t',name:'마을',places:[]}]},residents:['a','b','c'].map(id=>({id,name:id,ownerUid:id,townId:'t',sharedHomeId:'h',profileJson:JSON.stringify({...profile,id,hobbies:['독서'],interference:'적당히 관여',personalityTypes:[]})})),homes:[{id:'h',ownerUid:'a',townId:'t',layoutJson:JSON.stringify(home)}],perceptions:[{sourceId:'a',targetId:'c',viewJson:JSON.stringify({overall:'증오'})}]};
for(const task of LIFE_TASKS){const result=advanceSharedLife(snapshot,now,{characterId:'a',kind:task.kind,lifeTask:task.id});assert.equal(JSON.parse(result.find(r=>r.id==='a').lifeJson).directive.lifeTask,task.id)}
const gossip=advanceSharedLife(snapshot,now,{characterId:'a',targetId:'b',kind:'gossip'}).map(r=>({id:r.id,...JSON.parse(r.lifeJson)}));assert.equal(gossip[0].directive.subjectId,'c');assert.equal(gossip[0].directive.topic,gossip[1].directive.topic);
const hobby=advanceSharedLife(snapshot,now,{characterId:'a',kind:'relax',lifeTask:'hobby_auto'});assert.equal(JSON.parse(hobby[0].lifeJson).directive.kind,'read');assert.equal(JSON.stringify(game.state),before);console.log('PASS all 57 shared tasks, one shared gossip topic, configured hobby, personal world isolation');
