import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-save391');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root))throw Error();let body=await readFile(path==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(path==='/app.js')body=body.toString()+'\nexport {openHomeOccupantSheet};';if(path==='/views.js')body=body.toString()+'\nexport {homeLifePersonMarkup,homeBedForegroundStatusMarkup};';if(path==='/simulation.js')body=body.toString()+'\nexport {sleepingNow,buildScene,sharedFurnitureScene,homeActivityPoolFor};';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,engine=process.argv.includes('--webkit')?'webkit':'chromium';const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));

try {
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 const boot=async()=>{await page.waitForFunction(()=>window.DrawerVillageNavigation);await page.evaluate(async()=>{
  window.g=await import('/state.js?v=20260909dev305');window.storage=(await import('/account-storage.js?v=20260909dev305')).accountStorage;
  window.rules=await import('/character-discovery-rules.js?v=20260909dev305');window.discovery=await import('/character-discovery.js?v=20260909dev305');
  window.noise=rules.DISCOVERY_SCENES.find(q=>q.id==='noise');
 });};
 await page.goto(origin);await boot();
 const ids=await page.evaluate(async()=>{const ids=Array.from({length:5},()=>g.createCharacter(20));for(const [i,id] of ids.entries()){const c=g.state.characters[id];c.name='저장검사 '+i;c.needsFixed=true;c.lifeNeeds={sleep:11+i,hunger:22+i,toilet:33+i,hygiene:44+i,social:55+i,updatedAt:Date.now(),recovering:[]};c.relationshipChangeMode=['fixed','score','dynamic'][i%3];}if(!await g.save(true))throw Error('Initial save');return ids});
 // Establish the persisted baseline after normal load-time default migration.
 await page.reload();await boot();
 const choices=await page.evaluate(()=>noise.choices.length);
 for(let index=0;index<choices;index++){
  const expected=await page.evaluate(async({id,index})=>{const c=g.state.characters[id];c.discovery={lockRevision:333,locks:Object.fromEntries(Object.keys(rules.DISCOVERY_AXES).map(k=>[k,true]))};await g.save(true);const before=Object.fromEntries(Object.keys(rules.DISCOVERY_AXES).map(k=>[k,c[k]??null]));if(!await discovery.applyDiscoveryChoice(c,noise,index))throw Error('Locked answer rejected');const journal=JSON.parse(storage.getItem('drawer-village-answer-journal-v1'));if(!journal[id].patch.discovery.answered.includes('noise'))throw Error('Answer not durable before snapshot');await g.save(true);return before},{id:ids[0],index});
  await page.reload();await boot();
  const actual=await page.evaluate(id=>{const c=g.state.characters[id];return {answered:c.discovery.answered.includes('noise'),axes:Object.fromEntries(Object.keys(rules.DISCOVERY_AXES).map(k=>[k,c[k]??null]))}},ids[0]);
  assert.equal(actual.answered,true);assert.deepEqual(actual.axes,expected);
 }
 const failure=await page.evaluate(async id=>{
  const c=g.state.characters[id];c.discovery={lockRevision:333,known:{},locks:{}};await g.save(true);const before=JSON.stringify(c),write=storage.setItem;
  storage.setItem=(key,value)=>{if(key==='drawer-village-answer-journal-v1')throw new DOMException('injected','QuotaExceededError');return write(key,value)};
  let rejected=false;try{await discovery.applyDiscoveryChoice(c,noise,0)}catch{rejected=true}finally{storage.setItem=write}
  const rollback=JSON.stringify(c)===before;const old=storage.getItem('drawer-village-game-v1'),asyncWrite=storage.setItemAsync;
  c.name='저장 실패 후 재시도';storage.setItemAsync=async()=>{throw new DOMException('injected','QuotaExceededError')};
  let result;try{result=await g.save(true)}finally{storage.setItemAsync=asyncWrite}
  const diskPreserved=storage.getItem('drawer-village-game-v1')===old,memoryPreserved=c.name==='저장 실패 후 재시도';
  const retry=await g.save(true);return {rejected,rollback,result,diskPreserved,memoryPreserved,retry};
 },ids[1]);
 assert.deepEqual(failure,{rejected:true,rollback:true,result:false,diskPreserved:true,memoryPreserved:true,retry:true});
 const exit=await page.evaluate(id=>{g.updateCharacter(id,{name:'종료 직전 수정'});window.dispatchEvent(new Event('pagehide'));return JSON.parse(storage.getItem('drawer-village-game-v1')).characters[id].name},ids[2]);
 assert.equal(exit,'종료 직전 수정');
 await page.reload();await boot();
 const restored=await page.evaluate(ids=>ids.map(id=>{const c=g.state.characters[id];return {name:c.name,fixed:c.needsFixed,mode:c.relationshipChangeMode,needs:Object.fromEntries(['sleep','hunger','toilet','hygiene','social'].map(k=>[k,c.lifeNeeds[k]]))}}),ids);
 for(const [i,c] of restored.entries()){assert.equal(c.fixed,true);assert.equal(c.mode,['fixed','score','dynamic'][i%3]);assert.deepEqual(c.needs,{sleep:11+i,hunger:22+i,toilet:33+i,hygiene:44+i,social:55+i})}
 assert.equal(restored[1].name,'저장 실패 후 재시도');assert.equal(restored[2].name,'종료 직전 수정');
 console.log(`PASS ${engine}: ${choices} locked noise choices with reload; 5 character needs/policies; durable answer journal; failed answer rollback; failed snapshot retains disk and edits; retry; pagehide flush`);
} finally {await browser.close();server.close()}
