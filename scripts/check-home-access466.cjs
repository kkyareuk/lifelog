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
 const home={ownerUid:'host',townId:'t',layoutRevision:0,layoutJson:JSON.stringify({rooms:{living:{furniturePlacements:[]}}})};data.set('groups/g/homes/h',home);
 data.get('groups/g/residents/a').residences=[{homeId:'h'}];
 const layout={rooms:{living:{name:'Edited',furniturePlacements:[]}}};
 await service.saveHomeLayout('member',{groupId:'g',id:'h',revision:0,layout});assert.equal(data.get('groups/g/homes/h').layoutRevision,1);
 await service.saveHomePlacement('member',{groupId:'g',id:'h',revision:0,patch:{mapX:60,exteriorImage:'https://example.com/home.png'}});
 await assert.rejects(service.saveHomePlacement('member',{groupId:'g',id:'h',revision:1,patch:{ownerName:'Changed'}}),/home-owner-required/);
 data.get('groups/g/residents/a').residences=[];
 await assert.rejects(service.saveHomeLayout('member',{groupId:'g',id:'h',revision:1,layout}),/home-owner-required/);
 await assert.rejects(service.saveHomeLayout('outsider',{groupId:'g',id:'h',revision:1,layout}),/group-membership-required/);
 data.get('groups/g/residents/a').sharedHomeId='h';
 await assert.rejects(service.saveHomeLayout('member',{groupId:'g',id:'h',revision:1,layout}),/home-owner-required/);
 delete data.get('groups/g/residents/a').residences;
 await service.saveHomeLayout('member',{groupId:'g',id:'h',revision:1,layout});
 data.set('groups/g/catalog/food',{items:Array.from({length:99},(_,i)=>({id:String(i),name:String(i)}))});
 await service.saveCatalogItem('host',{groupId:'g',kind:'drink',id:'hundred',item:{id:'hundred',name:'100'}});
 await assert.rejects(service.saveCatalogItem('host',{groupId:'g',kind:'drink',id:'over',item:{id:'over',name:'101'}}),/catalog-limit/);
 console.log('PASS cohabitant layout/photo/placement, revoked/outsider denial, owner fields protected, legacy residency, total catalog 100/101');
})().catch(e=>{console.error(e);process.exitCode=1});
