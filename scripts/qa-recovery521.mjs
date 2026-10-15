import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=p==='/fixture.html'?Buffer.from('<html></html>'):await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={render,buildCharacterContactSchedule,notificationTopicsFor};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:414,height:896},serviceWorkers:'block'});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.photoQA);
 const raw=await page.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');const id=g.createCharacter();g.state.characters[id].name='돌아온 별이';await g.save(true);return (await import('/account-storage.js?v=20260909dev305')).accountStorage.getItem('drawer-village-game-v1')});
 await page.goto(origin+'/fixture.html');
 await page.evaluate(async raw=>{
  const {pack}=await import('/snapshot-codec.js');const {openSnapshotStore}=await import('/snapshot-store.js');
  for(const key of Object.keys(localStorage))if(/drawer-village-game-v1|last-nonempty|recovery-before-cloud|parallel-city-game|unreadable-primary/.test(key))localStorage.removeItem(key);
  const store=await openSnapshotStore(localStorage);const pointer=await store.put(raw);
  localStorage.setItem('drawer-village-game-v1','drawer-idb-snapshot-v1:missing521');
  localStorage.setItem('drawer-village-unreadable-primary-v1:1',pointer);
  localStorage.setItem('drawer-account:other:drawer-village-last-nonempty-state-v1',raw.replaceAll('돌아온 별이','다른 계정'));
  const before=JSON.stringify(Object.entries(localStorage).sort());
  const m=await import('/local-save-recovery.js');const found=await m.searchLocalRecovery();
  if(found.candidates.length!==1||found.candidates[0].names[0]!=='돌아온 별이'||found.report.missing!==1)throw Error('Search wrong scope/results');
  if(JSON.stringify(Object.entries(localStorage).sort())!==before)throw Error('Search mutated storage');
  localStorage.setItem('drawer-village-active-data-owner-v1','other');let denied=false;try{m.verifyRecoverySelection(localStorage,found,found.candidates[0])}catch{denied=true}if(!denied)throw Error('Account switch allowed');
  localStorage.setItem('drawer-village-active-data-owner-v1','guest');localStorage.setItem('drawer-village-game-v1','changed');denied=false;try{m.verifyRecoverySelection(localStorage,found,found.candidates[0])}catch{denied=true}if(!denied)throw Error('Stale save allowed');localStorage.setItem('drawer-village-game-v1','drawer-idb-snapshot-v1:missing521');
 },raw);
 await page.goto(origin+'/?native-preview=1');await page.waitForSelector('[data-find-local-saves]');
 await page.locator('[data-find-local-saves]').click();await page.waitForSelector('[data-restore-local-save]');
 assert.equal(await page.locator('[data-restore-local-save]').count(),1);assert(!(await page.locator('[data-local-save-results]').innerText()).includes('다른 계정'));
 await page.screenshot({path:'C:/Users/Public/drawer-releases/recovery521-found-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png',fullPage:true});
 await page.locator('[data-restore-local-save]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('drawer-village-game-v1')),'drawer-idb-snapshot-v1:missing521');
 await page.locator('[data-confirm-local-restore]').click();await page.waitForFunction(()=>window.photoQA);
 assert(await page.evaluate(async()=>Object.values((await import('/state.js?v=20260909dev305')).state.characters).some(c=>c.name==='돌아온 별이')));
 assert(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('drawer-village-unreadable-primary-v1:')&&localStorage.getItem(k)==='drawer-idb-snapshot-v1:missing521')));
 await page.goto(origin+'/fixture.html');
 await page.evaluate(async raw=>{
  const {searchLocalRecovery}=await import('/local-save-recovery.js');localStorage.setItem('drawer-village-active-data-owner-v1','signed');
  localStorage.setItem('drawer-account:signed:drawer-village-game-v1','drawer-idb-snapshot-v1:absent');
  localStorage.setItem('drawer-account:signed:drawer-village-unreadable-primary-v1:1',raw);
  localStorage.setItem('drawer-account:signed:drawer-village-unreadable-primary-v1:2','{broken');
  const result=await searchLocalRecovery();if(result.candidates.length!==1||result.report.invalid!==1||result.report.missing!==1)throw Error('Signed owner isolation failed');
  const failed=await searchLocalRecovery(localStorage,{open(){throw Error('unavailable')}});if(failed.report.unreadable!==1||failed.candidates.length!==1)throw Error('Read failure masked');
  localStorage.removeItem('drawer-account:signed:drawer-village-unreadable-primary-v1:1');const none=await searchLocalRecovery();if(none.candidates.length)throw Error('Adopted guest/foreign save');
 },raw);
 for(const language of ['ko','en','ja']){
  await page.evaluate(async language=>{document.body.replaceChildren();(await import('/boot-recovery.js')).mountStorageRecovery(document.body,language)},language);
  await page.locator('[data-find-local-saves]').click();await page.waitForFunction(()=>!document.querySelector('[data-find-local-saves]').disabled);
  assert.equal(await page.locator('[data-restore-local-save]').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('drawer-account:signed:drawer-village-game-v1')),'drawer-idb-snapshot-v1:absent');
 }
 console.log('PASS521 actual archived IDB recovery through boot UI/reload; read-only search; foreign/guest isolation; stale selection blocked; originals preserved; no-candidate KO/EN/JA; missing vs failed read');
}finally{await browser.close();server.close()}
