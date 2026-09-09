import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright"),output=resolve(root,"qa-output-242");
await mkdir(output,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2",".ttf":"font/ttf"};
const server=createServer(async(request,response)=>{try{const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+pathname);if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();const body=await readFile(file);response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body)}catch{if(!response.headersSent)response.writeHead(404);response.end()}});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true}),base=`http://127.0.0.1:${server.address().port}`;
try{
  for(const [name,width,height,query] of [["phone",384,784,""],["tablet",1205,753,"?full=1"]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true}),page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`${base}/scripts/qa-dev242-groups.html${query}`);await page.waitForFunction(()=>document.documentElement.dataset.ready==="1");
    const ledger=page.locator(".group-ledger"),box=await ledger.boundingBox(),style=await page.locator(".native-app main").evaluate(node=>getComputedStyle(node).backgroundImage);
    assert.ok(box&&box.width<=width&&box.width>=width*.82,`${name}: 그룹 장부가 화면 폭을 안정적으로 사용한다`);
    assert.match(style,/dictionary\/wood\.webp/,`${name}: 사전과 같은 나무 배경을 쓴다`);
    assert.equal(await page.locator(".group-ledger").evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,`${name}: 장부 내부가 가로로 잘리지 않는다`);
    assert.deepEqual(errors,[],`${name}: 렌더링 오류가 없다`);
    await page.screenshot({path:resolve(output,`groups-${name}.png`),fullPage:true});await context.close();
  }
  console.log("PASS visual dev 242: dictionary-style group UI fits phone and landscape tablet");
}finally{await browser.close();server.close()}
