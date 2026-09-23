import {buildingInterior} from './building-interior-model.js';
import {COFFEE_TASKS,isCoffeeMachine} from './coffee-crafting.js';
import {placeActions} from './place-activities.js';
import {roomActivityAllowed} from './room-activities.js?v=20260909dev305';
import {relationMetrics} from './relationship-metrics.js';
import {roomEntryAllowed} from "./room-permissions.js?v=20260909dev305";
import {characterMood} from './character-mood.js?v=20260909dev305';
import {SOCIAL_ACTIVITIES,hasRomanticRelationship} from './social-activities.js?v=20260909dev305';
import {LIFE_TASKS} from './life-tasks.js?v=20260909dev305';
import {relationshipBetween,viewSignals} from './relationship-context.js?v=20260909dev305';
const label=(ko,en,ja)=>({ko,en,ja});
export function contextActions(target){
 if(target.type==='person')return [
 {kind:'talk',label:label('대화하기','Talk','話す')},{kind:'hug',label:label('포옹하기','Hug','抱きしめる')},{kind:'debate',label:label('토론하기','Discuss','議論する')},{kind:'hangout',label:label('함께 시간 보내기','Spend time together','一緒に過ごす')}];
 if(target.type==='place')return placeActions(target.place);
 const item=target.item||'';
 if(/커피포트|coffee pot|kettle|コーヒーポット/i.test(item))return COFFEE_TASKS.filter(t=>['coffee_drip','coffee_iced'].includes(t.id)).map(t=>({kind:t.kind,lifeTask:t.id,label:label(...t.labels)}));
 if(isCoffeeMachine(item))return [...COFFEE_TASKS.map(t=>({kind:t.kind,lifeTask:t.id,label:label(...t.labels)})),{kind:'chores',lifeTask:'clean',label:label('커피머신 청소하기','Clean the coffee machine','コーヒーメーカーを掃除する')}];
 if(/오디오|턴테이블|플레이어|audio|stereo/i.test(item))return [{kind:'music',lifeTask:'music',label:label('음악 듣기','Listen to music','音楽を聴く')}];
 const affection={kind:'affection',companion:true,label:label('스킨십하기','Physical affection','スキンシップ')};
 if(/침대|bed/i.test(item))return [{kind:'nap',lifeTask:'sleep',label:label('잠자기','Go to sleep','眠る')},{kind:'nap',label:label('잠깐 눈 붙이기','Take a nap','少し眠る')},{kind:'rest',label:label('침대에서 쉬기','Rest in bed','ベッドで休む')},{kind:'read',label:label('책 읽기','Read a book','本を読む')},...LIFE_TASKS.filter(t=>['early_sleep','sleep_in'].includes(t.id)).map(t=>({kind:t.kind,lifeTask:t.id,label:label(...t.labels)})),affection];
 if(/소파|sofa/i.test(item))return [
  {kind:'rest',label:label('편하게 쉬기','Relax on the sofa','ソファでくつろぐ')},
  {kind:'nap',label:label('낮잠 자기','Take a nap','昼寝する')},
  {kind:'read',label:label('책 읽기','Read a book','本を読む')},
  {kind:'relax',lifeTask:'video',label:label('영상 보기','Watch videos','動画を見る')},
  {kind:'music',lifeTask:'music',label:label('음악 듣기','Listen to music','音楽を聴く')},affection];
 if(/냉장|싱크|가스|오븐|조리|인덕션|카운터/i.test(item))return [{kind:'meal',lifeTask:'simple_cook',label:label('요리하기','Cook','料理する')},{kind:'meal',label:label('식사하기','Eat','食事する')}];
 if(/식탁|dining table/i.test(item))return [{kind:'meal',label:label('여기서 밥 먹기','Eat here','ここで食事する')}];
 if(/책장|책상/i.test(item))return [{kind:'read',label:label('책 읽기','Read','読書する')},{kind:'study',label:label('공부하기','Study','勉強する')}];
 if(/변기|toilet/i.test(item))return [{kind:'wash',lifeTask:'toilet',label:label('용변 보기','Use the toilet','トイレに行く')}];
 if(/욕조|샤워/i.test(item))return [{kind:'wash',lifeTask:/욕조/.test(item)?'bath':'shower',label:label('씻기','Wash','体を洗う')}];
 if(/TV|텔레비전/i.test(item))return [{kind:'relax',lifeTask:'video',label:label('영상 보기','Watch TV','テレビを見る')}];
 if(/컴퓨터|게임/i.test(item))return [{kind:'game',label:label('게임하기','Play a game','ゲームをする')},{kind:'relax',label:label('쉬기','Relax','くつろぐ')}];
 return [{kind:'rest',label:label('여기서 쉬기','Rest here','ここで休む')},{kind:'chores',lifeTask:'clean',label:label('청소하기','Clean','掃除する')}];
}
export function contextHome(world,target){
 if(target.placeId){const town=world.towns?.find(t=>t.id===world.activeTownId)||world.world,place=town?.places?.find(p=>p.id===target.placeId);if(!place)return null;const home=buildingInterior(place,town.id||world.activeTownId,world.uiLanguage);return home.id===target.homeId?home:null}
 return world.homes[target.homeId];
}
export function contextDestination(world,c,target,kind,now=Date.now(),lifeTask='',companionId=''){
 if(!target||typeof target!=='object')return null;
 if(target.type==='place'){
  const place=(world.world.places||[]).find(p=>p.id===target.id);if(!place||!placeActions(place).some(a=>a.kind===kind&&(a.lifeTask||'')===lifeTask))return null;
  return {home:false,placeId:place.id,townId:world.activeTownId||c.townId};
 }
 const home=contextHome(world,target),room=home?.rooms?.[target.room];
 if(!home||!room||home.townId&&c.townId&&home.townId!==c.townId)return null;
 if(!roomEntryAllowed(c,home,room)||!roomActivityAllowed(room,{kind,lifeTask}))return null;
 let furniture=null;
 if(target.type==='furniture'){
  furniture=room.furniturePlacements?.find(p=>p.id===target.id);if(!furniture)return null;
  if(!contextActions({...target,item:furniture.item}).some(a=>a.kind===kind&&(a.lifeTask||'')===lifeTask))return null;
  if(furniture.item==='식탁'){
   const table=furniture,placements=room.furniturePlacements||[],busy=new Set(Object.entries(world.characterDirectives||{}).filter(([id,d])=>id!==c.id&&id!==companionId&&d.endsAt>now&&(d.visitHomeId||d.homeId)===home.id).map(([,d])=>d.furniture?.id));
   for(const [id,a] of Object.entries(home.lifeSimulation?.agents||{}))if(id!==c.id&&a.phase==='using')busy.add(a.furnitureId);
   furniture=placements.filter(p=>p.item==='의자'&&!busy.has(p.id)&&(p.tableId===table.id||!p.tableId&&Math.hypot(p.x-table.x,p.y-table.y)<28)).sort((a,b)=>Math.hypot(a.x-table.x,a.y-table.y)-Math.hypot(b.x-table.x,b.y-table.y))[0];
   if(!furniture)return null;
  }
  const users=Object.entries(world.characterDirectives||{}).filter(([id,d])=>id!==c.id&&id!==companionId&&d.endsAt>now&&(d.visitHomeId||d.homeId)===home.id&&d.room===target.room&&d.furniture?.id===furniture.id);
  const coupleBath=lifeTask==='bath'&&/욕조/.test(furniture.item)&&users.length===1&&users[0][1].lifeTask==='bath'&&hasRomanticRelationship(world.relationships,c.id,users[0][0]);
  const capacity=coupleBath||/소파|커플|더블|2인|double|couple/i.test(furniture.item)?2:1;
  const used=users.length;
  if(used>=(kind==='affection'?1:capacity))return null;
 }
 return {home:!home.placeId,...(home.placeId?{placeId:home.placeId}:{}),visitHomeId:home.id,room:target.room,townId:home.townId||c.townId,...(furniture?{furniture,goal:{homeId:home.id,room:target.room,point:{x:Number(furniture.x)||50,y:Number(furniture.y)||60}}}:{})};
}

const action=(kind,ko,en,ja)=>({kind,label:label(ko,en,ja)});
export function contextGroups(target,actor){
 if(target.type==='furniture'||target.type==='place')return [{label:label('다른 행동','Other activities','ほかの行動'),actions:contextActions(target)}];
 if(target.type!=='person'||target.id===actor?.id)return [{label:label('혼자 하는 행동','Personal activities','一人ですること'),actions:[...contextActions(target).filter(a=>target.type!=='person'),...LIFE_TASKS.filter(t=>!t.social).map(t=>({kind:t.kind,lifeTask:t.id,label:label(...t.labels)})),action('walk','산책하기','Take a walk','散歩する')]}];
 const socials=Object.entries(SOCIAL_ACTIVITIES).map(([kind,a])=>({...a,kind,label:label(...a.labels)}));
 return [
 {label:label('대화하기','Conversation','会話'),actions:[action('talk','대화하기','Talk','話す'),action('comfort','위로하기','Comfort','慰める'),...socials.filter(a=>a.section==='conversation'||a.kind==='debate')]},
 {label:label('연락하기','Contact','連絡'),actions:socials.filter(a=>a.remote)},
 {label:label('애정 상호작용','Affection','愛情表現'),actions:[action('hug','포옹하기','Hug','抱きしめる'),action('kiss','키스하기','Kiss','キスする'),action('compliment','칭찬하기','Compliment','褒める'),action('handhold','손잡기','Hold hands','手をつなぐ'),action('lean','어깨에 기대기','Lean on their shoulder','肩に寄り添う'),action('affection','스킨십하기','Physical affection','スキンシップ')]},
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
 const mood=characterMood(actor,actor?.sharedScene||{},world),all=groups.flatMap(g=>g.actions),score=a=>{const metrics=relationMetrics(world,actor.id,target.id);let n=a.kind==='talk'?6:0;if(a.kind==='comfort')n+=metrics.trust/20;if(a.kind==='hangout')n+=metrics.comfort/20;if(a.kind==='hug')n+=metrics.affection/20-metrics.tension/10;if(mood.score<-10){if(a.remote)n+=4;if(a.kind==='hug')n-=3;}if(/외향|활발/.test(actor?.socialStyle||'')&&['talk','hangout'].includes(a.kind))n+=3;if(a.kind==='hug')n+=signals.romantic?10:signals.caring?6:relation?2:-4;if(signals.hostile||signals.guarded){if(a.kind==='hug'||a.kind==='kiss')n-=20;if(a.negative)n+=/충동|즉흥/.test(actor?.impulseControl||'')?7:1;if(a.remote)n+=3;}if(a.kind==='hangout')n+=relation?5:1;if(a.kind==='comfort')n+=/공감|이타|배려/.test([actor?.decisionStyle,...(actor?.characterTraits||[])].join(' '))?5:0;return n};
 return all.filter((a,i,arr)=>arr.findIndex(b=>b.kind===a.kind)===i).sort((a,b)=>score(b)-score(a)).slice(0,4);
}
