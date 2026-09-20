const assert=require('node:assert/strict');
module.exports=function fixture(){
 const data=new Map([
  ['groups/g',{ownerUid:'host',courtTheme:'court',rules:{relationshipChangeMode:'dynamic'}}],
  ...['host','member','other','manager'].map(uid=>['groups/g/members/'+uid,{role:uid==='host'?'owner':uid==='manager'?'manager':'member'}]),
  ...[['a','member','세은'],['b','other','리아'],['c','member','가람']].map(([id,ownerUid,name])=>['groups/g/residents/'+id,{ownerUid,name,townId:'t'}]),
  ...['a','b','c'].map(id=>['groups/g/courtProfiles/'+id,{ownerUid:id==='b'?'other':'member',role:'noble',faction:'neutral',trait:id==='b'?'privacy':'courtesy',bio:'궁정에 초대받은 손님',enabled:true,revision:1}])
 ]);
 const ref=(path,collection=false)=>({path,id:path.split('/').at(-1),collection:name=>ref(path+'/'+name,true),doc:name=>ref(path+'/'+name),isCollection:collection});
 const snap=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>structuredClone(data.get(path))});
 let queue=Promise.resolve(),now=1800000000000;
 const db={collection:name=>ref(name,true),runTransaction:run=>{const task=queue.then(async()=>{const writes=[];const result=await run({get:async r=>{assert.equal(writes.length,0,'Firestore reads must precede writes');return r.isCollection?{docs:[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snap)}:snap(r.path)},set:(r,v)=>writes.push([r.path,v,false]),update:(r,v)=>{assert.ok(data.has(r.path));writes.push([r.path,v,true])}});for(const [p,v,merge]of writes)data.set(p,merge?{...data.get(p),...structuredClone(v)}:structuredClone(v));return result});queue=task.catch(()=>{});return task}};
 return {data,db,tick:ms=>now+=ms,service:require('../functions/court-service')({db,clock:()=>now})};
};
