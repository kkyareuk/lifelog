import assert from 'node:assert/strict';
import {autonomousAllowed,ACTIVITY_SECTIONS} from '../autonomous-activities.js';
import {urgentNeed} from '../life-needs.js';
import {advanceHomeLifeSimulation,isHomeSleepScene} from '../home-simulation.js';
import base from '../functions/mafia-engine.js';
import voting from '../functions/mafia-voting.js';
import preparation from '../functions/mafia-preparation.js';
const nap={autonomousActivityBlocks:['nap']};assert(!autonomousAllowed(nap,{title:'낮잠 자는 중'}));assert(autonomousAllowed(nap,{title:'잠자는 중'}));assert(autonomousAllowed(nap,{title:'낮잠 자는 중',manualDirective:true}));assert(ACTIVITY_SECTIONS[0].keys.includes('nap'));
const now=Date.now(),tired={...nap,lifeNeeds:{sleep:0,hunger:80,toilet:80,hygiene:80,social:80,updatedAt:now}};assert.equal(urgentNeed(tired,now,{allowSleep:false}),'');assert.equal(urgentNeed(tired,now),'sleep');
const home={rooms:{bed:{furniturePlacements:[{id:'bed1',item:'1인 침대',x:50,y:45}]}},lifeSimulation:{agents:{}}};
let r=advanceHomeLifeSimulation(home,['a'],{a:{scene:{title:'자는 중',actionKind:'sleep',room:'bed'},roomKey:'bed',animateMovement:false}},now);home.lifeSimulation=r.simulation;
assert.equal(r.simulation.agents.a.furnitureId,'bed1');
for(const scene of [{title:'식사하는 중',actionKind:'eating',mood:'수면 부족',sleeping:true},{title:'용변을 보는 중',lifeTaskId:'toilet',actionKind:'sleep'}]){assert(!isHomeSleepScene(scene));r=advanceHomeLifeSimulation(home,['a'],{a:{scene:{...scene,room:'bed'},roomKey:'bed',animateMovement:false}},now+1000);assert.equal(r.simulation.agents.a.furnitureId,'');}
const v=voting(base);const g={seed:'429',day:3,players:[{id:'m',alive:true,role:'mafia',gameSkills:{intelligenceSkill:95},voteTraits:{impulsivity:.1}},{id:'a',alive:true,role:'citizen'},{id:'b',alive:true,role:'citizen'}],history:[{kind:'defend',speaker:'b',target:'a'}],board:[],cards:{},matchEmotions:{'m:b':{grudge:18,gratitude:0}}};
for(let i=0;i<100;i++){g.seed='429-'+i;assert.equal(v.npc(g,{id:'a',voteTraits:{fear:1}}).kind,'vote');}
assert.equal(preparation(base).chooseTarget(g,g.players[0]).id,'a');g.players[0].voteTraits.impulsivity=.9;g.players[0].gameSkills.intelligenceSkill=20;assert.equal(preparation(base).chooseTarget(g,g.players[0]).id,'b');
console.log('PASS429: separate nap policy, urgent sleep gate, stale bed reset, day3 votes and strategic/impulsive night targets');

const {roomAllowedActivities,roomActivityAllowed,ROOM_ACTIVITIES}=await import('../room-activities.js');
assert(!roomActivityAllowed({type:'bedroom'},{needKey:'toilet'}));assert(!roomActivityAllowed({type:'bedroom'},{actionKind:'eating'}));assert(roomActivityAllowed({type:'bedroom'},{actionKind:'sleep'}));assert(roomActivityAllowed({type:'bath'},{needKey:'toilet'}));assert(roomActivityAllowed({type:'kitchen'},{actionKind:'eating'}));assert(!roomAllowedActivities({type:'bedroom',allowedActivities:Object.keys(ROOM_ACTIVITIES)}).includes('toilet'));assert(roomAllowedActivities({type:'bedroom',allowedActivities:Object.keys(ROOM_ACTIVITIES),activityRulesCustom:true}).includes('toilet'));assert.deepEqual(roomAllowedActivities({type:'bedroom',allowedActivities:['eating']}),['eating']);
console.log('PASS429 room defaults: bedroom no toilet/meals; bathroom toilet; kitchen meals; unrestricted legacy defaults; explicit overrides retained');
import engine from '../functions/mafia-stage.js';
const game=engine.start({id:'evidence429',preparationRules:1,nightCycle:true,meetingControls:2,notebook:true,drama:true,rulesVersion:4,seed:'evidence429',mode:'live',capacity:6,deadlineAt:45000,locations:[...Array.from({length:3},(_,i)=>({id:'l'+i,name:'Place'+i,selected:true})),...Array.from({length:6},(_,i)=>({id:'h'+i,homeId:'home'+i,selected:false,name:'Home'+i,rooms:{room:{furniturePlacements:[{item:'커플 침대'}]}}}))],players:Array.from({length:6},(_,i)=>({id:'p'+i,name:'P'+i,homeId:'home'+i,ownerUid:'u'+i,delegated:false}))});
game.phase='alibi';engine.advance(game,0);game.turnSpeaker='p0';engine.submitPlayback(game,game.players[0],{kind:'accuse',targetId:'p1'},1);engine.advance(game,game.deadlineAt);assert.equal(game.phase,'reply');game.cards.p1=[{id:'unrelated',kind:'behavior',subject:'p4',action:'takeTool',day:game.day,tick:0,place:'l0'}];
assert.throws(()=>engine.submitPlayback(game,game.players[1],{kind:'oppose',reason:'insufficient',cardId:'unrelated'},game.phaseStartedAt+1),/invalid-action/);
engine.submitPlayback(game,game.players[1],{kind:'oppose',reason:'insufficient'},game.phaseStartedAt+1);assert(!game.reactions.at(-1).card);assert.equal(game.reactions.at(-1).reason,'insufficient');
console.log('PASS429 meeting: insufficient-evidence rebuttal rejects unrelated attachments and submits without a card');
