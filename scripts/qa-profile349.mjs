import {execFileSync} from "node:child_process";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-performance344");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
let baseline=true;const baselineViews=execFileSync("git",["show","e9391b4:views.js"],{encoding:"utf8",maxBuffer:20*1024*1024});const baselineApp=execFileSync("git",["show","e9391b4:app.js"],{encoding:"utf8",maxBuffer:10*1024*1024});
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=(baseline?baselineViews:body.toString()).replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    if(pathname==='/app.js')body=(baseline?baselineApp:body.toString()).replace('function render({force=false,selectionOnly=false,sceneDate=null}={}){','function render({force=false,selectionOnly=false,sceneDate=null}={}){window.qaRenders=(window.qaRenders||0)+1;')+'\nwindow.qaRender=render;';
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
const results=[];
for(const mode of ['after']){
 baseline=mode==='before';const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.qaRender);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);const seed=g.active();for(let i=1;i<80;i++){const c=structuredClone(seed);c.id='qa-'+i;c.name='QA '+i;g.state.characters[c.id]=c;g.state.order.push(c.id)}window.DrawerVillageNavigation.go('home');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(300);const guide=page.getByRole('button',{name:'확인했어요',exact:true});if(await guide.isVisible())await guide.click();await page.waitForTimeout(100);const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 const result=await page.evaluate(async()=>{qaRenders=0;qaSceneCalls=0;const samples=[];for(let i=0;i<5;i++){const start=performance.now();qaRender();samples.push(Math.round(performance.now()-start));await new Promise(r=>setTimeout(r,100))}return {samples,medianMs:[...samples].sort((a,b)=>a-b)[2],sceneCalls:qaSceneCalls,renders:qaRenders,characters:g.state.order.length}});
 const {profile}=await cdp.send('Profiler.stop');await writeFile(resolve(output,'cpu349.json'),JSON.stringify(profile));const counts=new Map();for(const n of profile.nodes){const key=n.callFrame.functionName+' '+n.callFrame.url.split('/').at(-1)+':'+n.callFrame.lineNumber;counts.set(key,(counts.get(key)||0)+(n.hitCount||0))}console.log([...counts].sort((a,b)=>b[1]-a[1]).slice(0,25));
 results.push({mode,...result});assert.equal(errors.length,0,errors.join('\n'));await page.screenshot({path:resolve(output,mode+'.png')});await page.close();
}
console.log(JSON.stringify({cpuThrottle:4,viewport:'384x854',results}));
}finally{await browser.close();server.close()}
