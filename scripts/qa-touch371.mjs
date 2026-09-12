import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(process.env.QA_STAGED==='1'&&['/app.js','/shared-home-editor.js','/app.css'].includes(pathname))body=execFileSync('git',['show',':'+pathname.slice(1)]);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);document.documentElement.classList.add('native-app','native-platform');window.DrawerVillageNavigation.go('character')});await page.waitForTimeout(600);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.evaluate(()=>{const homeId=g.active().homeId;g.state.activeHomeId=homeId;window.DrawerVillageNavigation.go('home');g.state.homeEditMode=true;const keys=Object.keys(g.state.homes[homeId].rooms);window.dragKeys=keys.slice(0,2);window.dragId=g.addFurniturePlacement(homeId,keys[0],'의자');window.qaRender();});await page.waitForTimeout(400);
 await page.evaluate(()=>document.querySelectorAll("dialog[open]").forEach(d=>d.close())); const keys=await page.evaluate(()=>dragKeys),id=await page.evaluate(()=>dragId);const item=page.locator(`[data-furniture-placement="${id}"]`);const source=await item.locator('.room-furniture-art').boundingBox();const dest=await page.locator(`.room[data-room-key="${keys[1]}"] .room-furniture-layer`).boundingBox();assert(source&&dest);await page.screenshot({path:resolve(out,"before-drag369.png")});
 const cdp=await page.context().newCDPSession(page);const start={x:source.x+source.width/2,y:source.y+source.height/2},end={x:dest.x+dest.width*.5,y:dest.y+dest.height*.6};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
 for(let i=1;i<=20;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/20,y:start.y+(end.y-start.y)*i/20}]});await page.waitForTimeout(16);const ghost=await page.locator('.furniture-drag-preview .room-furniture-art').boundingBox();assert(ghost,'drag preview missing');assert(Math.abs(ghost.width-source.width)<1,`preview width changed: ${source.width} -> ${ghost.width}`);assert(Math.abs(ghost.height-source.height)<1,`preview height changed: ${source.height} -> ${ghost.height}`)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);

 const moved=await page.evaluate(()=>g.state.homes[g.active().homeId].rooms[dragKeys[1]].furniturePlacements.some(p=>p.id===dragId));console.log('PERSONAL TOUCH DRAG + PREVIEW SIZE STABILITY',moved);assert(moved);await page.screenshot({path:resolve(out,'drag369.png')});
 await page.evaluate(async()=>{
 const h=structuredClone(g.state.homes[g.active().homeId]);window.sharedWrites=[];
 window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa-owner'}})};
 const snap={activeGroupId:'qa-group',group:{id:'qa-group',ownerUid:'qa-owner',towns:[{id:h.townId,name:'QA'}]},homes:[{id:h.id,ownerUid:'qa-owner',townId:h.townId,layoutRevision:1,layoutJson:JSON.stringify(h)}],residents:[],members:[]};
 window.DrawerVillageGroups={getSnapshot:()=>snap,saveHomeLayout:async value=>{sharedWrites.push(value);return {revision:value.revision+1}}};
 const old=document.querySelector('.home'),clone=old.cloneNode(true);old.replaceWith(clone);
 const {sharedSelection}=await import('/shared-world.js?v=20260909dev305');sharedSelection(snap).homeEditMode=true;
 const {bindSharedHome}=await import('/shared-home-editor.js?v=20260909dev305');bindSharedHome(clone,snap,()=>{},()=>{},null);
 });
 const sharedSource=await item.locator('.room-furniture-art').boundingBox(),sharedDest=await page.locator(`.room[data-room-key="${keys[0]}"] .room-furniture-layer`).boundingBox();
 const start2={x:sharedSource.x+sharedSource.width/2,y:sharedSource.y+sharedSource.height/2},end2={x:sharedDest.x+sharedDest.width*.5,y:sharedDest.y+sharedDest.height*.5};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start2]});
 for(let i=1;i<=20;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start2.x+(end2.x-start2.x)*i/20,y:start2.y+(end2.y-start2.y)*i/20}]});await page.waitForTimeout(16);const ghost=await page.locator('.furniture-drag-preview .room-furniture-art').boundingBox();assert(ghost,'shared drag preview missing');assert(Math.abs(ghost.width-sharedSource.width)<1,'shared preview width changed');assert(Math.abs(ghost.height-sharedSource.height)<1,'shared preview height changed')}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);
 assert(await page.evaluate(()=>sharedWrites.some(w=>w.layout.rooms[dragKeys[0]].furniturePlacements.some(p=>p.id===dragId))));console.log('SHARED TOUCH DRAG + PREVIEW SIZE STABILITY PASS');
 await page.evaluate(async()=>{const fixture=document.createElement('div');fixture.id='depth-fixture';fixture.innerHTML='<div class="room"><div class="room-furniture-item" data-furniture-placement="test-bed" style="position:fixed;top:300px;height:100px;width:100px"></div><div class="home-person" data-couple-bed-id="test-bed" style="position:fixed;top:100px;height:40px;width:40px"></div><div class="room-couple-bed-overlay" data-bed-overlay="test-bed" style="position:fixed;top:50px;height:40px;width:40px"></div></div>';document.body.append(fixture);const depth=await import('/scene-depth.js');depth.bindSceneDepth(fixture);});
 await page.waitForTimeout(100);const z=await page.evaluate(()=>[...document.querySelector('#depth-fixture .room').children].map(el=>Number(el.style.zIndex)));assert(z[0]<z[1]&&z[1]<z[2]);console.log('BED DEPTH PASS',z);
 await page.evaluate(()=>{document.querySelector('#depth-fixture .room').innerHTML='<div class="room-furniture-item" data-furniture-kind="table" style="position:fixed;top:300px;height:100px;width:100px"></div><div class="home-person" style="position:fixed;top:200px;height:40px;width:40px"><span class="home-person-visual"><span class="avatar" style="height:40px">A</span></span></div><div class="room-pets"><div class="room-pet" style="position:fixed;top:420px"><span class="room-pet-emoji">🐱</span></div></div>';});
 await page.evaluate(async()=>{(await import('/scene-depth.js')).scheduleSceneDepth()});await page.waitForTimeout(100);
 const depth=await page.evaluate(()=>{const r=document.querySelector('#depth-fixture');return ['.room-furniture-item','.home-person','.room-pet'].map(s=>Number(r.querySelector(s).style.zIndex))});assert(depth[1]<depth[0]&&depth[0]<depth[2]);console.log('PERSON / TABLE / PET DEPTH PASS');


}finally{await browser.close();server.close()}
