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

 const main='drawer-village-game-v1',backup='drawer-village-last-nonempty-state-v1',value=JSON.stringify({name:'original',characters:{a:{id:'a'}}}),data=new Map();let quota=false;
 const storage={get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem(k,v){if(quota&&!v.startsWith(SNAPSHOT_REF))throw new DOMException('full','QuotaExceededError');data.set(k,String(v))},removeItem:k=>data.delete(k)};
 const persistent=await openSnapshotStore(storage),account=createAccountStorage(storage,async x=>x,persistent);
 quota=true;await account.setItemAsync(main,value);if(!data.get(main).startsWith(SNAPSHOT_REF))throw Error('Quota fallback missing');
 quota=false;account.copySnapshotBackup(main,backup);if(data.get(backup)!==value)throw Error('Backup is only a pointer alias');
 const reloaded=createAccountStorage(storage,async x=>x,await openSnapshotStore(storage));if(data.get(backup)!==value)throw Error('Startup moved backup into same database');
 const missing=createAccountStorage(storage,async x=>x,{get(){throw Error('Saved snapshot is unavailable')},release(){}});
 let failed=false;try{missing.getItem(main)}catch{failed=true}if(!failed||missing.getItem(backup)!==value)throw Error('Independent recovery lost');
 await reloaded.setItemAsync(main,'new');if(data.get(main)!=='new')throw Error('Old pointer never returns to inline storage');
 quota=true;await account.setItemAsync(main,value+'next');if(account.copySnapshotBackup(main,backup)!==false||data.get(backup)!==value)throw Error('Quota overwrote independent recovery');
 quota=false;account.switchScope('another');await account.setItemAsync(main,'other-account');account.switchScope('');if(account.getItem(backup)!==value)throw Error('Scope leak');
 return {quotaFallback:true,independentBackup:true,databaseFailureRecovery:true,inlineRecovery:true,quotaPreservesBackup:true,accountIsolation:true};

 });
 console.log('PASS snapshot quota recovery',result);
}finally{await browser.close();server.close()}
