import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-287");
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
 const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,serviceWorkers:'block'});await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const page=await context.newPage();await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(x=>/\/state\.js\?/.test(x.name)).name;window.g=await import(url);g.resetAll();for(let i=0;i<12;i++){g.createCharacter(20);g.state.characters[g.state.activeId].name='Profile '+i}window.ParallelCityAuth.getInfo=()=>({ready:true,user:null,guideState:{loaded:true,seen:['observe','character']}});window.DrawerVillageNavigation.go('observe')});
 await page.waitForTimeout(500);const cdp=await context.newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 await page.evaluate(()=>{g.flushSave(false);window.qaSelectionSaves=0;window.addEventListener('parallel-city-saved',()=>qaSelectionSaves++)});
 const times=await page.evaluate(()=>{const out=[];for(let i=0;i<8;i++){const buttons=[...document.querySelectorAll('[data-home-character]')],b=buttons.find(x=>x.dataset.homeCharacter!==g.state.activeId);const t=performance.now();b.click();out.push(performance.now()-t)}return out});
 await page.waitForTimeout(1600);assert.equal(await page.evaluate(()=>qaSelectionSaves),0,'View-only selection does not request cloud save');
 assert.ok(await page.locator('.game-hud-profile img').evaluateAll(images=>images.every(i=>i.loading==='eager')));
 assert.ok(await page.locator('img.native-main-character,.native-main-character img,.native-scene-lineup-person img').evaluateAll(images=>images.every(i=>i.loading==='eager')));
 console.log('PASS profile switching avoids cloud-save events and prioritizes current portraits');
 const {profile}=await cdp.send('Profiler.stop');const counts=new Map();for(const id of profile.samples||[])counts.set(id,(counts.get(id)||0)+1);console.log(JSON.stringify({times,top:profile.nodes.map(n=>({name:n.callFrame.functionName,url:n.callFrame.url.split('/').at(-1),line:n.callFrame.lineNumber,count:counts.get(n.id)||0})).sort((a,b)=>b.count-a.count).slice(0,14)}));
}finally{await browser.close();await new Promise(done=>server.close(done))}
