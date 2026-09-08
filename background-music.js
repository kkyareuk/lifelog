// One player for the entire app. Screen changes do not restart the theme.
let player=null,current=null,unlocked=false,pending=false;
export function syncBackgroundMusic(state){
 current=state;
 const volume=Math.max(0,Math.min(100,Number(state.backgroundMusicVolume??35)))/100;
 if(!unlocked||state.backgroundMusicMuted||!volume||document.visibilityState==='hidden'){player?.pause();return}
 if(!player){player=new Audio('./assets/audio/main-theme.mp3');player.loop=true;player.preload='none';player.playsInline=true;}
 player.volume=volume;
 if(player.paused&&!pending){pending=true;player.play().catch(()=>{}).finally(()=>{pending=false;if(current.backgroundMusicMuted||!Number(current.backgroundMusicVolume)||document.visibilityState==='hidden')player.pause()})}
}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{unlocked=true;if(current)syncBackgroundMusic(current)},{passive:true});
document.addEventListener('visibilitychange',()=>{if(current)syncBackgroundMusic(current)});
window.addEventListener('pagehide',()=>player?.pause());
