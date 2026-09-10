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
 const {OFFICIAL_RELATIONSHIP_DETAILS}=await import('../official-relationship-details.js');
 let now=0;const service=require('../functions/shared-relations').createService({db,clock:()=>now});let n=0;
 for(const type of Object.keys(OFFICIAL_RELATIONSHIP_DETAILS)){now+=3600001;const details={firstMeeting:'document',origin:'1',routine:'2'},result=await service.propose('host',{groupId:'g',requestId:'r'+n++,applyAsManager:true,patch:{a:'a',b:'b',type,details}});assert.equal(result.status,'accepted');assert.deepEqual(data.get('groups/g/relationships/accepted-'+result.id).details,details)}
 for(const details of [{origin:'invalid'},{unknown:'0'},[],null])await assert.rejects(service.propose('host',{groupId:'g',requestId:'bad'+n++,applyAsManager:true,patch:{a:'a',b:'b',type:'친구',details}}),e=>e.message==='invalid-relationship-details');
 const fake=snapshot=>snapshot.residents.map(r=>({id:r.id,lifeJson:'{}'}));fake.socialKinds=['kiss'];const town=createSharedTownService({db,clock:()=>now,engine:async()=>fake});
 for(const age of ['청년','성인','중년','장년','노년','노인']){now+=10000;data.set('groups/g/residents/a',{...data.get('groups/g/residents/a'),profileJson:JSON.stringify({ageGroup:age})});data.set('groups/g/residents/b',{...data.get('groups/g/residents/b'),profileJson:JSON.stringify({ageGroup:'성인'})});await town.advance('member',{groupId:'g',command:{characterId:'a',kind:'kiss',targetId:'b'}})}
 data.set('groups/g/residents/a',{...data.get('groups/g/residents/a'),profileJson:JSON.stringify({ageGroup:'청소년'})});await assert.rejects(town.advance('member',{groupId:'g',command:{characterId:'a',kind:'kiss',targetId:'b'}}),e=>e.message==='adult-characters-required');
 console.log('PASS shared relationship save: 23 types, exact details preservation, malformed data rejection, six adult age groups, minor block');
})().catch(e=>{console.error(e);process.exitCode=1});
