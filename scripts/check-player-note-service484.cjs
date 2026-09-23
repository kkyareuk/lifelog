const assert=require('node:assert/strict');
const data=new Map([['groups/g',{ownerUid:'u',towns:[]}],['groups/g/members/u',{role:'owner'}],['groups/g/members/v',{role:'member'}],['groups/g/residents/r',{ownerUid:'v',name:'R',sharedHomeId:'h',profileJson:'{}'}]]);
const ref=(path,isCollection=false)=>({path,id:path.split('/').at(-1),isCollection,collection:n=>ref(path+'/'+n,true),doc:n=>ref(path+'/'+n),orderBy(){return this},limit(n){return {...this,limitN:n}}});
const snap=path=>({id:path.split('/').at(-1),ref:ref(path),exists:data.has(path),data:()=>structuredClone(data.get(path))});
const db={collection:n=>ref(n,true),runTransaction:async fn=>{const writes=[];const result=await fn({get:async r=>{assert.equal(writes.length,0,'Firestore reads precede writes');return r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).sort((a,b)=>(b.data().createdAt||0)-(a.data().createdAt||0)).slice(0,r.limitN||Infinity)}:snap(r.path)},update:(r,v)=>writes.push([r.path,v]),set:(r,v)=>writes.push([r.path,v]),create:(r,v)=>{assert(!data.has(r.path));writes.push([r.path,v])}});for(const [p,v] of writes)data.set(p,{...data.get(p),...v});return result}};
let now=1000000;const deps={db,clock:()=>now,id:v=>v,notify(){},membership:async tx=>{const root=ref('groups/g');return {root,group:(await tx.get(root)).data(),member:(await tx.get(root.collection('members').doc('u'))).data()}}};
const send=require('../functions/shared-mail')(deps),service=require('../functions/shared-town').createSharedTownService({db,clock:()=>now,engine:async()=>s=>s.residents.map(r=>({id:r.id,lifeJson:JSON.stringify({noteReceipts:Object.fromEntries((r.playerNotes||[]).map(n=>[n.id,{readAt:now}]))})}))});
(async()=>{
 await send('u',{targetId:'r',requestId:'note',subject:'secret',body:'private'});assert.deepEqual(data.get('groups/g/residents/r').playerNotes,[{id:'note',createdAt:now,homeId:'h'}]);assert.equal(data.get('groups/g').lifeNextAt,0);
 await send('u',{targetId:'r',requestId:'note',subject:'secret'});assert.equal(data.get('groups/g/residents/r').playerNotes.length,1);
 await send('u',{targetId:'r',requestId:'gift-note',subject:'gift',giftWorkflow:2,gift:{kind:'food',item:{name:'cake'}}});assert.equal(data.get('groups/g/residents/r').playerNotes.length,2);
 data.set('groups/g/mail/old',{targetId:'r',sourceId:'',createdAt:now-1000});data.set('groups/g/mail/from-character',{targetId:'r',sourceId:'r2',createdAt:now-1000});
 await service.advance('u',{groupId:'g'});assert.equal(data.get('groups/g').playerNoteVersion,1);assert.equal(data.get('groups/g/residents/r').playerNotes.length,3);assert(!JSON.stringify(data.get('groups/g/residents/r').playerNotes).includes('secret'));
 now+=300001;await service.advance('u',{groupId:'g'});assert.equal(data.get('groups/g/residents/r').playerNotes.length,3);
 console.log('PASS484 services: character mail and pending gift delivery, retry idempotence, old notes migration once, private content excluded, reads before writes');
})().catch(e=>{console.error(e);process.exitCode=1});
