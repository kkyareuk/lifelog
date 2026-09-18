import {AD_UNITS} from './ad-units.js';
import {showRewardedAd} from './rewarded-ad.js';
import {adStep} from './ad-errors.js';
import {discoveryAdsResolved,discoveryPremium} from './discovery-access.js';
const sdk=()=>window.Capacitor?.Plugins?.AdMob;
export const adPlatform=()=>window.Capacitor?.getPlatform?.();
export const adsAvailable=()=>!!AD_UNITS[adPlatform()]&&!!sdk()&&window.PARALLEL_CITY_CONFIG?.ads?.enabled===true;
export const adsTesting=()=>window.PARALLEL_CITY_CONFIG?.ads?.testing===true;
let ready,fullScreen=false,interstitialLoad,interstitialReadyAt=0,lastInterstitialAt=0;
async function bounded(promise){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('ads-timeout')),20000)})])}finally{clearTimeout(timer)}}
export async function initializeAds(){
 if(!adsAvailable())throw Error('ads-unavailable');
 if(!ready)ready=(async()=>{
  // Request consent before any ad request; do not request cross-app tracking permission.
  await adStep('consent',async()=>{
   let info=await bounded(sdk().requestConsentInfo());
   if(info.status==='REQUIRED'&&info.isConsentFormAvailable)info=await bounded(sdk().showConsentForm());
   if(!info.canRequestAds)throw Error('ads-consent');
  });
  await adStep('initialize',()=>bounded(sdk().initialize({initializeForTesting:adsTesting(),maxAdContentRating:'General'})));
  return sdk();
 })().catch(e=>{ready=null;throw e});
 return ready;
}
export async function adPrivacyOptions(){await sdk()?.showPrivacyOptionsForm();ready=null;window.dispatchEvent(new Event('drawer-ads-update'))}
export function adOptions(kind){return {adId:AD_UNITS[adPlatform()]?.[kind],npa:true,isTesting:adsTesting()}}
export function adIsFullScreen(){return fullScreen}
export async function runRewardAd(ticket,account){
 if(fullScreen)throw Error('ads-busy');fullScreen=true;window.dispatchEvent(new Event('drawer-ads-update'));
 try{
  const ad=await initializeAds();await adStep('reward',()=>bounded(ad.prepareRewardVideoAd({...adOptions('reward'),adId:ticket.adUnit,ssv:{userId:account,customData:ticket.ticketId}})));
  if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==account)throw Error('account-changed');
  return await showRewardedAd(ad);
 }finally{fullScreen=false;window.dispatchEvent(new Event('drawer-ads-update'))}
}
export async function prepareGameAd(){
 if(!discoveryAdsResolved()||discoveryPremium())return;
 if(interstitialReadyAt&&Date.now()-interstitialReadyAt<50*60000)return;
 if(!interstitialLoad)interstitialLoad=(async()=>{const ad=await initializeAds();await adStep('interstitial',()=>bounded(ad.prepareInterstitial(adOptions('interstitial'))));interstitialReadyAt=Date.now();})().finally(()=>{interstitialLoad=null});
 return interstitialLoad;
}
export async function showGameAd(){
 if(!discoveryAdsResolved()||discoveryPremium())return false;
 if(fullScreen||!interstitialReadyAt||Date.now()-interstitialReadyAt>=50*60000||Date.now()-lastInterstitialAt<60000)return false;
 interstitialReadyAt=0;lastInterstitialAt=Date.now();fullScreen=true;window.dispatchEvent(new Event('drawer-ads-update'));
 const handles=[];let timer;
 try{
  const ad=await initializeAds();let finish;
  const done=new Promise(resolve=>{finish=resolve});
  handles.push(await ad.addListener('interstitialAdDismissed',()=>finish(true)));
  handles.push(await ad.addListener('interstitialAdFailedToShow',()=>finish(false)));
  timer=setTimeout(()=>finish(false),180000);
  Promise.resolve(ad.showInterstitial()).catch(()=>finish(false));return await done;
 }finally{clearTimeout(timer);await Promise.allSettled(handles.map(h=>h.remove()));fullScreen=false;window.dispatchEvent(new Event('drawer-ads-update'))}
}
