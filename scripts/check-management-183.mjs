import assert from 'node:assert/strict';
import {mergeDeviceAndCloudState} from '../sync-merge.js';
import {characterMomentSpeech} from '../contact-voice.js';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260831village183');
game.resetAll();const first=game.createCharacter(),original=game.cloneState();
const firstTown=game.state.activeTownId,secondTown=game.addTown(5);
game.state.world.places=[{id:'removed-building',name:'삭제할 병원',type:'병원'}];game.save(true,false);
const before=game.cloneState();
assert(game.deletePlace('removed-building'));assert(!game.deletePlace('missing'));
let merged=mergeDeviceAndCloudState(game.cloneState(),before);
assert(!merged.towns.flatMap(t=>t.places).some(p=>p.id==='removed-building'));
assert(game.deleteTown(secondTown));assert(!game.deleteTown(firstTown));
for(let i=0;i<4;i++){
  merged=mergeDeviceAndCloudState(game.cloneState(),before);game.replaceState(merged);
  assert.equal(game.state.towns.length,1);assert.equal(game.state.activeTownId,firstTown);
  assert(game.state.characters[first]);
}
const legacy={schema:31,characters:{},world:{name:'처음 마을',places:[]}};
for(let i=0;i<3;i++)assert.equal(mergeDeviceAndCloudState(legacy,legacy).towns[0].id,'initial-town');
// Different active villages must not borrow each other's buildings.
const a={towns:[{id:'a',places:[{id:'p-a'}]}],activeTownId:'a',world:{id:'a',places:[{id:'p-a'}]}},b={towns:[{id:'b',places:[{id:'p-b'}]}],activeTownId:'b',world:{id:'b',places:[{id:'p-b'}]}};
assert.deepEqual(mergeDeviceAndCloudState(a,b).world.places.map(p=>p.id),['p-a']);
game.state.characterNotificationSettings.voiceVersion=2;game.replaceState(game.cloneState());
assert.equal(game.state.characterNotificationSettings.voiceVersion,2,'Voice schedules are not regenerated on every reload');
game.replaceState({...game.cloneState(),towns:[],activeTownId:null,world:{},deletedTownIds:['initial-town','initial-town-1']});
assert(!game.state.deletedTownIds.includes(game.state.activeTownId),'Concurrent deletions cannot resurrect a deleted village');
for(const style of ['과묵한 직설체','냉정한 격식체'])for(const language of ['ko','en','ja'])for(const topic of ['checkins','worries','comfort','moments','relationships','home','work','tastes']){
  const body=characterMomentSpeech({speechStyle:style},'UNSTYLED GENERIC ENDING',{topic,language,context:{target:'TARGET',home:'HOME',item:'ITEM'}});
  assert(!body.includes('UNSTYLED'));assert(!/[{}]/.test(body));
  if(language!=='ko')assert(!/[가-힣]/.test(body));
  if(language==='ko'&&style==='과묵한 직설체')assert(!/요[.!?]/.test(body));
}
console.log('PASS town/building deletion survives repeated sync, stable legacy IDs, cross-town isolation, 48 complete localized voice messages');
game.save(true,false);
