import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-performance327');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();const body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});

try{
 const p=await browser.newPage({viewport:{width:384,height:832}});p.setDefaultTimeout(90000);await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity&&window.ParallelCityAuth);
 await p.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');g.createCharacter();const base=structuredClone(g.active());for(let i=1;i<80;i++){const c=structuredClone(base);c.id='perf-'+i;c.name='테스트 '+i;g.state.characters[c.id]=c;g.state.order.push(c.id);}document.querySelectorAll('dialog[open]').forEach(d=>d.close());for(const tab of ['observe','settings','town','character'])localStorage.setItem('drawer-village-guide-'+tab,'1');});
 const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 const results=await p.evaluate(async()=>{const result=[];for(let i=0;i<2;i++)for(const tab of ['character','settings','town','observe']){const start=performance.now();window.DrawerVillageNavigation.go(tab);const sync=performance.now()-start;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));result.push({tab,syncMs:sync,paintMs:performance.now()-start});}return result;});
 const {profile}=await cdp.send('Profiler.stop');const nodes=new Map(profile.nodes.map(n=>[n.id,n])),times=new Map();for(let i=0;i<(profile.samples||[]).length;i++){const id=profile.samples[i];times.set(id,(times.get(id)||0)+(profile.timeDeltas?.[i]||0));}const hot=[...times].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([id,us])=>({name:nodes.get(id)?.callFrame.functionName,file:nodes.get(id)?.callFrame.url.split('/').at(-1),line:nodes.get(id)?.callFrame.lineNumber,ms:us/1000}));
 const report={characters:80,cpuSlowdown:4,results,hot,scope:'Local synthetic profiles, no images, no real multiplayer network'};await writeFile('docs/performance327.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await p.close();
}finally{await browser.close();server.close();}
