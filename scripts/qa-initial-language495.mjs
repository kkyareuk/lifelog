import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {initialLanguage} from '../initial-language.js';
assert.equal(initialLanguage({languages:['fr-FR','ja-JP']}),'ja');
assert.equal(initialLanguage({language:'EN_gb'}),'en');
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Type',/\.(js|mjs)$/.test(path)?'text/javascript':'text/html');res.end(path==='/'?'<html></html>':await readFile(resolve('.'+path)))}catch(e){console.error(req.url,e.message);res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await(process.argv.includes('--webkit')?webkit.launch():chromium.launch({channel:'chrome'}));
try{
 for(const [locale,expected]of [['ko-KR','ko'],['en-GB','en'],['ja-JP','ja'],['fr-FR','en']]){
  const ctx=await browser.newContext({locale});const p=await ctx.newPage();await p.goto(origin);
  assert.equal(await p.evaluate(async()=>{window.g=await import('/state.js');return g.state.uiLanguage}),expected);
  // An existing save without residents still preserves its explicitly chosen language.
  await p.evaluate(()=>{g.state.uiLanguage='ko';localStorage.setItem('drawer-village-game-v1',JSON.stringify(g.state))});await p.reload();
  assert.equal(await p.evaluate(async()=>(await import('/state.js')).state.uiLanguage),'ko');
  await ctx.close();
 }
 // Legacy save without language stays Korean; recoverable Japanese world wins over English device.
 const ctx=await browser.newContext({locale:'en-US'}),p=await ctx.newPage();await p.goto(origin);
 await p.evaluate(async()=>{const g=await import('/state.js');const world=g.emptyWorld();delete world.uiLanguage;localStorage.setItem('drawer-village-game-v1',JSON.stringify(world))});await p.reload();assert.equal(await p.evaluate(async()=>(await import('/state.js')).state.uiLanguage),'ko');
 await p.evaluate(async()=>{const g=await import('/state.js');g.createCharacter();g.state.uiLanguage='ja';localStorage.setItem('drawer-village-last-nonempty-state-v1',JSON.stringify(g.state));localStorage.removeItem('drawer-village-game-v1')});await p.reload();assert.equal(await p.evaluate(async()=>(await import('/state.js')).state.uiLanguage),'ja');await ctx.close();
 console.log('PASS first-run KO/EN/JA/unsupported, preference order, existing/legacy/recovery language preserved');
}finally{await browser.close();server.closeAllConnections();server.close()}

