import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-command303');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});


try{
const p=await browser.newPage();await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin);await p.waitForFunction(()=>window.ParallelCity);
const result=await p.evaluate(async()=>{
const media=await import('./local-media.js?v=20260909dev305');const canvas=document.createElement('canvas');canvas.width=8;canvas.height=8;canvas.getContext('2d').fillRect(0,0,8,8);const data=canvas.toDataURL();await media.persistLocalImage(data);const saved=media.serializeLocalMediaState({food:[{id:'test',name:'test',image:data}]});const before=saved.food[0].image;const hydration=await media.initializeLocalMediaState(saved);const missing={image:'local-media://missing-test-photo'};const absent=await media.initializeLocalMediaState(missing);return {before,after:saved.food[0].image,pending:hydration.pending,missing:absent.pending};
});assert.ok(result.before.startsWith('local-media://'));assert.ok(result.after.startsWith('data:image/'));assert.equal(result.pending,0);assert.equal(result.missing,1);console.log('PASS real IndexedDB dictionary photo restoration and missing original detection');
}finally{await browser.close();server.close()}
