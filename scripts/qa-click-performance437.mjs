import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-click-performance437');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const result=await page.evaluate(async()=>{
  const g=await import('/state.js?v=20260909dev305');g.createCharacter();
  // A local fixture: records grow with play time, without touching user saves.
  g.state.interactions=Array.from({length:12000},(_,i)=>({id:'qa-'+i,at:Date.now(),type:'conversation',characterIds:['a','b'],topic:'추억에 대해 이야기했습니다. '.repeat(12)}));
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  let clones=0,cloneMs=0;const original=ParallelCity.getState;
  ParallelCity.getState=()=>{const t=performance.now();clones++;const result=original();cloneMs+=performance.now()-t;return result};
  const button=document.createElement('button');button.textContent='Performance fixture';document.body.append(button);
  const samples=[];for(let i=0;i<8;i++){const t=performance.now();button.click();samples.push(performance.now()-t);await new Promise(r=>setTimeout(r,80))}
  button.remove();
  const {openSelectionPopup}=await import('/selection-popup.js');const languages=[];
  for(const [lang,close] of [['ko','닫기'],['en','Close'],['ja','閉じる']]){
   g.state.uiLanguage=lang;const select=document.createElement('select');select.innerHTML='<option>A</option><option>B</option>';document.body.append(select);openSelectionPopup(select);
   const dialog=document.querySelector('dialog.selection-popup');languages.push(dialog.querySelector('header button').textContent===close);dialog.close();await new Promise(r=>setTimeout(r,20));select.remove();
  }
  return {languages,characters:JSON.stringify(g.state).length,bytes:new TextEncoder().encode(JSON.stringify(g.state)).length,clones,cloneMs,samples,median:[...samples].sort((a,b)=>a-b)[4]};
 });
 if(process.argv.includes('--expect-fast')){assert.equal(result.clones,0);assert(result.languages.every(Boolean));assert(result.median<40,JSON.stringify(result))}
 console.log(JSON.stringify({cpuThrottle:4,...result}));
}finally{await browser.close();server.closeAllConnections();server.close()}
