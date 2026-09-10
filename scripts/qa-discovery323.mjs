import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-discovery323');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const language of ['ko','en','ja'])for(const width of [384,1180]){
 const p=await browser.newPage({viewport:{width,height:832}}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.addInitScript(()=>localStorage.setItem('drawer-village-guide-character','1'));await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
 await p.evaluate(async lang=>{window.game=await import('/state.js?v=20260909dev305');game.createCharacter();game.state.uiLanguage=lang;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('character')},language);
 await p.screenshot({path:out+`/menus-${width}-${language}.png`});
 await p.locator('[data-open-full-character-settings]').first().evaluate(e=>e.click());await p.locator('[data-character-pane=personality]').first().evaluate(e=>e.click());
 const lock=p.locator('.character-book-form-page [data-discovery-lock="socialStyle"]').first();await lock.waitFor({state:'attached'});assert.equal(await lock.getAttribute('aria-pressed'),'false');
 const fold=lock.locator('xpath=ancestor::details');if(await fold.count())await fold.locator('summary').first().click({position:{x:8,y:12}});
 await p.screenshot({path:out+'/debug.png'});const select=p.locator('.character-book-form-page select[data-field=socialStyle]').first();await select.selectOption('먼저 다가감');assert.equal(await lock.getAttribute('aria-pressed'),'true');
 await lock.click();assert.equal(await lock.getAttribute('aria-pressed'),'false');
 await p.screenshot({path:out+`/locks-${width}-${language}.png`});
 await p.evaluate(async()=>{window.discovery=await import('/character-discovery.js?v=20260909dev305');window.rules=await import('/character-discovery-rules.js?v=20260909dev305');window.c=game.active();window.before=rules.discoveryScore(c,'socialStyle');discovery.showDiscovery(c,{title:'대화 중'},rules.DISCOVERY_SCENES[0]);});
 await p.screenshot({path:out+`/question-${width}-${language}.png`});await p.locator('.discovery-choices button').first().click();assert(await p.evaluate(()=>rules.discoveryScore(c,'socialStyle')<before));assert.equal(await p.locator('.character-discovery-dialog').count(),0);
 await p.evaluate(()=>{window.before=rules.discoveryScore(c,'socialStyle');discovery.showDiscovery(c,{title:'대화 중'},rules.DISCOVERY_SCENES[0]);});await p.locator('.character-discovery-dialog>button').click();assert(await p.evaluate(()=>rules.discoveryScore(c,'socialStyle')===before));
 assert.deepEqual(errors,[]);console.log('PASS cumulative choice/skip, manual lock/unlock, menu descriptions',width,language);await p.close();
}}finally{await browser.close();server.close()}
