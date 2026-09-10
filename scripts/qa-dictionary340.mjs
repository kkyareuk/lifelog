import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-dictionary340");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:360,height:840}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);game.createCharacter(10);
 window.fixture={activeGroupId:'g',groups:[{id:'g',name:'함께 사는 마을'}],group:{id:'g',ownerUid:'host'},members:[{id:'host',role:'owner'}],catalog:[{id:'drink',items:[{id:'tea',name:'홍차',image:'./assets/dictionary/ink.webp'}]}]};
 const auth=window.ParallelCityAuth.getInfo();window.ParallelCityAuth.getInfo=()=>({...auth,user:{uid:'host'},ready:true,cloudChecked:true});
 window.DrawerVillageGroups={getSnapshot:()=>fixture,select:id=>{fixture.activeGroupId=id;window.dispatchEvent(new Event('drawer-village-groups'))},saveCatalogItem:async input=>{window.saved=input;fixture.catalog[0].items=input.remove?[]:[input.item];return {saved:true}}};window.DrawerVillageNavigation.go('catalog');
 });
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 assert.equal(await page.locator('[data-dict-open="tea"]').count(),1);assert.equal(await page.locator('[data-dict-place]').count(),0);
 const scopes=await page.locator('.dictionary-scopes').boundingBox(),kinds=await page.locator('.dictionary-kinds').boundingBox();assert(scopes.y<kinds.y);
 await page.screenshot({path:resolve(output,'shared-list.png'),fullPage:true});
 await page.waitForTimeout(400);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-dict-open="tea"]').click();await page.locator('[data-dict-field="name"]').fill('새 홍차');await page.locator('[data-dict-save]').click();assert.equal(await page.evaluate(()=>saved.item.name),'새 홍차');assert.equal(await page.evaluate(()=>Object.values(game.state.catalog).flat().some(i=>i.name==='새 홍차')),false);
 await page.locator('[data-dict-scope=""]').click();assert.equal(await page.locator('[data-dict-open="tea"]').count(),0);
 await page.locator('[data-dict-scope="g"]').click();await page.evaluate(()=>{fixture.members=[{id:'host',role:'member'}];fixture.group.ownerUid='other';window.DrawerVillageNavigation.go('catalog')});assert.equal(await page.locator('[data-dict-add]').count(),0);await page.locator('[data-dict-open="tea"]').click();assert(await page.locator('[data-dict-field="name"]').isDisabled());
 const rules=await page.evaluate(async()=>{const module=await import('/groups.js?v=20260909dev305');fixture.groups=[fixture.group];fixture.members[0].uid="host";module.showMultiplayerDetail();module.selectManagementPane('rules');const rules=module.renderGroups();module.selectManagementPane('story');return {rules,story:module.renderGroups()}});assert(rules.rules.includes('group-rule-summary'));assert(!rules.rules.includes('data-group-rules'));assert(rules.story.includes('준비 중인 기능입니다.'));
 assert(!errors.length,errors.join('\n'));console.log('PASS shared cards, scope/category order, save isolation, personal switch, member read-only');
}finally{await browser.close();server.close()}
