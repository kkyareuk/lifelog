import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../auth.js',import.meta.url),'utf8');
const start=source.indexOf('async function createSharedResidentOnce('),end=source.indexOf('let groupUnsubscribers',start);
async function scenario(remote,local,{uploadOK=true,stale=false}={}){
 const calls=[];const context={requireGroupUser(){},captureSession:()=>({uid:'a'}),assertSession(){if(stale)throw Error('stale')},groupState:{activeGroupId:'g'},createdResidents:new Map(),getDoc:async()=>({data:()=>({state:remote})}),doc(){},db:{},window:{ParallelCity:{getState:()=>local}},upload:async()=>{calls.push('upload');return uploadOK},sharedTownRequest:async(action)=>{calls.push(action);return {id:'a_new'}},sharedProfile:p=>p,refreshSlotUsage:async()=>{},emitGroupState(){}};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 try{await context.createSharedResidentOnce({id:'new',profile:{name:'New'}});return calls}catch(error){return {calls,error:error.message}}
}
const roster={order:['a','b'],towns:[{id:'t'}]};
assert.deepEqual(await scenario(roster,{...roster,days:{large:'history'},photo:'local photo'}),['createResident']);
assert.deepEqual(await scenario(roster,{...roster,order:['b','a']}),['createResident']);
assert.deepEqual(await scenario(roster,{...roster,order:['a','b','c']}),['upload','createResident']);
assert.deepEqual(await scenario(null,roster),['upload','createResident']);
assert.deepEqual(await scenario(roster,{...roster,characterTransferVersions:{a:2}}),['upload','createResident']);
assert.deepEqual((await scenario(null,roster,{uploadOK:false})).calls,['upload']);
assert.deepEqual((await scenario(roster,roster,{stale:true})).calls,[]);
console.log('PASS403 multiplayer creation: unchanged roster skips full save; changed/missing/transfer roster syncs; failure and account-switch stop creation');
