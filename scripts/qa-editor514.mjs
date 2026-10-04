import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(process.argv.includes('--baseline')&&['/home-editor-position.js','/home-editor-position.css'].includes(p))b=execFileSync('git',['show','ecea001a:'+p.slice(1)]);if(p==='/views.js')b=Buffer.from(b.toString()+'\nexport {dailyLogItems};');if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:689},serviceWorkers:'block'}),errors=[];p.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('dialog',async d=>{errors.push(d.message());await d.dismiss()});
 p.setDefaultTimeout(10000);await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.addInitScript(()=>localStorage.setItem('drawer-village-home-tour-v3','done'));await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);

 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.v=await import('/views.js?v=20260909dev305');const id=g.createCharacter();g.state.activeId=id;g.state.activeHomeId=g.state.characters[id].homeId;g.state.activeTab='home';g.state.homeEditMode=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home')});
 await p.waitForTimeout(1500);
 await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});



 for(const [width,height,banner] of [[360,689,false],[360,689,true],[384,768,true],[360,420,false]]){
  await p.setViewportSize({width,height});
  await p.evaluate(banner=>{document.documentElement.classList.toggle('has-game-banner',banner);document.documentElement.style.setProperty('--game-ad-height','50px');document.documentElement.style.setProperty('--game-viewport-height',(innerHeight-50)+'px');document.querySelector('.home-editor-dock').style.setProperty('--editor-safe-top','44px');dispatchEvent(new Event('resize'))},banner);
  await p.getByRole('button',{name:'보기',exact:true}).click();
  for(let i=0;i<2;i++){
   await p.locator('[data-home-tools-position]').click();
   const rect=await p.locator('.home-editor-dock').evaluate(el=>{const r=el.getBoundingClientRect(),button=el.querySelector('[data-home-tools-add]'),b=button.getBoundingClientRect();return {top:r.top,bottom:r.bottom,headerBottom:Math.max(...[...document.querySelectorAll('.home-native-header,.home-native-header .home-native-back')].map(n=>n.getBoundingClientRect().bottom)),height:innerHeight,hit:button.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2))}});
   assert(rect.top>=Math.max(44,rect.headerBottom)&&rect.bottom<=height&&rect.hit,JSON.stringify({width,height,banner,rect}));
  }
  await p.locator('[data-home-tools-add]').click();await p.locator('[data-home-add-furniture]').first().click();
  assert(await p.locator('[data-furniture-placement]').count()>0);
  assert.equal(await p.locator('dialog[open]').count(),0);
 }
 await p.setViewportSize({width:360,height:689});
 await p.getByRole('button',{name:'보기',exact:true}).click();await p.locator('[data-home-tools-position]').click();
 await p.screenshot({path:'tmp/editor514-fixed.png'});
 await p.evaluate(async()=>{const v=await import('/views.js?v=20260909dev305'),c=g.state.characters[g.state.activeId],d=document.createElement('dialog');d.className='life-log';d.innerHTML='<ol>'+v.dailyLogItems([{minute:874.45433333335,time:'14:34.45433333335',title:'씻는 중',desc:'몸을 씻고 청결을 되찾고 있어요.'},{minute:874.71833333,time:'14:34.71833333',title:'다른 방에서 잠시 쉬는 중',desc:'다른 방에서 쉬고 있어요.'}],c)+'</ol><form method="dialog"><button>닫기</button></form>';document.body.append(d);d.showModal()});
 const times=await p.locator('dialog[open] time').allTextContents();assert.deepEqual(times,['14:34','14:34']);
 const overlap=await p.locator('dialog[open] li').evaluateAll(rows=>rows.some(row=>{const t=row.querySelector('time').getBoundingClientRect(),body=row.querySelector('.log-entry-body').getBoundingClientRect();return t.right>body.left}));assert(!overlap);
 await p.screenshot({path:'tmp/log514-fixed.png'});
 assert.deepEqual(errors,[]);console.log('PASS top/bottom dock hit targets with banner, 44px safe inset, 360/384px and small viewport; furniture add; fractional logs retain both entries without overlap');
}finally{await browser.close();server.closeAllConnections();server.close()}
