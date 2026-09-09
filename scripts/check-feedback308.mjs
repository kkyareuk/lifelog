import assert from 'node:assert/strict';
import {viewSignals,relationshipReaction,relationshipBetween,automaticConflictAllowed} from '../relationship-context.js?v=20260909dev305';
import {lifeTask,lifeCopy} from '../life-tasks.js?v=20260909dev305';
import {relationshipAppraisal} from '../character-mood.js?v=20260909dev305';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305');
const sim=await import('../simulation.js?v=20260909dev305');
game.resetAll();
const {state}=game,aid=game.createCharacter(),bid=game.createCharacter(),a=state.characters[aid],b=state.characters[bid];a.name='A';b.name='B';
const relation={id:'test',a:aid,b:bid,type:'동거인',temporalStatus:'current'};state.relationships={test:relation};
const calm={overall:'그저 그런 사람',annoyance:'전혀 귀찮거나 성가시지 않음',jealousy:'질투하지 않음',comfort:'함께 있는 건 편하지만 대화 호흡은 평범함',trust:'보통',closeness:'보통',aggression:'공격 충동 없음',aggressionAction:'행동으로 옮기지 않음',conflictIntensity:'가끔 부딪힘',touchIntensity:'신체 접촉 없음'};
for(const [key,value] of Object.entries(calm))game.updateCharacterView(aid,bid,key,value);
for(const [key,value] of Object.entries({...calm,comfort:'함께 있으면 매우 불편하고 대화도 전혀 통하지 않음',annoyance:'많이 귀찮고 성가심',jealousy:'질투가 심함'}))game.updateCharacterView(bid,aid,key,value);
for(const lang of ['ko','en','ja']){state.uiLanguage=lang;for(let i=0;i<192;i++){
 const date=new Date(2026,8,14,0,i*15);const scene=sim.relationCombinationScene({id:'room'},a,b,relation,date);
 assert(scene);assert.equal(scene.relationProfile,'directional');assert(!['annoyance','jealousy'].includes(scene.relationshipCues[aid]));
 assert.doesNotMatch(scene.first,/성가|귀찮|붙잡|질투|bothersome|jealous|引き留め/);assert(['comfort','annoyance'].includes(scene.relationshipCues[bid]));
 if(lang!=='ko')assert(!/[가-힣]/.test(scene.first+scene.second));
}}
// Discomfort does not manufacture annoyance or jealousy on that same person.
game.updateCharacterView(aid,bid,'comfort','함께 있으면 매우 불편하고 대화도 전혀 통하지 않음');
for(let i=0;i<64;i++){const scene=sim.relationCombinationScene({id:'room'},a,b,relation,new Date(2026,8,15,0,i*15));assert.equal(scene.relationshipCues[aid],'comfort')}
// Editing the source view is used by the next generated scene.
game.updateCharacterView(aid,bid,'comfort',calm.comfort);game.updateCharacterView(aid,bid,'annoyance','많이 귀찮고 성가심');assert.equal(sim.relationCombinationScene({},a,b,relation,new Date()).relationshipCues[aid],'annoyance');
const own=a.homeId,other=b.homeId,shared=game.createHome({open:false});game.addCharacterResidence(aid,shared);game.addCharacterResidence(bid,shared);
const room=state.homes[own].rooms.bedroom;room.ownerCharacterIds=[aid];room.furniturePlacements=[{id:'bed',item:'침대',assignedCharacterIds:[aid]}];
game.removeCharacterResidence(aid,own);assert(state.characters[aid]);assert.equal(a.homeId,shared);assert(!room.ownerCharacterIds.includes(aid));assert(!room.furniturePlacements[0].assignedCharacterIds.includes(aid));assert(state.homes[own]);
state.activeHomeId=shared;const before={homeId:b.homeId,reset:b.timelineResetAt,residences:JSON.stringify(b.residences)};assert(game.deleteHome(own));assert(!state.homes[own]);assert(state.deletedHomeIds.includes(own));assert.equal(state.activeHomeId,shared);assert.equal(b.homeId,before.homeId);assert.equal(b.timelineResetAt,before.reset);assert.equal(JSON.stringify(b.residences),before.residences);
game.removeCharacterResidence(aid,shared);assert(state.characters[aid]);assert.equal(a.homeId,'');assert.equal(a.residences.length,0);assert(state.homes[shared]);
game.flushSave(false);console.log('PASS reported directional contradiction across 640 scenes/3 languages, settings edit, unlink/bed cleanup, home deletion and unaffected residents');
