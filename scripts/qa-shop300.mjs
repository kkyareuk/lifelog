import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-293");
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
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;const game=await import(url);game.createCharacter(10);document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.PARALLEL_CITY_CONFIG.iosPreview=true;window.PARALLEL_CITY_CONFIG.appleBilling={enabled:true};location.hash='tab=shop'});
 await page.waitForTimeout(600);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 for(const [w,h] of [[1280,800],[1024,768],[768,1024],[360,840]]){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(300);const b=await page.locator('.drawer-shop-stage').boundingBox();assert.ok(b.width<=w+1);const cards=await page.locator('.drawer-shop-product').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,right:b.right,y:b.y}}));assert.equal(cards.length,3);if(w>=900){assert.ok(cards[0].x>w*.5);assert.ok(cards.every(c=>Math.abs(c.y-cards[0].y)<2))}assert.ok(cards.every(c=>c.x>=0&&c.right<=w));await page.screenshot({path:resolve(output,'shop300-'+w+'.png')})}
 await page.locator('[data-drawer-shop-tab="skin"]').click();assert.equal(await page.locator('.drawer-shop-coming').count(),1);await page.locator('.drawer-shop-back').click();assert.equal(await page.locator('.drawer-shop-stage').count(),0);assert.deepEqual(errors,[]);console.log('PASS tablet three-column shop, phone/portrait bounds, tabs and back');
}finally{await browser.close();server.close()}

