import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-home398");
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
 const page=await browser.newPage({viewport:{width:400,height:960},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation&&window.ParallelCityAuth);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(30);window.DrawerVillageNavigation.go('observe')});
 for(const lang of ['ko','en','ja'])for(const width of [360,412]){
  await page.setViewportSize({width,height:892});await page.evaluate(lang=>{g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('observe')},lang);await page.waitForTimeout(200);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  assert.equal(await page.locator('.game-hud-dock>button').count(),5);assert.equal(await page.locator('.game-hud-side-left').count(),0);
  assert(await page.locator('[data-home-discovery-slot] [data-discovery-tools]').isVisible());assert(await page.locator('[data-home-social=friends]').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:output+'/home-'+lang+'-'+width+'.png'});
  await page.locator('[data-home-social=drawer]').click();assert.equal(await page.locator('[data-drawer-route]').count(),6);assert(await page.evaluate(()=>{const d=document.querySelector('[data-social-dialog]');return d.scrollWidth<=d.clientWidth+1}));await page.screenshot({path:output+'/drawer-'+lang+'-'+width+'.png'});await page.locator('[data-social-close]').click();
  await page.locator('[data-home-social=plaza]').click();assert(await page.locator('[data-plaza-join]').isVisible());await page.locator('[data-social-close]').click();
 }
 await page.evaluate(()=>{window.ParallelCityAuth.getInfo=()=>({user:{uid:'qa398'}});window.qaFriends={code:'1234567890ABCDEF',friends:[],incoming:[{uid:'other',name:'Friend <test>'}],outgoing:[]};window.ParallelCityAuth.friends=async(action,input)=>{if(action==='readFriends')return structuredClone(qaFriends);if(action==='respondFriend'){qaFriends.friends.push(qaFriends.incoming[0]);qaFriends.incoming=[];return {saved:true}}}});
 await page.locator('[data-home-social=friends]').click();await page.locator('[data-friend-action=accept]').click();await page.waitForFunction(()=>document.querySelector('[data-friend-action=remove]'));assert.equal(await page.locator('[data-social-dialog] test').count(),0);await page.screenshot({path:output+'/friends-ja.png'});await page.locator('[data-social-close]').click();
 console.log('PASS398 home/drawer/plaza navigation and bounds KO EN JA at 360/412, relocated discovery, friend acceptance UI and HTML escaping');
}finally{await browser.close();server.closeAllConnections();server.close()}
