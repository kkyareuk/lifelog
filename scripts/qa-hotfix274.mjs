import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-274");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    const body=pathname==="/auth.js"?previewAuth:await readFile(file);
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const context=await browser.newContext({viewport:{width:384,height:854},serviceWorkers:'block'});await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 const page=await context.newPage();page.setDefaultTimeout(10000);await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 const ids=await page.evaluate(async()=>{const g=await import('/state.js?v=20260908hotfix274');g.resetAll();const a=g.createCharacter(10),b=g.createCharacter(10),town=g.addTown(10),c=g.createCharacter(10);g.switchTown(g.state.characters[a].townId);g.state.activeId=a;g.state.activeTab='observe';g.save(true);for(const tab of ['observe','character'])await window.ParallelCityAuth.markGuideSeen(tab);return{a,b,c,town}});
 await page.reload();await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async(id)=>{const g=await import('/state.js?v=20260908hotfix274'),sim=await import('/simulation.js?v=20260908hotfix274'),c=g.state.characters[id];sim.eventFor(c);const now=new Date(),key=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;Object.defineProperty(c.days[key],'signature',{configurable:true,get(){throw new Error('injected scene failure')}});window.ParallelCity.mediaChanged()},ids.a);
 await page.locator('[data-open-game-hud-roster]').click();await page.locator(`[data-home-character="${ids.b}"]`).click();
 assert.equal(await page.evaluate(async()=>(await import('/state.js?v=20260908hotfix274')).state.activeId),ids.b);
 await page.locator('[data-open-game-hud-roster]').click();await page.locator(`[data-observe-town="${ids.town}"]`).click();assert.equal(await page.evaluate(async()=>(await import('/state.js?v=20260908hotfix274')).state.activeTownId),ids.town);
 await page.screenshot({path:resolve(output,'town-navigation-after-scene-failure.png')});
 await page.evaluate(()=>{location.hash='tab=character'});await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='character');
 console.log('PASS browser: failing resident does not block character switch, town switch or settings');
 await page.evaluate(async id=>{const g=await import('/state.js?v=20260908hotfix274');for(const day of Object.values(g.state.characters[id].days||{}))delete day.signature;},ids.a);
 const itemId=await page.evaluate(async()=>{const g=await import('/state.js?v=20260908hotfix274');return g.addCatalogItem('drink',{name:'검사용 소다',category:'소다'})});
 await page.evaluate(()=>{location.hash='tab=catalog'});
 await page.locator(`[data-dict-open="${itemId}"]`).click();
 assert.equal(await page.locator('[data-dict-field="spicy"]').count(),0);
 await page.locator('[data-dict-field="carbonation"]').selectOption('3');
 await page.locator('[data-dict-field="acidity"]').selectOption('2');
 await page.locator('[data-dict-field="caffeine"]').selectOption('없음');
 await page.locator('[data-dict-save]').click();
 await page.locator(`[data-dict-open="${itemId}"]`).waitFor();
 await page.reload();await page.waitForFunction(()=>window.ParallelCity);
 const saved=await page.evaluate(async id=>(await import('/state.js?v=20260908hotfix274')).state.catalog.drink.find(x=>x.id===id),itemId);
 assert.equal(saved.carbonation,3);assert.equal(saved.acidity,2);assert.equal(saved.caffeine,'없음');
 console.log('PASS drink editor: no spice, carbonation/acidity/caffeine survive save and reload');

 await page.evaluate(()=>{location.hash='tab=character'});await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='character');
 await page.evaluate(async()=>{const g=await import('/state.js?v=20260908hotfix274');g.state.characterSettingsView='full';g.state.characterPane='personality';g.state.characterPersonalityPane='emotion';window.ParallelCity.mediaChanged()});
 const touch=page.locator('[data-field="touchReaction"]:visible').first();await touch.selectOption({label:'간지럼을 잘 탐'});
 await page.locator('[data-open-cognitive-traits]:visible').first().click();
 const dialog=page.locator('[data-cognitive-traits-dialog][open]');await dialog.waitFor();
 const clipping=await dialog.locator('[data-trait-expression]').evaluateAll(buttons=>buttons.map(b=>{const text=b.querySelector('span'),r=text.getBoundingClientRect(),outer=b.getBoundingClientRect();return{label:text.textContent,ok:r.top>=outer.top-1&&r.bottom<=outer.bottom+1&&b.scrollHeight<=b.clientHeight+2}}).filter(x=>!x.ok));assert.deepEqual(clipping,[]);
 await page.screenshot({path:resolve(output,'cognitive-options274.png')});await dialog.locator('button[value="apply"]').click();
 const contact=await page.evaluate(async()=>{const g=await import('/state.js?v=20260908hotfix274');return g.state.characters[g.state.activeId].touchReaction});assert.equal(contact,'간지럼을 잘 탐');
 console.log('PASS long cognitive options fit vertically and contact response is editable');
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.evaluate(async()=>{window.ParallelCityAuth.readCharacterCode=async()=>({character:{name:'코드로 받은 캐릭터',photo:'https://example.com/photo.png',ldImage:'https://example.com/ld.png'}});const {characterCodeDialog}=await import('/character-code.js?v=20260908hotfix274');await characterCodeDialog('character-code-import',()=>20,()=>{},()=>{})});
 await page.locator('.character-code-dialog input').fill('ABCDEF-123456-ABCDEF');await page.getByRole('button',{name:'캐릭터 확인',exact:true}).click();await page.getByRole('button',{name:'사진과 함께 불러오기',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.ParallelCity.getState().characters[window.ParallelCity.getState().activeId].ldImage),'https://example.com/ld.png');
 console.log('PASS code preview and import button retain LD photos');

}finally{await browser.close();server.close()}
