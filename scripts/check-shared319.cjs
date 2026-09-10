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
 let now=36000000;const service=require('../functions/shared-relations').createService({db,clock:()=>now});
 data.set('groups/g/homes/ha',{ownerUid:'member',name:'A home',townId:'t',layoutJson:JSON.stringify({rooms:{bedroom:{}}})});data.set('groups/g/homes/hb',{ownerUid:'op',name:'B home',townId:'t',layoutJson:JSON.stringify({rooms:{bedroom:{}}})});
 data.get('groups/g/residents/a').sharedHomeId='ha';data.get('groups/g/residents/b').sharedHomeId='hb';
 const patch={a:'a',b:'b',type:'가족',details:{origin:'3'},referenceId:'a',roleLinks:[{from:'a',to:'b',role:'maternalAunt',blood:false}],cohabit:true,cohabitHomeId:'ha'};
 const proposed=await service.propose('member',{groupId:'g',requestId:'family',patch});assert.equal(proposed.status,'pending');assert(data.has('groups/g/homes/hb'));assert.equal(data.get('groups/g/residents/b').sharedHomeId,'hb');
 const response=await service.respond('op',{groupId:'g',proposalId:'family-op',accept:true});assert.equal(response.status,'accepted');assert.equal(data.get('groups/g/residents/b').sharedHomeId,'ha');assert(!data.has('groups/g/homes/hb'));assert.deepEqual(data.get('groups/g/relationships/accepted-family').roleLinks,patch.roleLinks);
 now+=3600001;await assert.rejects(service.propose('host',{groupId:'g',requestId:'bad',applyAsManager:true,patch:{...patch,roleLinks:[{from:'a',to:'outsider',role:'child',blood:true}]}}),/invalid-relationship-roles/);
 now+=3600001;await assert.rejects(service.propose('host',{groupId:'g',requestId:'bad-home',applyAsManager:true,patch:{...patch,cohabitHomeId:'missing'}}),/cohabit-home-required/);assert(!data.has('groups/g/relationshipRequests/bad-home'));
 await service.propose('host',{groupId:'g',requestId:'legacy-fields',applyAsManager:true,patch:{...patch,cohabit:false,details:{origin:'3',routine:'1',firstMeeting:'rain'}}});
 console.log('PASS legacy removed fields accepted; shared family roles; pending proposal leaves homes unchanged; acceptance moves residents atomically; empty home cleanup; invalid roles and home rejected');
})().catch(e=>{console.error(e);process.exitCode=1});
