import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-discovery327');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const language of ['ko','en','ja'])for(const width of [384,1180]){
 const p=await browser.newPage({viewport:{width,height:832}}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.addInitScript(()=>localStorage.setItem('drawer-village-guide-character','1'));await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
 await p.evaluate(async lang=>{window.game=await import('/state.js?v=20260909dev305');game.createCharacter();game.state.uiLanguage=lang;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('character')},language);
 await p.evaluate(async()=>{window.discovery=await import('/character-discovery.js?v=20260909dev305');window.rules=await import('/character-discovery-rules.js?v=20260909dev305');window.c=game.active();c.discovery={version:2};});
 for(const id of ['profile-height','profile-checkup']){
  await p.evaluate(id=>discovery.showDiscovery(c,{title:'걷는 중'},rules.DISCOVERY_SCENES.find(q=>q.id===id)),id);
  const d=p.locator('.character-discovery-dialog');await d.waitFor();assert(await d.locator('.discovery-record-editor').count());
  if(id==='profile-height'){await d.locator('select').first().selectOption('number');await d.locator('input[type=number]').fill('172.5');}
  await p.screenshot({path:out+`/${id}-${width}-${language}.png`});
  await d.locator('.discovery-choices button').click();await d.waitFor({state:'detached'});
 }
 assert.equal(await p.evaluate(()=>c.bodyProfile.heightCm),'172.5');
 await p.evaluate(()=>{c.bodyProfile.tattoos=[{name:'꽃',location:'왼팔',type:'꽃·식물',attitude:'아끼며 드러내고 싶어함'}];discovery.showDiscovery(c,{title:'걷는 중'},rules.DISCOVERY_SCENES.find(q=>q.id==='profile-tattoo-details'));});
 const d=p.locator('.character-discovery-dialog');await d.locator('.discovery-add-record').click();assert.equal(await d.locator('article').count(),2);await p.screenshot({path:out+`/tattoos-${width}-${language}.png`});await d.locator('.discovery-choices button').click();await d.waitFor({state:'detached'});assert.equal(await p.evaluate(()=>c.bodyProfile.tattoos.length),2);
 assert.deepEqual(errors,[]);console.log('PASS real form save, numeric height, checkup, repeated tattoos',width,language);await p.close();
}}finally{await browser.close();server.close()}
