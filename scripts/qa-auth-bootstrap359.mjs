import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sdk={};
for(const name of ['firebase-app','firebase-auth']){
 const response=await fetch(`https://www.gstatic.com/firebasejs/12.2.1/${name}.js`);
 assert(response.ok);sdk['/'+name+'.js']=(await response.text()).replaceAll('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js','/firebase-app.js');
}
sdk['/auth-bootstrap.js']=await readFile(new URL('../auth-bootstrap.js',import.meta.url),'utf8');
const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url.endsWith('.js')?'text/javascript':'text/html');res.end(sdk[req.url]||'<html><body>Auth initialization fixture</body></html>')});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:process.env.QA_BROWSER||"chrome",headless:true});
try{
 for(const native of [false,true]){
  const context=await browser.newContext({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
  let authHelperRequests=0;
  await context.route(/https:\/\/(apis\.google\.com|example\.firebaseapp\.com)\//,()=>{authHelperRequests++});
  const page=await context.newPage();await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result=await page.evaluate(async native=>{
   const {initializeApp}=await import('/firebase-app.js');
   const deps=await import('/firebase-auth.js');
   const {bootstrapAuth}=await import('/auth-bootstrap.js');
   const app=initializeApp({apiKey:'fixture-key',authDomain:'example.firebaseapp.com',projectId:'fixture'});
   const started=performance.now(),auth=bootstrapAuth(app,native,deps);
   const outcome=await Promise.race([deps.setPersistence(auth,deps.browserLocalPersistence).then(()=> 'ready'),new Promise(r=>setTimeout(()=>r('pending'),1200))]);
   return {outcome,ms:Math.round(performance.now()-started),resolver:Boolean(auth._popupRedirectResolver)};
  },native);
  console.log({native,...result,authHelperRequests});
  assert.equal(result.outcome,native?'ready':'pending');
  assert.equal(result.resolver,!native);
  if(native)assert.equal(authHelperRequests,0);else assert(authHelperRequests>0);
  await context.close();
 }
 console.log('PASS Firebase12.2.1: blocked mobile web helper stalls old initialization; native bootstrap resolves without helper requests');
}finally{await browser.close();await new Promise(r=>server.close(r))}

