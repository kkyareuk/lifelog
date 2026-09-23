import {roomActivityKey} from './room-activities.js?v=20260909dev305';
export function privateRoomOccupant(world,c,homeId,room,sceneFor){
 return Object.values(world.characters||{}).find(other=>{
  if(other.id===c.id)return false;
  const scene=sceneFor(other);
  if(!scene?.home||scene.meetingJourney||scene.transit||(scene.visitHomeId||other.homeId)!==homeId||scene.room!==room)return false;
  if([scene.withId,...(scene.withIds||[])].includes(c.id))return false;
  return ['hygiene','toilet','affection'].includes(roomActivityKey(scene));
 });
}
export function respectRoomPrivacy(world,c,scene,sceneFor,canEnter=()=>true){
 if(!scene?.home||scene.manualDirective||scene.meetingJourney||scene.transit)return scene;
 const homeId=scene.visitHomeId||c.homeId,home=world.homes?.[homeId];
 if(!home||!privateRoomOccupant(world,c,homeId,scene.room,sceneFor))return scene;
 const previous=home.lifeSimulation?.agents?.[c.id]?.roomKey;
 const rooms=Object.keys(home.rooms).sort((a,b)=>Number(b===previous)-Number(a===previous));
 const room=rooms.find(key=>key!==scene.room&&canEnter(home.rooms[key])&&!privateRoomOccupant(world,c,homeId,key,sceneFor));
 if(!room)return {...scene,roomActivityBlocked:true};
 const copy=({ko:['다른 방에서 잠시 쉬는 중','사적인 시간을 보내는 사람을 방해하지 않고 다른 방에서 쉬고 있어요.'],en:['Resting in another room','They are resting elsewhere to give the other person privacy.'],ja:['別の部屋で休んでいます','相手の私的な時間を邪魔しないよう、別の部屋で休んでいます。']})[world.uiLanguage||'ko'];
 return {...scene,room,title:copy[0],desc:copy[1],baseTitle:copy[0],baseDesc:copy[1],localizedCopy:undefined,actionKind:'rest',meetingKind:undefined,furniture:undefined,meetingFurniture:undefined,needKey:undefined,lifeTaskId:undefined,sleeping:false,groupInteraction:false,withId:undefined,withIds:[],homeEncounter:null,recoveryStartedAt:undefined,recoveryEndsAt:0,privacyWaiting:true};
}
