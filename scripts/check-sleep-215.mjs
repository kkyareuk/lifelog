import assert from 'node:assert/strict';
import {advanceHomeLifeSimulation,normalizeHomeLifeSimulation,homeSleepAnimation,isHomeSleepScene} from '../home-simulation.js';
const start=1_800_000_000_000,home={rooms:{bedroom:{furniturePlacements:[{id:'double',item:'커플 침대',x:50,y:60,assignedCharacterIds:['a','b']},{id:'spare',item:'침대',x:75,y:65}]},living:{furniturePlacements:[{id:'sofa',item:'소파',x:40,y:55}]}}};
const scene={minute:0,title:'자는 중',mood:'수면',room:'bedroom'};
const contexts=(minute,animateMovement=true)=>Object.fromEntries(['a','b'].map(id=>[id,{scene:{...scene,desc:`수면 설명 ${minute}`},sceneKey:`${minute}:자는 중:bedroom`,animateMovement,endsAt:start+8*3600000}]));
home.lifeSimulation=advanceHomeLifeSimulation(home,['a','b'],contexts(1,false),start).simulation;
const before=JSON.parse(JSON.stringify(home.lifeSimulation.agents));
for(let minute=2;minute<120;minute++){
 home.lifeSimulation=normalizeHomeLifeSimulation(JSON.parse(JSON.stringify(home.lifeSimulation)),Object.keys(home.rooms));
 home.lifeSimulation=advanceHomeLifeSimulation(home,['a','b'],contexts(minute,minute%10!==0),start+minute*60000).simulation;
 for(const id of ['a','b']){const agent=home.lifeSimulation.agents[id];assert.equal(agent.phase,'using');assert.equal(agent.furnitureId,'double');assert.equal(agent.sequence,before[id].sequence)}
}
// Migrate old title/minute keys without replaying a completed sleeping trip.
home.lifeSimulation.agents.a.sceneKey='57:자는 중:bedroom';
home.lifeSimulation=advanceHomeLifeSimulation(home,['a','b'],contexts(121),start+121*60000).simulation;
assert.equal(home.lifeSimulation.agents.a.phase,'using');
// A real wake-up still leaves the bed normally, rather than freezing sleep.
const wake={a:{scene:{minute:480,title:'소파에서 쉬는 중',room:'living'},sceneKey:'wake',animateMovement:true}};
const awake=advanceHomeLifeSimulation(home,['a'],wake,start+8*3600000).simulation.agents.a;
assert.equal(awake.phase,'walking');assert.equal(awake.roomKey,'living');
// Fresh entry into sleep still walks once, then never restarts that same walk.
home.lifeSimulation={agents:{a:awake}};
let entering=advanceHomeLifeSimulation(home,['a'],contexts(500),start+9*3600000).simulation;assert.equal(entering.agents.a.phase,'walking');
const arrival=entering.agents.a.arrivesAt;home.lifeSimulation=entering;
entering=advanceHomeLifeSimulation(home,['a'],contexts(501),start+9*3600000+200).simulation;assert.equal(entering.agents.a.arrivesAt,arrival);
home.lifeSimulation=entering;assert.equal(advanceHomeLifeSimulation(home,['a'],contexts(502),arrival+1).simulation.agents.a.phase,'using');
const habits=['이불을 단정히 덮고 잠','이불을 걷어차며 잠','옆으로 웅크려 잠','팔다리를 뻗고 잠','베개를 끌어안고 잠','잠꼬대를 자주 함','뒤척임이 많음','아주 얌전히 잠','새벽에 자주 깸','코를 골며 깊이 잠'];
assert.equal(new Set(habits.map(h=>homeSleepAnimation(h).style)).size,10);
assert.equal(homeSleepAnimation('unknown').style,'tidy');
for(const title of ['자는 중','Sleeping','睡眠中'])assert.ok(isHomeSleepScene({title}));
assert.equal(isHomeSleepScene({title:'이불을 정리하는 중'}),false);
console.log('PASS sleep 215: 118 reload/clock cycles, legacy resume, real wake/bed movement, 10 habit animations');
