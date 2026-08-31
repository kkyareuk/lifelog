// Recovery is opt-in and restricted to the current account's existing villages.
// Explicit deletions and resets always win over older copies.
export function missingBuildings(current,snapshots=[]){
  const towns=current.towns||[],existing=new Set(towns.flatMap(t=>t.places||[]).map(p=>String(p.id)));
  for(const p of current.world?.places||[])existing.add(String(p.id));
  const deleted=new Set([...(current.deletedPlaceIds||[]),...snapshots.flatMap(s=>s?.deletedPlaceIds||[])].map(String));
  const found=new Map(),reset=Number(current.gameResetAt)||0;
  for(const snapshot of snapshots.slice().sort((a,b)=>(Number(b?.lastSaved)||0)-(Number(a?.lastSaved)||0))){
    if(!snapshot||reset&&Number(snapshot.lastSaved||0)<reset)continue;
    const sources=[...(snapshot.towns||[]),...(snapshot.world?[{...snapshot.world,id:snapshot.activeTownId||snapshot.world.id}]:[])];
    for(const town of sources){
      if(!town?.id||!towns.some(t=>t.id===town.id)||(current.deletedTownIds||[]).includes(town.id))continue;
      for(const place of Array.isArray(town.places)?town.places:[]){
        if(!place?.id||existing.has(String(place.id))||deleted.has(String(place.id))||found.has(String(place.id)))continue;
        found.set(String(place.id),{townId:town.id,townName:towns.find(t=>t.id===town.id).name,place:JSON.parse(JSON.stringify(place))});
      }
    }
  }
  return [...found.values()];
}
