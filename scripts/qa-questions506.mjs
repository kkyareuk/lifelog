import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.argv.includes('--bundled')?resolve('www'):process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:process.argv.includes("--tablet")?{width:1024,height:768}:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');const a=g.createCharacter(),b=g.createCharacter();g.state.characters[a].name='가람';g.state.characters[b].name='나래';window.ids=[a,b];g.state.activeId=a;window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.setCharacterPane('secrets');window.photoQA.render({force:true});document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));

 assert(await p.evaluate(()=>window.DRAWER_VILLAGE_CAREER_ENABLED===true&&window.DRAWER_VILLAGE_BUILDING_INTERIORS_ENABLED===true));
 await p.evaluate(async()=>{window.discovery=await import('/character-discovery.js?v=20260909dev305');window.rules=await import('/character-discovery-rules.js?v=20260909dev305');window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await p.waitForFunction(()=>discovery.observedCharacterId()&&g.state.characters[discovery.observedCharacterId()]);await p.evaluate(()=>g.state.activeId=discovery.observedCharacterId());
 for(const lang of ['ko','en','ja']){
  for(const id of ['dilemma-last-dessert','profile-hobby-free-hour','profile-tattoo-encounter']){
   await p.evaluate(({lang,id})=>{g.state.uiLanguage=lang;discovery.showDiscovery(g.active(),{title:'쉬는 중'},rules.DISCOVERY_SCENES.find(q=>q.id===id));},{lang,id});
   assert.equal(await p.locator('.discovery-choices button').count(),5);
   assert(await p.locator('.character-discovery-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   if(lang==='ko'&&id==='dilemma-last-dessert')await p.screenshot({path:'tmp/questions506-ko.png',fullPage:true});
   await p.locator('.character-discovery-dialog button').last().click();await p.locator('.character-discovery-dialog').waitFor({state:'detached'});
  }
 }
 await p.evaluate(()=>{g.state.uiLanguage='ko';discovery.showDiscovery(g.active(),{title:'쉬는 중'},rules.DISCOVERY_SCENES.find(q=>q.id==='profile-hobby-free-hour'));});
 await p.locator('.discovery-choices button').filter({hasText:'아무것도 하지 않고'}).click();
 await p.waitForFunction(()=>!document.querySelector('.character-discovery-dialog'));
 const before=await p.evaluate(()=>({hobbies:g.active().hobbies,answered:g.active().discovery.answered}));assert(before.answered.includes('profile-hobby-free-hour'));
 await p.evaluate(()=>g.save(true,false));await p.reload();await p.waitForFunction(()=>window.photoQA);
 const after=await p.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return {hobbies:g.active().hobbies,answered:g.active().discovery.answered}});assert.deepEqual(after,before);
 assert.deepEqual(errors,[]);console.log('PASS506 packaged UI: public career/building flags, KO/EN/JA choices and layout, neutral answer saves and survives restart');
}finally{await browser.close();server.close()}
