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
 const page=await browser.newPage({viewport:{width:1280,height:800},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);window.qaA=game.createCharacter(10);document.querySelectorAll('dialog[open]').forEach(d=>d.close());location.hash='tab=character';window.ParallelCity.mediaChanged()});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.locator('[data-open-full-character-settings]:visible').click();await page.waitForTimeout(200);const back=await page.locator('.character-book-v8-back:visible').boundingBox();assert.ok(back.width<70,'landscape back stays within toolbar');await page.screenshot({path:resolve(output,'301-full-before.png')});await page.locator('.character-book-v8-back:visible').click();
 await page.evaluate(()=>{const profile=structuredClone(game.state.characters[qaA]),home=structuredClone(game.state.homes[profile.homeId]);window.qaSnapshot={activeGroupId:'',selectedTownId:'t',selectedResidentId:'a',group:null,groups:[{id:'g',name:'멀티 연습'}],members:[{uid:'owner',role:'owner'}],homes:[{...home,id:'h',townId:'t',ownerUid:'owner',layoutJson:JSON.stringify(home)}],catalog:[],relationships:[],residents:[{id:'a',name:'멀티 캐릭터',townId:'t',sharedHomeId:'h',ownerUid:'owner',profileJson:JSON.stringify({...profile,id:'a'})}]};window.ParallelCityAuth.getInfo=()=>({ready:true,user:{uid:'owner'}});window.DrawerVillageGroups={getSnapshot:()=>qaSnapshot,select:async(id)=>{qaSnapshot.activeGroupId=id;qaSnapshot.group=id?{id:'g',name:'멀티 연습',towns:[{id:'t',name:'마을',places:[]}]}:null;window.dispatchEvent(new Event('drawer-village-groups'))},setDetailActive(){}};window.ParallelCity.mediaChanged()});await page.locator('[data-character-world]').selectOption('g');await page.waitForTimeout(500);await page.screenshot({path:resolve(output,'301-shared-before.png')});assert.deepEqual(errors,[]);const groupBox=await page.locator('[data-character-world]').boundingBox(),selected=await page.locator('.character-wallet-selected:visible').boundingBox();assert.ok(groupBox.x+groupBox.width<selected.x,'group switch does not overlap character picker');
 for(const [w,h] of [[1024,768],[768,1024],[360,840]]){await page.setViewportSize({width:w,height:h});await page.locator('[data-character-world]').selectOption('');await page.locator('[data-character-world]').selectOption('g');await page.waitForTimeout(200);assert.ok(await page.locator('.character-registration-card').isVisible());assert.ok(await page.locator('[data-character-world]').isVisible());await page.screenshot({path:resolve(output,'301-group-'+w+'.png')})}
 await page.locator('[data-character-world]').selectOption('');await page.evaluate(()=>{qaSnapshot.activeGroupId='';qaSnapshot.group=null;location.hash='tab=observe'});await page.waitForTimeout(200);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-character-command]').first().click();await page.getByRole('button',{name:'생활',exact:true}).click();await page.getByRole('button',{name:'식사·요리',exact:true}).click();await page.getByRole('button',{name:'식사하기',exact:true}).click();await page.waitForTimeout(200);await page.screenshot({path:resolve(output,'301-meal.png')});assert.equal(await page.evaluate(()=>game.state.characterDirectives[qaA].lifeTask),'meal');assert.deepEqual(errors,[]);console.log('PASS personal/multiplayer group switch at four sizes, landscape back, meal button directive');
}finally{await browser.close();server.close()}


