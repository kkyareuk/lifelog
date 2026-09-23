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
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());g.state.uiLanguage='en';window.DrawerVillageNavigation.go('character');photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));

 await p.locator('[data-open-quick-character-settings]:visible').first().click();
 const fields=p.locator('[data-quick-economy-fields]');await fields.waitFor({state:'visible'});
 assert.equal(await fields.locator('[data-open-career-settings],[data-character-money-settings]').count(),0);
 await fields.locator('[data-quick-economy=job]').selectOption('builtin-doctor');
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].wallet?.employment?.jobId==='builtin-doctor');
 assert.equal(await fields.locator('[data-quick-economy=job] option:checked').innerText(),'Doctor');
 assert.equal(await p.evaluate(()=>g.state.characters[g.state.activeId].job),'의사');
 assert.equal(await p.locator('.career-dialog[open],.character-money-dialog[open]').count(),0);
 p.once('dialog',d=>d.dismiss());await fields.locator('[data-quick-economy=wealth]').selectOption('부유함');assert.equal(await fields.locator('[data-quick-economy=wealth]').inputValue(),'평범한 형편');
 p.once('dialog',d=>d.accept());await fields.locator('[data-quick-economy=wealth]').selectOption('부유함');await p.waitForFunction(()=>g.state.characters[g.state.activeId].wealth==='부유함');assert.equal(await p.evaluate(()=>g.state.characters[g.state.activeId].wallet.balance),30000000);
 await fields.locator('[data-quick-economy=income]').selectOption('품질 우선');await p.waitForFunction(()=>g.state.characters[g.state.activeId].income==='품질 우선');
 await p.screenshot({path:'tmp/quick495-en.png'});
 await p.locator('[data-save-mobile-character-editor]').click();
 await p.locator('[data-open-quick-character-settings]:visible').first().click();assert.equal(await fields.locator('[data-quick-economy=job]').inputValue(),'builtin-doctor');assert.equal(await fields.locator('[data-quick-economy=wealth]').inputValue(),'부유함');
 await p.locator('[data-save-mobile-character-editor]').click();
 await p.evaluate(()=>{g.state.uiLanguage='ja';photoQA.render()});await p.locator('[data-open-quick-character-settings]:visible').first().click();assert.equal(await fields.locator('[data-quick-economy=job] option:checked').innerText(),'医師');
 await p.screenshot({path:'tmp/quick495-ja.png'});

 // Exercise the shared mutation route with the real control, deterministic API response.
 await p.evaluate(async()=>{const {quickEconomyMarkup,bindQuickEconomy}=await import('/quick-profile-economy.js');const c=g.state.characters[g.state.activeId];c.ownerUid='me';const snapshot={activeGroupId:'qa',group:{},residents:[{id:c.id,profileJson:'{}',lifeJson:'{}'}]};window.ParallelCityAuth={getInfo:()=>({user:{uid:'me'}})};window.DrawerVillageGroups={getSnapshot:()=>snapshot,characterMoney:async payload=>{window.quickPayload=payload;return {wallet:{...c.wallet,employments:[{jobId:payload.jobId,rankId:payload.rankId,jobName:'회사원'}]},job:'회사원',jobTitle:''}}};const host=document.createElement('section');host.id='shared-quick-test';host.innerHTML=quickEconomyMarkup(g.state,c);document.querySelector('[data-mobile-character-editor-dialog]').append(host);bindQuickEconomy(host,g.state,snapshot);window.qaSnapshot=snapshot;});
 await p.locator('#shared-quick-test [data-quick-economy=job]').selectOption('builtin-office');await p.waitForFunction(()=>window.quickPayload?.jobId==='builtin-office');assert.equal(await p.evaluate(()=>JSON.parse(qaSnapshot.residents[0].profileJson).job),'회사원');assert.equal(await p.evaluate(()=>JSON.parse(qaSnapshot.residents[0].lifeJson).wallet.employments[0].jobId),'builtin-office');
 assert.deepEqual(errors,[]);console.log('PASS quick settings native dropdowns, canonical career/payroll, EN/JA labels, wealth warning/cancel/reset, spending, reopen persistence');
}finally{await browser.close();server.closeAllConnections();server.close()}
