const assert=require('node:assert/strict');
const data=new Map([
 ['groups/g',{ownerUid:'u',towns:[{id:'t',name:'Town',places:[{id:'p',name:'Park',type:'공원',x:30,y:40}]}],buildingRevision:0}],
 ['groups/g/members/u',{role:'owner',displayName:'Host'}],['groups/g/members/v',{role:'manager',displayName:'Manager'}],['groups/g/members/w',{role:'member',displayName:'Member'}],
 ['users/u',{entitlements:{}}],['users/u/sync/core',{state:{order:{__drawerVillageArrayV1:['a','b','c','d']},towns:{__drawerVillageArrayV1:[{id:'personal'}]}}}],['users/u/groupMemberships/g',{}]
]);
const ref=(path,isCollection=false)=>({path,id:path.split('/').at(-1),isCollection,collection:n=>ref(path+'/'+n,true),doc:n=>ref(path+'/'+n),where:(k,op,v)=>({...ref(path,true),filter:[k,v]}),get:async()=>get(ref(path,isCollection))});
const snap=path=>({id:path.split('/').at(-1),ref:ref(path),exists:data.has(path),data:()=>structuredClone(data.get(path))});
const get=r=>r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(d=>!r.filter||d.data()[r.filter[0]]===r.filter[1])}:snap(r.path);
let writes=0,queue=Promise.resolve();const db={collection:n=>ref(n,true),runTransaction:run=>{const task=queue.then(async()=>{const changes=[];let writing=false;const result=await run({get:async r=>{assert.equal(writing,false,'All Firestore reads precede writes');return get(r)},update:(r,v)=>{writing=true;changes.push([r,v,true])},set:(r,v)=>{writing=true;changes.push([r,v,false])},create:(r,v)=>{assert.ok(!data.has(r.path));writing=true;changes.push([r,v,false])}});for(const [r,v,merge] of changes){data.set(r.path,{...(merge?data.get(r.path):{}),...structuredClone(v)});writes++}return result});queue=task.catch(()=>{});return task}};
const service=require('../functions/shared-town').createSharedTownService({db,engine:async()=>()=>[],clock:()=>100000});
(async()=>{
 const batch={groupId:'g',townId:'t',revision:0,operations:[{action:'saveBuilding',input:{id:'p',x:55,patch:{imageScale:1.7}}},{action:'saveDecoration',input:{id:'d',patch:{name:'Bench',kind:'bench',x:70}}}]};
 await assert.rejects(service.saveTownEdit('w',batch),/manager-required/);assert.equal(writes,0);
 await assert.rejects(service.saveTownEdit('u',{...batch,operations:[...batch.operations,{action:'saveBuilding',input:{id:'p',patch:{ownerUid:'bad'}}}]}),/invalid-building-field/);assert.equal(writes,0,'Invalid final operation cannot partially save an edit');
 await service.saveTownEdit('u',batch);assert.equal(writes,1,'Whole town edit writes the group document once');assert.equal(data.get('groups/g').buildingRevision,1);assert.equal(data.get('groups/g').towns[0].places[0].x,55);
 await assert.rejects(service.saveTownEdit('u',batch),/edit-conflict/);assert.equal(writes,1);
 await service.publishCatalog('u',{groupId:'g',catalog:{drink:Array.from({length:40},(_,i)=>({id:'d'+i,name:'Drink '+i})),food:Array.from({length:40},(_,i)=>({id:'f'+i,name:'Food '+i}))}});
 await assert.rejects(service.publishCatalog('u',{groupId:'g',catalog:{book:[{id:'b',name:'Book'}]}}),/catalog-limit/);assert.ok(!data.has('groups/g/catalog/book'));
 const targets=require('../functions/mail-targets')({db});await targets.saveMemberGroups('u',{groupId:'g',memberGroups:[{id:'team',name:'Team',memberIds:['w']}]});
 await assert.rejects(targets.saveMemberGroups('w',{groupId:'g',memberGroups:[]}),/manager-required/);
 const send=require('../functions/shared-mail')({db,clock:()=>100000,id:x=>x,notify(){},membership:async(tx,g,u)=>{const root=db.collection('groups').doc(g),[group,member]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(u))]);return {root,group:group.data(),member:member.data()}}});
 await send('u',{groupId:'g',requestId:'role',audience:'announcement',recipientScope:'role:manager',subject:'Managers'});assert.ok(data.has('groups/g/mail/role-v'));assert.ok(!data.has('groups/g/mail/role-w'));
 await send('u',{groupId:'g',requestId:'team',audience:'announcement',recipientScope:'subgroup:team',subject:'Team'});assert.ok(data.has('groups/g/mail/team-w'));assert.ok(!data.has('groups/g/mail/team-v'));
 const create=require('../functions/create-resident')({db,clock:()=>100000}),input={groupId:'g',townId:'t',id:'new',profile:{name:'New',icon:'https://example.com/icon.png',ageGroup:'성인'},home:{rooms:{entry:{type:'entry'}}}};
 await create('u',input);assert.equal(data.get('groups/g/residents/u_new').independentCharacter,true);assert.equal(data.get('groups/g/residents/u_new').icon,input.profile.icon);
 await create('u',input);await assert.rejects(create('u',{...input,id:'sixth'}),/character-slot-required/);assert.ok(!data.has('groups/g/homes/u_sixth'));
 await assert.rejects(service.saveTown('u',{groupId:'g',townId:'new-town',create:true,revision:1,patch:{name:'New town'}}),/town-slot-required/);
 data.delete('groups/g/residents/u_new');await create('u',{...input,id:'replacement'});
 data.delete('groups/g/residents/u_replacement');const concurrent=await Promise.allSettled([create('u',{...input,id:'race1'}),create('u',{...input,id:'race2'})]);assert.equal(concurrent.filter(r=>r.status==='fulfilled').length,1,'Two simultaneous creations cannot spend the last slot twice');
 const usage=await require('../functions/account-slots').read(db)('u');assert.equal(usage.characters,1);assert.equal(usage.personalCharacters,4);assert.equal(usage.towns,1);
 console.log('PASS atomic town edits, rollback, conflict, one write; 80 total across categories; role/subgroup recipients; independent character photo + slots, retry, release, town capacity');
})().catch(error=>{console.error(error);process.exitCode=1});
