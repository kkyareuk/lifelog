// Shared command definitions: local and multiplayer use the same activity IDs.
export const SOCIAL_ACTIVITIES={
 taunt:{labels:['비아냥대기','Taunt','皮肉を言う'],lines:['상대의 말을 비꼬며 신경을 건드리고 있어요.','They make a sarcastic remark to provoke the other person.','皮肉を言って相手の神経を逆なでしています。'],negative:true},
 insult:{labels:['모욕하기','Insult','侮辱する'],lines:['날 선 말로 상대를 깎아내리며 분위기가 험악해졌어요.','A cutting insult makes the atmosphere tense.','刺々しい言葉で相手をけなし、険悪な雰囲気になりました。'],negative:true},
 fight:{labels:['싸우기','Fight','けんかする'],lines:['서로 물러서지 않고 거칠게 맞서고 있어요.','Neither backs down as they confront each other.','互いに引かず、激しく対立しています。'],negative:true},
 tea:{labels:['같이 차 마시기','Have tea','一緒にお茶を飲む'],lines:['찻잔을 앞에 두고 잠시 쉬고 있어요.','They take a break over cups of tea.','お茶を前に、ひと息ついています。']},
 drinks:{labels:['같이 술 마시기','Have drinks','一緒にお酒を飲む'],lines:['술잔을 앞에 두고 이야기를 나누고 있어요.','They talk over drinks.','お酒を前に話しています。']},
 cook_together:{labels:['같이 요리하기','Cook together','一緒に料理する'],lines:['재료 손질과 조리를 나누어 맡고 있어요.','They share the preparation and cooking.','材料の下ごしらえと調理を分担しています。']},
 argue:{labels:['말다툼하기','Argue','口論する'],lines:['의견이 맞지 않아 서로 불만을 드러내고 있어요.','They disagree and express their frustration.','意見が合わず、互いに不満を伝えています。'],negative:true},
 debate:{labels:['토론하기','Debate','議論する'],lines:['서로 다른 주장과 그 이유를 차례로 이야기하고 있어요.','They take turns explaining their arguments and reasons.','異なる主張と理由を順番に話しています。']},
 compete:{labels:['승부 겨루기','Compete','勝負する'],lines:['함께 정한 규칙에 따라 실력을 겨루고 있어요.','They compete under rules they agreed on together.','一緒に決めたルールで腕を競っています。']},
 dine:{labels:['같이 식사하기','Share a meal','一緒に食事する'],lines:['같은 식탁에서 식사하며 시간을 보내고 있어요.','They spend time eating at the same table.','同じ食卓で食事の時間を過ごしています。']},
 play_together:{labels:['같이 게임하기','Play together','一緒にゲームする'],lines:['같은 게임을 하며 차례를 주고받고 있어요.','They take turns playing the same game.','同じゲームで交代しながら遊んでいます。']},
 study_together:{labels:['같이 공부하기','Study together','一緒に勉強する'],lines:['모르는 부분을 확인하며 각자 공부를 이어 가고 있어요.','They check unfamiliar material and continue studying.','分からない所を確認しながら、それぞれ勉強を続けています。']},
 read_together:{labels:['나란히 독서하기','Read side by side','並んで読書する'],lines:['각자의 책을 읽으며 조용히 같은 공간에 머물러 있어요.','They quietly share a space while reading their own books.','それぞれの本を読み、静かに同じ場所で過ごしています。']},
 custom_social:{labels:['직접 정한 활동','Custom activity','自由な活動'],lines:['함께 정한 활동을 하고 있어요.','They are doing the activity they chose together.','一緒に決めた活動をしています。']}
};
export function socialActivityCopy(kind,actor,target,topic='',options={}){
 const item=SOCIAL_ACTIVITIES[kind];if(!item)return null;
 if(['taunt','insult'].includes(kind)&&options.initiatorId&&actor.id!==options.initiatorId){
  const calm=/느긋|무심|차분/.test([actor.conflictStyle,actor.energyRhythm,...(actor.personalityTypes||[])].join(' '));
  const lines=calm?['불쾌한 말을 듣고도 대꾸하지 않고 흘려넘겼어요.','They let the unpleasant remark pass without responding.','不快な言葉にも返事をせず、受け流しました。']:['불쾌한 표정으로 그런 말은 하지 말라며 맞섰어요.','They look upset and tell the other person to stop.','不快な表情で、そんなことを言わないよう言い返しました。'];
  return Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:[`${target.name}의 날 선 말에 반응하는 중`,`Responding to ${target.name}’s cutting remark`,`${target.name}の刺々しい言葉に反応するところ`][i],desc:lines[i]}]));
 }
 const detail=String(topic).trim().slice(0,120),other=String(target?.name||'');
 const socialFood=['dine','tea','drinks','cook_together'].includes(kind);
 const controlling=c=>/완고|통제/.test([...(c.personalityTypes||[]),c.interference].join(' '))&&!/다정/.test((c.personalityTypes||[]).join(' '));
 const critic=controlling(actor)?actor:controlling(target)?target:null;
 const older=critic?.ageGroup==='노인';
 const extra=socialFood&&critic?[`${critic.name}${older?'은 경험을 내세워 생활 방식까지 훈수를 두고 있어요.':'은 사소한 방식까지 지적하며 자기 뜻대로 하려 해요.'}`,`${critic.name} ${older?'uses their experience to lecture about life.':'criticizes small details and tries to take control.'}`,`${critic.name}は${older?'経験を持ち出して暮らし方に口を出しています。':'細かいやり方を指摘し、自分の思い通りにしようとしています。'}`]:['','',''];
 const payment=options.payment||'split',payer=options.payerName||actor?.name||'';
 const bill=!['dine','tea','drinks'].includes(kind)?['','','']:payment==='treat'?[`${payer}이 계산을 맡기로 했어요.`,`${payer} offered to pay.`,`${payer}が支払いを引き受けました。`]:payment==='request'?[`${payer}에게 사 달라고 부탁했어요. 아직 동의한 것은 아니에요.`,`${payer} was asked to pay; they have not agreed yet.`,`${payer}におごってほしいと頼みました。まだ同意はしていません。`]:['각자 계산하기로 했어요.','They agreed to pay separately.','各自で支払うことにしました。'];
 return Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:[`${other}와 ${item.labels[0].replace(/하기$/,'하는 중')}`,`${item.labels[1]} · ${other}`,`${other}と${item.labels[2]}`][i],desc:[item.lines[i],extra[i],bill[i]].filter(Boolean).join(' ')+(detail?[' 함께 정한 주제: ',' Chosen topic: ',' テーマ：'][i]+detail:'')}]))
}

export const ROMANTIC_ACTIVITIES=['kiss','kiss_cautious','kiss_reconcile','affection'];
export function hasRomanticRelationship(relationships,a,b){return Object.values(relationships||{}).some(r=>r&&r.temporalStatus!=='past'&&((r.a===a&&r.b===b)||(r.a===b&&r.b===a))&&['연인','부부','약혼','약혼자','커플','폴리 관계'].includes(r.type));}

export const SOCIAL_SECTIONS=[
 {id:'conversation',labels:['대화·교류','Conversation','会話・交流'],actions:['talk','debate','gossip','custom_social']},
 {id:'together',labels:['함께하기','Together','一緒に過ごす'],actions:['hangout','comfort','compliment','dine','tea','drinks','cook_together','play_together','study_together','read_together','compete']},
 {id:'conflict',labels:['갈등','Conflict','対立'],actions:['taunt','insult','argue','fight']},
 {id:'romance',labels:['로맨스','Romance','ロマンス'],actions:['hug','handhold','lean','kiss','kiss_cautious','kiss_reconcile','affection']}
];
