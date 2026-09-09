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
 const page=await browser.newPage({viewport:{width:384,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);game.createCharacter(10);DrawerVillageNavigation.go('character');});
 await page.locator('[data-export-profile]:visible').first().click();
 assert.deepEqual(await page.locator('.profile-export-options > button').allTextContents(),['공유 코드 만들기','공유 코드로 불러오기','PNG 증명서이미지 파일로 바로 저장','PDF 증명서같은 문서를 PDF로 저장·인쇄']);
 await page.locator('dialog[open] button[value=cancel]').click();
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;const game=await import(url);window.openHomeShare=async()=>{const m=await import(url.replace('/state.js?','/world-transfer.js?'));await m.worldTransferDialog({kind:'home',homeId:Object.keys(game.state.homes)[0],render:()=>{},toast:()=>{},limits:()=>({characterLimit:10,townLimit:10})})};await openHomeShare()});
 const dialog=page.locator('.world-transfer-dialog');await dialog.waitFor();assert.ok(await dialog.evaluate(e=>e.getBoundingClientRect().right<=innerWidth));
 await page.evaluate(()=>{window.qaPublish=[];const base=window.DrawerVillageGroups||{getSnapshot:()=>({groups:[]})};window.DrawerVillageGroups={...base,publishWorldCode:async p=>{qaPublish.push(p);return {code:'ABCDEF123456ABCDEF'}}}});
 // Reopen so the dialog captures the stubbed API.
 await dialog.getByRole('button',{name:'닫기',exact:true}).click();await page.evaluate(()=>openHomeShare());
 assert.equal(await dialog.getByRole('button',{name:'선택한 내 마을을 멀티로 옮기기',exact:true}).count(),0);assert.equal(await dialog.locator(':scope > select').first().isVisible(),false);await dialog.getByRole('button',{name:'공유 코드 만들기',exact:true}).click();await page.waitForFunction(()=>qaPublish.length===1);await page.waitForTimeout(50);assert.equal(await dialog.locator('section input').inputValue(),'ABCDEF-123456-ABCDEF');assert.equal(await page.evaluate(()=>qaPublish[0].kind),'home');
 await dialog.getByRole('button',{name:'닫기',exact:true}).click();await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>openHomeShare());assert.ok(await dialog.evaluate(e=>e.getBoundingClientRect().width<=560));
 await dialog.getByRole('button',{name:'닫기',exact:true}).click();
 await page.evaluate(()=>{game.createCharacter(10);DrawerVillageNavigation.go('relationship')});
 await page.locator('[data-open-view-dialog]').first().click();
 const view=page.locator('[data-view-dialog][open]'),field=view.locator('[data-character-view]').first();const options=await field.locator('option').evaluateAll(os=>os.map(o=>o.value));await field.selectOption(options[1]);await view.locator('[data-copy-view]').click();await field.selectOption(options[0]);await view.locator('[data-paste-view]').click();assert.equal(await field.inputValue(),options[1]);assert.equal(await page.locator('[data-share-kind="relationships"]').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS exact four profile actions, phone/tablet transfer dialog fit, home code publishing and code display');
}finally{await browser.close();server.close()}
