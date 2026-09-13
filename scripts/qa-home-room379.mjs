import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js'&&process.argv.includes('--baseline-scroll'))body=body.toString().replace('if(target)requestAnimationFrame(()=>{selectFurniture(target)});','if(target)requestAnimationFrame(()=>{target.scrollIntoView({block:"center",behavior:"smooth"});selectFurniture(target)});');if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);


 await page.evaluate(async()=>{document.documentElement.classList.add('native-app');window.g=await import('/state.js?v=20260909dev305');const c=g.state.characters[g.createCharacter()];g.state.activeId=c.id;g.state.activeTownId=c.townId;g.state.activeHomeId=c.homeId;window.DrawerVillageNavigation.go('home');g.setHomeEditMode(true);window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const roomResults=await page.evaluate(async()=>{
  const {resolveHomeRoomForActivity}=await import('/simulation.js?v=20260909dev305');
  const c=g.state.characters[g.state.activeId],home={id:c.homeId,rooms:{utility:{type:'bath',order:0,furniturePlacements:[{item:'세탁기'},{item:'건조기'}]},bathroom:{type:'other',order:1,furniturePlacements:[{item:'샤워부스'},{item:'욕조'}]}}};
  const scene={title:'샤워하는 중',minute:400};const shower=resolveHomeRoomForActivity(c,home,'bath',scene);
  const explicitWrong=resolveHomeRoomForActivity(c,home,'utility',scene);
  const laundry=resolveHomeRoomForActivity(c,home,'utility',{title:'빨래하는 중'}), dishes=resolveHomeRoomForActivity(c,home,'utility',{title:'그릇을 씻는 중'});
  home.rooms.bathroom.accessMode='selected';home.rooms.bathroom.accessCharacterIds=['other'];
  const denied=resolveHomeRoomForActivity(c,home,'bath',scene);
  return {shower,explicitWrong,denied,laundry,dishes};
 });
 assert.equal(roomResults.laundry,'utility');assert.equal(roomResults.dishes,'utility');assert.equal(roomResults.shower,'bathroom');assert.equal(roomResults.explicitWrong,'bathroom');assert.notEqual(roomResults.denied,'bathroom');
 await page.evaluate(()=>{const h=g.state.homes[g.state.activeHomeId];const keys=Object.keys(h.rooms);const last=h.rooms[keys[keys.length-1]];last.furniturePlacements=[{id:'oversize',item:'커플 침대',x:90,y:96,scale:4}];window.qaRender()});
 await page.waitForTimeout(200);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const before=await page.locator('[data-room-canvas]').boundingBox();
 await page.evaluate(()=>document.querySelector('[data-home-add-furniture="소파"]').click());
 await page.waitForTimeout(700);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.evaluate(()=>document.querySelector('[data-home-drawer-toggle]').click());
 const sofa=await page.locator('[data-furniture-placement]').filter({has:page.locator('img[src*=sofa]')}).first().boundingBox();
 const destination=await page.locator('.room[data-room-key="study"]').boundingBox();
 await page.mouse.move(sofa.x+sofa.width/2,sofa.y+sofa.height/2);await page.mouse.down();await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height*.85,{steps:8});await page.mouse.up();
 await page.waitForTimeout(700);
 const after=await page.locator('[data-room-canvas]').boundingBox();
 assert(Math.abs(before.y-after.y)<1,JSON.stringify({before,after}));
 const hiddenScroll=await page.evaluate(()=>[...document.querySelectorAll('.home-page,.home-grid,.home,.rooms,.room')].map(e=>e.scrollTop));
 assert(hiddenScroll.every(v=>v===0),JSON.stringify(hiddenScroll));
 assert(await page.locator('[data-furniture-edit-toolbar]').isVisible());
 await page.screenshot({path:resolve(out,useWebKit?'room-fix-webkit.png':'room-fix-chrome.png')});
 console.log('PASS real bathing fixture selection, access guard, furniture insertion preserves canvas position',roomResults,{before,after});
}finally{await browser.close();server.close()}

