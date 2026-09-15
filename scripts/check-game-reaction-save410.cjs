const assert=require('node:assert/strict'),engine=require('../functions/mafia-stage');
const g=engine.start({rulesVersion:4,drama:true,id:'g',seed:'save',mode:'live',capacity:4,deadlineAt:45000,locations:[0,1,2].map(i=>({id:'l'+i,name:'L'+i,selected:true,square:i===0})),players:[0,1,2,3].map(i=>({id:'p'+i,name:'P'+i,ownerUid:'u'+i,delegated:i>0,sleep:'23:00'}))});
g.phase='rebuttal';g.currentClaim={speaker:'p0',kind:'unknown'};g.meetingEndsAt=300000;g.deadlineAt=30000;g.bias={'p1:p0':-3};g.claimIssues={};
const records=new Map([['groups/test',{ownerUid:'u0'}],['groups/test/members/u0',{role:'owner'}],['groups/test/games/g',g]]);let saved;
function ref(path){return {path,collection:n=>ref(path+'/'+n),doc:n=>ref(path+'/'+n)}}
const db={collection:ref,runTransaction:async fn=>fn({get:async r=>r.path.endsWith('/residents')?{docs:g.players.map(p=>({id:p.id,data:()=>p}))}:{exists:records.has(r.path),data:()=>structuredClone(records.get(r.path))},set:(r,v)=>{if(r.path.endsWith('/games/g'))saved=v},update(){}})};
const api=require('../functions/plaza-games')({db,clock:()=>10000});
api.advanceGame('u0',{groupId:'test',gameId:'g'}).then(out=>{assert.equal(out.phase,'rebuttal');assert(saved,'same-phase NPC reaction was not persisted');assert(saved.history.some(h=>h.kind==='agree'&&h.speaker==='p1'));console.log('PASS410 same-phase NPC meeting reaction persists')}).catch(e=>{console.error(e);process.exitCode=1});
