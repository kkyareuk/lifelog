import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:880},serviceWorkers:'block'}),errors=[];p.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('dialog',async d=>{errors.push(d.message());await d.dismiss()});
 p.setDefaultTimeout(10000);await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);

 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.v=await import('/views.js?v=20260909dev305');const id=g.createCharacter();g.state.activeId=id;g.state.activeHomeId=g.state.characters[id].homeId;g.state.activeTab='home';g.state.homeEditMode=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home')});
 await p.waitForTimeout(1500);
 await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});

 await p.evaluate(()=>{g.state.homeEditMode=false;window.DrawerVillageNavigation.go('home')});
 await p.waitForTimeout(350);await p.screenshot({path:'tmp/home469.png'});
 const roomBounds=await p.locator('.room[data-room-key]').evaluateAll(rooms=>rooms.map(r=>({key:r.dataset.roomKey,x:r.getBoundingClientRect().x,right:r.getBoundingClientRect().right})));
 assert(roomBounds.some(r=>r.right>320),JSON.stringify(roomBounds));
 await p.evaluate(()=>{window.qaSnapshot={activeGroupId:'g',selectedTownId:'t',selectedResidentId:'',groups:[{id:'g',name:'사진 마을',photoURL:'world-assets/owner-forest-town.webp',towns:[{id:'t',name:'새 마을1',bg:'world-assets/owner-forest-town.webp'}]}],group:{id:'g',name:'사진 마을',ownerUid:'me',buildingRevision:0,towns:[{...g.state.world,id:'t',name:'새 마을1',bg:'world-assets/owner-forest-town.webp'}]},members:[{uid:'me',role:'owner'}],residents:[],homes:[],loadedCollections:['group','residents','homes'],incomingProposals:[],outgoingProposals:[]};window.DrawerVillageGroups={getSnapshot:()=>qaSnapshot,setDetailActive(){},select(){},selectResident(){},visitHome(){},selectTown(){}};window.ParallelCityAuth.getInfo=()=>({ready:true,user:{uid:'me'},guideState:{loaded:true,seen:['observe','home','character','town']}});window.DrawerVillageNavigation.go('observe');window.dispatchEvent(new Event('drawer-village-groups'));});
 await p.waitForTimeout(300);await p.screenshot({path:'tmp/empty-town469.png'});
 const title=await p.locator('.game-hud-empty-top>div').first().boundingBox(),head=await p.locator('.game-hud-empty-top').boundingBox();assert(title.y+title.height<=head.y+head.height,JSON.stringify({title,head}));
 await p.evaluate(()=>window.DrawerVillageNavigation.go('character'));await p.waitForTimeout(300);await p.screenshot({path:'tmp/empty-character469.png'});assert.equal(await p.locator('.empty-registration img').count(),0);
 console.log('PASS new home full width, empty title within header, shared character empty layout');

}finally{await browser.close();server.closeAllConnections();server.close()}
