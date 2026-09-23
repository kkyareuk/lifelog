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
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));

 await p.evaluate(async()=>{window.interior=await import('/building-interior.js');g.state.world.places.push({id:'hospital479',name:'병원',type:'병원'});g.state.towns.find(t=>t.id===g.state.activeTownId).places=g.state.world.places;interior.openBuildingInterior('hospital479',{bindRoomGeometry:()=>{}})});
 assert.equal(await p.locator('.building-interior-dialog .room').count(),4);
 assert(await p.locator('.building-interior-dialog [data-furniture-placement]').count()>=12);
 await p.screenshot({path:'tmp/hospital479.png'}); await p.getByRole('button',{name:'‹ 마을',exact:true}).click();
 await p.evaluate(async()=>{g.state.world.places.push({id:'cafe479',name:'카페',type:'카페'});g.state.towns.find(t=>t.id===g.state.activeTownId).places=g.state.world.places;interior.openBuildingInterior('cafe479',{bindRoomGeometry:()=>{}})});
 assert.equal(await p.locator('.building-interior-dialog .room').count(),4);await p.screenshot({path:'tmp/cafe479.png'});
 await p.getByRole('button',{name:'이곳에서 할 일',exact:true}).click();
 assert.equal(await p.getByRole('button',{name:'요리하기',exact:true}).count(),0);
 await p.getByRole('button',{name:'다른 행동',exact:true}).last().click();
 assert(await p.getByRole('button',{name:'커피 주문하기',exact:true}).isVisible());assert(await p.getByRole('button',{name:'차 주문하기',exact:true}).isVisible());
 await p.locator('.context-action-menu > button').first().click();
 // Synthetic pointer stream verifies anchoring at both sides and after a native scroll attempt.
 const zoom=await p.evaluate(async()=>{const root=document.createElement('div');root.innerHTML='<div class="town-map-scroll" style="position:fixed;left:0;top:0;width:360px;height:500px"><div class="world" style="width:360px;height:500px"></div></div>';document.body.append(root);const v=root.firstChild;const mod=await import('/scene-zoom.js');mod.bindSceneZoom(root);const r=v.getBoundingClientRect();const dispatch=(type,id,x)=>v.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:r.left+x,clientY:r.top+250,bubbles:true,cancelable:true}));dispatch('pointerdown',1,250);dispatch('pointerdown',2,310);dispatch('pointermove',1,220);dispatch('pointermove',2,340);await new Promise(requestAnimationFrame);const m=new DOMMatrix(getComputedStyle(v.firstChild).transform),anchor=(280-m.e)/m.a;dispatch('pointerup',1,220);dispatch('pointerup',2,340);root.remove();return {scale:m.a,anchor}});
 assert.equal(zoom.scale,2);assert(Math.abs(zoom.anchor-280)<1);
 console.log('PASS479: furnished interiors, cafe menu, right-side pinch focal point');
}finally{await browser.close();server.closeAllConnections();server.close()}
