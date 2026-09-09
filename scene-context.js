export function playfulPersonality(c){
 const humor=String(c?.humorStyle||'');
 if(['장난을 거의 하지 않음','건조한 농담만 함'].includes(humor))return false;
 if(humor)return /가끔 장난|장난을 즐김|유머로 분위기를 이끎/.test(humor);
 return (c?.personalityTypes||[]).includes('장난기 많음');
}
export function oneSidedJoke(first,second,variant=0,language='ko'){
 if(playfulPersonality(first)===playfulPersonality(second))return null;
 const joker=playfulPersonality(first)?first:second,receiver=joker===first?second:first;
 const profile=[receiver.conflictStyle,...(receiver.personalityTypes||[])].join(' ');
 const irritated=/바로 따짐|정면|즉시|감정적이고 충동적/.test(profile)&&variant%2===0;
 const relaxed=/느긋|여유|흘려|넘김|피함|차분/.test([joker.conflictStyle,joker.diligence,joker.activityTempo,...(joker.personalityTypes||[])].join(' '));
 const choose=(ko,en,ja)=>language==='en'?en:language==='ja'?ja:ko;
 const response=choose(irritated?`${receiver.name}은 ${joker.name}의 장난에 눈살을 찌푸리며 그만하라고 짜증 섞인 목소리로 말했어요.`:`${receiver.name}은 ${joker.name}의 장난에 대꾸하지 않고 하던 일로 시선을 돌렸어요.`,irritated?`${receiver.name} frowned at ${joker.name}'s joke and irritably asked them to stop.`:`${receiver.name} ignored ${joker.name}'s joke and returned their attention to their task.`,irritated?`${receiver.name}は${joker.name}の冗談に眉をひそめ、苛立った声でやめるように言いました。`:`${receiver.name}は${joker.name}の冗談に答えず、作業に視線を戻しました。`);
 const action=choose(`${joker.name}은 ${receiver.name}에게 가벼운 장난을 건넸어요. ${relaxed?'상대의 무뚝뚝한 반응을 여유롭게 넘기고 더 놀리지 않은 채 화제를 바꿨어요.':'상대가 받아주지 않자 장난을 멈추고 잠시 말을 줄였어요.'}`,`${joker.name} made a light joke to ${receiver.name}. ${relaxed?'They took the curt response in stride and changed the subject without teasing further.':'When it was not welcomed, they stopped joking and quietened down.'}`,`${joker.name}は${receiver.name}に軽い冗談を言いました。${relaxed?'そっけない反応をゆったり受け流し、それ以上からかわず話題を変えました。':'受け入れられないと分かると、冗談をやめて言葉を控えました。'}`);
 const receiverTitle=choose(`${joker.name}의 장난을 ${irritated?'못마땅해하는':'무시하는'} 중`,`${irritated?'Annoyed by':'Ignoring'} ${joker.name}'s joke`,`${joker.name}の冗談を${irritated?'嫌がる':'無視する'}ところ`),jokerTitle=choose(`${receiver.name}의 반응을 보고 화제를 바꾸는 중`,`Changing the subject after ${receiver.name}'s reaction`,`${receiver.name}の反応を見て話題を変えるところ`);
 return {title:first===joker?jokerTitle:receiverTitle,firstTitle:first===joker?jokerTitle:receiverTitle,secondTitle:second===joker?jokerTitle:receiverTitle,first:first===joker?action:response,second:second===joker?action:response};
}
export function conflictEvidence(value){
 return String(value||'').replace(/(?:싸우|다투)지\s*(?:않(?:고|았|는|아|음)?|말[^\s,.!?]*)?|(?:싸움|다툼|갈등)(?:을|이|은|도)?\s*(?:피하|피했|없이|없었|없어|없는)|(?:without|not|never)\s+(?:fighting|arguing|angry)|喧嘩せず|争わず|怒っていない/gi,'');
}
export function dailyInteractionLine(a,b,place,view={},variant=0,language='ko',relation={}){
 const choose=(ko,en,ja)=>language==='en'?en:language==='ja'?ja:ko;
 const traits=JSON.stringify([a.personalityTypes,a.characterTraits,a.traitExpressions,a.speechStyle,a.humorStyle,a.emotionalExpression]);
 const quiet=Number(a.socialEnergy)<=2||/내향|과묵|조용|무뚝뚝|말수가 적|IST|INT/.test(traits),playful=playfulPersonality(a);
 const wary=/두려|경계|불편|싫|신뢰하지/.test(`${view.overall||''} ${view.comfort||''} ${view.trust||''} ${view.fear||''}`);
 const name=a.name,other=b.name,type=place?.type||'';
 if(wary)return choose(`${name}은 ${other}에게 필요한 말만 전하고 한 사람 정도의 간격을 두었어요.`,`${name} exchanged only the necessary words with ${other}, leaving some space between them.`,`${name}は${other}に必要なことを伝え、少し間隔を空けました。`);
 if(variant%4===2&&relation?.temporalStatus!=='past'&&/보호자|부모/.test(a.id===relation?.a?relation.sourceRole||relation.parentRole||'':relation.targetRole||''))return choose(`${name}은 ${other}에게 필요한 것이 있는지 묻고 대답을 기다렸어요.`,`${name} asked whether ${other} needed anything and waited for their answer.`,`${name}は${other}に必要なものがあるか尋ね、返事を待ちました。`);
 const interests=Array.isArray(a.interests)?a.interests.filter(x=>typeof x==='string'&&Array.isArray(b.interests)&&b.interests.includes(x)):[];
 if(interests.length&&variant%3===0){const interest=interests[variant%interests.length];return choose(`${name}은 둘 다 관심 있는 ${interest} 이야기를 꺼내고 ${other}의 생각을 물었어요.`,`${name} brought up their shared interest in ${interest} and asked what ${other} thought.`,`${name}は共通の関心事である${interest}を話題にして、${other}の考えを聞きました。`)}
 if(/도서관/.test(type))return choose(quiet?`${name}은 읽던 부분을 ${other}에게 보여 주고 짧게 감상을 나눴어요.`:`${name}은 목소리를 낮춰 ${other}와 읽던 내용에 관해 이야기했어요.`,`${name} quietly discussed what they were reading with ${other}.`,`${name}は声を落として、読んでいた内容を${other}と話しました。`);
 if(/공원/.test(type))return choose(variant%2?`${name}은 ${other}의 걸음에 보조를 맞추며 주변 풍경을 둘러봤어요.`:`${name}은 길이 갈라지는 곳에서 ${other}와 걸어갈 방향을 골랐어요.`,variant%2?`${name} matched ${other}'s pace and looked around the park.`:`${name} and ${other} chose which path to take at the fork.`,variant%2?`${name}は${other}の歩調に合わせて、公園の景色を眺めました。`:`${name}は分かれ道で${other}と進む方向を選びました。`);
 if(/카페|음식점/.test(type))return choose(quiet?`${name}은 메뉴를 살펴보다 ${other}가 고른 것을 묻고 자신의 선택을 알려 줬어요.`:`${name}은 메뉴에서 눈에 띈 것을 가리키며 ${other}에게 무엇이 좋은지 물었어요.`,`${name} looked over the menu with ${other} and compared their choices.`,`${name}は${other}とメニューを眺め、それぞれ気になるものを話しました。`);
 const pool=quiet?[
  choose(`${name}은 ${other}의 이야기를 듣다가 궁금한 부분만 짧게 물었어요.`,`${name} listened to ${other}, asking a brief question when something caught their interest.`,`${name}は${other}の話を聞き、気になったところだけ短く尋ねました。`),
  choose(`${name}은 ${other}의 옆에서 각자 하던 일을 이어 가다가 가끔 말을 건넸어요.`,`${name} continued their own task beside ${other}, exchanging a few words now and then.`,`${name}は${other}の隣で自分の作業を続けながら、ときどき言葉を交わしました。`)
 ]:playful?[
  choose(`${name}은 방금 들은 이야기에서 재미있는 부분을 짚으며 ${other}에게 농담을 건넸어요.`,`${name} picked out a funny detail in the conversation and joked with ${other}.`,`${name}は今の話の面白いところを拾って、${other}に冗談を返しました。`),
  choose(`${name}은 자신의 이야기를 마친 뒤 ${other}에게도 비슷한 일이 있었는지 물었어요.`,`${name} finished their story and asked whether ${other} had experienced anything similar.`,`${name}は自分の話を終えると、${other}にも似た経験があるか尋ねました。`)
 ]:[
  choose(`${name}은 ${other}의 의견을 듣고 자신의 생각을 덧붙였어요.`,`${name} listened to ${other}'s opinion and added their own thoughts.`,`${name}は${other}の意見を聞き、自分の考えを付け加えました。`),
  choose(`${name}은 ${other}와 하던 이야기를 마무리하고 다음에 할 일을 확인했어요.`,`${name} wrapped up the conversation with ${other} and checked what they would do next.`,`${name}は${other}との話をまとめ、次にすることを確認しました。`)
 ];
 return pool[Math.abs(variant)%pool.length];
}
