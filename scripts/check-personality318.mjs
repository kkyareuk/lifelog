import assert from 'node:assert/strict';
import {observationAxes,personalityObservation} from '../personality-observation.js';
import {relationshipReaction,viewSignals} from '../relationship-context.js?v=20260909dev305';
let count=0;
for(const [field,,values] of observationAxes){
 for(const aValue of [values[0],values.at(-1)])for(const bValue of [values[0],values.at(-1)]){
  const a={id:'a',[field]:aValue},b={id:'b',[field]:bValue};
  const observation=personalityObservation(a,b);assert.equal(observation.axis,field);assert.equal(observation.matching,aValue===bValue);
  for(const language of ['ko','en','ja']){assert(observation.copy[language]);if(language!=='ko')assert(!/[가-힣]/.test(observation.copy[language]));count++}
 }
}
const a={id:'a',interference:'컨트롤프릭',planningStyle:'계획적'},b={id:'b',interference:'방관자',planningStyle:'무계획'};
for(let seed=0;seed<100;seed++){
 const view={annoyance:'전혀 귀찮거나 성가시지 않음',aggression:'공격 충동 없음',overall:'그저 그런 사람'};
 const scene=relationshipReaction(a,b,view,null,{seed:String(seed)});assert(!/짜증|답답|성가|질투|붙잡/.test(scene.text));
 const hostile={overall:'매우 싫어함',annoyance:'많이 귀찮고 성가심'};
 assert(!personalityObservation(a,{...a,id:'b'},hostile,viewSignals(hostile),seed).copy.ko.includes('편안함'));
}
assert.equal(personalityObservation({id:'a'},{id:'b'}),null);
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305');game.resetAll();game.createCharacter();
const before=JSON.stringify(game.state),stored=JSON.stringify([...memory]);
const {newSharedResidentInput}=await import('../shared-create-resident.js');const input=newSharedResidentInput('group','town','테스트');
assert.equal(input.profile.name,'테스트');assert(input.home.rooms);assert.equal(input.profile.townId,'town');assert.equal(JSON.stringify(game.state),before);assert.equal(JSON.stringify([...memory]),stored);
console.log(`PASS ${count} localized trait cases; 100 explicit-view cases; isolated multiplayer character creation`);
