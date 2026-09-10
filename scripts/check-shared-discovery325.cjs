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
 const save=require('../functions/save-resident')({db,clock:()=>1234});
 const {discoveryAnswer,DISCOVERY_SCENES}=await import('../character-discovery-rules.js');
 const c={name:'A',socialStyle:'조용히 어울림',neatness:'보통',discovery:{version:2,locks:{}}};const patch=discoveryAnswer(c,DISCOVERY_SCENES[0],0);
 await save('member',{groupId:'g',id:'a',profile:{...c,...patch}});const stored=JSON.parse(data.get('groups/g/residents/a').profileJson);assert.equal(stored.discovery.scores.socialStyle,49);assert.equal(stored.discovery.scores.neatness,51);assert.equal(data.get('groups/g').lifeUpdatedAt,0);
 await assert.rejects(save('host',{groupId:'g',id:'a',profile:{name:'Changed'}}),e=>e.status===403);await assert.rejects(save('outsider',{groupId:'g',id:'a',profile:{name:'Changed'}}),e=>e.status===403);assert.equal(JSON.parse(data.get('groups/g/residents/a').profileJson).name,'A');console.log('PASS existing shared save service persists discovery and invalidates future simulation; foreign owner and nonmember rejected');
})().catch(e=>{console.error(e);process.exitCode=1});
