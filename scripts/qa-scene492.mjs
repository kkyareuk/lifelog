import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,8,23,11,0));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));

 await p.evaluate(()=>{const original=window.ParallelCityAuth.getInfo;window.ParallelCityAuth.getInfo=()=>({...original(),entitlements:{dlcPacks:['neo_cacheport']}});g.state.world.backgroundSetting='neo_cacheport';g.state.world.backgroundMusic='drawer';g.state.activeHomeId=g.state.characters[g.state.activeId].homeId;const home=g.state.homes[g.state.activeHomeId];home.rooms.kitchen.furniturePlacements=[{id:'counter',item:'카운터',x:50,y:40,scale:1,rotation:0,layer:0},{id:'pot',item:'커피포트',x:60,y:35,scale:1,rotation:0,layer:1,surfaceId:'counter',surfaceU:.7,surfaceV:.5}];window.DrawerVillageNavigation.go('home');window.photoQA.render()});
 await p.locator('.room-furniture-item').first().waitFor().catch(async e=>{console.log(await p.locator('body').innerText());throw e});
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const styles=await p.evaluate(()=>[...document.querySelectorAll('.room-furniture-item,.home-native-back,.home-native-house-name,.home-native-pill')].map(e=>({name:e.className,bg:getComputedStyle(e).backgroundColor})));for(const s of styles)assert(['rgba(0, 0, 0, 0)','transparent'].includes(s.bg),JSON.stringify(s));
 await p.locator('.home-tour nav button').click();
 for(const c of await p.locator(".home-person-status b").evaluateAll(es=>es.map(e=>getComputedStyle(e).color)))assert.equal(c,"rgb(47, 41, 36)");
 await p.screenshot({path:'tmp/scene492-home-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 const food=await p.evaluate(async()=>{const room=document.querySelector('.room-kitchen')||document.querySelector('.room'),b=document.createElement('button');b.className='prepared-food';b.innerHTML='<span>🍲</span>';room.append(b);return getComputedStyle(b).backgroundColor});assert.equal(food,'rgba(0, 0, 0, 0)');
 await p.evaluate(()=>window.DrawerVillageNavigation.go('town'));const mapStyles=await p.evaluate(()=>[...document.querySelectorAll('.map-art-button,.home-native-back,.town-native-title,.home-native-pill')].map(e=>({name:e.className,bg:getComputedStyle(e).backgroundColor})));for(const s of mapStyles)assert(['rgba(0, 0, 0, 0)','transparent'].includes(s.bg),JSON.stringify(s));
 await p.screenshot({path:'tmp/scene492-town-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 const collision=await p.evaluate(async()=>{
  const {positionStandingOccupants,findStandingSpace}=await import('/scene-collision.js');
  const fixture=document.createElement('div');fixture.className='room';fixture.style.cssText='position:fixed;inset:0 auto auto 0;width:340px;height:550px;z-index:99999;background:#76543e';document.body.append(fixture);
  fixture.innerHTML='<div class="room-furniture-item" data-furniture-placement="counter" style="position:absolute;left:40px;top:70px;width:260px;height:100px;transform:none"><span class="room-furniture-art" style="display:block;width:100%;height:100%;background:#754b34"></span></div>';
  for(let i=0;i<5;i++){const p=document.createElement('div');p.className=i<3?'home-person':'room-pet';p.dataset.characterId=i<3?'c'+i:'';p.dataset.petId=i>=3?'p'+i:'';p.dataset.occupantTitle='fixture';p.style.cssText='position:absolute;left:45%;top:25%;width:44px;height:44px;transform:none;display:block';p.innerHTML=i<3?'<span class="home-person-visual"><img class="avatar" src="/assets/home-ui/profile-ring.png" style="width:44px;height:44px;display:block;transform:none"></span>':'<span class="room-pet-emoji" style="width:44px;height:44px;display:block;animation:none">🐈</span>';fixture.append(p)}
  const rect=(s,e)=>e.getBoundingClientRect();positionStandingOccupants(fixture,rect,e=>e.getBoundingClientRect());
  const rects=[...fixture.querySelectorAll('.home-person .avatar,.room-pet-emoji')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}}),f=fixture.querySelector('[data-furniture-placement]').getBoundingClientRect();
  const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const errors=[];for(let i=0;i<rects.length;i++){if(overlap(rects[i],f)>1)errors.push('furniture '+i);for(let j=i+1;j<rects.length;j++)if(overlap(rects[i],rects[j])>1)errors.push('pair '+i+'/'+j)}
  const before=rects;positionStandingOccupants(fixture,rect,e=>e.getBoundingClientRect());const after=[...fixture.querySelectorAll('.home-person .avatar,.room-pet-emoji')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}});const {positionWorktopUsers}=await import('/worktop-users.js');
  const counter=fixture.querySelector('[data-furniture-placement]');counter.dataset.furnitureKind='counter';
  const user=fixture.querySelector('.home-person');user.dataset.usingFurniture='counter';positionWorktopUsers(fixture);
  const v=user.querySelector('.home-person-visual').getBoundingClientRect(),base=counter.getBoundingClientRect();
  if(v.bottom<base.bottom)errors.push('counter user hidden above worktop');
  const tiny={left:0,top:0,right:40,bottom:40,width:40,height:40},free={left:0,top:0,right:340,bottom:550};
  const available=findStandingSpace(tiny,free,[]);if(!Number.isFinite(available.left))errors.push('invalid free position');
  fixture.remove();return {errors,before,after};
 });assert.deepEqual(collision.errors,[]);for(let i=0;i<collision.before.length;i++){assert(Math.abs(collision.before[i].left-collision.after[i].left)<2);assert(Math.abs(collision.before[i].top-collision.after[i].top)<2)}console.log('PASS clear artwork buttons and food in Neo, five occupants avoid furniture and one another; stable second layout');
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();server.close()}



