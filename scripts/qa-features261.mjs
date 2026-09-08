import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-261");
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
  const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(8000);page.on("pageerror",error=>errors.push(error.message));page.on("console",msg=>{if(msg.type()==="error"&&!msg.text().includes("Failed to load resource"))errors.push(msg.text())});
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType("resource").find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    game.resetAll();game.createCharacter();const a=game.state.activeId,home=game.state.characters[a].homeId;
    game.createCharacter();const b=game.state.activeId;
    Object.assign(game.state.characters[a],{name:"안테",job:"연구원"});Object.assign(game.state.characters[b],{name:"네리네",job:"여관주인"});
    game.setHomeResidents(home,[a,b]);game.state.activeId=a;game.state.activeHomeId=home;game.state.activeTab="home";game.save(true);
    for(const tab of ["home","character"])await window.ParallelCityAuth.markGuideSeen(tab);
    location.hash="tab=home";
  });
  await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.activeTab==="home");
  await page.evaluate(()=>{location.hash="tab=character"});
  await page.waitForFunction(()=>document.documentElement.dataset.activeTab==="character");
  try{await page.locator("dialog.page-guide[open] button[value=ok]").last().click({timeout:2000})}catch{}
  await page.locator('.character-full-choice[data-open-full-character-settings]').click();await page.locator('[data-character-pane="body"]').last().evaluate(node=>node.click());
  const summary=page.locator('[data-open-body-choice="appearanceSummaries"]');await summary.waitFor({state:"visible"});await summary.click();
  const dialog=page.locator('[data-body-choice-dialog]');await dialog.waitFor({state:"visible"});
  const option=dialog.locator('[data-body-choice-panel="appearanceSummaries"] [data-body-list]').first(),chosen=await option.getAttribute("data-value");await option.click();await dialog.locator('button[value="close"]').first().click();
  assert.ok((await summary.textContent()).includes(chosen),"총평 선택 직후 요약에 반영된다");
  await page.reload();await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(()=>{location.hash="tab=character"});await page.waitForFunction(()=>document.documentElement.dataset.activeTab==="character");
  try{await page.locator("dialog.page-guide[open] button[value=ok]").last().click({timeout:2000})}catch{}
  await page.locator('.character-full-choice[data-open-full-character-settings]').click();await page.locator('[data-character-pane="body"]').last().evaluate(node=>node.click());
  assert.ok((await page.locator('[data-open-body-choice="appearanceSummaries"]').textContent()).includes(chosen),"화면을 나갔다 돌아와도 총평이 유지된다");
  await page.screenshot({path:resolve(output,"phone-body-summary-persisted.png"),fullPage:true});

  const checks=await page.evaluate(async()=>{
    const game=await import('/state.js?v=20260909dev283'),transfer=await import('/settings-transfer.js?v=20260909dev283'),c=game.state.characters[game.state.activeId],home=game.state.homes[c.homeId];
    home.floorCount=2;home.rooms.upstairs={...structuredClone(home.rooms.bedroom),name:'2층 침실',type:'bedroom',floor:2,ownerMode:'selected',ownerCharacterIds:[]};
    game.updateRoom(home.id,'upstairs',{ownerMode:'selected',ownerCharacterIds:[c.id]});
    const ownerToRoom=c.sleepRoomId==='upstairs'&&c.residences.find(r=>r.homeId===home.id).sleepRoomId==='upstairs';
    game.updateCharacterResidence(c.id,home.id,{sleepRoomId:'bedroom'});
    const roomToOwner=home.rooms.bedroom.ownerCharacterIds.includes(c.id)&&!home.rooms.upstairs.ownerCharacterIds.includes(c.id);
    game.updateCharacterResidence(c.id,home.id,{sleepRoomId:''});const cleared=c.sleepRoomId==='';
    const file=transfer.characterSettingsFile(c),id=transfer.importCharacterSettings(transfer.readSettingsFile(JSON.stringify(file)),10);
    const imported=game.state.characters[id];const roundtrip=JSON.stringify(imported.bodyProfile.appearanceSummaries)===JSON.stringify(c.bodyProfile.appearanceSummaries)&&id!==c.id&&!('days' in file.character)&&!('homeId' in file.character);
    const catalog={format:'drawer-village-catalog',version:1,catalog:{flower:[{id:'import-flower',name:'장미',kind:'flower'}]}};
    transfer.mergeCatalogFile(catalog);transfer.mergeCatalogFile(catalog);const idempotent=game.state.catalog.flower.length===1;
    for(let i=1;i<80;i++)game.addCatalogItem('flower',{name:'꽃 '+i});const limited=game.addCatalogItem('flower',{name:'81번째'})===null&&game.state.catalog.flower.length===80;
    let rejected=false;try{transfer.readSettingsFile(JSON.stringify({format:'drawer-village-catalog',version:1,catalog:{misc:Array.from({length:81},()=>({name:'물건'}))}}))}catch{rejected=true}
    const drinkId=game.addCatalogItem('drink',{name:'테스트 모히토',category:'모히토'});game.save(true);window.testDrinkId=drinkId;
    return {ownerToRoom,roomToOwner,cleared,roundtrip,idempotent,limited,rejected};
  });for(const [name,ok] of Object.entries(checks))assert.equal(ok,true,name);
  await page.evaluate(()=>{location.hash='tab=catalog'});await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='catalog');
  try{await page.locator('dialog.page-guide[open] button[value=ok]').last().click({timeout:2000})}catch{}
  await page.screenshot({path:resolve(output,'dictionary-list.png'),fullPage:true});
  const downloaded=page.waitForEvent('download');await page.locator('[data-settings-transfer="catalog-export"]').click();await page.locator('.catalog-selection-dialog button').nth(0).click();await page.locator('.catalog-selection-dialog button').last().click();
  const download=await downloaded;const downloadedFile=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(downloadedFile.catalog.flower.length,80);
  await page.locator('[data-settings-transfer="catalog-export"]').click();
  assert.equal(await page.locator('.catalog-selection-dialog button').last().isDisabled(),true);
  await page.locator('.catalog-selection-dialog input[type=checkbox]').first().check();
  const oneDownload=page.waitForEvent('download');await page.locator('.catalog-selection-dialog button').last().click();
  const oneFile=JSON.parse(await readFile(await (await oneDownload).path(),'utf8'));
  assert.equal(Object.values(oneFile.catalog).flat().length,1,'Only the selected item is exported');
  const chooserPromise=page.waitForEvent('filechooser');await page.locator('[data-settings-transfer="catalog-import"]').click();
  await (await chooserPromise).setFiles({name:'items.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'drawer-village-catalog',version:1,catalog:{misc:[{id:'qa-one',name:'선택한 물건'},{id:'qa-two',name:'선택하지 않은 물건'}]}}))});
  await page.locator('.catalog-selection-dialog input[type=checkbox]').first().check();await page.locator('.catalog-selection-dialog button').last().click();
  await page.waitForFunction(()=>window.ParallelCity.getState().catalog.misc.some(x=>x.importSourceId==='qa-one'));
  assert.equal(await page.evaluate(()=>window.ParallelCity.getState().catalog.misc.some(x=>x.importSourceId==='qa-two')),false);
  const fullDownload=page.waitForEvent('download');await page.evaluate(()=>{const b=document.createElement('button');b.dataset.settingsTransfer='all-export';document.body.append(b);b.click();b.remove()});
  const backup=JSON.parse(await readFile(await (await fullDownload).path(),'utf8'));assert.equal(backup.format,'drawer-village-backup');assert.ok(Object.keys(backup.gameState.characters).length>=3);
  await page.locator('[data-dict-kind="drink"]').click();await page.locator('[data-dict-open]').first().click();
  assert.equal(await page.locator('[data-dict-field="spicy"]').count(),0);
  for(const field of ['sweet','acidity','carbonation','caffeine','alcohol','temperature'])assert.equal(await page.locator('[data-dict-field="'+field+'"]').count(),1);
  await page.screenshot({path:resolve(output,'drink-fields.png'),fullPage:true});await page.locator('[data-dict-close]').click();
  await page.evaluate(async()=>{
    window.ParallelCityAuth={...window.ParallelCityAuth,getInfo:()=>({ready:true,user:{uid:'qa-owner'},entitlements:{townSlotPacks:4}})};
    const groups=Array.from({length:6},(_,i)=>({id:'qa-'+i,name:'함께 사는 마을 '+(i+1),ownerUid:i===0?'qa-owner':'friend',memberCount:i+2,towns:[{id:'town-'+i,name:'멀티 마을',previewImage:'./assets/multiplayer/reference-1.png'}]}));
    window.DrawerVillageGroups={getSnapshot:()=>({groups}),select:id=>window.selectedGroup=id,create:async()=>{},join:async()=>{}};
    (await import('/groups.js?v=20260909dev283')).showMultiplayerList();location.hash='tab=groups';
  });await page.waitForFunction(()=>!!document.querySelector('.directory-card'));
  try{await page.locator('dialog.page-guide[open] button[value=ok]').last().click({timeout:2000})}catch{}
  await page.setViewportSize({width:412,height:917});await page.waitForFunction(()=>[...document.querySelectorAll('.directory-portrait img')].every(i=>i.complete&&i.naturalWidth>0));await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.directory-portrait img')].map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});await page.screenshot({path:resolve(output,'multiplayer-412.png'),fullPage:true});
    const boxes=await page.locator('.directory-card').evaluateAll(cards=>cards.slice(0,3).map(c=>{const r=c.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width}}));assert.equal(boxes[0].y,boxes[2].y);assert.ok(boxes[0].x<boxes[1].x&&boxes[1].x<boxes[2].x);
  await page.locator('[data-directory-filter="owned"]').click();assert.equal(await page.locator('[data-directory-name]:visible').count(),1);
  await page.locator('[data-directory-filter="all"]').click();await page.locator('[data-directory-search]').fill('6');assert.equal(await page.locator('[data-directory-name]:visible').count(),1);await page.locator('[data-directory-search]').fill('');
  await page.locator('[data-focus-multiplayer-create]').click();assert.equal(await page.locator('[data-group-create-dialog]').isVisible(),true);assert.ok(await page.locator('[data-slot-available]').count());await page.screenshot({path:resolve(output,'group-slots.png')});await page.locator('[data-group-dialog-close]').click();
  await page.setViewportSize({width:384,height:854});await page.screenshot({path:resolve(output,'multiplayer-384.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  console.log('PASS settings transfer, room ownership, 80-item limits, drink fields and multiplayer controls',checks);

  assert.deepEqual(errors,[]);
  console.log("PASS 261: full-settings summary updates immediately and survives reload");
  await page.evaluate(async()=>{const {state}=await import('/state.js?v=20260909dev283');const home=state.homes[state.characters[state.activeId].homeId];home.rooms={bedroom:{name:'침실',type:'bedroom',floor:1,size:'보통 방',furniture:['커플 침대'],furniturePlacements:[{id:'qa-side-bed',item:'커플 침대',x:50,y:50,rotation:0,scale:1,layer:1,props:[]}]}};home.activeFloor=1;state.activeHomeId=home.id;state.homeEditMode=true;state.activeTab='home';location.hash='tab=home';window.ParallelCity.mediaChanged()});
  await page.locator('[data-home-edit]').click();
  await page.locator('[data-furniture-placement="qa-side-bed"]').click();
  await page.locator('[data-furniture-command="rotate"]').click();
  assert.equal(await page.locator('[data-furniture-placement="qa-side-bed"]').getAttribute('data-bed-side'),'true');
  assert.match(await page.locator('[data-furniture-placement="qa-side-bed"] .couple-bed-base').getAttribute('src'),/side-base.svg/);
  console.log('PASS live furniture rotation immediately switches to supplied side artwork');
  await page.evaluate(async()=>{window.ParallelCityAuth.savePublicProfile=async input=>{window.qaProfileInput=input.name;return {name:input.name,photoURL:''}};const p=await import('/user-profile.js?v=20260909dev283');p.openUserProfile()});
  await page.locator('[data-user-profile-dialog] input[name=name]').fill('프로필 테스트');await page.locator('[data-user-profile-dialog] button[type=submit]').click();
  await page.waitForFunction(()=>window.ParallelCity.getState().ownerName==='프로필 테스트');assert.equal(await page.evaluate(()=>window.qaProfileInput),'프로필 테스트');
  console.log('PASS single-item export/import and profile editor save flow');
  await context.close();
}finally{await browser.close();server.close()}
