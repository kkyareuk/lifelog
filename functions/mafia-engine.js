// Server-only simulation. Never return this state directly to a client.
const {createHash}=require('node:crypto');
const random=(seed,...keys)=>parseInt(createHash('sha256').update([seed,...keys].join('|')).digest('hex').slice(0,8),16)/4294967296;
const choose=(g,items,...keys)=>items[Math.floor(random(g.seed,...keys)*items.length)];
const alive=g=>g.players.filter(p=>p.alive);
function finish(g){const people=alive(g),mafia=people.filter(p=>p.role==='mafia').length;const winner=mafia===0||g.meetingControls!==2&&g.progress>=100&&(g.rulesVersion!==4||g.phase==='vote')?'citizen':mafia>=people.length-mafia?'mafia':null;if(winner){g.status='finished';delete g.matchEmotions;delete g.meetingInfluence;delete g.voteRelations;g.winner=winner;g.finishedAt=g.deadlineAt;g.history.push({kind:'result',winner,day:g.day});g.submissions={};}return winner}
function start(g){g.status='playing';g.phase='plan';g.phaseIndex=0;g.actionTick=0;g.day=1;g.progress=0;g.history=[];g.replay=[];g.board=[];g.submissions={};g.cards={};const shuffled=[...g.players].sort((a,b)=>random(g.seed,'role',a.id)-random(g.seed,'role',b.id));const team=new Set(shuffled.slice(0,Math.max(1,Math.min(Math.floor((g.players.length-1)/2),Math.floor(g.mafiaCount)||(g.players.length>=8?2:1)))).map(p=>p.id));g.players.forEach((p,i)=>{p.role=team.has(p.id)?'mafia':'citizen';p.alive=true;p.place=g.locations[i%g.locations.length].id});return g}
function neighbours(g,place){const i=g.locations.findIndex(p=>p.id===place);return [place,g.locations[(i+1)%g.locations.length].id,g.locations[(i+g.locations.length-1)%g.locations.length].id]}
function autoPlan(g,p){let place=p.place;return Array.from({length:6},(_,tick)=>{const next=choose(g,neighbours(g,place),'move',g.day,p.id,tick+(g.mode==='live'?(g.actionTick||0):0));const kind=next!==place?'move':p.role==='mafia'&&random(g.seed,'sabotage',g.day,p.id,tick)>.55?'sabotage':random(g.seed,'investigate',g.day,p.id,tick)>.6?'investigate':'task';place=next;return {place,kind}})}
function validatePlan(g,p,plan){if(!Array.isArray(plan)||plan.length!==(g.mode==='live'?1:6))return false;let place=p.place;for(const step of plan){if(!step||!neighbours(g,place).includes(step.place)||!['move','task','investigate',...(p.role==='mafia'?['sabotage','tag']:[])].includes(step.kind))return false;if(step.place!==place&&step.kind!=='move')return false;place=step.place}return true}
function addCard(g,p,data){if(g.replay&&!data.forged&&['witness','behavior','autopsy','foundBody','nightWitness','entryTrace','tool','missingTool'].includes(data.kind)&&!['strainedGrief','strained'].includes(data.impression))g.replay.push({day:data.day||g.day,period:Math.floor((data.tick||0)/2),kind:'observation',observer:p.id,card:{...data}});const list=g.cards[p.id]||(g.cards[p.id]=[]);list.push({id:`${g.day}-${p.id}-${g.nextCardSequence=(g.nextCardSequence||0)+1}`,...data});if(list.length>60)list.shift()}
function openingStatement(g,p){
 // A public claim, never a dump of private evidence or secret roles.
 const cards=(g.cards?.[p.id]||[]).filter(c=>c.kind==='alibi'&&c.day===g.day);
 return [0,1,2,3].map(period=>{
  const matches=cards.filter(c=>Math.min(3,Math.floor(c.tick/2))===period),last=matches.at(-1);
  if(period===3){const day=cards.filter(c=>c.tick<6).at(-1);return {period,place:day?.place||p.place,action:last?'rest':'unknown'}}
  return {period,place:last?.place||p.place,action:last?(['tag','sabotage'].includes(last.action)?'task':last.action):'unknown'};
 });
}
function validateStatement(g,segments){return Array.isArray(segments)&&segments.length===4&&segments.every((s,i)=>s&&s.period===i&&g.locations.some(l=>l.id===s.place)&&['move','task','investigate','rest','unknown'].includes(s.action))}
function resolvePlan(g){const live=g.mode==='live',first=live?(g.actionTick||0):0;if(first===0){g.cards={};g.traces=[]}const plans=Object.fromEntries(alive(g).map(p=>[p.id,g.submissions[p.id]?.plan||autoPlan(g,p)]));
 for(let tick=first;tick<(live?first+1:6);tick++){
  const people=alive(g);for(const p of people)p.place=plans[p.id][live?0:tick].place;
  for(const p of people){const step=plans[p.id][live?0:tick],others=people.filter(q=>q.id!==p.id&&q.place===p.place);addCard(g,p,{kind:'alibi',day:g.day,tick,place:p.place,subject:p.id,action:step.kind,witnesses:others.map(q=>q.id)});for(const q of others)addCard(g,p,{kind:'witness',day:g.day,tick,place:p.place,subject:q.id,action:plans[q.id][live?0:tick].kind});
   if(step.kind==='investigate')for(const trace of g.traces.filter(t=>t.place===p.place&&tick-t.tick<=3))addCard(g,p,{kind:'trace',day:g.day,tick:trace.tick,place:p.place,subject:trace.subject,action:trace.action});
   if(step.kind==='sabotage')g.traces.push({tick,place:p.place,subject:null,action:'sabotage'});
   if(step.kind==='tag'&&others.length===1&&others[0].role!=='mafia'){others[0].alive=false;g.traces.push({tick,place:p.place,subject:null,action:'tag'});g.history.push({kind:'out',target:others[0].id,day:g.day,tick});}
   if(step.kind==='task'&&!g.traces.some(t=>t.place===p.place&&t.action==='sabotage'&&tick-t.tick<=2))g.progress=Math.min(100,g.progress+2);
  }
 }
 if(live&&first<5){g.actionTick=first+1;finish(g);return}g.actionTick=0;
 // Night: citizens rest. The late sleepers can witness the first night slot.
 for(let night=0;night<3;night++){
  for(const p of alive(g).filter(p=>p.role==='citizen'))addCard(g,p,{kind:'alibi',day:g.day,tick:6+night,place:p.place,subject:p.id,action:'rest'});
  for(const hunter of alive(g).filter(p=>p.role==='mafia')){
   hunter.place=choose(g,neighbours(g,hunter.place),'night-move',g.day,night,hunter.id);
   addCard(g,hunter,{kind:'alibi',day:g.day,tick:6+night,place:hunter.place,subject:hunter.id,action:'move'});
   const targets=alive(g).filter(p=>p.role==='citizen'&&p.place===hunter.place);
   if(night===0)for(const witness of targets.filter(p=>Number(String(p.sleep||'23:00').split(':')[0])<5))addCard(g,witness,{kind:'witness',day:g.day,tick:6+night,place:hunter.place,subject:hunter.id,action:'move'});
   if(targets.length===1){targets[0].alive=false;g.history.push({kind:'out',target:targets[0].id,day:g.day,tick:6+night});}
  }
 }
 g.history.push({kind:'progress',value:g.progress,day:g.day});g.phase='debate';g.debateRound=0;finish(g);
}
function conflicts(board,card){if(!card.subject)return [];return board.filter(old=>old.subject===card.subject&&old.day===card.day&&old.tick===card.tick&&old.place!==card.place).map(c=>c.id)}
function publish(g,p,card){const visible={...card,id:`board-${g.phaseIndex}-${p.id}-${g.board.length}`,speaker:p.id};delete visible.forged;delete visible.sourceChain;visible.conflicts=conflicts(g.board,visible);g.board.push(visible);g.history.push({kind:'card',speaker:p.id,card:visible,day:g.day});}
function suspicion(g,p,target){const emotions=g.matchEmotions?.[p.id+':'+target.id]||{};const evidence=g.board.filter(c=>c.subject===target.id);const conflictsCount=evidence.reduce((n,c)=>n+c.conflicts.length,0);const own=(g.cards?.[p.id]||[]).filter(c=>c.subject===target.id);return (g.meetingControls===2?((emotions.grudge||0)-(emotions.gratitude||0))*.2+(g.abstentions?.[target.id]>=2?Math.min(3,g.abstentions[target.id]-1):0):0)+(g.meetingControls===2?(g.meetingInfluence?.[p.id+':'+target.id]||0):0)+(g.drama?Math.min(3,g.claimIssues?.[target.id]||0):0)+Number(g.bias?.[p.id+':'+target.id]||0)+conflictsCount*20+own.filter(c=>['tag','sabotage'].includes(c.action)).length*12+Math.min(3,own.filter(c=>c.day>=g.day-1&&c.kind==='behavior'&&(['hideTool','cover','scoutHome'].includes(c.action)||c.impression==='strained')).length*.8)+g.history.filter(h=>h.kind==='accuse'&&h.day===g.day&&!h.withdrawn&&h.speaker===target.id&&h.target===p.id).length*3+random(g.seed,'suspect',g.phaseIndex,p.id,target.id)*4}
function suspect(g,p){const candidates=alive(g).filter(q=>q.id!==p.id);return candidates.sort((a,b)=>suspicion(g,p,b)-suspicion(g,p,a))[0]}
function autoDebate(g,p){const cards=g.cards[p.id]||[];if(p.role==='mafia'&&p.forgedDay!==g.day){const card=cards.find(c=>c.kind==='alibi'&&['tag','sabotage'].includes(c.action));if(card&&random(g.seed,'forge',g.phaseIndex,p.id)>.3)return {kind:'forge',cardId:card.id,place:choose(g,g.locations.filter(l=>l.id!==card.place),'false-place',g.phaseIndex,p.id).id}}const precise=/사고|분석|냉정|정리/.test(p.traits||'');const conflict=cards.find(c=>conflicts(g.board,c).length);if(conflict&&precise)return {kind:'card',cardId:conflict.id};if(cards.length&&random(g.seed,'reveal',g.phaseIndex,p.id)>.35)return {kind:'card',cardId:choose(g,cards,'card',g.phaseIndex,p.id).id};return {kind:'accuse',targetId:suspect(g,p)?.id}}
function resolveDebate(g){
 if(g.debateRound===0){
  for(const p of alive(g)){
   const submitted=g.submissions[p.id];
   const segments=submitted?.kind==='statement'&&validateStatement(g,submitted.segments)?submitted.segments:openingStatement(g,p);
   g.history.push({kind:'statement',speaker:p.id,day:g.day,segments:segments.map(({period,place,action})=>({period,place,action}))});
  }
  g.debateRound=1;return;
 }
 for(const p of alive(g)){
 const action=g.submissions[p.id]||autoDebate(g,p),cards=g.cards[p.id]||[];
 if(action.kind==='card'||action.kind==='forge'){const original=cards.find(c=>c.id===action.cardId);if(original){let card={...original};if(action.kind==='forge'&&p.role==='mafia'&&p.forgedDay!==g.day){card.place=action.place;card.forged=true;p.forgedDay=g.day;if(g.rulesVersion===2)addCard(g,p,{...card,id:'forged-'+g.phaseIndex+'-'+p.id,action:'task'})}publish(g,p,card)}}
 else if(action.kind==='accuse'||action.kind==='defend'){const target=alive(g).find(q=>q.id===action.targetId&&q.id!==p.id);if(target){g.history.push({kind:action.kind,speaker:p.id,target:target.id,day:g.day});if(action.kind==='accuse'){const response=(g.cards[target.id]||[]).find(c=>c.kind==='alibi'&&!['tag','sabotage'].includes(c.action));if(response){publish(g,target,response);g.history.push({kind:'rebut',speaker:target.id,target:p.id,day:g.day})}}}}
 else g.history.push({kind:'pass',speaker:p.id,day:g.day});
 }g.debateRound++;if(g.debateRound>=3)g.phase='vote';
}
function resolveVote(g){if(g.meetingControls===2)return require('./mafia-voting')(module.exports).resolve(g);const tally={};g.voteResults=[];for(const p of alive(g)){const target=g.submissions[p.id]?.targetId||suspect(g,p)?.id;if(target&&alive(g).some(q=>q.id===target&&q.id!==p.id)){tally[target]=(tally[target]||0)+1;g.voteResults.push({voter:p.id,target})}}const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);if(sorted.length&&sorted[0][1]>(sorted[1]?.[1]||0)){const target=g.players.find(p=>p.id===sorted[0][0]);target.alive=false;g.history.push({kind:'voted',target:target.id,day:g.day})}else g.history.push({kind:'tie',day:g.day});if(!finish(g)){g.day++;g.phase='plan'}}
function advance(g,now){let count=0;while(g.status==='playing'&&g.deadlineAt<=now&&count++<50){if(g.phase==='plan')resolvePlan(g);else if(g.phase==='debate')resolveDebate(g);else resolveVote(g);g.phaseIndex++;g.submissions={};g.deadlineAt+=g.mode==='live'?(g.phase==='plan'?60000:45000):g.durationMs;g.history=g.history.slice(-200);g.board=g.board.slice(-120)}return g}
function view(g,uid){const mine=g.players.filter(p=>p.ownerUid===uid&&!p.delegated);return {id:g.id,name:g.name,status:g.status,createdAt:g.createdAt||0,hostUid:g.hostUid,mode:g.mode||'async',actionTick:g.actionTick||0,phase:g.phase,phaseIndex:g.phaseIndex,debateRound:g.debateRound??null,day:g.day,deadlineAt:g.deadlineAt,capacity:g.capacity,locations:g.locations,progress:g.progress||0,winner:g.winner||null,players:g.players.map(({role,place,traits,sleep,forgedDay,...p})=>({...p,...(g.status==='finished'||mine.some(m=>m.id===p.id)?{role}:{}),...(mine.some(m=>m.id===p.id)?{place,submitted:!!g.submissions?.[p.id]}:{})})),board:g.board||[],history:g.history||[],openingDrafts:g.phase==='debate'?Object.fromEntries(mine.map(p=>[p.id,openingStatement(g,p)])):{},privateCards:Object.fromEntries(mine.map(p=>[p.id,g.cards?.[p.id]||[]]))}}
module.exports={voteRelation:require('./mafia-voting')({}).relation,voteTraits:require('./mafia-voting')({}).profile,publish,random,start,advance,view,validatePlan,neighbours,conflicts,autoPlan,suspicion,openingStatement,validateStatement,addCard,finish,resolveDebate,resolveVote};
