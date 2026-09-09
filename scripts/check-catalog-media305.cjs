const assert=require('node:assert/strict');const {mergeCatalogItems}=require('../functions/catalog-media');
const old=[{id:'a',name:'사과',image:'local-media://device-only',notes:'keep'}];
assert.throws(()=>mergeCatalogItems([],[old[0]],'food'),/catalog-photo-upload-required/);
for(const image of ['blob:abc','data:image/png;base64,abc','file:///private/a'])assert.throws(()=>mergeCatalogItems([],[{id:'a',name:'a',image}],'food'));
const fixed=mergeCatalogItems(old,[{id:'a',name:'사과',image:'https://firebasestorage.googleapis.com/public-photo?token=sample',notes:'replace'}],'food');assert.equal(fixed.length,1);assert.ok(fixed[0].image.startsWith('https:'));assert.equal(fixed[0].notes,'keep');assert.equal(old[0].image,'local-media://device-only');
assert.equal(mergeCatalogItems(fixed,[{id:'b',name:'사과',image:'https://example.test/b'}],'food').length,1);
console.log('PASS reject device-local images, repair existing photo without duplicates or unrelated field changes');
