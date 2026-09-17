// Main opinions remain in place while every participant can attach a reaction.
module.exports=(base,previous,playback)=>{
 const emotions=require('./mafia-voting')(base);
 const alive=g=>g.players.filter(p=>p.alive),human=g=>alive(g).filter(p=>!p.delegated);
 const phases=new Set(['discussion','claim','reply','rebuttal','finalSpeech']);
 const voters=g=>human(g).length?human(g):g.players.filter(p=>!p.delegated);
 const proof=c=>['autopsy','intuition','contradiction','behavior','voteRecord'].includes(c?.kind)||c?.kind==='trace'&&['footprint','blood','object','wiped','tampered','reinforced','forcedLock','keyScratches','unlocked','nightNoise'].includes(c.action);
 const clean=({forged,sourceChain,...c})=>c;
 const log=(g,row)=>{if(row.speaker)g.replay?.push({day:g.day,period:3,kind:'meeting',subject:row.speaker,target:row.target||'',action:row.kind});g.history.push({...row,day:g.day});g.history=g.history.slice(-240);g.meetingRevision=(g.meetingRevision||0)+1};
 const pressure=(g,id,n)=>{g.claimIssues||={};g.claimIssues[id]=Math.max(0,Math.min(12,(g.claimIssues[id]||0)+n))};
 const phase=(g,name,now,seconds)=>{g.phase=name;g.phaseIndex++;g.phaseStartedAt=now;g.submissions={};g.deadlineAt=Math.min(now+(human(g).length?seconds:2)*1000,g.meetingEndsAt||Infinity)};
 function vote(g,now){delete g.meetingEndsAt;delete g.skipAt;g.currentClaim=null;g.reactions=[];g.intervention=null;phase(g,'vote',now,20)}
 function next(g,now){
  const ids=alive(g).map(p=>p.id);g.speakerCursor=((g.speakerCursor??-1)+1)%Math.max(1,ids.length);g.turnSpeaker=ids[g.speakerCursor]||'';
  g.currentClaim=null;g.reactions=[];g.intervention=null;g.npcReactionDone=false;phase(g,'discussion',now,30);
 }
 function open(g,now){g.meetingInfluence={};for(const id of Object.keys(g.claimIssues||{}))g.claimIssues[id]*=.35;g.meetingEndsAt=now+(g.meetingSeconds||300)*1000;g.meetingSkip=[];g.opinionQueue=[];g.speakerCursor=-1;g.mainCounts={};g.reactions=[];g.forgeryUsed={};g.silent={};delete g.skipAt;next(g,now)}
 const category=c=>['behavior','voteRecord'].includes(c?.kind)?c.kind:proof(c)?c.kind==='intuition'?'lie':c.kind==='contradiction'?'contradiction':['tampered','reinforced'].includes(c.action)?'route':'autopsy':null;
 function grounds(g,p,a){
  const kinds=a.kind==='defend'?['none','autopsyMismatch','truthful','consistent']:a.kind==='oppose'?['fabricated','lie','impossible','insufficient']:['none','autopsy','route','lie','contradiction','behavior','voteRecord'];
  const reason=a.reason||'none';if(a.reason&&!kinds.includes(reason))throw Error('game-invalid-action');
  if(a.reason==='insufficient'&&a.cardId)throw Error('game-invalid-action');
  if(a.cardId){const c=(g.cards[p.id]||[]).find(c=>c.id===a.cardId),type=category(c);if(!type)throw Error('game-private-card');const expected={autopsyMismatch:'autopsy',truthful:'lie',lie:'contradiction',consistent:'contradiction',impossible:'route',fabricated:null,insufficient:null}[reason]||reason;if(!['fabricated','insufficient'].includes(reason)&&type!==expected&&!(reason==='lie'&&type==='lie'))throw Error('game-invalid-action');}
  return reason;
 }
 function evidence(g,p,a){
  if(a.reason==='insufficient'||!a.cardId)return null;
  const found=(g.cards[p.id]||[]).find(c=>c.id===a.cardId);if(!found)throw Error('game-private-card');
  const claim=g.currentClaim,target=a.targetId||claim?.target;
  if(['accuse','defend','oppose'].includes(a.kind)&&found.subject&&![target,...(a.kind==='oppose'?[claim?.speaker]:[])].includes(found.subject)&&!(found.kind==='autopsy'&&claim?.card?.place===found.place&&claim.card.day===found.day))throw Error('game-unrelated-evidence');
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
 function influence(g,speaker,target,amount,card){
  if(!target)return;g.meetingInfluence||={};
  for(const observer of alive(g)){if(observer.id===target)continue;const key=observer.id+':'+target,trust=Math.max(.3,Math.min(1.4,1-(g.bias?.[observer.id+':'+speaker]||0)/12));g.meetingInfluence[key]=Math.max(-8,Math.min(8,(g.meetingInfluence[key]||0)+amount*trust*(card?1.8:1)));}
 }
 function react(g,p,a,now){
  if(!g.currentClaim||g.phase!=='rebuttal'||p.id===g.currentClaim.speaker||!['oppose','agree','pass'].includes(a.kind))throw Error('game-invalid-action');
  if((g.reactions||[]).some(r=>r.speaker===p.id))throw Error('game-already-submitted');
  const reason=grounds(g,p,a),c=evidence(g,p,a),mismatch=a.kind==='oppose'&&(conflict(g.currentClaim,c)||c?.kind==='contradiction'&&c.subject===(g.currentClaim.account?.speaker||g.currentClaim.speaker));
  if(c)base.publish(g,p,c);
  const startsAt=Math.max(now,(g.reactions||[]).at(-1)?.endsAt||0);
  const row={kind:a.kind,reason,startsAt,endsAt:startsAt+5000,speaker:p.id,target:g.currentClaim.speaker,opinionId:g.currentClaim.id,...(c?{card:clean(c)}:{}),...(mismatch?{contradiction:{account:g.currentClaim.account||g.currentClaim,observation:clean(c)}}:{})};
  if(a.kind==='agree'&&g.currentClaim.kind==='accuse')emotions.emotion(g,g.currentClaim.target,p.id,'grudge',1);
  if(a.kind==='oppose')emotions.emotion(g,g.currentClaim.speaker,p.id,'grudge',1);
  if(['agree','oppose'].includes(a.kind)){const sign=g.currentClaim.kind==='defend'?-1:g.currentClaim.kind==='accuse'?1:0;influence(g,p.id,g.currentClaim.target,sign*(a.kind==='agree'?.6:-1),c);}
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
  const claim={id:g.day+':'+g.phaseIndex+':'+p.id,kind:a.kind,reason,speaker:p.id,target:a.targetId||prior?.target||'',period:a.period??null,question:['where','activity','tookTool','missingTool'].includes(a.question)?a.question:'where',...(c?{card:clean(c)}:{})};
  // Baseless suspicion remains an opinion, never a proof of guilt.
  if(a.kind==='accuse'){emotions.emotion(g,a.targetId,p.id,'grudge',c?2:3);pressure(g,a.targetId,.5);influence(g,p.id,a.targetId,1,c);}
  if(a.kind==='defend'){emotions.emotion(g,a.targetId,p.id,'gratitude',3);pressure(g,a.targetId,-1);influence(g,p.id,a.targetId,-1.5,c);}
  if(a.kind==='changeStance')influence(g,p.id,prior.target,prior.kind==='accuse'?-1:1,prior.card);
  if(a.kind==='changeTopic'||a.kind==='changeStance')pressure(g,p.id,1);
  g.mainCounts||={};g.mainCounts[p.id]=(g.mainCounts[p.id]||0)+1;
  g.currentClaim=claim;g.reactions=[];g.intervention=null;log(g,claim);
  for(const observer of alive(g).filter(q=>q.id!==p.id)){const score=((observer.gameSkills?.intuitionSkill??50)+(observer.gameSkills?.intelligenceSkill??50))/2-((p.gameSkills?.deceptionSkill??50)+(p.gameSkills?.composureSkill??50))/2;const chance=Math.max(.08,Math.min(.65,.22+score/300+(c?.forged?.15:0)));if(!(g.cards[observer.id]||[]).some(x=>x.kind==='intuition'&&x.subject===p.id&&x.day===g.day)&&base.random(g.seed,'impression',claim.id,observer.id)<chance){g.cards[observer.id]||=[];g.cards[observer.id].push({id:'intuition-'+claim.id+':'+observer.id,kind:'intuition',subject:p.id,day:g.day,tick:g.period*2,place:'',action:'intuition'});}}phase(g,'claim',now,8);
 }
 function submit(g,p,a,now){
  if(g.preparation&&p.alive&&a.kind==='allianceReply'){if(!['move','act','walk','perform'].includes(g.phase))throw Error('game-invalid-action');return base.preparation.allianceReply(g,p,a);}
  if(!p.alive&&a.kind!=='skipMeeting')throw Error('game-invalid-action');
  if(g.nightCycle&&g.phase==='night'){if(now>=g.deadlineAt||p.role!=='mafia'||a.kind!=='nightHit'||!(g.preparation?base.preparation.targets(g,p):alive(g).filter(q=>q.role!=='mafia')).some(q=>q.id===a.targetId))throw Error('game-invalid-action');g.nightVotes||={};if(!['impulsive','planned','grudge'].includes(a.method||'impulsive')||!['untouched','clean','struggle'].includes(a.staging||'untouched'))throw Error('game-invalid-action');g.nightVotes[p.id]=a.targetId;g.nightPlans||={};g.nightPlans[p.id]={method:a.method||'impulsive',staging:a.staging||'untouched'};const voters=alive(g).filter(q=>q.role==='mafia'&&!q.delegated);if(voters.every(q=>g.nightVotes[q.id]))g.deadlineAt=Math.min(g.deadlineAt,now+2000);g.meetingRevision=(g.meetingRevision||0)+1;return}
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
  if(g.phase==='reply'&&g.currentClaim?.target===p.id){
   if(!['oppose','pass','thank','alibi','answer'].includes(a.kind))throw Error('game-invalid-action');
   if(a.kind==='alibi')a={kind:'pass'};
   if(a.kind==='answer'){if(!['request','silence'].includes(g.currentClaim.kind)||!['where','rest','investigate','talk','tools','protect','deny','unknown','hid','taken'].includes(a.answer))throw Error('game-invalid-action');if(a.answer==='where'&&!g.locations.some(l=>l.id===a.place))throw Error('game-invalid-action');}
   if(a.kind==='thank'&&g.currentClaim.kind!=='defend')throw Error('game-invalid-action');
   const c=evidence(g,p,a);grounds(g,p,a);if(c)base.publish(g,p,c);
   const kind=g.currentClaim.kind==='defend'&&a.kind==='pass'?'thank':a.kind;
   const row={kind,...(kind==='answer'?{answer:a.answer,place:a.answer==='where'?a.place:'',period:g.currentClaim.period,day:g.day,tick:(g.currentClaim.period||0)*2}:{}),reason:a.reason||'none',speaker:p.id,target:g.currentClaim.speaker,startsAt:now,endsAt:now+5000,...(c?{card:clean(c)}:{})};
   if(kind==='thank'){g.gratitude||={};const key=p.id+':'+row.target;g.gratitude[key]=(g.gratitude[key]||0)+1;g.bias||={};g.bias[key]=Math.max(-8,(g.bias[key]||0)-1);}
   if(kind==='oppose'){pressure(g,p.id,-1);influence(g,p.id,p.id,-1.5,c);}
   g.reactions.push(row);log(g,row);g.currentClaim.answered=true;phase(g,'rebuttal',now,8);g.deadlineAt=Math.min(g.meetingEndsAt,Math.max(g.deadlineAt,row.endsAt));return;
  }
  return react(g,p,a,now);
 }
 function advance(g,now){
  if(g.status!=='playing')return g;
  if(g.nightCycle&&g.phase==='night'){
   if(now<g.deadlineAt)return g;
   const votes={};for(const p of alive(g).filter(p=>p.role==='mafia')){const targets=g.preparation?base.preparation.targets(g,p):alive(g).filter(q=>q.role!=='mafia');const target=g.nightVotes?.[p.id]||(base.preparation?.chooseTarget(g,p,targets)?.id||targets[0]?.id);if(target&&targets.some(q=>q.id===target))votes[target]=(votes[target]||0)+1}
   const selected=Object.keys(votes).sort((a,b)=>votes[b]-votes[a]||base.random(g.seed,g.day,a)-base.random(g.seed,g.day,b))[0];
   const victim=g.players.find(p=>p.id===selected);g.dawnVictim=victim?.id||'';g.dawnScene=null;g.day++;g.period=0;g.actionTick=0;
   if(g.preparation){const attacker=alive(g).find(p=>p.role==='mafia'&&g.nightVotes?.[p.id]===selected)||alive(g).find(p=>p.role==='mafia'&&base.preparation.targets(g,p).some(q=>q.id===selected));base.preparation.night(g,victim,attacker);}
   else if(victim){victim.alive=false;const site=g.openPlaces[Math.floor(base.random(g.seed,'site',g.day)*g.openPlaces.length)];g.bodies.push({id:victim.id,place:site,day:g.day,tick:0,reported:true});g.traces.push({id:'night-trace-'+g.day,day:g.day,tick:0,place:site,action:'footprint'});g.history.push({kind:'discovery',target:victim.id,place:site,day:g.day});g.sceneReports||=[];g.sceneReports.push({id:'scene:'+victim.id,bodyId:victim.id,day:g.day,place:site,clues:[{kind:'time',tick:6},{kind:'footprint'}]});}
   g.nightVotes={};g.nightPlans={};phase(g,'dawn',now,6);return g;
  }
  if(g.nightCycle&&g.phase==='dawn'){if(now<g.deadlineAt)return g;if(base.finish(g)){g.phase='result';g.phaseIndex++;return g;}g.currentClaim=null;phase(g,'move',now,g.moveSeconds||45);return g}
  if(g.nightCycle&&g.phase==='vote'&&now>=g.deadlineAt){const day=g.day;base.resolveVote(g);g.day=day;g.afterVote={status:g.status,winner:g.winner||null};g.status='playing';phase(g,'voteResult',now,7);return g}
  if(g.phase==='voteResult'){if(now<g.deadlineAt)return g;if(g.afterVote?.status==='finished'){g.status='finished';g.winner=g.afterVote.winner;g.phase='result';g.phaseIndex++;return g;}g.nightVotes={};g.currentClaim=null;g.reactions=[];phase(g,'night',now,45);if(!alive(g).some(p=>p.role==='mafia'&&!p.delegated))g.deadlineAt=now+2000;return g;}
  if(!phases.has(g.phase)){previous.advance(g,now);if(g.phase==='discussion'||g.phase==='alibi')open(g,now);return g}
  if(!g.meetingEndsAt)open(g,now);
  g.reactions||=[];g.mainCounts||={};g.meetingSkip||=[];
  if(now>=g.meetingEndsAt||g.skipAt&&now>=g.skipAt){vote(g,now);return g}
  if(g.meetingSkip.length&&human(g).length&&human(g).every(p=>g.meetingSkip.includes(p.id))&&!g.skipAt){g.skipAt=now+2000;g.deadlineAt=Math.min(g.deadlineAt,g.skipAt)}
  const elapsed=now-g.phaseStartedAt,npcs=alive(g).filter(p=>p.delegated);
  if(g.phase==='discussion'){
   if(!g.turnSpeaker){g.speakerCursor=-1;next(g,now);return g}
   const p=npcs.find(p=>p.id===g.turnSpeaker);
   if(p){
    const friend=alive(g).find(q=>q.id!==p.id&&(g.claimIssues?.[q.id]||0)>=1&&(p.role==='mafia'&&q.role==='mafia'||emotions.feelings(g,p.id,q.id).gratitude>=3));if(friend){speak(g,p,{kind:'defend',targetId:friend.id,reason:'consistent'},now);return g;}
    const others=alive(g).filter(q=>q.id!==p.id),target=others.sort((a,b)=>base.suspicion(g,p,b)-base.suspicion(g,p,a))[0];
    if(target){const r=base.random(g.seed,g.phaseIndex,p.id);speak(g,p,{kind:r<.25?'request':r<.4?'defend':r<.5?'changeTopic':'accuse',targetId:target.id,period:Math.floor(base.random(g.seed,'question-period',g.phaseIndex,p.id)*4),question:['where','activity','tookTool','missingTool'][Math.floor(base.random(g.seed,'question-kind',g.phaseIndex,p.id)*4)]},now);return g}
   }
  }
  if(g.phase==='reply'&&elapsed>=0){
   const p=alive(g).find(p=>p.id===g.currentClaim.target);
   if(p?.delegated){const record=(g.dayActions?.[p.id]||[]).findLast(r=>r.day===g.day&&r.period===g.currentClaim.period),activity=record?.action==='investigate'?'investigate':record?.action==='talk'?'talk':['takeTool','watchTool','hideTool','scoutHome','secureHome'].includes(record?.action)?'tools':'rest';const c=(g.cards[p.id]||[]).find(proof);submit(g,p,{kind:g.currentClaim.kind==='defend'?'thank':g.currentClaim.kind==='accuse'?'oppose':'answer',answer:g.currentClaim.question==='activity'?activity:['tookTool','missingTool'].includes(g.currentClaim.question)?'unknown':'where',place:(g.dayActions?.[p.id]||[]).findLast(r=>r.day===g.day&&r.period===g.currentClaim.period)?.place||g.preparation?.people[p.id]?.sleepAt||p.place,...(g.currentClaim.kind==='accuse'?{reason:'insufficient'}:{})},Math.min(now,g.deadlineAt-1));return g}
  }
  if(g.phase==='rebuttal'&&elapsed>=1000&&!g.npcReactionDone){
   g.npcReactionDone=true;g.meetingRevision=(g.meetingRevision||0)+1;
   const teammate=g.currentClaim.kind==='accuse'&&g.players.find(q=>q.id===g.currentClaim.target)?.role==='mafia'?npcs.find(q=>q.role==='mafia'&&![g.currentClaim.speaker,g.currentClaim.target].includes(q.id)&&!g.reactions.some(r=>r.speaker===q.id)):null;
   if(teammate){react(g,teammate,{kind:'oppose',reason:'insufficient'},now);return g;}
   const candidate=npcs.filter(p=>p.id!==g.currentClaim.speaker&&p.id!==g.currentClaim.target&&!g.reactions.some(r=>r.speaker===p.id)).map(p=>({p,c:(g.cards[p.id]||[]).find(c=>c.kind==='contradiction'&&c.subject===g.currentClaim.speaker),bias:(g.bias?.[p.id+':'+g.currentClaim.speaker]||0)+emotions.feelings(g,p.id,g.currentClaim.speaker).grudge-emotions.feelings(g,p.id,g.currentClaim.speaker).gratitude})).find(x=>x.c||Math.abs(x.bias)>=6&&base.random(g.seed,'react',g.phaseIndex,x.p.id)<.3);
   if(candidate){const {p,c,bias}=candidate;react(g,p,{kind:c||bias>0?'oppose':'agree',...(c?{reason:'lie',cardId:c.id}:bias>0?{reason:'insufficient'}:{})},now)}
  }
  if(now<g.deadlineAt)return g;
  if(g.phase==='claim'){
   if(['accuse','defend','request','silence'].includes(g.currentClaim?.kind)&&alive(g).some(p=>p.id===g.currentClaim.target)){phase(g,'reply',now,30)}else phase(g,'rebuttal',now,8);
  }else if(g.phase==='reply'){
   const p=alive(g).find(p=>p.id===g.currentClaim.target);if(p){submit(g,p,{kind:'alibi',optionId:'unknown'},now-1)}else phase(g,'rebuttal',now,8);
  }else{if(g.currentClaim?.kind==='accuse')for(const q of alive(g).filter(q=>![g.currentClaim.speaker,g.currentClaim.target].includes(q.id)&&!g.reactions.some(r=>r.speaker===q.id&&r.kind!=='pass')))emotions.emotion(g,g.currentClaim.target,q.id,'grudge',1);next(g,now);}
  return g;
 }
 function view(g,uid){
  const out=previous.view(g,uid),p=g.players.find(p=>p.ownerUid===uid&&!p.delegated);
  Object.assign(out,{turnSpeaker:g.turnSpeaker||'',meetingControls:2,currentClaim:phases.has(g.phase)?g.currentClaim:null,reactions:g.reactions||[],meetingEndsAt:g.meetingEndsAt||0,skipAt:g.skipAt||0,meetingSkip:g.meetingSkip||[],humanCount:voters(g).length,mainCounts:g.mainCounts||{},challengeOwner:'',questions:[],challengeCards:[],speechLeft:0});
  out.canSkipMeeting=phases.has(g.phase)&&voters(g).some(q=>q.id===p?.id);
  out.spectating=!p?.alive;out.spectatorLocations=!p?.alive?g.players.map(q=>({id:q.id,place:g.bodies?.find(b=>b.id===q.id)?.place||q.place,alive:q.alive})):[];
  out.privateCards=Object.fromEntries(Object.entries(out.privateCards).map(([id,cards])=>[id,cards.filter(c=>category(c))]));
  out.alibiOptions=[];out.replyTo=g.phase==='reply'?g.currentClaim?.target||'':'';
  out.canForge=!!p?.alive&&p.role==='mafia'&&!g.forgeryUsed?.[p.id];
  out.nightPlan=g.phase==='night'&&p?.role==='mafia'?g.nightPlans?.[p.id]||null:null;out.dawnScene=g.phase==='dawn'?g.dawnScene||null:null;out.nightCycle=!!g.nightCycle;out.nightTargets=g.phase==='night'&&p?.alive&&p.role==='mafia'?(g.preparation?base.preparation.targets(g,p):alive(g).filter(q=>q.role!=='mafia')).map(q=>q.id):[];out.nightChoice=g.phase==='night'&&p?.role==='mafia'?g.nightVotes?.[p.id]||'':'';out.dawnVictim=g.phase==='dawn'?g.dawnVictim||'':'';out.opinionQueued=(g.opinionQueue||[]).some(q=>q.speaker===p?.id);
  out.canChangeStance=(g.history||[]).some(h=>h.day===g.day&&h.speaker===p?.id&&['accuse','defend'].includes(h.kind)&&!h.withdrawn);
  out.voteHistory=g.voteHistory||[];out.allies=p?.role==='mafia'?g.players.filter(q=>q.role==='mafia'&&q.id!==p.id).map(q=>({id:q.id})):[];
  out.preparation=base.preparation.view(g,p);if(g.preparation){const known=new Set((g.cards[p?.id]||[]).filter(c=>c.kind==='autopsy').map(c=>c.originId));out.sceneReports=(out.sceneReports||[]).filter(r=>known.has(r.id));}out.voteResults=['voteResult','result'].includes(g.phase)||g.status==='finished'?g.voteResults||[]:[];
  out.moods=Object.fromEntries(g.players.map(q=>{const relations=Object.entries(g.matchEmotions||{}).filter(([key])=>key.startsWith(q.id+':')).map(([,v])=>v),grudge=Math.max(0,...relations.map(v=>v.grudge||0)),gratitude=Math.max(0,...relations.map(v=>v.gratitude||0));return [q.id,grudge>=6?'angry':(g.claimIssues?.[q.id]||0)>=4?'tense':gratitude>=6?'warm':(q.voteTraits?.fear||0)>.6?'nervous':'calm'];}));
  out.replay=g.status==='finished'?g.replay||[]:[];
  return out;
 }
 return {submit,advance,view,conflict};
};
