import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json'),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/simulation.js')b=Buffer.from(b.toString()+'\nexport {liveGapEvent as qaGap,commitLiveEntry as qaCommit};');if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openBuildingShapeDialog,openRoomEditor,cropImage};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 const result=await p.evaluate(async()=>{
 const g=await import('/state.js?v=20260909dev305'),sim=await import('/simulation.js?v=20260909dev305');
 const id=g.createCharacter(),c=g.state.characters[id],date=new Date(2026,8,21,12),day='2026-9-21';c.days={};
 const laundry={minute:600,title:'세탁기로 빨래하는 중',desc:'세탁할 옷을 나누고 있어요.',room:'bedroom',placeId:null};
 const first=sim.qaGap(c,laundry,720,date),second=sim.qaGap(c,first,780,date);
 if(!first.homeFollowup||second.homeFollowup||first.title===second.title)throw Error('followup loop persists');
 const plant=sim.qaGap(c,{...laundry,title:'식물을 돌보는 중',desc:'화분을 살펴요.'},720,date);if(!plant.homeFollowup||sim.qaGap(c,plant,780,date).homeFollowup)throw Error('plant loop');
 const old={...first};delete old.homeFollowup;if(sim.qaGap(c,old,780,date).title===old.title)throw Error('legacy loop persists');
 c.days={[day]:{entries:[]}};const last={minute:650,title:'잠깐 쉬는 중',desc:'쉬어요.',room:'living'};
 const a=sim.qaGap(c,last,720,date),b=sim.qaGap(c,last,720,date);if(a.narrativeKey!==b.narrativeKey)throw Error('render changed choice');
 const committed=[];
 for(let i=0;i<8;i++){const min=680+i*12,base={...last,minute:min-10};const entry=sim.qaGap(c,base,min,date);c.days[day].entries.push(entry);committed.push(entry.narrativeKey);}
 const common={minute:800,title:'같은 제목',room:'living',placeId:null,desc:'첫 번째 내용',narrativeKey:'test:a'};
 sim.qaCommit(c,date,common);sim.qaCommit(c,date,{...common,minute:820,desc:'두 번째 내용',narrativeKey:'test:b'});
 if(!c.days[day].entries.some(e=>e.narrativeKey==='test:a')||!c.days[day].entries.some(e=>e.narrativeKey==='test:b'))throw Error('different bodies suppressed');
 return {first:first.title,second:second.title,keys:committed,entries:c.days[day].entries.length};
 });console.log(JSON.stringify(result));assert.equal(errors.length,0,errors.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
