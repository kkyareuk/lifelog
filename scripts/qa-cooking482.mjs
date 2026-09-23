import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,8,23,11,0));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));


 await p.evaluate(async()=>{window.cook=await import('/cooking.js');window.custom=await import('/catalog-recipes.js');window.cookUI=await import('/cooking-ui.js');g.state.catalog.food=[{id:'soup482',name:'우리집 특별 국',category:'한식',subtype:'국물',price:'비쌈'},{id:'salad482',name:'작은 샐러드',category:'양식',subtype:'샐러드',price:'매우 저렴'}];cookUI.openCooking()});
 for(const language of ['ko','en','ja']){
  await p.evaluate(lang=>{document.querySelectorAll('.cooking-dialog').forEach(d=>d.remove());g.state.uiLanguage=lang;cookUI.openCooking()},language);
  for(const value of ['level','price']){await p.locator('.cooking-dialog nav select').nth(1).selectOption(value);const ids=await p.locator('.recipe-choice').evaluateAll(es=>es.map(e=>e.dataset.recipeId));assert(ids.length>100);assert(ids[0].startsWith('catalog-food:')&&ids[1].startsWith('catalog-food:'));assert(!ids[2].startsWith('catalog-food:'));}
  await p.locator('[data-recipe-id="catalog-food:soup482"]').click();assert.equal(await p.locator('[data-cooking-start="catalog-food:soup482"]').isEnabled(),true);assert.equal(await p.locator('.recipe-detail ol li').count(),4);
 }
 await p.evaluate(()=>{document.querySelectorAll('.cooking-dialog').forEach(d=>d.remove());g.state.uiLanguage='ko';cookUI.openCooking()});
 await p.locator('.cooking-dialog input[type=search]').fill('특별');assert.equal(await p.locator('.recipe-choice').count(),1);await p.locator('.recipe-choice').click();
 const before=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId];return c.wallet?.balance||500000});await p.locator('[data-cooking-start]').click();await p.waitForFunction(()=>!!g.state.characters[g.state.activeId].cooking?.active);
 const result=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId],job=c.cooking.active;g.state.catalog.food=[];const progress=cook.cookingProgress(job,job.startedAt+1000);const finish=cook.finishCooking(g.state,c,job.endsAt);return {balance:c.wallet.balance,progress:progress.recipe.name,finish,dish:c.cooking.dishes[0],again:cook.finishCooking(g.state,c,job.endsAt)}});
 assert.equal(before-result.balance,11300);assert(result.finish&&!result.again);assert.equal(result.progress,'우리집 특별 국');assert.equal(result.dish.recipeSnapshot.name,'우리집 특별 국');
 const checks=await p.evaluate(async()=>{const rows=['매우 저렴','저렴','보통','비쌈','매우 비쌈'].map(price=>custom.catalogFoodCost({category:'양식',subtype:'구이',price}).out);const w={catalog:{food:[{id:'x',name:'공유 요리',category:'한식'}]}};return {rows,valid:!!cook.recipeById('catalog-food:x',w),isolated:!cook.recipeById('catalog-food:x',{catalog:{food:[]}}),invalid:!custom.catalogRecipe({id:'bad'}),finite:Number.isFinite(custom.catalogFoodCost({price:'invalid'}).home)}});
 assert(checks.rows.every((v,i)=>!i||v>checks.rows[i-1]));assert.equal(checks.rows.at(-1),11);assert(checks.valid&&checks.isolated&&checks.invalid&&checks.finite);
 await p.evaluate(()=>{g.state.catalog.food=[{id:'price482',name:'가격 테스트',category:'양식',subtype:'구이',price:'보통'}];window.DrawerVillageNavigation.go('catalog')});
 await p.locator('[data-dict-open="price482"]').click();const preview=p.locator('[data-food-price-preview]');assert((await preview.textContent()).includes('25,200'));
 await p.locator('[data-dict-field="price"]').selectOption('매우 비쌈');assert((await preview.textContent()).includes('110,000'));
 await p.screenshot({path:'tmp/custom-price482'+(process.argv.includes('--webkit')?'-webkit':'')+'.png'});
 assert.deepEqual(errors,[]);console.log('PASS482: custom-first both sorts; KO/EN/JA; search; cooking payment, completion and preserved deleted recipe; world isolation; price bands and cap');
}finally{await browser.close();server.closeAllConnections();server.close()}
