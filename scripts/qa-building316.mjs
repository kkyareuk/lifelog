import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-building316');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const viewport of [{width:384,height:832},{width:1180,height:820}]){
const p=await browser.newPage({viewport,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity);
await p.evaluate(async()=>{window.game=await import('/state.js?v=20260909dev305');const id=game.createCharacter();window.hid=game.state.characters[id].homeId;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home')});
await p.locator('[data-home-building-shape]').first().evaluate(el=>el.click());await p.locator('.building-shape-dialog[open]').waitFor();assert.equal(await p.locator('[data-building-shape="drawer-building"]').count(),0);await p.screenshot({path:out+`/picker-${viewport.width}.png`});
await p.locator('.building-photo-choice input').setInputFiles(resolve('world-assets/building-types/generic-building-handdrawn.png'));
await p.waitForFunction(()=>!document.querySelector('.building-shape-dialog'));assert(await p.evaluate(()=>!!game.state.homes[hid].exteriorImage));assert.deepEqual(errors,[]);console.log('PASS custom exterior upload and retired building choice',viewport);await p.close();
}}finally{await browser.close();server.close()}
