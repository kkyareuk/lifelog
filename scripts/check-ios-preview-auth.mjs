import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const source = read('scripts/ios-preview-auth.mjs');
assert.doesNotMatch(source, /\bimport\s|\bfetch\(|localStorage|sessionStorage/);
for (const lang of ['ko','en','ja']) {
  const events=[],messages=[];
  const window={ParallelCity:{getState:()=>({uiLanguage:lang}),toast:message=>messages.push(message)},dispatchEvent:e=>events.push(e.type)};
  vm.runInNewContext(source,{window,document:{documentElement:{lang}},Event:class{constructor(type){this.type=type;}}});
  const auth=window.ParallelCityAuth;
  assert.equal(auth.getInfo().ready,true);
  assert.equal(auth.getInfo().busy,false);
  assert.equal(auth.getInfo().user,null);
  assert.equal(auth.getInfo().entitlements.purchases.length,0);
  assert.equal(await auth.getIdToken(),null);
  assert.equal(await auth.login(),false);
  assert.equal(await auth.upload(),false);
  assert.equal(await auth.download(),false);
  assert.equal(messages.length,3);
  assert.equal(events[0],'drawer-village-auth-busy');
  assert.ok(messages[0].includes({ko:'기기 안에서',en:'play locally',ja:'端末内'}[lang]));
  const views=read('views.js');
  const route=views.slice(views.indexOf('function view(){'),views.indexOf('export function renderApp'));
  const screen=vm.runInNewContext(route+'\nview();',{
    window,state:{order:[],activeTab:'observe'},
    accountLoading:()=> 'blocked',welcome:()=> 'welcome'
  });
  assert.equal(screen,'welcome','Empty iOS preview must reach first-character screen, not account loading');
}
assert.match(read('scripts/prepare-app.mjs'), /if\(platform==="ios"\)await writeFile\(new URL\("auth.js",output\)/);
assert.match(read('auth.js'), /gstatic\.com\/firebasejs/);
console.log('PASS local iOS auth: offline-ready, no storage mutations, no cloud identity or entitlements, ko/en/ja messages; Android/web auth preserved.');
