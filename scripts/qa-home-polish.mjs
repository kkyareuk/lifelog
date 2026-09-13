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


 await page.evaluate(async()=>{document.documentElement.classList.add('native-app');window.g=await import('/state.js?v=20260909dev305');const a=g.state.characters[g.createCharacter()],b=g.state.characters[g.createCharacter()];a.name='First';a.icon='assets/home-ui/routine.png';b.name='Second';a.ageGroup=b.ageGroup='성인';b.homeId=a.homeId;b.townId=a.townId;g.state.activeId=a.id;g.state.activeTownId=a.townId;g.state.activeHomeId=a.homeId;window.qaPeople=[a.id,b.id];g.updateCharacterView(b.id,a.id,'touchIntensity','성인 간 친밀한 접촉까지');const h=g.state.homes[a.homeId];h.rooms.living.furniturePlacements=[{id:'qa-sofa',item:'소파',x:50,y:60}];window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(500);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-furniture-placement="qa-sofa"]').click({position:{x:8,y:30}});
 const menu=page.locator('[data-context-menu]');await menu.waitFor();
 for(const name of ['편하게 쉬기','낮잠 자기','책 읽기','영상 보기','음악 듣기','스킨십하기'])assert(await menu.getByRole('button',{name,exact:true}).isVisible(),name);
 await menu.getByRole('button',{name:'낮잠 자기',exact:true}).click();await page.waitForTimeout(400);
 assert.equal(await page.evaluate(()=>g.state.characterDirectives[qaPeople[0]].kind),'nap');
 await page.evaluate(()=>{const d=g.state.characterDirectives[qaPeople[0]];d.journey.arrivesAt=Date.now()-1;g.state.characters[qaPeople[0]].timelineResetAt=Date.now();window.DrawerVillageNavigation.go('home');window.qaRender()});await page.waitForTimeout(500);
 
 const person=page.locator('[data-home-occupant="character"]').first();
 await page.waitForTimeout(150);assert(await person.evaluate(e=>e.classList.contains('is-seated')));
 await page.screenshot({path:resolve(out,useWebKit?'seated-webkit.png':'seated-chrome.png')});
 await person.click({force:true});
 const info=page.locator('[data-home-occupant-sheet]');await info.waitFor();assert.equal(await page.locator('[data-context-menu]').count(),0);
 const box=await info.boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=402&&box.y+box.height<=821,JSON.stringify(box));
 await info.locator('[data-open-command]').click();await page.locator('.direct-command-dialog[open]').waitFor();
 await page.locator('[data-command-close]').click();
 console.log('PASS sofa choices execute nap; resident info precedes activity dialog and fits mobile viewport');
 await page.evaluate(()=>{g.setHomeEditMode(true);window.qaRender();const el=document.querySelector('[data-furniture-placement="qa-sofa"]');el.style.position='fixed';el.style.top='700px';const r=el.querySelector('.furniture-sprite').getBoundingClientRect();el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,button:0,clientX:r.x+r.width/2,clientY:r.y+r.height/2}))});
 const toolbar=page.locator('[data-furniture-edit-toolbar]');assert(await toolbar.isVisible());
 const tb=await toolbar.boundingBox();assert(tb.y>=0&&tb.y+tb.height<700,JSON.stringify(tb));
 console.log('PASS lower furniture toolbar appears above selection');
 await page.evaluate(()=>{g.setHomeEditMode(false);window.qaRender()});
 for(const tab of ['character','routine','relationship','catalog','shop','town','home','mailbox','settings']){
  await page.evaluate(tab=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go(tab)},tab);await page.waitForTimeout(200);
  const metrics=await page.evaluate(()=>({text:document.querySelector('#app')?.textContent?.length||document.body.textContent.length,dialogs:document.querySelectorAll('dialog[open]').length}));assert(metrics.text>20,tab);console.log('OPEN',tab,metrics);
 }
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));assert(await page.locator('.settings-home .app-version-card').isVisible());
 console.log('PASS navigation smoke only; individual dialog scrolling covered separately');
}finally{await browser.close();server.close()}