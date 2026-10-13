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
 const result=await page.evaluate(async()=>{
  const g=await import('/state.js?v=20260909dev305');window.g=g;
  const a=g.createCharacter(),b=g.createCharacter();g.state.characters[a].name='알림A';g.state.characters[b].name='알림B';
  Object.assign(g.state.characterNotificationSettings,{characterIds:[a,b],contentKinds:['questions','relationships'],timesPerDay:6,scheduleEnds:false,recentSignatures:[]});
  const items=photoQA.buildCharacterContactSchedule(new Date(2026,9,13,8));
  if(!items.length||items.some(n=>!['question','moment'].includes(n.extra.mode)||(n.extra.mode==='moment'&&n.extra.topic!=='relationships')))throw Error('Disabled notification category generated');
  g.state.characterNotificationSettings.contentKinds=[];if(photoQA.buildCharacterContactSchedule(new Date(2026,9,13,8)).length)throw Error('Empty categories generate messages');
  const main='drawer-village-game-v1';await g.save(true);const {accountStorage}=await import('/account-storage.js?v=20260909dev305');const raw=accountStorage.getItem(main);if(!raw)throw Error('No fixture');
  window.backup517=raw;return {raw,notifications:items.length};
 });
 // A committed IndexedDB snapshot must survive one transient WebKit-style read failure.
 await page.goto(origin+'/fixture.html');await page.evaluate(async raw=>{const {openSnapshotStore}=await import('/snapshot-store.js');const store=await openSnapshotStore(localStorage);localStorage.setItem('drawer-village-game-v1',await store.put(raw));localStorage.removeItem('drawer-village-last-nonempty-state-v1');},result.raw);
 await page.addInitScript(()=>{const get=IDBObjectStore.prototype.get;let failed=false;IDBObjectStore.prototype.get=function(...args){if(this.name==='snapshots'&&!failed){failed=true;throw new DOMException('Resuming storage','UnknownError')}return get.apply(this,args)}});
 await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.photoQA);assert(await page.evaluate(async()=>Object.keys((await import('/state.js?v=20260909dev305')).state.characters).length>=2));
 // A truly absent snapshot is retained; a user-selected valid backup can restore startup.
 await page.goto(origin+'/fixture.html');await page.evaluate(()=>{localStorage.setItem('drawer-village-game-v1','drawer-idb-snapshot-v1:missing517');localStorage.removeItem('drawer-village-last-nonempty-state-v1');localStorage.removeItem('drawer-village-recovery-before-cloud');});
 await page.goto(origin+'/?native-preview=1');await page.waitForSelector('[data-boot-recovery] button');
 assert.equal(await page.evaluate(()=>localStorage.getItem('drawer-village-game-v1')),'drawer-idb-snapshot-v1:missing517');
 await page.screenshot({path:'C:/Users/Public/drawer-releases/recovery517-'+(process.argv.includes('--webkit')?'webkit':'chrome')+'.png'});
 const chooser=page.waitForEvent('filechooser');await page.locator('[data-boot-recovery] button').click();await (await chooser).setFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(result.raw)});
 await page.waitForFunction(()=>window.photoQA);assert(await page.evaluate(async()=>Object.keys((await import('/state.js?v=20260909dev305')).state.characters).length>=2));
 assert(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('drawer-village-unreadable-primary-v1:')&&localStorage.getItem(k)==='drawer-idb-snapshot-v1:missing517')));
 console.log('PASS517 notifications '+result.notifications+': selected-only and none; transient IndexedDB retry; missing save preserved; actual backup picker restores boot');
}finally{await browser.close();server.close()}



