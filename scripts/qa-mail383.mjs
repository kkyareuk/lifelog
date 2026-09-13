import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-mail383");
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
 const page=await browser.newPage({viewport:{width:384,height:854}});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.addLocatorHandler(page.locator('dialog.page-guide[open]'),async()=>{await page.locator('dialog.page-guide[open] button').last().click()});await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);

 for(const language of ['ko','en','ja']){
 await page.evaluate(async language=>{
 const g=await import('/state.js?v=20260909dev305'),m=await import('/mailbox-center.js?v=20260909dev305');g.state.uiLanguage=language;g.state.activeTab='mailbox';
 if(!g.state.order.length)g.createCharacter(10);
 g.state.catalog.idol=[{id:'band-test',name:'QA Band'}];g.state.catalog.hobby=[{id:'hobby-test',name:'QA Hobby'}];
 window.DrawerVillageGroups={getSnapshot:()=>({}),refreshMailbox:()=>Promise.resolve()};
 const render=()=>{document.body.innerHTML=m.renderMailbox();m.bindMailbox(render,()=>{})};render();
 },language);
 await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
 await page.locator('[data-mail-folder="compose"]').click();
 for(const [kind,name,id] of [['idol','QA Band','band-test'],['hobby','QA Hobby','hobby-test']]){
 await page.locator('[data-mail-gift-picker]').click();
 await page.locator('.catalog-selection-card').filter({hasText:name}).locator('input').check();
 await page.locator('.catalog-selection-controls button').last().click();
 assert.equal(await page.locator('select[name="gift"]').inputValue(),kind+'|'+id);
 assert((await page.locator('[data-mail-gift-preview]').innerText()).includes(name));
 }
 }

 await page.evaluate(async()=>{
 const g=await import('/state.js?v=20260909dev305'),m=await import('/mail-gifts.js?v=20260909dev305');g.state.uiLanguage='ko';
 window.ParallelCityAuth={getInfo:()=>({user:{uid:'recipient'}}),upload:async()=>true};
 window.DrawerVillageGroups.respondMailGift=async()=>({status:'accepted',gift:{kind:'hobby',item:{id:'received-test',name:'작은 수채화 도구',giftFrom:'모리모'}}});
 const d=document.createElement('dialog');d.className='mail-reader mail-letter';d.innerHTML='<div class="mail-letter-content"><div class="mail-reader-heading"><h2>작은 선물을 보냈어요</h2></div><div class="mail-address"><span>보낸 이<b>모리모</b></span><span>받는 이<b>나</b></span></div><p>그림 그릴 때 생각나서 골랐어요.</p></div>';
 document.body.append(d);m.bindGiftReceipt(d,{id:'gift-test',groupId:'g',recipientUid:'recipient',gift:{kind:'hobby',status:'pending',item:{id:'received-test',name:'작은 수채화 도구',giftFrom:'모리모'}}},'recipient',()=>{});d.showModal();
 });
 await page.screenshot({path:resolve(output,'gift-receipt-mobile.png')});
 assert(await page.locator('.mail-gift-accept').isVisible());await page.locator('.mail-gift-accept').click();
 assert(await page.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.catalog.hobby.some(i=>i.id==='received-test'&&i.giftFrom==='모리모')}));
 console.log('PASS KO EN JA real gift picker idol/band and hobby selection reaches mail form');
}finally{await browser.close();server.close()}
