import {needsAt} from './life-needs.js';
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
  const spoiled=preparedFoods(world).filter(x=>x.dish.homeId===home.id&&x.dish.storage==='fridge'&&foodSpoiled(x.dish,now));
  for(const {dish,owner}of spoiled){owner.cooking.dishes=owner.cooking.dishes.filter(d=>d.id!==dish.id);owner.cooking.inventory??={};owner.cooking.inventory[dish.recipeId]=Math.max(0,(owner.cooking.inventory[dish.recipeId]||0)-1);}
  if(spoiled.length)beginFoodTask(world,actor,spoiled[0].dish,'discard',now);return true;
 }
 const actor=world.characters?.[actorId],found=preparedFoods(world).find(x=>x.dish.id===dishId);if(!actor||!found)throw Error('food-missing');
 const {dish,owner}=found,home=world.homes?.[dish.homeId];if(!home||!access(actor,home))throw Error('food-access');
 if(!['eat','discard','move','fridge','pack'].includes(action))throw Error('food-action');
 if(action==='eat'&&foodSpoiled(dish,now))throw Error('food-spoiled');
 if(dish.storage==='lunchbox'&&dish.holderId!==actorId)throw Error('food-owner');
 if(actor.household?.active?.endsAt>now||actor.cooking?.active?.endsAt>now)throw Error('food-busy');
 if(action==='eat'||action==='discard'){
  owner.cooking.dishes=owner.cooking.dishes.filter(d=>d.id!==dish.id);owner.cooking.inventory??={};owner.cooking.inventory[dish.recipeId]=Math.max(0,(Number(owner.cooking.inventory[dish.recipeId])||0)-1);
  if(action==='eat'){actor.lifeNeeds={...actor.lifeNeeds,...needsAt(actor,now),updatedAt:now,recovering:['hunger'],activeNeed:'hunger',needStartedAt:now,recoveryEndsAt:now+30000};}
  beginFoodTask(world,actor,dish,action,now);
  return true;
 }
 if(action==='pack'){if(foodSpoiled(dish,now))throw Error('food-spoiled');dish.remaining=foodRemaining(dish,now);dish.updatedAt=now;dish.storage='lunchbox';dish.holderId=actorId;beginFoodTask(world,actor,dish,action,now);return true;}
 const roomKey=String(options.room||dish.room),room=home.rooms?.[roomKey];if(!room)throw Error('food-room');
 const placements=room.furniturePlacements||[],surface=options.furnitureId?placements.find(p=>p.id===options.furnitureId):null;
 if(action==='fridge'&&!placements.some(p=>/냉장고|refrigerator|fridge|冷蔵庫/i.test(p.item||'')))throw Error('food-fridge');
 if(options.furnitureId&&!surface)throw Error('food-surface');
 dish.remaining=foodRemaining(dish,now);dish.updatedAt=now;dish.storage=action==='fridge'?'fridge':'room';dish.room=roomKey;dish.furnitureId=surface?.id||'';dish.x=Math.max(5,Math.min(95,Number(surface?.x??options.x??dish.x)||50));dish.y=Math.max(5,Math.min(95,Number(surface?.y??options.y??dish.y)||65));if(action==='fridge')beginFoodTask(world,actor,dish,action,now);return true;
}


// A prepared serving is reserved once, while its actual meal takes thirty seconds.
function beginFoodTask(world,c,dish,action,now){
 c.household??={};c.household.active={id:dish.id+':'+action+':'+now,action,recipeId:dish.recipeId,recipeSnapshot:dish.recipeSnapshot||null,homeId:dish.homeId,room:dish.room,startedAt:now,endsAt:now+(action==='eat'?30000:action==='pack'?10000:5000)};
 delete world.characterDirectives?.[c.id];
}
