import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-memory336");
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
 const page=await browser.newPage({viewport:{width:1280,height:900}});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.addInitScript(count=>window.qaCharacterCount=count,Number(process.env.QA_CHARACTERS)||1);await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);game.createCharacter(100);if(window.qaCharacterCount>1){const seed=game.state.characters[game.state.order[0]];for(let i=1;i<window.qaCharacterCount;i++){const c=structuredClone(seed);c.id='qa-person-'+i;c.name='QA '+i;game.state.characters[c.id]=c;game.state.order.push(c.id)}}window.DrawerVillageNavigation.go('settings');});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 const results=[];const sample=async label=>{await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.waitForTimeout(400);await cdp.send('HeapProfiler.collectGarbage');await page.waitForTimeout(100);await cdp.send('HeapProfiler.collectGarbage');const dom=await cdp.send('Memory.getDOMCounters'),metrics=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));results.push({label,...dom,heap:metrics.JSHeapUsedSize});};
 const cycle=async()=>{for(const tab of ['character','settings']){await page.evaluate(tab=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go(tab)},tab);await page.waitForTimeout(70);}};
 for(let i=0;i<5;i++)await cycle();await sample('warm');
 for(let block=1;block<=3;block++){for(let i=0;i<10;i++)await cycle();await sample('round-'+block);}
 await sample('credits-start');for(let i=0;i<10;i++){await page.evaluate(()=>window.DrawerVillageNavigation.go('credits'));await page.waitForTimeout(80);await page.evaluate(()=>window.DrawerVillageNavigation.go('settings'));await page.waitForTimeout(80);}await sample('credits-end');assert.equal(results.at(-1).jsEventListeners,results.at(-2).jsEventListeners,'credits listeners cleaned');assert.equal(results.at(-1).nodes,results.at(-2).nodes,'credits DOM cleaned');
 const opened=await page.evaluate(()=>{let count=0;const previous=window.open;window.open=()=>{count++;return {}};document.querySelector('[data-email-compose]').click();window.open=previous;return count;});assert.equal(opened,1,'one footer click must open once');console.log('PASS one click, one email action');
 let chunks=[];cdp.on('HeapProfiler.addHeapSnapshotChunk',e=>chunks.push(e.chunk));await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});await writeFile(resolve(output,(process.env.AUDIT_PHASE||'before')+'.heapsnapshot'),chunks.join(''));
 await writeFile(resolve(output,process.env.AUDIT_PHASE||'before')+'.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();server.close()}
