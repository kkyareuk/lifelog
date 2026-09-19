import assert from 'node:assert/strict';
import {roomGestureLayout} from '../room-geometry.js';
import {furnitureDisplayGrid} from '../furniture-display-grid.js';
import {createRequire} from 'node:module';
const grid={columns:12,rows:16,minColumns:2,minRows:2},start={x:50,y:50,w:40,h:40};
for(const dx of [1,5,10,20,100]){const r=roomGestureLayout(start,dx,dx,'resize',grid,true);assert.equal(r.x,50);assert.equal(r.y,50);assert(r.w>=40);assert(r.x+r.w<=100);assert(r.y+r.h<=100)}
assert.deepEqual(roomGestureLayout(start,100,100,'move',grid),{x:60,y:60,w:40,h:40});
assert.equal(roomGestureLayout(start,1,0,'resize',grid).w,41);
assert.equal(furnitureDisplayGrid({w:50,h:50}).columns,6);
assert.equal(furnitureDisplayGrid({w:25,h:25}).columns,3);
// A stale future timestamp from a previous device must not override server state.
let now=1800000000000;const realNow=Date.now;Date.now=()=>now;
const values=new Map([['drawer-discovery-account:qa',String(now+86400000)]]);globalThis.localStorage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),get length(){return values.size},key:i=>[...values.keys()][i]};globalThis.window={ParallelCityAuth:{getInfo:()=>({ready:true,user:{uid:'qa'}}),getIdToken:async()=>'test'},PARALLEL_CITY_CONFIG:{diamonds:{backendUrl:'https://example.invalid'}},dispatchEvent:()=>{}};
let reads=0;globalThis.fetch=async()=>{reads++;return {ok:true,json:async()=>({lastAt:now-30000,serverNow:now,interval:600000,adFree:false,rewardCredits:0})}};
const access=await import('../discovery-access.js');await access.refreshDiscoveryAccess();assert.equal(access.discoveryRemaining(),570000);now+=5000;assert.equal(access.discoveryRemaining(),565000);access.setDiscoveryEntitlement(false);await access.refreshDiscoveryAccess();assert.equal(reads,1);Date.now=realNow;
console.log('PASS456 anchored room resizing, fitted furniture scale, interior schema, authoritative countdown and read caching');
