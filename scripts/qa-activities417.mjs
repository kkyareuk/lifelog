import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-activities417');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);


 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.state.characters[g.createCharacter()],b=g.state.characters[g.createCharacter()];a.name='First';b.name='Second';a.ageGroup=b.ageGroup='성인';b.homeId=a.homeId;b.townId=a.townId;g.state.activeId=a.id;g.state.activeTownId=a.townId;g.state.activeHomeId=a.homeId;window.qaPeople=[a.id,b.id];g.updateCharacterView(b.id,a.id,'touchIntensity','성인 간 친밀한 접촉까지');const h=g.state.homes[a.homeId];h.rooms.living.furniturePlacements=[{id:'qa-sofa',item:'소파',x:50,y:60}];window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});

 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll("dialog[open]:not(.direct-command-dialog)").forEach(d=>d.close()));
 await page.locator('[data-furniture-placement="qa-sofa"]').click({position:{x:8,y:30}});
 await page.locator('[data-context-menu]').getByRole('button',{name:'다른 행동',exact:true}).click();

 const menu=page.locator('[data-context-menu]');await menu.waitFor();assert.equal(await page.locator('.direct-command-dialog').count(),0);
 const catalog=await page.evaluate(async()=>{const {allContextGroups}=await import('/context-catalog.js');const {LIFE_TASKS}=await import('/life-tasks.js?v=20260909dev305');const rows=allContextGroups(g.state,g.state.characters[qaPeople[0]]).flatMap(g=>g.actions);return {ids:rows.map(a=>a.lifeTask),kinds:rows.map(a=>a.kind),required:LIFE_TASKS.map(t=>t.id)}});
 for(const id of catalog.required)assert(catalog.ids.includes(id),id);
 for(const kinds of Object.values(await page.evaluate(()=>qaActivityGroups)))for(const kind of kinds)assert(catalog.kinds.includes(kind),kind);
 await menu.getByRole('button',{name:'교류·상호작용',exact:true}).click();await menu.getByRole('button',{name:'포옹하기',exact:true}).click();await menu.getByRole('button',{name:'Second',exact:true}).click();await menu.getByRole('button',{name:'이 행동 시작',exact:true}).click();await menu.waitFor({state:'detached'});
 const result=await page.evaluate(()=>g.state.characterDirectives[qaPeople[0]]);assert.equal(result.kind,'hug');assert.equal(result.withId||result.targetId,await page.evaluate(()=>qaPeople[1]));
 for(const lang of ['ko','en','ja']){await page.evaluate(lang=>{g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},lang);await page.locator('[data-furniture-placement="qa-sofa"]').click({position:{x:8,y:30}});await menu.locator('button').last().click();await page.evaluate(()=>new Promise(requestAnimationFrame));const box=await menu.boundingBox();assert(box.y>=0&&box.y+box.height<=821,JSON.stringify({lang,box}));await page.screenshot({path:out+'/'+(useWebKit?'webkit':'chrome')+'-'+lang+'.png'});await page.evaluate(()=>document.querySelector('[data-context-menu]').close());}
 console.log('PASS417 complete original activities remain within contextual menu; companion and confirmation execute hug; KO/EN/JA fit.');
}finally{await browser.close();server.close()}
