import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.money=await import('/character-money-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');const a=g.createCharacter(),b=g.createCharacter();g.state.characters[a].name='가람';g.state.characters[b].name='나래';window.ids=[a,b];g.state.activeId=a;window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());money.openCharacterMoney('settings',a)});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));

 for(const [index,value] of [[0,'50000'],[1,'150000']]){
  if(index)await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());money.openCharacterMoney('settings',ids[1]);});
  await p.getByRole('spinbutton',{name:'이 캐릭터의 재산 금액',exact:true}).fill(value);
  p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'재산 금액 적용',exact:true}).click();
  await p.waitForFunction(([i,n])=>g.state.characters[ids[i]].wallet.balance===n,[index,Number(value)]);
 }
 await p.screenshot({path:'tmp/money501-360.png'});
 const ids=await p.evaluate(()=>window.ids);await p.reload();await p.waitForFunction(()=>window.photoQA);
 assert.deepEqual(await p.evaluate(async ids=>{const g=await import('/state.js?v=20260909dev305');return ids.map(id=>g.state.characters[id].wallet.balance)},ids),[50000,150000]);
 await p.evaluate(async()=>{const {accountStorage}=await import('/account-storage.js?v=20260909dev305');accountStorage.copySnapshotBackup('drawer-village-game-v1','drawer-village-last-nonempty-state-v1');localStorage.setItem('drawer-village-game-v1','drawer-idb-snapshot-v1:missing-fixture');});
 await p.reload();await p.waitForFunction(()=>window.photoQA);
 assert.deepEqual(await p.evaluate(async ids=>{const g=await import('/state.js?v=20260909dev305');return ids.map(id=>g.state.characters[id].wallet.balance)},ids),[50000,150000]);
 assert.deepEqual(errors,[]);console.log('PASS501 independent A 50,000 / B 150,000 balances and full reload');
}finally{await browser.close();server.close()}
