import {recipeName} from './recipe-localizations.js';
import {recipeDurations,cookingStepAt} from './cooking-timing.js';
import {RECIPES} from './recipes.js';
import {BASE_MEAL,ensureWallet,payActivity} from './character-money.js';
import {characterTown,historicalTown} from './town-setting.js';
export const recipeById=id=>RECIPES.find(r=>r.id===id);
export function cookingLevel(c){return Math.max(1,Math.min(5,1+Math.floor((Number(c?.cooking?.experience)||0)/10)))}
const preindustrialRecipes=new Set(['miyeokguk','bulgogi','galbijjim','yakgwa','miso_shiru','onigiri','tamagoyaki','chawanmushi','tempura','kitsune_udon','mitarashi_dango','focaccia']);
export function recipeAllowed(town,recipe){return !!recipe&&(!historicalTown(town)||recipe.cuisine==='medieval'||town?.era!=='medieval'&&preindustrialRecipes.has(recipe.id))}
export function cookingState(c){return c.cooking??={experience:0,inventory:{},history:[],requests:[],active:null}}
export function cookingProgress(job,now=Date.now()){
 const recipe=recipeById(job?.recipeId);if(!recipe)return null;
 const elapsed=Math.max(0,now-job.startedAt),{step,total}=cookingStepAt(job,recipe,now);
 return {recipe,step,waiting:now<job.startedAt,complete:now>=job.endsAt,fraction:Math.min(1,elapsed/total)};
}
export function canStartCooking(world,c,recipeId,now=Date.now()){
 const r=recipeById(recipeId);if(!r||!recipeAllowed(characterTown(world,c),r))return 'cooking-era';
 if(cookingLevel(c)<r.level)return 'cooking-level';
 if(c.cooking?.active&&now<c.cooking.active.endsAt)return 'cooking-busy';
 return '';
}
export function startCooking(world,c,directive,recipeId,requestId,now){
 const r=recipeById(recipeId),error=canStartCooking(world,c,recipeId,now);if(error)return false;
 const home=world.homes?.[directive.homeId],room=home?.rooms?.[directive.room];
 if(!room||!['kitchen','주방'].includes(room.type||directive.room))return false;
 if(typeof requestId!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId))return false;
 const old=c.cooking;if(old?.requests?.includes(requestId))return false;
 // Creating a wallet here explicitly opts a multiplayer cook into ingredient costs.
 ensureWallet(c,now);const amount=Math.round(r.cost.home*BASE_MEAL);
 if(!payActivity(world,[c.id],amount,'recipe:'+requestId,now,'split'))return false;
 const data=cookingState(c),startedAt=Math.max(now,Number(directive.journey?.arrivesAt)||now),stepDurations=recipeDurations(r),endsAt=startedAt+stepDurations.reduce((a,b)=>a+b,0);
 data.active={id:requestId,recipeId:r.id,startedAt,endsAt,stepDurations,cost:amount,directiveId:directive.id,homeId:directive.homeId,room:directive.room};
 data.requests=[...(data.requests||[]),requestId].slice(-200);
 directive.cookingId=requestId;directive.endsAt=endsAt;
 for(const language of ['ko','en','ja']){const name=recipeName(r,language);directive.copy[language]={title:({ko:name+' 만들기',en:'Cooking '+name,ja:name+'を作っています'})[language],desc:({ko:'재료를 준비해 '+name+'의 조리 과정을 차례로 진행하고 있어요.',en:'They prepare the ingredients and follow each step for '+name+'.',ja:'材料を用意し、'+name+'の工程を順番に進めています。'})[language]}}
 return true;
}
export function finishCooking(world,c,now){
 const data=c.cooking,job=data?.active;if(!job||now<job.endsAt)return false;
 const recipe=recipeById(job.recipeId);if(!recipe)return false;
 data.inventory??={};data.inventory[recipe.id]=Math.min(99,(Number(data.inventory[recipe.id])||0)+1);
 data.experience=Math.min(100000,(Number(data.experience)||0)+1);
 data.history=[{...job,completedAt:job.endsAt},...(data.history||[])].slice(0,30);
 data.active=null;return true;
}
