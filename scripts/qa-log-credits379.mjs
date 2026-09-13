import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/views.js')body=body.toString()+'\nwindow.qaDailyLogItems=dailyLogItems;';if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');for(const name of ['가나다','라마바','사아자','차카타']){const id=g.createCharacter();g.state.characters[id].name=name;}document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('observe');});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.evaluate(()=>{const d=document.querySelector('[data-native-log-dialog]');const c=g.state.characters[g.state.activeId];const rows=Array.from({length:30},(_,i)=>({minute:i*5,time:'12:'+String(i).padStart(2,'0'),title:'함께 이야기하기',desc:'오늘 있었던 일을 함께 이야기했어요.',withIds:g.state.order.filter(id=>id!==c.id)}));d.querySelector('ol').innerHTML=window.qaDailyLogItems(rows,c);d.showModal()});
 const chips=page.locator('.native-log-dialog .log-participants').first().locator('.log-companion');const boxes=await Promise.all((await chips.all()).map(l=>l.boundingBox()));assert(boxes.length===3&&boxes[1].x>boxes[0].x,JSON.stringify(boxes));
 const list=page.locator('.native-log-dialog [data-log-entries]');assert(await list.evaluate(e=>e.scrollHeight>e.clientHeight));await list.evaluate(e=>e.scrollTop=e.scrollHeight);assert(await list.evaluate(e=>e.scrollTop>0));assert(await page.locator('.native-log-dialog-close').isVisible());await page.screenshot({path:resolve(out,useWebKit?'log379-webkit.png':'log379-chrome.png')});await page.locator('.native-log-dialog-close').click();
 await page.evaluate(()=>window.DrawerVillageNavigation.go('credits'));await page.waitForTimeout(200);const names=page.locator('.supporter-page .supporter-name');assert(await names.count()>0);assert.equal(await names.first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 246, 223)');assert.equal(await names.first().evaluate(e=>getComputedStyle(e).webkitTextStrokeColor),'rgb(23, 16, 11)');await page.screenshot({path:resolve(out,useWebKit?'credits379-webkit.png':'credits379-chrome.png')});
 console.log('PASS horizontal participant chips, long log scroll with fixed controls, cream outlined supporter credits');
}finally{await browser.close();server.close()}
