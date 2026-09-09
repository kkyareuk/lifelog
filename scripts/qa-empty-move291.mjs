import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-291");
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
 const page=await browser.newPage({viewport:{width:360,height:840}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 const result=await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;const game=await import(url),views=await import(url.replace('/state.js?','/views.js?'));game.createCharacter(10);const c=structuredClone(game.state.characters[game.state.activeId]);window.DrawerVillageGroups={getSnapshot:()=>({activeGroupId:'g',group:{id:'g',name:'멀티',towns:[{id:'t',name:'멀티 마을',places:[],decorations:[]}]},selectedTownId:'t',selectedResidentId:'r',residents:[{id:'r',ownerUid:'me',name:c.name,townId:'t',profileJson:JSON.stringify(c),scheduleJson:'{}'}],homes:[],members:[{uid:'me',role:'owner'}],catalog:[],relationships:[],characterGroups:[],perceptions:[],schedules:[]})};
 game.receiveCharacterTransfers([{personalId:c.id,location:'group',groupId:'g',revision:1}]);window.qaGame=game;window.qaViews=views;const rows=[];for(const tab of ['observe','routine','catalog','character','town']){game.state.activeTab=tab;views.renderApp(game.state);rows.push({tab,actual:document.documentElement.dataset.activeTab,welcome:document.querySelector('#app').classList.contains('is-welcome'),failed:!!document.querySelector('.view-error')})}return rows});
 console.log(JSON.stringify(result));for(const row of result){assert.equal(row.actual,row.tab);assert.equal(row.welcome,false);assert.equal(row.failed,false)}
 await page.evaluate(()=>{qaGame.state.activeTab='observe';qaViews.renderApp(qaGame.state)});const icons=await page.locator('.game-hud-menu-button img').evaluateAll(images=>images.map(i=>i.getBoundingClientRect().width));if(icons.length)assert.ok(Math.max(...icons)<180);
 await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>qaViews.renderApp(qaGame.state));assert.equal(await page.locator('#app').evaluate(e=>e.classList.contains('is-welcome')),false);await page.screenshot({path:resolve(output,'empty-move-tablet.png')});
 await page.evaluate(()=>{DrawerVillageGroups.getSnapshot=()=>({});qaGame.state.activeTab='observe';qaViews.renderApp(qaGame.state)});assert.equal(await page.locator('#app').evaluate(e=>e.classList.contains('is-welcome')),true);
 assert.deepEqual(errors,[]);console.log('PASS last resident leaves personal world: multiplayer observe/routine/catalog/character/town keep actual layout; real welcome remains welcome');
}finally{await browser.close();server.close()}
