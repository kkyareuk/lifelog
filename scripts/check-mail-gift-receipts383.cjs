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
 set:(r,v)=>{writing=true;writes.push(()=>data.set(r.path,v))},update:(r,v)=>{writing=true;writes.push(()=>{const row=structuredClone(data.get(r.path)||{});for(const [k,val] of Object.entries(v)){if(k==='state.catalog'){row.state??={};row.state.catalog=val}else row[k]=val}data.set(r.path,row)})},create:(r,v)=>{writing=true;assert(!data.has(r.path));writes.push(()=>data.set(r.path,v))}});
 writes.forEach(fn=>fn());return result;
}};

let now=Date.UTC(2026,8,14,3),groupId='g';
const send=require('../functions/shared-mail')({db,membership:async()=>({root:ref('groups/'+groupId),group:{},member:{displayName:'Sender'}}),notify(){},clock:()=>now,id:x=>x});
const respond=require('../functions/mail-gift-receipts').create({db,clock:()=>now,id:x=>x});
(async()=>{
 data.set('groups/g/residents/target',{ownerUid:'recipient',name:'Target',profileJson:'{}'});data.set('groups/g/members/recipient',{displayName:'Recipient'});
 data.set('users/recipient/sync/core',{state:{catalog:{}}});
 const input={giftWorkflow:2,groupId:'g',requestId:'external1',targetId:'target',subject:'Gift',gift:{kind:'idol',item:{id:'original',name:'Band album',creator:'Band',tags:['live']}}};
 await send('sender',input);await send('sender',input);
 assert.equal(data.get('groups/g/mail/external1').gift.status,'pending');
 assert.equal(data.get('groups/g/residents/target').profileJson,'{}','No item before acceptance');assert(!data.has('groups/g/catalog/idol'));
 await assert.rejects(send('sender',{...input,requestId:'external2'}),/gift-daily-limit/);
 groupId='another';data.set('groups/another/residents/target',{ownerUid:'recipient',profileJson:'{}'});data.set('groups/another/members/recipient',{});
 await assert.rejects(send('sender',{...input,groupId,requestId:'another'}),/gift-daily-limit/);groupId='g';
 await assert.rejects(respond('outsider',{groupId:'g',mailId:'external1',accept:true}),/mail-access-required/);
 const full={__drawerVillageArrayV1:Array.from({length:80},(_,i)=>({id:'item'+i}))};data.set('users/recipient/sync/core',{state:{catalog:{food:full}}});
 await assert.rejects(respond('recipient',{groupId:'g',mailId:'external1',accept:true}),/gift-catalog-full/);
 assert.equal(data.get('groups/g/mail/external1').gift.status,'pending');
 data.set('users/recipient/sync/core',{state:{catalog:{}}});
 const accepted=await respond('recipient',{groupId:'g',mailId:'external1',accept:true});
 const again=await respond('recipient',{groupId:'g',mailId:'external1',accept:true});assert.equal(accepted.gift.item.id,again.gift.item.id);
 const received=data.get('users/recipient/sync/core').state.catalog.idol.__drawerVillageArrayV1;
 assert.equal(received.length,1);assert.equal(received[0].giftFrom,'Sender');assert.equal(received[0].creator,'Band');assert.deepEqual(received[0].tags.__drawerVillageArrayV1,['live']);
 now=Date.UTC(2026,8,14,15);await send('sender',{...input,requestId:'next-day'});
 await respond('recipient',{groupId:'g',mailId:'next-day',accept:false});assert.equal(data.get('users/recipient/sync/core').state.catalog.idol.__drawerVillageArrayV1.length,1);
 await assert.rejects(send('sender',{...input,requestId:'decline-no-refund'}),/gift-daily-limit/);
 await send('sender',{...input,giftWorkflow:undefined,requestId:'legacy-compatible'});assert.deepEqual(JSON.parse(data.get('groups/g/residents/target').profileJson).inventory.idol,['original'],'Existing released clients keep their delivery behavior');
 now+=86400000;await send('sender',{...input,requestId:'direct-user',audience:'member',targetUid:'recipient'});assert.equal(data.get('groups/g/mail/direct-user-recipient').gift.status,'pending');
 console.log('PASS account-wide daily gift quota across groups, KST midnight reset, pending no delivery, recipient-only acceptance, full dictionary rollback, one slot, metadata/name preservation, idempotency, decline without quota refund');
})().catch(e=>{console.error(e);process.exitCode=1});
