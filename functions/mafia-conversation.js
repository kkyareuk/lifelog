// Rules v4: a meeting is one bounded conversation, with an accountable reply.
module.exports=(base,playback)=>{
 const phases=new Set(['alibi','claim','reply','floor','challenge','rebuttal','finalSpeech']);
 const alive=g=>g.players.filter(p=>p.alive);
 const clean=({forged,sourceChain,...c})=>c;
 const log=(g,row)=>{g.history.push({...row,day:g.day});g.history=g.history.slice(-200);g.meetingRevision=(g.meetingRevision||0)+1};
 const related=(g,p)=>(g.cards[p.id]||[]).filter(c=>c.day===g.day&&(c.subject===g.currentClaim?.speaker||c.subject===g.currentClaim?.partner||c.place===g.currentClaim?.place));
 function phase(g,name,now,seconds){g.phase=name;g.phaseIndex++;g.submissions={};g.deadlineAt=Math.min(now+seconds*1000,g.meetingEndsAt||Infinity)}
 function vote(g,now){g.currentClaim=null;g.challengeOwner='';g.phase='vote';g.phaseIndex++;g.submissions={};g.deadlineAt=now+45000;delete g.meetingEndsAt}
 function final(g,now){
  const suspects=alive(g).map(p=>({p,score:g.claimIssues?.[p.id]||0})).sort((a,b)=>b.score-a.score||a.p.id.localeCompare(b.p.id));
  g.finalSpeaker=suspects[0]?.p.id||'';g.currentClaim={speaker:g.finalSpeaker,kind:'final'};
  log(g,{kind:'finalSpeaker',speaker:g.finalSpeaker,score:suspects[0]?.score||0});phase(g,'finalSpeech',now,20);
 }
 function next(g,now){g.challengeOwner='';g.currentClaim=g.claims[g.claimCursor++]||null;if(!g.currentClaim)return final(g,now);log(g,{kind:'claim',...g.currentClaim});phase(g,'claim',now,5)}
 function answer(g,p,value,now){
  log(g,{kind:'reply',speaker:p.id,target:g.currentClaim.speaker,value});
  const id=g.currentClaim.speaker;g.claimIssues[id]=(g.claimIssues[id]||0)+(value==='deny'?2:value==='unknown'?1:-1);
  phase(g,'floor',now,10);
 }
 function submit(g,p,a,now){
  if(!phases.has(g.phase)||g.phase==='alibi')return playback.submit(g,p,a,now);
  if(g.phase==='reply'){
   if(p.id!==g.currentClaim.partner||a.kind!=='reply'||!['confirm','deny','unknown'].includes(a.value))throw Error('game-invalid-action');
   answer(g,p,a.value,now);return;
  }
  if(['claim','floor'].includes(g.phase)&&a.kind==='reserveChallenge'){
   if(g.challengeOwner||p.id===g.currentClaim.speaker||!related(g,p).length)throw Error('game-invalid-action');
   g.challengeOwner=p.id;log(g,{kind:'reservation',speaker:p.id,target:g.currentClaim.speaker});
   if(g.phase==='floor')phase(g,'challenge',now,12);return;
  }
  if(g.phase==='challenge'){
   if(p.id!==g.challengeOwner||a.kind!=='card')throw Error('game-invalid-action');
   const c=related(g,p).find(c=>c.id===a.cardId);if(!c)throw Error('game-private-card');
   base.publish(g,p,c);log(g,{kind:'challenge',speaker:p.id,target:g.currentClaim.speaker,card:clean(c)});g.challengeOwner='';phase(g,'rebuttal',now,12);return;
  }
  if(g.phase==='rebuttal'||g.phase==='finalSpeech'){
   const speaker=g.currentClaim.speaker;
   if(a.kind==='agree'&&p.id!==speaker){if(g.submissions[p.id])throw Error('game-invalid-action');g.submissions[p.id]={kind:'agree'};log(g,{kind:'agree',speaker:p.id,target:speaker});return}
   if(p.id!==speaker)throw Error('game-invalid-action');
   if(a.kind==='card'){
    const c=(g.cards[p.id]||[]).find(c=>c.id===a.cardId);if(!c)throw Error('game-private-card');
    base.publish(g,p,c);log(g,{kind:'rebuttal',speaker:p.id,card:clean(c)});
   }else if(a.kind==='pass')log(g,{kind:'noReply',speaker:p.id});
   else if(g.phase==='finalSpeech'&&a.kind==='accuse'&&alive(g).some(q=>q.id===a.targetId&&q.id!==p.id))log(g,{kind:'accuse',speaker:p.id,target:a.targetId});
   else throw Error('game-invalid-action');
   // Keep the response on screen, allowing others to agree before the next claim.
   g.submissions[p.id]={kind:'done'};g.deadlineAt=Math.min(g.deadlineAt,now+4000);return;
  }
  throw Error('game-invalid-action');
 }
 function advance(g,now){
  if(g.status!=='playing')return g;
  if(!phases.has(g.phase)){
   playback.advance(g,now);
   if(g.phase==='alibi'&&!g.meetingEndsAt){g.meetingEndsAt=now+300000;g.claimIssues={};g.finalSpeaker=''}
   return g;
  }
  if(!g.meetingEndsAt){g.meetingEndsAt=now+300000;g.claimIssues={};}
  if(now>=g.meetingEndsAt){vote(g,now);return g}
  if(g.phase!=='finalSpeech'&&now>=g.meetingEndsAt-20000){final(g,now);return g}
  const responder=g.players.find(p=>p.id===(g.phase==='reply'?g.currentClaim?.partner:g.phase==='challenge'?g.challengeOwner:g.currentClaim?.speaker));
  if(['rebuttal','finalSpeech'].includes(g.phase)&&responder?.delegated&&!g.submissions[responder.id]&&g.deadlineAt-now<=8000){const card=(g.cards[responder.id]||[]).filter(c=>c.day===g.day&&c.subject===responder.id).at(-1);submit(g,responder,card?{kind:'card',cardId:card.id}:{kind:'pass'},now);return g;}
  if(g.phase==='reply'&&responder?.delegated&&g.deadlineAt-now<=10000){
   const known=(g.cards[responder.id]||[]).filter(c=>c.day===g.currentClaim.day&&c.tick===g.currentClaim.tick&&c.kind==='alibi');
   const value=known.some(c=>c.place===g.currentClaim.place)?'confirm':known.length?'deny':'unknown';answer(g,responder,value,now);return g;
  }
  if(g.deadlineAt>now)return g;
  if(g.phase==='alibi'){
   g.claims=alive(g).map(p=>({...playback.options(g,p).find(c=>c.id===g.submissions[p.id]?.optionId)||playback.options(g,p)[0],speaker:p.id}));
   for(const c of g.claims)g.claimIssues[c.speaker]=c.kind==='together'?0:c.kind==='visit'?1:2;
   g.claimCursor=0;next(g,now);
  }else if(g.phase==='claim'){
   const partner=alive(g).find(p=>p.id===g.currentClaim.partner);
   phase(g,partner?'reply':g.challengeOwner?'challenge':'floor',now,partner?15:g.challengeOwner?12:10);
  }else if(g.phase==='reply'){if(responder)answer(g,responder,'unknown',now);else phase(g,'floor',now,10)}
  else if(g.phase==='floor'){if(g.challengeOwner)phase(g,'challenge',now,12);else next(g,now)}
  else if(g.phase==='challenge'){log(g,{kind:'noEvidence',speaker:g.challengeOwner});next(g,now)}
  else if(g.phase==='rebuttal')next(g,now);
  else if(g.phase==='finalSpeech')vote(g,now);
  return g;
 }
 function view(g,uid){
  const out=playback.view(g,uid),p=g.players.find(p=>p.ownerUid===uid&&!p.delegated);
  out.rulesVersion=4;out.meetingEndsAt=g.meetingEndsAt||0;out.meetingRevision=g.meetingRevision||0;
  out.currentClaim=phases.has(g.phase)?g.currentClaim||null:null;
  out.challengeCards=p?.alive&&['claim','floor','challenge'].includes(g.phase)?related(g,p).map(c=>c.id):[];
  out.replyTo=g.phase==='reply'?g.currentClaim?.partner||'':'';
  out.finalSpeaker=g.finalSpeaker||'';
  return out;
 }
 return {advance,submit,view};
};
