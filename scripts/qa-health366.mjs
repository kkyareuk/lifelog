import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();const body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);document.documentElement.classList.add('native-app','native-platform');window.DrawerVillageNavigation.go('character')});await page.waitForTimeout(600);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 for(const lang of ['ko','en','ja']){
 await page.evaluate(async lang=>{g.state.uiLanguage=lang;g.state.characterProfileBook=false;g.state.characterSettingsView='full';g.state.characterPane='body';g.state.characterBodyPane='accessibility';(await import('/views.js?v=20260909dev305')).renderApp(g.state)},lang);await page.waitForTimeout(250);console.log(await page.evaluate(()=>({view:g.state.characterSettingsView,pane:g.state.characterPane,body:g.state.characterBodyPane,count:document.querySelectorAll('.body-accessibility-scroll').length,err:document.querySelector('.view-error')?.textContent}))); 
 const result=await page.locator('.body-accessibility-scroll').evaluate(e=>{const health=e.querySelector('.body-health-conditions'),hearing=e.querySelector('.body-hearing-supports');const before=e.scrollTop;e.scrollTop=e.scrollHeight;return {healthBottom:health.getBoundingClientRect().bottom,hearingTop:hearing.getBoundingClientRect().top,scroll:e.scrollTop,overflow:e.scrollHeight-e.clientHeight}});assert(result.hearingTop>result.healthBottom);assert(result.overflow<=0||result.scroll>0);console.log(lang,result);await page.screenshot({path:resolve(out,'health-'+lang+'.png')});
 }
}finally{await browser.close();server.close()}
