import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-games401");
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
 const page=await browser.newPage({viewport:{width:360,height:800},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation&&window.ParallelCityAuth);
 const engine=require('../functions/mafia-engine.js');const raw=engine.start({id:'one',name:'마피아 / Mafia / マフィア',seed:'ui',capacity:5,hostUid:'qa',durationMs:21600000,deadlineAt:Date.now()+21600000,locations:['a','b','c'].map(id=>({id,name:'긴 장소 이름 · Library '+id})),players:Array.from({length:5},(_,i)=>({id:'p'+i,name:'Player '+i,ownerUid:i?'other':'qa',delegated:i>1,traits:'분석',sleep:'01:00'}))});raw.cards.p0=[{id:'card',kind:'alibi',day:1,tick:0,place:'a',subject:'p0',action:'task'}];raw.board=[{...raw.cards.p0[0],speaker:'p0',conflicts:['old']}];raw.history=[{kind:'accuse',speaker:'p0',target:'p1',day:1},{kind:'card',speaker:'p0',card:raw.board[0],day:1}];const fixture=engine.view(raw,'qa');
 await page.evaluate(async fixture=>{window.g=await import('/state.js?v='+document.querySelector('script[type=module][src]').src.split('v=')[1]);g.createCharacter(30);window.DrawerVillageNavigation.go('observe');window.fixture=fixture;window.ParallelCityAuth.getInfo=()=>({user:{uid:'qa'}});window.DrawerVillageGroups={getSnapshot:()=>({groups:[{id:'g',name:'Test group'}]}),games:async(action,input)=>{window.lastGameAction={action,input};(window.gameCalls||=[]).push({action,input});if(action==='readGames')return {manager:true,games:[fixture],characters:[{id:'p0',name:'Player 0'}],locations:fixture.locations,consent:[]};return fixture}};window.gameUI=await import('/plaza-games-ui.js?v='+document.querySelector('script[type=module][src]').src.split('v=')[1])},fixture);
 for(const lang of ['ko','en','ja']){
  await page.evaluate(lang=>{g.state.uiLanguage=lang;fixture.mode='live';fixture.deadlineAt=Date.now()+60000;fixture.actionTick=0;fixture.phase='plan';fixture.players[0].photo='./icons/icon-192.png';gameUI.openPlazaGames()},lang);
  await page.locator('.plaza-game-tile').waitFor();assert.equal(await page.locator('.plaza-game-tile').count(),1);await page.screenshot({path:output+'/lobby-'+lang+'.png'});
  await page.locator('[data-game-create-open]').click();await page.locator('.plaza-setup').waitFor();await page.screenshot({path:output+'/inspect-setup-'+lang+'.png'});assert(await page.locator('.plaza-rules').innerText().then(t=>t.includes('60')&&t.includes('45')));assert(await page.evaluate(()=>{const d=document.querySelector('.plaza-games-dialog');return d.scrollWidth<=d.clientWidth+1}));await page.screenshot({path:output+'/setup-'+lang+'.png'});
  await page.locator('[data-setup-back]').click();await page.locator('.plaza-game-tile').click();await page.locator('.plaza-action-map').waitFor();assert.equal(await page.locator('[name=place0]').count(),1);assert.equal(await page.locator('[name=place1]').count(),0);await page.locator('[data-action-location=b]').click();assert.equal(await page.locator('[name=kind0]').inputValue(),'move');assert(await page.evaluate(()=>{const d=document.querySelector('.plaza-games-dialog');return d.scrollWidth<=d.clientWidth+1}));await page.screenshot({path:output+'/map-'+lang+'.png'});
  await page.locator('[data-game-action]>button').click();await page.waitForTimeout(80);const sent=await page.evaluate(()=>gameCalls.filter(c=>c.action==='submitGame').at(-1).input.action);assert.equal(sent.plan.length,1);assert.equal(sent.plan[0].place,'b');assert.equal(sent.plan[0].kind,'move');await page.locator('[data-social-dialog] header button').click();
 }
 console.log('PASS401 packaged KO EN JA gallery/settings/map actions, live timing labels, one-step submission and narrow-screen bounds');
}finally{await browser.close();server.closeAllConnections();server.close()}
