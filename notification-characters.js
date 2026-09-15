// Include owned residents of the currently loaded multiplayer town without
// copying shared profiles into the personal character save.
export function notificationCharacters(world,snapshot,ownerUid){
 const result=new Map(Object.entries(world.characters||{}).map(([id,c])=>[id,c]));
 if(ownerUid)for(const r of snapshot?.residents||[]){
  if(r.ownerUid!==ownerUid)continue;
  let profile;try{profile=typeof r.profileJson==='string'?JSON.parse(r.profileJson):r.profileJson||{}}catch{continue}
  if(!result.has(r.id))result.set(r.id,{...profile,id:r.id,name:r.name||profile.name,notificationGroupId:snapshot.activeGroupId});
 }
 return [...result.values()].filter(c=>c?.id);
}
