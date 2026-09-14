import assert from 'node:assert/strict';
import {englishPronouns,englishVerb,authoredSelf,ownerLogTemplate,languagePreview,normalizeLanguageFields} from '../character-language.js';
import {reviewedPush,PUSH_KEYS,relationshipLetterCopy} from '../speech-reviewed.js';
import {ENGLISH_PUSH_DRAFTS,ENGLISH_PUSH_STYLE_MAP} from '../speech-english394.js';
import {localizeLifeLog} from '../life-log-localization.js';
assert.equal(Object.keys(ENGLISH_PUSH_DRAFTS).length,37);
for(const pool of Object.values(ENGLISH_PUSH_DRAFTS))assert.equal(pool.length,22);
for(const style of Object.values(ENGLISH_PUSH_STYLE_MAP))for(const key of PUSH_KEYS){const text=reviewedPush({speechStyle:style},key,{language:'en',target:'They',item:'an apple',food:'rice',drink:'tea'});assert(text.length>3);assert(!/[{}]/.test(text));assert(!/\b(?:fuck|shit|bastard)\b/i.test(text));}
for(const [pronounEn,subject,is,has,does] of [['he','he','is','has','does'],['she','she','is','has','does'],['they','they','are','have','do']]){
 const c={name:'Alex',gender:'설정하지 않음',pronounEn};assert.equal(englishPronouns(c).subject,subject);assert.equal(englishVerb(c,'is'),is);assert.equal(englishVerb(c,'has'),has);assert.equal(englishVerb(c,'does'),does);
 assert.equal(ownerLogTemplate('They are resting.',c,'en'),subject[0].toUpperCase()+subject.slice(1)+' '+is+' resting.');
 const log=localizeLifeLog({title:'쉬는 중',desc:'잠깐 휴식하고 있어요.'},'en',{characters:{a:c}},'a');assert(log.desc.startsWith(subject[0].toUpperCase()+subject.slice(1)+' '+is));
}
assert.equal(englishPronouns({name:'Alex',gender:'여성'}).subject,'Alex');
const custom={pronounEn:'custom',pronounEnSubject:'ze',pronounEnObject:'hir',pronounEnDeterminer:'hir',pronounEnPossessive:'hirs',pronounEnReflexive:'hirself'};
assert.match(languagePreview(custom,'en'),/^Ze is resting/);assert.equal(englishPronouns({...custom,pronounEnAgreement:'plural'}).plural,true);assert(englishPronouns({...custom,pronounEnObject:''}).nameOnly);
assert.equal(englishPronouns({pronounEn:'they',pronounEnReflexive:'themself'}).reflexive,'themself');
assert.equal(authoredSelf('나는 내가 할게. 내 책은 나에게 줘.',{selfKo:'저'},'ko'),'저는 제가 할게. 제 책은 저에게 줘.');
assert.equal(authoredSelf('내가 할게. 나를 믿어.',{selfKo:'짐'},'ko'),'짐이 할게. 짐을 믿어.');
assert.equal(authoredSelf('私がやる。僕の本だ。',{selfJa:'俺'},'ja'),'俺がやる。俺の本だ。');
assert.equal(authoredSelf('내가 할게.',{},'ko'),'내가 할게.');
assert(!authoredSelf('나비는 나라의 제도와 달라.',{selfKo:'짐'},'ko').includes('짐'));
assert(relationshipLetterCopy({speechStyle:'하오체',selfKo:'짐'},'친구','나','ko').includes('나'));
assert.equal(ownerLogTemplate('They are resting.',{name:'They'},'en'),'They is resting.'); // A literal name is never rewritten as a pronoun.
const raw={selfKo:'<img onerror=x>',pronounEnSubject:'a'.repeat(100)};normalizeLanguageFields(raw);assert.equal(raw.pronounEnSubject.length,40);
console.log('PASS394: source pools, mapped pushes, gender independence, custom forms, agreement, self forms, safe name insertion, generated log integration');
