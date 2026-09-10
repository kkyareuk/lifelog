import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-web341");
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
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.addLocatorHandler(page.locator('dialog.page-guide[open]'),()=>page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close())));const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);window.views=await import(url.replace('/state.js?','/views.js?'));game.createCharacter(10);game.createCharacter(10);game.state.ownerName='작은 서랍';window.DrawerVillageNavigation.go('observe');});
 for(const lang of ['ko','en','ja']){await page.evaluate(lang=>{game.state.uiLanguage=lang;window.DrawerVillageNavigation.go('observe');},lang);await page.waitForTimeout(300);assert.equal(await page.locator('.web-drawer-sidebar nav button').count(),12);assert(await page.locator('.web-drawer-sidebar').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:resolve(output,'desktop-'+lang+'.png'),fullPage:true});}

 for(const tab of ['town','relationship']){await page.evaluate(tab=>{game.state.uiLanguage='ko';window.DrawerVillageNavigation.go(tab)},tab);await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));assert(await page.locator('.web-drawer-sidebar').isVisible());console.log(await page.evaluate(()=>['.web-drawer-workspace','.web-drawer-content'].map(s=>[s,getComputedStyle(document.querySelector(s)).background])));const main=await page.locator('.web-drawer-content').boundingBox();assert(main.x>=180,'Content must not cover navigation');if(tab==='town'){const box=await page.locator('.town-native-back img').boundingBox();assert(box.width<=50)}await page.screenshot({path:resolve(output,tab+'.png'),fullPage:true});}
 const soundBefore=await page.evaluate(()=>[game.state.backgroundMusicMuted,game.state.soundMuted]);await page.locator('[data-web-mute]').click();assert.equal(await page.locator('[data-web-mute]').getAttribute('aria-pressed'),'true');assert.deepEqual(await page.evaluate(()=>[game.state.backgroundMusicMuted,game.state.soundMuted]),soundBefore);await page.evaluate(()=>{window.DrawerVillageNavigation.go('catalog');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});assert.equal(await page.locator('[data-web-mute]').getAttribute('aria-pressed'),'true');await page.locator('[data-web-mute]').click();await page.evaluate(()=>window.DrawerVillageNavigation.go('observe'));
 await page.locator('[data-web-discovery-rail] [data-discovery-tools] button').waitFor({state:'visible',timeout:10000});assert(await page.locator('[data-character-command]').isVisible());await page.locator('.web-account-card').click();await page.waitForTimeout(500);await page.screenshot({path:resolve(output,'account.png'),fullPage:true});await page.locator('[data-auth]').waitFor();assert(await page.locator('[data-sync-upload]').isVisible());
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('.web-drawer-sidebar [data-tab="groups"]').click();assert.equal(await page.evaluate(()=>game.state.activeTab),'groups');await page.screenshot({path:resolve(output,'multiplayer.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.DrawerVillageNavigation.go('observe'));assert.equal(await page.locator('.web-drawer-shell').count(),0);assert(await page.locator('.game-observe-hud').isVisible());await page.screenshot({path:resolve(output,'mobile.png'),fullPage:true});
 await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('shop')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-cart-add=town_slot_1]').click();await page.evaluate(()=>{localStorage.setItem('drawer-village-cart',JSON.stringify({green_tea:20}));window.DrawerVillageNavigation.go('shop')});assert(await page.locator('.web-shop-cart a[href]').isVisible());assert.equal(await page.locator('[data-play-purchase]').count(),0);await page.screenshot({path:resolve(output,'mobile-shop.png'),fullPage:true});
 assert(!errors.length,errors.join('\n'));console.log('PASS desktop KO/EN/JA navigation, account, multiplayer; mobile game HUD; no page errors');
}finally{await browser.close();server.close()}
