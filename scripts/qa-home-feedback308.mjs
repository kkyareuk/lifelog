import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-feedback308');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();const body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const viewport of [{width:360,height:880},{width:1180,height:820}]){
 const p=await browser.newPage({viewport,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
 await p.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');const id=g.createCharacter(10),other=g.createCharacter(10),old=g.state.characters[id].homeId,shared=g.createHome({open:false});g.addCharacterResidence(id,shared);window.homeTest={id,other,old,shared};g.setActive(id);g.setActiveHome(old);document.querySelectorAll('dialog[open]').forEach(d=>d.close());localStorage.setItem('drawer-village-guide-home','1');window.DrawerVillageNavigation.go('home')});
 await p.locator('[data-open-home-feature="members"]').click();const remove=p.locator('[data-home-remove-resident]');await remove.waitFor();assert.equal(await remove.count(),1);assert.ok((await remove.boundingBox()).height>=44);
 await p.screenshot({path:out+`/members-${viewport.width}.png`});p.once('dialog',d=>d.dismiss());await remove.click();assert.equal(await remove.count(),1);
 p.once('dialog',d=>d.accept());await remove.click();await p.waitForFunction(()=>!document.querySelector('[data-home-remove-resident]'));
 assert(await p.evaluate(async()=>{const {state}=await import('/state.js?v=20260909dev305');return state.characters[homeTest.id].homeId===homeTest.shared&&!!state.characters[homeTest.other]&&!!state.homes[homeTest.old]}));
 await p.locator('[data-home-feature="members"] [data-close-home-feature]').click();await p.locator('[data-open-home-feature="house-info"]').click();const del=p.locator('[data-home-feature="house-info"] [data-delete-home]');await del.scrollIntoViewIfNeeded();await p.screenshot({path:out+`/home-info-${viewport.width}.png`});
 p.once('dialog',d=>d.accept());await del.click();assert(await p.evaluate(async()=>{const {state}=await import('/state.js?v=20260909dev305');return !state.homes[homeTest.old]&&state.deletedHomeIds.includes(homeTest.old)&&!!state.characters[homeTest.id]&&!!state.homes[homeTest.shared]}));assert.deepEqual(errors,[]);console.log('PASS visible member unlink, cancel/confirm, other home preserved and delete from home info',viewport);await p.close();
}}finally{await browser.close();server.close()}
