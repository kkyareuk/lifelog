import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.argv.includes('--bundled')?resolve('www'):process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/simulation.js')b=Buffer.from(b.toString()+'\nexport {commitLiveEntry as qaCommit};');if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage,render};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:402,height:874},serviceWorkers:'block'});await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 const result=await p.evaluate(async()=>{
 const g=await import('/state.js?v=20260909dev305'),sim=await import('/simulation.js?v=20260909dev305');
 const a=g.state.characters[g.createCharacter()],b=g.state.characters[g.createCharacter()],date=new Date(),minute=date.getHours()*60+date.getMinutes();
 g.state.world.courtTheme='court';a.courtRankId='sovereign';b.courtRankId='commoner';a.name='군주';b.name='주민';
 const place=g.state.world.places.find(p=>p.type==='공원')||g.state.world.places[0];
 for(const [actor,partner]of [[a,b],[b,a]]){actor.wake='00:00';actor.sleep='23:59';actor.createdAt=Date.now()-86400000;g.state.routines[actor.id]=[];sim.timeline(actor,date);const day=Object.values(actor.days).at(-1);day.entries=[{minute,title:'대화 중',kind:'talk',desc:'서로 이야기를 나눠요.',withId:partner.id,withIds:[partner.id],groupInteraction:true,interactionId:'qa-conversation',holdMinutes:20,placeId:place.id,townId:g.state.activeTownId}];}
 const first=sim.eventFor(a,date),second=sim.eventFor(b,date);const logs=x=>Object.values(x.days).flatMap(d=>d.reflections||[]).filter(e=>e.courtInteraction);
 return {first:first.title,desc:first.desc,second:second.title,a:logs(a).length,b:logs(b).length,same:logs(a)[0]?.interactionId===logs(b)[0]?.interactionId};
 });console.log(result);assert.equal(result.a,1);assert.equal(result.b,1);assert(result.same);console.log('PASS528 real eventFor creates both rank perspectives once');
}finally{await browser.close();server.close()}
