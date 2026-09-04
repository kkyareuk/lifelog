import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectDevices} from './ios-simulator-smoke.mjs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const workflow = read('.github/workflows/ios-preview.yml');
assert.match(workflow, /branches: \[dev\]/);
assert.match(workflow, /paths: \[\.github\/ios-preview-request\.json\]/);
assert.match(workflow, /github\.ref == 'refs\/heads\/dev'/);
assert.match(workflow, /runs-on: macos-15\s/);
assert.match(workflow, /timeout-minutes: 30/);
assert.match(workflow, /contents: read/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /cancel-in-progress: true/);
assert.match(workflow, /CODE_SIGNING_ALLOWED=NO/);
assert.match(workflow, /retention-days: 3/);
assert.doesNotMatch(workflow, /secrets\.|pull_request|schedule:|macos-.*(?:large|xlarge)|upload-to-testflight|exportArchive/);
assert.equal(JSON.parse(read('.github/ios-preview-request.json')).appStoreUpload, false);
assert.equal(JSON.parse(read('ios-release.json')).appStoreReady, false);
assert.match(read('ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme'), /BlueprintIdentifier="504EC3031FED79650016851F"/);
const fixture = {runtimes:[
  {identifier:'com.apple.iOS-26-2', version:'26.2', isAvailable:true},
  {identifier:'com.apple.iOS-26-3', version:'26.3', isAvailable:true},
  {identifier:'com.apple.iOS-27', version:'27.0', isAvailable:false}
],devices:{'com.apple.iOS-26-3':[
  {name:'iPhone Test', udid:'phone', isAvailable:true},
  {name:'iPad Test', udid:'tablet', isAvailable:true}
]}};
assert.deepEqual(selectDevices(fixture).map(d=>d.udid), ['phone','tablet']);
assert.throws(()=>selectDevices({runtimes:[],devices:{}}), /No installed iOS/);
fixture.devices['com.apple.iOS-26-3'].pop();
assert.throws(()=>selectDevices(fixture), /No installed iPad/);
console.log('PASS iOS cloud: explicit dev request, bounded standard runner, no signing/deployment/secrets, short diagnostics retention, iPhone/iPad selection.');
