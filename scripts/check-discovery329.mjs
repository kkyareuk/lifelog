import assert from 'node:assert/strict';
import {DISCOVERY_SCENES as events,DISCOVERY_FIELDS,DISCOVERY_AXES,discoveryLocked,discoveryCandidates,discoveryAnswer,discoveryChoices} from '../character-discovery-rules.js';
import {autonomousActivity,autonomousAllowed,applyAutonomousPolicy} from '../autonomous-activities.js';
const c={id:'a',bodyProfile:{},interests:['역사'],drinks:[],dislikedDrinks:['차']},q=id=>events.find(q=>q.id===id);
assert(discoveryCandidates(c,{title:'질문받기'}).length>0);assert(!discoveryLocked(c,'neatness'));
const locked={...c,discovery:{locks:Object.fromEntries(DISCOVERY_FIELDS.map(f=>[f,true]))}};assert.equal(discoveryCandidates(locked,{title:'질문받기'}).length,0);
for(const e of events)for(const choice of e.choices){assert.equal(Object.keys(choice.targets).length,Object.keys(DISCOVERY_AXES).length);for(const lang of ['ko','en','ja'])assert(choice.text[lang]);}
assert.equal(q('rain').choices.find(o=>o.stance==='hostile').targets.aggressionLevel,29);assert.equal(q('rain').choices.find(o=>o.stance==='violent').targets.aggressionLevel,94);
assert.equal(discoveryChoices(c,q('rain')).length,5);
let patch=discoveryAnswer(c,q('profile-interest-display'),0);assert.deepEqual(patch.interests,['역사','천문학']);
patch=discoveryAnswer(c,q('profile-favorite-drink'),4);assert(patch.drinks.includes('차'));assert(!patch.dislikedDrinks.includes('차'));
assert.equal(discoveryAnswer({...c,discovery:{locks:{interests:true}}},q('profile-interest-display'),0),null);
assert(discoveryAnswer(c,q('profile-skill-help'),0).skills.includes('요리'));
const actor={id:'a',autonomousActivityBlocks:['games','talk','cleaning']};
assert(!autonomousAllowed(actor,{title:'게임하는 중'}));assert(autonomousAllowed(actor,{title:'게임하는 중',manualDirective:true}));assert(autonomousAllowed(actor,{title:'게임하는 중',routineId:'r'}));assert.equal(autonomousActivity({title:'자는 중'}),null);
const scene={title:'서로의 생각을 나누는 중',withId:'a',withIds:['a'],groupInteraction:true};assert(applyAutonomousPolicy({id:'b'},scene,{a:actor},'ko').autonomyAdjusted);assert.equal(applyAutonomousPolicy(actor,{title:'잠든 중'},{}).title,'잠든 중');
console.log('PASS legacy unlocked, explicit locks, full target vectors, violence calibrated, preferences merge/opposites, skills, autonomous blocks/manual/sleep/partner consistency');
