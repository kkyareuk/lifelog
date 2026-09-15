// Opt-in rules for new games. Records describe observed events, never hidden roles.
module.exports=(base,conversation,playback)=>{
 const living=g=>g.players.filter(p=>p.alive);
 const log=(g,h)=>{g.history.push({...h,day:g.day});g.meetingRevision=(g.meetingRevision||0)+1};
 const phase=(g,name,now,seconds)=>{g.phase=name;g.phaseIndex++;g.submissions={};g.deadlineAt=Math.min(now+seconds*1000,g.meetingEndsAt)};
 function open(g,now){g.meetingEndsAt||=now+300000;g.currentClaim=null;g.claims=[];g.claimCursor=0;g.challengeOwner='';phase(g,'discussion',now,20)}
 function report(g){
  g.sceneReports||=[];
  for(const b of g.bodies.filter(b=>b.reported&&!g.sceneReports.some(r=>r.bodyId===b.id))){
   const traces=g.traces.filter(t=>t.place===b.place&&t.day===(b.day||g.day));
   const clues=[{kind:'time',day:b.day||g.day,tick:b.tick??traces.find(t=>t.action==='blood')?.tick??0},...traces.filter(t=>['blood','object','wiped'].includes(t.action)).slice(-2).map(t=>({kind:t.action,day:t.day,tick:t.tick}))];
   g.sceneReports.push({id:'scene:'+b.id,bodyId:b.id,day:g.day,place:b.place,clues});
   log(g,{kind:'discovery',target:b.id,place:b.place});
  }
 }
 function submit(g,p,a,now){
  if(['discussion','claim','floor','rebuttal'].includes(g.phase)&&['accuse','testify','agree','alibi'].includes(a.kind)){
   if(g.phase!=='discussion'&&a.kind==='accuse')throw Error('game-invalid-action');
   if(a.kind==='accuse'){
    if(!living(g).some(q=>q.id===a.targetId&&q.id!==p.id))throw Error('game-invalid-target');
    const accused=g.players.find(q=>q.id===a.targetId);
    log(g,{kind:'accuse',speaker:p.id,target:accused.id});
    g.currentClaim={kind:'questioned',speaker:accused.id,accuser:p.id};g.challengeOwner='';g.claimIssues||={};
    phase(g,'claim',now,12);return;
   }
   if(a.kind==='alibi'){
    if(p.id!==g.currentClaim?.speaker||g.currentClaim.kind!=='questioned')throw Error('game-invalid-action');
    const c=playback.options(g,p).find(c=>c.id===a.optionId);if(!c)throw Error('game-private-card');
    g.currentClaim={...c,speaker:p.id};log(g,{kind:'claim',...g.currentClaim});phase(g,'claim',now,8);return;
   }
   if(g.submissions[p.id]?.kind===a.kind)throw Error('game-invalid-action');
   if(a.kind==='testify'){
    const c=(g.cards?.[p.id]||[]).find(c=>c.id===a.cardId&&['witness','exchange'].includes(c.kind)&&c.subject!==p.id&&!c.heardFrom);
    if(!c)throw Error('game-private-card');
    base.publish(g,p,c);const {forged,sourceChain,...publicCard}=c;log(g,{kind:'testify',speaker:p.id,target:c.subject,card:publicCard});
   }else{
    const latest=g.history.filter(h=>['accuse','testify','challenge','rebuttal','claim'].includes(h.kind)&&h.day===g.day).at(-1);
    if(!latest||latest.speaker===p.id)throw Error('game-invalid-action');
    log(g,{kind:'agree',speaker:p.id,target:latest.speaker});
   }
   g.submissions[p.id]={kind:a.kind};return;
  }
  return conversation.submit(g,p,a,now);
 }
 function advance(g,now){
  if(g.status!=='playing')return g;
  if(g.phase==='discussion'){
   if(now>=g.meetingEndsAt){g.phase='vote';g.phaseIndex++;g.submissions={};g.deadlineAt=now+45000;delete g.meetingEndsAt;return g}
   if(now<g.deadlineAt)return g;
   const npcs=living(g).filter(p=>p.delegated),npc=npcs[Math.floor(base.random(g.seed,'floor',g.phaseIndex)*npcs.length)];
   if(npc){const witnesses=(g.cards[npc.id]||[]).filter(c=>c.kind==='witness'&&!c.heardFrom&&c.day===g.day);const others=living(g).filter(p=>p.id!==npc.id);
    if(!g.submissions[npc.id]&&witnesses.length&&base.random(g.seed,'testify',g.phaseIndex)>.5){submit(g,npc,{kind:'testify',cardId:witnesses.at(-1).id},now);g.deadlineAt=Math.min(now+8000,g.meetingEndsAt)}
    else if(others.length){const target=others.sort((a,b)=>(g.claimIssues?.[b.id]||0)+(g.bias?.[npc.id+':'+b.id]||0)-(g.claimIssues?.[a.id]||0)-(g.bias?.[npc.id+':'+a.id]||0))[0];submit(g,npc,{kind:'accuse',targetId:target.id},now)}
   }else g.deadlineAt=Math.min(now+20000,g.meetingEndsAt);
   return g;
  }
  if(g.phase==='claim'&&g.currentClaim?.kind==='questioned'){
   const p=g.players.find(p=>p.id===g.currentClaim.speaker);
   if(p?.delegated&&g.deadlineAt-now<=8000){submit(g,p,{kind:'alibi',optionId:playback.options(g,p)[0].id},now);return g}
  }
  if(g.phase==='claim'&&now>=g.deadlineAt&&now<g.meetingEndsAt){phase(g,g.challengeOwner?'challenge':'floor',now,12);return g}
  const before=g.phase;conversation.advance(g,now);report(g);
  if(g.phase==='alibi')open(g,now);
  else if(g.phase==='finalSpeech'&&before!=='finalSpeech'&&now<g.meetingEndsAt-20000)open(g,now);
  return g;
 }
 function view(g,uid){const out=conversation.view(g,uid),p=g.players.find(p=>p.ownerUid===uid&&!p.delegated);out.notebook=true;out.searchAvailable=!!p&&g.phase==='act'&&g.traces.some(t=>t.place===p.place&&!(g.cards?.[p.id]||[]).some(c=>c.originId===t.id));out.sceneReports=g.sceneReports||[];out.currentClaim=['discussion','claim','floor','challenge','rebuttal','finalSpeech'].includes(g.phase)?g.currentClaim||null:null;out.alibiOptions=p&&g.currentClaim?.speaker===p.id?playback.options(g,p):[];out.testimonyCards=p?(g.cards?.[p.id]||[]).filter(c=>['witness','exchange'].includes(c.kind)&&!c.heardFrom&&c.subject!==p.id).map(c=>c.id):[];return out}
 return {advance,view,submit};
};
