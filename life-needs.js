import {roomActivityKey} from './room-activities.js?v=20260909dev305';
import {sleepNeedAfter} from './sleep-clock.js';
import {isDrinkingCoffee} from './coffee-needs.js';
export const NEEDS={sleep:['수면','Sleep','睡眠'],hunger:['허기','Hunger','空腹'],toilet:['용변','Toilet','排泄'],hygiene:['청결','Hygiene','清潔'],social:['사교','Social','交流']};
export const needLabel=(key,lang='ko')=>NEEDS[key][{ko:0,en:1,ja:2}[lang]||0];
const clamp=n=>Math.max(0,Math.min(100,Number.isFinite(Number(n))?Number(n):80));
export function blockedNeed(c,key){return (c.autonomousActivityBlocks||[]).includes(({hunger:'eating',sleep:'sleep',toilet:'toilet',hygiene:'hygiene',social:'social'})[key]);}
export function needsAt(c,now=Date.now()){
 const saved=c.lifeNeeds||{},hours=Math.max(0,Math.min(24,(now-(Number(saved.updatedAt)||now))/3600000));
 const rates={sleep:5,hunger:9,toilet:7,hygiene:4,social:3};
 const minutes=Math.max(0,Math.min(10,(Math.min(now,Number(saved.recoveryEndsAt)||now)-(Number(saved.updatedAt)||now))/60000));
 const recovery={sleep:4,hunger:8,toilet:100,hygiene:8,social:4};
 const sleepValue=sleepNeedAfter(c,clamp(saved.sleep??80),Number(saved.updatedAt)||now,now);
 return Object.fromEntries(Object.keys(NEEDS).map(key=>[key,blockedNeed(c,key)?100:key==='sleep'&&!c.needsFixed?clamp(Math.max(sleepValue,clamp(saved.sleep??80)-hours*5+((saved.recovering||[]).includes('sleep')?minutes*4:0))):clamp(clamp(saved[key]??80)-(c.needsFixed?0:hours*rates[key])+(c.needsFixed?0:(saved.recovering||[]).includes(key)?minutes*recovery[key]:0))]));
}
export function advanceNeeds(c,scene,now=Date.now()){
 const old=c.lifeNeeds,values=needsAt(c,now);
 if(old&&now<=old.updatedAt)return false;
 // Attribute elapsed time only to the previously observed action. Never give a
 // newly started action credit for an offline interval.
 const recovering=[],moving=scene?.transit||scene?.meetingJourney||scene?.meetingWaiting||scene?.roomActivityBlocked||scene?.homeEncounter&&!scene.homeEncounter.arrived;
 if(!moving){
  const activity=roomActivityKey(scene),need={sleep:'sleep',eating:'hunger',toilet:'toilet',hygiene:'hygiene'}[activity];
  if(need)recovering.push(need);
  if(isDrinkingCoffee(scene)&&!recovering.includes('sleep'))recovering.push('sleep');
  if(scene?.groupInteraction&&!scene.sleeping)recovering.push('social');
 }
 if(old&&now-old.updatedAt<60000&&JSON.stringify(old.recovering)===JSON.stringify(recovering)&&old.recoveryEndsAt===(scene?.recoveryEndsAt||0)&&Object.keys(NEEDS).every(key=>!blockedNeed(c,key)||old[key]===100))return false;
 c.lifeNeeds={...values,updatedAt:now,recovering,recoveryEndsAt:scene?.recoveryEndsAt||0,activeNeed:scene?.needKey||'',needStartedAt:scene?.needKey?(old?.activeNeed===scene.needKey?old.needStartedAt:now):0};return true;
}
export function urgentNeed(c,now=Date.now(),{allowSleep=true}={}){
 if(c.needsFixed)return '';
 const values=needsAt(c,now),current=c.lifeNeeds?.activeNeed;
 if(current&&(current!=='sleep'||allowSleep)&&!blockedNeed(c,current)&&values[current]<75)return current;
 return Object.keys(NEEDS).filter(key=>(key!=='sleep'||allowSleep)&&!blockedNeed(c,key)&&values[key]<30).sort((a,b)=>values[a]-values[b])[0]||'';
}
export function relationshipPolicy(characters,world={}){
 if(["fixed","score","dynamic"].includes(world.relationshipChangeMode))return world.relationshipChangeMode;
 const modes=characters.map(c=>c?.relationshipChangeMode||'dynamic');
 return modes.includes('fixed')?'fixed':modes.includes('score')?'score':'dynamic';
}
export function furnitureMeetingKey(home,agent){
 if(agent?.phase!=='using'||!agent.furnitureId)return '';
 const p=home?.rooms?.[agent.roomKey]?.furniturePlacements?.find(p=>p.id===agent.furnitureId);
 if(!p)return '';
 if(p.tableId)return `${agent.roomKey}:${p.tableId}`;
 if(/소파|쇼파|침대|식탁|탁자|sofa|bed|table/i.test(p.item))return `${agent.roomKey}:${p.id}`;
 return '';
}
