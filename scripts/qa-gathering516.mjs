import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',String(e),e.message,e.stack)});
 await p.exposeFunction('qaError',v=>console.error('ERROR LOCATION',v));await p.addInitScript(()=>{window.DRAWER_VILLAGE_ECONOMY_ENABLED=true;window.addEventListener('error',e=>window.qaError({message:e.message,file:e.filename,line:e.lineno,col:e.colno}));});
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,9,9,14,35));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('.intro-tour'),async()=>p.locator('.intro-tour').evaluate(e=>e.remove()));await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));





 const prefix='C:/Users/Public/drawer-releases/gathering516-schedule'+(process.argv.includes('--webkit')?'-webkit':'');
 await p.evaluate(()=>{const ids=[g.state.activeId,g.createCharacter(),g.createCharacter()];ids.forEach((id,i)=>{const c=g.state.characters[id];c.name=['하루','다온','소리'][i];c.socialStyle=[20,80,90][i];c.planningStyle=80;c.job='무직';c.needsFixed=true;c.createdAt=new Date(2026,9,8,8).toISOString();c.timelineResetAt=+new Date(2026,9,8,8);});g.state.activeId=ids[0];g.state.homes[ids[0]].name='하루의 작은 집';window.DrawerVillageNavigation.go('routine');window.photoQA.render()});
 await p.locator('[data-open-gathering]').click();await p.locator('[data-gathering-plan]').click();
 const form=p.locator('.monthly-routine-sheet');await form.locator('[name=date]').fill('2026-10-09');await form.locator('[name=start]').fill('14:00');await form.locator('[name=end]').fill('16:00');await form.locator('[name=title]').fill('오후에 함께 놀기');
 await form.locator('[name=withId]').nth(0).check();await form.locator('[name=withId]').nth(1).check();await p.screenshot({path:prefix+'-edit.png'});await form.locator('[data-routine-save]').click();for(const m of [35,45,55,65]){await p.clock.setFixedTime(new Date(2026,9,9,14,m));await p.evaluate(async()=>{const sim=await import('/simulation.js?v=20260909dev305');sim.eventFor(g.active(),new Date())});}
 await p.locator('[data-open-gathering]').click();await p.waitForSelector('.gathering-caption');
 assert.equal(await p.locator('[data-gathering-kind],[data-gathering-actor],[data-gathering-target]').count(),0,'no direction controls');
 assert.equal(await p.locator('.gathering-person').count(),3);assert.equal(await p.locator('.gathering-avatar').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','no cream icon tiles');
 await p.screenshot({path:prefix+'-live.png'});await p.locator('.gathering-history summary').click();await p.locator('.gathering-history').scrollIntoViewIfNeeded();await p.screenshot({path:prefix+'-logs.png'});assert(await p.locator('.gathering-history p').count()>=3);
 await p.locator('[data-gathering-close]').click();await p.evaluate(()=>g.save(true));await p.waitForTimeout(500);await p.reload();await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');window.DrawerVillageNavigation.go('routine');window.photoQA.render()});
 await p.locator('[data-open-gathering]').click();assert.equal(await p.locator('.gathering-person').count(),3,'schedule survives reload');
 for(const lang of ['en','ja']){await p.locator('[data-gathering-close]').click();await p.evaluate(lang=>{g.state.uiLanguage=lang;window.photoQA.render()},lang);await p.locator('[data-open-gathering]').click();assert((await p.locator('.gathering-caption').innerText()).length>20);await p.screenshot({path:prefix+'-'+lang+'.png'});}
 await p.locator('[data-gathering-edit]').first().click();await p.locator('.monthly-routine-sheet [name=date]').fill('2026-10-10');await p.locator('[data-routine-save]').click();await p.locator('[data-open-gathering]').click();assert.equal(await p.locator('.gathering-caption').count(),0,'rescheduling stops live gathering');
 assert.equal(await p.locator('.gathering-dialog').evaluate(d=>d.scrollWidth>d.clientWidth+1),false,'mobile horizontal fit');
 assert.deepEqual(errors,[]);console.log('PASS516 UI: schedule integration, guest selection, autonomous live activity, no icon background, varied life logs, reload, reschedule, KO/EN/JA; screenshots '+prefix);
}finally{await browser.close();server.closeAllConnections();server.close()}






