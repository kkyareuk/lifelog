import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={beginIntroTour,openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.beginIntroTour(true)});
 const card=p.locator('.intro-tour');
 async function tapCharacter(){const b=await p.locator('.native-main-character').first().boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2)}
 await card.getByRole('button',{name:'첫 주민 만들기',exact:true}).click();
 await p.locator('[data-tutorial-name]').fill('서랍이');await card.getByRole('button',{name:'확인',exact:true}).click();
 await card.getByRole('button',{name:'조용한',exact:true}).click();await card.getByRole('button',{name:'계획적인',exact:true}).click();await card.getByRole('button',{name:'확인',exact:true}).click();await card.getByRole('button',{name:'만들기',exact:true}).click();
 await p.waitForSelector('.intro-tour[data-step="5"]');
 await card.getByRole('button',{name:'확인',exact:true}).click();await p.waitForSelector('.intro-tour[data-step="6"]');
 await p.screenshot({path:'tmp/tutorial488-character.png'});
 
 await tapCharacter();await p.waitForSelector('.intro-tour[data-step="7"]');
 await p.screenshot({path:'tmp/tutorial488-action.png'});
 await p.locator('[data-command-close]').click();await p.waitForSelector('.intro-tour[data-step="6"]');
 await tapCharacter();await p.locator('[data-command-close]').click();await p.waitForSelector('.intro-tour[data-step="8"]');
 await p.reload();await p.waitForFunction(()=>window.photoQA);await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');window.photoQA.beginIntroTour()});await p.waitForSelector('.intro-tour[data-step="8"]');
 await p.locator('.discovery-rail-button').click();await p.waitForSelector('.intro-tour[data-step="9"]');await p.screenshot({path:'tmp/tutorial488-question.png'});
 
 await p.locator('.character-discovery-dialog').getByRole('button',{name:/지금은 넘기기/}).click();await p.waitForSelector('.intro-tour[data-step="10"]');await card.getByRole('button',{name:'시작하기',exact:true}).click();
 assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('drawer-village-intro-v2')).done));
 await p.evaluate(()=>window.photoQA.beginIntroTour(true));await card.getByRole('button',{name:'확인',exact:true}).click();await tapCharacter();await p.locator('.direct-command-dialog [data-direct-simple-action="rest"]').first().click();await p.waitForSelector('.intro-tour[data-step="8"]');
 await card.getByRole('button',{name:'안내 그만 보기',exact:true}).click();
 await p.evaluate(()=>window.DrawerVillageNavigation.go('catalog'));await p.waitForSelector('[data-dict-add]');await p.locator('[data-dict-add]').click();await p.locator('.dictionary-category-choices [data-kind="food"]').click();await p.locator('[data-dict-field="name"]').fill('안내 확인용 사과');await p.locator('[data-dict-field="name"]').press('Tab');await p.locator('[data-dict-save]').click();await p.waitForFunction(()=>localStorage.getItem('drawer-village-feature-tour-v2-catalog')==='done');
 for(const [language,title] of [['en','First steps in Drawer Village'],['ja','村でのはじめの一歩']]){await p.evaluate(async language=>{const {state}=await import('/state.js?v=20260909dev305');state.uiLanguage=language;window.photoQA.beginIntroTour(true)},language);await card.waitFor({state:'visible'});assert((await card.innerText()).includes(title));const bounds=await card.boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=361&&bounds.y+bounds.height<=793);await card.locator('button').last().click()}
 assert.deepEqual(errors,[]);console.log('PASS tutorial creation, menu cancellation, resume, question skip and successful activity; no JS errors');
}finally{await browser.close();server.closeAllConnections();server.close()}
