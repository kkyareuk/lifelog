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


 await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];c.name='리바이';c.createdAt=new Date(2026,8,22,8).toISOString();c.timelineResetAt=new Date(2026,8,22,8).getTime();const t=g.state.towns.find(t=>t.id===g.state.activeTownId);t.places.push({id:'hall483',name:'공연장 테스트',type:'공연장'});g.state.world.places=t.places;window.DrawerVillageNavigation.go('town');window.photoQA.openPlaceInterior('hall483')});
 assert.equal(await p.locator('.building-interior-dialog .room').count(),3);
 assert.deepEqual(await p.locator('.building-interior-dialog .room-heading').allTextContents(),['홀','대기실','화장실']);
 await p.getByRole('button',{name:'UI 숨김',exact:true}).click();assert(await p.locator('.building-interior-heading').isVisible());assert(await p.getByRole('button',{name:'마을로 돌아가기',exact:true}).isVisible());
 const styles=await p.locator('.home-native-ui-toggle>span').evaluate(e=>({color:getComputedStyle(e).webkitTextFillColor,background:getComputedStyle(e).backgroundImage,root:getComputedStyle(e.closest('.home-page')).backgroundColor}));assert.equal(styles.color,'rgb(255, 245, 221)');assert(styles.background.includes('pill-middle'));assert.equal(styles.root,'rgb(91, 64, 49)');
 await p.getByRole('button',{name:'UI 보기',exact:true}).click();
 await p.getByRole('button',{name:'직원',exact:true}).click();await p.locator('.building-interior-panel .home-member-add').click();await p.locator('.building-interior-panel [data-member-id]').click();await p.waitForFunction(()=>g.state.characters[g.state.activeId].workplaceId==='hall483');assert.equal(await p.locator('.building-interior-panel .home-resident-entry').count(),1);
 await p.waitForFunction(()=>getComputedStyle(document.querySelector('.building-interior-panel .home-design-page')).backgroundImage.includes('building-info-wood'));
 const pageStyle=await p.locator('.building-interior-panel .home-design-page').evaluate(e=>getComputedStyle(e).backgroundImage);assert(pageStyle.includes('building-info-wood'));
 await p.screenshot({path:'tmp/staff483'+(process.argv.includes('--webkit')?'-webkit':'')+'.png'});
 await p.locator('.building-interior-panel [data-close-home-feature]').click();await p.getByRole('button',{name:'건물 편집',exact:true}).click();await p.locator('[data-building-browser-back]').click();await p.waitForSelector('.building-interior-dialog[open]');
 const toilet=p.locator('.building-interior-dialog .room[data-room-key="area3"] [data-furniture-placement]').first();await toilet.click({force:true});await p.getByRole('button',{name:'다른 행동',exact:true}).click();
 // Close this menu and issue a room clean directive through the same domain command.
 await p.evaluate(()=>document.querySelector('.context-action-menu')?.close());
 const timing=await p.evaluate(()=>{const id=g.state.activeId,now=Date.now();const ok=g.directCharacterActivity(id,'chores',{lifeTask:'clean',contextTarget:{type:'room',homeId:'place-interior:'+g.state.activeTownId+':hall483',placeId:'hall483',room:'area3'},now});if(!ok)throw Error('clean rejected');return g.state.characterDirectives[id].journey?.arrivesAt||now});
 await p.clock.setFixedTime(timing+1000);await p.evaluate(()=>{document.querySelector('.building-interior-dialog').close();window.photoQA.openPlaceInterior('hall483')});

 assert(await p.locator('.building-interior-dialog .room[data-room-key="area3"] [data-character-id]').count()>0,'Cleaner visible in selected restroom');
 const piano=p.locator('.building-interior-dialog [data-furniture-placement="area0-f0"]');await piano.click({force:true});await p.getByRole('button',{name:'피아노 연주하기',exact:true}).click();await p.waitForFunction(()=>g.state.characterDirectives[g.state.activeId]?.lifeTask==='play_piano');
 await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];delete g.state.characterDirectives[c.id];delete g.state.dailyPlans?.[c.id];c.job='아이돌';c.wallet={...c.wallet,employments:[{id:'idol483',jobId:'builtin-idol',rankId:'rank-1'}]};c.timelineResetAt=Date.now()-3600000;document.querySelector('.building-interior-dialog').close();window.photoQA.openPlaceInterior('hall483')});
 await p.clock.setFixedTime(timing+61000);await p.evaluate(()=>{document.querySelector('.building-interior-dialog').close();window.photoQA.openPlaceInterior('hall483')});
 const performance=await p.evaluate(async()=>(await import('/views.js?v=20260909dev305')).currentSceneFor(g.state.characters[g.state.activeId]));assert.equal(performance.placeId,'hall483');assert.equal(performance.officeRole,'builtin-idol');assert(await p.locator('.building-interior-dialog .room[data-room-key="area0"] [data-character-id]').count()>0);
 await p.evaluate(()=>{document.querySelector('.building-interior-dialog').close();window.DrawerVillageNavigation.go('home')});await p.locator('[data-home-ui-toggle]').click();assert(await p.locator('.home-native-back').isVisible());assert(await p.locator('.home-native-house-name').isVisible());const house=await p.locator('[data-home-ui-toggle]>span').evaluate(e=>({fill:getComputedStyle(e).webkitTextFillColor,bg:getComputedStyle(e).backgroundImage}));assert.equal(house.fill,'rgb(255, 245, 221)');assert(house.bg.includes('pill-middle'));
 await p.screenshot({path:'tmp/hidden483'+(process.argv.includes('--webkit')?'-webkit':'')+'.png'});
 assert.deepEqual(errors,[]);console.log('PASS483: hall rooms, UI hide keeps header/back and color, matching staff design, hire, edit-return route, restroom cleaner, piano command');
}finally{await browser.close();server.closeAllConnections();server.close()}
