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
 const create=require('../functions/create-resident')({db});const service=require('../functions/shared-relations').createService({db});
 data.set('users/member',{gameState:{order:[]}});data.set('users/member/groupMemberships/g',{groupId:'g'});data.get('groups/g/members/op').displayName='Op';
 const input={groupId:'g',townId:'t',id:'requested',profile:{name:'New'},home:{rooms:{bedroom:{}}}};
 const p=await create('member',input);assert.equal(p.status,'pending');assert(!data.has('groups/g/residents/member_requested'));
 const proposals=[...data].filter(([k,v])=>k.startsWith('groups/g/proposals/')&&v.kind==='create-resident');assert.equal(proposals.length,2);
 await assert.rejects(service.respond('member',{groupId:'g',proposalId:p.proposalId,accept:true}),/manager-required/);
 const op=proposals.find(([,v])=>v.recipientUid==='op');await Promise.all([service.respond('op',{groupId:'g',proposalId:op[0].split('/').at(-1),accept:true}),service.respond('host',{groupId:'g',proposalId:p.proposalId,accept:true})]);
 assert(data.has('groups/g/residents/member_requested'));for(const [path] of proposals){assert.equal(data.get(path).status,'accepted');assert.equal(data.get(path).responderUid,'op');assert.equal(data.get(path).responderDisplayName,'Op');}
 assert.equal([...data.keys()].filter(k=>k==='groups/g/residents/member_requested').length,1);
 const declined=await create('member',{...input,id:'declined'});await service.respond('host',{groupId:'g',proposalId:declined.proposalId,accept:false});assert(!data.has('groups/g/residents/member_declined'));
 console.log('PASS member approval required, non-manager rejected, two managers resolve once, all copies name accepter, decline does not create');
})().catch(e=>{console.error(e);process.exitCode=1});
