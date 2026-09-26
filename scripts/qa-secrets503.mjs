import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.argv.includes('--bundled')?resolve('www'):process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:process.argv.includes("--tablet")?{width:1024,height:768}:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');const a=g.createCharacter(),b=g.createCharacter();g.state.characters[a].name='가람';g.state.characters[b].name='나래';window.ids=[a,b];g.state.activeId=a;window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.setCharacterPane('secrets');window.photoQA.render({force:true});document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));
 const select=p.locator('[data-secret-field="new-kind"]');
 await select.selectOption('trauma');await p.locator('[data-secret-add]').click();
 await p.locator('[data-secret-field="event"]').selectOption('fire');
 const opts=await p.locator('[data-secret-trigger-add] option').allTextContents();assert(opts[1].includes('★'));assert(opts.slice(1,4).some(x=>x.includes('불·')));
 await p.locator('[data-secret-trigger-add]').selectOption('fire');await p.locator('[data-secret-field="intensity"]').selectOption('strong');
 await p.locator('[data-secret-known]').check();
 await p.screenshot({path:'tmp/secrets503-trauma.png',fullPage:true});
 await select.selectOption('relationship');await p.locator('[data-secret-add]').click();
 await p.locator('[data-secret-field="target"]').selectOption(await p.evaluate(()=>ids[1]));await p.locator('[data-secret-field="relation"]').selectOption('enemy');
 await select.selectOption('custom');await p.locator('[data-secret-add]').click();
 await p.locator('[data-secret-field="text"]').fill('<img src=x onerror=alert(1)> 숨겨 온 편지');await p.locator('[data-secret-field="text"]').press('Tab');
 assert.equal(await p.locator('.secret-settings img').count(),0);
 await select.selectOption('preference');await p.locator('[data-secret-add]').click();await p.locator('[data-secret-taste]').click();
 await p.getByRole('searchbox',{name:'취향 검색'}).fill('스릴러');await p.locator('.secret-choice-grid button').click();
 const stored=await p.evaluate(()=>g.state.characters[ids[0]].secrets);assert.equal(stored.length,4);assert.equal(stored[0].intensity,'strong');assert(stored[0].triggers.includes('fire'));assert.equal(stored[3].taste,'thriller');
 await p.evaluate(async()=>{await g.save(true,false)});await p.reload();await p.waitForFunction(()=>window.photoQA);
 assert.equal(await p.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.characters[g.state.activeId].secrets.length}),4);
 for(const lang of ['en','ja']){await p.evaluate(async lang=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.setCharacterPane('secrets');window.photoQA.render({force:true});document.querySelectorAll('dialog[open]').forEach(d=>d.close());},lang);assert(await p.locator('[data-secret-add]').isVisible());assert.equal(await p.locator('.secret-settings').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);}
 await p.evaluate(()=>{g.state.uiLanguage='ko';g.state.characterSettingsView='hub';window.photoQA.render({force:true})});await p.locator('[data-open-quick-character-settings]').filter({visible:true}).first().click();
 await p.locator('[data-open-secret-settings]').click();assert(await p.locator('[data-secret-settings]').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS503 browser UI: trauma recommendations, multiple secrets, hidden relationship, escaped custom text, searchable 3-column taste picker, reload, EN/JA, quick shortcut');
}finally{await browser.close();server.close()}




