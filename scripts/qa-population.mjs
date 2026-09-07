import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-257");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    const body=pathname==="/auth.js"?previewAuth:await readFile(file);
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
  const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  const report=await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    const views=await import(url.replace('state.js','views.js'));
    game.resetAll();game.createCharacter(20);
    const template=structuredClone(game.state.characters[game.state.activeId]);
    game.state.characters={};game.state.order=[];
    for(let i=0;i<200;i++){const id='crowd-'+i;game.state.characters[id]={...structuredClone(template),id,name:'인물 '+i,createdAt:1,days:{}};game.state.order.push(id)}
    game.state.activeId=game.state.order[0];game.state.activeTab='home';
    game.state.characterNotificationsEnabled=false;game.save(true,false);
    const timings=[];
    for(let i=0;i<3;i++){const start=performance.now();views.renderApp(game.state);timings.push(Math.round(performance.now()-start))}
    window.populationGame=game;
    return {timings,count:game.state.order.length,towns:new Set(Object.values(game.state.characters).map(c=>c.townId)).size};
  });
  assert.equal(report.count,200);assert.equal(report.towns,1);
  assert.equal(await page.locator('.view-error').count(),0);
  await page.locator('dialog.page-guide[open]').evaluateAll(nodes=>nodes.forEach(node=>node.close()));
  await page.screenshot({path:resolve(output,'town-200-phone.png'),fullPage:true});
  await page.evaluate(()=>{location.hash='tab=settings'});
  await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='settings');
  await page.evaluate(()=>{location.hash='tab=home'});
  await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='home');
  await page.reload();await page.waitForFunction(()=>window.ParallelCity);
  assert.equal(await page.evaluate(()=>window.ParallelCity.getState().order.length),200,'All 200 characters survive save/reload');
  await page.setViewportSize({width:1024,height:768});
  await page.screenshot({path:resolve(output,'town-200-tablet.png'),fullPage:true});
  assert.equal(await page.locator('.view-error').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS population browser',JSON.stringify(report));
  await context.close();
}finally{await browser.close();server.close()}
