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
 const task=queue.then(async()=>{const writes=[];const result=await run({get:async r=>r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(s=>!r.filter||s.data()[r.filter[0]]===r.filter[1])}:snap(r.path),update:(r,value)=>writes.push([r.path,value]),set:(r,value)=>writes.push([r.path,value]),delete:r=>writes.push([r.path,null]),create:(r,value)=>{assert.ok(!data.has(r.path));writes.push([r.path,value])}});
 for(const [path,value] of writes){if(value===null)data.delete(path);else data.set(path,{...data.get(path),...structuredClone(value)});}return result;});queue=task.catch(()=>{});return task;
}};
(async()=>{
const service=createSharedTownService({db,clock:()=>100});
data.set('groups/g/homes/own',{ownerUid:'member',townId:'t',layoutRevision:0,layoutJson:JSON.stringify({rooms:{living:{name:'Living',furniturePlacements:[]},bed:{name:'Bed',furniturePlacements:[]}}})});
data.set('groups/g/homes/other',{ownerUid:'op',townId:'t',layoutRevision:0,layoutJson:'{}'});
await service.saveHomePlacement('member',{groupId:'g',id:'own',revision:0,patch:{mapX:40,ownerKind:'캐릭터',ownerCharacterId:'a'}});
assert.equal(data.get('groups/g/homes/own').ownerCharacterId,'a');
assert.equal(data.get('groups/g/homes/own').ownerUid,'member');
await assert.rejects(()=>service.saveHomePlacement('member',{groupId:'g',id:'other',revision:1,patch:{name:'X'}}),/home-owner-required/);
await assert.rejects(()=>service.saveHomePlacement('member',{groupId:'g',id:'own',revision:1,patch:{ownerUid:'op'}}),/invalid-home-field/);
await assert.rejects(()=>service.saveHomePlacement('member',{groupId:'g',id:'own',revision:1,patch:{ownerCharacterId:'missing'}}),/resident-missing/);
await service.saveHomeLayout('member',{groupId:'g',id:'own',revision:0,layout:{rooms:{living:{name:'Living',wallMaterial:'cream-plain',furniturePlacements:[]}},deletedRoomKeys:['bed']}});
assert.deepEqual(JSON.parse(data.get('groups/g/homes/own').layoutJson).deletedRoomKeys,['bed']);
await assert.rejects(()=>service.saveHomeLayout('member',{groupId:'g',id:'other',revision:0,layout:{rooms:{}}}),/home-owner-required/);
await assert.rejects(()=>service.saveHomePlacement('member',{groupId:'g',id:'own',revision:0,patch:{name:'stale'}}),/edit-conflict/);
const before=structuredClone(data.get('groups/g/homes/own'));
await assert.rejects(()=>service.saveTownEdit('member',{groupId:'g',townId:'t',revision:1,operations:[{action:'saveHomePlacement',input:{id:'own',patch:{name:'rollback'}}},{action:'saveHomePlacement',input:{id:'other',patch:{name:'forbidden'}}}]}),/home-owner-required/);
assert.deepEqual(data.get('groups/g/homes/own'),before);
await service.saveTownEdit('member',{groupId:'g',townId:'t',revision:1,operations:[{action:'saveHomePlacement',input:{id:'own',patch:{name:'My house'}}}]});
assert.equal(data.get('groups/g/homes/own').name,'My house');
data.get('groups/g/members/host').role='member';
await service.saveHomePlacement('host',{groupId:'g',id:'other',revision:2,patch:{name:'Host repaired'}});
console.log('PASS own-house placement/story owner/layout/deleted rooms, foreign-house denial, ownerUid tampering denial, revision conflict, atomic batch rollback, canonical host role');
})().catch(e=>{console.error(e);process.exitCode=1});
