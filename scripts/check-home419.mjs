import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {contextActions} from '../context-actions.js';
const require=createRequire(import.meta.url),engine=require('../functions/mafia-stage');
for(const players of [[],[{id:'p1',name:'Player',ownerUid:'u'}]]){
 const game={id:'recruit',meetingControls:2,status:'recruiting',phase:'recruiting',players,locations:[],capacity:6};
 const view=engine.view(game,'u');assert.equal(view.status,'recruiting');assert.equal(view.canChangeStance,false);
}
for(const item of ['1인 침대','침대','커플 침대']){
 const actions=contextActions({type:'furniture',item});assert(actions.some(a=>a.lifeTask==='sleep'));assert(actions.some(a=>a.kind==='rest'));assert(actions.some(a=>a.kind==='nap'&&!a.lifeTask));
 for(const a of actions)for(const lang of ['ko','en','ja'])assert(a.label[lang],item+lang);
}
console.log('PASS419 empty/joined recruiting view without history; three bed types offer sleep/nap/rest in KO EN JA.');

