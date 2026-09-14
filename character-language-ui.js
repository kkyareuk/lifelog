import {LANGUAGE_FIELDS,languagePreview} from './character-language.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let serial=0;
export function characterLanguageFields(c,lang='ko'){
 const t=(ko,en,ja)=>({ko,en,ja}[lang]||ko),id='language-'+(++serial);
 const input=(key,label,choices=[],placeholder='')=>`<label>${esc(label)}<input data-field="${key}" value="${esc(c[key]||'')}" maxlength="40" autocomplete="off" spellcheck="false" placeholder="${esc(placeholder)}" ${choices.length?`list="${id}-${key}"`:''}>${choices.length?`<datalist id="${id}-${key}">${choices.map(v=>`<option value="${esc(v)}"></option>`).join('')}</datalist>`:''}</label>`;
 const select=(key,label,options)=>`<label>${esc(label)}<select data-field="${key}">${options.map(([v,l])=>`<option value="${v}" ${v===(c[key]||'')?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
 const own=t('자신을 부르는 말','First-person expression','自分の呼び方'),reference=t('다른 사람이 부르는 방식','Third-person reference','第三者からの呼び方'),auto=t('비우면 말투에 맞춤','Leave empty to follow the voice','空欄なら口調に合わせる'),name=t('비우면 이름 사용','Leave empty to use the name','空欄なら名前を使う');
 const form=code=>{
  let html='';if(code==='ko')html=input('selfKo',own,['나','저','짐','본인','이 몸'],auto)+input('referenceKo',reference,['그','그녀'],name)+`<details><summary>${t('문장 형태 조정','Adjust word forms','語形を調整')}</summary>${input('selfKoSubject',t('주어 형태 · 예: 내가','Subject form · e.g. 내가','主語形・例：내가'),[],t('비우면 자동','Automatic if empty','空欄なら自動'))}${input('selfKoPossessive',t('소유 형태 · 예: 내','Possessive form · e.g. 내','所有形・例：내'),[],t('비우면 자동','Automatic if empty','空欄なら自動'))}</details>`;
  if(code==='ja')html=input('selfJa',own,['私','僕','俺','わたくし','自分','余'],auto)+input('referenceJa',reference,['彼','彼女'],name);
  if(code==='en')html=select('pronounEn',t('영어 대명사','English pronouns','英語の代名詞'),[['',t('이름 사용','Use name','名前を使う')],['he','he / him'],['she','she / her'],['they','they / them'],['custom',t('직접 입력','Custom','自由入力')]])+`<div data-language-custom ${c.pronounEn==='custom'?'':'hidden'}>${input('pronounEnSubject',t('주격 · ze','Subject · ze','主格・ze'))}${input('pronounEnObject',t('목적격 · hir','Object · hir','目的格・hir'))}${input('pronounEnDeterminer',t('소유 한정사 · hir','Possessive determiner · hir','所有限定詞・hir'))}${input('pronounEnPossessive',t('소유 대명사 · hirs','Possessive pronoun · hirs','所有代名詞・hirs'))}${select('pronounEnAgreement',t('동사 형태','Verb agreement','動詞の形'),[['', 'is / has / does'],['plural','are / have / do']])}<small>${t('다섯 형태를 모두 입력하기 전에는 이름을 사용해요.','Names are used until all five forms are filled in.','5つの語形が揃うまでは名前を使います。')}</small></div><div data-language-reflexive ${['custom','they'].includes(c.pronounEn)?'':'hidden'}>${input('pronounEnReflexive',t('재귀형','Reflexive','再帰形'),['themselves','themself'],c.pronounEn==='they'?'themselves':'hirself')}</div>`;
  return `<div class="character-language-fields" data-language-code="${code}">${html}<p class="character-language-preview" data-language-preview="${code}">${esc(languagePreview(c,code))}</p></div>`;
 };
 return `<fieldset class="character-language-settings"><legend>${t('대명사·자칭','Pronouns & self-reference','代名詞・一人称')}</legend><small>${t('성별과 별개예요. 목록에서 고르거나 직접 입력하세요.','Independent of gender. Choose a suggestion or type your own.','性別とは別の設定です。候補から選ぶか自由に入力できます。')}</small>${form(lang)}<details><summary>${t('다른 언어에서의 표현','Expressions in other languages','ほかの言語での表現')}</summary>${['ko','en','ja'].filter(l=>l!==lang).map(l=>`<section><h4>${({ko:'한국어',en:'English',ja:'日本語'})[l]}</h4>${form(l)}</section>`).join('')}</details></fieldset>`;
}
export function bindCharacterLanguageFields(root,character){
 root.querySelectorAll('.character-language-settings').forEach(box=>{
  if(box.dataset.bound)return;box.dataset.bound='true';
  const refresh=()=>{const draft={...character};box.querySelectorAll('[data-field]').forEach(el=>{if(LANGUAGE_FIELDS.includes(el.dataset.field))draft[el.dataset.field]=el.value});box.querySelector('[data-language-custom]').hidden=draft.pronounEn!=='custom';box.querySelector('[data-language-reflexive]').hidden=!['custom','they'].includes(draft.pronounEn);box.querySelectorAll('[data-language-preview]').forEach(el=>el.textContent=languagePreview(draft,el.dataset.languagePreview));};
  box.addEventListener('input',refresh);box.addEventListener('change',refresh);refresh();
 });
}
