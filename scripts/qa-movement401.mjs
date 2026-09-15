import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-movement401");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,process.env.QA_PACKAGED||".","."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const eventFor=(c,date=renderSceneDate||new Date())=>{", "const eventFor=(c,date=renderSceneDate||new Date())=>{if(window.qaForcedScene)return window.qaForcedScene;").replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;if(window.qaForcedScene)return window.qaForcedScene;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    if(process.env.QA_OLD_MOTION&&pathname==='/views.js')body=body.toString().replace('motionDelay.toFixed(3)','0');
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:400,height:960},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'?native-preview');await page.waitForFunction(()=>window.DrawerVillageNavigation&&window.ParallelCityAuth);
 await page.evaluate(async()=>{window.g=await import('/state.js?v='+document.querySelector('script[type=module][src]').src.split('v=')[1]);g.createCharacter(30);window.DrawerVillageNavigation.go('observe')});
 await page.evaluate(()=>{window.qaForcedScene={title:'산책',desc:'산책',minute:400,movementKind:'village-walk',home:false,townId:g.state.activeTownId};window.DrawerVillageNavigation.go('town')});
 await page.locator('.town-traveler').first().waitFor();
 for(let i=0;i<3;i++){
  await page.waitForTimeout(1200);const before=await page.locator('.town-traveler').first().boundingBox();await page.evaluate(()=>window.DrawerVillageNavigation.go('town'));await page.waitForTimeout(40);const after=await page.locator('.town-traveler').first().boundingBox();const distance=Math.hypot(after.x-before.x,after.y-before.y);assert(distance<5,'render reset moved walker '+distance+'px');
 }
 console.log('PASS401 actual CSS walking position continues across repeated town DOM renders without jumping back');
}finally{await browser.close();server.closeAllConnections();server.close()}
