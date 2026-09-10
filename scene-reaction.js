// One motion vocabulary shared by discovery cards and in-game character scenes.
export const REACTION_MOTIONS=['wave','bounce','ponder','stretch','surprise','sway','blush'];
export function sceneReaction(entry={},tone=''){
 const text=[tone,entry.title,entry.desc,entry.kind].join(' ');
 if(/sleep|수면|자는 중|잠을 자|眠/.test(text))return '';
 if(/shock|놀라|깜짝|당황|surpris|驚/.test(text))return 'surprise';
 if(/romantic|crush|붉히|수줍|설레|blush|照れ/.test(text))return 'blush';
 if(/playful|웃|농담|장난|laugh|冗談/.test(text))return 'bounce';
 if(/인사|손을 흔|greet|挨拶/.test(text))return 'wave';
 if(/스트레칭|기지개|stretch|伸び/.test(text))return 'stretch';
 if(/음악|흥얼|리듬|music|音楽/.test(text))return 'sway';
 if(/생각|고민|살펴|ponder|考え/.test(text))return 'ponder';
 return '';
}
