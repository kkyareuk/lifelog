import {readFile,writeFile,mkdir,cp,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const target=resolve(process.argv[2]||'C:/Users/Public/drawer-village-private-dev');
if(target===resolve(root)||target.startsWith(resolve(root)+'\\'))throw Error('Use a separate Site checkout.');
const manifest=JSON.parse(await readFile(resolve(target,'.openai/hosting.json'),'utf8'));
if(!manifest.project_id||manifest.static?.directory!=='dist')throw Error('Registered private static Site required.');
execFileSync(process.execPath,['scripts/prepare-web.mjs'],{cwd:root,stdio:'inherit'});
const out=resolve(target,'dist');
await mkdir(out,{recursive:true});
// Copy build output only, never source credentials, user backups or diagnostics.
await cp(resolve(root,'dist'),out,{recursive:true});
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const config=`(()=>{const cfg={firebase:{},environment:'private-development',paymentsEnabled:false,paymentEnvironment:'disabled',tossPaymentsClientKey:'',paymentBackendUrl:'',playBilling:{enabled:false,backendUrl:''},diamonds:{enabled:false,backendUrl:''},ads:{enabled:false},beta:{enabled:false},maintenance:{enabled:false}};window.PARALLEL_CITY_FIREBASE={};window.PARALLEL_CITY_CONFIG=cfg;window.DRAWER_BUILD=Object.freeze({channel:'private-development',source:${JSON.stringify(commit)},cloudEnabled:false});window.DRAWER_FEATURES=Object.freeze({jobPack:false,speciesPack:false,familyPack:false,lifeAndDeathPack:false});})();`;
await writeFile(resolve(out,'config.js'),config);
const policy="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'";
for(const name of ['index.html','login.html','payment.html','payment-success.html','payment-fail.html','privacy.html','terms.html']){
 try{const p=resolve(out,name);let html=await readFile(p,'utf8');html=html.replace(/<head([^>]*)>/i,`<head$1><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">`);
 if(name==='index.html')html=html.replace('</body>',`<script src="./private-dev-label.js"></script></body>`);
 await writeFile(p,html);}catch(e){if(e.code!=='ENOENT')throw e;}
}
await writeFile(resolve(out,'private-dev-label.js'),`(()=>{document.title='[DEV] '+document.title;const p=document.createElement('div');p.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:#382d55;color:white;text-align:center;font:12px/18px sans-serif;pointer-events:none';p.textContent=({en:'Private test · device-only saves · live services disabled',ja:'非公開テスト · 端末のみ保存 · 本番接続なし'}[localStorage.getItem('uiLanguage')]||'비공개 개발 테스트 · 기기 전용 저장 · 운영 서버 연결 차단');document.body.append(p)})();`);
await writeFile(resolve(out,'_headers'),`/*\n  Content-Security-Policy: ${policy}\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n`);
await writeFile(resolve(out,'sw.js'),`self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));`);
await writeFile(resolve(out,'development-build.json'),JSON.stringify({source:commit,channel:'private-development',cloudEnabled:false,productionConnections:'blocked by CSP',features:'all unreleased DLC disabled'},null,2));
await access(resolve(out,'app.js'));
console.log('Private development assets prepared. Production source/config unchanged; no deployment performed.');
