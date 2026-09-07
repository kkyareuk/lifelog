// Only explicit dictionary values become observations; do not infer health effects.
const copy={
 cold:["차가운 잔을 쥐고 시원하게 한 모금 마셨어요.","They held the cold glass and took a refreshing sip.","冷たいグラスを持ち、ひんやりした一口を飲みました。"],
 warm:["따뜻한 잔을 감싸 쥐고 천천히 마셨어요.","They cupped the warm drink and sipped slowly.","温かいカップを包むように持ち、ゆっくり飲みました。"],
 room:["상온으로 준비된 음료를 한 모금 마셨어요.","They took a sip of the drink served at room temperature.","常温で用意された飲み物を一口飲みました。"],
 sweet:["진한 단맛을 느끼며 조금씩 마셨어요.","They took small sips, noticing the pronounced sweetness.","しっかりした甘さを感じながら、少しずつ飲みました。"],
 tooSweet:["평소 좋아하는 것보다 달아서 한 모금씩 천천히 마셨어요.","It was sweeter than their usual preference, so they sipped slowly.","いつもの好みより甘く、一口ずつゆっくり飲みました。"],
 lightSweet:["은은한 단맛을 느끼며 잔을 다시 들었어요.","They lifted the glass again, noticing its gentle sweetness.","ほのかな甘さを感じ、もう一度グラスを持ち上げました。"],
 sour:["톡 쏘는 산미를 느끼고 잠시 맛을 음미했어요.","They paused to savor its sharp, tangy flavor.","はっきりした酸味を感じ、少しの間味わいました。"],
 lightSour:["살짝 감도는 산미를 느끼며 마셨어요.","They noticed a light tang as they drank.","ほんのりした酸味を感じながら飲みました。"],
 fizzy:["강한 탄산이 톡톡 터져 작은 모금으로 나누어 마셨어요.","The strong fizz bubbled up, so they drank in small sips.","強い炭酸がはじけるので、少しずつ飲みました。"],
 lightFizz:["잔에 올라오는 작은 탄산 기포를 바라보며 마셨어요.","They watched the small bubbles rise while sipping.","小さな炭酸の泡が上がるのを見ながら飲みました。"],
 caffeine:["카페인이 들어 있는 메뉴임을 확인하고 잔을 들었어요.","They checked that the drink contained caffeine before lifting it.","カフェイン入りのメニューだと確認してからカップを持ちました。"],
 decaf:["디카페인으로 준비된 메뉴를 확인하고 마셨어요.","They checked that it was prepared as decaf, then took a sip.","デカフェで用意されたメニューを確認し、飲みました。"],
 noCaffeine:["카페인이 없는 음료임을 확인하고 마셨어요.","They checked that the drink was caffeine-free, then took a sip.","カフェインのない飲み物だと確認し、飲みました。"],
 noAlcohol:["무알코올로 준비된 음료를 골라 마셨어요.","They chose and sipped the non-alcoholic drink.","ノンアルコールで用意された飲み物を選んで飲みました。"],
 lowAlcohol:["도수가 낮은 음료임을 확인하고 천천히 맛봤어요.","They checked that the drink was low in alcohol and tasted it slowly.","低アルコールの飲み物だと確認し、ゆっくり味わいました。"],
 highAlcohol:["도수가 높은 음료라 조금씩 나누어 맛봤어요.","They tasted the high-alcohol drink in small sips.","度数の高い飲み物なので、少しずつ味わいました。"]
};
export function drinkExperience(drink,character,seed=0){
 const cues=[],level=k=>Number.isFinite(Number(drink[k]))?Math.max(0,Math.min(5,Number(drink[k]))):0;
 const temp={차갑게:'cold',따뜻하게:'warm',상온:'room'}[drink.temperature];if(temp)cues.push(temp);
 if(level('sweet')>0)cues.push(Number.isFinite(Number(character.sweetPreference))&&level('sweet')>Number(character.sweetPreference)+1?'tooSweet':level('sweet')>=4?'sweet':'lightSweet');
 if(level('acidity')>0)cues.push(level('acidity')>=4?'sour':'lightSour');
 if(level('carbonation')>0)cues.push(level('carbonation')>=4?'fizzy':'lightFizz');
 const caffeine={있음:'caffeine',디카페인:'decaf',없음:'noCaffeine'}[drink.caffeine];if(caffeine)cues.push(caffeine);
 const alcohol={무알코올:'noAlcohol',저도수:'lowAlcohol',고도수:'highAlcohol'}[drink.alcohol];if(alcohol)cues.push(alcohol);
 const start=cues.length?Math.abs(seed)%cues.length:0;
 return {name:String(drink.name||''),cues:cues.length?[cues[start],...(cues.length>1?[cues[(start+1)%cues.length]]:[])]:[]};
}
export function drinkLogCopy(experience,language='ko',companion=''){
 const index=language==='en'?1:language==='ja'?2:0,name=String(experience.name||''),sentences=(experience.cues||[]).filter(key=>copy[key]).slice(0,2).map(key=>copy[key][index]);
 const title=index===1?`Drinking ${name}${companion?` with ${companion}`:''}`:index===2?`${companion?`${companion}と`:''}${name}を飲んでいるところ`:`${companion?`${companion}와 `:''}${name} 마시는 중`;
 const fallback=["음료를 한 모금씩 마시며 잠깐 쉬고 있어요.","They are taking a short break and sipping their drink.","飲み物を少しずつ飲みながら、ひと休みしています。"][index];
 return {title,desc:sentences.join(' ')||fallback};
}
