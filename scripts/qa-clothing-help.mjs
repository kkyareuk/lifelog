import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openClothingEditor,render,setNavigationTabIntent};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:393,height:873},serviceWorkers:'block'}),errors=[];p.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('dialog',async d=>{errors.push(d.message());await d.dismiss()});
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.getByRole('button',{name:'게스트',exact:true}).click();
 await p.getByRole('button',{name:'안내 그만 보기',exact:true}).click();
 await p.evaluate(async()=>{localStorage.setItem('drawer-village-first-setup-v2','done');localStorage.setItem('drawer-village-onboarding-v2','done');window.g=await import('/state.js?v=20260909dev305');window.id=g.createCharacter();g.state.activeId=id;document.querySelectorAll('dialog[open]').forEach(d=>d.close());});

 for(const language of ['ko','en','ja']){
  await p.evaluate(lang=>{g.state.uiLanguage=lang;photoQA.openClothingEditor()},language);
  const d=p.locator('.clothing-editor-dialog'),buttons=d.locator('[data-clothing-help]');
  assert.equal(await buttons.count(),3);
  const before=await p.evaluate(()=>JSON.stringify(g.state.catalog.fashion));
  await buttons.nth(2).click();
  assert.equal(await buttons.nth(2).getAttribute('aria-expanded'),'true');
  assert(await d.locator('#clothing-help-mood').isVisible());
  const panel=await d.locator('#clothing-help-mood').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=394);
  await buttons.nth(2).press('Escape');assert(await d.isVisible());assert.equal(await buttons.nth(2).getAttribute('aria-expanded'),'false');
  await buttons.nth(1).click();await d.locator('#clothing-help-occasion [data-clothing-help-close]').click();
  assert(await buttons.nth(1).evaluate(e=>e===document.activeElement));
  await buttons.nth(0).click();await d.locator('.clothing-layout-grid legend').first().click();assert.equal(await buttons.nth(0).getAttribute('aria-expanded'),'false');
  assert.equal(await p.evaluate(()=>JSON.stringify(g.state.catalog.fashion)),before);
  await buttons.nth(2).click();
  await p.screenshot({path:'C:/Users/Public/drawer-releases/clothing-help530-'+language+(process.argv.includes('--webkit')?'-webkit':'')+'.png'});
  await p.evaluate(()=>document.querySelector('.clothing-editor-dialog').close());
  await p.waitForFunction(()=>!document.querySelector('.clothing-editor-dialog'));
 }
 assert.deepEqual(errors,[]);console.log('PASS three languages, open/close/Escape/focus/outside click, no data mutation, mobile bounds');
}finally{await browser.close();server.closeAllConnections();server.close()}
