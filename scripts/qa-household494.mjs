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



 await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId];c.sleep='00:00';c.wake='23:59';c.lifeNeeds={hunger:80,sleep:80,updatedAt:Date.now()};c.cooking={dishes:[{id:'dish',recipeId:'kimchi_jjigae',homeId:c.homeId,room:'kitchen',storage:'fridge',createdAt:Date.now(),updatedAt:Date.now(),remaining:64800000}],inventory:{}};window.food=await import('/prepared-food.js');window.sim=await import('/simulation.js?v=20260909dev305');window.DrawerVillageNavigation.go('home');window.photoQA.render();});
 await p.locator('.home-tour nav button').click().catch(()=>{});
 const job=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];food.actOnFood(g.state,c.id,'dish','discard',{},Date.now());window.photoQA.render();return c.household.active});
 assert(job.journey.from.homeId);assert(job.journey.from.room);assert.equal(job.journey.to.room,'kitchen');
 await p.locator('.meeting-walker:not(.is-stationary)').first().waitFor({state:'visible'});
 const walker=p.locator('.meeting-walker:not(.is-stationary)').first();
 await walker.evaluate(e=>e.style.animationPlayState='paused');
 await p.waitForFunction(()=>document.querySelector('.meeting-walker[data-collision-bypass="true"]'));
 const frozen=await walker.boundingBox();await p.waitForTimeout(250);const resumed=await walker.boundingBox();
 assert(Math.hypot(frozen.x-resumed.x,frozen.y-resumed.y)>1,'stalled walk resumes without teleport');
 await p.screenshot({path:'tmp/household494-depart-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 await p.clock.setFixedTime(new Date(job.startedAt));
 let scene=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];const s=sim.eventFor(c);window.photoQA.render();return s});
 assert.equal(scene.title,'음식을 치우는 중');assert.equal(scene.room,'kitchen');assert(!scene.meetingJourney);
 await p.clock.setFixedTime(new Date(job.endsAt));
 scene=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];const s=sim.eventFor(c);window.photoQA.render();return s});
 assert.equal(scene.meetingJourney.fromRoom,'kitchen');assert.equal(scene.meetingJourney.toRoom,'bedroom');assert.equal(scene.sleeping,false);
 await p.locator('.meeting-walker:not(.is-stationary)').first().waitFor({state:'visible'});
 await p.screenshot({path:'tmp/household494-return-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 // The needs panel updates in place instead of waiting for a full screen render.
 await p.evaluate(async()=>{const {occupantPanel}=await import('/occupant-panel.js');const c=g.state.characters[g.state.activeId];c.lifeNeeds={hygiene:0,updatedAt:Date.now(),recovering:['hygiene'],recoveryEndsAt:Date.now()+60000};document.body.append(occupantPanel({world:g.state,character:c,actor:c,canSelect:false}));});
 const meter=p.locator('[data-need-key="hygiene"] meter');const startValue=await meter.evaluate(e=>e.value);
 await p.clock.setFixedTime(new Date(job.endsAt+15000));await p.waitForTimeout(600);
 assert(await meter.evaluate(e=>e.value)>startValue,'hygiene rises while panel remains open');
 assert.deepEqual(errors,[]);console.log('PASS actual sleeping character walk out, cleanup text and animated return in rendered house');
}finally{await browser.close();server.closeAllConnections();server.close()}
