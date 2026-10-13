import assert from 'node:assert/strict';
import {relationMetrics} from '../relationship-metrics.js';
import {courtWorldData} from '../court-world-data.js';
const [high,low]=[courtWorldData.ranks[0],courtWorldData.ranks.at(-1)];
const world={activeTownId:'a',world:{id:'a',courtTheme:'court'},towns:[{id:'a',courtTheme:'court'},{id:'b',courtTheme:'basic'}],characters:{x:{townId:'a',courtRankId:high.id,courtFaction:'crown'},y:{townId:'a',courtRankId:low.id,courtFaction:'reform'},z:{townId:'b'}},relationships:{}};
assert.equal(relationMetrics(world,'x','y').socialDistance,Math.min(100,Math.abs(high.level-low.level)*0.55+45));
assert.equal(relationMetrics(world,'x','z').socialDistance,undefined);
world.world.courtTheme='basic';assert.equal(relationMetrics(world,'x','y').socialDistance,undefined);
console.log('PASS518 solo relation metrics: ranks/factions, separate towns, disabling monarchy');

const {careerCaption,careerHudLabel}=await import('../salary.js');
world.world.courtTheme='court';world.characters.x.courtJob='monarch';world.characters.x.job='Original career';
assert.equal(careerCaption(world,world.characters.x),'군주');world.characters.x.courtJobTitle='달빛의 군주';assert.equal(careerHudLabel(world,world.characters.x),'달빛의 군주');
world.world.courtTheme='basic';assert.equal(careerCaption(world,world.characters.x),'Original career');
console.log('PASS519 court title in profile/HUD; ordinary career preserved');
