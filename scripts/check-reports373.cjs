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
 const task=queue.then(async()=>{const writes=[];const result=await run({get:async r=>r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(s=>!r.filter||s.data()[r.filter[0]]===r.filter[1])}:snap(r.path),delete:r=>writes.push([r.path,null]),update:(r,value)=>writes.push([r.path,value]),set:(r,value)=>writes.push([r.path,value]),create:(r,value)=>{assert.ok(!data.has(r.path));writes.push([r.path,value])}});
 for(const [path,value] of writes){if(value===null)data.delete(path);else data.set(path,{...data.get(path),...structuredClone(value)})}return result;});queue=task.catch(()=>{});return task;
}};
let calls=0;
const service=createSharedTownService({db,clock:()=>1000000,engine:async()=>snapshot=>{calls++;return snapshot.residents.map(r=>({id:r.id,lifeJson:'{}'}))}});
(async()=>{
 const relations=require('../functions/shared-relations').createService({db,clock:()=>1000000});
 const patch={memberIds:['a','b'],sourceId:'a',title:'Together',type:'친구 약속',start:'09:00',end:'15:00',days:[1,2],monthly:false,townId:'t'};
 const proposal=await relations.propose('op',{groupId:'g',requestId:'schedule-proposal',kind:'schedule',patch});assert.equal(proposal.status,'pending');
 await relations.respond('member',{groupId:'g',proposalId:'schedule-proposal-member',accept:true});assert.equal(data.get('groups/g/schedules/accepted-schedule-proposal').start,'09:00');
 const direct=await relations.propose('op',{groupId:'g',requestId:'schedule-direct',kind:'schedule',patch,applyAsManager:true});assert.equal(direct.status,'accepted');
 data.set('groups/g/schedules/legacy',{...patch,memberIds:['a','departed'],sourceId:'a'});
 const legacyEdit=await relations.propose('member',{groupId:'g',requestId:'legacy-edit',kind:'schedule',targetId:'legacy',patch:{...patch,memberIds:['a'],title:'Edited'}});assert.equal(legacyEdit.status,'accepted');
 data.set('groups/g/schedules/legacy-cancel',{...patch,memberIds:['a','departed'],sourceId:'departed'});
 const cancelInput={groupId:'g',requestId:'legacy-cancel',kind:'schedule',targetId:'legacy-cancel',patch:{...patch,memberIds:['a','departed'],sourceId:'departed',cancelled:true}};
 assert.equal((await relations.propose('member',cancelInput)).status,'accepted');assert.equal((await relations.propose('member',cancelInput)).status,'accepted');
 assert.deepEqual(data.get('groups/g/schedules/legacy-cancel').memberIds,['a']);
 await assert.rejects(()=>relations.propose('member',{...cancelInput,requestId:'forged',patch:{...patch,memberIds:['a','invented']}}),/resident-missing/);
 console.log('PASS departed participant legacy edit/cancel, retry and invalid new participant guard');
 const gift={groupId:'g',requestId:'coat-gift',sourceId:'a',targetId:'b',subject:'Coat',body:'For you',gift:{kind:'fashion',item:{id:'coat',name:'Coat'}}};
 await relations.sendMail('member',gift);await relations.sendMail('member',gift);
 const profile=JSON.parse(data.get('groups/g/residents/b').profileJson);assert.deepEqual(profile.inventory.fashion,['coat']);assert.equal(profile.wardrobeItems.length,1);assert.equal(profile.wardrobeItems[0].id,'coat');
 console.log('PASS manager schedule proposal/approval/direct apply; fashion gift inventory + definition + idempotency');
})().catch(e=>{console.error(e);process.exitCode=1});
