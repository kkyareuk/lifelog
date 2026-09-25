import {roomActivityKey} from './room-activities.js?v=20260909dev305';
import {needDuration} from './need-pacing.js';
// Persist the episode rather than deriving its start from a render or minute boundary.
export function toiletActivity(c,scene,now,language='ko'){
 if(!scene||scene.transit||scene.meetingWaiting||scene.meetingJourney||roomActivityKey(scene)!=='toilet')return scene;
 const key=scene.manualDirectiveId||[new Date(now).toDateString(),scene.visitHomeId||c.homeId,scene.placeId,scene.room,scene.recoveryStartedAt||scene.minute,scene.baseTitle||scene.title].join(':');
 if(c.toiletEpisode?.key!==key){const duration=needDuration(c,'toilet'),end=scene.recoveryEndsAt&&scene.recoveryEndsAt<=now+duration?scene.recoveryEndsAt:now+duration;c.toiletEpisode={key,start:end-duration,end};}
 const {start,end}=c.toiletEpisode;
 if(now<end)return {...scene,lifeTaskId:'toilet',needKey:'toilet',activityStartedAt:start,activityEndsAt:end,recoveryStartedAt:start,recoveryEndsAt:end};
 const texts={ko:['화장실 사용을 마친 뒤 쉬는 중','화장실 사용을 마치고 잠시 숨을 고르고 있어요.'],en:['Taking a break after using the toilet','They have finished using the toilet and are taking a brief break.'],ja:['お手洗いの後にひと休み中','お手洗いを済ませて、少しひと息ついています。']},[title,desc]=texts[language]||texts.ko;
 return {...scene,title,desc,baseTitle:title,baseDesc:desc,lifeTaskId:undefined,lifeTask:undefined,needKey:undefined,actionKind:'rest',activityFamily:'rest',activityStartedAt:undefined,activityEndsAt:undefined,recoveryStartedAt:undefined,recoveryEndsAt:undefined};
}
