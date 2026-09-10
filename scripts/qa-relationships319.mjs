import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-relationships319');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const language of ["ko","en","ja"])for(const viewport of [{width:384,height:832},{width:1180,height:820}]){
console.log('new viewport',viewport);const p=await browser.newPage({viewport,hasTouch:true}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
await p.evaluate(async(language)=>{window.game=await import('/state.js?v=20260909dev305');game.createCharacter();game.createCharacter();game.state.uiLanguage=language;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('relationship')},language);
await p.locator('[data-add-rel]').first().evaluate(el=>el.click());const dialog=p.locator('.relation-editor-dialog[open]');await dialog.waitFor();
const kinds=await dialog.locator('select[name=type] option').evaluateAll(els=>els.map(el=>el.value));assert(kinds.includes('가족'));assert(!kinds.includes('선택한 가족'));assert(!kinds.includes('부모·자녀'));
for(const kind of kinds){await dialog.locator('select[name=type]').selectOption(kind);assert.equal(await dialog.locator('[data-detail]').count(),1);assert.equal(await dialog.locator('.official-order-card').isVisible(),['가족','사제 관계'].includes(kind));}
await dialog.locator('select[name=type]').selectOption('가족');await dialog.locator('[data-detail=origin]').selectOption('3');
assert.equal(await dialog.locator('.official-outside-field').isVisible(),false);assert.equal(await dialog.locator('.form-grid').isVisible(),false);
const order=await dialog.evaluate(d=>[...d.querySelector('.official-relation-fields').children].filter(el=>!el.hidden).map(el=>el.className));assert(order.indexOf('official-stage-field')<order.indexOf('official-relationship-details'));assert(order.indexOf('official-relationship-details')<order.indexOf('official-past-toggle'));
await dialog.locator('.official-role-options summary').first().click();await dialog.locator('[data-member-role]').first().selectOption('maternalAunt');await dialog.locator('.official-role-options summary').first().click();await dialog.locator('[data-role-blood]').first().check();
await p.screenshot({path:out+`/roles-${viewport.width}-${language}.png`,fullPage:true});
assert.equal(await dialog.locator('[data-detail=routine]').count(),0);assert.equal(await dialog.locator('[data-detail=firstMeeting]').count(),0);
await dialog.locator('.relationship-editor-actions [value=save]').click();await dialog.waitFor({state:'detached'});
await p.waitForFunction(()=>Object.values(game.state.relationships).length>0);const saved=await p.evaluate(()=>Object.values(game.state.relationships).find(r=>r.type==='가족'));assert(saved,JSON.stringify({errors,relationships:await p.evaluate(()=>game.state.relationships)}));assert.deepEqual(saved.details,{origin:'3'});assert.equal(saved.roleLinks[0].role,'maternalAunt');assert.equal(saved.roleLinks[0].blood,true);
await p.locator('[data-edit-rel]').first().evaluate(el=>el.click());await dialog.waitFor();assert.equal(await dialog.locator('[data-detail=origin]').inputValue(),'3');assert.equal(await dialog.locator('[data-member-role]').first().inputValue(),'maternalAunt');
await dialog.locator('input[name=cohabit]').check();assert(await dialog.locator('[name=cohabitHomeId]').isVisible());await dialog.locator('.relationship-editor-actions [value=cancel]').click();
assert.deepEqual(errors,[]);console.log('PASS family roles, one background, order, save/reopen, housing selector',viewport.width,language);await p.close();
}}finally{await browser.close();server.close()}
