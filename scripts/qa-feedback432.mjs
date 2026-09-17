import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback432');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const id=g.createCharacter();window.c=g.state.characters[id];c.name='Bed test';c.icon='assets/shop/drawer-shop-nerine.png';c.ageGroup='성인';window.home=g.state.homes[c.homeId];const base=Object.values(home.rooms).find(r=>r.type==='bedroom');home.rooms={foreign:{...base,name:'Other room',furniturePlacements:[{id:'other-bed',item:'1인 침대',x:50,y:50}]},own:{...base,name:'Own room',furniturePlacements:[{id:'my-bed',item:'1인 침대',x:50,y:45}]}};c.sleepRoomId='own';for(const r of c.residences||[])if(r.homeId===home.id)r.sleepRoomId='own';g.state.activeId=id;g.state.activeHomeId=home.id;g.state.activeTownId=c.townId;document.documentElement.classList.add('native-app');g.directCharacterActivity(id,'nap',{lifeTask:'sleep',now:Date.now()-120000});window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});


 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 for(const language of ['ko','en','ja']){
  await page.evaluate(language=>{g.state.uiLanguage=language;qaRoomEditor(home.id,'own')},language);
  assert.equal(await page.locator('.room-surface-choices').count(),0);
  const editor=page.locator('dialog.room-editor-dialog');
  await page.locator('[data-room-surface-picker="wallMaterial"]').click();assert(await page.locator('.room-surface-picker').isVisible());if(language==='ko')await page.screenshot({path:out+'/wallpaper-picker.png'});
  await page.locator('[data-surface-value="amber-tile"]').click();await page.locator('.room-surface-picker').waitFor({state:'detached'});assert.equal(await page.locator('.room-surface-picker').count(),0);assert.equal(await page.locator('[name="wallMaterial"]').inputValue(),'amber-tile');
  await page.locator('[data-room-surface-picker="floorMaterial"]').click();await page.locator('[data-surface-value="walnut"]').click();await page.locator('.room-surface-picker').waitFor({state:'detached'});assert.equal(await page.locator('[name="floorMaterial"]').inputValue(),'walnut');
  await page.evaluate(()=>document.querySelector('dialog[open]').close());await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>g.state.homes[home.id].rooms.own.floorMaterial),'walnut');
 }
 await page.evaluate(()=>{g.state.uiLanguage='ko';g.setHomeEditMode(false);qaRender()});
 assert(await page.locator('.home-native-back').isVisible());await page.locator('[data-home-ui-toggle]').click();assert(!await page.locator('.home-native-back').isVisible());assert(await page.locator('[data-home-ui-toggle]').isVisible());await page.locator('[data-home-ui-toggle]').click();assert(await page.locator('.home-native-back').isVisible());
 const depth=await page.evaluate(()=>[...document.querySelectorAll('.room')].map(room=>{const heading=room.querySelector('.room-heading');return {title:Number(getComputedStyle(heading).zIndex),furniture:[...room.querySelectorAll('[data-furniture-placement]')].map(el=>Number(getComputedStyle(el).zIndex)||0)}}));assert(depth.every(d=>d.furniture.every(z=>d.title>z)),JSON.stringify(depth));
 await page.screenshot({path:out+'/room-ui.png'});
 await page.evaluate(()=>{g.setHomeEditMode(true);qaRender();document.documentElement.dataset.activeTab='groups'});
 await page.getByRole('button',{name:'보기',exact:true}).click();await page.locator('[data-home-ui-toggle]').click();assert(!await page.locator('.home-native-back').isVisible());assert(!await page.locator('.home-tools-header').isVisible());assert(await page.locator('[data-home-ui-toggle]').isVisible());await page.locator('[data-home-ui-toggle]').click();assert(await page.locator('.home-tools-header').isVisible());
 const sounds=await page.evaluate(async()=>{
  const wait=()=>new Promise(r=>setTimeout(r,70)),box=document.createElement('div');box.dataset.characterFullUiVersion='10';document.body.append(box);g.state.characterSettingsView='full';g.state.soundMuted=false;g.state.soundEffectsVolume=80;
  const out=[];for(const attr of ['data-character-pane="body"','data-close-full-character-settings','data-tab="observe"','data-home-social="drawer"','data-plain']){const b=document.createElement('button');b.innerHTML='test';const [key,value]=attr.split('=');b.setAttribute(key,value?.replaceAll('"','')||'');box.append(b);await wait();const before=qaSounds.length;b.click();out.push(qaSounds.slice(before).map(s=>s.split('/').at(-1)));b.remove()}box.remove();const audio=await import('/web-audio.js?v=20260909dev305');audio.setAudioSetting(g.state,'soundMuted',true);await wait();const b=document.createElement('button');document.body.append(b);const before=qaSounds.length;b.click();b.remove();return {out,muted:qaSounds.length===before};
 });assert.deepEqual(sounds.out,[['book-page.mp3'],['book-close.mp3'],['drawer-close.mp3'],['drawer-open.mp3'],['ui-select.mp3']]);assert(sounds.muted);
 const shared=await page.evaluate(async()=>{
  const {bindSharedHome}=await import('/shared-home-editor.js'),{sharedSelection}=await import('/shared-world.js?v=20260909dev305');const snap={activeGroupId:'qa432',group:{id:'qa432',ownerUid:'qa',towns:[{id:'t'}]},homes:[{id:'h',ownerUid:'qa',townId:'t',layoutRevision:0,layoutJson:JSON.stringify({rooms:{r:{name:'Room',type:'living',floor:1,furniturePlacements:[]}}})}],residents:[],members:[]};window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa'}})};window.DrawerVillageGroups={getSnapshot:()=>snap,saveHomeLayout:async input=>({revision:input.revision+1})};const root=document.createElement('div');root.innerHTML='<button data-open-room-editor="r">Room</button>';document.body.append(root);bindSharedHome(root,snap,()=>{},()=>{});root.querySelector('button').click();return true;
 });
 await page.locator('[data-room-surface-picker="floorMaterial"]').click();await page.locator('[data-surface-value="charcoal"]').click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>JSON.parse(DrawerVillageGroups.getSnapshot().homes[0].layoutJson).rooms.r.floorMaterial),'charcoal');
 console.log('PASS432: KO/EN/JA modal surface selection/persistence, UI back hidden/restored, room heading depth, 5 exclusive sound routes/mute, shared material save');
}finally{await browser.close();server.closeAllConnections();server.close()}
