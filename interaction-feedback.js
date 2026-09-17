import {audioSettings} from './web-audio.js?v=20260909dev305';
const voices=Array.from({length:4},()=>{const a=new Audio('./assets/audio/ui-select.mp3');a.preload='auto';a.playsInline=true;return a});
let cursor=0;
const volume=()=>{const s=audioSettings(window.ParallelCity?.getState?.()||{});return s.soundMuted?0:Math.max(0,Math.min(1,(Number(s.soundEffectsVolume)||0)/100))};
export function playSelectionSound(){const v=volume();if(!v||document.visibilityState==='hidden')return;const a=voices[cursor++%voices.length];a.pause();a.currentTime=0;a.volume=v*.7;a.play().catch(()=>{});}
document.addEventListener('click',event=>{
 const control=event.target.closest?.('button,[role="button"],input[type="checkbox"],input[type="radio"],a[href]');
 if(!control||control.matches(':disabled,[aria-disabled="true"]')||control.closest('[inert]'))return;
 playSelectionSound();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&control.tagName==='BUTTON'){
  control.getAnimations().filter(a=>a.id==='selection-feedback').forEach(a=>a.cancel());
  const scale=getComputedStyle(control).scale;
  const animation=control.animate([{scale:scale==='none'?'1':scale},{scale:'.97',offset:.25},{scale:scale==='none'?'1':scale}],{duration:150,easing:'cubic-bezier(.2,.8,.2,1)'});animation.id='selection-feedback';
 }
},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')voices.forEach(a=>{a.pause();a.currentTime=0})});
