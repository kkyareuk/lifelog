import {needDuration,needFrequency,needVariation} from './need-pacing.js';
import {roomActivityKey} from './room-activities.js?v=20260909dev305';
import {sleepNeedAfter} from './sleep-clock.js';
import {isDrinkingCoffee,coffeeEpisode,COFFEE_DRINK_MS,COFFEE_SLEEP_GAIN} from './coffee-needs.js';
export const NEEDS={sleep:['수면','Sleep','睡眠'],hunger:['허기','Hunger','空腹'],toilet:['용변','Toilet','排泄'],hygiene:['청결','Hygiene','清潔'],social:['사교','Social','交流']};
export const needLabel=(key,lang='ko')=>NEEDS[key][{ko:0,en:1,ja:2}[lang]||0];
const clamp=n=>Math.max(0,Math.min(100,Number.isFinite(Number(n))?Number(n):80));
export function blockedNeed(c,key){return (c.autonomousActivityBlocks||[]).includes(({hunger:'eating',sleep:'sleep',toilet:'toilet',hygiene:'hygiene',social:'social'})[key]);}
const coffeeGain=(saved,now)=>saved.coffeeActive?Math.min(Number(saved.coffeeRemaining)||0,Math.max(0,Math.min(now,Number(saved.recoveryEndsAt)||now)-(Number(saved.updatedAt)||now))*COFFEE_SLEEP_GAIN/COFFEE_DRINK_MS):0;
export function needsAt(c,now=Date.now()){
 const saved=c.lifeNeeds||{},hours=Math.max(0,Math.min(24,(now-(Number(saved.updatedAt)||now))/3600000));
 const rates={sleep:5,hunger:9,toilet:7,hygiene:4,social:3};
 const minutes=Math.max(0,Math.min(10,(Math.min(now,Number(saved.recoveryEndsAt)||now)-(Number(saved.updatedAt)||now))/60000));
 const recovery=Object.fromEntries(Object.keys(NEEDS).map(key=>[key,key==='sleep'?4:100*60000/needDuration(c,key)+rates[key]*needFrequency(c,key)*needVariation(c,key)/60]));
 const sleepValue=sleepNeedAfter(c,clamp(saved.sleep??80),Number(saved.updatedAt)||now,now);
 return Object.fromEntries(Object.keys(NEEDS).map(key=>[key,blockedNeed(c,key)?100:key==='sleep'&&saved.coffeeActive&&!c.needsFixed?clamp(sleepValue+coffeeGain(saved,now)):key==='sleep'&&!c.needsFixed?clamp(Math.max(sleepValue,clamp(saved.sleep??80)-hours*5+((saved.recovering||[]).includes('sleep')?minutes*4:0))):clamp(clamp(saved[key]??80)-(c.needsFixed?0:hours*rates[key]*needFrequency(c,key)*needVariation(c,key))+(c.needsFixed?0:(saved.recovering||[]).includes(key)?minutes*recovery[key]:0))]));
}
export function advanceNeeds(c,scene,now=Date.now()){
 const old=c.lifeNeeds,values=needsAt(c,now);
 if(old&&now<old.updatedAt)return false;
 // Attribute elapsed time only to the previously observed action. Never give a
 // newly started action credit for an offline interval.
 const recovering=[],moving=scene?.transit||scene?.meetingJourney||scene?.meetingWaiting||scene?.roomActivityBlocked||scene?.homeEncounter&&!scene.homeEncounter.arrived;
 if(!moving){
  const activity=roomActivityKey(scene),need={sleep:'sleep',eating:'hunger',toilet:'toilet',hygiene:'hygiene'}[activity];
  if(need&&!isDrinkingCoffee(scene))recovering.push(need);
  if(isDrinkingCoffee(scene)&&!recovering.includes('sleep'))recovering.push('sleep');
  if(scene?.groupInteraction&&!scene.sleeping)recovering.push('social');
 }
 const coffeeActive=!moving&&isDrinkingCoffee(scene),coffeeKey=coffeeActive?coffeeEpisode(scene):old?.coffeeKey||'',sameCoffee=coffeeKey&&coffeeKey===old?.coffeeKey;
 const coffeeRemaining=sameCoffee?Math.max(0,(Number(old.coffeeRemaining)||0)-coffeeGain(old,now)):coffeeActive?COFFEE_SLEEP_GAIN:Number(old?.coffeeRemaining)||0;
 const coffeeEnd=coffeeActive?(sameCoffee?(old.coffeeEndsAt||old.recoveryEndsAt):Math.min(Number(scene?.recoveryEndsAt)||now+COFFEE_DRINK_MS,now+COFFEE_DRINK_MS)):scene?.recoveryEndsAt||0;
 const activeNeed=scene?.needKey||'',startedAt=activeNeed?(Number(scene.recoveryStartedAt)||needRecoveryStart(c,activeNeed,now)):0;
 if(old&&old.coffeeKey===coffeeKey&&old.coffeeActive===coffeeActive&&now-old.updatedAt<60000&&old.activeNeed===activeNeed&&old.needStartedAt===startedAt&&JSON.stringify(old.recovering)===JSON.stringify(recovering)&&old.recoveryEndsAt===coffeeEnd&&Object.keys(NEEDS).every(key=>!blockedNeed(c,key)||old[key]===100))return false;
 c.lifeNeeds={...values,updatedAt:now,recovering,recoveryEndsAt:coffeeEnd,activeNeed,needStartedAt:startedAt,coffeeActive,coffeeKey,coffeeRemaining,coffeeEndsAt:coffeeActive?coffeeEnd:old?.coffeeEndsAt||0,coffeeLastAt:coffeeActive?(sameCoffee?old.coffeeLastAt:now):old?.coffeeLastAt||0};return true;
}
// A completed recovery is not the next meal's start time (including after reload).
export function needRecoveryStart(c,key,now){const old=c.lifeNeeds;return old?.activeNeed===key&&Number(old.recoveryEndsAt)>now&&Number(old.needStartedAt)>0?Number(old.needStartedAt):now;}
export function urgentNeed(c,now=Date.now(),{allowSleep=true}={}){
 if(c.needsFixed)return '';
 const values=needsAt(c,now),current=c.lifeNeeds?.activeNeed;
 if(current&&(current!=='sleep'||allowSleep)&&!blockedNeed(c,current)&&values[current]<(current==='hunger'?100:75)&&Number(c.lifeNeeds.recoveryEndsAt)>now)return current;
 return Object.keys(NEEDS).filter(key=>(key!=='sleep'||allowSleep)&&!(key==='sleep'&&now-(c.lifeNeeds?.coffeeLastAt||0)<30*60000&&(!c.lifeNeeds?.coffeeActive||now>=Number(c.lifeNeeds?.recoveryEndsAt)))&&!blockedNeed(c,key)&&values[key]<30).sort((a,b)=>values[a]-values[b])[0]||'';
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
