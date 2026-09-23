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






 await p.evaluate(()=>window.DrawerVillageNavigation.go('town'));
 await p.locator('[data-mobile-town-layout-mode]').click();
 await p.locator('[data-world-background-music]').waitFor();
 const order=await p.evaluate(()=>!!(document.querySelector('.town-transport-field').compareDocumentPosition(document.querySelector('.town-background-field'))&Node.DOCUMENT_POSITION_FOLLOWING));assert(order);
 await p.locator('.town-background-field .speech-picker-trigger').click();await p.locator('.speech-picker-dialog button').filter({hasText:'네오 캐시포트'}).click();
 assert.notEqual(await p.evaluate(()=>g.state.world.backgroundSetting),'neo_cacheport');assert(!(await p.locator('.town-background-field .speech-picker-trigger').innerText()).includes('네오'));
 await p.evaluate(()=>{const original=window.ParallelCityAuth.getInfo;window.ParallelCityAuth.getInfo=()=>({...original(),entitlements:{dlcPacks:['medieval','neo_cacheport']}})});
 await p.locator('.town-background-field .speech-picker-trigger').click();await p.locator('.speech-picker-dialog button').filter({hasText:'네오 캐시포트'}).click();
 assert.equal(await p.locator('html').getAttribute('data-town-background'),'neo_cacheport');
 await p.locator('[data-world-background-music]').selectOption('neo_cacheport');await p.locator('[data-world-background-rules]').uncheck();
 const values=await p.evaluate(async()=>{const {normalizeTownProfile}=await import('/town-profile.js'),{backgroundMusicPlaylist}=await import('/town-background.js'),{historicalTown}=await import('/town-setting.js');const town=normalizeTownProfile(g.state.world);return {town,home:backgroundMusicPlaylist(town,'home'),observe:backgroundMusicPlaylist(town),map:backgroundMusicPlaylist(town,'town'),historicOff:historicalTown({backgroundSetting:'arkenwald',backgroundRulesEnabled:false}),historicOn:historicalTown({backgroundSetting:'arkenwald'})}});
 assert.equal(values.town.backgroundSetting,'neo_cacheport');assert.equal(values.town.backgroundMusic,'neo_cacheport');assert.equal(values.town.backgroundRulesEnabled,false);assert.equal(values.town.era,'modern');assert.equal(values.observe.length,3);assert.equal(values.home[0],'./assets/audio/neo-home.mp3');assert.equal(values.map[0],'./assets/audio/neo-kaleidoscope.mp3');assert.equal(values.historicOff,false);assert.equal(values.historicOn,true);
 await p.locator('.town-background-field').scrollIntoViewIfNeeded();await p.screenshot({path:'tmp/background491-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 for(const screen of ['observe','home']){await p.evaluate(screen=>window.DrawerVillageNavigation.go(screen),screen);await p.screenshot({path:'tmp/neo491-'+screen+'.png'});assert.equal(await p.locator('html').getAttribute('data-town-background'),'neo_cacheport')}
 await p.reload();await p.waitForFunction(()=>window.photoQA);
 const saved=await p.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.world});assert.equal(saved.backgroundSetting,'neo_cacheport');assert.equal(saved.backgroundMusic,'neo_cacheport');assert.equal(saved.backgroundRulesEnabled,false);
 assert.deepEqual(errors,[]);console.log('PASS transport order, denied/unlocked DLC picker, Neo theme, three playlists, independent rules and saved music after reload');
}finally{await browser.close();server.closeAllConnections();server.close()}
