import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-games428");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={'.csv':'text/csv',".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,process.env.QA_PACKAGED||".","."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=process.argv.includes('--webkit')?await webkit.launch({headless:true}):await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});


try{
 const page=await browser.newPage({viewport:{width:360,height:648},serviceWorkers:'block'});page.on('pageerror',e=>console.error('PAGE',e.name,e.message,e.stack));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());page.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});page.on('requestfailed',r=>console.error('FAIL',r.url()));await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const engine=require('../functions/mafia-stage.js');
 const raw=engine.start({meetingControls:2,notebook:true,drama:true,rulesVersion:4,id:'g',hostUid:'qa',name:'Mafia',seed:'qa417',mode:'live',capacity:6,durationMs:45000,deadlineAt:Date.now()+45000,map:{bg:'./world-assets/owner-forest-town.webp'},locations:Array.from({length:3},(_,i)=>({id:'l'+i,name:'Place '+i,x:[25,70,28][i],y:[20,30,55][i],square:i===0,selected:true})),players:Array.from({length:6},(_,i)=>({id:'p'+i,name:'Player '+i,ownerUid:i?'u'+i:'qa',icon:'./assets/home-ui/phone.png',delegated:i>0,sleep:'23:00'}))});
 await page.evaluate(async()=>{window.s=await import('/state.js?v=20260909dev305');window.stageUI=await import('/mafia-playback-ui.js?v=20260909dev305');document.querySelector('#app').hidden=true;document.body.insertAdjacentHTML('beforeend','<dialog class="home-social-dialog plaza-games-dialog" data-plaza-screen="stage"><div class="home-social-content"></div></dialog>');document.querySelector('dialog').showModal();window.paint=g=>stageUI.renderMafiaPlayback(document.querySelector('.home-social-content'),g,g.players[0],{submit:a=>window.sent=a,back(){}})});
 for(const lang of ['ko','en','ja']){
 await page.evaluate(lang=>s.state.uiLanguage=lang,lang);raw.phase='alibi';engine.advance(raw,Date.now());
 await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-meeting-action]').count(),7);
 assert.equal(await page.locator('.meeting-evidence-button').count(),1);assert.equal(await page.locator('.mp-public-record').count(),0);
 await page.locator('[data-meeting-action=accuse]').click();await page.locator('.meeting-options button').first().click();assert.equal(await page.locator('.meeting-options button').count(),8);await page.locator('.meeting-options button').first().click();assert.equal(await page.evaluate(()=>sent.reason),'none');
 raw.phase='rebuttal';raw.currentClaim={kind:'accuse',speaker:'p1',target:'p2',reason:'none'};const now=Date.now();raw.reactions=[{kind:'agree',speaker:'p2',target:'p1',startsAt:now-100,endsAt:now+1900},{kind:'oppose',speaker:'p3',target:'p1',startsAt:now+1900,endsAt:now+3900}];
 await page.evaluate(g=>{window.tick=paint(g);tick()},engine.view(raw,'qa'));assert.equal(await page.locator('[data-meeting-action]').count(),3);assert.equal(await page.locator('.meeting-reactions article').count(),1);
 await page.waitForTimeout(2050);await page.evaluate(()=>tick());assert.equal(await page.locator('.meeting-reactions article').count(),1);assert.match(await page.locator('.meeting-reactions').innerText(),/Player 3/);
 const geometry=await page.evaluate(()=>{const a=document.querySelector('.meeting-main').getBoundingClientRect(),b=document.querySelector('.meeting-reactions').getBoundingClientRect(),c=document.querySelector('.meeting-actions').getBoundingClientRect(),f=document.querySelector('.meeting-flow');return [a.bottom<=b.top,b.bottom<=c.top,c.bottom<=innerHeight,f.scrollHeight<=f.clientHeight+1]});await page.screenshot({path:output+"/layout-check.png"});assert(geometry.every(Boolean),JSON.stringify(geometry));await page.screenshot({path:output+'/meeting-'+lang+'.png'});
 await page.locator('[data-meeting-action=oppose]').click();assert.equal(await page.locator('.meeting-options button').count(),5);
 }

 raw.preparationRules=1;const prep=require('../functions/mafia-preparation')(require('../functions/mafia-engine'));prep.init(raw);raw.phase='act';raw.players[0].place=raw.preparation.tools[0].place;
 for(const lang of ['ko','en','ja']){await page.evaluate(lang=>s.state.uiLanguage=lang,lang);await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert(await page.locator('.mp-loose-tool').count()>0);await page.locator('.mp-loose-tool').first().click();await page.locator('.mp-popover button').nth(1).click();assert.equal(await page.evaluate(()=>sent.kind),'takeTool');await page.screenshot({path:output+'/preparation-'+lang+'.png'});}
 raw.phase='reply';raw.currentClaim={kind:'accuse',speaker:'p1',target:'p0'};await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-meeting-action=oppose]').count(),1);assert.equal(await page.locator('[data-meeting-action=pass]').count(),1);assert.equal(await page.locator('[data-meeting-action=alibi]').count(),0);
 raw.phase='voteResult';raw.voteResults=[{voter:'p0',target:'p1'},{voter:'p2',target:'p1'}];await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('.mp-vote-results span').count(),2);assert.equal(await page.locator('.mp-vote-results').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(53, 39, 30)');await page.screenshot({path:output+'/votes.png'});
 raw.phase='move';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.waitForSelector('[data-camera-ready=true]');const camera=await page.locator('.mp-village').evaluate(n=>{n.scrollTop=60;n.scrollLeft=20;n.dispatchEvent(new Event('scroll'));return {x:n.scrollLeft,y:n.scrollTop}});raw.phase='walk';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.waitForSelector('[data-camera-ready=true]');assert.deepEqual(await page.locator('.mp-village').evaluate(n=>({x:n.scrollLeft,y:n.scrollTop})),camera);
 raw.nightCycle=true;raw.phase='night';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('.night-sleeper').count(),1);await page.screenshot({path:output+'/night.png'});
 raw.players[0].alive=false;raw.phase='act';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('.mp-building:not(:disabled)').count(),0);assert.equal(await page.locator('.mp-walker').count(),6);assert.equal(await page.locator('.mp-walker.is-dead').count(),1);

 raw.players[0].alive=true;raw.status='playing';raw.nightCycle=true;raw.players[0].role='mafia';raw.players.slice(1).forEach(q=>q.role='citizen');raw.phase='night';raw.nightVotes={};
 await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-night-target]').count(),5);await page.locator('[data-night-target]').first().click();await page.locator('.mp-popover button').nth(1).click();await page.locator('.mp-popover button').nth(1).click();assert.deepEqual(await page.evaluate(()=>({kind:sent.kind,method:sent.method,staging:sent.staging})),{kind:'nightHit',method:'planned',staging:'clean'});
 for(const lang of ['ko','en','ja']){
 await page.evaluate(lang=>s.state.uiLanguage=lang,lang);raw.phase='reply';raw.currentClaim={kind:'request',speaker:'p1',target:'p0',period:1,question:'where'};
 await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-meeting-action=answer]').click();await page.locator('.meeting-options button').first().click();assert.equal(await page.evaluate(()=>sent.kind),'answer');assert.equal(await page.evaluate(()=>sent.answer),'where');
 raw.phase='discussion';raw.turnSpeaker='p0';raw.currentClaim=null;await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-meeting-action=defend]').click();await page.locator('.meeting-options button').first().click();assert.equal(await page.locator('.meeting-options button').count(),5);await page.screenshot({path:output+'/defend-'+lang+'.png'});
 }
 raw.phase='vote';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-vote-choice=noExile]').click();assert.equal(await page.evaluate(()=>sent.kind),'noExile');await page.locator('[data-vote-choice=abstain]').click();assert.equal(await page.evaluate(()=>sent.kind),'abstain');
 raw.phase='act';raw.players[0].place=raw.locations[0].id;raw.locations[0].rooms={ground:{name:'Ground',floor:1,type:'living',furniturePlacements:[{id:'tv',item:'TV',x:50,y:50}]},upper:{name:'Upper',floor:2,type:'living',furniturePlacements:[{id:'hidden-tv',item:'TV',x:50,y:50}]}};
 raw.bodies=[{id:'p1',place:raw.locations[0].id,day:1,tick:0}];raw.players[1].alive=false;
 await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('.mp-room').count(),1);assert.equal(await page.locator('[data-furniture-placement=hidden-tv]').count(),0);await page.locator('.mp-resident.is-dead').click();assert.equal(await page.locator('.mp-popover button').count(),3);await page.locator('.mp-popover button').first().click();assert.equal(await page.evaluate(()=>sent.kind),'investigate');assert.equal(await page.locator('.mp-house').evaluate(n=>getComputedStyle(n).isolation),'isolate');await page.screenshot({path:output+'/ground-floor.png'});
 raw.replay=[{day:1,period:0,kind:'action',subject:'p0',action:'takeTool',place:'l0'},{day:2,period:1,kind:'observation',observer:'p1',card:{kind:'behavior',subject:'p0',action:'hideTool',place:'l0',day:2,tick:2}}];assert.equal(engine.view(raw,'qa').replay.length,0);raw.status='finished';raw.phase='dawn';raw.winner='citizen';raw.nightCycle=true;await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('.mp-result').count(),1);assert.equal(await page.locator('.mp-replay details').count(),2);assert.equal(await page.locator('.night-scene').count(),0);
 await page.evaluate(async()=>{const {gameSetup}=await import('/plaza-lobby.js');document.querySelector('dialog').dataset.plazaScreen='setup';gameSetup(document.querySelector('.home-social-content'),{manager:true,characters:[{id:'a',name:'네리네'}],towns:[{id:'t',name:'내 마을'}],locations:[],consent:[]},{back(){},submit(){},saveConsent(){}})});
 assert.equal(await page.locator('.plaza-rules dd').first().evaluate(n=>getComputedStyle(n).color),'rgb(73, 54, 41)');
 assert.equal(await page.locator('[data-stage-places]').count(),0);await page.locator('[name=capacity]').selectOption('8');await page.locator('[name=mafiaCount]').selectOption('3');await page.locator('[name=moveSeconds]').selectOption('30');await page.locator('[name=actionSeconds]').selectOption('90');await page.locator('[name=meetingSeconds]').selectOption('600');
 await page.screenshot({path:output+'/setup.png'});
 console.log('PASS427 UI: KO/EN/JA compact meeting, grounds menus, sequential reactions, no overlap/scroll, spectator map, finished dawn result.');
}finally{await browser.close();server.closeAllConnections();server.close()}
