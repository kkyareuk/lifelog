// Applies only to authored character dialogue, never player-written letters.
export function softenCharacterSpeech(value,style=''){
 let text=String(value??'').replace(/씨발|시발|염병할?|지랄|좆같[아은]?|개새끼|그 새끼/g,'@#$%').replace(/\bfuck(?:ing|ed)?\b|\bshit\b/gi,'@#$%').replace(/クソ|くそ/g,'@#$%');
 if(style.startsWith('거칠고 상스러운 말투'))text=text.replace(/젠장|망할|\bdamn\b|\bdarn\b|\bheck\b|ちぇっ|ちっ/gi,'@#$%');
 return text;
}
