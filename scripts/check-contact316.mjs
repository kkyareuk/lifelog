import assert from 'node:assert/strict';
import {advanceHomeLifeSimulation,isHomeSleepScene} from '../home-simulation.js?v=20260909dev305';
import {hobbyChoice} from '../automatic-activities.js?v=20260909dev305';
import {SOCIAL_ACTIVITIES} from '../social-activities.js?v=20260909dev305';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305'),sim=await import('../simulation.js?v=20260909dev305');game.resetAll();const {state}=game,a=state.characters[game.createCharacter()],b=state.characters[game.createCharacter()];a.name='A';b.name='B';a.ageGroup=b.ageGroup='성인';a.hobbies=['전자기기 만지기'];a.activityTempo='한 가지씩 차분히';


const now=new Date(2026,8,10,13).getTime();a.ageGroup='성인';b.ageGroup='노인';
for(const home of Object.values(state.homes))for(const room of Object.values(home.rooms)){room.furniture=[];room.furniturePlacements=[]}
for(const [x,y] of [[a,b],[b,a]])game.updateCharacterView(x.id,y.id,'touchIntensity','성인 간 친밀한 접촉까지');
a.touchReaction='몸에 손이 닿는 것을 싫어함';
for(const kind of ['handhold','hug','lean','kiss','kiss_cautious','kiss_reconcile','affection']){assert(game.contactAllowed(a,b,kind),kind);assert(game.directCharacterActivity(a.id,kind,{targetId:b.id,now}),kind);assert.equal(state.characterDirectives[a.id].kind,kind)}
for(const [x,y] of [[a,b],[b,a]])game.updateCharacterView(x.id,y.id,'touchIntensity','손잡기·팔짱까지');
assert(game.contactAllowed(a,b,'handhold'));assert(!game.contactAllowed(a,b,'lean'));
for(const lang of ['ko','en','ja'])assert(game.contactFailure(a,b,'kiss',lang).includes(a.name));
a.ageGroup=b.ageGroup='청소년';assert(game.directCharacterActivity(a.id,'handhold',{targetId:b.id,now}));assert(!game.directCharacterActivity(a.id,'kiss',{targetId:b.id,now}));
a.ageGroup='성인';b.ageGroup='노인';for(const [x,y]of[[a,b],[b,a]])game.updateCharacterView(x.id,y.id,'touchIntensity','성인 간 친밀한 접촉까지');
for(const home of Object.values(state.homes))for(const room of Object.values(home.rooms)){room.accessMode='owners';room.ownerMode='selected';room.ownerCharacterIds=[]}
assert(!game.directCharacterActivity(a.id,'affection',{targetId:b.id,now}),'must respect room access even without furniture');
console.log('PASS cumulative contact limits, adult/senior pairing, nonsexual teen handholding, minor kiss block, directional failure copy, no-furniture adult contact and room access');
