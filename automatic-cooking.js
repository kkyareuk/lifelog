import {recipeDurations} from './cooking-timing.js';
import {isHomeSleepScene} from './home-simulation.js?v=20260909dev305';
import {scheduledSleeping} from './sleep-clock.js';
import {RECIPES} from './recipes.js';
import {cookingLevel,canStartCooking} from './cooking.js';
import {recipeUnlocked} from './cooking-access.js';
import {needsAt} from './life-needs.js';
import {roomActivityKey} from './room-activities.js?v=20260909dev305';
import {preparedFoods,foodSpoiled,actOnFood} from './prepared-food.js';
export function mealWindow(now,id){
 const d=new Date(now),hour=d.getHours(),slot=hour>=6&&hour<11?'breakfast':hour>=11&&hour<15?'lunch':hour>=17&&hour<22?'dinner':'';if(!slot)return null;
 let seed=0;for(const char of `${id}:${d.toDateString()}:${slot}`)seed=(seed*31+char.charCodeAt(0))>>>0;
 const earliest={breakfast:7,lunch:12,dinner:18}[slot]*60+seed%61;if(hour*60+d.getMinutes()<earliest)return null;
 return {key:`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}:${slot}`,slot,seed};
}
export function automaticMeal(world,c,scene,now,start){
 // A wallet marks a character that has opted into the economy. Never backfill
 // missed meals or interrupt the user's command, a journey or an appointment.
 if(world.sharedContext&&!world.recipeEntitlements)return false;
 if(isHomeSleepScene(scene)||scheduledSleeping(c,new Date(now))||c.household?.returning||c.household?.active||c.library?.active||scene.needKey||['eating','cooking'].includes(roomActivityKey(scene))||!c.wallet||!scene.home||scene.manualDirective||scene.routineId||scene.dateGroup&&scene.datePurpose||scene.transit||scene.sleeping||c.cooking?.active||c.autonomousActivityBlocks?.some(x=>['eating','cooking'].includes(x)))return false;
 const window=mealWindow(now,c.id);if(!window||c.cooking?.lastAutomaticMeal===window.key||needsAt(c,now).hunger>65)return false;
 const existing=preparedFoods(world).find(({dish})=>dish.homeId===c.homeId&&!foodSpoiled(dish,now));if(existing){try{actOnFood(world,c.id,existing.dish.id,'eat',{},now);c.cooking??={};c.cooking.lastAutomaticMeal=window.key;return true}catch{return false}}
 const available=RECIPES.filter(r=>recipeUnlocked(world,c,r)&&r.level<=cookingLevel(c)&&r.cuisine!=='gourmet'&&!canStartCooking(world,c,r.id,now));
 const suitable=available.filter(r=>window.slot==='breakfast'?/죽|수프|국|빵|토스트|오트|달걀|오니기리|요거트|샌드위치/.test(r.name):window.slot==='lunch'?/밥|면|파스타|김밥|샌드위치|덮밥|스튜/.test(r.name):!/케이크|디저트|아이스크림|푸딩/.test(r.name));
 const candidates=suitable.length?suitable:available,quick=candidates.filter(r=>recipeDurations(r).reduce((a,b)=>a+b,0)<=5*60000);
 const pool=quick.length?quick:candidates,recipe=pool[window.seed%pool.length];if(!recipe)return false;
 const requestId=`auto-${c.id.slice(0,45)}-${window.key.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
 if(!start(c.id,'meal',{recipeId:recipe.id,cookingRequestId:requestId,lifeTask:'simple_cook',now,scenes:{[c.id]:scene}}))return false;
 c.cooking.lastAutomaticMeal=window.key;return true;
}
