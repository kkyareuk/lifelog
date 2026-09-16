import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('tmp/qa-needs421');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;window.qaActivityGroups=DIRECT_ACTIVITY_GROUPS;window.qaRoomEditor=openRoomEditor;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);

 const result=await page.evaluate(async()=>{
  const g=await import('/state.js?v=20260909dev305'),sim=await import('/simulation.js?v=20260909dev305'),needs=await import('/life-needs.js'),rules=await import('/room-activities.js?v=20260909dev305');
  const id=g.createCharacter(),c=g.state.characters[id],home=g.state.homes[c.homeId];window.g=g;window.c=c;window.home=home;
  c.ageGroup='성인';g.state.activeId=id;const t=Date.now(),originalNow=Date.now;let clock=t;Date.now=()=>clock;
  const checks=[];
  try{for(const [kind,task,key] of [['nap','sleep','sleep'],['meal',null,'hunger'],['wash','shower','hygiene'],['wash','toilet','toilet']]){
   delete g.state.characterDirectives?.[id];c.lifeNeeds={sleep:20,hunger:20,hygiene:20,toilet:20,social:70,updatedAt:clock};
   const ok=g.directCharacterActivity(id,kind,{lifeTask:task||undefined,now:clock});if(!ok)throw Error('command failed '+kind);
   const d=g.state.characterDirectives[id];clock=Math.max(clock,d.journey?.arrivesAt||clock)+1000;
   const scene=sim.eventFor(c,new Date(clock));const before=needs.needsAt(c,clock)[key];clock+=60000;
   const during=needs.needsAt(c,clock)[key];sim.eventFor(c,new Date(clock));const after=needs.needsAt(c,clock)[key];
   checks.push({kind,key,before,during,after,recovering:c.lifeNeeds.recovering,title:scene.title});
   if(!(during>before&&Math.abs(after-during)<.01))throw Error(JSON.stringify(checks));
   clock+=60000;
  }
  const all=Object.keys(rules.ROOM_ACTIVITIES),keys=Object.keys(home.rooms),first=keys[0];
  for(const room of Object.values(home.rooms))room.allowedActivities=[];
  if(g.directCharacterActivity(id,'nap',{lifeTask:'sleep',now:clock}))throw Error('all rooms blocked but sleep accepted');
  home.rooms[first].allowedActivities=all;
  if(!g.directCharacterActivity(id,'nap',{lifeTask:'sleep',now:clock}))throw Error('allowed room rejected');
  if(g.state.characterDirectives[id].room!==first)throw Error('wrong room');
  home.rooms[first].allowedActivities=[];
  const blocked=sim.eventFor(c,new Date(clock+120000));if(!blocked.roomActivityBlocked)throw Error('active directive ignored room prohibition');
  const saved=JSON.parse(JSON.stringify(home));if(saved.rooms[first].allowedActivities.length)throw Error('empty policy lost');
  for(const r of Object.values(home.rooms))delete r.allowedActivities;
  window.qaRoomEditor(home.id,first);
  return checks;
  }finally{Date.now=originalNow}
 });
 console.log(JSON.stringify(result));
 const boxes=page.locator('[name="allowedActivities"]');assert.equal(await boxes.count(),22);assert.equal(await boxes.locator('..').count(),22);
 assert.equal(await page.locator('[name="allowedActivities"]:checked').count(),22);
 await page.getByText('세부 활동 설정',{exact:true}).click();await page.locator('[name="allowedActivities"][value="sleep"]').uncheck();
 await page.screenshot({path:out+'/room-activities.png'});
 const saved=await page.evaluate(async()=>{const p=await import('/room-permissions.js?v=20260909dev305');return p.readRoomPermissionEditor(document.querySelector('dialog[open]')).allowedActivities});assert.equal(saved.includes('sleep'),false);assert.equal(saved.length,21);
 await page.evaluate(async()=>{const g=window.g,home=window.home;const perms=await import('/room-permissions.js?v=20260909dev305');g.updateRoom(home.id,Object.keys(home.rooms)[0],perms.readRoomPermissionEditor(document.querySelector('dialog[open]')));g.save();});
 await page.reload();await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const restored=await page.evaluate(async()=>{const {state}=await import('/state.js?v=20260909dev305');return Object.values(state.homes).flatMap(h=>Object.values(h.rooms)).some(r=>Array.isArray(r.allowedActivities)&&r.allowedActivities.length===21&&!r.allowedActivities.includes('sleep'))});assert.equal(restored,true,'room activity choices survive reload');
 console.log('PASS: actual directed sleep/eat/wash/toilet recover continuously without double credit; room default/all blocked/routing/active prohibition/editor.');
}finally{await browser.close();server.closeAllConnections();server.close();process.exitCode=0}
