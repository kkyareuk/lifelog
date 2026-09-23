import assert from 'node:assert/strict';
import {advanceHomeLifeSimulation} from '../home-simulation.js';
import {createEntranceTransitions} from '../meeting-journey.js';
import {mealObservation} from '../meal-observation.js';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{targetEntitlements}=require('./grant-owner-access477.cjs');
const now=Date.now(),home={id:'h',rooms:{kitchen:{furniturePlacements:[{id:'t',item:'식탁',x:50,y:60},{id:'s1',item:'의자',tableId:'t',x:35,y:65},{id:'s2',item:'의자',tableId:'t',x:65,y:65}]},living:{furniturePlacements:[]}}};
const scene={minute:1,title:'식사하는 중',room:'kitchen',needKey:'hunger',recoveryStartedAt:now-1000,actionKind:'eating'};
let result=advanceHomeLifeSimulation(home,['c'],{c:{scene,animateMovement:false}},now);home.lifeSimulation=result.simulation;const seat=result.simulation.agents.c.furnitureId;assert(seat.startsWith('s'));
for(let i=1;i<=20;i++){result=advanceHomeLifeSimulation(home,['c'],{c:{scene:{...scene,minute:i,title:i%2?'Eating a meal':'식사하는 중'},sceneKey:`refresh:${i}`}},now+i*100);home.lifeSimulation=result.simulation;assert.equal(result.simulation.agents.c.furnitureId,seat);assert.equal(result.simulation.agents.c.phase,'using')}
result=advanceHomeLifeSimulation(home,['c'],{c:{scene:{room:'living',minute:40,title:'쉬는 중'},animateMovement:true}},now+3000);assert.equal(result.simulation.agents.c.phase,'walking');
const world={homes:{h:home},uiLanguage:'ko'},c={id:'c',homeId:'h',townId:'town'},transition=createEntranceTransitions();
transition.project(world,c,{home:true,room:'kitchen',manualDirective:true,meetingLocation:{point:{x:23,y:51}}},now,'test');
const next=transition.project(world,c,{home:true,room:'living'},now+100,'test');assert(next.meetingJourney);assert.deepEqual(next.meetingJourney.from,{x:23,y:51});
assert.equal(transition.project(world,c,{home:true,room:'living'},now+200,'test').meetingJourney.start,next.meetingJourney.start);
for(const language of ['ko','en','ja']){const slow=mealObservation({id:'c',eatingHabits:['천천히 오래 씹음'],spiceTolerance:0},now,language),fast=mealObservation({id:'c',eatingHabits:['아주 빠르게 먹음']},now,language);assert.notEqual(slow.desc,fast.desc);assert.deepEqual(slow,mealObservation({id:'c',eatingHabits:['천천히 오래 씹음'],spiceTolerance:0},now,language));assert(slow.desc.length>20)}
assert.deepEqual(targetEntitlements({}),{dlcPacks:['medieval'],characterSingleSlots:95,townSlotPacks:48});assert.deepEqual(targetEntitlements({characterSlotPacks:20,characterSingleSlots:3,townSlotPacks:60}),{dlcPacks:['medieval'],characterSingleSlots:3,townSlotPacks:60});
console.log('PASS477 stable meal seats across 20 refreshes, furniture-free walking, manual activity departure route, three-language meal habits, idempotent non-decreasing entitlements');

const {careerWeeklyRoutines,defaultWorkSchedule,validWorkSchedule}=await import('../career-work.js');
const worker={id:'w',job:'회사원',wallet:{employments:[{id:'job1',jobId:'builtin-office',rankId:'rank-1'}]}};
assert.equal(careerWeeklyRoutines({},worker).length,5);assert.equal(careerWeeklyRoutines({},worker)[0].start,'09:00');
worker.careerSchedules={job1:{days:[0,6],start:'17:00',end:'23:00'}};assert.deepEqual(careerWeeklyRoutines({},worker).map(r=>r.day),[0,6]);
assert(!validWorkSchedule({days:[9],start:'09:00',end:'17:00'}));assert(!validWorkSchedule({days:[1],start:'25:00',end:'17:00'}));
assert.equal(defaultWorkSchedule({jobId:'builtin-office',rankId:'director'}).start,'10:00');
const {stageTownEdit,discardTownEdit,withTownEditDraft,acknowledgeHomeSave,townEditDraft}=await import('../town-edit-draft.js');
const snapshot={activeGroupId:'g',selectedTownId:'t',group:{buildingRevision:3,towns:[{id:'t',name:'Town'}]},homes:[{id:'h',name:'Old',mapX:10}]};
stageTownEdit(snapshot,'saveHomePlacement',{id:'h',patch:{name:'Draft',mapX:20}});snapshot.homes[0].name='Saved';snapshot.group.buildingRevision=4;acknowledgeHomeSave(snapshot,'h',{name:'Saved'},3,4);
assert.equal(withTownEditDraft(snapshot).homes[0].name,'Saved');assert.equal(withTownEditDraft(snapshot).homes[0].mapX,20);assert.equal(townEditDraft(snapshot).revision,4);discardTownEdit(snapshot);assert.equal(withTownEditDraft(snapshot).homes[0].name,'Saved');
console.log('PASS477 work defaults/rank hours/custom days and committed home rename survives town cancel');

assert.equal(careerWeeklyRoutines({}, {id:'unemployed',wallet:{employments:[{id:'none',jobId:'builtin-none',rankId:'rank-1'}]}}).length,0);
