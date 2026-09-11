import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-context339");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/app.js")body=body.toString()+"\nwindow.qaRoomEditor=openRoomEditor;window.qaRoomPhoto=openRoomImageMenu;";
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:384,height:854},hasTouch:true,isMobile:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');for(let i=0;i<3;i++)g.createCharacter(20);const profile=structuredClone(g.active()),h=structuredClone(g.state.homes[profile.homeId]);window.multi={activeGroupId:'g',selectedTownId:'t',selectedResidentId:'a',group:{id:'g',ownerUid:'me',name:'멀티',towns:[{id:'t',name:'마을',places:[]}]},groups:[{id:'g',name:'멀티'}],members:[{uid:'me',role:'owner'}],homes:[{id:'h',name:'집',townId:'t',ownerUid:'me',layoutJson:JSON.stringify(h)}],catalog:[],relationships:[],residents:['a','b'].map(id=>({id,name:id,townId:'t',sharedHomeId:'h',ownerUid:'me',profileJson:JSON.stringify({...profile,id,name:id})}))};window.snap={...multi,activeGroupId:'',group:null};const info=ParallelCityAuth.getInfo;ParallelCityAuth.getInfo=()=>({...info(),user:{uid:'me'}});window.DrawerVillageGroups={getSnapshot:()=>snap,setDetailActive(){},select(id){snap=id?{...multi}:{...multi,activeGroupId:'',group:null};dispatchEvent(new Event('drawer-village-groups'))},selectResident(id){snap.selectedResidentId=id;dispatchEvent(new Event('drawer-village-groups'))},refreshMailbox:async()=>{}};DrawerVillageNavigation.go('observe');});
 await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 for(let i=0;i<3;i++){
  await page.evaluate(()=>{DrawerVillageGroups.select('g');DrawerVillageNavigation.go('town')});await page.waitForTimeout(250);await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
  await page.locator('[data-open-multiplayer-switcher]').click();await page.locator('[data-multiplayer-select=""]').click();await page.locator('.town-native-back').click();await page.waitForTimeout(250);
  const before=await page.evaluate(()=>({id:g.state.activeId,dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.className),inert:document.body.inert}));console.log('return',i,before);
  const hud=page.locator('.game-observe-hud');const box=await hud.boundingBox();const cdp=await page.context().newCDPSession(page);const x=box.x+box.width*.75,y=box.y+box.height*.48;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-140,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);
  const after=await page.evaluate(()=>g.state.activeId);assert.notEqual(after,before.id,'personal swipe after multiplayer');
 }
 assert.deepEqual(errors,[]);console.log('PASS multiplayer -> personal repeated swipe');
}finally{await browser.close();server.close()}
