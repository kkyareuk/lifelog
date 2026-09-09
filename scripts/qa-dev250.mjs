import assert from "node:assert/strict";
import {createServer} from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const mime={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=createServer(async(request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+pathname);if(!file.startsWith(root+sep))return response.writeHead(404).end();const body=await readFile(file);response.writeHead(200,{"Content-Type":mime[extname(file)]||"application/octet-stream","Cache-Control":"no-store"}).end(body)}catch{if(!response.headersSent)response.writeHead(404);response.end()}});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const output=resolve("qa-output-250");await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});
try{
  const result={};
  for(const view of ["town","shop","groups"]){
    const page=await browser.newPage({viewport:{width:384,height:784},deviceScaleFactor:1});
    await page.goto(`http://127.0.0.1:${server.address().port}/scripts/qa-dev250-shop-multiplayer.html?view=${view}`,{waitUntil:"networkidle"});
    await page.screenshot({path:resolve(output,`${view}-phone.png`),fullPage:false});
    result[view]=await page.locator(".phone.target").evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth}));
    if(view==="shop")result.seller=await page.locator(".drawer-shop-seller").evaluate(seller=>({complete:seller.complete,naturalWidth:seller.naturalWidth,naturalHeight:seller.naturalHeight}));
    if(view==="town")result.locationFit=await page.locator(".game-hud-location img").evaluate(location=>getComputedStyle(location).objectFit);
    if(view==="groups"){
      result.preview=await page.locator(".multiplayer-town-preview img").evaluate(preview=>({width:preview.getBoundingClientRect().width,height:preview.getBoundingClientRect().height,containerHeight:preview.parentElement.getBoundingClientRect().height}));
      result.groupHeader=await page.locator(".multiplayer-catalog-head h1").evaluate(title=>{const rect=title.getBoundingClientRect(),style=getComputedStyle(title);return {x:rect.x,y:rect.y,width:rect.width,height:rect.height,display:style.display,writingMode:style.writingMode,fontSize:style.fontSize,lineHeight:style.lineHeight}});
    }
    await page.close();
  }
  result.townHeaders=[];
  for(const [name,width,height,expectedTitleX] of [["phone",384,784,384*.2427],["tablet-portrait",1205,1848,124],["tablet-landscape",1205,753,106]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    await page.goto(`http://127.0.0.1:${server.address().port}/scripts/qa-dev250-shop-multiplayer.html?view=town`,{waitUntil:"networkidle"});
    const measured=await page.evaluate(()=>{const title=document.querySelector(".town-native-community>span").getBoundingClientRect(),pill=document.querySelector(".town-native-town-pill").getBoundingClientRect(),back=document.querySelector(".town-native-back").getBoundingClientRect();return {titleX:title.x,pillX:pill.x,backRight:back.right}});
    assert.ok(Math.abs(measured.titleX-expectedTitleX)<=1.5,`${name}: ${JSON.stringify(measured)}`);
    assert.ok(measured.titleX>=measured.backRight+8,`${name}: title must not overlap back button`);
    result.townHeaders.push({name,...measured});await page.close();
  }
  assert.ok(result.seller.complete&&result.seller.naturalWidth===1191&&result.seller.naturalHeight===1459);
  assert.equal(result.locationFit,"contain");
  assert.ok([result.shop,result.groups].every(item=>item.scrollWidth<=item.clientWidth+2),JSON.stringify(result));
  assert.ok(result.preview.height<=result.preview.containerHeight+1);
  console.log(JSON.stringify(result,null,2));
  console.log("PASS dev 250 visual QA");
}finally{await browser.close();server.close()}
