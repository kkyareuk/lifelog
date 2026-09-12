import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaWindows={weekly:()=>openRoutineDialog("",newRoutineDraft()),monthly:()=>openMonthlyRoutineDialog("",newMonthlyRoutineDraft()),anniversary:()=>openAnniversaryDialog(),relationship:()=>openRelationDialog(),room:()=>openRoomEditor(state.activeHomeId,"living")};';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);



 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();g.state.activeHomeId=g.active().homeId;document.documentElement.classList.add('native-app','native-platform')});
 for(const size of [{width:402,height:820},{width:1024,height:768}]){
  await page.setViewportSize(size);
  for(const name of ['weekly','monthly','anniversary','relationship','room']){
   await page.evaluate(name=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.querySelectorAll('[data-routine-sheet]').forEach(s=>s.remove());qaWindows[name]()},name);await page.waitForTimeout(150);
   const inspection=await page.evaluate(()=>{const ds=[...document.querySelectorAll('dialog[open],.routine-bottom-sheet')];return ds.map(d=>({class:d.className,width:d.getBoundingClientRect().width,scroll:[d,...d.querySelectorAll('*')].filter(e=>e.clientHeight>20&&e.scrollHeight>e.clientHeight+3&&/auto|scroll/.test(getComputedStyle(e).overflowY)).map(e=>{e.scrollTop=80;return {class:e.className,top:e.scrollTop}})}))});
   assert(inspection.length,name);assert(inspection.every(x=>x.width<=size.width+2),JSON.stringify(inspection));assert(inspection.every(x=>x.scroll.every(s=>s.top>0)),JSON.stringify(inspection));console.log(size.width,name,inspection);
  }
 }
}finally{await browser.close();server.close()}
