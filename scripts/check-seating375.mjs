import assert from 'node:assert/strict';
import {advanceHomeLifeSimulation} from '../home-simulation.js';
const home={rooms:{living:{furniturePlacements:[{id:'s',item:'소파',x:50,y:55},{id:'tv',item:'TV',x:50,y:20}]}}};
const ctx=(title,extra={})=>({scene:{title,room:'living'},animateMovement:false,...extra});
let r=advanceHomeLifeSimulation(home,['a','b','c'],{a:ctx('TV를 보는 중'),b:ctx('쉬는 중'),c:ctx('쉬는 중')},100000);
assert.equal(r.simulation.reservations.s.characterIds.length,2);assert.equal(r.simulation.agents.a.furnitureId,'s');assert.equal(r.simulation.agents.b.furnitureId,'s');assert.notEqual(r.simulation.agents.c.furnitureId,'s');
r=advanceHomeLifeSimulation(home,['a','b'],{a:ctx('포옹하는 중',{interactionId:'hug'}),b:ctx('포옹하는 중',{interactionId:'hug'})},100000);
assert.equal(r.simulation.reservations.s.characterIds.length,2);assert.equal(r.simulation.agents.a.x,r.simulation.agents.b.x);assert.equal(r.simulation.agents.a.phase,'using');
const dining={rooms:{living:{furniturePlacements:[{id:'t',item:'식탁',x:50,y:50},{id:'a',item:'의자',tableId:'t',x:30,y:50},{id:'b',item:'의자',tableId:'t',x:70,y:50}]}}};
r=advanceHomeLifeSimulation(dining,['a','b','c'],{a:ctx('식사하는 중'),b:ctx('식사하는 중'),c:ctx('식사하는 중')},100000);
assert.equal(r.simulation.agents.a.item,'의자');assert.equal(r.simulation.agents.b.item,'의자');assert.notEqual(r.simulation.agents.a.furnitureId,r.simulation.agents.b.furnitureId);assert.equal(r.simulation.agents.c.furnitureId,'');
console.log('PASS sofa capacity, independent activities, shared affection anchors and dining seat capacity');

let live={...home,lifeSimulation:advanceHomeLifeSimulation(home,['a'],{a:ctx('쉬는 중')},100000).simulation};
live.lifeSimulation=advanceHomeLifeSimulation(live,['a','b'],{a:ctx('쉬는 중'),b:ctx('쉬는 중')},101000).simulation;
for(const now of [102000,106000,112000])live.lifeSimulation=advanceHomeLifeSimulation(live,['a','b'],{a:{scene:{title:'쉬는 중',room:'living'}},b:{scene:{title:'쉬는 중',room:'living'}}},now).simulation;
assert.equal(live.lifeSimulation.agents.b.phase,'using');assert.equal(live.lifeSimulation.agents.a.furnitureId,live.lifeSimulation.agents.b.furnitureId);console.log('PASS second sofa resident settles without repeated walking');

const alternatives={rooms:{living:{furniturePlacements:[{id:'s1',item:'소파',x:20,y:50},{id:'s2',item:'소파',x:80,y:50}]}}};
let occupied=advanceHomeLifeSimulation(alternatives,['a'],{a:ctx('쉬는 중')},100000).simulation;
let strangers=advanceHomeLifeSimulation({...alternatives,lifeSimulation:occupied},['a','b'],{a:ctx('쉬는 중'),b:ctx('쉬는 중')},101000).simulation;
assert.notEqual(strangers.agents.a.furnitureId,strangers.agents.b.furnitureId);
let lovers=advanceHomeLifeSimulation({...alternatives,lifeSimulation:occupied},['a','b'],{a:ctx('쉬는 중',{seatCloseIds:['b']}),b:ctx('쉬는 중',{seatCloseIds:['a']})},101000).simulation;
assert.equal(lovers.agents.a.furnitureId,lovers.agents.b.furnitureId);console.log('PASS strangers prefer empty sofa / lovers choose adjacent seat');
