import {planMeetingJourney} from './meeting-journey.js';
import {roomActivityAllowed} from './room-activities.js?v=20260909dev305';
export const GROUP_ACTIVITY_KINDS=['talk','hangout','dine','tea','play_together','cook_together','study_together','read_together'];
export function groupDestination(world,actor,target,ids,kind,destination,roomAllowed){
 if(!destination?.home)return destination;
 const homeId=destination.visitHomeId||target?.homeId,home=world.homes?.[homeId];
 const people=[actor,target,...ids.map(id=>world.characters[id])];
 if(!home||people.some(c=>!c))return null;
 const allowed=([,r])=>roomActivityAllowed(r,{kind})&&people.every(c=>roomAllowed(c,home,r));
 const rooms=Object.entries(home.rooms||{}),room=rooms.find(([key,r])=>key===destination.room&&allowed([key,r]))||rooms.find(allowed);
 return room?{...destination,visitHomeId:homeId,room:room[0],...(room[0]===destination.room?{}:{goal:undefined,furniture:undefined})}:null;
}
export function planGroupActivity({world,actor,target,kind,ids,scene,destination,now,contactAllowed,roomAllowed}){
 if(ids==null)return [];
 if(!Array.isArray(ids))return null;
 if(!ids.length)return [];
 if(!target||!GROUP_ACTIVITY_KINDS.includes(kind))return null;
 const members=[...new Set(ids)].filter(id=>id!==actor.id&&id!==target?.id);
 if(members.length>6)return null;
 const result=[];
 for(const id of members){const c=world.characters[id];if(!c||c.townId!==actor.townId||!contactAllowed(actor,c,kind))return null;
  if(destination?.home){const home=world.homes?.[destination.visitHomeId||target.homeId];if(!home||!roomAllowed(c,home,home.rooms?.[destination.room]))return null;}
  result.push({character:c,journey:planMeetingJourney(world,c,target,now,scene(c),destination,{})});
 }
 return result;
}
export function groupActivityCopy(kind,names){
 const labels={talk:['함께 대화하는 중','Talking together','みんなで会話中'],hangout:['함께 시간을 보내는 중','Spending time together','みんなで過ごしています'],dine:['함께 식사하는 중','Eating together','みんなで食事中'],tea:['함께 차를 마시는 중','Having tea together','みんなでお茶を飲んでいます'],play_together:['함께 노는 중','Playing together','みんなで遊んでいます'],cook_together:['함께 요리하는 중','Cooking together','みんなで料理中'],study_together:['함께 공부하는 중','Studying together','みんなで勉強中'],read_together:['함께 책을 읽는 중','Reading together','みんなで読書中']};
 return Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:labels[kind][i],desc:names.join(' · ')}]));
}
