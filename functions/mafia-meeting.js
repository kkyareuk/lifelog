// Main opinions remain in place while every participant can attach a reaction.
module.exports=(base,previous,playback)=>{
 const alive=g=>g.players.filter(p=>p.alive),human=g=>alive(g).filter(p=>!p.delegated);
 const phases=new Set(['discussion','claim','reply','rebuttal','finalSpeech']);
 const voters=g=>human(g).length?human(g):g.players.filter(p=>!p.delegated);
 const clean=({forged,sourceChain,...c})=>c;
 const log=(g,row)=>{g.history.push({...row,day:g.day});g.history=g.history.slice(-240);g.meetingRevision=(g.meetingRevision||0)+1};
 const pressure=(g,id,n)=>{g.claimIssues||={};g.claimIssues[id]=Math.max(0,Math.min(12,(g.claimIssues[id]||0)+n))};
 const phase=(g,name,now,seconds)=>{g.phase=name;g.phaseIndex++;g.phaseStartedAt=now;g.submissions={};g.deadlineAt=Math.min(now+(human(g).length?seconds:2)*1000,g.meetingEndsAt||Infinity)};
 function vote(g,now){delete g.meetingEndsAt;delete g.skipAt;g.currentClaim=null;g.reactions=[];g.intervention=null;phase(g,'vote',now,20)}
 function next(g,now){
  const ids=alive(g).map(p=>p.id);g.speakerCursor=((g.speakerCursor??-1)+1)%Math.max(1,ids.length);g.turnSpeaker=ids[g.speakerCursor]||'';
  g.currentClaim=null;g.reactions=[];g.intervention=null;g.npcReactionDone=false;phase(g,'discussion',now,30);
 }
 function open(g,now){g.meetingEndsAt=now+300000;g.meetingSkip=[];g.opinionQueue=[];g.speakerCursor=-1;g.mainCounts={};g.reactions=[];g.forgeryUsed={};g.silent={};delete g.skipAt;next(g,now)}
 const category=c=>(c?.kind==='autopsy'||c?.kind==='trace'&&['footprint','blood','object','wiped'].includes(c.action))?'autopsy':c?.kind==='movement'?'route':c?.kind==='intuition'?'lie':c?.kind==='contradiction'?'contradiction':null;
 function grounds(g,p,a){
  const kinds=a.kind==='oppose'?['fabricated','lie','impossible','insufficient']:['none','autopsy','route','lie','contradiction'];
  const reason=a.reason||'none';if(a.reason&&!kinds.includes(reason))throw Error('game-invalid-action');
  if(a.cardId){const c=(g.cards[p.id]||[]).find(c=>c.id===a.cardId),type=category(c);if(!type)throw Error('game-private-card');const expected={impossible:'route',fabricated:null,insufficient:null}[reason]||reason;if(!['fabricated','insufficient'].includes(reason)&&type!==expected)throw Error('game-invalid-action');}
  return reason;
 }
 function evidence(g,p,a){
  if(!a.cardId)return null;
  const found=(g.cards[p.id]||[]).find(c=>c.id===a.cardId);if(!found)throw Error('game-private-card');
  if(a.forge){if(p.role!=='mafia'||g.forgeryUsed?.[p.id])throw Error('game-invalid-action');if(!g.locations.some(l=>l.id===a.forgePlace&&l.id!==found.place))throw Error('game-invalid-action');g.forgeryUsed[p.id]=true;return {...found,place:a.forgePlace,...(found.kind==='movement'?{to:a.forgePlace}:{}),forged:true,sourceChain:[p.id]}}
  return found;
 }
 // An observation is not an accusation. Only compare a specific presence claim
 // with the observer's own, complete survey at exactly that time and place.
 function conflict(claim,c){
  if(!claim||!c)return false;
  const asserted=claim.account||(['together','visit'].includes(claim.kind)?claim:null);
  if(!asserted||!Number.isInteger(asserted.tick)||asserted.day!==c.day||asserted.tick!==c.tick)return false;
  return c.kind==='survey'&&c.place===asserted.place&&Array.isArray(c.seenIds)&&!c.seenIds.includes(asserted.speaker||claim.speaker)&&c.subject!==(asserted.speaker||claim.speaker)
   ||asserted.kind==='together'&&asserted.partner===c.subject&&c.kind==='alibi'&&c.place!==asserted.place;
 }
 function react(g,p,a,now){
  if(!g.currentClaim||g.phase!=='rebuttal'||p.id===g.currentClaim.speaker||!['oppose','agree','pass'].includes(a.kind))throw Error('game-invalid-action');
  if((g.reactions||[]).some(r=>r.speaker===p.id))throw Error('game-already-submitted');
  const reason=grounds(g,p,a),c=evidence(g,p,a),mismatch=a.kind==='oppose'&&(conflict(g.currentClaim,c)||c?.kind==='contradiction'&&c.subject===(g.currentClaim.account?.speaker||g.currentClaim.speaker));
  if(c)base.publish(g,p,c);
  const startsAt=Math.max(now,(g.reactions||[]).at(-1)?.endsAt||0);
  const row={kind:a.kind,reason,startsAt,endsAt:startsAt+2000,speaker:p.id,target:g.currentClaim.speaker,opinionId:g.currentClaim.id,...(c?{card:clean(c)}:{}),...(mismatch?{contradiction:{account:g.currentClaim.account||g.currentClaim,observation:clean(c)}}:{})};
  if(a.kind!=='pass')pressure(g,p.id,1);
  if(mismatch)pressure(g,g.currentClaim.account?.speaker||g.currentClaim.speaker,2);
  g.reactions||=[];g.reactions.push(row);log(g,row);g.deadlineAt=Math.min(g.meetingEndsAt,Math.max(g.deadlineAt,row.endsAt));
 }
 function speak(g,p,a,now){
  if(['accuse','defend','request','silence'].includes(a.kind)&&!alive(g).some(q=>q.id===a.targetId&&q.id!==p.id))throw Error('game-invalid-target');
  if(a.kind==='silence'&&(g.mainCounts?.[a.targetId]||0)>0)a={...a,kind:'request',period:g.period||0};
  if(a.kind==='request'&&![0,1,2,3].includes(a.period))throw Error('game-invalid-action');
  const prior=g.history.findLast(h=>h.day===g.day&&h.speaker===p.id&&['accuse','defend'].includes(h.kind)&&!h.withdrawn);
  if(a.kind==='changeStance'&&!prior)throw Error('game-invalid-action');
  const reason=grounds(g,p,a),c=evidence(g,p,a);if(c)base.publish(g,p,c);
  if(a.kind==='changeStance')prior.withdrawn=true;
  const claim={id:g.day+':'+g.phaseIndex+':'+p.id,kind:a.kind,reason,speaker:p.id,target:a.targetId||prior?.target||'',period:a.period??null,...(c?{card:clean(c)}:{})};
  // Baseless suspicion remains an opinion, never a proof of guilt.
  if(a.kind==='accuse')pressure(g,a.targetId,1);
  if(a.kind==='changeTopic'||a.kind==='changeStance')pressure(g,p.id,1);
  g.mainCounts||={};g.mainCounts[p.id]=(g.mainCounts[p.id]||0)+1;
  g.currentClaim=claim;g.reactions=[];g.intervention=null;log(g,claim);
  for(const observer of alive(g).filter(q=>q.id!==p.id)){const score=((observer.gameSkills?.intuitionSkill??50)+(observer.gameSkills?.intelligenceSkill??50))/2-((p.gameSkills?.deceptionSkill??50)+(p.gameSkills?.composureSkill??50))/2;const chance=Math.max(.08,Math.min(.65,.22+score/300+(c?.forged?.15:0)));if(c?.forged&&!(g.cards[observer.id]||[]).some(x=>x.kind==='intuition'&&x.subject===p.id&&x.day===g.day)&&base.random(g.seed,'impression',claim.id,observer.id)<chance){g.cards[observer.id]||=[];g.cards[observer.id].push({id:'intuition-'+claim.id+':'+observer.id,kind:'intuition',subject:p.id,day:g.day,tick:g.period*2,place:'',action:'intuition'});}}phase(g,'claim',now,8);
 }
 function submit(g,p,a,now){
  if(!p.alive&&a.kind!=='skipMeeting')throw Error('game-invalid-action');
  if(g.nightCycle&&g.phase==='night'){if(now>=g.deadlineAt||p.role!=='mafia'||a.kind!=='nightHit'||!alive(g).some(q=>q.id===a.targetId&&q.role!=='mafia'))throw Error('game-invalid-action');g.nightVotes||={};g.nightVotes[p.id]=a.targetId;const voters=alive(g).filter(q=>q.role==='mafia'&&!q.delegated);if(voters.every(q=>g.nightVotes[q.id]))g.deadlineAt=Math.min(g.deadlineAt,now+2000);g.meetingRevision=(g.meetingRevision||0)+1;return}
  if(!phases.has(g.phase))return previous.submit(g,p,a,now);
  if(now>=g.meetingEndsAt||g.skipAt&&now>=g.skipAt)throw Error('game-stale-phase');
  if(a.kind==='skipMeeting'){
   if(!voters(g).some(q=>q.id===p.id))throw Error('game-invalid-action');g.meetingSkip||=[];
   if(!g.meetingSkip.includes(p.id)){g.meetingSkip.push(p.id);log(g,{kind:'meetingSkip',speaker:p.id})}
   if(voters(g).every(q=>g.meetingSkip.includes(q.id))){if(!human(g).length){vote(g,now);return;}if(!g.skipAt){g.skipAt=now+2000;g.deadlineAt=Math.min(g.deadlineAt,g.skipAt)}}return;
  }
  if(now>=g.deadlineAt)throw Error('game-stale-phase');
  if(g.phase==='discussion'){
   if(p.id!==g.turnSpeaker)throw Error('game-not-your-turn');
   if(!['accuse','defend','request','changeTopic','silence','changeStance','pass'].includes(a.kind))throw Error('game-invalid-action');return speak(g,p,a,now);
  }
  if(a.kind==='alibi'){
   if(g.phase!=='reply'||g.currentClaim?.target!==p.id)throw Error('game-invalid-action');
   const option=playback.options(g,p).find(c=>c.id===a.optionId);if(!option)throw Error('game-private-card');
   const account={...option,speaker:p.id,day:g.day};g.currentClaim.account=account;for(const q of alive(g)){const observation=(g.cards[q.id]||[]).find(c=>conflict({account,speaker:p.id},c));if(observation)g.cards[q.id].push({...observation,id:'conflict-'+g.currentClaim.id+':'+q.id,kind:'contradiction',subject:p.id,account,observation:clean(observation)});}g.reactions||=[];g.reactions.push({...account,kind:'account',startsAt:now,endsAt:now+2000});log(g,{kind:'account',...account});g.currentClaim.answered=true;phase(g,'rebuttal',now,14);return;
  }
  return react(g,p,a,now);
 }
 function advance(g,now){
  if(g.status!=='playing')return g;
  if(g.nightCycle&&g.phase==='night'){
   if(now<g.deadlineAt)return g;
   const votes={};for(const p of alive(g).filter(p=>p.role==='mafia')){const targets=alive(g).filter(q=>q.role!=='mafia');const target=g.nightVotes?.[p.id]||targets[Math.floor(base.random(g.seed,'night',g.day,p.id)*targets.length)]?.id;if(target&&targets.some(q=>q.id===target))votes[target]=(votes[target]||0)+1}
   const selected=Object.keys(votes).sort((a,b)=>votes[b]-votes[a]||base.random(g.seed,g.day,a)-base.random(g.seed,g.day,b))[0];
   const victim=g.players.find(p=>p.id===selected);g.dawnVictim=victim?.id||'';g.day++;g.period=0;g.actionTick=0;
   if(victim){victim.alive=false;const site=g.openPlaces[Math.floor(base.random(g.seed,'site',g.day)*g.openPlaces.length)];g.bodies.push({id:victim.id,place:site,day:g.day,tick:0,reported:true});g.traces.push({id:'night-trace-'+g.day,day:g.day,tick:0,place:site,action:'footprint'});g.history.push({kind:'discovery',target:victim.id,place:site,day:g.day});g.sceneReports||=[];g.sceneReports.push({id:'scene:'+victim.id,bodyId:victim.id,day:g.day,place:site,clues:[{kind:'time',tick:6},{kind:'footprint'}]});}
   g.nightVotes={};phase(g,'dawn',now,6);return g;
  }
  if(g.nightCycle&&g.phase==='dawn'){if(now<g.deadlineAt)return g;if(base.finish(g)){g.phase='result';g.phaseIndex++;return g;}g.currentClaim=null;phase(g,'move',now,45);return g}
  if(g.nightCycle&&g.phase==='vote'&&now>=g.deadlineAt){const day=g.day;base.resolveVote(g);if(g.status==='playing'){g.day=day;g.nightVotes={};g.currentClaim=null;g.reactions=[];g.opinionQueue=[];phase(g,'night',now,45);if(!alive(g).some(p=>p.role==='mafia'&&!p.delegated))g.deadlineAt=now+2000;}return g}
  if(!phases.has(g.phase)){previous.advance(g,now);if(g.phase==='discussion'||g.phase==='alibi')open(g,now);return g}
  if(!g.meetingEndsAt)open(g,now);
  g.reactions||=[];g.mainCounts||={};g.meetingSkip||=[];
  if(now>=g.meetingEndsAt||g.skipAt&&now>=g.skipAt){vote(g,now);return g}
  if(g.meetingSkip.length&&human(g).length&&human(g).every(p=>g.meetingSkip.includes(p.id))&&!g.skipAt){g.skipAt=now+2000;g.deadlineAt=Math.min(g.deadlineAt,g.skipAt)}
  const elapsed=now-g.phaseStartedAt,npcs=alive(g).filter(p=>p.delegated);
  if(g.phase==='discussion'){
   if(!g.turnSpeaker){g.speakerCursor=-1;next(g,now);return g}
   const p=npcs.find(p=>p.id===g.turnSpeaker);
   if(p&&elapsed>=(human(g).length?8000:1500)){
    const others=alive(g).filter(q=>q.id!==p.id),target=others.sort((a,b)=>(g.claimIssues?.[b.id]||0)-(g.claimIssues?.[a.id]||0))[0];
    if(target){const r=base.random(g.seed,g.phaseIndex,p.id);speak(g,p,{kind:r<.25?'request':r<.4?'defend':r<.5?'changeTopic':'accuse',targetId:target.id,period:g.period||0},now);return g}
   }
  }
  if(g.phase==='reply'&&elapsed>=(human(g).length?6000:1000)){
   const p=alive(g).find(p=>p.id===g.currentClaim.target);
   if(p?.delegated){const opts=playback.options(g,p),opt=opts.find(c=>Number.isInteger(c.tick)&&Math.floor(c.tick/2)===g.currentClaim.period)||opts.find(c=>c.kind==='unknown');submit(g,p,{kind:'alibi',optionId:opt.id},Math.min(now,g.deadlineAt-1));return g}
  }
  if(g.phase==='rebuttal'&&elapsed>=8000&&!g.npcReactionDone){
   g.npcReactionDone=true;g.meetingRevision=(g.meetingRevision||0)+1;
   const candidate=npcs.filter(p=>p.id!==g.currentClaim.speaker&&p.id!==g.currentClaim.target&&!g.reactions.some(r=>r.speaker===p.id)).map(p=>({p,c:(g.cards[p.id]||[]).find(c=>c.kind==='contradiction'&&c.subject===g.currentClaim.speaker),bias:g.bias?.[p.id+':'+g.currentClaim.speaker]||0})).find(x=>x.c||Math.abs(x.bias)>=6&&base.random(g.seed,'react',g.phaseIndex,x.p.id)<.3);
   if(candidate){const {p,c,bias}=candidate;react(g,p,{kind:c||bias>0?'oppose':'agree',...(c?{reason:'insufficient',cardId:c.id}:{})},now)}
  }
  if(now<g.deadlineAt)return g;
  if(g.phase==='claim'){
   if(['accuse','defend','request','silence'].includes(g.currentClaim?.kind)&&alive(g).some(p=>p.id===g.currentClaim.target)){phase(g,'reply',now,30)}else phase(g,'rebuttal',now,14);
  }else if(g.phase==='reply'){
   const p=alive(g).find(p=>p.id===g.currentClaim.target);if(p){submit(g,p,{kind:'alibi',optionId:'unknown'},now-1)}else phase(g,'rebuttal',now,14);
  }else next(g,now);
  return g;
 }
 function view(g,uid){
  const out=previous.view(g,uid),p=g.players.find(p=>p.ownerUid===uid&&!p.delegated);
  Object.assign(out,{turnSpeaker:g.turnSpeaker||'',meetingControls:2,currentClaim:phases.has(g.phase)?g.currentClaim:null,reactions:g.reactions||[],meetingEndsAt:g.meetingEndsAt||0,skipAt:g.skipAt||0,meetingSkip:g.meetingSkip||[],humanCount:voters(g).length,mainCounts:g.mainCounts||{},challengeOwner:'',questions:[],challengeCards:[],speechLeft:0});
  out.canSkipMeeting=phases.has(g.phase)&&voters(g).some(q=>q.id===p?.id);
  out.spectating=!p?.alive;out.spectatorLocations=!p?.alive?g.players.map(q=>({id:q.id,place:g.bodies?.find(b=>b.id===q.id)?.place||q.place,alive:q.alive})):[];
  out.privateCards=Object.fromEntries(Object.entries(out.privateCards).map(([id,cards])=>[id,cards.filter(c=>category(c))]));
  out.alibiOptions=g.phase==='reply'&&g.currentClaim?.target===p?.id?playback.options(g,p):[];out.replyTo=g.phase==='reply'?g.currentClaim?.target||'':'';
  out.canForge=!!p?.alive&&p.role==='mafia'&&!g.forgeryUsed?.[p.id];
  out.nightCycle=!!g.nightCycle;out.nightTargets=g.phase==='night'&&p?.alive&&p.role==='mafia'?alive(g).filter(q=>q.role!=='mafia').map(q=>q.id):[];out.nightChoice=g.phase==='night'&&p?.role==='mafia'?g.nightVotes?.[p.id]||'':'';out.dawnVictim=g.phase==='dawn'?g.dawnVictim||'':'';out.opinionQueued=(g.opinionQueue||[]).some(q=>q.speaker===p?.id);
  out.canChangeStance=(g.history||[]).some(h=>h.day===g.day&&h.speaker===p?.id&&['accuse','defend'].includes(h.kind)&&!h.withdrawn);
  out.allies=p?.role==='mafia'?g.players.filter(q=>q.role==='mafia'&&q.id!==p.id).map(q=>({id:q.id,pressure:g.claimIssues?.[q.id]||0})):[];
  return out;
 }
 return {submit,advance,view,conflict};
};
