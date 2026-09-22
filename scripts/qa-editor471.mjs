import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:880},serviceWorkers:'block'}),errors=[];p.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('dialog',async d=>{errors.push(d.message());await d.dismiss()});
 p.setDefaultTimeout(10000);await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);

 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.v=await import('/views.js?v=20260909dev305');const id=g.createCharacter();g.state.activeId=id;g.state.activeHomeId=g.state.characters[id].homeId;g.state.activeTab='home';g.state.homeEditMode=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home')});
 await p.waitForTimeout(1500);
 await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});

 await p.getByRole('button',{name:'가구 추가',exact:true}).click();
 await p.locator('[data-home-add-furniture]').first().click();
 await p.locator('[data-furniture-placement]').first().click({force:true});
 assert.equal(await p.locator('dialog[open]').count(),0,'Furniture pointer capture must not open room information');
 const bubbled=await p.locator('[data-furniture-placement]').first().evaluate(el=>{el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return document.querySelectorAll('dialog[open]').length});assert.equal(bubbled,0,'Furniture Enter must not trigger the room keyboard handler');
 

 const check=async()=>{await p.waitForFunction(()=>document.querySelector('.home-editor-dock').getBoundingClientRect().bottom<=innerHeight);const bounds=await p.locator('.home-editor-dock').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:innerHeight}});assert(bounds.top>=0&&bounds.bottom<=bounds.height&&bounds.width<=360,JSON.stringify(bounds));assert.equal(await p.locator('.home-native-elevator').count(),0);assert(await p.getByRole('button',{name:'가구 추가',exact:true}).isVisible());};
 await check();await p.setViewportSize({width:360,height:420});await check();
 await p.getByRole('button',{name:'가구 추가',exact:true}).click();assert(await p.locator('[data-home-add-furniture]').first().isVisible());
 await p.setViewportSize({width:360,height:880});await check();
 assert.deepEqual(errors,[]);console.log('PASS 360px editor: add/select furniture, dock clamping, floor controls, viewport resize');
 await p.screenshot({path:'tmp/editor471.png'});
 await p.goto(origin+'/scripts/qa-bed-conversation226.html');await p.locator('.couple-bed-base').evaluate(i=>i.decode());
 await p.evaluate(async()=>{const room=document.querySelector('.qa-room'),host=document.createElement('div');host.className='home-page';host.id='app';room.before(host);host.append(room);room.style.margin='100px auto';const fit=await import('/bed-occupant-layout.js');fit.positionBedOccupants(document);const depth=await import('/scene-depth.js');depth.bindSceneDepth(document)});
 await p.waitForTimeout(100);const faces=await p.locator('.is-using-couple-bed').evaluateAll(nodes=>nodes.map(p=>({size:parseFloat(p.style.getPropertyValue('--bed-face-size')),unit:p.style.getPropertyValue('--life-x'),x:parseFloat(p.style.getPropertyValue('--life-x')),y:parseFloat(p.style.getPropertyValue('--life-y'))})));assert(faces.length>0&&faces.every(f=>f.size>10&&f.unit.endsWith('px')&&Number.isFinite(f.x)&&Number.isFinite(f.y)));await p.screenshot({path:'tmp/bed471.png'});console.log('PASS sleeping occupant geometry',faces);

}finally{await browser.close();server.closeAllConnections();server.close()}
