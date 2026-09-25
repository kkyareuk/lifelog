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

 const toggle=p.locator('[data-home-visual-toggle]');assert.equal(await toggle.innerText(),'SD');await toggle.click();assert.equal(await toggle.innerText(),'LD');
 for(const lang of ['ko','en','ja']){
  await p.evaluate(lang=>{g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('settings');photoQA.render()},lang);
  assert.equal(await p.locator('.settings-category-grid>button').count(),6);assert.equal(await p.locator('.settings-account-summary').count(),1);assert.equal(await p.locator('[data-auth]').count(),0);
  await p.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));


  assert.equal(await p.locator('.settings-category-grid').evaluate(e=>e.scrollHeight>e.clientHeight+2),false,'all six settings rows visible');
  await p.screenshot({path:'tmp/settings498-'+lang+'.png'});
  for(const pane of ['gameplay','display','sound','notifications','data','support','account']){
   await p.locator('[data-settings-pane='+pane+']').click();
   await p.locator('[data-settings-scroll='+pane+']').waitFor();
   assert.equal(await p.locator('.settings-shell').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,lang+':'+pane+' overflow');
   if(pane==='display'){assert.equal(await p.locator('[data-setting=uiLanguage]').count(),1);assert.equal(await p.locator('[data-setting=animationIntensity]').count(),1)}
   if(pane==='gameplay')assert.equal(await p.locator('[data-setting=animationIntensity]').count(),0);
   if(pane==='data')assert.equal(await p.locator('.storage-meter').count(),1);
   if(pane==='support'){
    assert.equal(await p.locator('[data-developer-feedback]').count(),1);await p.locator('[data-developer-feedback]').click();assert.equal(await p.locator('dialog[open] textarea').count(),0);await p.locator('dialog[open] button').last().click();
    await p.locator('[data-settings-pane=achievements]').click();await p.locator('[data-settings-scroll=achievements]').waitFor();await p.locator('.settings-pane-heading button').click();
   }
   if(pane==='account'){await p.locator('[data-reset]').click();assert.equal(await p.locator('dialog[open] button[type=submit]').isDisabled(),true);await p.locator('dialog[open] button[type=button]').click();assert.equal(await p.locator('[data-reset]').count(),1);assert.equal(await p.locator('[data-delete-own-account]').count(),1);}
   await p.locator('.settings-pane-heading button').click();
  }
 }
 await p.evaluate(()=>{const info=window.ParallelCityAuth.getInfo();window.ParallelCityAuth.getInfo=()=>({...info,user:{uid:'local-test'}});window.sentFeedback=[];window.ParallelCityAuth.submitFeedback=async value=>{window.sentFeedback.push(value);return true};photoQA.render()});
 await p.locator('[data-settings-pane=support]').click();await p.locator('[data-developer-feedback]').click();await p.locator('dialog[open] textarea').fill('Local test suggestion, no network request.');await p.locator('dialog[open] button[type=submit]').click();assert.equal(await p.evaluate(()=>window.sentFeedback.length),1);assert.equal(await p.locator('dialog[open] button[type=submit]').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS settings KO/EN/JA: six categories, account, subpages, storage, help, SD/LD, offline feedback mock');
}finally{await browser.close();server.closeAllConnections();server.close()}
