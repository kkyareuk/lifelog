// A single compressed music channel; gain starts at zero on every resume.
let player=null,current=null,unlocked=false,pending=false,context=null,gain=null,fade=0,lastVolume=null;
function targetVolume(){return Math.max(0,Math.min(100,Number(current?.backgroundMusicVolume??35)))/100}
export function syncBackgroundMusic(state){
 current=state;const volume=targetVolume();
 if(!unlocked||state.backgroundMusicMuted||!volume||document.visibilityState==='hidden'||window.ParallelCityAuth?.getInfo?.()?.startupSyncing){clearInterval(fade);player?.pause();return}
 if(!player){
  player=new Audio('./assets/audio/main-theme.mp3');player.loop=true;player.preload='none';player.playsInline=true;player.volume=0;
  const Context=window.AudioContext||window.webkitAudioContext;
  if(Context){try{context=new Context();const source=context.createMediaElementSource(player),compressor=context.createDynamicsCompressor();compressor.threshold.value=-24;compressor.knee.value=20;compressor.ratio.value=4;compressor.attack.value=.01;compressor.release.value=.3;gain=context.createGain();gain.gain.value=0;source.connect(compressor);compressor.connect(gain);gain.connect(context.destination);player.volume=1}catch{gain=null}}
 }
 const restart=player.paused;
 if(!restart&&lastVolume===volume)return;
 lastVolume=volume;
 if(gain){const t=context.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(restart?0:gain.gain.value,t);gain.gain.linearRampToValueAtTime(volume,t+.8);void context.resume().catch(()=>{})}
 else{clearInterval(fade);if(restart)player.volume=0;fade=setInterval(()=>{const difference=targetVolume()-player.volume;player.volume=Math.max(0,Math.min(1,player.volume+Math.sign(difference)*Math.min(.025,Math.abs(difference))));if(Math.abs(difference)<.026)clearInterval(fade)},40)}
 if(restart&&!pending){pending=true;player.play().catch(()=>{}).finally(()=>{pending=false;if(current.backgroundMusicMuted||!targetVolume()||document.visibilityState==='hidden')player.pause()})}
}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{const retry=!unlocked||!player||player?.paused||context?.state==='suspended';unlocked=true;if(context?.state==='suspended')void context.resume().catch(()=>{});if(current&&retry)syncBackgroundMusic(current)},{passive:true});
document.addEventListener('visibilitychange',()=>{if(current)syncBackgroundMusic(current)});
window.addEventListener('pagehide',()=>{clearInterval(fade);player?.pause()});
