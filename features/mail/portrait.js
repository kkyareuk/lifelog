// Account mail, local contacts and shared residents use different envelopes.
// Skip unresolved media references so a valid profile photo can still be used.
export function usablePortrait(...sources){return sources.find(v=>typeof v==='string'&&v.trim()&&!v.startsWith('local-media://'))||''}
export function characterPortrait(character={},fallback=''){
 character ||= {};
 let profile={};try{profile=typeof character.profileJson==='string'?JSON.parse(character.profileJson):character.profileJson||{}}catch{}
 return usablePortrait(character.icon,profile.icon,character.photo,profile.photo,fallback);
}
export function bindPortraitFallbacks(root,characters){
 for(const image of root.querySelectorAll('.notification-character-option img,.mail-row img,.mail-letter .mail-watermark')){
  if(image.dataset.portraitFallbackBound)continue;
  image.dataset.portraitFallbackBound='1';
  const original=image.getAttribute('src');
  const person=characters.find(c=>characterPortrait(c)===original);
  const alternative=person&&usablePortrait(person.photo);
  if(alternative&&alternative!==original){image.addEventListener('error',()=>{image.src=alternative},{once:true});if(image.complete&&!image.naturalWidth)image.src=alternative;}
 }
}
