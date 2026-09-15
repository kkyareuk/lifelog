// Rules v3: choice deadlines and playback are independent server phases.
module.exports=base=>{
 const living=g=>g.players.filter(p=>p.alive);
 const clean=({forged,sourceChain,...c})=>c;
 function options(g,p){
  const cards=(g.cards[p.id]||[]).filter(c=>c.day===g.day);
  const together=cards.filter(c=>c.kind==='exchange'||c.kind==='alibi'&&c.witnesses?.length).map(c=>({id:'card:'+c.id,kind:'together',cardId:c.id,place:c.place,day:c.day,tick:c.tick,subject:p.id,partner:c.kind==='exchange'?c.subject:c.witnesses[0]}));
  const visits=[...new Set(cards.filter(c=>c.subject===p.id||c.kind==='exchange').map(c=>c.place))].map(place=>({id:'visit:'+place,kind:'visit',place,subject:p.id}));
  return [...together,...visits,{id:'unknown',kind:'unknown',subject:p.id}];
 }
 function opposing(g,p){const c=g.currentClaim;if(!c||c.speaker===p.id||c.kind!=='together')return [];return (g.cards[p.id]||[]).filter(x=>x.subject===c.speaker&&x.day===c.day&&x.tick===c.tick&&x.place!==c.place)}
 function beginClaims(g){g.claims=living(g).map(p=>({...options(g,p).find(o=>o.id===g.submissions[p.id]?.optionId)||options(g,p)[0],speaker:p.id}));g.claimCursor=0;nextClaim(g)}
 function nextClaim(g){g.challengeOwner='';g.currentClaim=g.claims[g.claimCursor++]||null;if(g.currentClaim){g.phase='claim';g.history.push({kind:'claim',...g.currentClaim,day:g.day})}else{g.phase='debate';g.debateRound=1}}
 function submit(g,p,a,now){
  if(g.phase==='claim'){
   if(a.kind!=='reserveChallenge'||!opposing(g,p).length||g.challengeOwner)throw Error('game-invalid-action');
   g.challengeOwner=p.id;return;
  }
  if(g.phase==='challenge'){
   if(g.challengeOwner!==p.id||a.kind!=='card'||!opposing(g,p).some(c=>c.id===a.cardId))throw Error('game-invalid-action');
  }else if(g.phase==='alibi'){
   if(a.kind!=='alibi'||!options(g,p).some(c=>c.id===a.optionId))throw Error('game-invalid-action');
  }else if(['move','act'].includes(g.phase)){
   if(!base.validateAction(g,p,a))throw Error('game-invalid-action');
  }else if(g.phase==='vote'){
   if(!living(g).some(q=>q.id===a.targetId&&q.id!==p.id))throw Error('game-invalid-target');
  }else if(g.phase==='debate'){
   if(!['card','accuse','defend','pass'].includes(a.kind))throw Error('game-invalid-action');
   if(a.kind==='card'&&!(g.cards[p.id]||[]).some(c=>c.id===a.cardId))throw Error('game-private-card');
   if(['accuse','defend'].includes(a.kind)&&!living(g).some(q=>q.id===a.targetId&&q.id!==p.id))throw Error('game-invalid-target');
  }else throw Error('game-invalid-action');
  g.submissions[p.id]=Object.fromEntries(['kind','place','taskId','targetId','cardId','optionId'].filter(k=>typeof a[k]==='string').map(k=>[k,a[k]]));
  const humans=living(g).filter(q=>!q.delegated);
  if(g.phase==='challenge'||humans.length&&humans.every(q=>g.submissions[q.id]))g.deadlineAt=Math.min(g.deadlineAt,now+(humans.length===1?2000:0));
 }
 function advance(g,now){
  if(g.status!=='playing'||g.deadlineAt>now)return g;
  // Start playback from the actual transition, so a late reconnect cannot skip it.
  if(g.phase==='move'){
   g.playback={kind:'walk',from:Object.fromEntries(g.players.map(p=>[p.id,p.place]))};
   base.move(g);g.afterPlayback=g.phase;g.phase='walk';
  }else if(g.phase==='walk'){g.phase=g.afterPlayback==='debate'?'alibi':'act';delete g.playback}
  else if(g.phase==='act'){
   const previous=Object.fromEntries(g.players.map(p=>[p.id,(g.cards[p.id]||[]).map(c=>c.id)]));
   const actions=Object.fromEntries(living(g).map(p=>[p.id,g.submissions[p.id]||base.auto(g,p)]));
   g.submissions=actions;
   const period=g.period,before=g.bodies.length;g.lastCounts=Object.fromEntries(g.openPlaces.map(id=>[id,living(g).filter(p=>p.place===id).length]));
   base.act(g);
   g.afterPlayback={phase:g.phase,status:g.status,period:g.period,winner:g.winner||null};
   g.status='playing';g.phase='perform';g.period=period;
   g.playback={kind:'perform',actions,hits:g.bodies.slice(before).map(b=>b.id),cards:Object.fromEntries(g.players.map(p=>[p.id,(g.cards[p.id]||[]).filter(c=>!previous[p.id].includes(c.id)).map(c=>c.id)]))};
  }else if(g.phase==='perform'){
   Object.assign(g,g.afterPlayback);if(g.phase==='debate')g.phase='alibi';delete g.playback;
  }else if(g.phase==='alibi')beginClaims(g);
  else if(g.phase==='claim'){if(g.challengeOwner)g.phase='challenge';else nextClaim(g)}
  else if(g.phase==='challenge'){
   const p=g.players.find(p=>p.id===g.challengeOwner),c=opposing(g,p).find(c=>c.id===g.submissions[p.id]?.cardId);
   if(c){base.publish(g,p,c);g.history.push({kind:'challenge',speaker:p.id,target:g.currentClaim.speaker,card:clean(c),day:g.day})}
   nextClaim(g);
  }else if(g.phase==='debate')base.resolveDebate(g);
  else if(g.phase==='vote'){base.resolveVote(g);if(g.status==='playing'){g.phase='move';g.period=0;g.actionTick=0}}
  g.phaseIndex++;g.submissions={};g.deadlineAt=now+({walk:3500,perform:6000,claim:7000}[g.phase]||45000);
  if(g.drama&&!g.notebook&&g.phase==='move'&&g.period===2){g.submissions=Object.fromEntries(living(g).map(p=>[p.id,{kind:'move',place:g.squareId}]));g.deadlineAt=now;}
  g.history=g.history.slice(-200);g.board=g.board.slice(-120);return g;
 }
 function view(g,uid){
  const out=base.view(g,uid),p=g.players.find(p=>p.ownerUid===uid&&!p.delegated);
  out.drama=!!g.drama;out.rulesVersion=3;out.openingDrafts={};out.winner=g.status==='finished'?g.winner||null:null;
  if(g.phase==='perform')out.history=out.history.filter(h=>h.kind!=='result');
  out.alibiOptions=p&&g.phase==='alibi'?options(g,p):[];
  out.currentClaim=['claim','challenge'].includes(g.phase)?g.currentClaim:null;
  out.challengeOwner=g.challengeOwner||'';
  out.challengeCards=p&&p.alive&&['claim','challenge'].includes(g.phase)?opposing(g,p).map(c=>c.id):[];
  const room=['act','perform'].includes(g.phase),here=p?.place;
  out.occupants=room?g.players.filter(q=>q.place===here&&q.alive).map(({id,name,photo,icon})=>({id,name,photo,icon:icon||''})):[];
  out.bodies=room?g.bodies.filter(b=>b.place===here).map(b=>({id:b.id,place:b.place})):[];
  out.playback=g.playback&&p?{kind:g.playback.kind,from:g.playback.from?.[p.id]||'',action:g.playback.actions?.[p.id]?.kind||'',hits:(g.playback.hits||[]).filter(id=>g.bodies.some(b=>b.id===id&&b.place===here)),cards:g.playback.cards?.[p.id]||[]}:null;
  if(p?.alive&&p.role==='mafia')out.intel={counts:Object.fromEntries((g.openPlaces||[]).map(id=>[id,living(g).filter(q=>q.place===id).length])),hubs:[...new Set(Object.values(g.tasks||{}).flat().filter(t=>t.done<t.required).map(t=>t.place))],lonely:Object.keys(g.lastCounts||{}).filter(id=>g.lastCounts[id]===1)};
  return out;
 }
 return {advance,view,submit,options,opposing};
};
