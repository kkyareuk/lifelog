import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";
import {execFile} from "node:child_process";
import {promisify} from "node:util";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright"),output=resolve(root,"qa-output-234");
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
const openFullCharacterSettings=async page=>{await page.locator(".character-full-choice[data-open-full-character-settings]").click();await page.waitForTimeout(180)};

try{
  const landscape=await preparedPage(1205,753),page=landscape.page;
  await go(page,"character");
  const dashboard=page.locator('.character-editor-hub-only .mobile-character-dashboard[data-character-ui-version="8"]');await dashboard.waitFor({state:"visible"});
  const dashboardBox=await dashboard.boundingBox(),listBox=await page.locator(".character-editor-hub-only .desktop-character-list").boundingBox();
  assert.ok(dashboardBox.width>=330&&dashboardBox.width<=350&&dashboardBox.height>=750,"가로 태블릿 오른쪽에 휴대폰 캐릭터 화면 비율을 유지한다");
  assert.ok(dashboardBox.x>=listBox.x+listBox.width,"휴대폰 캐릭터 화면은 iPad식 목록 오른쪽에 배치된다");
  for(const selector of [".character-registration-card",".character-setting-book",".character-quick-choice",".character-full-choice"]){await page.locator(selector).waitFor({state:"visible"})}
  assert.equal(await page.locator(".character-editor-hub-only .tablet-character-summary").isVisible(),false,"별도 태블릿 요약 카드는 표시하지 않는다");
  await page.screenshot({path:resolve(output,"tablet-landscape-character-phone-hub.png")});
  await openFullCharacterSettings(page);
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
  const mapBox=await page.locator(".tablet-observe-map").boundingBox();assert.ok(mapBox.x>=16&&mapBox.x<=20&&mapBox.y>=110&&mapBox.y<=114&&mapBox.width>=650&&mapBox.width<=710,"가로 홈의 마을 지도는 원래 iPad식 왼쪽 패널에 머문다");
  const copyBox=await page.locator(".game-hud-profile-copy").boundingBox(),profileBox=await page.locator(".game-hud-profile").boundingBox();assert.ok(copyBox.x-profileBox.x>=82&&copyBox.x-profileBox.x<=94,"이름과 직업이 프로필 아이콘 바로 옆에 정렬된다");
  const sceneBox=await page.locator(".game-observe-hud > .native-observe-backdrop").boundingBox();assert.ok(sceneBox.x>=720&&sceneBox.width>=480,"선택 캐릭터 장면은 오른쪽 패널에 유지된다");
  const decoration=page.locator(".tablet-observe-world .town-decoration").first();await decoration.waitFor({state:"visible"});
  const decorationStyle=await decoration.evaluate(node=>{const style=getComputedStyle(node);return {background:style.backgroundColor,border:style.borderTopWidth,outline:style.outlineWidth,shadow:style.boxShadow}});
  assert.equal(decorationStyle.background,"rgba(0, 0, 0, 0)");assert.equal(decorationStyle.border,"0px");assert.equal(decorationStyle.outline,"0px");assert.equal(decorationStyle.shadow,"none");
  const faceStyle=await page.locator(".tablet-observe-world .place-person-face").first().evaluate(node=>{const style=getComputedStyle(node);return {background:style.backgroundColor,border:style.borderTopWidth,shadow:style.boxShadow}});
  assert.equal(faceStyle.background,"rgba(0, 0, 0, 0)");assert.equal(faceStyle.border,"0px");assert.equal(faceStyle.shadow,"none");
  await page.locator(".game-hud-character-command").click();const activityMenu=page.locator(".home-occupant-popover.show");await activityMenu.waitFor({state:"visible"});assert.ok(await activityMenu.locator("[data-direct-activity]").count()>=6,"관찰 화면에서 깨우기와 활동 선택 메뉴를 연다");
  await page.screenshot({path:resolve(output,"tablet-landscape-observe.png")});
  await go(page,"town");
  const townMapBox=await page.locator(".mobile-town-shell .town-map-scroll").boundingBox();assert.ok(townMapBox.x<=1&&townMapBox.y<=1&&townMapBox.width>=1203&&townMapBox.height>=751,"가로 태블릿 마을 지도가 화면 전체를 채운다");
  const townHeaderBox=await page.locator(".mobile-town-shell .town-native-header").boundingBox();assert.ok(townHeaderBox.x<=1&&townHeaderBox.width>=1203,"가로 태블릿 마을 상단바가 오른쪽 끝까지 이어진다");
  const townDecoration=page.locator(".mobile-town-shell .town-decoration").first();await townDecoration.waitFor({state:"visible"});
  const townDecorationStyle=await townDecoration.evaluate(node=>{const style=getComputedStyle(node);return {background:style.backgroundColor,border:style.borderTopWidth,outline:style.outlineWidth,shadow:style.boxShadow}});
  assert.deepEqual(townDecorationStyle,{background:"rgba(0, 0, 0, 0)",border:"0px",outline:"0px",shadow:"none"});
  await page.screenshot({path:resolve(output,"tablet-landscape-town.png")});
  assert.deepEqual(landscape.errors,[]);await landscape.context.close();

  const portrait=await preparedPage(753,1205);await go(portrait.page,"character");
  const portraitDashboard=portrait.page.locator('.character-editor-hub-only .mobile-character-dashboard[data-character-ui-version="8"]');await portraitDashboard.waitFor({state:"visible"});
  assert.equal(await portrait.page.locator(".character-editor-hub-only .desktop-character-list").isVisible(),false,"세로 태블릿은 별도 목록 없이 휴대폰 캐릭터 화면을 쓴다");
  assert.ok((await portraitDashboard.boundingBox()).width>=750,"세로 태블릿 캐릭터 허브가 휴대폰 구조로 화면을 채운다");
  await portrait.page.screenshot({path:resolve(output,"tablet-portrait-character-phone-hub.png")});
  await openFullCharacterSettings(portrait.page);
  const portraitBook=portrait.page.locator(".character-editor-full-only .character-book-v8-canvas");await portraitBook.waitFor({state:"visible"});
  assert.equal(await portrait.page.locator(".character-editor-tablet-portrait-full").count(),0,"세로 태블릿은 태블릿 전용 책을 만들지 않는다");
  await portrait.page.screenshot({path:resolve(output,"tablet-portrait-phone-book.png")});
  await portrait.page.locator(".character-book-v8-back").click();await portrait.page.waitForTimeout(180);
  await go(portrait.page,"observe");
  const portraitCopy=await portrait.page.locator(".game-hud-profile-copy").boundingBox(),portraitProfile=await portrait.page.locator(".game-hud-profile").boundingBox();
  assert.ok(portraitCopy.x-portraitProfile.x>=100&&portraitCopy.x-portraitProfile.x<=108,"세로 태블릿 이름과 직업이 프로필 옆에 정렬된다");
  const clippedLabels=await portrait.page.locator(".game-hud-side button>small>span,.game-hud-dock button>small>span").evaluateAll(nodes=>nodes.filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>node.textContent));
  assert.deepEqual(clippedLabels,[],"세로 태블릿 메뉴 글자가 한 글자로 잘리지 않는다");
  await portrait.page.screenshot({path:resolve(output,"tablet-portrait-observe-phone-layout.png")});
  await go(portrait.page,"home");assert.equal(await portrait.page.locator(".home-native-tablet-info").isVisible(),false,"세로 집 화면은 iPad 정보 패널을 표시하지 않는다");
  await portrait.page.screenshot({path:resolve(output,"tablet-portrait-home-phone-layout.png")});
  await go(portrait.page,"town");assert.ok((await portrait.page.locator(".town-map-scroll").boundingBox()).width>=750,"세로 마을은 휴대폰 지도 구조로 표시된다");
  await portrait.page.screenshot({path:resolve(output,"tablet-portrait-town-phone-layout.png")});
  assert.deepEqual(portrait.errors,[]);await portrait.context.close();
  console.log("PASS visual 234: landscape iPad split + phone character hub, portrait phone layouts, unclipped labels, and transparent town art");
}finally{await browser.close();server.close()}
