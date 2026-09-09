import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const source=json('ios-production-source.json'),release=json('ios-release.json'),request=json('.github/ios-production-request.json');
assert.equal(source.commit,'5b55860');assert.equal(source.androidCode,302);
for(const [file,hash] of Object.entries({...source.files,...source.platformFiles}))assert.equal(createHash('sha256').update(read(file).replaceAll('\r\n','\n')).digest('hex'),hash,'Production game changed: '+file);
assert.equal(release.sourceAndroidCode,302);assert.equal(release.sourceAndroidVersion,'1.0.269');
assert.equal(request.version,release.version);assert.equal(request.build,release.build);
assert.equal(request.internalOnly,false);assert.equal(request.submitForReview,false);assert.equal(release.appStoreReady,false);
assert.match(read('scripts/ios-testflight.mjs'),/testFlightInternalTestingOnly:!productionPort/);
assert.match(read('.github/workflows/ios-production.yml'),/branches: \[codex\/ios-production264\]/);
assert.ok(fs.existsSync('group-push.js'),'Requested multiplayer parity must be present');
console.log('PASS production 302 game hashes, shared game parity and reviewed platform changes, explicit eligible upload without review submission');

