import {roomEntryAllowed} from "./room-permissions.js?v=20260909dev305";
import {characterMood} from './character-mood.js?v=20260909dev305';
import {SOCIAL_ACTIVITIES} from './social-activities.js?v=20260909dev305';
import {LIFE_TASKS} from './life-tasks.js?v=20260909dev305';
import {relationshipBetween,viewSignals} from './relationship-context.js?v=20260909dev305';
const label=(ko,en,ja)=>({ko,en,ja});
export function contextActions(target){
 if(target.type==='person')return [
 {kind:'talk',label:label('대화하기','Talk','話す')},{kind:'hug',label:label('포옹하기','Hug','抱きしめる')},{kind:'debate',label:label('토론하기','Discuss','議論する')},{kind:'hangout',label:label('함께 시간 보내기','Spend time together','一緒に過ごす')}];
 if(target.type==='place')return [{kind:'walk',label:label('방문하기','Visit','訪れる')},{kind:'rest',label:label('여기서 쉬기','Rest here','ここで休む')}];
 const item=target.item||'';
 if(/침대|bed/i.test(item))return [{kind:'nap',label:label('잠깐 눈 붙이기','Take a nap','少し眠る')}];
 if(/냉장|싱크|가스|오븐|조리/i.test(item))return [{kind:'meal',lifeTask:'simple_cook',label:label('요리하기','Cook','料理する')},{kind:'meal',label:label('식사하기','Eat','食事する')}];
 if(/책장|책상/i.test(item))return [{kind:'read',label:label('책 읽기','Read','読書する')},{kind:'study',label:label('공부하기','Study','勉強する')}];
 if(/욕조|샤워/i.test(item))return [{kind:'wash',lifeTask:/욕조/.test(item)?'bath':'shower',label:label('씻기','Wash','体を洗う')}];
 if(/TV|텔레비전|컴퓨터|게임/i.test(item))return [{kind:'game',label:label('게임하기','Play a game','ゲームをする')},{kind:'relax',label:label('쉬기','Relax','くつろぐ')}];
 return [{kind:'rest',label:label('여기서 쉬기','Rest here','ここで休む')},{kind:'chores',lifeTask:'clean',label:label('청소하기','Clean','掃除する')}];
}
export function contextDestination(world,c,target,kind,now=Date.now(),lifeTask=''){
 if(!target||typeof target!=='object')return null;
 if(target.type==='place'){
  const place=(world.world.places||[]).find(p=>p.id===target.id);if(!place||!['walk','rest'].includes(kind))return null;
  return {home:false,placeId:place.id,townId:world.activeTownId||c.townId};
 }
 const home=world.homes[target.homeId],room=home?.rooms?.[target.room];
 if(!home||!room||home.townId&&c.townId&&home.townId!==c.townId)return null;
 if(!roomEntryAllowed(c,home,room))return null;
 let furniture=null;
 if(target.type==='furniture'){
  furniture=room.furniturePlacements?.find(p=>p.id===target.id);if(!furniture)return null;
  if(!contextActions({...target,item:furniture.item}).some(a=>a.kind===kind&&(a.lifeTask||'')===lifeTask))return null;
  const capacity=/커플|더블|2인|double|couple/i.test(furniture.item)?2:1;
  const used=Object.entries(world.characterDirectives||{}).filter(([id,d])=>id!==c.id&&d.endsAt>now&&d.homeId===home.id&&d.room===target.room&&d.furniture?.id===furniture.id).length;
  if(used>=capacity)return null;
 }
 return {home:true,visitHomeId:home.id,room:target.room,townId:home.townId||c.townId,...(furniture?{furniture,goal:{homeId:home.id,room:target.room,point:{x:Number(furniture.x)||50,y:Number(furniture.y)||60}}}:{})};
}

const action=(kind,ko,en,ja)=>({kind,label:label(ko,en,ja)});
export function contextGroups(target,actor){
 if(target.type==='furniture'||target.type==='place')return [{label:label('다른 행동','Other activities','ほかの行動'),actions:contextActions(target)}];
 if(target.type!=='person'||target.id===actor?.id)return [{label:label('혼자 하는 행동','Personal activities','一人ですること'),actions:[...contextActions(target).filter(a=>target.type!=='person'),...LIFE_TASKS.filter(t=>!t.social).map(t=>({kind:t.kind,lifeTask:t.id,label:label(...t.labels)})),action('walk','산책하기','Take a walk','散歩する')]}];
 const socials=Object.entries(SOCIAL_ACTIVITIES).map(([kind,a])=>({...a,kind,label:label(...a.labels)}));
 return [
 {label:label('대화하기','Conversation','会話'),actions:[action('talk','대화하기','Talk','話す'),action('comfort','위로하기','Comfort','慰める'),...socials.filter(a=>a.section==='conversation'||a.kind==='debate')]},
 {label:label('연락하기','Contact','連絡'),actions:socials.filter(a=>a.remote)},
 {label:label('애정 상호작용','Affection','愛情表現'),actions:[action('hug','포옹하기','Hug','抱きしめる'),action('kiss','키스하기','Kiss','キスする'),action('compliment','칭찬하기','Compliment','褒める'),action('handhold','손잡기','Hold hands','手をつなぐ'),action('lean','어깨에 기대기','Lean on their shoulder','肩に寄り添う')]},
 {label:label('갈등 상호작용','Conflict','対立'),actions:socials.filter(a=>a.negative)},
 {label:label('선물하기','Gifts','贈り物'),actions:[action('gift','선물 건네기','Give a gift','贈り物を渡す')]},
 {label:label('동행하기','Together','一緒に行動'),actions:[action('hangout','함께 시간 보내기','Spend time together','一緒に過ごす'),...socials.filter(a=>['dine','cook_together','play_together','study_together','read_together'].includes(a.kind))]}
 ];
}
export function recommendedContextActions(target,world,actor){
 if(!actor)return [];
 const groups=contextGroups(target,actor);if(target.type!=='person')return contextActions(target);
 if(target.id===actor?.id)return groups[0].actions.filter(a=>a.lifeTask==='hair'||a.kind==='walk'||a.kind==='rest').slice(0,4);
 const view=(world.characterViews||{})[actor?.id]?.[target.id]||{},signals=viewSignals(view),relation=relationshipBetween(world,actor?.id,target.id);
 const mood=characterMood(actor,actor?.sharedScene||{},world),all=groups.flatMap(g=>g.actions),score=a=>{let n=a.kind==='talk'?6:0;if(mood.score<-10){if(a.remote)n+=4;if(a.kind==='hug')n-=3;}if(/외향|활발/.test(actor?.socialStyle||'')&&['talk','hangout'].includes(a.kind))n+=3;if(a.kind==='hug')n+=signals.romantic?10:signals.caring?6:relation?2:-4;if(signals.hostile||signals.guarded){if(a.kind==='hug'||a.kind==='kiss')n-=20;if(a.negative)n+=/충동|즉흥/.test(actor?.impulseControl||'')?7:1;if(a.remote)n+=3;}if(a.kind==='hangout')n+=relation?5:1;if(a.kind==='comfort')n+=/공감|이타|배려/.test([actor?.decisionStyle,...(actor?.characterTraits||[])].join(' '))?5:0;return n};
 return all.filter((a,i,arr)=>arr.findIndex(b=>b.kind===a.kind)===i).sort((a,b)=>score(b)-score(a)).slice(0,4);
}
