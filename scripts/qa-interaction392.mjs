import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-interaction392');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root))throw Error();let body=await readFile(path==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(path==='/app.js')body=body.toString()+'\nexport {openHomeOccupantSheet};';if(path==='/views.js')body=body.toString()+'\nexport {homeLifePersonMarkup,homeBedForegroundStatusMarkup};';if(path==='/simulation.js')body=body.toString()+'\nexport {sleepingNow,buildScene,sharedFurnitureScene,homeActivityPoolFor,relationshipCombinationScenePool,profileSettingEvents};';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,engine=process.argv.includes('--webkit')?'webkit':'chromium';const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));

try {
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const result=await page.evaluate(async()=>{
  const g=await import('/state.js?v=20260909dev305'),codes=await import('/character-code.js?v=20260909dev305'),contact=await import('/contact-narrative.js?v=20260909dev305'),conversation=await import('/conversation-narrative.js?v=20260909dev305'),topics=await import('/conversation-subjects.js'),sim=await import('/simulation.js?v=20260909dev305'),storage=(await import('/account-storage.js?v=20260909dev305')).accountStorage;
  window.g=g;window.codes=codes;window.storage=storage;
  for(let i=0;i<10;i++)g.createCharacter(30);await g.save(true);const before=g.state.order.length;
  const id=await codes.importCodeCharacter({name:'공유 안테',photo:'https://example.com/ante.png',characterTraits:['냉정한','과묵한'],wardrobeItems:[]},30);window.importId=id;
  if(g.state.order.length!==before+1||JSON.parse(storage.getItem('drawer-village-game-v1')).characters[id].name!=='공유 안테')throw Error('Import not durably saved');
  let full=false;try{await codes.importCodeCharacter({name:'full'},g.state.order.length)}catch(e){full=/슬롯/.test(e.message)}if(!full||g.state.order.length!==before+1)throw Error('Full slot changed data');
  const disk=storage.getItem('drawer-village-game-v1'),write=storage.setItemAsync;storage.setItemAsync=async()=>{throw new DOMException('injected','QuotaExceededError')};let failed=false;
  try{await codes.importCodeCharacter({name:'must rollback'},30)}catch{failed=true}finally{storage.setItemAsync=write}
  if(!failed||g.state.order.length!==before+1||storage.getItem('drawer-village-game-v1')!==disk)throw Error('Failed import damaged state');
  const a=g.state.characters[id],b=g.state.characters[g.state.order[0]];b.name='상대';a.emotionalExpression='감정을 잘 드러내지 않음';a.affectionStyle='직접 표현';a.socialStyle='활발';
  for(const now of [0,1,2,3])for(const initiatorId of [a.id,b.id])for(const lang of ['ko','en','ja']){const copy=contact.contactNarrative(g.state,a,b,{},'hug',{initiatorId,now})[lang];if(/웃|grin|smil|laugh|笑|천진/i.test(copy.desc))throw Error('Reserved hug smiles');}
  if(contact.contactNarrative(g.state,a,b,{},'hug',{initiatorId:a.id,contactRejected:true}).ko.contactTone!=='declined')throw Error('Rejection overridden');
  for(const row of topics.CONVERSATION_SUBJECTS)for(const [i,lang] of ['ko','en','ja'].entries()){const story=conversation.topicConversation(g.state,a,b,row[0],lang);if(!story.title.includes(row[i])||!story.speakerText.includes(row[i])||!story.listenerText.includes(row[i])||!story.listenerText.includes(a.name)||!story.speakerText.includes(b.name))throw Error('Unpaired topic');}
  g.state.characterViews??={};g.state.characterViews[a.id]={[b.id]:{annoyance:'많이 귀찮음'}};const pool=sim.relationshipCombinationScenePool(a,{other:b,r:{}},new Date());const annoyed=pool.find(x=>x.category==='annoyed-request');if(annoyed?.withId!==b.id||annoyed.withIds[0]!==b.id)throw Error('Missing interruption target');
  a.days??={};a.days['2026-09-14']={entries:[{profileScene:true,title:`${b.name}에게 말을 세 번 끊지 말라고 따지는 중`,minute:720}]};await g.save(true);return {id,target:b.id,topics:topics.CONVERSATION_SUBJECTS.length,count:g.state.order.length};
 });
 await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);
 assert.deepEqual(await page.evaluate(async id=>{const c=(await import('/state.js?v=20260909dev305')).state.characters[id];return [c.name,c.days['2026-09-14'].entries.find(e=>e.profileScene).withId]},result.id),['공유 안테',result.target]);
 // Exercise the actual code preview/import dialog, including pasted full-width characters.
 await page.evaluate(async()=>{window.codes=await import('/character-code.js?v=20260909dev305');window.messages=[];window.DrawerVillageGroups={readCharacterCode:async code=>{if(code!=='ABCDEF123456ABCDEF')throw Error('normalization failed');return {character:{name:'코드 화면 검사'}}}};await codes.characterCodeDialog('character-code-import',()=>30,()=>{},x=>messages.push(x));});
 await page.locator('.character-code-dialog input').fill('ＡＢＣＤＥＦ–１２３４５６–ＡＢＣＤＥＦ');await page.getByRole('button',{name:'캐릭터 확인',exact:true}).click();await page.getByRole('button',{name:'불러오기',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.character-code-dialog'));
 assert(await page.evaluate(()=>messages.includes('캐릭터와 사진을 불러왔어요.')));
 console.log(`PASS ${engine}: 10-character sharing import, durable save/reload, full slots, failure rollback, normalized preview/import UI; reserved hug both roles, rejection; ${result.topics} paired topics in KO/EN/JA; interruption target metadata`);
}finally{await browser.close();server.close()}
