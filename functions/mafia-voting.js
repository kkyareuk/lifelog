// Match-only emotions and voting. Character relationships are never mutated.
module.exports=base=>{
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 function profile(c){
  const axis=(field,values,fallback=.5)=>Number.isFinite(c.discovery?.scores?.[field])?clamp(c.discovery.scores[field]/100):values.includes(c[field])?values.indexOf(c[field])/(values.length-1):fallback;
  return {impulsivity:/거의 참지|쉽게 욱|충동/.test(c.impulseControl||'')?.9:/매우 잘|잘 참|신중/.test(c.impulseControl||'')?.1:.5,thinking:1-axis('decisionStyle',['논리 우선','이성적인 편','균형형','마음을 살핌','공감 우선']),intuition:axis('perceptionStyle',['눈앞의 현실 중시','구체적인 편','균형형','가능성 중시','직관과 상상 중시']),education:/박사|대학원|석사/.test(c.educationLevel||'')?1:/대학교|대학/.test(c.educationLevel||'')?.75:/고등/.test(c.educationLevel||'')?.5:/초등|중등|중학/.test(c.educationLevel||'')?.25:.5,aggression:axis('aggressionLevel',['공격적인 반응이 거의 없음','공격적인 반응이 드묾','때때로 거칠게 반응함','공격적인 반응이 잦음','매우 공격적으로 반응함'],0),control:axis('interference',['방관자','요청할 때만 도움','적당히 관여','챙기고 확인함','강하게 간섭함','통제광']),morality:axis('morality',['이익을 위해 선을 넘음','내 이익을 먼저 따짐','상황에 따라 판단함','양심을 지키려 함','손해를 봐도 원칙을 지킴']),fear:/소심|겁|불안|두려/.test(JSON.stringify([c.personality,c.temperament,c.emotionalBaseline,c.socialStyle]))?.85:.25};
 }
 function relation(view={}){return {annoyance:/전혀|설정하지/.test(view.annoyance||'')?0:/보기만|매우|심하게/.test(view.annoyance||'')?1:/성가|귀찮|피곤/.test(view.annoyance||'')?.6:0,trust:/전혀|못 믿|설정하지/.test(view.trust||'')?0:/절대|완전히|깊이/.test(view.trust||'')?1:/믿|신뢰/.test(view.trust||'')?.6:0};}
 function emotion(g,source,target,kind,amount){if(!source||!target||source===target)return;g.matchEmotions||={};const key=source+':'+target,row=g.matchEmotions[key]||={grudge:0,gratitude:0};row[kind]=clamp((row[kind]||0)+amount,0,18);}
 function feelings(g,source,target){const e=g.matchEmotions?.[source+':'+target]||{},bias=g.bias?.[source+':'+target]||0;return {grudge:clamp((e.grudge||0)+Math.max(0,bias),0,24),gratitude:clamp((e.gratitude||0)+Math.max(0,-bias),0,24)};}
 const pick=(g,p,rows,key)=>{const total=rows.reduce((n,r)=>n+r.weight,0);let n=base.random(g.seed,key,g.day,p.id)*total;for(const r of rows){n-=r.weight;if(n<=0)return r.id}return rows.at(-1)?.id};
 function npc(g,p){
  const candidates=g.players.filter(q=>q.alive&&q.id!==p.id),traits=p.voteTraits||{},rank=candidates.map(q=>({q,score:base.suspicion(g,p,q)})).sort((a,b)=>b.score-a.score),confidence=Math.max(0,(rank[0]?.score||0)-(rank[1]?.score||0));
  const will=clamp(.40+confidence*.09+(traits.aggression??.3)*.2+(traits.control??.5)*.16-(traits.fear??.3)*.28-(traits.morality??.5)*.08,.08,.96);
  if(g.day<3&&base.random(g.seed,'will',g.day,p.id)>will)return {kind:base.random(g.seed,'abstention',g.day,p.id)<(traits.fear??.3)?'abstain':'noExile'};
  const mistake=clamp(.3-((traits.thinking??.5)*(1-(traits.intuition??.5)*.3))*.2-(traits.education??.5)*.1,.01,.3);
  const pool=base.random(g.seed,'mistake',g.day,p.id)<mistake?rank:rank.slice(0,3),minimum=Math.min(...pool.map(x=>x.score));
  const rows=pool.map(({q,score})=>{const f=feelings(g,p.id,q.id),view=g.voteRelations?.[p.id+':'+q.id]||{},defended=g.history.some(h=>h.day===g.day&&!h.withdrawn&&h.kind==='defend'&&h.speaker===p.id&&h.target===q.id),defender=g.history.some(h=>h.day===g.day&&!h.withdrawn&&h.kind==='defend'&&h.speaker===q.id&&h.target===p.id),ally=g.preparation?.people[p.id]?.allies.includes(q.id);return {id:q.id,weight:Math.max(.2,score-minimum+1)*(1+(view.annoyance||0)*.5+f.grudge/24*.5)*Math.max(.15,1-(view.trust||0)*.5-f.gratitude/24*.5)*(defended?.2:1)*(defender?.3:1)*(ally?.1:1)}});
  return {kind:'vote',targetId:pick(g,p,rows,'weighted-vote')};
 }
 function mafia(g,p,ballots){
  const citizens=g.players.filter(q=>q.alive&&q.role!=='mafia'),tally={};for(const b of ballots)if(b.target)tally[b.target]=(tally[b.target]||0)+1;
  const top=Object.keys(tally).sort((a,b)=>tally[b]-tally[a])[0],threatened=g.players.some(q=>q.alive&&q.role==='mafia'&&(tally[q.id]||0)>0&&(tally[q.id]||0)>=(tally[top]||0)-1);
  let target;
  if(threatened)target=[...citizens].sort((a,b)=>(tally[b.id]||0)-(tally[a.id]||0))[0];
  if(!target)target=[...citizens].map(q=>({q,n:g.board.filter(c=>c.speaker===q.id).length})).sort((a,b)=>b.n-a.n).find(x=>x.n>=2)?.q;
  if(!target)target=[...citizens].sort((a,b)=>(tally[b.id]||0)-(tally[a.id]||0)||base.random(g.seed,'bandwagon',g.day,a.id)-base.random(g.seed,'bandwagon',g.day,b.id))[0];
  // Stay with the visible majority unless the team can change the outcome.
  if(top&&g.players.find(q=>q.id===top)?.role!=='mafia'&&!threatened&&(tally[top]||0)>(tally[target?.id]||0)+g.players.filter(q=>q.alive&&q.role==='mafia').length)target=citizens.find(q=>q.id===top);
  return target?{kind:'vote',targetId:target.id}:{kind:'noExile'};
 }
 function resolve(g){
  const live=g.players.filter(p=>p.alive),ballots=[];
  const add=(p,a)=>{const target=live.find(q=>q.id===a?.targetId&&q.id!==p.id);ballots.push({voter:p.id,target:target?.id||'',kind:target?'vote':a?.kind==='noExile'?'noExile':'abstain'})};
  for(const p of live.filter(p=>!p.delegated||p.role!=='mafia'))add(p,g.submissions[p.id]||(p.delegated?npc(g,p):{kind:'abstain'}));
  for(const p of live.filter(p=>p.delegated&&p.role==='mafia'))add(p,g.submissions[p.id]||mafia(g,p,ballots));
  for(const b of ballots)g.replay?.push({day:g.day,period:3,kind:'vote',subject:b.voter,target:b.target,action:b.kind});g.voteResults=ballots;g.voteHistory||=[];g.voteHistory.push({day:g.day,ballots:ballots.map(b=>({...b}))});g.voteHistory=g.voteHistory.slice(-30);
  const tally={};g.abstentions||={};for(const b of ballots){if(b.target){tally[b.target]=(tally[b.target]||0)+1;emotion(g,b.target,b.voter,'grudge',2)}if(b.kind==='abstain')g.abstentions[b.voter]=(g.abstentions[b.voter]||0)+1;}
  const ranking=Object.entries(tally).sort((a,b)=>b[1]-a[1]);let eliminated=null;
  if(ranking.length&&ranking[0][1]>(ranking[1]?.[1]||0)){eliminated=live.find(p=>p.id===ranking[0][0]);eliminated.alive=false;g.history.push({kind:'voted',target:eliminated.id,day:g.day});}else g.history.push({kind:'tie',day:g.day});
  for(const p of live)for(const b of ballots)base.addCard(g,p,{kind:'voteRecord',subject:b.voter,target:b.target,choice:b.kind,day:g.day,tick:6,place:'',repeated:b.kind==='abstain'&&(g.abstentions[b.voter]||0)>=2});
  if(eliminated?.role==='citizen')for(const b of ballots.filter(b=>b.target===eliminated.id)){g.claimIssues||={};g.claimIssues[b.voter]=Math.min(12,(g.claimIssues[b.voter]||0)+1);}
  if(!base.finish(g)){g.day++;g.phase='plan'}
 }
 return {profile,relation,emotion,feelings,npc,resolve};
};
