const assert=require('node:assert/strict');
const {createSafety,allowContact}=require('../functions/user-safety');
const data=new Map();
const snap=ref=>({id:ref.id,ref,exists:data.has(ref.path),data:()=>data.get(ref.path)});
const ref=path=>({path,id:path.split('/').at(-1),collection:k=>col(path+'/'+k),get:async()=>snap(ref(path))});
const col=path=>({path,doc:k=>ref(path+'/'+k),get:async()=>({docs:[...data.keys()].filter(k=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')).map(k=>snap(ref(k)))})});
const db={collection:col,runTransaction:async fn=>{const writes=[];const tx={get:async r=>{assert.equal(writes.length,0,'Reads after writes');return r.get()},set:(r,v,o)=>writes.push(()=>data.set(r.path,o?.merge?{...data.get(r.path),...v}:v)),create:(r,v)=>writes.push(()=>{assert(!data.has(r.path));data.set(r.path,v)})};const result=await fn(tx);writes.forEach(f=>f());return result}};
const service=createSafety({db,clock:()=>100000000});
const check=(a,b)=>db.runTransaction(tx=>allowContact(db,tx,a,b));
(async()=>{
 for(const g of ['one','two']){data.set('groups/'+g,{ownerUid:'a'});for(const u of ['a','b'])data.set('groups/'+g+'/members/'+u,{displayName:u,role:'member'});data.set('groups/'+g+'/residents/new-b',{ownerUid:'b',name:'new character'})}
 await service.setUserBlock('a',{groupId:'one',kind:'member',targetId:'b',block:true});await assert.rejects(check('b','a'),/contact-unavailable/);await assert.rejects(check('a','b'),/contact-unavailable/);await check('a','a');
 const send=require('../functions/shared-mail')({db,membership:async(tx,g,u)=>({root:db.collection('groups').doc(g),group:{ownerUid:'a'},member:{role:'member'}}),notify:()=>{},clock:()=>100000000,id:x=>x});await assert.rejects(send('b',{groupId:'two',audience:'member',targetUid:'a',requestId:'blocked-mail',subject:'hello'}),/contact-unavailable/);
 assert.equal((await service.readSafety('a')).blocked.length,1);assert.equal((await service.readSafety('b')).blocked.length,0);
 await assert.rejects(service.setUserBlock('c',{groupId:'two',kind:'member',targetId:'b',block:true}),/membership/);
 await assert.rejects(service.reportContent('c',{groupId:'one',kind:'resident',targetId:'new-b',reason:'other',requestId:'x'}),/membership/);
 const report={groupId:'two',kind:'resident',targetId:'new-b',reason:'harassment',requestId:'report',details:'bad'};
 const result=await service.reportContent('a',report);await service.reportContent('a',report);assert.equal(data.get('moderationReports/'+result.id).targetUid,'b');assert.equal([...data.keys()].filter(k=>k.startsWith('moderationReports/')).length,1);
 await service.setUserBlock('a',{block:false,targetUid:'b'});await check('a','b');
 console.log('PASS account-wide two-way block, cross-group identity, unblock, membership validation, report ownership and idempotency, transaction ordering');
})().catch(e=>{console.error(e);process.exitCode=1});
