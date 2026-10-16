import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.argv.includes('--packaged')?resolve('www'):process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.css'&&process.argv.includes('--baseline-cards'))b=Buffer.from(b.toString().replace('.catalog-dex-card,.settings-complete-group,.relation,','.catalog-dex-card,.setting-card,.settings-complete-group,.relation,'));if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:402,height:749},isMobile:true,hasTouch:true,deviceScaleFactor:3,serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.DRAWER_VILLAGE_NATIVE=true;window.DRAWER_VILLAGE_PLATFORM="ios";window.DRAWER_VILLAGE_ECONOMY_ENABLED=true;window.DRAWER_VILLAGE_CAREER_ENABLED=true});
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();const c=g.state.characters[g.state.activeId];c.icon='./assets/home-ui/profile-placeholder.png';c.ldImage='./assets/home-ui/profile-placeholder.png';g.state.homeVisualMode='sd';window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));


 await p.evaluate(()=>window.DrawerVillageNavigation.go('settings'));

 const mobileWebKit=process.argv.includes('--webkit');
 for(const lang of ['ko','en','ja']){
  for(const size of [{width:402,height:749},{width:874,height:402},{width:820,height:1180}]){
   await p.setViewportSize(size);
   await p.evaluate(lang=>{g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('settings');photoQA.render()},lang);
   for(const pane of ['home','gameplay','display','sound','notifications','data','support','account','feedback']){
    if(pane!=='home')await p.locator('[data-settings-pane='+pane+']').first().click();
    await p.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());await document.fonts.ready});await p.waitForTimeout(150);
    const scroller=p.locator('[data-settings-scroll]');
    const metrics=await scroller.evaluate(e=>{const m=e.parentElement,s=getComputedStyle(e),r=e.getBoundingClientRect();e.scrollTop=0;return {h:e.clientHeight,sh:e.scrollHeight,top:r.top,bottom:r.bottom,x:r.x,w:r.width,overflow:s.overflowY,mainOverflow:getComputedStyle(m).overflowY,wide:e.scrollWidth>e.clientWidth+2}});
    assert.equal(metrics.mainOverflow,'hidden','settings must have one scroll owner');
    assert.equal(metrics.overflow,'auto');assert(!metrics.wide,lang+pane+' horizontal overflow');
    assert(metrics.bottom<=size.height+1&&metrics.top>=0,lang+pane+' scroll box within viewport');
    if(metrics.sh>metrics.h+5){
     if(!mobileWebKit){
      const cdp=await p.context().newCDPSession(p),x=Math.round(metrics.x+metrics.w/2),start=Math.round(Math.min(size.height-25,metrics.bottom-30)),end=Math.round(metrics.top+45);
      await scroller.evaluate(e=>window.scrollOwner523=e);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:start}]});await p.evaluate(()=>photoQA.render());assert(await p.evaluate(()=>window.scrollOwner523.isConnected),'background render must not cancel the settings touch gesture');
      for(let y=start-20;y>end;y-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await p.waitForTimeout(12)}
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await p.waitForTimeout(500);
      assert(await scroller.evaluate(e=>e.scrollTop)>0,lang+pane+' touch swipe moves content');
     }
     await scroller.evaluate(e=>e.scrollTop=e.scrollHeight);
     const bottom=await scroller.evaluate(e=>e.scrollTop);
     assert(bottom>0);await p.evaluate(()=>photoQA.render());
     const after=await scroller.evaluate(e=>({top:e.scrollTop,max:e.scrollHeight-e.clientHeight}));assert(after.max<=0||after.top>0,lang+pane+' rerender must not reset to top '+JSON.stringify({bottom,after}));
     await scroller.evaluate(e=>e.scrollTop=e.scrollHeight);
    const visibleEnd=await scroller.evaluate(e=>{const a=e.lastElementChild.getBoundingClientRect(),b=e.getBoundingClientRect();return a.bottom<=b.bottom+2});
     if(!visibleEnd)console.log('end',await scroller.evaluate(e=>({top:e.scrollTop,h:e.clientHeight,sh:e.scrollHeight,box:e.getBoundingClientRect().toJSON(),last:e.lastElementChild.getBoundingClientRect().toJSON(),tag:e.lastElementChild.outerHTML.slice(0,100)})));assert(visibleEnd,lang+pane+' final settings reachable');
    }
    if(lang==='ko'&&size.width===402&&pane==='notifications')await p.screenshot({path:'C:/Users/Public/drawer-releases/settings523-'+(mobileWebKit?'webkit':'chrome')+'.png'});
    if(pane!=='home')await p.locator('.settings-pane-heading button').click();
   }
   console.log('PASS',lang,size.width+'x'+size.height,'nine settings panes: bounds, end access, scroll preservation'+(mobileWebKit?' (WebKit programmatic)':' and real touch input'));
  }
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();server.close()}
