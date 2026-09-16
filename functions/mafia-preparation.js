// Private preparation state is never copied into the public player list.
module.exports=base=>{
 const living=g=>g.players.filter(p=>p.alive),mine=(g,p)=>g.preparation.people[p.id];
 const tools=['crowbar','masterKey','lockKit'];
 function init(g){
  if(!g.preparationRules||g.preparation)return;
  const houses={};for(const l of g.locations.filter(l=>l.homeId)){
   const beds=Object.values(l.rooms||{}).flatMap(r=>r.furniturePlacements||r.furniture||[]);
   const capacity=beds.reduce((n,b)=>n+(/커플|2인|double/i.test(b.item||b.name||'')?2:/침대|bed/i.test(b.item||b.name||'')?1:0),0);
   houses[l.id]={capacity:Math.max(capacity,g.players.filter(p=>p.homePlace===l.id).length),locked:false};
  }
  g.preparation={people:Object.fromEntries(g.players.map(p=>[p.id,{inventory:[],knownHomes:[p.homePlace],sleepAt:p.homePlace,exposure:0,allianceUsed:false,allies:[],offers:[],results:[],mourning:[],score:0}])),houses,tools:[],notices:[],missing:[]};
  restock(g);
 }
 function restock(g){const s=g.preparation;for(let i=0;i<Math.max(3,Math.ceil(g.players.length/2));i++)s.tools.push({id:'tool:'+g.day+':'+i,type:tools[i%tools.length],place:g.openPlaces[i%g.openPlaces.length],day:g.day});s.tools=s.tools.filter(x=>x.day>=g.day-1);}
 function trace(g,p,action,extra={}){g.traces.push({id:'prep:'+g.day+':'+(++g.cardSequence),day:g.day,tick:6,place:p.place,action,...extra});}
 function valid(g,p,a){
  if(!g.preparation)return false;const s=g.preparation,m=mine(g,p),target=living(g).find(q=>q.id===a.targetId&&q.id!==p.id&&q.place===p.place);
  if(a.kind==='takeTool')return s.tools.some(x=>x.id===a.toolId&&x.place===p.place)&&m.inventory.length<2;
  if(a.kind==='scoutHome')return !!s.houses[p.place];
  if(a.kind==='secureHome')return p.place===m.sleepAt&&m.inventory.some(x=>x.type==='lockKit');
  if(a.kind==='sleepover')return !!target&&!!s.houses[target.homePlace]&&living(g).filter(q=>mine(g,q).sleepAt===target.homePlace).length<s.houses[target.homePlace].capacity;
  if(a.kind==='alliance')return !!target&&!m.allianceUsed;
  if(a.kind==='mourn')return g.bodies.some(b=>b.id===a.targetId&&b.place===p.place)&&!m.mourning.includes(a.targetId);
  return false;
 }
 function allianceReply(g,p,a){const m=mine(g,p),from=m.offers.find(id=>id===a.targetId),q=living(g).find(q=>q.id===from);if(!q)throw Error('game-invalid-action');m.offers=m.offers.filter(id=>id!==from);const other=mine(g,q);other.results.push({target:p.id,accepted:!!a.accept});if(a.accept){m.allies.push(q.id);other.allies.push(p.id)}g.meetingRevision=(g.meetingRevision||0)+1;}
 function act(g,p,a){
  if(!valid(g,p,a))return;const s=g.preparation,m=mine(g,p);
  if(a.kind==='takeTool'){const i=s.tools.findIndex(x=>x.id===a.toolId),tool=s.tools.splice(i,1)[0];m.inventory.push(tool);s.missing.push({type:tool.type,place:tool.place,day:g.day});m.exposure+=1;}
  if(a.kind==='scoutHome'){if(!m.knownHomes.includes(p.place))m.knownHomes.push(p.place);trace(g,p,'tampered');m.exposure+=3;}
  if(a.kind==='secureHome'){m.inventory.splice(m.inventory.findIndex(x=>x.type==='lockKit'),1);s.houses[m.sleepAt].locked=true;trace(g,p,'reinforced');}
  if(a.kind==='sleepover'){m.sleepAt=g.players.find(q=>q.id===a.targetId).homePlace;if(!m.knownHomes.includes(m.sleepAt))m.knownHomes.push(m.sleepAt);}
  if(a.kind==='alliance'){m.allianceUsed=true;const q=living(g).find(q=>q.id===a.targetId);mine(g,q).offers.push(p.id);if(q.delegated){const bias=g.bias?.[q.id+':'+p.id]||0;const accept=q.role==='mafia'||bias<=-3||bias<3&&((p.gameSkills?.composureSkill??50)-(g.claimIssues?.[p.id]||0)*5+(g.cards[p.id]||[]).filter(c=>['trace','autopsy'].includes(c.kind)).length*5>=45);allianceReply(g,q,{targetId:p.id,accept});}}
  if(a.kind==='mourn'){m.mourning.push(a.targetId);const seen=living(g).filter(q=>q.id!==p.id&&q.place===p.place).length,bias=g.bias?.[p.id+':'+a.targetId]||0;g.claimIssues||={};if(seen)g.claimIssues[p.id]=Math.max(0,(g.claimIssues[p.id]||0)+(bias>=3?1:-Math.min(2,seen)));if(seen&&bias<=-3&&p.role!=='mafia')m.score++;}
 }
 function auto(g,p){const m=mine(g,p),s=g.preparation;
  if(g.phase==='move'){if(p.role==='mafia'){const q=living(g).find(q=>q.role!=='mafia'&&!m.knownHomes.includes(mine(g,q).sleepAt));if(q&&!m.inventory.some(x=>x.type!=='lockKit'))return {kind:'move',place:s.tools.find(x=>x.type!=='lockKit')?.place||q.homePlace};if(q)return {kind:'move',place:mine(g,q).sleepAt};}return {kind:'move',place:g.bodies.find(b=>b.day===g.day)?.place||g.openPlaces[Math.floor(base.random(g.seed,'prepMove',g.day,g.period,p.id)*g.openPlaces.length)]};}
  const tool=s.tools.find(x=>x.place===p.place&&(p.role!=='mafia'||x.type!=='lockKit'));if(tool&&m.inventory.length<2)return {kind:'takeTool',toolId:tool.id};if(p.role==='mafia'&&s.houses[p.place]&&!m.knownHomes.includes(p.place))return {kind:'scoutHome'};if(valid(g,p,{kind:'secureHome'}))return {kind:'secureHome'};return {kind:'investigate'};
 }
 function targets(g,p){const m=mine(g,p);return living(g).filter(q=>q.role!=='mafia'&&m.knownHomes.includes(mine(g,q).sleepAt)&&(!g.preparation.houses[mine(g,q).sleepAt]?.locked||m.sleepAt===mine(g,q).sleepAt||m.inventory.some(x=>x.type!=='lockKit')));}
 function night(g,victim,attacker){
  const s=g.preparation;if(victim&&attacker){const home=mine(g,victim).sleepAt,other=mine(g,attacker),tool=other.inventory.find(x=>x.type!=='lockKit'),locked=s.houses[home]?.locked;
   if(locked&&other.sleepAt!==home&&tool)other.inventory.splice(other.inventory.indexOf(tool),1);
   victim.alive=false;g.bodies.push({id:victim.id,place:home,day:g.day,tick:6,reported:true});
   const method=locked&&tool?.type==='crowbar'?'forcedLock':locked&&tool?.type==='masterKey'?'keyScratches':'unlocked';
   g.traces.push({id:'night:'+g.day,day:g.day,tick:6,place:home,action:method});
   g.sceneReports||=[];g.sceneReports.push({id:'scene:'+victim.id,bodyId:victim.id,day:g.day,place:home,clues:[{kind:'time',tick:6},{kind:method},{kind:'footprint'}]});
   g.history.push({kind:'discovery',target:victim.id,place:home,day:g.day});
   for(const q of living(g).filter(q=>q.id!==attacker.id&&mine(g,q).sleepAt===home)){if(base.random(g.seed,'wake',g.day,q.id)<(/얕|light|浅/.test(q.traits||'')?.7:.3))base.addCard(g,q,{kind:'trace',action:'nightNoise',day:g.day,tick:6,place:home});}
  }
  s.notices=s.missing.map(x=>({...x}));s.missing=[];for(const p of g.players){p.place=mine(g,p).sleepAt;mine(g,p).exposure=0;}restock(g);
 }
 function view(g,p){if(!g.preparation||!p)return null;const s=g.preparation,m=mine(g,p);return {...m,tools:s.tools.filter(x=>x.place===p.place),notices:s.notices,homeOptions:Object.entries(s.houses).map(([place,h])=>({place,capacity:h.capacity,occupied:living(g).filter(q=>mine(g,q).sleepAt===place).length})),canSecure:valid(g,p,{kind:'secureHome'}),canScout:!!s.houses[p.place]};}
 return {init,valid,act,auto,targets,night,view,allianceReply};
};
