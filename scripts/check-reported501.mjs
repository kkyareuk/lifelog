import assert from 'node:assert/strict';
await import('../server-life.mjs');
const g=await import('../state.js?v=20260909dev305');
const {eventFor}=await import('../simulation.js');
const {isHomeSleepScene}=await import('../home-simulation.js');
const {updateMoneySettings,ensureWallet}=await import('../character-money.js');
const a={id:'a'},b={id:'b'};ensureWallet(a);ensureWallet(b);
updateMoneySettings(a,{balance:50000,confirmBalanceReset:true});updateMoneySettings(b,{balance:150000,confirmBalanceReset:true});
assert.deepEqual([a.wallet.balance,b.wallet.balance],[50000,150000]);
for(const balance of [-1,NaN,Infinity,1.5,1e13])assert.throws(()=>updateMoneySettings(a,{balance,confirmBalanceReset:true}));
assert.throws(()=>updateMoneySettings(a,{balance:1}));a.wallet.poolId='pool';assert.throws(()=>updateMoneySettings(a,{balance:1,confirmBalanceReset:true}));
const ids=[g.createCharacter(),g.createCharacter()],people=ids.map(id=>g.state.characters[id]);
for(const c of people)Object.assign(c,{createdAt:1,wake:'07:00',sleep:'23:00',job:'무직',homeId:people[0].homeId,residences:structuredClone(people[0].residences)});
const at=new Date(2026,8,26,12,0),day='2026-9-26';
for(const c of people){c.days={};eventFor(c,at);c.lifeNeeds={sleep:100,hunger:100,toilet:100,hygiene:100,social:100,updatedAt:+at};}
// A stale forced-return nap used to bypass the timetable filtering entirely.
const c=people[0];c.forcedHomeReturn={day,minute:720};c.days[day].entries.push({minute:720,time:'12:00',title:'잠자는 중',desc:'잠시 낮잠',home:true,room:'bedroom',forcedReturn:true,sleeping:true,activityFamily:'nap'});
assert.equal(isHomeSleepScene(eventFor(c,at)),false);delete c.forcedHomeReturn;
// Shared saved scene: the peer has an urgent solo need at the same location.
for(const person of people){person.days[day].entries=[{minute:720,time:'12:00',title:'함께 이야기를 나누는 중',desc:'함께 대화',baseTitle:'쉬는 중',home:true,visitHomeId:c.homeId,room:'living',interactionId:'fixture',participantOrder:ids,withId:ids.find(id=>id!==person.id),withIds:ids.filter(id=>id!==person.id),groupInteraction:true,holdMinutes:25}];}
people[1].lifeNeeds.hunger=0;
const first=eventFor(c,at),second=eventFor(people[1],at);
assert(!first.groupInteraction,'Do not show shared talk when peer must eat');assert(!first.withIds?.includes(people[1].id));assert(!second.groupInteraction);
console.log('PASS501 personal balances, validation/pool protection, stale daytime nap, hungry companion reciprocity');

