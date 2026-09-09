// Reuse the individual validators, but buffer their writes in one transaction.
module.exports=({db,makeService})=>async(uid,input)=>{
 if(!Array.isArray(input.operations)||!input.operations.length||input.operations.length>250)throw Object.assign(Error('invalid-edit'),{status:400});
 return db.runTransaction(async tx=>{
  const pending=new Map(),reads=new Map();
  const snapshot=(ref,data)=>({ref,id:ref.id,exists:data!==undefined,data:()=>structuredClone(data)});
  const buffered={
   get:async ref=>{
    if(pending.has(ref.path))return snapshot(ref,pending.get(ref.path).data);
    if(!reads.has(ref.path))reads.set(ref.path,await tx.get(ref));
    const result=reads.get(ref.path);
    if(!result.docs)return result;
    const docs=new Map(result.docs.map(d=>[d.id,d]));
    for(const value of pending.values())if(value.ref.path.slice(0,value.ref.path.lastIndexOf('/'))===ref.path)docs.set(value.ref.id,snapshot(value.ref,value.data));
    return {docs:[...docs.values()]};
   },
   update:(ref,patch)=>{const previous=pending.get(ref.path)?.data??reads.get(ref.path)?.data();pending.set(ref.path,{ref,data:{...previous,...patch},method:pending.get(ref.path)?.method||'update'})},
   set:(ref,data)=>pending.set(ref.path,{ref,data,method:'set'})
  };
  const service=makeService({...db,collection:name=>db.collection(name),runTransaction:run=>run(buffered)});
  let revision=Number(input.revision)||0;
  for(const operation of input.operations){
   if(!['saveBuilding','saveHomePlacement','saveDecoration','saveTown'].includes(operation.action)||operation.input?.create&&operation.action==='saveTown')throw Object.assign(Error('invalid-edit-operation'),{status:400});
   const result=await service[operation.action](uid,{...operation.input,groupId:input.groupId,townId:input.townId,revision});revision=result.revision;
  }
  const root=pending.get('groups/'+input.groupId);root.data.buildingRevision=(Number(input.revision)||0)+1;
  // No writes reach Firestore until every operation has passed validation.
  for(const {ref,data,method} of pending.values())tx[method](ref,data);
  return {saved:true,revision:root.data.buildingRevision,town:root.data.towns.find(t=>t.id===input.townId),homes:[...pending.values()].filter(v=>v.ref.path.startsWith('groups/'+input.groupId+'/homes/')).map(v=>({id:v.ref.id,...v.data}))};
 });
};
