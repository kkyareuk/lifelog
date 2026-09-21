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
 const create=require('../functions/create-resident')({db});data.set('users/member',{gameState:{order:[]}});data.set('users/member/groupMemberships/g',{groupId:'g'});data.get('groups/g').rules={memberCharacterLimit:4,operatorCharacterLimit:1,managerCharacterLimit:6};
 const input=id=>({groupId:'g',townId:'t',id,profile:{name:id},home:{rooms:{bedroom:{}}}});
 const results=await Promise.allSettled(['one','two','three','four'].map(id=>create('member',input(id))));assert.equal(results.filter(r=>r.status==='fulfilled').length,3);assert.equal(results.filter(r=>r.status==='rejected').length,1);
 const pending=require('../functions/resident-capacity').pending([...data.keys()].filter(k=>k.startsWith('groups/g/proposals/')).map(snap));assert.equal(pending,3,'manager copies count once');
 await assert.rejects(create('member',input('five')),/resident-limit/);
 const residence=require('../functions/shared-relations').createService({db});await assert.rejects(residence.requestResidence('member',{groupId:'g',requestId:'move',kind:'admission'}),/resident-limit/);
 data.set('users/op',{gameState:{order:[]}});data.set('users/op/groupMemberships/g',{groupId:'g'});await assert.rejects(create('op',input('op-new')),/resident-limit/);
 console.log('PASS four-person quota: existing + pending, concurrent create attempts, duplicate approval copies, admission and operator limits');
})().catch(e=>{console.error(e);process.exitCode=1});
