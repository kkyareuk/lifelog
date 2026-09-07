import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-265");
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
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    game.resetAll();game.createCharacter();const c=structuredClone(game.state.characters[game.state.activeId]);
    c.name='상대 캐릭터';c.icon='world-assets/owner-forest-town.webp';c.photo='world-assets/owner-forest-town.webp';
    const now=new Date(),key=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,entry={title:'공원에서 산책하는 중',desc:'상대 캐릭터가 산책하며 바람을 쐬고 있어요.',time:'13:00',minute:780,townId:'shared-town',placeId:'park',mood:'기쁨'};
    window.qaSnapshot={activeGroupId:'shared',selectedTownId:'shared-town',selectedResidentId:'remote',groups:[{id:'shared',name:'아주 긴 멀티 그룹 이름 테스트'}],group:{id:'shared',name:'함께 사는 마을',ownerUid:'me',buildingRevision:0,towns:[{id:'shared-town',name:'공동 마을',places:[{id:'park',name:'공원',type:'공원',x:30,y:40,stock:[]}]}]},members:[{uid:'me',role:'owner',displayName:'나'}],residents:[{id:'remote',ownerUid:'other',sourceCharacterId:'remote',sourceHomeId:'home',townId:'shared-town',name:c.name,icon:c.icon,photo:c.photo,profileJson:JSON.stringify(c),lifeJson:JSON.stringify({scene:entry,days:{[key]:{entries:[entry]}}})}],homes:[{id:'shared-home',ownerUid:'other',sourceHomeId:'home',townId:'shared-town',name:'상대의 집',layoutJson:JSON.stringify({rooms:{bedroom:{name:'2층 침실',floor:2,image:c.photo}}}),residentNames:[c.name]}]};
    window.DrawerVillageGroups={getSnapshot:()=>window.qaSnapshot,setDetailActive(){},select(id){window.qaSnapshot={...window.qaSnapshot,activeGroupId:id,group:id?window.qaSnapshot.group:null};window.dispatchEvent(new Event('drawer-village-groups'))},selectResident(){},visitHome(){},selectTown(){}};
    window.ParallelCityAuth.getInfo=()=>({ready:true,busy:false,user:{uid:'me'},guideState:{loaded:true,seen:['observe','home','groups','town']}});
    game.state.activeTab='observe';window.dispatchEvent(new Event('drawer-village-groups'));
  });
  await page.waitForTimeout(500);
  console.log('errors',errors,await page.evaluate(()=>({tab:document.documentElement.dataset.activeTab,hash:location.hash,text:document.querySelector('main')?.innerText.slice(0,800)})));
  await page.screenshot({path:resolve(output,'debug.png'),fullPage:true});
  assert.ok(await page.locator('.game-hud-moment').textContent());
  assert.ok((await page.locator('.game-hud-moment').textContent()).includes('공원에서 산책'));
  assert.ok(!(await page.locator('.game-hud-moment').textContent()).includes('같은 마을을 보고'));
  assert.ok(await page.locator('.game-hud-profile-frame img').first().evaluate(img=>img.complete&&img.naturalWidth>0),'Remote profile photo must load');
  await page.locator('[data-shared-mood]').click();await page.locator('[data-shared-mood-dialog] button').click();
  await page.locator('.game-hud-profile-toggle').click();assert.ok((await page.locator('.game-hud-roster-drawer').textContent()).includes('다른 그룹으로 이동'));
  await page.screenshot({path:resolve(output,'shared-roster-384.png'),fullPage:true});
  await page.locator('.game-hud-profile-toggle').click();
  await page.screenshot({path:resolve(output,'shared-home-384.png'),fullPage:true});
  await page.locator('[data-open-native-log]').first().click();assert.ok((await page.locator('[data-native-log-dialog]').textContent()).includes('산책'));
  await page.locator('[data-native-log-dialog] button').last().click();
  await page.evaluate(()=>{location.hash='tab=home'});await page.waitForTimeout(400);
  assert.ok((await page.locator('main').textContent()).includes('상대의 집'));
  assert.ok(!(await page.locator('main').textContent()).includes('새 캐릭터의 집'));
  await page.screenshot({path:resolve(output,'shared-houses-384.png'),fullPage:true});
  await page.evaluate(()=>{location.hash='tab=groups'});await page.waitForTimeout(400);
  await page.screenshot({path:resolve(output,'shared-directory-384.png'),fullPage:true});
  await page.locator('[data-group-open]').first().click();await page.waitForTimeout(300);
  await page.screenshot({path:resolve(output,'shared-detail-384.png'),fullPage:true});
  await page.locator('details[name="group-picker"]').first().locator('summary').click();
  await page.locator('details[name="group-picker"]').last().locator('summary').click();
  assert.equal(await page.locator('details[name="group-picker"][open]').count(),1);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);assert.equal(overflow,false,'No horizontal overflow');
  await page.evaluate(()=>{const r=window.qaSnapshot.residents[0];window.qaSnapshot.residents.push({...r,id:'mine',name:'내 캐릭터',ownerUid:'me'});window.qaSnapshot.incomingProposals=[{id:'proposal',sourceId:'remote',targetId:'mine',sourceName:r.name,targetName:'내 캐릭터',type:'친구',status:'pending',recipientUid:'me'}];window.qaCalls=[];Object.assign(window.DrawerVillageGroups,{propose:async value=>window.qaCalls.push({action:'propose',...value}),respond:async value=>window.qaCalls.push({action:'respond',...value}),saveView:async value=>window.qaCalls.push({action:'view',...value}),advanceLife:async()=>{}});location.hash='tab=relationship'});
  await page.locator('[data-group-proposal] input[name=type]').fill('보호자·피보호자');
  await page.locator('[data-group-proposal] button[type=submit]').click();
  await page.locator('[data-group-perception] textarea').fill('신뢰하는 사람');await page.locator('[data-group-perception] button').click();
  await page.locator('[data-group-response] textarea').fill('조금 더 알아가고 싶어요');await page.locator('[data-group-response] button[name=decline]').click();
  assert.deepEqual(await page.evaluate(()=>window.qaCalls.map(x=>x.action)),['propose','view','respond']);
  assert.equal(await page.evaluate(()=>window.qaCalls.at(-1).accept),false);
  for(const language of ['ko','en','ja']){await page.evaluate(async lang=>{const g=await import('/state.js?v=20260907dev266');g.state.uiLanguage=lang;window.ParallelCity.mediaChanged()},language);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);await page.screenshot({path:resolve(output,'shared-relations-'+language+'-384.png'),fullPage:true});}
  console.log('PASS relationship proposal, perception, decline reason and three-language phone layout');
  console.log('errors',errors);assert.deepEqual(errors,[]);
  await context.close();
}finally{await browser.close();server.close()}
