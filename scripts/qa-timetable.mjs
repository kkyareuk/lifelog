import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(process.argv.includes('--safe-top')&&extname(f)==='.css')b=Buffer.from(b.toString().replace(/env\(safe-area-inset-top(?:,[^)]*)?\)/g,'47px'));if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
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

 if(process.argv.includes('--safe-top')){await p.evaluate(()=>{document.documentElement.classList.add('native-platform');photoQA.render()});const safe=await p.evaluate(()=>{const top=document.querySelector('.game-hud-top'),r=top.getBoundingClientRect();return {top:r.top,background:r.top+parseFloat(getComputedStyle(top,'::before').top),body:parseFloat(getComputedStyle(document.body).paddingTop)}});assert(safe.top>=47,JSON.stringify(safe));assert.equal(safe.body,0);assert(Math.abs(safe.background)<1,JSON.stringify(safe));console.log('PASS mocked 47px safe area: full-bleed background with protected HUD',safe)}
 await p.evaluate(()=>{
 c.name='라파엘';c.wake='07:00';c.sleep='23:00';c.lunchStart='12:00';c.lunchEnd='13:00';
 c.careerSchedules.e.days=[1,2,3,4,5];
 const second=g.createCharacter();window.other=g.state.characters[second];other.name='베노';
 g.state.routines[other.id]=[{id:'together',day:4,start:'15:00',end:'17:00',type:'친구 약속',title:'함께 그림 그리기',withIds:[cid]}];
 g.state.routines[cid]=[{id:'personal',day:6,start:'10:00',end:'12:00',type:'취미',title:'정원 꾸미기',withIds:[]}];
 g.state.activeId=cid;g.state.tab='routine';window.DrawerVillageNavigation.go('routine');photoQA.render();
 });
 await p.waitForSelector('.timetable-event');
 await p.getByRole('button',{name:'안내 그만 보기',exact:true}).click().catch(()=>{});
 assert(await p.locator('.tt-shared[data-timetable-detail]').count()>0);
 const counts=await p.evaluate(()=>({sleep:document.querySelectorAll('.timetable-event.tt-sleep').length,work:document.querySelectorAll('.timetable-event.tt-work').length,lunch:document.querySelectorAll('.timetable-event.tt-meal').length,width:document.querySelector('.timetable-scroll').scrollWidth,client:document.querySelector('.timetable-scroll').clientWidth}));
 assert(counts.sleep>=7);assert(counts.work>=10);assert(counts.lunch===7);assert(counts.width<=counts.client+1,JSON.stringify(counts));
 await p.locator('[data-life-times]').click();await p.locator('input[name=lunchStart]').fill('12:30');await p.locator('input[name=lunchEnd]').fill('13:30');await p.locator('dialog form').evaluate(f=>f.requestSubmit());await p.waitForFunction(()=>c.lunchStart==='12:30');
 const lunch=await p.evaluate(()=>sim.eventFor(c,new Date(2026,9,1,12,40)));assert(lunch.plannedLunch,JSON.stringify(lunch));assert.equal(lunch.actionKind,'eating');
 await p.getByRole('button',{name:'안내 그만 보기',exact:true}).click({timeout:500}).catch(()=>{});
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.querySelector('.timetable-scroll').scrollTop=8*96});
 await p.evaluate(()=>{document.querySelector('#mini-toast')?.remove();document.querySelector('.timetable-scroll').scrollLeft=0});
 await p.screenshot({path:'tmp/qa-reported-life/timetable-mobile.png'});
 await p.setViewportSize({width:1000,height:1600});await p.evaluate(()=>photoQA.render());await p.waitForTimeout(200);await p.evaluate(()=>{document.querySelector('.timetable-scroll').style.maxHeight='none';document.querySelector('.timetable-scroll').style.flexShrink='0';document.querySelector('.routine-shell').style.height='auto';document.querySelector('.timetable-scroll').scrollTop=0});
 await p.locator('.timetable').screenshot({path:'tmp/qa-reported-life/timetable-week.png'});
 await p.evaluate(()=>{g.state.activeId=other.id;photoQA.render()});assert(await p.locator('[data-edit-routine="together"]').count()>0);
 const priority=await p.evaluate(()=>{g.state.activeId=cid;g.state.routines[cid].push({id:'manual-priority',day:4,start:'08:00',end:'14:00',type:'취미',title:'직접 추가한 긴 일정과 점심보다 먼저 시작한 약속',withIds:[]});g.touchCharacterTimelines([cid]);return sim.eventFor(c,new Date(2026,9,1,12,40)).routineId});assert.equal(priority,'manual-priority');
 await p.setViewportSize({width:393,height:852});
 await p.evaluate(()=>{g.state.routines[cid].push({id:'overlap-second',day:4,start:'10:00',end:'13:00',type:'친구 약속',title:'베노와 함께 수도원 정원에서 그림 그리기',withIds:[other.id]},{id:'overlap-third',day:4,start:'11:00',end:'12:00',type:'취미',title:'세 번째 일정도 아래 전체 목록에 남아요',withIds:[]});photoQA.render();document.querySelector('.timetable-scroll').scrollLeft=0;document.querySelector('.timetable-scroll').scrollTop=8*96});
 const visible=await p.locator('[data-timetable-day="4"] .timetable-event').evaluateAll(es=>es.filter(e=>{const top=parseFloat(e.style.top)*14.4,end=top+parseFloat(e.style.height)*14.4;return top<720&&end>660}).map(e=>({width:e.style.width,title:e.querySelector('strong').textContent,ellipsis:getComputedStyle(e.querySelector('strong')).textOverflow})));
 assert.equal(visible.length,2);assert(visible.every(e=>e.width==='50%'&&e.ellipsis!=='ellipsis'));
 assert.equal(await p.locator('.timetable-agenda [data-edit-routine="overlap-third"]').count(),1);
 await p.evaluate(()=>document.querySelector('#mini-toast')?.remove());
 for(const width of [320,360,393,430]){await p.setViewportSize({width,height:852});const fit=await p.evaluate(()=>{const sc=document.querySelector('.timetable-scroll'),r=sc.getBoundingClientRect(),heads=[...document.querySelectorAll('.timetable-day-head')].map(e=>e.getBoundingClientRect());return sc.scrollWidth<=sc.clientWidth+1&&heads.length===7&&heads.every(h=>h.left>=r.left&&h.right<=r.right)});assert(fit,'all seven days fit '+width)}
 await p.setViewportSize({width:393,height:852});
 await p.waitForTimeout(200);await p.evaluate(()=>{document.querySelector('.timetable-scroll').scrollTop=9*96;document.querySelector('#mini-toast')?.remove()});
 await p.screenshot({path:'tmp/qa-reported-life/timetable-overlap-mobile.png'});
 await p.locator('.timetable-agenda details[open]').screenshot({path:'tmp/qa-reported-life/timetable-full-details.png'});
 const size=await p.evaluate(async()=>{const {sizeRoomOccupants}=await import('/room-occupant-size.js');const room=document.createElement('div');room.style.cssText='position:fixed;top:0;left:0;transform:scale(.3);transform-origin:top left';room.innerHTML='<div class="home-person" data-room-icon-minimum="32"><span class="home-person-visual"><span class="avatar" style="display:block;width:40px;height:40px"></span></span></div>';document.body.append(room);sizeRoomOccupants(room);const width=room.querySelector('.avatar').getBoundingClientRect().width;room.remove();return width});assert(size>=31.9,String(size));
 for(const [language,label] of [['en','Set daily times'],['ja','生活時間の設定']]){await p.evaluate(language=>{g.state.uiLanguage=language;photoQA.render()},language);assert.equal(await p.locator('[data-life-times]').textContent(),label)}
 assert(!errors.length,errors.join('\n'));console.log('PASS timetable, shared participant, lunch persistence and real scene, unscaled room actor floor',counts,size);
}finally{await browser.close();server.close()}
