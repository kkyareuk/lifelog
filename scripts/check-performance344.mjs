import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {readCloudCharacters} from '../cloud-character-reader.js';
import {frameTask} from '../frame-task.js';
import {latestSaveQueue} from '../latest-save-queue.js';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const docs=Array.from({length:80},(_,i)=>({id:'c'+i,data:()=>({characterId:'c'+i,character:{name:'C'+i}})}));
async function benchmark(limit){let active=0,max=0,calls=0;const start=performance.now();const result=await readCloudCharacters(docs,{limit,decode:v=>v,readDays:async id=>{calls++;max=Math.max(max,++active);await sleep(12);active--;return {docs:[{id:'day',data:()=>({day:{log:id}})}]}}});return {ms:performance.now()-start,max,calls,result}}
const serial=await benchmark(1),parallel=await benchmark(4);
assert.deepEqual(parallel.result,serial.result);assert.deepEqual(Object.keys(parallel.result),docs.map(d=>d.id));assert.equal(parallel.max,4);assert.equal(parallel.calls,80);assert(parallel.ms<serial.ms*.7);
await assert.rejects(()=>readCloudCharacters(docs,{decode:v=>v,readDays:async()=>{throw Error('offline')}}),/offline/);
const frames=new Map();let sequence=0,renders=0;const schedule=frameTask(()=>renders++,{request:fn=>{frames.set(++sequence,fn);return sequence},cancel:id=>frames.delete(id)});
for(let i=0;i<50;i++)schedule();assert.equal(frames.size,1);frames.values().next().value();frames.clear();assert.equal(renders,1);schedule();schedule.cancel();assert.equal(frames.size,0);
let release,writes=[];const queue=latestSaveQueue(async value=>{writes.push(value);if(writes.length===1)await new Promise(r=>release=r)});
const first=queue.push(0);await Promise.resolve();const pending=[];for(let i=1;i<=20;i++)pending.push(queue.push(i));release();await Promise.all([first,...pending]);assert.deepEqual(writes,[0,20]);
let fail=true;const retry=latestSaveQueue(async()=>{if(fail)throw Error('offline')});await assert.rejects(retry.push(1),/offline/);fail=false;await retry.push(2);
console.log(JSON.stringify({characters:80,simulatedReadLatencyMs:12,serialMs:Math.round(serial.ms),parallelMs:Math.round(parallel.ms),maxConcurrent:parallel.max,sameData:true,snapshotNotifications:50,renderCalls:1,queuedEdits:21,actualWrites:writes.length}));
console.log('PASS restore data/order/failure, bounded reads, render coalescing/cancel, latest edit retention/retry');
