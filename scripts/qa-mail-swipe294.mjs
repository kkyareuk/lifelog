import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-294");
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
 const page=await browser.newPage({viewport:{width:360,height:840},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);const a=game.createCharacter(10);window.qaPersonalId=a;const {accountStorage}=await import(url.replace('/state.js?','/account-storage.js?'));window.qaMailbox=(await import(url.replace('/state.js?','/notification-mail.js?'))).createContactMailbox(accountStorage);const at=Date.now()-1000;qaMailbox.record(['moved','removed-target','ordinary'].map((id,i)=>({extra:{mailOwner:accountStorage.scope,mailId:id,scheduledAt:new Date(at-i).toISOString(),mailTitle:id,mailBody:'보존된 편지 내용 '+id,characterId:id==='moved'?'no-longer-local':a,targetId:'missing-recipient',mode:id==='ordinary'?'notice':'question',questionKind:'gift'}})));location.hash='tab=mailbox'});
 await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
 for(const id of ['moved','removed-target','ordinary']){await page.locator('[data-open-contact-mail="'+id+'"]').click();await page.waitForSelector('dialog.mail-letter[open]',{timeout:3000});assert.ok((await page.locator('dialog.mail-letter').innerText()).includes('보존된 편지 내용'));await page.locator('dialog.mail-letter button').click();await page.waitForFunction(()=>!document.querySelector('dialog.mail-letter'));assert.ok((await page.locator('[data-open-contact-mail="'+id+'"] .mail-read-label').innerText()).includes('읽음'))}
 await page.locator('.mail-back').click();assert.ok(await page.evaluate(()=>['moved','removed-target','ordinary'].every(id=>qaMailbox.get(id).read)));const expected=await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;return (await import(url.replace('/state.js?','/mailbox-center.js?'))).unreadMailCount()});assert.equal(Number(await page.locator('.mail-unread-badge').first().textContent().catch(()=>0)),expected);
 await page.evaluate(()=>{const profile=structuredClone(game.state.characters[qaPersonalId]);window.qaSnapshot={activeGroupId:'g',selectedTownId:'t',selectedResidentId:'a',group:{id:'g',name:'테스트 그룹',towns:[{id:'t',name:'테스트 마을',places:[]}]},groups:[],members:[],homes:[],catalog:[],relationships:[],residents:['a','b'].map(id=>({id,name:id==='a'?'안테':'짭바이',townId:'t',ownerUid:'owner',profileJson:JSON.stringify({...profile,id,photo:'',icon:'',name:id==='a'?'안테':'짭바이'})}))};window.qaSelections=[];window.DrawerVillageGroups={getSnapshot:()=>qaSnapshot,selectResident(id){qaSelections.push(id);qaSnapshot.selectedResidentId=id;window.dispatchEvent(new Event('drawer-village-groups'))}};game.state.activeTab='observe';window.ParallelCity.setEntitlements({})});
 const swipe=async(dx,dy=0)=>{await page.evaluate(({dx,dy})=>{const h=document.querySelector('.game-observe-hud');const make=(x,y)=>new Touch({identifier:1,target:h,clientX:x,clientY:y});h.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[make(180,300)],changedTouches:[make(180,300)]}));h.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[make(180+dx,300+dy)]}));},{dx,dy});await page.waitForTimeout(100)};
 await page.waitForTimeout(400);await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));await swipe(-100);assert.equal(await page.evaluate(()=>qaSnapshot.selectedResidentId),'b');assert.equal(await page.evaluate(()=>game.state.activeId),await page.evaluate(()=>qaPersonalId));await swipe(100);assert.equal(await page.evaluate(()=>qaSnapshot.selectedResidentId),'a');await swipe(5,120);assert.equal(await page.evaluate(()=>qaSelections.length),2);
 await page.screenshot({path:resolve(output,'shared-swipe.png')});assert.deepEqual(errors,[]);console.log('PASS departed sender mail, missing gift target, read badges, multiplayer left/right swipe, vertical scroll and personal selection isolation');
}finally{await browser.close();server.close()}
