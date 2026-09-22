// Game playback time, not a real-world cooking timer. New steps take 3–180 seconds.
import {cookingMotion} from './cooking-display.js';
export function cookingStepDuration([kind,description='']=[]){
 const seconds={plate:8,prep:12,cut:25,grind:35,knead:45,stir:25,mix:20,fry:75,saute:50,bake:180,boil:120,cook:90,cool:120,rest:180,microwave:60,add:10};
 return (seconds[cookingMotion([kind,description])]||12)*1000;
}
export const recipeDurations=recipe=>recipe.steps.map(cookingStepDuration);
export function cookingStepAt(job,recipe,now){
 const stored=job.stepDurations;
 // Previously saved recipes used fixed 3-second steps; preserve their original clock.
 const durations=Array.isArray(stored)&&stored.length===recipe.steps.length&&stored.every(n=>Number.isFinite(n)&&n>=1000&&n<=180000)?stored:recipe.steps.map(()=>3000);
 const elapsed=Math.max(0,now-job.startedAt);let boundary=0;
 for(let index=0;index<durations.length;index++){boundary+=durations[index];if(elapsed<boundary)return {step:index,total:durations.reduce((a,b)=>a+b,0)}}
 return {step:durations.length-1,total:durations.reduce((a,b)=>a+b,0)};
}
