import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-feedback343");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRoomEditor=openRoomEditor;window.qaDaily=openDailyCharacterQuestion;window.qaContact=openContactMail;';
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.qaDaily);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();window.c=g.active();window.DrawerVillageNavigation.go('observe')});await page.waitForTimeout(400);
await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.discovery=await import('/character-discovery.js?v=20260909dev305');window.ParallelCityAuth.getInfo=()=>({ready:true,busy:true,user:{uid:'qa'}});discovery.considerDiscovery(c,{})});assert.equal(await page.locator('[data-discovery-tools]').count(),1);
for(const lang of ['ko','en','ja']){
await page.evaluate(lang=>{g.state.uiLanguage=lang;window.qaReport=null;window.ParallelCityAuth.submitFeedback=async report=>{window.qaReport=report;return true};discovery.showDiscovery(c,{}, {id:'qa',question:{ko:'일찍 도착했어요.',en:'You arrived early.',ja:'早く着きました。'},animation:'surprise',icon:'!',choices:[{text:{ko:'기다린다',en:'Wait',ja:'待つ'},targets:{impulsivity:12}}]})},lang);
await page.locator('[data-discovery-feedback]').click();assert.equal(await page.evaluate(()=>qaReport.category),'discovery-answer-fit');assert.equal(await page.evaluate(()=>JSON.parse(qaReport.message).questionId),'qa');await page.screenshot({path:resolve(output,lang+'.png')});await page.evaluate(()=>document.querySelector('dialog[open]').close());await page.waitForTimeout(100);}
await page.evaluate(()=>{g.state.uiLanguage='ko';qaDaily({day:'2026-09-11',characterId:c.id,kind:'everyday',answered:false})});const first=await page.locator('[data-character-question-option]').allTextContents();assert(first.length>0);const id=await page.evaluate(()=>g.state.dailyQuestion.mailId);await page.evaluate(()=>document.querySelector('dialog[open]').close());await page.waitForTimeout(100);await page.evaluate(id=>qaContact(id),id);assert.deepEqual(await page.locator('[data-character-question-option]').allTextContents(),first);const before=await page.evaluate(()=>g.state.scheduledChoices.length);await page.locator('[data-character-question-decline]').click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>g.state.scheduledChoices.length),before);await page.evaluate(id=>qaContact(id),id);assert.equal(await page.locator('[data-character-question-option]').count(),0);assert.equal(errors.length,0,errors.join('\n'));console.log('PASS busy-sync question icon, three-language feedback payload, mail answer reopen');
}finally{await browser.close();server.close()}
