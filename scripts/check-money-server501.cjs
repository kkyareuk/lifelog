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
 const service=require('../functions/character-money')({db,clock:()=>1000000,model:()=>import('../character-money.js')});
 data.set('groups/g/homes/h',{layoutJson:'{}'});
 const resident=data.get('groups/g/residents/a');resident.sharedHomeId='h';
 const base={groupId:'g',id:'a'};
 await assert.rejects(service('stranger',{...base,action:'read'}),e=>e.status===403);
 await assert.rejects(service('op',{...base,action:'settings',patch:{unit:'bad'}}),e=>e.status===403);
 assert.equal((await service('member',{...base,action:'read'})).wallet.balance,500000);
 await service('member',{...base,action:'settings',patch:{unit:'gold',mealPrice:10}});
 await service('member',{...base,action:'share',homeId:'h',enabled:true});
 const transfer={...base,action:'deposit',homeId:'h',amount:100000,requestId:'once'};
 await Promise.all(Array.from({length:8},()=>service('member',transfer)));
 assert.equal((await service('member',{...base,action:'read'})).wallet.balance,400000);
 assert.equal(data.get('groups/g/homes/h').commonWallet.balance,100000);
 await assert.rejects(service('member',{...transfer,amount:200000}),/money-request-conflict/);
 const saved=JSON.stringify([...data]);
 await assert.rejects(service('member',{...base,action:'withdraw',homeId:'h',amount:100001,requestId:'excess'}),/money-insufficient/);
 assert.equal(JSON.stringify([...data]),saved);
 // Durable receipts survive pruning the UI's recent receipt list.
 const current=data.get('groups/g/residents/a');const wallet=JSON.parse(current.lifeJson);wallet.wallet.receipts=[];current.lifeJson=JSON.stringify(wallet);
 data.get('groups/g/homes/h').commonWallet.receipts=[];
 await service('member',transfer);
 assert.equal((await service('member',{...base,action:'read'})).wallet.balance,400000);
 await service('member',{...base,action:'share',homeId:'h',enabled:false});
 await assert.rejects(service('member',{...base,action:'withdraw',homeId:'h',amount:1,requestId:'out'}),/money-household-required/);
 await service('member',{...base,action:'settings',patch:{balance:50000,confirmBalanceReset:true}});
 await service('op',{groupId:'g',id:'b',action:'settings',patch:{balance:150000,confirmBalanceReset:true}});
 assert.equal((await service('member',{...base,action:'read'})).wallet.balance,50000);
 assert.equal((await service('op',{groupId:'g',id:'b',action:'read'})).wallet.balance,150000);
 await assert.rejects(service('op',{...base,action:'settings',patch:{balance:1,confirmBalanceReset:true}}),e=>e.status===403);
 console.log('PASS money server: owner boundaries, concurrent replay, durable replay, atomic insufficient funds, membership');
})().catch(e=>{console.error(e);process.exitCode=1});
