import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const origin=process.env.QA_ORIGIN||"http://127.0.0.1:8768",output=resolve("qa-output-226");
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});
try{
  for(const [name,width,height] of [["phone",384,853],["tablet-portrait",753,1205]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
    const page=await context.newPage();
    await page.goto(`${origin}/scripts/qa-bed-conversation226.html`,{waitUntil:"networkidle"});
    await page.locator(".couple-bed-base").evaluate(image=>image.decode());
    await page.locator(".couple-bed-quilt").evaluate(image=>image.decode());
    await page.evaluate(async()=>{const {fitCoupleBedOccupants}=await import("/home-editor-ui.js?v=20260906dev229");fitCoupleBedOccupants(document)});
    await page.waitForTimeout(80);
    const faces=page.locator(".is-bed-conversation .home-person-visual");
    assert.equal(await faces.count(),2,`${name}: two people remain independently rendered in bed`);
    for(const face of await faces.all())assert.ok((await face.boundingBox()).width>=44,`${name}: bed face is large enough`);
    assert.equal(await page.locator(".home-person-status").count(),0,`${name}: individual status cards are suppressed`);
    assert.equal(await page.locator(".home-bed-foreground-status.is-shared").count(),1,`${name}: one shared status card`);
    const layers=await page.locator(".qa-room").evaluate(room=>({
      people:Number(getComputedStyle(room.querySelector(".room-people")).zIndex),
      bedding:Number(getComputedStyle(room.querySelector(".room-furniture-overlay-layer")).zIndex),
      status:Number(getComputedStyle(room.querySelector(".room-foreground-layer")).zIndex),
      animations:[...room.querySelectorAll(".is-bed-conversation .home-person-visual")].map(node=>getComputedStyle(node).animationName)
    }));
    assert.ok(layers.people<layers.bedding&&layers.bedding<layers.status,`${name}: faces < quilt and frame < shared card`);
    assert.deepEqual(layers.animations,["home-bed-conversation-left","home-bed-conversation-right"],`${name}: dedicated in-bed motion`);
    await page.screenshot({path:resolve(output,`bed-conversation-${name}.png`)});
    await context.close();
  }
  console.log("PASS visual 226: larger pillow-aligned faces remain under the quilt, animate in bed, and share one foreground status card");
}finally{await browser.close()}
