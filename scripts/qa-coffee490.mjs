import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render,bindRoomGeometryHandle,openPlaceInterior};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:360,height:792},serviceWorkers:'block'}),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>window.DRAWER_VILLAGE_ECONOMY_ENABLED=true);
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());
 await p.clock.setFixedTime(new Date(2026,8,23,11,0));
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.career=await import('/career-ui.js');document.querySelector('.drawer-title')?.remove();document.documentElement.classList.remove('title-visible');g.state.activeId=g.createCharacter();window.DrawerVillageNavigation.go('observe');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.photoQA.render()});
 await p.addLocatorHandler(p.locator('dialog.page-guide[open]'),async()=>p.locator('dialog.page-guide[open]').evaluate(d=>d.close()));





 await p.clock.setFixedTime(new Date(2026,8,23,14,0));
 const result=await p.evaluate(async()=>{
  const {needsAt,advanceNeeds,urgentNeed}=await import('/life-needs.js');const {COFFEE_TASKS}=await import('/coffee-crafting.js');const t=Date.now(),make=()=>({id:'coffee-test',wake:'07:00',sleep:'23:00',lifeNeeds:{sleep:10,hunger:80,toilet:90,hygiene:90,social:90,updatedAt:t}}),scene={coffeeRecovery:true,needKey:'sleep',recoveryStartedAt:t,recoveryEndsAt:t+20000,actionKind:'eating'};
  const c=make();advanceNeeds(c,scene,t);const values=[needsAt(c,t).sleep,needsAt(c,t+10000).sleep];advanceNeeds(c,scene,t+10000);values.push(needsAt(c,t+20000).sleep);const restored=JSON.parse(JSON.stringify(c));values.push(needsAt(restored,t+20000).sleep);advanceNeeds(c,{},t+20000);values.push(needsAt(c,t+25000).sleep);advanceNeeds(c,scene,t+25000);values.push(needsAt(c,t+40000).sleep);
  const interrupted=make();advanceNeeds(interrupted,scene,t);advanceNeeds(interrupted,{},t+5000);const interruption=needsAt(interrupted,t+20000).sleep;
  const empty=make();empty.lifeNeeds.sleep=0;advanceNeeds(empty,scene,t);const repeat=urgentNeed(empty,t+20000);
  const brewing=make();advanceNeeds(brewing,{title:'커피 내리기',lifeTaskId:'coffee_drip'},t);const brewGain=needsAt(brewing,t+15000).sleep-10;
  const id=g.state.activeId;const cmd=g.directCharacterActivity(id,'meal',{lifeTask:'coffee',now:t});const d=g.state.characterDirectives[id];
  return {values,interruption,repeat,brewGain,craftTimes:COFFEE_TASKS.map(r=>r.minutes*60000),cmd,duration:d.endsAt-Math.max(t,d.journey?.arrivesAt||t)};
 });
 console.log(result);for(const [i,n] of [10,25,40,40,40,40].entries())assert(Math.abs(result.values[i]-n)<.1);assert(Math.abs(result.interruption-17.5)<.1);assert.equal(result.repeat,'');assert(Math.abs(result.brewGain)<.1);assert(result.craftTimes.every(t=>t===15000));assert(result.cmd);assert.equal(result.duration,20000);
 await p.evaluate(async()=>{window.sim=await import('/simulation.js?v=20260909dev305');window.need=await import('/life-needs.js');const c=g.state.characters[g.state.activeId];g.state.characterDirectives={};c.job='무직';c.wake='07:00';c.sleep='23:00';c.createdAt=Date.now()-86400000;c.timelineResetAt=c.createdAt;sim.timeline(c,new Date());c.days['2026-9-23'].entries=[{minute:840,title:'책을 읽는 중',desc:'책을 읽고 있어요.',home:true,room:'study',holdMinutes:50}];c.lifeNeeds={hunger:90,sleep:10,toilet:90,hygiene:90,social:90,updatedAt:Date.now()}});
 for(const [seconds,expected] of [[0,10],[10,25],[20,40],[30,40]]){await p.clock.setFixedTime(new Date(2026,8,23,14,0,seconds));const r=await p.evaluate(()=>{const c=g.state.characters[g.state.activeId],scene=sim.eventFor(c,new Date());return {sleep:need.needsAt(c).sleep,coffee:scene.coffeeRecovery,title:scene.title}});console.log(seconds,r);assert(Math.abs(r.sleep-expected)<.1);if(seconds>=20)assert(!r.coffee)}
 const sounds=await p.evaluate(async()=>{const old=window.Audio,records=[];window.Audio=class{constructor(src){records.push(this);this.src=src}play(){return Promise.resolve()}pause(){}load(){}removeAttribute(){}};const {syncLifeSound,stopLifeSound}=await import('/life-audio.js');const host=document.createElement('div');host.dataset.observedCharacter='audio-test';host.dataset.lifeSound='drink';host.dataset.lifeSoundEvent='one';document.body.prepend(host);const w={settings:{soundEffectsVolume:80}};syncLifeSound(w);await Promise.resolve();syncLifeSound(w);stopLifeSound();syncLifeSound(w);await Promise.resolve();const count=records.length;host.dataset.lifeSoundEvent='two';syncLifeSound(w);await Promise.resolve();const r={count,total:records.length,loops:records.map(a=>a.loop)};stopLifeSound();host.remove();window.Audio=old;return r});assert.equal(sounds.count,1);assert.equal(sounds.total,2);assert(sounds.loops.every(l=>l===false));console.log('PASS drinking sound once per episode, no loop or rerender replay');
 assert.deepEqual(errors,[]);console.log('PASS coffee gradual 30pt/20s, interruption, reload, repeat cap, 15s brewing and direct command');
}finally{await browser.close();server.closeAllConnections();server.close()}
