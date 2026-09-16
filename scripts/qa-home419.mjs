import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-home419');await mkdir(out,{recursive:true});
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
 await page.screenshot({path:out+'/home-info.png'});
 await page.evaluate(()=>{document.querySelector('[data-home-feature="house-info"]').classList.remove('open');window.qaRoomEditor(home.id,'own')});
 const grids=page.locator('.room-surface-choices');assert.equal(await grids.count(),2);assert.equal(await grids.nth(0).locator('button').count(),5);assert.equal(await grids.nth(1).locator('button').count(),7);
 await grids.nth(0).locator('button').last().click();await grids.nth(1).locator('button').last().click();
 await page.locator('.room-surface-choices img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert.equal(await page.locator('[name="floorMaterial"]').inputValue(),'walnut');assert.equal(await page.locator('[name="wallMaterial"]').inputValue(),'amber-tile');
 await page.screenshot({path:out+'/surfaces.png'});
 console.log('PASS419 actual native home renders assigned single bed occupant; one interior photo plus exterior icon.');
}finally{await browser.close();server.closeAllConnections();server.close()}


