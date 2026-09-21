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
 const g=await import('/state.js?v=20260909dev305'),craft=await import('/coffee-crafting.js'),code=await import('/character-code.js'),actions=await import('/context-actions.js?v=20260909dev305');
 const id=g.createCharacter(),c=g.state.characters[id],home=g.state.homes[c.homeId];
 if(home.canvasColumns!==12)throw Error('new home uses half-width grid');
 const placement=g.addFurniturePlacement(home.id,'kitchen','커피머신');
 const machine=home.rooms.kitchen.furniturePlacements.find(f=>f.item==='커피머신');if(!machine)throw Error('missing coffee fixture');
 const target={type:'furniture',homeId:home.id,room:'kitchen',id:machine.id,item:'커피머신'},now=Date.now();
 if(actions.contextActions(target).length<8)throw Error('coffee menu too small');
 if(g.directCharacterActivity(id,'meal',{lifeTask:'coffee_latte',contextTarget:target,now}))throw Error('latte without milk');
 if(!g.directCharacterActivity(id,'meal',{lifeTask:'coffee_whipped_milk',contextTarget:target,now}))throw Error('milk action failed');
 const deadline=g.state.characterDirectives[id].endsAt;
 if(craft.finishCoffee(g.state,c,deadline-1))throw Error('premature inventory');
 if(!craft.finishCoffee(g.state,c,deadline)||craft.finishCoffee(g.state,c,deadline+1)||c.coffeeInventory.whipped_milk!==1)throw Error('duplicate crafting');
 if(!g.directCharacterActivity(id,'meal',{lifeTask:'coffee_latte',contextTarget:target,now:deadline+1}))throw Error('latte with milk failed');
 if(c.coffeeInventory.whipped_milk!==0)throw Error('milk was not consumed');
 craft.finishCoffee(g.state,c,g.state.characterDirectives[id].endsAt);if(c.coffeeInventory.latte!==1)throw Error('latte output missing');
 const personal=g.state,world=structuredClone(personal);world.characters[id].ownerUid='qa';world.characters[id].coffeeInventory={latte:1};
 let saved;window.ParallelCityAuth={getInfo:()=>({user:{uid:'qa'},ready:true})};window.DrawerVillageGroups={getSnapshot:()=>({activeGroupId:'multi',residents:[{id,ownerUid:'qa'}]}),saveResident:async input=>{saved=input}};
 g.beginCharacterEditor(world);
 await code.importCodeCharacter({name:'Imported',photo:'https://example.com/photo.webp',coffeeInventory:{latte:90},homeId:'malicious-home',inventory:{fashion:[]}},100);
 if(saved.groupId!=='multi'||saved.id!==id||g.state.characters[id].name!=='Imported'||g.state.characters[id].homeId!==home.id||g.state.characters[id].coffeeInventory.latte!==1||personal.order.length!==1)throw Error('shared import isolation');
 g.endCharacterEditor();
 return {newHomeColumns:home.canvasColumns,coffeeActions:actions.contextActions(target).length,coffeeInventory:c.coffeeInventory,sharedImport:saved.id};
 });console.log(JSON.stringify(result));assert.equal(errors.length,0,errors.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
