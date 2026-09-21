// Apply the server response immediately; listeners may arrive on the next frame.
export function applyConfirmedTown(s,action,result){
 if(!['saveHomeLayout','saveHomePlacement','saveTownEdit','saveTown','saveBuilding','saveDecoration'].includes(action))return s;
 if(action!=='saveHomeLayout'&&Number(result.revision)<Number(s.group?.buildingRevision||0))return s;
 const next={...s},homes=result.homes|| (result.home?[result.home]:[]);
 if(homes.length){const byId=new Map(homes.map(h=>[h.id,h]));next.homes=(s.homes||[]).map(h=>byId.has(h.id)&&Number(byId.get(h.id).layoutRevision||0)>=Number(h.layoutRevision||0)?{...h,...byId.get(h.id)}:h);for(const h of homes)if(!next.homes.some(x=>x.id===h.id))next.homes.push(h);}
 if(action!=='saveHomeLayout'&&result.revision>=Number(s.group?.buildingRevision||0))next.group={...s.group,buildingRevision:result.revision,...(result.town?{towns:(s.group?.towns||[]).map(t=>t.id===result.town.id?result.town:t)}:{})};
 return next;
}
