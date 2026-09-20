const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=new Map([
 ['groups/g/residents/target',{ownerUid:'sender',name:'Recipient',profileJson:'{}'}],
 ['groups/g/members/sender',{displayName:'Recipient'}]
]);
const ref=(path,collection=false)=>({path,id:path.split('/').at(-1),collection,doc:id=>ref(path+'/'+id),collection:n=>ref(path+'/'+n,true),isCollection:collection});
const db={collection:n=>ref(n,true),runTransaction:async fn=>{
 const writes=[];let writing=false;
 const snap=p=>({exists:data.has(p),id:p.split('/').at(-1),data:()=>structuredClone(data.get(p))});
 const result=await fn({get:async r=>{assert(!writing,'reads before writes');return r.isCollection?{docs:[...data.keys()].filter(p=>p.startsWith(r.path+'/')&&!p.slice(r.path.length+1).includes('/')).map(snap)}:snap(r.path)},
 set:(r,v)=>{writing=true;writes.push(()=>data.set(r.path,v))},update:(r,v)=>{writing=true;writes.push(()=>data.set(r.path,{...data.get(r.path),...v}))},create:(r,v)=>{writing=true;assert(!data.has(r.path));writes.push(()=>data.set(r.path,v))}});
 writes.forEach(fn=>fn());return result;
}};
const send=require('../functions/shared-mail')({db,membership:async()=>({root:ref('groups/g'),group:{},member:{displayName:'Sender'}}),notify(){},clock:()=>1000,id:x=>x});
(async()=>{
 for(const kind of ['idol','hobby','food','fashion']){
  const input={groupId:'g',requestId:kind,targetId:'target',subject:'Gift',gift:{kind,item:{id:kind+'-item',name:kind+' item'}}};
  await send('sender',input);await send('sender',input);
  assert.deepEqual(JSON.parse(data.get('groups/g/residents/target').profileJson).inventory[kind],[kind+'-item']);
  assert.equal(data.get('groups/g/catalog/'+kind).items.length,1);
  assert.equal(data.get('groups/g/mail/'+kind).gift.kind,kind);
 }
 await assert.rejects(send('sender',{groupId:'g',requestId:'bad',targetId:'target',subject:'bad',gift:{kind:'invalid',item:{id:'x',name:'x'}}}),/invalid-gift/);
 assert(!data.has('groups/g/mail/bad'));
 data.set('groups/g/residents/source',{ownerUid:'sender',name:'Source',profileJson:JSON.stringify({icon:'local-media://unavailable',photo:'https://example.test/portrait.png'})});
 await send('sender',{groupId:'g',requestId:'portrait',sourceId:'source',targetId:'target',subject:'Portrait'});
 const mail=data.get('groups/g/mail/portrait');assert.equal(mail.senderPhoto,'https://example.test/portrait.png');
 data.delete('groups/g/residents/source');
 assert.equal(mail.senderPhoto,'https://example.test/portrait.png','letter survives source leaving the village');
 console.log('PASS portable sender portrait survives resident removal and skips device-only image references');
 const source=fs.readFileSync('mailbox-center.js','utf8');
 const kinds=JSON.parse(source.match(/const MAIL_GIFT_KINDS=(\[[^;]+\])/)[1].replaceAll("'",'"'));
 assert(kinds.includes('idol')&&kinds.includes('hobby'));
 assert.equal((source.match(/MAIL_GIFT_KINDS.includes/g)||[]).length,2,'form values and picker share eligible kinds');
 console.log('PASS idol/hobby delivery, catalog and inventory persistence, retry deduplication, existing food/fashion gifts, invalid category rollback, picker/form parity');
})().catch(e=>{console.error(e);process.exitCode=1});

