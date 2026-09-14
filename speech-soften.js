// Applies only to authored character dialogue, never player-written letters.
export function softenCharacterSpeech(value){return String(value??'').replace(/씨발|시발|염병할?|지랄/g,'젠장').replace(/좆같[아은]?/g,'망할').replace(/개새끼|그 새끼/g,'그 녀석').replace(/\bfuck(?:ing|ed)?\b/gi,'darn').replace(/\bshit\b/gi,'heck').replace(/クソ|くそ/g,'ちぇっ')}
