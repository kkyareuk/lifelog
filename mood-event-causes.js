// Match observed emotional events, not arbitrary syllables inside neutral words.
// Copy is independent from the activity log and shared by every mood consumer.
const CAUSES=[
 ["betrayal","angry",/배신|협박|모욕|무시당|betray\w*|threaten\w*|insult\w*|侮辱|裏切|脅迫/i,["배신·모욕 등으로 신뢰나 존중이 손상됨","Betrayal or disrespect has damaged their trust","裏切りや侮辱で信頼や尊重が損なわれた"]],
 ["conflict","angry",/싸우|싸움|다투|다툼|언쟁|갈등|의견.{0,5}충돌|\b(?:fight\w*|argu(?:e|ed|ing|ment)|conflict\w*)\b|喧嘩|口論|衝突/i,["다툼이나 의견 충돌로 긴장이 높아짐","An argument or disagreement has raised tension","口論や意見の衝突で緊張が高まった"]],
 ["irritation","angry",/짜증|불쾌|화가\s*(?:나(?:서|고|는|요|며|면|\b)|났|난(?:\s|다|뒤)|치밀|솟|풀리지)|분노(?:를|가|로|함)|\b(?:angry|irritat\w*|upset)\b|腹が立|いら立|怒って|不快/i,["불쾌감이나 짜증이 남아 마음이 진정되지 않음","Lingering irritation makes it hard to settle down","不快感やいら立ちが残り、気持ちが落ち着かない"]],
 ["rejection","sad",/거절(?:당|을 받)|외면당|\breject(?:ed|ion)\b|拒絶された|断られた/i,["거절당한 일이 마음에 상처로 남음","Being rejected has left them hurt","断られたことが心に傷として残っている"]],
 ["failure","sad",/실패|실망|\bfail(?:ed|ure)\b|disappoint\w*|失敗|がっかり/i,["기대했던 결과를 얻지 못해 실망함","Falling short of an expected outcome is disappointing","期待した結果を得られず、がっかりしている"]],
 ["loss","sad",/상실|잃어버|이별|\b(?:loss|bereavement)\b|喪失|別れ/i,["소중한 것을 잃거나 이별한 슬픔이 남음","Loss or parting has left lingering sadness","大切なものを失ったり別れたりした悲しみが残っている"]],
 ["sadness","sad",/울었|슬프|속상|외로워|\b(?:sad|cried|crying|lonely)\b|泣いた|悲し|寂しい/i,["슬픔이나 외로움으로 마음이 가라앉음","Sadness or loneliness is weighing on them","悲しさや寂しさで気持ちが沈んでいる"]],
 ["praise","positive",/칭찬|\bprais\w*\b|褒められ|褒めてもら/i,["칭찬과 인정을 받아 기쁨을 느낌","Praise and recognition bring joy","褒められ、認めてもらえたことが嬉しい"]],
 ["success","positive",/성공|해냈|완성|\bsuccess\w*\b|成功|完成/i,["목표를 이루거나 일을 마쳐 성취감을 느낌","Reaching a goal or finishing a task feels rewarding","目標を達成したり仕事を終えたりして達成感を感じる"]],
 ["gift","positive",/선물(?:을|이|받|로)|\bgift\w*\b|贈り物|プレゼント/i,["선물에 담긴 호의를 느껴 기분이 좋아짐","The kindness behind a gift lifts their spirits","贈り物に込められた好意を感じ、嬉しくなった"]],
 ["enjoyment","positive",/맛있|즐거|웃었|웃고|웃으며|데이트|\b(?:delicious|enjoy\w*|laugh\w*)\b|おいし|楽しい|笑って|笑った|デート/i,["즐거운 경험이나 웃음이 기분을 밝게 함","An enjoyable experience or laughter lifts their mood","楽しい体験や笑いで気持ちが明るくなった"]]
];
const negated={
 angry:/갈등.{0,12}(?:없|않|풀|해결)|다투지|싸우지|짜증.{0,10}(?:없|않)|화가.{0,10}(?:않|풀렸)|불쾌.{0,10}(?:않|없)|(?:no|without)\s+(?:conflict|arguing|fighting)|not\s+(?:angry|upset|irritated)|喧嘩せず|争わず|怒っていない|不快.{0,6}ない/i,
 sad:/실패.{0,10}(?:않|없)|슬프지|속상하지|울지|거절하지|not\s+(?:sad|lonely)|悲しくない|寂しくない/i,
 positive:/즐겁지|맛있지|웃지|성공하지|칭찬.{0,10}(?:못|않)|not\s+(?:happy|enjoyable|delicious)|楽しくない|おいしくない/i
};
export function observedMoodEvents(copy){
 const sentences=String(copy||"").split(/[.!?。！？\n]+/).filter(Boolean),result={};
 for(const [id,kind,pattern,description] of CAUSES){
  if(!result[kind]&&sentences.some(sentence=>pattern.test(sentence)&&!negated[kind].test(sentence)))result[kind]={id,description};
 }
 return result;
}
