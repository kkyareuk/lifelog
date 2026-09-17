import {adsAvailable,prepareGameAd,showGameAd} from './native-ads.js';
import {discoveryPremium,refreshDiscoveryAccess} from './discovery-access.js';
const games=new Map();
export function updateMafiaAd(game,player){
 if(!adsAvailable()||!game?.id||!player?.id||discoveryPremium())return;
 const account=window.ParallelCityAuth?.getInfo?.()?.user?.uid||'guest',key='drawer-mafia-ad:'+account+':'+game.id;
 let entry=games.get(key);
 if(!entry){let used=false;try{used=localStorage.getItem(key)==='1'}catch{}entry={used,ready:false};games.set(key,entry);if(games.size>100)games.delete(games.keys().next().value);}
 if(entry.used)return;
 const ended=game.status==='finished'||player.alive===false;
 if(ended){entry.used=true;try{localStorage.setItem(key,'1')}catch{}if(entry.ready)void showGameAd().catch(()=>{});return;}
 if(!entry.loading){entry.loading=true;void refreshDiscoveryAccess().then(()=>{if(discoveryPremium())return;return prepareGameAd().then(()=>{entry.ready=true})}).catch(()=>{});}
}
