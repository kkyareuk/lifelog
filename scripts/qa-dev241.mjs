import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const mime={".html":"text/html",".js":"text/javascript",".css":"text/css"};
const server=createServer(async(request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+pathname);if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(await readFile(file))}catch{response.writeHead(404).end()}});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true}),base=`http://127.0.0.1:${server.address().port}`;
const ready=async page=>{await page.waitForFunction(()=>document.documentElement.dataset.ready==="1",null,{timeout:10000})};
try{
  const audioContext=await browser.newContext({viewport:{width:384,height:784},screen:{width:384,height:832}}),audio=await audioContext.newPage();await audio.goto(`${base}/scripts/qa-dev241-audio.html`);await ready(audio);assert.equal(await audio.evaluate(()=>window.createdMovementAudio.length),1);await audioContext.close();
  const phoneContext=await browser.newContext({viewport:{width:384,height:784},screen:{width:384,height:832},hasTouch:true}),phone=await phoneContext.newPage();await phone.goto(`${base}/scripts/qa-dev241-mode.html?native-preview=1`);await ready(phone);assert.equal(await phone.evaluate(()=>window.shouldRenderTabletObserveMapResult),false);await phoneContext.close();
  const tabletContext=await browser.newContext({viewport:{width:1205,height:753},screen:{width:1205,height:753},hasTouch:true}),tablet=await tabletContext.newPage();await tablet.goto(`${base}/scripts/qa-dev241-mode.html?native-preview=1`);await ready(tablet);assert.equal(await tablet.evaluate(()=>window.shouldRenderTabletObserveMapResult),true);await tabletContext.close();
  console.log("PASS dev 241 runtime QA: phone town silent and absent; tablet landscape map retained");
}finally{await browser.close();server.close()}
