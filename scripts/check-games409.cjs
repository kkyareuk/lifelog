const assert=require('node:assert/strict'),e=require('../functions/mafia-stage');
function make(){return e.start({rulesVersion:4,id:'g',seed:'409',mode:'live',capacity:6,deadlineAt:45000,locations:Array.from({length:3},(_,i)=>({id:'l'+i,name:'L'+i,selected:true,square:i===0})),players:Array.from({length:6},(_,i)=>({id:'p'+i,name:'P'+i,ownerUid:'u'+i,delegated:false,sleep:'23:00'}))})}
const g=make();assert.equal(g.openPlaces.length,3);const before=g.players[0].place;e.advance(g,45000);assert.equal(g.players[0].place,before,'human timeout stays');
g.phase='alibi';g.deadlineAt=100000;g.submissions={};g.cards.p0=[{id:'a',kind:'alibi',subject:'p0',day:1,tick:0,place:'l0',action:'stay',witnesses:['p1']}];
g.cards.p1=[{id:'b',kind:'alibi',subject:'p1',day:1,tick:0,place:'l0',action:'stay'}];
g.cards.p2=[{id:'c',kind:'witness',subject:'p0',day:1,tick:0,place:'l0',action:'stay'}];
e.advance(g,100000);assert.equal(g.phase,'claim');assert.equal(g.currentClaim.partner,'p1');
e.submitPlayback(g,g.players[2],{kind:'reserveChallenge'},101000);assert.throws(()=>e.submitPlayback(g,g.players[1],{kind:'reserveChallenge'},101001));
e.advance(g,g.deadlineAt);assert.equal(g.phase,'reply');assert.equal(e.view(g,'u1').replyTo,'p1');assert.throws(()=>e.submitPlayback(g,g.players[2],{kind:'reply',value:'deny'},106000));
e.submitPlayback(g,g.players[1],{kind:'reply',value:'deny'},106000);assert(g.history.some(h=>h.kind==='reply'&&h.value==='deny'));
e.advance(g,g.deadlineAt);assert.equal(g.phase,'challenge');e.submitPlayback(g,g.players[2],{kind:'card',cardId:'c'},117000);assert.equal(g.phase,'rebuttal');assert(g.board.some(c=>c.subject==='p0'));assert.equal(e.view(g,'u0').currentClaim.speaker,'p0');
e.submitPlayback(g,g.players[0],{kind:'card',cardId:'a'},118000);e.submitPlayback(g,g.players[3],{kind:'agree'},119000);assert(g.history.some(h=>h.kind==='agree'));assert.throws(()=>e.submitPlayback(g,g.players[3],{kind:'agree'},119001));e.advance(g,g.deadlineAt);assert.equal(g.currentClaim.speaker,'p1');
e.advance(g,g.meetingEndsAt-20000);assert.equal(g.phase,'finalSpeech');e.advance(g,g.meetingEndsAt);assert.equal(g.phase,'vote');assert(!e.view(g,'u0').privateCards.p1);
for(let n=0;n<20;n++){const x=make();x.seed=String(n);x.players.forEach((p,i)=>p.delegated=i>0);for(let k=0;k<500&&x.status==='playing';k++)e.advance(x,x.deadlineAt);assert.equal(x.status,'finished','full game stalled '+n)}
console.log('PASS409: three venues, stay default, named reply, first intervention, visible evidence/rebuttal/agreement, 300s limit, private cards, 20 completed games');
