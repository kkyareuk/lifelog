const assert=require('node:assert/strict');const {mergeCatalogItems}=require('../functions/catalog-media');
const old=[{id:'a',name:'사과',image:'local-media://device-only',notes:'keep'}];
assert.throws(()=>mergeCatalogItems([],[old[0]],'food'),/catalog-photo-upload-required/);
for(const image of ['blob:abc','data:image/png;base64,abc','file:///private/a'])assert.throws(()=>mergeCatalogItems([],[{id:'a',name:'a',image}],'food'));
const fixed=mergeCatalogItems(old,[{id:'a',name:'사과',image:'https://firebasestorage.googleapis.com/public-photo?token=sample',notes:'replace'}],'food');assert.equal(fixed.length,1);assert.ok(fixed[0].image.startsWith('https:'));assert.equal(fixed[0].notes,'keep');assert.equal(old[0].image,'local-media://device-only');
assert.equal(mergeCatalogItems(fixed,[{id:'b',name:'사과',image:'https://example.test/b'}],'food').length,1);
console.log('PASS reject device-local images, repair existing photo without duplicates or unrelated field changes');

(async()=>{
const source=require('node:fs').readFileSync('auth.js','utf8');const method=source.match(/publishCatalog:(async selected=>[^\n]+),/)[1];
let published,prepared;const groupState={activeGroupId:'group'};
const make=prepare=>new Function('prepareWorldPackage','groupState','sharedTownRequest','sharedProfile','return ('+method+')')(prepare,groupState,async(action,payload)=>{published=payload},v=>v);
const selected={food:[{id:'a',name:'사과',image:'local-media://one'}]};
await make(async input=>{prepared=input;return {food:[{...input.food[0],image:'https://example.test/shared.jpg'}]}})(selected);
assert.equal(prepared,selected);assert.equal(published.catalog.food[0].image,'https://example.test/shared.jpg');
published=null;await assert.rejects(make(async()=>{throw Error('photo-upload-required')})(selected));assert.equal(published,null);
await assert.rejects(make(async()=>{groupState.activeGroupId='other';return selected})(selected),/Group changed/);assert.equal(published,null);
console.log('PASS selected-only preparation; failed photo and group switch never publish');
})().catch(e=>{console.error(e);process.exitCode=1});
