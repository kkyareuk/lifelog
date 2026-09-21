import {recentNarrativeEntries,pickNarrative} from './narrative-selection.js';
const groups=[
 [
  "mystery",
  "추리|범죄|미스터리|mystery|crime|ミステリ|推理|犯罪",
  [
   [
    "범인이 드러나기 전에 독자에게 주는 단서",
    "clues given to the reader before the culprit is revealed",
    "犯人が明かされる前に読者に示す手がかり"
   ],
   [
    "같은 사건을 서로 다르게 말하는 증언",
    "testimonies that describe the same event differently",
    "同じ事件を違って語る証言"
   ],
   [
    "반전을 알고 다시 보게 되는 첫 장면",
    "the opening scene revisited after the twist",
    "どんでん返しを知って見返す最初の場面"
   ]
  ]
 ],
 [
  "music",
  "음악|재즈|록|팝|클래식|발라드|music|jazz|rock|classical|音楽|ジャズ",
  [
   [
    "같은 선율을 다른 악기가 이어받는 순간",
    "the moment another instrument takes over the melody",
    "同じ旋律を別の楽器が引き継ぐ瞬間"
   ],
   [
    "후렴에 들어가기 직전의 짧은 쉼",
    "the brief pause just before the chorus",
    "サビに入る直前の短い間"
   ],
   [
    "마지막 음을 길게 남기는 끝맺음",
    "an ending that lets the final note linger",
    "最後の音を長く残す終わり方"
   ]
  ]
 ],
 [
  "story",
  "청춘|성장|학원|로맨스|연애|사랑|youth|romance|青春|恋愛",
  [
   [
    "고백보다 먼저 드러나는 작은 행동",
    "small gestures that come before a confession",
    "告白より先に表れる小さな行動"
   ],
   [
    "오해를 풀 기회를 놓치는 장면",
    "a scene where a chance to clear up a misunderstanding passes",
    "誤解を解く機会を逃す場面"
   ],
   [
    "처음과 마지막에 달라진 같은 대사",
    "the same line changing meaning from beginning to end",
    "最初と最後で意味が変わる同じ台詞"
   ]
  ]
 ],
 [
  "fantasy",
  "판타지|SF|공상|마법|fantasy|science fiction|ファンタジー|魔法",
  [
   [
    "특별한 힘을 쓸 때 치러야 하는 대가",
    "the price of using a special power",
    "特別な力を使うときに払う代償"
   ],
   [
    "낯선 세계에서도 이어지는 일상의 규칙",
    "everyday rules that persist in an unfamiliar world",
    "知らない世界でも続く日常の決まり"
   ],
   [
    "능력만으로 해결할 수 없는 선택",
    "a choice that powers alone cannot resolve",
    "能力だけでは解決できない選択"
   ]
  ]
 ],
 [
  "game",
  "게임|보드게임|game|ゲーム",
  [
   [
    "안전한 수와 위험을 감수하는 수 사이의 선택",
    "choosing between a safe move and a risky one",
    "安全な手と危険を承知の手の選び方"
   ],
   [
    "초반에 아껴 둔 자원을 쓰는 시점",
    "when to spend resources saved early on",
    "序盤に取っておいた資源を使う時機"
   ],
   [
    "한 번 실패한 뒤 바꾸는 진행 순서",
    "changing the sequence after a failed attempt",
    "一度失敗した後で変える進め方"
   ]
  ]
 ],
 [
  "food",
  "요리|베이킹|음식|식사|food|cook|meal|料理|食事",
  [
   [
    "같은 재료를 굽거나 삶았을 때의 식감",
    "how baking and boiling change the same ingredient’s texture",
    "同じ材料を焼くか煮るかで変わる食感"
   ],
   [
    "양념을 넣는 순서에 따른 차이",
    "the difference made by the order of seasoning",
    "調味料を入れる順番による違い"
   ],
   [
    "따뜻할 때와 식은 뒤 달라지는 맛",
    "how a dish tastes warm compared with cooled",
    "温かいときと冷めた後で変わる味"
   ]
  ]
 ]
];
export function conversationDetail(topic,speaker,listener,{seed='',day='',minute=Infinity}={}){
 const group=groups.find(([,pattern])=>new RegExp(pattern,'i').test(topic));
 if(!group)return null;
 const pool=group[2].map((text,i)=>({id:group[0]+':'+i,text,counter:group[2][(i+1)%group[2].length]}));
 const recent=[...recentNarrativeEntries(speaker,day,minute,5),...recentNarrativeEntries(listener,day,minute,5)];
 return pickNarrative(pool,recent,seed+':'+speaker.id+':'+listener.id,x=>x.id,(entry,item)=>item.text.some(text=>[entry.desc,entry.baseDesc].some(value=>typeof value==='string'&&value.includes(text))));
}
