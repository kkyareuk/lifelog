const assert=require('node:assert/strict'),engine=require('../functions/mafia-engine');
const make=mode=>engine.start({id:'g',name:'Test',seed:'live401',mode,capacity:5,durationMs:mode==='live'?60000:21600000,deadlineAt:60000,locations:['a','b','c'].map(id=>({id,name:id})),players:Array.from({length:5},(_,i)=>({id:'p'+i,ownerUid:'u'+i,name:'P'+i,delegated:false}))});
const g=make('live');assert(engine.validatePlan(g,g.players[0],[{kind:'investigate',place:g.players[0].place}]));assert(!engine.validatePlan(g,g.players[0],Array(6).fill({kind:'task',place:'a'})));
for(let tick=0;tick<6;tick++){for(const p of g.players)g.submissions[p.id]={plan:[{kind:'investigate',place:p.place}]};engine.advance(g,g.deadlineAt);assert.equal(g.phaseIndex,tick+1);if(tick<5){assert.equal(g.phase,'plan');assert.equal(g.actionTick,tick+1);assert.equal(g.deadlineAt,60000*(tick+2))}}
assert.equal(g.status,'playing');assert.equal(g.phase,'debate');assert.equal(g.debateRound,0);assert.equal(g.deadlineAt,405000);assert(g.cards.p0.some(c=>c.tick===0));assert(g.cards.p0.some(c=>c.tick===5));engine.advance(g,405000);assert.equal(g.debateRound,1);assert.equal(g.deadlineAt,450000);assert(g.history.some(h=>h.kind==='statement'));const before=structuredClone(g);engine.advance(g,405000);assert.deepEqual(g,before);
const old=make('async');engine.advance(old,60000);assert.equal(old.deadlineAt,21660000);assert.equal(old.phase,'debate');
for(let seed=0;seed<30;seed++){const q=make('live');q.seed=String(seed);for(let n=0;n<200&&q.status==='playing';n++)engine.advance(q,q.deadlineAt);assert.equal(q.status,'finished')}
console.log('PASS401: one action per 60s, six steps retained, 45s opening/discussion deadlines, idempotence, legacy timing, 30 complete live games');

const data=new Map(),clone=structuredClone;let now=100;
const snap=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>data.has(path)?clone(data.get(path)):undefined});
const ref=path=>({path,id:path.split('/').at(-1),collection:key=>col(path+'/'+key),get:async()=>snap(path)});
const col=(path,filters=[],cap=Infinity)=>({doc:key=>ref(path+'/'+key),where:(key,op,value)=>col(path,[...filters,[key,op,value]],cap),orderBy:()=>col(path,filters,cap),limit:n=>col(path,filters,n),get:async()=>({docs:[...data.keys()].filter(k=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')&&filters.every(([f,op,v])=>op==='in'?v.includes(data.get(k)[f]):data.get(k)[f]===v)).slice(0,cap).map(snap)})});
const db={collection:col,runTransaction:async fn=>{const writes=[];const tx={get:async r=>{assert.equal(writes.length,0,'read after write');return r.get()},set:(r,v)=>writes.push(()=>data.set(r.path,clone(v))),create:(r,v)=>writes.push(()=>{assert(!data.has(r.path));data.set(r.path,clone(v))}),update:(r,v)=>writes.push(()=>data.set(r.path,{...data.get(r.path),...clone(v)}))};const result=await fn(tx);writes.forEach(f=>f());return result}};
const service=require('../functions/plaza-games')({db,clock:()=>now});

(async()=>{
 data.set('groups/g',{ownerUid:'u0',towns:[{id:'t',places:['a','b','c','d'].map(id=>({id,name:id}))}]});const q=make('live');for(const p of q.players){data.set('groups/g/members/'+p.ownerUid,{role:'member'});data.set('groups/g/residents/'+p.id,{name:p.name,ownerUid:p.ownerUid})}data.set('groups/g/games/live',q);
 const created=await service.createGame('u0',{groupId:'g',gameId:'new',name:'Live',mode:'live',capacity:5,hours:6,locations:['t:a','t:b','t:c','t:d']});assert.equal(created.mode,'live');assert.equal(data.get('groups/g/games/new').durationMs,60000);
 await service.submitGame('u0',{groupId:'g',gameId:'live',characterId:'p0',phaseIndex:0,action:{plan:Array(6).fill({kind:'investigate',place:q.players[0].place})}});assert.equal(data.get('groups/g/games/live').submissions.p0.plan.length,1);
 console.log('PASS401 service creates live mode and accepts a safe first action from older six-step clients');
})().catch(e=>{console.error(e);process.exitCode=1});
