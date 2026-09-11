import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-context339");
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
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();window.DrawerVillageNavigation.go('home')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

await page.evaluate(async()=>{
 window.mail=await import('/mailbox-center.js');window.fakeMail={incomingMail:[{id:'old',groupId:'g',senderUid:'a',recipientUid:'b',subject:'오래된 편지',body:'본문',createdAt:1},{id:'notice',groupId:'g',senderUid:'a',recipientUid:'b',subject:'공지사항',body:'항상 보여요',announcement:true,createdAt:2}],outgoingMail:[]};
 window.ParallelCityAuth.getInfo=()=>({user:{uid:'b'}});window.deleted=[];window.DrawerVillageGroups={};window.DrawerVillageGroups.getSnapshot=()=>fakeMail;window.DrawerVillageGroups.refreshMailbox=async()=>{};window.DrawerVillageGroups.deleteMail=async input=>deleted.push(input);
 window.drawMail=()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.innerHTML=mail.renderMailbox();mail.bindMailbox(drawMail,console.log)};g.state.activeTab='mailbox';drawMail();
});
assert.equal(await page.locator('[data-select-mail]').count(),0);await page.locator('[data-mail-open="notice"]').click();assert.equal(await page.locator('[data-user-safety]').count(),0);await page.locator('[data-close-mail]').click();
await page.locator('[data-mail-folder="inbox"]').click();assert.equal(await page.locator('[data-select-mail]').count(),1);await page.locator('[data-select-mail]').check();page.on('dialog',d=>d.accept());await page.locator('[data-mail-delete]').click();await page.waitForFunction(()=>deleted.length===1);assert.equal(await page.locator('[data-mail-open="old"]').count(),0);await page.locator('[data-mail-folder="notices"]').click();assert.equal(await page.locator('[data-mail-open="notice"]').count(),1);
await page.screenshot({path:resolve(output,'mail348-phone.png'),fullPage:true});
for(const language of ['en','ja']){await page.evaluate(lang=>{g.state.uiLanguage=lang;drawMail()},language);assert.equal(await page.locator('[data-mail-delete]').count(),0)}
assert.deepEqual(errors,[]);console.log('PASS old mail, notice cannot select/delete/block, selected deletion, notice remains, KO/EN/JA');
}finally{await browser.close();server.close()}

