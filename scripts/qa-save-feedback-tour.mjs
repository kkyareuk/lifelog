import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.state.characters[g.state.activeId].name='Save QA';g.state.activeTab='observe';window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(400);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 for(let index=0;index<5;index++){
  await page.evaluate(async(index)=>{const rules=await import('/character-discovery-rules.js?v=20260909dev305'),ui=await import('/character-discovery.js?v=20260909dev305');const c=g.state.characters[g.state.activeId];c.discovery={version:2,answers:{},locks:{}};const q=rules.DISCOVERY_SCENES.find(q=>q.id==='dilemma-queue-gap');ui.showDiscovery(c,null,q);window.qaAnswer=index},index);
  await page.locator('.character-discovery-dialog .discovery-choices button').nth(index).click();await page.waitForFunction(()=>!document.querySelector('.character-discovery-dialog'));
  assert(await page.evaluate(()=>g.save(true)),'snapshot save');
 }
 await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const persisted=await page.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.characters[g.state.activeId]?.discovery});assert(persisted&&persisted.answered?.includes('dilemma-queue-gap'),JSON.stringify(persisted));
 console.log('PASS all 5 reported queue-gap choices save and survive reload');
 await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('settings')});await page.waitForTimeout(200);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.getByRole('button',{name:'익명 문의',exact:true}).click();assert(await page.getByRole('heading',{name:'익명 문의',exact:true}).isVisible());assert.equal(await page.locator('dialog[open] a[href^="mailto:"]').count(),0);await page.locator('dialog[open]').getByRole('button',{name:'닫기',exact:true}).click();
 await page.locator('[data-settings-pane="support"]').click();await page.locator('[data-intro-tour]').click();await page.waitForTimeout(250);
 assert(await page.locator('.intro-tour').isVisible());await page.screenshot({path:resolve(out,useWebKit?'tour-webkit.png':'tour-chrome.png')});const box=await page.locator('.intro-tour').boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=403&&box.y+box.height<=821,JSON.stringify(box));
 await page.locator('.intro-tour').getByRole('button',{name:'확인',exact:true}).click();await page.locator('[data-character-command]').first().click();await page.waitForTimeout(150);assert.match(await page.locator('.intro-tour p').textContent(),/분류/);await page.locator('[data-command-close]').click();await page.waitForTimeout(150);assert.match(await page.locator('.intro-tour p').textContent(),/질문 아이콘/);
 await page.locator('.intro-tour').getByRole('button',{name:'건너뛰기',exact:true}).click();await page.locator('.intro-tour').getByRole('button',{name:'건너뛰기',exact:true}).click();assert.equal(await page.locator('.intro-tour').count(),0);
 const order=await page.evaluate(async()=>{const {logOrderControl,installLogOrder}=await import('/log-order.js');const test=document.createElement('section');test.innerHTML=logOrderControl('ko')+'<ol data-log-entries><li data-log-minute="10">old</li><li data-log-minute="30">new</li></ol>';document.body.append(test);installLogOrder(document);const select=test.querySelector('select');select.value='latest';select.dispatchEvent(new Event('change',{bubbles:true}));const latest=test.querySelector('ol').textContent;select.value='oldest';select.dispatchEvent(new Event('change',{bubbles:true}));return [latest,test.querySelector('ol').textContent]});assert.deepEqual(order,['newold','oldnew']);
 console.log('PASS mobile anonymous inquiry, walkthrough target transitions/skip, chronological display toggle');
}finally{await browser.close();server.close()}
