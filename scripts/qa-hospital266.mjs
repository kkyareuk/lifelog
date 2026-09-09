import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-266");
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


try{
 const page=await browser.newPage({viewport:{width:384,height:854}});page.setDefaultTimeout(6000);page.on('console',m=>{if(m.type()==='error')console.log('console-error',m.text())});page.on('pageerror',e=>console.log('page-error',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name,g=await import(url);window.game=g;g.resetAll();g.createCharacter(10);const c=g.state.characters[g.state.activeId];c.bodyProfile.hospitalVisitPurpose='상담·경과 확인';delete c.bodyProfile.hospitalVisitPurposes;g.state.activeTab='character';g.state.characterSettingsView='full';g.state.characterPane='body';g.state.characterBodyPane='accessibility';await window.ParallelCityAuth.markGuideSeen('character');g.save(true);location.hash='tab=character';window.ParallelCity.mediaChanged()});
 await page.reload();await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(()=>{location.hash='tab=character'});await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='character');
 console.log('before book',await page.evaluate(()=>({tab:document.documentElement.dataset.activeTab,text:document.querySelector('main')?.innerText.slice(0,250)})));await page.screenshot({path:resolve(output,'hospital-debug.png')});
 if(await page.locator('[data-open-full-character-settings]').count())await page.locator('[data-open-full-character-settings]').last().evaluate(el=>el.click());
 await page.locator('[data-character-pane="body"]').last().evaluate(el=>el.click());
 await page.evaluate(()=>{window.ParallelCity.getState()});
 for(let turn=0;turn<3&&!await page.locator('[data-body-field="hospitalVisitFrequency"]').count();turn++){const next=page.locator('[data-character-body-pane="appearance"],[data-character-body-pane="accessibility"]').last();await next.evaluate(el=>el.click())}
 await page.locator('[data-body-field="hospitalVisitFrequency"]').selectOption('평일 전부');
 await page.locator('[data-open-body-choice="hospitalVisitPurposes"]').click();
 for(const value of ['입원 치료','통원 치료','정신건강 진료'])await page.locator('[data-body-choice-dialog] [data-body-list="hospitalVisitPurposes"][data-value="'+value+'"]').click();
 await page.locator('[data-body-choice-dialog] button[value=close]').first().click();
 await page.locator('[data-open-body-choice="hospitalDepartments"]').click();await page.locator('[data-body-choice-dialog] [data-value="정신과"]').click();await page.locator('[data-body-choice-dialog] button[value=close]').first().click();
 await page.screenshot({path:resolve(output,'hospital-multiple-384.png'),fullPage:true});
 await page.reload();await page.waitForFunction(()=>window.ParallelCity);
 const body=await page.evaluate(()=>window.ParallelCity.getState().characters[window.ParallelCity.getState().activeId].bodyProfile);
 assert.ok(body.hospitalVisitPurposes.includes('상담·경과 확인'));assert.ok(body.hospitalVisitPurposes.includes('입원 치료'));assert.ok(body.hospitalVisitPurposes.includes('통원 치료'));assert.ok(body.hospitalDepartments.includes('정신과'));assert.equal(body.hospitalVisitFrequency,'평일 전부');
 console.log('PASS hospital: legacy selection preserved, multi-purpose/psychiatry saved and reload');
 const checks=await page.evaluate(async()=>{const source=performance.getEntriesByType('resource').find(r=>/\/creative-options\.js\?/.test(r.name)).name,{careRoutineFor}=await import(source),c=window.ParallelCity.getState().characters[window.ParallelCity.getState().activeId],world={towns:[{places:[{id:'hospital',type:'병원',subtype:'종합병원',name:'마을 병원'}]}]};return Array.from({length:7},(_,i)=>careRoutineFor(c,new Date(2026,8,7+i,9,30),world))});
 assert.ok(checks.slice(0,5).every(x=>x&&x.title.includes('정신과')&&x.title.includes('상담')&&x.title.includes('통원 치료')));assert.deepEqual(checks.slice(5),[null,null]);console.log('PASS weekdays Monday-Friday only and purpose/department reflected in scheduled scene');
}finally{await browser.close();server.close()}
