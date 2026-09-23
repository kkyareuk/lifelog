import {planMeetingJourney,meetingScene} from './meeting-journey.js?v=20260909dev305';
import {isHomeSleepScene} from './home-simulation.js?v=20260909dev305';
import {scheduledSleeping} from './sleep-clock.js';
import {preparedFoods,foodSpoiled,actOnFood} from './prepared-food.js';
import {needsAt} from './life-needs.js';
import {savedRecipeById} from './cooking.js';
import {recipeName} from './recipe-localizations.js';
const text=(lang,ko,en,ja)=>({ko,en,ja}[lang]||ko);
export function householdScene(world,c,scene,now){
 const data=c.household??={},active=data.active,lang=world.uiLanguage||'ko';
 if(active&&now>=active.endsAt){if(active.action==='eat')c.lifeNeeds={...c.lifeNeeds,...needsAt(c,now),hunger:100,updatedAt:now,recovering:[],activeNeed:'',recoveryEndsAt:0};data.returning={journey:planMeetingJourney(world,c,c,active.endsAt,{home:true,visitHomeId:active.homeId,room:active.room,meetingLocation:active.journey?.to},scheduledSleeping(c,new Date(now))&&isHomeSleepScene(active.origin)?active.origin:scene)};data.returning.endsAt=data.returning.journey.arrivesAt;delete data.active;data.lastAt=now;}
 if(data.active&&world.characterDirectives?.[c.id]?.startedAt>(data.active.requestedAt||data.active.startedAt))delete data.active;
 if(data.returning){if(world.characterDirectives?.[c.id]?.startedAt>data.returning.journey.startedAt||now>=data.returning.endsAt)delete data.returning;else return movingScene(scene,data.returning,c,now,lang);}
 if(!data.active&&!isHomeSleepScene(scene)&&!scheduledSleeping(c,new Date(now))&&!scene.manualDirective&&!scene.routineId&&!scene.transit&&!scene.sleeping&&!scene.groupInteraction&&(!scene.needKey||scene.needKey==='hunger')&&scene.home&&now-(data.lastAt||0)>60000){
  const homeId=scene.visitHomeId||c.homeId,home=world.homes?.[homeId],foods=preparedFoods(world).filter(x=>x.dish.homeId===homeId);
  const fridge=Object.entries(home?.rooms||{}).find(([,r])=>r.furniturePlacements?.some(p=>/냉장고|fridge|refrigerator/i.test(p.item)));
  const spoiled=foods.find(x=>foodSpoiled(x.dish,now)&&x.dish.storage!=='lunchbox');
  const edible=foods.find(x=>!foodSpoiled(x.dish,now)&&(x.dish.storage!=='lunchbox'||x.dish.holderId===c.id));
  const unclaimed=foods.find(x=>x.dish.storage==='room'&&now-x.dish.createdAt>30000&&!foodSpoiled(x.dish,now));
  const hungry=Object.values(world.characters||{}).some(p=>p.homeId===homeId&&needsAt(p,now).hunger<65);
  try{
   if(spoiled&&!c.autonomousActivityBlocks?.includes('chores'))actOnFood(world,c.id,spoiled.dish.id,'discard',{},now);
   else if(edible&&needsAt(c,now).hunger<60&&!c.autonomousActivityBlocks?.includes('eating'))actOnFood(world,c.id,edible.dish.id,'eat',{},now);
   else if(unclaimed&&fridge&&!hungry&&!c.autonomousActivityBlocks?.includes('chores')){
    const work=c.employment||c.employments?.[0],morning=new Date(now).getHours();
    if(work&&morning>=6&&morning<9&&!foods.some(x=>x.dish.holderId===c.id&&x.dish.storage==='lunchbox'))actOnFood(world,c.id,unclaimed.dish.id,'pack',{},now);
    else actOnFood(world,c.id,unclaimed.dish.id,'fridge',{room:fridge[0]},now);
   }
  }catch{/* Another character may have reserved the serving. */}
 }
 const job=data.active;if(!job)return scene;
 if(job.journey&&now<job.startedAt)return movingScene(scene,job,c,now,lang);
 if(job.action==='eat'&&!job.recoveryStarted){c.lifeNeeds={...c.lifeNeeds,...needsAt(c,job.startedAt),updatedAt:job.startedAt,recovering:['hunger'],activeNeed:'hunger',needStartedAt:job.startedAt,recoveryEndsAt:job.endsAt};job.recoveryStarted=true;}

 const recipe=savedRecipeById(job.recipeId,world,job),name=recipe?recipeName(recipe,lang):text(lang,'음식','food','料理');
 const copy={
 eat:[name+' 먹는 중','Eating '+name,name+'を食べています'],
 fridge:['남은 음식을 냉장고에 넣고 있어요','Putting leftovers in the refrigerator','残った料理を冷蔵庫に入れています'],
 pack:['음식을 도시락에 담고 있어요','Packing a lunchbox','料理をお弁当箱に詰めています'],
 discard:['음식을 치우는 중','Clearing away food','料理を片付けています']
 }[job.action]||[];
 const title=copy[{ko:0,en:1,ja:2}[lang]||0],desc=job.action==='eat'?text(lang,'한 입씩 맛을 음미하며 식사하고 있어요.','They enjoy the flavor, one bite at a time.','一口ずつ味わいながら食事をしています。'):job.action==='discard'?text(lang,'상태를 확인하고 음식을 치우고 있어요.','They check the food and clear it away.','状態を確かめて料理を片付けています。'):title;
 return {...scene,sleeping:false,transit:false,groupInteraction:false,withId:undefined,withIds:[],furniture:undefined,meetingFurniture:undefined,needKey:undefined,recoveryStartedAt:undefined,recoveryEndsAt:undefined,home:true,visitHomeId:job.homeId,room:job.room,title,desc,baseTitle:title,baseDesc:desc,activityStartedAt:job.startedAt,activityEndsAt:job.endsAt,householdActivity:true,manualDirective:true,actionKind:job.action==='eat'?'eating':'chores',activityFamily:job.action==='eat'?'eating':'chores',...(job.action==='eat'?{needKey:'hunger',recoveryStartedAt:job.startedAt,recoveryEndsAt:job.endsAt}:{})};
}

function movingScene(scene,task,c,now,lang){
 const moving=meetingScene({...scene,sleeping:false,actionKind:'walk',activityFamily:'walking',needKey:undefined,recoveryStartedAt:undefined,recoveryEndsAt:undefined,furniture:undefined,meetingFurniture:undefined},task,c.id,now,lang);
 return {...moving,householdActivity:true,activityStartedAt:task.journey.startedAt,activityEndsAt:task.journey.arrivesAt,recoveryEndsAt:undefined};
}
