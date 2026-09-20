import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve(process.argv[2]||'.'),old=process.argv.includes('--before');
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep))throw Error();const body=pathname==='/fixture'?'<html></html>':await readFile(file);res.setHeader('Content-Type',['.js','.mjs'].includes(extname(file))?'text/javascript':extname(file)==='.css'?'text/css':'text/html');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true}),origin=`http://127.0.0.1:${server.address().port}`;
try{
 for(const scenario of ['other-account','old-backup','recover-primary','unrecoverable']){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.on('console',m=>{if(m.type()==='error')console.log(m.text())});await page.goto(origin+'/fixture');
  const result=await page.evaluate(async scenario=>{
   const main='drawer-village-game-v1',backup='drawer-village-last-nonempty-state-v1',missing='drawer-idb-snapshot-v1:missing';
   // Build a valid fixture with the actual current schema, then reload imports.
   const g=await import('/state.js?v=20260909dev305');const id=g.createCharacter();g.state.characters[id].name='Preserved';await g.save(true);
   const {accountStorage}=await import('/account-storage.js?v=20260909dev305');const raw=accountStorage.getItem(main);localStorage.setItem(main,raw);
   if(scenario==='other-account')localStorage.setItem('drawer-account:another:'+main,missing);
   if(scenario==='old-backup')localStorage.setItem(backup,missing);
   if(scenario==='recover-primary'){localStorage.setItem(backup,raw);localStorage.setItem(main,missing)}
   if(scenario==='unrecoverable'){localStorage.removeItem(backup);localStorage.setItem(main,missing)}
   return {raw,id};
  },scenario);
  await page.reload();
  const outcome=await page.evaluate(async()=>{try{const g=await import('/state.js?v=20260909dev305');return {ok:true,names:Object.values(g.state.characters).map(c=>c.name)}}catch(e){return {ok:false,error:e.message}}});
  if(old||scenario==='unrecoverable')assert.equal(outcome.ok,false,scenario);else {assert.equal(outcome.ok,true,JSON.stringify(outcome));assert(outcome.names.includes('Preserved'))}
  if(scenario==='unrecoverable')assert.equal(await page.evaluate(()=>localStorage.getItem('drawer-village-game-v1')),'drawer-idb-snapshot-v1:missing');
  if(scenario==='recover-primary'&&!old)assert(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('drawer-village-unreadable-primary-v1:')&&localStorage.getItem(k)==='drawer-idb-snapshot-v1:missing')));
  await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await page.goto(origin+'/index.html');
  if(old||scenario==='unrecoverable')await page.waitForFunction(()=>document.querySelector('#app-loading.is-failed'));
  else await page.waitForFunction(()=>document.documentElement.dataset.drawerRendered==='1');
  console.log(`${old?'REPRODUCED':'PASS'} ${scenario}: ${JSON.stringify(outcome)}`);await context.close();
 }
}finally{await browser.close();server.close()}
