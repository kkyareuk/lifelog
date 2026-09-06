import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const mime={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(await readFile(file));
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true}),base=`http://127.0.0.1:${server.address().port}`;
const loadMode=async(page,url)=>{
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});
  await page.goto(url);
  try{await page.waitForFunction(()=>document.documentElement.dataset.ready==="1",null,{timeout:10000})}
  catch(error){throw new Error(`mode fixture did not initialize: ${errors.join(" | ")||error.message}`)}
  return page.evaluate(()=>window.shouldRenderTabletObserveMapResult);
};
try{
  const audioContext=await browser.newContext({viewport:{width:384,height:784},screen:{width:384,height:832}}),audioPage=await audioContext.newPage();
  await audioPage.goto(`${base}/scripts/qa-hotfix240-audio.html`);
  await audioPage.locator("html[data-ready='1']").waitFor();
  assert.equal(await audioPage.evaluate(()=>window.createdMovementAudio.length),1,"only the visible home actor may create a movement-audio channel");
  await audioContext.close();

  const phoneContext=await browser.newContext({viewport:{width:384,height:784},screen:{width:384,height:832},hasTouch:true}),phone=await phoneContext.newPage();
  assert.equal(await loadMode(phone,`${base}/scripts/qa-hotfix240-mode.html?native-preview=1`),false,"phone Observe must reject the tablet town simulation");
  await phoneContext.close();

  const tabletContext=await browser.newContext({viewport:{width:1205,height:753},screen:{width:1205,height:753},hasTouch:true}),tablet=await tabletContext.newPage();
  assert.equal(await loadMode(tablet,`${base}/scripts/qa-hotfix240-mode.html?native-preview=1`),true,"tablet landscape Observe must retain its intentional town map");
  await tabletContext.close();
  console.log("PASS visual/runtime hotfix 240: phone town DOM absent, hidden actors silent, tablet landscape map retained");
}finally{await browser.close();server.close()}
