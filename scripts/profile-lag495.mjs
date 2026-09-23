import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openHomeOccupantSheet,openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');if(p==='/scene-depth.js')b=Buffer.from(b.toString().replaceAll('\r\n','\n').replace('frame=0;if(!root?.isConnected)return;', 'frame=0;if(!root?.isConnected)return; const qaStart=performance.now();').replace('\n  });\n}', '\n (window.depthTimes??=[]).push(performance.now()-qaStart);\n  });\n}'));res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));



 await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId];c.sleep='00:00';c.wake='23:59';c.lifeNeeds={hunger:80,sleep:80,updatedAt:Date.now()};c.cooking={dishes:[{id:'dish',recipeId:'kimchi_jjigae',homeId:c.homeId,room:'kitchen',storage:'fridge',createdAt:Date.now(),updatedAt:Date.now(),remaining:64800000}],inventory:{}};window.food=await import('/prepared-food.js');window.sim=await import('/simulation.js?v=20260909dev305');window.DrawerVillageNavigation.go('home');window.photoQA.render();});
 await p.locator('.home-tour nav button').click().catch(()=>{});

 const session=await p.context().newCDPSession(p);await session.send('Emulation.setCPUThrottlingRate',{rate:4});
 await session.send('Profiler.enable');await session.send('Profiler.start');
 await p.evaluate(()=>{const first=g.state.characters[g.state.activeId],home=first.homeId;for(let i=0;i<3;i++){const id=g.createCharacter(10),c=g.state.characters[id];c.homeId=home;c.residences=[{homeId:home,role:'주거지',isPrimary:true}];c.lifeNeeds={hunger:80,sleep:80,updatedAt:Date.now()}}g.state.activeHomeId=home;g.state.activeId=first.id;window.DrawerVillageNavigation.go('home');window.photoQA.render()});
 await p.locator('.home-tour nav button').click().catch(()=>{});
 await p.waitForTimeout(3000);
 const renders=[];for(let i=0;i<6;i++){renders.push(await p.evaluate(()=>{const t=performance.now();window.photoQA.render();return performance.now()-t}));await p.waitForTimeout(300)}
 const timings=[];
 for(let i=0;i<5;i++){timings.push(await p.evaluate(async()=>{document.querySelector('.home-occupant-popover-close')?.click();const t=performance.now();const button=document.querySelector('[data-home-occupant][data-character-id]');if(!button)return {missing:true};window.photoQA.openHomeOccupantSheet(button);const handler=performance.now()-t;await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));return {handler,paint:performance.now()-t}}));await p.waitForTimeout(200)}
 const {profile}=await session.send('Profiler.stop');
 const scores=new Map();for(let i=0;i<profile.samples.length;i++){const id=profile.samples[i];scores.set(id,(scores.get(id)||0)+(profile.timeDeltas[i]||0))}
 const top=profile.nodes.map(n=>({name:n.callFrame.functionName,url:n.callFrame.url.split('/').pop(),line:n.callFrame.lineNumber,ms:(scores.get(n.id)||0)/1000})).sort((a,b)=>b.ms-a.ms).slice(0,30);
 assert.deepEqual(errors,[]);
 const result={renders,timings,top,depth:await p.evaluate(()=>({count:window.depthTimes?.length,times:window.depthTimes?.slice(-30)})),errors};console.log(JSON.stringify(result,null,2));
}finally{await browser.close();server.closeAllConnections();server.close()}
