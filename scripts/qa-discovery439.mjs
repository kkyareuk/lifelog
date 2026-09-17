import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-feedback433');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;window.qaBindCharacterSwipe=bindNativeObserveCharacterSwipe;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.addInitScript(()=>{window.qaSounds=[];HTMLMediaElement.prototype.play=function(){window.qaSounds.push(this.src);return Promise.resolve()}});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});page.on('pageerror',e=>console.error('PAGE ERROR',e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const a=g.createCharacter(),b=g.createCharacter();window.qaIds=[a,b];g.state.characters[a].name='A';g.state.characters[b].name='B';g.setActive(a);document.documentElement.classList.add('native-app');window.DrawerVillageNavigation.go('observe');qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await page.waitForTimeout(700);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.locator('.discovery-rail-button').click();await page.locator('.character-discovery-dialog[open]').waitFor();
 await page.getByRole('button',{name:'지금은 넘기기',exact:true}).click();
 for(const language of ['ko','en','ja']){
  await page.evaluate(language=>{g.state.uiLanguage=language;g.setActive(qaIds[1]);qaRender();document.querySelectorAll('dialog[open]').forEach(d=>d.close())},language);
  await page.waitForTimeout(80);assert(await page.locator('.discovery-rail-button').isDisabled());
  const title=await page.locator('.discovery-rail-button').getAttribute('title');assert(title.includes(language==='ko'?'계정 전체':language==='en'?'your account':'アカウント全体'),title);
 }
 console.log('PASS439 discovery opens, skip closes, second character shares remaining account cooldown in KO/EN/JA');
}finally{await browser.close();server.closeAllConnections();server.close()}
