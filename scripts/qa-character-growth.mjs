import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-growth');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/qa-empty'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><body></body>');return;}const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:412,height:917},hasTouch:true,serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('drawer-village-help-intro','done');localStorage.setItem('drawer-village-intro-v2',JSON.stringify({done:true}));HTMLMediaElement.prototype.play=()=>Promise.resolve()});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await page.goto(origin+'/?native-preview');await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.getByRole('button',{name:'게스트',exact:true}).waitFor();
 await page.screenshot({path:out+'/title-growth.png'});
 await page.getByRole('button',{name:'게스트',exact:true}).click();
 assert.equal(await page.locator('.drawer-title').count(),0);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter();g.setActive(a);window.DRAWER_VILLAGE_NATIVE=true;document.documentElement.classList.add('native-app','native-platform');g.state.activeHomeId=g.state.characters[a].homeId;window.DrawerVillageNavigation.go('observe');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(300);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

 await page.evaluate(()=>{g.state.characters[g.state.activeId].name='성장 테스트';qaRender()});
 for(const language of ['ko','en','ja']){
  await page.evaluate(language=>{g.state.uiLanguage=language;qaRender()},language);
  await page.locator('[data-growth-task="action"]').waitFor();
  assert.equal(await page.locator('.character-level-badge').textContent(),'Lv. 1');
  await page.screenshot({path:out+'/growth-'+language+'.png'});
 }
 await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
 await page.locator('[data-growth-task="action"]').click();
 await page.locator('.direct-command-dialog[open]').waitFor();
 const activity=page.locator('.direct-command-dialog[open] [data-direct-simple-action]').first();
 if(await activity.isVisible()){await activity.click()}else{await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.evaluate(async()=>{const m=await import('/character-growth-ui.js');m.completeGrowthTask(g.state.activeId,'action')})}
 await page.evaluate(async()=>{const m=await import('/character-growth-ui.js');m.completeGrowthTask(g.state.activeId,'action')});
 assert.equal(await page.locator('[data-growth-task="answer"]').count(),1);
 await page.evaluate(async()=>{const c=g.state.characters[g.state.activeId];g.updateCharacter(c.id,{discovery:{...c.discovery,answered:['one','two','three','three'],recent:['three']}});qaRender()});
 assert.equal(await page.locator('[data-growth-task="routine"]').count(),1);
 await page.evaluate(async()=>{const m=await import('/character-growth-ui.js');m.completeGrowthTask(g.state.activeId,'routine')});
 assert.equal(await page.locator('.character-level-badge').textContent(),'Lv. 2');
 const persistence=await page.evaluate(async()=>{const model=await import('/character-growth.js'),before=model.characterGrowth(g.state.characters[g.state.activeId]);const other=g.createCharacter();const fresh=model.characterGrowth(g.state.characters[other]);g.setActive(g.state.order[0]);qaRender();return {before,fresh}});
 assert.equal(persistence.before.xp,100);assert.equal(persistence.fresh.level,1);
 const layout=await page.evaluate(()=>{const task=document.querySelector('.character-growth-card').getBoundingClientRect(),log=document.querySelector('.game-hud-moment').getBoundingClientRect(),badge=document.querySelector('.character-level-badge').getBoundingClientRect(),frame=document.querySelector('.game-hud-profile-frame').getBoundingClientRect();return {taskAboveLog:task.bottom<log.top,badgeOverlaps:badge.left<frame.right&&badge.right>frame.right&&badge.top<frame.bottom,bottom:log.bottom,height:innerHeight}});
 assert.ok(layout.taskAboveLog,JSON.stringify(layout));assert.ok(layout.badgeOverlaps,JSON.stringify(layout));assert.ok(layout.bottom<layout.height);
 await page.setViewportSize({width:360,height:640});await page.screenshot({path:out+'/growth-small.png'});
 await page.setViewportSize({width:1280,height:800});await page.screenshot({path:out+'/growth-tablet.png'});
 await page.evaluate(()=>{window.DRAWER_VILLAGE_NATIVE=false;history.replaceState({},'', '/');document.documentElement.classList.remove('native-app','native-platform');qaRender()});
 await page.locator('.desktop-village .character-growth-card').waitFor();
 await page.screenshot({path:out+'/growth-desktop.png'});
 assert.deepEqual(errors,[]);console.log('PASS growth: 3 languages, milestones, deduplication, badge, layout, desktop',layout);
}finally{await browser.close();server.close()}
