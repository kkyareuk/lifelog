import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-259");
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

try {
 const page=await browser.newPage({viewport:{width:384,height:854}});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await page.goto(origin+'/privacy.html');
 await page.evaluate(async()=>{
  window.game=await import('/state.js?v=20260907hotfix259');
  const dict=await import('/dictionary.js?v=20260907hotfix259');
  game.resetAll();game.createCharacter();window.testId=game.addCatalogItem('food',{name:'원래 항목',category:'기타'});
  window.renderDict=()=>{document.body.innerHTML=dict.renderDictionary({labels:{food:'음식'},icons:{food:'🍚'},categories:{food:['기타']},subtypes:()=>[]});dict.mountDictionary({toast:t=>window.notice=t})};renderDict();
 });
 await page.locator('[data-dict-open]').last().click();
 await page.locator('[data-dict-field="name"]').fill('수정한 항목');await page.locator('[data-dict-save]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-dict-save]'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('drawer-village-game-v1')).catalog.food.find(x=>x.id===testId).name),'수정한 항목');
 await page.locator('[data-dict-open]').last().click();await page.locator('[data-dict-field="memo"]').fill('공간 부족 중 입력한 내용');
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')}});
 await page.locator('[data-dict-save]').click();await page.waitForFunction(()=>window.notice?.includes('저장하지 못했어요'));
 assert.equal(await page.locator('[data-dict-field="memo"]').inputValue(),'공간 부족 중 입력한 내용');
 await page.locator('[data-dict-close]').click();await page.locator('[data-leave-editor]').click();
 assert.equal(await page.locator('[data-dict-save]').count(),0);
 await page.locator('[data-dict-open]').last().click();assert.equal(await page.locator('[data-dict-field="memo"]').inputValue(),'공간 부족 중 입력한 내용');
 await page.evaluate(()=>{Storage.prototype.setItem=originalSet});await page.locator('[data-dict-save]').click();await page.waitForFunction(()=>!document.querySelector('[data-dict-save]'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('drawer-village-game-v1')).catalog.food.find(x=>x.id===testId).memo),'공간 부족 중 입력한 내용');
 const scenes=await page.evaluate(async()=>{
  const sim=await import('/simulation.js?v=20260907hotfix259'),c=game.state.characters[game.state.activeId];c.createdAt=1;c.wake='00:00';c.sleep='23:50';c.days={};c.timelineResetAt=0;
  game.state.routines={[c.id]:[{id:'short',day:1,start:'01:00',end:'03:00',title:'짧은 일정',type:'기타',withIds:[]}]};game.state.monthlyRoutines={};game.state.dailyPlans={};
  return [2,3,5,12,19].map(h=>{const e=sim.eventFor(c,new Date(2026,8,7,h,0));return {h,title:e.title,routineId:e.routineId,minute:e.minute}});
 });assert.equal(scenes[0].routineId,'short');for(const scene of scenes.slice(1))assert.notEqual(scene.routineId,'short');
 await page.reload();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('drawer-village-game-v1')).catalog.food.some(x=>x.memo==='공간 부족 중 입력한 내용')),true);
 console.log('PASS dictionary save/reload, quota failure, back navigation, draft recovery, retry and schedule end',JSON.stringify(scenes));
}finally{await browser.close();server.close()}
