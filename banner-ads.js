import {adsAvailable,initializeAds,adOptions,adIsFullScreen,adPrivacyOptions} from './native-ads.js';
import {discoveryPremium,refreshDiscoveryAccess} from './discovery-access.js';
let installed=false,visible=false,queue=Promise.resolve(),retryAt=0,scheduled=false;
function reserve(height){document.documentElement.style.setProperty('--game-ad-height',height+'px');document.documentElement.style.setProperty('--game-viewport-height',height?`calc(100dvh - ${height}px)`:'100dvh');document.documentElement.classList.toggle('has-game-banner',height>0)}
function wanted(){return adsAvailable()&&!discoveryPremium()&&!adIsFullScreen()&&['observe','town','home'].includes(document.documentElement.dataset.activeTab)&&!document.querySelector('dialog[open],.routine-sheet-backdrop,.mafia-playback,.town-building-screen,.is-account-loading,.is-welcome')}
function update(){if(scheduled)return;scheduled=true;queue=queue.catch(()=>{}).then(async()=>{scheduled=false;
 const ad=window.Capacitor?.Plugins?.AdMob;
 if(!wanted()){if(visible){visible=false;await ad?.removeBanner()}reserve(0);return;}
 if(visible||Date.now()<retryAt)return;
 try{await refreshDiscoveryAccess();if(!wanted())return;await initializeAds();if(!wanted())return;
  reserve(56);visible=true;await ad.showBanner({...adOptions('banner'),adSize:'BANNER',position:'TOP_CENTER'});
  if(!wanted()){visible=false;await ad.removeBanner();reserve(0)}
 }catch{visible=false;reserve(0);retryAt=Date.now()+60000;await ad?.removeBanner().catch(()=>{})}
 });}
export function bindBannerAds(){
 if(!adsAvailable())return;
 if(!installed){installed=true;
  const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches('dialog,.routine-sheet-backdrop,.town-building-screen')||n.querySelector('dialog,.routine-sheet-backdrop,.town-building-screen')))))update()});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-active-tab']});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  window.addEventListener('drawer-ads-update',update);window.addEventListener('focus',update);
  void window.Capacitor.Plugins.AdMob.addListener('bannerAdFailedToLoad',()=>{visible=false;reserve(0);retryAt=Date.now()+60000;void window.Capacitor.Plugins.AdMob.removeBanner()});
 }
 if(document.documentElement.dataset.activeTab==='settings'&&!document.querySelector('[data-game-ad-privacy]')){
  const button=document.createElement('button'),lang=document.documentElement.lang;button.dataset.gameAdPrivacy='';button.textContent=lang==='ja'?'広告のプライバシー設定':lang==='en'?'Ad privacy settings':'광고 개인정보 설정';button.onclick=()=>void adPrivacyOptions().catch(()=>{});document.querySelector('#app main')?.append(button);
 }
 update();
}
