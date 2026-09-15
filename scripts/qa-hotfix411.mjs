import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-hotfix411');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root))throw Error();let body=await readFile(path==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(path==='/app.js')body=body.toString()+'\nexport {openHomeOccupantSheet};';if(path==='/views.js')body=body.toString()+'\nexport {homeLifePersonMarkup,homeBedForegroundStatusMarkup,observe,home};';if(path==='/simulation.js')body=body.toString()+'\nexport {sleepingNow,buildScene,sharedFurnitureScene,homeActivityPoolFor};';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,engine=process.argv.includes('--webkit')?'webkit':'chromium';const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{const page=await browser.newPage({viewport:{width:384,height:820},deviceScaleFactor:3,hasTouch:true,serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());page.on('pageerror',e=>console.log('PAGEERROR',e.message));page.setDefaultTimeout(15000);await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation,{},{timeout:15000});
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.sim=await import('/simulation.js?v=20260909dev305');window.v=await import('/views.js?v=20260909dev305');const id=g.createCharacter(20);window.testId=id;g.state.activeId=id;g.state.characters[id].name='크로';await import('/activity-settings.js?v=20260909dev305');document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.insertAdjacentHTML('beforeend',`<button id="qa-activities" data-activity-settings="${id}">Restrictions</button>`)});
 await page.evaluate(async()=>{window.ui=await import('/app.js?v=20260909dev305');const second=g.createCharacter(20);g.state.characters[second].name='네리네';window.secondId=second;g.state.activeId=testId;g.state.uiLanguage='ko';document.querySelectorAll('dialog[open]').forEach(d=>d.close());const c=g.state.characters[testId];c.name='크로';window.openPerson=id=>{const c=g.state.characters[id],b=document.createElement('button');b.dataset.homeOccupant='character';b.dataset.characterId=id;b.dataset.occupantName=c.name;b.dataset.occupantTitle='잠시 쉬는 중';b.dataset.occupantRoom='거실';b.style.cssText='position:fixed;left:20px;top:80px';b.textContent=c.name;document.body.append(b);ui.openHomeOccupantSheet(b)};});

 for(const viewport of [{width:384,height:832},{width:384,height:450},{width:320,height:568},{width:360,height:648}]){
  await page.setViewportSize(viewport);
  for(const lang of ['ko','en','ja']){
   await page.evaluate(lang=>{g.state.uiLanguage=lang;openPerson(testId)},lang);await page.waitForTimeout(250);
   const box=await page.locator('[data-home-occupant-sheet]').boundingBox();assert(box.y>=10&&box.y+box.height<=viewport.height-10,JSON.stringify(box));
   await page.evaluate(()=>{const panel=document.querySelector('[data-home-occupant-sheet]');const extra=document.createElement('div');extra.style.height='1200px';panel.append(extra)});await page.waitForTimeout(100);
   const large=await page.locator('[data-home-occupant-sheet]').boundingBox();assert(large.y>=10&&large.y+large.height<=viewport.height-10,JSON.stringify(large));
  }
 }
 await page.evaluate(()=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.originalGroups=window.DrawerVillageGroups;
  const world=structuredClone(g.state);world.sharedContext={groupId:'qa'};g.beginCharacterEditor(world);
  g.state.uiLanguage='ko';const uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
  window.DrawerVillageGroups={getSnapshot:()=>({activeGroupId:'qa',residents:[{id:testId,ownerUid:uid,profileJson:JSON.stringify({id:testId,name:'크로',autonomousActivityBlocks:[]})}]}),saveResident:async input=>{window.savedProfile=input.profile}};
  document.querySelector('#qa-activities').dataset.groupId='qa';document.querySelector('#qa-activities').click();
 });
 await page.locator('dialog[open] .activity-settings-section input[value="sleep"]').check();
 await page.locator('dialog[open]').getByRole('button',{name:'저장',exact:true}).click();
 assert.equal(await page.evaluate(()=>g.state.characters[testId].autonomousActivityBlocks.includes('sleep')&&savedProfile.autonomousActivityBlocks.includes('sleep')),true);
 await page.evaluate(()=>document.querySelector('#qa-activities').click());
 assert.equal(await page.locator('dialog[open] .activity-settings-section input[value="sleep"]').isChecked(),true);
 await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());g.endCharacterEditor();window.DrawerVillageGroups=originalGroups;});
 await page.setViewportSize({width:360,height:648});
 await page.evaluate(()=>{document.querySelector('[data-home-occupant-sheet]')?.remove();g.state.uiLanguage='ko';window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 assert.equal(await page.locator('[data-character-command]').count(),1);
 await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const command=await page.locator('[data-character-command]').boundingBox();assert(command&&command.width>0&&command.height>0&&command.y>=0&&command.y+command.height<=648,JSON.stringify(command));
 await page.screenshot({path:resolve(out,`${engine}-home-command.png`)});
 const checks=await page.evaluate(async()=>{
  const n=await import('/notification-characters.js');
  const roster=n.notificationCharacters({characters:{a:{id:'a',name:'Local'}}},{activeGroupId:'group',residents:[{id:'b',ownerUid:'me',name:'Shared',profileJson:'{}'},{id:'c',ownerUid:'other',name:'Other'}]},'me');
  if(roster.map(c=>c.id).join(',')!=='a,b')throw Error('notification ownership');
  const engine=await import('/home-simulation.js');
  const home={rooms:{living:{furniturePlacements:[]},bedroom:{furniturePlacements:[{id:'bed',item:'침대',x:50,y:50}]}}};
  const contexts={a:{scene:{title:'자는 중',room:'living'},sleepRoomId:'',allowedRoomKeys:['living','bedroom'],animateMovement:false}};
  const auto=engine.advanceHomeLifeSimulation(home,['a'],contexts,1000000).simulation.agents.a;
  if(auto.furnitureId!=='bed'||auto.roomKey!=='bedroom')throw Error('vacant bed fallback');
  contexts.a.sleepRoomId='living';
  if(engine.advanceHomeLifeSimulation(home,['a'],contexts,1000000).simulation.agents.a.furnitureId)throw Error('explicit room priority');
  return true;
 });assert(checks);
 console.log('PASS411 roster ownership, vacant bed fallback, explicit room priority; popup remains within viewport after content growth and resize, KO EN JA, 384x832/384x450/320x568');
}finally{await browser.close();server.closeAllConnections();server.close()}
