// Authored, deterministic scenes. Free-form biographies never become executable rules.
const line=(ko,en,ja)=>({ko,en,ja});
const roles={royal:line('왕족','Royal','王族'),noble:line('귀족','Noble','貴族'),knight:line('기사','Knight','騎士'),official:line('관료','Official','官僚'),mage:line('궁정 마법사','Court mage','宮廷魔術師'),attendant:line('시종','Attendant','侍従')};
const factions={crown:line('왕실파','Royalists','王室派'),reform:line('개혁파','Reformists','改革派'),neutral:line('중립','Independent','中立')};
const traits={courtesy:line('예의를 중시함','Values courtesy','礼儀を重んじる'),honesty:line('솔직함을 좋아함','Values honesty','率直さを好む'),warmth:line('다정함을 좋아함','Values warmth','優しさを好む'),privacy:line('혼자만의 여유가 필요함','Needs personal space','一人の時間が必要')};
module.exports={roles,factions,traits};
