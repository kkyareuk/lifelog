import {adsAvailable,prepareGameAd,showGameAd} from './native-ads.js';
import {discoveryPremium,refreshDiscoveryAccess} from './discovery-access.js';
// Preload at the hub. Never wait for a network request after the user has entered the book.
export function prepareSettingsAd(){
 if(adsAvailable()&&!discoveryPremium())void refreshDiscoveryAccess().then(()=>{if(!discoveryPremium())return prepareGameAd()}).catch(()=>{});
}
export async function showSettingsAd(){
 if(adsAvailable()&&!discoveryPremium())await showGameAd().catch(()=>false);
}
