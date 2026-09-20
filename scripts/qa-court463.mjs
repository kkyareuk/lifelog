import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture=require('./court-fixture.cjs')(),root=process.cwd(),out=resolve('tmp/qa-court463');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/court-api'){
  let body='';for await(const chunk of req)body+=chunk;const {action,input,uid}=JSON.parse(body);
  try{const value=await fixture.service[action](uid,input);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value))}catch(e){res.writeHead(e.status||500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:e.message}))}return;
 }
 if(url.pathname==='/qa-empty'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font:16px sans-serif;background:#f1ece6}*{box-sizing:border-box}#root{max-width:760px;margin:auto}</style><link rel="stylesheet" href="/home-social-ui.css"><link rel="stylesheet" href="/court.css"><dialog open class="home-social-dialog plaza-games-dialog" data-plaza-screen="lobby"><div id="root" class="home-social-content"></div></dialog>');return;}
 const file=resolve(root,'.'+url.pathname);if(!file.startsWith(root+sep))throw Error();const value=await readFile(file);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html'})[extname(file)]||'application/octet-stream');res.end(value);
 }catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'),browser=await(useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
const errors=[];
async function setup(uid,lang='ko',width=390){const page=await browser.newPage({viewport:{width,height:844},serviceWorkers:'block'});page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/qa-empty');await page.evaluate(async({uid,lang})=>{
 window.ParallelCityAuth={getInfo:()=>({user:{uid}})};
 window.DrawerVillageGroups={court:async(action,input)=>{const res=await fetch('/court-api',{method:'POST',body:JSON.stringify({action,input,uid})});const data=await res.json();if(!res.ok)throw Error(data.message);return data;}};
 const {state}=await import('/state.js?v=20260909dev305');state.uiLanguage=lang;
 window.openCourt=async()=>{const {renderCourt}=await import('/court-ui.js');await renderCourt(document.querySelector('#root'),{groups:[{id:'g',name:'달빛 궁정'}],selected:'g',back:()=>{}})};await openCourt();
 },{uid,lang});return page;}
try{
 const host=await setup('host');assert.ok(await host.locator('[data-court-theme]').isVisible());await host.selectOption('[name=theme]','basic');await host.locator('[data-court-theme] button').click();await host.waitForFunction(()=>document.querySelector('[data-court-theme] [name=theme]')?.value==='basic');
 await host.selectOption('[name=theme]','court');await host.locator('[data-court-theme] button').click();await host.waitForFunction(()=>document.querySelector('[data-court-theme] [name=theme]')?.value==='court');
 const member=await setup('member');assert.equal(await member.locator('[data-court-theme]').count(),0);assert.equal(await member.locator('[data-court-scene]').count(),5);
 await member.selectOption('[data-court-target]','b');await member.locator('[data-court-scene=rest]').click();await member.locator('[data-court-choice=ask]').click();await member.locator('.court-response').waitFor();assert.match(await member.locator('.court-response').innerText(),/준비/);await member.screenshot({path:resolve(out,'ko-result.png'),fullPage:true});
 await member.locator('[data-court-return]').click();await member.locator('.court-history').waitFor({state:'attached'});assert.equal(await member.locator('.court-history').count(),1);
 const other=await setup('other');assert.equal(await other.locator('.court-history').count(),0);await other.locator('details').first().locator('summary').click();await other.uncheck('[name=enabled]');await other.locator('[data-court-profile] button').click();await other.waitForFunction(()=>!document.querySelector('[data-court-scene]'));
 await member.evaluate(()=>openCourt());assert.equal(await member.locator('[data-court-target] option[value=b]').count(),0);
 await other.locator('details').first().locator('summary').click();await other.check('[name=enabled]');await other.locator('[data-court-profile] button').click();await other.locator('[data-court-scene]').first().waitFor();
 for(const [lang,width]of [['ko',360],['en',390],['ja',768]]){const page=await setup('member',lang,width);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('details').first().locator('summary').click();await page.screenshot({path:resolve(out,lang+'-profile.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.close()}
 await member.evaluate(async()=>{const {gameLobby}=await import('/plaza-lobby.js?v=20260909dev305');await gameLobby(document.querySelector('#root'),{groups:[{id:'g',name:'Court'}],selected:'g',call:async()=>({games:[]}),current:()=>true,open:()=>{},setup:()=>{},join:()=>{},manage:()=>{}})});
 assert.equal(await member.locator('[data-court-open]').count(),0); // Court belongs to group story settings since 464.
 assert.deepEqual(errors,[]);console.log('PASS Court463 '+(useWebKit?'WebKit':'Chromium')+': host/member separation, two-account consent, real service choices/history, plaza entry/back, KO/EN/JA and mobile/tablet layout.');
}finally{await browser.close();server.close()}
