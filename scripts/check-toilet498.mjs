import assert from 'node:assert/strict';
import {toiletActivity} from '../toilet-activity.js';
import {needDuration} from '../need-pacing.js';
import {advanceNeeds,needsAt,urgentNeed} from '../life-needs.js';
import {activityTiming,activityProgressMarkup} from '../activity-progress.js';
const now=Date.now(),scene={title:'용변을 보는 중',lifeTaskId:'toilet',home:true,room:'bath',minute:123};
for(let i=0;i<100;i++){
 const c={id:String(i),homeId:'home',needSettings:{duration:i%2?2:.5},lifeNeeds:{toilet:0,updatedAt:now,sleep:90,hunger:90,hygiene:90,social:90}};
 const duration=needDuration(c,'toilet');assert(duration>=7000&&duration<=15000);
 const start=toiletActivity(c,scene,now);assert.deepEqual(activityTiming({},c,start),{start:now,end:now+duration});
 assert(activityProgressMarkup({uiLanguage:'ko'},c,start).includes('role="progressbar"'));
 advanceNeeds(c,start,now);assert(needsAt(c,now+duration/2).toilet>=49.9);assert.equal(urgentNeed(c,now+duration-1),'toilet');
 const restored=JSON.parse(JSON.stringify(c));assert.equal(toiletActivity(restored,scene,now+1000).activityStartedAt,now);
 assert.equal(toiletActivity(restored,scene,now+duration-1).lifeTaskId,'toilet');
 assert.equal(toiletActivity(restored,scene,now+duration).actionKind,'rest');assert(needsAt(c,now+duration).toilet>99.99);
 assert.equal(toiletActivity(restored,scene,now+duration+2000).activityStartedAt,undefined,'completed episode must not restart on redraw');
 assert.equal(toiletActivity(c,{...scene,manualDirectiveId:'next'},now+duration+3000).activityStartedAt,now+duration+3000);
 assert.equal(toiletActivity(c,{...scene,transit:true},now).activityStartedAt,undefined,'no progress during travel');
}
console.log('PASS 498: toilet 7–15 sec; timing/progress, realtime need recovery, reload, completion, no restart, travel');
