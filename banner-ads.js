import {bannerScreenAllowed} from './banner-placement.js';
import {reserveAdViewport} from './ad-viewport.js';
import {adsAvailable,initializeAds,adOptions,adIsFullScreen,adPrivacyOptions} from './native-ads.js';
import {discoveryPremium,discoveryAdsResolved,refreshDiscoveryAccess} from './discovery-access.js';
import {adStep,adErrorText} from './ad-errors.js';
let installed=false,visible=false,queue=Promise.resolve(),retryAt=0,scheduled=false,retryTimer,loadTimer,resizeTimer,slot;
let measuredHeight=56,requestedWidth=0;
const ad=()=>window.Capacitor?.Plugins?.AdMob;
const t=(ko,en,ja)=>document.documentElement.lang?.startsWith('ja')?ja:document.documentElement.lang?.startsWith('en')?en:ko;
function reserve(height){reserveAdViewport(height,slot?.textContent||'');document.documentElement.style.setProperty('--game-ad-height',height+'px');document.documentElement.style.setProperty('--game-viewport-height',height&&!window.Capacitor?.Plugins?.AdViewport?`calc(100dvh - ${height}px)`:'100dvh');document.documentElement.classList.toggle('has-game-banner',height>0);if(slot)slot.hidden=!height;}
function wanted(){return !document.documentElement.classList.contains('title-visible')&&adsAvailable()&&discoveryAdsResolved()&&!discoveryPremium()&&!document.hidden&&!adIsFullScreen()&&bannerScreenAllowed(document)}
function status(error){
 if(!slot){slot=document.createElement('aside');slot.className='game-ad-slot';slot.setAttribute('aria-label',t('광고','Advertisement','広告'));document.body.append(slot);}
 slot.replaceChildren();
 const label=document.createElement('span');label.setAttribute('role','status');label.textContent=error?adErrorText(error):t('광고를 준비하고 있어요…','Preparing an ad…','広告を準備しています…');slot.append(label);
 if(error){const button=document.createElement('button');button.type='button';button.textContent=t('재시도','Retry','再試行');button.onclick=()=>{retryAt=0;clearTimeout(retryTimer);update()};slot.append(button);}
 reserve(measuredHeight);
}
function failed(error){clearTimeout(loadTimer);visible=false;retryAt=Date.now()+60000;if(wanted())status(error);retry();}
function retry(){clearTimeout(retryTimer);if(wanted())retryTimer=setTimeout(update,Math.max(1,retryAt-Date.now()));}
function update(){if(scheduled)return;scheduled=true;queue=queue.catch(()=>{}).then(async()=>{
 scheduled=false;
 if(!wanted()){clearTimeout(retryTimer);clearTimeout(loadTimer);if(visible){visible=false;await ad()?.removeBanner()}reserve(0);return;}
 if(visible)return;
 if(Date.now()<retryAt){reserve(measuredHeight);retry();return;}
 try{
  await adStep('entitlement',refreshDiscoveryAccess);if(!wanted()){reserve(0);return;}
  status();
  await initializeAds();if(!wanted()){reserve(0);return;}
  requestedWidth=window.innerWidth;visible=true;
  loadTimer=setTimeout(()=>{if(visible){failed(Object.assign(Error('ads-timeout'),{adStage:'banner'}));void ad()?.removeBanner().catch(()=>{});}},20000);
  await adStep('banner',()=>ad().showBanner({...adOptions('banner'),adSize:'ADAPTIVE_BANNER',position:'TOP_CENTER'}));
  if(!wanted()){clearTimeout(loadTimer);visible=false;await ad().removeBanner();reserve(0)}
 }catch(error){failed(error);await ad()?.removeBanner().catch(()=>{});if(!wanted())reserve(0);}
 });}
export function bindBannerAds(){
 if(!adsAvailable())return;
 if(!installed){installed=true;
  const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches('dialog,.routine-sheet-backdrop,.town-building-screen')||n.querySelector('dialog,.routine-sheet-backdrop,.town-building-screen')))))update()});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-active-tab']});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  window.addEventListener('drawer-ad-retry',()=>{retryAt=0;clearTimeout(retryTimer);update()});window.addEventListener('drawer-village-auth-busy',update);window.addEventListener('drawer-ads-update',update);window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(requestedWidth&&requestedWidth!==window.innerWidth){queue=queue.catch(()=>{}).then(async()=>{visible=false;clearTimeout(loadTimer);await ad().removeBanner();retryAt=0;measuredHeight=56;});update();}},250)});
  void ad().addListener('bannerAdLoaded',()=>{if(visible&&wanted()){clearTimeout(loadTimer);retryAt=0;slot?.replaceChildren();reserve(measuredHeight);}});
  void ad().addListener('bannerAdSizeChanged',size=>{if(visible&&wanted()&&Number.isFinite(size.height)&&size.height>0){measuredHeight=Math.ceil(size.height);reserve(measuredHeight);}});
  void ad().addListener('bannerAdFailedToLoad',error=>{if(visible)failed(Object.assign(Error(error?.message||'ads-load'),{code:error?.code,adStage:'banner'}));});
 }
 if(document.documentElement.dataset.activeTab==='settings'&&!document.querySelector('[data-game-ad-privacy]')){
  const button=document.createElement('button');button.dataset.gameAdPrivacy='';button.textContent=t('광고 개인정보 설정','Ad privacy settings','広告のプライバシー設定');button.onclick=()=>void adPrivacyOptions().catch(()=>{});document.querySelector('#app main')?.append(button);
 }
 update();
}
