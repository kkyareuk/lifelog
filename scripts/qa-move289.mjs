import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-289");
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
 const page=await browser.newPage({viewport:{width:384,height:820}});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);await page.waitForTimeout(600);
 await page.evaluate(async()=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  const g=await import('/state.js?v=20260909dev289'),w=await import('/shared-world.js?v=20260909dev289'),v=await import('/shared-residents.js?v=20260909dev289'),ui=await import('/shared-ui.js?v=20260909dev289');
  g.state.characters={a:{id:'a',name:'개인1',townId:'t1',icon:'./assets/home-ui/mailbox.png'},b:{id:'b',name:'개인2',townId:'t2'},c:{id:'c',name:'안테',townId:'t1'}};g.state.order=['a','b','c'];g.state.towns=[{id:'t1',name:'내 마을'},{id:'t2',name:'바닷가 마을'}];
  const snap={activeGroupId:'g',group:{id:'g',name:'목적지',ownerUid:'me',towns:[{id:'t'}]},residents:[{id:'remote',sourceCharacterId:'c',name:'안테',ownerUid:'me',townId:'t'}],homes:[],members:[]};window.ParallelCityAuth.getInfo=()=>({user:{uid:'me'},guideState:{loaded:true,seen:['observe','town','groups','home']}});window.qaCalls=[];window.DrawerVillageGroups={getSnapshot:()=>snap,requestAdmission:async id=>{qaCalls.push(id);if(id==='b'&&!window.qaRetry)throw Error('offline test');return {status:'accepted'}}};w.sharedSelection(snap).residentForm='admission';w.sharedSelection(snap).moveCandidates=[{id:'group:other:remote',name:'다른 멀티 인물',originName:'친구 그룹 · 숲 마을'}];
  document.documentElement.dataset.activeTab='town';document.documentElement.classList.add('native-app');document.querySelector('#app').innerHTML='<main><div class="mobile-town-shell"></div></main>';document.querySelector('.mobile-town-shell').innerHTML=w.withSharedWorld(snap,()=>v.sharedResidentsScreen(snap));ui.bindSharedUi({render:()=>{},toast:()=>{}});
 });
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 assert.deepEqual(await page.locator('.residence-move-card b').allTextContents(),['개인1','개인2','다른 멀티 인물']);assert.deepEqual(await page.locator('.residence-move-card small').allTextContents(),['내 마을','바닷가 마을','친구 그룹 · 숲 마을']);
 assert.equal(await page.locator('.residence-move-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3);
 console.log(await page.locator('.residence-move-art img').evaluate(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,css:getComputedStyle(e).height,parent:e.parentElement.getBoundingClientRect().height})));await page.screenshot({path:resolve(output,'move-picker289.png')});
 assert.ok(await page.locator('.residence-move-art img').evaluate(e=>e.getBoundingClientRect().height<=70));await page.screenshot({path:resolve(output,'move-picker289.png')});
 await page.locator('input[value="group:other:remote"]').check();await page.locator('[data-residence-request] [type=submit]').click();await page.waitForSelector('dialog[open]');assert.match(await page.locator('dialog[open]').textContent(),/친구 그룹 · 숲 마을/);await page.locator('dialog[open] button').filter({hasText:'취소'}).click();assert.deepEqual(await page.evaluate(()=>qaCalls),[]);await page.locator('input[value="group:other:remote"]').uncheck();
 await page.locator('input[value=a]').check();await page.locator('input[value=b]').check();await page.locator('[data-residence-request] [type=submit]').click();await page.waitForFunction(()=>qaCalls.length===2);await page.waitForTimeout(80);
 assert.ok(await page.locator('input[value=a]').isDisabled());assert.ok(await page.locator('input[value=b]').isChecked());await page.evaluate(()=>window.qaRetry=true);await page.locator('[data-residence-request] [type=submit]').click();await page.waitForFunction(()=>qaCalls.length===3);assert.deepEqual(await page.evaluate(()=>qaCalls),['a','b','b']);
 console.log('PASS three columns, origin labels, multi-select and retry excludes completed characters');
}finally{await browser.close();server.close()}
