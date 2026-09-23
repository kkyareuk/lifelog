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
// Choose a different kind of activity before choosing different wording.
// If settings leave no unused family, retain valid choices rather than ignoring settings.
export function diverseHomePool(scripts,recent,peers){
 if(!scripts.length)return scripts;
 const kind=script=>roomActivityKey({title:script[0],...(script[4]||{})});
 const exact=s=>peers.some(({scene})=>scene.narrativeKey===homeNarrativeKey(s)||(scene.baseTitle||scene.title)===s[0]);
 const cost=s=>peers.filter(({scene})=>roomActivityKey(scene)===kind(s)).length*10+(recent.slice(0,2).some(e=>roomActivityKey(e)===kind(s))?3:0)+(exact(s)?100:0);
 const min=Math.min(...scripts.map(cost));
 return scripts.filter(s=>cost(s)===min);
}
