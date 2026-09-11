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
data.clear();for(const uid of ['a','b']){data.set('users/'+uid,{entitlements:{characterSingleSlots:10}});data.set('users/'+uid+'/sync/core',{state:{order:[],towns:[{id:'personal'}]}});data.set('users/'+uid+'/groupMemberships/g',{});data.set('groups/g/members/'+uid,{role:uid==='a'?'owner':'member'});}
data.set('groups/g',{ownerUid:'a',towns:[{id:'base'}]});for(let i=0;i<12;i++)data.set('groups/g/residents/c'+i,{ownerUid:i<10?'a':'b',independentCharacter:true});
const read=require('../functions/account-slots').read(db);assert.equal((await read('a')).characters,10);assert.equal((await read('b')).characters,2);assert.equal((await read('a')).towns,1);assert.equal((await read('b')).towns,1);
data.get('groups/g').towns.push({id:'extra',slotOwnerUid:'a'});assert.equal((await read('a')).towns,2);assert.equal((await read('b')).towns,1);
data.set('groups/g2',{ownerUid:'a',towns:[{id:'base2'}]});data.set('groupInvites/ABCDEF',{groupId:'g2',active:true});const join=require('../functions/join-group')({db});await assert.rejects(()=>join('b',{inviteCode:'ABCDEF'}),/town-slot-required/);assert(!data.has('groups/g2/members/b'));
data.get('users/b').entitlements.townSlotPacks=1;await join('b',{inviteCode:'ABCDEF',displayName:'B'});assert.equal((await read('b')).towns,2);await join('b',{inviteCode:'ABCDEF'});assert.equal((await read('b')).towns,2);data.get('groups/g2/members/b').role='manager';await join('b',{inviteCode:'ABCDEF'});assert.equal(data.get('groups/g2/members/b').role,'manager');
await join('a',{inviteCode:'ABCDEF'});assert.equal(data.get('groups/g2/members/a').role,'owner');data.get('groups/g2/members/a').role='member';await join('a',{inviteCode:'ABCDEF'});assert.equal(data.get('groups/g2/members/a').role,'owner');
console.log('PASS A10/B2 own slots, one base town per member, extras only creator, full-slot join rejected atomically, repeat join no charge/role loss');
})().catch(e=>{console.error(e);process.exitCode=1});
