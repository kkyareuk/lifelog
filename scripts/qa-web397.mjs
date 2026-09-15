import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-web397");
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

try{const page=await browser.newPage({viewport:{width:800,height:1920},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation&&window.ParallelCityAuth);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');for(let i=0;i<10;i++)g.createCharacter(30);document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
for(const size of [[400,960],[400,1600],[800,1920],[1440,1000]]){await page.setViewportSize({width:size[0],height:size[1]});for(const tab of ['observe','town']){const begin=Date.now();await page.evaluate(tab=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go(tab)},tab);await page.waitForTimeout(300);console.log(size,tab,Date.now()-begin,await page.evaluate(()=>({classes:document.documentElement.className,overflow:document.documentElement.scrollWidth,discovery:!!document.querySelector('[data-discovery-tools]'),nodes:['#app','main','.town-map-scroll','.town-map-scroll>.world','.world-bg'].map(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return [sel,r.x,r.y,r.width,r.height,getComputedStyle(e).objectFit]})})));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(tab==='town')assert(await page.evaluate(()=>{const v=document.querySelector('.town-map-scroll'),w=v.querySelector('.world');return w.offsetHeight>=v.clientHeight-10}));await page.screenshot({path:output+'/'+tab+'-'+size[0]+'-'+size[1]+'.png'});}}
const mail=await page.evaluate(async()=>{const {markMailsRead,mailWasRead}=await import('/mail-read-state.js?v=20260909dev305');const rows=Array.from({length:60},(_,i)=>({id:'qa397-'+i,groupId:'one',createdAt:Date.now()}));markMailsRead(rows);return {all:rows.every(mailWasRead),other:mailWasRead({...rows[0],groupId:'two'}),fresh:mailWasRead({id:'new397'})}});assert.deepEqual(mail,{all:true,other:false,fresh:false});await page.evaluate(()=>window.DrawerVillageNavigation.go('mailbox'));assert(await page.locator('[data-mail-read-all]').isVisible());await page.evaluate(()=>{window.qaMailSnapshot={incomingMail:[{id:'bulk-new',senderUid:'other',subject:'QA',body:'QA',createdAt:Date.now()}],incomingProposals:[{id:'proposal397',status:'pending'}],mailCursors:{older:'next'}};window.DrawerVillageGroups={getSnapshot:()=>qaMailSnapshot,refreshMailbox:async()=>{},loadOlderMailbox:async()=>{qaMailSnapshot.incomingMail.push({id:'bulk-old',senderUid:'other',subject:'Old',body:'QA',createdAt:1});qaMailSnapshot.mailCursors={}}};window.DrawerVillageNavigation.go('mailbox')});await page.locator('[data-mail-read-all]').click();await page.waitForFunction(()=>!document.querySelector('[data-mail-read-all]')||document.querySelector('[data-mail-read-all]').disabled);const bulk=await page.evaluate(async()=>{const {mailWasRead}=await import('/mail-read-state.js?v=20260909dev305');return {read:qaMailSnapshot.incomingMail.every(mailWasRead),status:qaMailSnapshot.incomingProposals[0].status}});assert.deepEqual(bulk,{read:true,status:'pending'});console.log('PASS397 map bounds, discovery icon, 60 read marks with group isolation/new mail unread and mailbox button');
}finally{await browser.close();server.closeAllConnections();server.close()}
