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
 const p=await browser.newPage({viewport:{width:384,height:745},serviceWorkers:'block'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.money=await import('/character-money-ui.js');const id=g.createCharacter();g.state.activeId=id;g.state.activeHomeId=g.state.characters[id].homeId;g.state.activeTab='observe';window.DrawerVillageNavigation.go('observe')});
 await p.waitForTimeout(1000);await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await p.locator('.character-money-shortcuts img').first().evaluate(i=>i.decode());
 assert.equal(await p.locator('.character-money-shortcuts img').count(),2);
 assert.equal(await p.locator('[data-character-balance]').count(),0);
 for(const [lang,label] of [['ko','준비 중입니다.'],['en','Coming soon.'],['ja','準備中です。']]){
  for(const pane of ['wallet','work']){
   const unchanged=await p.evaluate(({lang,pane})=>{g.state.uiLanguage=lang;const before=JSON.stringify(g.state.characters);money.openCharacterMoney(pane);return before===JSON.stringify(g.state.characters)},{lang,pane});
   assert(unchanged);assert.equal(await p.locator('dialog[open] p').textContent(),label);
   await p.locator('dialog[open] button').click();
  }
 }
 await p.evaluate(()=>{g.state.uiLanguage='ko';window.DRAWER_VILLAGE_ECONOMY_ENABLED=true;window.DrawerVillageNavigation.go('observe')});
 await p.waitForTimeout(300);assert.equal(await p.locator('[data-character-balance]').count(),1);
 await p.locator('[data-open-game-hud-roster]').click();
 const hits=await p.evaluate(()=>{const drawer=document.querySelector('.game-hud-roster-drawer'),dr=drawer.getBoundingClientRect();return [...document.querySelectorAll('.character-money-shortcuts button,[data-character-balance]')].map(el=>{const b=el.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;return {overlap:x>dr.left&&x<dr.right&&y>dr.top&&y<dr.bottom,topIsDrawer:drawer.contains(document.elementFromPoint(x,y))}})});
 assert(hits.some(h=>h.overlap));assert(hits.filter(h=>h.overlap).every(h=>h.topIsDrawer),JSON.stringify(hits));
 await p.screenshot({path:'tmp/money-roster471.png'});
 await p.locator('[data-open-game-hud-roster]').click();await p.locator('.character-money-shortcuts button').first().click();assert(await p.locator('[data-money-screen="wallet"]').isVisible());await p.locator('dialog[open] header button').click();
 const sounds=await p.evaluate(async()=>{const m=await import('/cooking-audio.js'),created=[];const RealAudio=window.Audio;
  window.Audio=class{constructor(src){this.src=src;created.push(this)}play(){return Promise.resolve()}pause(){this.paused=true}removeAttribute(){this.src=''}load(){this.unloaded=true}};
  try{localStorage.removeItem('drawer-village-web-audio');m.playCookingSound(['cut','재료를 썬다'],0,{soundMuted:false,soundEffectsVolume:45});m.playCookingSound(['cut','재료를 썬다'],0,{soundMuted:false,soundEffectsVolume:20});const reused=created.length===1&&created[0].volume===.2;m.playCookingSound(['cut','재료를 썬다'],1,{soundMuted:false,soundEffectsVolume:45});const retired=created[0].paused&&created[0].unloaded;const short=created[1].src.endsWith('chop-short.mp3');localStorage.setItem('drawer-village-web-audio',JSON.stringify({soundMuted:true}));m.playCookingSound(['cut','재료를 썬다'],1,{soundMuted:true,soundEffectsVolume:45});return {reused,retired,short,muted:created[1].paused&&created[1].unloaded};}finally{m.stopCookingSound();window.Audio=RealAudio}});
 assert(Object.values(sounds).every(Boolean),JSON.stringify(sounds));
 assert.deepEqual(errors,[]);console.log('PASS public wallet/work KO/EN/JA without mutations; internal functionality; roster hit order; character images; chopping playback, reuse, retirement and mute');
}finally{await browser.close();server.closeAllConnections();server.close()}
