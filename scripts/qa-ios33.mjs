import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-web334");
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
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);window.views=await import(url.replace('/state.js?','/views.js?'));window.credits=await import(url.replace('/state.js?','/supporter-credits.js?'));game.createCharacter(10);game.state.activeTab='settings';game.state.settingsPane='home';views.renderApp(game.state)});


 for(const lang of ['ko','en','ja'])for(const size of [{width:440,height:956},{width:1024,height:1366}]){
 await page.setViewportSize(size);await page.evaluate(lang=>{game.state.uiLanguage=lang;window.PARALLEL_CITY_CONFIG.iosApp=true;window.PARALLEL_CITY_CONFIG.appleBilling={enabled:true};game.state.activeTab='shop';views.renderApp(game.state);},lang);
 assert.equal(await page.locator('[data-drawer-shop-tab]').first().getAttribute('data-drawer-shop-tab'),'base');assert.equal(await page.locator('[data-play-purchase]').count(),3);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());localStorage.removeItem('drawer-village-guide-home');window.DrawerVillageNavigation.go('home')});
 await page.locator('dialog.page-guide').waitFor();assert(await page.locator('dialog.page-guide').evaluate(d=>d.matches(':modal')));await page.screenshot({path:resolve(output,'ios33-guide.png')});console.log('PASS iPhone/iPad KO/EN/JA: base shop first, three products, no horizontal overflow, guide top layer');
}finally{await browser.close();server.close()}
