import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-home428');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const id=g.createCharacter();window.c=g.state.characters[id];c.name='Bed test';c.icon='assets/shop/drawer-shop-nerine.png';c.ageGroup='성인';window.home=g.state.homes[c.homeId];const base=Object.values(home.rooms).find(r=>r.type==='bedroom');home.rooms={foreign:{...base,name:'Other room',furniturePlacements:[{id:'other-bed',item:'1인 침대',x:50,y:50}]},own:{...base,name:'Own room',furniturePlacements:[{id:'my-bed',item:'1인 침대',x:50,y:45}]}};c.sleepRoomId='own';for(const r of c.residences||[])if(r.homeId===home.id)r.sleepRoomId='own';g.state.activeId=id;g.state.activeHomeId=home.id;g.state.activeTownId=c.townId;document.documentElement.classList.add('native-app');g.directCharacterActivity(id,'nap',{lifeTask:'sleep',now:Date.now()-120000});window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(800);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 assert.equal(await page.evaluate(()=>g.state.characterDirectives[c.id].room),'own');
 assert.equal(await page.locator('.is-using-couple-bed').count(),1);
 assert.equal(await page.locator('.is-using-couple-bed').getAttribute('data-couple-bed-id'),'my-bed');
 await page.screenshot({path:out+'/actual-bed.png'});
 await page.locator('[data-open-home-feature="house-info"]').first().click();
 const hero=page.locator('.home-information-hero');assert.equal(await hero.locator('[data-home-interior-image]').count(),1);assert.equal(await hero.locator('[data-home-building-shape]').count(),1);
 const exterior=hero.locator('[data-home-building-shape]');assert.equal(await exterior.locator('span').count(),0);assert.equal(await exterior.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');assert.equal(await exterior.evaluate(e=>getComputedStyle(e).boxShadow),'none');
 await page.screenshot({path:out+'/home-info.png'});
 for(const mode of ['dark','light']){await page.evaluate(mode=>document.documentElement.dataset.colorMode=mode,mode);assert.equal(await exterior.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');}

 await page.evaluate(()=>{document.querySelector('[data-home-feature="house-info"]').classList.remove('open');window.qaRoomEditor(home.id,'own')});
 const grids=page.locator('.room-surface-choices');assert.equal(await grids.count(),2);assert.equal(await grids.nth(0).locator('button').count(),5);assert.equal(await grids.nth(1).locator('button').count(),7);
 await grids.nth(0).locator('button').last().click();await grids.nth(1).locator('button').last().click();
 await page.locator('.room-surface-choices img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert.equal(await page.locator('[name="floorMaterial"]').inputValue(),'walnut');assert.equal(await page.locator('[name="wallMaterial"]').inputValue(),'amber-tile');
 await page.screenshot({path:out+'/surfaces.png'});

 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.waitForTimeout(100);await page.locator('[data-home-edit]').first().click();await page.waitForTimeout(100);
 const elevator=page.locator('.home-native-elevator');assert.equal(await elevator.count(),1);await elevator.locator('[data-home-floor-count]').selectOption('3');assert.equal(await page.evaluate(()=>g.state.homes[home.id].floorCount),3);await page.locator('[data-home-floor-step="1"]').click();assert.equal(await page.evaluate(()=>g.state.homes[home.id].activeFloor),2);
 await page.evaluate(()=>{g.state.homes[home.id].activeFloor=1;g.state.homes[home.id].rooms.own.furniturePlacements=[{id:'bottom',item:'TV',x:50,y:60,scale:1},{id:'top',item:'TV',x:50,y:60,scale:1}];window.qaRender()});
 await page.locator('[data-home-drawer-toggle]').click();await page.waitForTimeout(300);
 await page.locator('[data-furniture-placement=top] img').evaluate(i=>i.decode());
 const point=await page.locator('[data-furniture-placement=top] img').evaluate(el=>{const b=el.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}});
 await page.mouse.click(point.x,point.y);assert.equal(await page.locator('[data-furniture-edit-toolbar]').getAttribute('data-placement-id'),'top');await page.mouse.click(point.x,point.y);assert.equal(await page.locator('[data-furniture-edit-toolbar]').getAttribute('data-placement-id'),'bottom');await page.mouse.click(point.x,point.y);assert.equal(await page.locator('[data-furniture-edit-toolbar]').getAttribute('data-placement-id'),'top');
 await page.screenshot({path:out+'/floor-and-layer-selection.png'});
 await page.locator('[data-home-visibility="furniture"]').click();assert.equal(await page.locator('[data-furniture-placement=top]').isVisible(),false);assert(await page.locator('[data-room-resize]').first().isVisible());
 await page.locator('[data-home-visibility="furniture"]').click();await page.locator('[data-home-visibility="names"]').click();assert.equal(await page.locator('[data-furniture-placement=top]>small').isVisible(),false);
 await page.locator('[data-home-ui-toggle]').click();assert.equal(await page.locator('.home-native-side').isVisible(),false);assert(await page.locator('[data-home-ui-toggle]').isVisible());await page.evaluate(()=>qaRender());assert.equal(await page.locator('.home-native-side').isVisible(),false);await page.locator('[data-home-ui-toggle]').click();
 assert.equal(await page.evaluate(()=>g.cloneState().homes[home.id].floorCount||1),1);assert.equal(await page.evaluate(()=>g.cloneState().homeEditMode),false);await page.locator('[data-home-edit-cancel]').click();assert.equal(await page.evaluate(()=>g.state.homes[home.id].floorCount||1),1);assert.equal(await page.evaluate(()=>g.state.homeEditMode),false);
 await page.locator('[data-home-edit]').first().click();await page.evaluate(()=>qaRoomEditor(home.id,'own'));await page.locator('[data-preset-name]').fill('My room');await page.locator('[data-preset-save]').click();assert.equal(await page.evaluate(()=>g.state.homes[home.id].roomPresets.length),1);await page.locator('[data-preset-select]').selectOption({label:'My room'});await page.locator('[data-preset-apply]').click();await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>g.state.homeEditMode),true);assert.equal(await page.evaluate(()=>g.state.homes[home.id].rooms.own.furniturePlacements[0].assignedCharacterIds.length),0);
 await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());g.setHomeEditMode(false);window.DrawerVillageNavigation.go('character');g.state.characterSettingsView='full';g.state.characterPane='body';qaRender()});await page.waitForTimeout(100);
 await page.waitForTimeout(700);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-character-body-pane="appearance"]').click();
 const custom=page.locator('[data-body-field="appearance.hairColor"]').first();await custom.selectOption('__custom_color');await page.locator('dialog[open] [name=label]').fill('Moon silver');await page.locator('dialog[open] [name=color]').fill('#aabbcc');await page.locator('dialog[open] button[value=save]').click();await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>g.state.characters[c.id].bodyProfile.appearance.hairColor),'Moon silver · #aabbcc');
 await page.screenshot({path:out+'/custom-colors.png'});
 console.log('PASS428 home: hide UI/furniture/names, cancel, room presets; floors increase from edit mode; overlapping furniture cycles top to bottom; existing bed and surfaces regressions pass.');
}finally{await browser.close();server.closeAllConnections();server.close()}
