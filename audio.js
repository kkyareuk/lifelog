const FOOTSTEP_URLS={
  walk:"./assets/audio/shoe-walking.m4a?v=20260825habitsaudio149",
  run:"./assets/audio/shoe-running.m4a?v=20260825habitsaudio149"
};
const RUNNING_SELECTOR=[".town-traveler.is-jogging",".town-traveler.is-scene-running",".home-life-running"].join(",");
const WALKING_SELECTOR=[".home-life-walking",".town-traveler.is-roaming",".town-traveler.is-transit",".is-scene-moving"].join(",");

let footstepAudio=null;
let footstepMode="walk";
let repeatTimer=0;
let movementActive=false;

function visibleElements(selector){
  return [...document.querySelectorAll(selector)].some(element=>{
    const style=getComputedStyle(element),rect=element.getBoundingClientRect();
    return style.display!=="none"&&style.visibility!=="hidden"&&Number(style.opacity)>0&&rect.width>0&&rect.height>0;
  });
}

function movementMode(){
  if(visibleElements(RUNNING_SELECTOR))return"run";
  if(visibleElements(WALKING_SELECTOR))return"walk";
  return"";
}

function audioElement(mode="walk"){
  const nextMode=mode==="run"?"run":"walk";
  if(footstepAudio&&footstepMode===nextMode)return footstepAudio;
  if(footstepAudio)footstepAudio.pause();
  footstepMode=nextMode;
  footstepAudio=new Audio(FOOTSTEP_URLS[nextMode]);
  footstepAudio.preload="auto";
  footstepAudio.playsInline=true;
  return footstepAudio;
}

function audioVolume(state){
  if(state?.soundMuted)return 0;
  return Math.max(0,Math.min(1,(Number(state?.soundEffectsVolume)||0)/100));
}

function clearRepeat(){
  clearTimeout(repeatTimer);
  repeatTimer=0;
}

function playStep(state,{preview=false,mode=""}={}){
  const volume=audioVolume(state),nextMode=mode||movementMode()||"walk";
  if(!volume||(!preview&&!movementActive))return;
  const audio=audioElement(nextMode);
  audio.volume=volume;
  audio.currentTime=0;
  audio.playbackRate=1;
  audio.play().catch(()=>{});
}

function scheduleStep(state){
  clearRepeat();
  const mode=movementMode();
  if(!movementActive||!mode||!audioVolume(state))return;
  playStep(state,{mode});
  repeatTimer=setTimeout(()=>scheduleStep(state),mode==="run"?620:930);
}

export function syncMovementAudio(state){
  const mode=movementMode();
  const nextActive=document.visibilityState!=="hidden"&&Boolean(mode)&&audioVolume(state)>0;
  if(nextActive===movementActive){
    if(nextActive){
      const audio=audioElement(mode);
      audio.volume=audioVolume(state);
      if(!repeatTimer)scheduleStep(state);
    }
    return;
  }
  movementActive=nextActive;
  if(nextActive)scheduleStep(state);
  else stopMovementAudio();
}

export function previewFootstep(state,mode="walk"){
  if(state?.soundMuted||audioVolume(state)<=0)return false;
  playStep(state,{preview:true,mode});
  return true;
}

export function stopMovementAudio(){
  movementActive=false;
  clearRepeat();
  if(!footstepAudio)return;
  footstepAudio.pause();
  footstepAudio.currentTime=0;
}

document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="hidden")stopMovementAudio();
});
