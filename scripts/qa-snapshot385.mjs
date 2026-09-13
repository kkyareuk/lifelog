import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium,webkit}=require(playwrightPath),output=resolve(root,"qa-mail385");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.env.QA_ENGINE==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true}));

try{
 const page=await browser.newPage({viewport:{width:384,height:854}});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.addLocatorHandler(page.locator('dialog.page-guide[open]'),async()=>{await page.locator('dialog.page-guide[open] button').last().click()});await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);


 await page.evaluate(async()=>{
 const g=await import('/state.js?v=20260909dev305'),{accountStorage}=await import('/account-storage.js?v=20260909dev305'),{createContactMailbox}=await import('/notification-mail.js?v=20260909dev305');
 const id=g.createCharacter();g.state.uiLanguage='ko';g.state.activeTab='mailbox';
 createContactMailbox(accountStorage).record([{extra:{mailOwner:accountStorage.scope,mailId:'qa-choice385',scheduledAt:new Date().toISOString(),mailTitle:'QA 선택 편지',mailBody:'오늘은 무엇을 할까요?',characterId:id,mode:'question',questionKind:'everyday',questionOptions:[{characterId:id,kind:'everyday',label:{ko:'잠깐 쉬기',en:'Rest',ja:'休む'},copy:{}}]}}]);
 window.ParallelCity.mediaChanged();
 });
 await page.locator('[data-tab="mailbox"]:visible').first().click({timeout:10000});await page.locator('[data-mail-folder="inbox"]').click({timeout:10000});await page.locator('[data-open-contact-mail="qa-choice385"]').click();
 await page.locator('[data-character-question-option="0"]').click();await page.waitForFunction(()=>!document.querySelector('.character-question-dialog[open]'));
 assert(await page.evaluate(async()=>{const g=await import('/state.js?v=20260909dev305');return g.state.scheduledChoices.filter(c=>c.mailId==='qa-choice385').length===1}));
 console.log('PASS real mailbox inbox -> question -> answer -> saved dialog close');
 const result=await page.evaluate(async()=>{
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
