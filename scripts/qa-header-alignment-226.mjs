import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const origin=process.env.QA_ORIGIN||"http://127.0.0.1:8768",output=resolve("qa-output-226");
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true}),report=[];
const picture=`${origin}/assets/home-ui/profile-placeholder.png`,house=`${origin}/world-assets/building-types/red-roof-home-handdrawn.png`,town=`${origin}/assets/home-ui/town.png`;
try{
  for(const [name,width,height] of [["phone",592,1285],["tablet-landscape",1205,753]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"}),page=await context.newPage();
    await page.setContent(`<!doctype html><html class="native-app native-platform" data-active-tab="observe"><head><link rel="stylesheet" href="${origin}/app.css?v=20260906dev229"><style>html,body,#app{width:100%;height:100%;margin:0;overflow:hidden}.qa-panel{position:fixed;inset:0;background:#614733}.qa-home,.qa-town{display:none}html[data-active-tab="home"] .qa-home,html[data-active-tab="town"] .qa-town{display:block}html[data-active-tab="home"] .qa-observe,html[data-active-tab="town"] .qa-observe{display:none}</style></head><body><div id="app">
      <section class="qa-panel qa-observe game-observe-hud" data-native-hud-version="4"><div class="game-hud-top"><div class="game-hud-profile"><button class="game-hud-profile-toggle"><span class="game-hud-profile-frame"><img class="avatar" src="${picture}"><img class="game-hud-profile-ring" src="${picture}"></span><span class="game-hud-profile-copy"><b>안테</b><small><em>마레 연구소 이사</em></small></span></button></div><time>오전 12:18</time><small class="game-hud-date">9월 6일 (일)</small></div></section>
      <section class="qa-panel qa-home home-page"><div class="home"><div class="home-native-hud"><div class="home-native-header"><button class="home-native-back"><img src="${picture}"></button><div class="home-native-meta"><button class="home-native-house-name"><img src="${house}"><span>크로네리</span></button><small class="home-native-context">일반 주거 · 1층</small></div></div></div></div></section>
      <section class="qa-panel qa-town"><header class="town-native-header"><button class="home-native-back town-native-back"><img src="${picture}"></button><button class="town-native-title"><img src="${town}"><span class="town-native-name">서랍마을</span></button><span class="town-native-status">현재 10명 · 거주 10명</span></header></section>
    </div></body></html>`,{waitUntil:"networkidle"});
    const measure=async(active,selector)=>{await page.evaluate(value=>document.documentElement.dataset.activeTab=value,active);await page.waitForTimeout(40);return page.locator(selector).evaluate(node=>{const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return {x:rect.x,y:rect.y,fontSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight)}})};
    const observe=await measure("observe",".game-hud-profile-copy>b"),home=await measure("home",".home-native-house-name>span"),townTitle=await measure("town",".town-native-name");
    for(const [label,value] of [["home",home],["town",townTitle]]){
      assert.ok(Math.abs(value.x-observe.x)<=1.5,`${name}: ${label} title x must match observe`);
      assert.ok(Math.abs(value.y-observe.y)<=1.5,`${name}: ${label} title y must match observe (${JSON.stringify({observe,value})})`);
      assert.ok(Math.abs(value.fontSize-observe.fontSize)<=.1,`${name}: ${label} title size must match observe`);
      assert.ok(Math.abs(value.lineHeight-observe.lineHeight)<=.1,`${name}: ${label} title line height must match observe`);
    }
    report.push({name,width,height,observe,home,town:townTitle});
    for(const active of ["observe","home","town"]){await page.evaluate(value=>document.documentElement.dataset.activeTab=value,active);await page.screenshot({path:resolve(output,`header-${name}-${active}.png`)})}
    await context.close();
  }
  await writeFile(resolve(output,"header-alignment.json"),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  console.log("PASS visual 226: observe header stayed at its original anchor; home and town title text match it");
}finally{await browser.close()}
