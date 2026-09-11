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
 const page=await browser.newPage({viewport:{width:384,height:854}});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);
for(const language of ['ko','en','ja']){for(const grouped of [false,true]){
await page.evaluate(async({language,grouped})=>{
 const g=await import('/state.js?v=20260909dev305'),m=await import('/mailbox-center.js?v=20260909dev305');g.state.uiLanguage=language;g.state.activeTab='mailbox';
 window.DrawerVillageGroups={getSnapshot:()=>({incomingMail:[{id:'notice-qa',announcement:true,senderUid:'qa-admin',senderDisplayName:'서랍마을',subject:'QA notice',body:'Test',createdAt:Date.now(),...(grouped?{groupId:'qa-group'}:{})}]}),refreshMailbox:()=>Promise.resolve()};
 document.body.innerHTML=m.renderMailbox();m.bindMailbox(()=>{},()=>{});
}, {language,grouped});
await page.locator('[data-mail-open]').first().click();
const address=await page.locator('.mail-address').innerText();assert(address.includes('서랍마을'));assert(address.includes(grouped?({ko:'그룹 구성원',en:'Group members',ja:'グループメンバー'})[language]:({ko:'전체 이용자',en:'All players',ja:'すべてのユーザー'})[language]));await page.locator('[data-close-mail]').click();
}}
 console.log('PASS announcement sender and global/group recipient KO EN JA');
}finally{await browser.close();server.close()}


