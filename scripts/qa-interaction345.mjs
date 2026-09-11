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
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();window.DrawerVillageNavigation.go('home')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

const setup=await page.evaluate(()=>{const [a,b]=g.state.order.map(id=>g.state.characters[id]);g.state.activeId=a.id;a.ageGroup=b.ageGroup='성인';g.updateCharacterView(a.id,b.id,'touchIntensity','성인 간 친밀한 접촉까지');g.updateCharacterView(b.id,a.id,'touchIntensity','성인 간 친밀한 접촉까지');return {a:a.id,b:b.id}});
for(const lang of ['ko','en','ja']){
 await page.evaluate(lang=>{g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('home');document.querySelectorAll('dialog[open]').forEach(d=>d.close());const el=document.createElement('button');el.dataset.person=g.state.order[1];el.id='qa-person';el.textContent='Target';el.style='position:fixed;left:100px;top:100px;z-index:99999';document.body.append(el)},lang);
 await page.locator('#qa-person').click();const d=page.locator('[data-context-menu]');assert.equal(await d.count(),1);assert(!(await d.textContent()).includes('사건과 선택 기록'));
 await d.locator('.context-action-list>button').last().click();assert.equal(await d.locator('.context-action-list>button').count(),7);
 await d.locator('.context-action-list>button').nth(3).click();assert((await d.textContent()).includes(({ko:'포옹하기',en:'Hug',ja:'抱きしめる'})[lang]));
 assert.equal(await page.locator('dialog[open]').count(),1);await page.screenshot({path:resolve(output,'menu345-'+lang+'.png')});await d.locator(':scope>button').click();await page.locator('#qa-person').evaluate(el=>el.remove());
}
const checks=await page.evaluate(async()=>{
 const n=await import('/contact-narrative.js?v=20260909dev305'),[a,b]=g.state.order.map(id=>g.state.characters[id]);
 const offered=n.contactNarrative(g.state,a,b,{},'hug',{initiatorId:a.id});const received=n.contactNarrative(g.state,b,a,{overall:'연애 감정',awareness:'전혀 모름'},'hug',{initiatorId:a.id});
 g.state.uiLanguage='ko';g.directCharacterActivity(a.id,'hug',{targetId:b.id,now:Date.now()-120000,scenes:{[a.id]:{home:true,visitHomeId:a.homeId,room:'living',townId:a.townId},[b.id]:{home:true,visitHomeId:a.homeId,room:'living',townId:a.townId}}});window.DrawerVillageNavigation.go('home');
 return {different:offered.ko.desc!==received.ko.desc,unaware:received.ko.desc.includes('왜 놓기'),directive:g.state.characterDirectives[a.id]?.kind,animated:!!document.querySelector('.is-hugging'),animationName:document.querySelector('.meeting-pair.is-hugging button')?getComputedStyle(document.querySelector('.meeting-pair.is-hugging button')).animationName:'native',logsDiffer:g.state.characterDirectives[a.id]?.copy?.ko?.desc!==g.state.characterDirectives[b.id]?.copy?.ko?.desc,names:[a.id,b.id]};
});console.log(checks);assert(checks.different&&checks.unaware&&checks.directive==='hug'&&checks.animated&&checks.logsDiffer);assert.notEqual(checks.animationName,'none');console.log(JSON.stringify(checks));
const timings=await page.evaluate(()=>{const a=g.active();for(let i=2;i<80;i++){const c=structuredClone(a);c.id='load-'+i;g.state.characters[c.id]=c;g.state.order.push(c.id)}let start=performance.now();g.save(true);const fullSave=performance.now()-start;start=performance.now();g.saveDiscoveryPatch(a.id,{planningStyle:'계획적'});return {fullSave,answerSave:performance.now()-start}});console.log(JSON.stringify(timings));
await page.evaluate(()=>{const [a,b]=g.state.order.map(id=>g.state.characters[id]);g.updateCharacterView(b.id,a.id,'overall','매우 싫음');if(!g.directCharacterActivity(a.id,'hug',{targetId:b.id}))throw Error('refusal should create a response');if(!g.state.characterDirectives[a.id].contactRejected)throw Error('missing refusal');});
assert(!errors.length,errors.join('\n'));console.log('PASS same-menu categories, KO/EN/JA, directional hug logs, answer delta save');
}finally{await browser.close();server.close()}
