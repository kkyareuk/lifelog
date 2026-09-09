// A meeting stores a route once. Drawing its progress never mutates game state.
const point=(x,y)=>({x:Math.max(0,Math.min(100,Number.isFinite(Number(x))?Number(x):50)),y:Math.max(0,Math.min(100,Number.isFinite(Number(y))?Number(y):55))});
function location(world,c,scene={},position){
 const homeId=scene.home?(scene.visitHomeId||c.homeId):'',home=world.homes?.[homeId],room=scene.room&&home?.rooms?.[scene.room]?scene.room:Object.keys(home?.rooms||{})[0]||'living';
 const place=world.world?.places?.find(p=>p.id===scene.placeId),agent=home?.lifeSimulation?.agents?.[c.id];
 const value={home:Boolean(home),homeId:home?.id||homeId,room,placeId:place?.id||'',townId:scene.townId||c.townId,point:scene.goal?.point|| (agent?.roomKey===room?point(agent.x,agent.y):point(45+(String(c.id).length%3)*8,60)),map:home?point(home.mapX,home.mapY):place?point(place.x,place.y):point(scene.mapX||scene.x,scene.mapY||scene.y)};
 if(position?.homeId===homeId&&position.room===room&&Number.isFinite(position.point?.x)&&Number.isFinite(position.point?.y))value.point=point(position.point.x,position.point.y);
 if(!home&&!place&&position?.townId===value.townId&&Number.isFinite(position.map?.x)&&Number.isFinite(position.map?.y))value.map=point(position.map.x,position.map.y);
 return value;
}
export function entranceRoom(home){const rooms=Object.entries(home?.rooms||{});return rooms.find(([key,room])=>/entrance|entry|현관/i.test(key+' '+room.type+' '+room.name))?.[0]||rooms.sort((a,b)=>(Number(a[1].floor)||1)-(Number(b[1].floor)||1))[0]?.[0]||'living'}
export function planMeetingJourney(world,actor,target,now,sourceScene,targetScene,positions={}){
 const from=location(world,actor,sourceScene,positions?.[actor.id]),to=location(world,target,targetScene,targetScene?.goal||positions?.[target.id]),segments=[];let time=now;
 const add=(surface,homeId,fromRoom,toRoom,a,b,seconds)=>{segments.push({surface,homeId,fromRoom,toRoom,from:a,to:b,start:time,end:time+seconds*1000});time+=seconds*1000};
 if(from.home&&to.home&&from.homeId===to.homeId){const rooms=world.homes[from.homeId].rooms;if((Number(rooms[from.room]?.floor)||1)!==(Number(rooms[to.room]?.floor)||1)){add('home',from.homeId,from.room,from.room,from.point,{x:50,y:94},5);add('home',to.homeId,to.room,to.room,{x:50,y:94},to.point,5)}else add('home',from.homeId,from.room,to.room,from.point,to.point,10);}
 else{
  if(from.home){const entry=entranceRoom(world.homes[from.homeId]);if(from.room!==entry)add('home',from.homeId,from.room,entry,from.point,{x:50,y:65},5);add('home',from.homeId,entry,entry,from.room===entry?from.point:{x:50,y:65},{x:50,y:94},4)}
  add('town','',from.room,to.room,from.map,to.map,Math.max(12,Math.min(35,Math.hypot(from.map.x-to.map.x,from.map.y-to.map.y)/2)));
  if(to.home){const entry=entranceRoom(world.homes[to.homeId]);add('home',to.homeId,entry,entry,{x:50,y:94},to.room===entry?to.point:{x:50,y:65},4);if(entry!==to.room)add('home',to.homeId,entry,to.room,{x:50,y:65},to.point,5)}
 }
 return {actorId:actor.id,targetId:target.id,actorName:actor.name,targetName:target.name,from,to,startedAt:now,arrivesAt:time,segments};
}
export function meetingPhase(directive,now=Date.now()){
 const j=directive?.journey;if(!j||!Array.isArray(j.segments)||!j.from||!j.to||now<j.startedAt||now>=Number(directive.endsAt))return null;
 return {journey:j,segment:j.segments.find(s=>now>=s.start&&now<s.end)||null,arrived:now>=j.arrivesAt};
}
export function meetingScene(scene,directive,characterId,now=Date.now(),language='ko'){
 const phase=meetingPhase(directive,now);if(!phase)return scene;
 const {journey:j,segment,arrived}=phase,actor=j.actorId===characterId,where=actor&&!arrived&&segment?(segment?.surface==='home'?{home:true,homeId:segment.homeId,room:segment.fromRoom,townId:j.from.townId}: {home:false,townId:j.to.townId}):j.to;
 const partner=actor?j.targetName:j.actorName,copy=directive.copy?.[language]||directive.copy?.ko||{};
 const moving={ko:[`${partner}를 만나러 가는 중`,'상대가 있는 곳으로 걸어가고 있어요.'],en:[`Walking to meet ${partner}`,'They are walking to where the other character is.'],ja:[`${partner}に会いに行くところ`,'相手がいる場所へ歩いて向かっています。']}[language]||{};
 const waiting={ko:[`${partner}를 기다리는 중`,'있던 자리에서 다가오는 상대를 기다리고 있어요.'],en:[`Waiting for ${partner}`,'They are staying where they are as the other character approaches.'],ja:[`${partner}を待っているところ`,'今いる場所で、こちらに向かう相手を待っています。']}[language]||{};
 const text=directive.privacyStartled?[copy.title,copy.desc]:arrived?[copy.title,copy.desc]:!directive.targetId?({ko:['이동하는 중','할 일을 하러 걸어가고 있어요.'],en:['On the way','Walking to the activity location.'],ja:['移動中','行動する場所へ歩いています。']}[language]||moving):actor?moving:waiting;
 const nearby=actor&&arrived?{...where,point:point(where.point?.x-8,where.point?.y),map:point(where.map?.x-3,where.map?.y)}:where;
 return {...scene,title:text[0]||scene.title,desc:text[1]||scene.desc,copy:undefined,home:Boolean(where.home),visitHomeId:where.homeId||'',room:where.room||'',placeId:where.placeId||'',townId:where.townId,mood:directive.jealous?'질투':directive.privacyStartled?'놀람':arrived?(scene.mood||'평온'):'평온',transit:actor&&!arrived&&!where.home,meetingKind:directive.kind,privacyStartled:!!directive.privacyStartled,jealous:!!directive.jealous,contactRejected:!!directive.contactRejected,meetingFurniture:arrived?directive.furniture:null,meetingActorId:j.actorId,participantOrder:scene.participantOrder||j.participantOrder,groupInteraction:arrived&&Boolean(directive.targetId),withId:arrived?directive.targetId:undefined,withIds:arrived?(directive.withIds||[]).filter(id=>id!==characterId):[],meetingJourney:actor&&!arrived&&segment?{...segment,arrivesAt:j.arrivesAt}:null,meetingWaiting:!actor&&!arrived,meetingLocation:nearby,manualDirective:true};
}
export function journeyPosition(segment,now){
 const p=Math.max(0,Math.min(1,(now-segment.start)/(segment.end-segment.start)));
 return {x:segment.from.x+(segment.to.x-segment.from.x)*p,y:segment.from.y+(segment.to.y-segment.from.y)*p};
}
// Called only when a player sends a command/gift, never by an animation frame.
export function captureMeetingPositions(ids,townId){
 const positions={};
 for(const id of ids.filter(Boolean)){
  const home=[...document.querySelectorAll('[data-home-person]')].find(e=>e.dataset.homePerson===id),room=home?.closest('.room[data-room-key]');
  if(room){const r=room.getBoundingClientRect(),p=(home.querySelector('.home-person-visual')||home).getBoundingClientRect();positions[id]={homeId:room.dataset.homeId,room:room.dataset.roomKey,point:point((p.x+p.width/2-r.x)/r.width*100,(p.y+p.height/2-r.y)/r.height*100)};continue}
  const actor=[...document.querySelectorAll('.town-traveler,.meeting-walker')].find(e=>e.dataset.person===id);
  if(actor&&!actor.closest('[data-room-canvas]')){const r=actor.offsetParent?.getBoundingClientRect(),p=actor.getBoundingClientRect();if(r)positions[id]={townId,map:point((p.x+p.width/2-r.x)/r.width*100,(p.y+p.height/2-r.y)/r.height*100)}}
 }
 return positions;
}

// Ephemeral presentation routes: no position writes, and no replay on first load.
export function createEntranceTransitions(){
 let scope='',entries=new Map();
 return {
 project(world,c,scene,now,key){
  if(!c)return scene;
  if(scope!==key){scope=key;entries.clear()}
  const old=entries.get(c.id),home=s=>s?.home?(s.visitHomeId||c.homeId):'';
  let journey=old?.journey;
  if(scene.manualDirective||scene.meetingJourney||Math.abs(Date.now()-now)>120000){entries.set(c.id,{scene,seen:now});return scene}
  if(old&&old.scene!==scene&&home(old.scene)!==home(scene)&&now-old.seen<120000){journey=planMeetingJourney(world,c,c,now,old.scene,scene)}
  if(journey&&now>=journey.arrivesAt)journey=null;
  entries.set(c.id,{scene,seen:now,journey});
  if(entries.size>512)entries.delete(entries.keys().next().value);
  if(!journey)return scene;
  const moving=meetingScene(scene,{journey,endsAt:journey.arrivesAt},c.id,now,world.uiLanguage);
  return {...moving,title:({ko:'이동하는 중',en:'On the way',ja:'移動中'})[world.uiLanguage]||'이동하는 중',desc:scene.desc,groupInteraction:false};
 },
 ends(now){return [...entries.values()].flatMap(e=>e.journey?.segments.map(s=>s.end)||[]).filter(t=>t>now)}
 };
}
