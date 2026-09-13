import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {recordSaveFailure,clearSaveFailure,saveFailureDiagnostic,saveFailureMessage} from '../save-status.js';
import {sortLogEntries} from '../log-order.js';
import {normalizeRelationshipDetails} from '../official-relationship-details.js';
const source=fs.readFileSync('state.js','utf8'),body=source.slice(source.indexOf('function queueSnapshotWrite('),source.indexOf('export function save('));
function fixture(){
 let release,writes=0,clears=0,stored;
 const c={state:{value:1},saveEpoch:1,snapshotTask:null,pendingSnapshotJob:null,editorPersonalState:null,
  timeOperation:(_n,fn)=>fn(),syncTown(){},stringifyLocalMediaState:JSON.stringify,KEY:'save',
  clearSaveFailure,recordSaveFailure,clearAnswerDeltas:()=>clears++,preserveLastNonempty(){},
  document:{querySelector:()=>null},window:{dispatchEvent(){}},Event,console,
  localStorage:{scope:'a',setItemAsync:async(_key,bytes,current)=>{writes++;if(writes===1)await new Promise(r=>release=r);if(!current())return false;stored=bytes;return true}}
 };
 vm.createContext(c);vm.runInContext(body,c);
 return {c,get release(){return release},get writes(){return writes},get clears(){return clears},get stored(){return stored}};
}
let f=fixture(),task=f.c.queueSnapshotWrite(false);await Promise.resolve();f.c.state.value=2;f.c.saveEpoch++;f.release();assert.equal(await task,true);assert.equal(JSON.parse(f.stored).value,2);assert.equal(f.writes,2);assert.equal(f.clears,1);
f=fixture();task=f.c.queueSnapshotWrite(false);await Promise.resolve();f.c.localStorage.scope='b';f.release();assert.equal(await task,false);assert.equal(f.writes,1);assert.equal(f.stored,undefined);assert.equal(f.clears,0);
recordSaveFailure(new DOMException('full','QuotaExceededError'),'answer-journal');assert.match(saveFailureDiagnostic(),/STORAGE_QUOTA/);assert.match(saveFailureMessage('ko'),/휴대폰 전체/);
recordSaveFailure(new Error('worker'),'snapshot');assert.match(saveFailureDiagnostic(),/SAVE_FAILED/);assert.doesNotMatch(saveFailureMessage('ko'),/공간/);clearSaveFailure();
const backend=fs.readFileSync('functions/index.js','utf8'),grant=backend.slice(backend.indexOf('function nextEntitlements('),backend.indexOf('function webCart('));const context={};vm.createContext(context);vm.runInContext(grant,context);
let ent=context.nextEntitlements({townSlotPacks:2},'town_slots_5',2);assert.equal(ent.townSlotPacks,12);
ent=context.nextEntitlements({characterSlotPacks:3},'character_slot_1',1);ent=context.nextEntitlements(ent,'character_slots_5',1);assert.equal(ent.characterSlotPacks,4);assert.equal(ent.characterSingleSlots,1);
const prices=backend.slice(backend.indexOf('const WEB_PRODUCTS='),backend.indexOf('const WEB_PRODUCTS=')+1000);assert.match(prices,/character_slots_5:.*amount:4800/);assert.match(prices,/town_slots_5:.*amount:9300/);
assert.equal(1900*5-200,9300);assert.equal(normalizeRelationshipDetails('라이벌',{origin:'4'}).origin,'4');assert.equal(normalizeRelationshipDetails('라이벌',{origin:'3'}).origin,'3');
const entries=[{minute:1},{minute:3},{minute:2}];assert.deepEqual(sortLogEntries(entries,'latest').map(x=>x.minute),[3,2,1]);assert.equal(entries[0].minute,1);
console.log('PASS superseded save persists latest; account switch stops retry; quota vs other failures; bundle grants/prices; legacy rivalry IDs; non-mutating log order');
