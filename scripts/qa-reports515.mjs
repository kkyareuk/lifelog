import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(process.argv.includes('--baseline')&&p==='/character-discovery.js')b=execFileSync('git',['show','5661fa34:character-discovery.js']);if(p==='/discovery-access.js')b=Buffer.from(b.toString().replace('export async function consumeDiscoveryAccess(', 'async function realConsumeDiscoveryAccess(')+'\nexport async function consumeDiscoveryAccess(...args){window.qaRequestCount=(window.qaRequestCount||0)+1;await new Promise((resolve,reject)=>{window.qaResolve=resolve;window.qaReject=reject});return realConsumeDiscoveryAccess(...args)}');if(p==='/views.js')b=Buffer.from(b.toString()+'\nexport {dailyLogItems};');if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openDailyCharacterQuestion,openContactMail,ensureDailyQuestionSchedule,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:390,height:741},serviceWorkers:'block'});p.setDefaultTimeout(7000);const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.addInitScript(()=>localStorage.setItem('drawer-village-home-tour-v3','done'));await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.a=g.createCharacter();window.b=g.createCharacter();g.state.activeId=a;document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('mailbox')});
 await p.waitForTimeout(1500);await p.evaluate(()=>{document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
 await p.locator('[data-mail-folder="inbox"]').click();await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await p.locator('[data-open-daily-question]').click();await p.locator('.character-question-dialog[open]').waitFor();
 await p.evaluate(()=>document.querySelector('.character-question-dialog[open]').close());
 await p.locator('[data-open-contact-mail]').first().click();await p.locator('.character-question-dialog[open]').waitFor();
 await p.evaluate(()=>document.querySelector('.character-question-dialog[open]').close());
 for(const kind of ['everyday','weekend','work','gift'])for(const language of ['ko','en','ja']){
  await p.evaluate(({kind,language})=>{g.state.uiLanguage=language;photoQA.openDailyCharacterQuestion({day:'2026-10-05',characterId:a,targetId:b,kind})},{kind,language});
  await p.locator('.character-question-dialog[open]').waitFor();assert(await p.locator('[data-character-question-option]').count()>0);
  await p.evaluate(()=>document.querySelector('.character-question-dialog[open]').close());
 }
 console.log('PASS guest letter open/reopen and all question kinds in KO/EN/JA');
 await p.evaluate(()=>{g.state.uiLanguage='ko';g.setActive(a);g.state.characters[a].name='Original';window.DrawerVillageNavigation.go('observe');photoQA.render()});
 await p.waitForTimeout(500);await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await p.locator('.discovery-rail-button').click();await p.waitForFunction(()=>window.qaResolve);
 await p.evaluate(()=>{window.qaReject(new Error('offline'));window.qaResolve=null});
 if(!process.argv.includes('--baseline'))await p.locator('.character-discovery-dialog[open]').getByRole('button',{name:'닫기',exact:true}).click();
 await p.waitForFunction(()=>!document.querySelector('.character-discovery-dialog[open]'));assert(await p.locator('.discovery-rail-button').isEnabled(),'failed request must allow retry');
 await p.locator('.discovery-rail-button').click();await p.waitForFunction(()=>window.qaResolve);
 if(!process.argv.includes('--baseline'))assert.equal(await p.locator('.character-discovery-dialog[open][aria-busy="true"]').count(),1,'request must immediately reserve a modal');
 await p.keyboard.press('Escape');if(!process.argv.includes('--baseline'))assert.equal(await p.locator('.character-discovery-dialog[open]').count(),1,'Escape must not silently consume a request');
 // A programmatic render/character switch during the delayed request must not lose its original target.
 await p.evaluate(()=>{g.setActive(b);photoQA.render();window.qaResolve()});
 await p.locator('.character-discovery-dialog[open] .discovery-choices').waitFor();assert.equal(await p.locator('.character-discovery-dialog[open] > b').innerText(),'Original');
 assert.equal(await p.evaluate(()=>window.qaRequestCount),2);
 await p.screenshot({path:'tmp/discovery515.png'});
 await p.getByRole('button',{name:'지금은 넘기기',exact:true}).click();
 assert(await p.locator('.discovery-rail-button').isDisabled());assert.deepEqual(errors,[]);
 console.log('PASS delayed discovery request survives character switch without losing its question or duplicating consumption');
}finally{await browser.close();server.closeAllConnections();server.close()}
