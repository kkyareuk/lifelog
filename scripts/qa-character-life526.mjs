import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.argv.includes('--bundled')?resolve('www'):process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/simulation.js')b=Buffer.from(b.toString()+'\nexport {commitLiveEntry as qaCommit};');if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 for(const width of [402,1280]){
 const p=await browser.newPage({viewport:{width,height:874},serviceWorkers:'block'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');window.id=g.createCharacter();g.state.characters[id].name='가람';g.state.activeId=id;window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.setCharacterPane('secrets');window.photoQA.render({force:true});document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await p.locator('[data-secret-field=new-kind]').selectOption('custom');await p.locator('[data-secret-add]').click();
 await p.locator('[data-secret-field=dailyInfluence]').selectOption('off');await p.locator('[data-secret-field=afterglow]').selectOption('lasting');
 assert.equal(await p.evaluate(()=>g.state.characters[id].secrets[0].dailyInfluence),'off');
 await p.evaluate(()=>g.save(true,false));await p.reload();await p.waitForFunction(()=>window.photoQA);
 assert.equal(await p.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.characters[g.state.activeId].secrets[0].afterglow}),'lasting');
 for(const lang of ['ko','en','ja']){
 await p.evaluate(async lang=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.uiLanguage=lang;g.state.characterSettingsView='hub';g.state.characterProfileBook=true;window.v=await import('/views.js?v=20260909dev305');window.DrawerVillageNavigation.go('town');v.setMobileTownMode('town');v.setMobileTownPanel('world');window.photoQA.render({force:true});document.querySelectorAll('dialog[open]').forEach(d=>d.close());},lang);
 await p.locator('[data-world-court-theme]').filter({visible:true}).selectOption('court');
 assert.equal(await p.evaluate(()=>g.state.world.courtTheme),'court');
 await p.locator('[data-open-town-court]').filter({visible:true}).click();
 assert(await p.locator('.court-character-page').filter({visible:true}).count());
 assert.equal(await p.evaluate(()=>g.state.characterSettingsView),'full');
 await p.screenshot({path:`tmp/life526-${width}-${lang}-court.png`,fullPage:true});
 await p.evaluate(()=>{g.setCharacterPane('secrets');window.photoQA.render({force:true})});
 if(!await p.locator('[data-secret-field=dailyInfluence]').isVisible())await p.locator('.secret-settings details summary').first().click();await p.locator('[data-secret-field=dailyInfluence]').waitFor({state:'visible'});
 assert.equal(await p.locator('.secret-settings').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
 }
 const history=await p.evaluate(async()=>{
 const sim=await import('/simulation.js?v=20260909dev305'),c=g.state.characters[g.state.activeId],date=new Date();
 sim.timeline(c,date);const before=JSON.stringify(sim.timeline(c,date)),minute=date.getHours()*60+date.getMinutes();
 const record={storyReflection:true,interactionId:'qa-reflection',title:'마음에 남은 생각',desc:'A private thought',minute};
 sim.qaCommit(c,date,record);sim.qaCommit(c,date,record);
 const unchanged=JSON.stringify(sim.timeline(c,date))===before;
 const count=sim.visibleTimeline(c,date).filter(e=>e.interactionId==='qa-reflection').length;
 c.timelineResetAt=Date.now();sim.timeline(c,date);
 return {unchanged,count,afterRebuild:sim.visibleTimeline(c,date).filter(e=>e.interactionId==='qa-reflection').length};
 });assert.deepEqual(history,{unchanged:true,count:1,afterRebuild:1});
 await p.evaluate(()=>{Object.values(g.state.characters).forEach(c=>c.townId='another-town');window.DrawerVillageNavigation.go('town');v.setMobileTownMode('town');v.setMobileTownPanel('world');g.state.world.courtTheme='court';window.photoQA.render({force:true})});
 await p.locator('[data-open-town-court]').filter({visible:true}).click();
 assert.deepEqual(errors,[]);await p.close();
 }
 console.log('PASS526 browser: secret controls/reload, town court switch/shortcut from hub, mobile+desktop KO/EN/JA');
}finally{await browser.close();server.close()}