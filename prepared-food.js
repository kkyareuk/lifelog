import {planMeetingJourney} from './meeting-journey.js?v=20260909dev305';
import {needsAt} from './life-needs.js';
let foodSceneResolver;
export function setFoodSceneResolver(resolve){foodSceneResolver=resolve}
const sourceFor=(world,c,now)=>foodSceneResolver?.(world,c,now)||c.sharedScene||{home:true,visitHomeId:c.homeId,room:c.sleepRoomId||'bedroom',townId:c.townId};
export const FOOD_LIFETIME=18*3600000;
export const foodRemaining=(dish,now=Date.now())=>Math.max(0,Number(dish.remaining??FOOD_LIFETIME)-Math.max(0,now-Number(dish.updatedAt||dish.createdAt))/(dish.storage==='fridge'?4:1));
export const foodSpoiled=(dish,now=Date.now())=>foodRemaining(dish,now)<=0;
export function preparedFoods(world){return Object.values(world.characters||{}).flatMap(c=>(c.cooking?.dishes||[]).map(dish=>({dish,owner:c})))}
export function placeCookedFood(world,c,job){
 const data=c.cooking;data.dishes??=[];if(data.dishes.some(d=>d.id===job.id))return;
 const home=world.homes?.[job.homeId],room=home?.rooms?.[job.room],table=room?.furniturePlacements?.find(p=>/카운터|조리대|식탁|탁자|counter|table/i.test(p.item||''));
 data.dishes.push({...(job.recipeSnapshot?{recipeSnapshot:structuredClone(job.recipeSnapshot)}:{}),id:job.id,recipeId:job.recipeId,rating:Math.max(1,Math.min(5,1+Math.floor((Number(data.experience)||0)/20))),createdAt:job.endsAt,updatedAt:job.endsAt,remaining:FOOD_LIFETIME,storage:'room',homeId:job.homeId,room:job.room,furnitureId:table?.id||'',x:Math.max(5,Math.min(95,Number(table?.x)||50)),y:Math.max(5,Math.min(95,Number(table?.y)||65))});
}
const access=(c,home)=>c.homeId===home.id||c.residences?.some(r=>r.homeId===home.id)||home.residents?.includes(c.id);
export function actOnFood(world,actorId,dishId,action,options={},now=Date.now()){
 if(action==='clearSpoiled'){
  const actor=world.characters?.[actorId],home=world.homes?.[options.homeId];if(!actor||!home||!access(actor,home))throw Error('food-access');
  if(actor.household?.active?.endsAt>now||actor.cooking?.active?.endsAt>now)throw Error('food-busy');
  const source=sourceFor(world,actor,now);
  const spoiled=preparedFoods(world).filter(x=>x.dish.homeId===home.id&&x.dish.storage==='fridge'&&foodSpoiled(x.dish,now));
  for(const {dish,owner}of spoiled){owner.cooking.dishes=owner.cooking.dishes.filter(d=>d.id!==dish.id);owner.cooking.inventory??={};owner.cooking.inventory[dish.recipeId]=Math.max(0,(owner.cooking.inventory[dish.recipeId]||0)-1);}
  if(spoiled.length)beginFoodTask(world,actor,spoiled[0].dish,'discard',now,source);return true;
 }
 const actor=world.characters?.[actorId],found=preparedFoods(world).find(x=>x.dish.id===dishId);if(!actor||!found)throw Error('food-missing');
 const {dish,owner}=found,home=world.homes?.[dish.homeId];if(!home||!access(actor,home))throw Error('food-access');
 if(!['eat','discard','move','fridge','pack'].includes(action))throw Error('food-action');
 if(action==='eat'&&foodSpoiled(dish,now))throw Error('food-spoiled');
 if(dish.storage==='lunchbox'&&dish.holderId!==actorId)throw Error('food-owner');
 if(actor.household?.active?.endsAt>now||actor.cooking?.active?.endsAt>now)throw Error('food-busy');
 const source=sourceFor(world,actor,now);
 if(action==='eat'||action==='discard'){
  owner.cooking.dishes=owner.cooking.dishes.filter(d=>d.id!==dish.id);owner.cooking.inventory??={};owner.cooking.inventory[dish.recipeId]=Math.max(0,(Number(owner.cooking.inventory[dish.recipeId])||0)-1);
  beginFoodTask(world,actor,dish,action,now,source);
  return true;
 }
 if(action==='pack'){if(foodSpoiled(dish,now))throw Error('food-spoiled');dish.remaining=foodRemaining(dish,now);dish.updatedAt=now;dish.storage='lunchbox';dish.holderId=actorId;beginFoodTask(world,actor,dish,action,now,source);return true;}
 const roomKey=String(options.room||dish.room),room=home.rooms?.[roomKey];if(!room)throw Error('food-room');
 const placements=room.furniturePlacements||[],surface=options.furnitureId?placements.find(p=>p.id===options.furnitureId):null;
 if(action==='fridge'&&!placements.some(p=>/냉장고|refrigerator|fridge|冷蔵庫/i.test(p.item||'')))throw Error('food-fridge');
 if(options.furnitureId&&!surface)throw Error('food-surface');
 dish.remaining=foodRemaining(dish,now);dish.updatedAt=now;dish.storage=action==='fridge'?'fridge':'room';dish.room=roomKey;dish.furnitureId=surface?.id||'';dish.x=Math.max(5,Math.min(95,Number(surface?.x??options.x??dish.x)||50));dish.y=Math.max(5,Math.min(95,Number(surface?.y??options.y??dish.y)||65));if(action==='fridge')beginFoodTask(world,actor,dish,action,now,source);return true;
}


// A prepared serving is reserved once, while its actual meal takes thirty seconds.
function beginFoodTask(world,c,dish,action,now,source){
 const destination={home:true,visitHomeId:dish.homeId,room:dish.room,townId:c.townId};
 const positions=globalThis.window?.ParallelCity?.getMeetingPositions?.([c.id])||{};
 const journey=planMeetingJourney(world,c,c,now,source,destination,positions);
 const arrived=journey.arrivesAt;
 c.household??={};delete c.household.returning;
 c.household.active={id:dish.id+':'+action+':'+now,action,recipeId:dish.recipeId,recipeSnapshot:dish.recipeSnapshot||null,homeId:dish.homeId,room:dish.room,requestedAt:now,origin:source,journey,startedAt:arrived,endsAt:arrived+(action==='eat'?30000:action==='pack'?10000:5000)};
 c.lifeNeeds={...c.lifeNeeds,...needsAt(c,now),updatedAt:now,recovering:[],activeNeed:'',recoveryEndsAt:0};
 delete world.characterDirectives?.[c.id];
}
