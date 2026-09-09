import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-288");
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

const {advanceSharedLife}=await import('../server-life.mjs');
const game=await import('../state.js?v=20260909dev292');game.createCharacter();const profile=structuredClone(game.state.characters[game.state.activeId]);
const now=Date.now(),town={id:'t',name:'동기화 마을',places:[]},homes=['a','b'].map((id,i)=>({id:'h'+id,ownerUid:id,sourceHomeId:'h'+id,townId:'t',name:id+' 집',mapX:20+i*50,mapY:30+i*40,layoutJson:JSON.stringify({rooms:{entry:{type:'entry',name:'현관',floor:1},living:{type:'living',name:'거실',floor:1,furniture:[]}}})}));
let snapshot={activeGroupId:'g',selectedTownId:'t',group:{id:'g',ownerUid:'a',name:'동기화 그룹',towns:[town]},groups:[],catalog:[{id:'book',items:[{id:'topic-book',name:'별자리 도감'}]}],members:[{uid:'a',role:'owner'},{uid:'b',role:'member'}],residents:['a','b'].map((id,i)=>({id,ownerUid:id,sharedHomeId:'h'+id,townId:'t',name:i?'안테':'짭바이',profileJson:JSON.stringify({...profile,ageGroup:'성인',name:i?'안테':'짭바이',photo:'',ldImage:i?'world-assets/owner-forest-town.webp':'',icon:'world-assets/owner-forest-town.webp',homeId:'h'+id,createdAt:1}),lifeJson:JSON.stringify({scene:{home:true,visitHomeId:'h'+id,room:'living',title:'수집품을 손질하는 중',townId:'t'},days:{}})})),homes,relationships:[{id:'pair',a:'a',b:'b',displayOrder:['a','b']}]};
const contexts=[],pages=[];let requests=0;
try{
 for(const id of ['a','b']){
 const c=await browser.newContext({viewport:{width:1480,height:920},hasTouch:true,serviceWorkers:'block'});contexts.push(c);await c.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const p=await c.newPage();p.setDefaultTimeout(8000);pages.push(p);p.on('pageerror',e=>{throw e});await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity);
 await p.exposeFunction('qaCommand',async command=>{requests++;const lives=advanceSharedLife(snapshot,Date.now(),command);snapshot.residents=snapshot.residents.map(r=>({...r,lifeJson:lives.find(l=>l.id===r.id).lifeJson}));await Promise.all(pages.map(page=>page.evaluate(s=>{window.qaSnapshot={...s,selectedResidentId:window.qaUid};window.dispatchEvent(new Event('drawer-village-groups'))},snapshot)))});
 await p.evaluate(async({snapshot,id})=>{const g=await import('/state.js?v=20260909dev292');g.createCharacter();g.state.homeVisualMode='ld';g.state.activeTab='observe';location.hash='tab=observe';window.qaUid=id;window.qaSnapshot={...snapshot,selectedResidentId:id};window.ParallelCityAuth.getInfo=()=>({ready:true,busy:false,user:{uid:id},guideState:{loaded:true,seen:['observe','character','home','town','groups']}});window.DrawerVillageGroups={getSnapshot:()=>window.qaSnapshot,setDetailActive(){},selectResident(cid){window.qaSnapshot.selectedResidentId=cid;window.dispatchEvent(new Event('drawer-village-groups'))},command:command=>window.qaCommand(command)};window.dispatchEvent(new Event('drawer-village-groups'))},{snapshot,id});
 }
 await pages[0].locator('[data-shared-command]').click();await pages[0].locator('[data-direct-category=social]').click();await pages[0].locator('.direct-step-choice').filter({hasText:'함께할 상대'}).click();await pages[0].locator('[data-direct-target=b]').click();await pages[0].locator('.direct-step-choice').filter({hasText:'지금 할 일'}).click();await pages[0].locator('[data-direct-social-action=talk]').click();await pages[0].locator('.direct-step-choice').filter({hasText:'대화 내용'}).click();assert.ok(await pages[0].locator('[data-direct-topic=안테]').count());await pages[0].locator('[data-direct-topic="별자리 도감"]').click();await pages[0].locator('[data-direct-social-submit]').click();
 await pages[1].waitForFunction(()=>document.querySelector('.game-hud-moment')?.textContent.includes('기다리는'));
 const life=JSON.parse(snapshot.residents[0].lifeJson),route=life.directive.journey,townSegment=route.segments.find(s=>s.surface==='town');assert.ok(townSegment);
 // Both screens render the same authoritative route at the same wall-clock time.
 for(const page of pages){await page.evaluate(t=>{window.RealDate??=Date;window.Date=class extends window.RealDate{constructor(...args){super(...(args.length?args:[t]))}static now(){return t}};window.dispatchEvent(new Event('drawer-village-groups'))},townSegment.start+1000);await page.waitForTimeout(100);assert.equal(await page.locator('.tablet-observe-map .meeting-walker[data-person=a]').count(),1);}
 const routes=await Promise.all(pages.map(p=>p.locator('.tablet-observe-map .meeting-walker[data-person=a]').getAttribute('style')));assert.equal(routes[0],routes[1]);assert.equal(requests,1);
 await pages[1].locator('.tablet-observe-map [data-person=a]').click({force:true});await pages[1].waitForTimeout(100);assert.ok((await pages[1].locator('.game-hud-profile-copy').innerText()).includes('짭바이'));
 for(const page of pages){await page.evaluate(t=>{window.RealDate??=Date;window.Date=class extends window.RealDate{constructor(...args){super(...(args.length?args:[t]))}static now(){return t}};window.dispatchEvent(new Event('drawer-village-groups'))},route.arrivesAt+1000);await page.waitForTimeout(100);assert.ok((await page.locator('.game-hud-moment').innerText()).includes('대화'));const pair=page.locator('.native-scene-lineup-person');assert.equal(await pair.count(),2);const boxes=await pair.evaluateAll(es=>es.map(e=>({name:e.textContent,x:e.getBoundingClientRect().x})));assert.ok(boxes[0].x<boxes[1].x,JSON.stringify(boxes));assert.ok(boxes[1].name.includes('안테'));await page.screenshot({path:resolve(output,'two-account-'+pages.indexOf(page)+'.png')});}
 for(const page of pages){await page.evaluate(()=>{qaSnapshot.visitingHomeId='hb';location.hash='tab=home'});await page.waitForSelector('.meeting-pair.is-talking');assert.notEqual(await page.locator('.meeting-pair-faces').first().evaluate(e=>getComputedStyle(e,'::after').animationName),'none');await page.screenshot({path:resolve(output,'house-talk288.png')});await page.evaluate(()=>{location.hash='tab=observe'});}
 console.log('PASS house conversation animation on both accounts');
 await pages[0].setViewportSize({width:384,height:420});await pages[0].waitForTimeout(150);
 await pages[0].locator('[data-shared-command]').click();await pages[0].locator('[data-direct-category=social]').click();
 const cdp=await contexts[0].newCDPSession(pages[0]);
 const rootChoice=pages[0].locator('.direct-step-choice').filter({hasText:'함께할 상대'}),rootBox=await rootChoice.boundingBox();
 const beforeRoot=await pages[0].locator('.direct-step-flow').evaluate(e=>e.scrollTop);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rootBox.x+rootBox.width/2,y:rootBox.y+rootBox.height/2}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:rootBox.x+rootBox.width/2,y:rootBox.y+rootBox.height/2-i*12}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pages[0].waitForTimeout(100);
 assert.ok(await pages[0].locator('dialog[open]').evaluate(e=>e.scrollTop+e.querySelector('.direct-step-flow').scrollTop)>beforeRoot,'Touch swipe starting on companion button must scroll');
 console.log('PASS real touch scroll starting on root command button');
 await pages[0].locator('.direct-step-choice').filter({hasText:'지금 할 일'}).click();
 const scroll=pages[0].locator('.direct-step-flow');console.log(await scroll.evaluate(e=>({height:e.clientHeight,scroll:e.scrollHeight,css:getComputedStyle(e).cssText,max:getComputedStyle(e).maxHeight,overflow:getComputedStyle(e).overflowY,buttons:e.querySelectorAll('button:not([hidden])').length})));await pages[0].screenshot({path:resolve(output,'command284.png')});assert.ok(await scroll.evaluate(e=>e.scrollHeight>e.clientHeight),'Action choices must have a scrollable container');await scroll.hover();await pages[0].mouse.wheel(0,600);await pages[0].waitForTimeout(150);assert.ok(await scroll.evaluate(e=>e.scrollTop>0));
 console.log('PASS narrow activity chooser scroll');
 await pages[0].locator('dialog[open] header button').click();
 await pages[0].evaluate(()=>{qaSnapshot={...qaSnapshot,residents:qaSnapshot.residents.map(r=>({...r,lifeJson:JSON.stringify({scene:{home:true,visitHomeId:'ha',room:'living',title:'씻는 중',desc:'비누 거품으로 씻고 있어요.',townId:'t'},days:{}})})),visitingHomeId:'ha'};location.hash='tab=home'});
 await pages[0].waitForTimeout(300);await pages[0].evaluate(()=>{const t=Date.now()+120000;window.Date=class extends window.RealDate{constructor(...args){super(...(args.length?args:[t]))}static now(){return t}};window.dispatchEvent(new Event('drawer-village-groups'))});await pages[0].waitForTimeout(300);console.log(await pages[0].evaluate(()=>({tab:document.documentElement.dataset.activeTab,text:document.querySelector('main')?.innerText.slice(0,700),people:[...document.querySelectorAll('.home-person,.meeting-walker')].map(e=>({class:e.className,title:e.getAttribute('aria-label')}))})));await pages[0].screenshot({path:resolve(output,'washing284.png')});assert.ok(await pages[0].locator('.is-washing').count(),'Home washing scene exposes the washing animation');
 await pages[0].screenshot({path:resolve(output,'washing284.png')});


 await pages[0].setViewportSize({width:1280,height:800});await pages[0].evaluate(()=>{window.DrawerVillageNavigation.go('town');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await pages[0].locator('[data-mobile-town-decoration-mode]').click();
 const building=pages[0].locator('.town-edit [data-home-map=ha]');await building.scrollIntoViewIfNeeded();const buildingBox=await building.boundingBox();
 await pages[0].mouse.move(buildingBox.x+buildingBox.width/2,buildingBox.y+buildingBox.height/2);await pages[0].mouse.down();await pages[0].mouse.move(buildingBox.x+buildingBox.width/2+47,buildingBox.y+buildingBox.height/2+36,{steps:8});
 const snapped=await building.evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));assert.ok(Math.abs(snapped.x/2-Math.round(snapped.x/2))<.001);assert.ok(Math.abs(snapped.y/3.5-Math.round(snapped.y/3.5))<.001);await pages[0].mouse.up();
 assert.equal(requests,1);await pages[0].locator('button').filter({hasText:'편집 취소'}).click();console.log('PASS multiplayer building snaps while dragging; no command write during editing');
 const timings=[];
 for(const tab of ['relationship','settings','home','town','mailbox']){
   await pages[0].evaluate(tab=>window.DrawerVillageNavigation.go(tab),tab);
   await pages[0].waitForTimeout(100);
   await pages[0].evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
   if(tab==='relationship')await pages[0].evaluate(()=>{document.querySelector('.relationship-character-rail')?.dispatchEvent(new Event('scroll'))});
   const result=await pages[0].evaluate(()=>{const start=performance.now();window.DrawerVillageNavigation.back();return {ms:performance.now()-start,tab:window.DrawerVillageNavigation.current()}});
   assert.equal(result.tab,'observe');timings.push({tab,...result});
   await pages[0].waitForTimeout(350);assert.equal(await pages[0].evaluate(()=>window.DrawerVillageNavigation.current()),'observe');
 }
 console.log('PASS back navigation from five tabs, including a pending relationship scroll',JSON.stringify(timings));

 await pages[0].setViewportSize({width:412,height:883});
 await pages[0].evaluate(async()=>{qaSnapshot={...qaSnapshot,activeGroupId:'',group:null};const g=await import('/state.js?v=20260909dev292');window.qaGame=g;window.DrawerVillageNavigation.go('character');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await pages[0].locator('[data-open-full-character-settings]:visible').first().click();
 for(const size of [{width:412,height:883},{width:1280,height:800}]){
  await pages[0].setViewportSize(size);
  for(const pane of ['visual','profile','body','wardrobe','personality','taste','closet']){
   await pages[0].evaluate(pane=>{qaGame.state.characterPane=pane;qaGame.state.characterPersonalityPane='emotion';window.ParallelCity.mediaChanged()},pane);
   assert.equal(await pages[0].locator('.view-error').count(),0,'Book page '+pane);
  }
 }
 await pages[0].setViewportSize({width:412,height:883});
 await pages[0].evaluate(()=>{qaGame.state.characterPane='personality';qaGame.state.characterPersonalityPane='emotion';window.ParallelCity.mediaChanged()});
 await pages[0].locator('[data-touch-reactions]').click();
 for(const value of ['간지럼을 잘 탐','갑작스러운 접촉에 쉽게 놀람'])await pages[0].locator('[data-reaction]').filter({hasText:value}).click();
 await pages[0].locator('dialog[open] button[value=apply]').click();
 await pages[0].waitForFunction(()=>Array.isArray(qaGame.state.characters[qaGame.state.activeId].touchReaction));
 const reactions=await pages[0].evaluate(()=>qaGame.state.characters[qaGame.state.activeId].touchReaction);
 assert.ok(reactions.includes('간지럼을 잘 탐')&&reactions.includes('갑작스러운 접촉에 쉽게 놀람'));
 await pages[0].locator('[data-touch-reactions]').click();assert.equal(await pages[0].locator('[data-reaction][aria-pressed=true]').count(),reactions.length);
 await pages[0].screenshot({path:resolve(output,'touch284.png')});

 await pages[0].locator('dialog[open] button[value=close]').click();await pages[0].waitForTimeout(50);
 await pages[0].evaluate(()=>{qaGame.state.characterPane='wardrobe';window.ParallelCity.mediaChanged()});
 assert.equal(await pages[0].locator('[data-field=traditionalClothing]').count(),0);
 await pages[0].locator('[data-open-book-list=accessories]').click();
 for(const value of ['반지','링 귀고리','목걸이'])await pages[0].locator(`[data-book-list-choice=accessories][data-value="${value}"]`).click();
 assert.deepEqual(await pages[0].evaluate(()=>qaGame.state.characters[qaGame.state.activeId].accessories),['반지','링 귀고리','목걸이']);
 await pages[0].locator('dialog[open] button[value=apply]').click();await pages[0].waitForTimeout(50);
 await pages[0].locator('[data-open-book-list=favoriteFashionStyles]').click();
 await pages[0].locator('[data-book-list-choice=favoriteFashionStyles][data-value="전통의상"]').click();
 assert.ok(await pages[0].evaluate(()=>qaGame.state.characters[qaGame.state.activeId].favoriteFashionStyles.includes('전통의상')));
 console.log('PASS multiple accessories and traditional attire in fashion choices');
 console.log('PASS phone/tablet character book pages and multiple touch reactions persist');
 await pages[0].evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());qaGame.createCharacter();window.DrawerVillageNavigation.go('relationship')});
 await pages[0].waitForTimeout(100);await pages[0].evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await pages[0].locator('[data-open-official-relations]').click();await pages[0].locator('[data-add-rel]').click();
 await pages[0].locator('.relation-editor-dialog select[name=type]').selectOption({label:'사제 관계'});
 const teachers=await pages[0].locator('.relation-editor-dialog select[name=teacherId] option').evaluateAll(es=>es.map(e=>e.value));assert.ok(teachers.length>=2);
 await pages[0].locator('.relation-editor-dialog select[name=teacherId]').selectOption(teachers[1]);
 await pages[0].locator('.relation-editor-dialog [value=save]').last().click();
 await pages[0].waitForFunction(()=>Object.values(qaGame.state.relationships).some(r=>r.type==='사제 관계'));
 assert.equal(await pages[0].evaluate(()=>Object.values(qaGame.state.relationships).find(r=>r.type==='사제 관계')?.teacherId),teachers[1]);
 console.log('PASS teacher selection persists independently of character display order');
 assert.equal(requests,1,'Animation/arrival/selection must not submit extra writes');console.log('PASS two isolated accounts share departure, visible route, waiting and arrival with one command; tablet map selects remote character');
}finally{for(const c of contexts)await c.close();await browser.close();server.close()}
