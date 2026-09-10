import assert from 'node:assert/strict';
import {advanceHomeLifeSimulation,isHomeSleepScene} from '../home-simulation.js?v=20260909dev305';
import {hobbyChoice} from '../automatic-activities.js?v=20260909dev305';
import {SOCIAL_ACTIVITIES} from '../social-activities.js?v=20260909dev305';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305'),sim=await import('../simulation.js?v=20260909dev305');game.resetAll();const {state}=game,a=state.characters[game.createCharacter()],b=state.characters[game.createCharacter()];a.name='A';b.name='B';a.ageGroup=b.ageGroup='성인';a.hobbies=['전자기기 만지기'];a.activityTempo='한 가지씩 차분히';

const home=state.homes[a.homeId];game.addCharacterResidence(b.id,home.id);
home.rooms={living:{type:'living',name:'Living',accessMode:'everyone'},a:{type:'bedroom',name:'A room',ownerMode:'selected',ownerCharacterIds:[a.id],accessMode:'owners'},b:{type:'bedroom',name:'B room',ownerMode:'selected',ownerCharacterIds:[b.id],accessMode:'owners'}};
game.updateRoom(home.id,'a',{ownerCharacterIds:[a.id]});game.updateRoom(home.id,'b',{ownerCharacterIds:[b.id]});
assert.equal(a.residences.find(r=>r.homeId===home.id).sleepRoomId,'a');assert.equal(b.residences.find(r=>r.homeId===home.id).sleepRoomId,'b');
for(const title of ['자는 중','잠깐 눈을 붙이는 중','Sleeping','眠っている']){assert(isHomeSleepScene({title}));assert.equal(sim.resolveHomeRoomForActivity(b,home,'a',{title},new Date(2026,8,10,1)),'b')}
const r=a.residences.find(r=>r.homeId===home.id);r.sleepElsewhere=false;
for(let day=1;day<=30;day++)assert.equal(sim.resolveHomeRoomForActivity(a,home,'bedroom',{title:'자는 중'},new Date(2026,8,day,1)),'a');
r.sleepElsewhere=true;r.sleepElsewhereFrequency='often';let different=0;
for(let day=1;day<=100;day++){const date=new Date(2026,0,day,23),room=sim.resolveHomeRoomForActivity(a,home,'bedroom',{title:'자는 중'},date);assert(['a','living'].includes(room));if(room==='living')different++;const after=new Date(date.getTime()+3*3600000);assert.equal(sim.resolveHomeRoomForActivity(a,home,'bedroom',{title:'자는 중'},after),room)}assert(different>10&&different<65);
const room={type:'bedroom',furniturePlacements:[{id:'bed',item:'1인 침대',x:50,y:50}]};const h={rooms:{bedroom:room}};const contexts={a:{scene:{room:'bedroom',title:'자는 중'},animateMovement:false},b:{scene:{room:'bedroom',title:'자는 중'},animateMovement:false}};
h.lifeSimulation=advanceHomeLifeSimulation(h,['a','b'],contexts,1000).simulation;
// Corrupted prior state must not retain a second reservation on an occupied single bed.
h.lifeSimulation.agents.b={...h.lifeSimulation.agents.a,characterId:'b'};
const next=advanceHomeLifeSimulation(h,['a','b'],contexts,2000).simulation;
assert.equal(Object.values(next.agents).filter(x=>x.furnitureId==='bed').length,1);
const now=new Date(2026,8,10,14),source={home:true,visitHomeId:home.id,room:'living',withId:b.id,title:'B의 표정을 살피는 중',desc:'B의 표정을 살폈어요.'};
const target={home:true,visitHomeId:home.id,room:'b',title:'쉬는 중'};
assert(sim.resolveHomeEncounter(a,source,target,now).encounterBlocked);
home.rooms.b.accessMode='everyone';const walking=sim.resolveHomeEncounter(a,source,target,now);assert(walking.homeEncounter);assert.equal(walking.room,'living');assert(!walking.title.includes('표정'));
const arrived=sim.resolveHomeEncounter(a,walking,target,new Date(now.getTime()+60001));assert.equal(arrived.room,'b');assert.equal(arrived.title,source.title);
assert(sim.resolveHomeEncounter(a,source,{...target,title:'자는 중'},now).encounterBlocked);
console.log('PASS ownership synchronization, restricted rooms, naps, optional sleep frequency, midnight consistency, single-bed collision and room encounter movement');
