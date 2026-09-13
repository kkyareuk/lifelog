import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),out=resolve('qa-furniture366');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root))throw Error();let body=await readFile(pathname==='/auth.js'?resolve(root,'scripts/ios-preview-auth.mjs'):file);if(pathname==='/app.js'&&process.argv.includes('--baseline-scroll'))body=body.toString().replace('if(target)requestAnimationFrame(()=>{selectFurniture(target)});','if(target)requestAnimationFrame(()=>{target.scrollIntoView({block:"center",behavior:"smooth"});selectFurniture(target)});');if(pathname==='/views.js')body=body.toString()+'\nexport {sceneEmotionScores};';if(pathname==='/simulation.js')body=body.toString()+'\nexport {birthdayGuests,reachableBirthdays};';if(pathname==='/app.js')body=body.toString()+'\nwindow.qaRender=render;';res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(body)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const useWebKit=process.argv.includes('--webkit'); const browser=await (useWebKit?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const page=await browser.newPage({viewport:{width:402,height:820},serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.DrawerVillageNavigation);
 const result=await page.evaluate(async()=>{
  const g=await import('/state.js?v=20260909dev305'),sim=await import('/simulation.js?v=20260909dev305'),v=await import('/views.js?v=20260909dev305');
  const a=g.state.characters[g.createCharacter()],b=g.state.characters[g.createCharacter()],c=g.state.characters[g.createCharacter()];
  g.state.towns=[{id:'a',places:[]},{id:'b',places:[]}];g.state.homes={};g.state.order=[a.id,b.id,c.id];
  for(const p of [a,b,c]){p.homeId='';p.residences=[];p.townId=p===c?'b':'a';p.birthday=p===a?'0913':''}
  const date=new Date(2026,8,13,19,5);g.state.preventInterTownMovement=true;
  const blocked=sim.timeline(c,date).some(e=>e.birthdayIds?.length),guests=sim.birthdayGuests(a,date).map(p=>p.id);
  g.state.preventInterTownMovement=false;g.state.towns[1].travelAllowed=false;
  const localBlocked=sim.reachableBirthdays(c,date).length;
  g.state.towns[1].travelAllowed=true;const allowed=sim.reachableBirthdays(c,date).length;
  const positive=v.sceneEmotionScores('공원 풍경을 기록하는 중 하던 일에서 예상하지 못한 연결을 떠올리고 다른 방식도 생각한다');
  const negative=v.sceneEmotionScores('예상하지 못한 사고가 나 큰 충격을 받았다');
  return {blocked,guests:guests.length,localBlocked,allowed,positive:positive.shock,negative:negative.shock};
 });assert.deepEqual(result,{blocked:false,guests:2,localBlocked:0,allowed:1,positive:0,negative:4});
 await page.evaluate(async()=>{
  document.body.innerHTML='<main id="depth-test"><div class="room" style="position:relative;width:300px;height:400px"><div class="room-furniture-item" data-furniture-placement="bed1" style="position:absolute;top:0;left:0;width:200px;height:300px"><span class="room-furniture-art" style="display:block;width:200px;height:300px"><img class="couple-bed-layer" style="width:200px;height:300px;object-fit:contain" src="data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"%3E%3C/svg%3E"></span></div><div class="home-person" data-using-furniture="bed1" style="position:absolute;top:225px;left:0;transform:none"><span class="home-person-visual"><span class="avatar" style="display:block;width:50px;height:50px">A</span></span><span class="home-person-status"><b>크로</b><small>쉬는 중</small></span></div></div></main>';
  // Set source separately so URL quotes cannot become markup attributes.
  const img=document.querySelector('img');img.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"></svg>');await img.decode();
  const depth=await import('/scene-depth.js');depth.bindSceneDepth(document.querySelector('main'));
 });await page.waitForTimeout(100);
 const z=await page.evaluate(()=>[Number(document.querySelector('.home-person').style.zIndex),Number(document.querySelector('.room-furniture-item').style.zIndex)]);assert(z[0]>z[1],JSON.stringify(z));
 const label=await page.locator('.room-activity-labels .home-person-status').boundingBox();assert(label&&label.y>=250&&label.width>0,JSON.stringify(label));
 console.log('PASS birthday global/town travel limits, positive surprise vs shock, contained bed art foreground',result,z);
}finally{await browser.close();server.close()}
