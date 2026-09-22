// Game playback time, not a real-world cooking timer. Each step lasts 2–7 seconds.
export function cookingStepDuration([kind,description='']=[]){
 if(kind==='plate'||kind==='prep'||kind==='pour')return 2000;
 if(kind==='cut'||kind==='mix')return 3000;
 if(kind==='grind'||kind==='knead')return 4000;
 if(kind==='bake'||kind==='wait')return 7000;
 if(kind==='heat')return /오래|푹|뭉근|졸|조린|한 시간|몇 시간/.test(description)?7000:5000;
 if(kind==='fry')return 5000;
 return 3000;
}
export const recipeDurations=recipe=>recipe.steps.map(cookingStepDuration);
export function cookingStepAt(job,recipe,now){
 const stored=job.stepDurations;
 // Previously saved recipes used fixed 3-second steps; preserve their original clock.
 const durations=Array.isArray(stored)&&stored.length===recipe.steps.length&&stored.every(n=>Number.isFinite(n)&&n>=1000&&n<=7000)?stored:recipe.steps.map(()=>3000);
 const elapsed=Math.max(0,now-job.startedAt);let boundary=0;
 for(let index=0;index<durations.length;index++){boundary+=durations[index];if(elapsed<boundary)return {step:index,total:durations.reduce((a,b)=>a+b,0)}}
 return {step:durations.length-1,total:durations.reduce((a,b)=>a+b,0)};
}
