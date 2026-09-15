const assert=require('node:assert/strict'),engine=require('../functions/mafia-engine');
const g=engine.start({id:'test',name:'Test',seed:'400',capacity:5,hostUid:'u0',deadlineAt:10,durationMs:10,locations:['a','b','c'].map(id=>({id,name:id})),players:Array.from({length:5},(_,i)=>({id:'p'+i,ownerUid:'u'+i,name:'P'+i,delegated:i>1}))});
g.phase='debate';g.debateRound=0;
for(const p of g.players)g.cards[p.id]=[0,1,2,3,4,5,6,7,8].map(tick=>({kind:'alibi',id:p.id+tick,day:1,tick,place:'a',subject:p.id,action:tick>=6?'rest':p.role==='mafia'?'sabotage':'investigate'}));
const mine=g.players[0],draft=engine.openingStatement(g,mine);assert.deepEqual(draft.map(s=>s.period),[0,1,2,3]);assert(engine.validateStatement(g,draft));assert(!engine.validateStatement(g,draft.slice(1)));assert(!engine.validateStatement(g,draft.map(s=>({...s,place:'other-group'}))));assert(!engine.validateStatement(g,draft.map(s=>({...s,action:'tag'}))));
const modified=draft.map(s=>({...s,place:'b'}));g.submissions[mine.id]={kind:'statement',segments:modified};
assert.deepEqual(Object.keys(engine.view(g,'u0').openingDrafts),['p0']);assert.deepEqual(engine.view(g,'outsider').openingDrafts,{});
engine.advance(g,10);assert.equal(g.debateRound,1);assert.equal(g.history.length,5);assert(g.history.every(h=>h.kind==='statement'&&h.segments.length===4));assert.deepEqual(g.history[0].segments,modified);assert(!JSON.stringify(g.history).includes('sabotage'));assert(!JSON.stringify(g.history).includes('role'));assert.equal(g.board.length,0,'claims must not pretend to be verified cards');const saved=structuredClone(g.history);engine.advance(g,10);assert.deepEqual(g.history,saved,'no repeated opening statements');
const old=structuredClone(g);old.debateRound=0;old.phaseIndex++;old.deadlineAt=30;old.cards={};old.submissions={p0:{kind:'accuse',targetId:'p1'}};engine.advance(old,30);assert.equal(old.history.filter(h=>h.kind==='statement').length,10,'legacy unsubmitted first rounds get a safe opening statement');
console.log('PASS400 four ordered opening statements, user edits, NPC defaults, private roles/drafts, claim/evidence separation, no duplicates, legacy games');

const data=new Map(),clone=structuredClone;let now=100;
const snap=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>data.has(path)?clone(data.get(path)):undefined});
const ref=path=>({path,id:path.split('/').at(-1),collection:key=>col(path+'/'+key),get:async()=>snap(path)});
const col=(path,filters=[],cap=Infinity)=>({doc:key=>ref(path+'/'+key),where:(key,op,value)=>col(path,[...filters,[key,op,value]],cap),orderBy:()=>col(path,filters,cap),limit:n=>col(path,filters,n),get:async()=>({docs:[...data.keys()].filter(k=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')&&filters.every(([f,op,v])=>op==='in'?v.includes(data.get(k)[f]):data.get(k)[f]===v)).slice(0,cap).map(snap)})});
const db={collection:col,runTransaction:async fn=>{const writes=[];const tx={get:async r=>{assert.equal(writes.length,0,'read after write');return r.get()},set:(r,v)=>writes.push(()=>data.set(r.path,clone(v))),create:(r,v)=>writes.push(()=>{assert(!data.has(r.path));data.set(r.path,clone(v))}),update:(r,v)=>writes.push(()=>data.set(r.path,{...data.get(r.path),...clone(v)}))};const result=await fn(tx);writes.forEach(f=>f());return result}};
const service=require('../functions/plaza-games')({db,clock:()=>now});

(async()=>{
 const current=structuredClone(g);current.phase='debate';current.debateRound=0;current.deadlineAt=1000;current.submissions={};
 data.set('groups/g',{ownerUid:'u0'});for(const p of current.players){data.set('groups/g/members/'+p.ownerUid,{role:'member'});data.set('groups/g/residents/'+p.id,{ownerUid:p.ownerUid,name:p.name})}data.set('groups/g/games/opening',current);
 const input={groupId:'g',gameId:'opening',characterId:'p0',phaseIndex:current.phaseIndex};
 await service.submitGame('u0',{...input,action:{kind:'accuse',targetId:'p1'}});assert.equal(data.get('groups/g/games/opening').submissions.p0.kind,'statement','older clients safely submit a default opening');
 await assert.rejects(service.submitGame('u0',{...input,action:{kind:'statement',segments:[{period:0,place:'other',action:'task'}]}}),/invalid-statement/);
 await assert.rejects(service.submitGame('u1',{...input,action:{kind:'statement',segments:modified}}),/owner-required/);
 await service.submitGame('u0',{...input,action:{kind:'statement',segments:modified.map(s=>({...s,role:'mafia',subject:'p1'}))}});
 const saved=data.get('groups/g/games/opening');assert.deepEqual(saved.submissions.p0,{kind:'statement',segments:modified});
 console.log('PASS400 authenticated opening submissions: shape validation, owner authorization and sanitized claims');
})().catch(e=>{console.error(e);process.exitCode=1});
