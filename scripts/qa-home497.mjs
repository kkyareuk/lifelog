import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.DRAWER_VILLAGE_ECONOMY_ENABLED=true;window.DRAWER_VILLAGE_CAREER_ENABLED=true});
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();const c=g.state.characters[g.state.activeId];c.icon='./assets/home-ui/profile-placeholder.png';c.ldImage='./assets/home-ui/profile-placeholder.png';g.state.homeVisualMode='sd';window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));
 const toggle=p.locator('[data-home-visual-toggle]');await toggle.waitFor();
 assert.deepEqual(await p.locator('.character-money-shortcuts>button').evaluateAll(bs=>bs.map(b=>b.hasAttribute('data-home-visual-toggle')?'visual':b.dataset.moneyShortcut)),['visual','wallet','work']);
 for(const lang of ['ko','en','ja']){
  await p.evaluate(lang=>{g.state.uiLanguage=lang;g.state.homeVisualMode='sd';photoQA.render()},lang);
  await toggle.click();await p.locator('.game-hud-stage.visual-mode-ld').waitFor();assert.equal(await p.evaluate(()=>g.state.homeVisualMode),'ld');
  await toggle.click();await p.locator('.game-hud-stage.visual-mode-sd').waitFor();
 }
 const rects=await p.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}};return {profile:rect('.game-hud-profile-frame'),toggle:rect('[data-home-visual-toggle]'),wallet:rect('[data-money-shortcut=wallet]'),career:rect('[data-money-shortcut=work]')}});
 assert.ok(rects.toggle.top>=rects.profile.bottom,JSON.stringify(rects));assert.ok(rects.wallet.top>=rects.toggle.bottom);assert.ok(rects.career.top>=rects.wallet.bottom);
 await p.screenshot({path:'tmp/home497-ja.png'});
 await toggle.click();await p.evaluate(()=>g.save(true));await p.reload();await p.waitForFunction(()=>window.photoQA);assert.equal(await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');return g.state.homeVisualMode}),'ld');
 await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');window.DRAWER_VILLAGE_CAREER_ENABLED=false;g.state.uiLanguage='en';window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());photoQA.render()});
 assert.equal(await p.locator('[data-money-shortcut=work]').count(),0);assert.equal(await p.locator('[data-money-shortcut=wallet]').count(),1);assert.equal(await toggle.count(),1);
 await p.locator('[data-home-social=drawer]').click();assert.equal(await p.locator('[data-drawer-route=careers]').count(),0);assert.equal(await p.locator('[data-drawer-route=economy]').count(),1);await p.locator('[data-social-close]').click();
 await p.evaluate(()=>window.DrawerVillageNavigation.go('character'));await p.locator('[data-open-quick-character-settings]:visible').first().click();assert.equal(await p.locator('[data-quick-economy=job]').count(),0);assert.equal(await p.locator('[data-quick-economy=wealth]').count(),1);
 await p.locator('[data-save-mobile-character-editor]').click();
 await p.evaluate(()=>{g.state.characterProfileBook=false;g.state.characterSettingsView='full';g.state.characterPane='profile';g.state.characterOverviewPane='career';photoQA.render()});assert.equal(await p.locator('[data-employment-editor]').count(),0);assert.equal(await p.locator('[data-open-career-settings]').count(),0);
 const results=await p.evaluate(async()=>{
 const {routineScene}=await import('/routine-scenes.js'),{currentDuties}=await import('/salary.js');
 const now=new Date(2026,8,25,11),scene={routineId:'shift',routineType:'업무',routineStartMinute:540,routineEndMinute:1080,title:'환자를 진료하는 중',desc:'환자의 증상을 확인하고 있어요.'};
 const c={id:'qa',job:'의사'},original=routineScene(scene,c,{characters:{qa:c}},+now);
 const office=routineScene(scene,{id:'office',job:'회사원'},{characters:{}},+now);
 const world={uiLanguage:'ko'},employee={wallet:{employments:[{jobId:'builtin-office',rankId:'rank-1'}]}};
 return {original,office,generic:currentDuties(world,employee)};
 });assert.equal(results.original.title,'환자를 진료하는 중');assert.notEqual(results.office.title,results.original.title);assert.ok(results.office.officeTaskId);assert.equal(results.generic.length,0);
 assert.deepEqual(errors,[]);console.log('PASS SD/LD real stage, KO/EN/JA, placement, save/reload; public careers hidden, wallet retained; authored work scripts preserved');
}finally{await browser.close();server.closeAllConnections();server.close()}
