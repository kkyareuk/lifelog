import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-surface438');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 const result=await page.evaluate(async()=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  const {counterArt}=await import('/counter-art.js'),{furnitureSprite}=await import('/furniture-sprites.js'),{positionWorktopUsers}=await import('/worktop-users.js');
  const box=document.createElement('div');box.style.cssText='position:relative;width:600px;height:500px';document.body.append(box);const caps=[];
  for(const span of [1,3,6]){
   const sprite=furnitureSprite({item:'카운터',counterSpan:span});box.innerHTML=`<div style="width:${120*span}px;--sprite-ratio:${sprite.width/sprite.height}">${counterArt(sprite,span)}</div>`;
   await Promise.all([...box.querySelectorAll('img')].map(i=>i.decode()));
   caps.push([...box.querySelectorAll('.counter-slice')].map(e=>e.getBoundingClientRect().width));
  }
  box.innerHTML='<div data-furniture-placement="counter" data-furniture-kind="counter" style="position:absolute;left:100px;top:50px;width:150px;height:180px"><div class="room-furniture-art" style="width:150px;height:180px"></div></div><div data-furniture-placement="hob" data-furniture-kind="induction" data-surface-id="counter" style="position:absolute;left:140px;top:75px;width:70px;height:55px"></div><div class="home-person" data-using-furniture="hob" style="position:absolute;left:30%;top:20%;width:50px;height:60px"><span class="home-person-visual" style="display:block;width:50px;height:60px;animation:none"></span></div>';
  const visual=box.querySelector('.home-person-visual'),before=visual.getBoundingClientRect().bottom;
  positionWorktopUsers(box);const after=visual.getBoundingClientRect().bottom;positionWorktopUsers(box);const second=visual.getBoundingClientRect().bottom;
  const base=box.querySelector('[data-furniture-placement="counter"]').getBoundingClientRect().bottom;
  box.remove();return {caps,lowered:after-before,front:after-base,stable:Math.abs(after-second)};
 });
 for(const cap of result.caps){assert(Math.abs(cap[0]-result.caps[0][0])<1);assert(Math.abs(cap[2]-result.caps[0][2])<1)}assert(result.caps[2][1]>result.caps[1][1]);assert(result.lowered>50);assert(result.front>=0);assert(result.stable<1);console.log(JSON.stringify(result));
 await page.evaluate(async()=>{const {counterArt}=await import('/counter-art.js'),{furnitureSprite}=await import('/furniture-sprites.js');const gallery=document.createElement('div');gallery.style.cssText='position:fixed;inset:0;z-index:999999;background:white;overflow:auto;padding:20px;box-sizing:border-box';gallery.innerHTML=[1,2,3].map(span=>{const sprite=furnitureSprite({item:'카운터',counterSpan:span});return `<p style="color:black">길이 ${span}</p><div style="width:${90*span}px;--sprite-ratio:${sprite.width/sprite.height}">${counterArt(sprite,span)}</div>`}).join('');document.body.append(gallery);await Promise.all([...gallery.querySelectorAll('img')].map(i=>i.decode()))});
 await page.screenshot({path:out+'/counter-slices.png'});

}finally{await browser.close();server.closeAllConnections();server.close()}
