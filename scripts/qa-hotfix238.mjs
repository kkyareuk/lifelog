import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright"),output=resolve(root,"qa-output-238");
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
  const page=await browser.newPage({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${server.address().port}/scripts/qa-hotfix238.html`);
  const editor=page.locator("[data-home-layout-editor]"),save=page.locator("[data-home-layout-save]");
  const initial=await editor.evaluate(node=>({clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,overflowY:getComputedStyle(node).overflowY}));
  assert.equal(initial.overflowY,"auto");
  assert.ok(initial.scrollHeight>initial.clientHeight,"editor must remain vertically scrollable on the reported viewport");
  const initialSaveBox=await save.boundingBox();
  assert.ok(initialSaveBox&&initialSaveBox.y>=72&&initialSaveBox.y+initialSaveBox.height<=784,"sticky save button must be visible as soon as the editor opens");
  await page.screenshot({path:resolve(output,"character-layout-save-initial-384x784.png")});
  await editor.evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:"instant"}));
  await page.waitForTimeout(80);
  const editorBox=await editor.boundingBox(),saveBox=await save.boundingBox();
  assert.ok(saveBox&&editorBox,"save button and editor must render");
  assert.ok(saveBox.y>=editorBox.y&&saveBox.y+saveBox.height<=784,"save button must be fully visible above the Android navigation area");
  assert.ok(saveBox.width>=340&&saveBox.height>=48,"save action must be a large touch target");
  await page.screenshot({path:resolve(output,"character-layout-save-384x784.png")});
  console.log("PASS visual hotfix 238: placement save action is visible at 384x784");
}finally{await browser.close();server.close()}
