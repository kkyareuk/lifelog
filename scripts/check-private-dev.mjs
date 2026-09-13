import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dir=resolve(process.argv[2]||'C:/Users/Public/drawer-village-private-dev','dist');
const context={window:{}};vm.runInNewContext(await readFile(resolve(dir,'config.js'),'utf8'),context);
assert.equal(context.window.PARALLEL_CITY_CONFIG.paymentsEnabled,false);
assert.equal(context.window.PARALLEL_CITY_CONFIG.playBilling.enabled,false);
assert.equal(Object.keys(context.window.PARALLEL_CITY_FIREBASE).length,0);
assert.equal(context.window.DRAWER_BUILD.cloudEnabled,false);
assert(Object.values(context.window.DRAWER_FEATURES).every(v=>v===false));
for(const name of ['index.html','login.html','payment.html','payment-success.html','payment-fail.html','privacy.html','terms.html']){
 const html=await readFile(resolve(dir,name),'utf8');
 assert(html.includes("connect-src 'self' data: blob:"));
 assert(html.includes("form-action 'none'"));
 assert(html.indexOf('Content-Security-Policy')<html.indexOf('<script'));
}
assert((await readFile(resolve(dir,'_headers'),'utf8')).includes('X-Robots-Tag: noindex, nofollow'));
assert(!(await readFile(resolve(dir,'config.js'),'utf8')).includes('lifelog-98fff'));
console.log('PASS private development: no production config, billing disabled, all entrypoints restrict network/forms, DLC defaults off.');
