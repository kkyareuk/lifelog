import {roomEntryAllowed} from './room-permissions.js?v=20260909dev305';
import {roomActivityAllowed} from './room-activities.js?v=20260909dev305';
import {participantSchedules} from './weekly-timetable.js';
import {SOCIAL_LOGS} from './gathering-logs.js';
export const GATHERING_ACTIVITIES={talk:['💬','이야기 나누기','Have a chat','おしゃべり'],cook:['🥣','간식 함께 만들기','Make a snack','おやつ作り'],game:['🎲','보드게임 하기','Play a board game','ボードゲーム'],movie:['🎬','영상 함께 보기','Watch a video','動画鑑賞'],comfort:['🌷','마음 살피기','Check in on someone','気持ちを気遣う']};
export const gatheringText=(values,language='ko')=>values[{ko:0,en:1,ja:2}[language]||0];
const hash=s=>[...s].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7);
export const socialInterval=scene=>Math.max(10,Math.ceil((Number(scene.routineEndMinute)-Number(scene.routineStartMinute))/12));
export const isSocialRoutine=type=>['모임','친구 약속','가족 일정'].includes(type);
export function socialScheduleRows(world,characterId){
 const c=world.characters?.[characterId];if(!c)return [];
 return [...participantSchedules(world,c).map(r=>({...r,monthly:false})),...participantSchedules(world,c,true).map(r=>({...r,monthly:true}))].filter(r=>isSocialRoutine(r.type));
}
export function scheduledSocialScene(scene,character,world,now=Date.now(),language=world.uiLanguage){
 if(!isSocialRoutine(scene.routineType)||scene.transit||scene.routineReturned||scene.returningHome||scene.manualDirective)return scene;
 const d=new Date(now),m=d.getHours()*60+d.getMinutes()+d.getSeconds()/60,start=Number(scene.routineStartMinute),end=Number(scene.routineEndMinute);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||m<start||m>=end)return scene;
 const home=world.homes?.[scene.visitHomeId||character.homeId],room=home?.rooms?.[scene.room];
 const ids=[...new Set(scene.participantOrder||[character.id,...scene.withIds||[]])].filter(id=>world.characters?.[id]&&(!scene.home||roomEntryAllowed(world.characters[id],home,room))).sort();
 if(ids.length<2||!ids.includes(character.id))return scene;
 const slot=Math.floor((m-start)/socialInterval(scene)),seed=hash(scene.routineId+':'+d.toDateString()),kinds=Object.keys(GATHERING_ACTIVITIES);
 const candidates=[],pool=ids.slice((slot*2)%ids.length).concat(ids.slice(0,(slot*2)%ids.length)).slice(0,8);
 for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){
 const a=world.characters[pool[i]],b=world.characters[pool[j]];
 const allowed=kinds.filter(k=>{const family={talk:'talk',cook:'cooking',game:'games',movie:'digital',comfort:'care'}[k];return [a,b].every(c=>!c.autonomousActivityBlocks?.includes(family))&&(!scene.home||Object.values(home?.rooms||{}).some(r=>ids.every(id=>roomEntryAllowed(world.characters[id],home,r))&&roomActivityAllowed(r,{activityFamily:family,title:k})))});
 if(allowed.length)candidates.push({a,b,allowed});
 }
 if(!candidates.length)return scene;
 const {a,b,allowed}=candidates[(seed+slot)%candidates.length],kind=allowed[(seed+slot)%allowed.length],rel=Object.values(world.relationships||{}).find(r=>r.temporalStatus!=='past'&&[r.a,r.b].includes(a.id)&&[r.a,r.b].includes(b.id));
 const temperament=hash(String(a.socialStyle)+':'+String(b.planningStyle));
 let outcome=SOCIAL_LOGS[kind][(seed+Math.floor(slot/allowed.length)+temperament)%SOCIAL_LOGS[kind].length].id;
 if(slot===0)outcome='arrival';else if(m>=end-10&&end-start>20)outcome='farewell';else if(Number(rel?.conflict)>65&&slot%3===1)outcome='space';
 const observerId=ids.find(id=>![a.id,b.id].includes(id))||'';
 const event={kind,actorId:a.id,targetId:b.id,outcome,observerId,observer:observerId&&Number(world.characters[observerId].socialEnergy)>3?'join':'watch'};
 const family={talk:'talk',cook:'cooking',game:'games',movie:'digital',comfort:'care'}[kind],chosenRoom=scene.home?Object.entries(home.rooms).find(([,r])=>ids.every(id=>roomEntryAllowed(world.characters[id],home,r))&&roomActivityAllowed(r,{activityFamily:family,title:kind}))?.[0]:scene.room;
 return {...scene,minute:start+slot*socialInterval(scene),interactionId:String(scene.interactionId||scene.routineId).split(':social:')[0]+':social:'+slot,room:chosenRoom||scene.room,participantOrder:ids,withId:ids.find(id=>id!==character.id),withIds:ids.filter(id=>id!==character.id),...gatheringEventCopy(world,event,language),socialEvent:event,routinePhase:slot,activityFamily:{talk:'talk',cook:'cooking',game:'games',movie:'digital',comfort:'care'}[kind]};
}
export function socialLogCopy(scene,world,language){return scene.socialEvent?{...scene,...gatheringEventCopy(world,scene.socialEvent,language)}:scene;}
export function gatheringEventCopy(world,event,language=world.uiLanguage){
 const a=world.characters?.[event.actorId]?.name||'?',b=world.characters?.[event.targetId]?.name||'?',o=world.characters?.[event.observerId]?.name||'?';
 const t=(...values)=>gatheringText(values,language);
 const title=event.outcome==='arrival'||event.kind==='arrival'?t('모여서 인사하는 중','Greeting each other','集まって挨拶している'):gatheringText(GATHERING_ACTIVITIES[event.kind]?.slice(1)||['함께 보내는 시간','Time together','一緒の時間'],language);
 const lines={
 arrival:()=>t(`${a}과 함께 모였어요. 안부를 나누며 편하게 자리를 잡아요.`,`Everyone has gathered with ${a}. They exchange greetings and settle in.`,`${a}と集まりました。挨拶を交わし、くつろげる場所につきます。`),
 careful:()=>t(`${a}은 재료를 꼼꼼히 나누고, ${b}은 옆에서 하나씩 섞어요. 둘이 만든 간식을 나눠 먹어요.`,`${a} carefully measures the ingredients while ${b} mixes them. They share their homemade snack.`,`${a}は材料を丁寧に分け、${b}は隣で混ぜます。作ったおやつを分け合います。`),
 messy:()=>t(`${a}이 반죽을 흘렸어요. ${b}은 웃다가 수건을 가져와 함께 치워요. 모양은 달라도 간식은 완성!`,`${a} spills the batter. ${b} laughs, then brings a towel to help. The snack comes out a little wonky!`,`${a}が生地をこぼしました。${b}は笑ったあと布巾を持ってきます。形は違ってもおやつは完成！`),
 win:()=>t(`${a}이 마지막 수를 두고 이겼어요. ${b}은 판을 살펴보다 한 판 더 하자고 손짓해요.`,`${a} wins with the final move. ${b} studies the board and gestures for another round.`,`${a}が最後の一手で勝ちました。${b}は盤面を見て、もう一回と誘います。`),
 rematch:()=>t(`${b}의 예상 밖의 수에 ${a}이 놀랐어요. 둘은 방금 판을 되짚으며 다시 웃어요.`,`${b}'s unexpected move surprises ${a}. They replay the moment and laugh together.`,`${b}の意外な一手に${a}が驚きました。二人はさっきの場面を振り返って笑います。`),
 commentary:()=>t(`${b}은 영상 속 장면마다 말을 보태요. ${a}은 화면보다 옆 사람의 반응을 보며 웃어요.`,`${b} keeps commenting on the video. ${a} smiles at their reactions more than the screen.`,`${b}は動画の場面ごとに一言。${a}は画面より隣の反応を見て笑います。`),
 quiet:()=>t(`${a}과 ${b}은 나란히 앉아 영상을 봐요. 말이 없어도 같은 장면에서 함께 웃어요.`,`${a} and ${b} watch side by side. Without a word, they laugh at the same scene.`,`${a}と${b}は並んで動画を見ます。言葉がなくても同じ場面で笑います。`),
 awkward:()=>t(`${a}의 말에 ${b}은 잠깐 생각해요. 조금 어색하지만 서로 말을 끊지 않고 천천히 들어요.`,`${b} pauses at ${a}'s words. It is a little awkward, but they give each other time to speak.`,`${a}の言葉に${b}は少し考えます。ぎこちなくても、互いの話をゆっくり聞きます。`),
 click:()=>t(`${a}이 꺼낸 이야기에 ${b}이 자기 경험을 보태요. 어느새 둘의 이야기가 길어졌어요.`,`${b} adds their own experience to ${a}'s story. Soon the conversation takes on a life of its own.`,`${a}の話に${b}が自分の経験を添えます。いつの間にか話が長くなりました。`),
 listening:()=>t(`${a}은 답을 재촉하지 않고 ${b}의 말을 기다려요. ${b}은 조금씩 편하게 이야기를 꺼내요.`,`${a} waits without pressing for an answer. ${b} slowly feels comfortable enough to talk.`,`${a}は返事を急かさず待ちます。${b}は少しずつ安心して話し始めます。`),
 space:()=>t(`${b}은 지금은 혼자 있고 싶다고 해요. ${a}은 한 걸음 물러나 다른 자리에 앉아요.`,`${b} says they need some space. ${a} steps back and takes another seat.`,`${b}は今は一人でいたいと言います。${a}は一歩引いて別の席に座ります。`),
 remember:()=>t(`${a}과 ${b}은 지난 모임에서 함께했던 일을 떠올려요. 이번에는 먼저 눈을 맞추며 다시 시작해요.`,`${a} and ${b} remember doing this at a previous visit. This time they exchange a knowing look before starting.`,`${a}と${b}は前の集まりで一緒にしたことを思い出し、目を合わせてまた始めます。`)
 };
 const extra=Object.values(SOCIAL_LOGS).flat().find(item=>item.id===event.outcome);
 let desc=extra?gatheringText(extra.copy,language).replaceAll('{a}',a).replaceAll('{b}',b):(event.outcome==='farewell'?t('함께 쓴 자리를 정리하고 다음 만남을 기약해요.','They tidy up together and look forward to meeting again.','一緒に使った場所を片づけ、また会うのを楽しみにしています。'):(lines[event.outcome||event.kind]||lines.click)());
 if(event.observerId)desc+=' '+(event.observer==='join'?t(`${o}도 궁금해서 가까이 다가와요.`,`${o} comes closer, curious.`,`${o}も気になって近づきます。`):t(`${o}은 조금 떨어져 편하게 지켜봐요.`,`${o} watches comfortably from a little distance.`,`${o}は少し離れて気楽に見守ります。`));
 if(!language||language==='ko')for(const name of [...new Set([a,b,o])]){
  const last=name.charCodeAt(name.length-1)-0xac00;if(last<0||last>11171)continue;
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  desc=desc.replace(new RegExp(escaped+'([이가은는과와])(?=\\s)','g'),(_,p)=>name+(/[이가]/.test(p)?(last%28?'이':'가'):/[은는]/.test(p)?(last%28?'은':'는'):(last%28?'과':'와')));
 }
 return {title,desc};
}
