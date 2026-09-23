import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,8,23,11,0));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));


 const setup=await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId];c.sleep='23:59';c.wake='00:00';c.lifeNeeds={hunger:80,sleep:90,updatedAt:Date.now()};g.state.catalog.book=[{id:'mine',name:'내가 쓴 책'}];c.cooking={dishes:[1,2,3,4].map(n=>({id:'food'+n,recipeId:'kimchi_jjigae',homeId:c.homeId,room:'kitchen',storage:'fridge',rating:n,createdAt:Date.now(),updatedAt:Date.now(),remaining:64800000})),inventory:{}};window.storeUI=await import('/storage-ui.js');return {id:c.id,home:c.homeId};});
 await p.evaluate(({id,home})=>storeUI.openFridge({homeId:home},id),setup);
 assert.equal(await p.locator('.storage-card').count(),4);
 const cols=await p.locator('.storage-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(cols,3);
 await p.screenshot({path:'tmp/fridge493-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 await p.locator('.storage-card').first().click();assert(await p.getByRole('button',{name:'도시락 싸기',exact:true}).isVisible());await p.getByRole('button',{name:'도시락 싸기',exact:true}).click();
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].cooking.dishes.some(d=>d.storage==='lunchbox'));
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());delete g.state.characters[g.state.activeId].household.active;storeUI.openBooks(g.state.activeId)});
 assert(await p.getByRole('button',{name:'📚 내가 쓴 책',exact:true}).isVisible());
 await p.getByRole('button',{name:'책 구매',exact:true}).click();await p.locator('.storage-card').filter({hasText:'닫힌 방의 열쇠'}).click();await p.getByRole('button',{name:'구매',exact:true}).click();
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].library?.owned?.includes('library-mystery'));
 await p.screenshot({path:'tmp/books493-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home');window.photoQA.render()});
 await p.locator('.home-tour nav button').click().catch(()=>{});
 const size=await p.locator('.home-person:not(.is-seated) .avatar,.home-person:not(.is-seated) .sprite').first().evaluate(e=>getComputedStyle(e).width);assert.equal(size,'58px');
 const timing=await p.evaluate(async()=>{const {activityProgressMarkup,syncActivityProgress}=await import('/activity-progress.js');const c=g.state.characters[g.state.activeId],host=document.querySelector('.home-person-visual');host.insertAdjacentHTML('beforeend',activityProgressMarkup(g.state,c,{activityStartedAt:Date.now(),activityEndsAt:Date.now()+30000}));const bar=host.querySelector('.character-activity-progress');syncActivityProgress();return {value:bar.getAttribute('aria-valuenow'),ratio:bar.firstElementChild.getBoundingClientRect().width/bar.getBoundingClientRect().width};});assert.equal(timing.value,'0');assert(timing.ratio<.01);
 const created=await p.evaluate(()=>{const id=g.addTown(100);return {id,types:g.state.world.places.map(p=>p.type)}});for(const type of ['병원','카페','사무실','공연장','여관','공원','음식점'])assert(created.types.includes(type));
 assert.deepEqual(errors,[]);console.log('PASS fridge 3 columns/stars/lunchbox, books purchase/custom, 58px avatar, zero-start progress, seven new-town buildings');
}finally{await browser.close();server.closeAllConnections();server.close()}

