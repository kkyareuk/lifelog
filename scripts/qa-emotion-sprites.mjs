import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));let b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);if(p==='/app.js')b=Buffer.from(b.toString()+'\nwindow.photoQA={openCharacterSceneImages,cropImage,render,setNavigationTabIntent};');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
try{
 const p=await browser.newPage({viewport:{width:393,height:873},serviceWorkers:'block'}),errors=[];p.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('dialog',async d=>{errors.push(d.message());await d.dismiss()});
 await p.route('**/*',r=>(r.request().url().startsWith(origin)||/^(blob:|data:)/.test(r.request().url()))?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.photoQA);
 await p.getByRole('button',{name:'게스트',exact:true}).click();
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');window.id=g.createCharacter();g.state.activeId=id;document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
 await p.evaluate(()=>{photoQA.setNavigationTabIntent('character');g.state.characterSettingsView='full';g.state.characterPane='visual';photoQA.render({force:true})});
 await p.locator('[data-character-scene-images]').click();
 await p.evaluate(()=>document.querySelector('.character-scene-images-dialog').close());
 await p.waitForFunction(()=>!document.querySelector('.character-scene-images-dialog'));
 for(const language of ['ko','en','ja']){
 await p.evaluate(lang=>{g.state.uiLanguage=lang;photoQA.openCharacterSceneImages()},language);
 assert.equal(await p.locator('[data-scene-image]').count(),30);
 const dialog=p.locator('.character-scene-images-dialog');assert(await dialog.isVisible());
 await p.evaluate(()=>document.querySelector('.character-scene-images-dialog').close());
 await p.waitForFunction(()=>!document.querySelector('.character-scene-images-dialog')); 
 }
 await p.evaluate(()=>photoQA.openCharacterSceneImages());
 await p.locator('[data-scene-key="joy"][data-scene-image="icon"]').click();
 const chooserPromise=process.argv.includes('--webkit')?null:p.waitForEvent('filechooser');
 await p.locator('[data-image-source="device"]').click();
 const chooser=chooserPromise?await chooserPromise:p.locator("input[data-drawer-image-picker]");
 const gif=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAAQABAAACAkQBADs=','base64');
 await (chooserPromise?chooser.setFiles.bind(chooser):chooser.setInputFiles.bind(chooser))({name:'animated.gif',mimeType:'image/gif',buffer:gif});
 await p.waitForFunction(()=>g.state.characters[id].sceneImageVariants.joy.icon.startsWith('data:image/gif'));
 const value=await p.evaluate(()=>g.state.characters[id].sceneImageVariants.joy.icon);
 assert.equal(Buffer.from(value.split(',')[1],'base64').compare(gif),0);
 console.log('PASS all language dialogs and GIF picker preserves exact file bytes');
 await p.evaluate(()=>{g.state.uiLanguage='ko';photoQA.openCharacterSceneImages()});
 await p.screenshot({path:'C:/Users/Public/drawer-releases/emotion529-settings.png'});
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.closeAllConnections();server.close()}

