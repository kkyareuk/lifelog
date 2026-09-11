import {execFileSync} from "node:child_process";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-performance344");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
let baseline=true;const baselineApp=execFileSync("git",["show","7e4bb55:app.js"],{encoding:"utf8",maxBuffer:10*1024*1024});
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    if(pathname==='/app.js')body=(baseline?baselineApp:body.toString()).replace('function render({force=false,selectionOnly=false,sceneDate=null}={}){','function render({force=false,selectionOnly=false,sceneDate=null}={}){window.qaRenders=(window.qaRenders||0)+1;')+'\nwindow.qaRender=render;';
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
const results=[];
for(const mode of ['before','after']){
 baseline=mode==='before';const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.qaRender);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);const seed=g.active();for(let i=1;i<80;i++){const c=structuredClone(seed);c.id='qa-'+i;c.name='QA '+i;g.state.characters[c.id]=c;g.state.order.push(c.id)}window.DrawerVillageNavigation.go('character');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(300);const guide=page.getByRole('button',{name:'확인했어요',exact:true});if(await guide.isVisible())await guide.click();await page.waitForTimeout(100);const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const result=await page.evaluate(async()=>{qaRenders=0;const start=performance.now();for(let i=0;i<12;i++)window.dispatchEvent(new Event('drawer-village-groups'));const dispatchMs=performance.now()-start;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {dispatchMs:Math.round(dispatchMs),settledMs:Math.round(performance.now()-start),renders:qaRenders,characters:g.state.order.length}});
 results.push({mode,...result});assert.equal(errors.length,0,errors.join('\n'));await page.screenshot({path:resolve(output,mode+'.png')});await page.close();
}
assert(results[1].renders<results[0].renders);console.log(JSON.stringify({cpuThrottle:4,viewport:'384x854',results}));
}finally{await browser.close();server.close()}
