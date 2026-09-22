const assert=require('node:assert/strict');
const {createSharedTownService}=require(process.env.DRAWER_TEST_BACKEND?process.env.DRAWER_TEST_BACKEND+'/shared-town':'../functions/shared-town');
const data=new Map([
 ['groups/g',{ownerUid:'host',towns:[{id:'t',name:'Town',places:[]}],buildingRevision:0}],
 ['groups/g/members/host',{role:'owner'}],['groups/g/members/op',{role:'operator'}],['groups/g/members/member',{role:'member'}],
 ['groups/g/residents/a',{name:'A',ownerUid:'member',townId:'t',profileJson:'{}'}],['groups/g/residents/b',{name:'B',ownerUid:'op',townId:'t',profileJson:'{}'}]
]);
const ref=(path,collection=false)=>({path,id:path.split('/').at(-1),collection:name=>ref(path+'/'+name,true),doc:name=>ref(path+'/'+name),isCollection:collection,where:(field,op,value)=>({...ref(path,true),filter:[field,value]})});
const snap=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>structuredClone(data.get(path))});
let queue=Promise.resolve();
const db={collection:name=>ref(name,true),runTransaction:run=>{
 const task=queue.then(async()=>{const writes=[];const result=await run({get:async r=>r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(s=>!r.filter||s.data()[r.filter[0]]===r.filter[1])}:snap(r.path),update:(r,value)=>writes.push([r.path,value]),set:(r,value)=>writes.push([r.path,value]),create:(r,value)=>{assert.ok(!data.has(r.path));writes.push([r.path,value])}});
 for(const [path,value] of writes)data.set(path,{...data.get(path),...structuredClone(value)});return result;});queue=task.catch(()=>{});return task;
}};

let now=1000150,calls=0,seen=[];
data.get('groups/g/residents/a').lifeJson=JSON.stringify({cooking:{active:{endsAt:now+2000}}});
const service=createSharedTownService({db,clock:()=>now,engine:async()=>(snapshot,stamp)=>{calls++;seen.push(stamp);return snapshot.residents.map(r=>{const life=JSON.parse(r.lifeJson||'{}');if(life.cooking?.active&&stamp>=life.cooking.active.endsAt)life.cooking={active:null,inventory:{dish:1}};return {id:r.id,lifeJson:JSON.stringify(life)}})}});
(async()=>{
 await assert.rejects(service.advance('stranger',{groupId:'g'}),e=>e.status===403);
 await Promise.all(Array.from({length:8},()=>service.advance('member',{groupId:'g'})));assert.equal(calls,1);assert.equal(seen[0],now,'Cooking must not round time down to the minute');
 now+=2000;await service.advance('member',{groupId:'g'});assert.equal(calls,2);assert.equal(JSON.parse(data.get('groups/g/residents/a').lifeJson).cooking.inventory.dish,1);
 await service.advance('member',{groupId:'g'});assert.equal(calls,2,'Concurrent completion does not settle twice');
 await service.saveTown('host',{groupId:'g',townId:'t',revision:0,patch:{era:'joseon',culture:'japan'}});assert.equal(data.get('groups/g').towns[0].era,'joseon');assert.equal(data.get('groups/g').towns[0].culture,'japan');
 await assert.rejects(service.saveTown('member',{groupId:'g',townId:'t',revision:1,patch:{culture:'korea'}}),e=>e.status===403);
 await assert.rejects(service.saveTown('host',{groupId:'g',townId:'t',revision:1,patch:{era:'tampered'}}),e=>e.status===400);
 console.log('PASS service auth, cooking sub-minute clock, concurrent completion, era/culture authority and validation');
})().catch(e=>{console.error(e);process.exitCode=1});
