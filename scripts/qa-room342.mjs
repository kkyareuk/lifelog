import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-room342");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRoomEditor=openRoomEditor;';
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
const page=await browser.newPage({viewport:{width:390,height:844}});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.waitForFunction(()=>window.qaRoomEditor&&window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();window.h=Object.values(g.state.homes)[0];window.key=Object.keys(h.rooms)[0];h.rooms[key].image='./assets/dictionary/ink.webp';h.rooms[key].floorImage='./assets/home-design/wood.webp';h.rooms[key].floorMaterial='custom';h.rooms[key].usePhoto=true;window.DrawerVillageNavigation.go('home')});await page.waitForTimeout(400);await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());qaRoomEditor(h.id,key)});await page.locator('[data-reset-room-artwork="photo"]').click();assert(await page.evaluate(()=>!h.rooms[key].image&&!!h.rooms[key].floorImage));await page.locator('[data-reset-room-artwork="all"]').click();assert(await page.evaluate(()=>!h.rooms[key].image&&!h.rooms[key].floorImage&&!h.rooms[key].usePhoto));
await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());g.state.uiLanguage='en';g.state.characterSettingsView='full';window.DrawerVillageNavigation.go('character')});await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));if(await page.locator('[data-open-full-character-settings]:visible').count())await page.locator('[data-open-full-character-settings]:visible').first().click();await page.evaluate(()=>document.querySelector('[data-character-pane="taste"]').click());await page.waitForTimeout(200);const leaks=await page.evaluate(()=>[...document.querySelectorAll('.character-book-v8 *')].filter(e=>e.getClientRects().length&&e.childElementCount===0&&/^(정하지 않음|설정하지 않음)$/.test(e.textContent.trim())).map(e=>e.outerHTML));console.log('LEAKS',JSON.stringify(leaks));assert.equal(leaks.length,0);await page.screenshot({path:resolve(output,'english-taste.png')});await page.evaluate(()=>{window.DrawerVillageNavigation.go('home');qaRoomEditor(h.id,key)});await page.screenshot({path:resolve(output,'room-editor.png'),fullPage:true});assert.equal(errors.length,0,errors.join('\n'));console.log('PASS room reset, English unset labels, no page errors');
}finally{await browser.close();server.close()}
