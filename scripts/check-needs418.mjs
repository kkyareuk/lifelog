import assert from 'node:assert/strict';
import {needsAt,advanceNeeds} from '../life-needs.js';
import {contextActions,contextDestination} from '../context-actions.js';
const now=Date.now(),c={lifeNeeds:{sleep:80,hunger:80,toilet:0,hygiene:80,social:80,updatedAt:now,recovering:['toilet']}};
assert(needsAt(c,now+30000).toilet>49);assert(needsAt(c,now+60000).toilet>99);const projected=needsAt(c,now+60000).toilet;advanceNeeds(c,{lifeTaskId:'toilet'},now+60000);assert.equal(c.lifeNeeds.toilet,projected);
const toilet=contextActions({type:'furniture',item:'변기'});assert.equal(toilet.length,1);assert.equal(toilet[0].lifeTask,'toilet');assert(!contextActions({type:'furniture',item:'TV'}).some(a=>a.kind==='game'));
const world={homes:{h:{id:'h',townId:'t',rooms:{bath:{furniturePlacements:[{id:'wc',item:'변기'}]}}}},characterDirectives:{},world:{places:[]}};assert.equal(contextDestination(world,{id:'p',townId:'t'},{type:'furniture',homeId:'h',room:'bath',id:'wc'},'game'),null);
console.log('PASS418 continuous recovery: halfway +50, toilet full in 1 minute, no double credit; furniture actions validated at destination.');
