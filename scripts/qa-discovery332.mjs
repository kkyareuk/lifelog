import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-discovery332");
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
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);window.views=await import(url.replace('/state.js?','/views.js?'));window.credits=await import(url.replace('/state.js?','/supporter-credits.js?'));game.createCharacter(10);game.state.activeTab='settings';game.state.settingsPane='home';views.renderApp(game.state)});


 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.discovery=await import(url.replace('/state.js?','/character-discovery.js?'));window.rules=await import(url.replace('/state.js?','/character-discovery-rules.js?'));const first=game.state.characters[game.state.order[0]];first.name='메다';const id=game.createCharacter(10);const second=game.state.characters[id];second.name='젠할린';game.state.activeId=id;game.state.activeTab='observe';localStorage.setItem('drawer-village-guide-observe','1');localStorage.removeItem('drawer-discovery-request:guest');views.renderApp(game.state);discovery.considerDiscovery(first,{title:'휴식'});window.qaSecond=second;});
 await page.locator('.discovery-rail-button').click();
 assert.equal(await page.locator('.character-discovery-dialog> b').textContent(),'젠할린');
 await page.evaluate(()=>{const c=qaSecond;c.discovery={scores:{neatness:61},answered:['early'],locks:{neatness:true}};if(rules.discoveryLocked(c,'neatness'))throw Error('Old lock remained');if(c.discovery.scores.neatness!==61||c.discovery.answered[0]!=='early')throw Error('History changed');c.discovery.locks.neatness=true;if(!rules.discoveryLocked(c,'neatness'))throw Error('New lock lost');});
 await page.screenshot({path:resolve(output,'selected-character.png')});assert.deepEqual(errors,[]);console.log('PASS stale callback targets visible character; old locks reset once, relocking and history preserved');
}finally{await browser.close();server.close()}
