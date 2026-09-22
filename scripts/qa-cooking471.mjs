import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 const setup=()=>p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.cook=await import('/cooking-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});await setup();
 await p.evaluate(()=>{g.state.activeId=g.createCharacter();g.state.activeTab='observe';window.DrawerVillageNavigation.go('observe');cook.openCookbook(g.state.activeId)});
 assert.equal(await p.locator('.recipe-choice').count(),100);
 for(const [language,name] of [['en','Kimchi stew'],['ja','キムチチゲ'],['ko','김치찌개']]){
  await p.evaluate(language=>{document.querySelector('dialog.cooking-dialog').close();g.state.uiLanguage=language;cook.openCookbook(g.state.activeId)},language);
  await p.locator('.recipe-choice').filter({hasText:name}).click();
  assert.equal(await p.locator('.cooking-dialog ol li').count(),11);
  const b=await p.locator('.cooking-dialog').boundingBox();assert(b.x>=0&&b.x+b.width<=360&&b.y>=0&&b.y+b.height<=792);
 }
 await p.screenshot({path:'tmp/cookbook471.png'});await p.locator('[data-cooking-start="kimchi_jjigae"]').click();
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].cooking?.active);
 const saved=await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId],j=c.cooking.active;const duration=j.endsAt-j.startedAt;j.startedAt=Date.now()-4000;j.endsAt=j.startedAt+duration;g.state.characterDirectives[c.id].journey=null;g.state.characterDirectives[c.id].endsAt=j.endsAt;await g.save(true);return {id:c.id,cost:j.cost,balance:c.wallet.balance,job:j.id}});
 await p.evaluate(()=>{window.DrawerVillageNavigation.go('settings')});assert.equal(await p.locator('.cooking-step-progress').count(),0);
 await p.reload();await p.waitForFunction(()=>window.photoQA);await setup();
 const resumed=await p.evaluate(saved=>{const c=g.state.characters[saved.id];g.state.activeId=saved.id;window.DrawerVillageNavigation.go('observe');return {job:c.cooking.active.id,balance:c.wallet.balance}},saved);assert.equal(resumed.job,saved.job);assert.equal(resumed.balance,saved.balance);
 await p.waitForFunction(()=>document.querySelector('.cooking-step-progress'));
 await p.evaluate(async()=>{const c=g.state.characters[g.state.activeId];c.cooking.active.endsAt=Date.now()-1;g.state.characterDirectives[c.id].endsAt=Date.now()-1;window.DrawerVillageNavigation.go('observe');await g.save(true);cook.openCookbook(c.id)});
 await p.waitForFunction(()=>g.state.characters[g.state.activeId].cooking?.inventory.kimchi_jjigae===1);
 assert((await p.locator('.cooking-inventory').textContent()).includes('김치찌개 × 1'));
 await p.reload();await p.waitForFunction(()=>window.photoQA);await setup();assert.equal(await p.evaluate(id=>g.state.characters[id].cooking.inventory.kimchi_jjigae,saved.id),1);
 assert.deepEqual(errors,[]);console.log('PASS 360px recipe book KO/EN/JA, step alignment, start, navigate away, persisted cost/job reload, completed inventory and once-only reload');
}finally{await browser.close();server.closeAllConnections();server.close()}
