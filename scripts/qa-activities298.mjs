import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("..",import.meta.url))),require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||"C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const {chromium}=require(playwrightPath),output=resolve(root,"qa-output-293");
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
 const page=await browser.newPage({viewport:{width:412,height:917},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await page.goto(origin+'/?native-preview=1');await page.waitForFunction(()=>window.ParallelCity);
 const check=await page.evaluate(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const url=performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name;window.game=await import(url);const a=game.createCharacter(10),b=game.createCharacter(10),c=game.createCharacter(10);window.qaA=a;window.qaB=b;const actor=game.state.characters[a];actor.hobbies=['독서'];actor.smokingStatus='흡연';actor.personalityTypes=['완고하고 통제적'];game.state.activeId=a;game.state.activeTab='observe';game.state.characters[c].name='싫은 사람';game.state.characterViews[a]={[c]:{overall:'증오'}};const auto=await import(url.replace('/state.js?','/automatic-activities.js?'));const tasks=await import(url.replace('/state.js?','/life-tasks.js?'));const choice=auto.automaticConversation(game.state,actor,game.state.characters[b],'gossip',1);if(choice.subjectId!==c)throw Error('gossip target');actor.personalityTypes=['무심하고 독립적'];if(auto.automaticConversation(game.state,actor,game.state.characters[b],'gossip',1).kind!=='talk')throw Error('independent gossip');actor.personalityTypes=['완고하고 통제적'];for(const task of tasks.LIFE_TASKS){if(!game.directCharacterActivity(a,task.kind,{lifeTask:task.id,now:Date.now()}))throw Error(task.id);if(game.state.characterDirectives[a].lifeTask!==task.id)throw Error('task lost '+task.id)}if(!game.directCharacterActivity(a,'relax',{lifeTask:'hobby_auto'}))throw Error('hobby rejected');if(game.state.characterDirectives[a].kind!=='read')throw Error('wrong hobby');delete game.state.characterDirectives[a];location.hash='tab=observe';window.ParallelCity.mediaChanged();return tasks.LIFE_TASKS.length});
 await page.waitForTimeout(500);await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.locator('[data-character-command]').first().click();await page.screenshot({path:resolve(output,'command298-root.png')});assert.equal(await page.locator('.command-menu-page:visible > button').count(),6);await page.getByRole('button',{name:'생활',exact:true}).click();await page.getByRole('button',{name:'집안일·살림',exact:true}).click();assert.equal(await page.locator('[data-life-task]:visible').count(),14);await page.screenshot({path:resolve(output,'command298-chores.png')});await page.setViewportSize({width:360,height:640});assert.ok(await page.locator('.direct-command-body').evaluate(e=>e.scrollHeight>e.clientHeight));await page.setViewportSize({width:412,height:917});await page.getByRole('button',{name:'뒤로',exact:true}).click();await page.getByRole('button',{name:'뒤로',exact:true}).click();await page.getByRole('button',{name:'나답게',exact:true}).click();assert.ok(await page.getByRole('button',{name:'흡연하기',exact:true}).isVisible());await page.getByRole('button',{name:'뒤로',exact:true}).click();await page.getByRole('button',{name:'교류',exact:true}).click();await page.getByRole('button',{name:'대화',exact:true}).click();assert.equal(await page.locator('[data-direct-topic]').count(),0);await page.getByRole('button',{name:'함께할 상대 고르기',exact:true}).click();await page.locator('[data-direct-target]').first().click();assert.ok(await page.locator('[data-direct-social-action=talk]').isVisible());await page.locator('[data-direct-social-action=talk]').click();await page.waitForFunction(()=>!document.querySelector('.direct-command-dialog'));
 assert.deepEqual(errors,[]);console.log('PASS SVG-style menu, back navigation, scrolling, '+check+' life tasks, automatic topic/gossip personality, configured hobby and personal options');
}finally{await browser.close();server.close()}