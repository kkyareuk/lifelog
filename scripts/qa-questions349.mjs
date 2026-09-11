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
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();window.DrawerVillageNavigation.go('observe')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

await page.evaluate(async()=>{window.discovery=await import('/character-discovery.js?v=20260909dev305');window.rules=await import('/character-discovery-rules.js?v=20260909dev305');});
for(const language of ['ko','en','ja']){
 await page.evaluate(lang=>{g.state.uiLanguage=lang;discovery.showDiscovery(g.active(),{title:'쉬는 중'},rules.DISCOVERY_SCENES.find(q=>q.id==='dilemma-borrowed-item'));},language);
 assert.equal(await page.locator('.discovery-choices button').count(),5);await page.screenshot({path:resolve(output,'questions349-'+language+'.png'),fullPage:true});await page.evaluate(()=>document.querySelector('.character-discovery-dialog')?.close());await page.waitForTimeout(80);
}
const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const timing=await page.evaluate(async()=>{g.state.uiLanguage='ko';const c=g.active();discovery.showDiscovery(c,{title:'쉬는 중'},rules.DISCOVERY_SCENES.find(q=>q.id==='dilemma-small-secret'));const b=[...document.querySelectorAll('.discovery-choices button')].find(b=>b.textContent.includes('유리하게'));const start=performance.now();b.click();const handlerMs=performance.now()-start;while(document.querySelector('.character-discovery-dialog'))await new Promise(r=>setTimeout(r,10));return {handlerMs:Math.round(handlerMs*10)/10,savedMs:Math.round(performance.now()-start),score:c.discovery.scores.morality}});assert(timing.score<50);console.log('PASS translated choices and saved immoral answer, CPU4x',timing);
assert(!errors.length,errors.join('\n'));
}finally{await browser.close();server.close()}
