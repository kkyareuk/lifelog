import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback433');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter(),b=g.createCharacter();window.qaIds=[a,b];g.state.characters[a].name='A';g.state.characters[b].name='B';g.setActive(a);document.documentElement.classList.add('native-app');window.DrawerVillageNavigation.go('observe');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await page.waitForTimeout(700);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

 await page.evaluate(async()=>{
  window.adCalls=[];window.adEvents={};window.adsPaid=false;
  const ad={requestConsentInfo:async()=>({canRequestAds:true,status:'NOT_REQUIRED'}),initialize:async()=>{},showBanner:async o=>adCalls.push(['banner',o]),removeBanner:async()=>adCalls.push(['remove']),addListener:async(name,fn)=>{adEvents[name]=fn;return {remove:async()=>delete adEvents[name]}},prepareInterstitial:async()=>adCalls.push(['prepare']),showInterstitial:async()=>{adCalls.push(['interstitial']);setTimeout(()=>adEvents.interstitialAdDismissed?.(),5)}};
  window.Capacitor={getPlatform:()=> 'android',Plugins:{AdMob:ad}};
  window.PARALLEL_CITY_CONFIG.ads={enabled:true,testing:true};
  window.ParallelCityAuth={...window.ParallelCityAuth,getInfo:()=>({ready:true,user:{uid:'qa-ad'},busy:false,guideState:{loaded:true,seen:[]}}),getIdToken:async()=> 'qa-token'};
  const oldFetch=window.fetch;window.fetch=async(url,options)=>String(url).includes('/discovery/')?new Response(JSON.stringify({lastAt:0,serverNow:Date.now(),interval:adsPaid?60000:600000,adFree:adsPaid,rewardCredits:0}),{status:200}):oldFetch(url,options);
  window.adBanner=await import('/banner-ads.js');adBanner.bindBannerAds();
 });
 await page.waitForFunction(()=>document.documentElement.classList.contains('has-game-banner'));
 for(const tab of ['observe','town','home']){await page.evaluate(tab=>{g.state.activeHomeId=g.state.characters[qaIds[0]].homeId;g.state.activeTownId=g.state.characters[qaIds[0]].townId;window.DrawerVillageNavigation.go(tab);qaRender();adBanner.bindBannerAds()},tab);await page.waitForTimeout(150);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.waitForFunction(()=>document.documentElement.classList.contains('has-game-banner'));assert(await page.evaluate(()=>document.querySelector('#app').getBoundingClientRect().top>=50));}
 const count=await page.evaluate(()=>adCalls.filter(c=>c[0]==='banner').length);await page.evaluate(()=>{adBanner.bindBannerAds();adBanner.bindBannerAds()});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>adCalls.filter(c=>c[0]==='banner').length),count,'repeated bindings do not duplicate the banner');
 await page.evaluate(()=>{const d=document.createElement('dialog');d.id='qa-ad-dialog';document.body.append(d);d.showModal()});await page.waitForFunction(()=>!document.documentElement.classList.contains('has-game-banner'));
 await page.evaluate(()=>document.querySelector('#qa-ad-dialog').remove());await page.waitForFunction(()=>document.documentElement.classList.contains('has-game-banner'));
 await page.evaluate(async()=>{window.mafiaAds=await import('/mafia-ads.js');mafiaAds.updateMafiaAd({id:'qa-game',status:'playing'},{id:'a',alive:true})});await page.waitForFunction(()=>adCalls.some(c=>c[0]==='prepare'));
 await page.evaluate(()=>{mafiaAds.updateMafiaAd({id:'qa-game',status:'playing'},{id:'a',alive:false});mafiaAds.updateMafiaAd({id:'qa-game',status:'finished'},{id:'a',alive:false})});await page.waitForFunction(()=>adCalls.some(c=>c[0]==='interstitial'));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>adCalls.filter(c=>c[0]==='interstitial').length),1);
 await page.screenshot({path:out+'/ads440-'+(useWebKit?'webkit':'chrome')+'.png'});
 await page.evaluate(async()=>{adsPaid=true;const access=await import('/discovery-access.js');access.setDiscoveryEntitlement(true)});await page.waitForFunction(()=>!document.documentElement.classList.contains('has-game-banner'));
 assert.equal(await page.evaluate(async()=>{const a=await import('/discovery-access.js');return a.discoveryPremium()}),true);
 console.log('PASS440 mock native SDK: banner reserved area, no duplicate load, dialog hide/restore, one interstitial per game');
}finally{await browser.close();server.closeAllConnections();server.close()}
