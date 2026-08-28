const FOOTSTEP_URLS={
  walk:"./assets/audio/shoe-walking.m4a?v=20260826independent155",
  run:"./assets/audio/shoe-running.m4a?v=20260826independent155"
};
const RUNNING_SELECTOR=[".town-traveler.is-jogging",".town-traveler.is-scene-running",".home-life-running"].join(",");
const WALKING_SELECTOR=[".home-life-walking",".town-traveler.is-roaming",".town-traveler.is-transit",".is-scene-moving"].join(",");
const channels=new Map();
let previewAudio=null;

const hash=value=>[...String(value||"")].reduce((result,character)=>(result*31+character.charCodeAt(0))>>>0,2166136261);
function visible(element){
  const style=getComputedStyle(element),rect=element.getBoundingClientRect();
  return style.display!=="none"&&style.visibility!=="hidden"&&Number(style.opacity)>0&&rect.width>0&&rect.height>0;
}
function actorId(element,index){
  return element.dataset.homePerson||element.dataset.person||element.dataset.characterId||element.closest("[data-character-id]")?.dataset.characterId||`visible-${index}`;
}
function movingActors(){
  const actors=new Map();
  [...document.querySelectorAll(`${RUNNING_SELECTOR},${WALKING_SELECTOR}`)].forEach((element,index)=>{
    if(!visible(element))return;
    const id=actorId(element,index),mode=element.matches(RUNNING_SELECTOR)?"run":"walk";
    if(!actors.has(id)||mode==="run")actors.set(id,{id,mode});
  });
  return [...actors.values()];
}
function audioVolume(state){
  if(state?.soundMuted)return 0;
  return Math.max(0,Math.min(1,(Number(state?.soundEffectsVolume)||0)/100));
}
function stopChannel(id){
  const channel=channels.get(id);if(!channel)return;
  clearTimeout(channel.timer);channel.audio.pause();channel.audio.currentTime=0;channels.delete(id);
}
function scheduleChannel(state,actor,initial=false){
  const volume=audioVolume(state);if(!volume||document.visibilityState==="hidden")return stopChannel(actor.id);
  let channel=channels.get(actor.id);
  if(!channel||channel.mode!==actor.mode){
    if(channel)stopChannel(actor.id);
    const audio=new Audio(FOOTSTEP_URLS[actor.mode]);audio.preload="auto";audio.playsInline=true;
    channel={audio,mode:actor.mode,timer:0};channels.set(actor.id,channel);
  }
  clearTimeout(channel.timer);channel.audio.volume=Math.min(1,volume*.82);
  const play=()=>{
    if(!channels.has(actor.id)||!movingActors().some(item=>item.id===actor.id&&item.mode===actor.mode))return stopChannel(actor.id);
    channel.audio.currentTime=0;channel.audio.playbackRate=actor.mode==="run"?1.04:.96+(hash(actor.id)%9)/100;
    channel.audio.play().catch(()=>{});
    const base=actor.mode==="run"?610:900,variance=hash(`${actor.id}:${Date.now()>>10}`)%190;
    channel.timer=setTimeout(play,base+variance);
  };
  channel.timer=setTimeout(play,initial?140+(hash(actor.id)%780):0);
}

export function syncMovementAudio(state){
  const actors=document.visibilityState==="hidden"||!audioVolume(state)?[]:movingActors();
  const activeIds=new Set(actors.map(actor=>actor.id));
  [...channels.keys()].forEach(id=>{if(!activeIds.has(id))stopChannel(id)});
  actors.forEach(actor=>{
    const channel=channels.get(actor.id);
    if(!channel||channel.mode!==actor.mode)scheduleChannel(state,actor,true);
    else channel.audio.volume=Math.min(1,audioVolume(state)*.82);
  });
}

export function previewFootstep(state,mode="walk"){
  const volume=audioVolume(state);if(!volume)return false;
  previewAudio?.pause();previewAudio=new Audio(FOOTSTEP_URLS[mode==="run"?"run":"walk"]);
  previewAudio.volume=volume;previewAudio.play().catch(()=>{});return true;
}

export function stopMovementAudio(){
  [...channels.keys()].forEach(stopChannel);
  if(previewAudio){previewAudio.pause();previewAudio.currentTime=0;previewAudio=null}
}

document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")stopMovementAudio()});
