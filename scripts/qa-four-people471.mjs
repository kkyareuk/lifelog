import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/simulation.js')b=Buffer.from(b.toString().replace('export function eventFor(c,date=new Date()){','export function eventFor(c,date=new Date()){if(window.qaScenes?.[c.id])return window.qaScenes[c.id];return qaEventFor(c,date)} function qaEventFor(c,date=new Date()){'));if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:384,height:745},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 const ids=await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.v=await import('/views.js?v=20260909dev305');const ids=Array.from({length:4},()=>g.createCharacter()),hid=g.state.characters[ids[0]].homeId;window.qaHome=hid;window.qaScenes={};ids.forEach((id,i)=>{const c=g.state.characters[id];c.homeId=hid;c.residences=[{homeId:hid}];c.name='Participant '+(i+1);qaScenes[id]={kind:'work',title:'MATINS',desc:'Four scheduled participants',home:true,visitHomeId:hid,room:'living',routineId:'four',groupInteraction:true,interactionId:'schedule-four',withIds:ids.filter(x=>x!==id),withId:ids.find(x=>x!==id),participantOrder:ids,townId:c.townId};});g.state.activeId=ids[0];g.state.activeHomeId=hid;g.state.activeTab='home';g.state.homeEditMode=false;document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home');return ids});
 await p.waitForTimeout(300);for(const id of ids)assert(await p.locator(`.room [data-home-person="${id}"]`).isVisible(),'Missing participant '+id);
 await p.screenshot({path:'tmp/four-people471.png'});
 assert.deepEqual(errors,[]);console.log('PASS actual mobile home renderer retains all four scheduled participants');
}finally{await browser.close();server.closeAllConnections();server.close()}
