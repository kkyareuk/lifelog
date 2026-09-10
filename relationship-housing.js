// Operates on a world/draft. Callers commit the result through their normal save transaction.
export function cohabitWorld(world,relation){
 if(!relation.cohabit)return {changed:[],removed:[]};
 const ids=[...new Set([relation.a,relation.b,...(relation.groupMembers||[])])].filter(id=>world.characters[id]);
 const targetId=relation.cohabitHomeId||world.characters[relation.a]?.homeId,target=world.homes[targetId];
 if(!target)throw Error('cohabit-home-required');
 const keep=res=>res.role&&res.role!=='주거지'||/별장|별채|휴양|second|vacation/i.test(res.role||'');
 const candidates=new Set(),changed=[];
 for(const id of ids){const c=world.characters[id];
  const residences=Array.isArray(c.residences)?c.residences:[];
  if(c.homeId&&c.homeId!==targetId&&!residences.some(r=>r.homeId===c.homeId&&keep(r)))candidates.add(c.homeId);
  for(const r of residences)if(r.homeId!==targetId&&!keep(r))candidates.add(r.homeId);
  const existing=residences.find(r=>r.homeId===targetId),room=target.rooms?.[existing?.sleepRoomId]?existing.sleepRoomId:target.rooms?.bedroom?'bedroom':Object.keys(target.rooms||{})[0]||'';
  c.residences=[...residences.filter(r=>r.homeId!==targetId&&keep(r)).map(r=>({...r,isPrimary:false})),{...existing,homeId:targetId,role:'주거지',stayPattern:'상시 거주',isPrimary:true,sleepRoomId:room,sourceRelationshipId:relation.id||''}];
  c.homeId=targetId;c.sleepRoomId=room;c.townId=target.townId||c.townId;changed.push(id);
 }
 const removed=[];
 for(const id of candidates){const home=world.homes[id];if(!home||/별장|별채|휴양|second|vacation/i.test([home.kind,home.type,home.purpose,home.buildingSubtype].join(' ')))continue;
  if(Object.values(world.characters).some(c=>c.homeId===id||(c.residences||[]).some(r=>r.homeId===id)))continue;
  delete world.homes[id];removed.push(id);
 }
 world.deletedHomeIds=[...new Set([...(world.deletedHomeIds||[]),...removed])];if(removed.includes(world.activeHomeId))world.activeHomeId=targetId;
 return {changed,removed};
}
