import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=resolve('.'),out=resolve('qa-log-audit');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error();let body=await readFile(pathname==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(body)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const count of [20,80]){
  const p=await browser.newPage({viewport:{width:412,height:917},hasTouch:true}),errors=[];p.setDefaultTimeout(60000);p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity);
  await p.evaluate(async count=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const u=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;const game=await import(u);for(let i=0;i<count;i++)game.createCharacter(200);game.state.activeTab='observe';window.ParallelCity.mediaChanged();window.testGame=game;},count);
  await p.waitForTimeout(1600);
  const result=await p.evaluate(()=>{
    document.querySelectorAll('dialog[open]').forEach(d=>d.close());
    const samples=[],state=testGame.state;
    const gesture=(dx,dy=0,onButton=false)=>{
      const hud=document.querySelector('.game-observe-hud'),target=onButton?hud.querySelector('button'):hud;
      const touch=(x,y)=>new Touch({identifier:1,target,clientX:x,clientY:y});
      target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(310,400)]}));
      target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[touch(310+dx,400+dy)]}));
    };
    const ids=[...document.querySelectorAll('.game-hud-roster-options [data-home-character]')].map(b=>b.dataset.homeCharacter);
    for(let i=0;i<6;i++){
      const old=state.activeId,index=ids.indexOf(old),direction=i%2?-1:1,start=performance.now();gesture(direction===1?-210:210);
      samples.push({ms:performance.now()-start,correct:state.activeId===ids[(index+direction+ids.length)%ids.length]});
    }
    const old=state.activeId;gesture(10,160);const verticalIgnored=state.activeId===old;gesture(-210,0,true);const buttonIgnored=state.activeId===old;
    return {samples,verticalIgnored,buttonIgnored};
  });
  assert(result.samples.every(s=>s.correct));assert(result.verticalIgnored&&result.buttonIgnored);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({count,...result}));await p.screenshot({path:out+`/swipe-${count}.png`});await p.close();
 }
}finally{await browser.close();server.close()}
