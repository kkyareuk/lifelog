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
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 const setup=()=>p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.cook=await import('/cooking-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});await setup();
 await p.evaluate(()=>{g.state.activeId=g.createCharacter();g.state.activeTab='observe';window.DrawerVillageNavigation.go('observe');cook.openCooking(g.state.activeId)});
 assert.equal(await p.locator('.recipe-choice').count(),180);
 const levels=await p.locator('.recipe-choice').evaluateAll(nodes=>nodes.map(n=>+n.dataset.recipeLevel));assert(levels.every((v,i)=>i===0||v>=levels[i-1]));
 const grid=await p.locator('.recipe-grid').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length);assert.equal(grid,3);
 await p.getByLabel('정렬',{exact:true}).selectOption('price');const prices=await p.locator('.recipe-choice').evaluateAll(nodes=>nodes.map(n=>+n.dataset.recipePrice));assert(prices.every((v,i)=>i===0||v>=prices[i-1]));
 await p.screenshot({path:'tmp/cooking-grid472.png'});
 await p.evaluate(()=>{document.querySelector('dialog.cooking-dialog').close();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 assert.equal(await p.locator('.game-hud-side-right [data-tab="groups"]').count(),0);
 assert.equal(await p.locator('.game-hud-dock [data-tab="groups"]').getAttribute('aria-label'),'멀티');
 assert((await p.locator('.game-hud-dock [data-tab="groups"] img').getAttribute('src')).includes('plaza-fountain'));
 assert(await p.locator('.scene-default-statue').count());
 assert((await p.locator('.character-money-shortcuts img').first().getAttribute('src')).includes('profile-placeholder'));
 const positions=await p.evaluate(()=>({left:document.querySelector('.character-money-shortcuts').getBoundingClientRect().top,right:document.querySelector('.game-hud-side-right').getBoundingClientRect().top}));assert(positions.left<positions.right);
 await p.screenshot({path:'tmp/navigation472.png'});await p.evaluate(()=>cook.openCooking(g.state.activeId));
 
 for(const [language,name] of [['en','Kimchi stew'],['ja','キムチチゲ'],['ko','김치찌개']]){
  await p.evaluate(language=>{document.querySelector('dialog.cooking-dialog').close();g.state.uiLanguage=language;cook.openCooking(g.state.activeId)},language);
  await p.locator('.recipe-choice').filter({hasText:name}).click();
  assert.equal(await p.locator('.cooking-dialog ol li').count(),5);
  const b=await p.locator('.cooking-dialog').boundingBox();assert(b.x>=0&&b.x+b.width<=360&&b.y>=0&&b.y+b.height<=792);
 }
 await p.screenshot({path:'tmp/cooking472.png'});await p.locator('[data-cooking-start="kimchi_jjigae"]').click();
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].cooking?.active);
 const saved=await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId],j=c.cooking.active;const duration=j.endsAt-j.startedAt;j.startedAt=Date.now()-4000;j.endsAt=j.startedAt+duration;g.state.characterDirectives[c.id].journey=null;g.state.characterDirectives[c.id].endsAt=j.endsAt;await g.save(true);return {id:c.id,cost:j.cost,balance:c.wallet.balance,job:j.id}});
 await p.evaluate(()=>{window.DrawerVillageNavigation.go('settings')});assert.equal(await p.locator('[data-cooking-active]').count(),0);
 await p.reload();await p.waitForFunction(()=>window.photoQA);await setup();
 const resumed=await p.evaluate(saved=>{const c=g.state.characters[saved.id];g.state.activeId=saved.id;window.DrawerVillageNavigation.go('observe');return {job:c.cooking.active.id,balance:c.wallet.balance}},saved);assert.equal(resumed.job,saved.job);assert.equal(resumed.balance,saved.balance);
 await p.waitForFunction(()=>document.querySelector('[data-cooking-active]'));
 await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId];c.cooking.active.endsAt=Date.now()-1;g.state.characterDirectives[c.id].endsAt=Date.now()-1;window.DrawerVillageNavigation.go('observe');await g.save(true);cook.openCooking(c.id)});
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].cooking?.inventory.kimchi_jjigae===1);
 assert((await p.locator('.cooking-inventory').textContent()).includes('김치찌개 × 1'));
 await p.reload();await p.waitForFunction(()=>window.photoQA);await setup();assert.equal(await p.evaluate(id=>g.state.characters[id].cooking.inventory.kimchi_jjigae,saved.id),1);
 await p.evaluate(async()=>{
  const groups=await import('/groups.js?v=20260909dev305');
  const character=g.state.characters[g.state.activeId];
  const snap={activeGroupId:'qa472',group:{id:'qa472',name:'QA multiplayer',ownerUid:'qa',towns:[{id:'t',name:'Town',places:[]}]},groups:[],members:[{uid:'qa',displayName:'Tester',role:'owner'}],residents:[{id:'resident',ownerUid:'qa',name:'Resident QA',townId:'t',profileJson:JSON.stringify(character)}],homes:[],rules:{memberCharacterLimit:4}};
  window.ParallelCityAuth.getInfo=()=>({ready:true,user:{uid:'qa'},entitlements:{},guideState:{loaded:true,seen:[]}});
  window.DrawerVillageGroups={getSnapshot:()=>snap,setDetailActive(){}};
  window.DrawerVillageNavigation.go('groups');groups.showMultiplayerDetail();groups.selectManagementPane('');window.photoQA.render();
 });
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));await p.locator('[data-group-manage="residents"]').click({timeout:5000});
 await p.locator('[data-shared-resident-detail="resident"]').click();
 assert((await p.locator('.multiplayer-detail-scroll').textContent()).includes('Resident QA'));
 await p.locator('[data-shared-residents]').click();
 assert.equal(await p.locator('[data-shared-resident-detail="resident"]').count(),1);
 await p.screenshot({path:'tmp/residents472.png'});
 await p.locator('.multiplayer-detail-head [data-group-manage=""]').click();
 await p.locator('[data-group-manage="residents"]').waitFor({state:'visible'});
 assert.deepEqual(errors,[]);console.log('PASS 360px recipe book KO/EN/JA, step alignment, start, navigate away, persisted cost/job reload, completed inventory and once-only reload');
}finally{await browser.close();server.closeAllConnections();server.close()}
