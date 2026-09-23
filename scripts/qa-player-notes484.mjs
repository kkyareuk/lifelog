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



 await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];c.name='쪽지 테스트';c.createdAt=new Date(2026,8,22,8).toISOString();c.timelineResetAt=new Date(2026,8,22,8).getTime();window.DrawerVillageNavigation.go('mailbox')});
 await p.locator('[data-mail-folder="compose"]').click();await p.locator('[name=subject]').fill('비밀 제목');await p.locator('[name=body]').fill('PRIVATE BODY <img src=x onerror=alert(1)>');await p.locator('[data-player-mail] [type=submit]').click();
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].playerNotes?.length===1);
 assert.equal(await p.locator('.mail-read-label').first().innerText(),'안 읽음');await p.locator('[data-mail-open]').first().click();assert.equal(await p.evaluate(()=>Object.keys(g.state.characters[g.state.activeId].noteReceipts||{}).length),0,'Opening sent mail is not character reading');await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const result=await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId],notes=await import('/player-notes.js');notes.advancePlayerNotes(c,{home:true,room:'living',title:'쉬는 중'},Date.now());const v=await import('/views.js?v=20260909dev305');return {html:v.homeLogMarkup(c.homeId),c:c.id}});
 assert(result.html.includes('사용자의 쪽지가 도착했어요'));assert(result.html.includes('사용자가 보낸 쪽지를 읽는 중'));assert(!result.html.includes('PRIVATE BODY'));assert(!result.html.includes('비밀 제목'));
 await p.evaluate(()=>{window.DrawerVillageNavigation.go('home')});
 await p.evaluate(html=>{const d=document.createElement('dialog');d.id='qa-note-log';d.innerHTML=html;document.body.append(d);d.showModal()},result.html);
 await p.locator('#qa-note-log').getByText('사용자의 쪽지가 도착했어요',{exact:false}).first().scrollIntoViewIfNeeded();
 await p.screenshot({path:'tmp/notes484'+(process.argv.includes('--webkit')?'-webkit':'')+'.png'});
 await p.clock.setFixedTime(new Date(2026,8,23,11,1,2));await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId];(await import('/player-notes.js')).advancePlayerNotes(c,{home:true,room:'living',title:'쉬는 중'},Date.now());document.querySelector('#qa-note-log').close();window.DrawerVillageNavigation.go('mailbox')});await p.locator('[data-mail-folder="sent"]').click();assert.equal(await p.locator('.mail-read-label').first().innerText(),'읽음');
 await p.evaluate(()=>g.save(true));await p.reload();await p.waitForFunction(()=>window.photoQA);assert(await p.evaluate(async()=>{const state=(await import('/state.js?v=20260909dev305')).state,c=Object.values(state.characters).find(c=>c.name==='쪽지 테스트');return c?.playerNotes?.length===1&&Object.values(c.noteReceipts||{}).some(r=>r.readAt)}),'Read receipt survives real browser reload');
 assert.deepEqual(errors,[]);console.log('PASS484 browser: real personal send, unread until character reads, house arrival + reading logs, no private text in shared-facing log, read status after completion');
}finally{await browser.close();server.closeAllConnections();server.close()}
