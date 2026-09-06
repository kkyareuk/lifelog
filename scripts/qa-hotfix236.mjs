import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright"),output=resolve(root,"qa-output-236");
await mkdir(output,{recursive:true});
const mime={".html":"text/html",".css":"text/css",".png":"image/png",".woff2":"font/woff2",".ttf":"font/ttf"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+pathname);
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(await readFile(file));
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});
try{
  const page=await browser.newPage({viewport:{width:384,height:832},hasTouch:true,deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${server.address().port}/scripts/qa-hotfix236.html`);
  const form=page.locator(".relationship-viewpoint-dialog>form"),last=page.locator("[data-last-view-field]");
  const before=await form.evaluate(node=>({clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,scrollTop:node.scrollTop,touchAction:getComputedStyle(node).touchAction,overflowY:getComputedStyle(node).overflowY}));
  assert.equal(before.overflowY,"auto");assert.ok(before.touchAction.includes("pan-y"));assert.ok(before.scrollHeight>before.clientHeight,"lower gaze fields must create scrollable height");
  await page.screenshot({path:resolve(output,"relationship-viewpoint-before-scroll.png")});
  await form.evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:"instant"}));
  await page.waitForTimeout(80);
  const after=await form.evaluate(node=>({scrollTop:node.scrollTop,max:node.scrollHeight-node.clientHeight}));
  const lastBox=await last.boundingBox();
  assert.ok(after.scrollTop>0&&after.scrollTop>=after.max-2,"viewpoint form must reach its bottom");
  assert.ok(lastBox&&lastBox.y<832&&lastBox.y+lastBox.height>0,"last gaze setting must be visible after scrolling");
  await page.screenshot({path:resolve(output,"relationship-viewpoint-after-scroll.png")});
  console.log("PASS visual hotfix 236: 384x832 relationship viewpoint reaches the last field");
}finally{await browser.close();server.close()}
