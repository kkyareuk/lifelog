import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-context339");
await mkdir(output,{recursive:true});
const previewAuth=await readFile(resolve(root,"scripts/ios-preview-auth.mjs"));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2",".ttf":"font/ttf",".m4a":"audio/mp4"};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname),file=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
    if(!file.startsWith(root+sep)||!mime[extname(file)])return response.writeHead(404).end();
    let body=pathname==="/auth.js"?previewAuth:await readFile(file);
    if(pathname==="/views.js")body=body.toString().replace("const rawViewEvent=(c,date)=>{","const rawViewEvent=(c,date)=>{window.qaSceneCalls=(window.qaSceneCalls||0)+1;").replace("if(c&&date===renderSceneDate&&projectedRenderScenes.has(c))","if(!window.qaDisableCache&&c&&date===renderSceneDate&&projectedRenderScenes.has(c))");
    response.writeHead(200,{"Content-Type":mime[extname(file)],"Cache-Control":"no-store"}).end(body);
  }catch{response.writeHead(404).end()}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});

try{
const page=await browser.newPage({viewport:{width:384,height:854}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message)});await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin);await page.waitForFunction(()=>window.ParallelCity);await page.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');g.createCharacter();g.createCharacter();window.DrawerVillageNavigation.go('home')});await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));

const result=await page.evaluate(async()=>{
 const rules=await import('/character-discovery-rules.js?v=20260909dev305');
 const [a,b]=g.state.order.map(id=>g.state.characters[id]);
 a.morality='내 이익을 먼저 따짐';b.morality='손해를 봐도 원칙을 지킴';
 a.discovery={scores:{morality:21.4}};b.discovery={scores:{morality:82.8}};
 a.personalityTypes=['미설정'];b.personalityTypes=['장난기 많음'];
 const coin=rules.DISCOVERY_SCENES.find(q=>q.id==='coin');
 if(!coin||coin.choices.length<7)throw Error('missing varied coin choices');
 const low=coin.choices[0].targets?.morality??coin.choices[0].effects.morality;
 const high=coin.choices[1].targets?.morality??coin.choices[1].effects.morality;
 if(!(low<high))throw Error('morality direction');
 return {low,high};
});
for(const lang of ['ko','en','ja']){
 await page.evaluate(lang=>{g.state.uiLanguage=lang;window.DrawerVillageNavigation.go('statistics');document.querySelectorAll('dialog[open]').forEach(d=>d.close())},lang);
 const stats=page.locator('.discovery-statistics');await stats.waitFor();
 assert((await stats.textContent()).includes('52.1 / 100'));
 assert.equal(await stats.locator('select').count(),0);
 assert(!(await page.locator('.personality-top').textContent()).includes('미설정'));
 assert(await stats.evaluate(el=>el.previousElementSibling.classList.contains('statistics-social')));
 await page.screenshot({path:resolve(output,'statistics346-'+lang+'.png'),fullPage:true});
}
await page.evaluate(()=>{window.DrawerVillageNavigation.go('character');g.state.uiLanguage='ko';g.state.characterSettingsView='full';g.state.characterPane='personality';g.state.characterPersonalityPane='core';window.ParallelCity.mediaChanged();document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
const morality=page.locator('[data-field="morality"]');assert.equal(await morality.count(),1);
assert((await morality.locator('..').textContent()).includes('/100'));
await morality.selectOption('양심을 지키려 함');
assert.equal(await page.evaluate(()=>g.active().morality),'양심을 지키려 함');
await page.waitForTimeout(300);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await morality.scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,'morality346.png'),fullPage:true});
console.log('PASS village mean 52.1, unset excluded, placement, coin targets',result);
assert(!errors.length,errors.join('\n'));console.log('PASS morality editor and score, KO/EN/JA statistics');
}finally{await browser.close();server.close()}
