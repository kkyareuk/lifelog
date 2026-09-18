import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback433');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/qa-empty'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><body></body>');return;}const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 console.log('browser ready');
 const page=await browser.newPage({viewport:{width:384,height:832},hasTouch:true,serviceWorkers:'block'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.resolve()});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 console.log('loading app');await page.goto(origin);console.log('app loaded');await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.id=g.createCharacter();g.setActive(id);document.documentElement.classList.add('native-app');window.DrawerVillageNavigation.go('observe');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 const mailResult=await page.evaluate(async()=>{
  const api=window.DrawerVillageGroups??={};const original=api.getSnapshot||(()=>({}));
  api.getSnapshot=()=>({...original(),incomingMail:[{id:'qa-notice',senderUid:'operator',announcement:true,subject:'QA notice',body:'Body',createdAt:Date.now()}],outgoingMail:[],incomingProposals:[],outgoingProposals:[]});
  api.refreshMailbox=async()=>{};
  window.DrawerVillageNavigation.go('mailbox');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  return {page:!!document.querySelector('.mail-center'),rows:document.querySelectorAll('[data-mail-open]').length};
 });
 console.log('mail page',mailResult);
 await page.locator('[data-mail-open]').first().click();
 console.log('open letters',await page.locator('.mail-reader[open]').count(),'errors',errors);
 assert.equal(await page.locator('.mail-reader[open]').count(),1);
 assert.deepEqual(errors,[]);
 await page.evaluate(()=>document.querySelector('.mail-reader[open]').close());
 await page.evaluate(async()=>{
  const {accountStorage}=await import('/account-storage.js?v=20260909dev305');
  const {createContactMailbox}=await import('/notification-mail.js?v=20260909dev305');
  const mailbox=createContactMailbox(accountStorage);
  mailbox.record(['letter','question','removed'].map(mode=>({extra:{mailOwner:accountStorage.scope,mailId:'qa-'+mode,scheduledAt:new Date(Date.now()-1000).toISOString(),mailTitle:'QA '+mode,mailBody:'Character letter body',characterId:mode==='removed'?'missing':id,mode:mode==='question'?'question':'message',questionKind:'everyday'}})));
  mailbox.record([{extra:{mailOwner:accountStorage.scope,mailId:123,scheduledAt:new Date(Date.now()-1000).toISOString(),mailTitle:'Older question',mailBody:'Older letter remains readable',characterId:id,mode:'question',questionOptions:[null,{kind:'rest'}]}}]);
 });
 await page.locator('[data-mail-folder="inbox"]').click();
 for(const mode of ['letter','question','removed']){
  await page.locator(`[data-open-contact-mail="qa-${mode}"]`).tap();
  console.log(mode,'open',await page.locator('.mail-letter[open]').count(),'errors',errors);
  assert.equal(await page.locator('.mail-letter[open]').count(),1,mode);
  await page.evaluate(()=>document.querySelector('.mail-letter[open]').close());
  await page.waitForTimeout(100);
 }
 assert.deepEqual(errors,[]);
 await page.locator('[data-open-contact-mail="123"]').tap();
 assert.equal(await page.locator('.mail-letter[open]').count(),1,'legacy ID and unusable saved options');
 await page.evaluate(()=>document.querySelector('.mail-letter[open]').close());
 console.log('PASS mailbox');
 await page.evaluate(async()=>{
  const home=structuredClone(g.state.homes[g.state.characters[id].homeId]);home.floorCount=2;home.activeFloor=1;
  Object.values(home.rooms)[1].floor=2;
  Object.values(home.rooms)[1].furniturePlacements=[{id:'qa-counter',item:'카운터',x:50,y:60,scale:1,rotation:0,layer:1,counterSpan:1},{id:'qa-pot',item:'화분 2',x:50,y:50,scale:1,rotation:0,layer:0,surfaceId:'qa-counter',surfaceU:.5,surfaceV:.5},{id:'qa-chair',item:'의자',x:20,y:70,scale:1,rotation:0,layer:0}];
  window.qaHome=home;window.qaSaved=[];
  const account=window.ParallelCityAuth.getInfo().user?.uid;
  window.qaSnapshot={activeGroupId:'qa-group',group:{id:'qa-group',ownerUid:account,name:'QA',towns:g.state.towns},homes:[{id:home.id,ownerUid:account,layoutRevision:0,layoutJson:JSON.stringify(home)}],residents:[],members:[],catalog:[],relationships:[],schedules:[]};
  window.DrawerVillageGroups.getSnapshot=()=>qaSnapshot;
  window.DrawerVillageGroups.saveHomeLayout=async input=>{qaSaved.push(input);return {revision:input.revision+1}};
  const {sharedSelection}=await import('/shared-world.js?v=20260909dev305');sharedSelection(qaSnapshot).homeEditMode=true;
  window.DrawerVillageNavigation.go('home');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
 });
 await page.waitForTimeout(200);
 await page.locator('[data-home-floor-select]').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('change',{bubbles:true}))});
 assert.equal(await page.locator('[data-home-floor-select]').inputValue(),'2');
 assert.equal(await page.evaluate(()=>qaSaved.length),0,'view floor never saves/moves rooms');
 console.log('PASS multiplayer floor navigation');
 await page.waitForTimeout(300);
 await page.evaluate(()=>document.querySelectorAll('dialog.page-guide[open]').forEach(d=>d.close()));
 const layers=await page.locator('[data-furniture-placement]').evaluateAll(items=>Object.fromEntries(items.map(el=>[el.dataset.furniturePlacement,Number(getComputedStyle(el).zIndex)])));
 assert(layers['qa-pot']>layers['qa-counter'],'surface child painted above support');
 await page.locator('[data-furniture-placement="qa-chair"] .room-furniture-art').tap();
 assert.equal(await page.locator('.shared-home-dialog[open]').count(),0,'chair tap does not open room');
 assert(await page.locator('[data-furniture-placement="qa-chair"]').evaluate(el=>el.classList.contains('is-selected')),'chair selected');
 console.log('PASS multiplayer chair and surface',layers);
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();server.close()}



