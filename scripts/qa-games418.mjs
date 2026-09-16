import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-games418");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,process.env.QA_PACKAGED||".","."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});


try{
 const page=await browser.newPage({viewport:{width:360,height:648},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const engine=require('../functions/mafia-stage.js');
 const raw=engine.start({meetingControls:2,notebook:true,drama:true,rulesVersion:4,id:'g',hostUid:'qa',name:'Mafia',seed:'qa417',mode:'live',capacity:6,durationMs:45000,deadlineAt:Date.now()+45000,map:{bg:'./world-assets/owner-forest-town.webp'},locations:Array.from({length:3},(_,i)=>({id:'l'+i,name:'Place '+i,x:[25,70,28][i],y:[20,30,55][i],square:i===0,selected:true})),players:Array.from({length:6},(_,i)=>({id:'p'+i,name:'Player '+i,ownerUid:i?'u'+i:'qa',icon:'./assets/home-ui/phone.png',delegated:i>0,sleep:'23:00'}))});
 await page.evaluate(async()=>{window.s=await import('/state.js?v=20260909dev305');window.stageUI=await import('/mafia-playback-ui.js?v=20260909dev305');document.body.innerHTML='<dialog open class="home-social-dialog plaza-games-dialog" data-plaza-screen="stage"><div class="home-social-content"></div></dialog>';window.paint=g=>stageUI.renderMafiaPlayback(document.querySelector('.home-social-content'),g,g.players[0],{submit:a=>window.sent=a,back(){}})});
 for(const lang of ['ko','en','ja']){await page.evaluate(lang=>s.state.uiLanguage=lang,lang);raw.phase='discussion';raw.meetingEndsAt=Date.now()+300000;raw.currentClaim=null;await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-meeting-action]').count(),7);assert.equal(await page.locator('.mp-public-record').count(),0);assert.equal(await page.locator('.mp-notebook').count(),0);await page.locator('[data-meeting-action=accuse]').click();await page.locator('.meeting-options button').first().click();await page.locator('.meeting-options button').first().click();assert.equal(await page.evaluate(()=>sent.kind),'accuse');
 raw.phase='claim';raw.currentClaim={kind:'accuse',speaker:'p1',target:'p0'};raw.reactions=[{kind:'agree',speaker:'p2',target:'p1'},{kind:'oppose',speaker:'p3',target:'p1'}];await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-meeting-action]').count(),9);assert(await page.locator('[data-meeting-action=oppose]').isEnabled());await page.locator('[data-meeting-action=oppose]').click();await page.locator('.meeting-options button').first().click();assert.equal(await page.evaluate(()=>sent.kind),'oppose');await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('.meeting-main p').evaluate(n=>n.textContent=n.textContent.repeat(8));const geometry=await page.evaluate(()=>{const a=document.querySelector('.meeting-main'),b=document.querySelector('.meeting-reactions'),c=document.querySelector('.meeting-actions');return [a.getBoundingClientRect().bottom<=b.getBoundingClientRect().top,b.getBoundingClientRect().bottom<=c.getBoundingClientRect().top,a.scrollHeight<=a.clientHeight+1]});assert(geometry.every(Boolean),JSON.stringify(geometry));await page.screenshot({path:output+'/meeting-'+lang+'.png'});
 }
 raw.nightCycle=true;raw.phase='night';raw.nightVotes={};raw.sceneReports=[];const mafia=raw.players.find(p=>p.role==='mafia');mafia.delegated=false;mafia.ownerUid='qa';raw.players[0].ownerUid='other';await page.evaluate(g=>stageUI.renderMafiaPlayback(document.querySelector('.home-social-content'),g,g.players.find(p=>p.role==='mafia'),{submit:a=>window.sent=a,back(){}})(),engine.view(raw,'qa'));assert(await page.locator('[data-night-target]').count()>0);await page.locator('[data-night-target]').first().click();assert.equal(await page.evaluate(()=>sent.kind),'nightHit');
 console.log('PASS418 Chrome/WebKit: KO/EN/JA 7 main / 3 reaction buttons, long text flow, no overlaps, inline choices.');
}finally{await browser.close();server.closeAllConnections();server.close()}
