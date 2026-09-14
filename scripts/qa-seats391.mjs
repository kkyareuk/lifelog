import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-life388');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root))throw Error();let body=await readFile(path==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(path==='/views.js')body=body.toString()+'\nexport {homeLifePersonMarkup,homeBedForegroundStatusMarkup};';if(path==='/simulation.js')body=body.toString()+'\nexport {sleepingNow,buildScene,sharedFurnitureScene,homeActivityPoolFor};';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,engine=process.argv.includes('--webkit')?'webkit':'chromium';const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{const page=await browser.newPage({viewport:{width:384,height:820},deviceScaleFactor:3,hasTouch:true,serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.sim=await import('/simulation.js?v=20260909dev305');window.v=await import('/views.js?v=20260909dev305');const id=g.createCharacter(20);window.testId=id;g.state.activeId=id;g.state.characters[id].name='크로';await import('/activity-settings.js?v=20260909dev305');document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.insertAdjacentHTML('beforeend',`<button id="qa-activities" data-activity-settings="${id}">Restrictions</button>`)});
 for(const language of ['ko','en','ja']){
  await page.evaluate(language=>{g.state.uiLanguage=language;document.querySelector('#qa-activities').click()},language);
  const d=page.locator('dialog[open].character-discovery-dialog');await d.locator('[data-needs-fixed]').check();await d.locator('[data-relationship-change-mode]').selectOption('score');
  const bounds=await d.evaluate(d=>({w:d.scrollWidth,c:d.clientWidth,b:d.getBoundingClientRect().bottom}));assert(bounds.w<=bounds.c+1&&bounds.b<=821,JSON.stringify(bounds));
  await page.screenshot({path:resolve(out,`${engine}-${language}-settings.png`)});
  await d.getByRole('button',{name:{ko:'저장',en:'Save',ja:'保存'}[language],exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>[g.state.characters[testId].needsFixed,g.state.characters[testId].relationshipChangeMode]),[true,'score']);
 }
 const result=await page.evaluate(async()=>{
  const c=g.state.characters[testId],id2=g.createCharacter(20),other=g.state.characters[id2];other.name='네리네';g.state.relationships={};g.state.relationshipDevelopment={};
  c.relationshipChangeMode='fixed';for(let i=0;i<6;i++)g.recordAutomaticRelationshipMoment([c.id,other.id],'fixed:'+i,1,false);
  const fixed=Object.keys(g.state.relationshipDevelopment).length;
  c.relationshipChangeMode='score';for(let i=0;i<6;i++)g.recordAutomaticRelationshipMoment([c.id,other.id],'score:'+i,1,false);
  const scoreRelations=Object.keys(g.state.relationships).length,points=Object.values(g.state.relationshipDevelopment)[0].points;
  c.relationshipChangeMode='dynamic';g.recordAutomaticRelationshipMoment([c.id,other.id],'dynamic',1,false);const letters=await import('/relationship-letters.js');letters.respondRelationshipLetter(g.state,letters.relationshipLetters(g.state).find(p=>p.status==='pending').id,'accept');const relation=Object.values(g.state.relationships)[0];
  c.relationshipChangeMode='score';const stage=relation.stage,oldScore=relation.intimacy;for(let i=0;i<10;i++)g.recordAutomaticRelationshipMoment([c.id,other.id],'more:'+i,1,false);const stageFixed=stage===relation.stage,scoreChanged=relation.intimacy>oldScore;
  const count=Object.values(g.state.relationshipDevelopment)[0].points;g.recordAutomaticRelationshipMoment([other.id,c.id],'more:9',1,false);const duplicate=Object.values(g.state.relationshipDevelopment)[0].points===count;
  other.relationshipChangeMode='fixed';g.recordAutomaticRelationshipMoment([c.id,other.id],'partner-fixed',1,false);const partnerFixed=Object.values(g.state.relationshipDevelopment)[0].points===count;
  const home=g.state.homes[c.homeId];home.rooms.living.furniturePlacements=[{id:'table',item:'식탁',x:50,y:70},{id:'chair1',item:'의자',tableId:'table',x:50,y:50},{id:'chair2',item:'의자',tableId:'table',x:50,y:85}];
  other.homeId=home.id;other.residences=[{homeId:home.id,isPrimary:true,stayPattern:'상시 거주'}];other.townId=c.townId;
  const now=new Date();home.lifeSimulation={agents:{[c.id]:{characterId:c.id,phase:'using',furnitureId:'chair1',roomKey:'living',endsAt:now.getTime()+600000},[other.id]:{characterId:other.id,phase:'using',furnitureId:'chair2',roomKey:'living',endsAt:now.getTime()+600000}}};
  // A real current event as the partner source; the shared helper must reject
  // mismatched rooms rather than inventing a co-location.
  const base=sim.eventFor(other,now);home.lifeSimulation.agents[other.id].roomKey=base.room;home.lifeSimulation.agents[c.id].roomKey=base.room;
  if(base.home&&home.rooms[base.room])home.rooms[base.room].furniturePlacements=home.rooms.living.furniturePlacements;
  const scene={title:'잠시 쉬는 중',desc:'',room:base.room,home:true,visitHomeId:home.id,minute:now.getHours()*60+now.getMinutes()};
  const same=sim.sharedFurnitureScene(c,scene,now);
  const blocked=sim.sharedFurnitureScene(c,{...scene,manualDirective:true},now);c.autonomousActivityBlocks=['talk'];const restricted=sim.sharedFurnitureScene(c,scene,now);c.autonomousActivityBlocks=[];
  c.hobbies=[];c.interests=[];other.hobbies=['게임','그림','향수','피아노'];const choices=sim.homeActivityPoolFor(c,now).map(x=>x[0]);
  const auto=await import('/automatic-activities.js?v=20260909dev305');const world={catalog:{hobby:[{id:'never',name:'NEVER_SELECTED_HOBBY'}]},characters:{}};const topics=Array.from({length:100},(_,i)=>auto.automaticConversation(world,c,other,'talk',i).topic);
  window.fixture={c,other,home,scene,same};g.save(true);
  return {fixed,scoreRelations,points,stageFixed,scoreChanged,duplicate,partnerFixed,shared:!!same.sharedFurnitureKey,baseHome:base.home,baseTitle:base.title,blocked:!blocked.sharedFurnitureKey,restricted:!restricted.sharedFurnitureKey,exploration:choices.filter(x=>/게임기를 잠깐|작업 도구를 구경|악기를 바라|향수들을 낯설게/.test(x)),topicLeak:topics.includes('NEVER_SELECTED_HOBBY')};
 });
 assert.equal(result.fixed,0);assert.equal(result.scoreRelations,0);assert.equal(result.points,6);for(const k of ['stageFixed','scoreChanged','duplicate','partnerFixed','blocked','restricted'])assert(result[k],JSON.stringify(result));assert(result.shared,JSON.stringify(result));assert.deepEqual(result.exploration,[]);assert(!result.topicLeak);console.log('relationship/hobby integration',result);
 await page.evaluate(()=>{g.state.uiLanguage='ko';g.state.activeId=testId;g.state.activeTab='character';window.PARALLEL_CITY_CONFIG={...window.PARALLEL_CITY_CONFIG,nativeApp:true};document.documentElement.classList.add('native-app');v.renderApp(g.state)});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.screenshot({path:resolve(out,`${engine}-slots.png`)});assert(await page.locator('.character-wallet-selected .character-slot-count').count());


 await page.evaluate(async()=>{
  const c=g.state.characters[testId],other=Object.values(g.state.characters).find(x=>x.id!==c.id),scene={home:true,room:'living',title:'신문 기사를 읽는 중'},room={name:'거실'};
  const people=[c,other].map((p,i)=>v.homeLifePersonMarkup(p,scene,{phase:'using',furnitureId:'sofa',item:'소파',roomKey:'living',x:45+i*10,y:50},room,'living',i,-1,{})).join('');
  document.body.innerHTML='<div class="home-page home"><div class="room" style="position:relative;width:340px;height:500px"><div class="room-furniture-item" data-furniture-placement="sofa" data-furniture-kind="sofa" style="position:absolute;left:120px;top:120px;width:120px;height:80px"><span class="room-furniture-art">🛋️</span></div><div class="room-people has-home-life">'+people+'</div></div></div>';
  (await import('/scene-depth.js')).bindSceneDepth(document);
 });await page.waitForTimeout(150);
 assert.equal(await page.locator('.room-activity-labels .home-person-status:visible').count(),1);assert.equal(await page.locator('.room-activity-labels .home-person-status:visible b').textContent(),'크로 · 네리네');assert.equal(await page.locator('.room-activity-labels .home-person-status:visible small').textContent(),'함께 앉아 각자 할 일을 하는 중');
 const persisted=await page.evaluate(()=>{const c=g.state.characters[testId];c.needsFixed=true;c.relationshipChangeMode='score';g.save(true);return {id:c.id}});
 await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const restored=await page.evaluate(async id=>{const {state}=await import('/state.js?v=20260909dev305');return [state.characters[id]?.needsFixed,state.characters[id]?.relationshipChangeMode]},persisted.id);assert.deepEqual(restored,[true,'score']);
 await page.goto(origin+'/scripts/qa-bed-conversation226.html');await page.locator('.couple-bed-base').evaluate(i=>i.decode());
 await page.evaluate(async()=>{document.querySelector('.home-bed-foreground-status').dataset.bedStatusFor='qa-bed';const fit=await import('/home-editor-ui.js?v=20260909dev305');fit.fitCoupleBedOccupants(document);const depth=await import('/scene-depth.js');depth.bindSceneDepth(document)});await page.waitForTimeout(200);
 const geometry=await page.evaluate(()=>{const c=document.querySelector('.home-bed-foreground-status'),r=c.getBoundingClientRect(),scene=c.closest('.room').getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,top:r.top,sceneBottom:scene.bottom,parent:c.parentElement.className,z:+getComputedStyle(c.parentElement).zIndex,maxFurniture:Math.max(...[...document.querySelectorAll('.room-furniture-item')].map(e=>+getComputedStyle(e).zIndex||0))}});
 assert(geometry.left>=0&&geometry.right<=384&&geometry.bottom<=Math.min(820,geometry.sceneBottom)+1,JSON.stringify(geometry));assert.equal(geometry.parent,'room-activity-labels');assert(geometry.z>geometry.maxFurniture);
 await page.screenshot({path:resolve(out,`${engine}-bed-depth.png`)});
 await page.evaluate(()=>{document.querySelectorAll('.room-furniture-item,.room-couple-bed-overlay').forEach(e=>e.style.setProperty('--furniture-y','92%'));window.dispatchEvent(new Event('resize'))});await page.setViewportSize({width:385,height:600});await page.waitForTimeout(200);
 const edge=await page.locator('.home-bed-foreground-status').boundingBox();assert(edge.y>=0&&edge.y+edge.height<=600,JSON.stringify(edge));await page.screenshot({path:resolve(out,`${engine}-bed-edge.png`)});
 console.log('PASS life388 UI (including reload persistence): three languages, saved locks, relationship modes, catalogue isolation, slot position, bed label foreground and edge clamping');
}finally{await browser.close();server.close()}
