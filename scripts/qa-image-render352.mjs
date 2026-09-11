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
 const page=await browser.newPage({viewport:{width:384,height:854}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.state.characterPane='profile';g.state.characterOverviewPane='basic';g.active().speechStyle='냉정한 격식체';window.ParallelCity.mediaChanged()});await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const trigger=page.locator('.overview-speech .speech-picker-trigger').first();await trigger.waitFor({state:'visible'});assert.equal(await page.locator('.overview-speech select').first().isVisible(),false);await trigger.click();assert(await page.locator('.speech-picker-dialog').isVisible());assert.equal(await page.locator('.speech-picker-options button').count(),30);await page.screenshot({path:resolve(output,'speech351-real-book.png')});await page.locator('.speech-picker-dialog header button').click();
 const permission=await page.evaluate(async()=>{const {roomEntryAllowed}=await import('/room-permissions.js?v=20260909dev305');const c={id:'visitor',homeId:'other'},h={id:'house'};return [roomEntryAllowed(c,h,{accessMode:'everyone',ownerCharacterIds:['owner']}),roomEntryAllowed(c,h,{accessMode:'owners',ownerCharacterIds:[]}),roomEntryAllowed(c,h,{accessMode:'owners',ownerCharacterIds:['owner']}),roomEntryAllowed(c,h,{accessMode:'selected',accessCharacterIds:['someone']})]});assert.deepEqual(permission,[true,true,false,false]);
 await page.evaluate(()=>{const c=g.active(),h=g.state.homes[c.homeId],r=h.rooms.living;g.updateRoom(h.id,'living',{accessMode:'everyone',ownerCharacterIds:[]},false);window.beforeTimeline=c.timelineResetAt;g.updateRoom(h.id,'living',{accessMode:'everyone',ownerCharacterIds:[]},false);if(c.timelineResetAt!==beforeTimeline)throw Error('unchanged room invalidated timeline')});
 const media=await page.evaluate(async()=>{const m=await import('/local-media.js?v=20260909dev305');const canvas=document.createElement('canvas');canvas.width=8;canvas.height=8;canvas.getContext('2d').fillRect(0,0,8,8);const original=canvas.toDataURL(),source=m.displayImageSource(original);const image=new Image();image.src=source;await image.decode();const result={blob:source.startsWith('blob:'),stable:source===m.displayImageSource(original),width:image.naturalWidth,unchanged:JSON.parse(m.stringifyLocalMediaState({photo:original})).photo===original,remote:m.displayImageSource('https://example.com/a.png')};await m.persistLocalImage(original);const saved=JSON.parse(m.stringifyLocalMediaState({photo:original}));await m.initializeLocalMediaState(saved);result.restored=saved.photo===original;g.active().photo=original;window.DrawerVillageNavigation.go('home');return result;});assert.deepEqual(media,{blob:true,stable:true,width:8,unchanged:true,remote:'https://example.com/a.png',restored:true});await page.evaluate(()=>{window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});await page.locator('.page-guide[open]').waitFor({state:'visible'});await page.getByRole('button',{name:'확인했어요',exact:true}).click();await page.locator('[data-tab="shop"]:visible').first().click();assert.equal(await page.evaluate(()=>g.state.activeTab),'shop');assert.deepEqual(errors,[]);console.log('PASS real book hidden native select / custom popup, room common/public/private permissions, unchanged room keeps timeline');
}finally{await browser.close();server.close()}
