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

(async()=>{
 const service=createSharedTownService({db,clock:()=>1000,engine:()=>{}});
 const place={groupId:'g',townId:'t',id:'p',name:'Cafe',type:'카페',revision:0};await service.saveBuilding('op',place);
 const interior={rooms:{main:{type:'living',floor:2,layout:{x:0,y:0,w:50,h:50},furniturePlacements:[{id:'chair',item:'의자',x:50,y:50}]}},floorCount:2,activeFloor:2};
 const request={...place,revision:1,patch:{interior}};
 await assert.rejects(service.saveBuilding('member',request),e=>e.status===403);
 const saved=await service.saveBuilding('op',request);assert.equal(saved.town.places[0].interior.rooms.main.floor,2);
 await assert.rejects(service.saveBuilding('op',request),/edit-conflict/);
 const before=JSON.stringify([...data]);
 await assert.rejects(service.saveBuilding('op',{...request,revision:2,patch:{interior:{...interior,rooms:{main:{image:'data:image/png;base64,abc'}}}}}),/invalid-building-interior/);
 assert.equal(JSON.stringify([...data]),before);
 console.log('PASS building interiors: editing role, persisted floors and furniture, revision conflict, atomic validation');
})().catch(e=>{console.error(e);process.exitCode=1});
