const assert=require('node:assert/strict');
const {createSharedTownService}=require('../functions/shared-town');
const data=new Map([
 ['groups/g',{ownerUid:'host',towns:[{id:'t',places:[]}],buildingRevision:0}],
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
let calls=0;
const service=createSharedTownService({db,clock:()=>1000000,engine:async()=>snapshot=>{calls++;return snapshot.residents.map(r=>({id:r.id,lifeJson:'{}'}))}});
(async()=>{
 const input={groupId:'g',kind:'drink',id:'tea',item:{id:'tea',name:'Tea'},expected:null};
 await assert.rejects(service.saveCatalogItem('member',input),e=>e.status===403);
 await assert.rejects(service.saveCatalogItem('stranger',input),e=>e.status===403);
 await service.saveCatalogItem('host',input);const old=data.get('groups/g/catalog/drink').items[0];
 await assert.rejects(service.saveCatalogItem('host',input),e=>e.status===409);
 await service.saveCatalogItem('op',{...input,expected:old,item:{id:'tea',name:'New tea'}});
 await assert.rejects(service.saveCatalogItem('host',{...input,expected:old,remove:true}),e=>e.status===409);
 const current=data.get('groups/g/catalog/drink').items[0];await service.saveCatalogItem('host',{...input,expected:current,remove:true});assert.equal(data.get('groups/g/catalog/drink').items.length,0);
 await assert.rejects(service.saveCatalogItem('host',{...input,item:{...input.item,image:'data:image/png;base64,a'}}),/catalog-photo/);
 data.set('groups/g/catalog/food',{items:Array.from({length:80},(_,i)=>({id:String(i),name:String(i)}))});await assert.rejects(service.saveCatalogItem('host',input),/catalog-limit/);
 console.log('PASS shared catalog permissions, create/update/delete, concurrent edit conflicts, media and total limit');
})().catch(e=>{console.error(e);process.exitCode=1});
