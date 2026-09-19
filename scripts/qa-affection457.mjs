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
 const page=await browser.newPage({viewport:{width:402,height:820},hasTouch:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('drawer-village-help-intro','done');HTMLMediaElement.prototype.play=()=>Promise.resolve()});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview');await page.waitForFunction(()=>window.DrawerVillageNavigation);await page.getByRole('button',{name:'게스트',exact:true}).click();
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter();g.createCharacter();g.setActive(a);window.DRAWER_VILLAGE_NATIVE=true;document.documentElement.classList.add('native-app','native-platform');window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.state.characterPane='personality';g.state.characterPersonalityPane='core';qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
 const select=page.locator('.book-form-grid [data-field="affectionStyle"]').first();await select.scrollIntoViewIfNeeded();await select.tap();await page.locator('.selection-popup-options button').getByText('말로 표현',{exact:true}).tap();
 assert.equal(await page.evaluate(()=>g.state.characters[g.state.activeId].affectionStyle),'말로 표현');await page.evaluate(()=>qaRender());assert.equal(await select.inputValue(),'말로 표현');
 await select.tap();await page.locator('.selection-popup-options button').getByText('적극적으로 챙김',{exact:true}).tap();await page.evaluate(async()=>{await g.save(true,false)});await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);assert.equal(await page.evaluate(async()=>{const s=await import('/state.js?v=20260909dev305');return s.state.characters[s.state.activeId].affectionStyle}),'적극적으로 챙김');assert.deepEqual(errors,[]);console.log('PASS affection selection/reopen/reload '+(useWebKit?'WebKit':'Chrome'));
}finally{await browser.close();server.closeAllConnections();server.close()}
