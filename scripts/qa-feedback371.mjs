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
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 for(const language of ['ko','en','ja']){
 let calls=[],fail=true;await page.route('**/playerFeedbackApi',async route=>{if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST'}});calls.push(JSON.parse(route.request().postData()));await route.fulfill({status:fail?503:200,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:'{"received":true}'})});
 await page.evaluate(async language=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const card=document.createElement('section');card.id='feedback-fixture';document.body.append(card);(await import('/in-game-feedback.js')).addInGameFeedback(card,'version:371',language)},language);
 await page.locator('#feedback-fixture button').click();await page.locator('dialog[open] textarea').fill('This is a test issue');await page.locator('dialog[open] button[type=submit]').click();await page.waitForFunction(()=>!document.querySelector('dialog[open] textarea').disabled);assert.equal(await page.locator('dialog[open] textarea').inputValue(),'This is a test issue');fail=false;await page.locator('dialog[open] button[type=submit]').click();await page.waitForFunction(()=>!document.querySelector('dialog[open] button[type=submit]'));assert.equal(calls.length,2);assert.equal(calls[0].requestId,calls[1].requestId);assert.equal(calls[0].diagnostics,'version:371');await page.evaluate(()=>{document.querySelector('dialog[open]').close();document.querySelector('#feedback-fixture').remove()});await page.unroute('**/playerFeedbackApi');
 }
 console.log('FEEDBACK KO/EN/JA failure preservation and idempotent retry PASS');
 await page.evaluate(async()=>{
 window.g=await import('/state.js?v=20260909dev305');g.createCharacter(100);const source=g.state.homes[g.active().homeId],room=Object.values(source.rooms)[0];room.ownerCharacterIds=[g.active().id];room.accessCharacterIds=[g.active().id];room.accessMode='selected';source.image='https://example.invalid/home.png';room.image='https://example.invalid/room.png';
 const transfer=await import('/world-transfer.js');const pack=transfer.makeWorldPackage(g.state,'home',source.id);window.homeWrites=[];
 const snapshot={activeGroupId:'qa-import',group:{id:'qa-import',towns:[{id:source.townId,name:'QA'}]},homes:[{id:'shared-target',townId:source.townId,layoutRevision:7,layoutJson:JSON.stringify(source)}],residents:[{id:'shared-person',name:'Shared person',profileJson:'{}',townId:source.townId,sharedHomeId:'shared-target'}]};
 window.DrawerVillageGroups={getSnapshot:()=>snapshot,readWorldCode:async()=>({package:pack}),saveHomeLayout:async value=>homeWrites.push(value)};
 await transfer.worldTransferDialog({homeId:'shared-target',render:()=>{},toast:message=>{throw Error(message)},limits:()=>({})});
 });
 await page.getByRole('button',{name:'공유 코드로 불러오기',exact:true}).click();await page.locator('dialog[open] details summary').click();await page.locator('dialog[open] label select').first().selectOption('shared-person');await page.getByRole('button',{name:'이 멀티 집의 방·인테리어에 적용',exact:true}).click();
 const writes=await page.evaluate(()=>homeWrites);assert.equal(writes.length,1);assert.equal(writes[0].id,'shared-target');assert.equal(writes[0].revision,7);const room=Object.values(writes[0].layout.rooms)[0];assert.deepEqual(room.ownerCharacterIds,['shared-person']);assert.deepEqual(room.accessCharacterIds,['shared-person']);assert.equal(writes[0].layout.image,'https://example.invalid/home.png');assert.equal(room.image,'https://example.invalid/room.png');console.log('SHARED HOME import room picture / owner remap / revision PASS');
 await page.evaluate(async()=>{
 const snapshot=DrawerVillageGroups.getSnapshot();snapshot.residents=[];homeWrites.length=0;
 await (await import('/world-transfer.js')).worldTransferDialog({homeId:'shared-target',render:()=>{},toast:message=>{throw Error(message)},limits:()=>({})});
 });
 await page.getByRole('button',{name:'공유 코드로 불러오기',exact:true}).click();
 assert.equal(await page.locator('dialog[open] details').getAttribute('open'),null);
 await page.getByRole('button',{name:'이 멀티 집의 방·인테리어에 적용',exact:true}).click();
 const emptyCopy=await page.evaluate(()=>homeWrites[0]);assert(emptyCopy);assert.deepEqual(Object.values(emptyCopy.layout.rooms)[0].ownerCharacterIds,[]);assert.equal(Object.values(emptyCopy.layout.rooms)[0].accessMode,'everyone');assert.equal(emptyCopy.layout.image,'https://example.invalid/home.png');console.log('EMPTY MULTIPLAYER HOME copy without character matching PASS');
 const seats=await page.evaluate(async()=>{
 const {contextDestination}=await import('/context-actions.js');const c=g.active(),h=g.state.homes[c.homeId],roomKey=Object.keys(h.rooms)[0],room=h.rooms[roomKey];room.ownerMode='common';room.ownerCharacterIds=[];room.accessMode='all';const table={id:'table',item:'식탁',x:50,y:50};room.furniturePlacements=[table];const target={type:'furniture',id:'table',homeId:h.id,room:roomKey};const missing=contextDestination(g.state,c,target,'meal')===null;
 room.furniturePlacements.push({id:'chair',item:'의자',x:50,y:60,tableId:'table'});const available=contextDestination(g.state,c,target,'meal')?.furniture?.id==='chair';h.lifeSimulation={agents:{other:{phase:'using',furnitureId:'chair'}}};const busy=contextDestination(g.state,c,target,'meal')===null;return {missing,available,busy};
 });assert.deepEqual(seats,{missing:true,available:true,busy:true});console.log('TABLE requires free chair PASS');

}finally{await browser.close();server.close()}
