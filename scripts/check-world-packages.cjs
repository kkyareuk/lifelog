const assert=require('node:assert/strict');
const data=new Map([
 ['users/me',{entitlements:{}}],['users/me/sync/core',{state:{order:['a','b'],towns:[{id:'solo'}]}}],['users/me/groupMemberships/g',{}],
 ['groups/g',{ownerUid:'me',towns:[{id:'dest',name:'Empty',places:[],decorations:[]}]}]
]);
const ref=(path,collection=false,filter)=>({path,id:path.split('/').at(-1),collection:n=>ref(path+'/'+n,true),doc:n=>ref(path+'/'+n),where:(k,o,v)=>ref(path,true,[k,v]),get:async()=>read(ref(path,collection,filter)),isCollection:collection,filter});
const snap=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>structuredClone(data.get(path))});
function read(r){return r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap).filter(s=>!r.filter||s.data()[r.filter[0]]===r.filter[1])}:snap(r.path)}
const db={collection:n=>ref(n,true),runTransaction:async run=>{const writes=[];const out=await run({get:async r=>{assert.equal(writes.length,0,'Firestore reads must precede writes');return read(r)},set:(r,v)=>writes.push([r.path,v]),create:(r,v)=>{assert.ok(!data.has(r.path));writes.push([r.path,v])},update:(r,v)=>writes.push([r.path,{...data.get(r.path),...v}]),delete:r=>writes.push([r.path,null])});for(const [k,v] of writes)v===null?data.delete(k):data.set(k,structuredClone(v));return out}};
const service=require('../functions/world-packages')({db,clock:()=>12345});
const pack={version:1,kind:'town',name:'Home town',town:{id:'solo',name:'Home town',places:[{id:'cafe',name:'Cafe',x:17,y:23}],decorations:[]},characters:{a:{id:'a',name:'A',homeId:'h',townId:'solo',workplaceId:'cafe'},b:{id:'b',name:'B',homeId:'h',townId:'solo'}},homes:{h:{id:'h',name:'Home',townId:'solo',mapX:21,mapY:33,mapScale:1.2,rooms:{bedroom:{name:'Bedroom',ownerCharacterIds:['a'],furniturePlacements:[{id:'bed',assignedCharacterIds:['a','b']}]}}}},relationships:{r:{id:'r',a:'a',b:'b',type:'사제 관계',teacherId:'a'}},characterGroups:[{id:'cg',name:'Together',memberIds:['a','b']}],characterViews:{a:{b:{feeling:'좋아함'}}},routines:{a:[{withIds:['b'],placeId:'cafe',day:1}]},catalog:{food:[{id:'rice',name:'Rice'}]}};
(async()=>{
 const shared=await service.publishWorldCode('me',{package:pack});assert.equal(shared.code.length,18);assert.deepEqual((await service.readWorldCode('other',{code:shared.code})).package,pack);
 await assert.rejects(service.revokeWorldCode('other',{code:shared.code}),/owner-required/);
 await service.revokeWorldCode('me',{code:shared.code});await assert.rejects(service.readWorldCode('me',{code:shared.code}),/sharing-code-missing/);
 await assert.rejects(service.publishWorldCode('me',{package:{...pack,photo:'local-media:missing'}}),/photo-upload-required/);
 const input={groupId:'g',townId:'dest',requestId:'move1',package:pack};
 await assert.rejects(service.migrateTown('other',input),/owner-required/);
 data.set('groups/g/residents/existing',{townId:'dest'});await assert.rejects(service.migrateTown('me',input),/destination-town-not-empty/);data.delete('groups/g/residents/existing');
 const before=JSON.stringify([...data]);await assert.rejects(service.migrateTown('me',{...input,package:{...pack,characters:{...pack.characters,x:{name:'Foreign'}}}}),/personal-character-missing/);assert.equal(JSON.stringify([...data]),before);
 await service.migrateTown('me',input);
 const rows=path=>[...data.entries()].filter(([k])=>k.startsWith(path)).map(([k,v])=>({id:k.split('/').at(-1),...v}));
 const residents=rows('groups/g/residents/'),a=residents.find(r=>r.name==='A'),b=residents.find(r=>r.name==='B'),home=rows('groups/g/homes/')[0],relationship=rows('groups/g/relationships/')[0];
 assert.equal(relationship.a,a.id);assert.equal(relationship.b,b.id);assert.equal(relationship.teacherId,a.id);assert.equal(a.sharedHomeId,home.id);
 const layout=JSON.parse(home.layoutJson);assert.equal(layout.rooms.bedroom.ownerCharacterIds[0],a.id);assert.deepEqual(layout.rooms.bedroom.furniturePlacements[0].assignedCharacterIds,[a.id,b.id]);assert.equal(home.mapX,21);assert.equal(home.mapScale,1.2);
 const place=data.get('groups/g').towns[0].places[0];assert.equal(place.x,17);assert.equal(JSON.parse(a.profileJson).workplaceId,place.id);assert.deepEqual(JSON.parse(a.scheduleJson).routines[0].withIds,[b.id]);
 const snapshot=JSON.stringify([...data]);assert.equal((await service.migrateTown('me',input)).alreadyCompleted,true);assert.equal(JSON.stringify([...data]),snapshot);
 assert.equal(data.get('users/me/characterTransfers/a').location,'group');assert.ok(data.has('users/me/characterTransfers/world_move1'));
 console.log('PASS codes/revocation, authorization, occupied destination, all-or-nothing failures, slots, ID references, home info/rooms/furniture/placement, schedules and idempotency');
})().catch(e=>{console.error(e);process.exitCode=1});
