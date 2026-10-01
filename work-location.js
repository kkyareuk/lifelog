import {jobWorkplace} from './job-log-runtime.js';
import {buildingInterior} from './building-interior-model.js';
import {roomEntryAllowed} from './room-permissions.js?v=20260909dev305';
import {roomActivityAllowed} from './room-activities.js?v=20260909dev305';
import {canTravelBetween} from './town-profile.js?v=20260909dev305';
const defaults=new WeakMap();
export function workInterior(place,townId,language='ko'){
 if(place.interior?.rooms)return {...place.interior,id:'place-interior:'+townId+':'+place.id,townId};
 const key=townId+':'+language+':'+place.type,cached=defaults.get(place);
 if(cached?.key===key)return cached.home;
 const home=buildingInterior(place,townId,language);defaults.set(place,{key,home});return home;
}
export function workLocation(world,c,employment={}){
 const id=jobWorkplace(world,c,employment),towns=world.towns||[world.world].filter(Boolean);
 const town=towns.find(t=>t.places?.some(p=>p.id===id&&!p.deleted));
 const place=id&&id!=='home'?town?.places.find(p=>p.id===id&&!p.deleted):null;
 const ownTown=c.townId,canTravel=place&&canTravelBetween(towns.find(t=>t.id===ownTown),town,world.preventInterTownMovement);
 const home=canTravel?workInterior(place,town.id,world.uiLanguage):world.homes?.[c.homeId];
 const rooms=Object.entries(home?.rooms||{}).filter(([,r])=>roomEntryAllowed(c,home,r)&&roomActivityAllowed(r,{kind:'work'}));
 const chosen=rooms.find(([key])=>key===c.workRoomId)||rooms.find(([,r])=>r.type==='study')||rooms[0];
 return canTravel?{home:false,placeId:place.id,townId:town.id,room:chosen?.[0]||''}:
  {home:true,visitHomeId:c.homeId,townId:home?.townId||ownTown,room:chosen?.[0]||'study'};
}
