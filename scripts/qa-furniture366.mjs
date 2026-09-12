import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();const body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:384,height:854}}),errors=[];page.on('pageerror',e=>(errors.push(e.message),console.log('PAGE',e.message)));
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const fixture=await page.evaluate(async()=>{
  window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);const home=Object.values(g.state.homes)[0],key=Object.keys(home.rooms)[0];
  home.rooms[key].furniturePlacements=[];
  const items=['침대','소파','의자','책상'].map((item,i)=>{const p=g.addFurniturePlacement(home.id,key,item);g.updateFurniturePlacement(home.id,key,p,{x:20+(i%2)*50,y:30+Math.floor(i/2)*40,rotation:item==='의자'?180:0});return p});
  g.setActiveHome(home.id);g.setHomeEditMode(true);window.DrawerVillageNavigation.go('home');return {home:home.id,key,items};
 });
 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.waitForFunction(()=>document.querySelectorAll('.furniture-sprite').length>=4);
 await page.locator('.furniture-sprite').first().scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 const images=await page.locator('.furniture-sprite').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));
 assert(images.every(i=>i.ok),JSON.stringify(images));assert(await page.locator('.chair-frame-overlay').count());
 const rotation=await page.evaluate(async()=>{const {furnitureSprite}=await import('/furniture-sprites.js?v=20260909dev305');return [0,90,180,270].map(rotation=>furnitureSprite({item:'소파',rotation}).src)});
 assert.deepEqual(rotation.map(x=>x.split('/').pop()),['sofa-front.png','sofa-side.png','sofa-back.png','sofa-side.png']);
 const overlap=await page.evaluate(async()=>{
  const chair=document.querySelector('[data-furniture-kind="chair"]'),table=document.querySelector('[data-furniture-kind="table"]'),frame=document.querySelector('.chair-frame-overlay');
  for(const el of [chair,table,frame]){el.style.setProperty('--furniture-x','50%');el.style.setProperty('--furniture-y',el===table?'71%':'70%')}
  (await import('/scene-depth.js?v=20260909dev305')).scheduleSceneDepth();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return {frame:+frame.style.zIndex,table:+table.style.zIndex};
 });assert(overlap.frame>overlap.table,JSON.stringify(overlap));
 await page.screenshot({path:resolve(out,'mobile.png'),fullPage:true});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const measurements=await page.evaluate(async()=>{const samples=[];for(const tab of ['observe','home','town','home','observe']){const t=performance.now();window.DrawerVillageNavigation.go(tab);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));samples.push({tab,ms:Math.round(performance.now()-t)});}return samples});
 assert.equal(errors.length,0,errors.join('\n'));
 await page.evaluate(()=>g.save(true));await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const restored=await page.evaluate(async f=>{const m=await import('/state.js?v=20260909dev305');return m.state.homes[f.home].rooms[f.key].furniturePlacements.filter(p=>f.items.includes(p.id)).map(p=>p.rotation)},fixture);
 assert.deepEqual(restored,[0,0,-180,0]);
 console.log(JSON.stringify({images,rotation,overlap,restartPreserved:true,measurements,errors}));
}finally{await browser.close();server.close()}


