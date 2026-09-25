import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{if(req.url==='/qa-empty497'){res.setHeader('Content-Type','text/html');res.end('<main></main>');return;}const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));

try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'});
 await p.goto(origin+'/qa-empty497');
 await p.setContent('<main id="fixture"></main>');
 await p.evaluate(async()=>{
  window.DRAWER_VILLAGE_ECONOMY_ENABLED=true;window.DRAWER_VILLAGE_BUILDING_INTERIORS_ENABLED=false;
  window.g=await import('/state.js?v=20260909dev305');g.state.activeId=g.createCharacter();
  window.hid=g.state.characters[g.state.activeId].homeId;
  g.state.world.places.push({id:'cafe497',name:'Cafe',type:'카페'});
  const {installContextMenu}=await import('/context-menu.js');
  installContextMenu({world:()=>({state:g.state,groupId:'',uid:''}),execute:()=>true,enabled:()=>true,openHome:()=>window.enteredHome=true,openPlace:()=>window.enteredPlace=true});
  document.querySelector('#fixture').innerHTML='<button data-place="cafe497">Cafe</button><button data-home-map="'+hid+'">Home</button>';
 });
 await p.locator('[data-place=cafe497]').click();assert.equal(await p.locator('[data-enter-place]').count(),0);await p.locator('.context-action-menu').evaluate(d=>{d.close();d.remove()});
 assert.equal(await p.evaluate(async()=>{const {openBuildingInterior}=await import('/building-interior.js');return openBuildingInterior('cafe497')===null}),true);
 await p.locator('[data-home-map]').click();await p.locator('[data-enter-home]').click();assert.equal(await p.evaluate(()=>window.enteredHome),true);
 assert.equal(await p.evaluate(async()=>{const {economyAvailable}=await import('/economy-access.js');return economyAvailable()}),true);
 await p.evaluate(()=>window.DRAWER_VILLAGE_BUILDING_INTERIORS_ENABLED=true);
 await p.locator('[data-place=cafe497]').click();assert.equal(await p.locator('[data-enter-place]').count(),1);
 console.log('PASS public building menu/direct entry disabled; homes and economy available; internal building menu retained');
}finally{await browser.close();server.closeAllConnections();server.close()}
