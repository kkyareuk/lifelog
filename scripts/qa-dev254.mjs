import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-254");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    const body=pathname==="/auth.js"?previewAuth:await readFile(file);
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
  const context=await browser.newContext({viewport:{width:384,height:784},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType("resource").find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    game.resetAll();game.createCharacter();const a=game.state.activeId,home=game.state.characters[a].homeId;
    game.createCharacter();const b=game.state.activeId;
    Object.assign(game.state.characters[a],{name:"안테",job:"연구원"});Object.assign(game.state.characters[b],{name:"네리네",job:"여관주인"});
    game.setHomeResidents(home,[a,b]);game.state.activeId=a;game.state.activeHomeId=home;game.state.activeTab="home";game.save(true);
    for(const tab of ["home","character"])await window.ParallelCityAuth.markGuideSeen(tab);
    location.hash="tab=home";
  });
  await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.activeTab==="home");
  const occupant=page.locator('[data-home-occupant="character"]').first();await occupant.waitFor({state:"visible"});await occupant.click();
  const sheet=page.locator("[data-home-occupant-sheet]");await sheet.waitFor({state:"visible"});await sheet.locator('[data-direct-category="social"]').click();
  const popup=sheet.locator('[data-direct-panel="social"]');await popup.waitFor({state:"visible"});
  const geometry=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth,sheet:(()=>{const node=document.querySelector("[data-home-occupant-sheet]");const box=node.getBoundingClientRect();return {left:box.left,right:box.right,scroll:node.scrollWidth,client:node.clientWidth}})()}));
  assert.ok(geometry.body<=geometry.viewport+1,"직접 행동 팝업이 모바일 화면 밖으로 뚫고 나가지 않는다");
  assert.ok(geometry.sheet.left>=0&&geometry.sheet.right<=geometry.viewport+1&&geometry.sheet.scroll<=geometry.sheet.client+1,"직접 행동 시트가 화면 안에 들어온다");
  assert.ok(await popup.locator("[data-direct-target]").count()>=1,"사교 행동에서 상대를 고를 수 있다");
  assert.ok(await popup.locator('[data-direct-social-action="talk"]').count()===1,"사교 대화 행동이 표시된다");
  await page.screenshot({path:resolve(output,"phone-direct-social.png"),fullPage:true});

  await page.keyboard.press("Escape");await page.evaluate(()=>{location.hash="tab=character"});
  await page.waitForFunction(()=>document.documentElement.dataset.activeTab==="character");
  await page.locator("dialog.page-guide[open]").evaluateAll(nodes=>nodes.forEach(node=>node.close()));
  await page.locator('.character-full-choice[data-open-full-character-settings]').click();await page.locator('[data-character-pane="body"]').last().evaluate(node=>node.click());
  const summary=page.locator('[data-open-body-choice="appearanceSummaries"]');await summary.waitFor({state:"visible"});await summary.click();
  const dialog=page.locator('[data-body-choice-dialog]');await dialog.waitFor({state:"visible"});
  const option=dialog.locator('[data-body-choice-panel="appearanceSummaries"] [data-body-list]').first(),chosen=await option.getAttribute("data-value");await option.click();await dialog.locator('button[value="close"]').first().click();
  assert.ok((await summary.textContent()).includes(chosen),"총평 선택 직후 요약에 반영된다");
  await page.reload();await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(()=>{location.hash="tab=character"});await page.waitForFunction(()=>document.documentElement.dataset.activeTab==="character");
  await page.locator("dialog.page-guide[open]").evaluateAll(nodes=>nodes.forEach(node=>node.close()));
  await page.locator('.character-full-choice[data-open-full-character-settings]').click();await page.locator('[data-character-pane="body"]').last().evaluate(node=>node.click());
  assert.ok((await page.locator('[data-open-body-choice="appearanceSummaries"]').textContent()).includes(chosen),"화면을 나갔다 돌아와도 총평이 유지된다");
  await page.screenshot({path:resolve(output,"phone-body-summary-persisted.png"),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log("PASS visual 254: custom direct-action popup stays in viewport and body summary survives reload");
  await context.close();
}finally{await browser.close();server.close()}
