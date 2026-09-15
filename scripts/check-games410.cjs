const assert=require('node:assert/strict'),e=require('../functions/mafia-stage');
function make(){return e.start({rulesVersion:4,drama:true,id:'g',seed:'410',mode:'live',capacity:6,deadlineAt:45000,locations:Array.from({length:3},(_,i)=>({id:'l'+i,name:'L'+i,selected:true,square:i===0})),players:Array.from({length:6},(_,i)=>({id:'p'+i,name:'P'+i,ownerUid:'u'+i,delegated:i>0,sleep:'03:00'}))})}
const g=make();g.phase='floor';g.meetingEndsAt=300000;g.deadlineAt=30000;g.currentClaim={speaker:'p1',kind:'unknown'};g.claimIssues={};
assert(e.view(g,'u0').questions.length,'no-card player must still be able to ask');
e.submitPlayback(g,g.players[0],{kind:'reserveChallenge',questionId:'time'},10000);
assert.equal(g.phase,'challenge');assert.throws(()=>e.submitPlayback(g,g.players[2],{kind:'reserveChallenge'},10001));
e.submitPlayback(g,g.players[0],{kind:'question'},11000);assert.equal(g.phase,'rebuttal');assert(!g.claimIssues.p1,'an unanswered question is not proof');
assert(!e.view(g,'u0').privateCards.p1);
let npcInterventions=0;
for(let n=0;n<40;n++){const x=make();x.seed=String(n);const periods=new Set();for(let k=0;k<500&&x.status==='playing';k++){if(x.phase==='move')periods.add(x.period);e.advance(x,x.deadlineAt-6000);e.advance(x,x.deadlineAt);npcInterventions+=x.history.filter(h=>h.kind==='reservation'&&h.speaker!=='p0').length;}assert.equal(x.status,'finished','stalled '+n);assert(!periods.has(1)&&!periods.has(4),'long-day periods remain');}
assert(npcInterventions>0,'NPCs never intervene');
console.log('PASS410 no-card question, first reservation, uncertainty is not guilt, private records, shortened days, NPC intervention, 40 complete games');
