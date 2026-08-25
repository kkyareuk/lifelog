const FOOTSTEP_URL="./assets/audio/shoe-steps.wav?v=20260825characterbookaudio";
const MOVING_SELECTOR=[
  ".home-life-walking",
  ".town-traveler.is-roaming",
  ".town-traveler.is-jogging",
  ".town-traveler.is-transit",
  ".is-scene-moving"
].join(",");

let footstepAudio=null;
let repeatTimer=0;
let movementActive=false;

function audioElement(){
  if(footstepAudio)return footstepAudio;
  footstepAudio=new Audio(FOOTSTEP_URL);
  footstepAudio.preload="auto";
  footstepAudio.playsInline=true;
  return footstepAudio;
}

function audioVolume(state){
  if(state?.soundMuted)return 0;
  return Math.max(0,Math.min(1,(Number(state?.soundEffectsVolume)||0)/100));
}

function visibleMovementExists(){
  return [...document.querySelectorAll(MOVING_SELECTOR)].some(element=>{
    const style=getComputedStyle(element),rect=element.getBoundingClientRect();
    return style.display!=="none"&&style.visibility!=="hidden"&&Number(style.opacity)>0&&rect.width>0&&rect.height>0;
  });
}

function clearRepeat(){
  clearTimeout(repeatTimer);
  repeatTimer=0;
}

function playStep(state,{preview=false}={}){
  const volume=audioVolume(state);
  if(!volume||(!preview&&!movementActive))return;
  const audio=audioElement();
  audio.volume=volume;
  audio.currentTime=0;
  audio.playbackRate=document.querySelector(".town-traveler.is-jogging")?1.13:1;
  audio.play().catch(()=>{});
}

function scheduleStep(state){
  clearRepeat();
  if(!movementActive||!audioVolume(state))return;
  playStep(state);
  repeatTimer=setTimeout(()=>scheduleStep(state),930);
}

export function syncMovementAudio(state){
  const nextActive=document.visibilityState!=="hidden"&&visibleMovementExists()&&audioVolume(state)>0;
  if(nextActive===movementActive){
    if(nextActive){
      const audio=audioElement();
      audio.volume=audioVolume(state);
      if(!repeatTimer)scheduleStep(state);
    }
    return;
  }
  movementActive=nextActive;
  if(nextActive)scheduleStep(state);
  else stopMovementAudio();
}

export function previewFootstep(state){
  if(state?.soundMuted||audioVolume(state)<=0)return false;
  playStep(state,{preview:true});
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
