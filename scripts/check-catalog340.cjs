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
let calls=0;
const service=createSharedTownService({db,clock:()=>1000000,engine:async()=>snapshot=>{calls++;return snapshot.residents.map(r=>({id:r.id,lifeJson:'{}'}))}});
(async()=>{
 const relations=require('../functions/shared-relations').createService({db,clock:()=>1000000});
 data.get('groups/g').rules={allowRelationshipProposals:false,allowCharacterGroupProposals:true};
 await assert.rejects(relations.propose('member',{groupId:'g',requestId:'denied-rel',patch:{a:'a',b:'b',type:'친구'}}),e=>e.code==='proposals-disabled');
 await relations.propose('member',{groupId:'g',requestId:'allowed-group',kind:'characterGroup',patch:{name:'모임',memberIds:['a','b']}});
 data.get('groups/g').rules={allowRelationshipProposals:true,allowCharacterGroupProposals:false};
 await assert.rejects(relations.propose('member',{groupId:'g',requestId:'denied-group',kind:'characterGroup',patch:{name:'모임',memberIds:['a','b']}}),e=>e.code==='proposals-disabled');
 await relations.propose('member',{groupId:'g',requestId:'allowed-rel',patch:{a:'a',b:'b',type:'친구'}});
 const input={groupId:'g',kind:'drink',id:'tea',item:{id:'tea',name:'Tea'},expected:null};
 await assert.rejects(service.saveCatalogItem('member',input),e=>e.status===403);
 await assert.rejects(service.saveCatalogItem('stranger',input),e=>e.status===403);
 await service.saveCatalogItem('host',input);const old=data.get('groups/g/catalog/drink').items[0];
 await assert.rejects(service.saveCatalogItem('host',input),e=>e.status===409);
 await service.saveCatalogItem('op',{...input,expected:old,item:{id:'tea',name:'New tea'}});
 await assert.rejects(service.saveCatalogItem('host',{...input,expected:old,remove:true}),e=>e.status===409);
 const current=data.get('groups/g/catalog/drink').items[0];await service.saveCatalogItem('host',{...input,expected:current,remove:true});assert.equal(data.get('groups/g/catalog/drink').items.length,0);
 await assert.rejects(service.saveCatalogItem('host',{...input,item:{...input.item,image:'data:image/png;base64,a'}}),/catalog-photo/);
 data.set('groups/g/catalog/food',{items:Array.from({length:80},(_,i)=>({id:String(i),name:String(i)}))});await assert.rejects(service.saveCatalogItem('host',input),/catalog-limit/);
 data.set('groups/g/catalog/food',{items:[]});data.get('groups/g').rules={allowMemberCatalogAdd:true};
 await service.publishCatalog('member',{groupId:'g',catalog:{food:Array.from({length:30},(_,i)=>({id:'a'+i,name:'A'+i}))}});
 await service.publishCatalog('member',{groupId:'g',catalog:{drink:Array.from({length:50},(_,i)=>({id:'b'+i,name:'B'+i}))}});
 const snapshot=JSON.stringify([...data]);await assert.rejects(service.publishCatalog('member',{groupId:'g',catalog:{misc:[{id:'extra',name:'extra'}]}}),/catalog-limit/);assert.equal(JSON.stringify([...data]),snapshot);
 await assert.rejects(service.saveCatalogItem('member',{groupId:'g',kind:'food',id:'a0',expected:data.get('groups/g/catalog/food').items[0],remove:true}),e=>e.status===403);
 await assert.rejects(service.publishCatalog('member',{groupId:'g',catalog:{food:[{id:'a0',name:'Different'}]}}),/catalog-id-conflict/);assert.equal(JSON.stringify([...data]),snapshot);
 await service.publishCatalog('member',{groupId:'g',catalog:{food:[{id:'a0',name:'A0',notes:'Do not overwrite'}]}});assert(!data.get('groups/g/catalog/food').items[0].notes);
 data.get('groups/g').rules.allowMemberCatalogAdd=false;await assert.rejects(service.publishCatalog('member',{groupId:'g',catalog:{}}),e=>e.status===403);
 console.log('PASS member add permission, 30+50 shared cap, collision rollback, no overwrite/delete');
 console.log('PASS shared catalog permissions, create/update/delete, concurrent edit conflicts, media and total limit');
})().catch(e=>{console.error(e);process.exitCode=1});
