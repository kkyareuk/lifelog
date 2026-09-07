const assert=require('node:assert/strict');
const {createSharedTownService}=require('../functions/shared-town');
const data=new Map([
 ['groups/g',{towns:[{id:'t',places:[]}],buildingRevision:0}],
 ['groups/g/members/host',{role:'owner'}],['groups/g/members/op',{role:'operator'}],['groups/g/members/member',{role:'member'}],
 ['groups/g/residents/a',{ownerUid:'member',townId:'t'}],['groups/g/residents/b',{ownerUid:'op',townId:'t'}]
]);
const ref=(path,collection=false)=>({path,id:path.split('/').at(-1),collection:name=>ref(path+'/'+name,true),doc:name=>ref(path+'/'+name),isCollection:collection,where:(field,op,value)=>({...ref(path,true),filter:[field,value]})});
const snap=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>structuredClone(data.get(path))});
let queue=Promise.resolve();
const db={collection:name=>ref(name,true),runTransaction:run=>{
 const task=queue.then(async()=>{const writes=[];const result=await run({get:async r=>r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(s=>!r.filter||s.data()[r.filter[0]]===r.filter[1])}:snap(r.path),update:(r,value)=>writes.push([r.path,value]),set:(r,value)=>writes.push([r.path,value]),create:(r,value)=>{assert.ok(!data.has(r.path));writes.push([r.path,value])}});
 for(const [path,value] of writes)data.set(path,{...data.get(path),...structuredClone(value)});return result;});queue=task.catch(()=>{});return task;
}};
let calls=0;
const service=createSharedTownService({db,clock:()=>1000000,engine:async()=>snapshot=>{calls++;return snapshot.residents.map(r=>({id:r.id,lifeJson:'{}'}))}});
(async()=>{
 await assert.rejects(service.advance('stranger',{groupId:'g'}),e=>e.status===403);
 await Promise.all(Array.from({length:8},()=>service.advance('member',{groupId:'g'})));assert.equal(calls,1,'A minute is calculated once even with concurrent viewers');
 const building={groupId:'g',townId:'t',revision:0,id:'p',name:'Library',type:'도서관',x:30,y:50};
 await assert.rejects(service.saveBuilding('member',building),e=>e.status===403);
 await service.saveBuilding('op',building);assert.equal(data.get('groups/g').towns[0].places[0].name,'Library');
 await assert.rejects(service.saveBuilding('host',building),e=>e.status===409);
 await assert.rejects(service.advance('member',{groupId:'g',command:{characterId:'b',kind:'walk'}}),e=>e.status===403);
 await service.advance('member',{groupId:'g',command:{characterId:'a',kind:'talk',targetId:'b'}});
 await assert.rejects(service.advance('member',{groupId:'g',command:{characterId:'a',kind:'walk'}}),e=>e.status===429);
 const relations=require('../functions/shared-relations').createService({db,clock:()=>1000000});
 await relations.propose('member',{groupId:'g',sourceId:'a',targetId:'b',type:'보호자·피보호자',sourceRole:'보호자',targetRole:'피보호자',requestId:'request1'});
 await assert.rejects(relations.respond('host',{groupId:'g',proposalId:'request1',accept:true}),e=>e.status===403);
 await relations.respond('op',{groupId:'g',proposalId:'request1',accept:true});
 await relations.respond('op',{groupId:'g',proposalId:'request1',accept:true});
 assert.equal(data.get('groups/g/proposals/request1').status,'accepted');
 assert.equal(data.get('groups/g/relationships/accepted-request1').sourceRole,'보호자');
 assert.equal([...data.keys()].filter(k=>k.startsWith('notificationOutbox/')).length,2,'No duplicate notifications on retried acceptance');
 await assert.rejects(relations.respond('op',{groupId:'g',proposalId:'request1',accept:false}),e=>e.status===409);
 await relations.saveView('member',{groupId:'g',sourceId:'a',targetId:'b',overall:'신뢰한다'});
 await assert.rejects(relations.saveView('op',{groupId:'g',sourceId:'a',targetId:'b',overall:'변조'}),e=>e.status===403);
 await relations.propose('member',{groupId:'g',sourceId:'a',targetId:'b',type:'친구',requestId:'request2'});
 await relations.respond('op',{groupId:'g',proposalId:'request2',accept:false,reason:'아직 서로 알아가는 중이에요.'});
 assert.equal(data.get('groups/g/proposals/request2').reason,'아직 서로 알아가는 중이에요.');
 assert.ok(!data.has('groups/g/relationships/accepted-request2'));
 const catalog={flower:Array.from({length:80},(_,i)=>({id:'flower-'+i,name:'Flower '+i}))};
 await assert.rejects(service.publishCatalog('member',{groupId:'g',catalog}),e=>e.status===403);
 await service.publishCatalog('op',{groupId:'g',catalog});await service.publishCatalog('op',{groupId:'g',catalog});
 assert.equal(data.get('groups/g/catalog/flower').items.length,80);
 await assert.rejects(service.publishCatalog('op',{groupId:'g',catalog:{flower:[{id:'extra',name:'Extra'}]}}),e=>e.status===409);
 assert.equal(data.get('groups/g/catalog/flower').items.length,80);
 await relations.saveView('member',{groupId:'g',sourceId:'a',targetId:'b',field:'trust',value:'신뢰함'});
 assert.equal(JSON.parse(data.get('groups/g/perceptions/a~b').viewJson).overall,'신뢰한다');
 assert.equal(JSON.parse(data.get('groups/g/perceptions/a~b').viewJson).trust,'신뢰함');
 await service.saveTown('op',{groupId:'g',townId:'t',revision:1,patch:{name:'공유 마을',transportModes:['버스']}});
 await assert.rejects(service.saveTown('member',{groupId:'g',townId:'t',revision:2,patch:{name:'변조'}}),e=>e.status===403);
 const moved=await service.saveBuilding('op',{groupId:'g',townId:'t',id:'p',revision:2,x:62,y:73,patch:{iconPreset:'library',imageScale:1.2}});
 assert.equal(moved.town.places[0].x,62);assert.equal(moved.town.places[0].name,'Library');
 data.set('groups/g/homes/home',{name:'House',ownerUid:'member',layoutJson:'{"rooms":{}}'});
 await service.saveHomePlacement('op',{groupId:'g',id:'home',revision:3,patch:{mapX:40,mapY:55,mapScale:1.3}});
 assert.equal(data.get('groups/g/homes/home').mapX,40);assert.equal(data.get('groups/g/homes/home').layoutJson,'{"rooms":{}}');
 await assert.rejects(service.saveHomePlacement('member',{groupId:'g',id:'home',revision:4,patch:{mapX:80}}),e=>e.status===403);
 await service.saveDecoration('op',{groupId:'g',townId:'t',id:'d',revision:4,patch:{kind:'bench',name:'Bench',emoji:'🪑',x:32,y:43}});
 assert.equal(data.get('groups/g').towns[0].decorations[0].x,32);
 await assert.rejects(service.saveBuilding('op',{groupId:'g',townId:'t',id:'p',revision:5,patch:{ownerUid:'op'}}),/invalid-building-field/);
 console.log('PASS town/home/decoration shared edits, roles, revision conflicts and view field preservation');
 console.log('PASS declined reason and manual shared dictionary ownership, idempotency and 80-item limit');
 console.log('PASS proposals: recipient-only decisions, idempotency, declaration and notification outbox, perception ownership');
 console.log('PASS shared town membership, role permissions, stale edit rejection, own-character commands, throttling and concurrent viewer deduplication');
})().catch(error=>{console.error(error);process.exitCode=1});
