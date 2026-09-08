import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-281");
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
    window.qaSnapshot={activeGroupId:'shared',selectedTownId:'shared-town',selectedResidentId:'remote',groups:[{id:'shared',name:'아주 긴 멀티 그룹 이름 테스트'}],group:{id:'shared',name:'함께 사는 마을',ownerUid:'me',buildingRevision:0,towns:[{id:'shared-town',name:'공동 마을',places:[{id:'park',name:'공원',type:'공원',x:30,y:40,stock:[]}]}]},members:[{uid:'me',role:'owner',displayName:'나'}],residents:[{id:'remote',ownerUid:'other',sourceCharacterId:'remote',sourceHomeId:'home',townId:'shared-town',name:c.name,icon:c.icon,photo:c.photo,profileJson:JSON.stringify(c),lifeJson:JSON.stringify({scene:entry,days:{[key]:{entries:[entry]}}})}],homes:[{id:'shared-home',ownerUid:'other',sourceHomeId:'home',townId:'shared-town',name:'상대의 집',layoutJson:JSON.stringify({rooms:{bedroom:{name:'2층 침실',type:'bedroom',size:'보통 방',floor:2,furniture:['침대','옷장'],image:c.photo}}}),residentNames:[c.name]}]};
    window.DrawerVillageGroups={getSnapshot:()=>window.qaSnapshot,setDetailActive(){},select(id){window.qaSnapshot={...window.qaSnapshot,activeGroupId:id,group:id?window.qaSnapshot.group:null};window.dispatchEvent(new Event('drawer-village-groups'))},selectResident(){},visitHome(){},selectTown(){}};
    window.ParallelCityAuth.getInfo=()=>({ready:true,busy:false,user:{uid:'me'},guideState:{loaded:true,seen:['observe','home','groups','town','relationship']}});
    game.state.activeTab='observe';window.dispatchEvent(new Event('drawer-village-groups'));
  });

 await page.setViewportSize({width:1480,height:920});
 await page.evaluate(async()=>{const g=await import('/state.js?v=20260909dev287');window.qaSnapshot.activeGroupId='';window.qaSnapshot.group=null;g.state.characterSettingsView='hub';location.hash='tab=character'});
 await page.waitForTimeout(700);

 const anchor=await page.locator('[data-toggle-character-roster]').first().boundingBox();await page.locator('[data-toggle-character-roster]').first().click();await page.waitForTimeout(300);const roster=await page.locator('[data-character-roster]').boundingBox();assert.ok(Math.abs(roster.x+roster.width/2-anchor.x-anchor.width/2)<3);await page.screenshot({path:resolve(output,'roster.png')});await page.locator('[data-toggle-character-roster]').first().click();
 for(const size of [{width:1024,height:600},{width:1280,height:800},{width:1480,height:920}]){await page.setViewportSize(size);await page.waitForTimeout(150);const buttons=await page.locator('.character-draft-actions button').evaluateAll(es=>es.map(e=>({r:e.getBoundingClientRect().toJSON(),cap:parseFloat(getComputedStyle(e).gridTemplateColumns),h:e.offsetHeight})));assert.equal(buttons.length,3);for(const b of buttons){assert.ok(b.r.x>=0&&b.r.right<=size.width);assert.ok(Math.abs(b.cap/b.h-.484)<.03)}await page.screenshot({path:resolve(output,'character-'+size.width+'.png')});}
 await page.evaluate(()=>location.hash='tab=home');await page.waitForTimeout(200);await page.locator('[data-home-switcher-toggle]').click();const chooser=await page.locator('[data-home-switcher]').boundingBox(),header=await page.locator('.home-native-header').boundingBox();console.log('chooser',chooser,'header',header,await page.locator('[data-home-switcher]').evaluate(e=>({style:e.getAttribute('style'),parent:e.offsetParent?.getBoundingClientRect().toJSON(),computed:getComputedStyle(e).top,transform:getComputedStyle(e).transform})));await page.screenshot({path:resolve(output,'home-chooser.png')});assert.ok(chooser.y>=header.y+header.height);assert.ok(chooser.y+chooser.height<=920);await page.screenshot({path:resolve(output,'home-chooser.png')});
 await page.evaluate(()=>location.hash='tab=settings');await page.waitForTimeout(200);await page.locator('[data-settings-pane=gameplay]').click();const select=page.locator('[data-setting=animationIntensity]');await select.selectOption('off');assert.equal(await page.locator('html').getAttribute('data-animation-intensity'),'off');await page.evaluate(()=>location.hash='tab=observe');await page.waitForTimeout(200);assert.equal(await page.locator('.native-scene-effects i').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS tablet roster anchored right, action caps preserve proportions at 1024/1280/1480, ID card layout, house chooser below header, effects preference applied');await context.close();
}finally{await browser.close();server.close()}
