import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
import {createCharacter,state} from '../state.js?v=20260909dev305';
const id=createCharacter(),profile=structuredClone(state.characters[id]),before=JSON.stringify(state);
const snap={group:{id:'g',towns:[{id:'t',name:'Town',places:[]}]},residents:[{id:'r',name:'A',ownerUid:'u',townId:'t',sharedHomeId:'h',profileJson:JSON.stringify(profile)}],homes:[{id:'h',ownerUid:'u',townId:'t',layoutJson:JSON.stringify({rooms:{living:{name:'Living',type:'living',accessMode:'everyone',furniture:[],furniturePlacements:[]}}})}]};
const now=Date.now(),result=advanceSharedLife(snap,now,{characterId:'r',kind:'rest',contextTarget:{type:'room',homeId:'h',room:'living'}}),life=JSON.parse(result[0].lifeJson);
assert.equal(life.directive.homeId,'h');assert.equal(life.directive.room,'living');assert(life.storyDays);assert.equal(JSON.stringify(state),before);
assert.throws(()=>advanceSharedLife(snap,now,{characterId:'r',kind:'rest',contextTarget:{type:'room',homeId:'missing',room:'living'}}),/activity-location-required/);
console.log('PASS shared context target retained, deleted home rejected, memory serialized, personal world isolated');
