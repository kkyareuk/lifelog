import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));const b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity);
 const fixture=await p.evaluate(async()=>{
  window.g=await import('/state.js?v=20260909dev305');window.media=await import('/local-media.js?v=20260909dev305');window.storage=(await import('/account-storage.js?v=20260909dev305')).accountStorage;
  const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;canvas.getContext('2d').fillRect(0,0,2,2);window.photo=canvas.toDataURL();
  const ids=[g.createCharacter(),g.createCharacter()];for(const id of ids){g.state.characters[id].photo=await media.persistLocalImage(photo);g.state.characters[id].name='동명이인';}await g.save(true,false);
  window.backup={format:'drawer-village-backup',gameState:media.informationOnlyState(g.cloneState())};window.ids=ids;
  window.ParallelCity.switchAccount('restored-account');
  const existing=g.createCharacter();await g.save(true,false);window.existing=existing;
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());storage.setItem('drawer-village-guide-settings','1');window.DrawerVillageNavigation.go('settings');
  return {backup,ids,existing};
 });
 if(await p.locator('.drawer-title').count())await p.getByRole('button',{name:'탭하여 서랍 열기',exact:true}).click();
 await p.locator('[data-settings-pane=account]').click();
 const chooser=p.waitForEvent('filechooser');await p.locator('[data-import-file]').click();await (await chooser).setFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture.backup))});
 await p.waitForFunction(()=>ids.every(id=>g.state.characters[id]?.photo===photo));
 assert(await p.evaluate(()=>!!g.state.characters[existing]));console.log('PASS actual file picker restores both guest portraits and retains existing account character');
 await p.reload();await p.waitForFunction(()=>window.ParallelCity);
 const reload=await p.evaluate(async({ids,existing})=>{window.g=await import('/state.js?v=20260909dev305');window.ParallelCity.switchAccount('restored-account');const m=await import('/local-media.js?v=20260909dev305');await m.initializeLocalMediaState(g.state);return {images:ids.map(id=>g.state.characters[id]?.photo?.startsWith('data:image/')),existing:!!g.state.characters[existing]}},fixture);
 assert.deepEqual(reload,{images:[true,true],existing:true});console.log('PASS saved restore survives reload with IndexedDB photos');
 const checks=await p.evaluate(async()=>{
  const {prepareBackupRestore}=await import('/backup-restore.js');const m=await import('/local-media.js?v=20260909dev305');const s=(await import('/account-storage.js?v=20260909dev305')).accountStorage;
  const guest=JSON.parse(s.getGuestSnapshot('drawer-village-game-v1')),id=Object.keys(guest.characters)[0];const original='data:image/png;base64,aGVsbG8=';
  const embedded=await prepareBackupRestore({characters:{[id]:{id,photo:original}}},{characters:{}},s);
  const unrelated=await prepareBackupRestore({characters:{other:{id:'other',name:'동명이인',photo:''}}},{characters:{}},s);
  const missing=await prepareBackupRestore({characters:{missing:{id:'missing',photo:'local-media://missing'}}},{characters:{}},s);
  let blocked=false;try{s.getGuestSnapshot('drawer-account:other:drawer-village-game-v1')}catch{blocked=true}
  return {embedded:embedded.imported.characters[id].photo===original,unrelated:unrelated.imported.characters.other.photo==='',missing:missing.media.pending,blocked};
 });
 assert.deepEqual(checks,{embedded:true,unrelated:true,missing:1,blocked:true});assert.deepEqual(errors,[]);
 console.log('PASS embedded photos kept, same-name/different-ID excluded, missing originals reported, other-account reads blocked');
}finally{await browser.close();server.closeAllConnections();server.close()}


