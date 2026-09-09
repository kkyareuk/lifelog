import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import {bedPerspective,bedPillowPoint} from '../bed-perspective.js';
const root=resolve('.'),output=resolve('qa-output-268');await mkdir(output,{recursive:true});
const {chromium}=createRequire(import.meta.url)('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+path);if(!file.startsWith(root))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[extname(file)]||'application/octet-stream');res.end(await readFile(file))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [384,753])for(const [rotation,flipped] of [[0,false],[90,false],[-90,false],[90,true],[180,false]]){
  const p=bedPerspective({rotation,flipped});if(p.side)assert.equal(bedPillowPoint(p,0).y<bedPillowPoint(p,1).y,p.direction===1);
  const page=await browser.newPage({viewport:{width,height:853}});await page.goto(`http://127.0.0.1:${server.address().port}/scripts/qa-bed-conversation226.html`);
  await page.evaluate(async({p})=>{
   document.body.className='home-page';document.body.id='app';const bed=document.querySelector('[data-furniture-placement]');bed.dataset.bedSide=String(p.side);bed.dataset.bedDirection=String(p.direction);
   document.querySelectorAll('.room-furniture-item,.room-couple-bed-overlay').forEach(e=>{e.style.setProperty('--furniture-rotation',p.artRotation+'deg');e.style.setProperty('--furniture-flip',p.artFlip)});
   for(const image of document.querySelectorAll('.couple-bed-layer')){const layer=['base','quilt','footboard'].find(x=>image.classList.contains('couple-bed-'+x));image.src='/assets/furniture/couple-bed/couple-bed-'+(p.side?'side-':'')+layer+(p.side?'.svg':'.png');await image.decode()}
   document.querySelectorAll('.home-person').forEach((e,i)=>{e.style.setProperty('--couple-bed-character-rotation',p.characterRotation+'deg');e.classList.remove('is-bed-conversation');e.classList.add('is-sleeping','scene-action-sleep');const image=document.createElement('img');image.className='sprite';image.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><circle cx="30" cy="30" r="27" fill="${i?'#b6d6c7':'#c9dafa'}" stroke="#432c20" stroke-width="3"/><path d="M11 24Q30 8 49 24" fill="none" stroke="#432c20" stroke-width="7"/><path d="M17 33h7m12 0h7M25 43h10" stroke="#432c20" stroke-width="3"/></svg>`);e.querySelector('.home-person-visual').replaceChildren(image)});
   const {fitCoupleBedOccupants}=await import('/home-editor-ui.js?v=20260909dev297');fitCoupleBedOccupants(document);
  },{p});
  const result=await page.locator('.home-person').evaluateAll(es=>es.map(e=>({x:parseFloat(e.style.getPropertyValue('--life-x')),y:parseFloat(e.style.getPropertyValue('--life-y')),z:Number(e.style.zIndex),angle:getComputedStyle(e.querySelector('.home-person-visual')).rotate})));
  if(p.side){assert.equal(result[0].y<result[1].y,p.direction===1);assert.equal(result[0].z<result[1].z,p.direction===1);assert.equal(result[0].angle,p.characterRotation+'deg')}
  if(width===384)await page.screenshot({path:resolve(output,`bed-${rotation}-${flipped}.png`)});
  await page.close();
 }
 console.log('PASS bed front/right/left/flipped/reversed, saved side order, pillow alignment and sleeper direction at phone/tablet widths');
}finally{await browser.close();server.close()}
