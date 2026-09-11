import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-context339");
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
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();window.DrawerVillageNavigation.go('home')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

const check=await page.evaluate(async()=>{
 const sim=await import('/simulation.js?v=20260909dev305');const a=g.active();
 a.wake='11:00';a.sleep='23:00';const date=new Date(2026,8,14,10,0);a.createdAt=1;
 g.state.characterDirectives={};g.state.dailyPlans={};g.state.routines[a.id]=[{id:'qa-school',day:1,start:'09:00',end:'15:00',type:'개인 일정',title:'학교 수업',placeId:g.state.world.places[0].id,withIds:[]}];g.state.monthlyRoutines[a.id]=[];
 const e=sim.eventFor(a,date);return {routine:e.routineId,title:e.title,place:e.placeId,want:g.state.world.places[0].id};
});console.log(check);assert.equal(check.routine,'qa-school');assert.equal(check.place,check.want);
console.log('PASS next-day schedule takes priority over habitual sleep');
assert(!errors.length,errors.join('\n'));console.log('PASS schedule runtime without overnight app activity');
}finally{await browser.close();server.close()}
