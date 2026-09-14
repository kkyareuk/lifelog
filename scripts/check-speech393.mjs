import assert from 'node:assert/strict';
import {SPEECH_STYLE_OPTIONS,canonicalSpeechStyle,characterContactSpeech,characterQuestionPrompt,characterPlanSpeech,speechStyleExample} from '../speech-styles.js';
import {REVIEWED_STYLE_NAMES,LETTER_KEYS,PUSH_KEYS,reviewedPush,relationshipLetterCopy} from '../speech-reviewed.js';
import {CHAT_STYLE,CHAT_PUSH,CHAT_LETTERS} from '../speech-chat.js';
import {characterMomentSpeech} from '../contact-voice.js';
import {softenCharacterSpeech} from '../speech-soften.js';
import {createContactMailbox} from '../notification-mail.js';
for(const [old,current] of [['귀여니체','인터넷소설 감성체'],['귀여니체 · 2000년대 인터넷소설체','인터넷소설 감성체'],['판교어','스타트업 업무체'],['판교어 · 스타트업 업무체','스타트업 업무체']]){
 assert.equal(canonicalSpeechStyle(old),current);assert(SPEECH_STYLE_OPTIONS.includes(current));
 assert.equal(characterQuestionPrompt({speechStyle:old}),characterQuestionPrompt({speechStyle:current}));
}
const changed=['인터넷소설 감성체','스타트업 업무체',CHAT_STYLE,'과묵한 직설체','거칠고 상스러운 말투'];
for(const language of ['ko','en','ja']){
 assert.equal(CHAT_PUSH[language].length,PUSH_KEYS.length);assert.equal(CHAT_LETTERS[language].length,LETTER_KEYS.length);
 for(const key of PUSH_KEYS){const text=reviewedPush({speechStyle:CHAT_STYLE},key,{language,target:'Alex',item:'Book',food:'Rice',drink:'Tea'});assert(text.length>8);assert(!/[{}]/.test(text));}
 for(const style of changed){
  const c={speechStyle:style},options={kind:'gift',language,target:'Alex',base:'A quiet moment.'};
  const lines=[characterQuestionPrompt(c,options),speechStyleExample(c,options),characterContactSpeech(c,'Alex',{language}),characterPlanSpeech(c,language),...LETTER_KEYS.map(k=>relationshipLetterCopy(c,k,'Alex',language))];
  assert(lines.every(x=>x.length>3),style+language);assert(lines.every(x=>!/씨발|시발|염병|지랄|fuck|shit|クソ|くそ/.test(x)),style+language);
  if(style==='거칠고 상스러운 말투')assert(lines.slice(0,4).every(x=>x.includes('@#$%')));
  for(const k of LETTER_KEYS)assert(relationshipLetterCopy(c,k,'Alex',language).includes('Alex'));
 }
 assert.match(characterQuestionPrompt({speechStyle:'과묵한 직설체'},{language}),language==='ko'?/젠장/:language==='en'?/\S/:/ちっ/);
}
assert.equal(characterContactSpeech({speechStyle:CHAT_STYLE},'',{}),'');
assert(!/잼민|로블록스|Roblox/i.test(JSON.stringify([CHAT_PUSH,CHAT_LETTERS,REVIEWED_STYLE_NAMES[CHAT_STYLE]])));
assert.match(characterMomentSpeech({speechStyle:'과묵한 직설체'},'',{topic:'home',context:{home:'집'},language:'ko'}),/망할/);
assert.equal(softenCharacterSpeech('젠장, 망할','과묵한 직설체'),'젠장, 망할');
assert.equal(softenCharacterSpeech('젠장, 망할','거칠고 상스러운 말투'),'@#$%, @#$%');
const raw=JSON.stringify([{id:'old',at:Date.now(),title:'hello',body:'씨발, 뭐야'}]);
const store={scope:'fixture',getItem:()=>raw};assert.equal(createContactMailbox(store).get('old').body,'@#$%, 뭐야');assert.equal(store.getItem(),raw);
console.log('PASS393: aliases, 114 chat messages, 5 voices ×3 languages, mild vs masked expressions, cached authored mail, placeholders and labels');
