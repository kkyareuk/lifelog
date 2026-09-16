// Meeting controls v2. Only opt-in games use these rules; older clients keep theirs.
module.exports=(base,previous,playback)=>{
 const alive=g=>g.players.filter(p=>p.alive),allNPC=g=>!alive(g).some(p=>!p.delegated);
 const meeting=new Set(['discussion','claim','reply','rebuttal','finalSpeech']);
 const clean=({forged,sourceChain,...c})=>c;
 const log=(g,row)=>{g.history.push({...row,day:g.day});g.history=g.history.slice(-240);g.meetingRevision=(g.meetingRevision||0)+1};
 const pressure=(g,id,n)=>{g.claimIssues||={};g.claimIssues[id]=Math.max(0,Math.min(12,(g.claimIssues[id]||0)+n))};
 const phase=(g,name,now,seconds)=>{g.phase=name;g.phaseIndex++;g.phaseStartedAt=now;g.submissions={};g.deadlineAt=Math.min(now+(allNPC(g)?2:seconds)*1000,g.meetingEndsAt||Infinity)};
 function vote(g,now){delete g.meetingEndsAt;g.currentClaim=null;g.intervention=null;phase(g,'vote',now,20)}
 function next(g,now){g.intervention=null;g.currentClaim=null;if(g.speechLeft<=0||now>=g.meetingEndsAt-12000){const p=alive(g).sort((a,b)=>(g.claimIssues?.[b.id]||0)-(g.claimIssues?.[a.id]||0))[0];g.currentClaim={kind:'final',speaker:p.id};phase(g,'finalSpeech',now,12)}else phase(g,'discussion',now,15)}
 function open(g,now){g.meetingEndsAt=now+300000;g.speechLeft=6+Math.floor(alive(g).length/2);g.forgeryUsed={};g.silent={};g.intervention=null;g.currentClaim=null;phase(g,'discussion',now,15)}
 function evidence(g,p,a){
  if(!a.cardId)return null;
  const found=(g.cards[p.id]||[]).find(c=>c.id===a.cardId);if(!found)throw Error('game-private-card');
  if(a.forge){if(p.role!=='mafia'||g.forgeryUsed?.[p.id])throw Error('game-invalid-action');if(!g.locations.some(l=>l.id===a.forgePlace&&l.id!==found.place))throw Error('game-invalid-action');g.forgeryUsed[p.id]=true;return {...found,id:found.id+':statement:'+g.phaseIndex,place:a.forgePlace,forged:true,sourceChain:[p.id]}}
  return found;
 }
 function speak(g,p,a,now){
  const targets=alive(g).filter(q=>q.id!==p.id);
  if(['accuse','defend','request'].includes(a.kind)&&!targets.some(q=>q.id===a.targetId))throw Error('game-invalid-target');
  if(a.kind==='request'&&![0,1,2,3].includes(a.period))throw Error('game-invalid-action');
  const c=evidence(g,p,a);if(c)base.publish(g,p,c);
  const claim={kind:a.kind,speaker:p.id,target:a.targetId||'',period:a.period??null,...(c?{card:clean(c)}:{})};
  if(a.kind==='accuse')pressure(g,a.targetId,c?2:1);
  if(a.kind==='defend'){pressure(g,a.targetId,c?-1:0);g.defenseLinks||=[];g.defenseLinks.push({speaker:p.id,target:a.targetId,day:g.day})}
  if(a.kind==='changeTopic')pressure(g,p.id,1);
  if(a.kind==='pass'){g.silent[p.id]=(g.silent[p.id]||0)+1;if(g.silent[p.id]>1)pressure(g,p.id,1)}
  g.speechLeft--;g.intervention=null;g.currentClaim=claim;log(g,claim);phase(g,'claim',now,8);
 }
 function intervene(g,p,a,now){
  if(!['claim','rebuttal'].includes(g.phase)||!g.currentClaim||p.id===g.currentClaim.speaker||g.intervention)throw Error('game-invalid-action');
  if(a.kind==='pass'){g.submissions[p.id]={kind:'pass'};return}
  if(!['oppose','agree'].includes(a.kind))throw Error('game-invalid-action');
  const c=evidence(g,p,a);g.intervention={kind:a.kind,speaker:p.id,target:g.currentClaim.speaker,card:c||null};
  // Reserving does not skip the current sentence or reset its reading time.
  log(g,{kind:'reservation',speaker:p.id,target:g.currentClaim.speaker});
 }
 function resolveIntervention(g,now){
  const row=g.intervention,p=g.players.find(p=>p.id===row.speaker);g.intervention=null;
  if(row.card)base.publish(g,p,row.card);
  if(row.kind==='oppose'&&row.card){const c=g.currentClaim.card,conflict=c&&c.subject===row.card.subject&&c.day===row.card.day&&c.tick===row.card.tick&&c.place!==row.card.place;pressure(g,conflict?row.target:row.speaker,conflict?2:1)}
  const publicRow={kind:row.kind,speaker:row.speaker,target:row.target,...(row.card?{card:clean(row.card)}:{})};
  log(g,publicRow);g.currentClaim=publicRow;phase(g,'rebuttal',now,8);
 }
 function submit(g,p,a,now){
  if(!p.alive)throw Error('game-invalid-action');
  if(!meeting.has(g.phase))return previous.submit(g,p,a,now);
  if(now>=g.deadlineAt||now>=g.meetingEndsAt)throw Error('game-stale-phase');
  if(g.phase==='discussion'){if(!['accuse','defend','request','changeTopic','pass'].includes(a.kind))throw Error('game-invalid-action');return speak(g,p,a,now)}
  if(g.phase==='reply'){
   if(p.id!==g.currentClaim.target||a.kind!=='alibi')throw Error('game-invalid-action');
   const option=playback.options(g,p).find(c=>c.id===a.optionId);if(!option)throw Error('game-private-card');
   g.currentClaim={...option,speaker:p.id};log(g,{kind:'claim',...g.currentClaim});phase(g,'claim',now,8);return;
  }
  if(g.phase==='finalSpeech'){
   if(p.id!==g.currentClaim.speaker||!['accuse','defend','pass'].includes(a.kind))throw Error('game-invalid-action');
   speak(g,p,a,now);g.finalDone=true;return;
  }
  return intervene(g,p,a,now);
 }
 function npcSpeech(g,p,now){
  const others=alive(g).filter(q=>q.id!==p.id),privateCards=g.cards[p.id]||[];
  // Only public pressure, private observations and the character's own attitudes.
  const target=others.sort((a,b)=>(g.claimIssues?.[b.id]||0)+(g.bias?.[p.id+':'+b.id]||0)-(g.claimIssues?.[a.id]||0)-(g.bias?.[p.id+':'+a.id]||0))[0];
  const friend=others.find(q=>(g.bias?.[p.id+':'+q.id]||0)<-2&&(g.claimIssues?.[q.id]||0)>0);
  const r=base.random(g.seed,'meeting',g.phaseIndex,p.id),kind=friend?'defend':r<.2?'request':r<.3?'changeTopic':'accuse',subject=friend||target;
  const c=privateCards.filter(c=>c.subject===subject?.id).at(-1);
  submit(g,p,{kind,targetId:subject?.id,period:Math.min(3,g.period||0),...(c?{cardId:c.id}:{})},now);
 }
 function advance(g,now){
  if(g.status!=='playing')return g;
  if(!meeting.has(g.phase)){
   previous.advance(g,now);
   if(g.phase==='discussion'||g.phase==='alibi')open(g,now);
   return g;
  }
  if(!g.meetingEndsAt)open(g,now);
  if(now>=g.meetingEndsAt){vote(g,now);return g}
  const elapsed=now-(g.phaseStartedAt||0);
  if(g.phase==='discussion'&&elapsed>=(allNPC(g)?1900:6000)){
   const candidates=alive(g).filter(p=>p.delegated);const p=candidates.sort((a,b)=>base.random(g.seed,g.phaseIndex,a.id)-base.random(g.seed,g.phaseIndex,b.id))[0];
   if(p){npcSpeech(g,p,Math.min(now,g.deadlineAt-1));return g}
  }
  if(g.phase==='reply'&&elapsed>=(allNPC(g)?1900:5000)){
   const p=alive(g).find(p=>p.id===g.currentClaim.target);
   if(p?.delegated){const opts=playback.options(g,p);submit(g,p,{kind:'alibi',optionId:opts.find(c=>Math.floor((c.tick||0)/2)===g.currentClaim.period)?.id||'unknown'},Math.min(now,g.deadlineAt-1));return g}
  }
  if(['claim','rebuttal'].includes(g.phase)&&!g.intervention&&elapsed>=(allNPC(g)?1000:5000)){
   const npc=alive(g).find(p=>p.delegated&&p.id!==g.currentClaim.speaker&&base.random(g.seed,'response',g.phaseIndex,p.id)>.7);
   if(npc){const c=(g.cards[npc.id]||[]).find(c=>c.subject===g.currentClaim.speaker);intervene(g,npc,{kind:(g.bias?.[npc.id+':'+g.currentClaim.speaker]||0)<0?'agree':'oppose',...(c?{cardId:c.id}:{})},now)}
  }
  if(now<g.deadlineAt)return g;
  if(g.phase==='finalSpeech'||g.finalDone){g.finalDone=false;vote(g,now)}
  else if(g.intervention)resolveIntervention(g,now);
  else if(g.phase==='claim'&&g.currentClaim.kind==='request')phase(g,'reply',now,12);
  else next(g,now);
  return g;
 }
 function view(g,uid){
  const out=previous.view(g,uid),p=g.players.find(p=>p.ownerUid===uid&&!p.delegated);
  out.meetingControls=2;out.currentClaim=meeting.has(g.phase)?g.currentClaim:null;out.challengeOwner=g.intervention?.speaker||'';out.questions=[];out.challengeCards=[];out.speechLeft=g.speechLeft||0;
  out.alibiOptions=g.phase==='reply'&&g.currentClaim?.target===p?.id?playback.options(g,p):[];
  out.replyTo=g.phase==='reply'?g.currentClaim?.target||'':'';
  out.canForge=!!p?.alive&&p.role==='mafia'&&!g.forgeryUsed?.[p.id];
  out.allies=p?.role==='mafia'?g.players.filter(q=>q.role==='mafia'&&q.id!==p.id).map(q=>({id:q.id,pressure:g.claimIssues?.[q.id]||0})):[];
  return out;
 }
 return {submit,advance,view};
};
