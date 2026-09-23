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




 await p.evaluate(async()=>{window.cook=await import('/cooking-ui.js');window.vis=await import('/cooking-animation.js');window.recipes=(await import('/recipes.js')).RECIPES;const c=g.state.characters[g.state.activeId];c.name='요리 테스트';c.cooking={experience:80,experienceVersion:2,active:{id:'anim485',recipeId:recipes.find(r=>r.steps.some(s=>s[0]==='cut'&&s[1].includes('당근'))).id,recipeVersion:472,startedAt:Date.now()-1000,endsAt:Date.now()+360000,stepDurations:[60000,60000,60000,60000,60000,60000]}};window.DrawerVillageNavigation.go('observe');cook.syncCookingUI()});
 await p.waitForSelector('.cooking-animation');
 const before=await p.locator('.cooking-animation').getAttribute('data-frame-key');await p.evaluate(()=>document.querySelector('.cooking-animation').dataset.retained='yes');await p.waitForTimeout(650);assert.equal(await p.locator('.cooking-animation').getAttribute('data-retained'),'yes','Do not recreate animation on each UI tick');
 await p.evaluate(()=>{const host=document.querySelector('[data-game-hud-moment]'),r={id:'visualtest',name:'채소 요리',ing:['carrot','onion','egg','milk'],steps:[['cut','당근과 양파를 썰고 있어요']]};vis.syncCookingAnimation(host,{recipe:r,step:0},'ko','qa485')});
 assert.equal(await p.locator('.cook-ingredient').count(),2);assert(await p.locator('.cooking-animation').getAttribute('aria-label').then(t=>t.includes('당근')&&t.includes('양파')&&!t.includes('우유')));
 const bounds=await p.locator('.cooking-animation').boundingBox(),card=await p.locator('[data-game-hud-moment]').boundingBox();assert(bounds.y>=0);assert(bounds.x>=0);assert(bounds.x+bounds.width<=360);assert(bounds.y+bounds.height<card.y);assert.equal(await p.locator('.cooking-animation').evaluate(n=>getComputedStyle(n).pointerEvents),'none');
 await p.screenshot({path:'tmp/cooking485'+(process.argv.includes('--webkit')?'-webkit':'')+'.png'});
 for(const [kind,desc,motion] of [['mix','우유와 달걀을 섞고 있어요','mix'],['cook','당근을 웍에 볶고 있어요','wok'],['cook','당근을 기름에 튀기고 있어요','fry'],['cook','당근을 끓이고 있어요','boil'],['mix','우유로 휘핑을 만들고 있어요','whip'],['plate','크림으로 장식하고 있어요','decorate']]){await p.evaluate(({kind,desc,motion})=>{vis.syncCookingAnimation(document.querySelector('[data-game-hud-moment]'),{recipe:{id:motion,name:motion,ing:['carrot','onion','egg','milk'],steps:[[kind,desc]]},step:0},'en','qa485')},{kind,desc,motion});assert.equal(await p.locator('.cooking-animation').getAttribute('data-cooking-motion'),motion)}
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.cook-tool').evaluate(n=>getComputedStyle(n).animationName),'none');
 await p.evaluate(()=>vis.syncCookingAnimation(document.querySelector('[data-game-hud-moment]'),{complete:true},'ko'));assert.equal(await p.locator('.cooking-animation').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS485: actual cooking UI, stable animation nodes, correct step ingredients, log-above placement, pointer safety, 7 motions, reduced motion, completion cleanup');
}finally{await browser.close();server.closeAllConnections();server.close()}
