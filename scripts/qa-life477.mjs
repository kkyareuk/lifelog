import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));
 await p.evaluate(async()=>{window.DrawerVillageNavigation.go('town');const views=await import('/views.js?v=20260909dev305');views.setMobileTownMode('town');window.photoQA.render()});await p.locator('[data-world-background-setting]').waitFor({state:'attached'});
 await p.locator('.town-information-screen').evaluate(el=>el.scrollTop=550);
 await p.evaluate(()=>window.photoQA.render());assert.equal(await p.locator('.town-information-screen').evaluate(el=>el.scrollTop),550);
 await p.getByRole('button',{name:'마을 배경 선택',exact:true}).click();assert.equal(await p.locator('.speech-picker-options small').count(),2);await p.screenshot({path:'tmp/town-picker477.png'});await p.locator('.speech-picker-options button').first().click();
 const beforeRefresh=await p.locator('.town-information-screen').evaluate(el=>el.scrollTop);await p.evaluate(()=>window.dispatchEvent(new Event('drawer-money-updated')));await p.waitForTimeout(100);assert.equal(await p.locator('.town-information-screen').evaluate(el=>el.scrollTop),beforeRefresh);await p.screenshot({path:'tmp/town-settings477.png'});
 await p.locator('[data-mobile-town-close]').click();
 await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId],stamp=Date.now(),home=g.state.homes[c.homeId],room=Object.keys(home.rooms).find(k=>home.rooms[k].type==='bath'||k==='bath');Object.assign(c,{wake:'00:00',sleep:'00:00',lifeNeeds:{sleep:90,hunger:90,toilet:0,hygiene:90,social:90,updatedAt:stamp}});g.state.routines[c.id]=[];g.directCharacterActivity(c.id,'wash',{lifeTask:'toilet',now:stamp,scenes:{[c.id]:{home:true,room,visitHomeId:c.homeId}}});const d=g.state.characterDirectives[c.id];d.journey.segments=[];d.journey.arrivesAt=stamp;d.endsAt=stamp+10000;window.DrawerVillageNavigation.go('home');window.photoQA.render()});
 const bar=p.getByRole('progressbar',{name:'활동 진행률'}).first();await bar.waitFor();const style=await bar.evaluate(el=>{const s=getComputedStyle(el);return {height:s.height,padding:s.padding,background:s.backgroundColor}});console.log(style);assert.equal(parseFloat(style.height),6);assert.equal(style.padding,'0px');await p.screenshot({path:'tmp/progress477.png'});
 await p.evaluate(async()=>{const salary=await import('/salary.js'),money=await import('/character-money.js'),dashboard=await import('/career-dashboard.js');const c=g.state.characters[g.state.activeId];money.ensureWallet(c);salary.assignEmployment(g.state,c,'builtin-office','rank-1',Date.now(),money.moneyEntry);dashboard.openCareerDashboard(g.state,c)});
 await p.getByRole('button',{name:'직접 정하기',exact:true}).click();await p.getByLabel('출근 시각',{exact:true}).fill('10:30');await p.getByRole('button',{name:'저장',exact:true}).click();await p.getByRole('button',{name:'직접 정하기',exact:true}).waitFor();assert.match(await p.locator('.career-dashboard').innerText(),/10:30/);await p.screenshot({path:'tmp/career-schedule477.png'});
 assert.deepEqual(errors,[]);console.log('PASS477 mobile picker and progress style '+(process.argv.includes('--webkit')?'WebKit':'Chrome'));
}finally{await browser.close();server.close()}

