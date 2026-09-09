// The server transfer record is authoritative; never infer identity from a name.
export function applyCharacterTransfers(world,records=[]){
 world.characterTransferVersions||={};world.order||=[];world.characters||={};
 for(const r of records){if(r.kind==='world')continue;const id=r.personalId;if(!id)continue;
  if(['group','deleted'].includes(r.location)){
   delete world.characters[id];world.order=world.order.filter(x=>x!==id);
   if(world.activeId===id)world.activeId=world.order[0]||'';
  }else if(r.location==='personal'&&Number(r.revision)>Number(world.characterTransferVersions[id]||0)){
   const profile={...r.profile,id,days:{},timelineResetAt:r.updatedAt},townId=world.towns?.some(t=>t.id===r.homeTownId)?r.homeTownId:world.activeTownId||world.towns?.[0]?.id;
   const homeId=r.homeId||id;
   if(!world.homes?.[homeId]&&r.home){world.homes||={};world.homes[homeId]={...r.home,id:homeId,townId}}
   profile.townId=townId;profile.homeId=homeId;delete profile.ownerUid;delete profile.sharedScene;delete profile.sharedContext;
   profile.residences=[{homeId,isPrimary:true,stayPattern:'상시 거주',sleepRoomId:profile.sleepRoomId||'bedroom'}];
   world.characters[id]=profile;if(!world.order.includes(id))world.order.push(id);
   world.routines||={};world.monthlyRoutines||={};world.routines[id]=r.schedule?.routines||[];world.monthlyRoutines[id]=r.schedule?.monthlyRoutines||[];
   if(!world.activeId)world.activeId=id;
  }
  world.characterTransferVersions[id]=Math.max(Number(world.characterTransferVersions[id])||0,Number(r.revision)||0);
 }
 for(const r of records.filter(r=>r.kind==='world')){
  world.worldTransferVersions||={};if(world.worldTransferVersions[r.personalId])continue;
  for(const id of r.homeIds||[])if(!Object.values(world.characters).some(c=>c.homeId===id||(c.residences||[]).some(x=>x.homeId===id)))delete world.homes?.[id];
  for(const id of r.relationshipIds||[])delete world.relationships?.[id];
  world.characterGroups=(world.characterGroups||[]).filter(g=>!(r.characterGroupIds||[]).includes(g.id));
  world.worldTransferVersions[r.personalId]=r.updatedAt||1;
 }
 return world;
}
