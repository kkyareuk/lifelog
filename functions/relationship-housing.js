const fail=message=>{throw Object.assign(Error(message),{status:409})};
module.exports=async(tx,root,patch)=>{
 if(!patch.cohabit||!patch.cohabitHomeId)return ()=>{};
 const [homes,residents]=await Promise.all([tx.get(root.collection('homes')),tx.get(root.collection('residents'))]);
 const decode=value=>{try{return JSON.parse(value||'{}')}catch{return {}}};
 const world={homes:Object.fromEntries(homes.docs.map(d=>[d.id,{...decode(d.data().layoutJson),...d.data(),id:d.id}])),characters:Object.fromEntries(residents.docs.map(d=>[d.id,{...decode(d.data().profileJson),id:d.id,name:d.data().name,homeId:d.data().sharedHomeId,ownerUid:d.data().ownerUid}]))};
 const ids=[...new Set([patch.a,patch.b,...(patch.groupMembers||[])])],owners=new Set(ids.map(id=>world.characters[id]?.ownerUid));
 if(!world.homes[patch.cohabitHomeId]||!owners.has(world.homes[patch.cohabitHomeId].ownerUid))fail('cohabit-home-required');
 const {cohabitWorld}=await import('./runtime/relationship-housing.js');
 const plan=cohabitWorld(world,patch),oldResidents=Object.fromEntries(residents.docs.map(d=>[d.id,d.data()]));
 return ()=>{
  for(const id of plan.changed){const c=world.characters[id],profile={...decode(oldResidents[id].profileJson),homeId:c.homeId,townId:c.townId,sleepRoomId:c.sleepRoomId};
   tx.update(root.collection('residents').doc(id),{sharedHomeId:c.homeId,townId:c.townId,profileJson:JSON.stringify(profile)});
  }
  for(const home of homes.docs){
   if(plan.removed.includes(home.id)&&owners.has(home.data().ownerUid))tx.delete(root.collection('homes').doc(home.id));
   else if(home.id===patch.cohabitHomeId||residents.docs.some(r=>ids.includes(r.id)&&r.data().sharedHomeId===home.id))tx.update(root.collection('homes').doc(home.id),{residentNames:Object.values(world.characters).filter(c=>c.homeId===home.id).map(c=>c.name)});
  }
 };
};
