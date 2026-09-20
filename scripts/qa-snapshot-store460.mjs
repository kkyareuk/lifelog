import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve(process.argv[2]||'.'),old=process.argv.includes('--before');
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+pathname);if(!file.startsWith(root+sep))throw Error();const body=pathname==='/fixture'?'<html></html>':await readFile(file);res.setHeader('Content-Type',['.js','.mjs'].includes(extname(file))?'text/javascript':extname(file)==='.css'?'text/css':'text/html');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await (process.env.QA_ENGINE==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true})),origin=`http://127.0.0.1:${server.address().port}`;
try{const page=await browser.newPage();await page.goto(origin+'/fixture'); const result=await page.evaluate(async()=>{
 const {openSnapshotStore,SNAPSHOT_REF}=await import('/snapshot-store.js'),{createAccountStorage}=await import('/account-storage.js');
 const main='drawer-village-game-v1',backup='drawer-village-last-nonempty-state-v1',value=JSON.stringify({photo:'x'.repeat(250000),name:'original'}),data=new Map([[main,value],['unrelated','keep']]);
 const storage={get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem(k,v){if([...data].filter(([key])=>key!==k).reduce((n,[,v])=>n+v.length,0)+v.length>2000)throw new DOMException('full','QuotaExceededError');data.set(k,String(v))},removeItem:k=>data.delete(k)};
 const persistent=await openSnapshotStore(storage),account=createAccountStorage(storage,async x=>x,persistent);
 if(account.getItem(main)!==value||!data.get(main).startsWith(SNAPSHOT_REF))throw Error('Migration lost data');
 account.copyItem(main,backup);const next=JSON.stringify({photo:'y'.repeat(260000),name:'updated'});await account.setItemAsync(main,next);
 if(account.getItem(backup)!==value)throw Error('Recovery copy overwritten');
 const reloaded=createAccountStorage(storage,async x=>x,await openSnapshotStore(storage));if(reloaded.getItem(main)!==next||reloaded.getItem(backup)!==value)throw Error('Reload lost snapshots');
 const before=data.get(main),failing=createAccountStorage(storage,async x=>x,{get:p=>persistent.get(p),put:async()=>{throw Error('disk unavailable')},release(){}});let failed=false;try{await failing.setItemAsync(main,'z'.repeat(300000))}catch{failed=true}if(!failed||data.get(main)!==before)throw Error('Failure did not preserve original');
 reloaded.switchScope('other');await reloaded.setItemAsync(main,'other'.repeat(50000));if(reloaded.getItem(main)!=='other'.repeat(50000))throw Error('Other scope failed');reloaded.switchScope('');if(reloaded.getItem(main)!==next||data.get('unrelated')!=='keep')throw Error('Account isolation failed');
 return {migration:true,reload:true,recovery:true,failedWritePreserved:true,accountIsolation:true};
 });
 console.log('PASS snapshot quota recovery',result);
}finally{await browser.close();server.close()}
