import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.');
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep))throw Error();res.setHeader('Content-Type',['.js','.mjs'].includes(extname(file))?'text/javascript':extname(file)==='.css'?'text/css':'text/html');res.end(await readFile(file));}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
try{for(const engine of ['chromium','webkit']){
const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{for(const lang of ['ko','en','ja']){
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:402,height:749}});
await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
await context.route('**/auth.js?*',route=>route.fulfill({contentType:'text/javascript',body:'window.fixtureAuth={ready:false,startupSyncing:false,startupError:""};window.ParallelCityAuth={getInfo:()=>window.fixtureAuth};'}));
const page=await context.newPage();await page.goto(origin+'/index.html');
await page.waitForFunction(()=>window.fixtureAuth&&document.querySelector('.village-account-loading'));
await page.evaluate(async lang=>{const {state}=await import('/state.js?v=20260909dev305');state.uiLanguage=lang;window.fixtureAuth.startupError='auth-state-timeout';window.dispatchEvent(new Event('drawer-village-auth-busy'));},lang);
await page.locator('.village-account-loading[role=alert]').waitFor({state:'attached'});
await page.locator('.drawer-title-actions button').waitFor();
assert.equal(await page.locator('.drawer-title-status').innerText(),'auth-state-timeout');
assert.equal(await page.locator('[data-auth-retry]').textContent(),{ko:'다시 시도',en:'Retry',ja:'再試行'}[lang]);
assert((await page.locator('.village-account-loading').textContent()).includes('auth-state-timeout'));
await page.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');});
await page.locator('[data-auth-retry]').click();await page.waitForFunction(()=>window.fixtureAuth?.startupError==='');
console.log(`PASS ${engine} ${lang}: pending account gate, error code, localized retry, reload`);await context.close();
}}finally{await browser.close();}
}}finally{server.close();}

