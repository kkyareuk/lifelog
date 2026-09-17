import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback433');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/qa-empty'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><body></body>');return;}const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter(),b=g.createCharacter();window.qaIds=[a,b];g.state.characters[a].name='A';g.state.characters[b].name='B';g.setActive(a);document.documentElement.classList.add('native-app');window.DrawerVillageNavigation.go('observe');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await page.waitForTimeout(700);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));


 await page.evaluate(()=>{window.DRAWER_VILLAGE_NATIVE=true;document.documentElement.classList.add('native-platform');g.state.activeHomeId=g.state.characters[qaIds[0]].homeId;window.DrawerVillageNavigation.go('home');qaRender()});
 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const bounds=await page.evaluate(()=>{const pan=document.querySelector('.home-canvas-viewport'),c=document.querySelector('[data-room-canvas]');return {pan:pan.getBoundingClientRect().toJSON(),canvas:c.getBoundingClientRect().toJSON(),scroll:pan.scrollWidth,client:pan.clientWidth}});
 console.log(bounds);assert(Math.abs(bounds.canvas.width-bounds.pan.width*2)<2);assert(Math.abs(bounds.canvas.height-bounds.pan.height)<2);assert(bounds.scroll>bounds.client);
 await page.screenshot({path:out+'/house444.png'});
 await page.evaluate(()=>{const p=document.querySelector('.home-canvas-viewport');p.scrollLeft=150;p.scrollTop=0});await page.waitForTimeout(50);await page.evaluate(()=>qaRender());await page.waitForTimeout(100);
 assert(await page.evaluate(()=>document.querySelector('.home-canvas-viewport').scrollLeft>100),'pan restored');
 const resize=await page.evaluate(async()=>{const {resizeCanvas}=await import('/home-canvas.js');const h={rooms:{r:{layout:{x:0,y:0,w:50,h:50},furniturePlacements:[{id:'vase',x:30,y:40}]}}};const next=resizeCanvas(h,24,32,{});return {next,shrunk:resizeCanvas(next,12,16,{})}});assert.equal(resize.next.rooms.r.layout.w,25);assert.equal(resize.shrunk.rooms.r.layout.w,50);

 const shared=await page.evaluate(async()=>{const {bindSharedHome}=await import('/shared-home-editor.js');const snap={activeGroupId:'qa444',group:{id:'qa444',ownerUid:'qa',towns:[{id:'t'}]},homes:[{id:'shared',ownerUid:'qa',layoutRevision:0,layoutJson:JSON.stringify({rooms:{r:{name:'Room',type:'living',floor:1,layout:{x:0,y:0,w:50,h:50},furniturePlacements:[{id:'keep',item:'화분',x:40,y:30}]}}})}],residents:[],members:[]};let saved;window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa'}})};window.DrawerVillageGroups={getSnapshot:()=>snap,saveHomeLayout:async value=>{saved=value;return {revision:1}}};const root=document.createElement('div');root.innerHTML='<input data-home-canvas-axis="columns" value="24">';document.body.append(root);bindSharedHome(root,snap,()=>{},()=>{});await root.querySelector('input').onchange();await new Promise(r=>setTimeout(r,50));root.remove();return saved});
 assert.equal(shared.layout.canvasColumns,24);assert.equal(shared.layout.rooms.r.layout.w,25);assert.equal(shared.layout.rooms.r.furniturePlacements[0].id,'keep');
 await page.evaluate(()=>{window.DrawerVillageNavigation.go('shop');qaRender()});await page.waitForTimeout(100);assert.equal(await page.locator('.web-account-status').count(),0,'shop omits login status');
  // Exercise the same touch-layer selection used by both personal and shared homes.
 await page.goto(origin+'/qa-empty');
 await page.evaluate(async()=>{document.body.innerHTML='<div class="home is-editing" id="test"><div data-room-canvas style="width:400px;height:400px"><div class="room" data-room-key="r" style="width:400px;height:400px"><div class="room-furniture-layer" style="position:relative;width:400px;height:400px"><button data-furniture-placement="counter" data-home-id="h" data-room-key="r" style="position:absolute;left:100px;top:100px;width:180px;height:150px;z-index:1">Counter</button><button data-furniture-placement="vase" data-home-id="h" data-room-key="r" style="position:absolute;left:130px;top:105px;width:70px;height:90px;z-index:2">Vase</button></div></div></div></div>';window.moves=[];window.selected=[];const home={rooms:{r:{furniturePlacements:[{id:'counter',item:'카운터',x:40,y:40},{id:'vase',item:'화분',x:40,y:30,surfaceId:'counter'}]}}};const {bindFurnitureDrag}=await import('/furniture-drag.js');bindFurnitureDrag(document.querySelector('#test'),{getHome:()=>home,select:el=>selected.push(el.dataset.furniturePlacement),move:(el,p)=>moves.push(el.dataset.furniturePlacement)})});
 const point=await page.locator('[data-furniture-placement="vase"]').boundingBox();const x=point.x+point.width/2,y=point.y+point.height/2;
 await page.mouse.click(x,y);await page.mouse.click(x,y);assert.equal(await page.evaluate(()=>selected.at(-1)),'counter','tap cycles to support');
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+30,y+15,{steps:4});await page.mouse.up();assert.deepEqual(await page.evaluate(()=>moves),['vase'],'drag does not cycle down to support');
 await page.evaluate(async()=>{
  document.body.innerHTML='<div id="bed" style="position:relative;width:180px;height:300px"><img class="couple-bed-base" src="/assets/furniture/couple-bed/couple-bed-base.png" style="width:180px;height:300px;object-fit:contain"></div>';
  await document.querySelector('img').decode();const {fitFurnitureSelection}=await import('/home-editor-ui.js');fitFurnitureSelection(document.querySelector('#bed'));
 });
 assert(await page.evaluate(()=>parseFloat(document.querySelector('#bed').style.getPropertyValue('--selection-inset-y'))>40),'bed outline excludes contain letterbox');
 await page.addStyleTag({url:origin+'/app.css'});await page.addStyleTag({url:origin+'/groups.css'});await page.addStyleTag({url:origin+'/multiplayer-directory.css'});
 await page.evaluate(async()=>{window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa'}})};window.DrawerVillageGroups={getSnapshot:()=>({groups:[],loading:false})};const {renderGroups}=await import('/groups.js');document.documentElement.dataset.colorMode='light';document.documentElement.dataset.activeTab='groups';document.body.innerHTML='<div id="app"><main>'+renderGroups()+'</main></div>'});
 assert.equal(await page.locator('.directory-slot-help').evaluate(el=>getComputedStyle(el).color),'rgb(255, 245, 223)');
 await page.screenshot({path:out+'/groups444.png'});
  console.log('PASS444 house canvas dimensions, preserved layout, restored scroll, tap cycling and independent attached-object drag');
}finally{await browser.close();server.close()}
