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




 await p.clock.setFixedTime(new Date(2026,8,23,14,0));
 await p.evaluate(async()=>{window.sim=await import('/simulation.js?v=20260909dev305');window.need=await import('/life-needs.js');const c=g.state.characters[g.state.activeId];c.job='무직';c.wake='07:00';c.sleep='23:00';c.createdAt=Date.now()-86400000;c.timelineResetAt=c.createdAt;sim.timeline(c,new Date());c.days['2026-9-23'].entries=[{minute:840,title:'책을 읽는 중',desc:'책을 읽고 있어요.',home:true,room:'study',holdMinutes:50}];c.lifeNeeds={hunger:0,sleep:90,toilet:90,hygiene:90,social:90,updatedAt:Date.now()};window.photoQA.render()});
 for(const [seconds,expected] of [[0,0],[15,50],[30,100]]){
  await p.clock.setFixedTime(new Date(2026,8,23,14,0,seconds));
  const result=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId],scene=sim.eventFor(c,new Date());window.photoQA.render();return {hunger:need.needsAt(c).hunger,cooking:!!c.cooking?.active,title:scene.title}});
  assert(Math.abs(result.hunger-expected)<1,JSON.stringify(result));assert(!result.cooking);
 }
 assert.deepEqual(errors,[]);console.log('PASS browser: hunger 0/50/100 at 0/15/30 seconds; no cooking interruption or render errors');
}finally{await browser.close();server.closeAllConnections();server.close()}
