import {withTownEditDraft} from './town-edit-draft.js?v=20260909dev284';
import {state,runIsolatedWorld,emptyWorld} from './state.js?v=20260909dev284';

export const decodeShared=value=>{try{return typeof value==='string'?JSON.parse(value):value||{}}catch{return {}}};
const selections=new Map();
export function sharedSelection(snapshot){const key=snapshot.activeGroupId||snapshot.group?.id; if(!selections.has(key))selections.set(key,{});return selections.get(key)}
export function sharedProfile(value){
  const blocked=new Set(['days','ownerUid','sharedScene','sharedContext','sourceCharacterId','revision','__proto__','prototype','constructor']);
  const clean=(v,depth=0)=>{
    if(depth>16)return null;
    if(typeof v==='string')return /^(data:|blob:)/i.test(v)?'':v.slice(0,20000);
    if(Array.isArray(v))return v.slice(0,500).map(x=>clean(x,depth+1));
    if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>!blocked.has(k)).map(([k,x])=>[k,clean(x,depth+1)]));
    return v??null;
  };return clean(value);
}
export function buildSharedWorld(snapshot,language='ko'){
  snapshot=withTownEditDraft(snapshot);
  const base=emptyWorld(),group=snapshot.group||{},characters={},homes={},routines={},monthlyRoutines={},characterDirectives={},characterViews={};
  const towns=(group.towns||[]).map(t=>({...base.world,...t,places:t.places||[],decorations:t.decorations||[]}));
  const activeTownId=snapshot.selectedTownId||towns[0]?.id;
  for(const item of snapshot.homes||[]){const layout=decodeShared(item.layoutJson),rooms=layout.rooms||{},floors=Object.values(rooms).map(r=>Number(r.floor)||1);homes[item.id]={...layout,...item,rooms,floorCount:Math.max(Number(layout.floorCount)||1,...floors),activeFloor:layout.activeFloor||Math.min(...floors,1),id:item.id}}
  for(const r of snapshot.residents||[]){
    const profile=decodeShared(r.profileJson),life=decodeShared(r.lifeJson),schedule=decodeShared(r.scheduleJson);
    const homeId=Array.isArray(r.residences)?(r.residences.find(item=>item.isPrimary&&homes[item.homeId])?.homeId||r.residences.find(item=>homes[item.homeId])?.homeId||''):(snapshot.homes||[]).some(h=>h.id===r.sharedHomeId)?r.sharedHomeId:(snapshot.homes||[]).find(h=>h.ownerUid===r.ownerUid&&h.sourceHomeId===(r.sourceHomeId||profile.homeId))?.id||'';
    const remap=items=>(items||[]).map(item=>({...item,townId:r.townId,homeId,withIds:(item.withIds||[]).map(id=>(snapshot.residents||[]).find(x=>x.ownerUid===r.ownerUid&&x.sourceCharacterId===id)?.id).filter(Boolean)}));
    characters[r.id]={...profile,id:r.id,name:r.name,job:r.job,icon:profile.icon||r.icon||'',photo:profile.photo||r.photo||'',ownerUid:r.ownerUid,townId:r.townId,homeId,
      residences:Array.isArray(r.residences)?r.residences.filter(item=>homes[item.homeId]):homeId?[{homeId,isPrimary:true,stayPattern:'상시 거주',sleepRoomId:profile.sleepRoomId||'bedroom'}]:[],
      wake:profile.wake||'07:00',sleep:profile.sleep||'23:00',createdAt:profile.createdAt||1,ageGroup:profile.ageGroup||'성인',bodyProfile:profile.bodyProfile||{},timelineResetAt:life.timelineResetAt||profile.timelineResetAt||0,days:life.days||{},sharedScene:life.scene||null};
    if(life.directive)characterDirectives[r.id]=life.directive;
    routines[r.id]=remap(schedule.routines);monthlyRoutines[r.id]=remap(schedule.monthlyRoutines);
  }
  for(const schedule of (snapshot.schedules||[]).filter(s=>!s.cancelled))for(const cid of schedule.memberIds||[]){if(!characters[cid])continue;const shared={...schedule,withIds:schedule.memberIds.filter(id=>id!==cid),sharedScheduleId:schedule.id};if(schedule.monthly)(monthlyRoutines[cid]??=[]).push(shared);else for(const day of schedule.days||[])(routines[cid]??=[]).push({...shared,id:schedule.id+':'+day,seriesId:schedule.id,day})}
  for(const [id,draft] of Object.entries(sharedSelection(snapshot).homeDrafts||{}))if(homes[id])homes[id]={...homes[id],...draft};
  // Room ownership references must use group resident IDs, not personal IDs.
  for(const h of Object.values(homes))for(const room of Object.values(h.rooms||{})){
    for(const key of ['ownerCharacterIds','ownerIds','characterIds','allowedCharacterIds'])if(Array.isArray(room[key]))room[key]=room[key].map(id=>(snapshot.residents||[]).find(r=>r.ownerUid===h.ownerUid&&r.sourceCharacterId===id)?.id||id);
  }
  for(const p of snapshot.perceptions||[]){if(characters[p.sourceId]&&characters[p.targetId]){characterViews[p.sourceId]??={};characterViews[p.sourceId][p.targetId]=decodeShared(p.viewJson)}}
  for(const h of Object.values(homes)){h.activeFloor=sharedSelection(snapshot).floors?.[h.id]||h.activeFloor||1}
  const activeId=sharedSelection(snapshot).routineCharacter&&characters[sharedSelection(snapshot).routineCharacter]?sharedSelection(snapshot).routineCharacter:snapshot.selectedResidentId&&characters[snapshot.selectedResidentId]?.townId===activeTownId?snapshot.selectedResidentId:Object.keys(characters).find(id=>characters[id].townId===activeTownId);
  return {...base,catalog:{...base.catalog,...Object.fromEntries((snapshot.catalog||[]).map(c=>[c.id,c.items||[]]))},relationships:Object.fromEntries((snapshot.relationships||[]).map(r=>[r.id,r])),characters,order:Object.keys(characters),homes,towns,world:towns.find(t=>t.id===activeTownId)||base.world,activeTownId,activeId,
    characterDirectives,characterViews,characterGroups:snapshot.characterGroups||[],activeHomeId:snapshot.visitingHomeId||characters[activeId]?.homeId||Object.keys(homes)[0],routines,monthlyRoutines,uiLanguage:language,
    sharedContext:{groupId:group.id||snapshot.activeGroupId},lastSaved:Number(group.lifeUpdatedAt)||0};
}
export function withSharedWorld(snapshot,run){
  const world=buildSharedWorld(snapshot,state.uiLanguage);
  const selection=sharedSelection(snapshot),uid=globalThis.window?.ParallelCityAuth?.getInfo?.()?.user?.uid;
  world.characterViewSource=selection.source||world.order.find(id=>world.characters[id].ownerUid===uid)||world.order[0];
  world.characterViewTarget=selection.target||world.order.find(id=>id!==world.characterViewSource);
  world.activeTab=state.activeTab;world.homeEditMode=!!selection.homeEditMode;
  for(const key of ['animationIntensity','routineView','routineMonth','homeVisualMode','homeSdScale','homeLdScale','homeUiTheme','uiFont','uiScale'])world[key]=state[key];
  return runIsolatedWorld(world,()=>run(world));
}
