import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-284");
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
  const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    game.resetAll();game.createCharacter();window.qaGame=game;game.state.dailyQuestion=null;
    window.qaSnapshot={incomingMail:[{id:'m1',groupId:'g1',senderUid:'other',subject:'새 편지',body:'안녕하세요',createdAt:Date.now()}],outgoingMail:[],incomingProposals:[{id:'p1',groupId:'g1',senderUid:'other',recipientUid:'me',kind:'relationship',status:'accepted',sourceName:'안테',targetName:'짭바이',createdAt:Date.now(),patch:{type:'연인'}}],outgoingProposals:[]};
    window.DrawerVillageGroups={getSnapshot:()=>window.qaSnapshot,refreshMailbox:async()=>{}};
    window.ParallelCityAuth.getInfo=()=>({ready:true,busy:false,user:{uid:'me'},guideState:{loaded:true,seen:['observe','mailbox']}});
    game.state.activeTab='observe';window.dispatchEvent(new Event('drawer-village-groups'));
  });
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.mail-unread-badge').first().textContent(),'2');
  await page.locator('[data-tab="mailbox"]:visible').first().click();
  await page.waitForTimeout(150);
  assert.match(await page.locator('[data-mail-open="p1"]').textContent(),/수락됨/);
  await page.locator('[data-mail-open="m1"]').click();
  assert.equal(await page.locator('.mail-reader[open]').count(),1);
  await page.evaluate(()=>{window.qaMailRoot=document.querySelector('.mail-center');window.dispatchEvent(new Event('drawer-village-groups'))});
  assert.ok(await page.evaluate(()=>window.qaMailRoot===document.querySelector('.mail-center')),'Sync must not replace background under a letter');
  await page.mouse.click(2,2);
  assert.equal(await page.locator('.mail-reader[open]').count(),1);
  await page.locator('[data-close-mail]').click();
  assert.match(await page.locator('[data-mail-open="m1"]').textContent(),/읽음/);
  await page.screenshot({path:resolve(output,'mail-status.png')});
  await page.evaluate(async()=>{
    window.AudioContext=undefined;window.webkitAudioContext=undefined;window.qaAudio=[];window.Audio=class{constructor(src){this.src=src;this.paused=true;window.qaAudio.push(this)}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}};
    const audio=await import('/background-music.js?qa=284');window.qaAudioState={backgroundMusicVolume:35,backgroundMusicMuted:false};window.qaSync=audio.syncBackgroundMusic;
    audio.syncBackgroundMusic(window.qaAudioState);
  });
  assert.equal(await page.evaluate(()=>qaAudio.length),0);
  await page.mouse.click(2,2);
  assert.equal(await page.evaluate(()=>qaAudio.length),1);
  assert.ok(await page.evaluate(()=>qaAudio[0].volume<0.1));await page.waitForTimeout(700);assert.ok(Math.abs(await page.evaluate(()=>qaAudio[0].volume)-0.35)<.001);
  await page.evaluate(()=>{qaAudioState.backgroundMusicVolume=0;qaSync(qaAudioState)});
  assert.ok(await page.evaluate(()=>qaAudio[0].paused));
  await page.evaluate(()=>{qaAudioState.backgroundMusicVolume=70;qaSync(qaAudioState)});
  assert.equal(await page.evaluate(()=>qaAudio.length),1);
  await page.waitForTimeout(1300);assert.ok(Math.abs(await page.evaluate(()=>qaAudio[0].volume)-0.7)<.001);
  await page.evaluate(()=>{qaAudioState.backgroundMusicMuted=true;qaSync(qaAudioState)});
  assert.ok(await page.evaluate(()=>qaAudio[0].paused));
  assert.deepEqual(errors,[]);console.log('PASS mail status, unread badge, stable modal and background audio');
}finally{await browser.close();await new Promise(done=>server.close(done))}
