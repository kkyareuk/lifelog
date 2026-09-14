// Language preferences are independent of gender and travel with the profile.
const clean=value=>String(value??'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,40);
export const LANGUAGE_FIELDS=['selfKo','selfKoSubject','selfKoPossessive','referenceKo','selfJa','referenceJa','pronounEn','pronounEnSubject','pronounEnObject','pronounEnDeterminer','pronounEnPossessive','pronounEnReflexive','pronounEnAgreement'];
export function normalizeLanguageFields(character){for(const key of LANGUAGE_FIELDS)if(Object.hasOwn(character,key))character[key]=clean(character[key]);return character}
const presets={he:['he','him','his','his','himself','singular'],she:['she','her','her','hers','herself','singular'],they:['they','them','their','theirs','themselves','plural']};
export function englishPronouns(c={}){
 const p=presets[c.pronounEn];if(p)return {subject:p[0],object:p[1],determiner:p[2],possessive:p[3],reflexive:c.pronounEn==='they'&&c.pronounEnReflexive==='themself'?'themself':p[4],plural:p[5]==='plural'};
 if(c.pronounEn==='custom'&&clean(c.pronounEnSubject)&&clean(c.pronounEnObject)&&clean(c.pronounEnDeterminer)&&clean(c.pronounEnPossessive)&&clean(c.pronounEnReflexive))return {subject:clean(c.pronounEnSubject),object:clean(c.pronounEnObject),determiner:clean(c.pronounEnDeterminer),possessive:clean(c.pronounEnPossessive),reflexive:clean(c.pronounEnReflexive),plural:c.pronounEnAgreement==='plural'};
 const name=clean(c.name)||'The character';return {subject:name,object:name,determiner:name+"'s",possessive:name+"'s",reflexive:'themself',plural:false,nameOnly:true};
}
export const sentenceCase=value=>value?value[0].toUpperCase()+value.slice(1):value;
export function englishVerb(c,verb){const p=englishPronouns(c);return ({is:p.plural?'are':'is',was:p.plural?'were':'was',has:p.plural?'have':'has',does:p.plural?'do':'does',"doesn't":p.plural?"don't":"doesn't"})[verb]||verb}
const particle=(word,yes,no)=>{const n=word.charCodeAt(word.length-1)-0xac00;return word+(n>=0&&n<=11171&&n%28?yes:no)};
export function koreanSelf(c={}){const base=clean(c.selfKo);if(!base||base==='auto')return null;return {base,subject:clean(c.selfKoSubject)||({나:'내가',저:'제가'})[base]||particle(base,'이','가'),possessive:clean(c.selfKoPossessive)||({나:'내',저:'제'})[base]||base+'의'}}
// Apply only to authored first-person dialogue BEFORE inserting names/items.
// No arbitrary replacements in user-written mail or historical log text.
export function authoredSelf(text,c,language='ko'){
 let value=String(text||'');if(language==='ko'){
  const p=koreanSelf(c);if(!p)return value;
  return value.replace(/(^|[\s“"‘'(])(?:내가|제가|나는|저는|나를|저를|나에게|저에게|나와|저와|내|제|나|저)(?=[\s,.;!?…。！？”"’')]|$)/g,(word,prefix)=>{const token=word.slice(prefix.length);if(['내가','제가'].includes(token))return prefix+p.subject;if(['내','제'].includes(token))return prefix+p.possessive;const suffix=token.slice(1);return prefix+(suffix==='는'?particle(p.base,'은','는'):suffix==='를'?particle(p.base,'을','를'):suffix==='와'?particle(p.base,'과','와'):p.base+suffix)});
 }
 if(language==='ja'&&clean(c?.selfJa)&&c.selfJa!=='auto')return value.replace(/(?:わたくし|わたし|私|僕|俺|余|我)(?=は|が|の|を|に|も|と|、|。|！|？|$)/g,()=>clean(c.selfJa));
 return value;
}
export function languagePreview(c,language){
 if(language==='en'){const p=englishPronouns(c);return `${sentenceCase(p.subject)} ${englishVerb(c,'is')} resting. I left a note for ${p.object}. This book is ${p.possessive}.`}
 if(language==='ja')return `${!c.selfJa||c.selfJa==='auto'?'私':clean(c.selfJa)}がやるよ。${!c.referenceJa||c.referenceJa==='name'?clean(c.name)||'キャラクター':clean(c.referenceJa)}は家で休んでいます。`;
 return `${koreanSelf(c)?.subject||'내가'} 할게. ${particle(!c.referenceKo||c.referenceKo==='name'?clean(c.name)||'캐릭터':clean(c.referenceKo),'은','는')} 집에서 쉬고 있어.`;
}
// These logs are authored owner-subject templates. Call before name insertion.
export function ownerLogTemplate(text,c={},language){
 if(language==='ko')return c.referenceKo&&c.referenceKo!=='name'?particle(clean(c.referenceKo),'은','는')+' '+text:text;
 if(language==='ja')return c.referenceJa&&c.referenceJa!=='name'?clean(c.referenceJa)+'は'+text:text;
 if(language!=='en')return text;const p=englishPronouns(c);
 return text.replace(/\band are\b/g,p.plural?'and are':'and is').replace(/\b(They|they)(?: (are|were|have|do|don't|go|enjoy|need))?\b|\b(their|them|themselves)\b/g,(_,subject,verb,other)=>{
  if(other)return ({their:p.determiner,them:p.object,themselves:p.reflexive})[other];
  const name=subject==='They'?sentenceCase(p.subject):p.subject;
  if(!verb)return name;
  return name+' '+({are:englishVerb(c,'is'),were:englishVerb(c,'was'),have:englishVerb(c,'has'),do:englishVerb(c,'does'),"don't":englishVerb(c,"doesn't"),go:p.plural?'go':'goes',enjoy:p.plural?'enjoy':'enjoys',need:p.plural?'need':'needs'})[verb];
 });
}
