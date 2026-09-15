import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-games407");
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
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const engine=require('../functions/mafia-stage.js');const raw=engine.start({rulesVersion:2,id:'g',hostUid:'qa',name:'Mafia',seed:'qa407',mode:'live',capacity:5,durationMs:60000,deadlineAt:Date.now()+60000,map:{bg:'./world-assets/owner-forest-town.webp'},locations:Array.from({length:5},(_,i)=>({id:'l'+i,name:'Place '+i,x:[25,70,28,65,50][i],y:[20,30,55,70,85][i],square:i===0,selected:true})),players:Array.from({length:5},(_,i)=>({id:'p'+i,name:'Player '+i,ownerUid:i?'u'+i:'qa',photo:'./icons/icon-192.png',delegated:false,sleep:'23:00'}))});
 await page.evaluate(async()=>{window.s=await import('/state.js?v=20260909dev305');window.stageUI=await import('/mafia-stage-ui.js?v=20260909dev305');document.body.innerHTML='<dialog open class="home-social-dialog plaza-games-dialog" data-plaza-screen="stage"><div class="home-social-content"></div></dialog>';window.paint=(g)=>stageUI.renderMafiaStage(document.querySelector('.home-social-content'),g,g.players[0],{submit:a=>window.sent=a,back(){},refresh(){},historyLine:(g,h)=>JSON.stringify(h)})});
 for(const lang of ['ko','en','ja']){
  await page.evaluate(lang=>s.state.uiLanguage=lang,lang);
  raw.phase='move';raw.deadlineAt=Date.now()+60000;await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));if(await page.locator('.mafia-role-reveal').count())await page.locator('.mafia-role-reveal button').click();await page.locator('[data-building=l1]').click();await page.locator('[data-send]').click();assert.deepEqual(await page.evaluate(()=>sent),{kind:'move',place:'l1'});assert.equal(await page.locator('.mafia-map-self').count(),1);assert.equal(await page.locator('[data-person]').count(),0);await page.screenshot({path:output+'/move-'+lang+'.png'});
  raw.phase='act';raw.players.slice(2).forEach(p=>p.place='l2');raw.players[0].place=raw.players[1].place='l0';raw.cards.p0=[{id:'a',day:1,tick:0,place:'l0',subject:'p0',action:'stay'}];await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-person]').count(),2);await page.locator('[data-choice=investigate]').click();await page.locator('[data-send]').click();assert.equal(await page.evaluate(()=>sent.kind),'investigate');await page.screenshot({path:output+'/inside-'+lang+'.png'});
  raw.phase='debate';raw.debateRound=0;await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-statement-place]').count(),4);assert(await page.evaluate(()=>{const d=document.querySelector('dialog');return d.scrollWidth<=d.clientWidth+1}));await page.screenshot({path:output+'/meeting-'+lang+'.png'});
 }
 console.log('PASS407 KO EN JA actual-map selection, private movement, same-building action, four-part opening statements, narrow layout');
}finally{await browser.close();server.closeAllConnections();server.close()}

