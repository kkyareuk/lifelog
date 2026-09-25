import {roomActivityKey} from './room-activities.js?v=20260909dev305';
import {homeNarrativeKey} from './narrative-selection.js';

export function discretionary(scene){
 return Boolean(scene&&!scene.manualDirective&&!scene.routineId&&!scene.economyWork&&!scene.transit&&!scene.returningHome&&!scene.forcedReturn&&!scene.needKey&&!scene.sleeping&&!scene.dateGroup&&!scene.groupInteraction&&!scene.withId&&!scene.withIds?.length&&!scene.giftExchange&&!scene.interactionId);
}
export function peerActivities(character,characters,day,minute){
 return Object.values(characters).filter(c=>c.id!==character.id&&c.townId===character.townId).map(c=>{
  const scene=(c.days?.[day]?.entries||[]).filter(e=>Number(e.minute)<=minute).at(-1);
  return {id:c.id,scene};
 }).filter(({scene})=>scene&&minute-Number(scene.minute)<(Number(scene.holdMinutes)||60));
}
export function duplicatedActivity(character,scene,peers){
 if(!discretionary(scene))return false;
 const key=roomActivityKey(scene);
 if(['sleep','eating','hygiene','toilet','other'].includes(key))return false;
 return peers.some(peer=>String(peer.id)<String(character.id)&&discretionary(peer.scene)&&roomActivityKey(peer.scene)===key);
}
// Reject recently used scenes before balancing activity families. Otherwise a
// small family can win the score repeatedly and starve fresh scenes in other families.
export function diverseHomePool(scripts,recent,peers){
 if(!scripts.length)return scripts;
 const kind=script=>roomActivityKey({title:script[0],...(script[4]||{})});
 const matches=(e,s)=>e.narrativeKey===homeNarrativeKey(s)||[e.title,e.baseTitle].includes(s[0])||[e.desc,e.baseDesc].some(v=>typeof v==='string'&&v.includes(s[1]));
 const fresh=scripts.filter(s=>!recent.some(e=>matches(e,s)));
 const pool=fresh.length?fresh:scripts;
 const independent=pool.filter(s=>!peers.some(({scene})=>matches(scene,s)));
 const available=independent.length?independent:pool;
 const cost=s=>peers.filter(({scene})=>roomActivityKey(scene)===kind(s)).length*10+recent.slice(0,4).reduce((sum,e,i)=>sum+(roomActivityKey(e)===kind(s)?4-i:0),0);
 const min=Math.min(...available.map(cost));
 return available.filter(s=>cost(s)===min);
}
