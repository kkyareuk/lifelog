import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-ios507');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:393,height:798},serviceWorkers:'block'});
 let physical={width:393,height:798};await page.exposeFunction('reserveNative',async({height})=>{await page.setViewportSize({width:physical.width,height:physical.height-height-(height?54:0)})});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter(),b=g.createCharacter();window.qaIds=[a,b];g.state.characters[a].name='A';g.state.characters[b].name='B';g.setActive(a);document.documentElement.classList.add('native-app');window.DrawerVillageNavigation.go('observe');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await page.waitForTimeout(700);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

 await page.evaluate(async()=>{
  window.adCalls=[];window.adEvents={};window.adsPaid=false;
  const ad={requestConsentInfo:async()=>({canRequestAds:true,status:'NOT_REQUIRED'}),initialize:async()=>{},showBanner:async o=>{adCalls.push(['banner',o]);setTimeout(()=>{adEvents.bannerAdSizeChanged?.({height:64});adEvents.bannerAdLoaded?.()},5)},removeBanner:async()=>adCalls.push(['remove']),addListener:async(name,fn)=>{adEvents[name]=fn;return {remove:async()=>delete adEvents[name]}},prepareInterstitial:async()=>adCalls.push(['prepare']),showInterstitial:async()=>{adCalls.push(['interstitial']);setTimeout(()=>adEvents.interstitialAdDismissed?.(),5)}};
  window.Capacitor={getPlatform:()=> 'ios',Plugins:{AdMob:ad,AdViewport:{reserve:options=>window.reserveNative(options)}}};
  window.PARALLEL_CITY_CONFIG.ads={enabled:true,testing:true};
  window.ParallelCityAuth={...window.ParallelCityAuth,getInfo:()=>({ready:true,user:{uid:'qa-ad'},busy:false,guideState:{loaded:true,seen:[]}}),getIdToken:async()=> 'qa-token'};
  const oldFetch=window.fetch;window.fetch=async(url,options)=>String(url).includes('/discovery/')?new Response(JSON.stringify({lastAt:0,serverNow:Date.now(),interval:adsPaid?60000:600000,adFree:adsPaid,rewardCredits:0}),{status:200}):oldFetch(url,options);
  await (await import('/discovery-access.js')).refreshDiscoveryAccess(); window.adBanner=await import('/banner-ads.js');adBanner.bindBannerAds();
 });
 await page.getByRole('button',{name:'탭하여 서랍 열기'}).click();
 await page.waitForFunction(()=>document.documentElement.classList.contains('has-game-banner'),null,{timeout:5000}).catch(async e=>{console.log(await page.evaluate(()=>({cls:document.documentElement.className,html:document.body.innerText.slice(0,600),calls:adCalls,auth:ParallelCityAuth.getInfo()})));throw e});

 for(const tab of ['observe','town','home','settings']){
  await page.evaluate(tab=>{g.state.activeHomeId=g.state.characters[qaIds[0]].homeId;g.state.activeTownId=g.state.characters[qaIds[0]].townId;DrawerVillageNavigation.go(tab);qaRender();adBanner.bindBannerAds()},tab);
  await page.waitForTimeout(200);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.waitForFunction(()=>document.documentElement.classList.contains('has-game-banner'));
  const bounds=await page.evaluate(()=>({top:document.querySelector('#app').getBoundingClientRect().top,h:innerHeight,transform:getComputedStyle(document.querySelector('#app')).transform}));
  assert.equal(bounds.top,0);assert.equal(bounds.transform,'none');assert(bounds.h<798);
 }
 await page.evaluate(()=>{DrawerVillageNavigation.go('observe');qaRender();adBanner.bindBannerAds()});await page.waitForTimeout(200);
 const footer=await page.locator('.game-hud-character-command').boundingBox();assert(footer&&footer.y+footer.height<=await page.evaluate(()=>innerHeight),'action button stays inside shortened viewport');
 await page.evaluate(()=>adEvents.bannerAdSizeChanged({height:90}));await page.waitForFunction(()=>innerHeight===654);
 const resized=await page.locator('.game-hud-character-command').boundingBox();assert(resized.y+resized.height<=654,'adaptive height keeps footer visible');
 await page.screenshot({path:out+'/iphone-'+(useWebKit?'webkit':'chrome')+'.png'});
 await page.evaluate(()=>{document.documentElement.dataset.activeTab='character';adBanner.bindBannerAds()});await page.waitForFunction(()=>innerHeight===798);
 await page.evaluate(()=>{document.documentElement.dataset.activeTab='observe';adBanner.bindBannerAds()});await page.waitForFunction(()=>innerHeight<798);
 physical={width:852,height:393};await page.setViewportSize(physical);await page.waitForTimeout(600);
 assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#app')).transform),'none');
 await page.evaluate(async()=>{const a=await import('/discovery-access.js');a.setDiscoveryEntitlement(true)});await page.waitForFunction(()=>innerHeight===393);
 console.log('PASS iOS507: actual game UI, adaptive banner resize, footer in viewport, screen hide/restore, rotation and ad removal. Native SDK mocked; Mac simulator separately checks actual WKWebView frame.');
}finally{await browser.close();server.closeAllConnections();server.close()}
