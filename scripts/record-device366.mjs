import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.connectOverCDP('http://127.0.0.1:9223');
try {
 const page=browser.contexts().flatMap(c=>c.pages()).find(p=>/localhost/.test(p.url()));if(!page)throw Error('App WebView not found');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');console.log('RECORDING: use the slow buttons now');
 await new Promise(r=>setTimeout(r,45000));
 const {profile}=await cdp.send('Profiler.stop');await mkdir('qa-device366',{recursive:true});await writeFile('qa-device366/interaction.cpuprofile',JSON.stringify(profile));
 const nodes=new Map(profile.nodes.map(n=>[n.id,n]));const totals={};profile.samples?.forEach((id,i)=>{const f=nodes.get(id).callFrame,key=f.functionName+' '+f.url+':'+(f.lineNumber+1);totals[key]=(totals[key]||0)+(profile.timeDeltas[i]||0)});
 console.log(JSON.stringify(Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([fn,us])=>({fn,ms:Math.round(us/1000)}))));
 console.log(await page.evaluate(async()=>{const p=await import('/performance-diagnostics.js?v=20260909dev305');return p.performanceSummary()}));
}finally{await browser.close()}
