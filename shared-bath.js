import {hasRomanticRelationship} from './social-activities.js?v=20260909dev305';

// Only actual bath scenes may share a tub. Washing at a sink or in a shower
// never becomes a bath just because a bathtub is present in the same room.
export function isTubBath(scene){
  if(!scene?.home||scene.transit||scene.meetingJourney)return false;
  if(scene.lifeTaskId)return scene.lifeTaskId==='bath';
  return /목욕|반신욕|욕조|taking a bath|bathing|入浴|湯船/i.test(scene.baseTitle||scene.title||'');
}

export function sharedBathScene(world,character,current,readScene,now=Date.now()){
  if(!isTubBath(current)||current.routineId)return current;
  const homeId=current.visitHomeId||character.homeId,home=world.homes?.[homeId],room=home?.rooms?.[current.room];
  const tubs=(room?.furniturePlacements||[]).filter(p=>/욕조/.test(p.item)).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  if(!tubs.length)return current;
  const scenes=new Map([[character.id,current]]);
  const bathers=Object.values(world.characters||{}).filter(person=>{
    const scene=person.id===character.id?current:readScene(person);scenes.set(person.id,scene);
    return isTubBath(scene)&&!scene.routineId&&(scene.visitHomeId||person.homeId)===homeId&&scene.room===current.room;
  }).sort((a,b)=>a.id.localeCompare(b.id));
  const used=new Set(),claimed=new Set();
  for(const person of bathers){
    if(used.has(person.id))continue;
    const own=scenes.get(person.id),pinned=own.furniture?.id||own.meetingFurniture?.id;
    const tub=tubs.find(p=>!claimed.has(p.id)&&(!pinned||p.id===pinned));
    if(!tub)continue;
    claimed.add(tub.id);used.add(person.id);
    const partner=bathers.find(other=>!used.has(other.id)&&hasRomanticRelationship(world.relationships,person.id,other.id)&&
      (!scenes.get(other.id).furniture?.id||scenes.get(other.id).furniture.id===tub.id));
    if(!partner)continue;
    used.add(partner.id);
    if(![person.id,partner.id].includes(character.id))continue;
    const other=person.id===character.id?partner:person,ids=[person.id,partner.id];
    const copy={ko:['함께 목욕하는 중',`${other.name}와 욕조에 나란히 앉아 따뜻한 물에 몸을 담그고 쉬고 있어요.`],en:['Taking a bath together',`They are relaxing in the warm bath beside ${other.name}.`],ja:['一緒に入浴中',`${other.name}と湯船に並んで座り、温かいお湯でくつろいでいます。`]};
    const [title,desc]=copy[world.uiLanguage]||copy.ko;
    const minute=Math.max(Number(own.minute)||0,Number(scenes.get(partner.id).minute)||0);
    return {...current,title,desc,localizedCopy:Object.fromEntries(Object.entries(copy).map(([lang,[title,desc]])=>[lang,{title,desc}])),baseTitle:current.baseTitle||current.title,baseDesc:current.baseDesc||current.desc,
      pairedBath:true,lifeTaskId:'bath',activityFamily:'hygiene',actionKind:'wash',furniture:tub,
      withId:other.id,withIds:[other.id],participantOrder:ids,groupInteraction:true,
      sharedFurnitureKey:`bath:${tub.id}`,interactionId:`bath:${homeId}:${tub.id}:${ids.join('~')}:${new Date(now).toDateString()}:${minute}`,minute};
  }
  return current;
}
