import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-ui403");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,process.env.QA_PACKAGED||".","."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:384,height:854},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'?native-preview');await page.waitForFunction(()=>window.DrawerVillageNavigation&&window.ParallelCityAuth);
 await page.evaluate(async()=>{window.g=await import('/state.js?v='+document.querySelector('script[type=module][src]').src.split('v=')[1]);g.createCharacter(30)});
 for(const lang of ['ko','en','ja'])for(const [width,height] of [[384,854],[360,640],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(lang=>{g.state.uiLanguage=lang;g.state.characterSettingsView='full';g.state.characterPane='profile';g.state.characterOverviewPane='basic';g.state.characterProfileBook=false;window.DrawerVillageNavigation.go('character')},lang);await page.waitForTimeout(180);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-open-full-character-settings]:visible').first().click();await page.locator('.character-book-v9-menu>summary:visible').click();await page.locator('.character-book-v9-menu [data-character-pane=profile]:visible').click();
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  const form=page.locator('.character-overview-basic:not(.character-overview-life)').filter({visible:true}).first();
  await form.locator('[data-open-language-settings]').click();await page.screenshot({path:output+'/pronouns-'+lang+'-'+width+'.png'});
  const dialog=page.locator('.character-language-dialog[open]');assert(await dialog.isVisible());assert(await dialog.evaluate(d=>d.getBoundingClientRect().top>=0&&d.scrollWidth<=d.clientWidth+1));
  await dialog.locator('[data-close-language-settings]').click();await page.screenshot({path:output+'/basic-'+lang+'-'+width+'.png'});
  const metrics=await form.evaluate(f=>{const b=f.querySelector('.overview-pronouns').getBoundingClientRect(),g=f.querySelector('.overview-gender').getBoundingClientRect();return {below:b.top>=g.bottom-1,display:getComputedStyle(f).display}});assert(metrics.below,JSON.stringify(metrics));assert.equal(metrics.display,'grid');
  await page.evaluate(()=>window.DrawerVillageNavigation.go('character'));await page.waitForTimeout(200);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-open-quick-character-settings]:visible').first().click();
  const quick=page.locator('[data-mobile-character-editor-dialog][open]');await quick.locator('[data-open-language-settings]').click();
  const nested=page.locator('.character-language-dialog[open]');assert(await nested.isVisible());assert(await nested.evaluate(d=>d.scrollWidth<=d.clientWidth+1));await nested.locator('[data-close-language-settings]').click();
  assert(await quick.locator('.character-language-control').evaluate(c=>getComputedStyle(c).position==='static'&&!c.closest('.overview-field')));await page.screenshot({path:output+'/quick-'+lang+'-'+width+'.png'});await quick.evaluate(d=>d.close());

 }
 await page.evaluate(()=>window.DrawerVillageNavigation.go('observe'));await page.waitForTimeout(400);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-home-social=plaza]').click();assert(await page.locator('.plaza-coming-soon').isVisible());assert.equal(await page.locator('[data-game-create]').count(),0);
 console.log('PASS403 pronoun dialog, gender ordering, responsive form KO/EN/JA; public plaza gated');
}finally{await browser.close();server.closeAllConnections();server.close()}

