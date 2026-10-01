import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 await mkdir('tmp/qa-reported-life',{recursive:true});
 const p=await browser.newPage({viewport:{width:393,height:852},serviceWorkers:'block'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,9,1,10));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{
  window.g=await import('/state.js?v=20260909dev305');window.sim=await import('/simulation.js?v=20260909dev305');
  document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');
  window.cid=g.createCharacter();window.c=g.state.characters[cid];c.createdAt=Date.now()-86400000;c.workplaceId='home';c.workRoomId='atelier';
  const home=g.state.homes[c.homeId];home.rooms.atelier={...structuredClone(home.rooms.study),name:'작업방',type:'study'};
  g.state.economy={...(g.state.economy||{}),revision:1,careers:[{id:'custom-script',name:'수도사',payDay:25,ranks:[{id:'r',name:'수도원장',salaryMeals:10,duties:[{name:'필사 중',description:'직접 정한 업무를 하고 있어요.'}]}]}]};
  const {assignEmployment}=await import('/salary.js'),{ensureWallet,moneyEntry}=await import('/character-money.js');ensureWallet(c);assignEmployment(g.state,c,'custom-script','r',Date.now(),moneyEntry);c.wallet.employments[0].id='e';c.careerSchedules={e:{days:[0,1,2,3,4,5,6],start:'09:00',end:'18:00'}};c.days={};
  g.state.routines[cid]=[];g.state.activeId=cid;g.state.activeHomeId=c.homeId;
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('observe');photoQA.render();
 });
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));
 const career=await p.evaluate(()=>{const rows=sim.timeline(c,new Date()),scene=sim.eventFor(c,new Date());return {duties:rows.filter(r=>r.title==='필사 중').length,title:scene.title,room:scene.room,home:scene.home}});
 assert(career.duties>0,JSON.stringify(career));assert.equal(career.title,'필사 중');assert.equal(career.home,true);assert.equal(career.room,'atelier');
 const direct=await p.evaluate(()=>{const ok=g.directCharacterActivity(cid,'work',{now:Date.now()});return {ok,to:g.state.characterDirectives[cid]?.journey?.to,place:g.state.characterDirectives[cid]?.placeId}});
 assert(direct.ok,JSON.stringify(direct));assert(direct.to.home);assert.equal(direct.to.room,'atelier');assert(!direct.place);
 await p.evaluate(()=>{delete g.state.characterDirectives[cid]});
 const arrival=await p.evaluate(()=>{
  const day=Object.values(c.days).at(-1),prior={minute:597,time:'09:57',title:'귀가 중',desc:'귀가',transit:true,returningHome:true,routineId:'old',routineEndMinute:597,townId:c.townId};
  c.careerSchedules.e.days=[];g.touchCharacterTimelines([cid]);sim.timeline(c,new Date());
  const current=Object.values(c.days).at(-1);current.entries=[prior];
  const scene=sim.eventFor(c,new Date());return {home:scene.home,title:scene.title,transit:scene.transit,minute:scene.minute,entries:current.entries.map(e=>({minute:e.minute,title:e.title}))};
 });assert(arrival.home&&!arrival.transit,JSON.stringify(arrival));assert(arrival.entries.some(e=>e.title==='귀가 중'),'history preserved');
 await p.evaluate(async()=>{const {openWorkSchedule}=await import('/career-work-ui.js');window.scheduleDialog=openWorkSchedule(g.state,c,null,()=>{});});
 await p.getByLabel('근무할 건물',{exact:true}).selectOption('home');await p.getByLabel('근무할 방',{exact:true}).selectOption('atelier');
 await p.getByRole('button',{name:'저장',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('dialog.career-dialog[open]'));
 assert.equal(await p.evaluate(()=>c.workRoomId),'atelier');
 // Shared-profile persistence must include the same location fields; failed saves roll back.
 const shared=await p.evaluate(async()=>{
  const {openWorkSchedule}=await import('/career-work-ui.js'),oldApi=window.DrawerVillageGroups,oldAuth=window.ParallelCityAuth;
  const snap={activeGroupId:'qa-shared',residents:[{id:cid,ownerUid:'qa-owner',profileJson:JSON.stringify(c)}]},calls=[];
  window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa-owner'}})};window.DrawerVillageGroups={getSnapshot:()=>snap,saveResident:async value=>{calls.push(value)}};
  let d=openWorkSchedule(g.state,c,snap);d.querySelector('[aria-label="근무할 방"]').value='study';[...d.querySelectorAll('button')].find(b=>b.textContent==='저장').click();
  await new Promise(r=>setTimeout(r,50));const saved=calls[0]?.profile.workRoomId;
  window.DrawerVillageGroups.saveResident=async()=>{throw Error('offline')};d=openWorkSchedule(g.state,c,snap);d.querySelector('[aria-label="근무할 방"]').value='atelier';[...d.querySelectorAll('button')].find(b=>b.textContent==='저장').click();
  await new Promise(r=>setTimeout(r,50));const failed={room:c.workRoomId,retryEnabled:!d.querySelector('select').disabled,status:d.querySelector('[role="status"]').textContent};d.close();
  window.DrawerVillageGroups=oldApi;window.ParallelCityAuth=oldAuth;return {saved,failed};
 });assert.equal(shared.saved,'study');assert.equal(shared.failed.room,'study');assert(shared.failed.retryEnabled);assert.match(shared.failed.status,/저장하지 못/);

 for(const lang of ['en','ja']){
  await p.evaluate(async lang=>{g.state.uiLanguage=lang;const {openWorkSchedule}=await import('/career-work-ui.js');window.scheduleDialog=openWorkSchedule(g.state,c,null,()=>{})},lang);
  assert(await p.getByLabel(lang==='en'?'Work room':'勤務する部屋',{exact:true}).isVisible());
  await p.evaluate(()=>scheduleDialog.close());
 }
 await p.evaluate(()=>{g.state.uiLanguage='ko';DrawerVillageNavigation.go('home');photoQA.render();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await p.screenshot({path:'tmp/qa-reported-life/home-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 // A real transformed DOM verifies that the minimum applies after canvas scaling.
 const size=await p.evaluate(async()=>{
  const {positionBedOccupants}=await import('/bed-occupant-layout.js');
  const root=document.createElement('div');root.className='room';root.style.cssText='position:fixed;left:0;top:0;width:400px;height:400px;transform:scale(.4);transform-origin:0 0';document.body.append(root);
  root.innerHTML='<div data-furniture-placement="bed" data-bed-single="true" style="position:absolute;left:50px;top:40px;width:80px;height:120px;transform:translate(0,0);--furniture-scale:1"><img class="couple-bed-base" src="/assets/furniture/wood/single-bed-front.png" style="width:100%;height:100%"></div><div class="is-using-couple-bed" data-couple-bed-id="bed" data-bed-slot="0" data-room-icon-minimum="32" style="position:absolute;left:var(--life-x);top:var(--life-y)"><span class="home-person-visual" style="display:block;width:var(--bed-face-size);height:var(--bed-face-size);background:red"></span></div>';
  await root.querySelector('img').decode();positionBedOccupants(root);const size=root.querySelector('.home-person-visual').getBoundingClientRect().width;root.remove();return size;
 });assert(size>=31.9,'minimum after .4 scale: '+size);
 assert.deepEqual(errors,[]);console.log('PASS real app custom daily log, manual home work, selected room save, EN/JA selectors, old return recovery with preserved history, scaled bed DOM',JSON.stringify({career,direct,arrival,size}));
}finally{await browser.close();server.closeAllConnections();server.close()}
