// Include owned residents of the currently loaded multiplayer town without
// copying shared profiles into the personal character save.
export function notificationCharacters(world,snapshot,ownerUid){
 const result=new Map(Object.entries(world.characters||{}).map(([id,c])=>[id,c]));
 if(ownerUid)for(const r of snapshot?.residents||[]){
  if(r.ownerUid!==ownerUid)continue;
  let profile;try{profile=typeof r.profileJson==='string'?JSON.parse(r.profileJson):r.profileJson||{}}catch{continue}
  if(!result.has(r.id))result.set(r.id,{...profile,id:r.id,name:r.name||profile.name,notificationGroupId:snapshot.activeGroupId,notificationSourceId:r.sourceCharacterId||r.id});
 }
 return [...result.values()].filter(c=>c?.id);
}

export const notificationKeys=character=>[...new Set([character.id,character.notificationSourceId].filter(Boolean))];
export function selectedNotificationIds(settings,characters){
 const chosen=new Set(settings?.characterIds||[]);
 return new Set(characters.filter(c=>!chosen.size||notificationKeys(c).some(id=>chosen.has(id))).map(c=>c.id));
}
export function setNotificationCharacter(settings,characters,id,checked){
 const character=characters.find(c=>c.id===id);if(!character)return false;
 const chosen=new Set(settings.characterIds?.length?settings.characterIds:characters.flatMap(notificationKeys));
 for(const key of notificationKeys(character))checked?chosen.add(key):chosen.delete(key);
 if(!characters.some(c=>notificationKeys(c).some(key=>chosen.has(key))))return false;
 settings.characterIds=[...chosen];return true;
}
