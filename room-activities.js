import {autonomousActivity} from './autonomous-activities.js?v=20260909dev305';
import {LIFE_TASKS} from './life-tasks.js?v=20260909dev305';
export const ROOM_ACTIVITIES={sleep:['잠자기','Sleeping','睡眠'],eating:['식사','Eating','食事'],toilet:['용변','Using the toilet','排泄'],hygiene:['씻기','Washing','入浴・洗顔'],rest:['휴식','Resting','休憩'],reading:['독서·공부','Reading and studying','読書・勉強'],cooking:['요리','Cooking','料理'],cleaning:['청소·정리','Cleaning and tidying','掃除・整理'],games:['게임','Games','ゲーム'],music:['음악','Music','音楽'],art:['창작','Arts and crafts','創作'],exercise:['운동','Exercise','運動'],grooming:['몸단장','Grooming','身支度'],gardening:['식물 돌보기','Plant care','植物の手入れ'],digital:['전자기기','Using devices','電子機器'],collecting:['수집·전시','Collecting','収集・展示'],shopping:['쇼핑','Shopping','買い物'],talk:['대화·교류','Conversation','会話・交流'],affection:['애정 표현','Affection','愛情表現'],care:['돌봄','Caring for others','世話'],conflict:['다툼','Arguments','喧嘩'],other:['기타 활동','Other activities','その他の活動']};
export function roomActivityKey(scene={}){
 const task=LIFE_TASKS.find(t=>t.id===(scene.lifeTaskId||scene.lifeTask));
 if(task?.id==='toilet')return 'toilet';
 const group={hygiene:'hygiene',rest:'rest',food:'eating',sleep:'sleep'}[task?.group];
 const kind=scene.meetingKind||scene.actionKind||scene.kind||task?.kind;
 if(task?.id?.includes('cook'))return 'cooking';
 if(group)return group;
 if(scene.needKey)return {hunger:'eating',social:'talk'}[scene.needKey]||scene.needKey;
 if(group==='hygiene')return group;
 const key={meal:'eating',eat:'eating',eating:'eating',wash:'hygiene',rest:'rest',relax:'rest',read:'reading',study:'reading',research:'reading',chores:'cleaning',game:'games',music:'music',art:'art',exercise:'exercise',talk:'talk',hangout:'talk',debate:'talk',hug:'affection',kiss:'affection',affection:'affection',comfort:'care'}[kind];
 if(key)return key;
 if(['nap','sleep'].includes(kind)||scene.sleeping)return 'sleep';
 if(scene.needKey)return {hunger:'eating',social:'talk'}[scene.needKey]||scene.needKey;
 const title=scene.baseTitle||scene.title||'';
 if(/샤워|씻|목욕|세수|양치|wash|shower|bath|入浴|シャワー|洗顔/i.test(title))return 'hygiene';
 return ({nap:'sleep'}[autonomousActivity({...scene,manualDirective:false,routineId:null,transit:false})]||autonomousActivity({...scene,manualDirective:false,routineId:null,transit:false}))||group||(/쉬|휴식|rest|relax|休憩/i.test(title)?'rest':'other');
}
export function roomAllowedActivities(room={}){
 const all=Object.keys(ROOM_ACTIVITIES),saved=room.allowedActivities;
 if(Array.isArray(saved)&&(room.activityRulesCustom||saved.length!==all.length||!all.every(k=>saved.includes(k))))return saved;
 const type=room.type||({침실:'bedroom',욕실:'bath',화장실:'bath',주방:'kitchen',거실:'living',서재:'study',현관:'entry'})[room.name]||'other';
 const denied={bedroom:['toilet','hygiene','eating','cooking','gardening','exercise'],bath:['sleep','eating','cooking','reading','games','music','art','exercise','gardening','collecting','shopping'],bathroom:['sleep','eating','cooking','reading','games','music','art','exercise','gardening','collecting','shopping'],kitchen:['sleep','toilet','hygiene'],living:['toilet','hygiene','cooking'],study:['sleep','toilet','hygiene','cooking'],entry:['sleep','eating','toilet','hygiene','cooking','reading','games','music','art'],other:['toilet','hygiene','cooking']}[type]||['toilet','hygiene','cooking'];
 return all.filter(k=>!denied.includes(k));
}
export function roomActivityAllowed(room,scene){return roomAllowedActivities(room).includes(roomActivityKey(scene));}
export function applyRoomActivityPolicy(character,scene,world){
 if(!scene?.home||scene.transit||scene.meetingJourney||scene.meetingWaiting)return scene;
 const home=world.homes?.[scene.visitHomeId||character.homeId],room=home?.rooms?.[scene.room];
 if(!room||roomActivityAllowed(room,scene))return scene;
 const copy={ko:['다음 할 일을 기다리는 중','이 방에서 허용된 활동을 기다리고 있어요.'],en:['Waiting for the next activity','Waiting for an activity allowed in this room.'],ja:['次の行動を待っています','この部屋で許可された活動を待っています。']}[world.uiLanguage]||['다음 할 일을 기다리는 중','이 방에서 허용된 활동을 기다리고 있어요.'];
 return {...scene,title:copy[0],desc:copy[1],baseTitle:copy[0],baseDesc:copy[1],localizedCopy:undefined,roomActivityBlocked:true,sleeping:false,actionKind:undefined,meetingKind:undefined,lifeTaskId:undefined,needKey:undefined,activityFamily:undefined,groupInteraction:false,withId:undefined,withIds:[],participantOrder:[],interactionId:undefined,sharedPerspectives:undefined};
}
