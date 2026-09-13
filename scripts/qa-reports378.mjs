import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';if(pathname==='/views.js')body=body.toString()+'\nwindow.qaVisibleTimeline=visibleTimeline;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);



 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.state.characterSettingsView='full';g.state.characterPane='body';document.documentElement.classList.add('native-app','native-platform');window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.state.characterPane='body';window.qaRender()});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.evaluate(()=>{const d=document.querySelector('[data-body-choice-dialog]');d.querySelectorAll('[data-body-choice-panel]').forEach(p=>p.hidden=p.dataset.bodyChoicePanel!=='overallImpressions');d.showModal()});
 const metrics=await page.evaluate(()=>{const e=document.querySelector('[data-body-choice-panel="overallImpressions"]');e.scrollTop=e.scrollHeight;return {h:e.clientHeight,sh:e.scrollHeight,scroll:e.scrollTop,pointer:getComputedStyle(e).pointerEvents}});assert.equal(metrics.pointer,'auto');assert(metrics.scroll>0);console.log('BODY_SCROLL',metrics);

 for(const path of ['appearance.eyeFeatures','overallImpressions']){
  await page.evaluate(path=>{const d=document.querySelector('[data-body-choice-dialog]');d.querySelectorAll('[data-body-choice-panel]').forEach(p=>p.hidden=p.dataset.bodyChoicePanel!==path)},path);
  const p=page.locator(`[data-body-choice-panel="${path}"]`);assert.equal(await p.evaluate(e=>getComputedStyle(e).pointerEvents),'auto');await p.evaluate(e=>e.scrollTop=e.scrollHeight);assert(await p.evaluate(e=>e.scrollHeight<=e.clientHeight||e.scrollTop>0));
 }
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const timeline=await page.evaluate(()=>{const d=new Date(2026,8,13,3,45),key='2026-9-13';g.state.sharedContext={groupId:'qa'};const result=window.qaVisibleTimeline({id:'qa',days:{[key]:{entries:[{minute:102,time:'01:42',title:'Past'},{minute:225,time:'03:45',title:'Now'},{minute:329,time:'05:29',title:'Future'}]}}},d);delete g.state.sharedContext;return result.map(e=>e.minute)});assert.deepEqual(timeline,[102,225]);console.log('SHARED_TIMELINE',timeline);
 await page.evaluate(()=>{const scene=document.createElement('div');scene.className='world town-environment';scene.id='depth-qa';scene.style.cssText='width:360px;height:800px';for(let i=0;i<30;i++){const b=document.createElement('button');b.className='map-art-button';b.style.cssText=`position:absolute;top:${i*12}px;width:60px;height:60px`;scene.append(b)}const badge=document.createElement('div');badge.className='person place-people is-town-conversation';scene.append(badge);document.body.append(scene)});
 await page.evaluate(async()=>{const {bindSceneDepth}=await import('/scene-depth.js?v=20260909dev305');bindSceneDepth(document.body)});await page.waitForTimeout(80);
 assert(await page.evaluate(()=>{const s=document.querySelector('#depth-qa'),z=e=>Number(getComputedStyle(e).zIndex);return z(s.querySelector('.place-people'))>Math.max(...[...s.querySelectorAll('.map-art-button')].map(z))}));console.log('OCCUPANCY_BADGE_ABOVE_30_BUILDINGS_PASS');
 await page.evaluate(()=>{document.querySelector('#depth-qa').remove();window.DrawerVillageNavigation.go('town')});await page.waitForTimeout(200);
 assert.equal(await page.locator('.town-native-town-pill > span').count(),1);assert.equal(await page.locator('.town-native-community > span').count(),1);assert.equal(await page.locator('.town-native-town-pill > span i').textContent(),'▾');
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.screenshot({path:resolve(out,'town378.png')});
 await page.evaluate(()=>window.DrawerVillageNavigation.go('mailbox'));
 await page.locator('[data-mail-folder="compose"]').click();
 const sender=page.locator('[data-player-mail] [name="sourceId"]');assert.equal(await sender.inputValue(),'');
 await page.locator('[data-player-mail] [name="gift"]').evaluate(e=>{e.value='fashion:qa-coat';e.dispatchEvent(new Event('change',{bubbles:true}))});
 assert.equal(await sender.inputValue(),'');console.log('PLAYER_SENDER_PRESERVED_AFTER_GIFT_PASS');
}finally{await browser.close();server.close()}

