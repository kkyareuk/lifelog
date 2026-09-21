import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:393,height:873},serviceWorkers:'block'}),errors=[];p.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('dialog',async d=>{errors.push(d.message());await d.dismiss()});
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 const photo=await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.id=g.createCharacter();window.hid=g.state.characters[id].homeId;window.roomKey=Object.keys(g.state.homes[hid].rooms)[0];document.querySelectorAll('dialog[open]').forEach(d=>d.close());const c=document.createElement('canvas');c.width=64;c.height=48;c.getContext('2d').fillRect(0,0,64,48);return c.toDataURL().split(',')[1]});
 const file={name:'home.png',mimeType:'image/png',buffer:Buffer.from(photo,'base64')};
 await p.evaluate(()=>photoQA.openBuildingShapeDialog(hid,'home'));
 await p.locator('.building-photo-choice input').setInputFiles(file);await p.waitForFunction(()=>g.state.homes[hid].exteriorImage?.startsWith('data:image/'));
 console.log('PASS personal house exterior upload');
 await p.evaluate(()=>photoQA.openRoomEditor(hid,roomKey));const surface=p.locator('[data-room-surface-picker=floorMaterial]');const modern=await surface.count();if(modern)await surface.click();const floorButton=modern?p.getByRole('button',{name:'바닥 이미지 첨부',exact:true}):p.locator('[data-edit-room-floor]');if(process.argv.includes('--webkit')){await floorButton.click();await p.locator('[data-drawer-image-picker]').setInputFiles(file)}else{const choose=p.waitForEvent('filechooser');await floorButton.click();await (await choose).setFiles(file)}await p.waitForFunction(()=>g.state.homes[hid].rooms[roomKey].floorImage?.startsWith('data:image/'));
 console.log('PASS personal full-room image upload');
 const saved=await p.evaluate(()=>({hid,roomKey}));await p.reload();await p.waitForFunction(()=>window.photoQA);
 assert(await p.evaluate(async({hid,roomKey})=>{window.g=await import('/state.js?v=20260909dev305');window.hid=hid;window.roomKey=roomKey;await (await import('/local-media.js?v=20260909dev305')).initializeLocalMediaState(g.state);return [g.state.homes[hid].exteriorImage,g.state.homes[hid].rooms[roomKey].floorImage].every(v=>v.startsWith('data:image/'))},saved));
 console.log('PASS personal exterior and interior survive saved reload');
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.fixtureUid='me';window.ParallelCityAuth.getInfo=()=>({ready:true,user:{uid:fixtureUid}});window.snap={activeGroupId:'group',group:{id:'group',ownerUid:'host',towns:[{id:'town',name:'Town',places:[]}]},homes:[{id:'shared',ownerUid:'host',townId:'town',layoutRevision:0,layoutJson:JSON.stringify(g.state.homes[hid])}],residents:[{id:'resident',name:'Resident',ownerUid:'me',sharedHomeId:'shared',profileJson:'{}'}],members:[{uid:'me',role:'member'}],loadedCollections:['group','homes','residents']};window.uploads=0;window.savedLayouts=[];window.DrawerVillageGroups={getSnapshot:()=>snap,uploadHomeMemberImage:async()=>{uploads++;return location.origin+'/assets/home-ui/home.png'},saveHomeLayout:async input=>{savedLayouts.push(input);return {revision:input.revision+1}}};window.photoPatch=null;photoQA.openBuildingShapeDialog(hid,'home',async patch=>{photoPatch=patch;return true})});
 await p.locator('.building-photo-choice input').setInputFiles(file);await p.waitForFunction(()=>window.photoPatch?.exteriorImage);assert.equal(await p.evaluate(()=>uploads),1);console.log('PASS shared house exterior reaches uploader and save callback');
 await p.evaluate(async()=>{const {bindSharedHome}=await import('/shared-home-editor.js?v=20260909dev305');window.sharedRoot=document.createElement('section');sharedRoot.innerHTML='<button data-room-info-edit="'+roomKey+'">Edit room</button>';document.body.append(sharedRoot);bindSharedHome(sharedRoot,snap,()=>{},()=>{},null,...(bindSharedHome.length<=5?[null,photoQA.cropImage]:[photoQA.cropImage]))});
 await p.evaluate(()=>sharedRoot.querySelector('button').click());await p.locator('[data-shared-room-photo=floorImage]').setInputFiles(file);await p.waitForFunction(()=>savedLayouts.length>0);
 const layout=await p.evaluate(()=>savedLayouts.at(-1));assert.equal(layout.id,'shared');assert(layout.layout.rooms[saved.roomKey].floorImage.endsWith('/assets/home-ui/home.png'));assert.equal(layout.layout.rooms[saved.roomKey].usePhoto,true);
 await p.locator('[data-shared-room-photo=image]').setInputFiles(file);await p.locator('.crop-dialog button[value=apply]').click();await p.waitForFunction(()=>savedLayouts.length===2);console.log('PASS shared full-room and room photos use cloud URLs and revisioned layout save');
 await p.evaluate(()=>{window.before=savedLayouts.length;fixtureUid='other'});await p.locator('[data-shared-room-photo=floorImage]').setInputFiles(file);await p.waitForFunction(()=>!document.querySelector('[data-shared-room-photo=floorImage]').disabled);assert.equal(await p.evaluate(()=>savedLayouts.length),2);assert.equal(await p.evaluate(()=>uploads),3);console.log('PASS account switch cancels upload/save');
 const limit=await p.evaluate(()=>{g.state.catalog={food:[],drink:[]};for(let i=0;i<100;i++){if(!g.addCatalogItem(i%2?'food':'drink',{name:'item'+i}))return false;}return !g.addCatalogItem('food',{name:'overflow'});});assert(limit);console.log('PASS personal catalog total 100/101 across categories');
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();server.close()}





