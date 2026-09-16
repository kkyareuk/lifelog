// Versioned server rules: private movement followed by a shared-room action.
// Existing games retain their original rules and deadlines.
const old=require('./mafia-engine');
const alive=g=>g.players.filter(p=>p.alive);
const pick=(g,a,...key)=>a[Math.floor(old.random(g.seed,...key)*a.length)];
const peers=(g,p)=>alive(g).filter(q=>q.id!==p.id&&q.place===p.place);
const tick=g=>(g.period||0)*2;
const card=(g,p,{id,...data})=>old.addCard(g,p,{day:g.day,tick:tick(g),place:p.place,...data});
const hour=p=>Number(String(p.sleep||'23:00').split(':')[0]);
const late=p=>hour(p)<5||hour(p)>=24;
const awake=(g,p)=>g.period!==4||late(p);
const targetCount=(n,version=2)=>version>=4?Math.max(3,Math.ceil(n/2)):Math.max(4,Math.min(8,n-2));
const taskTypes=[['dishes','주방|식당|음식|요리|싱크'],['books','서재|도서|책|독서'],['garden','공원|광장|꽃|원예'],['boxes','창고|상점|짐']];
function start(g){
 if(![2,3,4].includes(g.rulesVersion))return old.start(g);
 if(g.locations.filter(l=>l.selected!==false).length<targetCount(g.players.length,g.rulesVersion))throw Error('game-locations');
 old.start(g);g.phase='move';g.period=0;g.tasks={};g.traces=[];g.bodies=[];g.cardSequence=0;
 const count=targetCount(g.players.length,g.rulesVersion),all=g.locations;
 const selected=all.filter(l=>l.selected!==false),square=selected.find(l=>l.square)||selected[0];
 const stage=[square,...selected.filter(l=>l.id!==square.id)].slice(0,count);
 g.openPlaces=stage.map(l=>l.id);g.squareId=square.id;
 const hubs=stage.slice(0,Math.max(2,Math.ceil(stage.length/2)));
 g.commonTask={place:square.id,contributors:[],required:Math.min(3,g.players.filter(p=>p.role==='citizen').length)};
 for(const p of g.players){
  p.place=stage[g.players.indexOf(p)%stage.length].id;
  p.homePlace=all.find(l=>l.homeId&&l.homeId===p.homeId)?.id||'night:'+p.id;
  if(!all.some(l=>l.id===p.homePlace))all.push({id:p.homePlace,name:p.name,homeId:p.homeId||p.id,nightOnly:true,x:50,y:80});
  p.emergencyUsed=false;p.hitDay=0;
  const preferred=hubs.find(l=>new RegExp(taskTypes.find(([,re])=>new RegExp(re).test(p.hobbies||''))?.[1]||'(?!)').test(l.type+' '+l.name+' '+(l.furniture||[]).join(' ')));
  g.tasks[p.id]=Array.from({length:3},(_,i)=>{const place=i===0&&preferred?preferred:hubs[(i+g.players.indexOf(p))%hubs.length];const kind=taskTypes.find(([,re])=>new RegExp(re).test(place.type+' '+place.name+' '+(place.furniture||[]).join(' ')))?.[0]||'boxes';return {id:p.id+'-task-'+i,place:place.id,kind,required:i===1?2:1,done:0,lastDay:0,lastPeriod:-2}});
 }
 return g;
}
function canHit(g,p){return !g.nightCycle&&p.alive&&g.phase==='act'&&(g.rulesVersion>=3||g.day>1)&&p.role==='mafia'&&p.hitDay!==g.day&&awake(g,p)&&peers(g,p).length===1&&peers(g,p)[0].role!=='mafia'}
function allowedPlaces(g,p){if(g.notebook)return g.openPlaces;if(g.drama)return g.period===2?[g.squareId]:g.openPlaces;return g.period>=3?[p.homePlace]:(g.openPlaces||[])}
function near(g,p){const own=g.locations.find(l=>l.id===p.place)||{};return g.locations.filter(l=>g.openPlaces.includes(l.id)&&l.id!==p.place).sort((a,b)=>Math.hypot((a.x||50)-(own.x||50),(a.y||50)-(own.y||50))-Math.hypot((b.x||50)-(own.x||50),(b.y||50)-(own.y||50))).slice(0,2).map(l=>l.id)}
function validateAction(g,p,a){
 if(!a||typeof a!=='object')return false;
 if(g.phase==='move')return a.kind==='move'&&allowedPlaces(g,p).includes(a.place);
 if(g.phase!=='act')return false;
 if(!awake(g,p))return a.kind==='stay';
 if(a.kind==='stay')return true;
 if(a.kind==='task')return a.taskId==='common'?g.commonTask.place===p.place:(g.tasks[p.id]||[]).some(t=>t.id===a.taskId&&t.place===p.place&&t.done<t.required);
 if(a.kind==='look')return near(g,p).includes(a.place);
 if(['investigate','cover','drop'].includes(a.kind))return true;
 if(a.kind==='talk')return peers(g,p).some(q=>q.id===a.targetId)&&(g.notebook||(g.cards[p.id]||[]).some(c=>c.id===a.cardId));
 if(a.kind==='hit')return canHit(g,p)&&peers(g,p)[0].id===a.targetId;
 if(a.kind==='emergency')return p.place===g.squareId&&!p.emergencyUsed;
 return false;
}
function auto(g,p){
 if(g.phase==='move'){if(g.rulesVersion>=4&&!p.delegated)return {kind:'move',place:allowedPlaces(g,p).includes(p.place)?p.place:allowedPlaces(g,p)[0]};const pending=(g.tasks[p.id]||[]).filter(t=>t.done<t.required);return {kind:'move',place:g.drama&&!g.notebook&&g.period===2?g.squareId:g.period>=3&&!g.drama?p.homePlace:pending[0]?.place||pick(g,g.openPlaces,'move',g.day,g.period,p.id)}}
 if(!awake(g,p))return {kind:'stay'};
 if(canHit(g,p)&&old.random(g.seed,'hit',g.day,g.period,p.id)>.4)return {kind:'hit',targetId:peers(g,p)[0].id};
 const task=(g.tasks[p.id]||[]).find(t=>t.place===p.place&&t.done<t.required);
 if(task)return {kind:'task',taskId:task.id};
 if(p.place===g.commonTask.place&&!g.commonTask.contributors.includes(p.id))return {kind:'task',taskId:'common'};
 const peer=peers(g,p).find(q=>(g.cards[q.id]||[]).length);
 if(peer&&(g.cards[p.id]||[]).length&&old.random(g.seed,'talk',g.day,g.period,p.id)>.5)return {kind:'talk',targetId:peer.id,cardId:g.cards[p.id].at(-1).id};
 return {kind:'investigate'};
}
function meeting(g,reason,source){g.phase='debate';g.debateRound=0;g.meetingReason=reason;g.history.push({kind:'meeting',reason,speaker:source||'',day:g.day});g.bodies.forEach(b=>b.reported=true)}
function move(g){
 const plans=alive(g).map(p=>[p,g.submissions[p.id]||auto(g,p)]);
 for(const [p,a]of plans){p.place=allowedPlaces(g,p).includes(a.place)?a.place:allowedPlaces(g,p)[0]}
 const found=plans.find(([p])=>g.bodies.some(b=>!b.reported&&b.place===p.place));
 if(found){meeting(g,'discovery',found[0].id);return}
 g.phase='act';
}
function progress(g){const citizens=alive(g).filter(p=>p.role==='citizen');g.commonTask.required=Math.min(3,citizens.length);const tasks=citizens.flatMap(p=>g.tasks[p.id]||[]),total=tasks.reduce((n,t)=>n+t.required,0)+g.commonTask.required,done=tasks.reduce((n,t)=>n+t.done,0)+Math.min(g.commonTask.required,g.commonTask.contributors.length);g.progress=Math.floor(done/total*100)}
function act(g){
 const people=alive(g),actions=Object.fromEntries(people.map(p=>[p.id,g.submissions[p.id]||auto(g,p)]));
 const emergency=people.find(p=>actions[p.id].kind==='emergency'&&validateAction(g,p,actions[p.id]));
 if(emergency){emergency.emergencyUsed=true;meeting(g,'emergency',emergency.id);return}
 // Resolve from a frozen occupancy/action snapshot, never client-supplied locations.
 const occupancy=Object.fromEntries(people.map(p=>[p.id,peers(g,p)]));
 const hits=people.filter(p=>actions[p.id].kind==='hit'&&validateAction(g,p,actions[p.id]));
 const copies=Object.fromEntries(people.map(p=>[p.id,(g.cards[p.id]||[]).map(c=>({...c}))]));
 for(const q of people)if(old.random(g.seed,'footprint',g.day,g.period,q.id)>(q.gameSkills?.stealthSkill??50)/200)g.traces.push({id:'trace-'+ ++g.cardSequence,day:g.day,tick:tick(g),place:q.place,action:'footprint'});
 for(const p of people){
  const a=validateAction(g,p,actions[p.id])?actions[p.id]:{kind:'stay'},others=occupancy[p.id];
  card(g,p,{kind:'alibi',subject:p.id,action:a.kind,witnesses:others.filter(q=>awake(g,q)).map(q=>q.id)});
  if(!awake(g,p))continue;
  for(const q of others)card(g,p,{kind:'witness',subject:q.id,action:'stay'});
  if(a.kind==='task'){
   if(p.role==='citizen'){
    if(a.taskId==='common'){if(!g.commonTask.contributors.includes(p.id))g.commonTask.contributors.push(p.id)}
    else {const t=g.tasks[p.id].find(t=>t.id===a.taskId);if(!g.drama&&t.required===2&&t.done===1&&(t.lastDay!==g.day||t.lastPeriod!==g.period-1))t.done=0;t.done=Math.min(t.required,t.done+1);t.lastDay=g.day;t.lastPeriod=g.period}
   }
   g.traces.push({id:'trace-'+ ++g.cardSequence,day:g.day,tick:tick(g),place:p.place,action:'task'});
   card(g,p,{kind:'alibi',subject:p.id,action:'task'});
  }else if(a.kind==='investigate'){
   const seen=others.filter(q=>old.random(g.seed,'seen',g.day,g.period,p.id,q.id)<Math.max(.25,Math.min(.95,.7+((p.gameSkills?.observationSkill??50)-(q.gameSkills?.stealthSkill??50))/200)));
   card(g,p,{kind:'survey',subject:p.id,action:'investigate',seenIds:[p.id,...seen.map(q=>q.id)]});
   const known=new Set((g.cards[p.id]||[]).map(c=>c.originId).filter(Boolean));
   const traces=g.traces.filter(t=>t.place===p.place&&!known.has(t.id)).sort((a,b)=>Number(['blood','object','wiped'].includes(b.action))-Number(['blood','object','wiped'].includes(a.action))||b.tick-a.tick).slice(0,3);
   for(const trace of traces)card(g,p,{...trace,kind:'trace',subject:null,originId:trace.id});
   if(!traces.length)card(g,p,{kind:'empty',subject:null,action:'no-trace'});
  }else if(a.kind==='look')card(g,p,{kind:'presence',subject:null,place:a.place,count:people.filter(q=>q.place===a.place).length,action:'presence'});
  else if(a.kind==='cover'){const i=g.traces.findLastIndex(t=>t.place===p.place);if(i>=0)g.traces.splice(i,1);g.traces.push({id:'trace-'+ ++g.cardSequence,day:g.day,tick:tick(g),place:p.place,action:'wiped'})}
  else if(a.kind==='drop')g.traces.push({id:'trace-'+ ++g.cardSequence,day:g.day,tick:tick(g),place:p.place,action:'object',subject:null});
  else if(a.kind==='talk'){
   if(g.notebook){card(g,p,{kind:'exchange',subject:a.targetId,action:'talk'});continue;}
   const q=others.find(q=>q.id===a.targetId),other=q&&actions[q.id];
   const mine=copies[p.id].find(c=>c.id===a.cardId),theirs=q&&copies[q.id].find(c=>c.id===other?.cardId);
   if(other?.kind==='talk'&&other.targetId===p.id&&mine&&theirs){
    const {id,...copy}=theirs;card(g,p,{...copy,originId:theirs.originId||id,heardFrom:q.id,sourceChain:[...(theirs.sourceChain||[]),q.id]});
    card(g,p,{kind:'exchange',subject:q.id,action:'talk'});
   }else card(g,p,{kind:'declined',subject:a.targetId,action:'declined'});
  }
 }
 for(const p of hits){const target=occupancy[p.id][0];if(!target.alive)continue;target.alive=false;p.hitDay=g.day;g.bodies.push({id:target.id,place:p.place,day:g.day,tick:tick(g),reported:false});g.traces.push({id:'trace-'+ ++g.cardSequence,day:g.day,tick:tick(g),place:p.place,subject:null,action:'blood'});}
 progress(g);g.traces=g.traces.slice(-120);
 if(old.finish(g))return;
 if(g.nightCycle){if(g.period>=1)meeting(g,'evening');else{g.period=1;g.actionTick=tick(g);g.phase='move'}return}
 if(g.drama&&g.period===3||g.period===4||g.period===3&&!alive(g).some(late)){meeting(g,'morning');return}
 g.period+=g.drama&&g.period===0?2:1;g.actionTick=tick(g);g.phase='move';
}
function advance(g,now){
 if(![2,3,4].includes(g.rulesVersion))return old.advance(g,now);
 let steps=0;
 while(g.status==='playing'&&g.deadlineAt<=now&&steps++<50){
  if(g.phase==='move')move(g);
  else if(g.phase==='act')act(g);
  else if(g.phase==='debate')old.resolveDebate(g);
  else if(g.phase==='vote'){old.resolveVote(g);if(g.status==='playing'){g.phase='move';g.period=0;g.actionTick=0}}
  g.phaseIndex++;g.submissions={};g.deadlineAt+=g.phase==='move'?60000:g.phase==='act'?15000:45000;g.history=g.history.slice(-200);g.board=g.board.slice(-120);
 }
 return g;
}
function view(g,uid){
 if(![2,3,4].includes(g.rulesVersion))return old.view(g,uid);
 const result=old.view(g,uid),mine=g.players.find(p=>p.ownerUid===uid&&!p.delegated),inside=g.phase==='act'&&mine?.alive;
 result.players=result.players.map(({hitDay,homePlace,emergencyUsed,hobbies,homeId,...p})=>({...p,...(g.status==='playing'&&p.id!==mine?.id&&g.bodies?.some(b=>b.id===p.id&&!b.reported)?{alive:true}:{})}));
 result.rulesVersion=g.rulesVersion;result.period=g.period||0;result.openPlaces=g.openPlaces||[];result.squareId=g.squareId||'';
 result.submittedCount=alive(g).filter(p=>g.submissions?.[p.id]).length;
 result.meetingReason=g.meetingReason||'';
 // During movement no opponent locations, bodies, private tasks, or traces leave the server.
 result.occupants=inside?alive(g).filter(p=>p.place===mine.place).map(p=>({id:p.id,name:p.name,photo:p.photo||''})):[];
 result.allowedPlaces=g.status==='playing'&&mine?.alive?allowedPlaces(g,mine):[];
 result.adjacentPlaces=inside?near(g,mine):[];
 result.canHit=!!mine&&canHit(g,mine);result.canEmergency=!!inside&&mine.place===g.squareId&&!mine.emergencyUsed;
 result.awake=!!mine&&awake(g,mine);
 result.tasks=mine?g.tasks?.[mine.id]||[]:[];
 result.commonTask=g.commonTask?{place:g.commonTask.place,required:g.commonTask.required,done:g.commonTask.contributors.length}:null;
 result.privateCards=Object.fromEntries(Object.entries(result.privateCards).map(([id,cards])=>[id,cards.map(({forged,sourceChain,...c})=>c)]));
 result.map=g.map||null;
 return result;
}
const primitives={...old,view,move,act,auto,validateAction};
const playback=require('./mafia-playback')(primitives);
const conversation=require('./mafia-conversation')(primitives,playback);
const notebook=require('./mafia-notebook')(primitives,conversation,playback);
const meetingV2=require('./mafia-meeting')(primitives,notebook,playback);
module.exports={...old,start,advance:(g,n)=>g.meetingControls===2?meetingV2.advance(g,n):g.notebook?notebook.advance(g,n):g.rulesVersion===4?conversation.advance(g,n):g.rulesVersion===3?playback.advance(g,n):advance(g,n),view:(g,u)=>g.meetingControls===2?meetingV2.view(g,u):g.notebook?notebook.view(g,u):g.rulesVersion===4?conversation.view(g,u):g.rulesVersion===3?playback.view(g,u):view(g,u),submitPlayback:(g,p,a,n)=>g.meetingControls===2?meetingV2.submit(g,p,a,n):g.notebook?notebook.submit(g,p,a,n):g.rulesVersion===4?conversation.submit(g,p,a,n):playback.submit(g,p,a,n),validateAction,targetCount};
