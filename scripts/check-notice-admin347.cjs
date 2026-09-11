const assert=require('node:assert/strict');
const data=new Map(),ref=(collection,id)=>({path:collection+'/'+id});
const db={collection:name=>({doc:id=>ref(name,id)}),runTransaction:async fn=>{const writes=[];const result=await fn({get:async r=>({exists:data.has(r.path),data:()=>data.get(r.path)}),set:(r,v)=>writes.push(()=>data.set(r.path,v)),create:(r,v)=>writes.push(()=>{assert(!data.has(r.path));data.set(r.path,v)}),update:(r,v)=>writes.push(()=>data.set(r.path,{...data.get(r.path),...v}))});writes.forEach(w=>w());return result}};
const service=require('../functions/notice-admin').createService({db,clock:()=>10000}),admin={uid:'admin',email:'kkyaareuk@gmail.com',email_verified:true},input={id:'release-test',subject:'Test',body:'Draft'};
(async()=>{
 await assert.rejects(service.save({...admin,email:'other@example.com'},input),e=>e.status===403);
 await assert.rejects(service.save({...admin,email_verified:false},input),e=>e.status===403);
 const draft=await service.save(admin,input);assert.equal(data.size,1);assert(!data.has('villageAnnouncements/release-test'));
 await assert.rejects(service.publish(admin,{...draft,confirm:true,body:'changed'}),e=>e.status===409);
 await assert.rejects(service.publish(admin,{...draft,confirm:false}));
 await service.publish(admin,{...draft,confirm:true});assert.equal(data.size,2);
 const repeated=await service.publish(admin,{...draft,confirm:true});assert(repeated.alreadyPublished);assert.equal(data.size,2);
 await assert.rejects(service.save(admin,input),e=>e.status===409);
 assert([...data.keys()].every(key=>/^(noticeDrafts|villageAnnouncements)\//.test(key)));
 console.log('PASS verified admin only, draft isolation, exact preview, idempotent send, no push or email writes');
})().catch(e=>{console.error(e);process.exitCode=1});
