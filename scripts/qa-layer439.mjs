import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback433');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const id=g.createCharacter();window.c=g.state.characters[id];c.name='Bed test';c.icon='assets/shop/drawer-shop-nerine.png';c.ageGroup='성인';window.home=g.state.homes[c.homeId];const base=Object.values(home.rooms).find(r=>r.type==='bedroom');home.rooms={foreign:{...base,name:'Other room',furniturePlacements:[{id:'other-bed',item:'1인 침대',x:50,y:50}]},own:{...base,name:'Own room',furniturePlacements:[{id:'my-bed',item:'1인 침대',x:50,y:45}]}};c.sleepRoomId='own';for(const r of c.residences||[])if(r.homeId===home.id)r.sleepRoomId='own';g.state.activeId=id;g.state.activeHomeId=home.id;g.state.activeTownId=c.townId;document.documentElement.classList.add('native-app');g.directCharacterActivity(id,'nap',{lifeTask:'sleep',now:Date.now()-120000});window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});


 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

 const snapshots=[];
 for(const pos of [[25,25],[75,70]]){
  await page.evaluate(([x,y])=>{home.rooms.own.furniturePlacements[0].x=x;home.rooms.own.furniturePlacements[0].y=y;qaRender()},pos);
  await page.locator('[data-furniture-placement="my-bed"] .couple-bed-base').evaluate(i=>i.decode());
  await page.waitForTimeout(180);
  const r=await page.evaluate(()=>{const b=document.querySelector('[data-furniture-placement="my-bed"] .couple-bed-base').getBoundingClientRect(),p=document.querySelector('[data-couple-bed-id="my-bed"] .home-person-visual').getBoundingClientRect();return {x:p.x+p.width/2,y:p.y+p.height/2,bed:{x:b.x,y:b.y,r:b.right,b:b.bottom}}});
  assert(r.x>=r.bed.x&&r.x<=r.bed.r&&r.y>=r.bed.y&&r.y<=r.bed.b,JSON.stringify(r));snapshots.push(r);
 }
 assert(snapshots[1].x>snapshots[0].x+50);assert(snapshots[1].y>snapshots[0].y+50);
 const nested=await page.evaluate(async()=>{const room=document.querySelector('[data-furniture-placement="my-bed"]').closest('.room'),layer=room.querySelector('.room-furniture-layer'),wrapper=document.createElement('div');wrapper.style.cssText='position:absolute;inset:0;transform:translate(-55px,-30px) scale(.8);transform-origin:0 0';layer.before(wrapper);wrapper.append(layer);const {positionBedOccupants}=await import('/bed-occupant-layout.js');positionBedOccupants(room);const b=room.querySelector('.couple-bed-base').getBoundingClientRect(),p=room.querySelector('.home-person-visual').getBoundingClientRect();return {x:p.x+p.width/2,y:p.y+p.height/2,bed:{x:b.x,y:b.y,r:b.right,b:b.bottom}}});assert(nested.x>=nested.bed.x&&nested.x<=nested.bed.r&&nested.y>=nested.bed.y&&nested.y<=nested.bed.b,JSON.stringify(nested));

 await page.evaluate(()=>{g.setHomeEditMode(true);home.rooms.own.furniturePlacements=[{id:'support',item:'카운터',x:50,y:65,scale:1,counterSpan:2},{id:'prop',item:'화분 2',x:50,y:30,scale:1,surfaceId:'support',surfaceU:.5,surfaceV:.5}];qaRender()});
 for(const item of ['카운터','협탁','식탁']){
  await page.evaluate(item=>{home.rooms.own.furniturePlacements[0].item=item;qaRender()},item);
  await page.waitForTimeout(180);
  const result=await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.room-furniture-art img')].map(i=>i.decode().catch(()=>{})));const {scheduleSceneDepth}=await import('/scene-depth.js?v=20260909dev305');scheduleSceneDepth();await new Promise(requestAnimationFrame);const p=document.querySelector('[data-furniture-placement="prop"]'),b=document.querySelector('[data-furniture-placement="support"]');return {prop:+p.style.zIndex,base:+b.style.zIndex,grid:!!b.querySelector('.furniture-surface-grid')}});
  assert(result.prop>result.base,JSON.stringify({item,...result}));assert(result.grid);
 }
 // Mafia uses the same furniture HTML in a separate scene with its own lifecycle.
 const mafia=await page.evaluate(async()=>{const {roomFurnitureMarkup}=await import('/views.js?v=20260909dev305'),{bindFurnitureSceneDepth}=await import('/furniture-depth.js');const root=document.createElement('div');root.className='mafia-playback';root.style.cssText='position:fixed;inset:0;z-index:99999';root.innerHTML='<div class="mp-world mp-house"><section class="mp-room" style="left:0;top:0;width:320px;height:400px"><b>Room</b>'+roomFurnitureMarkup('h','own',home.rooms.own,false)+'</section></div>';document.body.append(root);await Promise.all([...root.querySelectorAll('img')].map(i=>i.decode()));const cleanup=bindFurnitureSceneDepth(root);await new Promise(requestAnimationFrame);const z=id=>+root.querySelector('[data-furniture-placement="'+id+'"]').style.zIndex;const result={p:z('prop'),b:z('support')};cleanup();root.remove();return result});assert(mafia.p>mafia.b,JSON.stringify(mafia));
 await page.screenshot({path:'tmp/layers439-'+(useWebKit?'webkit':'chrome')+'.png'});
 console.log('PASS439 moved sleeping character tracks bed in X/Y; counter/nightstand/table props remain above support after scene sorting; Mafia attachment depth');
}finally{await browser.close();server.closeAllConnections();server.close()}
