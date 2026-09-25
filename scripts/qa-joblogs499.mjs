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
 const result=await p.evaluate(async()=>{
  window.DRAWER_VILLAGE_ECONOMY_ENABLED=true;window.DRAWER_VILLAGE_CAREER_ENABLED=false;
  const g=await import('/state.js?v=20260909dev305'),sim=await import('/simulation.js?v=20260909dev305'),{BUILTIN_CAREERS}=await import('/career-catalog.js');
  const out=[];
  for(const job of BUILTIN_CAREERS){
   if(job.id==='builtin-none')continue;
   const id=g.createCharacter(100),c=g.state.characters[id];c.createdAt=1;c.job=job.name;c.workplaceId='';c.lifeNeeds={hunger:100,sleep:100,toilet:100,hygiene:100,social:100,updatedAt:Date.now()};
   const now=new Date(2026,8,25,11,20);c.careerSchedules={['legacy-'+job.id]:{days:[5],start:'09:00',end:'18:00'}};
   const e=sim.eventFor(c,now);out.push({job:job.id,title:e.title,desc:e.desc,place:e.placeId,routine:e.routineId,office:e.officeTaskId});
  }
  return out;
 });
 assert.equal(result.length,22);for(const row of result){assert(row.title&&row.desc);assert(row.office,row.job+' '+JSON.stringify(row));}
 console.log(JSON.stringify(result.map(({job,title,place})=>({job,title,place}))));
 console.log('PASS 499 browser: real simulation work scenes for 22 working jobs under public career-UI gate.');
}finally{await browser.close();server.closeAllConnections();server.close()}

