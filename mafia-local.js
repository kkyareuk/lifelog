import engine from './mafia-local-engine.js?v=20260909dev305';
import {personalState,save} from './state.js?v=20260909dev305';
const copy=x=>JSON.parse(JSON.stringify(x));
export const personalGameGroups=()=>personalState().towns.map(t=>({id:'local:'+t.id,name:t.name}));
// These games belong to the personal save. They never create a multiplayer group.
export async function localGames(action,input,owner){
 const s=personalState(),townId=input.groupId.slice(6),town=s.towns.find(t=>t.id===townId);
 if(!town)throw Error('game-locations');
 const world=townId===s.activeTownId?s.world:town;
 const people=Object.values(s.characters).filter(c=>c.townId===townId||!c.townId&&townId===s.activeTownId);
 const locations=[...(world.places||[]).map(p=>({...copy(p),id:townId+':'+p.id,townId,image:p.exteriorImage||p.image||p.photo||'',square:/공원|광장/.test(p.type||'')})),...Object.values(s.homes).filter(h=>h.townId===townId).map(h=>({id:'home:'+h.id,homeId:h.id,townId,name:h.name,type:'집',x:h.mapX??h.x??50,y:h.mapY??h.y??50,image:h.exteriorImage||s.buildingShapes?.find(b=>b.id===h.iconPreset)?.src||'',iconPreset:h.iconPreset||'',rooms:copy(h.rooms||{}),interior:h.image||''}))];
 const stored=s.personalMafia||{},bucket=stored[townId]||{games:[],consent:people.map(c=>c.id)};
 // Work on a clone: invalid actions must not leave half-written save state.
 const data=copy(bucket),now=Date.now(),view=g=>engine.view(g,owner);
 for(const game of data.games){for(const player of game.players){const source=people.find(c=>c.id===player.id);if(source)player.icon=source.icon||source.iconImage||'';}for(const location of game.locations){const source=locations.find(l=>l.id===location.id);if(source)for(const key of ['image','iconPreset','rooms','interior'])location[key]=source[key]|| (key==='rooms'?{}:'');}}
 if(action==='readGames')return {manager:true,games:data.games.map(view),characters:people.map(c=>({id:c.id,name:c.name})),towns:[{id:townId,name:town.name,bg:world.photo||world.bg||'./world-assets/owner-forest-town.webp'}],locations,consent:data.consent};
 let g=data.games.find(g=>g.id===input.gameId);
 const participant=(c,delegated)=>({id:c.id,name:c.name,ownerUid:owner,icon:c.icon||c.iconImage||'',photo:c.photo||'',speechStyle:c.speechStyle||'',personalityTypes:c.personalityTypes||[],gameSkills:Object.fromEntries(["deceptionSkill", "intuitionSkill", "stealthSkill", "intelligenceSkill", "observationSkill", "composureSkill"].map(k=>[k,Math.max(0,Math.min(100,Number(c[k]??50)))])),traits:JSON.stringify([c.personalityTypes,c.personality,c.temperament,c.emotionalBaseline,c.angerResponse]),hobbies:JSON.stringify(c.hobbies||[]),homeId:c.homeId||'',sleep:c.sleep||'23:00',alive:true,delegated});
 if(action==='setGameConsent'){if(input.characters.some(id=>!people.some(c=>c.id===id)))throw Error('character-owner-required');data.consent=[...new Set(input.characters)];}
 else if(action==='createGame'){
  if(data.games.filter(g=>['playing','recruiting'].includes(g.status)).length>=3)throw Error('game-limit');
  if(!Number.isInteger(input.capacity)||input.capacity<4||input.capacity>10)throw Error('game-invalid-input');
  const selected=new Set(input.locations);if(selected.size<engine.targetCount(input.capacity,4)||selected.size>8||[...selected].some(id=>!locations.some(l=>l.id===id)))throw Error('game-locations');
  g={id:input.gameId,name:String(input.name).slice(0,60),hostUid:owner,type:'mafia',rulesVersion:4,drama:true,notebook:true,meetingControls:2,nightCycle:true,preparationRules:1,capacity:input.capacity,status:'recruiting',createdAt:now,players:[],mode:'live',durationMs:45000,seed:crypto.randomUUID(),map:{townId,name:town.name,bg:world.photo||world.bg||'./world-assets/owner-forest-town.webp'},locations:locations.map(l=>({...l,selected:selected.has(l.id)}))};data.games.unshift(g);data.games=data.games.slice(0,20);
 }else{
  if(!g)throw Error('game-missing');engine.advance(g,now);
  if(action==='joinGame'){const c=people.find(c=>c.id===input.characterId);if(g.status!=='recruiting'||!c)throw Error('game-invalid-action');if(g.players.some(p=>!p.delegated))throw Error('game-one-character');g.players.push(participant(c,false));}
  else if(action==='startGame'){
   if(g.status!=='recruiting')throw Error('game-already-started');
   for(const c of people.filter(c=>data.consent.includes(c.id)&&!g.players.some(p=>p.id===c.id)).slice(0,g.capacity-g.players.length))g.players.push(participant(c,true));
   if(g.players.length<4)throw Error('game-not-enough-players');g.bias={};for(const [source,targets] of Object.entries(s.characterViews||{}))for(const [target,view] of Object.entries(targets)){const terms=JSON.stringify(view);g.bias[source+':'+target]=/원한|증오|혐오/.test(terms)?6:/사랑|연인/.test(terms)?-6:/미워|싫어|질투|불편|경계/.test(terms)?3:/신뢰|친구|소중|편안/.test(terms)?-3:0;}g.deadlineAt=now+45000;engine.start(g);
  }else if(action==='submitGame'){const p=g.players.find(p=>p.id===input.characterId&&!p.delegated&&(p.alive||input.action?.kind==='skipMeeting'));if(g.status!=='playing'||g.phaseIndex!==input.phaseIndex)throw Error('game-stale-phase');if(!p)throw Error('character-owner-required');engine.submitPlayback(g,p,input.action,now);engine.advance(g,now);}
  else if(action==='cancelGame')g.status='cancelled';
  else if(action==='leaveGame'){if(g.status==='recruiting')g.players=g.players.filter(p=>p.delegated);else g.players.filter(p=>!p.delegated).forEach(p=>p.alive=false);}
  else if(action!=='advanceGame')throw Error('game-invalid-action');
 }
 if(JSON.stringify(data)!==JSON.stringify(bucket)){s.personalMafia={...stored,[townId]:data};save(true,false);}
 return g?view(g):{saved:true};
}
