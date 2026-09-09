import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-direct307');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();const body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const viewport of [{width:360,height:840},{width:1180,height:820}]){
 const p=await browser.newPage({viewport,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);let wallets=0;
 await p.route('**/*',r=>{const u=r.request().url();if(u.includes('diamondWalletApi'))wallets++;return u.startsWith(origin)?r.continue():r.abort()});
 await p.clock.setFixedTime(new Date('2026-09-13T23:59:59+09:00'));await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
 await p.evaluate(async()=>{const game=await import('/state.js?v=20260909dev305');game.createCharacter(10);document.querySelectorAll('dialog[open]').forEach(d=>d.close());localStorage.setItem('drawer-village-guide-shop','1');localStorage.setItem('drawer-village-guide-observe','1');window.DrawerVillageNavigation.go('shop')});
 const oldCard=p.locator('.drawer-shop-product').filter({has:p.locator('[data-play-purchase="character_slots_5"]')});await oldCard.waitFor();assert.match(await oldCard.textContent(),/1,200/);assert.equal(await p.locator('[data-play-purchase="character_slot_1"]').count(),0);
 await p.clock.setFixedTime(new Date('2026-09-14T00:00:00+09:00'));await p.evaluate(()=>window.ParallelCity.mediaChanged());
 for(const lang of ['ko','en','ja']){
 await p.evaluate(async lang=>{const game=await import('/state.js?v=20260909dev305');game.state.uiLanguage=lang;window.ParallelCity.mediaChanged()},lang);
 const card=p.locator('.drawer-shop-product').filter({has:p.locator('[data-play-purchase="character_slot_1"]')});await card.waitFor();assert.match(await card.textContent(),/1,000/);assert.equal(await p.locator('[data-diamond-shop],[data-play-purchase="diamonds_100"]').count(),0);assert.equal(await p.locator('[data-play-purchase="character_slots_5"]').count(),0);
 const title=await card.locator('div>b').textContent();assert.equal(title,({ko:'캐릭터 1명 추가',en:'Add 1 character slot',ja:'キャラクター枠を1人追加'})[lang]);await p.screenshot({path:out+`/shop-${lang}-${viewport.width}.png`});
 }
 await p.evaluate(()=>window.DrawerVillageNavigation.go('observe'));assert.equal(await p.locator('.game-hud-currencies,[data-home-diamonds]').count(),0);assert.equal(await p.locator('.game-hud-side-right img').first().evaluate(el=>Math.round(el.getBoundingClientRect().width)),28);assert.equal(wallets,0);assert.deepEqual(errors,[]);console.log('PASS direct 1-slot/1000 shop, KO/EN/JA, no currency requests and compact menu',viewport);await p.close();
}}finally{await browser.close();server.close()}


