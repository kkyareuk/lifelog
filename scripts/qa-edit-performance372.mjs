import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/views.js')body=body.toString().replace('(state.homeEditMode?[]:state.order)','(state.homeEditMode&&!window.qaBaseline?[]:state.order)').replace('map(c=>[c.id,eventFor(c)])','map(c=>{window.qaEditScenes=(window.qaEditScenes||0)+1;return [c.id,eventFor(c)]})');if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try {
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.qaRender);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);const seed=g.active();for(let i=1;i<13;i++){const c=structuredClone(seed);c.id='perf-'+i;g.state.characters[c.id]=c;g.state.order.push(c.id)}document.documentElement.classList.add('native-app');window.DrawerVillageNavigation.go('home');g.state.homeEditMode=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(600);await page.evaluate(()=>{g.state.homeEditMode=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close())});const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 for(const baseline of [true,false]){
 const result=await page.evaluate(baseline=>{window.qaBaseline=baseline;window.qaEditScenes=0;const times=[];for(let i=0;i<5;i++){const t=performance.now();window.qaRender({force:true});times.push(Math.round(performance.now()-t))}return {times,sceneRequests:window.qaEditScenes,tab:g.state.activeTab,home:!!document.querySelector('.home')}},baseline);console.log(baseline?'BEFORE':'AFTER',result);assert(result.home);if(baseline)assert(result.sceneRequests>0);if(!baseline)assert.equal(result.sceneRequests,0);
 }
}finally{await browser.close();server.close()}
