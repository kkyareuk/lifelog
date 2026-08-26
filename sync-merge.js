const clone=value=>JSON.parse(JSON.stringify(value||{}));
const mapById=value=>{
  if(Array.isArray(value))return Object.fromEntries(value.filter(item=>item&&typeof item==="object").map(item=>[String(item.id||""),item]).filter(([id])=>id));
  return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
};
const union=(first=[],second=[])=>[...new Set([...(first||[]),...(second||[])].map(String).filter(Boolean))];
const mergedMap=(preferred,fallback)=>({...clone(mapById(fallback)),...clone(mapById(preferred))});
const mergedListById=(preferred=[],fallback=[])=>{
  const result=[],seen=new Set();
  [...(preferred||[]),...(fallback||[])].forEach(item=>{
    if(!item||typeof item!=="object")return;
    const key=String(item.id||JSON.stringify(item));
    if(seen.has(key))return;
    seen.add(key);result.push(clone(item));
  });
  return result;
};
const canonicalRelationshipType=type=>({
  "폴리 관계":"연인","유사 연인":"연인","비공식 연인":"연인","연애 관계":"연인","커플":"연인",
  "절친":"친구","대학 동기":"친구","젊은 날의 친구들":"친구",
  "유사가족":"동거인","가족":"동거인","보호·피보호":"동거인"
})[type]||String(type||"친구");
const relationshipIdentity=relation=>{
  if(!relation?.a||!relation?.b||relation.a===relation.b)return"";
  const type=canonicalRelationshipType(relation.type),directional=type==="부모·자녀"||Boolean(relation.directional);
  const pair=directional?`${relation.a}>${relation.b}`:[relation.a,relation.b].sort().join("~");
  return`${type}|${pair}|${String(relation.parentRole||"")}`;
};
const mergedInteractions=(preferred=[],fallback=[])=>{
  const result=[],seenIds=new Set(),seenMoments=new Set();
  [...(preferred||[]),...(fallback||[])].forEach(item=>{
    if(!item||typeof item!=="object")return;
    const id=String(item.id||"");
    const moment=[item.type,item.actorId,item.targetId,item.itemKind,item.itemId,item.requestTitle,item.requestCategory,item.requestedBy,Number(item.createdAt)||0].map(value=>String(value||"")).join("|");
    if((id&&seenIds.has(id))||seenMoments.has(moment))return;
    if(id)seenIds.add(id);
    seenMoments.add(moment);result.push(clone(item));
  });
  return result;
};

// 동기화 시 한쪽 마을 전체를 다른 쪽으로 덮지 않는다. 최신 상태를 같은 ID의
// 기준으로 삼되, 반대쪽에만 있는 캐릭터·집·일정도 함께 보존한다. 삭제 기록은
// 어느 기기에서 만들어졌든 실제 데이터보다 우선한다.
export function mergeDeviceAndCloudState(deviceValue,cloudValue){
  const device=clone(deviceValue),cloud=clone(cloudValue);
  const cloudPreferred=Number(cloud.lastSaved||0)>=Number(device.lastSaved||0);
  const preferred=cloudPreferred?cloud:device,fallback=cloudPreferred?device:cloud;
  const next={...clone(fallback),...clone(preferred)};

  next.deletedCharacterIds=union(device.deletedCharacterIds,cloud.deletedCharacterIds);
  next.deletedRelationshipIds=union(device.deletedRelationshipIds,cloud.deletedRelationshipIds);
  next.deletedRelationshipKeys=union(device.deletedRelationshipKeys,cloud.deletedRelationshipKeys);
  next.deletedHomeIds=union(device.deletedHomeIds,cloud.deletedHomeIds);
  next.deletedRoutineIds=union(device.deletedRoutineIds,cloud.deletedRoutineIds);
  next.deletedMonthlyRoutineIds=union(device.deletedMonthlyRoutineIds,cloud.deletedMonthlyRoutineIds);
  const deletedCharacters=new Set(next.deletedCharacterIds),deletedHomes=new Set(next.deletedHomeIds);

  next.characters=mergedMap(preferred.characters,fallback.characters);
  deletedCharacters.forEach(id=>delete next.characters[id]);
  const preferredOrder=Array.isArray(preferred.order)?preferred.order:Object.keys(mapById(preferred.characters));
  const fallbackOrder=Array.isArray(fallback.order)?fallback.order:Object.keys(mapById(fallback.characters));
  next.order=union(preferredOrder,fallbackOrder).filter(id=>next.characters[id]);

  next.homes=mergedMap(preferred.homes,fallback.homes);
  deletedHomes.forEach(id=>delete next.homes[id]);
  next.routines=mergedMap(preferred.routines,fallback.routines);
  next.monthlyRoutines=mergedMap(preferred.monthlyRoutines,fallback.monthlyRoutines);
  const deletedRoutines=new Set(next.deletedRoutineIds),deletedMonthlyRoutines=new Set(next.deletedMonthlyRoutineIds);
  Object.keys(next.routines).forEach(characterId=>{
    next.routines[characterId]=(Array.isArray(next.routines[characterId])?next.routines[characterId]:[]).filter(item=>!deletedRoutines.has(String(item?.id||"")));
  });
  Object.keys(next.monthlyRoutines).forEach(characterId=>{
    next.monthlyRoutines[characterId]=(Array.isArray(next.monthlyRoutines[characterId])?next.monthlyRoutines[characterId]:[]).filter(item=>!deletedMonthlyRoutines.has(String(item?.id||"")));
  });
  next.dailyPlans=mergedMap(preferred.dailyPlans,fallback.dailyPlans);
  next.characterViews=mergedMap(preferred.characterViews,fallback.characterViews);

  const preferredRelationships=Array.isArray(preferred.relationships)?preferred.relationships:Object.values(preferred.relationships||{});
  const fallbackRelationships=Array.isArray(fallback.relationships)?fallback.relationships:Object.values(fallback.relationships||{});
  const deletedRelationships=new Set(next.deletedRelationshipIds);
  next.relationships=mergedListById(preferredRelationships,fallbackRelationships).filter(relation=>
    !deletedRelationships.has(String(relation.id||""))&&next.characters[relation.a]&&next.characters[relation.b]
  );
  next.characterGroups=mergedListById(preferred.characterGroups,fallback.characterGroups).map(group=>({
    ...group,
    memberIds:union(group.memberIds,[]).filter(id=>next.characters[id])
  }));

  next.towns=mergedListById(preferred.towns,fallback.towns);
  const preferredPlaces=preferred.world?.places||[],fallbackPlaces=fallback.world?.places||[];
  next.world={...clone(fallback.world),...clone(preferred.world),places:mergedListById(preferredPlaces,fallbackPlaces)};
  next.interactions=mergedInteractions(preferred.interactions,fallback.interactions).slice(-300);
  next.scheduledChoices=mergedListById(preferred.scheduledChoices,fallback.scheduledChoices).slice(-120);

  // 화면·언어 설정은 계정이 아니라 현재 기기의 사용 환경을 따른다.
  ["uiLanguage","uiScale","colorMode","visualTheme","activeTab","characterPane"].forEach(key=>{
    if(device[key]!==undefined)next[key]=clone(device[key]);
  });
  // 편집 모드는 저장 데이터가 아니라 현재 화면에서 명시적으로 켜는 일시 상태다.
  // 다른 기기나 백업 파일에서 켜진 상태를 가져오면 조절 손잡이가 평상시에도 보인다.
  next.homeEditMode=false;
  next.activeId=next.characters[device.activeId]?device.activeId:(next.characters[preferred.activeId]?preferred.activeId:next.order[0]||null);
  next.activeHomeId=next.homes[device.activeHomeId]?device.activeHomeId:(next.homes[preferred.activeHomeId]?preferred.activeHomeId:Object.keys(next.homes)[0]||null);
  next.lastSaved=Math.max(Number(device.lastSaved)||0,Number(cloud.lastSaved)||0);
  return next;
}

// 사용자가 직접 누른 불러오기는 클라우드에 실제로 존재하는 캐릭터를
// 복구 대상으로 취급한다. 업데이트 뒤 기기에 남은 오래된 삭제 표식이
// 서버의 정상 캐릭터·집·관계를 다시 지우지 않도록 실제 원격 데이터가
// 있는 ID의 표식만 해제한 뒤, 클라우드 내용을 같은 ID의 우선본으로 병합한다.
export function mergeCloudRestoreState(deviceValue,cloudValue){
  const device=clone(deviceValue),cloud=clone(cloudValue);
  const cloudCharacters=mapById(cloud.characters),cloudHomes=mapById(cloud.homes);
  const cloudRelationships=Array.isArray(cloud.relationships)?cloud.relationships:Object.values(cloud.relationships||{});
  const relationshipIds=new Set(cloudRelationships.map(item=>String(item?.id||"")).filter(Boolean));
  const relationshipKeys=new Set(cloudRelationships.map(relationshipIdentity).filter(Boolean));
  const keepMissing=(list,present)=>Array.isArray(list)?list.map(String).filter(id=>!present.has(id)):[];
  const characterIds=new Set(Object.keys(cloudCharacters)),homeIds=new Set(Object.keys(cloudHomes));
  device.deletedCharacterIds=keepMissing(device.deletedCharacterIds,characterIds);
  cloud.deletedCharacterIds=keepMissing(cloud.deletedCharacterIds,characterIds);
  device.deletedHomeIds=keepMissing(device.deletedHomeIds,homeIds);
  cloud.deletedHomeIds=keepMissing(cloud.deletedHomeIds,homeIds);
  device.deletedRelationshipIds=keepMissing(device.deletedRelationshipIds,relationshipIds);
  cloud.deletedRelationshipIds=keepMissing(cloud.deletedRelationshipIds,relationshipIds);
  device.deletedRelationshipKeys=(device.deletedRelationshipKeys||[]).filter(key=>!relationshipKeys.has(String(key)));
  cloud.deletedRelationshipKeys=(cloud.deletedRelationshipKeys||[]).filter(key=>!relationshipKeys.has(String(key)));
  cloud.lastSaved=Math.max(Date.now(),Number(device.lastSaved)||0,Number(cloud.lastSaved)||0)+1;
  return mergeDeviceAndCloudState(device,cloud);
}

// 백업 파일은 현재 기기의 데이터를 지우는 "교체"가 아니라 복구용 병합으로
// 읽는다. 파일에 있는 같은 ID는 파일 내용을 우선하고, 기기에만 있는 인물과
// 집은 남긴다. 파일에 실제 데이터가 있는 ID는 오래된 기기 삭제표 때문에
// 다시 지워지지 않게 복구 대상으로 취급한다.
export function mergeImportedBackupState(deviceValue,importValue){
  const device=clone(deviceValue),incoming=clone(importValue);
  const importedCharacters=mapById(incoming.characters),importedHomes=mapById(incoming.homes);
  const importedRelationships=Array.isArray(incoming.relationships)?incoming.relationships:Object.values(incoming.relationships||{});
  const importedRelationshipIds=new Set(importedRelationships.map(item=>String(item?.id||"")).filter(Boolean));
  device.deletedCharacterIds=(device.deletedCharacterIds||[]).filter(id=>!importedCharacters[String(id)]);
  device.deletedHomeIds=(device.deletedHomeIds||[]).filter(id=>!importedHomes[String(id)]);
  device.deletedRelationshipIds=(device.deletedRelationshipIds||[]).filter(id=>!importedRelationshipIds.has(String(id)));
  incoming.deletedCharacterIds=(incoming.deletedCharacterIds||[]).filter(id=>!importedCharacters[String(id)]);
  incoming.deletedHomeIds=(incoming.deletedHomeIds||[]).filter(id=>!importedHomes[String(id)]);
  incoming.deletedRelationshipIds=(incoming.deletedRelationshipIds||[]).filter(id=>!importedRelationshipIds.has(String(id)));
  incoming.lastSaved=Math.max(Date.now(),Number(device.lastSaved)||0,Number(incoming.lastSaved)||0)+1;
  const next=mergeDeviceAndCloudState(device,incoming);
  next.homeEditMode=false;
  return next;
}
