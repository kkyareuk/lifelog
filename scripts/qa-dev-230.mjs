import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";
import {execFile} from "node:child_process";
import {promisify} from "node:util";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright"),output=resolve(root,"qa-output-230");
const exec=promisify(execFile);
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body;
    if(pathname==="/auth.js")body=previewAuth;
    else try{body=await readFile(file)}catch(error){
      if(error.code!=="EPERM")throw error;
      body=(await exec("git",["show",`HEAD:${pathname.slice(1)}`],{cwd:root,encoding:"buffer",maxBuffer:32*1024*1024})).stdout;
    }
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(resolveListen=>server.listen(0,"127.0.0.1",resolveListen));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

async function preparedPage(width,height){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
  await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(`${origin}/?native-preview=1`);await page.waitForFunction(()=>window.ParallelCity);
  await page.evaluate(async()=>{
    const url=performance.getEntriesByType("resource").find(item=>/\/state\.js\?/.test(item.name)).name,game=await import(url);
    game.resetAll();game.createCharacter();const first=game.state.activeId;game.createCharacter();const second=game.state.activeId;
    Object.assign(game.state.characters[first],{name:"크로",job:"해적",jobTitle:"쿠로네코 해적단 선장"});
    Object.assign(game.state.characters[second],{name:"네리네",job:"여관주인"});
    game.addRelationship({a:first,b:second,type:"친구",stage:"편한 친구"});game.addTownDecoration("flowers");
    game.state.uiLanguage="ko";game.save(true);
    for(const tab of ["observe","home","relationship","town","character","catalog"])await window.ParallelCityAuth.markGuideSeen(tab);
  });
  return {context,page,errors};
}
const go=async(page,tab)=>{await page.evaluate(value=>{location.hash=`tab=${value}`},tab);await page.waitForFunction(value=>document.documentElement.dataset.activeTab===value,tab);await page.waitForTimeout(180)};
const openFullCharacterSettings=async page=>{await page.locator(".tablet-character-setting-actions [data-open-full-character-settings]").click();await page.waitForTimeout(180)};

try{
  const landscape=await preparedPage(1205,753),page=landscape.page;
  await go(page,"character");await openFullCharacterSettings(page);
  const book=page.locator(".character-editor-tablet-landscape .character-book-v8-canvas");await book.waitFor({state:"visible"});
  const bookBox=await book.boundingBox();assert.ok(bookBox.width>=700&&bookBox.height>=700,"가로 태블릿 책이 화면 높이를 충분히 사용한다");
  assert.equal(await page.locator(".character-book-spread-leaf").count(),2,"가로 태블릿은 책 양쪽 두 페이지를 표시한다");
  await page.screenshot({path:resolve(output,"tablet-landscape-book.png")});

  await go(page,"catalog");const dictionaryBox=await page.locator(".dictionary-shell").boundingBox();
  assert.ok(dictionaryBox.width>=1150,"가로 태블릿 사전이 불필요한 좌우 여백 없이 펼쳐진다");
  await page.screenshot({path:resolve(output,"tablet-landscape-dictionary.png")});

  await go(page,"relationship");await page.locator("[data-open-official-relations]").click();
  const relationDialog=page.locator("[data-official-relation-dialog]");await relationDialog.waitFor({state:"visible"});
  const relationBox=await relationDialog.locator(":scope > form").boundingBox();assert.ok(relationBox.width>=1100,"공식 관계 목록이 태블릿 폭을 활용한다");
  await page.screenshot({path:resolve(output,"tablet-landscape-relationships.png")});
  await relationDialog.locator(".relationship-back-button").click();

  await go(page,"observe");
  const decoration=page.locator(".tablet-observe-world .town-decoration").first();await decoration.waitFor({state:"visible"});
  const decorationStyle=await decoration.evaluate(node=>{const style=getComputedStyle(node);return {background:style.backgroundColor,border:style.borderTopWidth,outline:style.outlineWidth,shadow:style.boxShadow}});
  assert.equal(decorationStyle.background,"rgba(0, 0, 0, 0)");assert.equal(decorationStyle.border,"0px");assert.equal(decorationStyle.outline,"0px");assert.equal(decorationStyle.shadow,"none");
  const faceStyle=await page.locator(".tablet-observe-world .place-person-face").first().evaluate(node=>{const style=getComputedStyle(node);return {background:style.backgroundColor,border:style.borderTopWidth,shadow:style.boxShadow}});
  assert.equal(faceStyle.background,"rgba(0, 0, 0, 0)");assert.equal(faceStyle.border,"0px");assert.equal(faceStyle.shadow,"none");
  await page.locator(".game-hud-character-command").click();const activityMenu=page.locator(".home-occupant-popover.show");await activityMenu.waitFor({state:"visible"});assert.ok(await activityMenu.locator("[data-direct-activity]").count()>=6,"관찰 화면에서 깨우기와 활동 선택 메뉴를 연다");
  await page.screenshot({path:resolve(output,"tablet-landscape-observe.png")});
  assert.deepEqual(landscape.errors,[]);await landscape.context.close();

  const portrait=await preparedPage(753,1205);await go(portrait.page,"character");await openFullCharacterSettings(portrait.page);
  const portraitBook=portrait.page.locator(".character-editor-tablet-portrait-full .character-book-v8-canvas");await portraitBook.waitFor({state:"visible"});
  const portraitBox=await portraitBook.boundingBox();assert.ok(portraitBox.height>=1120,"세로 태블릿 책이 목록에 눌리지 않고 화면 높이를 사용한다");
  assert.equal(await portrait.page.locator(".character-editor-tablet-portrait-full .desktop-character-list").count(),0,"세로 전체 설정에서 캐릭터 목록이 책을 축소하지 않는다");
  await portrait.page.screenshot({path:resolve(output,"tablet-portrait-book.png")});assert.deepEqual(portrait.errors,[]);await portrait.context.close();
  console.log("PASS visual 230: tablet books, wide lists, transparent town art, and character activity menu");
}finally{await browser.close();server.close()}
