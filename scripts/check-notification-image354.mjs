import assert from 'node:assert/strict';
import {characterNotificationLargeIcon} from '../character-notifications.js';
import {SPEECH_STYLE_OPTIONS,canonicalSpeechStyle,characterQuestionPrompt,characterContactSpeech,characterPlanSpeech} from '../speech-styles.js';
globalThis.Image=class {set src(value){this.value=value}};
const start=Date.now();assert.equal(await characterNotificationLargeIcon('https://invalid.test/stalled.png'),'');assert(Date.now()-start<2600);
assert(!SPEECH_STYLE_OPTIONS.some(v=>v.includes('귀여니')));assert.equal(canonicalSpeechStyle('귀여니체 · 2000년대 인터넷소설체'),'반말');assert.equal(canonicalSpeechStyle('거칠고 상스러운 말투 · 순화'),'거칠고 상스러운 말투');
for(const language of ['ko','en','ja']){const c={speechStyle:'초성 쓰는 반말'};assert(characterQuestionPrompt(c,{language,kind:'weekend'}).length>4);assert.notEqual(characterContactSpeech(c,'Test',{language}),'Test');assert(characterPlanSpeech(c,language).length>4)}
assert(characterQuestionPrompt({speechStyle:'귀엽고 애교 있는 말투'},{kind:'weekend'}).includes('✧'));
console.log('PASS stalled icon falls back within 2 seconds; style aliases and localized texting speech');
