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
 const create=require('../functions/create-resident')({db});
 data.set('users/host',{gameState:{order:['personal']}});data.set('users/host/groupMemberships/g',{groupId:'g'});
 const input={groupId:'g',townId:'t',id:'new',profile:{name:'New',homeId:'new'},home:{rooms:{bedroom:{type:'bedroom'}}}};
 const [a,b]=await Promise.all([create('host',input),create('host',input)]);assert.equal(a.id,b.id);
 assert.equal([...data.keys()].filter(k=>k==='groups/g/residents/host_new').length,1);
 assert(data.get('groups/g/residents/host_new').independentCharacter);assert.equal(JSON.parse(data.get('groups/g/residents/host_new').profileJson).homeId,'host_new');
 await assert.rejects(create('stranger',{...input,id:'other'}),/group-membership-required/);
 await assert.rejects(create('host',{...input,id:'other',townId:'missing'}),/town-missing/);
 data.set('users/host',{gameState:{order:['a','b','c','d','e']}});
 await assert.rejects(create('host',{...input,id:'over'}),/character-slot-required/);
 assert(!data.has('groups/g/residents/host_over'));assert(!data.has('groups/g/homes/host_over'));
 console.log('PASS multiplayer creation: membership, town, slots, atomic duplicate prevention');
})().catch(e=>{console.error(e);process.exitCode=1});
