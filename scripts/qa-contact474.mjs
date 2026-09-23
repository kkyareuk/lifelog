import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openSettingsPane,openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageGroups={getSnapshot:()=>({activeGroupId:'g',group:{name:'밤의 마을'},residents:[{id:'other',ownerUid:'them',name:'에테르날리스',icon:'/assets/home-ui/profile-placeholder.png'}]})};g.state.characterNotificationSettings.characterIds=['group:g:other'];g.state.characterNotificationSettings.explicitSelection=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());photoQA.openSettingsPane('notifications');});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));
 const box=p.locator('[data-character-notification-character="group:g:other"]');await box.uncheck();
 assert.equal(await p.evaluate(()=>g.state.characterNotificationSettings.characterIds.length),0);
 await box.check();assert((await p.evaluate(()=>g.state.characterNotificationSettings.characterIds)).includes('group:g:other'));
 assert(await p.getByText('밤의 마을',{exact:true}).isVisible());
 const image=await p.locator('.notification-character-option img').last().boundingBox();assert.equal(image.width,image.height);
 await p.screenshot({path:'tmp/notifications474.png'});
 assert.deepEqual(errors,[]);console.log('PASS474 360px other-owner notification select/deselect, affiliation and square portraits');
}finally{await browser.close();server.closeAllConnections();server.close()}
