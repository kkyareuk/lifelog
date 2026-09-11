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
 const page=await browser.newPage({viewport:{width:1280,height:850}});const calls=[];
 await page.route('**/firebase-app.js',r=>r.fulfill({contentType:'text/javascript',body:'export const initializeApp=()=>({});'}));
 await page.route('**/firebase-auth.js',r=>r.fulfill({contentType:'text/javascript',body:`const user={email:'kkyaareuk@gmail.com',getIdToken:async()=>'TEST'};const auth={currentUser:user};export const getAuth=()=>auth;export class GoogleAuthProvider{};export const signInWithPopup=async()=>{};export const signOut=async()=>{};export const onAuthStateChanged=(a,cb)=>setTimeout(()=>cb(user),0);`}));
 await page.route('**/notice-admin/*',async r=>{const action=r.request().url().split('/').pop(),input=r.request().postDataJSON();calls.push(action);await r.fulfill({contentType:'application/json',body:JSON.stringify(action==='list'?{drafts:[]}:action==='save'?{...input,revision:1}:{published:true})})});
 await page.goto(origin+'/notice-site/index.html');await page.locator('#review').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('#review').disabled);
 await page.screenshot({path:resolve(output,'notice347-desktop.png'),fullPage:true});
 await page.locator('#save').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('아직 발송'));
 assert(!calls.includes('publish'));
 await page.locator('#review').click();await page.locator('#preview').waitFor({state:'visible'});assert(!calls.includes('publish'));
 await page.locator('#cancel').click();assert(!calls.includes('publish'));
 await page.locator('#review').click();await page.locator('#preview').waitFor({state:'visible'});await page.locator('#send').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('발송했어요'));
 assert.equal(calls.filter(x=>x==='publish').length,1);assert(await page.locator('#send').isDisabled());
 console.log('PASS mocked admin UI: save/preview/cancel do not publish; explicit send once');
}finally{await browser.close();server.close()}
