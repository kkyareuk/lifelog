import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-home396");
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
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation&&window.ParallelCityAuth);
 const result=await page.evaluate(async()=>{
  const {bindSharedHomeDeletion}=await import('/shared-home-delete.js');const {state}=await import('/state.js?v=20260909dev305');const original=JSON.stringify(state.homes);const results=[];
  for(const scenario of ['host','manager','own','stranger','cancel','failure','switched']){
   const s={activeGroupId:'qa396-'+scenario,group:{ownerUid:'host'},homes:[{id:'current',ownerUid:'other'},{id:'target',ownerUid:scenario==='own'?'me':'other'}],members:[{uid:'me',role:scenario==='manager'?'manager':'member'}]};let uid=scenario==='host'?'host':'me';if(['cancel','failure','switched'].includes(scenario))uid='host';
   let calls=[],renders=0,privateCalls=0,notices=[],release;const pending=new Promise(r=>release=r);window.ParallelCityAuth.getInfo=()=>({user:{uid}});window.DrawerVillageGroups={getSnapshot:()=>s,removeHome:async id=>{calls.push(id);if(scenario==='failure')throw Error('network unavailable');s.homes=s.homes.filter(h=>h.id!==id)}};window.confirm=()=>scenario!=='cancel';
   const root=document.createElement('div');root.innerHTML='<button data-delete-home="current">Current</button><button data-delete-home="target">Target</button>';document.body.append(root);root.querySelectorAll('button').forEach(b=>b.onclick=()=>privateCalls++);bindSharedHomeDeletion(root,s,()=>renders++,m=>notices.push(m),()=>pending);const button=root.querySelector('[data-delete-home="target"]');button.click();button.click();
   if(calls.length)throw Error('delete ran before pending layout');if(scenario==='switched')s.activeGroupId='changed';release();await new Promise(r=>setTimeout(r,0));
   const shouldDelete=['host','manager','own','failure'].includes(scenario);if(calls.length!==(shouldDelete?1:0)||calls.some(id=>id!=='target')||privateCalls)throw Error(JSON.stringify({scenario,calls,privateCalls}));
   if(['host','manager','own'].includes(scenario)&&(!s.homes.some(h=>h.id==='current')||s.homes.some(h=>h.id==='target')||renders!==1))throw Error('wrong home removed');
   if(scenario==='failure'&&(!s.homes.some(h=>h.id==='target')||button.disabled||!notices.length))throw Error('retry not available');
   if(scenario==='stranger'&&!button.disabled)throw Error('unauthorized button');root.remove();results.push(scenario);
  }
  if(JSON.stringify(state.homes)!==original)throw Error('private homes changed');return results;
 });assert.equal(result.length,7);console.log('PASS396 shared home deletion:',result.join(', '),'target-specific, waits for layout, duplicate-click guard, private world preserved');
}finally{await browser.close();server.closeAllConnections();server.close()}
