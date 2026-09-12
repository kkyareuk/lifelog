import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);document.documentElement.classList.add('native-app','native-platform');window.DrawerVillageNavigation.go('character')});await page.waitForTimeout(600);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.evaluate(()=>{const homeId=g.active().homeId;g.state.activeHomeId=homeId;window.DrawerVillageNavigation.go('home');g.state.homeEditMode=true;const keys=Object.keys(g.state.homes[homeId].rooms);window.dragKeys=keys.slice(0,2);window.dragId=g.addFurniturePlacement(homeId,keys[0],'의자');window.qaRender();});await page.waitForTimeout(400);
 await page.evaluate(()=>document.querySelectorAll("dialog[open]").forEach(d=>d.close())); const keys=await page.evaluate(()=>dragKeys),id=await page.evaluate(()=>dragId);const item=page.locator(`[data-furniture-placement="${id}"]`);const source=await item.boundingBox();const dest=await page.locator(`.room[data-room-key="${keys[1]}"] .room-furniture-layer`).boundingBox();assert(source&&dest);await page.screenshot({path:resolve(out,"before-drag369.png")});
 await page.mouse.move(source.x+source.width/2,source.y+source.height/2);await page.mouse.down();await page.mouse.move(dest.x+dest.width*.5,dest.y+dest.height*.6,{steps:20});await page.mouse.up();await page.waitForTimeout(300);
 const moved=await page.evaluate(()=>g.state.homes[g.active().homeId].rooms[dragKeys[1]].furniturePlacements.some(p=>p.id===dragId));console.log('DRAG RESULT',moved);assert(moved);await page.screenshot({path:resolve(out,'drag369.png')});
 await page.evaluate(async()=>{const fixture=document.createElement('div');fixture.id='depth-fixture';fixture.innerHTML='<div class="room"><div class="room-furniture-item" data-furniture-placement="test-bed" style="position:fixed;top:300px;height:100px;width:100px"></div><div class="home-person" data-couple-bed-id="test-bed" style="position:fixed;top:100px;height:40px;width:40px"></div><div class="room-couple-bed-overlay" data-bed-overlay="test-bed" style="position:fixed;top:50px;height:40px;width:40px"></div></div>';document.body.append(fixture);const depth=await import('/scene-depth.js');depth.bindSceneDepth(fixture);});
 await page.waitForTimeout(100);const z=await page.evaluate(()=>[...document.querySelector('#depth-fixture .room').children].map(el=>Number(el.style.zIndex)));assert(z[0]<z[1]&&z[1]<z[2]);console.log('BED DEPTH PASS',z);

}finally{await browser.close();server.close()}




