// Describe observed eating habits without inventing a dish or its ingredients.
const habits=[
 [/천천히/,['한입씩 오래 씹는 중','한입을 오래 씹으며 식감이 달라지는 것을 느끼고 있어요.','Savoring each bite','Chewing each bite slowly and noticing how its texture changes.','一口ずつ味わっているところ','一口ずつゆっくり噛み、食感の変化を感じています。']],
 [/빠르게/,['부지런히 식사하는 중','한입을 삼키면 곧바로 다음 한입을 준비하며 빠르게 먹고 있어요.','Eating briskly','Preparing the next bite as soon as the last is swallowed.','手早く食べているところ','一口飲み込むとすぐ次の一口を用意し、手早く食べています。']],
 [/맨 마지막/,['좋아하는 한입을 남겨 두는 중','좋아하는 부분은 마지막에 먹으려고 접시 한쪽에 남겨 두고 있어요.','Saving the best bite','Keeping the favorite part to one side to enjoy at the end.','好物を最後に残しているところ','好きな部分を最後に楽しもうと、皿の端に残しています。']],
 [/맨 먼저/,['좋아하는 것부터 먹는 중','마음에 드는 부분부터 골라 첫입을 즐기고 있어요.','Starting with a favorite','Picking out the favorite part to enjoy first.','好物から食べているところ','好きな部分から選んで、最初の一口を楽しんでいます。']],
 [/섞지 않고/,['음식을 따로 맛보는 중','음식이 서로 섞이지 않게 나누어 각각의 맛을 보고 있어요.','Tasting foods separately','Keeping the foods apart to taste each one on its own.','別々に味わっているところ','料理が混ざらないように分け、それぞれの味を楽しんでいます。']],
 [/번갈아/,['반찬을 번갈아 먹는 중','반찬을 한입씩 번갈아 먹으며 입안의 맛을 바꾸고 있어요.','Alternating bites','Alternating between side dishes to change the flavor of each bite.','おかずを交互に食べているところ','おかずを一口ずつ交互に食べ、口の中の味を変えています。']],
 [/소스|후추/,['간을 맞추며 먹는 중','먼저 한입 맛을 본 뒤 소스나 후추를 조금 더하며 간을 맞추고 있어요.','Adjusting the seasoning','Tasting a bite before adding a little sauce or pepper.','味を調えながら食べているところ','まず一口味を確かめ、ソースや胡椒を少し足して味を調えています。']],
 [/간을 바꾸지/,['원래의 간을 즐기는 중','양념을 더하지 않고 나온 그대로의 간과 향을 느끼며 먹고 있어요.','Enjoying the original seasoning','Eating without extra seasoning and taking in the original flavor and aroma.','そのままの味を楽しんでいるところ','調味料を足さず、出されたままの味と香りを楽しんでいます。']],
 [/한입 크기/,['한입 크기로 나누는 중','음식을 먹기 좋은 크기로 잘라 한 조각씩 입에 넣고 있어요.','Preparing bite-size pieces','Cutting the food into manageable pieces and eating them one at a time.','一口大に分けているところ','食べやすい大きさに切り、一切れずつ口に運んでいます。']],
 [/냄새/,['향부터 음미하는 중','먹기 전에 가까이에서 향을 맡고 천천히 첫입을 맛보고 있어요.','Taking in the aroma','Smelling the food up close before slowly tasting the first bite.','香りから楽しんでいるところ','食べる前に近くで香りを確かめ、ゆっくり最初の一口を味わっています。']],
 [/조용/,['조용히 맛을 음미하는 중','식기가 부딪히지 않게 조심하며 한입씩 조용히 먹고 있어요.','Enjoying a quiet meal','Eating quietly and taking care not to clatter the utensils.','静かに味わっているところ','食器を鳴らさないよう気をつけながら、一口ずつ静かに食べています。']]
];
const neutral=[
 ['한입의 맛을 살피는 중','첫입을 천천히 맛보고 간과 식감을 확인하며 식사를 이어 가고 있어요.','Tasting the first bite','Tasting the first bite slowly, checking the seasoning and texture, then continuing the meal.','一口の味を確かめているところ','最初の一口をゆっくり味わい、味付けと食感を確かめながら食べています。'],
 ['잠시 식사에 집중하는 중','식기를 고쳐 쥐고 한입씩 맛보며 배를 채우고 있어요.','Focusing on the meal','Adjusting the utensils and enjoying the meal one bite at a time.','食事に集中しているところ','食器を持ち直し、一口ずつ味わいながらお腹を満たしています。']
];
export function mealObservation(character,seed,language='ko'){
 const index=({ko:0,en:2,ja:4})[language]||0;
 const pool=habits.filter(([pattern])=>(character.eatingHabits||[]).some(h=>pattern.test(h))).map(([,copy])=>copy);
 let hash=0;for(const letter of `${character.id}:${seed}`)hash=(Math.imul(hash,31)+letter.charCodeAt(0))>>>0;
 const copy=(pool.length?pool:neutral)[hash%(pool.length||neutral.length)];
 const preferences=(character.foodPreferences||[]).join(' '),taste=Number(character.spiceTolerance)<=1?
 ['매운맛에 약해 자극이 강하지 않은지 조금씩 맛보며 확인하고 있어요.','Sensitive to spicy food, they test small bites to check the heat.','辛い物は苦手なので、刺激が強くないか少しずつ確かめています。']:
 /바삭|튀김/.test(preferences)?['바삭한 식감을 좋아해 한입마다 씹히는 느낌에 신경 쓰고 있어요.','Fond of crisp textures, they pay attention to how each bite feels.','歯ごたえのある食感が好きで、一口ごとの噛み心地を確かめています。']:
 Number(character.sweetPreference)>=4?['단맛을 좋아해서 양념에 달큰한 맛이 있는지도 살피고 있어요.','With a sweet tooth, they check for sweetness in the seasoning.','甘い味が好きで、味付けに甘みがあるかも確かめています。']:null;
 const detail=taste?.[({ko:0,en:1,ja:2})[language]||0]||'';
 return {title:copy[index],desc:copy[index+1]+(detail?' '+detail:'')};
}
