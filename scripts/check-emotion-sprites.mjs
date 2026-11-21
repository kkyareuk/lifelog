import assert from 'node:assert/strict';
import {sceneImageFor,normalizeSceneImageVariants,SCENE_IMAGE_VARIANTS,sceneImageCopy} from '../character-scene-image.js';
import {characterGifData} from '../animated-character-image.js';
const c={photo:'portrait',icon:'default-sd',ldImage:'default-ld',sceneImageVariants:normalizeSceneImageVariants({joy:{icon:'happy'},hug:{ldImage:'hug'},sleep:{icon:'sleep'}})};
assert.equal(sceneImageFor(c,{},'icon',{tone:'good'}).src,'happy');
assert.equal(sceneImageFor(c,{},'ldImage',{tone:'good'}).src,'default-ld');
assert.equal(sceneImageFor(c,{meetingKind:'talk'},'icon',{tone:'good'}).src,'default-sd');
assert.equal(sceneImageFor(c,{meetingKind:'hug'},'ldImage',{tone:'sad'}).src,'hug');
assert.equal(sceneImageFor(c,{meetingKind:'hug',contactRejected:true},'ldImage',{tone:'sad'}).src,'default-ld');
assert.equal(sceneImageFor(c,{title:'sleeping'},'icon',{tone:'good'}).src,'sleep');
assert.equal(sceneImageFor({photo:'portrait'},null,'ldImage').src,'portrait');
assert.equal(sceneImageFor({photo:'portrait'},null,'icon').src,'portrait');
assert.equal(sceneImageFor(c,{},'icon',{tone:'sad'}).src,'default-sd');
// Existing shared profiles may predate variants or contain only selected slots.
for(const sceneImageVariants of [undefined,null,{}, {joy:null}, {hug:{icon:'hug-sd'}}]){
  const legacy={photo:'portrait',icon:'default-sd',ldImage:'default-ld',sceneImageVariants};
  const before=JSON.stringify(legacy);
  for(const mode of ['icon','ldImage'])for(const entry of [{meetingKind:'affection'},{meetingKind:'talk'},{title:'sleeping'}]){
    assert.equal(sceneImageFor(legacy,entry,mode,{tone:'excited'}).src,mode==='icon'?'default-sd':'default-ld');
  }
  assert.equal(JSON.stringify(legacy),before,'Fallback must not rewrite the saved profile');
}
for(const lang of ['ko','en','ja']){for(const v of SCENE_IMAGE_VARIANTS)assert(v[lang]);for(const key of ['title','help','tooLarge'])assert(sceneImageCopy(lang,key));}
assert.equal(await characterGifData(new Blob(['png']),'icon'),null);
await assert.rejects(characterGifData(new Blob(['GIF89a',new Uint8Array(1536*1024)]),'icon'),{code:'gif-too-large'});
console.log('PASS image priorities, empty-slot default, rejection, sleep, photo-only characters, GIF limits and all 3 languages');
