import assert from 'node:assert/strict';
import {petMotionPath,retainPetPaths} from '../pet-motion.js';
import {furniturePatternForScene} from '../home-simulation.js';
import {contextActions} from '../context-actions.js';
retainPetPaths(['cat']);const a=petMotionPath('cat',52,[{x:27,y:41}],100000),b=petMotionPath('cat',52,[{x:70,y:60}],101000);
assert.equal(a.x,b.x);assert.equal(a.y,b.y);assert.equal(b.delay,a.delay-1);
const cycle=petMotionPath('cat',52,[],100000+a.duration*2000);assert(Math.abs(cycle.delay-a.delay)<.0001);
assert.equal(petMotionPath('cat',52,[],102000,true).dx,0);
assert(!furniturePatternForScene({title:'좋아하는 음료를 준비하는 중'}).test('식탁'));
assert(furniturePatternForScene({title:'좋아하는 음료를 준비하는 중'}).test('조리대'));
assert(furniturePatternForScene({title:'좋아하는 음료를 마시는 중'}).test('식탁'));
const target={type:'furniture',homeId:'h',room:'living',id:'s',item:'소파'};
const actions=contextActions(target);assert(actions.length>=6);for(const a of actions){for(const lang of ['ko','en','ja'])assert(a.label[lang]);}
console.log('PASS pet phase continuity / changing occupants do not reset path / preparation differs from drinking / translated sofa actions');
