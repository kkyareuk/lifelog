import assert from 'node:assert/strict';
import {starterValues,personalityPresets,lifestylePresets} from '../features/characters/starter-presets.js';
import {bedFaceSize} from '../features/home/occupant-size.js';
import {characterPortrait} from '../features/mail/portrait.js';
import {characterMomentSpeech} from '../contact-voice.js';
import {CHARACTER_CONTACT_PHRASES} from '../features/mail/contact-phrases.js';
assert.equal(bedFaceSize(10),32);assert.equal(bedFaceSize(10,0),10);assert.equal(bedFaceSize(80,40),76);
assert.equal(characterPortrait({icon:'local-media://missing',photo:'https://example.test/photo.png'}),'https://example.test/photo.png');
assert.equal(characterPortrait({profileJson:{icon:'https://example.test/shared.png'}}),'https://example.test/shared.png');
assert.equal(characterPortrait(undefined,'https://example.test/envelope.png'),'https://example.test/envelope.png');
for(const p of personalityPresets)for(const l of lifestylePresets){const patch=starterValues(p.id,l.id);assert(patch.socialStyle&&patch.planningStyle);assert.equal(patch.wake,l.values.wake);assert(!('name' in patch));assert(!('icon' in patch))}
for(const language of ['ko','en','ja'])for(const style of ['과묵한 직설체','냉정한 격식체','다정하고 부드러운 말투']){
 const bodies=CHARACTER_CONTACT_PHRASES.checkins.actions.map(p=>characterMomentSpeech({speechStyle:style},p[language],{language,topic:'checkins'}));assert.equal(new Set(bodies).size,bodies.length,'style preserves distinct stories');
}
let host={dataset:{observedCharacter:'a',lifeSound:'eat',lifeSoundEvent:'meal-1'},querySelector:()=>null};
globalThis.document={hidden:false,querySelector:()=>host,addEventListener(){}};globalThis.window={addEventListener(){}};globalThis.localStorage={getItem:()=>null};
const played=[];globalThis.Audio=class{constructor(src){this.src=src}play(){played.push(this);return Promise.resolve()}pause(){}removeAttribute(){}load(){}};
const {syncLifeSound,stopLifeSound}=await import('../life-audio.js');const state={soundEffectsVolume:45};
syncLifeSound(state);await Promise.resolve();assert.equal(played.length,1);assert.equal(played[0].loop,false);
for(let i=0;i<5;i++)syncLifeSound(state);assert.equal(played.length,1,'rerender does not replay');
stopLifeSound();syncLifeSound(state);assert.equal(played.length,1,'resume same visit does not replay');
host.dataset.observedCharacter='b';syncLifeSound(state);host.dataset.observedCharacter='a';syncLifeSound(state);assert.equal(played.length,3,'A → B → A plays once per visit');
host=null;syncLifeSound(state);host={dataset:{observedCharacter:'a',lifeSound:'eat'},querySelector:()=>null};syncLifeSound(state);assert.equal(played.length,4,'returning to screen replays once');
console.log('PASS 508: visit-scoped meal audio, presets, readable bed icons, local/shared portrait fallback and distinct letters in ko/en/ja');
