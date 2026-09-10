import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-bedroom315');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const viewport of [{width:384,height:832},{width:1180,height:820}]){
const p=await browser.newPage({viewport,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity);
await p.evaluate(async()=>{window.game=await import('/state.js?v=20260909dev305');const id=game.createCharacter();window.cid=id;window.hid=game.state.characters[id].homeId;for(const tab of ['observe','home'])localStorage.setItem('drawer-village-guide-'+tab,'1');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('observe')});
const menu=p.locator('.game-hud-side-right');const box=await menu.boundingBox();assert(box.x>=0&&box.x+box.width<=viewport.width+1);if(viewport.width>1000){assert(box.width>150);assert.equal(await menu.locator('small:visible').count(),3)}else{assert.equal(await menu.locator('small:visible').count(),0)}await p.screenshot({path:out+`/menu-${viewport.width}.png`});
await p.evaluate(()=>window.DrawerVillageNavigation.go('home'));
// Use the real member page and its existing editor actions.
const member=p.locator('[data-member-edit="resident"]').first();
await p.evaluate(()=>{document.querySelector('[data-home-feature-open="members"]')?.click()});
// The editor source exists even before opening the member sheet.
await p.locator('[data-member-edit="resident"]').first().evaluate(el=>el.click());await p.locator('.home-member-editor[open]').waitFor();
const controls=p.locator('[data-residence-field="sleepElsewhere"]');assert(await controls.count()>0);
await controls.first().evaluate(el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))});
assert.equal(await p.evaluate(()=>game.state.characters[cid].residences.find(r=>r.homeId===hid).sleepElsewhere),true);
const frequency=p.locator('[data-residence-field="sleepElsewhereFrequency"]').first();await frequency.evaluate(el=>{el.value='often';el.dispatchEvent(new Event('change',{bubbles:true}))});assert.equal(await p.evaluate(()=>game.state.characters[cid].residences.find(r=>r.homeId===hid).sleepElsewhereFrequency),'often');
await p.screenshot({path:out+`/sleep-${viewport.width}.png`});assert.deepEqual(errors,[]);console.log('PASS sleep settings handlers and tablet/phone menu',viewport);await p.close();
}}finally{await browser.close();server.close()}
