import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture=require('./court-fixture.cjs')();Object.assign(fixture.service,require('../functions/court-ranks')({db:fixture.db}),{saveResident:require('../functions/save-resident')({db:fixture.db})});const root=process.cwd(),out=resolve('tmp/qa-court464');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/snapshot'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({activeGroupId:'g',group:{...fixture.data.get('groups/g'),id:'g',name:'달빛 왕국',towns:[]},groups:[],members:['host','member','manager'].map(uid=>({uid,role:uid==='host'?'owner':uid==='manager'?'manager':'member'})),residents:[...fixture.data].filter(([k])=>k.startsWith('groups/g/residents/')).map(([k,v])=>({...v,id:k.split('/').at(-1)})),courtProfiles:[...fixture.data].filter(([k])=>k.startsWith('groups/g/courtProfiles/')).map(([k,v])=>({...v,id:k.split('/').at(-1)})),courtRankRequests:[...fixture.data].filter(([k])=>k.startsWith('groups/g/courtRankRequests/')).map(([k,v])=>({...v,id:k.split('/').at(-1)}))}));return;}
 if(url.pathname==='/court-api'){
  let body='';for await(const chunk of req)body+=chunk;const {action,input,uid}=JSON.parse(body);
  try{const value=await fixture.service[action](uid,input);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value))}catch(e){res.writeHead(e.status||500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:e.message}))}return;
 }
 if(url.pathname==='/qa-empty'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font:16px sans-serif;background:#f1ece6}*{box-sizing:border-box}#root{max-width:760px;margin:auto;position:relative;height:900px}</style><link rel="stylesheet" href="/home-social-ui.css"><link rel="stylesheet" href="/court-world.css"><div id="app"></div><div id="root"></div>');return;}
 const file=resolve(root,'.'+url.pathname);if(!file.startsWith(root+sep))throw Error();const value=await readFile(file);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html'})[extname(file)]||'application/octet-stream');res.end(value);
 }catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'),browser=await(useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
const errors=[];
async function setup(uid,lang='ko',width=390){const page=await browser.newPage({viewport:{width,height:900},serviceWorkers:'block'});page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/qa-empty');await page.evaluate(async({uid,lang})=>{
 window.ParallelCityAuth={getInfo:()=>({user:{uid}})};
 window.snap=await(await fetch('/snapshot')).json();
 window.DrawerVillageGroups={getSnapshot:()=>window.snap,court:async(action,input)=>{const res=await fetch('/court-api',{method:'POST',body:JSON.stringify({action,input,uid})});const data=await res.json();if(!res.ok)throw Error(data.message);window.snap=await(await fetch('/snapshot')).json();return data;}};
 const {state,createCharacter}=await import('/state.js?v=20260909dev305');state.uiLanguage=lang;const id=createCharacter();window.character=state.characters[id];window.character.id='a';window.character.ownerUid='member';state.sharedContext={groupId:'g'};window.testState=state;
 const ui=await import('/court-world-ui.js');window.story=()=>{document.querySelector('#root').innerHTML=ui.groupStoryMarkup(snap,uid==='host'||uid==='manager');ui.bindCourtWorld()};window.courtPage=()=>{document.querySelector('#root').innerHTML=ui.courtCharacterPage(character);ui.bindCourtWorld()};window.story();
 },{uid,lang});return page;}
try{
 const host=await setup('host');await host.selectOption('[name=theme]','basic');await host.locator('[data-story-theme] button').click();await host.waitForFunction(()=>snap.group.courtTheme==='basic');await host.evaluate(()=>story());assert.equal(await host.locator('[data-rank-edit]').count(),0);
 await host.selectOption('[name=theme]','court');await host.locator('[data-story-theme] button').click();await host.waitForFunction(()=>snap.group.courtTheme==='court');await host.evaluate(()=>story());assert.equal(await host.locator('[data-rank-edit]').count(),10);
 const member=await setup('member');assert.equal(await member.locator('[data-rank-edit]').count(),0);await member.locator('[name=rankName]').fill('북부 대공');await member.locator('[name=rankLevel]').fill('75');await member.locator('[data-request-rank]').click();await member.waitForFunction(()=>snap.courtRankRequests.length===1);
 await host.evaluate(async()=>{window.snap=await(await fetch('/snapshot')).json();story()});await host.locator('[data-rank-decision=true]').click();await host.waitForFunction(()=>snap.group.courtRanks?.length===10);
 await member.evaluate(async()=>{window.snap=await(await fetch('/snapshot')).json();courtPage()});assert.ok((await member.locator('[data-field=courtRankId]').innerText()).includes('북부 대공'));await member.selectOption('[data-field=courtAwareness]','0');
 for(const [lang,width]of [['ko',360],['en',390],['ja',768]]){const p=await setup('member',lang,width);await p.evaluate(()=>courtPage());assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:resolve(out,lang+'-court.png'),fullPage:true});await p.close()}
 // Render actual editor, including both quick settings and the court book page.
 await member.evaluate(async()=>{document.documentElement.classList.add('native-app','native-platform');for(const href of ['/app.css','/character-book.css','/groups.css']){const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link)}const {state}=await import('/state.js?v=20260909dev305');state.characters={a:character};state.order=['a'];state.activeId='a';state.activeTab='character';state.characterSettingsView='hub';const {renderApp}=await import('/views.js');window.draw=(options={})=>{renderApp(state,new Date(),options)};draw({quick:true});});
 assert.ok(await member.locator('#app [data-field=courtJob]').count());assert.equal(await member.locator('#app [data-field=job]').count(),0);
 await member.evaluate(()=>{testState.characterSettingsView='full';testState.characterPane='profile';testState.characterOverviewPane='basic';draw()});assert.ok(await member.locator('#app [data-character-overview-pane=court]').count());assert.ok(await member.locator('#app [data-field=courtJob]').count());
 await member.evaluate(()=>{testState.characterOverviewPane='court';draw()});assert.ok(await member.locator('#app .court-character-page').count());assert.equal(await member.locator('#app .view-error').count(),0);await member.locator('#root').evaluate(e=>e.remove());await member.screenshot({path:resolve(out,'native-court.png'),fullPage:true});await member.locator('#app [data-request-rank]').scrollIntoViewIfNeeded();assert.ok(await member.locator('#app [data-request-rank]').isVisible());await member.locator('.court-character-content').evaluate(e=>e.scrollTop=0);
 await member.setViewportSize({width:1200,height:800});await member.evaluate(()=>draw());assert.ok(await member.locator('[data-spread-page=overview-court]').count());await member.screenshot({path:resolve(out,'tablet-court.png'),fullPage:true});await member.setViewportSize({width:390,height:900});
 await member.evaluate(()=>{snap.group.courtTheme='basic';testState.characterSettingsView='hub';draw({quick:true})});assert.equal(await member.locator('#app [data-field=courtJob]').count(),0);assert.ok(await member.locator('#app [data-field=job]').count());
 assert.deepEqual(errors,[]);console.log('PASS464 '+(useWebKit?'WebKit':'Chromium')+': story switch, manager-only ranks, member request and approval, common-list character select, real quick/full editor and court next page, basic story fallback, KO/EN/JA responsive layout.');
}finally{await browser.close();server.close()}

