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


 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.state.characters[g.createCharacter()],b=g.state.characters[g.createCharacter()];a.name='First';b.name='Second';a.ageGroup=b.ageGroup='성인';b.homeId=a.homeId;b.townId=a.townId;g.state.activeId=a.id;g.state.activeTownId=a.townId;g.state.activeHomeId=a.homeId;window.qaPeople=[a.id,b.id];g.updateCharacterView(b.id,a.id,'touchIntensity','성인 간 친밀한 접촉까지');const h=g.state.homes[a.homeId];h.rooms.living.furniturePlacements=[{id:'qa-sofa',item:'소파',x:50,y:60}];window.DrawerVillageNavigation.go('home');window.qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await page.waitForTimeout(500);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-furniture-placement="qa-sofa"]').click({position:{x:8,y:30}});
 const menu=page.locator('[data-context-menu]');await menu.waitFor();await menu.getByRole('button',{name:'스킨십하기',exact:true}).click();await menu.getByRole('button',{name:'Second',exact:true}).click();await page.waitForTimeout(600);
 assert.equal(await menu.count(),0);
 const result=await page.evaluate(()=>{const [a,b]=qaPeople,d=g.state.characterDirectives[a];return {kind:d.kind,seat:d.furniture?.id,other:g.state.characterDirectives[b]?.kind}});assert.deepEqual(result,{kind:'affection',seat:'qa-sofa',other:'affection'});
 console.log('PASS real furniture menu -> companion -> affection directive',result);
 for(const tab of ['character','routine','relationship','catalog','shop','town','home','mailbox','settings']){
  await page.evaluate(tab=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go(tab)},tab);await page.waitForTimeout(200);
  const metrics=await page.evaluate(()=>({text:document.querySelector('#app')?.textContent?.length||document.body.textContent.length,dialogs:document.querySelectorAll('dialog[open]').length}));assert(metrics.text>20,tab);console.log('OPEN',tab,metrics);
 }
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));assert(await page.locator('.settings-home .app-version-card').isVisible());
 console.log('PASS navigation smoke only; individual dialog scrolling covered separately');
}finally{await browser.close();server.close()}
