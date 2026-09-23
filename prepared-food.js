import {needsAt} from './life-needs.js';
export const FOOD_LIFETIME=18*3600000;
export const foodRemaining=(dish,now=Date.now())=>Math.max(0,Number(dish.remaining??FOOD_LIFETIME)-Math.max(0,now-Number(dish.updatedAt||dish.createdAt))/(dish.storage==='fridge'?4:1));
export const foodSpoiled=(dish,now=Date.now())=>foodRemaining(dish,now)<=0;
export function preparedFoods(world){return Object.values(world.characters||{}).flatMap(c=>(c.cooking?.dishes||[]).map(dish=>({dish,owner:c})))}
export function placeCookedFood(world,c,job){
 const data=c.cooking;data.dishes??=[];if(data.dishes.some(d=>d.id===job.id))return;
 const home=world.homes?.[job.homeId],room=home?.rooms?.[job.room],table=room?.furniturePlacements?.find(p=>/카운터|조리대|식탁|탁자|counter|table/i.test(p.item||''));
 data.dishes.push({id:job.id,recipeId:job.recipeId,createdAt:job.endsAt,updatedAt:job.endsAt,remaining:FOOD_LIFETIME,storage:'room',homeId:job.homeId,room:job.room,furnitureId:table?.id||'',x:Math.max(5,Math.min(95,Number(table?.x)||50)),y:Math.max(5,Math.min(95,Number(table?.y)||65))});
}
const access=(c,home)=>c.homeId===home.id||c.residences?.some(r=>r.homeId===home.id)||home.residents?.includes(c.id);
export function actOnFood(world,actorId,dishId,action,options={},now=Date.now()){
 const actor=world.characters?.[actorId],found=preparedFoods(world).find(x=>x.dish.id===dishId);if(!actor||!found)throw Error('food-missing');
 const {dish,owner}=found,home=world.homes?.[dish.homeId];if(!home||!access(actor,home))throw Error('food-access');
 if(!['eat','discard','move','fridge'].includes(action))throw Error('food-action');
 if(action==='eat'&&foodSpoiled(dish,now))throw Error('food-spoiled');
 if(action==='discard'&&actor.id!==owner.id)throw Error('food-owner');
 if(action==='eat'||action==='discard'){
  owner.cooking.dishes=owner.cooking.dishes.filter(d=>d.id!==dish.id);owner.cooking.inventory??={};owner.cooking.inventory[dish.recipeId]=Math.max(0,(Number(owner.cooking.inventory[dish.recipeId])||0)-1);
  if(action==='eat'){actor.lifeNeeds={...actor.lifeNeeds,...needsAt(actor,now),updatedAt:now};actor.lifeNeeds.hunger=Math.min(100,actor.lifeNeeds.hunger+65);}
  return true;
 }
 const roomKey=String(options.room||dish.room),room=home.rooms?.[roomKey];if(!room)throw Error('food-room');
 const placements=room.furniturePlacements||[],surface=options.furnitureId?placements.find(p=>p.id===options.furnitureId):null;
 if(action==='fridge'&&!placements.some(p=>/냉장고|refrigerator|fridge|冷蔵庫/i.test(p.item||'')))throw Error('food-fridge');
 if(options.furnitureId&&!surface)throw Error('food-surface');
 dish.remaining=foodRemaining(dish,now);dish.updatedAt=now;dish.storage=action==='fridge'?'fridge':'room';dish.room=roomKey;dish.furnitureId=surface?.id||'';dish.x=Math.max(5,Math.min(95,Number(surface?.x??options.x??dish.x)||50));dish.y=Math.max(5,Math.min(95,Number(surface?.y??options.y??dish.y)||65));return true;
}
