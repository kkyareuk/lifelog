import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-feedback340");
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
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();window.DrawerVillageNavigation.go('home')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
const room=page.locator('.room[data-room-key]').first();await room.click({position:{x:25,y:35}});await page.locator('[data-context-menu]').waitFor();assert(await page.locator('[data-context-menu] select').isVisible());for(const lang of ['ko','en','ja']){await page.evaluate(lang=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('home')},lang);await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('.room[data-room-key]').first().click({position:{x:25,y:35}});const box=await page.locator('[data-context-menu]').boundingBox();assert(box.x>=0&&box.x+box.width<=384&&box.y+box.height<=854);await page.screenshot({path:resolve(output,lang+'.png')});}
await page.locator('[data-context-menu]>button').nth(1).click();await page.waitForTimeout(300);assert(await page.evaluate(()=>Object.values(g.state.characterDirectives).some(d=>d.homeId&&d.room)));
await page.evaluate(()=>{g.state.uiLanguage='ko';g.state.characterPane='taste';g.state.characterSettingsView='full';window.DrawerVillageNavigation.go('character')});await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
if(await page.locator('[data-open-full-character-settings]:visible').count())await page.locator('[data-open-full-character-settings]:visible').first().click();await page.evaluate(()=>document.querySelector('[data-character-pane="taste"]').click());await page.waitForTimeout(150);const settings=page.locator('[data-activity-settings]');assert(await settings.count()>0,'page 10 restriction control missing');{await settings.first().click();await page.getByRole('heading',{name:'금지행동 설정'}).waitFor();await page.locator('dialog[open] input[type=checkbox]').first().check();await page.getByRole('button',{name:'저장',exact:true}).last().click();assert(await page.evaluate(()=>g.state.characters[g.state.activeId].autonomousActivityBlocks?.length));await page.screenshot({path:resolve(output,'settings-page10.png')});}
await page.evaluate(()=>window.DrawerVillageNavigation.go('observe'));await page.waitForTimeout(300);assert.equal(await page.locator('[data-intervene]').count(),0);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));const before=await page.evaluate(()=>JSON.stringify(g.state.characterDirectives));await page.locator('[data-character-command]').first().click();await page.getByRole('button',{name:/나답게/}).click();await page.waitForTimeout(400);assert.equal(await page.locator('.direct-command-dialog[open]').count(),0);assert.notEqual(await page.evaluate(()=>JSON.stringify(g.state.characterDirectives)),before,'Personal time must execute a new directive');
const media=await page.evaluate(async()=>{const m=await import('/portable-media.js?v=20260909dev305'),local=await import('/local-media.js?v=20260909dev305'),transfer=await import('/settings-transfer.js?v=20260909dev305');const canvas=document.createElement('canvas');canvas.width=1;canvas.height=1;const data=canvas.toDataURL(),ref=await local.persistLocalImage(data),packed=await m.portableMedia({photo:ref,wardrobeItems:[{id:'x',image:data}]});const file=transfer.characterSettingsFile({...g.state.characters[g.state.activeId],photo:packed.photo,wardrobeItems:packed.wardrobeItems});const parsed=transfer.readSettingsFile(JSON.stringify(file));return {data,photo:packed.photo,imported:parsed.character.photo}});assert.equal(media.data,media.photo);assert.equal(media.data,media.imported);
assert(!errors.length,errors.join('\n'));console.log('PASS localized context menu bounds, room action creates located directive, no page errors');
}finally{await browser.close();server.close()}
