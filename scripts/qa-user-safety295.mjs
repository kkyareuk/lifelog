import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-293");
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
 const page=await browser.newPage({viewport:{width:360,height:840}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.qaBlocks=[];window.qaReports=[];window.ParallelCityAuth={getInfo:()=>({ready:true,user:{uid:'a'}})};window.DrawerVillageGroups={getSnapshot:()=>({activeGroupId:'g'}),readSafety:async()=>({blocked:qaBlocks}),setUserBlock:async input=>{qaBlocks=input.block===false?[]:[{uid:'b',name:'상대'}];return {blocked:qaBlocks}},reportContent:async input=>{qaReports.push(input);return {id:'saved'}}};const b=document.createElement('button');b.dataset.userSafety='b';b.dataset.safetyGroup='g';b.textContent='신고·차단';document.body.append(b)});
 await page.locator('[data-user-safety]').click();await page.getByRole('button',{name:'신고하기',exact:true}).click();await page.locator('.user-safety-dialog select').selectOption('harassment');await page.locator('.user-safety-dialog textarea').fill('부적절한 사진');await page.locator('.user-safety-dialog form button').click();await page.waitForFunction(()=>qaReports.length===1);assert.ok((await page.locator('.user-safety-dialog').innerText()).includes('접수'));await page.getByRole('button',{name:'계정 차단',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.user-safety-dialog'));
 assert.equal(await page.evaluate(()=>DrawerVillageSafety.filterSnapshot({activeGroupId:'another',residents:[{id:'new',ownerUid:'b'},{id:'mine',ownerUid:'a'}]}).residents.length),1);
 await page.evaluate(()=>{const b=document.createElement('button');b.dataset.safetyManage='';b.textContent='차단 관리';document.body.append(b)});await page.locator('[data-safety-manage]').last().click();await page.getByRole('button',{name:'차단 해제',exact:true}).click();await page.waitForFunction(()=>qaBlocks.length===0);assert.ok((await page.locator('.user-safety-dialog').innerText()).includes('차단한 계정이 없어요'));await page.screenshot({path:resolve(output,'account-safety295.png')});assert.deepEqual(errors,[]);console.log('PASS mobile report receipt, account block, different group/new character hiding, unblock and dialog bounds');
}finally{await browser.close();server.close()}
