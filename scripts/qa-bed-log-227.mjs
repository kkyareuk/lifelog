import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const origin=process.env.QA_ORIGIN||"http://127.0.0.1:8768",output=resolve("qa-output-227");
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});
try{
  for(const [name,width,height] of [["phone",384,853],["tablet-portrait",753,1205]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"}),page=await context.newPage();
    await page.goto(`${origin}/scripts/qa-bed-log-227.html`,{waitUntil:"networkidle"});
    await page.locator(".couple-bed-base").evaluate(image=>image.decode());
    await page.evaluate(async()=>{const {fitCoupleBedOccupants}=await import("/home-editor-ui.js?v=20260906dev229");fitCoupleBedOccupants(document)});
    await page.waitForTimeout(80);
    const faceBoxes=await page.locator(".is-bed-conversation .home-person-visual").evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
    assert.equal(faceBoxes.length,2,`${name}: exactly two bed faces`);
    faceBoxes.forEach(box=>assert.ok(box.width>=46&&box.width<=64,`${name}: bed face remains within the intended 46–64px range`));
    assert.equal(await page.locator(".home-person-chat-bubble,.home-person-status").count(),0,`${name}: no duplicate speech or individual status bubbles`);
    assert.equal(await page.locator(".home-bed-foreground-status.is-shared").count(),1,`${name}: one shared foreground status`);
    const layers=await page.locator(".qa-room").evaluate(room=>({people:+getComputedStyle(room.querySelector(".room-people")).zIndex,bedding:+getComputedStyle(room.querySelector(".room-furniture-overlay-layer")).zIndex,status:+getComputedStyle(room.querySelector(".room-foreground-layer")).zIndex,animations:[...room.querySelectorAll(".is-bed-conversation .home-person-visual")].map(node=>getComputedStyle(node).animationName)}));
    assert.ok(layers.people<layers.bedding&&layers.bedding<layers.status,`${name}: faces < quilt/footboard < shared card`);
    assert.deepEqual(layers.animations,["home-bed-conversation-left","home-bed-conversation-right"],`${name}: quiet in-bed motion`);
    const portrait=await page.locator(".resident-profile-picture").evaluate(node=>{const rect=node.getBoundingClientRect(),image=node.querySelector("img"),style=getComputedStyle(node),imageStyle=getComputedStyle(image);return {width:rect.width,height:rect.height,radius:style.borderRadius,overflow:style.overflow,fit:imageStyle.objectFit,imageWidth:image.getBoundingClientRect().width,imageHeight:image.getBoundingClientRect().height}});
    assert.ok(Math.abs(portrait.width-portrait.height)<.5&&Math.abs(portrait.imageWidth-portrait.width)<.5&&Math.abs(portrait.imageHeight-portrait.height)<.5,`${name}: summary portrait and image are square`);
    assert.equal(portrait.overflow,"hidden");assert.equal(portrait.fit,"cover");
    await page.screenshot({path:resolve(output,`bed-log-${name}.png`)});await context.close();
  }
  console.log("PASS visual 227: bounded bed faces move under the quilt with one card, and summary photos fill a true circle");
}finally{await browser.close()}
