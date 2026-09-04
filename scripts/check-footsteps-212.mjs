import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

let actors=[],clock=0,sequence=0;
const timers=new Map(),sounds=[],listeners=new Map();
const actor=(id,mode="walk",shown=true)=>({
  dataset:{characterId:id},mode,shown,
  matches:selector=>mode==="run"&&selector.includes("is-jogging"),
  closest:()=>null,getBoundingClientRect:()=>({width:shown?40:0,height:40})
});
class AudioMock{
  constructor(url){this.src=url;this.paused=true;this.ended=false;this.currentTime=0;this.events=new Map();sounds.push(this)}
  play(){this.paused=false;return Promise.resolve()}
  pause(){this.paused=true}
  addEventListener(name,callback){this.events.set(name,callback)}
  finish(){this.paused=true;this.ended=true;this.events.get("ended")?.()}
}
const document={visibilityState:"visible",querySelectorAll:()=>actors,addEventListener:(name,callback)=>listeners.set(name,callback)};
const context=vm.createContext({
  Audio:AudioMock,document,console,Date,
  getComputedStyle:element=>({display:element.shown?"block":"none",visibility:"visible",opacity:"1"}),
  setTimeout:(callback,delay)=>{const id=++sequence;timers.set(id,{callback,at:clock+delay});return id},
  clearTimeout:id=>timers.delete(id)
});
vm.runInContext(readFileSync(new URL("../audio.js",import.meta.url),"utf8").replaceAll("export function ","function "),context);
function tick(ms){
  const end=clock+ms;
  for(let steps=0;steps<100;steps++){
    const pending=[...timers].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
    if(!pending)break;
    const [id,timer]=pending;timers.delete(id);clock=timer.at;timer.callback();
    assert.ok(sounds.filter(audio=>!audio.paused).length<=2,"at most two concurrent footsteps");
  }
  clock=end;
}
const state={soundMuted:false,soundEffectsVolume:45};
const sync=()=>context.syncMovementAudio(state);
const playing=()=>sounds.filter(audio=>!audio.paused);
actors=[actor("a"),actor("b","run"),actor("c"),actor("a"),actor("hidden","walk",false)];
sync();tick(1000);
assert.equal(playing().length,2);
assert.equal(timers.size,2,"one timer per selected character");
assert.ok(playing().some(audio=>audio.src.includes("running")));
assert.ok(playing().some(audio=>audio.src.includes("walking")));
const original=playing();
actors=[actors[2],actors[1],actors[0]];
sync();tick(100);
assert.deepEqual(playing(),original,"renders keep the same pair");
actors=[actor("b","run"),actor("c"),actor("d")];
tick(1600);
assert.equal(playing().length,2,"departing actor replaced from waiting candidates");
assert.ok(original[0].paused);
actors=[actor("b"),actor("c")];
sync();tick(1000);
assert.ok(playing().every(audio=>audio.src.includes("walking")),"running switches to walking");
state.soundEffectsVolume=25;sync();
assert.ok(playing().every(audio=>audio.volume===.25*.82));
context.previewFootstep(state,"run");
assert.equal(playing().length,1,"preview replaces movement audio");
sync();tick(1000);
assert.equal(playing().length,1);
playing()[0].finish();tick(1000);
assert.equal(playing().length,2,"movement resumes after preview");
document.visibilityState="hidden";listeners.get("visibilitychange")();
assert.equal(playing().length,0);assert.equal(timers.size,0);
document.visibilityState="visible";listeners.get("visibilitychange")();tick(1000);
assert.equal(playing().length,2,"foreground resumes existing scene");
state.soundMuted=true;sync();tick(2000);
assert.equal(playing().length,0);assert.equal(timers.size,0);
assert.equal(context.previewFootstep(state),false);
state.soundMuted=false;state.soundEffectsVolume=0;sync();
assert.equal(timers.size,0);
state.soundEffectsVolume=45;actors=[];sync();
assert.equal(timers.size,0);
context.stopMovementAudio();
const prepare=readFileSync(new URL("./prepare-app.mjs",import.meta.url),"utf8");
assert.ok(!prepare.includes('stableAndroidBackupPrefixes'),"audio must not be skipped during incremental staging");
const assetCheck=readFileSync(new URL("./check-android-build-assets.mjs",import.meta.url),"utf8");
for(const file of ["shoe-walking.m4a","shoe-running.m4a"])assert.ok(assetCheck.includes(file));
console.log("PASS footsteps: two-character cap, deduplication, stable selection, replacement, gait/volume, preview, mute, lifecycle and packaging regression.");
