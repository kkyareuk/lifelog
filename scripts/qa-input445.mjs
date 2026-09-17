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
 const page=await browser.newPage({viewport:{width:384,height:832},hasTouch:true,serviceWorkers:'block'});
 await page.goto(origin+'/qa-empty');
 await page.evaluate(async()=>{
 document.body.innerHTML='<button id="open">Open</button><dialog id="parent"><select aria-label="Choices"><option>A</option><option>B</option></select></dialog>';
 document.querySelector('#open').onclick=()=>document.querySelector('#parent').showModal();
 window.changes=0;document.querySelector('select').onchange=()=>changes++;
 await import('/selection-popup.js');
 });
 await page.locator('#open').tap();assert.equal(await page.locator('#parent[open]').count(),1);
 await page.locator('select').tap();assert.equal(await page.locator('.selection-popup[open]').count(),1,'touch opens and keeps selection popup');
 assert.equal(await page.evaluate(()=>changes),0,'opening tap cannot select an option');
 await page.locator('.selection-popup-options button').nth(1).tap();assert.equal(await page.evaluate(()=>changes),1);assert.equal(await page.locator('#parent[open]').count(),1,'parent remains open');
 await page.locator('select').click();assert.equal(await page.locator('.selection-popup[open]').count(),1);
 await page.getByRole('button',{name:'닫기',exact:true}).click();assert.equal(await page.locator('#parent[open]').count(),1);
 await page.locator('select').press('Enter');assert.equal(await page.locator('.selection-popup[open]').count(),1);
 console.log('PASS445 touch/mouse/keyboard selection, no opening gesture option activation, parent preserved');
}finally{await browser.close();server.close()}
