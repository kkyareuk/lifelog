import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-language395");
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
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:384,height:854},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const boot=async()=>page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305')});await boot();
 const id=await page.evaluate(async()=>{const id=g.createCharacter(30);g.setActive(id);g.updateCharacter(id,{name:'언어 검사',gender:'여성'},false);await g.save(true);return id});
 for(const language of ['ko','en','ja']){
  await page.evaluate(lang=>{document.documentElement.classList.add('native-app','native-platform');g.state.uiLanguage=lang;g.state.characterSettingsView='hub';document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('character')},language);
  await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
  await page.locator('[data-open-quick-character-settings]:visible').first().click();
  const dialog=page.locator('[data-mobile-character-editor-dialog][open]');await dialog.waitFor();
  const box=dialog.locator('.character-language-settings');assert.equal(await box.count(),1);
  await box.scrollIntoViewIfNeeded();const bounds=await box.boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=384.5,JSON.stringify(bounds));
  if(language==='ko'){
   await box.locator('[data-language-pick="selfKo"][data-language-value="저"]').click();assert.equal(await box.locator('[data-field="selfKo"]').inputValue(),'저');await box.locator('[data-field="selfKo"]').fill('짐');assert.equal(await box.locator('[data-language-pick="selfKo"][data-language-value="짐"]').getAttribute('aria-pressed'),'true');await box.locator('[data-field="referenceKo"]').fill('그');assert.match(await box.locator('[data-language-preview="ko"]').textContent(),/짐이/);
  }else if(language==='en'){
   await box.locator('[data-field="pronounEn"]').selectOption('custom');await box.locator('[data-field="pronounEnSubject"]').fill('ze');await box.locator('[data-field="pronounEnObject"]').fill('hir');await box.locator('[data-field="pronounEnDeterminer"]').fill('hir');await box.locator('[data-field="pronounEnPossessive"]').fill('hirs');await box.locator('[data-field="pronounEnReflexive"]').fill('hirself');assert.match(await box.locator('[data-language-preview="en"]').textContent(),/^Ze is/);
  }else{
   await box.locator('[data-field="selfJa"]').fill('俺');await box.locator('[data-field="referenceJa"]').fill('彼');assert.match(await box.locator('[data-language-preview="ja"]').textContent(),/^俺が/);
  }
  await page.screenshot({path:resolve(output,'language395-'+language+'.png')});await dialog.locator('[data-save-mobile-character-editor]').first().click();await dialog.waitFor({state:'detached'});
  await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);await boot();
  const c=await page.evaluate(id=>g.state.characters[id],id);assert.equal(c.gender,'여성');assert.equal(c.selfKo,'짐');if(language!=='ko')assert.equal(c.pronounEnSubject,'ze');if(language==='ja')assert.equal(c.selfJa,'俺');
 }
 const imported=await page.evaluate(async id=>{const source=g.state.characters[id],copy=structuredClone(source);const {importCodeCharacter}=await import('/character-code.js');await importCodeCharacter(copy,30);const imported=g.active();return {selfKo:imported.selfKo,selfJa:imported.selfJa,pronounEnSubject:imported.pronounEnSubject,sourceSame:g.state.characters[id].selfKo==='짐'}},id);
 assert.deepEqual(imported,{selfKo:'짐',selfJa:'俺',pronounEnSubject:'ze',sourceSame:true});
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS395 UI: KO/EN/JA mobile profile, custom inputs, live preview, save/reload, language preservation, import-code profile roundtrip, no overflow');
}finally{await browser.close();server.close()}
