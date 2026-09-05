// Offline, isolated browser fixture. Never reads a user's browser profile or account.
import assert from 'node:assert/strict';
import {checkFurnitureAndPhoto} from './qa-furniture-photo.mjs';
import {checkRelease214,checkFirstCharacter214} from './qa-release214.mjs';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const webRoot=process.env.QA_WEB_ROOT?resolve(root,process.env.QA_WEB_ROOT):root;
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=resolve(root,'ios/build/tablet-qa');await mkdir(output,{recursive:true});
const auth=await readFile(resolve(root,'scripts/ios-preview-auth.mjs'));
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.otf':'font/otf','.ttf':'font/ttf','.m4a':'audio/mp4'};
const staticFiles=new Map();
async function source(file,pathname){
 if(staticFiles.has(file))return staticFiles.get(file);
 try{return await readFile(file)}catch(error){
  if(error.code!=='EPERM'||!/^\/(?:assets|fonts|SB_Aggro|world-assets)\//.test(pathname))throw error;
  const {stdout}=await exec('git',['show',`HEAD:${pathname.slice(1)}`],{cwd:root,encoding:'buffer',maxBuffer:32*1024*1024});
  staticFiles.set(file,stdout);return stdout;
 }
}
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(webRoot,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(webRoot+sep)||!mime[extname(file)]){res.writeHead(404).end();return}
    const body=pathname==='/auth.js'?auth:await source(file,pathname);
    res.writeHead(200,{'Content-Type':mime[extname(file)],'Cache-Control':'no-store'}).end(body);
  }catch{res.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:process.env.QA_BROWSER||'chrome',headless:true});
const report=[];
try{
 for(const [width,height] of [[1366,994],[1024,746],[820,1180],[1194,820],[384,853]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
  const firstContext=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
  await firstContext.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const firstPage=await firstContext.newPage();await firstPage.goto(origin+'/?native-preview=1');await firstPage.waitForFunction(()=>window.ParallelCity);
  await checkFirstCharacter214(firstPage,output,width);await firstContext.close();
  await page.evaluate(async()=>{
   const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;
   const mod=await import(url);mod.createCharacter();
   for(const tab of ['observe','home','relationship','town','character','shop'])await window.ParallelCityAuth.markGuideSeen(tab);
   const c=mod.state.characters[mod.state.activeId];c.name='레이아웃 테스트';
   c.photo='assets/home-ui/profile-placeholder.png';
   mod.state.guideSeen={};mod.save(true);window.ParallelCity.mediaChanged();
  });
  const navigate=async tab=>{
   await page.evaluate(tab=>{location.hash='tab='+tab},tab);
   await page.waitForFunction(tab=>document.documentElement.dataset.activeTab===tab,tab);
   await page.waitForTimeout(150);
  };
  await navigate('home');
  assert.equal(await page.locator('.home-feature-panel:visible').count(),0,`${width}: closed panels leak`);
  const bounds=await page.locator('.rooms').boundingBox();assert.ok(bounds.width<=width&&bounds.height>height*.7,`${width}: room canvas does not fill the screen`);
  await page.screenshot({path:resolve(output,`home-${width}.png`)});
  await page.locator('[data-open-home-feature="room-info"]').click();
  const search=await page.locator('[data-room-search]').boundingBox();
  assert.ok(search.height<=56&&search.width<700,`${width}: oversized search`);
  assert.ok(await page.locator('.home-room-browser [data-close-home-feature]').isVisible(),`${width}: missing back`);
  await page.screenshot({path:resolve(output,`rooms-${width}.png`)});
  await page.locator('[data-room-info-edit]').first().click();
  const editor=page.locator('dialog.home-room-editor');
  const editorBounds=await editor.boundingBox();
  assert.ok(editorBounds.width<=680&&editorBounds.x>=0,`${width}: room editor too wide`);
  await editor.locator('input[name="name"]').fill('테스트 방');
  if(width===1366){
   await page.setViewportSize({width:1024,height:1366});await page.waitForTimeout(250);
   assert.equal(await editor.locator('input[name="name"]').inputValue(),'테스트 방');
   assert.ok((await editor.boundingBox()).width<=680);
   await page.screenshot({path:resolve(output,'rotate-room-editor-portrait.png')});
  }
  await editor.locator('.home-design-back').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.home-room-editor[open]'));
  assert.ok(await page.locator('.home-room-browser').isVisible(),'Room edit back must return to room list');
  if(width===1366)await page.setViewportSize({width,height});
  await page.locator('.home-room-browser [data-close-home-feature]').click();
  assert.equal(await page.locator('.home-feature-panel:visible').count(),0);
  await page.locator('[data-open-home-feature="house-info"]').click();
  const photo=await page.locator('.home-design-info .home-design-photo').boundingBox();assert.ok(photo.height<=342,`${width}: giant house photo`);
  assert.equal(await page.locator('.home-design-info .home-design-photo img').evaluate(el=>getComputedStyle(el).objectFit),'contain');
  await page.screenshot({path:resolve(output,`info-${width}.png`)});
  await page.locator('.home-design-info [data-close-home-feature]').click();
  await page.locator('[data-open-home-feature="members"]').click();
  assert.ok(await page.locator('.home-members').isVisible());
  await page.locator('.home-members [data-close-home-feature]').click();
  assert.equal(await page.locator('.home-feature-panel:visible').count(),0,'Member list must stay hidden after closing');
  if(width>height){
   assert.equal(await page.locator('.home-native-tablet-photo img').evaluate(el=>getComputedStyle(el).objectFit),'contain');
  }
  await navigate('relationship');
  assert.ok(await page.locator('.relationship-empty-back').isVisible());
  await page.screenshot({path:resolve(output,`relationship-${width}.png`)});
  await page.locator('.relationship-empty-back').click();
  await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='observe');
  await page.screenshot({path:resolve(output,`observe-${width}.png`)});
  await navigate('town');
  const townMap=await page.locator('.town-map-scroll').boundingBox();
  assert.ok(townMap.x===0&&townMap.y===0&&townMap.width===width&&townMap.height===height,`${width}: town must fill screen`);
  await page.screenshot({path:resolve(output,`town-${width}.png`)});
  if(width===1366){
   for(const tab of ['town','home','observe','relationship']){
    await page.setViewportSize({width,height});await navigate(tab);
    await page.setViewportSize({width:1024,height:1366});await page.waitForTimeout(250);
    await page.screenshot({path:resolve(output,`rotate-${tab}-portrait.png`)});
    if(tab==='town'){
     const map=await page.locator('.town-map-scroll').boundingBox();
     assert.ok(map.x===0&&map.y===0&&map.width===1024&&map.height===1366,'Town must fill portrait after rotation');
     assert.ok(await page.locator('.town-native-back').isVisible());
     await page.locator('.town-native-back').click();
     await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='observe');
    }
    if(tab==='home'){
     assert.equal(await page.locator('.home-feature-panel:visible,.home-native-tablet-info:visible').count(),0);
     await page.locator('[data-open-home-feature="room-info"]').click();
     await page.setViewportSize({width,height});await page.waitForTimeout(250);
     assert.ok((await page.locator('[data-room-search]').boundingBox()).height<=56);
     await page.locator('.home-room-browser [data-close-home-feature]').click();
     assert.equal(await page.locator('.home-feature-panel:visible').count(),0);
    }
    if(tab==='relationship'){
     await page.locator('.relationship-empty-back').click();
     await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='observe');
    }
    await page.setViewportSize({width,height});await page.waitForTimeout(250);
   }
  }
  if(width===1366){
   await navigate('observe');
   for(const [language,title] of [['en','A story to share'],['ja','一緒に紡ぐ物語を待っています']]){
    await page.evaluate(async language=>{
     const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;
     const {state,save}=await import(url);state.uiLanguage=language;save(true);
    },language);
    await navigate('relationship');
    assert.equal(await page.locator('.relationship-empty-card h2').textContent(),title);
    await page.screenshot({path:resolve(output,`relationship-${language}.png`)});
    await navigate('observe');
   }
  }
  const furniture=await checkFurnitureAndPhoto(page,navigate,width);
  const release214=await checkRelease214(page,navigate,output,width);
  report.push({width,height,platform:process.env.QA_WEB_ROOT||'source',closedPanelsHidden:true,search,photo,backWorks:true,furniture,release214,errors});
  assert.deepEqual(errors,[],`${width}: runtime errors`);
  await context.close();
 }
 await writeFile(resolve(output,'results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await browser.close();server.close()}
