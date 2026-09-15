import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"tmp/qa-games413");
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
 const raw=engine.start({rulesVersion:4,id:'g',hostUid:'qa',name:'Mafia',seed:'qa410',mode:'live',capacity:5,durationMs:45000,deadlineAt:Date.now()+45000,map:{bg:'./world-assets/owner-forest-town.webp'},locations:Array.from({length:5},(_,i)=>({id:'l'+i,name:'Place '+i,x:[25,70,28,65,50][i],y:[20,30,55,70,85][i],square:i===0,selected:true,rooms:{living:{name:'거실',type:'living',furniturePlacements:[{id:'sofa',item:'소파',x:50,y:30,scale:1,rotation:0}]}}})),players:Array.from({length:5},(_,i)=>({id:'p'+i,name:'Player '+i,ownerUid:i?'u'+i:'qa',photo:'./assets/home-ui/profile-placeholder.png',delegated:i>0,sleep:'23:00'}))});
 await page.evaluate(async()=>{window.s=await import('/state.js?v=20260909dev305');window.stageUI=await import('/mafia-playback-ui.js?v=20260909dev305');document.body.innerHTML='<dialog open class="home-social-dialog plaza-games-dialog" data-plaza-screen="stage"><div class="home-social-content"></div></dialog>';window.paint=g=>stageUI.renderMafiaPlayback(document.querySelector('.home-social-content'),g,g.players[0],{submit:a=>window.sent=a,back(){}})});
 for(const lang of ['ko','en','ja']){
  await page.evaluate(lang=>s.state.uiLanguage=lang,lang);
  raw.phase='move';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-building=l1]').click();await page.locator('[data-option="0"]').click();assert.deepEqual(await page.evaluate(()=>sent),{kind:'move',place:'l1'});await page.screenshot({path:output+'/move-'+lang+'.png'});
  raw.phase='act';raw.players.slice(2).forEach(p=>p.place='l2');raw.players[0].place=raw.players[1].place='l0';raw.cards.p0=[{id:'a',kind:'alibi',day:1,tick:0,place:'l0',subject:'p0',action:'stay',witnesses:['p1']}];await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-person]').count(),2);await page.locator('[data-furniture-placement=sofa]').click();assert(await page.locator('.mp-popover button').count()>0);await page.screenshot({path:output+'/inside-'+lang+'.png'});
  raw.phase='alibi';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-alibi]').click();await page.locator('[data-option="0"]').click();assert.equal(await page.evaluate(()=>sent.kind),'alibi');
  raw.phase='claim';raw.currentClaim={speaker:'p0',kind:'together',partner:'p1',place:'l0',tick:0,day:1};await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('[data-statement-place]').count(),0);assert(await page.evaluate(()=>{const d=document.querySelector('.mafia-playback');return d.scrollWidth<=d.clientWidth+1&&d.getBoundingClientRect().height===innerHeight}));await page.screenshot({path:output+'/meeting-'+lang+'.png'});
 }

 for(const size of [{width:360,height:648},{width:384,height:832}]){await page.setViewportSize(size);raw.notebook=true;raw.drama=true;
  for(const lang of ['ko','en','ja']){await page.evaluate(lang=>s.state.uiLanguage=lang,lang);raw.players.forEach(p=>p.icon='./assets/home-ui/phone.png');raw.phase='move';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.waitForTimeout(150);
   assert(await page.locator('.mp-missions').isVisible());assert.equal(await page.locator('.mp-card,.mp-hand,[data-notebook]').count(),0);assert.equal(await page.locator('.mp-top>img').getAttribute('src'),'./assets/home-ui/phone.png');
   const ratio=await page.evaluate(async()=>{const plane=document.querySelector('.mp-map-plane'),img=new Image();img.src='/world-assets/owner-forest-town.webp';await img.decode();return Math.abs(plane.offsetWidth/plane.offsetHeight-img.naturalWidth/img.naturalHeight)});assert(ratio<.01,'distorted map');await page.screenshot({path:output+'/map-'+size.width+'-'+lang+'.png'});
   raw.phase='discussion';raw.meetingEndsAt=Date.now()+300000;raw.currentClaim=null;raw.cards.p0=[{id:'w',kind:'witness',day:1,tick:0,place:'l1',subject:'p1',action:'stay'}];await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));assert.equal(await page.locator('.mp-notebook').count(),1);await page.locator('[data-person=p1]').click();await page.locator('[data-option="0"]').click();assert.equal(await page.evaluate(()=>sent.kind),'accuse');await page.locator('.mp-notebook>summary').click();assert(await page.locator('.mp-notebook-pages').isVisible());await page.screenshot({path:output+'/notebook-'+size.width+'-'+lang+'.png'});
   raw.phase='floor';raw.currentClaim={speaker:'p1',kind:'unknown'};raw.challengeOwner='';await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-objection]').click();await page.locator('[data-option="0"]').click();assert.equal(await page.evaluate(()=>sent.kind),'reserveChallenge');
   raw.phase='challenge';raw.challengeOwner='p0';raw.challengeQuestion={id:'time',kind:'missing-time'};await page.evaluate(g=>paint(g)(),engine.view(raw,'qa'));await page.locator('[data-submit-question]').click();assert.equal(await page.evaluate(()=>sent.kind),'question');
  }
 }
 console.log('PASS413 Chromium/WebKit: KO EN JA; 360x648 and 384x832; left missions, no cards, map ratio, icons, notebook, accusations and objections');
}finally{await browser.close();server.closeAllConnections();server.close()}

