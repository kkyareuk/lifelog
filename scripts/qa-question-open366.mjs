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
const page=await browser.newPage({viewport:{width:384,height:854},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{document.documentElement.classList.add("native-app","native-platform");window.g=await import('/state.js?v=20260909dev305');for(let i=0;i<9;i++)g.createCharacter(100);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const cx=canvas.getContext('2d'),pixels=cx.createImageData(512,512);for(let i=0;i<pixels.data.length;i++)pixels.data[i]=i%4===3?255:(i*17+i%31)%256;cx.putImageData(pixels,0,0);const pic=canvas.toDataURL('image/png');for(const c of Object.values(g.state.characters)){c.photo=pic;c.icon=pic;}window.DrawerVillageNavigation.go('observe')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

await page.evaluate(async()=>{window.discovery=await import('/character-discovery.js?v=20260909dev305');window.rules=await import('/character-discovery-rules.js?v=20260909dev305');});
const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
await page.evaluate(()=>{for(const key of Object.keys(localStorage))if(key.startsWith('drawer-discovery-request:'))localStorage.removeItem(key);window.DrawerVillageNavigation.go('observe');});
await page.waitForTimeout(300);
console.log('buttons',await page.locator('.discovery-rail-button').count());
const opened=await page.evaluate(async()=>{const b=document.querySelector('.discovery-rail-button');const start=performance.now();b.click();const handler=performance.now()-start;await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));return {handler,paint:performance.now()-start,dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.className)};});console.log('OPEN',opened);
await page.waitForTimeout(4000);
console.log('dialog',await page.locator('.character-discovery-dialog').evaluate(d=>({rect:d.getBoundingClientRect().toJSON(),scroll:d.scrollHeight,client:d.clientHeight,buttons:[...d.querySelectorAll('button')].map(b=>({text:b.textContent,disabled:b.disabled}))})));
const profile=await cdp.send('Profiler.stop');const totals={};const nodes=new Map(profile.profile.nodes.map(n=>[n.id,n.callFrame.functionName+' '+n.callFrame.url+':'+n.callFrame.lineNumber]));profile.profile.samples?.forEach((id,i)=>{const key=nodes.get(id);totals[key]=(totals[key]||0)+(profile.profile.timeDeltas[i]||0)});console.log('CPU',Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,12));
await page.getByRole('button',{name:'지금은 넘기기',exact:true}).tap({timeout:2500});assert.equal(await page.locator('.character-discovery-dialog[open]').count(),0);console.log('TOUCH_CLOSE_PASS');assert(!errors.length,errors.join('\n'));console.log('errors',errors);
}finally{await browser.close();server.close()}
