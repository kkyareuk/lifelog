import assert from 'node:assert/strict';
import {createNotificationOpenQueue} from '../notification-open-queue.js';
let ready=false,frames=[],opened=[];
const queue=createNotificationOpenQueue({ready:()=>ready,open:x=>opened.push(x),frame:fn=>frames.push(fn)});
queue.push('old');queue.push('new');assert.equal(frames.length,0);assert(queue.pending);
ready=true;queue.flush();queue.flush();assert.equal(frames.length,1);frames.shift()();assert.equal(opened.length,0);frames.shift()();assert.deepEqual(opened,['new']);assert(!queue.pending);
queue.push('wait');ready=false;frames.shift()();frames.shift()();assert(queue.pending);assert.equal(opened.length,1);ready=true;queue.flush();frames.shift()();frames.shift()();assert.deepEqual(opened,['new','wait']);
console.log('PASS notification waits for readiness and two frames, deduplicates pending delivery, retains tap across interrupted startup');

const events={};globalThis.document={visibilityState:'visible',addEventListener:(name,fn)=>events[name]=fn};globalThis.window={ParallelCityAuth:{getInfo:()=>({startupSyncing:syncing})},addEventListener:()=>{}};
let syncing=false,resolvePlay,plays=0,pauses=0;
globalThis.Audio=class {paused=true;volume=0;play(){plays++;this.paused=false;return new Promise(r=>resolvePlay=r)}pause(){pauses++;this.paused=true}};
const {syncBackgroundMusic}=await import('../background-music.js');const state={backgroundMusicVolume:35};syncBackgroundMusic(state);events.pointerdown();assert.equal(plays,1);syncBackgroundMusic(state);syncBackgroundMusic(state);assert.equal(plays,1);
syncing=true;syncBackgroundMusic(state);resolvePlay();await new Promise(r=>setTimeout(r,0));assert(pauses>=2);events.pointerdown();assert.equal(plays,1);syncing=false;syncBackgroundMusic(state);assert.equal(plays,2);document.visibilityState='hidden';resolvePlay();await new Promise(r=>setTimeout(r,0));events.visibilitychange();
console.log('PASS one pending music play, late play pauses during startup sync/hidden state, resumes once ready');
