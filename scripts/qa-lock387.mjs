import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-lock387');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root))throw Error();let body=await readFile(path==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(path==='/views.js')body=body.toString()+'\nexport {homeLifePersonMarkup,homeBedForegroundStatusMarkup};';if(path==='/simulation.js')body=body.toString()+'\nexport {sleepingNow,buildScene};';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,engine=process.argv.includes('--webkit')?'webkit':'chromium';const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{const page=await browser.newPage({viewport:{width:384,height:820},deviceScaleFactor:3,hasTouch:true,serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.addLocatorHandler(page.locator('dialog.page-guide[open]'),async()=>{await page.locator('dialog.page-guide[open] button').last().click()});await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 await page.evaluate(async()=>{
 window.g=await import('/state.js?v=20260909dev305');const id=g.createCharacter(20);g.state.activeId=id;window.testId=id;g.state.characterSettingsView='full';
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());
 document.body.insertAdjacentHTML('beforeend','<section id="qa-lock"><label><b>Speech</b><input data-field="neatness"></label></section>');
 const {bindDiscoveryLocks}=await import('/character-discovery.js?v=20260909dev305');bindDiscoveryLocks();
 const original=Storage.prototype.setItem;
 Storage.prototype.setItem=function(key,value){if(key.endsWith('drawer-village-game-v1')&&!String(value).startsWith('drawer-idb-snapshot-v1:'))throw new DOMException('forced snapshot quota','QuotaExceededError');return original.call(this,key,value)};
 });
 const lock=page.locator('#qa-lock [data-discovery-lock="neatness"]');assert.equal(await lock.count(),1);
 const before=await lock.getAttribute('aria-pressed');await lock.click();await page.waitForFunction(()=>!document.querySelector('#qa-lock button').disabled);
 assert.equal(await lock.getAttribute('aria-pressed'),before==='true'?'false':'true');assert.equal(await page.locator('[data-lock-error]').count(),0);
 const saved=await page.evaluate(async()=>{const {accountStorage}=await import('/account-storage.js?v=20260909dev305');const raw=JSON.parse(accountStorage.getItem('drawer-village-game-v1'));return {lock:raw.characters[testId].discovery.locks.neatness,expected:g.state.characters[testId].discovery.locks.neatness,pointer:window.localStorage.getItem('drawer-village-game-v1')}});
 assert.equal(saved.lock,saved.expected);assert.match(saved.pointer,/^drawer-idb-snapshot-v1:/);
 await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const reloaded=await page.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.characters[g.state.activeId].discovery.locks.neatness});assert.equal(reloaded,saved.expected);
 console.log('PASS '+engine+': actual lock button saves under forced snapshot quota, no error, value survives reload');
}finally{await browser.close();server.close()}
