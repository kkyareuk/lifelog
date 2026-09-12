import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);document.documentElement.classList.add('native-app','native-platform');window.DrawerVillageNavigation.go('character')});await page.waitForTimeout(600);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

 const privateBackup=process.argv.find(a=>a.startsWith('--backup='));
 const benchmark=privateBackup?JSON.parse(await readFile(resolve(privateBackup.slice(9)),'utf8')).gameState:{photo:'abcDEF123/+'.repeat(550000),characters:{example:{name:'Example'}}};
 await page.evaluate(value=>window.benchmarkState=value,benchmark);
 if(!useWebKit){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
 const result=await page.evaluate(async()=>{
   const {createAccountStorage}=await import('/account-storage.js');const {pack}=await import('/snapshot-codec.js');
   const value=JSON.stringify(benchmarkState),key='drawer-village-game-v1';let stored=pack(value);
   const local={getItem:()=>stored,setItem:(k,v)=>stored=v};const account=createAccountStorage(local);
   async function measure(write){let last=performance.now(),gap=0,ticks=0;const clock=setInterval(()=>{const now=performance.now();gap=Math.max(gap,now-last);last=now;ticks++},10);await new Promise(r=>setTimeout(r,30));const start=performance.now();await write();const ms=performance.now()-start;await new Promise(r=>setTimeout(r,30));clearInterval(clock);return {ms:Math.round(ms),maxTimerGap:Math.round(gap),ticks};}
   const before=await measure(()=>account.setItem(key,value));const after=await measure(()=>account.setItemAsync(key,value));if(account.getItem(key)!==value)throw Error('data mismatch');return {jsonChars:value.length,before,after};
 });console.log(useWebKit?'WebKit':'Chromium CPU4x',result);assert(result.after.maxTimerGap<result.before.maxTimerGap*.6);

 await page.evaluate(async()=>{
   const {accountStorage}=await import('/account-storage.js?v=20260909dev305');
   const id=g.active().id;g.state.characters[id].name='first';const first=g.save(true);g.state.characters[id].name='latest';const latest=g.save(true);await Promise.all([first,latest]);
   if(JSON.parse(accountStorage.getItem('drawer-village-game-v1')).characters[id].name!=='latest')throw Error('latest edit lost');
   g.state.characters[id].name='exit';const queued=g.save(true);g.flushSave();await queued;
   if(JSON.parse(accountStorage.getItem('drawer-village-game-v1')).characters[id].name!=='exit')throw Error('exit flush lost');
   g.state.characters[id].name='before reset';const resetting=g.save(true);g.resetAll();await resetting;
   if(JSON.parse(accountStorage.getItem('drawer-village-game-v1')).order.length)throw Error('reset resurrected data');
 });console.log('PASS latest edit, exit flush and reset do not lose or resurrect state');
}finally{await browser.close();server.close()}
