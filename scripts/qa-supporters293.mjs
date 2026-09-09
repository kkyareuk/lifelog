import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-293");
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
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
 const page=await browser.newPage({viewport:{width:360,height:840}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);window.views=await import(url.replace('/state.js?','/views.js?'));window.credits=await import(url.replace('/state.js?','/supporter-credits.js?'));game.createCharacter(10);game.state.activeTab='settings';game.state.settingsPane='home';views.renderApp(game.state)});
 await page.locator('[data-supporter-menu=editor]').click();
 await page.getByLabel('표시 이름',{exact:true}).fill('빛나는 서랍');
 await page.getByLabel('미리보기 누적 금액',{exact:false}).fill('100000');
 await page.getByLabel('글자 효과',{exact:false}).selectOption('neon');
 assert.equal(await page.locator('.supporter-stage [data-effect=neon]').count(),1);
 await page.getByRole('button',{name:'초안 저장',exact:true}).click();
 await page.locator('[data-supporter-close]').click();await page.locator('[data-supporter-menu=editor]').click();assert.equal(await page.getByLabel('표시 이름',{exact:true}).inputValue(),'빛나는 서랍');
 await page.screenshot({path:resolve(output,'supporter-editor-phone.png')});
 await page.locator('[data-supporter-close]').click();await page.locator('[data-supporter-menu=credits]').click();assert.equal(await page.locator('.supporter-name').count(),0);await page.locator('[data-supporter-close]').click();
 await page.evaluate(()=>{game.state.animationIntensity='normal';credits.openSupporterCredits({entries:[{id:'example1',name:'서랍의 반딧불',effect:'neon',background:'fireflies',color:'#ab426a',color2:'#ad7645',animate:true,size:32},{id:'example2',name:'<img src=x>',effect:'gradient',background:'starlight',animate:true,size:24}]})});
 assert.equal(await page.locator('.supporter-dialog img').count(),0);assert.ok(await page.locator('.supporter-stage').evaluate(e=>e.getAnimations({subtree:true}).length)>0);
 await page.getByRole('button',{name:'효과 일시정지',exact:true}).click();assert.equal(await page.locator('.supporter-stage').evaluate(e=>e.getAnimations({subtree:true}).length),0);
 assert.ok(await page.locator('.supporter-dialog').evaluate(e=>e.getBoundingClientRect().right<=innerWidth));await page.screenshot({path:resolve(output,'supporter-credits-phone.png')});assert.deepEqual(errors,[]);console.log('PASS credits settings entry, draft persistence, empty shipped list, safe text, animations, pause, mobile bounds');
}finally{await browser.close();server.close()}
