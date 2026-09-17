import {audioSettings} from './web-audio.js?v=20260909dev305';
import {interactionSound} from './interaction-sound-routing.js';
const voices=new Map();let last={kind:'',at:0};
const volume=()=>{const s=audioSettings(window.ParallelCity?.getState?.()||{});return s.soundMuted?0:Math.max(0,Math.min(1,(Number(s.soundEffectsVolume)||0)/100))};
export function playInteractionSound(kind='ui-select'){
 const v=volume(),now=performance.now();if(!v||document.visibilityState==='hidden'||last.kind===kind&&now-last.at<60)return;
 last={kind,at:now};for(const a of voices.values()){a.pause();a.currentTime=0}
 let a=voices.get(kind);if(!a){a=new Audio('./assets/audio/'+kind+'.mp3');a.preload='auto';a.playsInline=true;voices.set(kind,a)}a.volume=v*.7;a.play().catch(()=>{});
}
export const playSelectionSound=()=>playInteractionSound();
document.addEventListener('click',event=>{
 const control=event.target.closest?.('button,[role="button"],input[type="checkbox"],input[type="radio"],a[href]');
 if(!control||control.matches(':disabled,[aria-disabled="true"]')||control.closest('[inert]'))return;
 playInteractionSound(interactionSound(control,window.ParallelCity?.getState?.()||{}));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&control.tagName==='BUTTON'){
  control.getAnimations().filter(a=>a.id==='selection-feedback').forEach(a=>a.cancel());
  const scale=getComputedStyle(control).scale;
  const animation=control.animate([{scale:scale==='none'?'1':scale},{scale:'.97',offset:.25},{scale:scale==='none'?'1':scale}],{duration:150,easing:'cubic-bezier(.2,.8,.2,1)'});animation.id='selection-feedback';
 }
},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')voices.forEach(a=>{a.pause();a.currentTime=0})});
