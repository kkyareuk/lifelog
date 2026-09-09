import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-282");
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
  const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    game.resetAll();game.createCharacter();const c=structuredClone(game.state.characters[game.state.activeId]);
    c.name='상대 캐릭터';c.icon='world-assets/owner-forest-town.webp';c.photo='world-assets/owner-forest-town.webp';
    const now=new Date(),key=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,entry={title:'공원에서 산책하는 중',desc:'상대 캐릭터가 산책하며 바람을 쐬고 있어요.',time:'13:00',minute:780,townId:'shared-town',placeId:'park',mood:'기쁨'};
    window.qaSnapshot={activeGroupId:'shared',selectedTownId:'shared-town',selectedResidentId:'remote',groups:[{id:'shared',name:'아주 긴 멀티 그룹 이름 테스트'}],group:{id:'shared',name:'함께 사는 마을',ownerUid:'me',buildingRevision:0,towns:[{id:'shared-town',name:'공동 마을',places:[{id:'park',name:'공원',type:'공원',x:30,y:40,stock:[]}]}]},members:[{uid:'me',role:'owner',displayName:'나'}],residents:[{id:'remote',ownerUid:'other',sourceCharacterId:'remote',sourceHomeId:'home',townId:'shared-town',name:c.name,icon:c.icon,photo:c.photo,profileJson:JSON.stringify(c),lifeJson:JSON.stringify({scene:entry,days:{[key]:{entries:[entry]}}})}],homes:[{id:'shared-home',ownerUid:'other',sourceHomeId:'home',townId:'shared-town',name:'상대의 집',layoutJson:JSON.stringify({rooms:{bedroom:{name:'2층 침실',type:'bedroom',size:'보통 방',floor:2,furniture:['침대','옷장'],image:c.photo}}}),residentNames:[c.name]}]};
    window.DrawerVillageGroups={getSnapshot:()=>window.qaSnapshot,setDetailActive(){},select(id){window.qaSnapshot={...window.qaSnapshot,activeGroupId:id,group:id?window.qaSnapshot.group:null};window.dispatchEvent(new Event('drawer-village-groups'))},selectResident(){},visitHome(){},selectTown(){}};
    window.ParallelCityAuth.getInfo=()=>({ready:true,busy:false,user:{uid:'me'},guideState:{loaded:true,seen:['observe','home','groups','town','relationship']}});
    game.state.activeTab='observe';window.dispatchEvent(new Event('drawer-village-groups'));
  });
  await page.waitForTimeout(500);
  console.log('errors',errors,await page.evaluate(()=>({tab:document.documentElement.dataset.activeTab,hash:location.hash,text:document.querySelector('main')?.innerText.slice(0,800)})));
  await page.screenshot({path:resolve(output,'debug.png'),fullPage:true});
  assert.ok(await page.locator('.game-hud-moment').textContent());
  assert.ok((await page.locator('.game-hud-moment').textContent()).includes('공원에서 산책'));
  assert.ok(!(await page.locator('.game-hud-moment').textContent()).includes('같은 마을을 보고'));
  assert.ok(await page.locator('.game-hud-profile-frame img').first().evaluate(img=>img.complete&&img.naturalWidth>0),'Remote profile photo must load');
  await page.locator('[data-shared-mood]').click();await page.locator('.village-feature-dialog button[value=close]').click();
  await page.locator('.game-hud-profile-toggle').click();assert.ok((await page.locator('.game-hud-roster-drawer').textContent()).includes('다른 그룹으로 이동'));
  await page.screenshot({path:resolve(output,'shared-roster-384.png'),fullPage:true});
  await page.locator('.game-hud-profile-toggle').click();
  await page.screenshot({path:resolve(output,'shared-home-384.png'),fullPage:true});
  await page.locator('[data-open-native-log]').first().click();assert.ok((await page.locator('[data-native-log-dialog]').textContent()).includes('산책'));
  await page.locator('[data-native-log-dialog] button').last().click();
  const homeClock=await page.locator('.game-hud-top>time').boundingBox();
  await page.evaluate(()=>{location.hash='tab=home'});await page.waitForTimeout(400);
  const homeContext=await page.locator('.home-native-context').boundingBox();assert.ok(Math.abs(homeClock.y-homeContext.y)<2);assert.ok(Math.abs(homeClock.x+homeClock.width-homeContext.x-homeContext.width)<2);
  assert.ok((await page.locator('main').textContent()).includes('상대의 집'));
  assert.ok(!(await page.locator('main').textContent()).includes('새 캐릭터의 집'));
  assert.ok(await page.locator('.home-native-page').count());

  await page.evaluate(()=>{window.qaWrites=[];window.DrawerVillageGroups.saveHomeMember=async input=>{qaWrites.push(input);const h=qaSnapshot.homes.find(h=>h.id===input.homeId);if(input.kind==='resident'){const r=qaSnapshot.residents.find(r=>r.id===input.id);r.residences=[{...input.item,homeId:h.id,isPrimary:true}];r.sharedHomeId=h.id;r.residenceRevision=(r.residenceRevision||0)+1;return {revision:r.residenceRevision,residences:r.residences,sharedHomeId:h.id}}const layout=JSON.parse(h.layoutJson),key=input.kind==='pet'?'pets':'cars';layout[key]=(layout[key]||[]).filter(x=>x.id!==input.id);if(!input.remove)layout[key].push({...input.item,id:input.id});h.layoutJson=JSON.stringify(layout);h.layoutRevision=(h.layoutRevision||0)+1;return {revision:h.layoutRevision,layoutJson:h.layoutJson}}});
  const perf=await page.evaluate(()=>{const run=disabled=>{window.qaDisableCache=disabled;window.qaSceneCalls=0;const start=performance.now();window.dispatchEvent(new Event('drawer-village-groups'));return {calls:window.qaSceneCalls,ms:performance.now()-start}};const uncached=run(true),cached=run(false);return {uncached,cached}});console.log('RENDER COMPARISON',perf);assert.ok(perf.cached.calls<perf.uncached.calls,'Shared scenes are computed once per character per render');
  const privateBefore=await page.evaluate(()=>JSON.stringify(window.ParallelCity.getState().homes));
  await page.locator('[data-home-edit]').click();
  await page.locator('[data-open-home-feature="members"]').click();
  for(const [kind,name] of [['pet','봄봄'],['car','가족 차']]){
    await page.locator(`[data-member-add="${kind}"]`).click();
    const count=await page.evaluate(()=>qaWrites.length);
    await page.locator('.shared-home-dialog [name=name]').fill(name);
    await page.evaluate(()=>window.dispatchEvent(new Event('drawer-village-groups')));
    assert.equal(await page.locator('.shared-home-dialog [name=name]').inputValue(),name);
    assert.equal(await page.evaluate(()=>qaWrites.length),count,'No writes while typing');
    await page.screenshot({path:resolve(output,kind+'-editor.png')});
    await page.locator('.shared-home-dialog .primary').click();
    await page.waitForFunction(()=>!document.querySelector('.shared-home-dialog'));
  }
  await page.locator('[data-member-edit="resident"]').first().click();
  await page.locator('.shared-home-dialog [name=notes]').fill('함께 사는 집');
  await page.locator('.shared-home-dialog [name=stayPattern]').selectOption('주말 중심');
  await page.locator('.shared-home-dialog .primary').click();
  await page.waitForFunction(()=>!document.querySelector('.shared-home-dialog'));
  assert.equal(await page.evaluate(()=>qaWrites.length),3);
  const after=await page.evaluate(()=>window.ParallelCity.getState().homes),before=JSON.parse(privateBefore);for(const h of Object.values(after))if(h.lifeSimulation)delete h.lifeSimulation.updatedAt;for(const h of Object.values(before))if(h.lifeSimulation)delete h.lifeSimulation.updatedAt;assert.deepEqual(after,before);
  await page.locator('[data-member-edit="resident"]').first().click();
  assert.equal(await page.locator('.shared-home-dialog [name=notes]').inputValue(),'함께 사는 집');
  await page.locator('.shared-home-dialog .home-design-back').click();
  assert.equal(await page.evaluate(()=>qaWrites.length),3,'Cancel does not save');
  await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(300);await page.locator('[data-open-home-feature="members"]').click();
  await page.locator('[data-member-edit="car"]').first().click();
  await page.screenshot({path:resolve(output,'car-editor-tablet.png')});
  await page.locator('.shared-home-dialog .primary').scrollIntoViewIfNeeded();
  const saveBox=await page.locator('.shared-home-dialog .primary').boundingBox();assert.ok(saveBox.y+saveBox.height<=800);
  assert.deepEqual(errors,[]);
  console.log('PASS shared home member edits: save once, isolated private world, dialog survives snapshots');
  await context.close();
}finally{await browser.close();server.close()}
