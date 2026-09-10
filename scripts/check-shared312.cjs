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
 const task=queue.then(async()=>{const writes=[];const result=await run({get:async r=>r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(s=>!r.filter||s.data()[r.filter[0]]===r.filter[1])}:snap(r.path),update:(r,value)=>writes.push([r.path,value]),set:(r,value)=>writes.push([r.path,value]),create:(r,value)=>{assert.ok(!data.has(r.path));writes.push([r.path,value])}});
 for(const [path,value] of writes)data.set(path,{...data.get(path),...structuredClone(value)});return result;});queue=task.catch(()=>{});return task;
}};

(async()=>{
 const {advanceSharedLife}=await import('../server-life.mjs');const {SOCIAL_ACTIVITIES}=await import('../social-activities.js?v=20260909dev305');let clock=1000000;
 const fake=snapshot=>snapshot.residents.map(r=>({id:r.id,lifeJson:'{}'}));fake.socialKinds=advanceSharedLife.socialKinds;
 const service=createSharedTownService({db,clock:()=>clock,engine:async()=>fake});
 for(const kind of Object.keys(SOCIAL_ACTIVITIES).filter(k=>SOCIAL_ACTIVITIES[k].contextual)){
  clock+=10000;await assert.rejects(service.advance('member',{groupId:'g',command:{characterId:'a',kind,targetId:'missing'}}),e=>e.message==='invalid-companion');
  await service.advance('member',{groupId:'g',command:{characterId:'a',kind,targetId:'b'}});
 }
 await assert.rejects(service.advance('member',{groupId:'g',command:{characterId:'a',kind:'forged-kind',targetId:'b'}}),e=>e.message==='invalid-command');
 await assert.rejects(service.advance('member',{groupId:'g',command:{characterId:'b',kind:'offer_help',targetId:'a'}}),e=>e.status===403);
 const game=await import('../state.js?v=20260909dev305'),id=game.createCharacter(),profile=structuredClone(game.state.characters[id]);profile.hobbies=['전자기기 만지기'];profile.activityTempo='한 가지씩 차분히';profile.createdAt=1;
 const snapshot={group:{id:'test',towns:[{id:'town',name:'Shared',places:[]}]},residents:[0,1].map(i=>({id:'r'+i,name:'R'+i,ownerUid:'u'+i,townId:'town',sharedHomeId:'h',profileJson:JSON.stringify(profile),scheduleJson:'{}'})),homes:[{id:'h',townId:'town',ownerUid:'u0',layoutJson:JSON.stringify({rooms:{living:{type:'living'},study:{type:'study'}}})}]};
 const before=JSON.stringify(game.state),now=new Date('2026-09-10T13:00:00+09:00').getTime();
 for(const kind of Object.keys(SOCIAL_ACTIVITIES).filter(k=>SOCIAL_ACTIVITIES[k].contextual)){const result=advanceSharedLife(snapshot,now,{characterId:'r0',targetId:'r1',kind});assert.equal(JSON.parse(result.find(r=>r.id==='r0').lifeJson).directive.kind,kind)}
 const ambient=advanceSharedLife(snapshot,now,{characterId:'r0',kind:'relax',lifeTask:'ambient:concrete:device_settings'});assert.match(JSON.parse(ambient[0].lifeJson).directive.copy.ko.desc,/밝기와 알림/);assert.equal(JSON.stringify(game.state),before);
 console.log('PASS new server command whitelist, companion validation, ownership, actual shared engine social/ambient commands and personal-state isolation');
})().catch(e=>{console.error(e);process.exitCode=1});
