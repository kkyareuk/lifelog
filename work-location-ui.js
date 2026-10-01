import {workLocation,workInterior} from './work-location.js';
import {roomEntryAllowed} from './room-permissions.js?v=20260909dev305';
import {roomActivityAllowed} from './room-activities.js?v=20260909dev305';
import {canTravelBetween} from './town-profile.js?v=20260909dev305';
export function workLocationFields(body,world,c){
 const t=(ko,en,ja)=>({ko,en,ja}[world.uiLanguage]||ko);
 const field=name=>{const label=document.createElement('label'),select=document.createElement('select');label.textContent=name;select.setAttribute('aria-label',name);label.append(select);body.append(label);return select};
 const place=field(t('근무할 건물','Work building','勤務する建物')),room=field(t('근무할 방','Work room','勤務する部屋'));
 place.add(new Option(t('자동 선택','Automatic','自動選択'),''));
 place.add(new Option(t('자택근무','Work from home','在宅勤務'),'home'));
 const towns=world.towns||[world.world].filter(Boolean);
 for(const town of towns)for(const p of town.places||[]){
  if(!p.deleted&&canTravelBetween(towns.find(t=>t.id===c.townId),town,world.preventInterTownMovement))place.add(new Option(`${town.name||''} · ${p.name}`,p.id));
 }
 place.value=c.workplaceId||'';
 const refresh=()=>{
  const candidate={...c,workplaceId:place.value},destination=workLocation(world,candidate,c.wallet?.employments?.[0]||c.wallet?.employment||{});
  const town=(world.towns||[world.world].filter(Boolean)).find(t=>t.id===destination.townId),building=town?.places?.find(p=>p.id===destination.placeId);
  const home=destination.home?world.homes?.[c.homeId]:building?workInterior(building,town.id,world.uiLanguage):null;
  room.replaceChildren(new Option(t('자동 선택','Automatic','自動選択'),''));
  for(const [key,r] of Object.entries(home?.rooms||{}))if(roomEntryAllowed(c,home,r)&&roomActivityAllowed(r,{kind:'work'}))room.add(new Option(r.name||key,key));
  room.value=place.value===(c.workplaceId||'')?c.workRoomId||'':'';
  if(room.selectedIndex<0)room.value='';
 };
 place.onchange=refresh;refresh();
 return ()=>({workplaceId:place.value,workRoomId:room.value});
}
