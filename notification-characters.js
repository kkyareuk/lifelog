export function notificationCharacters(world,snapshot,ownerUid){
 const result=new Map(Object.entries(world.characters||{}).map(([id,c])=>[id,{...c,notificationAffiliation:world.towns?.find(t=>t.id===c.townId)?.name||world.personalTownLabel||'내 마을'}]));
 const residents=[...(snapshot?.notificationResidents||[]),...(snapshot?.residents||[]).map(r=>({...r,notificationGroupId:snapshot.activeGroupId,notificationGroupName:snapshot.group?.name}))];
 for(const r of residents){let profile;try{profile=typeof r.profileJson==='string'?JSON.parse(r.profileJson):r.profileJson||{}}catch{continue}
 const groupId=r.notificationGroupId,id='group:'+groupId+':'+r.id;if(!groupId)continue;
 result.set(id,{...profile,id,name:r.name||profile.name,icon:profile.icon||r.icon||'',photo:profile.photo||r.photo||'',notificationGroupId:groupId,notificationResidentId:r.id,notificationSourceId:r.ownerUid===ownerUid?r.sourceCharacterId:'',notificationAffiliation:r.notificationGroupName||groupId});
 }
 for(const id of world.characterNotificationSettings?.characterIds||[]){if([...result.values()].some(c=>notificationKeys(c).includes(id)))continue;const memo=world.characterNotificationSettings?.senderMemo?.[id];result.set(id,{id,name:memo?.name||({ko:'이전 연락 캐릭터',en:'Previous contact',ja:'以前の連絡相手'}[world.uiLanguage]||'이전 연락 캐릭터'),icon:memo?.icon||'',notificationAffiliation:memo?.affiliation||({ko:'이전 선택',en:'Previous selection',ja:'以前の選択'}[world.uiLanguage]||'이전 선택'),notificationUnavailable:true});}
 return [...result.values()].filter(c=>c?.id);
}
export const notificationKeys=c=>[...new Set([c.id,c.notificationResidentId,c.notificationSourceId].filter(Boolean))];
export function selectedNotificationIds(settings,characters){const chosen=new Set(settings?.characterIds||[]),all=!settings?.explicitSelection&&!chosen.size;return new Set(characters.filter(c=>all||notificationKeys(c).some(id=>chosen.has(id))).map(c=>c.id))}
export function setNotificationCharacter(settings,characters,id,checked){const character=characters.find(c=>c.id===id);if(!character)return false;const chosen=new Set(settings.explicitSelection||settings.characterIds?.length?settings.characterIds:characters.flatMap(notificationKeys));for(const key of notificationKeys(character))checked?chosen.add(key):chosen.delete(key);settings.characterIds=[...chosen];settings.explicitSelection=true;settings.senderMemo??={};for(const key of notificationKeys(character))settings.senderMemo[key]={name:character.name,icon:character.icon||character.photo||'',affiliation:character.notificationAffiliation};return true}
