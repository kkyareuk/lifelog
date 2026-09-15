import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-games410");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,process.env.QA_PACKAGED||".","."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const engine=require('../functions/mafia-stage.js');
 const raw=engine.start({rulesVersion:4,id:'g',hostUid:'qa',name:'Mafia',seed:'qa410',mode:'live',capacity:5,durationMs:45000,deadlineAt:Date.now()+45000,map:{bg:'./world-assets/owner-forest-town.webp'},locations:Array.from({length:5},(_,i)=>({id:'l'+i,name:'Place '+i,x:[25,70,28,65,50][i],y:[20,30,55,70,85][i],square:i===0,selected:true,rooms:{living:{name:'거실',type:'living',furniturePlacements:[{id:'sofa',item:'소파',x:50,y:30,scale:1,rotation:0}]}}})),players:Array.from({length:5},(_,i)=>({id:'p'+i,name:'Player '+i,ownerUid:i?'u'+i:'qa',photo:'./icons/icon-192.png',delegated:i>0,sleep:'23:00'}))});
 await page.evaluate(async()=>{window.s=await import('/state.js?v=20260909dev305');window.stageUI=await import('/mafia-playback-ui.js?v=20260909dev305');document.body.innerHTML='<dialog open class="home-social-dialog plaza-games-dialog" data-plaza-screen="stage"><div class="home-social-content"></div></dialog>';window.paint=g=>stageUI.renderMafiaPlayback(document.querySelector('.home-social-content'),g,g.players[0],{submit:a=>window.sent=a,back(){}})});
 for(const lang of ['ko','en','ja']){
  await page.evaluate(lang=>s.state.uiLanguage=lang,lang);
  raw.phase='move';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-building=l1]').click();await page.locator('[data-option="0"]').click();assert.deepEqual(await page.evaluate(()=>sent),{kind:'move',place:'l1'});await page.screenshot({path:output+'/move-'+lang+'.png'});
  raw.phase='act';raw.players.slice(2).forEach(p=>p.place='l2');raw.players[0].place=raw.players[1].place='l0';raw.cards.p0=[{id:'a',kind:'alibi',day:1,tick:0,place:'l0',subject:'p0',action:'stay',witnesses:['p1']}];await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-person]').count(),2);await page.locator('[data-furniture-placement=sofa]').click();assert(await page.locator('.mp-popover button').count()>0);await page.screenshot({path:output+'/inside-'+lang+'.png'});
  raw.phase='alibi';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-alibi]').click();await page.locator('[data-option="0"]').click();assert.equal(await page.evaluate(()=>sent.kind),'alibi');
  raw.phase='claim';raw.currentClaim={speaker:'p0',kind:'together',partner:'p1',place:'l0',tick:0,day:1};await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-statement-place]').count(),0);assert(await page.evaluate(()=>{const d=document.querySelector('.mafia-playback');return d.scrollWidth<=d.clientWidth+1&&d.getBoundingClientRect().height===innerHeight}));await page.screenshot({path:output+'/meeting-'+lang+'.png'});
 }
 raw.phase='reply';raw.currentClaim={speaker:'p1',partner:'p0',kind:'together',place:'l0',day:1,tick:0};raw.meetingEndsAt=Date.now()+300000;
 for(const lang of ['ko','en','ja']){await page.evaluate(lang=>s.state.uiLanguage=lang,lang);await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-reply]').count(),3);await page.locator('[data-reply=confirm]').click();assert.equal(await page.evaluate(()=>sent.value),'confirm');await page.screenshot({path:output+'/reply-'+lang+'.png'});}
 raw.phase='floor';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-objection]').count(),1);
 raw.phase='act';raw.locations[0].rooms={};raw.locations[0].type='카페';raw.locations[0].square=false;await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-furniture-placement]').count(),3);assert(!await page.locator('.mp-world').evaluate(x=>x.style.backgroundImage.includes('forest-town')));await page.screenshot({path:output+'/cafe.png'});
 await page.evaluate(async game=>{const {renderMafiaRecruitment}=await import('/mafia-recruitment.js?v=20260909dev305');renderMafiaRecruitment(document.querySelector('.home-social-content'),{...game,status:'recruiting'},{manager:true,characters:[{id:'p0',name:'Player'}]},{owner:'qa',run:async a=>window.sent=a,back(){}})},engine.view(raw,'qa'));await page.locator('[data-start]').click();assert.equal(await page.evaluate(()=>sent),'startGame');await page.screenshot({path:output+'/recruitment.png'});
 await page.evaluate(async game=>{const {gameSetup}=await import('/plaza-lobby.js?v=20260909dev305');gameSetup(document.querySelector('.home-social-content'),{manager:true,characters:[{id:'p0',name:'Player'}],towns:[{id:'t',name:'Village'}],locations:game.locations.map(l=>({...l,townId:'t'})),consent:[]},{saveConsent:async()=>{},back(){},submit:f=>window.setupChoice={start:f.has('start'),places:f.getAll('place')}})},engine.view(raw,'qa'));
 await page.locator('[name=capacity]').selectOption('6');assert.equal(await page.locator('[name=place]:checked').count(),3);await page.locator('form.plaza-setup button').click();assert.equal(await page.evaluate(()=>setupChoice.start),false);
 raw.phase='move';raw.phaseIndex=0;raw.deadlineAt=Date.now()+45000;
 await page.evaluate(async game=>{
  document.querySelectorAll('dialog').forEach(d=>d.remove());window.DRAWER_VILLAGE_PLAZA_ENABLED=true;window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa'}})};
  window.qaGame=game;window.DrawerVillageGroups={games:async(action)=>{if(action==='readGames')return {games:[qaGame]};if(action==='submitGame')qaGame.players[0].submitted=true;return structuredClone(qaGame)}};
  const api=await import('/plaza-games-ui.js?v=20260909dev305');await api.openPlazaGames('group','g');window.qaStage=document.querySelector('.mafia-playback');
 },engine.view(raw,'qa'));
 await page.locator('.mafia-playback').waitFor();await page.evaluate(()=>window.qaStage=document.querySelector('.mafia-playback'));await page.locator('[data-building=l1]').click();await page.locator('[data-option="0"]').click();await page.waitForTimeout(1300);
 assert(await page.evaluate(()=>qaStage===document.querySelector('.mafia-playback')),'submission/poll replaced the stage');assert.equal(await page.locator('.mp-popover[hidden]').count(),1);
 await page.evaluate(()=>document.querySelector('[data-social-dialog]').close());

 const localResult=await page.evaluate(async()=>{
  const {localGames,personalGameGroups}=await import('/mafia-local.js?v=20260909dev305');const {personalState}=s;const st=personalState();
  st.towns=[{id:'personal-qa',name:'내 마을'}];st.activeTownId='personal-qa';st.world={...st.world,places:[0,1,2].map(i=>({id:'v'+i,name:'장소'+i,type:i?'카페':'공원',x:20+i*25,y:45}))};st.characters=Object.fromEntries([0,1,2,3,4].map(i=>['c'+i,{id:'c'+i,name:'캐릭터'+i,townId:'personal-qa',homeId:'',speechStyle:'',photo:''}]));st.homes={};
  const groupId=personalGameGroups()[0].id,ctx={groupId};const setup=await localGames('readGames',ctx,'qa');
  const made=await localGames('createGame',{...ctx,gameId:'local-game',capacity:5,name:'혼자 마피아',locations:setup.locations.map(l=>l.id)},'qa');await localGames('joinGame',{...ctx,gameId:made.id,characterId:'c0'},'qa');const playing=await localGames('startGame',{...ctx,gameId:made.id},'qa');const again=await localGames('readGames',ctx,'qa');
  return {status:playing.status,count:playing.players.length,roles:playing.players.filter(p=>p.role).length,saved:again.games[0].status};
 });assert.deepEqual(localResult,{status:'playing',count:5,roles:1,saved:'playing'});
 await page.evaluate(()=>{const d=document.createElement('dialog');d.className='home-social-dialog plaza-games-dialog';d.dataset.plazaScreen='stage';d.innerHTML='<div class=home-social-content></div>';document.body.append(d);d.showModal()});
 raw.drama=true;raw.phase='floor';raw.currentClaim={speaker:'p1',kind:'unknown'};raw.cards.p0=[];raw.challengeOwner='';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-objection]').click();await page.locator('[data-option="0"]').click();assert.equal(await page.evaluate(()=>sent.questionId),'time');
 raw.phase='challenge';raw.challengeOwner='p0';raw.challengeQuestion={id:'time',kind:'missing-time',certainty:'question'};await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert(await page.locator('.mp-challenge-focus').isVisible());await page.waitForTimeout(300);await page.screenshot({path:output+'/challenge.png'});await page.locator('[data-submit-question]').click();assert.equal(await page.evaluate(()=>sent.kind),'question');
 console.log('PASS410 named replies, interventions, cafe, recruitment; KO EN JA full-screen map, object choices, real room furniture, generated alibis, SVG meeting layout');
}finally{await browser.close();server.closeAllConnections();server.close()}
