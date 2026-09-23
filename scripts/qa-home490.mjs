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
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(12000);p.on('console',m=>{if(m.type()==='error')console.error(m.text())});p.on('pageerror',e=>{errors.push(e.message);console.error(e.stack)});
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
 await p.evaluate(()=>window.DrawerVillageNavigation.go('home'));
 const guide=p.locator('.home-tour');
 async function step(n){await p.waitForSelector('.home-tour[data-home-tour-step="'+n+'"]');console.log('step',n);}
 async function info(n){await step(n);await guide.locator('p').click()}
 await info(0);await step(1);await p.locator('[data-open-home-feature="house-info"]').click();await info(2);await step(3);await p.locator('[data-home-feature="house-info"].open [data-close-home-feature]').click();
 await step(4);await p.locator('[data-open-home-feature="room-info"]').click();await step(5);await p.locator('[data-room-info-edit="living"]').click();await info(6);await step(7);await p.locator('.room-editor-dialog[open] .home-design-back').click();
 await step(8);await p.locator('[data-open-home-feature="members"]').click();await info(9);await step(10);await p.locator('[data-member-edit="resident"]').first().click();await info(11);await step(12);await p.locator('.home-member-editor[open] .home-design-back').click();await step(13);await p.locator('[data-home-feature="members"].open [data-close-home-feature]').click();
 await step(14);await p.locator('[data-home-edit]').first().click();await step(15);await p.locator('[data-home-tools-add]').click();await step(16);await p.screenshot({path:'tmp/home490-placement.png'});
 const source=await p.locator('[data-home-add-furniture="소파"]').boundingBox(),room=await p.locator('[data-home-room-hold="living"]').boundingBox();console.log({source,room});
 await p.mouse.move(source.x+source.width/2,source.y+source.height/2);await p.mouse.down();await p.mouse.move(room.x+room.width*.5,room.y+room.height*.6,{steps:15});await p.mouse.up();
 await step(17);await p.locator('[data-home-tools-done]').click();await step(18);const sofaPoint=await p.locator('.intro-tour-target[data-furniture-placement]').evaluate(el=>{const r=el.getBoundingClientRect();for(const u of [.1,.9,.5])for(const v of [.1,.9,.5]){const x=r.x+r.width*u,y=r.y+r.height*v;if(document.elementFromPoint(x,y)?.closest('[data-furniture-placement]')===el)return {x,y}}return null});assert(sofaPoint,'sofa has an unobscured tap target');await p.mouse.click(sofaPoint.x,sofaPoint.y);await step(19);await p.screenshot({path:'tmp/home490-finish.png'});await info(19);await guide.waitFor({state:'detached'});assert.equal(await p.evaluate(()=>localStorage.getItem('drawer-village-home-tour-v3')),'done');
 assert.deepEqual(errors,[]);console.log('PASS 490 full home guide, real placement and furniture action');
}catch(e){console.error(e);for(const page of browser.contexts().flatMap(c=>c.pages())){await page.screenshot({path:'tmp/home490-error.png'}).catch(()=>{});console.log((await page.locator('body').innerText()).slice(-10000))}throw e}finally{await browser.close();server.closeAllConnections();server.close()}
