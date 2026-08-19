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
  const deletedCharacters=new Set(next.deletedCharacterIds),deletedHomes=new Set(next.deletedHomeIds);

  next.characters=mergedMap(preferred.characters,fallback.characters);
  deletedCharacters.forEach(id=>delete next.characters[id]);
  const preferredOrder=Array.isArray(preferred.order)?preferred.order:Object.keys(mapById(preferred.characters));
  const fallbackOrder=Array.isArray(fallback.order)?fallback.order:Object.keys(mapById(fallback.characters));
  next.order=union(preferredOrder,fallbackOrder).filter(id=>next.characters[id]);

  next.homes=mergedMap(preferred.homes,fallback.homes);
  deletedHomes.forEach(id=>delete next.homes[id]);
  next.routines=mergedMap(preferred.routines,fallback.routines);
  next.dailyPlans=mergedMap(preferred.dailyPlans,fallback.dailyPlans);
  next.characterViews=mergedMap(preferred.characterViews,fallback.characterViews);

  const preferredRelationships=Array.isArray(preferred.relationships)?preferred.relationships:Object.values(preferred.relationships||{});
  const fallbackRelationships=Array.isArray(fallback.relationships)?fallback.relationships:Object.values(fallback.relationships||{});
  const deletedRelationships=new Set(next.deletedRelationshipIds);
  next.relationships=mergedListById(preferredRelationships,fallbackRelationships).filter(relation=>
    !deletedRelationships.has(String(relation.id||""))&&next.characters[relation.a]&&next.characters[relation.b]
  );

  next.towns=mergedListById(preferred.towns,fallback.towns);
  const preferredPlaces=preferred.world?.places||[],fallbackPlaces=fallback.world?.places||[];
  next.world={...clone(fallback.world),...clone(preferred.world),places:mergedListById(preferredPlaces,fallbackPlaces)};
  next.interactions=mergedListById(preferred.interactions,fallback.interactions).slice(-300);
  next.scheduledChoices=mergedListById(preferred.scheduledChoices,fallback.scheduledChoices).slice(-120);

  // 화면·언어 설정은 계정이 아니라 현재 기기의 사용 환경을 따른다.
  ["uiLanguage","uiFont","uiScale","colorMode","visualTheme","activeTab","characterPane","homeEditMode"].forEach(key=>{
    if(device[key]!==undefined)next[key]=clone(device[key]);
  });
  next.activeId=next.characters[device.activeId]?device.activeId:(next.characters[preferred.activeId]?preferred.activeId:next.order[0]||null);
  next.activeHomeId=next.homes[device.activeHomeId]?device.activeHomeId:(next.homes[preferred.activeHomeId]?preferred.activeHomeId:Object.keys(next.homes)[0]||null);
  next.lastSaved=Math.max(Number(device.lastSaved)||0,Number(cloud.lastSaved)||0);
  return next;
}

