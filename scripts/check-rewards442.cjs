const assert=require('node:assert/strict');
const {createDiscoveryAccess}=require('../functions/discovery-access');
function mockDB(){let rows=new Map(),queue=Promise.resolve();const snap=(r,data)=>({id:r.id,ref:r,exists:data!==undefined,data:()=>structuredClone(data)});const ref=path=>({path,id:path.split('/').at(-1),collection:name=>ref(path+'/'+name),doc:name=>ref(path+'/'+name),get:async()=>snap(ref(path),rows.get(path)),where:(key,op,value)=>query(path,[[key,op,value]]),limit:n=>query(path,[],n)});const query=(path,conditions=[],limit=1000)=>({where:(...c)=>query(path,[...conditions,c],limit),limit:n=>query(path,conditions,n),get:async()=>{const docs=[...rows].filter(([p,v])=>p.startsWith(path+'/')&&p.split('/').length===path.split('/').length+1&&conditions.every(([k,op,w])=>op==='=='?v[k]===w:false)).slice(0,limit).map(([p,v])=>snap(ref(p),v));return {docs,size:docs.length,empty:!docs.length}}});return {collection:ref,put:(p,v)=>rows.set(p,structuredClone(v)),get:p=>rows.get(p),runTransaction:fn=>{const job=queue.then(async()=>{const pending=new Map(rows);let writing=false;const tx={get:async r=>{assert.equal(writing,false,'all reads before writes');return snap(r,pending.get(r.path))},set:(r,v,o)=>{writing=true;pending.set(r.path,o?.merge?{...pending.get(r.path),...structuredClone(v)}:structuredClone(v))},create:(r,v)=>{assert(!pending.has(r.path));tx.set(r,v)},update:(r,v)=>{assert(pending.has(r.path));tx.set(r,v,{merge:true})}};const result=await fn(tx);rows=pending;return result});queue=job.catch(()=>{});return job}}}
(async()=>{
const db=mockDB(),now=10000000;const rewards=require('../functions/discovery-test-rewards').createDiscoveryTestRewards({db,clock:()=>now});
const access=createDiscoveryAccess({db,clock:()=>now});
for(const uid of ['admin','regular','qa']){db.put('users/'+uid+'/discoveryAdTickets/ticket',{used:false,expiresAt:now+60000});db.put('users/'+uid+'/activityLimits/discovery',{lastAt:now,rewardCredits:0});}
await assert.rejects(()=>rewards.grant({uid:'regular',email:'kkyaareuk@gmail.com',email_verified:false},{ticketId:'ticket'}),e=>e.status===403);
await assert.rejects(()=>rewards.grant({uid:'regular',email:'other@example.com',email_verified:true},{ticketId:'ticket',adTestAccess:true}),e=>e.status===403);
db.put('users/regular',{adTestAccess:true});await assert.rejects(()=>rewards.grant({uid:'regular'},{ticketId:'ticket'}),e=>e.status===403);
await rewards.grant({uid:'admin',email:'kkyaareuk@gmail.com',email_verified:true},{ticketId:'ticket'});
assert.equal((await access.read('admin')).rewardCredits,1);assert((await access.use('admin',{requestId:'question'})).granted);assert(!(await access.use('admin',{requestId:'second'})).granted);
await assert.rejects(()=>rewards.grant({uid:'admin',email:'kkyaareuk@gmail.com',email_verified:true},{ticketId:'ticket'}));
db.put('users/qa',{entitlements:{adTestAccess:true}});await rewards.grant({uid:'qa'},{ticketId:'ticket'});assert.equal((await access.read('qa')).rewardCredits,1);
console.log('PASS442 QA reward: verified operator/server allowlist only, client flags rejected, one use, production cooldown retained');
})().catch(e=>{console.error(e);process.exitCode=1});
