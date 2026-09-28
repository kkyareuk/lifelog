import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-bath510');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root))throw Error();let body=await readFile(path==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(path==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const wk=process.argv.includes('--webkit'),browser=await(wk?webkit.launch():chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:393,height:798},serviceWorkers:'block'}),errors=[];
 page.on('console',m=>{if(m.type()==='error')console.log('ERROR',m.text().slice(0,1000))});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await page.clock.install({time:new Date('2026-09-28T16:30:00+09:00')});await page.addInitScript(()=>{const show=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=function(){if(this.classList.contains('page-guide'))return;return show.call(this)}});await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const id=g.createCharacter(20);g.state.characters[id].name='테스터';window.hid=g.state.characters[id].homeId;document.documentElement.classList.add('native-app');g.state.uiLanguage='ko';localStorage.setItem('drawer-village-home-tour-v3','done');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.getByRole('button',{name:'탭하여 서랍 열기'}).click();
 await page.evaluate(()=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.actor=g.state.activeId;const c=g.state.characters[actor];c.icon='/icons/icon-192.png';
  window.second=g.createCharacter(20);const b=g.state.characters[second];b.name='함께 목욕';b.icon='/icons/icon-192.png';b.homeId=hid;b.residences=[{homeId:hid,isPrimary:true,stayPattern:'상시 거주',role:'주거지'}];g.state.activeId=actor;
  g.state.relationships.test={id:'test',a:actor,b:second,type:'부부'};
  g.addFurniturePlacement(hid,'bath','욕조');window.tub=g.state.homes[hid].rooms.bath.furniturePlacements[0];g.updateFurniturePlacement(hid,'bath',tub.id,{x:55,y:55});
  for(const id of [actor,second]){if(!g.directCharacterActivity(id,'wash',{lifeTask:'bath',contextTarget:{type:'furniture',homeId:hid,room:'bath',id:tub.id}}))throw Error('bath rejected');}
  g.addFurniturePlacement(hid,'study','책상');g.addFurniturePlacement(hid,'study','컴퓨터');const p=g.state.homes[hid].rooms.study.furniturePlacements;window.desk=p.find(p=>p.item==='책상');window.computer=p.find(p=>p.item==='컴퓨터');g.updateFurniturePlacement(hid,'study',desk.id,{x:50,y:42});g.updateFurniturePlacement(hid,'study',computer.id,{surfaceId:desk.id,surfaceU:.5,surfaceV:.5,scale:.6});
  DrawerVillageNavigation.go('home');qaRender();
 });
 await page.clock.fastForward(20000);await page.evaluate(()=>qaRender());await page.clock.fastForward(10000);await page.evaluate(()=>qaRender());await page.waitForTimeout(1000);
 await page.waitForFunction(()=>document.querySelectorAll('.is-bathing').length===2);
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-bath-layer] img')].every(i=>i.complete&&i.naturalWidth));
 const geometry=await page.evaluate(()=>{
  const room=document.querySelector('.is-bathing').closest('.room'),t=room.querySelector('[data-furniture-kind="bathtub"] .furniture-sprite').getBoundingClientRect();
  const people=[...room.querySelectorAll('.is-bathing')].map(p=>({cls:p.className,style:p.style.cssText,rect:p.querySelector('.avatar,.sprite').getBoundingClientRect().toJSON(),z:+p.style.zIndex}));
  const parts=[room.querySelector('[data-furniture-kind="bathtub"]'),room.querySelector('[data-bath-layer="water-back"]'),room.querySelector('.is-bathing'),room.querySelector('[data-bath-layer="water-front"]'),room.querySelector('[data-bath-layer="frame"]')].map(e=>+e.style.zIndex);
  const label=room.querySelector('.room-activity-labels'),d=document.querySelector('[data-furniture-kind="desk"] .furniture-sprite').getBoundingClientRect(),pc=document.querySelector(`[data-furniture-placement="${computer.id}"] .room-furniture-art`).getBoundingClientRect();
  return {t:t.toJSON(),people,parts,labelZ:+label.style.zIndex,desk:d.toJSON(),pc:pc.toJSON()};
 });

 assert(geometry.parts.every((v,i)=>!i||v>geometry.parts[i-1]));assert(geometry.labelZ>Math.max(...geometry.parts));
 for(const p of geometry.people){assert(p.rect.width<geometry.t.width*.4);assert(p.rect.bottom>geometry.t.top+geometry.t.height*.4&&p.rect.bottom<geometry.t.bottom);}
 assert(geometry.pc.bottom>geometry.desk.top&&geometry.pc.bottom<geometry.desk.bottom);
 assert.equal(await page.locator('.room:has(.is-bathing) .room-activity-labels small').first().textContent(),'함께 목욕하는 중');
 await page.screenshot({path:out+'/'+(wk?'webkit':'chrome')+'-paired-bath.png',fullPage:true});
 // Changing activity must remove the bath layers and restore normal character size.
 await page.evaluate(()=>{for(const id of [actor,second])g.directCharacterActivity(id,'rest');qaRender()});await page.clock.fastForward(20000);await page.evaluate(()=>qaRender());
 assert.equal(await page.locator('[data-bath-layer]').count(),0);assert.equal(await page.locator('.is-bathing').count(),0);

 await page.evaluate(()=>{for(let i=0;i<9;i++)g.addFurniturePlacement(hid,'living','책장');g.addFurniturePlacement(hid,'living','TV');const tv=g.state.homes[hid].rooms.living.furniturePlacements.find(p=>p.item==='TV');g.directCharacterActivity(actor,'relax',{lifeTask:'video',contextTarget:{type:'furniture',homeId:hid,room:'living',id:tv.id}});qaRender()});
 await page.clock.fastForward(20000);await page.evaluate(()=>qaRender());await page.waitForTimeout(200);
 const depth=await page.evaluate(()=>({roaming:+document.querySelector('.home-life-roaming-layer').style.zIndex,furniture:Math.max(...[...document.querySelectorAll('[data-furniture-placement]')].map(e=>+e.style.zIndex))}));assert(depth.roaming>depth.furniture,'directed interaction captions remain above TV in crowded rooms');
 assert.deepEqual(errors,[]);console.log('PASS actual home: two bath users, small avatars, visible water, layer/label order, desktop computer, bath exit cleanup');
}finally{await browser.close();server.closeAllConnections();server.close()}
