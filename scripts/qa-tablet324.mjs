import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-tablet324');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const language of ['ko','en','ja'])for(const [width,height] of [[1765,1102],[1180,820],[384,832]]){
 const p=await browser.newPage({viewport:{width,height}}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.addInitScript(()=>localStorage.setItem('drawer-village-guide-character','1'));await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
 await p.evaluate(async lang=>{window.game=await import('/state.js?v=20260909dev305');game.createCharacter();game.state.uiLanguage=lang;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('character')},language);
 await p.locator('[data-open-quick-character-settings]:visible').first().click();await p.locator('.character-book-lock-slot button').waitFor();const master=p.locator('.character-book-lock-slot button');await master.click();assert.equal(await master.getAttribute('aria-pressed'),'true');await master.click();assert.equal(await master.getAttribute('aria-pressed'),'false');
 assert.equal(await p.locator('.character-book-v9-menu>nav>button').count(),2);
 if(width>720){const box=await p.locator('.character-book-v8-canvas').boundingBox();assert(box.width>width*.9);assert.equal(await p.locator('[data-spread-page]').count(),2);assert(await p.locator('[data-character-spread-step="1"]').isDisabled());const fields=await p.locator('.character-overview-basic>.overview-field').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));for(let i=0;i<fields.length;i++)for(let j=i+1;j<fields.length;j++){const a=fields[i],b=fields[j];assert(!(a.x<b.x+b.w-1&&a.x+a.w>b.x+1&&a.y<b.y+b.h-1&&a.y+a.h>b.y+1),'overview fields overlap');}const last=p.locator('.character-overview-basic .overview-alcohol select');await last.scrollIntoViewIfNeeded();assert(await last.isVisible());await p.locator('.character-profile-overview-page').evaluate(e=>e.scrollTop=0);}
 await p.screenshot({path:out+`/profile-${width}-${language}.png`});
 if(width<721){await p.locator('.character-book-v9-menu>summary').click();await p.locator('[data-character-pane=profile]:visible').first().click();assert.equal(await p.locator('[data-character-overview-pane=life]').count(),0);}
 await p.locator('[data-close-full-character-settings]').click();await p.locator('[data-open-full-character-settings]:visible').first().click();assert.equal(await p.locator('.character-book-v9-menu>nav>button').count(),7);
 await p.locator('.character-book-v9-menu>summary').click();await p.locator('[data-character-pane=personality]').first().click();
 await p.screenshot({path:out+`/personality-${width}-${language}.png`});
 assert(await p.locator('[data-discovery-lock]').count()>1);assert.deepEqual(errors,[]);console.log('PASS two-page profile, full book, global lock, large canvas',width,language);await p.close();
}}finally{await browser.close();server.close()}

