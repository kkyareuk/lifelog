import assert from "node:assert/strict";

import {createServer} from "node:http";

import {readFile,mkdir} from "node:fs/promises";

import {resolve,extname,sep} from "node:path";

import {createRequire} from "node:module";

import {fileURLToPath} from "node:url";



const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);

const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";

const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-318");

await mkdir(output,{recursive:true});

const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));

const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};

const server=createServer(async(request,response)=>{

  try{

    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));

    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();

    const body=pathname==='/'?Buffer.from('<html class="native-app" data-active-tab="town"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/groups.css"><link rel="stylesheet" href="/multiplayer-directory.css"></head><body><main id="app"></main></body></html>'):pathname==="/auth.js"?previewAuth:await readFile(file);

    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);

  }catch{response.writeHead(404).end()}

});

await new Promise(done=>server.listen(0,"127.0.0.1",done));

const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});



try{

  const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});

  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());

  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));

  await page.goto(`${origin}/?native-preview=1`);

  page.setDefaultTimeout(10000);
  await page.evaluate(async()=>{
   const game=await import('/state.js?v=20260909dev305'),{sharedResidentsScreen}=await import('/shared-residents.js?v=20260909dev305'),{bindSharedUi}=await import('/shared-ui.js?v=20260909dev305');
   game.state.uiLanguage='ko';window.ParallelCityAuth={};window.ParallelCityAuth.getInfo=()=>({user:{uid:'me'}});
   const s={activeGroupId:'g',selectedTownId:'t',group:{id:'g',name:'멀티',ownerUid:'me',towns:[{id:'t'}]},residents:[],homes:[],members:[{uid:'me',role:'owner'}],loadedCollections:['group','residents','homes']};
   window.qaCalls=[];window.qaSnapshot=s;
   window.DrawerVillageGroups={getSnapshot:()=>s,readMoveCandidates:()=>new Promise(resolve=>window.finishCandidates=()=>resolve({characters:[]})),createResident:async input=>{window.qaCalls.push(input);if(window.qaCalls.length===1)throw Error('test retry');s.residents.push({id:'me_'+input.id,ownerUid:'me',name:input.profile.name,profileJson:JSON.stringify(input.profile)});s.homes.push({id:'me_'+input.id});return {id:'me_'+input.id}}};
   const fixture=document.createElement('main');fixture.id='fixture';fixture.className='mobile-town-shell';document.querySelector('#app').replaceChildren(fixture);
   const render=()=>{document.documentElement.dataset.activeTab='town';if(!fixture.isConnected)document.querySelector('#app').replaceChildren(fixture);fixture.innerHTML=sharedResidentsScreen(s);bindSharedUi({render,toast:console.log,setMode(){},setPanel(){}})};render();window.qaRender=render;
  });
  await page.locator('[data-resident-add]').click();assert.equal(await page.locator('[data-resident-apply]').count(),1);
  await page.locator('[data-resident-apply]').click();assert.ok((await page.locator('[role=status]').textContent()).includes('불러오는 중'));
  assert.ok(!(await page.locator('#fixture').textContent()).includes('캐릭터가 없어요'));
  await page.evaluate(()=>window.finishCandidates());await page.locator('[role=status]').waitFor({state:'detached'});
  await page.locator('[data-shared-residents]').click();await page.locator('[data-resident-add]').click();await page.locator('[data-create-shared-resident]').click();
  await page.locator('[data-shared-create-dialog] input').fill('멀티 새 캐릭터');await page.locator('[data-shared-create-dialog] button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('[data-shared-create-dialog] [role=status]')?.textContent==='test retry');
  await page.locator('[data-shared-create-dialog] button[type=submit]').click();await page.locator('[data-shared-create-dialog]').waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>qaCalls[0].id===qaCalls[1].id),true);assert.equal(await page.evaluate(()=>qaSnapshot.residents.length),1);
  for(const language of ['ko','en','ja'])for(const width of [384,1180]){
   await page.setViewportSize({width,height:850});await page.evaluate(async language=>{const game=await import('/state.js?v=20260909dev305'),{sharedSelection}=await import('/shared-world.js?v=20260909dev305');game.state.uiLanguage=language;sharedSelection(qaSnapshot).residentForm='';qaRender()},language);
   const bounds=await page.locator('[data-resident-add]').boundingBox();if(!bounds)console.log(await page.locator('[data-resident-add]').evaluate(el=>{let rows=[];while(el){rows.push([el.tagName,el.className,getComputedStyle(el).display,getComputedStyle(el).visibility]);el=el.parentElement}return rows}));assert(bounds&&bounds.width>40);assert.equal(await page.evaluate(()=>document.querySelector('#fixture').scrollWidth>innerWidth+2),false);
   await page.screenshot({path:resolve(output,`residents-${language}-${width}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[]);console.log('PASS roster card, loading state, retry without duplicate, 3 languages at 384/1180');
  await context.close();
}finally{await browser.close();await new Promise(done=>server.close(done))}
