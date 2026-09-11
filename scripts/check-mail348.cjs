const assert=require('node:assert/strict');
const data=new Map();const ref=path=>({path,id:path.split('/').at(-1),collection:n=>({doc:id=>ref(path+'/'+n+'/'+id)})});
const db={collection:n=>({doc:id=>ref(n+'/'+id)}),runTransaction:async fn=>{const writes=[];const result=await fn({get:async r=>({ref:r,id:r.id,exists:data.has(r.path),data:()=>data.get(r.path)}),update:(r,v)=>writes.push(()=>data.set(r.path,{...data.get(r.path),...v})),set:(r,v)=>writes.push(()=>data.set(r.path,v))});writes.forEach(f=>f());return result}};
(async()=>{
 const remove=require('../functions/delete-mail')({db});
 const item={groupId:'g',kind:'mail',id:'m'};data.set('groups/g/mail/m',{senderUid:'a',recipientUid:'b',body:'original'});data.set('groups/g/mail/notice',{senderUid:'a',recipientUid:'b',announcement:true});
 await assert.rejects(remove('outsider',{items:[item]}),e=>e.status===403);
 await assert.rejects(remove('b',{items:[item,{...item,id:'notice'}]}),e=>e.status===403);assert(!data.get('groups/g/mail/m').hiddenFor);
 await remove('b',{items:[item]});assert.deepEqual(data.get('groups/g/mail/m').hiddenFor,['b']);assert.equal(data.get('groups/g/mail/m').body,'original');
 await remove('b',{items:[item]});assert.deepEqual(data.get('groups/g/mail/m').hiddenFor,['b']);await remove('a',{items:[item]});assert.deepEqual(data.get('groups/g/mail/m').hiddenFor,['b','a']);
 await assert.rejects(remove('b',{items:[{...item,id:'../notice'}]}));
 data.set('groups/g/members/b',{displayName:'B'});data.set('groups/g/members/a',{displayName:'A'});
 const safety=require('../functions/user-safety').createSafety({db});
 await assert.rejects(safety.setUserBlock('b',{groupId:'g',kind:'mail',targetId:'notice',block:true}),e=>e.code==='announcement-not-blockable');
 await safety.setUserBlock('b',{groupId:'g',kind:'mail',targetId:'m',block:true});assert.equal(data.get('users/b/safety/settings').blocked[0].uid,'a');
 console.log('PASS atomic selection, own-mailbox deletion, idempotency, access isolation, notice deletion/block denial, normal mail blocking');
})().catch(e=>{console.error(e);process.exitCode=1});
