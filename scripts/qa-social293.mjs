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
 const page=await browser.newPage({viewport:{width:360,height:840}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);window.views=await import(url.replace('/state.js?','/views.js?'));const a=game.createCharacter(10),b=game.createCharacter(10);game.state.characters[a].name='메다';game.state.characters[b].name='피콜로';game.state.activeId=a;game.state.activeTab='observe';window.ParallelCity.setEntitlements({});window.qaIds=[a,b]});
 await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
 await page.locator('[data-character-command]').first().click();assert.equal(await page.locator('.direct-command-dialog').count(),1);assert.equal(await page.locator('.direct-command-dialog .home-occupant-recent').count(),0);
 await page.locator('[data-direct-category=social]').click();await page.locator('.direct-step-choice').filter({hasText:'함께할 상대'}).click();await page.locator('[data-direct-target]').first().click();await page.locator('.direct-step-choice').filter({hasText:'지금 할 일 정하기'}).click();assert.equal(await page.locator('[data-social-section]').count(),4);await page.locator('[data-social-section=conflict]').click();await page.screenshot({path:resolve(output,'social-conflict-phone.png')});await page.locator('[data-direct-social-action=taunt]').click();assert.equal(await page.locator('[data-direct-social-submit]').isEnabled(),true);
 await page.locator('.direct-step-choice').filter({hasText:'지금 할 일 정하기'}).click();await page.locator('[data-social-section=together]').click();await page.locator('[data-direct-social-action=dine]').click();await page.locator('[data-direct-payment]').selectOption('request');await page.screenshot({path:resolve(output,'social-payment-phone.png')});await page.locator('[data-direct-social-submit]').click();await page.waitForFunction(()=>!document.querySelector('.direct-command-dialog'));
 const result=await page.evaluate(()=>{const a=game.state.characterDirectives[qaIds[0]],b=game.state.characterDirectives[qaIds[1]];return {a:a?.copy.ko.desc,b:b?.copy.ko.desc,payment:a?.payment}});assert.equal(result.payment,'request');assert.ok(result.a.includes('피콜로'));assert.ok(result.b.includes('피콜로'));
 const timings=await page.evaluate(()=>{game.state.activeTab='settings';game.state.settingsPane='home';const times=[];for(let i=0;i<5;i++){const t=performance.now();views.renderApp(game.state);times.push(performance.now()-t)}return times});console.log('settings render ms',timings);
 assert.deepEqual(errors,[]);console.log('PASS command-only popup, four social categories, action selection, payer perspective, settings render');
}finally{await browser.close();server.close()}
