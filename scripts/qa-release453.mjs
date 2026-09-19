import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback433');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/qa-empty'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><body></body>');return;}const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:412,height:917},hasTouch:true,serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('drawer-village-help-intro','done');HTMLMediaElement.prototype.play=()=>Promise.resolve()});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await page.goto(origin+'/?native-preview');await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.getByRole('button',{name:'게스트',exact:true}).waitFor();
 await page.screenshot({path:out+'/title453.png'});
 await page.getByRole('button',{name:'게스트',exact:true}).click();
 assert.equal(await page.locator('.drawer-title').count(),0);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter();g.setActive(a);window.DRAWER_VILLAGE_NATIVE=true;document.documentElement.classList.add('native-app','native-platform');g.state.activeHomeId=g.state.characters[a].homeId;window.DrawerVillageNavigation.go('home');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(300);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 console.log('zoom',await page.locator('[data-zoom-bound]').count());
 const pinch=async selector=>page.locator(selector).evaluate(view=>{
  const r=view.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
  const fire=(type,id,dx)=>view.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:id,clientX:x+dx,clientY:y}));
  fire('pointerdown',71,-40);fire('pointerdown',72,40);fire('pointermove',71,-80);fire('pointermove',72,80);fire('pointerup',71,-80);fire('pointerup',72,80);
  const child=view.querySelector(':scope > .rooms,:scope > .world');console.log(view.className,view.dataset.zoomBound,child.style.transform);return getComputedStyle(child).transform;
 });
 assert.match(await pinch('.home-canvas-viewport'),/^matrix\(2,/,'house scene pinches independently of fixed controls');
 await page.locator('[data-home-ui-toggle]').first().tap();
 assert(await page.locator('.home-page').evaluate(el=>el.classList.contains('home-ui-hidden')),'fixed controls respond after pinching');
 await page.screenshot({path:out+'/home453.png'});
 await page.evaluate(()=>{window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.state.characterPane='personality';g.state.characterPersonalityPane='core';qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 console.log('scroll grids',await page.locator('.book-form-grid').evaluateAll(els=>els.map(el=>({h:el.clientHeight,scroll:el.scrollHeight,max:getComputedStyle(el).maxHeight}))));
 const grids=page.locator('.book-form-grid');
 if(await grids.count()){
  const metrics=await grids.first().evaluate(el=>{el.scrollTop=100;return {top:el.scrollTop,h:el.clientHeight,scroll:el.scrollHeight,pointer:getComputedStyle(el).pointerEvents}});
  assert.equal(metrics.pointer,'auto');if(metrics.scroll>metrics.h)assert(metrics.top>0);
 }
 await page.screenshot({path:out+'/character453.png'});
 await page.evaluate(()=>{window.DrawerVillageNavigation.go('town');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 console.log('town zoom',await page.locator('.town-map-scroll').evaluate(v=>({bound:v.dataset.zoomBound,html:v.outerHTML.slice(0,650)})));
 assert.match(await pinch('.town-map-scroll'),/^matrix\(2,/,'town supports pinch');
 await page.evaluate(()=>{const select=document.createElement('select');select.id='qa-choice';select.innerHTML='<option>a</option><option>b</option>';document.querySelector('#app main').append(select);select.click()});
 await page.evaluate(()=>qaRender());assert(await page.locator('.selection-popup').isVisible());
 await page.locator('.selection-popup-options button').nth(1).click();assert.equal(await page.locator('#qa-choice').inputValue(),'b');
 assert.deepEqual(errors,[]);
 console.log('PASS453 title entry, house/town pinch, book scroll and dropdown continuity in '+(useWebKit?'WebKit':'Chromium'));
}finally{await browser.close();server.close()}
