const assert=require('node:assert/strict');
const create=require('../functions/shared-mail');
const ref=path=>({path,id:path.split('/').at(-1),collection:k=>({path:path+'/'+k,doc:id=>ref(path+'/'+k+'/'+id)})});
async function run(scope,{staff=false,blocked=false,audience='announcement',targetUid='host'}={}){
 const writes=[];const members=[['host',{role:'member'}],['admin',{role:'manager'}],['sender',{role:staff?'manager':'member'}],['other',{role:'member'}]];
 const root=ref('groups/g');const tx={get:async r=>r.path==='groups/g/members'?{docs:members.map(([id,data])=>({id,data:()=>data}))}:{exists:false,data:()=>r.path==='users/host/safety/settings'&&blocked?{blocked:[{uid:'sender'}]}:{}},set:(r,v)=>writes.push([r.path,v]),create:(r,v)=>writes.push([r.path,v])};
 const send=create({db:{collection:k=>({doc:id=>ref(k+'/'+id)}),runTransaction:fn=>fn(tx)},membership:async()=>({root,group:{ownerUid:'host'},member:{role:staff?'manager':'member',displayName:'Sender'}}),notify:()=>{},clock:()=>1000,id:x=>x});
 await send('sender',{groupId:'g',requestId:'r',audience,recipientScope:scope,targetUid,subject:'hello',body:'message'});return writes.filter(([p])=>p.startsWith('groups/g/mail/')).map(([,v])=>v.recipientUid);
}
(async()=>{
 assert.deepEqual(await run('role:owner'),['host']);assert.deepEqual(await run('role:manager'),['admin']);
 assert.deepEqual(await run('all',{audience:'member'}),['host']);
 for(const scope of ['all','role:member','subgroup:fake'])await assert.rejects(run(scope),e=>e.code==='manager-required');
 assert.deepEqual(await run('all',{staff:true}),['host','admin','other']);
 await assert.rejects(run('role:owner',{blocked:true}),e=>e.code==='contact-unavailable');
 console.log('PASS ordinary member to owner/admin, direct mail, broadcast remains staff-only, account block enforced');
})().catch(e=>{console.error(e);process.exitCode=1});
