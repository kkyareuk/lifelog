import {walkingGaitForElement} from "./walking-gaits.js?v=20260905dev223";

const FOOTSTEP_URLS={
  walk:"./assets/audio/shoe-walking.m4a?v=20260826independent155",
  run:"./assets/audio/shoe-running.m4a?v=20260826independent155"
};
const MAX_MOVEMENT_ACTORS=2;
const RUNNING_SELECTOR=[".town-traveler.is-jogging",".town-traveler.is-scene-running",".home-life-running",".native-character-stage.is-scene-jogging"].join(",");
const WALKING_SELECTOR=[".home-life-walking",".town-traveler.is-roaming",".town-traveler.is-transit",".town-traveler.is-village-walk",".native-character-stage.is-scene-moving"].join(",");
const channels=new Map();
let previewAudio=null;
let latestState=null;

const hash=value=>[...String(value||"")].reduce((result,character)=>(result*31+character.charCodeAt(0))>>>0,2166136261);
function visible(element){
  // Movement actors only exist in the currently rendered page. Avoid forcing
  // layout and style calculation again on every individual footstep.
  return element.isConnected&&!element.hidden&&!element.closest("[hidden],.is-hidden");
}
function actorId(element,index){
  return element.dataset.homePerson||element.dataset.person||element.dataset.characterId||element.closest("[data-character-id]")?.dataset.characterId||`visible-${index}`;
}
function movingActors(){
  const actors=new Map();
  [...document.querySelectorAll(`${RUNNING_SELECTOR},${WALKING_SELECTOR}`)].forEach((element,index)=>{
    if(!visible(element))return;
    const id=actorId(element,index),running=element.matches(RUNNING_SELECTOR),gait=walkingGaitForElement(element),mode=running?"run":gait.sound;
    if(!actors.has(id)||running)actors.set(id,{id,mode,gait,running});
  });
  return [...actors.values()];
}
function audioVolume(state){
  if(state?.soundMuted)return 0;
  return Math.max(0,Math.min(1,(Number(state?.soundEffectsVolume)||0)/100));
}
function stopPreview(){
  if(previewAudio){previewAudio.pause();previewAudio.currentTime=0;previewAudio=null}
}
function stopChannel(id){
  const channel=channels.get(id);if(!channel)return;
  clearTimeout(channel.timer);channel.audio.pause();channel.audio.currentTime=0;channels.delete(id);
}
function scheduleChannel(state,actor,initial=false){
  const volume=audioVolume(state);if(!volume||document.visibilityState==="hidden")return stopChannel(actor.id);
  let channel=channels.get(actor.id);
  if(!channel||channel.mode!==actor.mode||channel.gait!==actor.gait.className){
    if(channel)stopChannel(actor.id);
    const audio=new Audio(FOOTSTEP_URLS[actor.mode]);audio.preload="auto";audio.playsInline=true;
    channel={audio,mode:actor.mode,gait:actor.gait.className,timer:0};channels.set(actor.id,channel);
  }
  clearTimeout(channel.timer);channel.audio.volume=Math.min(1,volume*.82);
  const play=()=>{
    if(!channels.has(actor.id))return;
    if(document.visibilityState==="hidden"||!audioVolume(state))return stopMovementAudio();
    if(!movingActors().some(item=>item.id===actor.id&&item.mode===actor.mode)){
      stopChannel(actor.id);syncMovementAudio(state);return;
    }
    channel.audio.currentTime=0;channel.audio.playbackRate=actor.running?1.04:actor.gait.playbackRate+(hash(actor.id)%5)/100;
    channel.audio.play().catch(()=>{});
    const base=actor.running?610:actor.gait.footstepInterval,variance=hash(`${actor.id}:${Date.now()>>10}`)%Math.max(45,Math.round(base*.14));
    channel.timer=setTimeout(play,base+variance);
  };
  channel.timer=setTimeout(play,initial?140+(hash(actor.id)%780):0);
}

export function syncMovementAudio(state){
  latestState=state;
  if(document.visibilityState==="hidden"||!audioVolume(state))return stopMovementAudio();
  // A preview replaces scene footsteps; it must not become a third voice.
  if(previewAudio&&!previewAudio.paused&&!previewAudio.ended)return;
  const candidates=movingActors();
  // Keep the current pair across renders, then fill only the empty slots.
  const actors=[...candidates.filter(actor=>channels.has(actor.id)),...candidates.filter(actor=>!channels.has(actor.id))].slice(0,MAX_MOVEMENT_ACTORS);
  const activeIds=new Set(actors.map(actor=>actor.id));
  [...channels.keys()].forEach(id=>{if(!activeIds.has(id))stopChannel(id)});
  actors.forEach(actor=>{
    const channel=channels.get(actor.id);
    if(!channel||channel.mode!==actor.mode||channel.gait!==actor.gait.className)scheduleChannel(state,actor,true);
    else channel.audio.volume=Math.min(1,audioVolume(state)*.82);
  });
}

export function previewFootstep(state,mode="walk"){
  const volume=audioVolume(state);if(!volume)return false;
  latestState=state;stopMovementAudio();previewAudio=new Audio(FOOTSTEP_URLS[mode==="run"?"run":"walk"]);
  const audio=previewAudio;
  const resume=()=>{if(previewAudio!==audio)return;stopPreview();syncMovementAudio(latestState)};
  audio.addEventListener("ended",resume,{once:true});
  audio.addEventListener("error",resume,{once:true});
  previewAudio.volume=volume;previewAudio.play().catch(resume);return true;
}

export function stopMovementAudio(){
  [...channels.keys()].forEach(stopChannel);
  stopPreview();
}

document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="hidden")stopMovementAudio();
  else if(latestState)syncMovementAudio(latestState);
});
