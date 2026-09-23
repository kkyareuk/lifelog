import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,8,23,11,0));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));


 await p.evaluate(async()=>{window.interior=await import('/building-interior.js');const c=g.state.characters[g.state.activeId];c.name='직원 테스트';c.createdAt=new Date(2026,8,22,8).toISOString();c.timelineResetAt=new Date(2026,8,22,8).getTime();c.job='회사원';c.workplaceId='office480';c.wallet={...(c.wallet||{}),employments:[{id:'employment480',jobId:'builtin-office',jobName:'회사원',rankId:'rank-1'}]};c.careerSchedules={employment480:{days:[0,1,2,3,4,5,6],start:'09:00',end:'18:00'}};g.state.world.places.push({id:'office480',name:'서랍 주식회사',type:'사무실',interiorImage:'test-photo.png'});g.state.towns.find(t=>t.id===g.state.activeTownId).places=g.state.world.places;interior.openBuildingInterior('office480',{bindRoomGeometry:()=>{}})});
 await p.clock.setFixedTime(new Date(2026,8,23,11,2));
 await p.evaluate(()=>document.querySelector('.building-interior-dialog').close());await p.waitForFunction(()=>!document.querySelector('.building-interior-dialog'));
 await p.evaluate(()=>interior.openBuildingInterior('office480',{bindRoomGeometry:()=>{}}));
 assert.equal(await p.locator('.building-interior-dialog .room').count(),4);
 assert.equal(await p.locator('.building-interior-dialog [data-home-person]').count(),1);
 assert(await p.getByRole('button',{name:'건물 편집',exact:true}).isVisible());
 assert((await p.locator('.building-interior-heading').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('wood-top'));
 assert((await p.locator('.building-interior-back').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('back.png'));
 assert.equal(await p.locator('.building-interior-heading').evaluate(e=>getComputedStyle(e).paddingLeft),'76px');
 assert.equal(await p.locator('.building-interior-side span').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 245, 221)');
 await p.screenshot({path:'tmp/office480.png'});
 await p.getByRole('button',{name:'직원',exact:true}).click();assert(await p.locator('.building-staff-grid').innerText().then(x=>x.includes('직원 테스트')));
 await p.locator('.building-panel-close').click();await p.getByRole('button',{name:'방 정보',exact:true}).click();await p.getByRole('button',{name:'사무 공간',exact:true}).click();
 assert.equal(await p.locator('input[name="usePhoto"]').count(),0);assert.equal(await p.getByRole('button',{name:'방 사진 고르기',exact:true}).count(),0);
 await p.getByRole('button',{name:'닫기',exact:true}).last().click();
 await p.getByRole('button',{name:'마을로 돌아가기',exact:true}).click();
 const pan=await p.evaluate(async()=>{const root=document.createElement('div');root.innerHTML='<div class="town-map-scroll" data-home-pan="test480" style="position:fixed;left:0;top:0;width:360px;height:500px"><div class="world" style="width:720px;height:1000px"><button>tap</button></div></div>';document.body.append(root);const v=root.firstChild,button=v.querySelector('button');let clicks=0;button.onclick=()=>clicks++;const mod=await import('/scene-zoom.js');mod.bindSceneZoom(root);const r=v.getBoundingClientRect();const dispatch=(type,x,y)=>button.dispatchEvent(new PointerEvent(type,{pointerId:3,pointerType:'touch',clientX:r.left+x,clientY:r.top+y,bubbles:true,cancelable:true}));dispatch('pointerdown',250,250);dispatch('pointermove',170,190);await new Promise(requestAnimationFrame);dispatch('pointerup',170,190);button.click();const m=new DOMMatrix(getComputedStyle(v.firstChild).transform);dispatch('pointerdown',150,150);dispatch('pointerup',150,150);button.click();root.remove();return {x:m.e,y:m.f,clicks}});assert.equal(pan.x,-80);assert.equal(pan.y,-60);assert.equal(pan.clicks,1);
 // Synthetic pointer stream verifies anchoring at both sides and after a native scroll attempt.
 const zoom=await p.evaluate(async()=>{const root=document.createElement('div');root.innerHTML='<div class="town-map-scroll" style="position:fixed;left:0;top:0;width:360px;height:500px"><div class="world" style="width:360px;height:500px"></div></div>';document.body.append(root);const v=root.firstChild;const mod=await import('/scene-zoom.js');mod.bindSceneZoom(root);const r=v.getBoundingClientRect();const dispatch=(type,id,x)=>v.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:r.left+x,clientY:r.top+250,bubbles:true,cancelable:true}));dispatch('pointerdown',1,250);dispatch('pointerdown',2,310);dispatch('pointermove',1,220);dispatch('pointermove',2,340);await new Promise(requestAnimationFrame);const m=new DOMMatrix(getComputedStyle(v.firstChild).transform),anchor=(280-m.e)/m.a;dispatch('pointerup',1,220);dispatch('pointerup',2,340);root.remove();return {scale:m.a,anchor}});
 assert.equal(zoom.scale,2);assert(Math.abs(zoom.anchor-280)<1);
 const logs=await p.evaluate(async()=>{const sim=await import('/simulation.js?v=20260909dev305'),c=g.state.characters[g.state.activeId];c.days={};const entries=sim.timeline(c).filter(e=>e.officeTaskId);return {count:entries.length,titles:new Set(entries.map(e=>e.title)).size,arrive:entries.some(e=>e.officeTaskId==='arrival'),closing:entries.some(e=>e.officeTaskId==='closing')}});assert(logs.count>=12);assert(logs.titles>=12);assert(logs.arrive&&logs.closing);
 assert.deepEqual(errors,[]);console.log('PASS480: office staff and duties, wood UI, photos disabled, one-finger pan, tap and pinch');
}finally{await browser.close();server.closeAllConnections();server.close()}
