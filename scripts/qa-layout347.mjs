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


for(const size of [{width:384,height:854},{width:1280,height:800}]){
 await page.setViewportSize(size);
 await page.evaluate(()=>{window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.state.characterPane='profile';g.state.characterOverviewPane='life';window.ParallelCity.mediaChanged()});
 await page.waitForTimeout(350);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.screenshot({path:resolve(output,'life347-'+size.width+'.png'),fullPage:true});
 await page.evaluate(()=>window.DrawerVillageNavigation.go('credits'));await page.waitForTimeout(200);
 assert.equal(await page.locator('.supporter-featured').count(),0);
 console.log(await page.locator('.supporter-page').evaluate(el=>({parents:el.parentElement.outerHTML.slice(0,120),background:getComputedStyle(el).background,color:getComputedStyle(el).color,head:getComputedStyle(el.firstElementChild).padding,tab:document.documentElement.dataset.activeTab})));const columns=await page.locator('.supporter-list').evaluate(el=>getComputedStyle(el).gridTemplateColumns).catch(()=>null);console.log('Credits columns',size.width,columns);
 await page.screenshot({path:resolve(output,'credits347-'+size.width+'.png'),fullPage:true});
}
await page.setViewportSize({width:384,height:854});
await page.evaluate(()=>{window.DrawerVillageNavigation.go('town');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});await page.waitForTimeout(350);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
const house=page.locator('[data-home-map]').first();await house.click();const enter=page.locator('[data-enter-home]').first();await enter.waitFor();const id=await enter.getAttribute('data-enter-home');const active=await page.evaluate(()=>g.state.activeId);await enter.click();
assert.equal(await page.evaluate(()=>g.state.activeTab),'home');assert.equal(await page.evaluate(()=>g.state.activeId),active);console.log('PASS enter house without changing active character',id);
assert(!errors.length,errors.join('\n'));
}finally{await browser.close();server.close()}
